// Mapbox Feedback API - Data Table Implementation with Grid.js

// Global variables
let gridInstance = null;
let mapInstance = null;
let currentFeedbackItems = [];
let currentPageCursor = null;
let cursorHistory = [null];
let currentPageIndex = 0;
let hasNextPage = false;
let hasPreviousPage = false;
let selectedItem = null;

// Column configuration
let columnConfig = {
  status: { name: 'Status', visible: true, order: 0 },
  category: { name: 'Category', visible: true, order: 1 },
  feedback: { name: 'Feedback', visible: true, order: 2 },
  location: { name: 'Location', visible: true, order: 3 },
  created: { name: 'Created', visible: true, order: 4 },
  id: { name: 'ID', visible: true, order: 5 },
  received: { name: 'Received', visible: false, order: 6 },
  updated: { name: 'Updated', visible: false, order: 7 },
  trace_id: { name: 'Trace ID', visible: false, order: 8 },
  actions: { name: 'Actions', visible: true, order: 9, locked: true }
};

// Comparison mode variables
let comparisonMode = false;
let selectedForComparison = [];

// Load saved column settings from localStorage
function loadColumnSettings() {
  const saved = localStorage.getItem('feedback_column_settings');
  if (saved) {
    try {
      const settings = JSON.parse(saved);
      // Merge saved settings with defaults to handle new columns
      Object.keys(settings).forEach(key => {
        if (columnConfig[key]) {
          columnConfig[key] = { ...columnConfig[key], ...settings[key] };
        }
      });
    } catch (e) {
      console.error('Failed to load column settings:', e);
    }
  }
}

// Save column settings to localStorage
function saveColumnSettings() {
  localStorage.setItem('feedback_column_settings', JSON.stringify(columnConfig));
}

// Get feedback API token
function getFeedbackToken() {
  if (typeof feedbackApiToken !== 'undefined' && feedbackApiToken) {
    return feedbackApiToken;
  }
  return localStorage.getItem('mapbox_feedback_token') || null;
}

// Initialize the persistent map instance (hidden by default)
function initializeMap() {
  // Only initialize once
  if (mapInstance) return;

  mapInstance = new mapboxgl.Map({
    container: 'mapContainer',
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [0, 0],
    zoom: 2
  });

  // Add navigation controls
  mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

  // Add marker source
  mapInstance.on('load', () => {
    mapInstance.addSource('selected-location', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });

    mapInstance.addLayer({
      id: 'selected-marker',
      type: 'circle',
      source: 'selected-location',
      paint: {
        'circle-radius': 10,
        'circle-color': '#667eea',
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff'
      }
    });
  });

  console.log('Map initialized (hidden, reusable instance)');
}

// Show map drawer for a specific item
function showLocationOnMap(item) {
  selectedItem = item;

  // Open drawer
  const drawer = document.getElementById('mapDrawer');
  const tableContainer = document.getElementById('tableContainer');
  drawer.classList.add('open');
  tableContainer.classList.add('drawer-open');

  // Fly to location
  if (mapInstance && item.location) {
    const coords = [item.location.lon, item.location.lat];

    // Update marker
    mapInstance.getSource('selected-location')?.setData({
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: coords
        }
      }]
    });

    // Fly to location
    mapInstance.flyTo({
      center: coords,
      zoom: 14,
      essential: true
    });

    // Add popup
    new mapboxgl.Popup()
      .setLngLat(coords)
      .setHTML(`
        <div style="color: #000; padding: 5px;">
          <strong>${item.location.place_name || 'Location'}</strong><br>
          <small>${item.category} • ${item.status}</small>
        </div>
      `)
      .addTo(mapInstance);
  }

  // Update drawer details
  updateDrawerDetails(item);
}

// Update drawer details panel
function updateDrawerDetails(item) {
  const details = document.getElementById('drawerDetails');

  // Build properties HTML
  let propertiesHtml = '';
  if (item.properties && item.properties.length > 0) {
    propertiesHtml = item.properties.map(prop => {
      const value = prop.link
        ? `<a href="${prop.link}" target="_blank" style="color: #8bb3ff;">${prop.value}</a>`
        : prop.value;
      return `
        <div class="detail-row">
          <div class="detail-label">${prop.name}:</div>
          <div class="detail-value">${value}</div>
        </div>
      `;
    }).join('');
  }

  details.innerHTML = `
    <div class="detail-row">
      <div class="detail-label">ID:</div>
      <div class="detail-value">${item.id}</div>
    </div>
    ${item.trace_id ? `
    <div class="detail-row">
      <div class="detail-label">Trace ID:</div>
      <div class="detail-value">${item.trace_id}</div>
    </div>` : ''}
    <div class="detail-row">
      <div class="detail-label">Coordinates:</div>
      <div class="detail-value">${item.location?.lat?.toFixed(6)}, ${item.location?.lon?.toFixed(6)}</div>
    </div>
    <div class="detail-row">
      <div class="detail-label">Created:</div>
      <div class="detail-value">${new Date(item.created_at).toISOString()}</div>
    </div>
    ${item.received_at ? `
    <div class="detail-row">
      <div class="detail-label">Received:</div>
      <div class="detail-value">${new Date(item.received_at).toISOString()}</div>
    </div>` : ''}
    ${propertiesHtml}
  `;
}

// Close map drawer
function closeDrawer() {
  const drawer = document.getElementById('mapDrawer');
  const tableContainer = document.getElementById('tableContainer');
  drawer.classList.remove('open');
  tableContainer.classList.remove('drawer-open');
}

// Format date for display (renamed to avoid conflict)
function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Copy text to clipboard
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    // Could add a toast notification here
    console.log('Copied:', text);
  });
}

// Initialize Grid.js table with column configuration
function initializeTable(data) {
  // Destroy existing instance if any
  if (gridInstance) {
    gridInstance.destroy();
    gridInstance = null;
  }

  // Clear the container
  const container = document.getElementById('dataTable');
  if (container) {
    container.innerHTML = '';
  }

  // Build columns based on configuration
  const sortedColumns = Object.entries(columnConfig)
    .filter(([key, config]) => config.visible)
    .sort((a, b) => a[1].order - b[1].order);

  const columns = [];
  const dataMap = [];

  // Add selection column if in comparison mode
  if (comparisonMode) {
    columns.unshift({
      name: '',
      width: '40px',
      sort: false,
      formatter: (_, row) => {
        const item = row.cells[row.cells.length - 1].data;
        const isChecked = selectedForComparison.some(s => s.id === item.id);
        return gridjs.html(
          `<input type="checkbox"
                  class="compare-checkbox"
                  ${isChecked ? 'checked' : ''}
                  onchange="toggleItemSelection('${item.id}')">`
        );
      }
    });
    dataMap.push(item => item);
  }

  sortedColumns.forEach(([key, config]) => {
    switch(key) {
      case 'status':
        columns.push({
          name: config.name,
          formatter: (cell) => gridjs.html(`<span class="status-badge ${cell}">${cell}</span>`)
        });
        dataMap.push(item => item.status);
        break;

      case 'category':
        columns.push({
          name: config.name,
          formatter: (cell) => gridjs.html(`<span class="category-chip">${cell.replace(/_/g, ' ')}</span>`)
        });
        dataMap.push(item => item.category);
        break;

      case 'feedback':
        columns.push({
          name: config.name,
          formatter: (cell) => {
            const truncated = cell && cell.length > 50 ? cell.substring(0, 50) + '...' : cell;
            return gridjs.html(`<span title="${gridjs.h(cell || '')}">${truncated || '<em style="color:#666">No feedback text</em>'}</span>`);
          }
        });
        dataMap.push(item => item.feedback || '');
        break;

      case 'location':
        columns.push({
          name: config.name,
          formatter: (cell) => gridjs.html(`<span class="location-cell">${cell}</span>`)
        });
        dataMap.push(item => item.location?.place_name || 'Unknown');
        break;

      case 'created':
        columns.push({
          name: config.name,
          formatter: (cell) => formatDateTime(cell),
          sort: true
        });
        dataMap.push(item => item.created_at);
        break;

      case 'received':
        columns.push({
          name: config.name,
          formatter: (cell) => cell ? formatDateTime(cell) : '-',
          sort: true
        });
        dataMap.push(item => item.received_at);
        break;

      case 'updated':
        columns.push({
          name: config.name,
          formatter: (cell) => cell ? formatDateTime(cell) : '-',
          sort: true
        });
        dataMap.push(item => item.updated_at);
        break;

      case 'id':
        columns.push({
          name: config.name,
          formatter: (cell) => gridjs.html(
            `<span class="id-cell" onclick="copyToClipboard('${cell}')" title="Click to copy">
              ${cell.substring(0, 8)}...
            </span>`
          )
        });
        dataMap.push(item => item.id);
        break;

      case 'trace_id':
        columns.push({
          name: config.name,
          formatter: (cell) => cell ? gridjs.html(
            `<span class="id-cell" onclick="copyToClipboard('${cell}')" title="Click to copy">
              ${cell.substring(0, 8)}...
            </span>`
          ) : '-'
        });
        dataMap.push(item => item.trace_id);
        break;

      case 'actions':
        columns.push({
          name: config.name,
          sort: false,
          formatter: (_, row) => {
            const itemIndex = row.cells.findIndex((cell, idx) => columns[idx].name === 'Actions');
            const item = row.cells[itemIndex].data;
            return gridjs.html(
              `<button class="view-btn" onclick='showLocationOnMap(${JSON.stringify(item).replace(/'/g, "&apos;")})'>
                📍 View
              </button>`
            );
          }
        });
        dataMap.push(item => item); // Store full item for actions
        break;
    }
  });

  // Map data according to visible columns
  const tableData = data.map(item => {
    return dataMap.map(mapper => mapper(item));
  });

  // Create new Grid.js instance
  gridInstance = new gridjs.Grid({
    data: tableData,
    columns: columns,
    sort: true,
    search: false, // We'll use our own search
    pagination: false, // We handle pagination ourselves
    className: {
      table: 'gridjs-table',
      thead: 'gridjs-thead',
      tbody: 'gridjs-tbody',
      tr: 'gridjs-tr',
      th: 'gridjs-th',
      td: 'gridjs-td'
    }
  });

  gridInstance.render(document.getElementById('dataTable'));
}

// Fetch feedback items from API with comprehensive filtering
async function fetchFeedbackPage(cursor = null, filters = {}) {
  const token = getFeedbackToken();

  if (!token) {
    console.log('No feedback API token configured');
    return {
      items: [],
      has_after: false,
      has_before: false,
      end_cursor: null
    };
  }

  const params = new URLSearchParams({
    access_token: token,
    limit: '100',
    sort_by: 'created_at',
    order: 'desc'
  });

  if (cursor) {
    params.append('after', cursor);
  }

  // Add filter parameters from UI
  if (filters.search) {
    params.append('search', filters.search);
  }

  if (filters.feedback_id && filters.feedback_id.length > 0) {
    filters.feedback_id.forEach(id => params.append('feedback_id', id));
  }

  if (filters.trace_id && filters.trace_id.length > 0) {
    filters.trace_id.forEach(id => params.append('trace_id', id));
  }

  if (filters.status && filters.status.length > 0) {
    filters.status.forEach(s => params.append('status', s));
  }

  if (filters.category && filters.category.length > 0) {
    filters.category.forEach(c => params.append('category', c));
  }

  // Date filters
  if (filters.created_after) {
    params.append('created_after', filters.created_after);
  }
  if (filters.created_before) {
    params.append('created_before', filters.created_before);
  }

  if (filters.received_after) {
    params.append('received_after', filters.received_after);
  }
  if (filters.received_before) {
    params.append('received_before', filters.received_before);
  }

  if (filters.updated_after) {
    params.append('updated_after', filters.updated_after);
  }
  if (filters.updated_before) {
    params.append('updated_before', filters.updated_before);
  }

  console.log('API Request with filters:', params.toString());

  try {
    const response = await fetch(`https://api.mapbox.com/user-feedback/v1/feedback?${params}`);

    if (!response.ok) {
      console.error('API Error:', response.status);
      return {
        items: [],
        has_after: false,
        has_before: false
      };
    }

    const data = await response.json();
    console.log(`Fetched ${data.items?.length || 0} items`);

    return {
      items: data.items || [],
      has_after: data.has_after || false,
      has_before: data.has_before || false,
      end_cursor: data.end_cursor || null
    };
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return {
      items: [],
      has_after: false,
      has_before: false
    };
  }
}

// Get current filter values from UI
function getCurrentFilters() {
  const filters = {};

  // Search text
  const search = document.getElementById('searchBox')?.value.trim();
  if (search) filters.search = search;

  // Status (multi-select)
  const statusSelect = document.getElementById('statusFilter');
  if (statusSelect) {
    const selected = Array.from(statusSelect.selectedOptions).map(opt => opt.value);
    if (selected.length > 0) filters.status = selected;
  }

  // Category (multi-select)
  const categorySelect = document.getElementById('categoryFilter');
  if (categorySelect) {
    const selected = Array.from(categorySelect.selectedOptions).map(opt => opt.value);
    if (selected.length > 0) filters.category = selected;
  }

  // Feedback IDs (comma-separated)
  const feedbackIds = document.getElementById('feedbackIdFilter')?.value.trim();
  if (feedbackIds) {
    filters.feedback_id = feedbackIds.split(',').map(id => id.trim()).filter(id => id);
  }

  // Trace IDs (comma-separated)
  const traceIds = document.getElementById('traceIdFilter')?.value.trim();
  if (traceIds) {
    filters.trace_id = traceIds.split(',').map(id => id.trim()).filter(id => id);
  }

  // Date filters
  const createdAfter = document.getElementById('createdAfter')?.value;
  if (createdAfter) filters.created_after = new Date(createdAfter).toISOString();

  const createdBefore = document.getElementById('createdBefore')?.value;
  if (createdBefore) filters.created_before = new Date(createdBefore).toISOString();

  const receivedAfter = document.getElementById('receivedAfter')?.value;
  if (receivedAfter) filters.received_after = new Date(receivedAfter).toISOString();

  const receivedBefore = document.getElementById('receivedBefore')?.value;
  if (receivedBefore) filters.received_before = new Date(receivedBefore).toISOString();

  const updatedAfter = document.getElementById('updatedAfter')?.value;
  if (updatedAfter) filters.updated_after = new Date(updatedAfter).toISOString();

  const updatedBefore = document.getElementById('updatedBefore')?.value;
  if (updatedBefore) filters.updated_before = new Date(updatedBefore).toISOString();

  return filters;
}

// Load feedback data with filters
async function loadFeedbackData(cursor = null, direction = 'next') {
  // Show loading state
  document.getElementById('dataTable').innerHTML = '<div class="loading"><div class="spinner"></div>Loading feedback data...</div>';

  // Get current filters
  const filters = getCurrentFilters();

  const result = await fetchFeedbackPage(cursor, filters);

  if (result.items.length > 0) {
    currentFeedbackItems = result.items;

    // Update pagination state
    hasNextPage = result.has_after;
    currentPageCursor = result.end_cursor;

    if (direction === 'next') {
      currentPageIndex++;
      if (cursorHistory.length === currentPageIndex) {
        cursorHistory.push(currentPageCursor);
      }
    }

    hasPreviousPage = currentPageIndex > 0;

    // Initialize/update table
    initializeTable(currentFeedbackItems);

    // Update pagination controls
    updatePaginationControls();

    // Update result count
    const resultCount = document.getElementById('resultCount');
    if (resultCount) {
      const filters = getCurrentFilters();
      const filterCount = Object.keys(filters).length;
      if (filterCount > 0) {
        resultCount.textContent = `${currentFeedbackItems.length} items (filtered)`;
      } else {
        resultCount.textContent = `${currentFeedbackItems.length} items`;
      }
    }

    // Clear filter status
    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) {
      filterStatus.textContent = '';
    }
  } else {
    document.getElementById('dataTable').innerHTML = '<div class="loading">No feedback items found</div>';
  }
}

// Pagination controls
function loadNext() {
  if (hasNextPage) {
    loadFeedbackData(currentPageCursor, 'next');
  }
}

function loadPrevious() {
  if (hasPreviousPage && currentPageIndex > 0) {
    currentPageIndex -= 2;
    const cursor = cursorHistory[currentPageIndex] || null;
    loadFeedbackData(cursor, 'next');
  }
}

function updatePaginationControls() {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const pageInfo = document.getElementById('pageInfo');
  const itemsInfo = document.getElementById('itemsInfo');

  prevBtn.disabled = !hasPreviousPage;
  nextBtn.disabled = !hasNextPage;

  pageInfo.textContent = `Page ${currentPageIndex + 1}`;
  itemsInfo.textContent = `${currentFeedbackItems.length} items`;
}

// Export functions
function exportData(format) {
  if (!currentFeedbackItems.length) {
    alert('No data to export');
    return;
  }

  if (format === 'json') {
    const blob = new Blob([JSON.stringify(currentFeedbackItems, null, 2)], {
      type: 'application/json'
    });
    downloadBlob(blob, `feedback-${Date.now()}.json`);
  } else if (format === 'csv') {
    const csv = convertToCSV(currentFeedbackItems);
    const blob = new Blob([csv], { type: 'text/csv' });
    downloadBlob(blob, `feedback-${Date.now()}.csv`);
  }
}

function convertToCSV(items) {
  const headers = ['ID', 'Status', 'Category', 'Feedback', 'Location', 'Latitude', 'Longitude', 'Created', 'Updated', 'Received'];
  const rows = items.map(item => [
    item.id,
    item.status,
    item.category,
    `"${(item.feedback || '').replace(/"/g, '""')}"`,
    `"${(item.location?.place_name || '').replace(/"/g, '""')}"`,
    item.location?.lat || '',
    item.location?.lon || '',
    item.created_at,
    item.updated_at,
    item.received_at
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Search and filter
document.addEventListener('DOMContentLoaded', () => {
  // Load saved column settings
  loadColumnSettings();

  // Initialize map (hidden)
  initializeMap();

  // Load initial data
  loadFeedbackData();

  // Setup Enter key to apply filters
  const searchBox = document.getElementById('searchBox');
  searchBox?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  });

  // Also allow Enter key on ID filter fields
  document.getElementById('feedbackIdFilter')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  });

  document.getElementById('traceIdFilter')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      // Close any open modal/drawer
      if (document.getElementById('comparisonModal').classList.contains('active')) {
        closeComparisonView();
      } else if (document.getElementById('columnSettingsModal').classList.contains('active')) {
        hideColumnSettings();
      } else {
        closeDrawer();
      }
    }
    if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      e.preventDefault();
      searchBox?.focus();
    }
    // Ctrl+C or Cmd+C to toggle comparison mode
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      e.preventDefault();
      toggleCompareMode();
    }
  });
});

// Apply filters - triggers new API call with filters
function applyFilters() {
  // Reset pagination when applying new filters
  currentPageIndex = 0;
  cursorHistory = [null];
  currentPageCursor = null;

  // Update status text
  const filterStatus = document.getElementById('filterStatus');
  if (filterStatus) {
    filterStatus.textContent = 'Applying filters...';
  }

  // Load data with new filters
  loadFeedbackData(null, 'next');
}

// Clear all filters
function clearFilters() {
  // Clear all filter inputs
  document.getElementById('searchBox').value = '';
  document.getElementById('feedbackIdFilter').value = '';
  document.getElementById('traceIdFilter').value = '';

  // Clear multi-selects
  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) {
    Array.from(statusFilter.options).forEach(opt => opt.selected = false);
  }

  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    Array.from(categoryFilter.options).forEach(opt => opt.selected = false);
  }

  // Clear date inputs
  document.getElementById('createdAfter').value = '';
  document.getElementById('createdBefore').value = '';
  document.getElementById('receivedAfter').value = '';
  document.getElementById('receivedBefore').value = '';
  document.getElementById('updatedAfter').value = '';
  document.getElementById('updatedBefore').value = '';

  // Reset and reload
  currentPageIndex = 0;
  cursorHistory = [null];
  currentPageCursor = null;

  loadFeedbackData(null, 'next');
}

// Column Settings Functions
function showColumnSettings() {
  const modal = document.getElementById('columnSettingsModal');
  const list = document.getElementById('columnList');

  // Clear existing list
  list.innerHTML = '';

  // Sort columns by order
  const sortedColumns = Object.entries(columnConfig)
    .sort((a, b) => a[1].order - b[1].order);

  // Create list items
  sortedColumns.forEach(([key, config]) => {
    const li = document.createElement('li');
    li.className = 'column-item';
    li.dataset.columnKey = key;
    li.draggable = !config.locked;

    li.innerHTML = `
      <input type="checkbox"
             class="column-checkbox"
             ${config.visible ? 'checked' : ''}
             ${config.locked ? 'disabled' : ''}
             data-column="${key}">
      <span class="column-name">${config.name}</span>
      ${!config.locked ? '<span class="column-drag-handle">⋮⋮</span>' : ''}
    `;

    list.appendChild(li);
  });

  // Setup drag and drop
  setupColumnDragDrop();

  // Show modal
  modal.classList.add('active');
}

function hideColumnSettings() {
  const modal = document.getElementById('columnSettingsModal');
  modal.classList.remove('active');
}

function applyColumnSettings() {
  const list = document.getElementById('columnList');
  const items = list.querySelectorAll('.column-item');

  // Update configuration from UI
  items.forEach((item, index) => {
    const key = item.dataset.columnKey;
    const checkbox = item.querySelector('.column-checkbox');

    if (columnConfig[key]) {
      columnConfig[key].order = index;
      columnConfig[key].visible = checkbox.checked;
    }
  });

  // Save settings
  saveColumnSettings();

  // Refresh table with new configuration
  initializeTable(currentFeedbackItems);

  // Hide modal
  hideColumnSettings();
}

function resetColumnSettings() {
  // Reset to defaults
  columnConfig = {
    status: { name: 'Status', visible: true, order: 0 },
    category: { name: 'Category', visible: true, order: 1 },
    feedback: { name: 'Feedback', visible: true, order: 2 },
    location: { name: 'Location', visible: true, order: 3 },
    created: { name: 'Created', visible: true, order: 4 },
    id: { name: 'ID', visible: true, order: 5 },
    received: { name: 'Received', visible: false, order: 6 },
    updated: { name: 'Updated', visible: false, order: 7 },
    trace_id: { name: 'Trace ID', visible: false, order: 8 },
    actions: { name: 'Actions', visible: true, order: 9, locked: true }
  };

  // Save and refresh
  saveColumnSettings();
  showColumnSettings(); // Refresh the modal display
}

function applyColumnPreset(preset) {
  switch(preset) {
    case 'minimal':
      // Show only essential columns
      Object.keys(columnConfig).forEach(key => {
        columnConfig[key].visible = ['status', 'category', 'feedback', 'actions'].includes(key);
      });
      break;

    case 'detailed':
      // Show all columns
      Object.keys(columnConfig).forEach(key => {
        columnConfig[key].visible = true;
      });
      break;
  }

  // Save and refresh
  saveColumnSettings();
  showColumnSettings(); // Refresh the modal display
}

function setupColumnDragDrop() {
  const list = document.getElementById('columnList');
  let draggedElement = null;

  list.querySelectorAll('.column-item').forEach(item => {
    if (!item.draggable) return;

    item.addEventListener('dragstart', (e) => {
      draggedElement = e.target;
      e.target.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    item.addEventListener('dragend', (e) => {
      e.target.classList.remove('dragging');
    });

    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(list, e.clientY);
      if (afterElement == null) {
        list.appendChild(draggedElement);
      } else {
        list.insertBefore(draggedElement, afterElement);
      }
    });
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.column-item:not(.dragging)')];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;

    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Comparison Mode Functions
function toggleCompareMode() {
  if (comparisonMode && selectedForComparison.length >= 2) {
    // Show comparison view
    showComparisonView();
  } else {
    // Toggle comparison mode
    comparisonMode = !comparisonMode;

    if (!comparisonMode) {
      // Clear selection when exiting comparison mode
      selectedForComparison = [];
      document.getElementById('compareBtn').style.display = 'none';
    } else {
      // Show compare button
      document.getElementById('compareBtn').style.display = 'block';
    }

    // Refresh table to show/hide checkboxes
    initializeTable(currentFeedbackItems);
    updateCompareButton();
  }
}

function toggleItemSelection(itemId) {
  const item = currentFeedbackItems.find(i => i.id === itemId);

  if (!item) return;

  const existingIndex = selectedForComparison.findIndex(s => s.id === itemId);

  if (existingIndex >= 0) {
    // Remove from selection
    selectedForComparison.splice(existingIndex, 1);
  } else {
    // Add to selection (max 4 items for comparison)
    if (selectedForComparison.length < 4) {
      selectedForComparison.push(item);
    } else {
      alert('Maximum 4 items can be compared at once');
      return;
    }
  }

  updateCompareButton();
}

function updateCompareButton() {
  const count = selectedForComparison.length;
  const compareBtn = document.getElementById('compareBtn');
  const compareCount = document.getElementById('compareCount');

  if (compareCount) {
    compareCount.textContent = count;
  }

  if (compareBtn) {
    if (count >= 2) {
      compareBtn.style.background = '#667eea';
      compareBtn.textContent = `🔍 Compare (${count})`;
    } else {
      compareBtn.style.background = '#444';
      compareBtn.textContent = `🔍 Select items (${count})`;
    }
  }
}

function showComparisonView() {
  if (selectedForComparison.length < 2) {
    alert('Please select at least 2 items to compare');
    return;
  }

  const modal = document.getElementById('comparisonModal');
  const body = document.getElementById('comparisonBody');

  // Clear existing content
  body.innerHTML = '';

  // Create comparison columns for each selected item
  selectedForComparison.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'comparison-item';

    // Build comparison content
    const fields = [
      { label: 'Status', value: item.status },
      { label: 'Category', value: item.category },
      { label: 'Feedback Text', value: item.feedback || 'No feedback text' },
      { label: 'Location', value: item.location?.place_name || 'Unknown' },
      { label: 'Coordinates', value: item.location ? `${item.location.lat.toFixed(6)}, ${item.location.lon.toFixed(6)}` : 'N/A' },
      { label: 'Created At', value: formatDateTime(item.created_at) },
      { label: 'Received At', value: item.received_at ? formatDateTime(item.received_at) : 'N/A' },
      { label: 'Updated At', value: item.updated_at ? formatDateTime(item.updated_at) : 'N/A' },
      { label: 'Trace ID', value: item.trace_id || 'N/A' }
    ];

    // Add properties if they exist
    if (item.properties && item.properties.length > 0) {
      item.properties.forEach(prop => {
        fields.push({ label: prop.name, value: prop.value });
      });
    }

    itemDiv.innerHTML = `
      <div class="comparison-item-header">
        <div class="comparison-item-title">${item.id.substring(0, 12)}...</div>
        <div class="comparison-item-subtitle">${item.status} • ${item.category}</div>
      </div>
      <div class="comparison-item-body">
        ${fields.map(field => {
          // Check if this field value differs from others
          const isDifferent = checkIfFieldDiffers(field.label, field.value);
          const isEmpty = field.value === 'N/A' || !field.value;

          return `
            <div class="comparison-field">
              <div class="comparison-field-label">${field.label}</div>
              <div class="comparison-field-value ${isDifferent ? 'different' : ''} ${isEmpty ? 'empty' : ''}">
                ${field.value}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    body.appendChild(itemDiv);
  });

  // Show modal
  modal.classList.add('active');
}

function checkIfFieldDiffers(fieldLabel, fieldValue) {
  // Get all values for this field across selected items
  const values = selectedForComparison.map(item => {
    switch(fieldLabel) {
      case 'Status': return item.status;
      case 'Category': return item.category;
      case 'Feedback Text': return item.feedback || 'No feedback text';
      case 'Location': return item.location?.place_name || 'Unknown';
      case 'Coordinates': return item.location ? `${item.location.lat.toFixed(6)}, ${item.location.lon.toFixed(6)}` : 'N/A';
      case 'Created At': return formatDateTime(item.created_at);
      case 'Received At': return item.received_at ? formatDateTime(item.received_at) : 'N/A';
      case 'Updated At': return item.updated_at ? formatDateTime(item.updated_at) : 'N/A';
      case 'Trace ID': return item.trace_id || 'N/A';
      default:
        // Check properties
        const prop = item.properties?.find(p => p.name === fieldLabel);
        return prop ? prop.value : 'N/A';
    }
  });

  // Check if not all values are the same
  return !values.every(v => v === values[0]);
}

function closeComparisonView() {
  const modal = document.getElementById('comparisonModal');
  modal.classList.remove('active');
}

function exportComparison() {
  if (selectedForComparison.length < 2) {
    alert('No items to export');
    return;
  }

  // Create comparison data structure
  const comparisonData = {
    timestamp: new Date().toISOString(),
    itemCount: selectedForComparison.length,
    items: selectedForComparison.map(item => ({
      id: item.id,
      status: item.status,
      category: item.category,
      feedback: item.feedback,
      location: item.location,
      created_at: item.created_at,
      received_at: item.received_at,
      updated_at: item.updated_at,
      trace_id: item.trace_id,
      properties: item.properties
    }))
  };

  // Export as JSON
  const blob = new Blob([JSON.stringify(comparisonData, null, 2)], {
    type: 'application/json'
  });
  downloadBlob(blob, `feedback-comparison-${Date.now()}.json`);
}

// Help Modal Functions
function showKeyboardHelp() {
  const modal = document.getElementById('keyboardHelpModal');
  modal.classList.add('active');
}

function hideKeyboardHelp() {
  const modal = document.getElementById('keyboardHelpModal');
  modal.classList.remove('active');
}

// Make functions globally available
window.showLocationOnMap = showLocationOnMap;
window.closeDrawer = closeDrawer;
window.copyToClipboard = copyToClipboard;
window.loadNext = loadNext;
window.loadPrevious = loadPrevious;
window.exportData = exportData;
window.loadFeedbackData = loadFeedbackData;
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.showColumnSettings = showColumnSettings;
window.hideColumnSettings = hideColumnSettings;
window.applyColumnSettings = applyColumnSettings;
window.resetColumnSettings = resetColumnSettings;
window.applyColumnPreset = applyColumnPreset;
window.toggleCompareMode = toggleCompareMode;
window.toggleItemSelection = toggleItemSelection;
window.closeComparisonView = closeComparisonView;
window.exportComparison = exportComparison;
window.showKeyboardHelp = showKeyboardHelp;
window.hideKeyboardHelp = hideKeyboardHelp;