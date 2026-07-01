// mapboxgl.accessToken is already set globally by utils.js (loaded via common_head.html)

const STYLE = 'mapbox://styles/kenji-shima/cmr1svajy003r01st00zo2z7z';

// Central Singapore — downtown core / Marina Bay / CBD
const CENTER = [103.8519, 1.2836];
const ZOOM = 16.5;
const PITCH = 60;
const BEARING = -20;

const map = new mapboxgl.Map({
    container: 'map',
    style: STYLE,
    center: CENTER,
    zoom: ZOOM,
    pitch: PITCH,
    bearing: BEARING,
    antialias: true
});

const BUILDING_LAYER = 'building copy';

// The style's paint value can be any valid CSS color (e.g. hsl(...)), but
// <input type="color"> only accepts 6-digit hex — normalize via canvas.
function colorToHex(cssColor) {
    const ctx = document.createElement('canvas').getContext('2d');
    ctx.fillStyle = cssColor;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

// Building color/opacity controls
const colorInput = document.getElementById('building-color');
const colorValue = document.getElementById('building-color-value');
const opacityInput = document.getElementById('building-opacity');
const opacityValue = document.getElementById('building-opacity-value');

colorInput.addEventListener('input', (e) => {
    colorValue.textContent = e.target.value.toUpperCase();
    map.setPaintProperty(BUILDING_LAYER, 'fill-extrusion-color', e.target.value);
});

opacityInput.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    opacityValue.textContent = value.toFixed(2);
    map.setPaintProperty(BUILDING_LAYER, 'fill-extrusion-opacity', value);
});

map.on('load', () => {
    // Zoom/rotate/pitch control with pitch visualizer
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }));

    // Fullscreen control
    map.addControl(new mapboxgl.FullscreenControl());

    // Seed the controls with the layer's current paint values, if available
    const currentColor = map.getPaintProperty(BUILDING_LAYER, 'fill-extrusion-color');
    if (typeof currentColor === 'string') {
        const hex = colorToHex(currentColor);
        colorInput.value = hex;
        colorValue.textContent = hex.toUpperCase();
    }

    const currentOpacity = map.getPaintProperty(BUILDING_LAYER, 'fill-extrusion-opacity');
    if (typeof currentOpacity === 'number') {
        opacityInput.value = currentOpacity;
        opacityValue.textContent = currentOpacity.toFixed(2);
    }
});
