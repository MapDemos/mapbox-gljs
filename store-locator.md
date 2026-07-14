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
      position: relative;
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
      padding: 8px 15px;
      background: none;
      color: white;
      border: none;
      cursor: pointer;
      font-size: 13px;
      margin: 0;
      transition: opacity 0.2s;
      font-weight: 400;
      display: block;
      text-align: right;
    }

    #clear-filters:hover {
      opacity: 0.8;
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

    .toggle-icon {
      display: flex;
      align-items: center;
      transition: transform 0.3s ease-out;
    }

    .toggle-icon.expanded {
      transform: rotate(180deg);
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

    #brand-filters {
      flex-direction: column;
      flex-wrap: nowrap;
      align-items: stretch;
    }

    .brand-filter {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      padding: 8px 6px;
      border: none;
      background: none;
      border-radius: 4px;
      width: 100%;
      text-align: left;
      transition: opacity 0.2s, background-color 0.15s;
      opacity: 1;
    }

    .brand-filter:hover {
      background-color: #fafafa;
    }

    /* Once any brand is selected, dim the rest so only selected brands read as "on" */
    #brand-filters.has-selection .brand-filter {
      opacity: 0.4;
    }

    #brand-filters.has-selection .brand-filter.active {
      opacity: 1;
    }

    .brand-icon {
      width: 36px;
      height: 36px;
      object-fit: contain;
      flex-shrink: 0;
      display: block;
    }

    .brand-name {
      font-size: 13px;
      color: #333;
      line-height: 1.2;
    }

    /* Amenity filter (絞り込み検索) styles */
    .amenity-filters {
      flex-direction: column;
      flex-wrap: nowrap;
      align-items: stretch;
    }

    .amenity-filter {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 6px;
      border: none;
      background: none;
      border-radius: 4px;
      cursor: pointer;
      text-align: left;
      width: 100%;
      transition: background-color 0.15s;
    }

    .amenity-filter:hover {
      background-color: #fafafa;
    }

    .amenity-filter.active {
      background-color: rgba(237, 28, 36, 0.08);
    }

    .amenity-filter-icon {
      width: 24px;
      height: 24px;
      object-fit: contain;
      flex-shrink: 0;
    }

    .amenity-filter-name {
      font-size: 13px;
      color: #333;
    }

    .amenity-filter.active .amenity-filter-name {
      font-weight: 600;
      color: #ED1C24;
    }

    .floating-clear-btn {
      position: absolute;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      display: none;
      align-items: center;
      gap: 5px;
      box-sizing: border-box;
      height: 24px;
      background-color: white;
      color: #333;
      border: 1px solid #e5e5e5;
      border-radius: 500px;
      padding: 0 15px;
      font-size: 12px;
      font-weight: 400;
      cursor: pointer;
      box-shadow: 0 1px 4px -1px rgba(0,0,0,0.3);
      z-index: 10;
      transition: background-color 0.2s;
    }

    .floating-clear-btn:hover {
      background-color: #f5f5f5;
    }

    .floating-clear-btn.visible {
      display: flex;
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
      border-radius: 0;
      overflow: hidden;
      width: 380px;
      background: rgba(255, 255, 255, 0.95);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .popup-header {
      background-color: #ED1C24;
      color: white;
      padding: 10px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .popup-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
    }

    .popup-close {
      background: #fff;
      border: none;
      border-radius: 50%;
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
      color: #333;
      line-height: 1.5;
      flex: 1;
    }

    .popup-value-bold {
      font-weight: 500;
      font-size: 18px;
    }

    .popup-value-amenities {
      font-size: 16px;
    }

    .popup-footer {
      display: flex;
      gap: 10px;
      padding: 10px 16px;
      border-top: 1px solid rgb(239, 239, 239);
      background-color: white;
    }

    .popup-details-btn {
      flex: 1;
      background-color: #ED1C24;
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      text-align: center;
      text-decoration: none;
    }

    .popup-details-btn:hover {
      background-color: #d11920;
    }

    .popup-menu-btn {
      flex: 1;
      display: inline-block;
      background-color: rgb(51, 146, 249);
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      text-align: center;
      text-decoration: none;
    }

    .popup-menu-btn:hover {
      background-color: #2f7fd6;
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
      font-weight: 400;
      border: 1px solid #555;
      border-radius: 2px;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif;
    }

    .area-label {
      background-color: white;
      color: #000;
      padding: 5px 4px;
      line-height: 12px;
      white-space: nowrap;
    }

    .area-count {
      background-color: #ED1C24;
      color: white;
      padding: 5px 4px;
      line-height: 12px;
      white-space: nowrap;
      min-width: 20px;
      text-align: center;
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
            <span class="toggle-icon">
              <svg width="12" height="12" viewBox="0 0 12 12">
                <polyline fill="none" stroke="#000" stroke-width="1.1" points="1 3.5 6 8.5 11 3.5"></polyline>
              </svg>
            </span>
          </button>
          <div class="filter-content" id="brand-filters">
            <!-- Brand filters will be populated dynamically -->
          </div>
        </div>

        <div class="filter-section">
          <button class="filter-header" id="amenity-filter-toggle">
            絞り込み検索
            <span class="toggle-icon">
              <svg width="12" height="12" viewBox="0 0 12 12">
                <polyline fill="none" stroke="#000" stroke-width="1.1" points="1 3.5 6 8.5 11 3.5"></polyline>
              </svg>
            </span>
          </button>
          <div class="filter-content amenity-filters" id="amenity-filters">
            <!-- Amenity filters will be populated dynamically -->
          </div>
        </div>
      </div>

      <div id="store-count">0件見つかりました</div>
      <div id="store-list">
        <!-- Store items will be populated dynamically -->
      </div>
    </div>

    <div id="map"></div>
    <button id="floating-clear-filters" class="floating-clear-btn">
      <svg width="10" height="10" viewBox="0 0 20 20">
        <path fill="none" stroke="#333" stroke-width="1.5" d="M16,16 L4,4"></path>
        <path fill="none" stroke="#333" stroke-width="1.5" d="M16,4 L4,16"></path>
      </svg>
      条件をクリアする
    </button>
  </div>

  <script>
    {% include {{ page.js }} %}
  </script>
</body>

</html>
