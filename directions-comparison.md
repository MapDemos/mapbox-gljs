---
layout: null
title: Directions Comparison - Mapbox vs Google
js: directions-comparison.js
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
    .title {
      font-size: 16px; font-weight: 700; color: #333;
      white-space: nowrap; display: flex; align-items: center; gap: 8px;
    }
    .spacer { flex: 1; }

    /* Mode buttons */
    #mode-btns { display: flex; gap: 8px; }
    .mode-btn {
      padding: 7px 14px; border: 1px solid #ddd; border-radius: 6px;
      font-size: 13px; cursor: pointer; background: white; color: #555;
      transition: all 0.2s;
    }
    .mode-btn.active { color: white; font-weight: 600; }
    #btn-origin.active { background: #34a853; border-color: #34a853; }
    #btn-destination.active { background: #ea4335; border-color: #ea4335; }

    /* Select and buttons */
    select, .btn {
      padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px;
      font-size: 13px; outline: none; cursor: pointer;
      background: white; color: #333;
    }
    select:focus, .btn:hover { border-color: #4285f4; }
    .btn-clear:hover { background: #f5f5f5; border-color: #999; }

    #layout { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-height: 0; }

    #map-row {
      display: grid; grid-template-columns: 1fr 1fr;
      flex: 1; min-height: 0; overflow: hidden; border-bottom: 2px solid #e0e0e0;
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
    .param-group { display: flex; align-items: center; gap: 6px; }
    .param-label { font-size: 12px; color: #666; font-weight: 500; }
    .param-group .btn { padding: 5px 10px; font-size: 12px; }
    #google-key-group { display: flex; align-items: center; gap: 6px; }
    #google-key-group label { font-size: 12px; color: #666; white-space: nowrap; }
    #google-key-input {
      padding: 6px 10px; border: 1px solid #ddd; border-radius: 6px;
      font-size: 12px; width: 220px; outline: none;
    }
    #google-key-input:focus { border-color: #4285f4; }
    #google-key-btn { padding: 6px 10px; font-size: 12px; }
    .api-badge {
      font-size: 11px; font-weight: 500; padding: 3px 8px; border-radius: 12px;
    }
    .mapbox-badge { background: #e8f0fe; color: #1a73e8; }
    .google-badge { background: #fce8e6; color: #d93025; }

    .map-container { flex: 1; min-height: 0; }
    .map-container canvas { cursor: crosshair !important; }

    /* Results row */
    #results-row {
      display: grid; grid-template-columns: 1fr 1fr;
      flex: 0 1 280px; overflow: hidden; background: white;
    }
    .result-pane { display: flex; flex-direction: column; overflow: hidden; }
    .result-pane:first-child { border-right: 1px solid #e0e0e0; }
    .result-header {
      padding: 10px 16px; font-size: 13px; font-weight: 600;
      background: #fafafa; border-bottom: 1px solid #e0e0e0;
    }
    .result-content { flex: 1; overflow-y: auto; padding: 16px; }
    .result-placeholder {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; height: 100%; color: #aaa;
      font-size: 13px; gap: 8px;
    }
    .result-placeholder .icon { font-size: 32px; }

    /* Metric cards in results */
    .result-summary {
      display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;
    }
    .metric-card {
      background: #f8f9fa; border-radius: 8px; padding: 12px;
      border: 1px solid #e0e0e0;
    }
    .metric-label {
      font-size: 11px; color: #666; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;
    }
    .metric-value { font-size: 22px; font-weight: 700; color: #333; }
    .metric-unit { font-size: 12px; color: #666; margin-left: 2px; }
    .route-info {
      font-size: 13px; color: #555; margin-bottom: 12px;
      padding: 8px 12px; background: #f0f4ff; border-radius: 6px;
      border-left: 3px solid #4285f4;
    }
    .steps-title {
      font-size: 12px; font-weight: 600; color: #666;
      text-transform: uppercase; letter-spacing: 0.5px;
      margin-bottom: 8px; margin-top: 12px;
    }
    .step-item {
      display: flex; gap: 10px; align-items: flex-start;
      padding: 6px 0; border-bottom: 1px solid #f0f0f0;
      font-size: 12px; color: #444;
    }
    .step-item:last-child { border-bottom: none; }
    .step-number {
      flex-shrink: 0; width: 22px; height: 22px;
      background: #e8f0fe; color: #1a73e8;
      border-radius: 50%; font-size: 11px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
    }
    .step-text { flex: 1; line-height: 1.4; }

    /* Click hint overlay */
    .click-hint {
      position: absolute; bottom: 28px; left: 50%; transform: translateX(-50%);
      background: rgba(0,0,0,0.7); color: white; padding: 6px 14px;
      border-radius: 20px; font-size: 12px; pointer-events: none;
      white-space: nowrap; z-index: 10;
    }

    /* Loading spinner */
    .loading-indicator {
      display: flex; align-items: center; justify-content: center;
      gap: 10px; padding: 20px; color: #666; font-size: 13px;
    }
    .spinner {
      width: 20px; height: 20px; border: 2px solid #e0e0e0;
      border-top-color: #4285f4; border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Avoid dropdowns */
    .avoid-dropdown { position: relative; }
    .avoid-btn {
      padding: 5px 10px; border: 1px solid #ddd; border-radius: 6px;
      font-size: 12px; cursor: pointer; background: white; color: #555;
      display: flex; align-items: center; gap: 5px; white-space: nowrap;
      transition: border-color 0.2s;
    }
    .avoid-btn:hover, .avoid-dropdown.open .avoid-btn { border-color: #4285f4; }
    .avoid-panel {
      display: none; position: absolute; top: calc(100% + 4px); left: 0;
      background: white; border: 1px solid #ddd; border-radius: 8px;
      padding: 6px; z-index: 200; min-width: 175px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
    }
    .avoid-dropdown.open .avoid-panel { display: block; }
    .avoid-option {
      display: flex; align-items: center; gap: 8px;
      padding: 5px 6px; font-size: 12px; cursor: pointer; border-radius: 4px;
      color: #333; user-select: none;
    }
    .avoid-option:hover { background: #f5f5f5; }
    .avoid-option input[type="checkbox"] { cursor: pointer; }

    /* Batch modal */
    #batch-modal {
      display: none; position: fixed; inset: 0; z-index: 500;
      background: rgba(0,0,0,0.45); overflow-y: auto; padding: 40px 20px;
    }
    #batch-modal.open { display: block; }
    #batch-panel {
      background: white; border-radius: 12px;
      max-width: 1100px; margin: 0 auto;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2); overflow: hidden;
    }
    #batch-panel-header {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 20px; border-bottom: 1px solid #e0e0e0; background: #fafafa;
    }
    #batch-panel-title { font-size: 15px; font-weight: 700; flex: 1; margin: 0; }
    #batch-progress { font-size: 13px; color: #666; white-space: nowrap; }
    .batch-table-wrap { overflow-x: auto; max-height: calc(100vh - 180px); overflow-y: auto; }
    #batch-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    #batch-table thead th {
      position: sticky; top: 0; z-index: 1;
      background: #f8f9fa; padding: 8px 12px;
      font-weight: 600; border-bottom: 1px solid #e0e0e0;
      white-space: nowrap; text-align: right;
    }
    #batch-table thead th:first-child { text-align: left; }
    #batch-table .col-group-mapbox { background: #e8f0fe; color: #1a73e8; text-align: center; }
    #batch-table .col-group-google { background: #fce8e6; color: #d93025; text-align: center; }
    #batch-table .col-group-delta  { background: #f0f0f0; color: #555;    text-align: center; }
    #batch-table tbody td {
      padding: 7px 12px; border-bottom: 1px solid #f0f0f0;
      text-align: right; white-space: nowrap;
    }
    #batch-table tbody td:first-child { text-align: left; font-weight: 500; }
    #batch-table tbody tr:hover td { background: #f5f7ff; }
    .batch-cell-loading { color: #aaa; font-size: 12px; text-align: center !important; }
    .batch-cell-error { color: #ea4335; font-size: 12px; text-align: center !important; }
    .batch-cell-skip { color: #aaa; text-align: center !important; }
  </style>
</head>
<body>

<div id="header">
  <span class="title">
    <span>🗺️</span>
    Directions API 比較
  </span>
  <div id="mode-btns">
    <button class="mode-btn active" id="btn-origin">A&nbsp; 出発地を設定</button>
    <button class="mode-btn" id="btn-destination">B&nbsp; 目的地を設定</button>
  </div>
  <select id="route-preset">
    <option value="">-- ルートを選択 --</option>
  </select>
  <select id="travel-mode">
    <option value="driving">車</option>
    <option value="driving-traffic">車 (交通情報)</option>
  </select>
  <button class="btn" id="batch-btn" disabled>バッチ実行</button>
  <div class="spacer"></div>
  <div id="google-key-group">
    <label for="google-key-input">Google API Key</label>
    <input type="password" id="google-key-input" placeholder="APIキーを入力">
    <button class="btn" id="google-key-btn">設定</button>
  </div>
  <button class="btn btn-clear" id="clear-btn">クリア</button>
</div>

<div id="layout">
  <div id="map-row">
    <div class="map-pane">
      <div class="map-header">
        <span>Mapbox Directions API</span>
        <div class="param-group">
          <span class="param-label">パラメータ</span>
          <div class="avoid-dropdown" id="mapbox-avoid-dropdown">
            <button class="avoid-btn" id="mapbox-avoid-btn">Avoid ▾</button>
            <div class="avoid-panel">
              <label class="avoid-option"><input type="checkbox" value="toll"> Tolls</label>
              <label class="avoid-option"><input type="checkbox" value="motorway"> Motorways</label>
              <label class="avoid-option"><input type="checkbox" value="ferry"> Ferries</label>
              <label class="avoid-option"><input type="checkbox" value="unpaved"> Unpaved Roads</label>
              <label class="avoid-option"><input type="checkbox" value="cash_only_tolls"> Cash-Only Tolls</label>
            </div>
          </div>
          <button class="btn" id="mapbox-execute-btn">実行</button>
        </div>
        <span class="api-badge mapbox-badge">mapbox/directions/v5</span>
      </div>
      <div id="mapbox-map" class="map-container"></div>
      <div class="click-hint" id="mapbox-hint">クリックして出発地 (A) を設定</div>
    </div>
    <div class="map-pane">
      <div class="map-header">
        <span>Google Directions API</span>
        <div class="param-group">
          <span class="param-label">パラメータ</span>
          <div class="avoid-dropdown" id="google-avoid-dropdown">
            <button class="avoid-btn" id="google-avoid-btn">Avoid ▾</button>
            <div class="avoid-panel">
              <label class="avoid-option"><input type="checkbox" value="tolls"> Tolls</label>
              <label class="avoid-option"><input type="checkbox" value="highways"> Highways</label>
              <label class="avoid-option"><input type="checkbox" value="ferries"> Ferries</label>
            </div>
          </div>
          <button class="btn" id="google-execute-btn">実行</button>
        </div>
        <span class="api-badge google-badge">maps/api/directions</span>
      </div>
      <div id="google-map" class="map-container"></div>
      <div class="click-hint" id="google-hint">クリックして出発地 (A) を設定</div>
    </div>
  </div>

  <div id="results-row">
    <div class="result-pane">
      <div class="result-header">Mapbox 結果</div>
      <div class="result-content" id="mapbox-result-content">
        <div class="result-placeholder">
          <span class="icon">🗺️</span>
          <span>出発地と目的地を設定するとルートが表示されます</span>
        </div>
      </div>
    </div>
    <div class="result-pane">
      <div class="result-header">Google 結果</div>
      <div class="result-content" id="google-result-content">
        <div class="result-placeholder">
          <span class="icon">🗺️</span>
          <span>出発地と目的地を設定するとルートが表示されます</span>
        </div>
      </div>
    </div>
  </div>
</div>

<div id="batch-modal">
  <div id="batch-panel">
    <div id="batch-panel-header">
      <h2 id="batch-panel-title">バッチ実行結果</h2>
      <span id="batch-progress"></span>
      <button class="btn" id="batch-csv-btn" disabled>CSVダウンロード</button>
      <button class="btn btn-clear" id="batch-close-btn">閉じる</button>
    </div>
    <div class="batch-table-wrap">
      <table id="batch-table">
        <thead>
          <tr>
            <th rowspan="2">ルート</th>
            <th colspan="4" class="col-group-mapbox">Mapbox</th>
            <th colspan="4" class="col-group-google">Google</th>
            <th colspan="4" class="col-group-delta">Δ (Mapbox − Google)</th>
          </tr>
          <tr>
            <th>所要時間</th><th>距離</th><th>右左折</th><th>ステップ数</th>
            <th>所要時間</th><th>距離</th><th>右左折</th><th>ステップ数</th>
            <th>所要時間</th><th>距離</th><th>右左折</th><th>ステップ数</th>
          </tr>
        </thead>
        <tbody id="batch-tbody"></tbody>
      </table>
    </div>
  </div>
</div>

<script>
  {% include {{ page.js }} %}
</script>
</body>
</html>
