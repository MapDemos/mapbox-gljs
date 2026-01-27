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

    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
      <div class="profile-label">GPSギャップ処理方法</div>
      <div style="display: flex; gap: 8px; margin-bottom: 10px;">
        <label style="display: flex; align-items: center; padding: 8px 12px; background: #f3f4f6; border-radius: 8px; cursor: pointer; flex: 1;">
          <input type="radio" name="gap-handling" value="split" checked style="margin-right: 8px;">
          <div>
            <div style="font-size: 13px; font-weight: 600;">分割</div>
            <div style="font-size: 11px; color: #6b7280;">50m以上離れた地点で分割</div>
          </div>
        </label>
        <label style="display: flex; align-items: center; padding: 8px 12px; background: #f3f4f6; border-radius: 8px; cursor: pointer; flex: 1;">
          <input type="radio" name="gap-handling" value="fill" style="margin-right: 8px;">
          <div>
            <div style="font-size: 13px; font-weight: 600;">補間</div>
            <div style="font-size: 11px; color: #6b7280;">ギャップを自動で埋める</div>
          </div>
        </label>
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

    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
      <div class="profile-label">GeoJSONファイルアップロード</div>
      <div style="display: flex; gap: 8px; align-items: center;">
        <input type="file" id="geojson-upload" accept=".json,.geojson" style="display: none;" onchange="handleFileUpload(event)">
        <button class="btn btn-clear" onclick="document.getElementById('geojson-upload').click()" style="background: #3b82f6; color: white; flex: 1;">
          📁 GeoJSONを読み込む
        </button>
        <button class="btn btn-clear" onclick="downloadCurrentPoints()" id="download-btn" style="background: #6366f1; color: white;" disabled>
          💾 保存
        </button>
      </div>
      <div style="font-size: 11px; color: #9ca3af; margin-top: 6px;">
        Point, MultiPoint, LineString, またはPolygonを含むGeoJSONファイル
      </div>
    </div>
  </div>

  <div class="legend">
    <div class="legend-item">
      <div class="legend-dot" style="background: #ef4444;"></div>
      <span>クリック地点</span>
    </div>
    <div class="legend-item">
      <div class="legend-dot" style="background: #6366f1; width: 12px; height: 12px;"></div>
      <span>補間地点</span>
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
      zoom: 14,
      language: 'ja'
    });

    // Set map language to Japanese
    map.addControl(new MapboxLanguage({
      defaultLanguage: 'ja'
    }));

    let clickedPoints = [];
    let clickedMarkers = [];
    let interpolatedMarkers = []; // Track interpolated point markers
    let matchedRoute = null;
    let currentProfile = 'driving';

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl());

    // Initialize map layers on load
    map.on('load', () => {
      //map.setConfigProperty('basemap', 'lightPreset', 'night');
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
          'line-width': 4, // Thicker dashed line
          'line-dasharray': [3, 2],
          'line-opacity': 0.7,
          'line-emissive-strength': 5
        }
      });

      // Add source for matched routes (supports multiple segments)
      map.addSource('matched-routes', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: []
        }
      });

      // Add layer for matched routes (all segments in green)
      map.addLayer({
        id: 'matched-routes-layer',
        type: 'line',
        source: 'matched-routes',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#10b981', // Green for all segments
          'line-width': 12, // Much thicker line
          'line-opacity': 0.9,
          'line-emissive-strength': 5
        }
      });

      // Add an outline layer for better visibility
      map.addLayer({
        id: 'matched-routes-outline',
        type: 'line',
        source: 'matched-routes',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#065f46', // Darker green outline
          'line-width': 16, // Even thicker for outline
          'line-opacity': 0.6,
          'line-blur': 2,
          'line-emissive-strength': 5
        }
      }, 'matched-routes-layer'); // Place outline below main line

      // Add animated dashed overlay for visibility
      map.addLayer({
        id: 'matched-routes-animated',
        type: 'line',
        source: 'matched-routes',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#fbbf24', // Yellow accent
          'line-width': 8,
          'line-dasharray': [0, 4, 3],
          'line-opacity': 0.7,
          'line-emissive-strength': 5
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

      // Enable download button if we have points
      document.getElementById('download-btn').disabled = false;

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

    // Split coordinate list into segments where GPS signal was lost (gaps > threshold)
    function splitCoordinatesByGaps(points, gapThresholdMeters = 50) {
      if (points.length < 2) return [points];

      const segments = [];
      let currentSegment = [points[0]];

      for (let i = 1; i < points.length; i++) {
        const distance = turf.distance(
          turf.point(points[i - 1]),
          turf.point(points[i]),
          { units: 'meters' }
        );

        if (distance > gapThresholdMeters) {
          // GPS signal gap detected - save current segment if it has at least 2 points
          if (currentSegment.length >= 2) {
            segments.push(currentSegment);
          }
          // Start new segment
          currentSegment = [points[i]];
        } else {
          // Continue current segment
          currentSegment.push(points[i]);
        }
      }

      // Add the last segment if it has at least 2 points
      if (currentSegment.length >= 2) {
        segments.push(currentSegment);
      }

      return segments;
    }

    // Split large coordinate lists into chunks for API limits (max 1000 points per request)
    function splitIntoChunks(points, maxChunkSize = 1000) {
      if (points.length <= maxChunkSize) {
        return [points];
      }

      const chunks = [];
      for (let i = 0; i < points.length; i += maxChunkSize) {
        // Take up to maxChunkSize points, ensuring at least 2 points per chunk
        const chunk = points.slice(i, Math.min(i + maxChunkSize, points.length));
        if (chunk.length >= 2) {
          chunks.push(chunk);
        } else if (chunks.length > 0 && chunk.length === 1) {
          // If last chunk has only 1 point, add it to the previous chunk if possible
          chunks[chunks.length - 1].push(chunk[0]);
        }
      }

      return chunks;
    }

    // Fill gaps in coordinates by interpolating points
    function fillCoordinateGaps(points, gapThresholdMeters = 50, interpolationInterval = 20) {
      if (points.length < 2) {
        return {
          points: points,
          interpolatedIndices: []
        };
      }

      const filledPoints = [points[0]];
      const interpolatedIndices = []; // Track which points are interpolated

      for (let i = 1; i < points.length; i++) {
        const prevPoint = points[i - 1];
        const currPoint = points[i];

        const distance = turf.distance(
          turf.point(prevPoint),
          turf.point(currPoint),
          { units: 'meters' }
        );

        if (distance > gapThresholdMeters) {
          // Gap detected - interpolate points to fill it

          // Create a line between the two points
          const line = turf.lineString([prevPoint, currPoint]);

          // Calculate number of points to interpolate
          const numInterpolatedPoints = Math.floor(distance / interpolationInterval);

          if (numInterpolatedPoints > 1) {
            // Add interpolated points along the line
            for (let j = 1; j < numInterpolatedPoints; j++) {
              const fraction = j / numInterpolatedPoints;
              const interpolatedPoint = turf.along(line, distance * fraction / 1000, { units: 'kilometers' });
              filledPoints.push(interpolatedPoint.geometry.coordinates);
              interpolatedIndices.push(filledPoints.length - 1);
            }
          }
        }

        // Add the current point
        filledPoints.push(currPoint);
      }

      return {
        points: filledPoints,
        interpolatedIndices: interpolatedIndices
      };
    }

    // Anomaly detection and cleaning functions
    function cleanPointAnomalies(points) {
      if (points.length < 2) return points;

      let cleanedPoints = [...points];
      const originalCount = cleanedPoints.length;

      // Step 1: Remove duplicate consecutive points
      // cleanedPoints = removeDuplicatePoints(cleanedPoints);
      // console.log(`Removed ${originalCount - cleanedPoints.length} duplicate points`);

      // Step 2: Remove points with unrealistic jumps (distance-based filtering)
      // if (cleanedPoints.length > 2) {
      //   const beforeJump = cleanedPoints.length;
      //   cleanedPoints = removeJumpAnomalies(cleanedPoints);
      //   console.log(`Removed ${beforeJump - cleanedPoints.length} points with unrealistic jumps`);
      // }

      // // Step 3: Remove outliers using statistical analysis
      // if (cleanedPoints.length > 3) {
      //   const beforeOutliers = cleanedPoints.length;
      //   cleanedPoints = removeStatisticalOutliers(cleanedPoints);
      //   console.log(`Removed ${beforeOutliers - cleanedPoints.length} statistical outliers`);
      // }

      // Step 4: Simplify if too many points (removes GPS noise)
      // if (cleanedPoints.length > 10) {
      //   const beforeSimplify = cleanedPoints.length;
      //   cleanedPoints = simplifyPoints(cleanedPoints,{ tolerance: 0.01, highQuality: true});
      //   console.log(`Simplified from ${beforeSimplify} to ${cleanedPoints.length} points`);
      // }

      // // Step 5: Remove isolated clusters (DBSCAN)
      // if (cleanedPoints.length > 5) {
      //   const beforeClustering = cleanedPoints.length;
      //   cleanedPoints = removeIsolatedClusters(cleanedPoints);
      //   console.log(`Removed ${beforeClustering - cleanedPoints.length} isolated points`);
      // }

      return cleanedPoints;
    }

    // Remove consecutive duplicate points
    function removeDuplicatePoints(points) {
      const cleaned = [points[0]];
      for (let i = 1; i < points.length; i++) {
        const dist = turf.distance(
          turf.point(points[i-1]),
          turf.point(points[i]),
          { units: 'meters' }
        );
        // Keep point if it's at least 1 meter away from previous
        if (dist > 1) {
          cleaned.push(points[i]);
        }
      }
      return cleaned;
    }

    // Remove points with unrealistic jumps
    // Based on 5-second intervals:
    // - 60km/h = 83m per 5 seconds
    // - 72km/h = 100m per 5 seconds (threshold)
    // Using 100m (0.1km) as strict threshold
    function removeJumpAnomalies(points, maxJumpKm = 0.1) {
      const cleaned = [points[0]];
      let lastGoodPoint = points[0];

      for (let i = 1; i < points.length; i++) {
        const distance = turf.distance(
          turf.point(lastGoodPoint),
          turf.point(points[i]),
          { units: 'kilometers' }
        );

        // If jump is reasonable, keep the point
        if (distance <= maxJumpKm) {
          cleaned.push(points[i]);
          lastGoodPoint = points[i];
        }
      }

      return cleaned;
    }

    // Remove statistical outliers
    function removeStatisticalOutliers(points) {
      if (points.length < 4) return points;

      // Calculate center point
      const featureCollection = turf.featureCollection(
        points.map(p => turf.point(p))
      );
      const center = turf.center(featureCollection);

      // Calculate distances from center
      const distances = points.map(p =>
        turf.distance(center, turf.point(p), { units: 'kilometers' })
      );

      // Calculate mean and standard deviation
      const mean = distances.reduce((a, b) => a + b, 0) / distances.length;
      const variance = distances.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) / distances.length;
      const stdDev = Math.sqrt(variance);

      // Remove points more than 2.5 standard deviations from mean
      const threshold = mean + (2.5 * stdDev);
      const cleaned = [];

      points.forEach((point, i) => {
        if (distances[i] <= threshold) {
          cleaned.push(point);
        }
      });

      // Keep at least 3 points
      if (cleaned.length < 3 && points.length >= 3) {
        // Return the 3 points closest to center
        const indexed = points.map((p, i) => ({ point: p, distance: distances[i] }));
        indexed.sort((a, b) => a.distance - b.distance);
        return indexed.slice(0, 3).map(item => item.point);
      }

      return cleaned;
    }

    // Simplify points to remove GPS noise
    function simplifyPoints(points) {
      if (points.length < 3) return points;

      const lineString = turf.lineString(points);

      // Tolerance in degrees (roughly 10-50 meters depending on latitude)
      const tolerance = 0.0001;

      const simplified = turf.simplify(lineString, {
        tolerance: tolerance,
        highQuality: true
      });

      return simplified.geometry.coordinates;
    }

    // Remove isolated point clusters using DBSCAN
    function removeIsolatedClusters(points) {
      if (points.length < 4) return points;

      const featureCollection = turf.featureCollection(
        points.map(p => turf.point(p))
      );

      // Max distance between points in a cluster (in km)
      const maxDistance = 0.5; // 500 meters
      const minPoints = 2; // Minimum points to form a cluster

      // Run DBSCAN clustering
      const clustered = turf.clustersDbscan(featureCollection, maxDistance, {
        minPoints: minPoints
      });

      // Find the largest cluster
      const clusterMap = {};
      clustered.features.forEach((feature, index) => {
        const cluster = feature.properties.cluster;
        if (cluster !== undefined) {
          if (!clusterMap[cluster]) {
            clusterMap[cluster] = [];
          }
          clusterMap[cluster].push(points[index]);
        }
      });

      // If no clusters found, return all points
      if (Object.keys(clusterMap).length === 0) {
        return points;
      }

      // Return points from the largest cluster(s)
      const clusters = Object.values(clusterMap);
      clusters.sort((a, b) => b.length - a.length);

      // If multiple significant clusters, keep them all
      const significantClusters = clusters.filter(c => c.length >= Math.max(2, clusters[0].length * 0.3));

      // Flatten all significant clusters and sort by original order
      const cleaned = [];
      points.forEach(point => {
        for (const cluster of significantClusters) {
          if (cluster.some(p => p[0] === point[0] && p[1] === point[1])) {
            cleaned.push(point);
            break;
          }
        }
      });

      return cleaned;
    }

    // Update display to show which points were removed
    function updateCleanedPointsDisplay(cleanedPoints) {
      // Update markers to show which were removed
      clickedMarkers.forEach((marker, index) => {
        const originalPoint = clickedPoints[index];
        const isKept = cleanedPoints.some(p =>
          Math.abs(p[0] - originalPoint[0]) < 0.000001 &&
          Math.abs(p[1] - originalPoint[1]) < 0.000001
        );

        if (!isKept) {
          // Change color of removed points to gray
          marker.remove();
          const removedMarker = new mapboxgl.Marker({
            color: '#9ca3af',
            scale: 0.6
          })
            .setLngLat(originalPoint)
            .setPopup(new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <strong>削除された地点 ${index + 1}</strong><br>
                <span style="font-family: monospace; font-size: 11px;">
                  ${originalPoint[0].toFixed(6)}, ${originalPoint[1].toFixed(6)}
                </span><br>
                <small style="color: #ef4444;">異常値として検出</small>
              `))
            .addTo(map);

          clickedMarkers[index] = removedMarker;
        }
      });

      // Update the clicked line to show cleaned path
      if (cleanedPoints.length > 1) {
        map.getSource('clicked-line').setData({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: cleanedPoints
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
        // Get gap handling strategy
        const gapHandling = document.querySelector('input[name="gap-handling"]:checked').value;

        // Clear any existing interpolated markers when starting
        interpolatedMarkers.forEach(marker => marker.remove());
        interpolatedMarkers = [];

        if (gapHandling === 'split') {
          // Strategy A: Split points into segments based on GPS gaps (>50m)
          updateStatus('loading', 'GPSギャップを検出中...',
            `${clickedPoints.length} 地点を分析しています...`);

          const segments = splitCoordinatesByGaps(clickedPoints, 50); // 50m threshold

        if (segments.length === 0) {
          updateStatus('error', 'エラー', '有効なセグメントが見つかりませんでした');
          return;
        }

        updateStatus('loading', `${segments.length} セグメントを検出`,
          segments.map((seg, i) => `セグメント ${i + 1}: ${seg.length} 地点`).join('<br>'));

        // Process each segment separately
        const matchedSegments = [];
        let totalDistance = 0;
        let totalDuration = 0;
        let failedSegments = 0;

        for (let i = 0; i < segments.length; i++) {
          const segment = segments[i];

          // Check if segment needs to be chunked (>1000 points)
          const chunks = splitIntoChunks(segment, 1000);

          for (let j = 0; j < chunks.length; j++) {
            const chunk = chunks[j];
            const chunkLabel = chunks.length > 1
              ? `セグメント ${i + 1}/${segments.length} (チャンク ${j + 1}/${chunks.length})`
              : `セグメント ${i + 1}/${segments.length}`;

            updateStatus('loading', `${chunkLabel} を処理中...`,
              `${chunk.length} 地点を道路にマッチングしています...`);

            // Clean anomalies from chunk
            const cleanedSegment = cleanPointAnomalies(chunk);

            if (cleanedSegment.length < 2) {
              failedSegments++;
              continue;
            }

          // Construct coordinates and parameters for POST request
          const coordinatesString = cleanedSegment.map(coord => coord.join(',')).join(';');
          const radiuses = cleanedSegment.map(() => '50').join(';'); // 50m radius for each point

          // Add timestamps (5 seconds apart)
          const baseTime = Math.floor(Date.now() / 1000) + (i * 1000); // Offset each segment
          const timestamps = cleanedSegment.map((_, index) => baseTime + (index * 5)).join(';');

          // Use POST request for better handling of large coordinate lists
          const url = `https://api.mapbox.com/matching/v5/mapbox.tmp.valhalla-zenrin/${currentProfile}?access_token=${mapboxgl.accessToken}`;

          // Prepare form data for POST request
          const formData = new URLSearchParams();
          formData.append('coordinates', coordinatesString);
          formData.append('geometries', 'geojson');
          formData.append('radiuses', radiuses);
          formData.append('timestamps', timestamps);
          formData.append('overview', 'full');
          formData.append('tidy', 'false');

          try {
            const response = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: formData.toString()
            });
            const data = await response.json();

            if (data.matchings && data.matchings.length > 0) {
              const matching = data.matchings[0];

              // Add this segment to matched segments with segment index
              matchedSegments.push({
                type: 'Feature',
                properties: {
                  segment: i,
                  chunk: j,
                  distance: matching.distance || 0,
                  duration: matching.duration || 0,
                  points: cleanedSegment.length
                },
                geometry: matching.geometry
              });

              totalDistance += matching.distance || 0;
              totalDuration += matching.duration || 0;
            } else {
              failedSegments++;
            }
          } catch (segmentError) {
            failedSegments++;
          }
          } // End of chunks loop
        } // End of segments loop

        // Update map with all matched segments
        if (matchedSegments.length > 0) {
          map.getSource('matched-routes').setData({
            type: 'FeatureCollection',
            features: matchedSegments
          });

          // Profile names in Japanese
          const profileNames = {
            'driving': '自動車',
            'walking': '徒歩',
            'cycling': '自転車'
          };

          // Create status message
          let statusMessage = `${profileNames[currentProfile]}ルートで道路にマッチングしました<br>`;
          statusMessage += `マッチング済みセグメント: <strong>${matchedSegments.length}/${segments.length}</strong><br>`;

          if (failedSegments > 0) {
            statusMessage += `<small style="color: #ef4444;">${failedSegments} セグメントはマッチングできませんでした</small><br>`;
          }

          statusMessage += `総距離: <strong>${(totalDistance / 1000).toFixed(2)} km</strong><br>`;
          statusMessage += `推定時間: <strong>${Math.round(totalDuration / 60)} 分</strong>`;

          updateStatus('success', 'ルートマッチング完了！', statusMessage);

          // Fit map to show all routes
          const bounds = new mapboxgl.LngLatBounds();
          matchedSegments.forEach(segment => {
            segment.geometry.coordinates.forEach(coord => {
              bounds.extend(coord);
            });
          });
          map.fitBounds(bounds, { padding: 50 });

        } else {
          updateStatus('error', 'ルートが見つかりません',
            'すべてのセグメントでマッチングに失敗しました。地点を道路の近くに配置してください。');
        }

        } else {
          // Strategy B: Fill gaps with interpolated points
          updateStatus('loading', 'GPSギャップを補間中...',
            `${clickedPoints.length} 地点のギャップを埋めています...`);

          const fillResult = fillCoordinateGaps(clickedPoints, 50, 20); // 50m gap threshold, 20m interpolation interval
          const filledPoints = fillResult.points;
          const interpolatedIndices = fillResult.interpolatedIndices;

          // Clear any existing interpolated markers
          interpolatedMarkers.forEach(marker => marker.remove());
          interpolatedMarkers = [];

          // Add visual markers for interpolated points
          interpolatedIndices.forEach(index => {
            const point = filledPoints[index];
            const interpolatedMarker = new mapboxgl.Marker({
              color: '#6366f1', // Purple for interpolated points
              scale: 0.5
            })
              .setLngLat(point)
              .setPopup(new mapboxgl.Popup({ offset: 25 })
                .setHTML(`
                  <strong>補間地点</strong><br>
                  <span style="font-family: monospace; font-size: 11px;">
                    ${point[0].toFixed(6)}, ${point[1].toFixed(6)}
                  </span><br>
                  <small style="color: #6366f1;">自動生成されたポイント</small>
                `))
              .addTo(map);

            interpolatedMarkers.push(interpolatedMarker);
          });

          updateStatus('loading', 'ルートマッチング中...',
            `${filledPoints.length} 地点（${interpolatedIndices.length} 補間地点を含む）を道路にマッチングしています...`);

          // Clean anomalies from filled points
          const cleanedPoints = cleanPointAnomalies(filledPoints);

          if (cleanedPoints.length < 2) {
            updateStatus('error', 'エラー',
              `クリーニング後の地点が不足しています（${filledPoints.length}地点→${cleanedPoints.length}地点）`);
            return;
          }

          // Split into chunks if needed (max 1000 points per API call)
          const chunks = splitIntoChunks(cleanedPoints, 1000);
          const matchedChunks = [];
          let totalDistance = 0;
          let totalDuration = 0;
          let failedChunks = 0;

          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const chunkLabel = chunks.length > 1
              ? `チャンク ${i + 1}/${chunks.length}`
              : '補間されたルート';

            updateStatus('loading', `${chunkLabel} を処理中...`,
              `${chunk.length} 地点を道路にマッチングしています...`);

            // Construct coordinates and parameters for POST request
            const coordinatesString = chunk.map(coord => coord.join(',')).join(';');
            const radiuses = chunk.map(() => '50').join(';'); // 50m radius for each point

            // Add timestamps (5 seconds apart)
            const baseTime = Math.floor(Date.now() / 1000) + (i * 5000); // Offset each chunk
            const timestamps = chunk.map((_, index) => baseTime + (index * 5)).join(';');

            // Use POST request for the filled route
            const url = `https://api.mapbox.com/matching/v5/mapbox.tmp.valhalla-zenrin/${currentProfile}?access_token=${mapboxgl.accessToken}`;

            // Prepare form data for POST request
            const formData = new URLSearchParams();
            formData.append('coordinates', coordinatesString);
            formData.append('geometries', 'geojson');
            formData.append('radiuses', radiuses);
            formData.append('timestamps', timestamps);
            formData.append('overview', 'full');
            formData.append('tidy', 'false');

            try {
              const response = await fetch(url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData.toString()
              });

              const data = await response.json();

              if (data.matchings && data.matchings.length > 0) {
                // Process ALL matching segments from the response
                data.matchings.forEach((matching, matchIdx) => {
                  // Skip matchings with no or minimal coordinates
                  if (!matching.geometry || !matching.geometry.coordinates || matching.geometry.coordinates.length < 2) {
                    return;
                  }

                  // Skip matchings where all coordinates are the same point
                  const firstCoord = matching.geometry.coordinates[0];
                  const allSame = matching.geometry.coordinates.every(coord =>
                    coord[0] === firstCoord[0] && coord[1] === firstCoord[1]
                  );
                  if (allSame) {
                    return;
                  }

                  matchedChunks.push({
                    type: 'Feature',
                    properties: {
                      segment: 0,
                      chunk: i,
                      matchingIndex: matchIdx,
                      distance: matching.distance || 0,
                      duration: matching.duration || 0,
                      points: matching.geometry.coordinates.length
                    },
                    geometry: matching.geometry
                  });

                  totalDistance += matching.distance || 0;
                  totalDuration += matching.duration || 0;
                });
              } else {
                failedChunks++;
              }
            } catch (error) {
              failedChunks++;
            }
          }

          if (matchedChunks.length > 0) {
            // Update map with all matched chunks
            const mapData = {
              type: 'FeatureCollection',
              features: matchedChunks
            };

            // Wait for map to be ready if needed
            if (!map.loaded()) {
              map.once('load', () => {
                const source = map.getSource('matched-routes');
                if (source) {
                  source.setData(mapData);
                }
              });
              return;
            }

            // Check if source exists
            const source = map.getSource('matched-routes');
            if (!source) {
              // Try to add it if it doesn't exist
              map.addSource('matched-routes', {
                type: 'geojson',
                data: mapData
              });
            } else {
              source.setData(mapData);

              // Add pulsing animation to draw attention to the route
              let step = 0;
              const animateRoute = () => {
                step = (step + 1) % 100;
                const opacity = 0.5 + (Math.sin(step * 0.1) + 1) * 0.25;

                if (map.getLayer('matched-routes-animated')) {
                  map.setPaintProperty('matched-routes-animated', 'line-opacity', opacity);
                }

                // Animate for 3 seconds
                if (step < 30) {
                  requestAnimationFrame(animateRoute);
                } else {
                  if (map.getLayer('matched-routes-animated')) {
                    map.setPaintProperty('matched-routes-animated', 'line-opacity', 0.7);
                  }
                }
              };
              animateRoute();
            }


            // Profile names in Japanese
            const profileNames = {
              'driving': '自動車',
              'walking': '徒歩',
              'cycling': '自転車'
            };

            // Create status message
            let statusMessage = `${profileNames[currentProfile]}ルートで道路にマッチングしました<br>`;
            statusMessage += `補間された地点: <strong>${interpolatedIndices.length}</strong><br>`;

            if (chunks.length > 1) {
              statusMessage += `処理済みチャンク: <strong>${matchedChunks.length}/${chunks.length}</strong><br>`;
              if (failedChunks > 0) {
                statusMessage += `<small style="color: #ef4444;">${failedChunks} チャンクはマッチングできませんでした</small><br>`;
              }
            }

            statusMessage += `総距離: <strong>${(totalDistance / 1000).toFixed(2)} km</strong><br>`;
            statusMessage += `推定時間: <strong>${Math.round(totalDuration / 60)} 分</strong>`;

            updateStatus('success', 'ルートマッチング完了！', statusMessage);

            // Fit map to show all routes
            const bounds = new mapboxgl.LngLatBounds();
            matchedChunks.forEach(chunk => {
              chunk.geometry.coordinates.forEach(coord => {
                bounds.extend(coord);
              });
            });
            map.fitBounds(bounds, { padding: 50 });

          } else {
            updateStatus('error', 'ルートが見つかりません',
              '地点間でルートを作成できませんでした。地点を道路の近くに配置してください。');
          }
        }

      } catch (error) {
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
      interpolatedMarkers.forEach(marker => marker.remove());

      // Reset arrays
      clickedMarkers = [];
      interpolatedMarkers = [];
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

      // Clear matched routes (new multiple segments source)
      if (map.getSource('matched-routes')) {
        map.getSource('matched-routes').setData({
          type: 'FeatureCollection',
          features: []
        });
      }

      // Make sure all route layers are cleared
      ['matched-routes-layer', 'matched-routes-outline', 'matched-routes-animated'].forEach(layerId => {
        if (map.getLayer(layerId)) {
          map.setLayoutProperty(layerId, 'visibility', 'visible'); // Ensure visible for next use
        }
      });

      // Disable buttons
      document.getElementById('match-btn').disabled = true;
      document.getElementById('download-btn').disabled = true;

      updateStatus('', 'すべてクリアしました',
        '地図をクリックして新しい地点を追加してください。');
    }

    function handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const geojson = JSON.parse(e.target.result);
          processGeoJSON(geojson);
        } catch (error) {
          updateStatus('error', 'ファイルエラー',
            `GeoJSONファイルの読み込みに失敗しました: ${error.message}`);
        }
      };
      reader.readAsText(file);

      // Reset file input so same file can be selected again
      event.target.value = '';
    }

    function processGeoJSON(geojson) {
      // Clear existing points first
      clearPoints();

      let extractedPoints = [];

      // Handle single Feature
      if (geojson.type === 'Feature') {
        extractedPoints = extractPointsFromGeometry(geojson.geometry);
      }
      // Handle FeatureCollection
      else if (geojson.type === 'FeatureCollection' && geojson.features) {
        geojson.features.forEach(feature => {
          if (feature.geometry) {
            const points = extractPointsFromGeometry(feature.geometry);
            extractedPoints = extractedPoints.concat(points);
          }
        });
      }
      // Handle raw Geometry
      else if (geojson.type && geojson.coordinates) {
        extractedPoints = extractPointsFromGeometry(geojson);
      }

      if (extractedPoints.length === 0) {
        updateStatus('error', '地点が見つかりません',
          'GeoJSONファイルに有効な座標が含まれていません。');
        return;
      }

      // Add all extracted points to the map
      extractedPoints.forEach((point, index) => {
        clickedPoints.push(point);

        // Add marker with number
        const markerNumber = index + 1;
        const marker = new mapboxgl.Marker({
          color: '#ef4444',
          scale: 0.8
        })
          .setLngLat(point)
          .setPopup(new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <strong>地点 ${markerNumber}</strong><br>
              <span style="font-family: monospace; font-size: 11px;">
                ${point[0].toFixed(6)}, ${point[1].toFixed(6)}
              </span>
            `))
          .addTo(map);

        clickedMarkers.push(marker);
      });

      // Update clicked line
      updateClickedLine();

      // Fit map to show all points
      if (extractedPoints.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        extractedPoints.forEach(point => {
          bounds.extend(point);
        });
        map.fitBounds(bounds, { padding: 50 });
      }

      // Update status and enable buttons
      if (extractedPoints.length > 0) {
        document.getElementById('download-btn').disabled = false;
      }

      if (extractedPoints.length >= 2) {
        document.getElementById('match-btn').disabled = false;
        updateStatus('success', `${extractedPoints.length} 地点を読み込みました`,
          `GeoJSONファイルから地点を追加しました。「ルートをマッチング」をクリックしてください。`);
      } else if (extractedPoints.length === 1) {
        updateStatus('', `${extractedPoints.length} 地点を読み込みました`,
          `もう1地点以上追加してルートを作成してください。`);
      }
    }

    function extractPointsFromGeometry(geometry) {
      const points = [];

      switch (geometry.type) {
        case 'Point':
          // Single point
          if (isValidCoordinate(geometry.coordinates)) {
            points.push(geometry.coordinates);
          }
          break;

        case 'MultiPoint':
          // Multiple points
          geometry.coordinates.forEach(coord => {
            if (isValidCoordinate(coord)) {
              points.push(coord);
            }
          });
          break;

        case 'LineString':
          // Line vertices
          geometry.coordinates.forEach(coord => {
            if (isValidCoordinate(coord)) {
              points.push(coord);
            }
          });
          break;

        case 'MultiLineString':
          // Multiple lines vertices
          geometry.coordinates.forEach(line => {
            line.forEach(coord => {
              if (isValidCoordinate(coord)) {
                points.push(coord);
              }
            });
          });
          break;

        case 'Polygon':
          // Polygon vertices (only exterior ring)
          if (geometry.coordinates[0]) {
            geometry.coordinates[0].forEach(coord => {
              if (isValidCoordinate(coord)) {
                points.push(coord);
              }
            });
          }
          break;

        case 'MultiPolygon':
          // Multiple polygons vertices
          geometry.coordinates.forEach(polygon => {
            if (polygon[0]) {
              polygon[0].forEach(coord => {
                if (isValidCoordinate(coord)) {
                  points.push(coord);
                }
              });
            }
          });
          break;

        case 'GeometryCollection':
          // Recursive for geometry collection
          if (geometry.geometries) {
            geometry.geometries.forEach(geom => {
              const geomPoints = extractPointsFromGeometry(geom);
              points.push(...geomPoints);
            });
          }
          break;
      }

      return points;
    }

    function isValidCoordinate(coord) {
      return Array.isArray(coord) &&
             coord.length >= 2 &&
             typeof coord[0] === 'number' &&
             typeof coord[1] === 'number' &&
             coord[0] >= -180 && coord[0] <= 180 &&
             coord[1] >= -90 && coord[1] <= 90;
    }

    function downloadCurrentPoints() {
      if (clickedPoints.length === 0) {
        updateStatus('error', 'エラー', '保存する地点がありません。');
        return;
      }

      // Create GeoJSON object with individual Point features
      const features = [];

      // Add each clicked point as a separate Point feature
      clickedPoints.forEach((point, index) => {
        features.push({
          type: 'Feature',
          properties: {
            index: index + 1,
            profile: currentProfile
          },
          geometry: {
            type: 'Point',
            coordinates: point
          }
        });
      });

      const geojson = {
        type: 'FeatureCollection',
        features: features
      };

      // Create download
      const dataStr = JSON.stringify(geojson, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `map-points-${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')}.geojson`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      updateStatus('success', 'ファイルをダウンロードしました',
        `${clickedPoints.length} 地点を含むGeoJSONファイルを保存しました。`);
    }
  </script>
</body>
</html>