// Mapbox Feedback API Demo
// Note: This demo requires an access token with 'user-feedback:read' and 'user-feedback:write' scopes

// Map instance
let map;

// Token validation status
let tokenHasReadScope = false;
let tokenHasWriteScope = false;

// Get the feedback API token (separate from map token)
function getFeedbackToken() {
  // Check if feedbackApiToken is defined in the parent scope (from feedback.md)
  if (typeof feedbackApiToken !== 'undefined' && feedbackApiToken) {
    return feedbackApiToken;
  }
  // Fall back to localStorage
  return localStorage.getItem('mapbox_feedback_token') || null;
}

// Validate token scopes by making test API calls
async function validateTokenScopes() {
  const token = getFeedbackToken();

  if (!token) {
    const tokenStatus = document.getElementById('tokenStatus');
    if (tokenStatus) {
      tokenStatus.textContent = 'No Token';
      tokenStatus.style.background = '#555';
    }
    return { read: false, write: false };
  }

  // Test read scope
  try {
    const readTest = await fetch(`https://api.mapbox.com/user-feedback/v1/feedback?access_token=${token}&limit=1`);
    tokenHasReadScope = readTest.ok;

    if (!readTest.ok && (readTest.status === 401 || readTest.status === 403)) {
      console.log('Token does not have user-feedback:read scope');
    }
  } catch (error) {
    tokenHasReadScope = false;
  }

  // Update UI based on scope validation
  const tokenStatus = document.getElementById('tokenStatus');
  if (tokenStatus) {
    if (tokenHasReadScope) {
      tokenStatus.textContent = 'Valid ✓';
      tokenStatus.style.background = '#4caf50';
    } else if (token) {
      tokenStatus.textContent = 'Invalid Scopes';
      tokenStatus.style.background = '#f44336';
    }
  }

  return { read: tokenHasReadScope, write: tokenHasWriteScope };
}

// Current selected location for feedback submission
let selectedLocation = null;

// Store feedback items for current page only
let feedbackItems = [];

// Pagination state
let currentPageCursor = null;
let cursorHistory = [null]; // Store cursor history for going back
let currentPageIndex = 0;
let hasNextPage = false;
let hasPreviousPage = false;

// Initialize the map
function initMap() {
  map = new mapboxgl.Map({
    container: 'map',
    //style: 'mapbox://styles/mapbox/dark-v11',
    center: [139.7671, 35.6812], // Tokyo
    zoom: 12,
    pitch: 45,
    bearing: 0,
    language: 'ja'
  });

  map.on('load', () => {
    // Add source and layer for feedback markers
    map.addSource('feedback-points', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });

    map.addLayer({
      id: 'feedback-markers',
      type: 'circle',
      source: 'feedback-points',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          10, 4,
          15, 8,
          18, 12
        ],
        'circle-color': [
          'match',
          ['get', 'status'],
          'received', '#ffa500',
          'fixed', '#00cc66',
          'reviewed', '#3b82f6',
          'out_of_scope', '#888',
          '#667eea' // default
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
        'circle-opacity': 0.8
      }
    });

    // Add click handler for feedback markers
    map.on('click', 'feedback-markers', (e) => {
      const feature = e.features[0];
      const properties = feature.properties;

      const popupContent = `
        <div class="popup-header">${properties.place_name || 'Feedback'}</div>
        <div class="popup-category">${properties.category}</div>
        <div class="popup-text">${properties.feedback}</div>
        <div class="popup-meta">
          <div>Status: <strong>${properties.status}</strong></div>
          <div>ID: ${properties.id}</div>
          <div>Created: ${new Date(properties.created_at).toLocaleDateString()}</div>
        </div>
      `;

      new mapboxgl.Popup()
        .setLngLat(feature.geometry.coordinates)
        .setHTML(popupContent)
        .addTo(map);

      // Fly to the marker
      map.flyTo({
        center: feature.geometry.coordinates,
        zoom: 16,
        pitch: 60,
        bearing: -20,
        duration: 2000
      });
    });

    // Change cursor on hover
    map.on('mouseenter', 'feedback-markers', () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'feedback-markers', () => {
      map.getCanvas().style.cursor = '';
    });

    // Add marker for selected location (submission)
    map.addSource('selected-location', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    });

    map.addLayer({
      id: 'selected-marker',
      type: 'circle',
      source: 'selected-location',
      paint: {
        'circle-radius': 12,
        'circle-color': '#667eea',
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff'
      }
    });

    updateStatus('Map loaded - Ready to view feedback');
  });

  // Click handler for selecting location
  map.on('click', (e) => {
    // Only handle clicks on the map (not on markers)
    const features = map.queryRenderedFeatures(e.point, {
      layers: ['feedback-markers']
    });

    if (features.length === 0) {
      handleMapClick(e);
    }
  });
}

// Handle map click for location selection
async function handleMapClick(e) {
  selectedLocation = {
    lng: e.lngLat.lng,
    lat: e.lngLat.lat
  };

  // Update the selected location marker
  if (map.loaded() && map.getSource('selected-location')) {
    map.getSource('selected-location').setData({
      type: 'FeatureCollection',
      features: [{
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [selectedLocation.lng, selectedLocation.lat]
      }
    }]
    });
  }

  // Fly to the selected location
  map.flyTo({
    center: [selectedLocation.lng, selectedLocation.lat],
    zoom: 16
  });

  // Reverse geocode to get place name
  try {
    const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${selectedLocation.lng},${selectedLocation.lat}.json?access_token=${mapboxgl.accessToken}`;
    const response = await fetch(geocodeUrl);
    const data = await response.json();

    const placeName = data.features[0]?.place_name || `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`;
    document.getElementById('locationInput').value = placeName;

    updateStatus(`Location selected: ${placeName}`);
  } catch (error) {
    console.error('Geocoding error:', error);
    document.getElementById('locationInput').value = `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`;
    updateStatus('Location selected');
  }
}

// Submit feedback
async function submitFeedback(feedbackData) {
  const token = getFeedbackToken();

  if (!token) {
    throw new Error('No feedback API token configured. Please enter a token with user-feedback:write scope.');
  }

  const url = `https://api.mapbox.com/user-feedback/v1/feedback?access_token=${token}`;

  const requestBody = {
    feedback: feedbackData.feedback,
    lat: feedbackData.latitude,
    lon: feedbackData.longitude,
    source: 'mapbox_gljs_demo',
    category: feedbackData.category,
    metadata: {
      submitted_via: 'Mapbox GL JS Demo',
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent
    },
    feature: {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [feedbackData.longitude, feedbackData.latitude]
      },
      properties: {
        category: feedbackData.category
      }
    }
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    // Add user-friendly error message
    if (error.message.includes('401') || error.message.includes('403')) {
      throw new Error('Authentication failed. Please ensure your access token has "user-feedback:write" scope. You can create a token with the required scopes at: https://account.mapbox.com/access-tokens');
    }
    throw error;
  }
}

// Fetch feedback items with pagination support
async function fetchFeedbackItems(options = {}) {
  const {
    limit = 100, // Use provided limit or default to 100
    after = null,
    sortBy = 'created_at',
    order = 'desc',
    status = null,
    category = null
  } = options;

  const token = getFeedbackToken();

  // If no token is configured, return empty results
  if (!token) {
    console.log('No feedback API token configured');
    const statusEl = document.getElementById('statusText');
    if (statusEl) {
      statusEl.textContent = 'Please configure a Feedback API token to view feedback items';
      statusEl.style.color = '#ffa500';
    }
    return {
      items: [],
      has_after: false,
      has_before: false,
      end_cursor: null,
      start_cursor: null
    };
  }

  // Build query parameters
  const params = new URLSearchParams({
    access_token: token,
    limit: limit.toString(),
    sort_by: sortBy,
    order: order
  });

  if (after) {
    params.append('after', after);
  }

  if (status && Array.isArray(status)) {
    status.forEach(s => params.append('status', s));
  }

  if (category && Array.isArray(category)) {
    category.forEach(c => params.append('category', c));
  }

  const url = `https://api.mapbox.com/user-feedback/v1/feedback?${params.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      // If API call fails (e.g., missing scopes), return empty results
      if (response.status === 401 || response.status === 403) {
        console.warn('API requires user-feedback:read scope');
        console.warn('To use real data, ensure your access token has the "user-feedback:read" scope');

        // Show warning in UI
        const statusEl = document.getElementById('statusText');
        if (statusEl) {
          statusEl.textContent = 'Token needs user-feedback:read scope to view feedback';
          statusEl.style.color = '#ff5252';
        }
      } else {
        console.warn(`API error (${response.status})`);
        const statusEl = document.getElementById('statusText');
        if (statusEl) {
          statusEl.textContent = `API error: ${response.status}`;
          statusEl.style.color = '#ff5252';
        }
      }
      return {
        items: [],
        has_after: false,
        has_before: false,
        end_cursor: null,
        start_cursor: null
      };
    }

    const data = await response.json();
    console.log('Fetched feedback items:', data.items?.length || 0, 'has_after:', data.has_after);

    return {
      items: data.items || [],
      has_after: data.has_after || false,
      has_before: data.has_before || false,
      end_cursor: data.end_cursor || null,
      start_cursor: data.start_cursor || null
    };
  } catch (error) {
    console.error('Error fetching feedback items:', error);
    const statusEl = document.getElementById('statusText');
    if (statusEl) {
      statusEl.textContent = 'Error loading feedback items';
      statusEl.style.color = '#ff5252';
    }
    return {
      items: [],
      has_after: false,
      has_before: false,
      end_cursor: null,
      start_cursor: null
    };
  }
}

// Display feedback items in the list
function displayFeedbackItems(items, paginationInfo = {}) {
  feedbackItems = items;
  const listContainer = document.getElementById('feedbackList');

  if (items.length === 0) {
    const token = getFeedbackToken();
    if (!token) {
      listContainer.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">🔑</div>
          <div class="no-results-text">No token configured</div>
          <p style="font-size: 14px; color: #888; margin-top: 10px;">
            Please enter a Feedback API token with<br>
            <code style="background: #444; padding: 2px 4px; border-radius: 2px;">user-feedback:read</code> scope
          </p>
        </div>
      `;
    } else {
      listContainer.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">📍</div>
          <div class="no-results-text">No feedback items found</div>
        </div>
      `;
    }
    return;
  }

  listContainer.innerHTML = items.map((item, index) => {
    // Build properties HTML
    let propertiesHtml = '';
    if (item.properties && item.properties.length > 0) {
      propertiesHtml = item.properties.map(prop => {
        if (prop.link) {
          return `<div style="margin: 2px 0;"><strong>${prop.name}:</strong> <a href="${prop.link}" target="_blank" style="color: #8bb3ff;">${prop.value}</a></div>`;
        } else {
          return `<div style="margin: 2px 0;"><strong>${prop.name}:</strong> ${prop.value}</div>`;
        }
      }).join('');
    }

    return `
      <div class="feedback-item" onclick="selectFeedbackItem(${index})">
        <div class="feedback-header">
          <span class="feedback-status ${item.status}">${item.status}</span>
          <span style="color: #aaa; font-size: 11px; margin-left: 8px;">${item.category.replace(/_/g, ' ')}</span>
        </div>

        <div style="border-top: 1px solid #444; margin: 8px 0; padding-top: 8px;">
          <div style="color: #8bb3ff; font-size: 11px; margin-bottom: 4px;">ITEM ID</div>
          <div style="color: white; font-family: monospace; font-size: 12px; word-break: break-all;">${item.id}</div>
        </div>

        ${item.trace_id ? `
        <div style="margin-top: 8px;">
          <div style="color: #8bb3ff; font-size: 11px; margin-bottom: 4px;">TRACE ID</div>
          <div style="color: #ccc; font-family: monospace; font-size: 11px; word-break: break-all;">${item.trace_id}</div>
        </div>` : ''}

        <div style="margin-top: 8px;">
          <div style="color: #8bb3ff; font-size: 11px; margin-bottom: 4px;">FEEDBACK</div>
          <div style="color: white; font-size: 13px;">${item.feedback || '(No feedback text provided)'}</div>
        </div>

        <div style="margin-top: 8px;">
          <div style="color: #8bb3ff; font-size: 11px; margin-bottom: 4px;">LOCATION</div>
          <div style="color: #ccc; font-size: 12px;">
            <div>📍 ${item.location?.place_name || 'Unknown location'}</div>
            <div style="color: #888; font-family: monospace; font-size: 11px; margin-top: 2px;">
              Lat: ${item.location?.lat?.toFixed(6) || 'N/A'}, Lon: ${item.location?.lon?.toFixed(6) || 'N/A'}
            </div>
          </div>
        </div>

        <div style="margin-top: 8px;">
          <div style="color: #8bb3ff; font-size: 11px; margin-bottom: 4px;">TIMESTAMPS</div>
          <div style="color: #999; font-size: 11px; line-height: 1.5;">
            <div><strong>Created:</strong> ${new Date(item.created_at).toISOString()}</div>
            <div><strong>Updated:</strong> ${new Date(item.updated_at).toISOString()}</div>
            <div><strong>Received:</strong> ${new Date(item.received_at).toISOString()}</div>
          </div>
        </div>

        ${propertiesHtml ? `
        <div style="margin-top: 8px;">
          <div style="color: #8bb3ff; font-size: 11px; margin-bottom: 4px;">PROPERTIES</div>
          <div style="color: #ccc; font-size: 11px;">
            ${propertiesHtml}
          </div>
        </div>` : ''}
      </div>
    `;
  }).join('');

  // Update map with feedback markers
  const features = items.map(item => ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [item.location?.lon || 0, item.location?.lat || 0]
    },
    properties: {
      id: item.id,
      status: item.status,
      category: item.category,
      feedback: item.feedback || '',
      place_name: item.location?.place_name || 'Unknown location',
      created_at: item.created_at,
      updated_at: item.updated_at,
      trace_id: item.trace_id || null
    }
  }));

  // Only update the source if map is loaded and source exists
  if (map.loaded() && map.getSource('feedback-points')) {
    map.getSource('feedback-points').setData({
      type: 'FeatureCollection',
      features: features
    });
  }

  // If all items are in Beijing, fly to Beijing
  if (items.length > 0 && items[0].location?.place_name?.includes('Beijing')) {
    map.flyTo({
      center: [116.4, 39.9], // Beijing coordinates
      zoom: 10
    });
  }

  const pageText = paginationInfo.current_page ? `Page ${paginationInfo.current_page}` : '';
  const statusText = `Showing ${items.length} items ${pageText}`;

  updateStatus(statusText);
  document.getElementById('statusCount').textContent = `${items.length} items`;
}

// Select a feedback item
function selectFeedbackItem(index) {
  const item = feedbackItems[index];

  // Fly to the location
  map.flyTo({
    center: [item.location.lon, item.location.lat],
    zoom: 17,
    pitch: 60,
    bearing: -20,
    duration: 2000
  });

  // Build properties HTML for popup
  let propertiesHtml = '';
  if (item.properties && item.properties.length > 0) {
    propertiesHtml = item.properties.map(prop => {
      if (prop.link) {
        return `<div><strong>${prop.name}:</strong> <a href="${prop.link}" target="_blank" style="color: #8bb3ff;">${prop.value}</a></div>`;
      } else {
        return `<div><strong>${prop.name}:</strong> ${prop.value}</div>`;
      }
    }).join('');
  }

  // Show popup with ALL fields
  const popupContent = `
    <div class="popup-header">${item.location.place_name}</div>
    <div class="popup-category">${item.category.replace(/_/g, ' ')} • ${item.status}</div>
    <div class="popup-text">${item.feedback || '(No feedback text provided)'}</div>
    <div class="popup-meta">
      <div><strong>ID:</strong> ${item.id}</div>
      ${item.trace_id ? `<div><strong>Trace ID:</strong> ${item.trace_id}</div>` : ''}
      <div><strong>Location:</strong> ${item.location.lat.toFixed(6)}, ${item.location.lon.toFixed(6)}</div>
      <div><strong>Created:</strong> ${new Date(item.created_at).toISOString()}</div>
      <div><strong>Updated:</strong> ${new Date(item.updated_at).toISOString()}</div>
      <div><strong>Received:</strong> ${new Date(item.received_at).toISOString()}</div>
      ${propertiesHtml ? `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #555;">${propertiesHtml}</div>` : ''}
    </div>
  `;

  new mapboxgl.Popup()
    .setLngLat([item.location.lon, item.location.lat])
    .setHTML(popupContent)
    .addTo(map);
}

// Load a single page of feedback items
async function loadFeedbackPage(cursor = null, direction = 'next') {
  try {
    updateStatus('Loading feedback items...');

    const result = await fetchFeedbackItems({
      limit: 100,
      after: cursor
    });

    if (result.items.length > 0) {
      // Store current page items (replace, don't append)
      feedbackItems = result.items;

      // Update pagination state
      hasNextPage = result.has_after;
      currentPageCursor = result.end_cursor;

      // Update cursor history for navigation
      if (direction === 'next') {
        currentPageIndex++;
        // Only add to history if we're moving forward to a new page
        if (cursorHistory.length === currentPageIndex) {
          cursorHistory.push(currentPageCursor);
        }
      }

      hasPreviousPage = currentPageIndex > 0;

      console.log(`Loaded page ${currentPageIndex + 1}: ${result.items.length} items`);

      // Display current page items
      displayFeedbackItems(feedbackItems, {
        has_after: hasNextPage,
        has_before: hasPreviousPage,
        current_page: currentPageIndex + 1
      });

      // Update pagination controls
      updatePaginationControls();
    } else {
      displayFeedbackItems([], {});
    }

  } catch (error) {
    console.error('Error loading feedback page:', error);
    showAlert('Failed to load feedback items', 'error');
  }
}

// Navigate to next page
async function loadNextPage() {
  if (hasNextPage) {
    await loadFeedbackPage(currentPageCursor, 'next');
  }
}

// Navigate to previous page
async function loadPreviousPage() {
  if (hasPreviousPage && currentPageIndex > 0) {
    currentPageIndex -= 2; // Go back two positions
    const cursor = cursorHistory[currentPageIndex] || null;
    await loadFeedbackPage(cursor, 'next');
  }
}

// Load initial feedback items (first page)
async function loadFeedbackItems(options = {}) {
  // Reset pagination state
  currentPageIndex = 0;
  cursorHistory = [null];
  currentPageCursor = null;

  await loadFeedbackPage(null, 'next');
}

// Update pagination control buttons
function updatePaginationControls() {
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');
  const pageInfo = document.getElementById('pageInfo');

  if (prevBtn) {
    prevBtn.disabled = !hasPreviousPage;
    prevBtn.style.opacity = hasPreviousPage ? '1' : '0.5';
  }

  if (nextBtn) {
    nextBtn.disabled = !hasNextPage;
    nextBtn.style.opacity = hasNextPage ? '1' : '0.5';
  }

  if (pageInfo) {
    pageInfo.textContent = `Page ${currentPageIndex + 1}`;
  }
}

// Show alert message
function showAlert(message, type = 'info') {
  const alertContainer = document.getElementById('alertContainer');
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.textContent = message;

  alertContainer.innerHTML = '';
  alertContainer.appendChild(alertDiv);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

// Update status bar
function updateStatus(text) {
  document.getElementById('statusText').textContent = text;
}

// Form submission handler
document.addEventListener('DOMContentLoaded', () => {
  // Validate token scopes on load
  validateTokenScopes();

  const form = document.getElementById('feedbackForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!selectedLocation) {
      showAlert('Please select a location on the map first', 'error');
      return;
    }

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    const feedbackData = {
      feedback: document.getElementById('feedbackText').value,
      category: document.getElementById('categorySelect').value,
      latitude: selectedLocation.lat,
      longitude: selectedLocation.lng
    };

    try {
      // Make real API call to submit feedback
      console.log('Submitting feedback:', feedbackData);
      updateStatus('Submitting feedback to API...');

      const result = await submitFeedback(feedbackData);

      console.log('Feedback submitted successfully:', result);
      showAlert('Feedback submitted successfully!', 'success');
      updateStatus(`Feedback submitted - ID: ${result.id || 'success'}`);

      // Reset form
      form.reset();
      selectedLocation = null;
      if (map.loaded() && map.getSource('selected-location')) {
        map.getSource('selected-location').setData({
          type: 'FeatureCollection',
          features: []
        });
      }

      // Refresh the feedback list to include the newly submitted item
      setTimeout(() => {
        loadFeedbackItems();
      }, 1000);

    } catch (error) {
      console.error('Submission error:', error);

      // Check if it's an authentication error
      if (error.message.includes('401') || error.message.includes('403')) {
        showAlert('Failed to submit feedback. Access token requires "user-feedback:write" scope.', 'error');
      } else {
        showAlert(`Failed to submit feedback: ${error.message}`, 'error');
      }

      updateStatus('Submission failed');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Feedback';
    }
  });
});

// Initialize the map when the script loads
initMap();

// Load initial feedback items
loadFeedbackItems();

// Make functions available globally
window.switchTab = switchTab;
window.selectFeedbackItem = selectFeedbackItem;
window.loadNextPage = loadNextPage;
window.loadPreviousPage = loadPreviousPage;
