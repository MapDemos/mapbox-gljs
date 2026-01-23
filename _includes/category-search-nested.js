// Initialize map centered on Tokyo
// Access token is already set in utils.js

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [139.6917, 35.6895], // Tokyo coordinates
    zoom: 11,
    language: 'ja' // Set language to Japanese
});

// Store for markers and current results
let markers = [];
let currentResults = [];
let categories = [];
let nestedCategories = {};
let selectedCategories = new Set();
let centerMarker = null;
let filteredCategories = [];
let dropdownVisible = false;
let expandedPaths = new Set();

// Color palette for different categories (up to 10 distinct colors)
const categoryColors = [
    '#4285f4', // Blue
    '#ea4335', // Red
    '#fbbc04', // Yellow
    '#34a853', // Green
    '#ff6d00', // Orange
    '#ab47bc', // Purple
    '#00acc1', // Cyan
    '#ff4081', // Pink
    '#43a047', // Dark Green
    '#7b1fa2', // Dark Purple
];

// Add navigation controls
map.addControl(new mapboxgl.NavigationControl(), 'top-right');

// Function to update center marker
function updateCenterMarker() {
    const center = map.getCenter();

    // Remove existing center marker if it exists
    if (centerMarker) {
        centerMarker.remove();
    }

    // Create center marker element
    const centerEl = document.createElement('div');
    centerEl.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: #ff4444;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        position: relative;
    `;

    // Add a pulse animation
    const pulseEl = document.createElement('div');
    pulseEl.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: #ff4444;
        opacity: 0.5;
        position: absolute;
        top: -3px;
        left: -3px;
        animation: pulse 2s ease-out infinite;
    `;
    centerEl.appendChild(pulseEl);

    // Create the center marker with popup
    centerMarker = new mapboxgl.Marker(centerEl, { anchor: 'center' })
        .setLngLat(center)
        .setPopup(new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<div style="padding: 5px;">
                <strong>検索中心点</strong><br>
                <span style="font-size: 11px; color: #666;">緯度: ${center.lat.toFixed(6)}<br>経度: ${center.lng.toFixed(6)}</span>
            </div>`))
        .addTo(map);
}

// Add CSS for pulse animation and custom styles
const customStyles = document.createElement('style');
customStyles.textContent = `
    @keyframes pulse {
        0% {
            transform: scale(1);
            opacity: 0.5;
        }
        50% {
            transform: scale(2);
            opacity: 0.2;
        }
        100% {
            transform: scale(3);
            opacity: 0;
        }
    }

    .category-chip {
        display: inline-flex;
        align-items: center;
        padding: 4px 10px;
        margin: 4px;
        background: #e8f0fe;
        border: 1px solid #4285f4;
        border-radius: 16px;
        font-size: 13px;
        color: #1967d2;
        cursor: default;
        animation: chipAppear 0.2s ease-out;
    }

    @keyframes chipAppear {
        from {
            transform: scale(0.8);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }

    .category-chip .remove-btn {
        margin-left: 6px;
        cursor: pointer;
        font-weight: bold;
        color: #5f6368;
        padding: 0 4px;
        border-radius: 50%;
        transition: background 0.2s;
    }

    .category-chip .remove-btn:hover {
        background: rgba(0,0,0,0.1);
    }

    .dropdown-item {
        padding: 8px 10px;
        cursor: pointer;
        font-size: 13px;
        transition: background 0.2s;
        display: flex;
        align-items: center;
    }

    .dropdown-item:hover {
        background: #f5f5f5;
    }

    .dropdown-item.highlighted {
        background: #e8f0fe;
    }

    .dropdown-item.selected {
        font-weight: 500;
    }

    .dropdown-item input[type="checkbox"] {
        margin-right: 8px;
    }

    .group-header {
        padding: 8px 10px;
        cursor: pointer;
        font-weight: 500;
        font-size: 13px;
        color: #333;
        display: flex;
        align-items: center;
        justify-content: space-between;
        transition: background 0.2s;
        border-radius: 4px;
    }

    .group-header:hover {
        background: #f0f0f0;
    }

    .group-header .arrow {
        transition: transform 0.2s;
        margin-right: 8px;
        font-size: 10px;
        flex-shrink: 0;
    }

    .group-header.expanded .arrow {
        transform: rotate(90deg);
    }

    .group-header.has-children {
        font-weight: 600;
    }

    .nested-group {
        margin-left: 0;
    }

    .nested-content {
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease-out;
    }

    .nested-content.expanded {
        max-height: 2000px;
        transition: max-height 0.3s ease-in;
    }

    .group-count {
        background: #e0e0e0;
        color: #666;
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 11px;
        margin-left: auto;
    }

    .group-checkbox {
        margin-right: 8px;
        flex-shrink: 0;
    }

    .search-input-wrapper {
        position: relative;
    }

    .dropdown-list {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        max-height: 500px;
        overflow-y: auto;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        display: none;
    }

    .dropdown-list.visible {
        display: block;
    }

    /* Custom scrollbar for chips container */
    #chips-container::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }

    #chips-container::-webkit-scrollbar-track {
        background: #f0f0f0;
        border-radius: 4px;
    }

    #chips-container::-webkit-scrollbar-thumb {
        background: #bbb;
        border-radius: 4px;
    }

    #chips-container::-webkit-scrollbar-thumb:hover {
        background: #999;
    }

    .select-all-none {
        padding: 8px 10px;
        border-bottom: 1px solid #e0e0e0;
        background: #fff;
        display: flex;
        gap: 10px;
        font-size: 12px;
        position: sticky;
        top: 0;
        z-index: 10;
    }

    .select-all-none button {
        background: white;
        border: 1px solid #ddd;
        padding: 6px;
        border-radius: 4px;
        cursor: pointer;
        color: #4285f4;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
    }

    .select-all-none button:hover {
        background: #e8f0fe;
        border-color: #4285f4;
    }

    .select-all-none button svg {
        pointer-events: none;
    }

    /* Level-based indentation */
    .level-0 { padding-left: 10px; }
    .level-1 { padding-left: 30px; background: #fafafa; }
    .level-2 { padding-left: 50px; background: #f5f5f5; }
    .level-3 { padding-left: 70px; background: #f0f0f0; }
    .level-4 { padding-left: 90px; background: #ebebeb; }

    .category-path {
        font-size: 10px;
        color: #999;
        margin-left: 8px;
    }
`;
document.head.appendChild(customStyles);

// Function to build nested category structure
function buildNestedStructure(categories) {
    const root = {
        name: 'root',
        children: {},
        items: [],
        count: 0,
        selected: 0
    };

    categories.forEach(category => {
        const name = category.name || category.canonical_id;
        const parts = name.split('>').map(p => p.trim());

        let current = root;
        let path = [];

        // Navigate/create the tree structure
        parts.forEach((part, index) => {
            path.push(part);

            if (index === parts.length - 1) {
                // This is a leaf item
                current.items.push({
                    ...category,
                    displayName: part,
                    fullPath: path.join(' > '),
                    pathArray: [...path]
                });
                current.count++;
            } else {
                // This is a group
                if (!current.children[part]) {
                    current.children[part] = {
                        name: part,
                        children: {},
                        items: [],
                        count: 0,
                        selected: 0,
                        fullPath: path.join(' > ')
                    };
                }
                current = current.children[part];
            }
        });
    });

    // Calculate counts recursively
    function calculateCounts(node) {
        let totalCount = node.items.length;
        let totalSelected = node.items.filter(item =>
            selectedCategories.has(item.canonical_id)
        ).length;

        Object.values(node.children).forEach(child => {
            const [childCount, childSelected] = calculateCounts(child);
            totalCount += childCount;
            totalSelected += childSelected;
        });

        node.count = totalCount;
        node.selected = totalSelected;
        return [totalCount, totalSelected];
    }

    calculateCounts(root);
    return root;
}

// Function to fetch categories
async function fetchCategories() {
    try {
        console.log('Fetching categories...');

        const response = await fetch(
            'https://api.mapbox.com/search/v1/list/category?' +
            'language=ja&' +
            'access_token=' + mapboxgl.accessToken + '&' +
            'industry_code=japan&' +
            'limit=1000'
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Categories response:', data);

        categories = data.listItems || [];

        // Build nested structure
        nestedCategories = buildNestedStructure(categories);

        // Initialize expanded state for top-level groups
        Object.keys(nestedCategories.children).forEach(key => {
            expandedPaths.add(key);
        });

        // Create multi-select UI
        createMultiSelectUI(categories);

        console.log(`Loaded ${categories.length} categories`);

    } catch (error) {
        console.error('Error fetching categories:', error);
        createStatusMessage('カテゴリーの読み込みに失敗しました', 'error');
    }
}

// Function to create multi-select UI
function createMultiSelectUI(categories) {
    // Create control container
    const controlContainer = document.createElement('div');
    controlContainer.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
    controlContainer.style.cssText = `
        position: absolute;
        top: 10px;
        left: 10px;
        background: white;
        padding: 10px;
        border-radius: 4px;
        box-shadow: 0 0 0 2px rgba(0,0,0,.1);
        width: 400px;
        z-index: 1;
    `;

    // Create title
    const title = document.createElement('h3');
    title.textContent = 'カテゴリー検索 (ネスト対応)';
    title.style.cssText = 'margin: 0 0 10px 0; font-size: 14px; color: #333;';
    controlContainer.appendChild(title);

    // Create selected chips container
    const chipsContainer = document.createElement('div');
    chipsContainer.id = 'chips-container';
    chipsContainer.style.cssText = `
        min-height: 32px;
        max-height: 150px;
        overflow-y: auto;
        margin-bottom: 10px;
        padding: 4px;
        background: #f8f9fa;
        border-radius: 4px;
        display: flex;
        flex-wrap: wrap;
        align-content: flex-start;
        border: 1px solid #e0e0e0;
    `;

    const placeholder = document.createElement('span');
    placeholder.textContent = 'カテゴリーを選択してください';
    placeholder.style.cssText = 'color: #999; font-size: 13px; padding: 4px 8px;';
    placeholder.id = 'chips-placeholder';
    chipsContainer.appendChild(placeholder);

    controlContainer.appendChild(chipsContainer);

    // Create search input wrapper
    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'search-input-wrapper';
    inputWrapper.style.cssText = 'position: relative;';

    // Create search input
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = '🔍 カテゴリーを検索またはクリックして階層表示';
    searchInput.id = 'category-search-input';
    searchInput.style.cssText = `
        width: 100%;
        padding: 10px;
        font-size: 14px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
        box-sizing: border-box;
    `;

    inputWrapper.appendChild(searchInput);

    // Create dropdown list
    const dropdownList = document.createElement('div');
    dropdownList.className = 'dropdown-list';
    dropdownList.id = 'category-dropdown-list';
    inputWrapper.appendChild(dropdownList);

    controlContainer.appendChild(inputWrapper);

    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = 'display: flex; gap: 10px; margin-top: 10px;';

    // Add search button
    const searchButton = document.createElement('button');
    searchButton.textContent = '現在地で検索';
    searchButton.id = 'search-button';
    searchButton.style.cssText = `
        flex: 1;
        padding: 10px;
        background: #4285f4;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.2s;
    `;
    searchButton.onclick = performSearch;
    buttonsContainer.appendChild(searchButton);

    controlContainer.appendChild(buttonsContainer);

    // Add status div
    const statusDiv = document.createElement('div');
    statusDiv.id = 'status';
    statusDiv.style.cssText = `
        margin-top: 10px;
        padding: 8px;
        background: #f5f5f5;
        border-radius: 4px;
        font-size: 12px;
        color: #666;
    `;
    statusDiv.textContent = `${categories.length}個のカテゴリーが利用可能`;
    controlContainer.appendChild(statusDiv);

    // Add results container
    const resultsDiv = document.createElement('div');
    resultsDiv.id = 'results';
    resultsDiv.style.cssText = `
        margin-top: 10px;
        max-height: 400px;
        overflow-y: auto;
    `;
    controlContainer.appendChild(resultsDiv);

    // Add to map
    document.getElementById('map').appendChild(controlContainer);

    // Set up event listeners
    setupEventListeners();
}

// Function to set up event listeners
function setupEventListeners() {
    const searchInput = document.getElementById('category-search-input');

    // Input event for filtering
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (query.length > 0) {
            filterCategories(query);
        } else {
            showNestedCategories();
        }
    });

    // Focus event to show dropdown
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.length > 0) {
            filterCategories(searchInput.value.toLowerCase());
        } else {
            showNestedCategories();
        }
    });

    // Click event to show all when empty
    searchInput.addEventListener('click', (e) => {
        if (searchInput.value.length === 0) {
            showNestedCategories();
            e.stopPropagation();
        }
    });

    // Keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideDropdown();
        }
    });

    // Click outside to close dropdown
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-input-wrapper') &&
            !e.target.closest('.dropdown-list') &&
            !e.target.closest('.group-header')) {
            hideDropdown();
        }
    });
}

// Function to render nested group recursively
function renderNestedGroup(node, path = [], level = 0) {
    const elements = [];
    const currentPath = [...path, node.name].filter(p => p !== 'root').join('>');

    // Render child groups first
    Object.entries(node.children).forEach(([name, childNode]) => {
        const childPath = [...path, node.name].filter(p => p !== 'root');
        childPath.push(name);
        const pathString = childPath.join('>');

        // Create group container
        const groupContainer = document.createElement('div');
        groupContainer.className = 'nested-group';
        groupContainer.style.marginLeft = `${level * 20}px`;

        // Create group header
        const header = document.createElement('div');
        header.className = `group-header level-${Math.min(level, 4)} ${expandedPaths.has(pathString) ? 'expanded' : ''}`;

        const hasSubGroups = Object.keys(childNode.children).length > 0;
        if (hasSubGroups) {
            header.classList.add('has-children');
        }

        const selectedInGroup = childNode.selected;
        const totalInGroup = childNode.count;

        header.innerHTML = `
            <div style="display: flex; align-items: center; flex: 1;">
                ${hasSubGroups || childNode.items.length > 0 ? '<span class="arrow">▶</span>' : '<span style="width: 14px;"></span>'}
                <input type="checkbox" class="group-checkbox"
                    ${selectedInGroup === totalInGroup && totalInGroup > 0 ? 'checked' : ''}
                    ${selectedInGroup > 0 && selectedInGroup < totalInGroup ? 'indeterminate' : ''}
                    onclick="toggleGroupSelection(event, '${pathString.replace(/'/g, "\\'")}')"
                />
                <strong>${name}</strong>
                ${level > 0 ? `<span class="category-path">${childPath.slice(0, -1).join(' > ')}</span>` : ''}
            </div>
            <span class="group-count">${selectedInGroup}/${totalInGroup}</span>
        `;

        // Set indeterminate state properly
        const checkbox = header.querySelector('.group-checkbox');
        if (checkbox && selectedInGroup > 0 && selectedInGroup < totalInGroup) {
            setTimeout(() => { checkbox.indeterminate = true; }, 0);
        }

        header.onclick = (e) => {
            if (!e.target.matches('.group-checkbox')) {
                togglePath(pathString);
            }
        };

        groupContainer.appendChild(header);

        // Create nested content container
        const contentContainer = document.createElement('div');
        contentContainer.className = `nested-content ${expandedPaths.has(pathString) ? 'expanded' : ''}`;

        // Render sub-groups recursively
        const subElements = renderNestedGroup(childNode, childPath, level + 1);
        subElements.forEach(el => contentContainer.appendChild(el));

        // Render items in this group
        childNode.items.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = `dropdown-item level-${Math.min(level + 1, 4)}`;

            const isSelected = selectedCategories.has(item.canonical_id);

            itemEl.innerHTML = `
                <input type="checkbox" ${isSelected ? 'checked' : ''} />
                <span style="${isSelected ? 'font-weight: 500;' : ''}">${item.displayName}</span>
                ${level > 0 ? `<span class="category-path">${item.pathArray.slice(0, -1).join(' > ')}</span>` : ''}
            `;

            itemEl.onclick = (e) => {
                e.stopPropagation();
                selectCategory(item);
            };

            contentContainer.appendChild(itemEl);
        });

        groupContainer.appendChild(contentContainer);
        elements.push(groupContainer);
    });

    // Render direct items (not in subgroups)
    node.items.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = `dropdown-item level-${Math.min(level, 4)}`;

        const isSelected = selectedCategories.has(item.canonical_id);

        itemEl.innerHTML = `
            <input type="checkbox" ${isSelected ? 'checked' : ''} />
            <span style="${isSelected ? 'font-weight: 500;' : ''}">${item.displayName}</span>
        `;

        itemEl.onclick = (e) => {
            e.stopPropagation();
            selectCategory(item);
        };

        elements.push(itemEl);
    });

    return elements;
}

// Function to show nested categories
function showNestedCategories() {
    const dropdownList = document.getElementById('category-dropdown-list');
    dropdownList.innerHTML = '';

    // Rebuild structure with current selections
    nestedCategories = buildNestedStructure(categories);

    // Add select all/none buttons
    const selectControls = document.createElement('div');
    selectControls.className = 'select-all-none';

    // Determine if there are any groups to expand/collapse
    const hasExpandableGroups = Object.keys(nestedCategories.children || {}).length > 0;
    const isExpanded = expandedPaths.size > 0;
    const hasSelection = selectedCategories.size > 0;

    selectControls.innerHTML = `
        <button onclick="toggleAllSelection(event)" title="${hasSelection ? '選択解除' : 'すべて選択'}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                ${hasSelection ? '' : '<polyline points="9 11 12 14 15 10"/>'}
            </svg>
        </button>
        ${hasExpandableGroups ? `
        <button onclick="toggleAllExpanded(event)" title="${isExpanded ? 'すべて折りたたむ' : 'すべて展開'}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                ${isExpanded ?
                    '<polyline points="7 14 12 9 17 14"/>' :
                    '<polyline points="7 10 12 15 17 10"/>'}
            </svg>
        </button>` : ''}
        <span style="margin-left: auto; color: #666;">
            ${selectedCategories.size} / ${categories.length} 選択中
        </span>
    `;
    dropdownList.appendChild(selectControls);

    // Render nested structure
    const elements = renderNestedGroup(nestedCategories);
    elements.forEach(el => dropdownList.appendChild(el));

    showDropdown();
}

// Function to toggle path expansion
function togglePath(path) {
    if (expandedPaths.has(path)) {
        expandedPaths.delete(path);
    } else {
        expandedPaths.add(path);
    }
    showNestedCategories();
}

// Function to toggle all expanded/collapsed
window.toggleAllExpanded = function(event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }

    if (expandedPaths.size > 0) {
        // Collapse all
        expandedPaths.clear();
    } else {
        // Expand all - find all paths that have children
        function findAllPaths(node, currentPath = '') {
            const paths = [];
            if (node.children && Object.keys(node.children).length > 0) {
                for (const [childName, childNode] of Object.entries(node.children)) {
                    const childPath = currentPath ? `${currentPath}>${childName}` : childName;
                    paths.push(childPath);
                    paths.push(...findAllPaths(childNode, childPath));
                }
            }
            return paths;
        }

        const allPaths = findAllPaths(nestedCategories);
        expandedPaths = new Set(allPaths);
    }
    showNestedCategories();
}

// Function to toggle group selection
window.toggleGroupSelection = function(event, path) {
    event.stopPropagation();

    // Find all categories under this path
    const pathPrefix = path + '>';
    const exactPath = path;

    const groupCategories = categories.filter(cat => {
        const name = cat.name || cat.canonical_id;
        return name === exactPath || name.startsWith(pathPrefix);
    });

    const allSelected = groupCategories.every(cat =>
        selectedCategories.has(cat.canonical_id)
    );

    groupCategories.forEach(category => {
        if (allSelected) {
            selectedCategories.delete(category.canonical_id);
        } else {
            selectedCategories.add(category.canonical_id);
        }
    });

    updateChipsDisplay();
    updateSearchButton();
    showNestedCategories();
};

// Function to toggle selection of all categories
window.toggleAllSelection = function(event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }

    if (selectedCategories.size > 0) {
        // Deselect all if any are selected
        selectedCategories.clear();
    } else {
        // Select all if none are selected
        categories.forEach(cat => {
            selectedCategories.add(cat.canonical_id);
        });
    }

    updateChipsDisplay();
    updateSearchButton();
    showNestedCategories();
};

// Function to filter categories
function filterCategories(query) {
    filteredCategories = categories.filter(cat =>
        (cat.name || cat.canonical_id).toLowerCase().includes(query)
    ).slice(0, 50); // Limit to 50 results for performance

    displayFilteredCategories();
}

// Function to display filtered categories
function displayFilteredCategories() {
    const dropdownList = document.getElementById('category-dropdown-list');
    dropdownList.innerHTML = '';

    if (filteredCategories.length === 0) {
        dropdownList.innerHTML = '<div style="padding: 10px; color: #999;">結果が見つかりません</div>';
    } else {
        filteredCategories.forEach((category, index) => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';

            const name = category.name || category.canonical_id;
            const isSelected = selectedCategories.has(category.canonical_id);

            item.innerHTML = `
                <input type="checkbox" ${isSelected ? 'checked' : ''} />
                <span style="${isSelected ? 'font-weight: 500;' : ''}">${name}</span>
            `;

            item.onclick = (e) => {
                e.stopPropagation();
                selectCategory(category);
            };

            dropdownList.appendChild(item);
        });
    }

    showDropdown();
}

// Function to select a category
function selectCategory(category) {
    const categoryId = category.canonical_id;

    if (selectedCategories.has(categoryId)) {
        selectedCategories.delete(categoryId);
    } else {
        selectedCategories.add(categoryId);
    }

    updateChipsDisplay();
    updateSearchButton();

    // Re-render current view
    const searchInput = document.getElementById('category-search-input');
    if (searchInput.value) {
        filterCategories(searchInput.value.toLowerCase());
    } else {
        showNestedCategories();
    }
}

// Function to update chips display
function updateChipsDisplay() {
    const container = document.getElementById('chips-container');
    const placeholder = document.getElementById('chips-placeholder');

    // Clear existing chips (except placeholder)
    container.querySelectorAll('.category-chip').forEach(chip => chip.remove());

    if (selectedCategories.size === 0) {
        placeholder.style.display = 'block';
    } else {
        placeholder.style.display = 'none';

        let colorIndex = 0;
        selectedCategories.forEach(categoryId => {
            const category = categories.find(c => c.canonical_id === categoryId);
            if (category) {
                const chip = createChip(category, colorIndex % categoryColors.length);
                container.insertBefore(chip, placeholder);
                colorIndex++;
            }
        });
    }

    updateStatus();
}

// Function to create a chip element
function createChip(category, colorIndex) {
    const chip = document.createElement('div');
    chip.className = 'category-chip';
    chip.dataset.categoryId = category.canonical_id;
    chip.dataset.colorIndex = colorIndex;

    const color = categoryColors[colorIndex];
    chip.style.borderColor = color;
    chip.style.backgroundColor = color + '20'; // 20% opacity
    chip.style.color = color;

    const name = category.name || category.canonical_id;
    chip.innerHTML = `
        ${name}
        <span class="remove-btn" onclick="removeCategory('${category.canonical_id}')">×</span>
    `;

    return chip;
}

// Function to remove a category
window.removeCategory = function(categoryId) {
    selectedCategories.delete(categoryId);
    updateChipsDisplay();
    updateSearchButton();

    // Update the dropdown if it's showing
    const searchInput = document.getElementById('category-search-input');
    if (dropdownVisible) {
        if (searchInput.value) {
            filterCategories(searchInput.value.toLowerCase());
        } else {
            showNestedCategories();
        }
    }
};

// Function to clear all selections
function clearAllSelections() {
    if (selectedCategories.size > 0 && confirm(`${selectedCategories.size}個の選択をクリアしますか？`)) {
        selectedCategories.clear();
        updateChipsDisplay();
        updateSearchButton();
        clearMarkers();
        document.getElementById('results').innerHTML = '';

        // Update dropdown if visible
        if (dropdownVisible) {
            showNestedCategories();
        }
    }
}

// Function to update search button
function updateSearchButton() {
    const button = document.getElementById('search-button');
    if (!button) return; // Exit if button doesn't exist yet

    if (selectedCategories.size === 0) {
        button.disabled = true;
        button.style.opacity = '0.5';
        button.style.cursor = 'not-allowed';
    } else {
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
    }
}

// Function to update status
function updateStatus() {
    const statusDiv = document.getElementById('status');
    if (selectedCategories.size > 0) {
        statusDiv.textContent = `${selectedCategories.size}個のカテゴリーを選択中`;
        statusDiv.style.background = '#e8f0fe';
        statusDiv.style.color = '#1967d2';
    } else {
        statusDiv.textContent = `${categories.length}個のカテゴリーが利用可能`;
        statusDiv.style.background = '#f5f5f5';
        statusDiv.style.color = '#666';
    }
}

// Function to show/hide dropdown
function showDropdown() {
    document.getElementById('category-dropdown-list').classList.add('visible');
    dropdownVisible = true;
}

function hideDropdown() {
    document.getElementById('category-dropdown-list').classList.remove('visible');
    dropdownVisible = false;
}

// Function to batch array into chunks
function batchArray(array, batchSize) {
    const batches = [];
    for (let i = 0; i < array.length; i += batchSize) {
        batches.push(array.slice(i, i + batchSize));
    }
    return batches;
}

// Function to perform search with multiple categories with rate limiting
async function performSearch() {
    if (selectedCategories.size === 0) return;

    try {
        createStatusMessage('検索中...', 'loading');
        clearMarkers();

        // Update center marker position
        updateCenterMarker();

        const center = map.getCenter();
        const bounds = map.getBounds();

        // Convert selected categories to array
        const selectedCategoryIds = Array.from(selectedCategories);

        // Batch categories into groups of 90 (rate limit)
        const BATCH_SIZE = 90;
        const batches = batchArray(selectedCategoryIds, BATCH_SIZE);

        console.log(`Searching ${selectedCategoryIds.length} categories in ${batches.length} batch(es)`);

        const allResults = [];

        // Process each batch
        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
            const batch = batches[batchIndex];

            // Update status for multi-batch searches
            if (batches.length > 1) {
                createStatusMessage(`検索中... (${batchIndex + 1}/${batches.length} バッチ)`, 'loading');
            }

            // Create promises for this batch
            const batchPromises = batch.map(async (categoryId, index) => {
                const globalIndex = batchIndex * BATCH_SIZE + index;

                try {
                    const response = await fetch(
                        `https://api.mapbox.com/search/searchbox/v1/category/${encodeURIComponent(categoryId)}?` +
                        `proximity=${center.lng},${center.lat}&` +
                        `bbox=${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}&` +
                        'language=ja&' +
                        'limit=10&' + // Limit per category to avoid too many results
                        `access_token=${mapboxgl.accessToken}`
                    );

                    if (!response.ok) {
                        console.error(`Failed to search category ${categoryId}: ${response.status}`);
                        return {
                            categoryId,
                            categoryName: categoryId,
                            colorIndex: globalIndex % categoryColors.length,
                            features: [],
                            error: `HTTP ${response.status}`
                        };
                    }

                    const data = await response.json();
                    const category = categories.find(c => c.canonical_id === categoryId);

                    return {
                        categoryId,
                        categoryName: category ? (category.name || category.canonical_id) : categoryId,
                        colorIndex: globalIndex % categoryColors.length,
                        features: data.features || []
                    };
                } catch (error) {
                    console.error(`Error searching category ${categoryId}:`, error);
                    return {
                        categoryId,
                        categoryName: categoryId,
                        colorIndex: globalIndex % categoryColors.length,
                        features: [],
                        error: error.message
                    };
                }
            });

            // Execute this batch in parallel
            const batchResults = await Promise.all(batchPromises);
            allResults.push(...batchResults);

            // If there are more batches, add a small delay to respect rate limits
            if (batchIndex < batches.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1100)); // Wait 1.1 seconds between batches
            }
        }

        // Filter out failed requests and process results
        const successfulResults = allResults.filter(r => !r.error);
        const failedCount = allResults.filter(r => r.error).length;

        if (failedCount > 0) {
            console.warn(`${failedCount} category searches failed`);
        }

        // Process and combine results
        processMultiCategoryResults(successfulResults);

    } catch (error) {
        console.error('Error searching places:', error);
        createStatusMessage('検索エラーが発生しました', 'error');
    }
}

// Function to process multi-category results
function processMultiCategoryResults(searchResults) {
    // Combine all results with category information
    const allResults = [];
    const resultsByCategory = {};

    searchResults.forEach(result => {
        resultsByCategory[result.categoryName] = result.features.length;

        result.features.forEach(feature => {
            // Add category metadata to each feature
            feature.categoryId = result.categoryId;
            feature.categoryName = result.categoryName;
            feature.colorIndex = result.colorIndex;
            allResults.push(feature);
        });
    });

    currentResults = allResults;

    // Display results
    displayMultiCategoryResults(allResults, resultsByCategory);
    addMultiCategoryMarkers(allResults);

    // Update status
    const totalResults = allResults.length;
    const categorySummary = Object.entries(resultsByCategory)
        .map(([name, count]) => `${name}: ${count}件`)
        .join(', ');

    createStatusMessage(`合計${totalResults}件の結果 (${categorySummary})`, 'success');
}

// Function to display multi-category results
function displayMultiCategoryResults(features, resultsByCategory) {
    const resultsDiv = document.getElementById('results');

    if (features.length === 0) {
        resultsDiv.innerHTML = '<p style="color: #999; margin: 10px 0;">結果が見つかりませんでした</p>';
        return;
    }

    // Show summary
    let html = '<div style="margin-bottom: 10px; padding: 8px; background: #f8f9fa; border-radius: 4px;">';
    html += '<strong>検索結果:</strong><br>';
    Object.entries(resultsByCategory).forEach(([name, count]) => {
        const category = categories.find(c => c.name === name || c.canonical_id === name);
        const categoryId = category ? category.canonical_id : name;
        const colorIndex = Array.from(selectedCategories).indexOf(categoryId) % categoryColors.length;
        const color = categoryColors[colorIndex];

        html += `<span style="display: inline-block; width: 12px; height: 12px; background: ${color}; border-radius: 50%; margin: 2px 4px;"></span>`;
        html += `<span style="font-size: 12px;">${name}: ${count}件</span><br>`;
    });
    html += '</div>';

    resultsDiv.innerHTML = html;

    // Display individual results
    features.forEach((feature, index) => {
        const properties = feature.properties || {};
        const coordinates = feature.geometry?.coordinates || [];
        const color = categoryColors[feature.colorIndex];

        const resultItem = document.createElement('div');
        resultItem.style.cssText = `
            padding: 10px;
            margin: 5px 0;
            background: #f9f9f9;
            border-radius: 4px;
            cursor: pointer;
            border-left: 3px solid ${color};
            transition: background 0.2s;
        `;

        resultItem.innerHTML = `
            <div style="display: flex; align-items: center;">
                <span style="display: inline-block; width: 24px; height: 24px; background: ${color}; color: white; border-radius: 50%; text-align: center; line-height: 24px; font-size: 11px; font-weight: bold; margin-right: 8px;">
                    ${index + 1}
                </span>
                <div style="flex: 1;">
                    <strong style="color: #333; font-size: 13px;">${properties.name || properties.place_name || '名称なし'}</strong>
                    <span style="background: ${color}20; color: ${color}; padding: 2px 6px; border-radius: 3px; font-size: 11px; margin-left: 8px;">
                        ${feature.categoryName}
                    </span>
                    ${properties.full_address ? `<div style="color: #666; font-size: 12px; margin-top: 4px;">📍 ${properties.full_address}</div>` : ''}
                </div>
            </div>
        `;

        resultItem.onmouseover = () => resultItem.style.background = '#e8f0fe';
        resultItem.onmouseout = () => resultItem.style.background = '#f9f9f9';

        resultItem.onclick = () => {
            if (coordinates.length === 2) {
                map.flyTo({
                    center: coordinates,
                    zoom: 16,
                    duration: 1000
                });

                // Open popup for this marker
                if (markers[index]) {
                    markers[index].togglePopup();
                }
            }
        };

        resultsDiv.appendChild(resultItem);
    });
}

// Function to add multi-category markers to map
function addMultiCategoryMarkers(features) {
    features.forEach((feature, index) => {
        const coordinates = feature.geometry?.coordinates;
        const properties = feature.properties || {};
        const color = categoryColors[feature.colorIndex];

        if (!coordinates || coordinates.length !== 2) return;

        // Create custom marker element
        const markerElement = document.createElement('div');
        markerElement.style.cssText = `
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background-color: ${color};
            border: 2px solid white;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 12px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            cursor: pointer;
        `;
        markerElement.textContent = (index + 1).toString();

        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
                <div style="padding: 5px;">
                    <strong>${properties.name || properties.place_name || '名称なし'}</strong>
                    <div style="background: ${color}20; color: ${color}; padding: 2px 6px; border-radius: 3px; font-size: 11px; margin-top: 4px;">
                        ${feature.categoryName}
                    </div>
                    ${properties.full_address ? `<p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">${properties.full_address}</p>` : ''}
                </div>
            `);

        // Create marker
        const marker = new mapboxgl.Marker(markerElement)
            .setLngLat(coordinates)
            .setPopup(popup)
            .addTo(map);

        markers.push(marker);
    });

    // Fit map to show all markers if there are results
    if (features.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        features.forEach(feature => {
            if (feature.geometry?.coordinates) {
                bounds.extend(feature.geometry.coordinates);
            }
        });

        map.fitBounds(bounds, {
            padding: { top: 50, bottom: 50, left: 450, right: 50 },
            maxZoom: 15
        });
    }
}

// Function to clear all markers
function clearMarkers() {
    markers.forEach(marker => marker.remove());
    markers = [];
}

// Function to create status messages
function createStatusMessage(message, type = 'info') {
    const statusDiv = document.getElementById('status');
    if (!statusDiv) return;

    statusDiv.textContent = message;

    switch(type) {
        case 'error':
            statusDiv.style.background = '#fee';
            statusDiv.style.color = '#c00';
            break;
        case 'success':
            statusDiv.style.background = '#efe';
            statusDiv.style.color = '#060';
            break;
        case 'loading':
            statusDiv.style.background = '#fff4e5';
            statusDiv.style.color = '#f57c00';
            break;
        default:
            statusDiv.style.background = '#f5f5f5';
            statusDiv.style.color = '#666';
    }
}

// Initialize on map load
map.on('load', () => {
    fetchCategories();

    // Show center marker on load
    updateCenterMarker();

    // Update center marker when map moves
    map.on('moveend', () => {
        updateCenterMarker();
    });
});