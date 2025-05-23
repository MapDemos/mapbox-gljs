const is2D = true; // Set to false to use default Mapbox 3D style
const originalFilters = {};
const defaultCoordinates = [139.77342767111224, 35.687530312186524];

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
        button.textContent = level.name;
        button.classList.add('floor-button');

        button.addEventListener('click', () => {
            let elevation = Math.max(level.ordinal * 4, 0);
            if(is2D) elevation = 0;
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
    const venueFeatures = map.queryRenderedFeatures({ layers: ['mapxus-venue-fill'] });
    const polygons = venueFeatures
        .filter(f => f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon');

    const clipGeoJSON = {
        type: 'FeatureCollection',
        features: polygons
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

    // map.on('click', async (event) => {
    //     const coords = event.lngLat;
    //     console.log(`[${coords.lng},${coords.lat}]`);
    // })

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

loadMap();