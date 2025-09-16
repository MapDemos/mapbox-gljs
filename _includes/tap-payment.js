//let coordinates = [139.7671, 35.6812]; // Default to Tokyo Station
let coordinates = [139.6380, 35.4437]; // Default to some coordinates
let map; // To hold the map instance
const colorCache = {}; // Cache for computed CSS colors

/**
 * Gets the computed background color for a given Tailwind CSS class.
 * @param {string} className - The Tailwind class (e.g., 'bg-orange-400').
 * @returns {string} The computed color in rgb() format.
 */
function getHexFromTailwindClass(className) {
    if (colorCache[className]) {
        return colorCache[className];
    }

    // Create a temporary, hidden element
    const tempEl = document.createElement('div');
    tempEl.style.display = 'none';
    tempEl.className = className;
    document.body.appendChild(tempEl);

    // Get the computed color and cache it
    const computedColor = window.getComputedStyle(tempEl).backgroundColor;
    colorCache[className] = computedColor;

    // Clean up the temporary element
    document.body.removeChild(tempEl);
    return computedColor;
}

function createRandomMMdd() {
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1; // To avoid complications with different month lengths
    return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
}

document.addEventListener('DOMContentLoaded', () => {
    const transactionListContainer = document.getElementById('transaction-list');
    const mapContainer = document.getElementById('map-container');
    const mapToggleButton = document.getElementById('map-toggle-button');
    const backButton = document.getElementById('back-button');
    let transactions = []; // Store transactions in a higher scope

    // Function to switch to Map View
    function showMapView() {
        transactionListContainer.style.display = 'none';
        mapContainer.style.display = 'block';

        if (!map) { // Initialize map only once
            map = new mapboxgl.Map({
                container: 'map-container',
                //style: 'mapbox://styles/mapbox/streets-v12',
                center: coordinates,
                zoom: 14,
                language: 'ja'
            });

            // Calculate the bounding box that contains all transaction points.
            if (transactions.length > 0) {
                const bounds = new mapboxgl.LngLatBounds();
                transactions.forEach(t => {
                    // Ensure the feature has valid geometry and coordinates
                    if (t.geometry && t.geometry.coordinates) {
                        bounds.extend(t.geometry.coordinates);
                    }
                });

                // Fit the map to the calculated bounds.
                map.fitBounds(bounds, {
                    padding: 50, // Add 50px padding around the bounds
                    duration: 0 // Jump to the view instantly
                });
            }


            map.on('load', () => {
                map.setConfigProperty('basemap', 'showPointOfInterestLabels', false);
                // Create a GeoJSON source from the transaction data
                const geojson = {
                    type: 'FeatureCollection',
                    features: transactions.map(t => ({
                        type: 'Feature',
                        geometry: t.geometry,
                        properties: {
                            // Pass the item_id to link back to the full data
                            item_id: t.item_id,
                            name: t.name,
                            amount: t.amount,
                            color: t.hexColor
                        }
                    }))
                };

                map.addSource('transactions', {
                    type: 'geojson',
                    data: geojson
                });

                map.addLayer({
                    id: 'transaction-points',
                    type: 'circle',
                    source: 'transactions',
                    paint: {
                        'circle-radius': 8,
                        'circle-color': ['get', 'color'], // Directly use the color from the feature
                        'circle-stroke-width': 2,
                        'circle-stroke-color': '#ffffff'
                    }
                });

                // Get panel elements
                const panel = document.getElementById('map-details-panel');
                const panelName = document.getElementById('panel-name');
                const panelDetails = document.getElementById('panel-details');
                const panelImage = document.getElementById('panel-image');
                const panelCloseButton = document.getElementById('panel-close-button');

                // Hide panel when close button is clicked
                panelCloseButton.addEventListener('click', () => {
                    panel.style.display = 'none';
                });

                // Show panel with details on point click
                map.on('click', 'transaction-points', (e) => {
                    const props = e.features[0].properties;
                    
                    // Find the full transaction object using the unique item_id
                    const fullTransaction = transactions.find(t => t.item_id === props.item_id);

                    if (fullTransaction) {
                        // Populate the panel
                        panelName.textContent = fullTransaction.name;
                        
                        // Build the details string with styled titles and content
                        const detailsParts = [];
                        if (fullTransaction.rank) {
                            detailsParts.push(`<span class="text-gray-500">ジャンル:</span> <span class="text-gray-900">${fullTransaction.categorylabel}</span>`);
                        }
                        if (fullTransaction.tel) {
                            detailsParts.push(`<span class="text-gray-500">電話:</span> <span class="text-gray-900">${fullTransaction.tel}</span>`);
                        }
                        if (fullTransaction.time) {
                            detailsParts.push(`<span class="text-gray-500">時間:</span> <span class="text-gray-900">${fullTransaction.time}</span>`);
                        }
                        panelDetails.innerHTML = detailsParts.join('<br>'); // Use innerHTML for line breaks

                        panelImage.src = fullTransaction.photo || ''; // Use photo URL
                        panelImage.style.display = fullTransaction.photo ? 'block' : 'none'; // Hide img if no photo

                        // Show the panel
                        panel.style.display = 'block';
                    }
                });

                // Hide panel when clicking on the map canvas itself
                map.on('click', (e) => {
                    // Check if the click was on a point. If not, hide the panel.
                    const features = map.queryRenderedFeatures(e.point, { layers: ['transaction-points'] });
                    if (!features.length) {
                        panel.style.display = 'none';
                    }
                });

                map.on('mouseenter', 'transaction-points', () => { map.getCanvas().style.cursor = 'pointer'; });
                map.on('mouseleave', 'transaction-points', () => { map.getCanvas().style.cursor = ''; });
            });
        } else {
            map.resize(); // Ensure map is rendered correctly if it already exists
        }
    }

    // Function to switch back to List View
    function showListView() {
        mapContainer.style.display = 'none';
        transactionListContainer.style.display = 'block';
    }

    // Add event listeners
    mapToggleButton.addEventListener('click', showMapView);
    backButton.addEventListener('click', showListView);


    // Fetch data and then render the initial list
    getFirstAddress(coordinates).then(async address => {
        console.log("Address:", address);
        const allGenrePOIs = await getAllGenrePOIs(address);
        
        transactions = allGenrePOIs.features.map((feature) => {
            const iconInfo = getIconAndColorForGenre(feature.properties.lgenre);
            const tailwindColorClass = iconInfo ? iconInfo.color : 'bg-blue-500';

            return {
                ...feature.properties,
                geometry: feature.geometry,
                date: createRandomMMdd(),
                amount: Math.floor(Math.random() * 10000) + 1000,
                icon: iconInfo ? iconInfo.icon : 'fas fa-store',
                color: tailwindColorClass, // For the list view (e.g., 'bg-orange-400')
                categorylabel: iconInfo ? iconInfo.categorylabel : 'ー',  
                hexColor: getHexFromTailwindClass(tailwindColorClass) // For the map view (e.g., 'rgb(251, 146, 60)')
            };
        });
        console.log("Transactions with colors:", transactions);

        transactions.sort((a, b) => {
            const dateA = new Date(`2024/${a.date}`);
            const dateB = new Date(`2024/${b.date}`);
            return dateB - dateA;
        });

        renderTransactions(transactions);
    });

    function renderTransactions(trans) {
        let html = '';
        trans.forEach(transaction => {
            html += `
                <div class="p-4 flex items-center">
                    <div class="w-12 text-sm text-gray-500 mr-4 flex-shrink-0">${transaction.date}</div>
                    <div class="w-10 h-10 ${transaction.color} rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                        <i class="${transaction.icon} text-white"></i>
                    </div>
                    <div class="flex-grow min-w-0 mr-4">
                        <div class="text-gray-800">${transaction.name}</div>
                    </div>
                    <div class="text-gray-800 font-semibold whitespace-nowrap flex-shrink-0">¥${transaction.amount.toLocaleString()}</div>
                </div>
            `;
        });
        transactionListContainer.innerHTML = html;
    }
});