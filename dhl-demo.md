---
layout: null
title: DHL Capabilities Demo - Mapbox GL JS
js: dhl-demo.js
---

<html lang="en">
<head>
  {% include common_head.html %}
  <script src="https://cdn.jsdelivr.net/npm/apexcharts@3.45.0"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { height: 100vh; display: flex; flex-direction: column; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; overflow: hidden; }

    /* ---- Header ---- */
    #header {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 16px; background: #fff;
      border-bottom: 3px solid #D40511; flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    }
    .dhl-brand {
      display: flex; align-items: center; gap: 8px; flex-shrink: 0;
    }
    .dhl-logo-box {
      background: #FFCC00; color: #D40511; font-weight: 900;
      font-size: 18px; padding: 3px 9px; border-radius: 4px; letter-spacing: 1px;
    }
    .demo-title { font-size: 14px; font-weight: 600; color: #333; white-space: nowrap; }
    .spacer { flex: 1; }

    /* ---- Tabs ---- */
    #scenario-tabs { display: flex; gap: 4px; flex-wrap: wrap; }
    .tab-btn {
      padding: 6px 14px; border: 1.5px solid #ddd; border-radius: 20px;
      font-size: 12px; font-weight: 500; cursor: pointer;
      background: white; color: #555; transition: all 0.2s; white-space: nowrap;
    }
    .tab-btn:hover { border-color: #D40511; color: #D40511; }
    .tab-btn.active { background: #D40511; border-color: #D40511; color: white; font-weight: 600; }
    .tab-btn.optional { border-style: dashed; }

    /* ---- Main layout ---- */
    #main { display: flex; flex: 1; min-height: 0; }
    #map { flex: 1; min-width: 0; position: relative; }
    #side { width: 300px; flex-shrink: 0; background: white; border-left: 1px solid #e0e0e0; display: flex; flex-direction: column; overflow: hidden; }

    /* ---- Side panels ---- */
    .side-panel { display: none; flex-direction: column; height: 100%; overflow-y: auto; padding: 16px; gap: 12px; }
    .side-panel.active { display: flex; }
    .panel-title { font-size: 14px; font-weight: 700; color: #D40511; border-bottom: 2px solid #FFCC00; padding-bottom: 6px; }
    .panel-desc { font-size: 12px; color: #666; line-height: 1.5; }

    /* Controls */
    .control-group { display: flex; flex-direction: column; gap: 6px; }
    .control-label { font-size: 12px; font-weight: 600; color: #444; }
    .toggle-row { display: flex; align-items: center; gap: 8px; font-size: 13px; padding: 4px 0; }
    .toggle-row input[type=checkbox] { accent-color: #D40511; width: 15px; height: 15px; }
    .dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
    .diamond { width: 10px; height: 10px; transform: rotate(45deg); flex-shrink: 0; }

    .btn-primary {
      width: 100%; padding: 10px; background: #D40511; color: white;
      border: none; border-radius: 6px; font-size: 13px; font-weight: 600;
      cursor: pointer; transition: background 0.2s;
    }
    .btn-primary:hover { background: #b30010; }
    .btn-primary:disabled { background: #999; cursor: default; }

    .info-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
    .info-row:last-child { border-bottom: none; }

    /* Radio group */
    .radio-group { display: flex; flex-direction: column; gap: 6px; }
    .radio-row { display: flex; align-items: center; gap: 8px; font-size: 13px; padding: 6px 8px; border-radius: 6px; cursor: pointer; transition: background 0.15s; }
    .radio-row:hover { background: #f9f9f9; }
    .radio-row input[type=radio] { accent-color: #D40511; }

    /* Telemetry table */
    #telemetry-table-wrap { flex: 1; overflow-y: auto; border: 1px solid #e0e0e0; border-radius: 6px; }
    #telemetry-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    #telemetry-table th { position: sticky; top: 0; background: #f8f8f8; padding: 7px 6px; text-align: left; font-weight: 600; border-bottom: 2px solid #e0e0e0; color: #444; }
    #telemetry-table td { padding: 6px 6px; border-bottom: 1px solid #f0f0f0; cursor: pointer; }
    #telemetry-table tr:hover td { background: #fef3f3; }
    #telemetry-table tr.selected td { background: #fff3e0; font-weight: 600; }
    .alert-cell { color: #ef4444; font-weight: 600; }

    /* Fleet filter */
    select.fleet-select {
      width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 6px;
      font-size: 13px; background: white;
    }
    .status-legend { display: flex; flex-direction: column; gap: 6px; }
    .status-row { display: flex; align-items: center; gap: 8px; font-size: 12px; }

    /* Geofence cards */
    .geo-card { display: flex; align-items: center; gap: 10px; padding: 10px; border: 1px solid #e0e0e0; border-radius: 8px; }
    .geo-dot { width: 14px; height: 14px; border-radius: 50%; flex-shrink: 0; }
    #geo-alert { margin-top: 4px; }
    .geo-alert-box { padding: 10px; border-left: 4px solid #ef4444; background: #fef2f2; border-radius: 4px; font-size: 12px; line-height: 1.6; }
    .geo-status { padding: 8px; background: #f0fdf4; border-radius: 4px; font-size: 12px; color: #16a34a; }

    /* W3W */
    .w3w-address { font-size: 18px; font-weight: 700; color: #e11d48; padding: 10px; background: #fff1f2; border-radius: 6px; text-align: center; }
    .w3w-key-row { display: flex; gap: 6px; }
    .w3w-key-row input { flex: 1; padding: 7px; border: 1px solid #ddd; border-radius: 6px; font-size: 12px; }

    /* Info box */
    .info-box { background: #f8f8f8; border-radius: 6px; padding: 10px; font-size: 12px; line-height: 1.6; color: #444; }

    /* Style switcher */
    #style-switcher {
      position: absolute; bottom: 28px; left: 10px; z-index: 10;
      display: flex; gap: 4px;
      background: rgba(255,255,255,0.92); padding: 5px 7px;
      border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.18);
    }
    .style-btn {
      padding: 5px 11px; border: 1.5px solid #ddd; border-radius: 5px;
      font-size: 11px; font-weight: 500; cursor: pointer;
      background: white; color: #555; transition: all 0.15s;
    }
    .style-btn:hover { border-color: #D40511; color: #D40511; }
    .style-btn.active { background: #D40511; border-color: #D40511; color: white; font-weight: 600; }

    /* Case 1 split bar */
    .split-bar { display: flex; height: 8px; border-radius: 4px; overflow: hidden; width: 100%; margin: 4px 0; }
    .split-bar-driven { background: #9ca3af; transition: width 0.4s; }
    .split-bar-remaining { background: #D40511; flex: 1; }
    #s7-telemetry-chart { height: 160px; width: 100%; }
    #s7-chart-overlay {
      display: none; position: absolute; top: 10px; left: 10px; z-index: 10;
      width: 540px; background: rgba(255,255,255,0.95); border-radius: 8px;
      padding: 8px 10px 4px; box-shadow: 0 2px 10px rgba(0,0,0,0.18);
    }
    #s7-chart-overlay .chart-title { font-size: 11px; font-weight: 600; color: #555; margin-bottom: 2px; }
    #s7-now-line { display: none; position: absolute; width: 2px; background: #D40511; pointer-events: none; z-index: 12; }
    #s7-now-line span { position: absolute; top: -16px; left: 3px; background: #D40511; color: white; font-size: 9px; font-weight: 600; padding: 1px 4px; border-radius: 2px; white-space: nowrap; }

    /* Case 2 bundle list */
    .bundle-row { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 6px; cursor: pointer; transition: background 0.15s; font-size: 12px; }
    .bundle-row:hover { background: #f9f9f9; }
    .bundle-row.selected { background: #fef3f3; font-weight: 600; }
    .bundle-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .hub-badge { font-size: 10px; background: #FFCC00; color: #D40511; font-weight: 700; padding: 1px 5px; border-radius: 10px; flex-shrink: 0; margin-left: auto; }
  </style>
</head>
<body>

<div id="header">
  <div class="dhl-brand">
    <div class="dhl-logo-box">DHL</div>
    <div class="demo-title">Mapbox GL JS Capabilities</div>
  </div>
  <div class="spacer"></div>
  <div id="scenario-tabs">
    <button class="tab-btn active" data-scenario="1">1. Transport Map</button>
    <button class="tab-btn" data-scenario="2">2. Map Layers</button>
    <button class="tab-btn" data-scenario="3">3. Table Integration</button>
    <button class="tab-btn" data-scenario="4">4. Fleet Clustering</button>
    <button class="tab-btn" data-scenario="5">5. Geofencing</button>
    <button class="tab-btn optional" data-scenario="6">6. What3Words ✦</button>
    <button class="tab-btn" data-scenario="7">7. Route + Telemetry</button>
    <button class="tab-btn" data-scenario="8">8. Bundle Order</button>
  </div>
</div>

<div id="main">
  <div id="map">
    <div id="s7-chart-overlay">
      <div class="chart-title">TEMP &amp; HUMIDITY</div>
      <div id="s7-telemetry-chart"></div>
      <div id="s7-now-line"><span>NOW</span></div>
      <div id="s7-conditions" style="font-size:12px;padding:6px 4px 2px;border-top:1px solid #f0f0f0;margin-top:2px;color:#444"></div>
    </div>
    <div id="style-switcher">
      <button class="style-btn active" data-style="standard">Standard</button>
      <button class="style-btn" data-style="satellite">Satellite</button>
      <button class="style-btn" data-style="light">Light</button>
      <button class="style-btn" data-style="dark">Dark</button>
    </div>
  </div>

  <div id="side">

    <!-- Panel 1: Transport Map -->
    <div class="side-panel active" id="panel-1">
      <div class="panel-title">1. Transport Map</div>
      <div class="panel-desc">Frankfurt → Amsterdam shipment. Toggle point types and calculate the full route with live traffic.</div>

      <div class="control-group">
        <div class="control-label">POINT TYPES</div>
        <label class="toggle-row">
          <input type="checkbox" class="layer-toggle" data-layer="s1-from" checked>
          <span class="dot" style="background:#22c55e"></span> Origin (FROM)
        </label>
        <label class="toggle-row">
          <input type="checkbox" class="layer-toggle" data-layer="s1-to" checked>
          <span class="dot" style="background:#D40511"></span> Destination (TO)
        </label>
        <label class="toggle-row">
          <input type="checkbox" class="layer-toggle" data-layer="s1-latest" checked>
          <span class="dot" style="background:#2563eb"></span> Latest Position
        </label>
        <label class="toggle-row">
          <input type="checkbox" class="layer-toggle" data-layer="s1-milestones" checked>
          <span class="diamond" style="background:#f59e0b"></span> Milestones (5)
        </label>
      </div>

      <div class="control-group">
        <div class="control-label">ROUTE — Origin → Destination</div>
        <button class="btn-primary" id="btn-show-route">Calculate Route + Duration</button>
        <div id="route-info" class="info-box">Click the button to fetch the live traffic route.</div>
      </div>

      <div class="info-box">
        <b>Parcel:</b> DHL-TRK-0847 · Cold chain<br>
        <b>Status:</b> In transit<br>
        <b>Click markers</b> for detailed information.
      </div>
    </div>

    <!-- Panel 2: Map Layers -->
    <div class="side-panel" id="panel-2">
      <div class="panel-title">2. Map Layers</div>
      <div class="panel-desc">Switch between data layers: transport markers, IoT telemetry readings, and active alerts. Combine layers as needed.</div>

      <div class="control-group">
        <div class="control-label">ACTIVE DATASET</div>
        <div class="radio-group">
          <label class="radio-row">
            <input type="radio" name="layer-group" value="transport" checked> Transport Points
          </label>
          <label class="radio-row">
            <input type="radio" name="layer-group" value="telemetry"> Telemetry Data (temperature)
          </label>
          <label class="radio-row">
            <input type="radio" name="layer-group" value="alerts"> Alerts Only
          </label>
          <label class="radio-row">
            <input type="radio" name="layer-group" value="both"> Transport + Alerts
          </label>
        </div>
      </div>

      <div class="info-box">
        <b>Telemetry layer</b> uses color interpolation: cool blue (2°C) → yellow (5°C) → red (8°C).<br><br>
        <b>Alerts</b> are triggered for temperature excursions and shock events.
      </div>
    </div>

    <!-- Panel 3: Table Integration -->
    <div class="side-panel" id="panel-3">
      <div class="panel-title">3. Table Integration</div>
      <div class="panel-desc">Click a row to fly to and highlight the sensor reading on the map. Click a map point to highlight the row.</div>
      <div id="telemetry-table-wrap">
        <table id="telemetry-table">
          <thead><tr><th>Time</th><th>Temp</th><th>Humid</th><th>Shock</th></tr></thead>
          <tbody id="telemetry-tbody"></tbody>
        </table>
      </div>
    </div>

    <!-- Panel 4: Fleet Clustering -->
    <div class="side-panel" id="panel-4">
      <div class="panel-title">4. Fleet Clustering</div>
      <div class="panel-desc">300 active shipments across Europe. Zoom in to expand clusters. Filter by status to dynamically update clustering.</div>

      <div class="control-group">
        <div class="control-label">FILTER BY STATUS</div>
        <select class="fleet-select" id="fleet-filter">
          <option value="all">All Shipments</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="delayed">Delayed</option>
          <option value="exception">Exception</option>
        </select>
        <div id="fleet-count" style="font-size:12px;color:#666;text-align:right"></div>
      </div>

      <div class="status-legend">
        <div class="control-label">STATUS COLORS</div>
        <div class="status-row"><span class="dot" style="background:#2563eb"></span> In Transit</div>
        <div class="status-row"><span class="dot" style="background:#22c55e"></span> Delivered</div>
        <div class="status-row"><span class="dot" style="background:#f59e0b"></span> Delayed</div>
        <div class="status-row"><span class="dot" style="background:#ef4444"></span> Exception</div>
      </div>

      <div class="info-box">Click any cluster to zoom in and expand. Click individual markers for parcel details.</div>
    </div>

    <!-- Panel 5: Geofencing -->
    <div class="side-panel" id="panel-5">
      <div class="panel-title">5. Geofencing</div>
      <div class="panel-desc">Three geofence zones with configurable rules. Watch the truck animate along the route and trigger zone alerts.</div>

      <div class="control-group">
        <div class="control-label">DEFINED ZONES</div>
        <div id="geofence-list" style="display:flex;flex-direction:column;gap:6px"></div>
      </div>

      <div class="control-group">
        <div class="control-label">LIVE TRUCK STATUS</div>
        <div id="geo-alert"><div class="geo-status">🟢 Initializing animation…</div></div>
      </div>

      <div class="info-box">Click a zone on the map to see its configuration. The yellow truck animates along the route in real time.</div>

      <div class="info-box" style="border-left:3px solid #f59e0b;background:#fffbeb;color:#92400e">
        <b>⚠ Demo only</b><br>
        This visualization uses client-side polygon intersection (Turf.js) on a simulated path. It is <b>not</b> production geofencing.<br><br>
        Real geofencing requires the <b>Mapbox iOS or Android Navigation SDK</b>, which provides on-device, battery-efficient boundary monitoring with accurate entry/exit events tied to live GPS.<br><br>
        <a href="https://github.com/kenji-shima/GeofencingPoC/blob/main/app/src/main/java/com/mapbox/geofencing/logic/GeofenceHandler.kt"
           target="_blank" style="color:#D40511;font-weight:600">View Android SDK sample code →</a>
      </div>
    </div>

    <!-- Panel 6: What3Words -->
    <div class="side-panel" id="panel-6">
      <div class="panel-title">6. What3Words ✦</div>
      <div class="panel-desc">Click anywhere on the map to convert coordinates to a what3words address.</div>

      <div class="control-group">
        <div class="control-label">API KEY (optional)</div>
        <div class="w3w-key-row">
          <input type="text" id="w3w-key-input" placeholder="Enter w3w API key for live data">
        </div>
        <div style="font-size:11px;color:#999">Without a key, demo mode shows illustrative addresses.</div>
      </div>

      <div id="w3w-result" class="info-box">Click the map to look up a location.</div>

      <div id="w3w-instruction" class="info-box" style="color:#D40511;font-weight:500"></div>

      <div class="info-box">
        <b>what3words</b> divides the world into 3m × 3m squares, each with a unique 3-word address.<br><br>
        Useful for precise delivery location specification, especially in areas without formal addresses.
      </div>
    </div>

    <!-- Panel 7: Route + Telemetry -->
    <div class="side-panel" id="panel-7">
      <div class="panel-title">7. Route + Telemetry</div>
      <div class="panel-desc">Frankfurt → Paris CDG · order DE-FR-100245789. Planned route with the driven (green) vs remaining (dashed) split, the real GPS telemetry trail, and temp/humidity sensor data.</div>

      <div class="control-group">
        <div class="control-label">DISTANCE PROGRESS</div>
        <div class="split-bar">
          <div class="split-bar-driven" id="s7-bar-driven" style="width:0%"></div>
          <div class="split-bar-remaining"></div>
        </div>
        <div id="s7-split-info" class="info-box">Loading route…</div>
      </div>

      <div class="control-group">
        <button class="btn-primary" id="s7-play-btn" disabled>▶ Animate Vehicle</button>
        <label class="toggle-row" style="margin-top:6px">
          <input type="checkbox" id="s7-route-toggle" disabled>
          Use road network route
        </label>
        <label class="toggle-row">
          <input type="checkbox" id="s7-snap-toggle">
          Snap markers to road
        </label>
      </div>

    </div>

    <!-- Panel 8: Bundle Order -->
    <div class="side-panel" id="panel-8">
      <div class="panel-title">8. Bundle Order</div>
      <div class="panel-desc">Bundle BUNDLE-2026-0006-0042 — 14 sub-routes. 6 routes share the Cologne DC hub.</div>

      <div class="status-legend">
        <div class="control-label">STATUS</div>
        <div class="status-row"><span class="dot" style="background:#22c55e"></span> Completed (2)</div>
        <div class="status-row"><span class="dot" style="background:#2563eb"></span> In Transit (10)</div>
        <div class="status-row"><span class="dot" style="background:#9ca3af"></span> Not Started (2)</div>
      </div>

      <div class="control-group" style="margin-top:4px">
        <label class="toggle-row">
          <input type="checkbox" id="s8-route-toggle" disabled>
          Use road network route
        </label>
      </div>

      <div id="s8-load-note" style="font-size:11px;color:#999;text-align:right;min-height:16px"></div>
      <div id="bundle-list" style="display:flex;flex-direction:column;gap:3px;overflow-y:auto;flex:1;border:1px solid #e0e0e0;border-radius:6px;padding:6px"></div>

      <div class="info-box" style="border-left:3px solid #FFCC00;background:#fffbeb;color:#92400e;font-size:11px">
        <b>★ Hub routes</b> — 6 shipments share the Cologne DC hub origin.
      </div>
    </div>

  </div><!-- #side -->
</div><!-- #main -->

<script>
  {% include {{ page.js }} %}
</script>
</body>
</html>
