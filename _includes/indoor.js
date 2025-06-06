const venues = [
//   { name: "三井アウトレットパーク マリンピア神戸", coordinates: [135.048538, 34.6261626] },
//   { name: "LaLa arena TOKYO-BAY", coordinates: [139.9897519, 35.6837911] },
  { name: "ららテラス HARUMI FLAG", coordinates: [139.7744125, 35.6513492] },
//   { name: "東京ミッドタウン（六本木）", coordinates: [139.73124, 35.6663925] },
//   { name: "ららテラスTOKYO-BAY", coordinates: [139.9949369, 35.681543] },
//   { name: "東京ミッドタウン八重洲", coordinates: [139.769174, 35.6791136] },
  { name: "ららぽーと門真･三井アウトレットパーク 大阪門真", coordinates: [135.5844238, 34.7319119] },
  { name: "ららぽーと和泉", coordinates: [135.4481652, 34.4374509] },
//   { name: "ららぽーと堺", coordinates: [135.5605418, 34.5409695] },
  { name: "ららぽーと富士見", coordinates: [139.5478683, 35.8600363] },
//   { name: "ららぽーとEXPOCITY", coordinates: [135.5353341, 34.8052491] },
//   { name: "淀屋橋 odona", coordinates: [135.5002415, 34.6911195] },
  { name: "ららぽーと柏の葉", coordinates: [139.951162, 35.8936338] },
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
  { name: "ららぽーと安城", coordinates: [137.0798505, 34.9653132] }
];
const is2D = true; // Set to false to use default Mapbox 3D style
const originalFilters = {};
//const defaultCoordinates = [139.77342767111224, 35.687530312186524];
let defaultCoordinates = venues[1].coordinates; 

async function fetchMapxusToken(appId, secret) {
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
        if (!layer["source-layer"]) continue;

        const sourceLayer = layer["source-layer"];
        if (
            sourceLayer === "mapxus_venue" ||
            sourceLayer === "mapxus_building" ||
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
            "all",
            sourceLayer === "mapxus_level"
                ? ["in", "id", ...displayedLevels]
                : ["in", "ref:level", ...displayedLevels],
            ...(sourceLayer === "mapxus_place" && type === "symbol"
                ? [[
                    "any",
                    [
                        "all",
                        ["has", "overlap"],
                        ["in", "ref:building", ...(this && this._upperBuildings ? this._upperBuildings : [])],
                    ],
                    ["!has", "overlap"],
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

        button.addEventListener('click', () => {
            let elevation = Math.max(level.ordinal * 4, 0);
            if (is2D) elevation = 0;
            filterIndoorLayers(level.ids, undefined, elevation);
            const extrusionHeight = elevation * 0.999;
            map.setFilter('mapxus-floor-base', ['in', 'id', ...level.ids]);
            map.setPaintProperty('mapxus-floor-base', 'fill-extrusion-height', extrusionHeight);
            [...floorList.children].forEach(b => b.classList.remove('selected'));
            button.classList.add('selected');
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

    document.body.appendChild(floorControl);
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

    const token = await fetchMapxusToken(appId, secret);

    const mapConfig = {
        container: 'map',
        center: defaultCoordinates,
        zoom: 16,
        language: 'ja',
        scrollZoom: true,
        transformRequest: (url, resourceType) => {
            if (url.includes("map-api.mapxus.co.jp")) {
                return {
                    url: url,
                    headers: { 'token': token }
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
    })

    async function loadIcons() {
        const spriteJsonUrl = 'https://map-api.mapxus.co.jp/maps/v1/sprites/mapxus_style_v1/sprite@2x.json';
        const spritePngUrl = 'https://map-api.mapxus.co.jp/maps/v1/sprites/mapxus_style_v1/sprite@2x.png';

        const [spriteMeta, spriteImage] = await Promise.all([
            fetch(spriteJsonUrl, {
                headers: { 'token': token }
            }).then(res => res.json()),
            fetch(spritePngUrl, {
                headers: { 'token': token }
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
    }

    map.on('load', async () => {
        await loadIcons();

        map.addSource('indoor-planet', {
            type: 'vector',
            tiles: [
                `https://map-api.mapxus.co.jp/maps/v1/tiles/indoor/{z}/{x}/{y}`
            ],
            minzoom: 16,
            maxzoom: 19,
            lineMetrics: true
        });

        const styleRes = await fetch('https://map-api.mapxus.co.jp/maps/v1/styles/mapxus_mims2_v6', {
            headers: { 'token': token }
        });
        const styleJson = await styleRes.json();

        const indoorLayers = styleJson.layers.filter(layer => layer.source === 'indoor-planet');
        console.log(indoorLayers);

        const delayedIndoorLayers = [];

        indoorLayers.forEach(layer => {
            console.log(layer);
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
            createVenueDropdown();
        });

        map.once('idle', () => {
            map.querySourceFeatures('indoor-planet', {
                sourceLayer: 'mapxus_place'
            })
                .map(f => ({
                    name: f.properties['name:ja'] || f.properties.name,
                    coords: f.geometry.coordinates
                }));
            const levelFeatures = map.querySourceFeatures('indoor-planet', {
                sourceLayer: 'mapxus_level'
            });
            console.log(levelFeatures.map(f => ({
                id: f.properties.id,
                name: f.properties.name,
                ordinal: f.properties.ordinal
            })));

            // Group level features by ordinal, merging floors like 1F from multiple buildings
            const levelMap = new Map();
            levelFeatures.forEach(f => {
                const ordinal = parseInt(f.properties.ordinal);
                const entry = levelMap.get(ordinal) || { ordinal, name: f.properties.name, ids: [] };
                entry.ids.push(f.properties.id);
                levelMap.set(ordinal, entry);
            });

            console.log('Merged levels:', Array.from(levelMap.values()));

            const mergedLevels = Array.from(levelMap.values());
            mergedLevels.sort((a, b) => a.ordinal - b.ordinal);

            createFloorControl(mergedLevels);
            createClipLayer();

            // Reveal previously hidden indoor layers
            delayedIndoorLayers.forEach(layer => {
                //if(layer.id === 'mapxus-unit-line' || layer.id === 'mapxus-gate') return;
                map.addLayer(layer);
                map.setLayoutProperty(layer.id, 'visibility', 'visible');
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
    const dropdown = document.createElement('select');
    dropdown.id = 'venue-dropdown';

    const defaultOption = document.createElement('option');
    defaultOption.textContent = '建物を選択';
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

    document.body.appendChild(dropdown);
}

loadMap();