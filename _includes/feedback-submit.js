// Feedback Submission Implementation

// Global variables
let map = null;
let marker = null;
let selectedLocation = null;
let locationMethod = 'map';
let properties = [];

// Initialize map
function initializeMap() {
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [-74.0060, 40.7128], // Default to NYC
    zoom: 12
  });

  // Add navigation controls
  map.addControl(new mapboxgl.NavigationControl(), 'top-right');

  // Add geolocate control
  const geolocateControl = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: false,
    showUserHeading: false
  });
  map.addControl(geolocateControl, 'top-right');

  // Handle map clicks
  map.on('click', (e) => {
    if (locationMethod === 'map') {
      setLocationFromMap(e.lngLat);
    }
  });

  // Add search control
  map.addControl(
    new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: false,
      placeholder: 'Search for a location...'
    }),
    'top-left'
  );

  // Listen for geocoder results
  map.on('moveend', () => {
    // Update view when map moves
  });
}

// Set location from map click
function setLocationFromMap(lngLat) {
  selectedLocation = {
    lon: lngLat.lng,
    lat: lngLat.lat
  };

  // Remove existing marker
  if (marker) {
    marker.remove();
  }

  // Add new marker
  marker = new mapboxgl.Marker({
    color: '#667eea',
    draggable: true
  })
    .setLngLat([lngLat.lng, lngLat.lat])
    .addTo(map);

  // Handle marker drag
  marker.on('dragend', () => {
    const lngLat = marker.getLngLat();
    selectedLocation = {
      lon: lngLat.lng,
      lat: lngLat.lat
    };
    updateLocationDisplay();
  });

  updateLocationDisplay();
  clearLocationError();
}

// Update location display
function updateLocationDisplay() {
  const display = document.getElementById('locationDisplay');

  if (selectedLocation) {
    display.textContent = `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lon.toFixed(6)}`;
    display.className = 'location-display';

    // Reverse geocode to get place name
    reverseGeocode(selectedLocation);
  } else {
    display.textContent = 'No location selected - Click on the map or enter coordinates';
    display.className = 'location-display empty';
  }
}

// Reverse geocode coordinates
async function reverseGeocode(location) {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${location.lon},${location.lat}.json?access_token=${mapboxgl.accessToken}`
    );

    if (response.ok) {
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const place = data.features[0];
        selectedLocation.place_name = place.place_name;

        const display = document.getElementById('locationDisplay');
        display.innerHTML = `
          <div>
            <div style="color: #64b5f6; margin-bottom: 4px;">${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lon.toFixed(6)}</div>
            <div style="color: #999; font-size: 11px; font-family: inherit;">${place.place_name}</div>
          </div>
        `;
      }
    }
  } catch (error) {
    console.error('Reverse geocoding error:', error);
  }
}

// Set location method
function setLocationMethod(method) {
  locationMethod = method;

  // Update button states
  document.getElementById('mapMethodBtn').classList.toggle('active', method === 'map');
  document.getElementById('coordsMethodBtn').classList.toggle('active', method === 'coords');

  // Show/hide coordinate inputs
  document.getElementById('coordsInput').style.display = method === 'coords' ? 'block' : 'none';

  if (method === 'coords') {
    // Pre-fill with current location if available
    if (selectedLocation) {
      document.getElementById('latInput').value = selectedLocation.lat;
      document.getElementById('lngInput').value = selectedLocation.lon;
    }
  }
}

// Apply manually entered coordinates
function applyCoordinates() {
  const lat = parseFloat(document.getElementById('latInput').value);
  const lng = parseFloat(document.getElementById('lngInput').value);

  if (isNaN(lat) || isNaN(lng)) {
    showError('locationError', 'Please enter valid coordinates');
    return;
  }

  if (lat < -90 || lat > 90) {
    showError('locationError', 'Latitude must be between -90 and 90');
    return;
  }

  if (lng < -180 || lng > 180) {
    showError('locationError', 'Longitude must be between -180 and 180');
    return;
  }

  selectedLocation = { lat, lon: lng };

  // Update map
  map.flyTo({
    center: [lng, lat],
    zoom: 14
  });

  // Add marker
  setLocationFromMap({ lng, lat });
}

// Get current location
function getCurrentLocation() {
  if (!navigator.geolocation) {
    showError('locationError', 'Geolocation is not supported by your browser');
    return;
  }

  // Update button to show loading
  const btn = document.getElementById('currentMethodBtn');
  const originalText = btn.textContent;
  btn.textContent = '⏳ Getting...';
  btn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      selectedLocation = {
        lat: latitude,
        lon: longitude
      };

      // Update map
      map.flyTo({
        center: [longitude, latitude],
        zoom: 14
      });

      // Add marker
      setLocationFromMap({ lng: longitude, lat: latitude });

      // Reset button
      btn.textContent = originalText;
      btn.disabled = false;
    },
    (error) => {
      let message = 'Unable to get location';
      switch(error.code) {
        case error.PERMISSION_DENIED:
          message = 'Location permission denied';
          break;
        case error.POSITION_UNAVAILABLE:
          message = 'Location information unavailable';
          break;
        case error.TIMEOUT:
          message = 'Location request timed out';
          break;
      }

      showError('locationError', message);

      // Reset button
      btn.textContent = originalText;
      btn.disabled = false;
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
}

// Add property field
function addProperty() {
  const container = document.getElementById('propertiesContainer');
  const propertyId = Date.now();

  const propertyDiv = document.createElement('div');
  propertyDiv.className = 'property-item';
  propertyDiv.dataset.propertyId = propertyId;

  propertyDiv.innerHTML = `
    <input type="text"
           class="property-name"
           placeholder="Property name"
           data-property-id="${propertyId}">
    <input type="text"
           class="property-value"
           placeholder="Property value"
           data-property-id="${propertyId}">
    <button type="button"
            class="btn-remove-property"
            onclick="removeProperty(${propertyId})">
      ✕
    </button>
  `;

  container.appendChild(propertyDiv);
}

// Remove property field
function removeProperty(propertyId) {
  const propertyDiv = document.querySelector(`[data-property-id="${propertyId}"]`).parentElement;
  propertyDiv.remove();
}

// Validate token
async function validateToken() {
  const token = document.getElementById('apiToken').value.trim();

  if (!token) {
    updateTokenStatus(false);
    return;
  }

  try {
    // Test the token with a simple API call
    const response = await fetch(
      `https://api.mapbox.com/user-feedback/v1/feedback?limit=1&access_token=${token}`
    );

    if (response.ok) {
      localStorage.setItem('mapbox_feedback_token', token);
      updateTokenStatus(true);
      showSuccess('Token validated successfully');
    } else {
      let errorMsg = 'Invalid token or insufficient permissions';

      try {
        const error = await response.json();
        if (error.message) {
          errorMsg = error.message;
        }
      } catch (e) {
        // If response isn't JSON
      }

      updateTokenStatus(false);
      showError('errorMessage', errorMsg);

      // Provide helpful message about token requirements
      if (response.status === 401 || response.status === 403) {
        console.log('Token validation failed. Ensure your token has the "feedback:write" scope.');
      }
    }
  } catch (error) {
    updateTokenStatus(false);
    showError('errorMessage', 'Failed to validate token');
  }
}

// Form submission
document.getElementById('feedbackForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  // Clear previous messages
  hideAlerts();

  // Validate form
  let isValid = true;

  // Check token
  const token = document.getElementById('apiToken').value.trim();
  if (!token) {
    showError('errorMessage', 'Please enter your API token');
    return;
  }

  // Get category (making it optional for testing)
  const category = document.getElementById('category').value;

  // Check location
  if (!selectedLocation) {
    showError('locationError', 'Please select a location');
    isValid = false;
  }

  if (!isValid) {
    return;
  }

  // Prepare feedback data
  const feedbackData = {
    lat: selectedLocation.lat,  // Top-level field (not nested)
    lon: selectedLocation.lon   // Top-level field (not nested)
  };

  // Add category only if selected (testing if it's optional)
  if (category) {
    feedbackData.category = category;
  }

  // Add optional feedback text
  const feedbackText = document.getElementById('feedbackText').value.trim();
  if (feedbackText) {
    feedbackData.feedback = feedbackText;
  }

  // Add place name if available (as top-level field)
  if (selectedLocation.place_name) {
    feedbackData.place_name = selectedLocation.place_name;
  }

  // Add properties
  const propertyItems = document.querySelectorAll('.property-item');
  if (propertyItems.length > 0) {
    const properties = [];

    propertyItems.forEach(item => {
      const name = item.querySelector('.property-name').value.trim();
      const value = item.querySelector('.property-value').value.trim();

      if (name && value) {
        properties.push({ name, value });
      }
    });

    if (properties.length > 0) {
      feedbackData.properties = properties;
    }
  }

  // Show loading state
  const submitBtn = document.getElementById('submitBtn');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<span class="spinner"></span>Submitting...';
  submitBtn.disabled = true;

  // Log the data being sent (for debugging)
  console.log('Submitting feedback data:', JSON.stringify(feedbackData, null, 2));

  try {
    // Submit feedback
    const response = await fetch(
      `https://api.mapbox.com/user-feedback/v1/feedback?access_token=${token}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedbackData)
      }
    );

    if (response.ok) {
      const result = await response.json();

      // Show success message
      document.getElementById('feedbackId').textContent = result.id;
      document.getElementById('successAlert').classList.add('show');

      // Reset form after delay
      setTimeout(() => {
        resetForm();
        document.getElementById('successAlert').classList.remove('show');
      }, 5000);
    } else {
      let errorMessage = 'Failed to submit feedback';

      try {
        const error = await response.json();
        console.log('API Error Response:', error); // Log for debugging

        // Handle different error formats from API
        if (error.message) {
          errorMessage = error.message;
        } else if (error.error) {
          errorMessage = error.error;
        } else if (error.errors && Array.isArray(error.errors)) {
          errorMessage = error.errors.map(e => e.message || e).join(', ');
        }

        // Add status code for clarity
        errorMessage = `${errorMessage} (${response.status})`;
      } catch (e) {
        // If response isn't JSON
        errorMessage = `Request failed with status ${response.status}`;
      }

      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Submission error:', error);
    document.getElementById('errorMessage').textContent = error.message || 'Failed to submit feedback. Please try again.';
    document.getElementById('errorAlert').classList.add('show');
  } finally {
    // Reset button
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
});

// Reset form
function resetForm() {
  document.getElementById('feedbackForm').reset();

  // Clear location
  selectedLocation = null;
  if (marker) {
    marker.remove();
    marker = null;
  }
  updateLocationDisplay();

  // Clear properties
  document.getElementById('propertiesContainer').innerHTML = '';

  // Clear errors
  hideAlerts();
  document.querySelectorAll('.error-text').forEach(el => el.classList.remove('show'));
  document.querySelectorAll('.form-control').forEach(el => el.classList.remove('error'));

  // Reset location method
  setLocationMethod('map');
}

// Show error
function showError(elementId, message) {
  const element = document.getElementById(elementId);
  if (element.classList.contains('error-text')) {
    element.textContent = message;
    element.classList.add('show');

    // Also highlight the input
    const input = element.previousElementSibling;
    if (input && input.classList.contains('form-control')) {
      input.classList.add('error');
    }
  } else {
    element.textContent = message;
    document.getElementById('errorAlert').classList.add('show');
  }
}

// Show success
function showSuccess(message) {
  // Simple success for non-submission actions
  const alert = document.getElementById('successAlert');
  alert.textContent = '✓ ' + message;
  alert.classList.add('show');

  setTimeout(() => {
    alert.classList.remove('show');
  }, 3000);
}

// Clear location error
function clearLocationError() {
  const errorElement = document.getElementById('locationError');
  errorElement.classList.remove('show');
}

// Hide all alerts
function hideAlerts() {
  document.getElementById('successAlert').classList.remove('show');
  document.getElementById('errorAlert').classList.remove('show');
}

// Show help
function showHelp() {
  alert(`How to Submit Feedback:

1. Enter your Mapbox Feedback API token
2. Select a category for your feedback
3. Add a description (optional but recommended)
4. Choose a location using one of three methods:
   - Click on the map
   - Enter coordinates manually
   - Use your current location
5. Add any additional properties (optional)
6. Click Submit Feedback

Note: You need a valid Mapbox token with feedback:write scope.`);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  initializeMap();

  // Handle input changes to clear errors
  document.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('error');
      const errorText = input.parentElement.querySelector('.error-text');
      if (errorText) {
        errorText.classList.remove('show');
      }
    });
  });
});

// Make functions globally available
window.setLocationMethod = setLocationMethod;
window.getCurrentLocation = getCurrentLocation;
window.applyCoordinates = applyCoordinates;
window.addProperty = addProperty;
window.removeProperty = removeProperty;
window.validateToken = validateToken;
window.resetForm = resetForm;
window.showHelp = showHelp;