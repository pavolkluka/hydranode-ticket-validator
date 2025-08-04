// Theme System for Hydranode Ticket Validator
// Supports light and dark themes with current dominant colors

class ThemeManager {
    constructor() {
        this.currentTheme = 'dark';
        this.callbacks = [];
        this.themes = {
            light: {
                '--primary-color': '#f8c423',
                '--background-color': '#ffffff',
                '--card-background': '#f8f9fa',
                '--text-primary': '#212529',
                '--text-secondary': '#6c757d',
                '--border-color': '#dee2e6',
                '--success-color': '#198754',
                '--warning-color': '#ffc107',
                '--danger-color': '#dc3545',
                '--info-color': '#0d6efd',
                '--hover-bg': '#e9ecef',
                '--shadow': '0 2px 4px rgba(0, 0, 0, 0.1)',
                '--shadow-lg': '0 4px 8px rgba(0, 0, 0, 0.15)',
                '--modal-backdrop': 'rgba(0, 0, 0, 0.5)'
            },
            dark: {
                '--primary-color': '#f8c423',
                '--background-color': '#000000',
                '--card-background': '#212529',
                '--text-primary': '#f8c423',
                '--text-secondary': '#c3c3c3',
                '--border-color': '#444',
                '--success-color': '#198754',
                '--warning-color': '#ffc107',
                '--danger-color': '#dc3545',
                '--info-color': '#0d6efd',
                '--hover-bg': '#2c3136',
                '--shadow': '0 2px 4px rgba(0, 0, 0, 0.3)',
                '--shadow-lg': '0 4px 8px rgba(0, 0, 0, 0.4)',
                '--modal-backdrop': 'rgba(0, 0, 0, 0.9)'
            }
        };
        this.init();
    }

    init() {
        this.setTheme(this.getSavedTheme() || 'dark');
        this.detectSystemThemePreference();
    }

    getSavedTheme() {
        try {
            return localStorage.getItem('selectedTheme') || null;
        } catch (error) {
            console.error('Error loading saved theme:', error);
            return null;
        }
    }

    saveTheme(theme) {
        try {
            localStorage.setItem('selectedTheme', theme);
        } catch (error) {
            console.error('Error saving theme:', error);
        }
    }

    detectSystemThemePreference() {
        if (window.matchMedia && !this.getSavedTheme()) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setTheme(prefersDark ? 'dark' : 'light');
            
            // Listen for system theme changes
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!this.getSavedTheme()) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    setTheme(theme) {
        if (this.themes[theme]) {
            this.currentTheme = theme;
            this.saveTheme(theme);
            this.applyTheme();
            this.updateMetaThemeColor();
            this.notifyCallbacks();
        }
    }

    applyTheme() {
        const root = document.documentElement;
        const themeColors = this.themes[this.currentTheme];
        
        Object.keys(themeColors).forEach(property => {
            root.style.setProperty(property, themeColors[property]);
        });

        // Add theme class to body for specific styling needs
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${this.currentTheme}`);
    }

    updateMetaThemeColor() {
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
            themeColorMeta.content = this.themes[this.currentTheme]['--primary-color'];
        }
    }

    getCurrentTheme() {
        return this.currentTheme;
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        return newTheme;
    }

    isDarkTheme() {
        return this.currentTheme === 'dark';
    }

    isLightTheme() {
        return this.currentTheme === 'light';
    }

    registerCallback(callback) {
        if (typeof callback === 'function') {
            this.callbacks.push(callback);
        }
    }

    notifyCallbacks() {
        this.callbacks.forEach(callback => {
            try {
                callback(this.currentTheme);
            } catch (error) {
                console.error('Error in theme callback:', error);
            }
        });
    }

    getThemeColors(theme = null) {
        theme = theme || this.currentTheme;
        return this.themes[theme] || this.themes.dark;
    }

    // Utility methods for theme-aware animations and effects
    getAnimationDuration() {
        // Respect user's motion preferences
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        return prefersReducedMotion ? '0ms' : '300ms';
    }

    updateThemeSpecificElements() {
        // Update SVG icons that need theme-specific colors
        this.updateSVGIcons();
        
        // Update any canvas elements that need redrawing
        this.updateCanvasElements();
    }

    updateSVGIcons() {
        const svgIcons = document.querySelectorAll('.theme-svg');
        svgIcons.forEach(svg => {
            const primaryColor = this.themes[this.currentTheme]['--primary-color'];
            const textColor = this.themes[this.currentTheme]['--text-primary'];
            
            // Update SVG fills and strokes based on theme
            svg.querySelectorAll('[fill]').forEach(element => {
                if (element.getAttribute('fill') !== 'none') {
                    element.setAttribute('fill', element.hasAttribute('data-primary') ? primaryColor : textColor);
                }
            });
        });
    }

    updateCanvasElements() {
        // Trigger redraw of canvas elements that depend on theme colors
        const event = new CustomEvent('themeChanged', {
            detail: { theme: this.currentTheme, colors: this.themes[this.currentTheme] }
        });
        window.dispatchEvent(event);
    }

    // Method to create theme-aware animations
    createThemeTransition(element, duration = null) {
        if (!element) return;
        
        duration = duration || this.getAnimationDuration();
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            return;
        }

        element.style.transition = `all ${duration} ease-in-out`;
        
        // Remove transition after animation completes
        setTimeout(() => {
            if (element.style) {
                element.style.transition = '';
            }
        }, parseInt(duration) || 300);
    }
}

// Create global instance
const themeManager = new ThemeManager();

// Export for use in other scripts
window.ThemeManager = themeManager;

// Listen for theme changes and update UI accordingly
themeManager.registerCallback((theme) => {
    // Update theme-specific UI elements
    themeManager.updateThemeSpecificElements();
    
    // Announce theme change to screen readers
    if (typeof window.UIEnhancements !== 'undefined' && window.UIEnhancements.announceToScreenReader) {
        const themeName = theme === 'dark' ? 'Dark' : 'Light';
        window.UIEnhancements.announceToScreenReader(`Switched to ${themeName} theme`);
    }
});

// Apply initial theme on load
document.addEventListener('DOMContentLoaded', () => {
    themeManager.applyTheme();
});