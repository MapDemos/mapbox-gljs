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

/**
 * Converts an rgb() color string to a hex color string.
 * @param {string} rgb - The color in 'rgb(r, g, b)' format.
 * @returns {string} The color in '#rrggbb' format.
 */
function rgbToHex(rgb) {
    if (!rgb || !rgb.startsWith('rgb')) return '#CCCCCC'; // Return a default if format is wrong
    const [r, g, b] = rgb.match(/\d+/g).map(Number);
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

function createRandomMMdd() {
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1; // To avoid complications with different month lengths
    return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
}

function createRandomHHMM() {
    const hour = Math.floor(Math.random() * 24);
    const minute = Math.floor(Math.random() * 60);
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

document.addEventListener('DOMContentLoaded', () => {
    const transactionListContainer = document.getElementById('transaction-list');
    const mapContainer = document.getElementById('map-container');
    const detailsView = document.getElementById('details-view');
    const mapToggleButton = document.getElementById('map-toggle-button');
    const backButton = document.getElementById('back-button');
    let transactions = []; // Store transactions in a higher scope
    let currentView = 'list'; // Can be 'list', 'map', or 'details'

    // --- View Switching Functions ---
    function showMapView() {
        transactionListContainer.style.display = 'none';
        detailsView.style.display = 'none';
        mapContainer.style.display = 'block';
        currentView = 'map';

        if (!map) { // Initialize map only once
            map = new mapboxgl.Map({
                container: 'map-container',
                //style: 'mapbox://styles/kenji-shima/cmfn8lqzj009t01rfd4ny8xsh',
                center: coordinates,
                zoom: 14,
                language: 'ja'
            });

            // Add a red marker for the user's current position
            new mapboxgl.Marker({ color: '#FF0000', scale: 0.7 })
                .setLngLat(coordinates)
                .addTo(map);

            // Calculate the bounding box that contains all transaction points.
            if (transactions.length > 0) {
                const bounds = new mapboxgl.LngLatBounds();
                transactions.forEach(t => {
                    // Ensure the feature has valid geometry and coordinates
                    if (t.geometry && t.geometry.coordinates) {
                        bounds.extend(t.geometry.coordinates);
                    }
                });

                // Also include the user's current position in the bounds
                bounds.extend(coordinates);

                // Fit the map to the calculated bounds.
                map.fitBounds(bounds, {
                    padding: 60, // Increased padding slightly for better spacing
                    duration: 0 // Jump to the view instantly
                });
            }


            map.on('load', () => {
                map.setConfigProperty('basemap', 'showPointOfInterestLabels', false);

                // --- Add a source and layer for the route line ---
                map.addSource('route', {
                    'type': 'geojson',
                    'data': {
                        'type': 'Feature',
                        'properties': {},
                        'geometry': {
                            'type': 'LineString',
                            'coordinates': []
                        }
                    }
                });
                map.addLayer({
                    'id': 'route',
                    'type': 'line',
                    'source': 'route',
                    'layout': {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    'paint': {
                        'line-color': '#3887be',
                        'line-width': 5,
                        'line-opacity': 0.75
                    }
                });

                // Create a GeoJSON source from the transaction data
                const geojson = {
                    type: 'FeatureCollection',
                    features: transactions.map(t => ({
                        type: 'Feature',
                        geometry: t.geometry,
                        properties: {
                            item_id: t.item_id,
                            name: t.name,
                            color: t.hexColor
                        }
                    }))
                };

                map.addSource('transactions', {
                    type: 'geojson',
                    data: geojson,
                    promoteId: 'item_id' // Use the 'item_id' property as the feature's ID
                });

                // Layer 1: The colored circles
                map.addLayer({
                    id: 'transaction-circles',
                    type: 'circle',
                    source: 'transactions',
                    paint: {
                        'circle-color': ['get', 'color'],
                        // Use a 'case' expression to change radius when selected
                        'circle-radius': [
                            'case',
                            ['boolean', ['feature-state', 'selected'], false],
                            11, // Radius when selected
                            8   // Default radius
                        ],
                        // Use a 'case' expression to change stroke width when selected
                        'circle-stroke-width': [
                            'case',
                            ['boolean', ['feature-state', 'selected'], false],
                            3, // Stroke width when selected
                            2  // Default stroke width
                        ],
                        // Use a 'case' expression to change stroke color when selected
                        'circle-stroke-color': [
                            'case',
                            ['boolean', ['feature-state', 'selected'], false],
                            '#ffffff', // White stroke when selected
                            '#ffffff'  // Default white stroke
                        ]
                    }
                });

                // Layer 2: The text labels
                map.addLayer({
                    id: 'transaction-labels',
                    type: 'symbol',
                    source: 'transactions',
                    layout: {
                        'text-field': ['get', 'name'],
                        'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                        'text-size': 12,
                        'text-anchor': 'top', // Anchor the text to its top edge
                        'text-offset': [0, 1] // Offset it to appear just below the circle
                    },
                    paint: {
                        'text-color': '#374151', // A dark gray color
                        'text-halo-color': '#ffffff',
                        'text-halo-width': 1
                    }
                });

                // Get panel container elements
                const panelContainer = document.getElementById('map-details-panel');
                const horizontalScrollContainer = document.getElementById('horizontal-scroll-container');
                const panelCloseButton = document.getElementById('panel-close-button');
                let selectedItemId = null; // Variable to track the selected item ID
                let scrollTimeout; // To handle scroll end detection

                // --- Function to get and draw the route ---
                async function getAndDrawRoute(destination) {
                    const start = coordinates; // User's current location
                    const url = `https://api.mapbox.com/directions/v5/mapbox.tmp.valhalla-zenrin/walking/${start[0]},${start[1]};${destination[0]},${destination[1]}?steps=true&geometries=polyline&access_token=${mapboxgl.accessToken}`;

                    try {
                        const response = await fetch(url);
                        const data = await response.json();
                        const route = polyline.toGeoJSON(data.routes[0].geometry);

                        const geojson = {
                            'type': 'Feature',
                            'properties': {},
                            'geometry': route
                        };

                        // Update the route source with the new data
                        map.getSource('route').setData(geojson);

                    } catch (error) {
                        console.error("Error fetching directions:", error);
                    }
                }

                // --- Add listener to hide the panel ---
                panelCloseButton.addEventListener('click', () => {
                    panelContainer.style.display = 'none';
                });

                // --- Function to render all panels into the horizontal list ---
                function renderHorizontalPanels(transactions) {
                    let html = '';
                    transactions.forEach(transaction => {
                        const detailsParts = [];
                        if (transaction.categorylabel) {
                            detailsParts.push(`<span class="text-gray-500">ジャンル:</span> <span class="text-gray-900">${transaction.categorylabel}</span>`);
                        }
                        if (transaction.tel) {
                            detailsParts.push(`<span class="text-gray-500">電話:</span> <span class="text-gray-900">${transaction.tel}</span>`);
                        }

                        // Calculate payment details
                        const totalAmount = transaction.amount;
                        const subtotal = Math.round(totalAmount / 1.10);
                        const tax = totalAmount - subtotal;
                        const paymentDate = new Date(`2025/${transaction.date} ${transaction.time}`);
                        const formattedDateTime = `${paymentDate.getFullYear()}年${paymentDate.getMonth() + 1}月${paymentDate.getDate()}日 ${transaction.time}`;

                        html += `
                            <div class="map-panel-item bg-white rounded-lg shadow-lg p-4 w-80 flex-shrink-0 snap-center transition-all duration-300 max-h-[70vh] overflow-y-auto" data-item-id="${transaction.item_id}">
                                
                                <!-- Expanded Image (initially hidden) -->
                                <img src="${transaction.photo || ''}" alt="Shop Image" class="panel-image-expanded w-full h-48 rounded-md object-cover mb-4 hidden" style="${transaction.photo ? '' : 'display:none;'}">

                                <div class="panel-header flex items-start">
                                    <div class="flex-grow min-w-0">
                                        <h3 class="font-bold text-lg">${transaction.name}</h3>
                                        <p class="text-sm text-gray-600 mt-1">${detailsParts.join('<br>')}</p>
                                    </div>
                                    <!-- Thumbnail Image -->
                                    <img src="${transaction.photo || ''}" alt="Shop Image" class="panel-image-thumb w-20 h-20 rounded-md object-cover ml-4 flex-shrink-0" style="${transaction.photo ? '' : 'display:none;'}">
                                </div>

                                <div class="flex justify-between mt-4">
                                    <button class="route-button bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold w-full mr-2">ルート</button>
                                    <button class="details-toggle-button bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold w-full ml-2">詳細</button>
                                </div>

                                <!-- Expanded details section (hidden by default) -->
                                <div class="panel-expanded-content hidden mt-4 border-t pt-4 text-sm">
                                    <div class="flex justify-between mb-1"><span>決済日時</span><span>${formattedDateTime}</span></div>
                                    <div class="flex justify-between mb-1"><span>支払い額</span><span>¥${totalAmount.toLocaleString()}</span></div>
                                    <div class="flex justify-between mb-1"><span>購入小計</span><span>¥${subtotal.toLocaleString()}</span></div>
                                    <div class="flex justify-between mb-1"><span>消費税（10%）</span><span>¥${tax.toLocaleString()}</span></div>
                                    <div class="flex justify-between font-bold mt-2 pt-2 border-t"><span>合計</span><span>¥${totalAmount.toLocaleString()}</span></div>
                                </div>
                            </div>
                        `;
                    });
                    horizontalScrollContainer.innerHTML = html;
                    panelContainer.style.display = 'block';
                }

                // Render the panels when the map loads
                renderHorizontalPanels(transactions);

                // --- Add listener for scroll events to highlight the map POI ---
                horizontalScrollContainer.addEventListener('scroll', () => {
                    clearTimeout(scrollTimeout);
                    scrollTimeout = setTimeout(() => {
                        const containerRect = horizontalScrollContainer.getBoundingClientRect();
                        const containerCenter = containerRect.left + containerRect.width / 2;

                        // Find which panel item is in the center of the container
                        for (const panelItem of horizontalScrollContainer.children) {
                            const itemRect = panelItem.getBoundingClientRect();
                            if (containerCenter >= itemRect.left && containerCenter <= itemRect.right) {
                                const scrolledToItemId = panelItem.dataset.itemId;

                                // If this is a new item, update the map highlight
                                if (scrolledToItemId && selectedItemId != scrolledToItemId) {
                                    if (selectedItemId !== null) {
                                        map.setFeatureState({ source: 'transactions', id: selectedItemId }, { selected: false });
                                    }
                                    map.setFeatureState({ source: 'transactions', id: scrolledToItemId }, { selected: true });
                                    selectedItemId = scrolledToItemId;
                                }
                                break; // Exit loop once the center item is found
                            }
                        }
                    }, 150); // Wait 150ms after scroll stops to fire.
                });

                // --- Add listener for all panel buttons ---
                horizontalScrollContainer.addEventListener('click', (e) => {
                    // Handle "詳細" / "概要" button clicks
                    const detailsButton = e.target.closest('.details-toggle-button');
                    if (detailsButton) {
                        const isExpanding = detailsButton.textContent === '詳細';
                        const allPanelItems = horizontalScrollContainer.querySelectorAll('.map-panel-item');

                        allPanelItems.forEach(panelItem => {
                            const expandedContent = panelItem.querySelector('.panel-expanded-content');
                            const thumbImage = panelItem.querySelector('.panel-image-thumb');
                            const expandedImage = panelItem.querySelector('.panel-image-expanded');
                            const toggleButton = panelItem.querySelector('.details-toggle-button');

                            if (isExpanding) {
                                // Expand this panel
                                expandedContent.classList.remove('hidden');
                                if (thumbImage) thumbImage.classList.add('hidden');
                                if (expandedImage) expandedImage.classList.remove('hidden');
                                toggleButton.textContent = '概要';
                            } else {
                                // Collapse this panel
                                expandedContent.classList.add('hidden');
                                if (thumbImage) thumbImage.classList.remove('hidden');
                                if (expandedImage) expandedImage.classList.add('hidden');
                                toggleButton.textContent = '詳細';
                            }
                        });
                        return; // Stop further processing
                    }

                    // Handle "ルート" button clicks
                    const routeButton = e.target.closest('.route-button');
                    if (routeButton) {
                        const panelItem = routeButton.closest('.map-panel-item');
                        const itemId = panelItem.dataset.itemId;
                        const transaction = transactions.find(t => t.item_id == itemId);
                        if (transaction && transaction.geometry && transaction.geometry.coordinates) {
                            getAndDrawRoute(transaction.geometry.coordinates);
                            panelContainer.style.display = 'none'; // Close the panel
                        }
                        return; // Stop further processing
                    }
                });

                // Show panel with details on point click
                map.on('click', 'transaction-circles', (e) => {
                    // Make sure the panel is visible before trying to scroll
                    panelContainer.style.display = 'block';

                    const props = e.features[0].properties;
                    const clickedItemId = props.item_id;

                    // --- Highlight logic ---
                    if (selectedItemId !== null) {
                        map.setFeatureState({ source: 'transactions', id: selectedItemId }, { selected: false });
                    }
                    map.setFeatureState({ source: 'transactions', id: clickedItemId }, { selected: true });
                    selectedItemId = clickedItemId;
                    // --- End highlight logic ---

                    const targetElement = horizontalScrollContainer.querySelector(`[data-item-id='${props.item_id}']`);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    }
                });

                map.on('mouseenter', 'transaction-circles', () => { map.getCanvas().style.cursor = 'pointer'; });
                map.on('mouseleave', 'transaction-circles', () => { map.getCanvas().style.cursor = ''; });
            });
        } else {
            map.resize();
        }
    }

    function showListView() {
        mapContainer.style.display = 'none';
        detailsView.style.display = 'none';
        transactionListContainer.style.display = 'block';
        currentView = 'list';
    }

    function showDetailsView(transaction) {
        transactionListContainer.style.display = 'none';
        mapContainer.style.display = 'none';
        detailsView.style.display = 'block';
        currentView = 'details';

        // Populate the details view
        document.getElementById('details-shop-name').textContent = transaction.name;

        // Calculate subtotal and tax from the total amount
        const totalAmount = transaction.amount;
        const subtotal = Math.round(totalAmount / 1.10);
        const tax = totalAmount - subtotal;

        // Format all values
        const totalFormatted = `¥${totalAmount.toLocaleString()}`;
        const subtotalFormatted = `¥${subtotal.toLocaleString()}`;
        const taxFormatted = `¥${tax.toLocaleString()}`;
        const paymentDate = new Date(`2025/${transaction.date} ${transaction.time}`);
        const formattedDateTime = `${paymentDate.getFullYear()}年${paymentDate.getMonth() + 1}月${paymentDate.getDate()}日 ${transaction.time}`;



        // Update the DOM
        document.getElementById('details-datetime').textContent = formattedDateTime;
        document.getElementById('details-amount').textContent = totalFormatted;
        document.getElementById('details-subtotal').textContent = subtotalFormatted;
        document.getElementById('details-tax').textContent = taxFormatted;
        document.getElementById('details-total').textContent = totalFormatted;

        // --- Generate and set the Static Map Image ---
        if (transaction.geometry && transaction.geometry.coordinates) {
            const [lng, lat] = transaction.geometry.coordinates;
            const accessToken = mapboxgl.accessToken;
            const width = 600; // Image width
            const height = 300; // Image height
            const zoom = 14;
            const pitch = 0;
            const bearing = 0; // Camera bearing

            // Convert the transaction's rgb color to a hex code for the API
            const markerColorHex = rgbToHex(transaction.hexColor);

            // Create a GeoJSON object for a styled circle marker
            const geojson = {
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "geometry": { "type": "Point", "coordinates": [lng, lat] },
                    "properties": { "marker-color": markerColorHex, "marker-size": "medium" }
                }]
            };

            // URL-encode the GeoJSON object
            const overlay = `geojson(${encodeURIComponent(JSON.stringify(geojson))})`;

            // Construct the Static Images API URL with 3D style, Japanese labels, and no POIs
            const staticImageUrl = `https://api.mapbox.com/styles/v1/kenji-shima/cmfn8lqzj009t01rfd4ny8xsh/static/${overlay}/${lng},${lat},${zoom},${bearing},${pitch}/${width}x${height}?access_token=${accessToken}`;

            // Set the image source
            document.getElementById('details-map-image').src = staticImageUrl;
        }
    }

    // --- Event Listeners ---
    mapToggleButton.addEventListener('click', showMapView);

    // Back button now handles multiple views
    backButton.addEventListener('click', () => {
        if (currentView === 'map' || currentView === 'details') {
            showListView();
        } else {
            // Default back action (e.g., go to previous page)
            window.history.back();
        }
    });

    // Use event delegation for transaction list clicks
    transactionListContainer.addEventListener('click', (e) => {
        const itemElement = e.target.closest('.transaction-item');
        if (itemElement) {
            const itemId = itemElement.dataset.itemId;
            // Use loose equality (==) to match string from dataset with number in object
            const clickedTransaction = transactions.find(t => t.item_id == itemId);
            if (clickedTransaction) {
                showDetailsView(clickedTransaction);
            } else {
                console.error("Transaction not found for ID:", itemId);
            }
        }
    });

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
                time: createRandomHHMM(),
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
            // Added cursor-pointer and hover effect classes
            html += `
                <div class="p-4 flex items-center transaction-item cursor-pointer hover:bg-gray-50" data-item-id="${transaction.item_id}">
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