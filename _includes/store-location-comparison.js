// ============================================================
// CONSTANTS & DATA
// ============================================================
const GOOGLE_KEY_STORAGE = 'store_comparison_google_api_key';
let googleApiKey = localStorage.getItem(GOOGLE_KEY_STORAGE) || '';

// Brand icon URLs - using map marker icons from store-info.skylark.co.jp
const brandIconURLs = {
  'ガスト': 'assets/brand-icons/gusto_marker.png',
  'ジョナサン': 'assets/brand-icons/jonathan_marker.png',
  'バーミヤン': 'assets/brand-icons/bamiyan_marker.png',
  'しゃぶ葉': 'assets/brand-icons/shabuyo_marker.png',
  'むさしの森珈琲': 'assets/brand-icons/mmcoffee.png',
  'とんから亭': 'assets/brand-icons/tonkara_tei.png',
  'グランブッフェ': 'assets/brand-icons/grandbuffet.png',
  '資さんうどん': 'assets/brand-icons/sukesanudon.png'
};

let STORES = [];

const BRAND_MAPPING = {
  '0101': 'ガスト',
  '0102': 'バーミヤン',
  '0103': 'ジョナサン',
  '0104': '夢庵',
  '0105': 'ステーキガスト',
  '0106': 'グラッチェガーデンズ',
  '0107': '藍屋',
  '0109': '魚屋路',
  '0110': 'chawan',
  '0111': '三〇三',
  '0112': 'ゆめあん食堂',
  '0113': 'ラ・オハナ',
  '0114': 'とんから亭',
  '0117': 'から好し',
  '0119': 'しゃぶ葉',
  '0120': '桃菜',
  '0121': '八郎そば',
  '0201': 'むさしの森珈琲',
  '0202': 'フォレスト',
  '0203': 'ニューマーケット',
  '0204': 'フェスタガーデン',
  '0205': 'グランブッフェ',
  '0206': '包包點心',
  '0207': '點心甜心',
  '0208': 'すうぷ',
  '0209': 'くし葉',
  '0210': 'ダイナー',
  '0211': 'ペルティカ',
  '0212': 'ザ ブッフェ',
  '0213': '八献',
  '0220': 'アソート',
  '0301': 'フロプレステージュ',
  '0401': 'トマト＆オニオン',
  '0402': 'じゅうじゅうカルビ',
  '0501': '資さんうどん'
};

async function loadStoresFromJSON() {
  try {
    const response = await fetch('skylark-stores.json');
    if (!response.ok) throw new Error(`Failed to load: ${response.status}`);
    const data = await response.json();

    let storesArray = [];
    if (Array.isArray(data)) {
      storesArray = data;
    } else if (data && Array.isArray(data.items)) {
      storesArray = data.items;
    } else if (data && Array.isArray(data.data)) {
      storesArray = data.data;
    } else if (data && Array.isArray(data.stores)) {
      storesArray = data.stores;
    }

    STORES = storesArray.map((store, index) => {
      const extra = store.extra_fields || {};
      const brandCode = extra['カテゴリ'] || '0101';
      const brand = BRAND_MAPPING[brandCode] || 'その他';
      return {
        id: store.id || index + 1,
        name: store.name,
        brand: brand,
        lat: store.latitude,
        lng: store.longitude,
        address: store.address
      };
    });

    console.log(`Loaded ${STORES.length} stores`);
  } catch (error) {
    console.error('Failed to load stores from skylark-stores.json:', error);
  }
}

// Category icons
const CATEGORY_ICONS = {
  'parking': '🅿️',
  'restaurant': '🍽️',
  'cafe': '☕',
  'convenience': '🏪',
  'landmark': '🏛️',
  'station': '🚉',
  'hospital': '🏥',
  'school': '🏫',
  'park': '🌳',
  'default': '📍'
};

// ============================================================
// STATE
// ============================================================
let state = {
  selectedStore: null,
  radius: 1000,
  googlePOIs: [],
  mapboxPOIs: [],
  mergedPOIs: [],
  currentFilter: 'all'
};

// ============================================================
// MAPS
// ============================================================
let googleMap = null;
let mapboxMap = null;
let googleMarkers = [];
let mapboxMarkers = [];
let googleStoreMarker = null;
let isSyncing = false;

// ============================================================
// GOOGLE MAPS
// ============================================================
function loadGoogleMaps() {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) { resolve(); return; }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function initGoogleMap() {
  await loadGoogleMaps();
  googleMap = new google.maps.Map(document.getElementById('google-map'), {
    center: { lat: 35.6812, lng: 139.7671 },
    zoom: 16,  // +1 for parity with Mapbox zoom 15
    mapId: 'DEMO_MAP_ID',  // Required for WebGL features like tilt/heading
    tilt: 0,
    heading: 0
  });

  // Set up sync listeners
  ['center_changed', 'zoom_changed', 'tilt_changed', 'heading_changed'].forEach(event => {
    googleMap.addListener(event, syncFromGoogle);
  });
}

function plotGoogleMarkers(pois) {
  googleMarkers.forEach(m => m.setMap(null));
  googleMarkers = [];

  pois.forEach((poi, i) => {
    const marker = new google.maps.Marker({
      position: { lat: poi.lat, lng: poi.lng },
      map: googleMap,
      label: String(i + 1),
      title: poi.name
    });
    googleMarkers.push(marker);
  });
}

function plotGoogleStoreMarker(lat, lng, name, brand) {
  if (googleStoreMarker) {
    googleStoreMarker.setMap(null);
  }

  // Use brand icon if available, otherwise use default red marker
  const iconUrl = brandIconURLs[brand];
  const icon = iconUrl ? {
    url: iconUrl,
    scaledSize: new google.maps.Size(48, 48),
    anchor: new google.maps.Point(24, 24)
  } : {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 15,
    fillColor: '#ED1C24',
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 3
  };

  googleStoreMarker = new google.maps.Marker({
    position: { lat, lng },
    map: googleMap,
    icon: icon,
    title: name,
    zIndex: 1000
  });
}

async function searchGoogleNearby(lat, lng, radius) {
  if (!window.google?.maps) await initGoogleMap();

  const service = new google.maps.places.PlacesService(googleMap);

  return new Promise((resolve) => {
    service.nearbySearch({
      location: { lat, lng },
      radius: radius
    }, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const pois = results.map(r => ({
          id: r.place_id,
          name: r.name || '',
          lat: r.geometry?.location?.lat() || 0,
          lng: r.geometry?.location?.lng() || 0,
          types: r.types || [],
          source: 'google'
        }));
        resolve(pois);
      } else {
        resolve([]);
      }
    });
  });
}

// ============================================================
// MAPBOX
// ============================================================

// Load brand icon image for map markers using Mapbox's loadImage
// This avoids CORS issues when loading from file:// protocol
function loadBrandIcon(brand) {
  return new Promise((resolve, reject) => {
    mapboxMap.loadImage(brandIconURLs[brand], (error, image) => {
      if (error) {
        reject(error);
      } else {
        resolve(image);
      }
    });
  });
}

function initMapboxMap() {
  mapboxMap = new mapboxgl.Map({
    container: 'mapbox-map',
    style: 'mapbox://styles/kenji-shima/cmmtz45at001501sm99f0eima',
    center: [139.7671, 35.6812],
    zoom: 15,
    pitch: 0,
    bearing: 0,
    dragRotate: false,  // Disable right-click drag to rotate
    pitchWithRotate: false,  // Disable pitch adjustment with rotation
    touchZoomRotate: false  // Disable rotation on touch devices
  });

  // Set up sync listener - 'move' covers center, zoom, pitch, and bearing
  mapboxMap.on('move', syncFromMapbox);

  // Update zoom display
  const updateZoomDisplay = () => {
    const zoomDisplay = document.getElementById('zoom-display');
    if (zoomDisplay) {
      zoomDisplay.textContent = `Zoom: ${mapboxMap.getZoom().toFixed(2)}`;
    }
  };

  mapboxMap.on('zoom', updateZoomDisplay);

  mapboxMap.on('load', async () => {
    updateZoomDisplay();

    // Load brand icons for map
    const brands = Object.keys(brandIconURLs);
    const imagePromises = brands.map(brand => {
      return loadBrandIcon(brand).then(imageData => {
        const imageId = `brand-${brand}`;
        mapboxMap.addImage(imageId, imageData);
      });
    });

    // Wait for all images to load, then add blank fallback image
    await Promise.all(imagePromises);

    const fallbackCanvas = document.createElement('canvas');
    fallbackCanvas.width = 48; fallbackCanvas.height = 48;
    const ctx = fallbackCanvas.getContext('2d');
    ctx.beginPath();
    ctx.arc(24, 24, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#ED1C24';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();
    mapboxMap.addImage('brand-default', ctx.getImageData(0, 0, 48, 48));

    // Add source for selected store marker
    mapboxMap.addSource('selected-store', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });

    // Add symbol layer for selected store
    mapboxMap.addLayer({
      id: 'selected-store-icon',
      type: 'symbol',
      source: 'selected-store',
      layout: {
        'icon-image': ['coalesce', ['image', ['concat', 'brand-', ['get', 'brand']]], ['image', 'brand-default']],
        'icon-size': 0.6,
        'icon-allow-overlap': true,
        'icon-ignore-placement': true
      }
    });

    // Add road detail source
    if (!mapboxMap.getSource('road-detail')) {
      mapboxMap.addSource('road-detail', {
        type: 'vector',
        url: 'mapbox://mapbox.road-detail-v1'
      });
    }

    const beforeId = 'road-secondary-tertiary';

    // Add road-detail-shape layer (line outlines)
    if (!mapboxMap.getLayer('road-detail-shape')) {
      // mapboxMap.addLayer({
      //   id: 'road-detail-shape',
      //   type: 'line',
      //   source: 'road-detail',
      //   'source-layer': 'road_detail_shape',
      //   filter: [
      //     'all',
      //     ['match', ['get', 'structure'], ['tunnel'], false, true],
      //     ['match', ['geometry-type'], ['LineString'], true, false]
      //   ],
      //   paint: {
      //     'line-color': 'hsl(214, 23%, 70%)'
      //   }
      // }, beforeId);
    }

    // Add road-detail-other layer (fill for various road types)
    if (!mapboxMap.getLayer('road-detail-other')) {
      // mapboxMap.addLayer({
      //   id: 'road-detail-other',
      //   type: 'fill',
      //   source: 'road-detail',
      //   'source-layer': 'road_detail_shape',
      //   filter: [
      //     'all',
      //     ['==', ['geometry-type'], 'Polygon'],
      //     ['match', ['get', 'class'], ['construction', 'motorway', 'motorway_link'], false, true],
      //     ['match', ['get', 'type'], ['sidewalk'], false, true]
      //   ],
      //   paint: {
      //     'fill-color': [
      //       'case',
      //       ['match', ['get', 'class'], ['motorway', 'motorway_link'], true, false],
      //       'hsl(214, 23%, 70%)',
      //       ['match', ['get', 'class'], ['trunk', 'trunk_link'], true, false],
      //       'hsl(214, 23%, 70%)',
      //       ['match', ['get', 'class'], ['primary', 'primary_link', 'secondary', 'secondary_link'], true, false],
      //       'hsl(224, 25%, 80%)',
      //       ['==', ['get', 'class'], 'pedestrian'],
      //       'hsl(20, 20%, 95%)',
      //       ['==', ['get', 'structure'], 'tunnel'],
      //       'hsl(214, 23%, 86%)',
      //       ['==', ['get', 'type'], 'circuit_track'],
      //       'hsl(60, 46%, 87%)',
      //       ['==', ['get', 'type'], 'street/thin_road/garden_path'],
      //       'hsl(91, 63%, 92%)',
      //       ['==', ['get', 'type'], 'golf_course'],
      //       'hsl(51, 54%, 92%)',
      //       ['==', ['get', 'type'], 'pitmouth'],
      //       'hsl(0, 0%, 81%)',
      //       ['==', ['get', 'class'], 'path'],
      //       'hsl(295, 10%, 96%)',
      //       ['==', ['get', 'class'], 'barrier'],
      //       'hsl(91, 53%, 89%)',
      //       'hsl(224, 25%, 80%)'
      //     ]
      //   }
      // }, beforeId);
    }

    // Add road-detail-sidewalk layer (fill for sidewalks)
    if (!mapboxMap.getLayer('road-detail-sidewalk')) {
      // mapboxMap.addLayer({
      //   id: 'road-detail-sidewalk',
      //   type: 'fill',
      //   source: 'road-detail',
      //   'source-layer': 'road_detail_shape',
      //   filter: [
      //     'all',
      //     ['==', ['geometry-type'], 'Polygon'],
      //     ['match', ['get', 'type'], ['sidewalk'], true, false]
      //   ],
      //   paint: {
      //     'fill-color': 'hsl(0, 2%, 90%)'
      //   }
      // }, beforeId);
    }

    // Add road-detail-motorways layer (fill for motorways)
    if (!mapboxMap.getLayer('road-detail-motorways')) {
      // mapboxMap.addLayer({
      //   id: 'road-detail-motorways',
      //   type: 'fill',
      //   source: 'road-detail',
      //   'source-layer': 'road_detail_shape',
      //   filter: [
      //     'all',
      //     ['==', ['geometry-type'], 'Polygon'],
      //     ['match', ['get', 'class'], ['motorway', 'motorway_link'], true, false],
      //     ['!=', ['get', 'structure'], 'tunnel']
      //   ],
      //   paint: {
      //     'fill-color': 'hsl(27, 64%, 72%)'
      //   }
      // }, beforeId);
    }
  });
}

// Sync functions
function syncFromGoogle() {
  if (isSyncing || !mapboxMap) return;
  isSyncing = true;

  const center = googleMap.getCenter();
  mapboxMap.jumpTo({
    center: [center.lng(), center.lat()],
    zoom: googleMap.getZoom() - 1,  // Google zoom - 1 for parity (256px vs 512px tiles)
    pitch: googleMap.getTilt(),
    bearing: googleMap.getHeading()
  });

  // Reset flag after events have been processed
  requestAnimationFrame(() => { isSyncing = false; });
}

function syncFromMapbox() {
  if (isSyncing || !googleMap) return;
  isSyncing = true;

  const center = mapboxMap.getCenter();
  googleMap.setOptions({
    center: { lat: center.lat, lng: center.lng },
    zoom: mapboxMap.getZoom() + 1,  // Mapbox zoom + 1 for parity (512px vs 256px tiles)
    tilt: mapboxMap.getPitch(),
    heading: mapboxMap.getBearing()
  });

  // Reset flag after events have been processed
  requestAnimationFrame(() => { isSyncing = false; });
}


function plotMapboxMarkers(pois) {
  mapboxMarkers.forEach(m => m.remove());
  mapboxMarkers = [];

  pois.forEach((poi, i) => {
    const el = document.createElement('div');
    Object.assign(el.style, {
      width: '28px', height: '28px', background: '#ea4335',
      borderRadius: '50%', color: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '12px', fontWeight: 'bold',
      border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      cursor: 'pointer'
    });
    el.textContent = String(i + 1);

    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat([poi.lng, poi.lat])
      .addTo(mapboxMap);

    mapboxMarkers.push(marker);
  });
}

function plotMapboxStoreMarker(lng, lat, name, brand) {
  // Update the GeoJSON source with the selected store location
  if (!mapboxMap.getSource('selected-store')) return;

  mapboxMap.getSource('selected-store').setData({
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      properties: {
        brand: brand,
        name: name
      }
    }]
  });
}

async function searchMapboxTilequery(lat, lng, radius) {
  const radiusMeters = radius;
  const url = `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/${lng},${lat}.json?radius=${radiusMeters}&limit=50&layers=poi_label&access_token=${mapboxgl.accessToken}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.features) return [];

    const pois = data.features.map(f => ({
      id: f.id,
      name: f.properties.name || f.properties.class || 'Unknown',
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
      types: [f.properties.class, f.properties.type].filter(Boolean),
      source: 'mapbox'
    }));

    return pois;
  } catch (error) {
    console.error('Mapbox Tilequery error:', error);
    return [];
  }
}

// ============================================================
// POI MERGING
// ============================================================
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function mergePOIs(googlePOIs, mapboxPOIs, storeLat, storeLng) {
  const merged = [];
  const processedMapbox = new Set();

  // Process Google POIs
  googlePOIs.forEach(gPoi => {
    let matchedMapbox = null;

    // Try to find matching Mapbox POI (within 50m and similar name)
    mapboxPOIs.forEach((mPoi, idx) => {
      if (processedMapbox.has(idx)) return;

      const dist = calculateDistance(gPoi.lat, gPoi.lng, mPoi.lat, mPoi.lng);
      if (dist < 50) {
        matchedMapbox = mPoi;
        processedMapbox.add(idx);
      }
    });

    const distance = calculateDistance(storeLat, storeLng, gPoi.lat, gPoi.lng);

    merged.push({
      name: gPoi.name,
      lat: gPoi.lat,
      lng: gPoi.lng,
      category: getCategoryFromTypes(gPoi.types),
      types: gPoi.types,
      hasGoogle: true,
      hasMapbox: !!matchedMapbox,
      distance: Math.round(distance),
      googleId: gPoi.id,
      mapboxId: matchedMapbox?.id
    });
  });

  // Add Mapbox-only POIs
  mapboxPOIs.forEach((mPoi, idx) => {
    if (processedMapbox.has(idx)) return;

    const distance = calculateDistance(storeLat, storeLng, mPoi.lat, mPoi.lng);

    merged.push({
      name: mPoi.name,
      lat: mPoi.lat,
      lng: mPoi.lng,
      category: getCategoryFromTypes(mPoi.types),
      types: mPoi.types,
      hasGoogle: false,
      hasMapbox: true,
      distance: Math.round(distance),
      googleId: null,
      mapboxId: mPoi.id
    });
  });

  // Sort by distance
  merged.sort((a, b) => a.distance - b.distance);

  return merged;
}

function getCategoryFromTypes(types) {
  if (!types || types.length === 0) return 'other';

  const type = types[0].toLowerCase();

  if (type.includes('parking')) return 'parking';
  if (type.includes('restaurant') || type.includes('food')) return 'restaurant';
  if (type.includes('cafe') || type.includes('coffee')) return 'cafe';
  if (type.includes('convenience') || type.includes('store')) return 'convenience';
  if (type.includes('landmark') || type.includes('point_of_interest')) return 'landmark';
  if (type.includes('station') || type.includes('transit')) return 'station';
  if (type.includes('hospital') || type.includes('health')) return 'hospital';
  if (type.includes('school') || type.includes('education')) return 'school';
  if (type.includes('park')) return 'park';

  return 'other';
}

function getCategoryIcon(category) {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS.default;
}

// ============================================================
// RENDERING
// ============================================================
function renderResults() {
  const tbody = document.getElementById('results-tbody');
  const filtered = filterPOIs(state.mergedPOIs, state.currentFilter);

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #999;">検索結果がありません</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map((poi, i) => `
    <tr>
      <td><span class="poi-number">${i + 1}</span></td>
      <td>
        <div class="poi-name">
          <span class="poi-icon">${getCategoryIcon(poi.category)}</span>
          <div>
            <div>${poi.name}</div>
            <div class="poi-category">${poi.types.slice(0, 2).join(', ')}</div>
          </div>
        </div>
      </td>
      <td class="center">${poi.hasGoogle ? '<span class="check-mark">✓</span>' : '<span class="cross-mark">✗</span>'}</td>
      <td class="center">${poi.hasMapbox ? '<span class="check-mark">✓</span>' : '<span class="cross-mark">✗</span>'}</td>
      <td class="center"><span class="distance">${poi.distance}m</span></td>
    </tr>
  `).join('');

  updateSummary();
  updateCategoryBreakdown();
}

function filterPOIs(pois, filter) {
  switch (filter) {
    case 'both':
      return pois.filter(p => p.hasGoogle && p.hasMapbox);
    case 'google':
      return pois.filter(p => p.hasGoogle && !p.hasMapbox);
    case 'mapbox':
      return pois.filter(p => !p.hasGoogle && p.hasMapbox);
    default:
      return pois;
  }
}

function updateSummary() {
  const total = state.mergedPOIs.length;
  const both = state.mergedPOIs.filter(p => p.hasGoogle && p.hasMapbox).length;
  const googleOnly = state.mergedPOIs.filter(p => p.hasGoogle && !p.hasMapbox).length;
  const mapboxOnly = state.mergedPOIs.filter(p => !p.hasGoogle && p.hasMapbox).length;

  document.getElementById('total-count').textContent = total;
  document.getElementById('both-count').textContent = both;
  document.getElementById('google-only-count').textContent = googleOnly;
  document.getElementById('mapbox-only-count').textContent = mapboxOnly;
}

function updateCategoryBreakdown() {
  const categories = {};

  state.mergedPOIs.forEach(poi => {
    if (!categories[poi.category]) {
      categories[poi.category] = { google: 0, mapbox: 0 };
    }
    if (poi.hasGoogle) categories[poi.category].google++;
    if (poi.hasMapbox) categories[poi.category].mapbox++;
  });

  const grid = document.getElementById('breakdown-grid');
  grid.innerHTML = Object.entries(categories)
    .sort((a, b) => b[1].google - a[1].google)
    .map(([cat, counts]) => {
      const diff = counts.mapbox - counts.google;
      const diffClass = diff > 0 ? 'positive' : diff < 0 ? 'negative' : '';
      const diffText = diff > 0 ? `+${diff}` : diff;

      return `
        <div class="breakdown-item">
          <span class="breakdown-category">${getCategoryIcon(cat)} ${cat}</span>
          <div class="breakdown-counts">
            <span>G: ${counts.google}</span>
            <span>M: ${counts.mapbox}</span>
            <span class="breakdown-diff ${diffClass}">(${diffText})</span>
          </div>
        </div>
      `;
    }).join('');
}

// ============================================================
// SEARCH
// ============================================================
async function performSearch() {
  if (!state.selectedStore) return;

  // Wait for maps to be initialized
  if (!googleMap || !mapboxMap) {
    console.log('Maps not ready yet, waiting...');
    return;
  }

  const { lat, lng } = state.selectedStore;
  const radius = state.radius;

  // Show loading
  document.getElementById('results-tbody').innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #999;">検索中...</td></tr>';

  // Update maps (disable sync first to avoid loops)
  isSyncing = true;

  googleMap.setCenter({ lat, lng });
  googleMap.setZoom(18);  // +1 for parity with Mapbox zoom 17

  mapboxMap.setCenter([lng, lat]);
  mapboxMap.setZoom(17);

  // Re-enable sync after position update
  requestAnimationFrame(() => { isSyncing = false; });

  // Search both APIs
  // const [googlePOIs, mapboxPOIs] = await Promise.all([
  //   searchGoogleNearby(lat, lng, radius),
  //   searchMapboxTilequery(lat, lng, radius)
  // ]);

  // state.googlePOIs = googlePOIs;
  // state.mapboxPOIs = mapboxPOIs;
  // state.mergedPOIs = mergePOIs(googlePOIs, mapboxPOIs, lat, lng);

  // Update counts
  // document.getElementById('google-count').textContent = `${googlePOIs.length} POIs`;
  // document.getElementById('mapbox-count').textContent = `${mapboxPOIs.length} POIs`;

  // Plot store markers
  plotGoogleStoreMarker(lat, lng, state.selectedStore.name, state.selectedStore.brand);
  plotMapboxStoreMarker(lng, lat, state.selectedStore.name, state.selectedStore.brand);

  // Plot POI markers
  // plotGoogleMarkers(googlePOIs);
  // plotMapboxMarkers(mapboxPOIs);

  // Render results
  // renderResults();
}

// ============================================================
// EVENT HANDLERS
// ============================================================
function populateStoreDropdown(stores) {
  const select = document.getElementById('store-select');
  const currentValue = select.value;

  // Remove all options except the placeholder
  while (select.options.length > 1) select.remove(1);

  stores.forEach(store => {
    const option = document.createElement('option');
    option.value = store.id;
    option.textContent = store.name;
    select.appendChild(option);
  });

  // Restore selection if still in filtered list
  if (stores.some(s => String(s.id) === currentValue)) {
    select.value = currentValue;
  } else {
    select.value = '';
  }
}

function setupEventListeners() {
  // Store search
  document.getElementById('store-search').addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    const filtered = query
      ? STORES.filter(s => s.name.toLowerCase().includes(query))
      : STORES;
    populateStoreDropdown(filtered);
  });

  // Store selection
  document.getElementById('store-select').addEventListener('change', (e) => {
    const storeId = parseInt(e.target.value);
    state.selectedStore = STORES.find(s => s.id === storeId);
    if (state.selectedStore) {
      performSearch();
    }
  });

  // Radius selection
  document.getElementById('radius-select').addEventListener('change', (e) => {
    state.radius = parseInt(e.target.value);
    if (state.selectedStore) {
      performSearch();
    }
  });

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentFilter = btn.dataset.filter;
      renderResults();
    });
  });

  // Export CSV
  document.getElementById('export-btn').addEventListener('click', exportCSV);
}

function exportCSV() {
  if (state.mergedPOIs.length === 0) return;

  const headers = ['#', 'Name', 'Category', 'Google', 'Mapbox', 'Distance(m)', 'Lat', 'Lng'];
  const rows = state.mergedPOIs.map((poi, i) => [
    i + 1,
    poi.name,
    poi.category,
    poi.hasGoogle ? 'Yes' : 'No',
    poi.hasMapbox ? 'Yes' : 'No',
    poi.distance,
    poi.lat,
    poi.lng
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `poi-comparison-${state.selectedStore.name}-${Date.now()}.csv`;
  link.click();
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
  // Load stores from JSON
  await loadStoresFromJSON();

  // Populate store dropdown
  populateStoreDropdown(STORES);

  // Setup event listeners
  setupEventListeners();
  setupGoogleKeyInput();

  // Initialize maps
  initMapboxMap();

  if (googleApiKey) {
    await initGoogleMap();
  } else {
    document.getElementById('google-map').innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;font-size:13px;">Google API Keyを入力してください</div>';
  }
}

// Start
init();
