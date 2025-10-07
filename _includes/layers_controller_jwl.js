const defaultzoom = 4
let zoom = defaultzoom
let particlelayerid = null
let currentprojection = 'mercator'

//const defaultStyle = 'mapbox://styles/mapbox/streets-v12'
const defaultStyle = 'mapbox://styles/kenji-shima/cmfurpm8w00j101r86qp530c8'
const firsttileset = Object.keys(tilesets)[0]
let tilesetid = firsttileset
let tileset = tilesets[firsttileset].value
let tilesettype = tilesets[firsttileset].type
let tilesetvectortype = null
let tilesetvectorsource = null
let mapstyle = tilesets[firsttileset].mapstyle || defaultStyle

let map = new mapboxgl.Map({
    container: 'map',
    //style: defaultStyle,
    style: mapstyle,
    center: [lng, lat],
    zoom: zoom,
    //maxZoom: 12,
    scrollZoom: true,
    projection: currentprojection,
    language: 'ja'
})

map.on('style.load', () => {
    map.showTileBoundaries = true
    showAllOptions()

    // map.setFog({
    //     color: 'rgba(61, 70, 79, 1)', // Lower atmosphere
    //     'high-color': 'rgb(36, 92, 223)', // Upper atmosphere
    //     'horizon-blend': 0.02, // Atmosphere thickness (default 0.2 at low zooms)
    //     'space-color': 'rgb(11, 11, 25)', // Background color
    //     'star-intensity': 0.6 // Background star brightness (default 0.35 at low zoooms )
    // })

    let popup = null;
    map.on('mousemove', async (e) => {

        if (tilesettype === 'raster-array') {
            if (!popup) {
                popup = new mapboxgl.Popup({
                    closeButton: false,
                    closeOnClick: false,
                });
            }
            try {
                const result = await map.queryRasterValue('rastersource', e.lngLat, {
                    layerName: currentLayer,
                    bands: bandlist.length > 0 ? [bandlist[lastBandIndex].toString()] : undefined
                });

                if (result && result[currentLayer][bandlist[lastBandIndex].toString()]) {
                    const value = result[currentLayer][bandlist[lastBandIndex].toString()][0];
                    popup.setLngLat(e.lngLat)
                        .setHTML(`<div><strong>Value:</strong> ${value}</div>`)
                        .addTo(map);
                } else {
                    if (popup) {
                        popup.remove();
                    }
                }
            } catch (error) {
                console.error('Error querying raster value:', error);
            }
        } else {
            if (popup) {
                popup.remove();
            }
        }

    })

})

function changeProjection(projectionType) {
    currentprojection = projectionType
    map.setProjection(projectionType)
}
window.changeProjection = changeProjection

map.on('zoom', () => {
    let zoom = map.getZoom()
    zoom = Math.round((zoom + Number.EPSILON) * 100) / 100
    document.getElementById('zoom').innerHTML = zoom
})

// map.on('movestart', (e) => {
//     if (tilesettype !== 'raster-array') {
//         return;
//     }
//     changeBand(lastBandIndex);
// });

map.on('click', (e) => {
    const coordinates = e.lngLat;
    console.log('Latitude: ' + coordinates.lat + ', Longitude: ' + coordinates.lng);
})

let sourceSetStart = 0
map.on('sourcedata', (e) => {
    // console.log('Source data event:', e);
    // console.log('currenttileset:', tileset);
    if (e.source.url !== tileset + tilesetsuffix) {
        return;
    }
    if (e.isSourceLoaded) {
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
        "rgba(50, 54, 54, 0)",
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

const snowScale = () => {
    const domain = [5, 20, 50, 100, 150, 200];
    const range = [
        "rgba(102, 255, 255, 0.8)",  // 水色 (5)
        "rgba(0, 204, 255, 0.8)",    // 明るい青 (20)
        "rgba(51, 102, 255, 0.8)",   // 青 (50)
        "rgba(255, 204, 0, 0.8)",    // 黄色 (100)
        "rgba(255, 153, 0, 0.8)",    // オレンジ (150)
        "rgba(255, 0, 0, 0.8)",      // 赤 (200)
        "rgba(183, 0, 16, 0.8)"      // 紫 (200+)
    ];
    return domain.map((v, i) => [v, range[i]]).flat();
}

const kikikuruShinsuiScale = () => {
    //const domain = [2, 3, 4, 5];
    const domain = [1.5, 2.5, 3.5, 4.5];
    const range = [
        "rgba(242, 231, 0, 1)",
        "rgba(255, 40, 0, 1)",
        "rgba(170, 0, 170, 1)",
        "rgba(12, 0, 12, 1)",
    ];
    return domain.map((v, i) => [v, range[i]]).flat();
}

const kikikuruDoshaScale = () => {
    //const domain = [4, 5, 6, 7];
    const domain = [3.5, 4.5, 5.5, 6.5];
    const range = [
        "rgba(242, 231, 0, 1)",
        "rgba(255, 40, 0, 1)",
        "rgba(170, 0, 170, 1)",
        "rgba(12, 0, 12, 1)",
    ];
    return domain.map((v, i) => [v, range[i]]).flat();
}

const rainScale = () => {
    const domain = [
        2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
        23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
        42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60,
        61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80
    ];

    const range = [
        "rgba(102, 255, 255, 0.7)",
        "rgba(68, 238, 255, 0.7)",
        "rgba(34, 221, 255, 0.71)",
        "rgba(0, 204, 255, 0.71)",
        "rgba(10, 184, 255, 0.71)",
        "rgba(20, 163, 255, 0.71)",
        "rgba(31, 143, 255, 0.72)",
        "rgba(41, 122, 255, 0.72)",
        "rgba(51, 102, 255, 0.72)",
        "rgba(71, 112, 230, 0.72)",
        "rgba(92, 122, 204, 0.73)",
        "rgba(112, 133, 178, 0.73)",
        "rgba(133, 143, 153, 0.73)",
        "rgba(153, 153, 128, 0.73)",
        "rgba(173, 163, 102, 0.74)",
        "rgba(194, 173, 76, 0.74)",
        "rgba(214, 184, 51, 0.74)",
        "rgba(235, 194, 26, 0.74)",
        "rgba(255, 204, 0, 0.75)",
        "rgba(255, 199, 0, 0.75)",
        "rgba(255, 194, 0, 0.75)",
        "rgba(255, 189, 0, 0.75)",
        "rgba(255, 184, 0, 0.76)",
        "rgba(255, 178, 0, 0.76)",
        "rgba(255, 173, 0, 0.76)",
        "rgba(255, 168, 0, 0.76)",
        "rgba(255, 163, 0, 0.77)",
        "rgba(255, 158, 0, 0.77)",
        "rgba(255, 153, 0, 0.77)",
        "rgba(255, 145, 0, 0.77)",
        "rgba(255, 138, 0, 0.78)",
        "rgba(255, 130, 0, 0.78)",
        "rgba(255, 122, 0, 0.78)",
        "rgba(255, 115, 0, 0.78)",
        "rgba(255, 107, 0, 0.79)",
        "rgba(255, 99, 0, 0.79)",
        "rgba(255, 92, 0, 0.79)",
        "rgba(255, 84, 0, 0.79)",
        "rgba(255, 76, 0, 0.8)",
        "rgba(255, 69, 0, 0.8)",
        "rgba(255, 61, 0, 0.8)",
        "rgba(255, 54, 0, 0.81)",
        "rgba(255, 46, 0, 0.81)",
        "rgba(255, 38, 0, 0.81)",
        "rgba(255, 31, 0, 0.81)",
        "rgba(255, 23, 0, 0.82)",
        "rgba(255, 15, 0, 0.82)",
        "rgba(255, 8, 0, 0.82)",
        "rgba(255, 0, 0, 0.82)",
        "rgba(253, 0, 1, 0.83)",
        "rgba(250, 0, 1, 0.83)",
        "rgba(248, 0, 2, 0.83)",
        "rgba(245, 0, 2, 0.83)",
        "rgba(243, 0, 3, 0.84)",
        "rgba(241, 0, 3, 0.84)",
        "rgba(238, 0, 4, 0.84)",
        "rgba(236, 0, 4, 0.84)",
        "rgba(233, 0, 5, 0.85)",
        "rgba(231, 0, 5, 0.85)",
        "rgba(229, 0, 6, 0.85)",
        "rgba(226, 0, 6, 0.85)",
        "rgba(224, 0, 7, 0.86)",
        "rgba(221, 0, 7, 0.86)",
        "rgba(219, 0, 8, 0.86)",
        "rgba(217, 0, 9, 0.86)",
        "rgba(214, 0, 9, 0.87)",
        "rgba(212, 0, 10, 0.87)",
        "rgba(209, 0, 10, 0.87)",
        "rgba(207, 0, 11, 0.87)",
        "rgba(205, 0, 11, 0.88)",
        "rgba(202, 0, 12, 0.88)",
        "rgba(200, 0, 12, 0.88)",
        "rgba(197, 0, 13, 0.88)",
        "rgba(195, 0, 13, 0.89)",
        "rgba(193, 0, 14, 0.89)",
        "rgba(190, 0, 14, 0.89)",
        "rgba(188, 0, 15, 0.89)",
        "rgba(185, 0, 15, 0.9)",
        "rgba(183, 0, 16, 0.9)"
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
    // 'YJRain': {
    //     manual: true,
    //     value: yjRainScale()
    // },
    'JMASediment': {
        manual: true,
        value: jmaSedimentScale()
    },
    'Rain': {
        manual: true,
        value: rainScale()
    },
    'Snow': {
        manual: true,
        value: snowScale()
    },
    'Vector': {
        manual: true,
        value: vectorScale()
    },
    'KikikuruShinsui': {
        manual: true,
        value: kikikuruShinsuiScale()
    },
    'KikikuruDosha': {
        manual: true,
        value: kikikuruDoshaScale()
    }
}

const defaultcolorscalename = 'Turbo'
let selectedcolorscalename = tilesets[firsttileset].colorscale || defaultcolorscalename
let colorscaletype = COLORSCALES[selectedcolorscalename]
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
        if (tilesetid.indexOf('alert') !== -1 || tilesetid.indexOf('landslide') !== -1) {
            document.getElementById('legend').style.display = 'none'
            document.getElementById('kikikuru-legend').style.display = 'block'
            document.getElementById('kikikuru-level-lowest').style = ''
            document.getElementById('swatch-level-lowest').style = ''
            if (tilesetid.indexOf('alert') !== -1) {
                document.getElementById('kikikuru-type').innerText = '浸水害'
            } else if (tilesetid.indexOf('landslide') !== -1) {
                document.getElementById('kikikuru-type').innerText = '土砂災害'
            }
        } else {
            document.getElementById('kikikuru-legend').style.display = 'none'
            document.getElementById('legend').style.display = 'block'
        }

        document.getElementById('map-overlay-bottom').style.display = 'block'
        showAllRasterArrayOptions()
    } else if (tilesettype === 'raster-array-particle') {
        showAllRasterArrayOptions().then(() => {
            addParticles()
            document.getElementById('raster-array-coloring-options').style.display = 'none'
            document.getElementById('legend').style.display = 'none'
            document.getElementById('map-overlay-bottom').style.display = 'none'
            document.getElementById('kikikuru-legend').style.display = 'none'
            setTimeFromTileJson()
        })

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
            } else if (tilesetvectortype === 'line' && tilesetvectorsource === 'river_flood') {
                addFloodLayer()
            } else if (tilesetvectortype === 'line') {
                addLineLayer()
            }
        }
        if (tilesetid.indexOf('flood') !== -1) {
            document.getElementById('kikikuru-legend').style.display = 'block'
            document.getElementById('kikikuru-type').innerText = '洪水'
            document.getElementById('kikikuru-level-lowest').style = 'background-color: #00FFFF;'
            document.getElementById('swatch-level-lowest').style = 'background-color: #00FFFF;'
        }
        setTimeFromTileJson()

    }
}

function setTimeFromTileJson() {
    getTilejson().then(tilejson => {
        const utcTimestamp = tilejson.description.split(':: ')[1];

        // Convert UTC yyyyMMddHHmmSS to JST yyyyMMddHHmmSS
        const jstTimestamp = utcStringToJST(utcTimestamp);

        // Format the JST timestamp into the desired format
        const year = jstTimestamp.substring(0, 4);
        const month = jstTimestamp.substring(4, 6);
        const day = jstTimestamp.substring(6, 8);
        const hour = jstTimestamp.substring(8, 10);
        const minute = jstTimestamp.substring(10, 12);

        const formattedDate = `${year}/${month}/${day}`;
        const formattedTime = `${hour}:${minute}`;

        document.getElementById('active-date').innerHTML = formattedDate;
        document.getElementById('active-time').innerHTML = formattedTime;
    })
}

async function showAllRasterArrayOptions() {
    await getCurrentBands()
    setLayerOptions()
    changeColorscaleType(selectedcolorscalename)
    // showLayer(initOption)

    const colorscaleselect = document.getElementById('colorscale-selector')
    colorscaleselect.innerHTML = ''
    for (let type in COLORSCALES) {
        const option = colorscaleselect.appendChild(document.createElement('option'))
        option.value = type
        option.innerHTML = type
        if (type === selectedcolorscalename) option.selected = true
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

    initTimeSlider(0)

}

function initTimeSlider(val) {
    const timeslider = document.getElementById('slider')
    timeslider.max = bandlist.length - 1
    timeslider.value = val

    const timediv = document.getElementById('timediv')
    timediv.innerHTML = ''
    const date = document.getElementById('active-date')
    date.innerHTML = ''
    const time = document.getElementById('active-time')
    time.innerHTML = ''

    const auto = document.getElementById('auto')

    if (bandlist.length >= 1) {
        const currentDateTime = convertTimeValue(bandlist[val]).split(" ");
        date.innerHTML = currentDateTime[0];
        time.innerHTML = currentDateTime[1];

        timeslider.disabled = false
        auto.disabled = false
        timeslider.style = 'visibility: visible;'
        let index = 0
        bandlist.forEach(datetime => {
            const datetimearray = convertTimeValue(datetime).split(" ")
            const timespan = timediv.appendChild(document.createElement('span'))
            if (index === 0 || index === bandlist.length - 1) {
                timespan.innerHTML = `${datetimearray[1]}`
            } else {
                timespan.innerHTML = `・`
            }
            // date.innerHTML = datetimearray[0] // This line was incorrect
            index++
        })
        if (bandlist.length === 1) {
            document.getElementById('map-overlay-bottom').style.display = 'none'
        }
    } else {
        timeslider.disabled = true
        timeslider.style = 'visibility: hidden;'
        if (autoFlag) play()
        auto.disabled = true
        document.getElementById('map-overlay-bottom').style.display = 'none'
    }
}

const baseDate = new Date(Date.UTC(1990, 0, 1));
function convertTimeValue(timeValue) {
    const millisecondsInDay = 24 * 60 * 60 * 1000;
    const totalMilliseconds = Math.round(timeValue * millisecondsInDay);
    const date = new Date(baseDate.getTime() + totalMilliseconds);
    const options = {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // Use 24-hour format
    };
    const formatter = new Intl.DateTimeFormat('ja-JP', options);
    const parts = formatter.formatToParts(date);
    const dateString = `${parts.find(p => p.type === 'year').value}/` +
        `${parts.find(p => p.type === 'month').value}/` +
        `${parts.find(p => p.type === 'day').value} ` +
        `${parts.find(p => p.type === 'hour').value}:` +
        `${parts.find(p => p.type === 'minute').value}`;

    return dateString;
}

async function getCurrentBands() {
    const tilejson = await getTilejson()
    currentLayer = tilejson.raster_layers[0].fields.name; // Default to the first layer if none is set
    if (currentLayer === 'wind' || currentLayer === 'winds') {
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
        }
    });
    return tilejson; // Return the data for callers who need it
}

async function getTilejson() {
    const tilesetid = tileset.split('/').slice(-1)[0];
    const tilejsonurl = `https://api.mapbox.com/v4/${tilesetid}.json?access_token=${mapboxgl.accessToken}`;
    try {
        const response = await fetch(tilejsonurl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const tilejson = await response.json();
        console.log('Tile JSON:', tilejson);
        return tilejson;
    } catch (error) {
        console.error('Error fetching tile JSON:', error);
        throw error; // Re-throw so callers can handle the error
    }
}

let lastBandIndex = 0
async function changeBand(index) {
    lastBandIndex = index
    initTimeSlider(lastBandIndex)
    map.setPaintProperty(currentLayer, 'raster-array-band', bandlist[lastBandIndex])
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

let currentStyle = mapstyle
function changeTileset(t) {
    lastBandIndex = 0
    removeAllLayers()
    tilesetid = t
    tileset = tilesets[t].value
    tilesettype = tilesets[t].type
    const newMapStyle = tilesets[t].mapstyle || defaultStyle
    layerAbove = tilesets[t].maplayer_above || layerAboveDefault
    tilesetsuffix = tilesets[t].suffix || ''
    tilesetresampling = tilesets[t].resampling || 'nearest'
    if (tilesettype === 'vector') {
        tilesetvectortype = tilesets[t].vector_layer_type
        tilesetvectorsource = tilesets[t].vector_layer_source
    }
    if (tilesets[t].zoom) {
        zoom = tilesets[t].zoom
    } else {
        zoom = defaultzoom
    }
    if (tilesets[t].colorscale) {
        selectedcolorscalename = tilesets[t].colorscale
    } else {
        selectedcolorscalename = defaultcolorscalename
    }

    // Check if the new style is different from the current one.
    if (currentStyle !== newMapStyle) {
        // If styles are different, wait for the new style to load.
        map.once('style.load', () => {
            showAllOptions()
        })
        map.setStyle(newMapStyle)
    } else {
        // If style is the same, the map is ready. Just add the new layers.
        showAllOptions()
    }
    currentStyle = newMapStyle
}
window.changeTileset = changeTileset

function changeColorscaleType(type) {
    selectedcolorscalename = type
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
const layerAboveDefault = 'road-exit-shield'
let layerAbove = layerAboveDefault
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
        },
        layerAbove
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
        layerAbove
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
        , layerAbove
    })
}

const addFloodLayer = () => {
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
        'paint': {
            'line-color': [
                'case',
                ['==', ['get', 'TYPE'], "1"],
                [
                    'interpolate',
                    ['linear'],
                    ['to-number', ['get', 'FLOODRISK']],
                    1, '#cccc00', // Darker yellow for 1
                    2, '#ff0000', // Red for 2
                    3, '#800080', // Purple for 3
                    4, '#000000', // Black for 4
                ],
                ['==', ['get', 'TYPE'], "2"],
                [
                    'interpolate',
                    ['linear'],
                    ['to-number', ['get', 'FLOODFCST']],
                    2, '#cccc00', // Darker yellow for 1
                    3, '#ff0000', // Red for 2
                    4, '#800080', // Purple for 3
                    5, '#000000', // Black for 4
                ],
                '#ADD8E6' // Default color if TYPE is not 1 or 2
            ],
            'line-width': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0,
                ['case',
                    ['==', ['get', 'TYPE'], "1"], 1,
                    ['==', ['get', 'TYPE'], "2"], 2,
                    1 // Default width if TYPE is not 1 or 2
                ],
                10,
                ['case',
                    ['==', ['get', 'TYPE'], "1"], 4,
                    ['==', ['get', 'TYPE'], "2"], 6,
                    4 // Default width if TYPE is not 1 or 2
                ],
                15,
                ['case',
                    ['==', ['get', 'TYPE'], "1"], 8,
                    ['==', ['get', 'TYPE'], "2"], 12,
                    8 // Default width if TYPE is not 1 or 2
                ]
            ],
            'line-opacity': 1.0,
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
            'raster-opacity': 1.0,
        }
    }
    map.addLayer(layer_def, layerAbove);
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
        //slot: 'bottom',
        source: 'rastersource',
        'source-layer': layerVals.layer,
        paint: {
            'raster-color-range': layerVals.color_range,
            'raster-color': getColorScale(layerVals.color_range),
            'raster-resampling': tilesetresampling,
            'raster-color-range-transition': { duration: 0 },
            'raster-opacity': 1.0,
            'raster-array-band': bandlist[0],
            'raster-emissive-strength': 1.0,
            'raster-fade-duration': 0
        },
        // minzoom: layerVals.minzoom,
        // maxzoom: layerVals.maxzoom,
    }
    console.log('Adding layer with definition:', layer_def);
    map.addLayer(layer_def, layerAbove)
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
                'raster-resampling': 'bilinear',
            },
            'minzoom': 0,
            'maxzoom': 22,
        }
        map.addLayer(particlelayer, layerAbove)
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
    // const color = [
    //     "interpolate",
    //     ["linear"],
    //     ["raster-particle-speed"],
    //     0, "rgba(0,0,0,0)",
    //     10, val
    // ]
    color = val
    map.setPaintProperty('particlelayer', 'raster-particle-color', color)
}
document.setParticleColor = setParticleColor