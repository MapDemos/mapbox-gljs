/**
 * Turn-by-Turn Navigation Manager
 * Provides Navigation SDK-like features using Mapbox GL JS + Directions API
 *
 * RESPONSIBILITY BOUNDARIES:
 * ========================
 * This class handles:
 * - Route fetching from Directions API
 * - Navigation state management (current step, progress, arrival)
 * - Off-route detection using RAW GPS (before snapping)
 * - Rerouting logic and debouncing
 * - Instruction advancement and voice guidance
 * - Camera following with user interaction detection
 * - Movement filtering (deciding when to update navigation state)
 *
 * This class DOES NOT handle:
 * - GPS processing (filtering, prediction, snapping) → GLJSLocationPuckController
 * - Map matching API calls → GLJSLocationPuckController
 * - Puck animation and display → GLJSLocationPuckController
 *
 * INTEGRATION WITH PUCK CONTROLLER:
 * - Receives raw GPS from geolocation API
 * - Passes ALL GPS updates to puck controller (for smooth animation)
 * - Gets back processed location (predicted + matched + snapped)
 * - Uses processed location for camera and progress display
 * - Uses RAW GPS location for off-route detection
 */

class TurnByTurnNavigation {
  constructor(map, options = {}) {
    this.map = map;
    this.accessToken = options.accessToken || mapboxgl.accessToken;

    // Configuration
    this.config = {
      advanceInstructionDistance: options.advanceInstructionDistance || 50, // meters
      rerouteDelay: options.rerouteDelay || 3000, // ms
      voiceEnabled: options.voiceEnabled !== false,
      cameraFollowEnabled: options.cameraFollowEnabled !== false,
      profile: options.profile || 'mapbox/driving-traffic', // driving, walking, cycling
      language: options.language || 'ja', // ja (Japanese) or en (English)
      cameraPitch: options.cameraPitch || 60,
      cameraZoom: options.cameraZoom || 17,
      // Movement filtering
      minMovementDistance: options.minMovementDistance || 10, // meters
      minMovementSpeed: options.minMovementSpeed || 0.5, // m/s
      maxAccuracy: options.maxAccuracy || 50, // meters
      // Simulation mode
      simulationMode: options.simulationMode || false,
    };

    // State
    this.state = {
      isNavigating: false,
      currentRoute: null,
      currentStep: 0,
      userLocation: null,
      processedLocation: null, // GPS after prediction, map matching, and snapping by puck controller
      distanceToNextStep: null,
      distanceRemaining: null,
      durationRemaining: null,
      isOffRoute: false,
      lastRerouteTime: 0,
      bearing: 0,
      userTouchedMap: false,
      lastUserInteraction: 0,
      isProgrammaticMovement: false,
      offRouteConfirmStartTime: null, // Track when we entered confirm zone
      isCheckingOffRoute: false, // Prevent concurrent off-route checks
    };

    // Geolocation
    this.watchId = null;
    this.locationAccuracy = null;

    // Map Matching
    this.locationHistory = []; // Store recent GPS points for map matching
    this.maxHistoryPoints = 5; // Keep last 5 points (reduced from 10)
    this.lastMapMatchTime = 0;
    this.mapMatchingDebounce = 1500; // Minimum time between API calls (ms)
    this.isMapMatching = false; // Prevent concurrent API calls
    this.lastProcessedLocation = null; // Track last position that was processed

    // Voice synthesis
    this.synth = window.speechSynthesis;
    this.lastSpokenInstruction = null;
    this.voicesLoaded = false;
    this.speechPrimed = false;

    // Load voices (required for iOS)
    this._loadVoices();

    // Initialize location puck controller for smooth GPS animation
    this.puckController = new GLJSLocationPuckController(map, this.accessToken, {
      predictionMillis: 1000,
      animationDuration: 1000,
      numKeyPoints: 15,  // Increased from 5 to better follow route curves
      mapMatchingRadius: 50,
      maxTurnRatePerSecond: 90,
      velocitySmoothingFactor: 0.3
    });

    // Event callbacks
    this.callbacks = {
      onRouteUpdate: options.onRouteUpdate || null,
      onProgressUpdate: options.onProgressUpdate || null,
      onInstructionAdvance: options.onInstructionAdvance || null,
      onOffRoute: options.onOffRoute || null,
      onArrival: options.onArrival || null,
      onError: options.onError || null,
    };

    // Debug counters
    this.directionsApiCount = 0;

    this._initializeLayers();
    this._setupUserInteractionListeners();
  }

  /**
   * Get profile-specific off-route thresholds
   * Returns: { snapZone, confirmZone, immediateReroute }
   */
  _getOffRouteThresholds() {
    const profile = this.config.profile.toLowerCase();

    // Walking: Tightest thresholds (slow speed, stable GPS)
    if (profile.includes('walking')) {
      return {
        snapZone: 15,        // 0-15m: snap to route
        confirmZone: 30,     // 15-30m: check with Map Matching
        immediateReroute: 30 // >30m: immediate reroute
      };
    }

    // Cycling: Medium thresholds
    if (profile.includes('cycling')) {
      return {
        snapZone: 20,        // 0-20m: snap to route
        confirmZone: 50,     // 20-50m: check with Map Matching
        immediateReroute: 50 // >50m: immediate reroute
      };
    }

    // Driving (default): Largest thresholds (high speed, GPS less accurate)
    // Includes driving, driving-traffic, etc.
    return {
      snapZone: 30,        // 0-30m: snap to route
      confirmZone: 70,     // 30-70m: check with Map Matching
      immediateReroute: 70 // >70m: immediate reroute
    };
  }

  /**
   * Setup listeners for user map interactions
   */
  _setupUserInteractionListeners() {
    const markUserInteraction = (e) => {
      // Ignore if this is a programmatic camera movement
      if (this.state.isProgrammaticMovement) {
        console.log('⏭️ Ignoring programmatic movement:', e.type);
        return;
      }

      console.log('🖐️ User touched map:', e.type);

      // Completely disable camera following when user touches map
      this.config.cameraFollowEnabled = false;
      this.state.userTouchedMap = true;
      this.state.lastUserInteraction = Date.now();
    };

    // Only listen to START events - not continuous events
    // This way we don't interfere with user's own dragging
    const mapContainer = this.map.getContainer();

    mapContainer.addEventListener('touchstart', markUserInteraction, true);
    mapContainer.addEventListener('mousedown', markUserInteraction, true);

    this.map.on('dragstart', markUserInteraction);
    this.map.on('pitchstart', markUserInteraction);
    this.map.on('rotatestart', markUserInteraction);
    this.map.on('zoomstart', markUserInteraction);
    this.map.on('wheel', markUserInteraction);
  }

  /**
   * Initialize map layers for route display
   */
  _initializeLayers() {
    if (!this.map.getSource('nav-route')) {
      this.map.addSource('nav-route', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      this.map.addLayer({
        id: 'nav-route-casing',
        type: 'line',
        source: 'nav-route',
        paint: {
          'line-color': '#2d5f99',
          'line-width': 12,
          'line-opacity': 0.4
        }
      });

      this.map.addLayer({
        id: 'nav-route-line',
        type: 'line',
        source: 'nav-route',
        paint: {
          'line-color': '#4882c5',
          'line-width': 8
        }
      });
    }

    // Note: User location marker is now handled by GLJSLocationPuckController
  }

  /**
   * Load voices for speech synthesis (required for iOS)
   */
  _loadVoices() {
    if (!this.synth) return;

    const loadVoicesImpl = () => {
      const voices = this.synth.getVoices();
      if (voices.length > 0) {
        this.voicesLoaded = true;
        console.log('🗣️ Voices loaded:', voices.length);
      }
    };

    // Load voices immediately if available
    loadVoicesImpl();

    // Also listen for voiceschanged event (fires on iOS/Chrome)
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoicesImpl;
    }
  }

  /**
   * Prime speech synthesis for iOS (must be called from user interaction)
   */
  primeSpeechSynthesis() {
    if (!this.synth || this.speechPrimed) return;

    try {
      // Speak empty utterance to "unlock" speech synthesis on iOS
      const utterance = new SpeechSynthesisUtterance('');
      utterance.volume = 0; // Silent
      utterance.rate = 10; // Fast
      this.synth.speak(utterance);
      this.speechPrimed = true;
      console.log('🔓 Speech synthesis primed for iOS');
    } catch (error) {
      console.warn('⚠️ Failed to prime speech synthesis:', error);
    }
  }

  /**
   * Start navigation from origin to destination
   */
  async startNavigation(origin, destination) {
    try {
      this.state.isNavigating = true;
      this.state.currentStep = 0;

      // Fetch route
      const route = await this._fetchRoute(origin, destination);
      this.state.currentRoute = route;

      // Pass route to puck controller for route-aware predictions
      // Puck controller expects geometry object with coordinates property
      this.puckController.setRoute(route.geometry);

      // Display route
      this._displayRoute(route);

      // Enable camera follow and move to origin location
      const originLocation = Array.isArray(origin)
        ? { lng: origin[0], lat: origin[1] }
        : origin;
      this.state.userLocation = originLocation;

      // Enable camera following
      this.enableCameraFollow();

      // Start location tracking (only if not in simulation mode)
      if (!this.config.simulationMode) {
        this._startLocationTracking();
      } else {
        console.log('🎬 Simulation mode: Skipping GPS location tracking');
      }

      // Emit route update
      this._emit('onRouteUpdate', { route });

      // Speak first instruction
      if (route.legs[0].steps.length > 0) {
        this._speakInstruction(route.legs[0].steps[0].maneuver.instruction);
      }

      return route;
    } catch (error) {
      this._emit('onError', { error, message: 'Failed to start navigation' });
      throw error;
    }
  }

  /**
   * Fetch route from Directions API
   */
  async _fetchRoute(origin, destination) {
    const originStr = Array.isArray(origin) ? origin.join(',') : `${origin.lng},${origin.lat}`;
    const destStr = Array.isArray(destination) ? destination.join(',') : `${destination.lng},${destination.lat}`;

    const url = `https://api.mapbox.com/directions/v5/${this.config.profile}/${originStr};${destStr}`;
    const params = new URLSearchParams({
      access_token: this.accessToken,
      geometries: 'polyline6',
      overview: 'full',
      steps: 'true',
      banner_instructions: 'true',
      voice_instructions: 'true',
      alternatives: 'false',
      language: this.config.language
    });
    console.log('🚦 Fetching route:', `${url}?${params}`);
    this.directionsApiCount++;
    const response = await fetch(`${url}?${params}`);
    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }

    const route = data.routes[0];

    // Decode polyline to geojson
    route.geometry = this._decodePolyline(route.geometry);

    // Decode step geometries too
    if (route.legs) {
      route.legs.forEach(leg => {
        if (leg.steps) {
          leg.steps.forEach(step => {
            if (step.geometry) {
              step.geometry = this._decodePolyline(step.geometry);
            }
          });
        }
      });
    }

    return route;
  }

  // REMOVED: _performMapMatching() - puck controller handles map matching
  // REMOVED: _confirmOffRouteWithMapMatching() - simplified off-route detection
  // REMOVED: _calculateBearingFromPoints() - puck controller has calculateBearing()

  /**
   * Decode polyline6 format to GeoJSON
   */
  _decodePolyline(encoded) {
    if (typeof encoded === 'object') {
      // Already decoded
      return encoded;
    }

    const coordinates = [];
    let index = 0;
    let lat = 0;
    let lng = 0;
    const precision = 6;
    const factor = Math.pow(10, precision);

    while (index < encoded.length) {
      let byte;
      let shift = 0;
      let result = 0;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += deltaLat;

      shift = 0;
      result = 0;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += deltaLng;

      coordinates.push([lng / factor, lat / factor]);
    }

    return {
      type: 'LineString',
      coordinates: coordinates
    };
  }

  /**
   * Display route on map
   */
  _displayRoute(route) {
    const geojson = {
      type: 'Feature',
      geometry: route.geometry
    };

    this.map.getSource('nav-route').setData(geojson);

    // Fit bounds to route
    const coordinates = route.geometry.coordinates;
    const bounds = coordinates.reduce((bounds, coord) => {
      return bounds.extend(coord);
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

    this.map.fitBounds(bounds, { padding: 100, duration: 1000 });
  }

  /**
   * Start tracking user location
   */
  _startLocationTracking() {
    if (!navigator.geolocation) {
      this._emit('onError', { message: 'Geolocation not supported' });
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => this._handleLocationUpdate(position),
      (error) => this._emit('onError', { error, message: 'Location error' }),
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );
  }

  /**
   * Check if location update should be processed (movement filtering)
   */
  _shouldProcessLocationUpdate(position) {
    // In simulation mode, bypass all filtering - process every update
    if (this.config.simulationMode) {
      return true;
    }

    const userLocation = {
      lng: position.coords.longitude,
      lat: position.coords.latitude
    };
    const accuracy = position.coords.accuracy;
    const speed = position.coords.speed; // m/s (can be null)

    // Rule 1: Reject poor accuracy GPS
    if (accuracy > this.config.maxAccuracy) {
      console.log(`⚠️ GPS accuracy too poor: ${Math.round(accuracy)}m (max: ${this.config.maxAccuracy}m)`);
      return false;
    }

    // Rule 2: Always process first location
    if (!this.lastProcessedLocation) {
      console.log('✅ First location - processing');
      return true;
    }

    // Rule 3: Check if moved enough distance
    const distanceMoved = turf.distance(
      turf.point([this.lastProcessedLocation.lng, this.lastProcessedLocation.lat]),
      turf.point([userLocation.lng, userLocation.lat]),
      { units: 'meters' }
    );

    // Rule 4: Check speed (if available)
    const isMovingFast = speed !== null && speed >= this.config.minMovementSpeed;

    // Decision: Process if moved enough OR moving fast
    const shouldProcess = distanceMoved >= this.config.minMovementDistance || isMovingFast;

    if (!shouldProcess) {
      console.log(`⏸️ Stationary/small movement - distance: ${distanceMoved.toFixed(1)}m, speed: ${speed !== null ? speed.toFixed(1) : 'N/A'} m/s`);
    } else {
      console.log(`✅ Movement detected - distance: ${distanceMoved.toFixed(1)}m, speed: ${speed !== null ? speed.toFixed(1) : 'N/A'} m/s`);
    }

    return shouldProcess;
  }

  /**
   * Handle location updates - now using puck controller for all GPS processing
   */
  async _handleLocationUpdate(position) {
    if (!this.state.isNavigating || !this.state.currentRoute) return;

    const userLocation = {
      lng: position.coords.longitude,
      lat: position.coords.latitude,
      timestamp: position.timestamp
    };

    // Always update state location for current position tracking
    this.state.userLocation = userLocation;
    this.locationAccuracy = position.coords.accuracy;

    // Calculate bearing from device heading if available
    if (position.coords.heading !== null && position.coords.heading >= 0) {
      this.state.bearing = position.coords.heading;
    }

    // ALWAYS pass GPS to puck controller - it needs all updates for smooth animation
    // Puck controller has its own validation logic
    try {
      await this.puckController.updateLocation({
        lat: userLocation.lat,
        lng: userLocation.lng,
        bearing: position.coords.heading || this.state.bearing,
        speed: position.coords.speed || 0,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      });
    } catch (error) {
      console.error('❌ Puck controller update failed:', error);
      // Fallback: continue with raw GPS
    }

    // Movement filtering: Check if we should update navigation state
    // (progress, instructions, etc) - but puck still animates above
    if (!this._shouldProcessLocationUpdate(position)) {
      console.log('⏸️ Skipping navigation state update (stationary or poor GPS)');
      return; // Skip navigation updates - user is stationary or GPS is poor
    }

    // Update last processed location for movement filtering
    this.lastProcessedLocation = userLocation;

    // Get the processed location from puck controller
    const processedLocation = this.puckController.lastLocation;
    if (!processedLocation) {
      console.warn('⚠️ Puck controller has no processed location yet, using raw GPS');
      // Use raw GPS as fallback
      this.state.processedLocation = {
        lng: userLocation.lng,
        lat: userLocation.lat,
        distance: 0
      };
    } else {
      // Use puck's processed location for display and camera
      this.state.processedLocation = {
        lng: processedLocation.lng,
        lat: processedLocation.lat,
        distance: 0
      };

      // Update bearing from puck if available
      if (processedLocation.bearing !== undefined) {
        this.state.bearing = processedLocation.bearing;
      }
    }

    // Off-route detection: check RAW GPS distance from route
    // IMPORTANT: We must use RAW GPS, not snapped location, because the puck
    // controller already snaps to the route, so snapped location would always
    // be on the route (~0m away), making off-route detection impossible!
    const distanceFromRoute = this._checkDistanceFromRoute(userLocation);
    const thresholds = this._getOffRouteThresholds();

    if (distanceFromRoute > thresholds.immediateReroute) {
      console.log(`🚨 Off route: ${distanceFromRoute.toFixed(1)}m from route (raw GPS)`);
      if (!this.state.isOffRoute) {
        this._handleOffRoute();
      }
      this.state.isOffRoute = true;
    } else {
      console.log(`✅ On route: ${distanceFromRoute.toFixed(1)}m from route (raw GPS)`);
      this.state.isOffRoute = false;
    }

    console.log('📹 Camera follow enabled:', this.config.cameraFollowEnabled);

    // Calculate progress
    this._calculateProgress(this.state.processedLocation);

    // Check if should advance to next instruction
    this._checkInstructionAdvancement();

    // Update camera to follow processed location (same as puck)
    if (this.config.cameraFollowEnabled) {
      this._updateCamera(this.state.processedLocation);
    }

    // Emit progress update
    this._emit('onProgressUpdate', {
      location: userLocation,
      processedLocation: this.state.processedLocation,
      currentStep: this.state.currentStep,
      distanceToNextStep: this.state.distanceToNextStep,
      distanceRemaining: this.state.distanceRemaining,
      durationRemaining: this.state.durationRemaining,
      isOffRoute: this.state.isOffRoute
    });
  }

  /**
   * Check distance from route (simplified - puck controller handles snapping)
   */
  _checkDistanceFromRoute(location) {
    const route = this.state.currentRoute;
    const routeLine = turf.lineString(route.geometry.coordinates);
    const point = turf.point([location.lng, location.lat]);
    const nearest = turf.nearestPointOnLine(routeLine, point);
    return turf.distance(point, nearest, { units: 'meters' });
  }

  // REMOVED: _snapToRoute() - puck controller handles snapping
  // REMOVED: _snapToSegment() - puck controller handles snapping

  /**
   * Calculate navigation progress
   */
  _calculateProgress(snapped) {
    const route = this.state.currentRoute;
    const steps = route.legs[0].steps;
    const currentStep = steps[this.state.currentStep];

    if (!currentStep) return;

    // Calculate distance to next step
    const userPoint = turf.point([snapped.lng, snapped.lat]);
    const stepEndCoord = currentStep.geometry.coordinates[currentStep.geometry.coordinates.length - 1];
    const stepEndPoint = turf.point(stepEndCoord);

    this.state.distanceToNextStep = turf.distance(userPoint, stepEndPoint, { units: 'meters' });

    // Calculate remaining distance (rough estimate)
    let remainingDistance = this.state.distanceToNextStep;
    for (let i = this.state.currentStep + 1; i < steps.length; i++) {
      remainingDistance += steps[i].distance;
    }
    this.state.distanceRemaining = remainingDistance;

    // Estimate remaining duration
    const avgSpeed = route.duration / route.distance; // seconds per meter
    this.state.durationRemaining = remainingDistance * avgSpeed;
  }

  /**
   * Check if should advance to next instruction
   */
  _checkInstructionAdvancement() {
    if (this.state.distanceToNextStep < this.config.advanceInstructionDistance) {
      this._advanceToNextInstruction();
    }
  }

  /**
   * Advance to next navigation instruction
   */
  _advanceToNextInstruction() {
    const steps = this.state.currentRoute.legs[0].steps;

    if (this.state.currentStep >= steps.length - 1) {
      // Arrived at destination
      this._handleArrival();
      return;
    }

    this.state.currentStep++;
    const nextStep = steps[this.state.currentStep];

    // Speak instruction
    this._speakInstruction(nextStep.maneuver.instruction);

    // Emit event
    this._emit('onInstructionAdvance', {
      step: this.state.currentStep,
      instruction: nextStep.maneuver.instruction,
      distance: nextStep.distance,
      duration: nextStep.duration
    });
  }

  /**
   * Handle off-route scenario
   */
  _handleOffRoute() {
    const now = Date.now();

    // Debounce rerouting
    if (now - this.state.lastRerouteTime < this.config.rerouteDelay) {
      return;
    }

    this.state.lastRerouteTime = now;

    this._emit('onOffRoute', { location: this.state.userLocation });

    // Request new route
    this._reroute();
  }

  /**
   * Request new route from current location
   */
  async _reroute() {
    if (!this.state.userLocation || !this.state.currentRoute) return;

    try {
      const destination = this.state.currentRoute.geometry.coordinates[
        this.state.currentRoute.geometry.coordinates.length - 1
      ];

      const newRoute = await this._fetchRoute(this.state.userLocation, destination);
      this.state.currentRoute = newRoute;
      this.state.currentStep = 0;

      this._displayRoute(newRoute);

      this._emit('onRouteUpdate', { route: newRoute, isReroute: true });

      // Speak new instruction
      if (newRoute.legs[0].steps.length > 0) {
        this._speakInstruction('Rerouting. ' + newRoute.legs[0].steps[0].maneuver.instruction);
      }
    } catch (error) {
      this._emit('onError', { error, message: 'Rerouting failed' });
    }
  }

  /**
   * Handle arrival at destination
   */
  _handleArrival() {
    this._speakInstruction('You have arrived at your destination');
    this._emit('onArrival', {
      location: this.state.userLocation,
      route: this.state.currentRoute
    });
    // Don't auto-stop navigation - let user manually go back via home button
    // this.stopNavigation();
  }

  /**
   * Update camera to follow user
   */
  _updateCamera(location) {
    // Only follow if camera follow is enabled
    if (!this.config.cameraFollowEnabled) {
      console.log('🚫 Camera follow disabled by user interaction');
      return;
    }

    console.log('📹 Moving camera to user location');

    // Mark as programmatic movement to ignore in event listeners
    this.state.isProgrammaticMovement = true;

    // Use puck controller's animation duration for synchronized movement
    const cameraDuration = this.puckController.config.animationDuration || 1000;

    this.map.easeTo({
      center: [location.lng, location.lat],
      zoom: this.config.cameraZoom,
      pitch: this.config.cameraPitch,
      bearing: this.state.bearing,
      duration: cameraDuration,
      essential: false  // Allow user to interrupt
    });

    // Clear programmatic flag after animation completes
    setTimeout(() => {
      this.state.isProgrammaticMovement = false;
    }, cameraDuration + 100); // Slightly longer than animation duration
  }

  /**
   * Re-enable camera following (call from recenter button)
   */
  enableCameraFollow() {
    console.log('▶️ Camera follow re-enabled');
    this.config.cameraFollowEnabled = true;
    this.state.userTouchedMap = false;
    this.state.isProgrammaticMovement = true;

    // Immediately center on processed location
    if (this.state.processedLocation) {
      this._updateCamera(this.state.processedLocation);
    }

    console.log('✅ Camera should now be following');
  }

  /**
   * Speak navigation instruction
   */
  _speakInstruction(text) {
    if (!this.config.voiceEnabled || !this.synth) return;

    // Prevent repeating same instruction
    if (text === this.lastSpokenInstruction) return;
    this.lastSpokenInstruction = text;

    // Wait for voices to load if not ready yet (iOS)
    if (!this.voicesLoaded) {
      console.log('⏳ Waiting for voices to load...');
      setTimeout(() => this._speakInstruction(text), 100);
      return;
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Set language based on config (map to full locale codes)
    const locale = this.config.language === 'ja' ? 'ja-JP' : 'en-US';
    utterance.lang = locale;

    // Try to select a matching voice (important for iOS)
    const voices = this.synth.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(this.config.language));

    if (matchingVoice) {
      utterance.voice = matchingVoice; // Explicitly set the voice
      console.log(`🗣️ Using voice: ${matchingVoice.name} (${matchingVoice.lang})`);
    } else {
      console.warn(`⚠️ No ${locale} voice found. Using default voice. Available voices:`,
        voices.map(v => `${v.name} (${v.lang})`).join(', '));
    }

    // iOS Safari requires speaking to happen soon after user interaction
    // If speech fails silently, this helps debug
    utterance.onerror = (event) => {
      console.error('❌ Speech error:', event.error);
      // iOS sometimes fails on first attempt - retry once
      if (event.error === 'synthesis-failed' || event.error === 'audio-busy') {
        console.log('🔄 Retrying speech...');
        setTimeout(() => {
          this.synth.cancel();
          this.synth.speak(utterance);
        }, 100);
      }
    };

    utterance.onstart = () => {
      console.log('▶️ Speech started:', text.substring(0, 30) + '...');
    };

    this.synth.speak(utterance);
  }

  /**
   * Enable/disable simulation mode
   * Syncs the setting across both navigation and puck controller
   */
  setSimulationMode(enabled) {
    this.config.simulationMode = enabled;
    this.puckController.config.simulationMode = enabled;
    console.log(`🎬 Simulation mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Stop navigation
   */
  stopNavigation() {
    this.state.isNavigating = false;

    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.synth) {
      this.synth.cancel();
    }

    // Reset speech priming flag for next navigation session
    this.speechPrimed = false;
    this.lastSpokenInstruction = null;

    // Clear route from puck controller
    this.puckController.clearRoute();

    // Clear route from map
    this.map.getSource('nav-route').setData({ type: 'FeatureCollection', features: [] });
  }

  /**
   * Get current navigation state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Get current instruction
   */
  getCurrentInstruction() {
    if (!this.state.currentRoute) return null;
    const steps = this.state.currentRoute.legs[0].steps;
    return steps[this.state.currentStep];
  }

  /**
   * Get debug statistics (combines navigation and puck controller stats)
   * Returns both API call counts and local processing stats
   */
  getDebugStats() {
    const puckStats = this.puckController.getDebugStats();
    return {
      // API Call Statistics (actual network requests)
      api: {
        directions: this.directionsApiCount,      // Directions API calls (routing/rerouting)
        mapMatching: puckStats.mapMatchingApiCount // Map Matching API calls (free-drive mode)
      },
      // Processing Statistics (local operations)
      processing: {
        routeSnaps: puckStats.routeSnapCount       // Route geometry snapping (no API call)
      }
    };
  }

  /**
   * Reset debug counters
   */
  resetDebugStats() {
    this.directionsApiCount = 0;
    this.puckController.resetDebugStats();
  }

  /**
   * Emit event to callback
   */
  _emit(eventName, data) {
    if (this.callbacks[eventName]) {
      this.callbacks[eventName](data);
    }
  }
}
