// ============================================================
// CONSTANTS
// ============================================================
const GOOGLE_KEY_STORAGE = 'directions_google_api_key';
let googleApiKey = localStorage.getItem(GOOGLE_KEY_STORAGE) || '';
const INITIAL_CENTER = [139.7671, 35.6812]; // Tokyo
const INITIAL_ZOOM = 12;

// ============================================================
// STATE
// ============================================================
let state = {
  clickMode: 'origin',    // 'origin' | 'destination'
  travelMode: 'driving',
  origin: null,           // { lat, lng } or null
  destination: null,      // { lat, lng } or null
  mapboxExclude: [],      // e.g. ['toll', 'ferry']
  googleAvoid: [],        // e.g. ['tolls', 'highways']
};

// ============================================================
// MAPS & MARKERS
// ============================================================
let mapboxMap = null;
let googleMap = null;
let directionsService = null;
let directionsRenderer = null;
let isSyncing = false;

let mapboxOriginMarker = null;
let mapboxDestMarker = null;
let googleOriginMarker = null;
let googleDestMarker = null;

let currentFetchId = 0;
let mapboxStyleLoaded = false;
let pendingGeometry = null;

// ============================================================
// GOOGLE MAPS
// ============================================================
function loadGoogleMaps() {
  if (window.google?.maps) return Promise.resolve();
  if (window._googleMapsPromise) return window._googleMapsPromise;
  window._googleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}`;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return window._googleMapsPromise;
}

async function initGoogleMap() {
  await loadGoogleMaps();

  googleMap = new google.maps.Map(document.getElementById('google-map'), {
    center: { lat: INITIAL_CENTER[1], lng: INITIAL_CENTER[0] },
    zoom: INITIAL_ZOOM + 1, // Google zoom offset (+1 for tile size parity)
    mapId: 'DEMO_MAP_ID',
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    suppressMarkers: true, // We add our own markers
  });
  directionsRenderer.setMap(googleMap);

  googleMap.addListener('click', (e) => {
    handleMapClick(e.latLng.lat(), e.latLng.lng());
  });

  ['center_changed', 'zoom_changed'].forEach((event) => {
    googleMap.addListener(event, syncFromGoogle);
  });
}

// ============================================================
// MAPBOX
// ============================================================
function initMapboxMap() {
  mapboxMap = new mapboxgl.Map({
    container: 'mapbox-map',
    style: 'mapbox://styles/kenji-shima/cmmtz45at001501sm99f0eima',
    center: INITIAL_CENTER,
    zoom: INITIAL_ZOOM,
  });

  mapboxMap.on('load', () => {
    mapboxStyleLoaded = true;

    const firstSymbol = mapboxMap.getStyle().layers.find(
      l => l.type === 'symbol' && !l.id.startsWith('tunnel')
    );
    const beforeId = firstSymbol ? firstSymbol.id : undefined;

    // Route source
    mapboxMap.addSource('route', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });

    // Casing layer (wider, slightly transparent)
    mapboxMap.addLayer({
      id: 'route-line-casing',
      type: 'line',
      source: 'route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#1a56c4',
        'line-width': 8,
        'line-opacity': 0.8,
      },
    }, beforeId);

    // Main route line (thinner, on top)
    mapboxMap.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': '#4285f4',
        'line-width': 5,
        'line-opacity': 0.9,
      },
    }, beforeId);

    if (pendingGeometry) {
      mapboxMap.getSource('route').setData({ type: 'Feature', geometry: pendingGeometry, properties: {} });
      pendingGeometry = null;
    }
  });

  mapboxMap.on('click', (e) => {
    handleMapClick(e.lngLat.lat, e.lngLat.lng);
  });

  mapboxMap.on('move', syncFromMapbox);
}

// ============================================================
// MAP SYNC
// ============================================================
const SYNC_EPSILON = 1e-6;

function syncFromGoogle() {
  if (isSyncing || !mapboxMap) return;

  const center = googleMap.getCenter();
  const newLat = center.lat();
  const newLng = center.lng();
  const newZoom = googleMap.getZoom() - 1;
  const cur = mapboxMap.getCenter();

  if (
    Math.abs(newLat - cur.lat) < SYNC_EPSILON &&
    Math.abs(newLng - cur.lng) < SYNC_EPSILON &&
    Math.abs(newZoom - mapboxMap.getZoom()) < SYNC_EPSILON
  ) return;

  isSyncing = true;
  mapboxMap.jumpTo({ center: [newLng, newLat], zoom: newZoom });
  requestAnimationFrame(() => { isSyncing = false; });
}

function syncFromMapbox() {
  if (isSyncing || !googleMap) return;

  const center = mapboxMap.getCenter();
  const newLat = center.lat;
  const newLng = center.lng;
  const newZoom = mapboxMap.getZoom() + 1;
  const cur = googleMap.getCenter();

  if (
    Math.abs(newLat - cur.lat()) < SYNC_EPSILON &&
    Math.abs(newLng - cur.lng()) < SYNC_EPSILON &&
    Math.abs(newZoom - googleMap.getZoom()) < SYNC_EPSILON
  ) return;

  isSyncing = true;
  googleMap.setOptions({ center: { lat: newLat, lng: newLng }, zoom: newZoom });
  requestAnimationFrame(() => { isSyncing = false; });
}

// ============================================================
// MARKERS
// ============================================================

/**
 * Creates the custom HTML element for a Mapbox origin marker (circle with "A").
 * @returns {HTMLElement}
 */
function createOriginElement() {
  const el = document.createElement('div');
  Object.assign(el.style, {
    width: '32px',
    height: '32px',
    background: '#34a853',
    borderRadius: '50%',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    border: '2px solid white',
    boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
    cursor: 'default',
  });
  el.textContent = 'A';
  return el;
}

/**
 * Creates the custom HTML element for a Mapbox destination marker (rotated square with "B").
 * @returns {HTMLElement}
 */
function createDestinationElement() {
  const el = document.createElement('div');
  Object.assign(el.style, {
    width: '32px',
    height: '32px',
    background: '#ea4335',
    borderRadius: '50%',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    border: '2px solid white',
    boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
    cursor: 'default',
  });
  el.textContent = 'B';
  return el;
}

/**
 * Places markers for origin or destination on both maps.
 * @param {'origin'|'destination'} type
 * @param {number} lat
 * @param {number} lng
 */
function placeMarkers(type, lat, lng) {
  if (type === 'origin') {
    // Mapbox origin
    if (mapboxOriginMarker) mapboxOriginMarker.remove();
    mapboxOriginMarker = new mapboxgl.Marker({ element: createOriginElement() })
      .setLngLat([lng, lat])
      .addTo(mapboxMap);

    // Google origin
    if (googleOriginMarker) googleOriginMarker.setMap(null);
    googleOriginMarker = new google.maps.Marker({
      position: { lat, lng },
      map: googleMap,
      label: { text: 'A', color: 'white', fontWeight: 'bold' },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 14,
        fillColor: '#34a853',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
      zIndex: 1000,
    });
  } else {
    // Mapbox destination
    if (mapboxDestMarker) mapboxDestMarker.remove();
    mapboxDestMarker = new mapboxgl.Marker({ element: createDestinationElement() })
      .setLngLat([lng, lat])
      .addTo(mapboxMap);

    // Google destination
    if (googleDestMarker) googleDestMarker.setMap(null);
    googleDestMarker = new google.maps.Marker({
      position: { lat, lng },
      map: googleMap,
      label: { text: 'B', color: 'white', fontWeight: 'bold' },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 14,
        fillColor: '#ea4335',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
      zIndex: 1000,
    });
  }
}

// ============================================================
// CLICK HANDLER
// ============================================================

/**
 * Handles a map click on either the Mapbox or Google map.
 * @param {number} lat
 * @param {number} lng
 */
function handleMapClick(lat, lng) {
  const type = state.clickMode;

  if (type === 'origin') {
    state.origin = { lat, lng };
    // Auto-advance to destination mode after placing origin
    if (!state.destination) {
      state.clickMode = 'destination';
      document.getElementById('btn-destination').classList.add('active');
      document.getElementById('btn-origin').classList.remove('active');
    }
  } else {
    state.destination = { lat, lng };
  }

  placeMarkers(type, lat, lng);
  updateHints();

  if (state.origin && state.destination) {
    fetchBothRoutes();
  }
}

// ============================================================
// DIRECTIONS - FETCH
// ============================================================

/**
 * Fetches routes from both APIs in parallel and updates result panels.
 */
async function fetchBothRoutes() {
  const fetchId = ++currentFetchId;
  const loadingHTML = `
    <div class="loading-indicator">
      <div class="spinner"></div>
      <span>ルートを取得中...</span>
    </div>`;

  document.getElementById('mapbox-result-content').innerHTML = loadingHTML;
  document.getElementById('google-result-content').innerHTML = loadingHTML;

  const controls = ['btn-origin', 'btn-destination', 'travel-mode', 'clear-btn', 'mapbox-avoid-btn', 'google-avoid-btn', 'mapbox-execute-btn', 'google-execute-btn'];
  controls.forEach(id => document.getElementById(id).disabled = true);
  try {
    await Promise.all([fetchMapboxRoute(fetchId), fetchGoogleRoute(fetchId)]);
  } finally {
    controls.forEach(id => document.getElementById(id).disabled = false);
  }
}

/**
 * Fetches a route from the Mapbox Directions API and renders the result.
 */
async function fetchMapboxRoute(fetchId) {
  const { origin, destination, travelMode } = state;

  const profileMap = { driving: 'driving', walking: 'walking', cycling: 'cycling' };
  const profile = profileMap[travelMode] || 'driving';

  const excludeParam = state.mapboxExclude.length > 0
    ? `&exclude=${state.mapboxExclude.join(',')}`
    : '';

  const url =
    `https://api.mapbox.com/directions/v5/mapbox/${profile}/` +
    `${origin.lng},${origin.lat};${destination.lng},${destination.lat}` +
    `?steps=true&geometries=geojson&overview=full&language=ja` +
    `${excludeParam}` +
    `&access_token=${mapboxgl.accessToken}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${data.message || res.statusText}`);
    }

    if (fetchId !== currentFetchId) return;

    if (!data.routes || data.routes.length === 0) {
      showErrorPlaceholder('mapbox-result-content', 'ルートが見つかりませんでした。');
      return;
    }

    const route = data.routes[0];

    // Update route geometry on map
    const geom = { type: 'Feature', geometry: route.geometry, properties: {} };
    if (mapboxStyleLoaded && mapboxMap.getSource('route')) {
      mapboxMap.getSource('route').setData(geom);
    } else {
      pendingGeometry = route.geometry;
    }

    renderMapboxResult(route);
  } catch (err) {
    console.error('Mapbox Directions error:', err);
    showErrorPlaceholder('mapbox-result-content', 'ルートの取得に失敗しました。');
  }
}

/**
 * Fetches a route from the Google Directions API and renders the result.
 */
function fetchGoogleRoute(fetchId) {
  return new Promise((resolve) => {
    const { origin, destination, travelMode } = state;

    const modeMap = {
      driving: google.maps.TravelMode.DRIVING,
      walking: google.maps.TravelMode.WALKING,
      cycling: google.maps.TravelMode.BICYCLING,
    };

    directionsService.route(
      {
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        travelMode: modeMap[travelMode] || google.maps.TravelMode.DRIVING,
        avoidTolls: state.googleAvoid.includes('tolls'),
        avoidHighways: state.googleAvoid.includes('highways'),
        avoidFerries: state.googleAvoid.includes('ferries'),
      },
      (result, status) => {
        if (fetchId !== currentFetchId) { resolve(); return; }
        if (status === google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(result);
          renderGoogleResult(result.routes[0]);
        } else {
          console.error('Google Directions error:', status);
          showErrorPlaceholder('google-result-content', `ルートが見つかりませんでした (${status})。`);
        }
        resolve();
      }
    );
  });
}

// ============================================================
// DIRECTIONS - RESULT RENDERING
// ============================================================

/**
 * Formats seconds into a human-readable duration value string.
 * @param {number} seconds
 * @returns {string}
 */
function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h > 0) return m > 0 ? `${h}h ${m}` : `${h}`;
  return m > 0 ? `${m}` : '<1';
}

/**
 * Returns the unit label for a formatted duration.
 * @param {number} seconds
 * @returns {string}
 */
function formatDurationUnit(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h > 0) return m > 0 ? 'm' : 'h';
  return 'min';
}

/**
 * Formats meters into a human-readable distance value string.
 * @param {number} m
 * @returns {string}
 */
function formatDistance(m) {
  return m >= 1000 ? (m / 1000).toFixed(1) : Math.round(m).toString();
}

/**
 * Returns the unit label for a distance in meters.
 * @param {number} m
 * @returns {string}
 */
function formatDistanceUnit(m) {
  return m >= 1000 ? 'km' : 'm';
}

/**
 * Builds the shared result panel HTML.
 * @param {object} opts
 * @param {number}   opts.durationSec
 * @param {number}   opts.distanceM
 * @param {string}   [opts.summary]
 * @param {string[]} opts.stepTexts  - plain-text step instructions
 * @returns {string}
 */
function buildResultHTML({ durationSec, distanceM, summary, stepTexts }) {
  const totalSteps = stepTexts.length;
  const visibleSteps = stepTexts.slice(0, 8);

  const summaryHTML = summary
    ? `<div class="route-info">経由: ${summary}</div>`
    : '';

  const stepsHTML = visibleSteps
    .map(
      (text, i) => `
        <div class="step-item">
          <span class="step-number">${i + 1}</span>
          <span class="step-text">${text}</span>
        </div>`
    )
    .join('');

  const moreHTML =
    totalSteps > 8
      ? `<div style="font-size: 12px; color: #999; padding: 6px 0;">... 他${totalSteps - 8}ステップ</div>`
      : '';

  return `
    <div class="result-summary">
      <div class="metric-card">
        <div class="metric-label">所要時間</div>
        <div class="metric-value">${formatDuration(durationSec)}<span class="metric-unit">${formatDurationUnit(durationSec)}</span></div>
      </div>
      <div class="metric-card">
        <div class="metric-label">距離</div>
        <div class="metric-value">${formatDistance(distanceM)}<span class="metric-unit">${formatDistanceUnit(distanceM)}</span></div>
      </div>
    </div>
    ${summaryHTML}
    <div class="steps-title">ステップ (全${totalSteps}件)</div>
    ${stepsHTML}
    ${moreHTML}
  `;
}

/**
 * Renders a Mapbox Directions route into the left result panel.
 * @param {object} route - routes[0] from the Mapbox Directions API response
 */
function renderMapboxResult(route) {
  const durationSec = route.duration;
  const distanceM = route.distance;
  const summary = route.legs[0]?.summary || '';
  const stepTexts = (route.legs[0]?.steps || []).map((s) => s.maneuver?.instruction || '');

  document.getElementById('mapbox-result-content').innerHTML = buildResultHTML({
    durationSec,
    distanceM,
    summary,
    stepTexts,
  });
}

/**
 * Renders a Google Directions route into the right result panel.
 * @param {object} route - routes[0] from the Google Directions API response
 */
function renderGoogleResult(route) {
  const leg = route.legs[0];
  const durationSec = leg.duration.value;
  const distanceM = leg.distance.value;
  const summary = route.summary || '';

  // Keep <b> formatting from Google instructions, strip other tags
  const stepTexts = (leg.steps || []).map((s) =>
    (s.instructions || '').replace(/<(?!\/?b\b)[^>]*>/gi, '')
  );

  document.getElementById('google-result-content').innerHTML = buildResultHTML({
    durationSec,
    distanceM,
    summary,
    stepTexts,
  });
}

/**
 * Displays an error message in a result panel.
 * @param {string} panelId
 * @param {string} message
 */
function showErrorPlaceholder(panelId, message) {
  document.getElementById(panelId).innerHTML = `
    <div class="error-placeholder" style="padding: 24px; color: #ea4335; font-size: 14px;">
      ${message}
    </div>`;
}

// ============================================================
// CLEAR
// ============================================================

/**
 * Resets all markers, routes, and state to the initial empty state.
 */
function clearAll() {
  state.origin = null;
  state.destination = null;
  state.clickMode = 'origin';
  document.getElementById('btn-origin').classList.add('active');
  document.getElementById('btn-destination').classList.remove('active');

  // Remove Mapbox markers
  if (mapboxOriginMarker) { mapboxOriginMarker.remove(); mapboxOriginMarker = null; }
  if (mapboxDestMarker) { mapboxDestMarker.remove(); mapboxDestMarker = null; }

  // Remove Google markers
  if (googleOriginMarker) { googleOriginMarker.setMap(null); googleOriginMarker = null; }
  if (googleDestMarker) { googleDestMarker.setMap(null); googleDestMarker = null; }

  // Clear Mapbox route
  const source = mapboxMap.getSource('route');
  if (source) {
    source.setData({ type: 'FeatureCollection', features: [] });
  }

  // Clear Google route
  if (directionsRenderer) {
    directionsRenderer.setMap(null);
    directionsRenderer.setMap(googleMap);
  }

  // Reset result panels to placeholder
  const placeholder = `<div class="result-placeholder" style="padding: 24px; color: #999; font-size: 14px; text-align: center;">出発地と目的地を設定するとルートが表示されます</div>`;
  document.getElementById('mapbox-result-content').innerHTML = placeholder;
  document.getElementById('google-result-content').innerHTML = placeholder;

  updateHints();
}

// ============================================================
// HINTS
// ============================================================

/**
 * Updates the hint overlay text on both maps based on current state.
 */
function updateHints() {
  let text;
  if (!state.origin) {
    text = 'クリックして出発地 (A) を設定';
  } else if (!state.destination) {
    text = 'クリックして目的地 (B) を設定';
  } else {
    const label = state.clickMode === 'origin' ? '出発地 (A)' : '目的地 (B)';
    text = `クリックして${label}を移動`;
  }

  document.getElementById('mapbox-hint').textContent = text;
  document.getElementById('google-hint').textContent = text;
}

// ============================================================
// PRESET ROUTES
// ============================================================

// Groups: [{ name, origin: feature, destination: feature }, ...]
let presetGroups = [];

async function loadPresetRoutes() {
  try {
    const res = await fetch('/cbcloud-routes.geojson');
    const data = await res.json();
    const features = data.features || [];

    // Group paired features by route name, preserving order
    const map = new Map();
    features.forEach(f => {
      const name = f.properties.route;
      if (!map.has(name)) map.set(name, { name, origin: null, destination: null });
      map.get(name)[f.properties.role] = f;
    });
    presetGroups = [...map.values()].filter(g => g.origin && g.destination);

    const select = document.getElementById('route-preset');
    presetGroups.forEach((group, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = group.name;
      select.appendChild(opt);
    });
  } catch (err) {
    console.error('Failed to load preset routes:', err);
  }
}

async function geocodeV6(address) {
  const url =
    `https://api.mapbox.com/search/geocode/v6/forward` +
    `?q=${encodeURIComponent(address)}&country=JP&language=ja` +
    `&access_token=${mapboxgl.accessToken}`;
  const res = await fetch(url);
  const data = await res.json();
  const feature = data.features?.[0];
  if (!feature) throw new Error(`No geocode result for: ${address}`);
  const [lng, lat] = feature.geometry.coordinates;
  return { lat, lng };
}

async function applyPresetRoute(group) {
  const select = document.getElementById('route-preset');
  select.disabled = true;
  try {
    const [origin, destination] = await Promise.all([
      geocodeV6(group.origin.properties.address),
      geocodeV6(group.destination.properties.address),
    ]);

    state.origin      = origin;
    state.destination = destination;
    state.clickMode   = 'origin';

    document.getElementById('btn-origin').classList.add('active');
    document.getElementById('btn-destination').classList.remove('active');

    placeMarkers('origin',      origin.lat,      origin.lng);
    placeMarkers('destination', destination.lat, destination.lng);
    updateHints();

    // Fit Mapbox — sync carries Google along
    mapboxMap.fitBounds(
      [[origin.lng, origin.lat], [destination.lng, destination.lat]],
      { padding: 80, duration: 600 }
    );

    fetchBothRoutes();
  } catch (err) {
    console.error('Preset route error:', err);
  } finally {
    select.disabled = false;
  }
}

// ============================================================
// AVOID DROPDOWNS
// ============================================================

function closeAllDropdowns() {
  document.querySelectorAll('.avoid-dropdown.open').forEach(d => d.classList.remove('open'));
}

function updateAvoidBtnLabel(btn, values) {
  btn.textContent = values.length === 0
    ? 'Avoid \u25be'
    : `Avoid: ${values.join(', ')} \u25be`;
}

function setupAvoidDropdowns() {
  // Mapbox
  const mapboxDropdown = document.getElementById('mapbox-avoid-dropdown');
  const mapboxBtn = document.getElementById('mapbox-avoid-btn');
  const mapboxCheckboxes = mapboxDropdown.querySelectorAll('input[type="checkbox"]');

  mapboxBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = mapboxDropdown.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) mapboxDropdown.classList.add('open');
  });

  mapboxDropdown.querySelector('.avoid-panel').addEventListener('click', (e) => {
    e.stopPropagation();
  });

  mapboxCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      state.mapboxExclude = [...mapboxCheckboxes].filter(c => c.checked).map(c => c.value);
      updateAvoidBtnLabel(mapboxBtn, state.mapboxExclude);
    });
  });

  // Google
  const googleDropdown = document.getElementById('google-avoid-dropdown');
  const googleBtn = document.getElementById('google-avoid-btn');
  const googleCheckboxes = googleDropdown.querySelectorAll('input[type="checkbox"]');

  googleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = googleDropdown.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) googleDropdown.classList.add('open');
  });

  googleDropdown.querySelector('.avoid-panel').addEventListener('click', (e) => {
    e.stopPropagation();
  });

  googleCheckboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      state.googleAvoid = [...googleCheckboxes].filter(c => c.checked).map(c => c.value);
      updateAvoidBtnLabel(googleBtn, state.googleAvoid);
    });
  });

  // Execute buttons
  document.getElementById('mapbox-execute-btn').addEventListener('click', () => {
    if (state.origin && state.destination) fetchBothRoutes();
  });
  document.getElementById('google-execute-btn').addEventListener('click', () => {
    if (state.origin && state.destination) fetchBothRoutes();
  });

  // Close when clicking outside any dropdown
  document.addEventListener('click', closeAllDropdowns);
}

// ============================================================
// EVENT HANDLERS
// ============================================================

function setupEventListeners() {
  // Origin / Destination mode toggle
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

  // Travel mode
  document.getElementById('travel-mode').addEventListener('change', (e) => {
    state.travelMode = e.target.value;
    if (state.origin && state.destination) {
      fetchBothRoutes();
    }
  });

  // Clear
  document.getElementById('clear-btn').addEventListener('click', clearAll);

  setupAvoidDropdowns();

  // Preset route dropdown
  document.getElementById('route-preset').addEventListener('change', (e) => {
    const idx = e.target.value;
    if (idx === '') return;
    applyPresetRoute(presetGroups[Number(idx)]);
  });
}

// ============================================================
// INITIALIZATION
// ============================================================

function setupGoogleKeyInput() {
  const input = document.getElementById('google-key-input');
  const btn   = document.getElementById('google-key-btn');

  if (googleApiKey) input.value = googleApiKey;

  function saveKey() {
    const val = input.value.trim();
    if (!val) return;
    localStorage.setItem(GOOGLE_KEY_STORAGE, val);
    location.reload();
  }

  btn.addEventListener('click', saveKey);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveKey(); });
}

async function init() {
  setupEventListeners();
  setupGoogleKeyInput();
  updateHints();
  initMapboxMap();
  loadPresetRoutes();

  if (googleApiKey) {
    await initGoogleMap();
  } else {
    document.getElementById('google-map').innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;font-size:13px;">Google API Keyを入力してください</div>';
  }
}

init();
