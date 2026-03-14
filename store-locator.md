---
layout: null
title: Store Locator
js: store-locator.js
---

<html lang="ja">

<head>
  {% include common_head.html %}
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif;
      overflow: hidden;
    }

    #container {
      display: flex;
      height: 100vh;
      width: 100vw;
    }

    /* Sidebar styles */
    #sidebar {
      width: 340px;
      background-color: #f8f8f8;
      overflow-y: auto;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
    }

    #sidebar-header {
      padding: 0;
      background-color: #ED1C24;
    }

    .search-container {
      position: relative;
      background-color: #ED1C24;
    }

    #search-box {
      width: 100%;
      padding: 12px 45px 12px 15px;
      border: none;
      border-radius: 0;
      font-size: 15px;
      box-sizing: border-box;
      margin: 0;
      background-color: #ED1C24;
      color: white;
      display: block;
    }

    #search-box::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }

    .search-icon {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #search-suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      max-height: 300px;
      overflow-y: auto;
      z-index: 1000;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      display: none;
    }

    #search-suggestions.active {
      display: block;
    }

    .suggestion-item {
      padding: 12px 15px;
      cursor: pointer;
      border-bottom: 1px solid #e8e8e8;
      font-size: 14px;
    }

    .suggestion-item:hover {
      background-color: #f5f5f5;
    }

    .suggestion-item:last-child {
      border-bottom: none;
    }

    .suggestion-name {
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .suggestion-address {
      font-size: 12px;
      color: #666;
    }

    #clear-filters {
      width: 100%;
      padding: 12px 15px;
      background-color: #ED1C24;
      color: white;
      border: none;
      border-radius: 0;
      cursor: pointer;
      font-size: 14px;
      margin: 0;
      transition: background-color 0.2s;
      font-weight: 500;
      display: block;
      text-align: right;
    }

    #clear-filters:hover {
      background-color: #d11920;
    }

    .filter-section {
      background-color: white;
      margin: 0;
      border-radius: 0;
      overflow: hidden;
    }

    .filter-header {
      padding: 15px 20px;
      background-color: white;
      border: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
      font-size: 15px;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #333;
    }

    .filter-header:hover {
      background-color: #fafafa;
    }

    .filter-content {
      padding: 15px 15px 10px 15px;
      display: none;
      background-color: white;
      border-top: 1px solid #f0f0f0;
    }

    .filter-content.active {
      display: flex;
      flex-wrap: wrap;
    }

    .brand-filter {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      padding: 8px;
      border: none;
      background: none;
      margin: 0 8px 12px 0;
      transition: opacity 0.2s;
      opacity: 0.4;
    }

    .brand-filter.active {
      opacity: 1;
    }

    .brand-filter:hover {
      opacity: 0.7;
    }

    .brand-icon {
      width: 48px;
      height: 48px;
      object-fit: contain;
      margin-bottom: 6px;
      display: block;
    }

    .brand-name {
      font-size: 11px;
      color: #333;
      text-align: center;
      line-height: 1.2;
    }

    #store-count {
      padding: 12px 20px;
      background-color: white;
      font-size: 13px;
      font-weight: 500;
      border-top: 1px solid #e0e0e0;
      border-bottom: 1px solid #e0e0e0;
      color: #666;
    }

    #store-list {
      flex: 1;
      overflow-y: auto;
      background-color: #f8f8f8;
      padding: 0;
    }

    .store-item {
      background-color: white;
      padding: 16px 20px;
      margin: 0;
      border-bottom: 1px solid #e8e8e8;
      cursor: pointer;
      transition: background-color 0.2s;
      display: flex;
      align-items: flex-start;
    }

    .store-item:hover {
      background-color: #fafafa;
    }

    .store-item.active {
      background-color: #fff5f5;
      border-left: 3px solid #ED1C24;
      padding-left: 17px;
    }

    .store-brand-icon {
      width: 36px;
      height: 36px;
      flex-shrink: 0;
      margin-right: 12px;
      object-fit: contain;
      display: block;
    }

    .store-info {
      flex: 1;
      min-width: 0;
    }

    .store-name {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 6px;
      color: #333;
      line-height: 1.3;
    }

    .store-address {
      font-size: 12px;
      color: #888;
      line-height: 1.5;
    }

    /* Map styles */
    #map {
      flex: 1;
      height: 100vh;
    }

    /* Popup styles */
    .mapboxgl-popup-content {
      padding: 0;
      border-radius: 4px;
      overflow: hidden;
      min-width: 420px;
    }

    .popup-header {
      background-color: #ED1C24;
      color: white;
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .popup-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .popup-close {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .popup-body {
      padding: 15px;
      background-color: white;
      max-height: 400px;
      overflow-y: auto;
    }

    .popup-section {
      margin-bottom: 12px;
      font-size: 14px;
      display: flex;
      gap: 12px;
    }

    .popup-section:last-child {
      margin-bottom: 0;
    }

    .popup-label {
      font-weight: 600;
      color: #333;
      min-width: 80px;
      flex-shrink: 0;
    }

    .popup-value {
      color: #666;
      line-height: 1.5;
      flex: 1;
    }

    .popup-value-bold {
      font-weight: 600;
      font-size: 21px;
    }

    .popup-amenities {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .amenity-tag {
      background-color: #f0f0f0;
      padding: 4px 8px;
      border-radius: 3px;
      font-size: 12px;
      color: #555;
    }

    .popup-details-btn {
      background-color: #ED1C24;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      width: 100%;
      font-size: 14px;
      font-weight: 600;
      margin-top: 15px;
    }

    .popup-details-btn:hover {
      background-color: #d11920;
    }

    /* Custom marker styles */
    .marker {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      transition: transform 0.2s;
    }

    .marker:hover {
      transform: scale(1.1);
    }

    .marker.active {
      transform: scale(1.2);
      box-shadow: 0 3px 10px rgba(0,0,0,0.4);
    }

    /* Mobile responsive */
    @media (max-width: 768px) {
      #container {
        flex-direction: column;
      }

      #sidebar {
        width: 100%;
        height: 50vh;
      }

      #map {
        height: 50vh;
      }
    }

    /* Scrollbar styling */
    #store-list::-webkit-scrollbar {
      width: 8px;
    }

    #store-list::-webkit-scrollbar-track {
      background: #EEEEEE;
    }

    #store-list::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 4px;
    }

    #store-list::-webkit-scrollbar-thumb:hover {
      background: #999;
    }

    /* Area group marker styles */
    .area-group-marker {
      display: flex;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      transition: transform 0.2s;
    }

    .area-group-marker:hover {
      transform: scale(1.05);
    }

    .area-label {
      background-color: white;
      color: black;
      padding: 4px 8px;
      border: 1.5px solid black;
      border-right: none;
      white-space: nowrap;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif;
    }

    .area-count {
      background-color: #ED1C24;
      color: white;
      padding: 4px 8px;
      border: 1.5px solid black;
      white-space: nowrap;
      min-width: 24px;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif;
    }
  </style>
</head>

<body>
  <div id="container">
    <div id="sidebar">
      <div id="sidebar-header">
        <div class="search-container">
          <input type="text" id="search-box" name="search" placeholder="ブランド・地名・駅名で探す" autocomplete="off">
          <span class="search-icon">
            <svg width="20" height="20" viewBox="0 0 20 20">
              <circle fill="none" stroke="white" stroke-width="1.1" cx="9" cy="9" r="7"></circle>
              <path fill="none" stroke="white" stroke-width="1.1" d="M14,14 L18,18 L14,14 Z"></path>
            </svg>
          </span>
          <div id="search-suggestions"></div>
        </div>
        <button id="clear-filters">条件をクリアする</button>

        <div class="filter-section">
          <button class="filter-header" id="brand-filter-toggle">
            ブランドを選ぶ
            <span class="toggle-icon">▼</span>
          </button>
          <div class="filter-content" id="brand-filters">
            <!-- Brand filters will be populated dynamically -->
          </div>
        </div>
      </div>

      <div id="store-count">0件見つかりました</div>
      <div id="store-list">
        <!-- Store items will be populated dynamically -->
      </div>
    </div>

    <div id="map"></div>
  </div>

  <script>
    {% include {{ page.js }} %}
  </script>
</body>

</html>
