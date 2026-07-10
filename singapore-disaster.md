---
layout: null
title: Singapore Disaster Response
js: singapore-disaster.js
---

<html lang="en">

<head>
  {% include common_head.html %}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    <!--
    :root {
        --ink: #0a1420;
        --ink-2: #0f2033;
        --sg-red: #d1293f;
        --amber: #e2a33c;
        --safe-green: #21976b;
        --paper: #eef2f1;
        --slate: #7e8fa0;
        --hairline: rgba(238, 242, 241, 0.12);
    }

    html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        overflow: hidden;
    }

    body * {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    .map {
        position: absolute;
        top: 40px;
        bottom: 0;
        width: 100%;
    }

    /* Emergency advisory ticker */
    #ticker {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 40px;
        z-index: 3;
        background: linear-gradient(180deg, var(--ink-2), var(--ink));
        border-bottom: 2px solid var(--sg-red);
        display: flex;
        align-items: center;
        overflow: hidden;
        font-family: 'Barlow Semi Condensed', sans-serif;
    }

    #ticker .live-tag {
        flex: 0 0 auto;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 0 14px;
        height: 100%;
        background: var(--sg-red);
        color: var(--paper);
        font-weight: 700;
        font-size: 12px;
        letter-spacing: 0.08em;
        white-space: nowrap;
    }

    #ticker .live-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--paper);
        animation: pulse-dot 1.1s ease-in-out infinite;
    }

    @keyframes pulse-dot {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.25; }
    }

    #ticker .sim-tag {
        flex: 0 0 auto;
        padding: 0 12px;
        height: 100%;
        display: flex;
        align-items: center;
        background: var(--hairline);
        color: var(--slate);
        font-weight: 600;
        font-size: 10px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        white-space: nowrap;
    }

    #ticker .tape {
        flex: 1 1 auto;
        overflow: hidden;
        white-space: nowrap;
        position: relative;
        height: 100%;
        display: flex;
        align-items: center;
    }

    #ticker .tape-text {
        display: inline-block;
        padding-left: 100%;
        color: var(--paper);
        font-weight: 500;
        font-size: 13px;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        animation: scroll-tape 26s linear infinite;
    }

    @keyframes scroll-tape {
        from { transform: translateX(0); }
        to { transform: translateX(-100%); }
    }

    @media (prefers-reduced-motion: reduce) {
        #ticker .tape-text { animation: none; padding-left: 14px; }
        #ticker .live-dot { animation: none; }
    }

    #ticker .clock {
        flex: 0 0 auto;
        padding: 0 14px;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 12px;
        color: var(--slate);
        white-space: nowrap;
    }

    /* Situation report panel */
    #panel {
        position: absolute;
        top: 56px;
        left: 16px;
        z-index: 2;
        width: 290px;
        max-height: calc(100% - 72px);
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        background: linear-gradient(180deg, var(--ink-2), var(--ink));
        border-top: 2px solid var(--safe-green);
        border-radius: 0 0 3px 3px;
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
        color: var(--paper);
        -webkit-user-select: auto;
        user-select: auto;
    }

    #panel .panel-header {
        flex: 0 0 auto;
        padding: 12px 14px 8px;
    }

    #panel .panel-label {
        font-family: 'Barlow Semi Condensed', sans-serif;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--paper);
        margin-bottom: 2px;
    }

    #panel .panel-sub {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 10px;
        color: var(--slate);
    }

    #panel .panel-summary {
        font-family: 'Inter', sans-serif;
        font-size: 11.5px;
        color: var(--paper);
        margin-top: 6px;
    }

    #zone-list {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        padding: 0 14px;
    }

    .section-label {
        font-family: 'Barlow Semi Condensed', sans-serif;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--slate);
        margin: 10px 0 4px;
    }

    .section-label:first-child {
        margin-top: 2px;
    }

    .zone-row {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        padding: 8px 6px;
        border-left: 3px solid transparent;
        border-radius: 0 3px 3px 0;
        cursor: pointer;
        transition: background 0.15s ease, border-color 0.15s ease;
    }

    .zone-row:hover,
    .zone-row:focus-visible {
        background: var(--hairline);
    }

    .zone-row:focus-visible {
        outline: 1px solid var(--safe-green);
        outline-offset: 1px;
    }

    .zone-row + .zone-row {
        margin-top: 2px;
    }

    .zone-row.active {
        background: var(--hairline);
    }

    .zone-row.no-go.active { border-left-color: var(--sg-red); }
    .zone-row.caution.active { border-left-color: var(--amber); }
    .zone-row.safe.active { border-left-color: var(--safe-green); }

    .zone-chip {
        flex: 0 0 auto;
        width: 10px;
        height: 10px;
        border-radius: 2px;
        margin-top: 3px;
    }

    .zone-chip.no-go { background: var(--sg-red); }
    .zone-chip.caution { background: var(--amber); }
    .zone-chip.safe { background: var(--safe-green); }

    .zone-text .zone-name {
        font-family: 'Inter', sans-serif;
        font-size: 12.5px;
        font-weight: 600;
        color: var(--paper);
        line-height: 1.3;
    }

    .zone-text .zone-desc {
        font-family: 'Inter', sans-serif;
        font-size: 11px;
        color: var(--slate);
        line-height: 1.35;
        margin-top: 2px;
    }

    .row-pill {
        display: inline-block;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 9px;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        padding: 1px 5px;
        border-radius: 2px;
        margin-left: 6px;
        vertical-align: 1px;
    }

    .row-pill.caution {
        background: rgba(226, 163, 60, 0.25);
        color: #f2c47a;
    }

    .row-pill.no-go {
        background: rgba(209, 41, 63, 0.25);
        color: #ff8a97;
    }

    /* Shelter rows are single-line and denser — 4 of them read as a group, not a list of essays. */
    .zone-row.safe {
        align-items: center;
        padding: 6px 6px;
    }

    .zone-row.safe .zone-chip {
        margin-top: 0;
    }

    .zone-row.safe .zone-text {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        align-items: baseline;
        gap: 6px;
    }

    .zone-row.safe .zone-name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .zone-row.safe .zone-desc {
        margin-top: 0;
        font-size: 10.5px;
        white-space: nowrap;
        flex: 0 1 auto;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .zone-capacity {
        flex: 0 0 auto;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 10.5px;
        color: var(--slate);
    }

    #panel .route-key {
        flex: 0 0 auto;
        padding: 8px 14px 12px;
        border-top: 1px solid var(--hairline);
    }

    .legend-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 3px 6px;
        font-family: 'Inter', sans-serif;
        font-size: 11px;
        color: var(--slate);
    }

    .legend-swatch {
        flex: 0 0 auto;
        width: 12px;
        height: 12px;
        border-radius: 2px;
    }

    .legend-swatch.route-fastest {
        background: none;
        border-top: 3px solid var(--paper);
        height: 0;
        margin-top: 6px;
    }
    .legend-swatch.route-alt {
        background: none;
        border-top: 2px dashed var(--paper);
        height: 0;
        margin-top: 6px;
        opacity: 0.45;
    }

    /* Popups */
    .mapboxgl-popup-content {
        background: var(--ink-2);
        color: var(--paper);
        font-family: 'Inter', sans-serif;
        border-top: 3px solid var(--sg-red);
        border-radius: 2px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.45);
        padding: 12px 14px;
        -webkit-user-select: auto;
        user-select: auto;
    }

    .popup-safe .mapboxgl-popup-content { border-top-color: var(--safe-green); }
    .popup-caution .mapboxgl-popup-content { border-top-color: var(--amber); }

    .mapboxgl-popup-tip {
        border-top-color: var(--ink-2) !important;
        border-bottom-color: var(--ink-2) !important;
    }

    .mapboxgl-popup-close-button {
        color: var(--slate);
    }

    .popup-title {
        font-family: 'Barlow Semi Condensed', sans-serif;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        margin-bottom: 4px;
    }

    .popup-status {
        display: inline-block;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 10px;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        padding: 2px 6px;
        border-radius: 2px;
        margin-bottom: 6px;
    }

    .popup-status.no-go { background: rgba(209, 41, 63, 0.2); color: #ff8a97; }
    .popup-status.caution { background: rgba(226, 163, 60, 0.2); color: #f2c47a; }
    .popup-status.safe { background: rgba(33, 151, 107, 0.2); color: #7fe0bb; }

    .popup-body {
        font-size: 12px;
        line-height: 1.5;
        color: var(--paper);
    }

    @media (max-width: 480px) {
        #panel {
            top: auto;
            bottom: 8px;
            left: 8px;
            right: 8px;
            width: auto;
            max-height: 40vh;
        }

        /* Shrink the map's own bottom edge above the docked panel, instead of letting the
           panel overlay cover part of the map — otherwise Mapbox's attribution control
           (anchored to the map container's bottom-right) ends up hidden underneath it. */
        .map {
            bottom: calc(40vh + 16px);
        }
    }
    -->
</style>
</head>

<body>
  <div id="ticker">
    <div class="live-tag"><span class="live-dot"></span>LIVE ADVISORY</div>
    <div class="sim-tag">Simulated scenario</div>
    <div class="tape"><span class="tape-text" id="tape-text"></span></div>
    <div class="clock" id="ticker-clock">SGT --:--</div>
  </div>
  <div id="map" class="map"></div>
  <div id="panel">
    <div class="panel-header">
      <div class="panel-label">Situation Report</div>
      <div class="panel-sub" id="advisory-level">ADVISORY LEVEL 2 &middot; SIMULATED DATA</div>
      <div class="panel-summary" id="panel-summary"></div>
    </div>
    <div id="zone-list"></div>
    <div class="route-key">
      <div class="legend-row"><span class="legend-swatch route-fastest"></span>Fastest route (click a zone or shelter)</div>
      <div class="legend-row"><span class="legend-swatch route-alt"></span>Alternate routes</div>
    </div>
  </div>
</body>
<script>
  {% include {{ page.js }} %}
</script>

</html>
