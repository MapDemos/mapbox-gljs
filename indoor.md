---
layout: none
title: Indoor Map
js: indoor.js
---

<html lang="en">

<head>
  {% include common_head.html %}
  <style>
    {% include common.css %}
    {% include indoor.css %}
  </style>
</head>

<body>
  <div id="map" class="map"></div>
</body>
<script>
  {% include {{ page.js }} %}
</script>

</html>