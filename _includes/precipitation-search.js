// Initial location (Tokyo)
lat = 35.681236;
lng = 139.767125;

// Define precipitation tilesets
const tilesets = {
    nowcast: {
        value: 'mapbox://mapbox.weather-jp-nowcast',
        label: 'Current Precipitation',
        colorscale: 'Rain'
    },
    nowcast_last60min: {
        value: 'mapbox://mapbox.weather-jp-nowcast-last-60m',
        label: 'Past 60 Minutes',
        colorscale: 'Rain'
    },
    rain_6: {
        value: 'mapbox://mapbox.weather-jp-rain-1-6',
        label: '1-6 Hour Forecast',
        colorscale: 'Rain'
    },
    rain_15: {
        value: 'mapbox://mapbox.weather-jp-rain-7-15',
        label: '7-15 Hour Forecast',
        colorscale: 'Rain'
    }
};

// Global state
let map;
let unifiedBands = [];
let currentBandIndex = 0;
let nowBandIndex = 0; // Band index closest to current time
let allTilesetData = {};
let isPlaying = false;
let playInterval = null;
let userLocationMarker = null;
let userCoordinates = null;
let suggestionMarkers = [];
let selectedMarker = null;
let sessionToken = null;

// Generate UUIDv4 for session token
function generateSessionToken() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Clear all suggestion markers from the map
function clearSuggestionMarkers() {
    suggestionMarkers.forEach(marker => marker.remove());
    suggestionMarkers = [];

    // Also clear selected marker if any
    if (selectedMarker) {
        selectedMarker.remove();
        selectedMarker = null;
    }
}

// Highlight marker for a specific suggestion
function highlightMarkerForSuggestion(mapboxId) {
    const marker = suggestionMarkers.find(m => m.suggestionData?.mapbox_id === mapboxId);
    if (marker) {
        marker.getElement().classList.add('highlighted');
    }
}

// Remove highlight from marker
function unhighlightMarkerForSuggestion(mapboxId) {
    const marker = suggestionMarkers.find(m => m.suggestionData?.mapbox_id === mapboxId);
    if (marker) {
        marker.getElement().classList.remove('highlighted');
    }
}

// Create color scale for precipitation
function createRainColorScale() {
    const domain = [2, 10, 20, 30, 40, 50, 60, 70, 80];
    const colors = [
        'rgba(102, 255, 255, 0.7)',
        'rgba(0, 204, 255, 0.7)',
        'rgba(51, 102, 255, 0.7)',
        'rgba(51, 255, 0, 0.7)',
        'rgba(255, 255, 0, 0.7)',
        'rgba(255, 153, 0, 0.7)',
        'rgba(255, 0, 0, 0.7)',
        'rgba(183, 0, 16, 0.7)',
        'rgba(183, 0, 16, 0.9)'
    ];

    return ['step', ['raster-value'], 'rgba(0, 0, 0, 0)', ...domain.flatMap((d, i) => [d, colors[i]])];
}

// Convert band timestamp to JST date/time
function formatBandTime(band) {
    // Validate input
    if (band === undefined || band === null || isNaN(band)) {
        console.error('Invalid band value:', band);
        return { date: 'Invalid', time: '--:--' };
    }

    // Band is a Unix timestamp in seconds
    const utcDate = new Date(band * 1000);

    // Check if date is valid
    if (isNaN(utcDate.getTime())) {
        console.error('Invalid date calculated from band:', band);
        return { date: 'Invalid', time: '--:--' };
    }

    try {
        // Convert to JST by creating a date string with timezone
        const formatter = new Intl.DateTimeFormat('ja-JP', {
            timeZone: 'Asia/Tokyo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        const parts = formatter.formatToParts(utcDate);
        const year = parts.find(p => p.type === 'year').value;
        const month = parts.find(p => p.type === 'month').value;
        const day = parts.find(p => p.type === 'day').value;
        const hour = parts.find(p => p.type === 'hour').value;
        const minute = parts.find(p => p.type === 'minute').value;

        return {
            date: `${year}/${month}/${day}`,
            time: `${hour}:${minute}`
        };
    } catch (error) {
        console.error('Error formatting date:', error);
        return { date: 'Error', time: '--:--' };
    }
}

// Load all precipitation tilesets
async function loadAllTilesets() {
    console.log('Loading all tilesets...');

    const promises = Object.entries(tilesets).map(async ([id, config]) => {
        const tilesetId = config.value.split('/').pop();
        const tilejsonUrl = `https://api.mapbox.com/v4/${tilesetId}.json?access_token=${mapboxgl.accessToken}`;

        try {
            const response = await fetch(tilejsonUrl);
            const tilejson = await response.json();
            allTilesetData[id] = tilejson;
            return { id, tilejson };
        } catch (error) {
            console.error(`Error loading ${id}:`, error);
            return null;
        }
    });

    const results = await Promise.all(promises);

    // Build unified band list
    unifiedBands = [];
    let globalIndex = 0;

    results.forEach(result => {
        if (!result || !result.tilejson) return;

        const { id, tilejson } = result;
        const layer = tilejson.raster_layers?.[0];

        if (layer && layer.fields.bands) {
            layer.fields.bands.forEach((band, bandIndex) => {
                unifiedBands.push({
                    tilesetId: id,
                    band: band,
                    timestamp: band,
                    localIndex: bandIndex,
                    globalIndex: globalIndex++,
                    layer: layer.fields.name,
                    colorRange: layer.fields.range
                });
            });
        }
    });

    // Sort by timestamp
    unifiedBands.sort((a, b) => a.timestamp - b.timestamp);

    // Re-index after sorting
    unifiedBands.forEach((item, idx) => {
        item.globalIndex = idx;
    });

    console.log(`Loaded ${unifiedBands.length} bands total`);

    // Find current time band (timestamps are Unix timestamps in seconds)
    const now = new Date();
    const nowValue = Math.floor(now.getTime() / 1000);

    let minDiff = Infinity;
    unifiedBands.forEach((item, idx) => {
        const diff = Math.abs(item.timestamp - nowValue);
        if (diff < minDiff) {
            minDiff = diff;
            nowBandIndex = idx;
        }
    });

    currentBandIndex = nowBandIndex; // Start at current time

    console.log(`Current band index: ${currentBandIndex}, time: ${formatBandTime(unifiedBands[currentBandIndex].band).time}`);

    return unifiedBands[0]; // Return first band info
}

// Update time display
function updateTimeDisplay(index) {
    const band = unifiedBands[index];
    if (!band) return;

    const { date, time } = formatBandTime(band.band);

    // Determine if this is past, current, or forecast
    let suffix = '';
    if (index === nowBandIndex) {
        suffix = ' （現在）';
    } else if (index > nowBandIndex) {
        suffix = ' （予報）';
    }
    // Past times have no suffix

    document.getElementById('active-date').textContent = date;
    document.getElementById('active-time').textContent = time + suffix;
}

// Track current active layer
let currentActiveLayer = null;

// Initialize all precipitation layers upfront
function initializePrecipitationLayers() {
    // Create a layer for each tileset
    Object.entries(tilesets).forEach(([tilesetId, config]) => {
        const sourceId = `precipitation-source-${tilesetId}`;
        const layerId = `precipitation-layer-${tilesetId}`;

        // Add source
        map.addSource(sourceId, {
            type: 'raster-array',
            url: config.value
        });

        // Get layer info from first band of this tileset
        const firstBandOfTileset = unifiedBands.find(b => b.tilesetId === tilesetId);
        if (!firstBandOfTileset) return;

        // Add layer with initial opacity 0
        map.addLayer({
            id: layerId,
            type: 'raster',
            source: sourceId,
            'source-layer': firstBandOfTileset.layer,
            paint: {
                'raster-color-range': firstBandOfTileset.colorRange,
                'raster-color': createRainColorScale(),
                'raster-resampling': 'nearest',
                'raster-color-range-transition': { duration: 0 },
                'raster-opacity': 0, // Start invisible
                'raster-array-band': firstBandOfTileset.band,
                'raster-emissive-strength': 1.0,
                'raster-fade-duration': 0
            }
        }, 'road-label');
    });

    console.log('Initialized all precipitation layers');
}

// Change to a specific band
function changeBand(index) {
    if (!unifiedBands.length) return;

    currentBandIndex = parseInt(index);
    const bandInfo = unifiedBands[currentBandIndex];

    // Validate bandInfo
    if (!bandInfo) {
        console.error('Invalid band index:', index);
        return;
    }

    // Validate tilesetId
    if (!tilesets[bandInfo.tilesetId]) {
        console.error('Invalid tilesetId:', bandInfo.tilesetId, 'Available:', Object.keys(tilesets));
        return;
    }

    updateTimeDisplay(currentBandIndex);

    const targetLayerId = `precipitation-layer-${bandInfo.tilesetId}`;

    // If switching to a different tileset layer
    if (currentActiveLayer && currentActiveLayer !== targetLayerId) {
        // Hide the old layer
        map.setPaintProperty(currentActiveLayer, 'raster-opacity', 0);
    }

    // Show the target layer and set its band
    map.setPaintProperty(targetLayerId, 'raster-opacity', 0.8);
    map.setPaintProperty(targetLayerId, 'raster-array-band', bandInfo.band);

    currentActiveLayer = targetLayerId;
}

// Playback controls
function previousFrame() {
    if (currentBandIndex > 0) {
        document.getElementById('slider').value = currentBandIndex - 1;
        changeBand(currentBandIndex - 1);
    }
}

function nextFrame() {
    if (currentBandIndex < unifiedBands.length - 1) {
        document.getElementById('slider').value = currentBandIndex + 1;
        changeBand(currentBandIndex + 1);
    }
}

function togglePlay() {
    const playBtn = document.getElementById('play-pause');
    const playIcon = document.getElementById('play-icon');

    if (isPlaying) {
        isPlaying = false;
        playBtn.classList.remove('playing');
        playIcon.textContent = '▶';
        if (playInterval) {
            clearInterval(playInterval);
            playInterval = null;
        }
    } else {
        isPlaying = true;
        playBtn.classList.add('playing');
        playIcon.textContent = '⏸';
        playInterval = setInterval(() => {
            if (currentBandIndex < unifiedBands.length - 1) {
                nextFrame();
            } else {
                currentBandIndex = -1;
                nextFrame();
            }
        }, 1000);
    }
}

// Calculate zone boundaries
function calculateZoneBoundaries() {
    // Find the last nowcast band index (nowcast and nowcast_last60min)
    let lastNowcastIndex = -1;
    for (let i = unifiedBands.length - 1; i >= 0; i--) {
        const tilesetId = unifiedBands[i].tilesetId;
        if (tilesetId === 'nowcast' || tilesetId === 'nowcast_last60min') {
            lastNowcastIndex = i;
            break;
        }
    }

    const totalBands = unifiedBands.length;
    const nowcastPercent = lastNowcastIndex >= 0 ? ((lastNowcastIndex + 1) / totalBands) * 100 : 0;
    const forecastPercent = 100 - nowcastPercent;

    return {
        nowcastEnd: lastNowcastIndex,
        nowcastPercent,
        forecastPercent
    };
}

// Generate zone backgrounds and labels
function generateZoneBackgrounds() {
    const container = document.querySelector('.timeline-container');
    if (!container || !unifiedBands.length) return;

    // Remove existing zones
    const existingZones = container.querySelector('.timeline-zones');
    if (existingZones) existingZones.remove();

    const existingBoundary = container.querySelector('.zone-boundary');
    if (existingBoundary) existingBoundary.remove();

    const existingLabels = container.querySelectorAll('.zone-label');
    existingLabels.forEach(label => label.remove());

    const zones = calculateZoneBoundaries();
    const slider = document.getElementById('slider');
    const sliderRect = slider.getBoundingClientRect();
    const thumbWidth = window.innerWidth <= 768 ? 24 : 20;
    const trackWidth = sliderRect.width;
    const offsetPercent = (thumbWidth / 2 / trackWidth) * 100;

    // Create zones container
    const zonesDiv = document.createElement('div');
    zonesDiv.className = 'timeline-zones';

    // Nowcast zone
    const nowcastZone = document.createElement('div');
    nowcastZone.className = 'timeline-zone nowcast';
    nowcastZone.style.width = zones.nowcastPercent + '%';
    zonesDiv.appendChild(nowcastZone);

    // Forecast zone
    const forecastZone = document.createElement('div');
    forecastZone.className = 'timeline-zone forecast';
    forecastZone.style.width = zones.forecastPercent + '%';
    zonesDiv.appendChild(forecastZone);

    container.insertBefore(zonesDiv, slider);

    // Add boundary line at transition
    if (zones.nowcastEnd >= 0 && zones.nowcastEnd < unifiedBands.length - 1) {
        const boundaryIndex = zones.nowcastEnd + 0.5; // Between nowcast and forecast
        const rawPosition = (boundaryIndex / (unifiedBands.length - 1)) * 100;
        const position = offsetPercent + (rawPosition * (100 - 2 * offsetPercent) / 100);

        const boundary = document.createElement('div');
        boundary.className = 'zone-boundary';
        boundary.style.left = position + '%';
        container.appendChild(boundary);
    }

    // Add zone labels
    if (zones.nowcastPercent > 5) {
        const nowcastCenter = zones.nowcastPercent / 2;
        const nowcastLabel = document.createElement('div');
        nowcastLabel.className = 'zone-label';
        nowcastLabel.textContent = '5分間隔';
        nowcastLabel.style.left = nowcastCenter + '%';
        container.appendChild(nowcastLabel);
    }

    if (zones.forecastPercent > 5) {
        const forecastCenter = zones.nowcastPercent + (zones.forecastPercent / 2);
        const forecastLabel = document.createElement('div');
        forecastLabel.className = 'zone-label';
        forecastLabel.textContent = '1時間間隔';
        forecastLabel.style.left = forecastCenter + '%';
        container.appendChild(forecastLabel);
    }
}

// Generate timeline tick marks and labels
function generateTimelineTicks() {
    const ticksContainer = document.getElementById('timeline-ticks');
    const slider = document.getElementById('slider');
    if (!ticksContainer || !slider || !unifiedBands.length) return;

    ticksContainer.innerHTML = '';
    const totalBands = unifiedBands.length;
    const zones = calculateZoneBoundaries();

    // Get slider dimensions to account for thumb offset
    const sliderRect = slider.getBoundingClientRect();
    // Detect thumb width based on screen size (mobile has larger thumbs)
    const thumbWidth = window.innerWidth <= 768 ? 24 : 20;
    const trackWidth = sliderRect.width;
    const offsetPercent = (thumbWidth / 2 / trackWidth) * 100;

    // Determine tick interval (show tick every N bands)
    const minorTickInterval = Math.max(1, Math.floor(totalBands / 40)); // ~40 minor ticks
    const majorTickInterval = Math.max(5, Math.floor(totalBands / 8));  // ~8 major ticks with labels

    for (let i = 0; i < totalBands; i++) {
        const isMajor = i % majorTickInterval === 0 || i === totalBands - 1;
        const isMinor = i % minorTickInterval === 0;

        if (!isMajor && !isMinor) continue;

        // Calculate position accounting for thumb offset
        const rawPosition = (i / (totalBands - 1)) * 100;
        const position = offsetPercent + (rawPosition * (100 - 2 * offsetPercent) / 100);

        // Determine zone class
        const isNowcast = i <= zones.nowcastEnd;
        const zoneClass = isNowcast ? 'nowcast-zone' : 'forecast-zone';

        // Create tick mark
        const tick = document.createElement('div');
        tick.className = isMajor ? `timeline-tick major ${zoneClass}` : `timeline-tick ${zoneClass}`;
        tick.style.left = position + '%';
        tick.dataset.bandIndex = i;
        ticksContainer.appendChild(tick);

        // Add label for major ticks
        if (isMajor) {
            const band = unifiedBands[i];
            const { time } = formatBandTime(band.band);

            const label = document.createElement('div');
            label.className = 'timeline-label';
            label.textContent = time;
            label.style.left = position + '%';
            label.dataset.bandIndex = i;
            ticksContainer.appendChild(label);
        }
    }

    console.log(`Generated ticks with offset: ${offsetPercent.toFixed(2)}%, track width: ${trackWidth}px`);
}

// Initialize map
async function initMap() {
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/kenji-shima/cmfurpm8w00j101r86qp530c8',
        center: [lng, lat],
        zoom: 4,
        projection: 'mercator',
        language: 'ja'
    });

    map.on('load', async () => {
        console.log('Map loaded');

        // Load all tilesets
        await loadAllTilesets();

        // Initialize all precipitation layers
        initializePrecipitationLayers();

        // Set up slider
        const slider = document.getElementById('slider');
        slider.max = unifiedBands.length - 1;
        slider.value = currentBandIndex;

        // Generate zone backgrounds
        generateZoneBackgrounds();

        // Generate timeline ticks
        generateTimelineTicks();

        // Initialize display (show current band)
        changeBand(currentBandIndex);

        // Initialize user location
        initUserLocation();

        // Initialize search functionality
        initSearch();

        // Set up event listeners
        slider.addEventListener('input', (e) => changeBand(e.target.value));
        document.getElementById('prev-frame').addEventListener('click', previousFrame);
        document.getElementById('next-frame').addEventListener('click', nextFrame);
        document.getElementById('play-pause').addEventListener('click', togglePlay);

        // Legend toggle
        document.getElementById('legend-toggle').addEventListener('click', () => {
            const legend = document.getElementById('legend');
            const icon = document.getElementById('legend-toggle-icon');
            legend.classList.toggle('collapsed');
            icon.textContent = legend.classList.contains('collapsed') ? '+' : '−';
        });

        // Controls toggle
        document.getElementById('controls-toggle').addEventListener('click', () => {
            const controls = document.getElementById('time-controls');
            const icon = document.getElementById('controls-toggle-icon');
            controls.classList.toggle('collapsed');
            icon.textContent = controls.classList.contains('collapsed') ? '+' : '−';
        });

        console.log('Initialization complete');
    });
}

// Debounce function for resize events
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

// Get user's current location
function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = {
                    lng: position.coords.longitude,
                    lat: position.coords.latitude
                };
                resolve(coords);
            },
            (error) => {
                console.error('Error getting user location:', error);
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    });
}

// Add user location marker to map
function addUserLocationMarker(coordinates) {
    // Remove existing marker if any
    if (userLocationMarker) {
        userLocationMarker.remove();
    }

    // Create marker element
    const el = document.createElement('div');
    el.className = 'user-location-marker';
    el.title = 'Your Location';

    // Create and add marker
    userLocationMarker = new mapboxgl.Marker({
        element: el,
        anchor: 'center'
    })
        .setLngLat([coordinates.lng, coordinates.lat])
        .addTo(map);

    // Store coordinates
    userCoordinates = coordinates;

    console.log('User location marker added at:', coordinates);
}

// Initialize user location
async function initUserLocation() {
    try {
        const coords = await getUserLocation();
        console.log('User location obtained:', coords);

        // Add marker to map
        addUserLocationMarker(coords);

        // Optionally fly to user location
        map.flyTo({
            center: [coords.lng, coords.lat],
            zoom: 8,
            duration: 2000
        });
    } catch (error) {
        console.error('Could not get user location:', error.message);
        // Fallback to default Tokyo location
        console.log('Using default location (Tokyo)');
    }
}

// Get precipitation value at a specific coordinate using queryRasterValue
function getPrecipitationAtLocation(lng, lat) {
    return new Promise((resolve) => {
        try {
            // Get the current active band
            const bandInfo = unifiedBands[currentBandIndex];
            if (!bandInfo) {
                resolve(null);
                return;
            }

            const sourceId = `precipitation-source-${bandInfo.tilesetId}`;
            const sourceLayer = bandInfo.layer;

            // Query raster value at the coordinate
            const features = map.queryRasterValue(sourceId, [lng, lat], {
                sourceLayer: sourceLayer
            });

            if (features && features.length > 0) {
                const value = features[0];
                // The value should be the precipitation amount
                resolve(value);
            } else {
                resolve(null);
            }
        } catch (error) {
            console.error('Error querying raster value:', error);
            resolve(null);
        }
    });
}

// Format precipitation value for display
function formatPrecipitation(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return '降水なし';
    }
    if (value < 0.5) {
        return '降水なし';
    }
    return `降水量: ${value.toFixed(1)} mm/h`;
}

// Initialize search functionality
function initSearch() {
    try {
        const searchInput = document.getElementById('search-box');
        const searchResults = document.getElementById('search-results');

        // Generate initial session token
        sessionToken = generateSessionToken();
        console.log('Search session token:', sessionToken);

        // Debounce search input
        let searchTimeout;

        searchInput.addEventListener('input', async (e) => {
            const query = e.target.value.trim();

            // Clear previous timeout
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }

            // Hide results if query is empty
            if (query === '') {
                searchResults.classList.remove('visible');
                searchResults.innerHTML = '';
                clearSuggestionMarkers();
                return;
            }

            // Debounce search
            searchTimeout = setTimeout(async () => {
                await performSearch(query);
            }, 300);
        });

        // Note: Results will stay visible until user types again or selects a result
        // This allows users to click on the map or interact with markers without losing results

        console.log('Search initialized successfully');
    } catch (error) {
        console.error('Error initializing search:', error);
    }
}

// Perform search using SearchBox API /suggest endpoint
async function performSearch(query) {
    const searchResults = document.getElementById('search-results');

    try {
        // Clear previous suggestion markers
        clearSuggestionMarkers();

        // Build SearchBox API suggest URL
        const encodedQuery = encodeURIComponent(query);
        let url = `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodedQuery}&access_token=${mapboxgl.accessToken}&session_token=${sessionToken}&language=ja&country=JP&limit=10`;

        // Add proximity if user location is available
        if (userCoordinates) {
            url += `&proximity=${userCoordinates.lng},${userCoordinates.lat}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (!data.suggestions || data.suggestions.length === 0) {
            searchResults.innerHTML = '<div class="search-result-item">結果が見つかりませんでした</div>';
            searchResults.classList.add('visible');
            return;
        }

        // Display results
        searchResults.innerHTML = '';
        searchResults.classList.add('visible');

        // Process each suggestion
        for (const suggestion of data.suggestions) {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';

            // Create result HTML structure
            const nameDiv = document.createElement('div');
            nameDiv.className = 'result-name';
            nameDiv.textContent = suggestion.name || 'Unknown';

            const addressDiv = document.createElement('div');
            addressDiv.className = 'result-address';
            addressDiv.textContent = suggestion.place_formatted || '';

            const precipDiv = document.createElement('div');
            precipDiv.className = 'result-precipitation';
            precipDiv.textContent = '読み込み中...';

            resultItem.appendChild(nameDiv);
            resultItem.appendChild(addressDiv);
            resultItem.appendChild(precipDiv);

            // Store the suggestion data for retrieval
            resultItem.dataset.mapboxId = suggestion.mapbox_id;

            // Add click handler
            resultItem.addEventListener('click', async () => {
                await handleResultSelection(suggestion);
            });

            // Add hover handlers to highlight marker
            resultItem.addEventListener('mouseenter', () => {
                highlightMarkerForSuggestion(suggestion.mapbox_id);
            });

            resultItem.addEventListener('mouseleave', () => {
                unhighlightMarkerForSuggestion(suggestion.mapbox_id);
            });

            searchResults.appendChild(resultItem);

            // Retrieve full details to get coordinates, add marker, and query precipitation
            retrieveAndAddMarker(suggestion, precipDiv);
        }
    } catch (error) {
        console.error('Search error:', error);
        searchResults.innerHTML = '<div class="search-result-item">検索エラーが発生しました</div>';
        searchResults.classList.add('visible');
    }
}

// Retrieve feature details, add marker, and query precipitation
async function retrieveAndAddMarker(suggestion, precipDiv) {
    try {
        const url = `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.mapbox_id}?access_token=${mapboxgl.accessToken}&session_token=${sessionToken}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.features && data.features.length > 0) {
            const feature = data.features[0];
            const [lng, lat] = feature.geometry.coordinates;

            // Add marker for this suggestion
            const marker = new mapboxgl.Marker({ color: '#2196F3' })
                .setLngLat([lng, lat])
                .setPopup(
                    new mapboxgl.Popup({ offset: 25 })
                        .setHTML(`<strong>${suggestion.name}</strong><br>${suggestion.place_formatted || ''}`)
                )
                .addTo(map);

            // Store marker reference with suggestion data
            marker.suggestionData = suggestion;
            suggestionMarkers.push(marker);

            // Query precipitation value
            const value = await getPrecipitationAtLocation(lng, lat);
            precipDiv.textContent = formatPrecipitation(value);
        } else {
            precipDiv.textContent = '位置情報なし';
        }
    } catch (error) {
        console.error('Error retrieving feature:', error);
        precipDiv.textContent = 'エラー';
    }
}

// Handle search result selection
async function handleResultSelection(suggestion) {
    const searchInput = document.getElementById('search-box');
    const searchResults = document.getElementById('search-results');

    // Hide results
    searchResults.classList.remove('visible');

    // Update search input
    searchInput.value = suggestion.name || '';

    // Find the marker for this suggestion
    const marker = suggestionMarkers.find(m => m.suggestionData?.mapbox_id === suggestion.mapbox_id);

    if (marker) {
        // Remove previous selected marker if any
        if (selectedMarker && selectedMarker !== marker) {
            selectedMarker.remove();
        }

        // Create a highlighted marker at the same location
        const lngLat = marker.getLngLat();

        // Remove the blue marker
        marker.remove();

        // Add orange/red selected marker
        selectedMarker = new mapboxgl.Marker({ color: '#FF5722' })
            .setLngLat(lngLat)
            .setPopup(
                new mapboxgl.Popup({ offset: 25 })
                    .setHTML(`<strong>${suggestion.name}</strong><br>${suggestion.place_formatted || ''}`)
            )
            .addTo(map);

        // Fly to location
        map.flyTo({
            center: lngLat,
            zoom: 12,
            duration: 1500
        });

        // Show popup
        selectedMarker.togglePopup();

        // Generate new session token after selection (session ends after retrieve)
        sessionToken = generateSessionToken();
        console.log('New session token generated after selection:', sessionToken);
    } else {
        console.error('Marker not found for suggestion:', suggestion.name);
    }
}

// Handle window resize
const handleResize = debounce(() => {
    if (unifiedBands.length > 0) {
        generateZoneBackgrounds();
        generateTimelineTicks();
        console.log('Zones and ticks regenerated for new screen size');
    }
}, 250);

// Add resize listener
window.addEventListener('resize', handleResize);

// Start the app
initMap();
