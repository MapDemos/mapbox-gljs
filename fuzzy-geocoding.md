---
layout: null
title: Fuzzy Geocoding
js: fuzzy-geocoding.js
---


<head>
  {% include common_head.html %}
  <style>
    body {
      margin: 0;
      padding: 0;
      display: flex;
      height: 100vh;
      font-family: 'Helvetica Neue', Arial, Helvetica, sans-serif;
    }
    #sidebar {
      width: 400px;
      min-width: 250px; /* Minimum width */
      max-width: 50%; /* Maximum width */
      background-color: #fff;
      padding: 20px;
      overflow-y: auto;
      box-shadow: 2px 0 5px rgba(0,0,0,0.1);
      z-index: 1;
      flex-shrink: 0; /* Prevent sidebar from shrinking */
      box-sizing: border-box;
    }
    #resizer {
      width: 5px;
      background: #f1f1f1;
      cursor: col-resize;
      flex-shrink: 0;
    }
    #map-container {
      flex-grow: 1; /* Allow map container to grow */
      position: relative; /* Needed for the map to position correctly */
    }
    #map {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 100%;
    }
    /* UI element styles */
    #address-input {
      width: calc(100% - 80px);
      padding: 5px;
      margin-right: 5px;
      box-sizing: border-box;
    }
    #search-button {
      width: 70px;
      padding: 5px;
    }
    #results {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #ccc;
      font-size: 12px;
      line-height: 1.5;
    }
    #results pre {
      background-color: #eee;
      padding: 10px;
      border-radius: 3px;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .matched {
      color: #28a745; /* Green */
      font-weight: bold;
    }
    .unmatched {
      color: #dc3545; /* Red */
      text-decoration: line-through;
    }
    .result-item {
      margin-bottom: 15px;
      padding: 8px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
    .result-item:hover {
      background-color: #f0f0f0;
    }
    .match-code-list {
      list-style-type: none;
      padding-left: 15px;
      margin-top: 5px;
      font-size: 11px;
      text-transform: capitalize;
    }
    
</style>
</head>

<body>
  <div id="sidebar">
      <h3>{{ page.title }}</h3>
      <div>
          <input type="text" id="address-input" placeholder="Enter an address..." value="4/7 Trent Street, Island Bay, Wellington" />
          <button id="search-button">Search</button>
      </div>
      <div id="results"></div>
  </div>

  <div id="resizer"></div>

  <div id="map-container">
      <div id="map"></div>
  </div>
<script>
  {% include {{ page.js }} %}
</script>
