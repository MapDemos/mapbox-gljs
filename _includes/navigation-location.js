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
            predictionMillis: options.predictionMillis || 1000,
            animationDuration: options.animationDuration || 1000,
            numKeyPoints: options.numKeyPoints || 5,
            mapMatchingRadius: options.mapMatchingRadius || 50, // meters
            maxTurnRatePerSecond: options.maxTurnRatePerSecond || 90, // degrees/ sec
            velocitySmoothingFactor: options.velocitySmoothingFactor || 0.3,
            minSpeedThreshold: options.minSpeedThreshold || 0.5, // m/s
            maxAcceleration: options.maxAcceleration || 4, // m/s²
            simulationMode: options.simulationMode || false, // Skip prediction/snapping for simulation
        };

        // State
        this.lastLocation = null;
        this.lastRawLocation = null;
        this.currentRoute = null;
        this.smoothedVelocity = 0;
        this.currentAnimation = null;

        // Debug counters
        this.mapMatchingApiCount = 0;
        this.routeSnapCount = 0;

        // Puck marker
        this.puckMarker = null;
        this.initializePuck();
    }

    /**
     * Initialize the puck marker on the map
     */
    initializePuck() {
        const el = document.createElement('div');
        el.className = 'location-puck';
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#4285F4';
        el.style.border = '3px solid white';
        el.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';

        this.puckMarker = new mapboxgl.Marker({
            element: el,
            rotationAlignment: 'map'
        })
            .setLngLat([0, 0])
            .addTo(this.map);
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

            // Smooth velocity to handle GPS jitter
            this.smoothVelocity(rawGPS);

            let processedLocation;
            let keyPoints = [];

            if (this.config.simulationMode) {
                console.log('🎬 Using simulation mode path');
                // Simulation mode: Skip prediction and snapping
                // Coordinates are already accurate and on the route
                processedLocation = {
                    lat: rawGPS.lat,
                    lng: rawGPS.lng,
                    bearing: rawGPS.bearing,
                    speed: rawGPS.speed,
                    accuracy: rawGPS.accuracy,
                    isMatched: false
                };

                // Generate simple keypoints along route if available
                if (this.lastLocation && this.currentRoute && this.currentRoute.coordinates) {
                    keyPoints = this.generateKeyPointsFromRouteSegment(
                        this.lastLocation,
                        processedLocation
                    );
                }
            } else {
                console.log('🌍 Using real GPS mode path');
                // Real GPS mode: Use full prediction and snapping pipeline
                // 1. Predict forward to compensate for latency
                const predicted = this.predictLocation(rawGPS,
                    this.config.predictionMillis);
                console.log('📍 Predicted location:', predicted.lat, predicted.lng);

                // 2. Map match to snap to road network
                // Strategy:
                // - Stationary: Use raw GPS (no snapping to avoid stuck puck)
                // - Close to route (<50m): Snap to route geometry
                // - Far from route (>50m): Use Map Matching API to snap to nearest road
                let snapped;
                const isStationary = rawGPS.speed !== null && rawGPS.speed < this.config.minSpeedThreshold;

                if (isStationary) {
                    console.log('🛑 Stationary - using predicted location without snapping');
                    snapped = predicted;
                } else {
                    // Check distance from route (if we have one)
                    let distanceFromRoute = Infinity;
                    if (this.currentRoute && this.currentRoute.coordinates) {
                        // Find nearest point on route to check distance
                        const nearestPoint = this.findClosestPointOnLine(
                            this.currentRoute.coordinates,
                            [predicted.lng, predicted.lat]
                        );
                        distanceFromRoute = nearestPoint.distance;
                        console.log(`📏 Distance from route: ${distanceFromRoute.toFixed(1)}m`);
                    }

                    const isCloseToRoute = distanceFromRoute <= 50; // Within 50m of route

                    if (isCloseToRoute) {
                        console.log('✅ Close to route - snapping to route geometry');
                        // Snap to route (calls mapMatchLocation which handles route snapping)
                        snapped = await this.mapMatchLocation(predicted);
                        console.log('📌 Snapped to route:', snapped.lat, snapped.lng);
                    } else {
                        console.log(`🚫 Far from route (${distanceFromRoute.toFixed(0)}m) - using Map Matching API for road snapping`);
                        // Clear route temporarily so mapMatchLocation uses API instead of route snapping
                        const tempRoute = this.currentRoute;
                        this.currentRoute = null;
                        snapped = await this.mapMatchLocation(predicted);
                        this.currentRoute = tempRoute;
                        console.log('📌 Snapped to road:', snapped.lat, snapped.lng, 'matched:', snapped.isMatched);
                    }
                }

                // 3. Generate interpolation keyPoints
                keyPoints = this.lastLocation
                    ? this.generateKeyPoints(this.lastLocation, snapped)
                    : [];
                console.log('🔑 Generated', keyPoints.length, 'keypoints');

                processedLocation = snapped;
            }

            // 4. Animate puck smoothly
            console.log('🎬 Animating puck to:', processedLocation.lat, processedLocation.lng);
            this.animatePuckToLocation(processedLocation, keyPoints);

            // Update state
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
     * Smooth velocity using exponential moving average
     */
    smoothVelocity(gps) {
        if (!gps.speed) {
            this.smoothedVelocity = 0;
            return;
        }

        const alpha = this.config.velocitySmoothingFactor;
        this.smoothedVelocity = alpha * gps.speed + (1 - alpha) *
            this.smoothedVelocity;
    }

    /**
     * Predict location forward by specified milliseconds
     * Uses bearing and velocity with physical constraints
     */
    predictLocation(location, predictionMillis) {
        const predicted = { ...location };

        // If stationary or no motion data, no prediction needed
        if (!location.speed || location.speed < this.config.minSpeedThreshold) {
            return predicted;
        }

        const timeSeconds = predictionMillis / 1000;
        const speed = this.smoothedVelocity; // Use smoothed velocity

        // Calculate distance to travel
        let distance = speed * timeSeconds;

        // Apply acceleration constraint if we have previous data
        if (this.lastRawLocation && this.lastRawLocation.speed) {
            const acceleration = (speed - this.lastRawLocation.speed) /
                timeSeconds;
            if (Math.abs(acceleration) > this.config.maxAcceleration) {
                // Cap the acceleration
                const cappedSpeed = this.lastRawLocation.speed +
                    Math.sign(acceleration) * this.config.maxAcceleration *
                    timeSeconds;
                distance = cappedSpeed * timeSeconds;
            }
        }

        // Predict bearing (apply max turn rate constraint)
        let predictedBearing = location.bearing || 0;

        if (this.lastLocation && this.lastLocation.bearing !== undefined) {
            const bearingChange = this.shortestAngleDifference(
                this.lastLocation.bearing,
                location.bearing
            );

            const maxTurnInPrediction = this.config.maxTurnRatePerSecond *
                timeSeconds;

            if (Math.abs(bearingChange) > maxTurnInPrediction) {
                // Limit the turn rate
                predictedBearing = this.normalizeBearing(
                    this.lastLocation.bearing +
                    Math.sign(bearingChange) * maxTurnInPrediction
                );
            }
        }

        // Project position forward using predicted bearing and distance
        const projected = this.projectPoint(
            location.lat,
            location.lng,
            distance,
            predictedBearing
        );

        predicted.lat = projected.lat;
        predicted.lng = projected.lng;
        predicted.bearing = predictedBearing;
        predicted.isPredicted = true;

        return predicted;
    }

    /**
     * Map match location using Mapbox Map Matching API
     * If a route is set (navigation mode), snap to route geometry instead
     */
    async mapMatchLocation(location) {
        // If we have an active route, snap to it directly (navigation mode)
        if (this.currentRoute && this.currentRoute.coordinates) {
            this.routeSnapCount++;
            const routeCoords = this.currentRoute.coordinates;

            // Find the point on route geometry closest to the predicted location
            const snappedPoint = this.findClosestPointOnLine(
                routeCoords,
                [location.lng, location.lat]
            );

            // Calculate bearing from route geometry
            const routeBearing = this.calculateBearingFromGeometry(
                routeCoords,
                snappedPoint.index
            );

            return {
                lat: snappedPoint.lat,
                lng: snappedPoint.lng,
                bearing: routeBearing !== null ? routeBearing : location.bearing,
                speed: location.speed,
                accuracy: location.accuracy,
                isMatched: true,
                confidence: 1.0,
                matchedGeometry: routeCoords
            };
        }

        // Free-driving mode: use Map Matching API
        // Build a mini trajectory: [previous, current, predicted]
        const coordinates = [];

        if (this.lastLocation) {
            coordinates.push([this.lastLocation.lng, this.lastLocation.lat]);
        }

        coordinates.push([location.lng, location.lat]);

        // Add a short forward projection for better matching
        if (location.bearing !== undefined && location.speed >
            this.config.minSpeedThreshold) {
            const ahead = this.projectPoint(
                location.lat, location.lng,
                20, // 20 meters ahead
                location.bearing
            );
            coordinates.push([ahead.lng, ahead.lat]);
        }

        // Need at least 2 points for matching API
        if (coordinates.length < 2) {
            return location; // Return raw location if we can't match
        }

        try {
            this.mapMatchingApiCount++;
            const coordinatesStr = coordinates.map(c => c.join(',')).join(';');
            const url =
                `https://api.mapbox.com/matching/v5/mapbox/driving/${coordinatesStr}` +
                `?geometries=geojson` +
                `&radiuses=${Array(coordinates.length).fill(this.config.mapMatchingRadius).join(';')}` +
                `&steps=false` +
                `&overview=full` +
                `&access_token=${this.accessToken}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Map matching failed: ${response.status}`);
            }

            const data = await response.json();

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
     * Generate keypoints from route segment (for simulation mode)
     * Extracts actual route coordinates between two points
     */
    generateKeyPointsFromRouteSegment(fromLocation, toLocation) {
        const routeCoords = this.currentRoute.coordinates;

        // Find indices on route
        const fromIndex = this.findClosestPointOnLine(
            routeCoords,
            [fromLocation.lng, fromLocation.lat]
        ).index;

        const toIndex = this.findClosestPointOnLine(
            routeCoords,
            [toLocation.lng, toLocation.lat]
        ).index;

        // Extract route points between indices
        const startIdx = Math.min(fromIndex, toIndex);
        const endIdx = Math.max(fromIndex, toIndex);

        if (endIdx - startIdx <= 1) {
            // No intermediate points, return empty
            return [];
        }

        // Return actual route coordinates as keypoints
        const keyPoints = [];
        for (let i = startIdx + 1; i < endIdx; i++) {
            const [lng, lat] = routeCoords[i];
            const bearing = this.calculateBearingFromGeometry(routeCoords, i);
            keyPoints.push({ lng, lat, bearing });
        }

        return keyPoints;
    }

    /**
     * Generate interpolation keyPoints between two locations
     * Strategy depends on whether we have route geometry
     */
    generateKeyPoints(fromLocation, toLocation) {
        // If we have matched geometry from the map matching, use it
        if (toLocation.isMatched && toLocation.matchedGeometry) {
            return this.generateKeyPointsFromGeometry(
                fromLocation,
                toLocation,
                toLocation.matchedGeometry
            );
        }

        // Otherwise, generate trajectory-based keyPoints
        return this.generateTrajectoryKeyPoints(fromLocation, toLocation);
    }

    /**
     * Generate keyPoints from matched road geometry
     */
    generateKeyPointsFromGeometry(fromLocation, toLocation, geometry) {
        const keyPoints = [];

        // Find segment of geometry between from and to
        const fromIndex = this.findClosestPointOnLine(
            geometry,
            [fromLocation.lng, fromLocation.lat]
        ).index;

        const toIndex = this.findClosestPointOnLine(
            geometry,
            [toLocation.lng, toLocation.lat]
        ).index;

        // Extract points between the two indices
        const startIdx = Math.min(fromIndex, toIndex);
        const endIdx = Math.max(fromIndex, toIndex);

        const segmentPoints = geometry.slice(startIdx, endIdx + 1);

        if (segmentPoints.length <= 2) {
            // Not enough points, fall back to trajectory generation
            return this.generateTrajectoryKeyPoints(fromLocation, toLocation);
        }

        // Resample to desired number of keyPoints
        const totalDistance = this.calculatePolylineDistance(segmentPoints);
        const stepDistance = totalDistance / (this.config.numKeyPoints + 1);

        for (let i = 1; i <= this.config.numKeyPoints; i++) {
            const targetDistance = stepDistance * i;

            // Find the point at targetDistance along the polyline
            const point = this.interpolateAlongPolyline(
                segmentPoints,
                targetDistance
            );

            if (point) {
                keyPoints.push({
                    lng: point.lng,
                    lat: point.lat,
                    bearing: point.bearing
                });
            }
        }

        return keyPoints;
    }

    /**
     * Generate keyPoints using trajectory prediction (for free drive mode)
     */
    generateTrajectoryKeyPoints(fromLocation, toLocation) {
        const keyPoints = [];
        const numPoints = this.config.numKeyPoints;

        const totalDistance = this.haversineDistance(
            fromLocation.lat, fromLocation.lng,
            toLocation.lat, toLocation.lng
        );

        // Calculate bearing change (smooth transition)
        const bearingChange = this.shortestAngleDifference(
            fromLocation.bearing || 0,
            toLocation.bearing || 0
        );

        for (let i = 1; i <= numPoints; i++) {
            const fraction = i / (numPoints + 1);

            // Non-linear distribution: more points at the beginning for immediate response
            // Use ease-out cubic: f(t) = 1 - (1-t)³
            const easedFraction = 1 - Math.pow(1 - fraction, 3);

            // Interpolate position
            const distance = totalDistance * easedFraction;
            const bearing = this.normalizeBearing(
                (fromLocation.bearing || 0) + bearingChange * easedFraction
            );

            // Project from starting point
            const point = this.projectPoint(
                fromLocation.lat,
                fromLocation.lng,
                distance,
                bearing
            );

            keyPoints.push({
                lng: point.lng,
                lat: point.lat,
                bearing: bearing
            });
        }

        return keyPoints;
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

        const startLocation = this.lastLocation || targetLocation;
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
    }

    /**
     * Clear active route
     */
    clearRoute() {
        this.currentRoute = null;
    }

    /**
     * Get debug statistics
     */
    getDebugStats() {
        return {
            mapMatchingApiCount: this.mapMatchingApiCount,
            routeSnapCount: this.routeSnapCount
        };
    }

    /**
     * Reset debug counters
     */
    resetDebugStats() {
        this.mapMatchingApiCount = 0;
        this.routeSnapCount = 0;
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
        let minDistance = Infinity;
        let closestPoint = null;
        let closestIndex = 0;

        for (let i = 0; i < lineCoords.length - 1; i++) {
            const [lng1, lat1] = lineCoords[i];
            const [lng2, lat2] = lineCoords[i + 1];

            // Find closest point on this segment
            const closest = this.closestPointOnSegment(
                point[0], point[1],
                lng1, lat1,
                lng2, lat2
            );

            const distance = this.haversineDistance(
                point[1], point[0],
                closest.lat, closest.lng
            );

            if (distance < minDistance) {
                minDistance = distance;
                closestPoint = closest;
                closestIndex = i;
            }
        }

        return {
            ...closestPoint,
            index: closestIndex,
            distance: minDistance
        };
    }

    /**
     * Find closest point on a line segment
     */
    closestPointOnSegment(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;

        if (dx === 0 && dy === 0) {
            return { lng: x1, lat: y1 };
        }

        const t = Math.max(0, Math.min(1,
            ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)
        ));

        return {
            lng: x1 + t * dx,
            lat: y1 + t * dy
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
     * Interpolate along a polyline at a specific distance
     */
    interpolateAlongPolyline(coords, targetDistance) {
        let accumulated = 0;

        for (let i = 0; i < coords.length - 1; i++) {
            const [lng1, lat1] = coords[i];
            const [lng2, lat2] = coords[i + 1];

            const segmentDistance = this.haversineDistance(lat1, lng1, lat2,
                lng2);

            if (accumulated + segmentDistance >= targetDistance) {
                // Target is on this segment
                const remaining = targetDistance - accumulated;
                const fraction = remaining / segmentDistance;

                return {
                    lng: lng1 + (lng2 - lng1) * fraction,
                    lat: lat1 + (lat2 - lat1) * fraction,
                    bearing: this.calculateBearing(lat1, lng1, lat2, lng2)
                };
            }

            accumulated += segmentDistance;
        }

        // Return last point if we've gone past the end
        const last = coords[coords.length - 1];
        return {
            lng: last[0],
            lat: last[1],
            bearing: null
        };
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