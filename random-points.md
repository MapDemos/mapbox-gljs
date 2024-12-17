---
layout: null
title: Random
js: random.js
---

<html lang="ja">

<head>
  {% include common_head.html %}
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pako/2.0.4/pako.min.js"></script>
  <style>
    {% include common.css %}
    #idlist {
      max-height: 700px;
      overflow-y: auto;
      border: 1px solid #ccc;
      padding: 10px; 
    }
    .highlighted {
      background-color: red;
    }
</style>
</head>

<body>
  <div id="map" class="map"></div>
  <div class="map-overlay-right">
    <div>
      <div class="title">タイプでフィルタ</div>
      <select id="type-select" onchange="filterByType(this.value)">
        <option value="ALL">全て</option>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
        <option value="E">E</option>
        <option value="F">F</option>
        <option value="G">G</option>
        <option value="H">H</option>
        <option value="I">I</option>
        <option value="J">J</option>
      </select>
    </div>
    <br />
    <div>
      <input type="button" value="地図の中央にポリゴン生成" onclick="getIso()" />
    </div>
    <div id="idlist">
    </div>
    <div>
      <input type="button" value="クリア" onclick="clearIso()" />
    </div>
  </div>
</body>
<script>
  {% include {{ page.js }} %}
</script>

</html>