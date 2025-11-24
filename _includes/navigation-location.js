/**
 * GL JS Location Puck Controller
 * Handles GPS smoothing, map matching, prediction, and smooth puck animation
 * Ported from Mapbox Navigation SDK for Android
 *
 * RESPONSIBILITY BOUNDARIES:
 * ========================
 * This class handles:
 * - GPS validation and outlier detection
 * - Location prediction (compensating for GPS latency)
 * - Map matching via Mapbox Map Matching API (free-drive mode)
 * - Route snapping (navigation mode) - local, no API calls
 * - Velocity smoothing and bearing calculation
 * - Smooth puck animation with constant velocity interpolation
 * - Puck marker creation and management
 *
 * This class DOES NOT handle:
 * - Navigation state (current step, instructions, arrival) → TurnByTurnNavigation
 * - Off-route detection → TurnByTurnNavigation
 * - Rerouting logic → TurnByTurnNavigation
 * - Camera control → TurnByTurnNavigation
 * - Voice guidance → TurnByTurnNavigation
 *
 * INTEGRATION WITH NAVIGATION:
 * - Receives ALL raw GPS updates from TurnByTurnNavigation
 * - Validates, processes, and animates the puck
 * - Returns processed location (predicted + matched/snapped)
 * - Navigation uses processed location for display, raw GPS for routing logic
 */

class GLJSLocationPuckController {
    constructor(map, accessToken, options = {}) {
        this.map = map;
        this.accessToken = accessToken;

        // Configuration
        this.config = {
            animationDuration: options.animationDuration || 1000,
            mapMatchingRadius: options.mapMatchingRadius || 50, // meters
            minSpeedThreshold: options.minSpeedThreshold || 0.5, // m/s (for stationary detection)
            simulationMode: options.simulationMode || false,
            navigationProfile: options.navigationProfile || 'driving', // 'walking', 'cycling', 'driving'
        };

        // Apply profile-specific adjustments
        this._applyProfileSettings();

        // State
        this.lastLocation = null;
        this.lastRawLocation = null;
        this.lastAnimatedLocation = null; // Track last position we animated to
        this.currentRoute = null;
        this.currentAnimation = null;
        this.lastBearing = null; // Track last bearing for fallback

        // Debug counters
        this.mapMatchingApiCount = 0;

        // Puck marker
        this.puckMarker = null;
        this.initializePuck();

        // Debug: Map matched coordinates trail
        this.debugMatchedCoordinates = [];
        this.debugRawGPSCoordinates = []; // Raw GPS coordinates
        this.initializeDebugLayer();

        // Map Matching filtering
        this.lastMapMatchedLocation = null; // Track last position sent to Map Matching API
        this.lastRawGPSForMatching = null; // Track last raw GPS position for distance comparison
        this.minMapMatchDistance = 1; // Only call Map Matching if moved > 1 meter
    }

    /**
     * Apply profile-specific settings
     * Adjusts stationary speed threshold for different travel modes
     */
    _applyProfileSettings() {
        const profile = this.config.navigationProfile.toLowerCase();

        if (profile.includes('walking')) {
            this.config.minSpeedThreshold = 1.5; // 0-1.5 m/s stationary (up to 5.4 km/h)
            console.log('🚶 Walking profile: minSpeedThreshold = 1.5 m/s');
        } else if (profile.includes('cycling')) {
            this.config.minSpeedThreshold = 1.0; // 0-1.0 m/s stationary (up to 3.6 km/h)
            console.log('🚴 Cycling profile: minSpeedThreshold = 1.0 m/s');
        } else {
            this.config.minSpeedThreshold = 0.5; // 0-0.5 m/s stationary (up to 1.8 km/h)
            console.log('🚗 Driving profile: minSpeedThreshold = 0.5 m/s');
        }
    }

    /**
     * Initialize the puck marker on the map
     */
    initializePuck() {
        const el = document.createElement('div');
        el.className = 'location-puck';
        el.style.width = '40px';
        el.style.height = '40px';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';

        // Create SVG arrow that points upward (will rotate with bearing)
        el.innerHTML = `
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <!-- Outer glow/shadow -->
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>

                <!-- White border -->
                <circle cx="20" cy="20" r="12" fill="white"/>

                <!-- Blue circle background -->
                <circle cx="20" cy="20" r="10" fill="#4285F4"/>

                <!-- Directional triangle with dented back (points upward) -->
                <path d="M 20 10 L 26 22 L 20 18 L 14 22 Z"
                      fill="white"
                      stroke="none"/>
            </svg>
        `;

        this.puckMarker = new mapboxgl.Marker({
            element: el,
            rotationAlignment: 'map',
            pitchAlignment: 'map'
        })
            .setLngLat([0, 0])
            .addTo(this.map);
    }

    /**
     * Initialize debug layer for visualizing map-matched coordinates
     */
    initializeDebugLayer() {
        // Wait for map to load before adding source/layer
        const addDebugLayer = () => {
            if (!this.map.getSource('debug-matched-coords')) {
                this.map.addSource('debug-matched-coords', {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: []
                    }
                });

                this.map.addLayer({
                    id: 'debug-matched-coords-layer',
                    type: 'circle',
                    source: 'debug-matched-coords',
                    paint: {
                        'circle-radius': 6,
                        'circle-color': '#FF0000',
                        'circle-opacity': 0.7,
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#FFFFFF'
                    }
                });

                console.log('🔴 Debug layer initialized for map-matched coordinates');
            }

            // Add blue circle layer for raw GPS coordinates
            if (!this.map.getSource('debug-raw-gps-coords')) {
                this.map.addSource('debug-raw-gps-coords', {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: []
                    }
                });

                this.map.addLayer({
                    id: 'debug-raw-gps-coords-layer',
                    type: 'circle',
                    source: 'debug-raw-gps-coords',
                    paint: {
                        'circle-radius': 4,
                        'circle-color': '#0000FF',
                        'circle-opacity': 0.6,
                        'circle-stroke-width': 1,
                        'circle-stroke-color': '#FFFFFF'
                    }
                });

                console.log('🔵 Debug layer initialized for raw GPS coordinates');
            }
        };

        if (this.map.loaded()) {
            addDebugLayer();
        } else {
            this.map.on('load', addDebugLayer);
        }
    }

    /**
     * Add a map-matched coordinate to the debug visualization layer
     */
    addDebugMatchedCoordinate(lng, lat) {
        this.debugMatchedCoordinates.push([lng, lat]);

        // Update the source with all matched coordinates
        const source = this.map.getSource('debug-matched-coords');
        if (source) {
            const features = this.debugMatchedCoordinates.map(coord => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: coord
                },
                properties: {}
            }));

            source.setData({
                type: 'FeatureCollection',
                features: features
            });

            console.log(`🔴 Added debug circle at [${lng.toFixed(6)}, ${lat.toFixed(6)}] (total: ${this.debugMatchedCoordinates.length})`);
        }
    }

    /**
     * Add a raw GPS coordinate to the debug visualization layer
     */
    addDebugRawGPSCoordinate(lng, lat) {
        this.debugRawGPSCoordinates.push([lng, lat]);

        // Update the source with all raw GPS coordinates
        const source = this.map.getSource('debug-raw-gps-coords');
        if (source) {
            const features = this.debugRawGPSCoordinates.map(coord => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: coord
                },
                properties: {}
            }));

            source.setData({
                type: 'FeatureCollection',
                features: features
            });

            console.log(`🔵 Added raw GPS circle at [${lng.toFixed(6)}, ${lat.toFixed(6)}] (total: ${this.debugRawGPSCoordinates.length})`);
        }
    }

    /**
     * Main entry point: Update location with new GPS reading
     */
    async updateLocation(rawGPS) {
        console.log('🎯 Puck updateLocation called:', rawGPS.lat, rawGPS.lng, 'simMode:', this.config.simulationMode);
        try {
            // Validate and filter outliers
            if (!this.isValidGPSUpdate(rawGPS)) {
                console.warn('❌ Invalid GPS update, skipping');
                return;
            }

            console.log('✅ GPS validation passed');

            // TESTING: Raw GPS + Map Matching ONLY (no smoothing, no prediction)
            console.log('🧪 TEST MODE: Raw GPS + Map Matching only');

            let processedLocation;
            let keyPoints = [];

            // Use raw GPS directly (no smoothing, no prediction)
            const rawLocation = {
                lat: rawGPS.lat,
                lng: rawGPS.lng,
                bearing: rawGPS.bearing,
                speed: rawGPS.speed,
                accuracy: rawGPS.accuracy
            };
            console.log('📍 Raw GPS:', rawLocation.lat, rawLocation.lng, 'accuracy:', rawGPS.accuracy);

            // Debug: Add raw GPS coordinate to blue circle layer
            this.addDebugRawGPSCoordinate(rawLocation.lng, rawLocation.lat);

            // Apply Map Matching API with distance-based filtering
            //const isStationary = rawGPS.speed !== null && rawGPS.speed < this.config.minSpeedThreshold;
            const isStationary = false; // DISABLE STATIONARY CHECK FOR TESTING

            // Check if we've moved enough distance since last Map Matching call
            // Compare against last RAW GPS position, not matched position
            let distanceSinceLastMatch = Infinity;
            if (this.lastRawGPSForMatching) {
                distanceSinceLastMatch = this.haversineDistance(
                    this.lastRawGPSForMatching.lat,
                    this.lastRawGPSForMatching.lng,
                    rawLocation.lat,
                    rawLocation.lng
                );
            }

            const shouldCallMapMatching = distanceSinceLastMatch >= this.minMapMatchDistance;

            if (isStationary) {
                console.log('🛑 Stationary - using raw GPS without snapping');
                processedLocation = rawLocation;
            } else if (!shouldCallMapMatching && this.lastMapMatchedLocation) {
                console.log(`⏭️ Skipping Map Matching - only moved ${distanceSinceLastMatch.toFixed(1)}m (threshold: ${this.minMapMatchDistance}m)`);
                // Use last matched position with updated bearing from raw GPS
                processedLocation = {
                    ...this.lastMapMatchedLocation,
                    bearing: rawLocation.bearing,
                    speed: rawLocation.speed
                };
            } else {
                console.log(`🛣️ Calling Map Matching API (moved ${distanceSinceLastMatch.toFixed(1)}m)`);
                // Call Map Matching API
                processedLocation = await this.mapMatchLocation(rawLocation);

                // Update last matched location
                this.lastMapMatchedLocation = {
                    lat: processedLocation.lat,
                    lng: processedLocation.lng
                };

                // Update last raw GPS position used for matching
                this.lastRawGPSForMatching = {
                    lat: rawLocation.lat,
                    lng: rawLocation.lng
                };

                console.log('📌 Snapped to road:', processedLocation.lat, processedLocation.lng);
            }

            // 4. Calculate bearing from actual puck movement (not road geometry)
            if (this.lastAnimatedLocation) {
                const distance = this.haversineDistance(
                    this.lastAnimatedLocation.lat,
                    this.lastAnimatedLocation.lng,
                    processedLocation.lat,
                    processedLocation.lng
                );

                // Only calculate bearing if moved enough (avoid noise from tiny movements)
                if (distance >= 2) {  // 2 meters threshold
                    const movementBearing = this.calculateBearing(
                        this.lastAnimatedLocation.lat,
                        this.lastAnimatedLocation.lng,
                        processedLocation.lat,
                        processedLocation.lng
                    );
                    processedLocation.bearing = movementBearing;
                    this.lastBearing = movementBearing;
                    console.log(`🧭 Movement-based bearing: ${movementBearing.toFixed(1)}° (moved ${distance.toFixed(1)}m)`);
                } else {
                    // Too small to calculate meaningful bearing - use previous
                    processedLocation.bearing = this.lastBearing || processedLocation.bearing;
                    console.log(`🧭 Keeping previous bearing (only moved ${distance.toFixed(1)}m)`);
                }
            } else {
                // First location - use GPS bearing or matched bearing
                this.lastBearing = processedLocation.bearing;
                console.log(`🧭 First location - using initial bearing: ${processedLocation.bearing?.toFixed(1)}°`);
            }

            // Safety check before animation
            if (processedLocation &&
                !isNaN(processedLocation.lat) &&
                !isNaN(processedLocation.lng)) {
                this.animatePuckToLocation(processedLocation, keyPoints);
                this.lastAnimatedLocation = processedLocation;
            } else {
                console.error('❌ Cannot animate - invalid processedLocation:', processedLocation);
            }

            // Update state (always update, even if we didn't animate)
            this.lastLocation = processedLocation;
            this.lastRawLocation = rawGPS;

        } catch (error) {
            console.error('Error updating location:', error);
            // Fallback: just move to raw GPS without animation
            if (rawGPS.lng && rawGPS.lat) {
                this.puckMarker.setLngLat([rawGPS.lng, rawGPS.lat]);
            }
        }
    }

    /**
     * Validate GPS update and detect outliers
     */
    isValidGPSUpdate(gps) {
        if (!gps || !gps.lng || !gps.lat) return false;
        if (Math.abs(gps.lat) > 90 || Math.abs(gps.lng) > 180) return false;

        if (this.lastRawLocation) {
            const distance = this.haversineDistance(
                this.lastRawLocation.lat, this.lastRawLocation.lng,
                gps.lat, gps.lng
            );

            const timeDelta = (gps.timestamp - this.lastRawLocation.timestamp) /
                1000; // seconds

            // Check for impossible speed (e.g., > 200 m/s = 720 km/h)
            if (timeDelta > 0 && distance / timeDelta > 200) {
                return false;
            }
        }

        return true;
    }

    /**
     * Map match location using Mapbox Map Matching API
     * Always snaps to nearest road via API
     */
    async mapMatchLocation(location) {
        // Use Map Matching API to snap to nearest road
        // Build a mini trajectory: [previous, current]
        const coordinates = [];

        if (this.lastLocation) {
            coordinates.push([this.lastLocation.lng, this.lastLocation.lat]);
        }

        coordinates.push([location.lng, location.lat]);

        // REMOVED: Forward projection was causing API to match to wrong roads
        // when bearing jittered. Now just using [lastLocation, currentLocation]

        // Need at least 2 points for matching API
        if (coordinates.length < 2) {
            return location; // Return raw location if we can't match
        }

        try {
            this.mapMatchingApiCount++;
            const coordinatesStr = coordinates.map(c => c.join(',')).join(';');

            const url =
                `https://api.mapbox.com/matching/v5/${this.config.navigationProfile}/${coordinatesStr}` +
                `?geometries=geojson` +
                `&radiuses=${Array(coordinates.length).fill(this.config.mapMatchingRadius).join(';')}` +
                `&steps=false` +
                `&overview=full` +
                `&access_token=${this.accessToken}`;

            console.log('🗺️ Map Matching API request:', url);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Map matching failed: ${response.status}`);
            }

            const data = await response.json();
            console.log('🗺️ Map Matching API response:', data);

            if (!data.matchings || data.matchings.length === 0) {
                return location; // No match found, return original
            }

            // Get the matched geometry
            const matched = data.matchings[0];
            const matchedCoords = matched.geometry.coordinates;

            // Find the point on matched geometry closest to our predicted location
            const snappedPoint = this.findClosestPointOnLine(
                matchedCoords,
                [location.lng, location.lat]
            );

            console.log('📌 Matched point:', snappedPoint);

            // Debug: Add matched coordinate to debug layer
            this.addDebugMatchedCoordinate(snappedPoint.lng, snappedPoint.lat);

            // Calculate bearing from matched geometry
            const matchedBearing = this.calculateBearingFromGeometry(
                matchedCoords,
                snappedPoint.index
            );

            return {
                lat: snappedPoint.lat,
                lng: snappedPoint.lng,
                bearing: matchedBearing !== null ? matchedBearing :
                    location.bearing,
                speed: location.speed,
                accuracy: location.accuracy,
                isMatched: true,
                confidence: matched.confidence,
                matchedGeometry: matchedCoords
            };

        } catch (error) {
            console.warn('Map matching failed, using raw location:', error);
            return location;
        }
    }

    /**
     * Animate puck to target location using constant velocity interpolation
     */
    animatePuckToLocation(targetLocation, keyPoints) {
        console.log('🎭 animatePuckToLocation called');
        console.log('   From:', this.lastLocation ? `${this.lastLocation.lat}, ${this.lastLocation.lng}` : 'null');
        console.log('   To:', `${targetLocation.lat}, ${targetLocation.lng}`);
        console.log('   Keypoints:', keyPoints.length);
        console.log('   Current puck position:', this.puckMarker.getLngLat());

        // Cancel any existing animation
        if (this.currentAnimation) {
            console.log('   Cancelling existing animation');
            cancelAnimationFrame(this.currentAnimation);
        }

        // Handle first location - just set position directly without animation
        if (!this.lastLocation) {
            console.log('   First location - setting puck directly without animation');
            this.puckMarker.setLngLat([targetLocation.lng, targetLocation.lat]);
            if (targetLocation.bearing !== undefined) {
                this.puckMarker.setRotation(targetLocation.bearing);
            }
            return;
        }

        const startLocation = this.lastLocation;

        // Check if we're already at the target (no movement)
        const distance = this.haversineDistance(
            startLocation.lat,
            startLocation.lng,
            targetLocation.lat,
            targetLocation.lng
        );

        if (distance < 0.1) {  // Less than 10cm - no meaningful movement
            console.log(`   No movement detected (${distance.toFixed(2)}m) - skipping animation`);
            // Just update bearing if it changed
            if (targetLocation.bearing !== undefined) {
                this.puckMarker.setRotation(targetLocation.bearing);
            }
            return;
        }
        const startTime = performance.now();
        const duration = this.config.animationDuration;

        // Build full path: start -> keyPoints -> end
        const fullPath = [
            startLocation,
            ...keyPoints,
            targetLocation
        ];

        // Calculate constant velocity timing
        const interpolator = new ConstantVelocityInterpolator(fullPath);

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const fraction = Math.min(elapsed / duration, 1);

            // Get timing-adjusted fraction from interpolator
            const adjustedFraction = interpolator.getInterpolation(fraction);

            // Interpolate position and bearing
            const current = this.interpolateAlongPath(fullPath,
                adjustedFraction);

            // Update puck (with safety check)
            if (current && current.lng !== undefined && current.lat !== undefined &&
                !isNaN(current.lng) && !isNaN(current.lat)) {
                this.puckMarker.setLngLat([current.lng, current.lat]);

                if (current.bearing !== undefined) {
                    this.puckMarker.setRotation(current.bearing);
                }

                // Log every 10 frames to avoid spam
                if (Math.floor(fraction * 100) % 10 === 0) {
                    console.log(`   🎬 Animation ${Math.floor(fraction * 100)}%: ${current.lat.toFixed(6)}, ${current.lng.toFixed(6)}`);
                }
            } else {
                console.error('   ❌ Invalid interpolation result:', current);
            }

            // Continue animation
            if (fraction < 1) {
                this.currentAnimation = requestAnimationFrame(animate);
            } else {
                this.currentAnimation = null;
            }
        };

        this.currentAnimation = requestAnimationFrame(animate);
    }

    /**
     * Set active route for route-based predictions
     */
    setRoute(route) {
        this.currentRoute = route;
        // Clear debug layers for new navigation session
        this.clearDebugLayers();
    }

    /**
     * Clear active route
     */
    clearRoute() {
        this.currentRoute = null;
    }

    /**
     * Clear debug visualization layers (for new navigation session)
     */
    clearDebugLayers() {
        // Clear arrays
        this.debugMatchedCoordinates = [];
        this.debugRawGPSCoordinates = [];

        // Clear map layers
        const matchedSource = this.map.getSource('debug-matched-coords');
        if (matchedSource) {
            matchedSource.setData({
                type: 'FeatureCollection',
                features: []
            });
        }

        const rawGPSSource = this.map.getSource('debug-raw-gps-coords');
        if (rawGPSSource) {
            rawGPSSource.setData({
                type: 'FeatureCollection',
                features: []
            });
        }

        console.log('🧹 Debug layers cleared');
    }

    /**
     * Get debug statistics
     */
    getDebugStats() {
        return {
            mapMatchingApiCount: this.mapMatchingApiCount
        };
    }

    /**
     * Reset debug counters
     */
    resetDebugStats() {
        this.mapMatchingApiCount = 0;
    }

    // ==================== GEOMETRY UTILITY FUNCTIONS ====================

    /**
     * Calculate haversine distance between two points
     */
    haversineDistance(lat1, lng1, lat2, lng2) {
        const R = 6371000; // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lng2 - lng1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    /**
     * Project a point forward by distance and bearing
     */
    projectPoint(lat, lng, distanceMeters, bearingDegrees) {
        const R = 6371000; // Earth radius in meters
        const δ = distanceMeters / R;
        const θ = bearingDegrees * Math.PI / 180;

        const φ1 = lat * Math.PI / 180;
        const λ1 = lng * Math.PI / 180;

        const φ2 = Math.asin(
            Math.sin(φ1) * Math.cos(δ) +
            Math.cos(φ1) * Math.sin(δ) * Math.cos(θ)
        );

        const λ2 = λ1 + Math.atan2(
            Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
            Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
        );

        return {
            lat: φ2 * 180 / Math.PI,
            lng: λ2 * 180 / Math.PI
        };
    }

    /**
     * Calculate bearing between two points
     */
    calculateBearing(lat1, lng1, lat2, lng2) {
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δλ = (lng2 - lng1) * Math.PI / 180;

        const y = Math.sin(Δλ) * Math.cos(φ2);
        const x = Math.cos(φ1) * Math.sin(φ2) -
            Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

        const θ = Math.atan2(y, x);

        return this.normalizeBearing(θ * 180 / Math.PI);
    }

    /**
     * Calculate bearing from geometry at a specific index
     */
    calculateBearingFromGeometry(coords, index) {
        if (coords.length < 2) return null;

        // Use next segment if available, otherwise previous
        const idx = Math.min(index, coords.length - 2);
        const [lng1, lat1] = coords[idx];
        const [lng2, lat2] = coords[idx + 1];

        return this.calculateBearing(lat1, lng1, lat2, lng2);
    }

    /**
     * Normalize bearing to 0-360 range
     */
    normalizeBearing(bearing) {
        bearing = bearing % 360;
        if (bearing < 0) bearing += 360;
        return bearing;
    }

    /**
     * Calculate shortest angular difference between two bearings
     */
    shortestAngleDifference(from, to) {
        let diff = to - from;

        // Normalize to -180 to 180
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;

        return diff;
    }

    /**
     * Find closest point on a line to a given point
     */
    findClosestPointOnLine(lineCoords, point) {
        // Use Turf's nearestPointOnLine for accurate results
        const line = turf.lineString(lineCoords);
        const pt = turf.point(point);
        const nearest = turf.nearestPointOnLine(line, pt, { units: 'meters' });

        // Find which segment the nearest point is on
        let closestIndex = 0;
        let minDist = Infinity;
        for (let i = 0; i < lineCoords.length; i++) {
            const segDist = turf.distance(
                turf.point(lineCoords[i]),
                nearest,
                { units: 'meters' }
            );
            if (segDist < minDist) {
                minDist = segDist;
                closestIndex = i;
            }
        }

        return {
            lng: nearest.geometry.coordinates[0],
            lat: nearest.geometry.coordinates[1],
            index: closestIndex,
            distance: nearest.properties.dist * 1000 // Convert km to meters
        };
    }

    /**
     * Calculate total distance of a polyline
     */
    calculatePolylineDistance(coords) {
        let total = 0;
        for (let i = 0; i < coords.length - 1; i++) {
            const [lng1, lat1] = coords[i];
            const [lng2, lat2] = coords[i + 1];
            total += this.haversineDistance(lat1, lng1, lat2, lng2);
        }
        return total;
    }

    /**
     * Interpolate along a path at a specific fraction (0-1)
     */
    interpolateAlongPath(path, fraction) {
        if (path.length === 0) return null;
        if (path.length === 1) return path[0];
        if (fraction <= 0) return path[0];
        if (fraction >= 1) return path[path.length - 1];

        // Calculate total distance
        const distances = [];
        let totalDistance = 0;

        for (let i = 0; i < path.length - 1; i++) {
            const dist = this.haversineDistance(
                path[i].lat, path[i].lng,
                path[i + 1].lat, path[i + 1].lng
            );
            distances.push(dist);
            totalDistance += dist;
        }

        // Find the segment at the target fraction
        const targetDistance = totalDistance * fraction;
        let accumulated = 0;

        for (let i = 0; i < distances.length; i++) {
            if (accumulated + distances[i] >= targetDistance) {
                // Interpolate within this segment
                const segmentFraction = (targetDistance - accumulated) /
                    distances[i];

                return {
                    lng: path[i].lng + (path[i + 1].lng - path[i].lng) *
                        segmentFraction,
                    lat: path[i].lat + (path[i + 1].lat - path[i].lat) *
                        segmentFraction,
                    bearing: path[i].bearing +
                        this.shortestAngleDifference(path[i].bearing || 0, path[i +
                            1].bearing || 0) * segmentFraction
                };
            }
            accumulated += distances[i];
        }

        return path[path.length - 1];
    }
}

/**
 * Constant Velocity Interpolator
 * Distributes animation time proportionally to distances between 
keyPoints
 * (Ported from Android SDK ConstantVelocityInterpolator.kt)
 */
class ConstantVelocityInterpolator {
    constructor(path) {
        this.path = path;
        this.timingPoints = this.calculateTimingPoints(path);
    }

    calculateTimingPoints(path) {
        if (path.length <= 1) {
            return [{ distance: 0, time: 0 }, { distance: 0, time: 1 }];
        }

        // Calculate distances between consecutive points
        const distances = [];
        let totalDistance = 0;

        for (let i = 0; i < path.length - 1; i++) {
            const dist = this.haversineDistance(
                path[i].lat, path[i].lng,
                path[i + 1].lat, path[i + 1].lng
            );

            if (dist > 0) {
                distances.push(dist);
                totalDistance += dist;
            }
        }

        if (totalDistance === 0) {
            return [{ distance: 0, time: 0 }, { distance: 0, time: 1 }];
        }

        // Build timing points (distance -> time mapping)
        const points = [{ distance: 0, time: 0 }];
        let accumulatedDistance = 0;

        for (let i = 0; i < distances.length; i++) {
            accumulatedDistance += distances[i];
            const timeFraction = accumulatedDistance / totalDistance;
            points.push({ distance: accumulatedDistance, time: timeFraction });
        }

        return points;
    }

    /**
     * Get interpolated time for a given input fraction
     * This creates constant velocity animation by mapping input time to 
  distance
     */
    getInterpolation(inputFraction) {
        if (inputFraction <= 0) return 0;
        if (inputFraction >= 1) return 1;

        // Input fraction represents time
        // We need to find the corresponding output fraction based on distance traveled
        // Since we want constant velocity, output should be proportional to distance
        // The timing points already map distance to time correctly
        // For constant velocity: output = input (linear)
        // But we distribute based on actual distances between points

        for (let i = 0; i < this.timingPoints.length - 1; i++) {
            const p1 = this.timingPoints[i];
            const p2 = this.timingPoints[i + 1];

            if (inputFraction >= p1.time && inputFraction <= p2.time) {
                // Linear interpolation within this segment
                const segmentFraction = (inputFraction - p1.time) / (p2.time -
                    p1.time);
                return p1.time + (p2.time - p1.time) * segmentFraction;
            }
        }

        return inputFraction;
    }

    haversineDistance(lat1, lng1, lat2, lng2) {
        const R = 6371000;
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lng2 - lng1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }
}

// ==================== USAGE EXAMPLE ====================

/*
// Initialize
const puckController = new GLJSLocationPuckController(map, 
'YOUR_MAPBOX_TOKEN', {
  predictionMillis: 1000,
  animationDuration: 1000,
  numKeyPoints: 5,
  mapMatchingRadius: 50,
  maxTurnRatePerSecond: 90,
  velocitySmoothingFactor: 0.3
});

// Update with GPS data
navigator.geolocation.watchPosition(
  (position) => {
    puckController.updateLocation({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      bearing: position.coords.heading,
      speed: position.coords.speed,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp
    });
  },
  (error) => console.error('GPS error:', error),
  {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 5000
  }
);

// Optional: Set route for route-based predictions
puckController.setRoute(routeGeometry);

// Optional: Clear route
puckController.clearRoute();
*/