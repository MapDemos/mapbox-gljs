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
        id: 'symbol-delivery-centers',
        type: 'symbol',
        source: 'delivery-centers',
        layout: {
            'icon-image': 'yamato',
            'icon-size': [
                'interpolate', ['linear'], ['zoom'],
                0, 0.1,
                10, 0.3,
                15, 0.6
            ],
            'icon-allow-overlap': true
        }
    });
};

/**
 * Adds the pre-calculated isochrone polygons to the map.
 * @param {object} data - The GeoJSON data from isochrones.geojson.
 */
const addIsochrones = (data) => {
    map.addSource('isochrones', {
        //type: 'geojson',
        type: 'vector',
        // data: data
        url: 'mapbox://kenji-shima.delivery-center-15-walk'
    });

    map.addLayer({
        id: 'isochrones-fill',
        type: 'fill',
        source: 'isochrones',
        'source-layer': 'delivery-centers',
        paint: {
            'fill-color': ['get', 'color'],
            'fill-opacity': 0 // Initially hidden
        }
    });

    map.addLayer({
        id: 'isochrones-border',
        type: 'line',
        source: 'isochrones',
        'source-layer': 'delivery-centers',
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
        //type: 'geojson',
        type: 'vector',
        url: 'mapbox://kenji-shima.deliveries-15-walk',
        //data: data
    });

    // Layer 1 (Bottom): All deliveries, colored by default.
    map.addLayer({
        id: 'assigned-deliveries-circles-colored',
        type: 'circle',
        source: 'assigned-deliveries',
        'source-layer': 'deliveries',
        paint: {
            'circle-radius': [
                'interpolate', ['linear'], ['zoom'],
                0, 2,
                10, 4,
                15, 6
            ],
            'circle-color': ['get', 'color'], // Colored by default
            'circle-opacity': 0.9,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#FFFFFF'
        },
        minzoom: 10
    });

    // Layer 2 (Top): A "gray-out" layer that covers non-matching points on hover.
    map.addLayer({
        id: 'assigned-deliveries-circles-grayout',
        type: 'circle',
        source: 'assigned-deliveries',
        'source-layer': 'deliveries',
        paint: {
            'circle-radius': [
                'interpolate', ['linear'], ['zoom'],
                0, 2,
                10, 4,
                15, 6
            ],
            'circle-color': '#CCCCCC', // Gray color
            'circle-opacity': 0.7,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#FFFFFF'
        },
        minzoom: 10,
        // Initially, this layer shows nothing.
        filter: ['==', 'isochrone_id', '']
    });
};

/**
 * Sets up the mouse hover interactions for delivery centers.
 */
const addHoverEvents = () => {
    let popup = null;
    let hoveredCenterId = null;
    let mouseleaveTimeout = null;

    map.on('mouseenter', 'symbol-delivery-centers', (e) => {
        // If there's a pending mouseleave action, cancel it
        if (mouseleaveTimeout) {
            clearTimeout(mouseleaveTimeout);
            mouseleaveTimeout = null;
        }

        const feature = e.features[0];
        hoveredCenterId = feature.properties.id;

        // Show popup with pre-calculated delivery count
        const deliveryCount = deliveryCounts[hoveredCenterId] || 0;
        const color = (map.querySourceFeatures('isochrones', { filter: ['==', 'isochrone_id', hoveredCenterId] })[0]?.properties.color) || '#000000';
        const html = `<div style="text-align: center; font-family: 'Hiragino Kaku Gothic Pro', 'Yu Gothic', 'Meiryo', sans-serif; font-size: 14px; padding: 5px;">
            <span style="color: ${color}; font-weight: bold;">配達数: ${deliveryCount}</span>
        </div>`;

        popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: [0, -10]
        }).setLngLat(feature.geometry.coordinates).setHTML(html).addTo(map);

        // Show corresponding isochrone by setting filter and opacity
        map.setFilter('isochrones-fill', ['==', 'isochrone_id', hoveredCenterId]);
        map.setFilter('isochrones-border', ['==', 'isochrone_id', hoveredCenterId]);
        map.setPaintProperty('isochrones-fill', 'fill-opacity', 0.3);
        map.setPaintProperty('isochrones-border', 'line-opacity', 1);

        // Filter the colored layer to ONLY show deliveries for the hovered center.
        map.setFilter('assigned-deliveries-circles-colored', ['==', 'isochrone_id', hoveredCenterId]);
        // Activate the grayout layer to cover all OTHER deliveries.
        map.setFilter('assigned-deliveries-circles-grayout', ['!=', 'isochrone_id', hoveredCenterId]);
    });

    map.on('mouseleave', 'symbol-delivery-centers', () => {
        // Remove popup
        if (popup) {
            popup.remove();
            popup = null;
        }

        // Immediately start the fade-out animation
        map.setPaintProperty('isochrones-fill', 'fill-opacity', 0);
        map.setPaintProperty('isochrones-border', 'line-opacity', 0);

        // Deactivate the grayout layer.
        map.setFilter('assigned-deliveries-circles-grayout', ['==', 'isochrone_id', '']);
        // Reset the colored layer to show all deliveries again.
        map.setFilter('assigned-deliveries-circles-colored', null);

        // After a delay (e.g., 300ms for fade to complete), reset the filter
        mouseleaveTimeout = setTimeout(() => {
            map.setFilter('isochrones-fill', null);
            map.setFilter('isochrones-border', null);
        }, 300); // 300ms is a safe delay for default transitions
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
                fetch('deliveryCentersAll.geojson').then(res => res.json()),
                fetch('isochrones.geojson').then(res => res.json()),
                fetch('assigned_deliveries.geojson').then(res => res.json())
            ]);

            // Pre-calculate delivery counts for popups
            calculateDeliveryCounts(deliveriesData);

            // Add sources and layers to the map in the correct visual order
            addDeliveries(deliveriesData);    // Bottom layers (colored circles and grayout layer)
            addIsochrones(isochronesData);    // Middle layers (isochrone fill and border)
            addDeliveryCenters(centersData);  // Top layer (center icons)

            // Setup interactions
            addHoverEvents();

        } catch (error) {
            console.error('Failed to load map data:', error);
        }
    });
};

loadMap();
// Initialize the map