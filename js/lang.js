// Language System for Hydranode Ticket Validator
// Supports SK, CZ, EN, ES languages

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

// Create global instance
const langManager = new LanguageManager();

// Export for use in other scripts
window.LanguageManager = langManager;