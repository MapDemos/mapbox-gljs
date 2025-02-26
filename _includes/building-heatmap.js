lng = 139.746173
lat = 35.650641

let beforeMap

const loadMap = () => {
    beforeMap = new mapboxgl.Map({
        container: 'before',
        style: 'mapbox://styles/mapbox/light-v11',
        center: [lng, lat],
        zoom: 15,
        minZoom: 3,
        scrollZoom: true,
        language: 'en'
    })

    const tiles = [
        // 'tile_16_58207_25812',
        // 'tile_16_58207_25813',
        // 'tile_16_58208_25812',
        // 'tile_16_58208_25813',
        'consolidated_buildings'
    ]
    beforeMap.on('load', () => {
        beforeMap.showTileBoundaries = true

        tiles.forEach((tile) => {
            addLayer(tile)
        })

    })

    beforeMap.on('click', (event) => {
        const { lng, lat } = event.lngLat;
        console.log(`Longitude: ${lng}, Latitude: ${lat}`);
    })
}

const addLayer = (filename) => {
    beforeMap.addSource(
        `${filename}`,
        {
            type: 'geojson',
            data: `./assets/images/${filename}.geojson`
        }
    )
    beforeMap.addLayer({
        id: `${filename}`,
        type: 'fill',
        source: `${filename}`,
        paint: {
            'fill-color': [
                'interpolate', ['linear'],
                ['number', ['coalesce', ['get', '6_14'], 0]],
                0, '#0000FF',
                //0.005, '#800080',
                2, '#FF0000'
            ],
            // 'fill-color': 'green',
            'fill-opacity': 1
        },
        filter: [
            "all",
            ["has", "landmark_name"],
            [">", "height", 20]
        ]
    })

    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });

    beforeMap.on('mouseenter', `${filename}`, function (e) {
        beforeMap.getCanvas().style.cursor = 'pointer';

        var feature = e.features[0];
        var properties = feature.properties;

        var html = '<div>';
        for (var key in properties) {
            html += '<strong>' + key + '</strong>: ' + properties[key] + '<br />';
        }
        html += '</div>';

        popup.setLngLat(e.lngLat)
            .setHTML(html)
            .addTo(beforeMap);
    });

    beforeMap.on('mouseleave', `${filename}`, function () {
        beforeMap.getCanvas().style.cursor = '';
        popup.remove();
    });
}

loadMap()

const afterMap = new mapboxgl.Map({
    container: 'after',
    //style: 'mapbox://styles/mapbox/dark-v11',
    center: [lng, lat],
    zoom: 15,
    minZoom: 3,
    scrollZoom: true,
    language: 'en'
});

// A selector or reference to HTML element
const container = '#comparison-container';

const map = new mapboxgl.Compare(beforeMap, afterMap, container, {
    // Set this to enable comparing two maps by mouse movement:
    // mousemove: true
});