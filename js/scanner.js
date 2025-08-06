// Scanner state
let scanning = false;
let scanHistory = [];

// Load scan history from localStorage
try {
    const savedHistory = localStorage.getItem('scanHistory');
    if (savedHistory) {
        scanHistory = JSON.parse(savedHistory);
        if (window.DebugLogger) {
            window.DebugLogger.info('scanner', 'Scan history loaded from storage', {
                historyCount: scanHistory.length
            });
        }
    }
} catch (error) {
    console.error('Error loading scan history:', error);
    if (window.DebugLogger) {
        window.DebugLogger.error('scanner', 'Failed to load scan history from storage', error);
    }
}

// Base58 validation regex
const base58Regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{22,44}$/;

// Utility function to abbreviate ticket IDs
function abbreviateTicketId(ticketId) {
    if (!ticketId || ticketId.length <= 8) {
        return ticketId;
    }
    return `${ticketId.substring(0, 4)}...${ticketId.substring(ticketId.length - 4)}`;
}

// Utility function to create expandable ticket ID display
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

// Initialize expandable ticket ID functionality
function initExpandableTicketIds() {
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

// DOM Elements
const video = document.getElementById('qrVideo');
const canvas = document.getElementById('qrCanvas');
const context = canvas.getContext('2d', { willReadFrequently: true });
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

// Event Listeners
startButton.addEventListener('click', startScanner);
stopButton.addEventListener('click', stopScanner);
submitManual.addEventListener('click', handleManualEntry);
exportButton.addEventListener('click', exportScanHistory);
clearButton.addEventListener('click', clearScanHistory);
if (showAllButton) showAllButton.addEventListener('click', toggleShowAll);
closeModalButton.addEventListener('click', () => {
    scanMessageModal.classList.remove('active');
    scanData.innerHTML = '';
    scanResult.textContent = '';
});

// Stroke for QR code
function drawLine(begin, end, color) {
    context.beginPath();
    context.moveTo(begin.x, begin.y);
    context.lineTo(end.x, end.y);
    context.lineWidth = 4;
    context.strokeStyle = color;
    context.stroke();
}

// Scanner Functions
// async function startScanner() {
function startScanner() {
    // Check if XLS data is available before starting scanner
    if (typeof isDataAvailable === 'function' && !isDataAvailable()) {
        updateScanResult('No XLS data loaded. Please upload a valid XLS file first.', 'invalid');
        if (window.DebugLogger) {
            window.DebugLogger.warn('scanner', 'Scanner start failed - no XLS data available');
        }
        return;
    }
    
    if (window.DebugLogger) {
        window.DebugLogger.info('scanner', 'Starting QR code scanner');
    }
    
    try {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(function(stream) {
            if (window.DebugLogger) {
                window.DebugLogger.info('scanner', 'Camera access granted', {
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
                window.DebugLogger.error('scanner', 'Failed to access camera', error);
            }
            scanResult.textContent = 'Error accessing camera. Please check permissions.';
            scanResult.className = 'scan-result invalid';
        });
        
    } catch (error) {
        console.error('Error accessing camera:', error);
        if (window.DebugLogger) {
            window.DebugLogger.error('scanner', 'Camera access error', error);
        }
        scanResult.textContent = 'Error accessing camera. Please check permissions.';
        scanResult.className = 'scan-result invalid';
    }
}

function stopScanner() {
    if (window.DebugLogger) {
        window.DebugLogger.info('scanner', 'Stopping QR code scanner');
    }
    
    if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
    }
    scanning = false;
    startButton.disabled = false;
    stopButton.disabled = true;
}

function scanQRCode() {
    if (!scanning) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        
        try {
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code) {
                console.log('QR Code detected:', code.data);
                // Draw QR code outline
                drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF4D00");
                drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF4D00");
                drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF4D00");
                drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF4D00");
                
                // Extract ticket ID
                const ticketId = extractTicketId(code.data);
                
                // Update scan result with full information
                const resultMessage = `Data: ${code.data}<br>Ticket ID: ${ticketId || 'Not found'}`;

                scanData.innerHTML = resultMessage;
                // scanData.textContent = resultMessage;
                scanData.className = 'scan-data message';
                
                if (ticketId) {
                    // Validate Base58 format and length
                    if (!base58Regex.test(ticketId)) {
                        updateScanResult('Invalid or missing ticket ID format.', 'invalid');
                        
                        // Stop scanner after valid scan
                        stopScanner();
                        return;
                    }

                    handleScan(code.data);
                }
                else {
                    updateScanResult('Invalid or missing ticket ID format.', 'invalid');
                        
                    // Stop scanner after valid scan
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

// Ticket Processing Functions
function extractTicketId(url) {updateScanResult
    try {
        const match = url.match(/\/i\/([^\/]+)\/receipt/);
        return match ? match[1] : null;
    } catch (error) {
        return null;
    }
}

function validateTicketId(ticketId) {
    if (!ticketId || !currentData) return { valid: false, message: 'Invalid ticket ID' };
    
    // Trim the ticket ID and ensure consistent format
    const normalizedTicketId = ticketId.trim();
    console.log('Searching for ticket:', normalizedTicketId); // Debug log
    console.log('Available tickets:', currentData.data.map(row => row.invoiceId)); // Debug log
    
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
    // Check if XLS data is available before processing manual entry
    if (typeof isDataAvailable === 'function' && !isDataAvailable()) {
        updateScanResult('No XLS data loaded. Please upload a valid XLS file first.', 'invalid');
        return;
    }
    
    const ticketId = manualInput.value.trim();
    
    if (!ticketId) {
        updateScanResult('Please enter a ticket ID', 'invalid');
        return;
    }
    
    // Validate Base58 format and length
    if (!base58Regex.test(ticketId)) {
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
    
    // Add to scan history regardless of validity
    scanHistory.unshift(scan);
    
    // Update filtered history
    if (typeof filteredScanHistory !== 'undefined') {
        filterScanHistory();
    }
    
    saveScanHistory();
    
    // Update UI based on validation result
    if (!validation.valid) {
        updateScanResult(validation.message, 'invalid');
        // Stop scanner after invalid scan
        stopScanner();
    } else if (validation.duplicate) {
        updateScanResult(validation.message, 'duplicate');
        // Stop scanner after duplicate scan
        stopScanner();
    } else {
        updateScanResult('Ticket validated successfully', 'valid');
        // Stop scanner after valid scan
        stopScanner();
    }

    updateStatistics();
    updateHistoryDisplay();
    updateTable();
}

// UI Update Functions
function updateScanResult(message, status) {
    // Use language manager for localized messages if available
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
    
    // Map common messages to translation keys
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

function updateHistoryDisplay() {
    let historyToShow = typeof filteredScanHistory !== 'undefined' ? filteredScanHistory : scanHistory;

    // Apply show all logic - always show all by default, or limit for performance
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
    
    // Update language content
    if (typeof window.LanguageManager !== 'undefined') {
        window.LanguageManager.updateUI();
    }
}

// Format timestamp for better display
// Format timestamp as absolute ISO 8601 format with timezone
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    
    // Return ISO 8601 format with timezone: "2025-08-06 11:41:00 UTC"
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC`;
}

// History Management Functions
function saveScanHistory() {
    try {
        localStorage.setItem('scanHistory', JSON.stringify(scanHistory));
    } catch (error) {
        console.error('Error saving scan history:', error);
    }
}

function toggleShowAll() {
    showAllRecords = !showAllRecords;
    
    const buttonText = showAllButton?.querySelector('[data-i18n]');
    const buttonIcon = showAllButton?.querySelector('.button-icon');
    
    if (showAllRecords) {
        if (buttonText) buttonText.setAttribute('data-i18n', 'showAll');
        if (buttonIcon) if (window.IconLibrary) buttonIcon.innerHTML = window.IconLibrary.getIcon("list", "16"); else buttonIcon.textContent = "📋";;
        if (buttonText) buttonText.textContent = 'Show All';
    } else {
        if (buttonText) buttonText.setAttribute('data-i18n', 'showLimited');
        if (buttonIcon) if (window.IconLibrary) buttonIcon.innerHTML = window.IconLibrary.getIcon("database", "16"); else buttonIcon.textContent = "📄";;
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
    // Export ALL records regardless of UI pagination or filtering
    const allRecords = scanHistory; // Always use complete dataset
    
    if (allRecords.length === 0) {
        const message = typeof window.LanguageManager !== 'undefined' ? 
            window.LanguageManager.get('noDataToExport') || 'No scan history data to export' :
            'No scan history data to export';
        alert(message);
        return;
    }
    
    // Enhanced CSV export with complete dataset and absolute timestamps
    const headers = ['Ticket ID', 'Status', 'ISO Timestamp', 'Method', 'Date', 'Time'];
    const csvData = [
        headers,
        ...allRecords.map(scan => {
            const date = new Date(scan.timestamp);
            return [
                scan.ticketId,
                scan.status,
                formatTimestamp(scan.timestamp), // Use new ISO format
                scan.method,
                date.toLocaleDateString(),
                date.toLocaleTimeString()
            ];
        })
    ];
    
    // Create CSV content with proper escaping
    const csvContent = csvData.map(row => 
        row.map(field => {
            // Escape fields containing commas, quotes, or newlines
            const stringField = String(field || '');
            if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
                return `"${stringField.replace(/"/g, '""')}"`;
            }
            return stringField;
        }).join(',')
    ).join('\n');
    
    // Create and download the file
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
    
    // Show success message with ALL records count
    if (window.DebugLogger) {
        window.DebugLogger.info('export', 'Complete scan history exported successfully', {
            recordCount: allRecords.length,
            filename: a.download,
            exportType: 'complete-dataset'
        });
    }
    
    // Optional: Show user feedback
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
    
    // Create a simple toast notification
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
    
    // Animate in
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    }, 100);
    
    // Remove after 3 seconds
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
let filteredScanHistory = [...scanHistory];
let showAllRecords = true; // Always show all records by default
let defaultMaxRecords = 100; // Default maximum to prevent performance issues
let searchDebounceTimer = null;

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
    // Clear existing timeout
    if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
    }
    
    // Set new timeout for search (300ms delay)
    searchDebounceTimer = setTimeout(() => {
        filterScanHistory();
        
        // Announce results to screen readers after debounce
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
    
    // Update the span values
    if (visibleCountEl) visibleCountEl.textContent = filteredScanHistory.length;
    if (totalCountEl) totalCountEl.textContent = scanHistory.length;
    
    // Update the translated text while preserving the span elements
    if (historyCountText && typeof window.LanguageManager !== 'undefined') {
        const template = window.LanguageManager.get('showingResults') || 'Showing {visible} of {total} scans';
        
        // Create the text with placeholder spans
        const visibleSpan = `<span id="visibleCount">${filteredScanHistory.length}</span>`;
        const totalSpan = `<span id="totalCount">${scanHistory.length}</span>`;
        
        const translatedText = template
            .replace('{visible}', visibleSpan)
            .replace('{total}', totalSpan);
            
        historyCountText.innerHTML = translatedText;
    }
}

function initSearchAndFilter() {
    const searchInput = document.getElementById('historySearch');
    const statusFilter = document.getElementById('statusFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', debouncedFilterSearch);
        
        // Add keyboard navigation enhancement
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
            // Announce filter change to screen readers
            const selectedText = statusFilter.options[statusFilter.selectedIndex].text;
            if (window.UIEnhancements && window.UIEnhancements.announceToScreenReader) {
                window.UIEnhancements.announceToScreenReader(
                    `Filter changed to ${selectedText}. Showing ${filteredScanHistory.length} results`
                );
            }
        });
    }
    
    // Initial stats update
    updateHistoryStats();
}

// Initialize history display and expandable ticket IDs
updateHistoryDisplay();
initExpandableTicketIds();
initSearchAndFilter();

// Register data availability callback when main.js is loaded
// Initialize Show All button with proper SVG icon
function initializeShowAllIcon() {
    const buttonIcon = showAllButton?.querySelector(".button-icon");
    if (buttonIcon && window.IconLibrary) {
        if (showAllRecords) {
            buttonIcon.innerHTML = window.IconLibrary.getIcon("list", "16");
        } else {
            buttonIcon.innerHTML = window.IconLibrary.getIcon("database", "16");
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Register callback to update scanner controls when data availability changes
    if (typeof registerDataAvailabilityCallback === 'function') {
        registerDataAvailabilityCallback(function(available, availabilityInfo) {
            console.log('Data availability changed:', available, availabilityInfo);
            // The main.js already handles UI updates, but we can add scanner-specific logic here if needed
        });
    }
    
    // Register language change callback
    
    // Initialize Show All button icon
    setTimeout(initializeShowAllIcon, 100); // Wait for IconLibrary to be ready
    if (typeof window.LanguageManager !== 'undefined') {
        window.LanguageManager.registerCallback(function(language) {
            // Update history display when language changes
            updateHistoryDisplay();
        });
    }
});