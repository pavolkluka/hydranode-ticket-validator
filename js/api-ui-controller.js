// API UI Controller Module
// Handles UI interactions for API mode and token management

class APIUIController {
    constructor() {
        this.isOnlineMode = false;
        this.isTokenScannerActive = false;
        this.tokenScannerStream = null;
        this.tokenScannerCanvas = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSavedState();
        
        // Register API service callbacks
        if (window.HydranodeAPI) {
            window.HydranodeAPI.registerCallback((type, data) => {
                this.handleAPICallback(type, data);
            });
        }
        
        if (window.DebugLogger) {
            window.DebugLogger.info('api-ui', 'APIUIController initialized');
        }
    }

    setupEventListeners() {
        // Mode toggle button
        const modeToggle = document.getElementById('modeToggle');
        if (modeToggle) {
            modeToggle.addEventListener('click', () => this.toggleMode());
        }

        // Token input and submission
        const tokenInput = document.getElementById('apiTokenInput');
        const tokenSubmit = document.getElementById('tokenSubmit');
        const tokenClear = document.getElementById('tokenClear');
        const tokenScanBtn = document.getElementById('tokenScanBtn');

        if (tokenInput) {
            tokenInput.addEventListener('input', (e) => this.handleTokenInput(e));
            tokenInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.authenticateToken();
                }
            });
        }

        if (tokenSubmit) {
            tokenSubmit.addEventListener('click', () => this.authenticateToken());
        }

        if (tokenClear) {
            tokenClear.addEventListener('click', () => this.logout());
        }

        if (tokenScanBtn) {
            tokenScanBtn.addEventListener('click', () => this.toggleTokenScanner());
        }
    }

    loadSavedState() {
        // Check if user is already authenticated
        if (window.HydranodeAPI && window.HydranodeAPI.isAuthenticated()) {
            this.setOnlineMode(true);
            this.updateAuthenticatedUI();
        } else {
            this.setOnlineMode(false);
        }
    }

    toggleMode() {
        if (this.isOnlineMode) {
            // Switch to offline mode
            this.setOnlineMode(false);
            if (window.HydranodeAPI) {
                window.HydranodeAPI.logout();
            }
        } else {
            // Switch to online mode
            this.setOnlineMode(true);
        }
    }

    setOnlineMode(enabled) {
        this.isOnlineMode = enabled;
        this.updateModeUI();
        
        // Notify main application about mode change
        if (window.MainApp && typeof window.MainApp.handleModeChange === 'function') {
            window.MainApp.handleModeChange(enabled ? 'online' : 'offline');
        }

        if (window.DebugLogger) {
            window.DebugLogger.info('api-ui', 'Mode changed', {
                mode: enabled ? 'online' : 'offline',
                authenticated: window.HydranodeAPI ? window.HydranodeAPI.isAuthenticated() : false
            });
        }
    }

    updateModeUI() {
        const modeToggleText = document.getElementById('modeToggleText');
        const modeToggleIcon = document.getElementById('modeToggleIcon');
        const currentModeDisplay = document.getElementById('currentModeDisplay');
        const apiTokenSection = document.getElementById('apiTokenSection');
        const modeToggle = document.getElementById('modeToggle');

        if (window.LanguageManager) {
            // Update current mode display
            if (currentModeDisplay) {
                currentModeDisplay.textContent = this.isOnlineMode ? 
                    window.LanguageManager.get('onlineMode') : 
                    window.LanguageManager.get('offlineMode');
            }

            // Update toggle button text
            if (modeToggleText) {
                modeToggleText.textContent = this.isOnlineMode ? 
                    window.LanguageManager.get('switchToOffline') : 
                    window.LanguageManager.get('switchToOnline');
            }
        }

        // Update toggle button icon
        if (modeToggleIcon && window.IconLibrary) {
            modeToggleIcon.innerHTML = this.isOnlineMode ? 
                window.IconLibrary.getIcon('upload', '14') :  // XLS upload icon for switching to offline
                window.IconLibrary.getIcon('cloud', '14');    // Cloud icon for switching to online
        }

        // Show/hide API token section
        if (apiTokenSection) {
            apiTokenSection.style.display = this.isOnlineMode ? 'block' : 'none';
        }

        // Update toggle button style
        if (modeToggle) {
            modeToggle.className = `mode-toggle-btn ${this.isOnlineMode ? 'online' : 'offline'}`;
        }
    }

    handleTokenInput(event) {
        const input = event.target;
        const tokenSubmit = document.getElementById('tokenSubmit');
        
        // Enable/disable submit button based on input
        if (tokenSubmit) {
            tokenSubmit.disabled = !input.value.trim();
        }
        
        // Clear previous error states
        input.classList.remove('error');
    }

    async authenticateToken() {
        const tokenInput = document.getElementById('apiTokenInput');
        const tokenSubmit = document.getElementById('tokenSubmit');
        
        if (!tokenInput || !window.HydranodeAPI) return;

        const token = tokenInput.value.trim();
        if (!token) {
            this.showTokenError('Please enter an API token');
            return;
        }

        try {
            // Show loading state
            if (tokenSubmit) {
                tokenSubmit.disabled = true;
                tokenSubmit.innerHTML = `<span data-i18n="authenticating">Authenticating...</span>`;
            }

            // Authenticate with API service
            const userData = await window.HydranodeAPI.authenticateUser(token);
            
            // Clear input and update UI
            tokenInput.value = '';
            this.updateAuthenticatedUI();
            this.clearTokenError();

            if (window.DebugLogger) {
                window.DebugLogger.info('api-ui', 'Authentication successful', {
                    userId: userData.id,
                    userEmail: userData.email
                });
            }

        } catch (error) {
            this.showTokenError(error.message);
            
            if (window.DebugLogger) {
                window.DebugLogger.error('api-ui', 'Authentication failed', error);
            }
        } finally {
            // Restore submit button
            if (tokenSubmit) {
                tokenSubmit.disabled = false;
                tokenSubmit.innerHTML = `
                    <span class="button-icon" id="tokenSubmitIcon">${window.IconLibrary ? window.IconLibrary.getIcon('key', '14') : ''}</span>
                    <span data-i18n="authenticate">Authenticate</span>
                `;
            }
        }
    }

    updateAuthenticatedUI() {
        if (!window.HydranodeAPI || !window.HydranodeAPI.isAuthenticated()) return;

        const userData = window.HydranodeAPI.getCurrentUser();
        const userInfo = document.getElementById('userInfo');
        const userWelcome = document.getElementById('userWelcome');
        const userDetails = document.getElementById('userDetails');
        const tokenSubmit = document.getElementById('tokenSubmit');
        const tokenClear = document.getElementById('tokenClear');
        const tokenInput = document.getElementById('apiTokenInput');

        // Show user info
        if (userInfo) {
            userInfo.style.display = 'block';
        }

        // Set welcome message
        if (userWelcome && window.LanguageManager) {
            const currentLang = window.LanguageManager.getCurrentLanguage();
            userWelcome.textContent = window.HydranodeAPI.getWelcomeMessage(currentLang);
        }

        // Set user details
        if (userDetails && userData) {
            userDetails.innerHTML = `
                <div class="user-email">${userData.email}</div>
                <div class="user-roles">${userData.roles ? userData.roles.join(', ') : ''}</div>
            `;
        }

        // Hide submit button, show clear button
        if (tokenSubmit) {
            tokenSubmit.style.display = 'none';
        }
        if (tokenClear) {
            tokenClear.style.display = 'inline-flex';
        }

        // Hide token input
        if (tokenInput) {
            tokenInput.style.display = 'none';
        }
    }

    logout() {
        if (!window.HydranodeAPI) return;

        // Clear authentication
        window.HydranodeAPI.logout();
        
        // Reset UI
        this.updateLoggedOutUI();
        
        if (window.DebugLogger) {
            window.DebugLogger.info('api-ui', 'User logged out');
        }
    }

    updateLoggedOutUI() {
        const userInfo = document.getElementById('userInfo');
        const tokenSubmit = document.getElementById('tokenSubmit');
        const tokenClear = document.getElementById('tokenClear');
        const tokenInput = document.getElementById('apiTokenInput');

        // Hide user info
        if (userInfo) {
            userInfo.style.display = 'none';
        }

        // Show submit button, hide clear button
        if (tokenSubmit) {
            tokenSubmit.style.display = 'inline-flex';
        }
        if (tokenClear) {
            tokenClear.style.display = 'none';
        }

        // Show token input
        if (tokenInput) {
            tokenInput.style.display = 'block';
            tokenInput.value = '';
        }

        this.clearTokenError();
    }

    toggleTokenScanner() {
        if (this.isTokenScannerActive) {
            this.stopTokenScanner();
        } else {
            this.startTokenScanner();
        }
    }

    async startTokenScanner() {
        try {
            // Request camera access
            this.tokenScannerStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            // Create scanner modal
            this.createTokenScannerModal();
            this.isTokenScannerActive = true;
            
            // Start scanning loop
            this.scanTokenQRCode();

            if (window.DebugLogger) {
                window.DebugLogger.info('api-ui', 'Token QR scanner started');
            }

        } catch (error) {
            console.error('Failed to start token scanner:', error);
            this.showTokenError('Camera access denied or unavailable');
            
            if (window.DebugLogger) {
                window.DebugLogger.error('api-ui', 'Failed to start token scanner', error);
            }
        }
    }

    createTokenScannerModal() {
        // Remove existing modal if any
        const existingModal = document.getElementById('tokenScannerModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'tokenScannerModal';
        modal.className = 'token-scanner-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 data-i18n="scanApiToken">Scan API Token QR Code</h3>
                    <button class="modal-close" id="tokenScannerClose">
                        <span class="close-icon">×</span>
                    </button>
                </div>
                <div class="scanner-viewport">
                    <video id="tokenScannerVideo" autoplay muted playsinline></video>
                    <canvas id="tokenScannerCanvas" class="qr-overlay"></canvas>
                    <div class="scanner-overlay"></div>
                </div>
                <div class="scanner-status">
                    <div class="status-text" data-i18n="scannerReady">Position QR code within frame</div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Setup video stream
        const video = document.getElementById('tokenScannerVideo');
        this.tokenScannerCanvas = document.getElementById('tokenScannerCanvas');
        
        if (video && this.tokenScannerStream) {
            video.srcObject = this.tokenScannerStream;
        }

        // Setup close button
        const closeBtn = document.getElementById('tokenScannerClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.stopTokenScanner());
        }

        // Update language if available
        if (window.LanguageManager) {
            window.LanguageManager.updateUI();
        }
    }

    scanTokenQRCode() {
        if (!this.isTokenScannerActive || !window.jsQR || !this.tokenScannerCanvas) {
            return;
        }

        const video = document.getElementById('tokenScannerVideo');
        if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
            requestAnimationFrame(() => this.scanTokenQRCode());
            return;
        }

        const context = this.tokenScannerCanvas.getContext('2d');
        this.tokenScannerCanvas.width = video.videoWidth;
        this.tokenScannerCanvas.height = video.videoHeight;

        context.drawImage(video, 0, 0, this.tokenScannerCanvas.width, this.tokenScannerCanvas.height);
        const imageData = context.getImageData(0, 0, this.tokenScannerCanvas.width, this.tokenScannerCanvas.height);
        
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
            this.handleScannedToken(code.data);
            return;
        }

        requestAnimationFrame(() => this.scanTokenQRCode());
    }

    handleScannedToken(qrData) {
        // Extract token from QR data
        let token = qrData.trim();
        
        // If QR contains URL, try to extract token from it
        if (token.startsWith('http')) {
            try {
                const url = new URL(token);
                // Try common URL patterns for tokens
                const urlToken = url.searchParams.get('token') || 
                                url.searchParams.get('api_token') ||
                                url.pathname.split('/').pop();
                if (urlToken) {
                    token = urlToken;
                }
            } catch (error) {
                // Invalid URL, use original data
            }
        }

        // Validate token format
        const validation = window.HydranodeAPI ? 
            window.HydranodeAPI.validateTokenFormat(token) : 
            { valid: false, error: 'API service not available' };

        if (validation.valid) {
            // Insert token into input field
            const tokenInput = document.getElementById('apiTokenInput');
            if (tokenInput) {
                tokenInput.value = validation.token;
            }

            this.stopTokenScanner();
            
            // Auto-authenticate if desired
            setTimeout(() => {
                this.authenticateToken();
            }, 500);

            if (window.DebugLogger) {
                window.DebugLogger.info('api-ui', 'Token scanned successfully');
            }
        } else {
            this.showTokenError(`Invalid QR code: ${validation.error}`);
            this.stopTokenScanner();
        }
    }

    stopTokenScanner() {
        this.isTokenScannerActive = false;

        // Stop video stream
        if (this.tokenScannerStream) {
            this.tokenScannerStream.getTracks().forEach(track => track.stop());
            this.tokenScannerStream = null;
        }

        // Remove modal
        const modal = document.getElementById('tokenScannerModal');
        if (modal) {
            modal.remove();
        }

        this.tokenScannerCanvas = null;

        if (window.DebugLogger) {
            window.DebugLogger.info('api-ui', 'Token QR scanner stopped');
        }
    }

    showTokenError(message) {
        const tokenInput = document.getElementById('apiTokenInput');
        const existingError = document.querySelector('.token-error-message');
        
        // Remove existing error
        if (existingError) {
            existingError.remove();
        }

        // Add error class to input
        if (tokenInput) {
            tokenInput.classList.add('error');
        }

        // Create error message
        const errorElement = document.createElement('div');
        errorElement.className = 'token-error-message';
        errorElement.textContent = message;

        // Insert after token input group
        const tokenSection = document.getElementById('apiTokenSection');
        if (tokenSection) {
            const inputGroup = tokenSection.querySelector('.token-input-group');
            if (inputGroup) {
                inputGroup.parentNode.insertBefore(errorElement, inputGroup.nextSibling);
            }
        }

        // Auto-clear error after 5 seconds
        setTimeout(() => {
            this.clearTokenError();
        }, 5000);
    }

    clearTokenError() {
        const tokenInput = document.getElementById('apiTokenInput');
        const errorElement = document.querySelector('.token-error-message');
        
        if (tokenInput) {
            tokenInput.classList.remove('error');
        }
        
        if (errorElement) {
            errorElement.remove();
        }
    }

    handleAPICallback(type, data) {
        if (type === 'auth') {
            if (data.success) {
                this.updateAuthenticatedUI();
            } else {
                this.updateLoggedOutUI();
            }
        } else if (type === 'network') {
            // Handle network status changes
            if (!data.online && this.isOnlineMode) {
                this.showTokenError('Network connection lost. Some features may not work.');
            }
        }
    }

    // Get current mode for external use
    getCurrentMode() {
        return this.isOnlineMode ? 'online' : 'offline';
    }

    // Check if online mode is active and authenticated
    isOnlineAndAuthenticated() {
        return this.isOnlineMode && 
               window.HydranodeAPI && 
               window.HydranodeAPI.isAuthenticated();
    }
}

// Initialize API UI Controller when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize API UI Controller
    const apiUIController = new APIUIController();
    
    // Make it globally available
    window.APIUIController = apiUIController;
});

// Export for use in other scripts  
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIUIController;
}