---
layout: null
title: Store Locator
js: store-locator.js
---

<html lang="ja">

<head>
  {% include common_head.html %}
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif;
      overflow: hidden;
    }

    #container {
      display: flex;
      height: 100vh;
      width: 100vw;
      position: relative;
    }

    /* Sidebar styles */
    #sidebar {
      width: 340px;
      background-color: #f8f8f8;
      overflow-y: auto;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
    }

    #sidebar-header {
      padding: 0;
      background-color: #ED1C24;
    }

    .search-container {
      position: relative;
      background-color: #ED1C24;
    }

    #search-box {
      width: 100%;
      padding: 12px 45px 12px 15px;
      border: none;
      border-radius: 0;
      font-size: 15px;
      box-sizing: border-box;
      margin: 0;
      background-color: #ED1C24;
      color: white;
      display: block;
    }

    #search-box::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }

    .search-icon {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #search-suggestions {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      max-height: 300px;
      overflow-y: auto;
      z-index: 1000;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      display: none;
    }

    #search-suggestions.active {
      display: block;
    }

    .suggestion-item {
      padding: 12px 15px;
      cursor: pointer;
      border-bottom: 1px solid #e8e8e8;
      font-size: 14px;
    }

    .suggestion-item:hover {
      background-color: #f5f5f5;
    }

    .suggestion-item.highlighted {
      background-color: #e8f0fe;
    }

    .suggestion-item:last-child {
      border-bottom: none;
    }

    .suggestion-name {
      font-weight: 600;
      color: #333;
      margin-bottom: 4px;
    }

    .suggestion-address {
      font-size: 12px;
      color: #666;
    }

    #clear-filters {
      width: 100%;
      padding: 8px 15px;
      background: none;
      color: white;
      border: none;
      cursor: pointer;
      font-size: 13px;
      margin: 0;
      transition: opacity 0.2s;
      font-weight: 400;
      display: block;
      text-align: right;
    }

    #clear-filters:hover {
      opacity: 0.8;
    }

    /* Pinned to the map's top-right corner, matching the reference site's
       own "新店舗一覧" button exactly (position/colors/shape confirmed by
       inspecting store-info.skylark.co.jp live), including its 10px right
       offset - top-right no longer holds Mapbox's own control stack (zoom
       moved to center-right, geolocate to bottom-right; see initMap()), so
       nothing else needs clearing here anymore. */
    #store-list-link {
      position: absolute;
      top: 22px;
      right: 10px;
      z-index: 5;
      display: flex;
      align-items: center;
      gap: 2px;
      height: 40px;
      padding: 0 8px 0 16px;
      background-color: #ED1C24;
      color: white;
      font-size: 14px;
      text-decoration: none;
      box-shadow: 0 0 3px rgba(0, 0, 0, 0.31);
    }

    #store-list-link svg {
      flex-shrink: 0;
    }

    #lang-toggle {
      display: block;
      width: 100%;
      padding: 0 15px 10px;
      background: none;
      border: none;
      color: white;
      font-size: 12px;
      text-align: right;
      opacity: 0.85;
      cursor: pointer;
      text-decoration: underline;
    }

    #lang-toggle:hover {
      opacity: 1;
    }

    .filter-section {
      background-color: white;
      margin: 0;
      border-radius: 0;
      overflow: hidden;
    }

    .filter-header {
      padding: 15px 20px;
      background-color: white;
      border: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
      font-size: 15px;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #333;
    }

    .filter-header:hover {
      background-color: #fafafa;
    }

    .toggle-icon {
      display: flex;
      align-items: center;
      transition: transform 0.3s ease-out;
    }

    .toggle-icon.expanded {
      transform: rotate(180deg);
    }

    .filter-content {
      padding: 15px 15px 10px 15px;
      display: none;
      background-color: white;
      border-top: 1px solid #f0f0f0;
    }

    .filter-content.active {
      display: flex;
      flex-wrap: wrap;
    }

    #brand-filters {
      flex-direction: column;
      flex-wrap: nowrap;
      align-items: stretch;
    }

    .brand-filter {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      padding: 8px 6px;
      border: none;
      background: none;
      border-radius: 4px;
      width: 100%;
      text-align: left;
      transition: opacity 0.2s, background-color 0.15s;
      opacity: 1;
    }

    .brand-filter:hover {
      background-color: #fafafa;
    }

    /* Once any brand is selected, dim the rest so only selected brands read as "on" */
    #brand-filters.has-selection .brand-filter {
      opacity: 0.4;
    }

    #brand-filters.has-selection .brand-filter.active {
      opacity: 1;
    }

    .brand-icon {
      width: 36px;
      height: 36px;
      object-fit: contain;
      flex-shrink: 0;
      display: block;
    }

    .brand-name {
      font-size: 13px;
      color: #333;
      line-height: 1.2;
    }

    /* Amenity filter (絞り込み検索) styles */
    #amenity-filter-wrapper.active {
      flex-direction: column;
      flex-wrap: nowrap;
    }

    .keyboard-guide-table {
      border-collapse: separate;
      font-size: 13px;
      font-family: "Google Sans Text", Roboto, Arial, sans-serif;
      color: #000;
    }

    .keyboard-guide-table tr {
      height: 32px;
      vertical-align: middle;
    }

    .keyboard-guide-table td {
      padding: 6px;
      vertical-align: middle;
    }

    .keyboard-guide-table td:first-child {
      text-align: end;
      white-space: nowrap;
    }

    .keyboard-guide-table td:last-child {
      text-align: start;
      white-space: nowrap;
    }

    .keyboard-guide-table kbd {
      display: inline-block;
      background-color: #e8eaed;
      border: none;
      border-radius: 2px;
      padding: 2px 4px;
      margin: 0 2px;
      font-family: "Google Sans Text", Roboto, Arial, sans-serif;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px;
      color: #000;
      min-width: 20px;
      text-align: center;
    }

    /* Keyboard shortcuts dialog, opened by the link inside the attribution
       control (customAttribution in initMap()). Styled to match the
       reference site's native Google Maps keyboard-shortcuts <dialog>
       (inspected live: rgb(32,33,36)/0.7 backdrop, 28px radius, no
       box-shadow, 22px/400 title in #3c4043, table-based shortcut rows). */
    #keyboard-guide-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(32, 33, 36, 0.7);
      z-index: 99;
    }

    #keyboard-guide-backdrop.active {
      display: block;
    }

    #keyboard-guide-modal {
      display: none;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 28px;
      box-shadow: none;
      padding: 20px 8px 8px;
      z-index: 100;
      min-width: 280px;
      max-width: calc(100% - 38px);
      max-height: calc(100% - 38px);
      overflow: auto;
    }

    #keyboard-guide-modal.active {
      display: block;
    }

    .kbd-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 16px;
      margin: 0 0 20px;
    }

    #keyboard-guide-title {
      font-size: 22px;
      font-weight: 400;
      color: #3c4043;
    }

    #keyboard-guide-close {
      background: none;
      border: none;
      border-radius: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;
      flex-shrink: 0;
      transition: all 0.2s;
    }

    #keyboard-guide-close:hover {
      background-color: rgba(60, 64, 67, 0.08);
      border-radius: 50%;
    }

    .keyboard-guide-content {
      display: flex;
      padding: 0 16px 16px;
    }

    .amenity-filter-mode {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #f0f0f0;
    }

    .amenity-mode-btn {
      flex: 1;
      padding: 6px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background-color: white;
      color: #666;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }

    .amenity-mode-btn.active {
      background-color: #ED1C24;
      border-color: #ED1C24;
      color: white;
    }

    .amenity-filters {
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;
      align-items: stretch;
    }

    .amenity-filter {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 6px;
      border: none;
      background: none;
      border-radius: 4px;
      cursor: pointer;
      text-align: left;
      width: 100%;
      transition: background-color 0.15s;
    }

    .amenity-filter:hover {
      background-color: #fafafa;
    }

    .amenity-filter.active {
      background-color: rgba(237, 28, 36, 0.08);
    }

    .amenity-filter-icon {
      width: 24px;
      height: 24px;
      object-fit: contain;
      flex-shrink: 0;
    }

    .amenity-filter-name {
      font-size: 13px;
      color: #333;
    }

    .amenity-filter.active .amenity-filter-name {
      font-weight: 600;
      color: #ED1C24;
    }

    .floating-clear-btn {
      position: absolute;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      display: none;
      align-items: center;
      gap: 5px;
      box-sizing: border-box;
      height: 24px;
      background-color: white;
      color: #333;
      border: 1px solid #e5e5e5;
      border-radius: 500px;
      padding: 0 15px;
      font-size: 12px;
      font-weight: 400;
      cursor: pointer;
      box-shadow: 0 1px 4px -1px rgba(0,0,0,0.3);
      z-index: 10;
      transition: background-color 0.2s;
    }

    .floating-clear-btn:hover {
      background-color: #f5f5f5;
    }

    .floating-clear-btn.visible {
      display: flex;
    }

    #route-info-banner {
      position: absolute;
      top: 16px;
      left: 50%;
      transform: translateX(-50%);
      display: none;
      align-items: center;
      gap: 10px;
      background-color: white;
      color: #333;
      border-radius: 6px;
      padding: 8px 14px;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
      z-index: 10;
    }

    #route-info-banner.active {
      display: flex;
    }

    #route-info-banner button {
      background: none;
      border: none;
      color: #666;
      font-size: 16px;
      line-height: 1;
      cursor: pointer;
      padding: 0;
    }

    #store-count {
      padding: 12px 20px;
      background-color: white;
      font-size: 13px;
      font-weight: 500;
      border-top: 1px solid #e0e0e0;
      border-bottom: 1px solid #e0e0e0;
      color: #666;
    }

    #store-list {
      background-color: #f8f8f8;
      padding: 0;
    }

    .empty-state-nearest {
      padding: 24px 20px;
      text-align: center;
      color: #666;
    }

    .empty-state-nearest p {
      margin: 0;
      font-size: 14px;
    }

    /* Nearest-store pointer: a marker pinned to the map's current center
       (not a sidebar button) with a label and an arrow rotated to the
       compass bearing of the nearest store, matching the reference site's
       own empty-viewport treatment. */
    .to-nearest {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      background: none;
      border: none;
      padding: 0;
      font-family: inherit;
    }

    .to-nearest .label {
      background-color: white;
      color: #444;
      padding: 6px 12px;
      border-radius: 14px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
      margin-bottom: 6px;
      transition: 0.2s;
    }

    .to-nearest .direction {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background-color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
      transition: 0.2s;
    }

    .to-nearest .direction svg {
      fill: #ED1C24;
      transition: 0.2s;
    }

    /* Hover inverts the pointer to solid red, same as the reference site */
    .to-nearest:hover .label,
    .to-nearest:hover .direction {
      background-color: #ED1C24;
    }

    .to-nearest:hover .label {
      color: white;
    }

    .to-nearest:hover .direction svg {
      fill: white;
    }

    .store-item {
      background-color: white;
      padding: 16px 20px;
      margin: 0;
      border-bottom: 1px solid #e8e8e8;
      cursor: pointer;
      transition: background-color 0.2s;
      display: flex;
      align-items: flex-start;
    }

    .store-item:hover {
      background-color: #fafafa;
    }

    .store-item:focus-visible {
      outline: 3px solid #2684FF;
      outline-offset: -3px;
      background-color: #fafafa;
    }

    .store-item.active {
      background-color: #fff5f5;
      border-left: 3px solid #ED1C24;
      padding-left: 17px;
    }

    .store-brand-icon {
      width: 36px;
      height: 36px;
      flex-shrink: 0;
      margin-right: 12px;
      object-fit: contain;
      display: block;
    }

    .store-info {
      flex: 1;
      min-width: 0;
    }

    .store-name {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 6px;
      color: #333;
      line-height: 1.3;
    }

    .store-address {
      font-size: 12px;
      color: #888;
      line-height: 1.5;
    }

    /* Map styles */
    #map {
      flex: 1;
      height: 100vh;
    }

    /* This account/style's sources report mapbox_logo:false (an
       account-level flag, not a third-party licensing restriction - even
       the plain Mapbox-hosted composite source has it), so GL JS's own
       LogoControl hides itself. It re-applies that inline display:none on
       every 'sourcedata' event, so this needs !important to actually stick
       rather than a one-time override. */
    .mapboxgl-ctrl-bottom-left .mapboxgl-ctrl:has(.mapboxgl-ctrl-logo) {
      display: block !important;
    }

    /* Zoom controls moved from the map's top-right corner to center-right.
       Mapbox only supports the 4 corners as addControl positions, so this
       re-anchors the control after the fact (see the .zoom-controls-
       center-right class added in initMap()). The top-right corner
       container itself is shrink-wrapped to its content by default (not
       full map height), so top:50% inside it wouldn't center against the
       whole map - stretching it with bottom:0 first fixes that; its other
       child (the geolocate button) stays in normal flow and is unaffected
       by the container simply being taller. */
    .mapboxgl-ctrl-top-right {
      bottom: 0;
    }

    .zoom-controls-center-right {
      position: absolute;
      top: 50%;
      right: 10px;
      margin: 0 !important;
      transform: translateY(-50%) scale(1.2);
    }

    /* Zoom +/- and the recenter (geolocate) button, both sized up 20% -
       transform:scale keeps the icon crisp (vs. resizing the fixed-size
       background-image) at the cost of the layout box staying its
       original 29px size, so each gets its own transform-origin to grow
       away from the map edge/corner it's anchored to rather than over it. */
    .zoom-controls-center-right.map-ctrl-large {
      transform: translateY(-50%) scale(1.2);
      transform-origin: right center;
    }

    .mapboxgl-ctrl-bottom-right .map-ctrl-large {
      transform: scale(1.2);
      transform-origin: bottom right;
    }

    .webgl-fallback {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 40px;
      text-align: center;
      color: #666;
      background-color: #f8f8f8;
      box-sizing: border-box;
    }

    .webgl-fallback p {
      margin: 4px 0;
      font-size: 14px;
    }

    /* Popup styles */
    .mapboxgl-popup {
      /* Above the mobile side-panel drawer/backdrop (z-index 20/15) - those
         are overlays Mapbox's own container-based collision detection
         doesn't know about, so an anchor choice that places the popup low
         can still end up visually behind them without this. */
      z-index: 50;
    }

    .mapboxgl-popup-content {
      padding: 0;
      border-radius: 0;
      overflow: hidden;
      width: 380px;
      max-width: 100%; /* respect Mapbox's own edge-avoidance max-width on the wrapper */
      box-sizing: border-box;
      background: rgba(255, 255, 255, 0.95);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .popup-header {
      background-color: #ED1C24;
      color: white;
      padding: 10px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }

    .popup-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      flex: 1;
    }

    .popup-close {
      background: #fff;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .popup-body {
      padding: 15px;
      background-color: white;
      max-height: 400px;
      overflow-y: auto;
    }

    .popup-section {
      margin-bottom: 12px;
      font-size: 14px;
      display: flex;
      gap: 12px;
    }

    .popup-section:last-child {
      margin-bottom: 0;
    }

    .popup-label {
      font-weight: 600;
      color: #333;
      min-width: 80px;
      flex-shrink: 0;
    }

    .popup-value {
      color: #333;
      line-height: 1.5;
      flex: 1;
    }

    .popup-value-bold {
      font-weight: 500;
      font-size: 18px;
    }

    .popup-value-amenities {
      font-size: 16px;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .popup-value-amenities.expanded {
      -webkit-line-clamp: unset;
      overflow: visible;
    }

    .popup-route-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 6px;
    }

    .popup-route-actions button {
      background: none;
      border: none;
      padding: 0;
      color: rgb(51, 146, 249);
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      cursor: pointer;
      font-family: inherit;
    }

    .popup-route-actions button:hover {
      text-decoration: underline;
    }

    .popup-amenities-toggle {
      background: none;
      border: none;
      padding: 2px 0 0;
      margin: 0;
      color: rgb(51, 146, 249);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }

    .popup-open-status {
      display: inline-block;
      padding: 1px 6px;
      border-radius: 3px;
      font-size: 12px;
      font-weight: 700;
      vertical-align: middle;
    }

    .popup-open-status.is-open {
      background-color: #E6F4EA;
      color: #1E7E34;
    }

    .popup-open-status.is-closed {
      background-color: #F1F1F1;
      color: #666;
    }

    .popup-notice {
      background-color: #FFF3CD;
      color: #664D03;
      border: 1px solid #FFE69C;
      border-radius: 4px;
      padding: 8px 10px;
      font-size: 13px;
      line-height: 1.4;
      margin-bottom: 12px;
    }

    .popup-footer {
      display: flex;
      gap: 10px;
      padding: 10px 16px;
      border-top: 1px solid rgb(239, 239, 239);
      background-color: white;
    }

    .popup-details-btn {
      flex: 1;
      background-color: #ED1C24;
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      text-align: center;
      text-decoration: none;
    }

    .popup-details-btn:hover {
      background-color: #d11920;
    }

    .popup-menu-btn {
      flex: 1;
      display: inline-block;
      background-color: rgb(51, 146, 249);
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      text-align: center;
      text-decoration: none;
    }

    .popup-menu-btn:hover {
      background-color: #2f7fd6;
    }

    .popup-reserve-btn {
      flex: 1;
      display: inline-block;
      background-color: #2E7D32;
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
      text-align: center;
      text-decoration: none;
    }

    .popup-reserve-btn:hover {
      background-color: #276a2b;
    }

    /* Custom marker styles */
    .marker {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 14px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      transition: transform 0.2s;
    }

    .marker:hover {
      transform: scale(1.1);
    }

    .marker.active {
      transform: scale(1.2);
      box-shadow: 0 3px 10px rgba(0,0,0,0.4);
    }

    /* Side-panel open/close tabs + backdrop - mobile only, hidden on desktop */
    #open-side-panel,
    #close-side-panel,
    #sidebar-backdrop {
      display: none;
    }

    /* Mobile responsive - map fills the whole screen; the sidebar (search/
       filters/list - identical content to the desktop side panel) becomes a
       fixed-position drawer that slides in from the left over the map,
       toggled by a red tab, matching the reference site's own pattern. */
    @media (max-width: 768px) {
      #container {
        position: relative;
      }

      /* Keep the whole popup (header+body+footer) comfortably short on
         phones, so it never dominates the smaller viewport. */
      .popup-body {
        max-height: 32vh;
      }

      #sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        width: 340px;
        max-width: 85vw;
        transform: translateX(-100%);
        transition: transform 0.25s ease;
        z-index: 20;
        box-shadow: 2px 0 16px rgba(0, 0, 0, 0.3);
      }

      #container.panel-open #sidebar {
        transform: translateX(0);
      }

      #sidebar-backdrop {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 15;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.25s ease;
      }

      #container.panel-open #sidebar-backdrop {
        opacity: 1;
        pointer-events: auto;
      }

      #open-side-panel,
      #close-side-panel {
        align-items: center;
        justify-content: center;
        gap: 6px;
        top: 16px;
        min-height: 48px;
        padding: 8px 12px 8px 16px;
        background-color: #ED1C24;
        color: white;
        border: none;
        border-radius: 0 24px 24px 0;
        font-size: 16px;
        text-align: center;
        box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
        cursor: pointer;
      }

      /* Default (panel closed): show the "探す" tab pinned to the screen's
         left edge, hide the "閉じる" tab. #container.panel-open flips both.
         Both are fixed to the viewport (siblings of #sidebar, not children -
         nesting #close-side-panel inside #sidebar would put it at the mercy
         of #sidebar's own transform/overflow-y clipping it). */
      #open-side-panel,
      #close-side-panel {
        position: fixed;
        z-index: 21;
      }

      #open-side-panel {
        display: flex;
        left: 0;
        white-space: nowrap; /* "探す" always fits on one line */
      }

      #close-side-panel {
        display: none;
        /* left+right (not a fixed width) so the button is only ever as wide
           as the remaining space next to the panel - "閉じる" wraps to a
           second line instead of overflowing/getting clipped when that
           space is narrow (e.g. panel at its 85vw max-width on a small
           phone). */
        left: min(340px, 85vw); /* matches #sidebar's own width formula */
        right: 4px;
        padding-right: 16px;
      }

      #container.panel-open #open-side-panel {
        display: none;
      }

      #container.panel-open #close-side-panel {
        display: flex;
      }
    }

    /* Scrollbar styling */
    #store-list::-webkit-scrollbar {
      width: 8px;
    }

    #store-list::-webkit-scrollbar-track {
      background: #EEEEEE;
    }

    #store-list::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 4px;
    }

    #store-list::-webkit-scrollbar-thumb:hover {
      background: #999;
    }

    /* Area group marker styles */
    .area-group-marker {
      display: flex;
      cursor: pointer;
      font-size: 12px;
      font-weight: 400;
      border: 1px solid #555;
      border-radius: 2px;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif;
    }

    .area-label {
      background-color: white;
      color: #000;
      padding: 5px 4px;
      line-height: 12px;
      white-space: nowrap;
    }

    .area-count {
      background-color: #ED1C24;
      color: white;
      padding: 5px 4px;
      line-height: 12px;
      white-space: nowrap;
      min-width: 20px;
      text-align: center;
    }
  </style>
</head>

<body>
  <div id="container">
    <button id="open-side-panel" class="side-panel-tab" type="button">
      <span>探す</span>
      <svg width="20" height="20" viewBox="0 0 20 20">
        <circle fill="none" stroke="white" stroke-width="1.1" cx="9" cy="9" r="7"></circle>
        <path fill="none" stroke="white" stroke-width="1.1" d="M14,14 L18,18 L14,14 Z"></path>
      </svg>
    </button>
    <div id="sidebar-backdrop"></div>
    <button id="close-side-panel" class="side-panel-tab" type="button">
      <span>閉じる</span>
    </button>
    <div id="sidebar">
      <div id="sidebar-header">
        <div class="search-container">
          <input type="text" id="search-box" name="search" placeholder="ブランド・地名・駅名で探す" autocomplete="off">
          <span class="search-icon">
            <svg width="20" height="20" viewBox="0 0 20 20">
              <circle fill="none" stroke="white" stroke-width="1.1" cx="9" cy="9" r="7"></circle>
              <path fill="none" stroke="white" stroke-width="1.1" d="M14,14 L18,18 L14,14 Z"></path>
            </svg>
          </span>
          <div id="search-suggestions"></div>
        </div>
        <button id="clear-filters">条件をクリアする</button>
        <button id="lang-toggle" type="button">English</button>

        <div class="filter-section">
          <button class="filter-header" id="brand-filter-toggle">
            <span class="btn-label">ブランドを選ぶ</span>
            <span class="toggle-icon">
              <svg width="12" height="12" viewBox="0 0 12 12">
                <polyline fill="none" stroke="#000" stroke-width="1.1" points="1 3.5 6 8.5 11 3.5"></polyline>
              </svg>
            </span>
          </button>
          <div class="filter-content" id="brand-filters">
            <!-- Brand filters will be populated dynamically -->
          </div>
        </div>

        <div class="filter-section">
          <button class="filter-header" id="amenity-filter-toggle">
            <span class="btn-label">絞り込み検索</span>
            <span class="toggle-icon">
              <svg width="12" height="12" viewBox="0 0 12 12">
                <polyline fill="none" stroke="#000" stroke-width="1.1" points="1 3.5 6 8.5 11 3.5"></polyline>
              </svg>
            </span>
          </button>
          <div class="filter-content" id="amenity-filter-wrapper">
            <div class="amenity-filter-mode" id="amenity-filter-mode">
              <button class="amenity-mode-btn active" id="amenity-mode-and" type="button">すべて満たす</button>
              <button class="amenity-mode-btn" id="amenity-mode-or" type="button">いずれか満たす</button>
            </div>
            <div class="amenity-filters" id="amenity-filters">
              <!-- Amenity filters will be populated dynamically -->
            </div>
          </div>
        </div>

      </div>

      <div id="store-count">0件見つかりました</div>
      <div id="store-list">
        <!-- Store items will be populated dynamically -->
      </div>
    </div>

    <!-- R062: not aria-hidden - confirmed by inspecting Google Maps JS API's
         own source (maps.googleapis.com/.../common.js) that the reference
         site's map div is never hidden from assistive tech; it's a single
         focusable role="region" (Mapbox GL JS gives its own canvas the same
         role="region"/tabindex="0" by default), with a description pointing
         at the keyboard-shortcuts content - see initMap()/toggleUiLanguage()
         where the canvas's aria-label/aria-roledescription/aria-describedby
         get set up to mirror that exactly. -->
    <div id="map"></div>

    <a id="store-list-link" href="store-list.html">
      <span>新店舗一覧</span>
      <svg width="24" height="24" viewBox="0 0 24 24">
        <path fill="white" d="M9.4 18L8 16.6l4.6-4.6L8 7.4 9.4 6l6 6z"></path>
      </svg>
    </a>

    <!-- Keyboard shortcuts (R061): the clickable link itself lives inside
         the map's attribution control (added via customAttribution in
         initMap()), alongside the data/terms/report-error links. Clicking
         it opens this centered dialog. -->
    <div id="keyboard-guide-backdrop"></div>
    <div id="keyboard-guide-modal" role="dialog" aria-modal="true" aria-labelledby="keyboard-guide-title">
      <div class="kbd-modal-header">
        <span id="keyboard-guide-title">キーボードショートカット</span>
        <button id="keyboard-guide-close" type="button" aria-label="閉じる">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#000" d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
          </svg>
        </button>
      </div>
      <div class="keyboard-guide-content">
        <table class="keyboard-guide-table">
          <tbody>
            <tr id="kbd-guide-left"><td><kbd>←</kbd></td><td>左へ移動</td></tr>
            <tr id="kbd-guide-right"><td><kbd>→</kbd></td><td>右へ移動</td></tr>
            <tr id="kbd-guide-up"><td><kbd>↑</kbd></td><td>上へ移動</td></tr>
            <tr id="kbd-guide-down"><td><kbd>↓</kbd></td><td>下へ移動</td></tr>
            <tr id="kbd-guide-zoomin"><td><kbd>+</kbd></td><td>ズームイン</td></tr>
            <tr id="kbd-guide-zoomout"><td><kbd>-</kbd></td><td>ズームアウト</td></tr>
            <tr id="kbd-guide-home"><td><kbd>Home</kbd></td><td>ビューを 75% 左へ移動</td></tr>
            <tr id="kbd-guide-end"><td><kbd>End</kbd></td><td>ビューを 75% 右へ移動</td></tr>
            <tr id="kbd-guide-pageup"><td><kbd>Page Up</kbd></td><td>ビューを 75% 上へ移動</td></tr>
            <tr id="kbd-guide-pagedown"><td><kbd>Page Down</kbd></td><td>ビューを 75% 下へ移動</td></tr>
          </tbody>
        </table>
      </div>
    </div>
    <div id="route-info-banner"></div>
    <button id="floating-clear-filters" class="floating-clear-btn">
      <svg width="10" height="10" viewBox="0 0 20 20">
        <path fill="none" stroke="#333" stroke-width="1.5" d="M16,16 L4,4"></path>
        <path fill="none" stroke="#333" stroke-width="1.5" d="M16,4 L4,16"></path>
      </svg>
      条件をクリアする
    </button>
  </div>

  <script>
    {% include {{ page.js }} %}
  </script>
</body>

</html>
