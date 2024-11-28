---
layout: null
title: Radar
js: radar.js
---

<html lang="ja">

<head>
  {% include common_head.html %}
  <style>
    {% include common.css %}
</style>
</head>

<body>
  <div id="map" class="map"></div>
  {{ content }}
  {% include legend.html %}
  {% include slider.html %}
</body>
<script>
  {% include {{ page.js }} %}
</script>

</html>