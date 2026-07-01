---
layout: null
title: Streets Extruded
js: streets-extruded.js
---

<html lang="en">

<head>
  {% include common_head.html %}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans+Condensed:wght@500;600&display=swap" rel="stylesheet">
  <style>
    <!--
    :root {
        --ink: #0b141c;
        --ink-2: #101b24;
        --teal: #2fb8ac;
        --amber: #f2a34c;
        --paper: #edede7;
        --slate: #8a97a1;
        --hairline: rgba(237, 237, 231, 0.14);
    }

    body {
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
        top: 0;
        bottom: 0;
        width: 100%;
    }

    /* Instrument plate — styled after a site-survey plaque:
       dark ground, edge-lit top rule, mono readouts. */
    #controls {
        position: absolute;
        top: 16px;
        left: 16px;
        z-index: 1;
        width: 260px;
        box-sizing: border-box;
        background: linear-gradient(180deg, var(--ink-2), var(--ink));
        border-top: 2px solid var(--teal);
        border-radius: 0 0 3px 3px;
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
        padding: 12px 14px 14px;
        font-family: 'IBM Plex Sans Condensed', 'Helvetica Neue', Arial, sans-serif;
        color: var(--paper);
        -webkit-user-select: auto;
        user-select: auto;
        animation: plate-in 0.5s ease-out;
    }

    @keyframes plate-in {
        from { opacity: 0; transform: translateY(-6px); }
        to { opacity: 1; transform: translateY(0); }
    }

    @media (prefers-reduced-motion: reduce) {
        #controls { animation: none; }
    }

    #controls .plate-label {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--paper);
        margin-bottom: 10px;
    }

    #controls .control-row {
        display: grid;
        grid-template-columns: 52px 1fr 48px;
        align-items: center;
        column-gap: 8px;
    }

    #controls .control-row + .control-row {
        margin-top: 10px;
    }

    #controls .control-divider {
        height: 1px;
        background: var(--hairline);
        margin: 12px 0;
    }

    #controls .control-label {
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--slate);
        white-space: nowrap;
    }

    #controls .control-readout {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 11px;
        color: var(--teal);
        text-align: right;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    #controls input[type="color"] {
        -webkit-appearance: none;
        appearance: none;
        width: 22px;
        height: 22px;
        padding: 0;
        border: 1px solid var(--hairline);
        border-radius: 3px;
        background: none;
        cursor: pointer;
        justify-self: start;
    }

    #controls input[type="color"]::-webkit-color-swatch-wrapper {
        padding: 0;
    }

    #controls input[type="color"]::-webkit-color-swatch {
        border: none;
        border-radius: 2px;
    }

    #controls input[type="range"] {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        min-width: 0;
        height: 16px;
        background: transparent;
        cursor: pointer;
    }

    /* Ruler-tick track — a scale, not a generic slider */
    #controls input[type="range"]::-webkit-slider-runnable-track {
        height: 4px;
        border-radius: 1px;
        background-color: rgba(237, 237, 231, 0.1);
        background-image: repeating-linear-gradient(to right, var(--hairline) 0 1px, transparent 1px calc(100% / 20));
    }

    #controls input[type="range"]::-moz-range-track {
        height: 4px;
        border-radius: 1px;
        background-color: rgba(237, 237, 231, 0.1);
        background-image: repeating-linear-gradient(to right, var(--hairline) 0 1px, transparent 1px calc(100% / 20));
    }

    #controls input[type="range"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 3px;
        height: 16px;
        margin-top: -6px;
        border-radius: 1px;
        background: var(--amber);
        box-shadow: 0 0 0 3px rgba(242, 163, 76, 0.18);
        cursor: pointer;
    }

    #controls input[type="range"]::-moz-range-thumb {
        width: 3px;
        height: 16px;
        border: none;
        border-radius: 1px;
        background: var(--amber);
        box-shadow: 0 0 0 3px rgba(242, 163, 76, 0.18);
        cursor: pointer;
    }

    #controls input:focus-visible {
        outline: 2px solid var(--teal);
        outline-offset: 2px;
    }

    @media (max-width: 480px) {
        #controls {
            top: auto;
            bottom: 0;
            left: 0;
            right: 0;
            width: auto;
            border-radius: 0;
            border-top: 2px solid var(--teal);
        }
    }
    -->
</style>
</head>

<body>
  <div id="map" class="map"></div>
  <div id="controls">
    <div class="plate-label">Building appearance</div>
    <div class="control-row">
      <span class="control-label">Color</span>
      <input type="color" id="building-color" value="#aaaaaa" aria-label="Building material color">
      <span class="control-readout" id="building-color-value">#AAAAAA</span>
    </div>
    <div class="control-divider"></div>
    <div class="control-row">
      <span class="control-label">Opacity</span>
      <input type="range" id="building-opacity" min="0" max="1" step="0.05" value="1" aria-label="Building opacity">
      <span class="control-readout" id="building-opacity-value">1.00</span>
    </div>
  </div>
</body>
<script>
  {% include {{ page.js }} %}
</script>

</html>
