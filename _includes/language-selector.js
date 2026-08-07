// mapboxgl.accessToken is already set globally by utils.js (loaded via common_head.html)
// mapbox-gl-language is also already loaded via common_head.html.

const STYLE = 'mapbox://styles/mapbox/streets-v12';

// Zoomed out enough that several countries are in view together, so switching
// language visibly changes labels across the whole map at once rather than
// requiring a pan to find translated text.
const CENTER = [30, 22];
const ZOOM = 1.7;

const map = new mapboxgl.Map({
    container: 'map',
    style: STYLE,
    center: CENTER,
    zoom: ZOOM
});

map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

// Built, but deliberately never passed to map.addControl(). Adding it as a
// control wires a `style.load` listener that reapplies its `defaultLanguage`
// on every style load — including the one caused by our own setStyle() call
// below — which would silently snap the map back to English right after a
// selection. Using setLanguage() directly, on our own schedule, avoids that.
const language = new MapboxLanguage({ defaultLanguage: 'en' });

const LANGUAGE_LABELS = {
    en: 'English',
    ar: 'العربية (Arabic)',
    de: 'Deutsch (German)',
    es: 'Español (Spanish)',
    fr: 'Français (French)',
    it: 'Italiano (Italian)',
    ja: '日本語 (Japanese)',
    ko: '한국어 (Korean)',
    pt: 'Português (Portuguese)',
    ru: 'Русский (Russian)',
    vi: 'Tiếng Việt (Vietnamese)',
    'zh-Hans': '简体中文 (Chinese, Simplified)',
    'zh-Hant': '繁體中文 (Chinese, Traditional)'
};

const select = document.getElementById('lang-select');
const statusEl = document.getElementById('status');

// setLanguage() rewrites every layer's text-field to coalesce(get name_<lang>, get name).
// That's a fine fallback for place/country labels, which streets-v12 translates into every
// supported language — but most roads only ever carry `name`, `name_en`, and the local
// language's own field (confirmed by inspecting rendered road-label features in Tokyo:
// name, name_en, name_ja — nothing else). For those, name_<lang> is null and the coalesce
// falls straight through to the raw local-script name. There's no translation data to
// recover there, so this doesn't fix that — it just inserts name_en as a second-choice
// fallback, so an untranslated road shows Latin script instead of local script when a
// non-English, non-local language is picked.
function addEnglishFallback(style, lang) {
    if (lang === 'en') return style;
    const targetField = `name_${lang}`;

    const isGet = (node, field) =>
        Array.isArray(node) && node.length === 2 && node[0] === 'get' && node[1] === field;

    const walk = (node) => {
        if (!Array.isArray(node)) return node;
        if (node[0] === 'coalesce' && node.length === 3 &&
            isGet(node[1], targetField) && isGet(node[2], 'name')) {
            return ['coalesce', node[1], ['get', 'name_en'], node[2]];
        }
        return node.map(walk);
    };

    return {
        ...style,
        layers: style.layers.map((layer) => {
            const textField = layer.layout && layer.layout['text-field'];
            if (textField === undefined) return layer;
            return {
                ...layer,
                layout: { ...layer.layout, 'text-field': walk(textField) }
            };
        })
    };
}

// streets-v12 ships every localized name (name_en, name_ko, name_ja, name_fr, ...)
// in the same vector tiles already loaded on the map. Switching language is a
// client-side restyle — rewriting each label layer's text-field to point at a
// different name_* field — not a new style URL or a new tile request.
function applyLanguage(lang) {
    const nextStyle = addEnglishFallback(language.setLanguage(map.getStyle(), lang), lang);
    map.setStyle(nextStyle);
    statusEl.textContent = `Labels set to ${LANGUAGE_LABELS[lang]}. Roads without a ${lang} translation show English instead of the local name.`;
}

select.addEventListener('change', () => {
    applyLanguage(select.value);
});
