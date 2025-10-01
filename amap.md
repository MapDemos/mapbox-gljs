---
layout: null
title: AMAP
js: amap.js
---
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta
      name="viewport"
      content="initial-scale=1.0, user-scalable=no, width=device-width"
    />
    <script src="https://webapi.amap.com/loader.js"></script>
    <title>AMAP</title>
    <style>
      html,
      body,
      #container {
        width: 100%;
        height: 100%;
      }
    </style>
  </head>
  <body>
    <div id="container"></div>
    <script>
        {% include {{ page.js }} %}
    </script>
  </body>
</html>