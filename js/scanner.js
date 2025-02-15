// Scanner state
let scanning = false;
let scanHistory = [];

// Load scan history from localStorage
try {
    const savedHistory = localStorage.getItem('scanHistory');
    if (savedHistory) {
        scanHistory = JSON.parse(savedHistory);
    }
} catch (error) {
    console.error('Error loading scan history:', error);
}

// Base58 validation regex
const base58Regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{22,44}$/;

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

// Event Listeners
startButton.addEventListener('click', startScanner);
stopButton.addEventListener('click', stopScanner);
submitManual.addEventListener('click', handleManualEntry);
exportButton.addEventListener('click', exportScanHistory);
clearButton.addEventListener('click', clearScanHistory);

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
    try {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(function(stream) {
            video.srcObject = stream;
            video.play();
            scanning = true;
            startButton.disabled = true;
            stopButton.disabled = false;
            requestAnimationFrame(scanQRCode);
        });
        
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
                const resultMessage = `Data: ${code.data} | Ticket ID: ${ticketId || 'Not found'}`;

                // scanData.innerHTML = resultMessage;
                scanData.textContent = resultMessage;
                scanData.className = 'scan-data message';
                
                if (ticketId) {
                    // Validate Base58 format and length
                    if (!base58Regex.test(ticketId)) {
                        updateScanResult('Invalid ticket ID format.', 'invalid');
                        
                        // Stop scanner after valid scan
                        stopScanner();
                        return;
                    }

                    handleScan(code.data);
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
        localStorage.setItem('scanHistory', JSON.stringify(scanHistory));
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
    const csv = [
        ['Ticket ID', 'Timestamp', 'Method'],
        ...scanHistory.map(scan => [
            scan.ticketId,
            new Date(scan.timestamp).toLocaleString(),
            scan.method
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-history-${new Date().toISOString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Initialize history display
updateHistoryDisplay();