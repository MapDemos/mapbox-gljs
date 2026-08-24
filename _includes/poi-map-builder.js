// ===================================================================
// POI Map Builder — reusable, no-code template
// Build a map by dropping/editing POIs in the sidebar, auto-frame them,
// and export the map (with legend + minimap) as PNG or JPG.
// ===================================================================

// ↓↓↓ Paste your own Mapbox access token here to use your account ↓↓↓
mapboxgl.accessToken = 'pk.REDACTED-internationalsos-TOKEN';

const STORAGE_KEY = 'poi-map-builder-state';
const PALETTE = ['#e11d48', '#2563eb', '#16a34a', '#f59e0b', '#7c3aed', '#0891b2', '#db2777', '#475569'];

// ---- Presaved maps (from the original Sapporo demo) ----
// Each entry is a ready-made map: legend title + markers + camera view.
// The dropdown lists these by `title`; selecting one loads the whole map.
// Add your own here to give the team more starting points.
const PRESET_CONFIGS = [
  {
    title: 'Client Location in Japan',
    view: { center: [137.5, 37.5], zoom: 4.5, pitch: 0, bearing: 0 },
    pois: [
      { name: 'Sapporo', lng: 141.351690, lat: 43.062051, color: '#e11d48', style: 'pin', label: '', icon: null },
    ],
  },
  {
    title: 'Medical Facilities and Airport',
    view: { center: [141.5, 43.0], zoom: 8.5, pitch: 0, bearing: 0 },
    pois: [
      { name: 'Sapporo Higashi Tokushukai Hospital', lng: 141.365836, lat: 43.103487, color: '#e11d48', style: 'numbered', label: '', icon: null },
      { name: 'Japan Self Defense Forces (JSDF) Sapporo Hospital', lng: 141.353300, lat: 43.006080, color: '#e11d48', style: 'numbered', label: '', icon: null },
      { name: 'Maruyama Koen Naika', lng: 141.314363, lat: 43.056276, color: '#e11d48', style: 'numbered', label: '', icon: null },
      { name: 'Omni Dentix', lng: 141.353770, lat: 43.059352, color: '#e11d48', style: 'numbered', label: '', icon: null },
      { name: 'New Chitose Airport', lng: 141.686620, lat: 42.779117, color: '#2563eb', style: 'icon', label: '', icon: 'airport' },
    ],
  },
  {
    title: 'Closer View of Medical Facilities',
    view: { center: [141.345, 43.055], zoom: 12, pitch: 30, bearing: -10 },
    pois: [
      { name: 'Sapporo Higashi Tokushukai Hospital', lng: 141.365836, lat: 43.103487, color: '#e11d48', style: 'numbered', label: '', icon: null },
      { name: 'Japan Self Defense Forces (JSDF) Sapporo Hospital', lng: 141.353300, lat: 43.006080, color: '#e11d48', style: 'numbered', label: '', icon: null },
      { name: 'Maruyama Koen Naika', lng: 141.314363, lat: 43.056276, color: '#e11d48', style: 'numbered', label: '', icon: null },
      { name: 'Omni Dentix', lng: 141.353770, lat: 43.059352, color: '#e11d48', style: 'numbered', label: '', icon: null },
    ],
  },
];

// SVG icon paths embedded in markers (key → inner SVG). Extend as needed.
const ICON_SVG = {
  airport: `<path d="M21 16v-2l-8-5V4.5c0-.83-.67-1.5-1.5-1.5S10 3.67 10 4.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="white" transform="translate(3.8,3.4) scale(0.85)"/>`,
};

// ---- State ----
// state.view: explicit camera {center,zoom,pitch,bearing} from a preset, or null = auto-fit
const DEFAULT_STATE = { title: 'My POI Map', view: null, pois: [] };
let state = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}
function uid() { return 'poi-' + Math.random().toString(36).slice(2, 9); }

// ---- Map init ----
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  language: 'en',
  center: [137.5, 37.5],
  zoom: 4,
  attributionControl: false,
});
map.addControl(new mapboxgl.AttributionControl({ compact: false }), 'bottom-left');

// ---- Inset overview minimap (bottom-right) — zoomable ----
let minimapOffset = 3; // zoom levels the minimap sits "out" from the main map
const minimapZoom = z => Math.max(z - minimapOffset, 0);
const minimap = new mapboxgl.Map({
  container: 'minimap',
  style: 'mapbox://styles/mapbox/streets-v12',
  language: 'en',
  projection: 'mercator',
  center: map.getCenter(),
  zoom: minimapZoom(map.getZoom()),
  attributionControl: false,
});
// Zoomable + pannable (scroll / drag / double-click); rotation kept off
minimap.dragRotate.disable();
minimap.touchZoomRotate.disableRotation();

let minimapPan = { lng: 0, lat: 0 }; // minimap center offset from the main map
let syncingMinimap = false;
map.on('move', () => {
  syncingMinimap = true;
  const c = map.getCenter();
  minimap.jumpTo({ center: [c.lng + minimapPan.lng, c.lat + minimapPan.lat], zoom: minimapZoom(map.getZoom()) });
  syncingMinimap = false;
});
// When the user pans/zooms the minimap, remember its new offset from the main map
minimap.on('moveend', () => {
  if (syncingMinimap) return;
  const mc = map.getCenter(), nc = minimap.getCenter();
  minimapPan = { lng: nc.lng - mc.lng, lat: nc.lat - mc.lat };
  minimapOffset = map.getZoom() - minimap.getZoom();
});

// ---- Marker element factory ----
function makeMarkerEl(label, color, iconKey) {
  const el = document.createElement('div');
  const inner = iconKey && ICON_SVG[iconKey]
    ? ICON_SVG[iconKey]
    : `<text x="14" y="18" font-size="11" font-weight="700" fill="white" text-anchor="middle" dominant-baseline="middle" font-family="-apple-system,sans-serif">${label}</text>`;
  el.innerHTML = `
    <svg width="28" height="40" viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 26 14 26S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="${color}" stroke="white" stroke-width="1.5"/>
      ${inner}
    </svg>`;
  el.style.cssText = 'cursor:pointer;';
  return el;
}

// Small inline SVG for legend rows that use a pin or icon style
function legendPinSVG(color, iconKey) {
  const inner = iconKey && ICON_SVG[iconKey]
    ? `<svg width="16" height="16" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V4.5c0-.83-.67-1.5-1.5-1.5S10 3.67 10 4.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="${color}"/></svg>`
    : `<svg width="16" height="22" viewBox="0 0 28 40"><path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 26 14 26S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="${color}"/></svg>`;
  return inner;
}

// ---- Markers: rebuilt from state on every change ----
let markers = [];
function rebuildMarkers() {
  markers.forEach(m => m.remove());
  markers = [];
  state.pois.forEach((poi, i) => {
    const label = poi.style === 'numbered' ? (poi.label || (i + 1)) : '';
    const iconKey = poi.style === 'icon' ? (poi.icon || 'airport') : null;
    const el = makeMarkerEl(label, poi.color, iconKey);
    const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([poi.lng, poi.lat])
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<div style="font-family:-apple-system,sans-serif;font-size:13px;font-weight:600;color:#1e293b">${poi.name || 'Untitled'}</div>
         <div style="font-size:11px;color:#94a3b8;margin-top:3px">${poi.lat.toFixed(5)}, ${poi.lng.toFixed(5)}</div>`
      ))
      .addTo(map);
    markers.push(marker);
  });
}

// ---- Legend overlay (captured in export) ----
function renderLegend() {
  document.getElementById('legend-title').textContent = state.title || 'My POI Map';
  const list = document.getElementById('legend-list');
  if (!state.pois.length) {
    list.innerHTML = `<div class="legend-empty">Add locations from the sidebar to populate this legend.</div>`;
    return;
  }
  list.innerHTML = state.pois.map((poi, i) => {
    const swatch = poi.style === 'numbered'
      ? `<span class="legend-num" style="background:${poi.color}">${escapeHTML(poi.label) || (i + 1)}</span>`
      : `<span class="legend-pin">${legendPinSVG(poi.color, poi.style === 'icon' ? (poi.icon || 'airport') : null)}</span>`;
    return `<div class="legend-item">${swatch}<div class="legend-name">${escapeHTML(poi.name) || 'Untitled'}</div></div>`;
  }).join('');
}

function escapeHTML(s) {
  return (s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// ---- Sidebar editor (NOT captured) ----
function renderEditor() {
  const wrap = document.getElementById('poi-editor');
  if (!state.pois.length) {
    wrap.innerHTML = `<div class="poi-empty">No locations yet.<br>Add one above, or pick a <b>Preset</b> map from the top bar.</div>`;
    return;
  }
  wrap.innerHTML = '';
  state.pois.forEach((poi, i) => {
    const row = document.createElement('div');
    row.className = 'poi-row';
    row.innerHTML = `
      <span class="num-badge" style="background:${poi.color}" title="Fly to">${poi.style === 'numbered' ? (escapeHTML(poi.label) || (i + 1)) : '•'}</span>
      <input type="color" value="${poi.color}" title="Marker color">
      <input class="label-input" type="text" value="${escapeAttr(poi.label)}" maxlength="3" placeholder="${i + 1}" title="Label (blank = auto number)" ${poi.style === 'numbered' ? '' : 'style="display:none"'}>
      <input class="name-input" type="text" value="${escapeAttr(poi.name)}" placeholder="Location name">
      <select class="style-select" title="Marker style">
        <option value="numbered" ${poi.style === 'numbered' ? 'selected' : ''}>1,2,3</option>
        <option value="pin" ${poi.style === 'pin' ? 'selected' : ''}>Pin</option>
        <option value="icon" ${poi.style === 'icon' ? 'selected' : ''}>Airport</option>
      </select>
      <div class="row-btns">
        <button class="icon-btn up-btn" title="Move up" ${i === 0 ? 'disabled' : ''}>▲</button>
        <button class="icon-btn down-btn" title="Move down" ${i === state.pois.length - 1 ? 'disabled' : ''}>▼</button>
      </div>
      <button class="icon-btn del-btn" title="Delete" style="height:auto;font-size:14px">✕</button>
    `;
    // Fly to on badge click
    row.querySelector('.num-badge').addEventListener('click', () => {
      map.flyTo({ center: [poi.lng, poi.lat], zoom: 14, duration: 1200, essential: true });
    });
    // Color
    row.querySelector('input[type="color"]').addEventListener('input', e => {
      poi.color = e.target.value; commit({ refit: false });
    });
    // Label (overrides auto number; blank = auto)
    row.querySelector('.label-input').addEventListener('input', e => {
      poi.label = e.target.value;
      saveState(); rebuildMarkers(); renderLegend();
      row.querySelector('.num-badge').textContent = escapeHTML(poi.label) || (i + 1);
    });
    // Name
    row.querySelector('.name-input').addEventListener('input', e => {
      poi.name = e.target.value; saveState(); renderLegend();
    });
    // Style
    row.querySelector('.style-select').addEventListener('change', e => {
      poi.style = e.target.value;
      if (poi.style === 'icon' && !poi.icon) poi.icon = 'airport';
      commit({ refit: false });
    });
    // Reorder
    row.querySelector('.up-btn').addEventListener('click', () => move(i, -1));
    row.querySelector('.down-btn').addEventListener('click', () => move(i, 1));
    // Delete
    row.querySelector('.del-btn').addEventListener('click', () => {
      state.pois.splice(i, 1); state.view = null; commit({ refit: true });
    });
    wrap.appendChild(row);
  });
}

function escapeAttr(s) { return escapeHTML(s).replace(/'/g, '&#39;'); }

function move(i, dir) {
  const j = i + dir;
  if (j < 0 || j >= state.pois.length) return;
  [state.pois[i], state.pois[j]] = [state.pois[j], state.pois[i]];
  commit({ refit: false });
}

// ---- Commit: single source of truth for re-render ----
function commit({ refit } = { refit: false }) {
  saveState();
  rebuildMarkers();
  renderLegend();
  renderEditor();
  if (refit) applyCamera();
}

// ---- Add a POI ---- (manual edits leave preset mode → auto-fit)
function addPOI(lng, lat, name) {
  const color = PALETTE[state.pois.length % PALETTE.length];
  state.pois.push({ id: uid(), name: name || `Location ${state.pois.length + 1}`, lng, lat, color, style: 'numbered', label: '', icon: null });
  state.view = null;
  commit({ refit: true });
}

// ---- Camera ----
function fitToPOIs() {
  if (!state.pois.length) return;
  if (state.pois.length === 1) {
    map.flyTo({ center: [state.pois[0].lng, state.pois[0].lat], zoom: 12, pitch: 0, bearing: 0, duration: 1200, essential: true });
    return;
  }
  const fc = turf.featureCollection(state.pois.map(p => turf.point([p.lng, p.lat])));
  const b = turf.bbox(fc); // [minX, minY, maxX, maxY]
  map.fitBounds([[b[0], b[1]], [b[2], b[3]]], { padding: 80, pitch: 0, bearing: 0, duration: 1200, essential: true });
}

// Use the preset's saved camera if present, otherwise auto-fit the POIs
function applyCamera() {
  if (state.view && state.view.center) {
    map.flyTo({ center: state.view.center, zoom: state.view.zoom, pitch: state.view.pitch || 0, bearing: state.view.bearing || 0, duration: 1400, essential: true });
  } else {
    fitToPOIs();
  }
}

// ---- Coordinate entry → add POI ----
const latInput = document.getElementById('lat-input');
const lngInput = document.getElementById('lng-input');
function addFromCoords() {
  const lat = parseFloat(latInput.value);
  const lng = parseFloat(lngInput.value);
  if (Number.isNaN(lat) || Number.isNaN(lng)) { alert('Enter a numeric latitude and longitude.'); return; }
  if (lat < -90 || lat > 90) { alert('Latitude must be between -90 and 90.'); return; }
  if (lng < -180 || lng > 180) { alert('Longitude must be between -180 and 180.'); return; }
  addPOI(lng, lat);
  latInput.value = '';
  lngInput.value = '';
  latInput.focus();
}
document.getElementById('btn-add-coord').addEventListener('click', addFromCoords);
[latInput, lngInput].forEach(el => el.addEventListener('keydown', e => {
  if (e.key === 'Enter') addFromCoords();
}));

// ---- Click-to-place ----
const addBtn = document.getElementById('btn-add-click');
let arming = false;
function setArming(on) {
  arming = on;
  addBtn.classList.toggle('arming', on);
  addBtn.innerHTML = on
    ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Click on the map…`
    : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> Click map to add a POI`;
  map.getCanvas().style.cursor = on ? 'crosshair' : '';
}
addBtn.addEventListener('click', () => setArming(!arming));
map.on('click', e => {
  if (!arming) return;
  addPOI(e.lngLat.lng, e.lngLat.lat);
  setArming(false);
});

// ---- Title input ----
const titleInput = document.getElementById('title-input');
titleInput.value = state.title;
titleInput.addEventListener('input', e => { state.title = e.target.value; saveState(); renderLegend(); });

// ---- Preset dropdown (load a presaved map) ----
// Options are labelled by each preset's legend title; selecting loads it.
const presetSelect = document.getElementById('preset-select');
presetSelect.innerHTML = `<option value="">Load a saved map…</option>` +
  PRESET_CONFIGS.map((c, i) => `<option value="${i}">${escapeHTML(c.title)}</option>`).join('');

function loadPreset(index) {
  const cfg = PRESET_CONFIGS[index];
  if (!cfg) return;
  state = {
    title: cfg.title,
    view: cfg.view ? { ...cfg.view } : null,
    pois: cfg.pois.map(p => ({ id: uid(), name: p.name || '', lng: p.lng, lat: p.lat, color: p.color || '#e11d48', style: p.style || 'numbered', label: p.label || '', icon: p.icon || null })),
  };
  titleInput.value = state.title;
  commit({ refit: true });
}

presetSelect.addEventListener('change', () => {
  const idx = presetSelect.value;
  presetSelect.value = ''; // acts as a menu — reset after choosing
  if (idx === '') return;
  if (state.pois.length && !confirm('Load this saved map? It will replace the current locations.')) return;
  loadPreset(+idx);
});

// ---- Save / Load / Reset ----
function slug(s) { return (s || 'poi-map').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'poi-map'; }

document.getElementById('btn-save').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${slug(state.title)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
});

const loadFile = document.getElementById('load-file');
document.getElementById('btn-load').addEventListener('click', () => loadFile.click());
loadFile.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!parsed || !Array.isArray(parsed.pois)) throw new Error('bad config');
      const view = parsed.view && parsed.view.center ? parsed.view : null;
      state = { title: parsed.title || 'My POI Map', view, pois: parsed.pois.map(p => ({
        id: p.id || uid(), name: p.name || '', lng: +p.lng, lat: +p.lat,
        color: p.color || '#e11d48', style: p.style || 'numbered', label: p.label || '', icon: p.icon || null,
      })) };
      titleInput.value = state.title;
      commit({ refit: true });
    } catch {
      alert('Could not read that file — please choose a config saved by this tool.');
    }
  };
  reader.readAsText(file);
  loadFile.value = '';
});

document.getElementById('btn-reset').addEventListener('click', () => {
  if (!confirm('Clear all locations and start over?')) return;
  state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  titleInput.value = state.title;
  commit({ refit: false });
  map.flyTo({ center: [137.5, 37.5], zoom: 4, pitch: 0, bearing: 0, duration: 1000 });
});

// ---- Export (PNG / JPG) — captures #main only (map + legend + minimap) ----
const EXPORT_ICON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M3 9h2M19 9h2M9 3v2M9 19v2M15 3v2M15 19v2"/></svg> Export`;
document.getElementById('btn-export').addEventListener('click', async function () {
  const btn = this;
  const fmt = document.getElementById('export-format').value;
  const isJpg = fmt === 'jpg';
  btn.disabled = true;
  btn.textContent = 'Capturing…';
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { displaySurface: 'browser' },
      preferCurrentTab: true,
    });
    const video = document.createElement('video');
    video.srcObject = stream;
    await video.play();
    // Wait for an actually-painted frame (play() can resolve before the first
    // frame is composited, which would capture a black/blank image).
    await new Promise(resolve => {
      if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(() => resolve());
      else requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

    // Crop to #main only — scale between captured pixels and CSS pixels
    const rect = document.getElementById('main').getBoundingClientRect();
    const scaleX = video.videoWidth / window.innerWidth;
    const scaleY = video.videoHeight / window.innerHeight;

    const canvas = document.createElement('canvas');
    canvas.width = rect.width * scaleX;
    canvas.height = rect.height * scaleY;
    const ctx = canvas.getContext('2d');
    if (isJpg) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    ctx.drawImage(
      video,
      rect.left * scaleX, rect.top * scaleY, rect.width * scaleX, rect.height * scaleY,
      0, 0, canvas.width, canvas.height
    );
    stream.getTracks().forEach(t => t.stop());

    const link = document.createElement('a');
    link.download = `${slug(state.title)}.${isJpg ? 'jpg' : 'png'}`;
    link.href = canvas.toDataURL(isJpg ? 'image/jpeg' : 'image/png', isJpg ? 0.92 : undefined);
    link.click();
  } catch {
    // user cancelled
  } finally {
    btn.disabled = false;
    btn.innerHTML = EXPORT_ICON;
  }
});

// ---- Initial render ----
map.on('load', () => {
  commit({ refit: true });
});
