---
layout: default
title: Indoor Airport Navigation
---

<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Indoor Airport Navigation with Floor Selector</title>
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

    /* Info panel */
    .info-panel {
      position: absolute;
      top: 20px;
      left: 20px;
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      max-width: 380px;
      z-index: 1;
    }

    .info-panel h2 {
      margin: 0 0 10px 0;
      font-size: 20px;
      color: #333;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .info-panel p {
      margin: 0 0 15px 0;
      font-size: 14px;
      color: #666;
      line-height: 1.5;
    }

    /* Airport selection */
    .airport-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 20px;
    }

    .airport-btn {
      padding: 12px;
      border: 2px solid #e5e7eb;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .airport-btn:hover {
      background: #f8f9fa;
      border-color: #3b82f6;
      transform: translateY(-2px);
    }

    .airport-btn.active {
      background: #eff6ff;
      border-color: #3b82f6;
      color: #3b82f6;
    }

    .airport-code {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: 1px;
    }

    .airport-name {
      font-size: 11px;
      color: #6b7280;
    }


    /* Airport info box */
    .airport-info {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 8px;
      padding: 12px;
      margin-top: 15px;
      font-size: 13px;
      display: none;
    }

    .airport-info.visible {
      display: block;
    }

    .airport-info-title {
      font-weight: 600;
      color: #0c4a6e;
      margin-bottom: 6px;
      font-size: 14px;
    }

    .airport-info-detail {
      color: #0369a1;
      line-height: 1.5;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      border-bottom: 1px solid #e0f2fe;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-label {
      font-weight: 500;
      color: #0c4a6e;
    }

    .info-value {
      color: #0369a1;
    }

    /* Feature highlight */
    .feature-info {
      position: absolute;
      bottom: 30px;
      left: 20px;
      background: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      max-width: 300px;
      display: none;
      z-index: 1;
    }

    .feature-info.visible {
      display: block;
    }

    .feature-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 6px;
      color: #333;
    }

    .feature-details {
      font-size: 12px;
      color: #666;
      line-height: 1.4;
    }

    /* Loading spinner */
    .loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: none;
      z-index: 1000;
    }

    .loading.visible {
      display: block;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* User location puck styling */
    .mapboxgl-user-location-dot {
      width: 15px !important;
      height: 15px !important;
      border: 3px solid #fff !important;
      background-color: #3b82f6 !important;
      box-shadow: 0 0 10px rgba(59, 130, 246, 0.4) !important;
    }

    .mapboxgl-user-location-dot::after {
      display: none !important;
    }

    .mapboxgl-user-location-accuracy-circle {
      background-color: rgba(59, 130, 246, 0.15) !important;
      border: 2px solid rgba(59, 130, 246, 0.3) !important;
    }

    .mapboxgl-user-heading-indicator {
      display: none !important;
    }

    /* Pulse animation for user location and button */
    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
      }
      70% {
        box-shadow: 0 0 0 20px rgba(59, 130, 246, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
      }
    }

    /* Special pulse animation for location button hint */
    @keyframes buttonPulse {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      }
      50% {
        transform: scale(1.1);
        box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
      }
    }

    .mapboxgl-user-location-dot {
      animation: pulse 2s infinite !important;
    }

    /* Manual location button */
    .location-button {
      position: absolute;
      bottom: 100px;
      right: 20px;
      background: white;
      border: 2px solid #3b82f6;
      border-radius: 50%;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      z-index: 1;
      font-size: 24px;
    }

    .location-button:hover {
      background: #eff6ff;
    }

    .location-button.active {
      background: #3b82f6;
      color: white;
    }

    /* Mobile responsive */
    @media (max-width: 640px) {
      .info-panel {
        left: 10px;
        right: 10px;
        max-width: none;
      }

      .airport-grid {
        grid-template-columns: 1fr;
      }

      .location-button {
        bottom: 80px;
        right: 10px;
      }
    }
  </style>
</head>
<body>
  <div id="map"></div>

  <div class="loading" id="loading">
    <div class="spinner"></div>
  </div>

  <!-- Info panel commented out
  <div class="info-panel">
    <h2>
      <span>✈️</span>
      Indoor Airport Navigation
    </h2>
    <p>Select an airport to explore its indoor mapping with floor-by-floor navigation.</p>

    <div class="airport-grid">
      <button class="airport-btn" onclick="flyToAirport('SFO')">
        <span class="airport-code">SFO</span>
        <span class="airport-name">San Francisco</span>
      </button>
      <button class="airport-btn" onclick="flyToAirport('LAX')">
        <span class="airport-code">LAX</span>
        <span class="airport-name">Los Angeles</span>
      </button>
      <button class="airport-btn" onclick="flyToAirport('HND')">
        <span class="airport-code">HND</span>
        <span class="airport-name">Tokyo Haneda</span>
      </button>
      <button class="airport-btn" onclick="flyToAirport('LHR')">
        <span class="airport-code">LHR</span>
        <span class="airport-name">London Heathrow</span>
      </button>
      <button class="airport-btn" onclick="flyToAirport('AMS')">
        <span class="airport-code">AMS</span>
        <span class="airport-name">Amsterdam</span>
      </button>
      <button class="airport-btn" onclick="flyToAirport('LAS')">
        <span class="airport-code">LAS</span>
        <span class="airport-name">Las Vegas</span>
      </button>
    </div>

    <div class="airport-info" id="airport-info">
      <div class="airport-info-title" id="airport-title">Airport Information</div>
      <div class="airport-info-detail">
        <div class="info-row">
          <span class="info-label">Terminal:</span>
          <span class="info-value" id="terminal-info">-</span>
        </div>
        <div class="info-row">
          <span class="info-label">Current Floor:</span>
          <span class="info-value" id="floor-info">Ground</span>
        </div>
        <div class="info-row">
          <span class="info-label">Available Floors:</span>
          <span class="info-value" id="floors-available">-</span>
        </div>
      </div>
    </div>
  </div>
  -->

  <div class="feature-info" id="feature-info">
    <div class="feature-title" id="feature-title">-</div>
    <div class="feature-details" id="feature-details">-</div>
  </div>

  <!-- Manual location button for mobile -->
  <button class="location-button" id="location-button" title="Show my location">
    📍
  </button>

  <script>
    mapboxgl.accessToken = "pk.eyJ1IjoibWFwYm94LW1hcC1kZXNpZ24iLCJhIjoiY2syeHpiaHlrMDJvODNidDR5azU5NWcwdiJ9.x0uSqSWGXdoFKuHZC5Eo_Q"
    // Airport configurations
    const airports = {
      SFO: {
        name: 'San Francisco International Airport',
        center: [-122.3816, 37.6193],
        zoom: 17,
        floors: [-1, 0, 1, 2, 3],
        terminals: ['Terminal 1', 'Terminal 2', 'Terminal 3', 'International']
      },
      LAX: {
        name: 'Los Angeles International Airport',
        center: [-118.4085, 33.9425],
        zoom: 16,
        floors: [0, 1, 2],
        terminals: ['Tom Bradley International', 'Terminal 1-8']
      },
      HND: {
        name: 'Tokyo Haneda Airport',
        center: [139.7853, 35.5494],
        zoom: 16,
        floors: [0, 1, 2, 3],
        terminals: ['Terminal 1', 'Terminal 2', 'Terminal 3 (International)']
      },
      LHR: {
        name: 'London Heathrow Airport',
        center: [-0.4543, 51.4700],
        zoom: 16,
        floors: [0, 1, 2],
        terminals: ['Terminal 2', 'Terminal 3', 'Terminal 4', 'Terminal 5']
      },
      AMS: {
        name: 'Amsterdam Airport Schiphol',
        center: [4.7639, 52.3086],
        zoom: 16,
        floors: [-1, 0, 1],
        terminals: ['Schiphol Plaza', 'Departures', 'Lounges']
      },
      LAS: {
        name: 'McCarran International Airport',
        center: [-115.1523, 36.0840],
        zoom: 16,
        floors: [0, 1, 2],
        terminals: ['Terminal 1', 'Terminal 3']
      }
    };

    // Initialize map with indoor-enabled style
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox-map-design/cmjd8dsg7003m01qw0snc8bmc', // Indoor-enabled style with tilesets
      center: [139.7853, 35.5494], // Default to HND
      zoom: 17,
      pitch: 45, // Slight pitch for 3D effect
      bearing: -17.6
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl());

    // Add geolocation control for user location
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
        timeout: 6000
      },
      trackUserLocation: true,
      showUserHeading: true,
      showUserLocation: true,
      showAccuracyCircle: true,
      fitBoundsOptions: {
        maxZoom: 18
      }
    });
    map.addControl(geolocateControl);

    // Current state
    let currentAirport = null;
    let currentFloor = 0;
    let availableFloors = [];
    let indoorFeatures = [];
    let userMarker = null;

    // Monitor floor changes from the built-in control
    function detectCurrentFloor() {
      // The built-in control manages floor selection
      // We can detect the current floor by querying visible features
      if (!map.getStyle()) return;

      const features = map.queryRenderedFeatures();
      const floors = new Set();

      features.forEach(f => {
        if (f.properties && f.properties.floor_level !== undefined) {
          floors.add(f.properties.floor_level);
        }
      });

      // Update floor info based on what's visible
      if (floors.size === 1) {
        currentFloor = Array.from(floors)[0];
        const floorName = currentFloor >= 0 ? `Floor ${currentFloor}` : `Basement ${Math.abs(currentFloor)}`;
        document.getElementById('floor-info').textContent = floorName;
      }
    }


    // Fly to selected airport
    function flyToAirport(code) {
      const airport = airports[code];
      if (!airport) return;

      currentAirport = code;

      // Update UI
      document.querySelectorAll('.airport-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      event.target.closest('.airport-btn').classList.add('active');

      // Show loading
      document.getElementById('loading').classList.add('visible');

      // Fly to airport
      map.flyTo({
        center: airport.center,
        zoom: airport.zoom,
        pitch: 45,
        bearing: -17.6,
        essential: true,
        duration: 2000
      });

      // Wait for movement to end
      map.once('moveend', () => {
        document.getElementById('loading').classList.remove('visible');

        // Update airport info
        document.getElementById('airport-title').textContent = airport.name;
        document.getElementById('terminal-info').textContent = airport.terminals[0];
        document.getElementById('floors-available').textContent =
          airport.floors.map(f => f >= 0 ? f : `B${Math.abs(f)}`).join(', ');
        document.getElementById('airport-info').classList.add('visible');

        // Store available floors for this airport
        availableFloors = airport.floors;

        // The built-in floor control will handle floor selection
        // We just monitor for changes
        detectCurrentFloor();
      });
    }

    // Handle map click for feature info
    map.on('click', (e) => {
      // Query features at click point
      const features = map.queryRenderedFeatures(e.point);

      // Look for indoor features
      const indoorFeature = features.find(f => {
        const props = f.properties;
        return props && (
          props.class ||
          props.type ||
          props.name ||
          props.facility_name
        );
      });

      if (indoorFeature) {
        const props = indoorFeature.properties;
        const name = props.name || props.facility_name || 'Indoor Feature';
        const type = props.class || props.type || 'Unknown';
        const floor = props.floor_level || props.level || currentFloor;

        // Show feature info
        document.getElementById('feature-title').textContent = name;
        document.getElementById('feature-details').innerHTML = `
          <strong>Type:</strong> ${type}<br>
          <strong>Floor:</strong> ${floor >= 0 ? floor : `B${Math.abs(floor)}`}
          ${props.facility_type ? `<br><strong>Facility:</strong> ${props.facility_type}` : ''}
        `;
        document.getElementById('feature-info').classList.add('visible');

        // Auto-hide after 5 seconds
        setTimeout(() => {
          document.getElementById('feature-info').classList.remove('visible');
        }, 5000);
      }
    });

    // Change cursor on hover over interactive features
    map.on('mousemove', (e) => {
      const features = map.queryRenderedFeatures(e.point);
      const hasIndoorFeature = features.some(f => {
        const props = f.properties;
        return props && (props.class || props.type || props.name);
      });

      map.getCanvas().style.cursor = hasIndoorFeature ? 'pointer' : '';
    });

    // Monitor for floor changes and update UI
    map.on('idle', () => {
      if (!currentAirport) return;

      // Detect current floor from visible features
      detectCurrentFloor();
    });

    // Function to programmatically request location permission
    async function requestLocationPermission() {
      try {
        // Check if Permissions API is available
        if ('permissions' in navigator) {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          console.log('Current permission state:', result.state);

          if (result.state === 'granted') {
            // Permission already granted, start tracking
            console.log('Location permission already granted');
            geolocateControl.trigger();
            return true;
          } else if (result.state === 'prompt') {
            // Need to request permission
            console.log('Location permission will be requested');
            // This will trigger the browser's permission prompt
            return new Promise((resolve) => {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  console.log('Location permission granted:', position.coords);
                  geolocateControl.trigger();
                  resolve(true);
                },
                (error) => {
                  console.error('Location permission denied or error:', error);
                  resolve(false);
                },
                {
                  enableHighAccuracy: true,
                  timeout: 10000,
                  maximumAge: 0
                }
              );
            });
          } else if (result.state === 'denied') {
            console.log('Location permission denied - user must enable in browser settings');
            return false;
          }

          // Listen for permission changes
          result.addEventListener('change', () => {
            console.log('Permission state changed to:', result.state);
            if (result.state === 'granted') {
              geolocateControl.trigger();
            }
          });
        } else {
          // Permissions API not available, try direct request
          console.log('Permissions API not available, trying direct request');
          return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                console.log('Location obtained:', position.coords);
                geolocateControl.trigger();
                resolve(true);
              },
              (error) => {
                console.error('Location error:', error);
                resolve(false);
              },
              {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
              }
            );
          });
        }
      } catch (error) {
        console.error('Error checking permissions:', error);
        return false;
      }
    }

    // Manual location button handler
    let isTrackingLocation = false;
    document.getElementById('location-button').addEventListener('click', async () => {
      if (!isTrackingLocation) {
        // Request location permission programmatically
        const granted = await requestLocationPermission();

        if (granted) {
          isTrackingLocation = true;
          document.getElementById('location-button').classList.add('active');
        } else {
          // Check permission state to provide appropriate message
          if ('permissions' in navigator) {
            const result = await navigator.permissions.query({ name: 'geolocation' });
            if (result.state === 'denied') {
              alert('Location access is blocked. Please enable it in your browser settings:\n\n' +
                    'Chrome Android: Tap the lock icon in address bar → Site settings → Location → Allow\n\n' +
                    'Or go to Chrome Settings → Site settings → Location');
            } else {
              alert('Unable to access location. Please check your device location settings.');
            }
          } else {
            alert('Unable to access location. Please enable location services and try again.');
          }
        }
      } else {
        // Stop tracking
        geolocateControl.trigger(); // This toggles the tracking
        isTrackingLocation = false;
        document.getElementById('location-button').classList.remove('active');
      }
    });

    // Update button state based on geolocate control state
    geolocateControl.on('trackuserlocationstart', () => {
      isTrackingLocation = true;
      document.getElementById('location-button').classList.add('active');
    });

    geolocateControl.on('trackuserlocationend', () => {
      isTrackingLocation = false;
      document.getElementById('location-button').classList.remove('active');
    });

    // Initialize with configurations on load
    map.on('load', () => {
      // For Japanese labels, we need to update the text fields
      // This style might have Japanese name fields available
      const style = map.getStyle();

      // Update all symbol layers to use Japanese labels where available
      style.layers.forEach(layer => {
        if (layer.type === 'symbol' && layer.layout && layer.layout['text-field']) {
          const layerId = layer.id;

          // Common patterns for label layers
          if (layerId.includes('label') || layerId.includes('name') || layerId.includes('text')) {
            try {
              // Try to use coalesce to fallback from Japanese to default name
              // This expression tries name:ja first, then name_ja, then falls back to name
              const japaneseTextField = [
                'coalesce',
                ['get', 'name:ja'],
                ['get', 'name_ja'],
                ['get', 'name']
              ];

              map.setLayoutProperty(layerId, 'text-field', japaneseTextField);
            } catch (e) {
              // Some layers might not support this modification
              console.log(`Could not update layer ${layerId}:`, e.message);
            }
          }
        }
      });

      // Try to lower indoor zoom threshold if the style supports it
      try {
        // This style might use different config properties
        map.setConfigProperty('basemap', 'indoorMapZoomThreshold', 14);
      } catch (e) {
        // Config might not be supported
        console.log('Could not set indoor zoom threshold:', e.message);
      }

      // Check location permission status on load
      checkAndRequestLocationPermission();
    });

    // Function to check permission and optionally auto-enable location
    async function checkAndRequestLocationPermission() {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      try {
        if ('permissions' in navigator) {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          console.log('Initial permission state:', result.state);

          if (result.state === 'granted') {
            // Permission already granted, auto-enable location
            setTimeout(() => {
              geolocateControl.trigger();
              console.log('Auto-enabling location (permission already granted)');
              document.getElementById('location-button').classList.add('active');
              isTrackingLocation = true;
            }, 1000);
          } else if (result.state === 'prompt') {
            if (!isMobile) {
              // On desktop, auto-request permission
              setTimeout(() => {
                console.log('Desktop: Auto-requesting location permission');
                requestLocationPermission();
              }, 1500);
            } else {
              // On mobile, show a hint to the user
              console.log('Mobile: User needs to tap location button');
              // Flash the location button to draw attention
              setTimeout(() => {
                const btn = document.getElementById('location-button');
                btn.style.animation = 'buttonPulse 2s ease-in-out 3';
                // Animation will stop automatically after 3 iterations (6 seconds)
                btn.addEventListener('animationend', () => {
                  btn.style.animation = '';
                }, { once: true });
              }, 2000);
            }
          } else if (result.state === 'denied') {
            console.log('Location permission is denied');
            // Could show a non-intrusive message about enabling location
          }
        } else {
          // Permissions API not available
          if (!isMobile) {
            // Try to auto-enable on desktop
            setTimeout(() => {
              geolocateControl.trigger();
              console.log('Desktop: Attempting to enable location');
            }, 1000);
          }
        }
      } catch (error) {
        console.error('Error checking initial permissions:', error);
      }

    }

    // Handle geolocation events
    geolocateControl.on('geolocate', (e) => {
      console.log('User location:', e.coords.latitude, e.coords.longitude);
      console.log('Accuracy:', e.coords.accuracy, 'meters');

      // Check if user is near any of our airports
      const userLng = e.coords.longitude;
      const userLat = e.coords.latitude;

      // Check proximity to airports (within ~5km)
      for (const [code, airport] of Object.entries(airports)) {
        const distance = getDistance(
          [userLng, userLat],
          airport.center
        );

        if (distance < 5) { // Within 5km
          console.log(`User is near ${code} airport`);
          // Could auto-select the nearby airport
          // flyToAirport(code);
          break;
        }
      }
    });

    // Handle geolocation errors
    geolocateControl.on('error', (error) => {
      console.error('Geolocation error:', error);
      if (error.code === 1) {
        console.log('Location permission denied. Please enable location access for this site.');
        alert('Location permission denied. Please enable location access in your browser settings.');
      } else if (error.code === 2) {
        console.log('Position unavailable');
        alert('Unable to retrieve your location. Please check your device settings.');
      } else if (error.code === 3) {
        console.log('Timeout getting location');
        alert('Timeout getting location. Please try again.');
      }
    });

    // Log when tracking starts
    geolocateControl.on('trackuserlocationstart', () => {
      console.log('Started tracking user location');
    });

    // Log when tracking ends
    geolocateControl.on('trackuserlocationend', () => {
      console.log('Stopped tracking user location');
    });

    // Calculate distance between two points in km
    function getDistance(coord1, coord2) {
      const R = 6371; // Earth's radius in km
      const dLat = toRad(coord2[1] - coord1[1]);
      const dLon = toRad(coord2[0] - coord1[0]);
      const lat1 = toRad(coord1[1]);
      const lat2 = toRad(coord2[1]);

      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }

    function toRad(deg) {
      return deg * (Math.PI/180);
    }
  </script>
</body>
</html>