---
layout: null
title: Directions Comparison - OSM vs Zenrin
js: zenrin-osm-comparison.js
---

<html lang="ja">
<head>
  {% include common_head.html %}
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      height: 100vh; display: flex; flex-direction: column;
      background: #f5f5f5; color: #333;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      overflow: hidden;
    }

    #header {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 20px; background: #fff;
      border-bottom: 2px solid #e0e0e0; flex-shrink: 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .title {
      font-size: 16px; font-weight: 700; color: #333;
      white-space: nowrap; display: flex; align-items: center; gap: 8px;
    }
    .spacer { flex: 1; }

    #mode-btns { display: flex; gap: 8px; }
    .mode-btn {
      padding: 7px 14px; border: 1px solid #ddd; border-radius: 6px;
      font-size: 13px; cursor: pointer; background: white; color: #555;
      transition: all 0.2s;
    }
    .mode-btn.active { color: white; font-weight: 600; }
    #btn-origin.active      { background: #34a853; border-color: #34a853; }
    #btn-destination.active { background: #ea4335; border-color: #ea4335; }

    select, .btn {
      padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;
      font-size: 13px; outline: none; cursor: pointer;
      background: white; color: #333;
    }
    select:focus, .btn:hover { border-color: #4285f4; }
    .btn-clear:hover { background: #f5f5f5; border-color: #999; }

    #layout { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0; }

    #map-row {
      display: grid; grid-template-columns: 1fr 1fr;
      flex: 1; min-height: 0; overflow: hidden; border-bottom: 2px solid #e0e0e0;
    }

    .map-pane {
      display: flex; flex-direction: column; overflow: hidden;
      background: white; position: relative;
    }
    .map-pane:first-child { border-right: 1px solid #e0e0e0; }

    .map-header {
      padding: 10px 16px; font-size: 13px; font-weight: 600;
      background: #fafafa; border-bottom: 1px solid #e0e0e0;
      display: flex; align-items: center; justify-content: space-between;
    }
    .param-group { display: flex; align-items: center; gap: 6px; }
    .param-label { font-size: 12px; color: #666; font-weight: 500; }
    .param-group .btn { padding: 5px 10px; font-size: 12px; }
    .api-badge {
      font-size: 11px; font-weight: 500; padding: 3px 8px; border-radius: 12px;
      font-family: monospace;
    }
    .osm-badge    { background: #e8f0fe; color: #1a73e8; }
    .zenrin-badge { background: #fef3e2; color: #b45309; }

    .map-container { flex: 1; min-height: 0; }
    .map-container canvas { cursor: crosshair !important; }

    #results-row {
      display: grid; grid-template-columns: 1fr 1fr;
      flex: 0 1 180px; overflow: hidden; background: white;
    }
    .result-pane { display: flex; flex-direction: column; overflow: hidden; }
    .result-pane:first-child { border-right: 1px solid #e0e0e0; }
    .result-header {
      padding: 10px 16px; font-size: 13px; font-weight: 600;
      background: #fafafa; border-bottom: 1px solid #e0e0e0;
    }
    .result-content { flex: 1; overflow-y: auto; padding: 16px; }
    .result-placeholder {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; height: 100%; color: #aaa;
      font-size: 13px; gap: 8px;
    }
    .result-placeholder .icon { font-size: 32px; }

    .result-summary {
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;
    }
    .metric-card {
      background: #f8f9fa; border-radius: 8px; padding: 12px;
      border: 1px solid #e0e0e0;
    }
    .metric-label {
      font-size: 11px; color: #666; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;
    }
    .metric-value { font-size: 20px; font-weight: 700; color: #333; }
    .route-info {
      font-size: 13px; color: #555; margin-bottom: 12px;
      padding: 8px 12px; background: #f0f4ff; border-radius: 6px;
      border-left: 3px solid #4285f4;
    }
    .steps-title {
      font-size: 12px; font-weight: 600; color: #666;
      text-transform: uppercase; letter-spacing: 0.5px;
      margin-bottom: 8px; margin-top: 12px;
    }
    .step-item {
      display: flex; gap: 10px; align-items: flex-start;
      padding: 6px 0; border-bottom: 1px solid #f0f0f0;
      font-size: 12px; color: #444;
    }
    .step-item:last-child { border-bottom: none; }
    .step-number {
      flex-shrink: 0; width: 22px; height: 22px;
      background: #e8f0fe; color: #1a73e8;
      border-radius: 50%; font-size: 11px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
    }
    .step-text { flex: 1; line-height: 1.4; }

    .click-hint {
      position: absolute; bottom: 28px; left: 50%; transform: translateX(-50%);
      background: rgba(0,0,0,0.7); color: white; padding: 6px 14px;
      border-radius: 20px; font-size: 12px; pointer-events: none;
      white-space: nowrap; z-index: 10;
    }

    .loading-indicator {
      display: flex; align-items: center; justify-content: center;
      gap: 10px; padding: 20px; color: #666; font-size: 13px;
    }
    .spinner {
      width: 20px; height: 20px; border: 2px solid #e0e0e0;
      border-top-color: #4285f4; border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .avoid-dropdown { position: relative; }
    .avoid-btn {
      padding: 5px 10px; border: 1px solid #ddd; border-radius: 6px;
      font-size: 12px; cursor: pointer; background: white; color: #555;
      display: flex; align-items: center; gap: 5px; white-space: nowrap;
      transition: border-color 0.2s;
    }
    .avoid-btn:hover, .avoid-dropdown.open .avoid-btn { border-color: #4285f4; }
    .avoid-panel {
      display: none; position: absolute; top: calc(100% + 4px); left: 0;
      background: white; border: 1px solid #ddd; border-radius: 8px;
      padding: 6px; z-index: 200; min-width: 175px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    }
    .avoid-dropdown.open .avoid-panel { display: block; }
    .avoid-option {
      display: flex; align-items: center; gap: 8px;
      padding: 5px 6px; font-size: 12px; cursor: pointer; border-radius: 4px;
      color: #333; user-select: none;
    }
    .avoid-option:hover { background: #f5f5f5; }
    .avoid-option input[type="checkbox"] { cursor: pointer; }

    #voc-banner {
      display: none; padding: 8px 20px;
      background: #fffbeb; border-bottom: 1px solid #f0e68c;
      font-size: 12px; color: #555; line-height: 1.5;
      flex-shrink: 0;
    }
    #voc-banner.visible { display: block; }

    @media print {
      body { margin: 0; }
      .click-hint { display: none; }
    }
  </style>
</head>
<body>

<div id="header">
  <span class="title">
    <span>🗺️</span>
    Directions API Comparison — OSM vs Zenrin
  </span>
  <div id="mode-btns">
    <button class="mode-btn active" id="btn-origin">A&nbsp; Set Origin</button>
    <button class="mode-btn"        id="btn-destination">B&nbsp; Set Destination</button>
  </div>
  <select id="route-preset">
    <option value="">-- Select VOC Route --</option>
  </select>
  <select id="travel-mode">
    <option value="driving">Driving</option>
    <option value="driving-traffic">Driving (Traffic)</option>
    <option value="cycling">Cycling</option>
    <option value="walking">Walking</option>
  </select>
  <div class="spacer"></div>
  <button class="btn btn-clear" id="clear-btn">Clear</button>
</div>

<div id="voc-banner">
  <span id="voc-description-text"></span>
</div>

<div id="layout">
  <div id="map-row">

    <div class="map-pane">
      <div class="map-header">
        <span>OSM (OpenStreetMap)</span>
        <div class="param-group">
          <span class="param-label">Parameters</span>
          <div class="avoid-dropdown" id="osm-avoid-dropdown">
            <button class="avoid-btn" id="osm-avoid-btn">Avoid ▾</button>
            <div class="avoid-panel">
              <label class="avoid-option"><input type="checkbox" value="ferry"> Ferries</label>
              <label class="avoid-option"><input type="checkbox" value="unpaved"> Unpaved Roads</label>
              <label class="avoid-option"><input type="checkbox" value="toll"> Tolls</label>
              <label class="avoid-option"><input type="checkbox" value="motorway"> Motorways</label>
            </div>
          </div>
          <button class="btn" id="osm-execute-btn">Run</button>
        </div>
        <span class="api-badge osm-badge">mapbox/{mode}</span>
      </div>
      <div id="osm-map" class="map-container"></div>
      <div class="click-hint" id="osm-hint">Click to set origin (A)</div>
    </div>

    <div class="map-pane">
      <div class="map-header">
        <span>Zenrin</span>
        <div class="param-group">
          <span class="param-label">Parameters</span>
          <div class="avoid-dropdown" id="zenrin-avoid-dropdown">
            <button class="avoid-btn" id="zenrin-avoid-btn">Avoid ▾</button>
            <div class="avoid-panel">
              <label class="avoid-option"><input type="checkbox" value="ferry"> Ferries</label>
              <label class="avoid-option"><input type="checkbox" value="unpaved"> Unpaved Roads</label>
              <label class="avoid-option"><input type="checkbox" value="toll"> Tolls</label>
              <label class="avoid-option"><input type="checkbox" value="motorway"> Motorways</label>
            </div>
          </div>
          <button class="btn" id="zenrin-execute-btn">Run</button>
        </div>
        <span class="api-badge zenrin-badge">mapbox.tmp.valhalla-zenrin/{mode}</span>
      </div>
      <div id="zenrin-map" class="map-container"></div>
      <div class="click-hint" id="zenrin-hint">Click to set origin (A)</div>
    </div>

  </div>

  <div id="results-row">
    <div class="result-pane">
      <div class="result-header">OSM Results</div>
      <div class="result-content" id="osm-result-content">
        <div class="result-placeholder">
          <span class="icon">🗺️</span>
          <span>Set origin and destination to show a route</span>
        </div>
      </div>
    </div>
    <div class="result-pane">
      <div class="result-header">Zenrin Results</div>
      <div class="result-content" id="zenrin-result-content">
        <div class="result-placeholder">
          <span class="icon">🗺️</span>
          <span>Set origin and destination to show a route</span>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
  {% include {{ page.js }} %}
</script>
</body>
</html>
