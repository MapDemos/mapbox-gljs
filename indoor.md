---
layout: none
title: Indoor Map
js: indoor.js
---

<html lang="en">

<head>
  {% include common_head.html %}
  <style>
    {% include indoor.css %}
  </style>
</head>

<body>
  <div id="app-container">
    <div id="ui-panel"></div>
    <div id="map" class="map"></div>
  </div>
</body>
<script>
  {% include {{ page.js }} %}
</script>

</html>