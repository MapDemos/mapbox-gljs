let specifiedDate = '2024-05-28'
lng = 69.3451
lat = 30.3753

let map

const loadMap = () => {
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v11',
        center: [lng, lat],
        zoom: 6,
        minZoom: 3,
        maxZoom: 12,
        scrollZoom: true
    })
    map.on('load', () => {
        createTimeArray()
        for (let time of time_array) {
            addLayer(time)
        }
        document.getElementById('slider').addEventListener('input', () => {
            sliderAction()
        })
    })
    map.on('idle', () => {
        if (slider_loaded) return
        loadSlider()
        slider_loaded = true
        sliderAction()
    })
}

loadMap()

let time_array = []
const createTimeArray = () => {
    const timediv = document.getElementById('timediv')
    timediv.innerHTML = ''
    for (let i = 23; i <= 23; i++) {
        let hour = String(i).padStart(2, '0')
        for (let j = 1; j <= 51; j = j + 10) {
            let min = String(j).padStart(2, '0')
            time_array.push(`${hour}${min}`)
            const timespan = timediv.appendChild(document.createElement('span'))
            timespan.innerHTML = `${hour}:${String(j-1).padStart(2, '0')}`
        }
    }
}

const sliderAction = () => {
    const index = document.getElementById('slider').value
    const layerband = layerbandlist[index]
    showLayer(layerband)
}

// let layer
let currentLayer
function showLayer(layer) {
    if (layer) {
        // hide previous layer
        if (currentLayer && currentLayer !== layer) {
            map.setPaintProperty(`${currentLayer}`, 'raster-opacity', 0)
        }
        map.setPaintProperty(`${layer}`, 'raster-opacity', 1)
        currentLayer = layer
    }
}

const addLayer = (time) => {
    const url = `mapbox://kenji-shima.walay-radar-20231109${time}-z4`
    map.addSource(time, {
        type: 'raster-array',
        url: url
    })
    map.addLayer({
        id: time,
        type: 'raster',
        source: time,
        paint: {
            'raster-color-range': [0, 200],
            'raster-color': [
                'step',
                ['raster-value'],
                ...colorScale()
            ],
            'raster-resampling': 'nearest',
            'raster-color-range-transition': { duration: 0 },
            'raster-opacity': 0
        }
    })
}

let slider_loaded = false

let layerbandlist = []
function loadSlider() {
    for (let time of time_array) {
        const source = map.getSource(time)
        console.log(source)
        layerbandlist.push(time)
    }
    const slider = document.getElementById('slider')
    slider.max = layerbandlist.length - 1
}

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

const colorScale = () => {
    let result = domain.map((v, i) => [v, range[i]]).flat();
    result.unshift("rgba(0, 0, 0, 0)")
    return result
}

function updateLegendBar() {
     const legendBar = document.querySelector('.legend-bar');

    legendBar.style.background = `linear-gradient(to right, ${range.join(',')})`;

    legendBar.innerHTML = ''
    domain.forEach(element => {
        const span = legendBar.appendChild(document.createElement('span'))
        span.className = 'label'
        span.style = ''
        span.innerHTML = element
    });
}

updateLegendBar()

let autoFlag = false
const autoUpdate = () => {
    if (!autoFlag) return
    const slider = document.getElementById('slider')
    let index = slider.value
    index++
    if (index > time_array.length - 1) {
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