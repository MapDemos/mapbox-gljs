
const defaultzoom = 3
let zoom = defaultzoom
let particlelayerid = null
let currentprojection = 'mercator'
let map

const init = () => {
    particlelayerid = null
    if (map) map.remove()
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v11',
        center: [lng, lat],
        zoom: zoom,
        //maxZoom: 12,
        scrollZoom: true,
        projection: currentprojection
    })
    map.on('load', () => {
        map.showTileBoundaries = true
        setTimeout(showAllOptions, 200)
        changeProjection(currentprojection)
    })

    map.on('style.load', () => {
        map.setFog({
            color: 'rgb(186, 210, 235)', // Lower atmosphere
            'high-color': 'rgb(36, 92, 223)', // Upper atmosphere
            'horizon-blend': 0.02, // Atmosphere thickness (default 0.2 at low zooms)
            'space-color': 'rgb(11, 11, 25)', // Background color
            'star-intensity': 0.6 // Background star brightness (default 0.35 at low zoooms )
        })

        map.addSource('rastersource', {
            type: 'raster-array',
            url: tileset + tilesetsuffix
        })

    })

    map.on('zoom', () => {
        let zoom = map.getZoom()
        zoom = Math.round((zoom + Number.EPSILON) * 100) / 100
        document.getElementById('zoom').innerHTML = zoom
    })

    map.on('click', (e) => {
        const coordinates = e.lngLat;
        console.log('Latitude: ' + coordinates.lat + ', Longitude: ' + coordinates.lng);
    })
}

init()


function changeProjection(projectionType) {
    currentprojection = projectionType
    map.setProjection(projectionType)
}
window.changeProjection = changeProjection



const firsttileset = Object.keys(tilesets)[0]
let tileset = tilesets[firsttileset].value
let tilesettype = tilesets[firsttileset].type
let tilesetvectortype = null
let tilesetvectorsource = null

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
    'Cubehelix': d3.interpolateCubehelixDefault
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
    if (tilesettype === 'raster-array') {
        document.getElementById('raster-array-options').style.display = 'block'
        document.getElementById('legend').style.display = 'block'
        document.getElementById('map-overlay-bottom').style.display = 'block'
        showAllRasterArrayOptions()
    } else {
        document.getElementById('raster-array-options').style.display = 'none'
        document.getElementById('legend').style.display = 'none'
        document.getElementById('map-overlay-bottom').style.display = 'none'
        if (tilesettype === 'raster') {
            addRasterLayer()
        } else if (tilesettype === 'vector') {
            if (tilesetvectortype === 'circle') {
                addCircleLayer()
            }else if(tilesetvectortype === 'fill'){
                addFillLayer()
            }
        }
    }
}

function showAllRasterArrayOptions() {
    const source = map.getSource('rastersource')
    layers = {}
    console.log("source", source)
    source.rasterLayers.forEach(l => {
        if (l.fields.name === 'wind') {
            particlelayerid = l.fields.name
            return
        }
        const f = l.fields
        bandlist = f.bands
        layers[f.name] = {
            label: f.name,
            layer: f.name,
            color_range: f.range,
        }
        initOption = f.name
    })
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

    const timeslider = document.getElementById('slider')
    timeslider.max = bandlist.length - 1
    timeslider.value = 0

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

function changeBand(index) {
    map.setPaintProperty(currentLayer, 'raster-array-band', bandlist[index])
}
window.changeBand = changeBand

function changeTileset(t) {
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
    init()
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
    map.addSource('rastersource', {
        type: 'raster-array',
        url: tileset + tilesetsuffix
    })
    const layerVals = layers[layer]
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
        }
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

    var inputEvent = new Event("change", {
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