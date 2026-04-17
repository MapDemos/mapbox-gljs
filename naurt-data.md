---
layout: null
title: Naurt Data Visualization
js: naurt-data.js
---

<html lang="en">

<head>
  {% include common_head.html %}
  <style>
    {% include common.css %}

    .layer-controls {
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(255, 255, 255, 0.9);
      padding: 15px;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      font-family: 'Source Sans Pro', Arial, sans-serif;
      font-size: 14px;
      z-index: 1;
      min-width: 180px;
    }

    .layer-controls h3 {
      margin: 0 0 10px 0;
      padding: 0;
      font-size: 16px;
      color: #333;
      font-weight: 600;
    }

    #region-select {
      width: 100%;
      margin-bottom: 14px;
      padding: 5px 8px;
      font-size: 13px;
      font-family: 'Source Sans Pro', Arial, sans-serif;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: #f9f9f9;
      cursor: pointer;
      color: #333;
    }

    .layer-toggle {
      display: flex;
      align-items: center;
      margin: 8px 0;
      cursor: pointer;
    }

    .layer-toggle input[type="checkbox"] {
      margin-right: 8px;
      cursor: pointer;
    }

    .layer-toggle label {
      cursor: pointer;
      display: flex;
      align-items: center;
      color: #333;
    }

    .color-indicator {
      display: inline-block;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      margin-left: 8px;
      border: 1px solid rgba(0,0,0,0.2);
    }

    .stats-section {
      margin-top: 14px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
    }

    .stats-section h4 {
      margin: 0 0 8px 0;
      font-size: 12px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-row {
      margin-bottom: 7px;
    }

    .stat-label {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #555;
      margin-bottom: 3px;
    }

    .stat-label span:last-child {
      font-weight: 600;
      color: #333;
    }

    .stat-bar-bg {
      height: 5px;
      background: #e5e7eb;
      border-radius: 3px;
      overflow: hidden;
    }

    .stat-bar-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.3s ease;
    }
  </style>
</head>

<body>
  <div id="map" class="map"></div>

  <div class="layer-controls">
    <h3>Naurt Data</h3>
    <select id="region-select">
      <option value="japan">Japan</option>
      <option value="nz">New Zealand</option>
      <option value="us">United States</option>
    </select>
    <div class="layer-toggle">
      <input type="checkbox" id="toggle-doors" checked>
      <label for="toggle-doors">
        Naurt Doors
        <span class="color-indicator" style="background-color: #3b82f6;"></span>
      </label>
    </div>
    <div class="layer-toggle">
      <input type="checkbox" id="toggle-addresses" checked>
      <label for="toggle-addresses">
        Naurt Addresses
        <span class="color-indicator" style="background-color: #10b981;"></span>
      </label>
    </div>
    <div class="stats-section" id="stats-section"></div>
  </div>
</body>
<script>
  {% include {{ page.js }} %}
</script>

</html>
