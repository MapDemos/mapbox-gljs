let specifiedDate = '2024-05-28'

let map
let popup

let geojsonData = null;
let dataDownloaded = false;

const loadMap = () => {
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v11',
        //style: 'mapbox://styles/kenji-shima/cm5vzzpmr00p301ra0cz3bizj',
        center: [lng, lat],
        zoom: 6,
        minZoom: 3,
        maxZoom: 22,
        scrollZoom: true,
        language: 'ja',
    })

    /*map.on('load', () => {
        // Fetch the GeoJSON data
        fetch('randomPointsInJapan.geojson')
            .then(response => response.json())
            .then(data => {
                map.addSource('random-points', {
                    type: 'geojson',
                    data: data
                });

                map.addLayer({
                    id: 'random-points',
                    type: 'circle',
                    minZoom: 5,
                    source: 'random-points',
                    paint: {
                        'circle-radius': 5,
                        'circle-color': [
                            'match',
                            ['get', 'tp'],
                            'A', '#f28cb1',
                            'B', '#f1f075',
                            'C', '#51bbd6',
                            'D', '#223b53',
                            'E', '#e55e5e',
                            'F', '#3bb2d0',
                            'G', '#8a8acb',
                            'H', '#56b881',
                            'I', '#ed6498',
                            'J', '#fbb03b',
                            '#ccc'
                        ]
                    }
                });
                // Change the cursor to a pointer when the mouse is over the layer
                map.on('mouseenter', 'random-points', () => {
                    map.getCanvas().style.cursor = 'pointer';
                });

                // Change the cursor back to default when the mouse leaves the layer
                map.on('mouseleave', 'random-points', () => {
                    map.getCanvas().style.cursor = '';
                });
            })
            .catch(error => console.error('Error loading GeoJSON data:', error));
    });*/
    map.on('load', () => {

        fetch('randomPointsInJapan.geojson')
            .then(response => response.json())
            .then(data => {
                geojsonData = data;
                dataDownloaded = true;
                document.getElementById('iso-button').disabled = false;
                document.getElementById('clear-button').disabled = false;
            })
            .catch(error => console.error('Error loading GeoJSON data:', error));

        map.addSource('random-points', {
            type: 'vector',
            url: 'mapbox://kenji-shima.elevators'
        })

        map.addLayer({
            id: 'random-points',
            type: 'circle',
            minZoom: 5,
            'source-layer': 'elevators',
            source: 'random-points',
            paint: {
                'circle-radius': 5,
                'circle-color': [
                    'match',
                    ['get', 'tp'],
                    'A', '#f28cb1',
                    'B', '#f1f075',
                    'C', '#51bbd6',
                    'D', '#223b53',
                    'E', '#e55e5e',
                    'F', '#3bb2d0',
                    'G', '#8a8acb',
                    'H', '#56b881',
                    'I', '#ed6498',
                    'J', '#fbb03b',
                    '#ccc'
                ]
            }
        })

    })
    map.on('idle', () => {

    })

    // map.on('click', (event) => {
    //     const { lng, lat } = event.lngLat;
    //     console.log(`Longitude: ${lng}, Latitude: ${lat}`);
    // })

    map.on('click', 'random-points', (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ['random-points']
        });

        if (!features.length) {
            return;
        }

        const feature = features[0];
        const properties = feature.properties;

        // Create a table to display the properties
        let tableContent = '<div style="opacity:1.0!important"><table>';
        for (const key in properties) {
            if (properties.hasOwnProperty(key)) {
                tableContent += `<tr><th>${key}</th><td>${properties[key]}</td></tr>`;
            }
        }
        tableContent += '</table></div>';

        if (popup) {
            popup.remove()
        }
        popup = new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(tableContent)
            .addTo(map);

        // Highlight the matching ID in the idlist
        const idListDiv = document.getElementById('idlist');
        const listItems = idListDiv.getElementsByTagName('li');
        for (let i = 0; i < listItems.length; i++) {
            if (listItems[i].textContent === properties.id) {
                listItems[i].classList.add('highlighted');
            } else {
                listItems[i].classList.remove('highlighted');
            }
        }
    });

}

loadMap()

function filterByType(type) {
    if (type === "ALL") {
        map.setFilter('random-points', null); // Remove the filter to show all values
    } else {
        map.setFilter('random-points', ['==', ['get', 'tp'], type]);
    }
}
window.filterByType = filterByType

function getIso() {
    const typeSelect = document.getElementById('type-select');
    typeSelect.value = 'ALL';
    typeSelect.dispatchEvent(new Event('change'));
    const center = map.getCenter()
    fetchIsochrone("mapbox/driving", [center.lng, center.lat], 20).then((data) => {
        if (map.getLayer('isochrone-layer')) {
            map.removeLayer('isochrone-layer')
        }
        if (map.getSource('isochrone')) {
            map.removeSource('isochrone')
        }
        map.addSource('isochrone', {
            type: 'geojson',
            data: data
        });

        map.addLayer({
            id: 'isochrone-layer',
            type: 'fill',
            source: 'isochrone',
            layout: {},
            paint: {
                'fill-color': 'red',
                'fill-opacity': 0.2
            }
        },
            'random-points'
        );

        checkIfInPoly(data.features[0])

    });
}
window.getIso = getIso

function checkIfInPoly(poly) {

    if (!dataDownloaded) {
        console.error('GeoJSON data not downloaded yet.');
        return;
    }

    const polygon = turf.polygon(poly.geometry.coordinates)
    const features = []
    const points = geojsonData.features
    points.forEach(element => {
        const point = turf.point(element.geometry.coordinates)
        const isInside = turf.booleanPointInPolygon(point, polygon)
        if (isInside) {
            features.push(element)
        }
    });

    const ids = features.map(feature => feature.properties.id);
    map.setFilter('random-points', ['in', 'id', ...ids]);

    const idListDiv = document.getElementById('idlist');
    idListDiv.innerHTML = '';

    // Create a list of IDs and append it to the div
    const ul = document.createElement('ul');
    let currentHighlightedItem = null;

    ids.forEach(id => {
        const li = document.createElement('li');
        li.textContent = id;
        li.addEventListener('click', () => {
            // Find the corresponding point on the map
            const feature = features.find(f => f.properties.id === id);
            if (feature) {
                // Close the previous popup if it exists
                if (popup) {
                    popup.remove();
                }

                // Create a popup and set its content to show all properties in a table
                let tableContent = '<div style="opacity:1.0!important"><table>';
                for (const key in feature.properties) {
                    if (feature.properties.hasOwnProperty(key)) {
                        tableContent += `<tr><th>${key}</th><td>${feature.properties[key]}</td></tr>`;
                    }
                }
                tableContent += '</table></div>';

                popup = new mapboxgl.Popup()
                    .setLngLat(feature.geometry.coordinates)
                    .setHTML(tableContent)
                    .addTo(map);

                // Highlight the selected item in the list
                if (currentHighlightedItem) {
                    currentHighlightedItem.classList.remove('highlighted');
                }
                li.classList.add('highlighted');
                currentHighlightedItem = li;
            }
        });
        ul.appendChild(li);
    });
    idListDiv.appendChild(ul);



}

function clearIso() {
    if (map.getLayer('isochrone-layer')) {
        map.removeLayer('isochrone-layer')
    }
    if (map.getSource('isochrone')) {
        map.removeSource('isochrone')
    }
    map.setFilter('random-points', null);
    const idListDiv = document.getElementById('idlist');
    idListDiv.innerHTML = '';
    if (popup) {
        popup.remove()
    }
}
window.clearIso = clearIso