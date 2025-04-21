const defaultCoordinates = [139.76652995236685, 35.67881527736655];

let googleMap;

async function initGoogleMap() {
    const { Map } = await google.maps.importLibrary("maps");

    googleMap = new Map(document.getElementById("google-map"), {
        center: { lat: defaultCoordinates[1], lng: defaultCoordinates[0] },
        zoom: 6,
    });

    googleMap.data.loadGeoJson("luup_all.geojson"); // Replace with your GeoJSON file path

    // Optional: Add a click listener for the loaded features
    googleMap.data.addListener("click", function (event) {
        // Example: Get a property from the clicked feature
        const name = event.feature.getProperty("name"); // Replace "name" with your property key
        if (name) {
            alert("Clicked on: " + name);
        } else {
            console.log("Clicked feature properties:", event.feature.getPropertyNames());
        }
    });
}

let map

const loadMap = () => {
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v11',
        center: defaultCoordinates,
        zoom: 5,
        language: 'ja',
        scrollZoom: true
    })
    map.on('load', () => {
        map.loadImage('https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png', (error, image) => {
            if (error) throw error;
            if (!map.hasImage('port')) {
                map.addImage('port', image);
            }
        });

        fetch('luup_all.geojson')
            .then(response => response.json())
            .then(data => {
                addAllLayers(data)
            })
            .catch(error => console.error('Error loading GeoJSON data:', error));
    })
    map.on('click', (event) => {
        const { lng, lat } = event.lngLat;
        console.log(`Longitude: ${lng}, Latitude: ${lat}`);
    })

    /*map.on('click', 'clusters', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['clusters']
        });
        map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: map.getZoom() + 2
        });
    });*/

    map.on('click', 'symbol-port', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['symbol-port']
        });
        console.log("feature", features[0].properties)
        if (!features.length) return;
        const feature = features[0];

        let html = '<table>';
        for (const key in feature.properties) {
            if (feature.properties.hasOwnProperty(key)) {
                html += `<tr><th>${key}</th><td>${feature.properties[key]}</td></tr>`;
            }
        }
        html += '</table>';

        new mapboxgl.Popup()
            .setLngLat(feature.geometry.coordinates)
            .setHTML(html)
            .addTo(map);
    });
}

const addAllLayers = (data) => {
    map.addSource('ports', {
        type: 'geojson',
        data: data,
        //cluster: true,
        //clusterMaxZoom: 14,
        //clusterRadius: 50
    });
    /*map.addLayer({
        id: "clusters",
        type: "circle",
        source: "ports",
        filter: ['has', 'point_count'],
        paint: {
            "circle-color": [
                "step",
                ["get", "point_count"],
                "#51bbd6",
                2,
                "#f1f075",
                100,
                "#f28cb1",
            ],
            "circle-radius": ["step", ["get", "point_count"],
                20,
                100,
                30,
                750,
                40],
        },
    });

    map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "ports",
        filter: ['has', 'point_count'],
        layout: {
            'text-field': ['get', 'point_count_abbreviated'],
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12,
        },
    });*/

    map.addLayer({
        id: "symbol-port",
        type: "symbol",
        source: "ports",
        filter: ['!', ['has', 'point_count']],
        layout: {
            "icon-image": "port", // ensure you have added this image beforehand
            "icon-size": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0, 0.1,
                10, 0.5,
                15, 0.8
            ],
            "icon-allow-overlap": true
        }
    });
}

loadMap()
initGoogleMap()