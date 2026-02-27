---
layout: none
title: TV POI Details Search
js: details-search.js
---

<html lang="ja">

<head>
  {% include common_head.html %}
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      overflow: hidden;
      background: #1a1a1a;
    }

    .container {
      display: flex;
      height: 100vh;
      width: 100vw;
    }

    /* Left sidebar for category selection */
    .sidebar {
      width: 400px;
      background: #2a2a2a;
      display: flex;
      flex-direction: column;
      border-right: 2px solid #444;
      position: relative;
      z-index: 10;
    }

    /* Header */
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }

    .header h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .header p {
      font-size: 14px;
      opacity: 0.9;
    }

    /* Region switcher */
    .region-switcher {
      background: #333;
      padding: 12px 20px;
      border-bottom: 1px solid #444;
      display: flex;
      gap: 10px;
      align-items: center;
      justify-content: center;
    }

    .region-btn {
      flex: 1;
      padding: 10px;
      background: #444;
      color: #ccc;
      border: 1px solid #555;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .region-btn:hover {
      background: #555;
      color: white;
      transform: translateY(-1px);
    }

    .region-btn.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-color: #667eea;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
    }

    .region-btn .flag {
      font-size: 18px;
    }

    /* Breadcrumb navigation */
    .breadcrumb {
      background: #333;
      padding: 12px 20px;
      color: white;
      font-size: 14px;
      border-bottom: 1px solid #444;
      min-height: 44px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .breadcrumb-item {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .breadcrumb-separator {
      color: #888;
    }

    .breadcrumb-link {
      color: #8bb3ff;
      cursor: pointer;
      text-decoration: none;
      transition: color 0.2s;
    }

    .breadcrumb-link:hover {
      color: #a8c5ff;
      text-decoration: underline;
    }

    /* Category list */
    .category-list {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }

    /* TV-optimized tile style */
    .category-tile {
      background: #3a3a3a;
      border: 2px solid transparent;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 16px;
      min-height: 80px;
      position: relative;
      overflow: hidden;
    }

    .category-tile:hover,
    .category-tile:focus {
      background: #4a4a4a;
      border-color: #667eea;
      transform: scale(1.02);
      box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
      outline: none;
    }

    .category-tile.selected {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-color: #8bb3ff;
      color: white;
    }

    .category-icon {
      width: 48px;
      height: 48px;
      background: #555;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
    }

    .category-tile:hover .category-icon,
    .category-tile.selected .category-icon {
      background: rgba(255, 255, 255, 0.2);
    }

    .category-content {
      flex: 1;
    }

    .category-name {
      font-size: 18px;
      font-weight: 500;
      color: white;
      margin-bottom: 4px;
    }

    .category-count {
      font-size: 14px;
      color: #aaa;
    }

    .category-tile.selected .category-count {
      color: rgba(255, 255, 255, 0.8);
    }

    .category-arrow {
      font-size: 20px;
      color: #888;
      transition: transform 0.3s;
    }

    .category-tile:hover .category-arrow {
      transform: translateX(4px);
      color: #667eea;
    }

    .category-tile.selected .category-arrow {
      color: white;
    }

    /* Loading state */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
      gap: 20px;
    }

    .loading-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #444;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-text {
      color: #aaa;
      font-size: 16px;
    }

    .loading-progress {
      width: 200px;
      height: 4px;
      background: #444;
      border-radius: 2px;
      overflow: hidden;
    }

    .loading-progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      width: 0%;
      transition: width 0.3s ease;
    }

    /* Status bar */
    .status-bar {
      background: #333;
      padding: 12px 20px;
      border-top: 1px solid #444;
      color: #aaa;
      font-size: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .status-count {
      color: #8bb3ff;
      font-weight: 500;
    }

    /* Map container */
    #map {
      flex: 1;
      position: relative;
      overflow: hidden;
    }

    /* POI details popup */
    .poi-popup {
      position: absolute;
      bottom: 20px;
      left: 20px;
      right: 20px;
      max-width: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      padding: 20px;
      max-height: 60vh;
      overflow-y: auto;
      z-index: 100;
      transform: translateY(120%);
      transition: transform 0.3s ease;
    }

    .poi-popup.show {
      transform: translateY(0);
    }

    .poi-popup-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 16px;
    }

    .poi-popup-title {
      font-size: 20px;
      font-weight: 600;
      color: #333;
    }

    .poi-popup-close {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #f0f0f0;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .poi-popup-close:hover {
      background: #e0e0e0;
    }

    .poi-detail {
      margin-bottom: 12px;
      display: flex;
      gap: 8px;
    }

    .poi-detail-label {
      font-weight: 500;
      color: #666;
      min-width: 120px;
      flex-shrink: 0;
    }

    .poi-detail-value {
      color: #333;
      flex: 1;
      word-break: break-word;
    }

    .poi-popup h3 {
      font-size: 16px;
      font-weight: 600;
      color: #667eea;
      margin-top: 20px;
      margin-bottom: 12px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;
    }

    .poi-popup h3:first-child {
      margin-top: 0;
      padding-top: 0;
      border-top: none;
    }

    .poi-popup details {
      margin-top: 20px;
      padding: 10px;
      background: #f5f5f5;
      border-radius: 8px;
    }

    .poi-popup summary {
      cursor: pointer;
      font-weight: bold;
      color: #666;
    }

    .poi-popup pre {
      margin-top: 10px;
      padding: 10px;
      background: white;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 11px;
      line-height: 1.4;
      color: #333;
      border: 1px solid #e0e0e0;
    }

    /* Photo gallery styles */
    .poi-photo-gallery {
      margin: -20px -20px 20px -20px;
      padding: 0;
      height: 200px;
      background: #f5f5f5;
      position: relative;
      overflow: hidden;
    }

    .poi-photos {
      display: flex;
      gap: 0;
      overflow-x: auto;
      height: 100%;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
    }

    .poi-photo {
      min-width: 100%;
      height: 100%;
      object-fit: cover;
      flex-shrink: 0;
      scroll-snap-align: start;
    }

    .poi-photo-thumbnail {
      min-width: 200px;
      height: 100%;
      object-fit: cover;
      flex-shrink: 0;
      cursor: pointer;
      transition: opacity 0.2s;
    }

    .poi-photo-thumbnail:hover {
      opacity: 0.9;
    }

    /* Tab navigation styles */
    .poi-tabs {
      display: flex;
      gap: 8px;
      border-bottom: 2px solid #e0e0e0;
      margin-bottom: 20px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .poi-tab {
      padding: 10px 16px;
      background: none;
      border: none;
      border-bottom: 3px solid transparent;
      color: #666;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .poi-tab:hover {
      color: #333;
      background: #f5f5f5;
    }

    .poi-tab.active {
      color: #667eea;
      border-bottom-color: #667eea;
      background: none;
    }

    /* Tab content styles */
    .poi-tab-content {
      display: none;
      animation: fadeIn 0.3s ease;
    }

    .poi-tab-content.active {
      display: block;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Photo gallery scrollbar */
    .poi-photos::-webkit-scrollbar {
      height: 6px;
    }

    .poi-photos::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.1);
    }

    .poi-photos::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.3);
      border-radius: 3px;
    }

    .poi-photos::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.5);
    }

    /* No results message */
    .no-results {
      text-align: center;
      padding: 40px;
      color: #888;
    }

    .no-results-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .no-results-text {
      font-size: 18px;
    }

    /* Scrollbar styling */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: #333;
    }

    ::-webkit-scrollbar-thumb {
      background: #555;
      border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #667eea;
    }

    /* Focus styles for TV navigation */
    *:focus {
      outline: 2px solid #667eea;
      outline-offset: 2px;
    }

    /* Mapbox popup customization */
    .mapboxgl-popup-content {
      padding: 0;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }

    .mapboxgl-popup-close-button {
      font-size: 20px;
      padding: 8px;
      color: #666;
    }
  </style>
</head>

<body>
  <div class="container">
    <!-- Left sidebar for categories -->
    <div class="sidebar">
      <div class="header">
        <h1>周辺検索</h1>
      </div>

      <div class="region-switcher">
        <button class="region-btn active" data-region="japan" onclick="switchRegion('japan')">
          <span class="flag">🇯🇵</span> 日本
        </button>
        <button class="region-btn" data-region="global" onclick="switchRegion('global')">
          <span class="flag">🇺🇸</span> US
        </button>
      </div>

      <div class="breadcrumb" id="breadcrumb">
        <span class="breadcrumb-item">カテゴリー選択</span>
      </div>

      <div class="category-list" id="categoryList">
        <!-- Categories will be populated here -->
      </div>

      <div class="status-bar">
        <span id="statusText">カテゴリーを選択してください</span>
        <span id="statusCount"></span>
      </div>
    </div>

    <!-- Map container -->
    <div id="map">
      <!-- POI details popup (hidden by default) -->
      <div class="poi-popup" id="poiPopup">
        <div class="poi-popup-header">
          <h2 class="poi-popup-title" id="poiTitle"></h2>
          <button class="poi-popup-close" onclick="closePOIPopup()">✕</button>
        </div>
        <div id="poiDetails"></div>
      </div>
    </div>
  </div>

  <script>
    {% include global-categories.js %}
  </script>
  <script>
    {% include {{ page.js }} %}
  </script>
</body>

</html>