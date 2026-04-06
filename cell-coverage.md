---
layout: null
title: Cell Coverage Map
js: cell-coverage.js
---

<html lang="ja">
<head>
  {% include common_head.html %}
  <link
    rel="stylesheet"
    href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.css"
    type="text/css"
  />
  <style>
    {% include common.css %}

    #info {
      position: absolute;
      top: 10px;
      left: 10px;
      display: none;
      background-color: #ffffff;
      padding: 5px;
    }
    .stats {
      position: absolute;
      top: 25px;
      left: 25px;
    }

    .location {
      font-weight: bolder;
      font-size: 16px;
      margin-top: 16px;
      display: block;
    }
    .coverage {
      color: rgb(74, 74, 74);
      font-size: 14px;
      margin-top: 8px;
      margin-bottom: 8px;
      display: block;
    }
    #colorbar-container {
      z-index: 3;
      position: absolute;
      left: 50%;
      top: 13px;
      transform: translate(-50%, 0);
      display: none;
      transition: opacity 0.5s;
      opacity: 0;
    }
    .mapboxgl-marker {
      cursor: pointer !important;
    }
    .mapboxgl-popup {
      z-index: 10 !important;
    }
    .loading {
      position: absolute;
      z-index: 999;
      background-color: rgba(0, 0, 0, 0.5);
      top: 0;
      bottom: 0;
      right: 0;
      left: 0;
      display: none;
    }
    .bars {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 62px;
      height: 30px;
      transform: translate(-50%, -50%);
    }

    .bar {
      position: absolute;
      bottom: 0;
      width: 10px;
    }

    .bar:nth-child(1) {
      background: white;
      height: 10px;
      left: 0px;
    }

    .bar:nth-child(2) {
      background: white;
      height: 15px;
      left: 13px;
    }

    .bar:nth-child(3) {
      background: white;
      height: 20px;
      left: 26px;
    }

    .bar:nth-child(4) {
      background: white;
      height: 25px;
      left: 39px;
    }

    .bar:nth-child(5) {
      background: white;
      height: 30px;
      left: 52px;
    }
  </style>
</head>
<body>
  <div id="map" class="map"></div>
  <div id="info"></div>
  <div id="colorbar-container">
    <canvas id="colorbar" class="colorbar"></canvas>
  </div>
  <div class="loading">
    <div id="bars" class="bars">
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
    </div>
  </div>
</body>
<script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.min.js"></script>
<script>
  {% include {{ page.js }} %}
</script>
</html>
