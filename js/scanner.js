// Scanner state
let scanning = false;
let scanHistory = [];

// Load scan history from localStorage
try {
    const savedHistory = localStorage.getItem('scanHistory');
    if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        if (Array.isArray(parsedHistory)) {
            scanHistory = parsedHistory;
        } else {
            console.error('Invalid scan history format in localStorage');
            localStorage.removeItem('scanHistory');
        }
    }
} catch (error) {
    console.error('Error loading scan history:', error);
    // Reset localStorage if corrupted
    localStorage.removeItem('scanHistory');
}

// Base58 validation regex - updated to properly validate all ticket ID formats
const base58Regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{20,50}$/;

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
const historyList = document.getElementById('scanHistory');
const scanMessageModal = document.getElementById('scanMessageModal');
const closeModalButton = document.getElementById('closeModal');

// Event Listeners
startButton.addEventListener('click', startScanner);
stopButton.addEventListener('click', stopScanner);
submitManual.addEventListener('click', handleManualEntry);
exportButton.addEventListener('click', exportScanHistory);
clearButton.addEventListener('click', clearScanHistory);
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
async function startScanner() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        video.srcObject = stream;
        video.play();
        scanning = true;
        startButton.disabled = true;
        stopButton.disabled = false;
        requestAnimationFrame(scanQRCode);
    } catch (error) {
        console.error('Error accessing camera:', error);
        scanResult.textContent = 'Error accessing camera. Please check permissions.';
        scanResult.className = 'scan-result invalid';
    }
}

function stopScanner() {
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
function extractTicketId(url) {
    try {
        const match = url.match(/\/i\/([^\/]+)\/receipt/);
        return match ? match[1] : null;
    } catch (error) {
        return null;
    }
}

function validateTicketId(ticketId) {
    // Check if ticket ID is provided
    if (!ticketId) {
        return { valid: false, message: 'Invalid ticket ID' };
    }
    
    // Get access to currentData from the global scope or another source
    // This uses window.currentData since currentData may be defined in main.js
    const dataSource = window.currentData || (typeof currentData !== 'undefined' ? currentData : null);
    
    if (!dataSource || !dataSource.data) {
        return { valid: false, message: 'No ticket database loaded' };
    }
    
    // Trim the ticket ID and ensure consistent format
    const normalizedTicketId = ticketId.trim();
    
    // Find the ticket in the database
    const ticket = dataSource.data.find(row => 
        row.invoiceId && row.invoiceId.trim() === normalizedTicketId
    );
    
    if (!ticket) {
        return { valid: false, message: 'Ticket not found in database' };
    }
    
    // Check if ticket was already scanned
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
    scanResult.textContent = message;
    scanResult.className = `scan-result ${status}`;
    scanData.className = `scan-data ${status}`;
    scanMessageModal.classList.add('active');
}

function getStatusText(status) {
    const statusMapping = {
        valid: 'Valid',
        invalid: 'Invalid',
        duplicate: 'Duplicate'
    };
    
    return statusMapping[status];
}

function updateHistoryDisplay() {
    historyList.innerHTML = scanHistory.map(scan => `
        <div class="history-item">
            <span class="ticket-id">${scan.ticketId}</span>
            <span class="status-badge ${scan.status}">${getStatusText(scan.status)}</span>
            <span class="timestamp">${new Date(scan.timestamp).toLocaleString()}</span>
        </div>
    `).join('');
}

// History Management Functions
function saveScanHistory() {
    try {
        // Validate scan history before saving to localStorage
        if (!Array.isArray(scanHistory)) {
            console.error('Invalid scan history format');
            return;
        }
        
        // Filter out any invalid entries
        const validScanHistory = scanHistory.filter(scan => 
            scan && 
            typeof scan.ticketId === 'string' && 
            typeof scan.timestamp === 'number' &&
            typeof scan.status === 'string'
        );
        
        localStorage.setItem('scanHistory', JSON.stringify(validScanHistory));
    } catch (error) {
        console.error('Error saving scan history:', error);
    }
}

function clearScanHistory() {
    if (confirm('Are you sure you want to clear the scan history?')) {
        scanHistory = [];
        saveScanHistory();
        updateHistoryDisplay();
    }
}

async function exportScanHistory() {
    try {
        // Ensure scanHistory is valid before exporting
        if (!Array.isArray(scanHistory) || scanHistory.length === 0) {
            console.warn('No scan history to export');
            return;
        }
        
        // Create CSV data with proper escaping for CSV fields
        const escapeCsvField = (field) => {
            if (field === null || field === undefined) return '';
            const str = String(field);
            // If the field contains commas, quotes, or newlines, wrap it in quotes and escape any quotes
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };
        
        const csvHeader = ['Ticket ID', 'Timestamp', 'Method', 'Status'].map(escapeCsvField).join(',');
        const csvRows = scanHistory.map(scan => [
            scan.ticketId || '',
            new Date(scan.timestamp).toLocaleString(),
            scan.method || '',
            scan.status || ''
        ].map(escapeCsvField).join(','));
        
        const csv = [csvHeader, ...csvRows].join('\n');
        
        // Create and download the file
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scan-history-${new Date().toISOString()}.csv`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    } catch (error) {
        console.error('Error exporting scan history:', error);
    }
}

// Initialize history display
updateHistoryDisplay();