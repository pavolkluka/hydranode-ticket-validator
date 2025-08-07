// Hydranode Ticket Validator - Core Application Logic
// Combined from main.js and scanner.js for better organization

// ========================================
// Global State Management
// ========================================

// Application state variables
let currentData = null;
let currentPage = 1;
let rowsPerPage = 10;
let scanning = false;
let scanHistory = [];
let dataAvailable = false;
let dataAvailabilityCallbacks = [];

// UI state for history management
let filteredScanHistory = [...scanHistory];
let showAllRecords = true;
let defaultMaxRecords = 100;
let searchDebounceTimer = null;

// Default scan status
let scanStatus = "pending";

// ========================================
// Application Initialization
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize core application
    initializeApp();
});

function initializeApp() {
    if (window.DebugLogger) {
        window.DebugLogger.info('app-core', 'Initializing core application');
    }
    
    // Load scan history from localStorage
    loadScanHistory();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize UI components
    initializeExpandableTicketIds();
    initializeSearchAndFilter();
    
    // Set initial data availability state
    updateDataAvailability();
    
    // Register callbacks for theme and language changes
    registerSystemCallbacks();
    
    // Initialize scanner controls
    initializeScannerControls();
}

function loadScanHistory() {
    try {
        const savedHistory = localStorage.getItem('scanHistory');
        if (savedHistory) {
            scanHistory = JSON.parse(savedHistory);
            filteredScanHistory = [...scanHistory];
            if (window.DebugLogger) {
                window.DebugLogger.info('app-core', 'Scan history loaded from storage', {
                    historyCount: scanHistory.length
                });
            }
        }
    } catch (error) {
        console.error('Error loading scan history:', error);
        if (window.DebugLogger) {
            window.DebugLogger.error('app-core', 'Failed to load scan history from storage', error);
        }
    }
}

function registerSystemCallbacks() {
    // Register language change callback
    if (typeof window.LanguageManager !== 'undefined') {
        window.LanguageManager.registerCallback(function(language) {
            updateDataAvailability();
            updateHistoryDisplay();
        });
    }
    
    // Register theme change callback for icon updates
    if (typeof window.ThemeManager !== 'undefined') {
        window.ThemeManager.registerCallback(function(theme) {
            const availability = checkDataAvailability();
            updateCompactDataStatusIndicator(availability);
        });
    }
    
    // Register data availability callback for scanner
    registerDataAvailabilityCallback(function(available, availabilityInfo) {
        if (window.DebugLogger) {
            window.DebugLogger.info('app-core', 'Data availability changed', { available, availabilityInfo });
        }
    });
}

// ========================================
// Global API - Make functions available to other modules
// ========================================

// Export core functions to global scope for backward compatibility
window.AppCore = {
    // Data management
    isDataAvailable,
    getDataAvailabilityInfo,
    registerDataAvailabilityCallback,
    removeDataAvailabilityCallback,
    updateStatistics,
    
    // Page navigation
    changePage,
    
    // Scan processing
    processScan,
    validateTicketId,
    
    // History management
    clearScanHistory,
    exportScanHistory,
    toggleShowAll,
    
    // State access
    getCurrentData: () => currentData,
    getScanHistory: () => scanHistory,
    getFilteredScanHistory: () => filteredScanHistory
};

// ========================================
// File Processing and Data Management
// ========================================

// Constants
const XLS_SIGNATURE = [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1];
const BASE58_REGEX = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{22,44}$/;

// DOM Elements - File Processing
const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const fileInfo = document.getElementById('fileInfo');
const clientInfo = document.getElementById('clientInfo');
const storeInfo = document.getElementById('storeInfo');
const tableBody = document.getElementById('tableBody');
const rowsPerPageSelect = document.getElementById('rowsPerPage');
const pagination = document.getElementById('pagination');

// DOM Elements - Scanner
const video = document.getElementById('qrVideo');
const canvas = document.getElementById('qrCanvas');
const context = canvas?.getContext('2d', { willReadFrequently: true });
const startButton = document.getElementById('startScan');
const stopButton = document.getElementById('stopScan');
const scanResult = document.getElementById('scanResult');
const scanData = document.getElementById('scanData');
const manualInput = document.getElementById('manualTicketId');
const submitManual = document.getElementById('submitManual');
const exportButton = document.getElementById('exportHistory');
const clearButton = document.getElementById('clearHistory');
const showAllButton = document.getElementById('showAllHistory');
const historyList = document.getElementById('scanHistory');
const scanMessageModal = document.getElementById('scanMessageModal');
const closeModalButton = document.getElementById('closeModal');

function setupEventListeners() {
    // File processing events
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
    if (dropZone) {
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('drop', handleDrop);
    }
    if (rowsPerPageSelect) {
        rowsPerPageSelect.addEventListener('change', handleRowsPerPageChange);
    }
    
    // Scanner events
    if (startButton) startButton.addEventListener('click', startScanner);
    if (stopButton) stopButton.addEventListener('click', stopScanner);
    if (submitManual) submitManual.addEventListener('click', handleManualEntry);
    if (exportButton) exportButton.addEventListener('click', exportScanHistory);
    if (clearButton) clearButton.addEventListener('click', clearScanHistory);
    if (showAllButton) showAllButton.addEventListener('click', toggleShowAll);
    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => {
            scanMessageModal.classList.remove('active');
            scanData.innerHTML = '';
            scanResult.textContent = '';
        });
    }
}

// File validation functions
async function checkFileSignature(file) {
    try {
        const buffer = await file.slice(0, 8).arrayBuffer();
        const bytes = new Uint8Array(buffer);
        return XLS_SIGNATURE.every((byte, index) => byte === bytes[index]);
    } catch (error) {
        console.error('Error checking file signature:', error);
        return false;
    }
}

async function isValidFileType(file) {
    const validType = 'application/vnd.ms-excel';
    const hasValidExtension = file.name.toLowerCase().endsWith('.xls');
    const hasValidMimeType = file.type === validType;
    
    if (window.DebugLogger) {
        window.DebugLogger.debug('app-core', 'File type validation started', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            expectedType: validType,
            hasValidExtension,
            hasValidMimeType
        });
    }
    
    if (!hasValidExtension || !hasValidMimeType) {
        console.warn('File failed basic type validation');
        if (window.DebugLogger) {
            window.DebugLogger.warn('app-core', 'File failed basic type validation', {
                fileName: file.name,
                fileType: file.type,
                hasValidExtension,
                hasValidMimeType
            });
        }
        return false;
    }
    
    const hasValidSignature = await checkFileSignature(file);
    if (!hasValidSignature) {
        console.warn('File failed signature validation');
        if (window.DebugLogger) {
            window.DebugLogger.warn('app-core', 'File failed signature validation', {
                fileName: file.name,
                fileSize: file.size
            });
        }
        return false;
    }
    
    if (window.DebugLogger) {
        window.DebugLogger.info('app-core', 'File validation successful', {
            fileName: file.name,
            fileSize: file.size
        });
    }
    
    return true;
}

async function validateFile(file) {
    if (!file) {
        throw new Error('No file selected');
    }
    
    const isValid = await isValidFileType(file);
    if (!isValid) {
        throw new Error('Invalid file type. Please upload only .xls files');
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('File size too large. Maximum size is 10MB');
    }
}

// File processing functions
async function processFile(file) {
    try {
        if (window.DebugLogger) {
            window.DebugLogger.info('app-core', 'Starting file processing', {
                fileName: file.name,
                fileSize: file.size
            });
        }
        
        await validateFile(file);
        
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, {
            type: 'array',
            cellDates: true,
            cellNF: true,
            cellStyles: true
        });
        
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const clientId = worksheet['B1']?.v || 'N/A';
        const storeName = worksheet['B2']?.v || 'N/A';
        
        const data = XLSX.utils.sheet_to_json(worksheet, {
            range: 4,
            header: ['date', 'time', 'invoiceId', 'unused1', 'unused2', 'unused3', 'unused4', 'lnurlComment']
        });
        
        const processedData = data.map(row => ({
            date: formatDate(row.date),
            time: row.time || '',
            invoiceId: row.invoiceId || '',
            lnurlComment: row.lnurlComment || ''
        }));
        
        if (window.DebugLogger) {
            window.DebugLogger.info('app-core', 'File processing completed', {
                fileName: file.name,
                clientId,
                storeName,
                totalRows: processedData.length,
                validTickets: processedData.filter(row => row.invoiceId && row.invoiceId.trim() !== '').length
            });
        }
        
        return {
            clientId,
            storeName,
            data: processedData
        };
    } catch (error) {
        if (window.DebugLogger) {
            window.DebugLogger.error('app-core', 'File processing failed', error);
        }
        throw new Error(`Error processing file: ${error.message}`);
    }
}

function formatDate(date) {
    if (!date) return '';
    if (date instanceof Date) {
        return date.toLocaleDateString();
    }
    return date.toString();
}

// File event handlers
async function handleFileSelect(event) {
    const file = event.target?.files?.[0];
    if (!file) {
        console.error('No file selected');
        return;
    }
    
    try {
        if (fileInfo) {
            fileInfo.style.display = 'block';
            fileInfo.textContent = 'Validating file...';
        }
        
        const processedData = await processFile(file);
        updateDisplay(processedData);
        updateStatistics();
        
        if (fileInfo) {
            fileInfo.style.display = 'block';
            fileInfo.textContent = `File processed successfully: ${file.name}`;
        }
        
        // Auto-close options menu after successful upload
        const optionsMenu = document.getElementById('optionsMenu');
        if (optionsMenu && optionsMenu.classList.contains('active')) {
            setTimeout(() => {
                optionsMenu.classList.remove('active');
                const optionsIcon = document.getElementById('optionsIcon');
                if (optionsIcon && typeof IconLibrary !== 'undefined' && window.IconLibrary) {
                    optionsIcon.innerHTML = window.IconLibrary.getIcon('menu', '20');
                }
            }, 500);
        }
        
        if (window.UIEnhancements && window.UIEnhancements.clearFileUploadLoading) {
            window.UIEnhancements.clearFileUploadLoading();
        }
    } catch (error) {
        console.error('Error handling file:', error);
        if (fileInfo) {
            fileInfo.style.display = 'block';
            fileInfo.textContent = error.message;
        }
        
        if (window.UIEnhancements && window.UIEnhancements.clearFileUploadLoading) {
            window.UIEnhancements.clearFileUploadLoading();
        }
    }
}

function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    if (dropZone) dropZone.classList.add('dragover');
}

async function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    if (dropZone) dropZone.classList.remove('dragover');
    
    const file = event.dataTransfer.files[0];
    if (!file) return;
    
    if (fileInput) fileInput.files = event.dataTransfer.files;
    await handleFileSelect({ target: { files: [file] } });
}

function handleRowsPerPageChange(event) {
    rowsPerPage = parseInt(event.target.value);
    currentPage = 1;
    updateTable();
    updatePagination();
}

// ========================================
// Display and UI Management
// ========================================

function updateDisplay(processedData) {
    currentData = processedData;
    
    if (window.DebugLogger) {
        window.DebugLogger.info('app-core', 'Updating display with processed data', {
            totalRows: processedData.data ? processedData.data.length : 0,
            clientId: processedData.clientId,
            storeName: processedData.storeName
        });
    }
    
    updateDataAvailability();
    updateTable();
    updatePagination();
}

function updateTable() {
    if (!currentData) return;
    
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = currentData.data.slice(start, end);
    
    let scannedTickets = [];
    try {
        const savedHistory = localStorage.getItem('scanHistory');
        if (savedHistory) {
            scannedTickets = JSON.parse(savedHistory).map(scan => scan.ticketId);
        }
    } catch (error) {
        console.error('Error loading scan history:', error);
    }
    
    tableBody.innerHTML = pageData.map(row => {
        const isScanned = scannedTickets.includes(row.invoiceId.trim());
        const scannedTableRowClass = isScanned ? `status-${scanStatus}` : '';

        return `
            <tr class="${scannedTableRowClass}">
                <td>${row.date}</td>
                <td>${row.time}</td>
                <td>${row.invoiceId}</td>
                <td>${row.lnurlComment}</td>
            </tr>
        `;
    }).join('');
}

function updatePagination() {
    if (!currentData) return;
    
    const totalPages = Math.ceil(currentData.data.length / rowsPerPage);
    const paginationHTML = [];
    
    paginationHTML.push(`
        <button ${currentPage === 1 ? 'disabled' : ''} 
                onclick="window.AppCore.changePage(${currentPage - 1})">
            Previous
        </button>
    `);
    
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML.push(`
            <button class="${currentPage === i ? 'active' : ''}"
                    onclick="window.AppCore.changePage(${i})">
                ${i}
            </button>
        `);
    }
    
    paginationHTML.push(`
        <button ${currentPage === totalPages ? 'disabled' : ''} 
                onclick="window.AppCore.changePage(${currentPage + 1})">
            Next
        </button>
    `);
    
    pagination.innerHTML = paginationHTML.join('');
}

function changePage(page) {
    currentPage = page;
    updateTable();
    updatePagination();
}

function updateStatistics() {
    if (!currentData || !currentData.data) return;
    
    const totalTickets = currentData.data.length;
    const scannedTickets = scanHistory.reduce((acc, scan) => {
        if (scan.status === 'valid') acc.valid++;
        else if (scan.status === 'duplicate') acc.duplicate++;
        else if (scan.status === 'invalid') acc.invalid++;
        scanStatus = scan.status;
        return acc;
    }, { valid: 0, duplicate: 0, invalid: 0 });
    
    const remainingTickets = totalTickets - scannedTickets.valid;

    document.getElementById('totalTickets').textContent = totalTickets;
    document.getElementById('validTickets').textContent = scannedTickets.valid;
    document.getElementById('duplicateTickets').textContent = scannedTickets.duplicate;
    document.getElementById('invalidTickets').textContent = scannedTickets.invalid;
    document.getElementById('remainingTickets').textContent = remainingTickets;
}

// ========================================
// Data Availability Management
// ========================================

function checkDataAvailability() {
    const hasData = currentData && 
                   currentData.data && 
                   Array.isArray(currentData.data) && 
                   currentData.data.length > 0;
    
    const hasValidTickets = hasData && currentData.data.some(row => 
        row.invoiceId && row.invoiceId.trim() !== ''
    );
    
    return {
        available: hasValidTickets,
        ticketCount: hasData ? currentData.data.length : 0,
        validTicketCount: hasData ? currentData.data.filter(row => 
            row.invoiceId && row.invoiceId.trim() !== ''
        ).length : 0,
        clientId: currentData?.clientId || null,
        storeName: currentData?.storeName || null
    };
}

function updateDataAvailability() {
    const availability = checkDataAvailability();
    const wasAvailable = dataAvailable;
    dataAvailable = availability.available;
    
    updateDataAvailabilityUI(availability);
    
    if (wasAvailable !== dataAvailable) {
        dataAvailabilityCallbacks.forEach(callback => {
            try {
                callback(dataAvailable, availability);
            } catch (error) {
                console.error('Error in data availability callback:', error);
            }
        });
    }
    
    return availability;
}

function registerDataAvailabilityCallback(callback) {
    if (typeof callback === 'function') {
        dataAvailabilityCallbacks.push(callback);
    }
}

function removeDataAvailabilityCallback(callback) {
    const index = dataAvailabilityCallbacks.indexOf(callback);
    if (index > -1) {
        dataAvailabilityCallbacks.splice(index, 1);
    }
}

function updateDataAvailabilityUI(availability) {
    updateScannerAvailability(availability.available);
    updateCompactDataStatusIndicator(availability);
    
    if (availability.available) {
        if (clientInfo) clientInfo.innerHTML = `<strong data-i18n="clientId">Client ID:</strong> ${availability.clientId || 'N/A'}`;
        if (storeInfo) storeInfo.innerHTML = `<strong data-i18n="storeName">Store Name:</strong> ${availability.storeName || 'N/A'}`;
    } else {
        if (clientInfo) clientInfo.innerHTML = `<strong data-i18n="status">Status:</strong> <span class="data-status-unavailable" data-i18n="noDataLoaded">No XLS data loaded</span>`;
        if (storeInfo) storeInfo.innerHTML = `<strong data-i18n="action">Action:</strong> <span data-i18n="pleaseUpload">Please upload a valid XLS file to begin</span>`;
    }
    
    if (typeof window.LanguageManager !== 'undefined') {
        window.LanguageManager.updateUI();
    }
}

function updateScannerAvailability(available) {
    if (startButton) {
        startButton.disabled = !available;
        if (available) {
            startButton.title = window.LanguageManager ? window.LanguageManager.get('startScanner') : 'Start Scanner';
        } else {
            startButton.title = window.LanguageManager ? window.LanguageManager.get('noDataLoaded') : 'Upload XLS data first';
        }
    }
    
    if (manualInput) {
        manualInput.disabled = !available;
        if (available) {
            manualInput.setAttribute('data-i18n', 'enterTicketId');
            manualInput.placeholder = window.LanguageManager ? window.LanguageManager.get('enterTicketId') : 'Enter Ticket ID manually';
        } else {
            manualInput.removeAttribute('data-i18n');
            manualInput.placeholder = window.LanguageManager ? window.LanguageManager.get('noDataLoaded') : 'Upload XLS data first';
        }
    }
    
    if (submitManual) {
        submitManual.disabled = !available;
        if (available) {
            submitManual.title = window.LanguageManager ? window.LanguageManager.get('submitTicket') : 'Submit';
        } else {
            submitManual.title = window.LanguageManager ? window.LanguageManager.get('noDataLoaded') : 'Upload XLS data first';
        }
    }
}

function updateCompactDataStatusIndicator(availability) {
    const statusCompact = document.getElementById('dataStatusCompact');
    const statusIcon = document.getElementById('statusIcon');
    const statusText = document.getElementById('statusText');
    
    if (statusCompact && statusIcon && statusText) {
        if (availability.available) {
            statusCompact.className = 'data-status-compact available';
            statusIcon.innerHTML = window.IconLibrary ? window.IconLibrary.getIcon('check', '16') : '✓';
            statusText.setAttribute('data-i18n', 'dataAvailable');
            statusText.setAttribute('data-i18n-params', JSON.stringify({count: availability.validTicketCount}));
        } else {
            statusCompact.className = 'data-status-compact unavailable';
            statusIcon.innerHTML = window.IconLibrary ? window.IconLibrary.getIcon('warning', '16') : '⚠';
            statusText.setAttribute('data-i18n', 'dataUnavailable');
            statusText.removeAttribute('data-i18n-params');
        }
        
        if (typeof window.LanguageManager !== 'undefined') {
            window.LanguageManager.updateUI();
        }
    }
}

function isDataAvailable() {
    return dataAvailable;
}

function getDataAvailabilityInfo() {
    return checkDataAvailability();
}

// ========================================
// QR Scanner Functions
// ========================================

function initializeScannerControls() {
    // Initialize Show All button with proper icon
    setTimeout(() => {
        const buttonIcon = showAllButton?.querySelector(".button-icon");
        if (buttonIcon && window.IconLibrary) {
            if (showAllRecords) {
                buttonIcon.innerHTML = window.IconLibrary.getIcon("list", "16");
            } else {
                buttonIcon.innerHTML = window.IconLibrary.getIcon("database", "16");
            }
        }
    }, 100);
}

function drawLine(begin, end, color) {
    if (!context) return;
    context.beginPath();
    context.moveTo(begin.x, begin.y);
    context.lineTo(end.x, end.y);
    context.lineWidth = 4;
    context.strokeStyle = color;
    context.stroke();
}

function startScanner() {
    if (typeof isDataAvailable === 'function' && !isDataAvailable()) {
        updateScanResult('No XLS data loaded. Please upload a valid XLS file first.', 'invalid');
        if (window.DebugLogger) {
            window.DebugLogger.warn('app-core', 'Scanner start failed - no XLS data available');
        }
        return;
    }
    
    if (window.DebugLogger) {
        window.DebugLogger.info('app-core', 'Starting QR code scanner');
    }
    
    try {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(function(stream) {
            if (window.DebugLogger) {
                window.DebugLogger.info('app-core', 'Camera access granted', {
                    videoTracks: stream.getVideoTracks().length,
                    audioTracks: stream.getAudioTracks().length
                });
            }
            
            video.srcObject = stream;
            video.play();
            scanning = true;
            startButton.disabled = true;
            stopButton.disabled = false;
            requestAnimationFrame(scanQRCode);
        }).catch(function(error) {
            console.error('Error accessing camera:', error);
            if (window.DebugLogger) {
                window.DebugLogger.error('app-core', 'Failed to access camera', error);
            }
            scanResult.textContent = 'Error accessing camera. Please check permissions.';
            scanResult.className = 'scan-result invalid';
        });
        
    } catch (error) {
        console.error('Error accessing camera:', error);
        if (window.DebugLogger) {
            window.DebugLogger.error('app-core', 'Camera access error', error);
        }
        scanResult.textContent = 'Error accessing camera. Please check permissions.';
        scanResult.className = 'scan-result invalid';
    }
}

function stopScanner() {
    if (window.DebugLogger) {
        window.DebugLogger.info('app-core', 'Stopping QR code scanner');
    }
    
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
    scanning = false;
    startButton.disabled = false;
    stopButton.disabled = true;
}

function scanQRCode() {
    if (!scanning || !canvas || !context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        try {
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code) {
                console.log('QR Code detected:', code.data);
                
                drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF4D00");
                drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF4D00");
                drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF4D00");
                drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF4D00");
                
                const ticketId = extractTicketId(code.data);
                const resultMessage = `Data: ${code.data}<br>Ticket ID: ${ticketId || 'Not found'}`;

                scanData.innerHTML = resultMessage;
                scanData.className = 'scan-data message';
                
                if (ticketId) {
                    if (!BASE58_REGEX.test(ticketId)) {
                        updateScanResult('Invalid or missing ticket ID format.', 'invalid');
                        stopScanner();
                        return;
                    }
                    handleScan(code.data);
                } else {
                    updateScanResult('Invalid or missing ticket ID format.', 'invalid');
                    stopScanner();
                    return;
                }
            }
        } catch (error) {
            console.error('Error processing QR code:', error);
        }
    }
    
    requestAnimationFrame(scanQRCode);
}

function extractTicketId(url) {
    try {
        const match = url.match(/\/i\/([^\/]+)\/receipt/);
        return match ? match[1] : null;
    } catch (error) {
        return null;
    }
}

function validateTicketId(ticketId) {
    if (!ticketId || !currentData) return { valid: false, message: 'Invalid ticket ID' };
    
    const normalizedTicketId = ticketId.trim();
    console.log('Searching for ticket:', normalizedTicketId);
    console.log('Available tickets:', currentData.data.map(row => row.invoiceId));
    
    const ticket = currentData.data.find(row => 
        row.invoiceId && row.invoiceId.trim() === normalizedTicketId
    );
    if (!ticket) return { valid: false, message: 'Ticket not found in database' };
    
    const previousScan = scanHistory.find(scan => scan.ticketId === ticketId);
    if (previousScan) {
        return { 
            valid: true, 
            duplicate: true, 
            message: `Ticket already scanned at ${new Date(previousScan.timestamp).toLocaleString()}`
        };
    }
    
    return { valid: true, duplicate: false, message: 'Valid ticket' };
}

async function handleScan(qrData) {
    const ticketId = extractTicketId(qrData);
    if (!ticketId) {
        updateScanResult('Invalid QR code format', 'invalid');
        return;
    }
    
    processScan(ticketId);
}

function handleManualEntry() {
    if (typeof isDataAvailable === 'function' && !isDataAvailable()) {
        updateScanResult('No XLS data loaded. Please upload a valid XLS file first.', 'invalid');
        return;
    }
    
    const ticketId = manualInput.value.trim();
    
    if (!ticketId) {
        updateScanResult('Please enter a ticket ID', 'invalid');
        return;
    }
    
    if (!BASE58_REGEX.test(ticketId)) {
        updateScanResult('Invalid ticket ID format.', 'invalid');
        return;
    }
    
    processScan(ticketId);
    manualInput.value = '';
}

function processScan(ticketId) {
    const validation = validateTicketId(ticketId);

    const scan = {
        ticketId,
        timestamp: Date.now(),
        method: 'scan',
        status: validation.valid ? (validation.duplicate ? 'duplicate' : 'valid') : 'invalid'
    };
    
    scanHistory.unshift(scan);
    
    if (typeof filteredScanHistory !== 'undefined') {
        filterScanHistory();
    }
    
    saveScanHistory();
    
    if (!validation.valid) {
        updateScanResult(validation.message, 'invalid');
        stopScanner();
    } else if (validation.duplicate) {
        updateScanResult(validation.message, 'duplicate');
        stopScanner();
    } else {
        updateScanResult('Ticket validated successfully', 'valid');
        stopScanner();
    }

    updateStatistics();
    updateHistoryDisplay();
    updateTable();
}

function updateScanResult(message, status) {
    const localizedMessage = getLocalizedScanMessage(message, status);
    
    scanResult.textContent = localizedMessage;
    scanResult.className = `scan-result ${status}`;
    scanData.className = `scan-data ${status}`;
    scanMessageModal.classList.add('active');
}

function getLocalizedScanMessage(message, status) {
    if (typeof window.LanguageManager === 'undefined') {
        return message;
    }
    
    const messageMap = {
        'Ticket validated successfully': 'validTicket',
        'Invalid ticket': 'invalidTicket',
        'Ticket already scanned': 'duplicateTicket',
        'No XLS data loaded. Please upload a valid XLS file first.': 'noDataLoaded',
        'Invalid ticket ID format': 'invalidFormat',
        'Ticket not found in database': 'ticketNotFound'
    };
    
    const key = messageMap[message];
    return key ? window.LanguageManager.get(key) : message;
}

function getStatusText(status) {
    if (typeof window.LanguageManager !== 'undefined') {
        return window.LanguageManager.get(status) || status;
    }
    
    const statusMapping = {
        valid: 'Valid',
        invalid: 'Invalid',
        duplicate: 'Duplicate'
    };
    
    return statusMapping[status] || status;
}

function saveScanHistory() {
    try {
        localStorage.setItem('scanHistory', JSON.stringify(scanHistory));
    } catch (error) {
        console.error('Error saving scan history:', error);
    }
}

// ========================================
// History Management and Display
// ========================================

// Utility functions for ticket ID display
function abbreviateTicketId(ticketId) {
    if (!ticketId || ticketId.length <= 8) {
        return ticketId;
    }
    return `${ticketId.substring(0, 4)}...${ticketId.substring(ticketId.length - 4)}`;
}

function createExpandableTicketId(ticketId, className = '') {
    if (!ticketId) return '<span class="ticket-id-error">N/A</span>';
    
    const abbreviated = abbreviateTicketId(ticketId);
    const isAbbreviated = abbreviated !== ticketId;
    
    if (!isAbbreviated) {
        return `<span class="ticket-id ${className}">${ticketId}</span>`;
    }
    
    return `
        <span class="ticket-id expandable ${className}" 
              data-full-id="${ticketId}" 
              data-abbreviated="${abbreviated}"
              title="Click to expand full ID: ${ticketId}"
              tabindex="0"
              role="button"
              aria-label="Abbreviated ticket ID ${abbreviated}, click to expand full ID">
            ${abbreviated}
        </span>
    `;
}

function initializeExpandableTicketIds() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('expandable')) {
            toggleTicketIdExpansion(e.target);
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('expandable')) {
            e.preventDefault();
            toggleTicketIdExpansion(e.target);
        }
    });
}

function toggleTicketIdExpansion(element) {
    const fullId = element.dataset.fullId;
    const abbreviated = element.dataset.abbreviated;
    const isExpanded = element.classList.contains('expanded');
    
    if (isExpanded) {
        element.textContent = abbreviated;
        element.classList.remove('expanded');
        element.title = `Click to expand full ID: ${fullId}`;
        element.setAttribute('aria-label', `Abbreviated ticket ID ${abbreviated}, click to expand full ID`);
    } else {
        element.textContent = fullId;
        element.classList.add('expanded');
        element.title = 'Click to collapse to abbreviated form';
        element.setAttribute('aria-label', `Full ticket ID ${fullId}, click to collapse`);
    }
}

function updateHistoryDisplay() {
    let historyToShow = typeof filteredScanHistory !== 'undefined' ? filteredScanHistory : scanHistory;

    if (!showAllRecords && historyToShow.length > defaultMaxRecords) {
        historyToShow = historyToShow.slice(0, defaultMaxRecords);
    }
    
    if (scanHistory.length === 0) {
        historyList.innerHTML = `<div class="no-data" data-i18n="noScansYet">No scans yet</div>`;
    } else if (historyToShow.length === 0) {
        historyList.innerHTML = `<div class="no-data" data-i18n="noMatchingScans">No matching scans found</div>`;
    } else {
        historyList.innerHTML = `
            <div class="history-table-container">
                <table class="history-table" role="table" aria-label="Scan history">
                    <thead>
                        <tr role="row">
                            <th scope="col" class="ticket-id-header" data-i18n="ticketId">Ticket ID</th>
                            <th scope="col" class="status-header" data-i18n="status">Status</th>
                            <th scope="col" class="timestamp-header" data-i18n="timestamp">Time</th>
                            <th scope="col" class="method-header" data-i18n="method">Method</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${historyToShow.map(scan => {
                            return `
                            <tr class="history-row" data-status="${scan.status}" role="row">
                                <td class="ticket-id-cell ticket-id-col" role="gridcell">
                                    ${createExpandableTicketId(scan.ticketId, "history-ticket-id")}
                                </td>
                                <td class="status-cell status-col"  role="gridcell">
                                    <span class="status-badge ${scan.status}" title="${getStatusText(scan.status)}">${getStatusText(scan.status)}</span>
                                </td>
                                <td class="timestamp-cell timestamp-col"  role="gridcell">
                                    <span class="timestamp" title="${new Date(scan.timestamp).toLocaleString()}">
                                        ${formatTimestamp(scan.timestamp)}
                                    </span>
                                </td>
                                <td class="method-cell method-col"  role="gridcell">
                                    <span class="scan-method" title="Scan method: ${scan.method}">${scan.method}</span>
                                </td>
                            </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    if (typeof window.LanguageManager !== 'undefined') {
        window.LanguageManager.updateUI();
    }
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
}

function toggleShowAll() {
    showAllRecords = !showAllRecords;
    
    const buttonText = showAllButton?.querySelector('[data-i18n]');
    const buttonIcon = showAllButton?.querySelector('.button-icon');
    
    if (showAllRecords) {
        if (buttonText) buttonText.setAttribute('data-i18n', 'showAll');
        if (buttonIcon) {
            if (window.IconLibrary) {
                buttonIcon.innerHTML = window.IconLibrary.getIcon("list", "16");
            } else {
                buttonIcon.textContent = "📋";
            }
        }
        if (buttonText) buttonText.textContent = 'Show All';
    } else {
        if (buttonText) buttonText.setAttribute('data-i18n', 'showLimited');
        if (buttonIcon) {
            if (window.IconLibrary) {
                buttonIcon.innerHTML = window.IconLibrary.getIcon("database", "16");
            } else {
                buttonIcon.textContent = "📄";
            }
        }
        if (buttonText) buttonText.textContent = `Show Limited (${defaultMaxRecords})`;
    }
    
    updateHistoryDisplay();
    updateHistoryStats();
}

function clearScanHistory() {
    const confirmMessage = typeof window.LanguageManager !== 'undefined' ? 
        window.LanguageManager.get('confirmClearHistory') || 'Are you sure you want to clear the scan history?' :
        'Are you sure you want to clear the scan history?';
        
    if (confirm(confirmMessage)) {
        scanHistory = [];
        saveScanHistory();
        updateHistoryDisplay();
        updateStatistics();
    }
}

async function exportScanHistory() {
    const allRecords = scanHistory;
    
    if (allRecords.length === 0) {
        const message = typeof window.LanguageManager !== 'undefined' ? 
            window.LanguageManager.get('noDataToExport') || 'No scan history data to export' :
            'No scan history data to export';
        alert(message);
        return;
    }
    
    const headers = ['Ticket ID', 'Status', 'ISO Timestamp', 'Method', 'Date', 'Time'];
    const csvData = [
        headers,
        ...allRecords.map(scan => {
            const date = new Date(scan.timestamp);
            return [
                scan.ticketId,
                scan.status,
                formatTimestamp(scan.timestamp),
                scan.method,
                date.toLocaleDateString(),
                date.toLocaleTimeString()
            ];
        })
    ];
    
    const csvContent = csvData.map(row => 
        row.map(field => {
            const stringField = String(field || '');
            if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
                return `"${stringField.replace(/"/g, '""')}"`;
            }
            return stringField;
        }).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-history-complete-${new Date().toISOString().split('T')[0]}.csv`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (window.DebugLogger) {
        window.DebugLogger.info('app-core', 'Complete scan history exported successfully', {
            recordCount: allRecords.length,
            filename: a.download,
            exportType: 'complete-dataset'
        });
    }
    
    showExportSuccessMessage(allRecords.length);
}

function showExportSuccessMessage(recordCount) {
    let message;
    if (typeof window.LanguageManager !== 'undefined') {
        const template = window.LanguageManager.get('exportSuccess');
        message = template ? template.replace('{count}', recordCount) : `Successfully exported ${recordCount} scan records`;
    } else {
        message = `Successfully exported ${recordCount} scan records`;
    }
    
    const toast = document.createElement('div');
    toast.className = 'export-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--success-color, #22c55e);
        color: white;
        padding: 12px 16px;
        border-radius: var(--border-radius, 8px);
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        font-size: 0.9rem;
        max-width: 300px;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 100);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Search and filter functionality
function filterScanHistory() {
    const searchTerm = document.getElementById('historySearch')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    
    filteredScanHistory = scanHistory.filter(scan => {
        const matchesSearch = searchTerm === '' || 
            scan.ticketId.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || scan.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    updateHistoryDisplay();
    updateHistoryStats();
}

function debouncedFilterSearch() {
    if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
    }
    
    searchDebounceTimer = setTimeout(() => {
        filterScanHistory();
        
        const visibleCount = filteredScanHistory.length;
        const totalCount = scanHistory.length;
        if (window.UIEnhancements && window.UIEnhancements.announceToScreenReader) {
            window.UIEnhancements.announceToScreenReader(
                `Showing ${visibleCount} of ${totalCount} scan results`
            );
        }
    }, 300);
}

function updateHistoryStats() {
    const visibleCountEl = document.getElementById('visibleCount');
    const totalCountEl = document.getElementById('totalCount');
    const historyCountText = document.getElementById('historyCountText');
    
    if (visibleCountEl) visibleCountEl.textContent = filteredScanHistory.length;
    if (totalCountEl) totalCountEl.textContent = scanHistory.length;
    
    if (historyCountText && typeof window.LanguageManager !== 'undefined') {
        const template = window.LanguageManager.get('showingResults') || 'Showing {visible} of {total} scans';
        
        const visibleSpan = `<span id="visibleCount">${filteredScanHistory.length}</span>`;
        const totalSpan = `<span id="totalCount">${scanHistory.length}</span>`;
        
        const translatedText = template
            .replace('{visible}', visibleSpan)
            .replace('{total}', totalSpan);
            
        historyCountText.innerHTML = translatedText;
    }
}

function initializeSearchAndFilter() {
    const searchInput = document.getElementById('historySearch');
    const statusFilter = document.getElementById('statusFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', debouncedFilterSearch);
        
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                searchInput.value = '';
                filterScanHistory();
            }
        });
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            filterScanHistory();
            const selectedText = statusFilter.options[statusFilter.selectedIndex].text;
            if (window.UIEnhancements && window.UIEnhancements.announceToScreenReader) {
                window.UIEnhancements.announceToScreenReader(
                    `Filter changed to ${selectedText}. Showing ${filteredScanHistory.length} results`
                );
            }
        });
    }
    
    updateHistoryStats();
}

// Initialize history display
updateHistoryDisplay();