// Store data - fictional restaurants in Tokyo area
const storeData = {
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

// Brand icon URLs (locally hosted)
const brandIconURLs = {
  'ガスト': 'assets/brand-icons/gusto.png',
  'ジョナサン': 'assets/brand-icons/jonathan.png',
  'バーミヤン': 'assets/brand-icons/bamiyan.png',
  'しゃぶ葉': 'assets/brand-icons/shabuyo.png'
};

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

// Add hasParking property to all features
storeData.features = storeData.features.map(feature => ({
  ...feature,
  properties: {
    ...feature.properties,
    hasParking: feature.properties.amenities.includes('駐車場あり')
  }
}));

let filteredStores = storeData.features;

// Load brand icon image for map markers
function loadBrandIcon(brand) {
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

    img.onerror = () => reject(new Error(`Failed to load icon for ${brand}`));
    img.src = brandIconURLs[brand];
  });
}

// Initialize map
function initMap() {
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/standard',
    center: [139.7025, 35.6895], // Center on Tokyo
    zoom: 11,
    language: 'ja'
  });

  map.on('load', () => {
    // Add Japanese language support
    if (typeof MapboxLanguage !== 'undefined') {
      map.addControl(new MapboxLanguage({
        defaultLanguage: 'ja'
      }));
    }

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Load brand icons for map
    const brands = Object.keys(brandIconURLs);
    const imagePromises = brands.map(brand => {
      return loadBrandIcon(brand).then(imageData => {
        const imageId = `brand-${brand}`;
        map.addImage(imageId, imageData);
      });
    });

    // Wait for all images to load, then add layers
    Promise.all(imagePromises).then(() => {
      // Add store data source
      map.addSource('stores', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: filteredStores
        }
      });

      // Add symbol layer for stores
      map.addLayer({
        id: 'store-icons',
        type: 'symbol',
        source: 'stores',
        layout: {
          'icon-image': ['concat', 'brand-', ['get', 'brand']],
          'icon-size': 0.6,
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
          'text-offset': [1.5, -2.0],
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
          showPopup(feature);
        }
      });

      // Change cursor on hover
      map.on('mouseenter', 'store-icons', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'store-icons', () => {
        map.getCanvas().style.cursor = '';
      });

      // Update selection state
      updateSymbolState();
    });
  });
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
  } else {
    map.setPaintProperty('store-icons', 'icon-opacity', 1);
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

  return `
    <div class="popup-header">
      <h3>${props.name}</h3>
      <button class="popup-close" onclick="closePopup()">×</button>
    </div>
    <div class="popup-body">
      <div class="popup-section">
        <div class="popup-label">住所</div>
        <div class="popup-value">${props.address}</div>
      </div>
      <div class="popup-section">
        <div class="popup-label">営業時間</div>
        <div class="popup-value">
          平日: ${hours.weekday}<br>
          土日祝: ${hours.weekend}
        </div>
      </div>
      <div class="popup-section">
        <div class="popup-label">電話番号</div>
        <div class="popup-value">${props.phone}</div>
      </div>
      <div class="popup-section">
        <div class="popup-label">設備・サービス</div>
        <div class="popup-amenities">
          ${amenities.map(a => `<span class="amenity-tag">${a}</span>`).join('')}
        </div>
      </div>
    </div>
  `;
}

// Show popup
function showPopup(feature) {
  closePopup();

  currentPopup = new mapboxgl.Popup({
    offset: 25,
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
}

// Make closePopup available globally for the popup close button
window.closePopup = closePopup;

// Show details (placeholder function)
window.showDetails = function(storeId) {
  alert(`店舗詳細ページへ移動します (Store ID: ${storeId})`);
};

// Update markers on map
function updateMarkers() {
  if (!map.getSource('stores')) return;

  // Update GeoJSON data with filtered stores
  map.getSource('stores').setData({
    type: 'FeatureCollection',
    features: filteredStores
  });

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
    map.flyTo({
      center: feature.geometry.coordinates,
      zoom: 12,
      duration: 1000
    });
  }
}

// Initialize brand filters
function initBrandFilters() {
  const brands = [...new Set(storeData.features.map(f => f.properties.brand))];
  const brandFiltersContainer = document.getElementById('brand-filters');

  brands.forEach((brand, index) => {
    const button = document.createElement('button');
    button.className = 'brand-filter active';
    button.dataset.brand = brand;
    button.innerHTML = `
      <img src="${brandIconURLs[brand]}" class="brand-icon" alt="${brand}">
      <span class="brand-name">${brand}</span>
    `;

    button.addEventListener('click', () => {
      button.classList.toggle('active');
      applyFilters();
    });

    brandFiltersContainer.appendChild(button);
  });
}

// Apply filters
function applyFilters() {
  const searchText = document.getElementById('search-box').value.toLowerCase();
  const selectedBrands = Array.from(
    document.querySelectorAll('#brand-filters .brand-filter.active')
  ).map(btn => btn.dataset.brand);

  filteredStores = storeData.features.filter(feature => {
    const props = feature.properties;

    // Brand filter
    if (!selectedBrands.includes(props.brand)) {
      return false;
    }

    // Search filter
    if (searchText) {
      const searchableText = `${props.name} ${props.address} ${props.brand}`.toLowerCase();
      if (!searchableText.includes(searchText)) {
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
        hasParking: feature.properties.amenities.includes('駐車場あり')
      }
    };
  });

  updateStoreList();
  updateMarkers();
  updateStoreCount();
}

// Update store list
function updateStoreList() {
  const storeList = document.getElementById('store-list');
  storeList.innerHTML = '';

  filteredStores.forEach(feature => {
    const props = feature.properties;

    const storeItem = document.createElement('div');
    storeItem.className = 'store-item';
    storeItem.dataset.storeId = props.id;

    const hasParking = props.amenities.includes('駐車場あり');
    const parkingBadge = hasParking
      ? '<span style="background: #9C27B0; color: white; padding: 2px 5px; border-radius: 3px; font-size: 10px; font-weight: bold; margin-right: 4px;">P</span>'
      : '';

    storeItem.innerHTML = `
      <img src="${brandIconURLs[props.brand]}" class="store-brand-icon" alt="${props.brand}">
      <div class="store-info">
        <div class="store-name">${parkingBadge}${props.name}</div>
        <div class="store-address">${props.address}</div>
      </div>
    `;

    storeItem.addEventListener('click', () => {
      selectStore(props.id);
      showPopup(feature);
    });

    storeList.appendChild(storeItem);
  });
}

// Update store count
function updateStoreCount() {
  document.getElementById('store-count').textContent =
    `${filteredStores.length}件見つかりました`;
}

// Clear all filters
function clearFilters() {
  // Clear search box
  document.getElementById('search-box').value = '';

  // Check all brand filters
  document.querySelectorAll('#brand-filters .brand-filter').forEach(btn => {
    btn.classList.add('active');
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

// Initialize search with Geocoding API
function initSearch() {
  const searchBox = document.getElementById('search-box');
  const suggestionsContainer = document.getElementById('search-suggestions');

  // Function to get search suggestions using Geocoding API
  async function getSuggestions(query) {
    if (!query || query.length < 2) {
      suggestionsContainer.classList.remove('active');
      suggestionsContainer.innerHTML = '';
      return;
    }

    try {
      const center = map.getCenter();
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${mapboxgl.accessToken}&` +
        `country=JP&` +
        `language=ja&` +
        `proximity=${center.lng},${center.lat}&` +
        `limit=5&` +
        `autocomplete=true`
      );

      const data = await response.json();
      displaySuggestions(data.features);
    } catch (error) {
      console.error('Search error:', error);
      suggestionsContainer.innerHTML = '<div class="suggestion-item">エラーが発生しました</div>';
      suggestionsContainer.classList.add('active');
    }
  }

  // Function to display suggestions
  function displaySuggestions(features) {
    suggestionsContainer.innerHTML = '';

    if (!features || features.length === 0) {
      suggestionsContainer.innerHTML = '<div class="suggestion-item">結果が見つかりませんでした</div>';
      suggestionsContainer.classList.add('active');
      return;
    }

    features.forEach(feature => {
      const item = document.createElement('div');
      item.className = 'suggestion-item';

      const name = document.createElement('div');
      name.className = 'suggestion-name';
      name.textContent = feature.text;

      const address = document.createElement('div');
      address.className = 'suggestion-address';
      address.textContent = feature.place_name;

      item.appendChild(name);
      item.appendChild(address);

      // Handle click on suggestion
      item.addEventListener('click', () => {
        selectSuggestion(feature);
      });

      suggestionsContainer.appendChild(item);
    });

    suggestionsContainer.classList.add('active');
  }

  // Function to handle suggestion selection
  function selectSuggestion(feature) {
    const [lng, lat] = feature.center;

    // Update input with selected place name
    searchBox.value = feature.place_name;

    // Hide suggestions
    suggestionsContainer.classList.remove('active');
    suggestionsContainer.innerHTML = '';

    // Fly to the location
    map.flyTo({
      center: [lng, lat],
      zoom: 14,
      duration: 1000
    });
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
    const icon = brandFilterToggle.querySelector('.toggle-icon');
    icon.textContent = brandFilters.classList.contains('active') ? '▲' : '▼';
  });

  // Open brand filters by default
  brandFilters.classList.add('active');
  brandFilterToggle.querySelector('.toggle-icon').textContent = '▲';
}

// Initialize everything
function init() {
  initMap();
  initBrandFilters();
  initUIEvents();
  updateStoreList();
  updateStoreCount();
}

// Start the application
init();
