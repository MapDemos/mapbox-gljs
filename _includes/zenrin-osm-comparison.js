// ============================================================
// CONSTANTS
// ============================================================

const INITIAL_CENTER = [139.7671, 35.6812];
const INITIAL_ZOOM = 14;
const MAP_STYLE = 'mapbox://styles/kenji-shima/cmmtz45at001501sm99f0eima';

const OSM_PROFILES = {
  cycling:          'mapbox/cycling',
  driving:          'mapbox/driving',
  'driving-traffic': 'mapbox/driving-traffic',
  walking:          'mapbox/walking',
};

const ZENRIN_PROFILES = {
  cycling:          'mapbox.tmp.valhalla-zenrin/cycling',
  driving:          'mapbox.tmp.valhalla-zenrin/driving',
  'driving-traffic': 'mapbox.tmp.valhalla-zenrin-premium/driving-traffic',
  walking:          'mapbox.tmp.valhalla-zenrin/walking',
};

// VOC entries where Checked by = "Mapbox issue" AND Coordinates has values
// Coordinates are [lng, lat] (converted from lat, lng in the VOC report)
const VOC_PRESETS = [
  {
    label: 'VOC #1  (5/1)  Wrong-way on one-way street',
    description: 'According to the app\'s route guidance, it directs drivers to go against a one-way street. I contacted you out of concern because I received a final warning for excessive distance increase.',
    origin: [139.81589031, 35.77940334], destination: [139.81568465, 35.77708518],
  },
  {
    label: 'VOC #2  (5/2)  Wrong-way on one-way street',
    description: 'Since yesterday, the app has repeatedly provided route guidance that goes against one-way streets. I would like to see this improved. In some unavoidable situations, I am currently driving along routes that differ from the app\'s guidance.',
    origin: [139.78460973, 35.66661260], destination: [139.78577436, 35.66754720],
  },
  {
    label: 'VOC #4  (5/3)  Wrong-way on one-way street',
    description: 'For this order, the navigation instructed me to go against a one-way street.',
    origin: [139.70634001, 35.72549027], destination: [139.70668362, 35.72826180],
  },
  {
    label: 'VOC #6  (5/5)  Wrong-way on one-way street',
    description: 'Due to the Rocket Now app directing me to go against a one-way street, I am reporting a significant route change.',
    origin: [139.82217398, 35.67825137], destination: [139.82217398, 35.68111410],
  },
  {
    label: 'VOC #9  (5/5)  No-entry road',
    description: 'I made a significant detour because the navigation guided me along a road that cannot be passed. This is a report of that issue.',
    origin: [139.60261473, 35.59912371], destination: [139.60268788, 35.59882438],
  },
  {
    label: 'VOC #10 (5/5)  Wrong-way on one-way street (Osaka)',
    description: 'The app displays routes that include locations where driving is prohibited or roads that are one-way streets. Each time, I am forced to make significant detours. When the detour becomes longer, I receive email notifications warning about delays. I do not believe I am at fault. This has happened twice today. Please correct the map as soon as possible.',
    origin: [135.49985987, 34.71361558], destination: [135.49829808, 34.72526530],
  },
  {
    label: 'VOC #12 (5/6)  No-entry road',
    description: 'The routes provided by the RDP app are not accurate, making it difficult to use. From the very beginning, the navigation guided me to roads that cannot be entered, so I had no choice but to change the route.',
    origin: [139.77570663, 35.70791112], destination: [139.77570663, 35.70753808],
  },
  {
    label: 'Email — Wrong-way (OSM base map correct)',
    description: 'The base map shows this road as one-way correctly, but the route still goes in the reverse direction, leading the rider to go against the traffic.',
    origin: [139.821030, 35.683693], destination: [139.822247, 35.680479],
  },
];

const TURN_ANGLE_THRESHOLD = 20;
const NO_TURN_TYPES = new Set(['depart', 'arrive', 'notification']);

// ============================================================
// STATE
// ============================================================

let state = {
  clickMode:   'origin',
  travelMode:  'driving',
  origin:      null, // [lng, lat]
  destination: null, // [lng, lat]
  osmExclude:    [],
  zenrinExclude: [],
};

// ============================================================
// MAPS
// ============================================================

let osmMap    = null;
let zenrinMap = null;
let isSyncing = false;

let osmStyleLoaded    = false;
let zenrinStyleLoaded = false;

let osmOriginMarker    = null;
let osmDestMarker      = null;
let zenrinOriginMarker = null;
let zenrinDestMarker   = null;

let currentFetchId = 0;

function initOsmMap() {
  osmMap = new mapboxgl.Map({
    container: 'osm-map',
    style: MAP_STYLE,
    center: INITIAL_CENTER,
    zoom: INITIAL_ZOOM,
    language: 'en',
  });

  osmMap.on('load', () => {
    osmStyleLoaded = true;
    addRouteLayer(osmMap, '#4285f4', '#1a56c4');
  });

  osmMap.on('click', (e) => handleMapClick(e.lngLat.lng, e.lngLat.lat));
  osmMap.on('move',  () => syncMaps(osmMap, zenrinMap));
}

function initZenrinMap() {
  zenrinMap = new mapboxgl.Map({
    container: 'zenrin-map',
    style: MAP_STYLE,
    center: INITIAL_CENTER,
    zoom: INITIAL_ZOOM,
    language: 'en',
  });

  zenrinMap.on('load', () => {
    zenrinStyleLoaded = true;
    addRouteLayer(zenrinMap, '#e8710a', '#c45e08');
  });

  zenrinMap.on('click', (e) => handleMapClick(e.lngLat.lng, e.lngLat.lat));
  zenrinMap.on('move',  () => syncMaps(zenrinMap, osmMap));
}

function createArrowImage() {
  const size = 20;
  const canvas = document.createElement('canvas');
  canvas.width  = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const cx = size / 2, cy = size / 2, t = size * 0.38;

  // White triangle on transparent background — sits inside the route line
  ctx.beginPath();
  ctx.moveTo(cx + t,        cy);
  ctx.lineTo(cx - t * 0.6,  cy - t * 0.8);
  ctx.lineTo(cx - t * 0.6,  cy + t * 0.8);
  ctx.closePath();
  ctx.fillStyle = 'white';
  ctx.fill();

  const imageData = ctx.getImageData(0, 0, size, size);
  return { width: size, height: size, data: new Uint8Array(imageData.data.buffer) };
}

function addRouteLayer(map, lineColor, casingColor) {
  const firstSymbol = map.getStyle().layers.find(
    l => l.type === 'symbol' && !l.id.startsWith('tunnel')
  );
  const beforeId = firstSymbol?.id;

  map.addSource('route', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] },
  });

  map.addLayer({
    id: 'route-casing',
    type: 'line',
    source: 'route',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': casingColor, 'line-width': 8, 'line-opacity': 0.8 },
  }, beforeId);

  map.addLayer({
    id: 'route-line',
    type: 'line',
    source: 'route',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: { 'line-color': lineColor, 'line-width': 5, 'line-opacity': 0.9 },
  }, beforeId);

  map.addImage('route-arrow', createArrowImage());

  map.addLayer({
    id: 'route-arrows',
    type: 'symbol',
    source: 'route',
    layout: {
      'symbol-placement': 'line',
      'symbol-spacing': 100,
      'icon-image': 'route-arrow',
      'icon-size': 0.6,
      'icon-rotation-alignment': 'map',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
    },
  });
}

// ============================================================
// MAP SYNC
// ============================================================

const SYNC_EPSILON = 1e-6;

function syncMaps(source, target) {
  if (isSyncing || !target) return;
  const c  = source.getCenter();
  const tc = target.getCenter();
  if (
    Math.abs(c.lat - tc.lat) < SYNC_EPSILON &&
    Math.abs(c.lng - tc.lng) < SYNC_EPSILON &&
    Math.abs(source.getZoom()    - target.getZoom())    < SYNC_EPSILON &&
    Math.abs(source.getBearing() - target.getBearing()) < SYNC_EPSILON &&
    Math.abs(source.getPitch()   - target.getPitch())   < SYNC_EPSILON
  ) return;
  isSyncing = true;
  target.jumpTo({ center: [c.lng, c.lat], zoom: source.getZoom(), bearing: source.getBearing(), pitch: source.getPitch() });
  requestAnimationFrame(() => { isSyncing = false; });
}

// ============================================================
// MARKERS
// ============================================================

function createMarkerEl(label, color) {
  const el = document.createElement('div');
  Object.assign(el.style, {
    width: '32px', height: '32px', background: color,
    borderRadius: '50%', color: 'white', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: '14px', fontWeight: 'bold',
    border: '2px solid white', boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
    cursor: 'default',
  });
  el.textContent = label;
  return el;
}

function placeMarkers(type, lngLat) {
  const [lng, lat] = lngLat;
  const label = type === 'origin' ? 'A' : 'B';
  const color = type === 'origin' ? '#34a853' : '#ea4335';

  if (type === 'origin') {
    osmOriginMarker?.remove();
    zenrinOriginMarker?.remove();
    osmOriginMarker    = new mapboxgl.Marker({ element: createMarkerEl(label, color) }).setLngLat([lng, lat]).addTo(osmMap);
    zenrinOriginMarker = new mapboxgl.Marker({ element: createMarkerEl(label, color) }).setLngLat([lng, lat]).addTo(zenrinMap);
  } else {
    osmDestMarker?.remove();
    zenrinDestMarker?.remove();
    osmDestMarker    = new mapboxgl.Marker({ element: createMarkerEl(label, color) }).setLngLat([lng, lat]).addTo(osmMap);
    zenrinDestMarker = new mapboxgl.Marker({ element: createMarkerEl(label, color) }).setLngLat([lng, lat]).addTo(zenrinMap);
  }
}

// ============================================================
// CLICK HANDLER
// ============================================================

function handleMapClick(lng, lat) {
  const type   = state.clickMode;
  const lngLat = [lng, lat];

  if (type === 'origin') {
    state.origin = lngLat;
    if (!state.destination) {
      state.clickMode = 'destination';
      document.getElementById('btn-destination').classList.add('active');
      document.getElementById('btn-origin').classList.remove('active');
    }
  } else {
    state.destination = lngLat;
  }

  placeMarkers(type, lngLat);
  updateHints();
  if (state.origin && state.destination) fetchBothRoutes();
}

// ============================================================
// ROUTE FETCHING
// ============================================================

async function fetchBothRoutes() {
  const fetchId = ++currentFetchId;
  const loading = `<div class="loading-indicator"><div class="spinner"></div><span>Fetching route...</span></div>`;
  document.getElementById('osm-result-content').innerHTML    = loading;
  document.getElementById('zenrin-result-content').innerHTML = loading;

  await Promise.all([
    fetchRoute('osm',    fetchId),
    fetchRoute('zenrin', fetchId),
  ]);
}

async function fetchRoute(type, fetchId) {
  const { origin, destination, travelMode } = state;
  const profiles = type === 'osm' ? OSM_PROFILES : ZENRIN_PROFILES;
  const profile  = profiles[travelMode] || profiles.driving;
  const exclude  = (type === 'osm' ? state.osmExclude : state.zenrinExclude);
  const excludeParam = exclude.length ? `&exclude=${exclude.join(',')}` : '';
  const resultId = type === 'osm' ? 'osm-result-content' : 'zenrin-result-content';
  const map      = type === 'osm' ? osmMap : zenrinMap;
  const loaded   = type === 'osm' ? osmStyleLoaded : zenrinStyleLoaded;

  const url =
    `https://api.mapbox.com/directions/v5/${profile}/` +
    `${origin[0]},${origin[1]};${destination[0]},${destination[1]}` +
    `?steps=true&geometries=geojson&overview=full&language=en` +
    `${excludeParam}&access_token=${mapboxgl.accessToken}`;

  try {
    const res  = await fetch(url);
    const data = await res.json();

    if (fetchId !== currentFetchId) return;
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${data.message || res.statusText}`);
    if (!data.routes?.length) {
      showError(resultId, 'No route found.');
      return;
    }

    const route = data.routes[0];
    if (loaded && map.getSource('route')) {
      map.getSource('route').setData({ type: 'Feature', geometry: route.geometry, properties: {} });
    }
    renderResult(resultId, route);
  } catch (err) {
    console.error(`[${type}] Directions error:`, err);
    if (fetchId === currentFetchId) showError(resultId, `Error: ${err.message}`);
  }
}

// ============================================================
// RESULT RENDERING
// ============================================================

function bearingDelta(before, after) {
  return Math.abs(((after - before) + 540) % 360 - 180);
}

function formatDuration(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return m > 0 ? `${m} min` : '< 1 min';
}

function formatDistance(m) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}

function renderResult(containerId, route) {
  const steps    = route.legs[0]?.steps || [];
  const summary  = route.legs[0]?.summary || '';
  const stepHTML = steps.map((s, i) => `
    <div class="step-item">
      <span class="step-number">${i + 1}</span>
      <span class="step-text">${s.maneuver?.instruction || ''}</span>
    </div>`).join('');

  document.getElementById(containerId).innerHTML = `
    <div class="result-summary">
      <div class="metric-card">
        <div class="metric-label">Duration</div>
        <div class="metric-value">${formatDuration(route.duration)}</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Distance</div>
        <div class="metric-value">${formatDistance(route.distance)}</div>
      </div>
    </div>
    ${summary ? `<div class="route-info">Via: ${summary}</div>` : ''}
    <div class="steps-title">Steps (${steps.length} total)</div>
    ${stepHTML}
  `;
}

function showError(containerId, message) {
  document.getElementById(containerId).innerHTML =
    `<div style="padding:24px;color:#ea4335;font-size:13px;">${message}</div>`;
}

// ============================================================
// CLEAR
// ============================================================

function clearAll() {
  state.origin      = null;
  state.destination = null;
  state.clickMode   = 'origin';

  document.getElementById('btn-origin').classList.add('active');
  document.getElementById('btn-destination').classList.remove('active');

  osmOriginMarker?.remove();    osmOriginMarker    = null;
  osmDestMarker?.remove();      osmDestMarker      = null;
  zenrinOriginMarker?.remove(); zenrinOriginMarker = null;
  zenrinDestMarker?.remove();   zenrinDestMarker   = null;

  [osmMap, zenrinMap].forEach(m => {
    m?.getSource('route')?.setData({ type: 'FeatureCollection', features: [] });
  });

  const placeholder = `
    <div class="result-placeholder">
      <span class="icon">🗺️</span>
      <span>Set origin and destination to show a route</span>
    </div>`;
  document.getElementById('osm-result-content').innerHTML    = placeholder;
  document.getElementById('zenrin-result-content').innerHTML = placeholder;

  document.getElementById('route-preset').value = '';
  setVocBanner(null);
  updateHints();
}

// ============================================================
// HINTS
// ============================================================

function updateHints() {
  let text;
  if (!state.origin)           text = 'Click to set origin (A)';
  else if (!state.destination) text = 'Click to set destination (B)';
  else {
    const label = state.clickMode === 'origin' ? 'origin (A)' : 'destination (B)';
    text = `Click to move ${label}`;
  }
  document.getElementById('osm-hint').textContent    = text;
  document.getElementById('zenrin-hint').textContent = text;
}

// ============================================================
// PRESET ROUTES
// ============================================================

function populatePresets() {
  const select = document.getElementById('route-preset');
  VOC_PRESETS.forEach((p, i) => {
    const opt       = document.createElement('option');
    opt.value       = i;
    opt.textContent = p.label;
    opt.title       = p.description;
    select.appendChild(opt);
  });
}

function setVocBanner(text) {
  const banner = document.getElementById('voc-banner');
  const span   = document.getElementById('voc-description-text');
  if (text) {
    span.textContent = text;
    banner.classList.add('visible');
  } else {
    banner.classList.remove('visible');
  }
}

function applyPreset(preset) {
  state.origin      = preset.origin;
  state.destination = preset.destination;
  setVocBanner(preset.description);
  state.clickMode   = 'origin';

  document.getElementById('btn-origin').classList.add('active');
  document.getElementById('btn-destination').classList.remove('active');

  placeMarkers('origin',      preset.origin);
  placeMarkers('destination', preset.destination);
  updateHints();

  const minLng = Math.min(preset.origin[0], preset.destination[0]);
  const maxLng = Math.max(preset.origin[0], preset.destination[0]);
  const minLat = Math.min(preset.origin[1], preset.destination[1]);
  const maxLat = Math.max(preset.origin[1], preset.destination[1]);
  const mapH = osmMap.getContainer().clientHeight;
  const pad   = Math.max(20, Math.floor(mapH * 0.15));
  const boundsOpts = { padding: pad, maxZoom: 17, duration: 0 };

  isSyncing = true;
  osmMap.fitBounds([[minLng, minLat], [maxLng, maxLat]], boundsOpts);
  zenrinMap.fitBounds([[minLng, minLat], [maxLng, maxLat]], boundsOpts);
  isSyncing = false;

  fetchBothRoutes();
}

// ============================================================
// AVOID DROPDOWNS
// ============================================================

function closeAllDropdowns() {
  document.querySelectorAll('.avoid-dropdown.open').forEach(d => d.classList.remove('open'));
}

function updateAvoidLabel(btn, values) {
  btn.textContent = values.length ? `Avoid: ${values.join(', ')} ▾` : 'Avoid ▾';
}

function setupAvoidDropdown(dropdownId, btnId, stateKey) {
  const dropdown  = document.getElementById(dropdownId);
  const btn       = document.getElementById(btnId);
  const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const wasOpen = dropdown.classList.contains('open');
    closeAllDropdowns();
    if (!wasOpen) dropdown.classList.add('open');
  });

  dropdown.querySelector('.avoid-panel').addEventListener('click', e => e.stopPropagation());

  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      state[stateKey] = [...checkboxes].filter(c => c.checked).map(c => c.value);
      updateAvoidLabel(btn, state[stateKey]);
    });
  });
}

// ============================================================
// EVENT LISTENERS
// ============================================================

function setupEventListeners() {
  document.getElementById('btn-origin').addEventListener('click', () => {
    state.clickMode = 'origin';
    document.getElementById('btn-origin').classList.add('active');
    document.getElementById('btn-destination').classList.remove('active');
    updateHints();
  });

  document.getElementById('btn-destination').addEventListener('click', () => {
    state.clickMode = 'destination';
    document.getElementById('btn-destination').classList.add('active');
    document.getElementById('btn-origin').classList.remove('active');
    updateHints();
  });

  document.getElementById('travel-mode').addEventListener('change', (e) => {
    state.travelMode = e.target.value;
    if (state.origin && state.destination) fetchBothRoutes();
  });

  document.getElementById('route-preset').addEventListener('change', (e) => {
    if (e.target.value === '') return;
    applyPreset(VOC_PRESETS[Number(e.target.value)]);
  });

  document.getElementById('clear-btn').addEventListener('click', clearAll);

  document.getElementById('osm-execute-btn').addEventListener('click', () => {
    if (state.origin && state.destination) fetchBothRoutes();
  });
  document.getElementById('zenrin-execute-btn').addEventListener('click', () => {
    if (state.origin && state.destination) fetchBothRoutes();
  });

  setupAvoidDropdown('osm-avoid-dropdown',    'osm-avoid-btn',    'osmExclude');
  setupAvoidDropdown('zenrin-avoid-dropdown', 'zenrin-avoid-btn', 'zenrinExclude');

  document.addEventListener('click', closeAllDropdowns);
}

// ============================================================
// INIT
// ============================================================

function init() {
  populatePresets();
  setupEventListeners();
  updateHints();
  initOsmMap();
  initZenrinMap();
}

init();
