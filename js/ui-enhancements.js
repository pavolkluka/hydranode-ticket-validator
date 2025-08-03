// UI Enhancement Script - Non-functional improvements only
// This script adds visual enhancements without modifying core functionality

document.addEventListener('DOMContentLoaded', function() {
    // Add loading states for better UX
    function addLoadingState(element) {
        if (element) {
            element.classList.add('loading');
        }
    }

    function removeLoadingState(element) {
        if (element) {
            element.classList.remove('loading');
        }
    }

    // Enhanced file upload interactions
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    if (dropZone && fileInput) {
        // Keyboard support for drop zone
        dropZone.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                fileInput.click();
            }
        });

        // Enhanced drag and drop visual feedback
        dropZone.addEventListener('dragenter', function(e) {
            e.preventDefault();
            this.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            if (!this.contains(e.relatedTarget)) {
                this.classList.remove('dragover');
            }
        });

        dropZone.addEventListener('drop', function(e) {
            this.classList.remove('dragover');
        });

        // File processing loading state
        fileInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                addLoadingState(dropZone);
                // Remove loading state after processing (will be handled by main.js)
                setTimeout(() => removeLoadingState(dropZone), 100);
            }
        });
    }

    // Enhanced modal interactions
    const modal = document.getElementById('scanMessageModal');
    const closeButton = document.getElementById('closeModal');

    if (modal && closeButton) {
        // Focus trapping for modal
        function trapFocus(e) {
            if (e.key === 'Tab') {
                // Simple focus trap - keep focus on close button
                e.preventDefault();
                closeButton.focus();
            }
            if (e.key === 'Escape') {
                closeModal();
            }
        }

        function closeModal() {
            modal.classList.remove('active');
            document.removeEventListener('keydown', trapFocus);
            // Return focus to appropriate element
            const startScanButton = document.getElementById('startScan');
            if (startScanButton && !startScanButton.disabled) {
                startScanButton.focus();
            }
        }

        // Enhanced modal opening
        const originalShowModal = function() {
            modal.classList.add('active');
            document.addEventListener('keydown', trapFocus);
            // Focus the close button when modal opens
            setTimeout(() => closeButton.focus(), 100);
        };

        // Override the close button event
        closeButton.addEventListener('click', closeModal);

        // Click outside to close
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }

    // Enhanced statistics animations
    function animateValue(element, start, end, duration) {
        if (!element) return;
        
        const startTime = performance.now();
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (end - start) * easeOutCubic);
            
            element.textContent = current;
            element.setAttribute('aria-label', `${element.parentElement.querySelector('.stat-label').textContent}: ${current}`);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    // Enhanced table interactions
    const tableContainer = document.querySelector('.table-container');
    if (tableContainer) {
        // Keyboard navigation for table
        tableContainer.addEventListener('keydown', function(e) {
            const focusedCell = document.activeElement;
            if (!focusedCell.matches('th, td')) return;

            const table = this.querySelector('table');
            const rows = Array.from(table.querySelectorAll('tr'));
            const currentRow = focusedCell.closest('tr');
            const currentRowIndex = rows.indexOf(currentRow);
            const cells = Array.from(currentRow.querySelectorAll('th, td'));
            const currentCellIndex = cells.indexOf(focusedCell);

            let newFocus = null;

            switch(e.key) {
                case 'ArrowUp':
                    if (currentRowIndex > 0) {
                        const prevRow = rows[currentRowIndex - 1];
                        const prevCells = prevRow.querySelectorAll('th, td');
                        newFocus = prevCells[Math.min(currentCellIndex, prevCells.length - 1)];
                    }
                    break;
                case 'ArrowDown':
                    if (currentRowIndex < rows.length - 1) {
                        const nextRow = rows[currentRowIndex + 1];
                        const nextCells = nextRow.querySelectorAll('th, td');
                        newFocus = nextCells[Math.min(currentCellIndex, nextCells.length - 1)];
                    }
                    break;
                case 'ArrowLeft':
                    if (currentCellIndex > 0) {
                        newFocus = cells[currentCellIndex - 1];
                    }
                    break;
                case 'ArrowRight':
                    if (currentCellIndex < cells.length - 1) {
                        newFocus = cells[currentCellIndex + 1];
                    }
                    break;
            }

            if (newFocus) {
                e.preventDefault();
                newFocus.focus();
            }
        });
    }

    // Enhanced button interactions with better feedback
    const buttons = document.querySelectorAll('.control-button');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });

    // Enhanced form validation feedback
    const manualInput = document.getElementById('manualTicketId');
    if (manualInput) {
        manualInput.addEventListener('input', function() {
            const value = this.value.trim();
            const isValid = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{22,44}$/.test(value);
            
            if (value && !isValid) {
                this.setAttribute('aria-invalid', 'true');
                this.style.borderColor = 'var(--danger-color)';
            } else {
                this.setAttribute('aria-invalid', 'false');
                this.style.borderColor = '';
            }
        });
    }

    // Announce dynamic content changes for screen readers
    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'assertive');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // Enhanced skip links
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'sr-only';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--primary-color);
        color: var(--background-color);
        padding: 8px;
        text-decoration: none;
        z-index: 1000;
        border-radius: 4px;
    `;
    
    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);

    // Add main content landmark
    const mainContainer = document.querySelector('.main-container');
    if (mainContainer) {
        mainContainer.id = 'main-content';
        mainContainer.setAttribute('role', 'main');
    }

    // Expose utility functions globally for use by other scripts
    window.UIEnhancements = {
        addLoadingState,
        removeLoadingState,
        animateValue,
        announceToScreenReader
    };
});