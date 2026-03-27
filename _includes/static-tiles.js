// Static Tiles Demo
// Displays a base style with satellite imagery and a raster static tiles layer overlay

// Default center on Taipei
const defaultCoordinates = [121.5654, 25.0330];

let map;

const loadMap = () => {
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/kenji-shima/cmmswfkcf001601sw9h7w5quj', // Base style
        center: defaultCoordinates,
        zoom: 6,
        minZoom: 0,
        maxZoom: 20,
        scrollZoom: true
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    // Add fullscreen control
    map.addControl(new mapboxgl.FullscreenControl(), 'bottom-right');

    map.on('load', () => {
        // Find the first label layer to insert satellite and static tiles below labels
        const layers = map.getStyle().layers;
        let firstLabelLayerId;
        for (const layer of layers) {
            if (layer.type === 'symbol' && layer.layout['text-field']) {
                firstLabelLayerId = layer.id;
                break;
            }
        }

        // Add Mapbox Satellite tileset
        // This provides high-resolution satellite imagery
        map.addSource('satellite-source', {
            type: 'raster',
            url: 'mapbox://mapbox.satellite',
            tileSize: 512
        });

        map.addLayer({
            id: 'satellite-layer',
            type: 'raster',
            source: 'satellite-source',
            layout: {
                'visibility': 'none' // Start hidden
            },
            paint: {
                'raster-opacity': 1,
                'raster-fade-duration': 300
            }
        }, firstLabelLayerId); // Insert below labels

        // Add the static tiles style as a raster layer
        // This uses the Mapbox Raster Tiles API to render the style as raster tiles
        map.addSource('static-tiles-source', {
            type: 'raster',
            tiles: [
                `https://api.mapbox.com/styles/v1/kenji-shima/cmn7fa71j003i01sv3qln4tye/tiles/512/{z}/{x}/{y}@2x?access_token=${mapboxgl.accessToken}`
            ],
            tileSize: 512
        });

        map.addLayer({
            id: 'static-tiles-layer',
            type: 'raster',
            source: 'static-tiles-source',
            paint: {
                'raster-opacity': 1,
                'raster-fade-duration': 300
            }
        }, firstLabelLayerId); // Insert below labels, above satellite

        // Set up layer selection with radio buttons
        const satelliteRadio = document.getElementById('satellite-layer-radio');
        const staticRadio = document.getElementById('static-layer-radio');

        // Function to switch layers
        function switchLayer(layerType) {
            if (layerType === 'satellite') {
                map.setLayoutProperty('satellite-layer', 'visibility', 'visible');
                map.setLayoutProperty('static-tiles-layer', 'visibility', 'none');
            } else if (layerType === 'static') {
                map.setLayoutProperty('satellite-layer', 'visibility', 'none');
                map.setLayoutProperty('static-tiles-layer', 'visibility', 'visible');
            }
        }

        // Radio button event listeners
        satelliteRadio.addEventListener('change', () => {
            if (satelliteRadio.checked) {
                switchLayer('satellite');
            }
        });

        staticRadio.addEventListener('change', () => {
            if (staticRadio.checked) {
                switchLayer('static');
            }
        });

        // Set up projection dropdown
        const projectionSelect = document.getElementById('projection-select');

        projectionSelect.addEventListener('change', (e) => {
            const projection = e.target.value;
            map.setProjection(projection);
        });

        // Optional: Add click handler to show layer information
        map.on('click', (e) => {
            const features = map.queryRenderedFeatures(e.point);
            if (features.length > 0) {
                console.log('Clicked features:', features);
            }
        });
    });

    // Error handling
    map.on('error', (e) => {
        console.error('Map error:', e);
    });
};

// Initialize map when page loads
loadMap();
