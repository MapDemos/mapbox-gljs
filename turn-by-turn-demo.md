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
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="nav-ui"></div>

  <div id="setup-panel">
    <h2>🧭 Turn-by-Turn Navigation</h2>
    <p>Enter your destination to start navigation. Your current location will be used as the starting point.</p>

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
      <button class="btn btn-secondary" onclick="useCurrentLocationAsDestination()">
        📍 Nearby Destination
      </button>
      <button class="btn btn-primary" onclick="startNavigation()">
        Start Navigation
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

    // Add navigation control
    map.addControl(new mapboxgl.NavigationControl());

    // Get user location
    map.on('load', () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            userLocation = {
              lng: position.coords.longitude,
              lat: position.coords.latitude
            };
            map.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 14 });
          },
          (error) => {
            console.warn('Could not get user location', error);
            // Use Tokyo as default
            userLocation = { lng: 139.7671, lat: 35.6812 };
          }
        );
      }
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
        alert('Please enter a destination');
        return;
      }

      if (!userLocation) {
        alert('Waiting for your location...');
        return;
      }

      try {
        // Parse destination
        const [lng, lat] = destInput.split(',').map(s => parseFloat(s.trim()));

        if (isNaN(lng) || isNaN(lat)) {
          alert('Invalid coordinates. Use format: longitude,latitude');
          return;
        }

        const destination = { lng, lat };

        // Hide setup panel
        document.getElementById('setup-panel').classList.add('hidden');

        // Show navigation UI
        navigationUI.show();

        // Start navigation
        await navigation.startNavigation(userLocation, destination);

      } catch (error) {
        console.error('Navigation error:', error);
        alert('Failed to start navigation: ' + error.message);
        document.getElementById('setup-panel').classList.remove('hidden');
      }
    }

    // Use nearby location as destination (for testing)
    function useCurrentLocationAsDestination() {
      if (!userLocation) {
        alert('Waiting for your location...');
        return;
      }

      // Add 0.01 degrees (~1km) to create a nearby destination
      const nearbyLng = userLocation.lng + 0.01;
      const nearbyLat = userLocation.lat + 0.01;

      document.getElementById('destination-input').value = `${nearbyLng},${nearbyLat}`;
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
