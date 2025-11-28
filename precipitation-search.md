---
layout: null
title: Precipitation Search
js: precipitation-search.js
---
<!DOCTYPE html>
<html lang="ja">
<head>
    {% include common_head.html %}
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body, html {
            height: 100%;
            width: 100%;
            font-family: 'Open Sans', sans-serif;
        }

        #map {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            bottom: 0;
        }

        .time-display-panel {
            position: absolute;
            top: 20px;
            left: 20px;
            background: linear-gradient(135deg, rgba(30, 30, 40, 0.95), rgba(20, 20, 30, 0.95));
            backdrop-filter: blur(10px);
            border-radius: 8px;
            padding: 10px 16px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 1000;
            height: 48px;
            display: flex;
            align-items: center;
        }

        .time-display {
            flex-shrink: 0;
        }

        .current-time {
            display: flex;
            align-items: baseline;
            gap: 10px;
        }

        .date-display {
            color: rgba(255, 255, 255, 0.6);
            font-size: 11px;
            font-weight: 500;
            letter-spacing: 0.5px;
        }

        .time-display-large {
            color: #ffffff;
            font-size: 20px;
            font-weight: 700;
            letter-spacing: 0.5px;
            font-family: 'Courier New', monospace;
        }

        .time-controls {
            position: absolute;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, rgba(30, 30, 40, 0.95), rgba(20, 20, 30, 0.95));
            backdrop-filter: blur(10px);
            border-radius: 12px;
            padding: 12px 50px 12px 20px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            width: 90%;
            max-width: 800px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            transition: all 0.3s ease;
        }

        .time-controls.collapsed {
            min-width: auto;
            width: auto;
            padding: 10px 16px;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .time-controls.collapsed .playback-controls,
        .time-controls.collapsed .timeline-container {
            display: none;
        }

        .controls-title {
            color: rgba(255, 255, 255, 0.7);
            font-size: 11px;
            font-weight: 500;
            letter-spacing: 0.5px;
            display: none;
            order: 1;
        }

        .time-controls.collapsed .controls-title {
            display: inline-block;
        }

        .toggle-btn-dark {
            position: absolute;
            top: 12px;
            right: 20px;
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.5);
            cursor: pointer;
            font-size: 14px;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            z-index: 10;
            order: 2;
        }

        .toggle-btn-dark:hover {
            color: rgba(255, 255, 255, 0.9);
            transform: scale(1.1);
        }

        .time-controls.collapsed .toggle-btn-dark {
            position: static;
        }

        .playback-controls {
            display: flex;
            justify-content: center;
            gap: 5px;
        }

        .control-btn {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 2px solid rgba(255, 255, 255, 0.2);
            background: rgba(255, 255, 255, 0.1);
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            transition: all 0.3s ease;
        }

        .control-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.4);
            transform: scale(1.05);
        }

        .control-btn:active {
            transform: scale(0.98);
        }

        .play-btn {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            border-color: rgba(255, 255, 255, 0.3);
        }

        .play-btn:hover {
            background: linear-gradient(135deg, #5cb85c, #4CAF50);
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
        }

        .play-btn.playing {
            background: linear-gradient(135deg, #ff9800, #f57c00);
        }

        .play-btn.playing:hover {
            background: linear-gradient(135deg, #ffa726, #ff9800);
            box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
        }

        .timeline-container {
            position: relative;
            padding-bottom: 20px;
            width: 100%;
        }

        .timeline-zones {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 8px;
            border-radius: 4px;
            overflow: hidden;
            pointer-events: none;
            display: flex;
        }

        .timeline-zone {
            height: 100%;
            transition: all 0.3s ease;
        }

        .timeline-zone.nowcast {
            background: rgba(100, 180, 255, 0.15);
        }

        .timeline-zone.forecast {
            background: rgba(255, 180, 100, 0.15);
        }

        .zone-boundary {
            position: absolute;
            top: -2px;
            width: 2px;
            height: 12px;
            background: rgba(255, 255, 255, 0.4);
            pointer-events: none;
            z-index: 1;
        }

        .zone-label {
            position: absolute;
            top: -18px;
            font-size: 9px;
            color: rgba(255, 255, 255, 0.5);
            font-weight: 500;
            pointer-events: none;
            transform: translateX(-50%);
            white-space: nowrap;
        }

        .timeline-slider {
            position: relative;
            width: 100%;
            height: 8px;
            border-radius: 4px;
            background: transparent;
            outline: none;
            cursor: pointer;
            -webkit-appearance: none;
            appearance: none;
            z-index: 2;
        }

        .timeline-ticks {
            position: absolute;
            top: 12px;
            left: 0;
            right: 0;
            height: 20px;
            pointer-events: none;
        }

        .timeline-tick {
            position: absolute;
            width: 1px;
            height: 6px;
            background: rgba(255, 255, 255, 0.3);
            transform: translateX(-50%);
        }

        .timeline-tick.major {
            height: 10px;
            background: rgba(255, 255, 255, 0.5);
        }

        .timeline-tick.nowcast-zone {
            background: rgba(100, 180, 255, 0.5);
        }

        .timeline-tick.nowcast-zone.major {
            background: rgba(100, 180, 255, 0.7);
        }

        .timeline-tick.forecast-zone {
            background: rgba(255, 180, 100, 0.5);
        }

        .timeline-tick.forecast-zone.major {
            background: rgba(255, 180, 100, 0.7);
        }

        .timeline-label {
            position: absolute;
            top: 14px;
            font-size: 10px;
            color: rgba(255, 255, 255, 0.7);
            transform: translateX(-50%);
            white-space: nowrap;
            font-family: 'Courier New', monospace;
        }

        .timeline-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            transition: all 0.2s ease;
        }

        .timeline-slider::-webkit-slider-thumb:hover {
            transform: scale(1.2);
            box-shadow: 0 3px 12px rgba(76, 175, 80, 0.5);
        }

        .timeline-slider::-moz-range-thumb {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            cursor: pointer;
            border: none;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            transition: all 0.2s ease;
        }

        .timeline-slider::-moz-range-thumb:hover {
            transform: scale(1.2);
            box-shadow: 0 3px 12px rgba(76, 175, 80, 0.5);
        }

        .legend {
            position: absolute;
            bottom: 150px;
            left: 20px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
            font-family: Arial, sans-serif;
            z-index: 1000;
            transition: all 0.3s ease;
        }

        .legend.collapsed {
            padding: 8px 12px;
        }

        .legend.collapsed .legend-content,
        .legend.collapsed .legend-unit {
            display: none;
        }

        .legend-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }

        .legend-title {
            font-size: 12px;
            font-weight: 600;
            color: #333;
        }

        .legend.collapsed .legend-title {
            margin-bottom: 0;
        }

        .toggle-btn {
            background: none;
            border: none;
            color: #666;
            cursor: pointer;
            font-size: 14px;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }

        .toggle-btn:hover {
            color: #333;
            transform: scale(1.1);
        }

        .legend-bar {
            width: 20px;
            height: 200px;
            background: linear-gradient(to top,
                rgba(102, 255, 255, 0.9) 0%,
                rgba(0, 204, 255, 0.9) 12.5%,
                rgba(51, 102, 255, 0.9) 25%,
                rgba(51, 255, 0, 0.9) 37.5%,
                rgba(255, 255, 0, 0.9) 50%,
                rgba(255, 153, 0, 0.9) 62.5%,
                rgba(255, 0, 0, 0.9) 75%,
                rgba(183, 0, 16, 0.9) 87.5%,
                rgba(183, 0, 16, 1) 100%
            );
            border-radius: 4px;
            position: relative;
            margin-bottom: 8px;
        }

        .legend-labels {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            height: 200px;
            margin-left: 8px;
        }

        .legend-content {
            display: flex;
            margin-top: 8px;
        }

        .label {
            font-size: 11px;
            color: #333;
            font-weight: 500;
        }

        .legend-unit {
            font-size: 10px;
            color: #666;
            text-align: center;
            margin-top: 4px;
        }

        /* Search Box Styles */
        .search-container {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 320px;
            z-index: 1000;
        }

        .search-box {
            width: 100%;
            padding: 12px 16px;
            background: linear-gradient(135deg, rgba(30, 30, 40, 0.95), rgba(20, 20, 30, 0.95));
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
            color: #ffffff;
            font-size: 14px;
            font-family: 'Open Sans', sans-serif;
            outline: none;
            transition: all 0.3s ease;
        }

        .search-box::placeholder {
            color: rgba(255, 255, 255, 0.5);
        }

        .search-box:focus {
            border-color: rgba(76, 175, 80, 0.5);
            box-shadow: 0 4px 20px rgba(76, 175, 80, 0.3);
        }

        .search-results {
            margin-top: 8px;
            background: linear-gradient(135deg, rgba(30, 30, 40, 0.98), rgba(20, 20, 30, 0.98));
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
            max-height: 400px;
            overflow-y: auto;
            display: none;
        }

        .search-results.visible {
            display: block;
        }

        .search-result-item {
            padding: 12px 16px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            cursor: pointer;
            transition: all 0.2s ease;
            color: #ffffff;
        }

        .search-result-item:last-child {
            border-bottom: none;
        }

        .search-result-item:hover {
            background: rgba(76, 175, 80, 0.2);
        }

        .result-name {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 4px;
        }

        .result-address {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
            margin-bottom: 4px;
        }

        .result-precipitation {
            font-size: 11px;
            color: #4CAF50;
            font-weight: 500;
        }

        /* User Location Marker */
        .user-location-marker {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #4CAF50;
            border: 3px solid #ffffff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
            cursor: pointer;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% {
                box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
            }
            70% {
                box-shadow: 0 0 0 10px rgba(76, 175, 80, 0);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
            }
        }

        /* Highlighted marker on hover */
        .mapboxgl-marker.highlighted svg {
            transform: scale(1.3);
            filter: drop-shadow(0 0 8px rgba(33, 150, 243, 0.8));
            transition: all 0.2s ease;
        }

        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
            .search-container {
                top: 10px;
                right: 10px;
                width: 280px;
            }

            .search-box {
                padding: 10px 14px;
                font-size: 13px;
            }

            .time-display-panel {
                top: 10px;
                left: 10px;
                padding: 8px 12px;
                border-radius: 6px;
            }

            .date-display {
                font-size: 10px;
            }

            .time-display-large {
                font-size: 16px;
            }

            .time-controls {
                bottom: 15px;
                width: 95%;
                padding: 10px 45px 10px 15px;
                gap: 8px;
            }

            .toggle-btn-dark {
                top: 10px;
                right: 15px;
                width: 20px;
                height: 20px;
                font-size: 12px;
            }

            .control-btn {
                width: 36px;
                height: 36px;
                font-size: 14px;
            }

            .play-btn {
                width: 42px;
                height: 42px;
            }

            .timeline-slider {
                height: 10px;
            }

            .timeline-slider::-webkit-slider-thumb {
                width: 24px;
                height: 24px;
            }

            .timeline-slider::-moz-range-thumb {
                width: 24px;
                height: 24px;
            }

            .legend {
                bottom: 120px;
                left: 10px;
                padding: 8px;
                border-radius: 6px;
            }

            .legend-title {
                font-size: 11px;
            }

            .legend-bar {
                width: 16px;
                height: 150px;
            }

            .legend-labels {
                height: 150px;
            }

            .label {
                font-size: 10px;
            }

            .legend-unit {
                font-size: 9px;
            }

            .timeline-label {
                font-size: 9px;
            }
        }

        @media (max-width: 480px) {
            .search-container {
                top: 5px;
                right: 5px;
                width: calc(100% - 10px);
                max-width: 300px;
            }

            .search-box {
                padding: 8px 12px;
                font-size: 12px;
            }

            .time-display-panel {
                top: 5px;
                left: 5px;
                padding: 6px 10px;
            }

            .date-display {
                font-size: 9px;
            }

            .time-display-large {
                font-size: 14px;
            }

            .time-controls {
                bottom: 10px;
                width: 98%;
                padding: 8px 40px 8px 12px;
                gap: 6px;
            }

            .toggle-btn-dark {
                top: 8px;
                right: 12px;
                width: 18px;
                height: 18px;
                font-size: 11px;
            }

            .control-btn {
                width: 32px;
                height: 32px;
                font-size: 12px;
            }

            .play-btn {
                width: 38px;
                height: 38px;
            }

            .timeline-container {
                padding-bottom: 18px;
            }

            .legend {
                bottom: 110px;
                left: 5px;
                padding: 6px;
            }

            .legend-bar {
                width: 14px;
                height: 120px;
            }

            .legend-labels {
                height: 120px;
            }

            .timeline-label {
                font-size: 8px;
            }

            .timeline-tick {
                height: 4px;
            }

            .timeline-tick.major {
                height: 8px;
            }
        }
    </style>
</head>
<body>
    <div id="map"></div>

    <!-- Search Box -->
    <div class="search-container">
        <input type="text"
               id="search-box"
               class="search-box"
               placeholder="場所を検索..."
               autocomplete="off">
        <div id="search-results" class="search-results"></div>
    </div>

    <div class="legend" id="legend">
        <div class="legend-header">
            <div class="legend-title">降水量</div>
            <button class="toggle-btn" id="legend-toggle" title="Toggle Legend">
                <span id="legend-toggle-icon">−</span>
            </button>
        </div>
        <div class="legend-content">
            <div class="legend-bar"></div>
            <div class="legend-labels">
                <span class="label">80</span>
                <span class="label">60</span>
                <span class="label">40</span>
                <span class="label">20</span>
                <span class="label">0</span>
            </div>
        </div>
        <div class="legend-unit">mm/h</div>
    </div>

    <div class="time-display-panel">
        <div class="time-display">
            <div class="current-time">
                <div id="active-date" class="date-display">Loading...</div>
                <div id="active-time" class="time-display-large">--:--</div>
            </div>
        </div>
    </div>

    <div class="time-controls" id="time-controls">
        <button class="toggle-btn-dark" id="controls-toggle" title="Toggle Controls">
            <span id="controls-toggle-icon">−</span>
        </button>
        <span class="controls-title">時刻</span>

        <div class="playback-controls">
            <button id="prev-frame" class="control-btn" title="Previous">
                <span>◀</span>
            </button>
            <button id="play-pause" class="control-btn play-btn" title="Play/Pause">
                <span id="play-icon">▶</span>
            </button>
            <button id="next-frame" class="control-btn" title="Next">
                <span>▶</span>
            </button>
        </div>

        <div class="timeline-container">
            <input type="range" min="0" step="1" value="0" max="0" class="timeline-slider" id="slider" />
            <div class="timeline-ticks" id="timeline-ticks"></div>
        </div>
    </div>

    <script>
        {% include {{ page.js }} %}
    </script>
</body>
</html>
