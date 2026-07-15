// Configuration for Skylark data
const SKYLARK_DATA_FILE = 'skylark-stores.json'; // Local JSON file with store data
const USE_REAL_DATA = true; // Set to false to use dummy data only

// Store data - will be populated from API or use dummy data as fallback
let storeData = {
  type: 'FeatureCollection',
  features: []
};

// Dummy data for fallback
const dummyStoreData = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [139.7671, 35.6812] // Tokyo Station area
      },
      properties: {
        id: 1,
        name: 'ガスト 東京駅前店',
        brand: 'ガスト',
        address: '東京都千代田区丸の内1-9-1',
        phone: '03-1234-5678',
        hours: {
          weekday: '10:00～23:00',
          weekend: '10:00～23:00'
        },
        amenities: ['Wi-Fiあり', 'テイクアウト可', '駐車場あり', '禁煙席あり']
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [139.7025, 35.6895] // Shinjuku
      },
      properties: {
        id: 2,
        name: 'ジョナサン 新宿西口店',
        brand: 'ジョナサン',
        address: '東京都新宿区西新宿1-18-7',
        phone: '03-2345-6789',
        hours: {
          weekday: '7:00～24:00',
          weekend: '7:00～24:00'
        },
        amenities: ['Wi-Fiあり', 'テイクアウト可', '24時間営業', '禁煙席あり']
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [139.6503, 35.6762] // Shibuya
      },
      properties: {
        id: 3,
        name: 'バーミヤン 渋谷店',
        brand: 'バーミヤン',
        address: '東京都渋谷区道玄坂2-10-12',
        phone: '03-3456-7890',
        hours: {
          weekday: '11:00～23:00',
          weekend: '11:00～23:00'
        },
        amenities: ['Wi-Fiあり', 'テイクアウト可', 'デリバリー対応', '駐車場あり']
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [139.7454, 35.6585] // Roppongi
      },
      properties: {
        id: 4,
        name: 'ガスト 六本木店',
        brand: 'ガスト',
        address: '東京都港区六本木4-10-11',
        phone: '03-4567-8901',
        hours: {
          weekday: '10:00～24:00',
          weekend: '10:00～24:00'
        },
        amenities: ['Wi-Fiあり', 'テイクアウト可', '禁煙席あり', 'キッズメニュー']
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [139.6380, 35.6284] // Meguro
      },
      properties: {
        id: 5,
        name: 'しゃぶ葉 目黒店',
        brand: 'しゃぶ葉',
        address: '東京都目黒区目黒3-4-2',
        phone: '03-5678-9012',
        hours: {
          weekday: '11:30～23:00',
          weekend: '11:00～23:00'
        },
        amenities: ['Wi-Fiあり', '食べ放題', '駐車場あり', '個室あり']
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [139.7730, 35.7100] // Ueno
      },
      properties: {
        id: 6,
        name: 'ジョナサン 上野店',
        brand: 'ジョナサン',
        address: '東京都台東区上野6-15-1',
        phone: '03-6789-0123',
        hours: {
          weekday: '7:00～23:00',
          weekend: '8:00～23:00'
        },
        amenities: ['Wi-Fiあり', 'テイクアウト可', 'モーニング', '禁煙席あり']
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [139.7006, 35.6580] // Harajuku
      },
      properties: {
        id: 7,
        name: 'バーミヤン 原宿店',
        brand: 'バーミヤン',
        address: '東京都渋谷区神宮前1-14-25',
        phone: '03-7890-1234',
        hours: {
          weekday: '11:00～22:30',
          weekend: '11:00～23:00'
        },
        amenities: ['Wi-Fiあり', 'テイクアウト可', '禁煙席あり']
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [139.7314, 35.7219] // Ikebukuro
      },
      properties: {
        id: 8,
        name: 'しゃぶ葉 池袋店',
        brand: 'しゃぶ葉',
        address: '東京都豊島区南池袋1-28-1',
        phone: '03-8901-2345',
        hours: {
          weekday: '11:30～23:00',
          weekend: '11:00～23:00'
        },
        amenities: ['Wi-Fiあり', '食べ放題', '個室あり', 'キッズメニュー']
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [139.6917, 35.6938] // Shinjuku
      },
      properties: {
        id: 9,
        name: 'ガスト 新宿三丁目店',
        brand: 'ガスト',
        address: '東京都新宿区新宿3-35-6',
        phone: '03-9012-3456',
        hours: {
          weekday: '24時間',
          weekend: '24時間'
        },
        amenities: ['Wi-Fiあり', 'テイクアウト可', '24時間営業', 'デリバリー対応']
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [139.6972, 35.6596] // Ebisu
      },
      properties: {
        id: 10,
        name: 'ジョナサン 恵比寿店',
        brand: 'ジョナサン',
        address: '東京都渋谷区恵比寿南1-5-5',
        phone: '03-0123-4567',
        hours: {
          weekday: '7:00～23:00',
          weekend: '8:00～23:00'
        },
        amenities: ['Wi-Fiあり', 'テイクアウト可', 'モーニング', '禁煙席あり']
      }
    }
  ]
};

// Load real store data from local JSON file
async function loadStoresFromAPI(mapBounds) {
  if (!USE_REAL_DATA) {
    console.log('Using dummy data (USE_REAL_DATA = false)');
    storeData = dummyStoreData;
    return;
  }

  try {
    console.log('Loading stores from local file:', SKYLARK_DATA_FILE);

    const response = await fetch(SKYLARK_DATA_FILE);

    if (!response.ok) {
      throw new Error(`Failed to load ${SKYLARK_DATA_FILE}: ${response.status}`);
    }

    let data = await response.json();

    // Handle different response formats (direct array vs object with data/items property)
    let storesArray = [];
    if (Array.isArray(data)) {
      storesArray = data;
    } else if (data && Array.isArray(data.items)) {
      // CORS proxy wraps data in {total: N, items: [...]}
      storesArray = data.items;
    } else if (data && Array.isArray(data.data)) {
      storesArray = data.data;
    } else if (data && Array.isArray(data.stores)) {
      storesArray = data.stores;
    } else if (data && Array.isArray(data.features)) {
      storesArray = data.features;
    } else {
      console.log('Unexpected data format:', data);
      throw new Error('Unexpected API response format');
    }

    console.log(`Loaded ${storesArray.length} stores from API for viewport`);

    // Convert API data to GeoJSON format
    storeData = {
      type: 'FeatureCollection',
      features: storesArray.map((store, index) => {
        const extra = store.extra_fields || {};

        // Brand name and icon come directly from the record's own marker data,
        // rather than a hand-maintained code->name table (which drifted out of
        // sync with the real category codes actually present in the data).
        const brandCode = extra.カテゴリ || '0101';
        const marker = (store.marker && store.marker.ja) || {};
        const brandName = marker.name || 'その他';
        const brandIcon = `assets/brand-icons/${brandCode}.png`;

        // Build amenities array from flags (excluding parking - shown separately)
        const amenities = [];
        if (extra['ｗｉ－ｆｉ（有無）フラグ'] === '1') amenities.push('Wi-Fiあり');
        if (extra['持ち帰りフラグ'] === '1') amenities.push('テイクアウト可');
        if (extra['完全禁煙フラグ'] === '1') amenities.push('禁煙席あり');
        if (extra['宅配フラグ'] === '1') amenities.push('宅配あり');
        if (extra['全日２４時間フラグ'] === '1') amenities.push('24時間営業');
        if (extra['サービスロボット（有無）フラグ'] === '1') amenities.push('サービスロボット');
        if (extra['デジタルメニューブック（有無）フラグ'] === '1') amenities.push('デジタルメニューブック');
        if (extra['QR決済（有無）フラグ'] === '1') amenities.push('QR決済対応');
        if (extra['クレジット（有無）フラグ'] === '1') amenities.push('クレジットカード可');
        if (extra['電子マネー（有無）フラグ'] === '1') amenities.push('電子マネー可');
        if (extra['ubereatsフラグ'] === '1') amenities.push('Uber Eats');
        if (extra['demaecanフラグ'] === '1') amenities.push('出前館');
        if (extra['おむつ替え台フラグ'] === '1') amenities.push('おむつ替え台');
        if (extra['車椅子対応フラグ'] === '1') amenities.push('車椅子対応');
        if (extra['多目的トイレフラグ'] === '1') amenities.push('多目的トイレ');
        if (extra['個室フラグ'] === '1') amenities.push('個室あり');
        if (extra['座敷フラグ'] === '1') amenities.push('座敷あり');
        if (extra['コンセント席フラグ'] === '1') amenities.push('コンセント席');

        // Store parking details for separate display
        const parkingInfo = {
          hasParking: extra['駐車場（有無）フラグ'] === '1',
          hasDisabledParking: extra['身障者用駐車場フラグ'] === '1'
        };

        // Build amenity filter flags (used by the 絞り込み検索 sidebar filter)
        const amenityFlags = {};
        AMENITY_FILTERS.forEach(f => { amenityFlags[f.id] = extra[f.key] === '1'; });

        // Option 1: Pre-parse address once at load time for performance
        const parsedAddress = ADDRESS_PARSER.parseAddress(store.address);

        // Extract real menu URL from HTML-wrapped link field (key confirmed across all 4 supported brands)
        const menuHtml = extra['メニューURL'] || extra['メニュー情報（メニュー紹介）PC用'] || '';
        const menuUrlMatch = menuHtml.match(/href="([^"]+)"/);
        const menuUrl = menuUrlMatch ? menuUrlMatch[1] : null;

        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [store.longitude, store.latitude]
          },
          properties: {
            id: parseInt(store.key) || index + 1,
            name: store.name,
            brand: brandName,
            brandIcon: brandIcon,
            address: store.address,
            phone: extra['電話番号'] || 'お問い合わせください',
            hours: {
              weekday: extra['平日'] || '営業時間はお問い合わせください',
              weekend: extra['土曜日'] || extra['日曜・祝日'] || '営業時間はお問い合わせください'
            },
            amenities: amenities,
            // Pre-parsed address components for fast grouping
            prefecture: parsedAddress.prefecture,
            wardCity: parsedAddress.wardCity,
            hasParking: parkingInfo.hasParking,
            hasDisabledParking: parkingInfo.hasDisabledParking,
            menuUrl: menuUrl,
            amenityFlags: amenityFlags
          }
        };
      })
    };

    console.log(`Loaded ${storeData.features.length} stores across all brands`);

  } catch (error) {
    console.error('Failed to load from local file, falling back to dummy data:', error);
    console.log(`💡 Tip: Make sure ${SKYLARK_DATA_FILE} exists in the project root.`);

    // Use dummy data as fallback
    storeData = dummyStoreData;
  }
}

// 絞り込み検索 (amenity filter) definitions: single source of truth for
// data extraction (loadStoresFromAPI) and sidebar UI generation (initAmenityFilters)
const AMENITY_FILTERS = [
  { id: 'delivery', label: '宅配あり', key: '宅配フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/439ff93d-ead7-47e1-8482-63e1e65638d2.png' },
  { id: 'takeout', label: 'テイクアウト可', key: '持ち帰りフラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/64872114-7eee-4ca6-bb88-cd8079e61c88.png' },
  { id: 'ubereats', label: 'Uber Eatsあり', key: 'ubereatsフラグ', icon: 'https://storage.googleapis.com/storelocator-v3-stg-static-local/images/skylark/17f825fc-0795-4b68-b602-5c278e6a34f0.png' },
  { id: 'demaecan', label: '出前館', key: 'demaecanフラグ', icon: 'https://storage.googleapis.com/storelocator-v3-stg-static-local/images/skylark/c5b0c90c-f4fe-481d-9fd7-325b46f58b97.png' },
  { id: 'qrPayment', label: 'QR決済対応', key: 'QR決済（有無）フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/16a23b90-0055-4cdd-bf65-b5cdb0edaf58.png' },
  { id: 'open24h', label: '全日24時間', key: '全日２４時間フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/c91b1e5e-d25f-4b21-b2f1-70cc8bdbdce1.png' },
  { id: 'reservation', label: '予約可', key: '予約フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/b17ab33c-c32f-4111-82cf-b0abb179cfc3.png' },
  { id: 'credit', label: 'クレジット可', key: 'クレジット（有無）フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/e464aa68-7fde-4a89-96b7-f35583731790.png' },
  { id: 'emoney', label: '電子マネー可', key: '電子マネー（有無）フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/ed7a28c3-89db-4b71-b327-48eebac3b990.png' },
  { id: 'wifi', label: 'Wi-Fiあり', key: 'ｗｉ－ｆｉ（有無）フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/76e25fa3-70bc-4b39-9532-bc26d1299e8e.png' },
  { id: 'parking', label: '駐車場あり', key: '駐車場（有無）フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/e623fc3c-ff59-45f5-847b-12bad0257c31.png' },
  { id: 'disabledParking', label: '身障者用駐車場あり', key: '身障者用駐車場フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/f2c1fb52-bd24-45fd-bb58-c6fdd1703b16.png' },
  { id: 'wheelchair', label: '車椅子入店可', key: '車椅子対応フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/cb06972e-8bdf-4600-93c2-e9ee6564a89a.png' },
  { id: 'elevator', label: 'エレベーターあり', key: 'エレベーターフラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/eb9c9a01-179d-4b52-a362-bbeda06c8468.png' },
  { id: 'petTerrace', label: 'テラス席に限りペット同伴可', key: 'ペット同伴可', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/fa865921-a681-47d8-aec2-0eaed140d4f7.png' },
  { id: 'diaper', label: 'おむつ替え台あり', key: 'おむつ替え台フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/743b216e-a674-401f-8a9d-ca44e76aff0a.png' },
  { id: 'multiToilet', label: '多目的トイレあり', key: '多目的トイレフラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/d3c0afc9-46ac-4767-a705-d4caa991dfb4.png' },
  { id: 'partyRoom', label: 'パーティールームあり', key: 'パーティーフラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/12537778-a007-4c3f-8d4d-f7e1ba6811c7.png' },
  { id: 'tatami', label: '座敷(大・小) あり', key: '座敷フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/65d6701a-cb6e-4449-aa21-1d4c1a4e2ff3.png' },
  { id: 'sunken', label: '小上がり(畳席) あり', key: '小上がりフラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/a17a137d-7351-40fe-a4b9-770ddb70904a.png' },
  { id: 'privateRoom', label: '個室・個室風席あり', key: '個室フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/b728a741-b1fd-4320-83a8-71fde462af02.png' },
  { id: 'counter', label: 'カウンター席あり', key: 'カウンター席フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/2ec594ce-5e1f-425f-9c61-ca21c6b2f4ed.png' },
  { id: 'digitalMenu', label: 'デジタルメニューブック', key: 'デジタルメニューブック（有無）フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/996d345e-c9df-402d-a239-b31a5fe60644.png' },
  { id: 'serviceRobot', label: 'サービスロボットあり', key: 'サービスロボット（有無）フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/fa6b95c8-3fd1-4252-9650-00d1b13c2ed4.png' },
  { id: 'noSmoking', label: '禁煙', key: '完全禁煙フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/bbb828bc-dd36-4d7b-ba71-4b678da474b9.png' }
];

// Brand colors for map markers
const brandColors = {
  'ガスト': '#E31837',
  'ジョナサン': '#00A0E9',
  'バーミヤン': '#F39800',
  'しゃぶ葉': '#A0D468'
};

// Brand text for map markers
const brandText = {
  'ガスト': 'ガ',
  'ジョナサン': 'ジ',
  'バーミヤン': 'バ',
  'しゃぶ葉': 'し'
};

// State management
let map;
let selectedStoreId = null;
let currentPopup = null;
let currentZoom = 11;

// Will be initialized after data loads
let filteredStores = [];

// No longer needed - using native symbol layers instead of canvas images

// Address parsing utilities
// Option 3: Pre-compiled regex patterns for better performance
const PREFECTURE_REGEX = /^(東京都|北海道|大阪府|京都府|[^\s]+県)/;
const WARD_CITY_REGEX = /^([^\s]+?(市|区|町|村))/;
const FULL_ADDRESS_REGEX = /^(東京都|北海道|大阪府|京都府|[^\s]+県)([^\s]+?(市|区|町|村))?/;

const ADDRESS_PARSER = {
  // Option 2: Single-pass parser - parse both prefecture and ward/city in one pass
  parseAddress(address) {
    if (!address) return { prefecture: null, wardCity: null };

    // Single regex to capture both prefecture and ward/city
    const match = address.match(FULL_ADDRESS_REGEX);

    return {
      prefecture: match ? match[1] : null,
      wardCity: match && match[2] ? match[2] : null
    };
  },

  // Legacy methods for backward compatibility (now use single-pass internally)
  parsePrefecture(address) {
    return this.parseAddress(address).prefecture;
  },

  parseWardCity(address) {
    return this.parseAddress(address).wardCity;
  },

  // Get administrative area based on zoom level
  getAdminArea(address, zoom) {
    if (zoom >= 13) {
      return null; // Show individual stores
    } else if (zoom >= 11) {
      return this.parseWardCity(address); // Group by ward/city
    } else {
      return this.parsePrefecture(address); // Group by prefecture
    }
  }
};

// Group stores by administrative area
function groupStoresByArea(stores, zoom) {
  const groups = {};
  const individualStores = [];

  stores.forEach(feature => {
    // Option 1: Use pre-parsed address properties instead of parsing on every call
    // This is MUCH faster than parsing strings with regex
    let adminArea;
    if (zoom >= 13) {
      adminArea = null; // Show individual stores
    } else if (zoom >= 11) {
      adminArea = feature.properties.wardCity; // Use pre-parsed ward/city
    } else {
      adminArea = feature.properties.prefecture; // Use pre-parsed prefecture
    }

    if (!adminArea) {
      // Zoom level is high enough to show individual stores
      individualStores.push(feature);
    } else {
      // Group by administrative area
      if (!groups[adminArea]) {
        groups[adminArea] = {
          name: adminArea,
          stores: [],
          coordinates: []
        };
      }
      groups[adminArea].stores.push(feature);
      groups[adminArea].coordinates.push(feature.geometry.coordinates);
    }
  });

  return { groups, individualStores };
}

// Calculate centroid of coordinates
function calculateCentroid(coordinates) {
  if (coordinates.length === 0) return [0, 0];

  const sum = coordinates.reduce((acc, coord) => {
    return [acc[0] + coord[0], acc[1] + coord[1]];
  }, [0, 0]);

  return [sum[0] / coordinates.length, sum[1] / coordinates.length];
}

// Currently rendered area-group DOM markers, tracked so they can be cleared on each update
let areaGroupMarkers = [];

// Render area-group markers as DOM elements (label + count pill), matching
// the reference store-locator UI. Native symbol layers can't render a
// two-tone bordered pill, so these use mapboxgl.Marker instead.
function renderAreaGroupMarkers(groups) {
  areaGroupMarkers.forEach(marker => marker.remove());
  areaGroupMarkers = [];

  Object.entries(groups).forEach(([areaName, group]) => {
    const centroid = calculateCentroid(group.coordinates);
    const count = group.stores.length;

    const el = document.createElement('div');
    el.className = 'area-group-marker';
    el.innerHTML = `<span class="area-label">${areaName}</span><span class="area-count">${count}</span>`;
    el.addEventListener('click', () => {
      map.easeTo({
        center: centroid,
        zoom: Math.min(currentZoom + 3, 16),
        duration: 1000
      });
    });

    const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
      .setLngLat(centroid)
      .addTo(map);

    areaGroupMarkers.push(marker);
  });
}

// Load brand icon image for map markers
function loadBrandIcon(iconPath) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Use original image dimensions to preserve aspect ratio
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      // Draw the image at original size
      ctx.drawImage(img, 0, 0);

      // Get ImageData for Mapbox
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      resolve(imageData);
    };

    img.onerror = () => reject(new Error(`Failed to load icon: ${iconPath}`));
    img.src = iconPath;
  });
}

// Initialize map
function initMap() {
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/kenji-shima/cmp0s13iw000101sdhqok52gy',
    center: [139.7025, 35.6895], // Center on Tokyo
    zoom: 11,
    language: 'ja'
  });

  map.on('load', async () => {
    // Load stores from API using expanded region (not just viewport)
    // This loads more stores upfront but eliminates API calls on pan
    await loadStoresFromAPI(null); // null = use default expanded bounds

    // Add hasParking property to all features
    storeData.features = storeData.features.map(feature => ({
      ...feature,
      properties: {
        ...feature.properties,
        hasParking: feature.properties.hasParking,
        hasDisabledParking: feature.properties.hasDisabledParking
      }
    }));

    // Initialize filtered stores
    filteredStores = storeData.features;

    // Update the UI with loaded stores
    updateStoreListImmediate(); // Immediate update on initial load
    updateStoreCount();
    initBrandFilters(); // Re-initialize brand filters with actual data

    // Add Japanese language support
    if (typeof MapboxLanguage !== 'undefined') {
      map.addControl(new MapboxLanguage({
        defaultLanguage: 'ja'
      }));
    }

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add current-location control, matching the reference site's locate-me
    // button: shows a marker at the user's position and zooms in to it.
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: false,
      showUserLocation: true,
      fitBoundsOptions: { maxZoom: 15 }
    });
    map.addControl(geolocateControl, 'top-right');

    // Trigger it automatically on load so the map centers on the user's
    // location right away, without requiring them to click the button first.
    // GeolocateControl attaches itself to the map asynchronously (it checks
    // geolocation support via navigator.permissions first), so poll until
    // it's actually ready rather than guessing a fixed delay.
    const triggerWhenReady = setInterval(() => {
      if (geolocateControl._map) {
        clearInterval(triggerWhenReady);
        geolocateControl.trigger();
      }
    }, 50);

    // Load brand icons for map - one per distinct brand actually present in the data
    const brandIconsByName = {};
    storeData.features.forEach(f => {
      if (!brandIconsByName[f.properties.brand]) {
        brandIconsByName[f.properties.brand] = f.properties.brandIcon;
      }
    });
    const imagePromises = Object.entries(brandIconsByName).map(([brand, iconPath]) => {
      return loadBrandIcon(iconPath).then(imageData => {
        const imageId = `brand-${brand}`;
        map.addImage(imageId, imageData);
      });
    });

    // Wait for all images to load, then add layers
    Promise.all(imagePromises).then(() => {
      // Add source for individual stores
      map.addSource('stores', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Add symbol layer for individual stores (brand icons)
      map.addLayer({
        id: 'store-icons',
        type: 'symbol',
        source: 'stores',
        layout: {
          'icon-image': ['concat', 'brand-', ['get', 'brand']],
          'icon-size': 0.6,
          'icon-anchor': 'bottom',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true
        }
      });

      // Add parking indicator text
      map.addLayer({
        id: 'parking-text',
        type: 'symbol',
        source: 'stores',
        filter: ['==', ['get', 'hasParking'], true],
        layout: {
          'text-field': 'P',
          'text-size': 16,
          'text-offset': PARKING_BASE_OFFSET,
          'text-allow-overlap': true,
          'text-ignore-placement': true,
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold']
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#9C27B0',
          'text-halo-width': 8,
          'text-halo-blur': 0
        }
      });

      // Add click handler for store icons
      map.on('click', 'store-icons', (e) => {
        if (e.features && e.features.length > 0) {
          const feature = e.features[0];
          selectStore(feature.properties.id);

          // Center on the clicked store and show popup
          const targetZoom = Math.max(map.getZoom(), 15);
          const offsetCenter = getCenterOffset(feature.geometry.coordinates, targetZoom);

          map.flyTo({
            center: offsetCenter,
            zoom: targetZoom,
            duration: 500
          });

          map.once('moveend', () => {
            showPopup(feature);
          });
        }
      });

      // Change cursor on hover for store icons
      map.on('mouseenter', 'store-icons', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'store-icons', () => {
        map.getCanvas().style.cursor = '';
      });

      // Initial render
      currentZoom = map.getZoom();
      updateMapLayers();

      // Update selection state
      updateSymbolState();
    });

    // Add zoom handler to update grouping
    // Use 'zoomend' instead of 'zoom' - fires once when zoom animation completes
    map.on('zoomend', () => {
      const newZoom = map.getZoom();
      const oldLevel = getZoomLevel(currentZoom);
      const newLevel = getZoomLevel(newZoom);

      currentZoom = newZoom;

      // Update layers if zoom level crosses thresholds
      if (oldLevel !== newLevel) {
        updateMapLayers(); // No debouncing needed - zoomend only fires once
      }
    });

    // Add map move handler to update visible stores (no API reload needed)
    // Viewport filtering happens in updateMapLayers() - no debouncing needed
    map.on('moveend', () => {
      // Update map layers, list, and count with viewport filtering
      // This only processes visible stores, making it fast enough for real-time updates
      updateMapLayers();
      updateStoreListImmediate();
      updateStoreCount();
    });
  });
}

// Get zoom level category
function getZoomLevel(zoom) {
  if (zoom >= 13) return 'individual';
  if (zoom >= 11) return 'ward';
  return 'prefecture';
}

// Filter stores to only those visible in current viewport with padding
function getVisibleStores(allStores, mapBounds, padding = 0.15) {
  // Add padding to bounds for smoother panning experience
  // padding in degrees (~15km at Tokyo latitude)
  const north = mapBounds.getNorth() + padding;
  const south = mapBounds.getSouth() - padding;
  const east = mapBounds.getEast() + padding;
  const west = mapBounds.getWest() - padding;

  return allStores.filter(feature => {
    const [lng, lat] = feature.geometry.coordinates;
    return lat >= south && lat <= north && lng >= west && lng <= east;
  });
}

// Update map layers based on current zoom and filtered stores
function updateMapLayers() {
  if (!map.getSource('stores')) return;

  const zoom = map.getZoom();
  const bounds = map.getBounds();

  // KEY OPTIMIZATION: Only process stores visible in viewport
  // This reduces processing from ~255 stores to ~30-80 stores
  const visibleStores = getVisibleStores(filteredStores, bounds);

  const { groups, individualStores } = groupStoresByArea(visibleStores, zoom);

  // Render area-group markers as DOM pills (label + count)
  renderAreaGroupMarkers(groups);

  // Update individual stores source
  map.getSource('stores').setData({
    type: 'FeatureCollection',
    features: individualStores
  });

  console.log(`Zoom ${zoom.toFixed(1)}: ${visibleStores.length} visible of ${filteredStores.length} total | ${Object.keys(groups).length} groups, ${individualStores.length} individual stores`);
}

// Calculate center offset to position store south of center
function getCenterOffset(coordinates, zoom) {
  // Offset latitude to shift the visual center northward
  // This makes the store appear south of center (good for popups)
  const latOffset = 0.003 / Math.pow(2, zoom - 15); // Scales with zoom
  return [coordinates[0], coordinates[1] + latOffset];
}

// Update symbol state based on selection
function updateSymbolState() {
  if (!map.getLayer('store-icons')) return;

  // Use filter to highlight selected store
  if (selectedStoreId) {
    // You can add a separate layer for selected state or use paint properties
    map.setPaintProperty('store-icons', 'icon-opacity', [
      'case',
      ['==', ['get', 'id'], selectedStoreId],
      1,
      0.7
    ]);
    startSelectedStorePulse();
  } else {
    map.setPaintProperty('store-icons', 'icon-opacity', 1);
    stopSelectedStorePulse();
  }
}

// Heartbeat pulse animation for the selected store's icon only
const STORE_ICON_BASE_SIZE = 0.6;
const PARKING_BASE_OFFSET = [1.5, -4.0];
let pulseAnimationId = null;

function startSelectedStorePulse() {
  if (pulseAnimationId) return; // already running

  function animate(timestamp) {
    if (!selectedStoreId || !map.getLayer('store-icons')) {
      pulseAnimationId = null;
      return;
    }
    const scale = STORE_ICON_BASE_SIZE + Math.abs(Math.sin(timestamp / 500)) * 0.25;
    const scaleRatio = scale / STORE_ICON_BASE_SIZE;
    map.setLayoutProperty('store-icons', 'icon-size', [
      'case',
      ['==', ['get', 'id'], selectedStoreId],
      scale,
      STORE_ICON_BASE_SIZE
    ]);
    if (map.getLayer('parking-text')) {
      map.setLayoutProperty('parking-text', 'text-offset', [
        'case',
        ['==', ['get', 'id'], selectedStoreId],
        ['literal', [PARKING_BASE_OFFSET[0] * scaleRatio, PARKING_BASE_OFFSET[1] * scaleRatio]],
        ['literal', PARKING_BASE_OFFSET]
      ]);
    }
    pulseAnimationId = requestAnimationFrame(animate);
  }

  pulseAnimationId = requestAnimationFrame(animate);
}

function stopSelectedStorePulse() {
  if (pulseAnimationId) {
    cancelAnimationFrame(pulseAnimationId);
    pulseAnimationId = null;
  }
  if (map.getLayer('store-icons')) {
    map.setLayoutProperty('store-icons', 'icon-size', STORE_ICON_BASE_SIZE);
  }
  if (map.getLayer('parking-text')) {
    map.setLayoutProperty('parking-text', 'text-offset', PARKING_BASE_OFFSET);
  }
}

// Create popup content
function createPopupContent(feature) {
  const props = feature.properties;

  // Parse amenities if it's a string (happens when feature comes from map click)
  const amenities = typeof props.amenities === 'string'
    ? JSON.parse(props.amenities)
    : props.amenities;

  // Parse hours if it's a string
  const hours = typeof props.hours === 'string'
    ? JSON.parse(props.hours)
    : props.hours;

  const amenitiesText = amenities.length ? amenities.join('／') : 'なし';

  const menuButton = props.menuUrl
    ? `<a class="popup-menu-btn" href="${props.menuUrl}" target="_blank" rel="noopener">メニュー表示</a>`
    : '';

  return `
    <div class="popup-header">
      <h3>${props.name}</h3>
      <button class="popup-close" onclick="closePopup()">
        <svg width="14" height="14" viewBox="0 0 14 14">
          <line x1="1" y1="1" x2="13" y2="13" stroke="#ED1C24" stroke-width="1.1"/>
          <line x1="13" y1="1" x2="1" y2="13" stroke="#ED1C24" stroke-width="1.1"/>
        </svg>
      </button>
    </div>
    <div class="popup-body">
      <div class="popup-section">
        <div class="popup-label">営業時間</div>
        <div class="popup-value popup-value-bold">
          （平日）：${hours.weekday}<br>
          （土日祝日）：${hours.weekend}
        </div>
      </div>
      <div class="popup-section">
        <div class="popup-label">電話番号</div>
        <div class="popup-value popup-value-bold">${props.phone}</div>
      </div>
      ${props.hasParking ? `
      <div class="popup-section">
        <div class="popup-label">駐車場</div>
        <div class="popup-value popup-value-bold">
          あり${props.hasDisabledParking ? '（身障者用あり）' : ''}
        </div>
      </div>
      ` : ''}
      <div class="popup-section">
        <div class="popup-label">設備・サービス</div>
        <div class="popup-value popup-value-amenities">${amenitiesText}</div>
      </div>
    </div>
    <div class="popup-footer">
      <button class="popup-details-btn">詳細</button>
      ${menuButton}
    </div>
  `;
}

// Show popup
function showPopup(feature) {
  if (currentPopup) {
    currentPopup.remove();
    currentPopup = null;
  }

  currentPopup = new mapboxgl.Popup({
    offset: 90,
    closeButton: false,
    closeOnClick: false
  })
    .setLngLat(feature.geometry.coordinates)
    .setHTML(createPopupContent(feature))
    .addTo(map);
}

// Close popup
function closePopup() {
  if (currentPopup) {
    currentPopup.remove();
    currentPopup = null;
  }
  selectedStoreId = null;
  updateSymbolState();
  document.querySelectorAll('.store-item.active').forEach(item => item.classList.remove('active'));
}

// Make closePopup available globally for the popup close button
window.closePopup = closePopup;

// Update markers on map
function updateMarkers() {
  // Use the new updateMapLayers function
  updateMapLayers();

  // Update selection state
  updateSymbolState();
}

// Select a store
function selectStore(storeId) {
  selectedStoreId = storeId;

  // Update symbol state
  updateSymbolState();

  // Update store list items
  document.querySelectorAll('.store-item').forEach(item => {
    if (parseInt(item.dataset.storeId) === storeId) {
      item.classList.add('active');
      // Scroll to selected item
      item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      item.classList.remove('active');
    }
  });

  // Fly to store location
  const feature = storeData.features.find(f => f.properties.id === storeId);
  if (feature) {
    const offsetCenter = getCenterOffset(feature.geometry.coordinates, 12);
    map.flyTo({
      center: offsetCenter,
      zoom: 12,
      duration: 1000
    });
  }
}

// Initialize brand filters
function initBrandFilters() {
  const brandIconsByName = {};
  storeData.features.forEach(f => {
    if (!brandIconsByName[f.properties.brand]) {
      brandIconsByName[f.properties.brand] = f.properties.brandIcon;
    }
  });
  const brandFiltersContainer = document.getElementById('brand-filters');

  // Clear existing filters
  brandFiltersContainer.innerHTML = '';

  Object.entries(brandIconsByName).forEach(([brand, iconPath]) => {
    const button = document.createElement('button');
    button.className = 'brand-filter';
    button.dataset.brand = brand;
    button.innerHTML = `
      <img src="${iconPath}" class="brand-icon" alt="${brand}">
      <span class="brand-name">${brand}</span>
    `;

    button.addEventListener('click', () => {
      button.classList.toggle('active');
      applyFilters();
    });

    brandFiltersContainer.appendChild(button);
  });
}

// Initialize amenity (絞り込み検索) filter checkboxes
function initAmenityFilters() {
  const container = document.getElementById('amenity-filters');
  container.innerHTML = '';

  AMENITY_FILTERS.forEach(filterDef => {
    const button = document.createElement('button');
    button.className = 'amenity-filter';
    button.dataset.amenityId = filterDef.id;
    button.innerHTML = `
      <img src="${filterDef.icon}" class="amenity-filter-icon" alt="">
      <span class="amenity-filter-name">${filterDef.label}</span>
    `;

    button.addEventListener('click', () => {
      button.classList.toggle('active');
      applyFilters();
    });

    container.appendChild(button);
  });
}

// Apply filters
function applyFilters() {
  const searchText = document.getElementById('search-box').value.toLowerCase();
  const selectedBrands = Array.from(
    document.querySelectorAll('#brand-filters .brand-filter.active')
  ).map(btn => btn.dataset.brand);
  const selectedAmenities = Array.from(
    document.querySelectorAll('#amenity-filters .amenity-filter.active')
  ).map(btn => btn.dataset.amenityId);

  // With no brand selected, show all brands; selecting one or more narrows to just those
  document.getElementById('brand-filters').classList.toggle('has-selection', selectedBrands.length > 0);

  filteredStores = storeData.features.filter(feature => {
    const props = feature.properties;

    // Brand filter
    if (selectedBrands.length > 0 && !selectedBrands.includes(props.brand)) {
      return false;
    }

    // Search filter
    if (searchText) {
      const searchableText = `${props.name} ${props.address} ${props.brand}`.toLowerCase();
      if (!searchableText.includes(searchText)) {
        return false;
      }
    }

    // Amenity filter (絞り込み検索) - AND logic across all selected amenities
    if (selectedAmenities.length > 0) {
      if (!selectedAmenities.every(id => props.amenityFlags[id])) {
        return false;
      }
    }

    return true;
  }).map(feature => {
    // Add computed property for parking availability
    return {
      ...feature,
      properties: {
        ...feature.properties,
        hasParking: feature.properties.hasParking,
        hasDisabledParking: feature.properties.hasDisabledParking
      }
    };
  });

  updateStoreListImmediate(); // Direct call for immediate response to filter clicks
  updateMapLayers(); // Direct call - no debouncing needed for discrete filter actions
  updateStoreCount();

  const hasActiveFilters = selectedAmenities.length > 0 || selectedBrands.length > 0;
  document.getElementById('floating-clear-filters').classList.toggle('visible', hasActiveFilters);
}

// Update store list
// Debounce timer for list updates
let listUpdateTimeout;

// Debounce timer for map layer updates
let mapUpdateTimeout;

// Cache for admin area parsing to avoid re-parsing on every zoom
const adminAreaCache = new Map();

// Debounced wrapper for updateStoreList
function scheduleListUpdate() {
  clearTimeout(listUpdateTimeout);
  listUpdateTimeout = setTimeout(updateStoreListImmediate, 50);
}

// Debounced wrapper for updateMapLayers
function scheduleMapUpdate() {
  clearTimeout(mapUpdateTimeout);
  mapUpdateTimeout = setTimeout(updateMapLayers, 50);
}

// Progressive loading state
let currentVisibleStores = [];
let displayedCount = 0;
const batchSize = 20;

// Immediate list update (called by debouncer or when immediate update needed)
function updateStoreListImmediate() {
  const storeList = document.getElementById('store-list');
  storeList.innerHTML = '';

  // Filter by viewport WITHOUT padding - show only truly visible stores in list
  // (Map uses padding for smooth rendering, but list should match what user sees)
  const bounds = map.getBounds();
  currentVisibleStores = getVisibleStores(filteredStores, bounds, 0); // No padding

  // Reset display counter
  displayedCount = 0;

  // Show initial batch
  appendStoreListBatch();

  // Add scroll listener for progressive loading (the sidebar itself scrolls,
  // not store-list, since header/filters/list all share one scroll region)
  const sidebar = document.getElementById('sidebar');
  sidebar.removeEventListener('scroll', handleStoreListScroll);
  sidebar.addEventListener('scroll', handleStoreListScroll);
}

// Append a batch of stores to the list
function appendStoreListBatch() {
  const storeList = document.getElementById('store-list');

  // Calculate how many stores to show in this batch
  const remainingStores = currentVisibleStores.length - displayedCount;
  if (remainingStores <= 0) return;

  const storesToAdd = Math.min(batchSize, remainingStores);
  const newStores = currentVisibleStores.slice(displayedCount, displayedCount + storesToAdd);

  // Use document fragment to batch DOM operations
  const fragment = document.createDocumentFragment();

  newStores.forEach(feature => {
    const props = feature.properties;

    const storeItem = document.createElement('div');
    storeItem.className = 'store-item';
    storeItem.dataset.storeId = props.id;

    const parkingBadge = props.hasParking
      ? '<span style="background: #9C27B0; color: white; padding: 2px 5px; border-radius: 3px; font-size: 10px; font-weight: bold; margin-right: 4px;">P</span>'
      : '';

    storeItem.innerHTML = `
      <img src="${props.brandIcon}" class="store-brand-icon" alt="${props.brand}">
      <div class="store-info">
        <div class="store-name">${parkingBadge}${props.name}</div>
        <div class="store-address">${props.address}</div>
      </div>
    `;

    storeItem.addEventListener('click', () => {
      selectStore(props.id);

      // Check if map is zoomed in enough to show individual stores
      const currentZoom = map.getZoom();
      if (currentZoom < 12) {
        // Zoom in to show individual stores, then show popup
        const offsetCenter = getCenterOffset(feature.geometry.coordinates, 15);

        map.flyTo({
          center: offsetCenter,
          zoom: 15,
          duration: 1000
        });

        // Show popup after zoom animation completes
        map.once('moveend', () => {
          showPopup(feature);
        });
      } else {
        // Already zoomed in, just center and show popup
        const targetZoom = Math.max(currentZoom, 15);
        const offsetCenter = getCenterOffset(feature.geometry.coordinates, targetZoom);

        map.flyTo({
          center: offsetCenter,
          zoom: targetZoom,
          duration: 800
        });

        map.once('moveend', () => {
          showPopup(feature);
        });
      }
    });

    fragment.appendChild(storeItem);
  });

  // Remove loading indicator if it exists
  const loadingIndicator = storeList.querySelector('.loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.remove();
  }

  // Append new stores
  storeList.appendChild(fragment);
  displayedCount += storesToAdd;

  // Add loading indicator if there are more stores to show
  if (displayedCount < currentVisibleStores.length) {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-indicator';
    loadingDiv.style.cssText = 'padding: 16px 20px; background-color: #f0f0f0; text-align: center; font-size: 13px; color: #666;';
    loadingDiv.textContent = `${displayedCount}件表示中 - スクロールして続きを読み込む`;
    storeList.appendChild(loadingDiv);
  }
}

// Handle scroll event for progressive loading
function handleStoreListScroll() {
  const sidebar = document.getElementById('sidebar');
  const scrollTop = sidebar.scrollTop;
  const scrollHeight = sidebar.scrollHeight;
  const clientHeight = sidebar.clientHeight;

  // Load more when user scrolls to bottom (with 100px threshold)
  if (scrollTop + clientHeight >= scrollHeight - 100) {
    if (displayedCount < currentVisibleStores.length) {
      appendStoreListBatch();
    }
  }
}

// Keep old function name for compatibility, but make it use debounced version
function updateStoreList() {
  scheduleListUpdate();
}

// Update store count
function updateStoreCount() {
  const bounds = map.getBounds();
  // Use no padding to match what's shown in the list
  const visibleStores = getVisibleStores(filteredStores, bounds, 0);

  // Show count of visible stores
  document.getElementById('store-count').textContent =
    `${visibleStores.length}件見つかりました`;
}

// Clear all filters
function clearFilters() {
  // Clear search box
  document.getElementById('search-box').value = '';

  // Deselect all brand filters (no selection = show all brands)
  document.querySelectorAll('#brand-filters .brand-filter').forEach(btn => {
    btn.classList.remove('active');
  });

  // Uncheck all amenity filters
  document.querySelectorAll('#amenity-filters .amenity-filter').forEach(btn => {
    btn.classList.remove('active');
  });

  // Clear selection
  selectedStoreId = null;
  closePopup();

  // Re-apply filters
  applyFilters();

  // Reset map view
  map.flyTo({
    center: [139.7025, 35.6895],
    zoom: 11,
    duration: 1000
  });
}

// Debounce function to limit API calls
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Initialize search with SearchBox API
function initSearch() {
  const searchBox = document.getElementById('search-box');
  const suggestionsContainer = document.getElementById('search-suggestions');

  // Generate a session token for billing (UUIDv4)
  let sessionToken = generateSessionToken();

  // Store suggestion features with their mapbox_id for retrieval
  let currentSuggestions = [];

  // Generate UUIDv4 for session token
  function generateSessionToken() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Function to get search suggestions using SearchBox API
  async function getSuggestions(query) {
    if (!query || query.length < 2) {
      suggestionsContainer.classList.remove('active');
      suggestionsContainer.innerHTML = '';
      currentSuggestions = [];
      return;
    }

    try {
      const center = map.getCenter();
      const response = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/suggest?` +
        `q=${encodeURIComponent(query)}&` +
        `access_token=${mapboxgl.accessToken}&` +
        `session_token=${sessionToken}&` +
        `language=ja&` +
        `country=JP&` +
        `proximity=${center.lng},${center.lat}&` +
        `types=place,address,poi,street,locality,neighborhood&` +
        `limit=5`
      );

      if (!response.ok) {
        throw new Error(`SearchBox API error: ${response.status}`);
      }

      const data = await response.json();
      currentSuggestions = data.suggestions || [];
      displaySuggestions(currentSuggestions);
    } catch (error) {
      console.error('Search error:', error);
      suggestionsContainer.innerHTML = '<div class="suggestion-item">エラーが発生しました</div>';
      suggestionsContainer.classList.add('active');
    }
  }

  // Function to display suggestions
  function displaySuggestions(suggestions) {
    suggestionsContainer.innerHTML = '';

    if (!suggestions || suggestions.length === 0) {
      suggestionsContainer.innerHTML = '<div class="suggestion-item">検索結果が見つかりませんでした</div>';
      suggestionsContainer.classList.add('active');
      return;
    }

    suggestions.forEach((suggestion, index) => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';

      const name = document.createElement('div');
      name.className = 'suggestion-name';
      // Use name property from SearchBox API
      name.textContent = suggestion.name || suggestion.text || '';

      const address = document.createElement('div');
      address.className = 'suggestion-address';
      // Use place_formatted for geographic context without duplicating name
      address.textContent = suggestion.place_formatted || '';

      item.appendChild(name);
      item.appendChild(address);

      // Handle click on suggestion
      item.addEventListener('click', () => {
        selectSuggestion(suggestion, index);
      });

      suggestionsContainer.appendChild(item);
    });

    suggestionsContainer.classList.add('active');
  }

  // Function to handle suggestion selection
  async function selectSuggestion(suggestion, index) {
    try {
      // For SearchBox API, we need to retrieve full details using the mapbox_id
      const retrieveResponse = await fetch(
        `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.mapbox_id}?` +
        `access_token=${mapboxgl.accessToken}&` +
        `session_token=${sessionToken}`
      );

      if (!retrieveResponse.ok) {
        throw new Error(`Retrieve API error: ${retrieveResponse.status}`);
      }

      const data = await retrieveResponse.json();

      // Get coordinates from the retrieved feature
      const feature = data.features && data.features[0];
      if (!feature || !feature.geometry || !feature.geometry.coordinates) {
        throw new Error('Invalid feature data');
      }

      const [lng, lat] = feature.geometry.coordinates;

      // Update input with selected place name
      searchBox.value = suggestion.full_address || suggestion.place_formatted || suggestion.name;

      // Hide suggestions
      suggestionsContainer.classList.remove('active');
      suggestionsContainer.innerHTML = '';
      currentSuggestions = [];

      // Generate new session token for next search
      sessionToken = generateSessionToken();

      // Fly to the location
      map.flyTo({
        center: [lng, lat],
        zoom: 14,
        duration: 1000
      });
    } catch (error) {
      console.error('Error retrieving suggestion details:', error);
      // Fallback: try to use coordinates from suggestion if available
      if (suggestion.geometry && suggestion.geometry.coordinates) {
        const [lng, lat] = suggestion.geometry.coordinates;
        searchBox.value = suggestion.full_address || suggestion.name;
        suggestionsContainer.classList.remove('active');
        suggestionsContainer.innerHTML = '';
        sessionToken = generateSessionToken();

        map.flyTo({
          center: [lng, lat],
          zoom: 14,
          duration: 1000
        });
      } else {
        alert('選択した場所の詳細を取得できませんでした');
      }
    }
  }

  // Add event listener with debounce
  searchBox.addEventListener('input', debounce((e) => {
    getSuggestions(e.target.value.trim());
  }, 300));

  // Close suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchBox.contains(e.target) && !suggestionsContainer.contains(e.target)) {
      suggestionsContainer.classList.remove('active');
    }
  });

  // Handle keyboard navigation
  searchBox.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      suggestionsContainer.classList.remove('active');
      suggestionsContainer.innerHTML = '';
      searchBox.blur();
    }
  });
}

// Initialize UI event listeners
function initUIEvents() {
  // Initialize search
  initSearch();

  // Clear filters button
  document.getElementById('clear-filters').addEventListener('click', clearFilters);

  // Brand filter toggle
  const brandFilterToggle = document.getElementById('brand-filter-toggle');
  const brandFilters = document.getElementById('brand-filters');

  brandFilterToggle.addEventListener('click', () => {
    brandFilters.classList.toggle('active');
    brandFilterToggle.querySelector('.toggle-icon').classList.toggle('expanded', brandFilters.classList.contains('active'));
  });

  // Amenity filter (絞り込み検索) toggle - collapsed by default
  const amenityFilterToggle = document.getElementById('amenity-filter-toggle');
  const amenityFilters = document.getElementById('amenity-filters');

  amenityFilterToggle.addEventListener('click', () => {
    amenityFilters.classList.toggle('active');
    amenityFilterToggle.querySelector('.toggle-icon').classList.toggle('expanded', amenityFilters.classList.contains('active'));
  });

  // Floating clear-filters button (shown over the map when a filter is active)
  document.getElementById('floating-clear-filters').addEventListener('click', clearFilters);
}

// Initialize everything
function init() {
  initMap();
  initBrandFilters();
  initAmenityFilters();
  initUIEvents();
  updateStoreListImmediate(); // Immediate update on init
  updateStoreCount();
}

// Start the application
init();
