const defaultCoordinates = [138.8876271433324, 38.36242938133822];

const cities = {
    'Sapporo': {
        coordinates: [141.35638473162078, 43.0610860864561],
        label: '札幌',
    },
    'Sendai': {
        coordinates: [140.88140697482936, 38.2624351622911],
        label: '仙台',
    },
    'Tokyo': {
        coordinates: [139.76687407959213, 35.68123488811237],
        label: '東京',
    },
    'Odawara': {
        coordinates: [139.15570572333144, 35.25600477829211],
        label: '小田原',
    },
    'Nagoya': {
        coordinates: [136.9082992254862, 35.17242940435324],
        label: '名古屋',
    },
    'Osaka': {
        coordinates: [135.49893833814843, 34.70279801557176],
        label: '大阪',
    },
    'Fukuoka': {
        coordinates: [130.39580227602198, 33.59627572301682],
        label: '福岡',
    },
    'Naha': {
        coordinates: [127.67920025197901, 26.213833753425405],
        label: '那覇',
    }
}

function updateLegendBar() {
    const legend = document.querySelector('.legend-bar');
    if (!legend) return;

    const scale = precipitationColorScale();

    // Remove the first value if it's a fallback (like "rgba(0, 0, 0, 0)")
    const stops = typeof scale[0] === 'string' ? scale.slice(1) : scale;

    const valueColorPairs = [];
    for (let i = 0; i < stops.length; i += 2) {
        valueColorPairs.push({ val: stops[i], color: stops[i + 1] });
    }

    // Normalize positions between 0–100% for gradient stops
    const min = valueColorPairs[0].val;
    const max = valueColorPairs[valueColorPairs.length - 1].val;
    const gradientStops = valueColorPairs.map(({ val, color }) => {
        const percent = ((val - min) / (max - min)) * 100;
        return `${color} ${percent.toFixed(2)}%`;
    });

    legend.style.background = `linear-gradient(to right, ${gradientStops.join(', ')})`;

    // Optional: show tick labels below
    const ticks = document.querySelector('.legend-bar');
    if (ticks) {
        ticks.innerHTML = '';
        valueColorPairs.forEach(({ val }) => {
            const tick = document.createElement('span');
            tick.className = 'label';
            tick.textContent = val;
            tick.style = '';
            ticks.appendChild(tick);
        });
    }
}

const sliderDomain = [0, 38];
const baseDate = "20240621055000";
const timeManager = new TimeManager(baseDate);

// const yjRainScale = () => {
//     const domain = [0, 1, 4, 8, 12, 16, 24, 32, 40, 48, 56, 64, 80, 200];
//     const range = [
//         "rgba(204, 255, 255, 0.0)",
//         "rgba(102, 255, 255, 0.0)",
//         "rgba(0, 204, 255, 0.8)",
//         "rgba(0, 153, 255, 0.8)",
//         "rgba(51, 102, 255, 0.8)",
//         "rgba(51, 255, 0, 0.8)",
//         "rgba(51, 204, 0, 0.8)",
//         "rgba(25, 153, 0, 0.8)",
//         "rgba(255, 255, 0, 0.8)",
//         "rgba(255, 204, 0, 0.8)",
//         "rgba(255, 153, 0, 0.8)",
//         "rgba(255, 80, 102, 0.8)",
//         "rgba(255, 0, 0, 0.8)",
//         "rgba(183, 0, 16, 0.8)"
//     ]
//     return domain.map((v, i) => [v, range[i]]).flat();
// };

// const getStepColorscale = () => {
//     let result = yjRainScale()
//     result.unshift("rgba(0, 0, 0, 0)")
//     return result
// }

// const stepScale = [
//     'step',
//     ['raster-value'],
//     ...getStepColorscale()
// ]

// const interpolateScale = [
//     'interpolate',
//     ['linear'],
//     ['raster-value'],
//     ...yjRainScale()
// ]

const rasterTileQuery = async (coords) => {
    const currentKey = preciptationHelper.currentVisibleLayer;
    const currentTileset = preciptationHelper.precipitation_tiles[currentKey].tileset_id;
    const currentBand = preciptationHelper.currentVisibleBand;

    const layers = ['precipitation']
    const bands = [currentBand]
    const layerString = layers.length > 0 ? `&layers=${layers.join(',')}` : ''
    const bandString = bands.length > 0 ? `&bands=${bands.join(',')}` : ''
    const response = await fetch(`https://api.mapbox.com/v4/${currentTileset}/tilequery/${coords[0]},${coords[1]}.json?${layerString}${bandString}&access_token=${mapboxgl.accessToken}`)
    const data = await response.json()
    return data
}

const batchRasterTileQuery = async (coords) => {
    const tileset_id = []
    const layers = []
    const bands = []

    for (const key in preciptationHelper.precipitation_tiles) {
        const tile = preciptationHelper.precipitation_tiles[key];
        if (tile.tileset_id) {
            if (!tileset_id.includes(tile.tileset_id)) {
                tileset_id.push(tile.tileset_id);
            }
            for (const layerid in tile.layers) {
                if (!layers.includes(layerid)) {
                    layers.push(layerid);
                }
                for (const bandid in tile.layers[layerid].bands) {
                    const band = tile.layers[layerid].bands[bandid].val;
                    if (!bands.includes(band)) {
                        bands.push(band);
                    }
                }
            }
        }
    }
    const layerString = layers.length > 0 ? `&layers=${layers.join(',')}` : ''
    const bandString = bands.length > 0 ? `&bands=${bands.join(',')}` : ''
    const response = await fetch(`https://api.mapbox.com/v4/${tileset_id}/tilequery/${coords[0]},${coords[1]}.json?${layerString}${bandString}&access_token=${mapboxgl.accessToken}`)
    const data = await response.json()
    return data
}

const reverseGeocode = async (coords) => {
    const response = await fetch(`https://api.mapbox.com/search/geocode/v6/reverse?longitude=${coords[0]}&latitude=${coords[1]}&language=ja&country=jp&types=place&access_token=${mapboxgl.accessToken}`)
    const data = await response.json()
    return data
}

// let currentTileset = 'kenji-shima.nowcast-20240620202500-30m';
// let currentLayer = 'precipitation';
// let currentBand = '1718915100';

const getLightPreset = () => {
    const HHmm = timeManager.getHHmm();
    const hour = parseInt(HHmm.slice(0, 2), 10);
    lightPreset = 'dawn';
    if (hour >= 4 && hour < 6) lightPreset = 'dawn';
    else if (hour >= 6 && hour < 17) lightPreset = 'day';
    else if (hour >= 17 && hour < 19) lightPreset = 'dusk';
    else lightPreset = 'night';
    return lightPreset;
}

const setLocalEffects = (lng, lat) => {

    reverseGeocode([lng, lat]).then((data) => {
        if (data.features.length) {
            const placeName = data.features[0].properties.name;
            const geoName = document.getElementById('geo-name');
            if (geoName) {
                geoName.textContent = placeName;
                document.getElementById('area-panel').style.display = 'flex';
            }
        }
    });

    rasterTileQuery([lng, lat]).then((data) => {

        let precipitation = 0.0;
        let density = 0.0;
        let intensity = 0.0;
        let highColor = 'rgb(225, 236, 248)';
        let modelLightIntensity = 5.0;
        //let lightPreset = getLightPreset();
        if (data.features.length) {
            precipitation = data.features[0].properties['val'];
            if (precipitation > 1) {
                density = precipitation * 0.01 * 2
                if (density > 1) {
                    density = 1.0
                }
                intensity = density
            }
            if (density > 0.3) {
                highColor = 'rgb(71, 76, 89)';
                modelLightIntensity = 1.0;
                //lightPreset = 'dusk';
            }
            // console.log(`Tilequery value: ${precipitation}`);
            // console.log(`Density: ${density}`);
            // console.log(`Intensity: ${intensity}`);
            // console.log(`High Color: ${highColor}`);
        }

        map.setRain({
            density: [
                'interpolate',
                ['linear'],
                ['zoom'],
                14.99, 0.0,
                15, density
            ],
            intensity: [
                'interpolate',
                ['linear'],
                ['zoom'],
                14.99, 0.0,
                15, 1.0
            ],
            //color: '#919191',
            opacity: 0.6,
            'center-thinning': 0,
            direction: [0, 90],
            'droplet-size': [1, 50],
            'distortion-strength': 0.5,
            vignette: 0.5,
            vignetteColor: '#6e6e6e'
        })

        const weather = getWeather(precipitation);
        const model = getModel(weather);
        if (model) {
            moveModel(model.name, [lng, lat], model.height);
        }

        const geoWeather = document.getElementById('geo-weather');
        if (geoWeather) {
            geoWeather.innerHTML = '';
            let iconUrl = getWeatherIcon(weather);
            if (iconUrl) {
                const img = document.createElement('img');
                img.src = iconUrl;
                img.className = 'weather-icon';
                geoWeather.appendChild(img);
                document.getElementById('area-panel').style.display = 'flex';
            }
        }

        // if (weather !== 'sunny') {
        //     map.setFog({
        //         color: highColor, // Lower atmosphere
        //         'high-color': highColor, // Upper atmosphere
        //         //'horizon-blend': 0.02, // Atmosphere thickness (default 0.2 at low zooms)
        //         'space-color': highColor, // Background color
        //         //'star-intensity': 0.6 // Background star brightness (default 0.35 at low zoooms )
        //     })
        // } else {
        //     const style = map.getStyle();
        //     if (style && style.fog) {
        //         style.fog = {};
        //         map.setStyle(style);
        //     }
        // }
        modelLight.intensity = modelLightIntensity;
        // map.setConfigProperty('basemap', 'lightPreset', lightPreset);


    })

    batchRasterTileQuery([lng, lat]).then((data) => {
        if (data.features.length > 0) {
            const deduped = new Map();
            data.features.forEach((feature) => {
                const band = feature.properties.tilequery.band;
                deduped.set(band, {
                    band_jstyyyyMMddHHmmSS: toJST(band),
                    band: band,
                    value: feature.properties.val[0]
                });
            });
            const results = Array.from(deduped.values());
            results.sort((a, b) => a.band_jstyyyyMMddHHmmSS.localeCompare(b.band_jstyyyyMMddHHmmSS));
            showPrecipitationChart(results);
        }
    });
}

const SUNNY = { name: "the_sun.glb", size: 40, height: 3000 };
//const SUNNY = { name: 'sun_from_poly_by_google.glb', size: 50, height: 280 };
//const SUNNY = { name: 'cloud__sun_anim.glb', size: 0.15, height: 280 };
//const CLOUDY = { name: 'stylized_clouds.glb', size: 40, height: 200 };
const CLOUDY = { name: 'cloud_ring.glb', size: 140, height: 200 };
const RAINY = { name: 'cloud_ring.glb', size: 140, height: 200 };
//const RAINY = { name: '3d_mesh_of_a_cloud.glb', size: 40, height: 250 };

let preciptationHelper = null;
function addPrecipitationLayers(map) {

    preciptationHelper = new PrecipitationLayerHelper(map, timeManager);

    const values = Array.from({ length: sliderDomain[1] - sliderDomain[0] + 1 }, (_, i) => sliderDomain[0] + i);
    values.forEach((value) => {
        const offset = getMinutesOffset(value);
        let yyyyMMddHHmmSS = timeManager.getyyyyMMddHHmmSS(offset);
        if (offset > 30 && offset <= 60) {
            // yyyyMMddHHmmSS = timeManager.getyyyyMMddHHmmSS(offset);
            // do nothing, use the same time
        } else if (offset > 60 && offset <= 360) {
            tileset_time = getLastHalfOrExactHour(yyyyMMddHHmmSS, false);
        } else {
            tileset_time = getLastExactHour(yyyyMMddHHmmSS, false);
        }
        preciptationHelper.addLayer(yyyyMMddHHmmSS);
    });

    const timeslider = document.getElementById('slider')
    timeslider.max = sliderDomain[sliderDomain.length - 1]
    timeslider.value = 0

    function loadFirstLayer() {
        if (!preciptationHelper.checkAllSourcesLoaded()) {
            setTimeout(loadFirstLayer, 10);
            return;
        }
        const firstKey = Object.keys(preciptationHelper.precipitation_tiles)[0];
        preciptationHelper.visibleLayer(firstKey);
        addCityPanels();
        setCurrentTime();
        updateLegendBar();
    }
    loadFirstLayer();
}

function setCurrentTime() {
    const currentTimeBox = document.getElementById('current-time');
    if (currentTimeBox) {
        currentTimeBox.textContent = timeManager.getFormattedDateTime();
    }
}
function inputBand(val) {
    const minutesOffset = getMinutesOffset(val);
    timeManager.updateTimeByOffset(minutesOffset)
    preciptationHelper.visibleLayer(timeManager.getyyyyMMddHHmmSS(minutesOffset));
    setCurrentTime();
}
window.inputBand = inputBand;

function changeBand() {
    addCityPanels();
    const zoom = map.getZoom();
    if (zoom > 15) {
        clearModels();
        setLocalEffects(map.getCenter().lng, map.getCenter().lat);
    }
    map.setConfigProperty('basemap', 'lightPreset', getLightPreset());
}
window.changeBand = changeBand;

let modelLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1.0);
function addThreeboxLayer(map) {
    map.addLayer({
        id: 'threebox-layer',
        type: 'custom',
        renderingMode: '3d',
        minzoom: 16,
        onAdd: function (map, mbxContext) {

            window.tb = new Threebox(
                map,
                mbxContext,
                { defaultLights: true }
            );

            // Add a hemisphere light to the Threebox scene to simulate natural sky/ground ambient light.
            tb.scene.add(modelLight);

        },
        render: function (gl, matrix) {
            window.tb.update();
        }

    })
}

let cg_models = {}
let rotateRequestId = null;
let isRotating = false;
async function loadModel(name, scale) {
    const type = name.substring(name.lastIndexOf('.') + 1)
    const options = {
        obj: `./assets/models/${name}`,
        type: type,
        scale: scale,
        units: 'meters',
        rotation: { x: 90, y: 270, z: 0 }, // default rotation
        anchor: 'center'
    }
    window.tb.loadObj(options, function (model) {
        // Add a PointLight at the center of the model to simulate sunlight
        // const pointLight = new THREE.PointLight(0xffffff, 5, 1000);
        // pointLight.position.set(0, 0, 0); // center of the model
        // model.add(pointLight);
        cg_models[name] = {
            model: model,
            scale: scale
        }
    })
}

function clearModels() {
    Object.keys(cg_models).forEach(name => {
        moveModel(name, [0, 0], -1000);
    });
}

function moveModel(name, coordinates, height = 400) {
    const model = cg_models[name].model
    window.tb.add(model)
    model.setCoords([coordinates[0], coordinates[1], height]);
    //model.set({ position: { x: 0, y: 0, z: 0 } })
    return model
}

function getWeather(precipitation) {
    if (precipitation >= 0 && precipitation <= 1) {
        return 'sunny';
    } else if (precipitation > 1 && precipitation < 10) {
        return 'cloudy';
    } else if (precipitation >= 10) {
        return 'rainy';
    }
    return '';
}

function getWeatherIcon(weather) {
    const lightPreset = getLightPreset();
    if (weather === 'sunny') {
        if (lightPreset === 'dusk' || lightPreset === 'night') {
            return './assets/images/moon.png';
        } else{
            return './assets/images/sun.png';
        }
    } else if (weather === 'cloudy') {
        if (lightPreset === 'dusk' || lightPreset === 'night') {
            return './assets/images/cloud-moon.png';
        } else{
            return './assets/images/cloudy.png';
        }
    } else if (weather === 'rainy') {
        return './assets/images/rainy-day.png';
    }
    return '';
}

function getModel(weather) {
    // if (weather === 'sunny') {
    //     return SUNNY;
    if (weather === 'cloudy') {
        return CLOUDY;
    } else if (weather === 'rainy') {
        return RAINY;
    }
    return '';
}

function addCityPanels() {
    // Create city panel container
    const panel = document.getElementById('city-panel');
    panel.innerHTML = ''; // Clear existing content
    // panel.id = 'city-panel';
    // panel.className = 'city-panel';
    // document.body.appendChild(panel);

    Object.entries(cities).forEach(([key, { label, coordinates }]) => {
        const box = document.createElement('div');
        box.className = 'city-box';
        box.textContent = label;
        let localWeather = 'sunny'; // default fallback
        rasterTileQuery(coordinates).then((data) => {
            if (data.features.length) {
                const val = data.features[0].properties['val'];
                localWeather = getWeather(val);
                let iconUrl = getWeatherIcon(localWeather);

                if (iconUrl) {
                    const img = document.createElement('img');
                    img.src = iconUrl;
                    img.alt = label;
                    img.className = 'weather-icon';
                    box.appendChild(img);
                }
            }
        });
        box.addEventListener('click', () => {
            boxClick(coordinates, 15.5, 75, true);
        });
        panel.appendChild(box);
    });
}

const boxClick = (coordinates, zoom, pitch, rotateOnce = true) => {
    if (rotateRequestId !== null) {
        cancelAnimationFrame(rotateRequestId);
        rotateRequestId = null;
    }
    isRotating = false;
    map.flyTo({
        center: coordinates,
        zoom: zoom,
        pitch: pitch,
        bearing: 0,
        speed: 7.0,
        curve: 1,
        easing: (t) => t
    });
    if (!rotateOnce) {
        return;
    }
    map.once('moveend', () => {
        let totalRotation = 0;
        isRotating = true;
        function rotateOnce() {
            if (totalRotation >= 360) {
                isRotating = false;
                return;
            }
            const bearing = map.getBearing();
            const step = 0.1;
            map.setBearing(bearing + step);
            totalRotation += step;
            rotateRequestId = requestAnimationFrame(rotateOnce);
        }
        rotateOnce();
    });
}
window.boxClick = boxClick;

const getMinutesOffset = (value) => {
    if (value < 24) {
        return (value - 12) * 5;
    } else {
        const rawOffset = (value - 23) * 60;
        const targetTime = timeManager.getyyyyMMddHHmmSS(rawOffset);

        let adjustedTime;
        if (rawOffset > 30 && rawOffset <= 60) {
            return rawOffset;
        } else if (rawOffset > 60 && rawOffset <= 360) {
            adjustedTime = getLastHalfOrExactHour(targetTime, false);
        } else if (rawOffset > 360) {
            adjustedTime = getLastExactHour(targetTime, false);
        }

        const base = timeManager.baseDate;
        const adjusted = parseDateStringJST(adjustedTime);
        // console.log(`Adjusted time for ${value}: ${adjustedTime} (base: ${base}) (adjusted: ${adjusted})`);
        return Math.floor((adjusted - base) / 60000); // difference in minutes
    }
}

const loadMap = () => {
    map = new mapboxgl.Map({
        container: 'map',
        center: defaultCoordinates,
        //style: 'mapbox://styles/mapbox/streets-v12',
        zoom: 3.7,
        minZoom: 3,
        language: 'ja',
        scrollZoom: true,
        projection: 'mercator',
    })

    map.on('load', () => {

        //map.setConfigProperty('basemap', 'theme', 'faded');

        addThreeboxLayer(map);
        loadModel(SUNNY.name, SUNNY.size);
        loadModel(CLOUDY.name, CLOUDY.size);
        loadModel(RAINY.name, RAINY.size);

        addPrecipitationLayers(map);

    });

    map.on('moveend', () => {
        const center = map.getCenter();
        const lng = center.lng;
        const lat = center.lat;
        // Custom red marker element
        const el = document.createElement('div');
        el.style.width = '8px';
        el.style.height = '8px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = 'red';
        el.style.border = '1px solid white';

        if (window.miniMapMarker) {
            window.miniMapMarker.remove();
        }
        const zoom = map.getZoom();
        if (zoom > 5) {
            window.miniMapMarker = new mapboxgl.Marker({ element: el })
                .setLngLat([lng, lat])
                .addTo(window.miniMap);
        }

        if (zoom < 15) {
            //map.setConfigProperty('basemap', 'lightPreset', 'day');
            // const style = map.getStyle();
            // if (style && style.fog) {
            //     style.fog = {};
            //     map.setStyle(style);
            // }
            document.getElementById('geo-name').textContent = '';
            document.getElementById('geo-weather').innerHTML = '';
            clearModels();
            document.getElementById('area-panel').style.display = 'none';
            document.getElementById('legend').style.display = 'block';
            document.getElementById('precipitation-chart').style.display = 'none';
            return;
        } else {
            document.getElementById('legend').style.display = 'none';
        }
        if (!isRotating) {
            setLocalEffects(lng, lat);
        }

    });

    function cancelRotation() {
        if (rotateRequestId !== null) {
            cancelAnimationFrame(rotateRequestId);
            rotateRequestId = null;
        }
        isRotating = false;
    }

    map.on('dragstart', cancelRotation);
    map.on('mousedown', cancelRotation);
    map.on('wheel', cancelRotation);
    map.on('touchstart', cancelRotation);

    window.miniMap = new mapboxgl.Map({
        container: 'mini-map',
        style: 'mapbox://styles/kenji-shima/clnxv0r9k003b01rff933dq05',
        center: map.getCenter(),
        zoom: 1.2,
        interactive: false,
        attributionControl: false,
        projection: 'mercator',
        //language: 'ja',
    });

    window.miniMap.on('load', () => {
        const labelLayerTypes = ['symbol'];
        window.miniMap.getStyle().layers.forEach(layer => {
            if (labelLayerTypes.includes(layer.type)) {
                window.miniMap.setLayoutProperty(layer.id, 'visibility', 'none');
            }
        });
    });

    // Allow clicking the mini map to trigger boxClick with defaultCoordinates
    document.getElementById('mini-map').addEventListener('click', () => {
        if (window.miniMapMarker) {
            window.miniMapMarker.remove();
            window.miniMapMarker = null;
        }
        boxClick(defaultCoordinates, 4, 0, false);
    });
}

loadMap()

map.on('click', (e) => {
    console.log('Map clicked at:', [e.lngLat.lng, e.lngLat.lat]);
});

// Renders a precipitation bar chart using ApexCharts
function showBarChart(data) {
    let chartContainer = document.getElementById('precipitation-chart');
    chartContainer.style.display = 'block';
    // Destroy previous chart instance if present
    if (chartContainer._apexChartObj && typeof chartContainer._apexChartObj.destroy === 'function') {
        chartContainer._apexChartObj.destroy();
    }

    const categories = data.map(d => d.time);
    const options = {
        annotations: {
            xaxis: data
                .map((d, i) => d.now ? { x: d.time, borderColor: '#d00', label: { style: { color: '#d00' } } } : null)
                .filter(Boolean)
        },
        chart: {
            type: 'bar',
            height: 200
        },
        title: {
            text: '降雨量の推移',
            align: 'center',
            margin: 10,
            offsetY: 0,
            style: {
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#333'
            }
        },
        dataLabels: {
            enabled: false
        },
        series: [{
            name: '降雨量',
            data: data.map(d => d.val)
        }],
        xaxis: {
            categories: categories,
            title: {
                text: '時間'
            },
            labels: {
                rotate: -70,
                style: {
                    fontSize: '9px'
                },
                formatter: function (val, index) {
                    if (data[index] && data[index].now) {
                        // Attempt rich text style for "now" label (ApexCharts supports HTML in some cases)
                        // fallback: just return val; for advanced, could try: return '<span style="color:#d00">' + val + '</span>';
                        return val;
                    }
                    return val;
                }
            }
        },
        yaxis: {
            max: 40,
            title: {
                text: '雨量（mm）'
            }
        },
        tooltip: {
            y: {
                formatter: val => `${val} mm`
            },
        }
    };

    const chart = new ApexCharts(chartContainer, options);
    chart.render();
    chartContainer._apexChartObj = chart;
}
// Example usage:
function showPrecipitationChart(data) {
    const results = [];
    data.forEach(item => {
        const time = item.band_jstyyyyMMddHHmmSS.slice(8, 10) + ':' + item.band_jstyyyyMMddHHmmSS.slice(10, 12);
        const val = parseFloat(item.value.toFixed(2));
        const isNow = item.band_jstyyyyMMddHHmmSS === timeManager.getRefyyyyMMddHHmmSS();
        results.push({ time: time, val: val, now: isNow });
    });
    showBarChart(results)
};