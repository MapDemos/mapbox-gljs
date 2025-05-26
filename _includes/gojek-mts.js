
// Simple Mapbox map setup for Jakarta, no dynamic centroid/directions/overpass logic
var map = new mapboxgl.Map({
    container: 'map',
    center: [106.8272, -6.1751], // Jakarta coordinates
    zoom: 12,
    pitch: 0,
    interactive: true
});

map.on('load', () => {
    map.showTileBoundaries = true;
    const layers = map.getStyle().layers;
    let firstSymbolId;
    for (const layer of layers) {
        if (layer.type === 'symbol') {
            firstSymbolId = layer.id;
            break;
        }
    }

    // Add vector tile source for buildings
    map.addSource('buildings', {
        type: 'vector',
        url: 'mapbox://kenji-shima.jakarta-buildings'
    });

    map.addLayer({
        'id': 'buildings-layer',
        'type': 'circle',
        'source': 'buildings',
        'source-layer': 'buildings', // Replace with actual source-layer name
        'layout': {},
        'paint': {
            'circle-color': '#000000',
            'circle-radius': 2.5
        },
        'minzoom': 12
    }, firstSymbolId);

    // Add vector tile source for directions/routes
    map.addSource('routes', {
        type: 'vector',
        url: 'mapbox://kenji-shima.jakarta-routes-simplified'
    });

    map.addLayer({
        'id': 'directions-layer',
        'type': 'line',
        'source': 'routes',
        'source-layer': 'routes', // Replace with actual source-layer name
        'layout': {},
        'paint': {
            'line-color': '#0000FF',
            'line-width': 3
        },
        'minzoom': 12
    }, firstSymbolId);
});