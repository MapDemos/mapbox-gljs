// Lottery App
// Replace this with your actual Lambda API Gateway URL
const LAMBDA_API_URL = 'https://oaltm6yf1d.execute-api.ap-northeast-1.amazonaws.com/default/lottery-function';

let map;
let isAnimating = false;
let rotationAnimId = null;

// Initialize map on load
window.addEventListener('load', () => {
  initializeMap();
});

function initializeMap() {
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11',
    projection: 'globe',
    zoom: 2.0,
    center: [139.7, 35.7], // Tokyo
    pitch: 0,
    bearing: 0
  });

  map.on('load', () => {
    // Set map to Japanese
    map.getStyle().layers.forEach((layer) => {
      if (layer.layout && layer.layout['text-field']) {
        map.setLayoutProperty(layer.id, 'text-field', [
          'coalesce',
          ['get', 'name_ja'],
          ['get', 'name']
        ]);
      }
    });

    // Add atmosphere styling
    map.setFog({
      color: 'rgb(186, 210, 235)',
      'high-color': 'rgb(36, 92, 223)',
      'horizon-blend': 0.02,
      'space-color': 'rgb(11, 11, 25)',
      'star-intensity': 0.6
    });

    // Gentle rotation animation
    startGlobeRotation();
  });
}

function startGlobeRotation() {
  if (rotationAnimId !== null) {
    cancelAnimationFrame(rotationAnimId);
    rotationAnimId = null;
  }

  let rotation = 0;

  function rotate() {
    if (!isAnimating && map) {
      rotation = (rotation + 0.1) % 360;
      map.easeTo({
        center: [rotation, 35.7],
        duration: 200,
        easing: (t) => t
      });
      rotationAnimId = requestAnimationFrame(rotate);
    } else {
      rotationAnimId = null;
    }
  }

  rotationAnimId = requestAnimationFrame(rotate);
}

async function playLottery() {
  if (isAnimating) return;

  isAnimating = true;

  // Disable button immediately to prevent double-clicks
  const playButton = document.getElementById('playButton');
  if (playButton) playButton.disabled = true;

  // Show loading screen
  document.getElementById('startScreen').style.display = 'none';
  document.getElementById('loadingScreen').style.display = 'block';

  try {
    await animateGlobe();
    const result = await callLotteryAPI();
    showResult(result);
  } catch (error) {
    console.error('Lottery error:', error);
    showError();
  }
}

async function animateGlobe() {
  return new Promise((resolve) => {
    // Spin the globe dramatically
    let spins = 0;
    const targetSpins = 3;
    const duration = 2000;
    const startTime = Date.now();

    function spin() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const rotation = easeProgress * 360 * targetSpins;
      const zoom = 2.0 + Math.sin(progress * Math.PI) * 0.8; // Zoom in and out

      map.easeTo({
        center: [rotation, 35.7 + Math.sin(progress * Math.PI * 2) * 20],
        zoom: zoom,
        pitch: Math.sin(progress * Math.PI) * 45,
        bearing: rotation,
        duration: 50,
        easing: (t) => t
      });

      if (progress < 1) {
        requestAnimationFrame(spin);
      } else {
        // Return to original position
        map.easeTo({
          center: [139.7, 35.7],
          zoom: 2.0,
          pitch: 0,
          bearing: 0,
          duration: 500
        });

        setTimeout(resolve, 500);
      }
    }

    spin();
  });
}

async function callLotteryAPI() {
  // Check for URL parameter to pass to Lambda
  const urlParams = new URLSearchParams(window.location.search);
  const tierParam = urlParams.get('tier'); // e.g., ?tier=1 or ?tier=0

  // Build API URL with parameter if present
  let apiUrl = LAMBDA_API_URL;
  if (tierParam !== null) {
    // Check if URL already has query params
    const separator = apiUrl.includes('?') ? '&' : '?';
    apiUrl += `${separator}tier=${tierParam}`;
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API call failed:', error);

    // Fallback for development/testing (remove in production)
    if (LAMBDA_API_URL.includes('YOUR-API-ID')) {
      console.warn('Using mock data - please configure LAMBDA_API_URL');
      const forceTier = tierParam ? parseInt(tierParam, 10) : null;
      let tier = 4; // Default to consolation
      if (forceTier !== null) {
        tier = forceTier;
      } else {
        const rand = Math.random();
        if (rand < 0.005) tier = 1;
        else if (rand < 0.02) tier = 2;
        else if (rand < 0.30) tier = 3;
        else tier = 4;
      }
      return {
        tier,
        tierName: `${tier}等`,
        remaining: {
          tier1: 1,
          tier2: 2,
          tier3: 50,
          tier4: 99999
        }
      };
    }

    throw error;
  }
}

function showResult(result) {
  const { tier, tierName, remaining } = result;

  // Hide loading
  document.getElementById('loadingScreen').style.display = 'none';

  // Show result
  const resultScreen = document.getElementById('resultScreen');
  const resultMessage = document.getElementById('resultMessage');
  const resultPrize = document.getElementById('resultPrize');
  const statsInfo = document.getElementById('statsInfo');

  resultScreen.style.display = 'block';

  // Different displays based on tier
  if (tier === 1) {
    // 1等 - Grand prize
    resultMessage.textContent = '大当たり！';
    resultMessage.className = 'result-message result-tier1';
    resultPrize.textContent = '🎊 1等';
    resultPrize.className = 'result-prize result-tier1';
    celebrateOnMap('gold');
    createConfetti(150); // More confetti
  } else if (tier === 2) {
    // 2等 - Second prize
    resultMessage.textContent = 'おめでとうございます！';
    resultMessage.className = 'result-message result-tier2';
    resultPrize.textContent = '🎉 2等';
    resultPrize.className = 'result-prize result-tier2';
    celebrateOnMap('silver');
    createConfetti(100);
  } else if (tier === 3) {
    // 3等 - Third prize
    resultMessage.textContent = '当選！';
    resultMessage.className = 'result-message result-tier3';
    resultPrize.textContent = '⭐ 3等';
    resultPrize.className = 'result-prize result-tier3';
    celebrateOnMap('bronze');
    createConfetti(50);
  } else if (tier === 4) {
    // 4等 - Consolation prize
    resultMessage.textContent = '参加賞';
    resultMessage.className = 'result-message result-tier4';
    resultPrize.textContent = '🎁 4等';
    resultPrize.className = 'result-prize result-tier4';
    // No map celebration for consolation
  } else {
    // tier === 0 - No prize (shouldn't happen with consolation tier)
    resultMessage.textContent = '残念...';
    resultMessage.className = 'result-message result-lose';
    resultPrize.textContent = 'ハズレ';
    resultPrize.className = 'result-prize result-lose';
  }

  // Show remaining counts for each tier
  if (remaining) {
    let statsHtml = '<div style="font-size: 12px; line-height: 1.6;">';
    if (remaining.tier1 !== undefined) statsHtml += `1等 残り: ${remaining.tier1}<br>`;
    if (remaining.tier2 !== undefined) statsHtml += `2等 残り: ${remaining.tier2}<br>`;
    if (remaining.tier3 !== undefined) statsHtml += `3等 残り: ${remaining.tier3}<br>`;
    statsHtml += '</div>';
    statsInfo.innerHTML = statsHtml;
  }

  isAnimating = false;
}

function celebrateOnMap(theme = 'gold') {
  // Different color themes for different tiers
  const themes = {
    gold: {
      flash: {
        color: 'rgb(255, 255, 200)',
        'high-color': 'rgb(255, 220, 100)',
        'horizon-blend': 0.1,
        'space-color': 'rgb(30, 30, 40)',
        'star-intensity': 1.0
      },
      sustained: {
        color: 'rgb(255, 223, 140)',
        'high-color': 'rgb(255, 200, 87)',
        'horizon-blend': 0.05,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 1.0
      }
    },
    silver: {
      flash: {
        color: 'rgb(240, 240, 255)',
        'high-color': 'rgb(200, 200, 230)',
        'horizon-blend': 0.08,
        'space-color': 'rgb(30, 30, 40)',
        'star-intensity': 0.9
      },
      sustained: {
        color: 'rgb(220, 220, 240)',
        'high-color': 'rgb(180, 180, 210)',
        'horizon-blend': 0.04,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.8
      }
    },
    bronze: {
      flash: {
        color: 'rgb(255, 230, 200)',
        'high-color': 'rgb(230, 180, 130)',
        'horizon-blend': 0.06,
        'space-color': 'rgb(30, 30, 40)',
        'star-intensity': 0.8
      },
      sustained: {
        color: 'rgb(240, 210, 180)',
        'high-color': 'rgb(210, 160, 110)',
        'horizon-blend': 0.03,
        'space-color': 'rgb(11, 11, 25)',
        'star-intensity': 0.7
      }
    }
  };

  const selectedTheme = themes[theme] || themes.gold;

  // Flash to bright color
  map.setFog(selectedTheme.flash);

  // Return to sustained atmosphere after flash
  setTimeout(() => {
    map.setFog(selectedTheme.sustained);
  }, 300);

  // 2. Add celebration icons at random locations
  const icons = ['🎉', '🎊', '⭐'];
  const celebrationPoints = [];

  // Create 30 random celebration points
  for (let i = 0; i < 30; i++) {
    const lng = -180 + Math.random() * 360;
    const lat = -60 + Math.random() * 120;

    celebrationPoints.push({
      type: 'Feature',
      properties: {
        icon: icons[Math.floor(Math.random() * icons.length)],
        index: i
      },
      geometry: {
        type: 'Point',
        coordinates: [lng, lat]
      }
    });
  }

  // Add celebration icons source
  if (!map.getSource('celebration-icons')) {
    map.addSource('celebration-icons', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: celebrationPoints
      }
    });

    // Load emoji as images
    const emojis = [
      { name: 'party', emoji: '🎉' },
      { name: 'confetti', emoji: '🎊' },
      { name: 'star', emoji: '⭐' }
    ];

    let loaded = 0;
    emojis.forEach(({ name, emoji }) => {
      // Check if image already exists
      if (map.hasImage(name)) {
        loaded++;
        if (loaded === emojis.length) {
          addCelebrationLayer();
        }
        return;
      }

      // Create canvas with emoji
      const canvas = document.createElement('canvas');
      const size = 64;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.font = `${size * 0.8}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, size / 2, size / 2);

      const imageData = ctx.getImageData(0, 0, size, size);
      map.addImage(name, imageData);
      loaded++;

      if (loaded === emojis.length) {
        addCelebrationLayer();
      }
    });
  }

  function addCelebrationLayer() {
    if (!map.getLayer('celebration-icons-layer')) {
      map.addLayer({
        id: 'celebration-icons-layer',
        type: 'symbol',
        source: 'celebration-icons',
        layout: {
          'icon-image': [
            'match',
            ['get', 'icon'],
            '🎉', 'party',
            '🎊', 'confetti',
            '⭐', 'star',
            'party'
          ],
          'icon-size': 0.5,
          'icon-allow-overlap': true,
          'icon-ignore-placement': true
        },
        paint: {
          'icon-opacity': 1.0
        }
      });

      // Animate icons floating up
      animateCelebrationIcons();
    }
  }

  function animateCelebrationIcons() {
    let frame = 0;

    const animate = () => {
      if (map.getLayer('celebration-icons-layer')) {
        frame++;
        const progress = (frame % 120) / 120; // 2 second loop

        // Icons grow and fade as they "float up"
        const size = 0.5 + progress * 0.8;
        const opacity = 1.0 - progress * 0.5;

        map.setLayoutProperty('celebration-icons-layer', 'icon-size', size);
        map.setPaintProperty('celebration-icons-layer', 'icon-opacity', opacity);

        requestAnimationFrame(animate);
      }
    };

    animate();
  }
}

function createConfetti(count = 100) {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e'];
  const confettiCount = count;

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';

    // Random position across the screen
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.top = -10 + 'px';

    // Random color
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

    // Random size
    const size = Math.random() * 8 + 6;
    confetti.style.width = size + 'px';
    confetti.style.height = size + 'px';

    // Random rotation
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

    // Random animation duration and delay
    const duration = Math.random() * 2 + 2; // 2-4 seconds
    const delay = Math.random() * 0.5; // 0-0.5s delay

    confetti.style.animation = `confetti-fall ${duration}s linear ${delay}s forwards`;

    document.body.appendChild(confetti);

    // Remove confetti after animation
    setTimeout(() => {
      confetti.remove();
    }, (duration + delay) * 1000 + 100);
  }
}

function showError() {
  document.getElementById('loadingScreen').style.display = 'none';

  const resultScreen = document.getElementById('resultScreen');
  const resultMessage = document.getElementById('resultMessage');
  const resultPrize = document.getElementById('resultPrize');
  const statsInfo = document.getElementById('statsInfo');

  resultScreen.style.display = 'block';
  resultMessage.textContent = 'エラーが発生しました';
  resultMessage.className = 'result-message';
  resultPrize.textContent = 'もう一度お試しください';
  resultPrize.className = 'result-prize';
  statsInfo.innerHTML = '';

  isAnimating = false;
}

function resetLottery() {
  // Hide result screen
  document.getElementById('resultScreen').style.display = 'none';

  // Show start screen
  document.getElementById('startScreen').style.display = 'block';

  // Re-enable button
  const playButton = document.getElementById('playButton');
  if (playButton) playButton.disabled = false;

  // Clean up celebration effects
  if (map.getLayer('celebration-icons-layer')) {
    map.removeLayer('celebration-icons-layer');
  }
  if (map.getSource('celebration-icons')) {
    map.removeSource('celebration-icons');
  }

  // Restore original atmosphere
  map.setFog({
    color: 'rgb(186, 210, 235)',
    'high-color': 'rgb(36, 92, 223)',
    'horizon-blend': 0.02,
    'space-color': 'rgb(11, 11, 25)',
    'star-intensity': 0.6
  });

  // Reset map to original position
  map.easeTo({
    center: [139.7, 35.7],
    zoom: 2.0,
    pitch: 0,
    bearing: 0,
    duration: 500
  });

  isAnimating = false;

  // Resume gentle rotation
  setTimeout(() => {
    if (!isAnimating) {
      startGlobeRotation();
    }
  }, 600);
}
