/**
 * Ticket Validator
 * Handles ticket validation logic and UI interactions
 */

class TicketValidator {
  constructor() {
    this.form = null;
    this.input = null;
    this.submitButton = null;
    this.resultContainer = null;
    this.isValidating = false;
    
    this.init();
  }

  init() {
    this.bindElements();
    this.attachEventListeners();
  }

  bindElements() {
    this.form = document.getElementById('ticketForm');
    this.input = document.getElementById('ticketInput');
    this.submitButton = this.form?.querySelector('button[type="submit"]');
    this.resultContainer = document.getElementById('validationResult');
  }

  attachEventListeners() {
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.validateTicket();
      });
    }

    if (this.input) {
      // Clear validation result when user starts typing
      this.input.addEventListener('input', () => {
        this.clearResult();
      });

      // Handle Enter key
      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !this.isValidating) {
          e.preventDefault();
          this.validateTicket();
        }
      });
    }
  }

  async validateTicket() {
    if (this.isValidating) return;

    const ticketId = this.input?.value?.trim();
    
    if (!ticketId) {
      this.showResult('error', window.i18nManager?.translate('validation.empty') || 'Please enter a ticket ID.');
      return;
    }

    this.setValidating(true);
    
    try {
      // Simulate validation process
      const result = await this.performValidation(ticketId);
      
      if (result.valid) {
        this.showResult('success', 
          window.i18nManager?.translate('validation.success') || 'Ticket is valid!',
          result
        );
      } else {
        this.showResult('error', 
          window.i18nManager?.translate('validation.error') || 'Invalid ticket or validation failed.',
          result
        );
      }
    } catch (error) {
      console.error('Validation error:', error);
      this.showResult('error', 
        window.i18nManager?.translate('validation.error') || 'Invalid ticket or validation failed.'
      );
    } finally {
      this.setValidating(false);
    }
  }

  async performValidation(ticketId) {
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    // Mock validation logic
    const mockResult = this.mockValidationLogic(ticketId);
    
    // In a real application, this would be an API call:
    // const response = await fetch('/api/validate-ticket', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ ticketId })
    // });
    // return response.json();
    
    return mockResult;
  }

  mockValidationLogic(ticketId) {
    // Simple mock validation rules for demonstration
    const validPatterns = [
      /^HYD-\d{6}-[A-Z]{3}$/,  // Format: HYD-123456-ABC
      /^TICKET-\d{8}$/,        // Format: TICKET-12345678
      /^[A-Z0-9]{12}$/         // Format: ABC123DEF456
    ];

    const isValidFormat = validPatterns.some(pattern => pattern.test(ticketId));
    
    // Additional mock rules
    const invalidIds = ['TEST', 'DEMO', 'INVALID', '123', 'ABC'];
    const isNotBlacklisted = !invalidIds.includes(ticketId.toUpperCase());
    
    // Random validation for demo purposes
    const randomFactor = Math.random() > 0.3; // 70% success rate
    
    const isValid = isValidFormat && isNotBlacklisted && randomFactor;
    
    return {
      valid: isValid,
      ticketId: ticketId,
      timestamp: new Date().toISOString(),
      details: {
        format: isValidFormat ? 'Valid format' : 'Invalid format',
        status: isValid ? 'Active' : 'Invalid/Expired',
        type: this.getTicketType(ticketId),
        validatedAt: new Date().toLocaleString()
      }
    };
  }

  getTicketType(ticketId) {
    if (ticketId.startsWith('HYD-')) return 'Premium';
    if (ticketId.startsWith('TICKET-')) return 'Standard';
    if (/^[A-Z0-9]{12}$/.test(ticketId)) return 'Basic';
    return 'Unknown';
  }

  setValidating(validating) {
    this.isValidating = validating;
    
    if (this.submitButton) {
      this.submitButton.disabled = validating;
      this.submitButton.classList.toggle('loading', validating);
      
      const originalText = this.submitButton.getAttribute('data-original-text') || 
        this.submitButton.textContent;
      
      if (!this.submitButton.hasAttribute('data-original-text')) {
        this.submitButton.setAttribute('data-original-text', originalText);
      }
      
      this.submitButton.textContent = validating 
        ? (window.i18nManager?.translate('validation.validating') || 'Validating...')
        : originalText;
    }
    
    if (this.input) {
      this.input.disabled = validating;
    }
  }

  showResult(type, message, data = null) {
    if (!this.resultContainer) return;
    
    this.resultContainer.className = `validation-result ${type}`;
    this.resultContainer.style.display = 'block';
    
    let html = `<p><strong>${message}</strong></p>`;
    
    if (data && data.details) {
      html += `
        <div class="validation-details">
          <p><strong>Ticket ID:</strong> ${data.ticketId}</p>
          <p><strong>Type:</strong> ${data.details.type}</p>
          <p><strong>Status:</strong> ${data.details.status}</p>
          <p><strong>Validated:</strong> ${data.details.validatedAt}</p>
        </div>
      `;
    }
    
    this.resultContainer.innerHTML = html;
    
    // Smooth scroll to result
    this.resultContainer.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'nearest' 
    });
  }

  clearResult() {
    if (this.resultContainer) {
      this.resultContainer.style.display = 'none';
      this.resultContainer.innerHTML = '';
    }
  }

  // Method to validate multiple tickets (future feature)
  async validateMultipleTickets(ticketIds) {
    const results = [];
    
    for (const ticketId of ticketIds) {
      try {
        const result = await this.performValidation(ticketId);
        results.push(result);
      } catch (error) {
        results.push({
          valid: false,
          ticketId: ticketId,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Method to export validation results
  exportResults(results, format = 'json') {
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(results, null, 2);
      case 'csv':
        return this.convertToCSV(results);
      default:
        throw new Error('Unsupported export format');
    }
  }

  convertToCSV(results) {
    if (!Array.isArray(results) || results.length === 0) {
      return '';
    }
    
    const headers = ['Ticket ID', 'Valid', 'Type', 'Status', 'Validated At'];
    const rows = results.map(result => [
      result.ticketId,
      result.valid ? 'Yes' : 'No',
      result.details?.type || 'Unknown',
      result.details?.status || 'Unknown',
      result.details?.validatedAt || 'Unknown'
    ]);
    
    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  }

  // Method to get validation statistics
  getValidationStats() {
    // In a real app, this would fetch from localStorage or API
    return {
      totalValidations: 0,
      successfulValidations: 0,
      failedValidations: 0,
      lastValidation: null
    };
  }

  // Method to clear validation history
  clearValidationHistory() {
    // In a real app, this would clear localStorage or send API request
    console.log('Validation history cleared');
  }
}

// Utility functions for ticket validation
const TicketUtils = {
  // Generate a sample valid ticket ID for testing
  generateSampleTicket() {
    const formats = [
      () => `HYD-${Math.floor(Math.random() * 900000 + 100000)}-${this.randomString(3)}`,
      () => `TICKET-${Math.floor(Math.random() * 90000000 + 10000000)}`,
      () => this.randomString(12, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')
    ];
    
    const randomFormat = formats[Math.floor(Math.random() * formats.length)];
    return randomFormat();
  },

  randomString(length, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  },

  // Validate ticket ID format
  isValidFormat(ticketId) {
    const validPatterns = [
      /^HYD-\d{6}-[A-Z]{3}$/,
      /^TICKET-\d{8}$/,
      /^[A-Z0-9]{12}$/
    ];
    
    return validPatterns.some(pattern => pattern.test(ticketId));
  },

  // Get ticket type from ID
  getTicketType(ticketId) {
    if (ticketId.startsWith('HYD-')) return 'Premium';
    if (ticketId.startsWith('TICKET-')) return 'Standard';
    if (/^[A-Z0-9]{12}$/.test(ticketId)) return 'Basic';
    return 'Unknown';
  }
};

// Initialize ticket validator
let ticketValidator;

function initValidator() {
  ticketValidator = new TicketValidator();
  
  // Make it globally accessible for debugging
  window.ticketValidator = ticketValidator;
  window.TicketUtils = TicketUtils;
}

// Auto-initialize if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initValidator);
} else {
  initValidator();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TicketValidator, TicketUtils };
}