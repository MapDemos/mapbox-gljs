---
layout: null
title: 店舗一覧
---

<html lang="ja">

<head>
  {% include common_head.html %}
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif;
      background-color: #f8f8f8;
      color: #333;
    }

    header {
      background-color: #ED1C24;
      color: white;
      padding: 20px;
    }

    header h1 {
      margin: 0 0 6px;
      font-size: 20px;
    }

    header a {
      color: white;
      font-size: 14px;
    }

    #total-count {
      padding: 16px 20px 0;
      font-size: 14px;
      color: #666;
    }

    main {
      max-width: 900px;
      margin: 0 auto;
      padding: 16px 20px 60px;
    }

    .prefecture-group {
      background-color: white;
      border-radius: 6px;
      margin-bottom: 10px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .prefecture-group summary {
      padding: 14px 16px;
      cursor: pointer;
      font-weight: 700;
      font-size: 15px;
      list-style: none;
    }

    .prefecture-group summary::-webkit-details-marker {
      display: none;
    }

    .prefecture-group summary::before {
      content: "▶";
      display: inline-block;
      margin-right: 8px;
      font-size: 11px;
      transition: transform 0.15s;
    }

    .prefecture-group[open] summary::before {
      transform: rotate(90deg);
    }

    .prefecture-group ul {
      margin: 0;
      padding: 0;
      list-style: none;
      border-top: 1px solid #eee;
    }

    .prefecture-group li {
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
    }

    .prefecture-group li:last-child {
      border-bottom: none;
    }

    .prefecture-group a {
      color: #ED1C24;
      font-weight: 600;
      font-size: 14px;
      text-decoration: none;
    }

    .prefecture-group a:hover {
      text-decoration: underline;
    }

    .store-list-address {
      display: block;
      color: #666;
      font-size: 13px;
      margin-top: 2px;
    }
  </style>
</head>

<body>
  <header>
    <h1>店舗一覧</h1>
    <a href="store-locator.html">← 地図で探す</a>
  </header>
  <div id="total-count">読み込み中...</div>
  <main id="store-list-container"></main>

  <script>
    const SKYLARK_DATA_FILE = 'skylark-stores.json';
    // Same pattern as _includes/store-locator.js's FULL_ADDRESS_REGEX, kept
    // in sync with it for consistent prefecture grouping across both pages.
    const FULL_ADDRESS_REGEX = /^(東京都|北海道|大阪府|京都府|[^\s]+県)([^\s]+?(市|区|町|村))?/;

    async function init() {
      const container = document.getElementById('store-list-container');
      let stores;
      try {
        const response = await fetch(SKYLARK_DATA_FILE);
        const data = await response.json();
        stores = Array.isArray(data) ? data : (data.items || data.data || data.stores || []);
      } catch (error) {
        document.getElementById('total-count').textContent = '店舗データの読み込みに失敗しました';
        return;
      }

      document.getElementById('total-count').textContent = `${stores.length}件の店舗`;

      const groups = {};
      stores.forEach(store => {
        const match = (store.address || '').match(FULL_ADDRESS_REGEX);
        const prefecture = match ? match[1] : 'その他';
        if (!groups[prefecture]) groups[prefecture] = [];
        groups[prefecture].push(store);
      });

      Object.keys(groups).sort().forEach(prefecture => {
        const storesInPref = groups[prefecture].sort((a, b) => a.name.localeCompare(b.name, 'ja'));

        const details = document.createElement('details');
        details.className = 'prefecture-group';

        const summary = document.createElement('summary');
        summary.textContent = `${prefecture}（${storesInPref.length}）`;
        details.appendChild(summary);

        const ul = document.createElement('ul');
        storesInPref.forEach(store => {
          const li = document.createElement('li');

          const a = document.createElement('a');
          a.href = `store-locator.html?lat=${store.latitude}&lng=${store.longitude}&zoom=15.00`;
          a.textContent = store.name;

          const addr = document.createElement('span');
          addr.className = 'store-list-address';
          addr.textContent = store.address;

          li.appendChild(a);
          li.appendChild(addr);
          ul.appendChild(li);
        });
        details.appendChild(ul);

        container.appendChild(details);
      });
    }

    init();
  </script>
</body>

</html>
