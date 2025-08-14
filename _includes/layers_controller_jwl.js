
const defaultzoom = 3
let zoom = defaultzoom
let particlelayerid = null
let currentprojection = 'mercator'

const firsttileset = Object.keys(tilesets)[0]
let tileset = tilesets[firsttileset].value
let tilesettype = tilesets[firsttileset].type
let tilesetvectortype = null
let tilesetvectorsource = null

let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [lng, lat],
    zoom: zoom,
    //maxZoom: 12,
    scrollZoom: true,
    projection: currentprojection
})

map.on('style.load', () => {
    map.showTileBoundaries = true
    showAllOptions()

    map.setFog({
        color: 'rgba(61, 70, 79, 1)', // Lower atmosphere
        'high-color': 'rgb(36, 92, 223)', // Upper atmosphere
        'horizon-blend': 0.02, // Atmosphere thickness (default 0.2 at low zooms)
        'space-color': 'rgb(11, 11, 25)', // Background color
        'star-intensity': 0.6 // Background star brightness (default 0.35 at low zoooms )
    })

    // map.on('mouseover', (e) => {
    //     const features = map.queryRenderedFeatures(e.point, {
    //         layers: ['rastersource']
    //     });
    //     if (features.length) {
    //         const feature = features[0];
    //         const value = feature.properties['raster-value'];
    //         document.getElementById('hover').innerHTML = `Value: ${value}`;
    //     } else {
    //         document.getElementById('hover').innerHTML = '';
    //     }
    // })

})

map.on('zoom', () => {
    let zoom = map.getZoom()
    zoom = Math.round((zoom + Number.EPSILON) * 100) / 100
    document.getElementById('zoom').innerHTML = zoom
})

map.on('movestart', (e) => {
    if (tilesettype !== 'raster-array') {
        return;
    }
    changeBand(lastBandIndex);
});

map.on('click', (e) => {
    const coordinates = e.lngLat;
    console.log('Latitude: ' + coordinates.lat + ', Longitude: ' + coordinates.lng);
})

let sourceSetStart = 0
map.on('sourcedata', (e) => {
    // console.log('Source data event:', e);
    // console.log('currenttileset:', tileset);
    if(e.source.url !== tileset + tilesetsuffix) {
        return;
    }
    if(e.isSourceLoaded){
        document.getElementById('load-time').innerHTML = `<div class="title">Layer Load Time</div><div>${Date.now() - sourceSetStart} ms</div>`
        sourceSetStart = Date.now()
    }
    
})

document.getElementById('zoom-adjust').innerHTML = `<div class="title">Change Zoom</div><div><select id="zoom-selector" onchange="changeZoom(this.value)"></select></div>`
const zoomSelector = document.getElementById('zoom-selector')
for (let i = 0; i < 12; i++) {
    const option = document.createElement('option')
    option.value = i
    option.textContent = i
    zoomSelector.appendChild(option)
}
function changeZoom(value) {
    map.setZoom(value)
}



const yjRainScale = () => {
    const domain = [0, 1, 4, 8, 12, 16, 24, 32, 40, 48, 56, 64, 80, 200];
    const range = [
        "rgba(204, 255, 255, 0.0)",
        "rgba(102, 255, 255, 0.0)",
        "rgba(0, 204, 255, 0.8)",
        "rgba(0, 153, 255, 0.8)",
        "rgba(51, 102, 255, 0.8)",
        "rgba(51, 255, 0, 0.8)",
        "rgba(51, 204, 0, 0.8)",
        "rgba(25, 153, 0, 0.8)",
        "rgba(255, 255, 0, 0.8)",
        "rgba(255, 204, 0, 0.8)",
        "rgba(255, 153, 0, 0.8)",
        "rgba(255, 80, 102, 0.8)",
        "rgba(255, 0, 0, 0.8)",
        "rgba(183, 0, 16, 0.8)"
    ]
    return domain.map((v, i) => [v, range[i]]).flat();
};

const jmaSedimentScale = () => {
    const domain = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const range = [
        "rgba(0, 0, 0, 1.0)",
        "rgba(0, 0, 0, 1.0)",
        "rgba(0, 0, 0, 1.0)",
        "rgba(0, 0, 0, 1.0)",
        "rgba(242, 231, 0, 1.0)",
        "rgba(255, 40, 0, 1.0)",
        "rgba(170, 0, 170, 1.0)",
        "rgba(12, 0, 12, 1.0)",
        "rgba(0, 0, 0, 1.0)",
        "rgba(0, 0, 0, 1.0)",
        "rgba(0, 0, 0, 1.0)"
    ];

    return domain.map((v, i) => [v, range[i]]).flat();
}

const vectorScale = () => {
    const domain = [0, 1, 4, 8, 12, 16, 24, 32, 40, 48, 56, 64, 80, 200];
    const range = [
        "rgba(204, 255, 255, 0.0)",
        "rgba(102, 255, 255, 0.0)",
        "rgba(0, 204, 255, 0.0)",
        "rgba(0, 153, 255, 0.8)",
        "rgba(51, 102, 255, 0.8)",
        "rgba(51, 255, 0, 0.8)",
        "rgba(51, 204, 0, 0.8)",
        "rgba(25, 153, 0, 0.8)",
        "rgba(255, 255, 0, 0.8)",
        "rgba(255, 204, 0, 0.8)",
        "rgba(255, 153, 0, 0.8)",
        "rgba(255, 80, 102, 0.8)",
        "rgba(255, 0, 0, 0.8)",
        "rgba(183, 0, 16, 0.8)"
    ];

    return domain.map((v, i) => [v, range[i]]).flat();
}

const COLORSCALES = {
    'Turbo': d3.interpolateTurbo,
    'Spectral': x => d3.interpolateSpectral(1 - x),
    'Magma': d3.interpolateMagma,
    'Plasma': d3.interpolatePlasma,
    'Inferno': d3.interpolateInferno,
    'Greys': x => d3.interpolateGreys(1 - x),
    'Viridis': d3.interpolateViridis,
    'Cividis': d3.interpolateCividis,
    'Warm': d3.interpolateWarm,
    'Cool': d3.interpolateCool,
    'Cubehelix': d3.interpolateCubehelixDefault,
    'YJRain': {
        manual: true,
        value: yjRainScale()
    },
    'JMASediment': {
        manual: true,
        value: jmaSedimentScale()
    },
    'Vector': {
        manual: true,
        value: vectorScale()
    },
}

let selctedcolorscalename = 'Turbo'
let colorscaletype = COLORSCALES[selctedcolorscalename]
let colorsteps = 256
//let colorsteps = 8

const stepexpression = [
    'step',
    ['raster-value'],
    'rgba(0, 0, 0, 0)'
]
const interpolateexpression = [
    'interpolate',
    ['linear'],
    ['raster-value']
]

//let colorscaleExpressiontemplate = interpolateexpression
let colorscaleExpressiontemplate = stepexpression
let tilesetsuffix = ''
//let tilesetresampling = 'linear'
let tilesetresampling = 'nearest'

function getColorScale(colorRange) {
    let colorscale = null
    if (colorscaletype.manual) {
        colorscale = colorscaletype.value
    } else {
        colorscale = d3.quantize(colorscaletype, colorsteps).map((c, i) => [(i / colorsteps), c])
        const [minValue, maxValue] = colorRange;
        colorscale = colorscale.map(([x, c]) => [
            minValue + (maxValue - minValue) * x,
            c
        ])
            .flat();
    }
    const colorscaleExpression = colorscaleExpressiontemplate.slice()
    colorscale.forEach(item => {
        colorscaleExpression.push(item)
    })
    return colorscaleExpression;
}

function updateLegendBar(colorRange) {
    const increment = oneTwoFive(colorRange)
    const [minValue, maxValue] = colorRange
    let legendVals = []
    for (let i = minValue + increment; i <= maxValue; i += increment) {
        legendVals.push(i);
    }
    let colors = null
    if (colorscaletype.manual) {
        colors = colorscaletype.value
        let updateColors = []
        for (let i = 0; i < colors.length; i += 2) {
            updateColors.push([colors[i], colors[i + 1].replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/, 'rgb($1,$2,$3)')]);
        }
        colors = updateColors
    } else {
        colors = d3.quantize(colorscaletype, colorsteps).map((c, i) => [(i / colorsteps), c])
    }
    const updatedColors = colors.map(([stop, color]) => {
        if (color.startsWith('rgb(') && !color.startsWith('rgba(')) {
            color = color.replace('rgb(', 'rgba(').replace(')', ', 1)');
        }
        return [stop, color];
    });

    const minStop = Math.min(...updatedColors.map(([stop]) => stop));
    const maxStop = Math.max(...updatedColors.map(([stop]) => stop));

    // Normalize stop values between 0 and 1
    const gradientColors = updatedColors.map(([stop, color]) => {
        const normalizedStop = (stop - minStop) / (maxStop - minStop);  // Normalized to range [0, 1]
        return `${color} ${normalizedStop * 100}%`;
    }).join(', ');

    const legendBar = document.querySelector('.legend-bar');

    legendBar.style.background = `linear-gradient(to right, ${gradientColors})`;

    legendBar.innerHTML = ''
    legendVals.forEach(element => {
        const span = legendBar.appendChild(document.createElement('span'))
        span.className = 'label'
        span.style = ''
        span.innerHTML = element
    });
}

let initOption

let bandlist = []

function showAllOptions() {
    sourceSetStart = Date.now()
    if (tilesettype === 'raster-array') {
        document.getElementById('raster-array-options').style.display = 'block'
        document.getElementById('raster-array-coloring-options').style.display = 'block'
        document.getElementById('legend').style.display = 'block'
        document.getElementById('map-overlay-bottom').style.display = 'block'
        showAllRasterArrayOptions()
    } else if (tilesettype === 'raster-array-particle') {
        showAllRasterArrayOptions()
        addParticles()
        document.getElementById('raster-array-coloring-options').style.display = 'none'
        document.getElementById('legend').style.display = 'none'
        document.getElementById('map-overlay-bottom').style.display = 'none'
    } else {
        document.getElementById('raster-array-options').style.display = 'none'
        document.getElementById('legend').style.display = 'none'
        document.getElementById('map-overlay-bottom').style.display = 'none'
        if (tilesettype === 'raster') {
            addRasterLayer()
        } else if (tilesettype === 'vector') {
            if (tilesetvectortype === 'circle') {
                addCircleLayer()
            } else if (tilesetvectortype === 'fill') {
                addFillLayer()
            } else if (tilesetvectortype === 'line') {
                addLineLayer()
            }
        }
    }
}

async function showAllRasterArrayOptions() {
    // const source = map.getSource('rastersource')
    // layers = {}
    // console.log("source", source)
    // source.rasterLayers.forEach(l => {
    //     if (l.fields.name === 'wind' || l.fields.name === 'winds') {
    //         particlelayerid = l.fields.name
    //         return
    //     }
    //     const f = l.fields
    //     bandlist = f.bands
    //     layers[f.name] = {
    //         label: f.name,
    //         layer: f.name,
    //         color_range: f.range,
    //     }
    //     initOption = f.name
    // })
    await getCurrentBands()
    setLayerOptions()
    showLayer(initOption)

    const colorscaleselect = document.getElementById('colorscale-selector')
    colorscaleselect.innerHTML = ''
    for (let type in COLORSCALES) {
        const option = colorscaleselect.appendChild(document.createElement('option'))
        option.value = type
        option.innerHTML = type
        if (type === selctedcolorscalename) option.selected = true
    }

    if (particlelayerid) {
        document.getElementById('particles-options-wrapper').style.display = 'block'
    } else {
        document.getElementById('particles-options-wrapper').style.display = 'none'
    }

    const tilesetselect = document.getElementById('tileset-selector')
    tilesetselect.innerHTML = ''
    for (let tile in tilesets) {
        const option = tilesetselect.appendChild(document.createElement('option'))
        option.value = tile
        option.innerHTML = tilesets[tile].label
        if (tilesets[tile].value === tileset) option.selected = true
    }

    //initTimeSlider(0)

}

function initTimeSlider(val) {
    const timeslider = document.getElementById('slider')
    timeslider.max = bandlist.length - 1
    timeslider.value = val

    const timediv = document.getElementById('timediv')
    timediv.innerHTML = ''
    const date = document.getElementById('active-datetime')
    date.innerHTML = ''

    const auto = document.getElementById('auto')

    if (bandlist.length > 1) {
        timeslider.disabled = false
        auto.disabled = false
        bandlist.forEach(datetime => {
            const datetimearray = convertTimeValue(datetime).split(" ")
            const timespan = timediv.appendChild(document.createElement('span'))
            timespan.innerHTML = `${datetimearray[1]}`
            date.innerHTML = datetimearray[0]
        })
    } else {
        timeslider.disabled = true
        if (autoFlag) play()
        auto.disabled = true
    }
}

const baseDate = new Date(Date.UTC(1990, 0, 1));
function convertTimeValue(timeValue) {
    const millisecondsInDay = 24 * 60 * 60 * 1000;
    const totalMilliseconds = Math.round(timeValue * millisecondsInDay);
    const date = new Date(baseDate.getTime() + totalMilliseconds);
    const options = {
        timeZone: 'Australia/Sydney',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // Use 24-hour format
    };
    const formatter = new Intl.DateTimeFormat('en-GB', options);
    const parts = formatter.formatToParts(date);
    const dateString = `${parts.find(p => p.type === 'year').value}/` +
        `${parts.find(p => p.type === 'month').value}/` +
        `${parts.find(p => p.type === 'day').value} ` +
        `${parts.find(p => p.type === 'hour').value}:` +
        `${parts.find(p => p.type === 'minute').value}`;

    return dateString;
}

async function getCurrentBands() {
    const tilesetid = tileset.split('/').slice(-1)[0];
    const tilejsonurl = `https://api.mapbox.com/v4/${tilesetid}.json?access_token=${mapboxgl.accessToken}`;
    try {
        const response = await fetch(tilejsonurl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tilejson = await response.json();
        console.log('Tile JSON:', tilejson);
        currentLayer = tilejson.raster_layers[0].fields.name; // Default to the first layer if none is set
        // console.log('Current layer:', currentLayer);
        if(currentLayer === 'wind' || currentLayer === 'winds') {
            particlelayerid = currentLayer;
            return tilejson
        }
        tilejson.raster_layers.forEach(layer => {
            if (layer.id === currentLayer) {
                bandlist = layer.fields.bands;
                initTimeSlider(lastBandIndex);
                initOption = layer.fields.name;
                currentLayer = layer.fields.name;

                layers[layer.fields.name] = {
                    label: layer.fields.name,
                    layer: layer.fields.name,
                    color_range: layer.fields.range,
                    minzoom: tilejson.minzoom,
                    maxzoom: tilejson.maxzoom,
                }
                //map.setPaintProperty(currentLayer, 'raster-array-band', bandlist[lastBandIndex])
            }
        });
        return tilejson; // Return the data for callers who need it
    } catch (error) {
        console.error('Error fetching tile JSON:', error);
        throw error; // Re-throw so callers can handle the error
    }
}

let lastChangeBandTime = 0
let lastBandIndex = 0
async function changeBand(index) {
    lastBandIndex = index
    const now = Date.now();
    if (now - lastChangeBandTime > 60000) {
        await getCurrentBands(index);
        initTimeSlider(lastBandIndex)
    }
    map.setPaintProperty(currentLayer, 'raster-array-band', bandlist[lastBandIndex])
    lastChangeBandTime = Date.now();
}
window.changeBand = changeBand

function removeAllLayers() {
    // Remove all raster array layers
    for (let l in layers) {
        if (map.getLayer(l)) {
            map.removeLayer(l)
        }
    }

    // Remove common layer types
    const commonLayers = ['vector', 'raster', 'particlelayer']
    commonLayers.forEach(layerId => {
        if (map.getLayer(layerId)) {
            map.removeLayer(layerId)
        }
    })

    // Remove particles
    removeParticles()

    // Remove all sources
    const commonSources = ['rastersource', 'vectorsource', 'particlesource']
    commonSources.forEach(sourceId => {
        if (map.getSource(sourceId)) {
            map.removeSource(sourceId)
        }
    })

    // Reset layers object
    layers = {}

    // Reset layer-related variables
    particlelayerid = null
    bandlist = []
    initOption = null
    currentLayer = null
}

function changeTileset(t) {
    removeAllLayers()
    tileset = tilesets[t].value
    tilesettype = tilesets[t].type
    if (tilesettype === 'vector') {
        tilesetvectortype = tilesets[t].vector_layer_type
        tilesetvectorsource = tilesets[t].vector_layer_source
    }
    if (tilesets[t].zoom) {
        zoom = tilesets[t].zoom
    } else {
        zoom = defaultzoom
    }
    showAllOptions()
    // init()
}
window.changeTileset = changeTileset

function changeColorscaleType(type) {
    selctedcolorscalename = type
    colorscaletype = COLORSCALES[type]
    showLayer(currentLayer)
}
window.changeColorscaleType = changeColorscaleType

function changeColorSteps(steps) {
    colorsteps = steps
    showLayer(currentLayer)
}
window.changeColorSteps = changeColorSteps

function oneTwoFive(range, maxSteps = 15) {
    const rng = range[1] - range[0];
    const oneSize = 1 * Math.pow(10, Math.round(Math.log10(rng / 1 / maxSteps)));
    const twoSize = 2 * Math.pow(10, Math.round(Math.log10(rng / 2 / maxSteps)));
    const fiveSize = 5 * Math.pow(10, Math.round(Math.log10(rng / 5 / maxSteps)));
    const oneSteps = Math.floor(rng / oneSize);
    const twoSteps = Math.floor(rng / twoSize);
    const fiveSteps = Math.floor(rng / fiveSize);

    if (oneSteps < twoSteps) return oneSteps < fiveSteps ? oneSize : fiveSize;
    return twoSteps < fiveSteps ? twoSize : fiveSize;
}

let layers = {
}

function setLayerOptions() {
    const select = document.getElementById('layer-selector')
    select.innerHTML = ''
    for (let l in layers) {
        const option = select.appendChild(document.createElement('option'))
        option.value = l
        option.innerHTML = l
        if (l === initOption) {
            option.selected = true
        }
    }
    document.getElementById('layer-selector').addEventListener('change', function () {
        showLayer(this.value);
    })
}

let currentLayer = initOption
const showLayer = (layer) => {
    currentLayer = layer
    for (let l in layers) {
        if (map.getLayer(l)) {
            map.removeLayer(l)
        }
    }
    removeParticles()
    if (map.getSource("rastersource")) {
        map.removeSource("rastersource")
    }
    if (tilesettype === 'raster-array') {
        addRasterArrayLayer(layer)
    }
}
document.showLayer = showLayer

const addCircleLayer = () => {
    if (map.getLayer('vector')) {
        map.removeLayer('vector')
    }
    if (map.getSource("vectorsource")) {
        map.removeSource("vectorsource")
    }
    map.addSource('vectorsource', {
        type: 'vector',
        url: tileset
    })
    map.addLayer({
        id: 'vector',
        type: 'circle',
        source: 'vectorsource',
        'source-layer': tilesetvectorsource,
        paint: {
            'circle-radius': 5,
            'circle-color': 'rgba(255, 0, 0, 1)',
            'circle-stroke-width': 1,
            'circle-stroke-color': 'rgba(0, 0, 0, 1)'
        }
    })
}

const addFillLayer = () => {
    if (map.getLayer('vector')) {
        map.removeLayer('vector')
    }
    if (map.getSource("vectorsource")) {
        map.removeSource("vectorsource")
    }
    map.addSource('vectorsource', {
        type: 'vector',
        url: tileset
    })
    map.addLayer({
        id: 'vector',
        type: 'fill',
        source: 'vectorsource',
        'source-layer': tilesetvectorsource,
        paint: {
            'fill-color': 'rgba(255, 0, 0, 0.5)',
            'fill-outline-color': 'rgba(0, 0, 0, 1)'
        },
    })
}

const addLineLayer = () => {
    if (map.getLayer('vector')) {
        map.removeLayer('vector')
    }
    if (map.getSource("vectorsource")) {
        map.removeSource("vectorsource")
    }
    map.addSource('vectorsource', {
        type: 'vector',
        url: tileset
    })
    map.addLayer({
        id: 'vector',
        type: 'line',
        source: 'vectorsource',
        'source-layer': tilesetvectorsource,
        paint: {
            'line-color': 'rgba(255, 0, 0, 1)',
            'line-width': 2
        }
    })
}

const addRasterLayer = () => {
    if (map.getLayer('raster')) {
        map.removeLayer('raster')
    }
    if (map.getSource("rastersource")) {
        map.removeSource("rastersource")
    }
    map.addSource('rastersource', {
        type: 'raster',
        url: tileset
    })
    const layer_def = {
        id: 'raster',
        type: 'raster',
        source: 'rastersource',
        paint: {
            'raster-opacity': 0.8,
        }
    }
    map.addLayer(layer_def)
}

const addRasterArrayLayer = (layer) => {
    // console.log('Adding raster array source:', tileset + tilesetsuffix);
    map.addSource('rastersource', {
        type: 'raster-array',
        url: tileset + tilesetsuffix
    })
    const layerVals = layers[layer]
    // console.log('Layer values:', layerVals);
    const layer_def = {
        id: layer,
        type: 'raster',
        slot: 'bottom',
        source: 'rastersource',
        'source-layer': layerVals.layer,
        paint: {
            'raster-color-range': layerVals.color_range,
            'raster-color': getColorScale(layerVals.color_range),
            'raster-resampling': tilesetresampling,
            'raster-color-range-transition': { duration: 0 },
            'raster-opacity': 0.8,
            'raster-array-band': bandlist[0],
        },
        // minzoom: layerVals.minzoom,
        // maxzoom: layerVals.maxzoom,
    }
    map.addLayer(layer_def)
    const element = document.getElementById(layer)
    updateLegendBar(layerVals.color_range)

    addParticles()
}

const removeParticles = () => {
    if (map.getLayer('particlelayer')) {
        map.removeLayer('particlelayer')
    }
    if (map.getSource('particlesource')) {
        map.removeSource('particlesource')
    }
}

const addParticles = () => {
    // console.log('Adding particles for layer:', particlelayerid);
    if (particlelayerid) {
        const particlesource = {
            id: 'particlesource',
            type: 'raster-array',
            url: tileset
        }
        map.addSource('particlesource', particlesource)
        const particlelayer = {
            'id': 'particlelayer',
            'type': 'raster-particle',
            'source': 'particlesource',
            'source-layer': particlelayerid,
            'slot': 'top',
            'layout': {},
            'paint': {
                'raster-particle-max-speed': 10,
                'raster-particle-fade-opacity-factor': 0.90,
                'raster-particle-reset-rate-factor': 0.4,
            }
        }
        map.addLayer(particlelayer)
        let particleCount = 1000
        document.getElementById('particle-count-slider').value = particleCount
        setParticleCount(particleCount)

        let particleSpeed = 0.08
        document.getElementById('particle-speed-slider').value = particleSpeed
        setParticleSpeed(particleSpeed)

        let particleColor = '#ffffff'
        document.getElementById('particle-color').value = particleColor
        setParticleColor(particleColor)
    }
}

function showWind(elem) {
    if (elem.checked) {
        document.getElementById('particle-options').style.display = 'block'
        addParticles()
    } else {
        document.getElementById('particle-options').style.display = 'none'
        removeParticles()
    }
}
document.showWind = showWind

let autoFlag = false
const autoUpdate = () => {
    if (!autoFlag) return
    const slider = document.getElementById('slider')
    let index = slider.value
    index++
    if (index > bandlist.length - 1) {
        index = 0
    }
    slider.value = index

    var inputEvent = new Event("input", {
        bubbles: true,
        cancelable: true
    })

    slider.dispatchEvent(inputEvent)

    setTimeout(autoUpdate, 1000)
}

function play() {
    const auto = document.getElementById('auto')
    if (auto.innerHTML === 'Play') {
        autoFlag = true
        autoUpdate()
        auto.innerHTML = 'Stop'
        auto.style.backgroundColor = '#f44336'
    } else {
        autoFlag = false
        auto.innerHTML = 'Play'
        auto.style.backgroundColor = '#4CAF50'
    }
}
window.play = play

const setParticleCount = (val) => {
    document.getElementById('particle-count').innerHTML = val
    map.setPaintProperty('particlelayer', 'raster-particle-count', Number(val))
}
document.setParticleCount = setParticleCount

const setParticleSpeed = (val) => {
    document.getElementById('particle-speed').innerHTML = val
    map.setPaintProperty('particlelayer', 'raster-particle-speed-factor', Number(val))
}
document.setParticleSpeed = setParticleSpeed

const setParticleColor = (val) => {
    const color = [
        "interpolate",
        ["linear"],
        ["raster-particle-speed"],
        0, "rgba(0,0,0,0)",
        10, val
    ]
    map.setPaintProperty('particlelayer', 'raster-particle-color', color)
}
document.setParticleColor = setParticleColor