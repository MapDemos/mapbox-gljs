map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11', // A Mapbox base style
    center: [116.40, 39.91], // Beijing
    zoom: 12
});
const amapkey = '3654c552398e35b4b7eb1f69eaca4a79';
map.on('load', () => {
    // The {z}/{x}/{y} are placeholders that Mapbox will automatically fill in.
    map.addSource('amap-tiles', {
        'type': 'raster',
        'tiles': [
            `https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}&key=${amapkey}`,
            `https://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}&key=${amapkey}`,
            `https://webrd03.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}&key=${amapkey}`,
            `https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}&key=${amapkey}`
        ],
        'tileSize': 512 // The size of the tiles in pixels. 256 is standard.
    });

    // Find the first symbol layer in the map style to place the amap layer before it
    const layers = map.getStyle().layers;
    let firstSymbolId;
    for (const layer of layers) {
        if (layer.type === 'symbol') {
            firstSymbolId = layer.id;
            break;
        }
    }
    map.addLayer({
        'id': 'amap-layer', 
        'type': 'raster',  
        'source': 'amap-tiles', 
        'paint': {
            'raster-opacity': 1.0, 
            'raster-fade-duration': 0 
        }
    }, firstSymbolId); // Add the amap layer before the first symbol layer

    // map.addSource('mapbox-boundaries-source', {
    //     'type': 'vector',
    //     'url': 'mapbox://mapbox.boundaries-adm0-v4'
    // });

    // map.addLayer({
    //     'id': 'china-mask-layer',
    //     'type': 'fill',
    //     'source': 'mapbox-boundaries-source',
    //     'source-layer': 'boundaries_admin_0', // The specific data layer within the tileset
    //     'paint': {
    //         // Use a color that matches your map's background
    //         'fill-color': '#f8f4f0',
    //         'fill-opacity': 1
    //     },
    //     // This is the key part: The Filter!
    //     // It tells the layer to draw all polygons where the 3-letter country code
    //     // is NOT 'CHN' (China).
    //     'filter': ['!=', ['get', 'iso_3166_1'], 'CN']
    // });
});