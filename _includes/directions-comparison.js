// ============================================================
// CONSTANTS
// ============================================================
const GOOGLE_KEY_STORAGE = 'directions_google_api_key';

const MAPBOX_TURN_ANGLE_THRESHOLD = 20; // degrees — below this is considered straight

function bearingDelta(before, after) {
  return Math.abs(((after - before) + 540) % 360 - 180);
}

// A step is a turn if the heading changes by at least the threshold,
// excluding depart/arrive/notification which have no meaningful bearing.
const MAPBOX_NO_TURN_TYPES = new Set(['depart', 'arrive', 'notification']);

function isMapboxTurn(step) {
  if (MAPBOX_NO_TURN_TYPES.has(step.maneuver?.type)) return false;
  const delta = bearingDelta(step.maneuver.bearing_before, step.maneuver.bearing_after);
  return delta >= MAPBOX_TURN_ANGLE_THRESHOLD;
}

const GOOGLE_TURN_MANEUVERS = new Set([
  'turn-slight-left', 'turn-sharp-left', 'uturn-left', 'turn-left',
  'turn-slight-right', 'turn-sharp-right', 'uturn-right', 'turn-right',
  'roundabout-left', 'roundabout-right',
]);
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

let mapboxTurnMarkers = [];
let googleTurnMarkers = [];

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
 * Creates the custom HTML element for a numbered turn marker.
 * @param {number} index - 0-based turn index
 * @returns {HTMLElement}
 */
function createTurnMarkerElement(index) {
  const el = document.createElement('div');
  Object.assign(el.style, {
    width: '20px',
    height: '20px',
    background: '#f5a623',
    borderRadius: '50%',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 'bold',
    border: '2px solid white',
    boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
    cursor: 'default',
  });
  el.textContent = index + 1;
  return el;
}

/**
 * Removes all turn markers from both maps.
 */
function clearTurnMarkers() {
  mapboxTurnMarkers.forEach(m => m.remove());
  mapboxTurnMarkers = [];
  googleTurnMarkers.forEach(m => m.setMap(null));
  googleTurnMarkers = [];
}

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
  clearTurnMarkers();
  const fetchId = ++currentFetchId;
  const loadingHTML = `
    <div class="loading-indicator">
      <div class="spinner"></div>
      <span>ルートを取得中...</span>
    </div>`;

  document.getElementById('mapbox-result-content').innerHTML = loadingHTML;

  // Google Directions API does not support cycling in Japan — show notice immediately
  if (state.travelMode === 'cycling') {
    document.getElementById('google-result-content').innerHTML = `
      <div class="result-placeholder" style="padding: 24px; color: #999; font-size: 13px; text-align: center;">
        <span class="icon">🚲</span>
        <span>Google Directions API は日本での自転車ルートに対応していません</span>
      </div>`;
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
      directionsRenderer.setMap(googleMap);
    }
  } else {
    document.getElementById('google-result-content').innerHTML = loadingHTML;
  }

  const controls = ['btn-origin', 'btn-destination', 'travel-mode', 'clear-btn', 'mapbox-avoid-btn', 'google-avoid-btn', 'mapbox-execute-btn', 'google-execute-btn'];
  controls.forEach(id => document.getElementById(id).disabled = true);
  try {
    const tasks = [fetchMapboxRoute(fetchId)];
    if (state.travelMode !== 'cycling') tasks.push(fetchGoogleRoute(fetchId));
    await Promise.all(tasks);
  } finally {
    controls.forEach(id => document.getElementById(id).disabled = false);
  }
}

/**
 * Fetches a route from the Mapbox Directions API and renders the result.
 */
async function fetchMapboxRoute(fetchId) {
  const { origin, destination, travelMode } = state;

  const profileMap = { driving: 'mapbox.tmp.valhalla-zenrin/driving', 'driving-traffic': 'mapbox.tmp.valhalla-zenrin-premium/driving-traffic', walking: 'mapbox.tmp.valhalla-zenrin/walking', cycling: 'mapbox.tmp.valhalla-zenrin/cycling' };
  const profile = profileMap[travelMode] || 'driving';

  const excludeParam = state.mapboxExclude.length > 0
    ? `&exclude=${state.mapboxExclude.join(',')}`
    : '';

  const url =
    `https://api.mapbox.com/directions/v5/${profile}/` +
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
      'driving-traffic': google.maps.TravelMode.DRIVING,
      walking: google.maps.TravelMode.WALKING,
      cycling: google.maps.TravelMode.BICYCLING,
    };

    const requestParams = {
      origin: { lat: origin.lat, lng: origin.lng },
      destination: { lat: destination.lat, lng: destination.lng },
      travelMode: modeMap[travelMode] || google.maps.TravelMode.DRIVING,
      avoidTolls: state.googleAvoid.includes('tolls'),
      avoidHighways: state.googleAvoid.includes('highways'),
      avoidFerries: state.googleAvoid.includes('ferries'),
    };

    // driving-traffic: request traffic-aware duration (Google equivalent)
    if (travelMode === 'driving-traffic') {
      requestParams.drivingOptions = {
        departureTime: new Date(),
        trafficModel: google.maps.TrafficModel.BEST_GUESS,
      };
    }

    directionsService.route(
      requestParams,
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
 * @param {number}   opts.turnCount
 * @param {string}   [opts.summary]
 * @param {string[]} opts.stepTexts  - plain-text step instructions
 * @returns {string}
 */
function buildResultHTML({ durationSec, distanceM, turnCount, summary, stepTexts }) {
  const totalSteps = stepTexts.length;

  const summaryHTML = summary
    ? `<div class="route-info">経由: ${summary}</div>`
    : '';

  const stepsHTML = stepTexts
    .map(
      (text, i) => `
        <div class="step-item">
          <span class="step-number">${i + 1}</span>
          <span class="step-text">${text}</span>
        </div>`
    )
    .join('');

  const moreHTML = '';

  return `
    <div class="result-summary" style="grid-template-columns: 1fr 1fr 1fr;">
      <div class="metric-card">
        <div class="metric-label">所要時間</div>
        <div class="metric-value">${formatDuration(durationSec)}<span class="metric-unit">${formatDurationUnit(durationSec)}</span></div>
      </div>
      <div class="metric-card">
        <div class="metric-label">距離</div>
        <div class="metric-value">${formatDistance(distanceM)}<span class="metric-unit">${formatDistanceUnit(distanceM)}</span></div>
      </div>
      <div class="metric-card">
        <div class="metric-label">右左折</div>
        <div class="metric-value">${turnCount}<span class="metric-unit">回</span></div>
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
  const steps = route.legs[0]?.steps || [];
  const stepTexts = steps.map((s) => s.maneuver?.instruction || '');
  const turnSteps = steps.filter(isMapboxTurn);

  // Debug: log every maneuver with its type and whether it was counted
  let turnIdx = 0;
  console.group(`[Mapbox] maneuvers (${steps.length} steps, ${turnSteps.length} turns)`);
  steps.forEach((s) => {
    const counted = isMapboxTurn(s);
    const delta = MAPBOX_NO_TURN_TYPES.has(s.maneuver?.type)
      ? '  n/a'
      : String(Math.round(bearingDelta(s.maneuver.bearing_before, s.maneuver.bearing_after))).padStart(4) + '°';
    const label = counted ? `✅ #${++turnIdx}` : '  —  ';
    console.log(`${label}  ${delta}  [${s.maneuver?.type}]  ${s.maneuver?.instruction || ''}`);
  });
  console.groupEnd();

  // Place numbered markers at each turn point
  turnSteps.forEach((step, i) => {
    const [lng, lat] = step.maneuver.location;
    const marker = new mapboxgl.Marker({ element: createTurnMarkerElement(i) })
      .setLngLat([lng, lat])
      .addTo(mapboxMap);
    mapboxTurnMarkers.push(marker);
  });

  document.getElementById('mapbox-result-content').innerHTML = buildResultHTML({
    durationSec,
    distanceM,
    turnCount: turnSteps.length,
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
  // Prefer duration_in_traffic when available (driving-traffic mode)
  const durationSec = (leg.duration_in_traffic ?? leg.duration).value;
  const distanceM = leg.distance.value;
  const summary = route.summary || '';
  const steps = leg.steps || [];

  // Keep <b> formatting from Google instructions, strip other tags
  const stepTexts = steps.map((s) =>
    (s.instructions || '').replace(/<(?!\/?b\b)[^>]*>/gi, '')
  );
  const turnSteps = steps.filter((s) => GOOGLE_TURN_MANEUVERS.has(s.maneuver));

  // Debug: log every maneuver with its type and whether it was counted
  let turnIdx = 0;
  console.group(`[Google] maneuvers (${steps.length} steps, ${turnSteps.length} turns)`);
  steps.forEach((s) => {
    const counted = GOOGLE_TURN_MANEUVERS.has(s.maneuver);
    const label = counted ? `✅ #${++turnIdx}` : '  —  ';
    console.log(`${label}  [${s.maneuver || '(none)'}]  ${(s.instructions || '').replace(/<[^>]*>/g, '')}`);
  });
  console.groupEnd();

  // Place numbered markers at each turn point
  turnSteps.forEach((step, i) => {
    const marker = new google.maps.Marker({
      position: step.start_location,
      map: googleMap,
      label: { text: String(i + 1), color: 'white', fontSize: '10px', fontWeight: 'bold' },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#f5a623',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
      zIndex: 500,
    });
    googleTurnMarkers.push(marker);
  });

  document.getElementById('google-result-content').innerHTML = buildResultHTML({
    durationSec,
    distanceM,
    turnCount: turnSteps.length,
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
// BATCH RUN
// ============================================================

let batchResults = [];
let batchCompleted = 0;

/**
 * Fetches a Mapbox route and returns metrics only — no map or UI update.
 */
async function fetchMapboxRouteData(origin, destination) {
  const profileMap = { driving: 'driving', 'driving-traffic': 'driving-traffic', walking: 'walking', cycling: 'cycling' };
  const profile = profileMap[state.travelMode] || 'driving';
  const excludeParam = state.mapboxExclude.length > 0 ? `&exclude=${state.mapboxExclude.join(',')}` : '';

  const url =
    `https://api.mapbox.com/directions/v5/mapbox.tmp.valhalla-zenrin-premium/${profile}/` +
    `${origin.lng},${origin.lat};${destination.lng},${destination.lat}` +
    `?steps=true&geometries=polyline&overview=false&language=ja` +
    `${excludeParam}` +
    `&access_token=${mapboxgl.accessToken}`;

  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${data.message || res.statusText}`);
  if (!data.routes?.length) throw new Error('ルートなし');

  const route = data.routes[0];
  const steps = route.legs[0]?.steps || [];
  return {
    durationSec: route.duration,
    distanceM: route.distance,
    turnCount: steps.filter(isMapboxTurn).length,
    stepCount: steps.length,
  };
}

/**
 * Fetches a Google route and returns metrics only — no map or UI update.
 */
function fetchGoogleRouteData(origin, destination) {
  return new Promise((resolve, reject) => {
    const modeMap = {
      driving: google.maps.TravelMode.DRIVING,
      'driving-traffic': google.maps.TravelMode.DRIVING,
      walking: google.maps.TravelMode.WALKING,
      cycling: google.maps.TravelMode.BICYCLING,
    };

    const requestParams = {
      origin: { lat: origin.lat, lng: origin.lng },
      destination: { lat: destination.lat, lng: destination.lng },
      travelMode: modeMap[state.travelMode] || google.maps.TravelMode.DRIVING,
      avoidTolls: state.googleAvoid.includes('tolls'),
      avoidHighways: state.googleAvoid.includes('highways'),
      avoidFerries: state.googleAvoid.includes('ferries'),
    };

    if (state.travelMode === 'driving-traffic') {
      requestParams.drivingOptions = {
        departureTime: new Date(),
        trafficModel: google.maps.TrafficModel.BEST_GUESS,
      };
    }

    directionsService.route(requestParams, (result, status) => {
      if (status !== google.maps.DirectionsStatus.OK) {
        reject(new Error(status));
        return;
      }
      const leg = result.routes[0].legs[0];
      const durationSec = (leg.duration_in_traffic ?? leg.duration).value;
      const steps = leg.steps || [];
      resolve({
        durationSec,
        distanceM: leg.distance.value,
        turnCount: steps.filter(s => GOOGLE_TURN_MANEUVERS.has(s.maneuver)).length,
        stepCount: steps.length,
      });
    });
  });
}

/**
 * Renders one batch table row once its route data is available.
 */
function renderBatchCells(data, error, skipped) {
  if (skipped) {
    return '<td colspan="4" class="batch-cell-skip">—</td>';
  }
  if (error) {
    return `<td colspan="4" class="batch-cell-error">${error}</td>`;
  }
  return `
    <td>${formatDuration(data.durationSec)}<span class="metric-unit">${formatDurationUnit(data.durationSec)}</span></td>
    <td>${formatDistance(data.distanceM)}<span class="metric-unit">${formatDistanceUnit(data.distanceM)}</span></td>
    <td>${data.turnCount}</td>
    <td>${data.stepCount}</td>
  `;
}

/**
 * Renders 4 Δ cells (Mapbox − Google), calculated after rounding each side.
 * Time Δ in minutes, distance Δ in km (1 decimal).
 */
function renderDeltaCells(m, g, googleSkipped) {
  if (googleSkipped || !m || !g) {
    return '<td colspan="4" class="batch-cell-skip">—</td>';
  }

  const timeΔ = Math.round(m.durationSec / 60) - Math.round(g.durationSec / 60);
  const distΔ = parseFloat((m.distanceM / 1000).toFixed(1)) - parseFloat((g.distanceM / 1000).toFixed(1));
  const turnΔ = m.turnCount - g.turnCount;
  const stepΔ = m.stepCount - g.stepCount;

  const cell = (v, unit) => {
    const sign = v > 0 ? '+' : '';
    return `<td>${sign}${v}<span class="metric-unit">${unit}</span></td>`;
  };
  const cellKm = (v) => {
    const sign = v > 0 ? '+' : '';
    return `<td>${sign}${v.toFixed(1)}<span class="metric-unit">km</span></td>`;
  };

  return `${cell(timeΔ, 'min')}${cellKm(distΔ)}${cell(turnΔ, '')}${cell(stepΔ, '')}`;
}

function updateBatchRow(i, mapboxData, mapboxError, googleData, googleError, googleSkipped) {
  const row = document.getElementById(`batch-row-${i}`);
  if (!row) return;
  row.innerHTML = `
    <td>${presetGroups[i].name}</td>
    ${renderBatchCells(mapboxData, mapboxError, false)}
    ${renderBatchCells(googleData, googleError, googleSkipped)}
    ${renderDeltaCells(mapboxData, googleData, googleSkipped)}
  `;
}

/**
 * Fetches both APIs for one preset route and updates its table row when done.
 * Results stream in as they complete; table order is preserved by row index.
 */
async function runRouteForBatch(group, i) {
  const googleSkipped = state.travelMode === 'cycling' || !googleApiKey || !directionsService;

  try {
    const [origin, destination] = await Promise.all([
      geocodeV6(group.origin.properties.address),
      geocodeV6(group.destination.properties.address),
    ]);

    const tasks = [fetchMapboxRouteData(origin, destination)];
    if (!googleSkipped) tasks.push(fetchGoogleRouteData(origin, destination));

    const [mapboxSettled, googleSettled] = await Promise.allSettled(
      googleSkipped ? [tasks[0], Promise.reject()] : tasks
    );

    const mapboxData  = mapboxSettled.status  === 'fulfilled' ? mapboxSettled.value  : null;
    const mapboxError = mapboxSettled.status  === 'rejected'  ? mapboxSettled.reason?.message || 'エラー' : null;
    const googleData  = googleSettled?.status === 'fulfilled' ? googleSettled.value  : null;
    const googleError = (!googleSkipped && googleSettled?.status === 'rejected')
      ? googleSettled.reason?.message || 'エラー' : null;

    batchResults[i] = { name: group.name, mapbox: mapboxData, google: googleData };
    updateBatchRow(i, mapboxData, mapboxError, googleData, googleError, googleSkipped);
  } catch (err) {
    batchResults[i] = { name: group.name, error: err.message };
    const row = document.getElementById(`batch-row-${i}`);
    if (row) row.innerHTML = `<td>${group.name}</td><td colspan="8" class="batch-cell-error">エラー: ${err.message}</td>`;
  }

  batchCompleted++;
  document.getElementById('batch-progress').textContent = `${batchCompleted} / ${presetGroups.length}`;
  if (batchCompleted === presetGroups.length) {
    document.getElementById('batch-csv-btn').disabled = false;
  }
}

async function runBatch() {
  batchCompleted = 0;
  batchResults = new Array(presetGroups.length).fill(null);

  // Pre-populate rows in dropdown order, each showing a loading state
  const tbody = document.getElementById('batch-tbody');
  tbody.innerHTML = presetGroups.map((g, i) => `
    <tr id="batch-row-${i}">
      <td>${g.name}</td>
      <td colspan="8" class="batch-cell-loading">処理中...</td>
    </tr>
  `).join('');

  document.getElementById('batch-progress').textContent = `0 / ${presetGroups.length}`;
  document.getElementById('batch-csv-btn').disabled = true;
  document.getElementById('batch-modal').classList.add('open');

  // All routes fire concurrently; rows update as each one resolves
  await Promise.all(presetGroups.map((group, i) => runRouteForBatch(group, i)));
}

function downloadBatchCSV() {
  const skipGoogle = state.travelMode === 'cycling' || !googleApiKey;
  const headers = [
    'ルート',
    'Mapbox 所要時間(min)', 'Mapbox 距離(km)', 'Mapbox 右左折', 'Mapbox ステップ数',
    'Google 所要時間(min)', 'Google 距離(km)', 'Google 右左折', 'Google ステップ数',
    'Δ 所要時間(min)', 'Δ 距離(km)', 'Δ 右左折', 'Δ ステップ数',
  ];

  const toMin = (sec) => Math.round(sec / 60);
  const toKm  = (m)   => (m / 1000).toFixed(2);

  const rows = batchResults.map((r) => {
    if (!r) return ['-', '', '', '', '', '', '', '', '', '', '', '', ''];
    const m = r.mapbox;
    const g = r.google;
    const na = skipGoogle ? 'スキップ' : 'エラー';

    // Compute Δ after rounding each side (same values shown in the table)
    const timeΔ = (m && g) ? toMin(m.durationSec) - toMin(g.durationSec) : '';
    const distΔ = (m && g) ? (parseFloat(toKm(m.distanceM)) - parseFloat(toKm(g.distanceM))).toFixed(2) : '';
    const turnΔ = (m && g) ? m.turnCount - g.turnCount : '';
    const stepΔ = (m && g) ? m.stepCount - g.stepCount : '';

    return [
      r.name,
      m ? toMin(m.durationSec) : 'エラー',
      m ? toKm(m.distanceM)   : 'エラー',
      m ? m.turnCount         : 'エラー',
      m ? m.stepCount         : 'エラー',
      g ? toMin(g.durationSec) : na,
      g ? toKm(g.distanceM)   : na,
      g ? g.turnCount         : na,
      g ? g.stepCount         : na,
      timeΔ, distΔ, turnΔ, stepΔ,
    ];
  });

  const csv = [headers, ...rows]
    .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `directions-batch-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
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

  clearTurnMarkers();

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
    const res = await fetch('cbcloud-routes.geojson');
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

    if (presetGroups.length > 0) {
      document.getElementById('batch-btn').disabled = false;
    }
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

  // Batch
  document.getElementById('batch-btn').addEventListener('click', runBatch);
  document.getElementById('batch-close-btn').addEventListener('click', () => {
    document.getElementById('batch-modal').classList.remove('open');
  });
  document.getElementById('batch-csv-btn').addEventListener('click', downloadBatchCSV);

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
