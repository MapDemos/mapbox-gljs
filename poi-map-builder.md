---
layout: null
title: POI Map Builder - Mapbox GL JS
js: poi-map-builder.js
---

<html lang="en">
<head>
  {% include common_head.html %}
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { height: 100vh; display: flex; flex-direction: column; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f1f5f9; overflow: hidden; }

    /* ---- Header ---- */
    #header {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 16px; background: #fff;
      border-bottom: 3px solid #0ea5e9; flex-shrink: 0;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand-icon { font-size: 22px; }
    .brand-title { font-size: 15px; font-weight: 700; color: #0f172a; }
    .brand-sub { font-size: 11px; color: #64748b; margin-top: 1px; }
    .spacer { flex: 1; }

    /* ---- Camera preset + export buttons ---- */
    .ctrl-group { display: flex; gap: 4px; align-items: center; }
    .ctrl-btn {
      padding: 6px 14px; border: 1.5px solid #cbd5e1; border-radius: 20px;
      font-size: 12px; font-weight: 500; cursor: pointer;
      background: white; color: #475569; transition: all 0.18s; white-space: nowrap;
      display: flex; align-items: center; gap: 5px;
    }
    .ctrl-btn:hover { border-color: #0ea5e9; color: #0ea5e9; }
    .ctrl-btn:disabled { opacity: 0.5; cursor: wait; }
    .ctrl-btn.primary { background: #0ea5e9; border-color: #0ea5e9; color: white; }
    .ctrl-btn.primary:hover { background: #0284c7; color: white; }
    select.ctrl-select {
      padding: 6px 10px; border: 1.5px solid #cbd5e1; border-radius: 20px;
      font-size: 12px; color: #475569; background: white; cursor: pointer;
    }
    .ctrl-divider { width: 1px; height: 22px; background: #e2e8f0; margin: 0 4px; }
    .ctrl-label { font-size: 12px; font-weight: 600; color: #64748b; }

    /* ---- Body: sidebar + map ---- */
    #body { display: flex; flex: 1; min-height: 0; }

    /* ---- Builder sidebar (NOT captured in export) ---- */
    #builder {
      width: 320px; flex-shrink: 0; background: #fff; border-right: 1px solid #e2e8f0;
      display: flex; flex-direction: column; overflow: hidden;
    }
    .builder-section { padding: 12px 14px; border-bottom: 1px solid #f1f5f9; }
    .builder-section h3 { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .field-label { font-size: 11px; color: #64748b; margin-bottom: 4px; display: block; }
    input.text-input, input.title-input {
      width: 100%; padding: 7px 9px; border: 1.5px solid #cbd5e1; border-radius: 6px;
      font-size: 13px; color: #1e293b;
    }
    input.text-input:focus, input.title-input:focus { outline: none; border-color: #0ea5e9; }

    .coord-or { font-size: 11px; color: #94a3b8; text-align: center; margin: 8px 0 6px; }
    .coord-add { display: flex; gap: 6px; }
    .coord-input { flex: 1; min-width: 0; padding: 7px 8px; border: 1.5px solid #cbd5e1; border-radius: 6px; font-size: 13px; color: #1e293b; }
    .coord-input:focus { outline: none; border-color: #0ea5e9; }
    .coord-btn { flex-shrink: 0; }

    .add-btn {
      width: 100%; padding: 9px; border: 1.5px dashed #0ea5e9; border-radius: 6px;
      background: #f0f9ff; color: #0284c7; font-size: 13px; font-weight: 600; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.15s;
    }
    .add-btn:hover { background: #e0f2fe; }
    .add-btn.arming { background: #0ea5e9; color: white; border-style: solid; }

    /* ---- POI list (editable rows) ---- */
    #poi-editor { flex: 1; overflow-y: auto; padding: 8px 10px; }
    .poi-empty { font-size: 12px; color: #94a3b8; text-align: center; padding: 24px 12px; line-height: 1.6; }
    .poi-row {
      display: flex; align-items: center; gap: 6px; padding: 8px 6px;
      border-radius: 7px; border: 1px solid #f1f5f9; margin-bottom: 6px; background: #fff;
    }
    .poi-row:hover { background: #f8fafc; }
    .poi-row .num-badge { width: 22px; height: 22px; flex-shrink: 0; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #fff; cursor: pointer; }
    .poi-row input[type="color"] { width: 26px; height: 26px; flex-shrink: 0; border: none; background: none; padding: 0; cursor: pointer; }
    .poi-row .name-input { flex: 1; min-width: 0; padding: 5px 7px; border: 1px solid #e2e8f0; border-radius: 5px; font-size: 12.5px; color: #1e293b; }
    .poi-row .name-input:focus { outline: none; border-color: #0ea5e9; }
    .poi-row .label-input { width: 34px; flex-shrink: 0; padding: 5px 4px; border: 1px solid #e2e8f0; border-radius: 5px; font-size: 12px; color: #1e293b; text-align: center; }
    .poi-row .label-input:focus { outline: none; border-color: #0ea5e9; }
    .poi-row select.style-select { flex-shrink: 0; padding: 4px; border: 1px solid #e2e8f0; border-radius: 5px; font-size: 11px; color: #475569; background: #fff; cursor: pointer; }
    .poi-row .row-btns { display: flex; flex-direction: column; gap: 1px; flex-shrink: 0; }
    .poi-row .icon-btn { width: 20px; height: 16px; border: none; background: none; cursor: pointer; color: #94a3b8; font-size: 11px; line-height: 1; padding: 0; border-radius: 3px; }
    .poi-row .icon-btn:hover { background: #f1f5f9; color: #0ea5e9; }
    .poi-row .del-btn:hover { color: #ef4444; background: #fef2f2; }

    .io-btns { display: flex; gap: 6px; }
    .io-btns .ctrl-btn { flex: 1; justify-content: center; padding: 7px 8px; }

    /* ---- Main map area (THIS is what export captures) ---- */
    #main { position: relative; flex: 1; min-height: 0; }
    #map { position: absolute; inset: 0; }

    #minimap {
      position: absolute; bottom: 12px; right: 12px; z-index: 5;
      width: 220px; height: 165px;
      border: 3px solid #fff; border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.28);
      overflow: hidden;
    }
    #minimap .mapboxgl-ctrl-logo { display: none; }

    #legend-overlay {
      position: absolute; top: 14px; left: 14px; z-index: 5;
      width: 290px; max-height: calc(100% - 28px); overflow-y: auto;
      background: rgba(255,255,255,0.97); border-radius: 10px;
      box-shadow: 0 4px 18px rgba(0,0,0,0.18);
      padding: 14px; display: flex; flex-direction: column; gap: 10px;
    }
    .legend-title { font-size: 14px; font-weight: 700; color: #0f172a; border-bottom: 2px solid #e0f2fe; padding-bottom: 8px; }
    .legend-list { display: flex; flex-direction: column; gap: 6px; }
    .legend-item { display: flex; align-items: center; gap: 10px; padding: 5px 4px; }
    .legend-num { width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: white; }
    .legend-pin { width: 20px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .legend-name { font-size: 12.5px; font-weight: 500; color: #1e293b; line-height: 1.35; }
    .legend-empty { font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>

<div id="header">
  <div class="brand">
    <div class="brand-icon">🗺️</div>
    <div>
      <div class="brand-title">POI Map Builder</div>
      <div class="brand-sub">Mapbox GL JS · Reusable Template</div>
    </div>
  </div>
  <div class="spacer"></div>

  <div class="ctrl-group">
    <label class="ctrl-label" for="preset-select">Preset</label>
    <select class="ctrl-select" id="preset-select"></select>
  </div>
  <div class="ctrl-divider"></div>
  <div class="ctrl-group">
    <select class="ctrl-select" id="export-format">
      <option value="png">PNG</option>
      <option value="jpg">JPG</option>
    </select>
    <button class="ctrl-btn primary" id="btn-export">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M3 9h2M19 9h2M9 3v2M9 19v2M15 3v2M15 19v2"/></svg>
      Export
    </button>
  </div>
</div>

<div id="body">

  <!-- Builder sidebar (excluded from exported image) -->
  <div id="builder">
    <div class="builder-section">
      <h3>Map Title</h3>
      <input class="title-input" id="title-input" type="text" placeholder="e.g. Tokyo Medical Facilities">
    </div>

    <div class="builder-section">
      <h3>Add Location</h3>
      <button class="add-btn" id="btn-add-click">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
        Click map to add a POI
      </button>
      <div class="coord-or">or enter coordinates</div>
      <div class="coord-add">
        <input id="lat-input" class="coord-input" type="number" step="any" placeholder="Latitude">
        <input id="lng-input" class="coord-input" type="number" step="any" placeholder="Longitude">
        <button class="ctrl-btn coord-btn" id="btn-add-coord">Add</button>
      </div>
    </div>

    <div class="builder-section" style="flex:1; display:flex; flex-direction:column; min-height:0; padding-bottom:0;">
      <h3>Locations</h3>
      <div id="poi-editor"></div>
    </div>

    <div class="builder-section">
      <div class="io-btns">
        <button class="ctrl-btn" id="btn-save">Save config</button>
        <button class="ctrl-btn" id="btn-load">Load config</button>
        <button class="ctrl-btn" id="btn-reset">Reset</button>
      </div>
      <input type="file" id="load-file" accept="application/json,.json" style="display:none">
    </div>
  </div>

  <!-- Map area (captured on export: map + legend + minimap) -->
  <div id="main">
    <div id="map"></div>
    <div id="minimap"></div>
    <div id="legend-overlay">
      <div class="legend-title" id="legend-title">My POI Map</div>
      <div class="legend-list" id="legend-list"></div>
    </div>
  </div>

</div><!-- #body -->

<script>
  {% include {{ page.js }} %}
</script>
</body>
</html>
