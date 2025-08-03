/**
 * Hydranode Ticket Validator PWA
 * Main application logic for QR code scanning and validation
 */

// Application state
const AppState = {
    mode: 'online', // 'online' or 'offline'
    apiToken: null,
    user: null,
    stores: [],
    selectedStore: null,
    invoices: [],
    scanStats: {
        total: 0,
        scanned: 0,
        valid: 0,
        invalid: 0,
        duplicate: 0
    },
    scannedTickets: new Map(), // Map to track scanned tickets with timestamps
    isScanning: false,
    debugEnabled: false,
    debugLogs: [],
    currentLanguage: 'en'
};

// Global variables for scanner management
let scannerAnimationId = null;
let lastScanTime = 0;
const SCAN_FRAME_LIMIT = 60; // Max 60 FPS

// API Configuration
const API_CONFIG = {
    baseURL: 'https://api.getpostman.com/collections',
    timeout: 10000
};

// QR Code validation patterns
const QR_PATTERNS = {
    ticketURL: /^https:\/\/ticket-validator\.org\/btcpay\/i\/([A-Za-z0-9]+)\/receipt$/,
    base58: /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/
};

// Internationalization
const i18n = {
    en: {
        welcome: "Welcome",
        setup_title: "Setup Configuration",
        mode_title: "Select Mode",
        mode_online: "Online (API)",
        mode_offline: "Offline (XLS)",
        api_token_title: "API Token",
        api_token_placeholder: "Enter your API token...",
        validate_token: "Validate Token",
        xls_file_title: "XLS File Upload",
        select_file: "Select XLS File",
        select_store: "Select Store",
        choose_store: "Choose a store...",
        load_invoices: "Load Invoices",
        qr_scanner: "QR Code Scanner",
        total_tickets: "Total Tickets",
        scanned_tickets: "Scanned",
        valid_tickets: "Valid",
        invalid_tickets: "Invalid",
        start_scanner: "Start Scanner",
        stop_scanner: "Stop Scanner",
        export_data: "Export Scan Data",
        reset_data: "Reset Data",
        debug_logs: "Debug Logs",
        export_logs: "Export Logs",
        clear_logs: "Clear Logs",
        loading: "Loading...",
        // Toast messages
        token_validated: "API Token validated successfully",
        token_invalid: "Invalid API Token",
        file_uploaded: "XLS file uploaded successfully",
        file_invalid: "Invalid XLS file",
        store_selected: "Store selected",
        invoices_loaded: "Invoices loaded successfully",
        scanner_started: "Scanner started",
        scanner_stopped: "Scanner stopped",
        ticket_valid: "Valid ticket scanned",
        ticket_invalid: "Invalid ticket",
        ticket_duplicate: "Duplicate scan",
        camera_error: "Camera access denied",
        data_exported: "Data exported successfully",
        data_reset: "Data reset successfully",
        logs_exported: "Logs exported successfully",
        logs_cleared: "Logs cleared successfully"
    },
    sk: {
        welcome: "Vitajte",
        setup_title: "Konfigurácia nastavení",
        mode_title: "Vyberte režim",
        mode_online: "Online (API)",
        mode_offline: "Offline (XLS)",
        api_token_title: "API Token",
        api_token_placeholder: "Zadajte váš API token...",
        validate_token: "Overiť Token",
        xls_file_title: "Nahrať XLS súbor",
        select_file: "Vybrať XLS súbor",
        select_store: "Vybrať obchod",
        choose_store: "Vyberte obchod...",
        load_invoices: "Načítať faktúry",
        qr_scanner: "QR kód skener",
        total_tickets: "Celkom lístkov",
        scanned_tickets: "Naskenované",
        valid_tickets: "Platné",
        invalid_tickets: "Neplatné",
        start_scanner: "Spustiť skener",
        stop_scanner: "Zastaviť skener",
        export_data: "Exportovať dáta",
        reset_data: "Resetovať dáta",
        debug_logs: "Debug záznamy",
        export_logs: "Exportovať záznamy",
        clear_logs: "Vyčistiť záznamy",
        loading: "Načítava...",
        token_validated: "API Token úspešne overený",
        token_invalid: "Neplatný API Token",
        file_uploaded: "XLS súbor úspešne nahraný",
        file_invalid: "Neplatný XLS súbor",
        store_selected: "Obchod vybratý",
        invoices_loaded: "Faktúry úspešne načítané",
        scanner_started: "Skener spustený",
        scanner_stopped: "Skener zastavený",
        ticket_valid: "Platný lístok naskenovaný",
        ticket_invalid: "Neplatný lístok",
        ticket_duplicate: "Duplicitné skenovanie",
        camera_error: "Prístup ku kamere zamietnutý",
        data_exported: "Dáta úspešne exportované",
        data_reset: "Dáta úspešne resetované",
        logs_exported: "Záznamy úspešne exportované",
        logs_cleared: "Záznamy úspešne vyčistené"
    },
    cz: {
        welcome: "Vítejte",
        setup_title: "Konfigurace nastavení",
        mode_title: "Vyberte režim",
        mode_online: "Online (API)",
        mode_offline: "Offline (XLS)",
        api_token_title: "API Token",
        api_token_placeholder: "Zadejte váš API token...",
        validate_token: "Ověřit Token",
        xls_file_title: "Nahrát XLS soubor",
        select_file: "Vybrat XLS soubor",
        select_store: "Vybrat obchod",
        choose_store: "Vyberte obchod...",
        load_invoices: "Načíst faktury",
        qr_scanner: "QR kód skener",
        total_tickets: "Celkem lístků",
        scanned_tickets: "Naskenované",
        valid_tickets: "Platné",
        invalid_tickets: "Neplatné",
        start_scanner: "Spustit skener",
        stop_scanner: "Zastavit skener",
        export_data: "Exportovat data",
        reset_data: "Resetovat data",
        debug_logs: "Debug záznamy",
        export_logs: "Exportovat záznamy",
        clear_logs: "Vyčistit záznamy",
        loading: "Načítá...",
        token_validated: "API Token úspěšně ověřen",
        token_invalid: "Neplatný API Token",
        file_uploaded: "XLS soubor úspěšně nahrán",
        file_invalid: "Neplatný XLS soubor",
        store_selected: "Obchod vybrán",
        invoices_loaded: "Faktury úspěšně načteny",
        scanner_started: "Skener spuštěn",
        scanner_stopped: "Skener zastaven",
        ticket_valid: "Platný lístek naskenován",
        ticket_invalid: "Neplatný lístek",
        ticket_duplicate: "Duplicitní skenování",
        camera_error: "Přístup ke kameře zamítnut",
        data_exported: "Data úspěšně exportována",
        data_reset: "Data úspěšně resetována",
        logs_exported: "Záznamy úspěšně exportovány",
        logs_cleared: "Záznamy úspěšně vyčištěny"
    },
    de: {
        welcome: "Willkommen",
        setup_title: "Setup-Konfiguration",
        mode_title: "Modus auswählen",
        mode_online: "Online (API)",
        mode_offline: "Offline (XLS)",
        api_token_title: "API Token",
        api_token_placeholder: "Geben Sie Ihr API-Token ein...",
        validate_token: "Token validieren",
        xls_file_title: "XLS-Datei hochladen",
        select_file: "XLS-Datei auswählen",
        select_store: "Geschäft auswählen",
        choose_store: "Wählen Sie ein Geschäft...",
        load_invoices: "Rechnungen laden",
        qr_scanner: "QR-Code Scanner",
        total_tickets: "Tickets gesamt",
        scanned_tickets: "Gescannt",
        valid_tickets: "Gültig",
        invalid_tickets: "Ungültig",
        start_scanner: "Scanner starten",
        stop_scanner: "Scanner stoppen",
        export_data: "Daten exportieren",
        reset_data: "Daten zurücksetzen",
        debug_logs: "Debug-Protokolle",
        export_logs: "Protokolle exportieren",
        clear_logs: "Protokolle löschen",
        loading: "Lädt...",
        token_validated: "API Token erfolgreich validiert",
        token_invalid: "Ungültiges API Token",
        file_uploaded: "XLS-Datei erfolgreich hochgeladen",
        file_invalid: "Ungültige XLS-Datei",
        store_selected: "Geschäft ausgewählt",
        invoices_loaded: "Rechnungen erfolgreich geladen",
        scanner_started: "Scanner gestartet",
        scanner_stopped: "Scanner gestoppt",
        ticket_valid: "Gültiges Ticket gescannt",
        ticket_invalid: "Ungültiges Ticket",
        ticket_duplicate: "Doppelter Scan",
        camera_error: "Kamerazugriff verweigert",
        data_exported: "Daten erfolgreich exportiert",
        data_reset: "Daten erfolgreich zurückgesetzt",
        logs_exported: "Protokolle erfolgreich exportiert",
        logs_cleared: "Protokolle erfolgreich gelöscht"
    },
    es: {
        welcome: "Bienvenido",
        setup_title: "Configuración",
        mode_title: "Seleccionar modo",
        mode_online: "En línea (API)",
        mode_offline: "Fuera de línea (XLS)",
        api_token_title: "Token API",
        api_token_placeholder: "Ingrese su token API...",
        validate_token: "Validar Token",
        xls_file_title: "Subir archivo XLS",
        select_file: "Seleccionar archivo XLS",
        select_store: "Seleccionar tienda",
        choose_store: "Elija una tienda...",
        load_invoices: "Cargar facturas",
        qr_scanner: "Escáner QR",
        total_tickets: "Tickets totales",
        scanned_tickets: "Escaneados",
        valid_tickets: "Válidos",
        invalid_tickets: "Inválidos",
        start_scanner: "Iniciar escáner",
        stop_scanner: "Detener escáner",
        export_data: "Exportar datos",
        reset_data: "Reiniciar datos",
        debug_logs: "Registros de debug",
        export_logs: "Exportar registros",
        clear_logs: "Limpiar registros",
        loading: "Cargando...",
        token_validated: "Token API validado exitosamente",
        token_invalid: "Token API inválido",
        file_uploaded: "Archivo XLS subido exitosamente",
        file_invalid: "Archivo XLS inválido",
        store_selected: "Tienda seleccionada",
        invoices_loaded: "Facturas cargadas exitosamente",
        scanner_started: "Escáner iniciado",
        scanner_stopped: "Escáner detenido",
        ticket_valid: "Ticket válido escaneado",
        ticket_invalid: "Ticket inválido",
        ticket_duplicate: "Escaneo duplicado",
        camera_error: "Acceso a cámara denegado",
        data_exported: "Datos exportados exitosamente",
        data_reset: "Datos reiniciados exitosamente",
        logs_exported: "Registros exportados exitosamente",
        logs_cleared: "Registros limpiados exitosamente"
    }
};

// DOM Elements
let elements = {};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

/**
 * Initialize the application
 */
function initializeApp() {
    debugLog('Application initializing...');
    
    // Cache DOM elements
    cacheElements();
    
    // Initialize theme
    initializeTheme();
    
    // Initialize language
    initializeLanguage();
    
    // Setup event listeners
    setupEventListeners();
    
    // Register service worker
    registerServiceWorker();
    
    debugLog('Application initialized successfully');
}

/**
 * Cache frequently used DOM elements
 */
function cacheElements() {
    elements = {
        // Theme and language
        themeToggle: document.getElementById('themeToggle'),
        languageSelect: document.getElementById('languageSelect'),
        logo: document.getElementById('logo'),
        
        // Sections
        setupSection: document.getElementById('setupSection'),
        welcomeSection: document.getElementById('welcomeSection'),
        storeSection: document.getElementById('storeSection'),
        scannerSection: document.getElementById('scannerSection'),
        
        // Welcome
        welcomeMessage: document.getElementById('welcomeMessage'),
        
        // Mode selection
        modeRadios: document.querySelectorAll('input[name="mode"]'),
        onlineConfig: document.getElementById('onlineConfig'),
        offlineConfig: document.getElementById('offlineConfig'),
        
        // API configuration
        apiToken: document.getElementById('apiToken'),
        toggleApiToken: document.getElementById('toggleApiToken'),
        validateToken: document.getElementById('validateToken'),
        
        // File upload
        xlsFile: document.getElementById('xlsFile'),
        selectFileBtn: document.getElementById('selectFileBtn'),
        fileInfo: document.getElementById('fileInfo'),
        
        // Store selection
        storeSelect: document.getElementById('storeSelect'),
        loadInvoices: document.getElementById('loadInvoices'),
        
        // Scanner
        startScanner: document.getElementById('startScanner'),
        stopScanner: document.getElementById('stopScanner'),
        qrVideo: document.getElementById('qrVideo'),
        videoContainer: document.getElementById('videoContainer'),
        
        // Statistics
        totalTickets: document.getElementById('totalTickets'),
        scannedTickets: document.getElementById('scannedTickets'),
        validTickets: document.getElementById('validTickets'),
        invalidTickets: document.getElementById('invalidTickets'),
        
        // Export and reset
        exportData: document.getElementById('exportData'),
        resetData: document.getElementById('resetData'),
        
        // Debug
        debugEnabled: document.getElementById('debugEnabled'),
        debugOutput: document.getElementById('debugOutput'),
        exportLogs: document.getElementById('exportLogs'),
        clearLogs: document.getElementById('clearLogs'),
        
        // Loading
        loadingOverlay: document.getElementById('loadingOverlay'),
        
        // Toast container
        toastContainer: document.getElementById('toastContainer')
    };
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Language selection
    elements.languageSelect.addEventListener('change', changeLanguage);
    
    // Mode selection
    elements.modeRadios.forEach(radio => {
        radio.addEventListener('change', handleModeChange);
    });
    
    // API token management
    elements.toggleApiToken.addEventListener('click', toggleApiTokenVisibility);
    elements.validateToken.addEventListener('click', validateApiToken);
    elements.apiToken.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') validateApiToken();
    });
    
    // File upload
    elements.selectFileBtn.addEventListener('click', () => elements.xlsFile.click());
    elements.xlsFile.addEventListener('change', handleFileUpload);
    
    // Store management
    elements.loadInvoices.addEventListener('click', loadInvoices);
    
    // Scanner controls
    elements.startScanner.addEventListener('click', startScanner);
    elements.stopScanner.addEventListener('click', stopScanner);
    
    // Export and reset
    elements.exportData.addEventListener('click', exportScanData);
    elements.resetData.addEventListener('click', resetScanData);
    
    // Debug controls
    elements.debugEnabled.addEventListener('change', toggleDebug);
    elements.exportLogs.addEventListener('click', exportDebugLogs);
    elements.clearLogs.addEventListener('click', clearDebugLogs);
}

/**
 * Initialize theme system
 */
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateLogoForTheme(savedTheme);
}

/**
 * Toggle between dark and light themes
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateLogoForTheme(newTheme);
    
    debugLog(`Theme changed to: ${newTheme}`);
}

/**
 * Update logo based on theme
 */
function updateLogoForTheme(theme) {
    const logoSrc = theme === 'dark' 
        ? 'logos/hydranode-horizontal-light.png'
        : 'logos/hydranode-horizontal-dark.png';
    elements.logo.src = logoSrc;
}

/**
 * Initialize language system
 */
function initializeLanguage() {
    const savedLanguage = localStorage.getItem('language') || 'en';
    AppState.currentLanguage = savedLanguage;
    elements.languageSelect.value = savedLanguage;
    updateTexts();
}

/**
 * Change application language
 */
function changeLanguage() {
    const newLanguage = elements.languageSelect.value;
    AppState.currentLanguage = newLanguage;
    localStorage.setItem('language', newLanguage);
    updateTexts();
    debugLog(`Language changed to: ${newLanguage}`);
}

/**
 * Update all translatable texts
 */
function updateTexts() {
    const texts = i18n[AppState.currentLanguage];
    
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (texts[key]) {
            element.textContent = texts[key];
        }
    });
    
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (texts[key]) {
            element.placeholder = texts[key];
        }
    });
}

/**
 * Get translated text
 */
function getText(key) {
    return i18n[AppState.currentLanguage][key] || key;
}

/**
 * Handle mode change (online/offline)
 */
function handleModeChange(event) {
    AppState.mode = event.target.value;
    
    if (AppState.mode === 'online') {
        elements.onlineConfig.style.display = 'block';
        elements.offlineConfig.style.display = 'none';
    } else {
        elements.onlineConfig.style.display = 'none';
        elements.offlineConfig.style.display = 'block';
    }
    
    debugLog(`Mode changed to: ${AppState.mode}`);
}

/**
 * Toggle API token visibility
 */
function toggleApiTokenVisibility() {
    const type = elements.apiToken.type === 'password' ? 'text' : 'password';
    elements.apiToken.type = type;
    
    const icon = elements.toggleApiToken.querySelector('svg');
    if (type === 'text') {
        icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
    } else {
        icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
    }
}

/**
 * Validate API token
 */
async function validateApiToken() {
    const token = elements.apiToken.value.trim();
    
    if (!token) {
        showToast('error', getText('token_invalid'));
        return;
    }
    
    // Basic token validation
    if (!isValidApiToken(token)) {
        showToast('error', getText('token_invalid'));
        return;
    }
    
    showLoading(true);
    
    try {
        const userData = await fetchUserData(token);
        AppState.apiToken = token;
        AppState.user = userData;
        
        // Store token securely (in production, consider more secure storage)
        localStorage.setItem('apiToken', token);
        
        showWelcome();
        await loadStores();
        
        showToast('success', getText('token_validated'));
        debugLog('API token validated successfully', { userId: userData.id });
        
    } catch (error) {
        debugLog('API token validation failed', { error: error.message });
        showToast('error', getText('token_invalid'));
    } finally {
        showLoading(false);
    }
}

/**
 * Validate API token format
 */
function isValidApiToken(token) {
    // Basic validation - check length and characters
    return token.length >= 32 && /^[A-Za-z0-9]+$/.test(token);
}

/**
 * Fetch user data from API
 */
async function fetchUserData(token) {
    const response = await fetch(`${API_CONFIG.baseURL}/users`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(API_CONFIG.timeout)
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data.user;
}

/**
 * Show welcome message
 */
function showWelcome() {
    if (AppState.user) {
        const welcomeText = `${getText('welcome')}, ${AppState.user.first_name} ${AppState.user.last_name}`;
        elements.welcomeMessage.textContent = welcomeText;
        elements.welcomeSection.style.display = 'block';
    }
}

/**
 * Load stores from API
 */
async function loadStores() {
    try {
        // Simulated store loading (replace with actual API call)
        const stores = [
            { id: '1', name: 'Store 1' },
            { id: '2', name: 'Store 2' },
            { id: '3', name: 'Store 3' }
        ];
        
        AppState.stores = stores;
        populateStoreSelect(stores);
        elements.storeSection.style.display = 'block';
        
    } catch (error) {
        debugLog('Failed to load stores', { error: error.message });
        showToast('error', 'Failed to load stores');
    }
}

/**
 * Populate store selection dropdown
 */
function populateStoreSelect(stores) {
    elements.storeSelect.innerHTML = `<option value="">${getText('choose_store')}</option>`;
    
    stores.forEach(store => {
        const option = document.createElement('option');
        option.value = store.id;
        option.textContent = store.name;
        elements.storeSelect.appendChild(option);
    });
}

/**
 * Handle file upload for offline mode
 */
function handleFileUpload(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    if (!isValidXLSFile(file)) {
        showToast('error', getText('file_invalid'));
        return;
    }
    
    readXLSFile(file);
}

/**
 * Validate XLS file
 */
function isValidXLSFile(file) {
    const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    return validTypes.includes(file.type) || 
           file.name.toLowerCase().endsWith('.xls') || 
           file.name.toLowerCase().endsWith('.xlsx');
}

/**
 * Read and process XLS file
 */
function readXLSFile(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Process the workbook
            processXLSData(workbook, file.name);
            
            // Show file info
            elements.fileInfo.style.display = 'block';
            elements.fileInfo.innerHTML = `
                <strong>${file.name}</strong><br>
                Size: ${formatFileSize(file.size)}<br>
                Store: ${AppState.selectedStore || 'Unknown'}
            `;
            
            showToast('success', getText('file_uploaded'));
            elements.scannerSection.style.display = 'block';
            
        } catch (error) {
            debugLog('Failed to process XLS file', { error: error.message });
            showToast('error', getText('file_invalid'));
        }
    };
    
    reader.onerror = function() {
        showToast('error', getText('file_invalid'));
    };
    
    reader.readAsArrayBuffer(file);
}

/**
 * Process XLS data
 */
function processXLSData(workbook, filename) {
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Extract store name from A2:B2
    const storeCell = worksheet['B2'];
    AppState.selectedStore = storeCell ? storeCell.v : 'Unknown Store';
    
    // Extract invoice IDs starting from C4
    const invoiceIds = [];
    let row = 4;
    
    while (true) {
        const cellAddress = `C${row}`;
        const cell = worksheet[cellAddress];
        
        if (!cell || !cell.v) break;
        
        const invoiceId = cell.v.toString().trim();
        if (invoiceId && isValidBase58(invoiceId)) {
            invoiceIds.push(invoiceId);
        }
        
        row++;
    }
    
    AppState.invoices = invoiceIds.map(id => ({ id, invoice_id: id }));
    AppState.scanStats.total = invoiceIds.length;
    
    updateStatistics();
    debugLog('XLS data processed', { 
        filename, 
        store: AppState.selectedStore, 
        invoiceCount: invoiceIds.length 
    });
}

/**
 * Load invoices for selected store
 */
async function loadInvoices() {
    const storeId = elements.storeSelect.value;
    
    if (!storeId) {
        showToast('warning', 'Please select a store');
        return;
    }
    
    showLoading(true);
    
    try {
        // Simulated invoice loading (replace with actual API call)
        const invoices = generateSampleInvoices(50);
        
        AppState.invoices = invoices;
        AppState.selectedStore = elements.storeSelect.options[elements.storeSelect.selectedIndex].text;
        AppState.scanStats.total = invoices.length;
        
        updateStatistics();
        elements.scannerSection.style.display = 'block';
        
        showToast('success', getText('invoices_loaded'));
        debugLog('Invoices loaded', { storeId, count: invoices.length });
        
    } catch (error) {
        debugLog('Failed to load invoices', { error: error.message });
        showToast('error', 'Failed to load invoices');
    } finally {
        showLoading(false);
    }
}

/**
 * Generate sample invoices for demo
 */
function generateSampleInvoices(count) {
    const invoices = [];
    
    for (let i = 0; i < count; i++) {
        invoices.push({
            id: `invoice_${i + 1}`,
            invoice_id: generateBase58Id()
        });
    }
    
    return invoices;
}

/**
 * Generate a random Base58 ID
 */
function generateBase58Id() {
    const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = '';
    
    for (let i = 0; i < 22; i++) {
        result += base58Chars.charAt(Math.floor(Math.random() * base58Chars.length));
    }
    
    return result;
}

/**
 * Start QR code scanner with proper video metadata loading
 */
async function startScanner() {
    try {
        debugLog('Starting camera initialization...');
        
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });
        
        debugLog('Media stream obtained, setting up video element...');
        
        // Set the stream to video element
        elements.qrVideo.srcObject = stream;
        
        // Wait for video metadata to load with timeout
        await waitForVideoMetadata(elements.qrVideo, 10000);
        
        // Validate video dimensions
        if (elements.qrVideo.videoWidth === 0 || elements.qrVideo.videoHeight === 0) {
            throw new Error('Invalid video dimensions: ' + elements.qrVideo.videoWidth + 'x' + elements.qrVideo.videoHeight);
        }
        
        debugLog('Video metadata loaded successfully', {
            width: elements.qrVideo.videoWidth,
            height: elements.qrVideo.videoHeight
        });
        
        // Update UI
        elements.videoContainer.style.display = 'block';
        elements.startScanner.style.display = 'none';
        elements.stopScanner.style.display = 'inline-block';
        
        // Start scanning
        AppState.isScanning = true;
        scanQRCode();
        
        showToast('success', getText('scanner_started'));
        debugLog('QR scanner started successfully');
        
    } catch (error) {
        debugLog('Failed to start camera', { 
            error: error.message, 
            name: error.name,
            stack: error.stack 
        });
        
        // Clean up on error
        await cleanupScanner();
        
        // Show appropriate error message
        if (error.name === 'NotAllowedError') {
            showToast('error', getText('camera_error'));
        } else if (error.name === 'NotFoundError') {
            showToast('error', 'No camera found on this device');
        } else if (error.message.includes('timeout')) {
            showToast('error', 'Camera initialization timeout');
        } else if (error.message.includes('Invalid video dimensions')) {
            showToast('error', 'Camera failed to provide valid video');
        } else {
            showToast('error', 'Camera error: ' + error.message);
        }
    }
}

/**
 * Wait for video metadata to load with timeout
 */
function waitForVideoMetadata(video, timeout) {
    timeout = timeout || 10000;
    return new Promise(function(resolve, reject) {
        // If metadata is already loaded
        if (video.readyState >= video.HAVE_METADATA) {
            resolve();
            return;
        }
        
        let timeoutId;
        
        const onMetadataLoaded = function() {
            clearTimeout(timeoutId);
            video.removeEventListener('loadedmetadata', onMetadataLoaded);
            video.removeEventListener('error', onError);
            resolve();
        };
        
        const onError = function(event) {
            clearTimeout(timeoutId);
            video.removeEventListener('loadedmetadata', onMetadataLoaded);
            video.removeEventListener('error', onError);
            reject(new Error('Video metadata loading failed: ' + (event.message || 'Unknown error')));
        };
        
        const onTimeout = function() {
            video.removeEventListener('loadedmetadata', onMetadataLoaded);
            video.removeEventListener('error', onError);
            reject(new Error('Video metadata loading timeout after ' + timeout + 'ms'));
        };
        
        video.addEventListener('loadedmetadata', onMetadataLoaded);
        video.addEventListener('error', onError);
        timeoutId = setTimeout(onTimeout, timeout);
        
        // Start playing the video to trigger metadata loading
        video.play().catch(function(err) {
            debugLog('Video play failed during metadata loading', { error: err.message });
        });
    });
}

/**
 * Clean up scanner resources
 */
async function cleanupScanner() {
    try {
        // Cancel animation frame
        if (scannerAnimationId) {
            cancelAnimationFrame(scannerAnimationId);
            scannerAnimationId = null;
        }
        
        // Stop video stream
        if (elements.qrVideo && elements.qrVideo.srcObject) {
            const tracks = elements.qrVideo.srcObject.getTracks();
            tracks.forEach(function(track) {
                track.stop();
                debugLog('Video track stopped', { kind: track.kind, label: track.label });
            });
            elements.qrVideo.srcObject = null;
        }
        
        // Reset UI state
        AppState.isScanning = false;
        elements.videoContainer.style.display = 'none';
        elements.startScanner.style.display = 'inline-block';
        elements.stopScanner.style.display = 'none';
        
        debugLog('Scanner cleanup completed');
        
    } catch (error) {
        debugLog('Error during scanner cleanup', { error: error.message });
    }
}
        });
        
async function stopScanner() {
    await cleanupScanner();
    showToast('info', getText('scanner_stopped'));
    debugLog('QR scanner stopped');
}


/**
 * Scan QR codes from video stream with enhanced error handling
 */
function scanQRCode() {
    if (\!AppState.isScanning) {
        return;
    }
    
    try {
        // Frame rate limiting
        const now = performance.now();
        if (now - lastScanTime < (1000 / SCAN_FRAME_LIMIT)) {
            scannerAnimationId = requestAnimationFrame(scanQRCode);
            return;
        }
        lastScanTime = now;
        
        // Validate video element and dimensions
        if (\!elements.qrVideo || \!elements.qrVideo.srcObject) {
            debugLog('Video element or source not available, stopping scan');
            return;
        }
        
        const videoWidth = elements.qrVideo.videoWidth;
        const videoHeight = elements.qrVideo.videoHeight;
        
        // Ensure valid dimensions before canvas operations
        if (\!videoWidth || \!videoHeight || videoWidth <= 0 || videoHeight <= 0) {
            debugLog('Invalid video dimensions, skipping frame', { 
                width: videoWidth, 
                height: videoHeight 
            });
            scannerAnimationId = requestAnimationFrame(scanQRCode);
            return;
        }
        
        // Create canvas and context
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (\!ctx) {
            debugLog('Failed to get 2D context, skipping frame');
            scannerAnimationId = requestAnimationFrame(scanQRCode);
            return;
        }
        
        // Set canvas dimensions
        canvas.width = videoWidth;
        canvas.height = videoHeight;
        
        // Draw video frame to canvas
        ctx.drawImage(elements.qrVideo, 0, 0, videoWidth, videoHeight);
        
        // Get image data for QR processing
        let imageData;
        try {
            imageData = ctx.getImageData(0, 0, videoWidth, videoHeight);
        } catch (error) {
            debugLog('Failed to get image data from canvas', { 
                error: error.message,
                width: videoWidth,
                height: videoHeight
            });
            scannerAnimationId = requestAnimationFrame(scanQRCode);
            return;
        }
        
        // Attempt QR code detection
        try {
            const code = jsQR(imageData.data, videoWidth, videoHeight, {
                inversionAttempts: "dontInvert"
            });
            
            if (code && code.data) {
                debugLog('QR code detected in frame', { 
                    data: code.data.substring(0, 50) + '...',
                    location: code.location 
                });
                handleQRCodeDetected(code.data);
            }
        } catch (error) {
            debugLog('Error during QR code detection', { error: error.message });
        }
        
    } catch (error) {
        debugLog('Unexpected error in scanQRCode', { 
            error: error.message, 
            stack: error.stack 
        });
    }
    
    // Continue scanning if still active
    if (AppState.isScanning) {
        scannerAnimationId = requestAnimationFrame(scanQRCode);
    }
}

/**
 * Handle detected QR code
 */
function handleQRCodeDetected(qrData) {
    debugLog('QR code detected', { data: qrData });
    
    // Validate QR code format
    const match = qrData.match(QR_PATTERNS.ticketURL);
    
    if (!match) {
        showScanFeedback('error');
        showToast('error', getText('ticket_invalid'));
        debugLog('Invalid QR code format', { data: qrData });
        return;
    }
    
    const ticketId = match[1];
    
    // Validate Base58 format
    if (!isValidBase58(ticketId)) {
        showScanFeedback('error');
        showToast('error', getText('ticket_invalid'));
        debugLog('Invalid Base58 ticket ID', { ticketId });
        return;
    }
    
    // Check if ticket exists in our dataset
    const ticket = AppState.invoices.find(inv => inv.invoice_id === ticketId);
    
    if (!ticket) {
        AppState.scanStats.invalid++;
        showScanFeedback('error');
        showToast('error', getText('ticket_invalid'));
        debugLog('Ticket not found', { ticketId });
    } else if (AppState.scannedTickets.has(ticketId)) {
        AppState.scanStats.duplicate++;
        showScanFeedback('warning');
        showToast('warning', getText('ticket_duplicate'));
        debugLog('Duplicate ticket scan', { ticketId });
    } else {
        AppState.scanStats.valid++;
        AppState.scanStats.scanned++;
        AppState.scannedTickets.set(ticketId, {
            timestamp: new Date().toISOString(),
            scanCount: 1
        });
        
        showScanFeedback('success');
        showToast('success', getText('ticket_valid'));
        debugLog('Valid ticket scanned', { ticketId });
        
        // Auto-stop scanner after successful scan
        setTimeout(stopScanner, 1000);
    }
    
    updateStatistics();
}

/**
 * Validate Base58 string
 */
function isValidBase58(str) {
    return QR_PATTERNS.base58.test(str);
}

/**
 * Show visual feedback for scan result
 */
function showScanFeedback(type) {
    const overlay = elements.videoContainer.querySelector('.scan-overlay');
    
    overlay.classList.remove('scan-success', 'scan-error', 'scan-warning');
    
    if (type === 'success') {
        overlay.classList.add('scan-success');
    } else if (type === 'error') {
        overlay.classList.add('scan-error');
    } else if (type === 'warning') {
        overlay.classList.add('scan-warning');
    }
    
    setTimeout(() => {
        overlay.classList.remove('scan-success', 'scan-error', 'scan-warning');
    }, 500);
}

/**
 * Update statistics display
 */
function updateStatistics() {
    elements.totalTickets.textContent = AppState.scanStats.total;
    elements.scannedTickets.textContent = AppState.scanStats.scanned;
    elements.validTickets.textContent = AppState.scanStats.valid;
    elements.invalidTickets.textContent = AppState.scanStats.invalid + AppState.scanStats.duplicate;
}

/**
 * Export scan data
 */
function exportScanData() {
    const data = {
        timestamp: new Date().toISOString(),
        store: AppState.selectedStore,
        mode: AppState.mode,
        statistics: AppState.scanStats,
        scannedTickets: Array.from(AppState.scannedTickets.entries()).map(([id, info]) => ({
            ticketId: id,
            timestamp: info.timestamp,
            scanCount: info.scanCount
        }))
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-data-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('success', getText('data_exported'));
    debugLog('Scan data exported');
}

/**
 * Reset scan data
 */
function resetScanData() {
    if (!confirm('Are you sure you want to reset all scan data?')) {
        return;
    }
    
    AppState.scanStats = {
        total: AppState.scanStats.total, // Keep total tickets
        scanned: 0,
        valid: 0,
        invalid: 0,
        duplicate: 0
    };
    
    AppState.scannedTickets.clear();
    updateStatistics();
    
    showToast('success', getText('data_reset'));
    debugLog('Scan data reset');
}

/**
 * Toggle debug mode
 */
function toggleDebug() {
    AppState.debugEnabled = elements.debugEnabled.checked;
    debugLog(`Debug mode ${AppState.debugEnabled ? 'enabled' : 'disabled'}`);
}

/**
 * Add debug log entry
 */
function debugLog(message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        message,
        data: data ? sanitizeLogData(data) : null
    };
    
    AppState.debugLogs.push(logEntry);
    
    // Keep only last 1000 log entries
    if (AppState.debugLogs.length > 1000) {
        AppState.debugLogs = AppState.debugLogs.slice(-1000);
    }
    
    if (AppState.debugEnabled) {
        updateDebugOutput();
    }
    
    // Also log to console in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log(`[${timestamp}] ${message}`, data || '');
    }
}

/**
 * Sanitize log data to remove sensitive information
 */
function sanitizeLogData(data) {
    const sanitized = { ...data };
    
    // Remove or mask sensitive fields
    if (sanitized.apiToken) {
        sanitized.apiToken = '***REDACTED***';
    }
    
    if (sanitized.token) {
        sanitized.token = '***REDACTED***';
    }
    
    return sanitized;
}

/**
 * Update debug output display
 */
function updateDebugOutput() {
    const output = AppState.debugLogs
        .slice(-50) // Show last 50 entries
        .map(entry => {
            const dataStr = entry.data ? ` | ${JSON.stringify(entry.data)}` : '';
            return `[${entry.timestamp}] ${entry.message}${dataStr}`;
        })
        .join('\n');
    
    elements.debugOutput.textContent = output;
    elements.debugOutput.scrollTop = elements.debugOutput.scrollHeight;
}

/**
 * Export debug logs
 */
function exportDebugLogs() {
    const timestamp = new Date().toISOString();
    const logData = {
        exportTimestamp: timestamp,
        appVersion: '1.0.0',
        userAgent: navigator.userAgent,
        logs: AppState.debugLogs
    };
    
    const jsonString = JSON.stringify(logData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${timestamp.slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('success', getText('logs_exported'));
    debugLog('Debug logs exported');
}

/**
 * Clear debug logs
 */
function clearDebugLogs() {
    AppState.debugLogs = [];
    elements.debugOutput.textContent = '';
    
    showToast('success', getText('logs_cleared'));
    debugLog('Debug logs cleared');
}

/**
 * Show toast notification
 */
function showToast(type, message, duration = 5000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    toast.innerHTML = `
        <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
        <div class="toast-message">${message}</div>
        <button class="toast-close">&times;</button>
    `;
    
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => removeToast(toast));
    
    elements.toastContainer.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto remove
    setTimeout(() => removeToast(toast), duration);
}

/**
 * Remove toast notification
 */
function removeToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

/**
 * Show/hide loading overlay
 */
function showLoading(show) {
    elements.loadingOverlay.style.display = show ? 'flex' : 'none';
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Register service worker
 */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                debugLog('Service worker registered', { scope: registration.scope });
            })
            .catch(error => {
                debugLog('Service worker registration failed', { error: error.message });
            });
    }
}