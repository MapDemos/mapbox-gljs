---
layout: null
title: NIED
---
<html>
<head>
{% include common_head.html %}
<style>
{% include nied.css %}
</style>
</head>
<body>
<div id="map" class="map"></div>
  <div class="map-overlay-right">
    
    <div>
      <div class="title">タイルセット</div>
    </div>
    <div id="layers">
      <select id="tileset-selector" onchange="changeTileset(this.value)">
      </select>
    </div>
    <div>
      <div class="title">レイヤー</div>
    </div>
    <div id="layers">
      <select id="layer-selector">
      </select>
    </div>
    <br>
    
    <div>
      <div class="title">カラー・スケール</div>
    </div>
    <div id="colorscales">
      <select id="colorscale-selector" onchange="changeColorscaleType(this.value)">
      </select>
    </div>
    <!--div>
      <div class="title">カラー・リサンプリング</div>
    </div>
    <div id="colorsampling">
      <select id="colorsampling-selector" onchange="changeColorSampling(this.value)">
        <option value="step">nearest + step</option>
        <option value="interpolate">bilinear + interpolate</option>
      </select>
    </div-->
    <div class="title">プロジェクション</div>
    <div>
      <select id="projection-selector" onchange="changeProjection(this.value)">
        <option value="globe">Globe</option>
        <option value="mercator">Mercator</option>
        <option value="albers">Albers</option>
        <option value="equalEarth">Equal Earth</option>
        <option value="equirectangular">Equirectangular</option>
        <option value="naturalEarth">Natural Earth</option>
        <option value="lambertConformalConic">Lambert Conformal Conic</option>
        <option value="winkelTripel">Winkel Tripel</option>
      </select>
    </div>
  </div>

  <div class="legend">
    <div class="legend-scale" id="waveheight">
      <div class="legend-bar">
      </div>
    </div>
  </div>

  <div class="map-overlay-bottom">
    <label id='active-datetime'>　</label>&nbsp;&nbsp;&nbsp;<button id="auto" onclick="play()">再生</button>
    <div class="time" id="timediv">
    </div>
    <input type="range" min="0" step="1" value="0" class="slider" id="slider" onchange="changeBand(this.value)" />

</div>
</body>
<script>
  {% include nied.js %}
</script>
</html>