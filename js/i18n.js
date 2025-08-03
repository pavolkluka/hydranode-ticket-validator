// Internationalization (i18n) functionality
class I18nManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.translations = {};
        this.languageSelect = document.getElementById('languageSelect');
        
        this.init();
    }
    
    async init() {
        // Load all translation files
        await this.loadTranslations();
        
        // Set initial language
        this.setLanguage(this.currentLanguage);
        
        // Add event listener
        if (this.languageSelect) {
            this.languageSelect.value = this.currentLanguage;
            this.languageSelect.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }
        
        // Notify other components that i18n is ready
        if (window.themeManager) {
            window.themeManager.applyTheme(window.themeManager.getCurrentTheme());
        }
    }
    
    async loadTranslations() {
        const languages = ['en', 'cz', 'sk', 'de', 'es'];
        
        for (const lang of languages) {
            try {
                const response = await fetch(`js/translations/${lang}.json`);
                if (response.ok) {
                    this.translations[lang] = await response.json();
                }
            } catch (error) {
                console.warn(`Failed to load translations for ${lang}:`, error);
                // Fallback to English if translations fail to load
                if (lang === 'en') {
                    this.translations[lang] = this.getDefaultTranslations();
                }
            }
        }
        
        // Ensure we have English as fallback
        if (!this.translations.en) {
            this.translations.en = this.getDefaultTranslations();
        }
    }
    
    getDefaultTranslations() {
        return {
            // Header
            "appTitle": "Hydranode Ticket Validator",
            "language": "Language",
            "theme": "Theme",
            "lightMode": "Light",
            "darkMode": "Dark",
            
            // File Upload
            "chooseFile": "Choose File",
            "supportedFormats": "(Supported .xls file: use exported report for store.)",
            
            // Scanner
            "startScanner": "Start Scanner",
            "stopScanner": "Stop Scanner",
            "enterTicketId": "Enter Ticket ID manually",
            "submit": "Submit",
            "ok": "OK",
            
            // Statistics
            "ticketStatistics": "Ticket Statistics",
            "totalTickets": "Total Tickets",
            "validTickets": "Valid Tickets",
            "duplicateTickets": "Duplicate Tickets",
            "invalidTickets": "Invalid Tickets",
            "remainingTickets": "Remaining Tickets",
            
            // Table
            "rowsPerPage": "Rows per page",
            "date": "Date",
            "time": "Time",
            "invoiceId": "Invoice ID",
            "lnurlComment": "LNURL Comment",
            
            // History
            "scanHistory": "Scan History",
            "exportHistory": "Export History",
            "clearHistory": "Clear History",
            
            // Validation Messages
            "validTicket": "Valid ticket",
            "invalidTicket": "Invalid ticket",
            "duplicateTicket": "Duplicate ticket",
            "ticketNotFound": "Ticket not found",
            
            // File Processing
            "fileLoaded": "File loaded successfully",
            "fileError": "Error loading file",
            "processingFile": "Processing file...",
            
            // Scanner Messages
            "scannerStarted": "Scanner started",
            "scannerStopped": "Scanner stopped",
            "cameraError": "Camera access denied or not available",
            
            // Export/Import
            "exportComplete": "Export completed",
            "historyCleared": "History cleared",
            "noDataToExport": "No data to export"
        };
    }
    
    setLanguage(language) {
        this.currentLanguage = language;
        localStorage.setItem('language', language);
        
        if (this.languageSelect) {
            this.languageSelect.value = language;
        }
        
        this.translatePage();
    }
    
    translatePage() {
        // Translate all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => this.translateElement(element));
        
        // Translate all elements with data-i18n-placeholder attribute
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => this.translatePlaceholder(element));
    }
    
    translateElement(element) {
        const key = element.getAttribute('data-i18n');
        const translation = this.getTranslation(key);
        if (translation) {
            element.textContent = translation;
        }
    }
    
    translatePlaceholder(element) {
        const key = element.getAttribute('data-i18n-placeholder');
        const translation = this.getTranslation(key);
        if (translation) {
            element.placeholder = translation;
        }
    }
    
    getTranslation(key) {
        // Try current language first
        if (this.translations[this.currentLanguage] && this.translations[this.currentLanguage][key]) {
            return this.translations[this.currentLanguage][key];
        }
        
        // Fallback to English
        if (this.translations.en && this.translations.en[key]) {
            return this.translations.en[key];
        }
        
        // Return key if no translation found
        console.warn(`Translation not found for key: ${key}`);
        return key;
    }
    
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    // Method to translate dynamic content
    translate(key) {
        return this.getTranslation(key);
    }
}

// Initialize i18n manager when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    window.i18n = new I18nManager();
});