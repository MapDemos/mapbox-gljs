---
layout: null
title: Sapporo Medical Facilities & Airport - Mapbox GL JS
js: sapporo-pois.js
---

<html lang="en">
<head>
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.1/jquery.min.js"></script>
  <script src='https://api.mapbox.com/mapbox-gl-js/v3.18.0/mapbox-gl.js'></script>
  <link href='https://api.mapbox.com/mapbox-gl-js/v3.18.0/mapbox-gl.css' rel='stylesheet' />
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

    /* ---- Tabs ---- */
    #view-tabs { display: flex; gap: 4px; }
    .tab-btn {
      padding: 6px 16px; border: 1.5px solid #cbd5e1; border-radius: 20px;
      font-size: 12px; font-weight: 500; cursor: pointer;
      background: white; color: #475569; transition: all 0.18s; white-space: nowrap;
    }
    .tab-btn:hover { border-color: #0ea5e9; color: #0ea5e9; }
    .tab-btn.active { background: #0ea5e9; border-color: #0ea5e9; color: white; font-weight: 600; }

    /* ---- Screenshot button ---- */
    #btn-screenshot {
      padding: 6px 14px; border: 1.5px solid #cbd5e1; border-radius: 20px;
      font-size: 12px; font-weight: 500; cursor: pointer;
      background: white; color: #475569; transition: all 0.18s; white-space: nowrap;
      display: flex; align-items: center; gap: 5px;
    }
    #btn-screenshot:hover { border-color: #0ea5e9; color: #0ea5e9; }
    #btn-screenshot:disabled { opacity: 0.5; cursor: wait; }

    /* ---- Main layout ---- */
    #main { position: relative; flex: 1; min-height: 0; }
    #map { position: absolute; inset: 0; }

    /* ---- Inset overview minimap (bottom-right) ---- */
    #minimap {
      position: absolute; bottom: 12px; right: 12px; z-index: 5;
      width: 220px; height: 165px;
      border: 3px solid #fff; border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.28);
      overflow: hidden;
    }
    #minimap .mapboxgl-ctrl-logo { display: none; }

    /* ---- On-map legend overlay (upper-left) ---- */
    #legend-overlay {
      position: absolute; top: 14px; left: 14px; z-index: 5;
      width: 290px; max-height: calc(100% - 28px); overflow-y: auto;
      background: rgba(255,255,255,0.97); border-radius: 10px;
      box-shadow: 0 4px 18px rgba(0,0,0,0.18);
      padding: 14px; display: flex; flex-direction: column; gap: 10px;
    }
    .side-panel { display: none; flex-direction: column; gap: 10px; }
    .side-panel.active { display: flex; }
    .panel-title { font-size: 14px; font-weight: 700; color: #0f172a; border-bottom: 2px solid #e0f2fe; padding-bottom: 8px; }
    .panel-desc { font-size: 12px; color: #64748b; line-height: 1.6; }

    /* ---- POI list ---- */
    .poi-list { display: flex; flex-direction: column; gap: 6px; }
    .poi-section-label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
    .poi-item {
      display: flex; align-items: center; gap: 10px;
      padding: 7px 8px; border-radius: 6px;
      cursor: pointer; transition: background 0.15s;
    }
    .poi-item:hover { background: #f0f9ff; }
    .poi-num { width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: white; }
    .poi-pin { width: 20px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .poi-name { font-size: 12.5px; font-weight: 500; color: #1e293b; line-height: 1.35; }

    /* ---- Info box ---- */
    .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; font-size: 12px; line-height: 1.6; color: #475569; }

    /* ---- Legend ---- */
    .legend { display: flex; flex-direction: column; gap: 6px; }
    .legend-row { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #475569; }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; border: 2px solid white; box-shadow: 0 0 0 1px #cbd5e1; }
  </style>
</head>
<body>

<div id="header">
  <div class="brand">
    <div class="brand-icon">🗺️</div>
    <div>
      <div class="brand-title">Sapporo Medical Facilities &amp; Airport</div>
      <div class="brand-sub">Mapbox GL JS · POI Demo</div>
    </div>
  </div>
  <div class="spacer"></div>
  <button id="btn-screenshot">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M3 9h2M19 9h2M9 3v2M9 19v2M15 3v2M15 19v2"/></svg>
    Screenshot
  </button>
  <div id="view-tabs">
    <button class="tab-btn active" data-tab="1">1. Japan Overview</button>
    <button class="tab-btn" data-tab="2">2. Regional View</button>
    <button class="tab-btn" data-tab="3">3. City View</button>
  </div>
</div>

<div id="main">
  <div id="map"></div>
  <div id="minimap"></div>

  <div id="legend-overlay">

    <!-- Panel 1: Japan Overview -->
    <div class="side-panel active" id="panel-1">
      <div class="panel-title">Client Location in Japan</div>
      <div class="poi-list">
        <div class="poi-item" data-id="sapporo">
          <span class="poi-pin">
            <svg width="16" height="22" viewBox="0 0 28 40"><path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 26 14 26S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="#e11d48"/></svg>
          </span>
          <div class="poi-name">Sapporo</div>
        </div>
      </div>
    </div>

    <!-- Panel 2: Regional View -->
    <div class="side-panel" id="panel-2">
      <div class="panel-title">Medical Facilities and Airport</div>
      <div class="poi-list">
        <div class="poi-item" data-id="hospital-1">
          <span class="poi-num" style="background:#e11d48">1</span>
          <div class="poi-name">Sapporo Higashi Tokushukai Hospital</div>
        </div>
        <div class="poi-item" data-id="hospital-2">
          <span class="poi-num" style="background:#e11d48">2</span>
          <div class="poi-name">Japan Self Defense Forces (JSDF) Sapporo Hospital</div>
        </div>
        <div class="poi-item" data-id="clinic-1">
          <span class="poi-num" style="background:#e11d48">3</span>
          <div class="poi-name">Maruyama Koen Naika</div>
        </div>
        <div class="poi-item" data-id="clinic-2">
          <span class="poi-num" style="background:#e11d48">4</span>
          <div class="poi-name">Omni Dentix</div>
        </div>
        <div class="poi-item" data-id="airport">
          <span class="poi-pin">
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V4.5c0-.83-.67-1.5-1.5-1.5S10 3.67 10 4.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="#2563eb"/></svg>
          </span>
          <div class="poi-name">New Chitose Airport</div>
        </div>
      </div>
    </div>

    <!-- Panel 3: City View -->
    <div class="side-panel" id="panel-3">
      <div class="panel-title">Closer View of Medical Facilities</div>
      <div class="poi-list">
        <div class="poi-item" data-id="hospital-1">
          <span class="poi-num" style="background:#e11d48">1</span>
          <div class="poi-name">Sapporo Higashi Tokushukai Hospital</div>
        </div>
        <div class="poi-item" data-id="hospital-2">
          <span class="poi-num" style="background:#e11d48">2</span>
          <div class="poi-name">Japan Self Defense Forces (JSDF) Sapporo Hospital</div>
        </div>
        <div class="poi-item" data-id="clinic-1">
          <span class="poi-num" style="background:#e11d48">3</span>
          <div class="poi-name">Maruyama Koen Naika</div>
        </div>
        <div class="poi-item" data-id="clinic-2">
          <span class="poi-num" style="background:#e11d48">4</span>
          <div class="poi-name">Omni Dentix</div>
        </div>
      </div>
    </div>

  </div><!-- #legend-overlay -->
</div><!-- #main -->

<script>
  {% include {{ page.js }} %}
</script>
</body>
</html>
