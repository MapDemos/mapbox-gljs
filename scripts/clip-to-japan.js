#!/usr/bin/env node
// Validates all points in japan-nav-routes.geojson against Japan's polygon.
// Points outside Japan are snapped to the nearest point on the polygon boundary.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Geometry helpers ─────────────────────────────────────────────────────────

// Ray-casting point-in-ring test (exterior ring only).
function pointInRing(px, py, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

// Point inside a polygon (exterior ring minus holes).
function pointInPolygon(px, py, rings) {
  if (!pointInRing(px, py, rings[0])) return false;
  for (let h = 1; h < rings.length; h++) {
    if (pointInRing(px, py, rings[h])) return false; // inside a hole
  }
  return true;
}

// Point inside a MultiPolygon.
function pointInMultiPolygon(px, py, multiPolygon) {
  return multiPolygon.some(rings => pointInPolygon(px, py, rings));
}

// Nearest point on a line segment ab to point p. Returns {x, y, dist2}.
function nearestOnSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return { x: ax, y: ay, dist2: (px - ax) ** 2 + (py - ay) ** 2 };
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
  const x = ax + t * dx;
  const y = ay + t * dy;
  return { x, y, dist2: (px - x) ** 2 + (py - y) ** 2 };
}

// Nearest point on a ring (closed polyline) to point p.
function nearestOnRing(px, py, ring) {
  let best = { x: 0, y: 0, dist2: Infinity };
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const c = nearestOnSegment(px, py, ring[j][0], ring[j][1], ring[i][0], ring[i][1]);
    if (c.dist2 < best.dist2) best = c;
  }
  return best;
}

// Nearest point on a MultiPolygon's exterior rings to point p.
function nearestOnMultiPolygon(px, py, multiPolygon) {
  let best = { x: 0, y: 0, dist2: Infinity };
  for (const rings of multiPolygon) {
    // Only snap to exterior ring (index 0) — guaranteed to be on land
    const c = nearestOnRing(px, py, rings[0]);
    if (c.dist2 < best.dist2) best = c;
  }
  return best;
}

// ── Main ─────────────────────────────────────────────────────────────────────

const countriesPath = `${process.env.HOME}/Downloads/countries.geojson`;
const routesPath = path.resolve(__dirname, '..', 'japan-nav-routes.geojson');

const countries = JSON.parse(fs.readFileSync(countriesPath, 'utf8'));
const japan = countries.features.find(f => f.properties['ISO3166-1-Alpha-2'] === 'JP');
if (!japan) {
  console.error('Japan not found in countries.geojson');
  process.exit(1);
}

const multiPolygon = japan.geometry.coordinates; // [polygon, ...], each polygon = [exterior, ...holes]
console.log(`Japan: ${multiPolygon.length} polygons`);

const routes = JSON.parse(fs.readFileSync(routesPath, 'utf8'));
let snapped = 0;
let ok = 0;

for (const feature of routes.features) {
  const [lng, lat] = feature.geometry.coordinates;
  if (pointInMultiPolygon(lng, lat, multiPolygon)) {
    ok++;
  } else {
    const nearest = nearestOnMultiPolygon(lng, lat, multiPolygon);
    feature.geometry.coordinates = [
      Math.round(nearest.x * 10000) / 10000,
      Math.round(nearest.y * 10000) / 10000,
    ];
    snapped++;
  }
}

fs.writeFileSync(routesPath, JSON.stringify(routes, null, 2), 'utf8');
console.log(`✓ ${ok} points already in Japan`);
console.log(`⤷ ${snapped} points snapped to nearest Japan boundary`);
console.log(`Wrote ${routesPath}`);
