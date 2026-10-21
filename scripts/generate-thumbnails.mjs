#!/usr/bin/env node
// Screenshots every demo in demos/demos.json that has no thumbnail yet and
// saves it as demos/thumbs/<slug>.jpg (256px wide), then rewrites
// demos/thumbs/index.json -- the list of slugs index.html shows a thumbnail
// for. Style templates listed in demos/shared/templates/templates.json get the
// same treatment as demos/thumbs/templates/<name>.jpg (480px wide; gallery.html
// shows them larger) with their own demos/thumbs/templates/index.json. Existing thumbnails are never regenerated: commit your own image to
// replace a bad one, or delete the file to have it re-shot.
//
// Runs in CI (.github/workflows/deploy.yml) before the site is flattened, and
// locally with `npm run thumbs`. A demo that fails (timeout, blocked, no map,
// blank screenshot) is logged and skipped, never fatal.

import { createServer } from 'node:http';
import { readFile, readdir, writeFile, mkdir, access } from 'node:fs/promises';
import { extname, join, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DEMOS_DIR = join(ROOT, 'demos');
const THUMBS_DIR = join(DEMOS_DIR, 'thumbs');
const VIEWPORT = { width: 1280, height: 800 };
// index.html shows thumbnails 128px wide; 256px covers 2x (retina) screens.
const THUMB_WIDTH = 256;
const TEMPLATE_THUMBS_DIR = join(THUMBS_DIR, 'templates');
// gallery.html shows template cards up to ~320px wide; 480px stays sharp on
// most screens while keeping each JPEG small.
const TEMPLATE_THUMB_WIDTH = 480;
const PAGE_TIMEOUT_MS = 30000;
const CANVAS_TIMEOUT_MS = 15000;
const SETTLE_MS = 4000;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.geojson': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.gif': 'image/gif', '.csv': 'text/csv', '.pbf': 'application/x-protobuf',
  '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json', '.woff2': 'font/woff2', '.mp4': 'video/mp4',
};

// Minimal static server for the repo root, so local demos load over
// http://127.0.0.1 exactly as they do during development.
function startServer() {
  const server = createServer(async (req, res) => {
    try {
      const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      let file = normalize(join(ROOT, path));
      if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
      if (path.endsWith('/')) file = join(file, 'index.html');
      const body = await readFile(file);
      res.writeHead(200, { 'Content-Type': MIME[extname(file).toLowerCase()] || 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

// CodePen sits behind a Cloudflare bot check (pages and its preview images
// alike), so headless Chromium only ever gets the challenge page. Those demos
// are skipped; drop a thumbs/<slug>.jpg in by hand to give one a thumbnail.
const SKIP_TYPES = new Set(['codepen']);

function demoUrl(item, port) {
  if (item.type === 'local') return `http://127.0.0.1:${port}/demos/${item.url}`;
  return item.url;
}

const exists = (p) => access(p).then(() => true, () => false);

// A screenshot whose every channel is nearly flat is a blank/failed render.
async function isBlank(png) {
  const { channels } = await sharp(png).stats();
  return channels.slice(0, 3).every((c) => c.stdev < 4);
}

// Waits until any frame has a canvas: CodePen's full view renders the pen in
// an iframe, so the top document never has one. Some demos show a UI first
// and only draw a map after a click; for those this just times out and the
// page is shot as-is (the blank check still guards against empty renders).
async function waitForCanvas(page) {
  const deadline = Date.now() + CANVAS_TIMEOUT_MS;
  while (Date.now() < deadline) {
    for (const frame of page.frames()) {
      if (await frame.$('canvas').catch(() => null)) return true;
    }
    await page.waitForTimeout(500);
  }
  return false;
}

async function shoot(browser, item, url, outFile = join(THUMBS_DIR, `${item.slug}.jpg`), width = THUMB_WIDTH) {
  const page = await browser.newPage({ viewport: VIEWPORT });
  page.setDefaultTimeout(PAGE_TIMEOUT_MS);
  try {
    await page.goto(url, { waitUntil: 'load', timeout: PAGE_TIMEOUT_MS });
    const text = await page.locator('body').innerText().catch(() => '');
    if (/security verification|just a moment|verify you are human/i.test(text)) {
      throw new Error('bot-check page');
    }
    if (!(await waitForCanvas(page))) console.warn(`  note  ${item.slug}: no canvas, shooting the page as-is`);
    await page.waitForTimeout(SETTLE_MS);
    const png = await page.screenshot({ type: 'png' });
    if (await isBlank(png)) throw new Error('blank screenshot');
    await sharp(png).resize({ width }).jpeg({ quality: 72, mozjpeg: true }).toFile(outFile);
  } finally {
    await page.close();
  }
}

async function writeManifest(dir = THUMBS_DIR) {
  const slugs = (await readdir(dir))
    .filter((f) => f.endsWith('.jpg'))
    .map((f) => f.slice(0, -4))
    .sort();
  await writeFile(join(dir, 'index.json'), `${JSON.stringify(slugs, null, 2)}\n`);
  return slugs.length;
}

async function main() {
  await mkdir(THUMBS_DIR, { recursive: true });
  const raw = JSON.parse(await readFile(join(DEMOS_DIR, 'demos.json'), 'utf8'));
  const demos = Array.isArray(raw) ? raw : raw.demos;

  // Each job: what to shoot, where it lives, where the JPEG goes and how wide.
  const missing = [];
  for (const item of demos) {
    if (!item.slug || SKIP_TYPES.has(item.type)) continue;
    const out = join(THUMBS_DIR, `${item.slug}.jpg`);
    if (!(await exists(out))) missing.push({ item, path: (port) => demoUrl(item, port), out, width: THUMB_WIDTH });
  }
  console.log(`${demos.length} demos, ${missing.length} without a thumbnail (${[...SKIP_TYPES].join(', ')} skipped).`);

  await mkdir(TEMPLATE_THUMBS_DIR, { recursive: true });
  const templates = JSON.parse(await readFile(join(DEMOS_DIR, 'shared', 'templates', 'templates.json'), 'utf8'));
  let missingTemplates = 0;
  for (const tpl of templates) {
    if (!tpl.name) continue;
    const out = join(TEMPLATE_THUMBS_DIR, `${tpl.name}.jpg`);
    if (await exists(out)) continue;
    missingTemplates += 1;
    missing.push({
      item: { slug: `templates/${tpl.name}` },
      path: (port) => `http://127.0.0.1:${port}/demos/shared/templates/${tpl.name}-template.html`,
      out,
      width: TEMPLATE_THUMB_WIDTH,
    });
  }
  console.log(`${templates.length} templates, ${missingTemplates} without a thumbnail.`);

  if (missing.length) {
    const server = await startServer();
    const { port } = server.address();
    // SwiftShader gives headless Chromium a software WebGL context on CI
    // runners that have no GPU, which Mapbox GL JS needs to draw anything.
    const browser = await chromium.launch({
      args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
    });
    let ok = 0;
    for (const { item, path, out, width } of missing) {
      const url = path(port);
      try {
        await shoot(browser, item, url, out, width);
        ok += 1;
        console.log(`  ok    ${item.slug}`);
      } catch (err) {
        console.warn(`  skip  ${item.slug} (${url}): ${err.message.split('\n')[0]}`);
      }
    }
    await browser.close();
    server.close();
    console.log(`Generated ${ok} of ${missing.length}.`);
  }

  console.log(`Manifest lists ${await writeManifest()} thumbnails.`);
  console.log(`Template manifest lists ${await writeManifest(TEMPLATE_THUMBS_DIR)} thumbnails.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
