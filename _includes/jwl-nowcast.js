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
    rain_6: {
        value: "mapbox://mapbox.weather-jp-rain-1-6",
        label: "rain 1-6",
        type: 'raster-array'
    },
    rain_15: {
        value: "mapbox://mapbox.weather-jp-rain-7-15",
        label: "rain 7-15",
        type: 'raster-array'
    },
    alert: {
        value: "mapbox://mapbox.weather-jp-alert",
        label: "alert",
        type: 'raster-array'
    },
    humidity39: {
        value: "mapbox://mapbox.weather-jp-humidity-0-39",
        label: "humidity 0-39",
        type: 'raster-array'
    },
    humidity78: {
        value: "mapbox://mapbox.weather-jp-humidity-40-78",
        label: "humidity 40-78",
        type: 'raster-array'
    },
    landslide: {
        value: "mapbox://mapbox.weather-jp-landslide",
        label: "landslide",
        type: 'raster-array'
    },
    pressure39: {
        value: "mapbox://mapbox.weather-jp-pressure-0-39",
        label: "pressure 0-39",
        type: 'raster-array'
    },
    pressure78: {
        value: "mapbox://mapbox.weather-jp-pressure-40-78",
        label: "pressure 40-78",
        type: 'raster-array'
    },
    flood: {
        value: "mapbox://mapbox.weather-jp-river-flood",
        label: "flood",
        type: 'vector',
        vector_layer_type: 'line',
        vector_layer_source: 'river_flood',
    },
    snowdepth: {
        value: "mapbox://mapbox.weather-jp-snowdepth",
        label: "snowdepth",
        type: 'raster-array'
    },
    temperature_39: {
        value: "mapbox://mapbox.weather-jp-temperature-0-39",
        label: "temperature 0-39",
        type: 'raster-array'
    },
    temperature_78: {
        value: "mapbox://mapbox.weather-jp-temperature-40-78",
        label: "temperature 40-78",
        type: 'raster-array'
    },
    waves: {
        value: "mapbox://mapbox.weather-jp-waves",
        label: "waves",
        type: 'raster-array'
    },
    wind_39: {
        value: "mapbox://mapbox.weather-jp-wind-0-39",
        label: "wind 0-39",
        type: 'raster-array-particle'
    },
    wind_78: {
        value: "mapbox://mapbox.weather-jp-wind-40-78",
        label: "wind 40-78",
        type: 'raster-array-particle'
    },

}

const showSourceDelayed = () => {
    setTimeout(() => {
        showSource();
    }, 1000);
}

const showSource = () => {

    const type = tilesettype;

    if (type === 'raster-array') {
        const source = map.getSource('rastersource')
        console.log('Raster Source:', source);
        const layers = source.rasterLayerIds;
        const bands = [];
        source.raster_layers.forEach((layer) => {
            bands.push(...layer.fields.bands);
        });
        const layerString = layers.join(',');
        const bandString = bands.join(',');
        const tileset = source.url.split('/').slice(-1)[0];
        const tilequery = `https://api.mapbox.com/v4/${tileset}/tilequery/${lng},${lat}.json?layers=${layerString}&bands=${bandString}&access_token=${mapboxgl.accessToken}`;
        console.log('Tile Query URL:', tilequery);
    }else{
        const source = map.getSource('vectorsource');
        console.log('Vector Source:', source);
        const layers = source.vectorLayerIds;
        const layerString = layers.join(',');
        const tileset = source.url.split('/').slice(-1)[0];
        const tilequery = `https://api.mapbox.com/v4/${tileset}/tilequery/${lng},${lat}.json?layers=${layerString}&access_token=${mapboxgl.accessToken}`;
        console.log('Tile Query URL:', tilequery);
    }

}

setTimeout(() => {
    document.getElementById('tileset-selector').addEventListener('change', showSourceDelayed);
}, 1000);