const defaultCoordinates = [174.7762, -41.2865]; // Wellington

let map;
const loadMap = () => {
    map = new mapboxgl.Map({
        container: 'map',
        center: defaultCoordinates,
        zoom: 10,
        scrollZoom: true,
        language: 'en',
    });
};

/**
 * A wrapper for Mapbox Geocoding V6 that attempts to find the closest match
 * for an address by simplifying it if the initial query fails.
 *
 * @param {string} query The address string to geocode.
 * @param {string} accessToken Your Mapbox access token.
 * @returns {Promise<object>} A promise that resolves to an object with the matched address and any unknown components.
 */
async function fuzzyGeocode(query) {
    // Base URL for the Mapbox Geocoding API
    const baseUrl = 'https://api.mapbox.com/search/geocode/v6/forward?q=';
    const attempts = [];

    // Helper function to perform the actual geocoding request
    const geocode = async (search_text) => {
        console.log('Geocoding:', search_text);
        attempts.push({ attempt: attempts.length + 1, search_text: search_text });
        //const delivereasyToken = 'pk.eyJ1IjoiZGVsaXZlcmVhc3kiLCJhIjoiY2xwMGpyYjI1MDdkZDJrczRyeWN3dWRsYyJ9.ZbphbQHHzuYRkvzpV6Qj4A'
        const url = `${baseUrl}${encodeURIComponent(search_text)}&country=nz&types=address&limit=10&access_token=${mapboxgl.accessToken}`;
        //const url = `${baseUrl}${encodeURIComponent(search_text)}&country=nz&types=address&limit=10&access_token=${delivereasyToken}`;
        console.log('Geocoding URL:', url);
        try {
            const response = await fetch(url);
            const data = await response.json();
            console.log('Geocoding response:', data);
            if (data.features && data.features.length > 0) {
                return data.features; // Return all features
            }
            return []; // No features found, return empty array
        } catch (error) {
            console.error('Geocoding request failed:', error);
            return []; // Return empty array on error
        }
    };

    // 1. Initial Attempt with the full query
    let features = await geocode(query);
    if (features.length > 0) {
        return {
            features: features,
            unknown: null,
            attempts: attempts
        };
    }

    // 2. Fallback: Define simplification strategies (using regex)
    const simplificationStrategies = [
        {
            // Matches patterns like "4/7 Trent Street" or "4B/7 Trent Street"
            name: 'unit_number_slash',
            regex: /^([\w\d-]+)\s*[\/\\]\s*(.*)$/i,
            getUnknown: (matches) => ({ unit_number: matches[1] }),
            getSimplifiedQuery: (matches) => matches[2],
        },
        {
            // Matches patterns like "Unit 4 Trent Street" or "Apt 2B Trent Street"
            name: 'unit_number_keyword',
            regex: /^(?:Unit|Apt|Apartment|#)\s*([\w\d-]+)\s+(.*)$/i,
            getUnknown: (matches) => ({ unit_number: matches[1] }),
            getSimplifiedQuery: (matches) => matches[2],
        }
        // You could add more strategies here for other address formats
    ];

    // 3. Iterate through strategies and re-query
    for (const strategy of simplificationStrategies) {
        const match = query.match(strategy.regex);
        if (match) {
            const simplifiedQuery = strategy.getSimplifiedQuery(match);
            features = await geocode(simplifiedQuery);

            if (features.length > 0) {
                // Success with a simplified query!
                return {
                    features: features,
                    unknown: strategy.getUnknown(match),
                    attempts: attempts
                };
            }
        }
    }

    // 4. If all attempts fail
    return {
        features: [],
        unknown: { original_query: query },
        attempts: attempts
    };
}

let markers = []; // To hold the map markers

function showPopup(markerIndex) {
    if (markers[markerIndex]) {
        // Pan the map to the marker's location.
        // map.flyTo({
        //     center: markers[markerIndex].getLngLat(),
        //     zoom: 16
        // });

        // Close all other popups and open the one for the clicked marker.
        markers.forEach((marker, index) => {
            if (marker.getPopup().isOpen() && index !== markerIndex) {
                marker.togglePopup();
            }
        });
        if (!markers[markerIndex].getPopup().isOpen()) {
            markers[markerIndex].togglePopup();
        }
    }
}

// Function to handle the search
const handleSearch = () => {
    const addressToFind = document.getElementById('address-input').value;
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = 'Searching...';

    if (!addressToFind) {
        resultsContainer.innerHTML = 'Please enter an address.';
        return;
    }

    fuzzyGeocode(addressToFind).then(result => {
        // Clear previous markers if they exist
        markers.forEach(marker => marker.remove());
        markers = [];

        if (result.features && result.features.length > 0) {
            const bounds = new mapboxgl.LngLatBounds();

            // Create and add new markers
            result.features.forEach(feature => {
                const coordinates = feature.geometry.coordinates;
                const newMarker = new mapboxgl.Marker()
                    .setLngLat(coordinates)
                    .setPopup(new mapboxgl.Popup().setHTML(`
                        <strong>Type:</strong> ${feature.properties.feature_type}<br>
                        <strong>Matched:</strong> ${feature.properties.full_address}<br>
                        <strong>Original:</strong> ${addressToFind}<br>
                        ${result.unknown ? `<strong>Unknown:</strong> ${JSON.stringify(result.unknown)}` : ''}
                    `))
                    .addTo(map);
                markers.push(newMarker);
                bounds.extend(coordinates);
            });

            // Fit map to bounds
            map.fitBounds(bounds, {
                padding: 100,
                maxZoom: 15
            });

            // --- Display results in the side panel ---
            const attemptsHtml = result.attempts.map(a => `<li>Attempt ${a.attempt}: "${a.search_text}"</li>`).join('');

            const highlight = (original, matched) => {
                const matchedWords = matched.toLowerCase().split(/[\s,]+/).filter(Boolean);
                const matchedSet = new Set(matchedWords);
                const delimiterRegex = /^[\s,]+$/;
                const originalParts = original.split(/([\s,]+)/);
                return originalParts.map(part => {
                    if (!part) return '';
                    const cleanPart = part.toLowerCase().replace(/,$/, '');
                    if (matchedSet.has(cleanPart)) return `<span class="matched">${part}</span>`;
                    if (delimiterRegex.test(part)) return part;
                    return `<span class="unmatched">${part}</span>`;
                }).join('');
            };
            
            const matchedText = result.unknown ? result.attempts[result.attempts.length - 1].search_text : addressToFind;
            const originalQueryHtml = highlight(addressToFind, matchedText);
            
            const resultsHtml = result.features.map((feature, index) => {
                const highlightedAddress = highlight(feature.properties.full_address, matchedText);
                
                // Format the match_code object into an HTML list
                let matchCodeHtml = '';
                if (feature.properties.match_code) {
                    matchCodeHtml = '<ul class="match-code-list">';
                    for (const [key, value] of Object.entries(feature.properties.match_code)) {
                        matchCodeHtml += `<li><strong>${key.replace(/_/g, ' ')}:</strong> ${value}</li>`;
                    }
                    matchCodeHtml += '</ul>';
                }

                return `
                <div class="result-item" onclick="showPopup(${index})">
                    <strong>${index + 1}. ${highlightedAddress}</strong><br>
                    Type: ${feature.properties.feature_type}<br>
                    Coordinates: ${feature.geometry.coordinates.join(', ')}
                    ${matchCodeHtml}
                </div>`;
            }).join('');

            let missingWordsHtml = '';
            const topResultAddress = result.features[0].properties.full_address;
            const originalWords = new Set(addressToFind.toLowerCase().split(/[\s,]+/).filter(Boolean));
            const resultWords = new Set(topResultAddress.toLowerCase().split(/[\s,]+/).filter(Boolean));
            const missingWords = [...originalWords].filter(word => !resultWords.has(word));

            if (missingWords.length > 0) {
                missingWordsHtml = `<p><strong>Words in query but not top result:</strong><br><span class="unmatched">${missingWords.join(', ')}</span></p>`;
            }

            resultsContainer.innerHTML = `
                <h4>${result.features.length} Result(s) Found</h4>
                <div class="results-list">${resultsHtml}</div>
                <hr>
                <p><strong>Original Query:</strong><br>${originalQueryHtml}</p>
                ${result.unknown ? `<p><strong>Unmatched Part (by simplification):</strong><br>${JSON.stringify(result.unknown)}</p>` : ''}
                ${missingWordsHtml}
                <p><strong>Search Attempts (${result.attempts.length}):</strong></p>
                <ul>${attemptsHtml}</ul>
            `;
        } else {
            const attemptsHtml = result.attempts.map(a => `<li>Attempt ${a.attempt}: "${a.search_text}"</li>`).join('');
            resultsContainer.innerHTML = `
                <h4>No match found</h4>
                <p>Could not find a location for "<span class="unmatched">${addressToFind}</span>".</p>
                <p><strong>Search Attempts (${result.attempts.length}):</strong></p>
                <ul>${attemptsHtml}</ul>
            `;
        }
    });
};

// Add event listeners when the DOM is ready
document.addEventListener('DOMContentLoaded', (event) => {
    loadMap();
    document.getElementById('search-button').addEventListener('click', handleSearch);
    document.getElementById('address-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
});

loadMap();

// Resizer logic
document.addEventListener('DOMContentLoaded', function () {
    const resizer = document.getElementById('resizer');
    const sidebar = document.getElementById('sidebar');
    let isResizing = false;

    resizer.addEventListener('mousedown', function (e) {
        isResizing = true;
        document.body.style.cursor = 'col-resize'; // Change cursor for the whole page
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', stopResize);
    });

    function handleMouseMove(e) {
        if (!isResizing) return;
        // Prevent selecting text while dragging
        e.preventDefault();
        const newWidth = e.clientX;
        sidebar.style.width = newWidth + 'px';
        // Crucially, tell the map to resize itself
        if (map) {
            map.resize();
        }
    }

    function stopResize() {
        isResizing = false;
        document.body.style.cursor = 'default'; // Reset cursor
        // Clean up event listeners
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', stopResize);
    }
});
