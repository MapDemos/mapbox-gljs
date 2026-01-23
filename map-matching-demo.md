---
layout: default
title: マップマッチングデモ
---

<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>マップマッチング - クリックで道路にスナップ</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  {% include common_head.html %}
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    }
    #map {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 100%;
    }
    .info-panel {
      position: absolute;
      top: 20px;
      left: 20px;
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      max-width: 350px;
      z-index: 1;
    }
    .info-panel h2 {
      margin: 0 0 10px 0;
      font-size: 18px;
      color: #333;
    }
    .info-panel p {
      margin: 0 0 15px 0;
      font-size: 14px;
      color: #666;
      line-height: 1.4;
    }
    .status-box {
      background: #f8f9fa;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      padding: 12px;
      margin-top: 15px;
      font-size: 13px;
    }
    .status-box.loading {
      border-color: #3b82f6;
      background: #eff6ff;
    }
    .status-box.success {
      border-color: #10b981;
      background: #ecfdf5;
    }
    .status-box.error {
      border-color: #ef4444;
      background: #fef2f2;
    }
    .status-title {
      font-weight: 600;
      color: #374151;
      margin-bottom: 5px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .status-content {
      color: #6b7280;
      font-size: 12px;
      line-height: 1.4;
    }
    .coordinates {
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 11px;
      color: #374151;
      background: #f3f4f6;
      padding: 4px 6px;
      border-radius: 4px;
      display: inline-block;
      margin: 2px 0;
    }
    .btn {
      padding: 10px 16px;
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-clear {
      background: #f3f4f6;
      color: #374151;
      margin-top: 10px;
    }
    .btn-clear:hover {
      background: #e5e7eb;
    }
    .profile-selector {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #e5e7eb;
    }
    .profile-label {
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .profile-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .profile-option {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      background: #f9fafb;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }
    .profile-option:hover {
      background: #f3f4f6;
      border-color: #d1d5db;
      transform: translateX(2px);
    }
    .profile-option.active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-color: #667eea;
      color: white;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
    .profile-option.active .profile-radio {
      border-color: white;
      background: white;
    }
    .profile-option.active .profile-radio::after {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    .profile-option.active .profile-name {
      color: white;
      font-weight: 600;
    }
    .profile-option.active .profile-desc {
      color: rgba(255, 255, 255, 0.9);
    }
    .profile-radio {
      width: 20px;
      height: 20px;
      border: 2px solid #9ca3af;
      border-radius: 50%;
      margin-right: 12px;
      position: relative;
      flex-shrink: 0;
      transition: all 0.2s;
      background: white;
    }
    .profile-radio::after {
      content: '';
      width: 10px;
      height: 10px;
      background: #667eea;
      border-radius: 50%;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0);
      opacity: 0;
      transition: all 0.2s ease;
    }
    .profile-content {
      display: flex;
      align-items: center;
      flex: 1;
    }
    .profile-icon {
      font-size: 20px;
      margin-right: 10px;
    }
    .profile-text {
      display: flex;
      flex-direction: column;
    }
    .profile-name {
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      transition: color 0.2s;
    }
    .profile-desc {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 2px;
      transition: color 0.2s;
    }
    .legend {
      position: absolute;
      bottom: 30px;
      right: 20px;
      background: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      font-size: 12px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }
    .legend-item:last-child {
      margin-bottom: 0;
    }
    .legend-dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
    .legend-line {
      width: 24px;
      height: 4px;
      border-radius: 2px;
    }
    .spinner {
      display: inline-block;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Mobile responsive */
    @media (max-width: 640px) {
      .info-panel {
        left: 10px;
        right: 10px;
        max-width: none;
      }
      .legend {
        bottom: 10px;
        right: 10px;
        font-size: 11px;
      }
      .profile-option {
        padding: 10px 12px;
      }
      .profile-icon {
        font-size: 18px;
        margin-right: 8px;
      }
      .profile-name {
        font-size: 13px;
      }
      .profile-desc {
        font-size: 10px;
      }
      .profile-radio {
        width: 18px;
        height: 18px;
        margin-right: 10px;
      }
      .profile-radio::after {
        width: 8px;
        height: 8px;
      }
    }
  </style>
</head>
<body>
  <div id="map"></div>

  <div class="info-panel">
    <h2>🛣️ マップマッチングデモ</h2>
    <p>地図上で複数の地点をクリックして、道路に沿ったルートを作成します。</p>

    <div id="status-box" class="status-box">
      <div class="status-title">
        <span id="status-icon">👆</span>
        <span id="status-text">準備完了 - 地図をクリックして地点を追加</span>
      </div>
      <div id="status-content" class="status-content"></div>
    </div>

    <div class="profile-selector">
      <div class="profile-label">ルーティングプロファイル</div>
      <div class="profile-options">
        <div class="profile-option active" onclick="setProfile('driving')" data-profile="driving">
          <div class="profile-radio"></div>
          <div class="profile-content">
            <div class="profile-icon">🚗</div>
            <div class="profile-text">
              <div class="profile-name">自動車</div>
              <div class="profile-desc">車道・幹線道路にマッチング</div>
            </div>
          </div>
        </div>
        <div class="profile-option" onclick="setProfile('walking')" data-profile="walking">
          <div class="profile-radio"></div>
          <div class="profile-content">
            <div class="profile-icon">🚶</div>
            <div class="profile-text">
              <div class="profile-name">徒歩</div>
              <div class="profile-desc">歩道・遊歩道にマッチング</div>
            </div>
          </div>
        </div>
        <div class="profile-option" onclick="setProfile('cycling')" data-profile="cycling">
          <div class="profile-radio"></div>
          <div class="profile-content">
            <div class="profile-icon">🚴</div>
            <div class="profile-text">
              <div class="profile-name">自転車</div>
              <div class="profile-desc">自転車道・サイクリングロードにマッチング</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div style="display: flex; gap: 8px; margin-top: 10px;">
      <button class="btn btn-clear" onclick="matchRoute()" id="match-btn" style="background: #10b981; color: white; flex: 1;" disabled>
        🛣️ ルートをマッチング
      </button>
      <button class="btn btn-clear" onclick="clearPoints()">
        🗑️ クリア
      </button>
    </div>
  </div>

  <div class="legend">
    <div class="legend-item">
      <div class="legend-dot" style="background: #ef4444;"></div>
      <span>クリック地点</span>
    </div>
    <div class="legend-item">
      <div class="legend-line" style="background: #ef4444; opacity: 0.5; border: 1px dashed #ef4444; height: 2px;"></div>
      <span>選択順路</span>
    </div>
    <div class="legend-item">
      <div class="legend-line" style="background: #10b981; height: 4px;"></div>
      <span>マッチングルート</span>
    </div>
  </div>

  <script>
    // Access token is already set in utils.js

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [139.7671, 35.6812], // Tokyo Station
      zoom: 14
    });

    // Set map language to Japanese
    map.addControl(new MapboxLanguage({
      defaultLanguage: 'ja'
    }));

    let clickedPoints = [];
    let clickedMarkers = [];
    let matchedRoute = null;
    let currentProfile = 'driving';

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl());

    // Initialize map layers on load
    map.on('load', () => {
      // Add source for clicked points line
      map.addSource('clicked-line', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        }
      });

      // Add layer for clicked points line (dashed)
      map.addLayer({
        id: 'clicked-line-layer',
        type: 'line',
        source: 'clicked-line',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#ef4444',
          'line-width': 2,
          'line-dasharray': [2, 2],
          'line-opacity': 0.5
        }
      });

      // Add source for matched route
      map.addSource('matched-route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        }
      });

      // Add layer for matched route (solid, thick line)
      map.addLayer({
        id: 'matched-route-layer',
        type: 'line',
        source: 'matched-route',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#10b981',
          'line-width': 4,
          'line-opacity': 0.8
        }
      });
    });

    // Handle map clicks
    map.on('click', (e) => {
      const clickedPoint = [e.lngLat.lng, e.lngLat.lat];

      // Add clicked point to array
      clickedPoints.push(clickedPoint);

      // Add clicked point marker with number
      const markerNumber = clickedPoints.length;
      const clickedMarker = new mapboxgl.Marker({
        color: '#ef4444',
        scale: 0.8
      })
        .setLngLat(clickedPoint)
        .setPopup(new mapboxgl.Popup({ offset: 25 })
          .setHTML(`
            <strong>地点 ${markerNumber}</strong><br>
            <span style="font-family: monospace; font-size: 11px;">
              ${clickedPoint[0].toFixed(6)}, ${clickedPoint[1].toFixed(6)}
            </span>
          `))
        .addTo(map);

      clickedMarkers.push(clickedMarker);

      // Update clicked line
      updateClickedLine();

      // Update status
      if (clickedPoints.length === 1) {
        updateStatus('', `${clickedPoints.length} 地点を追加しました`,
          `もう1地点以上追加してルートを作成してください`);
      } else {
        updateStatus('success', `${clickedPoints.length} 地点を追加しました`,
          `「ルートをマッチング」をクリックして道路にスナップします`);
        // Enable match button
        document.getElementById('match-btn').disabled = false;
      }
    });

    function updateClickedLine() {
      if (clickedPoints.length > 1) {
        map.getSource('clicked-line').setData({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: clickedPoints
          }
        });
      }
    }

    async function matchRoute() {
      if (clickedPoints.length < 2) {
        updateStatus('error', 'エラー', '少なくとも2地点を選択してください');
        return;
      }

      try {
        updateStatus('loading', 'ルートマッチング中...',
          `${clickedPoints.length} 地点を道路にマッチングしています...`);

        // Construct Map Matching API URL with all points
        const coordinatesString = clickedPoints.map(coord => coord.join(',')).join(';');
        const radiuses = clickedPoints.map(() => '25').join(';'); // 25m radius for each point
        const url = `https://api.mapbox.com/matching/v5/mapbox.tmp.valhalla-zenrin/${currentProfile}/${coordinatesString}?access_token=${mapboxgl.accessToken}&geometries=geojson&radiuses=${radiuses}&overview=full&tidy=true`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.matchings && data.matchings.length > 0) {
          const matching = data.matchings[0];
          matchedRoute = matching.geometry;

          // Update matched route on map
          map.getSource('matched-route').setData({
            type: 'Feature',
            geometry: matchedRoute
          });

          // Calculate total distance
          const distance = matching.distance || 0;
          const duration = matching.duration || 0;

          // Profile names in Japanese
          const profileNames = {
            'driving': '自動車',
            'walking': '徒歩',
            'cycling': '自転車'
          };

          // Update status
          updateStatus('success', 'ルートマッチング完了！',
            `${profileNames[currentProfile]}ルートで道路にマッチングしました<br>` +
            `総距離: <strong>${(distance / 1000).toFixed(2)} km</strong><br>` +
            `推定時間: <strong>${Math.round(duration / 60)} 分</strong>`);

          // Fit map to show entire route
          const bounds = new mapboxgl.LngLatBounds();
          matchedRoute.coordinates.forEach(coord => {
            bounds.extend(coord);
          });
          map.fitBounds(bounds, { padding: 50 });

        } else {
          updateStatus('error', 'ルートが見つかりません',
            '選択した地点間でルートを作成できませんでした。地点を道路の近くに配置してください。');
        }

      } catch (error) {
        console.error('Map matching error:', error);
        updateStatus('error', 'マップマッチングに失敗しました',
          `エラー: ${error.message}`);
      }
    }


    function updateStatus(state, title, content = '') {
      const statusBox = document.getElementById('status-box');
      const statusIcon = document.getElementById('status-icon');
      const statusText = document.getElementById('status-text');
      const statusContent = document.getElementById('status-content');

      statusBox.className = `status-box ${state}`;

      if (state === 'loading') {
        statusIcon.innerHTML = '<span class="spinner">⟳</span>';
      } else if (state === 'success') {
        statusIcon.textContent = '✅';
      } else if (state === 'error') {
        statusIcon.textContent = '❌';
      } else {
        statusIcon.textContent = '👆';
      }

      statusText.textContent = title;
      statusContent.innerHTML = content;
    }

    function setProfile(profile) {
      currentProfile = profile;

      // Update radio button states with smooth animation
      document.querySelectorAll('.profile-option').forEach(option => {
        if (option.dataset.profile === profile) {
          option.classList.add('active');
        } else {
          option.classList.remove('active');
        }
      });

      const profileNames = {
        'driving': '自動車',
        'walking': '徒歩',
        'cycling': '自転車'
      };

      const profileDescriptions = {
        'driving': '車道・幹線道路を使用',
        'walking': '歩道・遊歩道を使用',
        'cycling': '自転車道・サイクリングロードを使用'
      };

      updateStatus('success', `${profileNames[profile]}モードに切り替えました`,
        `${profileDescriptions[profile]}<br>既存の地点がある場合は「ルートをマッチング」をクリックしてください。`);
    }

    function clearPoints() {
      // Remove all markers
      clickedMarkers.forEach(marker => marker.remove());

      // Reset arrays
      clickedMarkers = [];
      clickedPoints = [];
      matchedRoute = null;

      // Clear lines
      if (map.getSource('clicked-line')) {
        map.getSource('clicked-line').setData({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        });
      }

      if (map.getSource('matched-route')) {
        map.getSource('matched-route').setData({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        });
      }

      // Disable match button
      document.getElementById('match-btn').disabled = true;

      updateStatus('', 'すべてクリアしました',
        '地図をクリックして新しい地点を追加してください。');
    }
  </script>
</body>
</html>