---
layout: null
title: MCP Client
js: mcp-client.js
---

<html lang="ja">
<head>
  {% include common_head.html %}
  <style>
  {% include common.css %}
  body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
  #chat { border: 1px solid #ccc; height: 400px; overflow-y: scroll; padding: 10px; margin-bottom: 10px; }
  #input { width: 70%; padding: 10px; }
  #send { width: 25%; padding: 10px; }
  .message { margin: 10px 0; padding: 10px; border-radius: 5px; }
  .user { background-color: #e3f2fd; text-align: right; }
  .assistant { background-color: #f1f8e9; }
  .function { background-color: #fff3e0; font-size: 0.9em; }
</style>
</head>

<body>
    <h1>Mapbox AI Assistant</h1>
    <div id="chat"></div>
    <input type="text" id="input" placeholder="Ask about locations, directions, etc...">
    <button id="send">Send</button>
<script>
  {% include {{ page.js }} %}
</script>
</body>
</html>