---
layout: null
title: Dynamic Style — Label Language
js: dynamic-style.js
---

<html lang="en">

<head>
  {% include common_head.html %}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    <!--
    :root {
        --slate-900: #12181f;
        --slate-800: #1a222b;
        --slate-700: #232e39;
        --cyan: #3ec6d9;
        --lime: #a3d977;
        --paper: #e8ecef;
        --muted: #8b9aa8;
        --hairline: rgba(232, 236, 239, 0.1);
    }

    body {
        margin: 0;
        overflow: hidden;
    }

    .map {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 100%;
    }

    /* Control panel — framed as an inspector reporting on the style, not a
       generic settings box: a header rule, numeric readouts, then a live log. */
    #panel {
        position: absolute;
        top: 16px;
        left: 16px;
        z-index: 1;
        width: 320px;
        box-sizing: border-box;
        /* Never taller than the window — the log gives up its space first. */
        max-height: calc(100vh - 32px);
        display: flex;
        flex-direction: column;
        background: var(--slate-900);
        border-top: 2px solid var(--cyan);
        border-radius: 0 0 4px 4px;
        box-shadow: 0 14px 34px rgba(0, 0, 0, 0.4);
        color: var(--paper);
        font-family: 'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif;
        overflow: hidden;
    }

    .panel-head,
    .switch-row,
    .stats,
    #status {
        flex: 0 0 auto;
    }

    .panel-head {
        padding: 12px 14px 10px;
    }

    .panel-title {
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--cyan);
        margin: 0 0 2px;
    }

    .panel-sub {
        margin: 0;
        font-size: 11px;
        line-height: 1.45;
        color: var(--muted);
    }

    .panel-sub code {
        font-family: 'IBM Plex Mono', monospace;
        font-size: 10px;
        color: var(--paper);
    }

    /* Language switch — a two-ended track, so both states are always readable
       rather than one being hidden behind the knob. */
    .switch-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px 12px;
        border-top: 1px solid var(--hairline);
        border-bottom: 1px solid var(--hairline);
        background: var(--slate-800);
    }

    .switch {
        position: relative;
        display: inline-flex;
        flex: 0 0 auto;
    }

    .switch input {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        margin: 0;
        opacity: 0;
        cursor: pointer;
    }

    .switch-track {
        position: relative;
        display: grid;
        grid-template-columns: 1fr 1fr;
        align-items: center;
        width: 128px;
        height: 28px;
        border-radius: 3px;
        background: var(--slate-700);
        box-shadow: inset 0 0 0 1px var(--hairline);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.04em;
        pointer-events: none;
    }

    .switch-track span {
        position: relative;
        z-index: 1;
        text-align: center;
        color: var(--muted);
        transition: color 140ms ease;
    }

    /* The moving indicator. */
    .switch-track::before {
        content: '';
        position: absolute;
        top: 3px;
        left: 3px;
        width: calc(50% - 3px);
        height: calc(100% - 6px);
        border-radius: 2px;
        background: var(--cyan);
        transition: transform 160ms ease;
    }

    .switch input:checked ~ .switch-track::before {
        transform: translateX(100%);
    }

    .switch-track span:first-child {
        color: var(--slate-900);
    }

    .switch input:checked ~ .switch-track span:first-child {
        color: var(--muted);
    }

    .switch input:checked ~ .switch-track span:last-child {
        color: var(--slate-900);
    }

    .switch input:focus-visible ~ .switch-track {
        outline: 2px solid var(--lime);
        outline-offset: 2px;
    }

    .switch-caption {
        font-size: 10px;
        line-height: 1.35;
        color: var(--muted);
    }

    /* Triage readout — the loop's own accounting, kept visible because the
       classification is the interesting part, not just the end result. */
    .stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        border-bottom: 1px solid var(--hairline);
    }

    .stat {
        padding: 9px 4px 10px;
        text-align: center;
        border-right: 1px solid var(--hairline);
    }

    .stat:last-child {
        border-right: none;
    }

    .stat-value {
        display: block;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 16px;
        font-weight: 500;
        line-height: 1.1;
    }

    .stat-label {
        display: block;
        margin-top: 3px;
        font-size: 8.5px;
        letter-spacing: 0.09em;
        text-transform: uppercase;
        color: var(--muted);
    }

    .stat--rewritten .stat-value {
        color: var(--cyan);
    }

    .stat--skipped .stat-value {
        color: var(--muted);
    }

    #status {
        padding: 9px 14px;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 10px;
        line-height: 1.4;
        color: var(--lime);
        border-bottom: 1px solid var(--hairline);
    }

    #log {
        flex: 1 1 auto;
        min-height: 0;
        max-height: 232px;
        overflow-x: hidden;
        overflow-y: auto;
        overscroll-behavior: contain;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 10px;
    }

    .log-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 8px;
        padding: 4px 14px;
        border-bottom: 1px solid rgba(232, 236, 239, 0.05);
    }

    .log-layer {
        color: var(--paper);
        /* Required for the ellipsis to engage — a flex item won't shrink below
           its content width without it, and the detail would spill off the edge. */
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .log-detail {
        flex: 0 0 auto;
        color: var(--cyan);
    }

    .log-row--skipped .log-layer,
    .log-row--skipped .log-detail {
        color: var(--muted);
    }

    /* Stay top-anchored on narrow screens rather than docking to the bottom, so the
       Mapbox attribution and the zoom controls in the bottom-right remain visible. */
    @media (max-width: 480px) {
        #panel {
            top: 0;
            left: 0;
            right: 0;
            width: auto;
            max-height: 62vh;
            border-radius: 0;
            border-top: none;
            border-bottom: 2px solid var(--cyan);
        }

        #log {
            max-height: none;
        }
    }
    -->
</style>
</head>

<body>
  <div id="map" class="map"></div>

  <section id="panel" aria-label="Label language controls">
    <div class="panel-head">
      <p class="panel-title">Label language</p>
      <p class="panel-sub">Style stays <code>mapbox://styles/mapbox/streets-v12</code>. The toggle loops every
        layer and rewrites <code>text-field</code> in place — no reload, no new tiles.</p>
    </div>

    <div class="switch-row">
      <span class="switch">
        <input type="checkbox" id="lang-toggle" aria-label="Switch label language to Japanese">
        <span class="switch-track" aria-hidden="true">
          <span>EN</span>
          <span>日本語</span>
        </span>
      </span>
      <span class="switch-caption">Flip to run<br>the layer loop</span>
    </div>

    <div class="stats">
      <div class="stat">
        <span class="stat-value" id="stat-scanned">—</span>
        <span class="stat-label">Scanned</span>
      </div>
      <div class="stat">
        <span class="stat-value" id="stat-labelled">—</span>
        <span class="stat-label">Labels</span>
      </div>
      <div class="stat stat--rewritten">
        <span class="stat-value" id="stat-rewritten">—</span>
        <span class="stat-label">Rewritten</span>
      </div>
      <div class="stat stat--skipped">
        <span class="stat-value" id="stat-skipped">—</span>
        <span class="stat-label">Skipped</span>
      </div>
    </div>

    <p id="status" role="status">Loading style…</p>

    <div id="log" tabindex="0" aria-label="Layers touched by the last pass"></div>
  </section>
</body>
<script>
  {% include {{ page.js }} %}
</script>

</html>
