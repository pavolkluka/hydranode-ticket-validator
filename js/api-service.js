// Hydranode API Service Module
// Handles communication with Hydranode management API

class HydranodeAPIService {
    constructor() {
        this.baseURL = 'https://management.hydranode.net/api';
        this.currentToken = null;
        this.userData = null;
        this.isOnline = false;
        this.callbacks = [];
        this.retryDelay = 1000;
        this.maxRetries = 3;
        
        this.init();
    }

    init() {
        this.loadSavedToken();
        this.setupNetworkMonitoring();
        
        if (window.DebugLogger) {
            window.DebugLogger.info('api-service', 'HydranodeAPIService initialized', {
                baseURL: this.baseURL,
                hasToken: !!this.currentToken,
                isOnline: this.isOnline
            });
        }
    }

    // Token Management
    loadSavedToken() {
        try {
            const saved = localStorage.getItem('hydranode_api_token');
            if (saved) {
                this.currentToken = saved;
                if (window.DebugLogger) {
                    window.DebugLogger.info('api-service', 'API token loaded from storage');
                }
            }
        } catch (error) {
            console.error('Error loading saved API token:', error);
            if (window.DebugLogger) {
                window.DebugLogger.error('api-service', 'Failed to load saved API token', error);
            }
        }
    }

    saveToken(token) {
        try {
            localStorage.setItem('hydranode_api_token', token);
            this.currentToken = token;
            
            if (window.DebugLogger) {
                window.DebugLogger.info('api-service', 'API token saved to storage');
            }
        } catch (error) {
            console.error('Error saving API token:', error);
            if (window.DebugLogger) {
                window.DebugLogger.error('api-service', 'Failed to save API token', error);
            }
            throw new Error('Failed to save API token');
        }
    }

    clearToken() {
        try {
            localStorage.removeItem('hydranode_api_token');
            this.currentToken = null;
            this.userData = null;
            
            if (window.DebugLogger) {
                window.DebugLogger.info('api-service', 'API token cleared from storage');
            }
        } catch (error) {
            console.error('Error clearing API token:', error);
            if (window.DebugLogger) {
                window.DebugLogger.error('api-service', 'Failed to clear API token', error);
            }
        }
    }

    // Token Validation
    validateTokenFormat(token) {
        if (!token || typeof token !== 'string') {
            return { valid: false, error: 'Token must be a non-empty string' };
        }

        // Remove whitespace
        token = token.trim();

        // Check token length (based on example: 48 characters)
        if (token.length < 40 || token.length > 60) {
            return { valid: false, error: 'Invalid token length' };
        }

        // Check for valid characters (alphanumeric)
        const validPattern = /^[A-Za-z0-9]+$/;
        if (!validPattern.test(token)) {
            return { valid: false, error: 'Token contains invalid characters' };
        }

        return { valid: true, token: token };
    }

    // Network Monitoring
    setupNetworkMonitoring() {
        this.isOnline = navigator.onLine;
        
        window.addEventListener('online', () => {
            this.isOnline = true;
            if (window.DebugLogger) {
                window.DebugLogger.info('api-service', 'Network connection restored');
            }
            this.notifyCallbacks('network', { online: true });
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            if (window.DebugLogger) {
                window.DebugLogger.warn('api-service', 'Network connection lost');
            }
            this.notifyCallbacks('network', { online: false });
        });
    }

    // API Request Helper
    async makeAPIRequest(endpoint, options = {}) {
        if (!this.isOnline) {
            throw new Error('No internet connection available');
        }

        if (!this.currentToken) {
            throw new Error('No API token available');
        }

        const url = `${this.baseURL}${endpoint}`;
        const requestOptions = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.currentToken}`,
                ...options.headers
            },
            ...options
        };

        if (window.DebugLogger) {
            window.DebugLogger.debug('api-service', 'Making API request', {
                url,
                method: requestOptions.method,
                hasToken: !!this.currentToken
            });
        }

        const response = await fetch(url, requestOptions);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(`API request failed: ${response.status} ${response.statusText}`);
            error.status = response.status;
            error.data = errorData;
            
            if (window.DebugLogger) {
                window.DebugLogger.error('api-service', 'API request failed', {
                    url,
                    status: response.status,
                    statusText: response.statusText,
                    errorData
                });
            }
            
            throw error;
        }

        const data = await response.json();
        
        if (window.DebugLogger) {
            window.DebugLogger.debug('api-service', 'API request successful', {
                url,
                status: response.status
            });
        }

        return data;
    }

    // User Authentication
    async authenticateUser(token) {
        const validation = this.validateTokenFormat(token);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        try {
            // Temporarily set token for authentication request
            const previousToken = this.currentToken;
            this.currentToken = validation.token;

            const response = await this.makeAPIRequest('/users');
            
            if (response.data && response.data.user) {
                this.userData = response.data.user;
                this.saveToken(validation.token);
                
                if (window.DebugLogger) {
                    window.DebugLogger.info('api-service', 'User authentication successful', {
                        userId: this.userData.id,
                        userEmail: this.userData.email,
                        userName: `${this.userData.first_name} ${this.userData.last_name}`
                    });
                }

                this.notifyCallbacks('auth', { success: true, user: this.userData });
                return this.userData;
            } else {
                throw new Error('Invalid API response format');
            }
            
        } catch (error) {
            // Restore previous token on failure
            this.currentToken = previousToken;
            
            if (window.DebugLogger) {
                window.DebugLogger.error('api-service', 'User authentication failed', error);
            }
            
            throw error;
        }
    }

    // Get Current User Data
    getCurrentUser() {
        return this.userData;
    }

    isAuthenticated() {
        return !!(this.currentToken && this.userData);
    }

    // Logout
    logout() {
        this.clearToken();
        this.notifyCallbacks('auth', { success: false, user: null });
        
        if (window.DebugLogger) {
            window.DebugLogger.info('api-service', 'User logged out');
        }
    }

    // Get Welcome Message
    getWelcomeMessage(language = 'en') {
        if (!this.userData) return '';
        
        const name = `${this.userData.first_name} ${this.userData.last_name}`.trim();
        
        const messages = {
            en: `Welcome, ${name}`,
            sk: `Vitajte, ${name}`,
            cz: `Vítejte, ${name}`,
            es: `Bienvenido, ${name}`
        };
        
        return messages[language] || messages.en;
    }

    // Network Status
    isNetworkOnline() {
        return this.isOnline;
    }

    // Callback Management
    registerCallback(callback) {
        if (typeof callback === 'function') {
            this.callbacks.push(callback);
        }
    }

    removeCallback(callback) {
        const index = this.callbacks.indexOf(callback);
        if (index > -1) {
            this.callbacks.splice(index, 1);
        }
    }

    notifyCallbacks(type, data) {
        this.callbacks.forEach(callback => {
            try {
                callback(type, data);
            } catch (error) {
                console.error('Error in API service callback:', error);
            }
        });
    }

    // Connection Test
    async testConnection() {
        if (!this.isOnline) {
            throw new Error('No internet connection');
        }

        try {
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                timeout: 5000
            });
            
            return response.ok;
        } catch (error) {
            if (window.DebugLogger) {
                window.DebugLogger.warn('api-service', 'Connection test failed', error);
            }
            return false;
        }
    }

    // Get API Status
    getStatus() {
        return {
            hasToken: !!this.currentToken,
            isAuthenticated: this.isAuthenticated(),
            isOnline: this.isOnline,
            userData: this.userData,
            baseURL: this.baseURL
        };
    }
}

// Create global instance
const hydranodeAPI = new HydranodeAPIService();

// Export for use in other scripts
window.HydranodeAPI = hydranodeAPI;
window.HydranodeAPIService = HydranodeAPIService;