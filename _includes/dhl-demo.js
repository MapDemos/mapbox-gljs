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

// ---- State ----
let activeScenario = 0;
let animTimer = null;
let animStep = 0;
let activePopup = null;
const initializedScenarios = new Set();

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
];

const SCENARIO_VISIBLE = {
  1: ['s1-route-casing','s1-route','s1-from','s1-to','s1-latest','s1-milestones'],
  2: ['s1-from','s1-to','s1-latest','s1-milestones'],
  3: ['s3-tel-base','s3-tel-selected'],
  4: ['s4-clusters','s4-cluster-count','s4-unclustered'],
  5: ['s5-geo-fill','s5-geo-outline','s5-truck'],
  6: [],
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
  }
});

// ---- Click Handlers ----
function setupClickHandlers() {
  const pointLayers = ['s1-from','s1-to','s1-latest','s1-milestones','s2-telemetry','s2-alerts','s3-tel-base','s4-unclustered','s5-geo-fill'];

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
    document.getElementById('route-info').innerHTML = `<div class="info-row"><span>🕐 Duration</span><b>${Math.floor(mins/60)}h ${mins%60}m</b></div><div class="info-row"><span>📏 Distance</span><b>${km} km</b></div><div class="info-row"><span>🏁 ETA</span><b>${SHIPMENT.to.eta}</b></div>`;
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
