lat = 35.681236;
lng = 139.767125;

const tilesets = {
    // snow_forecast: {
    //     value: "mapbox://kenji-shima.snow-20250123000000-forecast",
    //     label: "snow forecast",
    //     type: 'raster-array',
    //     colorscale: 'Snow'
    // },
    // snow_depth: {
    //     value: "mapbox://kenji-shima.snow-depth-20250123010000",
    //     label: "snow depth",
    //     type: 'raster-array',
    //     colorscale: 'Snow'
    // },
    nowcast: {
        value: "mapbox://mapbox.weather-jp-nowcast",
        label: "nowcast【高解像度降水ナウキャスト】",
        type: 'raster-array',
        colorscale: 'Rain'
    },
    nowcast_last60min: {
        value: "mapbox://mapbox.weather-jp-nowcast-last-60m",
        label: "nowcast last 60 minutes【高解像度降水ナウキャスト 過去60分】",
        type: 'raster-array',
        colorscale: 'Rain'
    },
    rain_6: {
        value: "mapbox://mapbox.weather-jp-rain-1-6",
        label: "rain 1-6【降水短時間予報値】",
        type: 'raster-array',
        colorscale: 'Rain'
    },
    rain_15: {
        value: "mapbox://mapbox.weather-jp-rain-7-15",
        label: "rain 7-15【降水15時間予報】",
        type: 'raster-array',
        colorscale: 'Rain'
    },
    alert: {
        value: "mapbox://mapbox.weather-jp-alert",
        label: "alert【警報危険度分布】",
        type: 'raster-array',
        mapstyle: 'mapbox://styles/mapbox/light-v11',
        maplayer_above: 'admin-0-boundary-disputed',
        colorscale: 'KikikuruShinsui'
    },
    // humidity39: {
    //     value: "mapbox://mapbox.weather-jp-humidity-0-39",
    //     label: "humidity 0-39",
    //     type: 'raster-array'
    // },
    // humidity78: {
    //     value: "mapbox://mapbox.weather-jp-humidity-40-78",
    //     label: "humidity 40-78",
    //     type: 'raster-array'
    // },
    landslide: {
        value: "mapbox://mapbox.weather-jp-landslide",
        label: "landslide【大雨警報（土砂災害）の危険度分布】",
        type: 'raster-array',
        mapstyle: 'mapbox://styles/mapbox/light-v11',
        maplayer_above: 'admin-0-boundary-disputed',
        colorscale: 'KikikuruDosha'
    },
    // pressure39: {
    //     value: "mapbox://mapbox.weather-jp-pressure-0-39",
    //     label: "pressure 0-39",
    //     type: 'raster-array'
    // },
    // pressure78: {
    //     value: "mapbox://mapbox.weather-jp-pressure-40-78",
    //     label: "pressure 40-78",
    //     type: 'raster-array'
    // },
    flood: {
        value: "mapbox://mapbox.weather-jp-river-flood",
        label: "flood【警報危険度分布】",
        type: 'vector',
        mapstyle: 'mapbox://styles/mapbox/light-v11',
        maplayer_above: 'admin-0-boundary-disputed',
        vector_layer_type: 'line',
        vector_layer_source: 'river_flood',
    },
    snowdepth: {
        value: "mapbox://mapbox.weather-jp-snowdepth",
        label: "snowdepth【降雪短時間予報】",
        type: 'raster-array',
        colorscale: 'Snow'
    },
    snowdepth_last6: {
        value: "mapbox://mapbox.weather-jp-snowdepth-last-6hr",
        label: "snowdepth last 6 hours【解析積雪深】",
        type: 'raster-array',
        colorscale: 'Snow'
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
    // waves: {
    //     value: "mapbox://mapbox.weather-jp-waves",
    //     label: "waves",
    //     type: 'raster-array'
    // },
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