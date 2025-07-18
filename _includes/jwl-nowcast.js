lat = 35.681236;
lng = 139.767125;

const tilesets = {
    nowcast_30: {
        value: "mapbox://mapbox.weather-jp-nowcast-30",
        label: "nowcast 30m",
        type: 'raster-array'
    },
    nowcast_60: {
        value: "mapbox://mapbox.weather-jp-nowcast-60",
        label: "nowcast 60m",
        type: 'raster-array'
    },
}

const showSource = () => {

    // map.once('idle', () => {
        const source = map.getSource('rastersource')
        const layers = source.rasterLayerIds;
        const bands = [];
        source.raster_layers.forEach((layer) => {
            bands.push(...layer.fields.bands);
        });
        const layerString = layers.join(',');
        const bandString = bands.join(',');
        const tileset = source.url.split('/').slice(-1)[0];
        const tilequery = `https://api.mapbox.com/v4/${tileset}/tilequery/-122.42901,37.80633.json?layers=${layerString}&bands=${bandString}&access_token=${mapboxgl.accessToken}`;
        console.log('Tile Query URL:', tilequery);


    // });

}

setTimeout(() => {
    showSource();
}, 1000);