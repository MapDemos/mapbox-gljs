---
layout: default
title: Japan Airports OSM Demo
---

<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Japan Airports OSM Demo</title>
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

    /* UI Toggle button */
    #ui-toggle {
      position: absolute;
      top: 20px;
      left: 20px;
      background: white;
      padding: 10px 15px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.15);
      z-index: 1001;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 2px solid transparent;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    #ui-toggle:hover {
      border-color: #3b82f6;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }

    #ui-toggle.panels-hidden {
      background: rgba(255, 255, 255, 0.95);
    }

    /* Airport selector panel */
    #airport-selector {
      position: absolute;
      top: 70px;
      left: 20px;
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      min-width: 320px;
      max-width: 380px;
      z-index: 1000;
      max-height: 85vh;
      overflow-y: auto;
      transition: transform 0.3s ease, opacity 0.3s ease;
      transform: translateX(0);
      opacity: 1;
    }

    #airport-selector.hidden {
      transform: translateX(-120%);
      opacity: 0;
      pointer-events: none;
    }

    #airport-selector h2 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #333;
      font-size: 20px;
    }

    #airport-selector p {
      color: #666;
      font-size: 14px;
      margin-bottom: 20px;
      line-height: 1.5;
    }

    .selector-group {
      margin-bottom: 15px;
    }

    .selector-group label {
      display: block;
      margin-bottom: 8px;
      color: #555;
      font-weight: 600;
      font-size: 14px;
    }

    #airport-dropdown {
      width: 100%;
      padding: 10px;
      border: 2px solid #e5e7eb;
      border-radius: 6px;
      font-size: 14px;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
    }

    #airport-dropdown:hover {
      border-color: #3b82f6;
    }

    #airport-dropdown:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    /* Style selector */
    .style-selector {
      margin-top: 15px;
      margin-bottom: 15px;
      padding: 15px;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }

    .style-selector h3 {
      font-size: 14px;
      color: #333;
      margin-bottom: 10px;
      font-weight: 600;
    }

    .style-buttons {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .style-btn {
      padding: 8px 12px;
      border: 2px solid #e5e7eb;
      background: white;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
      font-weight: 500;
    }

    .style-btn:hover {
      border-color: #3b82f6;
      background: #f0f9ff;
    }

    .style-btn.active {
      border-color: #3b82f6;
      background: #3b82f6;
      color: white;
    }

    /* Filter section */
    .filter-section {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }

    .filter-section h3 {
      font-size: 16px;
      color: #333;
      margin-bottom: 10px;
    }

    .checkbox-group {
      margin-bottom: 10px;
    }

    .checkbox-group label {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-size: 14px;
      color: #555;
      padding: 5px 0;
      transition: color 0.2s;
    }

    .checkbox-group label:hover {
      color: #3b82f6;
    }

    .checkbox-group input[type="checkbox"] {
      margin-right: 8px;
      cursor: pointer;
    }

    #airport-info {
      margin-top: 20px;
      padding: 15px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 8px;
      color: white;
      display: none;
    }

    #airport-info.visible {
      display: block;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 13px;
    }

    .info-label {
      color: rgba(255, 255, 255, 0.8);
      font-weight: 500;
    }

    .info-value {
      color: white;
      font-weight: 600;
      text-align: right;
      max-width: 60%;
      word-break: break-word;
    }

    #toggle-selected-polygon:hover {
      background: rgba(255, 255, 255, 0.3) !important;
      transform: scale(1.02);
    }

    #toggle-selected-polygon:active {
      transform: scale(0.98);
    }

    /* Comparison mode indicator */
    .comparison-indicator {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      z-index: 1100;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s;
    }

    .comparison-indicator.visible {
      opacity: 1;
    }

    /* Statistics display */
    #stats-display {
      position: absolute;
      top: 20px;
      right: 20px;
      background: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      font-size: 13px;
      z-index: 999;
      transition: transform 0.3s ease, opacity 0.3s ease;
      transform: translateX(0);
      opacity: 1;
    }

    #stats-display.hidden {
      transform: translateX(120%);
      opacity: 0;
      pointer-events: none;
    }

    #stats-display h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      color: #333;
    }

    .stat-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      color: #666;
    }

    .stat-value {
      font-weight: 600;
      color: #3b82f6;
    }

    /* Loading state */
    .loading {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid #f3f4f6;
      border-top: 3px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-left: 10px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .status-message {
      color: #3b82f6;
      font-size: 13px;
      font-style: italic;
      margin-top: 10px;
      display: flex;
      align-items: center;
    }

    /* Zoom display */
    #zoom-display {
      position: absolute;
      bottom: 40px;
      left: 10px;
      background: white;
      padding: 8px 12px;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      font-size: 13px;
      font-weight: 600;
      color: #374151;
      z-index: 999;
    }

    #zoom-display .zoom-label {
      color: #6b7280;
      font-weight: 500;
      margin-right: 4px;
    }

    #zoom-display .zoom-value {
      color: #3b82f6;
      font-weight: 700;
    }

    /* Legend */
    #legend {
      position: absolute;
      bottom: 80px;
      right: 20px;
      background: white;
      padding: 12px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      font-size: 12px;
      z-index: 999;
      transition: transform 0.3s ease, opacity 0.3s ease;
      transform: translateX(0);
      opacity: 1;
    }

    #legend.hidden {
      transform: translateX(120%);
      opacity: 0;
      pointer-events: none;
    }

    #legend h4 {
      margin: 0 0 8px 0;
      font-size: 13px;
      color: #333;
    }

    .legend-item {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
    }

    .legend-color {
      width: 20px;
      height: 12px;
      margin-right: 8px;
      border-radius: 2px;
      border: 1px solid rgba(0,0,0,0.1);
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      #ui-toggle {
        top: 10px;
        left: 10px;
      }

      #airport-selector {
        top: 60px;
        left: 10px;
        right: 10px;
        min-width: unset;
        max-width: unset;
        padding: 15px;
        max-height: 70vh;
      }

      #airport-selector h2 {
        font-size: 18px;
        margin-bottom: 10px;
      }

      #stats-display {
        top: unset;
        bottom: 120px;
        right: 10px;
        padding: 10px;
      }

      #legend {
        display: none;
      }

      #zoom-display {
        bottom: 30px;
        left: 5px;
        padding: 6px 10px;
        font-size: 12px;
      }
    }
  </style>
</head>
<body>
  <div id="map"></div>

  <!-- UI Toggle button -->
  <button id="ui-toggle" title="Toggle UI Panels">
    <span id="toggle-icon">👁️</span>
    <span id="toggle-text">Hide Panels</span>
  </button>

  <!-- Comparison mode indicator -->
  <div id="comparison-indicator" class="comparison-indicator">
    Polygon Hidden - Compare with Base Map
  </div>

  <!-- Zoom level display -->
  <div id="zoom-display">
    <span class="zoom-label">Zoom:</span>
    <span class="zoom-value" id="zoom-value">10.00</span>
  </div>

  <!-- Statistics display -->
  <div id="stats-display">
    <h3>OSM Airport Statistics</h3>
    <div class="stat-item">
      <span>Total Airports:</span>
      <span class="stat-value" id="stat-total">0</span>
    </div>
    <div class="stat-item">
      <span>Visible:</span>
      <span class="stat-value" id="stat-visible">0</span>
    </div>
    <div class="stat-item">
      <span>Named:</span>
      <span class="stat-value" id="stat-named">0</span>
    </div>
    <div class="stat-item">
      <span>Military:</span>
      <span class="stat-value" id="stat-military">0</span>
    </div>
  </div>

  <!-- Legend -->
  <div id="legend">
    <h4>Airport Types</h4>
    <div class="legend-item">
      <div class="legend-color" style="background: rgba(59, 130, 246, 0.4);"></div>
      <span>Regular Airports</span>
    </div>
    <div class="legend-item">
      <div class="legend-color" style="background: rgba(239, 68, 68, 0.4);"></div>
      <span>Military Airfields</span>
    </div>
    <div class="legend-item">
      <div class="legend-color" style="background: rgba(147, 51, 234, 0.6);"></div>
      <span>Selected Airport</span>
    </div>
  </div>

  <div id="airport-selector">
    <h2>🛩️ Japan Airports (OSM)</h2>
    <p>Explore comprehensive airport boundaries extracted from OpenStreetMap data for Japan.</p>

    <div class="selector-group">
      <label for="airport-dropdown">Choose an Airport:</label>
      <select id="airport-dropdown">
        <option value="">Loading airports...</option>
      </select>
    </div>

    <div class="style-selector">
      <h3>Map Style</h3>
      <div class="style-buttons">
        <button class="style-btn active" id="style-satellite" data-style="mapbox://styles/mapbox/satellite-streets-v12">
          🛰️ Satellite
        </button>
        <button class="style-btn" id="style-streets" data-style="mapbox://styles/mapbox/streets-v12">
          🗺️ Streets
        </button>
      </div>
    </div>

    <div class="filter-section">
      <h3>Display Options</h3>

      <div class="checkbox-group">
        <label>
          <input type="checkbox" id="polygon-toggle" checked>
          Show airport polygons
        </label>
      </div>

      <div class="checkbox-group">
        <label>
          <input type="checkbox" id="military-toggle" checked>
          Show military airfields
        </label>
      </div>

      <div class="checkbox-group">
        <label>
          <input type="checkbox" id="labels-toggle" checked>
          Show airport labels
        </label>
      </div>

      <div class="checkbox-group">
        <label>
          <input type="checkbox" id="small-toggle" checked>
          Show small airfields
        </label>
      </div>
    </div>

    <div id="status-container"></div>

    <div id="airport-info">
      <div class="info-item">
        <span class="info-label">Name:</span>
        <span class="info-value" id="info-name">-</span>
      </div>
      <div class="info-item">
        <span class="info-label">English Name:</span>
        <span class="info-value" id="info-name-en">-</span>
      </div>
      <div class="info-item">
        <span class="info-label">IATA/ICAO:</span>
        <span class="info-value" id="info-codes">-</span>
      </div>
      <div class="info-item">
        <span class="info-label">Type:</span>
        <span class="info-value" id="info-type">-</span>
      </div>
      <div class="info-item">
        <span class="info-label">Coordinates:</span>
        <span class="info-value" id="info-coords">-</span>
      </div>
      <div class="info-item">
        <span class="info-label">Area:</span>
        <span class="info-value" id="info-area">-</span>
      </div>
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2);">
        <button id="toggle-selected-polygon" style="
          width: 100%;
          padding: 10px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.4);
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
        ">
          🔄 Toggle Polygon (Space)
        </button>
      </div>
    </div>
  </div>

  <script>
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [138.2529, 36.2048], // Center of Japan
      zoom: 5.5
    });

    let airports = [];
    let currentMarker = null;
    let geojsonData = null;
    let currentStyle = 'satellite';
    let mapLoaded = false;
    let panelsVisible = true;
    let selectedPolygonVisible = true;
    let currentSelectedAirport = null;

    // Add navigation control
    map.addControl(new mapboxgl.NavigationControl());

    // Update zoom display
    function updateZoomDisplay() {
      const zoom = map.getZoom();
      document.getElementById('zoom-value').textContent = zoom.toFixed(2);
    }

    // Update zoom on map move
    map.on('zoom', updateZoomDisplay);
    map.on('zoomend', updateZoomDisplay);
    map.on('move', updateZoomDisplay);

    // Show status message
    function showStatus(message, isLoading = false) {
      const statusContainer = document.getElementById('status-container');
      if (message) {
        statusContainer.innerHTML = `
          <div class="status-message">
            ${message}
            ${isLoading ? '<span class="loading"></span>' : ''}
          </div>
        `;
      } else {
        statusContainer.innerHTML = '';
      }
    }

    // Calculate area in square kilometers
    function calculateArea(geometry) {
      try {
        const area = turf.area(geometry);
        return (area / 1000000).toFixed(2); // Convert to km²
      } catch (e) {
        return null;
      }
    }

    // Function to setup map layers
    async function setupMapLayers() {
      if (!geojsonData) {
        console.log('Loading OSM airport data...');
        showStatus('Loading OSM airports', true);

        try {
          // Load the OSM GeoJSON file
          const response = await fetch('japan-airports-osm.geojson');
          geojsonData = await response.json();

          console.log('OSM GeoJSON loaded:', geojsonData);

          // Process features to add additional properties
          geojsonData.features.forEach(feature => {
            // Identify military airports
            const props = feature.properties;
            props.isMilitary = props.military === 'airfield' ||
                              props.military === 'yes' ||
                              (props.operator && props.operator.includes('自衛隊')) ||
                              (props.name && (props.name.includes('基地') ||
                                            props.name.includes('駐屯地') ||
                                            props.name.includes('Air Base')));

            // Calculate area for each feature
            if (feature.geometry) {
              props.area_sqkm = calculateArea(feature.geometry);
            }
          });

          // Extract airport data (only once)
          extractAirportData(geojsonData);
        } catch (error) {
          console.error('Error loading OSM GeoJSON:', error);
          showStatus('Error loading OSM airport data');
          return;
        }
      }

      // Check if source exists, if not add it
      if (!map.getSource('airports-osm')) {

          // Add the GeoJSON as a source
          map.addSource('airports-osm', {
            type: 'geojson',
            data: geojsonData
          });
      }

      // Add layers if they don't exist
      if (!map.getLayer('airport-polygons')) {
        // Add regular airport polygons layer
        map.addLayer({
          id: 'airport-polygons',
          type: 'fill',
          source: 'airports-osm',
          paint: {
            'fill-color': [
              'case',
              ['get', 'isMilitary'],
              'rgba(239, 68, 68, 0.4)',  // Red for military
              'rgba(59, 130, 246, 0.4)'   // Blue for regular
            ],
            'fill-opacity': 0.4
          },
          filter: ['!', ['get', 'isMilitary']]
        });

        // Add military airport polygons layer
        map.addLayer({
          id: 'military-polygons',
          type: 'fill',
          source: 'airports-osm',
          paint: {
            'fill-color': 'rgba(239, 68, 68, 0.4)',
            'fill-opacity': 0.4
          },
          filter: ['get', 'isMilitary']
        });

        // Add outline layer
        map.addLayer({
          id: 'airport-outlines',
          type: 'line',
          source: 'airports-osm',
          paint: {
            'line-color': [
              'case',
              ['get', 'isMilitary'],
              '#dc2626',  // Red for military
              '#2563eb'   // Blue for regular
            ],
            'line-width': 2,
            'line-opacity': 0.8
          }
        });

        // Add a highlighted layer for selected airport
        map.addLayer({
          id: 'airport-polygons-highlighted',
          type: 'fill',
          source: 'airports-osm',
          paint: {
            'fill-color': '#9333ea',
            'fill-opacity': 0.6
          },
          filter: ['==', ['get', 'name'], ''] // Initially hide all
        });

        // Add highlighted outline
        map.addLayer({
          id: 'airport-outlines-highlighted',
          type: 'line',
          source: 'airports-osm',
          paint: {
            'line-color': '#7c3aed',
            'line-width': 3,
            'line-opacity': 1
          },
          filter: ['==', ['get', 'name'], ''] // Initially hide all
        });

        // Add labels layer
        map.addLayer({
          id: 'airport-labels',
          type: 'symbol',
          source: 'airports-osm',
          layout: {
            'text-field': ['get', 'name'],
            'text-size': 12,
            'text-anchor': 'center',
            'text-allow-overlap': false,
            'text-ignore-placement': false
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': '#000000',
            'text-halo-width': 2
          },
          filter: ['has', 'name']
        });
      }

      updateStatistics();
      showStatus('');
    }

    // Load the map and data
    map.on('load', async () => {
      mapLoaded = true;
      await setupMapLayers();
    });

    function extractAirportData(geojsonData) {
      try {
        console.log('Extracting OSM airport data...');

        const airportMap = new Map();

        // Process all features from the GeoJSON
        if (geojsonData.features) {
          geojsonData.features.forEach(feature => {
            const props = feature.properties;
            const name = props?.name || props?.['name:en'] || 'Unnamed Airport';

            if (!airportMap.has(name)) {
              // Calculate centroid of the polygon
              let centroid = null;
              if (feature.geometry) {
                try {
                  centroid = turf.centroid(feature.geometry);
                } catch (e) {
                  console.warn('Could not calculate centroid for', name);
                }
              }

              airportMap.set(name, {
                name: name,
                nameEn: props['name:en'] || '',
                iata: props.iata || '',
                icao: props.icao || '',
                type: props.aeroway || 'aerodrome',
                military: props.isMilitary,
                properties: props,
                geometry: feature.geometry,
                centroid: centroid ? centroid.geometry.coordinates : null,
                area: props.area_sqkm
              });
            }
          });
        }

        // Convert map to array and sort by name
        airports = Array.from(airportMap.values()).sort((a, b) =>
          a.name.localeCompare(b.name, 'ja')
        );

        console.log(`✅ Total OSM airports found: ${airports.length}`);
        populateDropdown();
        showStatus('');

      } catch (error) {
        console.error('Error extracting OSM airport data:', error);
        showStatus('Error processing OSM airport data');
      }
    }

    function populateDropdown() {
      const dropdown = document.getElementById('airport-dropdown');

      // Clear existing options
      dropdown.innerHTML = '<option value="">Select an airport...</option>';

      // Group airports by type
      const regularAirports = airports.filter(a => !a.military);
      const militaryAirports = airports.filter(a => a.military);

      // Add regular airports
      if (regularAirports.length > 0) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = `Civilian Airports (${regularAirports.length})`;
        regularAirports.forEach((airport, index) => {
          const option = document.createElement('option');
          option.value = airports.indexOf(airport);
          const codes = [];
          if (airport.iata) codes.push(airport.iata);
          if (airport.icao) codes.push(airport.icao);
          const codeStr = codes.length > 0 ? ` [${codes.join('/')}]` : '';
          option.textContent = `${airport.name}${codeStr}`;
          optgroup.appendChild(option);
        });
        dropdown.appendChild(optgroup);
      }

      // Add military airports
      if (militaryAirports.length > 0) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = `Military Airfields (${militaryAirports.length})`;
        militaryAirports.forEach((airport, index) => {
          const option = document.createElement('option');
          option.value = airports.indexOf(airport);
          option.textContent = airport.name;
          optgroup.appendChild(option);
        });
        dropdown.appendChild(optgroup);
      }

      console.log(`Populated dropdown with ${airports.length} OSM airports`);
    }

    function updateStatistics() {
      const total = airports.length;
      const named = airports.filter(a => a.name && a.name !== 'Unnamed Airport').length;
      const military = airports.filter(a => a.military).length;
      const visible = airports.filter(a => {
        // Check if airport would be visible based on current filters
        if (!document.getElementById('military-toggle').checked && a.military) return false;
        if (!document.getElementById('small-toggle').checked && a.area && a.area < 1) return false;
        return true;
      }).length;

      document.getElementById('stat-total').textContent = total;
      document.getElementById('stat-visible').textContent = visible;
      document.getElementById('stat-named').textContent = named;
      document.getElementById('stat-military').textContent = military;
    }

    // Handle dropdown selection
    document.getElementById('airport-dropdown').addEventListener('change', (e) => {
      const index = e.target.value;

      if (index === '') {
        // Clear selection
        if (currentMarker) {
          currentMarker.remove();
          currentMarker = null;
        }
        document.getElementById('airport-info').classList.remove('visible');

        // Clear highlight filter
        map.setFilter('airport-polygons-highlighted', ['==', ['get', 'name'], '']);
        map.setFilter('airport-outlines-highlighted', ['==', ['get', 'name'], '']);

        currentSelectedAirport = null;
        selectedPolygonVisible = true;
        return;
      }

      const airport = airports[index];
      currentSelectedAirport = airport;
      selectedPolygonVisible = true;  // Reset to visible when selecting new airport

      if (!airport) {
        console.error('Airport not found');
        return;
      }

      console.log('Selected OSM airport:', airport);

      // Update info panel
      const infoPanel = document.getElementById('airport-info');
      infoPanel.classList.add('visible');

      document.getElementById('info-name').textContent = airport.name || 'N/A';
      document.getElementById('info-name-en').textContent = airport.nameEn || 'N/A';

      const codes = [];
      if (airport.iata) codes.push(`IATA: ${airport.iata}`);
      if (airport.icao) codes.push(`ICAO: ${airport.icao}`);
      document.getElementById('info-codes').textContent = codes.length > 0 ? codes.join(', ') : 'N/A';

      document.getElementById('info-type').textContent =
        airport.military ? 'Military Airfield' : 'Civilian Airport';

      if (airport.centroid) {
        document.getElementById('info-coords').textContent =
          `${airport.centroid[1].toFixed(4)}, ${airport.centroid[0].toFixed(4)}`;
      } else {
        document.getElementById('info-coords').textContent = 'N/A';
      }

      document.getElementById('info-area').textContent =
        airport.area ? `${airport.area} km²` : 'N/A';

      // Highlight the selected airport
      map.setFilter('airport-polygons-highlighted',
        ['==', ['get', 'name'], airport.name]
      );
      map.setFilter('airport-outlines-highlighted',
        ['==', ['get', 'name'], airport.name]
      );

      // Fly to airport location
      if (airport.centroid) {
        // Remove previous marker if exists
        if (currentMarker) {
          currentMarker.remove();
        }

        // Add marker at centroid
        currentMarker = new mapboxgl.Marker({
          color: '#7c3aed'
        })
        .setLngLat(airport.centroid)
        .setPopup(new mapboxgl.Popup().setHTML(
          `<h3>${airport.name}</h3>
           ${airport.nameEn ? `<p>${airport.nameEn}</p>` : ''}
           <p>Type: ${airport.military ? 'Military' : 'Civilian'}<br>
           ${airport.area ? `Area: ${airport.area} km²<br>` : ''}
           Lat: ${airport.centroid[1].toFixed(4)}<br>
           Lng: ${airport.centroid[0].toFixed(4)}</p>`
        ))
        .addTo(map);

        // Fly to the airport
        map.flyTo({
          center: airport.centroid,
          zoom: 13,
          duration: 2000,
          essential: true
        });

        console.log(`Flying to ${airport.name} at`, airport.centroid);
      } else if (airport.geometry) {
        // If no centroid but has geometry, try to fit bounds
        try {
          const bbox = turf.bbox(airport.geometry);
          map.fitBounds(bbox, {
            padding: 100,
            duration: 2000
          });
          console.log(`Fitting bounds for ${airport.name}`);
        } catch (error) {
          console.error('Could not fit bounds:', error);
        }
      }
    });

    // Handle polygon visibility toggle
    document.getElementById('polygon-toggle').addEventListener('change', (e) => {
      const isVisible = e.target.checked;
      const opacity = isVisible ? 0.4 : 0;

      map.setPaintProperty('airport-polygons', 'fill-opacity', opacity);
      map.setPaintProperty('military-polygons', 'fill-opacity', opacity);
      map.setLayoutProperty('airport-outlines', 'visibility', isVisible ? 'visible' : 'none');

      console.log(`Airport polygons ${isVisible ? 'shown' : 'hidden'}`);
    });

    // Handle military toggle
    document.getElementById('military-toggle').addEventListener('change', (e) => {
      const isVisible = e.target.checked;
      map.setLayoutProperty('military-polygons', 'visibility', isVisible ? 'visible' : 'none');
      updateStatistics();
      console.log(`Military airfields ${isVisible ? 'shown' : 'hidden'}`);
    });

    // Handle labels toggle
    document.getElementById('labels-toggle').addEventListener('change', (e) => {
      const isVisible = e.target.checked;
      map.setLayoutProperty('airport-labels', 'visibility', isVisible ? 'visible' : 'none');
      console.log(`Airport labels ${isVisible ? 'shown' : 'hidden'}`);
    });

    // Handle small airports toggle
    document.getElementById('small-toggle').addEventListener('change', (e) => {
      const showSmall = e.target.checked;

      // Update filter to hide small airports (< 1 km²)
      if (showSmall) {
        map.setFilter('airport-polygons', ['!', ['get', 'isMilitary']]);
      } else {
        map.setFilter('airport-polygons', [
          'all',
          ['!', ['get', 'isMilitary']],
          ['>', ['get', 'area_sqkm'], 1]
        ]);
      }

      updateStatistics();
      console.log(`Small airports ${showSmall ? 'shown' : 'hidden'}`);
    });

    // Add click interaction on airport polygons
    map.on('click', 'airport-polygons', handleAirportClick);
    map.on('click', 'military-polygons', handleAirportClick);

    function handleAirportClick(e) {
      if (e.features.length > 0) {
        const feature = e.features[0];
        const name = feature.properties.name;

        // Find the airport in our list and select it
        const airportIndex = airports.findIndex(a => a.name === name);
        if (airportIndex !== -1) {
          document.getElementById('airport-dropdown').value = airportIndex;
          document.getElementById('airport-dropdown').dispatchEvent(new Event('change'));
        }
      }
    }

    // Change cursor on hover
    map.on('mouseenter', 'airport-polygons', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseenter', 'military-polygons', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'airport-polygons', () => {
      map.getCanvas().style.cursor = '';
    });
    map.on('mouseleave', 'military-polygons', () => {
      map.getCanvas().style.cursor = '';
    });

    // Handle style switching
    document.getElementById('style-satellite').addEventListener('click', function() {
      if (currentStyle === 'satellite') return;

      // Update button states
      document.getElementById('style-satellite').classList.add('active');
      document.getElementById('style-streets').classList.remove('active');

      // Change map style
      map.setStyle('mapbox://styles/mapbox/satellite-streets-v12');
      currentStyle = 'satellite';

      // Re-add layers after style change
      map.once('style.load', async () => {
        await setupMapLayers();

        // Restore visibility states
        restoreLayerStates();
      });
    });

    document.getElementById('style-streets').addEventListener('click', function() {
      if (currentStyle === 'streets') return;

      // Update button states
      document.getElementById('style-streets').classList.add('active');
      document.getElementById('style-satellite').classList.remove('active');

      // Change map style
      map.setStyle('mapbox://styles/mapbox/streets-v12');
      currentStyle = 'streets';

      // Re-add layers after style change
      map.once('style.load', async () => {
        await setupMapLayers();

        // Restore visibility states
        restoreLayerStates();
      });
    });

    // Function to restore layer visibility states after style switch
    function restoreLayerStates() {
      // Restore polygon visibility
      const polygonVisible = document.getElementById('polygon-toggle').checked;
      const opacity = polygonVisible ? 0.4 : 0;
      if (map.getLayer('airport-polygons')) {
        map.setPaintProperty('airport-polygons', 'fill-opacity', opacity);
      }
      if (map.getLayer('military-polygons')) {
        map.setPaintProperty('military-polygons', 'fill-opacity', opacity);
      }
      if (map.getLayer('airport-outlines')) {
        map.setLayoutProperty('airport-outlines', 'visibility', polygonVisible ? 'visible' : 'none');
      }

      // Restore military visibility
      const militaryVisible = document.getElementById('military-toggle').checked;
      if (map.getLayer('military-polygons')) {
        map.setLayoutProperty('military-polygons', 'visibility', militaryVisible ? 'visible' : 'none');
      }

      // Restore labels visibility
      const labelsVisible = document.getElementById('labels-toggle').checked;
      if (map.getLayer('airport-labels')) {
        map.setLayoutProperty('airport-labels', 'visibility', labelsVisible ? 'visible' : 'none');
      }

      // Restore small airports filter
      const showSmall = document.getElementById('small-toggle').checked;
      if (map.getLayer('airport-polygons')) {
        if (showSmall) {
          map.setFilter('airport-polygons', ['!', ['get', 'isMilitary']]);
        } else {
          map.setFilter('airport-polygons', [
            'all',
            ['!', ['get', 'isMilitary']],
            ['>', ['get', 'area_sqkm'], 1]
          ]);
        }
      }

      // Restore selected airport highlight if any
      const selectedIndex = document.getElementById('airport-dropdown').value;
      if (selectedIndex && airports[selectedIndex]) {
        const airport = airports[selectedIndex];
        if (map.getLayer('airport-polygons-highlighted')) {
          // Only show if polygon is supposed to be visible
          if (selectedPolygonVisible) {
            map.setFilter('airport-polygons-highlighted',
              ['==', ['get', 'name'], airport.name]
            );
          } else {
            map.setFilter('airport-polygons-highlighted',
              ['==', ['get', 'name'], '___no_match___']
            );
          }
        }
        if (map.getLayer('airport-outlines-highlighted')) {
          // Only show if polygon is supposed to be visible
          if (selectedPolygonVisible) {
            map.setFilter('airport-outlines-highlighted',
              ['==', ['get', 'name'], airport.name]
            );
          } else {
            map.setFilter('airport-outlines-highlighted',
              ['==', ['get', 'name'], '___no_match___']
            );
          }
        }
      }
    }

    // Toggle selected polygon visibility for comparison
    function toggleSelectedPolygon() {
      if (!currentSelectedAirport) return;

      selectedPolygonVisible = !selectedPolygonVisible;

      if (selectedPolygonVisible) {
        // Show the selected polygon
        map.setFilter('airport-polygons-highlighted',
          ['==', ['get', 'name'], currentSelectedAirport.name]
        );
        map.setFilter('airport-outlines-highlighted',
          ['==', ['get', 'name'], currentSelectedAirport.name]
        );

        // Hide comparison indicator
        document.getElementById('comparison-indicator').classList.remove('visible');
      } else {
        // Hide the selected polygon
        map.setFilter('airport-polygons-highlighted',
          ['==', ['get', 'name'], '___no_match___']
        );
        map.setFilter('airport-outlines-highlighted',
          ['==', ['get', 'name'], '___no_match___']
        );

        // Show comparison indicator
        const indicator = document.getElementById('comparison-indicator');
        indicator.classList.add('visible');

        // Hide indicator after 2 seconds
        setTimeout(() => {
          indicator.classList.remove('visible');
        }, 2000);
      }

      // Update button text
      const button = document.getElementById('toggle-selected-polygon');
      if (button) {
        button.innerHTML = selectedPolygonVisible ?
          '🔄 Hide Polygon (Space)' :
          '👁️ Show Polygon (Space)';
      }
    }

    // Add click handler for toggle button
    document.getElementById('toggle-selected-polygon')?.addEventListener('click', () => {
      toggleSelectedPolygon();
    });

    // Toggle UI panels functionality
    function togglePanels() {
      panelsVisible = !panelsVisible;

      const panels = [
        'airport-selector',
        'stats-display',
        'legend'
      ];

      panels.forEach(panelId => {
        const panel = document.getElementById(panelId);
        if (panel) {
          if (panelsVisible) {
            panel.classList.remove('hidden');
          } else {
            panel.classList.add('hidden');
          }
        }
      });

      // Update toggle button
      const toggleBtn = document.getElementById('ui-toggle');
      const toggleIcon = document.getElementById('toggle-icon');
      const toggleText = document.getElementById('toggle-text');

      if (panelsVisible) {
        toggleIcon.textContent = '👁️';
        toggleText.textContent = 'Hide Panels';
        toggleBtn.classList.remove('panels-hidden');
      } else {
        toggleIcon.textContent = '👁️‍🗨️';
        toggleText.textContent = 'Show Panels';
        toggleBtn.classList.add('panels-hidden');
      }
    }

    // Add click handler for toggle button
    document.getElementById('ui-toggle').addEventListener('click', togglePanels);

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Press 'H' to toggle panels
      if (e.key === 'h' || e.key === 'H') {
        togglePanels();
      }

      // Press 'P' to toggle polygons
      if (e.key === 'p' || e.key === 'P') {
        const polygonToggle = document.getElementById('polygon-toggle');
        polygonToggle.checked = !polygonToggle.checked;
        polygonToggle.dispatchEvent(new Event('change'));
      }

      // Press 'L' to toggle labels
      if (e.key === 'l' || e.key === 'L') {
        const labelsToggle = document.getElementById('labels-toggle');
        labelsToggle.checked = !labelsToggle.checked;
        labelsToggle.dispatchEvent(new Event('change'));
      }

      // Press 'M' to toggle military
      if (e.key === 'm' || e.key === 'M') {
        const militaryToggle = document.getElementById('military-toggle');
        militaryToggle.checked = !militaryToggle.checked;
        militaryToggle.dispatchEvent(new Event('change'));
      }

      // Press 'S' to switch styles
      if (e.key === 's' || e.key === 'S') {
        if (currentStyle === 'satellite') {
          document.getElementById('style-streets').click();
        } else {
          document.getElementById('style-satellite').click();
        }
      }

      // Press 'Escape' to clear selection
      if (e.key === 'Escape') {
        document.getElementById('airport-dropdown').value = '';
        document.getElementById('airport-dropdown').dispatchEvent(new Event('change'));
      }

      // Press 'Space' to toggle selected polygon
      if (e.key === ' ' || e.key === 'Space') {
        e.preventDefault(); // Prevent page scroll
        toggleSelectedPolygon();
      }
    });

    // Add a keyboard shortcuts panel
    const shortcutsHtml = `
      <div id="shortcuts-panel" style="
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 8px 15px;
        border-radius: 20px;
        font-size: 11px;
        z-index: 998;
        display: flex;
        gap: 15px;
        backdrop-filter: blur(5px);
      ">
        <span>⌨️ Shortcuts:</span>
        <span><kbd>H</kbd> Hide Panels</span>
        <span><kbd>P</kbd> Polygons</span>
        <span><kbd>L</kbd> Labels</span>
        <span><kbd>M</kbd> Military</span>
        <span><kbd>S</kbd> Style</span>
        <span><kbd>Space</kbd> Compare</span>
        <span><kbd>ESC</kbd> Clear</span>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', shortcutsHtml);

    // Hide shortcuts panel on mobile
    if (window.innerWidth < 768) {
      document.getElementById('shortcuts-panel').style.display = 'none';
    }

    // Toggle shortcuts visibility with '?'
    document.addEventListener('keydown', (e) => {
      if (e.key === '?') {
        const panel = document.getElementById('shortcuts-panel');
        panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
      }
    });
  </script>
</body>
</html>