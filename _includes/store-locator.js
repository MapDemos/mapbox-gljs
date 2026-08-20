// Configuration for Skylark data
const SKYLARK_DATA_FILE = 'skylark-stores.json'; // Local JSON file with store data
const USE_REAL_DATA = true; // Set to false to use dummy data only

// UI language (R068 - inbound tourist support). Store names/addresses are
// real Japanese data and are intentionally NOT translated here (no reliable
// canonical English name exists for every one of the ~34 brands); only the
// app's own UI chrome and map labels switch language.
const TRANSLATIONS = {
  ja: {
    searchPlaceholder: 'ブランド・地名・駅名で探す',
    clearFilters: '条件をクリアする',
    selectBrand: 'ブランドを選ぶ',
    refineSearch: '絞り込み検索',
    keyboardGuide: 'キーボードショートカット',
    storeListLink: '新店舗一覧',
    modeAnd: 'すべて満たす',
    modeOr: 'いずれか満たす',
    openSidePanel: '探す',
    closeSidePanel: '閉じる',
    kbdLeft: '左へ移動',
    kbdRight: '右へ移動',
    kbdUp: '上へ移動',
    kbdDown: '下へ移動',
    kbdZoomIn: 'ズームイン',
    kbdZoomOut: 'ズームアウト',
    kbdHome: 'ビューを 75% 左へ移動',
    kbdEnd: 'ビューを 75% 右へ移動',
    kbdPageUp: 'ビューを 75% 上へ移動',
    kbdPageDown: 'ビューを 75% 下へ移動',
    langToggle: 'English',
    noResultsInView: '表示範囲に店舗が見つかりません',
    tooManyResults: () => '100件以上見つかりました',
    resultsCount: (n) => `${n}件見つかりました`,
    loadingMore: (n) => `${n}件表示中 - スクロールして続きを読み込む`,
    noStoresHere: 'この範囲には店舗がありません',
    nearestStoreLink: (name, dist) => `最寄りの店舗「${name}」へ移動（${dist}km）`,
    popupAddress: '住所',
    popupHours: '営業時間',
    popupPhone: '電話番号',
    popupParking: '駐車場',
    popupAmenities: '設備・サービス',
    popupWeekdayPrefix: '（平日）：',
    popupWeekendPrefix: '（土日祝日）：',
    popupOpen: '営業中',
    popupClosed: '営業時間外',
    popupParkingYes: 'あり',
    popupParkingDisabled: '（身障者用あり）',
    popupDetails: '詳細',
    popupMenu: 'メニュー表示',
    popupReserve: '予約する',
    popupMoreLink: 'もっと見る',
    popupLessLink: '閉じる',
    popupWalkRoute: '徒歩ルート',
    popupDriveRoute: '車ルート',
    routeWalk: '徒歩',
    routeDrive: '車',
    routeInfo: (label, km, min) => `${label}ルート: ${km}km・約${min}分`,
    routeGeoUnsupported: 'この端末では現在地を取得できません',
    routeNotFound: 'ルートが見つかりませんでした',
    routeFetchError: 'ルート取得中にエラーが発生しました',
    routeGeoError: '現在地を取得できませんでした。位置情報の利用を許可してください。',
    webglFallback1: 'お使いの端末・ブラウザは地図の表示に対応していません。',
    webglFallback2: '別の端末・ブラウザでアクセスするか、最新版のブラウザに更新してからお試しください。',
    noneLabel: 'なし'
  },
  en: {
    searchPlaceholder: 'Search by brand, place, or station',
    clearFilters: 'Clear filters',
    selectBrand: 'Select brand',
    refineSearch: 'Refine search',
    keyboardGuide: 'Keyboard shortcuts',
    storeListLink: 'New stores',
    modeAnd: 'Match all',
    modeOr: 'Match any',
    openSidePanel: 'Search',
    closeSidePanel: 'Close',
    kbdLeft: 'Move left',
    kbdRight: 'Move right',
    kbdUp: 'Move up',
    kbdDown: 'Move down',
    kbdZoomIn: 'Zoom in',
    kbdZoomOut: 'Zoom out',
    kbdHome: 'Move view 75% left',
    kbdEnd: 'Move view 75% right',
    kbdPageUp: 'Move view 75% up',
    kbdPageDown: 'Move view 75% down',
    langToggle: '日本語',
    noResultsInView: 'No stores found in this area',
    tooManyResults: () => '100+ stores found',
    resultsCount: (n) => `${n} store${n === 1 ? '' : 's'} found`,
    loadingMore: (n) => `Showing ${n} - scroll for more`,
    noStoresHere: 'No stores in this area',
    nearestStoreLink: (name, dist) => `Go to nearest store "${name}" (${dist}km)`,
    popupAddress: 'Address',
    popupHours: 'Hours',
    popupPhone: 'Phone',
    popupParking: 'Parking',
    popupAmenities: 'Amenities',
    popupWeekdayPrefix: 'Weekdays: ',
    popupWeekendPrefix: 'Weekends/Holidays: ',
    popupOpen: 'Open',
    popupClosed: 'Closed',
    popupParkingYes: 'Available',
    popupParkingDisabled: ' (accessible parking available)',
    popupDetails: 'Details',
    popupMenu: 'View Menu',
    popupReserve: 'Reserve',
    popupMoreLink: 'Show more',
    popupLessLink: 'Show less',
    popupWalkRoute: 'Walking route',
    popupDriveRoute: 'Driving route',
    routeWalk: 'Walking',
    routeDrive: 'Driving',
    routeInfo: (label, km, min) => `${label} route: ${km}km, ~${min} min`,
    routeGeoUnsupported: 'This device cannot get your current location',
    routeNotFound: 'No route found',
    routeFetchError: 'An error occurred while fetching the route',
    routeGeoError: 'Could not get your current location. Please allow location access.',
    webglFallback1: 'Your device or browser does not support map display.',
    webglFallback2: 'Please try a different device/browser, or update to the latest version.',
    noneLabel: 'None'
  }
};

let currentLang = 'ja';
function t(key, ...args) {
  const entry = TRANSLATIONS[currentLang][key];
  return typeof entry === 'function' ? entry(...args) : entry;
}

// Switch UI language + map labels together (R068). Store names/addresses
// stay in Japanese (real data, not UI chrome) - see the TRANSLATIONS comment.
function toggleUiLanguage() {
  currentLang = currentLang === 'ja' ? 'en' : 'ja';

  // Use GL JS v3's native setLanguage rather than the mapbox-gl-language
  // plugin's own setLanguage: the plugin throws inside this specific custom
  // Studio style (found while testing - its internal findStreetsSource
  // crashes even though a "composite" source is present), which would abort
  // the rest of this function before any UI text got translated. The native
  // method works correctly against this style.
  if (map && typeof map.setLanguage === 'function') {
    try {
      map.setLanguage(currentLang);
    } catch (error) {
      console.error('Map language switch failed:', error);
    }
  }

  // Static UI chrome
  document.getElementById('search-box').placeholder = t('searchPlaceholder');
  document.getElementById('clear-filters').textContent = t('clearFilters');
  document.querySelector('#store-list-link span').textContent = t('storeListLink');
  document.getElementById('lang-toggle').textContent = t('langToggle');
  document.querySelector('#brand-filter-toggle .btn-label').textContent = t('selectBrand');
  document.querySelector('#amenity-filter-toggle .btn-label').textContent = t('refineSearch');
  document.querySelector('.keyboard-guide-link').textContent = t('keyboardGuide');
  document.getElementById('keyboard-guide-title').textContent = t('keyboardGuide');
  document.getElementById('amenity-mode-and').textContent = t('modeAnd');
  document.getElementById('amenity-mode-or').textContent = t('modeOr');
  document.querySelector('#open-side-panel span').textContent = t('openSidePanel');
  document.querySelector('#close-side-panel span').textContent = t('closeSidePanel');
  [['kbd-guide-left', 'kbdLeft'], ['kbd-guide-right', 'kbdRight'], ['kbd-guide-up', 'kbdUp'],
   ['kbd-guide-down', 'kbdDown'], ['kbd-guide-zoomin', 'kbdZoomIn'], ['kbd-guide-zoomout', 'kbdZoomOut'],
   ['kbd-guide-home', 'kbdHome'], ['kbd-guide-end', 'kbdEnd'], ['kbd-guide-pageup', 'kbdPageUp'],
   ['kbd-guide-pagedown', 'kbdPageDown']
  ].forEach(([rowId, key]) => {
    document.querySelector(`#${rowId} td:last-child`).textContent = t(key);
  });

  // Dynamic content that bakes in translated strings at render time
  if (typeof initAmenityFilters === 'function' && document.getElementById('amenity-filters').children.length) {
    initAmenityFilters();
  }
  if (typeof updateStoreCount === 'function' && map) {
    updateStoreCount();
  }
  if (typeof updateStoreListImmediate === 'function' && map) {
    updateStoreListImmediate();
  }
  if (typeof updateMapLayers === 'function' && map) {
    updateMapLayers(); // Refreshes area-group pill labels (getAreaLabel) immediately, not just on next pan/zoom
  }
  if (currentPopup && currentPopupFeature) {
    currentPopup.setHTML(createPopupContent(currentPopupFeature));
  }
}

// Map configuration - initial view, zoom limits, and pan bounds
const MAP_CONFIG = {
  INITIAL_CENTER: [138.2529, 36.2048], // Japan-wide overview centroid
  INITIAL_ZOOM: 5, // nationwide overview shown before geolocation resolves
  MIN_ZOOM: 4,
  MAX_ZOOM: 18,
  MAX_BOUNDS: [[122.0, 20.0], [154.5, 46.5]], // SW/NE, Japan + margin (Okinawa-Hokkaido)
  GEOLOCATE_ZOOM: 15 // zoom level flown to once the user's location is found
};

// R073 (地図画面の出し分け), brand piece only: a ?brand= param simulates this
// map being embedded on one of Skylark's real per-brand pages (e.g.
// store-info.skylark.co.jp/gusto/) - locking the map to that brand's stores
// - instead of building actual separate URL routing across their real
// multi-site/multi-domain hosting, which this single demo instance can't
// exercise. The common (all-brands) and 優待 (loyalty page) pieces are
// intentionally left unimplemented. Slugs are the real ones used in
// Skylark's own site (confirmed from store-info.skylark.co.jp's footer
// brand links) - only covering brands that actually have one; buffet-style
// brands linked via generic co_XX paths don't get a slug here.
const BRAND_SLUGS = {
  gusto: 'ガスト',
  bamiyan: 'バーミヤン',
  syabuyo: 'しゃぶ葉',
  yumean: '夢庵',
  jonathan: 'ジョナサン',
  steak_gusto: 'ステーキガスト',
  mmcoffee: 'むさしの森珈琲',
  karayoshi: 'から好し（ガスト内店含む）',
  aiya: '藍屋',
  tonkara_tei: 'とんから亭',
  chawan: 'chawan',
  la_ohana: 'ラ・オハナ',
  totoyamichi: '魚屋路',
  grazie_gardens: 'グラッチェガーデンズ',
  hachiro_soba: '八郎そば',
  ym_shokudo: 'ゆめあん食堂',
  miwami: '三〇三'
};

// Read shared filter/view state (brands, amenities, map position) out of the URL
// query string, so a shared link can reproduce the same search results (R035).
function parseUrlState() {
  const params = new URLSearchParams(window.location.search);
  const brands = (params.get('brands') || '').split(',').filter(Boolean);
  const amenities = (params.get('amenities') || '').split(',').filter(Boolean);
  const amenityMode = params.get('amenityMode') === 'OR' ? 'OR' : 'AND';
  const lat = parseFloat(params.get('lat'));
  const lng = parseFloat(params.get('lng'));
  const zoom = parseFloat(params.get('zoom'));
  const hasPosition = Number.isFinite(lat) && Number.isFinite(lng) && Number.isFinite(zoom);
  const lockedBrand = BRAND_SLUGS[params.get('brand')] || null; // R073 brand piece
  return {
    brands,
    amenities,
    amenityMode,
    center: hasPosition ? [lng, lat] : null,
    zoom: hasPosition ? zoom : null,
    lockedBrand,
    hasState: brands.length > 0 || amenities.length > 0 || hasPosition || !!lockedBrand
  };
}

const urlState = parseUrlState();

// Reflect current filter/view state back into the URL (replacing, not pushing,
// so this never pollutes browser history) so the current view is always shareable.
function updateUrlFromState() {
  const selectedBrands = Array.from(
    document.querySelectorAll('#brand-filters .brand-filter.active')
  ).map(btn => btn.dataset.brand);
  const selectedAmenities = Array.from(
    document.querySelectorAll('#amenity-filters .amenity-filter.active')
  ).map(btn => btn.dataset.amenityId);

  const params = new URLSearchParams();
  if (selectedBrands.length) params.set('brands', selectedBrands.join(','));
  if (selectedAmenities.length) {
    params.set('amenities', selectedAmenities.join(','));
    if (amenityFilterMode === 'OR') params.set('amenityMode', 'OR');
  }
  if (map) {
    const center = map.getCenter();
    params.set('lat', center.lat.toFixed(5));
    params.set('lng', center.lng.toFixed(5));
    params.set('zoom', map.getZoom().toFixed(2));
  }

  const query = params.toString();
  history.replaceState(null, '', query ? `?${query}` : window.location.pathname);
}

// Apply the brands/amenities from the URL (if any) to the filter buttons, once
// they exist with real data, then run the normal filter pipeline once.
function restoreFiltersFromUrl() {
  // R073 brand piece: a locked brand page only has one brand to show, so
  // the other brand-filter buttons are removed rather than left toggleable.
  if (urlState.lockedBrand) {
    document.querySelectorAll('#brand-filters .brand-filter').forEach(btn => {
      if (btn.dataset.brand === urlState.lockedBrand) {
        btn.classList.add('active');
        btn.disabled = true;
      } else {
        btn.remove();
      }
    });
  }

  if (!urlState.brands.length && !urlState.amenities.length && !urlState.lockedBrand) return;

  document.querySelectorAll('#brand-filters .brand-filter').forEach(btn => {
    if (urlState.brands.includes(btn.dataset.brand)) btn.classList.add('active');
  });
  document.querySelectorAll('#amenity-filters .amenity-filter').forEach(btn => {
    if (urlState.amenities.includes(btn.dataset.amenityId)) btn.classList.add('active');
  });

  if (urlState.amenities.length > 0 && urlState.amenityMode === 'OR') {
    amenityFilterMode = 'OR';
    document.getElementById('amenity-mode-or').classList.add('active');
    document.getElementById('amenity-mode-and').classList.remove('active');
  }

  applyFilters();
}

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

        const reservationUrl = extra['Web予約サイトURL'] || null;
        const notice = extra['お知らせ'] || null;

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
            reservationUrl: reservationUrl,
            notice: notice,
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
  { id: 'delivery', label: '宅配あり', labelEn: 'Delivery available', key: '宅配フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/439ff93d-ead7-47e1-8482-63e1e65638d2.png' },
  { id: 'takeout', label: 'テイクアウト可', labelEn: 'Takeout available', key: '持ち帰りフラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/64872114-7eee-4ca6-bb88-cd8079e61c88.png' },
  { id: 'ubereats', label: 'Uber Eatsあり', labelEn: 'Uber Eats available', key: 'ubereatsフラグ', icon: 'https://storage.googleapis.com/storelocator-v3-stg-static-local/images/skylark/17f825fc-0795-4b68-b602-5c278e6a34f0.png' },
  { id: 'demaecan', label: '出前館', labelEn: 'Demae-can delivery', key: 'demaecanフラグ', icon: 'https://storage.googleapis.com/storelocator-v3-stg-static-local/images/skylark/c5b0c90c-f4fe-481d-9fd7-325b46f58b97.png' },
  { id: 'qrPayment', label: 'QR決済対応', labelEn: 'QR payment accepted', key: 'QR決済（有無）フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/16a23b90-0055-4cdd-bf65-b5cdb0edaf58.png' },
  { id: 'open24h', label: '全日24時間', labelEn: 'Open 24 hours', key: '全日２４時間フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/c91b1e5e-d25f-4b21-b2f1-70cc8bdbdce1.png' },
  { id: 'reservation', label: '予約可', labelEn: 'Reservations accepted', key: '予約フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/b17ab33c-c32f-4111-82cf-b0abb179cfc3.png' },
  { id: 'credit', label: 'クレジット可', labelEn: 'Credit cards accepted', key: 'クレジット（有無）フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/e464aa68-7fde-4a89-96b7-f35583731790.png' },
  { id: 'emoney', label: '電子マネー可', labelEn: 'E-money accepted', key: '電子マネー（有無）フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/ed7a28c3-89db-4b71-b327-48eebac3b990.png' },
  { id: 'wifi', label: 'Wi-Fiあり', labelEn: 'Wi-Fi available', key: 'ｗｉ－ｆｉ（有無）フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/76e25fa3-70bc-4b39-9532-bc26d1299e8e.png' },
  { id: 'parking', label: '駐車場あり', labelEn: 'Parking available', key: '駐車場（有無）フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/e623fc3c-ff59-45f5-847b-12bad0257c31.png' },
  { id: 'disabledParking', label: '身障者用駐車場あり', labelEn: 'Accessible parking available', key: '身障者用駐車場フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/f2c1fb52-bd24-45fd-bb58-c6fdd1703b16.png' },
  { id: 'wheelchair', label: '車椅子入店可', labelEn: 'Wheelchair accessible', key: '車椅子対応フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/cb06972e-8bdf-4600-93c2-e9ee6564a89a.png' },
  { id: 'elevator', label: 'エレベーターあり', labelEn: 'Elevator available', key: 'エレベーターフラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/eb9c9a01-179d-4b52-a362-bbeda06c8468.png' },
  { id: 'petTerrace', label: 'テラス席に限りペット同伴可', labelEn: 'Pets allowed (terrace seating only)', key: 'ペット同伴可', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/fa865921-a681-47d8-aec2-0eaed140d4f7.png' },
  { id: 'diaper', label: 'おむつ替え台あり', labelEn: 'Diaper changing table', key: 'おむつ替え台フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/743b216e-a674-401f-8a9d-ca44e76aff0a.png' },
  { id: 'multiToilet', label: '多目的トイレあり', labelEn: 'Accessible restroom', key: '多目的トイレフラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/d3c0afc9-46ac-4767-a705-d4caa991dfb4.png' },
  { id: 'partyRoom', label: 'パーティールームあり', labelEn: 'Party room available', key: 'パーティーフラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/12537778-a007-4c3f-8d4d-f7e1ba6811c7.png' },
  { id: 'tatami', label: '座敷(大・小) あり', labelEn: 'Tatami seating available', key: '座敷フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/65d6701a-cb6e-4449-aa21-1d4c1a4e2ff3.png' },
  { id: 'sunken', label: '小上がり(畳席) あり', labelEn: 'Sunken tatami seating', key: '小上がりフラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/a17a137d-7351-40fe-a4b9-770ddb70904a.png' },
  { id: 'privateRoom', label: '個室・個室風席あり', labelEn: 'Private room seating', key: '個室フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/b728a741-b1fd-4320-83a8-71fde462af02.png' },
  { id: 'counter', label: 'カウンター席あり', labelEn: 'Counter seating', key: 'カウンター席フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/2ec594ce-5e1f-425f-9c61-ca21c6b2f4ed.png' },
  { id: 'digitalMenu', label: 'デジタルメニューブック', labelEn: 'Digital menu', key: 'デジタルメニューブック（有無）フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/996d345e-c9df-402d-a239-b31a5fe60644.png' },
  { id: 'serviceRobot', label: 'サービスロボットあり', labelEn: 'Service robot', key: 'サービスロボット（有無）フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/fa6b95c8-3fd1-4252-9650-00d1b13c2ed4.png' },
  { id: 'noSmoking', label: '禁煙', labelEn: 'Non-smoking', key: '完全禁煙フラグ', icon: 'https://storage.googleapis.com/storelocator-v3-static/images/skylark/bbb828bc-dd36-4d7b-ba71-4b678da474b9.png' }
];

// Canonical brand display order, matching the production site's own brand
// filter list (store-info.skylark.co.jp) - R036. Brands in our data that
// aren't in this list (e.g. one-off/unlisted names) sort after it.
const BRAND_ORDER = [
  'ガスト', 'バーミヤン', 'しゃぶ葉', '夢庵', 'ジョナサン', 'ステーキガスト',
  'むさしの森珈琲', 'から好し（ガスト内店含む）', 'から好し（単独店）', '藍屋',
  'とんから亭', 'chawan', 'ラ・オハナ', '魚屋路', 'グラッチェガーデンズ',
  '八郎そば', 'ゆめあん食堂', '三〇三', 'グランブッフェ', 'ニューマーケット',
  'フェスタガーデン', 'フォレスト', '包包點心', '點心甜心', '点心甜心', 'ダイナー',
  'ザ ブッフェ', '八献', 'くし葉', 'すうぷ', 'その他ブッフェレストラン',
  'ペルティカ', 'フロプレステージュ', 'トマト＆オニオン', 'じゅうじゅうカルビ',
  '資さんうどん'
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
let languageControl = null; // MapboxLanguage control instance, set in initMap()
let selectedStoreId = null;
let currentPopup = null;
let currentZoom = 11;

// The user's typed search query, tracked separately from #search-box's displayed
// value - selecting a suggestion overwrites the input with a resolved place label
// (e.g. a full address) for display, which must not be treated as a filter query.
let searchFilterQuery = '';

// Set by initSidePanelToggle() once wired up; closes the mobile side-panel
// drawer so the map (and any popup) is visible after a store is selected.
let collapseMobileSheet = null;

// How multiple selected amenity filters combine: 'AND' (must have all of
// them) or 'OR' (must have at least one). Toggled via the amenity filter
// panel's mode buttons.
let amenityFilterMode = 'AND';

// Will be initialized after data loads
let filteredStores = [];

// Fixed per-area (prefecture/wardCity) centroid+count, precomputed from the
// *entire* currently-filtered dataset whenever filteredStores changes - not
// from whatever happens to be in the current padded viewport. Matches the
// reference site's own behavior (confirmed by inspecting its bundle: it
// fetches pre-aggregated cluster data from a backend keyed by geohash cell,
// so a group's displayed count/position never depends on which part of it
// happens to be on-screen). We have no backend, but we do have the whole
// dataset loaded client-side already, so this reproduces the same
// "computed once, independent of viewport" behavior locally.
let areaStats = { prefecture: {}, wardCity: {} };

function computeAreaStats() {
  const buckets = { prefecture: {}, wardCity: {} };
  filteredStores.forEach(feature => {
    ['prefecture', 'wardCity'].forEach(key => {
      const name = feature.properties[key];
      if (!name) return;
      if (!buckets[key][name]) buckets[key][name] = [];
      buckets[key][name].push(feature.geometry.coordinates);
    });
  });

  const stats = { prefecture: {}, wardCity: {} };
  ['prefecture', 'wardCity'].forEach(key => {
    Object.entries(buckets[key]).forEach(([name, coords]) => {
      stats[key][name] = { centroid: calculateCentroid(coords), count: coords.length };
    });
  });
  return stats;
}

// No longer needed - using native symbol layers instead of canvas images

// Address parsing utilities
// Option 3: Pre-compiled regex patterns for better performance
const PREFECTURE_REGEX = /^(東京都|北海道|大阪府|京都府|[^\s]+県)/;
const WARD_CITY_REGEX = /^([^\s]+?(市|区|町|村))/;
const FULL_ADDRESS_REGEX = /^(東京都|北海道|大阪府|京都府|[^\s]+県)([^\s]+?(市|区|町|村))?/;

// English names for the area-group map pill labels (R068 - the UI-language
// toggle already switches every other UI string and the map's own street
// labels via map.setLanguage(), but these DOM-rendered pills were still
// stuck in Japanese). Built from the exact set of prefecture/wardCity
// strings ADDRESS_PARSER actually produces for the real dataset - not a
// general-purpose gazetteer, so a lookup miss falls back to the raw
// Japanese name rather than guessing (see getAreaLabel below).
//
// A few entries are stuck with a truncated/malformed key because of a
// pre-existing bug in FULL_ADDRESS_REGEX below: its ward/city half stops
// at the FIRST occurrence of 市/区/町/村, so real names that happen to
// contain one of those characters before their true suffix get cut short
// - e.g. "四日市" here is really 四日市市 (Yokkaichi City), "大村" is really
// 大村市 (Omura City), etc. Likewise the prefecture half is greedy, so
// "広島県山県" (from 広島県山県郡...) swallowed a district name that itself
// ends in 県. Not fixed here - a regex change belongs to whoever owns that
// parsing decision - but every affected key still gets a correct label for
// the place it actually represents.

const PREFECTURE_EN = {
  '三重県': 'Mie', '京都府': 'Kyoto', '佐賀県': 'Saga', '兵庫県': 'Hyogo',
  '北海道': 'Hokkaido', '千葉県': 'Chiba', '和歌山県': 'Wakayama', '埼玉県': 'Saitama',
  '大分県': 'Oita', '大阪府': 'Osaka', '奈良県': 'Nara', '宮城県': 'Miyagi',
  '宮崎県': 'Miyazaki', '富山県': 'Toyama', '山口県': 'Yamaguchi', '山形県': 'Yamagata',
  '山梨県': 'Yamanashi', '岐阜県': 'Gifu', '岡山県': 'Okayama', '岩手県': 'Iwate',
  '島根県': 'Shimane', '広島県': 'Hiroshima', '広島県山県': 'Yamagata District, Hiroshima', '徳島県': 'Tokushima',
  '愛媛県': 'Ehime', '愛知県': 'Aichi', '新潟県': 'Niigata', '東京都': 'Tokyo',
  '栃木県': 'Tochigi', '沖縄県': 'Okinawa', '滋賀県': 'Shiga', '熊本県': 'Kumamoto',
  '石川県': 'Ishikawa', '神奈川県': 'Kanagawa', '福井県': 'Fukui', '福岡県': 'Fukuoka',
  '福島県': 'Fukushima', '秋田県': 'Akita', '群馬県': 'Gunma', '茨城県': 'Ibaraki',
  '長崎県': 'Nagasaki', '長野県': 'Nagano', '青森県': 'Aomori', '静岡県': 'Shizuoka',
  '香川県': 'Kagawa', '高知県': 'Kochi', '鳥取県': 'Tottori', '鹿児島県': 'Kagoshima',
};

const WARD_CITY_EN = {
  'あきる野市': 'Akiruno City', 'いすみ市': 'Isumi City', 'いわき市': 'Iwaki City',
  'うるま市': 'Uruma City', 'さいたま市': 'Saitama City', 'さくら市': 'Sakura City',
  'さぬき市': 'Sanuki City', 'たつの市': 'Tatsuno City', 'つくばみらい市': 'Tsukubamirai City',
  'つくば市': 'Tsukuba City', 'にかほ市': 'Nikaho City', 'ひたちなか市': 'Hitachinaka City',
  'ふじみ野市': 'Fujimino City', 'みよし市': 'Miyoshi City', 'むつ市': 'Mutsu City',
  '一宮市': 'Ichinomiya City', '一関市': 'Ichinoseki City', '三原市': 'Mihara City',
  '三島市': 'Mishima City', '三木市': 'Miki City', '三条市': 'Sanjo City',
  '三浦市': 'Miura City', '三浦郡葉山町': 'Hayama Town, Miura District', '三田市': 'Sanda City',
  '三笠市': 'Mikasa City', '三郷市': 'Misato City', '三重郡朝日町': 'Asahi Town, Mie District',
  '三鷹市': 'Mitaka City', '上尾市': 'Ageo City', '上田市': 'Ueda City',
  '上益城郡嘉島町': 'Kashima Town, Kamimashiki District', '上越市': 'Joetsu City', '下妻市': 'Shimotsuma City',
  '下松市': 'Kudamatsu City', '下田市': 'Shimoda City', '下都賀郡壬生町': 'Mibu Town, Shimotsuga District',
  '下野市': 'Shimotsuke City', '下関市': 'Shimonoseki City', '世田谷区': 'Setagaya Ward',
  '中央区': 'Chuo Ward', '中央市': 'Chuo City', '中巨摩郡昭和町': 'Showa Town, Nakakoma District',
  '中津川市': 'Nakatsugawa City', '中津市': 'Nakatsu City', '中郡二宮町': 'Ninomiya Town, Naka District',
  '中郡大磯町': 'Oiso Town, Naka District', '中野区': 'Nakano Ward', '中野市': 'Nakano City',
  '中間市': 'Nakama City', '丸亀市': 'Marugame City', '丹波市': 'Tanba City',
  '丹羽郡扶桑町': 'Fuso Town, Niwa District', '久喜市': 'Kuki City', '久慈市': 'Kuji City',
  '久留米市': 'Kurume City', '亀山市': 'Kameyama City', '亀岡市': 'Kameoka City',
  '五所川原市': 'Goshogawara City', '五條市': 'Gojo City', '交野市': 'Katano City',
  '京丹後市': 'Kyotango City', '京田辺市': 'Kyotanabe City', '京都市': 'Kyoto City',
  '京都郡苅田町': 'Kanda Town, Kyoto District', '人吉市': 'Hitoyoshi City', '今治市': 'Imabari City',
  '仙北市': 'Semboku City', '仙台市': 'Sendai City', '仲多度郡多度津町': 'Tadotsu Town, Nakatado District',
  '伊万里市': 'Imari City', '伊丹市': 'Itami City', '伊予郡松前町': 'Masaki Town, Iyo District',
  '伊勢原市': 'Isehara City', '伊勢崎市': 'Isesaki City', '伊勢市': 'Ise City',
  '伊東市': 'Ito City', '伊豆の国市': 'Izunokuni City', '伊豆市': 'Izu City',
  '伊那市': 'Ina City', '会津若松市': 'Aizuwakamatsu City', '佐世保市': 'Sasebo City',
  '佐久市': 'Saku City', '佐伯市': 'Saiki City', '佐倉市': 'Sakura City',
  '佐渡市': 'Sado City', '佐賀市': 'Saga City', '佐野市': 'Sano City',
  '倉吉市': 'Kurayoshi City', '倉敷市': 'Kurashiki City', '備前市': 'Bizen City',
  '児玉郡上里町': 'Kamisato Town, Kodama District', '入間市': 'Iruma City', '入間郡三芳町': 'Miyoshi Town, Iruma District',
  '入間郡毛呂山町': 'Moroyama Town, Iruma District', '八代市': 'Yatsushiro City', '八千代市': 'Yachiyo City',
  '八尾市': 'Yao City', '八幡市': 'Yawata City', '八戸市': 'Hachinohe City',
  '八潮市': 'Yashio City', '八王子市': 'Hachioji City', '八街市': 'Yachimata City',
  '出雲市': 'Izumo City', '函館市': 'Hakodate City', '刈谷市': 'Kariya City',
  '別府市': 'Beppu City', '前橋市': 'Maebashi City', '加古川市': 'Kakogawa City',
  '加東市': 'Kato City', '加茂市': 'Kamo City', '加西市': 'Kasai City',
  '加須市': 'Kazo City', '勝浦市': 'Katsuura City', '北上市': 'Kitakami City',
  '北九州市': 'Kitakyushu City', '北区': 'Kita Ward', '北名古屋市': 'Kitanagoya City',
  '北安曇郡白馬村': 'Hakuba Village, Kitaazumi District', '北本市': 'Kitamoto City', '北杜市': 'Hokuto City',
  '北葛飾郡杉戸町': 'Sugito Town, Kitakatsushika District', '北足立郡伊奈町': 'Ina Town, Kitaadachi District', '十和田市': 'Towada City',
  '千代田区': 'Chiyoda Ward', '千曲市': 'Chikuma City', '千歳市': 'Chitose City',
  '千葉市': 'Chiba City', '半田市': 'Handa City', '南アルプス市': 'Minami-Alps City',
  '南佐久郡佐久穂町': 'Sakuho Town, Minamisaku District', '南城市': 'Nanjo City', '南巨摩郡富士川町': 'Fujikawa Town, Minamikoma District',
  '南相馬市': 'Minamisoma City', '南秋田郡五城目町': 'Gojome Town, Minamiakita District', '南足柄市': 'Minamiashigara City',
  '南都留郡富士河口湖町': 'Fujikawaguchiko Town, Minamitsuru District', '南都留郡山中湖村': 'Yamanakako Village, Minamitsuru District', '南陽市': 'Nanyo City',
  '印旛郡栄町': 'Sakae Town, Imba District', '印旛郡酒々井町': 'Shisui Town, Imba District', '印西市': 'Inzai City',
  '厚木市': 'Atsugi City', '取手市': 'Toride City', '古河市': 'Koga City',
  '古賀市': 'Koga City', '可児市': 'Kani City', '台東区': 'Taito Ward',
  '各務原市': 'Kakamigahara City', '合志市': 'Koshi City', '吉川市': 'Yoshikawa City',
  '吉野川市': 'Yoshinogawa City', '名取市': 'Natori City', '名古屋市': 'Nagoya City',
  '名張市': 'Nabari City', '名護市': 'Nago City', '君津市': 'Kimitsu City',
  '吹田市': 'Suita City', '呉市': 'Kure City', '周南市': 'Shunan City',
  '和光市': 'Wako City', '和歌山市': 'Wakayama City', '和泉市': 'Izumi City',
  '品川区': 'Shinagawa Ward', '唐津市': 'Karatsu City', '善通寺市': 'Zentsuji City',
  '喜多方市': 'Kitakata City', '四国中央市': 'Shikokuchuo City', '四日市': 'Yokkaichi City',
  '四街道市': 'Yotsukaido City', '国分寺市': 'Kokubunji City', '国立市': 'Kunitachi City',
  '土浦市': 'Tsuchiura City', '坂井市': 'Sakai City', '坂出市': 'Sakaide City',
  '坂戸市': 'Sakado City', '坂東市': 'Sakato City', '城陽市': 'Joyo City',
  '堺市': 'Sakai City', '塩尻市': 'Shiojiri City', '塩谷郡高根沢町': 'Takanezawa Town, Shioya District',
  '墨田区': 'Sumida Ward', '多摩市': 'Tama City', '多治見市': 'Tajimi City',
  '多賀城市': 'Tagajo City', '大仙市': 'Daisen City', '大分市': 'Oita City',
  '大和市': 'Yamato City', '大和高田市': 'Yamatotakada City', '大垣市': 'Ogaki City',
  '大崎市': 'Osaki City', '大府市': 'Obu City', '大月市': 'Otsuki City',
  '大村': 'Omura City', '大東市': 'Daito City', '大津市': 'Otsu City',
  '大洲市': 'Ozu City', '大牟田市': 'Omuta City', '大田区': 'Ota Ward',
  '大田原市': 'Otawara City', '大田市': 'Oda City', '大町': 'Omachi City',
  '大網白里市': 'Oamishirasato City', '大里郡寄居町': 'Yorii Town, Osato District', '大野城市': 'Onojo City',
  '大阪市': 'Osaka City', '大館市': 'Odate City', '天理市': 'Tenri City',
  '天童市': 'Tendo City', '太宰府市': 'Dazaifu City', '太田市': 'Ota City',
  '夷隅郡大多喜町': 'Otaki Town, Isumi District', '奈良市': 'Nara City', '奥州市': 'Oshu City',
  '妙高市': 'Myoko City', '姫路市': 'Himeji City', '姶良市': 'Aira City',
  '宇佐市': 'Usa City', '宇和島市': 'Uwajima City', '宇土市': 'Uto City',
  '宇治市': 'Uji City', '宇部市': 'Ube City', '宇都宮市': 'Utsunomiya City',
  '宇陀市': 'Uda City', '守山市': 'Moriyama City', '守谷市': 'Moriya City',
  '安中市': 'Annaka City', '安城市': 'Anjo City', '安曇野市': 'Azumino City',
  '安芸郡府中町': 'Fuchu Town, Aki District', '安芸郡海田町': 'Kaita Town, Aki District', '宍粟市': 'Shiso City',
  '宗像市': 'Munakata City', '宜野湾市': 'Ginowan City', '宝塚市': 'Takarazuka City',
  '宮古市': 'Miyako City', '宮城郡利府町': 'Rifu Town, Miyagi District', '宮崎市': 'Miyazaki City',
  '富士吉田市': 'Fujiyoshida City', '富士宮市': 'Fujimiya City', '富士市': 'Fuji City',
  '富士見市': 'Fujimi City', '富山市': 'Toyama City', '富岡市': 'Tomioka City',
  '富津市': 'Futtsu City', '富田林市': 'Tondabayashi City', '富谷市': 'Tomiya City',
  '富里市': 'Tomisato City', '寒河江市': 'Sagae City', '寝屋川市': 'Neyagawa City',
  '射水市': 'Imizu City', '小千谷市': 'Ojiya City', '小山市': 'Oyama City',
  '小平市': 'Kodaira City', '小松島市': 'Komatsushima City', '小松市': 'Komatsu City',
  '小浜市': 'Obama City', '小牧市': 'Komaki City', '小田原市': 'Odawara City',
  '小矢部市': 'Oyabe City', '小諸市': 'Komoro City', '小金井市': 'Koganei City',
  '尼崎市': 'Amagasaki City', '尾張旭市': 'Owariasahi City', '尾道市': 'Onomichi City',
  '山口市': 'Yamaguchi City', '山形市': 'Yamagata City', '山梨市': 'Yamanashi City',
  '山武市': 'Sammu City', '山武郡横芝光町': 'Yokoshibahikari Town, Sammu District', '岐阜市': 'Gifu City',
  '岡山市': 'Okayama City', '岡崎市': 'Okazaki City', '岡谷市': 'Okaya City',
  '岩倉市': 'Iwakura City', '岩出市': 'Iwade City', '岩国市': 'Iwakuni City',
  '岸和田市': 'Kishiwada City', '島原市': 'Shimabara City', '島尻郡南風原町': 'Haebaru Town, Shimajiri District',
  '川口市': 'Kawaguchi City', '川崎市': 'Kawasaki City', '川西市': 'Kawanishi City',
  '川越市': 'Kawagoe City', '市原市': 'Ichihara City', '市川市': 'Ichikawa City',
  '帯広市': 'Obihiro City', '常総市': 'Joso City', '常陸大宮市': 'Hitachiomiya City',
  '常陸太田市': 'Hitachiota City', '平塚市': 'Hiratsuka City', '幸手市': 'Satte City',
  '広島市': 'Hiroshima City', '府中市': 'Fuchu City', '座間市': 'Zama City',
  '延岡市': 'Nobeoka City', '廿日市': 'Hatsukaichi City', '弘前市': 'Hirosaki City',
  '弥富市': 'Yatomi City', '彦根市': 'Hikone City', '御坊市': 'Gobo City',
  '御殿場市': 'Gotemba City', '徳島市': 'Tokushima City', '志摩市': 'Shima City',
  '志木市': 'Shiki City', '恵庭市': 'Eniwa City', '愛甲郡愛川町': 'Aikawa Town, Aiko District',
  '愛知郡東郷町': 'Togo Town, Aichi District', '成田市': 'Narita City', '我孫子市': 'Abiko City',
  '戸田市': 'Toda City', '所沢市': 'Tokorozawa City', '指宿市': 'Ibusuki City',
  '掛川市': 'Kakegawa City', '揖保郡太子町': 'Taishi Town, Ibo District', '摂津市': 'Settsu City',
  '敦賀市': 'Tsuruga City', '文京区': 'Bunkyo Ward', '新宮市': 'Shingu City',
  '新宿区': 'Shinjuku Ward', '新居浜市': 'Niihama City', '新庄市': 'Shinjo City',
  '新座市': 'Niiza City', '新潟市': 'Niigata City', '新発田市': 'Shibata City',
  '日光市': 'Nikko City', '日向市': 'Hyuga City', '日田市': 'Hita City',
  '日立市': 'Hitachi City', '日進市': 'Nisshin City', '日野市': 'Hino City',
  '日高市': 'Hidaka City', '旭川市': 'Asahikawa City', '旭市': 'Asahi City',
  '明石市': 'Akashi City', '春日井市': 'Kasugai City', '春日市': 'Kasuga City',
  '春日部市': 'Kasukabe City', '昭島市': 'Akishima City', '有田市': 'Arida City',
  '朝倉市': 'Asakura City', '朝霞市': 'Asaka City', '木更津市': 'Kisarazu City',
  '木津川市': 'Kizugawa City', '木田郡三木町': 'Miki Town, Kita District', '本宮市': 'Motomiya City',
  '本巣市': 'Motosu City', '本巣郡北方町': 'Kitagata Town, Motosu District', '本庄市': 'Honjo City',
  '札幌市': 'Sapporo City', '杉並区': 'Suginami Ward', '村上市': 'Murakami City',
  '東久留米市': 'Higashikurume City', '東大和市': 'Higashiyamato City', '東大阪市': 'Higashiosaka City',
  '東広島市': 'Higashihiroshima City', '東村': 'Higashimurayama City', '東松山市': 'Higashimatsuyama City',
  '東根市': 'Higashine City', '東海市': 'Tokai City', '東茨城郡茨城町': 'Ibaraki Town, Higashiibaraki District',
  '東近江市': 'Higashiomi City', '東金市': 'Togane City', '松原市': 'Matsubara City',
  '松山市': 'Matsuyama City', '松戸市': 'Matsudo City', '松本市': 'Matsumoto City',
  '松江市': 'Matsue City', '松阪市': 'Matsusaka City', '板橋区': 'Itabashi Ward',
  '板野郡北島町': 'Kitajima Town, Itano District', '枚方市': 'Hirakata City', '柏原市': 'Kashihara City',
  '柏崎市': 'Kashiwazaki City', '柏市': 'Kashiwa City', '柳井市': 'Yanai City',
  '柴田郡大河原町': 'Ogawara Town, Shibata District', '栃木市': 'Tochigi City', '栗東市': 'Ritto City',
  '桐生市': 'Kiryu City', '桑名市': 'Kuwana City', '桜井市': 'Sakurai City',
  '桶川市': 'Okegawa City', '榛原郡吉田町': 'Yoshida Town, Haibara District', '横手市': 'Yokote City',
  '横浜市': 'Yokohama City', '横須賀市': 'Yokosuka City', '橋本市': 'Hashimoto City',
  '橿原市': 'Kashihara City', '武蔵村': 'Musashimurayama City', '武蔵野市': 'Musashino City',
  '武雄市': 'Takeo City', '比企郡小川町': 'Ogawa Town, Hiki District', '比企郡嵐山町': 'Ranzan Town, Hiki District',
  '水俣市': 'Minamata City', '水戸市': 'Mito City', '氷見市': 'Himi City',
  '江別市': 'Ebetsu City', '江南市': 'Konan City', '江戸川区': 'Edogawa Ward',
  '江東区': 'Koto Ward', '池田市': 'Ikeda City', '沖縄市': 'Okinawa City',
  '河内郡上三川町': 'Kaminokawa Town, Kawachi District', '河内長野市': 'Kawachinagano City', '沼津市': 'Numazu City',
  '沼田市': 'Numata City', '泉佐野市': 'Izumisano City', '津山市': 'Tsuyama City',
  '津島市': 'Tsushima City', '津市': 'Tsu City', '洲本市': 'Sumoto City',
  '流山市': 'Nagareyama City', '浜松市': 'Hamamatsu City', '浦安市': 'Urayasu City',
  '浦添市': 'Urasoe City', '海南市': 'Kainan City', '海老名市': 'Ebina City',
  '海部郡大治町': 'Oharu Town, Kaifu District', '海部郡蟹江町': 'Kanie Town, Kaifu District', '深谷市': 'Fukaya City',
  '清瀬市': 'Kiyose City', '渋川市': 'Shibukawa City', '渋谷区': 'Shibuya Ward',
  '港区': 'Minato Ward', '湖西市': 'Kosai City', '湯沢市': 'Yuzawa City',
  '滑川市': 'Namerikawa City', '滝川市': 'Takikawa City', '瀬戸市': 'Seto City',
  '焼津市': 'Yaizu City', '熊本市': 'Kumamoto City', '熊谷市': 'Kumagaya City',
  '熊野市': 'Kumano City', '熱海市': 'Atami City', '牛久市': 'Ushiku City',
  '犬山市': 'Inuyama City', '狛江市': 'Komae City', '狭山市': 'Sayama City',
  '猿島郡境町': 'Sakai Town, Sashima District', '玉名市': 'Tamana City', '瑞浪市': 'Mizunami City',
  '瑞穂市': 'Mizuho City', '生駒市': 'Ikoma City', '生駒郡平群町': 'Heguri Town, Ikoma District',
  '田原市': 'Tahara City', '田川市': 'Tagawa City', '田方郡函南町': 'Kannami Town, Tagata District',
  '田村': 'Tamura City', '田辺市': 'Tanabe City', '由利本荘市': 'Yurihonjo City',
  '甲州市': 'Koshu City', '甲府市': 'Kofu City', '甲斐市': 'Kai City',
  '甲賀市': 'Koka City', '男鹿市': 'Oga City', '町田市': 'Machida City',
  '登別市': 'Noboribetsu City', '白井市': 'Shiroi City', '白山市': 'Hakusan City',
  '白岡市': 'Shiraoka City', '白河市': 'Shirakawa City', '白石市': 'Shiroishi City',
  '益田市': 'Masuda City', '盛岡市': 'Morioka City', '目黒区': 'Meguro Ward',
  '直方市': 'Nogata City', '相模原市': 'Sagamihara City', '真岡市': 'Moka City',
  '矢板市': 'Yaita City', '知多市': 'Chita City', '知多郡東浦町': 'Higashiura Town, Chita District',
  '知多郡阿久比町': 'Agui Town, Chita District', '知立市': 'Chiryu City', '石岡市': 'Ishioka City',
  '石巻市': 'Ishinomaki City', '石狩市': 'Ishikari City', '砺波市': 'Tonami City',
  '碧南市': 'Hekinan City', '磐田市': 'Iwata City', '神埼郡吉野ヶ里町': 'Yoshinogari Town, Kanzaki District',
  '神崎郡福崎町': 'Fukusaki Town, Kanzaki District', '神戸市': 'Kobe City', '神栖市': 'Kamisu City',
  '福井市': 'Fukui City', '福山市': 'Fukuyama City', '福岡市': 'Fukuoka City',
  '福島市': 'Fukushima City', '福生市': 'Fussa City', '福知山市': 'Fukuchiyama City',
  '秋田市': 'Akita City', '秦野市': 'Hadano City', '秩父市': 'Chichibu City',
  '秩父郡皆野町': 'Minano Town, Chichibu District', '稲城市': 'Inagi City', '稲敷市': 'Inashiki City',
  '稲沢市': 'Inazawa City', '立川市': 'Tachikawa City', '竹原市': 'Takehara City',
  '笛吹市': 'Fuefuki City', '笠岡市': 'Kasaoka City', '笠間市': 'Kasama City',
  '筑紫野市': 'Chikushino City', '筑西市': 'Chikusei City', '箕面市': 'Minoh City',
  '米子市': 'Yonago City', '米沢市': 'Yonezawa City', '糟屋郡志免町': 'Shime Town, Kasuya District',
  '糟屋郡新宮町': 'Shingu Town, Kasuya District', '糟屋郡篠栗町': 'Sasaguri Town, Kasuya District', '糟屋郡粕屋町': 'Kasuya Town, Kasuya District',
  '糸島市': 'Itoshima City', '糸魚川市': 'Itoigawa City', '紀の川市': 'Kinokawa City',
  '綾瀬市': 'Ayase City', '総社市': 'Soja City', '練馬区': 'Nerima Ward',
  '美濃加茂市': 'Minokamo City', '美馬市': 'Mima City', '羽島市': 'Hashima City',
  '羽曳野市': 'Habikino City', '羽村': 'Hamura City', '羽生市': 'Hanyu City',
  '習志野市': 'Narashino City', '胆沢郡金ケ崎町': 'Kanegasaki Town, Isawa District', '能代市': 'Noshiro City',
  '舞鶴市': 'Maizuru City', '船橋市': 'Funabashi City', '芦屋市': 'Ashiya City',
  '花巻市': 'Hanamaki City', '苫小牧市': 'Tomakomai City', '茂原市': 'Mobara City',
  '茅ヶ崎市': 'Chigasaki City', '茅野市': 'Chino City', '茨木市': 'Ibaraki City',
  '草加市': 'Soka City', '草津市': 'Kusatsu City', '荒川区': 'Arakawa Ward',
  '菊川市': 'Kikugawa City', '菊池郡菊陽町': 'Kikuyo Town, Kikuchi District', '萩市': 'Hagi City',
  '葛城市': 'Katsuragi City', '葛飾区': 'Katsushika Ward', '蒲郡市': 'Gamagori City',
  '蓮田市': 'Hasuda City', '蕨市': 'Warabi City', '薩摩川内市': 'Satsumasendai City',
  '藤井寺市': 'Fujiidera City', '藤岡市': 'Fujioka City', '藤枝市': 'Fujieda City',
  '藤沢市': 'Fujisawa City', '行田市': 'Gyoda City', '袋井市': 'Fukuroi City',
  '袖ケ浦市': 'Sodegaura City', '裾野市': 'Susono City', '西多摩郡日の出町': 'Hinode Town, Nishitama District',
  '西多摩郡瑞穂町': 'Mizuho Town, Nishitama District', '西宮市': 'Nishinomiya City', '西尾市': 'Nishio City',
  '西条市': 'Saijo City', '西東京市': 'Nishitokyo City', '西白河郡矢吹町': 'Yabuki Town, Nishishirakawa District',
  '見附市': 'Mitsuke City', '観音寺市': 'Kanonji City', '調布市': 'Chofu City',
  '諏訪市': 'Suwa City', '諏訪郡下諏訪町': 'Shimosuwa Town, Suwa District', '諫早市': 'Isahaya City',
  '豊中市': 'Toyonaka City', '豊岡市': 'Toyooka City', '豊島区': 'Toshima Ward',
  '豊川市': 'Toyokawa City', '豊橋市': 'Toyohashi City', '豊田市': 'Toyota City',
  '賀茂郡河津町': 'Kawazu Town, Kamo District', '赤穂市': 'Ako City', '越前市': 'Echizen City',
  '越谷市': 'Koshigaya City', '足利市': 'Ashikaga City', '足柄上郡大井町': 'Oi Town, Ashigarakami District',
  '足柄上郡開成町': 'Kaisei Town, Ashigarakami District', '足柄下郡湯河原町': 'Yugawara Town, Ashigarashimo District', '足立区': 'Adachi Ward',
  '近江八幡市': 'Omihachiman City', '逗子市': 'Zushi City', '遠賀郡岡垣町': 'Okagaki Town, Onga District',
  '邑楽郡大泉町': 'Oizumi Town, Ora District', '那珂川市': 'Nakagawa City', '那珂市': 'Naka City',
  '那珂郡東海村': 'Tokai Village, Naka District', '那覇市': 'Naha City', '那須塩原市': 'Nasushiobara City',
  '郡北広島町': 'Kitahiroshima Town', '郡山市': 'Koriyama City', '都城市': 'Miyakonojo City',
  '都留市': 'Tsuru City', '酒田市': 'Sakata City', '野々市': 'Nonoichi City',
  '野洲市': 'Yasu City', '野田市': 'Noda City', '金沢市': 'Kanazawa City',
  '鈴鹿市': 'Suzuka City', '鎌ケ谷市': 'Kamagaya City', '鎌倉市': 'Kamakura City',
  '長久手市': 'Nagakute City', '長岡京市': 'Nagaokakyo City', '長岡市': 'Nagaoka City',
  '長崎市': 'Nagasaki City', '長浜市': 'Nagahama City', '長生郡一宮町': 'Ichinomiya Town, Chosei District',
  '長野市': 'Nagano City', '門真市': 'Kadoma City', '関市': 'Seki City',
  '阪南市': 'Hannan City', '防府市': 'Hofu City', '霧島市': 'Kirishima City',
  '青梅市': 'Ome City', '青森市': 'Aomori City', '静岡市': 'Shizuoka City',
  '韮崎市': 'Nirasaki City', '須坂市': 'Suzaka City', '須崎市': 'Susaki City',
  '須賀川市': 'Sukagawa City', '額田郡幸田町': 'Kota Town, Nukata District', '飯塚市': 'Iizuka City',
  '飯山市': 'Iiyama City', '飯田市': 'Iida City', '飯能市': 'Hanno City',
  '館山市': 'Tateyama City', '館林市': 'Tatebayashi City', '香南市': 'Konan City',
  '香取市': 'Katori City', '香取郡多古町': 'Tako Town, Katori District', '駒ヶ根市': 'Komagane City',
  '駿東郡清水町': 'Shimizu Town, Sunto District', '駿東郡長泉町': 'Nagaizumi Town, Sunto District', '高山市': 'Takayama City',
  '高岡市': 'Takaoka City', '高崎市': 'Takasaki City', '高座郡寒川町': 'Samukawa Town, Koza District',
  '高松市': 'Takamatsu City', '高梁市': 'Takahashi City', '高槻市': 'Takatsuki City',
  '高浜市': 'Takahama City', '高知市': 'Kochi City', '高砂市': 'Takasago City',
  '高萩市': 'Takahagi City', '鯖江市': 'Sabae City', '鳥取市': 'Tottori City',
  '鳥栖市': 'Tosu City', '鳴門市': 'Naruto City', '鴨川市': 'Kamogawa City',
  '鴻巣市': 'Konosu City', '鶴ヶ島市': 'Tsurugashima City', '鶴岡市': 'Tsuruoka City',
  '鹿児島市': 'Kagoshima City', '鹿屋市': 'Kanoya City', '鹿嶋市': 'Kashima City',
  '鹿沼市': 'Kanuma City', '鹿角市': 'Kazuno City', '黒部市': 'Kurobe City',
  '龍ケ崎市': 'Ryugasaki City',
};

// Only used when currentLang is 'en' (see renderAreaGroupMarkers); falls
// back to the raw Japanese name if a prefecture/wardCity string somehow
// isn't in either table (shouldn't happen for the current dataset, but the
// tables aren't a general gazetteer so new data could introduce one).
function getAreaLabel(name) {
  if (currentLang !== 'en') return name;
  return PREFECTURE_EN[name] || WARD_CITY_EN[name] || name;
}

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
    if (zoom >= 12) {
      return null; // Show individual stores
    } else if (zoom >= 11) {
      return this.parseWardCity(address); // Group by ward/city
    } else {
      return this.parsePrefecture(address); // Group by prefecture
    }
  }
};

// Group stores by administrative area. `stores` is the padded (pre-loaded,
// includes a buffer just outside the viewport for smooth panning) set;
// `strictVisibleIds` identifies which of those are actually on-screen right
// now, so each group's pill can be centered on its visible members instead
// of drifting off-screen toward off-screen ones (see calculateCentroid).
function groupStoresByArea(stores, zoom, strictVisibleIds) {
  const groups = {};
  const individualStores = [];

  stores.forEach(feature => {
    // Option 1: Use pre-parsed address properties instead of parsing on every call
    // This is MUCH faster than parsing strings with regex
    let adminArea;
    if (zoom >= 12) {
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
          coordinates: [],
          strictCoordinates: []
        };
      }
      groups[adminArea].stores.push(feature);
      groups[adminArea].coordinates.push(feature.geometry.coordinates);
      if (strictVisibleIds.has(feature.properties.id)) {
        groups[adminArea].strictCoordinates.push(feature.geometry.coordinates);
      }
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
function renderAreaGroupMarkers(groups, tier) {
  areaGroupMarkers.forEach(marker => marker.remove());
  areaGroupMarkers = [];

  // R009: a prefecture-level pill should land on ward/city level when
  // clicked, not jump straight past it to individual stores; a ward-level
  // pill can go straight to individual stores since that's the natural next
  // step down.
  const targetZoom = tier === 'prefecture' ? 12 : 14;
  const statsKey = tier === 'prefecture' ? 'prefecture' : 'wardCity';
  const bounds = map.getBounds();

  Object.entries(groups).forEach(([areaName, group]) => {
    const fixedStat = areaStats[statsKey][areaName];

    // Primary: the fixed, precomputed-from-the-whole-dataset centroid (see
    // areaStats) - stable across pan/zoom, matching the reference site's own
    // behavior. Fallback only if that fixed point isn't actually on-screen
    // right now: use the strictly-visible members' centroid instead, so a
    // large area that's only partially in view never ends up with an
    // invisible pill despite having visible member stores. Last-resort
    // fallback (no fixed stat at all, shouldn't normally happen) uses the
    // full padded group.
    let centroid = fixedStat ? fixedStat.centroid : calculateCentroid(group.coordinates);
    if (!bounds.contains(centroid) && group.strictCoordinates.length) {
      centroid = calculateCentroid(group.strictCoordinates);
    }
    const count = fixedStat ? fixedStat.count : group.stores.length;

    const el = document.createElement('div');
    el.className = 'area-group-marker';
    el.innerHTML = `<span class="area-label">${getAreaLabel(areaName)}</span><span class="area-count">${count}</span>`;
    el.addEventListener('click', () => {
      map.easeTo({
        center: centroid,
        zoom: targetZoom,
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
    center: urlState.center || MAP_CONFIG.INITIAL_CENTER,
    zoom: urlState.zoom ?? MAP_CONFIG.INITIAL_ZOOM,
    minZoom: MAP_CONFIG.MIN_ZOOM,
    maxZoom: MAP_CONFIG.MAX_ZOOM,
    maxBounds: MAP_CONFIG.MAX_BOUNDS,
    language: 'ja',
    // Default AttributionControl is replaced just below with a customized
    // one (see R061 comment there) - disable it here to avoid a duplicate.
    attributionControl: false
  });

  // Keyboard-shortcuts link (R061) lives inside the attribution control,
  // alongside the map's own data/terms/report-error links, rather than as
  // a separate floating element. Two AttributionControl quirks to work
  // around: it strips any <a> whose href isn't http(s)/mailto (so "#"
  // doesn't survive - using a real Mapbox URL instead, which is moot since
  // our click handler below calls preventDefault()); and it only keeps
  // class (not id) when rebuilding the tag, and can re-render this whole
  // control's innerHTML later (e.g. on a subsequent 'sourcedata' event) -
  // so the click handler is delegated from a stable ancestor in
  // initUIEvents() rather than attached directly to this element.
  map.addControl(new mapboxgl.AttributionControl({
    customAttribution: '<a href="https://www.mapbox.com/" class="keyboard-guide-link">キーボードショートカット</a>'
  }));

  // Customer feedback: flick-panning coasted too far after release compared
  // to Google Maps. Mapbox's default deceleration (2500) let a flick glide
  // roughly 3x the distance of the drag itself; 9000 and 7000 both felt too
  // stiff/abrupt in live testing. maxSpeed/linearity left at Mapbox's
  // defaults - deceleration was the only knob that mattered for "moves too
  // much" specifically.
  map.dragPan.enable({ deceleration: 6500, maxSpeed: 1400, linearity: 0.3 });

  // Home/End/Page Up/Page Down aren't handled by Mapbox's built-in keyboard
  // handler (only arrows + +/- are) but the reference site's native Google
  // Maps keyboard shortcuts support them (move the view 75% of the viewport
  // in each direction) - added here so the keyboard-shortcuts guide's
  // content is accurate, not just visually copied.
  map.getCanvas().addEventListener('keydown', (e) => {
    const size = map.getContainer().getBoundingClientRect();
    let dx = 0, dy = 0;
    switch (e.key) {
      case 'Home': dx = -size.width * 0.75; break;
      case 'End': dx = size.width * 0.75; break;
      case 'PageUp': dy = -size.height * 0.75; break;
      case 'PageDown': dy = size.height * 0.75; break;
      default: return;
    }
    e.preventDefault();
    map.panBy([dx, dy]);
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
    areaStats = computeAreaStats();

    // Update the UI with loaded stores
    updateStoreListImmediate(); // Immediate update on initial load
    updateStoreCount();
    initBrandFilters(); // Re-initialize brand filters with actual data
    restoreFiltersFromUrl(); // Apply brands/amenities from a shared URL, if any

    // Add Japanese language support (kept as a module-level reference so
    // toggleUiLanguage (R068) can switch map labels along with the UI chrome)
    if (typeof MapboxLanguage !== 'undefined') {
      languageControl = new MapboxLanguage({ defaultLanguage: 'ja' });
      map.addControl(languageControl);
    }

    // Add navigation controls. Mapbox only offers the 4 corners as control
    // positions, so to get "center-right" the control is added to top-right
    // as usual and then re-anchored with CSS (.zoom-controls-center-right in
    // store-locator.md) - marking it with a stable class here rather than
    // relying on child order/nth-child, which would silently break if
    // another control gets added to this corner later.
    const navigationControl = new mapboxgl.NavigationControl({ showCompass: false });
    map.addControl(navigationControl, 'top-right');
    navigationControl._container.classList.add('zoom-controls-center-right');

    // Add current-location control, matching the reference site's locate-me
    // button: shows a marker at the user's position and zooms in to it.
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: false,
      showUserLocation: true,
      fitBoundsOptions: { maxZoom: MAP_CONFIG.GEOLOCATE_ZOOM }
    });
    map.addControl(geolocateControl, 'bottom-right');
    geolocateControl._container.classList.add('map-ctrl-large');
    navigationControl._container.classList.add('map-ctrl-large');

    // Fallback when location permission is denied or unavailable: stay on the
    // Japan-wide overview (MAP_CONFIG.INITIAL_CENTER/INITIAL_ZOOM) rather than
    // getting stuck - the store list still sorts by distance from that view's
    // center via updateStoreListImmediate().
    geolocateControl.on('error', () => {
      console.log('Geolocation unavailable or denied — staying on default Japan-wide view');
    });

    // Trigger it automatically on load so the map centers on the user's
    // location right away, without requiring them to click the button first -
    // unless a shared URL already specifies a map position, in which case that
    // shared view should win over the visitor's own current location. (A URL
    // with only brands/amenities and no position still auto-geolocates as usual.)
    // GeolocateControl attaches itself to the map asynchronously (it checks
    // geolocation support via navigator.permissions first), so poll until
    // it's actually ready rather than guessing a fixed delay.
    if (!urlState.center) {
      const triggerWhenReady = setInterval(() => {
        if (geolocateControl._map) {
          clearInterval(triggerWhenReady);
          geolocateControl.trigger();
        }
      }, 50);
    }

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

      // Route preview (walking/driving directions, R046/R047) - under markers
      map.addSource('route', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        paint: {
          'line-color': '#2684FF',
          'line-width': 5,
          'line-opacity': 0.8
        }
      });

      // Add symbol layer for individual stores (brand icons)
      map.addLayer({
        id: 'store-icons',
        type: 'symbol',
        source: 'stores',
        layout: {
          'icon-image': ['concat', 'brand-', ['get', 'brand']],
          'icon-size': STORE_ICON_BASE_SIZE,
          'icon-anchor': 'bottom',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
          'symbol-sort-key': 0
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
          'text-size': PARKING_TEXT_BASE_SIZE,
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

      // Layer order alone puts every parking-text "P" badge above every
      // store icon, so when the selected store's icon grows during its
      // pulse it can grow underneath a neighboring store's "P" badge
      // (symbol-sort-key only reorders features within the same layer, not
      // across layers). These two duplicate the selected feature's icon and
      // (if it has one) its own "P" badge onto layers stacked above
      // parking-text, so the selected store is always drawn on top of every
      // other store's badge. Hidden via an impossible filter until a store
      // is selected (see updateSymbolState).
      map.addLayer({
        id: 'selected-store-icon',
        type: 'symbol',
        source: 'stores',
        filter: ['==', ['get', 'id'], ''],
        layout: {
          'icon-image': ['concat', 'brand-', ['get', 'brand']],
          'icon-size': STORE_ICON_BASE_SIZE,
          'icon-anchor': 'bottom',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true
        }
      });

      map.addLayer({
        id: 'selected-parking-text',
        type: 'symbol',
        source: 'stores',
        filter: ['all', ['==', ['get', 'hasParking'], true], ['==', ['get', 'id'], '']],
        layout: {
          'text-field': 'P',
          'text-size': PARKING_TEXT_BASE_SIZE,
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

          // Center on the clicked store WITHOUT changing zoom - the marker
          // is already visible on-screen, so there's nothing to zoom in
          // for. Confirmed against the reference site: clicking a marker
          // there never changes zoom, only pans to center it.
          const targetZoom = map.getZoom();
          const offsetCenter = getCenterOffset(feature.geometry.coordinates, targetZoom);

          map.flyTo({
            center: offsetCenter,
            zoom: targetZoom,
            duration: 500
          });

          scheduleShowPopupOnMoveEnd(feature);
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
      updateUrlFromState(); // Keep the shareable URL's lat/lng/zoom current
    });
  });
}

// Get zoom level category
function getZoomLevel(zoom) {
  if (zoom >= 12) return 'individual';
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

  // Strictly on-screen subset (no padding) - a group pill should be centered
  // on whichever of its members are actually visible, not pulled off-screen
  // by padding-only members averaged in from just outside the viewport
  // (e.g. a large city only partially in view, whose other stores sit south
  // of the visible area - see calculateCentroid).
  const strictVisibleIds = new Set(
    getVisibleStores(filteredStores, bounds, 0).map(f => f.properties.id)
  );

  // R009: once the viewport has narrowed to a single prefecture, switch to
  // ward/city-level grouping even if the raw zoom hasn't crossed that
  // threshold yet - a single giant "prefecture: N" pill isn't useful once
  // the user has already isolated one prefecture by panning/zooming.
  let effectiveZoom = zoom;
  if (zoom < 11) {
    const distinctPrefectures = new Set(
      visibleStores.map(f => f.properties.prefecture).filter(Boolean)
    );
    if (distinctPrefectures.size === 1) {
      effectiveZoom = 11;
    }
  }

  const { groups, individualStores } = groupStoresByArea(visibleStores, effectiveZoom, strictVisibleIds);

  // Render area-group markers as DOM pills (label + count)
  renderAreaGroupMarkers(groups, getZoomLevel(effectiveZoom));

  // Update individual stores source
  map.getSource('stores').setData({
    type: 'FeatureCollection',
    features: individualStores
  });

  console.log(`Zoom ${zoom.toFixed(1)}: ${visibleStores.length} visible of ${filteredStores.length} total | ${Object.keys(groups).length} groups, ${individualStores.length} individual stores`);
}

// Parse an "HH:MM～HH:MM" (or "24時間") hours string into minutes-of-day.
// closeMin may exceed 1440 when the range crosses midnight.
function parseHoursRange(text) {
  if (!text) return null;
  if (text.includes('24時間')) return { openMin: 0, closeMin: 1440 };
  const m = text.match(/(\d{1,2}):(\d{2})[～\-~](\d{1,2}):(\d{2})/);
  if (!m) return null;
  const openMin = Number(m[1]) * 60 + Number(m[2]);
  let closeMin = Number(m[3]) * 60 + Number(m[4]);
  if (closeMin <= openMin) closeMin += 1440; // crosses midnight
  return { openMin, closeMin };
}

// Whether a store is open right now, given its weekday/weekend hours text.
// Returns true/false, or null if the hours text isn't parseable (e.g. "お問い合わせください").
function getOpenStatus(weekdayHours, weekendHours) {
  const now = new Date();
  const day = now.getDay(); // 0=Sun..6=Sat
  const isWeekend = d => d === 0 || d === 6;
  const todayText = isWeekend(day) ? weekendHours : weekdayHours;
  const yesterdayText = isWeekend((day + 6) % 7) ? weekendHours : weekdayHours;
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const today = parseHoursRange(todayText);
  if (today && nowMin >= today.openMin && nowMin < today.closeMin) return true;

  // Carry-over check: still open from yesterday's overnight hours (e.g. 8:00-26:00)
  const yesterday = parseHoursRange(yesterdayText);
  if (yesterday && yesterday.closeMin > 1440 && nowMin < yesterday.closeMin - 1440) return true;

  if (today || yesterday) return false;
  return null;
}

// Great-circle distance in km between two [lng, lat] coordinates
function getDistanceKm([lng1, lat1], [lng2, lat2]) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
    // Higher symbol-sort-key draws on top - keep the selected store's icon
    // above any overlapping neighbors instead of it being hidden underneath.
    map.setLayoutProperty('store-icons', 'symbol-sort-key', [
      'case',
      ['==', ['get', 'id'], selectedStoreId],
      1,
      0
    ]);
    map.setFilter('selected-store-icon', ['==', ['get', 'id'], selectedStoreId]);
    map.setFilter('selected-parking-text', ['all', ['==', ['get', 'hasParking'], true], ['==', ['get', 'id'], selectedStoreId]]);
    startSelectedStorePulse();
  } else {
    map.setPaintProperty('store-icons', 'icon-opacity', 1);
    map.setLayoutProperty('store-icons', 'symbol-sort-key', 0);
    map.setFilter('selected-store-icon', ['==', ['get', 'id'], '']);
    map.setFilter('selected-parking-text', ['all', ['==', ['get', 'hasParking'], true], ['==', ['get', 'id'], '']]);
    stopSelectedStorePulse();
  }
}

// Heartbeat pulse animation for the selected store's icon only
const STORE_ICON_BASE_SIZE = 0.48; // 80% of the previous 0.6
const PARKING_BASE_OFFSET = [1.2, -3.2]; // scaled with STORE_ICON_BASE_SIZE to stay aligned to the icon
const PARKING_TEXT_BASE_SIZE = 16 * 0.8; // scaled with STORE_ICON_BASE_SIZE to stay proportional to the icon
let pulseAnimationId = null;

function startSelectedStorePulse() {
  if (pulseAnimationId) return; // already running

  function animate(timestamp) {
    if (!selectedStoreId || !map.getLayer('store-icons')) {
      pulseAnimationId = null;
      return;
    }
    const scale = STORE_ICON_BASE_SIZE + Math.abs(Math.sin(timestamp / 600)) * 0.2;
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
      map.setLayoutProperty('parking-text', 'text-size', [
        'case',
        ['==', ['get', 'id'], selectedStoreId],
        PARKING_TEXT_BASE_SIZE * scaleRatio,
        PARKING_TEXT_BASE_SIZE
      ]);
    }
    if (map.getLayer('selected-store-icon')) {
      map.setLayoutProperty('selected-store-icon', 'icon-size', scale);
    }
    if (map.getLayer('selected-parking-text')) {
      map.setLayoutProperty('selected-parking-text', 'text-offset', [
        'literal', [PARKING_BASE_OFFSET[0] * scaleRatio, PARKING_BASE_OFFSET[1] * scaleRatio]
      ]);
      map.setLayoutProperty('selected-parking-text', 'text-size', PARKING_TEXT_BASE_SIZE * scaleRatio);
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
    map.setLayoutProperty('parking-text', 'text-size', PARKING_TEXT_BASE_SIZE);
  }
  if (map.getLayer('selected-store-icon')) {
    map.setLayoutProperty('selected-store-icon', 'icon-size', STORE_ICON_BASE_SIZE);
  }
  if (map.getLayer('selected-parking-text')) {
    map.setLayoutProperty('selected-parking-text', 'text-offset', PARKING_BASE_OFFSET);
    map.setLayoutProperty('selected-parking-text', 'text-size', PARKING_TEXT_BASE_SIZE);
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

  const amenitiesText = amenities.length ? amenities.join('／') : t('noneLabel');
  const showAmenitiesToggle = amenities.length > 2;

  const menuButton = props.menuUrl
    ? `<a class="popup-menu-btn" href="${props.menuUrl}" target="_blank" rel="noopener">${t('popupMenu')}</a>`
    : '';

  const reserveButton = props.reservationUrl
    ? `<a class="popup-reserve-btn" href="${props.reservationUrl}" target="_blank" rel="noopener">${t('popupReserve')}</a>`
    : '';

  const openStatus = getOpenStatus(hours.weekday, hours.weekend);
  const openStatusBadge = openStatus === null
    ? ''
    : `<span class="popup-open-status ${openStatus ? 'is-open' : 'is-closed'}">${openStatus ? t('popupOpen') : t('popupClosed')}</span>`;

  const noticeBanner = props.notice
    ? `<div class="popup-notice">${props.notice}</div>`
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
      ${noticeBanner}
      <div class="popup-section">
        <div class="popup-label">${t('popupAddress')}</div>
        <div class="popup-value">
          ${props.address}
          <div class="popup-route-actions">
            <button type="button" onclick="showRouteToStore([${feature.geometry.coordinates[0]}, ${feature.geometry.coordinates[1]}], 'walking')">${t('popupWalkRoute')}</button>
            <button type="button" onclick="showRouteToStore([${feature.geometry.coordinates[0]}, ${feature.geometry.coordinates[1]}], 'driving-traffic')">${t('popupDriveRoute')}</button>
          </div>
        </div>
      </div>
      <div class="popup-section">
        <div class="popup-label">${t('popupHours')}</div>
        <div class="popup-value popup-value-bold">
          ${t('popupWeekdayPrefix')}${hours.weekday}<br>
          ${t('popupWeekendPrefix')}${hours.weekend} ${openStatusBadge}
        </div>
      </div>
      <div class="popup-section">
        <div class="popup-label">${t('popupPhone')}</div>
        <div class="popup-value popup-value-bold">${props.phone}</div>
      </div>
      ${props.hasParking ? `
      <div class="popup-section">
        <div class="popup-label">${t('popupParking')}</div>
        <div class="popup-value popup-value-bold">
          ${t('popupParkingYes')}${props.hasDisabledParking ? t('popupParkingDisabled') : ''}
        </div>
      </div>
      ` : ''}
      <div class="popup-section">
        <div class="popup-label">${t('popupAmenities')}</div>
        <div class="popup-value">
          <div class="popup-value-amenities">${amenitiesText}</div>
          ${showAmenitiesToggle ? `<button class="popup-amenities-toggle" onclick="
            const el = this.previousElementSibling;
            const expanded = el.classList.toggle('expanded');
            this.textContent = expanded ? t('popupLessLink') : t('popupMoreLink');
          ">${t('popupMoreLink')}</button>` : ''}
        </div>
      </div>
    </div>
    <div class="popup-footer">
      <button class="popup-details-btn">${t('popupDetails')}</button>
      ${menuButton}
      ${reserveButton}
    </div>
  `;
}

// Show a popup once the current flyTo settles - but only if this is still the
// most recent request. map.once('moveend', ...) alone isn't safe here: if the
// user starts a new zoom/pan before a pending flyTo's own moveend fires, that
// same stale listener still fires on the NEXT moveend (the user's unrelated
// action), popping the old popup back up. A generation counter makes stale
// requests silently no-op instead.
let popupRequestId = 0;
function scheduleShowPopupOnMoveEnd(feature) {
  const requestId = ++popupRequestId;
  const handler = () => {
    map.off('moveend', handler);
    if (requestId === popupRequestId) {
      showPopup(feature);
    }
  };
  map.on('moveend', handler);
}

// Show popup
let currentPopupFeature = null; // tracked so toggleUiLanguage() can re-render an open popup

function showPopup(feature) {
  if (currentPopup) {
    currentPopup.remove();
    currentPopup = null;
  }
  currentPopupFeature = feature;

  currentPopup = new mapboxgl.Popup({
    offset: 90,
    closeButton: false,
    closeOnClick: false,
    // Match the CSS width (.mapboxgl-popup-content) - Mapbox's own default
    // (240px) would otherwise clamp the wrapper via max-width:100% on the
    // content, since that resolves against Mapbox's inline max-width here.
    // Capped with a vw term too so it doesn't get clipped on phones narrower
    // than 380px.
    maxWidth: 'min(380px, 92vw)',
    // Always show the popup above the marker, not auto-detected: the
    // selected store is deliberately positioned south-of-center via
    // getCenterOffset() to leave room above it for exactly this. Without
    // forcing it, Mapbox can pick 'top' (box below the marker) based on a
    // stale height measurement taken before the popup's image/content
    // finishes loading, which then overflows off the bottom of the screen.
    anchor: 'bottom'
  })
    .setLngLat(feature.geometry.coordinates)
    .setHTML(createPopupContent(feature))
    .addTo(map);

  // The popup (with a real, useful, focusable close button and route
  // actions) is rendered as a child of #map, which is aria-hidden by
  // default (R062 - map is decorative, list is the primary UI). Hiding an
  // ancestor of focusable content is an accessibility anti-pattern the
  // browser itself blocks (and warns about) - so lift aria-hidden while a
  // popup with real content is actually open.
  document.getElementById('map').removeAttribute('aria-hidden');
}

// Close popup
function closePopup() {
  if (currentPopup) {
    currentPopup.remove();
    currentPopup = null;
  }
  currentPopupFeature = null;
  selectedStoreId = null;
  updateSymbolState();
  document.querySelectorAll('.store-item.active').forEach(item => item.classList.remove('active'));
  clearRoute();
  // Restore the map's decorative aria-hidden state now that its only
  // focusable content (the popup) is gone.
  document.getElementById('map').setAttribute('aria-hidden', 'true');
}

// Remove any drawn route and hide the route info banner (R046/R047)
function clearRoute() {
  if (map.getSource('route')) {
    map.getSource('route').setData({ type: 'FeatureCollection', features: [] });
  }
  const banner = document.getElementById('route-info-banner');
  if (banner) banner.classList.remove('active');
}
window.clearRoute = clearRoute;

// Show the info banner over the map with a route's distance/duration
function showRouteInfo(profile, distanceKm, durationMin) {
  const banner = document.getElementById('route-info-banner');
  const label = profile === 'walking' ? t('routeWalk') : t('routeDrive');
  banner.innerHTML = `
    <span>${t('routeInfo', label, distanceKm, durationMin)}</span>
    <button onclick="clearRoute()" aria-label="${currentLang === 'en' ? 'Close route' : 'ルートを閉じる'}" type="button">×</button>
  `;
  banner.classList.add('active');
}

// Fetch and draw a route from the user's current location to a store via
// the Mapbox Directions API (R046 walking / R047 driving).
function showRouteToStore(destination, profile) {
  if (!navigator.geolocation) {
    alert(t('routeGeoUnsupported'));
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const origin = [position.coords.longitude, position.coords.latitude];

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox.tmp.valhalla-zenrin/${profile}/` +
        `${origin[0]},${origin[1]};${destination[0]},${destination[1]}` +
        `?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`
      );

      if (!response.ok) {
        throw new Error(`Directions API error: ${response.status}`);
      }

      const data = await response.json();
      const route = data.routes && data.routes[0];
      if (!route) {
        alert(t('routeNotFound'));
        return;
      }

      map.getSource('route').setData({
        type: 'FeatureCollection',
        features: [{ type: 'Feature', geometry: route.geometry, properties: {} }]
      });

      showRouteInfo(profile, (route.distance / 1000).toFixed(1), Math.round(route.duration / 60));

      const coords = route.geometry.coordinates;
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new mapboxgl.LngLatBounds(coords[0], coords[0])
      );
      map.fitBounds(bounds, { padding: 60, duration: 1000 });
    } catch (error) {
      console.error('Directions error:', error);
      alert(t('routeFetchError'));
    }
  }, (error) => {
    console.error('Geolocation error:', error);
    alert(t('routeGeoError'));
  });
}
window.showRouteToStore = showRouteToStore;

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

  // Camera movement is the caller's responsibility. Callers preserve the
  // current zoom (R013) except when selecting a store from the list while
  // it's still aggregated into a group pill, where zooming in is the whole
  // point - see activateStoreItem().

  // On mobile, reveal the map (and the popup about to show on it) instead of
  // leaving the side-panel drawer open over it. No-op/inert on desktop.
  if (collapseMobileSheet) collapseMobileSheet();
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

  // Sort by the production site's brand order (R036); anything not listed
  // there keeps its original (first-appearance) relative order at the end.
  const sortedBrands = Object.entries(brandIconsByName).sort((a, b) => {
    const ai = BRAND_ORDER.indexOf(a[0]);
    const bi = BRAND_ORDER.indexOf(b[0]);
    return (ai === -1 ? BRAND_ORDER.length : ai) - (bi === -1 ? BRAND_ORDER.length : bi);
  });

  sortedBrands.forEach(([brand, iconPath]) => {
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
      <span class="amenity-filter-name">${currentLang === 'en' ? filterDef.labelEn : filterDef.label}</span>
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
  const searchText = searchFilterQuery.toLowerCase();
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

    // Amenity filter (絞り込み検索) - AND (must have all) or OR (must have
    // at least one) across selected amenities, per amenityFilterMode
    if (selectedAmenities.length > 0) {
      const matchesAmenities = amenityFilterMode === 'OR'
        ? selectedAmenities.some(id => props.amenityFlags[id])
        : selectedAmenities.every(id => props.amenityFlags[id]);
      if (!matchesAmenities) {
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

  areaStats = computeAreaStats();

  updateStoreListImmediate(); // Direct call for immediate response to filter clicks
  updateMapLayers(); // Direct call - no debouncing needed for discrete filter actions
  updateStoreCount();

  const hasActiveFilters = selectedAmenities.length > 0 || selectedBrands.length > 0;
  document.getElementById('floating-clear-filters').classList.toggle('visible', hasActiveFilters);

  updateUrlFromState();
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

// Marker pointing at the nearest store when the viewport has none visible.
// Pinned to the map's current center (like the reference site), not a
// sidebar element - removed again as soon as any store re-enters view.
let nearestStoreMarker = null;

function removeNearestStoreMarker() {
  if (nearestStoreMarker) {
    nearestStoreMarker.remove();
    nearestStoreMarker = null;
  }
}

// Immediate list update (called by debouncer or when immediate update needed)
// When no stores are visible in the current viewport, show the plain empty
// message in the list and point to the nearest store (by distance from the
// map center) with a marker on the map instead.
function showNearestStoreLink(centerCoords) {
  const storeList = document.getElementById('store-list');
  const emptyState = document.createElement('div');
  emptyState.className = 'empty-state-nearest';
  emptyState.innerHTML = `<p>${t('noStoresHere')}</p>`;
  storeList.appendChild(emptyState);

  removeNearestStoreMarker();
  if (filteredStores.length === 0) return; // nothing to point to (e.g. filters exclude everything)

  let nearest = null;
  let nearestDist = Infinity;
  filteredStores.forEach(feature => {
    const dist = getDistanceKm(centerCoords, feature.geometry.coordinates);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearest = feature;
    }
  });
  if (!nearest) return;

  const bearing = turf.bearing(turf.point(centerCoords), turf.point(nearest.geometry.coordinates));

  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'to-nearest';
  el.innerHTML = `
    <span class="label">${t('nearestStoreLink', nearest.properties.name, nearestDist.toFixed(1))}</span>
    <div class="direction" style="transform: rotate(${bearing}deg)">
      <svg width="18" height="18" viewBox="0 -960 960 960"><path d="M440-80v-647L256-544l-56-56 280-280 280 280-56 57-184-184v647h-80Z"/></svg>
    </div>
  `;
  el.addEventListener('click', () => {
    selectStore(nearest.properties.id);
    // 12 matches our own individual-marker threshold (getZoomLevel()).
    const targetZoom = 12;
    const offsetCenter = getCenterOffset(nearest.geometry.coordinates, targetZoom);
    map.flyTo({ center: offsetCenter, zoom: targetZoom, duration: 1000 });
    scheduleShowPopupOnMoveEnd(nearest);
  });

  nearestStoreMarker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
    .setLngLat(centerCoords)
    .addTo(map);
}

function updateStoreListImmediate() {
  const storeList = document.getElementById('store-list');
  storeList.innerHTML = '';

  // Filter by viewport WITHOUT padding - show only truly visible stores in list
  // (Map uses padding for smooth rendering, but list should match what user sees)
  const bounds = map.getBounds();
  const center = map.getCenter();
  const centerCoords = [center.lng, center.lat];

  // Sort by distance from the map's current center (not the user's GPS position),
  // so the list re-orders live as the viewport pans/zooms.
  currentVisibleStores = getVisibleStores(filteredStores, bounds, 0) // No padding
    .slice()
    .sort((a, b) =>
      getDistanceKm(centerCoords, a.geometry.coordinates) -
      getDistanceKm(centerCoords, b.geometry.coordinates)
    );

  // Reset display counter
  displayedCount = 0;

  // Show initial batch
  appendStoreListBatch();

  // No stores in view - offer a way to jump to the nearest one instead of
  // leaving the list area blank (R016)
  if (currentVisibleStores.length === 0) {
    showNearestStoreLink(centerCoords);
  } else {
    removeNearestStoreMarker();
  }

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
    storeItem.className = props.id === selectedStoreId ? 'store-item active' : 'store-item';
    storeItem.dataset.storeId = props.id;
    // A plain div isn't focusable or operable by keyboard by default - make
    // it behave like a real button for WCAG 2.1 AA keyboard support (R060).
    storeItem.tabIndex = 0;
    storeItem.setAttribute('role', 'button');
    storeItem.setAttribute('aria-label', `${props.name}、${props.address}`);

    const parkingBadge = props.hasParking
      ? '<span aria-label="駐車場あり" style="background: #9C27B0; color: white; padding: 2px 5px; border-radius: 3px; font-size: 10px; font-weight: bold; margin-right: 4px;">P</span>'
      : '';

    storeItem.innerHTML = `
      <img src="${props.brandIcon}" class="store-brand-icon" alt="${props.brand}">
      <div class="store-info">
        <div class="store-name">${parkingBadge}${props.name}</div>
        <div class="store-address">${props.address}</div>
      </div>
    `;

    function activateStoreItem() {
      selectStore(props.id);

      // Zoom in only if the store isn't already shown as an individual
      // marker (aggregated into a group pill below this threshold - see
      // getZoomLevel()). Confirmed against the reference site: selecting an
      // already-visible store from the list only centers on it, no zoom
      // change; selecting an aggregated one zooms in to reveal it.
      const currentZoom = map.getZoom();
      if (currentZoom < 12) {
        // Zoom in to show individual stores, then show popup. 12 matches
        // our own individual-marker threshold (getZoomLevel()).
        const offsetCenter = getCenterOffset(feature.geometry.coordinates, 12);

        map.flyTo({
          center: offsetCenter,
          zoom: 12,
          duration: 1000
        });

        // Show popup after zoom animation completes
        scheduleShowPopupOnMoveEnd(feature);
      } else {
        // Already zoomed in - just center, don't change zoom
        const offsetCenter = getCenterOffset(feature.geometry.coordinates, currentZoom);

        map.flyTo({
          center: offsetCenter,
          zoom: currentZoom,
          duration: 800
        });

        scheduleShowPopupOnMoveEnd(feature);
      }
    }

    storeItem.addEventListener('click', activateStoreItem);
    storeItem.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activateStoreItem();
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

  // If the selected store just got (re)rendered, scroll it into view - the
  // list is rebuilt from scratch on every moveend, so this can't rely on the
  // one-time scrollIntoView() in selectStore() surviving the rebuild.
  if (selectedStoreId !== null && newStores.some(f => f.properties.id === selectedStoreId)) {
    const activeItem = storeList.querySelector('.store-item.active');
    if (activeItem) activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Add loading indicator if there are more stores to show
  if (displayedCount < currentVisibleStores.length) {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-indicator';
    loadingDiv.style.cssText = 'padding: 16px 20px; background-color: #f0f0f0; text-align: center; font-size: 13px; color: #666;';
    loadingDiv.textContent = t('loadingMore', displayedCount);
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

  // Show count of visible stores - 0 gets its own message, 100+ is capped
  // rather than showing an exact (and unstably-changing) large number.
  const count = visibleStores.length;
  let text;
  if (count === 0) {
    text = t('noResultsInView');
  } else if (count >= 100) {
    text = t('tooManyResults');
  } else {
    text = t('resultsCount', count);
  }
  document.getElementById('store-count').textContent = text;
}

// Clear all filters
function clearFilters() {
  // Clear search box
  document.getElementById('search-box').value = '';
  searchFilterQuery = '';

  // Deselect all brand filters (no selection = show all brands) - except a
  // locked brand-page brand (R073), which stays active even through "clear".
  document.querySelectorAll('#brand-filters .brand-filter').forEach(btn => {
    if (btn.dataset.brand !== urlState.lockedBrand) btn.classList.remove('active');
  });

  // Uncheck all amenity filters and reset AND/OR mode back to the default
  document.querySelectorAll('#amenity-filters .amenity-filter').forEach(btn => {
    btn.classList.remove('active');
  });
  amenityFilterMode = 'AND';
  document.getElementById('amenity-mode-and').classList.add('active');
  document.getElementById('amenity-mode-or').classList.remove('active');

  // Clear selection
  selectedStoreId = null;
  closePopup();

  // Re-apply filters. Deliberately NOT resetting the map view here - after
  // searching somewhere and clicking "clear", the user should stay looking at
  // that area with filters cleared, not get sent back to the Japan-wide
  // overview (R024: Skylark explicitly flagged the old behavior as a bug).
  applyFilters();
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
  let highlightedSuggestionIndex = -1; // for arrow-key navigation (R060)

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
        `types=region,place,address,poi,street,locality,neighborhood&` +
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

  // Highlight the suggestion at highlightedSuggestionIndex (arrow-key nav, R060)
  function updateSuggestionHighlight() {
    Array.from(suggestionsContainer.querySelectorAll('.suggestion-item')).forEach((el, i) => {
      el.classList.toggle('highlighted', i === highlightedSuggestionIndex);
      if (i === highlightedSuggestionIndex) el.scrollIntoView({ block: 'nearest' });
    });
  }

  // Function to display suggestions
  function displaySuggestions(suggestions) {
    suggestionsContainer.innerHTML = '';
    highlightedSuggestionIndex = -1;

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

      // Update input with selected place name (a navigation label, not a filter
      // query - clear the tracked query so it doesn't get treated as one).
      // Uses address, not full_address: Mapbox's Search Box /suggest response
      // duplicates the address text inside full_address for some POI types
      // (e.g. "東京都港区東新橋1-1-11, 東京都港区東新橋1-1-11" for 新橋駅) -
      // address is the same text without that duplication.
      searchBox.value = suggestion.address || suggestion.place_formatted || suggestion.name;
      searchFilterQuery = '';

      // Hide suggestions
      suggestionsContainer.classList.remove('active');
      suggestionsContainer.innerHTML = '';
      currentSuggestions = [];

      // Generate new session token for next search
      sessionToken = generateSessionToken();

      // On mobile, reveal the map (and the place it's about to fly to)
      // instead of leaving the side-panel drawer open over it - same
      // reasoning as selectStore()'s collapseMobileSheet() call.
      if (collapseMobileSheet) collapseMobileSheet();

      // Large results (prefectures, cities) come back with a bbox - fit to
      // that instead of always flying to a fixed street-level zoom, which
      // would show only a tiny corner of a whole prefecture.
      if (feature.properties && feature.properties.bbox) {
        const [west, south, east, north] = feature.properties.bbox;
        map.fitBounds([[west, south], [east, north]], { padding: 40, duration: 1000 });
      } else {
        map.flyTo({
          center: [lng, lat],
          zoom: 14,
          duration: 1000
        });
      }
    } catch (error) {
      console.error('Error retrieving suggestion details:', error);
      // Fallback: try to use coordinates from suggestion if available
      if (suggestion.geometry && suggestion.geometry.coordinates) {
        const [lng, lat] = suggestion.geometry.coordinates;
        searchBox.value = suggestion.address || suggestion.name;
        searchFilterQuery = '';
        suggestionsContainer.classList.remove('active');
        suggestionsContainer.innerHTML = '';
        sessionToken = generateSessionToken();
        if (collapseMobileSheet) collapseMobileSheet();

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
    const query = e.target.value.trim();
    searchFilterQuery = query;
    getSuggestions(query);
  }, 300));

  // Close suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!searchBox.contains(e.target) && !suggestionsContainer.contains(e.target)) {
      suggestionsContainer.classList.remove('active');
    }
  });

  // Handle keyboard navigation
  searchBox.addEventListener('keydown', (e) => {
    // Ignore keys fired while an IME composition is in progress (e.g. Enter
    // to commit a kana->kanji conversion, しんばし->新橋) - keyCode 229 is
    // the legacy fallback for browsers that don't set isComposing. Without
    // this, that commit-Enter was misread as "select the highlighted
    // suggestion", closing the dropdown and overwriting the input before
    // the user had even finished typing their query.
    if (e.isComposing || e.keyCode === 229) return;

    if (e.key === 'Escape') {
      suggestionsContainer.classList.remove('active');
      suggestionsContainer.innerHTML = '';
      searchBox.blur();
      return;
    }

    if (!currentSuggestions.length || !suggestionsContainer.classList.contains('active')) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlightedSuggestionIndex = (highlightedSuggestionIndex + 1) % currentSuggestions.length;
      updateSuggestionHighlight();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlightedSuggestionIndex =
        (highlightedSuggestionIndex - 1 + currentSuggestions.length) % currentSuggestions.length;
      updateSuggestionHighlight();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const index = highlightedSuggestionIndex >= 0 ? highlightedSuggestionIndex : 0;
      selectSuggestion(currentSuggestions[index], index);
    }
  });
}

// Initialize UI event listeners
function initUIEvents() {
  // Initialize search
  initSearch();

  // Language toggle (R068)
  document.getElementById('lang-toggle').addEventListener('click', toggleUiLanguage);

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
  const amenityFilterWrapper = document.getElementById('amenity-filter-wrapper');

  amenityFilterToggle.addEventListener('click', () => {
    amenityFilterWrapper.classList.toggle('active');
    amenityFilterToggle.querySelector('.toggle-icon').classList.toggle('expanded', amenityFilterWrapper.classList.contains('active'));
  });

  // Keyboard operation guide (R061) - a link inside the attribution control
  // (added via customAttribution in initMap()) opening a centered dialog.
  // Delegated from document rather than attached to the link directly:
  // AttributionControl can rebuild that control's innerHTML later (e.g. on
  // a subsequent 'sourcedata' event), which would silently detach a
  // directly-attached listener.
  const keyboardGuideModal = document.getElementById('keyboard-guide-modal');
  const keyboardGuideBackdrop = document.getElementById('keyboard-guide-backdrop');
  const keyboardGuideClose = document.getElementById('keyboard-guide-close');

  function setKeyboardGuideOpen(open) {
    keyboardGuideModal.classList.toggle('active', open);
    keyboardGuideBackdrop.classList.toggle('active', open);
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('.keyboard-guide-link')) {
      e.preventDefault(); // real https: href (for AttributionControl's sanitizer), never actually navigated to
      setKeyboardGuideOpen(true);
    }
  });
  keyboardGuideClose.addEventListener('click', () => setKeyboardGuideOpen(false));
  keyboardGuideBackdrop.addEventListener('click', () => setKeyboardGuideOpen(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && keyboardGuideModal.classList.contains('active')) setKeyboardGuideOpen(false);
  });

  // AND/OR mode for combining multiple selected amenity filters (R034)
  const amenityModeAnd = document.getElementById('amenity-mode-and');
  const amenityModeOr = document.getElementById('amenity-mode-or');

  amenityModeAnd.addEventListener('click', () => {
    amenityFilterMode = 'AND';
    amenityModeAnd.classList.add('active');
    amenityModeOr.classList.remove('active');
    applyFilters();
  });

  amenityModeOr.addEventListener('click', () => {
    amenityFilterMode = 'OR';
    amenityModeOr.classList.add('active');
    amenityModeAnd.classList.remove('active');
    applyFilters();
  });

  // Floating clear-filters button (shown over the map when a filter is active)
  document.getElementById('floating-clear-filters').addEventListener('click', clearFilters);

  initSidePanelToggle();
}

// Mobile side-panel drawer (R053/R055 - was a draggable bottom sheet with
// リスト/地図 tabs, replaced at user request to match the reference site's
// own mobile pattern): a red "探す" tab pinned to the screen edge opens the
// same search/filter/list panel used on desktop as a full-height overlay;
// a "閉じる" tab (and the backdrop) closes it. CSS-inert on desktop (the
// media query gives these elements their positioning), so this is safe to
// always wire up.
function initSidePanelToggle() {
  const container = document.getElementById('container');
  const openTab = document.getElementById('open-side-panel');
  const closeTab = document.getElementById('close-side-panel');
  const backdrop = document.getElementById('sidebar-backdrop');

  function setPanelOpen(open) {
    container.classList.toggle('panel-open', open);
  }

  openTab.addEventListener('click', () => setPanelOpen(true));
  closeTab.addEventListener('click', () => setPanelOpen(false));
  backdrop.addEventListener('click', () => setPanelOpen(false));

  // Close the panel when a store is selected, so the map (and its popup)
  // is actually visible - mirrors the "閉じる" tab, but automatic.
  collapseMobileSheet = () => setPanelOpen(false);
}

// Initialize everything
// Detect devices without WebGL, or with a major GPU performance caveat
// (typically a software/low-end renderer), and show a clear message
// instead of a blank map or a cryptic GL error (R066).
function showWebglFallback() {
  const mapEl = document.getElementById('map');
  mapEl.removeAttribute('aria-hidden'); // this message is real content, not decorative
  mapEl.innerHTML = `
    <div class="webgl-fallback">
      <p>${t('webglFallback1')}</p>
      <p>${t('webglFallback2')}</p>
    </div>
  `;
}

function init() {
  if (!mapboxgl.supported({ failIfMajorPerformanceCaveat: true })) {
    showWebglFallback();
    return;
  }
  initMap();
  initBrandFilters();
  initAmenityFilters();
  initUIEvents();
  updateStoreListImmediate(); // Immediate update on init
  updateStoreCount();
}

// Start the application
init();
