// ===================================================================
// DHL Mapbox GL JS Capabilities Demo
// ===================================================================

// ---- Mock Data ----

const SHIPMENT = {
  from: { lng: 8.6821, lat: 50.1109, label: 'Frankfurt Warehouse', address: 'Cargo City Süd, 60549 Frankfurt', departure: '2024-06-04 06:00', weight: '420 kg', dimensions: '120×80×75 cm' },
  to:   { lng: 4.9041, lat: 52.3676, label: 'Amsterdam Hub', address: 'Kelvinweg 5, 1097 AM Amsterdam', eta: '2024-06-04 14:30', contact: 'Jan de Vries' },
  latest: { lng: 6.8720, lat: 51.0520, label: 'Current Position', speed: '82 km/h', heading: 'NW', lastUpdate: '2024-06-04 10:17', driver: 'Thomas Müller', vehicle: 'DHL-TRK-0847' },
  milestones: [
    { lng: 7.5938, lat: 50.3569, label: 'Koblenz Checkpoint', arrived: '2024-06-04 07:45', status: 'Completed', duration: '5 min' },
    { lng: 6.9603, lat: 50.9333, label: 'Cologne Hub', arrived: '2024-06-04 09:10', status: 'Completed', duration: '20 min' },
    { lng: 6.7735, lat: 51.2217, label: 'Düsseldorf Stop', arrived: null, status: 'Upcoming', duration: '—' },
    { lng: 5.8987, lat: 51.9851, label: 'Arnhem Border', arrived: null, status: 'Upcoming', duration: '—' },
    { lng: 5.1214, lat: 52.0907, label: 'Utrecht Transfer', arrived: null, status: 'Upcoming', duration: '—' },
  ]
};

const ROUTE_COORDS = [
  [8.6821, 50.1109],[8.3500, 50.2500],[8.0000, 50.3800],
  [7.5938, 50.3569],[7.2500, 50.4500],[6.9603, 50.9333],
  [6.8720, 51.0520],[6.7735, 51.2217],[6.5000, 51.4000],
  [6.2000, 51.6500],[5.9500, 51.8800],[5.8987, 51.9851],
  [5.5000, 52.0500],[5.1214, 52.0907],[4.9800, 52.2200],
  [4.9041, 52.3676]
];

const TELEMETRY = ROUTE_COORDS.map((coord, i) => ({
  id: `tel-${i}`,
  coordinates: coord,
  timestamp: `2024-06-04 ${String(6 + Math.floor(i * 8 / 15)).padStart(2,'0')}:${String((i * 32) % 60).padStart(2,'0')}`,
  temp: +(2 + Math.abs(Math.sin(i * 1.3)) * 6).toFixed(1),
  humidity: +(40 + Math.abs(Math.cos(i * 0.9)) * 30).toFixed(0),
  shock: (i === 4 || i === 11) ? 1 : 0,
  battery: +(95 - i * 1.2).toFixed(0),
  alert: i === 4 ? 'shock_event' : i === 11 ? 'temp_excursion' : null
}));

const GEOFENCES = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', id: 'geo-fra', properties: { name: 'Frankfurt Warehouse Zone', type: 'warehouse', rule: 'notify_entry', color: '#22c55e' },
      geometry: { type: 'Polygon', coordinates: [[[8.4,49.95],[9.0,49.95],[9.0,50.25],[8.4,50.25],[8.4,49.95]]] } },
    { type: 'Feature', id: 'geo-cgn', properties: { name: 'Cologne Hub Zone', type: 'hub', rule: 'restrict_speed', color: '#f59e0b' },
      geometry: { type: 'Polygon', coordinates: [[[6.75,50.8],[7.15,50.8],[7.15,51.05],[6.75,51.05],[6.75,50.8]]] } },
    { type: 'Feature', id: 'geo-ams', properties: { name: 'Amsterdam Port — Restricted', type: 'restricted', rule: 'log_only', color: '#ef4444' },
      geometry: { type: 'Polygon', coordinates: [[[4.65,52.22],[5.15,52.22],[5.15,52.45],[4.65,52.45],[4.65,52.22]]] } },
  ]
};

function generateFleetData() {
  const statuses = ['in_transit','delivered','delayed','exception'];
  const origins = ['Frankfurt','Hamburg','Munich','Berlin','Rotterdam','Antwerp','Lyon','Madrid','Warsaw'];
  const dests   = ['Amsterdam','Brussels','Paris','London','Zürich','Vienna','Milan','Copenhagen','Dublin'];
  const features = [];
  for (let i = 0; i < 300; i++) {
    const a = Math.sin(i * 1.2345) * 0.5 + 0.5;
    const b = Math.cos(i * 2.3456) * 0.5 + 0.5;
    const c = Math.sin(i * 3.4567) * 0.5 + 0.5;
    const lng = -8 + a * 38;
    const lat = 36 + b * 28;
    const statusIdx = c < 0.52 ? 0 : c < 0.82 ? 1 : c < 0.95 ? 2 : 3;
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lng, lat] },
      properties: {
        id: i,
        parcel_id: `DHL${String(1000 + i).padStart(6,'0')}`,
        status: statuses[statusIdx],
        origin: origins[i % origins.length],
        destination: dests[i % dests.length],
        weight: +(0.5 + c * 30).toFixed(1)
      }
    });
  }
  return { type: 'FeatureCollection', features };
}

const FLEET_DATA = generateFleetData();

// ---- Helper ----
const toLngLat = c => [c.lng, c.lat];

function createRouteArrow() {
  const size = 20, cx = size / 2, cy = size / 2, t = size * 0.38;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.beginPath();
  ctx.moveTo(cx + t,       cy);
  ctx.lineTo(cx - t * 0.6, cy - t * 0.8);
  ctx.lineTo(cx - t * 0.6, cy + t * 0.8);
  ctx.closePath();
  ctx.fillStyle = 'white';
  ctx.fill();
  const d = ctx.getImageData(0, 0, size, size);
  return { width: size, height: size, data: new Uint8Array(d.data.buffer) };
}

// ---- State ----
let activeScenario = 0;
let animTimer = null;
let animStep = 0;
let activePopup = null;
const initializedScenarios = new Set();

let s7AnimId = null;
let s7Playing = false;
let s7ApexChart = null;
let case1Data = null;       // raw fetched JSON cache
let case2Data = null;       // raw fetched JSON cache
let case1PlannedGeo = null;     // active route geometry (raw or directions)
let case1RawGeo = null;         // plannedRoute.coordinates line (synthetic)
let case1DirectionsGeo = null;  // Directions API road geometry
let s7TotalKm = 0;
let s7SnapKm = [];          // active snapped km array
let s7SnapCoords = [];      // active snapped coords array
let s7RawSnapKm = [],  s7RawSnapCoords = [],  s7RawTotalKm = 0;
let s7DirSnapKm = [],  s7DirSnapCoords = [],  s7DirTotalKm = 0;
let s7UseDirections = false; // which route geometry is active
let s7Snapped = false;       // whether truck/trail use snapped or raw GPS coords
let s7Idx = 0;              // current telemetry reading index
let s7MaxIdx = 0;           // = telemetry.data.length - 1 = 249
let s7MatchedGeo = null;    // cached map-matched geometry
let s7ChartBounds = null;   // cached chart plot area bounds (relative to overlay)
let s8UseDirections = false;
let s8DirectionsGeos = {}; // routeId -> turf LineString of road geometry
let s8SelectedRouteId = '';

// ---- Map Styles ----
const MAP_STYLES = [
  { id: 'standard',   label: 'Standard',   url: 'mapbox://styles/mapbox/standard' },
  { id: 'satellite',  label: 'Satellite',  url: 'mapbox://styles/mapbox/satellite-streets-v12' },
  { id: 'light',      label: 'Light',      url: 'mapbox://styles/mapbox/light-v11' },
  { id: 'dark',       label: 'Dark',       url: 'mapbox://styles/mapbox/dark-v11' },
];
let mapFirstLoad = true;

// ---- Map Init ----
const map = new mapboxgl.Map({
  container: 'map',
  center: [6.5, 51.2],
  zoom: 5.5,
  attributionControl: false
});
map.addControl(new mapboxgl.NavigationControl(), 'top-right');
map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');

// ---- Icon helpers ----
function makeSVGImage(svg) {
  return new Promise(resolve => {
    const img = new Image(40, 40);
    img.onload = () => resolve(img);
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  });
}

async function addMapIcons() {
  const icons = {
    'icon-from': `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48"><path d="M20 0C9 0 0 9 0 20c0 15 20 28 20 28S40 35 40 20C40 9 31 0 20 0z" fill="#22c55e" stroke="white" stroke-width="2"/><text x="20" y="25" font-size="14" font-weight="bold" fill="white" text-anchor="middle" font-family="sans-serif">F</text></svg>`,
    'icon-to':   `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48"><path d="M20 0C9 0 0 9 0 20c0 15 20 28 20 28S40 35 40 20C40 9 31 0 20 0z" fill="#D40511" stroke="white" stroke-width="2"/><text x="20" y="25" font-size="14" font-weight="bold" fill="white" text-anchor="middle" font-family="sans-serif">T</text></svg>`,
    'icon-latest': `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="18" fill="#2563eb" stroke="white" stroke-width="3"/><text x="22" y="28" font-size="18" fill="white" text-anchor="middle" font-family="sans-serif">🚚</text></svg>`,
    'icon-milestone': `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><polygon points="16,2 30,16 16,30 2,16" fill="#f59e0b" stroke="white" stroke-width="2"/><text x="16" y="21" font-size="12" font-weight="bold" fill="white" text-anchor="middle" font-family="sans-serif">M</text></svg>`,
    'icon-alert': `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><polygon points="16,2 30,30 2,30" fill="#ef4444" stroke="white" stroke-width="2"/><text x="16" y="26" font-size="14" font-weight="bold" fill="white" text-anchor="middle" font-family="sans-serif">!</text></svg>`,
    'icon-truck': `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="#FFCC00" stroke="#D40511" stroke-width="3"/><text x="20" y="26" font-size="18" fill="#333" text-anchor="middle" font-family="sans-serif">🚛</text></svg>`,
    'icon-hub': `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="48" viewBox="0 0 40 48"><path d="M20 0C9 0 0 9 0 20c0 15 20 28 20 28S40 35 40 20C40 9 31 0 20 0z" fill="#FFCC00" stroke="#D40511" stroke-width="2"/><text x="20" y="27" font-size="18" font-weight="bold" fill="#D40511" text-anchor="middle" font-family="sans-serif">★</text></svg>`,
  };
  for (const [name, svg] of Object.entries(icons)) {
    if (!map.hasImage(name)) {
      const img = await makeSVGImage(svg);
      map.addImage(name, img);
    }
  }
}

// ---- Layer helpers ----
const ALL_LAYER_IDS = [
  's1-route-casing','s1-route','s1-from','s1-to','s1-latest','s1-milestones',
  's2-telemetry','s2-alerts',
  's3-tel-base','s3-tel-selected',
  's4-clusters','s4-cluster-count','s4-unclustered',
  's5-geo-fill','s5-geo-outline','s5-truck',
  's7-route-casing','s7-route-remaining','s7-route-traveled','s7-route-matched','s7-from','s7-to','s7-truck','s7-telemetry',
  's8-routes-solid','s8-routes-dashed','s8-highlight-solid','s8-highlight-dashed','s8-markers-dot','s8-markers-transit','s8-markers-completed','s8-arrows','s8-hub',
];

const SCENARIO_VISIBLE = {
  1: ['s1-route-casing','s1-route','s1-from','s1-to','s1-latest','s1-milestones'],
  2: ['s1-from','s1-to','s1-latest','s1-milestones'],
  3: ['s3-tel-base','s3-tel-selected'],
  4: ['s4-clusters','s4-cluster-count','s4-unclustered'],
  5: ['s5-geo-fill','s5-geo-outline','s5-truck'],
  6: [],
  7: ['s7-route-casing','s7-route-remaining','s7-route-traveled','s7-route-matched','s7-from','s7-to','s7-truck','s7-telemetry'],
  8: ['s8-routes-solid','s8-routes-dashed','s8-highlight-solid','s8-highlight-dashed','s8-markers-dot','s8-markers-transit','s8-markers-completed','s8-arrows','s8-hub'],
};

function setLayerVisibility(layerId, visible) {
  if (map.getLayer(layerId)) {
    map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
  }
}

function applyScenarioVisibility(scenario) {
  const show = new Set(SCENARIO_VISIBLE[scenario] || []);
  ALL_LAYER_IDS.forEach(id => setLayerVisibility(id, show.has(id)));
}

// ---- Add All Sources & Layers (on every style load) ----
map.on('style.load', async () => {
  await addMapIcons();

  // --- S1 sources ---
  map.addSource('s1-route', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  map.addSource('s1-from', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Point', coordinates: [SHIPMENT.from.lng, SHIPMENT.from.lat] }, properties: { ...SHIPMENT.from, pointType: 'from' } } });
  map.addSource('s1-to', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Point', coordinates: [SHIPMENT.to.lng, SHIPMENT.to.lat] }, properties: { ...SHIPMENT.to, pointType: 'to' } } });
  map.addSource('s1-latest', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Point', coordinates: [SHIPMENT.latest.lng, SHIPMENT.latest.lat] }, properties: { ...SHIPMENT.latest, pointType: 'latest' } } });
  map.addSource('s1-milestones', { type: 'geojson', data: { type: 'FeatureCollection', features: SHIPMENT.milestones.map(m => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [m.lng, m.lat] }, properties: { ...m, pointType: 'milestone' } })) } });

  map.addLayer({ id: 's1-route-casing', type: 'line', source: 's1-route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#D40511', 'line-width': 8, 'line-opacity': 0.4 } });
  map.addLayer({ id: 's1-route', type: 'line', source: 's1-route', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#D40511', 'line-width': 4 } });
  map.addLayer({ id: 's1-from', type: 'symbol', source: 's1-from', layout: { 'icon-image': 'icon-from', 'icon-size': 0.9, 'icon-allow-overlap': true, 'icon-anchor': 'bottom' } });
  map.addLayer({ id: 's1-to', type: 'symbol', source: 's1-to', layout: { 'icon-image': 'icon-to', 'icon-size': 0.9, 'icon-allow-overlap': true, 'icon-anchor': 'bottom' } });
  map.addLayer({ id: 's1-latest', type: 'symbol', source: 's1-latest', layout: { 'icon-image': 'icon-latest', 'icon-size': 0.9, 'icon-allow-overlap': true } });
  map.addLayer({ id: 's1-milestones', type: 'symbol', source: 's1-milestones', layout: { 'icon-image': 'icon-milestone', 'icon-size': 0.8, 'icon-allow-overlap': true } });

  // --- S2 sources ---
  const telFC = { type: 'FeatureCollection', features: TELEMETRY.map(t => ({ type: 'Feature', id: t.id, geometry: { type: 'Point', coordinates: t.coordinates }, properties: t })) };
  map.addSource('s2-telemetry', { type: 'geojson', data: telFC });
  const alertFC = { type: 'FeatureCollection', features: TELEMETRY.filter(t => t.alert).map(t => ({ type: 'Feature', geometry: { type: 'Point', coordinates: t.coordinates }, properties: t })) };
  map.addSource('s2-alerts', { type: 'geojson', data: alertFC });

  map.addLayer({ id: 's2-telemetry', type: 'circle', source: 's2-telemetry',
    paint: {
      'circle-radius': 8, 'circle-stroke-width': 1.5, 'circle-stroke-color': 'white',
      'circle-color': ['interpolate', ['linear'], ['get', 'temp'], 2, '#93c5fd', 5, '#fbbf24', 8, '#ef4444']
    }
  });
  map.addLayer({ id: 's2-alerts', type: 'symbol', source: 's2-alerts', layout: { 'icon-image': 'icon-alert', 'icon-size': 0.9, 'icon-allow-overlap': true } });

  // --- S3 sources (reuse telemetry data) ---
  map.addSource('s3-telemetry', { type: 'geojson', data: telFC });
  map.addLayer({ id: 's3-tel-base', type: 'circle', source: 's3-telemetry',
    paint: { 'circle-radius': 7, 'circle-color': '#6366f1', 'circle-stroke-width': 1.5, 'circle-stroke-color': 'white', 'circle-opacity': 0.8 }
  });
  map.addLayer({ id: 's3-tel-selected', type: 'circle', source: 's3-telemetry',
    filter: ['==', ['get', 'id'], ''],
    paint: { 'circle-radius': 14, 'circle-color': '#FFCC00', 'circle-stroke-width': 3, 'circle-stroke-color': '#D40511' }
  });

  // --- S4 source (fleet with clustering) ---
  map.addSource('s4-fleet', { type: 'geojson', data: FLEET_DATA, cluster: true, clusterMaxZoom: 10, clusterRadius: 60 });
  map.addLayer({ id: 's4-clusters', type: 'circle', source: 's4-fleet', filter: ['has', 'point_count'],
    paint: {
      'circle-color': ['step', ['get', 'point_count'], '#FFCC00', 10, '#f59e0b', 50, '#D40511'],
      'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 50, 40],
      'circle-stroke-width': 2, 'circle-stroke-color': 'white'
    }
  });
  map.addLayer({ id: 's4-cluster-count', type: 'symbol', source: 's4-fleet', filter: ['has', 'point_count'],
    layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'], 'text-size': 13 },
    paint: { 'text-color': '#1a1a1a' }
  });
  map.addLayer({ id: 's4-unclustered', type: 'circle', source: 's4-fleet', filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-radius': 7, 'circle-stroke-width': 1.5, 'circle-stroke-color': 'white',
      'circle-color': ['match', ['get', 'status'], 'in_transit', '#2563eb', 'delivered', '#22c55e', 'delayed', '#f59e0b', 'exception', '#ef4444', '#6b7280']
    }
  });

  // --- S5 sources (geofencing) ---
  map.addSource('s5-geofences', { type: 'geojson', data: GEOFENCES });
  map.addSource('s5-truck', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'Point', coordinates: [SHIPMENT.latest.lng, SHIPMENT.latest.lat] }, properties: {} } });

  map.addLayer({ id: 's5-geo-fill', type: 'fill', source: 's5-geofences',
    paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.15 }
  });
  map.addLayer({ id: 's5-geo-outline', type: 'line', source: 's5-geofences',
    paint: { 'line-color': ['get', 'color'], 'line-width': 2, 'line-dasharray': [4, 2] }
  });
  map.addLayer({ id: 's5-truck', type: 'symbol', source: 's5-truck', layout: { 'icon-image': 'icon-truck', 'icon-size': 0.85, 'icon-allow-overlap': true } });

  // --- S7 sources (Route + Telemetry) — all start empty; coordinates set after fetch ---
  map.addSource('s7-split',    { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  map.addSource('s7-from',     { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  map.addSource('s7-to',       { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  map.addSource('s7-truck',    { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  map.addSource('s7-telemetry',{ type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  map.addSource('s7-matched',  { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });

  map.addLayer({ id: 's7-route-casing', type: 'line', source: 's7-split', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#ccc', 'line-width': 8, 'line-opacity': 0.25 } });
  map.addLayer({ id: 's7-route-traveled', type: 'line', source: 's7-split', filter: ['==', ['get','seg'], 'traveled'], layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#22c55e', 'line-width': 4 } });
  map.addLayer({ id: 's7-route-remaining', type: 'line', source: 's7-split', filter: ['==', ['get','seg'], 'remaining'], layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#D40511', 'line-width': 3, 'line-dasharray': [4, 3] } });
  map.addLayer({ id: 's7-route-matched', type: 'line', source: 's7-matched', layout: { 'line-join': 'round', 'line-cap': 'round' }, paint: { 'line-color': '#f97316', 'line-width': 3, 'line-opacity': 0.85 } });
  map.addLayer({ id: 's7-from',  type: 'symbol', source: 's7-from',  layout: { 'icon-image': 'icon-from',  'icon-size': 0.9, 'icon-allow-overlap': true, 'icon-anchor': 'bottom' } });
  map.addLayer({ id: 's7-to',    type: 'symbol', source: 's7-to',    layout: { 'icon-image': 'icon-to',    'icon-size': 0.9, 'icon-allow-overlap': true, 'icon-anchor': 'bottom' } });
  map.addLayer({ id: 's7-truck', type: 'symbol', source: 's7-truck', layout: { 'icon-image': 'icon-truck', 'icon-size': 0.85, 'icon-allow-overlap': true } });
  map.addLayer({ id: 's7-telemetry', type: 'circle', source: 's7-telemetry',
    paint: { 'circle-radius': 5, 'circle-stroke-width': 1.5, 'circle-stroke-color': 'white',
      'circle-color': ['interpolate', ['linear'], ['get','temp'], 2, '#93c5fd', 5, '#fbbf24', 8, '#ef4444'] }
  });

  // --- S8 sources (Bundle Order) ---
  map.addSource('s8-routes',  { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  map.addSource('s8-markers', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });

  // Solid segment (driven portions + completed routes)
  map.addLayer({ id: 's8-routes-solid', type: 'line', source: 's8-routes',
    filter: ['==', ['get','seg'], 'driven'],
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-width': 3,
      'line-color': ['match', ['get','status'], 'COMPLETED', '#22c55e', 'IN_TRANSIT', '#2563eb', '#9ca3af'],
      'line-opacity': ['match', ['get','status'], 'COMPLETED', 0.35, 0.9]
    }
  });
  // Dashed segment (remaining / not-started)
  map.addLayer({ id: 's8-routes-dashed', type: 'line', source: 's8-routes',
    filter: ['==', ['get','seg'], 'remaining'],
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-width': 2,
      'line-dasharray': [2, 2],
      'line-color': ['match', ['get','status'], 'IN_TRANSIT', '#93c5fd', '#9ca3af'],
      'line-opacity': 0.6
    }
  });

  // Highlight driven segment — solid, triple width
  map.addLayer({ id: 's8-highlight-solid', type: 'line', source: 's8-routes',
    filter: ['all', ['==', ['get','routeId'], ''], ['==', ['get','seg'], 'driven']],
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-width': 9,
      'line-color': ['match', ['get','status'], 'COMPLETED', '#22c55e', 'IN_TRANSIT', '#2563eb', '#9ca3af'],
      'line-opacity': 0.9
    }
  });
  // Highlight remaining segment — dashed, triple width
  map.addLayer({ id: 's8-highlight-dashed', type: 'line', source: 's8-routes',
    filter: ['all', ['==', ['get','routeId'], ''], ['==', ['get','seg'], 'remaining']],
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-width': 6,
      'line-dasharray': [2, 2],
      'line-color': ['match', ['get','status'], 'IN_TRANSIT', '#93c5fd', '#9ca3af'],
      'line-opacity': 0.9
    }
  });
  // Live position markers
  // Always-on small dot for every IN_TRANSIT position (hides for the selected route, truck shows instead)
  map.addLayer({ id: 's8-markers-dot', type: 'circle', source: 's8-markers',
    filter: ['all', ['==', ['get','status'], 'IN_TRANSIT'], ['!=', ['get','routeId'], '']],
    paint: { 'circle-radius': 5, 'circle-color': '#2563eb', 'circle-stroke-width': 2, 'circle-stroke-color': 'white' }
  });
  // Selected route only: truck icon
  map.addLayer({ id: 's8-markers-transit', type: 'symbol', source: 's8-markers',
    filter: ['==', ['get','routeId'], ''],
    layout: { 'icon-image': 'icon-truck', 'icon-size': 0.75, 'icon-allow-overlap': true }
  });
  map.addLayer({ id: 's8-markers-completed', type: 'circle', source: 's8-markers',
    filter: ['==', ['get','status'], 'COMPLETED'],
    paint: { 'circle-radius': 6, 'circle-stroke-width': 2, 'circle-stroke-color': 'white', 'circle-color': '#22c55e' }
  });
  // Cologne DC hub marker
  map.addSource('s8-hub', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
  map.addLayer({ id: 's8-hub', type: 'symbol', source: 's8-hub',
    layout: { 'icon-image': 'icon-hub', 'icon-size': 0.9, 'icon-allow-overlap': true, 'icon-anchor': 'bottom' }
  });

  // Direction arrows along route lines
  if (!map.hasImage('s8-arrow')) map.addImage('s8-arrow', createRouteArrow());
  map.addLayer({ id: 's8-arrows', type: 'symbol', source: 's8-routes',
    filter: ['==', ['get','routeId'], ''],
    layout: {
      'symbol-placement': 'line',
      'symbol-spacing': 80,
      'icon-image': 's8-arrow',
      'icon-size': 0.6,
      'icon-rotation-alignment': 'map',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
    }
  });

  // Hide all layers initially
  ALL_LAYER_IDS.forEach(id => setLayerVisibility(id, false));

  if (mapFirstLoad) {
    mapFirstLoad = false;
    setupClickHandlers();
    switchScenario(1);
  } else {
    // Style was swapped — re-apply current scenario without re-registering UI listeners
    if (animTimer) { clearInterval(animTimer); animTimer = null; }
    applyScenarioVisibility(activeScenario);
    if (activeScenario === 2) {
      const checked = document.querySelector('input[name="layer-group"]:checked');
      if (checked) applyLayerGroup(checked.value);
    }
    if (activeScenario === 5 && initializedScenarios.has(5)) initS5Animation();
    if (activeScenario === 7 && case1Data) {
      cancelAnimationFrame(s7AnimId); s7AnimId = null; s7Playing = false;
      const playBtn = document.getElementById('s7-play-btn');
      if (playBtn) playBtn.textContent = '▶ Animate Vehicle';
      if (s7MatchedGeo && map.getSource('s7-matched')) map.getSource('s7-matched').setData(s7MatchedGeo);
      renderS7(s7Idx);
    }
    if (activeScenario === 8 && case2Data) {
      buildS8FeatureCollections();
    }
  }
});

// ---- Click Handlers ----
function setupClickHandlers() {
  const pointLayers = ['s1-from','s1-to','s1-latest','s1-milestones','s2-telemetry','s2-alerts','s3-tel-base','s4-unclustered','s5-geo-fill','s7-from','s7-to','s7-truck','s7-telemetry','s8-routes-solid','s8-routes-dashed','s8-markers-transit','s8-markers-completed'];

  pointLayers.forEach(layer => {
    map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer'; });
    map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = ''; });
  });

  ['s1-from','s1-to','s1-latest','s1-milestones'].forEach(layer => {
    map.on('click', layer, e => {
      if (activeScenario !== 1 && activeScenario !== 2) return;
      const f = e.features[0];
      const p = f.properties;
      showPopup(f.geometry.coordinates, buildTransportPopup(p));
    });
  });

  map.on('click', 's2-telemetry', e => {
    if (activeScenario !== 2) return;
    const p = e.features[0].properties;
    showPopup(e.features[0].geometry.coordinates, buildTelemetryPopup(p));
  });

  map.on('click', 's2-alerts', e => {
    if (activeScenario !== 2) return;
    const p = e.features[0].properties;
    showPopup(e.features[0].geometry.coordinates, buildAlertPopup(p));
  });

  map.on('click', 's3-tel-base', e => {
    if (activeScenario !== 3) return;
    const p = e.features[0].properties;
    highlightTelemetryRow(p.id);
    showPopup(e.features[0].geometry.coordinates, buildTelemetryPopup(p));
  });

  map.on('click', 's4-clusters', e => {
    if (activeScenario !== 4) return;
    const features = map.queryRenderedFeatures(e.point, { layers: ['s4-clusters'] });
    const coords = features[0].geometry.coordinates;
    map.easeTo({ center: coords, zoom: map.getZoom() + 2 });
  });

  map.on('click', 's4-unclustered', e => {
    if (activeScenario !== 4) return;
    const p = e.features[0].properties;
    showPopup(e.features[0].geometry.coordinates, buildFleetPopup(p));
  });

  map.on('click', 's5-geo-fill', e => {
    if (activeScenario !== 5) return;
    const p = e.features[0].properties;
    showGeofenceInfo(p);
    showPopup([e.lngLat.lng, e.lngLat.lat], `<div style="font-weight:600">${p.name}</div><div style="color:#666;margin-top:4px">Type: ${p.type}<br>Rule: ${p.rule.replace(/_/g,' ')}</div>`);
  });

  map.on('click', e => {
    if (activeScenario === 6) handleW3WClick(e.lngLat);
  });

  // S7 popups
  ['s7-from','s7-to'].forEach(layer => {
    map.on('click', layer, e => {
      if (activeScenario !== 7) return;
      showPopup(e.features[0].geometry.coordinates, buildTransportPopup(e.features[0].properties));
    });
  });

  map.on('click', 's7-truck', e => {
    if (activeScenario !== 7) return;
    const kmNow = s7SnapKm[s7Idx] || 0;
    const pct = s7TotalKm > 0 ? (kmNow / s7TotalKm * 100).toFixed(0) : 0;
    const t = case1Data ? case1Data.telemetry.data[s7Idx] : null;
    const condStr = t ? `<br>Temp: <b>${t.temperatureCelsius}°C</b> · Humidity: <b>${t.relativeHumidityPercentage}%</b>` : '';
    showPopup(e.features[0].geometry.coordinates, `<div style="color:#2563eb;font-weight:700;margin-bottom:6px">🚚 VEHICLE POSITION</div>Driven: <b>${kmNow.toFixed(0)} km</b><br>Remaining: <b>${(s7TotalKm - kmNow).toFixed(0)} km</b><br>Progress: <b>${pct}%</b>${condStr}`);
  });

  map.on('click', 's7-telemetry', e => {
    if (activeScenario !== 7) return;
    const p = e.features[0].properties;
    const dateStr = p.timestamp ? new Date(p.timestamp).toLocaleString('en-GB', { timeZone: 'UTC', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' UTC' : '';
    showPopup(e.features[0].geometry.coordinates, `<div style="color:#6366f1;font-weight:700;margin-bottom:6px">📊 TELEMETRY</div><b>${dateStr}</b><br>Temperature: <b>${p.temp}°C</b><br>Humidity: ${p.humidity}%`);
  });

  // S8 route clicks
  map.on('click', 's8-routes-solid', e => {
    if (activeScenario !== 8) return;
    const p = e.features[0].properties;
    selectBundleRoute(p.routeId);
    const col = {COMPLETED:'#22c55e',IN_TRANSIT:'#2563eb',NOT_STARTED:'#9ca3af'}[p.status]||'#666';
    showPopup([e.lngLat.lng, e.lngLat.lat], `<div style="font-weight:700;margin-bottom:6px">📦 ${p.routeId}</div>${p.origin.split(',')[0]} → ${p.dest.split(',')[0]}<br>Status: <span style="color:${col};font-weight:600">${p.status.replace('_',' ')}</span><br>Progress: ${p.progressPercentage.toFixed(0)}%`);
  });
  map.on('click', 's8-routes-dashed', e => {
    if (activeScenario !== 8) return;
    const p = e.features[0].properties;
    selectBundleRoute(p.routeId);
    const col = {COMPLETED:'#22c55e',IN_TRANSIT:'#2563eb',NOT_STARTED:'#9ca3af'}[p.status]||'#666';
    showPopup([e.lngLat.lng, e.lngLat.lat], `<div style="font-weight:700;margin-bottom:6px">📦 ${p.routeId}</div>${p.origin.split(',')[0]} → ${p.dest.split(',')[0]}<br>Status: <span style="color:${col};font-weight:600">${p.status.replace('_',' ')}</span><br>Progress: ${p.progressPercentage.toFixed(0)}%`);
  });
  ['s8-markers-transit','s8-markers-completed'].forEach(layer => map.on('click', layer, e => {
    if (activeScenario !== 8) return;
    const p = e.features[0].properties;
    selectBundleRoute(p.routeId);
    const col = {COMPLETED:'#22c55e',IN_TRANSIT:'#2563eb'}[p.status]||'#666';
    showPopup(e.features[0].geometry.coordinates, `<div style="font-weight:700;margin-bottom:6px">🚚 ${p.routeId}</div>${p.origin.split(',')[0]} → ${p.dest.split(',')[0]}<br>Status: <span style="color:${col};font-weight:600">${p.status.replace('_',' ')}</span>`);
  }));

}

// ---- Popup helpers ----
function showPopup(coords, html) {
  if (activePopup) activePopup.remove();
  activePopup = new mapboxgl.Popup({ closeButton: true, maxWidth: '280px' })
    .setLngLat(coords)
    .setHTML(`<div style="font-family:sans-serif;font-size:13px;line-height:1.6">${html}</div>`)
    .addTo(map);
}

function buildTransportPopup(p) {
  const type = p.pointType;
  if (type === 'from') return `<div style="color:#22c55e;font-weight:700;margin-bottom:6px">📦 FROM — Origin</div><b>${p.label}</b><br>${p.address}<br><span style="color:#666">Departure: ${p.departure}</span><br>Weight: ${p.weight} | ${p.dimensions}`;
  if (type === 'to')   return `<div style="color:#D40511;font-weight:700;margin-bottom:6px">🏁 TO — Destination</div><b>${p.label}</b><br>${p.address}<br><span style="color:#666">ETA: ${p.eta}</span><br>Contact: ${p.contact}`;
  if (type === 'latest') return `<div style="color:#2563eb;font-weight:700;margin-bottom:6px">🚚 LATEST POSITION</div><b>${p.vehicle}</b><br>Driver: ${p.driver}<br>Speed: ${p.speed} | Heading: ${p.heading}<br><span style="color:#666">Updated: ${p.lastUpdate}</span>`;
  return `<div style="color:#f59e0b;font-weight:700;margin-bottom:6px">📍 MILESTONE</div><b>${p.label}</b><br>Status: <span style="color:${p.status==='Completed'?'#22c55e':'#6b7280'}">${p.status}</span><br>${p.arrived ? 'Arrived: ' + p.arrived : 'Expected: upcoming'}<br>Stop time: ${p.duration}`;
}

function buildTelemetryPopup(p) {
  const alertBadge = p.alert ? `<div style="color:#ef4444;font-weight:600;margin-top:6px">⚠ ALERT: ${p.alert.replace(/_/g,' ').toUpperCase()}</div>` : '';
  return `<div style="color:#6366f1;font-weight:700;margin-bottom:6px">📊 TELEMETRY</div><b>${p.timestamp}</b><br>Temperature: <b>${p.temp}°C</b><br>Humidity: ${p.humidity}%<br>Shock events: ${p.shock}<br>Battery: ${p.battery}%${alertBadge}`;
}

function buildAlertPopup(p) {
  const alertType = p.alert === 'shock_event' ? '💥 Shock Event' : '🌡 Temperature Excursion';
  return `<div style="color:#ef4444;font-weight:700;margin-bottom:6px">⚠ ALERT DETECTED</div><b>${alertType}</b><br>Time: ${p.timestamp}<br>Temp: ${p.temp}°C | Shock: ${p.shock}`;
}

function buildFleetPopup(p) {
  const colors = { in_transit: '#2563eb', delivered: '#22c55e', delayed: '#f59e0b', exception: '#ef4444' };
  return `<div style="font-weight:700;margin-bottom:6px">📦 ${p.parcel_id}</div>Status: <span style="color:${colors[p.status]||'#666'};font-weight:600">${p.status.replace('_',' ').toUpperCase()}</span><br>From: ${p.origin} → ${p.destination}<br>Weight: ${p.weight} kg`;
}

// ---- Scenario Switch ----
function switchScenario(n) {
  if (activeScenario === n) return;

  // Stop any running animation
  if (animTimer) { clearInterval(animTimer); animTimer = null; }
  cancelAnimationFrame(s7AnimId); s7AnimId = null; s7Playing = false;
  const playBtn = document.getElementById('s7-play-btn');
  if (playBtn) playBtn.textContent = '▶ Animate Vehicle';
  if (activePopup) { activePopup.remove(); activePopup = null; }

  // Reset s2 panel radios
  const s2ActiveLayers = { transport: true, telemetry: false, alerts: false };

  activeScenario = n;

  // Update tab UI
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', +b.dataset.scenario === n));

  // Show/hide side panels
  document.querySelectorAll('.side-panel').forEach(p => p.classList.toggle('active', p.id === `panel-${n}`));

  // Apply layer visibility
  applyScenarioVisibility(n);

  // Show/hide map overlays
  const chartOverlay = document.getElementById('s7-chart-overlay');
  if (chartOverlay) chartOverlay.style.display = n === 7 ? 'block' : 'none';

  // Run scenario-specific init
  if (!initializedScenarios.has(n)) {
    initializedScenarios.add(n);
    switch(n) {
      case 1: initS1(); break;
      case 2: initS2(); break;
      case 3: initS3(); break;
      case 4: initS4(); break;
      case 5: initS5(); break;
      case 6: initS6(); break;
      case 7: initS7(); break;
      case 8: initS8(); break;
    }
  } else {
    // Re-run camera + side effects even after first init
    switch(n) {
      case 1: flyToShipment(); break;
      case 2: {
        flyToShipment();
        const checked = document.querySelector('input[name="layer-group"]:checked');
        if (checked) applyLayerGroup(checked.value);
        break;
      }
      case 3: flyToShipment(); break;
      case 4: map.flyTo({ center: [10, 52], zoom: 4 }); break;
      case 5: flyToShipment(); initS5Animation(); break;
      case 6: map.flyTo({ center: [6.5, 51.2], zoom: 5.5 }); break;
      case 7: map.fitBounds([[2.0, 48.5], [9.2, 50.5]], { padding: 60, duration: 1200 }); if (case1Data) renderS7(s7Idx); break;
      case 8: if (case2Data) { const allLngs = [], allLats = []; case2Data.routes.forEach(r => r.plannedRoute.coordinates.forEach(c => { allLngs.push(c.lng); allLats.push(c.lat); })); map.fitBounds([[Math.min(...allLngs), Math.min(...allLats)],[Math.max(...allLngs), Math.max(...allLats)]], { padding: 80, duration: 1200 }); } break;
    }
  }
}

function flyToShipment() {
  map.fitBounds([[4.7, 49.8], [9.0, 52.6]], { padding: 60, duration: 1200 });
}

// ---- Scenario 1: Transport Map ----
function initS1() {
  flyToShipment();
  document.getElementById('btn-show-route').addEventListener('click', fetchRoute);
  document.querySelectorAll('.layer-toggle').forEach(cb => {
    cb.addEventListener('change', () => {
      setLayerVisibility(cb.dataset.layer, cb.checked);
    });
  });
}

async function fetchRoute() {
  const btn = document.getElementById('btn-show-route');
  btn.textContent = 'Calculating…';
  btn.disabled = true;
  const { from, to, latest, milestones } = SHIPMENT;
  // Waypoints in geographic order (west-bound): From → Koblenz → Cologne → Latest → Düsseldorf → Arnhem → Utrecht → To
  const waypoints = [
    [from.lng, from.lat],
    [milestones[0].lng, milestones[0].lat],
    [milestones[1].lng, milestones[1].lat],
    [latest.lng, latest.lat],
    [milestones[2].lng, milestones[2].lat],
    [milestones[3].lng, milestones[3].lat],
    [milestones[4].lng, milestones[4].lat],
    [to.lng, to.lat],
  ];
  const coords = waypoints.map(w => w.join(',')).join(';');
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${coords}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.routes?.length) throw new Error('No route');
    const route = data.routes[0];
    map.getSource('s1-route').setData({ type: 'Feature', geometry: route.geometry, properties: {} });
    const mins = Math.round(route.duration / 60);
    const km = (route.distance / 1000).toFixed(0);

    // Fetch remaining duration from latest position → destination for accurate ETA
    const remainingUrl = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${latest.lng},${latest.lat};${to.lng},${to.lat}?access_token=${mapboxgl.accessToken}`;
    const remainingRes = await fetch(remainingUrl);
    const remainingData = await remainingRes.json();
    const remainingSecs = remainingData.routes?.[0]?.duration ?? route.duration;
    const eta = new Date(Date.now() + remainingSecs * 1000);
    const etaStr = eta.toLocaleString('en-GB', { timeZone: 'Europe/Amsterdam', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    document.getElementById('route-info').innerHTML = `<div class="info-row"><span>🕐 Total duration</span><b>${Math.floor(mins/60)}h ${mins%60}m</b></div><div class="info-row"><span>📏 Distance</span><b>${km} km</b></div><div class="info-row"><span>🏁 ETA (Amsterdam)</span><b>${etaStr}</b></div>`;
    btn.textContent = 'Route Shown ✓';
    setLayerVisibility('s1-route-casing', true);
    setLayerVisibility('s1-route', true);
  } catch(e) {
    btn.textContent = 'Retry Route';
    btn.disabled = false;
  }
}

// ---- Scenario 2: Layer Switching ----
function initS2() {
  flyToShipment();
  document.querySelectorAll('input[name="layer-group"]').forEach(radio => {
    radio.addEventListener('change', () => applyLayerGroup(radio.value));
  });
  applyLayerGroup('transport');
}

function applyLayerGroup(group) {
  const all2 = ['s1-from','s1-to','s1-latest','s1-milestones','s2-telemetry','s2-alerts'];
  const show = {
    transport: ['s1-from','s1-to','s1-latest','s1-milestones'],
    telemetry: ['s2-telemetry'],
    alerts:    ['s2-alerts'],
    both:      ['s1-from','s1-to','s1-latest','s1-milestones','s2-alerts']
  }[group] || [];
  all2.forEach(id => setLayerVisibility(id, show.includes(id)));
}

// ---- Scenario 3: Map + Table ----
function initS3() {
  flyToShipment();
  const tbody = document.getElementById('telemetry-tbody');
  tbody.innerHTML = '';
  TELEMETRY.forEach(t => {
    const tr = document.createElement('tr');
    tr.id = `row-${t.id}`;
    tr.innerHTML = `<td>${t.timestamp.split(' ')[1]}</td><td class="${t.temp > 7 ? 'alert-cell':''}">${t.temp}°C</td><td>${t.humidity}%</td><td class="${t.shock ? 'alert-cell':''}">${t.shock}</td>`;
    tr.addEventListener('click', () => {
      flyToTelemetry(t);
      highlightTelemetryRow(t.id);
    });
    tbody.appendChild(tr);
  });
}

function flyToTelemetry(t) {
  map.flyTo({ center: t.coordinates, zoom: 9, duration: 800 });
  map.setFilter('s3-tel-selected', ['==', ['get', 'id'], t.id]);
  showPopup(t.coordinates, buildTelemetryPopup(t));
}

function highlightTelemetryRow(id) {
  document.querySelectorAll('#telemetry-tbody tr').forEach(tr => tr.classList.remove('selected'));
  const row = document.getElementById(`row-${id}`);
  if (row) {
    row.classList.add('selected');
    row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  map.setFilter('s3-tel-selected', ['==', ['get', 'id'], id]);
}

// ---- Scenario 4: Clustering ----
function initS4() {
  map.flyTo({ center: [10, 52], zoom: 4 });
  document.getElementById('fleet-filter').addEventListener('change', e => {
    filterFleet(e.target.value);
  });
  updateFleetCount('all');
}

function filterFleet(status) {
  let filtered;
  if (status === 'all') {
    filtered = FLEET_DATA;
  } else {
    filtered = { ...FLEET_DATA, features: FLEET_DATA.features.filter(f => f.properties.status === status) };
  }
  map.getSource('s4-fleet').setData(filtered);
  updateFleetCount(status);
}

function updateFleetCount(status) {
  const total = status === 'all' ? FLEET_DATA.features.length : FLEET_DATA.features.filter(f => f.properties.status === status).length;
  document.getElementById('fleet-count').textContent = `${total} shipments`;
}

// ---- Scenario 5: Geofencing ----
function initS5() {
  flyToShipment();
  renderGeofenceList();
  initS5Animation();
}

function renderGeofenceList() {
  const list = document.getElementById('geofence-list');
  list.innerHTML = '';
  GEOFENCES.features.forEach(f => {
    const p = f.properties;
    const div = document.createElement('div');
    div.className = 'geo-card';
    div.innerHTML = `<div class="geo-dot" style="background:${p.color}"></div><div><div style="font-weight:600">${p.name}</div><div style="color:#666;font-size:12px">Type: ${p.type} | Rule: ${p.rule.replace(/_/g,' ')}</div></div>`;
    list.appendChild(div);
  });
}

const ANIM_PATH = ROUTE_COORDS;
function initS5Animation() {
  animStep = 0;
  const truck = map.getSource('s5-truck');
  if (!truck) return;
  truck.setData({ type: 'Feature', geometry: { type: 'Point', coordinates: ANIM_PATH[0] }, properties: {} });
  document.getElementById('geo-alert').innerHTML = '';

  animTimer = setInterval(() => {
    animStep = (animStep + 1) % ANIM_PATH.length;
    const coord = ANIM_PATH[animStep];
    if (map.getSource('s5-truck')) {
      map.getSource('s5-truck').setData({ type: 'Feature', geometry: { type: 'Point', coordinates: coord }, properties: {} });
    }
    checkGeofences(coord);
  }, 800);
}

function checkGeofences(coord) {
  const pt = turf.point(coord);
  let entered = null;
  GEOFENCES.features.forEach(f => {
    if (turf.booleanPointInPolygon(pt, f)) entered = f.properties;
  });
  const alertEl = document.getElementById('geo-alert');
  if (entered) {
    alertEl.innerHTML = `<div class="geo-alert-box" style="border-color:${entered.color}">⚠ ENTERED: <b>${entered.name}</b><br>Rule: ${entered.rule.replace(/_/g,' ')}</div>`;
  } else {
    alertEl.innerHTML = '<div class="geo-status">🟢 Truck in transit — no active zones</div>';
  }
}

function showGeofenceInfo(p) {
  const alertEl = document.getElementById('geo-alert');
  alertEl.innerHTML = `<div class="geo-alert-box" style="border-color:${p.color}"><b>${p.name}</b><br>Type: ${p.type}<br>Rule: ${p.rule.replace(/_/g,' ')}</div>`;
}

// ---- Scenario 6: What3words ----
let w3wKey = '';
function initS6() {
  map.flyTo({ center: [6.5, 51.2], zoom: 5.5 });
  document.getElementById('w3w-key-input').addEventListener('input', e => { w3wKey = e.target.value.trim(); });
  document.getElementById('w3w-instruction').textContent = 'Click anywhere on the map to get the what3words address.';
}

async function handleW3WClick(lngLat) {
  const { lng, lat } = lngLat;
  const resultEl = document.getElementById('w3w-result');
  resultEl.innerHTML = '<span style="color:#666">Looking up…</span>';
  showPopup([lng, lat], '<span style="color:#666">Looking up what3words…</span>');

  if (w3wKey) {
    try {
      const res = await fetch(`https://api.what3words.com/v3/convert-to-3wa?coordinates=${lat},${lng}&language=en&key=${w3wKey}`);
      const data = await res.json();
      if (data.words) {
        const words = data.words;
        showW3WResult(lng, lat, words, resultEl);
        return;
      }
    } catch(e) {}
  }
  // Fallback: deterministic mock
  const words = mockW3W(lng, lat);
  showW3WResult(lng, lat, words, resultEl, true);
}

const W3W_WORDS = ['apple','bridge','castle','dance','eagle','flame','garden','harbor','island','jungle','kite','lunar','maple','north','ocean','palace','quiet','river','silver','tower','ultra','valley','winter','xenon','yellow','zebra','amber','bronze','coral','delta','emerald','forest','granite','hollow','indigo','jasper','kernel','lemon','marble','noble','olive','pearl','quartz','rustic','sandy','tidal','urban','violet','walnut'];
function mockW3W(lng, lat) {
  const a = Math.abs(Math.floor(lng * 73 + lat * 37)) % W3W_WORDS.length;
  const b = Math.abs(Math.floor(lat * 53 + lng * 29)) % W3W_WORDS.length;
  const c = Math.abs(Math.floor((lng + lat) * 61)) % W3W_WORDS.length;
  return `${W3W_WORDS[a]}.${W3W_WORDS[b]}.${W3W_WORDS[c]}`;
}

function showW3WResult(lng, lat, words, el, isMock) {
  const badge = isMock ? '<span style="color:#999;font-size:11px"> (demo)</span>' : '';
  el.innerHTML = `<div class="w3w-address">///&nbsp;${words}${badge}</div><div style="color:#666;font-size:12px;margin-top:4px">${lat.toFixed(5)}, ${lng.toFixed(5)}</div>`;
  showPopup([lng, lat], `<div style="color:#e11d48;font-weight:700;margin-bottom:6px">///&nbsp;what3words</div><div style="font-size:16px;font-weight:600">/// ${words}</div>${isMock?'<div style="color:#999;font-size:11px;margin-top:4px">Demo mode — enter API key for live lookup</div>':''}`);
}

// ---- Map style switcher ----
function switchMapStyle(styleId) {
  const style = MAP_STYLES.find(s => s.id === styleId);
  if (!style) return;
  document.querySelectorAll('.style-btn').forEach(b => b.classList.toggle('active', b.dataset.style === styleId));
  map.setStyle(style.url);
}

// ---- Tab + style button wiring (after DOM ready) ----
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => switchScenario(+btn.dataset.scenario));
});
document.querySelectorAll('.style-btn').forEach(btn => {
  btn.addEventListener('click', () => switchMapStyle(btn.dataset.style));
});

// ---- Scenario 7: Route + Telemetry ----
async function initS7() {
  map.fitBounds([[2.0, 48.5], [9.2, 50.5]], { padding: 60, duration: 1200 });

  let data;
  try {
    const res = await fetch('data/dhl-case1.json');
    if (!res.ok) throw new Error(res.status);
    data = await res.json();
    case1Data = data;
  } catch(e) {
    const el = document.getElementById('s7-split-info');
    if (el) el.textContent = 'Failed to load route data.';
    return;
  }

  const { start, end } = data.plannedRoute;
  s7MaxIdx = data.telemetry.data.length - 1;
  s7Idx = s7MaxIdx;

  // Helper: precompute both snap arrays for a given line geometry
  function precomputeSnap(line) {
    const kms = data.telemetry.data.map(t =>
      turf.nearestPointOnLine(line, turf.point([t.lng, t.lat])).properties.location
    );
    const coords = kms.map(km => turf.along(line, km, { units: 'kilometers' }).geometry.coordinates);
    return { kms, coords, totalKm: turf.length(line, { units: 'kilometers' }) };
  }

  // Build raw planned line immediately, render at once
  case1RawGeo = turf.lineString(data.plannedRoute.coordinates.map(toLngLat));
  const raw = precomputeSnap(case1RawGeo);
  s7RawSnapKm = raw.kms; s7RawSnapCoords = raw.coords; s7RawTotalKm = raw.totalKm;

  // Default to raw until Directions arrives
  case1PlannedGeo = case1RawGeo;
  s7SnapKm = s7RawSnapKm; s7SnapCoords = s7RawSnapCoords; s7TotalKm = s7RawTotalKm;
  s7UseDirections = false;

  // Place from/to markers
  if (map.getSource('s7-from')) {
    map.getSource('s7-from').setData({ type: 'Feature', geometry: { type: 'Point', coordinates: [start.lng, start.lat] }, properties: { label: start.name, pointType: 'from', address: start.name } });
  }
  if (map.getSource('s7-to')) {
    map.getSource('s7-to').setData({ type: 'Feature', geometry: { type: 'Point', coordinates: [end.lng, end.lat] }, properties: { label: end.name, pointType: 'to', address: end.name } });
  }

  // Wire snap toggle
  const snapToggle = document.getElementById('s7-snap-toggle');
  if (snapToggle) {
    snapToggle.checked = false;
    snapToggle.addEventListener('change', () => { s7Snapped = snapToggle.checked; renderS7(s7Idx); });
  }

  // Wire route toggle (disabled until Directions data ready)
  const routeToggle = document.getElementById('s7-route-toggle');
  if (routeToggle) {
    routeToggle.checked = false;
    routeToggle.disabled = true;
    routeToggle.addEventListener('change', () => {
      s7UseDirections = routeToggle.checked;
      case1PlannedGeo = s7UseDirections ? case1DirectionsGeo : case1RawGeo;
      s7SnapKm    = s7UseDirections ? s7DirSnapKm    : s7RawSnapKm;
      s7SnapCoords = s7UseDirections ? s7DirSnapCoords : s7RawSnapCoords;
      s7TotalKm   = s7UseDirections ? s7DirTotalKm   : s7RawTotalKm;
      renderS7(s7Idx);
    });
  }

  // Build chart and render initial state immediately (using raw planned line)
  buildS7Chart(data.telemetry.data);
  renderS7(s7Idx);

  // Fetch Directions API in background — enables route toggle when ready
  (async () => {
    try {
      const dirUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${start.lng},${start.lat};${end.lng},${end.lat}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`;
      const dirRes = await fetch(dirUrl);
      const dirData = await dirRes.json();
      const roadLine = dirData.routes?.[0]?.geometry;
      if (!roadLine) return;
      case1DirectionsGeo = turf.lineString(roadLine.coordinates);
      const dir = precomputeSnap(case1DirectionsGeo);
      s7DirSnapKm = dir.kms; s7DirSnapCoords = dir.coords; s7DirTotalKm = dir.totalKm;
      // Enable toggle — don't auto-switch, let user choose
      if (routeToggle) routeToggle.disabled = false;
    } catch(e) {
      // Directions failed — leave raw active, keep toggle disabled
    }
  })();

  // Wire play/pause button
  const btn = document.getElementById('s7-play-btn');
  if (btn) {
    btn.disabled = false;
    btn.addEventListener('click', () => {
      if (s7Playing) {
        s7Playing = false;
        cancelAnimationFrame(s7AnimId);
        btn.textContent = '▶ Animate Vehicle';
      } else {
        s7Idx = 0; // replay from start
        s7Playing = true;
        btn.textContent = '⏸ Pause';
        animateS7();
      }
    });
  }
}

function renderS7(i) {
  if (!case1Data || !case1PlannedGeo) return;
  s7Idx = Math.max(0, Math.min(i, s7MaxIdx));

  const tel = case1Data.telemetry.data;
  const kmNow = s7SnapKm[s7Idx] || 0;
  const total = s7TotalKm;
  const clampedKm = Math.max(0.01, Math.min(kmNow, total - 0.01));

  // Split planned route
  const driven   = turf.lineSliceAlong(case1PlannedGeo, 0, clampedKm, { units: 'kilometers' });
  const remaining = turf.lineSliceAlong(case1PlannedGeo, clampedKm, total, { units: 'kilometers' });
  driven.properties   = { seg: 'traveled' };
  remaining.properties = { seg: 'remaining' };
  if (map.getSource('s7-split')) {
    map.getSource('s7-split').setData({ type: 'FeatureCollection', features: [driven, remaining] });
  }

  // Move truck — snapped to road or raw GPS depending on toggle
  const t = tel[s7Idx];
  const truckCoord = s7Snapped ? s7SnapCoords[s7Idx] : [t.lng, t.lat];
  if (map.getSource('s7-truck')) {
    map.getSource('s7-truck').setData({ type: 'Feature', geometry: { type: 'Point', coordinates: truckCoord }, properties: {} });
  }

  // Trail — snapped or raw, colored by temperature
  const trailFeatures = tel.slice(0, s7Idx + 1).map((r, j) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: s7Snapped ? s7SnapCoords[j] : [r.lng, r.lat] },
    properties: { temp: r.temperatureCelsius, humidity: r.relativeHumidityPercentage, timestamp: r.timestamp }
  }));
  if (map.getSource('s7-telemetry')) {
    map.getSource('s7-telemetry').setData({ type: 'FeatureCollection', features: trailFeatures });
  }

  // Side panel
  const pct = (clampedKm / total * 100).toFixed(1);
  const drivenKm = clampedKm.toFixed(0);
  const remKm = (total - clampedKm).toFixed(0);
  const barEl = document.getElementById('s7-bar-driven');
  if (barEl) barEl.style.width = pct + '%';
  const infoEl = document.getElementById('s7-split-info');
  if (infoEl) infoEl.innerHTML = `<div class="info-row"><span>✅ Driven</span><b>${drivenKm} km (${pct}%)</b></div><div class="info-row"><span>🔴 Remaining</span><b>${remKm} km</b></div><div class="info-row"><span>📏 Total route</span><b>${total.toFixed(0)} km</b></div>`;

  const condEl = document.getElementById('s7-conditions');
  if (condEl) {
    const dateStr = new Date(t.timestamp).toLocaleString('en-GB', { timeZone: 'UTC', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' UTC';
    condEl.innerHTML = `<b>Current conditions</b><br>🌡 Temp: <b style="color:${t.temperatureCelsius > 5 ? '#ef4444':'#2563eb'}">${t.temperatureCelsius}°C</b>&nbsp;&nbsp;💧 Humidity: <b>${t.relativeHumidityPercentage}%</b><br><span style="color:#666;font-size:11px">${dateStr}</span>`;
  }

  annotateS7(s7Idx);
}

function animateS7() {
  if (!s7Playing) return;
  s7Idx += 2; // advance 2 readings per frame (~8s for 250 readings at 60fps)
  if (s7Idx >= s7MaxIdx) {
    s7Idx = s7MaxIdx;
    renderS7(s7Idx);
    s7Playing = false;
    cancelAnimationFrame(s7AnimId);
    const btn = document.getElementById('s7-play-btn');
    if (btn) btn.textContent = '▶ Animate Vehicle';
    return;
  }
  renderS7(s7Idx);
  s7AnimId = requestAnimationFrame(animateS7);
}

function buildS7Chart(telData) {
  const chartEl = document.getElementById('s7-telemetry-chart');
  if (!chartEl || typeof ApexCharts === 'undefined') return;
  if (s7ApexChart) { s7ApexChart.destroy(); s7ApexChart = null; }
  s7ChartBounds = null;

  s7ApexChart = new ApexCharts(chartEl, {
    chart: { type: 'line', height: 160, toolbar: { show: false }, animations: { enabled: false }, background: 'transparent' },
    series: [
      { name: 'Temp (°C)',  data: telData.map(t => t.temperatureCelsius),        color: '#ef4444' },
      { name: 'Humid (%)', data: telData.map(t => t.relativeHumidityPercentage), color: '#2563eb' },
    ],
    xaxis: { categories: telData.map((_, i) => String(i)), labels: { show: false } },
    yaxis: [
      { title: { text: '°C', style: { fontSize: '10px' } }, min: 0, max: 8, tickAmount: 2 },
      { opposite: true, title: { text: '%', style: { fontSize: '10px' } }, min: 70, max: 95, tickAmount: 2 },
    ],
    stroke: { curve: 'smooth', width: 2 },
    legend: { fontSize: '11px' },
    grid: { borderColor: '#f0f0f0' },
    tooltip: {
      x: { formatter: (val, opts) => {
        if (!case1Data) return '';
        const t = case1Data.telemetry.data[opts.dataPointIndex];
        return t ? new Date(t.timestamp).toLocaleString('en-GB', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' }) + ' UTC' : '';
      }}
    },
  });
  s7ApexChart.render();
}

function annotateS7(i) {
  const marker = document.getElementById('s7-now-line');
  if (!marker) return;
  // Cache plot bounds after first successful measurement
  if (!s7ChartBounds) {
    const inner = document.querySelector('#s7-telemetry-chart .apexcharts-inner');
    const overlay = document.getElementById('s7-chart-overlay');
    if (!inner || !overlay) return;
    const ir = inner.getBoundingClientRect();
    const or = overlay.getBoundingClientRect();
    s7ChartBounds = { left: ir.left - or.left, width: ir.width, top: ir.top - or.top, height: ir.height };
  }
  const x = s7ChartBounds.left + (i / s7MaxIdx) * s7ChartBounds.width;
  marker.style.left  = x + 'px';
  marker.style.top   = s7ChartBounds.top + 'px';
  marker.style.height = s7ChartBounds.height + 'px';
  marker.style.display = 'block';
}

async function fetchMapMatched(coordinates) {
  // Subsample to every 5th point (API max 100 waypoints)
  const sampled = coordinates.filter((_, i) => i % 5 === 0 || i === coordinates.length - 1);
  const coordStr = sampled.map(c => `${c.lng},${c.lat}`).join(';');
  const url = `https://api.mapbox.com/matching/v5/mapbox/driving/${coordStr}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const geo = data.matchings?.[0]?.geometry;
    if (!geo) return;
    s7MatchedGeo = { type: 'Feature', geometry: geo, properties: {} };
    if (map.getSource('s7-matched')) map.getSource('s7-matched').setData(s7MatchedGeo);
  } catch(e) {
    console.warn('Map Matching failed:', e);
  }
}

// ---- Scenario 8: Bundle Order ----
async function initS8() {
  let data;
  try {
    const res = await fetch('data/dhl-case2.json');
    if (!res.ok) throw new Error(res.status);
    data = await res.json();
    case2Data = data;
  } catch(e) {
    const el = document.getElementById('s8-load-note');
    if (el) el.textContent = 'Failed to load bundle data.';
    return;
  }

  // fitBounds over all route coordinates
  const allLngs = [], allLats = [];
  data.routes.forEach(r => r.plannedRoute.coordinates.forEach(c => { allLngs.push(c.lng); allLats.push(c.lat); }));
  map.fitBounds([[Math.min(...allLngs), Math.min(...allLats)], [Math.max(...allLngs), Math.max(...allLats)]], { padding: 80, duration: 1200 });

  // Wire toggles
  const s8RouteToggle = document.getElementById('s8-route-toggle');
  if (s8RouteToggle) {
    s8RouteToggle.checked = false;
    s8RouteToggle.addEventListener('change', () => { s8UseDirections = s8RouteToggle.checked; buildS8FeatureCollections(); });
  }

  buildS8FeatureCollections();
  renderBundleList();

  const note = document.getElementById('s8-load-note');
  if (note) note.textContent = `${data.routes.length} routes loaded ✓`;

  // Fetch road geometry for all 14 routes in background
  (async () => {
    const results = await Promise.allSettled(
      data.routes.map(r =>
        fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${r.plannedRoute.start.lng},${r.plannedRoute.start.lat};${r.plannedRoute.end.lng},${r.plannedRoute.end.lat}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`)
          .then(res => res.json())
          .then(d => ({ routeId: r.routeId, geo: d.routes?.[0]?.geometry }))
      )
    );
    let loaded = 0;
    results.forEach(r => {
      if (r.status !== 'fulfilled' || !r.value.geo) return;
      s8DirectionsGeos[r.value.routeId] = turf.lineString(r.value.geo.coordinates);
      loaded++;
    });
    if (loaded > 0 && s8RouteToggle) s8RouteToggle.disabled = false;
    if (note) note.textContent = `${data.routes.length} routes loaded ✓`;
  })();
}

function buildS8FeatureCollections() {
  if (!case2Data) return;
  const routeFeatures = [];
  const markerFeatures = [];

  case2Data.routes.forEach(r => {
    const { status, routeId, progressPercentage, drivenCoordinateCount, latestPosition } = r;
    const origin = r.plannedRoute.start.name;
    const dest   = r.plannedRoute.end.name;

    const useRoad = s8UseDirections && s8DirectionsGeos[routeId];
    const activeLine = useRoad ? s8DirectionsGeos[routeId] : null;
    const coords = useRoad
      ? activeLine.geometry.coordinates
      : r.plannedRoute.coordinates.map(toLngLat);

    if (status === 'NOT_STARTED') {
      routeFeatures.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: coords }, properties: { routeId, status, seg: 'remaining', origin, dest, progressPercentage } });

    } else if (status === 'IN_TRANSIT') {
      let drivenCoords, remainingCoords;
      if (useRoad && latestPosition) {
        const totalKm = turf.length(activeLine, { units: 'kilometers' });
        const snapKm  = turf.nearestPointOnLine(activeLine, turf.point([latestPosition.lng, latestPosition.lat])).properties.location;
        const clamp   = Math.max(0.01, Math.min(snapKm, totalKm - 0.01));
        drivenCoords   = turf.lineSliceAlong(activeLine, 0, clamp, { units: 'kilometers' }).geometry.coordinates;
        remainingCoords = turf.lineSliceAlong(activeLine, clamp, totalKm, { units: 'kilometers' }).geometry.coordinates;
      } else {
        drivenCoords   = coords.slice(0, drivenCoordinateCount + 1);
        remainingCoords = coords.slice(drivenCoordinateCount);
      }
      if (drivenCoords.length >= 2)   routeFeatures.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: drivenCoords },   properties: { routeId, status, seg: 'driven',    origin, dest, progressPercentage } });
      if (remainingCoords.length >= 2) routeFeatures.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: remainingCoords }, properties: { routeId, status, seg: 'remaining', origin, dest, progressPercentage } });

      if (latestPosition) {
        const markerCoord = s8UseDirections
          ? turf.nearestPointOnLine(activeLine || turf.lineString(r.plannedRoute.coordinates.map(toLngLat)), turf.point([latestPosition.lng, latestPosition.lat])).geometry.coordinates
          : [latestPosition.lng, latestPosition.lat];
        markerFeatures.push({ type: 'Feature', geometry: { type: 'Point', coordinates: markerCoord }, properties: { routeId, status, origin, dest } });
      }

    } else if (status === 'COMPLETED') {
      routeFeatures.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: coords }, properties: { routeId, status, seg: 'driven', origin, dest, progressPercentage } });
      if (latestPosition) {
        const markerCoord = s8UseDirections
          ? turf.nearestPointOnLine(activeLine || turf.lineString(r.plannedRoute.coordinates.map(toLngLat)), turf.point([latestPosition.lng, latestPosition.lat])).geometry.coordinates
          : [latestPosition.lng, latestPosition.lat];
        markerFeatures.push({ type: 'Feature', geometry: { type: 'Point', coordinates: markerCoord }, properties: { routeId, status, origin, dest } });
      }
    }
  });

  const hubRoute = case2Data.routes.find(r => r.plannedRoute.start.name === 'Cologne DC, Germany');
  if (map.getSource('s8-hub') && hubRoute) {
    const { lng, lat } = hubRoute.plannedRoute.start;
    map.getSource('s8-hub').setData({ type: 'Feature', geometry: { type: 'Point', coordinates: [lng, lat] }, properties: {} });
  }
  if (map.getSource('s8-routes'))  map.getSource('s8-routes').setData({ type: 'FeatureCollection', features: routeFeatures });
  if (map.getSource('s8-markers')) map.getSource('s8-markers').setData({ type: 'FeatureCollection', features: markerFeatures });
}

function renderBundleList() {
  if (!case2Data) return;
  const list = document.getElementById('bundle-list');
  if (!list) return;
  list.innerHTML = '';
  const stateColors = { COMPLETED: '#22c55e', IN_TRANSIT: '#2563eb', NOT_STARTED: '#9ca3af' };

  case2Data.routes.forEach(r => {
    const row = document.createElement('div');
    row.className = 'bundle-row';
    row.id = `bundle-row-${r.routeId}`;
    const isHub = r.plannedRoute.start.name === 'Cologne DC, Germany';
    const pct = r.status === 'NOT_STARTED' ? '' : ` <span style="color:#666;font-size:10px">${r.progressPercentage.toFixed(0)}%</span>`;
    row.innerHTML = `<span class="bundle-dot" style="background:${stateColors[r.status]||'#666'}"></span><span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.plannedRoute.start.name.split(',')[0]} → ${r.plannedRoute.end.name.split(',')[0]}</span>${pct}${isHub ? '<span class="hub-badge">★ HUB</span>' : ''}`;
    row.addEventListener('click', () => selectBundleRoute(r.routeId));
    list.appendChild(row);
  });
}

function selectBundleRoute(routeId) {
  ['s8-highlight-solid','s8-highlight-dashed'].forEach(id => {
    if (map.getLayer(id)) map.setFilter(id, ['all', ['==', ['get','routeId'], routeId], ['==', ['get','seg'], id === 's8-highlight-solid' ? 'driven' : 'remaining']]);
  });
  s8SelectedRouteId = routeId;
  if (map.getLayer('s8-markers-dot'))     map.setFilter('s8-markers-dot',     ['all', ['==', ['get','status'], 'IN_TRANSIT'], ['!=', ['get','routeId'], routeId]]);
  if (map.getLayer('s8-markers-transit')) map.setFilter('s8-markers-transit', ['==', ['get','routeId'], routeId]);
  if (map.getLayer('s8-arrows'))          map.setFilter('s8-arrows',          ['==', ['get','routeId'], routeId]);
  document.querySelectorAll('.bundle-row').forEach(r => r.classList.remove('selected'));
  const row = document.getElementById(`bundle-row-${routeId}`);
  if (row) { row.classList.add('selected'); row.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }

  if (!case2Data) return;
  const route = case2Data.routes.find(r => r.routeId === routeId);
  if (!route) return;
  const lngs = route.plannedRoute.coordinates.map(c => c.lng);
  const lats = route.plannedRoute.coordinates.map(c => c.lat);
  map.fitBounds([[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]], { padding: 80, duration: 800 });
}
