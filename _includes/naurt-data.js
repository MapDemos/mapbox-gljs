// Default coordinates - Tokyo, Japan
const defaultCoordinates = [139.39876878876265, 35.79820655773102];

let map;

const loadMap = () => {
    map = new mapboxgl.Map({
        container: 'map',
        center: defaultCoordinates,
        zoom: 13, // Good overview of Tokyo area
        language: 'ja', // Set language to Japanese
    });

    map.on('load', () => {
        // Add Naurt Doors tileset source
        map.addSource('naurt-doors', {
            type: 'vector',
            url: 'mapbox://kenji-shima.naurt-doors'
        });

        // Add Naurt Addresses tileset source
        map.addSource('naurt-addresses', {
            type: 'vector',
            url: 'mapbox://kenji-shima.naurt-addresses'
        });

        // Add Doors layer (blue circles)
        map.addLayer({
            id: 'doors-layer',
            type: 'circle',
            source: 'naurt-doors',
            'source-layer': 'doors', // Trying simpler layer name
            paint: {
                'circle-radius': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    12, 3,
                    16, 6,
                    20, 10
                ],
                'circle-color': '#3b82f6', // Blue color
                'circle-opacity': 0.8,
                'circle-stroke-width': 1,
                'circle-stroke-color': '#1e40af'
            }
        });

        // Add Addresses layer (green circles)
        map.addLayer({
            id: 'addresses-layer',
            type: 'circle',
            source: 'naurt-addresses',
            'source-layer': 'addresses', // Trying simpler layer name
            paint: {
                'circle-radius': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    12, 3,
                    16, 6,
                    20, 10
                ],
                'circle-color': '#10b981', // Green color
                'circle-opacity': 0.8,
                'circle-stroke-width': 1,
                'circle-stroke-color': '#059669'
            }
        });

        // Add hover effects for doors
        map.on('mouseenter', 'doors-layer', () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'doors-layer', () => {
            map.getCanvas().style.cursor = '';
        });

        // Add hover effects for addresses
        map.on('mouseenter', 'addresses-layer', () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        map.on('mouseleave', 'addresses-layer', () => {
            map.getCanvas().style.cursor = '';
        });

        // Click handler for doors - show popup with properties and geocoding
        map.on('click', 'doors-layer', async (e) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: ['doors-layer']
            });

            if (!features.length) return;

            const feature = features[0];
            const properties = feature.properties;
            const { lng, lat } = e.lngLat;

            // Build initial HTML content
            let htmlContent = '<div style="max-height: 400px; overflow-y: auto;">';
            htmlContent += '<h3 style="margin-top: 0; color: #3b82f6;">Door</h3>';

            // Show loading for geocoding
            htmlContent += '<div style="padding: 10px; background: #f3f4f6; border-radius: 4px; margin-bottom: 10px;">';
            htmlContent += '<strong>Location:</strong> <span id="geocode-result">Loading...</span>';
            htmlContent += '</div>';

            htmlContent += '<h4 style="margin: 10px 0 5px 0; font-size: 14px;">Properties:</h4>';
            htmlContent += '<table style="width: 100%; font-size: 12px;">';

            for (const [key, value] of Object.entries(properties)) {
                htmlContent += `<tr><td style="padding: 4px; font-weight: bold;">${key}:</td><td style="padding: 4px;">${value}</td></tr>`;
            }

            htmlContent += '</table></div>';

            const popup = new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(htmlContent)
                .addTo(map);

            // Perform reverse geocoding using Geocoding API v6
            try {
                const response = await fetch(
                    `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&language=ja&access_token=${mapboxgl.accessToken}`
                );
                const data = await response.json();

                let geocodeResult = 'No address found';
                if (data.features && data.features.length > 0) {
                    const place = data.features[0];
                    geocodeResult = place.properties.full_address || place.properties.place_formatted || 'Address found but no details available';
                }

                // Update the popup with geocoding result
                const geocodeElement = popup.getElement().querySelector('#geocode-result');
                if (geocodeElement) {
                    geocodeElement.textContent = geocodeResult;
                }
            } catch (error) {
                console.error('Geocoding error:', error);
                const geocodeElement = popup.getElement().querySelector('#geocode-result');
                if (geocodeElement) {
                    geocodeElement.textContent = 'Failed to load address';
                }
            }
        });

        // Click handler for addresses - show popup with properties and geocoding
        map.on('click', 'addresses-layer', async (e) => {
            const features = map.queryRenderedFeatures(e.point, {
                layers: ['addresses-layer']
            });

            if (!features.length) return;

            const feature = features[0];
            const properties = feature.properties;
            const { lng, lat } = e.lngLat;

            // Build initial HTML content
            let htmlContent = '<div style="max-height: 400px; overflow-y: auto;">';
            htmlContent += '<h3 style="margin-top: 0; color: #10b981;">Address</h3>';

            // Show loading for geocoding
            htmlContent += '<div style="padding: 10px; background: #f3f4f6; border-radius: 4px; margin-bottom: 10px;">';
            htmlContent += '<strong>Location:</strong> <span id="geocode-result">Loading...</span>';
            htmlContent += '</div>';

            htmlContent += '<h4 style="margin: 10px 0 5px 0; font-size: 14px;">Properties:</h4>';
            htmlContent += '<table style="width: 100%; font-size: 12px;">';

            for (const [key, value] of Object.entries(properties)) {
                htmlContent += `<tr><td style="padding: 4px; font-weight: bold;">${key}:</td><td style="padding: 4px;">${value}</td></tr>`;
            }

            htmlContent += '</table></div>';

            const popup = new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(htmlContent)
                .addTo(map);

            // Perform reverse geocoding using Geocoding API v6
            try {
                const response = await fetch(
                    `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${lng}&latitude=${lat}&language=ja&access_token=${mapboxgl.accessToken}`
                );
                const data = await response.json();

                let geocodeResult = 'No address found';
                if (data.features && data.features.length > 0) {
                    const place = data.features[0];
                    geocodeResult = place.properties.full_address || place.properties.place_formatted || 'Address found but no details available';
                }

                // Update the popup with geocoding result
                const geocodeElement = popup.getElement().querySelector('#geocode-result');
                if (geocodeElement) {
                    geocodeElement.textContent = geocodeResult;
                }
            } catch (error) {
                console.error('Geocoding error:', error);
                const geocodeElement = popup.getElement().querySelector('#geocode-result');
                if (geocodeElement) {
                    geocodeElement.textContent = 'Failed to load address';
                }
            }
        });

        // Layer toggle controls
        document.getElementById('toggle-doors').addEventListener('change', (e) => {
            const visibility = e.target.checked ? 'visible' : 'none';
            map.setLayoutProperty('doors-layer', 'visibility', visibility);
        });

        document.getElementById('toggle-addresses').addEventListener('change', (e) => {
            const visibility = e.target.checked ? 'visible' : 'none';
            map.setLayoutProperty('addresses-layer', 'visibility', visibility);
        });

        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

        // Log click coordinates for debugging
        map.on('click', (event) => {
            const { lng, lat } = event.lngLat;
            console.log(`Clicked at: Longitude: ${lng}, Latitude: ${lat}`);
        });
    });
};

loadMap();
