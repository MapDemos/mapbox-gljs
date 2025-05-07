const defaultCoordinates = [144.96596, -37.744995];

let map

const loadMap = () => {
    map = new mapboxgl.Map({
        container: 'map',
        //style: 'mapbox://styles/mapbox/light-v11',
        center: defaultCoordinates,
        zoom: 18,
        scrollZoom: true
    })
    map.on('load', () => {
        

    })
    map.on('click', async (event) => {
        const coords = event.lngLat;

        const url = `https://api.mapbox.com/isochrone/v1/mapbox/walking/${coords.lng},${coords.lat}?contours_minutes=5&polygons=true&access_token=${mapboxgl.accessToken}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            // Remove existing isochrone if any
            if (map.getSource('isochrone')) {
                map.getSource('isochrone').setData(data);
            } else {
                map.addSource('isochrone', {
                    type: 'geojson',
                    data: data
                });

                map.addLayer({
                    id: 'isochrone-layer',
                    type: 'fill',
                    source: 'isochrone',
                    paint: {
                        'fill-color': '#5a3fc0',
                        'fill-opacity': 0.3
                    }
                });
            }
        } catch (err) {
            console.error('Error fetching isochrone:', err);
        }
    })
}

loadMap()