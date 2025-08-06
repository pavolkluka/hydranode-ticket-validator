/**
 * Hydranode API Client
 * Handles authentication and communication with Hydranode platform REST API
 */

class HydranodeAPIClient {
    constructor() {
        this.baseURL = 'https://management.hydranode.net/api';
        this.apiToken = null;
        this.userInfo = null;
        this.isAuthenticated = false;
        this.isOnlineMode = false;
        
        // Initialize from stored configuration
        this.loadConfiguration();
    }
    
    /**
     * Load API configuration from localStorage
     */
    loadConfiguration() {
        try {
            const config = localStorage.getItem('hydranode_api_config');
            if (config) {
                const parsedConfig = JSON.parse(config);
                this.apiToken = parsedConfig.token;
                this.userInfo = parsedConfig.userInfo;
                this.isAuthenticated = parsedConfig.isAuthenticated || false;
                this.isOnlineMode = parsedConfig.isOnlineMode || false;
                
                if (window.DebugLogger) {
                    window.DebugLogger.info('api-client', 'Configuration loaded from storage', {
                        hasToken: !!this.apiToken,
                        isAuthenticated: this.isAuthenticated,
                        isOnlineMode: this.isOnlineMode,
                        userEmail: this.userInfo?.email
                    });
                }
            }
        } catch (error) {
            console.error('Error loading API configuration:', error);
            if (window.DebugLogger) {
                window.DebugLogger.error('api-client', 'Failed to load configuration', error);
            }
        }
    }
    
    /**
     * Save API configuration to localStorage
     */
    saveConfiguration() {
        try {
            const config = {
                token: this.apiToken,
                userInfo: this.userInfo,
                isAuthenticated: this.isAuthenticated,
                isOnlineMode: this.isOnlineMode
            };
            localStorage.setItem('hydranode_api_config', JSON.stringify(config));
            
            if (window.DebugLogger) {
                window.DebugLogger.info('api-client', 'Configuration saved to storage', {
                    hasToken: !!this.apiToken,
                    isAuthenticated: this.isAuthenticated,
                    isOnlineMode: this.isOnlineMode
                });
            }
        } catch (error) {
            console.error('Error saving API configuration:', error);
            if (window.DebugLogger) {
                window.DebugLogger.error('api-client', 'Failed to save configuration', error);
            }
        }
    }
    
    /**
     * Set API token
     * @param {string} token - The API token
     */
    setToken(token) {
        if (!token || typeof token !== 'string') {
            throw new Error('Invalid API token provided');
        }
        
        // Basic token validation
        const cleanToken = token.trim();
        if (cleanToken.length < 10) {
            throw new Error('API token appears to be too short');
        }
        
        this.apiToken = cleanToken;
        this.isAuthenticated = false; // Reset authentication status
        
        if (window.DebugLogger) {
            window.DebugLogger.info('api-client', 'API token set', {
                tokenLength: cleanToken.length,
                tokenPrefix: cleanToken.substring(0, 8) + '...'
            });
        }
    }
    
    /**
     * Clear API configuration
     */
    clearConfiguration() {
        this.apiToken = null;
        this.userInfo = null;
        this.isAuthenticated = false;
        this.isOnlineMode = false;
        
        try {
            localStorage.removeItem('hydranode_api_config');
        } catch (error) {
            console.error('Error clearing configuration:', error);
        }
        
        if (window.DebugLogger) {
            window.DebugLogger.info('api-client', 'Configuration cleared');
        }
    }
    
    /**
     * Test API connection without authentication
     * @returns {Promise<boolean>} - Connection test result
     */
    async testConnection() {
        if (!this.apiToken) {
            throw new Error('API token is required for connection test');
        }
        
        try {
            if (window.DebugLogger) {
                window.DebugLogger.info('api-client', 'Testing API connection');
            }
            
            const response = await fetch(`${this.baseURL}/users`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            // Connection successful if we get any response (even error responses)
            const connectionSuccessful = response.status !== 0;
            
            if (window.DebugLogger) {
                window.DebugLogger.info('api-client', 'Connection test completed', {
                    successful: connectionSuccessful,
                    status: response.status,
                    statusText: response.statusText
                });
            }
            
            return connectionSuccessful;
        } catch (error) {
            if (window.DebugLogger) {
                window.DebugLogger.error('api-client', 'Connection test failed', error);
            }
            throw new Error(`Connection test failed: ${error.message}`);
        }
    }
    
    /**
     * Authenticate with the API and fetch user information
     * @returns {Promise<Object>} - User information
     */
    async authenticate() {
        if (!this.apiToken) {
            throw new Error('API token is required for authentication');
        }
        
        try {
            if (window.DebugLogger) {
                window.DebugLogger.info('api-client', 'Starting authentication');
            }
            
            const response = await fetch(`${this.baseURL}/users`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = `Authentication failed (${response.status}: ${response.statusText})`;
                
                try {
                    const errorData = JSON.parse(errorText);
                    if (errorData.message) {
                        errorMessage = errorData.message;
                    }
                } catch (parseError) {
                    // Use the status-based error message
                }
                
                if (window.DebugLogger) {
                    window.DebugLogger.error('api-client', 'Authentication failed', {
                        status: response.status,
                        statusText: response.statusText,
                        errorText: errorText
                    });
                }
                
                throw new Error(errorMessage);
            }
            
            const data = await response.json();
            
            // Validate response structure
            if (!data || !data.data || !data.data.user) {
                throw new Error('Invalid response format from API');
            }
            
            const user = data.data.user;
            
            // Validate required user fields
            if (!user.id || !user.first_name || !user.last_name || !user.email) {
                throw new Error('Incomplete user information received from API');
            }
            
            this.userInfo = user;
            this.isAuthenticated = true;
            this.saveConfiguration();
            
            if (window.DebugLogger) {
                window.DebugLogger.info('api-client', 'Authentication successful', {
                    userId: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    emailVerified: user.email_is_verified
                });
            }
            
            return user;
        } catch (error) {
            this.isAuthenticated = false;
            this.userInfo = null;
            
            if (window.DebugLogger) {
                window.DebugLogger.error('api-client', 'Authentication error', error);
            }
            
            throw error;
        }
    }
    
    /**
     * Get current user information
     * @returns {Object|null} - User information or null if not authenticated
     */
    getUserInfo() {
        return this.userInfo;
    }
    
    /**
     * Check if user is currently authenticated
     * @returns {boolean} - Authentication status
     */
    isUserAuthenticated() {
        return this.isAuthenticated && this.userInfo !== null;
    }
    
    /**
     * Get personalized welcome message
     * @returns {string} - Welcome message
     */
    getWelcomeMessage() {
        if (!this.isAuthenticated || !this.userInfo) {
            return 'Welcome';
        }
        
        return `Vitajte, ${this.userInfo.first_name} ${this.userInfo.last_name}`;
    }
    
    /**
     * Set online mode
     * @param {boolean} enabled - Whether online mode is enabled
     */
    setOnlineMode(enabled) {
        this.isOnlineMode = enabled;
        this.saveConfiguration();
        
        if (window.DebugLogger) {
            window.DebugLogger.info('api-client', 'Online mode changed', {
                enabled: enabled,
                isAuthenticated: this.isAuthenticated
            });
        }
    }
    
    /**
     * Check if online mode is enabled
     * @returns {boolean} - Online mode status
     */
    isOnlineModeEnabled() {
        return this.isOnlineMode;
    }
    
    /**
     * Get API status information
     * @returns {Object} - Status information
     */
    getStatus() {
        return {
            isOnlineMode: this.isOnlineMode,
            hasToken: !!this.apiToken,
            isAuthenticated: this.isAuthenticated,
            userInfo: this.userInfo
        };
    }
    
    /**
     * Validate API token format
     * @param {string} token - Token to validate
     * @returns {Object} - Validation result
     */
    static validateToken(token) {
        if (!token || typeof token !== 'string') {
            return {
                valid: false,
                error: 'Token must be a non-empty string'
            };
        }
        
        const cleanToken = token.trim();
        
        if (cleanToken.length === 0) {
            return {
                valid: false,
                error: 'Token cannot be empty'
            };
        }
        
        if (cleanToken.length < 10) {
            return {
                valid: false,
                error: 'Token appears to be too short'
            };
        }
        
        if (cleanToken.length > 200) {
            return {
                valid: false,
                error: 'Token appears to be too long'
            };
        }
        
        // Check for valid characters (alphanumeric and some special chars)
        if (!/^[a-zA-Z0-9_\-\.]+$/.test(cleanToken)) {
            return {
                valid: false,
                error: 'Token contains invalid characters'
            };
        }
        
        return {
            valid: true,
            error: null
        };
    }
}

// Create global instance
window.HydranodeAPI = new HydranodeAPIClient();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HydranodeAPIClient;
}