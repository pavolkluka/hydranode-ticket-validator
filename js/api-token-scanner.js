/**
 * API Token QR Scanner Integration
 * Provides QR code scanning functionality specifically for API token input
 */

class APITokenScanner {
    constructor() {
        this.video = null;
        this.canvas = null;
        this.context = null;
        this.stream = null;
        this.scanInterval = null;
        this.isScanning = false;
        this.onTokenScanned = null;
        
        if (window.DebugLogger) {
            window.DebugLogger.info('api-token-scanner', 'API Token Scanner initialized');
        }
    }
    
    /**
     * Initialize scanner elements
     */
    initializeScanner(videoElement, canvasElement) {
        this.video = videoElement;
        this.canvas = canvasElement;
        this.context = this.canvas.getContext('2d');
        
        if (window.DebugLogger) {
            window.DebugLogger.debug('api-token-scanner', 'Scanner elements initialized', {
                hasVideo: !!this.video,
                hasCanvas: !!this.canvas
            });
        }
    }
    
    /**
     * Start scanning for API tokens
     */
    async startScanning(onTokenScanned) {
        if (this.isScanning) {
            this.stopScanning();
        }
        
        this.onTokenScanned = onTokenScanned;
        
        try {
            // Get camera stream
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            
            this.video.srcObject = this.stream;
            this.video.play();
            
            this.isScanning = true;
            
            // Start scanning loop
            this.video.addEventListener('loadedmetadata', () => {
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;
                this.scanForToken();
            });
            
            if (window.DebugLogger) {
                window.DebugLogger.info('api-token-scanner', 'Token scanning started');
            }
            
        } catch (error) {
            if (window.DebugLogger) {
                window.DebugLogger.error('api-token-scanner', 'Failed to start scanning', error);
            }
            throw new Error(`Failed to start camera: ${error.message}`);
        }
    }
    
    /**
     * Stop scanning
     */
    stopScanning() {
        this.isScanning = false;
        
        if (this.scanInterval) {
            clearInterval(this.scanInterval);
            this.scanInterval = null;
        }
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        if (this.video) {
            this.video.srcObject = null;
        }
        
        if (window.DebugLogger) {
            window.DebugLogger.info('api-token-scanner', 'Token scanning stopped');
        }
    }
    
    /**
     * Scan for QR codes containing API tokens
     */
    scanForToken() {
        if (!this.isScanning || !this.video || !this.canvas || !this.context) {
            return;
        }
        
        this.scanInterval = setInterval(() => {
            if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
                this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
                const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
                
                try {
                    const code = jsQR(imageData.data, imageData.width, imageData.height);
                    
                    if (code && code.data) {
                        this.processScannedData(code.data);
                    }
                } catch (error) {
                    if (window.DebugLogger) {
                        window.DebugLogger.warn('api-token-scanner', 'QR scanning error', error);
                    }
                }
            }
        }, 100);
    }
    
    /**
     * Process scanned QR code data
     */
    processScannedData(data) {
        if (window.DebugLogger) {
            window.DebugLogger.debug('api-token-scanner', 'QR code detected', { dataLength: data.length });
        }
        
        // Try to extract API token from various formats
        let token = this.extractToken(data);
        
        if (token) {
            if (window.DebugLogger) {
                window.DebugLogger.info('api-token-scanner', 'API token extracted from QR code', {
                    tokenLength: token.length,
                    tokenPrefix: token.substring(0, 8) + '...'
                });
            }
            
            this.stopScanning();
            
            if (this.onTokenScanned) {
                this.onTokenScanned(token);
            }
        } else {
            if (window.DebugLogger) {
                window.DebugLogger.debug('api-token-scanner', 'No valid API token found in QR code');
            }
        }
    }
    
    /**
     * Extract API token from scanned data
     */
    extractToken(data) {
        // Remove whitespace
        data = data.trim();
        
        // Format 1: Direct token (alphanumeric, 32+ chars)
        if (/^[a-zA-Z0-9]{32,}$/.test(data)) {
            return data;
        }
        
        // Format 2: JSON containing token
        try {
            const parsed = JSON.parse(data);
            if (parsed.api_token || parsed.apiToken || parsed.token) {
                return parsed.api_token || parsed.apiToken || parsed.token;
            }
        } catch (e) {
            // Not JSON, continue
        }
        
        // Format 3: URL with token parameter
        try {
            const url = new URL(data);
            const tokenParam = url.searchParams.get('token') || 
                              url.searchParams.get('api_token') || 
                              url.searchParams.get('apiToken');
            if (tokenParam) {
                return tokenParam;
            }
        } catch (e) {
            // Not a valid URL, continue
        }
        
        // Format 4: Key-value pairs (token=xyz or api_token=xyz)
        const tokenMatch = data.match(/(?:api_token|token|apiToken)[:=]\s*([a-zA-Z0-9]+)/i);
        if (tokenMatch) {
            return tokenMatch[1];
        }
        
        // Format 5: Look for any alphanumeric string of 32+ characters
        const longTokenMatch = data.match(/[a-zA-Z0-9]{32,}/);
        if (longTokenMatch) {
            return longTokenMatch[0];
        }
        
        return null;
    }
    
    /**
     * Check if scanner is supported
     */
    static isSupported() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.jsQR);
    }
    
    /**
     * Get camera permissions status
     */
    static async getCameraPermission() {
        if (!navigator.permissions || !navigator.permissions.query) {
            return 'unknown';
        }
        
        try {
            const permission = await navigator.permissions.query({ name: 'camera' });
            return permission.state;
        } catch (error) {
            return 'unknown';
        }
    }
}

// Create global instance
window.APITokenScanner = new APITokenScanner();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APITokenScanner;
}