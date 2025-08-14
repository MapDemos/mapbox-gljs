
// const places = [
//     { name: "Singapore", coordinates: [103.827011, 1.310717], prefix: "singapore" },
//     { name: "London", coordinates: [-0.08724502, 51.50475661], prefix: "london" },
//     { name: "Melbourne", coordinates: [144.9688507, -37.8179982], prefix: "melbourne" },
//     { name: "Sydney", coordinates: [151.20605399, -33.87118693], prefix: "sydney" },
//     { name: "Brisbane", coordinates: [153.02380651, -27.46876352], prefix: "brisbane" },
// ]


// let defaultCoordinates = places[0].coordinates;
// let prefix = places[0].prefix;

// // Create dropdown for places
// const dropdown = document.createElement('select');
// dropdown.id = 'places-dropdown';
// places.forEach((place, index) => {
//     const option = document.createElement('option');
//     option.value = index;
//     option.text = place.name;
//     dropdown.appendChild(option);
// });
// document.body.prepend(dropdown);

// // Handle selection change
// dropdown.addEventListener('change', (event) => {
//     const selectedIndex = parseInt(event.target.value);
//     defaultCoordinates = places[selectedIndex].coordinates;
//     prefix = places[selectedIndex].prefix;

//     loadMap();
// });

// function loadMap() {

//     var map = new mapboxgl.Map({
//         container: 'map',
//         center: defaultCoordinates,
//         zoom: 12,
//         pitch: 0,
//         interactive: true
//     });

//     map.on('load', () => {
//         map.showTileBoundaries = true;
//         const layers = map.getStyle().layers;
//         let firstSymbolId;
//         for (const layer of layers) {
//             if (layer.type === 'symbol') {
//                 firstSymbolId = layer.id;
//                 break;
//             }
//         }

//         // Add vector tile source for buildings
//         map.addSource('buildings', {
//             type: 'vector',
//             url: `mapbox://kenji-shima.${prefix}-buildings`
//         });

//         map.addLayer({
//             'id': 'buildings-layer',
//             'type': 'circle',
//             'source': 'buildings',
//             'source-layer': 'buildings', // Replace with actual source-layer name
//             'layout': {},
//             'paint': {
//                 'circle-color': '#000000',
//                 'circle-radius': 2.5
//             },
//             'minzoom': 12
//         }, firstSymbolId);

//         // Add vector tile source for directions/routes
//         map.addSource('routes', {
//             type: 'vector',
//             url: `mapbox://kenji-shima.${prefix}-routes`
//         });

//         map.addLayer({
//             'id': 'directions-layer',
//             'type': 'line',
//             'source': 'routes',
//             'source-layer': 'routes', // Replace with actual source-layer name
//             'layout': {},
//             'paint': {
//                 'line-color': '#0000FF',
//                 'line-width': 3
//             },
//             'minzoom': 12
//         }, firstSymbolId);

//         map.addSource('center', {
//             type: 'geojson',
//             data: {
//                 "type": "Feature",
//                 "geometry": {
//                     "type": "Point",
//                     "coordinates": defaultCoordinates
//                 },
//                 "properties": {}
//             }
//         });
//         map.addLayer({
//             'id': 'center',
//             'type': 'circle',
//             'source': 'center',
//             'layout': {},
//             'paint': {
//                 'circle-color': '#FFFFFF',
//                 'circle-radius': 10,
//                 'circle-stroke-width': 1,
//                 'circle-stroke-color': '#0000FF',
//             }
//         }, firstSymbolId);
//     });
// }

// loadMap();