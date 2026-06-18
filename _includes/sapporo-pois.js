// ===================================================================
// Sapporo Medical Facilities & Airport POI Demo
// ===================================================================

const POIS = [
  { id: 'hospital-1', name: 'Sapporo Higashi Tokushukai Hospital', type: 'medical', lng: 141.365836, lat: 43.103487, color: '#e11d48', icon: null },
  { id: 'hospital-2', name: 'Japan Self Defense Forces (JSDF) Sapporo Hospital', type: 'medical', lng: 141.353300, lat: 43.006080, color: '#e11d48', icon: null },
  { id: 'clinic-1',   name: 'Maruyama Koen Naika', type: 'medical', lng: 141.314363, lat: 43.056276, color: '#e11d48', icon: null },
  { id: 'clinic-2',   name: 'Omni Dentix', type: 'medical', lng: 141.353770, lat: 43.059352, color: '#e11d48', icon: null },
  { id: 'airport',    name: 'New Chitose Airport', type: 'airport', lng: 141.686620, lat: 42.779117, color: '#2563eb', icon: 'airport' },
];

// SVG icon paths embedded in markers
const ICON_SVG = {
  airport: `<path d="M21 16v-2l-8-5V4.5c0-.83-.67-1.5-1.5-1.5S10 3.67 10 4.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="white" transform="translate(3.8,3.4) scale(0.85)"/>`,
};

const SAPPORO = { lng: 141.351690, lat: 43.062051 };

const VIEWS = {
  1: { center: [137.5, 37.5], zoom: 4.5, pitch: 0, bearing: 0 },
  2: { center: [141.5, 43.0], zoom: 8.5, pitch: 0, bearing: 0 },
  3: { center: [141.345, 43.055], zoom: 12, pitch: 30, bearing: -10 },
};

const TYPE_ICONS = { medical: '🏥', airport: '✈️' };
const TYPE_LABELS = { medical: 'Medical Facility', airport: 'Airport' };

// ---- Map Init ----
mapboxgl.accessToken = 'pk.eyJ1IjoiaW50ZXJuYXRpb25hbHNvcyIsImEiOiJwVTYtUFlRIn0.l8CfOIrMJwvX3D1ZmbkEzg';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  language: 'en',
  center: VIEWS[1].center,
  zoom: VIEWS[1].zoom,
  attributionControl: false,
});
map.addControl(new mapboxgl.AttributionControl({ compact: false }), 'bottom-left');

// ---- Tab logic ----
let currentTab = 1;
const tabBtns = document.querySelectorAll('.tab-btn');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = parseInt(btn.dataset.tab);
    if (tab === currentTab) return;
    currentTab = tab;
    tabBtns.forEach(b => b.classList.toggle('active', parseInt(b.dataset.tab) === tab));
    document.querySelectorAll('.side-panel').forEach(p => p.classList.toggle('active', p.id === `panel-${tab}`));
    updateMarkerVisibility(tab);
    flyToView(tab);
  });
});

function flyToView(tab) {
  const v = VIEWS[tab];
  map.flyTo({ center: v.center, zoom: v.zoom, pitch: v.pitch, bearing: v.bearing, duration: 1800, essential: true });
}


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

function popupHTML(poi) {
  return `
    <div style="font-family:-apple-system,sans-serif;min-width:180px">
      <div style="font-size:13px;font-weight:700;color:#1e293b;margin-bottom:4px">${TYPE_ICONS[poi.type]} ${poi.name}</div>
      <div style="font-size:11px;color:#64748b">${TYPE_LABELS[poi.type]}</div>
      <div style="font-size:11px;color:#94a3b8;margin-top:4px">${poi.lat.toFixed(6)}, ${poi.lng.toFixed(6)}</div>
    </div>
  `;
}

// Marker references keyed by id (set on load)
const poiMarkers = {};

// Show markers per tab: 1 = Sapporo only, 2 = all 5 POIs, 3 = 4 medical (no airport)
function updateMarkerVisibility(tab) {
  poiMarkers.sapporo.getElement().style.display = (tab === 1) ? '' : 'none';
  POIS.forEach(poi => {
    let visible = false;
    if (tab === 2) visible = true;
    if (tab === 3) visible = poi.type !== 'airport';
    poiMarkers[poi.id].getElement().style.display = visible ? '' : 'none';
  });
}

// ---- Add markers on load ----
map.on('load', () => {

  // POI markers
  POIS.forEach((poi, i) => {
    const el = makeMarkerEl(i + 1, poi.color, poi.icon);
    poiMarkers[poi.id] = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([poi.lng, poi.lat])
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupHTML(poi)))
      .addTo(map);
  });

  // Sapporo city marker (tab 1 overview)
  poiMarkers.sapporo = new mapboxgl.Marker({ element: makeMarkerEl('', '#e11d48', null), anchor: 'bottom' })
    .setLngLat([SAPPORO.lng, SAPPORO.lat])
    .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<div style="font-family:-apple-system,sans-serif"><b>Sapporo</b><br><span style="font-size:11px;color:#64748b">Client Location · Hokkaido, Japan</span></div>`
    ))
    .addTo(map);

  updateMarkerVisibility(currentTab);

  // POI list click → fly to
  document.querySelectorAll('.poi-item').forEach(item => {
    item.addEventListener('click', () => {
      const poi = POIS.find(p => p.id === item.dataset.id);
      if (!poi) return;
      map.flyTo({ center: [poi.lng, poi.lat], zoom: 14, duration: 1200, essential: true });
    });
  });
});

// ---- Inset overview minimap (bottom-right) ----
const MINIMAP_ZOOM_OFFSET = 3;
const minimapZoom = z => Math.max(z - MINIMAP_ZOOM_OFFSET, 1);

const minimap = new mapboxgl.Map({
  container: 'minimap',
  style: 'mapbox://styles/mapbox/streets-v12',
  language: 'en',
  projection: 'mercator',
  center: map.getCenter(),
  zoom: minimapZoom(map.getZoom()),
  interactive: false,
  attributionControl: false,
});

map.on('move', () => {
  minimap.jumpTo({ center: map.getCenter(), zoom: minimapZoom(map.getZoom()) });
});

// ---- Screenshot download ----
document.getElementById('btn-screenshot').addEventListener('click', async function () {
  const btn = this;
  const ICON_BTN = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M3 9h2M19 9h2M9 3v2M9 19v2M15 3v2M15 19v2"/></svg> Screenshot`;
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

    // Crop to #main only — compute scale between video pixels and CSS pixels
    const rect = document.getElementById('main').getBoundingClientRect();
    const scaleX = video.videoWidth / window.innerWidth;
    const scaleY = video.videoHeight / window.innerHeight;

    const canvas = document.createElement('canvas');
    canvas.width = rect.width * scaleX;
    canvas.height = rect.height * scaleY;
    canvas.getContext('2d').drawImage(
      video,
      rect.left * scaleX, rect.top * scaleY, rect.width * scaleX, rect.height * scaleY,
      0, 0, canvas.width, canvas.height
    );
    stream.getTracks().forEach(t => t.stop());

    const link = document.createElement('a');
    link.download = `sapporo-map-tab${currentTab}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch {
    // user cancelled
  } finally {
    btn.disabled = false;
    btn.innerHTML = ICON_BTN;
  }
});
