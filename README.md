# Hydranode - Ticket Validator

A simple web-based application using HTML, JavaScript, and secure libraries for Hydranode Ticket validation.

## Application specification

A simple web-based application using HTML, JavaScript, and secure libraries.

### **Main points**

1. **Offline Functionality** – Since the app runs entirely in the browser, it doesn’t require an internet connection, making it fast and reliable at an event.
2. **Minimal Setup** – Users don’t need to install anything; they just open a webpage in their browser.
3. **High Security** – Since no data is sent to a server, there’s minimal risk of data leaks.
4. **Easy Deployment** – The system is simple and can be shared via a local file, USB, or even hosted on an event organizer’s local web server.

### Example of QR code

Scanned QR code contains this example of a URL:
https://tuttifrutti-event.com/btcpay/i/CtBMVpDs7ddFPgG4q2zQmJ/receipt

Where `CtBMVpDs7ddFPgG4q2zQmJ` is the Ticket ID. This ID is located in uploaded file under column with the name "Invoice ID".

### Suggestions for Improvement

#### 1. File Validation & Security

- Ensure strong validation for uploaded files by checking:
  - Allowed file types (`.xls`, `.xlsx`, `.csv`).
  - Malicious file injection (check file structure and prevent script execution).
  - Proper encoding to prevent issues with special characters.
- Use a secure library like:
  - SheetJS for reading Excel/CSV files securely
    - Link: https://github.com/SheetJS/sheetjs

#### 2. QR Code Scanning

- Use a secure and well-maintained QR scanning library such as:
  - jsQR: (lightweight & secure)
    - Link: https://github.com/cozmo/jsQR
  - ZXing ("Zebra Crossing") trusted and widely used
    - Link: https://github.com/zxing-js/library
- Ensure that the scanned data is sanitized before processing to avoid injection attacks.

#### 3. Handling Scanned Identifiers

- Implement real-time feedback:
  - Green **(valid & scanned for the first time)**
  - Orange **(valid, but already scanned)**
  - Red **(invalid, not in the database)**
- Keep track of local storage/session to prevent duplicate scans within a session or unwanted browser closure causing loss of scans already performed

#### 4. UI/UX Enhancements

- Implement audible or haptic feedback when an identifier is scanned to assist event staff.
- Allow manual ticket entry for cases where QR scanners fail.
- Use simple animations to make status changes more visible.
- Implement view of loaded ticket from uploaded file, for example 5 per page or make availability to set number of view tickets per page.

#### 5. Recommended Enhancements

- Allow exporting a file of already scanned tickets for post-event verification.
- Enable bulk scanning (e.g., multiple QR codes in sequence without requiring user confirmation).
- Encrypt or hash ticket IDs within the input file for extra security (e.g., SHA256 hashing).

### Conclusion

Implementing these small improvements will ensure a **safe, fast, and smooth** ticket verification experience.

## ToDo

- [ ] Add small buttons for quick statistics about scanned valid QR codes, invalid, duplicate and the rest of them
- [ ] Add filter options for "Scan History" and "Ticket List"
- [ ] Make "Scan History" with tabs > All | Valid | Duplicate | Invalid
- [ ] Make "Ticket List" with tabs > All | Valid | Duplicate | Invalid
- [ ] Record invalid Ticked ID into Scan History(append column with information about Ticket ID- valid/invalid)
- [x] After scanner scan QR code, stop scanner automaticaly
- [x] Make smaller "Scan Window"
- [x] Reorder sections
  - [x] 1 Load File
  - [x] 2 Scan QR Code
  - [x] 3 List of Tickets
  - [x] 4 Scan History
- [x] Add main.js and scanner.js to HTML page to make it portable
- [x] Add "Subresource Integrity" for remote JavaScript resources (jsQR, SheetJS)
- [ ] ? Add collumn to "Scan History" > LNURL Comment
- [ ] Prepare a business model