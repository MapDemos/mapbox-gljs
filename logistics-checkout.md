---
layout: none
title: Logistics Checkout Demo
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#0b1020" />
    <title>3PL Handoff Demo · Mapbox</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
    />
    <link
      rel="stylesheet"
      href="https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.css"
    />
    <style>
      /* ==========================================================================
         3PL Handoff Demo — design system + layout
         ========================================================================== */

      :root {
        /* color */
        --ink-900: #0b1020;
        --ink-700: #1f2440;
        --ink-500: #4a5170;
        --ink-400: #6b7390;
        --ink-300: #99a0bd;
        --ink-200: #c9ceea;
        --ink-100: #e6e9f5;
        --paper: #f7f6f3;
        --paper-2: #efede7;
        --white: #ffffff;
        --line: rgba(11, 16, 32, 0.08);
        --line-2: rgba(11, 16, 32, 0.14);

        --brand: #4264fb;
        --brand-600: #3753de;
        --brand-100: #e7ecff;
        --brand-50: #f3f5ff;

        --accent: #f78f1e;
        --accent-50: #fff3e3;
        --ok: #1f8a4c;
        --ok-50: #e6f6ec;
        --warn: #c84a4a;

        --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
          'Helvetica Neue', Arial, sans-serif;
        --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;

        --r-sm: 8px;
        --r: 14px;
        --r-lg: 20px;
        --r-xl: 28px;
        --shadow-1: 0 1px 2px rgba(11, 16, 32, 0.04), 0 1px 1px rgba(11, 16, 32, 0.03);
        --shadow-2: 0 6px 24px rgba(11, 16, 32, 0.06), 0 1px 2px rgba(11, 16, 32, 0.04);
        --shadow-3: 0 24px 60px rgba(11, 16, 32, 0.12), 0 4px 12px rgba(11, 16, 32, 0.06);

        --shell-max: 1240px;
        --gutter: clamp(16px, 3vw, 32px);
      }

      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; }
      body {
        font-family: var(--font-sans);
        color: var(--ink-900);
        background: var(--paper);
        background-image:
          radial-gradient(1200px 600px at 80% -10%, rgba(66, 100, 251, 0.08), transparent 60%),
          radial-gradient(900px 500px at -10% 20%, rgba(247, 143, 30, 0.06), transparent 60%);
        background-attachment: fixed;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        font-size: 15px;
        line-height: 1.5;
        min-height: 100dvh;
        display: flex;
        flex-direction: column;
      }
      a { color: inherit; }

      .topbar {
        display: flex; align-items: center; justify-content: space-between;
        padding: 18px var(--gutter);
        border-bottom: 1px solid var(--line);
        background: rgba(247, 246, 243, 0.85);
        backdrop-filter: saturate(140%) blur(10px);
        position: sticky; top: 0; z-index: 20;
      }
      .brand { display: flex; align-items: center; gap: 10px; font-weight: 600; letter-spacing: -0.01em; }
      .brand-mark {
        width: 22px; height: 22px; border-radius: 6px;
        background: conic-gradient(from 210deg at 50% 50%, #4264fb, #7a92ff, #4264fb 70%);
        box-shadow: inset 0 0 0 1.5px rgba(255, 255, 255, 0.4), 0 4px 10px rgba(66, 100, 251, 0.35);
      }
      .brand-name { font-size: 16px; }
      .brand-sep { color: var(--ink-300); }
      .brand-tag { font-size: 13px; color: var(--ink-500); font-weight: 500; }
      .topbar-meta { display: flex; align-items: center; gap: 10px; }
      .pill {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 6px 12px; font-size: 12.5px; font-weight: 500;
        border-radius: 999px; background: var(--white);
        border: 1px solid var(--line); color: var(--ink-500);
      }
      .pill-live .dot {
        width: 7px; height: 7px; border-radius: 50%;
        background: #1f8a4c;
        box-shadow: 0 0 0 4px rgba(31, 138, 76, 0.18);
        animation: pulse 1.8s ease-out infinite;
      }
      @keyframes pulse {
        0%   { box-shadow: 0 0 0 0 rgba(31, 138, 76, 0.35); }
        70%  { box-shadow: 0 0 0 6px rgba(31, 138, 76, 0); }
        100% { box-shadow: 0 0 0 0 rgba(31, 138, 76, 0); }
      }

      .shell { width: 100%; max-width: var(--shell-max); margin: 0 auto; padding: 32px var(--gutter) 48px; flex: 1; }

      .stepper {
        display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0;
        list-style: none; padding: 0; margin: 0 0 28px; position: relative;
      }
      .stepper::before {
        content: ''; position: absolute; top: 17px; left: 8%; right: 8%;
        height: 2px; background: var(--ink-100); z-index: 0;
      }
      .step { display: flex; align-items: flex-start; gap: 12px; padding: 0 8px; position: relative; z-index: 1; }
      .step-circle {
        flex: none; width: 34px; height: 34px; border-radius: 50%;
        display: grid; place-items: center;
        background: var(--white); border: 2px solid var(--ink-200);
        color: var(--ink-400); font-weight: 600; font-size: 13px;
        transition: all .2s ease;
      }
      .step-eyebrow {
        display: block; font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;
        color: var(--ink-400); font-weight: 500; margin-bottom: 2px;
      }
      .step-label { font-size: 14px; color: var(--ink-500); font-weight: 500; line-height: 1.25; padding-top: 4px; }
      .step.is-active .step-circle {
        background: var(--ink-900); border-color: var(--ink-900); color: var(--white);
        box-shadow: 0 6px 14px rgba(11, 16, 32, 0.25);
      }
      .step.is-active .step-label { color: var(--ink-900); }
      .step.is-done .step-circle { background: var(--brand); border-color: var(--brand); color: var(--white); }
      .step.is-done .step-label { color: var(--ink-700); }
      @media (max-width: 720px) {
        .stepper { grid-template-columns: repeat(3, auto); justify-content: space-between; }
        .step-label { display: none; }
        .stepper::before { left: 30px; right: 30px; }
      }

      .panel { animation: fade .3s ease both; }
      @keyframes fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      .panel[hidden] { display: none; }
      .panel-grid { display: grid; grid-template-columns: 5fr 7fr; gap: 32px; align-items: start; }
      .panel-grid-map { grid-template-columns: 5fr 7fr; }
      @media (max-width: 960px) { .panel-grid { grid-template-columns: 1fr; gap: 20px; } }

      .eyebrow {
        font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;
        color: var(--brand); font-weight: 600; margin: 0 0 12px;
      }
      .panel-title {
        font-size: clamp(28px, 3.4vw, 40px); line-height: 1.1; letter-spacing: -0.02em;
        margin: 0 0 14px; font-weight: 700;
      }
      .panel-sub { color: var(--ink-500); font-size: 16px; margin: 0 0 20px; max-width: 46ch; }
      .bullets { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; color: var(--ink-700); font-size: 14.5px; }
      .bullets li { position: relative; padding-left: 22px; }
      .bullets li::before {
        content: ''; position: absolute; left: 0; top: 8px;
        width: 12px; height: 12px; border-radius: 50%;
        background: var(--brand-100); border: 2px solid var(--brand);
      }

      .card {
        background: var(--white); border: 1px solid var(--line);
        border-radius: var(--r-lg); box-shadow: var(--shadow-2); padding: 28px;
      }
      .card-title {
        font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em;
        color: var(--ink-500); margin: 0 0 18px;
      }

      #address-form { display: flex; flex-direction: column; gap: 14px; }
      .field { display: flex; flex-direction: column; gap: 6px; }
      .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
      @media (max-width: 480px) { .field-row { grid-template-columns: 1fr; } }
      .field label { font-size: 13px; font-weight: 500; color: var(--ink-700); display: flex; align-items: center; gap: 8px; }
      .field label .muted { font-weight: 400; color: var(--ink-400); font-size: 12.5px; }
      .field input, .field textarea, .field select {
        font-family: inherit; font-size: 15px; color: var(--ink-900);
        background: var(--paper); border: 1px solid var(--line-2);
        border-radius: var(--r-sm); padding: 11px 13px;
        transition: border .15s ease, background .15s ease, box-shadow .15s ease;
        width: 100%;
      }
      .field textarea { resize: vertical; min-height: 72px; line-height: 1.45; }
      .field select {
        appearance: none; -webkit-appearance: none;
        background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'><path d='M1 1.5l5 5 5-5' stroke='%234a5170' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/></svg>");
        background-repeat: no-repeat; background-position: right 14px center;
        padding-right: 36px; cursor: pointer;
      }
      .field input::placeholder, .field textarea::placeholder { color: var(--ink-300); }
      .field input:hover, .field textarea:hover, .field select:hover { border-color: var(--ink-200); }
      .field input:focus, .field textarea:focus, .field select:focus {
        outline: none; border-color: var(--brand); background: var(--white);
        box-shadow: 0 0 0 4px rgba(66, 100, 251, 0.12);
      }

      .autofill-state {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 8px 12px; background: var(--ok-50); color: var(--ok);
        border-radius: 999px; font-size: 13px; font-weight: 500; align-self: flex-start;
      }
      mapbox-address-autofill { display: block; }

      .actions { display: flex; gap: 10px; align-items: center; margin-top: 8px; flex-wrap: wrap; }
      .btn {
        display: inline-flex; align-items: center; gap: 8px;
        font-family: inherit; font-size: 14.5px; font-weight: 600;
        padding: 11px 16px; border-radius: 10px; cursor: pointer;
        border: 1px solid transparent;
        transition: transform .08s ease, background .15s ease, color .15s ease, border .15s ease, box-shadow .15s ease;
        white-space: nowrap;
      }
      .btn:active { transform: translateY(1px); }
      .btn:disabled { opacity: 0.5; cursor: not-allowed; }
      .btn-primary {
        background: var(--ink-900); color: var(--white); border-color: var(--ink-900);
        box-shadow: 0 6px 18px rgba(11, 16, 32, 0.18);
      }
      .btn-primary:hover:not(:disabled) { background: #000; box-shadow: 0 8px 22px rgba(11, 16, 32, 0.26); }
      .btn-ghost { background: transparent; color: var(--ink-700); border-color: var(--line-2); }
      .btn-ghost:hover { background: var(--white); border-color: var(--ink-200); }
      .btn-link {
        background: transparent; color: var(--brand);
        padding: 11px 6px; margin-left: auto; font-weight: 500;
      }
      .btn-link:hover { color: var(--brand-600); text-decoration: underline; }

      .confirmed-card {
        background: var(--brand-50); border: 1px solid var(--brand-100);
        border-radius: var(--r); padding: 14px 16px; margin-bottom: 16px;
      }
      .confirmed-card-label {
        font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.08em;
        color: var(--brand-600); font-weight: 600; margin-bottom: 4px;
      }
      .confirmed-card-body { font-size: 14.5px; color: var(--ink-900); line-height: 1.45; font-weight: 500; }

      .access-toolbar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin: 16px 0 18px; }
      .access-label {
        font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.08em;
        color: var(--ink-400); font-weight: 600; margin-right: 4px;
      }
      .chip {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 7px 12px; font: inherit; font-size: 13.5px; font-weight: 500;
        background: var(--white); border: 1px solid var(--line-2);
        color: var(--ink-700); border-radius: 999px; cursor: pointer;
        transition: all .15s ease;
      }
      .chip:hover { border-color: var(--ink-200); }
      .chip .chip-icon { font-size: 14px; line-height: 1; }
      .chip.is-on { background: var(--accent-50); border-color: var(--accent); color: #8a4a00; }

      .map-wrap {
        position: relative; border-radius: var(--r-lg); overflow: hidden;
        border: 1px solid var(--line); box-shadow: var(--shadow-2); background: var(--paper-2);
      }
      .map { width: 100%; height: 540px; }
      @media (max-width: 960px) { .map { height: 60vh; min-height: 360px; } }
      .map-tip {
        position: absolute; bottom: 12px; left: 12px;
        background: rgba(11, 16, 32, 0.78); color: var(--white);
        padding: 6px 10px; border-radius: 8px; font-size: 12px;
        backdrop-filter: blur(6px); pointer-events: none;
      }
      .kbd {
        display: inline-block; font-family: var(--font-mono); font-size: 11px;
        padding: 1px 5px; border-radius: 4px;
        background: rgba(255, 255, 255, 0.15); margin: 0 2px;
      }

      .access-marker {
        width: 30px; height: 30px;
        border-radius: 50% 50% 50% 0;
        background: var(--accent); transform: rotate(-45deg);
        display: grid; place-items: center; color: white;
        box-shadow: 0 2px 8px rgba(11, 16, 32, 0.25);
        border: 2px solid white; cursor: grab;
      }
      .access-marker span { transform: rotate(45deg); font-size: 14px; line-height: 1; }

      .static-card {
        background: var(--white); border: 1px solid var(--line);
        border-radius: var(--r); overflow: hidden;
        box-shadow: var(--shadow-2); margin-bottom: 16px;
      }
      .static-card-head {
        display: flex; align-items: center; justify-content: space-between; gap: 10px;
        padding: 12px 14px; border-bottom: 1px solid var(--line); background: var(--paper);
      }
      .static-card-title {
        font-size: 11.5px; letter-spacing: 0.08em; text-transform: uppercase;
        color: var(--ink-500); font-weight: 600;
      }
      .copy-btn {
        display: inline-flex; align-items: center; gap: 6px;
        font: inherit; font-size: 12px; font-weight: 500;
        padding: 5px 10px; border-radius: 6px;
        border: 1px solid var(--line-2); background: var(--white);
        color: var(--ink-700); cursor: pointer; transition: all .15s ease;
      }
      .copy-btn:hover { border-color: var(--ink-200); background: var(--paper); }
      .copy-btn.is-copied { background: var(--ok-50); color: var(--ok); border-color: rgba(31, 138, 76, 0.3); }
      .static-card-body { padding: 14px; }
      .static-url {
        margin: 0 0 10px; padding: 10px 12px;
        background: var(--ink-900); border-radius: 8px;
        font-family: var(--font-mono); font-size: 11.5px; line-height: 1.5;
        color: #d6dcff; max-height: 120px; overflow-y: auto;
        word-break: break-all; white-space: pre-wrap;
      }
      .static-url code { white-space: inherit; }
      .static-caption { margin: 0; font-size: 12.5px; line-height: 1.5; color: var(--ink-500); }

      .payload-card {
        background: var(--ink-900); color: #d6dcff;
        border-radius: var(--r); overflow: hidden;
        margin-bottom: 20px; box-shadow: var(--shadow-2);
      }
      .payload-card-head {
        background: rgba(255, 255, 255, 0.04); padding: 10px 14px;
        font-size: 11.5px; letter-spacing: 0.08em; text-transform: uppercase;
        color: var(--ink-200); font-weight: 600;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .payload-code {
        margin: 0; padding: 14px 16px;
        font-family: var(--font-mono); font-size: 12.5px; line-height: 1.55;
        overflow-x: auto; max-height: 280px; overflow-y: auto;
      }
      .payload-code code { white-space: pre; }

      /* ===== Step 3 — Driver Handoff hero card ===== */
      .handoff-intro { margin-bottom: 24px; max-width: 760px; }
      .handoff-intro .panel-sub { max-width: none; }

      .handoff-card {
        background: var(--white); border: 1px solid var(--line);
        border-radius: var(--r-lg); overflow: hidden;
        box-shadow: var(--shadow-3); margin-bottom: 24px;
      }
      .handoff-card-head {
        display: flex; align-items: center; justify-content: space-between;
        gap: 12px; flex-wrap: wrap;
        padding: 16px 22px;
        background: linear-gradient(135deg, #0b1020 0%, #1f2440 100%);
        color: var(--white);
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }
      .handoff-card-head-left {
        display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
      }
      .handoff-card-badge {
        font-size: 11.5px; letter-spacing: 0.1em; text-transform: uppercase;
        font-weight: 700; color: var(--white);
        background: rgba(66, 100, 251, 0.95);
        padding: 5px 10px; border-radius: 6px;
      }
      .handoff-card-order {
        font-family: var(--font-mono); font-size: 13.5px; font-weight: 500;
        color: rgba(255, 255, 255, 0.85);
      }
      .handoff-card-verified {
        display: inline-flex; align-items: center; gap: 6px;
        font-size: 12.5px; font-weight: 500;
        color: #6cc28a;
        background: rgba(31, 138, 76, 0.15);
        padding: 5px 10px; border-radius: 999px;
        border: 1px solid rgba(108, 194, 138, 0.25);
      }

      .handoff-card-body {
        display: grid;
        grid-template-columns: minmax(0, 600px) 1fr;
        gap: 28px;
        padding: 24px;
        align-items: start;
      }
      @media (max-width: 900px) {
        .handoff-card-body { grid-template-columns: 1fr; gap: 20px; padding: 18px; }
      }

      .handoff-image {
        margin: 0; position: relative;
        border-radius: 12px; overflow: hidden;
        border: 1px solid var(--line);
        background: transparent;
      }
      .handoff-image img {
        display: block; width: 100%; height: auto;
        max-width: 600px;
      }
      .handoff-image-caption {
        padding: 10px 14px;
        font-size: 12px; line-height: 1.5; color: var(--ink-500);
        background: var(--white);
        border-top: 1px solid var(--line);
        display: flex; flex-direction: column; gap: 4px;
      }
      .handoff-image-caption-meta {
        font-size: 10.5px; font-weight: 600; letter-spacing: 0.06em;
        text-transform: uppercase; color: var(--brand);
        align-self: flex-start;
        background: var(--brand-50);
        padding: 3px 8px; border-radius: 999px;
      }

      .handoff-info { display: flex; flex-direction: column; gap: 18px; min-width: 0; }
      .handoff-section { display: flex; flex-direction: column; gap: 6px; }
      .handoff-label {
        font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;
        color: var(--ink-400); font-weight: 600;
      }
      .handoff-address {
        font-style: normal; font-size: 15.5px; color: var(--ink-900);
        line-height: 1.5; font-weight: 500; white-space: pre-line;
        margin: 0;
      }
      .handoff-coords { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
      .handoff-coords code {
        font-family: var(--font-mono); font-size: 13.5px; color: var(--ink-900);
        background: var(--paper); border: 1px solid var(--line);
        border-radius: 6px; padding: 4px 8px;
      }
      .handoff-coords-meta { font-size: 12.5px; color: var(--ink-400); }

      .handoff-window-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      @media (max-width: 480px) { .handoff-window-grid { grid-template-columns: 1fr; } }
      .handoff-window-cell {
        background: var(--paper); border: 1px solid var(--line);
        border-radius: 8px; padding: 10px 12px;
        display: flex; flex-direction: column; gap: 2px;
      }
      .handoff-window-key {
        font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;
        color: var(--ink-400); font-weight: 600;
      }
      .handoff-window-val { font-size: 14.5px; color: var(--ink-900); font-weight: 500; line-height: 1.4; }
      .handoff-window-cell[hidden] { display: none; }

      .handoff-notes {
        margin: 0; padding: 12px 14px;
        background: var(--brand-50); border-left: 3px solid var(--brand);
        border-radius: 6px; font-size: 14.5px; color: var(--ink-900);
        line-height: 1.5; font-style: italic;
      }

      .handoff-card-foot {
        padding: 12px 22px 16px; border-top: 1px solid var(--line);
        font-size: 12px; color: var(--ink-400); background: #fbfaf6;
        text-align: center; letter-spacing: 0.01em;
      }

      /* ===== Engineering details (collapsible) ===== */
      .engineering-details {
        margin-bottom: 24px;
      }
      .engineering-details > summary {
        list-style: none;
        cursor: pointer;
        font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;
        color: var(--ink-500); font-weight: 600;
        padding: 10px 0; margin-bottom: 4px;
        display: inline-flex; align-items: center; gap: 8px;
        user-select: none;
      }
      .engineering-details > summary::-webkit-details-marker { display: none; }
      .engineering-details > summary::before {
        content: '▶';
        font-size: 9px; transition: transform .2s ease;
        color: var(--ink-400);
      }
      .engineering-details[open] > summary::before { transform: rotate(90deg); }
      .engineering-details > summary:hover { color: var(--ink-900); }

      .footnote {
        text-align: center; padding: 18px var(--gutter) 26px;
        font-size: 12.5px; color: var(--ink-400);
        display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;
      }
      .footnote a { color: var(--ink-700); text-decoration: none; font-weight: 500; }
      .footnote a:hover { color: var(--brand); }

      @media (max-width: 600px) {
        .topbar { padding: 14px 16px; }
        .brand-tag { display: none; }
        .card { padding: 20px; border-radius: var(--r); }
        .panel-title { font-size: 26px; }
        .email-body { padding: 18px 16px 8px; }
        .email-head { padding: 14px 16px 10px; }
        .email-row { grid-template-columns: 56px 1fr; font-size: 13px; }
        .email-foot { padding: 12px 16px 16px; }
        .actions { justify-content: space-between; }
        .actions .btn-link { margin-left: 0; }
      }
    </style>
  </head>
  <body>
    <header class="topbar">
      <div class="brand">
        <span class="brand-mark" aria-hidden="true"></span>
        <span class="brand-name">parcelry</span>
        <span class="brand-sep">·</span>
        <span class="brand-tag">3PL handoff demo</span>
      </div>
      <nav class="topbar-meta" aria-label="Demo meta">
        <span class="pill pill-live"><span class="dot"></span>Live Mapbox APIs</span>
      </nav>
    </header>

    <main class="shell">
      <ol class="stepper" aria-label="Checkout progress">
        <li class="step is-active" data-step-indicator="1">
          <span class="step-circle">1</span>
          <span class="step-label">
            <span class="step-eyebrow">Customer</span>
            Capture address
          </span>
        </li>
        <li class="step" data-step-indicator="2">
          <span class="step-circle">2</span>
          <span class="step-label">
            <span class="step-eyebrow">Customer</span>
            Confirm pin
          </span>
        </li>
        <li class="step" data-step-indicator="3">
          <span class="step-circle">3</span>
          <span class="step-label">
            <span class="step-eyebrow">Retailer → 3PL</span>
            Driver handoff
          </span>
        </li>
      </ol>

      <!-- ─────────────────────────  STEP 1  ───────────────────────── -->
      <section class="panel" data-step="1" aria-labelledby="s1-title">
        <div class="panel-grid">
          <div class="panel-copy">
            <p class="eyebrow">Step 1 · Customer-facing checkout</p>
            <h1 id="s1-title" class="panel-title">
              Where should we deliver your order?
            </h1>
            <p class="panel-sub">
              Powered by <strong>Mapbox Address Autofill</strong>. As the customer
              types, suggestions resolve to verified, geocoded addresses — no more
              typos, no more "unit unclear".
            </p>
            <ul class="bullets">
              <li>Single-line search, structured output</li>
              <li>Returns geographic coordinates we can put a pin on</li>
              <li>Driver notes captured at the source of truth</li>
            </ul>
          </div>

          <div class="card">
            <h2 class="card-title">Delivery address</h2>

            <mapbox-address-autofill id="autofill">
              <form id="address-form" autocomplete="on" novalidate>
                <div class="field">
                  <label for="line1">Address Line 1</label>
                  <input id="line1" name="line1" type="text" autocomplete="address-line1"
                    placeholder="Start typing your address…" required />
                </div>
                <div class="field">
                  <label for="line2">
                    Address Line 2
                    <span class="muted">Apt / Suite / Bldg / Unit</span>
                  </label>
                  <input id="line2" name="line2" type="text" autocomplete="address-line2"
                    placeholder="Apartment 4B" />
                </div>
                <div class="field">
                  <label for="city">City</label>
                  <input id="city" name="city" type="text" autocomplete="address-level2" required />
                </div>
                <div class="field-row">
                  <div class="field">
                    <label for="region">State / Province / Region</label>
                    <input id="region" name="region" type="text" autocomplete="address-level1" />
                  </div>
                  <div class="field">
                    <label for="postcode">Postcode</label>
                    <input id="postcode" name="postcode" type="text" autocomplete="postal-code" required />
                  </div>
                </div>
                <div class="field">
                  <label for="country">Country</label>
                  <input id="country" name="country" type="text" autocomplete="country-name" required />
                </div>
                <div class="field">
                  <label for="preferred-window">
                    Preferred delivery window
                    <span class="muted">Helps the 3PL route your stop</span>
                  </label>
                  <select id="preferred-window" name="preferred-window">
                    <option value="">Anytime</option>
                    <option value="morning">Morning · 8am – 12pm</option>
                    <option value="midday">Midday · 12pm – 3pm</option>
                    <option value="afternoon">Afternoon · 3pm – 6pm</option>
                    <option value="evening">Evening · 6pm – 9pm</option>
                  </select>
                </div>
                <div class="field">
                  <label for="avoid-times">
                    Times to avoid
                    <span class="muted">e.g. school run, work hours</span>
                  </label>
                  <textarea id="avoid-times" name="avoid-times" rows="2"
                    placeholder="e.g. Weekdays 7:45–8:15am (school run), not home Mon–Fri before 6pm"></textarea>
                </div>
                <div class="field">
                  <label for="notes">
                    Notes for the delivery driver
                    <span class="muted">Helps avoid failed deliveries</span>
                  </label>
                  <textarea id="notes" name="notes" rows="3"
                    placeholder="e.g. Ring bell 2nd floor, behind black gate"></textarea>
                </div>

                <div class="autofill-state" id="autofill-state" hidden>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span>Address verified by Mapbox</span>
                </div>

                <div class="actions">
                  <button id="step1-next" class="btn btn-primary" type="submit" disabled>
                    Confirm address
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </form>
            </mapbox-address-autofill>
          </div>
        </div>
      </section>

      <!-- ─────────────────────────  STEP 2  ───────────────────────── -->
      <section class="panel" data-step="2" aria-labelledby="s2-title" hidden>
        <div class="panel-grid panel-grid-map">
          <div class="panel-copy">
            <p class="eyebrow">Step 2 · Pin the exact drop-off</p>
            <h1 id="s2-title" class="panel-title">Is this the right spot?</h1>
            <p class="panel-sub">
              Drag the blue pin or tap on the map to mark exactly where the
              driver should deliver. Add access info — a gate, an entrance, a
              loading dock — so the driver knows the approach.
            </p>

            <div class="confirmed-card">
              <div class="confirmed-card-label">Confirmed address</div>
              <div class="confirmed-card-body" id="confirmed-address">—</div>
            </div>

            <div class="access-toolbar" role="group" aria-label="Add access info">
              <span class="access-label">Access info</span>
              <button class="chip" data-access="gate" type="button">
                <span class="chip-icon" data-icon="gate">⛩</span> Gate
              </button>
              <button class="chip" data-access="entrance" type="button">
                <span class="chip-icon" data-icon="entrance">🚪</span> Entrance
              </button>
              <button class="chip" data-access="dock" type="button">
                <span class="chip-icon" data-icon="dock">📦</span> Loading dock
              </button>
            </div>

            <div class="field">
              <label for="notes2">Notes for the delivery driver</label>
              <textarea id="notes2" rows="3"
                placeholder="e.g. Ring bell 2nd floor, behind black gate"></textarea>
            </div>

            <div class="actions">
              <button id="step2-back" class="btn btn-ghost" type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M19 12H5m6 6-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Back
              </button>
              <button id="reset-pin" class="btn btn-link" type="button">Reset pin</button>
              <button id="step2-next" class="btn btn-primary" type="button">
                Confirm pin
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="map-wrap">
            <div id="map" class="map" role="application" aria-label="Drop-off location"></div>
            <div class="map-tip">
              <span class="kbd">drag</span> the pin · <span class="kbd">tap</span> to move
            </div>
          </div>
        </div>
      </section>

      <!-- ─────────────────────────  STEP 3  ───────────────────────── -->
      <section class="panel" data-step="3" aria-labelledby="s3-title" hidden>
        <div class="handoff-intro">
          <p class="eyebrow">Step 3 · Retailer → 3PL handoff</p>
          <h1 id="s3-title" class="panel-title">Exactly what the driver receives.</h1>
          <p class="panel-sub">
            Every field below was captured directly from the customer at
            checkout — verified address, customer-adjusted drop-off pin,
            delivery window, and driver instructions. Bundled with a static map
            from the <strong>Mapbox Static Images API</strong> and sent to the 3PL.
          </p>
        </div>

        <!-- HERO — driver handoff card -->
        <div class="handoff-card">
          <div class="handoff-card-head">
            <div class="handoff-card-head-left">
              <span class="handoff-card-badge">Driver Handoff</span>
              <span class="handoff-card-order" id="handoff-order">Order #—</span>
            </div>
            <span class="handoff-card-verified">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Customer-verified at checkout
            </span>
          </div>

          <div class="handoff-card-body">
            <figure class="handoff-image">
              <img id="handoff-img" alt="Annotated static map with delivery pin and driver notes" hidden />
              <figcaption class="handoff-image-caption">
                <span class="handoff-image-caption-meta">Mapbox Static Images API</span>
                Driver notes are baked into this image so they travel with the
                file, even if the email is forwarded or screenshotted.
              </figcaption>
            </figure>

            <div class="handoff-info">
              <div class="handoff-section">
                <div class="handoff-label">Delivery address</div>
                <address class="handoff-address" id="handoff-address">—</address>
              </div>

              <div class="handoff-section">
                <div class="handoff-label">Coordinates</div>
                <div class="handoff-coords">
                  <code id="handoff-coords">—</code>
                  <span class="handoff-coords-meta" id="handoff-coords-meta"></span>
                </div>
              </div>

              <div class="handoff-section">
                <div class="handoff-label">Delivery window</div>
                <div class="handoff-window-grid">
                  <div class="handoff-window-cell">
                    <span class="handoff-window-key">Preferred</span>
                    <span class="handoff-window-val" id="handoff-preferred">—</span>
                  </div>
                  <div class="handoff-window-cell" id="handoff-avoid-cell">
                    <span class="handoff-window-key">Avoid</span>
                    <span class="handoff-window-val" id="handoff-avoid">—</span>
                  </div>
                </div>
              </div>

              <div class="handoff-section">
                <div class="handoff-label">Notes for the delivery driver</div>
                <blockquote class="handoff-notes" id="handoff-notes">—</blockquote>
              </div>
            </div>
          </div>

          <div class="handoff-card-foot">
            Provided by <strong>Parcelry</strong> · Powered by Mapbox
          </div>
        </div>

        <!-- Engineering details — for testers / SAs -->
        <details class="engineering-details" open>
          <summary>Engineering view — Static Images URL &amp; JSON payload</summary>

          <div class="static-card">
            <div class="static-card-head">
              <span class="static-card-title">Static Images API · request URL</span>
              <button id="copy-static-url" class="copy-btn" type="button" title="Copy URL">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M5 15V5a2 2 0 0 1 2-2h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                Copy URL
              </button>
            </div>
            <div class="static-card-body">
              <pre class="static-url"><code id="static-url">—</code></pre>
              <p class="static-caption">
                The single GET request that generates the annotated map above —
                pin and any access-info markers passed as URL overlays.
              </p>
            </div>
          </div>

          <div class="payload-card">
            <div class="payload-card-head">JSON payload sent to 3PL</div>
            <pre class="payload-code"><code id="payload-json">{}</code></pre>
          </div>
        </details>

        <div class="actions">
          <button id="step3-back" class="btn btn-ghost" type="button">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M19 12H5m6 6-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Back
          </button>
          <button id="start-over" class="btn btn-primary" type="button">Start over</button>
        </div>
      </section>
    </main>

    <footer class="footnote">
      <span>Built with</span>
      <a href="https://docs.mapbox.com/mapbox-search-js/" target="_blank" rel="noopener">Mapbox Search JS</a>
      <span>·</span>
      <a href="https://docs.mapbox.com/mapbox-gl-js/" target="_blank" rel="noopener">Mapbox GL JS</a>
      <span>·</span>
      <a href="https://docs.mapbox.com/api/maps/static-images/" target="_blank" rel="noopener">Static Images API</a>
    </footer>

    <script src="https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.js"></script>
    <script src="https://kenji-shima.github.io/resource-files/utils.js"></script>
    <script id="search-js" src="https://api.mapbox.com/search-js/v1.0.0/web.js"></script>
    <script>
    // 3PL Handoff Demo — Mapbox Search JS + GL JS + Static Images API
    // =================================================================

    const MAPBOX_TOKEN = mapboxgl.accessToken;

    const STYLE = 'mapbox/streets-v12';
    const MAP_STYLE_URL = `mapbox://styles/${STYLE}`;
    const PIN_COLOR = '4264fb';      // primary delivery pin
    const ACCESS_COLOR = 'f78f1e';   // access-info pins

    const ACCESS_DEFS = {
      gate:     { label: 'Gate',     letter: 'g', icon: '⛩' },
      entrance: { label: 'Entrance', letter: 'e', icon: '🚪' },
      dock:     { label: 'Dock',     letter: 'd', icon: '📦' },
    };

    const WINDOW_DEFS = {
      '':          { label: 'Anytime' },
      morning:     { label: 'Morning · 8am – 12pm' },
      midday:      { label: 'Midday · 12pm – 3pm' },
      afternoon:   { label: 'Afternoon · 3pm – 6pm' },
      evening:     { label: 'Evening · 6pm – 9pm' },
    };

    const state = {
      address: {
        line1: '', line2: '', city: '', region: '',
        postcode: '', country: '', country_code: '',
      },
      coordinates: null,
      originalCoordinates: null,
      notes: '',
      preferredWindow: '',
      avoidTimes: '',
      accessInfo: [],
      orderId: makeOrderId(),
      currentStep: 1,
    };

    function makeOrderId() {
      return 'P' + Math.floor(100000 + Math.random() * 899999);
    }

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    const els = {
      panels:          $$('.panel[data-step]'),
      stepIndicators:  $$('[data-step-indicator]'),
      autofill:        $('#autofill'),
      form:            $('#address-form'),
      line1:           $('#line1'),
      line2:           $('#line2'),
      city:            $('#city'),
      region:          $('#region'),
      postcode:        $('#postcode'),
      country:         $('#country'),
      preferredWindow: $('#preferred-window'),
      avoidTimes:      $('#avoid-times'),
      notes:           $('#notes'),
      autofillState:   $('#autofill-state'),
      step1Next:       $('#step1-next'),
      map:             $('#map'),
      confirmedAddress:$('#confirmed-address'),
      accessChips:     $$('.chip[data-access]'),
      notes2:          $('#notes2'),
      step2Back:       $('#step2-back'),
      step2Next:       $('#step2-next'),
      resetPin:        $('#reset-pin'),
      handoffOrder:        $('#handoff-order'),
      handoffAddress:      $('#handoff-address'),
      handoffCoords:       $('#handoff-coords'),
      handoffCoordsMeta:   $('#handoff-coords-meta'),
      handoffPreferred:    $('#handoff-preferred'),
      handoffAvoid:        $('#handoff-avoid'),
      handoffAvoidCell:    $('#handoff-avoid-cell'),
      handoffNotes:        $('#handoff-notes'),
      handoffImg:          $('#handoff-img'),
      payloadJson:         $('#payload-json'),
      staticUrl:           $('#static-url'),
      copyStaticUrl:       $('#copy-static-url'),
      step3Back:       $('#step3-back'),
      startOver:       $('#start-over'),
    };

    // ====== step navigation ======
    function goToStep(n) {
      state.currentStep = n;
      els.panels.forEach(p => { p.hidden = Number(p.dataset.step) !== n; });
      els.stepIndicators.forEach(el => {
        const i = Number(el.dataset.stepIndicator);
        el.classList.toggle('is-active', i === n);
        el.classList.toggle('is-done', i < n);
      });
      if (n === 1) els.notes.value = state.notes;
      if (n === 2) onEnterStep2();
      if (n === 3) onEnterStep3();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ====== step 1 — Mapbox Address Autofill ======
    function readFormIntoState() {
      state.address.line1    = els.line1.value.trim();
      state.address.line2    = els.line2.value.trim();
      state.address.city     = els.city.value.trim();
      state.address.region   = els.region.value.trim();
      state.address.postcode = els.postcode.value.trim();
      state.address.country  = els.country.value.trim();
      state.preferredWindow  = els.preferredWindow.value;
      state.avoidTimes       = els.avoidTimes.value.trim();
      state.notes            = els.notes.value.trim();
    }

    function validateStep1() {
      readFormIntoState();
      const a = state.address;
      const requiredFilled = a.line1 && a.city && a.postcode && a.country;
      const hasCoords = !!state.coordinates;
      els.step1Next.disabled = !(requiredFilled && hasCoords);
    }

    function wireForm() {
      ['input', 'change'].forEach(ev => {
        els.form.addEventListener(ev, validateStep1);
      });
      els.form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!els.step1Next.disabled) {
          readFormIntoState();
          goToStep(2);
        }
      });
    }

    function wireAutofill() {
      customElements.whenDefined('mapbox-address-autofill').then(() => {
        if (window.mapboxsearch && window.mapboxsearch.config) {
          window.mapboxsearch.config.accessToken = MAPBOX_TOKEN;
        }
        els.autofill.accessToken = MAPBOX_TOKEN;
        els.autofill.setAttribute('access-token', MAPBOX_TOKEN);
        try { els.autofill.options = { language: 'en' }; } catch (_) {}

        els.autofill.addEventListener('retrieve', (event) => {
          const fc = event.detail;
          if (!fc || !fc.features || !fc.features.length) return;
          const feature = fc.features[0];
          const props = feature.properties || {};
          const [lng, lat] = feature.geometry.coordinates;

          state.coordinates = [lng, lat];
          state.originalCoordinates = [lng, lat];
          state.address.country_code = (props.country_code || '').toLowerCase();
          els.autofillState.hidden = false;

          setTimeout(validateStep1, 0);
        });
      }).catch((err) => {
        console.error('Mapbox Search JS failed to load', err);
      });
    }

    // ====== step 2 — Mapbox GL JS ======
    let map = null;
    let primaryMarker = null;
    const accessMarkers = new Map();

    function onEnterStep2() {
      els.notes2.value = state.notes;
      els.confirmedAddress.textContent = formatAddressOneLine(state.address);

      if (!map) initMap();
      else {
        map.resize();
        map.flyTo({ center: state.coordinates, zoom: 17, essential: true });
        primaryMarker.setLngLat(state.coordinates);
      }
    }

    function initMap() {
      mapboxgl.accessToken = MAPBOX_TOKEN;

      map = new mapboxgl.Map({
        container: els.map,
        style: MAP_STYLE_URL,
        center: state.coordinates,
        zoom: 17,
        attributionControl: { compact: true },
      });

      map.addControl(new mapboxgl.NavigationControl({ visualizePitch: false }), 'top-right');

      primaryMarker = new mapboxgl.Marker({ draggable: true, color: '#4264fb' })
        .setLngLat(state.coordinates)
        .addTo(map);

      primaryMarker.on('dragend', () => {
        const { lng, lat } = primaryMarker.getLngLat();
        state.coordinates = [lng, lat];
      });

      map.on('click', (e) => {
        if (e.originalEvent.target && e.originalEvent.target.closest('.mapboxgl-marker')) return;
        state.coordinates = [e.lngLat.lng, e.lngLat.lat];
        primaryMarker.setLngLat(state.coordinates);
      });

      els.accessChips.forEach(chip => {
        chip.addEventListener('click', () => toggleAccessMarker(chip.dataset.access, chip));
      });

      els.notes2.addEventListener('input', () => { state.notes = els.notes2.value.trim(); });

      els.step2Back.addEventListener('click', () => goToStep(1));
      els.step2Next.addEventListener('click', () => {
        state.notes = els.notes2.value.trim();
        goToStep(3);
      });
      els.resetPin.addEventListener('click', () => {
        if (!state.originalCoordinates) return;
        state.coordinates = [...state.originalCoordinates];
        primaryMarker.setLngLat(state.coordinates);
        map.flyTo({ center: state.coordinates, zoom: 17, essential: true });
      });
    }

    function toggleAccessMarker(type, chip) {
      if (accessMarkers.has(type)) {
        const entry = accessMarkers.get(type);
        entry.marker.remove();
        accessMarkers.delete(type);
        chip.classList.remove('is-on');
        state.accessInfo = state.accessInfo.filter(a => a.type !== type);
        return;
      }
      const def = ACCESS_DEFS[type];
      const center = map.getCenter();
      const lng = center.lng + 0.00015;
      const lat = center.lat + 0.00010;

      const el = document.createElement('div');
      el.className = 'access-marker';
      el.innerHTML = `<span title="${def.label}">${def.icon}</span>`;

      const marker = new mapboxgl.Marker({ element: el, draggable: true, anchor: 'bottom' })
        .setLngLat([lng, lat])
        .addTo(map);

      const entry = { marker, lng, lat };
      marker.on('dragend', () => {
        const { lng, lat } = marker.getLngLat();
        entry.lng = lng; entry.lat = lat;
        const item = state.accessInfo.find(a => a.type === type);
        if (item) { item.lng = lng; item.lat = lat; }
      });

      accessMarkers.set(type, entry);
      state.accessInfo.push({ type, lng, lat });
      chip.classList.add('is-on');
    }

    // ====== step 3 — handoff + Static Images API ======
    async function onEnterStep3() {
      const [lng, lat] = state.coordinates;

      // Handoff card — captured info (next to the static image)
      els.handoffOrder.textContent = `Order #${state.orderId}`;
      els.handoffAddress.textContent = formatAddressMultiline(state.address);
      els.handoffCoords.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

      const moved = movedDistanceMeters(state.originalCoordinates, state.coordinates);
      els.handoffCoordsMeta.textContent =
        moved > 1 ? `Customer adjusted pin · moved ${moved.toFixed(0)} m from geocoded centroid`
                  : 'Pin matches the geocoded address centroid';

      els.handoffPreferred.textContent = WINDOW_DEFS[state.preferredWindow]?.label || 'Anytime';
      if (state.avoidTimes) {
        els.handoffAvoid.textContent = state.avoidTimes;
        els.handoffAvoidCell.hidden = false;
      } else {
        els.handoffAvoidCell.hidden = true;
      }

      els.handoffNotes.textContent = state.notes || '(no notes provided)';

      // Engineering: URL + JSON payload (token redacted in both)
      const staticUrl = buildStaticImageUrl();
      els.staticUrl.textContent = redactToken(staticUrl);
      els.payloadJson.textContent = JSON.stringify(buildPayload(), null, 2);

      // Annotated map (canvas overlay) — what travels with the handoff
      els.handoffImg.hidden = true;
      const showImg = (src) => {
        els.handoffImg.onload = () => { els.handoffImg.hidden = false; };
        els.handoffImg.src = src;
      };
      try {
        const finalSrc = state.notes
          ? await annotateStaticMap(staticUrl, state.notes)
          : staticUrl;
        showImg(finalSrc);
      } catch (err) {
        console.warn('Canvas overlay failed, falling back to raw static map', err);
        showImg(staticUrl);
      }

      els.step3Back.addEventListener('click', goBackToStep2, { once: true });
      els.startOver.addEventListener('click', startOver, { once: true });
      els.copyStaticUrl.addEventListener('click', onCopyStaticUrl);
    }

    async function onCopyStaticUrl() {
      try {
        await navigator.clipboard.writeText(els.staticUrl.textContent);
        els.copyStaticUrl.classList.add('is-copied');
        const label = els.copyStaticUrl.lastChild;
        const orig = label.textContent;
        label.textContent = ' Copied';
        setTimeout(() => {
          els.copyStaticUrl.classList.remove('is-copied');
          label.textContent = orig;
        }, 1400);
      } catch (_) {}
    }

    function goBackToStep2() { goToStep(2); }

    function startOver() {
      state.address = { line1: '', line2: '', city: '', region: '', postcode: '', country: '', country_code: '' };
      state.coordinates = null;
      state.originalCoordinates = null;
      state.notes = '';
      state.preferredWindow = '';
      state.avoidTimes = '';
      state.accessInfo = [];
      state.orderId = makeOrderId();

      els.form.reset();
      els.autofillState.hidden = true;
      validateStep1();

      if (map) {
        accessMarkers.forEach(({ marker }) => marker.remove());
        accessMarkers.clear();
        els.accessChips.forEach(c => c.classList.remove('is-on'));
      }
      els.notes2.value = '';

      goToStep(1);
    }

    function buildPayload() {
      const [lng, lat] = state.coordinates;
      return {
        order_id: state.orderId,
        address: {
          line1: state.address.line1,
          line2: state.address.line2 || null,
          city: state.address.city,
          region: state.address.region || null,
          postcode: state.address.postcode,
          country: state.address.country,
          country_code: state.address.country_code || null,
        },
        location: {
          lng: Number(lng.toFixed(6)),
          lat: Number(lat.toFixed(6)),
          pin_adjusted: movedDistanceMeters(state.originalCoordinates, state.coordinates) > 1,
        },
        delivery_window: {
          preferred: state.preferredWindow || null,
          preferred_label: WINDOW_DEFS[state.preferredWindow]?.label || 'Anytime',
          avoid: state.avoidTimes || null,
        },
        driver_notes: state.notes || null,
        access_info: state.accessInfo.map(a => ({
          type: a.type,
          label: ACCESS_DEFS[a.type].label,
          lng: Number(a.lng.toFixed(6)),
          lat: Number(a.lat.toFixed(6)),
        })),
        map_preview: redactToken(buildStaticImageUrl()),
      };
    }

    function buildStaticImageUrl() {
      const [lng, lat] = state.coordinates;
      const overlays = [];
      overlays.push(`pin-l+${PIN_COLOR}(${lng.toFixed(6)},${lat.toFixed(6)})`);
      for (const a of state.accessInfo) {
        const letter = ACCESS_DEFS[a.type].letter;
        overlays.push(`pin-s-${letter}+${ACCESS_COLOR}(${a.lng.toFixed(6)},${a.lat.toFixed(6)})`);
      }
      const overlayStr = overlays.join(',');
      return (
        `https://api.mapbox.com/styles/v1/${STYLE}/static/` +
        `${overlayStr}/${lng.toFixed(6)},${lat.toFixed(6)},17/800x500@2x` +
        `?access_token=${MAPBOX_TOKEN}`
      );
    }

    // Replace the actual token with a placeholder so it never appears in the UI.
    function redactToken(url) {
      return url.replace(/access_token=[^&]+/, 'access_token=<YOUR_MAPBOX_TOKEN>');
    }

    async function annotateStaticMap(url, notes) {
      const img = await loadImage(url, true);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const padX = 28;
      const padY = 22;
      const labelText = 'Driver notes';
      const labelFont = '600 22px Inter, -apple-system, sans-serif';
      const bodyFont = '500 28px Inter, -apple-system, sans-serif';
      const lineHeight = 38;
      const maxWidth = canvas.width - padX * 2;

      ctx.font = bodyFont;
      const lines = wrapText(ctx, notes, maxWidth);
      const visibleLines = lines.slice(0, 3);
      if (lines.length > 3) visibleLines[2] = ellipsize(ctx, visibleLines[2] + ' …', maxWidth);

      const labelH = 28;
      const bodyH = visibleLines.length * lineHeight;
      const boxH = padY + labelH + 10 + bodyH + padY;
      const boxY = canvas.height - boxH;

      const gradH = 60;
      const grad = ctx.createLinearGradient(0, boxY - gradH, 0, boxY);
      grad.addColorStop(0, 'rgba(11, 16, 32, 0)');
      grad.addColorStop(1, 'rgba(11, 16, 32, 0.55)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, boxY - gradH, canvas.width, gradH);

      ctx.fillStyle = 'rgba(11, 16, 32, 0.86)';
      ctx.fillRect(0, boxY, canvas.width, boxH);

      ctx.fillStyle = '#4264fb';
      ctx.fillRect(0, boxY, 6, boxH);

      ctx.fillStyle = '#9aa3c7';
      ctx.font = labelFont;
      ctx.textBaseline = 'top';
      ctx.fillText(labelText.toUpperCase(), padX, boxY + padY);

      ctx.fillStyle = '#ffffff';
      ctx.font = bodyFont;
      visibleLines.forEach((line, i) => {
        ctx.fillText(line, padX, boxY + padY + labelH + 10 + i * lineHeight);
      });

      drawBadge(ctx, canvas.width - 24, 24, `#${state.orderId}`);

      return canvas.toDataURL('image/png');
    }

    function drawBadge(ctx, rightX, topY, text) {
      ctx.font = '600 22px Inter, -apple-system, sans-serif';
      const padX = 14, padY = 8;
      const w = ctx.measureText(text).width + padX * 2;
      const h = 36;
      const x = rightX - w;
      const y = topY;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
      roundRect(ctx, x, y, w, h, 8);
      ctx.fill();
      ctx.fillStyle = '#0b1020';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x + padX, y + h / 2);
    }

    function roundRect(ctx, x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    function wrapText(ctx, text, maxWidth) {
      const words = text.split(/\s+/);
      const lines = [];
      let cur = '';
      for (const w of words) {
        const trial = cur ? cur + ' ' + w : w;
        if (ctx.measureText(trial).width > maxWidth && cur) {
          lines.push(cur);
          cur = w;
        } else {
          cur = trial;
        }
      }
      if (cur) lines.push(cur);
      return lines;
    }

    function ellipsize(ctx, text, maxWidth) {
      let t = text;
      while (ctx.measureText(t).width > maxWidth && t.length > 1) {
        t = t.slice(0, -2) + '…';
      }
      return t;
    }

    function loadImage(url, crossOrigin = false) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        if (crossOrigin) img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Image load failed: ' + url));
        img.src = url;
      });
    }

    function formatAddressOneLine(a) {
      const parts = [
        [a.line1, a.line2].filter(Boolean).join(', '),
        [a.city, a.region, a.postcode].filter(Boolean).join(' '),
        a.country,
      ].filter(Boolean);
      return parts.join(' · ');
    }

    function formatAddressMultiline(a) {
      const lines = [
        a.line1,
        a.line2,
        [a.city, a.region, a.postcode].filter(Boolean).join(' '),
        a.country,
      ].filter(Boolean);
      return lines.join('\n');
    }

    function movedDistanceMeters(a, b) {
      if (!a || !b) return 0;
      const R = 6371000;
      const toRad = d => d * Math.PI / 180;
      const [lng1, lat1] = a;
      const [lng2, lat2] = b;
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const s =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(s));
    }

    // ====== boot ======
    function boot() {
      wireForm();
      wireAutofill();
      validateStep1();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', boot);
    } else {
      boot();
    }
    </script>
  </body>
</html>
