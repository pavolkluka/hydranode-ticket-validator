/**
 * Main Application Controller
 * Coordinates all components and handles global functionality
 */

class App {
  constructor() {
    this.initialized = false;
    this.components = {};
    this.config = {
      version: '1.0.0',
      environment: 'development',
      apiEndpoint: '/api', // Would be configurable in real app
      features: {
        offlineMode: true,
        notifications: true,
        analytics: false // Disabled for privacy
      }
    };
    
    this.init();
  }

  async init() {
    try {
      console.log('🚀 Initializing Hydranode Ticket Validator...');
      
      // Wait for DOM to be ready
      await this.waitForDOM();
      
      // Initialize core components
      await this.initializeComponents();
      
      // Setup event listeners
      this.setupGlobalEventListeners();
      
      // Check for updates
      this.checkForUpdates();
      
      // Initialize PWA features
      this.initializePWA();
      
      this.initialized = true;
      console.log('✅ Application initialized successfully');
      
      // Dispatch app ready event
      window.dispatchEvent(new CustomEvent('appready'));
      
    } catch (error) {
      console.error('❌ Failed to initialize application:', error);
      this.handleInitializationError(error);
    }
  }

  waitForDOM() {
    return new Promise((resolve) => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve);
      } else {
        resolve();
      }
    });
  }

  async initializeComponents() {
    // Initialize components in order
    const componentInitializers = [
      this.initializeTheme.bind(this),
      this.initializeI18n.bind(this),
      this.initializeValidator.bind(this),
      this.initializeUI.bind(this)
    ];

    for (const initializer of componentInitializers) {
      await initializer();
    }
  }

  async initializeTheme() {
    // Theme manager should already be initialized by theme.js
    if (window.themeManager) {
      this.components.theme = window.themeManager;
      console.log('🎨 Theme system ready');
    }
  }

  async initializeI18n() {
    // I18n manager should already be initialized by i18n.js
    if (window.i18nManager) {
      this.components.i18n = window.i18nManager;
      console.log('🌍 Internationalization system ready');
    }
  }

  async initializeValidator() {
    // Validator should already be initialized by validator.js
    if (window.ticketValidator) {
      this.components.validator = window.ticketValidator;
      console.log('🎫 Ticket validator ready');
    }
  }

  async initializeUI() {
    // Initialize UI components
    this.initializeAnimations();
    this.initializeAccessibility();
    this.initializeErrorBoundary();
    console.log('🖥️ UI components ready');
  }

  initializeAnimations() {
    // Add intersection observer for scroll animations
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '50px'
      });

      // Observe feature cards and other animatable elements
      document.querySelectorAll('.feature-card, .card, .welcome-section').forEach(el => {
        observer.observe(el);
      });
    }
  }

  initializeAccessibility() {
    // Enhanced keyboard navigation
    this.setupKeyboardNavigation();
    
    // Focus management
    this.setupFocusManagement();
    
    // Screen reader announcements
    this.setupScreenReaderSupport();
  }

  setupKeyboardNavigation() {
    // Add keyboard navigation for interactive elements
    document.addEventListener('keydown', (e) => {
      // Escape key to close modals/reset form
      if (e.key === 'Escape') {
        this.handleEscapeKey();
      }
      
      // Ctrl+/ for keyboard shortcuts help
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        this.showKeyboardShortcuts();
      }
    });
  }

  setupFocusManagement() {
    // Add focus-visible polyfill behavior
    document.addEventListener('keydown', () => {
      document.body.classList.add('using-keyboard');
    });
    
    document.addEventListener('mousedown', () => {
      document.body.classList.remove('using-keyboard');
    });
  }

  setupScreenReaderSupport() {
    // Create live region for announcements
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'live-region';
    document.body.appendChild(liveRegion);
    
    this.liveRegion = liveRegion;
  }

  announce(message) {
    if (this.liveRegion) {
      this.liveRegion.textContent = message;
      setTimeout(() => {
        this.liveRegion.textContent = '';
      }, 1000);
    }
  }

  initializeErrorBoundary() {
    // Global error handler
    window.addEventListener('error', (e) => {
      console.error('Global error:', e.error);
      this.handleError(e.error);
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason);
      this.handleError(e.reason);
    });
  }

  setupGlobalEventListeners() {
    // Theme change handler
    window.addEventListener('themechange', (e) => {
      console.log('Theme changed to:', e.detail.theme);
      this.announce(`Theme changed to ${e.detail.theme} mode`);
    });

    // Language change handler
    window.addEventListener('languagechange', (e) => {
      console.log('Language changed to:', e.detail.language);
      this.announce(`Language changed to ${this.getLanguageName(e.detail.language)}`);
    });

    // Online/offline status
    window.addEventListener('online', () => {
      console.log('App is online');
      this.announce('Connection restored');
      this.handleOnlineStatus(true);
    });

    window.addEventListener('offline', () => {
      console.log('App is offline');
      this.announce('You are now offline');
      this.handleOnlineStatus(false);
    });

    // Visibility change (tab switching)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        console.log('App hidden');
      } else {
        console.log('App visible');
        this.checkForUpdates();
      }
    });
  }

  getLanguageName(code) {
    const names = {
      'en': 'English',
      'cz': 'Czech',
      'sk': 'Slovak',
      'de': 'German',
      'es': 'Spanish'
    };
    return names[code] || code;
  }

  handleOnlineStatus(isOnline) {
    document.body.classList.toggle('app-offline', !isOnline);
    
    // Show/hide offline indicator
    let offlineIndicator = document.getElementById('offline-indicator');
    if (!isOnline && !offlineIndicator) {
      offlineIndicator = document.createElement('div');
      offlineIndicator.id = 'offline-indicator';
      offlineIndicator.className = 'offline-indicator';
      offlineIndicator.textContent = 'You are offline';
      document.body.appendChild(offlineIndicator);
    } else if (isOnline && offlineIndicator) {
      offlineIndicator.remove();
    }
  }

  initializePWA() {
    // Check if app is installed
    this.checkInstallPrompt();
    
    // Handle app install prompt
    this.setupInstallPrompt();
    
    // Check for service worker updates
    this.checkServiceWorkerUpdates();
  }

  checkInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('Install prompt available');
      e.preventDefault();
      this.installPromptEvent = e;
      this.showInstallButton();
    });
  }

  showInstallButton() {
    // Could add an install button to the UI
    console.log('App can be installed');
  }

  setupInstallPrompt() {
    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      console.log('App was installed');
      this.announce('App installed successfully');
    });
  }

  checkServiceWorkerUpdates() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service worker updated');
        this.showUpdateNotification();
      });
    }
  }

  showUpdateNotification() {
    // Show update notification
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
      <p>A new version is available!</p>
      <button onclick="window.location.reload()">Refresh</button>
    `;
    document.body.appendChild(notification);
  }

  checkForUpdates() {
    // In a real app, this would check for updates from server
    console.log('Checking for updates...');
  }

  handleEscapeKey() {
    // Clear form validation results
    if (this.components.validator) {
      this.components.validator.clearResult();
    }
    
    // Remove focus from current element
    if (document.activeElement) {
      document.activeElement.blur();
    }
  }

  showKeyboardShortcuts() {
    const shortcuts = [
      'Esc - Clear validation results',
      'Tab - Navigate between elements',
      'Enter - Submit form',
      'Ctrl+/ - Show this help'
    ];
    
    alert('Keyboard Shortcuts:\n\n' + shortcuts.join('\n'));
  }

  handleError(error) {
    console.error('Application error:', error);
    
    // Don't show error UI in development
    if (this.config.environment === 'production') {
      this.showErrorMessage('An unexpected error occurred. Please try again.');
    }
  }

  handleInitializationError(error) {
    console.error('Initialization error:', error);
    
    // Show fallback UI
    document.body.innerHTML = `
      <div class="error-container">
        <h1>Unable to load application</h1>
        <p>Please refresh the page or try again later.</p>
        <button onclick="window.location.reload()">Refresh Page</button>
      </div>
    `;
  }

  showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-toast';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  // Public API methods
  getVersion() {
    return this.config.version;
  }

  getEnvironment() {
    return this.config.environment;
  }

  isInitialized() {
    return this.initialized;
  }

  getComponent(name) {
    return this.components[name];
  }

  // Debug helpers
  debug() {
    return {
      version: this.getVersion(),
      environment: this.getEnvironment(),
      initialized: this.isInitialized(),
      components: Object.keys(this.components),
      theme: this.components.theme?.getCurrentTheme(),
      language: this.components.i18n?.getCurrentLanguage(),
      online: navigator.onLine
    };
  }
}

// Initialize the application
const app = new App();

// Make app globally accessible for debugging
window.app = app;

// Add some utility CSS for animations and error states
const style = document.createElement('style');
style.textContent = `
  .animate-in {
    animation: fadeInUp 0.6s ease-out;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  
  .offline-indicator {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #ff9800;
    color: white;
    text-align: center;
    padding: 0.5rem;
    z-index: 1000;
    font-size: 0.875rem;
  }
  
  .update-notification {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    background: var(--primary-color);
    color: white;
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
  }
  
  .update-notification button {
    background: white;
    color: var(--primary-color);
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    margin-left: 1rem;
    cursor: pointer;
  }
  
  .error-toast {
    position: fixed;
    top: 1rem;
    right: 1rem;
    background: var(--error-color);
    color: white;
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    max-width: 300px;
  }
  
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    text-align: center;
    padding: 2rem;
  }
  
  .error-container button {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    margin-top: 1rem;
    cursor: pointer;
    font-size: 1rem;
  }
  
  .using-keyboard *:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: 2px;
  }
  
  .app-offline {
    filter: grayscale(0.3);
  }
  
  @media (prefers-reduced-motion: reduce) {
    .animate-in {
      animation: none;
    }
  }
`;
document.head.appendChild(style);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { App };
}