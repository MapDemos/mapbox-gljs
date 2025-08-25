---
layout: null
title: Deliveries
js: deliveries.js
---

<html lang="ja">

<head>
  {% include common_head.html %}
  <style>
    .map {
      position: absolute;
      width: 100%;
      top: 0;
      bottom: 0;
    }
   .control-panel {
      position: absolute;
      top: 20px;
      left: 20px;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      font-family: 'Arial', sans-serif;
      font-size: 14px;
      min-width: 250px;
    }
    .control-panel h3 {
      margin: 0 0 15px 0;
      color: #333;
      font-size: 16px;
      font-weight: bold;
    }
    .control-group {
      margin-bottom: 15px;
    }
    .control-group label {
      display: block;
      margin-bottom: 5px;
      color: #555;
      font-weight: 500;
    }
    .control-group select,
    .control-group input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    .control-group input[type="checkbox"] {
      width: auto;
      margin-right: 8px;
    }
    .checkbox-group {
      display: flex;
      align-items: center;
    }
    .checkbox-group label {
      margin-bottom: 0;
      cursor: pointer;
    }
</style>
</head>

<body>
  <div id="map" class="map"></div>
  <div class="control-panel">
    <h3>配達分析</h3>
    <div class="control-group">
      <div class="checkbox-group">
        <input type="checkbox" id="use-mts" />
        <label for="use-mts">MTS（Mapbox Tiling Service）を使用</label>
      </div>
    </div>
    <div class="control-group">
      <label for="isochrone-minutes">到達圏時間:</label>
      <select id="isochrone-minutes">
        <option value="5">5分</option>
        <option value="10" selected>10分</option>
        <option value="15">15分</option>
        <option value="20">20分</option>
        <option value="30">30分</option>
      </select>
    </div>
    <div class="control-group">
      <label for="travel-profile">移動手段:</label>
      <select id="travel-profile">
        <option value="mapbox/walking" selected>徒歩</option>
        <option value="mapbox/cycling">自転車</option>
        <option value="mapbox/driving">車</option>
        <option value="mapbox/driving-traffic">車（交通情報含む）</option>
      </select>
    </div>
  </div>
</body>
<script>
  {% include {{ page.js }} %}
</script>

</html>