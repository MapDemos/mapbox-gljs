---
layout: none
---
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Wind Speed and Particles Demo</title>
    {% include common_head.html %}
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
        }
        #map {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 100%;
        }
        .controls {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px;
            border-radius: 5px;
            font-size: 12px;
            max-width: 250px;
            z-index: 1;
        }
        .control-group {
            margin-bottom: 15px;
        }
        .control-group:last-child {
            margin-bottom: 0;
        }
        .control-label {
            font-weight: bold;
            margin-bottom: 5px;
            display: block;
        }
        input[type="range"] {
            width: 100%;
        }
        input[type="checkbox"] {
            margin-right: 5px;
        }
        .time-display {
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
            z-index: 1;
        }
        .time-controls {
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            display: flex;
            align-items: center;
            gap: 15px;
            z-index: 1;
        }
        .play-button {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 3px;
            cursor: pointer;
            font-size: 14px;
        }
        .play-button:hover {
            background: #45a049;
        }
        .time-slider {
            width: 300px;
        }
        .value-display {
            color: #aaa;
            font-size: 11px;
            margin-top: 3px;
        }
        select {
            width: 100%;
            padding: 5px;
            border-radius: 3px;
            border: 1px solid #555;
            background: #333;
            color: white;
        }
    </style>
</head>
<body>
    <div id="map"></div>

    <div class="time-display">
        <div id="current-time">Loading...</div>
    </div>

    <div class="controls">
        <div class="control-group">
            <label class="control-label">
                <input type="checkbox" id="show-heatmap" checked>
                Show Heatmap
            </label>
        </div>

        <div class="control-group">
            <label class="control-label">Heatmap Opacity</label>
            <input type="range" id="heatmap-opacity" min="0" max="1" step="0.1" value="0.7">
            <div class="value-display" id="heatmap-opacity-value">0.7</div>
        </div>

        <div class="control-group">
            <label class="control-label">Heatmap Transition Mode</label>
            <select id="transition-mode">
                <option value="none">No fade (instant)</option>
                <option value="fadein">Fade-in (1 layer)</option>
                <option value="crossfade" selected>Cross-fade (2 layers)</option>
            </select>
        </div>

        <div class="control-group">
            <label class="control-label">Color Scale</label>
            <select id="color-scale">
                <option value="turbo" selected>Turbo</option>
                <option value="viridis">Viridis</option>
                <option value="plasma">Plasma</option>
                <option value="inferno">Inferno</option>
                <option value="magma">Magma</option>
            </select>
        </div>

        <div class="control-group">
            <label class="control-label">
                <input type="checkbox" id="show-particles" checked>
                Show Particles
            </label>
        </div>

        <div class="control-group">
            <label class="control-label">Particle Count</label>
            <input type="range" id="particle-count" min="100" max="5000" step="100" value="1000">
            <div class="value-display" id="particle-count-value">1000</div>
        </div>

        <div class="control-group">
            <label class="control-label">Particle Speed</label>
            <input type="range" id="particle-speed" min="0.01" max="1" step="0.01" value="0.5">
            <div class="value-display" id="particle-speed-value">0.5</div>
        </div>

        <div class="control-group">
            <label class="control-label">Particle Color</label>
            <input type="color" id="particle-color" value="#ffffff">
        </div>
    </div>

    <div class="time-controls">
        <button class="play-button" id="play-button">Play</button>
        <input type="range" class="time-slider" id="time-slider" min="0" max="1" step="1" value="0">
        <div id="time-labels">
            <span id="start-time">12:00</span> - <span id="end-time">15:00</span>
        </div>
    </div>

    <script>
        const TILESET = 'mapbox://kenji-shima.wvs2025111018v6';
        const HEATMAP_LAYER = 'wind_speed';
        const PARTICLE_LAYER = 'wind_vector';

        // Color scales (simplified versions)
        const COLOR_SCALES = {
            turbo: ['#30123b', '#4777ef', '#1ac7c2', '#a0fc3c', '#fca50a', '#d23000', '#7a0402'],
            viridis: ['#440154', '#414487', '#2a788e', '#22a884', '#7ad151', '#fde725'],
            plasma: ['#0d0887', '#6a00a8', '#b12a90', '#e16462', '#fca636', '#f0f921'],
            inferno: ['#000004', '#420a68', '#932667', '#dd513a', '#fca50a', '#fcffa4'],
            magma: ['#000004', '#3b0f70', '#8c2981', '#de4968', '#fe9f6d', '#fcfdbf']
        };

        let map, bandlist = [], currentBandIndex = 0, isPlaying = false, playInterval;
        let transitionMode = 'crossfade'; // 'crossfade' or 'fadein'
        let currentActiveLayer = 'heatmap-a';

        // Initialize map
        map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/dark-v11',
            center: [134.65, -24.64],
            zoom: 4,
            projection: 'mercator'
        });

        map.on('load', async () => {
            // Fetch tileset metadata
            const tilesetId = TILESET.split('://')[1];
            const tilejsonUrl = `https://api.mapbox.com/v4/${tilesetId}.json?access_token=${mapboxgl.accessToken}`;
            const response = await fetch(tilejsonUrl);
            const tilejson = await response.json();

            // Get bands from heatmap layer
            const heatmapLayer = tilejson.raster_layers.find(l => l.fields.name === HEATMAP_LAYER);
            bandlist = heatmapLayer.fields.bands;

            // Update time slider
            document.getElementById('time-slider').max = bandlist.length - 1;
            updateTimeDisplay();

            // Add source
            map.addSource('wind-source', {
                type: 'raster-array',
                url: TILESET
            });

            // Add single-layer heatmap for fade-in mode
            map.addLayer({
                id: 'heatmap',
                type: 'raster',
                source: 'wind-source',
                'source-layer': HEATMAP_LAYER,
                paint: {
                    'raster-opacity': 0.7,
                    'raster-opacity-transition': { duration: 450 },
                    'raster-array-band': bandlist[0],
                    'raster-color-range': heatmapLayer.fields.range,
                    'raster-color': createColorRamp('turbo', heatmapLayer.fields.range),
                    'raster-resampling': 'linear',
                    'raster-fade-duration': 0
                },
                layout: {
                    'visibility': 'none' // Hidden by default, show when fadein mode is selected
                }
            });

            // Add dual-layer heatmap for cross-fade mode
            map.addLayer({
                id: 'heatmap-a',
                type: 'raster',
                source: 'wind-source',
                'source-layer': HEATMAP_LAYER,
                paint: {
                    'raster-opacity': 0.7,
                    'raster-opacity-transition': { duration: 900 },
                    'raster-array-band': bandlist[0],
                    'raster-color-range': heatmapLayer.fields.range,
                    'raster-color': createColorRamp('turbo', heatmapLayer.fields.range),
                    'raster-resampling': 'linear',
                    'raster-fade-duration': 0
                }
            });

            map.addLayer({
                id: 'heatmap-b',
                type: 'raster',
                source: 'wind-source',
                'source-layer': HEATMAP_LAYER,
                paint: {
                    'raster-opacity': 0,
                    'raster-opacity-transition': { duration: 900 },
                    'raster-array-band': bandlist[0],
                    'raster-color-range': heatmapLayer.fields.range,
                    'raster-color': createColorRamp('turbo', heatmapLayer.fields.range),
                    'raster-resampling': 'linear',
                    'raster-fade-duration': 0
                }
            });

            // Add particle source (separate from heatmap source for band control)
            map.addSource('particle-source', {
                type: 'raster-array',
                url: TILESET
            });

            // Add particle layer
            map.addLayer({
                id: 'particles',
                type: 'raster-particle',
                source: 'particle-source',
                'source-layer': PARTICLE_LAYER,
                paint: {
                    'raster-particle-array-band': bandlist[0],
                    'raster-particle-count': 1000,
                    'raster-particle-max-speed': 10,
                    'raster-particle-speed-factor': 0.5,
                    'raster-particle-fade-opacity-factor': 0.9,
                    'raster-particle-reset-rate-factor': 0.4,
                    'raster-particle-color': '#ffffff'
                }
            });

            initializeControls();
        });

        function createColorRamp(scaleName, range) {
            const colors = COLOR_SCALES[scaleName];
            const steps = colors.length;
            const [min, max] = range;
            const stepSize = (max - min) / (steps - 1);

            const ramp = ['interpolate', ['linear'], ['raster-value']];
            colors.forEach((color, i) => {
                ramp.push(min + i * stepSize, color);
            });
            return ramp;
        }

        function updateTimeDisplay() {
            const band = bandlist[currentBandIndex];
            const time = convertBandToTime(band);
            document.getElementById('current-time').textContent = time;
            document.getElementById('start-time').textContent = convertBandToTime(bandlist[0]);
            document.getElementById('end-time').textContent = convertBandToTime(bandlist[bandlist.length - 1]);
        }

        function convertBandToTime(band) {
            // Parse base time from tileset name: wvs2025111018v5 → 2025-11-10 18:00 UTC
            const tilesetName = TILESET.split('/').pop();
            const match = tilesetName.match(/(\d{4})(\d{2})(\d{2})(\d{2})/);

            if (!match) {
                return 'Unknown time';
            }

            const [, year, month, day, hour] = match;
            const baseDate = new Date(Date.UTC(
                parseInt(year),
                parseInt(month) - 1,
                parseInt(day),
                parseInt(hour)
            ));

            // Band values are forecast seconds from base time
            const forecastTime = new Date(baseDate.getTime() + parseInt(band) * 1000);

            return forecastTime.toLocaleString('en-US', {
                timeZone: 'UTC',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        }

        function updateBand(index) {
            currentBandIndex = index;
            const band = bandlist[index];
            const targetOpacity = parseFloat(document.getElementById('heatmap-opacity').value);

            if (transitionMode === 'crossfade') {
                // Cross-fade mode: use two layers
                const nextLayer = currentActiveLayer === 'heatmap-a' ? 'heatmap-b' : 'heatmap-a';
                const currentOpacity = map.getPaintProperty(currentActiveLayer, 'raster-opacity');

                // Set the new band on the hidden layer
                map.setPaintProperty(nextLayer, 'raster-array-band', band);

                // Cross-fade: show next layer, hide current layer
                map.setPaintProperty(nextLayer, 'raster-opacity', currentOpacity);
                map.setPaintProperty(currentActiveLayer, 'raster-opacity', 0);

                // Swap active layer reference
                currentActiveLayer = nextLayer;
            } else if (transitionMode === 'fadein') {
                // Fade-in mode: use single layer
                // Fade to 0
                map.setPaintProperty('heatmap', 'raster-opacity', 0);

                // Wait for fade-out to complete, then change band and fade in
                setTimeout(() => {
                    map.setPaintProperty('heatmap', 'raster-array-band', band);
                    // Fade back to target opacity
                    map.setPaintProperty('heatmap', 'raster-opacity', targetOpacity);
                }, 450); // Match the transition duration
            } else {
                // No fade mode: instant band switch
                map.setPaintProperty('heatmap', 'raster-array-band', band);
            }

            // Update particles layer using raster-particle-array-band
            if (map.getLayer('particles')) {
                map.setPaintProperty('particles', 'raster-particle-array-band', band);
            }

            updateTimeDisplay();
            document.getElementById('time-slider').value = index;
        }

        function initializeControls() {
            // Time slider
            document.getElementById('time-slider').addEventListener('input', (e) => {
                updateBand(parseInt(e.target.value));
            });

            // Play button
            document.getElementById('play-button').addEventListener('click', () => {
                isPlaying = !isPlaying;
                document.getElementById('play-button').textContent = isPlaying ? 'Pause' : 'Play';

                if (isPlaying) {
                    playInterval = setInterval(() => {
                        currentBandIndex = (currentBandIndex + 1) % bandlist.length;
                        updateBand(currentBandIndex);
                    }, 1000);
                } else {
                    clearInterval(playInterval);
                }
            });

            // Transition mode toggle
            document.getElementById('transition-mode').addEventListener('change', (e) => {
                transitionMode = e.target.value;
                const band = bandlist[currentBandIndex];
                const opacity = parseFloat(document.getElementById('heatmap-opacity').value);

                if (transitionMode === 'crossfade') {
                    // Switch to cross-fade mode
                    map.setLayoutProperty('heatmap', 'visibility', 'none');
                    map.setLayoutProperty('heatmap-a', 'visibility', 'visible');
                    map.setLayoutProperty('heatmap-b', 'visibility', 'visible');
                    // Sync current band
                    map.setPaintProperty('heatmap-a', 'raster-array-band', band);
                    map.setPaintProperty('heatmap-a', 'raster-opacity', opacity);
                    map.setPaintProperty('heatmap-b', 'raster-opacity', 0);
                    currentActiveLayer = 'heatmap-a';
                } else {
                    // Switch to single-layer mode (fadein or none)
                    map.setLayoutProperty('heatmap-a', 'visibility', 'none');
                    map.setLayoutProperty('heatmap-b', 'visibility', 'none');
                    map.setLayoutProperty('heatmap', 'visibility', 'visible');
                    // Sync current band
                    map.setPaintProperty('heatmap', 'raster-array-band', band);
                    map.setPaintProperty('heatmap', 'raster-opacity', opacity);
                }
            });

            // Heatmap controls
            document.getElementById('show-heatmap').addEventListener('change', (e) => {
                const visibility = e.target.checked ? 'visible' : 'none';
                if (transitionMode === 'crossfade') {
                    map.setLayoutProperty('heatmap-a', 'visibility', visibility);
                    map.setLayoutProperty('heatmap-b', 'visibility', visibility);
                } else {
                    map.setLayoutProperty('heatmap', 'visibility', visibility);
                }
            });

            document.getElementById('heatmap-opacity').addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                if (transitionMode === 'crossfade') {
                    // Update opacity on the currently visible layer
                    map.setPaintProperty(currentActiveLayer, 'raster-opacity', value);
                } else {
                    map.setPaintProperty('heatmap', 'raster-opacity', value);
                }
                document.getElementById('heatmap-opacity-value').textContent = value.toFixed(1);
            });

            document.getElementById('color-scale').addEventListener('change', async (e) => {
                const tilesetId = TILESET.split('://')[1];
                const tilejsonUrl = `https://api.mapbox.com/v4/${tilesetId}.json?access_token=${mapboxgl.accessToken}`;
                const response = await fetch(tilejsonUrl);
                const tilejson = await response.json();
                const heatmapLayer = tilejson.raster_layers.find(l => l.fields.name === HEATMAP_LAYER);

                const colorRamp = createColorRamp(e.target.value, heatmapLayer.fields.range);
                if (transitionMode === 'crossfade') {
                    map.setPaintProperty('heatmap-a', 'raster-color', colorRamp);
                    map.setPaintProperty('heatmap-b', 'raster-color', colorRamp);
                } else {
                    map.setPaintProperty('heatmap', 'raster-color', colorRamp);
                }
            });

            // Particle controls
            document.getElementById('show-particles').addEventListener('change', (e) => {
                map.setLayoutProperty('particles', 'visibility', e.target.checked ? 'visible' : 'none');
            });

            document.getElementById('particle-count').addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                map.setPaintProperty('particles', 'raster-particle-count', value);
                document.getElementById('particle-count-value').textContent = value;
            });

            document.getElementById('particle-speed').addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                map.setPaintProperty('particles', 'raster-particle-speed-factor', value);
                document.getElementById('particle-speed-value').textContent = value.toFixed(2);
            });

            document.getElementById('particle-color').addEventListener('input', (e) => {
                map.setPaintProperty('particles', 'raster-particle-color', e.target.value);
            });
        }
    </script>
</body>
</html>
