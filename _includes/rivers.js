const defaultCoordinates = [139.76652995236685, 35.67881527736655];

let map

const loadMap = () => {
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v11',
        center: defaultCoordinates,
        zoom: 13,
        minZoom: 3,
        language: 'ja',
        scrollZoom: true
    })
    map.on('load', () => {
        map.addSource('rivers', {
            type: 'vector',
            url: `mapbox://kenji-shima.floodrisk-all`
        });
        map.addLayer({
            id: "rivers",
            type: "line",
            source: "rivers",
            "source-layer": "rivers",
            paint: {
                "line-color": 'blue',
                "line-opacity": 1
            }
        }, 'waterway-label');
        map.on('sourcedata', (e) => {
            if (e.sourceId === 'rivers' && e.isSourceLoaded) {
                updateRiverLabels();
            }
        });
        map.on('moveend', updateRiverLabels);

        // Change cursor to pointer when hovering over rivers
        /*map.on('mouseenter', 'rivers', () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'rivers', () => {
            map.getCanvas().style.cursor = '';
        });

        map.on('click', (e) => {
            const features = map.queryRenderedFeatures(e.point, { layers: ['rivers'] });
            let clickedRiverCode = null;
            console.log("Clicked features:", features);

            if (features.length) {
                clickedRiverCode = features[0].properties.RIVERCODE;
            } else {
                // No direct feature clicked, find nearest river
                const allFeatures = map.queryRenderedFeatures({ layers: ['rivers'] });

                if (allFeatures.length) {
                    let minDist = Infinity;
                    let nearestFeature = null;

                    allFeatures.forEach(feature => {
                        let coords = feature.geometry.coordinates;
                        if (!coords || coords.length === 0) return;
                        if (feature.geometry.type === 'MultiLineString') {
                            coords = coords.flat();
                        }

                        const line = turf.lineString(coords);
                        const point = turf.point([e.lngLat.lng, e.lngLat.lat]);
                        const nearest = turf.nearestPointOnLine(line, point, { units: 'meters' });

                        if (nearest.properties.dist < minDist) {
                            minDist = nearest.properties.dist;
                            nearestFeature = feature;
                        }
                    });

                    if (nearestFeature) {
                        clickedRiverCode = nearestFeature.properties.RIVERCODE;
                    }
                }
            }
            console.log("Clicked River Code:", clickedRiverCode);

            if (!clickedRiverCode) return;

            if (map.getLayer('clicked-river')) {
                map.removeLayer('clicked-river');
            }
            if (map.getSource('clicked-river')) {
                map.removeSource('clicked-river');
            }

            map.addSource('clicked-river', {
                type: 'vector',
                url: `mapbox://kenji-shima.floodrisk-all`
            });

            map.addLayer({
                id: 'clicked-river',
                type: 'line',
                source: 'clicked-river',
                "source-layer": "rivers",
                filter: ["==", ["get", "RIVERCODE"], clickedRiverCode],
                paint: {
                    "line-color": "red",
                    "line-width": 4
                }
            });

            new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(`<strong>RIVERCODE:</strong> ${clickedRiverCode}`)
                .addTo(map);
        });*/
    });
}

const updateRiverLabels = () => {
    const features = map.queryRenderedFeatures({ layers: ['rivers'] });

    const riverGroups = new Map();

    features.forEach(feature => {
        const riverCode = feature.properties.RIVERCODE;
        if (!riverGroups.has(riverCode)) {
            riverGroups.set(riverCode, []);
        }
        riverGroups.get(riverCode).push(feature);
    });

    const labelFeatures = [];

    riverGroups.forEach((features, riverCode) => {
        let allCoords = [];

        features.forEach(feature => {
            let coords = feature.geometry.coordinates;
            if (!coords || coords.length === 0) return;

            if (feature.geometry.type === 'MultiLineString') {
                coords = coords.flat();
            }

            allCoords = allCoords.concat(coords);
        });

        // Filter allCoords to only those within the current viewport bounds
        const bounds = map.getBounds();
        const filteredCoords = allCoords.filter(coord => bounds.contains([coord[0], coord[1]]));
        if (filteredCoords.length < 2) return;

        const line = turf.lineString(filteredCoords);
        const lineLength = turf.length(line, { units: 'meters' });
        const midpoint = turf.along(line, lineLength / 2, { units: 'meters' });
        const [lng, lat] = midpoint.geometry.coordinates;

        let snappedCoord = [lng, lat];

        let minDist = Infinity;
        filteredCoords.forEach(coord => {
            const dist = turf.distance(turf.point(coord), turf.point([lng, lat]), { units: 'meters' });
            if (dist < minDist) {
                minDist = dist;
                snappedCoord = coord;
            }
        });

        labelFeatures.push({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: snappedCoord
            },
            properties: {
                riverCode: riverCode
            }
        });
    });

    if (map.getSource('river-labels')) {
        map.getSource('river-labels').setData({
            type: 'FeatureCollection',
            features: labelFeatures
        });
    } else {
        map.addSource('river-labels', {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: labelFeatures
            }
        });

        map.addLayer({
            id: 'river-labels',
            type: 'symbol',
            source: 'river-labels',
            layout: {
                'text-field': ['get', 'riverCode'],
                'text-size': 10,
                'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
                'text-allow-overlap': true,
                'text-offset': [0, 0],
                'text-padding': 10
            },
            paint: {
                'text-color': '#333333',
                'text-halo-color': '#ffffff',
                'text-halo-width': 6,
                'text-halo-blur': 0.5
            },
        });
    }
};

loadMap()