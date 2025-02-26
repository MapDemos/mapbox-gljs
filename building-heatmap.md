---
layout: null
title: Building Heatmap
js: building-heatmap.js
---

<html lang="ja">

<head>
  {% include common_head.html %}
  <style>
    <!--
    body {
        overflow: hidden;
    }

    body * {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    .map {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 100%;
    }
    -->
</style>
<script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-compare/v0.4.0/mapbox-gl-compare.js"></script>
<link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-compare/v0.4.0/mapbox-gl-compare.css" type="text/css">
</head>

<body>
  <div id="comparison-container">
    <div id="before" class="map"></div>
    <div id="after" class="map"></div>
</div>
</body>
<script>
  {% include {{ page.js }} %}
</script>

</html>