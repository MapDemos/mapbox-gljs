if (false && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });

    navigator.serviceWorker.addEventListener('message', event => {
        if (event.data && event.data.type === 'TILE_FETCHED_FROM_NETWORK') {
            updateAPICounter('tiles');
        }
    });
}

const venues = [
    //   { name: "三井アウトレットパーク マリンピア神戸", coordinates: [135.048538, 34.6261626] },
    //   { name: "LaLa arena TOKYO-BAY", coordinates: [139.9897519, 35.6837911] },
    { name: 'ららテラス HARUMI FLAG', coordinates: [139.7744125, 35.6513492] },
    //   { name: "東京ミッドタウン（六本木）", coordinates: [139.73124, 35.6663925] },
    //   { name: "ららテラスTOKYO-BAY", coordinates: [139.9949369, 35.681543] },
    //   { name: "東京ミッドタウン八重洲", coordinates: [139.769174, 35.6791136] },
    { name: 'ららぽーと門真･三井アウトレットパーク 大阪門真', coordinates: [135.5844238, 34.7319119] },
    { name: 'ららぽーと和泉', coordinates: [135.4481652, 34.4374509] },
    //   { name: "ららぽーと堺", coordinates: [135.5605418, 34.5409695] },
    { name: 'ららぽーと富士見', coordinates: [139.5478683, 35.8600363] },
    //   { name: "ららぽーとEXPOCITY", coordinates: [135.5353341, 34.8052491] },
    //   { name: "淀屋橋 odona", coordinates: [135.5002415, 34.6911195] },
    { name: 'ららぽーと柏の葉', coordinates: [139.951162, 35.8936338] },
    //   { name: "赤れんが テラス", coordinates: [141.3504111, 43.0638781] },
    //   { name: "ららぽーと福岡", coordinates: [130.4401776, 33.5648337] },
    //   { name: "ララガーデン長町", coordinates: [140.8758501, 38.2253153] },
    //   { name: "飯田橋サクラテラス", coordinates: [139.7437512, 35.6988984] },
    //   { name: "新宿中村屋ビル", coordinates: [139.702253, 35.6917389] },
    //   { name: "RAYARD MIYASHITA PARK", coordinates: [139.7017932, 35.6618149] },
    //   { name: "RAYARD Hisaya-odori Park", coordinates: [136.9081578, 35.1740632] },
    //   { name: "コレド室町テラス", coordinates: [139.7725468, 35.6878468] },
    //   { name: "ららぽーと甲子園", coordinates: [135.3638231, 34.7166566] },
    //   { name: "三井アウトレットパーク 札幌北広島", coordinates: [141.471628, 42.9712137] },
    //   { name: "ららぽーとTOKYO-BAY", coordinates: [139.9897425, 35.6862826] },
    //   { name: "ららぽーと横浜", coordinates: [139.5664815, 35.5174874] },
    //   { name: "コレド日本橋", coordinates: [139.7746215, 35.6825564] },
    //   { name: "霞ダイニング", coordinates: [139.7471502, 35.6711508] },
    //   { name: "ららぽーと湘南平塚", coordinates: [139.3549453, 35.3365959] },
    //   { name: "ららぽーと海老名", coordinates: [139.3549453, 35.3365959] },
    //   { name: "赤坂Bizタワー SHOPS & DINING", coordinates: [139.7363227, 35.6730979] },
    //   { name: "三井アウトレットパーク ジャズドリーム長島", coordinates: [136.7253909, 35.0341492] },
    //   { name: "ララガーデン川口", coordinates: [139.6981711, 35.8048189] },
    //   { name: "三宮本通商店街", coordinates: [135.1913168, 34.6905059] },
    //   { name: "アルカキット錦糸町", coordinates: [139.8125093, 35.6973458] },
    //   { name: "ラブラ2", coordinates: [139.0569679, 37.9168662] },
    //   { name: "ラブラ万代", coordinates: [139.0562751, 37.9172472] },
    //   { name: "ららぽーと磐田", coordinates: [137.8418911, 34.750339] },
    //   { name: "ラゾーナ川崎プラザ", coordinates: [139.695846, 35.5332261] },
    //   { name: "ららテラス 武蔵小杉", coordinates: [139.6598829, 35.5751986] },
    //   { name: "銀座ベルビア館", coordinates: [139.7663045, 35.6740175] },
    //   { name: "東京ミッドタウン日比谷", coordinates: [139.7592869, 35.6737121] },
    //   { name: "三井アウトレットパーク 横浜ベイサイド", coordinates: [139.6472272, 35.3810136] },
    //   { name: "三井アウトレットパーク 北陸小矢部", coordinates: [136.8817614, 36.6880722] },
    //   { name: "ららぽーと沼津", coordinates: [138.8409668, 35.1192871] },
    //   { name: "ららぽーと愛知東郷", coordinates: [137.0469571, 35.0992252] },
    //   { name: "御徒町吉池本店ビル", coordinates: [139.7742548, 35.7071864] },
    //   { name: "銀座トレシャス", coordinates: [139.7671817, 35.6737174] },
    //   { name: "交詢ビル", coordinates: [139.7628192, 35.670105] },
    //   { name: "GINZA gCUBE", coordinates: [139.7628222, 35.6687029] },
    //   { name: "ギンザ･グラッセ", coordinates: [139.7646047, 35.6732027] },
    //   { name: "三井アウトレットパーク 木更津", coordinates: [139.934513, 35.4369148] },
    //   { name: "三井アウトレットパーク 滋賀竜王", coordinates: [136.0991803, 35.0581722] },
    //   { name: "三井アウトレットパーク 幕張", coordinates: [140.0416429, 35.6469924] },
    //   { name: "三井アウトレットパーク 多摩南大沢", coordinates: [139.378503, 35.6152571] },
    //   { name: "三井アウトレットパーク 倉敷", coordinates: [133.7616413, 34.6036584] },
    //   { name: "三井アウトレットパーク 入間", coordinates: [139.3805838, 35.8099715] },
    //   { name: "三井アウトレットパーク 仙台港", coordinates: [140.9899204, 38.2752974] },
    //   { name: "ららぽーと新三郷", coordinates: [139.8661491, 35.8595397] },
    //   { name: "ららぽーと立川立飛", coordinates: [139.4178509, 35.7126582] },
    //   { name: "ららぽーと名古屋みなとアクルス", coordinates: [136.8831604, 35.1090927] },
    //   { name: "ララガーデン春日部", coordinates: [139.7552139, 35.9773066] },
    //   { name: "アーバンドック ららぽーと豊洲", coordinates: [139.7930845, 35.6554456] },
    //   { name: "ダイバーシティ東京 プラザ", coordinates: [139.7754865, 35.6252552] },
    //   { name: "銀座並木通りビル", coordinates: [139.7660193, 35.6743944] },
    //   { name: ". (三井二号館/日本橋三井タワー)", coordinates: [139.7731990458, 35.68692988686] },
    //   { name: "コレド室町1", coordinates: [139.7743778, 35.6869054] },
    //   { name: "コレド室町3", coordinates: [139.774446, 35.6861422] },
    //   { name: "コレド室町2", coordinates: [139.7748405, 35.686899] },
    //   { name: "ZOE銀座", coordinates: [139.7657767, 35.6734624] },
    //   { name: "ニッタビル", coordinates: [139.7597311, 35.6700186] },
    { name: 'ららぽーと安城', coordinates: [137.0798505, 34.9653132] }
];
const is2D = true; // Set to false to use default Mapbox 3D style
const originalFilters = {};
//const defaultCoordinates = [139.77342767111224, 35.687530312186524];
let defaultCoordinates = venues[1].coordinates;
let mapxusToken = null;

async function fetchMapxusToken(appId, secret) {
    updateAPICounter('token');
    const res = await fetch('https://map-api.mapxus.co.jp/accounts/v1/auth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*'
        },
        body: JSON.stringify({ appId, secret })
    });

    const data = await res.json();
    return data.accessToken;
}

let apiCallCounters = {
    token: 0,
    sprites: 0,
    style: 0,
    navigation: 0,
    tiles: 0,
    total: 0
};

function updateAPICounter(type) {
    apiCallCounters[type]++;
    apiCallCounters.total++;
    displayAPICounters();
}

function displayAPICounters() {
    let counterDisplay = document.getElementById('api-counter-display');
    if (!counterDisplay) {
        counterDisplay = document.createElement('div');
        counterDisplay.id = 'api-counter-display';
        counterDisplay.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 1000;
            min-width: 200px;
        `;
        document.body.appendChild(counterDisplay);
    }

    counterDisplay.innerHTML = `
        <div><strong>Mapxus API Calls</strong></div>
        <div>Token: ${apiCallCounters.token}</div>
        <div>Sprites: ${apiCallCounters.sprites}</div>
        <div>Style: ${apiCallCounters.style}</div>
        <div>Navigation: ${apiCallCounters.navigation}</div>
        <div>Tiles: ~${apiCallCounters.tiles}</div>
        <div><strong>Total: ${apiCallCounters.total}</strong></div>
    `;
}

/**
 * Mapxus-standard indoor layer filtering for multiple levels and overlap logic.
 * @param {string[]|string} displayedLevels - Array of level IDs (or single string for one).
 * @param {Array} filteringLayers - Optional. Layers to filter; defaults to all style layers from 'indoor-planet' and 'source-layer' starting with 'mapxus_'.
 * @param {number} elevationOffset - Optional elevation offset to set on layers.
 */
function filterIndoorLayers(displayedLevels, filteringLayers = map.getStyle().layers.filter(layer =>
    layer.source === 'indoor-planet' &&
    layer['source-layer'] &&
    layer['source-layer'].startsWith('mapxus_')
), elevationOffset = 0) {
    // Accept single level as string, convert to array
    if (!Array.isArray(displayedLevels)) displayedLevels = [displayedLevels];
    if (!filteringLayers.length) return;

    for (const layer of filteringLayers) {
        if (!layer['source-layer']) continue;

        const sourceLayer = layer['source-layer'];
        if (
            sourceLayer === 'mapxus_venue' ||
            sourceLayer === 'mapxus_building' ||
            !layer.filter
        ) {
            continue;
        }
        const { id, type } = layer;
        if (!originalFilters[id]) {
            originalFilters[id] = layer.filter;
        }
        const filter = originalFilters[id];

        const newFilter = [
            'all',
            sourceLayer === 'mapxus_level'
                ? ['in', 'id', ...displayedLevels]
                : ['in', 'ref:level', ...displayedLevels],
            ...(sourceLayer === 'mapxus_place' && type === 'symbol'
                ? [[
                    'any',
                    [
                        'all',
                        ['has', 'overlap'],
                        ['in', 'ref:building', ...(this && this._upperBuildings ? this._upperBuildings : [])],
                    ],
                    ['!has', 'overlap'],
                ]]
                : []),
            filter
        ];

        map.setFilter(id, newFilter);

        if (type === 'symbol') {
            map.setPaintProperty(id, 'symbol-z-offset', elevationOffset);
        }
        if (type === 'fill') {
            map.setPaintProperty(id, 'fill-z-offset', elevationOffset);
        }
        if (type === 'line') {
            map.setLayoutProperty(id, 'line-z-offset', elevationOffset);
        }
    }
}

function createFloorControl(mergedLevels) {
    const container = document.createElement('div');

    const title = document.createElement('h3');
    title.className = 'ui-panel-title';
    title.textContent = 'フロア選択'; // "Floor Selection"
    container.appendChild(title);
    document.getElementById('ui-panel').appendChild(container);

    const floorControl = document.createElement('div');
    floorControl.id = 'floor-control';

    const upButton = document.createElement('button');
    upButton.textContent = '▲';
    upButton.classList.add('scroll-button');
    floorControl.appendChild(upButton);

    const floorList = document.createElement('div');
    floorList.classList.add('floor-list');
    floorControl.appendChild(floorList);

    const downButton = document.createElement('button');
    downButton.textContent = '▼';
    downButton.classList.add('scroll-button');
    floorControl.appendChild(downButton);

    mergedLevels.sort((a, b) => b.ordinal - a.ordinal).forEach(level => {
        const button = document.createElement('button');
        button.textContent = `${level.name}`;
        button.classList.add('floor-button');
        button.dataset.ordinal = level.ordinal;

        button.addEventListener('click', () => {
            let elevation = Math.max(level.ordinal * 4, 0);
            if (is2D) elevation = 0;
            filterIndoorLayers(level.ids, undefined, elevation);
            const extrusionHeight = elevation * 0.999;
            map.setFilter('mapxus-floor-base', ['in', 'id', ...level.ids]);
            map.setPaintProperty('mapxus-floor-base', 'fill-extrusion-height', extrusionHeight);
            [...floorList.children].forEach(b => b.classList.remove('selected'));
            button.classList.add('selected');

            map.setFilter('start-point-layer', ['in', 'ref:level', ...level.ids]);
            map.setFilter('end-point-layer', ['in', 'ref:level', ...level.ids]);

            const routeGeoJSONForFloor = { type: 'FeatureCollection', features: [] };
            level.ids.forEach(floorId => {
                if (routeSegmentsByFloor[floorId]) {
                    routeGeoJSONForFloor.features.push(...routeSegmentsByFloor[floorId].features);
                }
            });

            if (map.getSource('route')) {
                // If the source already exists, just update its data
                map.getSource('route').setData(routeGeoJSONForFloor);
            } else if (routeGeoJSONForFloor.features.length > 0) {
                // If the source does NOT exist AND we have route data to show,
                // add the source and the layer for the first time.
                map.addSource('route', {
                    type: 'geojson',
                    data: routeGeoJSONForFloor
                });
                map.addLayer({
                    id: 'route-layer',
                    type: 'line',
                    source: 'route',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    paint: {
                        'line-color': '#007bff',
                        'line-width': 6,
                        'line-opacity': 0.8
                    },
                    minzoom: 16,
                });
            }
        });

        if (level.ordinal === 0) {
            setTimeout(() => button.click(), 100);
        }

        floorList.appendChild(button);
    });

    upButton.addEventListener('click', () => {
        floorList.scrollTop -= 40;
    });
    downButton.addEventListener('click', () => {
        floorList.scrollTop += 40;
    });

    container.appendChild(floorControl);
}

function createClipLayer() {
    const venueFeatures = map.queryRenderedFeatures({ layers: ['mapxus-venue-fill'] })
        .filter(f => f.geometry && (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'));

    const clipGeoJSON = {
        type: 'FeatureCollection',
        features: venueFeatures
    };

    map.addSource('eraser', {
        type: 'geojson',
        data: clipGeoJSON
    });

    map.addLayer({
        id: 'eraser',
        type: 'clip',
        slot: 'top',
        source: 'eraser',
        layout: {
            'clip-layer-types': ['symbol', 'model']
        },
        minzoom: 16,
    });

    const buildingLayers = map.getStyle().layers.filter(l =>
        l.id === 'building' && (l.type === 'fill' || l.type === 'fill-extrusion')
    ).map(l => l.id);

    const buildingFeatures = map.queryRenderedFeatures({
        layers: buildingLayers
    }).filter(f => f.geometry && (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'));

    const hiddenBuildingIds = [];

    buildingFeatures.forEach(building => {
        const buildingGeom = {
            type: 'Feature',
            geometry: building.geometry
        };

        for (const venue of venueFeatures) {
            if (turf.booleanIntersects(buildingGeom, venue)) {
                hiddenBuildingIds.push(building.id);
                break;
            }
        }
    });

    // Set filter on building layers
    buildingLayers.forEach(layerId => {
        map.setFilter(layerId, ['!in', '$id', ...hiddenBuildingIds]);
    });
}

async function loadMap() {
    const appId = 'dd3a2fbee747468a84e26577e4028cf4';
    const secret = '8d9b8c5313c34295ba321667ee0e2eab';
    const levelId = 'b870a8334ece4d8db96ce0790c2c8d29';

    mapxusToken = await fetchMapxusToken(appId, secret);

    const mapConfig = {
        container: 'map',
        center: defaultCoordinates,
        zoom: 16,
        language: 'ja',
        scrollZoom: true,
        transformRequest: (url, resourceType) => {
            if (url.includes('map-api.mapxus.co.jp')) {
                // This logic is now handled by the service worker
                return {
                    url: url,
                    headers: { 'token': mapxusToken }
                };
            }
        },
        maxzoom: 19,
    };

    if (is2D) {
        mapConfig.style = 'mapbox://styles/mapbox/streets-v12';
    }

    map = new mapboxgl.Map(mapConfig);

    map.boxZoom.disable();
    map.dragPan.disable();
    map.dragRotate.disable();
    map.keyboard.disable();
    map.doubleClickZoom.disable();
    map.touchZoomRotate.disable();

    map.on('click', async (event) => {
        const coords = event.lngLat;
        console.log(`[${coords.lng},${coords.lat}]`);

        // Query rendered features at the clicked point
        const features = map.queryRenderedFeatures(event.point, {
            layers: map.getStyle().layers
                .filter(layer => layer.source === 'indoor-planet' && layer.type === 'symbol')
                .map(layer => layer.id) // Get IDs of all symbol layers from indoor-planet source
        });

        // Log the properties of each feature
        if (features.length > 0) {
            console.log('Clicked Features:');
            features.forEach(feature => {
                console.log(feature.properties);
            });
        } else {
            console.log('No features clicked.');
        }
    });

    async function loadIcons() {
        const spriteJsonUrl = 'https://map-api.mapxus.co.jp/maps/v1/sprites/mapxus_style_v1/sprite@2x.json';
        const spritePngUrl = 'https://map-api.mapxus.co.jp/maps/v1/sprites/mapxus_style_v1/sprite@2x.png';

        updateAPICounter('sprites'); // Count sprite JSON call
        updateAPICounter('sprites');

        const [spriteMeta, spriteImage] = await Promise.all([
            fetch(spriteJsonUrl, {
                headers: { 'token': mapxusToken }
            }).then(res => res.json()),
            fetch(spritePngUrl, {
                headers: { 'token': mapxusToken }
            }).then(res => res.blob()).then(createImageBitmap)
        ]);

        for (const iconName in spriteMeta) {
            if (map.hasImage(`mapxus-${iconName}`)) continue;

            const { x, y, width, height, pixelRatio } = spriteMeta[iconName];
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            ctx.drawImage(spriteImage, x, y, width, height, 0, 0, width, height);
            const iconBitmap = await createImageBitmap(canvas);
            map.addImage(`mapxus-${iconName}`, iconBitmap, { pixelRatio });
        }

        try {
            const response = await fetch('https://kenji-shima.github.io/resource-files/images/location.png');
            const imageBlob = await response.blob();
            const imageBitmap = await createImageBitmap(imageBlob);

            if (!map.hasImage('custom-location')) {
                map.addImage('custom-location', imageBitmap);
            }
        } catch (e) {
            console.error('An error occurred while loading the custom marker image.', e);
        }
    }

    map.on('load', async () => {
        await loadIcons();
        createVenueDropdown();

        map.addSource('indoor-planet', {
            type: 'vector',
            tiles: [
                `https://map-api.mapxus.co.jp/maps/v1/tiles/indoor/{z}/{x}/{y}`
            ],
            minzoom: 16,
            maxzoom: 19,
            lineMetrics: true
        });

        updateAPICounter('style');

        const styleRes = await fetch('https://map-api.mapxus.co.jp/maps/v1/styles/mapxus_mims2_v6', {
            headers: { 'token': mapxusToken }
        });
        const styleJson = await styleRes.json();

        const indoorLayers = styleJson.layers.filter(layer => layer.source === 'indoor-planet');

        const delayedIndoorLayers = [];

        indoorLayers.forEach(layer => {
            if (layer.layout) {
                if (layer.layout['text-font']) {
                    delete layer.layout['text-font'];
                }
                if (layer.layout['text-field']) {
                    layer.layout['text-field'] = ['get', 'name:ja'];
                }
                function prefixImageExpressions(expression) {
                    if (!Array.isArray(expression)) return expression;
                    if (expression[0] === 'image' && typeof expression[1] === 'string') {
                        return ['image', `mapxus-${expression[1]}`];
                    }
                    return expression.map(item =>
                        Array.isArray(item) ? prefixImageExpressions(item) : item
                    );
                }
                if (layer.layout['icon-image']) {
                    if (typeof layer.layout['icon-image'] === 'string') {
                        layer.layout['icon-image'] = 'mapxus-' + layer.layout['icon-image'];
                    } else {
                        layer.layout['icon-image'] = prefixImageExpressions(layer.layout['icon-image']);
                    }
                }
            }

            if (layer.id === 'mapxus-venue-fill') {
                map.addLayer(layer); // Add venue-fill immediately
            } else {
                if (!layer.layout) layer.layout = {};
                layer.layout.visibility = 'none';
                if (!layer.metadata) layer.metadata = {};
                layer.metadata.category = 'indoor';
                delayedIndoorLayers.push(layer); // Defer adding other layers
            }

        });

        map.once('idle', () => {
            levelMap.clear();
            map.querySourceFeatures('indoor-planet', {
                sourceLayer: 'mapxus_place'
            })
                .map(f => ({
                    name: f.properties['name:ja'] || f.properties.name,
                    coords: f.geometry.coordinates
                }));

            allPlaces = map.querySourceFeatures('indoor-planet', {
                sourceLayer: 'mapxus_place'
            });
            const levelFeatures = map.querySourceFeatures('indoor-planet', {
                sourceLayer: 'mapxus_level'
            });
            // console.log(levelFeatures.map(f => ({
            //     id: f.properties.id,
            //     name: f.properties.name,
            //     ordinal: f.properties.ordinal
            // })));

            // Group level features by ordinal, merging floors like 1F from multiple buildings
            levelFeatures.forEach(f => {
                const ordinal = parseInt(f.properties.ordinal);
                const entry = levelMap.get(ordinal) || { ordinal, name: f.properties.name, ids: [] };
                entry.ids.push(f.properties.id);
                levelMap.set(ordinal, entry);

                levelIdToOrdinalMap.set(f.properties.id, parseInt(f.properties.ordinal));
            });

            console.log('Merged levels:', Array.from(levelMap.values()));
            console.log('Level ID to Ordinal Map:', Array.from(levelIdToOrdinalMap.entries()));

            mergedLevels = Array.from(levelMap.values());
            mergedLevels.sort((a, b) => a.ordinal - b.ordinal);

            createFloorControl(mergedLevels);
            createRoutingControl();
            createClipLayer();

            // Reveal previously hidden indoor layers
            delayedIndoorLayers.forEach(layer => {
                //if(layer.id === 'mapxus-unit-line' || layer.id === 'mapxus-gate') return;
                map.addLayer(layer);
                map.setLayoutProperty(layer.id, 'visibility', 'visible');
            });

            const startEndLayout = {
                'icon-image': 'custom-location',
                'icon-size': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    16, 0.01,
                    20, 0.1
                ],
                'icon-allow-overlap': true,
                'icon-ignore-placement': true,
                'icon-anchor': 'bottom'
            };

            map.addSource('start-point-source', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });
            map.addLayer({
                id: 'start-point-layer',
                type: 'symbol',
                source: 'start-point-source',
                layout: startEndLayout,
                minzoom: 16,
            });

            map.addSource('end-point-source', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });
            map.addLayer({
                id: 'end-point-layer',
                type: 'symbol',
                source: 'end-point-source',
                layout: startEndLayout,
                minzoom: 16,
            });

            map.addLayer({
                id: 'mapxus-floor-base',
                type: 'fill-extrusion',
                source: 'indoor-planet',
                'source-layer': 'mapxus_level',
                filter: ['in', 'id', ...mergedLevels.find(l => l.ordinal === 0).ids],
                paint: {
                    'fill-extrusion-color': 'hsl(20, 15%, 85%)',
                    'fill-extrusion-base': 0,
                    'fill-extrusion-opacity': 1
                },
                layout: {
                    visibility: 'visible'
                }
            }, 'mapxus-unit-fill');

            map.easeTo({
                center: defaultCoordinates,
                zoom: 14.2,
                pitch: 45,
                bearing: -30,
                duration: 1000
            });

            setTimeout(() => {
                map.easeTo({
                    center: defaultCoordinates,
                    zoom: 18,
                    pitch: 45,
                    bearing: -120,
                    duration: 1000
                });

                map.once('moveend', () => {
                    map.boxZoom.enable();
                    map.dragPan.enable();
                    map.dragRotate.enable();
                    map.keyboard.enable();
                    map.doubleClickZoom.enable();
                    map.touchZoomRotate.enable();
                });
            }, 1000);

            // Diagnostic: log symbol layers missing symbol-z-offset elevation
            // const unelevatedSymbols = map.getStyle().layers.filter(l =>
            //     l.type === 'symbol' &&
            //     l.source === 'indoor-planet' &&
            //     !(l.paint && l.paint['symbol-z-offset'])
            // );
            // console.log('Symbol layers missing elevation:', unelevatedSymbols.map(l => l.id));
        });

    });
}


function createVenueDropdown() {
    document.getElementById('ui-panel').innerHTML = '';

    const container = document.createElement('div');

    const title = document.createElement('h3');
    title.className = 'ui-panel-title';
    title.textContent = '施設選択'; // "Venue Selection"
    container.appendChild(title);
    document.getElementById('ui-panel').appendChild(container);

    const dropdown = document.createElement('select');
    dropdown.id = 'venue-dropdown';

    const defaultOption = document.createElement('option');
    defaultOption.textContent = '施設を選択';
    defaultOption.value = '';
    dropdown.appendChild(defaultOption);

    venues.forEach(venue => {
        const option = document.createElement('option');
        option.textContent = venue.name;
        option.value = JSON.stringify(venue.coordinates);
        // Set as selected if coordinates match defaultCoordinates
        if (JSON.stringify(venue.coordinates) === JSON.stringify(defaultCoordinates)) {
            option.selected = true;
        }
        dropdown.appendChild(option);
    });

    dropdown.addEventListener('change', (e) => {
        const coords = JSON.parse(e.target.value);
        defaultCoordinates = coords;
        loadMap();
    });

    container.appendChild(dropdown);
}

let allPlaces = [];
let levelIdToOrdinalMap = new Map();
let levelMap = new Map();
let mergedLevels = [];

let startPlace = null;
let endPlace = null;
let routeSegmentsByFloor = {};

function createRoutingControl() {
    const routingContainer = document.createElement('div');
    routingContainer.id = 'routing-container';

    const title = document.createElement('h3');
    title.className = 'ui-panel-title';
    title.textContent = '経路検索'; // "Route Search"
    routingContainer.appendChild(title);

    // Helper function to create a search module (label, display, input, results)
    const createSearchModule = (id, labelText) => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('routing-point');

        const label = document.createElement('div');
        label.className = 'routing-point-label';
        label.textContent = labelText;

        const displayBox = document.createElement('div');
        displayBox.id = `${id}-display`;
        displayBox.className = 'routing-display-box';
        displayBox.textContent = '場所を選択してください';

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = `${labelText}を検索...`;
        searchInput.id = `${id}-search-input`;
        searchInput.className = 'routing-search-input';

        const resultsContainer = document.createElement('div');
        resultsContainer.id = `${id}-search-results`;
        resultsContainer.className = 'search-results';

        wrapper.appendChild(label);
        wrapper.appendChild(displayBox);
        wrapper.appendChild(searchInput);
        wrapper.appendChild(resultsContainer);

        return { wrapper, searchInput, resultsContainer, displayBox };
    };

    const startModule = createSearchModule('start', '出発地');
    const endModule = createSearchModule('end', '目的地');

    // --- Action Buttons ---
    const actionsWrapper = document.createElement('div');
    actionsWrapper.className = 'routing-actions';

    const routeButton = document.createElement('button');
    routeButton.id = 'route-button';
    routeButton.className = 'routing-button';
    routeButton.textContent = '経路検索';

    const clearButton = document.createElement('button');
    clearButton.id = 'clear-route-button';
    clearButton.className = 'routing-button';
    clearButton.textContent = 'クリア';

    actionsWrapper.appendChild(routeButton);
    actionsWrapper.appendChild(clearButton);

    routingContainer.appendChild(startModule.wrapper);
    routingContainer.appendChild(endModule.wrapper);
    routingContainer.appendChild(actionsWrapper);

    const instructionsTitle = document.createElement('h3');
    instructionsTitle.id = 'instructions-title';
    instructionsTitle.className = 'ui-panel-title';
    instructionsTitle.textContent = '経路案内'; // "Route Guidance"
    instructionsTitle.style.display = 'none';
    routingContainer.appendChild(instructionsTitle);

    const instructionsContainer = document.createElement('div');
    instructionsContainer.id = 'instructions-container';
    instructionsContainer.className = 'instructions-container'; // For styling
    instructionsContainer.style.display = 'none';
    routingContainer.appendChild(instructionsContainer);

    document.getElementById('ui-panel').appendChild(routingContainer);

    // --- Event Handling ---

    const setDestination = (place, type) => {
        console.log('Setting destination:', place, 'Type:', type);
        const placeName = place.properties['name:ja'] || place.properties.name;
        const levelId = place.properties['ref:level'];
        const ordinal = levelIdToOrdinalMap.get(levelId);
        const floorName = levelMap.get(ordinal)?.name || '';
        const displayText = `${placeName} (${floorName})`;

        if (type === 'start') {
            startPlace = place;
            startModule.displayBox.textContent = displayText;
            startModule.searchInput.value = '';
            startModule.resultsContainer.innerHTML = '';
            map.getSource('start-point-source').setData(place);
        } else {
            endPlace = place;
            endModule.displayBox.textContent = displayText;
            endModule.searchInput.value = '';
            endModule.resultsContainer.innerHTML = '';
            map.getSource('end-point-source').setData(place);
        }

        const floorButtons = document.querySelectorAll('.floor-button');
        const targetFloorButton = [...floorButtons].find(btn => parseInt(btn.dataset.ordinal) === ordinal);

        if (targetFloorButton) {
            targetFloorButton.click();
        }
        map.flyTo({ center: place.geometry.coordinates, zoom: 20, pitch: 45 });
    };

    const handleSearchInput = (e, resultsContainer, type) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        resultsContainer.innerHTML = '';
        if (searchTerm.length < 1) return;

        const filteredPlaces = allPlaces.filter(p => (p.properties['name:ja'] || p.properties.name || '').toLowerCase().includes(searchTerm));

        filteredPlaces.slice(0, 5).forEach(place => {
            const item = document.createElement('div');
            item.className = 'search-result-item';
            const placeName = place.properties['name:ja'] || place.properties.name;
            const floorName = levelMap.get(levelIdToOrdinalMap.get(place.properties['ref:level']))?.name || '';
            item.textContent = `${placeName} (${floorName})`;
            item.onclick = () => setDestination(place, type);
            resultsContainer.appendChild(item);
        });
    };

    startModule.searchInput.addEventListener('input', (e) => handleSearchInput(e, startModule.resultsContainer, 'start'));
    endModule.searchInput.addEventListener('input', (e) => handleSearchInput(e, endModule.resultsContainer, 'end'));

    routeButton.addEventListener('click', async () => { // Make this function async
        if (!startPlace || !endPlace) {
            alert('出発地と目的地を選択してください。');
            return;
        }

        document.getElementById('instructions-title').style.display = 'block';
        const instructionsContainer = document.getElementById('instructions-container');
        instructionsContainer.style.display = 'block';
        instructionsContainer.innerHTML = '';

        // 1. Format coordinates string for the API
        const startCoords = startPlace.geometry.coordinates;
        const startFloorId = startPlace.properties['ref:level'];
        const startPointStr = `${startCoords[0]},${startCoords[1]},${startFloorId}`;

        const endCoords = endPlace.geometry.coordinates;
        const endFloorId = endPlace.properties['ref:level'];
        const endPointStr = `${endCoords[0]},${endCoords[1]},${endFloorId}`;

        const coordinatesParam = `${startPointStr};${endPointStr}`;

        // 2. Build the API URL
        const navApiUrl = new URL('https://map-api.mapxus.co.jp/navigation/v1/directions');
        navApiUrl.searchParams.append('coordinates', coordinatesParam);
        navApiUrl.searchParams.append('lang', 'ja');
        navApiUrl.searchParams.append('vehicle', 'foot');

        try {
            updateAPICounter('navigation');
            // 3. Fetch the route from the API
            const response = await fetch(navApiUrl, {
                method: 'GET',
                headers: { 'token': mapxusToken }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Navigation API Error (${error.code}): ${error.message}`);
            }

            const routeData = await response.json();
            if (!routeData.paths || routeData.paths.length === 0) {
                alert('経路が見つかりませんでした。');
                return;
            }

            console.log('Route data:', routeData);

            const instructionsContainer = document.getElementById('instructions-container');
            instructionsContainer.innerHTML = '';

            // 4. Process the route into segments and store them globally
            routeSegmentsByFloor = {}; // Clear previous route
            const { instructions, points } = routeData.paths[0];
            const allCoords = points.coordinates;

            instructions.forEach(instruction => {
                const floorId = instruction.floorId;
                if (!floorId) return;

                const segmentCoords = allCoords.slice(instruction.interval[0], instruction.interval[1] + 1);
                if (segmentCoords.length < 2) return;

                const segmentFeature = { type: 'Feature', geometry: { type: 'LineString', coordinates: segmentCoords }, properties: {} };

                if (!routeSegmentsByFloor[floorId]) {
                    routeSegmentsByFloor[floorId] = { type: 'FeatureCollection', features: [] };
                }
                routeSegmentsByFloor[floorId].features.push(segmentFeature);

                const item = document.createElement('div');
                item.className = 'instruction-item';
                const ordinal = levelIdToOrdinalMap.get(floorId);
                const floorName = levelMap.get(ordinal)?.name || '';
                item.textContent = `${instruction.text} (${floorName})`;
                instructionsContainer.appendChild(item);
            });

            // 5. CRITICAL FIX: Find the starting floor and programmatically click its button.
            // This will trigger the floor change and the drawing logic in the floor button's own click listener.
            const startOrdinal = levelIdToOrdinalMap.get(startFloorId);
            const floorButtons = document.querySelectorAll('.floor-button');
            const startFloorButton = [...floorButtons].find(btn => parseInt(btn.dataset.ordinal) === startOrdinal);

            if (startFloorButton) {
                startFloorButton.click();
                map.flyTo({ center: startCoords, zoom: 20, pitch: 45 });
            } else {
                console.error('Could not find the floor button for the starting destination.');
            }

        } catch (error) {
            console.error('Failed to fetch route:', error);
            alert(`経路検索に失敗しました: ${error.message}`);
        }
    });

    clearButton.addEventListener('click', () => {
        startPlace = null;
        endPlace = null;
        startModule.displayBox.textContent = '場所を選択してください';
        endModule.displayBox.textContent = '場所を選択してください';

        if (map.getSource('start-point-source')) {
            map.getSource('start-point-source').setData({ type: 'FeatureCollection', features: [] });
        }
        if (map.getSource('end-point-source')) {
            map.getSource('end-point-source').setData({ type: 'FeatureCollection', features: [] });
        }

        document.getElementById('instructions-title').style.display = 'none';
        const instructionsContainer = document.getElementById('instructions-container');
        instructionsContainer.innerHTML = '';
        instructionsContainer.style.display = 'none';

        routeSegmentsByFloor = {};

        // Remove the route line from the map
        if (map.getSource('route')) {
            map.removeLayer('route-layer');
            map.removeSource('route');
        }
    });
}

loadMap();
displayAPICounters();