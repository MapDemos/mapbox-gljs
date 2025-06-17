---
layout: null
title: Weather 3D
js: weather3d.js
---

<html lang="ja">

<head>
  {% include common_head.html %}
  <script src="https://cdn.jsdelivr.net/gh/jscastro76/threebox@v.2.2.2/dist/threebox.min.js" type="text/javascript"></script>
  <link href="https://cdn.jsdelivr.net/gh/jscastro76/threebox@v.2.2.2/dist/threebox.css" rel="stylesheet" />
  <script src="https://cdn.jsdelivr.net/npm/apexcharts"></script>
  
  <style>
    {% include common.css %}
    {% include weather3d.css %}
</style>
</head>

<body>
  <div id="map" class="map"></div>
  <div class="city-header">
    <div id="mini-map"></div>
    <div id="city-panel" class="city-panel"></div>
  </div>
  <div id="area-panel" class="area-panel">
    <div id="geo-name"></div>
    <div id="geo-weather"></div>
  </div>
  <div class="time-panel">
    <div id="current-time" class="time-box">--</div>
    <div class="map-slider-container">
        <input type="range" min="0" step="1" value="0" max="5" class="time-slider" id="slider" oninput="inputBand(this.value)" onchange="changeBand()" />
    </div>
  </div>
  <div id="precipitation-chart" class="precipitation-chart"></div>
  {% include legend.html %}
  

</body>
<script>
  {% include timeManager.js %}
  {% include precipitationLayerHelper.js %}
  {% include {{ page.js }} %}
</script>

</html>