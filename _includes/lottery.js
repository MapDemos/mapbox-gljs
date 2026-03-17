// Lottery App
// Replace this with your actual Lambda API Gateway URL
const LAMBDA_API_URL = 'https://oaltm6yf1d.execute-api.ap-northeast-1.amazonaws.com/default/lottery-function?maxWinners=200';

let map;
let isAnimating = false;

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
  let rotation = 0;

  function rotate() {
    if (!isAnimating && map) {
      rotation += 0.1; // Slower rotation speed
      map.easeTo({
        center: [rotation, 35.7],
        duration: 200, // Smoother transition
        easing: (t) => t
      });
      requestAnimationFrame(rotate);
    }
  }

  rotate();
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

  // Dramatic map animation
  await animateGlobe();

  // Always call API to track remaining prizes accurately
  try {
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
  const winParam = urlParams.get('win');

  // Build API URL with parameter if present
  let apiUrl = LAMBDA_API_URL;
  if (winParam === '1' || winParam === '0') {
    // Check if URL already has query params
    const separator = apiUrl.includes('?') ? '&' : '?';
    apiUrl += `${separator}win=${winParam}`;
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
      const forceWin = winParam === '1';
      const forceLose = winParam === '0';
      return {
        isWinner: forceLose ? false : (forceWin || Math.random() < 0.5),
        remaining: Math.floor(Math.random() * 200),
        totalPlays: Math.floor(Math.random() * 400),
        probability: forceWin ? 100 : (forceLose ? 0 : 50)
      };
    }

    throw error;
  }
}

function showResult(result) {
  const { isWinner, remaining } = result;

  // Hide loading
  document.getElementById('loadingScreen').style.display = 'none';

  // Show result
  const resultScreen = document.getElementById('resultScreen');
  const resultMessage = document.getElementById('resultMessage');
  const resultPrize = document.getElementById('resultPrize');
  const statsInfo = document.getElementById('statsInfo');

  resultScreen.style.display = 'block';

  if (isWinner) {
    resultMessage.textContent = '';
    resultMessage.className = 'result-message result-win';
    resultPrize.textContent = '🎉 当たり';
    resultPrize.className = 'result-prize result-win';

    // Celebrate on map and with confetti
    celebrateOnMap();
    createConfetti();
  } else {
    resultMessage.textContent = '残念...';
    resultMessage.className = 'result-message result-lose';
    resultPrize.textContent = 'ハズレ';
    resultPrize.className = 'result-prize result-lose';
  }

  // Show only remaining count
  if (remaining !== undefined) {
    statsInfo.innerHTML = `残り当選枠: ${remaining}`;
  }

  isAnimating = false;
}

function celebrateOnMap() {
  // 1. Initial flash of golden light across map
  const originalFog = {
    color: 'rgb(186, 210, 235)',
    'high-color': 'rgb(36, 92, 223)',
    'horizon-blend': 0.02,
    'space-color': 'rgb(11, 11, 25)',
    'star-intensity': 0.6
  };

  // Flash to bright gold
  map.setFog({
    color: 'rgb(255, 255, 200)',
    'high-color': 'rgb(255, 220, 100)',
    'horizon-blend': 0.1,
    'space-color': 'rgb(30, 30, 40)',
    'star-intensity': 1.0
  });

  // Return to golden atmosphere after flash
  setTimeout(() => {
    map.setFog({
      color: 'rgb(255, 223, 140)',
      'high-color': 'rgb(255, 200, 87)',
      'horizon-blend': 0.05,
      'space-color': 'rgb(11, 11, 25)',
      'star-intensity': 1.0
    });
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

function createConfetti() {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e'];
  const confettiCount = 100;

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
