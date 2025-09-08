const defaultCoordinates = [139.76652995236685, 35.67881527736655];
let map;
let deliveryCounts = {}; // To store delivery count per isochrone_id

/**
 * Pre-calculates the number of deliveries for each isochrone ID.
 * @param {object} deliveriesGeoJSON - The GeoJSON data from assigned_deliveries.geojson.
 */
const calculateDeliveryCounts = (deliveriesGeoJSON) => {
    deliveriesGeoJSON.features.forEach(delivery => {
        const id = delivery.properties.isochrone_id;
        if (id !== null) {
            deliveryCounts[id] = (deliveryCounts[id] || 0) + 1;
        }
    });
};

/**
 * Adds the delivery center icons to the map.
 * @param {object} data - The GeoJSON data from deliveryCenters.geojson.
 */
const addDeliveryCenters = (data) => {
    map.addSource('delivery-centers', {
        type: 'geojson',
        data: data,
    });

    map.addLayer({
        id: "symbol-delivery-centers",
        type: "symbol",
        source: "delivery-centers",
        layout: {
            "icon-image": "yamato",
            "icon-size": [
                "interpolate", ["linear"], ["zoom"],
                0, 0.1,
                10, 0.3,
                15, 0.6
            ],
            "icon-allow-overlap": true
        }
    });
};

/**
 * Adds the pre-calculated isochrone polygons to the map.
 * @param {object} data - The GeoJSON data from isochrones.geojson.
 */
const addIsochrones = (data) => {
    map.addSource('isochrones', {
        type: 'geojson',
        data: data
    });

    map.addLayer({
        id: 'isochrones-fill',
        type: 'fill',
        source: 'isochrones',
        paint: {
            'fill-color': ['get', 'color'],
            'fill-opacity': 0 // Initially hidden
        }
    });

    map.addLayer({
        id: 'isochrones-border',
        type: 'line',
        source: 'isochrones',
        paint: {
            'line-color': ['get', 'color'],
            'line-width': 2,
            'line-opacity': 0 // Initially hidden
        }
    });
};

/**
 * Adds the pre-assigned delivery points to the map.
 * @param {object} data - The GeoJSON data from assigned_deliveries.geojson.
 */
const addDeliveries = (data) => {
    map.addSource('assigned-deliveries', {
        type: 'geojson',
        data: data
    });

    // Layer 1: All deliveries, always visible and gray
    map.addLayer({
        id: 'assigned-deliveries-circles-gray',
        type: 'circle',
        source: 'assigned-deliveries',
        paint: {
            "circle-radius": [
                "interpolate", ["linear"], ["zoom"],
                0, 2,
                10, 4,
                15, 6
            ],
            "circle-color": '#CCCCCC', // All points are gray
            "circle-opacity": 0.5,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#FFFFFF"
        },
        minzoom: 10
    });

    // Layer 2: Highlighted deliveries, colored, shown on hover
    map.addLayer({
        id: 'assigned-deliveries-circles-highlight',
        type: 'circle',
        source: 'assigned-deliveries',
        paint: {
            "circle-radius": [
                "interpolate", ["linear"], ["zoom"],
                0, 2,
                10, 4,
                15, 6
            ],
            "circle-color": ['get', 'color'], // Use the feature's color property
            "circle-opacity": 0.9,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#FFFFFF"
        },
        minzoom: 10,
        // Initially, this layer shows nothing
        filter: ['==', 'isochrone_id', '']
    });
};

/**
 * Sets up the mouse hover interactions for delivery centers.
 */
const addHoverEvents = () => {
    let popup = null;

    map.on('mouseenter', 'symbol-delivery-centers', (e) => {
        const feature = e.features[0];
        const centerId = feature.properties.id;

        // Show popup with pre-calculated delivery count
        const deliveryCount = deliveryCounts[centerId] || 0;
        const color = (map.querySourceFeatures('isochrones', { filter: ['==', 'isochrone_id', centerId] })[0]?.properties.color) || '#000000';
        const html = `<div style="text-align: center; font-family: 'Hiragino Kaku Gothic Pro', 'Yu Gothic', 'Meiryo', sans-serif; font-size: 14px; padding: 5px;">
            <span style="color: ${color}; font-weight: bold;">配達数: ${deliveryCount}</span>
        </div>`;

        popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: [0, -10]
        }).setLngLat(feature.geometry.coordinates).setHTML(html).addTo(map);

        // Show corresponding isochrone by setting filter and opacity
        map.setFilter('isochrones-fill', ['==', 'isochrone_id', centerId]);
        map.setFilter('isochrones-border', ['==', 'isochrone_id', centerId]);
        map.setPaintProperty('isochrones-fill', 'fill-opacity', 0.3);
        map.setPaintProperty('isochrones-border', 'line-opacity', 1);

        // Show only corresponding deliveries on the highlight layer
        map.setFilter('assigned-deliveries-circles-highlight', ['==', 'isochrone_id', centerId]);
        // Hide the gray deliveries that are now being highlighted
        map.setFilter('assigned-deliveries-circles-gray', ['!=', 'isochrone_id', centerId]);
    });

    map.on('mouseleave', 'symbol-delivery-centers', () => {
        // Remove popup
        if (popup) {
            popup.remove();
            popup = null;
        }

        // Hide isochrones by resetting filter and opacity
        map.setFilter('isochrones-fill', null);
        map.setFilter('isochrones-border', null);
        map.setPaintProperty('isochrones-fill', 'fill-opacity', 0);
        map.setPaintProperty('isochrones-border', 'line-opacity', 0);

        // Hide the highlight layer again
        map.setFilter('assigned-deliveries-circles-highlight', ['==', 'isochrone_id', '']);
        // Show all gray deliveries again
        map.setFilter('assigned-deliveries-circles-gray', null);
    });
};

/**
 * Initializes the map and loads all data.
 */
const loadMap = () => {
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v11',
        center: defaultCoordinates,
        zoom: 12,
        minZoom: 3,
        scrollZoom: true,
        language: 'ja'
    });

    map.on('load', async () => {
        // Load icon image
        map.loadImage('./assets/images/yamato.png', (error, image) => {
            if (error) throw error;
            if (!map.hasImage('yamato')) {
                map.addImage('yamato', image);
            }
        });

        try {
            // Fetch all data concurrently
            const [centersData, isochronesData, deliveriesData] = await Promise.all([
                fetch('deliveryCenters.geojson').then(res => res.json()),
                fetch('isochrones.geojson').then(res => res.json()),
                fetch('assigned_deliveries.geojson').then(res => res.json())
            ]);

            // Pre-calculate delivery counts for popups
            calculateDeliveryCounts(deliveriesData);

            // Add sources and layers to the map in the correct visual order
            addDeliveries(deliveriesData);    // Bottom layers (gray and highlight circles)
            addIsochrones(isochronesData);    // Middle layers (isochrone fill and border)
            addDeliveryCenters(centersData);  // Top layer (center icons)

            // Setup interactions
            addHoverEvents();

        } catch (error) {
            console.error("Failed to load map data:", error);
        }
    });
};

loadMap();
// Initialize the map