---
layout: default
title: Turn-by-Turn Navigation Demo
---

<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Turn-by-Turn Navigation Demo</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  {% include common_head.html %}
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }
    #map {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 100%;
    }
    .mapboxgl-ctrl-geocoder {
      min-width: 240px;
    }
    #nav-ui {
      pointer-events: none;
    }
    #nav-ui * {
      pointer-events: auto;
    }
    #setup-panel {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      z-index: 2000;
      max-width: 400px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }
    #setup-panel h2 {
      margin-top: 0;
      margin-bottom: 10px;
      color: #333;
      font-size: 24px;
    }
    #setup-panel p {
      color: #666;
      line-height: 1.5;
      font-size: 14px;
      margin-bottom: 15px;
    }
    .input-group {
      margin-bottom: 15px;
    }
    .input-group label {
      display: block;
      margin-bottom: 5px;
      color: #555;
      font-weight: 600;
      font-size: 14px;
    }
    .input-group input {
      width: 100%;
      padding: 10px;
      border: 2px solid #e5e7eb;
      border-radius: 6px;
      font-size: 14px;
      box-sizing: border-box;
    }
    .input-group input:focus {
      outline: none;
      border-color: #667eea;
    }
    .button-group {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }
    .btn {
      flex: 1;
      padding: 12px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }
    .btn-secondary:hover {
      background: #e5e7eb;
    }
    .hidden {
      display: none !important;
    }
    .location-status {
      background: #f9fafb;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
    }
    .location-status.loading {
      border-color: #3b82f6;
      background: #eff6ff;
    }
    .location-status.success {
      border-color: #10b981;
      background: #ecfdf5;
    }
    .location-status.error {
      border-color: #ef4444;
      background: #fef2f2;
    }
    .status-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }
    .status-icon {
      font-size: 24px;
      line-height: 1;
    }
    .status-icon.spinning {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .status-text {
      font-size: 16px;
      font-weight: 600;
      color: #374151;
      flex: 1;
    }
    .status-details {
      font-size: 13px;
      color: #6b7280;
      margin-top: 8px;
      line-height: 1.5;
    }
    .status-details strong {
      color: #374151;
    }
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none !important;
    }
    .btn-retry {
      margin-top: 10px;
      padding: 8px 16px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-retry:hover {
      background: #2563eb;
    }

    /* Map Picker Overlay */
    #map-picker-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1500;
      pointer-events: none;
    }
    #map-picker-overlay * {
      pointer-events: auto;
    }
    .map-picker-banner {
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px 30px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      gap: 20px;
      max-width: 90%;
    }
    .map-picker-text {
      flex: 1;
    }
    .map-picker-title {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 5px;
    }
    .map-picker-subtitle {
      font-size: 14px;
      opacity: 0.9;
    }
    .btn-close-picker {
      background: rgba(255,255,255,0.2);
      border: 2px solid white;
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
    }
    .btn-close-picker:hover {
      background: rgba(255,255,255,0.3);
    }

    /* Simulation Controls */
    #simulation-controls {
      position: absolute;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
    }
    .sim-panel {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      min-width: 280px;
    }
    .sim-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 15px;
      border-radius: 12px 12px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .sim-title {
      font-weight: 600;
      font-size: 14px;
    }
    .sim-close {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 14px;
      line-height: 1;
    }
    .sim-close:hover {
      background: rgba(255,255,255,0.3);
    }
    .sim-body {
      padding: 15px;
    }
    .sim-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 13px;
      color: #666;
    }
    .sim-controls-buttons {
      display: flex;
      gap: 8px;
    }
    .sim-btn {
      flex: 1;
      padding: 8px 12px;
      border: 2px solid #e5e7eb;
      background: white;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .sim-btn:hover {
      background: #f3f4f6;
      border-color: #667eea;
    }
    .sim-btn.active {
      background: #667eea;
      color: white;
      border-color: #667eea;
    }

    /* Mobile-specific styles */
    @media (max-width: 768px) {
      #setup-panel {
        padding: 15px;
        width: 95%;
        max-height: 85vh;
        border-radius: 8px;
      }
      #setup-panel h2 {
        font-size: 20px;
        margin-bottom: 8px;
      }
      #setup-panel p {
        font-size: 13px;
        margin-bottom: 10px;
        line-height: 1.4;
      }
      .intro-text {
        display: none; /* Hide intro text on mobile to save space */
      }
      .input-group {
        margin-bottom: 10px;
      }
      .input-group label {
        font-size: 12px;
        margin-bottom: 4px;
      }
      .input-group input,
      .input-group select {
        padding: 8px !important;
        font-size: 13px !important;
      }
      .input-group small {
        font-size: 11px !important;
      }
      .location-status {
        padding: 10px;
        margin-bottom: 10px;
      }
      .status-icon {
        font-size: 20px !important;
      }
      .status-text {
        font-size: 14px !important;
      }
      .status-details {
        font-size: 11px !important;
      }
      .button-group {
        gap: 8px;
        margin-top: 10px;
      }
      .btn {
        padding: 10px;
        font-size: 13px;
      }
      .btn-retry {
        padding: 6px 12px;
        font-size: 12px;
      }
      .map-picker-banner {
        padding: 15px 20px;
        gap: 15px;
        top: 10px;
      }
      .map-picker-title {
        font-size: 16px;
        margin-bottom: 3px;
      }
      .map-picker-subtitle {
        font-size: 12px;
      }
      .btn-close-picker {
        padding: 8px 16px;
        font-size: 13px;
      }
      #simulation-controls {
        bottom: 10px;
        right: 10px;
        left: 10px;
      }
      .sim-panel {
        min-width: unset;
      }
      .sim-btn {
        font-size: 11px;
        padding: 6px 8px;
      }
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="nav-ui"></div>

  <div id="setup-panel">
    <h2>🧭 Turn-by-Turn Navigation</h2>
    <p class="intro-text">Enter your destination to start navigation. Your current location will be used as the starting point.</p>

    <!-- Location Status -->
    <div class="location-status loading" id="location-status">
      <div class="status-header">
        <div class="status-icon spinning" id="status-icon">⟳</div>
        <div class="status-text" id="status-text">Getting your location...</div>
      </div>
      <div class="status-details" id="status-details">
        This may take a few seconds. Please allow location permissions if prompted.
      </div>
    </div>

    <div class="input-group">
      <label>Navigation Profile</label>
      <select id="profile-select" class="input-group input" style="width: 100%; padding: 10px; border: 2px solid #e5e7eb; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
        <option value="mapbox.tmp.valhalla-zenrin/driving-traffic">🚗 Driving (with traffic)</option>
        <option value="mapbox.tmp.valhalla-zenrin/walking">🚶 Walking</option>
        <option value="mapbox.tmp.valhalla-zenrin/cycling">🚴 Cycling</option>
      </select>
    </div>

    <div class="input-group">
      <label>Language / 言語</label>
      <select id="language-select" class="input-group input" style="width: 100%; padding: 10px; border: 2px solid #e5e7eb; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
        <option value="ja">🇯🇵 Japanese / 日本語</option>
        <option value="en">🇺🇸 English</option>
      </select>
    </div>

    <div class="input-group">
      <label>Destination Coordinates</label>
      <input type="text" id="destination-input" placeholder="e.g., 139.7671,35.6812 (Tokyo Station)">
    </div>

    <div class="button-group" style="margin-bottom: 15px;">
      <button class="btn btn-secondary" style="flex: 1;" onclick="openMapPicker()">
        🗺️ Pick on Map
      </button>
      <button class="btn btn-secondary" id="nearby-btn" onclick="useCurrentLocationAsDestination()" disabled>
        📍 Nearby
      </button>
    </div>

    <div class="input-group">
      <label>Or use quick examples:</label>
      <select id="example-destinations" class="input-group input" style="width: 100%; padding: 10px; border: 2px solid #e5e7eb; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
        <option value="">Select a destination...</option>
        <option value="139.7671,35.6812">Tokyo Station</option>
        <option value="-122.4194,37.7749">San Francisco</option>
        <option value="-0.1276,51.5074">London</option>
        <option value="2.3522,48.8566">Paris</option>
        <option value="-74.0060,40.7128">New York</option>
      </select>
    </div>

    <div class="input-group" style="display: flex; align-items: center; gap: 10px;">
      <input type="checkbox" id="simulation-mode" style="width: auto; margin: 0;">
      <label for="simulation-mode" style="margin: 0; cursor: pointer;">🎬 Use simulation mode (for testing)</label>
    </div>

    <div class="button-group">
      <button class="btn btn-primary" id="start-btn" onclick="startNavigation()" disabled style="width: 100%;">
        ⏳ Waiting for location...
      </button>
    </div>
  </div>

  <!-- Map Picker Overlay -->
  <div id="map-picker-overlay" class="hidden">
    <div class="map-picker-banner">
      <div class="map-picker-text">
        <div class="map-picker-title">📍 Tap anywhere on the map</div>
        <div class="map-picker-subtitle">Select your destination</div>
      </div>
      <button class="btn-close-picker" onclick="closeMapPicker()">✕ Cancel</button>
    </div>
  </div>

  <!-- Simulation Controls -->
  <div id="simulation-controls" class="hidden">
    <div class="sim-panel">
      <div class="sim-header">
        <span class="sim-title">🎬 Route Simulation</span>
        <button class="sim-close" onclick="stopSimulation()">✕</button>
      </div>
      <div class="sim-body">
        <div class="sim-info">
          <span id="sim-progress">0 / 0</span>
          <span id="sim-speed">Speed: 1x</span>
        </div>
        <div class="sim-controls-buttons">
          <button class="sim-btn" id="sim-play-pause" onclick="toggleSimulation()">▶️ Play</button>
          <button class="sim-btn" onclick="changeSimSpeed(-1)">🐢 Slower</button>
          <button class="sim-btn" onclick="changeSimSpeed(1)">🐰 Faster</button>
        </div>
      </div>
    </div>
  </div>

  <script>
    {% include turn-by-turn-navigation.js %}
    {% include navigation-ui.js %}
  </script>

  <script>

    const map = new mapboxgl.Map({
      container: 'map',
      //style: 'mapbox://styles/mapbox/streets-v12',
      center: [139.7671, 35.6812], // Tokyo
      zoom: 12,
      pitch: 0,
      language: 'ja'
    });

    let navigation;
    let navigationUI;
    let userLocation = null;
    let userMarker = null;
    let locationAccuracy = null;
    let destinationMarker = null;
    let isMapPickerMode = false;

    // Simulation variables
    let simulationMode = false;
    let simulationCoordinates = [];
    let simulationIndex = 0;
    let simulationInterval = null;
    let simulationSpeed = 1; // 1x speed
    let simulationPaused = false;

    // Add navigation control
    map.addControl(new mapboxgl.NavigationControl());

    // UI elements
    const statusContainer = document.getElementById('location-status');
    const statusIcon = document.getElementById('status-icon');
    const statusText = document.getElementById('status-text');
    const statusDetails = document.getElementById('status-details');
    const startBtn = document.getElementById('start-btn');
    const nearbyBtn = document.getElementById('nearby-btn');

    // Simulation functions
    function startSimulation(route) {
      simulationCoordinates = route.geometry.coordinates;
      simulationIndex = 0;
      simulationPaused = false;

      // Stop real GPS tracking to prevent conflicts
      if (navigation && navigation.watchId) {
        navigator.geolocation.clearWatch(navigation.watchId);
        navigation.watchId = null;
        console.log('🎬 Stopped real GPS tracking for simulation');
      }

      // Show simulation controls
      document.getElementById('simulation-controls').classList.remove('hidden');
      updateSimulationUI();

      console.log(`🎬 Starting simulation with ${simulationCoordinates.length} points`);

      // Start the simulation loop
      runSimulationStep();
    }

    function runSimulationStep() {
      if (simulationPaused || !simulationMode) return;

      if (simulationIndex >= simulationCoordinates.length) {
        console.log('🎬 Simulation complete');
        stopSimulation();
        return;
      }

      const coord = simulationCoordinates[simulationIndex];

      // Create fake position object
      const fakePosition = {
        coords: {
          longitude: coord[0],
          latitude: coord[1],
          accuracy: 10,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: simulationSpeed * 5 // Simulate speed based on multiplier
        },
        timestamp: Date.now()
      };

      // Inject into navigation system
      if (navigation && navigation._handleLocationUpdate) {
        navigation._handleLocationUpdate(fakePosition);
      }

      simulationIndex++;
      updateSimulationUI();

      // Schedule next step (base interval: 1000ms / speed)
      const interval = 1000 / simulationSpeed;
      simulationInterval = setTimeout(runSimulationStep, interval);
    }

    function toggleSimulation() {
      simulationPaused = !simulationPaused;
      const btn = document.getElementById('sim-play-pause');

      if (simulationPaused) {
        btn.textContent = '▶️ Play';
        btn.classList.remove('active');
      } else {
        btn.textContent = '⏸️ Pause';
        btn.classList.add('active');
        runSimulationStep();
      }
    }

    function changeSimSpeed(direction) {
      const speeds = [0.25, 0.5, 1, 2, 5, 10];
      let currentIndex = speeds.indexOf(simulationSpeed);

      if (direction > 0 && currentIndex < speeds.length - 1) {
        currentIndex++;
      } else if (direction < 0 && currentIndex > 0) {
        currentIndex--;
      }

      simulationSpeed = speeds[currentIndex];
      updateSimulationUI();
      console.log(`🎬 Simulation speed: ${simulationSpeed}x`);
    }

    function updateSimulationUI() {
      document.getElementById('sim-progress').textContent =
        `${simulationIndex} / ${simulationCoordinates.length}`;
      document.getElementById('sim-speed').textContent =
        `Speed: ${simulationSpeed}x`;
    }

    function stopSimulation() {
      simulationMode = false;
      simulationPaused = true;

      if (simulationInterval) {
        clearTimeout(simulationInterval);
        simulationInterval = null;
      }

      // Update navigation config
      if (navigation) {
        navigation.config.simulationMode = false;
      }

      document.getElementById('simulation-controls').classList.add('hidden');
      document.getElementById('simulation-mode').checked = false;

      console.log('🎬 Simulation stopped');
    }

    // Map picker functions
    function openMapPicker() {
      isMapPickerMode = true;
      document.getElementById('setup-panel').classList.add('hidden');
      document.getElementById('map-picker-overlay').classList.remove('hidden');
      console.log('📍 Map picker mode activated');
    }

    function closeMapPicker() {
      isMapPickerMode = false;
      document.getElementById('setup-panel').classList.remove('hidden');
      document.getElementById('map-picker-overlay').classList.add('hidden');
      console.log('📍 Map picker mode closed');
    }

    // Update location status UI
    function updateLocationStatus(state, message, details) {
      statusContainer.className = `location-status ${state}`;

      if (state === 'loading') {
        statusIcon.textContent = '⟳';
        statusIcon.className = 'status-icon spinning';
      } else if (state === 'success') {
        statusIcon.textContent = '✓';
        statusIcon.className = 'status-icon';
      } else if (state === 'error') {
        statusIcon.textContent = '⚠️';
        statusIcon.className = 'status-icon';
      }

      statusText.textContent = message;
      statusDetails.innerHTML = details;
    }

    // Get user location
    function getUserLocation() {
      updateLocationStatus('loading', 'Getting your location...',
        'This may take a few seconds. Please allow location permissions if prompted.');

      if (!navigator.geolocation) {
        handleLocationError(new Error('Geolocation not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        handleLocationSuccess,
        handleLocationError,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }

    // Handle successful location
    function handleLocationSuccess(position) {
      userLocation = {
        lng: position.coords.longitude,
        lat: position.coords.latitude
      };
      locationAccuracy = position.coords.accuracy;

      // Update status UI
      updateLocationStatus('success', 'Location confirmed',
        `<strong>Longitude:</strong> ${userLocation.lng.toFixed(6)}<br>
         <strong>Latitude:</strong> ${userLocation.lat.toFixed(6)}<br>
         <strong>Accuracy:</strong> ±${Math.round(locationAccuracy)} meters`);

      // Enable buttons
      startBtn.disabled = false;
      startBtn.textContent = 'Start Navigation';
      nearbyBtn.disabled = false;

      // Add user marker on map
      if (userMarker) {
        userMarker.remove();
      }
      userMarker = new mapboxgl.Marker({
        color: '#4264fb',
        scale: 1.2
      })
        .setLngLat([userLocation.lng, userLocation.lat])
        .setPopup(new mapboxgl.Popup().setHTML(
          `<strong>Your Location</strong><br>
           Accuracy: ±${Math.round(locationAccuracy)}m`
        ))
        .addTo(map);

      // Add accuracy circle
      if (map.getSource('user-accuracy')) {
        map.removeLayer('user-accuracy-circle');
        map.removeSource('user-accuracy');
      }

      map.addSource('user-accuracy', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [userLocation.lng, userLocation.lat]
          }
        }
      });

      map.addLayer({
        id: 'user-accuracy-circle',
        type: 'circle',
        source: 'user-accuracy',
        paint: {
          'circle-radius': {
            stops: [
              [0, 0],
              [20, locationAccuracy * 1.5]
            ],
            base: 2
          },
          'circle-color': '#4264fb',
          'circle-opacity': 0.15,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#4264fb',
          'circle-stroke-opacity': 0.3
        }
      });

      // Fly to user location (but allow user to interrupt)
      let userInterrupted = false;

      const stopCamera = () => {
        userInterrupted = true;
        map.stop(); // Stop the camera animation
      };

      // Listen for user interactions to interrupt camera
      map.once('mousedown', stopCamera);
      map.once('touchstart', stopCamera);
      map.once('wheel', stopCamera);
      map.once('dragstart', stopCamera);

      // Start the fly animation
      map.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 15,
        duration: 2000
      });

      // Clean up event listeners after animation completes
      setTimeout(() => {
        if (!userInterrupted) {
          map.off('mousedown', stopCamera);
          map.off('touchstart', stopCamera);
          map.off('wheel', stopCamera);
          map.off('dragstart', stopCamera);
        }
      }, 2000);
    }

    // Handle location error
    function handleLocationError(error) {
      let errorMsg = 'Location unavailable';
      let errorDetails = '';

      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorDetails = `<strong>Permission denied.</strong> Please:<br>
            • Allow location access in your browser<br>
            • Check browser settings<br>
            • Ensure location services are enabled`;
          break;
        case error.POSITION_UNAVAILABLE:
          errorDetails = `<strong>Position unavailable.</strong> Please:<br>
            • Check GPS signal<br>
            • Try moving to an open area<br>
            • Ensure location services are on`;
          break;
        case error.TIMEOUT:
          errorDetails = `<strong>Request timed out.</strong> Please:<br>
            • Check your GPS signal<br>
            • Try again in a moment`;
          break;
        default:
          errorDetails = `<strong>An error occurred:</strong> ${error.message}<br>
            <button class="btn-retry" onclick="getUserLocation()">🔄 Try Again</button>`;
      }

      updateLocationStatus('error', errorMsg, errorDetails +
        '<br><button class="btn-retry" onclick="getUserLocation()">🔄 Try Again</button>');

      // Disable buttons
      startBtn.disabled = true;
      startBtn.textContent = 'Location Required';
      nearbyBtn.disabled = true;

      console.error('Location error:', error);
    }

    // Initialize location on map load
    map.on('load', () => {
      getUserLocation();
    });

    // Initialize navigation when map loads
    map.on('load', () => {
      // Get selected profile and language from dropdowns
      const selectedProfile = document.getElementById('profile-select').value;
      const selectedLanguage = document.getElementById('language-select').value;

      navigation = new TurnByTurnNavigation(map, {
        advanceInstructionDistance: 50,
        voiceEnabled: true,
        cameraFollowEnabled: true,
        profile: selectedProfile,
        language: selectedLanguage,
        cameraPitch: 60,
        cameraZoom: 17
      });

      navigationUI = new NavigationUI('nav-ui', navigation);
      navigationUI.hide();
    });

    // Update navigation profile when user changes selection
    document.getElementById('profile-select').addEventListener('change', (e) => {
      if (navigation) {
        navigation.config.profile = e.target.value;
        console.log('📝 Navigation profile changed to:', e.target.value);
      }
    });

    // Update navigation language when user changes selection
    document.getElementById('language-select').addEventListener('change', (e) => {
      if (navigation) {
        navigation.config.language = e.target.value;
        console.log('📝 Navigation language changed to:', e.target.value);
      }
    });

    // Enable/disable start button based on simulation mode
    document.getElementById('simulation-mode').addEventListener('change', (e) => {
      if (e.target.checked) {
        // In simulation mode, location not required
        startBtn.disabled = false;
        startBtn.textContent = '🎬 Start Simulation';
        console.log('🎬 Simulation mode enabled - location not required');
      } else {
        // Normal mode, check if location is available
        if (userLocation) {
          startBtn.disabled = false;
          startBtn.textContent = 'Start Navigation';
        } else {
          startBtn.disabled = true;
          startBtn.textContent = '⏳ Waiting for location...';
        }
      }
    });

    // Handle example selection
    document.getElementById('example-destinations').addEventListener('change', (e) => {
      if (e.target.value) {
        const coords = e.target.value;
        document.getElementById('destination-input').value = coords;

        // Parse and show marker for example destination
        const [lng, lat] = coords.split(',').map(s => parseFloat(s.trim()));
        if (!isNaN(lng) && !isNaN(lat)) {
          // Remove previous destination marker if exists
          if (destinationMarker) {
            destinationMarker.remove();
          }

          // Add destination marker
          destinationMarker = new mapboxgl.Marker({
            color: '#ef4444',
            scale: 1.2
          })
            .setLngLat([lng, lat])
            .setPopup(new mapboxgl.Popup().setHTML(
              `<strong>${e.target.options[e.target.selectedIndex].text}</strong><br>
               ${lng.toFixed(6)}, ${lat.toFixed(6)}`
            ))
            .addTo(map);

          // Fly to destination
          map.flyTo({
            center: [lng, lat],
            zoom: 13,
            duration: 2000
          });
        }
      }
    });

    // Start navigation
    async function startNavigation() {
      const destInput = document.getElementById('destination-input').value.trim();
      const isSimulationMode = document.getElementById('simulation-mode').checked;

      if (!destInput) {
        updateLocationStatus('error', 'Destination required',
          'Please enter a destination or select from examples.<br>' +
          '<button class="btn-retry" onclick="document.getElementById(\'destination-input\').focus()">📍 Enter Destination</button>');
        return;
      }

      // In simulation mode, use map center as starting point if no location
      if (!userLocation && !isSimulationMode) {
        updateLocationStatus('error', 'Location not available',
          'Please wait for location to be obtained or try again.<br>' +
          '<button class="btn-retry" onclick="getUserLocation()">🔄 Retry Location</button>');
        return;
      }

      try {
        // Parse destination
        const [lng, lat] = destInput.split(',').map(s => parseFloat(s.trim()));

        if (isNaN(lng) || isNaN(lat)) {
          updateLocationStatus('error', 'Invalid coordinates',
            'Please use format: <strong>longitude,latitude</strong><br>' +
            'Example: 139.7671,35.6812<br>' +
            '<button class="btn-retry" onclick="document.getElementById(\'destination-input\').select()">✏️ Fix Input</button>');
          return;
        }

        const destination = { lng, lat };

        // Use map center as origin in simulation mode if no user location
        const origin = userLocation || { lng: map.getCenter().lng, lat: map.getCenter().lat };

        // Remove user marker (navigation will handle it)
        if (userMarker) {
          userMarker.remove();
          userMarker = null;
        }

        // Remove destination marker (navigation will handle it)
        if (destinationMarker) {
          destinationMarker.remove();
          destinationMarker = null;
        }

        // Remove accuracy circle
        if (map.getLayer('user-accuracy-circle')) {
          map.removeLayer('user-accuracy-circle');
          map.removeSource('user-accuracy');
        }

        // Check if simulation mode is enabled
        simulationMode = document.getElementById('simulation-mode').checked;

        // Update navigation config with simulation mode
        navigation.config.simulationMode = simulationMode;

        // Hide setup panel
        document.getElementById('setup-panel').classList.add('hidden');

        // Show navigation UI
        navigationUI.show();

        // Start navigation
        await navigation.startNavigation(origin, destination);

        // If simulation mode, start simulation with route
        if (simulationMode && navigation.state && navigation.state.currentRoute) {
          console.log('🎬 Simulation mode enabled - starting route replay');
          startSimulation(navigation.state.currentRoute);
        }

      } catch (error) {
        console.error('Navigation error:', error);
        updateLocationStatus('error', 'Navigation failed',
          `<strong>Error:</strong> ${error.message}<br>` +
          'Please check your connection and try again.<br>' +
          '<button class="btn-retry" onclick="startNavigation()">🔄 Retry Navigation</button>');
        document.getElementById('setup-panel').classList.remove('hidden');
        navigationUI.hide();
        stopSimulation();
      }
    }

    // Use nearby location as destination (for testing)
    function useCurrentLocationAsDestination() {
      if (!userLocation) {
        updateLocationStatus('error', 'Location not available',
          'Please wait for location to be obtained first.<br>' +
          '<button class="btn-retry" onclick="getUserLocation()">🔄 Get Location</button>');
        return;
      }

      // Add 0.01 degrees (~1km) to create a nearby destination
      const nearbyLng = userLocation.lng + 0.01;
      const nearbyLat = userLocation.lat + 0.01;

      document.getElementById('destination-input').value = `${nearbyLng.toFixed(6)},${nearbyLat.toFixed(6)}`;

      // Remove previous destination marker if exists
      if (destinationMarker) {
        destinationMarker.remove();
      }

      // Add destination marker
      destinationMarker = new mapboxgl.Marker({
        color: '#ef4444',
        scale: 1.2
      })
        .setLngLat([nearbyLng, nearbyLat])
        .setPopup(new mapboxgl.Popup().setHTML(
          `<strong>Nearby Destination</strong><br>
           ${nearbyLng.toFixed(6)}, ${nearbyLat.toFixed(6)}<br>
           <small>(~1km from your location)</small>`
        ))
        .addTo(map);

      // Show popup briefly
      destinationMarker.togglePopup();
      setTimeout(() => {
        if (destinationMarker.getPopup().isOpen()) {
          destinationMarker.togglePopup();
        }
      }, 2000);

      // Show feedback
      const destInput = document.getElementById('destination-input');
      destInput.style.borderColor = '#10b981';
      destInput.style.backgroundColor = '#ecfdf5';
      setTimeout(() => {
        destInput.style.borderColor = '';
        destInput.style.backgroundColor = '';
      }, 1000);
    }

    // Allow clicking on map to set destination
    map.on('click', (e) => {
      const setupPanel = document.getElementById('setup-panel');

      // Check if in map picker mode or if panel is visible
      if (isMapPickerMode || !setupPanel.classList.contains('hidden')) {
        const lng = e.lngLat.lng;
        const lat = e.lngLat.lat;

        // Update input field
        document.getElementById('destination-input').value = `${lng.toFixed(6)},${lat.toFixed(6)}`;

        // Remove previous destination marker if exists
        if (destinationMarker) {
          destinationMarker.remove();
        }

        // Add new destination marker
        destinationMarker = new mapboxgl.Marker({
          color: '#ef4444', // Red color for destination
          scale: 1.2
        })
          .setLngLat([lng, lat])
          .setPopup(new mapboxgl.Popup().setHTML(
            `<strong>Destination</strong><br>
             ${lng.toFixed(6)}, ${lat.toFixed(6)}`
          ))
          .addTo(map);

        console.log('📍 Destination set on map:', lng.toFixed(6), lat.toFixed(6));

        // If in map picker mode, show confirmation and close picker
        if (isMapPickerMode) {
          destinationMarker.togglePopup();
          setTimeout(() => {
            if (destinationMarker.getPopup().isOpen()) {
              destinationMarker.togglePopup();
            }
            closeMapPicker();
          }, 1500);
        } else {
          // Normal mode - show popup briefly
          destinationMarker.togglePopup();
          setTimeout(() => {
            if (destinationMarker.getPopup().isOpen()) {
              destinationMarker.togglePopup();
            }
          }, 2000);

          // Visual feedback on input field
          const destInput = document.getElementById('destination-input');
          destInput.style.borderColor = '#ef4444';
          destInput.style.backgroundColor = '#fef2f2';
          setTimeout(() => {
            destInput.style.borderColor = '';
            destInput.style.backgroundColor = '';
          }, 1000);
        }
      }
    });
  </script>
</body>
</html>
