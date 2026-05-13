mapboxgl.accessToken = 'pk.eyJ1IjoibWJ4c29sdXRpb25zIiwiYSI6ImNqeWtiM250dzBjcGMzbnQ1NXpkZml6YjUifQ.EiJnPlDOMMlG5wr93SxVYQ';

// csvName: name as it appears in the lookup CSV (when different from display name)
// centroid: used to disambiguate when multiple entries share the same csvName
const PLACES = [
    { name: 'Jawali',                   source: 'boundaries', lookup: 'pos4' },
    { name: 'Sissu',                    source: 'searchbox' },
    { name: 'Chopta',                   source: 'searchbox' },
    { name: 'Tamhini Ghat',             source: 'searchbox' },
    { name: 'Poombarai',                source: 'searchbox' },
    { name: 'Chandoli National Park',   source: 'searchbox' },
    { name: 'Gulma',                    source: 'searchbox' },
    { name: 'Surathkal',                source: 'boundaries', lookup: 'pos4' },
    { name: 'Attappadi',                source: 'boundaries', lookup: 'adm3' },
    { name: 'Najafgarh',                source: 'boundaries', lookup: 'pos4' },
    { name: 'Alipiri',                  source: 'searchbox' },
    { name: 'Manas National Park',      source: 'searchbox' },
    { name: 'Shivrajpur',               source: 'searchbox', proximity: [68.97, 22.47] },
    { name: 'Hanle',                    source: 'searchbox' },
    { name: 'Gandhi Nagar (Delhi)',      source: 'boundaries', lookup: 'pos4', csvName: 'Gandhi Nagar', centroid: [77.268,  28.6564] },
    { name: 'Gandhi Nagar (Jaipur)',     source: 'boundaries', lookup: 'pos4', csvName: 'Gandhi Nagar', centroid: [75.7913, 26.8778] },
    { name: 'Gandhi Nagar (Nashik)',     source: 'boundaries', lookup: 'pos4' },
    { name: 'Gandhi Nagar (Bhopal)',     source: 'boundaries', lookup: 'pos4' },
    { name: 'Gandhi Nagar (Tamil Nadu)', source: 'boundaries', lookup: 'pos4', csvName: 'Gandhi Nagar', centroid: [79.5598, 11.5994] },
    { name: 'Gandhi Nagar MA',           source: 'boundaries', lookup: 'pos4' },
    { name: 'Gandhi Nagar (Kerala)',     source: 'boundaries', lookup: 'pos4', csvName: 'Gandhi Nagar', centroid: [76.4964,  9.6448] },
    { name: 'Mehandipur Balaji',         source: 'searchbox' },
    { name: 'Lohagad',                  source: 'searchbox', proximity: [73.47, 18.73] },
    { name: 'Vindhya Range',            source: 'searchbox' },
    { name: 'Maredumilli',              source: 'boundaries', lookup: 'pos4' },
];

const map = new mapboxgl.Map({
    container: 'mapbox-map',
    center: [78.9629, 22.5],
    zoom: 4
});

let sessionToken = crypto.randomUUID();
let currentMarker = null;
let activeLayerId = null;
let activeSourceId = null;
const lookupCache = {};

const fetchLookup = async (type) => {
    if (lookupCache[type]) return lookupCache[type];
    const res = await fetch(`/data/india-${type}.json`);
    lookupCache[type] = await res.json();
    return lookupCache[type];
};

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

const setMapBadge = (type) => {
    const badge = document.getElementById('map-badge');
    badge.className = type;
    badge.textContent = type === 'polygon' ? '✓ Polygon available' : '✗ No polygon — point only';
};

const populateList = () => {
    const list = document.getElementById('place-list');
    const summary = document.getElementById('coverage-summary');

    const polyPlaces  = PLACES.map((p, i) => ({ ...p, i })).filter(p => p.source === 'boundaries');
    const pointPlaces = PLACES.map((p, i) => ({ ...p, i })).filter(p => p.source === 'searchbox');

    summary.innerHTML = `<span class="poly-count">${polyPlaces.length} of ${PLACES.length}</span> <span class="total-count">places have boundary polygons</span>`;

    const addSection = (label, cls) => {
        const hdr = document.createElement('li');
        hdr.className = `section-header ${cls}`;
        hdr.textContent = label;
        list.appendChild(hdr);
    };

    const addItem = ({ name, source, i }) => {
        const li = document.createElement('li');
        li.textContent = name;
        li.className = `place-item ${source}`;
        li.addEventListener('click', () => selectPlace(i, li));
        list.appendChild(li);
    };

    addSection(`Polygon Available (${polyPlaces.length})`, 'polygon');
    polyPlaces.forEach(addItem);

    addSection(`No Polygon — Point Only (${pointPlaces.length})`, 'point');
    pointPlaces.forEach(addItem);
};

const clearMapbox = () => {
    if (currentMarker) { currentMarker.remove(); currentMarker = null; }
    if (activeLayerId && map.getLayer(activeLayerId)) map.removeLayer(activeLayerId);
    if (activeSourceId && map.getSource(activeSourceId)) map.removeSource(activeSourceId);
    activeLayerId = null;
    activeSourceId = null;
    const badge = document.getElementById('map-badge');
    badge.className = '';
    badge.textContent = '';
};

const selectPlace = async (index, el) => {
    document.querySelectorAll('#place-list li').forEach(li => li.classList.remove('active'));
    el.classList.add('active');
    clearMapbox();

    const place = PLACES[index];
    const info = document.getElementById('mapbox-info');
    info.innerHTML = '';

    if (place.source === 'boundaries') {
        info.innerHTML = `<span class="badge boundaries">Polygon available</span> <span class="info-detail">Loading...</span>`;
        await showBoundary(place, info);
    } else {
        info.innerHTML = `<span class="badge searchbox">No polygon</span> <span class="info-detail">Searching...</span>`;
        await showSearchBox(place, info);
    }
};

const showBoundary = async (place, info) => {
    const data = await fetchLookup(place.lookup);
    const searchName = place.csvName || place.name;
    const matches = data.filter(e => e.name === searchName);

    let entry;
    if (matches.length === 1) {
        entry = matches[0];
    } else if (matches.length > 1 && place.centroid) {
        entry = matches.reduce((best, e) =>
            dist(e.centroid, place.centroid) < dist(best.centroid, place.centroid) ? e : best
        );
    } else {
        info.querySelector('.info-detail').textContent = 'Not found in lookup';
        return;
    }

    activeSourceId = `src-${entry.tileset}`;
    activeLayerId = 'layer-boundary';

    if (!map.getSource(activeSourceId)) {
        map.addSource(activeSourceId, { type: 'vector', url: `mapbox://${entry.tileset}` });
    }
    map.addLayer({
        id: activeLayerId,
        type: 'fill',
        source: activeSourceId,
        'source-layer': entry.layer,
        paint: { 'fill-color': '#27ae60', 'fill-opacity': 0.45 },
        filter: ['==', ['get', 'mapbox_id'], entry.id]
    });

    map.fitBounds([[entry.bbox[0], entry.bbox[1]], [entry.bbox[2], entry.bbox[3]]], { padding: 80, duration: 1000 });
    info.querySelector('.info-detail').textContent = entry.tileset;
    setMapBadge('polygon');
};

const showSearchBox = async (place, info) => {
    const proximityParam = place.proximity ? `&proximity=${place.proximity[0]},${place.proximity[1]}` : '';
    const suggestUrl = `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(place.name)}&country=IN&language=en&limit=5${proximityParam}&session_token=${sessionToken}&access_token=${mapboxgl.accessToken}`;

    try {
        const suggestRes = await fetch(suggestUrl);
        const suggestData = await suggestRes.json();

        if (!suggestData.suggestions?.length) {
            info.querySelector('.info-detail').textContent = 'No results found';
            setMapBadge('point');
            return;
        }

        const suggestion = suggestData.suggestions[0];
        const retrieveUrl = `https://api.mapbox.com/search/searchbox/v1/retrieve/${suggestion.mapbox_id}?session_token=${sessionToken}&access_token=${mapboxgl.accessToken}`;
        const retrieveRes = await fetch(retrieveUrl);
        const retrieveData = await retrieveRes.json();

        if (!retrieveData.features?.length) {
            info.querySelector('.info-detail').textContent = 'No results found';
            setMapBadge('point');
            return;
        }

        const feature = retrieveData.features[0];
        const coords = feature.geometry.coordinates;
        const address = feature.properties.full_address || feature.properties.place_formatted || feature.properties.name || '';

        currentMarker = new mapboxgl.Marker({ color: '#e67e22' })
            .setLngLat(coords)
            .setPopup(new mapboxgl.Popup({ closeOnClick: false }).setHTML(`<strong>${place.name}</strong><br>${address}`))
            .addTo(map);
        currentMarker.togglePopup();

        info.querySelector('.info-detail').textContent = address;
        map.flyTo({ center: coords, zoom: 12, duration: 1000 });
        sessionToken = crypto.randomUUID();
        setMapBadge('point');

    } catch (err) {
        console.error(err);
        info.querySelector('.info-detail').textContent = 'Search failed';
    }
};

map.on('load', () => populateList());
