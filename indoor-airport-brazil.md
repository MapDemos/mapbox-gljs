---
layout: none
title: Indoor Airports - Brazil
---

<!DOCTYPE html>
<html lang="en">

<head>
    <title>Indoor Airports - Brazil</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="shortcut icon" href="https://static-assets.mapbox.com/branding/favicon/v1/favicon.ico">
    <link rel="apple-touch-icon" href="https://static-assets.mapbox.com/branding/favicon/v1/apple-touch-icon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --tarmac: #0b0f14;
            --glass: rgba(13, 18, 25, 0.72);
            --hairline: rgba(255, 255, 255, 0.10);
            --amber: #ffb000;
            --stop: #ff5a3c;
            --ink: #eef2f6;
            --muted: rgba(238, 242, 246, 0.55);
        }

        body {
            margin: 0;
            padding: 0;
            background: var(--tarmac);
            color: var(--ink);
            font-family: 'IBM Plex Mono', ui-monospace, monospace;
        }

        #map {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 100%;
        }

        /* Light preset selector (dawn / day / dusk / night) — dark glass pill */
        .radio-group {
            position: absolute;
            z-index: 2;
            top: 18px;
            left: 18px;
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 7px;
            border-radius: 999px;
            background: var(--glass);
            -webkit-backdrop-filter: blur(18px) saturate(140%);
            backdrop-filter: blur(18px) saturate(140%);
            border: 1px solid var(--hairline);
            box-shadow: 0 10px 34px rgba(0, 0, 0, 0.5);
        }

        .radio-wrapper {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s ease;
        }

        .radio-wrapper:hover {
            background: rgba(255, 255, 255, 0.07);
        }

        .radiobutton {
            position: absolute;
            opacity: 0;
            width: 0;
            height: 0;
        }

        .radio-group svg {
            width: 30px;
            height: 30px;
            cursor: pointer;
        }

        /* Theme the inline icons for dark glass (CSS overrides the SVG presentation attrs) */
        .radio-group svg circle {
            fill: transparent;
            transition: fill 0.2s ease;
        }

        .radio-group svg path {
            stroke: rgba(238, 242, 246, 0.5);
            transition: stroke 0.2s ease;
        }

        .radio-group label:hover svg path {
            stroke: var(--ink);
        }

        .radio-group input:checked + svg circle {
            fill: var(--amber);
        }

        .radio-group input:checked + svg path {
            stroke: var(--tarmac);
        }

        /* Airport selector — compact flight-information bar */
        .airport-bar {
            position: absolute;
            z-index: 2;
            left: 206px;
            top: 18px;
            max-width: calc(100vw - 224px);
            padding: 9px 11px 9px 15px;
            border-radius: 14px;
            background: var(--glass);
            -webkit-backdrop-filter: blur(22px) saturate(140%);
            backdrop-filter: blur(22px) saturate(140%);
            border: 1px solid var(--hairline);
            box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
        }

        .bar-main {
            display: flex;
            align-items: center;
            gap: 13px;
        }

        /* Live indicator — shown only while a tour is running */
        .live {
            display: none;
            align-items: center;
        }

        .airport-bar.touring .live {
            display: inline-flex;
        }

        .live i {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--amber);
            animation: live-pulse 1.4s infinite;
        }

        @keyframes live-pulse {
            0%   { box-shadow: 0 0 0 0 rgba(255, 176, 0, 0.6); }
            70%  { box-shadow: 0 0 0 7px rgba(255, 176, 0, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 176, 0, 0); }
        }

        .current {
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 1px;
            white-space: nowrap;
        }

        .cur-title {
            font-family: 'Bebas Neue', sans-serif;
            font-size: 23px;
            line-height: 0.9;
            letter-spacing: 1.5px;
            color: var(--amber);
        }

        .cur-sub {
            font-size: 10px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: var(--muted);
        }

        .tour-btn {
            font-family: 'Bebas Neue', sans-serif;
            font-size: 16px;
            letter-spacing: 2px;
            color: var(--tarmac);
            background: var(--amber);
            outline: none;
            border: none;
            padding: 7px 20px 5px;
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 4px 16px rgba(255, 176, 0, 0.35);
            transition: transform 0.12s ease, box-shadow 0.2s ease, background 0.2s ease, color 0.2s ease;
        }

        .tour-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 7px 22px rgba(255, 176, 0, 0.5);
        }

        .tour-btn:active {
            transform: translateY(0);
        }

        .tour-btn.running {
            background: transparent;
            color: var(--stop);
            box-shadow: inset 0 0 0 1.5px var(--stop);
        }

        .tour-btn.running:hover {
            background: rgba(255, 90, 60, 0.12);
            box-shadow: inset 0 0 0 1.5px var(--stop);
        }

        /* Chips expander toggle */
        .chips-toggle {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 13px;
            line-height: 1;
            width: 30px;
            height: 30px;
            border-radius: 8px;
            color: var(--muted);
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--hairline);
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .chips-toggle:hover {
            color: var(--ink);
            background: rgba(255, 255, 255, 0.1);
        }

        .airport-bar.expanded .chips-toggle {
            color: var(--amber);
            transform: rotate(180deg);
        }

        .airport-bar.touring .chips-toggle {
            display: none;
        }

        /* Collapsible drawer of airport chips */
        .bar-drawer {
            max-height: 0;
            overflow: hidden;
            opacity: 0;
            transition: max-height 0.32s ease, opacity 0.25s ease, margin-top 0.32s ease, padding-top 0.32s ease;
        }

        .airport-bar.expanded .bar-drawer {
            max-height: 220px;
            opacity: 1;
            margin-top: 11px;
            padding-top: 11px;
            border-top: 1px solid var(--hairline);
        }

        .airport-bar.touring .bar-drawer {
            max-height: 0;
            opacity: 0;
            margin-top: 0;
            padding-top: 0;
            border-top: none;
        }

        .airport-buttons {
            display: flex;
            flex-wrap: nowrap;
            gap: 6px;
            justify-content: center;
            overflow-x: auto;
        }

        .airport-btn {
            font-family: 'IBM Plex Mono', monospace;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.08em;
            color: var(--muted);
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--hairline);
            padding: 7px 11px;
            border-radius: 7px;
            cursor: pointer;
            transition: all 0.15s ease;
        }

        .airport-btn:hover {
            color: var(--ink);
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.22);
        }

        .airport-btn.active {
            color: var(--tarmac);
            background: var(--amber);
            border-color: var(--amber);
            box-shadow: 0 0 16px rgba(255, 176, 0, 0.35);
        }

        /* Theme Mapbox's built-in indoor floor selector to match the board */
        /* Float the indoor floor selector vertically centered on the right edge */
        .mapboxgl-ctrl-top-right {
            top: 0 !important;
            right: 16px !important;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: flex-end;
            transform: none !important;
        }

        .mapboxgl-ctrl-group {
            background: var(--glass) !important;
            -webkit-backdrop-filter: blur(18px) saturate(140%);
            backdrop-filter: blur(18px) saturate(140%);
            border: 1px solid var(--hairline) !important;
            border-radius: 12px !important;
            box-shadow: 0 10px 34px rgba(0, 0, 0, 0.5) !important;
            overflow: hidden;
        }

        .mapboxgl-ctrl-group button {
            width: 36px;
            height: 36px;
            background: transparent !important;
        }

        .mapboxgl-ctrl-group button + button {
            border-top: 1px solid var(--hairline) !important;
        }

        .mapboxgl-ctrl-level-button {
            font-family: 'IBM Plex Mono', monospace !important;
            font-size: 13px !important;
            font-weight: 600 !important;
            color: var(--muted) !important;
            background: transparent !important;
        }

        .mapboxgl-ctrl-level-button:hover {
            color: var(--ink) !important;
            background: rgba(255, 255, 255, 0.07) !important;
        }

        .mapboxgl-ctrl-level-button-selected {
            color: var(--amber) !important;
            background: rgba(255, 176, 0, 0.1) !important;
            font-weight: 700 !important;
            box-shadow: inset 3px 0 0 var(--amber) !important;
            text-shadow: 0 0 12px rgba(255, 176, 0, 0.75);
        }

        .mapboxgl-ctrl-level-button-selected:hover {
            background: rgba(255, 176, 0, 0.16) !important;
            color: var(--amber) !important;
        }

        .mapboxgl-ctrl-indoor-toggle .mapboxgl-ctrl-icon {
            filter: invert(1) brightness(1.7);
            opacity: 0.75;
        }

        @media (max-width: 640px) {
            .airport-bar {
                left: 10px;
                right: 10px;
                transform: none;
                max-width: none;
            }

            .bar-main {
                flex-wrap: wrap;
                justify-content: center;
            }
        }
    </style>
    <!-- Indoor maps require Mapbox GL JS v3.21+ (experimental indoor feature) -->
    <script src='https://api.mapbox.com/mapbox-gl-js/v3.21.0/mapbox-gl.js'></script>
    <link href='https://api.mapbox.com/mapbox-gl-js/v3.21.0/mapbox-gl.css' rel='stylesheet' />
    <!-- Shared helpers; sets mapboxgl.accessToken (must load after mapbox-gl.js) -->
    <script src="https://kenji-shima.github.io/resource-files/utils.js"></script>
</head>

<body>
    <!-- Light preset selector -->
    <div class="radio-group">
        <label class="radio-wrapper">
        <input type="radio" name="light" value="dawn" class="radiobutton">
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g>
            <circle cx="19" cy="19" r="18.5" fill="white"></circle>
            <path d="M29.9414 29.9673L7.44141 29.9673" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M24.717 29.9669C24.717 26.8095 22.1574 24.25 19.0001 24.25C15.8427 24.25 13.2832 26.8095 13.2832 29.9669" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M18.998 17.9084V20.3202" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M18.998 12.7725L18.998 6.53246" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M22.1094 8.33984L19.0723 5.95312" stroke="#282828" stroke-width="2" stroke-linecap="round"></path>
            <path d="M15.8867 8.33984L18.9238 5.95312" stroke="#282828" stroke-width="2" stroke-linecap="round"></path>
            <path d="M10.4746 21.4402L12.1786 23.1458" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M27.5245 21.4402L25.8184 23.1458" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
          </g>
        </svg>
      </label>
        <label class="radio-wrapper">
        <input type="radio" name="light" value="day" class="radiobutton" checked>
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g>
            <circle cx="19" cy="19.0002" r="18.5" fill="white"></circle>
            <path d="M19 24.5467C22.0635 24.5467 24.5469 22.0632 24.5469 18.9998C24.5469 15.9363 22.0635 13.4529 19 13.4529C15.9366 13.4529 13.4531 15.9363 13.4531 18.9998C13.4531 22.0632 15.9366 24.5467 19 24.5467Z" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M19 7.30005V9.6401" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M10.7285 10.7268L12.3819 12.3817" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M7.30078 18.9998H9.64083" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M10.7285 27.2725L12.3834 25.6182" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M19 30.6999V28.3589" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M27.2726 27.2725L25.6172 25.6182" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M30.6994 19.0002H28.3594" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M27.2726 10.7268L25.6172 12.3817" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
          </g>
        </svg>
      </label>
        <label class="radio-wrapper">
        <input type="radio" name="light" class="radiobutton" value="dusk">
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g>
            <circle cx="19" cy="19" r="18.5" fill="white"></circle>
            <path d="M24.4979 28.9589C24.4979 25.923 22.0368 23.4619 19.0009 23.4619C15.965 23.4619 13.5039 25.923 13.5039 28.9589" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M19 17.3643V19.6833" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M10.8008 20.7603L12.4393 22.4003" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M30.25 28.9592L7.75 28.9592" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M27.1991 20.7603L25.5586 22.4003" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M18.998 5.90894L18.998 12.1489" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
            <path d="M15.8887 10.3416L18.9258 12.7283" stroke="#282828" stroke-width="2" stroke-linecap="round"></path>
            <path d="M22.1113 10.3416L19.0742 12.7283" stroke="#282828" stroke-width="2" stroke-linecap="round"></path>
          </g>
        </svg>
      </label>
        <label class="radio-wrapper">
        <input type="radio" name="light" class="radiobutton" value="night">
        <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g>
            <circle cx="19" cy="19" r="18.5" fill="white"></circle>
            <path d="M18.53 27.9489C14.9462 28.7919 11.3593 27.5714 9.01172 25.0631C10.617 25.5423 12.3651 25.6235 14.1138 25.2139C19.4467 23.9597 22.7537 18.6189 21.4996 13.2864C21.0884 11.5378 20.2364 10.01 19.0919 8.78589C22.3837 9.77013 25.0744 12.4361 25.9173 16.0214C27.1705 21.3549 23.864 26.6947 18.53 27.9489Z" stroke="#282828" stroke-width="2" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"></path>
          </g>
        </svg>
      </label>
    </div>

    <div id="map"></div>

    <!-- Airport selector -->
    <div class="airport-bar expanded" id="airport-bar">
        <div class="bar-main">
            <button id="tour-toggle" class="tour-btn">▶ Play</button>
            <button id="chips-toggle" class="chips-toggle" title="Choose airport" aria-label="Choose airport">▾</button>
            <span class="live"><i></i></span>
            <div class="current" id="current-airport"></div>
        </div>
        <div class="bar-drawer">
            <div class="airport-buttons" id="airport-buttons"></div>
        </div>
    </div>

    <script>
        // mapboxgl.accessToken is set by utils.js (loaded in <head>).

        // Brazilian airports — all 11 render indoor floor plans in the live
        // Standard-style indoor view (verified visually). Centers are the
        // double-clicked terminal-building locations.
        const airports = {
            GRU: { name: 'Guarulhos International Airport', city: 'São Paulo', center: [-46.47619, -23.424374], indoor: true },
            CGH: { name: 'Congonhas Airport', city: 'São Paulo', center: [-46.660656, -23.625482], indoor: true },
            GIG: { name: 'Rio Galeão – Tom Jobim International', city: 'Rio de Janeiro', center: [-43.246601, -22.815072], indoor: true },
            SDU: { name: 'Santos Dumont Airport', city: 'Rio de Janeiro', center: [-43.166604, -22.91249], indoor: true },
            CNF: { name: 'Tancredo Neves International Airport', city: 'Belo Horizonte', center: [-43.963513, -19.632543], indoor: true },
            BSB: { name: 'Presidente Juscelino Kubitschek International', city: 'Brasília', center: [-47.920906, -15.870004], indoor: true },
            SSA: { name: 'Dep. Luiz Eduardo Magalhães International', city: 'Salvador', center: [-38.334221, -12.914349], indoor: true },
            VCP: { name: 'Viracopos International Airport', city: 'Campinas', center: [-47.149183, -23.008198], indoor: true },
            CWB: { name: 'Afonso Pena Airport', city: 'Curitiba', center: [-49.173006, -25.536412], indoor: true },
            FLN: { name: 'Hercílio Luz International Airport', city: 'Florianópolis', center: [-48.545623, -27.673785], indoor: true },
            FOR: { name: 'Pinto Martins International Airport', city: 'Fortaleza', center: [-38.54065, -3.778521], indoor: true }
        };

        const DEFAULT_CODE = 'GRU';

        const map = new mapboxgl.Map({
            container: 'map',
            style: "mapbox://styles/mapbox/standard",
            zoom: 18,
            pitch: 45,
            bearing: 0,
            center: airports[DEFAULT_CODE].center,
            // Enable Mapbox Indoor Maps (backed by the mapbox-geodata.indoor-v3-0-1 tileset).
            config: {
                basemap: {
                    showIndoor: true
                }
            }
        });

        // Built-in floor / level selector. Auto-populates when the view contains
        // a building with indoor data (zoom 16+).
        map.addControl(new mapboxgl.IndoorControl(), 'top-right');

        // Build the airport selector buttons.
        const buttonsEl = document.getElementById('airport-buttons');
        const currentEl = document.getElementById('current-airport');
        const barEl = document.getElementById('airport-bar');
        const chipsToggle = document.getElementById('chips-toggle');

        // Expand / collapse the airport chip drawer.
        chipsToggle.addEventListener('click', () => barEl.classList.toggle('expanded'));

        function setCurrent(code) {
            const a = airports[code];
            currentEl.innerHTML = `<span class="cur-title">${a.name}</span><span class="cur-sub">${a.city}</span>`;
            document.querySelectorAll('.airport-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.code === code);
            });
        }

        function flyToAirport(code) {
            const a = airports[code];
            if (!a) return;
            setCurrent(code);
            map.flyTo({ center: a.center, zoom: 18, pitch: 45, bearing: 0, duration: 2000, essential: true });
        }

        Object.keys(airports).forEach(code => {
            const btn = document.createElement('button');
            btn.className = 'airport-btn';
            btn.dataset.code = code;
            btn.textContent = code;
            btn.title = `${airports[code].name} — ${airports[code].city}`;
            btn.addEventListener('click', () => { stopTour(); flyToAirport(code); });
            buttonsEl.appendChild(btn);
        });

        setCurrent(DEFAULT_CODE);

        map.on('style.load', () => {
            // Light preset selector (dawn / day / dusk / night)
            document.querySelectorAll('input[type="radio"]').forEach((radioButton) => {
                radioButton.addEventListener('change', function () {
                    map.setConfigProperty('basemap', 'lightPreset', this.value);
                });
            });
        });

        // Coordinate helper: double-click anywhere to log a paste-ready center.
        // Use this to capture the terminal-building location for each airport's
        // fly-to center (e.g. to frame the indoor floor plan instead of a runway).
        map.on('dblclick', (e) => {
            const lng = +e.lngLat.lng.toFixed(6);
            const lat = +e.lngLat.lat.toFixed(6);
            const code = document.querySelector('.airport-btn.active')?.dataset.code || '?';
            console.log(`[${code}] center: [${lng}, ${lat}]   zoom ${map.getZoom().toFixed(2)}`);
        });

        // ---- Cinematic tour ---------------------------------------------------
        // Play/Stop button drives a looping camera tour: fly to each airport,
        // step through its floors while the camera rotates, cycle the light
        // preset across stops, then loop. Floors are changed by clicking the
        // IndoorControl's buttons (no public programmatic floor API in v3.21).
        const LIGHT_PRESETS = ['dawn', 'day', 'dusk', 'night'];
        const tourBtn = document.getElementById('tour-toggle');
        let tourRunning = false;
        let tourToken = 0;   // bumping this cancels any in-flight tour loop

        // Wait `ms`, resolving early if the tour was stopped/restarted.
        function sleep(ms, token) {
            return new Promise(resolve => {
                const id = setTimeout(resolve, ms);
                const check = setInterval(() => {
                    if (token !== tourToken) { clearTimeout(id); clearInterval(check); resolve(); }
                }, 100);
                setTimeout(() => clearInterval(check), ms + 60);
            });
        }

        function waitForArrival() {
            return new Promise(resolve => {
                map.once('moveend', () => setTimeout(resolve, 250));
            });
        }

        // Poll the IndoorControl until floor buttons appear (building detected).
        function waitForFloors(timeoutMs, token) {
            return new Promise(resolve => {
                const t0 = Date.now();
                const tick = setInterval(() => {
                    const labels = [...document.querySelectorAll('.mapboxgl-ctrl-level-button')]
                        .map(b => b.getAttribute('aria-label'));
                    if (labels.length || Date.now() - t0 > timeoutMs || token !== tourToken) {
                        clearInterval(tick);
                        resolve(labels);
                    }
                }, 150);
            });
        }

        function selectFloor(label) {
            document.querySelector(`.mapboxgl-ctrl-level-button[aria-label="${label}"]`)?.click();
        }

        function setLightPreset(name) {
            map.setConfigProperty('basemap', 'lightPreset', name);
            const radio = document.querySelector(`input[name="light"][value="${name}"]`);
            if (radio) radio.checked = true;
        }

        async function runTour() {
            const codes = Object.keys(airports);
            const myToken = tourToken;
            // Start from the currently selected airport, not the top of the list.
            const activeCode = document.querySelector('.airport-btn.active')?.dataset.code;
            let i = Math.max(0, codes.indexOf(activeCode));
            while (myToken === tourToken) {
                const code = codes[i % codes.length];
                const a = airports[code];

                setCurrent(code);
                setLightPreset(LIGHT_PRESETS[i % LIGHT_PRESETS.length]);

                let bearing = 0;
                // Travel arc: a higher curve makes the camera pull up and back down
                // in flight, so long cross-country legs read like an actual flight.
                // Land slightly zoomed out (17.4) so the arrival can push in to 18.
                map.flyTo({ center: a.center, zoom: 17.4, pitch: 50, bearing, curve: 1.9, duration: 3200, essential: true });
                await waitForArrival();
                if (myToken !== tourToken) return;

                // Let the indoor control settle on the new building before reading floors.
                await sleep(800, myToken);
                const floors = await waitForFloors(4000, myToken);
                if (myToken !== tourToken) return;

                const dwell = 1800;   // time spent on each floor (rotation runs over this)
                let first = true;     // push in to zoom 18 on the first floor (arrival dolly)
                if (floors.length) {
                    // DOM lists floors high→low; walk low→high for a natural climb.
                    for (const f of floors.slice().reverse()) {
                        if (myToken !== tourToken) return;
                        selectFloor(f);
                        bearing += 30;   // degrees rotated during this floor's dwell
                        const opts = { bearing, pitch: 50, duration: dwell, easing: t => t };
                        if (first) { opts.zoom = 18; first = false; }   // arrival push-in
                        map.easeTo(opts);
                        await sleep(dwell, myToken);
                    }
                } else {
                    // No floors detected — still push in and rotate so the stop has motion.
                    bearing += 60;
                    map.easeTo({ zoom: 18, bearing, pitch: 50, duration: 2500, easing: t => t });
                    await sleep(2500, myToken);
                }

                await sleep(600, myToken);
                i++;
            }
        }

        function startTour() {
            tourRunning = true;
            tourToken++;
            tourBtn.textContent = '■ Stop';
            tourBtn.classList.add('running');
            barEl.classList.add('touring');
            barEl.classList.remove('expanded');
            runTour();
        }

        function stopTour() {
            if (!tourRunning) return;
            tourRunning = false;
            tourToken++;     // cancels in-flight awaits
            map.stop();      // halt the current camera animation
            tourBtn.textContent = '▶ Play';
            tourBtn.classList.remove('running');
            barEl.classList.remove('touring');
            barEl.classList.add('expanded');
        }

        tourBtn.addEventListener('click', () => {
            if (tourRunning) stopTour(); else startTour();
        });
    </script>
</body>

</html>
