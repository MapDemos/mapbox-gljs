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

// Initialize Grid.js table
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

  // Create new Grid.js instance
  gridInstance = new gridjs.Grid({
    data: data.map(item => [
      item.status,
      item.category,
      item.feedback || '',
      item.location?.place_name || 'Unknown',
      item.created_at,
      item.id,
      item
    ]),
    columns: [
      {
        name: 'Status',
        formatter: (cell) => gridjs.html(`<span class="status-badge ${cell}">${cell}</span>`)
      },
      {
        name: 'Category',
        formatter: (cell) => gridjs.html(`<span class="category-chip">${cell.replace(/_/g, ' ')}</span>`)
      },
      {
        name: 'Feedback',
        formatter: (cell) => {
          const truncated = cell.length > 50 ? cell.substring(0, 50) + '...' : cell;
          return gridjs.html(`<span title="${gridjs.h(cell)}">${truncated || '<em style="color:#666">No feedback text</em>'}</span>`);
        }
      },
      {
        name: 'Location',
        formatter: (cell) => gridjs.html(`<span class="location-cell">${cell}</span>`)
      },
      {
        name: 'Created',
        formatter: (cell) => formatDateTime(cell),
        sort: true
      },
      {
        name: 'ID',
        formatter: (cell) => gridjs.html(
          `<span class="id-cell" onclick="copyToClipboard('${cell}')" title="Click to copy">
            ${cell.substring(0, 8)}...
          </span>`
        )
      },
      {
        name: 'Actions',
        sort: false,
        formatter: (_, row) => {
          const item = row.cells[6].data; // Get the full item object
          return gridjs.html(
            `<button class="view-btn" onclick='showLocationOnMap(${JSON.stringify(item).replace(/'/g, "&apos;")})'>
              📍 View
            </button>`
          );
        }
      }
    ],
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

// Fetch feedback items from API
async function fetchFeedbackPage(cursor = null) {
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

// Load feedback data
async function loadFeedbackData(cursor = null, direction = 'next') {
  // Show loading state
  document.getElementById('dataTable').innerHTML = '<div class="loading"><div class="spinner"></div>Loading feedback data...</div>';

  const result = await fetchFeedbackPage(cursor);

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
  // Initialize map (hidden)
  initializeMap();

  // Load initial data
  loadFeedbackData();

  // Setup search
  const searchBox = document.getElementById('searchBox');
  let searchTimeout;
  searchBox?.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const searchTerm = e.target.value.toLowerCase();
      if (gridInstance) {
        // Filter the current data
        const filteredData = currentFeedbackItems.filter(item => {
          return JSON.stringify(item).toLowerCase().includes(searchTerm);
        });
        initializeTable(filteredData);
      }
    }, 300);
  });

  // Setup filter chips
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      const filter = e.target.dataset.filter;
      const value = e.target.dataset.value;

      // Toggle active state
      e.target.classList.toggle('active');

      // Get all active filters
      const activeFilters = {};
      document.querySelectorAll('.filter-chip.active').forEach(activeChip => {
        const f = activeChip.dataset.filter;
        const v = activeChip.dataset.value;
        if (!activeFilters[f]) activeFilters[f] = [];
        activeFilters[f].push(v);
      });

      // Apply filters
      let filteredData = currentFeedbackItems;
      if (activeFilters.status) {
        filteredData = filteredData.filter(item =>
          activeFilters.status.includes(item.status)
        );
      }

      initializeTable(filteredData);
    });
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDrawer();
    }
    if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
      e.preventDefault();
      searchBox?.focus();
    }
  });
});

// Make functions globally available
window.showLocationOnMap = showLocationOnMap;
window.closeDrawer = closeDrawer;
window.copyToClipboard = copyToClipboard;
window.loadNext = loadNext;
window.loadPrevious = loadPrevious;
window.exportData = exportData;
window.loadFeedbackData = loadFeedbackData;