
const defaultCoordinates = [139.76652995236685, 35.67881527736655];

let map
let mts = false

function getControlValues() {
    return {
        useMTS: document.getElementById('use-mts').checked,
        minutes: parseInt(document.getElementById('isochrone-minutes').value),
        profile: document.getElementById('travel-profile').value
    };
}

function setupControlListeners() {
    // Listen for MTS toggle
    document.getElementById('use-mts').addEventListener('change', function () {
        mts = this.checked;
        console.log('MTS mode:', mts);
        // Reload deliveries data when MTS mode changes
        reloadDeliveries();
    });

    // Listen for minutes change
    document.getElementById('isochrone-minutes').addEventListener('change', function () {
        console.log('Isochrone minutes changed to:', this.value);
    });

    // Listen for profile change
    document.getElementById('travel-profile').addEventListener('change', function () {
        console.log('Travel profile changed to:', this.value);
    });
}

function loadDeliveries() {
    if (mts) {
        addDeliveries(null);
    } else {
        fetch('deliveries.geojson')
            .then(response => response.json())
            .then(data => {
                addDeliveries(data)
            })
            .catch(error => console.error('Error loading GeoJSON data:', error));
    }
}

function reloadDeliveries() {
    // Remove existing deliveries layer and source
    if (map.getLayer('symbol-deliveries')) {
        map.removeLayer('symbol-deliveries');
    }
    if (map.getSource('deliveries')) {
        map.removeSource('deliveries');
    }

    loadDeliveries()
}

const loadMap = () => {
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v11',
        center: defaultCoordinates,
        zoom: 12,
        minZoom: 3,
        //maxZoom: 12,
        scrollZoom: true,
        language: 'ja'
    })
    map.on('load', () => {
        setupControlListeners();
        mts = document.getElementById('use-mts').checked;
        map.loadImage('./assets/images/yamato.png', (error, image) => {
            if (error) throw error;
            if (!map.hasImage('yamato')) {
                map.addImage('yamato', image);
            }
        });

        fetch('deliveryCenters.geojson')
            .then(response => response.json())
            .then(data => {
                addDeliveryCenters(data)
            })
            .catch(error => console.error('Error loading GeoJSON data:', error));

        loadDeliveries();
    })
    map.on('click', (event) => {
        const { lng, lat } = event.lngLat;
        console.log(`Longitude: ${lng}, Latitude: ${lat}`);

        // Check if there are any delivery centers at the click point
        const features = map.queryRenderedFeatures(event.point, {
            layers: ['symbol-delivery-centers']
        });

        // If no delivery centers were clicked, reset the action
        if (features.length === 0) {
            resetClickAction();
        }
    })

    map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });
        map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: map.getZoom() + 2
        });
    });

    let popup

    map.on('click', 'symbol-delivery-centers', async (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['symbol-delivery-centers']
        });

        if (!features.length) {
            resetClickAction();
            return;
        }
        const feature = features[0];

        // Get values from UI controls
        const controls = getControlValues();

        // Call isochrone API using UI values
        const coordinates = feature.geometry.coordinates;
        const isochroneData = await fetchIsochrone(controls.profile, coordinates, controls.minutes, '5A9FD4');

        // Add isochrone to map if it doesn't exist
        if (!map.getSource('isochrone')) {
            map.addSource('isochrone', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: []
                }
            });

            map.addLayer({
                id: 'isochrone-fill',
                type: 'fill',
                source: 'isochrone',
                paint: {
                    'fill-color': '#5A9FD4',
                    'fill-opacity': 0.3
                }
            });

            map.addLayer({
                id: 'isochrone-border',
                type: 'line',
                source: 'isochrone',
                paint: {
                    'line-color': '#5A9FD4',
                    'line-width': 2
                }
            });
        }

        let deliveryCount = 0;

        // Update the source with the isochrone data
        if (isochroneData) {
            map.getSource('isochrone').setData(isochroneData);

            // Get all delivery features using UI MTS setting
            let deliveryFeatures = null
            if (controls.useMTS) {
                deliveryFeatures = map.querySourceFeatures('deliveries', {
                    sourceLayer: 'deliveries'
                });
            } else {
                deliveryFeatures = map.getSource('deliveries')._data.features;
            }

            if (deliveryFeatures) {
                const isochronePolygon = isochroneData.features[0];

                // Filter delivery points that are within the isochrone polygon
                const deliveriesWithin = deliveryFeatures.filter(deliveryFeature => {
                    const point = deliveryFeature.geometry;
                    return turf.booleanPointInPolygon(point, isochronePolygon);
                });

                // Create a filter expression for Mapbox GL JS
                const deliveryIds = deliveriesWithin.map(feature => feature.properties.id || feature.id);
                deliveryCount = deliveriesWithin.length;

                // Apply filter to show only deliveries within the polygon
                if (deliveryIds.length > 0) {
                    map.setFilter('symbol-deliveries', ['in', ['get', 'id'], ['literal', deliveryIds]]);
                } else {
                    // If no deliveries within polygon, hide all
                    map.setFilter('symbol-deliveries', ['==', 'id', 'no-match']);
                }
            }
        }

        let html = '<table>';
        html += `<tr><th>配達数</th><td>${deliveryCount}</td></tr>`;
        html += '</table>';

        if (!popup) popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false
        });

        popup.setLngLat(feature.geometry.coordinates)
            .setHTML(html)
            .addTo(map);
    });

    const resetClickAction = () => {
        if (popup) {
            popup.remove();
        }

        // Clear isochrone
        if (map.getSource('isochrone')) {
            map.getSource('isochrone').setData({
                type: 'FeatureCollection',
                features: []
            });
        }

        // Reset delivery filter to show all deliveries
        if (map.getLayer('symbol-deliveries')) {
            map.setFilter('symbol-deliveries', null);
        }
    }
}

const addDeliveryCenters = (data) => {
    map.addSource('delivery-centers', {
        type: 'geojson',
        data: data,
    });

    map.addLayer({
        id: "symbol-delivery-centers",
        type: "symbol",
        source: "delivery-centers",
        // filter: ['!', ['has', 'point_count']],
        layout: {
            "icon-image": "yamato", // ensure you have added this image beforehand
            "icon-size": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0, 0.1,
                10, 0.3,
                15, 0.6
            ],
            "icon-allow-overlap": true
        }
    });
}

const addDeliveries = (data) => {
    const source = {
        type: 'geojson',
        data: data
    }
    const layer = {
        id: "symbol-deliveries",
        type: "circle",
        source: "deliveries",
        paint: {
            "circle-radius": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0, 2,
                10, 4,
                15, 6
            ],
            "circle-color": "#FF0000",
            "circle-opacity": 0.8,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#FFFFFF"
        },
        minzoom: 10
    }
    if (data === null) {
        source.type = 'vector'
        source.url = 'mapbox://kenji-shima.deliveries-z16'
        layer['source-layer'] = 'deliveries'
    }
    map.addSource('deliveries', source);

    map.addLayer(layer);
}

loadMap()