---
layout: null
title: MPL 3D
---

<html lang="ja">
<head>
  {% include common_head.html %}
  <link rel="icon" href="data:;base64,iVBORw0KGgo=">
  <meta name='viewport' content='width=device-width, initial-scale=1' />
  <script src="https://cdn.jsdelivr.net/gh/jscastro76/threebox@v.2.2.2/dist/threebox.min.js"
    type="text/javascript"></script>
  <link href="https://cdn.jsdelivr.net/gh/jscastro76/threebox@v.2.2.2/dist/threebox.css" rel="stylesheet" />
  <style>
    {% include mpl.css %}
  </style>
</head>
<body>
  <div id="map" class="map"></div>
  <div id="menu-wrapper">
  </div>
  <div class="map-overlay-right">
    <div>
      <div class="title">操作方法</div>・ダブルクリック　終点設定<br>・右クリック　始点設定<br>
      ・左上各リンク押下（始点終点設定後）<br>
    </div>
    <div>
      <div class="title">MPLをタイプでフィルタ</div>
      <select id="type-select" onchange="filterByType()">
        <option value="">全て</option>
      </select>
    </div>
  </div>
  <div id="map-overlay-wrapper"></div>
</body>
<script>
  {% include mpl-3d.js %}
</script>
</html>