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

    .suggestion-item.highlighted {
      background-color: #e8f0fe;
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

    #store-list-link {
      display: block;
      padding: 0 15px 8px;
      color: white;
      font-size: 12px;
      text-align: right;
      opacity: 0.85;
    }

    #store-list-link:hover {
      opacity: 1;
      text-decoration: underline;
    }

    #lang-toggle {
      display: block;
      width: 100%;
      padding: 0 15px 10px;
      background: none;
      border: none;
      color: white;
      font-size: 12px;
      text-align: right;
      opacity: 0.85;
      cursor: pointer;
      text-decoration: underline;
    }

    #lang-toggle:hover {
      opacity: 1;
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
    #amenity-filter-wrapper.active {
      flex-direction: column;
      flex-wrap: nowrap;
    }

    .keyboard-guide-list {
      margin: 0;
      padding: 0;
      list-style: none;
      font-size: 13px;
      color: #333;
      line-height: 1.8;
    }

    .keyboard-guide-list kbd {
      display: inline-block;
      padding: 1px 6px;
      border: 1px solid #ccc;
      border-radius: 3px;
      background-color: #f8f8f8;
      font-family: inherit;
      font-size: 12px;
    }

    .amenity-filter-mode {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #f0f0f0;
    }

    .amenity-mode-btn {
      flex: 1;
      padding: 6px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background-color: white;
      color: #666;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }

    .amenity-mode-btn.active {
      background-color: #ED1C24;
      border-color: #ED1C24;
      color: white;
    }

    .amenity-filters {
      display: flex;
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

    #route-info-banner {
      position: absolute;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      display: none;
      align-items: center;
      gap: 10px;
      background-color: white;
      color: #333;
      border-radius: 6px;
      padding: 8px 14px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
      z-index: 10;
    }

    #route-info-banner.active {
      display: flex;
    }

    #route-info-banner button {
      background: none;
      border: none;
      color: #666;
      font-size: 16px;
      line-height: 1;
      cursor: pointer;
      padding: 0;
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
      background-color: #f8f8f8;
      padding: 0;
    }

    .empty-state-nearest {
      padding: 24px 20px;
      text-align: center;
      color: #666;
    }

    .empty-state-nearest p {
      margin: 0 0 12px;
      font-size: 14px;
    }

    .nearest-store-link {
      background-color: #ED1C24;
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }

    .nearest-store-link:hover {
      background-color: #d11920;
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

    .store-item:focus-visible {
      outline: 3px solid #2684FF;
      outline-offset: -3px;
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

    .webgl-fallback {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 40px;
      text-align: center;
      color: #666;
      background-color: #f8f8f8;
      box-sizing: border-box;
    }

    .webgl-fallback p {
      margin: 4px 0;
      font-size: 14px;
    }

    /* Popup styles */
    .mapboxgl-popup {
      /* Above the mobile bottom sheet (z-index 10) - the sheet is an overlay
         Mapbox's own container-based collision detection doesn't know about,
         so an anchor choice that places the popup low can still end up
         visually behind the sheet without this. */
      z-index: 50;
    }

    .mapboxgl-popup-content {
      padding: 0;
      border-radius: 0;
      overflow: hidden;
      width: 380px;
      max-width: 100%; /* respect Mapbox's own edge-avoidance max-width on the wrapper */
      box-sizing: border-box;
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
      gap: 10px;
    }

    .popup-brand-logo {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      object-fit: contain;
      background: white;
      flex-shrink: 0;
    }

    .popup-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      flex: 1;
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
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .popup-value-amenities.expanded {
      -webkit-line-clamp: unset;
      overflow: visible;
    }

    .popup-route-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 6px;
    }

    .popup-route-actions button,
    .popup-route-actions a {
      background: none;
      border: none;
      padding: 0;
      color: rgb(51, 146, 249);
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      font-family: inherit;
    }

    .popup-route-actions button:hover,
    .popup-route-actions a:hover {
      text-decoration: underline;
    }

    .popup-amenities-toggle {
      background: none;
      border: none;
      padding: 2px 0 0;
      margin: 0;
      color: rgb(51, 146, 249);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }

    .popup-open-status {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 3px;
      font-size: 12px;
      font-weight: 700;
      vertical-align: middle;
    }

    .popup-open-status.is-open {
      background-color: #E6F4EA;
      color: #1E7E34;
    }

    .popup-open-status.is-closed {
      background-color: #F1F1F1;
      color: #666;
    }

    .popup-notice {
      background-color: #FFF3CD;
      color: #664D03;
      border: 1px solid #FFE69C;
      border-radius: 4px;
      padding: 8px 10px;
      font-size: 13px;
      line-height: 1.4;
      margin-bottom: 12px;
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

    .popup-reserve-btn {
      flex: 1;
      display: inline-block;
      background-color: #2E7D32;
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

    .popup-reserve-btn:hover {
      background-color: #276a2b;
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

    /* Bottom-sheet drag handle + list/map tabs - mobile only, hidden on desktop */
    #sheet-handle-bar {
      display: none;
    }

    #mobile-view-tabs {
      display: none;
    }

    /* Mobile responsive - map fills the screen, sidebar becomes a draggable
       bottom sheet over it with 3 snap states (collapsed/default/expanded) */
    @media (max-width: 768px) {
      #container {
        position: relative;
        flex-direction: column;
      }

      #map {
        height: 100%;
      }

      /* Keep the whole popup (header+body+footer) comfortably short on
         phones, so it fits above the bottom sheet regardless of which side
         Mapbox chooses to anchor it toward. */
      .popup-body {
        max-height: 32vh;
      }

      #sidebar {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 45vh; /* default state */
        max-height: 90vh;
        min-height: 76px;
        border-radius: 16px 16px 0 0;
        box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.3);
        z-index: 10;
        transition: height 0.25s ease;
      }

      #sidebar.sheet-dragging {
        transition: none;
      }

      #sidebar.sheet-collapsed {
        height: 76px;
      }

      #sidebar.sheet-expanded {
        height: 90vh;
      }

      #sheet-handle-bar {
        display: flex;
        justify-content: center;
        padding: 8px 0 6px;
        background-color: white;
        border-radius: 16px 16px 0 0;
        touch-action: none;
        cursor: grab;
        position: sticky;
        top: 0;
        z-index: 2;
        flex-shrink: 0;
      }

      #sheet-handle {
        width: 36px;
        height: 4px;
        border-radius: 2px;
        background-color: #ccc;
      }

      #mobile-view-tabs {
        display: flex;
        gap: 8px;
        padding: 0 16px 10px;
        background-color: white;
        position: sticky;
        top: 20px;
        z-index: 2;
        flex-shrink: 0;
      }

      .mobile-tab {
        flex: 1;
        padding: 9px;
        border: none;
        border-radius: 6px;
        background-color: #eee;
        color: #333;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
      }

      .mobile-tab.active {
        background-color: #ED1C24;
        color: white;
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
      <div id="sheet-handle-bar" aria-hidden="true"><span id="sheet-handle"></span></div>
      <div id="mobile-view-tabs">
        <button id="tab-list" class="mobile-tab active" type="button">リスト</button>
        <button id="tab-map" class="mobile-tab" type="button">地図</button>
      </div>
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
        <a id="store-list-link" href="store-list.html">全店舗一覧を見る</a>
        <button id="lang-toggle" type="button">English</button>

        <div class="filter-section">
          <button class="filter-header" id="brand-filter-toggle">
            <span class="btn-label">ブランドを選ぶ</span>
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
            <span class="btn-label">絞り込み検索</span>
            <span class="toggle-icon">
              <svg width="12" height="12" viewBox="0 0 12 12">
                <polyline fill="none" stroke="#000" stroke-width="1.1" points="1 3.5 6 8.5 11 3.5"></polyline>
              </svg>
            </span>
          </button>
          <div class="filter-content" id="amenity-filter-wrapper">
            <div class="amenity-filter-mode" id="amenity-filter-mode">
              <button class="amenity-mode-btn active" id="amenity-mode-and" type="button">すべて満たす</button>
              <button class="amenity-mode-btn" id="amenity-mode-or" type="button">いずれか満たす</button>
            </div>
            <div class="amenity-filters" id="amenity-filters">
              <!-- Amenity filters will be populated dynamically -->
            </div>
          </div>
        </div>

        <div class="filter-section">
          <button class="filter-header" id="keyboard-guide-toggle">
            <span class="btn-label">キーボード操作ガイド</span>
            <span class="toggle-icon">
              <svg width="12" height="12" viewBox="0 0 12 12">
                <polyline fill="none" stroke="#000" stroke-width="1.1" points="1 3.5 6 8.5 11 3.5"></polyline>
              </svg>
            </span>
          </button>
          <div class="filter-content" id="keyboard-guide-content">
            <ul class="keyboard-guide-list">
              <li id="kbd-guide-tab"><kbd>Tab</kbd> / <kbd>Shift+Tab</kbd> — 次/前の項目へ移動</li>
              <li id="kbd-guide-enter"><kbd>Enter</kbd> / <kbd>Space</kbd> — 選択・実行</li>
              <li id="kbd-guide-arrow"><kbd>↑</kbd> / <kbd>↓</kbd> — 検索候補の選択</li>
              <li id="kbd-guide-esc"><kbd>Esc</kbd> — 検索候補・ポップアップを閉じる</li>
            </ul>
          </div>
        </div>
      </div>

      <div id="store-count">0件見つかりました</div>
      <div id="store-list">
        <!-- Store items will be populated dynamically -->
      </div>
    </div>

    <div id="map" aria-hidden="true"></div>
    <div id="route-info-banner"></div>
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
