export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        console: "readonly",
        localStorage: "readonly",
        fetch: "readonly",
        alert: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
        createImageBitmap: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        Event: "readonly",
        crypto: "readonly",
        Image: "readonly",
        SpeechSynthesisUtterance: "readonly",

        // Mapbox GL globals
        mapboxgl: "readonly",

        // Map libraries
        L: "readonly",
        google: "readonly",
        AMapLoader: "readonly",

        // 3D/Graphics libraries
        THREE: "readonly",
        Threebox: "readonly",
        TilesRenderer: "readonly",

        // Data/Utility libraries
        turf: "readonly",
        ApexCharts: "readonly",
        d3: "readonly",
        scrollama: "readonly",
        $: "readonly",

        // Project-specific globals (defined in parent scopes/HTML)
        lat: "writable",
        lng: "writable",
        map: "writable",
        tb: "writable",
        modelLight: "writable",
        tileset_time: "writable",
        luup_all: "readonly",
        luup_random_select: "readonly",
        tilesets: "writable",
        color: "writable",
        geocoding_uri: "readonly",
        common_params: "readonly",
        routes: "writable",
        directions_uri: "readonly",
        search_uri: "readonly",
        code: "writable",

        // Utility functions (defined elsewhere in project)
        toJST: "readonly",
        toUTC: "readonly",
        parseDateStringJST: "readonly",
        utcStringToJST: "readonly",
        getLastHalfOrExactHour: "readonly",
        getLastExactHour: "readonly",
        PrecipitationLayerHelper: "readonly",
        TimeManager: "readonly",
        getFirstAddress: "readonly",
        getAllGenrePOIs: "readonly",
        getIconAndColorForGenre: "readonly",
        precipitationColorScale: "readonly",
        lightPreset: "writable",
        polyline: "readonly",
        removeAllRoutes: "readonly",
        setRoute: "readonly",
        computeCameraPosition: "readonly",
        getBearing: "readonly",
        appendAllVehiclesFromData: "readonly",
        isInMode: "readonly",
        recoverShipment: "readonly",
        addTextMarker: "readonly",
        clearShipmentModal: "readonly",
        submitShipment: "readonly",
        resetDragLayer: "readonly",
        updateDragging: "readonly",
        addMarker: "readonly",
        fetchIsochrone: "readonly",
        appendVehicle: "readonly",
        addTypeMarker: "readonly",
        updateVehicle: "readonly",
        autoCreateShipments: "readonly",
        modVehicle: "readonly",
        calculateSolution: "readonly",
        addToShipments: "readonly",

        // Data objects
        obj_202502102020038040: "readonly",
        obj_202502111837332635: "readonly",
        obj_202502111837332636: "readonly",
        obj_202502111837332638: "readonly",
        obj_202502111837332643: "readonly",
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
      "no-console": "off",
      "semi": ["error", "always"],
      "quotes": ["warn", "single", { "allowTemplateLiterals": true }],
    }
  },
  {
    // lambda/ and scripts/ are Node.js (ESM import/export), not browser
    // demo code, and docs/ holds reference material (e.g. code snippets
    // in merchant-filter-examples.js) that was never meant to run
    // standalone — none of these fit this config's sourceType: "script" +
    // browser-globals setup.
    ignores: ["node_modules/**", "lambda/**", "scripts/**", "docs/**", "_build/**", "eslint.config.js"]
  }
];
