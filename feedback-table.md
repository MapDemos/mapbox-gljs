---
layout: none
title: Mapbox Feedback API - Data Table View
js: feedback-table.js
---

<html lang="en">

<head>
  {% include common_head.html %}
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Grid.js CSS -->
  <link href="https://unpkg.com/gridjs/dist/theme/mermaid.min.css" rel="stylesheet" />

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #0f0f0f;
      color: #e0e0e0;
      overflow-x: hidden;
    }

    /* Top Header Bar */
    .header-bar {
      background: linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 100%);
      border-bottom: 1px solid #333;
      padding: 12px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-title {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .header-title::before {
      content: '📊';
      font-size: 20px;
    }

    /* Token Configuration */
    .token-config {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .token-input {
      width: 300px;
      padding: 6px 10px;
      background: #2a2a2a;
      border: 1px solid #444;
      border-radius: 4px;
      color: #fff;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 12px;
    }

    .token-status {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      background: #333;
      color: #888;
    }

    .token-status.valid {
      background: #1b5e20;
      color: #4caf50;
    }

    .btn {
      padding: 6px 12px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 13px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn:hover {
      background: #764ba2;
    }

    /* Main Container */
    .main-container {
      display: flex;
      height: calc(100vh - 57px);
      position: relative;
    }

    /* Table Container */
    .table-container {
      flex: 1;
      padding: 20px;
      overflow: auto;
      transition: margin-right 0.3s ease;
    }

    .table-container.drawer-open {
      margin-right: 400px;
    }

    /* Controls Bar */
    .controls-bar {
      background: #1a1a1a;
      padding: 15px 20px;
      margin-bottom: 20px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .filter-controls {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .search-box {
      width: 250px;
      padding: 8px 12px;
      background: #2a2a2a;
      border: 1px solid #444;
      border-radius: 4px;
      color: #fff;
      font-size: 14px;
    }

    .filter-chip {
      padding: 6px 12px;
      background: #2a2a2a;
      border: 1px solid #444;
      border-radius: 20px;
      color: #aaa;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filter-chip:hover,
    .filter-chip.active {
      background: #667eea;
      border-color: #667eea;
      color: white;
    }

    /* Export Controls */
    .export-controls {
      display: flex;
      gap: 10px;
    }

    /* Grid.js Customization */
    .gridjs-wrapper {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    }

    .gridjs-table {
      background: #1a1a1a;
      color: #e0e0e0;
    }

    .gridjs-thead {
      background: #2a2a2a;
    }

    .gridjs-th {
      color: #fff;
      font-weight: 600;
      font-size: 13px;
      padding: 12px !important;
      border-color: #444;
    }

    .gridjs-td {
      padding: 10px !important;
      font-size: 13px;
      border-color: #333;
    }

    .gridjs-tr:hover {
      background: #252525;
    }

    .gridjs-tr:nth-child(even) {
      background: #1e1e1e;
    }

    /* Custom Cell Styles */
    .status-badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.received {
      background: #ffa500;
      color: #000;
    }

    .status-badge.fixed {
      background: #00cc66;
      color: #000;
    }

    .status-badge.reviewed {
      background: #3b82f6;
      color: white;
    }

    .status-badge.out_of_scope {
      background: #666;
      color: white;
    }

    .category-chip {
      display: inline-block;
      padding: 2px 6px;
      background: #333;
      color: #aaa;
      border-radius: 4px;
      font-size: 11px;
    }

    .id-cell {
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 11px;
      color: #8bb3ff;
      cursor: pointer;
    }

    .id-cell:hover {
      text-decoration: underline;
    }

    .location-cell {
      color: #aaa;
      font-size: 12px;
    }

    .view-btn {
      padding: 4px 8px;
      background: #333;
      color: #8bb3ff;
      border: 1px solid #444;
      border-radius: 4px;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .view-btn:hover {
      background: #667eea;
      border-color: #667eea;
      color: white;
    }

    /* Map Drawer */
    .map-drawer {
      position: fixed;
      top: 57px;
      right: -400px;
      width: 400px;
      height: calc(100vh - 57px);
      background: #1a1a1a;
      border-left: 2px solid #333;
      box-shadow: -4px 0 12px rgba(0, 0, 0, 0.5);
      transition: right 0.3s ease;
      z-index: 90;
      display: flex;
      flex-direction: column;
    }

    .map-drawer.open {
      right: 0;
    }

    .drawer-header {
      background: #2a2a2a;
      padding: 15px;
      border-bottom: 1px solid #444;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .drawer-title {
      font-size: 14px;
      font-weight: 600;
      color: #fff;
    }

    .drawer-close {
      width: 28px;
      height: 28px;
      background: #333;
      border: 1px solid #444;
      border-radius: 4px;
      color: #aaa;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .drawer-close:hover {
      background: #ff4444;
      border-color: #ff4444;
      color: white;
    }

    #mapContainer {
      flex: 1;
      position: relative;
    }

    .drawer-details {
      padding: 15px;
      background: #1a1a1a;
      border-top: 1px solid #333;
      max-height: 200px;
      overflow-y: auto;
    }

    .detail-row {
      display: flex;
      padding: 6px 0;
      font-size: 12px;
    }

    .detail-label {
      width: 100px;
      color: #888;
      font-weight: 600;
    }

    .detail-value {
      flex: 1;
      color: #e0e0e0;
      font-family: 'Monaco', 'Menlo', monospace;
      word-break: break-all;
    }

    /* Pagination */
    .pagination-container {
      padding: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      background: #1a1a1a;
      border-radius: 8px;
      margin-top: 20px;
    }

    .pagination-info {
      color: #aaa;
      font-size: 14px;
    }

    .pagination-buttons {
      display: flex;
      gap: 10px;
    }

    /* Loading State */
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: #888;
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid #333;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 12px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .map-drawer {
        width: 100%;
        right: -100%;
      }

      .table-container.drawer-open {
        margin-right: 0;
        display: none;
      }

      .token-input {
        width: 150px;
      }
    }

    /* Grid.js Dark Theme Override */
    .gridjs-pagination {
      background: #1a1a1a;
      border-color: #333;
      color: #aaa;
    }

    .gridjs-pagination button {
      background: #2a2a2a;
      color: #aaa;
      border-color: #444;
    }

    .gridjs-pagination button:hover {
      background: #667eea;
      color: white;
    }
  </style>
</head>

<body>
  <!-- Header Bar -->
  <div class="header-bar">
    <div class="header-title">Feedback API Data Table</div>

    <div class="token-config">
      <span class="token-status" id="tokenStatus">No Token</span>
      <input
        type="password"
        id="tokenInput"
        class="token-input"
        placeholder="Enter Feedback API token"
      />
      <button class="btn" onclick="setToken()">Set Token</button>
      <button class="btn" onclick="resetToken()" style="background: #555;">Reset</button>
    </div>
  </div>

  <!-- Main Container -->
  <div class="main-container">
    <!-- Table Container -->
    <div class="table-container" id="tableContainer">
      <!-- Controls Bar -->
      <div class="controls-bar">
        <div class="filter-controls">
          <input type="text" class="search-box" id="searchBox" placeholder="Search all fields..." />

          <span style="color: #888; font-size: 12px; margin: 0 10px;">Status:</span>
          <div class="filter-chip" data-filter="status" data-value="received">Received</div>
          <div class="filter-chip" data-filter="status" data-value="fixed">Fixed</div>
          <div class="filter-chip" data-filter="status" data-value="reviewed">Reviewed</div>
        </div>

        <div class="export-controls">
          <button class="btn" onclick="exportData('json')">Export JSON</button>
          <button class="btn" onclick="exportData('csv')">Export CSV</button>
        </div>
      </div>

      <!-- Grid.js Table Container -->
      <div id="dataTable"></div>

      <!-- Pagination -->
      <div class="pagination-container">
        <button class="btn" id="prevBtn" onclick="loadPrevious()" disabled>← Previous</button>
        <div class="pagination-info">
          <span id="pageInfo">Page 1</span>
          <span style="margin: 0 10px;">|</span>
          <span id="itemsInfo">0 items</span>
        </div>
        <button class="btn" id="nextBtn" onclick="loadNext()">Next →</button>
      </div>
    </div>

    <!-- Map Drawer -->
    <div class="map-drawer" id="mapDrawer">
      <div class="drawer-header">
        <div class="drawer-title">Location View</div>
        <button class="drawer-close" onclick="closeDrawer()">✕</button>
      </div>
      <div id="mapContainer"></div>
      <div class="drawer-details" id="drawerDetails"></div>
    </div>
  </div>

  <!-- Grid.js Library -->
  <script src="https://unpkg.com/gridjs/dist/gridjs.umd.js"></script>

  <script>
    // Map token for display
    mapboxgl.accessToken = 'YOUR_MAPBOX_PUBLIC_TOKEN_HERE';

    // Token management - declare this BEFORE including the JS file
    let feedbackApiToken = localStorage.getItem('mapbox_feedback_token') || null;

    // Include the main JS file
    {% include {{ page.js }} %}

    // Initialize token status and handlers AFTER the JS is loaded
    window.addEventListener('DOMContentLoaded', () => {
      updateTokenStatus();
      const savedToken = localStorage.getItem('mapbox_feedback_token');
      if (savedToken) {
        document.getElementById('tokenInput').value = savedToken;
        feedbackApiToken = savedToken;
      }
    });

    function setToken() {
      const input = document.getElementById('tokenInput');
      const token = input.value.trim();

      if (!token) {
        alert('Please enter a token');
        return;
      }

      localStorage.setItem('mapbox_feedback_token', token);
      feedbackApiToken = token;
      updateTokenStatus();

      // Reset pagination and reload data
      currentPageIndex = 0;
      cursorHistory = [null];
      loadFeedbackData();
    }

    function resetToken() {
      localStorage.removeItem('mapbox_feedback_token');
      feedbackApiToken = null;
      document.getElementById('tokenInput').value = '';
      updateTokenStatus();

      // Clear table
      if (gridInstance) {
        gridInstance.destroy();
        gridInstance = null;
      }
      document.getElementById('dataTable').innerHTML = '<div class="loading">No token configured</div>';
    }

    function updateTokenStatus() {
      const status = document.getElementById('tokenStatus');
      if (feedbackApiToken) {
        status.textContent = 'Token Set';
        status.className = 'token-status valid';
      } else {
        status.textContent = 'No Token';
        status.className = 'token-status';
      }
    }
  </script>
</body>

</html>