#!/usr/bin/env node
// Reverse-geocodes every coordinate in japan-nav-routes.geojson via Mapbox V6.
// Snaps each point to the returned address coordinates and saves the address
// name into properties.address for use in the dropdown label.
//
// Usage: MAPBOX_TOKEN=pk.xxx node scripts/cleanse-japan-nav-routes.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROUTES_PATH = path.resolve(__dirname, '..', 'japan-nav-routes.geojson');
const RATE_PER_SEC = 10;     // 600 req/min — conservative to avoid bursting
const LOG_INTERVAL = 100;

const token = process.env.MAPBOX_TOKEN;
if (!token) {
  console.error('Error: MAPBOX_TOKEN env var is required');
  process.exit(1);
}

const geojson = JSON.parse(fs.readFileSync(ROUTES_PATH, 'utf8'));
const features = geojson.features.filter(f => !f.properties.address);
console.log(`Loaded ${geojson.features.length} features, ${features.length} need cleansing`);

// Token bucket: allows at most RATE_PER_SEC requests per second.
// nextAllowed tracks the earliest time the next slot opens.
let nextAllowed = Date.now();
function acquireToken() {
  const now = Date.now();
  nextAllowed = Math.max(nextAllowed, now) + Math.floor(1000 / RATE_PER_SEC);
  const wait = nextAllowed - 1000 / RATE_PER_SEC - now;
  return wait > 0 ? new Promise(r => setTimeout(r, wait)) : Promise.resolve();
}

let completed = 0;
let failed = 0;

async function reverseGeocode(feature) {
  const [lng, lat] = feature.geometry.coordinates;
  const url =
    `https://api.mapbox.com/search/geocode/v6/reverse` +
    `?longitude=${lng}&latitude=${lat}&types=address&language=ja&access_token=${token}`;

  await acquireToken();
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const hit = data.features?.[0];
  if (!hit) throw new Error('No result');

  feature.geometry.coordinates = hit.geometry.coordinates;
  feature.properties.address = hit.properties.name;
}

async function processAll() {
  let active = 0;
  let idx = 0;

  await new Promise(resolve => {
    function next() {
      while (active < RATE_PER_SEC && idx < features.length) {
        const i = idx++;
        active++;
        reverseGeocode(features[i])
          .catch(err => {
            failed++;
            console.warn(`[WARN] feature ${i} (${features[i].geometry.coordinates}): ${err.message}`);
          })
          .finally(() => {
            completed++;
            if (completed % LOG_INTERVAL === 0) {
              console.log(`[${completed}/${features.length}] ${failed} failed so far`);
            }
            active--;
            if (idx < features.length) next();
            else if (active === 0) resolve();
          });
      }
      if (idx >= features.length && active === 0) resolve();
    }
    next();
  });
}

await processAll();

fs.writeFileSync(ROUTES_PATH, JSON.stringify(geojson, null, 2), 'utf8');
console.log(`\nDone. ${completed - failed} updated, ${failed} kept original. Written to ${ROUTES_PATH}`);
const remaining = geojson.features.filter(f => !f.properties.address).length;
if (remaining > 0) console.log(`${remaining} features still missing address — re-run to retry.`);
