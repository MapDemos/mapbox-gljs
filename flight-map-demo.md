---
layout: null
title: Flight Map - SF to London (scrubber + chase camera)
---

<!DOCTYPE html>
<html lang="en">
<head>
  {% include common_head.html %}
  <title>Flight Map</title>
  <meta name="description" content="A simulated San Francisco to London flight with a real 3D aircraft model, a time scrubber, and a close-range orbit chase camera." />
  <style>
    :root {
      --ink-900: #0b1d29;
      --ink-800: #14293a;
      --ink-700: #1a3446;
      --paper-100: #ede7d9;
      --paper-400: #8296a2;
      --brass-500: #c08a3e;
      --brass-300: #e3b876;
      --contour-500: #5c8a76;

      --font-display: Georgia, 'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', serif;
      --font-body: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      --font-mono: ui-monospace, 'SF Mono', 'Cascadia Code', 'Roboto Mono', Menlo, Consolas, monospace;
    }

    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      width: 100%;
      background: var(--ink-900);
    }

    #map {
      position: absolute;
      width: 100%;
      top: 0;
      bottom: 0;
    }

    .scrubber-bar {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      z-index: 2;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 20px;
      background: rgba(20, 41, 58, 0.92);
      backdrop-filter: blur(6px);
      border-bottom: 1px solid rgba(237, 231, 217, 0.12);
      box-shadow: 0 1px 8px rgba(0, 0, 0, 0.35);
      font-family: var(--font-body);
    }

    .scrubber-bar input[type="range"] {
      flex: 1;
      accent-color: var(--brass-500);
      /* Without this, some browsers' own swipe/edge-gesture handling (e.g.
         Arc's trackpad navigation gestures) can intercept the horizontal
         drag before it reaches the input, so only the initial click-to-jump
         registers and dragging never does. */
      touch-action: none;
    }

    .scrubber-bar input[type="range"]:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .scrubber-bar .scrubber-time {
      font-family: var(--font-mono);
      font-size: 12px;
      letter-spacing: 0.02em;
      color: var(--paper-100);
      white-space: nowrap;
      min-width: 132px;
      text-align: right;
    }

    .panel {
      position: absolute;
      top: 68px;
      left: 20px;
      z-index: 1;
      padding: 16px 18px;
      background: var(--ink-800);
      border: 1px solid rgba(237, 231, 217, 0.12);
      border-left: 3px solid var(--brass-500);
      border-radius: 4px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
      font-family: var(--font-body);
      min-width: 220px;
    }

    .panel h3 {
      margin: 0 0 10px 0;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      color: var(--paper-400);
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .panel .route {
      font-family: var(--font-display);
      font-style: italic;
      font-size: 16px;
      color: var(--paper-100);
      margin-bottom: 12px;
    }

    .panel button[hidden] {
      display: none;
    }

    .panel button {
      display: block;
      width: 100%;
      padding: 10px 14px;
      background: var(--brass-500);
      color: var(--ink-900);
      border: none;
      border-radius: 4px;
      font-family: var(--font-body);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s ease, transform 0.2s ease;
    }

    .panel button:hover {
      background: var(--brass-300);
      transform: translateY(-1px);
    }

    .panel button:focus-visible {
      outline: 2px solid var(--brass-300);
      outline-offset: 2px;
    }

    .panel button.secondary {
      margin-top: 8px;
      background: var(--ink-700);
      color: var(--paper-100);
      border: 1px solid rgba(237, 231, 217, 0.14);
    }

    .panel button.secondary:hover {
      background: var(--ink-700);
      border-color: var(--brass-300);
    }
  </style>
</head>

<body>
  <div id="map"></div>

  <div class="scrubber-bar">
    <input type="range" id="flight-scrubber" min="0" max="1000" value="0" step="1" disabled />
    <div class="scrubber-time" id="scrubber-time">0h 00m / 0h 00m</div>
  </div>

  <div class="panel">
    <h3>Flight Map</h3>
    <div class="route">San Francisco &rarr; London</div>
    <button id="camera-toggle">Zoom to Aircraft</button>
    <button id="follow-toggle" class="secondary" hidden>Follow Aircraft</button>
    <button id="style-toggle" class="secondary">Standard 3D View</button>
  </div>

  <script>
    // Flight Map: a simulated flight, played back from Mapbox's own public
    // flightpath.json route/elevation profile driving a real 3D aircraft
    // model (airplane.glb) -- same assets as the classic 3D Flight Route
    // example, but adds a time scrubber, a style toggle, and an
    // overview/chase-camera (with free-orbit) mode on top of it.
    // turf.js (used by the original for distance/bearing) is replaced with
    // hand-rolled haversine math to avoid the extra dependency.

    // mapboxgl.accessToken is set by utils.js (loaded in common_head.html).

    const FLIGHTPATH_URL = 'https://docs.mapbox.com/mapbox-gl-js/assets/flightpath.json';
    const AIRPLANE_MODEL_URL = 'https://docs.mapbox.com/mapbox-gl-js/assets/airplane.glb';

    function clamp(v) {
      return Math.max(0.0, Math.min(v, 1.0));
    }

    function mix(a, b, mixFactor) {
      const f = clamp(mixFactor);
      return a * (1 - f) + b * f;
    }

    function rad2deg(rad) {
      return (rad * 180.0) / Math.PI;
    }

    function deg2rad(deg) {
      return (deg * Math.PI) / 180.0;
    }

    // Great-circle distance in meters (haversine) -- replaces turf.distance
    function distanceMeters(a, b) {
      const R = 6371000;
      const dLat = deg2rad(b[1] - a[1]);
      const dLng = deg2rad(b[0] - a[0]);
      const lat1 = deg2rad(a[1]);
      const lat2 = deg2rad(b[1]);
      const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(h));
    }

    // Initial bearing in degrees, range -180..180 -- replaces turf.bearing
    function bearingDegrees(a, b) {
      const lat1 = deg2rad(a[1]);
      const lat2 = deg2rad(b[1]);
      const dLng = deg2rad(b[0] - a[0]);
      const y = Math.sin(dLng) * Math.cos(lat2);
      const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
      return rad2deg(Math.atan2(y, x));
    }

    class FlightRoute {
      constructor(url) {
        this.ready = false;
        fetch(url)
          .then((response) => response.json())
          .then((data) => {
            this.setFromFeatureData(data.features[0]);
            this.ready = true;
          })
          .catch((error) => {
            console.error('Error loading flight path data:', error);
          });
      }

      get totalLength() {
        if (!this.distances || this.distances.length === 0) return 0;
        return this.distances[this.distances.length - 1];
      }

      setFromFeatureData(targetRouteFeature) {
        const coordinates = targetRouteFeature.geometry.coordinates;
        this.elevationData = targetRouteFeature.properties.elevation;
        this.coordinates = coordinates;
        this.maxElevation = 0;

        const distances = [0];
        for (let i = 1; i < coordinates.length; i++) {
          const segmentDistance = distanceMeters(coordinates[i - 1], coordinates[i]);
          distances.push(distances[i - 1] + segmentDistance);
          this.maxElevation = Math.max(this.maxElevation, this.elevationData[i]);
        }
        this.distances = distances;
      }

      sample(currentDistance) {
        if (!this.distances || this.distances.length === 0) return null;

        let segmentIndex = this.distances.findIndex((d) => d >= currentDistance) - 1;
        if (segmentIndex < 0) segmentIndex = 0;

        const p1 = this.coordinates[segmentIndex];
        const p2 = this.coordinates[segmentIndex + 1];
        const segmentLength = this.distances[segmentIndex + 1] - this.distances[segmentIndex];
        const segmentRatio = (currentDistance - this.distances[segmentIndex]) / segmentLength;

        const e1 = this.elevationData[segmentIndex];
        const e2 = this.elevationData[segmentIndex + 1];
        const bearing = bearingDegrees(p1, p2);
        const altitude = e1 + (e2 - e1) * segmentRatio;
        const pitch = rad2deg(Math.atan2(e2 - e1, segmentLength));

        return {
          position: [
            p1[0] + (p2[0] - p1[0]) * segmentRatio,
            p1[1] + (p2[1] - p1[1]) * segmentRatio
          ],
          altitude,
          bearing,
          pitch
        };
      }
    }

    function animSinPhaseFromTime(animTimeS, phaseLen) {
      return Math.sin(((animTimeS % phaseLen) / phaseLen) * Math.PI * 2.0) * 0.5 + 0.5;
    }

    class Airplane {
      constructor() {
        this.position = [0, 0];
        this.altitude = 0;
        this.bearing = 0;
        this.pitch = 0;
        this.roll = 0;
        this.rearGearRotation = 0;
        this.frontGearRotation = 0;
        this.lightPhase = 0;
        this.lightPhaseStrobe = 0;
        this.lightTaxiPhase = 0;
        this.animTimeS = 0;
      }

      update(target, dtimeMs) {
        this.position[0] = mix(this.position[0], target.position[0], dtimeMs * 0.05);
        this.position[1] = mix(this.position[1], target.position[1], dtimeMs * 0.05);
        this.altitude = mix(this.altitude, target.altitude, dtimeMs * 0.05);
        this.bearing = mix(this.bearing, target.bearing, dtimeMs * 0.01);
        this.pitch = mix(this.pitch, target.pitch, dtimeMs * 0.01);
        this.frontGearRotation = mix(0, 90, this.altitude / 50.0);
        this.rearGearRotation = mix(0, -90, this.altitude / 50.0);
        this.lightPhase = animSinPhaseFromTime(this.animTimeS, 2.0) * 0.25 + 0.75;
        this.lightPhaseStrobe = animSinPhaseFromTime(this.animTimeS, 1.0);
        this.lightTaxiPhase = mix(1.0, 0, this.altitude / 100.0);
        this.roll = rad2deg(
          mix(0, Math.sin(this.animTimeS * Math.PI * 0.2) * 0.1, (this.altitude - 50.0) / 100.0)
        );
        this.animTimeS += dtimeMs / 1000.0;
      }
    }

    const flightRoute = new FlightRoute(FLIGHTPATH_URL);
    const airplane = new Airplane();

    // Mirrors the interpolate this used to be in the style's 'model-scale'
    // paint property -- moved to JS because a zoom expression can't be
    // combined with feature-state in one style expression. Aircraft chase
    // mode always wants literal life-size (see the note above the layer's
    // 'model-scale' paint property for why).
    const OVERVIEW_SCALE_MULTIPLIER = 1 / 3;
    function computeModelScale(map) {
      if (cameraMode === 'aircraft') return [1, 1, 1];
      const z0 = 2.0, z1 = 14.0, v0 = 40000.0, v1 = 1.0, base = 0.5;
      const t = clamp((map.getZoom() - z0) / (z1 - z0));
      const w = (Math.pow(base, t) - 1) / (base - 1);
      const s = (v0 + (v1 - v0) * w) * OVERVIEW_SCALE_MULTIPLIER;
      return [s, s, s];
    }

    function updateModelSourceAndFeatureState(map) {
      const modelSource = map.getSource('3d-model-source');
      if (!modelSource) return;

      modelSource.setModels({
        plane: {
          uri: AIRPLANE_MODEL_URL,
          position: airplane.position,
          orientation: [airplane.roll, airplane.pitch, airplane.bearing + 90],
          materialOverrideNames: [
            'propeller_blur',
            'lights_position_white',
            'lights_position_white_volume',
            'lights_position_red',
            'lights_position_red_volume',
            'lights_position_green',
            'lights_position_green_volume',
            'lights_anti_collision_red',
            'lights_anti_collision_red_volume',
            'lights_taxi_white',
            'lights_taxi_white_volume'
          ],
          nodeOverrideNames: [
            'front_gear',
            'rear_gears',
            'propeller_left_inner',
            'propeller_left_outer',
            'propeller_right_inner',
            'propeller_right_outer',
            'propeller_left_inner_blur',
            'propeller_left_outer_blur',
            'propeller_right_inner_blur',
            'propeller_right_outer_blur'
          ]
        }
      });

      map.setFeatureState(
        { source: '3d-model-source', sourceLayer: '', id: 'plane' },
        {
          'z-elevation': cameraMode === 'aircraft' ? chaseDisplayAltitude() : airplane.altitude,
          'model-scale': computeModelScale(map),
          'front-gear-rotation': [0, 0, airplane.frontGearRotation],
          'rear-gear-rotation': [0, 0, airplane.rearGearRotation],
          'propeller-rotation': [0, 0, -(airplane.animTimeS % 0.5) * 2.0 * 360.0],
          'propeller-rotation-blur': [0, 0, (airplane.animTimeS % 0.1) * 10.0 * 360.0],
          'light-emission': airplane.lightPhase,
          'light-emission-strobe': airplane.lightPhaseStrobe,
          'light-emission-taxi': airplane.lightTaxiPhase
        }
      );
    }

    const SATELLITE_STYLE_URL = 'mapbox://styles/mapbox/satellite-v9';
    const STANDARD_STYLE_URL = 'mapbox://styles/mapbox/standard';

    const map = new mapboxgl.Map({
      container: 'map',
      style: SATELLITE_STYLE_URL,
      projection: 'globe',
      center: [-40, 45],
      zoom: 2,
      pitch: 0
    });

    let currentStyleUrl = SATELLITE_STYLE_URL;
    const styleToggleButton = document.getElementById('style-toggle');
    styleToggleButton.addEventListener('click', () => {
      currentStyleUrl = currentStyleUrl === SATELLITE_STYLE_URL ? STANDARD_STYLE_URL : SATELLITE_STYLE_URL;
      styleToggleButton.textContent = currentStyleUrl === SATELLITE_STYLE_URL ? 'Standard 3D View' : 'Satellite View';
      map.setStyle(currentStyleUrl);
    });

    let cameraMode = 'overview'; // 'overview' | 'aircraft'
    let overviewCamera = null;
    let orbitAngle = 0;
    const ORBIT_PERIOD_MS = 24000; // slow: one full revolution every 24s
    const ORBIT_RADIUS_METERS = 220;
    const ORBIT_HEIGHT_METERS = 60;

    // The model can progressively lose parts when viewed from the free/chase
    // camera at very high real-world altitude (cruise is ~10,000m+) -- capping
    // the altitude the chase camera and model both use at 3000m avoids that;
    // overview mode still shows the real altitude.
    const CHASE_CAM_MAX_ALTITUDE = 3000;
    function chaseDisplayAltitude() {
      return Math.min(airplane.altitude, CHASE_CAM_MAX_ALTITUDE);
    }

    // In aircraft mode, updateCameraOrbit() overwrites the free camera every
    // frame -- so as long as it keeps running, any user pan/zoom/rotate gets
    // undone almost instantly. followingAircraft lets a real user gesture
    // (not our own per-frame setFreeCameraOptions call, which doesn't fire
    // these events) suspend that override until "Follow Aircraft" is clicked.
    let followingAircraft = true;

    const toggleButton = document.getElementById('camera-toggle');
    const followButton = document.getElementById('follow-toggle');

    toggleButton.addEventListener('click', () => {
      if (cameraMode === 'overview') {
        cameraMode = 'aircraft';
        followingAircraft = true;
        followButton.hidden = true;
        toggleButton.textContent = 'Back to Overview';
      } else {
        cameraMode = 'overview';
        followButton.hidden = true;
        toggleButton.textContent = 'Zoom to Aircraft';
        if (overviewCamera) {
          map.easeTo({ ...overviewCamera, duration: 1200 });
        }
      }
    });

    followButton.addEventListener('click', () => {
      followingAircraft = true;
      followButton.hidden = true;
    });

    // Listening for Mapbox's own dragstart/zoomstart/etc. doesn't work here:
    // those only fire once the handler manager detects a gesture has been
    // active across two frames, but updateCameraOrbit() overwrites the
    // transform every single frame while followingAircraft is true -- so our
    // own override can wipe out the user's gesture before that detection
    // ever completes, and dragstart never fires at all. Listening at the raw
    // DOM level instead catches the gesture on its very first tick, before
    // updateCameraOrbit gets another chance to run.
    const mapGestureTarget = map.getCanvasContainer();
    ['mousedown', 'touchstart', 'wheel'].forEach((evt) => {
      mapGestureTarget.addEventListener(evt, () => {
        if (cameraMode === 'aircraft' && followingAircraft) {
          followingAircraft = false;
          followButton.hidden = false;
        }
      }, { passive: true });
    });

    function updateCameraOrbit(dtMs) {
      orbitAngle = (orbitAngle + (dtMs / ORBIT_PERIOD_MS) * 360) % 360;
      const angleRad = deg2rad(orbitAngle);

      const metersPerDegLat = 111320;
      const metersPerDegLng = 111320 * Math.cos(deg2rad(airplane.position[1]));
      const offsetLng = (ORBIT_RADIUS_METERS * Math.cos(angleRad)) / metersPerDegLng;
      const offsetLat = (ORBIT_RADIUS_METERS * Math.sin(angleRad)) / metersPerDegLat;

      const displayAltitude = chaseDisplayAltitude();
      const camera = map.getFreeCameraOptions();
      camera.position = mapboxgl.MercatorCoordinate.fromLngLat(
        { lng: airplane.position[0] + offsetLng, lat: airplane.position[1] + offsetLat },
        displayAltitude + ORBIT_HEIGHT_METERS
      );
      camera.lookAtPoint(
        { lng: airplane.position[0], lat: airplane.position[1] },
        [0, 0, 1],
        displayAltitude
      );
      map.setFreeCameraOptions(camera);
    }

    // Re-run on every style load (including the initial one) -- switching
    // styles via the style-toggle button replaces the whole style, which
    // drops any sources/layers not part of the new style's own JSON, so the
    // flight path, 3D model, and overview-camera bounds all need re-adding
    // each time rather than just once.
    function addFlightLayers() {
      map.addSource('flightpath', {
        type: 'geojson',
        data: FLIGHTPATH_URL
      });

      map.addSource('3d-model-source', {
        type: 'model',
        models: {
          plane: {
            uri: AIRPLANE_MODEL_URL,
            position: [-122.37204647633236, 37.619836883832306],
            orientation: [0, 0, 0]
          }
        }
      });

      map.addLayer({
        id: 'flight-path-line',
        type: 'line',
        source: 'flightpath',
        // 'slot' only takes effect on Standard-family styles (like
        // STANDARD_STYLE_URL below); classic styles such as satellite-v9
        // simply ignore it and append the layer at the top, same place it'd
        // land anyway since nothing else is added after it.
        slot: 'middle',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#4f8ff0',
          'line-emissive-strength': 1,
          'line-width': 3
        }
      });

      map.addLayer({
        id: '3d-model-layer',
        type: 'model',
        source: '3d-model-source',
        slot: 'top',
        paint: {
          // Without this, Standard's built-in terrain adds ground elevation
          // underneath the model's z-elevation (real barometric altitude),
          // making the plane bob with the terrain instead of holding a
          // steady altitude. 'sea' keeps altitude referenced to sea level
          // regardless of terrain.
          'model-elevation-reference': 'sea',
          'model-translation': [0, 0, ['feature-state', 'z-elevation']],
          // A zoom expression can't be mixed with feature-state inside a
          // 'case' (not a supported composite form), so the mode-dependent
          // scale below is computed in JS and fed in wholesale via
          // feature-state instead -- see computeModelScale().
          'model-scale': ['feature-state', 'model-scale'],
          'model-type': 'location-indicator',
          'model-emissive-strength': [
            'match', ['get', 'part'],
            'lights_position_white', ['feature-state', 'light-emission-strobe'],
            'lights_position_white_volume', ['feature-state', 'light-emission-strobe'],
            'lights_anti_collision_red', ['feature-state', 'light-emission-strobe'],
            'lights_anti_collision_red_volume', ['feature-state', 'light-emission-strobe'],
            'lights_position_red', ['feature-state', 'light-emission'],
            'lights_position_red_volume', ['feature-state', 'light-emission'],
            'lights_position_green', ['feature-state', 'light-emission'],
            'lights_position_green_volume', ['feature-state', 'light-emission'],
            'lights_taxi_white', ['feature-state', 'light-emission-taxi'],
            'lights_taxi_white_volume', ['feature-state', 'light-emission-taxi'],
            0.0
          ],
          'model-rotation': [
            'match', ['get', 'part'],
            'front_gear', ['feature-state', 'front-gear-rotation'],
            'rear_gears', ['feature-state', 'rear-gear-rotation'],
            'propeller_left_outer', ['feature-state', 'propeller-rotation'],
            'propeller_left_inner', ['feature-state', 'propeller-rotation'],
            'propeller_right_outer', ['feature-state', 'propeller-rotation'],
            'propeller_right_inner', ['feature-state', 'propeller-rotation'],
            'propeller_left_outer_blur', ['feature-state', 'propeller-rotation-blur'],
            'propeller_left_inner_blur', ['feature-state', 'propeller-rotation-blur'],
            'propeller_right_outer_blur', ['feature-state', 'propeller-rotation-blur'],
            'propeller_right_inner_blur', ['feature-state', 'propeller-rotation-blur'],
            [0.0, 0.0, 0.0]
          ],
          'model-opacity': [
            'match', ['get', 'part'],
            'lights_position_white_volume', ['*', ['feature-state', 'light-emission-strobe'], 0.25],
            'lights_anti_collision_red_volume', ['*', ['feature-state', 'light-emission-strobe'], 0.45],
            'lights_position_green_volume', ['*', ['feature-state', 'light-emission'], 0.25],
            'lights_position_red_volume', ['*', ['feature-state', 'light-emission'], 0.25],
            'lights_taxi_white', ['*', ['feature-state', 'light-emission-taxi'], 0.25],
            'lights_taxi_white_volume', ['*', ['feature-state', 'light-emission-taxi'], 0.25],
            'propeller_blur', 0.2,
            1.0
          ]
        }
      });

      // Fit the overview camera to the whole route once its data is in, and
      // remember it so "Back to Overview" can ease back to it -- only ever
      // once, though: addFlightLayers() re-runs on every style switch (via
      // 'style.load'), and without this guard it would reset the camera
      // back to the whole-route view on every switch, even if the user had
      // since panned elsewhere or was sitting in overview mode already.
      if (!overviewCamera) {
        fetch(FLIGHTPATH_URL)
          .then((res) => res.json())
          .then((data) => {
            const coords = data.features[0].geometry.coordinates;
            const lngs = coords.map((c) => c[0]);
            const lats = coords.map((c) => c[1]);
            const bounds = [
              [Math.min(...lngs), Math.min(...lats)],
              [Math.max(...lngs), Math.max(...lats)]
            ];
            map.fitBounds(bounds, { padding: 80, duration: 0 });
            overviewCamera = {
              center: map.getCenter(),
              zoom: map.getZoom(),
              pitch: 0,
              bearing: 0
            };
          });
      }
    }

    map.on('style.load', addFlightLayers);

    const animationDuration = 20000;
    // Constant pace matching real-world ground-level (takeoff/landing) speed
    // rather than the classic demo's sped-up cruise pace -- a full SF-London
    // loop at this rate takes several hours, so the scrubber above is the
    // main way to explore the route; playback pace never changes.
    const TIMELAPSE_FACTOR = 0.002;

    let phase = 0;
    let lastFrameTime;
    let routeElevation = 0;

    // The scrubber's displayed clock is fabricated -- flightpath.json has
    // no timestamps, only coordinates + elevation -- mapped linearly onto a
    // plausible SF-London duration, not derived from real timing data.
    const TOTAL_FLIGHT_MINUTES = 10 * 60 + 45;
    function formatDuration(totalMinutes) {
      const h = Math.floor(totalMinutes / 60);
      const m = Math.round(totalMinutes % 60);
      return `${h}h ${String(m).padStart(2, '0')}m`;
    }

    const scrubberInput = document.getElementById('flight-scrubber');
    const scrubberTime = document.getElementById('scrubber-time');
    let isScrubbing = false;
    scrubberInput.addEventListener('pointerdown', () => { isScrubbing = true; });
    window.addEventListener('pointerup', () => { isScrubbing = false; });
    scrubberInput.addEventListener('input', () => {
      phase = Number(scrubberInput.value) / 1000;
    });

    function frame(time) {
      if (!lastFrameTime) lastFrameTime = time;
      const frameDeltaTime = time - lastFrameTime;
      lastFrameTime = time;

      if (!isScrubbing) {
        phase += (frameDeltaTime * TIMELAPSE_FACTOR) / animationDuration;
      }

      if (phase > 1) {
        phase = 0;
        routeElevation = 0;
      }

      const alongRoute = flightRoute.sample(flightRoute.totalLength * phase);
      if (alongRoute) {
        routeElevation = alongRoute.altitude;
        airplane.update(alongRoute, frameDeltaTime);
      }

      updateModelSourceAndFeatureState(map);

      if (cameraMode === 'aircraft' && followingAircraft) {
        updateCameraOrbit(frameDeltaTime);
      }

      if (flightRoute.ready && scrubberInput.disabled) {
        scrubberInput.disabled = false;
      }
      if (!isScrubbing) {
        scrubberInput.value = Math.round(phase * 1000);
      }
      scrubberTime.textContent =
        `${formatDuration(phase * TOTAL_FLIGHT_MINUTES)} / ${formatDuration(TOTAL_FLIGHT_MINUTES)}`;

      window.requestAnimationFrame(frame);
    }

    map.on('load', () => {
      window.requestAnimationFrame(frame);
    });

    map.on('error', (e) => {
      console.error('Map error:', e);
    });
  </script>
</body>

</html>
