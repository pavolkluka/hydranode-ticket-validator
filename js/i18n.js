/**
 * Internationalization (i18n) System
 * Handles multi-language support with localStorage persistence
 */

class I18nManager {
  constructor() {
    this.currentLanguage = 'en';
    this.translations = {};
    this.storageKey = 'hydranode-language';
    this.fallbackLanguage = 'en';
    this.supportedLanguages = ['en', 'cz', 'sk', 'de', 'es'];
    
    this.init();
  }

  async init() {
    // Load all translation files
    await this.loadTranslations();
    
    // Load saved language or detect browser preference
    this.loadLanguage();
    
    // Initialize language selector
    this.initLanguageSelector();
    
    // Apply initial translations
    this.applyTranslations();
  }

  async loadTranslations() {
    // Define translations inline for better performance and reliability
    this.translations = {
      en: {
        'app.title': 'Hydranode Ticket Validator',
        'welcome.title': 'Welcome to Hydranode Ticket Validator',
        'welcome.description': 'A secure and reliable web application for validating Hydranode tickets. Choose your preferred language and theme for the best experience.',
        'warning.title': 'Development Notice',
        'warning.message': 'This application is currently in development phase. Features, security, and stability are still being refined. Use at your own risk.',
        'validation.title': 'Ticket Validation',
        'validation.label': 'Enter Ticket ID:',
        'validation.placeholder': 'Enter your ticket ID here...',
        'validation.submit': 'Validate Ticket',
        'validation.validating': 'Validating...',
        'validation.success': 'Ticket is valid!',
        'validation.error': 'Invalid ticket or validation failed.',
        'validation.empty': 'Please enter a ticket ID.',
        'features.title': 'Features',
        'features.security.title': 'Secure Validation',
        'features.security.description': 'Advanced security protocols ensure your tickets are validated safely and securely.',
        'features.multilingual.title': 'Multi-language Support',
        'features.multilingual.description': 'Available in multiple languages for a better user experience.',
        'features.themes.title': 'Theme Options',
        'features.themes.description': 'Choose between light and dark themes to suit your preferences.',
        'features.responsive.title': 'Responsive Design',
        'features.responsive.description': 'Works seamlessly across all devices and screen sizes.',
        'footer.copyright': '© 2024 Hydranode. All rights reserved.',
        'footer.version': 'Version 1.0.0 - Development',
        'language.select': 'Select Language',
        'theme.toggle': 'Toggle Theme',
        'theme.light': 'Switch to light theme',
        'theme.dark': 'Switch to dark theme'
      },
      cz: {
        'app.title': 'Hydranode Validátor Vstupenek',
        'welcome.title': 'Vítejte v Hydranode Validátor Vstupenek',
        'welcome.description': 'Bezpečná a spolehlivá webová aplikace pro validaci Hydranode vstupenek. Vyberte si preferovaný jazyk a téma pro nejlepší zážitek.',
        'warning.title': 'Upozornění na Vývoj',
        'warning.message': 'Tato aplikace je aktuálně ve fázi vývoje. Funkce, bezpečnost a stabilita se stále vylepšují. Používejte na vlastní riziko.',
        'validation.title': 'Validace Vstupenky',
        'validation.label': 'Zadejte ID vstupenky:',
        'validation.placeholder': 'Zde zadejte ID vaší vstupenky...',
        'validation.submit': 'Validovat Vstupenku',
        'validation.validating': 'Validuji...',
        'validation.success': 'Vstupenka je platná!',
        'validation.error': 'Neplatná vstupenka nebo validace selhala.',
        'validation.empty': 'Prosím zadejte ID vstupenky.',
        'features.title': 'Funkce',
        'features.security.title': 'Bezpečná Validace',
        'features.security.description': 'Pokročilé bezpečnostní protokoly zajišťují bezpečnou validaci vašich vstupenek.',
        'features.multilingual.title': 'Vícejazyčná Podpora',
        'features.multilingual.description': 'Dostupné ve více jazycích pro lepší uživatelský zážitek.',
        'features.themes.title': 'Možnosti Témat',
        'features.themes.description': 'Vyberte si mezi světlým a tmavým tématem podle vašich preferencí.',
        'features.responsive.title': 'Responzivní Design',
        'features.responsive.description': 'Funguje bezproblémově na všech zařízeních a velikostech obrazovek.',
        'footer.copyright': '© 2024 Hydranode. Všechna práva vyhrazena.',
        'footer.version': 'Verze 1.0.0 - Vývoj',
        'language.select': 'Vybrat Jazyk',
        'theme.toggle': 'Přepnout Téma',
        'theme.light': 'Přepnout na světlé téma',
        'theme.dark': 'Přepnout na tmavé téma'
      },
      sk: {
        'app.title': 'Hydranode Validátor Vstupeniek',
        'welcome.title': 'Vitajte v Hydranode Validátor Vstupeniek',
        'welcome.description': 'Bezpečná a spoľahlivá webová aplikácia na validáciu Hydranode vstupeniek. Vyberte si preferovaný jazyk a tému pre najlepší zážitok.',
        'warning.title': 'Upozornenie na Vývoj',
        'warning.message': 'Táto aplikácia je momentálne vo fáze vývoja. Funkcie, bezpečnosť a stabilita sa stále vylepšujú. Používajte na vlastné riziko.',
        'validation.title': 'Validácia Vstupenky',
        'validation.label': 'Zadajte ID vstupenky:',
        'validation.placeholder': 'Tu zadajte ID vašej vstupenky...',
        'validation.submit': 'Validovať Vstupenku',
        'validation.validating': 'Validujem...',
        'validation.success': 'Vstupenka je platná!',
        'validation.error': 'Neplatná vstupenka alebo validácia zlyhala.',
        'validation.empty': 'Prosím zadajte ID vstupenky.',
        'features.title': 'Funkcie',
        'features.security.title': 'Bezpečná Validácia',
        'features.security.description': 'Pokročilé bezpečnostné protokoly zabezpečujú bezpečnú validáciu vašich vstupeniek.',
        'features.multilingual.title': 'Viacjazyčná Podpora',
        'features.multilingual.description': 'Dostupné vo viacerých jazykoch pre lepší používateľský zážitok.',
        'features.themes.title': 'Možnosti Tém',
        'features.themes.description': 'Vyberte si medzi svetlou a tmavou témou podľa vašich preferencií.',
        'features.responsive.title': 'Responzívny Dizajn',
        'features.responsive.description': 'Funguje bezproblémovo na všetkých zariadeniach a veľkostiach obrazoviek.',
        'footer.copyright': '© 2024 Hydranode. Všetky práva vyhradené.',
        'footer.version': 'Verzia 1.0.0 - Vývoj',
        'language.select': 'Vybrať Jazyk',
        'theme.toggle': 'Prepnúť Tému',
        'theme.light': 'Prepnúť na svetlú tému',
        'theme.dark': 'Prepnúť na tmavú tému'
      },
      de: {
        'app.title': 'Hydranode Ticket-Validator',
        'welcome.title': 'Willkommen beim Hydranode Ticket-Validator',
        'welcome.description': 'Eine sichere und zuverlässige Webanwendung zur Validierung von Hydranode-Tickets. Wählen Sie Ihre bevorzugte Sprache und Ihr Thema für die beste Erfahrung.',
        'warning.title': 'Entwicklungshinweis',
        'warning.message': 'Diese Anwendung befindet sich derzeit in der Entwicklungsphase. Funktionen, Sicherheit und Stabilität werden noch verfeinert. Nutzung auf eigene Gefahr.',
        'validation.title': 'Ticket-Validierung',
        'validation.label': 'Ticket-ID eingeben:',
        'validation.placeholder': 'Geben Sie hier Ihre Ticket-ID ein...',
        'validation.submit': 'Ticket Validieren',
        'validation.validating': 'Validiere...',
        'validation.success': 'Ticket ist gültig!',
        'validation.error': 'Ungültiges Ticket oder Validierung fehlgeschlagen.',
        'validation.empty': 'Bitte geben Sie eine Ticket-ID ein.',
        'features.title': 'Funktionen',
        'features.security.title': 'Sichere Validierung',
        'features.security.description': 'Erweiterte Sicherheitsprotokolle sorgen für eine sichere Validierung Ihrer Tickets.',
        'features.multilingual.title': 'Mehrsprachiger Support',
        'features.multilingual.description': 'Verfügbar in mehreren Sprachen für eine bessere Benutzererfahrung.',
        'features.themes.title': 'Theme-Optionen',
        'features.themes.description': 'Wählen Sie zwischen hellen und dunklen Themes nach Ihren Präferenzen.',
        'features.responsive.title': 'Responsives Design',
        'features.responsive.description': 'Funktioniert nahtlos auf allen Geräten und Bildschirmgrößen.',
        'footer.copyright': '© 2024 Hydranode. Alle Rechte vorbehalten.',
        'footer.version': 'Version 1.0.0 - Entwicklung',
        'language.select': 'Sprache Auswählen',
        'theme.toggle': 'Theme Umschalten',
        'theme.light': 'Zu hellem Theme wechseln',
        'theme.dark': 'Zu dunklem Theme wechseln'
      },
      es: {
        'app.title': 'Validador de Tickets Hydranode',
        'welcome.title': 'Bienvenido al Validador de Tickets Hydranode',
        'welcome.description': 'Una aplicación web segura y confiable para validar tickets de Hydranode. Elige tu idioma y tema preferidos para la mejor experiencia.',
        'warning.title': 'Aviso de Desarrollo',
        'warning.message': 'Esta aplicación está actualmente en fase de desarrollo. Las características, seguridad y estabilidad se están refinando. Úsala bajo tu propio riesgo.',
        'validation.title': 'Validación de Ticket',
        'validation.label': 'Ingresa el ID del Ticket:',
        'validation.placeholder': 'Ingresa aquí el ID de tu ticket...',
        'validation.submit': 'Validar Ticket',
        'validation.validating': 'Validando...',
        'validation.success': '¡El ticket es válido!',
        'validation.error': 'Ticket inválido o la validación falló.',
        'validation.empty': 'Por favor ingresa un ID de ticket.',
        'features.title': 'Características',
        'features.security.title': 'Validación Segura',
        'features.security.description': 'Protocolos de seguridad avanzados aseguran que tus tickets sean validados de forma segura.',
        'features.multilingual.title': 'Soporte Multiidioma',
        'features.multilingual.description': 'Disponible en múltiples idiomas para una mejor experiencia de usuario.',
        'features.themes.title': 'Opciones de Tema',
        'features.themes.description': 'Elige entre temas claro y oscuro según tus preferencias.',
        'features.responsive.title': 'Diseño Responsivo',
        'features.responsive.description': 'Funciona perfectamente en todos los dispositivos y tamaños de pantalla.',
        'footer.copyright': '© 2024 Hydranode. Todos los derechos reservados.',
        'footer.version': 'Versión 1.0.0 - Desarrollo',
        'language.select': 'Seleccionar Idioma',
        'theme.toggle': 'Cambiar Tema',
        'theme.light': 'Cambiar a tema claro',
        'theme.dark': 'Cambiar a tema oscuro'
      }
    };
  }

  loadLanguage() {
    // Check localStorage first
    const savedLanguage = localStorage.getItem(this.storageKey);
    
    if (savedLanguage && this.supportedLanguages.includes(savedLanguage)) {
      this.currentLanguage = savedLanguage;
    } else {
      // Detect browser preference
      this.currentLanguage = this.getBrowserLanguage();
    }
  }

  getBrowserLanguage() {
    const browserLang = navigator.language || navigator.languages[0];
    const langCode = browserLang.toLowerCase().split('-')[0];
    
    // Map some language codes
    const langMap = {
      'cs': 'cz', // Czech
      'sk': 'sk', // Slovak
      'de': 'de', // German
      'es': 'es', // Spanish
    };
    
    const mappedLang = langMap[langCode] || langCode;
    
    return this.supportedLanguages.includes(mappedLang) ? mappedLang : this.fallbackLanguage;
  }

  setLanguage(language) {
    if (!this.supportedLanguages.includes(language)) {
      console.warn('Unsupported language:', language);
      return;
    }
    
    this.currentLanguage = language;
    this.saveLanguage(language);
    this.applyTranslations();
    this.updateLanguageSelector();
    this.updateDocumentLanguage();
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('languagechange', {
      detail: { language: language }
    }));
  }

  saveLanguage(language) {
    try {
      localStorage.setItem(this.storageKey, language);
    } catch (error) {
      console.warn('Failed to save language preference:', error);
    }
  }

  translate(key, fallback = null) {
    const translations = this.translations[this.currentLanguage];
    if (translations && translations[key]) {
      return translations[key];
    }
    
    // Try fallback language
    const fallbackTranslations = this.translations[this.fallbackLanguage];
    if (fallbackTranslations && fallbackTranslations[key]) {
      return fallbackTranslations[key];
    }
    
    // Return fallback or key
    return fallback || key;
  }

  applyTranslations() {
    // Find all elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    
    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.translate(key);
      
      // Update text content
      element.textContent = translation;
    });
    
    // Handle placeholder attributes
    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderElements.forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      const translation = this.translate(key);
      element.placeholder = translation;
    });
    
    // Handle aria-label attributes
    const ariaLabelElements = document.querySelectorAll('[data-i18n-aria-label]');
    ariaLabelElements.forEach(element => {
      const key = element.getAttribute('data-i18n-aria-label');
      const translation = this.translate(key);
      element.setAttribute('aria-label', translation);
    });
    
    // Handle title attributes
    const titleElements = document.querySelectorAll('[data-i18n-title]');
    titleElements.forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      const translation = this.translate(key);
      element.title = translation;
    });
  }

  initLanguageSelector() {
    const languageSelect = document.getElementById('languageSelect');
    
    if (languageSelect) {
      // Set current language
      languageSelect.value = this.currentLanguage;
      
      // Add event listener
      languageSelect.addEventListener('change', (e) => {
        this.setLanguage(e.target.value);
      });
    }
  }

  updateLanguageSelector() {
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
      languageSelect.value = this.currentLanguage;
    }
  }

  updateDocumentLanguage() {
    document.documentElement.lang = this.currentLanguage;
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  getSupportedLanguages() {
    return [...this.supportedLanguages];
  }

  // Utility method to format numbers according to locale
  formatNumber(number, options = {}) {
    const localeMap = {
      'en': 'en-US',
      'cz': 'cs-CZ',
      'sk': 'sk-SK',
      'de': 'de-DE',
      'es': 'es-ES'
    };
    
    const locale = localeMap[this.currentLanguage] || 'en-US';
    return new Intl.NumberFormat(locale, options).format(number);
  }

  // Utility method to format dates according to locale
  formatDate(date, options = {}) {
    const localeMap = {
      'en': 'en-US',
      'cz': 'cs-CZ',
      'sk': 'sk-SK',
      'de': 'de-DE',
      'es': 'es-ES'
    };
    
    const locale = localeMap[this.currentLanguage] || 'en-US';
    return new Intl.DateTimeFormat(locale, options).format(date);
  }

  // Method to check if RTL language (none of our supported languages are RTL)
  isRTL() {
    const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
    return rtlLanguages.includes(this.currentLanguage);
  }
}

// Initialize i18n manager
let i18nManager;

function initI18n() {
  i18nManager = new I18nManager();
  
  // Make it globally accessible
  window.i18nManager = i18nManager;
  window.t = (key, fallback) => i18nManager.translate(key, fallback);
}

// Auto-initialize if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initI18n);
} else {
  initI18n();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { I18nManager };
}