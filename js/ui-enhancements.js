// UI Enhancement Script - Visual improvements and accessibility enhancements
// This script adds visual feedback, error handling, and accessibility improvements

class UIEnhancements {
    constructor() {
        this.initializationErrors = [];
        this.systemHealth = {
            iconLibrary: false,
            themeManager: false,
            languageManager: false,
            serviceWorker: false
        };
        this.init();
    }

    init() {
        this.setupErrorHandling();
        this.setupLoadingStates();
        this.setupAccessibilityEnhancements();
        this.setupVisualFeedback();
        this.setupComponentHealthChecks();
        this.setupKeyboardNavigation();
    }

    // Enhanced error handling with visual feedback
    setupErrorHandling() {
        // Global error handler for unhandled errors
        window.addEventListener('error', (event) => {
            this.handleComponentError('JavaScript Error', event.error?.message || 'Unknown error');
        });

        // Promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.handleComponentError('Promise Rejection', event.reason?.message || 'Unknown error');
        });
    }

    handleComponentError(component, message) {
        console.warn(`UI Enhancement: ${component} error - ${message}`);
        this.initializationErrors.push({
            component,
            message,
            timestamp: new Date().toISOString()
        });
        
        // Show subtle user feedback for critical errors
        this.showErrorNotification(component, message);
    }

    showErrorNotification(component, message) {
        // Create subtle error notification
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <span class="error-icon">⚠</span>
            <span class="error-text">Component loading issue detected</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 70px;
            right: 1rem;
            background: rgba(220, 53, 69, 0.1);
            border: 1px solid #dc3545;
            color: #dc3545;
            padding: 0.5rem 0.75rem;
            border-radius: 4px;
            font-size: 0.8rem;
            z-index: 1001;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
        `;

        document.body.appendChild(notification);
        
        // Fade in
        setTimeout(() => notification.style.opacity = '1', 10);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Component health monitoring
    setupComponentHealthChecks() {
        // Check IconLibrary
        this.checkComponent('iconLibrary', () => {
            return typeof window.IconLibrary !== 'undefined' && window.IconLibrary;
        });

        // Check ThemeManager
        this.checkComponent('themeManager', () => {
            return typeof window.ThemeManager !== 'undefined' && window.ThemeManager;
        });

        // Check LanguageManager
        this.checkComponent('languageManager', () => {
            return typeof window.LanguageManager !== 'undefined' && window.LanguageManager;
        });

        // Check Service Worker
        this.checkComponent('serviceWorker', () => {
            return 'serviceWorker' in navigator;
        });

        // Update system health status
        this.updateSystemHealthDisplay();
    }

    checkComponent(name, checkFunction) {
        try {
            const isHealthy = checkFunction();
            this.systemHealth[name] = isHealthy;
            
            if (!isHealthy) {
                this.handleComponentError(name, 'Component not available or not initialized');
            }
        } catch (error) {
            this.systemHealth[name] = false;
            this.handleComponentError(name, error.message);
        }
    }

    updateSystemHealthDisplay() {
        // Add a subtle system health indicator (only visible in debug mode)
        const debugMode = localStorage.getItem('debug') === 'true';
        if (!debugMode) return;

        const healthIndicator = document.createElement('div');
        healthIndicator.id = 'system-health-indicator';
        healthIndicator.className = 'system-health-indicator';
        
        const healthyComponents = Object.values(this.systemHealth).filter(Boolean).length;
        const totalComponents = Object.keys(this.systemHealth).length;
        const healthPercentage = Math.round((healthyComponents / totalComponents) * 100);
        
        healthIndicator.innerHTML = `
            <span class="health-icon">${healthPercentage === 100 ? '✓' : '⚠'}</span>
            <span class="health-text">System: ${healthPercentage}%</span>
        `;
        
        healthIndicator.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: ${healthPercentage === 100 ? '#198754' : '#ffc107'};
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.7rem;
            z-index: 1002;
            opacity: 0.7;
            pointer-events: none;
        `;

        document.body.appendChild(healthIndicator);
    }

    // Enhanced loading states
    setupLoadingStates() {
        this.addLoadingState = function(element) {
            if (element && !element.classList.contains('loading')) {
                element.classList.add('loading');
                element.setAttribute('aria-busy', 'true');
            }
        };

        this.removeLoadingState = function(element) {
            if (element) {
                element.classList.remove('loading');
                element.removeAttribute('aria-busy');
            }
        };
    }

    // Enhanced visual feedback
    setupVisualFeedback() {
        // Smooth transitions for all interactive elements
        const interactiveElements = document.querySelectorAll('button, input, select, [role="button"]');
        interactiveElements.forEach(element => {
            if (!element.style.transition) {
                element.style.transition = 'all 0.2s ease';
            }
        });

        // Enhanced file upload feedback
        this.setupFileUploadFeedback();
        
        // Enhanced button feedback
        this.setupButtonFeedback();
        
        // Enhanced form field feedback
        this.setupFormFieldFeedback();
    }

    setupFileUploadFeedback() {
        const fileInput = document.getElementById('fileInput');
        const uploadLabel = document.querySelector('label[for="fileInput"]');

        if (fileInput && uploadLabel) {
            fileInput.addEventListener('change', () => {
                if (fileInput.files.length > 0) {
                    this.addLoadingState(uploadLabel);
                    this.announceToScreenReader('File selected, processing...');
                }
            });

            // Remove loading state when processing is complete
            setTimeout(() => {
                this.removeLoadingState(uploadLabel);
            }, 2000);
        }
    }

    setupButtonFeedback() {
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Add click animation
                button.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    button.style.transform = '';
                }, 150);

                // Add loading state for primary actions
                if (button.classList.contains('control-button') && button.classList.contains('primary')) {
                    this.addLoadingState(button);
                    setTimeout(() => this.removeLoadingState(button), 1000);
                }
            });
        });
    }

    setupFormFieldFeedback() {
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.style.boxShadow = '0 0 0 2px rgba(248, 196, 35, 0.3)';
            });

            input.addEventListener('blur', () => {
                input.style.boxShadow = '';
            });
        });
    }

    // Accessibility enhancements
    setupAccessibilityEnhancements() {
        // Enhanced keyboard navigation
        this.setupKeyboardNavigation();
        
        // Screen reader announcements
        this.setupScreenReaderSupport();
        
        // Focus management
        this.setupFocusManagement();
        
        // ARIA enhancements
        this.setupAriaEnhancements();
    }

    setupKeyboardNavigation() {
        // Enhanced keyboard support for custom elements
        document.addEventListener('keydown', (e) => {
            // Handle options menu keyboard navigation
            if (e.key === 'Escape') {
                const activeMenu = document.querySelector('.options-menu.active');
                if (activeMenu) {
                    activeMenu.classList.remove('active');
                    document.getElementById('optionsButton')?.focus();
                }
            }

            // Handle modal keyboard navigation
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.scan-message-modal.active');
                if (activeModal) {
                    activeModal.style.display = 'none';
                    activeModal.classList.remove('active');
                }
            }
        });

        // Skip link for accessibility
        this.addSkipLink();
    }

    addSkipLink() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--primary-color);
            color: black;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1003;
            transition: top 0.3s;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });

        document.body.insertBefore(skipLink, document.body.firstChild);

        // Add id to main content
        const mainContainer = document.querySelector('.main-container');
        if (mainContainer && !mainContainer.id) {
            mainContainer.id = 'main-content';
        }
    }

    setupScreenReaderSupport() {
        // Create live region for announcements
        this.createLiveRegion();
    }

    createLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.id = 'live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
    }

    announceToScreenReader(message) {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            // Clear after announcement
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    setupFocusManagement() {
        // Trap focus in modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const activeModal = document.querySelector('.scan-message-modal.active');
                if (activeModal) {
                    this.trapFocus(e, activeModal);
                }
            }
        });
    }

    trapFocus(e, container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
        }
    }

    setupAriaEnhancements() {
        // Add missing ARIA labels
        const elementsNeedingLabels = [
            { selector: '#optionsButton', label: 'Open options menu' },
            { selector: '#themeToggle', label: 'Toggle theme' },
            { selector: '#languageSelect', label: 'Select language' },
            { selector: '#startScan', label: 'Start QR code scanner' },
            { selector: '#stopScan', label: 'Stop QR code scanner' }
        ];

        elementsNeedingLabels.forEach(({ selector, label }) => {
            const element = document.querySelector(selector);
            if (element && !element.getAttribute('aria-label') && !element.getAttribute('aria-labelledby')) {
                element.setAttribute('aria-label', label);
            }
        });

        // Improve table accessibility
        const table = document.getElementById('dataTable');
        if (table) {
            table.setAttribute('role', 'table');
            table.setAttribute('aria-label', 'Ticket data table');
        }
    }

    // Performance monitoring
    monitorPerformance() {
        if ('performance' in window) {
            const navigationTiming = performance.getEntriesByType('navigation')[0];
            if (navigationTiming) {
                const loadTime = navigationTiming.loadEventEnd - navigationTiming.loadEventStart;
                console.log(`UI Enhancement: Page load time: ${loadTime}ms`);
                
                if (loadTime > 3000) {
                    this.handleComponentError('Performance', `Slow page load: ${loadTime}ms`);
                }
            }
        }
    }

    // Graceful degradation helpers
    enableGracefulDegradation() {
        // Fallback for missing icons
        setTimeout(() => {
            const emptyIcons = document.querySelectorAll('[id$="Icon"]:empty');
            emptyIcons.forEach(iconElement => {
                if (iconElement.innerHTML.trim() === '') {
                    const iconName = iconElement.id.replace('Icon', '').toLowerCase();
                    iconElement.innerHTML = this.getFallbackIcon(iconName);
                    iconElement.style.opacity = '0.7';
                }
            });
        }, 2000);
    }

    getFallbackIcon(iconName) {
        const fallbackIcons = {
            'app': '🎫',
            'options': '⚙️',
            'upload': '📁',
            'language': '🌐',
            'theme': '🌓',
            'status': '📊',
            'scanner': '📷',
            'play': '▶️',
            'stop': '⏹️',
            'chart': '📈',
            'history': '📜',
            'export': '💾',
            'trash': '🗑️',
            'database': '💾'
        };
        return fallbackIcons[iconName] || '●';
    }
}

// Initialize UI Enhancements
document.addEventListener('DOMContentLoaded', function() {
    try {
        const uiEnhancements = new UIEnhancements();
        window.UIEnhancements = uiEnhancements;
        
        // Monitor performance
        uiEnhancements.monitorPerformance();
        
        // Enable graceful degradation after components load
        setTimeout(() => {
            uiEnhancements.enableGracefulDegradation();
        }, 3000);
        
    } catch (error) {
        console.error('UI Enhancements initialization failed:', error);
        // Basic fallback functionality
        document.body.classList.add('ui-enhancements-disabled');
    }
});

