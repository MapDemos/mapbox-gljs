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
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Overpass:wght@400;600;700;800&family=Public+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      /* Route Green - MUTCD highway guide-sign green */
      --green: #0E6B3A;
      --green-dark: #0A4C29;
      --green-tint: #E3EEE7;
      /* Reflective sheeting cream */
      --cream: #F6F3EA;
      /* Instrument-cluster asphalt */
      --asphalt: #1C1D1F;
      /* Caution amber / stop red */
      --amber: #F2A900;
      --red: #C8102E;
      --ink: #2A2A28;
      --line: rgba(14, 107, 58, 0.22);

      --font-display: 'Overpass', sans-serif;
      --font-body: 'Public Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      --font-mono: 'IBM Plex Mono', 'Monaco', 'Courier New', monospace;
    }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.001ms !important;
      }
    }
    body {
      margin: 0;
      padding: 0;
      font-family: var(--font-body);
      color: var(--ink);
    }
    button, input, select {
      font-family: inherit;
    }
    :focus-visible {
      outline: 2px solid var(--amber);
      outline-offset: 2px;
    }
    #map {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 380px;
      right: 0;
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
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      background: var(--cream);
      padding: 0 24px 30px;
      border-right: 1px solid var(--line);
      z-index: 1400;
      width: 380px;
      max-width: 85vw;
      box-sizing: border-box;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
    .sheet-handle {
      display: none;
    }
    /* Full-bleed guide-sign header band, escaping the panel's own padding */
    #setup-panel h2 {
      position: relative;
      overflow: hidden;
      margin: 0 -24px 20px;
      padding: 22px 24px 18px;
      background: var(--green);
      color: var(--cream);
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 19px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      line-height: 1.3;
    }
    @media (prefers-reduced-motion: no-preference) {
      #setup-panel h2::after {
        content: '';
        position: absolute;
        top: -50%;
        left: -60%;
        width: 40%;
        height: 200%;
        background: linear-gradient(115deg, transparent, rgba(255,255,255,0.35), transparent);
        transform: rotate(8deg);
        animation: sheen-sweep 1.1s ease-out 0.15s 1;
      }
    }
    @keyframes sheen-sweep {
      from { left: -60%; }
      to { left: 130%; }
    }
    #setup-panel p {
      color: #5B5B57;
      line-height: 1.5;
      font-size: 14px;
      margin-bottom: 15px;
    }
    .input-group {
      margin-bottom: 15px;
    }
    .input-group label {
      display: block;
      margin-bottom: 6px;
      color: var(--green-dark);
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    /* Plain-language caption, not a field name - keep it out of the sign-label treatment */
    label[for="simulation-mode"] {
      display: inline;
      color: var(--ink);
      font-family: var(--font-body);
      font-weight: 500;
      font-size: 14px;
      text-transform: none;
      letter-spacing: normal;
    }
    .input-group label .hint {
      display: block;
      margin-top: 2px;
      color: #8A8A83;
      font-family: var(--font-body);
      font-weight: 400;
      text-transform: none;
      letter-spacing: normal;
    }
    .input-group input,
    .input-group select {
      width: 100%;
      padding: 10px;
      border: 2px solid var(--line);
      border-radius: 4px;
      background: #fff;
      color: var(--ink);
      font-family: var(--font-mono);
      font-size: 13px;
      box-sizing: border-box;
    }
    .input-group select {
      font-family: var(--font-body);
      font-size: 14px;
    }
    .input-group input:focus,
    .input-group select:focus {
      outline: none;
      border-color: var(--green);
    }
    /* Departure / Destination guide-sign cards - the sidebar's one bold move */
    .trip-card {
      background: #fff;
      border: 1px solid var(--line);
      border-left: 4px solid var(--green);
      border-radius: 4px;
      padding: 16px 16px 14px;
      margin-bottom: 20px;
    }
    .trip-card .input-group:last-child {
      margin-bottom: 0;
    }
    .trip-card .input-group label {
      display: inline-block;
      background: var(--green);
      color: var(--cream);
      padding: 3px 9px;
      border-radius: 3px;
      margin-bottom: 10px;
    }
    .trip-card .input-group label .hint {
      display: inline;
      color: rgba(246,243,234,0.8);
      margin-top: 0;
    }
    .trip-card .button-group {
      margin-top: 12px;
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
      border-radius: 5px;
      font-family: var(--font-display);
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      cursor: pointer;
      box-sizing: border-box;
      transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.15s ease;
    }
    .btn-primary {
      background: var(--green);
      color: var(--cream);
      box-shadow: 0 3px 0 var(--green-dark);
    }
    .btn-primary:hover {
      background: #0F7A41;
    }
    .btn-primary:active {
      transform: translateY(3px);
      box-shadow: 0 0 0 var(--green-dark);
    }
    .btn-secondary {
      background: var(--cream);
      color: var(--green-dark);
      border: 2px solid var(--green);
    }
    .btn-secondary:hover {
      background: var(--green-tint);
    }
    .hidden {
      display: none !important;
    }
    .location-status {
      background: #F0EFE8;
      border: 2px solid var(--line);
      border-radius: 4px;
      padding: 15px;
      margin-bottom: 20px;
    }
    .location-status.loading {
      border-color: #00539B;
      background: #E8F0F8;
    }
    .location-status.success {
      border-color: var(--green);
      background: var(--green-tint);
    }
    .location-status.error {
      border-color: var(--red);
      background: #FBE9EB;
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
      font-size: 15px;
      font-weight: 600;
      color: var(--ink);
      flex: 1;
    }
    .status-details {
      font-size: 13px;
      color: #6B6B65;
      margin-top: 8px;
      line-height: 1.5;
      font-family: var(--font-mono);
    }
    .status-details strong {
      color: var(--ink);
      font-family: var(--font-body);
    }
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: none !important;
    }
    .btn-retry {
      margin-top: 10px;
      padding: 8px 16px;
      background: var(--amber);
      color: var(--asphalt);
      border: none;
      border-radius: 4px;
      font-family: var(--font-display);
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      cursor: pointer;
    }
    .btn-retry:hover {
      background: #D99500;
    }

    /* Map Picker Banner - floats over the map without blocking the sidebar or the rest of the map */
    #map-picker-banner {
      position: fixed;
      top: 20px;
      left: calc(380px + 20px);
      right: 70px;
      margin: 0 auto;
      max-width: 420px;
      z-index: 1500;
      background: var(--green);
      color: var(--cream);
      padding: 18px 24px;
      border: 3px solid var(--cream);
      box-shadow: 0 0 0 2px var(--green-dark), 0 10px 40px rgba(0,0,0,0.3);
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 16px;
    }
    #map-picker-banner.hidden {
      display: none !important;
    }
    .map-picker-text {
      flex: 1;
    }
    .map-picker-title {
      font-family: var(--font-display);
      font-size: 15px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 5px;
    }
    .map-picker-subtitle {
      font-size: 14px;
      opacity: 0.9;
    }
    .btn-close-picker {
      background: rgba(255,255,255,0.15);
      border: 2px solid var(--cream);
      color: var(--cream);
      padding: 10px 20px;
      border-radius: 4px;
      font-family: var(--font-display);
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      cursor: pointer;
      white-space: nowrap;
    }
    .btn-close-picker:hover {
      background: rgba(255,255,255,0.28);
    }

    /* Back to Setup Button - styled to match navigation control buttons */
    #back-to-setup-btn {
      position: fixed;
      left: 400px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 1001;
      background: var(--cream);
      color: var(--green-dark);
      border: 2px solid var(--green);
      width: 40px;
      height: 40px;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      pointer-events: auto;
    }
    #back-to-setup-btn.hidden {
      display: none !important;
    }
    #back-to-setup-btn:hover {
      background: var(--green-tint);
    }
    #back-to-setup-btn:active {
      transform: translateY(-50%) scale(0.95);
    }

    /* Debug Panel */
    #debug-panel {
      position: fixed;
      top: 155px;
      right: 10px;
      z-index: 1000;
      background: rgba(28, 29, 31, 0.92);
      color: var(--cream);
      padding: 10px 14px;
      border-radius: 6px;
      font-family: var(--font-mono);
      font-size: 11px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.3);
      pointer-events: auto;
      display: flex;
      gap: 16px;
      align-items: center;
    }
    #debug-panel.hidden {
      display: none !important;
    }
    .debug-item {
      display: flex;
      gap: 6px;
      align-items: center;
      white-space: nowrap;
    }
    .debug-key {
      opacity: 0.7;
      font-size: 11px;
    }
    .debug-value {
      font-weight: 600;
      color: var(--amber);
      font-size: 13px;
    }

    /* Simulation Controls */
    #simulation-controls {
      position: absolute;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
    }
    .sim-panel {
      background: #fff;
      border-radius: 6px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      min-width: 280px;
      overflow: hidden;
    }
    .sim-header {
      background: var(--green);
      color: var(--cream);
      padding: 12px 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .sim-title {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .sim-close {
      background: rgba(255,255,255,0.18);
      border: none;
      color: var(--cream);
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
      font-family: var(--font-mono);
      color: #6B6B65;
    }
    .sim-controls-buttons {
      display: flex;
      gap: 8px;
    }
    .sim-btn {
      flex: 1;
      padding: 6px 8px;
      border: 2px solid var(--line);
      background: #fff;
      color: var(--green-dark);
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .sim-btn:hover {
      background: var(--green-tint);
      border-color: var(--green);
    }
    .sim-btn.active {
      background: var(--green);
      color: var(--cream);
      border-color: var(--green);
    }

    /* Mobile-specific styles */
    @media (max-width: 768px) {
      html, body {
        height: 100%;
        overflow: hidden;
      }
      /* The sidebar becomes a bottom sheet overlay on mobile, not a split - map stays full width */
      #map {
        left: 0;
      }
      #setup-panel {
        left: 0;
        right: 0;
        top: auto;
        bottom: 0;
        padding: 12px 16px 20px;
        width: 100%;
        max-width: 100%;
        max-height: 65vh;
        max-height: 65dvh; /* Use dynamic viewport height for iOS */
        height: auto;
        border-radius: 16px 16px 0 0;
        box-shadow: 0 -4px 24px rgba(0,0,0,0.25);
        transform: none;
        overflow-y: auto;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
        overscroll-behavior: contain;
        transition: transform 0.25s ease;
      }
      #setup-panel.picking-collapsed {
        transform: translateY(calc(100% - 56px));
      }
      .sheet-handle {
        display: block;
        width: 40px;
        height: 4px;
        background: #d1d5db;
        border-radius: 2px;
        margin: 0 auto 12px;
      }
      #setup-panel h2 {
        margin: 0 -16px 12px;
        padding: 16px 16px 12px;
        font-size: 17px;
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
        margin-bottom: 8px;
      }
      .input-group label {
        font-size: 12px;
        margin-bottom: 3px;
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
        padding: 8px;
        margin-bottom: 8px;
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
        gap: 6px;
        margin-top: 8px;
        margin-bottom: 8px;
      }
      .btn {
        padding: 9px;
        font-size: 13px;
      }
      .btn-retry {
        padding: 6px 12px;
        font-size: 12px;
      }
      #map-picker-banner {
        left: 10px;
        right: 10px;
        top: 10px;
        max-width: none;
        padding: 14px 16px;
        gap: 12px;
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
        padding: 4px 6px;
      }
      #back-to-setup-btn {
        left: 5px;
        width: 36px;
        height: 36px;
        font-size: 14px;
      }
      #debug-panel {
        top: 133px;
        right: 5px;
        padding: 8px 10px;
        font-size: 10px;
        gap: 10px;
      }
      .debug-item {
        gap: 5px;
      }
      .debug-key {
        font-size: 9px;
      }
      .debug-value {
        font-size: 11px;
      }
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div id="nav-ui"></div>

  <!-- Back to Setup Button (shown during navigation) -->
  <button id="back-to-setup-btn" class="hidden" onclick="backToSetup()" title="Back to Setup">
    🏠
  </button>

  <!-- Debug Panel -->
  <div id="debug-panel" class="hidden">
    <div class="debug-item">
      <span class="debug-key">Directions:</span>
      <span class="debug-value" id="directions-api-count">0</span>
    </div>
    <div class="debug-item">
      <span class="debug-key">Map Matching:</span>
      <span class="debug-value" id="mapmatching-api-count">0</span>
    </div>
  </div>

  <div id="setup-panel">
    <div class="sheet-handle"></div>
    <h2>🧭 Turn-by-Turn Navigation</h2>
    <p class="intro-text">Set a departure and destination, then start navigation. Your current location is used as the departure point unless you set one.</p>

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

    <div class="trip-card">
      <div class="input-group">
        <label>Departure <span class="hint">(optional — defaults to your location)</span></label>
        <input type="text" id="departure-input" placeholder="e.g., 139.7671,35.6812 (defaults to your location)">
      </div>

      <div class="button-group">
        <button class="btn btn-secondary" style="flex: 1;" onclick="openMapPicker('departure')">
          🗺️ Pick on Map
        </button>
        <button class="btn btn-secondary" style="flex: 1;" onclick="useMyLocationAsDeparture()">
          📍 Use My Location
        </button>
      </div>
    </div>

    <div class="trip-card">
      <div class="input-group">
        <label>Destination</label>
        <input type="text" id="destination-input" placeholder="e.g., 139.7671,35.6812 (Tokyo Station)">
      </div>

      <div class="button-group">
        <button class="btn btn-secondary" style="flex: 1;" onclick="openMapPicker('destination')">
          🗺️ Pick on Map
        </button>
        <button class="btn btn-secondary" id="nearby-btn" onclick="useCurrentLocationAsDestination()" disabled>
          📍 Nearby
        </button>
      </div>

      <div class="input-group" style="margin-top: 12px; margin-bottom: 0;">
        <label>Or use quick examples</label>
        <select id="example-destinations">
          <option value="">Select a destination...</option>
          <option value="139.7671,35.6812">Tokyo Station</option>
          <option value="-122.4194,37.7749">San Francisco</option>
          <option value="-0.1276,51.5074">London</option>
          <option value="2.3522,48.8566">Paris</option>
          <option value="-74.0060,40.7128">New York</option>
        </select>
      </div>
    </div>

    <div class="input-group">
      <label>Navigation Profile</label>
      <select id="profile-select">
        <option value="mapbox.tmp.valhalla-zenrin/driving-traffic">🚗 Driving (with traffic)</option>
        <option value="mapbox.tmp.valhalla-zenrin/walking">🚶 Walking</option>
        <option value="mapbox.tmp.valhalla-zenrin/cycling">🚴 Cycling</option>
      </select>
    </div>

    <div class="input-group">
      <label>Language</label>
      <select id="language-select">
        <option value="en">🇺🇸 English</option>
        <option value="ja">🇯🇵 Japanese</option>
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

  <!-- Map Picker Banner (floats over the map; the map stays visible and clickable) -->
  <div id="map-picker-banner" class="hidden">
    <div class="map-picker-text">
      <div class="map-picker-title">📍 Tap the map</div>
      <div class="map-picker-subtitle" id="map-picker-subtitle">Select your destination</div>
    </div>
    <button class="btn-close-picker" onclick="closeMapPicker()">✕ Cancel</button>
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
    {% include navigation-location.js %}
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
      language: 'en'
    });

    let navigation;
    let navigationUI;
    let userLocation = null;
    let userMarker = null;
    let locationAccuracy = null;
    let destinationMarker = null;
    let customDeparture = null;
    let departureMarker = null;
    let isMapPickerMode = false;
    let mapPickerTarget = 'destination';

    // Simulation variables
    let simulationMode = false;
    let simulationCoordinates = [];
    let simulationRouteLine = null; // Turf LineString for route
    let simulationRouteLength = 0; // Total route length in meters

    // Debug variables
    let debugUpdateInterval = null;
    let simulationIndex = 0;
    let simulationAnimationFrame = null; // For requestAnimationFrame
    let simulationSpeed = 1; // 1x speed
    let simulationPaused = false;
    let lastSimulationTime = 0; // For speed control
    let simulationAccumulator = 0; // Accumulate time to process coords
    let lastCameraUpdate = 0; // Throttle camera updates for smooth easeTo

    // Puck interpolation state (distance-based with turf.along)
    let puckInterpolation = {
      distanceTraveled: 0,      // Current distance along route (meters)
      targetDistance: 0,        // Target distance for current coordinate
      startDistance: 0,         // Distance when started interpolating to target
      startTime: 0,             // When interpolation started
      duration: 1000,           // How long to take (ms)
      initialized: false        // Track if first coordinate set
    };

    // Navigation state tracking
    let wasNavigating = false;
    let navigationStateMonitor = null;

    // Helper function to calculate bearing between two points
    function calculateBearing(lat1, lng1, lat2, lng2) {
      const φ1 = lat1 * Math.PI / 180;
      const φ2 = lat2 * Math.PI / 180;
      const Δλ = (lng2 - lng1) * Math.PI / 180;

      const y = Math.sin(Δλ) * Math.cos(φ2);
      const x = Math.cos(φ1) * Math.sin(φ2) -
                Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

      const θ = Math.atan2(y, x);
      let bearing = θ * 180 / Math.PI;
      bearing = (bearing + 360) % 360;
      return bearing;
    }

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
      console.log('🎬 Route geometry:', route.geometry);
      console.log('🎬 First 3 coordinates:', simulationCoordinates.slice(0, 3));
      console.log('🎬 Coordinate type check:', typeof simulationCoordinates[0], simulationCoordinates[0]);

      simulationIndex = 0;
      simulationPaused = false;
      lastSimulationTime = performance.now();
      simulationAccumulator = 0;
      lastCameraUpdate = 0; // Reset so first camera update happens immediately

      // Pre-calculate route line for turf.along interpolation
      console.log('🎬 Creating lineString with', simulationCoordinates.length, 'coordinates');
      simulationRouteLine = turf.lineString(simulationCoordinates);
      console.log('🎬 Created simulationRouteLine:', simulationRouteLine);
      console.log('🎬 simulationRouteLine.geometry:', simulationRouteLine.geometry);
      console.log('🎬 simulationRouteLine.geometry.coordinates length:', simulationRouteLine.geometry.coordinates.length);
      console.log('🎬 First coord in simulationRouteLine:', simulationRouteLine.geometry.coordinates[0]);
      simulationRouteLength = turf.length(simulationRouteLine, { units: 'meters' });
      console.log(`🎬 Route length: ${simulationRouteLength.toFixed(0)}m with ${simulationCoordinates.length} coordinates`);

      // Reset puck interpolation state
      puckInterpolation.distanceTraveled = 0;
      puckInterpolation.targetDistance = 0;
      puckInterpolation.startDistance = 0;
      puckInterpolation.initialized = false;

      // Stop real GPS tracking to prevent conflicts
      if (navigation && navigation.watchId) {
        navigator.geolocation.clearWatch(navigation.watchId);
        navigation.watchId = null;
        console.log('🎬 Stopped real GPS tracking for simulation');
      }

      // Show simulation controls
      document.getElementById('simulation-controls').classList.remove('hidden');

      // Set play/pause button to show "Pause" since simulation is starting
      const playPauseBtn = document.getElementById('sim-play-pause');
      if (playPauseBtn) {
        playPauseBtn.textContent = '⏸️ Pause';
        playPauseBtn.classList.add('active');
      }

      updateSimulationUI();

      console.log(`🎬 Starting simulation with ${simulationCoordinates.length} points`);

      // Start the requestAnimationFrame loop
      runSimulationLoop();
    }

    function runSimulationLoop(currentTime) {
      // Check if should continue
      if (simulationPaused || !simulationMode) {
        simulationAnimationFrame = null;
        return;
      }

      // Check if navigation is still active
      if (!navigation || !navigation.state || !navigation.state.isNavigating) {
        console.log('🎬 Navigation stopped, ending simulation');
        stopSimulation();
        return;
      }

      // Handle first call where currentTime might be undefined
      if (!currentTime) {
        currentTime = performance.now();
      }

      // INTERPOLATE PUCK ALONG ROUTE (every frame for smooth movement)
      if (puckInterpolation.initialized && simulationRouteLine) {
        try {
          const elapsed = currentTime - puckInterpolation.startTime;
          const t = Math.min(1, elapsed / puckInterpolation.duration);

          // Interpolate distance traveled
          puckInterpolation.distanceTraveled =
            puckInterpolation.startDistance +
            (puckInterpolation.targetDistance - puckInterpolation.startDistance) * t;

          // Debug: check simulationRouteLine validity
          if (!simulationRouteLine.geometry || !simulationRouteLine.geometry.coordinates || simulationRouteLine.geometry.coordinates.length < 2) {
            console.error('🎬 Invalid simulationRouteLine:', simulationRouteLine);
            return;
          }

          const distanceInKm = puckInterpolation.distanceTraveled / 1000;

          // Debug: log the values being used
          if (isNaN(distanceInKm) || distanceInKm < 0 || distanceInKm > simulationRouteLength / 1000) {
            console.error('🎬 Invalid distance for turf.along:', {
              distanceTraveled: puckInterpolation.distanceTraveled,
              distanceInKm: distanceInKm,
              routeLengthKm: simulationRouteLength / 1000,
              startDistance: puckInterpolation.startDistance,
              targetDistance: puckInterpolation.targetDistance,
              t: t,
              elapsed: elapsed,
              duration: puckInterpolation.duration
            });
            return;
          }

          // Get point along route at this distance
          const pointOnRoute = turf.along(
            simulationRouteLine,
            distanceInKm,
            { units: 'kilometers' }
          );

          if (!pointOnRoute || !pointOnRoute.geometry || !pointOnRoute.geometry.coordinates) {
            console.error('🎬 Invalid pointOnRoute from turf.along at distance', puckInterpolation.distanceTraveled);
            return;
          }

          // Update puck position (perfectly follows route!)
          if (navigation && navigation.puckController && navigation.puckController.puckMarker) {
            navigation.puckController.puckMarker.setLngLat(pointOnRoute.geometry.coordinates);

            // Calculate bearing from route direction
            // Get a point slightly ahead to calculate bearing
            const lookAheadDistance = Math.min(
              puckInterpolation.distanceTraveled + 10, // 10m ahead
              simulationRouteLength
            );
            const aheadPoint = turf.along(
              simulationRouteLine,
              lookAheadDistance / 1000,
              { units: 'kilometers' }
            );

            if (aheadPoint && aheadPoint.geometry && aheadPoint.geometry.coordinates) {
              const bearing = calculateBearing(
                pointOnRoute.geometry.coordinates[1],
                pointOnRoute.geometry.coordinates[0],
                aheadPoint.geometry.coordinates[1],
                aheadPoint.geometry.coordinates[0]
              );

              if (bearing !== null && !isNaN(bearing)) {
                navigation.puckController.puckMarker.setRotation(bearing);
              }
            }
          }
        } catch (error) {
          console.error('🎬 Error interpolating puck:', error);
        }
      }

      // Calculate time since last frame
      const deltaTime = currentTime - lastSimulationTime;
      lastSimulationTime = currentTime;

      // Accumulate time (in seconds) scaled by speed
      // At 1x: 1 coord per second, At 10x: 10 coords per second
      simulationAccumulator += (deltaTime / 1000) * simulationSpeed;

      // Process 1 coordinate for each full second accumulated
      let coordsToProcess = Math.floor(simulationAccumulator);
      simulationAccumulator -= coordsToProcess; // Keep remainder for next frame

      // Process coordinates (sets interpolation targets)
      for (let i = 0; i < coordsToProcess; i++) {
        if (simulationIndex >= simulationCoordinates.length) {
          // At end, keep feeding last coordinate
          processSimulationCoordinate(simulationCoordinates.length - 1, true);
          break;
        } else {
          processSimulationCoordinate(simulationIndex, false);
          simulationIndex++;
        }
      }

      updateSimulationUI();

      // Continue loop
      simulationAnimationFrame = requestAnimationFrame(runSimulationLoop);
    }

    function processSimulationCoordinate(index, isEnd) {
      try {
        const coord = simulationCoordinates[index];

        if (!coord || coord.length !== 2) {
          console.error(`🎬 Invalid coordinate at index ${index}:`, coord);
          return;
        }

        // Calculate distance to this coordinate along the route
        let distanceToThisCoord = 0;

        // Special case: first coordinate is at distance 0
        if (index === 0) {
          distanceToThisCoord = 0;
        } else {
          // Need at least 2 points for a line
          const coordSlice = simulationCoordinates.slice(0, index + 1);
          console.log(`🎬 Coord ${index}: creating line with ${coordSlice.length} points`);
          const coordLine = turf.lineString(coordSlice);
          distanceToThisCoord = turf.length(coordLine, { units: 'meters' });
          console.log(`🎬 Distance to coord ${index}: ${distanceToThisCoord.toFixed(2)}m`);
        }

      // Initialize on first coordinate
      if (!puckInterpolation.initialized) {
        puckInterpolation.distanceTraveled = 0;
        puckInterpolation.startDistance = 0;
        puckInterpolation.targetDistance = 0;
        puckInterpolation.initialized = true;

        // Set puck to start position immediately
        if (navigation && navigation.puckController && navigation.puckController.puckMarker) {
          navigation.puckController.puckMarker.setLngLat([coord[0], coord[1]]);
        }
        console.log(`🎬 Initialized puck at start`);
      }

      // Set as interpolation target
      puckInterpolation.startDistance = puckInterpolation.distanceTraveled;
      puckInterpolation.targetDistance = distanceToThisCoord;
      puckInterpolation.startTime = performance.now();
      puckInterpolation.duration = 1000 / simulationSpeed; // Match simulation speed

      // Calculate bearing from route direction (look ahead 10m)
      let bearing = 0;
      if (simulationRouteLine && distanceToThisCoord < simulationRouteLength) {
        try {
          const lookAheadDistance = Math.min(
            distanceToThisCoord + 10, // 10m ahead
            simulationRouteLength
          );

          console.log(`🎬 Calculating bearing at ${distanceToThisCoord.toFixed(2)}m, lookahead ${lookAheadDistance.toFixed(2)}m, route length ${simulationRouteLength.toFixed(2)}m`);

          const currentPoint = turf.along(
            simulationRouteLine,
            distanceToThisCoord / 1000,
            { units: 'kilometers' }
          );

          if (!currentPoint || !currentPoint.geometry || !currentPoint.geometry.coordinates) {
            console.error('🎬 Invalid currentPoint from turf.along:', currentPoint);
            return;
          }

          const aheadPoint = turf.along(
            simulationRouteLine,
            lookAheadDistance / 1000,
            { units: 'kilometers' }
          );

          if (!aheadPoint || !aheadPoint.geometry || !aheadPoint.geometry.coordinates) {
            console.error('🎬 Invalid aheadPoint from turf.along:', aheadPoint);
            return;
          }

          bearing = calculateBearing(
            currentPoint.geometry.coordinates[1],
            currentPoint.geometry.coordinates[0],
            aheadPoint.geometry.coordinates[1],
            aheadPoint.geometry.coordinates[0]
          );

          console.log(`🎬 Calculated bearing: ${bearing.toFixed(2)}°`);
        } catch (error) {
          console.error('🎬 Error calculating bearing:', error);
        }
      }

      // Update camera with smooth easeTo (throttled to avoid too many calls)
      if (navigation && navigation.config.cameraFollowEnabled) {
        const now = performance.now();
        const CAMERA_UPDATE_INTERVAL = 300; // ms - update camera ~3 times per second

        if (now - lastCameraUpdate > CAMERA_UPDATE_INTERVAL) {
          // Mark as programmatic movement to avoid triggering user interaction handlers
          navigation.state.isProgrammaticMovement = true;

          navigation.map.easeTo({
            center: [coord[0], coord[1]],
            bearing: bearing,
            pitch: navigation.config.cameraPitch || 60,
            zoom: navigation.config.cameraZoom || 17,
            duration: 500, // Fixed smooth duration
            essential: false // Allow user to interrupt
          });

          // Clear programmatic flag after animation duration
          setTimeout(() => {
            navigation.state.isProgrammaticMovement = false;
          }, 600); // Slightly longer than animation duration

          lastCameraUpdate = now;
        }
      }

      // Update navigation state synchronously
      const userLocation = { lng: coord[0], lat: coord[1] };
      navigation.state.userLocation = userLocation;
      navigation.state.processedLocation = userLocation;

      // Calculate progress
      if (navigation._calculateProgress) {
        navigation._calculateProgress(userLocation);
      }

      // Check instruction advancement
      if (navigation._checkInstructionAdvancement) {
        navigation._checkInstructionAdvancement();
      }

      // Check off-route (use raw GPS as before)
      if (navigation._checkDistanceFromRoute) {
        const distanceFromRoute = navigation._checkDistanceFromRoute(userLocation);
        const thresholds = navigation._getOffRouteThresholds();

        if (distanceFromRoute > thresholds.immediateReroute) {
          if (!navigation.state.isOffRoute) {
            navigation._handleOffRoute();
          }
          navigation.state.isOffRoute = true;
        } else {
          navigation.state.isOffRoute = false;
        }
      }

      // Emit progress update
      navigation._emit('onProgressUpdate', {
        location: userLocation,
        processedLocation: userLocation,
        currentStep: navigation.state.currentStep,
        distanceToNextStep: navigation.state.distanceToNextStep,
        distanceRemaining: navigation.state.distanceRemaining,
        durationRemaining: navigation.state.durationRemaining,
        isOffRoute: navigation.state.isOffRoute
      });
      } catch (error) {
        console.error(`🎬 Error processing coordinate ${index}:`, error);
        console.error('🎬 Stack trace:', error.stack);
      }
    }

    function toggleSimulation() {
      simulationPaused = !simulationPaused;
      const btn = document.getElementById('sim-play-pause');

      if (simulationPaused) {
        btn.textContent = '▶️ Play';
        btn.classList.remove('active');
        // Cancel animation frame when paused
        if (simulationAnimationFrame) {
          cancelAnimationFrame(simulationAnimationFrame);
          simulationAnimationFrame = null;
        }
      } else {
        btn.textContent = '⏸️ Pause';
        btn.classList.add('active');
        // Resume animation loop
        lastSimulationTime = performance.now();
        simulationAccumulator = 0; // Reset accumulator on resume
        lastCameraUpdate = 0; // Reset camera throttle on resume
        runSimulationLoop();
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

      // Speed change takes effect immediately on next frame (no coordination needed!)
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

      // Cancel animation frame
      if (simulationAnimationFrame) {
        cancelAnimationFrame(simulationAnimationFrame);
        simulationAnimationFrame = null;
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
    function openMapPicker(target) {
      isMapPickerMode = true;
      mapPickerTarget = target || 'destination';
      // Sidebar/sheet stays visible - the map remains clickable alongside it
      document.getElementById('map-picker-banner').classList.remove('hidden');
      document.getElementById('map-picker-subtitle').textContent =
        mapPickerTarget === 'departure' ? 'Select your departure point' : 'Select your destination';

      // On mobile the panel is a bottom sheet that covers a lot of the map - collapse it
      // down to a peek strip while picking so there's room to tap the map
      if (window.matchMedia('(max-width: 768px)').matches) {
        document.getElementById('setup-panel').classList.add('picking-collapsed');
      }

      console.log('📍 Map picker mode activated for', mapPickerTarget);
    }

    function closeMapPicker() {
      isMapPickerMode = false;
      document.getElementById('map-picker-banner').classList.add('hidden');
      document.getElementById('setup-panel').classList.remove('picking-collapsed');
      console.log('📍 Map picker mode closed');
    }

    // Set destination marker + input from a lng/lat pair
    function setDestinationPoint(lng, lat) {
      document.getElementById('destination-input').value = `${lng.toFixed(6)},${lat.toFixed(6)}`;

      if (destinationMarker) {
        destinationMarker.remove();
      }

      destinationMarker = new mapboxgl.Marker({
        color: '#C8102E',
        scale: 1.2
      })
        .setLngLat([lng, lat])
        .setPopup(new mapboxgl.Popup().setHTML(
          `<strong>Destination</strong><br>
           ${lng.toFixed(6)}, ${lat.toFixed(6)}`
        ))
        .addTo(map);

      console.log('📍 Destination set:', lng.toFixed(6), lat.toFixed(6));
      return destinationMarker;
    }

    // Set departure marker + input from a lng/lat pair (overrides live GPS location as nav origin)
    function setDeparturePoint(lng, lat) {
      customDeparture = { lng, lat };
      document.getElementById('departure-input').value = `${lng.toFixed(6)},${lat.toFixed(6)}`;

      if (departureMarker) {
        departureMarker.remove();
      }

      departureMarker = new mapboxgl.Marker({
        color: '#0E6B3A',
        scale: 1.2
      })
        .setLngLat([lng, lat])
        .setPopup(new mapboxgl.Popup().setHTML(
          `<strong>Departure Point</strong><br>
           ${lng.toFixed(6)}, ${lat.toFixed(6)}`
        ))
        .addTo(map);

      // Custom departure overrides the live location marker as the nav starting point
      if (userMarker) {
        userMarker.remove();
        userMarker = null;
      }

      // Allow starting navigation even if geolocation hasn't resolved yet
      startBtn.disabled = false;
      startBtn.textContent = 'Start Navigation';

      console.log('🚩 Departure set:', lng.toFixed(6), lat.toFixed(6));
      return departureMarker;
    }

    // Reset departure back to the user's live location
    function useMyLocationAsDeparture() {
      customDeparture = null;
      document.getElementById('departure-input').value = '';

      if (departureMarker) {
        departureMarker.remove();
        departureMarker = null;
      }

      if (userLocation && !userMarker) {
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
      }

      if (!userLocation && !document.getElementById('simulation-mode').checked) {
        startBtn.disabled = true;
        startBtn.textContent = '⏳ Waiting for location...';
      }

      console.log('📍 Departure reset to current location');
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

        // Update puck controller profile settings
        if (navigation.puckController) {
          navigation.puckController.config.navigationProfile = e.target.value;
          navigation.puckController._applyProfileSettings();
          console.log('📝 Puck controller profile updated');
        }
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
        startBtn.textContent = 'Start Navigation';
        console.log('🎬 Simulation mode enabled - location not required');
      } else {
        // Normal mode, check if location is available
        if (userLocation || customDeparture) {
          startBtn.disabled = false;
          startBtn.textContent = 'Start Navigation';
        } else {
          startBtn.disabled = true;
          startBtn.textContent = '⏳ Waiting for location...';
        }
      }
    });

    // Handle manual departure coordinate entry
    document.getElementById('departure-input').addEventListener('change', (e) => {
      const val = e.target.value.trim();

      if (!val) {
        useMyLocationAsDeparture();
        return;
      }

      const [lng, lat] = val.split(',').map(s => parseFloat(s.trim()));
      if (!isNaN(lng) && !isNaN(lat)) {
        setDeparturePoint(lng, lat);
        map.flyTo({ center: [lng, lat], zoom: 13, duration: 1000 });
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
            color: '#C8102E',
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

    // Monitor navigation state to show back button when navigation stops
    function startNavigationStateMonitoring() {
      // Clear any existing monitor
      if (navigationStateMonitor) {
        clearInterval(navigationStateMonitor);
      }

      navigationStateMonitor = setInterval(() => {
        const isNavigating = navigation && navigation.state && navigation.state.isNavigating;

        // Detect transition from navigating to not navigating
        if (wasNavigating && !isNavigating) {
          console.log('📍 Navigation stopped - showing back button');
          const backBtn = document.getElementById('back-to-setup-btn');
          backBtn.classList.remove('hidden');
          backBtn.style.display = 'flex';

          // Stop monitoring after showing button
          clearInterval(navigationStateMonitor);
          navigationStateMonitor = null;
        }

        wasNavigating = isNavigating;
      }, 500); // Check every 500ms
    }

    function stopNavigationStateMonitoring() {
      if (navigationStateMonitor) {
        clearInterval(navigationStateMonitor);
        navigationStateMonitor = null;
      }
      wasNavigating = false;
    }

    // Debug panel update functions
    function startDebugUpdate() {
      // Show debug panel
      const debugPanel = document.getElementById('debug-panel');
      debugPanel.classList.remove('hidden');

      // Clear any existing interval
      if (debugUpdateInterval) {
        clearInterval(debugUpdateInterval);
      }

      // Update every 500ms
      debugUpdateInterval = setInterval(() => {
        if (navigation) {
          const stats = navigation.getDebugStats();
          document.getElementById('directions-api-count').textContent = stats.api.directions;
          document.getElementById('mapmatching-api-count').textContent = stats.api.mapMatching;
        }
      }, 500);
    }

    function stopDebugUpdate() {
      // Hide debug panel
      const debugPanel = document.getElementById('debug-panel');
      debugPanel.classList.add('hidden');

      // Clear interval
      if (debugUpdateInterval) {
        clearInterval(debugUpdateInterval);
        debugUpdateInterval = null;
      }
    }

    // Back to setup screen
    function backToSetup() {
      console.log('🔙 Returning to setup screen');

      // Stop navigation state monitoring
      stopNavigationStateMonitoring();

      // Stop debug updates
      stopDebugUpdate();

      // Stop navigation
      if (navigation) {
        navigation.stopNavigation();
      }

      // Stop simulation
      stopSimulation();

      // Hide navigation UI
      if (navigationUI) {
        navigationUI.hide();
      }

      // Hide back button
      const backBtn = document.getElementById('back-to-setup-btn');
      backBtn.classList.add('hidden');
      backBtn.style.display = 'none';

      // Restore departure/location marker if available
      if (customDeparture && !departureMarker) {
        departureMarker = new mapboxgl.Marker({
          color: '#0E6B3A',
          scale: 1.2
        })
          .setLngLat([customDeparture.lng, customDeparture.lat])
          .setPopup(new mapboxgl.Popup().setHTML(
            `<strong>Departure Point</strong><br>
             ${customDeparture.lng.toFixed(6)}, ${customDeparture.lat.toFixed(6)}`
          ))
          .addTo(map);
      } else if (userLocation && !userMarker && !customDeparture) {
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
      }

      // Reset camera
      map.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 1000
      });
    }

    // Start navigation
    async function startNavigation() {
      // Reset debug counters at the start
      if (navigation) {
        navigation.resetDebugStats();
      }

      const destInput = document.getElementById('destination-input').value.trim();
      const isSimulationMode = document.getElementById('simulation-mode').checked;

      if (!destInput) {
        updateLocationStatus('error', 'Destination required',
          'Please enter a destination or select from examples.<br>' +
          '<button class="btn-retry" onclick="document.getElementById(\'destination-input\').focus()">📍 Enter Destination</button>');
        return;
      }

      // In simulation mode, use map center as starting point if no location or custom departure
      if (!userLocation && !customDeparture && !isSimulationMode) {
        updateLocationStatus('error', 'Location not available',
          'Please wait for location to be obtained, set a departure point, or try again.<br>' +
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

        // Precedence: explicit departure point > live user location > map center (simulation fallback)
        const origin = customDeparture || userLocation || { lng: map.getCenter().lng, lat: map.getCenter().lat };

        // Remove departure/user markers (navigation will handle showing the puck)
        if (departureMarker) {
          departureMarker.remove();
          departureMarker = null;
        }
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

        // Set simulation mode (syncs both navigation and puck controller)
        navigation.setSimulationMode(simulationMode);

        // Prime speech synthesis for iOS (must be done from user interaction)
        navigation.primeSpeechSynthesis();

        // Show navigation UI
        navigationUI.show();

        // Start navigation
        await navigation.startNavigation(origin, destination);

        // Start monitoring navigation state to show back button when it stops
        wasNavigating = true;
        startNavigationStateMonitoring();

        // Start debug panel updates
        startDebugUpdate();

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
        const backBtn = document.getElementById('back-to-setup-btn');
        backBtn.classList.add('hidden');
        backBtn.style.display = 'none';
        stopNavigationStateMonitoring();
        stopDebugUpdate();
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
        color: '#C8102E',
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
      destInput.style.borderColor = '#0E6B3A';
      destInput.style.backgroundColor = '#E3EEE7';
      setTimeout(() => {
        destInput.style.borderColor = '';
        destInput.style.backgroundColor = '';
      }, 1000);
    }

    // Allow clicking on map to set departure or destination
    map.on('click', (e) => {
      const isNavigating = navigation && navigation.state && navigation.state.isNavigating;

      // Check if in map picker mode, or setting up (not yet navigating)
      if (isMapPickerMode || !isNavigating) {
        const lng = e.lngLat.lng;
        const lat = e.lngLat.lat;

        // Outside of explicit map-picker mode, plain clicks always set the destination
        const target = isMapPickerMode ? mapPickerTarget : 'destination';
        const marker = target === 'departure' ? setDeparturePoint(lng, lat) : setDestinationPoint(lng, lat);

        // If in map picker mode, show confirmation and close picker
        if (isMapPickerMode) {
          marker.togglePopup();
          setTimeout(() => {
            if (marker.getPopup().isOpen()) {
              marker.togglePopup();
            }
            closeMapPicker();
          }, 1500);
        } else {
          // Normal mode - show popup briefly
          marker.togglePopup();
          setTimeout(() => {
            if (marker.getPopup().isOpen()) {
              marker.togglePopup();
            }
          }, 2000);

          // Visual feedback on input field
          const inputId = target === 'departure' ? 'departure-input' : 'destination-input';
          const targetInput = document.getElementById(inputId);
          const color = target === 'departure' ? '#0E6B3A' : '#C8102E';
          const bg = target === 'departure' ? '#E3EEE7' : '#FBE9EB';
          targetInput.style.borderColor = color;
          targetInput.style.backgroundColor = bg;
          setTimeout(() => {
            targetInput.style.borderColor = '';
            targetInput.style.backgroundColor = '';
          }, 1000);
        }
      }
    });
  </script>
</body>
</html>
