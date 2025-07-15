const defaultCoordinates = [139.76652995236685, 35.67881527736655];
lat = defaultCoordinates[1];
lng = defaultCoordinates[0];
const tilesets = {
    nowcast: {
        value: "mapbox://kenji-shima.nowcast-20240816090000-30m-n",
        label: "60m Nowcast",
        type: 'raster-array'
    },
}

function setTileset(tileset) {
    // map.on('load', () => {
        map.addSource('grib2-meshes', {
            type: 'vector',
            url: 'mapbox://kenji-shima.250m-mesh6'
        });
        map.addLayer({
            'id': 'grib2-meshes',
            'type': 'line',
            'source': 'grib2-meshes',
            'source-layer': '250m_mesh',
            'paint': {
                'line-color': '#000000',
                'line-width': 0.5
            }
        });
    // });
}

setTimeout(() => {
    setTileset(tilesets.nowcast);
}, 1000);
