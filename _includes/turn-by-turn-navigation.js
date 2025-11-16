/**
 * Turn-by-Turn Navigation Manager
 * Provides Navigation SDK-like features using Mapbox GL JS + Directions API
 */

class TurnByTurnNavigation {
  constructor(map, options = {}) {
    this.map = map;
    this.accessToken = options.accessToken || mapboxgl.accessToken;

    // Configuration
    this.config = {
      offRouteThreshold: options.offRouteThreshold || 25, // meters
      advanceInstructionDistance: options.advanceInstructionDistance || 50, // meters
      rerouteDelay: options.rerouteDelay || 3000, // ms
      voiceEnabled: options.voiceEnabled !== false,
      cameraFollowEnabled: options.cameraFollowEnabled !== false,
      profile: options.profile || 'mapbox/driving-traffic', // driving, walking, cycling
      cameraPitch: options.cameraPitch || 60,
      cameraZoom: options.cameraZoom || 17,
    };

    // State
    this.state = {
      isNavigating: false,
      currentRoute: null,
      currentStep: 0,
      userLocation: null,
      snappedLocation: null,
      distanceToNextStep: null,
      distanceRemaining: null,
      durationRemaining: null,
      isOffRoute: false,
      lastRerouteTime: 0,
      bearing: 0,
    };

    // Geolocation
    this.watchId = null;
    this.locationAccuracy = null;

    // Voice synthesis
    this.synth = window.speechSynthesis;
    this.lastSpokenInstruction = null;

    // Event callbacks
    this.callbacks = {
      onRouteUpdate: options.onRouteUpdate || null,
      onProgressUpdate: options.onProgressUpdate || null,
      onInstructionAdvance: options.onInstructionAdvance || null,
      onOffRoute: options.onOffRoute || null,
      onArrival: options.onArrival || null,
      onError: options.onError || null,
    };

    this._initializeLayers();
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

    if (!this.map.getSource('nav-user')) {
      this.map.addSource('nav-user', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });

      this.map.addLayer({
        id: 'nav-user-circle',
        type: 'circle',
        source: 'nav-user',
        paint: {
          'circle-radius': 10,
          'circle-color': '#4264fb',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 3
        }
      });
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

      // Display route
      this._displayRoute(route);

      // Start location tracking
      this._startLocationTracking();

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
      geometries: 'geojson',
      steps: 'true',
      banner_instructions: 'true',
      voice_instructions: 'true',
      alternatives: 'false'
    });

    const response = await fetch(`${url}?${params}`);
    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }

    return data.routes[0];
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
   * Handle location updates
   */
  _handleLocationUpdate(position) {
    if (!this.state.isNavigating || !this.state.currentRoute) return;

    const userLocation = {
      lng: position.coords.longitude,
      lat: position.coords.latitude
    };

    this.state.userLocation = userLocation;
    this.locationAccuracy = position.coords.accuracy;

    // Calculate bearing from heading or previous position
    if (position.coords.heading !== null && position.coords.heading >= 0) {
      this.state.bearing = position.coords.heading;
    }

    // Update user location on map
    this._updateUserLocationMarker(userLocation);

    // Snap to route
    const snapped = this._snapToRoute(userLocation);
    this.state.snappedLocation = snapped;

    // Check if off route
    const isOffRoute = snapped.distance > this.config.offRouteThreshold;

    if (isOffRoute && !this.state.isOffRoute) {
      this._handleOffRoute();
    }

    this.state.isOffRoute = isOffRoute;

    // Calculate progress
    this._calculateProgress(snapped);

    // Check if should advance to next instruction
    this._checkInstructionAdvancement();

    // Update camera
    if (this.config.cameraFollowEnabled) {
      this._updateCamera(userLocation);
    }

    // Emit progress update
    this._emit('onProgressUpdate', {
      location: userLocation,
      snappedLocation: snapped,
      currentStep: this.state.currentStep,
      distanceToNextStep: this.state.distanceToNextStep,
      distanceRemaining: this.state.distanceRemaining,
      durationRemaining: this.state.durationRemaining,
      isOffRoute: this.state.isOffRoute
    });
  }

  /**
   * Snap user location to route
   */
  _snapToRoute(userLocation) {
    const route = this.state.currentRoute;
    const coordinates = route.geometry.coordinates;

    let minDistance = Infinity;
    let closestPoint = null;
    let segmentIndex = 0;

    // Find closest point on route
    for (let i = 0; i < coordinates.length - 1; i++) {
      const start = coordinates[i];
      const end = coordinates[i + 1];

      const snapped = this._snapToSegment(userLocation, start, end);
      const distance = turf.distance(
        turf.point([userLocation.lng, userLocation.lat]),
        turf.point([snapped.lng, snapped.lat]),
        { units: 'meters' }
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = snapped;
        segmentIndex = i;
      }
    }

    return {
      lng: closestPoint.lng,
      lat: closestPoint.lat,
      distance: minDistance,
      segmentIndex: segmentIndex
    };
  }

  /**
   * Snap point to line segment
   */
  _snapToSegment(point, start, end) {
    const line = turf.lineString([start, end]);
    const pt = turf.point([point.lng, point.lat]);
    const snapped = turf.nearestPointOnLine(line, pt);

    return {
      lng: snapped.geometry.coordinates[0],
      lat: snapped.geometry.coordinates[1]
    };
  }

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
    this.stopNavigation();
  }

  /**
   * Update user location marker on map
   */
  _updateUserLocationMarker(location) {
    const geojson = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      }
    };

    this.map.getSource('nav-user').setData(geojson);
  }

  /**
   * Update camera to follow user
   */
  _updateCamera(location) {
    this.map.easeTo({
      center: [location.lng, location.lat],
      zoom: this.config.cameraZoom,
      pitch: this.config.cameraPitch,
      bearing: this.state.bearing,
      duration: 1000,
      essential: true
    });
  }

  /**
   * Speak navigation instruction
   */
  _speakInstruction(text) {
    if (!this.config.voiceEnabled || !this.synth) return;

    // Prevent repeating same instruction
    if (text === this.lastSpokenInstruction) return;
    this.lastSpokenInstruction = text;

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    this.synth.speak(utterance);
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

    // Clear route from map
    this.map.getSource('nav-route').setData({ type: 'FeatureCollection', features: [] });
    this.map.getSource('nav-user').setData({ type: 'FeatureCollection', features: [] });
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
   * Emit event to callback
   */
  _emit(eventName, data) {
    if (this.callbacks[eventName]) {
      this.callbacks[eventName](data);
    }
  }
}
