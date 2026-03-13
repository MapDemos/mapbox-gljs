---
layout: none
title: Mapbox Feedback API - Data Table View
js: feedback-table.js
---

<html lang="en">

<head>
  {% include common_head.html %}
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Grid.js CSS - Removed mermaid theme to use custom dark theme -->

  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #252528;
      color: #e4e4e4;
      overflow-x: hidden;
    }

    /* Top Header Bar */
    .header-bar {
      background: linear-gradient(90deg, #1a1a1a 0%, #2a2a2a 100%);
      border-bottom: 1px solid #3a3a3a;
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
      background: #323235;
      padding: 15px 20px;
      margin-bottom: 20px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border: 1px solid #3a3a3a;
    }

    .filter-controls {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .search-box {
      width: 250px;
      padding: 8px 12px;
      background: #2d2d30;
      border: 1px solid #3a3a3a;
      border-radius: 4px;
      color: #e4e4e4;
      font-size: 14px;
    }

    .filter-chip {
      padding: 6px 12px;
      background: #2d2d30;
      border: 1px solid #3a3a3a;
      border-radius: 20px;
      color: #b4b4b4;
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

    /* Grid.js Base Styles (since we removed the theme) */
    .gridjs-wrapper {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    .gridjs-table {
      width: 100%;
      border-collapse: collapse;
      background: #1a1a1a;
      color: #e4e4e4;
    }

    .gridjs-tbody {
      background: #1a1a1a;
    }

    .gridjs-thead {
      background: #222224;
      border-bottom: 2px solid #3a3a3a;
    }

    .gridjs-th {
      color: #f0f0f0;
      font-weight: 600;
      font-size: 13px;
      padding: 12px;
      text-align: left;
      border: 1px solid #3a3a3a;
      position: relative;
      user-select: none;
    }

    .gridjs-th-sort {
      cursor: pointer;
    }

    .gridjs-th-sort::after {
      content: '';
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      border: 4px solid transparent;
      border-top-color: #666;
    }

    .gridjs-td {
      padding: 10px;
      font-size: 13px;
      border: 1px solid #3a3a3a;
      background: inherit;
    }

    .gridjs-tr {
      background: #1a1a1a;
    }

    .gridjs-tr:hover {
      background: #252528;
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
      background: #ff9800;
      color: #000;
    }

    .status-badge.fixed {
      background: #4caf50;
      color: #fff;
    }

    .status-badge.reviewed {
      background: #2196f3;
      color: white;
    }

    .status-badge.out_of_scope {
      background: #757575;
      color: white;
    }

    .category-chip {
      display: inline-block;
      padding: 2px 6px;
      background: #3a3a3a;
      color: #b4b4b4;
      border-radius: 4px;
      font-size: 11px;
    }

    .id-cell {
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 11px;
      color: #64b5f6;
      cursor: pointer;
    }

    .id-cell:hover {
      text-decoration: underline;
      color: #90caf9;
    }

    .location-cell {
      color: #b4b4b4;
      font-size: 12px;
    }

    .view-btn {
      padding: 4px 8px;
      background: #3a3a3a;
      color: #64b5f6;
      border: 1px solid #464648;
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
      background: #2a2a2a;
      border-left: 2px solid #3a3a3a;
      box-shadow: -4px 0 12px rgba(0, 0, 0, 0.3);
      transition: right 0.3s ease;
      z-index: 90;
      display: flex;
      flex-direction: column;
    }

    .map-drawer.open {
      right: 0;
    }

    .drawer-header {
      background: #323235;
      padding: 15px;
      border-bottom: 1px solid #3a3a3a;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .drawer-title {
      font-size: 14px;
      font-weight: 600;
      color: #f0f0f0;
    }

    .drawer-close {
      width: 28px;
      height: 28px;
      background: #3a3a3a;
      border: 1px solid #464648;
      border-radius: 4px;
      color: #b4b4b4;
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
      background: #2d2d30;
      border-top: 1px solid #3a3a3a;
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
      color: #999;
      font-weight: 600;
    }

    .detail-value {
      flex: 1;
      color: #e4e4e4;
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
      background: #323235;
      border-radius: 8px;
      margin-top: 20px;
      border: 1px solid #3a3a3a;
    }

    .pagination-info {
      color: #b4b4b4;
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

    /* Column Settings Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 1000;
      display: none;
      align-items: center;
      justify-content: center;
    }

    .modal-overlay.active {
      display: flex;
    }

    .modal-content {
      background: #2a2a2a;
      border-radius: 8px;
      padding: 24px;
      max-width: 500px;
      width: 90%;
      max-height: 70vh;
      overflow-y: auto;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      border: 1px solid #3a3a3a;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid #3a3a3a;
    }

    .modal-title {
      font-size: 18px;
      font-weight: 600;
      color: #f0f0f0;
    }

    .modal-close {
      background: none;
      border: none;
      color: #999;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
    }

    .modal-close:hover {
      color: #ff4444;
    }

    .column-list {
      list-style: none;
      padding: 0;
      margin: 0 0 20px 0;
    }

    .column-item {
      background: #323235;
      border: 1px solid #3a3a3a;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: move;
      transition: all 0.2s;
    }

    .column-item:hover {
      background: #3a3a3d;
      border-color: #464648;
    }

    .column-item.dragging {
      opacity: 0.5;
      background: #667eea;
    }

    .column-checkbox {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: #667eea;
    }

    .column-name {
      flex: 1;
      color: #e4e4e4;
      font-size: 14px;
      user-select: none;
    }

    .column-drag-handle {
      color: #666;
      font-size: 20px;
      cursor: move;
    }

    .modal-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 16px;
      border-top: 1px solid #3a3a3a;
      gap: 10px;
    }

    .preset-buttons {
      display: flex;
      gap: 8px;
    }

    .preset-btn {
      padding: 6px 12px;
      background: #3a3a3a;
      color: #999;
      border: 1px solid #464648;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .preset-btn:hover {
      background: #464648;
      color: #e4e4e4;
    }

    /* Comparison Mode Styles */
    .gridjs-tr.selectable {
      cursor: pointer;
    }

    .gridjs-tr.selected {
      background: #3a3a6a !important;
      border-left: 3px solid #667eea;
    }

    .compare-checkbox {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: #667eea;
      margin-right: 8px;
    }

    /* Comparison View Modal */
    .comparison-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      z-index: 1100;
      display: none;
      align-items: center;
      justify-content: center;
    }

    .comparison-modal.active {
      display: flex;
    }

    .comparison-content {
      background: #2a2a2a;
      border-radius: 8px;
      width: 90%;
      max-width: 1200px;
      height: 80vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.6);
      border: 1px solid #3a3a3a;
    }

    .comparison-header {
      padding: 20px;
      border-bottom: 1px solid #3a3a3a;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .comparison-title {
      font-size: 18px;
      font-weight: 600;
      color: #f0f0f0;
    }

    .comparison-body {
      flex: 1;
      overflow: auto;
      padding: 20px;
      display: flex;
      gap: 20px;
    }

    .comparison-item {
      flex: 1;
      background: #323235;
      border: 1px solid #3a3a3a;
      border-radius: 6px;
      overflow: auto;
    }

    .comparison-item-header {
      background: #2d2d30;
      padding: 12px;
      border-bottom: 1px solid #3a3a3a;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .comparison-item-title {
      font-size: 14px;
      font-weight: 600;
      color: #64b5f6;
      margin-bottom: 4px;
    }

    .comparison-item-subtitle {
      font-size: 12px;
      color: #999;
    }

    .comparison-item-body {
      padding: 15px;
    }

    .comparison-field {
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #3a3a3a;
    }

    .comparison-field:last-child {
      border-bottom: none;
    }

    .comparison-field-label {
      font-size: 11px;
      color: #999;
      text-transform: uppercase;
      margin-bottom: 4px;
      font-weight: 600;
    }

    .comparison-field-value {
      font-size: 13px;
      color: #e4e4e4;
      word-break: break-all;
    }

    .comparison-field-value.different {
      background: rgba(102, 126, 234, 0.2);
      padding: 2px 4px;
      border-radius: 3px;
    }

    .comparison-field-value.empty {
      color: #666;
      font-style: italic;
    }

    .comparison-footer {
      padding: 15px 20px;
      border-top: 1px solid #3a3a3a;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .comparison-legend {
      display: flex;
      gap: 20px;
      font-size: 12px;
      color: #999;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .legend-color {
      width: 12px;
      height: 12px;
      border-radius: 2px;
      background: rgba(102, 126, 234, 0.4);
    }
  </style>
</head>

<body>
  <!-- Header Bar -->
  <div class="header-bar">
    <div style="display: flex; align-items: center; gap: 20px;">
      <div class="header-title">Feedback API Data Table</div>
      <a href="feedback-submit.html" style="color: #64b5f6; text-decoration: none; font-size: 14px; padding: 6px 12px; background: #3a3a3a; border-radius: 4px; transition: all 0.2s;" onmouseover="this.style.background='#464648'" onmouseout="this.style.background='#3a3a3a'">
        📝 Submit Feedback
      </a>
    </div>

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
      <button class="btn" onclick="showKeyboardHelp()" style="background: #333; padding: 6px 8px;" title="Keyboard shortcuts">⌨️</button>
    </div>
  </div>

  <!-- Main Container -->
  <div class="main-container">
    <!-- Table Container -->
    <div class="table-container" id="tableContainer">
      <!-- Enhanced Filter Controls -->
      <div class="controls-bar" style="flex-direction: column; gap: 15px; padding: 20px;">

        <!-- Row 1: Basic Filters -->
        <div style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">

          <!-- Search -->
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <label style="color: #999; font-size: 11px;">Search Text</label>
            <input type="text" id="searchBox" placeholder="Search feedback text..."
              style="background: #2d2d30; color: #e4e4e4; border: 1px solid #3a3a3a;
                     border-radius: 4px; padding: 6px 10px; font-size: 13px; width: 200px;" />
          </div>

          <!-- Status -->
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <label style="color: #999; font-size: 11px;">Status</label>
            <select id="statusFilter" multiple style="
              background: #2d2d30; color: #e4e4e4; border: 1px solid #3a3a3a;
              border-radius: 4px; padding: 6px; font-size: 13px; min-width: 150px; height: 80px;">
              <option value="received">Received</option>
              <option value="fixed">Fixed</option>
              <option value="reviewed">Reviewed</option>
              <option value="out_of_scope">Out of Scope</option>
            </select>
          </div>

          <!-- Category -->
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <label style="color: #999; font-size: 11px;">Category</label>
            <select id="categoryFilter" multiple style="
              background: #2d2d30; color: #e4e4e4; border: 1px solid #3a3a3a;
              border-radius: 4px; padding: 6px; font-size: 13px; min-width: 160px; height: 80px;">
              <option value="cannot_find">Cannot Find</option>
              <option value="traffic_issue">Traffic Issue</option>
              <option value="road_closure_issue">Road Closure</option>
              <option value="incorrect_location">Incorrect Location</option>
              <option value="poi_closed">POI Closed</option>
              <option value="non_feedback">Non Feedback</option>
              <option value="poor_routing_issue">Poor Routing</option>
              <option value="false_positive_traffic_issue">False Positive Traffic</option>
              <option value="false_negative_traffic_issue">False Negative Traffic</option>
            </select>
          </div>

          <!-- Feedback ID -->
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <label style="color: #999; font-size: 11px;">Feedback ID</label>
            <input type="text" id="feedbackIdFilter" placeholder="UUID (comma-separated)"
              style="background: #2d2d30; color: #e4e4e4; border: 1px solid #3a3a3a;
                     border-radius: 4px; padding: 6px 10px; font-size: 13px; width: 180px;
                     font-family: 'Monaco', monospace; font-size: 11px;" />
          </div>

          <!-- Trace ID -->
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <label style="color: #999; font-size: 11px;">Trace ID</label>
            <input type="text" id="traceIdFilter" placeholder="UUID (comma-separated)"
              style="background: #2d2d30; color: #e4e4e4; border: 1px solid #3a3a3a;
                     border-radius: 4px; padding: 6px 10px; font-size: 13px; width: 180px;
                     font-family: 'Monaco', monospace; font-size: 11px;" />
          </div>
        </div>

        <!-- Row 2: Date Filters -->
        <div style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">

          <!-- Created Date Range -->
          <div style="display: flex; gap: 8px; align-items: flex-end;">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="color: #999; font-size: 11px;">Created After</label>
              <input type="datetime-local" id="createdAfter"
                style="background: #2d2d30; color: #e4e4e4; border: 1px solid #3a3a3a;
                       border-radius: 4px; padding: 4px 8px; font-size: 12px;" />
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="color: #999; font-size: 11px;">Created Before</label>
              <input type="datetime-local" id="createdBefore"
                style="background: #2d2d30; color: #e4e4e4; border: 1px solid #3a3a3a;
                       border-radius: 4px; padding: 4px 8px; font-size: 12px;" />
            </div>
          </div>

          <!-- Received Date Range -->
          <div style="display: flex; gap: 8px; align-items: flex-end;">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="color: #999; font-size: 11px;">Received After</label>
              <input type="datetime-local" id="receivedAfter"
                style="background: #2d2d30; color: #e4e4e4; border: 1px solid #3a3a3a;
                       border-radius: 4px; padding: 4px 8px; font-size: 12px;" />
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="color: #999; font-size: 11px;">Received Before</label>
              <input type="datetime-local" id="receivedBefore"
                style="background: #2d2d30; color: #e4e4e4; border: 1px solid #3a3a3a;
                       border-radius: 4px; padding: 4px 8px; font-size: 12px;" />
            </div>
          </div>

          <!-- Updated Date Range -->
          <div style="display: flex; gap: 8px; align-items: flex-end;">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="color: #999; font-size: 11px;">Updated After</label>
              <input type="datetime-local" id="updatedAfter"
                style="background: #2d2d30; color: #e4e4e4; border: 1px solid #3a3a3a;
                       border-radius: 4px; padding: 4px 8px; font-size: 12px;" />
            </div>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="color: #999; font-size: 11px;">Updated Before</label>
              <input type="datetime-local" id="updatedBefore"
                style="background: #2d2d30; color: #e4e4e4; border: 1px solid #3a3a3a;
                       border-radius: 4px; padding: 4px 8px; font-size: 12px;" />
            </div>
          </div>
        </div>

        <!-- Row 3: Actions -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; gap: 10px;">
            <button class="btn" onclick="applyFilters()" style="background: #667eea;">Apply Filters</button>
            <button class="btn" onclick="clearFilters()" style="background: #555;">Clear All</button>
            <span id="filterStatus" style="color: #64b5f6; font-size: 12px; margin-left: 15px;"></span>
          </div>

          <div style="display: flex; gap: 10px; align-items: center;">
            <span id="resultCount" style="color: #999; font-size: 13px;"></span>
            <button class="btn" id="compareBtn" onclick="toggleCompareMode()" style="background: #444; display: none;" title="Compare selected items">🔍 Compare (<span id="compareCount">0</span>)</button>
            <button class="btn" onclick="showColumnSettings()" style="background: #444;" title="Customize columns">⚙️ Columns</button>
            <button class="btn" onclick="exportData('json')">Export JSON</button>
            <button class="btn" onclick="exportData('csv')">Export CSV</button>
          </div>
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

  <!-- Keyboard Help Modal -->
  <div class="modal-overlay" id="keyboardHelpModal">
    <div class="modal-content" style="max-width: 400px;">
      <div class="modal-header">
        <h3 class="modal-title">⌨️ Keyboard Shortcuts</h3>
        <button class="modal-close" onclick="hideKeyboardHelp()">×</button>
      </div>

      <div class="modal-body">
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; justify-content: space-between; padding: 8px; background: #323235; border-radius: 4px;">
            <span style="color: #999;">Search</span>
            <kbd style="background: #3a3a3a; padding: 2px 6px; border-radius: 3px; color: #e4e4e4; font-family: monospace;">/</kbd>
          </div>

          <div style="display: flex; justify-content: space-between; padding: 8px; background: #323235; border-radius: 4px;">
            <span style="color: #999;">Compare Mode</span>
            <kbd style="background: #3a3a3a; padding: 2px 6px; border-radius: 3px; color: #e4e4e4; font-family: monospace;">Ctrl+C</kbd>
          </div>

          <div style="display: flex; justify-content: space-between; padding: 8px; background: #323235; border-radius: 4px;">
            <span style="color: #999;">Close Modal/Drawer</span>
            <kbd style="background: #3a3a3a; padding: 2px 6px; border-radius: 3px; color: #e4e4e4; font-family: monospace;">Esc</kbd>
          </div>

          <div style="display: flex; justify-content: space-between; padding: 8px; background: #323235; border-radius: 4px;">
            <span style="color: #999;">Apply Filters</span>
            <kbd style="background: #3a3a3a; padding: 2px 6px; border-radius: 3px; color: #e4e4e4; font-family: monospace;">Enter</kbd>
          </div>

          <div style="margin-top: 12px; padding: 12px; background: #2d2d30; border-radius: 4px;">
            <p style="color: #64b5f6; font-size: 13px; margin: 0 0 8px 0; font-weight: 600;">💡 Tips</p>
            <ul style="margin: 0; padding-left: 20px; color: #999; font-size: 12px;">
              <li>Click on IDs to copy them to clipboard</li>
              <li>Use Ctrl+C to enter comparison mode</li>
              <li>Select up to 4 items for side-by-side comparison</li>
              <li>Drag columns in settings to reorder</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="modal-footer" style="justify-content: center;">
        <button class="btn" onclick="hideKeyboardHelp()">Got it!</button>
      </div>
    </div>
  </div>

  <!-- Comparison View Modal -->
  <div class="comparison-modal" id="comparisonModal">
    <div class="comparison-content">
      <div class="comparison-header">
        <h3 class="comparison-title">Compare Feedback Items</h3>
        <button class="modal-close" onclick="closeComparisonView()">×</button>
      </div>

      <div class="comparison-body" id="comparisonBody">
        <!-- Comparison items will be generated dynamically -->
      </div>

      <div class="comparison-footer">
        <div class="comparison-legend">
          <div class="legend-item">
            <div class="legend-color"></div>
            <span>Different values</span>
          </div>
        </div>

        <div style="display: flex; gap: 10px;">
          <button class="btn" onclick="exportComparison()">Export Comparison</button>
          <button class="btn" onclick="closeComparisonView()" style="background: #555;">Close</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Column Settings Modal -->
  <div class="modal-overlay" id="columnSettingsModal">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">Customize Columns</h3>
        <button class="modal-close" onclick="hideColumnSettings()">×</button>
      </div>

      <div class="modal-body">
        <p style="color: #999; font-size: 13px; margin-bottom: 16px;">
          Check to show/hide columns. Drag to reorder.
        </p>

        <ul class="column-list" id="columnList">
          <!-- Column items will be generated dynamically -->
        </ul>
      </div>

      <div class="modal-footer">
        <div class="preset-buttons">
          <button class="preset-btn" onclick="applyColumnPreset('minimal')">Minimal</button>
          <button class="preset-btn" onclick="applyColumnPreset('detailed')">Detailed</button>
          <button class="preset-btn" onclick="resetColumnSettings()">Reset Default</button>
        </div>

        <div style="display: flex; gap: 10px;">
          <button class="btn" onclick="hideColumnSettings()" style="background: #555;">Cancel</button>
          <button class="btn" onclick="applyColumnSettings()">Apply</button>
        </div>
      </div>
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