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
          <div class="nav-turn-icon" aria-hidden="true"><span class="chevron"></span></div>
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
        font-family: var(--font-body, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
      }

      .nav-controls {
        position: fixed;
        left: 400px;
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
        border: 2px solid var(--green, #0E6B3A);
        border-radius: 6px;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      }

      /* Turn instruction - rendered as a highway guide-sign panel (the page's signature element) */
      .nav-instruction-banner {
        position: fixed;
        top: 10px;
        left: 400px;
        right: 10px;
        display: flex;
        align-items: center;
        gap: 16px;
        background: var(--green, #0E6B3A);
        color: var(--cream, #F6F3EA);
        padding: 14px 20px;
        border: 3px solid var(--cream, #F6F3EA);
        box-shadow: 0 0 0 2px var(--green-dark, #0A4C29), 0 4px 20px rgba(0,0,0,0.3);
        border-radius: 4px;
        z-index: 1000;
      }
      @media (prefers-reduced-motion: no-preference) {
        .nav-instruction-banner {
          animation: nav-sign-drop 0.45s ease-out;
        }
      }
      @keyframes nav-sign-drop {
        from { opacity: 0; transform: translateY(-14px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .nav-turn-icon {
        flex: none;
        width: 34px;
        height: 34px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .nav-turn-icon .chevron {
        width: 16px;
        height: 16px;
        border-top: 4px solid var(--cream, #F6F3EA);
        border-right: 4px solid var(--cream, #F6F3EA);
        transform: rotate(45deg);
      }

      .nav-instruction-text {
        width: 100%;
      }

      .nav-instruction-primary {
        font-family: var(--font-body, sans-serif);
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 4px;
      }

      .nav-instruction-distance {
        font-family: var(--font-display, sans-serif);
        font-size: 24px;
        font-weight: 800;
        color: #FFC94D;
        letter-spacing: 0.01em;
        font-variant-numeric: tabular-nums;
      }

      /* Trip computer - dashboard instrument-cluster motif, distinct material from the sign banner */
      .nav-info-panel {
        position: fixed;
        top: 95px;
        right: 10px;
        background: var(--asphalt, #1C1D1F);
        color: var(--cream, #F6F3EA);
        padding: 12px 16px;
        border-radius: 6px;
        box-shadow: 0 2px 12px rgba(0,0,0,0.3);
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
        font-family: var(--font-display, sans-serif);
        font-size: 10px;
        color: rgba(242, 169, 0, 0.85);
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        margin-bottom: 4px;
      }

      .nav-info-value {
        font-family: var(--font-mono, monospace);
        font-size: 16px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }

      .nav-button-danger {
        background: var(--red, #C8102E);
        color: var(--cream, #F6F3EA);
        border-color: var(--red, #C8102E);
      }

      .nav-button-danger:hover {
        background: #A50D26;
      }

      .nav-button-secondary {
        background: var(--cream, #F6F3EA);
        color: var(--green-dark, #0A4C29);
      }

      .nav-button-secondary:hover {
        background: var(--green-tint, #E3EEE7);
      }

      .nav-button-secondary.active {
        background: var(--green, #0E6B3A);
        color: var(--cream, #F6F3EA);
      }

      /* Status banner - amber caution by default, with a hazard-stripe edge */
      .nav-status {
        position: fixed;
        top: 195px;
        left: 400px;
        right: 10px;
        background: var(--amber, #F2A900);
        color: var(--asphalt, #1C1D1F);
        padding: 12px 12px 12px 20px;
        border-radius: 4px;
        font-family: var(--font-body, sans-serif);
        font-weight: 700;
        text-align: center;
        z-index: 1000;
        overflow: hidden;
      }

      .nav-status::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 8px;
        background: repeating-linear-gradient(
          -45deg,
          var(--asphalt, #1C1D1F),
          var(--asphalt, #1C1D1F) 4px,
          var(--amber, #F2A900) 4px,
          var(--amber, #F2A900) 8px
        );
      }

      .nav-status.hidden {
        display: none;
      }

      .nav-status.error {
        background: var(--red, #C8102E);
        color: var(--cream, #F6F3EA);
      }

      .nav-status.error::before {
        background: var(--red, #C8102E);
      }

      .nav-status.success {
        background: var(--green, #0E6B3A);
        color: var(--cream, #F6F3EA);
      }

      .nav-status.success::before {
        background: var(--green, #0E6B3A);
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
          padding: 10px 15px;
          gap: 10px;
        }
        .nav-turn-icon {
          width: 26px;
          height: 26px;
        }
        .nav-turn-icon .chevron {
          width: 12px;
          height: 12px;
          border-width: 3px;
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
          padding: 10px 10px 10px 18px;
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
