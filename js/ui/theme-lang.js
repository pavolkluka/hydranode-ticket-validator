// Combined Theme and Language System for Hydranode Ticket Validator
// Manages both UI theming and internationalization

// ========================================
// Theme Management System
// ========================================

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
            
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!this.getSavedTheme()) {
                    this.setTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    setTheme(theme) {
        if (this.themes[theme]) {
            const previousTheme = this.currentTheme;
            this.currentTheme = theme;
            this.saveTheme(theme);
            this.applyTheme();
            this.updateMetaThemeColor();
            this.notifyCallbacks();
            
            if (window.DebugLogger) {
                window.DebugLogger.info('theme', 'Theme changed', {
                    previousTheme,
                    newTheme: theme,
                    availableThemes: Object.keys(this.themes)
                });
            }
        } else if (window.DebugLogger) {
            window.DebugLogger.warn('theme', 'Attempted to set unsupported theme', {
                requestedTheme: theme,
                availableThemes: Object.keys(this.themes)
            });
        }
    }

    applyTheme() {
        const root = document.documentElement;
        const themeColors = this.themes[this.currentTheme];
        
        Object.keys(themeColors).forEach(property => {
            root.style.setProperty(property, themeColors[property]);
        });

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

    getAnimationDuration() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        return prefersReducedMotion ? '0ms' : '300ms';
    }

    updateThemeSpecificElements() {
        this.updateSVGIcons();
        this.updateCanvasElements();
    }

    updateSVGIcons() {
        const svgIcons = document.querySelectorAll('.theme-svg');
        svgIcons.forEach(svg => {
            const primaryColor = this.themes[this.currentTheme]['--primary-color'];
            const textColor = this.themes[this.currentTheme]['--text-primary'];
            
            svg.querySelectorAll('[fill]').forEach(element => {
                if (element.getAttribute('fill') !== 'none') {
                    element.setAttribute('fill', element.hasAttribute('data-primary') ? primaryColor : textColor);
                }
            });
        });
    }

    updateCanvasElements() {
        const event = new CustomEvent('themeChanged', {
            detail: { theme: this.currentTheme, colors: this.themes[this.currentTheme] }
        });
        window.dispatchEvent(event);
    }

    createThemeTransition(element, duration = null) {
        if (!element) return;
        
        duration = duration || this.getAnimationDuration();
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            return;
        }

        element.style.transition = `all ${duration} ease-in-out`;
        
        setTimeout(() => {
            if (element.style) {
                element.style.transition = '';
            }
        }, parseInt(duration) || 300);
    }
}

// ========================================
// Language Management System
// ========================================

class LanguageManager {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {};
        this.callbacks = [];
        this.init();
    }

    init() {
        this.loadTranslations();
        this.setLanguage(this.getSavedLanguage() || 'en');
    }

    loadTranslations() {
        this.translations = {
            en: {
                // Header
                appName: 'Hydranode Ticket Validator',
                
                // Options Menu
                options: 'Options',
                uploadFile: 'Upload XLS File',
                language: 'Language',
                theme: 'Theme',
                lightMode: 'Light Mode',
                darkMode: 'Dark Mode',
                
                // Languages
                languages: {
                    en: 'English',
                    sk: 'Slovenčina',
                    cz: 'Čeština',
                    es: 'Español'
                },
                
                // Data Availability
                dataAvailable: 'XLS Data Loaded',
                dataUnavailable: 'No XLS Data',
                dataAvailableDetails: '{count} valid tickets available',
                dataUnavailableDetails: 'Upload an XLS file to enable ticket validation',
                
                // Debug System
                debugLogging: 'Debug Logging',
                debugEnabled: 'Enabled',
                debugDisabled: 'Disabled',
                exportLogs: 'Export',
                clearLogs: 'Clear',
                totalLogs: 'Total Logs',
                storageSize: 'Storage',
                debugExportSuccess: 'Debug logs exported successfully',
                debugExportFailed: 'Failed to export debug logs',
                debugClearConfirm: 'Are you sure you want to clear all debug logs?',
                debugClearSuccess: 'Debug logs cleared successfully',
                
                // Scanner
                startScanner: 'Start Scanner',
                stopScanner: 'Stop Scanner',
                scannerStatus: 'Scanner Status',
                enterTicketId: 'Enter Ticket ID manually',
                submitTicket: 'Submit',
                
                // Statistics
                statistics: 'Ticket Statistics',
                totalTickets: 'Total Tickets',
                validTickets: 'Valid Tickets',
                duplicateTickets: 'Duplicate Tickets',
                invalidTickets: 'Invalid Tickets',
                remainingTickets: 'Remaining Tickets',
                
                // Scan History
                scanHistory: 'Scan History',
                exportHistory: 'Export History',
                clearHistory: 'Clear History',
                noDataToExport: 'No scan history data to export',
                exportSuccess: 'Successfully exported {count} scan records',
                searchTickets: 'Search ticket IDs...',
                allStatuses: 'All Statuses',
                validOnly: 'Valid Only',
                invalidOnly: 'Invalid Only',
                duplicateOnly: 'Duplicate Only',
                showingResults: 'Showing {visible} of {total} scans',
                noMatchingScans: 'No matching scans found',
                ticketId: 'Ticket ID',
                status: 'Status',
                timestamp: 'Time',
                method: 'Method',
                showAll: 'Show All',
                showLimited: 'Show Limited',
                noScansYet: 'No scans yet',
                confirmClearHistory: 'Are you sure you want to clear the scan history?',
                
                // Data Display
                dataDisplay: 'Ticket Data',
                rowsPerPage: 'Rows per page:',
                date: 'Date',
                time: 'Time',
                invoiceId: 'Invoice ID',  
                lnurlComment: 'LNURL Comment',
                
                // Messages
                validTicket: 'Ticket validated successfully',
                invalidTicket: 'Invalid ticket',
                duplicateTicket: 'Ticket already scanned',
                noDataLoaded: 'No XLS data loaded. Please upload a valid XLS file first.',
                invalidFormat: 'Invalid ticket ID format',
                ticketNotFound: 'Ticket not found in database',
                uploadSuccess: 'File processed successfully',
                uploadError: 'Error processing file',
                
                // File Upload
                chooseFile: 'Choose File',
                supportedFormats: '(Supported .xls file: use exported report for store.)',
                dragAndDrop: 'Drag and drop your XLS file here',
                
                // Status
                valid: 'Valid',
                invalid: 'Invalid',
                duplicate: 'Duplicate',
                pending: 'Pending',
                
                // Footer
                footerText: '© {year} Hydranode Ticket Validator',
                
                // Accessibility
                close: 'Close',
                previous: 'Previous',
                next: 'Next',
                loading: 'Loading...',
                
                // Client Info
                clientId: 'Client ID',
                storeName: 'Store Name',
                status: 'Status',
                action: 'Action',
                pleaseUpload: 'Please upload a valid XLS file to begin'
            },

            sk: {
                // Header
                appName: 'Hydranode Validátor Lístkov',
                
                // Options Menu
                options: 'Možnosti',
                uploadFile: 'Nahrať XLS súbor',
                language: 'Jazyk',
                theme: 'Téma',
                lightMode: 'Svetlý režim',
                darkMode: 'Tmavý režim',
                
                // Languages
                languages: {
                    en: 'English',
                    sk: 'Slovenčina',
                    cz: 'Čeština',
                    es: 'Español'
                },
                
                // Data Availability
                dataAvailable: 'XLS dáta načítané',
                dataUnavailable: 'Žiadne XLS dáta',
                dataAvailableDetails: '{count} platných lístkov k dispozícii',
                dataUnavailableDetails: 'Nahrajte XLS súbor pre umožnenie validácie lístkov',
                
                // Scanner
                startScanner: 'Spustiť skener',
                stopScanner: 'Zastaviť skener',
                scannerStatus: 'Stav skenera',
                enterTicketId: 'Zadajte ID lístka manuálne',
                submitTicket: 'Odoslať',
                
                // Statistics
                statistics: 'Štatistiky lístkov',
                totalTickets: 'Celkom lístkov',
                validTickets: 'Platné lístky',
                duplicateTickets: 'Duplicitné lístky',
                invalidTickets: 'Neplatné lístky',
                remainingTickets: 'Zostávajúce lístky',
                
                // Scan History
                scanHistory: 'História skenovania',
                exportHistory: 'Exportovať históriu',
                clearHistory: 'Vymazať históriu',
                noDataToExport: 'Žiadne údaje histórie skenovania na export',
                exportSuccess: 'Úspešne exportované {count} záznamov skenovania',
                searchTickets: 'Hľadať ID lístkov...',
                allStatuses: 'Všetky stavy',
                validOnly: 'Iba platné',
                invalidOnly: 'Iba neplatné',
                duplicateOnly: 'Iba duplicitné',
                showingResults: 'Zobrazuje sa {visible} z {total} skenov',
                noMatchingScans: 'Nenašli sa žiadne vyhovujúce skeny',
                ticketId: 'ID lístka',
                status: 'Stav',
                timestamp: 'Čas',
                method: 'Metóda',
                showAll: 'Zobraziť všetky',
                showLimited: 'Zobraziť obmedzene',
                noScansYet: 'Zatiaľ žiadne skeny',
                confirmClearHistory: 'Ste si istí, že chcete vymazať históriu skenovania?',
                
                // Data Display
                dataDisplay: 'Dáta lístkov',
                rowsPerPage: 'Riadkov na stránku:',
                date: 'Dátum',
                time: 'Čas',
                invoiceId: 'ID faktúry',
                lnurlComment: 'LNURL komentár',
                
                // Messages
                validTicket: 'Lístok úspešne validovaný',
                invalidTicket: 'Neplatný lístok',
                duplicateTicket: 'Lístok už bol naskenovaný',
                noDataLoaded: 'Žiadne XLS dáta načítané. Najprv nahrajte platný XLS súbor.',
                invalidFormat: 'Neplatný formát ID lístka',
                ticketNotFound: 'Lístok sa nenašiel v databáze',
                uploadSuccess: 'Súbor úspešne spracovaný',
                uploadError: 'Chyba pri spracovaní súboru',
                
                // File Upload
                chooseFile: 'Vybrať súbor',
                supportedFormats: '(Podporovaný .xls súbor: použite exportovaný report pre obchod.)',
                dragAndDrop: 'Presuňte svoj XLS súbor sem',
                
                // Status
                valid: 'Platný',
                invalid: 'Neplatný',
                duplicate: 'Duplicitný',
                pending: 'Čakajúci',
                
                // Footer
                footerText: '© {year} Hydranode Validátor Lístkov',
                
                // Accessibility
                close: 'Zavrieť',
                previous: 'Predchádzajúci',
                next: 'Ďalší',
                loading: 'Načítavam...',
                
                // Client Info
                clientId: 'ID klienta',
                storeName: 'Názov obchodu',
                status: 'Stav',
                action: 'Akcia',
                pleaseUpload: 'Prosím nahrajte platný XLS súbor pre začiatok'
            },

            cz: {
                // Header
                appName: 'Hydranode Validátor Vstupenek',
                
                // Options Menu
                options: 'Možnosti',
                uploadFile: 'Nahrát XLS soubor',
                language: 'Jazyk',
                theme: 'Téma',
                lightMode: 'Světlý režim',
                darkMode: 'Tmavý režim',
                
                // Languages
                languages: {
                    en: 'English',
                    sk: 'Slovenčina',
                    cz: 'Čeština',
                    es: 'Español'
                },
                
                // Data Availability
                dataAvailable: 'XLS data načtena',
                dataUnavailable: 'Žádná XLS data',
                dataAvailableDetails: '{count} platných vstupenek k dispozici',
                dataUnavailableDetails: 'Nahrajte XLS soubor pro umožnění validace vstupenek',
                
                // Scanner
                startScanner: 'Spustit skener',
                stopScanner: 'Zastavit skener',
                scannerStatus: 'Stav skeneru',
                enterTicketId: 'Zadejte ID vstupenky manuálně',
                submitTicket: 'Odeslat',
                
                // Statistics
                statistics: 'Statistiky vstupenek',
                totalTickets: 'Celkem vstupenek',
                validTickets: 'Platné vstupenky',
                duplicateTickets: 'Duplicitní vstupenky',
                invalidTickets: 'Neplatné vstupenky',
                remainingTickets: 'Zbývající vstupenky',
                
                // Scan History
                scanHistory: 'Historie skenování',
                exportHistory: 'Exportovat historii',
                clearHistory: 'Vymazat historii',
                noDataToExport: 'Žádná data historie skenování k exportu',
                exportSuccess: 'Úspěšně exportováno {count} záznamů skenování',
                searchTickets: 'Hledat ID vstupenek...',
                allStatuses: 'Všechny stavy',
                validOnly: 'Pouze platné',
                invalidOnly: 'Pouze neplatné',
                duplicateOnly: 'Pouze duplicitní',
                showingResults: 'Zobrazuje se {visible} z {total} skenů',
                noMatchingScans: 'Nenalezeny žádné odpovídající skeny',
                ticketId: 'ID vstupenky',
                status: 'Stav',
                timestamp: 'Čas',
                method: 'Metoda',
                showAll: 'Zobrazit vše',
                showLimited: 'Zobrazit omezené',
                noScansYet: 'Zatím žádné skeny',
                confirmClearHistory: 'Jste si jisti, že chcete vymazat historii skenování?',
                
                // Data Display
                dataDisplay: 'Data vstupenek',
                rowsPerPage: 'Řádků na stránku:',
                date: 'Datum',
                time: 'Čas',
                invoiceId: 'ID faktury',
                lnurlComment: 'LNURL komentář',
                
                // Messages
                validTicket: 'Vstupenka úspěšně validována',
                invalidTicket: 'Neplatná vstupenka',
                duplicateTicket: 'Vstupenka již byla naskenována',
                noDataLoaded: 'Žádná XLS data načtena. Nejprve nahrajte platný XLS soubor.',
                invalidFormat: 'Neplatný formát ID vstupenky',
                ticketNotFound: 'Vstupenka nebyla nalezena v databázi',
                uploadSuccess: 'Soubor úspěšně zpracován',
                uploadError: 'Chyba při zpracování souboru',
                
                // File Upload
                chooseFile: 'Vybrat soubor',
                supportedFormats: '(Podporovaný .xls soubor: použijte exportovaný report pro obchod.)',
                dragAndDrop: 'Přetáhněte svůj XLS soubor sem',
                
                // Status
                valid: 'Platná',
                invalid: 'Neplatná',
                duplicate: 'Duplicitní',
                pending: 'Čekající',
                
                // Footer
                footerText: '© {year} Hydranode Validátor Vstupenek',
                
                // Accessibility
                close: 'Zavřít',
                previous: 'Předchozí',
                next: 'Další',
                loading: 'Načítám...',
                
                // Client Info
                clientId: 'ID klienta',
                storeName: 'Název obchodu',
                status: 'Stav',
                action: 'Akce',
                pleaseUpload: 'Prosím nahrajte platný XLS soubor pro začátek'
            },

            es: {
                // Header
                appName: 'Validador de Entradas Hydranode',
                
                // Options Menu
                options: 'Opciones',
                uploadFile: 'Subir archivo XLS',
                language: 'Idioma',
                theme: 'Tema',
                lightMode: 'Modo claro',
                darkMode: 'Modo oscuro',
                
                // Languages
                languages: {
                    en: 'English',
                    sk: 'Slovenčina',
                    cz: 'Čeština',
                    es: 'Español'
                },
                
                // Data Availability
                dataAvailable: 'Datos XLS cargados',
                dataUnavailable: 'Sin datos XLS',
                dataAvailableDetails: '{count} entradas válidas disponibles',
                dataUnavailableDetails: 'Suba un archivo XLS para habilitar la validación de entradas',
                
                // Scanner
                startScanner: 'Iniciar escáner',
                stopScanner: 'Detener escáner',
                scannerStatus: 'Estado del escáner',
                enterTicketId: 'Ingrese ID de entrada manualmente',
                submitTicket: 'Enviar',
                
                // Statistics
                statistics: 'Estadísticas de entradas',
                totalTickets: 'Total de entradas',
                validTickets: 'Entradas válidas',
                duplicateTickets: 'Entradas duplicadas',
                invalidTickets: 'Entradas inválidas',
                remainingTickets: 'Entradas restantes',
                
                // Scan History
                scanHistory: 'Historial de escaneo',
                exportHistory: 'Exportar historial',
                clearHistory: 'Limpiar historial',
                noDataToExport: 'No hay datos del historial de escaneo para exportar',
                exportSuccess: 'Se exportaron exitosamente {count} registros de escaneo',
                searchTickets: 'Buscar IDs de entradas...',
                allStatuses: 'Todos los estados',
                validOnly: 'Solo válidas',
                invalidOnly: 'Solo inválidas',
                duplicateOnly: 'Solo duplicadas',
                showingResults: 'Mostrando {visible} de {total} escaneos',
                noMatchingScans: 'No se encontraron escaneos coincidentes',
                ticketId: 'ID de entrada',
                status: 'Estado',
                timestamp: 'Hora',
                method: 'Método',
                showAll: 'Mostrar todo',
                showLimited: 'Mostrar limitado',
                noScansYet: 'Aún no hay escaneos',
                confirmClearHistory: '¿Está seguro de que desea limpiar el historial de escaneo?',
                
                // Data Display
                dataDisplay: 'Datos de entradas',
                rowsPerPage: 'Filas por página:',
                date: 'Fecha',
                time: 'Hora',
                invoiceId: 'ID de factura',
                lnurlComment: 'Comentario LNURL',
                
                // Messages
                validTicket: 'Entrada validada exitosamente',
                invalidTicket: 'Entrada inválida',
                duplicateTicket: 'Entrada ya escaneada',
                noDataLoaded: 'No hay datos XLS cargados. Por favor suba un archivo XLS válido primero.',
                invalidFormat: 'Formato de ID de entrada inválido',
                ticketNotFound: 'Entrada no encontrada en la base de datos',
                uploadSuccess: 'Archivo procesado exitosamente',
                uploadError: 'Error procesando archivo',
                
                // File Upload
                chooseFile: 'Elegir archivo',
                supportedFormats: '(Archivo .xls soportado: use reporte exportado para tienda.)',
                dragAndDrop: 'Arrastre su archivo XLS aquí',
                
                // Status
                valid: 'Válida',
                invalid: 'Inválida',
                duplicate: 'Duplicada',
                pending: 'Pendiente',
                
                // Footer
                footerText: '© {year} Validador de Entradas Hydranode',
                
                // Accessibility
                close: 'Cerrar',
                previous: 'Anterior',
                next: 'Siguiente',
                loading: 'Cargando...',
                
                // Client Info
                clientId: 'ID del cliente',
                storeName: 'Nombre de la tienda',
                status: 'Estado',
                action: 'Acción',
                pleaseUpload: 'Por favor suba un archivo XLS válido para comenzar'
            }
        };
    }

    getSavedLanguage() {
        try {
            return localStorage.getItem('selectedLanguage') || null;
        } catch (error) {
            console.error('Error loading saved language:', error);
            return null;
        }
    }

    saveLanguage(lang) {
        try {
            localStorage.setItem('selectedLanguage', lang);
        } catch (error) {
            console.error('Error saving language:', error);
        }
    }

    setLanguage(lang) {
        if (this.translations[lang]) {
            const previousLanguage = this.currentLanguage;
            this.currentLanguage = lang;
            this.saveLanguage(lang);
            this.updateUI();
            this.notifyCallbacks();
            
            if (window.DebugLogger) {
                window.DebugLogger.info('language', 'Language changed', {
                    previousLanguage,
                    newLanguage: lang,
                    availableLanguages: Object.keys(this.translations)
                });
            }
        } else if (window.DebugLogger) {
            window.DebugLogger.warn('language', 'Attempted to set unsupported language', {
                requestedLanguage: lang,
                availableLanguages: Object.keys(this.translations)
            });
        }
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    get(key, params = {}) {
        const translation = this.getNestedValue(this.translations[this.currentLanguage], key);
        if (translation) {
            return this.interpolate(translation, params);
        }
        
        // Fallback to English if key not found
        const fallback = this.getNestedValue(this.translations.en, key);
        return fallback ? this.interpolate(fallback, params) : key;
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current && current[key], obj);
    }

    interpolate(text, params) {
        let result = text;
        Object.keys(params).forEach(key => {
            result = result.replace(new RegExp(`{${key}}`, 'g'), params[key]);
        });
        return result;
    }

    updateUI() {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const params = element.getAttribute('data-i18n-params');
            const parsedParams = params ? JSON.parse(params) : {};
            
            if (element.tagName === 'INPUT' && (element.type === 'button' || element.type === 'submit')) {
                element.value = this.get(key, parsedParams);
            } else if (element.hasAttribute('placeholder')) {
                element.placeholder = this.get(key, parsedParams);
            } else if (element.hasAttribute('title')) {
                element.title = this.get(key, parsedParams);
            } else {
                element.textContent = this.get(key, parsedParams);
            }
        });

        // Update document language
        document.documentElement.lang = this.currentLanguage;
    }

    registerCallback(callback) {
        if (typeof callback === 'function') {
            this.callbacks.push(callback);
        }
    }

    notifyCallbacks() {
        this.callbacks.forEach(callback => {
            try {
                callback(this.currentLanguage);
            } catch (error) {
                console.error('Error in language callback:', error);
            }
        });
    }

    getAvailableLanguages() {
        return Object.keys(this.translations);
    }
}

// ========================================
// Global Initialization and Export
// ========================================

// Create global instances
const themeManager = new ThemeManager();
const langManager = new LanguageManager();

// Export for use in other scripts
window.ThemeManager = themeManager;
window.LanguageManager = langManager;

// Set up theme callbacks
themeManager.registerCallback((theme) => {
    themeManager.updateThemeSpecificElements();
    
    if (typeof window.UIEnhancements !== 'undefined' && window.UIEnhancements.announceToScreenReader) {
        const themeName = theme === 'dark' ? 'Dark' : 'Light';
        window.UIEnhancements.announceToScreenReader(`Switched to ${themeName} theme`);
    }
});

// Apply initial theme and language on load
document.addEventListener('DOMContentLoaded', () => {
    themeManager.applyTheme();
    langManager.updateUI();
});

// System Integration - Announce language changes to screen readers
langManager.registerCallback((language) => {
    if (typeof window.UIEnhancements !== 'undefined' && window.UIEnhancements.announceToScreenReader) {
        const languageName = langManager.get('languages.' + language);
        window.UIEnhancements.announceToScreenReader(`Language changed to ${languageName}`);
    }
});