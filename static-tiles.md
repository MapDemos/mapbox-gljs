---
layout: null
title: Static Tiles Demo
js: static-tiles.js
---

<html lang="ja">

<head>
  {% include common_head.html %}
  <style>
    {% include common.css %}

    .layer-toggle {
      position: absolute;
      top: 20px;
      left: 20px;
      background: #ffffff;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06);
      z-index: 1;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Source Sans Pro', sans-serif;
      min-width: 260px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 0, 0, 0.04);
    }

    .layer-toggle h3 {
      margin: 0 0 16px 0;
      font-size: 15px;
      font-weight: 600;
      background: none;
      color: #1a1a1a;
      padding: 0;
      letter-spacing: -0.01em;
      text-transform: uppercase;
      font-size: 11px;
      color: #6b7280;
      font-weight: 700;
    }

    /* Hide default radio buttons */
    .layer-toggle input[type="radio"] {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }

    /* Custom toggle button style */
    .layer-toggle label {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      margin: 0 0 8px 0;
      cursor: pointer;
      color: #9ca3af;
      background: #f9fafb;
      border-radius: 8px;
      border: 2px solid #e5e7eb;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
      font-size: 14px;
      font-weight: 500;
      opacity: 0.6;
    }

    .layer-toggle label:last-of-type {
      margin-bottom: 0;
    }

    /* Icon styling */
    .layer-toggle label::before {
      content: '';
      width: 20px;
      height: 20px;
      margin-right: 12px;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      opacity: 0.6;
      transition: opacity 0.2s ease;
      flex-shrink: 0;
    }

    /* Satellite icon */
    #satellite-layer-radio + label::before {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234b5563' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z'/%3E%3C/svg%3E");
    }

    /* Map icon */
    #static-layer-radio + label::before {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234b5563' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7'/%3E%3C/svg%3E");
    }

    /* Hover state */
    .layer-toggle label:hover {
      background: #f3f4f6;
      border-color: #e5e7eb;
      transform: translateY(-1px);
    }

    .layer-toggle label:hover::before {
      opacity: 0.8;
    }

    /* Active/checked state */
    .layer-toggle input[type="radio"]:checked + label {
      background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
      color: #ffffff;
      border-color: #4f46e5;
      box-shadow: 0 8px 20px rgba(79, 70, 229, 0.4), 0 4px 8px rgba(79, 70, 229, 0.3);
      transform: translateY(-2px);
      opacity: 1;
      font-weight: 600;
    }

    .layer-toggle input[type="radio"]:checked + label::before {
      opacity: 1;
      filter: brightness(0) invert(1);
    }

    /* Active state animation */
    .layer-toggle input[type="radio"]:checked + label::after {
      content: '';
      position: absolute;
      top: 50%;
      right: 14px;
      width: 6px;
      height: 6px;
      background: #ffffff;
      border-radius: 50%;
      transform: translateY(-50%);
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    /* Focus state for accessibility */
    .layer-toggle input[type="radio"]:focus + label {
      outline: 2px solid #4f46e5;
      outline-offset: 2px;
    }

    /* Pressed state */
    .layer-toggle label:active {
      transform: translateY(0);
    }

    /* Dropdown styling */
    .projection-dropdown {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
    }

    .projection-dropdown label {
      display: block;
      margin-bottom: 8px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: #6b7280;
      letter-spacing: -0.01em;
    }

    .projection-dropdown select {
      width: 100%;
      padding: 10px 12px;
      background: #f9fafb;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      color: #1a1a1a;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234b5563' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 10px center;
      background-size: 20px;
      padding-right: 40px;
    }

    .projection-dropdown select:hover {
      background-color: #f3f4f6;
      border-color: #d1d5db;
    }

    .projection-dropdown select:focus {
      outline: 2px solid #4f46e5;
      outline-offset: 2px;
      border-color: #4f46e5;
      background-color: #ffffff;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .layer-toggle {
        min-width: 240px;
        padding: 16px;
      }

      .layer-toggle label {
        padding: 10px 14px;
        font-size: 13px;
      }
    }
  </style>
</head>

<body>
  <div id="map" class="map"></div>

  <div class="layer-toggle">
    <h3>Style Controls</h3>

    <label>
      <input type="radio" name="layer-select" id="satellite-layer-radio" value="satellite">
      <span>Satellite Imagery</span>
    </label>

    <label>
      <input type="radio" name="layer-select" id="static-layer-radio" value="static" checked>
      <span>Streets</span>
    </label>

    <div class="projection-dropdown">
      <label for="projection-select">Map Projection</label>
      <select id="projection-select">
        <option value="mercator" selected>Mercator</option>
        <option value="globe">Globe</option>
        <option value="equalEarth">Equal Earth</option>
        <option value="naturalEarth">Natural Earth</option>
        <option value="winkelTripel">Winkel Tripel</option>
        <option value="albers">Albers</option>
        <option value="lambertConformalConic">Lambert Conformal Conic</option>
        <option value="equirectangular">Equirectangular</option>
      </select>
    </div>
  </div>
</body>
<script>
  {% include {{ page.js }} %}
</script>

</html>
