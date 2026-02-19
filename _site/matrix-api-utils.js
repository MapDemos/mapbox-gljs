/**
 * Mapbox Matrix API Utilities for Return-to-Route Feature
 *
 * This module provides functions to find optimal return points using:
 * 1. Turf.js for geometric filtering (closest points by straight-line distance)
 * 2. Mapbox Matrix API for real-world driving time/distance calculations
 */

import * as turf from '@turf/turf';

/**
 * Matrix API Configuration
 */
export const MATRIX_CONFIG = {
    // Profile options:
    // - 'mapbox/driving' (no traffic)
    // - 'mapbox/driving-traffic' (real-time traffic, 10 coordinate limit)
    // - 'mapbox/walking'
    // - 'mapbox/cycling'
    profile: 'mapbox/driving-traffic',

    // Request both duration and distance
    annotations: ['duration', 'distance'],

    // Maximum destinations to analyze (balance between accuracy and API cost)
    maxDestinations: 10,

    // Rate limits (per minute)
    rateLimits: {
        'mapbox/driving': 60,
        'mapbox/walking': 60,
        'mapbox/cycling': 60,
        'mapbox/driving-traffic': 30
    },

    // Max coordinates per profile
    maxCoordinates: {
        'mapbox/driving': 25,
        'mapbox/walking': 25,
        'mapbox/cycling': 25,
        'mapbox/driving-traffic': 10
    }
};

/**
 * Call Mapbox Matrix API (asymmetric: 1 source to N destinations)
 *
 * @param {string} accessToken - Mapbox access token
 * @param {[number, number]} source - Source coordinate [lng, lat]
 * @param {Array<[number, number]>} destinations - Array of destination coordinates
 * @param {Object} options - Additional options
 * @param {string} options.profile - Routing profile (default: from MATRIX_CONFIG)
 * @param {Array<string>} options.annotations - Metrics to return (default: ['duration', 'distance'])
 * @param {string} options.departAt - ISO 8601 timestamp for future routing (driving-traffic only)
 * @returns {Promise<Object>} Matrix API response
 *
 * @example
 * const result = await callMatrixAPI(
 *   'pk.ey...',
 *   [-122.4194, 37.7749],
 *   [[-122.4184, 37.7759], [-122.4174, 37.7769]],
 *   { profile: 'mapbox/driving-traffic' }
 * );
 */
export async function callMatrixAPI(accessToken, source, destinations, options = {}) {
    const profile = options.profile || MATRIX_CONFIG.profile;
    const annotations = options.annotations || MATRIX_CONFIG.annotations;

    // Validate coordinate limits
    const maxCoords = MATRIX_CONFIG.maxCoordinates[profile];
    if (destinations.length + 1 > maxCoords) {
        throw new Error(
            `Too many coordinates for ${profile}. Max: ${maxCoords}, provided: ${destinations.length + 1}`
        );
    }

    // Construct coordinates: source first, then destinations
    const coordinates = [source, ...destinations];
    const coordinatesString = coordinates
        .map(coord => `${coord[0].toFixed(6)},${coord[1].toFixed(6)}`)
        .join(';');

    // Build query parameters
    const params = new URLSearchParams({
        access_token: accessToken,
        sources: '0', // First coordinate is source
        destinations: destinations.map((_, i) => i + 1).join(';'), // Rest are destinations
        annotations: annotations.join(',')
    });

    // Add optional parameters
    if (options.departAt) {
        params.append('depart_at', options.departAt);
    }

    const url = `https://api.mapbox.com/directions-matrix/v1/${profile}/${coordinatesString}?${params}`;

    const response = await fetch(url);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Matrix API HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (data.code !== 'Ok') {
        throw new Error(`Matrix API error: ${data.code} - ${data.message || 'Unknown error'}`);
    }

    return data;
}

/**
 * Find N closest points to a reference point using straight-line distance (Turf.js)
 *
 * @param {[number, number]} referencePoint - Reference coordinate [lng, lat]
 * @param {Array<[number, number]>} points - Array of candidate coordinates
 * @param {number} limit - Number of closest points to return
 * @param {Object} options - Additional options
 * @param {string} options.units - Distance units (default: 'kilometers')
 * @returns {Array<Object>} Sorted array of closest points with distances
 *
 * @example
 * const closest = findClosestPoints(
 *   [-122.4194, 37.7749],
 *   intersectionPoints,
 *   10
 * );
 */
export function findClosestPoints(referencePoint, points, limit, options = {}) {
    const units = options.units || 'kilometers';
    const refPoint = turf.point(referencePoint);

    const pointsWithDistance = points.map((coords, index) => {
        const point = turf.point(coords);
        const distance = turf.distance(refPoint, point, { units });

        return {
            coordinates: coords,
            straightLineDistance: distance,
            originalIndex: index
        };
    });

    // Sort by distance and return top N
    pointsWithDistance.sort((a, b) => a.straightLineDistance - b.straightLineDistance);

    return pointsWithDistance.slice(0, limit);
}

/**
 * Find optimal return point using geometric pre-filtering + Matrix API
 *
 * This is the main function you'll use for return-to-route scenarios.
 *
 * @param {string} accessToken - Mapbox access token
 * @param {[number, number]} driverPosition - Current driver position [lng, lat]
 * @param {Array<[number, number]>} routeIntersections - All possible return points on route
 * @param {Object} options - Configuration options
 * @param {number} options.maxDestinations - Max intersections to analyze (default: 10)
 * @param {string} options.profile - Routing profile (default: 'mapbox/driving-traffic')
 * @param {string} options.optimizeFor - 'duration' or 'distance' (default: 'duration')
 * @param {string} options.departAt - ISO 8601 timestamp for future routing
 * @returns {Promise<Object>} Result object with optimal point and analysis data
 *
 * @example
 * const result = await findOptimalReturnPoint(
 *   'pk.ey...',
 *   [-122.4220, 37.7800],
 *   routeIntersectionPoints,
 *   { maxDestinations: 10, profile: 'mapbox/driving-traffic' }
 * );
 *
 * console.log(`Return to: ${result.optimal.coordinates}`);
 * console.log(`ETA: ${result.optimal.durationMinutes} minutes`);
 */
export async function findOptimalReturnPoint(
    accessToken,
    driverPosition,
    routeIntersections,
    options = {}
) {
    const maxDestinations = options.maxDestinations || MATRIX_CONFIG.maxDestinations;
    const profile = options.profile || MATRIX_CONFIG.profile;
    const optimizeFor = options.optimizeFor || 'duration'; // 'duration' or 'distance'

    // Step 1: Pre-filter using Turf.js to find closest N intersections by straight-line distance
    // This reduces API calls and costs
    console.log(`[Matrix] Analyzing ${routeIntersections.length} route intersections`);

    const closestIntersections = findClosestPoints(
        driverPosition,
        routeIntersections,
        maxDestinations
    );

    console.log(`[Matrix] Filtered to ${closestIntersections.length} closest intersections`);

    // Step 2: Call Matrix API to get real driving times/distances
    const destinationCoords = closestIntersections.map(i => i.coordinates);

    console.log(`[Matrix] Calling Matrix API with profile: ${profile}`);
    const startTime = Date.now();

    const matrixResponse = await callMatrixAPI(
        accessToken,
        driverPosition,
        destinationCoords,
        { profile, departAt: options.departAt }
    );

    const apiDuration = Date.now() - startTime;
    console.log(`[Matrix] API call completed in ${apiDuration}ms`);

    // Step 3: Parse results and combine with geometric data
    const durations = matrixResponse.durations[0]; // First row (source to all destinations)
    const distances = matrixResponse.distances[0];

    const results = closestIntersections.map((intersection, index) => ({
        coordinates: intersection.coordinates,
        originalIndex: intersection.originalIndex,

        // Geometric data
        straightLineDistance: intersection.straightLineDistance,
        straightLineDistanceKm: intersection.straightLineDistance.toFixed(2),

        // Matrix API data
        drivingDuration: durations[index], // seconds
        drivingDistance: distances[index], // meters

        // Human-readable formats
        durationMinutes: (durations[index] / 60).toFixed(1),
        durationFormatted: formatDuration(durations[index]),
        distanceKm: (distances[index] / 1000).toFixed(2),
        distanceFormatted: formatDistance(distances[index]),

        // Efficiency metrics
        detourFactor: (distances[index] / 1000) / intersection.straightLineDistance
    }));

    // Step 4: Find optimal point based on optimization criteria
    const optimal = results.reduce((best, current) => {
        const currentValue = optimizeFor === 'duration' ? current.drivingDuration : current.drivingDistance;
        const bestValue = optimizeFor === 'duration' ? best.drivingDuration : best.drivingDistance;
        return currentValue < bestValue ? current : best;
    });

    console.log(
        `[Matrix] Optimal return point: ${optimal.durationMinutes} min, ${optimal.distanceKm} km`
    );

    // Return comprehensive result object
    return {
        // Primary result
        optimal,

        // All analyzed points (sorted by optimization criteria)
        allResults: results.sort((a, b) => {
            const aValue = optimizeFor === 'duration' ? a.drivingDuration : a.drivingDistance;
            const bValue = optimizeFor === 'duration' ? b.drivingDuration : b.drivingDistance;
            return aValue - bValue;
        }),

        // Metadata
        metadata: {
            driverPosition,
            totalIntersections: routeIntersections.length,
            analyzedIntersections: closestIntersections.length,
            profile,
            optimizeFor,
            apiDuration
        },

        // Raw Matrix API response (for advanced use cases)
        matrixResponse
    };
}

/**
 * Batch process multiple driver positions (useful for testing or analytics)
 * Implements basic rate limiting to avoid exceeding API limits
 *
 * @param {string} accessToken - Mapbox access token
 * @param {Array<[number, number]>} driverPositions - Array of driver positions
 * @param {Array<[number, number]>} routeIntersections - Route intersections
 * @param {Object} options - Configuration options
 * @returns {Promise<Array<Object>>} Array of results for each position
 */
export async function batchFindOptimalReturnPoints(
    accessToken,
    driverPositions,
    routeIntersections,
    options = {}
) {
    const profile = options.profile || MATRIX_CONFIG.profile;
    const rateLimit = MATRIX_CONFIG.rateLimits[profile];
    const delayMs = (60 / rateLimit) * 1000 + 100; // Add 100ms buffer

    console.log(
        `[Matrix Batch] Processing ${driverPositions.length} positions with ${delayMs}ms delay`
    );

    const results = [];

    for (let i = 0; i < driverPositions.length; i++) {
        const position = driverPositions[i];

        try {
            const result = await findOptimalReturnPoint(
                accessToken,
                position,
                routeIntersections,
                options
            );

            results.push({ success: true, position, result });
        } catch (error) {
            console.error(`[Matrix Batch] Error for position ${i}:`, error);
            results.push({ success: false, position, error: error.message });
        }

        // Rate limiting delay (except for last iteration)
        if (i < driverPositions.length - 1) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    return results;
}

/**
 * Helper: Format duration in seconds to human-readable string
 */
function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);

    if (minutes === 0) return `${secs}s`;
    if (secs === 0) return `${minutes}m`;
    return `${minutes}m ${secs}s`;
}

/**
 * Helper: Format distance in meters to human-readable string
 */
function formatDistance(meters) {
    if (meters < 1000) {
        return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(2)}km`;
}

/**
 * Calculate cost estimate for Matrix API call
 * As of 2025, Matrix API is billed per element (sources × destinations)
 *
 * @param {number} sources - Number of source coordinates
 * @param {number} destinations - Number of destination coordinates
 * @returns {Object} Cost estimate information
 */
export function estimateMatrixAPICost(sources, destinations) {
    const elements = sources * destinations;

    // Pricing (as of 2025 - verify current pricing on Mapbox website)
    // Note: First 100,000 requests per month are free on most plans
    const pricePerElement = 0.005; // $0.005 per element (example, check actual pricing)
    const estimatedCost = elements * pricePerElement;

    return {
        sources,
        destinations,
        elements,
        estimatedCost: `$${estimatedCost.toFixed(4)}`,
        note: 'Verify current pricing at https://www.mapbox.com/pricing'
    };
}

// Export configuration for external use
export { MATRIX_CONFIG as config };
