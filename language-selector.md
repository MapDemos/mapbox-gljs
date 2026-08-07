---
layout: null
title: Language Selector — Map Labels
js: language-selector.js
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

    #panel {
        position: absolute;
        top: 16px;
        left: 16px;
        z-index: 1;
        width: 280px;
        box-sizing: border-box;
        background: var(--slate-900);
        border-top: 2px solid var(--cyan);
        border-radius: 0 0 4px 4px;
        box-shadow: 0 14px 34px rgba(0, 0, 0, 0.4);
        color: var(--paper);
        font-family: 'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif;
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

    .select-row {
        padding: 10px 14px 12px;
        border-top: 1px solid var(--hairline);
        border-bottom: 1px solid var(--hairline);
        background: var(--slate-800);
    }

    .select-row label {
        display: block;
        margin: 0 0 6px;
        font-size: 10px;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: var(--muted);
    }

    #lang-select {
        width: 100%;
        box-sizing: border-box;
        padding: 8px 10px;
        border-radius: 3px;
        border: 1px solid var(--hairline);
        background: var(--slate-700);
        color: var(--paper);
        font-family: 'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif;
        font-size: 13px;
        cursor: pointer;
    }

    #lang-select:focus-visible {
        outline: 2px solid var(--cyan);
        outline-offset: 2px;
    }

    #status {
        margin: 0;
        padding: 10px 14px;
        font-family: 'IBM Plex Mono', monospace;
        font-size: 10px;
        line-height: 1.4;
        color: var(--cyan);
    }

    @media (max-width: 480px) {
        #panel {
            top: 0;
            left: 0;
            right: 0;
            width: auto;
            border-radius: 0;
            border-top: none;
            border-bottom: 2px solid var(--cyan);
        }
    }
    -->
</style>
</head>

<body>
  <div id="map" class="map"></div>

  <section id="panel" aria-label="Map language controls">
    <div class="panel-head">
      <p class="panel-title">Map language</p>
      <p class="panel-sub">Style stays <code>mapbox://styles/mapbox/streets-v12</code>. Switching languages
        rewrites each label layer's <code>text-field</code> to a different <code>name_*</code> field already
        in the vector tiles. Countries, places, and POIs are translated into all 13 languages here — most
        roads aren't, since the tileset only carries a road's local name plus <code>name_en</code>, so an
        untranslated road falls back to English rather than switching.</p>
    </div>

    <div class="select-row">
      <label for="lang-select">Label language</label>
      <select id="lang-select" aria-label="Map label language">
        <option value="en" selected>English</option>
        <option value="ar">العربية (Arabic)</option>
        <option value="de">Deutsch (German)</option>
        <option value="es">Español (Spanish)</option>
        <option value="fr">Français (French)</option>
        <option value="it">Italiano (Italian)</option>
        <option value="ja">日本語 (Japanese)</option>
        <option value="ko">한국어 (Korean)</option>
        <option value="pt">Português (Portuguese)</option>
        <option value="ru">Русский (Russian)</option>
        <option value="vi">Tiếng Việt (Vietnamese)</option>
        <option value="zh-Hans">简体中文 (Chinese, Simplified)</option>
        <option value="zh-Hant">繁體中文 (Chinese, Traditional)</option>
      </select>
    </div>

    <p id="status" role="status">Loaded as shipped — streets-v12 labels default to English.</p>
  </section>
</body>
<script>
  {% include {{ page.js }} %}
</script>

</html>
