#!/usr/bin/env node
// Generates japan-nav-routes.geojson with 1000 origin/destination pairs:
//   500 urban  — within major Japanese city bounding boxes
//   500 rural  — within rural prefecture bounding boxes
// Each pair uses direct coordinates (no geocoding needed at load time).

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function rand(min, max) {
  return min + Math.random() * (max - min);
}

function roundCoord(v) {
  return Math.round(v * 10000) / 10000;
}

// Each region: { label, count, bbox: [minLng, minLat, maxLng, maxLat] }
const urbanRegions = [
  { label: '東京',         count: 200, bbox: [139.55, 35.55, 139.92, 35.82] },
  { label: '大阪・京都',   count: 100, bbox: [135.10, 34.55, 135.70, 34.85] },
  { label: '名古屋',       count:  50, bbox: [136.70, 34.90, 137.10, 35.30] },
  { label: '札幌',         count:  50, bbox: [141.10, 42.90, 141.60, 43.25] },
  { label: '福岡',         count:  50, bbox: [130.25, 33.50, 130.55, 33.70] },
  { label: '横浜・川崎',   count:  50, bbox: [139.50, 35.35, 139.75, 35.55] },
];

const ruralRegions = [
  { label: '北海道内陸',   count: 100, bbox: [141.50, 43.00, 143.80, 44.00] },
  { label: '東北・秋田',   count:  60, bbox: [139.80, 39.40, 140.50, 40.00] },
  { label: '東北・岩手',   count:  60, bbox: [140.90, 38.90, 141.50, 39.80] },
  { label: '東北・青森',   count:  30, bbox: [140.10, 40.30, 141.10, 41.00] },
  { label: '島根',         count:  50, bbox: [131.80, 34.60, 133.00, 35.20] },
  { label: '高知',         count:  50, bbox: [132.70, 33.20, 133.70, 33.70] },
  { label: '宮崎',         count:  50, bbox: [130.90, 31.50, 131.80, 32.50] },
  { label: '大分',         count:  50, bbox: [130.90, 32.90, 131.90, 33.50] },
  { label: '長野',         count:  30, bbox: [137.50, 35.90, 138.50, 36.70] },
  { label: '岐阜',         count:  20, bbox: [136.60, 35.50, 137.40, 36.20] },
];

const features = [];

function addPairs(regions, typeLabel) {
  let idx = 1;
  for (const region of regions) {
    for (let i = 0; i < region.count; i++) {
      const [minLng, minLat, maxLng, maxLat] = region.bbox;
      const oLng = roundCoord(rand(minLng, maxLng));
      const oLat = roundCoord(rand(minLat, maxLat));
      const dLng = roundCoord(rand(minLng, maxLng));
      const dLat = roundCoord(rand(minLat, maxLat));
      const name = `${typeLabel} ${region.label} ${String(idx).padStart(3, '0')}`;
      idx++;

      features.push({
        type: 'Feature',
        properties: { route: name, role: 'origin' },
        geometry: { type: 'Point', coordinates: [oLng, oLat] },
      });
      features.push({
        type: 'Feature',
        properties: { route: name, role: 'destination' },
        geometry: { type: 'Point', coordinates: [dLng, dLat] },
      });
    }
  }
}

addPairs(urbanRegions, '都市');
addPairs(ruralRegions, '地方');

const geojson = { type: 'FeatureCollection', features };
const outPath = path.resolve(__dirname, '..', 'japan-nav-routes.geojson');
fs.writeFileSync(outPath, JSON.stringify(geojson, null, 2), 'utf8');
console.log(`Wrote ${features.length / 2} route pairs (${features.length} features) to ${outPath}`);
