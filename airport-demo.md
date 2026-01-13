---
layout: default
title: Airport Explorer Demo
---

<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Airport Explorer Demo</title>
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

    /* Airport selector panel */
    #airport-selector {
      position: absolute;
      top: 20px;
      left: 20px;
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      min-width: 300px;
      z-index: 1000;
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
      border-color: #667eea;
    }

    #airport-dropdown:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    #airport-info {
      margin-top: 20px;
      padding: 15px;
      background: #f9fafb;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      display: none;
    }

    #airport-info.visible {
      display: block;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13px;
    }

    .info-label {
      color: #6b7280;
      font-weight: 500;
    }

    .info-value {
      color: #374151;
      font-weight: 600;
    }

    /* Loading state */
    .loading {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 3px solid #f3f4f6;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-left: 10px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .status-message {
      color: #667eea;
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
      color: #667eea;
      font-weight: 700;
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      #airport-selector {
        top: 10px;
        left: 10px;
        right: 10px;
        min-width: unset;
        padding: 15px;
      }

      #airport-selector h2 {
        font-size: 18px;
        margin-bottom: 10px;
      }

      #airport-selector p {
        font-size: 13px;
        margin-bottom: 15px;
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

  <!-- Zoom level display -->
  <div id="zoom-display">
    <span class="zoom-label">Zoom:</span>
    <span class="zoom-value" id="zoom-value">10.00</span>
  </div>

  <div id="airport-selector">
    <h2>✈️ Airport Explorer</h2>
    <p>Select an airport from the dropdown to explore its location on the map.</p>

    <div class="selector-group">
      <label for="airport-dropdown">Choose an Airport:</label>
      <select id="airport-dropdown">
        <option value="">Loading airports...</option>
      </select>
    </div>

    <div class="selector-group" style="margin-top: 15px;">
      <label style="display: flex; align-items: center; cursor: pointer;">
        <input type="checkbox" id="polygon-toggle" checked style="margin-right: 8px;">
        Show airport polygons on map
      </label>
    </div>

    <div id="status-container"></div>

    <div id="airport-info">
      <div class="info-item">
        <span class="info-label">Name:</span>
        <span class="info-value" id="info-name">-</span>
      </div>
      <div class="info-item">
        <span class="info-label">Coordinates:</span>
        <span class="info-value" id="info-coords">-</span>
      </div>
      <div class="info-item">
        <span class="info-label">Properties:</span>
        <span class="info-value" id="info-properties">-</span>
      </div>
    </div>
  </div>

  <script>
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [139.7671, 35.6812], // Tokyo Station
      zoom: 10
    });

    let airports = [];
    let currentMarker = null;

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

    // Load the GeoJSON file and extract airport data
    map.on('load', async () => {
      console.log('Map loaded, loading airport data...');
      showStatus('Loading airports', true);

      try {
        // Load the GeoJSON file
        const response = await fetch('japan_airports_merged_categorybased_z13.geojson');
        const geojsonData = await response.json();

        console.log('GeoJSON loaded:', geojsonData);

        // Add the GeoJSON as a source
        map.addSource('airports', {
          type: 'geojson',
          data: geojsonData
        });

        // Add a layer to visualize the airports
        map.addLayer({
          id: 'airport-polygons',
          type: 'fill',
          source: 'airports',
          paint: {
            'fill-color': '#667eea',
            'fill-opacity': 0.3,
            'fill-outline-color': '#667eea'
          }
        });

        // Add a highlighted layer for selected airport
        map.addLayer({
          id: 'airport-polygons-highlighted',
          type: 'fill',
          source: 'airports',
          paint: {
            'fill-color': '#764ba2',
            'fill-opacity': 0.6,
            'fill-outline-color': '#764ba2'
          },
          filter: ['==', ['get', 'searchbox_name'], ''] // Initially hide all
        });

        // Extract airport data directly from GeoJSON
        extractAirportData(geojsonData);

      } catch (error) {
        console.error('Error loading GeoJSON:', error);
        showStatus('Error loading airport data');
      }
    });

    function extractAirportData(geojsonData) {
      try {
        console.log('Extracting airport data from GeoJSON...');

        const airportMap = new Map();

        // Process all features from the GeoJSON
        if (geojsonData.features) {
          geojsonData.features.forEach(feature => {
            const name = feature.properties?.searchbox_name;
            if (name && !airportMap.has(name)) {
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
                properties: feature.properties,
                geometry: feature.geometry,
                centroid: centroid ? centroid.geometry.coordinates : null
              });
            }
          });
        }

        // Convert map to array and sort
        airports = Array.from(airportMap.values()).sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        console.log(`✅ Total unique airports found: ${airports.length}`);
        populateDropdown();
        showStatus('');

      } catch (error) {
        console.error('Error extracting airport data:', error);
        showStatus('Error processing airport data');
      }
    }


    function populateDropdown() {
      const dropdown = document.getElementById('airport-dropdown');

      // Clear existing options
      dropdown.innerHTML = '<option value="">Select an airport...</option>';

      // Add airport options
      airports.forEach((airport, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = airport.name;
        dropdown.appendChild(option);
      });

      console.log(`Populated dropdown with ${airports.length} airports`);
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
        map.setFilter('airport-polygons-highlighted', ['==', ['get', 'searchbox_name'], '']);
        return;
      }

      const airport = airports[index];

      if (!airport) {
        console.error('Airport not found');
        return;
      }

      console.log('Selected airport:', airport);

      // Update info panel
      const infoPanel = document.getElementById('airport-info');
      infoPanel.classList.add('visible');

      document.getElementById('info-name').textContent = airport.name;

      if (airport.centroid) {
        document.getElementById('info-coords').textContent =
          `${airport.centroid[1].toFixed(4)}, ${airport.centroid[0].toFixed(4)}`;
      } else {
        document.getElementById('info-coords').textContent = 'N/A';
      }

      // Display number of properties
      const propCount = Object.keys(airport.properties).length;
      document.getElementById('info-properties').textContent = `${propCount} properties`;

      // Highlight the selected airport
      map.setFilter('airport-polygons-highlighted',
        ['==', ['get', 'searchbox_name'], airport.name]
      );

      // Fly to airport location
      if (airport.centroid) {
        // Remove previous marker if exists
        if (currentMarker) {
          currentMarker.remove();
        }

        // Add marker at centroid
        currentMarker = new mapboxgl.Marker({
          color: '#764ba2'
        })
        .setLngLat(airport.centroid)
        .setPopup(new mapboxgl.Popup().setHTML(
          `<h3>${airport.name}</h3>
           <p>Lat: ${airport.centroid[1].toFixed(4)}<br>
           Lng: ${airport.centroid[0].toFixed(4)}</p>`
        ))
        .addTo(map);

        // Fly to the airport
        map.flyTo({
          center: airport.centroid,
          zoom: 14,
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
      const opacity = isVisible ? 0.3 : 0;
      const outlineOpacity = isVisible ? 1 : 0;

      // Update the main polygon layer opacity
      map.setPaintProperty('airport-polygons', 'fill-opacity', opacity);
      map.setPaintProperty('airport-polygons', 'fill-outline-color',
        isVisible ? '#667eea' : 'rgba(102, 126, 234, 0)');

      // Update the highlighted layer opacity (keep it more visible when selected)
      map.setPaintProperty('airport-polygons-highlighted', 'fill-opacity',
        isVisible ? 0.6 : 0);
      map.setPaintProperty('airport-polygons-highlighted', 'fill-outline-color',
        isVisible ? '#764ba2' : 'rgba(118, 75, 162, 0)');

      console.log(`Airport polygons ${isVisible ? 'shown' : 'hidden'}`);
    });

    // Add click interaction on airport polygons
    map.on('click', 'airport-polygons', (e) => {
      if (e.features.length > 0) {
        const feature = e.features[0];
        const name = feature.properties.searchbox_name;

        // Find the airport in our list and select it
        const airportIndex = airports.findIndex(a => a.name === name);
        if (airportIndex !== -1) {
          document.getElementById('airport-dropdown').value = airportIndex;
          document.getElementById('airport-dropdown').dispatchEvent(new Event('change'));
        }
      }
    });

    // Change cursor on hover
    map.on('mouseenter', 'airport-polygons', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'airport-polygons', () => {
      map.getCanvas().style.cursor = '';
    });
  </script>
</body>
</html>