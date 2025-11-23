/**
 * Navigation UI Component
 * Displays turn-by-turn navigation information
 */

class NavigationUI {
  constructor(containerId, navigation) {
    this.container = document.getElementById(containerId);
    this.navigation = navigation;
    this.arrivalMessageShown = false; // Track if arrival message has been shown

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
        <!-- Controls -->
        <div class="nav-controls">
          <button id="nav-stop-btn" class="nav-button nav-button-danger" title="Stop Navigation">
            ✕
          </button>
          <button id="nav-voice-toggle" class="nav-button nav-button-secondary" title="Toggle Voice">
            🔊
          </button>
          <button id="nav-recenter" class="nav-button nav-button-secondary" title="Recenter">
            📍
          </button>
        </div>

        <!-- Instruction Banner -->
        <div class="nav-instruction-banner">
          <div class="nav-instruction-text">
            <div class="nav-instruction-primary" id="nav-instruction">
              Waiting for route...
            </div>
            <div class="nav-instruction-distance" id="nav-distance-to-step">
              --
            </div>
          </div>
        </div>

        <!-- Info Panel -->
        <div class="nav-info-panel">
          <div class="nav-info-item">
            <div class="nav-info-label">Total Distance</div>
            <div class="nav-info-value" id="nav-distance-remaining">--</div>
          </div>
          <div class="nav-info-item">
            <div class="nav-info-label">Time Remaining</div>
            <div class="nav-info-value" id="nav-time-remaining">--</div>
          </div>
          <div class="nav-info-item">
            <div class="nav-info-label">Arrival</div>
            <div class="nav-info-value" id="nav-eta">--</div>
          </div>
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
        position: relative;
        z-index: 1000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      }

      .nav-controls {
        position: fixed;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        flex-direction: column;
        gap: 8px;
        z-index: 1001;
      }

      .nav-button {
        width: 40px;
        height: 40px;
        padding: 0;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }

      .nav-instruction-banner {
        position: fixed;
        top: 10px;
        left: 10px;
        right: 10px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        z-index: 1000;
      }

      .nav-instruction-text {
        width: 100%;
      }

      .nav-instruction-primary {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 5px;
      }

      .nav-instruction-distance {
        font-size: 22px;
        font-weight: 700;
      }

      .nav-info-panel {
        position: fixed;
        top: 95px;
        right: 10px;
        background: rgba(128, 128, 128, 0.8);
        color: white;
        padding: 12px 16px;
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.2);
        z-index: 1000;
        display: flex;
        gap: 20px;
      }

      .nav-info-item {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }

      .nav-info-label {
        font-size: 11px;
        opacity: 0.9;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 3px;
      }

      .nav-info-value {
        font-size: 16px;
        font-weight: 700;
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
        position: fixed;
        top: 195px;
        left: 10px;
        right: 10px;
        background: #fbbf24;
        color: #92400e;
        padding: 12px;
        border-radius: 8px;
        font-weight: 600;
        text-align: center;
        z-index: 1000;
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
        .nav-controls {
          left: 5px;
        }
        .nav-button {
          width: 36px;
          height: 36px;
          font-size: 14px;
        }
        .nav-instruction-banner {
          top: 5px;
          left: 5px;
          right: 5px;
          padding: 12px 15px;
        }
        .nav-instruction-primary {
          font-size: 14px;
        }
        .nav-instruction-distance {
          font-size: 18px;
        }
        .nav-info-panel {
          top: 80px;
          right: 5px;
          padding: 10px 12px;
          gap: 15px;
        }
        .nav-info-label {
          font-size: 9px;
        }
        .nav-info-value {
          font-size: 14px;
        }
        .nav-status {
          top: 175px;
          left: 5px;
          right: 5px;
          padding: 10px;
          font-size: 13px;
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
        voiceToggle.textContent = this.navigation.config.voiceEnabled ? '🔊' : '🔇';

        // Prime speech synthesis when enabling voice (important for iOS)
        if (this.navigation.config.voiceEnabled) {
          this.navigation.primeSpeechSynthesis();
          console.log('🔊 Voice enabled');
        } else {
          console.log('🔇 Voice disabled');
        }
      });
    }

    if (recenterBtn) {
      recenterBtn.addEventListener('click', () => {
        console.log('🎯 Recenter button clicked');
        this.navigation.enableCameraFollow();
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
      // Only show arrival message once to prevent flickering
      if (!this.arrivalMessageShown) {
        console.log('🎉 Arrival callback triggered - showing status message');
        this._showStatus('You have arrived!', 'success', 3000);
        this.arrivalMessageShown = true;
      }
      // Keep navigation UI visible - user can manually return to setup
    };
    this.navigation.callbacks.onError = (data) => {
      this._showStatus('Error: ' + data.message, 'error', 3000);
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
  }

  /**
   * Show status message
   */
  _showStatus(message, type = 'warning', duration = null) {
    console.log(`📢 _showStatus called: "${message}", type: ${type}, duration: ${duration}`);

    const statusEl = document.getElementById('nav-status');
    const statusTextEl = document.getElementById('nav-status-text');

    console.log('Status elements:', { statusEl, statusTextEl });

    if (statusEl && statusTextEl) {
      statusEl.className = `nav-status ${type}`;
      statusTextEl.textContent = message;
      statusEl.classList.remove('hidden');

      console.log('Status element classes:', statusEl.className);
      console.log('Status element display:', window.getComputedStyle(statusEl).display);
      console.log('Status element visibility:', window.getComputedStyle(statusEl).visibility);

      if (duration) {
        setTimeout(() => {
          statusEl.classList.add('hidden');
        }, duration);
      }
    } else {
      console.error('❌ Status elements not found!');
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
    this.arrivalMessageShown = false; // Reset for new navigation session
  }

  /**
   * Hide UI
   */
  hide() {
    this.container.style.display = 'none';
  }
}
