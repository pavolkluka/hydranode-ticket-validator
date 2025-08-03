// Theme management functionality
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = document.getElementById('themeIcon');
        this.themeText = document.getElementById('themeText');
        this.appLogo = document.getElementById('appLogo');
        
        this.init();
    }
    
    init() {
        // Set initial theme
        this.applyTheme(this.currentTheme);
        
        // Add event listener
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // Update manifest icons based on theme
        this.updateManifestIcons();
    }
    
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
    }
    
    applyTheme(theme) {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            if (this.themeIcon) this.themeIcon.textContent = '☀️';
            if (this.themeText) {
                this.themeText.setAttribute('data-i18n', 'lightMode');
                this.themeText.textContent = 'Light'; // Fallback text
            }
            if (this.appLogo) this.appLogo.src = 'logos/hydranode-horizontal-light.png';
        } else {
            document.documentElement.removeAttribute('data-theme');
            if (this.themeIcon) this.themeIcon.textContent = '🌙';
            if (this.themeText) {
                this.themeText.setAttribute('data-i18n', 'darkMode');
                this.themeText.textContent = 'Dark'; // Fallback text
            }
            if (this.appLogo) this.appLogo.src = 'logos/hydranode-horizontal-dark.png';
        }
        
        // Update favicon based on theme
        this.updateFavicon(theme);
        
        // Update manifest theme color
        this.updateManifestTheme(theme);
        
        // Re-translate theme text if i18n is available
        if (window.i18n && this.themeText) {
            window.i18n.translateElement(this.themeText);
        }
    }
    
    updateFavicon(theme) {
        // Update favicon to match theme
        const favicon = document.querySelector('link[rel="icon"]');
        if (favicon) {
            // You can update this to use the appropriate icons if needed
            const iconPath = theme === 'light' ? 
                'icons/icon-light-96x96.png' : 
                'icons/icon-dark-96x96.png';
            
            // For now, keep the existing favicon
            // favicon.href = iconPath;
        }
    }
    
    updateManifestIcons() {
        // Update manifest.json icons dynamically if needed
        // This would require server-side support or dynamic manifest generation
    }
    
    updateManifestTheme(theme) {
        // Update theme color meta tag
        const themeColorMeta = document.querySelector('meta[name="theme-color"]');
        if (themeColorMeta) {
            themeColorMeta.content = theme === 'light' ? '#ffffff' : '#000000';
        }
    }
    
    getCurrentTheme() {
        return this.currentTheme;
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.themeManager = new ThemeManager();
});