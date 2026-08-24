
const defaultCoordinates = [139.76652995236685, 35.67881527736655];

let map;

const loadMap = () => {
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v11',
        center: defaultCoordinates,
        zoom: 6,
        minZoom: 3,
        //maxZoom: 12,
        scrollZoom: true
    });
    map.on('load', () => {
        map.loadImage('https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png', (error, image) => {
            if (error) throw error;
            if (!map.hasImage('port')) {
                map.addImage('port', image);
            }
        });
        map.addSource('ports', {
            type: 'vector',
            url: `mapbox://kenji-shima.ports-demo`
        });
        map.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'ports',
            'source-layer': 'ports',
            filter: ['all', ['has', 'count'], ['>', ['get', 'count'], 1]],
            paint: {
                'circle-color': [
                    'step',
                    ['get', 'count'],
                    '#51bbd6',
                    2,
                    '#f1f075',
                    100,
                    '#f28cb1',
                ],
                'circle-radius': ['step', ['get', 'count'],
                    20,
                    100,
                    30,
                    750,
                    40],
            },
        });

        map.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'ports',
            'source-layer': 'ports',
            filter: ['all', ['has', 'count'], ['>', ['get', 'count'], 1]],
            layout: {
                'text-field': '{count}',
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12,
            },
        });

        map.addLayer({
            id: 'symbol-port',
            type: 'symbol',
            source: 'ports',
            'source-layer': 'ports',
            // Only show symbols when count is exactly 1
            filter: ['all', ['has', 'count'], ['==', ['get', 'count'], 1]],
            layout: {
                'icon-image': 'port', // ensure you have added this image beforehand
                'icon-size': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    0, 0.1,
                    10, 0.5,
                    15, 0.8
                ],
                'icon-allow-overlap': true
            }
        });

    });
    map.on('click', (event) => {
        const { lng, lat } = event.lngLat;
        console.log(`Longitude: ${lng}, Latitude: ${lat}`);
    });

    map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });
        map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: map.getZoom() + 2
        });
    });

    map.on('click', 'symbol-port', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['symbol-port']
        });
        console.log('feature',features[0].properties);
    });
};

loadMap();