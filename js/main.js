// Global variables
let currentData = null;
let currentPage = 1;
let rowsPerPage = 5;

// DOM Elements
const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const fileInfo = document.getElementById('fileInfo');
const clientInfo = document.getElementById('clientInfo');
const storeInfo = document.getElementById('storeInfo');
const tableBody = document.getElementById('tableBody');
const rowsPerPageSelect = document.getElementById('rowsPerPage');
const pagination = document.getElementById('pagination');

// XLS file signature (D0 CF 11 E0 A1 B1 1A E1)
const XLS_SIGNATURE = [0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1];

// Default value for scan status
scanStatus = "pending";

// Data availability status
let dataAvailable = false;
let dataAvailabilityCallbacks = [];

// Event Listeners
fileInput.addEventListener('change', handleFileSelect);
dropZone.addEventListener('dragover', handleDragOver);
dropZone.addEventListener('drop', handleDrop);
rowsPerPageSelect.addEventListener('change', handleRowsPerPageChange);

// Function to check file signature
async function checkFileSignature(file) {
    try {
        // Read the first 8 bytes of the file
        const buffer = await file.slice(0, 8).arrayBuffer();
        const bytes = new Uint8Array(buffer);
        
        // Compare with XLS signature
        return XLS_SIGNATURE.every((byte, index) => byte === bytes[index]);
    } catch (error) {
        console.error('Error checking file signature:', error);
        return false;
    }
}

// Enhanced file type validation
async function isValidFileType(file) {
    // Check file extension and MIME type
    const validType = 'application/vnd.ms-excel';
    const hasValidExtension = file.name.toLowerCase().endsWith('.xls');
    const hasValidMimeType = file.type === validType;
    
    // If basic checks fail, return false
    if (!hasValidExtension || !hasValidMimeType) {
        console.warn('File failed basic type validation');
        return false;
    }
    
    // Check file signature
    const hasValidSignature = await checkFileSignature(file);
    if (!hasValidSignature) {
        console.warn('File failed signature validation');
        return false;
    }
    
    return true;
}

// Update the validateFile function to use async/await
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

// File Processing Functions
async function processFile(file) {
    try {
        validateFile(file);
        
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, {
            type: 'array',
            cellDates: true,
            cellNF: true,
            cellStyles: true
        });
        
        // Get the first sheet
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Extract metadata
        const clientId = worksheet['B1']?.v || 'N/A';
        const storeName = worksheet['B2']?.v || 'N/A';
        
        // Extract table data starting from row 4
        const data = XLSX.utils.sheet_to_json(worksheet, {
            range: 4, // Start from row 5 (0-based index)
            header: ['date', 'time', 'invoiceId', 'unused1', 'unused2', 'unused3', 'unused4', 'lnurlComment']
        });
        
        // Filter only required columns and validate data
        const processedData = data.map(row => ({
            date: formatDate(row.date),
            time: row.time || '',
            invoiceId: row.invoiceId || '',
            lnurlComment: row.lnurlComment || ''
        }));
        
        return {
            clientId,
            storeName,
            data: processedData
        };
    } catch (error) {
        throw new Error(`Error processing file: ${error.message}`);
    }
}

// Helper Functions
function formatDate(date) {
    if (!date) return '';
    if (date instanceof Date) {
        return date.toLocaleDateString();
    }
    return date.toString();
}

function updateDisplay(processedData) {
    currentData = processedData;
    
    // Update data availability status
    updateDataAvailability();
    
    // Update table
    updateTable();
    updatePagination();
}

function updateTable() {
    if (!currentData) return;
    
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = currentData.data.slice(start, end);
    
    // Get scanned tickets from localStorage
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
        if (isScanned) {
            scannedTableRowClass = "status-" + scanStatus;
        }
        else {
            scannedTableRowClass = ''
        }

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
    
    // Previous button
    paginationHTML.push(`
        <button ${currentPage === 1 ? 'disabled' : ''} 
                onclick="changePage(${currentPage - 1})">
            Previous
        </button>
    `);
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML.push(`
            <button class="${currentPage === i ? 'active' : ''}"
                    onclick="changePage(${i})">
                ${i}
            </button>
        `);
    }
    
    // Next button
    paginationHTML.push(`
        <button ${currentPage === totalPages ? 'disabled' : ''} 
                onclick="changePage(${currentPage + 1})">
            Next
        </button>
    `);
    
    pagination.innerHTML = paginationHTML.join('');
}

// Function to update the statistics
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

// Update the handleFileSelect function to handle async validation
async function handleFileSelect(event) {
    const file = event.target?.files?.[0];
    if (!file) {
        console.error('No file selected');
        return;
    }
    
    try {
        // Show processing message
        if (fileInfo) {
            fileInfo.style.display = 'block';
            fileInfo.textContent = 'Validating file...';
        }
        
        // Validate file first
        await validateFile(file);
        
        // Then process the file
        const processedData = await processFile(file);
        updateDisplay(processedData);
        updateStatistics();
        
        if (fileInfo) {
            fileInfo.style.display = 'block';
            fileInfo.textContent = `File processed successfully: ${file.name}`;
        }
    } catch (error) {
        console.error('Error handling file:', error);
        if (fileInfo) {
            fileInfo.style.display = 'block';
            fileInfo.textContent = error.message;
        }
    }
}

function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    dropZone.classList.add('dragover');
}

// Update the handleDrop function to handle async validation
async function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    dropZone.classList.remove('dragover');
    
    const file = event.dataTransfer.files[0];
    if (!file) return;
    
    fileInput.files = event.dataTransfer.files;
    await handleFileSelect({ target: { files: [file] } });
}

function handleRowsPerPageChange(event) {
    rowsPerPage = parseInt(event.target.value);
    currentPage = 1;
    updateTable();
    updatePagination();
}

// Navigation Functions
function changePage(page) {
    currentPage = page;
    updateTable();
    updatePagination();
}

// Data Availability Functions
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
    
    // Update UI elements to reflect data availability
    updateDataAvailabilityUI(availability);
    
    // Notify callbacks if status changed
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
    // Update scanner controls
    updateScannerAvailability(availability.available);
    
    // Update compact data status indicator
    updateCompactDataStatusIndicator(availability);
    
    // Update metadata panel
    if (availability.available) {
        clientInfo.innerHTML = `<strong data-i18n="clientId">Client ID:</strong> ${availability.clientId || 'N/A'}`;
        storeInfo.innerHTML = `<strong data-i18n="storeName">Store Name:</strong> ${availability.storeName || 'N/A'}`;
    } else {
        clientInfo.innerHTML = `<strong data-i18n="status">Status:</strong> <span class="data-status-unavailable" data-i18n="noDataLoaded">No XLS data loaded</span>`;
        storeInfo.innerHTML = `<strong data-i18n="action">Action:</strong> <span data-i18n="pleaseUpload">Please upload a valid XLS file to begin</span>`;
    }
    
    // Re-apply language translations after updating content
    if (typeof window.LanguageManager !== 'undefined') {
        window.LanguageManager.updateUI();
    }
}

function updateScannerAvailability(available) {
    const startButton = document.getElementById('startScan');
    const stopButton = document.getElementById('stopScan');
    const manualInput = document.getElementById('manualTicketId');
    const submitManual = document.getElementById('submitManual');
    
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
    // Update the compact data status indicator
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
        
        // Update language content
        if (typeof window.LanguageManager !== 'undefined') {
            window.LanguageManager.updateUI();
        }
    }
}

// Function to check if data is available (for external use)
function isDataAvailable() {
    return dataAvailable;
}

// Function to get data availability info (for external use)
function getDataAvailabilityInfo() {
    return checkDataAvailability();
}

// Initialize data availability status on page load
document.addEventListener('DOMContentLoaded', function() {
    // Set initial data availability state
    updateDataAvailability();
    
    // Register language change callback
    if (typeof window.LanguageManager !== 'undefined') {
        window.LanguageManager.registerCallback(function(language) {
            // Update placeholders and titles when language changes
            updateDataAvailability();
        });
    }
    
    // Register theme change callback for icon updates
    if (typeof window.ThemeManager !== 'undefined') {
        window.ThemeManager.registerCallback(function(theme) {
            // Update status icons when theme changes
            const availability = checkDataAvailability();
            updateCompactDataStatusIndicator(availability);
        });
    }
});