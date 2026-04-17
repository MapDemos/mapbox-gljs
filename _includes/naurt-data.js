const regions = {
    japan: {
        label: 'Japan',
        bounds: [[139.38284, 35.76394], [139.48999, 35.85932]],
        doorsUrl: 'mapbox://kenji-shima.naurt-doors',
        addressesUrl: 'mapbox://kenji-shima.naurt-addresses',
        language: 'ja',
        reportUrl: 'https://github.com/MapDemos/mapbox-gljs/blob/main/docs/naurt-jp-evaluation.md',
        stats: [
            { label: 'Address match',  value: 0.3 },
            { label: 'Door match',     value: 0.2 },
            { label: 'Has Mapbox result', value: 78.1 },
        ],
    },
    nz: {
        label: 'New Zealand',
        bounds: [[174.42820, -36.91395], [174.72655, -36.73831]],
        doorsUrl: 'mapbox://kenji-shima.naurt-doors-nz',
        addressesUrl: 'mapbox://kenji-shima.naurt-addresses-nz',
        language: 'en',
        reportUrl: 'https://github.com/MapDemos/mapbox-gljs/blob/main/docs/naurt-nz-evaluation.md',
        stats: [
            { label: 'Address match',  value: 72.7 },
            { label: 'Door match',     value: 65.9 },
            { label: 'Has Mapbox result', value: 99.6 },
        ],
    },
    us: {
        label: 'United States',
        bounds: [[-71.36717, 42.53908], [-71.01565, 42.71479]],
        doorsUrl: 'mapbox://kenji-shima.naurt-doors-us',
        addressesUrl: 'mapbox://kenji-shima.naurt-addresses-us',
        language: 'en',
        reportUrl: 'https://github.com/MapDemos/mapbox-gljs/blob/main/docs/naurt-us-evaluation.md',
        stats: [
            { label: 'Address match',  value: 72.4 },
            { label: 'Door match',     value: 69.3 },
            { label: 'Has Mapbox result', value: 99.9 },
        ],
    },
};

function renderStats(regionKey) {
    const { stats } = regions[regionKey];
    const el = document.getElementById('stats-section');

    const rows = stats.map(({ label, value }) => {
        const color = value >= 80 ? '#10b981' : value >= 50 ? '#f59e0b' : '#ef4444';
        return `
        <div class="stat-row">
          <div class="stat-label"><span>${label}</span><span>${value}%</span></div>
          <div class="stat-bar-bg">
            <div class="stat-bar-fill" style="width:${value}%; background:${color};"></div>
          </div>
        </div>`;
    }).join('');

    const { reportUrl } = regions[regionKey];
    el.innerHTML = `<h4>vs Mapbox Geocoding</h4>${rows}<a href="${reportUrl}" target="_blank" style="display:block; margin-top:10px; font-size:12px; color:#2563eb; text-decoration:none;">View full report →</a>`;
}

let currentRegion = 'japan';
let map;

const layerPaint = {
    doors: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 12, 3, 16, 6, 20, 10],
        'circle-color': '#3b82f6',
        'circle-opacity': 0.8,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#1e40af',
    },
    addresses: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 12, 3, 16, 6, 20, 10],
        'circle-color': '#10b981',
        'circle-opacity': 0.8,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#059669',
    },
};

function addSourcesAndLayers(region) {
    map.addSource('naurt-doors', { type: 'vector', url: region.doorsUrl });
    map.addSource('naurt-addresses', { type: 'vector', url: region.addressesUrl });

    map.addLayer({
        id: 'doors-layer',
        type: 'circle',
        source: 'naurt-doors',
        'source-layer': 'doors',
        paint: layerPaint.doors,
    });

    map.addLayer({
        id: 'addresses-layer',
        type: 'circle',
        source: 'naurt-addresses',
        'source-layer': 'addresses',
        paint: layerPaint.addresses,
    });

    // Restore visibility from checkboxes
    const doorsVisible = document.getElementById('toggle-doors').checked;
    const addressesVisible = document.getElementById('toggle-addresses').checked;
    map.setLayoutProperty('doors-layer', 'visibility', doorsVisible ? 'visible' : 'none');
    map.setLayoutProperty('addresses-layer', 'visibility', addressesVisible ? 'visible' : 'none');
}

function switchRegion(regionKey) {
    const region = regions[regionKey];
    if (!region) return;

    currentRegion = regionKey;

    // Swap sources and layers
    if (map.getLayer('doors-layer')) map.removeLayer('doors-layer');
    if (map.getLayer('addresses-layer')) map.removeLayer('addresses-layer');
    if (map.getSource('naurt-doors')) map.removeSource('naurt-doors');
    if (map.getSource('naurt-addresses')) map.removeSource('naurt-addresses');

    addSourcesAndLayers(region);
    map.fitBounds(region.bounds, { padding: 40, duration: 300 });

    document.getElementById('region-select').value = regionKey;
    renderStats(regionKey);
}

async function showPopup(e, layerType) {
    const feature = map.queryRenderedFeatures(e.point, { layers: [`${layerType}-layer`] })[0];
    if (!feature) return;

    const { lng, lat } = e.lngLat;
    const properties = feature.properties;
    const color = layerType === 'doors' ? '#3b82f6' : '#10b981';
    const label = layerType === 'doors' ? 'Door' : 'Address';

    let html = '<div style="max-height: 400px; overflow-y: auto;">';
    html += `<h3 style="margin-top: 0; color: ${color};">${label}</h3>`;
    html += '<div style="padding: 10px; background: #f3f4f6; border-radius: 4px; margin-bottom: 10px;">';
    html += '<strong>Location:</strong> <span id="geocode-result">Loading...</span>';
    html += '</div>';
    html += '<h4 style="margin: 10px 0 5px 0; font-size: 14px;">Properties:</h4>';
    html += '<table style="width: 100%; font-size: 12px;">';
    for (const [key, value] of Object.entries(properties)) {
        html += `<tr><td style="padding: 4px; font-weight: bold;">${key}:</td><td style="padding: 4px;">${value}</td></tr>`;
    }
    html += '</table></div>';

    const popup = new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(html)
        .addTo(map);

    try {
        const lang = regions[currentRegion].language;
        const response = await fetch(
            `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&language=${lang}&access_token=${mapboxgl.accessToken}`
        );
        const data = await response.json();
        const place = data.features?.[0];
        const result = place?.properties?.full_address || place?.properties?.place_formatted || 'No address found';
        const el = popup.getElement().querySelector('#geocode-result');
        if (el) el.textContent = result;
    } catch {
        const el = popup.getElement().querySelector('#geocode-result');
        if (el) el.textContent = 'Failed to load address';
    }
}

const loadMap = () => {
    const initial = regions[currentRegion];

    map = new mapboxgl.Map({
        container: 'map',
        bounds: initial.bounds,
        fitBoundsOptions: { padding: 40 },
        language: 'en',
    });

    map.on('load', () => {
        addSourcesAndLayers(initial);

        map.on('mouseenter', 'doors-layer', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'doors-layer', () => { map.getCanvas().style.cursor = ''; });
        map.on('mouseenter', 'addresses-layer', () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', 'addresses-layer', () => { map.getCanvas().style.cursor = ''; });

        map.on('click', 'doors-layer', (e) => showPopup(e, 'doors'));
        map.on('click', 'addresses-layer', (e) => showPopup(e, 'addresses'));

        document.getElementById('toggle-doors').addEventListener('change', (e) => {
            map.setLayoutProperty('doors-layer', 'visibility', e.target.checked ? 'visible' : 'none');
        });

        document.getElementById('toggle-addresses').addEventListener('change', (e) => {
            map.setLayoutProperty('addresses-layer', 'visibility', e.target.checked ? 'visible' : 'none');
        });

        document.getElementById('region-select').addEventListener('change', (e) => {
            switchRegion(e.target.value);
        });

        map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
        renderStats(currentRegion);
    });
};

loadMap();
