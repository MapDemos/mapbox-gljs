---
layout: none
title: Indoor Airports - Search
---

<!DOCTYPE html>
<html lang="en">

<head>
    <title>Indoor Airports - Search</title>
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

        /* Airport search — compact flight-information bar */
        .search-bar {
            position: absolute;
            z-index: 2;
            left: 206px;
            top: 18px;
            width: 360px;
            max-width: calc(100vw - 224px);
            border-radius: 14px;
            background: var(--glass);
            -webkit-backdrop-filter: blur(22px) saturate(140%);
            backdrop-filter: blur(22px) saturate(140%);
            border: 1px solid var(--hairline);
            box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
        }

        .search-row {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 9px 13px;
        }

        .search-icon {
            flex: none;
            width: 16px;
            height: 16px;
            color: var(--muted);
        }

        .search-icon svg {
            width: 100%;
            height: 100%;
        }

        #airport-input {
            flex: 1;
            min-width: 0;
            background: transparent;
            border: none;
            outline: none;
            color: var(--ink);
            font-family: 'IBM Plex Mono', monospace;
            font-size: 13px;
            letter-spacing: 0.02em;
        }

        #airport-input::placeholder {
            color: var(--muted);
        }

        .search-clear {
            flex: none;
            display: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: none;
            background: rgba(255, 255, 255, 0.08);
            color: var(--muted);
            cursor: pointer;
            font-size: 13px;
            line-height: 1;
        }

        .search-clear.visible {
            display: block;
        }

        .search-clear:hover {
            color: var(--ink);
            background: rgba(255, 255, 255, 0.16);
        }

        /* Suggestion dropdown, filtered from the in-memory airport list */
        .search-dropdown {
            display: none;
            max-height: 280px;
            overflow-y: auto;
            border-top: 1px solid var(--hairline);
        }

        .search-dropdown.visible {
            display: block;
        }

        .search-option {
            display: flex;
            align-items: baseline;
            gap: 10px;
            padding: 9px 13px;
            cursor: pointer;
            transition: background 0.12s ease;
        }

        .search-option:hover,
        .search-option.highlighted {
            background: rgba(255, 176, 0, 0.12);
        }

        .search-option .opt-code {
            flex: none;
            font-family: 'Bebas Neue', sans-serif;
            font-size: 16px;
            letter-spacing: 1px;
            color: var(--amber);
            width: 40px;
        }

        .search-option .opt-name {
            flex: 1;
            min-width: 0;
            font-size: 12px;
            color: var(--ink);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .search-empty {
            padding: 12px 13px;
            font-size: 12px;
            color: var(--muted);
        }

        /* Status / current-selection readout beneath the search field */
        .search-status {
            display: none;
            align-items: center;
            gap: 8px;
            padding: 0 13px 11px;
        }

        .search-status.visible {
            display: flex;
        }

        .status-dot {
            flex: none;
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: var(--amber);
        }

        .status-text {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 1px;
        }

        .status-title {
            font-family: 'Bebas Neue', sans-serif;
            font-size: 17px;
            line-height: 1;
            letter-spacing: 1px;
            color: var(--ink);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .status-sub {
            font-size: 10px;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--muted);
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
            .search-bar {
                left: 10px;
                right: 10px;
                width: auto;
                max-width: none;
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

    <!-- Airport search -->
    <div class="search-bar" id="search-bar">
        <div class="search-row">
            <span class="search-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"></circle>
                    <path d="M20 20L16.5 16.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
                </svg>
            </span>
            <input id="airport-input" type="text" placeholder="Search for an airport…" autocomplete="off" spellcheck="false">
            <button class="search-clear" id="search-clear" aria-label="Clear search">✕</button>
        </div>
        <div class="search-dropdown" id="search-dropdown"></div>
        <div class="search-status" id="search-status">
            <span class="status-dot"></span>
            <div class="status-text">
                <span class="status-title" id="status-title"></span>
                <span class="status-sub" id="status-sub"></span>
            </div>
        </div>
    </div>

    <script>
        // mapboxgl.accessToken is set by utils.js (loaded in <head>).

        // In-memory airport directory. Coordinates were resolved once via the
        // Google Places Text Search API and baked in here so the demo's fly-to
        // is instant and does not depend on a live geocoding call at search time.
        const AIRPORTS = [
            { code: 'LGA', name: 'LaGuardia Airport', lat: 40.776639, lng: -73.87425 },
            { code: 'JFK', name: 'John F Kennedy International Airport', lat: 40.644616, lng: -73.779722 },
            { code: 'SFO', name: 'San Francisco International Airport', lat: 37.619114, lng: -122.381627 },
            { code: 'BOS', name: 'Logan International Airport', lat: 42.365602, lng: -71.009614 },
            { code: 'MCO', name: 'Orlando International Airport', lat: 28.424442, lng: -81.310459 },
            { code: 'ORD', name: 'Chicago O\'Hare International Airport', lat: 41.980259, lng: -87.908986 },
            { code: 'LAS', name: 'Harry Reid International Airport', lat: 36.083091, lng: -115.148224 },
            { code: 'EWR', name: 'Newark Liberty International Airport', lat: 40.688484, lng: -74.176864 },
            { code: 'MIA', name: 'Miami International Airport', lat: 25.79235, lng: -80.282306 },
            { code: 'LAX', name: 'Los Angeles International Airport', lat: 33.942153, lng: -118.403605 },
            { code: 'ATL', name: 'Hartsfield Jackson Atlanta International Airport', lat: 33.632419, lng: -84.433312 },
            { code: 'CGH', name: 'Congonhas Airport', lat: -23.625602, lng: -46.658472 },
            { code: 'GRU', name: 'Guarulhos - Governador André Franco Montoro International Airport', lat: -23.430217, lng: -46.471671 },
            { code: 'SEA', name: 'Seattle–Tacoma International Airport', lat: 47.448365, lng: -122.308593 },
            { code: 'SYD', name: 'Sydney Kingsford Smith International Airport', lat: -33.950033, lng: 151.181696 },
            { code: 'LCY', name: 'London City Airport', lat: 51.505141, lng: 0.052062 },
            { code: 'LGW', name: 'London Gatwick Airport', lat: 51.153662, lng: -0.182063 },
            { code: 'MEX', name: 'Benito Juárez International Airport', lat: 19.436076, lng: -99.071908 },
            { code: 'LHR', name: 'London Heathrow Airport', lat: 51.46799, lng: -0.455047 },
            { code: 'YYZ', name: 'Toronto Lester B. Pearson International Airport', lat: 43.679835, lng: -79.628383 },
            { code: 'DFW', name: 'Dallas Fort Worth International Airport', lat: 32.892198, lng: -97.039123 },
            { code: 'PHX', name: 'Phoenix Sky Harbor International Airport', lat: 33.435249, lng: -112.010124 },
            { code: 'IAH', name: 'George Bush Intercontinental Houston Airport', lat: 29.993106, lng: -95.341625 },
            { code: 'DEN', name: 'Denver International Airport', lat: 39.856349, lng: -104.676406 },
            { code: 'DCA', name: 'Ronald Reagan Washington National Airport', lat: 38.850108, lng: -77.039176 },
            { code: 'SAN', name: 'San Diego International Airport', lat: 32.732891, lng: -117.189713 },
            { code: 'FLL', name: 'Fort Lauderdale Hollywood International Airport', lat: 26.073173, lng: -80.151232 },
            { code: 'TPA', name: 'Tampa International Airport', lat: 27.976865, lng: -82.53028 },
            { code: 'PHL', name: 'Philadelphia International Airport', lat: 39.87298, lng: -75.243699 },
            { code: 'AUS', name: 'Austin Bergstrom International Airport', lat: 30.194085, lng: -97.671089 },
            { code: 'HKG', name: 'Hong Kong International Airport', lat: 22.313474, lng: 113.913728 },
            { code: 'MEL', name: 'Melbourne International Airport', lat: -37.670823, lng: 144.842976 },
            { code: 'ORY', name: 'Paris-Orly Airport', lat: 48.729918, lng: 2.37323 },
            { code: 'MAD', name: 'Adolfo Suárez Madrid–Barajas Airport', lat: 40.489515, lng: -3.564276 },
            { code: 'CDG', name: 'Charles de Gaulle International Airport', lat: 49.007883, lng: 2.550786 },
            { code: 'BNA', name: 'Nashville International Airport', lat: 36.124885, lng: -86.676218 },
            { code: 'IAD', name: 'Washington Dulles International Airport', lat: 38.952248, lng: -77.457889 },
            { code: 'AMS', name: 'Amsterdam Airport Schiphol', lat: 52.312787, lng: 4.74017 },
            { code: 'MAN', name: 'Manchester Airport', lat: 53.355357, lng: -2.277162 },
            { code: 'MSY', name: 'Louis Armstrong New Orleans International Airport', lat: 29.994032, lng: -90.259657 },
            { code: 'STN', name: 'London Stansted Airport', lat: 51.886375, lng: 0.241316 },
            { code: 'BNE', name: 'Brisbane International Airport', lat: -27.394621, lng: 153.12369 },
            { code: 'MSP', name: 'Minneapolis–Saint Paul International Airport / Wold–Chamberlain Field', lat: 44.885059, lng: -93.214435 },
            { code: 'MDW', name: 'Chicago Midway International Airport', lat: 41.786776, lng: -87.752188 },
            { code: 'YUL', name: 'Montreal / Pierre Elliott Trudeau International Airport', lat: 45.465787, lng: -73.745404 },
            { code: 'PER', name: 'Perth International Airport', lat: -31.938548, lng: 115.967249 },
            { code: 'CLT', name: 'Charlotte Douglas International Airport', lat: 35.216299, lng: -80.953943 },
            { code: 'DTW', name: 'Detroit Metropolitan Wayne County Airport', lat: 42.21322, lng: -83.352482 },
            { code: 'BWI', name: 'Baltimore/Washington International Thurgood Marshall Airport', lat: 39.177414, lng: -76.668393 },
            { code: 'DEL', name: 'Indira Gandhi International Airport', lat: 28.556144, lng: 77.099962 },
            { code: 'DXB', name: 'Dubai International Airport', lat: 25.25154, lng: 55.368307 },
            { code: 'BLR', name: 'Kempegowda International Airport', lat: 13.198909, lng: 77.706893 },
            { code: 'SLC', name: 'Salt Lake City International Airport', lat: 40.790315, lng: -111.977144 },
            { code: 'ZRH', name: 'Zürich Airport', lat: 47.461714, lng: 8.55086 },
            { code: 'BOM', name: 'Chhatrapati Shivaji International Airport', lat: 19.090218, lng: 72.862812 },
            { code: 'FRA', name: 'Frankfurt Airport', lat: 50.037725, lng: 8.559256 },
            { code: 'HND', name: 'Tokyo Haneda International Airport', lat: 35.548296, lng: 139.777995 },
            { code: 'YVR', name: 'Vancouver International Airport', lat: 49.193374, lng: -123.175128 },
            { code: 'SJC', name: 'Norman Y. Mineta San Jose International Airport', lat: 37.36353, lng: -121.928593 },
            { code: 'SNA', name: 'John Wayne Orange County International Airport', lat: 33.674687, lng: -117.869242 },
            { code: 'PDX', name: 'Portland International Airport', lat: 45.58527, lng: -122.591718 },
            { code: 'LIS', name: 'Humberto Delgado Airport (Lisbon Portela Airport)', lat: 38.778845, lng: -9.131976 },
            { code: 'VIE', name: 'Vienna International Airport', lat: 48.117948, lng: 16.566258 },
            { code: 'LTN', name: 'London Luton Airport', lat: 51.875462, lng: -0.372755 },
            { code: 'RDU', name: 'Raleigh Durham International Airport', lat: 35.879768, lng: -78.785551 },
            { code: 'OAK', name: 'San Francisco Bay Oakland International Airport', lat: 37.719037, lng: -122.219589 },
            { code: 'AKL', name: 'Auckland International Airport', lat: -37.008937, lng: 174.786381 },
            { code: 'HNL', name: 'Daniel K Inouye International Airport', lat: 21.318662, lng: -157.925402 },
            { code: 'DAL', name: 'Dallas Love Field', lat: 32.843835, lng: -96.848495 },
            { code: 'BCN', name: 'Josep Tarradellas Barcelona-El Prat Airport', lat: 41.29834, lng: 2.08001 },
            { code: 'PBI', name: 'Palm Beach International Airport', lat: 26.685748, lng: -80.092816 },
            { code: 'STL', name: 'St. Louis Lambert International Airport', lat: 38.74994, lng: -90.374819 },
            { code: 'BUR', name: 'Hollywood Burbank Airport', lat: 34.198312, lng: -118.357404 },
            { code: 'HOU', name: 'William P Hobby Airport', lat: 29.645914, lng: -95.276895 },
            { code: 'RSW', name: 'Southwest Florida International Airport', lat: 26.531872, lng: -81.759565 },
            { code: 'PIT', name: 'Pittsburgh International Airport', lat: 40.492854, lng: -80.237294 },
            { code: 'BHX', name: 'Birmingham Airport', lat: 52.452374, lng: -1.743508 },
            { code: 'GIG', name: 'Rio Galeão – Tom Jobim International Airport', lat: -22.80527, lng: -43.256628 },
            { code: 'RUH', name: 'King Khaled International Airport', lat: 24.959443, lng: 46.701083 },
            { code: 'YYC', name: 'Calgary International Airport', lat: 51.121653, lng: -114.008052 },
            { code: 'NCE', name: 'Nice-Côte d\'Azur Airport', lat: 43.65987, lng: 7.214201 },
            { code: 'MCI', name: 'Kansas City International Airport', lat: 39.301409, lng: -94.710454 },
            { code: 'SMF', name: 'Sacramento International Airport', lat: 38.694402, lng: -121.588812 },
            { code: 'BER', name: 'Berlin Brandenburg Airport', lat: 52.364965, lng: 13.501047 },
            { code: 'IND', name: 'Indianapolis International Airport', lat: 39.722299, lng: -86.301956 },
            { code: 'SAT', name: 'San Antonio International Airport', lat: 29.533128, lng: -98.470542 },
            { code: 'ATH', name: 'Athens Eleftherios Venizelos International Airport', lat: 37.936175, lng: 23.946526 },
            { code: 'MUC', name: 'Munich Airport', lat: 48.353641, lng: 11.783185 },
            { code: 'HYD', name: 'Rajiv Gandhi International Airport', lat: 17.240283, lng: 78.429358 },
            { code: 'PRG', name: 'Václav Havel Airport Prague', lat: 50.101791, lng: 14.263181 },
            { code: 'AGP', name: 'Málaga-Costa del Sol Airport', lat: 36.676743, lng: -4.49387 },
            { code: 'SCL', name: 'Comodoro Arturo Merino Benítez International Airport', lat: -33.389761, lng: -70.794402 },
            { code: 'SJU', name: 'Luis Munoz Marin International Airport', lat: 18.439504, lng: -65.999227 },
            { code: 'CLE', name: 'Cleveland Hopkins International Airport', lat: 41.405799, lng: -81.853867 },
            { code: 'OOL', name: 'Gold Coast Airport', lat: -28.163169, lng: 153.506841 },
            { code: 'EDI', name: 'Edinburgh Airport', lat: 55.947178, lng: -3.360795 },
            { code: 'ARN', name: 'Stockholm-Arlanda Airport', lat: 59.649393, lng: 17.934294 },
            { code: 'JAX', name: 'Jacksonville International Airport', lat: 30.494331, lng: -81.68715 },
            { code: 'CHS', name: 'Charleston International Airport', lat: 32.891665, lng: -80.039523 },
            { code: 'DUB', name: 'Dublin Airport', lat: 53.425632, lng: -6.257375 },
            { code: 'CMH', name: 'John Glenn Columbus International Airport', lat: 39.99994, lng: -82.887177 },
            { code: 'BOG', name: 'El Dorado International Airport', lat: 4.700969, lng: -74.146093 },
            { code: 'CVG', name: 'Cincinnati Northern Kentucky International Airport', lat: 39.051351, lng: -84.667145 },
            { code: 'BRU', name: 'Brussels Airport', lat: 50.90024, lng: 4.485944 },
            { code: 'MTY', name: 'Monterrey International Airport', lat: 25.778831, lng: -100.109465 },
            { code: 'TPE', name: 'Taiwan Taoyuan International Airport', lat: 25.080488, lng: 121.231158 },
            { code: 'ADL', name: 'Adelaide International Airport', lat: -34.946237, lng: 138.531202 },
            { code: 'FCO', name: 'Rome–Fiumicino Leonardo da Vinci International Airport', lat: 41.803463, lng: 12.251921 },
            { code: 'JNB', name: 'O.R. Tambo International Airport', lat: -26.139391, lng: 28.246795 },
            { code: 'GDL', name: 'Guadalajara International Airport', lat: 20.525542, lng: -103.309643 },
            { code: 'ONT', name: 'Ontario International Airport', lat: 34.055998, lng: -117.598092 },
            { code: 'WAW', name: 'Warsaw Chopin Airport', lat: 52.164868, lng: 20.969163 },
            { code: 'SDU', name: 'Santos Dumont Airport', lat: -22.909796, lng: -43.163816 },
            { code: 'LIN', name: 'Milano Linate Airport', lat: 45.45333, lng: 9.276286 },
            { code: 'OMA', name: 'Eppley Airfield', lat: 41.301475, lng: -95.894521 },
            { code: 'OTP', name: 'Bucharest Henri Coandă International Airport', lat: 44.566864, lng: 26.094927 },
            { code: 'CNF', name: 'Tancredo Neves International Airport', lat: -19.636976, lng: -43.965132 },
            { code: 'AEP', name: 'Jorge Newbery Airpark', lat: -34.559018, lng: -58.415651 },
            { code: 'ISL', name: 'İstanbul Atatürk Airport', lat: 40.978719, lng: 28.819564 },
            { code: 'EZE', name: 'Minister Pistarini International Airport', lat: -34.81647, lng: -58.537242 },
            { code: 'YEG', name: 'Edmonton International Airport', lat: 53.30266, lng: -113.576882 },
            { code: 'CPT', name: 'Cape Town International Airport', lat: -33.968871, lng: 18.59976 },
            { code: 'MXP', name: 'Milan Malpensa International Airport', lat: 45.622714, lng: 8.728235 },
            { code: 'BSB', name: 'Presidente Juscelino Kubitschek International Airport', lat: -15.87069, lng: -47.919348 },
            { code: 'BDL', name: 'Bradley International Airport', lat: 41.938874, lng: -72.686031 },
            { code: 'SPU', name: 'Split Airport', lat: 43.536704, lng: 16.299025 },
            { code: 'YOW', name: 'Ottawa Macdonald-Cartier International Airport', lat: 45.320169, lng: -75.665622 },
            { code: 'PVD', name: 'Theodore Francis Green State Airport', lat: 41.723512, lng: -71.426988 },
            { code: 'MRS', name: 'Marseille Provence Airport', lat: 43.43835, lng: 5.214457 },
            { code: 'CCU', name: 'Netaji Subhash Chandra Bose International Airport', lat: 22.653564, lng: 88.445085 },
            { code: 'BRS', name: 'Bristol Airport', lat: 51.383053, lng: -2.717168 },
            { code: 'WLG', name: 'Wellington International Airport', lat: -41.326957, lng: 174.807619 },
            { code: 'MKE', name: 'General Mitchell International Airport', lat: 42.943886, lng: -87.900765 },
            { code: 'HPN', name: 'Westchester County Airport', lat: 41.068333, lng: -73.708664 },
            { code: 'GLA', name: 'Glasgow International Airport', lat: 55.870042, lng: -4.434543 },
            { code: 'LGB', name: 'Long Beach Airport (Daugherty Field)', lat: 33.816106, lng: -118.151256 },
            { code: 'PTY', name: 'Tocumen International Airport', lat: 9.069088, lng: -79.38301 },
            { code: 'DOH', name: 'Hamad International Airport', lat: 25.260059, lng: 51.614917 },
            { code: 'ORF', name: 'Norfolk International Airport', lat: 36.893511, lng: -76.199371 },
            { code: 'MDE', name: 'Jose Maria Córdova International Airport', lat: 6.17149, lng: -75.427945 },
            { code: 'LYS', name: 'Lyon Saint-Exupéry Airport', lat: 45.723418, lng: 5.088777 },
            { code: 'BUD', name: 'Budapest Liszt Ferenc International Airport', lat: 47.438516, lng: 19.25403 },
            { code: 'SRQ', name: 'Sarasota Bradenton International Airport', lat: 27.395077, lng: -82.553799 },
            { code: 'DUS', name: 'Düsseldorf Airport', lat: 51.287468, lng: 6.768555 },
            { code: 'GVA', name: 'Geneva Cointrin International Airport', lat: 46.227174, lng: 6.102626 },
            { code: 'LIM', name: 'Jorge Chávez International Airport', lat: -12.029701, lng: -77.116228 },
            { code: 'PSP', name: 'Palm Springs International Airport', lat: 33.830319, lng: -116.507047 },
            { code: 'ICN', name: 'Incheon International Airport', lat: 37.458666, lng: 126.441968 },
            { code: 'SAV', name: 'Savannah Hilton Head International Airport', lat: 32.129423, lng: -81.201871 },
            { code: 'BUF', name: 'Buffalo Niagara International Airport', lat: 42.939405, lng: -78.733501 },
            { code: 'SDF', name: 'Louisville Muhammad Ali International Airport', lat: 38.170655, lng: -85.730767 },
            { code: 'RNO', name: 'Reno Tahoe International Airport', lat: 39.50531, lng: -119.771053 },
            { code: 'OKC', name: 'Will Rogers World Airport', lat: 35.388842, lng: -97.600118 },
            { code: 'CBR', name: 'Canberra International Airport', lat: -35.305303, lng: 149.193307 },
            { code: 'NRT', name: 'Narita International Airport', lat: 35.770178, lng: 140.384322 },
            { code: 'CWB', name: 'Afonso Pena Airport', lat: -25.531499, lng: -49.174026 },
            { code: 'CHC', name: 'Christchurch International Airport', lat: -43.48763, lng: 172.537403 },
            { code: 'YTZ', name: 'Billy Bishop Toronto City Centre Airport', lat: 43.628947, lng: -79.39442 },
            { code: 'SAW', name: 'Istanbul Sabiha Gökçen International Airport', lat: 40.894475, lng: 29.313093 },
            { code: 'AMD', name: 'Sardar Vallabh Bhai Patel International Airport', lat: 23.076396, lng: 72.631 },
            { code: 'SSA', name: 'Deputado Luiz Eduardo Magalhães International Airport', lat: -12.915734, lng: -38.335014 },
            { code: 'RIC', name: 'Richmond International Airport', lat: 37.510556, lng: -77.326699 },
            { code: 'VCP', name: 'Viracopos International Airport', lat: -23.004982, lng: -47.142572 },
            { code: 'FLN', name: 'Hercílio Luz International Airport', lat: -27.674547, lng: -48.546156 },
            { code: 'HEL', name: 'Helsinki Vantaa Airport', lat: 60.317945, lng: 24.949624 },
            { code: 'TLS', name: 'Toulouse-Blagnac Airport', lat: 43.631346, lng: 1.36449 },
            { code: 'LPL', name: 'Liverpool John Lennon Airport', lat: 53.335116, lng: -2.852346 },
            { code: 'SVQ', name: 'Sevilla Airport', lat: 37.42027, lng: -5.890794 },
            { code: 'SJO', name: 'Juan Santamaría International Airport', lat: 9.998166, lng: -84.20476 },
            { code: 'YWG', name: 'Winnipeg / James Armstrong Richardson International Airport', lat: 49.909744, lng: -97.236391 },
            { code: 'CNS', name: 'Cairns International Airport', lat: -16.877763, lng: 145.749935 },
            { code: 'CGN', name: 'Cologne Bonn Airport', lat: 50.866807, lng: 7.139732 },
            { code: 'YHZ', name: 'Halifax / Stanfield International Airport', lat: 44.882503, lng: -63.515175 },
            { code: 'TUS', name: 'Tucson International Airport / Morris Air National Guard Base', lat: 32.131032, lng: -110.949114 },
            { code: 'NCL', name: 'Newcastle International Airport', lat: 55.039346, lng: -1.693128 },
            { code: 'OPO', name: 'Francisco de Sá Carneiro Airport', lat: 41.247399, lng: -8.680664 },
            { code: 'MEM', name: 'Memphis International Airport', lat: 35.044336, lng: -89.976619 },
            { code: 'CAI', name: 'Cairo International Airport', lat: 30.116034, lng: 31.417173 },
            { code: 'GSP', name: 'Greenville Spartanburg International Airport', lat: 34.895901, lng: -82.217234 },
            { code: 'LBA', name: 'Leeds Bradford Airport', lat: 53.866705, lng: -1.658628 },
            { code: 'BHM', name: 'Birmingham-Shuttlesworth International Airport', lat: 33.562509, lng: -86.754157 },
            { code: 'ITM', name: 'Osaka Itami Airport', lat: 34.786161, lng: 135.438048 },
            { code: 'HAM', name: 'Hamburg Airport', lat: 53.631899, lng: 9.9958 },
            { code: 'VCE', name: 'Venice Marco Polo Airport', lat: 45.504684, lng: 12.34663 },
            { code: 'OGG', name: 'Kahului International Airport', lat: 20.894598, lng: -156.436074 },
            { code: 'AUH', name: 'Zayed International Airport', lat: 24.451426, lng: 54.642123 },
            { code: 'BOI', name: 'Boise Air Terminal/Gowen Field', lat: 43.560949, lng: -116.217449 },
            { code: 'SJD', name: 'Aeropuerto Internacional de Los Cabos', lat: 23.145536, lng: -109.718266 },
            { code: 'KRK', name: 'Kraków John Paul II International Airport', lat: 50.078785, lng: 19.788722 },
            { code: 'COK', name: 'Cochin International Airport', lat: 10.153213, lng: 76.39332 },
            { code: 'JED', name: 'King Abdulaziz International Airport', lat: 21.682999, lng: 39.166715 },
            { code: 'MAA', name: 'Chennai International Airport', lat: 12.99396, lng: 80.170665 },
            { code: 'DMM', name: 'King Fahd International Airport', lat: 26.469966, lng: 49.798435 },
            { code: 'CUN', name: 'Aeropuerto Internacional de Cancún', lat: 21.041923, lng: -86.874384 },
            { code: 'SFB', name: 'Orlando Sanford International Airport', lat: 28.776016, lng: -81.234467 },
            { code: 'FOR', name: 'Pinto Martins International Airport', lat: -3.778791, lng: -38.540554 },
            { code: 'TIJ', name: 'Aeropuerto Internacional Gral. Abelardo Rodriguez', lat: 32.540845, lng: -116.969053 },
            { code: 'SBA', name: 'Santa Barbara Municipal', lat: 34.427479, lng: -119.842027 },
            { code: 'ROC', name: 'Greater Rochester International', lat: 43.116411, lng: -77.674777 },
            { code: 'CTS', name: 'New Chitose Airport', lat: 42.779132, lng: 141.686636 },
            { code: 'PMI', name: 'Palma de Mallorca Airport', lat: 39.552471, lng: 2.73938 },
            { code: 'GMP', name: 'Gimpo International Airport', lat: 37.565538, lng: 126.801328 },
            { code: 'BOD', name: 'Bordeaux-Mérignac Airport', lat: 44.82968, lng: -0.712904 }
        ];

        const map = new mapboxgl.Map({
            container: 'map',
            style: "mapbox://styles/mapbox/standard",
            zoom: 1.6,
            pitch: 0,
            bearing: 0,
            center: [10, 25],
            // Enable Mapbox Indoor Maps (backed by the mapbox-geodata.indoor-v3-0-1 tileset).
            // Coverage varies by airport — indoor floors render automatically at
            // zoom 16+ wherever the building has indoor data.
            config: {
                basemap: {
                    showIndoor: true
                }
            }
        });

        // Built-in floor / level selector. Auto-populates when the view contains
        // a building with indoor data (zoom 16+).
        map.addControl(new mapboxgl.IndoorControl(), 'top-right');

        map.on('style.load', () => {
            // Light preset selector (dawn / day / dusk / night)
            document.querySelectorAll('input[type="radio"]').forEach((radioButton) => {
                radioButton.addEventListener('change', function () {
                    map.setConfigProperty('basemap', 'lightPreset', this.value);
                });
            });
        });

        // ---- Searchable airport list -------------------------------------------
        const inputEl = document.getElementById('airport-input');
        const clearEl = document.getElementById('search-clear');
        const dropdownEl = document.getElementById('search-dropdown');
        const statusEl = document.getElementById('search-status');
        const statusTitleEl = document.getElementById('status-title');
        const statusSubEl = document.getElementById('status-sub');

        let matches = [];
        let highlightedIndex = -1;

        function normalize(s) {
            return s.toLowerCase();
        }

        // Filter the in-memory list by IATA code prefix or substring match on name.
        function filterAirports(query) {
            const q = normalize(query.trim());
            if (!q) return [];
            const startsWithCode = [];
            const nameMatch = [];
            for (const a of AIRPORTS) {
                const code = normalize(a.code);
                const name = normalize(a.name);
                if (code.startsWith(q)) startsWithCode.push(a);
                else if (name.includes(q)) nameMatch.push(a);
            }
            return startsWithCode.concat(nameMatch).slice(0, 8);
        }

        function renderDropdown() {
            dropdownEl.innerHTML = '';
            highlightedIndex = -1;
            if (!matches.length) {
                dropdownEl.classList.remove('visible');
                return;
            }
            matches.forEach((a) => {
                const row = document.createElement('div');
                row.className = 'search-option';
                row.innerHTML = `<span class="opt-code">${a.code}</span><span class="opt-name">${a.name}</span>`;
                row.addEventListener('mousedown', (e) => {
                    // mousedown (not click) so it fires before the input's blur
                    e.preventDefault();
                    chooseAirport(a);
                });
                dropdownEl.appendChild(row);
            });
            dropdownEl.classList.add('visible');
        }

        function setHighlight(index) {
            const rows = dropdownEl.querySelectorAll('.search-option');
            rows.forEach(r => r.classList.remove('highlighted'));
            if (index >= 0 && index < rows.length) {
                rows[index].classList.add('highlighted');
                rows[index].scrollIntoView({ block: 'nearest' });
            }
            highlightedIndex = index;
        }

        function closeDropdown() {
            dropdownEl.classList.remove('visible');
            dropdownEl.innerHTML = '';
            matches = [];
            highlightedIndex = -1;
        }

        function chooseAirport(airport) {
            inputEl.value = `${airport.code} — ${airport.name}`;
            closeDropdown();
            searchAirport(airport);
        }

        inputEl.addEventListener('input', () => {
            clearEl.classList.toggle('visible', inputEl.value.length > 0);
            matches = filterAirports(inputEl.value);
            renderDropdown();
        });

        inputEl.addEventListener('keydown', (e) => {
            if (!dropdownEl.classList.contains('visible')) return;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlight(Math.min(highlightedIndex + 1, matches.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlight(Math.max(highlightedIndex - 1, 0));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const pick = matches[highlightedIndex >= 0 ? highlightedIndex : 0];
                if (pick) chooseAirport(pick);
            } else if (e.key === 'Escape') {
                closeDropdown();
            }
        });

        inputEl.addEventListener('blur', () => {
            // Slight delay so a mousedown-selected option still registers.
            setTimeout(closeDropdown, 120);
        });

        clearEl.addEventListener('click', () => {
            inputEl.value = '';
            clearEl.classList.remove('visible');
            closeDropdown();
            statusEl.classList.remove('visible');
            inputEl.focus();
        });

        function showStatus(title, sub) {
            statusEl.classList.add('visible');
            statusTitleEl.textContent = title;
            statusSubEl.textContent = sub;
        }

        // Fly to the airport's pre-resolved coordinates (see AIRPORTS above —
        // baked in via a one-time Google Places lookup rather than a live geocode
        // per search, since worldwide free-text airport queries are unreliable to
        // resolve on the fly without a location bias).
        function searchAirport(airport) {
            showStatus(airport.name, airport.code);

            map.flyTo({
                center: [airport.lng, airport.lat],
                zoom: 16,
                pitch: 45,
                bearing: 0,
                duration: 2500,
                essential: true
            });
        }
    </script>
</body>

</html>
