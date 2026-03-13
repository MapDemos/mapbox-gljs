---
layout: none
title: Submit Feedback - Mapbox Feedback API
js: feedback-submit.js
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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
      min-height: 100vh;
      color: #e4e4e4;
      display: flex;
      flex-direction: column;
    }

    /* Header */
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
      content: '📝';
      font-size: 20px;
    }

    .nav-links {
      display: flex;
      gap: 15px;
      align-items: center;
    }

    .nav-link {
      color: #64b5f6;
      text-decoration: none;
      font-size: 14px;
      padding: 6px 12px;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .nav-link:hover {
      background: #3a3a3a;
      color: #90caf9;
    }

    /* Main Container */
    .main-container {
      flex: 1;
      display: flex;
      padding: 40px 20px;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
      gap: 30px;
    }

    /* Form Section */
    .form-section {
      flex: 1;
      max-width: 500px;
    }

    .form-card {
      background: #2a2a2a;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      border: 1px solid #3a3a3a;
    }

    .form-title {
      font-size: 24px;
      font-weight: 600;
      color: #f0f0f0;
      margin-bottom: 8px;
    }

    .form-subtitle {
      color: #999;
      font-size: 14px;
      margin-bottom: 24px;
    }

    /* Form Groups */
    .form-group {
      margin-bottom: 20px;
    }

    .form-label {
      display: block;
      color: #b4b4b4;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .required {
      color: #ff6b6b;
    }

    .form-control {
      width: 100%;
      padding: 10px 14px;
      background: #1a1a1a;
      border: 1px solid #3a3a3a;
      border-radius: 6px;
      color: #e4e4e4;
      font-size: 14px;
      transition: all 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      background: #1e1e1e;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .form-control.error {
      border-color: #ff4444;
    }

    select.form-control {
      cursor: pointer;
    }

    textarea.form-control {
      resize: vertical;
      min-height: 100px;
      font-family: inherit;
    }

    .help-text {
      font-size: 12px;
      color: #666;
      margin-top: 4px;
    }

    .error-text {
      font-size: 12px;
      color: #ff4444;
      margin-top: 4px;
      display: none;
    }

    .error-text.show {
      display: block;
    }

    /* Location Picker */
    .location-group {
      background: #323235;
      border: 1px solid #3a3a3a;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 20px;
    }

    .location-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .location-title {
      color: #b4b4b4;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .location-method {
      display: flex;
      gap: 10px;
    }

    .method-btn {
      padding: 4px 10px;
      background: #2a2a2a;
      border: 1px solid #3a3a3a;
      border-radius: 4px;
      color: #999;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .method-btn.active {
      background: #667eea;
      border-color: #667eea;
      color: white;
    }

    .location-display {
      background: #1a1a1a;
      border: 1px solid #3a3a3a;
      border-radius: 4px;
      padding: 10px;
      margin-bottom: 10px;
      min-height: 40px;
      display: flex;
      align-items: center;
      color: #64b5f6;
      font-size: 13px;
      font-family: 'Monaco', 'Menlo', monospace;
    }

    .location-display.empty {
      color: #666;
      font-style: italic;
      font-family: inherit;
    }

    /* Map Section */
    .map-section {
      flex: 1;
      position: sticky;
      top: 80px;
      height: calc(100vh - 120px);
    }

    .map-card {
      background: #2a2a2a;
      border-radius: 12px;
      height: 100%;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      border: 1px solid #3a3a3a;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .map-header {
      padding: 15px 20px;
      border-bottom: 1px solid #3a3a3a;
      background: #323235;
    }

    .map-title {
      font-size: 14px;
      font-weight: 600;
      color: #f0f0f0;
      margin-bottom: 4px;
    }

    .map-instruction {
      font-size: 12px;
      color: #999;
    }

    #map {
      flex: 1;
      width: 100%;
    }

    /* Buttons */
    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #3a3a3a;
      color: #b4b4b4;
      margin-right: 10px;
    }

    .btn-secondary:hover {
      background: #464648;
      color: #e4e4e4;
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #3a3a3a;
    }

    /* Success/Error Messages */
    .alert {
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 20px;
      display: none;
      animation: slideDown 0.3s ease;
    }

    .alert.show {
      display: block;
    }

    .alert-success {
      background: #1b5e20;
      color: #4caf50;
      border: 1px solid #2e7d32;
    }

    .alert-error {
      background: #b71c1c;
      color: #ff5252;
      border: 1px solid #c62828;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Loading Spinner */
    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid #fff;
      border-radius: 50%;
      border-top-color: transparent;
      animation: spin 0.8s linear infinite;
      margin-right: 8px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Token Configuration */
    .token-section {
      background: #323235;
      border: 1px solid #3a3a3a;
      border-radius: 6px;
      padding: 15px;
      margin-bottom: 20px;
    }

    .token-input {
      width: 100%;
      padding: 8px 12px;
      background: #1a1a1a;
      border: 1px solid #3a3a3a;
      border-radius: 4px;
      color: #e4e4e4;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 12px;
      margin-bottom: 10px;
    }

    .token-status {
      display: inline-block;
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

    /* Properties Section */
    .properties-section {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #3a3a3a;
    }

    .property-item {
      display: flex;
      gap: 10px;
      margin-bottom: 10px;
    }

    .property-name,
    .property-value {
      flex: 1;
      padding: 8px 12px;
      background: #1a1a1a;
      border: 1px solid #3a3a3a;
      border-radius: 4px;
      color: #e4e4e4;
      font-size: 13px;
    }

    .btn-add-property {
      padding: 8px 12px;
      background: #3a3a3a;
      color: #64b5f6;
      border: 1px solid #464648;
      border-radius: 4px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-add-property:hover {
      background: #464648;
      border-color: #64b5f6;
    }

    .btn-remove-property {
      padding: 8px;
      background: #3a3a3a;
      color: #ff4444;
      border: 1px solid #464648;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-remove-property:hover {
      background: #ff4444;
      color: white;
    }

    /* Responsive */
    @media (max-width: 968px) {
      .main-container {
        flex-direction: column;
      }

      .map-section {
        position: relative;
        top: 0;
        height: 400px;
      }

      .form-section {
        max-width: 100%;
      }
    }
  </style>
</head>

<body>
  <!-- Header -->
  <div class="header-bar">
    <div class="header-title">Submit Feedback</div>
    <div class="nav-links">
      <a href="feedback-table.html" class="nav-link">📊 View Table</a>
      <a href="#" class="nav-link" onclick="showHelp()">❓ Help</a>
    </div>
  </div>

  <!-- Main Container -->
  <div class="main-container">
    <!-- Form Section -->
    <div class="form-section">
      <div class="form-card">
        <h2 class="form-title">New Feedback Report</h2>
        <p class="form-subtitle">Submit feedback about map data issues or improvements</p>

        <!-- Alert Messages -->
        <div class="alert alert-success" id="successAlert">
          ✓ Feedback submitted successfully! ID: <span id="feedbackId"></span>
        </div>
        <div class="alert alert-error" id="errorAlert">
          ✗ <span id="errorMessage"></span>
        </div>

        <!-- Token Configuration -->
        <div class="token-section">
          <label class="form-label">API Token <span class="required">*</span></label>
          <input type="password" id="apiToken" class="token-input" placeholder="Enter your Mapbox Feedback API token">
          <div>
            <span class="token-status" id="tokenStatus">No Token</span>
            <button type="button" class="method-btn" onclick="validateToken()" style="margin-left: 10px;">Validate</button>
          </div>
        </div>

        <!-- Feedback Form -->
        <form id="feedbackForm">
          <!-- Category -->
          <div class="form-group">
            <label class="form-label" for="category">
              Category <span style="color: #666; font-size: 11px;">(testing if optional)</span>
            </label>
            <select id="category" class="form-control">
              <option value="">Select a category...</option>
              <option value="cannot_find">Cannot Find</option>
              <option value="traffic_issue">Traffic Issue</option>
              <option value="road_closure_issue">Road Closure Issue</option>
              <option value="incorrect_location">Incorrect Location</option>
              <option value="poi_closed">POI Closed</option>
              <option value="poor_routing_issue">Poor Routing Issue</option>
              <option value="false_positive_traffic_issue">False Positive Traffic</option>
              <option value="false_negative_traffic_issue">False Negative Traffic</option>
              <option value="other">Other</option>
            </select>
            <span class="error-text" id="categoryError">Please select a category</span>
          </div>

          <!-- Feedback Text -->
          <div class="form-group">
            <label class="form-label" for="feedbackText">
              Feedback Description
            </label>
            <textarea id="feedbackText" class="form-control"
                      placeholder="Describe the issue or improvement..."
                      rows="4"></textarea>
            <p class="help-text">Provide details about the issue you're reporting</p>
          </div>

          <!-- Location Picker -->
          <div class="location-group">
            <div class="location-header">
              <label class="location-title">Location <span class="required">*</span></label>
              <div class="location-method">
                <button type="button" class="method-btn active" id="mapMethodBtn" onclick="setLocationMethod('map')">
                  📍 Map
                </button>
                <button type="button" class="method-btn" id="coordsMethodBtn" onclick="setLocationMethod('coords')">
                  📐 Coordinates
                </button>
                <button type="button" class="method-btn" id="currentMethodBtn" onclick="getCurrentLocation()">
                  📡 Current
                </button>
              </div>
            </div>

            <div class="location-display empty" id="locationDisplay">
              No location selected - Click on the map or enter coordinates
            </div>

            <!-- Coordinate Input (hidden by default) -->
            <div id="coordsInput" style="display: none;">
              <div style="display: flex; gap: 10px;">
                <input type="number"
                       id="latInput"
                       class="form-control"
                       placeholder="Latitude"
                       step="0.000001"
                       min="-90"
                       max="90">
                <input type="number"
                       id="lngInput"
                       class="form-control"
                       placeholder="Longitude"
                       step="0.000001"
                       min="-180"
                       max="180">
              </div>
              <button type="button" class="btn btn-secondary" onclick="applyCoordinates()" style="margin-top: 10px;">
                Apply Coordinates
              </button>
            </div>

            <span class="error-text" id="locationError">Please select a location</span>
          </div>

          <!-- Optional Properties -->
          <div class="properties-section">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <label class="form-label" style="margin: 0;">Additional Properties</label>
              <button type="button" class="btn-add-property" onclick="addProperty()">
                + Add Property
              </button>
            </div>
            <div id="propertiesContainer">
              <!-- Dynamic properties will be added here -->
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="resetForm()">
              Clear
            </button>
            <button type="submit" class="btn btn-primary" id="submitBtn">
              Submit Feedback
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Map Section -->
    <div class="map-section">
      <div class="map-card">
        <div class="map-header">
          <div class="map-title">Select Location</div>
          <div class="map-instruction">Click on the map to set the feedback location</div>
        </div>
        <div id="map"></div>
      </div>
    </div>
  </div>

  <!-- Mapbox Geocoder for search -->
  <script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.min.js"></script>
  <link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v5.0.0/mapbox-gl-geocoder.css" type="text/css">

  <script>
    // Map display token
    mapboxgl.accessToken = 'YOUR_MAPBOX_PUBLIC_TOKEN_HERE';

    // Load saved token
    window.addEventListener('DOMContentLoaded', () => {
      const savedToken = localStorage.getItem('mapbox_feedback_token');
      if (savedToken) {
        document.getElementById('apiToken').value = savedToken;
        updateTokenStatus(true);
      }
    });

    function updateTokenStatus(isValid) {
      const status = document.getElementById('tokenStatus');
      if (isValid) {
        status.textContent = 'Token Valid';
        status.className = 'token-status valid';
      } else {
        status.textContent = 'No Token';
        status.className = 'token-status';
      }
    }

    // Include the JavaScript implementation
    {% include {{ page.js }} %}
  </script>
</body>

</html>