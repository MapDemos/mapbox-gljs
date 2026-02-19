---
layout: default
title: Return to Route Demo
---

<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Return to Route - Navigation Deviation & Recovery</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  {% include common_head.html %}
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }

    #map {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 100%;
    }

    .control-panel {
      position: absolute;
      top: 20px;
      left: 20px;
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      width: 320px;
      z-index: 1;
    }

    .control-panel h2 {
      margin: 0 0 15px 0;
      font-size: 18px;
      color: #333;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .mode-section {
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #e5e7eb;
    }

    .mode-section button {
      width: 100%;
      padding: 10px;
      margin-bottom: 8px;
      border: 2px solid #e5e7eb;
      background: white;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .mode-section button:hover {
      background: #f8f9fa;
      border-color: #3b82f6;
    }

    .mode-section button.active {
      background: #3b82f6;
      color: white;
      border-color: #3b82f6;
    }

    .routing-method {
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #e5e7eb;
    }

    .routing-method h3 {
      font-size: 14px;
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .routing-method label {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      margin-bottom: 6px;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }

    .routing-method label:hover {
      background: #f8f9fa;
      border-color: #3b82f6;
    }

    .routing-method input[type="radio"]:checked + span {
      font-weight: 600;
      color: #3b82f6;
    }

    .action-buttons {
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #e5e7eb;
    }

    .btn {
      width: 100%;
      padding: 12px;
      margin-bottom: 8px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
    }

    .btn-primary:hover {
      background: #2563eb;
    }

    .btn-primary:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn-danger:hover {
      background: #dc2626;
    }

    .status {
      font-size: 13px;
    }

    .status-item {
      display: flex;
      justify-content: space-between;
      padding: 8px;
      background: #f8f9fa;
      border-radius: 6px;
      margin-bottom: 6px;
    }

    .status-label {
      color: #6b7280;
      font-weight: 500;
    }

    .status-value {
      color: #374151;
      font-weight: 600;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 11px;
    }

    .status-value.not-set {
      color: #9ca3af;
      font-style: italic;
    }

    .legend {
      position: absolute;
      bottom: 30px;
      right: 20px;
      background: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      font-size: 12px;
      z-index: 1;
    }

    .legend h3 {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    .legend-item:last-child {
      margin-bottom: 0;
    }

    .legend-color {
      width: 24px;
      height: 3px;
      border-radius: 2px;
    }

    .legend-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }

    .instructions {
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 2;
      display: none;
    }

    .instructions.active {
      display: block;
    }

    .marker-start {
      background: #10b981;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      cursor: pointer;
    }

    .marker-end {
      background: #ef4444;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      cursor: pointer;
    }

    .marker-driver {
      background: #f97316;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      cursor: pointer;
    }

    .spinner {
      display: inline-block;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Mobile responsive */
    @media (max-width: 640px) {
      .control-panel {
        left: 10px;
        right: 10px;
        width: auto;
      }
      .legend {
        bottom: 10px;
        right: 10px;
        font-size: 11px;
      }
    }
  </style>
</head>
<body>
  <div id="map"></div>

  <div class="instructions" id="instructions">
    Click on the map to set points
  </div>

  <div class="control-panel">
    <h2>
      <span>🗺️</span>
      Return to Route Demo
    </h2>

    <div class="mode-section">
      <button id="select-points" class="active" onclick="setMode('points')">
        📍 Select Start/End Points
      </button>
      <button id="select-deviation" onclick="setMode('deviation')">
        ↗️ Select Deviation & Driver Position
      </button>
    </div>

    <div class="routing-method">
      <h3>Routing Method</h3>
      <label>
        <input type="radio" name="routing" value="directions" checked>
        <span>Mapbox Directions API</span>
      </label>
      <label>
        <input type="radio" name="routing" value="matching">
        <span>OSRM + Map Matching API</span>
      </label>
    </div>

    <div class="action-buttons">
      <button id="generate-route" class="btn btn-primary" onclick="generateMainRoute()" disabled>
        🛣️ Generate Main Route
      </button>
      <button id="create-deviation" class="btn btn-primary" onclick="createDeviationRoutes()" disabled>
        ↪️ Create Deviation Routes
      </button>
      <button id="clear-deviation" class="btn btn-secondary" onclick="clearDeviation()">
        ↩️ Clear Deviation
      </button>
      <button id="clear-all" class="btn btn-danger" onclick="clearAll()">
        🗑️ Clear All
      </button>
    </div>

    <div class="status">
      <div class="status-item">
        <span class="status-label">Start:</span>
        <span id="start-coords" class="status-value not-set">Not set</span>
      </div>
      <div class="status-item">
        <span class="status-label">End:</span>
        <span id="end-coords" class="status-value not-set">Not set</span>
      </div>
      <div class="status-item">
        <span class="status-label">Intersections:</span>
        <span id="intersection-count" class="status-value">0</span>
      </div>
      <div class="status-item">
        <span class="status-label">Deviation Start:</span>
        <span id="deviation-start-coords" class="status-value not-set">Not set</span>
      </div>
      <div class="status-item">
        <span class="status-label">Driver Position:</span>
        <span id="driver-coords" class="status-value not-set">Not set</span>
      </div>
    </div>
  </div>

  <div class="legend">
    <h3>Legend</h3>
    <div class="legend-item">
      <div class="legend-color" style="background: #3B82F6"></div>
      <span>Main Route</span>
    </div>
    <div class="legend-item">
      <div class="legend-color" style="background: #9333EA"></div>
      <span>Deviation Route</span>
    </div>
    <div class="legend-item">
      <div class="legend-color" style="background: #F97316"></div>
      <span>Return Route</span>
    </div>
    <div class="legend-item">
      <div class="legend-dot" style="background: #EC4899"></div>
      <span>Entry Only</span>
    </div>
    <div class="legend-item">
      <div class="legend-dot" style="background: #9333EA"></div>
      <span>Exit Only</span>
    </div>
    <div class="legend-item">
      <div class="legend-dot" style="background: #92400E"></div>
      <span>Entry & Exit</span>
    </div>
    <div class="legend-item">
      <div class="legend-dot" style="background: #F97316; border: 3px solid #FFF; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
      <span>Driver Position</span>
    </div>
  </div>

  <script>
    // Initialize Mapbox - token is set in common_head.html

    // Initialize the map
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [144.9631, -37.8136], // Melbourne, Australia
      zoom: 12
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl());

    // Application state
    let currentMode = 'points'; // 'points' or 'deviation'
    let startPoint = null;
    let endPoint = null;
    let deviationStartPoint = null; // Click point for finding deviation start
    let driverPosition = null; // Orange point where driver currently is
    let startMarker = null;
    let endMarker = null;
    let driverMarker = null;
    let mainRoute = null;
    let entryOnlyIntersections = []; // Where drivers can only enter
    let exitOnlyIntersections = []; // Where drivers can only exit
    let dualIntersections = []; // Where drivers can both enter and exit
    let nearestIntersection = null;
    let nextIntersection = null;

    // Initialize map sources and layers on load
    map.on('load', () => {
      // Main route source and layer
      map.addSource('main-route', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      map.addLayer({
        id: 'main-route-layer',
        type: 'line',
        source: 'main-route',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#3B82F6',
          'line-width': 5,
          'line-opacity': 0.8
        }
      });

      // Entry intersections source and layer (where drivers can enter)
      map.addSource('entry-intersections', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      map.addLayer({
        id: 'entry-intersections-layer',
        type: 'circle',
        source: 'entry-intersections',
        paint: {
          'circle-radius': 6,
          'circle-color': '#EC4899',  // Pink color
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 2,
          'circle-opacity': 0.8
        }
      });

      // Exit intersections source and layer (where drivers can exit)
      map.addSource('exit-intersections', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      map.addLayer({
        id: 'exit-intersections-layer',
        type: 'circle',
        source: 'exit-intersections',
        paint: {
          'circle-radius': 6,
          'circle-color': '#9333EA',  // Purple color
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 2,
          'circle-opacity': 0.8
        }
      });

      // Dual intersections source and layer (where drivers can both enter and exit)
      map.addSource('dual-intersections', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      map.addLayer({
        id: 'dual-intersections-layer',
        type: 'circle',
        source: 'dual-intersections',
        paint: {
          'circle-radius': 6,
          'circle-color': '#92400E',  // Brown color
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': 2,
          'circle-opacity': 0.8
        }
      });

      // Deviation route source and layer
      map.addSource('deviation-route', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      map.addLayer({
        id: 'deviation-route-layer',
        type: 'line',
        source: 'deviation-route',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#9333EA',
          'line-width': 4,
          'line-opacity': 0.8
        }
      });

      // Return route source and layer
      map.addSource('return-route', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      map.addLayer({
        id: 'return-route-layer',
        type: 'line',
        source: 'return-route',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#F97316',
          'line-width': 4,
          'line-opacity': 0.8,
          'line-dasharray': [2, 1]
        }
      });

      // Highlight intersection layer
      map.addSource('highlight-intersection', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      map.addLayer({
        id: 'highlight-intersection-layer',
        type: 'circle',
        source: 'highlight-intersection',
        paint: {
          'circle-radius': 10,
          'circle-color': '#FBBF24',
          'circle-stroke-color': '#F59E0B',
          'circle-stroke-width': 3,
          'circle-opacity': 0.9
        }
      });
    });

    // Map click handler
    map.on('click', (e) => {
      const coords = [e.lngLat.lng, e.lngLat.lat];

      if (currentMode === 'points') {
        handlePointSelection(coords);
      } else if (currentMode === 'deviation') {
        handleDeviationSelection(coords);
      }
    });

    // Handle start/end point selection
    function handlePointSelection(coords) {
      if (!startPoint) {
        // Set start point
        startPoint = coords;
        if (startMarker) startMarker.remove();

        const el = document.createElement('div');
        el.className = 'marker-start';
        startMarker = new mapboxgl.Marker(el)
          .setLngLat(coords)
          .addTo(map);

        document.getElementById('start-coords').textContent =
          `${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`;
        document.getElementById('start-coords').classList.remove('not-set');

        showInstruction('Now click to set the end point');
      } else if (!endPoint) {
        // Set end point
        endPoint = coords;
        if (endMarker) endMarker.remove();

        const el = document.createElement('div');
        el.className = 'marker-end';
        endMarker = new mapboxgl.Marker(el)
          .setLngLat(coords)
          .addTo(map);

        document.getElementById('end-coords').textContent =
          `${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`;
        document.getElementById('end-coords').classList.remove('not-set');

        // Enable generate route button
        document.getElementById('generate-route').disabled = false;
        hideInstruction();
      }
    }

    // Handle deviation point selection
    function handleDeviationSelection(coords) {
      if (!mainRoute) {
        showInstruction('Please generate a main route first');
        setTimeout(hideInstruction, 2000);
        return;
      }

      if (!deviationStartPoint) {
        // First click: Set deviation start point (just store coords, no marker)
        deviationStartPoint = coords;

        // Find nearest intersection to this deviation start point
        findNearestIntersection(coords);

        // Show the nearest intersection coords in the UI
        if (nearestIntersection) {
          document.getElementById('deviation-start-coords').textContent =
            `${nearestIntersection.location[1].toFixed(4)}, ${nearestIntersection.location[0].toFixed(4)}`;
          document.getElementById('deviation-start-coords').classList.remove('not-set');
        }

        showInstruction('Now click to set the driver\'s current position');
      } else if (!driverPosition) {
        // Second click: Set driver's current position (orange)
        driverPosition = coords;
        if (driverMarker) driverMarker.remove();

        const el = document.createElement('div');
        el.className = 'marker-driver';
        driverMarker = new mapboxgl.Marker(el)
          .setLngLat(coords)
          .addTo(map);

        document.getElementById('driver-coords').textContent =
          `${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}`;
        document.getElementById('driver-coords').classList.remove('not-set');

        // Enable create deviation button
        document.getElementById('create-deviation').disabled = false;
        hideInstruction();
      }
    }

    // Set application mode
    function setMode(mode) {
      currentMode = mode;

      // Update button states
      document.getElementById('select-points').classList.toggle('active', mode === 'points');
      document.getElementById('select-deviation').classList.toggle('active', mode === 'deviation');

      // Show appropriate instruction
      if (mode === 'points') {
        if (!startPoint) {
          showInstruction('Click on the map to set the start point');
        } else if (!endPoint) {
          showInstruction('Click on the map to set the end point');
        } else {
          hideInstruction();
        }
      } else if (mode === 'deviation') {
        if (mainRoute) {
          if (!deviationStartPoint) {
            showInstruction('Click on the route to set where the deviation started');
          } else if (!driverPosition) {
            showInstruction('Click to set the driver\'s current position');
          } else {
            hideInstruction();
          }
        } else {
          showInstruction('Please generate a main route first');
        }
      }
    }

    // Generate main route
    async function generateMainRoute() {
      if (!startPoint || !endPoint) {
        alert('Please set both start and end points');
        return;
      }

      const routingMethod = document.querySelector('input[name="routing"]:checked').value;
      const btn = document.getElementById('generate-route');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner">⟳</span> Generating route...';

      try {
        if (routingMethod === 'directions') {
          await generateDirectionsRoute();
        } else {
          await generateMapMatchingRoute();
        }

        btn.innerHTML = '✅ Route Generated';
        setTimeout(() => {
          btn.innerHTML = '🛣️ Generate Main Route';
        }, 2000);
      } catch (error) {
        console.error('Error generating route:', error);
        btn.innerHTML = '❌ Error - Try Again';
        setTimeout(() => {
          btn.innerHTML = '🛣️ Generate Main Route';
          btn.disabled = false;
        }, 2000);
      }
    }

    // Generate route using Directions API
    async function generateDirectionsRoute() {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/` +
        `${startPoint[0]},${startPoint[1]};${endPoint[0]},${endPoint[1]}` +
        `?access_token=${mapboxgl.accessToken}` +
        `&geometries=geojson&overview=full&steps=true`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        mainRoute = data.routes[0];

        // Display main route
        map.getSource('main-route').setData({
          type: 'Feature',
          geometry: mainRoute.geometry
        });

        // Extract and display intersections
        extractIntersections(mainRoute);

        // Fit map to route bounds
        const bounds = new mapboxgl.LngLatBounds();
        mainRoute.geometry.coordinates.forEach(coord => {
          bounds.extend(coord);
        });
        map.fitBounds(bounds, { padding: 50 });
      }
    }

    // Generate route using Map Matching API (with OSRM)
    async function generateMapMatchingRoute() {
      // Create intermediate points for better matching
      const numIntermediatePoints = 8;
      const coordinates = [startPoint];

      // Generate intermediate points along a simple line
      for (let i = 1; i < numIntermediatePoints; i++) {
        const fraction = i / numIntermediatePoints;
        const lng = startPoint[0] + (endPoint[0] - startPoint[0]) * fraction;
        const lat = startPoint[1] + (endPoint[1] - startPoint[1]) * fraction;
        coordinates.push([lng, lat]);
      }
      coordinates.push(endPoint);

      const coordinatesString = coordinates.map(coord => coord.join(',')).join(';');
      const radiuses = coordinates.map(() => '25').join(';');
      const timestamps = coordinates.map((_, i) => Math.floor(Date.now() / 1000) + i * 60).join(';');

      // Map Matching API endpoint
      const url = `https://api.mapbox.com/matching/v5/mapbox/driving?access_token=${mapboxgl.accessToken}`;

      const formData = new URLSearchParams();
      formData.append('coordinates', coordinatesString);
      formData.append('geometries', 'geojson');
      formData.append('radiuses', radiuses);
      formData.append('timestamps', timestamps);
      formData.append('overview', 'full');
      formData.append('steps', 'true');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });

      const data = await response.json();

      // Log for debugging
      if (!response.ok) {
        console.error('Map Matching API error:', data);
        throw new Error(data.message || 'Map Matching failed');
      }

      if (data.matchings && data.matchings.length > 0) {
        // Convert matching to route format
        mainRoute = {
          geometry: data.matchings[0].geometry,
          legs: data.matchings[0].legs
        };

        // Display main route
        map.getSource('main-route').setData({
          type: 'Feature',
          geometry: mainRoute.geometry
        });

        // Extract and display intersections
        extractIntersections(mainRoute);

        // Fit map to route bounds
        const bounds = new mapboxgl.LngLatBounds();
        mainRoute.geometry.coordinates.forEach(coord => {
          bounds.extend(coord);
        });
        map.fitBounds(bounds, { padding: 50 });
      }
    }

    // Extract intersections from route
    function extractIntersections(route) {
      entryOnlyIntersections = [];
      exitOnlyIntersections = [];
      dualIntersections = [];

      const intersectionMap = new Map(); // Track intersections by location

      if (route.legs) {
        route.legs.forEach((leg, legIndex) => {
          if (leg.steps) {
            leg.steps.forEach((step, stepIndex) => {
              if (step.intersections) {
                step.intersections.forEach((intersection, intIndex) => {
                  if (intersection.entry) {
                    // Skip pure start/end points
                    const isStartEnd = step.maneuver &&
                      (step.maneuver.type === 'depart' || step.maneuver.type === 'arrive');

                    if (!isStartEnd) {
                      // Count entry points (where drivers can enter from other roads)
                      let canEnterFromOtherRoads = false;
                      let canExitToOtherRoads = false;

                      intersection.entry.forEach((canEnter, idx) => {
                        // Skip the direction we're going (out) and where we came from (in)
                        if (idx !== intersection.out && idx !== intersection.in && canEnter) {
                          // This is another road connected to this intersection
                          canEnterFromOtherRoads = true;
                          canExitToOtherRoads = true;
                        }
                      });

                      if (canEnterFromOtherRoads || canExitToOtherRoads) {
                        const locationKey = `${intersection.location[0]},${intersection.location[1]}`;
                        const intersectionData = {
                          location: intersection.location,
                          bearings: intersection.bearings,
                          entry: intersection.entry,
                          out: intersection.out,
                          in: intersection.in,
                          legIndex,
                          stepIndex,
                          intIndex,
                          canEnter: canEnterFromOtherRoads,
                          canExit: canExitToOtherRoads
                        };

                        // Store in map to avoid duplicates
                        if (!intersectionMap.has(locationKey)) {
                          intersectionMap.set(locationKey, intersectionData);
                        }
                      }
                    }
                  }
                });
              }
            });
          }
        });
      }

      // Categorize intersections
      intersectionMap.forEach(intersection => {
        if (intersection.canEnter && intersection.canExit) {
          dualIntersections.push(intersection);
        } else if (intersection.canEnter) {
          entryOnlyIntersections.push(intersection);
        } else if (intersection.canExit) {
          exitOnlyIntersections.push(intersection);
        }
      });

      // Display entry-only intersections (purple)
      const entryOnlyFeatures = entryOnlyIntersections.map(intersection => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: intersection.location
        },
        properties: intersection
      }));

      map.getSource('entry-intersections').setData({
        type: 'FeatureCollection',
        features: entryOnlyFeatures
      });

      // Display exit-only intersections (pink)
      const exitOnlyFeatures = exitOnlyIntersections.map(intersection => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: intersection.location
        },
        properties: intersection
      }));

      map.getSource('exit-intersections').setData({
        type: 'FeatureCollection',
        features: exitOnlyFeatures
      });

      // Display dual intersections (brown)
      const dualFeatures = dualIntersections.map(intersection => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: intersection.location
        },
        properties: intersection
      }));

      map.getSource('dual-intersections').setData({
        type: 'FeatureCollection',
        features: dualFeatures
      });

      // Update intersection count
      const totalIntersections = entryOnlyIntersections.length + exitOnlyIntersections.length + dualIntersections.length;
      document.getElementById('intersection-count').textContent = totalIntersections;
    }

    // Find nearest intersection to clicked point
    function findNearestIntersection(clickPoint) {
      // Get all intersections that can be exit points (exit-only and dual)
      const exitCapableIntersections = [...exitOnlyIntersections, ...dualIntersections];

      if (!mainRoute || exitCapableIntersections.length === 0) return;

      // Find nearest point on route line
      const routeLine = turf.lineString(mainRoute.geometry.coordinates);
      const clickPointFeature = turf.point(clickPoint);
      const nearestOnLine = turf.nearestPointOnLine(routeLine, clickPointFeature);

      // Find nearest exit-capable intersection
      let minDistance = Infinity;
      nearestIntersection = null;

      exitCapableIntersections.forEach(intersection => {
        const distance = turf.distance(
          turf.point(intersection.location),
          nearestOnLine
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestIntersection = intersection;
        }
      });

      if (nearestIntersection) {
        // Highlight nearest intersection
        map.getSource('highlight-intersection').setData({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: nearestIntersection.location
          }
        });

        // Find next intersection (using entry-capable intersections)
        const entryCapableIntersections = [...entryOnlyIntersections, ...dualIntersections];
        const routeLineForNext = turf.lineString(mainRoute.geometry.coordinates);
        const currentPointOnRoute = turf.nearestPointOnLine(routeLineForNext, turf.point(nearestIntersection.location));

        // Find entry intersections that are ahead on the route
        let minDistanceAhead = Infinity;
        nextIntersection = null;

        entryCapableIntersections.forEach(intersection => {
          const intersectionPointOnRoute = turf.nearestPointOnLine(routeLineForNext, turf.point(intersection.location));

          // Check if this intersection is ahead on the route
          if (intersectionPointOnRoute.properties.index > currentPointOnRoute.properties.index) {
            const distance = intersectionPointOnRoute.properties.index - currentPointOnRoute.properties.index;
            if (distance < minDistanceAhead) {
              minDistanceAhead = distance;
              nextIntersection = intersection;
            }
          }
        });

        // If no entry intersection found ahead, use end point
        if (!nextIntersection) {
          nextIntersection = { location: endPoint };
        }
      }
    }

    // Create deviation and return routes
    async function createDeviationRoutes() {
      if (!deviationStartPoint || !driverPosition || !nearestIntersection || !nextIntersection) {
        alert('Please select both deviation start and driver position');
        return;
      }

      const btn = document.getElementById('create-deviation');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner">⟳</span> Creating routes...';

      try {
        // Create deviation route (from intersection to driver position)
        await createDeviationRoute();

        // Create return route (from driver position back to next intersection, excluding original deviation point)
        await createReturnRoute();

        btn.innerHTML = '✅ Routes Created';
        setTimeout(() => {
          btn.innerHTML = '↪️ Create Deviation Routes';
        }, 2000);
      } catch (error) {
        console.error('Error creating deviation routes:', error);
        btn.innerHTML = '❌ Error - Try Again';
        setTimeout(() => {
          btn.innerHTML = '↪️ Create Deviation Routes';
          btn.disabled = false;
        }, 2000);
      }
    }

    // Create deviation route from intersection to driver position
    async function createDeviationRoute() {
      // Get all intersections along the main route except the selected deviation start
      const allMainRouteIntersections = [...entryOnlyIntersections, ...exitOnlyIntersections, ...dualIntersections];

      // Create exclude parameters for all main route intersections except the selected one
      const excludePoints = allMainRouteIntersections
        .filter(intersection =>
          intersection.location[0] !== nearestIntersection.location[0] ||
          intersection.location[1] !== nearestIntersection.location[1]
        )
        .map(intersection => `point(${intersection.location[0]} ${intersection.location[1]})`);

      let url = `https://api.mapbox.com/directions/v5/mapbox/driving/` +
        `${nearestIntersection.location[0]},${nearestIntersection.location[1]};` +
        `${driverPosition[0]},${driverPosition[1]}` +
        `?access_token=${mapboxgl.accessToken}` +
        `&geometries=geojson&overview=full`;

      // Add exclude parameters if there are any intersections to exclude
      if (excludePoints.length > 0) {
        // Mapbox Directions API has a limit on the exclude parameter length
        // We'll take the first 20 closest intersections to avoid if there are too many
        const limitedExcludes = excludePoints.slice(0, 20);
        url += `&exclude=${encodeURIComponent(limitedExcludes.join(','))}`;
        console.log(`Excluding ${limitedExcludes.length} intersections from deviation route`);
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        // Display deviation route
        map.getSource('deviation-route').setData({
          type: 'Feature',
          geometry: data.routes[0].geometry
        });
      }
    }

    // Create return route from driver position to next intersection
    async function createReturnRoute() {
      // First, get the deviation route coordinates from the purple line
      const deviationSource = map.getSource('deviation-route');
      let excludePoints = [];

      if (deviationSource && deviationSource._data && deviationSource._data.geometry) {
        const deviationCoords = deviationSource._data.geometry.coordinates;

        if (deviationCoords && deviationCoords.length > 0) {
          // Get only the last 5 points from the deviation route (near the driver's position)
          const last5 = deviationCoords.slice(Math.max(0, deviationCoords.length - 5));

          // Create exclude points only from the last portion of the deviation route
          excludePoints = last5.map(coord => `point(${coord[0]} ${coord[1]})`);

          console.log(`Excluding ${excludePoints.length} points from deviation route (last 5 points near driver)`);
        }
      }

      let url = `https://api.mapbox.com/directions/v5/mapbox/driving/` +
        `${driverPosition[0]},${driverPosition[1]};` +
        `${nextIntersection.location[0]},${nextIntersection.location[1]}` +
        `?access_token=${mapboxgl.accessToken}` +
        `&geometries=geojson&overview=full`;

      // Add exclude parameters if we have points to exclude
      if (excludePoints.length > 0) {
        url += `&exclude=${encodeURIComponent(excludePoints.join(','))}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        // Display return route
        map.getSource('return-route').setData({
          type: 'Feature',
          geometry: data.routes[0].geometry
        });
      } else {
        // If exclusion fails, try without it
        console.log('Exclusion failed, trying without exclude parameters');
        const fallbackUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/` +
          `${driverPosition[0]},${driverPosition[1]};` +
          `${nextIntersection.location[0]},${nextIntersection.location[1]}` +
          `?access_token=${mapboxgl.accessToken}` +
          `&geometries=geojson&overview=full`;

        const fallbackResponse = await fetch(fallbackUrl);
        const fallbackData = await fallbackResponse.json();

        if (fallbackData.routes && fallbackData.routes.length > 0) {
          map.getSource('return-route').setData({
            type: 'Feature',
            geometry: fallbackData.routes[0].geometry
          });
        }
      }
    }

    // Clear only deviation-related data
    function clearDeviation() {
      // Clear deviation points
      deviationStartPoint = null;
      driverPosition = null;
      nearestIntersection = null;
      nextIntersection = null;

      // Remove deviation markers (only driver marker now)
      if (driverMarker) driverMarker.remove();
      driverMarker = null;

      // Clear deviation-related map sources
      if (map.getSource('deviation-route')) {
        map.getSource('deviation-route').setData({
          type: 'FeatureCollection',
          features: []
        });
      }
      if (map.getSource('return-route')) {
        map.getSource('return-route').setData({
          type: 'FeatureCollection',
          features: []
        });
      }
      if (map.getSource('highlight-intersection')) {
        map.getSource('highlight-intersection').setData({
          type: 'FeatureCollection',
          features: []
        });
      }

      // Reset deviation UI
      document.getElementById('deviation-start-coords').textContent = 'Not set';
      document.getElementById('deviation-start-coords').classList.add('not-set');
      document.getElementById('driver-coords').textContent = 'Not set';
      document.getElementById('driver-coords').classList.add('not-set');

      // Disable create deviation button
      document.getElementById('create-deviation').disabled = true;

      // Keep the mode as deviation so user can immediately select new deviation points
      if (currentMode === 'deviation') {
        showInstruction('Click on the route to set where the deviation started');
      }
    }

    // Clear all data
    function clearAll() {
      // Clear points
      startPoint = null;
      endPoint = null;
      deviationStartPoint = null;
      driverPosition = null;
      nearestIntersection = null;
      nextIntersection = null;
      mainRoute = null;
      entryOnlyIntersections = [];
      exitOnlyIntersections = [];
      dualIntersections = [];

      // Remove markers
      if (startMarker) startMarker.remove();
      if (endMarker) endMarker.remove();
      if (driverMarker) driverMarker.remove();
      startMarker = null;
      endMarker = null;
      driverMarker = null;

      // Clear map sources
      if (map.getSource('main-route')) {
        map.getSource('main-route').setData({
          type: 'FeatureCollection',
          features: []
        });
      }
      if (map.getSource('entry-intersections')) {
        map.getSource('entry-intersections').setData({
          type: 'FeatureCollection',
          features: []
        });
      }
      if (map.getSource('exit-intersections')) {
        map.getSource('exit-intersections').setData({
          type: 'FeatureCollection',
          features: []
        });
      }
      if (map.getSource('dual-intersections')) {
        map.getSource('dual-intersections').setData({
          type: 'FeatureCollection',
          features: []
        });
      }
      if (map.getSource('deviation-route')) {
        map.getSource('deviation-route').setData({
          type: 'FeatureCollection',
          features: []
        });
      }
      if (map.getSource('return-route')) {
        map.getSource('return-route').setData({
          type: 'FeatureCollection',
          features: []
        });
      }
      if (map.getSource('highlight-intersection')) {
        map.getSource('highlight-intersection').setData({
          type: 'FeatureCollection',
          features: []
        });
      }

      // Reset UI
      document.getElementById('start-coords').textContent = 'Not set';
      document.getElementById('start-coords').classList.add('not-set');
      document.getElementById('end-coords').textContent = 'Not set';
      document.getElementById('end-coords').classList.add('not-set');
      document.getElementById('deviation-start-coords').textContent = 'Not set';
      document.getElementById('deviation-start-coords').classList.add('not-set');
      document.getElementById('driver-coords').textContent = 'Not set';
      document.getElementById('driver-coords').classList.add('not-set');
      document.getElementById('intersection-count').textContent = '0';

      document.getElementById('generate-route').disabled = true;
      document.getElementById('create-deviation').disabled = true;

      // Reset to points mode
      setMode('points');
    }

    // Show instruction message
    function showInstruction(text) {
      const instructions = document.getElementById('instructions');
      instructions.textContent = text;
      instructions.classList.add('active');
    }

    // Hide instruction message
    function hideInstruction() {
      const instructions = document.getElementById('instructions');
      instructions.classList.remove('active');
    }

    // Initialize with points mode
    setMode('points');
  </script>
</body>
</html>