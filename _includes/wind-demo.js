lat = -24.635070733310073;
lng = 134.6455347407337;

const tilesets = {
    wind_particles: {
        value: 'mapbox://kenji-shima.wvs2025111018v5',
        label: 'Wind Particles',
        type: 'raster-array-particle',
        mapstyle: 'mapbox://styles/mapbox/satellite-v9',
        maplayer_above: 'satellite',
        particleLayer: 'wind_vector'
    },
    wind_speed: {
        value: 'mapbox://kenji-shima.wvs2025111018v5',
        label: 'Wind Speed Heatmap',
        type: 'raster-array',
        mapstyle: 'mapbox://styles/mapbox/satellite-v9',
        maplayer_above: 'satellite',
        colorscale: 'Turbo',
        speedLayer: 'wind_speed'
    },
};
