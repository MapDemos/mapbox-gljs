---
layout: null
title: CDG MTS
js: cdg-mts.js
---

<html lang="ja">

<head>
  {% include common_head.html %}
  <script src="https://unpkg.com/osmtogeojson@2.2.12/osmtogeojson.js"></script>
  <style>
    body { margin: 0; padding: 0; }
    #map { position: absolute; top: 0; bottom: 0; width: 100%; }
    #places-dropdown {
        position: absolute;
        top: 10px;
        right: 10px;
        z-index: 999;
        padding: 5px 10px;
        font-size: 14px;
        background-color: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    #places-dropdown option {
        font-size: 14px;
        padding: 4px 8px;
    }
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