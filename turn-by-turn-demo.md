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
    }
    #setup-panel h2 {
      margin-top: 0;
      color: #333;
    }
    #setup-panel p {
      color: #666;
      line-height: 1.5;
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
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="nav-ui"></div>

  <div id="setup-panel">
    <h2>🧭 Turn-by-Turn Navigation</h2>
    <p>Enter your destination to start navigation. Your current location will be used as the starting point.</p>

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
      <label>Destination Coordinates</label>
      <input type="text" id="destination-input" placeholder="e.g., 139.7671,35.6812 (Tokyo Station)">
    </div>

    <div class="input-group">
      <label>Or use quick examples:</label>
      <select id="example-destinations" class="input-group input">
        <option value="">Select a destination...</option>
        <option value="139.7671,35.6812">Tokyo Station</option>
        <option value="-122.4194,37.7749">San Francisco</option>
        <option value="-0.1276,51.5074">London</option>
        <option value="2.3522,48.8566">Paris</option>
        <option value="-74.0060,40.7128">New York</option>
      </select>
    </div>

    <div class="button-group">
      <button class="btn btn-secondary" id="nearby-btn" onclick="useCurrentLocationAsDestination()" disabled>
        📍 Nearby Destination
      </button>
      <button class="btn btn-primary" id="start-btn" onclick="startNavigation()" disabled>
        ⏳ Waiting for location...
      </button>
    </div>
  </div>

  <script>
    {% include turn-by-turn-navigation.js %}
    {% include navigation-ui.js %}
  </script>

  <script>

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [139.7671, 35.6812], // Tokyo
      zoom: 12,
      pitch: 0
    });

    let navigation;
    let navigationUI;
    let userLocation = null;
    let userMarker = null;
    let locationAccuracy = null;

    // Add navigation control
    map.addControl(new mapboxgl.NavigationControl());

    // UI elements
    const statusContainer = document.getElementById('location-status');
    const statusIcon = document.getElementById('status-icon');
    const statusText = document.getElementById('status-text');
    const statusDetails = document.getElementById('status-details');
    const startBtn = document.getElementById('start-btn');
    const nearbyBtn = document.getElementById('nearby-btn');

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

      // Fly to user location
      map.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 15,
        duration: 2000
      });
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
      navigation = new TurnByTurnNavigation(map, {
        offRouteThreshold: 30,
        advanceInstructionDistance: 50,
        voiceEnabled: true,
        cameraFollowEnabled: true,
        profile: 'mapbox/driving-traffic',
        cameraPitch: 60,
        cameraZoom: 17
      });

      navigationUI = new NavigationUI('nav-ui', navigation);
      navigationUI.hide();
    });

    // Handle example selection
    document.getElementById('example-destinations').addEventListener('change', (e) => {
      if (e.target.value) {
        document.getElementById('destination-input').value = e.target.value;
      }
    });

    // Start navigation
    async function startNavigation() {
      const destInput = document.getElementById('destination-input').value.trim();

      if (!destInput) {
        updateLocationStatus('error', 'Destination required',
          'Please enter a destination or select from examples.<br>' +
          '<button class="btn-retry" onclick="document.getElementById(\'destination-input\').focus()">📍 Enter Destination</button>');
        return;
      }

      if (!userLocation) {
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

        // Remove user marker (navigation will handle it)
        if (userMarker) {
          userMarker.remove();
          userMarker = null;
        }

        // Remove accuracy circle
        if (map.getLayer('user-accuracy-circle')) {
          map.removeLayer('user-accuracy-circle');
          map.removeSource('user-accuracy');
        }

        // Hide setup panel
        document.getElementById('setup-panel').classList.add('hidden');

        // Show navigation UI
        navigationUI.show();

        // Start navigation
        await navigation.startNavigation(userLocation, destination);

      } catch (error) {
        console.error('Navigation error:', error);
        updateLocationStatus('error', 'Navigation failed',
          `<strong>Error:</strong> ${error.message}<br>` +
          'Please check your connection and try again.<br>' +
          '<button class="btn-retry" onclick="startNavigation()">🔄 Retry Navigation</button>');
        document.getElementById('setup-panel').classList.remove('hidden');
        navigationUI.hide();
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

      // Show feedback
      const destInput = document.getElementById('destination-input');
      destInput.style.borderColor = '#10b981';
      setTimeout(() => {
        destInput.style.borderColor = '';
      }, 1000);
    }

    // Allow clicking on map to set destination
    map.on('click', (e) => {
      const setupPanel = document.getElementById('setup-panel');
      if (!setupPanel.classList.contains('hidden')) {
        document.getElementById('destination-input').value =
          `${e.lngLat.lng.toFixed(6)},${e.lngLat.lat.toFixed(6)}`;
      }
    });
  </script>
</body>
</html>
