
lat = 1.4214734600763848
lng = 103.87371902395148
const tilesets = {

    n1d_z4: {
        value: "mapbox://kenji-shima.nea-N1D-z4",
        label: "N1D Zoom 4",
        type: 'raster-array'
    },
    n1d_z8: {
        value: "mapbox://kenji-shima.nea-N1D-z8",
        label: "N1D Zoom 8",
        type: 'raster-array'
    },
    n1d_z12: {
        value: "mapbox://kenji-shima.nea-N1D-z12",
        label: "N1D Zoom 12",
        type: 'raster-array'
    },
    gfs_z4: {
        value: "mapbox://kenji-shima.nea-gfs-z4",
        label: "GFS Zoom 4",
        type: 'raster-array'
    },
    gfs_z8: {
        value: "mapbox://kenji-shima.nea-gfs-z8",
        label: "GFS Zoom 8",
        type: 'raster-array'
    },
    gfs_z12: {
        value: "mapbox://kenji-shima.nea-gfs-z12",
        label: "GFS Zoom 12",
        type: 'raster-array'
    },
    radar_z4: {
        value: "mapbox://kenji-shima.nea-radar",
        label: "Radar Zoom 4",
        type: 'raster-array',
        zoom: 11.5
    },
    radar_z8: {
        value: "mapbox://kenji-shima.nea-radar-8",
        label: "Radar Zoom 8",
        type: 'raster-array',
        zoom: 11.5
    },
    radar_z12: {
        value: "mapbox://kenji-shima.nea-radar-12",
        label: "Radar Zoom 12",
        type: 'raster-array',
        zoom: 11.5
    },
    radar_z16: {
        value: "mapbox://kenji-shima.nea-radar-test",
        label: "Radar Zoom 16",
        type: 'raster-array',
        zoom: 11.5
    },
    satellite_H8_ASEAN_z8: {
        value: "mapbox://kenji-shima.nea-satellite-h8-asean-z8",
        label: "Satellite H8 ASEAN Zoom 8",
        type: 'raster'
    },
    satellite_H8_ASEAN_z10: {
        value: "mapbox://kenji-shima.nea-satellite-h8-asean-z10",
        label: "Satellite H8 ASEAN Zoom 10",
        type: 'raster'
    },
    satellite_H8_ASEAN_z12: {
        value: "mapbox://kenji-shima.nea-satellite-h8-asean-z12",
        label: "Satellite H8 ASEAN Zoom 12",
        type: 'raster'
    },
    satellite_smoke_z4: {
        value: "mapbox://kenji-shima.nea-satellite-smoke",
        label: "Satellite Smoke Zoom 4",
        type: 'raster'
    },
    satellite_smoke_z8: {
        value: "mapbox://kenji-shima.nea-satellite-smoke-z8",
        label: "Satellite Smoke Zoom 8",
        type: 'raster'
    },
    satellite_smoke_z10: {
        value: "mapbox://kenji-shima.nea-satellite-smoke-z10",
        label: "Satellite Smoke Zoom 10",
        type: 'raster'
    },
    satellite_smoke_z12: {
        value: "mapbox://kenji-shima.nea-satellite-smoke-z12",
        label: "Satellite Smoke Zoom 12",
        type: 'raster'
    },
    lightning_z4: {
        value: "mapbox://kenji-shima.nea-lightning-z4",
        label: "Lightning Zoom 4-4",
        type: 'vector',
        vector_layer_type: 'circle',
        vector_layer_source: 'lightning',
        zoom: 4
    },
    lightning_z8: {
        value: "mapbox://kenji-shima.nea-lightning-z8",
        label: "Lightning Zoom 4-8",
        type: 'vector',
        vector_layer_type: 'circle',
        vector_layer_source: 'lightning',
        zoom: 4
    },
    lightning_z12: {
        value: "mapbox://kenji-shima.nea-lightning-z12",
        label: "Lightning Zoom 4-12",
        type: 'vector',
        vector_layer_type: 'circle',
        vector_layer_source: 'lightning',
        zoom: 4
    },
    lightning_z16: {
        value: "mapbox://kenji-shima.nied-lightning",
        label: "Lightning Zoom 4-16",
        type: 'vector',
        vector_layer_type: 'circle',
        vector_layer_source: 'lightning',
        zoom: 4
    },
    hotspot_z4: {
        value: "mapbox://kenji-shima.nea-hotspot-z4",
        label: "Hotspot Zoom 4-4",
        type: 'vector',
        vector_layer_type: 'circle',
        vector_layer_source: 'hotspot',
        zoom: 4
    },
    hotspot_z8: {
        value: "mapbox://kenji-shima.nea-hotspot-z8",
        label: "Hotspot Zoom 4-8",
        type: 'vector',
        vector_layer_type: 'circle',
        vector_layer_source: 'hotspot',
        zoom: 4
    },
    hotspot_z12: {
        value: "mapbox://kenji-shima.nea-hotspot-z12",
        label: "Hotspot Zoom 4-12",
        type: 'vector',
        vector_layer_type: 'circle',
        vector_layer_source: 'hotspot',
        zoom: 4
    },
    hotspot_z16: {
        value: "mapbox://kenji-shima.nied-hotspot",
        label: "Hotspot Zoom 4-16",
        type: 'vector',
        vector_layer_type: 'circle',
        vector_layer_source: 'hotspot',
        zoom: 4
    },
    spactial_reception_z9: {
        value: "mapbox://kenji-shima.spacial-reception-z9",
        label: "Spacial Reception Zoom 9",
        type: 'vector',
        vector_layer_type: 'fill',
        vector_layer_source: 'spacial-reception',
        zoom: 4
    },
    spactial_reception_z12: {
        value: "mapbox://kenji-shima.spacial-reception-z12",
        label: "Spacial Reception Zoom 12",
        type: 'vector',
        vector_layer_type: 'fill',
        vector_layer_source: 'spacial-reception',
        zoom: 4
    },
    sbkk_eq_z8: {
        value: "mapbox://kenji-shima.sbkk-eq-z8",
        label: "SBKK Earthquake Zoom 8",
        type: 'vector',
        vector_layer_type: 'line',
        vector_layer_source: 'eq',
    },
    sbkk_eq_z12: {
        value: "mapbox://kenji-shima.sbkk-eq-z12",
        label: "SBKK Earthquake Zoom 12",
        type: 'vector',
        vector_layer_type: 'line',
        vector_layer_source: 'eq',
    },
    sbkk_eq_z16: {
        value: "mapbox://kenji-shima.sbkk-eq-z16",
        label: "SBKK Earthquake Zoom 16",
        type: 'vector',
        vector_layer_type: 'line',
        vector_layer_source: 'eq',
    },
}
