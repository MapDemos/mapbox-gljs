#!/usr/bin/env node
// One-time / incremental: reads every demos/*.html file and asks Claude to
// write a detailed, technical description of it — meant only for the demo
// generator's AI to read later when suggesting a reference demo for a new
// request, never shown to a human. Skips files whose content hash matches
// the existing index entry, so re-running after adding ONE new demo only
// costs one API call.
//
// Usage: ANTHROPIC_API_KEY=sk-ant-... node scripts/build-demo-ai-index.js

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DEMOS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'demos');
const INDEX_PATH = path.join(DEMOS_DIR, 'demos-ai-index.json');
// Opus, deliberately — this runs once per demo ever (content-hash skip below),
// not per user request, so the per-token cost difference vs Haiku is
// irrelevant in absolute terms (~$4.50 vs ~$0.90 for the whole ~64-demo
// corpus), while better code comprehension here permanently improves every
// future suggestion this description feeds.
const MODEL = 'claude-opus-5';

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error('Set ANTHROPIC_API_KEY before running this script.');
  process.exit(1);
}

const SYSTEM_PROMPT = `You write detailed, technical descriptions of Mapbox GL JS demo pages, meant only for another AI system to read later when deciding whether a demo is a good structural/functional reference for a new request. These are never shown to a human, so be dense and precise rather than friendly.

Describe, concretely:
- What Mapbox GL JS / Mapbox API features are used (sources, layer types, camera moves, controls, plugins, Directions/Geocoding/Isochrone/Search Box calls, clustering, 3D/terrain, etc.)
- What data model/shape the demo uses (GeoJSON, vector tileset, hardcoded array, etc.) and where it comes from
- What UI controls and interactions exist (dropdowns, buttons, sliders, hover/click popups, filters) and what they do
- Anything structurally distinctive (multi-map sync, animation loops, custom layers, worker use, etc.)

Use consistent terminology across demos (always "category filter", never "topic filter" or "type filter" for the same concept; always "flyTo camera animation", "clustering", "fill-extrusion", "proximity sort", "isochrone", etc.) so descriptions can be compared and searched against each other later.

Output 100-200 words of dense prose. No preamble, no markdown headers, no restating the filename.`;

function hashContent(content) {
  return createHash('sha256').update(content).digest('hex').slice(0, 16);
}

function loadExistingIndex() {
  if (!existsSync(INDEX_PATH)) return {};
  const arr = JSON.parse(readFileSync(INDEX_PATH, 'utf8'));
  const bySlug = {};
  for (const entry of arr) bySlug[entry.slug] = entry;
  return bySlug;
}

async function describeDemo(html, filename) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `File: ${filename}\n\n${html}` }],
    }),
  });
  if (!res.ok) {
    throw new Error(`Anthropic API error ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  const text = data.content?.find((b) => b.type === 'text')?.text;
  if (!text) throw new Error('No text content in response');
  return text.trim();
}

async function main() {
  const existing = loadExistingIndex();
  const files = readdirSync(DEMOS_DIR).filter((f) => f.endsWith('.html'));
  const result = [];
  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of files) {
    const slug = file.replace(/\.html$/, '');
    const html = readFileSync(path.join(DEMOS_DIR, file), 'utf8');
    const hash = hashContent(html);

    const prior = existing[slug];
    if (prior && prior.hash === hash) {
      result.push(prior);
      skipped++;
      continue;
    }

    console.log(`Describing ${slug}...`);
    try {
      const description = await describeDemo(html, file);
      result.push({ slug, hash, description });
      generated++;
    } catch (err) {
      console.error(`  Failed for ${slug}: ${err.message}`);
      if (prior) {
        console.error('  Keeping previous description.');
        result.push(prior);
      }
      failed++;
    }
  }

  result.sort((a, b) => a.slug.localeCompare(b.slug));
  writeFileSync(INDEX_PATH, JSON.stringify(result, null, 2) + '\n');
  console.log(
    `Done. ${generated} generated, ${skipped} unchanged, ${failed} failed. Wrote ${INDEX_PATH}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
