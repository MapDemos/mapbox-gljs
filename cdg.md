---
layout: null
title: CDG
js: cdg.js
---

<html lang="ja">

<head>
  {% include common_head.html %}
  <script src="https://unpkg.com/osmtogeojson@2.2.12/osmtogeojson.js"></script>
  <style>
    body { margin: 0; padding: 0; }
    #map { position: absolute; top: 0; bottom: 0; width: 100%; }
</style>
</head>

<body>
  <div id="bottom">
  <div id='map' class="inner"></div>
</div>
</body>
<script>
  {% include {{ page.js }} %}
</script>

</html>