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
    }

    .layer-controls h3 {
      margin: 0 0 10px 0;
      padding: 0;
      font-size: 16px;
      color: #333;
      font-weight: 600;
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

  </style>
</head>

<body>
  <div id="map" class="map"></div>

  <div class="layer-controls">
    <h3>Layer Controls</h3>
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
  </div>
</body>
<script>
  {% include {{ page.js }} %}
</script>

</html>
