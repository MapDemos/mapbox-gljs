---
layout: none
title: SearchBox POI検索
js: category-search-nested.js
---

<html lang="ja">

<head>
  {% include common_head.html %}
  <style>
    body {
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
    #map {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 400px;
      right: 0;
    }
</style>
</head>

<body>
  <div id="map" class="map"></div>
</body>
<script>
  {% include {{ page.js }} %}
</script>

</html>