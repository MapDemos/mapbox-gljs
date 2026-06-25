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

// Bounding boxes by region label (matches gen-japan-nav-routes.js)
const BBOXES = {
  '東京':         [139.55, 35.55, 139.92, 35.82],
  '大阪・京都':   [135.10, 34.55, 135.70, 34.85],
  '名古屋':       [136.70, 34.90, 137.10, 35.30],
  '札幌':         [141.10, 42.90, 141.60, 43.25],
  '福岡':         [130.25, 33.50, 130.55, 33.70],
  '横浜・川崎':   [139.50, 35.35, 139.75, 35.55],
  '北海道内陸':   [141.50, 43.00, 143.80, 44.00],
  '東北・秋田':   [139.80, 39.40, 140.50, 40.00],
  '東北・岩手':   [140.90, 38.90, 141.50, 39.80],
  '東北・青森':   [140.10, 40.30, 141.10, 41.00],
  '島根':         [131.80, 34.60, 133.00, 35.20],
  '高知':         [132.70, 33.20, 133.70, 33.70],
  '宮崎':         [130.90, 31.50, 131.80, 32.50],
  '大分':         [130.90, 32.90, 131.90, 33.50],
  '長野':         [137.50, 35.90, 138.50, 36.70],
  '岐阜':         [136.60, 35.50, 137.40, 36.20],
};

function randInBbox([minLng, minLat, maxLng, maxLat]) {
  return [
    Math.round((minLng + Math.random() * (maxLng - minLng)) * 10000) / 10000,
    Math.round((minLat + Math.random() * (maxLat - minLat)) * 10000) / 10000,
  ];
}

function bboxForFeature(feature) {
  // Route name: "都市 東京 001" or "地方 北海道内陸 001"
  const parts = feature.properties.route.split(' ');
  const region = parts.slice(1, -1).join(' '); // everything between type and index
  return BBOXES[region] || null;
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

async function reverseGeocodeCoords(lng, lat) {
  const url =
    `https://api.mapbox.com/search/geocode/v6/reverse` +
    `?longitude=${lng}&latitude=${lat}&types=address&language=ja&access_token=${token}`;
  await acquireToken();
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.features?.[0] || null;
}

async function reverseGeocode(feature) {
  const bbox = bboxForFeature(feature);
  let [lng, lat] = feature.geometry.coordinates;
  const MAX_ATTEMPTS = 100;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const hit = await reverseGeocodeCoords(lng, lat);
    if (hit) {
      feature.geometry.coordinates = hit.geometry.coordinates;
      feature.properties.address = hit.properties.name;
      return;
    }
    // No address at this spot — resample within the region bbox
    if (!bbox) throw new Error('No result and no bbox to resample');
    [lng, lat] = randInBbox(bbox);
  }

  throw new Error(`No address found after ${MAX_ATTEMPTS} attempts`);
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
