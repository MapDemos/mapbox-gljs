//window.CP.PenTimer.MAX_TIME_IN_LOOP_WO_EXIT = 6000;
var overpassurl = [];
var centers = [];
mapboxgl.accessToken = 'pk.eyJ1IjoibWJ4c29sdXRpb25zIiwiYSI6ImNqeWhpandmazAyYmYzYnBtZzJxM3hlM2EifQ.ZLKIqBxG97_HklFj0_1RBQ';
fetch('https://api.mapbox.com/geocoding/v5/mapbox.places/' + 'Jakarta' + '.json?limit=1&types=place&country=ID&access_token=' + mapboxgl.accessToken).then(function (response) { return response.json(); })
    .then(function (json) {
        var center = turf.point(json.features[0].center);
        var options = { units: 'kilometers' }
        var buffer = turf.buffer(center, 1, { options });
        var bbox = turf.bbox(buffer);
        var poly = turf.bboxPolygon(bbox);
        var bounds = [[bbox[0], bbox[1]], [bbox[2], bbox[3]]];

        function buildOverpassApiUrl(map, overpassQuery) {
            var boxbounds = bbox[1] + ',' + bbox[0] + ',' + bbox[3] + ',' + bbox[2];
            var nodeQuery = 'node[' + overpassQuery + '](' + boxbounds + ');';
            var wayQuery = 'way[' + overpassQuery + '](' + boxbounds + ');';
            var relationQuery = 'relation[' + overpassQuery + '](' + boxbounds + ');';
            var query = '?data=[out:json][timeout:100];(' + nodeQuery + wayQuery + relationQuery + ');out body geom;';
            var baseUrl = 'https://overpass-api.de/api/interpreter';
            var resultUrl = baseUrl + query;
            return resultUrl;
        }
        var queryTextfieldValue = 'building';
        var overpassApiUrl = buildOverpassApiUrl(map, queryTextfieldValue);
        overpassurl.push(overpassApiUrl);
        fetch(overpassurl[0]).then(function (response) { return response.json(); })
            .then(function (json) {
                var resultAsGeojson = osmtogeojson(json);
                for (let i = 0; i < resultAsGeojson.features.length; i++) {
                    {
                        if (resultAsGeojson.features[i].geometry.type == "Polygon") {
                            centers.push(turf.centroid(turf.polygon(resultAsGeojson.features[i].geometry.coordinates)));
                        }
                    };
                };
                var BuildingCentroids = turf.featureCollection(centers);
                var ptswithin = turf.pointsWithinPolygon(BuildingCentroids, poly);
                var buildingsnum = ptswithin.features.length;
                var options = { units: 'meters' };
                for (const pts of ptswithin.features) {
                    pts.properties.distance = turf.distance(
                        center,
                        pts.geometry,
                        options
                    );
                }

                ptswithin.features.sort((a, b) => {
                    if (a.properties.distance > b.properties.distance) {
                        return 1;
                    }
                    if (a.properties.distance < b.properties.distance) {
                        return -1;
                    }
                    return 0;
                });

                const allBuildings = turf.featureCollection(ptswithin.features);

                var map = new mapboxgl.Map({
                    container: 'map',
                    center: [center.geometry.coordinates[0], center.geometry.coordinates[1]],
                    bounds: bounds,
                    pitch: 0,
                    interactive: true,
                });

                map.on('load', () => {

                    const layers = map.getStyle().layers;
                    let firstSymbolId;
                    for (const layer of layers) {
                        if (layer.type === 'symbol') {
                            firstSymbolId = layer.id;
                            break;
                        }
                    }

                    map.fitBounds(bbox, { padding: 10 });
                    map.addSource('center', {
                        type: 'geojson',
                        data: center,
                    });

                    map.addSource('poly', {
                        type: 'geojson',
                        data: poly,
                    });

                    map.addSource('ptswithin', {
                        type: 'geojson',
                        data: ptswithin
                    });

                    map.addLayer({
                        'id': 'poly',
                        'type': 'line',
                        'source': 'poly',
                        'layout': {},
                        'paint': {
                            'line-color': '#000000',
                            'line-width': 1
                        }
                    },
                        firstSymbolId);

                    map.addLayer({
                        'id': 'ptswithin',
                        'type': 'circle',
                        'source': 'ptswithin',
                        'layout': {},
                        'paint': {
                            'circle-color': '#000000',
                            'circle-radius': 2.5
                        }
                    },
                        firstSymbolId);

                    // Commented out firsthundred and lasthundred sources as they are no longer used
                    // map.addSource('firsthundred', {
                    //     type: 'geojson',
                    //     data: firsthundred,
                    // });
                    // map.addSource('lasthundred', {
                    //     type: 'geojson',
                    //     data: lasthundred,
                    // });

                    map.addSource('gclines', {
                        type: 'geojson',
                        data: {
                            type: 'FeatureCollection',
                            features: {}
                        }
                    });

                    map.addSource('ends', {
                        type: 'geojson',
                        data: {
                            type: 'FeatureCollection',
                            features: {}
                        }
                    });

                    map.addSource('starts', {
                        type: 'geojson',
                        data: {
                            type: 'FeatureCollection',
                            features: {}
                        }
                    });

                    map.addLayer({
                        'id': 'gclines',
                        'type': 'line',
                        'source': 'gclines',
                        'layout': {},
                        'paint': {
                            'line-color': '#FF0000',
                            'line-width': 3,
                        }
                    },
                        firstSymbolId);

                    // map.addLayer({
                    //     'id': 'firsthundred',
                    //     'type': 'circle',
                    //     'source': 'firsthundred',
                    //     'layout': {},
                    //     'paint': {
                    //         'circle-color': '#FF0000',
                    //         'circle-radius': 5,
                    //         'circle-stroke-width': 1,
                    //         'circle-stroke-color': '#FFFFFF',
                    //     }
                    // },
                    //     firstSymbolId);


                    map.addSource('geocoded', {
                        type: 'geojson',
                        data: {
                            type: 'FeatureCollection',
                            features: {}
                        }
                    });

                    map.addSource('directions', {
                        type: 'geojson',
                        data: {
                            type: 'FeatureCollection',
                            features: {}
                        }
                    });

                    map.addLayer({
                        'id': 'directions',
                        'type': 'line',
                        'source': 'directions',
                        'layout': {},
                        'paint': {
                            'line-color': '#0000FF',
                            'line-width': 3,
                        }
                    },
                        firstSymbolId);

                    map.addLayer({
                        'id': 'starts',
                        'type': 'line',
                        'source': 'starts',
                        'layout': {},
                        'paint': {
                            'line-color': '#0000FF',
                            'line-width': 3,
                            'line-dasharray': [1, 1]
                        }
                    },
                        firstSymbolId);

                    map.addLayer({
                        'id': 'geocoded',
                        'type': 'circle',
                        'source': 'geocoded',
                        'layout': {},
                        'paint': {
                            'circle-color': '#FFFFFF',
                            'circle-radius': 5,
                            'circle-stroke-width': 1,
                            'circle-stroke-color': '#FF0000',
                        }
                    },
                        firstSymbolId);

                    // map.addLayer({
                    //     'id': 'lasthundred',
                    //     'type': 'circle',
                    //     'source': 'lasthundred',
                    //     'layout': {},
                    //     'paint': {
                    //         'circle-color': '#0000FF',
                    //         'circle-radius': 5,
                    //         'circle-stroke-width': 1,
                    //         'circle-stroke-color': '#FFFFFF',
                    //     }
                    // },
                    //     firstSymbolId);

                    map.addLayer({
                        'id': 'ends',
                        'type': 'line',
                        'source': 'ends',
                        'layout': {},
                        'paint': {
                            'line-color': '#0000FF',
                            'line-width': 3,
                            'line-dasharray': [1, 1]
                        }
                    },
                        firstSymbolId);

                    map.addLayer({
                        'id': 'center',
                        'type': 'circle',
                        'source': 'center',
                        'layout': {},
                        'paint': {
                            'circle-color': '#FFFFFF',
                            'circle-radius': 10,
                            'circle-stroke-width': 1,
                            'circle-stroke-color': '#0000FF',
                        }
                    },
                        firstSymbolId);

                });



                map.once('idle', () => {

                    // Throttled fetch for reverse geocoding (20 per batch, waits for each batch to finish before starting next)
                    async function throttledFetchAll(urls, maxPerBatch = 20) {
                        maxPerBatch = 10;
                        let results = [];
                        for (let i = 0; i < urls.length; i += maxPerBatch) {
                            const batch = urls.slice(i, i + maxPerBatch).map(url =>
                                fetch(url).then(res => res.json()).catch(err => {
                                    console.error("Fetch error:", err);
                                    return null;
                                })
                            );
                            const batchResults = await Promise.all(batch);
                            results = results.concat(batchResults);
                            if (i + maxPerBatch < urls.length) {
                                await new Promise(resolve => setTimeout(resolve, 10)); // Delay between batches
                            }
                        }
                        return results;
                    }

                    let geocodeUrls = [];
                    for (let i = 0; i < allBuildings.features.length; i++) {
                        let coords = allBuildings.features[i].geometry.coordinates;
                        let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?routing=true&types=address&limit=1&access_token=${mapboxgl.accessToken}`;
                        geocodeUrls.push(url);
                    }

                    let allreverse = throttledFetchAll(geocodeUrls, 20);
                    allreverse.then(function (response) {

                        const geocodedPoints = response.map((res, idx) => {
                            return turf.point(res.features[0].geometry.coordinates, {
                                address: res.features[0].place_name
                            });
                        });

                        var collection = turf.featureCollection(geocodedPoints);

                        const gclines = turf.featureCollection(
                          allBuildings.features.map((feature, i) => {
                            const start = feature.geometry.coordinates;
                            const end = response[i].features[0].geometry.coordinates;
                            return turf.lineString([start, end], {
                              distance: turf.distance(feature.geometry, response[i].features[0].geometry, options)
                            });
                          })
                        );

                        map.getSource('geocoded').setData(collection);
                        map.getSource('gclines').setData(gclines);
                    });

                    // Throttled fetch for directions (20 per second)
                    let directionUrls = allBuildings.features.map((feature) => {
                      let coords = feature.geometry.coordinates;
                      return `https://api.mapbox.com/directions/v5/mapbox/driving/${coords[0]},${coords[1]};${center.geometry.coordinates[0]},${center.geometry.coordinates[1]}?overview=full&geometries=geojson&alternatives=false&access_token=${mapboxgl.accessToken}`;
                    });
                    let alldirections = throttledFetchAll(directionUrls, 20);
                    alldirections.then(function (res) {
                        const directionscollection = turf.featureCollection(
                          res.map(r =>
                            turf.lineString(r.routes[0].geometry.coordinates, {
                              duration: r.routes[0].duration,
                              distance: r.routes[0].distance
                            })
                          )
                        );

                        map.getSource('directions').setData(directionscollection);

                        const endscollection = turf.featureCollection(
                          res.map(r =>
                            turf.lineString(
                              [r.routes[0].geometry.coordinates.slice(-1)[0], center.geometry.coordinates]
                            )
                          )
                        );

                        map.getSource('ends').setData(endscollection);

                        const startscollection = turf.featureCollection(
                          allBuildings.features.map((feature, i) =>
                            turf.lineString(
                              [feature.geometry.coordinates, res[i].routes[0].geometry.coordinates[0]]
                            )
                          )
                        );

                        map.getSource('starts').setData(startscollection);

                        const popup = new mapboxgl.Popup({
                            closeButton: false,
                            closeOnClick: false
                        });

                        map.on('mouseenter', 'geocoded', (e) => {
                            map.getCanvas().style.cursor = 'pointer';
                            const coordinates = e.features[0].geometry.coordinates.slice();
                            const description = e.features[0].properties.address;
                            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                            }
                            popup.setLngLat(coordinates).setHTML(description).addTo(map);
                        });

                        map.on('mouseleave', 'geocoded', () => {
                            map.getCanvas().style.cursor = '';
                            popup.remove();
                        });

                        map.on('mouseover', 'directions', function (e) {
                            const duration = e.features[0].properties.duration;
                            const distance = e.features[0].properties.distance;
                            const km = distance / 1000
                            const minutes = Math.floor(duration / 60);
                            const seconds = Math.floor(duration - minutes * 60);
                            popup
                                .setLngLat(e.lngLat)
                                .setHTML('ETA: ' + minutes + ' min ' + seconds + ' secs<br>Distance: ' + km.toFixed(2) + ' km')
                                .addTo(map);
                        });

                        map.on('mouseleave', 'directions', () => {
                            map.getCanvas().style.cursor = '';
                            popup.remove();
                        });

                        map.on('mouseover', 'gclines', function (e) {
                            const dist = e.features[0].properties.distance;
                            popup
                                .setLngLat(e.lngLat)
                                .setHTML('Geocode distance: ' + Math.floor(dist) + ' m')
                                .addTo(map);
                        });

                        map.on('mouseleave', 'gclines', () => {
                            map.getCanvas().style.cursor = '';
                            popup.remove();
                        });
                    });
                });
            });
    });