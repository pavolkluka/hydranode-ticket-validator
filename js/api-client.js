/**
 * Hydranode API Client
 * Handles API authentication, requests, and data management
 */

class HydranodeAPIClient {
    constructor() {
        this.baseURL = 'https://management.hydranode.net/api';
        this.apiToken = null;
        this.userInfo = null;
        this.isOnlineMode = false;
        
        // Load saved configuration
        this.loadConfiguration();
        
        // Initialize debug logging
        if (window.DebugLogger) {
            window.DebugLogger.info('api-client', 'Hydranode API Client initialized', {
                baseURL: this.baseURL,
                hasStoredToken: !!this.apiToken,
                isOnlineMode: this.isOnlineMode
            });
        }
    }
    
    /**
     * Load configuration from localStorage
     */
    loadConfiguration() {
        try {
            const savedConfig = localStorage.getItem('hydranode_api_config');
            if (savedConfig) {
                const config = JSON.parse(savedConfig);
                this.apiToken = config.apiToken;
                this.userInfo = config.userInfo;
                this.isOnlineMode = config.isOnlineMode || false;
            }
        } catch (error) {
            console.warn('Failed to load API configuration:', error);
            if (window.DebugLogger) {
                window.DebugLogger.warn('api-client', 'Failed to load saved configuration', error);
            }
        }
    }
    
    /**
     * Save configuration to localStorage
     */
    saveConfiguration() {
        try {
            const config = {
                apiToken: this.apiToken,
                userInfo: this.userInfo,
                isOnlineMode: this.isOnlineMode,
                lastSaved: new Date().toISOString()
            };
            localStorage.setItem('hydranode_api_config', JSON.stringify(config));
            
            if (window.DebugLogger) {
                window.DebugLogger.info('api-client', 'Configuration saved', {
                    hasToken: !!this.apiToken,
                    hasUserInfo: !!this.userInfo,
                    isOnlineMode: this.isOnlineMode
                });
            }
        } catch (error) {
            console.error('Failed to save API configuration:', error);
            if (window.DebugLogger) {
                window.DebugLogger.error('api-client', 'Failed to save configuration', error);
            }
        }
    }
    
    /**
     * Clear all stored configuration
     */
    clearConfiguration() {
        this.apiToken = null;
        this.userInfo = null;
        this.isOnlineMode = false;
        
        try {
            localStorage.removeItem('hydranode_api_config');
            if (window.DebugLogger) {
                window.DebugLogger.info('api-client', 'Configuration cleared');
            }
        } catch (error) {
            console.warn('Failed to clear API configuration:', error);
        }
    }
    
    /**
     * Validate API token format
     */
    validateToken(token) {
        if (!token || typeof token !== 'string') {
            return { valid: false, error: 'Token must be a non-empty string' };
        }
        
        // Basic token format validation
        if (token.length < 32) {
            return { valid: false, error: 'Token appears to be too short' };
        }
        
        // Check for valid characters (alphanumeric)
        if (!/^[a-zA-Z0-9]+$/.test(token)) {
            return { valid: false, error: 'Token contains invalid characters' };
        }
        
        return { valid: true };
    }
    
    /**
     * Set API token and validate it
     */
    async setToken(token) {
        const validation = this.validateToken(token);
        if (!validation.valid) {
            throw new Error(validation.error);
        }
        
        this.apiToken = token;
        
        // Test the token by making an API call
        try {
            const userInfo = await this.getCurrentUser();
            this.userInfo = userInfo;
            this.saveConfiguration();
            
            if (window.DebugLogger) {
                window.DebugLogger.info('api-client', 'Token validated and user info retrieved', {
                    userId: userInfo?.data?.user?.id,
                    userName: `${userInfo?.data?.user?.first_name} ${userInfo?.data?.user?.last_name}`,
                    email: userInfo?.data?.user?.email
                });
            }
            
            return userInfo;
        } catch (error) {
            // Clear invalid token
            this.apiToken = null;
            this.userInfo = null;
            throw error;
        }
    }
    
    /**
     * Make authenticated API request
     */
    async makeRequest(endpoint, options = {}) {
        if (!this.apiToken) {
            throw new Error('No API token configured. Please set up authentication first.');
        }
        
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiToken}`,
            'Accept': 'application/json',
            ...options.headers
        };
        
        const requestOptions = {
            method: 'GET',
            headers,
            ...options
        };
        
        if (window.DebugLogger) {
            window.DebugLogger.debug('api-client', 'Making API request', {
                url,
                method: requestOptions.method,
                hasAuth: !!this.apiToken
            });
        }
        
        try {
            const response = await fetch(url, requestOptions);
            
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                
                try {
                    const errorData = JSON.parse(errorText);
                    if (errorData.message) {
                        errorMessage = errorData.message;
                    } else if (errorData.errors && errorData.errors.length > 0) {
                        errorMessage = errorData.errors.join(', ');
                    }
                } catch (parseError) {
                    // Use default error message if JSON parsing fails
                }
                
                if (window.DebugLogger) {
                    window.DebugLogger.error('api-client', 'API request failed', {
                        url,
                        status: response.status,
                        statusText: response.statusText,
                        errorMessage
                    });
                }
                
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            
            if (window.DebugLogger) {
                window.DebugLogger.debug('api-client', 'API request successful', {
                    url,
                    hasData: !!data,
                    dataKeys: Object.keys(data || {})
                });
            }
            
            return data;
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error: Please check your internet connection');
            }
            throw error;
        }
    }
    
    /**
     * Get current user information
     */
    async getCurrentUser() {
        return await this.makeRequest('/users');
    }
    
    /**
     * Get user data for ticket validation (if needed in the future)
     */
    async getUserData() {
        // This method could be expanded to fetch user-specific data
        // for ticket validation if the API provides such functionality
        return this.userInfo;
    }
    
    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.apiToken && !!this.userInfo;
    }
    
    /**
     * Get user info
     */
    getUserInfo() {
        return this.userInfo;
    }
    
    /**
     * Enable online mode
     */
    enableOnlineMode() {
        this.isOnlineMode = true;
        this.saveConfiguration();
        
        if (window.DebugLogger) {
            window.DebugLogger.info('api-client', 'Online mode enabled');
        }
        
        // Trigger mode change event
        this.triggerModeChange();
    }
    
    /**
     * Enable offline mode
     */
    enableOfflineMode() {
        this.isOnlineMode = false;
        this.saveConfiguration();
        
        if (window.DebugLogger) {
            window.DebugLogger.info('api-client', 'Offline mode enabled');
        }
        
        // Trigger mode change event
        this.triggerModeChange();
    }
    
    /**
     * Check if in online mode
     */
    isOnline() {
        return this.isOnlineMode && this.isAuthenticated();
    }
    
    /**
     * Trigger mode change event
     */
    triggerModeChange() {
        const event = new CustomEvent('hydranode:modechange', {
            detail: {
                isOnline: this.isOnline(),
                isAuthenticated: this.isAuthenticated(),
                userInfo: this.userInfo
            }
        });
        window.dispatchEvent(event);
    }
    
    /**
     * Test connection to API
     */
    async testConnection() {
        if (!this.apiToken) {
            throw new Error('No API token configured');
        }
        
        try {
            await this.getCurrentUser();
            return true;
        } catch (error) {
            throw new Error(`Connection test failed: ${error.message}`);
        }
    }
}

// Create global instance
window.HydranodeAPI = new HydranodeAPIClient();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HydranodeAPIClient;
}