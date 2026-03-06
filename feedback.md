---
layout: none
title: Mapbox Feedback API Demo
js: feedback.js
---

<html lang="en">

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

    /* Left sidebar for feedback controls */
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

    /* Tab navigation */
    .tab-nav {
      display: flex;
      background: #333;
      border-bottom: 2px solid #444;
    }

    .tab-btn {
      flex: 1;
      padding: 15px;
      background: transparent;
      color: #aaa;
      border: none;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
      border-bottom: 3px solid transparent;
    }

    .tab-btn:hover {
      background: #3a3a3a;
      color: white;
    }

    .tab-btn.active {
      color: white;
      background: #3a3a3a;
      border-bottom-color: #667eea;
    }

    /* Tab content */
    .tab-content {
      display: none;
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }

    .tab-content.active {
      display: block;
    }

    /* Submit feedback form */
    .form-group {
      margin-bottom: 20px;
    }

    .form-label {
      display: block;
      color: #ccc;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 8px;
    }

    .form-input,
    .form-textarea,
    .form-select {
      width: 100%;
      padding: 12px;
      background: #3a3a3a;
      border: 1px solid #555;
      border-radius: 6px;
      color: white;
      font-size: 14px;
      font-family: inherit;
    }

    .form-textarea {
      min-height: 100px;
      resize: vertical;
    }

    .form-input:focus,
    .form-textarea:focus,
    .form-select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
    }

    .form-hint {
      display: block;
      color: #888;
      font-size: 12px;
      margin-top: 4px;
    }

    .submit-btn {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .submit-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    /* Feedback list */
    .feedback-item {
      background: #3a3a3a;
      border: 1px solid #555;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .feedback-item:hover {
      background: #4a4a4a;
      border-color: #667eea;
      transform: translateX(4px);
    }

    .feedback-item.selected {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-color: #8bb3ff;
    }

    .feedback-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 8px;
    }

    .feedback-status {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .feedback-status.received {
      background: #ffa500;
      color: #000;
    }

    .feedback-status.fixed {
      background: #00cc66;
      color: #000;
    }

    .feedback-status.reviewed {
      background: #3b82f6;
      color: white;
    }

    .feedback-status.out_of_scope {
      background: #888;
      color: white;
    }

    .feedback-category {
      color: #aaa;
      font-size: 12px;
      margin-bottom: 8px;
    }

    .feedback-text {
      color: white;
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 8px;
    }

    .feedback-location {
      color: #8bb3ff;
      font-size: 12px;
    }

    .feedback-date {
      color: #888;
      font-size: 11px;
      margin-top: 8px;
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

    /* Alert messages */
    .alert {
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 16px;
      font-size: 14px;
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .alert-success {
      background: #00cc66;
      color: #000;
    }

    .alert-error {
      background: #ff4444;
      color: white;
    }

    .alert-info {
      background: #3b82f6;
      color: white;
    }

    /* Instructions */
    .instructions {
      background: #3a3a3a;
      border: 1px solid #555;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
      color: #ccc;
      font-size: 14px;
      line-height: 1.6;
    }

    .instructions h3 {
      color: white;
      font-size: 16px;
      margin-bottom: 12px;
    }

    .instructions ul {
      margin-left: 20px;
    }

    .instructions li {
      margin-bottom: 8px;
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
      font-size: 16px;
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

    /* Mapbox popup customization */
    .mapboxgl-popup-content {
      padding: 16px;
      border-radius: 8px;
      background: #2a2a2a;
      color: white;
      min-width: 250px;
    }

    .mapboxgl-popup-close-button {
      font-size: 18px;
      padding: 8px;
      color: #ccc;
    }

    .popup-header {
      font-weight: 600;
      font-size: 16px;
      margin-bottom: 8px;
    }

    .popup-category {
      color: #8bb3ff;
      font-size: 12px;
      margin-bottom: 8px;
    }

    .popup-text {
      font-size: 14px;
      line-height: 1.5;
      margin-bottom: 8px;
    }

    .popup-meta {
      font-size: 11px;
      color: #888;
      border-top: 1px solid #444;
      padding-top: 8px;
      margin-top: 8px;
    }
  </style>
</head>

<body>
  <div class="container">
    <!-- Left sidebar -->
    <div class="sidebar">
      <div class="header">
        <h1>Feedback API Demo</h1>
        <p>Submit and view map feedback</p>
      </div>

      <!-- Token Configuration Section -->
      <div style="background: #3a3a3a; padding: 15px; margin: 10px; border-radius: 8px; border: 1px solid #555;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
          <label style="color: #aaa; font-size: 14px; font-weight: 500;">Feedback API Token:</label>
          <span id="tokenStatus" style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; background: #555; color: #fff;">No Token</span>
        </div>
        <input
          type="password"
          id="tokenInput"
          placeholder="Enter Feedback API token (with user-feedback:read and user-feedback:write scopes)"
          style="width: 100%; padding: 8px; background: #2a2a2a; border: 1px solid #444; border-radius: 4px; color: white; font-size: 13px; font-family: monospace; margin-bottom: 10px;"
        />
        <div style="display: flex; gap: 10px;">
          <button
            id="setTokenBtn"
            onclick="setCustomToken()"
            style="flex: 1; padding: 8px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 500; transition: background 0.3s;"
            onmouseover="this.style.background='#764ba2'"
            onmouseout="this.style.background='#667eea'"
          >
            Set Token
          </button>
          <button
            onclick="resetToken()"
            style="padding: 8px 12px; background: #555; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; transition: background 0.3s;"
            onmouseover="this.style.background='#666'"
            onmouseout="this.style.background='#555'"
          >
            Reset
          </button>
        </div>
        <div style="margin-top: 10px; font-size: 11px; color: #888; line-height: 1.4;">
          <a href="https://account.mapbox.com/access-tokens" target="_blank" style="color: #8bb3ff; text-decoration: none;">Create a token</a> with
          <code style="background: #444; padding: 2px 4px; border-radius: 2px;">user-feedback:read</code> and
          <code style="background: #444; padding: 2px 4px; border-radius: 2px;">user-feedback:write</code> scopes
        </div>
      </div>

      <!-- View feedback -->
      <div class="tab-content active" id="viewTab">
        <div class="instructions">
          <h3>Feedback items</h3>
          <p>Click on any feedback item to view it on the map</p>
        </div>

        <!-- Pagination controls -->
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background: #3a3a3a; border-radius: 6px; margin-bottom: 15px;">
          <button
            id="prevPageBtn"
            onclick="loadPreviousPage()"
            style="padding: 8px 16px; background: #555; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.3s;"
            onmouseover="if(!this.disabled) this.style.background='#667eea'"
            onmouseout="if(!this.disabled) this.style.background='#555'"
            disabled
          >
            ← Previous
          </button>
          <span id="pageInfo" style="color: #ccc; font-size: 14px; font-weight: 500;">Page 1</span>
          <button
            id="nextPageBtn"
            onclick="loadNextPage()"
            style="padding: 8px 16px; background: #555; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.3s;"
            onmouseover="if(!this.disabled) this.style.background='#667eea'"
            onmouseout="if(!this.disabled) this.style.background='#555'"
          >
            Next →
          </button>
        </div>

        <div id="feedbackList">
          <div class="loading-container">
            <div class="loading-spinner"></div>
            <div class="loading-text">Loading feedback...</div>
          </div>
        </div>
      </div>

      <div class="status-bar">
        <span id="statusText">Ready</span>
        <span id="statusCount"></span>
      </div>
    </div>

    <!-- Map container -->
    <div id="map"></div>
  </div>

  <script>
    // Default public token for map display ONLY (not for Feedback API)
    const DEFAULT_MAP_TOKEN = 'YOUR_MAPBOX_PUBLIC_TOKEN_HERE';

    // Set the map token (always use the default for map display)
    mapboxgl.accessToken = DEFAULT_MAP_TOKEN;

    // Feedback API token is handled separately
    let feedbackApiToken = localStorage.getItem('mapbox_feedback_token') || null;

    // Update UI to show token status
    window.addEventListener('DOMContentLoaded', () => {
      updateTokenStatus();
      const savedFeedbackToken = localStorage.getItem('mapbox_feedback_token');
      if (savedFeedbackToken) {
        document.getElementById('tokenInput').value = savedFeedbackToken;
        feedbackApiToken = savedFeedbackToken;
      }
    });

    // Function to set custom feedback token (separate from map token)
    function setCustomToken() {
      const tokenInput = document.getElementById('tokenInput');
      const token = tokenInput.value.trim();

      if (!token) {
        showStatus('Please enter a feedback API token', 'error');
        return;
      }

      if (!token.startsWith('pk.') && !token.startsWith('sk.')) {
        showStatus('Invalid token format', 'error');
        return;
      }

      // Save feedback token (separate from map token)
      localStorage.setItem('mapbox_feedback_token', token);
      feedbackApiToken = token;

      // Update UI
      updateTokenStatus();
      showStatus('Feedback token updated! Validating...', 'success');

      // Validate the new token
      if (typeof validateTokenScopes === 'function') {
        validateTokenScopes().then(scopes => {
          if (scopes.read) {
            showStatus('Token validated! Loading feedback...', 'success');
            loadFeedbackItems();
          } else {
            showStatus('Warning: Token may not have required scopes', 'error');
          }
        });
      } else {
        // Reload feedback items with new token
        if (typeof loadFeedbackItems === 'function') {
          loadFeedbackItems();
        }
      }
    }

    // Function to reset feedback token
    function resetToken() {
      localStorage.removeItem('mapbox_feedback_token');
      feedbackApiToken = null;
      document.getElementById('tokenInput').value = '';

      updateTokenStatus();
      showStatus('Cleared feedback token', 'info');

      // Reload feedback items (will use mock data)
      if (typeof loadFeedbackItems === 'function') {
        loadFeedbackItems();
      }
    }

    // Update token status indicator
    function updateTokenStatus() {
      const statusEl = document.getElementById('tokenStatus');
      const savedToken = localStorage.getItem('mapbox_feedback_token');

      if (savedToken) {
        statusEl.textContent = 'Configured';
        statusEl.style.background = '#667eea';
      } else {
        statusEl.textContent = 'No Token';
        statusEl.style.background = '#555';
      }
    }

    // Show status messages
    function showStatus(message, type = 'info') {
      const statusEl = document.getElementById('statusText');
      if (statusEl) {
        statusEl.textContent = message;
        // Set color based on type
        if (type === 'error') {
          statusEl.style.color = '#ff5252';
        } else if (type === 'success') {
          statusEl.style.color = '#4caf50';
        } else {
          statusEl.style.color = '#aaa';
        }
      }
    }

    {% include {{ page.js }} %}
  </script>
</body>

</html>
