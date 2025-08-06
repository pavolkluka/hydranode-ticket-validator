/**
 * API Token QR Scanner
 * Handles QR code scanning specifically for API tokens
 */

class APITokenScanner {
    constructor() {
        this.stream = null;
        this.isScanning = false;
        this.video = null;
        this.canvas = null;
        this.context = null;
        this.animationFrame = null;
        
        // Bind methods
        this.scanFrame = this.scanFrame.bind(this);
        this.onTokenDetected = this.onTokenDetected.bind(this);
        
        this.initializeElements();
    }
    
    /**
     * Initialize DOM elements
     */
    initializeElements() {
        this.modal = document.getElementById('qrScannerModal');
        this.video = document.getElementById('qrTokenVideo');
        this.canvas = document.getElementById('qrTokenCanvas');
        this.cancelButton = document.getElementById('cancelQRScan');
        
        if (this.canvas) {
            this.context = this.canvas.getContext('2d');
        }
        
        // Setup event listeners
        if (this.cancelButton) {
            this.cancelButton.addEventListener('click', () => this.closeScanner());
        }
        
        // Close on outside click
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeScanner();
                }
            });
        }
    }
    
    /**
     * Start scanning for API token QR codes
     * @param {Function} onSuccess - Callback for successful scan
     * @param {Function} onError - Callback for errors
     */
    async startScanning(onSuccess, onError) {
        try {
            if (window.DebugLogger) {
                window.DebugLogger.info('api-token-scanner', 'Starting API token QR scanner');
            }
            
            this.onSuccess = onSuccess;
            this.onError = onError;
            
            // Request camera access
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Use rear camera if available
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });
            
            if (!this.video) {
                throw new Error('Video element not found');
            }
            
            // Setup video stream
            this.video.srcObject = this.stream;
            this.video.setAttribute('playsinline', true);
            
            // Wait for video to be ready
            await new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    resolve();
                };
            });
            
            await this.video.play();
            
            // Setup canvas dimensions
            if (this.canvas && this.video.videoWidth && this.video.videoHeight) {
                this.canvas.width = this.video.videoWidth;
                this.canvas.height = this.video.videoHeight;
            }
            
            // Show modal
            if (this.modal) {
                this.modal.style.display = 'flex';
                document.body.classList.add('modal-open');
            }
            
            // Start scanning
            this.isScanning = true;
            this.scanFrame();
            
        } catch (error) {
            console.error('Error starting API token scanner:', error);
            if (window.DebugLogger) {
                window.DebugLogger.error('api-token-scanner', 'Failed to start scanner', error);
            }
            
            this.cleanup();
            
            if (onError) {
                onError(error);
            }
        }
    }
    
    /**
     * Scan a single frame for QR codes
     */
    scanFrame() {
        if (!this.isScanning || !this.video || !this.canvas || !this.context) {
            return;
        }
        
        if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
            // Draw video frame to canvas
            this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            
            try {
                // Get image data
                const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
                
                // Scan for QR code
                if (typeof jsQR !== 'undefined') {
                    const code = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: 'dontInvert'
                    });
                    
                    if (code && code.data) {
                        this.onTokenDetected(code.data);
                        return; // Stop scanning after successful detection
                    }
                }
            } catch (error) {
                console.error('Error scanning frame:', error);
            }
        }
        
        // Continue scanning
        this.animationFrame = requestAnimationFrame(this.scanFrame);
    }
    
    /**
     * Handle detected QR code data
     * @param {string} data - QR code data
     */
    onTokenDetected(data) {
        if (window.DebugLogger) {
            window.DebugLogger.info('api-token-scanner', 'QR code detected', {
                dataLength: data.length,
                dataPrefix: data.substring(0, 20) + '...'
            });
        }
        
        // Validate that this looks like an API token
        const validation = HydranodeAPIClient.validateToken(data);
        if (!validation.valid) {
            if (window.DebugLogger) {
                window.DebugLogger.warn('api-token-scanner', 'Invalid token format detected', {
                    error: validation.error,
                    dataLength: data.length
                });
            }
            
            // Don't stop scanning, continue looking for valid token
            return;
        }
        
        // Valid token detected
        this.closeScanner();
        
        if (this.onSuccess) {
            this.onSuccess(data.trim());
        }
    }
    
    /**
     * Close the scanner and cleanup
     */
    closeScanner() {
        if (window.DebugLogger) {
            window.DebugLogger.info('api-token-scanner', 'Closing API token scanner');
        }
        
        this.cleanup();
        
        // Hide modal
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    }
    
    /**
     * Cleanup scanner resources
     */
    cleanup() {
        this.isScanning = false;
        
        // Stop animation frame
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        // Stop video stream
        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                track.stop();
            });
            this.stream = null;
        }
        
        // Clear video
        if (this.video) {
            this.video.srcObject = null;
        }
        
        // Clear callbacks
        this.onSuccess = null;
        this.onError = null;
    }
    
    /**
     * Check if scanner is currently active
     * @returns {boolean} - Scanner status
     */
    isActive() {
        return this.isScanning;
    }
}

// Initialize global scanner instance
window.APITokenScanner = new APITokenScanner();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APITokenScanner;
}