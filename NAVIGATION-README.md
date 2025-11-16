# Turn-by-Turn Navigation with Mapbox GL JS

This PoC demonstrates how to implement **Navigation SDK-like features** using **Mapbox GL JS + Directions API**.

## 🎯 Features Implemented

### Core Navigation Features
- ✅ **Turn-by-turn instructions** - Step-by-step guidance
- ✅ **Voice guidance** - Spoken navigation instructions (Web Speech API)
- ✅ **Automatic rerouting** - Detects off-route and recalculates
- ✅ **Snap to road** - Projects user location onto route
- ✅ **Camera following** - Smooth map tracking with bearing
- ✅ **Progress tracking** - Distance/time remaining, ETA
- ✅ **Instruction advancement** - Auto-advances when approaching turns
- ✅ **Off-route detection** - Monitors deviation from route
- ✅ **Arrival detection** - Knows when destination reached
- ✅ **Real-time location tracking** - High-accuracy GPS

### UI Components
- ✅ **Instruction banner** - Shows current maneuver
- ✅ **Progress info** - Distance, time, ETA display
- ✅ **Control buttons** - Stop, mute, recenter
- ✅ **Status messages** - Off-route, rerouting notifications
- ✅ **Responsive design** - Works on mobile and desktop

## 📁 Files

- `_includes/turn-by-turn-navigation.js` - Core navigation logic
- `_includes/navigation-ui.js` - UI components
- `turn-by-turn-demo.md` - Demo page

## 🚀 Quick Start

### 1. Setup

Replace the Mapbox token in `turn-by-turn-demo.md`:

```javascript
mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN';
```

### 2. Run

```bash
bundle exec jekyll serve
```

Navigate to: `http://localhost:4000/turn-by-turn-demo.html`

### 3. Test

1. Allow location permissions
2. Enter destination coordinates or select example
3. Click "Start Navigation"
4. Walk/drive to test features

## 💻 Usage

### Basic Implementation

```javascript
// Initialize navigation
const navigation = new TurnByTurnNavigation(map, {
  offRouteThreshold: 30,          // meters
  advanceInstructionDistance: 50, // meters
  voiceEnabled: true,
  cameraFollowEnabled: true,
  profile: 'mapbox/driving-traffic',
  cameraPitch: 60,
  cameraZoom: 17
});

// Start navigation
await navigation.startNavigation(origin, destination);

// Stop navigation
navigation.stopNavigation();
```

### With UI

```javascript
// Initialize UI
const navigationUI = new NavigationUI('nav-ui-container', navigation);

// UI will automatically update with navigation events
navigationUI.show();
```

### Event Callbacks

```javascript
const navigation = new TurnByTurnNavigation(map, {
  onProgressUpdate: (data) => {
    console.log('Distance to next step:', data.distanceToNextStep);
    console.log('Distance remaining:', data.distanceRemaining);
    console.log('Time remaining:', data.durationRemaining);
  },

  onInstructionAdvance: (data) => {
    console.log('Next instruction:', data.instruction);
    console.log('Step:', data.step);
  },

  onOffRoute: (data) => {
    console.log('User went off route at:', data.location);
  },

  onRouteUpdate: (data) => {
    console.log('Route updated:', data.route);
    if (data.isReroute) {
      console.log('This was a reroute');
    }
  },

  onArrival: (data) => {
    console.log('Arrived at destination!');
  },

  onError: (data) => {
    console.error('Navigation error:', data.message);
  }
});
```

## 🔧 Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `offRouteThreshold` | number | 25 | Distance in meters to trigger rerouting |
| `advanceInstructionDistance` | number | 50 | Distance in meters to advance to next step |
| `rerouteDelay` | number | 3000 | Delay in ms before rerouting |
| `voiceEnabled` | boolean | true | Enable voice guidance |
| `cameraFollowEnabled` | boolean | true | Enable camera following |
| `profile` | string | 'mapbox/driving-traffic' | Routing profile |
| `cameraPitch` | number | 60 | Camera pitch angle |
| `cameraZoom` | number | 17 | Camera zoom level |

### Routing Profiles

- `mapbox/driving-traffic` - Driving with live traffic
- `mapbox/driving` - Driving without traffic
- `mapbox/walking` - Walking
- `mapbox/cycling` - Cycling

## 🏗️ Architecture

### Key Components

#### 1. TurnByTurnNavigation Class

Main navigation manager that handles:
- Route fetching from Directions API
- Location tracking with Geolocation API
- Snap-to-route calculations using Turf.js
- Progress tracking and calculations
- Off-route detection
- Automatic rerouting
- Voice synthesis
- Camera management

#### 2. NavigationUI Class

UI layer that:
- Displays navigation instructions
- Shows progress metrics
- Provides user controls
- Handles status messages
- Manages styling

### How It Works

```
User Location Update
       ↓
Snap to Route (Turf.js)
       ↓
Calculate Progress
       ↓
Check Off-Route → Reroute if needed
       ↓
Check Instruction Distance → Advance if close
       ↓
Update UI & Camera
       ↓
Emit Events
```

## 🆚 Comparison with Navigation SDK

| Feature | Navigation SDK | This PoC | Notes |
|---------|---------------|----------|-------|
| Turn-by-turn | ✅ Native | ✅ Custom | Web-based implementation |
| Voice guidance | ✅ Native | ✅ Web Speech API | Quality varies by browser |
| Rerouting | ✅ Automatic | ✅ Automatic | 3s delay to avoid spam |
| Snap to road | ✅ Native | ✅ Turf.js | Good accuracy |
| Camera tracking | ✅ Native | ✅ Custom | Smooth with easeTo |
| Lane guidance | ✅ | ❌ | Would need additional data |
| Speed limits | ✅ | ❌ | Would need additional API |
| Traffic | ✅ Real-time | ✅ Via profile | Uses driving-traffic |
| Battery | ⚡ Optimized | ⚠️ Higher | Web-based uses more power |
| Offline | ✅ | ❌ | Requires connectivity |

## 🎨 Customization

### Custom Instruction Banner

```javascript
navigationUI._updateInstruction = function(data) {
  // Custom logic here
  document.getElementById('nav-instruction').innerHTML =
    `<strong>${data.instruction}</strong>`;
};
```

### Custom Voice

```javascript
navigation._speakInstruction = function(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.2; // Faster
  utterance.pitch = 1.5; // Higher pitch
  utterance.lang = 'ja-JP'; // Japanese
  this.synth.speak(utterance);
};
```

### Custom Route Styling

```javascript
map.setPaintProperty('nav-route-line', 'line-color', '#FF0000');
map.setPaintProperty('nav-route-line', 'line-width', 10);
```

## 🧪 Testing Tips

### Desktop Testing (No GPS)

Use browser location simulation:
1. Chrome DevTools → Sensors tab
2. Set custom location
3. Move location to simulate movement

### Mobile Testing

1. Deploy to HTTPS (required for geolocation)
2. Test with actual movement
3. Check different scenarios:
   - Following route correctly
   - Going off route
   - Missing turns
   - Arrival

## 📱 Mobile Considerations

### Battery Optimization

```javascript
// Reduce update frequency
const watchId = navigator.geolocation.watchPosition(
  callback,
  error,
  {
    enableHighAccuracy: true,
    maximumAge: 1000, // Cache for 1s
    timeout: 5000
  }
);
```

### Wake Lock (Keep Screen On)

```javascript
let wakeLock = null;

async function requestWakeLock() {
  try {
    wakeLock = await navigator.wakeLock.request('screen');
  } catch (err) {
    console.error('Wake Lock error:', err);
  }
}

// Call when navigation starts
requestWakeLock();
```

## 🐛 Known Limitations

1. **Web Speech API Support**
   - Not available in all browsers
   - Voice quality varies
   - Some languages not supported

2. **Location Accuracy**
   - Depends on device GPS
   - Indoor accuracy poor
   - Urban canyons affect signal

3. **Battery Usage**
   - Higher than native SDK
   - Continuous GPS drains battery
   - Screen always on

4. **Offline Support**
   - Requires internet connection
   - Can't cache routes
   - No offline tiles

5. **Lane Guidance**
   - Not implemented
   - Would need additional data parsing

## 🔮 Potential Improvements

### Short Term
- [ ] Add lane guidance visualization
- [ ] Implement speed limit display
- [ ] Add traffic alerts/incidents
- [ ] Better maneuver icons
- [ ] Route alternatives during navigation

### Medium Term
- [ ] Offline route caching (Service Worker)
- [ ] Better battery optimization
- [ ] Predictive rerouting
- [ ] Custom voice packs
- [ ] Night mode

### Long Term
- [ ] AR navigation overlay
- [ ] Multi-stop routing
- [ ] Route sharing
- [ ] Navigation history
- [ ] Gesture controls

## 📚 Dependencies

- **Mapbox GL JS** v3.0.1+ - Map rendering
- **Turf.js** v6+ - Geospatial calculations
- **Web Speech API** - Voice synthesis (built-in)
- **Geolocation API** - Location tracking (built-in)

## 🤝 Contributing

To extend this PoC:

1. Fork and modify `turn-by-turn-navigation.js`
2. Add new features to class
3. Update UI in `navigation-ui.js`
4. Test thoroughly on mobile
5. Document changes

## 📄 License

This is a proof-of-concept for demonstration purposes.

## 🆘 Troubleshooting

### Voice Not Working
- Check browser support (Chrome/Edge recommended)
- Ensure user interaction before speaking
- Test: `window.speechSynthesis.speak(new SpeechSynthesisUtterance('test'))`

### Location Not Updating
- Check HTTPS (required for geolocation)
- Grant location permissions
- Test: `navigator.geolocation.getCurrentPosition(console.log)`

### Off-Route Too Sensitive
- Increase `offRouteThreshold` to 50+ meters
- Adjust `rerouteDelay` to prevent spam

### Camera Not Following
- Check `cameraFollowEnabled: true`
- Ensure bearing is being calculated
- Try clicking "Recenter" button

## 📞 Support

For issues or questions about:
- **Mapbox APIs**: https://docs.mapbox.com/
- **This PoC**: Open an issue in your repository
