let vehicles = {}
let dropoffs = {}

lng = -73.938866;
lat = 40.623977;

const optimization_v2 = 'https://api.mapbox.com/optimized-trips/v2'
const search_forward = 'https://api.mapbox.com/search/v1/forward/'
function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}
async function fetchJson(file) {
    const query = await fetch(file, { method: 'GET' });
    return await query.json();
}
async function postJson(url, data) {
    const query = fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    return (await query).json()
}

function checkGeocodeStatus() {
    if (waiting_geocodes === geocodedCount) {
        removeLoading()
    }else{
        setTimeout(checkGeocodeStatus, 500)
    }
}

let geocodedCount = 0
let waiting_geocodes = 1
async function createData(filename) {
    dispLoading()
    geocodedCount = 0
    checkGeocodeStatus()
    const data = eval(`obj_${filename}`)
    dropoffs = {
        [filename]: data.map((row) => ({
            id: `id-${row.id}`,
            ADDRESS_ID: `address-${row.id}`,
            ADDRESS: `${row.address},${row.city},${row.state}`,
            INVOICE_NUMBER: `id-${row.id}`,
            CORRECTED_STAY_TIME: "0:00:00",
            SPECIFIED_ST: "",
            SPECIFIED_ET: "",
        })),
    };

    vehicles = {
        [filename]: {
            profile: "driving",
            ADDRESS: dropoffs[filename][0].ADDRESS,
        }
    }
    waiting_geocodes = Object.values(dropoffs).flat().length + Object.values(vehicles).flat().length
}
let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [lng, lat],
    zoom: 12,
})

const doOnLoad = () => {
    aggregateByAddress()
    appendAllVehiclesFromData()
    map.addSource('shipments-source', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: [],
        }
    })
    map.addLayer({
        id: 'shipments-layer',
        type: 'line',
        source: 'shipments-source',
        paint: {
            'line-color': 'black',
            'line-width': 15
        }
    })
    map.addLayer({
        id: 'arrows',
        type: 'symbol',
        source: 'shipments-source',
        layout: {
            'symbol-placement': 'line',
            'text-field': '>', // Use a Unicode arrow character as the text
            'text-size': 64,
            'text-rotation-alignment': 'map',
            'text-rotate': ['get', 'bearing'],
            'text-keep-upright': false
        },
        paint: {
            'text-color': '#000000',
            'text-halo-color': '#FFFFFF',
            'text-halo-width': 5
        }
    })
    map.on('click', 'shipments-layer', (e) => {
        if (!isInMode()) return
        const modal = document.getElementById('shipment-modal');
        const pixelPosition = map.project(e.lngLat);
        modal.style.top = pixelPosition.y + 'px';
        modal.style.left = pixelPosition.x + 'px';
        modal.style.display = 'block';

        const features = map.queryRenderedFeatures(e.point, { layers: ['shipments-layer'] });
        if (features.length > 0) {
            const clickedFeature = features[0]
            recoverShipment(clickedFeature)
        }
    })
}

const loadFile = async (file) => {
    if (file === '') return
    document.getElementById('vehicles').innerHTML = ''
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v11',
        center: [lng, lat],
        zoom: 12,
    })
    await createData(`${file}`)
    const promises = forwardSearchAllDropoffs()
    Promise.all(promises).then(() => {
        doOnLoad()
    })
}
window.loadFile = loadFile

map.on('load', async () => {
})
let solution_request = {
    "version": 1,
    "locations": [],
    "vehicles": [],
    //"services" : [],
    "shipments": []
}

let solutionCalcStart
let solutionDuration
window.calculateSolution = () => {

    dispLoading()
    removeDirectionsLayers()
    hideTextMarkers()
    textMarkerList = []
    solution_request.shipments = []
    solution_request.locations = []
    const shipmentFeatures = map.getSource('shipments-source')._data.features
    if (shipmentFeatures.length == 0) {
        removeLoading()
        alert('配送設定が不足してます。')
        return
    }
    const radio = document.getElementById('radio-two')
    radio.click()
    radio.disabled = true
    document.getElementById('radio-one').disabled = true
    let countUp = 0
    shipmentFeatures.forEach(feature => {
        const shipment = {
            //name: `${feature.properties.from}-${feature.properties.to}`,
            name: countUp + "",
            from: feature.properties.from,
            to: feature.properties.to,
        }
        countUp++
        if (feature.properties.pickup_starttime !== '' && feature.properties.pickup_endtime !== '') {
            const pickup_times = [
                {
                    earliest: getFullTime(feature.properties.pickup_starttime),
                    latest: getFullTime(feature.properties.pickup_endtime),
                    type: "strict"
                }
            ]
            shipment["pickup_times"] = pickup_times
        }
        if (feature.properties.dropoff_starttime !== '' && feature.properties.dropoff_endtime !== '') {
            const dropoff_times = [
                {
                    earliest: getFullTime(feature.properties.dropoff_starttime),
                    latest: getFullTime(feature.properties.dropoff_endtime),
                    type: "strict"
                }
            ]
            shipment["dropoff_times"] = dropoff_times
        }
        if (feature.properties.pickup_duration !== '') shipment['pickup_duration'] = parseInt(feature.properties.pickup_duration)
        if (feature.properties.dropoff_duration !== '') shipment['dropoff_duration'] = parseInt(feature.properties.dropoff_duration)
        if (feature.properties.item_count !== '') shipment['size'] = { boxes: parseInt(feature.properties.item_count) }
        if (feature.properties.requirements !== '') shipment['requirements'] = [feature.properties.requirements]

        solution_request.shipments.push(shipment)

        let isFromSet = false
        let isToSet = false
        solution_request.locations.forEach(location => {
            if (location.name === feature.properties.from) isFromSet = true
            if (location.name === feature.properties.to) isToSet = true
        })
        if (!isFromSet) solution_request.locations.push({ name: feature.properties.from, coordinates: feature.geometry.coordinates[0] })
        if (!isToSet) solution_request.locations.push({ name: feature.properties.to, coordinates: feature.geometry.coordinates[1] })
    })

    cleanSolutionRequest()

    solutionCalcStart = Date.now()

    if (document.getElementById('type-address').checked) {
        postOptimizationWithForwardSearch()
        return
    } else {
        postOptimization()
    }
}

function postOptimizationWithForwardSearch() {
    const promises = forwardSearchAll()
    Promise.all(promises).then(() => {
        postOptimization()
    })
}

function postOptimization() {
    console.log(solution_request)
    postJson(`${optimization_v2}?access_token=${mapboxgl.accessToken}`, solution_request).then(json => {
        if (json.code === "validation_error") {
            removeLoading()
            alert(json.message)
            document.getElementById('radio-two').disabled = false
            document.getElementById('radio-one').disabled = false
            return
        } else {
            if (json.status === "ok") {
                processOptimization(json.id)
            }
        }
    })
}

function forwardSearchAll() {
    let promises = []
    let searchLimit = 10
    let i = 0

    function loopIteration() {
        for (let iter = 0; iter < searchLimit; iter++) {
            if (i < solution_request.locations.length) {
                const loc = solution_request.locations[i]
                if (loc.name != solution_request.vehicles[0].name) {
                    const address = getData(solution_request.vehicles[0].name, loc.name).ADDRESS
                    delete loc.coordinates
                    const data = getData(solution_request.vehicles[0].name, loc.name)
                    data.FORWARD_ST = Date.now()
                    const p = forwardSearch(i, address, data)
                    promises.push(p)
                    //console.log(getCurrentTime())
                }
                i++
            } else {
                return
            }
        }

        if (i < solution_request.locations.length) {
            setTimeout(loopIteration, 1000)
        }
    }

    loopIteration()
    return promises
}

function forwardSearchAllDropoffs() {
    let promises = []
    let searchLimit = 80
    let i = 0

    let dropoffEntries = Object.values(dropoffs).flat();

    function loopIteration() {
        for (let iter = 0; iter < searchLimit; iter++) {
            if (i < dropoffEntries.length) {
                dropoffEntries[i].FORWARD_ST = Date.now()
                const p = forwardSearchDataAddress(dropoffEntries[i])
                promises.push(p)
                i++
            } else {
                return
            }
        }

        if (i < dropoffEntries.length) {
            setTimeout(loopIteration, 1000)
        }
    }

    loopIteration()
    return promises
}

function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

function cleanSolutionRequest() {
    solution_request.shipments.forEach(shipment => {
        clearBlankProperties(shipment)
    })
    solution_request.vehicles.forEach(vehicle => {
        clearBlankProperties(vehicle)
    })
}

function clearBlankProperties(obj) {
    for (let key in obj) {
        if (obj.hasOwnProperty(key) && obj[key] === '') {
            delete obj[key];
        }
    }
}

function processOptimization(id) {
    fetchJson(`${optimization_v2}/${id}?access_token=${mapboxgl.accessToken}`).then(json => {

        if (json.status === "processing") {
            setTimeout(() => {
                processOptimization(id)
            }, 10)
        } else {
            if (json.code === "validation_error") {
                removeLoading()
                alert(json.message)
                document.getElementById('radio-two').disabled = false
                document.getElementById('radio-one').disabled = false
                return
            }
            if (json.code === "unsolvable" || json.code === "no_solution") {
                removeLoading()
                alert(json.message)
                document.getElementById('radio-two').disabled = false
                document.getElementById('radio-one').disabled = false
                return
            }
            console.log(json)
            const now = Date.now()
            solutionDuration = now - solutionCalcStart
            json.routes.forEach(route => {
                makeDirectionsRequest(route)

                hideMarkers()

                const info = document.getElementById('result-info-table')
                info.innerHTML = `<tr><th>vehicle</th><th>vehicle address</th><th>lat</th><th>lng</th><th>optimization calc time(ms)</th><th>navigation calc time(ms)</th></tr>`

                const vehicleInfo = vehicles[route.vehicle]
                const infoTr = info.appendChild(document.createElement('tr'))
                const vehicle = infoTr.appendChild(document.createElement('td'))
                vehicle.innerHTML = route.vehicle

                const infoAddress = infoTr.appendChild(document.createElement('td'))
                infoAddress.innerHTML = vehicleInfo.ADDRESS

                const infoLat = infoTr.appendChild(document.createElement('td'))
                infoLat.innerHTML = vehicleInfo.LATITUDE

                const infoLng = infoTr.appendChild(document.createElement('td'))
                infoLng.innerHTML = vehicleInfo.LONGITUDE

                // const prospect = infoTr.appendChild(document.createElement('td'))
                // prospect.innerHTML = vehicleInfo.PROSPECT

                const optTime = infoTr.appendChild(document.createElement('td'))
                optTime.innerHTML = solutionDuration

                const dirTime = infoTr.appendChild(document.createElement('td'))
                dirTime.id = 'directions-duration'

                const table = document.getElementById('result-table')
                let forwardAddTh = ''
                if (document.getElementById('type-address').checked) {
                    forwardAddTh = `<th>LATITUDE2</th><th>LONGITUDE2</th><th>MATCH_TIME</th>`
                }
                table.innerHTML = `<tr><th>NO</th><th>NAME</th><th>ADDRESS</th><th>LATITUDE</th><th>LONGITUDE</th><th>ADDRESS_ID</th><th>SPECIFIED_ST</th><th>SPECIFIED_ET</th><th>STAY_TIME</th>${forwardAddTh}<th>ARRIVAL_TIME</th></tr>`
                let textMarkerCount = 1
                route.stops.forEach(stop => {
                    if (stop.type == 'dropoff') {
                        const dropoff = getData(route.vehicle, stop.location)
                        addResultRow(route.vehicle, stop, stop.location, dropoff, table, textMarkerCount)
                        textMarkerCount = textMarkerCount + 1
                        const missingList = getAggregatedInvoices(route.vehicle, dropoff.ADDRESS_ID, stop.location)
                        missingList.forEach(invoice => {
                            addResultRow(route.vehicle, stop, invoice, dropoff, table, textMarkerCount)
                            textMarkerCount = textMarkerCount + 1
                        })
                    } else if (stop.type != 'start') {
                        clickedCoordinates = stop.location_metadata.supplied_coordinate
                        addTextMarker('始', route.vehicle)
                        const tr = table.appendChild(document.createElement('tr'))
                        const num = tr.appendChild(document.createElement('th'))
                        num.innerHTML = '-'

                        const invoice = tr.appendChild(document.createElement('td'))
                        invoice.innerHTML = stop.location

                        for (let i = 0; i < 5; i++) {
                            const td = tr.appendChild(document.createElement('td'))
                            td.innerHTML = '-'
                        }

                        if (document.getElementById('type-address').checked) {
                            for (let i = 0; i < 5; i++) {
                                const td = tr.appendChild(document.createElement('td'))
                                td.innerHTML = '-'
                            }
                        }

                        const eta = tr.appendChild(document.createElement('td'))
                        eta.innerHTML = stop.eta.substring(stop.eta.indexOf('T') + 1, stop.eta.length - 1)
                    }
                })
            })

        }

    })
}

const addResultRow = (vehicle, stop, invoice, dropoff, table, textMarkerCount) => {
    //const dropoff = getData(vehicle, invoice)
    //clickedCoordinates = stop.location_metadata.supplied_coordinate
    if (document.getElementById('type-address').checked) {
        clickedCoordinates = dropoff.FORWARD_COORDINATES
    } else {
        clickedCoordinates = [dropoff.LONGITUDE, dropoff.LATITUDE]
    }
    addTextMarker(textMarkerCount, invoice)
    const tr = table.appendChild(document.createElement('tr'))
    const num = tr.appendChild(document.createElement('th'))
    num.innerHTML = textMarkerCount

    const invoiceTd = tr.appendChild(document.createElement('td'))
    invoiceTd.innerHTML = invoice

    const address = tr.appendChild(document.createElement('td'))
    address.innerHTML = dropoff.ADDRESS

    const lat = tr.appendChild(document.createElement('td'))
    lat.innerHTML = dropoff.LATITUDE

    const lng = tr.appendChild(document.createElement('td'))
    lng.innerHTML = dropoff.LONGITUDE

    // const matchLevel = tr.appendChild(document.createElement('td'))
    // matchLevel.innerHTML = dropoff.MATCHING_LEVEL

    const addressId = tr.appendChild(document.createElement('td'))
    addressId.innerHTML = dropoff.ADDRESS_ID

    const specifedStart = tr.appendChild(document.createElement('td'))
    specifedStart.innerHTML = dropoff.SPECIFIED_ST

    const specifedEnd = tr.appendChild(document.createElement('td'))
    specifedEnd.innerHTML = dropoff.SPECIFIED_ET

    const correctedStayTime = tr.appendChild(document.createElement('td'))
    correctedStayTime.innerHTML = dropoff.CORRECTED_STAY_TIME

    if (document.getElementById('type-address').checked) {
        const lat2 = tr.appendChild(document.createElement('td'))
        lat2.innerHTML = dropoff.FORWARD_COORDINATES[1]

        const lng2 = tr.appendChild(document.createElement('td'))
        lng2.innerHTML = dropoff.FORWARD_COORDINATES[0]

        // const matchLevel2 = tr.appendChild(document.createElement('td'))
        // matchLevel2.innerHTML = getMatchingLevel(invoice).matching_level

        // const matchAddress = tr.appendChild(document.createElement('td'))
        // matchAddress.innerHTML = dropoff.FORWARD_MATCH_ADDRESS

        const matchTime = tr.appendChild(document.createElement('td'))
        matchTime.innerHTML = dropoff.FORWARD_ET - dropoff.FORWARD_ST
    }

    const eta = tr.appendChild(document.createElement('td'))
    eta.innerHTML = stop.eta.substring(stop.eta.indexOf('T') + 1, stop.eta.length - 1)

}

const getMatchingLevel = (invoice) => {
    // for (const record of matching_levels.list) {
    //     if (record.INVOICE_NUMBER == invoice) {
    //         return record
    //     }
    // }
    return ""
}

const getData = (vehicle, invoice) => {
    const vechicleDropoffs = dropoffs[vehicle]
    for (const dropoff of vechicleDropoffs) {
        if (dropoff.INVOICE_NUMBER == invoice) {
            return dropoff
        }
    }
    return ""
}

const getDropoffDuration = (dropoff) => {
    const time = dropoff.CORRECTED_STAY_TIME.split(':')
    const seconds = parseInt(time[0]) * 360 + parseInt(time[1]) * 60 + parseInt(time[2])
    return seconds
}

let directions_result
let directionsLayers = []
let directionsSources = []
let motorwayCheckDone = false
function makeDirectionsRequest(route) {
    const stops = route.stops
    const color = getRandomColor()
    const uuid = uuidv4()
    let coordlist = ""
    let excludeMotorway = ""
    for (let i in stops) {
        const metadata = stops[i].location_metadata
        if (coordlist !== "") {
            coordlist += ";"
            excludeMotorway += ";"
        }
        //coordlist += metadata.snapped_coordinate
        coordlist += metadata.supplied_coordinate
        excludeMotorway += "motorway"
    }
    const directionsStartTime = Date.now()
    console.log(`${directions_uri}driving/${coordlist}?access_token=${mapboxgl.accessToken}&geometries=polyline6&overview=full&steps=true&annotations=speed,speed_source&exclude=motorway,toll&language=ja&snapping_excludes=${excludeMotorway}`)
    fetchJson(`${directions_uri}driving/${coordlist}?access_token=${mapboxgl.accessToken}&geometries=polyline6&overview=full&steps=true&annotations=speed,speed_source&exclude=motorway,toll&language=ja&snapping_excludes=${excludeMotorway}`).then(json => {
        const directionsDuration = Date.now() - directionsStartTime
        console.log(json)
        directions_result = json
        document.getElementById('directions-duration').innerHTML = directionsDuration
        if (map.getLayer('directions-layer')) map.removeLayer('directions-layer')
        if (map.getLayer('directions-arrows')) map.removeLayer('directions-arrows')
        if (map.getSource('directions-source')) map.removeSource('directions-source')

        map.addSource(`directions-source-${uuid}`, {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: polyline.toGeoJSON(json.routes[0].geometry, 6)
            }
        })
        directionsSources.push(`directions-source-${uuid}`)

        map.addLayer({
            id: `directions-layer-${uuid}`,
            type: 'line',
            source: `directions-source-${uuid}`,
            paint: {
                'line-color': color,
                'line-width': 5
            }
        })
        directionsLayers.push(`directions-layer-${uuid}`)

        map.addLayer({
            id: `directions-arrows-${uuid}`,
            type: 'symbol',
            source: `directions-source-${uuid}`,
            layout: {
                'symbol-placement': 'line',
                'text-field': '>', // Use a Unicode arrow character as the text
                'text-size': 32,
                'text-rotation-alignment': 'map',
                'text-rotate': ['get', 'bearing'],
                'text-keep-upright': false
            },
            paint: {
                'text-color': color,
                'text-halo-color': '#FFFFFF',
                'text-halo-width': 5
            }
        })
        directionsLayers.push(`directions-arrows-${uuid}`)

        document.getElementById('radio-two').disabled = false
        document.getElementById('radio-one').disabled = false
        removeLoading()
        if (!motorwayCheckDone) {
            motorwayCheck()
        }
    })
}

let hasMotorway = false
function motorwayCheck() {
    motorwayCheckDone = true
    let promises = []
    hasMotorway = false
    directions_result.routes[0].legs.forEach(leg => {
        leg.steps.forEach(step => {
            if (step.maneuver.type == "arrive") {
                map.queryRenderedFeatures()
                const c = step.maneuver.location
                const p = fetchJson(`https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/${c[0]},${c[1]}.json?radius=100&limit=50&layers=road&access_token=${mapboxgl.accessToken}`).then(roads => {
                    if (roads.features[0] && roads.features[0].properties.toll == 'true') {
                        clickedCoordinates = c
                        const textMarker = addTextMarker('注', 'ここ高速！')
                        textMarker.style = 'background:red;'
                        const p2 = getClosestPoint(c)
                        hasMotorway = true
                        promises.push(p2)
                    }
                })
                promises.push(p)

            }
        })
    })
    Promise.all(promises).then(() => {
        if (!hasMotorway) {
            return
        }
        const div = document.getElementById('do-again')
        const a = div.appendChild(document.createElement('a'))
        a.innerHTML = '高速道路通過！下車ポイントを変更して再実行'
        a.style = 'color:red'
        a.onclick = function () {
            dispLoading()
            removeDirectionsLayers()
            hideTextMarkers()
            textMarkerList = []
            cleanSolutionRequest()
            div.innerHTML = ''

            if (document.getElementById('type-address').checked) {
                postOptimizationWithForwardSearch()
                return
            } else {
                postOptimization()
            }

            hasMotorway = false
            motorwayCheckDone = false
        }
    })
}

function getClosestPoint(coordinates) {
    var point1 = {
        "type": "Feature",
        "properties": {},
        "geometry": {
            "type": "Point",
            "coordinates": coordinates
        }
    }

    const drops = dropoffs[solution_request.vehicles[0].name]
    let closestDrop
    let distance = 99999
    drops.forEach(drop => {
        const point2 = {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Point",
                "coordinates": [drop.LONGITUDE, drop.LATITUDE]
            }
        }
        const pointDistance = turf.distance(point1, point2, 'meters')
        if (pointDistance < distance) {
            distance = pointDistance
            closestDrop = drop
        }
    })
    let closestCoordinates = [closestDrop.LONGITUDE, closestDrop.LATITUDE]
    if (document.getElementById('type-address').checked) {
        closestCoordinates = closestDrop.FORWARD_COORDINATES
    }

    return fetchJson(`https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/${closestCoordinates[0]},${closestCoordinates[1]}.json?radius=100&limit=50&layers=road&access_token=${mapboxgl.accessToken}`).then(roads => {
        for (let i = 0; i < roads.features.length; i++) {
            const props = roads.features[i].properties
            if (props.type == 'general_street') {
                clickedCoordinates = roads.features[i].geometry.coordinates
                const textMarker = addTextMarker('変', '再実行時はここを下車ポイントとする')
                textMarker.style = 'background:blue;'

                closestDrop.FIXED_COORDINATES = roads.features[i].geometry.coordinates
                for (let k = 0; k < solution_request.locations.length; k++) {
                    if (closestDrop.INVOICE_NUMBER == solution_request.locations[k].name) {
                        solution_request.locations[k].coordinates = closestDrop.FIXED_COORDINATES
                        break
                    }
                }
                break
            }
        }
    })
}

let count = 0
function createBBox(centerCoordinate) {
    // Define the distance in meters (100 meters in this example)
    var distanceInMeters = 10;

    // Calculate the bounding box
    var bbox = turf.bbox(turf.circle(centerCoordinate, distanceInMeters, { units: 'meters' }));

    count++
    // Extract the bounding box coordinates
    var west = bbox[0];
    var south = bbox[1];
    var east = bbox[2];
    var north = bbox[3];

    // Create a GeoJSON Feature for the bounding box
    var boundingBoxGeoJSON = {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'Polygon',
            coordinates: [
                [
                    [west, south],
                    [east, south],
                    [east, north],
                    [west, north],
                    [west, south], // Close the polygon
                ],
            ],
        },
    };

    // Add the bounding box as a source and layer to your Mapbox GL JS map
    //map.on('load', function () {
    map.addSource('bounding-box' + count, {
        type: 'geojson',
        data: boundingBoxGeoJSON,
    });

    map.addLayer({
        id: 'bounding-box-layer' + count,
        type: 'fill',
        source: 'bounding-box' + count,
        paint: {
            'fill-color': 'rgba(0, 0, 255, 0.2)', // Blue color with 20% opacity
        },
    });
    //});


    return bbox

}

function removeDirectionsLayers() {
    directionsLayers.forEach(layer => {
        if (map.getLayer(layer)) {
            map.removeLayer((layer))
        }
    })
    directionsLayers = []

    directionsSources.forEach(source => {
        if (map.getSource(source)) {
            map.removeSource((source))
        }
    })
}

window.isInMode = () => {
    const checked = document.getElementById('radio-one').checked
    return checked
}

window.toggleInMode = () => {
    if (!isInMode()) {
        const inmode_contents = document.getElementById('inmode-contents')
        inmode_contents.style = 'display:none;'
        const outmode_contents = document.getElementById('outmode-contents')
        outmode_contents.style = 'display:block;'
        hideCalculateLayer()
        hideMarkers()
        showTextMarkers()
    } else {
        const inmode_contents = document.getElementById('inmode-contents')
        inmode_contents.style = 'display:block;'
        const outmode_contents = document.getElementById('outmode-contents')
        outmode_contents.style = 'display:none;'
        showCalculateLayer()
        showMarkers()
        hideTextMarkers()
    }
}

function hideCalculateLayer() {
    if (map.getLayer('shipments-layer')) {
        map.setLayoutProperty('shipments-layer', 'visibility', 'none')
        map.setLayoutProperty('arrows', 'visibility', 'none')
    }
    directionsLayers.forEach(layer => {
        if (map.getLayer(layer)) {
            map.setLayoutProperty(layer, 'visibility', 'visible')
        }
    })

    //hideMarkers()
}
function showCalculateLayer() {
    if (map.getLayer('shipments-layer')) {
        map.setLayoutProperty('shipments-layer', 'visibility', 'visible')
        map.setLayoutProperty('arrows', 'visibility', 'visible')
    }
    directionsLayers.forEach(layer => {
        if (map.getLayer(layer)) {
            map.setLayoutProperty(layer, 'visibility', 'none')
        }
    })
}

function getCurrentDate() {
    const currentDate = new Date();

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}
function getFullTime(time) {
    return `${getCurrentDate()}T${time}:00.000Z`
}

window.recoverShipment = (clickedFeature) => {
    document.getElementById('shipment-id').value = clickedFeature.properties.id
    document.getElementById('shipment-pickup-startime').value = clickedFeature.properties.pickup_starttime
    document.getElementById('shipment-pickup-endtime').value = clickedFeature.properties.pickup_endtime
    document.getElementById('shipment-dropoff-startime').value = clickedFeature.properties.dropoff_starttime
    document.getElementById('shipment-dropoff-endtime').value = clickedFeature.properties.dropoff_endtime
    document.getElementById('shipment-item-count').value = clickedFeature.properties.item_count
    document.getElementById('shipment-pickup-duration').value = clickedFeature.properties.pickup_duration
    document.getElementById('shipment-dropoff-duration').value = clickedFeature.properties.dropoff_duration
    document.getElementById('shipment-requirements').value = clickedFeature.properties.requirements
}

window.submitShipment = () => {
    const id = document.getElementById('shipment-id').value
    const features = map.getSource('shipments-source')._data.features
    for (const feature of features) {
        if (feature.properties.id === id) {
            feature.properties.pickup_starttime = document.getElementById('shipment-pickup-startime').value
            feature.properties.pickup_endtime = document.getElementById('shipment-pickup-endtime').value
            feature.properties.dropoff_starttime = document.getElementById('shipment-dropoff-startime').value
            feature.properties.dropoff_endtime = document.getElementById('shipment-dropoff-endtime').value
            feature.properties.item_count = document.getElementById('shipment-item-count').value
            feature.properties.pickup_duration = document.getElementById('shipment-pickup-duration').value
            feature.properties.dropoff_duration = document.getElementById('shipment-dropoff-duration').value
            feature.properties.requirements = document.getElementById('shipment-requirements').value
            break
        }
    }
    const newData = {
        type: 'FeatureCollection',
        features: features,
    }
    map.getSource('shipments-source').setData(newData)
    var shipmentModal = document.getElementById('shipment-modal')
    shipmentModal.style.display = 'none'
    clearShipmentModal()
}

window.clearShipmentModal = () => {
    document.getElementById('shipment-pickup-startime').value = ''
    document.getElementById('shipment-pickup-endtime').value = ''
    document.getElementById('shipment-dropoff-startime').value = ''
    document.getElementById('shipment-dropoff-endtime').value = ''
    document.getElementById('shipment-item-count').value = ''
    document.getElementById('shipment-pickup-duration').value = ''
    document.getElementById('shipment-dropoff-duration').value = ''
    document.getElementById('shipment-requirements').value = ''
    document.getElementById('shipment-id').value = ''
}
let clickedCoordinates
/*map.on('contextmenu', function (e) {
    if (!isInMode()) return
    clickedCoordinates = e.lngLat;
    clickedPoiLabel = ''
    var modal = document.getElementById('modal');
    var pixelPosition = map.project(clickedCoordinates);
    modal.style.top = pixelPosition.y + 'px';
    modal.style.left = pixelPosition.x + 'px';
    modal.style.display = 'block';
    const coords = document.getElementById('coords')
    coords.innerHTML = `緯度経度<br>${clickedCoordinates.lng}, ${clickedCoordinates.lat}<br><br>`

    resetDragLayer()
    isDragging = false
})*/

map.on('click', function (e) {
    if (!isInMode()) return
    submitShipment()
    var modal = document.getElementById('modal')
    modal.style.display = 'none'
    var shipmentModal = document.getElementById('shipment-modal')
    shipmentModal.style.display = 'none'
    var shipmentModal = document.getElementById('vehicle-modal')
    shipmentModal.style.display = 'none'
    let nearestPoint = getCoordinatesWithinRadius([e.lngLat.lng, e.lngLat.lat])
    if (nearestPoint == null) {
        resetDragLayer()
        isDragging = false
    }
})

let cursorCoordinates;
map.on('mousemove', function (e) {
    cursorCoordinates = e.lngLat
    if (isDragging) updateDragging()
})

let markerList = []
window.addTypeMarker = (type) => {
    addMarker(type)
    const marker = {
        type: type,
        coordinates: clickedCoordinates
    }
    markerList.push(marker)
    var modal = document.getElementById('modal');
    modal.style.display = 'none';
}

const addTypeMarkerWithCoords = (type, coordinates) => {
    addMarker(type)
    const marker = {
        type: type,
        coordinates: coordinates
    }
    markerList.push(marker)
    var modal = document.getElementById('modal');
    modal.style.display = 'none';
}

let textMarkerList = []
function hideTextMarkers() {
    // Loop through the markers array and remove them from the map
    textMarkerList.forEach(function (marker) {
        marker.remove(); // Remove the marker from the map
    });
}
function showTextMarkers() {
    // Loop through the markers array and add them back to the map
    textMarkerList.forEach(function (marker) {
        marker.addTo(map); // Add the marker back to the map
    });
}
window.addTextMarker = (val, info) => {
    var customMarker = document.createElement('div')
    customMarker.className = 'text-marker'

    var text = document.createElement('div')
    text.className = 'marker-text'
    text.textContent = val

    customMarker.appendChild(text)

    const marker = new mapboxgl.Marker(customMarker)
        .setLngLat(clickedCoordinates)
        .addTo(map)

    textMarkerList.push(marker)

    var popup = new mapboxgl.Popup({ closeOnClick: false, closeButton: false, closeOnMove: true, offset: [0, -20] })
        .setLngLat(clickedCoordinates)
        .setHTML(`<div>${info}</div>`)

    marker.getElement().addEventListener('mouseenter', function () {
        popup.addTo(map)
    });

    marker.getElement().addEventListener('mouseleave', function () {
        popup.remove()
    });
    return customMarker
}

const type_color = {
    pickup: 'red',
    dropoff: 'green',
    vehicle: 'blue'
}

let isDragging = false
let leftClickedCoordinates
let connect_properties = {
    coordinates: [],
    start_type: "",
    name: ""
}
let connectionsList = []
window.appendConnections = (coordinates) => {
    let container
    let error = false
    connectionsList.forEach(connections => {
        if (connect_properties.start_type === 'pickup') {
            if (connect_properties.coordinates.lng == connections.pickup_coordinates.lng &&
                connect_properties.coordinates.lat == connections.pickup_coordinates.lat) {
                container = connections
                container.dropoff_coordinates_list.forEach(dropoff => {
                    if (dropoff.lng == coordinates.lng &&
                        dropoff.lat == coordinates.lat) {
                        error = true
                        return
                    }
                })
                container.dropoff_coordinates_list.push(coordinates)
                return
            }
        } else {
            if (coordinates.lng === connections.pickup_coordinates.lng &&
                coordinates.lat === connections.pickup_coordinates.lat) {
                container = connections
                container.dropoff_coordinates_list.forEach(dropoff => {
                    if (dropoff.lng == connect_properties.coordinates.lng &&
                        dropoff.lat == connect_properties.coordinates.lat) {
                        error = true
                        return
                    }
                })
                container.dropoff_coordinates_list.push(connect_properties.coordinates)
                return
            }
        }
    })
    if (error) {
        alert("設定済みです。")
    }
    if (!container) {
        container = {
            pickup_coordinates: [],
            dropoff_coordinates_list: []
        }
        if (connect_properties.start_type === 'pickup') {
            container.pickup_coordinates = connect_properties.coordinates
            container.dropoff_coordinates_list.push(coordinates)
        } else {
            container.pickup_coordinates = coordinates
            container.dropoff_coordinates_list.push(connect_properties.coordinates)
        }
        connectionsList.push(container)
    }

}
let markerArray = []
let markerCounter = {
    "pickup": 0,
    "dropoff": 0,
    "vehicle": 0
}
const markerNameConverter = {
    "pickup": "集荷",
    "dropoff": "配達",
    "vehicle": "機関"
}
let markers = []
function hideMarkers() {
    // Loop through the markers array and remove them from the map
    markers.forEach(function (marker) {
        marker.remove(); // Remove the marker from the map
    });
}
function showMarkers() {
    // Loop through the markers array and add them back to the map
    markers.forEach(function (marker) {
        marker.addTo(map); // Add the marker back to the map
    });
}
function removeAllMarkers() {
    markers.forEach(function (marker) {
        marker.remove(); // Remove the marker from the map
    })
    markers = []
    markerArray = []
}
let clickedVehicleName
let dropoffName
function getMarkerName(type) {
    if (type === 'pickup') return clickedVehicleName
    if (type === 'dropoff') return dropoffName
    let count = markerCounter[type]
    count++
    markerCounter[type] = count
    let name = type + '-' + count
    name = name.replace(type, markerNameConverter[type])
    return name
}
window.addMarker = function (type) {
    const name = getMarkerName(type)
    markerArray[name] = { coordinates: clickedCoordinates, type: type }
    var marker = new mapboxgl.Marker({ color: type_color[type] })
        .setLngLat(clickedCoordinates)
        .addTo(map)
    markers.push(marker)

    document.getElementById('poi-search-text').value = ''
    document.getElementById('listings').innerHTML = ''

    map.flyTo({
        center: clickedCoordinates
    });

    let addInfo = ''
    if (clickedPoiLabel !== '') {
        addInfo = `<br><div class='item'>${clickedPoiLabel}</div>`
    }
    var popup = new mapboxgl.Popup({ closeOnClick: false, closeButton: false, closeOnMove: true, offset: [0, -20] })
        .setLngLat(clickedCoordinates)
        .setHTML(`<div>${name}</div>${addInfo}`)

    marker.getElement().addEventListener('mouseenter', function () {
        popup.addTo(map)
    });

    marker.getElement().addEventListener('mouseleave', function () {
        popup.remove()
    });
}

window.updateDragging = () => {
    const lineCoordinates = [
        [leftClickedCoordinates.lng, leftClickedCoordinates.lat],
        [cursorCoordinates.lng, cursorCoordinates.lat]
    ]
    map.getSource('drag-source').setData({
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: lineCoordinates
        }
    })
}

window.resetDragLayer = () => {
    if (map.getLayer('drag-layer')) {
        map.removeLayer(('drag-layer'))
    }
    if (map.getSource('drag-source')) {
        map.removeSource('drag-source')
    }
}

window.addToShipments = (clickedCoordinates, id) => {
    let from
    let to
    let lineCoordinates = []
    if (connect_properties.start_type === 'pickup') {
        lineCoordinates.push([connect_properties.coordinates.lng, connect_properties.coordinates.lat])
        lineCoordinates.push([clickedCoordinates.lng, clickedCoordinates.lat])
        from = connect_properties.name
        to = id
    } else {
        lineCoordinates.push([clickedCoordinates.lng, clickedCoordinates.lat])
        lineCoordinates.push([connect_properties.coordinates.lng, connect_properties.coordinates.lat])
        from = id
        to = connect_properties.name
    }
    const newFeature = [
        {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: lineCoordinates
            },
            properties: {
                id: uuidv4(),
                from: from,
                to: to,
                pickup_starttime: '',
                pickup_endtime: '',
                dropoff_starttime: '',
                dropoff_endtime: '',
                item_count: '',
                pickup_duration: '',
                dropoff_duration: '180',
                requirements: ''
            }
        }
    ]
    const existingData = map.getSource('shipments-source')._data
    const newData = {
        type: 'FeatureCollection',
        features: [...existingData.features, ...newFeature],
    }
    map.getSource('shipments-source').setData(newData)
}

function getClosestCoordinates(coords) {
    const pointFeature = turf.point([coords.lng, coords.lat]);

    let closestCoordinates
    let nearestDistance
    markerList.forEach(marker => {
        const coordinatesPoint = turf.point([marker.coordinates.lng, marker.coordinates.lat])
        const distance = turf.distance(pointFeature, coordinatesPoint)
        if (!nearestDistance || distance < nearestDistance) {
            nearestDistance = distance
            closestCoordinates = marker.coordinates
        }
    })

    return closestCoordinates
}

function getCoordinatesWithinRadius(center) {
    const centerPoint = turf.point(center);
    let radius = 10000

    for (const marker of markerList) {
        const coordinatesPoint = turf.point([marker.coordinates.lng, marker.coordinates.lat]);
        const distance = turf.distance(centerPoint, coordinatesPoint, { units: 'meters' });

        if (distance <= radius) {
            // The coordinates are within the radius
            return marker.coordinates;
        }
    }
    // No coordinates found within the radius
    return null;
}

const vehicle_img = {
    "1": "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iNDkzLjM0OXB4IiBoZWlnaHQ9IjQ5My4zNDlweCIgdmlld0JveD0iMCAwIDQ5My4zNDkgNDkzLjM0OSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgNDkzLjM0OSA0OTMuMzQ5OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPHBhdGggZD0iTTQ4Ny45MzIsNTEuMWMtMy42MTMtMy42MTItNy45MDUtNS40MjQtMTIuODQ3LTUuNDI0aC0yOTIuMzZjLTQuOTQ4LDAtOS4yMzMsMS44MTItMTIuODQ3LDUuNDI0CgkJYy0zLjYxNSwzLjYxNy01LjQyNCw3LjkwMi01LjQyNCwxMi44NXY1NC44MThoLTQ1LjY4M2MtNS4xNCwwLTEwLjcxLDEuMjM3LTE2LjcwNSwzLjcxMWMtNS45OTYsMi40NzgtMTAuODAxLDUuNTE4LTE0LjQxNiw5LjEzNQoJCWwtNTYuNTMyLDU2LjUzMWMtMi40NzMsMi40NzQtNC42MTIsNS4zMjctNi40MjQsOC41NjVjLTEuODA3LDMuMjMtMy4xNCw2LjE0LTMuOTk3LDguNzA1Yy0wLjg1NSwyLjU3Mi0xLjQ3Nyw2LjA4OS0xLjg1NCwxMC41NjYKCQljLTAuMzc4LDQuNDc1LTAuNjIsNy43NTgtMC43MTUsOS44NTNjLTAuMDkxLDIuMDkyLTAuMDkxLDUuNzEsMCwxMC44NWMwLjA5Niw1LjE0MiwwLjE0NCw4LjQ3LDAuMTQ0LDkuOTk1djkxLjM2CgkJYy00Ljk0NywwLTkuMjI5LDEuODA3LTEyLjg0Nyw1LjQyOEMxLjgwOSwzNDcuMDc2LDAsMzUxLjM2MywwLDM1Ni4zMTJjMCwyLjg1MSwwLjM3OCw1LjM3NiwxLjE0LDcuNTYyCgkJYzAuNzYzLDIuMTksMi4wNDYsMy45NDksMy44NTgsNS4yODRjMS44MDcsMS4zMzUsMy4zNzgsMi40MjYsNC43MDksMy4yODVjMS4zMzUsMC44NTUsMy41NzEsMS40MjQsNi43MTEsMS43MTEKCQlzNS4yOCwwLjQ3OSw2LjQyMywwLjU3NWMxLjE0MywwLjA4OSwzLjU2OCwwLjA4OSw3LjI3OSwwYzMuNzE1LTAuMDk2LDUuODU1LTAuMTQ0LDYuNDI3LTAuMTQ0aDE4LjI3MQoJCWMwLDIwLjE3LDcuMTM5LDM3LjM5NywyMS40MTEsNTEuNjc0YzE0LjI3NywxNC4yNzQsMzEuNTAxLDIxLjQxMyw1MS42NzgsMjEuNDEzYzIwLjE3NSwwLDM3LjQwMS03LjEzOSw1MS42NzUtMjEuNDEzCgkJYzE0LjI3Ny0xNC4yNzYsMjEuNDExLTMxLjUwNCwyMS40MTEtNTEuNjc0SDMxMC42M2MwLDIwLjE3LDcuMTM5LDM3LjM5NywyMS40MTIsNTEuNjc0YzE0LjI3MSwxNC4yNzQsMzEuNDk4LDIxLjQxMyw1MS42NzUsMjEuNDEzCgkJYzIwLjE4MSwwLDM3LjM5Ny03LjEzOSw1MS42NzUtMjEuNDEzYzE0LjI3Ny0xNC4yNzYsMjEuNDEyLTMxLjUwNCwyMS40MTItNTEuNjc0YzAuNTY4LDAsMi43MTEsMC4wNDgsNi40MiwwLjE0NAoJCWMzLjcxMywwLjA4OSw2LjE0LDAuMDg5LDcuMjgyLDBjMS4xNDQtMC4wOTYsMy4yODktMC4yODgsNi40MjctMC41NzVjMy4xMzktMC4yODcsNS4zNzMtMC44NTUsNi43MDgtMS43MTFzMi45MDEtMS45NSw0LjcwOS0zLjI4NQoJCWMxLjgxLTEuMzM1LDMuMDk3LTMuMDk0LDMuODU2LTUuMjg0YzAuNzctMi4xODcsMS4xNDMtNC43MTIsMS4xNDMtNy41NjJWNjMuOTUzQzQ5My4zNTMsNTkuMDA0LDQ5MS41NDYsNTQuNzI0LDQ4Ny45MzIsNTEuMXoKCQkgTTE1My41OTcsNDAwLjI4Yy03LjIyOSw3LjIzLTE1Ljc5NywxMC44NTQtMjUuNjk0LDEwLjg1NGMtOS44OTgsMC0xOC40NjQtMy42Mi0yNS42OTctMTAuODU0CgkJYy03LjIzMy03LjIyOC0xMC44NDgtMTUuNzk3LTEwLjg0OC0yNS42OTNjMC05Ljg5NywzLjYxOS0xOC40NywxMC44NDgtMjUuNzAxYzcuMjMyLTcuMjI4LDE1Ljc5OC0xMC44NDgsMjUuNjk3LTEwLjg0OAoJCWM5Ljg5NywwLDE4LjQ2NCwzLjYxNywyNS42OTQsMTAuODQ4YzcuMjM2LDcuMjMxLDEwLjg1MywxNS44MDQsMTAuODUzLDI1LjcwMUMxNjQuNDUsMzg0LjQ4MywxNjAuODMzLDM5My4wNTIsMTUzLjU5Nyw0MDAuMjh6CgkJIE0xNjQuNDUsMjI4LjQwM0g1NC44MTR2LTguNTYyYzAtMi40NzUsMC44NTUtNC41NjksMi41NjgtNi4yODNsNTUuNjc0LTU1LjY3MmMxLjcxMi0xLjcxNCwzLjgwOS0yLjU2OCw2LjI4My0yLjU2OGg0NS4xMTEKCQlWMjI4LjQwM3ogTTQwOS40MSw0MDAuMjhjLTcuMjMsNy4yMy0xNS43OTcsMTAuODU0LTI1LjY5MywxMC44NTRjLTkuOSwwLTE4LjQ3LTMuNjItMjUuNy0xMC44NTQKCQljLTcuMjMxLTcuMjI4LTEwLjg0OS0xNS43OTctMTAuODQ5LTI1LjY5M2MwLTkuODk3LDMuNjE3LTE4LjQ3LDEwLjg0OS0yNS43MDFjNy4yMy03LjIyOCwxNS44LTEwLjg0OCwyNS43LTEwLjg0OAoJCWM5Ljg5NiwwLDE4LjQ2MywzLjYxNywyNS42OTMsMTAuODQ4YzcuMjMxLDcuMjM1LDEwLjg1MiwxNS44MDQsMTAuODUyLDI1LjcwMUM0MjAuMjYyLDM4NC40ODMsNDE2LjY0OCwzOTMuMDUyLDQwOS40MSw0MDAuMjh6IiBpZD0iaWRfMTAzIiBzdHlsZT0iZmlsbDogcmdiKDI1NSwgMTY1LCAwKTsiPjwvcGF0aD4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4=",
    "2": "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJiaWN5Y2xlLTE1IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNXB4IiBoZWlnaHQ9IjE1cHgiIHZpZXdCb3g9IjAgMCAxNSAxNSI+CiAgPHBhdGggaWQ9InBhdGg0NjY4IiBkPSIKCU03LjUsMmMtMC42NzYxLTAuMDEtMC42NzYxLDEuMDA5NiwwLDFIOXYxLjI2NTZsLTIuODAyNywyLjMzNEw1LjIyMjYsNEg1LjVjMC42NzYxLDAuMDEsMC42NzYxLTEuMDA5NiwwLTFoLTIKCWMtMC42NzYxLTAuMDEtMC42NzYxLDEuMDA5NiwwLDFoMC42NTIzTDUuMDQzLDYuMzc1QzQuNTc1Miw2LjE0MjQsNC4wNTU5LDYsMy41LDZDMS41NzI5LDYsMCw3LjU3MjksMCw5LjVTMS41NzI5LDEzLDMuNSwxMwoJUzcsMTEuNDI3MSw3LDkuNWMwLTAuNjY5OS0wLjIwMDMtMS4yOTExLTAuNTI5My0xLjgyNDJMOS4yOTEsNS4zMjYybDAuNDYyOSwxLjE2MDJDOC43MTE0LDcuMDkzNyw4LDguMjExMiw4LDkuNQoJYzAsMS45MjcxLDEuNTcyOSwzLjUsMy41LDMuNVMxNSwxMS40MjcxLDE1LDkuNVMxMy40MjcxLDYsMTEuNSw2Yy0wLjI4MzEsMC0wLjU1NDQsMC4wNDM0LTAuODE4NCwwLjEwNzRMMTAsNC40MDIzVjIuNQoJYzAtMC4yNzYxLTAuMjIzOS0wLjUtMC41LTAuNUg3LjV6IE0zLjUsN2MwLjU5MjMsMCwxLjEyNzYsMC4yMTE5LDEuNTU0NywwLjU1MjdsLTEuODc1LDEuNTYyNQoJYy0wLjUxMDksMC40MjczLDAuMTI3OCwxLjE5NDUsMC42NDA2LDAuNzY5NWwxLjg3NS0xLjU2MjVDNS44ODM1LDguNjc0LDYsOS4wNzExLDYsOS41QzYsMTAuODg2Niw0Ljg4NjYsMTIsMy41LDEyUzEsMTAuODg2NiwxLDkuNQoJUzIuMTEzMyw3LDMuNSw3TDMuNSw3eiBNMTEuNSw3QzEyLjg4NjYsNywxNCw4LjExMzQsMTQsOS41UzEyLjg4NjYsMTIsMTEuNSwxMlM5LDEwLjg4NjYsOSw5LjVjMC0wLjg3NywwLjQ0NjgtMS42NDIxLDEuMTI1LTIuMDg3OQoJbDAuOTEwMiwyLjI3MzRjMC4yNDYsMC42MjMxLDEuMTgwNCwwLjI1MDEsMC45Mjk3LTAuMzcxMWwtMC45MDgyLTIuMjY5NUMxMS4yMDA5LDcuMDE5MywxMS4zNDgxLDcsMTEuNSw3TDExLjUsN3oiIHN0eWxlPSJmaWxsOiByZ2IoMjU1LCAxNjUsIDApOyI+PC9wYXRoPgo8L3N2Zz4=",
    "3": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTNweCIgaGVpZ2h0PSIyMnB4IiB2aWV3Qm94PSIwIDAgMTMgMjIiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDUyLjUgKDY3NDY5KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5kaXJlY3Rpb25zX3dhbGs8L3RpdGxlPgogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZyBpZD0iSWNvbnMiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJSb3VuZGVkIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjA5LjAwMDAwMCwgLTMxMjMuMDAwMDAwKSI+CiAgICAgICAgICAgIDxnIGlkPSJNYXBzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxMDAuMDAwMDAwLCAzMDY4LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPGcgaWQ9Ii1Sb3VuZC0vLU1hcHMtLy1kaXJlY3Rpb25zX3dhbGsiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwMy4wMDAwMDAsIDU0LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgICAgIDxnPgogICAgICAgICAgICAgICAgICAgICAgICA8cG9seWdvbiBpZD0iUGF0aCIgcG9pbnRzPSIwIDAgMjQgMCAyNCAyNCAwIDI0Ij48L3BvbHlnb24+CiAgICAgICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xMy41LDUuNSBDMTQuNiw1LjUgMTUuNSw0LjYgMTUuNSwzLjUgQzE1LjUsMi40IDE0LjYsMS41IDEzLjUsMS41IEMxMi40LDEuNSAxMS41LDIuNCAxMS41LDMuNSBDMTEuNSw0LjYgMTIuNCw1LjUgMTMuNSw1LjUgWiBNOS44LDguOSBMNy4yNCwyMS44MSBDNy4xMSwyMi40MiA3LjU5LDIzIDguMjIsMjMgTDguMywyMyBDOC43NywyMyA5LjE3LDIyLjY4IDkuMjgsMjIuMjIgTDEwLjksMTUgTDEzLDE3IEwxMywyMiBDMTMsMjIuNTUgMTMuNDUsMjMgMTQsMjMgQzE0LjU1LDIzIDE1LDIyLjU1IDE1LDIyIEwxNSwxNi4zNiBDMTUsMTUuODEgMTQuNzgsMTUuMjkgMTQuMzgsMTQuOTEgTDEyLjksMTMuNSBMMTMuNSwxMC41IEMxNC41NywxMS43NCAxNi4xMiwxMi42MyAxNy44NiwxMi45MSBDMTguNDYsMTMgMTksMTIuNTIgMTksMTEuOTEgQzE5LDExLjQyIDE4LjY0LDExLjAxIDE4LjE1LDEwLjkzIEMxNi42MywxMC42OCAxNS4zNyw5Ljc4IDE0LjcsOC42IEwxMy43LDcgQzEzLjE0LDYuMTEgMTIuMDIsNS43NSAxMS4wNSw2LjE2IEw3LjIyLDcuNzggQzYuNDgsOC4xIDYsOC44MiA2LDkuNjMgTDYsMTIgQzYsMTIuNTUgNi40NSwxMyA3LDEzIEM3LjU1LDEzIDgsMTIuNTUgOCwxMiBMOCw5LjYgTDkuOCw4LjkgWiIgaWQ9IvCflLktSWNvbi1Db2xvciIgZmlsbD0iI2ZmYTUwMCI+PC9wYXRoPgogICAgICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgICAgIDwvZz4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+",
}

const vehicle_profile = {
    "1": "mapbox/driving",
    "2": "mapbox/cycling",
    "3": "mapbox/walking",
}

function getPropertyName(obj, value) {
    for (let prop in obj) {
        if (obj.hasOwnProperty(prop) && obj[prop] === value) {
            return prop;
        }
    }
    return null;
}

window.appendAllVehiclesFromData = async () => {
    const keys = Object.keys(vehicles)
    for (const vehicle of keys) {
        if (document.getElementById('type-address').checked) {
            const json = await getGeocoding(vehicles[vehicle].ADDRESS);
            vehicles[vehicle].LONGITUDE = json.features[0].geometry.coordinates[0]
            vehicles[vehicle].LATITUDE = json.features[0].geometry.coordinates[1]
            appendVehicle(vehicle)
        } else {
            appendVehicle(vehicle)
        }
    }
}

function clearShipments() {
    const newData = {
        type: 'FeatureCollection',
        features: [],
    }
    map.getSource('shipments-source').setData(newData)
}

window.appendVehicle = (name) => {
    const container = document.getElementById('vehicles')
    const div = container.appendChild(document.createElement('div'))
    div.className = 'indiv-vehicle'
    const img = div.appendChild(document.createElement('img'))
    img.className = 'vehicle'
    const type = document.getElementById('vehicle-type').value
    img.src = vehicle_img[type]
    img.onclick = function (event) {
        clearShipments()
        const vehicle = {
            name: name
        }

        removeAllMarkers()
        document.getElementById('vehicle-startplace').innerHTML = ''
        document.getElementById('vehicle-endplace').innerHTML = ''

        clickedVehicleName = name
        clickedCoordinates = { lng: vehicles[name].LONGITUDE, lat: vehicles[name].LATITUDE }
        addTypeMarker('pickup')
        addPlaceOptions('vehicle-startplace')
        addPlaceOptions('vehicle-endplace')
        document.getElementById('vehicle-startplace').value = name
        document.getElementById('vehicle-endplace').value = name
        document.getElementById('vehicle-item-count').value = 999

        setVehicleData(vehicle)
        solution_request.vehicles = [vehicle]
        updateVehicle(event, name)

        for (const dropoff of dropoffs_agg[name]) {
            clickedCoordinates = { lng: dropoff.LONGITUDE, lat: dropoff.LATITUDE }
            dropoffName = dropoff.INVOICE_NUMBER
            addTypeMarker('dropoff')
        }
        autoCreateShipments()
    }
    img.id = name
    img.title = name

    const indivName = div.appendChild(document.createElement('span'))
    indivName.innerHTML = '↑Click'

    clearVehicleModal()
}

window.modVehicle = (img) => {
    const type = document.getElementById('vehicle-type').value
    img.src = vehicle_img[type]

    const name = img.id
    solution_request.vehicles.forEach(vehicle => {
        if (vehicle.name === name) {
            setVehicleData(vehicle)
        }
    })

    clearVehicleModal()
}

window.delVehicle = () => {
    const name = document.getElementById('target-vehicle-id').value
    let index = 0;
    for (let vehicle of solution_request.vehicles) {
        if (vehicle.name === name) {
            break
        }
        index++
    }
    solution_request.vehicles.splice(index, 1)
    document.getElementById(name).remove()

    clearVehicleModal()
}

function setVehicleData(vehicle) {
    const type = document.getElementById('vehicle-type').value
    let earliestStart = document.getElementById('vehicle-starttime').value
    if (earliestStart !== "") {
        earliestStart = getFullTime(earliestStart)
    }
    let latestEnd = document.getElementById('vehicle-endtime').value
    if (latestEnd !== "") {
        latestEnd = getFullTime(latestEnd)
    }
    vehicle['routing_profile'] = vehicle_profile[type]
    vehicle['start_location'] = document.getElementById('vehicle-startplace').value
    vehicle['end_location'] = document.getElementById('vehicle-endplace').value
    if (document.getElementById('vehicle-item-count').value) {
        vehicle['capacities'] = {
            boxes: parseInt(document.getElementById('vehicle-item-count').value)
        }
    }
    vehicle['earliest_start'] = earliestStart
    vehicle['latest_end'] = latestEnd
    if (document.getElementById('vehicle-requirements').value) {
        vehicle['capabilities'] = [document.getElementById('vehicle-requirements').value]
    } else {
        vehicle['capabilities'] = []
    }
}

function resurrectVehicleData(name) {
    for (let vehicle of solution_request.vehicles) {
        if (vehicle.name === name) {
            const vehicleType = getPropertyName(vehicle_profile, vehicle.routing_profile)
            document.getElementById('vehicle-type').value = vehicleType
            document.getElementById('vehicle-startplace').value = vehicle['start_location']
            document.getElementById('vehicle-endplace').value = vehicle['end_location']
            if (vehicle['capacities']) {
                document.getElementById('vehicle-item-count').value = vehicle['capacities'].boxes
            } else {
                document.getElementById('vehicle-item-count').value = ''
            }
            if (vehicle['earliest_start']) {
                document.getElementById('vehicle-starttime').value = vehicle['earliest_start'].substring(vehicle['earliest_start'].indexOf("T") + 1, vehicle['earliest_start'].lastIndexOf(":"))
            } else {
                document.getElementById('vehicle-starttime').value = ''
            }
            if (vehicle['latest_end']) {
                document.getElementById('vehicle-endtime').value = vehicle['latest_end'].substring(vehicle['latest_end'].indexOf("T") + 1, vehicle['latest_end'].lastIndexOf(":"))
            } else {
                document.getElementById('vehicle-endtime').value = ''
            }
            if (vehicle['capabilities'].length === 1) {
                document.getElementById('vehicle-requirements').value = vehicle['capabilities'][0]
            }
            break
        }
    }
}

function clearVehicleModal() {
    var modal = document.getElementById('vehicle-modal')
    modal.style.display = 'none'

    document.getElementById('vehicle-startplace').value = ""
    document.getElementById('vehicle-endplace').value = ""
    document.getElementById('vehicle-starttime').value = ""
    document.getElementById('vehicle-endtime').value = ""
    document.getElementById('vehicle-item-count').value = ""
    document.getElementById('vehicle-requirements').value = ""
    document.getElementById('vehicle-item-count').value = ""
}

window.addNewVehicle = (e) => {
    showVehicleDetails(e, "")
    vehicleRemoveButton('none')
    const commitButton = document.getElementById('vehicle-commit-button')
    commitButton.onclick = function (event) {
        appendVehicle()
    }
}

window.updateVehicle = (e, id) => {
    showVehicleDetails(e, id)
    //vehicleRemoveButton('block')
    resurrectVehicleData(id)
    const commitButton = document.getElementById('vehicle-commit-button')
    commitButton.onclick = function (event) {
        modVehicle(document.getElementById(id))
        var modal = document.getElementById('vehicle-modal')
        modal.style.display = 'none'
        motorwayCheckDone = false
        calculateSolution()
    }
}

function addPlaceOptions(id) {
    const startplace = document.getElementById(id)
    while (startplace.firstChild) {
        startplace.removeChild(startplace.firstChild)
    }
    const blankOption = startplace.appendChild(document.createElement('option'))
    for (const key in markerArray) {
        const option = startplace.appendChild(document.createElement('option'))
        option.value = key
        option.innerHTML = key
    }
}

function showVehicleDetails(e, id) {
    const modal = document.getElementById('vehicle-modal');

    const windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    // Calculate the center coordinates
    const centerX = windowWidth / 3;
    const centerY = windowHeight / 3;

    modal.style.top = centerY + 'px';
    modal.style.left = centerX + 'px';
    modal.style.display = 'block';

    const targetVehicleId = document.getElementById('target-vehicle-id')
    targetVehicleId.value = id

    addPlaceOptions('vehicle-startplace')
    addPlaceOptions('vehicle-endplace')
}

function vehicleRemoveButton(display) {
    const delButton = document.getElementById('vehicle-remove-button')
    delButton.style.display = display
}

function getRandomColor() {
    var red = Math.floor(Math.random() * 256);
    var green = Math.floor(Math.random() * 256);
    var blue = Math.floor(Math.random() * 256);
    var color = "rgb(" + red + ", " + green + ", " + blue + ")";
    return color;
}

function dispLoading(msg) {
    if (msg === undefined) msg = "";
    var innerMsg = "<div id='innerMsg'>" + msg + "</div>";
    if ($("#nowLoading").length == 0) {
        $("body").append("<div id='nowLoading'>" + innerMsg + "</div>");
    }
}

function removeLoading() {
    $("#nowLoading").remove();
}

const replaceArray = ['丁目', '番'];
function convertAddress(address) {
    if (!address) return address;
    const replace = '－';
    if (address.indexOf(replace) < 0) {
        return address;
    }
    let count = 0;
    while (address.indexOf(replace) >= 0) {
        address = address.replace(replace, replaceArray[count]);
        count++;
    }
    return address;
}

async function getGeocoding(address) {
    const geocoding_uri = 'https://api.mapbox.com/search/geocode/v6/forward?q='
    address = encodeURIComponent(address)
    const query = await fetch(`${geocoding_uri}${address}?&country=us&access_token=${mapboxgl.accessToken}`, { method: 'GET' });
    geocodedCount++;
    return await query.json();
}

const session_token = uuidv4();

async function getSuggested() {
    var searchText = document.getElementById('poi-search-text').value
    if (searchText === '') return
    var types = '&types=address'
    types = ''
    const query = await fetch(`${search_uri}suggest/${searchText}?${common_params}&limit=100&session_token=${session_token}&origin=${lng},${lat}${types}`, { method: 'GET' });
    return await query.json();
}

async function getSuggestedBy(searchText) {
    searchText = convertAddress(searchText)
    if (searchText === '') return
    var types = '&types=address'
    types = ''
    //const query = await fetch(`${search_uri}suggest/${searchText}?${common_params}&limit=10&session_token=${session_token}&origin=${lng},${lat}${types}`, { method: 'GET' });
    const query = await fetch(`https://api.mapbox.com/search/searchbox/v1/suggest?q=${searchText}&${common_params}&session_token=${session_token}&origin=${lng},${lat}${types}`)
    return await query.json();
}

let clickedPoiLabel = ''
function setSuggestionList() {
    getSuggested().then(json => {
        const listings = document.getElementById('listings');
        listings.innerHTML = ''
        const listing = listings.appendChild(document.createElement('select'));
        listing.className = 'poi-select'
        listing.onchange = function () {
            const lnglatArray = listing.value.split('_')
            clickedCoordinates = { lng: lnglatArray[0], lat: lnglatArray[1] }
            if (lnglatArray.length == 3) {
                clickedPoiLabel = lnglatArray[2]
            } else {
                clickedPoiLabel = ''
            }
            const coords = document.getElementById('coords')
            coords.innerHTML = `緯度経度<br>${clickedCoordinates.lng}, ${clickedCoordinates.lat}<br><br>`
        }
        const defOption = listing.appendChild(document.createElement('option'))
        defOption.className = 'item'
        defOption.innerHTML = `右クリックした場所`
        defOption.value = `${clickedCoordinates.lng}_${clickedCoordinates.lat}`

        for (const item of json.suggestions) {
            //if (!item.description) continue;
            getGeocoding(item.description).then(geolist => {

                try {
                    const geo = geolist.features[0].geometry;
                } catch (error) {
                    return;
                }
                const cors = geolist.features[0].geometry.coordinates
                const label = `${item.feature_name}（${item.description}）`
                const option = listing.appendChild(document.createElement('option'))
                option.className = 'item'
                option.innerHTML = label
                option.value = `${cors[0]}_${cors[1]}_${label}`

            });

        }
    })
}

window.search = () => {
    setSuggestionList();
}

window.autoCreateShipments = () => {
    for (const name in markerArray) {
        const marker = markerArray[name]
        if (marker.type === 'pickup') {
            connect_properties.coordinates = marker.coordinates
            connect_properties.start_type = marker.type
            connect_properties.name = name
            for (const nestName in markerArray) {
                const nestMarker = markerArray[nestName]
                if (nestMarker.type === 'dropoff') {
                    addToShipments(nestMarker.coordinates, nestName)
                    //appendConnections(nestMarker.coordinates)
                }
            }
        }
    }
    setTimeToShipments()
}

function setTimeToShipments() {
    const shippingData = map.getSource('shipments-source')._data
    let newFeatures = []

    for (let feature of shippingData.features) {
        const vehicle = feature.properties.from
        const invoiceDropoffs = dropoffs[vehicle]
        for (const drops of invoiceDropoffs) {
            if (drops.INVOICE_NUMBER == feature.properties.to) {
                feature.properties.dropoff_duration = getDropoffDuration(drops)
                feature.properties.item_count = 1
                if (drops.SPECIFIED_ST != '') {
                    const fullStartTime = getTimeFromDropoffData(drops.SPECIFIED_ST)
                    const fullEndTime = getTimeFromDropoffData(drops.SPECIFIED_ET)
                    feature.properties.dropoff_starttime = fullStartTime
                    feature.properties.dropoff_endtime = fullEndTime
                }
            }
        }
        newFeatures.push(feature)
    }
    const newData = {
        type: 'FeatureCollection',
        features: newFeatures,
    }
    map.getSource('shipments-source').setData(newData)
}

function getTimeFromDropoffData(dropoffTime) {
    console.log(dropoffTime)
    if (dropoffTime == '') return ''
    const time = dropoffTime.split(':')
    if (time[0].length == 1) time[0] = '0' + time[0]
    if (time[1].length == 1) time[1] = '0' + time[1]
    if (time[2].length == 1) time[2] = '0' + time[2]
    let fullTime = time[0] + ':' + time[1]
    if (fullTime == '24:00') fullTime = '23:59'
    return fullTime
}

let resultsFlg = true
window.toggleResults = () => {
    if (resultsFlg) {
        //document.getElementById('result-info-table').style = 'visibility:hidden;'
        //document.getElementById('result-table').style = 'visibility:hidden;'
        //document.getElementById('result-toggle').innerHTML = '表示'
        document.getElementById('outmode-contents').style.maxHeight = '20px'
        resultsFlg = false
    } else {
        //document.getElementById('result-info-table').style = 'visibility:visible;'
        //document.getElementById('result-table').style = 'visibility:visible;'
        //document.getElementById('result-toggle').innerHTML = '非表示'
        document.getElementById('outmode-contents').style.maxHeight = '600px'
        resultsFlg = true
    }
}

const forwardSearch = (locationIndex, searchText, data) => {
    return getGeocoding(searchText).then(json => {
        const f = json.features[0]
        solution_request.locations[locationIndex].coordinates = f.geometry.coordinates
        data.FORWARD_ET = Date.now()
        data.FORWARD_COORDINATES = f.geometry.coordinates
        data.FORWARD_MATCH_ADDRESS = f.place_name
    })
}

const forwardSearchDataAddress = (data) => {
    return getGeocoding(data.ADDRESS).then(json => {
        try {
            const f = json.features[0]
            data.FORWARD_ET = Date.now()
            data.FORWARD_COORDINATES = f.geometry.coordinates
            data.LONGITUDE = f.geometry.coordinates[0]
            data.LATITUDE = f.geometry.coordinates[1]
            data.FORWARD_MATCH_ADDRESS = f.place_name
        } catch (e) {
            console.error(e)
            console.log("data", data)
            console.log("json", json)
            alert(`${json.message}: Reload and try again.`)
        }
    })
}

async function retrieve(item) {
    const query = await fetch(`https://api.mapbox.com/search/searchbox/v1/retrieve/${item.mapbox_id}?access_token=${mapboxgl.accessToken}&session_token=${session_token}`, { method: 'GET' })
    return await query.json()
}

function getMatchingFeature(json, invoice) {
    for (const i in json.features) {
        if (json.features[i].properties.place_type.includes('address')) {
            return json.features[i]
        }
    }
    console.log(json)
    return json.features[0]
}

function getSearchType() {
    var radioButtonList = document.querySelectorAll('input[type="radio"][name="searchType"]')
    var selectedValue = ""

    radioButtonList.forEach(function (radioButton) {
        if (radioButton.checked) {
            selectedValue = radioButton.value
        }
    });

    return selectedValue
}

class CoordinateFixer {
    constructor() {
        this.OFFSET = 1e-5;
        this.fixerMap = new Map();
    }

    fix(point) {
        const key = `${point.lng}_${point.lat}`;
        let count = 0;

        if (this.fixerMap.has(key)) {
            count = this.fixerMap.get(key);
        }

        count++;
        this.fixerMap.set(key, count);

        const fix = (count - 1) * this.OFFSET;

        return {
            longitude: point.lng + fix,
            latitude: point.lat + fix,
        };
    }
}

let dropoffs_agg = {}
const aggregateByAddress = () => {
    for (const vehicle in dropoffs) {
        let new_vehicle_drops = []
        dropoffs[vehicle].forEach(dropoff => {
            if (!newDropsContains(new_vehicle_drops, dropoff.ADDRESS_ID)) {
                new_vehicle_drops.push(dropoff)
            }
        })
        dropoffs_agg[vehicle] = new_vehicle_drops
    }
}

const newDropsContains = (arr, addressId) => {
    for (let i = 0; i < arr.length; i++) {
        if (addressId == arr[i].ADDRESS_ID) {
            return true
        }
    }
    return false
}

const getAggregatedInvoices = (vehicle, addressId, aggInvoice) => {
    let list = []
    for (const dropoff of dropoffs[vehicle]) {
        if (dropoff.ADDRESS_ID == addressId && dropoff.INVOICE_NUMBER != aggInvoice) {
            list.push(dropoff.INVOICE_NUMBER)
        }
    }
    return list
}
