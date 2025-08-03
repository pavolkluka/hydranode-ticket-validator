/**
 * Theme Management System
 * Handles light/dark theme switching with localStorage persistence
 */

class ThemeManager {
  constructor() {
    this.currentTheme = 'light';
    this.themeToggleBtn = null;
    this.storageKey = 'hydranode-theme';
    
    this.init();
  }

  init() {
    // Load saved theme or detect system preference
    this.loadTheme();
    
    // Initialize theme toggle button
    this.initThemeToggle();
    
    // Listen for system theme changes
    this.watchSystemTheme();
  }

  loadTheme() {
    // Check localStorage first
    const savedTheme = localStorage.getItem(this.storageKey);
    
    if (savedTheme && ['light', 'dark'].includes(savedTheme)) {
      this.currentTheme = savedTheme;
    } else {
      // Detect system preference
      this.currentTheme = this.getSystemTheme();
    }
    
    this.applyTheme(this.currentTheme);
  }

  getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  applyTheme(theme) {
    const body = document.body;
    
    // Add transition class for smooth theme switching
    body.classList.add('theme-switching');
    
    // Apply theme
    body.setAttribute('data-theme', theme);
    
    // Update manifest theme-color for PWA
    this.updateManifestThemeColor(theme);
    
    // Update meta theme-color
    this.updateMetaThemeColor(theme);
    
    // Remove transition class after animation
    setTimeout(() => {
      body.classList.remove('theme-switching');
    }, 300);
    
    this.currentTheme = theme;
    
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('themechange', {
      detail: { theme: theme }
    }));
  }

  updateManifestThemeColor(theme) {
    const themeColor = theme === 'dark' ? '#1e1e1e' : '#1976d2';
    
    // Update meta theme-color
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeColor);
    }
  }

  updateMetaThemeColor(theme) {
    const backgroundColor = theme === 'dark' ? '#121212' : '#ffffff';
    
    // Update manifest background color if needed
    // Note: This would require dynamic manifest generation in a real app
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  setTheme(theme) {
    if (!['light', 'dark'].includes(theme)) {
      console.warn('Invalid theme:', theme);
      return;
    }
    
    this.applyTheme(theme);
    this.saveTheme(theme);
    this.updateToggleButton();
  }

  saveTheme(theme) {
    try {
      localStorage.setItem(this.storageKey, theme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
    }
  }

  initThemeToggle() {
    this.themeToggleBtn = document.getElementById('themeToggle');
    
    if (this.themeToggleBtn) {
      this.themeToggleBtn.addEventListener('click', () => {
        this.toggleTheme();
      });
      
      // Add keyboard support
      this.themeToggleBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleTheme();
        }
      });
      
      this.updateToggleButton();
    }
  }

  updateToggleButton() {
    if (!this.themeToggleBtn) return;
    
    const isLight = this.currentTheme === 'light';
    const sunIcon = this.themeToggleBtn.querySelector('.sun-icon');
    const moonIcon = this.themeToggleBtn.querySelector('.moon-icon');
    
    if (sunIcon && moonIcon) {
      sunIcon.style.display = isLight ? 'block' : 'none';
      moonIcon.style.display = isLight ? 'none' : 'block';
    }
    
    // Update aria-label for accessibility
    this.themeToggleBtn.setAttribute('aria-label', 
      isLight ? 'Switch to dark theme' : 'Switch to light theme'
    );
  }

  watchSystemTheme() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      mediaQuery.addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        const savedTheme = localStorage.getItem(this.storageKey);
        if (!savedTheme) {
          const systemTheme = e.matches ? 'dark' : 'light';
          this.applyTheme(systemTheme);
          this.updateToggleButton();
        }
      });
    }
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  isThemeSupported() {
    // Check if CSS custom properties are supported
    return window.CSS && CSS.supports('color', 'var(--fake-var)');
  }

  // Method to get theme-aware colors for JavaScript use
  getThemeColor(colorName) {
    const root = document.documentElement;
    const style = getComputedStyle(root);
    return style.getPropertyValue(`--${colorName}`).trim();
  }

  // Method to dynamically update theme colors
  setThemeColor(colorName, value) {
    document.documentElement.style.setProperty(`--${colorName}`, value);
  }
}

// Utility functions for theme-related operations
const ThemeUtils = {
  // Check if user prefers reduced motion
  prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Check if user prefers high contrast
  prefersHighContrast() {
    return window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches;
  },

  // Get color with opacity
  getColorWithOpacity(color, opacity) {
    // Convert hex to rgba or add opacity to css color
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color; // Return as-is if not hex
  },

  // Apply smooth transitions only if user allows motion
  applyTransition(element, property, duration = '0.3s') {
    if (!this.prefersReducedMotion()) {
      element.style.transition = `${property} ${duration} ease-in-out`;
    }
  }
};

// Initialize theme manager when DOM is ready
let themeManager;

function initTheme() {
  themeManager = new ThemeManager();
  
  // Make it globally accessible for debugging
  window.themeManager = themeManager;
}

// Auto-initialize if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTheme);
} else {
  initTheme();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ThemeManager, ThemeUtils };
}