---
layout: null
title: Travel Highlights 2024
---

<html>
<head>
  <meta charset="utf-8">
  <title>Travel Highlights 2024</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  {% include common_head.html %}
  <script src="https://unpkg.com/@turf/turf@6/turf.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/country-code-emoji@latest/dist/country-code-emoji.umd.min.js"></script>
  <style>
    html, body {
      margin: 0;
      padding: 0;
    }

    body {
      display: flex;
      height: 100vh;
      overflow: hidden;
    }

    /* Left menu panel */
    #left-menu {
      width: 300px;
      height: 100vh;
      background: rgba(30, 30, 40, 0.95);
      backdrop-filter: blur(10px);
      display: flex;
      flex-direction: column;
      padding: 20px;
      box-shadow: 2px 0 20px rgba(0,0,0,0.3);
      overflow-y: auto;
      flex-shrink: 0;
      box-sizing: border-box;
    }

    #map {
      flex: 1;
      position: relative;
      height: 100vh;
    }

    #left-menu h2 {
      color: white;
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 20px 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }

    #tour-title-input {
      width: 100%;
      padding: 10px 12px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: white;
      font-size: 20px;
      font-weight: 700;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      box-sizing: border-box;
      margin-bottom: 20px;
    }

    #tour-title-input:focus {
      outline: none;
      border-color: #667eea;
      background: rgba(255, 255, 255, 0.15);
    }

    #left-menu .menu-section {
      margin-bottom: 15px;
    }

    #routes-list {
      margin-bottom: 10px;
    }

    #add-route-btn {
      margin-bottom: 0;
    }

    #left-menu .menu-section h3 {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      font-weight: 600;
      margin: 0 0 10px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }

    /* Route info panel */
    #route-info-panel {
      position: absolute;
      top: 20px;
      left: 20px;
      background: rgba(0, 0, 0, 0.85);
      padding: 20px 25px;
      border-radius: 12px;
      color: white;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.5s;
      pointer-events: none;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }

    #route-info-panel.show {
      opacity: 1;
    }

    .route-info-line {
      display: flex;
      align-items: center;
      margin-bottom: 15px;
      font-size: 18px;
      font-weight: 600;
    }

    .route-info-flag {
      font-size: 20px;
      margin-right: 8px;
    }

    .route-info-name {
      color: white;
      margin-right: 12px;
    }

    .route-info-arrow {
      color: rgba(255, 255, 255, 0.5);
      margin: 0 12px;
    }

    .route-info-distance {
      color: #667eea;
      font-size: 28px;
      font-weight: 700;
      text-align: center;
    }

    #distance-counter {
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 15px 30px;
      border-radius: 10px;
      font-size: 28px;
      font-weight: 700;
      z-index: 1000;
      pointer-events: none;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      letter-spacing: 1px;
    }

    #distance-counter span {
      font-size: 16px;
      color: rgba(255, 255, 255, 0.7);
      margin-left: 5px;
      font-weight: 400;
    }

    /* Completion Modal */
    #completion-modal {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(30, 30, 40, 0.98);
      backdrop-filter: blur(20px);
      padding: 40px;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      z-index: 2000;
      display: none;
      width: 550px;
      max-height: 80vh;
      overflow-y: auto;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .modal-close-icon {
      position: absolute;
      top: 15px;
      right: 15px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      font-size: 32px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      transition: all 0.2s;
      padding: 0;
    }

    .modal-close-icon:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: rotate(90deg);
    }

    #completion-modal.show {
      display: block;
      animation: modalFadeIn 0.5s ease-out;
    }

    @keyframes modalFadeIn {
      from {
        opacity: 0;
        transform: translate(-50%, -45%);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%);
      }
    }

    #completion-modal h2 {
      color: white;
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 10px 0;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }

    #completion-modal .subtitle {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      text-align: center;
      margin-bottom: 30px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }

    .route-summary {
      background: rgba(255, 255, 255, 0.05);
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }

    .route-summary-name {
      color: white;
      font-size: 14px;
      flex: 1;
    }

    .route-summary-distance {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      font-weight: 600;
      margin-left: 20px;
    }

    .total-summary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      border-radius: 12px;
      margin-top: 20px;
      text-align: center;
    }

    .total-summary-label {
      color: rgba(255, 255, 255, 0.9);
      font-size: 14px;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }

    .total-summary-value {
      color: white;
      font-size: 36px;
      font-weight: 700;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }

    #completion-modal .close-btn {
      width: 100%;
      padding: 14px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 20px;
      transition: all 0.2s;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }

    #completion-modal .close-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    /* Confetti */
    .confetti {
      position: absolute;
      width: 10px;
      height: 10px;
      background: #f0f;
      pointer-events: none;
      z-index: 1999;
    }

    @keyframes confettiFall {
      to {
        transform: translateY(100vh) translateX(var(--drift)) rotate(720deg);
        opacity: 0;
      }
    }

    .btn {
      width: 100%;
      padding: 12px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      margin-bottom: 10px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }

    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    /* Control point marker styles */
    .control-point-marker {
      width: 20px;
      height: 20px;
      background: white;
      border: 3px solid #667eea;
      border-radius: 50%;
      cursor: move;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      transition: all 0.2s;
    }

    .control-point-marker:hover {
      width: 24px;
      height: 24px;
      border-width: 4px;
      box-shadow: 0 3px 12px rgba(102, 126, 234, 0.5);
    }

    .control-point-marker.train {
      border-color: #ff0000;
    }

    .control-point-marker.plane {
      border-color: #ffffff;
    }

    .control-point-marker.car {
      border-color: #ff8800;
    }

    /* Route list styles */
    .route-item {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 8px;
      border-left: 3px solid #667eea;
      transition: all 0.2s;
      cursor: grab;
      user-select: none;
    }

    .route-item:hover {
      background: rgba(255, 255, 255, 0.08);
      transform: translateX(2px);
    }

    .route-item.dragging {
      opacity: 0.5;
      cursor: grabbing;
    }

    .route-item.drag-over {
      border-top: 2px solid #667eea;
      margin-top: 8px;
    }

    .route-item.plane {
      border-left-color: #ffffff;
    }

    .route-item.train {
      border-left-color: #ff0000;
    }

    .route-item.car {
      border-left-color: #ff8800;
    }

    /* Route actions container */
    .route-actions-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    /* Insert route button */
    .insert-route-btn {
      padding: 4px 8px;
      background: rgba(102, 126, 234, 0.08);
      border: 1px solid rgba(102, 126, 234, 0.3);
      border-radius: 4px;
      color: #667eea;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
    }

    .insert-route-btn:hover {
      background: rgba(102, 126, 234, 0.15);
      border-color: rgba(102, 126, 234, 0.5);
      color: #8b9ef8;
    }

    .route-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .route-info {
      flex: 1;
    }

    .route-destinations {
      color: white;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 4px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }

    .route-vehicle {
      color: rgba(255, 255, 255, 0.6);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }

    .route-actions {
      display: flex;
      gap: 4px;
    }

    .route-btn {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }

    .route-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .route-btn.delete {
      background: rgba(220, 38, 38, 0.2);
    }

    .route-btn.delete:hover {
      background: rgba(220, 38, 38, 0.4);
    }

    #routes-list {
      max-height: 400px;
      overflow-y: auto;
      margin-bottom: 12px;
    }

    #routes-list::-webkit-scrollbar {
      width: 6px;
    }

    #routes-list::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 3px;
    }

    #routes-list::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 3px;
    }

    #routes-list::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }

    /* Edit route modal */
    .modal-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      z-index: 10000;
      align-items: center;
      justify-content: center;
    }

    .modal-overlay.show {
      display: flex;
    }

    .modal {
      background: rgba(30, 30, 40, 0.98);
      border-radius: 12px;
      padding: 24px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    }

    .modal h3 {
      color: white;
      margin: 0 0 20px 0;
      font-size: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-group label {
      display: block;
      color: rgba(255, 255, 255, 0.7);
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 10px 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: white;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      box-sizing: border-box;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: #667eea;
      background: rgba(255, 255, 255, 0.08);
    }

    .modal-actions {
      display: flex;
      gap: 8px;
      margin-top: 20px;
    }

    .modal-actions button {
      flex: 1;
      padding: 10px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }

    .modal-actions .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .modal-actions .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .modal-actions .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .modal-actions .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    /* Custom Autocomplete Styles */
    .city-input-wrapper {
      display: flex;
      gap: 8px;
      align-items: center;
    }

    .autocomplete-wrapper {
      position: relative;
      flex: 1;
    }

    .autocomplete-wrapper input[type="text"] {
      width: 100%;
      padding: 12px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: white;
      font-size: 14px;
      box-sizing: border-box;
    }

    .autocomplete-wrapper input[type="text"]:focus {
      outline: none;
      border-color: rgba(102, 126, 234, 0.6);
      background: rgba(255, 255, 255, 0.15);
    }

    .autocomplete-wrapper input[type="text"]::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    .flag-display {
      width: 50px;
      height: 46px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      font-size: 24px;
      flex-shrink: 0;
    }

    .suggestions-dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: rgba(30, 30, 40, 0.98);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      margin-top: 4px;
      max-height: 200px;
      overflow-y: auto;
      z-index: 1000;
      display: none;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .suggestions-dropdown.show {
      display: block;
    }

    .suggestion-item {
      padding: 12px;
      cursor: pointer;
      color: white;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      transition: background 0.2s;
    }

    .suggestion-item:last-child {
      border-bottom: none;
    }

    .suggestion-item:hover {
      background: rgba(102, 126, 234, 0.2);
    }

    .suggestion-item .suggestion-name {
      font-weight: 600;
      font-size: 14px;
    }

    .suggestion-item .suggestion-place {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
      margin-top: 2px;
    }

    /* Mobile menu toggle button */
    #mobile-menu-toggle {
      display: none;
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 1001;
      background: rgba(30, 30, 40, 0.95);
      border: none;
      color: white;
      font-size: 24px;
      width: 45px;
      height: 45px;
      border-radius: 10px;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }

    #mobile-menu-toggle:hover {
      background: rgba(40, 40, 50, 0.95);
    }

    /* Mobile menu close button */
    #mobile-menu-close {
      display: none;
      position: absolute;
      top: 15px;
      right: 15px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      font-size: 24px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      z-index: 1;
      transition: all 0.2s;
    }

    #mobile-menu-close:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: rotate(90deg);
    }

    /* Edit mode overlay on map */
    #edit-mode-overlay {
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.85);
      color: white;
      padding: 14px 28px;
      border-radius: 10px;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      z-index: 999; /* Below mobile menu (1000) */
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      max-width: 90%;
      text-align: center;
      pointer-events: none; /* Don't block map interactions */
    }

    /* Map selection overlay */
    #map-select-overlay {
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 100, 200, 0.95);
      color: white;
      padding: 14px 28px;
      border-radius: 10px;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      z-index: 999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      max-width: 90%;
      text-align: center;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    /* Show/hide instructions based on device */
    .mobile-info {
      display: none;
    }

    @media (max-width: 768px) {
      .desktop-info {
        display: none;
      }
      .mobile-info {
        display: inline;
      }

      #edit-mode-overlay {
        top: 80px; /* Below hamburger menu */
        font-size: 13px;
        padding: 10px 16px;
      }

      #map-select-overlay {
        top: 80px; /* Below hamburger menu */
        font-size: 13px;
        padding: 10px 16px;
        flex-direction: column;
        gap: 10px;
      }

      #map-select-overlay button {
        margin-left: 0;
        width: 100%;
      }
    }

    /* Mobile styles */
    @media (max-width: 768px) {
      body {
        flex-direction: column;
      }

      #mobile-menu-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      #mobile-menu-close {
        display: block;
      }

      #left-menu {
        position: fixed;
        left: -100%;
        top: 0;
        height: 100vh;
        width: 100% !important; /* Override the 300px from desktop */
        max-width: 100%;
        z-index: 1000;
        transition: left 0.3s ease-in-out;
        box-sizing: border-box;
        overflow-y: auto;
        padding: 60px 20px 20px 20px; /* Add top padding for close button */
      }

      #left-menu.active {
        left: 0;
      }

      /* Overlay for mobile menu */
      #menu-overlay {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
      }

      #menu-overlay.active {
        display: block;
      }

      #map {
        width: 100%;
        height: 100vh;
      }

      /* Adjust route info panel for mobile */
      #route-info-panel {
        top: 80px;
        left: 10px;
        right: 10px;
        padding: 12px 15px;
      }

      .route-info-line {
        font-size: 14px;
      }

      .route-info-flag {
        font-size: 16px;
        margin-right: 6px;
      }

      .route-info-name {
        margin-right: 8px;
      }

      .route-info-arrow {
        margin: 0 8px;
      }

      .route-info-distance {
        font-size: 22px;
      }

      /* Adjust distance counter for mobile */
      #distance-counter {
        top: 20px;
        right: 10px;
        padding: 10px 20px;
        font-size: 20px;
      }

      #distance-counter span {
        font-size: 14px;
      }

      /* Adjust completion modal for mobile */
      #completion-modal {
        width: 90%;
        max-width: 400px;
        padding: 30px 20px;
        max-height: 90vh;
      }

      #completion-modal h2 {
        font-size: 24px;
      }

      .total-summary-value {
        font-size: 28px;
      }

      /* Adjust edit modal for mobile */
      .modal {
        width: 90%;
        max-width: 400px;
        padding: 20px;
        max-height: 85vh;
      }

      /* Touch-friendly button sizes */
      .btn {
        padding: 14px 20px;
        font-size: 16px;
        min-height: 48px;
      }

      .route-card {
        padding: 12px;
      }

      /* Adjust vehicle buttons for mobile */
      .vehicle-btn {
        width: 60px;
        height: 60px;
        font-size: 24px;
      }
    }

    /* Tablet styles */
    @media (max-width: 1024px) and (min-width: 769px) {
      #left-menu {
        width: 280px;
      }

      #route-info-panel {
        padding: 18px 22px;
      }

      .route-info-line {
        font-size: 17px;
      }

      .route-info-distance {
        font-size: 26px;
      }

      #distance-counter {
        font-size: 24px;
      }
    }

    /* Small mobile styles */
    @media (max-width: 480px) {
      #left-menu {
        width: 100%;
        max-width: 100%;
      }

      #route-info-panel {
        padding: 10px 12px;
      }

      .route-info-line {
        font-size: 13px;
        margin-bottom: 10px;
      }

      .route-info-flag {
        font-size: 14px;
      }

      .route-info-distance {
        font-size: 20px;
      }

      #tour-title-input {
        font-size: 18px;
      }

      .route-summary-name {
        font-size: 13px;
      }

      .total-summary-value {
        font-size: 24px;
      }
    }
  </style>
</head>
<body>
  <!-- Mobile menu toggle button -->
  <button id="mobile-menu-toggle" onclick="toggleMobileMenu()">☰</button>

  <!-- Overlay for mobile menu -->
  <div id="menu-overlay" onclick="closeMobileMenu()"></div>

  <div id="left-menu">
    <button id="mobile-menu-close" onclick="closeMobileMenu()">✕</button>
    <input type="text" id="tour-title-input" value="Travel Highlights" placeholder="Enter tour title...">

    <div class="menu-section">
      <h3>Controls</h3>
      <div style="margin-bottom: 12px;">
        <label style="display: flex; align-items: center; color: white; font-size: 14px; cursor: pointer;">
          <input type="checkbox" id="record-checkbox" style="margin-right: 8px; width: 18px; height: 18px; cursor: pointer;">
          <span>Record tour as video</span>
        </label>
      </div>
      <button id="start-btn" class="btn" onclick="saveAndStartTour()">Save & Start Tour</button>
      <button id="edit-btn" class="btn" onclick="enterEditMode()" style="display: none;">Edit Routes</button>
    </div>


    <div class="menu-section">
      <h3>Routes</h3>
      <div id="routes-list"></div>
      <button id="add-route-btn" class="btn" onclick="addNewRoute()">+ Add Route</button>
    </div>
  </div>
  <div id="map">
    <div id="route-info-panel"></div>
    <div id="distance-counter">0 <span>km</span></div>

    <!-- Edit Mode Instructions Overlay -->
    <div id="edit-mode-overlay" style="display: none;">
      <span class="desktop-info">Click on a route line to add control points. Right-click markers to delete them.</span>
      <span class="mobile-info">Tap on a route line to add waypoints. Long-press markers to delete them.</span>
    </div>

    <!-- Map Selection Mode Overlay -->
    <div id="map-select-overlay" style="display: none;">
      <span>Click on the map to select: <strong id="selection-type">Origin</strong></span>
      <button onclick="cancelMapSelection()" style="margin-left: 20px; padding: 5px 10px; background: #ff4444; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
    </div>

    <!-- Completion Modal -->
    <div id="completion-modal">
      <button onclick="closeCompletionModal()" class="modal-close-icon">&times;</button>
      <h2 id="completion-modal-title" style="color: white; margin: 0 0 24px 0; font-size: 28px; text-align: center;">Tour Complete!</h2>
      <div id="routes-summary"></div>
      <div class="total-summary">
        <div id="total-distance" style="color: white; font-size: 32px; font-weight: bold;"></div>
      </div>
    </div>
  </div>

  <!-- Edit Route Modal -->
  <div id="edit-route-modal" class="modal-overlay">
    <div class="modal">
      <h3 id="modal-title">Edit Route</h3>
      <button id="map-select-btn" class="btn" onclick="startMapSelectionFromModal()" style="width: 100%; margin-bottom: 15px; background: #0066cc;">
        📍 Select Locations on Map
      </button>
      <div class="form-group">
        <label>Origin Location</label>
        <div class="city-input-wrapper">
          <div class="autocomplete-wrapper">
            <input type="text" id="route-origin-input" placeholder="Search for a city..." autocomplete="off">
            <div id="origin-suggestions" class="suggestions-dropdown"></div>
          </div>
          <div class="flag-display" id="route-origin-flag"></div>
        </div>
        <input type="hidden" id="route-origin-name">
        <input type="hidden" id="route-origin-coords">
        <input type="hidden" id="route-origin-flag-value">
      </div>
      <div class="form-group">
        <label>Destination Location</label>
        <div class="city-input-wrapper">
          <div class="autocomplete-wrapper">
            <input type="text" id="route-destination-input" placeholder="Search for a city..." autocomplete="off">
            <div id="destination-suggestions" class="suggestions-dropdown"></div>
          </div>
          <div class="flag-display" id="route-destination-flag"></div>
        </div>
        <input type="hidden" id="route-destination">
        <input type="hidden" id="route-coords">
        <input type="hidden" id="route-destination-flag-value">
      </div>
      <div class="form-group">
        <label>Vehicle</label>
        <select id="route-vehicle">
          <option value="plane">Plane</option>
          <option value="train">Train</option>
          <option value="car">Car</option>
          <option value="ship">Ship</option>
        </select>
      </div>
      <div class="modal-actions">
        <button class="btn-secondary" onclick="closeEditModal()">Cancel</button>
        <button class="btn-primary" onclick="saveRoute()">Save</button>
      </div>
    </div>
  </div>

  <script>
    // Mobile menu functions
    function toggleMobileMenu() {
      const menu = document.getElementById('left-menu');
      const overlay = document.getElementById('menu-overlay');
      const distanceCounter = document.getElementById('distance-counter');
      const routeInfoPanel = document.getElementById('route-info-panel');
      const editModeOverlay = document.getElementById('edit-mode-overlay');

      menu.classList.toggle('active');
      overlay.classList.toggle('active');

      // Hide map overlays when menu is open on mobile
      if (window.innerWidth <= 768) {
        if (menu.classList.contains('active')) {
          distanceCounter.style.display = 'none';
          if (routeInfoPanel) {
            routeInfoPanel.style.display = 'none';
          }
          // Hide edit mode overlay when menu is open
          if (editModeOverlay && editModeOverlay.style.display === 'block') {
            editModeOverlay.dataset.wasVisible = 'true';
            editModeOverlay.style.display = 'none';
          }
        } else {
          distanceCounter.style.display = '';
          if (routeInfoPanel) {
            routeInfoPanel.style.display = '';
          }
          // Restore edit mode overlay if it was visible before
          if (editModeOverlay && editModeOverlay.dataset.wasVisible === 'true') {
            editModeOverlay.style.display = 'block';
            delete editModeOverlay.dataset.wasVisible;
          }
        }
      }
    }

    function closeMobileMenu() {
      const menu = document.getElementById('left-menu');
      const overlay = document.getElementById('menu-overlay');
      const distanceCounter = document.getElementById('distance-counter');
      const routeInfoPanel = document.getElementById('route-info-panel');
      const editModeOverlay = document.getElementById('edit-mode-overlay');

      menu.classList.remove('active');
      overlay.classList.remove('active');

      // Show map overlays when menu is closed on mobile
      if (window.innerWidth <= 768) {
        if (totalAccumulatedDistance > 0) {
          distanceCounter.style.display = '';
        }
        if (routeInfoPanel) {
          routeInfoPanel.style.display = '';
        }
        // Restore edit mode overlay if it was visible before
        if (editModeOverlay && editModeOverlay.dataset.wasVisible === 'true') {
          editModeOverlay.style.display = 'block';
          delete editModeOverlay.dataset.wasVisible;
        }
      }
    }

    // Close mobile menu when window is resized to desktop
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        closeMobileMenu();
      }
    });

    // Asset helper function
    function asset(uri) {
      return `https://docs.mapbox.com/mapbox-gl-js/assets/${uri}`;
    }

    const airplaneModelUri = asset('airplane.glb');
    const trainModelUri = 'https://kenji-shima.github.io/resource-files/models/tram.glb';
    const carModelUri = asset('ego_car.glb');
    const shipModelUri = 'https://kenji-shima.github.io/resource-files/models/cruiser.glb';

    // Define your travel routes - each route is independent with explicit origin and destination
    // Each route has: origin (name, coords), destination (name, coords), vehicle type
    const destinations = [
  { origin: { name: 'Osaka', coords: [135.50078, 34.683594], flag: '🇯🇵' }, name: 'Tokyo', coords: [139.692912, 35.688985], flag: '🇯🇵', vehicle: 'train' },
  { origin: { name: 'Tokyo', coords: [139.692912, 35.688985], flag: '🇯🇵' }, name: 'San Francisco', coords: [-122.419359, 37.779238], flag: '🇺🇸', vehicle: 'plane' },
  { origin: { name: 'San Francisco', coords: [-122.419359, 37.779238], flag: '🇺🇸' }, name: 'Phoenix', coords: [-112.075098, 33.44823], flag: '🇺🇸', vehicle: 'plane' },
  { origin: { name: 'Phoenix', coords: [-112.075098, 33.44823], flag: '🇺🇸' }, name: 'Mexico City', coords: [-99.133178, 19.43263], flag: '🇲🇽', vehicle: 'plane' },
  { origin: { name: 'Mexico City', coords: [-99.133178, 19.43263], flag: '🇲🇽' }, name: 'San Francisco', coords: [-122.419359, 37.779238], flag: '🇺🇸', vehicle: 'plane' },
  { origin: { name: 'San Francisco', coords: [-122.419359, 37.779238], flag: '🇺🇸' }, name: 'Tokyo', coords: [139.692912, 35.688985], flag: '🇯🇵', vehicle: 'plane' },
  { origin: { name: 'Tokyo', coords: [139.692912, 35.688985], flag: '🇯🇵' }, name: 'Bangkok', coords: [100.493509, 13.752494], flag: '🇹🇭', vehicle: 'plane' },
  { origin: { name: 'Bangkok', coords: [100.493509, 13.752494], flag: '🇹🇭' }, name: 'Pattaya', coords: [100.88204, 12.931045], flag: '🇹🇭', vehicle: 'car' },
  { origin: { name: 'Pattaya', coords: [100.88204, 12.931045], flag: '🇹🇭' }, name: 'Bangkok', coords: [100.493509, 13.752494], flag: '🇹🇭', vehicle: 'car' },
  { origin: { name: 'Bangkok', coords: [100.493509, 13.752494], flag: '🇹🇭' }, name: 'Phra Nakhon Si Ayutthaya', coords: [100.566666, 14.350473], flag: '🇹🇭', vehicle: 'car' },
  { origin: { name: 'Phra Nakhon Si Ayutthaya', coords: [100.566666, 14.350473], flag: '🇹🇭' }, name: 'Bangkok', coords: [100.493509, 13.752494], flag: '🇹🇭', vehicle: 'car' },
  // { origin: { name: 'Bangkok', coords: [100.493509, 13.752494], flag: '🇹🇭' }, name: 'Kanchanaburi', coords: [99.532317, 14.022707], flag: '🇹🇭', vehicle: 'car' },
  // { origin: { name: 'Kanchanaburi', coords: [99.532317, 14.022707], flag: '🇹🇭' }, name: 'Bangkok', coords: [100.493509, 13.752494], flag: '🇹🇭', vehicle: 'car' },
  { origin: { name: 'Bangkok', coords: [100.493509, 13.752494], flag: '🇹🇭' }, name: 'Tokyo', coords: [139.692912, 35.688985], flag: '🇯🇵', vehicle: 'plane' },
  { origin: { name: 'Tokyo', coords: [139.692912, 35.688985], flag: '🇯🇵' }, name: 'Hanoi', coords: [105.854444, 21.02945], flag: '🇻🇳', vehicle: 'plane' },
  { origin: { name: 'Hanoi', coords: [105.854444, 21.02945], flag: '🇻🇳' }, name: 'Hạ Long', coords: [107.079765, 20.952133], flag: '🇻🇳', vehicle: 'car' },
  // { origin: { name: 'Hạ Long', coords: [107.079765, 20.952133], flag: '🇻🇳' }, name: 'Hạ Long', coords: [107.079766, 20.952134], flag: '🇻🇳', vehicle: 'ship' },
  { origin: { name: 'Hạ Long', coords: [107.079765, 20.952133], flag: '🇻🇳' }, name: 'Hanoi', coords: [105.854444, 21.02945], flag: '🇻🇳', vehicle: 'car' },
  { origin: { name: 'Hanoi', coords: [105.854444, 21.02945], flag: '🇻🇳' }, name: 'Ninh Bình', coords: [105.97167, 20.257044], flag: '🇻🇳', vehicle: 'train' },
  { origin: { name: 'Ninh Bình', coords: [105.97167, 20.257044], flag: '🇻🇳' }, name: 'Đồng Hới', coords: [106.59825, 17.466604], flag: '🇻🇳', vehicle: 'train' },
  { origin: { name: 'Đồng Hới', coords: [106.59825, 17.466604], flag: '🇻🇳' }, name: 'Da Nang', coords: [108.212, 16.068], flag: '🇻🇳', vehicle: 'train' },
  // { origin: { name: 'Da Nang', coords: [108.212, 16.068], flag: '🇻🇳' }, name: 'Hội An', coords: [108.32781, 15.879843], flag: '🇻🇳', vehicle: 'car' },
  // { origin: { name: 'Hội An', coords: [108.32781, 15.879843], flag: '🇻🇳' }, name: 'Da Nang', coords: [108.212, 16.068], flag: '🇻🇳', vehicle: 'car' },
  { origin: { name: 'Da Nang', coords: [108.212, 16.068], flag: '🇻🇳' }, name: 'Ho Chi Minh', coords: [106.701756, 10.775844], flag: '🇻🇳', vehicle: 'plane' },
  { origin: { name: 'Ho Chi Minh', coords: [106.701756, 10.775844], flag: '🇻🇳' }, name: 'Tokyo', coords: [139.692912, 35.688985], flag: '🇯🇵', vehicle: 'plane' },
  { origin: { name: 'Tokyo', coords: [139.692912, 35.688985], flag: '🇯🇵' }, name: 'Praha', coords: [14.422954, 50.08584], flag: '🇨🇿', vehicle: 'plane' },
  { origin: { name: 'Praha', coords: [14.422954, 50.08584], flag: '🇨🇿' }, name: 'Budapest', coords: [19.040359, 47.497994], flag: '🇭🇺', vehicle: 'train' },
  { origin: { name: 'Budapest', coords: [19.040359, 47.497994], flag: '🇭🇺' }, name: 'Vienna', coords: [16.372504, 48.208354], flag: '🇦🇹', vehicle: 'train' },
  { origin: { name: 'Vienna', coords: [16.372504, 48.208354], flag: '🇦🇹' }, name: 'Praha', coords: [14.422954, 50.08584], flag: '🇨🇿', vehicle: 'train' },
  { origin: { name: 'Praha', coords: [14.422954, 50.08584], flag: '🇨🇿' }, name: 'Tokyo', coords: [139.692912, 35.688985], flag: '🇯🇵', vehicle: 'plane' },
  // { origin: { name: 'Tokyo', coords: [139.692912, 35.688985], flag: '🇯🇵' }, name: 'Yamanakako Mura', coords: [138.86226, 35.41016], flag: '🇯🇵', vehicle: 'car' },
  // { origin: { name: 'Yamanakako Mura', coords: [138.86226, 35.41016], flag: '🇯🇵' }, name: 'Tokyo', coords: [139.692912, 35.688985], flag: '🇯🇵', vehicle: 'car' },
  { origin: { name: 'Tokyo', coords: [139.692912, 35.688985], flag: '🇯🇵' }, name: 'Osaka', coords: [135.50078, 34.683594], flag: '🇯🇵', vehicle: 'train' },
];

    // Route management state
    let editingRouteIndex = null;
    let draggedRouteIndex = null;

    // Distance tracking
    let totalAccumulatedDistance = 0; // Total distance traveled in km
    let completedLegsDistance = 0; // Distance from completed legs

    // Recording state
    let mediaRecorder = null;
    let recordedChunks = [];
    let isRecording = false;
    let recordingCanvas = null;
    let recordingContext = null;
    let recordingInterval = null;

    // Autocomplete state
    let selectedOriginCoords = null;
    let selectedDestinationCoords = null;
    let originSessionToken = null;
    let destinationSessionToken = null;
    let originSuggestions = [];
    let destinationSuggestions = [];

    // Route editor state
    let isEditMode = true; // Start in edit mode
    let routeControlPoints = {}; // Store arrays of control points for each route segment: { '0': [[lng, lat], [lng, lat], ...], '1': [...], ... }
    let controlPointMarkers = []; // Store marker objects with metadata
    let previewRoutes = {}; // Store generated preview routes

    // Generate a random session token for search
    function generateSessionToken() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    // Convert country code to flag emoji
    function countryCodeToFlag(countryCode) {
      if (!countryCode) return '';
      return countryCode
        .toUpperCase()
        .split('')
        .map(char => String.fromCodePoint(0x1F1E6 + char.charCodeAt(0) - 65))
        .join('');
    }

    // Initialize custom autocomplete
    function initializeAutocomplete() {
      const originInput = document.getElementById('route-origin-input');
      const destinationInput = document.getElementById('route-destination-input');
      const originDropdown = document.getElementById('origin-suggestions');
      const destinationDropdown = document.getElementById('destination-suggestions');

      // Origin input handler
      let originDebounceTimer;
      originInput.addEventListener('input', () => {
        const query = originInput.value.trim();
        clearTimeout(originDebounceTimer);

        if (query.length < 2) {
          originDropdown.classList.remove('show');
          return;
        }

        originDebounceTimer = setTimeout(() => {
          searchCities(query, 'origin');
        }, 300);
      });

      // Destination input handler
      let destinationDebounceTimer;
      destinationInput.addEventListener('input', () => {
        const query = destinationInput.value.trim();
        clearTimeout(destinationDebounceTimer);

        if (query.length < 2) {
          destinationDropdown.classList.remove('show');
          return;
        }

        destinationDebounceTimer = setTimeout(() => {
          searchCities(query, 'destination');
        }, 300);
      });

      // Close dropdowns when clicking outside
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.autocomplete-wrapper')) {
          originDropdown.classList.remove('show');
          destinationDropdown.classList.remove('show');
        }
      });
    }

    // Search cities using Mapbox SearchBox API
    async function searchCities(query, type) {
      const accessToken = mapboxgl.accessToken;
      const dropdown = document.getElementById(`${type}-suggestions`);

      // Generate or reuse session token
      if (type === 'origin' && !originSessionToken) {
        originSessionToken = generateSessionToken();
      } else if (type === 'destination' && !destinationSessionToken) {
        destinationSessionToken = generateSessionToken();
      }

      const sessionToken = type === 'origin' ? originSessionToken : destinationSessionToken;

      try {
        const response = await fetch(
          `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(query)}&access_token=${accessToken}&language=en&session_token=${sessionToken}&types=region,district,place,city,locality,neighborhood`
        );

        const data = await response.json();

        if (data.suggestions && data.suggestions.length > 0) {
          if (type === 'origin') {
            originSuggestions = data.suggestions;
          } else {
            destinationSuggestions = data.suggestions;
          }
          renderSuggestions(data.suggestions, type);
        } else {
          dropdown.classList.remove('show');
        }
      } catch (error) {
        console.error('Error searching cities:', error);
        dropdown.classList.remove('show');
      }
    }

    // Render suggestions in dropdown
    function renderSuggestions(suggestions, type) {
      const dropdown = document.getElementById(`${type}-suggestions`);
      dropdown.innerHTML = '';

      suggestions.forEach((suggestion, index) => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.innerHTML = `
          <div class="suggestion-name">${suggestion.name}</div>
          <div class="suggestion-place">${suggestion.place_formatted}</div>
        `;

        item.addEventListener('click', () => {
          selectSuggestion(suggestion, type);
        });

        dropdown.appendChild(item);
      });

      dropdown.classList.add('show');
    }

    // Handle suggestion selection and retrieve full details
    async function selectSuggestion(suggestion, type) {
      const accessToken = mapboxgl.accessToken;
      const input = document.getElementById(`${type === 'origin' ? 'route-origin-input' : 'route-destination-input'}`);
      const dropdown = document.getElementById(`${type}-suggestions`);
      const sessionToken = type === 'origin' ? originSessionToken : destinationSessionToken;

      // Show the selected name in input
      input.value = suggestion.name;
      dropdown.classList.remove('show');

      try {
        // Call retrieve API to get coordinates
        const response = await fetch(
          `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.mapbox_id}?access_token=${accessToken}&session_token=${sessionToken}`
        );

        const data = await response.json();
        const feature = data.features[0];

        if (feature && feature.geometry && feature.geometry.coordinates) {
          const coords = feature.geometry.coordinates;
          const name = feature.properties.name || feature.properties.place_name;

          // Get country code from feature context
          const countryCode = feature.properties.context?.country?.country_code;
          const flag = countryCodeToFlag(countryCode);

          if (type === 'origin') {
            selectedOriginCoords = coords;
            document.getElementById('route-origin-name').value = name;
            document.getElementById('route-origin-coords').value = `${coords[0]}, ${coords[1]}`;
            // Auto-set flag display and hidden value
            if (flag) {
              document.getElementById('route-origin-flag').textContent = flag;
              document.getElementById('route-origin-flag-value').value = flag;
            }
            // Reset session token after successful retrieval
            originSessionToken = null;
          } else {
            selectedDestinationCoords = coords;
            document.getElementById('route-destination').value = name;
            document.getElementById('route-coords').value = `${coords[0]}, ${coords[1]}`;
            // Auto-set flag display and hidden value
            if (flag) {
              document.getElementById('route-destination-flag').textContent = flag;
              document.getElementById('route-destination-flag-value').value = flag;
            }
            // Reset session token after successful retrieval
            destinationSessionToken = null;
          }
        }
      } catch (error) {
        console.error('Error retrieving location details:', error);
      }
    }

    // Render routes list in the menu
    function renderRoutesList() {
      const routesList = document.getElementById('routes-list');
      routesList.innerHTML = '';

      for (let i = 0; i < destinations.length; i++) {
        const route = destinations[i];

        // Use explicit origin
        const origin = route.origin ? route.origin.name : 'Unknown';
        const destination = route.name;
        const vehicle = route.vehicle || 'plane';

        const routeItem = document.createElement('div');
        routeItem.className = `route-item ${vehicle}`;
        routeItem.draggable = true;
        routeItem.dataset.index = i;
        routeItem.innerHTML = `
          <div class="route-header">
            <div class="route-info">
              <div class="route-destinations">${origin} → ${destination}</div>
              <div class="route-vehicle">${vehicle} ${route.flag || ''}</div>
            </div>
            <div class="route-actions-container">
              <div class="route-actions">
                <button class="route-btn" onclick="editRoute(${i})">Edit</button>
                <button class="route-btn delete" onclick="deleteRoute(${i})">Delete</button>
              </div>
              <button class="insert-route-btn" onclick="insertRouteAfter(${i})" title="Insert new route after this one">
                + Insert After
              </button>
            </div>
          </div>
        `;

        // Add drag event listeners
        routeItem.addEventListener('dragstart', handleDragStart);
        routeItem.addEventListener('dragover', handleDragOver);
        routeItem.addEventListener('drop', handleDrop);
        routeItem.addEventListener('dragend', handleDragEnd);
        routeItem.addEventListener('dragenter', handleDragEnter);
        routeItem.addEventListener('dragleave', handleDragLeave);

        routesList.appendChild(routeItem);
      }
    }

    // Drag and drop handlers
    function handleDragStart(e) {
      draggedRouteIndex = parseInt(e.currentTarget.dataset.index);
      e.currentTarget.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
    }

    function handleDragOver(e) {
      if (e.preventDefault) {
        e.preventDefault();
      }
      e.dataTransfer.dropEffect = 'move';
      return false;
    }

    function handleDragEnter(e) {
      e.currentTarget.classList.add('drag-over');
    }

    function handleDragLeave(e) {
      e.currentTarget.classList.remove('drag-over');
    }

    function handleDrop(e) {
      if (e.stopPropagation) {
        e.stopPropagation();
      }

      e.currentTarget.classList.remove('drag-over');

      const dropIndex = parseInt(e.currentTarget.dataset.index);

      if (draggedRouteIndex !== null && draggedRouteIndex !== dropIndex) {
        // Remove dragged item from array
        const draggedItem = destinations[draggedRouteIndex];
        destinations.splice(draggedRouteIndex, 1);

        // After removing, adjust the drop index if needed
        // If we removed an item before the drop position, shift down by 1
        const adjustedDropIndex = draggedRouteIndex < dropIndex ? dropIndex - 1 : dropIndex;

        // Insert at the adjusted position
        destinations.splice(adjustedDropIndex, 0, draggedItem);

        renderRoutesList();
      }

      return false;
    }

    function handleDragEnd(e) {
      e.currentTarget.classList.remove('dragging');

      // Remove drag-over class from all items
      document.querySelectorAll('.route-item').forEach(item => {
        item.classList.remove('drag-over');
      });

      draggedRouteIndex = null;
    }

    // Open modal to edit route
    function editRoute(index) {
      editingRouteIndex = index;
      const route = destinations[index];

      document.getElementById('modal-title').textContent = 'Edit Route';

      // Set input values
      if (route.origin) {
        document.getElementById('route-origin-input').value = route.origin.name;
        document.getElementById('route-origin-name').value = route.origin.name;
        document.getElementById('route-origin-coords').value = `${route.origin.coords[0]}, ${route.origin.coords[1]}`;
        selectedOriginCoords = route.origin.coords;
        // Set origin flag display and value if available
        if (route.origin.flag) {
          document.getElementById('route-origin-flag').textContent = route.origin.flag;
          document.getElementById('route-origin-flag-value').value = route.origin.flag;
        }
      }

      if (route.name) {
        document.getElementById('route-destination-input').value = route.name;
        document.getElementById('route-destination').value = route.name;
        document.getElementById('route-coords').value = `${route.coords[0]}, ${route.coords[1]}`;
        selectedDestinationCoords = route.coords;
      }

      // Set destination flag display and value
      document.getElementById('route-destination-flag').textContent = route.flag || '';
      document.getElementById('route-destination-flag-value').value = route.flag || '';
      document.getElementById('route-vehicle').value = route.vehicle || 'plane';

      document.getElementById('edit-route-modal').classList.add('show');
    }

    // Variable to track where to insert new route
    let insertAfterIndex = null;

    // Open modal to insert route after specific index
    window.insertRouteAfter = function(index) {
      editingRouteIndex = null;
      insertAfterIndex = index;

      document.getElementById('modal-title').textContent = `Insert Route After #${index + 1}`;

      // Pre-fill origin with the destination of the previous route
      const previousRoute = destinations[index];
      if (previousRoute) {
        document.getElementById('route-origin-input').value = previousRoute.name;
        document.getElementById('route-origin-name').value = previousRoute.name;
        document.getElementById('route-origin-coords').value = previousRoute.coords.join(',');
        document.getElementById('route-origin-flag').textContent = previousRoute.flag || '';
        document.getElementById('route-origin-flag-value').value = previousRoute.flag || '';
        selectedOriginCoords = previousRoute.coords;
      }

      // Clear destination
      document.getElementById('route-destination-input').value = '';
      document.getElementById('route-destination').value = '';
      document.getElementById('route-coords').value = '';
      document.getElementById('route-destination-flag').textContent = '';
      document.getElementById('route-destination-flag-value').value = '';
      document.getElementById('route-vehicle').value = 'plane';

      selectedDestinationCoords = null;

      // Reset session tokens
      originSessionToken = null;
      destinationSessionToken = null;

      document.getElementById('edit-route-modal').classList.add('show');
    }

    // Open modal to add new route
    function addNewRoute() {
      editingRouteIndex = null;
      insertAfterIndex = null;

      document.getElementById('modal-title').textContent = 'Add New Route';

      // Clear input values
      document.getElementById('route-origin-input').value = '';
      document.getElementById('route-destination-input').value = '';
      document.getElementById('route-origin-name').value = '';
      document.getElementById('route-origin-coords').value = '';
      document.getElementById('route-destination').value = '';
      document.getElementById('route-coords').value = '';
      document.getElementById('route-vehicle').value = 'plane';

      // Clear flag displays and values
      document.getElementById('route-origin-flag').textContent = '';
      document.getElementById('route-origin-flag-value').value = '';
      document.getElementById('route-destination-flag').textContent = '';
      document.getElementById('route-destination-flag-value').value = '';

      selectedOriginCoords = null;
      selectedDestinationCoords = null;

      // Reset session tokens
      originSessionToken = null;
      destinationSessionToken = null;

      document.getElementById('edit-route-modal').classList.add('show');
    }

    // Close the edit modal
    // Format number with commas
    function formatNumberWithCommas(num) {
      return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // Start recording - canvas only (automatic, no prompts)
    async function startRecording() {
      try {
        // Enable canvas overlays for recording
        canvasOverlaysVisible = true;

        // Hide DOM overlays during recording
        const distanceCounter = document.getElementById('distance-counter');
        const routeInfoPanel = document.getElementById('route-info-panel');
        const completionModal = document.getElementById('completion-modal');
        distanceCounter.style.display = 'none';
        routeInfoPanel.style.display = 'none';
        completionModal.style.display = 'none';

        // Create and show overlay canvas
        createOverlayCanvas();
        if (overlayCanvas) {
          overlayCanvas.style.display = 'block';
        }
        drawOverlayUI();

        // Resolution capping for better performance
        const MAX_RECORDING_WIDTH = 1920;
        const MAX_RECORDING_HEIGHT = 1080;

        // Get actual map dimensions
        const mapCanvas = map.getCanvas();
        const actualWidth = mapCanvas.width;
        const actualHeight = mapCanvas.height;

        // Calculate scale factor to fit within max dimensions while maintaining aspect ratio
        const scaleX = actualWidth > MAX_RECORDING_WIDTH ? MAX_RECORDING_WIDTH / actualWidth : 1;
        const scaleY = actualHeight > MAX_RECORDING_HEIGHT ? MAX_RECORDING_HEIGHT / actualHeight : 1;
        const recordingScale = Math.min(scaleX, scaleY);

        // Store scale globally for use in overlay drawing
        window.recordingScale = recordingScale;

        // Create a composite canvas to merge both canvases at capped resolution
        recordingCanvas = document.createElement('canvas');
        recordingCanvas.width = Math.floor(actualWidth * recordingScale);
        recordingCanvas.height = Math.floor(actualHeight * recordingScale);
        recordingContext = recordingCanvas.getContext('2d', { willReadFrequently: true });

        // Log recording resolution info
        console.log(`Recording at ${recordingCanvas.width}x${recordingCanvas.height} (original: ${actualWidth}x${actualHeight}, scale: ${recordingScale.toFixed(2)})`);

        // Set recording flag BEFORE starting capture loop
        recordedChunks = [];
        isRecording = true;

        // Continuously draw both canvases onto the recording canvas
        function captureFrame() {
          if (!isRecording) return;

          // Draw map canvas scaled to recording resolution
          recordingContext.drawImage(
            mapCanvas,
            0, 0, actualWidth, actualHeight,
            0, 0, recordingCanvas.width, recordingCanvas.height
          );
          // Draw overlay canvas on top scaled to recording resolution
          recordingContext.drawImage(
            overlayCanvas,
            0, 0, overlayCanvas.width, overlayCanvas.height,
            0, 0, recordingCanvas.width, recordingCanvas.height
          );

          requestAnimationFrame(captureFrame);
        }

        // Start capturing frames
        captureFrame();

        // Small delay to ensure first frame is drawn
        await new Promise(resolve => setTimeout(resolve, 100));

        // Capture stream from the recording canvas at 30fps
        const stream = recordingCanvas.captureStream(30);

        // Adjust bitrate based on resolution
        const bitrate = recordingCanvas.width > 1280 ? 5000000 : 2500000;

        mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9',
          videoBitsPerSecond: bitrate
        });

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          downloadRecording();
        };

        mediaRecorder.start();
        console.log('Recording started with canvas overlays');

        // Show notification
        const notification = document.createElement('div');
        notification.id = 'recording-indicator';
        notification.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: rgba(220, 38, 38, 0.95); color: white; padding: 12px 24px; border-radius: 20px; z-index: 10000; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 8px;';
        notification.innerHTML = '<span style="width: 8px; height: 8px; background: white; border-radius: 50%; animation: pulse 1.5s ease-in-out infinite;"></span>Recording';
        document.body.appendChild(notification);

        // Add pulse animation
        const style = document.createElement('style');
        style.textContent = '@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }';
        document.head.appendChild(style);

      } catch (error) {
        console.error('Error starting recording:', error);
        alert('Could not start recording: ' + error.message);
        isRecording = false;
        canvasOverlaysVisible = false;
      }
    }

    // Stop recording
    function stopRecording() {
      if (mediaRecorder && isRecording) {
        isRecording = false;
        mediaRecorder.stop();
        console.log('Recording stopped');

        // Disable canvas overlays
        canvasOverlaysVisible = false;

        // Clean up recording scale
        delete window.recordingScale;

        // Hide overlay canvas
        if (overlayCanvas) {
          overlayCanvas.style.display = 'none';
        }

        // Restore DOM overlays
        const distanceCounter = document.getElementById('distance-counter');
        const routeInfoPanel = document.getElementById('route-info-panel');
        const completionModal = document.getElementById('completion-modal');
        distanceCounter.style.display = '';
        routeInfoPanel.style.display = '';
        completionModal.style.display = '';

        // Remove recording indicator
        const indicator = document.getElementById('recording-indicator');
        if (indicator) {
          indicator.remove();
        }
      }
    }

    // Download the recorded video
    function downloadRecording() {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const tourTitle = document.getElementById('tour-title-input').value || 'Travel Highlights';
      const filename = `${tourTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_tour.webm`;

      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      console.log('Recording downloaded:', filename);
    }

    // Confetti animation
    function createConfetti() {
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#ff69b4'];
      const mapElement = document.getElementById('map');
      const confettiCount = 100;

      for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
          const confetti = document.createElement('div');
          confetti.className = 'confetti';
          confetti.style.left = Math.random() * 100 + '%';
          confetti.style.top = '-10px';
          confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
          confetti.style.width = (Math.random() * 10 + 5) + 'px';
          confetti.style.height = (Math.random() * 10 + 5) + 'px';
          confetti.style.opacity = Math.random() * 0.5 + 0.5;
          confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

          const duration = Math.random() * 3 + 2;
          const drift = (Math.random() - 0.5) * 200;

          confetti.style.animation = `confettiFall ${duration}s linear forwards`;
          confetti.style.setProperty('--drift', drift + 'px');

          mapElement.appendChild(confetti);

          setTimeout(() => {
            confetti.remove();
          }, duration * 1000);
        }, i * 30);
      }
    }

    // Show completion modal with route summary
    function showCompletionModal() {
      // Hide all vehicle models when tour completes
      if (map.getLayer('plane-model-layer')) {
        map.setLayoutProperty('plane-model-layer', 'visibility', 'none');
      }
      if (map.getLayer('train-model-layer')) {
        map.setLayoutProperty('train-model-layer', 'visibility', 'none');
      }
      if (map.getLayer('car-model-layer')) {
        map.setLayoutProperty('car-model-layer', 'visibility', 'none');
      }
      if (map.getLayer('ship-model-layer')) {
        map.setLayoutProperty('ship-model-layer', 'visibility', 'none');
      }

      const modal = document.getElementById('completion-modal');
      const summary = document.getElementById('routes-summary');
      const totalDistanceEl = document.getElementById('total-distance');
      const modalTitle = document.getElementById('completion-modal-title');
      const tourTitle = document.getElementById('tour-title-input').value || 'Travel Highlights';

      // Update modal title with tour title
      modalTitle.textContent = tourTitle;

      // Clear previous content
      summary.innerHTML = '';

      // Vehicle emoji mapping
      const vehicleEmoji = {
        'plane': '✈️',
        'train': '🚆',
        'car': '🚗',
        'ship': '🚢'
      };

      // Calculate total distance and create route summaries
      let totalDistance = 0;
      const routesData = [];
      destinations.forEach((route, index) => {
        const distance = route.actualDistance || 0;
        totalDistance += distance;
        const vehicle = route.vehicle || 'plane';

        routesData.push({
          origin: route.origin,
          flag: route.flag,
          name: route.name,
          distance: distance,
          vehicle: vehicle
        });

        const routeDiv = document.createElement('div');
        routeDiv.className = 'route-summary';
        routeDiv.innerHTML = `
          <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
            <div style="display: flex; align-items: center; flex: 1;">
              <span style="font-size: 20px; margin-right: 12px;">${vehicleEmoji[vehicle]}</span>
              <div>
                <span style="font-size: 18px; margin-right: 8px;">${route.origin.flag || ''}</span>
                <span style="color: white; font-weight: 600;">${route.origin.name}</span>
                <span style="color: rgba(255,255,255,0.5); margin: 0 8px;">→</span>
                <span style="font-size: 18px; margin-right: 8px;">${route.flag || ''}</span>
                <span style="color: white; font-weight: 600;">${route.name}</span>
              </div>
            </div>
            <span style="color: #667eea; font-weight: 700; text-align: right; white-space: nowrap;">${formatNumberWithCommas(distance)} km</span>
          </div>
        `;
        summary.appendChild(routeDiv);
      });

      // Set total distance
      totalDistanceEl.textContent = `${formatNumberWithCommas(totalDistance)} km`;

      // Update canvas overlay data for recording
      modalData = {
        title: tourTitle,
        routes: routesData,
        totalDistance: totalDistance
      };

      // Modal is now dynamically sized - no scrolling needed

      // Show modal with fade-in (unless recording, canvas overlay handles it)
      if (!canvasOverlaysVisible) {
        // Hide the distance counter when showing DOM modal
        const distanceCounter = document.getElementById('distance-counter');
        if (distanceCounter) {
          distanceCounter.style.display = 'none';
        }

        modal.style.display = 'block';
        setTimeout(() => {
          modal.style.opacity = '1';
        }, 10);
      }

      // Trigger confetti
      createConfetti();

      // Also trigger canvas confetti if recording
      if (canvasOverlaysVisible && overlayCanvas) {
        startConfetti(overlayCanvas.width, overlayCanvas.height);
      }

      // Auto-scroll to bottom smoothly after modal appears
      setTimeout(() => {
        modal.scrollTo({
          top: modal.scrollHeight,
          behavior: 'smooth'
        });

        // Stop recording after showing the modal
        if (isRecording) {
          setTimeout(() => {
            stopRecording();
          }, 3000); // 6 seconds after scroll to show final state (2x longer)
        }
      }, 500);
    }

    // Close completion modal
    function closeCompletionModal() {
      const modal = document.getElementById('completion-modal');
      modal.style.opacity = '0';

      // Restore the distance counter visibility
      const distanceCounter = document.getElementById('distance-counter');
      if (distanceCounter && totalAccumulatedDistance > 0) {
        distanceCounter.style.display = '';
      }

      setTimeout(() => {
        modal.style.display = 'none';
        modalData = null; // Clear canvas overlay data
        confettiActive = false; // Stop confetti
        confettiParticles = []; // Clear confetti particles
      }, 300);
    }

    function closeEditModal() {
      document.getElementById('edit-route-modal').classList.remove('show');
      editingRouteIndex = null;
    }

    // Save route changes
    function saveRoute() {
      const originName = document.getElementById('route-origin-name').value.trim();
      const originCoordsStr = document.getElementById('route-origin-coords').value.trim();
      const originFlag = document.getElementById('route-origin-flag-value').value.trim();
      const destinationName = document.getElementById('route-destination').value.trim();
      const destCoordsStr = document.getElementById('route-coords').value.trim();
      const destinationFlag = document.getElementById('route-destination-flag-value').value.trim();
      const vehicle = document.getElementById('route-vehicle').value;

      // Validate required fields
      if (!originName) {
        alert('Please enter an origin city name');
        return;
      }

      if (!originCoordsStr) {
        alert('Please enter origin coordinates');
        return;
      }

      if (!destinationName) {
        alert('Please enter a destination city name');
        return;
      }

      if (!destCoordsStr) {
        alert('Please enter destination coordinates');
        return;
      }

      // Parse origin coordinates
      const originCoordsParts = originCoordsStr.split(',').map(s => parseFloat(s.trim()));
      if (originCoordsParts.length !== 2 || isNaN(originCoordsParts[0]) || isNaN(originCoordsParts[1])) {
        alert('Invalid origin coordinates format. Use: longitude, latitude (e.g., 139.7798, 35.5494)');
        return;
      }

      // Parse destination coordinates
      const destCoordsParts = destCoordsStr.split(',').map(s => parseFloat(s.trim()));
      if (destCoordsParts.length !== 2 || isNaN(destCoordsParts[0]) || isNaN(destCoordsParts[1])) {
        alert('Invalid destination coordinates format. Use: longitude, latitude (e.g., 139.7798, 35.5494)');
        return;
      }

      // Calculate straight-line distance using Turf
      const from = turf.point(originCoordsParts);
      const to = turf.point(destCoordsParts);
      const actualDistance = turf.distance(from, to, { units: 'kilometers' });

      const newRoute = {
        origin: {
          name: originName,
          coords: originCoordsParts,
          flag: originFlag
        },
        name: destinationName,
        coords: destCoordsParts,
        flag: destinationFlag,
        vehicle: vehicle,
        actualDistance: actualDistance
      };

      if (editingRouteIndex !== null) {
        // Update existing route
        destinations[editingRouteIndex] = newRoute;
      } else if (insertAfterIndex !== null) {
        // Insert new route after specific index
        destinations.splice(insertAfterIndex + 1, 0, newRoute);
        insertAfterIndex = null; // Reset
      } else {
        // Add new route at the end
        destinations.push(newRoute);
      }

      renderRoutesList();
      closeEditModal();

      // If we're in edit mode, reinitialize the editor to show the new route as editable
      if (isEditMode) {
        // Save existing control points before cleanup
        const savedControlPoints = { ...routeControlPoints };

        // If we inserted a route, shift control points for routes after the insertion point
        let adjustedControlPoints = {};
        if (insertAfterIndex !== null) {
          Object.keys(savedControlPoints).forEach(key => {
            const keyIndex = parseInt(key);
            if (keyIndex > insertAfterIndex) {
              // Shift up by 1 for routes after insertion point
              adjustedControlPoints[`${keyIndex + 1}`] = savedControlPoints[key];
            } else {
              adjustedControlPoints[key] = savedControlPoints[key];
            }
          });
        } else {
          adjustedControlPoints = savedControlPoints;
        }

        // Clean up existing editor
        cleanupRouteEditor();

        // Reinitialize with the new route included
        initializeRouteEditor();

        // Restore saved control points
        Object.keys(adjustedControlPoints).forEach(segmentKey => {
          const points = adjustedControlPoints[segmentKey];
          if (points && points.length > 0) {
            // Clear the array temporarily to avoid duplicates
            const savedPoints = [...points];
            routeControlPoints[segmentKey] = [];

            // Re-add each point
            savedPoints.forEach(point => {
              // Handle both object format and array format
              const coords = point.coords || point;
              addControlPoint(segmentKey, { lng: coords[0], lat: coords[1] });
            });
          }
        });
      }
    }

    // Delete a route
    function deleteRoute(index) {
      if (destinations.length <= 1) {
        alert('Cannot delete the last route');
        return;
      }

      // Delete without confirmation
      destinations.splice(index, 1);
      renderRoutesList();

      // If we're in edit mode, reinitialize the editor to remove the deleted route
      if (isEditMode) {
        // Save existing control points before cleanup (excluding the deleted route)
        const savedControlPoints = { ...routeControlPoints };
        // Remove control points for the deleted route
        delete savedControlPoints[`${index}`];
        // Shift control points for routes after the deleted one
        const shiftedControlPoints = {};
        Object.keys(savedControlPoints).forEach(key => {
          const keyIndex = parseInt(key);
          if (keyIndex > index) {
            // Shift down by 1
            shiftedControlPoints[`${keyIndex - 1}`] = savedControlPoints[key];
          } else {
            shiftedControlPoints[key] = savedControlPoints[key];
          }
        });

        // Clean up existing editor
        cleanupRouteEditor();

          // Reinitialize without the deleted route
          initializeRouteEditor();

          // Restore saved control points
          Object.keys(shiftedControlPoints).forEach(segmentKey => {
            const points = shiftedControlPoints[segmentKey];
            if (points && points.length > 0) {
              // Clear the array temporarily to avoid duplicates
              const savedPoints = [...points];
              routeControlPoints[segmentKey] = [];

              // Re-add each point
              savedPoints.forEach(point => {
                // Handle both object format and array format
                const coords = point.coords || point;
                addControlPoint(segmentKey, { lng: coords[0], lat: coords[1] });
              });
            }
          });
        }
    }

    // Calculate distances for all routes that don't have actualDistance
    function calculateRouteDistances() {
      destinations.forEach(route => {
        if (!route.actualDistance && route.origin && route.coords) {
          const from = turf.point(route.origin.coords);
          const to = turf.point(route.coords);
          route.actualDistance = turf.distance(from, to, { units: 'kilometers' });
        }
      });
    }

    // Helper functions
    function clamp(v) {
      return Math.max(0.0, Math.min(v, 1.0));
    }

    function mix(a, b, mixFactor) {
      const f = clamp(mixFactor);
      return a * (1 - f) + b * f;
    }

    function rad2deg(angRad) {
      return (angRad * 180.0) / Math.PI;
    }

    // Catmull-Rom spline interpolation
    function catmullRomSpline(p0, p1, p2, p3, t) {
      const t2 = t * t;
      const t3 = t2 * t;

      return 0.5 * (
        (2 * p1) +
        (-p0 + p2) * t +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
        (-p0 + 3 * p1 - 3 * p2 + p3) * t3
      );
    }

    // Helper to create GeoJSON geometry from coordinates, handling antimeridian crossing
    function makeLineGeometry(coordinates) {
      if (!coordinates || coordinates.length === 0) {
        return { type: 'LineString', coordinates: [] };
      }

      const segments = [];
      let currentSegment = [coordinates[0]];

      for (let i = 1; i < coordinates.length; i++) {
        const prev = coordinates[i - 1];
        const curr = coordinates[i];

        // Check for antimeridian crossing (big longitude jump)
        if (Math.abs(curr[0] - prev[0]) > 180) {
          segments.push(currentSegment);
          currentSegment = [curr];
        } else {
          currentSegment.push(curr);
        }
      }
      segments.push(currentSegment);

      if (segments.length === 1) {
        return { type: 'LineString', coordinates: segments[0] };
      } else {
        return { type: 'MultiLineString', coordinates: segments };
      }
    }

    // Generate a curved route with optional control points (can be array or single point)
    function generateCurvedRoute(from, to, controlPoints = null, vehicle = 'plane') {
      const numPoints = 200;
      const coordinates = [];
      const elevationData = [];

      // Normalize controlPoints to always be an array of coordinate arrays
      let controlPointsArray = [];
      if (controlPoints) {
        if (Array.isArray(controlPoints)) {
          // Array of control points
          controlPointsArray = controlPoints.map(cp => {
            // Handle both object format {coords: [lng, lat]} and array format [lng, lat]
            if (cp.coords) {
              return cp.coords;
            } else {
              return cp;
            }
          });
        } else if (controlPoints.coords) {
          // Single control point object
          controlPointsArray = [controlPoints.coords];
        } else {
          // Single control point array
          controlPointsArray = [controlPoints];
        }
      }

      if (controlPointsArray.length > 0) {
        // Build full path: start -> control points -> end
        const allPoints = [from, ...controlPointsArray, to];

        // Normalize for Catmull-Rom: make all points use the shortest path
        // If we're going west (like Japan to SF), adjust coordinates to not wrap around
        const normalizedPoints = [];
        normalizedPoints.push([allPoints[0][0], allPoints[0][1]]);

        for (let i = 1; i < allPoints.length; i++) {
          let currLng = allPoints[i][0];
          const currLat = allPoints[i][1];
          const prevLng = normalizedPoints[i - 1][0];

          // Find the shortest path between prevLng and currLng
          // Consider three options: currLng, currLng+360, currLng-360
          const options = [currLng, currLng + 360, currLng - 360];
          let bestLng = currLng;
          let minDist = Math.abs(currLng - prevLng);

          for (const opt of options) {
            const dist = Math.abs(opt - prevLng);
            if (dist < minDist) {
              minDist = dist;
              bestLng = opt;
            }
          }

          normalizedPoints.push([bestLng, currLat]);
        }

        // Use Catmull-Rom spline for smooth curve through all points
        const segments = normalizedPoints.length - 1;
        const pointsPerSegment = Math.floor(numPoints / segments);

        for (let seg = 0; seg < segments; seg++) {
          // Get four points for Catmull-Rom (with padding at ends)
          const p0 = seg > 0 ? normalizedPoints[seg - 1] : normalizedPoints[seg];
          const p1 = normalizedPoints[seg];
          const p2 = normalizedPoints[seg + 1];
          const p3 = seg < segments - 1 ? normalizedPoints[seg + 2] : normalizedPoints[seg + 1];

          const segmentPoints = seg === segments - 1 ? pointsPerSegment + (numPoints % segments) : pointsPerSegment;

          for (let i = 0; i <= segmentPoints; i++) {
            const t = i / segmentPoints;
            let lng = catmullRomSpline(p0[0], p1[0], p2[0], p3[0], t);
            const lat = catmullRomSpline(p0[1], p1[1], p2[1], p3[1], t);

            // Normalize back to -180 to 180 range (may need multiple adjustments for far values)
            while (lng > 180) lng -= 360;
            while (lng < -180) lng += 360;

            if (seg === 0 || i > 0) { // Avoid duplicate points at segment boundaries
              coordinates.push([lng, lat]);

              // Parabolic elevation profile
              const overallT = (seg * pointsPerSegment + i) / numPoints;
              const parabola = -4 * (overallT - 0.5) * (overallT - 0.5) + 1;
              const minAltitude = 0;
              const maxAltitude = (vehicle === 'plane') ? 11000 : 0;
              const elevation = minAltitude + parabola * (maxAltitude - minAltitude);
              elevationData.push(elevation);
            }
          }
        }
      } else {
        // Use great circle (original behavior)
        const startPoint = turf.point(from);
        const endPoint = turf.point(to);

        // Turf's greatCircle always takes the shorter path
        const greatCircleLine = turf.greatCircle(startPoint, endPoint, { npoints: numPoints + 1 });


        let gcCoordinates;
        if (greatCircleLine.geometry.type === 'MultiLineString') {
          // Turf splits at antimeridian into multiple segments
          // Use flat() to combine them into a single array for sampling
          // The jump between segments (e.g. 180 to -180) will be preserved
          gcCoordinates = greatCircleLine.geometry.coordinates.flat();
        } else {
          gcCoordinates = greatCircleLine.geometry.coordinates;
        }

        for (let i = 0; i <= numPoints; i++) {
          const fraction = i / numPoints;
          const coordIndex = Math.floor(fraction * (gcCoordinates.length - 1));
          coordinates.push(gcCoordinates[coordIndex]);

          const parabola = -4 * (fraction - 0.5) * (fraction - 0.5) + 1;
          const minAltitude = 0;
          const maxAltitude = (vehicle === 'plane') ? 11000 : 0;
          const elevation = minAltitude + parabola * (maxAltitude - minAltitude);
          elevationData.push(elevation);
        }
      }

      return {
        coordinates: coordinates,
        elevationData: elevationData
      };
    }

    // Generate a simple flight route between two points
    function generateFlightRoute(from, to, controlPoint = null) {
      return generateCurvedRoute(from, to, controlPoint);
    }

    // FlightRoute class (simplified)
    class FlightRoute {
      constructor(routeData) {
        this.coordinates = routeData.coordinates;
        this.elevationData = routeData.elevationData;
        this.distances = [0];

        for (let i = 1; i < this.coordinates.length; i++) {
          const segmentDistance =
            turf.distance(
              turf.point(this.coordinates[i - 1]),
              turf.point(this.coordinates[i]),
              { units: 'kilometers' }
            ) * 1000.0;
          this.distances.push(this.distances[i - 1] + segmentDistance);
        }
      }

      get totalLength() {
        if (!this.distances || this.distances.length === 0) return 0;
        return this.distances[this.distances.length - 1];
      }

      sample(currentDistance) {
        if (!this.distances || this.distances.length === 0) return null;

        let segmentIndex =
          this.distances.findIndex((d) => d >= currentDistance) - 1;
        if (segmentIndex < 0) segmentIndex = 0;
        if (segmentIndex >= this.coordinates.length - 1) {
          segmentIndex = this.coordinates.length - 2;
        }

        const p1 = this.coordinates[segmentIndex];
        const p2 = this.coordinates[segmentIndex + 1];
        const segmentLength =
          this.distances[segmentIndex + 1] - this.distances[segmentIndex];
        const segmentRatio =
          (currentDistance - this.distances[segmentIndex]) / segmentLength;

        const e1 = this.elevationData[segmentIndex];
        const e2 = this.elevationData[segmentIndex + 1];
        const bearing = turf.bearing(turf.point(p1), turf.point(p2));
        const altitude = e1 + (e2 - e1) * segmentRatio;
        const pitch = rad2deg(Math.atan2(e2 - e1, segmentLength));

        // Handle longitude interpolation across antimeridian
        let lng1 = p1[0];
        let lng2 = p2[0];

        if (Math.abs(lng2 - lng1) > 180) {
          if (lng2 > lng1) {
            lng1 += 360;
          } else {
            lng2 += 360;
          }
        }

        let lng = lng1 + (lng2 - lng1) * segmentRatio;
        const lat = p1[1] + (p2[1] - p1[1]) * segmentRatio;

        // Normalize longitude back to -180 to 180
        while (lng > 180) lng -= 360;
        while (lng < -180) lng += 360;

        return {
          position: [lng, lat],
          altitude: altitude,
          bearing: bearing,
          pitch: pitch
        };
      }
    }

    // Airplane class
    class Airplane {
      constructor(startPos) {
        this.position = startPos || [0, 0];
        this.altitude = 5000;
        this.bearing = 0;
        this.pitch = 0;
        this.roll = 0;
        this.frontGearRotation = 90; // Retracted
        this.rearGearRotation = -90; // Retracted
        this.animTimeS = 0;
      }

      update(target, dtimeMs) {
        this.position[0] = target.position[0];
        this.position[1] = target.position[1];
        this.altitude = target.altitude;
        this.bearing = target.bearing;
        this.pitch = target.pitch;
        this.roll = rad2deg(Math.sin(this.animTimeS * Math.PI * 0.3) * 0.05);
        this.frontGearRotation = 90; // Always retracted
        this.rearGearRotation = -90; // Always retracted
        this.animTimeS += dtimeMs / 1000.0;
      }
    }

    // Map style with model sources and layers
    const style = {
      'version': 8,
      'imports': [
        {
          'id': 'basemap',
          'url': 'mapbox://styles/mapbox/standard',
          'config': {
            'lightPreset': 'night',
            'showPointOfInterestLabels': false,
            'showRoadLabels': false,
          }
        }
      ],
      'sources': {
        'plane-model-source': {
          'type': 'model',
          'models': {
            'plane': {
              'uri': airplaneModelUri,
              'position': [140.3929, 35.7719],
              'orientation': [0, 0, 0]
            }
          }
        },
        'train-model-source': {
          'type': 'model',
          'models': {
            'train': {
              'uri': trainModelUri,
              'position': [-180, -90],
              'orientation': [0, 0, 0],
              'position': [140.3929, 35.7719],
            }
          }
        },
        'car-model-source': {
          'type': 'model',
          'models': {
            'car': {
              'uri': carModelUri,
              'position': [140.3929, 35.7719],
              'orientation': [0, 0, 0],
              'materialOverrides': {
                'body': {
                  'model-color': [1.0, 0.5, 0.0],
                  'model-color-mix-intensity': 1.0,
                  'model-emissive-strength': 5.0
                }
              }
            }
          }
        },
        'ship-model-source': {
          'type': 'model',
          'models': {
            'ship': {
              'uri': shipModelUri,
              'position': [140.3929, 35.7719],
              'orientation': [0, 0, 0],
              'materialOverrides': {
                'body': {
                  'model-color': [0.0, 0.5, 1.0],
                  'model-color-mix-intensity': 1.0,
                  'model-emissive-strength': 5.0
                }
              }
            }
          }
        }
      },
      'layers': [
        {
          'id': 'plane-model-layer',
          'type': 'model',
          'source': 'plane-model-source',
          'slot': 'top',
          'layout': {
            'visibility': 'none'
          },
          'paint': {
            'model-translation': [0, 0, ['feature-state', 'z-elevation']],
            'model-scale': [
              'interpolate',
              ['exponential', 0.5],
              ['zoom'],
              2, ['literal', [20000, 20000, 20000]],
              14, ['literal', [1, 1, 1]]
            ],
            'model-type': 'location-indicator',
            'model-rotation': [
              ['feature-state', 'pitch'],
              ['feature-state', 'roll'],
              ['feature-state', 'bearing']
            ],
            'model-emissive-strength': 2
          }
        },
        {
          'id': 'train-model-layer',
          'type': 'model',
          'source': 'train-model-source',
          'slot': 'top',
          'layout': {
            'visibility': 'none'
          },
          'paint': {
            'model-translation': [0, 0, ['feature-state', 'z-elevation']],
            'model-scale': [
              'interpolate',
              ['exponential', 0.5],
              ['zoom'],
              2, ['literal', [60000, 60000, 60000]],
              14, ['literal', [1000, 1000, 1000]]
            ],
            'model-type': 'location-indicator',
            'model-rotation': [
              ['feature-state', 'pitch'],
              ['feature-state', 'roll'],
              ['feature-state', 'bearing']
            ],
            'model-emissive-strength': 2
          }
        },
        {
          'id': 'car-model-layer',
          'type': 'model',
          'source': 'car-model-source',
          'slot': 'top',
          'layout': {
            'visibility': 'none'
          },
          'paint': {
            'model-translation': [0, 0, ['feature-state', 'z-elevation']],
            'model-scale': [
              'interpolate',
              ['exponential', 0.5],
              ['zoom'],
              2, ['literal', [200000, 200000, 200000]],
              14, ['literal', [5, 5, 5]]
            ],
            'model-type': 'location-indicator',
            'model-rotation': [
              ['feature-state', 'pitch'],
              ['feature-state', 'roll'],
              ['feature-state', 'bearing']
            ],
            'model-emissive-strength': 5
          }
        },
        {
          'id': 'ship-model-layer',
          'type': 'model',
          'source': 'ship-model-source',
          'slot': 'top',
          'layout': {
            'visibility': 'none'
          },
          'paint': {
            'model-translation': [0, 0, ['feature-state', 'z-elevation']],
            'model-scale': [
              'interpolate',
              ['exponential', 0.5],
              ['zoom'],
              2, ['literal', [15000, 15000, 15000]],
              14, ['literal', [20, 20, 20]]
            ],
            'model-type': 'location-indicator',
            'model-rotation': [
              ['feature-state', 'pitch'],
              ['feature-state', 'roll'],
              ['feature-state', 'bearing']
            ],
            'model-emissive-strength': 1.5
          }
        }
      ]
    };

    // Update 3D model source and feature state
    function updateModelSourceAndFeatureState(airplane) {
      const isUsingTrain = (currentModelUri === trainModelUri);
      const isUsingCar = (currentModelUri === carModelUri);
      const isUsingShip = (currentModelUri === shipModelUri);

      let activeLayerId, activeSourceId, activeModelId, vehicleType;
      if (isUsingTrain) {
        activeLayerId = 'train-model-layer';
        activeSourceId = 'train-model-source';
        activeModelId = 'train';
        vehicleType = 'train';
      } else if (isUsingCar) {
        activeLayerId = 'car-model-layer';
        activeSourceId = 'car-model-source';
        activeModelId = 'car';
        vehicleType = 'car';
      } else if (isUsingShip) {
        activeLayerId = 'ship-model-layer';
        activeSourceId = 'ship-model-source';
        activeModelId = 'ship';
        vehicleType = 'ship';
      } else {
        activeLayerId = 'plane-model-layer';
        activeSourceId = 'plane-model-source';
        activeModelId = 'plane';
        vehicleType = 'plane';
      }

      if (needsModelUpdate) {

        // Show active layer, hide all other layers
        map.setLayoutProperty('plane-model-layer', 'visibility', vehicleType === 'plane' ? 'visible' : 'none');
        map.setLayoutProperty('train-model-layer', 'visibility', vehicleType === 'train' ? 'visible' : 'none');
        map.setLayoutProperty('car-model-layer', 'visibility', vehicleType === 'car' ? 'visible' : 'none');
        map.setLayoutProperty('ship-model-layer', 'visibility', vehicleType === 'ship' ? 'visible' : 'none');

        needsModelUpdate = false;
      }

      // Update model position
      const source = map.getSource(activeSourceId);
      if (source) {
        source.setModels({
          [activeModelId]: {
            'uri': currentModelUri,
            'position': airplane.position,
            'orientation': [0, 0, 0]
          }
        });
      }

      // Update feature state for rotation and elevation
      // Trains, cars, and ships stay level (pitch 0), planes use calculated pitch
      map.setFeatureState(
        { source: activeSourceId, id: activeModelId },
        {
          'z-elevation': airplane.altitude,
          'pitch': (isUsingTrain || isUsingCar || isUsingShip) ? 0 : airplane.pitch,
          'roll': airplane.roll,
          'bearing': airplane.bearing + (isUsingTrain ? 90 : (isUsingCar ? 0 : (isUsingShip ? 270 : 90)))
        }
      );
    }

    // Initialize map
    const map = new mapboxgl.Map({
      container: 'map',
      projection: 'globe',
      style,
      center: destinations[0].origin.coords, // Start at first route's origin
      zoom: 2,
      bearing: 0,
      pitch: 0,
      preserveDrawingBuffer: true, // Required for video recording
      touchZoomRotate: true, // Enable pinch-to-zoom and rotation on mobile
      touchPitch: true, // Enable two-finger tilt gesture
      dragRotate: true, // Enable drag to rotate
      doubleClickZoom: true // Enable double-tap to zoom
    });

    // Navigation and scale controls removed for cleaner interface
    // Users can still zoom with scroll/pinch and rotate with right-click/drag or touch gestures

    // Map selection mode variables
    let mapSelectionMode = false;
    let selectingOrigin = true;
    let tempOriginData = null;
    let tempDestinationData = null;
    let mapSelectionMarkers = [];

    // Start map selection from modal
    window.startMapSelectionFromModal = function() {
      // Hide the modal temporarily
      document.getElementById('edit-route-modal').classList.remove('show');

      // Start map selection
      startMapSelection();
    }

    // Start map selection mode
    function startMapSelection() {
      mapSelectionMode = true;
      selectingOrigin = true;
      tempOriginData = null;
      tempDestinationData = null;

      // Show overlay
      document.getElementById('map-select-overlay').style.display = 'flex';
      document.getElementById('selection-type').textContent = 'Origin';

      // Change cursor
      map.getCanvas().style.cursor = 'crosshair';

      // Close mobile menu if open
      if (window.innerWidth <= 768) {
        closeMobileMenu();
      }
    }

    // Cancel map selection mode
    window.cancelMapSelection = function() {
      mapSelectionMode = false;

      // Hide overlay
      document.getElementById('map-select-overlay').style.display = 'none';

      // Reset cursor
      map.getCanvas().style.cursor = '';

      // Remove temporary markers
      mapSelectionMarkers.forEach(marker => marker.remove());
      mapSelectionMarkers = [];

      // Clear temporary data
      tempOriginData = null;
      tempDestinationData = null;

      // Reopen the modal
      document.getElementById('edit-route-modal').classList.add('show');
    }

    // Reverse geocode using Mapbox Geocoding API v6
    async function reverseGeocode(lng, lat) {
      const accessToken = mapboxgl.accessToken;
      const url = `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&language=en&access_token=${accessToken}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          const properties = feature.properties || {};

          // Debug: log the response to see structure
          console.log('Geocoding v6 response:', properties);

          // Get the most appropriate name
          let name = properties.name ||
                    properties.place_formatted ||
                    properties.full_address ||
                    `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

          // Extract country code for flag - v6 API structure
          let flag = '';

          // Try different ways to get country code from v6 response
          let countryCode = properties.country_code ||
                           properties.country_code_alpha_2 ||
                           properties.country_code_alpha_3;

          // If not found in properties, check context
          if (!countryCode && properties.context) {
            if (properties.context.country) {
              countryCode = properties.context.country.country_code ||
                           properties.context.country.country_code_alpha_2 ||
                           properties.context.country.country_code_alpha_3;
            }
          }

          // Get flag using the library (handles both 2 and 3 letter codes)
          if (countryCode) {
            flag = getCountryFlag(countryCode);
          }

          return {
            name: name,
            coords: [lng, lat],
            flag: flag
          };
        }
      } catch (error) {
        console.error('Reverse geocoding failed:', error);
      }

      // Fallback to coordinates if geocoding fails
      return {
        name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        coords: [lng, lat],
        flag: ''
      };
    }

    // Get country flag emoji from country code
    function getCountryFlag(countryCode) {
      if (!countryCode) return '';

      // Use the country-code-emoji library if available
      if (typeof countryCodeEmoji !== 'undefined') {
        try {
          // The library accepts both 2-letter and 3-letter codes
          const flag = countryCodeEmoji(countryCode.toUpperCase());
          if (flag) return flag;
        } catch (e) {
          console.log('Flag not found for:', countryCode);
        }
      }

      // Fallback: Convert 2-letter country code to flag emoji using Unicode
      if (countryCode.length === 2) {
        const codePoints = countryCode
          .toUpperCase()
          .split('')
          .map(char => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
      }

      // Fallback mapping for 3-letter codes
      const alpha3ToEmoji = {
        'USA': '🇺🇸', 'MEX': '🇲🇽', 'JPN': '🇯🇵', 'THA': '🇹🇭',
        'VNM': '🇻🇳', 'CZE': '🇨🇿', 'HUN': '🇭🇺', 'AUT': '🇦🇹',
        'GBR': '🇬🇧', 'FRA': '🇫🇷', 'DEU': '🇩🇪', 'ITA': '🇮🇹',
        'ESP': '🇪🇸', 'CAN': '🇨🇦', 'AUS': '🇦🇺', 'CHN': '🇨🇳',
        'KOR': '🇰🇷', 'IND': '🇮🇳', 'BRA': '🇧🇷', 'RUS': '🇷🇺'
      };

      return alpha3ToEmoji[countryCode.toUpperCase()] || '';
    }

    // Handle map click during selection mode
    map.on('click', async (e) => {
      if (!mapSelectionMode) return;

      const { lng, lat } = e.lngLat;

      // Add a temporary marker
      const marker = new mapboxgl.Marker({ color: selectingOrigin ? '#00ff00' : '#ff0000' })
        .setLngLat([lng, lat])
        .addTo(map);
      mapSelectionMarkers.push(marker);

      // Reverse geocode the location
      const locationData = await reverseGeocode(lng, lat);

      if (selectingOrigin) {
        tempOriginData = locationData;

        // Switch to destination selection
        selectingOrigin = false;
        document.getElementById('selection-type').textContent = 'Destination';

        // Show popup with origin info
        new mapboxgl.Popup({ offset: 25, closeButton: false })
          .setLngLat([lng, lat])
          .setHTML(`<strong>Origin:</strong> ${locationData.name}`)
          .addTo(map);
      } else {
        tempDestinationData = locationData;

        // Set the values in the form
        document.getElementById('route-origin-input').value = tempOriginData.name;
        document.getElementById('route-origin-name').value = tempOriginData.name;
        document.getElementById('route-origin-coords').value = tempOriginData.coords.join(',');
        document.getElementById('route-origin-flag').textContent = tempOriginData.flag;
        document.getElementById('route-origin-flag-value').value = tempOriginData.flag;

        document.getElementById('route-destination-input').value = tempDestinationData.name;
        document.getElementById('route-destination').value = tempDestinationData.name;
        document.getElementById('route-coords').value = tempDestinationData.coords.join(',');
        document.getElementById('route-destination-flag').textContent = tempDestinationData.flag;
        document.getElementById('route-destination-flag-value').value = tempDestinationData.flag;

        // Set selected coordinates
        selectedOriginCoords = tempOriginData.coords;
        selectedDestinationCoords = tempDestinationData.coords;

        // Clean up map selection mode
        mapSelectionMode = false;
        document.getElementById('map-select-overlay').style.display = 'none';
        map.getCanvas().style.cursor = '';

        // Remove temporary markers
        mapSelectionMarkers.forEach(marker => marker.remove());
        mapSelectionMarkers = [];

        // Show popup with destination info
        new mapboxgl.Popup({ offset: 25, closeButton: false })
          .setLngLat([lng, lat])
          .setHTML(`<strong>Destination:</strong> ${locationData.name}`)
          .addTo(map);

        // Reopen the modal with the selected data
        setTimeout(() => {
          document.getElementById('edit-route-modal').classList.add('show');
        }, 500);
      }
    });

    // Add custom overlay layers after map loads
    map.on('load', () => {
      map.addLayer(distanceOverlayLayer);
      map.addLayer(destinationLabelLayer);
      map.addLayer(modalOverlayLayer);
    });

    // Custom overlay layers for canvas recording
    let canvasOverlaysVisible = false; // Show overlays only when recording
    let currentRouteInfo = null;
    let modalData = null;
    let overlayCanvas = null;
    let overlayCtx = null;

    // Confetti system for recording
    let confettiParticles = [];
    let confettiActive = false;

    // Modal scrolling for long route lists
    let modalScrollY = 0;
    let modalScrollSpeed = 1; // Pixels per frame
    let modalScrollDirection = 1; // 1 for down, -1 for up
    let modalContentHeight = 0;
    let modalVisibleHeight = 0;
    let modalScrollPaused = 0; // Pause counter at top/bottom

    // Confetti particle class
    class ConfettiParticle {
      constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = Math.random() * 1 + 0.5; // Slower initial velocity (downward)
        this.gravity = 0.075; // Half the gravity for slower falling
        this.opacity = 1;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
        this.size = Math.random() * 10 + 5;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        this.width = width;
        this.height = height;
      }

      update() {
        // Only update if not on ground
        if (this.y < this.height - this.size) {
          this.x += this.vx;
          this.y += this.vy;
          this.vy += this.gravity;
          this.rotation += this.rotationSpeed;

          // Stop at ground level
          if (this.y >= this.height - this.size) {
            this.y = this.height - this.size;
            this.vy = 0;
            this.vx *= 0.5; // Reduce horizontal movement when landed
            this.rotationSpeed *= 0.5;
          }
        } else {
          // On ground - slow fade
          this.opacity *= 0.995;
          this.vx *= 0.98; // Friction
        }

        // Bounce off side edges
        if (this.x < 0 || this.x > this.width) {
          this.vx *= -0.5;
        }
      }

      draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
        ctx.restore();
      }
    }

    // Initialize confetti
    function startConfetti(width, height) {
      confettiActive = true;
      confettiParticles = [];

      // Create 200 confetti particles starting from the top
      for (let i = 0; i < 200; i++) {
        confettiParticles.push(new ConfettiParticle(
          Math.random() * width,
          -Math.random() * 150, // Triple the vertical spacing above the visible area
          width,
          height
        ));
      }

      // Stop confetti after 5 seconds
      setTimeout(() => {
        confettiActive = false;
      }, 5000);
    }

    // Update and draw confetti
    function updateConfetti(ctx, width, height) {
      if (!confettiActive && confettiParticles.length === 0) return;

      // Update particles
      confettiParticles = confettiParticles.filter(particle => {
        particle.update();
        return particle.opacity > 0.01; // Only remove when fully faded
      });

      // Draw particles
      confettiParticles.forEach(particle => {
        particle.draw(ctx);
      });
    }

    // Create overlay canvas for drawing UI elements
    function createOverlayCanvas() {
      if (overlayCanvas) return;

      const mapCanvas = map.getCanvas();
      overlayCanvas = document.createElement('canvas');
      overlayCanvas.width = mapCanvas.width;
      overlayCanvas.height = mapCanvas.height;
      overlayCanvas.style.position = 'absolute';
      overlayCanvas.style.top = '0';
      overlayCanvas.style.left = '0';
      overlayCanvas.style.pointerEvents = 'none';
      overlayCanvas.style.display = 'none';
      overlayCanvas.style.zIndex = '1000';
      document.getElementById('map').appendChild(overlayCanvas);
      overlayCtx = overlayCanvas.getContext('2d');
    }

    // Draw overlay UI elements on the overlay canvas
    function drawOverlayUI() {
      if (!canvasOverlaysVisible || !overlayCanvas || !overlayCtx) return;

      const mapCanvas = map.getCanvas();
      overlayCanvas.width = mapCanvas.width;
      overlayCanvas.height = mapCanvas.height;
      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

      // Calculate scale factor based on canvas dimensions (using 1920x1080 as base)
      const baseWidth = 1920;
      const baseHeight = 1080;
      const scaleX = overlayCanvas.width / baseWidth;
      const scaleY = overlayCanvas.height / baseHeight;
      const scale = Math.min(scaleX, scaleY); // Use the smaller scale to ensure everything fits

      // Helper function to scale font sizes
      const scaledFont = (size) => Math.round(size * scale);

      // Helper function to draw rounded rectangle
      const drawRoundedRect = (x, y, width, height, radius) => {
        overlayCtx.beginPath();
        overlayCtx.moveTo(x + radius, y);
        overlayCtx.lineTo(x + width - radius, y);
        overlayCtx.quadraticCurveTo(x + width, y, x + width, y + radius);
        overlayCtx.lineTo(x + width, y + height - radius);
        overlayCtx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        overlayCtx.lineTo(x + radius, y + height);
        overlayCtx.quadraticCurveTo(x, y + height, x, y + height - radius);
        overlayCtx.lineTo(x, y + radius);
        overlayCtx.quadraticCurveTo(x, y, x + radius, y);
        overlayCtx.closePath();
        overlayCtx.fill();
      };

      // Draw distance counter (hide when modal is showing)
      if (totalAccumulatedDistance > 0 && !modalData) {
        const distanceText = Math.round(totalAccumulatedDistance).toLocaleString() + ' km';
        overlayCtx.save();
        overlayCtx.font = `700 ${scaledFont(67)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`;
        const metrics = overlayCtx.measureText(distanceText);
        const padding = scaledFont(30);
        const boxWidth = metrics.width + padding * 2;
        const boxHeight = scaledFont(60);
        const x = overlayCanvas.width - boxWidth - scaledFont(20);
        const y = scaledFont(20);

        overlayCtx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        drawRoundedRect(x, y, boxWidth, boxHeight, scaledFont(15));

        overlayCtx.fillStyle = 'white';
        overlayCtx.textAlign = 'center';
        overlayCtx.textBaseline = 'middle';
        overlayCtx.fillText(distanceText, x + boxWidth / 2, y + boxHeight / 2);
        overlayCtx.restore();
      }

      // Draw route info panel
      if (currentRouteInfo) {
        overlayCtx.save();

        const panelX = scaledFont(30);
        const panelY = scaledFont(30);
        const padding = scaledFont(35);

        // Measure text to determine panel width
        overlayCtx.font = `600 ${scaledFont(34)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`;
        const routeText = `${currentRouteInfo.from.name}    →    ${currentRouteInfo.to.name}`;
        const textWidth = overlayCtx.measureText(routeText).width;

        // Add space for flags
        const flagSpace = scaledFont(100); // Space for 2 flags
        const panelWidth = Math.max(textWidth + flagSpace + (padding * 2), scaledFont(450));
        const panelHeight = scaledFont(140);

        // Draw panel background
        overlayCtx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        drawRoundedRect(panelX, panelY, panelWidth, panelHeight, scaledFont(15));

        // Draw route line (origin -> destination)
        let xOffset = panelX + padding;
        const yOffset = panelY + scaledFont(50);

        // Origin flag
        overlayCtx.font = `${scaledFont(36)}px sans-serif`;
        overlayCtx.textAlign = 'left';
        overlayCtx.fillText(currentRouteInfo.from.flag, xOffset, yOffset);
        xOffset += scaledFont(45);

        // Origin name
        overlayCtx.fillStyle = 'white';
        overlayCtx.font = `600 ${scaledFont(34)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`;
        overlayCtx.fillText(currentRouteInfo.from.name, xOffset, yOffset);
        xOffset += overlayCtx.measureText(currentRouteInfo.from.name).width;

        // Arrow
        overlayCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        overlayCtx.font = `${scaledFont(34)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`;
        const arrow = '  →  ';
        overlayCtx.fillText(arrow, xOffset, yOffset);
        xOffset += overlayCtx.measureText(arrow).width;

        // Destination flag
        overlayCtx.font = `${scaledFont(36)}px sans-serif`;
        overlayCtx.fillText(currentRouteInfo.to.flag, xOffset, yOffset);
        xOffset += scaledFont(45);

        // Destination name
        overlayCtx.fillStyle = 'white';
        overlayCtx.font = `600 ${scaledFont(34)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`;
        overlayCtx.fillText(currentRouteInfo.to.name, xOffset, yOffset);

        // Route distance (centered below)
        overlayCtx.fillStyle = '#667eea';
        overlayCtx.font = `700 ${scaledFont(48)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`;
        overlayCtx.textAlign = 'center';
        const distanceText = formatNumberWithCommas(Math.round(currentRouteInfo.routeDistance)) + ' km';
        overlayCtx.fillText(distanceText, panelX + panelWidth / 2, panelY + scaledFont(100));

        overlayCtx.restore();
      }

      // Draw modal (celebratory version for canvas/recording)
      if (modalData) {
        overlayCtx.save();

        // Earth's circumference at equator
        const earthCircumference = 40075; // km
        const timesAroundEarth = (modalData.totalDistance / earthCircumference).toFixed(2);

        // Smaller, centered celebratory modal
        const modalWidth = scaledFont(700);
        const modalHeight = scaledFont(400);
        const x = (overlayCanvas.width - modalWidth) / 2;
        const y = (overlayCanvas.height - modalHeight) / 2;

        // Draw modal background with gradient
        const gradient = overlayCtx.createLinearGradient(x, y, x, y + modalHeight);
        gradient.addColorStop(0, 'rgba(102, 126, 234, 0.95)');
        gradient.addColorStop(1, 'rgba(67, 56, 202, 0.95)');
        overlayCtx.fillStyle = gradient;
        drawRoundedRect(x, y, modalWidth, modalHeight, scaledFont(20));

        // Draw tour name at top
        overlayCtx.font = `700 ${scaledFont(56)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`;
        overlayCtx.fillStyle = 'white';
        overlayCtx.textAlign = 'center';
        overlayCtx.fillText(modalData.title, x + modalWidth / 2, y + scaledFont(100));

        // Draw total distance (big and bold)
        overlayCtx.fillStyle = 'white';
        overlayCtx.font = `900 ${scaledFont(100)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`;
        overlayCtx.textAlign = 'center';
        overlayCtx.fillText(formatNumberWithCommas(modalData.totalDistance), x + modalWidth / 2, y + scaledFont(230));

        // Draw "kilometers" label
        overlayCtx.font = `400 ${scaledFont(32)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`;
        overlayCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        overlayCtx.fillText('kilometers', x + modalWidth / 2, y + scaledFont(270));

        // Draw Earth comparison
        overlayCtx.fillStyle = '#FFD700'; // Gold color
        overlayCtx.font = `600 ${scaledFont(38)}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`;
        overlayCtx.textAlign = 'center';
        const earthText = timesAroundEarth >= 1
          ? `${timesAroundEarth}x around Earth`
          : `${(parseFloat(timesAroundEarth) * 100).toFixed(0)}% around Earth`;
        overlayCtx.fillText(earthText, x + modalWidth / 2, y + scaledFont(340));

        overlayCtx.restore();
      }

      // Draw confetti on top of everything
      updateConfetti(overlayCtx, overlayCanvas.width, overlayCanvas.height);

      requestAnimationFrame(drawOverlayUI);
    }

    // Distance counter overlay layer (dummy - just triggers repaints)
    const distanceOverlayLayer = {
      id: 'distance-overlay',
      type: 'custom',
      renderingMode: '2d',
      onAdd: function() {},
      render: function() {
        if (canvasOverlaysVisible) {
          map.triggerRepaint();
        }
      }
    };

    // Destination label overlay layer (dummy)
    const destinationLabelLayer = {
      id: 'destination-label-overlay',
      type: 'custom',
      renderingMode: '2d',
      onAdd: function() {},
      render: function() {}
    };

    // Modal overlay layer (dummy)
    const modalOverlayLayer = {
      id: 'modal-overlay',
      type: 'custom',
      renderingMode: '2d',
      onAdd: function() {},
      render: function() {}
    };

    let currentLegIndex = 0;
    let isAnimating = false;
    let flightRoute = null;
    let airplane = null;
    let phase = 0;
    let lastFrameTime = null;
    let animationFrameId = null;
    let currentFlightDuration = 5000; // Will be calculated based on distance
    let currentSegmentTrailCoordinates = []; // Store current segment trail coordinates
    let trailAltitudes = []; // Store altitudes separately
    let segmentCounter = 0; // Counter for unique segment IDs
    // Initialize with the first destination's vehicle
    let currentModelUri = destinations[0].vehicle === 'train' ? trainModelUri :
                          destinations[0].vehicle === 'car' ? carModelUri :
                          destinations[0].vehicle === 'ship' ? shipModelUri : airplaneModelUri;
    let lastModelUri = null; // Track last loaded model to avoid unnecessary updates
    let needsModelUpdate = true; // Flag to trigger model switch

    // Show route info panel
    function showRouteInfo(from, to, routeDistance) {
      const panel = document.getElementById('route-info-panel');
      if (!panel) return;

      // Format the distance for display
      const distanceDisplay = routeDistance ? formatNumberWithCommas(Math.round(routeDistance)) : '0';

      panel.innerHTML = `
        <div class="route-info-line">
          <span class="route-info-flag">${from.flag || ''}</span>
          <span class="route-info-name">${from.name}</span>
          <span class="route-info-arrow">→</span>
          <span class="route-info-flag">${to.flag || ''}</span>
          <span class="route-info-name">${to.name}</span>
        </div>
        <div class="route-info-distance">${distanceDisplay} km</div>
      `;

      panel.classList.add('show');

      // Update canvas overlay data for recording
      currentRouteInfo = {
        from: {
          flag: from.flag || '',
          name: from.name
        },
        to: {
          flag: to.flag || '',
          name: to.name
        },
        routeDistance: routeDistance || 0
      };
    }

    // Hide route info panel
    function hideRouteInfo() {
      const panel = document.getElementById('route-info-panel');
      if (panel) {
        panel.classList.remove('show');
      }
      currentRouteInfo = null;
    }

    // Update distance counter display
    function updateDistanceDisplay() {
      const counter = document.getElementById('distance-counter');
      const formattedDistance = Math.round(totalAccumulatedDistance).toLocaleString();
      counter.innerHTML = `${formattedDistance} <span>km</span>`;

      // Hide distance counter when mobile menu is open
      if (window.innerWidth <= 768) {
        const menu = document.getElementById('left-menu');
        if (menu.classList.contains('active')) {
          counter.style.display = 'none';
        } else {
          counter.style.display = '';
        }
      }
    }

    // Update route with control points
    function updateRoutePreview(segmentKey) {
      const i = parseInt(segmentKey);
      const route = destinations[i];
      const from = route.origin;
      const to = { name: route.name, coords: route.coords };
      const vehicle = route.vehicle || 'plane';
      const previewSourceId = `preview-route-${i}`;

      // Regenerate route with control points
      const controlPoints = routeControlPoints[segmentKey] || [];
      const updatedRoute = generateCurvedRoute(from.coords, to.coords, controlPoints.length > 0 ? controlPoints : null, vehicle);
      previewRoutes[segmentKey] = updatedRoute;

      // Update preview line
      const source = map.getSource(previewSourceId);
      if (source) {
        source.setData({
          'type': 'Feature',
          'geometry': makeLineGeometry(updatedRoute.coordinates)
        });
      }
    }

    // Add control point to route
    function addControlPoint(segmentKey, lngLat) {
      if (!routeControlPoints[segmentKey]) {
        routeControlPoints[segmentKey] = [];
      }

      const i = parseInt(segmentKey);
      const route = destinations[i];
      const vehicle = route.vehicle || 'plane';
      const markerClass = vehicle === 'train' ? 'train' : (vehicle === 'car' ? 'car' : 'plane');

      // Create the control point object with a unique ID
      const controlPoint = {
        coords: [lngLat.lng, lngLat.lat],
        id: Date.now() + Math.random() // Unique ID
      };

      routeControlPoints[segmentKey].push(controlPoint);
      console.log(`Added control point to route ${segmentKey}:`, controlPoint);
      console.log('Current routeControlPoints:', routeControlPoints);


      // Create draggable marker
      const markerEl = document.createElement('div');
      markerEl.className = `control-point-marker ${markerClass}`;

      const marker = new mapboxgl.Marker({
        element: markerEl,
        draggable: true,
        anchor: 'center',
        pitchAlignment: 'viewport',
        rotationAlignment: 'viewport'
      })
        .setLngLat(lngLat)
        .addTo(map);

      // Store marker metadata with reference to the control point object
      const markerData = { marker, segmentKey, controlPoint };
      controlPointMarkers.push(markerData);

      // Handle drag to update route
      marker.on('drag', () => {
        const newLngLat = marker.getLngLat();
        // Update the control point coordinates directly
        controlPoint.coords[0] = newLngLat.lng;
        controlPoint.coords[1] = newLngLat.lat;
        updateRoutePreview(segmentKey);
      });

      // Handle right-click to delete (desktop)
      markerEl.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();

        deleteControlPoint();
      });

      // Handle long-press to delete (mobile)
      let longPressTimer = null;
      let isLongPress = false;

      markerEl.addEventListener('touchstart', (e) => {
        isLongPress = false;
        longPressTimer = setTimeout(() => {
          isLongPress = true;
          e.preventDefault();
          e.stopPropagation();

          // Vibrate if supported
          if (navigator.vibrate) {
            navigator.vibrate(50);
          }

          // Show confirmation or directly delete
          if (confirm('Delete this waypoint?')) {
            deleteControlPoint();
          }
        }, 500); // 500ms for long press
      });

      markerEl.addEventListener('touchend', () => {
        clearTimeout(longPressTimer);
      });

      markerEl.addEventListener('touchmove', () => {
        clearTimeout(longPressTimer);
      });

      // Function to delete the control point
      function deleteControlPoint() {
        // Find and remove from control points array
        const pointIndex = routeControlPoints[segmentKey].indexOf(controlPoint);
        if (pointIndex > -1) {
          routeControlPoints[segmentKey].splice(pointIndex, 1);
        }

        // Remove marker from tracking array
        const markerIndex = controlPointMarkers.indexOf(markerData);
        if (markerIndex > -1) {
          controlPointMarkers.splice(markerIndex, 1);
        }

        marker.remove();
        updateRoutePreview(segmentKey);
      }

      updateRoutePreview(segmentKey);
    }

    // Initialize route editor
    function initializeRouteEditor() {
      // Show edit mode overlay on map
      document.getElementById('edit-mode-overlay').style.display = 'block';

      // Create preview routes for all segments
      for (let i = 0; i < destinations.length; i++) {
        const route = destinations[i];
        const from = route.origin;
        const to = { name: route.name, coords: route.coords };
        const segmentKey = `${i}`;

        // Initialize empty control points array
        if (!routeControlPoints[segmentKey]) {
          routeControlPoints[segmentKey] = [];
        }

        // Generate preview route (straight line initially)
        const routeData = generateCurvedRoute(from.coords, to.coords, null);
        previewRoutes[segmentKey] = routeData;

        // Determine vehicle type for dash pattern
        const vehicle = route.vehicle || 'plane';
        const isUsingTrain = (vehicle === 'train');

        // Add preview line layer
        const previewSourceId = `preview-route-${i}`;
        const previewLayerId = `preview-route-layer-${i}`;

        map.addSource(previewSourceId, {
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'properties': { segmentKey },
            'geometry': makeLineGeometry(routeData.coordinates)
          }
        });

        map.addLayer({
          'id': previewLayerId,
          'type': 'line',
          'source': previewSourceId,
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color': '#ffffff',
            'line-width': 6,
            'line-opacity': 0.8,
            'line-emissive-strength': 5,
            'line-dasharray': isUsingTrain ? [1, 0] : [2, 4]
          }
        });

        // Make line clickable to add control points
        map.on('click', previewLayerId, (e) => {
          e.preventDefault();
          e.originalEvent.stopPropagation();
          const lngLat = e.lngLat;
          addControlPoint(segmentKey, lngLat);
        });

        // Change cursor on hover
        map.on('mouseenter', previewLayerId, () => {
          map.getCanvas().style.cursor = 'crosshair';
        });

        map.on('mouseleave', previewLayerId, () => {
          map.getCanvas().style.cursor = '';
        });
      }
    }

    // Clean up route editor
    function cleanupRouteEditor() {
      // Hide edit mode overlay on map
      document.getElementById('edit-mode-overlay').style.display = 'none';

      // Remove all control point markers
      controlPointMarkers.forEach(({ marker }) => {
        marker.remove();
      });
      controlPointMarkers = [];

      // Remove ALL preview layers and sources (not just current destinations.length)
      // This ensures we clean up layers from deleted routes too
      const style = map.getStyle();
      if (style && style.layers) {
        // Find all preview route layers
        const previewLayers = style.layers.filter(layer =>
          layer.id.startsWith('preview-route-layer-')
        );

        previewLayers.forEach(layer => {
          // Remove event listeners
          map.off('click', layer.id);
          map.off('mouseenter', layer.id);
          map.off('mouseleave', layer.id);

          // Remove layer
          if (map.getLayer(layer.id)) {
            map.removeLayer(layer.id);
          }
        });
      }

      if (style && style.sources) {
        // Find all preview route sources
        const previewSources = Object.keys(style.sources).filter(source =>
          source.startsWith('preview-route-')
        );

        previewSources.forEach(source => {
          if (map.getSource(source)) {
            map.removeSource(source);
          }
        });
      }

      // Clear preview routes object
      previewRoutes = {};
      routeControlPoints = {};
    }

    // Save routes and start tour
    function saveAndStartTour() {
      // Close mobile menu if open
      if (window.innerWidth <= 768) {
        closeMobileMenu();
      }

      if (isEditMode) {
        // Save control points before cleanup
        const savedControlPoints = { ...routeControlPoints };

        // Clean up editor and start animation
        cleanupRouteEditor();
        isEditMode = false;
        document.getElementById('start-btn').textContent = 'Restart Tour';
        document.getElementById('edit-btn').style.display = 'inline-block';

        // Hide edit mode overlay
        document.getElementById('edit-mode-overlay').style.display = 'none';

        // Restore the control points for the tour
        routeControlPoints = savedControlPoints;
        console.log('Restored control points for tour:', routeControlPoints);

        // Start recording if checkbox is checked
        const recordCheckbox = document.getElementById('record-checkbox');
        if (recordCheckbox && recordCheckbox.checked) {
          startRecording();
        }

        startTour();
      } else {
        // Restart from beginning - properly stop and reset everything first

        // 1. Stop the animation loop
        isAnimating = false;
        if (animationFrameId) {
          window.cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }

        // 2. Reset state variables immediately
        currentLegIndex = 0;
        phase = 0;
        lastFrameTime = null;
        totalAccumulatedDistance = 0;
        completedLegsDistance = 0;
        currentSegmentTrailCoordinates = [];
        trailAltitudes = [];
        confettiActive = false;
        confettiParticles = [];

        // 3. Close any open modals
        const completionModal = document.getElementById('completion-modal');
        if (completionModal && completionModal.style.display === 'block') {
          completionModal.style.display = 'none';
          completionModal.style.opacity = '0';
          modalData = null;
        }

        // 4. Clean up all trail segments from previous tour
        const style = map.getStyle();
        if (style && style.layers) {
          const segmentLayers = style.layers.filter(layer => layer.id.startsWith('trail-segment-layer-'));
          segmentLayers.forEach(layer => {
            if (map.getLayer(layer.id)) {
              map.removeLayer(layer.id);
            }
          });
        }
        if (style && style.sources) {
          const segmentSources = Object.keys(style.sources).filter(source => source.startsWith('trail-segment-'));
          segmentSources.forEach(source => {
            if (map.getSource(source)) {
              map.removeSource(source);
            }
          });
        }
        segmentCounter = 0;

        // 5. Update distance display
        updateDistanceDisplay();

        // 6. Wait a bit longer for cleanup, then restart
        setTimeout(() => {
          // Start recording if checkbox is checked
          const recordCheckbox = document.getElementById('record-checkbox');
          if (recordCheckbox && recordCheckbox.checked) {
            startRecording();
          }

          startTour();
        }, 300);
      }
    }

    // Enter edit mode
    function enterEditMode() {
      isEditMode = true;
      document.getElementById('edit-btn').style.display = 'none';
      document.getElementById('start-btn').textContent = 'Save & Start Tour';
      document.getElementById('start-btn').disabled = false; // Re-enable button

      // Stop animation if running
      if (isAnimating) {
        isAnimating = false;
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      }

      // Clean up animation layers
      const style = map.getStyle();
      if (style && style.layers) {
        const segmentLayers = style.layers.filter(layer => layer.id.startsWith('trail-segment-layer-'));
        segmentLayers.forEach(layer => {
          if (map.getLayer(layer.id)) {
            map.removeLayer(layer.id);
          }
        });
      }
      if (style && style.sources) {
        const segmentSources = Object.keys(style.sources).filter(source => source.startsWith('trail-segment-'));
        segmentSources.forEach(source => {
          if (map.getSource(source)) {
            map.removeSource(source);
          }
        });
      }

      // Re-initialize editor with saved control points
      initializeRouteEditor();

      // Re-add all saved control points as markers
      Object.keys(routeControlPoints).forEach(segmentKey => {
        const points = routeControlPoints[segmentKey];
        if (points && points.length > 0) {
          // Clear the array temporarily to avoid duplicates
          const savedPoints = [...points];
          routeControlPoints[segmentKey] = [];

          // Re-add each point
          savedPoints.forEach(point => {
            // Handle both object format and array format
            const coords = point.coords || point;
            addControlPoint(segmentKey, { lng: coords[0], lat: coords[1] });
          });
        }
      });
    }

    // Smoke effect animation
    let smokeCounter = 0;
    function addSmokeEffect(position) {
      const smokeId = `smoke-${smokeCounter++}`;
      const sourceId = `${smokeId}-source`;
      const layerId = `${smokeId}-layer`;

      // Add source with initial small circle
      map.addSource(sourceId, {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'geometry': {
            'type': 'Point',
            'coordinates': position
          }
        }
      });

      // Add circle layer
      map.addLayer({
        'id': layerId,
        'type': 'circle',
        'source': sourceId,
        'paint': {
          'circle-radius': 30,
          'circle-color': '#888888',
          'circle-opacity': 0.8,
          'circle-blur': 0.5,
          'circle-emissive-strength': 3
        }
      });

      // Animate the smoke
      const startTime = Date.now();
      const duration = 500; // Match the delay duration

      function animateSmoke() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        if (progress >= 1) {
          // Remove smoke layer and source
          if (map.getLayer(layerId)) map.removeLayer(layerId);
          if (map.getSource(sourceId)) map.removeSource(sourceId);
          return;
        }

        // Expand radius and fade out
        const radius = 30 + (progress * 120); // Expand from 30 to 150
        const opacity = 0.8 * (1 - progress); // Fade from 0.8 to 0

        map.setPaintProperty(layerId, 'circle-radius', radius);
        map.setPaintProperty(layerId, 'circle-opacity', opacity);

        requestAnimationFrame(animateSmoke);
      }

      animateSmoke();
    }

    // Vehicle pulse effect
    function addVehiclePulseEffect() {
      const isUsingTrain = (currentModelUri === trainModelUri);
      const isUsingCar = (currentModelUri === carModelUri);
      const isUsingShip = (currentModelUri === shipModelUri);

      let activeLayerId;
      if (isUsingTrain) {
        activeLayerId = 'train-model-layer';
      } else if (isUsingCar) {
        activeLayerId = 'car-model-layer';
      } else if (isUsingShip) {
        activeLayerId = 'ship-model-layer';
      } else {
        activeLayerId = 'plane-model-layer';
      }

      const startTime = Date.now();
      const duration = 500; // Match the delay duration
      const baseEmissive = 2; // Base emissive strength
      const maxEmissive = 5; // Peak emissive strength (max allowed)

      function animatePulse() {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress >= 1) {
          // Reset to base emissive
          map.setPaintProperty(activeLayerId, 'model-emissive-strength', baseEmissive);
          return;
        }

        // Create a sine wave pulse effect (0 -> 1 -> 0)
        const pulse = Math.sin(progress * Math.PI * 2); // 2 full cycles
        const emissive = baseEmissive + (pulse * (maxEmissive - baseEmissive));

        map.setPaintProperty(activeLayerId, 'model-emissive-strength', Math.abs(emissive));

        requestAnimationFrame(animatePulse);
      }

      animatePulse();
    }

    // Animation frame
    function frame(time) {
      if (!isAnimating) return;

      if (!lastFrameTime) lastFrameTime = time;
      const frameDeltaTime = time - lastFrameTime;

      phase += frameDeltaTime / currentFlightDuration;
      lastFrameTime = time;

      if (phase >= 1) {
        // Flight leg complete
        phase = 0;

        // Add completed leg distance
        const completedRoute = destinations[currentLegIndex];
        if (completedRoute.actualDistance) {
          completedLegsDistance += completedRoute.actualDistance;
        }

        currentLegIndex++;

        if (currentLegIndex >= destinations.length) {
          // Tour complete
          isAnimating = false;
          document.getElementById('start-btn').disabled = false;
          document.getElementById('start-btn').textContent = 'Restart Tour';

          // Hide route info when tour completes
          hideRouteInfo();

          // Show completion modal with confetti
          showCompletionModal();

          return;
        }

        // Start next leg - now each route has explicit origin and destination
        const route = destinations[currentLegIndex];
        const from = route.origin;
        const to = { name: route.name, coords: route.coords, flag: route.flag };

        // Switch vehicle based on the route's vehicle attribute
        const vehicle = route.vehicle || 'plane'; // Default to plane if not specified
        const previousModelUri = currentModelUri;
        if (vehicle === 'train') {
          currentModelUri = trainModelUri;
        } else if (vehicle === 'car') {
          currentModelUri = carModelUri;
        } else if (vehicle === 'ship') {
          currentModelUri = shipModelUri;
        } else {
          currentModelUri = airplaneModelUri;
        }

        // Set flag if vehicle changed
        if (previousModelUri !== currentModelUri) {
          needsModelUpdate = true;
        }

        // Use saved control points if available
        const segmentKey = `${currentLegIndex}`;
        const controlPoints = routeControlPoints[segmentKey] || [];
        console.log(`Route ${currentLegIndex}: segmentKey=${segmentKey}, controlPoints=`, controlPoints);
        console.log('All routeControlPoints:', routeControlPoints);
        const routeData = generateFlightRoute(from.coords, to.coords, controlPoints.length > 0 ? controlPoints : null, vehicle);
        flightRoute = new FlightRoute(routeData);

        // Create new segment source and layer for this route
        segmentCounter++;
        currentSegmentTrailCoordinates = []; // Reset for new segment

        const isUsingTrain = (currentModelUri === trainModelUri);
        const isUsingCar = (currentModelUri === carModelUri);
        const isUsingShip = (currentModelUri === shipModelUri);
        const trailColor = isUsingTrain ? '#ff0000' : (isUsingCar ? '#ff8800' : (isUsingShip ? '#aaaaaa' : '#ffffff'));
        const sourceId = `trail-segment-${segmentCounter}`;
        const layerId = `trail-segment-layer-${segmentCounter}`;

        // Add source for this segment
        map.addSource(sourceId, {
          'type': 'geojson',
          'data': {
            'type': 'Feature',
            'geometry': {
              'type': 'LineString',
              'coordinates': []
            }
          }
        });

        // Add layer for this segment
        map.addLayer({
          'id': layerId,
          'type': 'line',
          'source': sourceId,
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color': trailColor,
            'line-width': 5,
            'line-opacity': 0.8,
            'line-emissive-strength': 1.5,
            'line-dasharray': (isUsingTrain || isUsingCar || isUsingShip) ? [1, 0] : [2, 4] // Solid line for train/car/ship, dashed for plane
          }
        });

        // Vehicle-specific duration: train 2.5s, car 3s, ship 3.5s, plane 1.5s
        if (isUsingTrain) {
          currentFlightDuration = 2500; // 2.5 seconds
        } else if (isUsingCar) {
          currentFlightDuration = 3000; // 3 seconds
        } else if (isUsingShip) {
          currentFlightDuration = 3500; // 3.5 seconds
        } else {
          currentFlightDuration = 1500; // 1.5 seconds
        }

        // Fit viewport to show both start and end points
        // For trans-Pacific routes, use the great circle path coordinates
        const bounds = new mapboxgl.LngLatBounds();

        // Use all route coordinates to get proper bounds including great circle path
        for (const coord of routeData.coordinates) {
          bounds.extend(coord);
        }

        // Vehicle-specific camera pitch: plane 30°, train/car 70°
        const cameraPitch = (isUsingTrain || isUsingCar || isUsingShip) ? 70 : 30;

        map.fitBounds(bounds, {
          padding: { top: 30, bottom: 30, left: 30, right: 30 },
          duration: 2000,
          pitch: cameraPitch,
          bearing: 0
        });

        // Update route info for the new leg with this route's distance
        showRouteInfo(from, to, route.actualDistance || 0);

        // Pause before next leg
        isAnimating = false;
        setTimeout(() => {
          isAnimating = true;
          lastFrameTime = null;
          animationFrameId = window.requestAnimationFrame(frame);
        }, 0);
        return;
      }

      // Update airplane position
      const alongRoute = flightRoute.sample(flightRoute.totalLength * phase);
      if (alongRoute) {
        airplane.update(alongRoute, frameDeltaTime);

        // For trains, cars, and ships, keep at sea level
        const isUsingTrain = (currentModelUri === trainModelUri);
        const isUsingCar = (currentModelUri === carModelUri);
        const isUsingShip = (currentModelUri === shipModelUri);
        if (isUsingTrain || isUsingCar || isUsingShip) {
          airplane.altitude = 0; // Sea level
        }

        // Update distance tracking
        const currentRoute = destinations[currentLegIndex];
        if (currentRoute.actualDistance) {
          const currentLegProgress = phase * currentRoute.actualDistance;
          totalAccumulatedDistance = completedLegsDistance + currentLegProgress;
          updateDistanceDisplay();
        }

        // Add current position to trail (2D coordinates)
        currentSegmentTrailCoordinates.push([airplane.position[0], airplane.position[1]]);
        trailAltitudes.push(airplane.altitude);

        if (currentSegmentTrailCoordinates.length === 1) {
        }

        // Update trail source
        const trailSourceId = `trail-segment-${segmentCounter}`;

        // Update current segment trail using simple Mapbox line (only if we have at least 2 points)
        const trailSource = map.getSource(trailSourceId);
        if (trailSource && currentSegmentTrailCoordinates.length >= 2) {
          // Split trail into segments when crossing antimeridian
          const trailSegments = [];
          let currentSegment = [currentSegmentTrailCoordinates[0]];

          for (let i = 1; i < currentSegmentTrailCoordinates.length; i++) {
            const prev = currentSegmentTrailCoordinates[i - 1];
            const curr = currentSegmentTrailCoordinates[i];
            const lonDiff = Math.abs(curr[0] - prev[0]);

            // If longitude difference > 180, we crossed the antimeridian
            if (lonDiff > 180) {
              // Close current segment and start new one
              trailSegments.push(currentSegment);
              currentSegment = [curr];
            } else {
              currentSegment.push(curr);
            }
          }

          // Add the last segment
          if (currentSegment.length > 0) {
            trailSegments.push(currentSegment);
          }

          // Create MultiLineString geometry
          trailSource.setData({
            'type': 'Feature',
            'geometry': {
              'type': 'MultiLineString',
              'coordinates': trailSegments
            }
          });
        }
      }

      updateModelSourceAndFeatureState(airplane);

      animationFrameId = window.requestAnimationFrame(frame);
    }

    // Start tour
    function startTour() {
      currentLegIndex = 0;
      phase = 0;
      lastFrameTime = null;
      isAnimating = true;
      currentSegmentTrailCoordinates = []; // Reset current segment trail
      trailAltitudes = []; // Reset altitudes

      // Reset distance tracking
      totalAccumulatedDistance = 0;
      completedLegsDistance = 0;
      updateDistanceDisplay();


      // Clean up all existing segment layers and sources
      const style = map.getStyle();
      if (style && style.layers) {
        const segmentLayers = style.layers.filter(layer => layer.id.startsWith('trail-segment-layer-'));
        segmentLayers.forEach(layer => {
          if (map.getLayer(layer.id)) {
            map.removeLayer(layer.id);
          }
        });
      }
      if (style && style.sources) {
        const segmentSources = Object.keys(style.sources).filter(source => source.startsWith('trail-segment-'));
        segmentSources.forEach(source => {
          if (map.getSource(source)) {
            map.removeSource(source);
          }
        });
      }

      segmentCounter = 0; // Reset segment counter after cleanup

      document.getElementById('start-btn').disabled = true;

      // Generate first route
      const firstRoute = destinations[0];
      const from = firstRoute.origin;
      const to = { name: firstRoute.name, coords: firstRoute.coords };

      // First, center camera on starting point and wait 1 second before starting
      map.flyTo({
        center: from.coords,
        zoom: 2,
        pitch: 0,
        bearing: 0,
        duration: 1500
      });

      // Wait 1 second after camera movement, then start the route
      setTimeout(() => {
      // Switch vehicle based on the route's vehicle attribute
      const vehicle = firstRoute.vehicle || 'plane'; // Default to plane if not specified
      if (vehicle === 'train') {
        currentModelUri = trainModelUri;
      } else if (vehicle === 'car') {
        currentModelUri = carModelUri;
      } else {
        currentModelUri = airplaneModelUri;
      }

      // Set flag for initial model load
      needsModelUpdate = true;

      // Use saved control points if available
      const segmentKey = `${currentLegIndex}`;
      const controlPoints = routeControlPoints[segmentKey] || [];
      const routeData = generateFlightRoute(from.coords, to.coords, controlPoints.length > 0 ? controlPoints : null, vehicle);
      flightRoute = new FlightRoute(routeData);
      airplane = new Airplane(from.coords);

      // Create first segment source and layer
      segmentCounter++;
      const isUsingTrain = (currentModelUri === trainModelUri);
      const isUsingCar = (currentModelUri === carModelUri);
      const isUsingShip = (currentModelUri === shipModelUri);
      const trailColor = isUsingTrain ? '#ff0000' : (isUsingCar ? '#ff8800' : (isUsingShip ? '#aaaaaa' : '#ffffff'));
      const sourceId = `trail-segment-${segmentCounter}`;
      const layerId = `trail-segment-layer-${segmentCounter}`;

      // Add source for first segment
      map.addSource(sourceId, {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'geometry': {
            'type': 'LineString',
            'coordinates': []
          }
        }
      });

      // Add layer for first segment
      map.addLayer({
        'id': layerId,
        'type': 'line',
        'source': sourceId,
        'layout': {
          'line-cap': 'round',
          'line-join': 'round'
        },
        'paint': {
          'line-color': trailColor,
          'line-width': 5,
          'line-opacity': 0.8,
          'line-emissive-strength': 1.5,
          'line-dasharray': (isUsingTrain || isUsingCar || isUsingShip) ? [1, 0] : [2, 4] // Solid line for train/car/ship, dashed for plane
        }
      });

      // Vehicle-specific duration: train 2.5s, car 3s, ship 3.5s, plane 1.5s
      if (isUsingTrain) {
        currentFlightDuration = 2500; // 2.5 seconds
      } else if (isUsingCar) {
        currentFlightDuration = 3000; // 3 seconds
      } else if (isUsingShip) {
        currentFlightDuration = 3500; // 3.5 seconds
      } else {
        currentFlightDuration = 1500; // 1.5 seconds
      }

      // Fit viewport to show both start and end points for first leg
      // For trans-Pacific routes, use the great circle path coordinates
      const bounds = new mapboxgl.LngLatBounds();

      // Use all route coordinates to get proper bounds including great circle path
      for (const coord of routeData.coordinates) {
        bounds.extend(coord);
      }

      // Vehicle-specific camera pitch: plane 30°, train/car 70°
      const cameraPitch = (isUsingTrain || isUsingCar) ? 70 : 30;

      map.fitBounds(bounds, {
        padding: { top: 30, bottom: 30, left: 30, right: 30 },
        duration: 2000,
        pitch: cameraPitch,
        bearing: 0
      });

      // Initialize plane at starting position
      const startPoint = flightRoute.sample(0);
      if (startPoint) {
        airplane.update(startPoint, 0);
        updateModelSourceAndFeatureState(airplane);
      }

      // Show route info panel with this route's distance
      showRouteInfo(from, to, firstRoute.actualDistance || 0);

      animationFrameId = window.requestAnimationFrame(frame);
      }, 1000); // Wait 1 second before starting route
    }

    map.on('style.load', () => {
      // Calculate distances for existing routes
      calculateRouteDistances();

      // Initialize route editor on load
      initializeRouteEditor();

      // Render routes list
      renderRoutesList();

      // Initialize autocomplete
      initializeAutocomplete();
    });

    // Cleanup on page unload to free WebGL contexts
    window.addEventListener('beforeunload', () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (map) {
        map.remove();
      }
    });
  </script>
</body>
</html>
