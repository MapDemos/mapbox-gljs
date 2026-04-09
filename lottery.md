---
layout: null
title: 抽選
js: lottery.js
---
<!DOCTYPE html>
<html lang="ja">

<head>
  {% include common_head.html %}
  <style>
    {% include common.css %}

    body {
      margin: 0;
      padding: 0;
      font-family: 'Hiragino Kaku Gothic ProN', 'Meiryo', sans-serif;
      overflow: hidden;
    }

    #map {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 100%;
    }

    .lottery-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 255, 255, 0.95);
      padding: 30px 50px;
      border-radius: 20px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
      text-align: center;
      z-index: 1000;
      min-width: 320px;
    }

    .lottery-title {
      font-size: 32px;
      font-weight: bold;
      color: #333;
      margin-bottom: 30px;
    }

    .lottery-button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 18px 60px;
      font-size: 26px;
      font-weight: bold;
      border-radius: 40px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      white-space: nowrap;
      min-width: 220px;
      line-height: 1.4;
      height: auto;
    }

    .lottery-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
    }

    .lottery-button:active {
      transform: translateY(0);
    }

    .lottery-button:disabled {
      background: #ccc;
      cursor: not-allowed;
      box-shadow: none;
    }

    .result-container {
      display: none;
      animation: fadeIn 0.5s ease-in;
    }

    .result-prize {
      font-size: 40px;
      font-weight: bold;
      margin: 15px 0;
      color: #333;
    }

    .result-message {
      font-size: 20px;
      color: #666;
      margin-bottom: 15px;
    }

    .result-tier1 {
      color: #FFD700;
      animation: pulse 1s ease-in-out infinite;
      text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
    }

    .result-tier2 {
      color: #C0C0C0;
      animation: pulse 1s ease-in-out;
      text-shadow: 0 0 8px rgba(192, 192, 192, 0.5);
    }

    .result-tier3 {
      color: #CD7F32;
      animation: pulse 1s ease-in-out;
    }

    .result-tier4 {
      color: #4ecdc4;
    }

    .result-lose {
      color: #999;
    }

    .reset-button {
      background: #333;
      color: white;
      border: none;
      padding: 12px 35px;
      font-size: 16px;
      border-radius: 25px;
      cursor: pointer;
      margin-top: 15px;
      transition: all 0.3s ease;
      white-space: nowrap;
      line-height: 1.4;
      height: auto;
    }

    .reset-button:hover {
      background: #555;
    }

    .loading {
      font-size: 20px;
      color: #667eea;
      margin-top: 20px;
    }

    .spinner {
      border: 4px solid rgba(102, 126, 234, 0.1);
      border-left-color: #667eea;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.9);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .confetti {
      position: fixed;
      width: 10px;
      height: 10px;
      z-index: 999;
      pointer-events: none;
    }

    @keyframes confetti-fall {
      to {
        transform: translateY(100vh) rotate(360deg);
        opacity: 0;
      }
    }

    .stats-info {
      font-size: 14px;
      color: #999;
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #eee;
    }
  </style>
</head>

<body>
  <div id="map" class="map"></div>

  <div class="lottery-overlay" id="lotteryOverlay">
    <div id="startScreen">
      <button class="lottery-button" id="playButton" onclick="playLottery()">
        抽選する
      </button>
    </div>

    <div class="result-container" id="resultScreen">
      <div class="result-message" id="resultMessage"></div>
      <div class="result-prize" id="resultPrize"></div>
      <div class="stats-info" id="statsInfo"></div>
      <button class="reset-button" onclick="resetLottery()">もう一度</button>
    </div>

    <div class="loading" id="loadingScreen" style="display: none;">
      <div class="spinner"></div>
      抽選中...
    </div>
  </div>
</body>

<script>
  {% include {{ page.js }} %}
</script>

</html>
