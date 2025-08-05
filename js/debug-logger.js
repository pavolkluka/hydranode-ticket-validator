/**
 * Hydranode Ticket Validator - Debug Logger Service
 * Comprehensive debug logging system with privacy protection and data sanitization
 */

class DebugLogger {
    constructor() {
        this.enabled = false;
        this.maxLogEntries = 1000;
        this.storageKey = 'hydranode-debug-logs';
        this.settingsKey = 'hydranode-debug-settings';
        this.logs = [];
        this.sensitiveDataPatterns = [
            /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email addresses
            /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, // Credit card numbers
            /ssn[\s:=]\d{3}-?\d{2}-?\d{4}/gi, // Social Security Numbers
            /password[\s:=][^\s,}]+/gi, // Passwords
            /token[\s:=][^\s,}]+/gi, // Tokens
            /key[\s:=][^\s,}]+/gi, // API keys
            /secret[\s:=][^\s,}]+/gi, // Secrets
            /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g // IP addresses
        ];
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.loadLogs();
        this.setupErrorHandling();
        this.setupPerformanceLogging();
        
        // Log initialization
        if (this.enabled) {
            this.log('system', 'Debug logger initialized', {
                maxEntries: this.maxLogEntries,
                timestamp: new Date().toISOString()
            });
        }
    }

    loadSettings() {
        try {
            const settings = localStorage.getItem(this.settingsKey);
            if (settings) {
                const parsed = JSON.parse(settings);
                this.enabled = parsed.enabled || false;
                this.maxLogEntries = parsed.maxLogEntries || 1000;
            }
        } catch (error) {
            console.warn('Failed to load debug settings:', error);
        }
    }

    saveSettings() {
        try {
            const settings = {
                enabled: this.enabled,
                maxLogEntries: this.maxLogEntries
            };
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
        } catch (error) {
            console.warn('Failed to save debug settings:', error);
        }
    }

    loadLogs() {
        try {
            const logs = localStorage.getItem(this.storageKey);
            if (logs) {
                this.logs = JSON.parse(logs);
                // Ensure logs don't exceed max entries
                if (this.logs.length > this.maxLogEntries) {
                    this.logs = this.logs.slice(-this.maxLogEntries);
                    this.saveLogs();
                }
            }
        } catch (error) {
            console.warn('Failed to load debug logs:', error);
            this.logs = [];
        }
    }

    saveLogs() {
        try {
            // Keep only the most recent entries
            if (this.logs.length > this.maxLogEntries) {
                this.logs = this.logs.slice(-this.maxLogEntries);
            }
            localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
        } catch (error) {
            console.warn('Failed to save debug logs:', error);
        }
    }

    sanitizeData(data) {
        if (typeof data !== 'string') {
            data = JSON.stringify(data, null, 2);
        }

        // Apply sensitive data patterns
        let sanitized = data;
        this.sensitiveDataPatterns.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '[REDACTED]');
        });

        // Additional sanitization for common sensitive fields
        const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'credential'];
        sensitiveFields.forEach(field => {
            const regex = new RegExp(`"${field}"\\s*:\\s*"[^"]*"`, 'gi');
            sanitized = sanitized.replace(regex, `"${field}": "[REDACTED]"`);
        });

        return sanitized;
    }

    log(category, message, data = null, level = 'info') {
        if (!this.enabled) return;

        const timestamp = new Date().toISOString();
        const logEntry = {
            id: this.generateId(),
            timestamp,
            category,
            level,
            message: this.sanitizeData(message),
            data: data ? this.sanitizeData(data) : null,
            userAgent: navigator.userAgent,
            url: window.location.href,
            sessionId: this.getSessionId()
        };

        this.logs.push(logEntry);
        this.saveLogs();

        // Also log to console if enabled
        const consoleMethod = console[level] || console.log;
        consoleMethod(`[DEBUG-${category.toUpperCase()}]`, message, data || '');
    }

    error(category, message, error = null) {
        const errorData = error ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
            fileName: error.fileName,
            lineNumber: error.lineNumber,
            columnNumber: error.columnNumber
        } : null;

        this.log(category, message, errorData, 'error');
    }

    warn(category, message, data = null) {
        this.log(category, message, data, 'warn');
    }

    info(category, message, data = null) {
        this.log(category, message, data, 'info');
    }

    debug(category, message, data = null) {
        this.log(category, message, data, 'debug');
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('debug-session-id');
        if (!sessionId) {
            sessionId = this.generateId();
            sessionStorage.setItem('debug-session-id', sessionId);
        }
        return sessionId;
    }

    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (event) => {
            this.error('global', 'Unhandled JavaScript error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.error('promise', 'Unhandled promise rejection', {
                reason: event.reason,
                promise: event.promise
            });
        });
    }

    setupPerformanceLogging() {
        // Log performance metrics
        if (window.performance && window.performance.timing) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.timing;
                    const loadTime = perfData.loadEventEnd - perfData.navigationStart;
                    const domReady = perfData.domContentLoadedEventEnd - perfData.navigationStart;
                    
                    this.info('performance', 'Page load metrics', {
                        loadTime: loadTime + 'ms',
                        domReady: domReady + 'ms',
                        timestamp: new Date().toISOString()
                    });
                }, 1000);
            });
        }

        // Log navigation performance
        if (window.performance && window.performance.getEntriesByType) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const navEntries = performance.getEntriesByType('navigation');
                    if (navEntries.length > 0) {
                        const nav = navEntries[0];
                        this.info('performance', 'Navigation timing', {
                            domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart + 'ms',
                            loadComplete: nav.loadEventEnd - nav.loadEventStart + 'ms',
                            transferSize: nav.transferSize,
                            type: nav.type
                        });
                    }
                }, 1500);
            });
        }
    }

    enable() {
        this.enabled = true;
        this.saveSettings();
        this.log('system', 'Debug logging enabled', {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        });
    }

    disable() {
        this.log('system', 'Debug logging disabled', {
            timestamp: new Date().toISOString()
        });
        this.enabled = false;
        this.saveSettings();
    }

    isEnabled() {
        return this.enabled;
    }

    clearLogs() {
        const clearedCount = this.logs.length;
        this.logs = [];
        localStorage.removeItem(this.storageKey);
        
        if (this.enabled) {
            this.log('system', 'Debug logs cleared', {
                clearedCount,
                timestamp: new Date().toISOString()
            });
        }
        
        return clearedCount;
    }

    getLogs(category = null, level = null, limit = null) {
        let filteredLogs = [...this.logs];

        if (category) {
            filteredLogs = filteredLogs.filter(log => log.category === category);
        }

        if (level) {
            filteredLogs = filteredLogs.filter(log => log.level === level);
        }

        if (limit && limit > 0) {
            filteredLogs = filteredLogs.slice(-limit);
        }

        return filteredLogs;
    }

    getLogStats() {
        const stats = {
            total: this.logs.length,
            enabled: this.enabled,
            categories: {},
            levels: {},
            lastLogTime: null,
            sessionId: this.getSessionId(),
            storageSize: this.getStorageSize()
        };

        this.logs.forEach(log => {
            // Count by category
            stats.categories[log.category] = (stats.categories[log.category] || 0) + 1;
            
            // Count by level
            stats.levels[log.level] = (stats.levels[log.level] || 0) + 1;
            
            // Track last log time
            if (!stats.lastLogTime || log.timestamp > stats.lastLogTime) {
                stats.lastLogTime = log.timestamp;
            }
        });

        return stats;
    }

    getStorageSize() {
        try {
            const logs = localStorage.getItem(this.storageKey);
            return logs ? new Blob([logs]).size : 0;
        } catch (error) {
            return 0;
        }
    }

    exportLogs(format = 'json') {
        const stats = this.getLogStats();
        const exportData = {
            metadata: {
                exportedAt: new Date().toISOString(),
                appName: 'Hydranode Ticket Validator',
                version: '1.0.0',
                totalLogs: stats.total,
                categories: stats.categories,
                levels: stats.levels,
                sessionId: stats.sessionId
            },
            logs: this.logs
        };

        let content, mimeType, filename;

        switch (format.toLowerCase()) {
            case 'json':
                content = JSON.stringify(exportData, null, 2);
                mimeType = 'application/json';
                filename = `hydranode-debug-logs-${this.formatDateForFilename()}.json`;
                break;
            
            case 'txt':
                content = this.formatLogsAsText(exportData);
                mimeType = 'text/plain';
                filename = `hydranode-debug-logs-${this.formatDateForFilename()}.txt`;
                break;
            
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }

        return {
            content,
            mimeType,
            filename,
            size: new Blob([content]).size
        };
    }

    formatLogsAsText(exportData) {
        let text = `Hydranode Ticket Validator - Debug Logs\n`;
        text += `===========================================\n\n`;
        text += `Export Date: ${exportData.metadata.exportedAt}\n`;
        text += `Total Logs: ${exportData.metadata.totalLogs}\n`;
        text += `Session ID: ${exportData.metadata.sessionId}\n\n`;

        text += `Categories:\n`;
        Object.entries(exportData.metadata.categories).forEach(([category, count]) => {
            text += `  ${category}: ${count} entries\n`;
        });
        text += `\n`;

        text += `Log Levels:\n`;
        Object.entries(exportData.metadata.levels).forEach(([level, count]) => {
            text += `  ${level.toUpperCase()}: ${count} entries\n`;
        });
        text += `\n`;

        text += `Log Entries:\n`;
        text += `============\n\n`;

        exportData.logs.forEach((log, index) => {
            text += `[${index + 1}] ${log.timestamp} [${log.level.toUpperCase()}] [${log.category}]\n`;
            text += `Message: ${log.message}\n`;
            if (log.data) {
                text += `Data: ${typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}\n`;
            }
            text += `URL: ${log.url}\n`;
            text += `Session: ${log.sessionId}\n`;
            text += `---\n\n`;
        });

        return text;
    }

    formatDateForFilename() {
        const now = new Date();
        return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    }

    downloadLogs(format = 'json') {
        try {
            const exportResult = this.exportLogs(format);
            
            const blob = new Blob([exportResult.content], { type: exportResult.mimeType });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = exportResult.filename;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            this.log('system', 'Debug logs exported', {
                format,
                filename: exportResult.filename,
                size: exportResult.size + ' bytes',
                timestamp: new Date().toISOString()
            });
            
            return exportResult;
        } catch (error) {
            this.error('system', 'Failed to export debug logs', error);
            throw error;
        }
    }
}

// Create global instance
window.DebugLogger = new DebugLogger();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DebugLogger;
}