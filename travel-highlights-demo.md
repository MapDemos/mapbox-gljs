---
layout: null
title: Travel Highlights 2024
---

<html>
<head>
  <meta charset="utf-8">
  <title>Travel Highlights 2024</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  {% include common_head.html %}
  <script src="https://unpkg.com/@turf/turf@6/turf.min.js"></script>
  <style>
    body {
      margin: 0;
      padding: 0;
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    /* Left menu panel */
    #left-menu {
      width: 300px;
      background: rgba(30, 30, 40, 0.95);
      backdrop-filter: blur(10px);
      display: flex;
      flex-direction: column;
      padding: 20px;
      box-shadow: 2px 0 20px rgba(0,0,0,0.3);
      overflow-y: auto;
      flex-shrink: 0;
    }

    #map {
      flex: 1;
      position: relative;
    }

    #left-menu h2 {
      color: white;
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 20px 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }

    #left-menu .menu-section {
      margin-bottom: 20px;
    }

    #left-menu .menu-section h3 {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 10px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }

    /* Destination label */
    #destination-label {
      position: absolute;
      top: 20px;
      left: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px 40px;
      border-radius: 12px;
      font-size: 32px;
      font-weight: 700;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.5s;
      pointer-events: none;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }

    #destination-label.show {
      opacity: 1;
    }

    .btn {
      width: 100%;
      padding: 12px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 10px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    /* Edit mode info in menu */
    #edit-mode-info {
      background: rgba(102, 126, 234, 0.15);
      padding: 12px;
      border-radius: 6px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.5;
      border-left: 3px solid #667eea;
    }

    /* Control point marker styles */
    .control-point-marker {
      width: 20px;
      height: 20px;
      background: white;
      border: 3px solid #667eea;
      border-radius: 50%;
      cursor: move;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      transition: all 0.2s;
    }

    .control-point-marker:hover {
      width: 24px;
      height: 24px;
      border-width: 4px;
      box-shadow: 0 3px 12px rgba(102, 126, 234, 0.5);
    }

    .control-point-marker.train {
      border-color: #ff0000;
    }

    .control-point-marker.plane {
      border-color: #ffffff;
    }

    .control-point-marker.car {
      border-color: #ff8800;
    }
  </style>
</head>
<body>
  <div id="left-menu">
    <h2>Travel Highlights</h2>

    <div class="menu-section">
      <h3>Controls</h3>
      <button id="start-btn" class="btn" onclick="saveAndStartTour()">Save & Start Tour</button>
      <button id="edit-btn" class="btn" onclick="enterEditMode()" style="display: none;">Edit Routes</button>
    </div>

    <div id="edit-mode-info" style="display: none;">
      Click on a route line to add control points. Right-click markers to delete them.
    </div>
  </div>
  <div id="map"></div>
  <div id="destination-label"></div>

  <script>
    // Asset helper function
    function asset(uri) {
      return `https://docs.mapbox.com/mapbox-gl-js/assets/${uri}`;
    }

    const airplaneModelUri = asset('airplane.glb');
    const trainModelUri = 'https://kenji-shima.github.io/resource-files/models/tram.glb';
    const carModelUri = asset('ego_car.glb');

    // Define your travel destinations in order
    // vehicle: 'plane' (default), 'train', or 'car'
    const destinations = [
      { name: 'Narita', coords: [140.3929, 35.7719], flag: '🇯🇵', vehicle: 'plane' },
      { name: 'San Francisco', coords: [-122.4194, 37.7749], flag: '🇺🇸', vehicle: 'plane' },
      { name: 'Phoenix', coords: [-112.0740, 33.4484], flag: '🇺🇸', vehicle: 'plane' },
      { name: 'Mexico City', coords: [-99.1332, 19.4326], flag: '🇲🇽', vehicle: 'plane' },
      { name: 'San Francisco', coords: [-122.4194, 37.7749], flag: '🇺🇸', vehicle: 'plane' },
      { name: 'Narita', coords: [140.3929, 35.7719], flag: '🇯🇵', vehicle: 'plane' },
      { name: 'Bangkok', coords: [100.5018, 13.7563], flag: '🇹🇭', vehicle: 'plane' },
      { name: 'Haneda', coords: [139.7798, 35.5494], flag: '🇯🇵', vehicle: 'plane' },
      { name: 'Hanoi', coords: [105.8542, 21.0285], flag: '🇻🇳', vehicle: 'car' },
      { name: 'Ha Long', coords: [107.0843, 20.9101], flag: '🇻🇳', vehicle: 'car' },
      { name: 'Hanoi', coords: [105.8542, 21.0285], flag: '🇻🇳', vehicle: 'car' },
      { name: 'Da Nang', coords: [108.2022, 16.0544], flag: '🇻🇳', vehicle: 'plane' },
      { name: 'Saigon', coords: [106.6297, 10.8231], flag: '🇻🇳', vehicle: 'plane' },
      { name: 'Haneda', coords: [139.7798, 35.5494], flag: '🇯🇵', vehicle: 'plane' },
      { name: 'Prague', coords: [14.4378, 50.0755], flag: '🇨🇿', vehicle: 'train' },
      { name: 'Budapest', coords: [19.0402, 47.4979], flag: '🇭🇺', vehicle: 'train' },
      { name: 'Vienna', coords: [16.3738, 48.2082], flag: '🇦🇹', vehicle: 'train' },
      { name: 'Prague', coords: [14.4378, 50.0755], flag: '🇨🇿', vehicle: 'plane' },
      { name: 'Haneda', coords: [139.7798, 35.5494], flag: '🇯🇵', vehicle: 'plane' },
      { name: 'Osaka', coords: [135.5023, 34.6937], flag: '🇯🇵', vehicle: 'plane' }
    ];

    // Helper functions
    function clamp(v) {
      return Math.max(0.0, Math.min(v, 1.0));
    }

    function mix(a, b, mixFactor) {
      const f = clamp(mixFactor);
      return a * (1 - f) + b * f;
    }

    function rad2deg(angRad) {
      return (angRad * 180.0) / Math.PI;
    }

    // Catmull-Rom spline interpolation
    function catmullRomSpline(p0, p1, p2, p3, t) {
      const t2 = t * t;
      const t3 = t2 * t;

      return 0.5 * (
        (2 * p1) +
        (-p0 + p2) * t +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
        (-p0 + 3 * p1 - 3 * p2 + p3) * t3
      );
    }

    // Helper to create GeoJSON geometry from coordinates, handling antimeridian crossing
    function makeLineGeometry(coordinates) {
      if (!coordinates || coordinates.length === 0) {
        return { type: 'LineString', coordinates: [] };
      }

      const segments = [];
      let currentSegment = [coordinates[0]];

      for (let i = 1; i < coordinates.length; i++) {
        const prev = coordinates[i - 1];
        const curr = coordinates[i];

        // Check for antimeridian crossing (big longitude jump)
        if (Math.abs(curr[0] - prev[0]) > 180) {
          segments.push(currentSegment);
          currentSegment = [curr];
        } else {
          currentSegment.push(curr);
        }
      }
      segments.push(currentSegment);

      if (segments.length === 1) {
        return { type: 'LineString', coordinates: segments[0] };
      } else {
        return { type: 'MultiLineString', coordinates: segments };
      }
    }

    // Generate a curved route with optional control points (can be array or single point)
    function generateCurvedRoute(from, to, controlPoints = null, vehicle = 'plane') {
      const numPoints = 200;
      const coordinates = [];
      const elevationData = [];

      // Normalize controlPoints to always be an array of coordinate arrays
      let controlPointsArray = [];
      if (controlPoints) {
        if (Array.isArray(controlPoints)) {
          // Array of control points
          controlPointsArray = controlPoints.map(cp => {
            // Handle both object format {coords: [lng, lat]} and array format [lng, lat]
            if (cp.coords) {
              return cp.coords;
            } else {
              return cp;
            }
          });
        } else if (controlPoints.coords) {
          // Single control point object
          controlPointsArray = [controlPoints.coords];
        } else {
          // Single control point array
          controlPointsArray = [controlPoints];
        }
      }

      if (controlPointsArray.length > 0) {
        // Build full path: start -> control points -> end
        const allPoints = [from, ...controlPointsArray, to];

        // Normalize for Catmull-Rom: make all points use the shortest path
        // If we're going west (like Japan to SF), adjust coordinates to not wrap around
        const normalizedPoints = [];
        normalizedPoints.push([allPoints[0][0], allPoints[0][1]]);

        for (let i = 1; i < allPoints.length; i++) {
          let currLng = allPoints[i][0];
          const currLat = allPoints[i][1];
          const prevLng = normalizedPoints[i - 1][0];

          // Find the shortest path between prevLng and currLng
          // Consider three options: currLng, currLng+360, currLng-360
          const options = [currLng, currLng + 360, currLng - 360];
          let bestLng = currLng;
          let minDist = Math.abs(currLng - prevLng);

          for (const opt of options) {
            const dist = Math.abs(opt - prevLng);
            if (dist < minDist) {
              minDist = dist;
              bestLng = opt;
            }
          }

          normalizedPoints.push([bestLng, currLat]);
        }

        // Use Catmull-Rom spline for smooth curve through all points
        const segments = normalizedPoints.length - 1;
        const pointsPerSegment = Math.floor(numPoints / segments);

        for (let seg = 0; seg < segments; seg++) {
          // Get four points for Catmull-Rom (with padding at ends)
          const p0 = seg > 0 ? normalizedPoints[seg - 1] : normalizedPoints[seg];
          const p1 = normalizedPoints[seg];
          const p2 = normalizedPoints[seg + 1];
          const p3 = seg < segments - 1 ? normalizedPoints[seg + 2] : normalizedPoints[seg + 1];

          const segmentPoints = seg === segments - 1 ? pointsPerSegment + (numPoints % segments) : pointsPerSegment;

          for (let i = 0; i <= segmentPoints; i++) {
            const t = i / segmentPoints;
            let lng = catmullRomSpline(p0[0], p1[0], p2[0], p3[0], t);
            const lat = catmullRomSpline(p0[1], p1[1], p2[1], p3[1], t);

            // Normalize back to -180 to 180 range (may need multiple adjustments for far values)
            while (lng > 180) lng -= 360;
            while (lng < -180) lng += 360;

            if (seg === 0 || i > 0) { // Avoid duplicate points at segment boundaries
              coordinates.push([lng, lat]);

              // Parabolic elevation profile
              const overallT = (seg * pointsPerSegment + i) / numPoints;
              const parabola = -4 * (overallT - 0.5) * (overallT - 0.5) + 1;
              const minAltitude = 0;
              const maxAltitude = (vehicle === 'plane') ? 11000 : 0;
              const elevation = minAltitude + parabola * (maxAltitude - minAltitude);
              elevationData.push(elevation);
            }
          }
        }
      } else {
        // Use great circle (original behavior)
        const startPoint = turf.point(from);
        const endPoint = turf.point(to);

        // Turf's greatCircle always takes the shorter path
        const greatCircleLine = turf.greatCircle(startPoint, endPoint, { npoints: numPoints + 1 });


        let gcCoordinates;
        if (greatCircleLine.geometry.type === 'MultiLineString') {
          // Turf splits at antimeridian into multiple segments
          // Use flat() to combine them into a single array for sampling
          // The jump between segments (e.g. 180 to -180) will be preserved
          gcCoordinates = greatCircleLine.geometry.coordinates.flat();
        } else {
          gcCoordinates = greatCircleLine.geometry.coordinates;
        }

        for (let i = 0; i <= numPoints; i++) {
          const fraction = i / numPoints;
          const coordIndex = Math.floor(fraction * (gcCoordinates.length - 1));
          coordinates.push(gcCoordinates[coordIndex]);

          const parabola = -4 * (fraction - 0.5) * (fraction - 0.5) + 1;
          const minAltitude = 0;
          const maxAltitude = (vehicle === 'plane') ? 11000 : 0;
          const elevation = minAltitude + parabola * (maxAltitude - minAltitude);
          elevationData.push(elevation);
        }
      }

      return {
        coordinates: coordinates,
        elevationData: elevationData
      };
    }

    // Generate a simple flight route between two points
    function generateFlightRoute(from, to, controlPoint = null) {
      return generateCurvedRoute(from, to, controlPoint);
    }

    // FlightRoute class (simplified)
    class FlightRoute {
      constructor(routeData) {
        this.coordinates = routeData.coordinates;
        this.elevationData = routeData.elevationData;
        this.distances = [0];

        for (let i = 1; i < this.coordinates.length; i++) {
          const segmentDistance =
            turf.distance(
              turf.point(this.coordinates[i - 1]),
              turf.point(this.coordinates[i]),
              { units: 'kilometers' }
            ) * 1000.0;
          this.distances.push(this.distances[i - 1] + segmentDistance);
        }
      }

      get totalLength() {
        if (!this.distances || this.distances.length === 0) return 0;
        return this.distances[this.distances.length - 1];
      }

      sample(currentDistance) {
        if (!this.distances || this.distances.length === 0) return null;

        let segmentIndex =
          this.distances.findIndex((d) => d >= currentDistance) - 1;
        if (segmentIndex < 0) segmentIndex = 0;
        if (segmentIndex >= this.coordinates.length - 1) {
          segmentIndex = this.coordinates.length - 2;
        }

        const p1 = this.coordinates[segmentIndex];
        const p2 = this.coordinates[segmentIndex + 1];
        const segmentLength =
          this.distances[segmentIndex + 1] - this.distances[segmentIndex];
        const segmentRatio =
          (currentDistance - this.distances[segmentIndex]) / segmentLength;

        const e1 = this.elevationData[segmentIndex];
        const e2 = this.elevationData[segmentIndex + 1];
        const bearing = turf.bearing(turf.point(p1), turf.point(p2));
        const altitude = e1 + (e2 - e1) * segmentRatio;
        const pitch = rad2deg(Math.atan2(e2 - e1, segmentLength));

        // Handle longitude interpolation across antimeridian
        let lng1 = p1[0];
        let lng2 = p2[0];

        if (Math.abs(lng2 - lng1) > 180) {
          if (lng2 > lng1) {
            lng1 += 360;
          } else {
            lng2 += 360;
          }
        }

        let lng = lng1 + (lng2 - lng1) * segmentRatio;
        const lat = p1[1] + (p2[1] - p1[1]) * segmentRatio;

        // Normalize longitude back to -180 to 180
        while (lng > 180) lng -= 360;
        while (lng < -180) lng += 360;

        return {
          position: [lng, lat],
          altitude: altitude,
          bearing: bearing,
          pitch: pitch
        };
      }
    }

    // Airplane class
    class Airplane {
      constructor(startPos) {
        this.position = startPos || [0, 0];
        this.altitude = 5000;
        this.bearing = 0;
        this.pitch = 0;
        this.roll = 0;
        this.frontGearRotation = 90; // Retracted
        this.rearGearRotation = -90; // Retracted
        this.animTimeS = 0;
      }

      update(target, dtimeMs) {
        this.position[0] = target.position[0];
        this.position[1] = target.position[1];
        this.altitude = target.altitude;
        this.bearing = target.bearing;
        this.pitch = target.pitch;
        this.roll = rad2deg(Math.sin(this.animTimeS * Math.PI * 0.3) * 0.05);
        this.frontGearRotation = 90; // Always retracted
        this.rearGearRotation = -90; // Always retracted
        this.animTimeS += dtimeMs / 1000.0;
      }
    }

    // Map style with model sources and layers
    const style = {
      'version': 8,
      'imports': [
        {
          'id': 'basemap',
          'url': 'mapbox://styles/mapbox/standard',
          'config': {
            'lightPreset': 'night',
            'showPointOfInterestLabels': false,
            'showRoadLabels': false,
          }
        }
      ],
      'sources': {
        'plane-model-source': {
          'type': 'model',
          'models': {
            'plane': {
              'uri': airplaneModelUri,
              'position': [140.3929, 35.7719],
              'orientation': [0, 0, 0]
            }
          }
        },
        'train-model-source': {
          'type': 'model',
          'models': {
            'train': {
              'uri': trainModelUri,
              'position': [-180, -90],
              'orientation': [0, 0, 0],
              'position': [140.3929, 35.7719],
            }
          }
        },
        'car-model-source': {
          'type': 'model',
          'models': {
            'car': {
              'uri': carModelUri,
              'position': [140.3929, 35.7719],
              'orientation': [0, 0, 0],
              'materialOverrides': {
                'body': {
                  'model-color': [1.0, 0.5, 0.0],
                  'model-color-mix-intensity': 1.0,
                  'model-emissive-strength': 5.0
                }
              }
            }
          }
        }
      },
      'layers': [
        {
          'id': 'plane-model-layer',
          'type': 'model',
          'source': 'plane-model-source',
          'slot': 'top',
          'layout': {
            'visibility': 'none'
          },
          'paint': {
            'model-translation': [0, 0, ['feature-state', 'z-elevation']],
            'model-scale': [
              'interpolate',
              ['exponential', 0.5],
              ['zoom'],
              2, ['literal', [20000, 20000, 20000]],
              14, ['literal', [1, 1, 1]]
            ],
            'model-type': 'location-indicator',
            'model-rotation': [
              ['feature-state', 'pitch'],
              ['feature-state', 'roll'],
              ['feature-state', 'bearing']
            ],
            'model-emissive-strength': 2
          }
        },
        {
          'id': 'train-model-layer',
          'type': 'model',
          'source': 'train-model-source',
          'slot': 'top',
          'layout': {
            'visibility': 'none'
          },
          'paint': {
            'model-translation': [0, 0, ['feature-state', 'z-elevation']],
            'model-scale': [
              'interpolate',
              ['exponential', 0.5],
              ['zoom'],
              2, ['literal', [60000, 60000, 60000]],
              14, ['literal', [1000, 1000, 1000]]
            ],
            'model-type': 'location-indicator',
            'model-rotation': [
              ['feature-state', 'pitch'],
              ['feature-state', 'roll'],
              ['feature-state', 'bearing']
            ],
            'model-emissive-strength': 2
          }
        },
        {
          'id': 'car-model-layer',
          'type': 'model',
          'source': 'car-model-source',
          'slot': 'top',
          'layout': {
            'visibility': 'none'
          },
          'paint': {
            'model-translation': [0, 0, ['feature-state', 'z-elevation']],
            'model-scale': [
              'interpolate',
              ['exponential', 0.5],
              ['zoom'],
              2, ['literal', [200000, 200000, 200000]],
              14, ['literal', [5, 5, 5]]
            ],
            'model-type': 'location-indicator',
            'model-rotation': [
              ['feature-state', 'pitch'],
              ['feature-state', 'roll'],
              ['feature-state', 'bearing']
            ],
            'model-emissive-strength': 5
          }
        }
      ]
    };

    // Update 3D model source and feature state
    function updateModelSourceAndFeatureState(airplane) {
      const isUsingTrain = (currentModelUri === trainModelUri);
      const isUsingCar = (currentModelUri === carModelUri);

      let activeLayerId, activeSourceId, activeModelId, vehicleType;
      if (isUsingTrain) {
        activeLayerId = 'train-model-layer';
        activeSourceId = 'train-model-source';
        activeModelId = 'train';
        vehicleType = 'train';
      } else if (isUsingCar) {
        activeLayerId = 'car-model-layer';
        activeSourceId = 'car-model-source';
        activeModelId = 'car';
        vehicleType = 'car';
      } else {
        activeLayerId = 'plane-model-layer';
        activeSourceId = 'plane-model-source';
        activeModelId = 'plane';
        vehicleType = 'plane';
      }

      if (needsModelUpdate) {

        // Show active layer, hide all other layers
        map.setLayoutProperty('plane-model-layer', 'visibility', vehicleType === 'plane' ? 'visible' : 'none');
        map.setLayoutProperty('train-model-layer', 'visibility', vehicleType === 'train' ? 'visible' : 'none');
        map.setLayoutProperty('car-model-layer', 'visibility', vehicleType === 'car' ? 'visible' : 'none');

        needsModelUpdate = false;
      }

      // Update model position
      const source = map.getSource(activeSourceId);
      if (source) {
        source.setModels({
          [activeModelId]: {
            'uri': currentModelUri,
            'position': airplane.position,
            'orientation': [0, 0, 0]
          }
        });
      }

      // Update feature state for rotation and elevation
      // Trains and cars stay level (pitch 0), planes use calculated pitch
      map.setFeatureState(
        { source: activeSourceId, id: activeModelId },
        {
          'z-elevation': airplane.altitude,
          'pitch': (isUsingTrain || isUsingCar) ? 0 : airplane.pitch,
          'roll': airplane.roll,
          'bearing': airplane.bearing + (isUsingTrain ? 90 : (isUsingCar ? 0 : 90))
        }
      );
    }

    // Initialize map
    const map = new mapboxgl.Map({
      container: 'map',
      projection: 'globe',
      style,
      center: destinations[0].coords, // Start at first destination
      zoom: 2,
      bearing: 0,
      pitch: 0
    });


    let currentLegIndex = 0;
    let isAnimating = false;
    let flightRoute = null;
    let airplane = null;
    let phase = 0;
    let lastFrameTime = null;
    let animationFrameId = null;
    let currentFlightDuration = 5000; // Will be calculated based on distance
    let currentSegmentTrailCoordinates = []; // Store current segment trail coordinates
    let trailAltitudes = []; // Store altitudes separately
    let segmentCounter = 0; // Counter for unique segment IDs
    // Initialize with the first destination's vehicle
    let currentModelUri = destinations[0].vehicle === 'train' ? trainModelUri :
                          destinations[0].vehicle === 'car' ? carModelUri : airplaneModelUri;
    let lastModelUri = null; // Track last loaded model to avoid unnecessary updates
    let needsModelUpdate = true; // Flag to trigger model switch

    // Route editor state
    let isEditMode = true; // Start in edit mode
    let routeControlPoints = {}; // Store arrays of control points for each route segment: { '0': [[lng, lat], [lng, lat], ...], '1': [...], ... }
    let controlPointMarkers = []; // Store marker objects with metadata
    let previewRoutes = {}; // Store generated preview routes

    // Show destination label
    function showDestinationLabel(destination) {
      const label = document.getElementById('destination-label');
      label.innerHTML = `${destination.flag}<br>${destination.name}`;
      label.classList.add('show');

      setTimeout(() => {
        label.classList.remove('show');
      }, 2000);
    }

    // Update route with control points
    function updateRoutePreview(segmentKey) {
      const i = parseInt(segmentKey);
      const from = destinations[i];
      const to = destinations[i + 1];
      const vehicle = from.vehicle || 'plane';
      const previewSourceId = `preview-route-${i}`;

      // Regenerate route with control points
      const controlPoints = routeControlPoints[segmentKey] || [];
      const updatedRoute = generateCurvedRoute(from.coords, to.coords, controlPoints.length > 0 ? controlPoints : null, vehicle);
      previewRoutes[segmentKey] = updatedRoute;

      // Update preview line
      const source = map.getSource(previewSourceId);
      if (source) {
        source.setData({
          'type': 'Feature',
          'geometry': makeLineGeometry(updatedRoute.coordinates)
        });
      }
    }

    // Add control point to route
    function addControlPoint(segmentKey, lngLat) {
      if (!routeControlPoints[segmentKey]) {
        routeControlPoints[segmentKey] = [];
      }

      const i = parseInt(segmentKey);
      const from = destinations[i];
      const to = destinations[i + 1];
      const vehicle = from.vehicle || 'plane';
      const markerClass = vehicle === 'train' ? 'train' : (vehicle === 'car' ? 'car' : 'plane');

      // Create the control point object with a unique ID
      const controlPoint = {
        coords: [lngLat.lng, lngLat.lat],
        id: Date.now() + Math.random() // Unique ID
      };

      routeControlPoints[segmentKey].push(controlPoint);


      // Create draggable marker
      const markerEl = document.createElement('div');
      markerEl.className = `control-point-marker ${markerClass}`;

      const marker = new mapboxgl.Marker({
        element: markerEl,
        draggable: true,
        anchor: 'center',
        pitchAlignment: 'viewport',
        rotationAlignment: 'viewport'
      })
        .setLngLat(lngLat)
        .addTo(map);

      // Store marker metadata with reference to the control point object
      const markerData = { marker, segmentKey, controlPoint };
      controlPointMarkers.push(markerData);

      // Handle drag to update route
      marker.on('drag', () => {
        const newLngLat = marker.getLngLat();
        // Update the control point coordinates directly
        controlPoint.coords[0] = newLngLat.lng;
        controlPoint.coords[1] = newLngLat.lat;
        updateRoutePreview(segmentKey);
      });

      // Handle right-click to delete
      markerEl.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();


        // Find and remove from control points array
        const pointIndex = routeControlPoints[segmentKey].indexOf(controlPoint);
        if (pointIndex > -1) {
          routeControlPoints[segmentKey].splice(pointIndex, 1);
        }

        // Remove marker from tracking array
        const markerIndex = controlPointMarkers.indexOf(markerData);
        if (markerIndex > -1) {
          controlPointMarkers.splice(markerIndex, 1);
        }

        marker.remove();
        updateRoutePreview(segmentKey);
      });

      updateRoutePreview(segmentKey);
    }

    // Initialize route editor
    function initializeRouteEditor() {
      // Show edit mode info
      document.getElementById('edit-mode-info').innerHTML = 'Click on a route line to add control points. Right-click markers to delete them.';
      document.getElementById('edit-mode-info').style.display = 'block';

      // Create preview routes for all segments
      for (let i = 0; i < destinations.length - 1; i++) {
        const from = destinations[i];
        const to = destinations[i + 1];
        const segmentKey = `${i}`;

        // Initialize empty control points array
        if (!routeControlPoints[segmentKey]) {
          routeControlPoints[segmentKey] = [];
        }

        // Generate preview route (straight line initially)
        const routeData = generateCurvedRoute(from.coords, to.coords, null);
        previewRoutes[segmentKey] = routeData;

        // Determine vehicle type for dash pattern
        const vehicle = from.vehicle || 'plane';
        const isUsingTrain = (vehicle === 'train');

        // Add preview line layer
        const previewSourceId = `preview-route-${i}`;
        const previewLayerId = `preview-route-layer-${i}`;

        map.addSource(previewSourceId, {
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'properties': { segmentKey },
            'geometry': makeLineGeometry(routeData.coordinates)
          }
        });

        map.addLayer({
          'id': previewLayerId,
          'type': 'line',
          'source': previewSourceId,
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color': '#ffffff',
            'line-width': 6,
            'line-opacity': 0.8,
            'line-emissive-strength': 5,
            'line-dasharray': isUsingTrain ? [1, 0] : [2, 4]
          }
        });

        // Make line clickable to add control points
        map.on('click', previewLayerId, (e) => {
          e.preventDefault();
          e.originalEvent.stopPropagation();
          const lngLat = e.lngLat;
          addControlPoint(segmentKey, lngLat);
        });

        // Change cursor on hover
        map.on('mouseenter', previewLayerId, () => {
          map.getCanvas().style.cursor = 'crosshair';
        });

        map.on('mouseleave', previewLayerId, () => {
          map.getCanvas().style.cursor = '';
        });
      }
    }

    // Clean up route editor
    function cleanupRouteEditor() {
      // Hide edit mode info
      document.getElementById('edit-mode-info').style.display = 'none';

      // Remove all control point markers
      controlPointMarkers.forEach(({ marker }) => {
        marker.remove();
      });
      controlPointMarkers = [];

      // Remove preview layers and their event listeners
      for (let i = 0; i < destinations.length - 1; i++) {
        const previewLayerId = `preview-route-layer-${i}`;
        const previewSourceId = `preview-route-${i}`;

        // Remove event listeners
        map.off('click', previewLayerId);
        map.off('mouseenter', previewLayerId);
        map.off('mouseleave', previewLayerId);

        // Remove layer and source
        if (map.getLayer(previewLayerId)) {
          map.removeLayer(previewLayerId);
        }
        if (map.getSource(previewSourceId)) {
          map.removeSource(previewSourceId);
        }
      }
    }

    // Save routes and start tour
    function saveAndStartTour() {
      if (isEditMode) {
        // Clean up editor and start animation
        cleanupRouteEditor();
        isEditMode = false;
        document.getElementById('start-btn').textContent = 'Restart Tour';
        document.getElementById('edit-btn').style.display = 'inline-block';
        startTour();
      } else {
        // Restart from beginning
        startTour();
      }
    }

    // Enter edit mode
    function enterEditMode() {
      isEditMode = true;
      document.getElementById('edit-btn').style.display = 'none';
      document.getElementById('start-btn').textContent = 'Save & Start Tour';

      // Stop animation if running
      if (isAnimating) {
        isAnimating = false;
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      }

      // Clean up animation layers
      const style = map.getStyle();
      if (style && style.layers) {
        const segmentLayers = style.layers.filter(layer => layer.id.startsWith('trail-segment-layer-'));
        segmentLayers.forEach(layer => {
          if (map.getLayer(layer.id)) {
            map.removeLayer(layer.id);
          }
        });
      }
      if (style && style.sources) {
        const segmentSources = Object.keys(style.sources).filter(source => source.startsWith('trail-segment-'));
        segmentSources.forEach(source => {
          if (map.getSource(source)) {
            map.removeSource(source);
          }
        });
      }

      // Re-initialize editor with saved control points
      initializeRouteEditor();

      // Re-add all saved control points as markers
      Object.keys(routeControlPoints).forEach(segmentKey => {
        const points = routeControlPoints[segmentKey];
        if (points && points.length > 0) {
          // Clear the array temporarily to avoid duplicates
          const savedPoints = [...points];
          routeControlPoints[segmentKey] = [];

          // Re-add each point
          savedPoints.forEach(point => {
            // Handle both object format and array format
            const coords = point.coords || point;
            addControlPoint(segmentKey, { lng: coords[0], lat: coords[1] });
          });
        }
      });
    }

    // Smoke effect animation
    let smokeCounter = 0;
    function addSmokeEffect(position) {
      const smokeId = `smoke-${smokeCounter++}`;
      const sourceId = `${smokeId}-source`;
      const layerId = `${smokeId}-layer`;

      // Add source with initial small circle
      map.addSource(sourceId, {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'geometry': {
            'type': 'Point',
            'coordinates': position
          }
        }
      });

      // Add circle layer
      map.addLayer({
        'id': layerId,
        'type': 'circle',
        'source': sourceId,
        'paint': {
          'circle-radius': 30,
          'circle-color': '#888888',
          'circle-opacity': 0.8,
          'circle-blur': 0.5,
          'circle-emissive-strength': 3
        }
      });

      // Animate the smoke
      const startTime = Date.now();
      const duration = 500; // Match the delay duration

      function animateSmoke() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (progress >= 1) {
          // Remove smoke layer and source
          if (map.getLayer(layerId)) map.removeLayer(layerId);
          if (map.getSource(sourceId)) map.removeSource(sourceId);
          return;
        }

        // Expand radius and fade out
        const radius = 30 + (progress * 120); // Expand from 30 to 150
        const opacity = 0.8 * (1 - progress); // Fade from 0.8 to 0

        map.setPaintProperty(layerId, 'circle-radius', radius);
        map.setPaintProperty(layerId, 'circle-opacity', opacity);

        requestAnimationFrame(animateSmoke);
      }

      animateSmoke();
    }

    // Vehicle pulse effect
    function addVehiclePulseEffect() {
      const isUsingTrain = (currentModelUri === trainModelUri);
      const isUsingCar = (currentModelUri === carModelUri);

      let activeLayerId;
      if (isUsingTrain) {
        activeLayerId = 'train-model-layer';
      } else if (isUsingCar) {
        activeLayerId = 'car-model-layer';
      } else {
        activeLayerId = 'plane-model-layer';
      }

      const startTime = Date.now();
      const duration = 500; // Match the delay duration
      const baseEmissive = 2; // Base emissive strength
      const maxEmissive = 5; // Peak emissive strength (max allowed)

      function animatePulse() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress >= 1) {
          // Reset to base emissive
          map.setPaintProperty(activeLayerId, 'model-emissive-strength', baseEmissive);
          return;
        }

        // Create a sine wave pulse effect (0 -> 1 -> 0)
        const pulse = Math.sin(progress * Math.PI * 2); // 2 full cycles
        const emissive = baseEmissive + (pulse * (maxEmissive - baseEmissive));

        map.setPaintProperty(activeLayerId, 'model-emissive-strength', Math.abs(emissive));

        requestAnimationFrame(animatePulse);
      }

      animatePulse();
    }

    // Animation frame
    function frame(time) {
      if (!isAnimating) return;

      if (!lastFrameTime) lastFrameTime = time;
      const frameDeltaTime = time - lastFrameTime;

      phase += frameDeltaTime / currentFlightDuration;
      lastFrameTime = time;

      if (phase >= 1) {
        // Flight leg complete
        phase = 0;
        currentLegIndex++;

        if (currentLegIndex >= destinations.length - 1) {
          // Tour complete
          isAnimating = false;
          document.getElementById('start-btn').disabled = false;
          document.getElementById('start-btn').textContent = 'Restart Tour';

          // Show final destination
          showDestinationLabel(destinations[destinations.length - 1]);
          return;
        }

        // Start next leg
        const from = destinations[currentLegIndex];
        const to = destinations[currentLegIndex + 1];

        // Switch vehicle based on the 'from' destination's vehicle attribute
        const vehicle = from.vehicle || 'plane'; // Default to plane if not specified
        const previousModelUri = currentModelUri;
        if (vehicle === 'train') {
          currentModelUri = trainModelUri;
        } else if (vehicle === 'car') {
          currentModelUri = carModelUri;
        } else {
          currentModelUri = airplaneModelUri;
        }

        // Set flag if vehicle changed
        if (previousModelUri !== currentModelUri) {
          needsModelUpdate = true;
        }

        // Use saved control point if available
        const segmentKey = `${currentLegIndex}`;
        const controlPoint = routeControlPoints[segmentKey] || null;
        const routeData = generateFlightRoute(from.coords, to.coords, controlPoint, vehicle);
        flightRoute = new FlightRoute(routeData);

        // Create new segment source and layer for this route
        segmentCounter++;
        currentSegmentTrailCoordinates = []; // Reset for new segment

        const isUsingTrain = (currentModelUri === trainModelUri);
        const isUsingCar = (currentModelUri === carModelUri);
        const trailColor = isUsingTrain ? '#ff0000' : (isUsingCar ? '#ff8800' : '#ffffff');
        const sourceId = `trail-segment-${segmentCounter}`;
        const layerId = `trail-segment-layer-${segmentCounter}`;

        // Add source for this segment
        map.addSource(sourceId, {
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'geometry': {
              'type': 'LineString',
              'coordinates': []
            }
          }
        });

        // Add layer for this segment
        map.addLayer({
          'id': layerId,
          'type': 'line',
          'source': sourceId,
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color': trailColor,
            'line-width': 5,
            'line-opacity': 0.8,
            'line-emissive-strength': 1.5,
            'line-dasharray': (isUsingTrain || isUsingCar) ? [1, 0] : [2, 4] // Solid line for train/car, dashed for plane
          }
        });

        // Vehicle-specific duration: train 2.5s, car 3s, plane 1.5s
        if (isUsingTrain) {
          currentFlightDuration = 2500; // 2.5 seconds
        } else if (isUsingCar) {
          currentFlightDuration = 3000; // 3 seconds
        } else {
          currentFlightDuration = 1500; // 1.5 seconds
        }

        // Fit viewport to show both start and end points
        // For trans-Pacific routes, use the great circle path coordinates
        const bounds = new mapboxgl.LngLatBounds();

        // Use all route coordinates to get proper bounds including great circle path
        for (const coord of routeData.coordinates) {
          bounds.extend(coord);
        }

        // Vehicle-specific camera pitch: plane 30°, train/car 70°
        const cameraPitch = (isUsingTrain || isUsingCar) ? 70 : 30;

        map.fitBounds(bounds, {
          padding: { top: 10, bottom: 10, left: 10, right: 10 },
          duration: 2000,
          pitch: cameraPitch,
          bearing: 0
        });

        // Show destination label
        showDestinationLabel(to);

        // Pause before next leg
        isAnimating = false;
        setTimeout(() => {
          isAnimating = true;
          lastFrameTime = null;
          animationFrameId = window.requestAnimationFrame(frame);
        }, 0);
        return;
      }

      // Update airplane position
      const alongRoute = flightRoute.sample(flightRoute.totalLength * phase);
      if (alongRoute) {
        airplane.update(alongRoute, frameDeltaTime);

        // For trains and cars, keep at sea level
        const isUsingTrain = (currentModelUri === trainModelUri);
        const isUsingCar = (currentModelUri === carModelUri);
        if (isUsingTrain || isUsingCar) {
          airplane.altitude = 0; // Sea level
        }

        // Add current position to trail (2D coordinates)
        currentSegmentTrailCoordinates.push([airplane.position[0], airplane.position[1]]);
        trailAltitudes.push(airplane.altitude);

        if (currentSegmentTrailCoordinates.length === 1) {
        }

        // Update trail source
        const trailSourceId = `trail-segment-${segmentCounter}`;

        // Update current segment trail using simple Mapbox line (only if we have at least 2 points)
        const trailSource = map.getSource(trailSourceId);
        if (trailSource && currentSegmentTrailCoordinates.length >= 2) {
          // Split trail into segments when crossing antimeridian
          const trailSegments = [];
          let currentSegment = [currentSegmentTrailCoordinates[0]];

          for (let i = 1; i < currentSegmentTrailCoordinates.length; i++) {
            const prev = currentSegmentTrailCoordinates[i - 1];
            const curr = currentSegmentTrailCoordinates[i];
            const lonDiff = Math.abs(curr[0] - prev[0]);

            // If longitude difference > 180, we crossed the antimeridian
            if (lonDiff > 180) {
              // Close current segment and start new one
              trailSegments.push(currentSegment);
              currentSegment = [curr];
            } else {
              currentSegment.push(curr);
            }
          }

          // Add the last segment
          if (currentSegment.length > 0) {
            trailSegments.push(currentSegment);
          }

          // Create MultiLineString geometry
          trailSource.setData({
            'type': 'Feature',
            'geometry': {
              'type': 'MultiLineString',
              'coordinates': trailSegments
            }
          });
        }
      }

      updateModelSourceAndFeatureState(airplane);

      animationFrameId = window.requestAnimationFrame(frame);
    }

    // Start tour
    function startTour() {
      currentLegIndex = 0;
      phase = 0;
      lastFrameTime = null;
      isAnimating = true;
      currentSegmentTrailCoordinates = []; // Reset current segment trail
      trailAltitudes = []; // Reset altitudes


      // Clean up all existing segment layers and sources
      const style = map.getStyle();
      if (style && style.layers) {
        const segmentLayers = style.layers.filter(layer => layer.id.startsWith('trail-segment-layer-'));
        segmentLayers.forEach(layer => {
          if (map.getLayer(layer.id)) {
            map.removeLayer(layer.id);
          }
        });
      }
      if (style && style.sources) {
        const segmentSources = Object.keys(style.sources).filter(source => source.startsWith('trail-segment-'));
        segmentSources.forEach(source => {
          if (map.getSource(source)) {
            map.removeSource(source);
          }
        });
      }

      segmentCounter = 0; // Reset segment counter after cleanup

      document.getElementById('start-btn').disabled = true;

      // Generate first route
      const from = destinations[0];
      const to = destinations[1];

      // First, center camera on starting point and wait 1 second before starting
      map.flyTo({
        center: from.coords,
        zoom: 2,
        pitch: 0,
        bearing: 0,
        duration: 1500
      });

      // Wait 1 second after camera movement, then start the route
      setTimeout(() => {
      // Switch vehicle based on the 'from' destination's vehicle attribute
      const vehicle = from.vehicle || 'plane'; // Default to plane if not specified
      if (vehicle === 'train') {
        currentModelUri = trainModelUri;
      } else if (vehicle === 'car') {
        currentModelUri = carModelUri;
      } else {
        currentModelUri = airplaneModelUri;
      }

      // Set flag for initial model load
      needsModelUpdate = true;

      // Use saved control point if available
      const segmentKey = `${currentLegIndex}`;
      const controlPoint = routeControlPoints[segmentKey] || null;
      const routeData = generateFlightRoute(from.coords, to.coords, controlPoint, vehicle);
      flightRoute = new FlightRoute(routeData);
      airplane = new Airplane(from.coords);

      // Create first segment source and layer
      segmentCounter++;
      const isUsingTrain = (currentModelUri === trainModelUri);
      const isUsingCar = (currentModelUri === carModelUri);
      const trailColor = isUsingTrain ? '#ff0000' : (isUsingCar ? '#ff8800' : '#ffffff');
      const sourceId = `trail-segment-${segmentCounter}`;
      const layerId = `trail-segment-layer-${segmentCounter}`;

      // Add source for first segment
      map.addSource(sourceId, {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'geometry': {
            'type': 'LineString',
            'coordinates': []
          }
        }
      });

      // Add layer for first segment
      map.addLayer({
        'id': layerId,
        'type': 'line',
        'source': sourceId,
        'layout': {
          'line-cap': 'round',
          'line-join': 'round'
        },
        'paint': {
          'line-color': trailColor,
          'line-width': 5,
          'line-opacity': 0.8,
          'line-emissive-strength': 1.5,
          'line-dasharray': (isUsingTrain || isUsingCar) ? [1, 0] : [2, 4] // Solid line for train/car, dashed for plane
        }
      });

      // Vehicle-specific duration: train 2.5s, car 3s, plane 1.5s
      if (isUsingTrain) {
        currentFlightDuration = 2500; // 2.5 seconds
      } else if (isUsingCar) {
        currentFlightDuration = 3000; // 3 seconds
      } else {
        currentFlightDuration = 1500; // 1.5 seconds
      }

      // Fit viewport to show both start and end points for first leg
      // For trans-Pacific routes, use the great circle path coordinates
      const bounds = new mapboxgl.LngLatBounds();

      // Use all route coordinates to get proper bounds including great circle path
      for (const coord of routeData.coordinates) {
        bounds.extend(coord);
      }

      // Vehicle-specific camera pitch: plane 30°, train/car 70°
      const cameraPitch = (isUsingTrain || isUsingCar) ? 70 : 30;

      map.fitBounds(bounds, {
        padding: { top: 120, bottom: 120, left: 120, right: 120 },
        duration: 2000,
        pitch: cameraPitch,
        bearing: 0
      });

      // Initialize plane at starting position
      const startPoint = flightRoute.sample(0);
      if (startPoint) {
        airplane.update(startPoint, 0);
        updateModelSourceAndFeatureState(airplane);
      }

      // Show first destination
      showDestinationLabel(from);
      setTimeout(() => showDestinationLabel(to), 500);

      animationFrameId = window.requestAnimationFrame(frame);
      }, 1000); // Wait 1 second before starting route
    }

    map.on('style.load', () => {
      // Initialize route editor on load
      initializeRouteEditor();
    });

    // Cleanup on page unload to free WebGL contexts
    window.addEventListener('beforeunload', () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (map) {
        map.remove();
      }
    });
  </script>
</body>
</html>
