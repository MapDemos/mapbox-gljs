const STYLE = 'mapbox://styles/mapbox/dark-v10';
const CENTER = [135.49766971277631, 34.70325783175586];
const ZOOM = 15.95;
const ZOOM_SELECTION = 18.95;
const PITCH = 60;
const FLOOR_IDS = [-7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4];
const DELTA = 0.01;

const COLOR_MAIN = '#0f0';
const COLOR_HOVER = '#0ff';
const COLOR_SELECTION = '#ff0';
const COLOR_TEXT = '#fff';
const COLOR_HALO = '#333';

const OPACITY_FLOOR = 0.2;
const OPACITY_ROOM = 0.5;

function getNearestFeatureId(lngLat, features) {
    return features.map(feature => ({
        feature,
        distance: turf.distance([lngLat.lng, lngLat.lat], turf.centerOfMass(feature))
    })).sort((a, b) => a.distance - b.distance)[0].feature.id;
}

class ButtonControl {

    constructor(optionArray) {
        this._options = optionArray.map(options => ({
            className: options.className || '',
            title: options.title || '',
            eventHandler: options.eventHandler
        }));
    }

    onAdd(map) {
        const me = this;

        me._map = map;

        me._container = document.createElement('div');
        me._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';

        me._buttons = me._options.map(options => {
            const button = document.createElement('button'),
                icon = document.createElement('span'),
                {className, title, eventHandler} = options;

            button.className = className;
            button.type = 'button';
            button.title = title;
            button.setAttribute('aria-label', title);
            button.onclick = eventHandler;

            icon.className = 'mapboxgl-ctrl-icon';
            icon.setAttribute('aria-hidden', true);
            button.appendChild(icon);

            me._container.appendChild(button);

            return button;
        });

        return me._container;
    }

    onRemove() {
        const me = this;

        me._container.parentNode.removeChild(me._container);
        me._map = undefined;
    }

}

class SearchBoxControl {
    constructor(accessToken) {
        this.accessToken = accessToken;
    }

    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
        this._container.style.width = '300px';
        
        this._input = document.createElement('input');
        this._input.type = 'text';
        this._input.placeholder = '場所を検索';
        this._input.className = 'mapbox-search-input';
        this._input.style.width = '100%';
        this._input.style.padding = '8px';
        this._input.style.border = 'none';
        this._input.style.borderRadius = '4px';
        this._input.style.fontSize = '14px';
        this._input.style.outline = 'none';
        
        this._resultsContainer = document.createElement('div');
        this._resultsContainer.className = 'mapbox-search-results';
        this._resultsContainer.style.position = 'absolute';
        this._resultsContainer.style.top = '100%';
        this._resultsContainer.style.left = '0';
        this._resultsContainer.style.right = '0';
        this._resultsContainer.style.backgroundColor = 'white';
        this._resultsContainer.style.border = '1px solid #ccc';
        this._resultsContainer.style.borderTop = 'none';
        this._resultsContainer.style.maxHeight = '200px';
        this._resultsContainer.style.overflowY = 'auto';
        this._resultsContainer.style.zIndex = '1000';
        this._resultsContainer.style.display = 'none';
        
        this._container.style.position = 'relative';
        this._container.appendChild(this._input);
        this._container.appendChild(this._resultsContainer);
        
        let searchTimeout;
        this._input.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            // Reduced minimum length for Japanese characters (which can be more meaningful with fewer characters)
            if (query.length < 2) {
                this._hideResults();
                return;
            }
            
            searchTimeout = setTimeout(() => {
                this._searchPlaces(query);
            }, 300);
        });
        
        this._input.addEventListener('blur', () => {
            // Delay hiding results to allow clicks on results
            setTimeout(() => this._hideResults(), 150);
        });
        
        return this._container;
    }
    
    async _searchPlaces(query) {
        try {
            const center = this._map.getCenter();
            // Using Mapbox Search Box API instead of Geocoding API
            const url = `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(query)}&access_token=${this.accessToken}&session_token=${this._getSessionToken()}&proximity=${center.lng},${center.lat}&limit=10&country=jp&language=ja&types=poi,place,address`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            this._displayResults(data.suggestions || []);
        } catch (error) {
            console.error('Search error:', error);
        }
    }
    
    _getSessionToken() {
        if (!this._sessionToken) {
            this._sessionToken = this._generateSessionToken();
        }
        return this._sessionToken;
    }
    
    _generateSessionToken() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    async _retrievePlace(suggestion) {
        try {
            const url = `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.mapbox_id}?access_token=${this.accessToken}&session_token=${this._getSessionToken()}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            return data.features[0];
        } catch (error) {
            console.error('Retrieve error:', error);
            return null;
        }
    }
    
    _displayResults(suggestions) {
        this._resultsContainer.innerHTML = '';
        
        if (suggestions.length === 0) {
            this._hideResults();
            return;
        }
        
        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'mapbox-search-result-item';
            item.style.padding = '8px 12px';
            item.style.cursor = 'pointer';
            item.style.borderBottom = '1px solid #eee';
            item.style.fontSize = '14px';
            
            // Search Box API structure
            const mainName = suggestion.name || suggestion.full_address;
            const fullName = suggestion.full_address || suggestion.name;
            
            item.innerHTML = `
                <div style="font-weight: bold;">${mainName}</div>
                <div style="font-size: 12px; color: #666;">${fullName}</div>
            `;
            
            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = '#f0f0f0';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = 'white';
            });
            
            item.addEventListener('click', () => {
                this._selectSuggestion(suggestion);
            });
            
            this._resultsContainer.appendChild(item);
        });
        
        this._showResults();
    }
    
    async _selectSuggestion(suggestion) {
        // First retrieve the full place details
        const feature = await this._retrievePlace(suggestion);
        
        if (!feature) {
            console.error('Could not retrieve place details');
            return;
        }
        
        const [lng, lat] = feature.geometry.coordinates;
        
        // Clear search input and hide results
        this._input.value = suggestion.name || suggestion.full_address;
        this._hideResults();
        
        // Fly to the selected location
        this._map.flyTo({
            center: [lng, lat],
            zoom: 16,
            duration: 2000
        });
        
        // Add a temporary marker
        const marker = new mapboxgl.Marker({ color: '#ff0000' })
            .setLngLat([lng, lat])
            .addTo(this._map);
        
        // Remove marker after 5 seconds
        setTimeout(() => {
            marker.remove();
        }, 5000);
        
        console.log('Selected place:', suggestion.name || suggestion.full_address, [lng, lat]);
    }
    
    _showResults() {
        this._resultsContainer.style.display = 'block';
    }
    
    _hideResults() {
        this._resultsContainer.style.display = 'none';
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}

class MapSwitchControl {
    constructor(currentMode = '3D') {
        this.currentMode = currentMode;
    }

    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
        this._container.style.marginBottom = '5px';
        
        this._button = document.createElement('button');
        this._button.className = 'mapbox-ctrl-switch';
        this._button.type = 'button';
        this._button.setAttribute('aria-label', 'Switch map mode');
        this._button.style.padding = '8px 14px';
        this._button.style.fontSize = '12px';
        this._button.style.fontWeight = '500';
        this._button.style.color = 'white';
        this._button.style.backgroundColor = '#4264fb';
        this._button.style.border = 'none';
        this._button.style.cursor = 'pointer';
        this._button.style.minWidth = '70px';
        this._button.style.width = 'auto';
        this._button.style.whiteSpace = 'nowrap';
        this._button.style.borderRadius = '4px';
        this._button.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
        this._button.style.transition = 'all 0.15s ease';
        this._button.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
        this._button.style.letterSpacing = '0.3px';
        
        // Add hover effects
        this._button.addEventListener('mouseenter', () => {
            this._button.style.backgroundColor = '#3653e7';
            this._button.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.15)';
            this._button.style.transform = 'translateY(-0.5px)';
        });
        
        this._button.addEventListener('mouseleave', () => {
            this._button.style.backgroundColor = '#4264fb';
            this._button.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            this._button.style.transform = 'translateY(0)';
        });
        
        this._button.addEventListener('mousedown', () => {
            this._button.style.transform = 'translateY(0)';
            this._button.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.15)';
        });
        
        this._button.addEventListener('mouseup', () => {
            this._button.style.transform = 'translateY(-0.5px)';
            this._button.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.15)';
        });
        
        this.updateButton();
        
        this._button.onclick = () => {
            if (this.currentMode === '3D') {
                toIndoor();
            } else {
                to3D();
            }
        };
        
        this._container.appendChild(this._button);
        
        return this._container;
    }
    
    updateButton() {
        if (this.currentMode === '3D') {
            this._button.title = 'Switch to Indoor Map';
            this._button.textContent = 'インドアマップ';
        } else {
            this._button.title = 'Switch to 3D Map';
            this._button.textContent = '3Dマップ';
        }
    }
    
    setMode(mode) {
        this.currentMode = mode;
        this.updateButton();
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }
}

class IndoorMap extends mapboxgl.Map {

    constructor(options) {
        super(Object.assign({
            style: STYLE,
            center: CENTER,
            zoom: ZOOM,
            pitch: PITCH
        }, options));

        // Add zoom and rotation controls to the map.
        this.addControl(new mapboxgl.NavigationControl());

        this.toggleFloorButtons();

        this.on('load', this.onLoad.bind(this));
        this.on('zoom', this.onZoom.bind(this));
        this.on('pitch', this.onPitch.bind(this));
    }

    onLoad() {
        this.addSource('indoor', {
            type: 'vector',
            url: 'mapbox://mapbox.indoor-v1'
        });

        this.farthestLayerId = `floor-line-${FLOOR_IDS[0]}`;

        for (const floorId of FLOOR_IDS) {
            const floorFilter = ['==', ['get', 'floor_id'], floorId];
            const roomFilter = [
                'all',
                ['any', ['!=', ['get', 'class'], 'area'], ['==', ['get', 'type'], 'Room']],
                ['!=', ['get', 'class'], 'floor']
            ];
            const opacity = this.getFloorOpacity(floorId);
            const translate = [0, this.getFloorTranslateY(floorId)];

            this.addLayer({
                id: `floor-line-${floorId}`,
                type: 'line',
                source: 'indoor',
                'source-layer': 'indoor_floorplan',
                filter: floorFilter,
                paint: {
                    'line-color': COLOR_MAIN,
                    'line-opacity': opacity,
                    'line-translate': translate,
                    'line-translate-anchor': 'viewport'
                }
            });

            this.addLayer({
                id: `structure-line-${floorId}`,
                type: 'line',
                source: 'indoor',
                'source-layer': 'indoor_structure',
                filter: floorFilter,
                paint: {
                    'line-color': COLOR_MAIN,
                    'line-opacity': opacity,
                    'line-translate': translate,
                    'line-translate-anchor': 'viewport'
                }
            });

            this.addLayer({
                id: `floor-fill-${floorId}`,
                type: 'fill-extrusion',
                source: 'indoor',
                'source-layer': 'indoor_floorplan',
                filter: ['all', floorFilter, ['!', roomFilter]],
                paint: {
                    'fill-extrusion-color': COLOR_MAIN,
                    'fill-extrusion-opacity': OPACITY_FLOOR * opacity,
                    'fill-extrusion-height': (+floorId - FLOOR_IDS[0]) * DELTA,
                    'fill-extrusion-translate': translate,
                    'fill-extrusion-translate-anchor': 'viewport'
                }
            });

            this.addLayer({
                id: `room-${floorId}`,
                type: 'fill-extrusion',
                source: 'indoor',
                'source-layer': 'indoor_floorplan',
                filter: ['all', floorFilter, roomFilter],
                paint: {
                    'fill-extrusion-color': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        COLOR_HOVER,
                        ['boolean', ['feature-state', 'selection'], false],
                        COLOR_SELECTION,
                        COLOR_MAIN
                    ],
                    'fill-extrusion-opacity': OPACITY_ROOM * opacity,
                    'fill-extrusion-height': 3 + (+floorId) * DELTA,
                    'fill-extrusion-translate': translate,
                    'fill-extrusion-translate-anchor': 'viewport'
                }
            });

            this.addLayer({
                id: `symbol-${floorId}`,
                type: 'symbol',
                source: 'indoor',
                'source-layer': 'indoor_poi_label',
                filter: floorFilter,
                layout: {
                    'text-field': ['get', 'name'],
                    'text-size': 12
                },
                paint: {
                    'text-color': COLOR_TEXT,
                    'text-opacity': 0,
                    'text-halo-color': COLOR_HALO,
                    'text-halo-blur': 1,
                    'text-halo-width': 1,
                    'text-translate': translate,
                    'text-translate-anchor': 'viewport'
                }
            });

            this.on('click', `room-${floorId}`, e => {
                this.hoverFeature();

                if ((isNaN(this.visibleFloorId) || floorId === this.visibleFloorId) && e.features.length > 0) {
                    this.selectFeature(getNearestFeatureId(e.lngLat, e.features));
                }
            });

            this.on('mousemove', `room-${floorId}`, e => {
                if ((isNaN(this.visibleFloorId) || floorId === this.visibleFloorId) && e.features.length > 0) {
                    this.hoverFeature(getNearestFeatureId(e.lngLat, e.features));
                }
            });

            this.on('mouseleave', `room-${floorId}`, () => {
                this.hoverFeature();
            });
        }
    }

    onZoom() {
        this.hoverFeature();
        this.updateMap();
    }

    onPitch() {
        this.hoverFeature();
        this.updateMap();
    }

    getFloorOpacity(floorId) {
        return isNaN(this.visibleFloorId) || floorId === this.visibleFloorId ? 1 : 0.1;
    }

    getFloorTranslateY(floorId) {
        const zoomFactor = Math.pow(2, this.getZoom() - 12);
        const pitchFactor = Math.sin(this.getPitch() * Math.PI / 180);

        return isNaN(this.visibleFloorId) ?
            -floorId * zoomFactor * pitchFactor :
            -(floorId - this.visibleFloorId) * zoomFactor * pitchFactor * 10;
    }

    toggleFloorButtons() {
        if (this.floorButtonControl) {
            this.removeControl(this.floorButtonControl);
            this.visibleFloorId = isNaN(this.visibleFloorId) ? this.floorIdForSelection || 0 : undefined;
        }

        this.floorButtonControl = new ButtonControl(isNaN(this.visibleFloorId) ? [{
            className: 'mapboxgl-ctrl-layer',
            title: 'Show floors',
            eventHandler: () => {
                this.toggleFloorButtons();
                this.selectFloor(this.visibleFloorId);
                this.updateMap();
            }
        }] : [{
            className: 'mapboxgl-ctrl-layer mapboxgl-ctrl-layer-active',
            title: 'Hide floors',
            eventHandler: () => {
                this.toggleFloorButtons();
                this.updateMap();
            }
        }, ...FLOOR_IDS.slice().reverse().map(floorId => ({
            className: `mapboxgl-ctrl-floor mapboxgl-ctrl-floor-${floorId}${floorId === this.visibleFloorId ? ' mapboxgl-ctrl-floor-active' : ''}`,
            title: floorId >= 0 ? `${floorId + 1}F` : `B${-floorId}F`,
            eventHandler: () => {
                if (floorId !== this.visibleFloorId) {
                    this.selectFloor(floorId);
                }
            }
        }))]);
        this.addControl(this.floorButtonControl);
    }

    selectFloor(floorId) {
        if (!isNaN(this.visibleFloorId)) {
            for (const button of document.getElementsByClassName('mapboxgl-ctrl-floor-active')) {
                button.classList.remove('mapboxgl-ctrl-floor-active');
            }
            this.visibleFloorId = floorId;
            for (const button of document.getElementsByClassName(`mapboxgl-ctrl-floor-${floorId}`)) {
                button.classList.add('mapboxgl-ctrl-floor-active');
            }
            this.updateMap();

            setTimeout(() => {
                this.moveLayer(`floor-fill-${floorId}`, this.farthestLayerId);
                this.moveLayer(`room-${floorId}`, this.farthestLayerId);
                this.farthestLayerId = `floor-fill-${floorId}`;
            }, 150);
        }
    }

    updateMap() {
        for (const floorId of FLOOR_IDS) {
            const opacity = this.getFloorOpacity(floorId);
            const translate = [0, this.getFloorTranslateY(floorId)];

            this.setPaintProperty(`floor-line-${floorId}`, 'line-opacity', opacity);
            this.setPaintProperty(`structure-line-${floorId}`, 'line-opacity', opacity);
            this.setPaintProperty(`floor-fill-${floorId}`, 'fill-extrusion-opacity', 0.2 * opacity);
            this.setPaintProperty(`room-${floorId}`, 'fill-extrusion-opacity', 0.5 * opacity);
            this.setPaintProperty(`symbol-${floorId}`, 'text-opacity', floorId === this.visibleFloorId ? 1 : 0);

            this.setPaintProperty(`floor-line-${floorId}`, 'line-translate', translate);
            this.setPaintProperty(`structure-line-${floorId}`, 'line-translate', translate);
            this.setPaintProperty(`floor-fill-${floorId}`, 'fill-extrusion-translate', translate);
            this.setPaintProperty(`room-${floorId}`, 'fill-extrusion-translate', translate);
            this.setPaintProperty(`symbol-${floorId}`, 'text-translate', translate);
        }
    }

    hoverFeature(id) {
        if (this.hoveredId) {
            this.setFeatureState(
                {source: 'indoor', sourceLayer: 'indoor_floorplan', id: this.hoveredId},
                {hover: false}
            );
        }
        if (id !== undefined) {
            this.hoveredId = id;
            this.setFeatureState(
                {source: 'indoor', sourceLayer: 'indoor_floorplan', id: this.hoveredId},
                {hover: true}
            );
            this.getCanvas().style.cursor = 'pointer';
        } else {
            this.hoveredId = undefined;
            this.getCanvas().style.cursor = '';
        }
    }

    selectFeature(id) {
        if (this.selection) {
            this.setFeatureState(
                {source: 'indoor', sourceLayer: 'indoor_floorplan', id: this.selection},
                {selection: false}
            );
        }

        this.selection = id;

        if (this.selection) {
            const feature = this.querySourceFeatures('indoor', {
                sourceLayer: 'indoor_floorplan',
                filter: ['==', ['id'], this.selection]
            });

            if (feature.length > 0) {
                const floorId = this.floorIdForSelection = feature[0].properties.floor_id;

                this.selectFloor(floorId);

                const translateY = this.getFloorTranslateY(floorId);

                this.easeTo({
                    center: turf.getCoord(turf.centerOfMass(feature[0])),
                    zoom: ZOOM_SELECTION,
                    padding: translateY < 0 ? {top: -translateY} : {bottom: translateY}
                });
            }

            this.setFeatureState(
                {source: 'indoor', sourceLayer: 'indoor_floorplan', id: this.selection},
                {selection: true}
            );

            this.fire({type: 'featureclick', id});
        }
    }

}

mapboxgl.accessToken = 'pk.eyJ1Ijoia2Vuamktc2hpbWEiLCJhIjoiY2xhZ2NmZ3BiMGFqbzNubThpbWMxOXU3MCJ9.JlXUW8MwwX1LhhMnbWyUQw';

const colorMain = '#888'

let center = CENTER
let zoom = ZOOM
let pitch = PITCH
let bearing = 160
let map; // Declare the map variable

lng = 139.7645445
lat = 35.6812405

function clearMap() {
    let container = document.getElementById('map')
    container.innerHTML = ''
}

function toIndoor() {
    // Save current map state before switching
    if (map && typeof map.getCenter === 'function') {
        center = map.getCenter();
        zoom = map.getZoom();
        pitch = map.getPitch();
        bearing = map.getBearing();
    }
    clearMap()
    map = new RouteIndoorMap({ container: 'map' })
    // Update the switch control mode
    if (map.mapSwitchControl) {
        map.mapSwitchControl.setMode('Indoor');
    }
}

function to3D() {
    // Save current map state before switching
    if (map && typeof map.getCenter === 'function') {
        center = map.getCenter();
        zoom = map.getZoom();
        pitch = map.getPitch();
        bearing = map.getBearing();
    }
    clearMap()
    map = new Map3D({ container: 'map' })
    // Update the switch control mode
    if (map.mapSwitchControl) {
        map.mapSwitchControl.setMode('3D');
    }
}

let startMarker;
let endMarker;
function setMarker(coordinates, color) {
    if (!color) color = '#ff0000'
    const marker = new mapboxgl.Marker({ color: color })
    marker.setLngLat(coordinates).addTo(map)
    return marker
}

const setStartMarker = (longitude, latitude) => {
    //resetPrevious(true);
    lng = longitude;
    lat = latitude
    if (startMarker) {
        startMarker.remove();
    }
    startMarker = setMarker([lng, lat], 'blue');
}

class Map3D extends mapboxgl.Map {

    constructor(options) {
        super(Object.assign({
            style: 'mapbox://styles/kenji-shima/clpjgdyhr000w01pxg9064ewm',
            center: center,
            zoom: zoom,
            pitch: pitch,
            bearing: bearing,
            language:'ja,en'
        }, options));

        this.doubleClickZoom.disable()

        // Add the switch control to the top-left (above search)
        this.mapSwitchControl = new MapSwitchControl('3D');
        this.addControl(this.mapSwitchControl, 'top-left');

        // Add the search control to the top-left (below switch)
        this.searchControl = new SearchBoxControl(mapboxgl.accessToken);
        this.addControl(this.searchControl, 'top-left');

        this.on('load', this.onLoad.bind(this));

        // Add click event to log coordinates
        this.on('click', (e) => {
            console.log('Clicked coordinates:', [e.lngLat.lng, e.lngLat.lat]);
        });

        /*this.polyDraw = new MapPolygonDrawer({
            map: this
        })*/

        /*this.legacyLayers = new LegacyLayers({
            map: this
        })*/
    }

    onToIndoor() {
        zoom = super.getZoom()
        pitch = super.getPitch()
        bearing = super.getBearing()
        center = super.getCenter()
        toIndoor()
    }

    onLoad() {
        super.setConfigProperty('basemap', 'showPlaceLabels', false)
        map.setConfigProperty('basemap', 'showRoadLabels', true)
        map.setConfigProperty('basemap', 'showPointOfInterestLabels', true)
        map.setConfigProperty('basemap', 'showTransitLabels', true);
        //map.setConfigProperty('basemap', 'lightPreset', 'night')
        super.setConfigProperty('basemap', 'font', "DIN Pro")

    }


}

class RouteIndoorMap extends IndoorMap {

    constructor(options) {
        super(Object.assign({
            style: 'mapbox://styles/kenji-shima/clpxmbav500im01r76qlb8svf',
            center: center,
            zoom: zoom,
            pitch: pitch,
            bearing: bearing,
            minZoom: 10
        }, options));

        // Add the switch control to the top-left (above search)
        this.mapSwitchControl = new MapSwitchControl('Indoor');
        this.addControl(this.mapSwitchControl, 'top-left');

        // Add the search control to the top-left (below switch)
        this.searchControl = new SearchBoxControl(mapboxgl.accessToken);
        this.addControl(this.searchControl, 'top-left');

        // Add click event to log coordinates
        this.on('click', (e) => {
            console.log('Clicked coordinates:', [e.lngLat.lng, e.lngLat.lat]);
        });

        /*this.polyDraw = new MapPolygonDrawer({
            map: this
        })*/
    }

    onStyleLoad() {
        this.visibleFloorId = 0
        this.toggleFloorButtons()
        this.selectFloor(this.visibleFloorId)
        document.getElementsByClassName('mapboxgl-ctrl-layer')[0].click()

    }

    onToB1(){
        this.selectFloor(-1)
    }

    onTo0(){
        this.selectFloor(0)
    }

    onLoad() {

        this.addSource('indoor', {
            type: 'vector',
            url: 'mapbox://mapbox.indoor-v1'
        });

        this.farthestLayerId = `floor-line-${FLOOR_IDS[0]}`;

        for (const floorId of FLOOR_IDS) {
            const floorFilter = ['==', ['get', 'floor_id'], floorId];
            const roomFilter = [
                'all',
                ['any', ['!=', ['get', 'class'], 'area'], ['==', ['get', 'type'], 'Room']],
                ['!=', ['get', 'class'], 'floor']
            ];
            const opacity = this.getFloorOpacity(floorId);
            const translate = [0, this.getFloorTranslateY(floorId)];

            this.addLayer({
                id: `floor-line-${floorId}`,
                type: 'line',
                source: 'indoor',
                'source-layer': 'indoor_floorplan',
                filter: floorFilter,
                paint: {
                    'line-color': colorMain,
                    'line-opacity': opacity,
                    'line-translate': translate,
                    'line-translate-anchor': 'viewport'
                }
            });

            this.addLayer({
                id: `structure-line-${floorId}`,
                type: 'line',
                source: 'indoor',
                'source-layer': 'indoor_structure',
                filter: floorFilter,
                paint: {
                    'line-color': colorMain,
                    'line-opacity': opacity,
                    'line-translate': translate,
                    'line-translate-anchor': 'viewport'
                }
            });

            this.addLayer({
                id: `floor-fill-${floorId}`,
                type: 'fill-extrusion',
                source: 'indoor',
                'source-layer': 'indoor_floorplan',
                filter: ['all', floorFilter, ['!', roomFilter]],
                paint: {
                    'fill-extrusion-color': colorMain,
                    'fill-extrusion-opacity': OPACITY_FLOOR * opacity,
                    'fill-extrusion-height': (+floorId - FLOOR_IDS[0]) * DELTA,
                    'fill-extrusion-translate': translate,
                    'fill-extrusion-translate-anchor': 'viewport'
                }
            });

            this.addLayer({
                id: `room-${floorId}`,
                type: 'fill-extrusion',
                source: 'indoor',
                'source-layer': 'indoor_floorplan',
                filter: ['all', floorFilter, roomFilter],
                paint: {
                    'fill-extrusion-color': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        COLOR_HOVER,
                        ['boolean', ['feature-state', 'selection'], false],
                        COLOR_SELECTION,
                        colorMain
                    ],
                    'fill-extrusion-opacity': OPACITY_ROOM * opacity,
                    'fill-extrusion-height': 3 + (+floorId) * DELTA,
                    'fill-extrusion-translate': translate,
                    'fill-extrusion-translate-anchor': 'viewport'
                }
            });

            this.addLayer({
                id: `symbol-${floorId}`,
                type: 'symbol',
                source: 'indoor',
                'source-layer': 'indoor_poi_label',
                "metadata": {
                    "mapbox:featureComponent": "point-of-interest-labels",
                    "mapbox:group": "Point of interest labels, poi-labels"
                },
                filter: floorFilter,
                layout: this.layout,
                paint: this.paint,
            });

            this.on('click', `room-${floorId}`, e => {
                this.hoverFeature();

                if ((isNaN(this.visibleFloorId) || floorId === this.visibleFloorId) && e.features.length > 0) {
                    this.selectFeature(getNearestFeatureId(e.lngLat, e.features));
                }
            });

            this.on('mousemove', `room-${floorId}`, e => {
                if ((isNaN(this.visibleFloorId) || floorId === this.visibleFloorId) && e.features.length > 0) {
                    this.hoverFeature(getNearestFeatureId(e.lngLat, e.features));
                }
            });

            this.on('mouseleave', `room-${floorId}`, () => {
                this.hoverFeature();
            });
        }
        this.onStyleLoad()
    }

    onTo3D() {
        zoom = super.getZoom()
        pitch = super.getPitch()
        bearing = super.getBearing()
        center = super.getCenter()
        to3D()
    }

    updateMap() {
        super.updateMap()
        for (const floorId of FLOOR_IDS) {
            const opacity = this.getFloorOpacity(floorId);
            this.setPaintProperty(`symbol-${floorId}`, 'icon-opacity', opacity);
            if (this.getLayer(`route-line-Indoor-${floorId}`)) {
                this.setPaintProperty(`route-line-Indoor-${floorId}`, 'line-opacity', opacity);
            }
            if (this.getLayer(`route-start-Indoor-${floorId}`)) {
                this.setPaintProperty(`route-start-Indoor-${floorId}`, 'text-opacity', opacity);
            }
            if (this.getLayer(`route-end-Indoor-${floorId}`)) {
                this.setPaintProperty(`route-end-Indoor-${floorId}`, 'text-opacity', opacity);
            }
        }
    }

    layout = {
        "text-size": 14,
        "icon-image": [
            "case",
            ["has", "maki_beta"],
            [
                "coalesce",
                ["image", ["get", "maki_beta"]],
                ["image", ["get", "maki"]]
            ],
            ["image", ["get", "maki"]]
        ],
        "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
        "text-offset": [0, 1.6],
        "text-anchor": [
            "step",
            ["zoom"],
            ["step", ["get", "sizerank"], "center", 5, "top"],
            17,
            ["step", ["get", "sizerank"], "center", 13, "top"]
        ],
        "text-field": ["coalesce", ["get", "name_ja"], ["get", "name"]]
    }

    paint = {
        //"text-emissive-strength": 1,
        "icon-opacity": 1,
        "text-halo-color": "hsl(20, 20%, 100%)",
        "text-halo-width": 0.5,
        //"text-halo-blur": 0.5,
        "text-color": [
            "match",
            ["get", "class"],
            "food_and_drink",
            "hsl(40, 95%, 43%)",
            "park_like",
            "hsl(110, 70%, 28%)",
            "education",
            "hsl(30, 50%, 43%)",
            "medical",
            "hsl(0, 70%, 58%)",
            "sport_and_leisure",
            "hsl(190, 60%, 48%)",
            ["store_like", "food_and_drink_stores"],
            "hsl(210, 70%, 58%)",
            ["commercial_services", "motorist", "lodging"],
            "hsl(260, 70%, 63%)",
            ["arts_and_entertainment", "historic", "landmark"],
            "hsl(320, 70%, 63%)",
            "hsl(210, 20%, 46%)"
        ]
    }
}

to3D()