---
layout: null
title: Store Location Comparison - Mapbox vs Google
js: store-location-comparison.js
---

<html lang="ja">
<head>
  {% include common_head.html %}
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      height: 100vh; display: flex; flex-direction: column;
      background: #f5f5f5; color: #333;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      overflow: hidden;
    }

    #header {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 20px; background: #fff;
      border-bottom: 2px solid #e0e0e0; flex-shrink: 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    #header .title {
      font-size: 16px; font-weight: 700; color: #333;
      white-space: nowrap; display: flex; align-items: center; gap: 8px;
    }
    #header .spacer { flex: 1; }

    select, .btn, #store-search {
      padding: 8px 16px; border: 1px solid #ddd; border-radius: 6px;
      font-size: 14px; outline: none;
      background: white; color: #333;
    }
    #store-search {
      width: 200px;
    }
    #radius-select {
      display: none;
    }
    #export-btn {
      display: none;
    }
    select:focus, .btn:hover, #store-search:focus {
      border-color: #4285f4;
    }
    #google-key-group { display: flex; align-items: center; gap: 6px; }
    #google-key-group label { font-size: 12px; color: #666; white-space: nowrap; }
    #google-key-input {
      padding: 6px 10px; border: 1px solid #ddd; border-radius: 6px;
      font-size: 12px; width: 220px; outline: none;
    }
    #google-key-input:focus { border-color: #4285f4; }
    #google-key-btn { padding: 6px 10px; font-size: 12px; }
    .btn-export {
      background: #4285f4; color: white; border: none;
      font-weight: 600;
    }
    .btn-export:hover {
      background: #3367d6;
    }

    #layout { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0; }

    #map-row {
      display: grid; grid-template-columns: 1fr 1fr;
      height: 100%; overflow: hidden; border-bottom: 2px solid #e0e0e0;
    }

    .map-pane {
      display: flex; flex-direction: column; overflow: hidden;
      background: white; position: relative;
    }
    .map-pane:first-child { border-right: 1px solid #e0e0e0; }

    .map-header {
      padding: 10px 16px; font-size: 13px; font-weight: 600;
      background: #fafafa; border-bottom: 1px solid #e0e0e0;
      display: flex; align-items: center; justify-content: space-between;
    }
    .map-header .count {
      font-size: 12px; font-weight: 500; color: #666;
      background: #f0f0f0; padding: 3px 8px; border-radius: 12px;
    }

    .map-container { flex: 1; min-height: 0; }

    #results-section {
      flex: 1; display: none; flex-direction: column;
      overflow: hidden; background: white;
    }

    #results-header {
      padding: 16px 20px; background: #fafafa;
      border-bottom: 2px solid #e0e0e0;
    }
    #results-title {
      font-size: 16px; font-weight: 700; margin-bottom: 8px;
    }
    #results-summary {
      display: flex; gap: 20px; font-size: 13px;
      color: #666; flex-wrap: wrap;
    }
    .summary-item {
      display: flex; align-items: center; gap: 6px;
    }
    .summary-item strong {
      font-weight: 600; color: #333;
    }

    #results-filters {
      padding: 12px 20px; background: white;
      border-bottom: 1px solid #e0e0e0;
      display: flex; gap: 8px; align-items: center;
    }
    .filter-btn {
      padding: 6px 14px; border: 1px solid #ddd;
      border-radius: 20px; font-size: 13px;
      background: white; cursor: pointer;
      transition: all 0.2s;
    }
    .filter-btn:hover {
      background: #f5f5f5;
    }
    .filter-btn.active {
      background: #4285f4; color: white;
      border-color: #4285f4; font-weight: 600;
    }

    #results-table-container {
      flex: 1; overflow-y: auto;
    }

    table {
      width: 100%; border-collapse: collapse;
    }
    thead {
      position: sticky; top: 0; background: #fafafa;
      z-index: 10; box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    th {
      padding: 12px 16px; text-align: left;
      font-size: 12px; font-weight: 600;
      color: #666; border-bottom: 2px solid #e0e0e0;
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    th.center { text-align: center; }

    tbody tr {
      border-bottom: 1px solid #f0f0f0;
      transition: background 0.15s;
    }
    tbody tr:hover {
      background: #f9f9f9;
    }

    td {
      padding: 14px 16px; font-size: 14px;
      vertical-align: middle;
    }
    td.center {
      text-align: center;
    }

    .poi-number {
      display: inline-flex; align-items: center; justify-content: center;
      width: 28px; height: 28px; border-radius: 50%;
      background: #e0e0e0; color: #666;
      font-size: 12px; font-weight: 600;
    }

    .poi-name {
      font-weight: 500; color: #333;
      display: flex; align-items: center; gap: 8px;
    }
    .poi-icon {
      font-size: 18px;
    }

    .poi-category {
      font-size: 12px; color: #888;
      margin-top: 2px;
    }

    .check-mark {
      font-size: 18px; color: #34a853;
    }
    .cross-mark {
      font-size: 16px; color: #ddd;
    }

    .distance {
      font-size: 13px; color: #666;
      font-weight: 500;
    }

    #category-breakdown {
      padding: 20px; background: #fafafa;
      border-top: 2px solid #e0e0e0;
    }
    .breakdown-title {
      font-size: 14px; font-weight: 600;
      margin-bottom: 12px; color: #333;
    }
    .breakdown-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }
    .breakdown-item {
      display: flex; justify-content: space-between;
      padding: 8px 12px; background: white;
      border-radius: 6px; font-size: 13px;
      border: 1px solid #e0e0e0;
    }
    .breakdown-category {
      font-weight: 500; color: #333;
    }
    .breakdown-counts {
      display: flex; gap: 12px; color: #666;
    }
    .breakdown-diff {
      font-weight: 600;
    }
    .breakdown-diff.positive { color: #34a853; }
    .breakdown-diff.negative { color: #ea4335; }

    #zoom-display {
      position: absolute;
      bottom: 20px;
      right: 20px;
      background: rgba(255, 255, 255, 0.95);
      padding: 8px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      color: #333;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      z-index: 1;
      border: 1px solid #e0e0e0;
    }
  </style>
</head>
<body>

<div id="header">
  <span class="title">
    <span>🏪</span>
    Store Location Comparison
  </span>
  <input type="text" id="store-search" placeholder="店舗を検索...">
  <select id="store-select">
    <option value="">店舗を選択...</option>
  </select>
  <select id="radius-select">
    <option value="500">半径 500m</option>
    <option value="1000" selected>半径 1km</option>
    <option value="2000">半径 2km</option>
  </select>
  <div class="spacer"></div>
  <div id="google-key-group">
    <label for="google-key-input">Google API Key</label>
    <input type="password" id="google-key-input" placeholder="APIキーを入力">
    <button class="btn" id="google-key-btn">設定</button>
  </div>
  <button class="btn btn-export" id="export-btn">📊 Export CSV</button>
</div>

<div id="layout">
  <!-- 地図比較 -->
  <div id="map-row">
    <div class="map-pane">
      <div class="map-header">
        <span>Google Maps</span>
        <span class="count" id="google-count">0 POIs</span>
      </div>
      <div id="google-map" class="map-container"></div>
    </div>
    <div class="map-pane">
      <div class="map-header">
        <span>Mapbox GL JS</span>
        <span class="count" id="mapbox-count">0 POIs</span>
      </div>
      <div id="mapbox-map" class="map-container">
        <div id="zoom-display">Zoom: 0</div>
      </div>
    </div>
  </div>

  <!-- 統合POI比較リスト -->
  <div id="results-section">
    <div id="results-header">
      <div id="results-title">POI Comparison Results</div>
      <div id="results-summary">
        <div class="summary-item">
          <span>Total:</span>
          <strong id="total-count">0</strong>
        </div>
        <div class="summary-item">
          <span>Both APIs:</span>
          <strong id="both-count">0</strong>
        </div>
        <div class="summary-item">
          <span>Google only:</span>
          <strong id="google-only-count">0</strong>
        </div>
        <div class="summary-item">
          <span>Mapbox only:</span>
          <strong id="mapbox-only-count">0</strong>
        </div>
      </div>
    </div>

    <div id="results-filters">
      <span style="font-size: 13px; color: #666;">Filter:</span>
      <button class="filter-btn active" data-filter="all">All</button>
      <button class="filter-btn" data-filter="both">Both APIs</button>
      <button class="filter-btn" data-filter="google">Google only</button>
      <button class="filter-btn" data-filter="mapbox">Mapbox only</button>
    </div>

    <div id="results-table-container">
      <table>
        <thead>
          <tr>
            <th style="width: 50px;">#</th>
            <th>Name / Category</th>
            <th class="center" style="width: 80px;">Google</th>
            <th class="center" style="width: 80px;">Mapbox</th>
            <th class="center" style="width: 80px;">Distance</th>
          </tr>
        </thead>
        <tbody id="results-tbody">
          <tr>
            <td colspan="5" style="text-align: center; padding: 40px; color: #999;">
              店舗を選択してください
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div id="category-breakdown">
      <div class="breakdown-title">Category Breakdown</div>
      <div class="breakdown-grid" id="breakdown-grid">
        <!-- Populated dynamically -->
      </div>
    </div>
  </div>
</div>

<script>
  {% include {{ page.js }} %}
</script>
</body>
</html>
