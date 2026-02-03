---
layout: default
title: Navigation Trace Visualization
---

<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Navigation Trace Visualization - Raw vs Map-Matched</title>
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
      font-size: 18px;
      color: #333;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .info-panel p {
      margin: 0 0 15px 0;
      font-size: 14px;
      color: #666;
      line-height: 1.4;
    }
    .sample-files {
      margin-bottom: 15px;
    }
    .sample-files-title {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .sample-file-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      margin-bottom: 15px;
    }
    .sample-file-btn {
      padding: 12px;
      border: 2px solid #e5e7eb;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: left;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .sample-file-btn:hover {
      background: #f8f9fa;
      border-color: #3b82f6;
      transform: translateX(2px);
    }
    .sample-file-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .sample-file-route {
      font-size: 13px;
      font-weight: 600;
      color: #374151;
    }
    .sample-file-device {
      font-size: 11px;
      color: #6b7280;
    }
    .sample-file-icon {
      font-size: 18px;
    }
    .upload-section {
      background: #f8f9fa;
      border: 2px dashed #dee2e6;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin-bottom: 15px;
      transition: all 0.3s;
      cursor: pointer;
    }
    .upload-section:hover {
      background: #e9ecef;
      border-color: #adb5bd;
    }
    .upload-section.dragover {
      background: #e3f2fd;
      border-color: #2196f3;
    }
    .upload-icon {
      font-size: 32px;
      margin-bottom: 10px;
    }
    .upload-text {
      font-size: 14px;
      color: #495057;
      margin-bottom: 8px;
      font-weight: 500;
    }
    .upload-hint {
      font-size: 12px;
      color: #6c757d;
    }
    .file-input {
      display: none;
    }
    .stats-box {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
      margin-top: 15px;
    }
    .stats-title {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .stat-item {
      background: white;
      padding: 10px;
      border-radius: 6px;
      border: 1px solid #e5e7eb;
    }
    .stat-label {
      font-size: 11px;
      color: #9ca3af;
      margin-bottom: 4px;
    }
    .stat-value {
      font-size: 16px;
      font-weight: 600;
      color: #374151;
    }
    .stat-value.raw {
      color: #ef4444;
    }
    .stat-value.matched {
      color: #10b981;
    }
    .controls-section {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #e5e7eb;
    }
    .toggle-group {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }
    .toggle-btn {
      flex: 1;
      padding: 10px;
      border: 2px solid #e5e7eb;
      background: white;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      text-align: center;
      line-height: 1.3;
    }
    .toggle-btn span {
      display: inline-block;
    }
    .toggle-btn:hover {
      background: #f8f9fa;
    }
    .toggle-btn.active {
      border-color: #3b82f6;
      background: #eff6ff;
      color: #3b82f6;
    }
    .toggle-btn.active.raw {
      border-color: #ef4444;
      background: #fef2f2;
      color: #ef4444;
    }
    .toggle-btn.active.matched {
      border-color: #10b981;
      background: #ecfdf5;
      color: #10b981;
    }
    .match-button {
      margin-top: 12px;
    }
    .selection-mode-btn {
      background: #6366f1;
      color: white;
      margin-bottom: 12px;
    }
    .selection-mode-btn.active {
      background: #4f46e5;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
    }
    .selection-info {
      background: #fef3c7;
      border: 1px solid #fbbf24;
      border-radius: 6px;
      padding: 10px;
      margin-bottom: 12px;
      font-size: 12px;
      color: #92400e;
    }
    .btn {
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      width: 100%;
      justify-content: center;
    }
    .btn-primary {
      background: #3b82f6;
      color: white;
    }
    .btn-primary:hover {
      background: #2563eb;
    }
    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
      margin-top: 8px;
    }
    .btn-secondary:hover {
      background: #e5e7eb;
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
    .legend-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .legend-line {
      width: 24px;
      height: 3px;
      border-radius: 2px;
    }
    .session-info {
      background: #f0f9ff;
      border: 1px solid #bae6fd;
      border-radius: 6px;
      padding: 10px;
      margin-top: 12px;
      font-size: 12px;
    }
    .session-info-title {
      font-weight: 600;
      color: #0c4a6e;
      margin-bottom: 4px;
    }
    .session-info-detail {
      color: #0369a1;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 11px;
    }
    .spinner {
      display: inline-block;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Processing overlay */
    .processing-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.95);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      flex-direction: column;
      gap: 20px;
    }
    .processing-overlay.active {
      display: flex;
    }
    .processing-spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    .processing-text {
      font-size: 16px;
      color: #374151;
      font-weight: 500;
    }

    /* Mobile responsive */
    @media (max-width: 640px) {
      .info-panel {
        left: 10px;
        right: 10px;
        max-width: none;
      }
      .legend {
        bottom: 10px;
        right: 10px;
        font-size: 11px;
      }
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div id="map"></div>

  <div class="processing-overlay" id="processing-overlay">
    <div class="processing-spinner"></div>
    <div class="processing-text">Processing navigation trace...</div>
  </div>

  <div class="info-panel">
    <h2>
      <span>🗺️</span>
      Navigation Trace Viewer
    </h2>
    <p>Select a sample trace or upload your own NavigationTrace CSV file.</p>

    <div class="sample-files" id="sample-files">
      <div class="sample-files-title">Sample Navigation Traces</div>
      <div class="sample-file-grid">
        <button class="sample-file-btn" onclick="loadSampleFile('Kugahara→Ueno_phone')">
          <div class="sample-file-info">
            <span class="sample-file-route">Kugahara → Ueno</span>
            <span class="sample-file-device">📱 Phone</span>
          </div>
          <span class="sample-file-icon">→</span>
        </button>
        <button class="sample-file-btn" onclick="loadSampleFile('kugahara→Ueno_tablet')">
          <div class="sample-file-info">
            <span class="sample-file-route">Kugahara → Ueno</span>
            <span class="sample-file-device">📱 Tablet</span>
          </div>
          <span class="sample-file-icon">→</span>
        </button>
        <button class="sample-file-btn" onclick="loadSampleFile('Ueno→Nakano_tablet')">
          <div class="sample-file-info">
            <span class="sample-file-route">Ueno → Nakano</span>
            <span class="sample-file-device">📱 Tablet</span>
          </div>
          <span class="sample-file-icon">→</span>
        </button>
        <button class="sample-file-btn" onclick="loadSampleFile('Nakano→Aqualine_tablet')">
          <div class="sample-file-info">
            <span class="sample-file-route">Nakano → Aqualine</span>
            <span class="sample-file-device">📱 Tablet</span>
          </div>
          <span class="sample-file-icon">→</span>
        </button>
        <button class="sample-file-btn" onclick="loadSampleFile('Ebisu→Kugahara_phone')">
          <div class="sample-file-info">
            <span class="sample-file-route">Ebisu → Kugahara</span>
            <span class="sample-file-device">📱 Phone</span>
          </div>
          <span class="sample-file-icon">→</span>
        </button>
        <button class="sample-file-btn" onclick="loadSampleFile('Ebisu→Kugahara_tablet')">
          <div class="sample-file-info">
            <span class="sample-file-route">Ebisu → Kugahara</span>
            <span class="sample-file-device">📱 Tablet</span>
          </div>
          <span class="sample-file-icon">→</span>
        </button>
        <button class="sample-file-btn" onclick="loadSampleFile('Aqualine→Ebisu_phone')">
          <div class="sample-file-info">
            <span class="sample-file-route">Aqualine → Ebisu</span>
            <span class="sample-file-device">📱 Phone</span>
          </div>
          <span class="sample-file-icon">→</span>
        </button>
        <button class="sample-file-btn" onclick="loadSampleFile('Aqualine→Ebisu_tablet')">
          <div class="sample-file-info">
            <span class="sample-file-route">Aqualine → Ebisu</span>
            <span class="sample-file-device">📱 Tablet</span>
          </div>
          <span class="sample-file-icon">→</span>
        </button>
      </div>
    </div>

    <div class="upload-section" id="upload-section">
      <input type="file" id="csv-upload" class="file-input" accept=".csv" onchange="handleFileUpload(event)">
      <div class="upload-icon">📁</div>
      <div class="upload-text">Click to upload CSV file</div>
      <div class="upload-hint">or drag and drop here</div>
    </div>

    <div id="stats-container" style="display: none;">
      <div class="stats-box">
        <div class="stats-title">Trace Statistics</div>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">Raw Points</div>
            <div class="stat-value raw" id="raw-count">0</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Matched Points</div>
            <div class="stat-value matched" id="matched-count">0</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Duration</div>
            <div class="stat-value" id="duration">0s</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Distance</div>
            <div class="stat-value" id="distance">0 km</div>
          </div>
        </div>
      </div>

      <div class="session-info" id="session-info" style="display: none;">
        <div class="session-info-title">Session Information</div>
        <div class="session-info-detail">
          <div>Route: <span id="route-info" style="font-weight: 600;"></span></div>
          <div>Device: <span id="device-info"></span></div>
          <div>Trip ID: <span id="trip-id"></span></div>
          <div>Session: <span id="session-id"></span></div>
        </div>
      </div>

      <div class="controls-section">
        <button class="btn selection-mode-btn" onclick="toggleSelectionMode()" id="selection-mode-btn" style="display: none;">
          📦 Select Area To Fix With Map Matching API
        </button>

        <div class="selection-info" id="selection-info" style="display: none;">
          <strong>Selection Mode Active</strong><br>
          Click and drag to draw a rectangle. Points inside will be map-matched.
        </div>

        <!-- Map Matching UI commented out
        <div style="margin-bottom: 12px;">
          <div class="stats-title">Map Matching Options</div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <label style="font-size: 12px; color: #6b7280;">Chunk Size:</label>
            <select id="chunk-size-select" style="flex: 1; padding: 8px; border: 2px solid #e5e7eb; border-radius: 6px; font-size: 12px; background: white;">
              <option value="10">10 points (Ultra precision)</option>
              <option value="50">50 points (High precision)</option>
              <option value="100" selected>100 points (Recommended)</option>
              <option value="500">500 points</option>
              <option value="1000">1000 points (Max)</option>
            </select>
          </div>
        </div>

        <button class="btn btn-primary match-button" onclick="runMapMatching()" id="match-btn" style="display: none;">
          🛣️ Run Map Matching
        </button>
        -->

        <button class="btn btn-secondary" onclick="clearData()">
          Clear & Upload New
        </button>

        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
          <div class="stats-title">Display Options</div>
          <div class="toggle-group">
            <button class="toggle-btn active raw" onclick="toggleLayer('raw')" id="toggle-raw" style="font-size: 12px;">
              <span>🔴</span>
              <span>Raw Points</span>
            </button>
            <button class="toggle-btn active matched" onclick="toggleLayer('matched')" id="toggle-matched" style="font-size: 12px;">
              <span>🟢</span>
              <span>Matched Points</span>
            </button>
          </div>

          <div class="toggle-group">
            <button class="toggle-btn active matched" onclick="toggleLayer('nav-sdk-matched-line')" id="toggle-nav-sdk-matched-line" style="font-size: 12px;">
              <span style="display: inline-block; width: 16px; height: 3px; background: #10b981; border-radius: 2px; vertical-align: middle;"></span>
              <span>Matched Route</span>
            </button>
          </div>

          <!-- Map Matching route toggles commented out
          <div class="toggle-group">
            <button class="toggle-btn raw" onclick="toggleLayer('raw-line')" id="toggle-raw-line" style="font-size: 12px;">
              <span style="display: inline-block; width: 16px; height: 3px; background: #ef4444; border-radius: 2px; vertical-align: middle;"></span>
              <span>Raw Matched Route<br>(Map Matching API)</span>
            </button>
            <button class="toggle-btn matched" onclick="toggleLayer('matched-line')" id="toggle-matched-line" style="font-size: 12px;">
              <span style="display: inline-block; width: 16px; height: 3px; background: #10b981; border-radius: 2px; vertical-align: middle;"></span>
              <span>Matched Route<br>(Map Matching API)</span>
            </button>
          </div>
          -->
        </div>
      </div>
    </div>
  </div>

  <div class="legend" id="legend" style="display: none;">
    <div class="legend-item">
      <div class="legend-dot" style="background: #ef4444;"></div>
      <span>Raw GPS Points</span>
    </div>
    <div class="legend-item">
      <div class="legend-dot" style="background: #10b981;"></div>
      <span>Matched Points</span>
    </div>
    <div class="legend-item">
      <div class="legend-line" style="background: #10b981; opacity: 0.6;"></div>
      <span>Matched Route</span>
    </div>
  </div>

  <script>
    // Initialize Mapbox
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [139.7671, 35.6812], // Tokyo Station default
      zoom: 13
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl());

    // Data storage
    let rawPoints = [];
    let matchedPoints = [];
    let sessionData = null;
    let currentFileInfo = null;
    let showRaw = true;
    let showMatched = true;
    let showRawLine = false;
    let showMatchedLine = false;
    let showNavSdkMatchedLine = true;  // Changed to true by default
    let rawMatchedRoute = null;
    let matchedMatchedRoute = null;

    // Rectangle selection
    let selectionMode = false;
    let startPoint = null;
    let currentBox = null;
    let selectedArea = null;

    // Store the current reconstructed route coordinates
    let currentReconstructedRoute = null;

    // Rate limiter for API requests (50 requests per second with parallel processing)
    class RateLimiter {
      constructor(maxRequestsPerSecond, maxConcurrent = 10) {
        this.maxRequestsPerSecond = maxRequestsPerSecond;
        this.maxConcurrent = maxConcurrent;
        this.minDelay = 1000 / maxRequestsPerSecond; // 20ms for 50 req/sec
        this.queue = [];
        this.activeRequests = 0;
        this.lastRequestTime = 0;
      }

      async throttle() {
        // Wait if we've reached max concurrent requests
        while (this.activeRequests >= this.maxConcurrent) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }

        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;

        if (timeSinceLastRequest < this.minDelay) {
          const waitTime = this.minDelay - timeSinceLastRequest;
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        this.lastRequestTime = Date.now();
        this.activeRequests++;
      }

      release() {
        this.activeRequests--;
      }
    }

    const rateLimiter = new RateLimiter(50, 10); // 50 requests per second, max 10 concurrent

    // Initialize map layers on load
    map.on('load', () => {
      // Add source for raw GPS points
      map.addSource('raw-points', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Add layer for raw GPS points only (no line)
      map.addLayer({
        id: 'raw-points-layer',
        type: 'circle',
        source: 'raw-points',
        paint: {
          'circle-radius': 4,
          'circle-color': '#ef4444',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.8
        }
      });

      // Add source for matched points
      map.addSource('matched-points', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Add layer for matched points only (no line)
      map.addLayer({
        id: 'matched-points-layer',
        type: 'circle',
        source: 'matched-points',
        paint: {
          'circle-radius': 5,
          'circle-color': '#10b981',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9
        }
      });

      // Add source for Nav SDK matched points line
      map.addSource('nav-sdk-matched-line', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Add layer for Nav SDK matched points line
      map.addLayer({
        id: 'nav-sdk-matched-line-layer',
        type: 'line',
        source: 'nav-sdk-matched-line',
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
          'visibility': 'visible'  // Changed to visible by default
        },
        paint: {
          'line-color': '#10b981',
          'line-width': 12,
          'line-opacity': 0.6
        }
      });

      // Add source for selection rectangle
      map.addSource('selection-box', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Add layer for selection rectangle
      map.addLayer({
        id: 'selection-box-fill',
        type: 'fill',
        source: 'selection-box',
        paint: {
          'fill-color': '#6366f1',
          'fill-opacity': 0.15
        }
      });

      map.addLayer({
        id: 'selection-box-outline',
        type: 'line',
        source: 'selection-box',
        paint: {
          'line-color': '#6366f1',
          'line-width': 2,
          'line-dasharray': [2, 2]
        }
      });

      // Add source for map-matched line from raw points
      map.addSource('raw-matched-line', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Add layer for map-matched line from raw points
      map.addLayer({
        id: 'raw-matched-line-layer',
        type: 'line',
        source: 'raw-matched-line',
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
          'visibility': 'none'
        },
        paint: {
          'line-color': '#ef4444',
          'line-width': 12,
          'line-opacity': 0.6
        }
      });

      // Add source for map-matched line from matched points
      map.addSource('matched-matched-line', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Add layer for map-matched line from matched points
      map.addLayer({
        id: 'matched-matched-line-layer',
        type: 'line',
        source: 'matched-matched-line',
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
          'visibility': 'none'
        },
        paint: {
          'line-color': '#10b981',
          'line-width': 12,
          'line-opacity': 0.6
        }
      });
    });

    // Setup drag and drop
    const uploadSection = document.getElementById('upload-section');

    uploadSection.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadSection.classList.add('dragover');
    });

    uploadSection.addEventListener('dragleave', () => {
      uploadSection.classList.remove('dragover');
    });

    uploadSection.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadSection.classList.remove('dragover');

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        processCSVFile(files[0]);
      }
    });

    uploadSection.addEventListener('click', () => {
      document.getElementById('csv-upload').click();
    });

    // Load sample file
    async function loadSampleFile(fileKey) {
      // Show processing overlay
      document.getElementById('processing-overlay').classList.add('active');

      // Parse route and device info from fileKey
      const parts = fileKey.split('_');
      const route = parts[0].replace('→', ' → ');
      const device = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);

      currentFileInfo = {
        route: route,
        device: device,
        source: 'sample'
      };

      try {
        // Construct the file path
        const fileName = `NavigationTrace セッションデータ(${fileKey}).csv`;
        const filePath = `assets/navigation-trace/${fileName}`;

        const response = await fetch(filePath);
        if (!response.ok) {
          throw new Error('Failed to load sample file');
        }

        const csvContent = await response.text();
        parseCSV(csvContent);
      } catch (error) {
        console.error('Error loading sample file:', error);
        alert('Error loading sample file: ' + error.message);
      } finally {
        // Hide processing overlay
        document.getElementById('processing-overlay').classList.remove('active');
      }
    }

    // Handle file upload
    function handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        // Extract route info from filename if possible
        const fileName = file.name;
        let route = 'Custom Upload';
        let device = 'Unknown';

        // Try to parse filename for route and device info
        const match = fileName.match(/\((.+?)_(.+?)\)/);
        if (match) {
          route = match[1].replace('→', ' → ');
          device = match[2].charAt(0).toUpperCase() + match[2].slice(1);
        }

        currentFileInfo = {
          route: route,
          device: device,
          source: 'upload'
        };

        processCSVFile(file);
      }
    }

    // Process CSV file
    function processCSVFile(file) {
      if (!file.name.endsWith('.csv')) {
        alert('Please upload a CSV file');
        return;
      }

      // Show processing overlay
      document.getElementById('processing-overlay').classList.add('active');

      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const csvContent = e.target.result;
          parseCSV(csvContent);
        } catch (error) {
          console.error('Error parsing CSV:', error);
          alert('Error parsing CSV file: ' + error.message);
        } finally {
          // Hide processing overlay
          document.getElementById('processing-overlay').classList.remove('active');
        }
      };
      reader.readAsText(file);
    }

    // Parse CSV content
    function parseCSV(csvContent) {
      const lines = csvContent.trim().split('\n');

      // Skip header
      if (lines.length < 2) {
        alert('CSV file is empty or invalid');
        return;
      }

      // Clear existing data
      rawPoints = [];
      matchedPoints = [];
      sessionData = {
        tripId: null,
        sessionId: null,
        startTime: null,
        endTime: null
      };

      // Parse data lines
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const parts = line.split(',');
        if (parts.length >= 7) {
          const timestamp = parseInt(parts[0]);
          const latitude = parseFloat(parts[1]);
          const longitude = parseFloat(parts[2]);
          const type = parts[3];
          const recording = parts[4] === 'true';
          const tripId = parts[5];
          const sessionId = parts[6] !== 'null' ? parts[6] : null;

          // Store session data from first valid line
          if (!sessionData.tripId && tripId) {
            sessionData.tripId = tripId;
          }
          if (!sessionData.sessionId && sessionId) {
            sessionData.sessionId = sessionId;
          }
          if (!sessionData.startTime) {
            sessionData.startTime = timestamp;
          }
          sessionData.endTime = timestamp;

          // Only process recorded points
          if (recording) {
            const point = [longitude, latitude];

            if (type === 'raw') {
              rawPoints.push({
                coordinates: point,
                timestamp: timestamp
              });
            } else if (type === 'matched') {
              matchedPoints.push({
                coordinates: point,
                timestamp: timestamp
              });
            }
          }
        }
      }

      console.log(`Parsed ${rawPoints.length} raw points and ${matchedPoints.length} matched points`);

      if (rawPoints.length === 0 && matchedPoints.length === 0) {
        alert('No recorded GPS data found in the CSV file');
        return;
      }

      // Display the data
      displayTraceData();
    }

    // Display trace data on map
    function displayTraceData() {
      // Update statistics
      document.getElementById('raw-count').textContent = rawPoints.length;
      document.getElementById('matched-count').textContent = matchedPoints.length;

      // Calculate duration
      if (sessionData.startTime && sessionData.endTime) {
        const duration = (sessionData.endTime - sessionData.startTime) / 1000;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        document.getElementById('duration').textContent = `${minutes}m ${seconds}s`;
      }

      // Display session info
      if (sessionData.tripId || sessionData.sessionId || currentFileInfo) {
        if (currentFileInfo) {
          document.getElementById('route-info').textContent = currentFileInfo.route;
          document.getElementById('device-info').textContent = currentFileInfo.device;
        }
        document.getElementById('trip-id').textContent = sessionData.tripId || 'N/A';
        document.getElementById('session-id').textContent = sessionData.sessionId || 'N/A';
        document.getElementById('session-info').style.display = 'block';
      }

      // Create GeoJSON for raw points (as individual points, not line)
      if (rawPoints.length > 0) {
        const rawGeoJSON = {
          type: 'FeatureCollection',
          features: rawPoints.map((point, index) => ({
            type: 'Feature',
            properties: {
              index: index,
              timestamp: point.timestamp
            },
            geometry: {
              type: 'Point',
              coordinates: point.coordinates
            }
          }))
        };
        map.getSource('raw-points').setData(rawGeoJSON);
      }

      // Create GeoJSON for matched points (as individual points, not line)
      if (matchedPoints.length > 0) {
        const matchedGeoJSON = {
          type: 'FeatureCollection',
          features: matchedPoints.map((point, index) => ({
            type: 'Feature',
            properties: {
              index: index,
              timestamp: point.timestamp
            },
            geometry: {
              type: 'Point',
              coordinates: point.coordinates
            }
          }))
        };
        map.getSource('matched-points').setData(matchedGeoJSON);

        // Also create line for Nav SDK matched points
        const matchedLineGeoJSON = {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: matchedPoints.map(p => p.coordinates)
            }
          }]
        };
        map.getSource('nav-sdk-matched-line').setData(matchedLineGeoJSON);

        // Initialize the reconstructed route with original matched points
        currentReconstructedRoute = matchedPoints.map(p => p.coordinates);

        // Calculate initial distance for matched path
        const totalDistance = calculateRouteDistance(matchedPoints.map(p => p.coordinates));
        document.getElementById('distance').textContent = totalDistance.toFixed(2) + ' km';
      }

      // Fit map to bounds
      const allPoints = [...rawPoints, ...matchedPoints];
      if (allPoints.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        allPoints.forEach(point => {
          bounds.extend(point.coordinates);
        });
        map.fitBounds(bounds, { padding: 50 });
      }

      // Show UI elements
      document.getElementById('sample-files').style.display = 'none';
      document.getElementById('upload-section').style.display = 'none';
      document.getElementById('stats-container').style.display = 'block';
      document.getElementById('legend').style.display = 'block';
      document.getElementById('selection-mode-btn').style.display = 'block';
      // document.getElementById('match-btn').style.display = 'block'; // Map Matching button commented out
    }

    // Toggle layer visibility
    function toggleLayer(type) {
      const button = document.getElementById(`toggle-${type}`);
      const isActive = button.classList.contains('active');

      if (type === 'raw') {
        showRaw = !isActive;
        map.setLayoutProperty('raw-points-layer', 'visibility', showRaw ? 'visible' : 'none');
      } else if (type === 'matched') {
        showMatched = !isActive;
        map.setLayoutProperty('matched-points-layer', 'visibility', showMatched ? 'visible' : 'none');
      } else if (type === 'nav-sdk-matched-line') {
        showNavSdkMatchedLine = !isActive;
        map.setLayoutProperty('nav-sdk-matched-line-layer', 'visibility', showNavSdkMatchedLine ? 'visible' : 'none');
      } else if (type === 'raw-line') {
        showRawLine = !isActive;
        map.setLayoutProperty('raw-matched-line-layer', 'visibility', showRawLine ? 'visible' : 'none');
      } else if (type === 'matched-line') {
        showMatchedLine = !isActive;
        map.setLayoutProperty('matched-matched-line-layer', 'visibility', showMatchedLine ? 'visible' : 'none');
      }

      button.classList.toggle('active');
    }


    // Split coordinate list into chunks for API limits
    function splitIntoChunks(points, maxChunkSize) {
      const chunks = [];
      for (let i = 0; i < points.length; i += maxChunkSize - 1) {
        const chunk = points.slice(i, Math.min(i + maxChunkSize, points.length));
        if (chunk.length >= 2) {
          chunks.push(chunk);
        }
      }
      return chunks;
    }

    // Run map matching on both raw and matched points
    async function runMapMatching() {
      const matchBtn = document.getElementById('match-btn');
      matchBtn.disabled = true;
      matchBtn.innerHTML = '<span class="spinner">⟳</span> Processing...';

      try {
        // Get chunk size for estimation
        const chunkSize = parseInt(document.getElementById('chunk-size-select').value);
        const totalChunks = Math.ceil(rawPoints.length / chunkSize) + Math.ceil(matchedPoints.length / chunkSize);

        if (totalChunks > 10) {
          console.log(`Note: Processing ${totalChunks} chunks with rate limiting (50 req/sec, max 10 concurrent)`);
        }

        // Process raw points
        if (rawPoints.length >= 2) {
          console.log(`Processing ${rawPoints.length} raw points...`);
          const rawRoute = await matchPointsToRoad(rawPoints.map(p => p.coordinates), 'raw');
          if (rawRoute) {
            map.getSource('raw-matched-line').setData(rawRoute);
            rawMatchedRoute = rawRoute;

            // Auto-show the raw matched line
            showRawLine = true;
            map.setLayoutProperty('raw-matched-line-layer', 'visibility', 'visible');
            document.getElementById('toggle-raw-line').classList.add('active');
          }
        }

        // Process matched points
        if (matchedPoints.length >= 2) {
          console.log(`Processing ${matchedPoints.length} matched points...`);
          const matchedRoute = await matchPointsToRoad(matchedPoints.map(p => p.coordinates), 'matched');
          if (matchedRoute) {
            map.getSource('matched-matched-line').setData(matchedRoute);
            matchedMatchedRoute = matchedRoute;

            // Auto-show the matched matched line
            showMatchedLine = true;
            map.setLayoutProperty('matched-matched-line-layer', 'visibility', 'visible');
            document.getElementById('toggle-matched-line').classList.add('active');
          }
        }

        matchBtn.innerHTML = '✅ Map Matching Complete';
        setTimeout(() => {
          matchBtn.innerHTML = '🛣️ Run Map Matching';
          matchBtn.disabled = false;
        }, 2000);
      } catch (error) {
        console.error('Map matching error:', error);
        matchBtn.innerHTML = '❌ Error - Try Again';
        setTimeout(() => {
          matchBtn.innerHTML = '🛣️ Run Map Matching';
          matchBtn.disabled = false;
        }, 2000);
      }
    }

    // Match points to road using Mapbox Map Matching API
    async function matchPointsToRoad(coordinates, type) {
      try {
        // Get selected chunk size
        const chunkSize = parseInt(document.getElementById('chunk-size-select').value);
        console.log(`Using chunk size: ${chunkSize} points`);

        // Split into chunks based on selected size
        const chunks = splitIntoChunks(coordinates, chunkSize);
        const allFeatures = [];

        // Process chunks in parallel with rate limiting
        const processChunk = async (chunk, chunkIndex) => {
          try {
            console.log(`Processing ${type} chunk ${chunkIndex + 1}/${chunks.length} (${chunk.length} points)`);

            // Apply rate limiting (50 requests per second, max 10 concurrent)
            await rateLimiter.throttle();

            // Prepare coordinates and parameters
            const coordinatesString = chunk.map(coord => coord.join(',')).join(';');
            const radiuses = chunk.map(() => '25').join(';');

            // Add timestamps (5 seconds apart)
            const baseTime = Math.floor(Date.now() / 1000) + (chunkIndex * 500);
            const timestamps = chunk.map((_, index) => baseTime + (index * 5)).join(';');

            // Use POST request with Zenrin profile (driving only)
            const url = `https://api.mapbox.com/matching/v5/mapbox.tmp.valhalla-zenrin/driving?access_token=${mapboxgl.accessToken}`;

            // Prepare form data
            const formData = new URLSearchParams();
            formData.append('coordinates', coordinatesString);
            formData.append('geometries', 'geojson');
            formData.append('radiuses', radiuses);
            formData.append('timestamps', timestamps);
            formData.append('overview', 'full');
            formData.append('tidy', 'false');

            const response = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: formData.toString()
            });

            const data = await response.json();

            rateLimiter.release(); // Release the concurrent slot

            if (data.matchings && data.matchings.length > 0) {
              const matching = data.matchings[0];
              return {
                type: 'Feature',
                properties: {
                  chunk: chunkIndex,
                  confidence: matching.confidence || 0,
                  distance: matching.distance || 0,
                  duration: matching.duration || 0
                },
                geometry: matching.geometry
              };
            }
          } catch (error) {
            rateLimiter.release(); // Release even on error
            console.error(`Error processing chunk ${chunkIndex}:`, error);
          }
          return null;
        };

        // Process all chunks in parallel (controlled by rate limiter)
        const promises = chunks.map((chunk, index) => processChunk(chunk, index));
        const results = await Promise.all(promises);

        // Filter out null results and maintain order
        results.forEach(feature => {
          if (feature) {
            allFeatures.push(feature);
          }
        });

        if (allFeatures.length > 0) {
          // Sort by chunk index to maintain order
          allFeatures.sort((a, b) => a.properties.chunk - b.properties.chunk);

          return {
            type: 'FeatureCollection',
            features: allFeatures
          };
        }
      } catch (error) {
        console.error(`Error matching ${type} points:`, error);
      }

      return null;
    }


    // Toggle selection mode
    function toggleSelectionMode() {
      selectionMode = !selectionMode;
      const btn = document.getElementById('selection-mode-btn');
      const info = document.getElementById('selection-info');

      if (selectionMode) {
        btn.classList.add('active');
        info.style.display = 'block';
        map.getCanvas().style.cursor = 'crosshair';

        // Add mouse event listeners
        map.on('mousedown', onMouseDown);
        map.on('mousemove', onMouseMove);
        map.on('mouseup', onMouseUp);
      } else {
        btn.classList.remove('active');
        info.style.display = 'none';
        map.getCanvas().style.cursor = '';

        // Remove mouse event listeners
        map.off('mousedown', onMouseDown);
        map.off('mousemove', onMouseMove);
        map.off('mouseup', onMouseUp);

        // Clear any existing selection
        clearSelection();
      }
    }

    // Mouse event handlers for rectangle drawing
    function onMouseDown(e) {
      if (!selectionMode) return;

      // Prevent map dragging
      map.dragPan.disable();

      startPoint = [e.lngLat.lng, e.lngLat.lat];
      currentBox = null;
    }

    function onMouseMove(e) {
      if (!selectionMode || !startPoint) return;

      const current = [e.lngLat.lng, e.lngLat.lat];

      // Create rectangle from start point to current point
      const minX = Math.min(startPoint[0], current[0]);
      const maxX = Math.max(startPoint[0], current[0]);
      const minY = Math.min(startPoint[1], current[1]);
      const maxY = Math.max(startPoint[1], current[1]);

      currentBox = [
        [minX, minY],
        [maxX, minY],
        [maxX, maxY],
        [minX, maxY],
        [minX, minY]
      ];

      // Update selection box on map
      map.getSource('selection-box').setData({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [currentBox]
        }
      });
    }

    async function onMouseUp(e) {
      if (!selectionMode || !startPoint || !currentBox) {
        map.dragPan.enable();
        return;
      }

      // Re-enable map dragging
      map.dragPan.enable();

      // Save the selected area
      selectedArea = currentBox;
      startPoint = null;

      // Process the selection
      await processSelectedArea();

      // Turn off selection mode after processing
      toggleSelectionMode();
    }

    function clearSelection() {
      map.getSource('selection-box').setData({
        type: 'FeatureCollection',
        features: []
      });
      selectedArea = null;
      startPoint = null;
      currentBox = null;
    }

    // Interpolate points to fill gaps larger than 40m
    function interpolatePoints(coordinates, maxDistanceMeters = 40) {
      if (coordinates.length < 2) return coordinates;

      const interpolated = [coordinates[0]];

      for (let i = 1; i < coordinates.length; i++) {
        const from = coordinates[i - 1];
        const to = coordinates[i];

        // Calculate distance between consecutive points
        const distance = turf.distance(
          turf.point(from),
          turf.point(to),
          { units: 'meters' }
        );

        if (distance > maxDistanceMeters) {
          // Calculate number of intermediate points needed
          const numIntermediatePoints = Math.ceil(distance / maxDistanceMeters) - 1;

          // Create a line between the two points
          const line = turf.lineString([from, to]);

          // Add intermediate points along the line
          for (let j = 1; j <= numIntermediatePoints; j++) {
            const fraction = j / (numIntermediatePoints + 1);
            const interpolatedPoint = turf.along(line, distance * fraction, { units: 'meters' });
            interpolated.push(interpolatedPoint.geometry.coordinates);
          }
        }

        // Add the original point
        interpolated.push(to);
      }

      return interpolated;
    }

    // Process the selected area
    async function processSelectedArea() {
      if (!selectedArea || !currentReconstructedRoute || currentReconstructedRoute.length === 0) return;

      console.log('Processing selected area...');

      // Get bounding box from selection
      const bounds = {
        minX: selectedArea[0][0],
        minY: selectedArea[0][1],
        maxX: selectedArea[2][0],
        maxY: selectedArea[2][1]
      };

      // Use the current reconstructed route instead of original matched points
      const currentPoints = currentReconstructedRoute.map((coord, index) => ({
        coordinates: coord,
        timestamp: Date.now() + index * 1000  // Dummy timestamps
      }));

      // Filter points and split into segments
      const segments = splitPointsByArea(currentPoints, bounds);

      if (segments.target.length < 2) {
        alert('Please select an area with at least 2 points');
        return;
      }

      console.log(`Found ${segments.target.length} points in selected area`);

      // Show processing indicator
      const btn = document.getElementById('selection-mode-btn');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner">⟳</span> Processing Map Matching...';

      try {
        // Get coordinates and interpolate to fill gaps
        const targetCoordinates = segments.target.map(p => p.coordinates);
        const interpolatedCoordinates = interpolatePoints(targetCoordinates, 40);

        console.log(`Interpolated from ${targetCoordinates.length} to ${interpolatedCoordinates.length} points`);

        // Call Map Matching API for interpolated target segment
        const matchedRoute = await matchPointsToRoadForArea(interpolatedCoordinates);

        if (matchedRoute && matchedRoute.features.length > 0) {
          // Reconstruct the full route
          reconstructRoute(segments, matchedRoute);
        } else {
          alert('Map matching failed for the selected area');
        }
      } catch (error) {
        console.error('Error processing selected area:', error);
        alert('Error processing selected area');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '📦 Select Area To Fix With Map Matching API';
      }
    }

    // Split points by area into before/target/after segments
    function splitPointsByArea(points, bounds) {
      const before = [];
      const target = [];
      const after = [];

      let foundFirst = false;
      let foundLast = false;

      points.forEach((point, index) => {
        const [lng, lat] = point.coordinates;
        const isInside = lng >= bounds.minX && lng <= bounds.maxX &&
                        lat >= bounds.minY && lat <= bounds.maxY;

        if (isInside) {
          target.push({...point, originalIndex: index});
          if (!foundFirst) foundFirst = true;
        } else if (!foundFirst) {
          before.push({...point, originalIndex: index});
        } else {
          after.push({...point, originalIndex: index});
          foundLast = true;
        }
      });

      return { before, target, after };
    }

    // Map matching specifically for selected area
    async function matchPointsToRoadForArea(coordinates) {
      try {
        // Use chunk size of 100 for area matching
        const chunks = splitIntoChunks(coordinates, 100);
        const allFeatures = [];

        for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
          const chunk = chunks[chunkIndex];
          console.log(`Processing area chunk ${chunkIndex + 1}/${chunks.length}`);

          await rateLimiter.throttle();

          const coordinatesString = chunk.map(coord => coord.join(',')).join(';');
          const radiuses = chunk.map(() => '25').join(';');
          const baseTime = Math.floor(Date.now() / 1000);
          const timestamps = chunk.map((_, index) => baseTime + (index * 5)).join(';');

          const url = `https://api.mapbox.com/matching/v5/mapbox.tmp.valhalla-zenrin/driving?access_token=${mapboxgl.accessToken}`;

          const formData = new URLSearchParams();
          formData.append('coordinates', coordinatesString);
          formData.append('geometries', 'geojson');
          formData.append('radiuses', radiuses);
          formData.append('timestamps', timestamps);
          formData.append('overview', 'full');
          formData.append('tidy', 'false');

          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
          });

          const data = await response.json();
          rateLimiter.release();

          if (data.matchings && data.matchings.length > 0) {
            allFeatures.push({
              type: 'Feature',
              properties: { chunk: chunkIndex },
              geometry: data.matchings[0].geometry
            });
          }
        }

        return {
          type: 'FeatureCollection',
          features: allFeatures
        };
      } catch (error) {
        console.error('Error in area map matching:', error);
        return null;
      }
    }

    // Calculate distance for a route
    function calculateRouteDistance(coordinates) {
      if (!coordinates || coordinates.length < 2) return 0;

      let totalDistance = 0;
      for (let i = 1; i < coordinates.length; i++) {
        const from = turf.point(coordinates[i-1]);
        const to = turf.point(coordinates[i]);
        totalDistance += turf.distance(from, to, {units: 'kilometers'});
      }
      return totalDistance;
    }

    // Reconstruct the full route with map-matched segment
    function reconstructRoute(segments, matchedRoute) {
      const reconstructedCoordinates = [];

      // Add before segment
      segments.before.forEach(point => {
        reconstructedCoordinates.push(point.coordinates);
      });

      // Add map-matched segment coordinates
      matchedRoute.features.forEach(feature => {
        if (feature.geometry.type === 'LineString') {
          feature.geometry.coordinates.forEach(coord => {
            reconstructedCoordinates.push(coord);
          });
        }
      });

      // Add after segment
      segments.after.forEach(point => {
        reconstructedCoordinates.push(point.coordinates);
      });

      // Save the reconstructed route as the new current state
      currentReconstructedRoute = reconstructedCoordinates;

      // Update the Nav SDK matched line with reconstructed route
      const reconstructedGeoJSON = {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: reconstructedCoordinates
          }
        }]
      };

      map.getSource('nav-sdk-matched-line').setData(reconstructedGeoJSON);

      // Recalculate and update distance
      const newDistance = calculateRouteDistance(currentReconstructedRoute);
      document.getElementById('distance').textContent = newDistance.toFixed(2) + ' km';

      // Auto-show the reconstructed route
      showNavSdkMatchedLine = true;
      map.setLayoutProperty('nav-sdk-matched-line-layer', 'visibility', 'visible');
      document.getElementById('toggle-nav-sdk-matched-line').classList.add('active');

      console.log(`Route reconstructed: ${segments.before.length} before + ${matchedRoute.features.length} matched chunks + ${segments.after.length} after`);
      console.log(`Total route points: ${currentReconstructedRoute.length}`);
      console.log(`Updated distance: ${newDistance.toFixed(2)} km`);
    }

    // Clear data and reset
    function clearData() {
      // Clear selection if active
      if (selectionMode) {
        toggleSelectionMode();
      }
      clearSelection();

      // Clear data
      rawPoints = [];
      matchedPoints = [];
      sessionData = null;
      currentFileInfo = null;
      currentReconstructedRoute = null;

      // Clear map sources
      if (map.getSource('raw-points')) {
        map.getSource('raw-points').setData({
          type: 'FeatureCollection',
          features: []
        });
      }

      if (map.getSource('matched-points')) {
        map.getSource('matched-points').setData({
          type: 'FeatureCollection',
          features: []
        });
      }

      if (map.getSource('raw-matched-line')) {
        map.getSource('raw-matched-line').setData({
          type: 'FeatureCollection',
          features: []
        });
      }

      if (map.getSource('matched-matched-line')) {
        map.getSource('matched-matched-line').setData({
          type: 'FeatureCollection',
          features: []
        });
      }

      if (map.getSource('nav-sdk-matched-line')) {
        map.getSource('nav-sdk-matched-line').setData({
          type: 'FeatureCollection',
          features: []
        });
      }

      // Reset matched routes
      rawMatchedRoute = null;
      matchedMatchedRoute = null;

      // Reset UI
      document.getElementById('sample-files').style.display = 'block';
      document.getElementById('upload-section').style.display = 'block';
      document.getElementById('stats-container').style.display = 'none';
      document.getElementById('legend').style.display = 'none';
      document.getElementById('csv-upload').value = '';

      // Reset toggles
      document.getElementById('toggle-raw').classList.add('active');
      document.getElementById('toggle-matched').classList.add('active');
      document.getElementById('toggle-nav-sdk-matched-line').classList.add('active');  // Keep active by default
      document.getElementById('toggle-raw-line').classList.remove('active');
      document.getElementById('toggle-matched-line').classList.remove('active');
      showRaw = true;
      showMatched = true;
      showNavSdkMatchedLine = true;  // Keep true by default
      showRawLine = false;
      showMatchedLine = false;
    }
  </script>
</body>
</html>