---
layout: null
title: Google VS Mapbox
js: google-mapbox.js
---

<html lang="ja">

<head>
  {% include common_head.html %}
<script>
  (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
    key: "AIzaSyC-RzTEU-ZoG5Tjy-YfB65PQjwzTGjlbiE",
    v: "weekly",
  });
</script>
  <style>
    .map-container {
      display: flex; 
      width: 100%;
      height: 100%;
    }
    .map {
      height: 100%; width: 50%;
    }
</style>
</head>

<body>
  <div class="map-container">
    <div id="map" class="map"></div>
    <div id="google-map" class="map"></div>
  </div>
  
</body>
<script>
  {% include {{ page.js }} %}
</script>

</html>