const precipitationColorScale = () => {
    const domain = [2, 5, 10, 20, 30, 50, 80];
    const range = [
        'rgba(102, 255, 255, 0.8)',
        'rgba(0, 204, 255, 0.8)',
        'rgba(51, 102, 255, 0.8)',
        'rgba(255, 204, 0, 0.8)',
        'rgba(255, 153, 0, 0.8)',
        'rgba(255, 0, 0, 0.8)',
        'rgba(183, 0, 16, 0.8)'
    ];

    // const domain = [0, 1, 4, 8, 12, 16, 24, 32, 40, 48, 56, 64, 80, 200];
    // const range = [
    //     "rgba(204, 255, 255, 0.0)",
    //     "rgba(102, 255, 255, 0.0)",
    //     "rgba(0, 204, 255, 0.8)",
    //     "rgba(0, 153, 255, 0.8)",
    //     "rgba(51, 102, 255, 0.8)",
    //     "rgba(51, 255, 0, 0.8)",
    //     "rgba(51, 204, 0, 0.8)",
    //     "rgba(25, 153, 0, 0.8)",
    //     "rgba(255, 255, 0, 0.8)",
    //     "rgba(255, 204, 0, 0.8)",
    //     "rgba(255, 153, 0, 0.8)",
    //     "rgba(255, 80, 102, 0.8)",
    //     "rgba(255, 0, 0, 0.8)",
    //     "rgba(183, 0, 16, 0.8)"
    // ]

    let result = domain.map((v, i) => [v, range[i]]).flat();
    result.unshift('rgba(0, 0, 0, 0)');
    return result;
};

class PrecipitationLayerHelper {
    map;
    currentVisibleLayer = '';
    currentVisibleBand = '';
    precipitation_tiles = {};
    belt_tiles = {};
    timeManager;

    constructor(map, timeManager) {
        this.map = map;
        this.timeManager = timeManager;
    }

    checkAllSourcesLoaded() {
        if (Object.keys(this.precipitation_tiles).length < 22) return false;
        return Object.values(this.precipitation_tiles).every(tile => tile.sourceLoaded);
    }

    getTilesetKeyAndTime(datetime) {
        let tileset_key = datetime;
        let tileset_time = datetime;
        const offsetMinutes = this.timeManager.getOffsetMinutes(datetime);

        if (!this.timeManager.isCurrentOrPast(datetime)) {
            if (offsetMinutes <= 60) {
                tileset_time = this.timeManager.getyyyyMMddHHmmSS(0);
            }
            if (offsetMinutes <= 30) {
                tileset_key = this.timeManager.getyyyyMMddHHmmSS(0);
            } else if (offsetMinutes > 30 && offsetMinutes <= 60) {
                tileset_key = this.timeManager.getyyyyMMddHHmmSS(30);
            } else {
                tileset_time = this.timeManager.getyyyyMMddHHmmSS(0);
            }
        }

        return [tileset_key, tileset_time];
    }

    getTilesetIdAndUrl(datetime, tileset_time) {
        const offsetMinutes = this.timeManager.getOffsetMinutes(datetime);
        let tileset_suffix = '-30m';
        let tileset_prefix = 'nowcast-r';

        if (!this.timeManager.isCurrentOrPast(datetime)) {
            if (offsetMinutes > 30 && offsetMinutes <= 60) {
                tileset_suffix = '-60m';
            } else if (offsetMinutes > 60 && offsetMinutes <= 360) {
                tileset_time = getLastHalfOrExactHour(tileset_time, false);
                tileset_prefix = 'forecast';
                tileset_suffix = '-6h';
            } else {
                tileset_time = getLastExactHour(tileset_time, false);
                tileset_prefix = 'forecast';
                tileset_suffix = '-15h';
            }
        }

        const tileset_id = `kenji-shima.${tileset_prefix}-${toUTC(tileset_time)}${tileset_suffix}`;
        const tileset_url = `mapbox://${tileset_id}`;
        return [tileset_id, tileset_url];
    }

    setBand(datetime, tileset_key, layer_key, band) {
        if (!this.precipitation_tiles[tileset_key].layers[layer_key]) {
            this.precipitation_tiles[tileset_key].layers[layer_key] = { bands: {} };
        }

        const bandJpTime = toJST(Number(band));

        if (this.timeManager.isPast(datetime)) {
            if (datetime === bandJpTime) {
                this.precipitation_tiles[tileset_key].layers[layer_key].bands[bandJpTime] = { val: band };
            }
        } else {
            const tileset_id = this.precipitation_tiles[tileset_key].tileset_id;
            if (tileset_id.includes('forecast') && tileset_id.includes('-6h')) {
                const oneHourLater = this.timeManager.getyyyyMMddHHmmSS(60);
                const firstBandOfForecast = getLastHalfOrExactHour(oneHourLater, false);
                if (firstBandOfForecast !== bandJpTime) {
                    this.precipitation_tiles[tileset_key].layers[layer_key].bands[bandJpTime] = { val: band };
                }
            } else {
                this.precipitation_tiles[tileset_key].layers[layer_key].bands[bandJpTime] = { val: band };
            }
        }
    }

    handlePrecipitationSourceDataLoaded(tileset_key, datetime) {
        if (this.map?.getLayer(tileset_key)) return;

        const source = this.map?.getSource(tileset_key);
        source.rasterLayers?.forEach((layer) => {
            const fields = layer.fields;
            if (fields) {
                const bands = fields.bands;
                bands?.forEach((band) => {
                    this.setBand(datetime, tileset_key, fields.name, band);
                });
                this.map?.addLayer({
                    id: tileset_key,
                    type: 'raster',
                    source: tileset_key,
                    'source-layer': fields.name,
                    paint: {
                        'raster-color-range': [0, 200],
                        'raster-color': ['step', ['raster-value'], ...precipitationColorScale()],
                        'raster-resampling': 'nearest',
                        'raster-color-range-transition': { duration: 0 },
                        'raster-opacity': 0.0,
                        'raster-array-band': bands[0],
                        'raster-emissive-strength': 1.0
                    },
                    maxzoom: 14.99,
                });
            }
        });

        this.precipitation_tiles[tileset_key].sourceLoaded = true;
    }

    stringifyError(err) {
        const props = Object.getOwnPropertyNames(err);
        let result = '';
        props.forEach(prop => {
            result += `${prop}: ${err[prop]}\n`;
        });
        return result;
    }

    addLayer(datetime) {
        const [tileset_key, tileset_time] = this.getTilesetKeyAndTime(datetime);

        if (this.map) {
            if (Object.keys(this.precipitation_tiles).includes(tileset_key)) return;

            const [tileset_id, tileset_url] = this.getTilesetIdAndUrl(datetime, tileset_time);
            this.precipitation_tiles[tileset_key] = {
                tileset_id: tileset_id,
                url: tileset_url,
                layers: {},
                sourceLoaded: false
            };

            if (!this.map.getSource(tileset_key)) {
                this.map.addSource(tileset_key, {
                    type: 'raster-array',
                    url: tileset_url
                });

                this.map.on('sourcedata', (e) => {
                    if (e.sourceId === tileset_key && e.isSourceLoaded) {
                        this.handlePrecipitationSourceDataLoaded(tileset_key, datetime);
                        console.log(`Precipitation layer added: ${tileset_key} at ${datetime}`, this.precipitation_tiles);
                    }
                });

                this.map.on('error', (e) => {
                    if (e.error.toString().startsWith('Error:  (404)')) {
                        console.log(e.error);
                    }
                });
            }
        }
    }

    visibleLayer(datetime) {
        if (this.map) {
            let tileset_key = datetime;
            let band_key = datetime;

            if (!this.timeManager.isCurrentOrPast(datetime)) {
                const offsetMinutes = this.timeManager.getOffsetMinutes(datetime);
                if (offsetMinutes <= 30) {
                    tileset_key = this.timeManager.getyyyyMMddHHmmSS(0);
                } else if (offsetMinutes > 30 && offsetMinutes <= 60) {
                    tileset_key = this.timeManager.getyyyyMMddHHmmSS(30);
                }
            }

            if (this.precipitation_tiles[tileset_key].sourceLoaded) {
                this.privateVisibleLayer(tileset_key, band_key);
            } else {
                this.map.once('sourcedata', (e) => {
                    if (e.sourceId === datetime && e.isSourceLoaded) {
                        this.privateVisibleLayer(tileset_key, band_key);
                    }
                });
            }
        }
    }

    privateVisibleLayer(tileset_key, band_key) {
        if (this.currentVisibleLayer === tileset_key && this.currentVisibleBand === band_key) {
            return;
        }

        const tileset = this.precipitation_tiles[tileset_key];

        if (tileset.tileset_id.includes('forecast')) {
            if (tileset.tileset_id.includes('6h')) {
                band_key = getLastHalfOrExactHour(band_key, false);
            } else if (tileset.tileset_id.includes('15h')) {
                band_key = getLastExactHour(band_key, false);
            }
        }

        let band = band_key;
        for (const layer in tileset.layers) {
            const bands = tileset.layers[layer].bands;
            band = bands[band_key] ? bands[band_key].val : band_key;
        }

        if (this.map) {
            if (this.currentVisibleLayer !== '') {
                this.map.setPaintProperty(this.currentVisibleLayer, 'raster-opacity', 0);
            }
            this.map.setPaintProperty(tileset_key, 'raster-opacity', 0.8);
            this.map.setPaintProperty(tileset_key, 'raster-array-band', band);
            this.currentVisibleLayer = tileset_key;
            this.currentVisibleBand = band;

            // console.log(`Visible layer set to: ${tileset_key} with band: ${band}`);
        }
    }

    clearAll() {
        for (const key in this.precipitation_tiles) {
            if (!this.map.getLayer(key)) continue;
            this.map.removeLayer(key);
            this.map.removeSource(key);
        }
        this.precipitation_tiles = {};

        for (const key in this.belt_tiles) {
            const tileset_id = this.belt_tiles[key].tileset_id;
            if (!this.map.getLayer(tileset_id)) continue;
            this.map.removeLayer(tileset_id);
            this.map.removeSource(tileset_id);
        }
        this.belt_tiles = {};
    }

    getPrecipitationTiles() {
        return this.precipitation_tiles;
    }
}