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
</style>
</head>

<body>
  <div id="map" class="map"></div>
</body>
<script>
  {% include {{ page.js }} %}
</script>

</html>