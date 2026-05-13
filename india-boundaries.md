---
layout: none
title: India Boundaries Coverage
js: india-boundaries.js
---
<html lang="en">
<head>
  {% include common_head.html %}
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      height: 100vh; display: flex; flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      overflow: hidden;
    }

    #header {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 16px; background: #1a1a2e; color: #fff;
      flex-shrink: 0;
    }
    #header .title { font-size: 14px; font-weight: 700; }
    #header .subtitle {
      font-size: 11px; font-weight: 400; color: #aaa;
      border-left: 1px solid #444; padding-left: 12px;
    }

    #body { flex: 1; display: flex; overflow: hidden; min-height: 0; }

    #sidebar {
      width: 240px; flex-shrink: 0;
      display: flex; flex-direction: column;
      background: #fff; border-right: 1px solid #ddd; z-index: 1;
    }

    #coverage-summary {
      padding: 9px 14px; font-size: 12px; font-weight: 600;
      background: #f8f8f8; border-bottom: 2px solid #e0e0e0; color: #444;
      flex-shrink: 0;
    }
    #coverage-summary .poly-count { color: #27ae60; }
    #coverage-summary .total-count { color: #888; font-weight: 400; }

    #place-list {
      list-style: none; flex: 1; overflow-y: auto;
    }
    #place-list li.place-item {
      padding: 8px 14px 8px 28px; cursor: pointer; font-size: 13px;
      border-bottom: 1px solid #f0f0f0;
      display: flex; align-items: center; gap: 8px; color: #333;
      position: relative;
    }
    #place-list li.place-item::before {
      content: ''; display: inline-block;
      width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
      position: absolute; left: 14px;
    }
    #place-list li.place-item.boundaries::before { background: #27ae60; }
    #place-list li.place-item.searchbox::before  { background: #e67e22; }
    #place-list li.place-item:hover  { background: #f5f5f5; }
    #place-list li.place-item.active.boundaries { background: #eafaf1; font-weight: 600; }
    #place-list li.place-item.active.searchbox  { background: #fef5e7; font-weight: 600; }

    #place-list li.section-header {
      padding: 6px 14px; font-size: 10px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.7px;
      background: #f0f0f0; color: #777; border-bottom: 1px solid #e0e0e0;
      cursor: default;
    }
    #place-list li.section-header.polygon { color: #27ae60; background: #f0faf4; }
    #place-list li.section-header.point   { color: #e67e22; background: #fef9f0; }

    #legend {
      padding: 10px 14px; border-top: 1px solid #eee;
      font-size: 11px; color: #888;
      display: flex; flex-direction: column; gap: 5px;
      flex-shrink: 0;
    }
    #legend div { display: flex; align-items: center; gap: 6px; }
    .dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

    #map-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

    #map-header {
      padding: 8px 14px; font-size: 12px; font-weight: 600;
      background: #fafafa; border-bottom: 1px solid #ddd;
      display: flex; align-items: center; justify-content: space-between;
      flex-shrink: 0;
    }
    #map-header .result-info {
      font-size: 11px; font-weight: 400; color: #666;
      max-width: 460px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }

    #map-wrap { flex: 1; position: relative; min-height: 0; }
    #mapbox-map { width: 100%; height: 100%; }

    #map-badge {
      display: none;
      position: absolute; top: 12px; left: 12px; z-index: 1;
      padding: 6px 14px; border-radius: 20px;
      font-size: 12px; font-weight: 700; color: #fff;
      pointer-events: none;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }
    #map-badge.polygon { display: block; background: #27ae60; }
    #map-badge.point   { display: block; background: #e67e22; }

    .badge {
      display: inline-block; padding: 2px 8px;
      border-radius: 10px; font-size: 11px; font-weight: 600; color: #fff;
    }
    .badge.boundaries { background: #27ae60; }
    .badge.searchbox  { background: #e67e22; }

    .info-detail { font-size: 11px; color: #666; }
  </style>
</head>
<body>

<div id="header">
  <span class="title">India Boundaries Coverage</span>
</div>

<div id="body">
  <div id="sidebar">
    <div id="coverage-summary">Loading…</div>
    <ul id="place-list"></ul>
    <div id="legend">
      <div><span class="dot" style="background:#27ae60"></span>Polygon available in Boundaries</div>
      <div><span class="dot" style="background:#e67e22"></span>No polygon — point result only</div>
    </div>
  </div>

  <div id="map-area">
    <div id="map-header">
      Mapbox
      <span class="result-info" id="mapbox-info">Select a place</span>
    </div>
    <div id="map-wrap">
      <div id="mapbox-map"></div>
      <div id="map-badge"></div>
    </div>
  </div>
</div>

<script>
  {% include {{ page.js }} %}
</script>
</body>
</html>
