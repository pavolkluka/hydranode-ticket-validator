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

// Event Listeners
fileInput.addEventListener('change', handleFileSelect);
dropZone.addEventListener('dragover', handleDragOver);
dropZone.addEventListener('drop', handleDrop);
rowsPerPageSelect.addEventListener('change', handleRowsPerPageChange);

// File Validation Functions
function isValidFileType(file) {
    const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv'
    ];
    return validTypes.includes(file.type) || 
           file.name.endsWith('.xls') || 
           file.name.endsWith('.xlsx') || 
           file.name.endsWith('.csv');
}

function validateFile(file) {
    if (!file) {
        throw new Error('No file selected');
    }
    
    if (!isValidFileType(file)) {
        throw new Error('Invalid file type. Please upload .xls, .xlsx, or .csv files only');
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
    
    // Update metadata
    clientInfo.innerHTML = `<strong>Client ID:</strong> ${processedData.clientId}`;
    storeInfo.innerHTML = `<strong>Store Name:</strong> ${processedData.storeName}`;
    
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
        return `
            <tr class="${isScanned ? 'scanned' : ''}">
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
        return acc;
    }, { valid: 0, duplicate: 0, invalid: 0 });
    
    const remainingTickets = totalTickets - scannedTickets.valid;

    document.getElementById('totalTickets').textContent = totalTickets;
    document.getElementById('validTickets').textContent = scannedTickets.valid;
    document.getElementById('duplicateTickets').textContent = scannedTickets.duplicate;
    document.getElementById('invalidTickets').textContent = scannedTickets.invalid;
    document.getElementById('remainingTickets').textContent = remainingTickets;
}

// Event Handlers
async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        const processedData = await processFile(file);
        updateDisplay(processedData);
        updateStatistics();
        fileInfo.style.display = 'block';
        fileInfo.textContent = `File processed successfully: ${file.name}`;
    } catch (error) {
        fileInfo.style.display = 'block';
        fileInfo.textContent = error.message;
    }
}

function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    dropZone.classList.add('dragover');
}

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