/**
 * Navigation UI Component
 * Displays turn-by-turn navigation information
 */

class NavigationUI {
  constructor(containerId, navigation) {
    this.container = document.getElementById(containerId);
    this.navigation = navigation;

    if (!this.container) {
      console.error(`Container ${containerId} not found`);
      return;
    }

    this._createUI();
    this._attachEventListeners();
  }

  /**
   * Create UI elements
   */
  _createUI() {
    this.container.innerHTML = `
      <div class="nav-ui-container">
        <!-- Instruction Banner -->
        <div class="nav-instruction-banner">
          <div class="nav-maneuver-icon">
            <svg id="nav-maneuver-svg" width="60" height="60" viewBox="0 0 24 24">
              <path fill="white" d="M12 2L4 8v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V8l-8-6z"/>
            </svg>
          </div>
          <div class="nav-instruction-text">
            <div class="nav-instruction-primary" id="nav-instruction">
              Waiting for route...
            </div>
            <div class="nav-instruction-distance" id="nav-distance-to-step">
              --
            </div>
          </div>
        </div>

        <!-- Progress Info -->
        <div class="nav-progress-info">
          <div class="nav-info-item">
            <div class="nav-info-label">Distance</div>
            <div class="nav-info-value" id="nav-distance-remaining">--</div>
          </div>
          <div class="nav-info-item">
            <div class="nav-info-label">Time</div>
            <div class="nav-info-value" id="nav-time-remaining">--</div>
          </div>
          <div class="nav-info-item">
            <div class="nav-info-label">Arrival</div>
            <div class="nav-info-value" id="nav-eta">--</div>
          </div>
        </div>

        <!-- Controls -->
        <div class="nav-controls">
          <button id="nav-stop-btn" class="nav-button nav-button-danger">
            Stop Navigation
          </button>
          <button id="nav-voice-toggle" class="nav-button nav-button-secondary">
            🔊 Voice
          </button>
          <button id="nav-recenter" class="nav-button nav-button-secondary">
            📍 Recenter
          </button>
        </div>

        <!-- Status Messages -->
        <div id="nav-status" class="nav-status hidden">
          <div id="nav-status-text"></div>
        </div>
      </div>
    `;

    this._injectStyles();
  }

  /**
   * Inject CSS styles
   */
  _injectStyles() {
    if (document.getElementById('nav-ui-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'nav-ui-styles';
    styles.textContent = `
      .nav-ui-container {
        position: absolute;
        top: 10px;
        left: 10px;
        right: 10px;
        z-index: 1000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      }

      .nav-instruction-banner {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 15px;
      }

      .nav-maneuver-icon {
        flex-shrink: 0;
        width: 60px;
        height: 60px;
        background: rgba(255,255,255,0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .nav-instruction-text {
        flex: 1;
      }

      .nav-instruction-primary {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 5px;
      }

      .nav-instruction-distance {
        font-size: 24px;
        font-weight: 700;
      }

      .nav-progress-info {
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        padding: 15px;
        display: flex;
        justify-content: space-around;
        margin-bottom: 15px;
      }

      .nav-info-item {
        text-align: center;
      }

      .nav-info-label {
        font-size: 12px;
        color: #666;
        margin-bottom: 5px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .nav-info-value {
        font-size: 18px;
        font-weight: 700;
        color: #333;
      }

      .nav-controls {
        display: flex;
        gap: 10px;
        margin-bottom: 15px;
      }

      .nav-button {
        flex: 1;
        padding: 12px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .nav-button-danger {
        background: #ef4444;
        color: white;
      }

      .nav-button-danger:hover {
        background: #dc2626;
      }

      .nav-button-secondary {
        background: #f3f4f6;
        color: #374151;
      }

      .nav-button-secondary:hover {
        background: #e5e7eb;
      }

      .nav-button-secondary.active {
        background: #667eea;
        color: white;
      }

      .nav-status {
        background: #fbbf24;
        color: #92400e;
        padding: 15px;
        border-radius: 8px;
        font-weight: 600;
        text-align: center;
      }

      .nav-status.hidden {
        display: none;
      }

      .nav-status.error {
        background: #ef4444;
        color: white;
      }

      .nav-status.success {
        background: #10b981;
        color: white;
      }

      @media (max-width: 768px) {
        .nav-instruction-primary {
          font-size: 16px;
        }
        .nav-instruction-distance {
          font-size: 20px;
        }
        .nav-info-value {
          font-size: 16px;
        }
      }
    `;

    document.head.appendChild(styles);
  }

  /**
   * Attach event listeners
   */
  _attachEventListeners() {
    const stopBtn = document.getElementById('nav-stop-btn');
    const voiceToggle = document.getElementById('nav-voice-toggle');
    const recenterBtn = document.getElementById('nav-recenter');

    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        this.navigation.stopNavigation();
        this.hide();
      });
    }

    if (voiceToggle) {
      voiceToggle.addEventListener('click', () => {
        this.navigation.config.voiceEnabled = !this.navigation.config.voiceEnabled;
        voiceToggle.classList.toggle('active');
        voiceToggle.textContent = this.navigation.config.voiceEnabled ? '🔊 Voice' : '🔇 Muted';
      });
    }

    if (recenterBtn) {
      recenterBtn.addEventListener('click', () => {
        this.navigation.config.cameraFollowEnabled = true;
        if (this.navigation.state.userLocation) {
          this.navigation._updateCamera(this.navigation.state.userLocation);
        }
      });
    }

    // Subscribe to navigation events
    this.navigation.callbacks.onProgressUpdate = (data) => this._updateProgress(data);
    this.navigation.callbacks.onInstructionAdvance = (data) => this._updateInstruction(data);
    this.navigation.callbacks.onOffRoute = () => this._showStatus('Off route, recalculating...', 'warning');
    this.navigation.callbacks.onRouteUpdate = (data) => {
      if (data.isReroute) {
        this._showStatus('Route updated', 'success', 2000);
      }
    };
    this.navigation.callbacks.onArrival = () => {
      this._showStatus('You have arrived!', 'success');
      setTimeout(() => this.hide(), 3000);
    };
    this.navigation.callbacks.onError = (data) => {
      this._showStatus('Error: ' + data.message, 'error', 5000);
    };
  }

  /**
   * Update progress display
   */
  _updateProgress(data) {
    // Update distance to next step
    const distanceToStepEl = document.getElementById('nav-distance-to-step');
    if (distanceToStepEl) {
      distanceToStepEl.textContent = this._formatDistance(data.distanceToNextStep);
    }

    // Update remaining distance
    const distanceRemainingEl = document.getElementById('nav-distance-remaining');
    if (distanceRemainingEl) {
      distanceRemainingEl.textContent = this._formatDistance(data.distanceRemaining);
    }

    // Update remaining time
    const timeRemainingEl = document.getElementById('nav-time-remaining');
    if (timeRemainingEl) {
      timeRemainingEl.textContent = this._formatDuration(data.durationRemaining);
    }

    // Update ETA
    const etaEl = document.getElementById('nav-eta');
    if (etaEl) {
      const eta = new Date(Date.now() + data.durationRemaining * 1000);
      etaEl.textContent = eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }

  /**
   * Update instruction display
   */
  _updateInstruction(data) {
    const instructionEl = document.getElementById('nav-instruction');
    if (instructionEl) {
      instructionEl.textContent = data.instruction;
    }

    // Update maneuver icon (simplified - you can add more icons)
    this._updateManeuverIcon(data.maneuver);
  }

  /**
   * Update maneuver icon
   */
  _updateManeuverIcon(maneuver) {
    const svg = document.getElementById('nav-maneuver-svg');
    if (!svg) return;

    // Simple arrow icons for different maneuvers
    const icons = {
      'turn-right': 'M12 4l8 8-8 8v-6H4v-4h8V4z',
      'turn-left': 'M12 4l-8 8 8 8v-6h8v-4h-8V4z',
      'straight': 'M12 4l0 16m-4-4l4 4 4-4',
      'arrive': 'M12 2L4 8v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V8l-8-6z'
    };

    let iconPath = icons.straight;
    if (maneuver && maneuver.type) {
      iconPath = icons[maneuver.type] || icons.straight;
    }

    svg.innerHTML = `<path fill="white" d="${iconPath}"/>`;
  }

  /**
   * Show status message
   */
  _showStatus(message, type = 'warning', duration = null) {
    const statusEl = document.getElementById('nav-status');
    const statusTextEl = document.getElementById('nav-status-text');

    if (statusEl && statusTextEl) {
      statusEl.className = `nav-status ${type}`;
      statusTextEl.textContent = message;

      if (duration) {
        setTimeout(() => {
          statusEl.classList.add('hidden');
        }, duration);
      }
    }
  }

  /**
   * Format distance for display
   */
  _formatDistance(meters) {
    if (meters === null || meters === undefined) return '--';

    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    } else {
      return `${(meters / 1000).toFixed(1)} km`;
    }
  }

  /**
   * Format duration for display
   */
  _formatDuration(seconds) {
    if (seconds === null || seconds === undefined) return '--';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  /**
   * Show UI
   */
  show() {
    this.container.style.display = 'block';
  }

  /**
   * Hide UI
   */
  hide() {
    this.container.style.display = 'none';
  }
}
