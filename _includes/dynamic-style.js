// mapboxgl.accessToken is already set globally by utils.js (loaded via common_head.html)

// The stock Mapbox Streets style. Nothing about this URL — or the tileset behind it —
// changes when the language toggles: streets-v12 ships every localized name field
// (name_en, name_ja, name_ko, name_zh-Hans, ...) in the same vector tiles, and each
// label layer's `text-field` just picks which one to draw. Switching language is
// therefore a pure client-side restyle: loop the layers, rewrite the expression.
const STYLE = 'mapbox://styles/mapbox/streets-v12';

// Tokyo — wide enough that road, settlement, water, transit and POI labels are all
// on screen together, so a single toggle visibly rewrites all of them at once.
const CENTER = [139.7671, 35.6812];
const ZOOM = 11.5;

const map = new mapboxgl.Map({
    container: 'map',
    style: STYLE,
    center: CENTER,
    zoom: ZOOM
});

map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

// Every `text-field` exactly as the style shipped it, keyed by layer id. Captured once,
// on first style load, and never overwritten. Rewrites are always derived from this
// snapshot rather than from the layer's current value, which makes the round trip
// lossless: "back to English" is simply reapplying the original expression. That
// matters for layers like `block-number-label`, whose original is a bare
// ["get", "name"] with no name_en to reverse-engineer a way back from.
const originalTextFields = new Map();

// Field names we treat as a translatable label. Anything else a symbol layer might
// draw — `ref` on the road shields, `house_num` on building numbers — is left alone.
function isNameField(field) {
    return field === 'name' || field.startsWith('name_');
}

function isNameLookup(node) {
    return Array.isArray(node) && node.length === 2 && node[0] === 'get' &&
        typeof node[1] === 'string' && isNameField(node[1]);
}

// streets-v12 already writes its labels as coalesce(name_en, name). Recognizing that
// whole shape — rather than rewriting each ["get", ...] inside it independently — keeps
// the output the same shape as the input instead of nesting a coalesce in a coalesce.
// Worth doing because this demo invites people to inspect the resulting expression.
function isNameCoalesce(node) {
    return Array.isArray(node) && node[0] === 'coalesce' && node.length > 1 &&
        node.slice(1).every(isNameLookup);
}

// Recursively rewrite a `text-field` value so every name lookup inside it reads the
// requested language, falling back to the local name when that language is missing.
// A walk is required rather than a flat swap because some layers bury the name lookup
// several levels deep — `transit-label` nests it inside step/match, `airport-label`
// inside step/case/concat — and those wrapper expressions must survive untouched.
// Returns null when the expression contains no name lookup at all; that null is what
// marks a layer as skipped.
function localizeTextField(value, lang) {
    let rewrote = false;

    const walk = (node) => {
        // Legacy string-token form, e.g. "{name_en}". streets-v12 no longer uses it,
        // but handling it keeps the loop correct against older or custom styles.
        if (typeof node === 'string') {
            const replaced = node.replace(/\{(name(?:_[\w-]+)?)\}/g, () => {
                rewrote = true;
                return `{name_${lang}}`;
            });
            return replaced;
        }

        if (!Array.isArray(node)) return node;

        // The thing we're actually hunting for: a name lookup, either bare
        // (["get", "name"], as on block-number-label) or already wrapped in a
        // coalesce (every other label layer in streets-v12).
        if (isNameCoalesce(node) || isNameLookup(node)) {
            rewrote = true;
            return ['coalesce', ['get', `name_${lang}`], ['get', 'name']];
        }

        return node.map(walk);
    };

    const result = walk(value);
    return rewrote ? result : null;
}

// Human-readable summary of what a skipped layer draws instead of a name, so the log
// explains itself rather than just asserting the layer was skipped.
function describeNonNameField(value) {
    const fields = new Set();
    const collect = (node) => {
        if (!Array.isArray(node)) return;
        if (node.length === 2 && node[0] === 'get' && typeof node[1] === 'string') {
            fields.add(node[1]);
            return;
        }
        node.forEach(collect);
    };
    collect(value);
    return fields.size ? [...fields].join(', ') : 'no name field';
}

// --- UI ---------------------------------------------------------------------

const toggle = document.getElementById('lang-toggle');
const statusEl = document.getElementById('status');
const logEl = document.getElementById('log');
const statScanned = document.getElementById('stat-scanned');
const statLabelled = document.getElementById('stat-labelled');
const statRewritten = document.getElementById('stat-rewritten');
const statSkipped = document.getElementById('stat-skipped');

function renderLog(entries) {
    logEl.replaceChildren(
        ...entries.map(({ id, detail, state }) => {
            const row = document.createElement('div');
            row.className = `log-row log-row--${state}`;

            const name = document.createElement('span');
            name.className = 'log-layer';
            name.textContent = id;

            const note = document.createElement('span');
            note.className = 'log-detail';
            note.textContent = detail;

            row.append(name, note);
            return row;
        })
    );
    logEl.scrollTop = 0;
}

// --- The process ------------------------------------------------------------

// Loop every layer in the live style and set its label language. This is the whole
// demo: no style reload, no new tile request, no second style URL — just
// setLayoutProperty on the layers that draw a name.
function applyLanguage(lang) {
    const layers = map.getStyle().layers;
    const entries = [];
    let labelled = 0;
    let rewritten = 0;
    let skipped = 0;

    for (const layer of layers) {
        const original = originalTextFields.get(layer.id);
        if (original === undefined) continue; // not a label layer

        labelled++;

        // Classify from the transform result regardless of the target language, so a
        // layer that draws `ref` or `house_num` reports as skipped in every language
        // rather than only in Japanese.
        const localized = localizeTextField(original, lang);

        // English is the style's shipped default, so switching back means reapplying the
        // snapshot verbatim rather than a transform of it. Only that restores
        // `block-number-label` to its original bare ["get", "name"].
        const next = localized !== null && lang === 'en' ? original : localized;

        if (next === null) {
            skipped++;
            entries.push({
                id: layer.id,
                detail: `skipped · draws ${describeNonNameField(original)}`,
                state: 'skipped'
            });
            continue;
        }

        map.setLayoutProperty(layer.id, 'text-field', next);
        rewritten++;
        entries.push({
            id: layer.id,
            detail: lang === 'en' ? '→ original' : `→ name_${lang}`,
            state: 'rewritten'
        });
    }

    statScanned.textContent = layers.length;
    statLabelled.textContent = labelled;
    statRewritten.textContent = rewritten;
    statSkipped.textContent = skipped;
    statusEl.textContent = `Rewrote ${rewritten} label layer${rewritten === 1 ? '' : 's'} in place — same style, same tiles.`;

    renderLog(entries);
}

map.on('style.load', () => {
    if (originalTextFields.size === 0) {
        for (const layer of map.getStyle().layers) {
            const textField = layer.layout && layer.layout['text-field'];
            if (textField !== undefined) {
                originalTextFields.set(layer.id, textField);
            }
        }
    }

    // Show the triage for the initial English state without changing anything — this is
    // a no-op restyle on first load, since English is what streets-v12 already loaded.
    // Reading the toggle rather than hardcoding 'en' keeps the map and the switch in
    // agreement if a style reload ever re-fires this while Japanese is selected.
    const isInitialLoad = !toggle.checked;
    applyLanguage(toggle.checked ? 'ja' : 'en');
    if (isInitialLoad) {
        statusEl.textContent = 'Loaded as shipped — streets-v12 labels default to English.';
    }
});

toggle.addEventListener('change', () => {
    applyLanguage(toggle.checked ? 'ja' : 'en');
});
