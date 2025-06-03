---
layout: null
title: Gojek MTS
js: gojek-mts.js
---

<html lang="ja">

<head>
  {% include common_head.html %}
  <script src="https://unpkg.com/osmtogeojson@2.2.12/osmtogeojson.js"></script>
  <script src="https://netdna.bootstrapcdn.com/bootstrap/3.0.0/js/bootstrap.min.js"></script>
  <script src="https://www.gstatic.com/charts/loader.js"></script>
  <style>
    body { margin: 0; padding: 0; }
    #map { position: absolute; top: 0; bottom: 0; width: 100%; }
</style>
</head>

<body>
  <div id="bottom">
  <div id='map' class="inner"></div>
 <div id="searchChart" class="inner"></div>
 <div id="matrixChart" class="inner"></div>
  <div id="directionsChart" class="inner"></div>
</div>
</body>
<script>
  {% include {{ page.js }} %}
</script>

</html>