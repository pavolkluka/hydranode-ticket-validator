function handleScannedCode(scannedURL) {
    const ticketID = extractTicketID(scannedURL);
    if (ticketID) checkTicket(ticketID);
}

function extractTicketID(url) {
    const parts = url.split('/');
    return parts.length > 2 ? parts[parts.length - 2] : null;
}

function checkTicket(ticketID = null) {
    const inputField = document.getElementById("manualTicket");
    const results = document.getElementById("results");

    if (!ticketID) {
        ticketID = inputField.value.trim();
    }

    if (!ticketID) {
        results.innerHTML = "<span class='invalid'>Please enter or scan a ticket ID</span>";
        return;
    }

    if (ticketsDB[ticketID]) {
        if (ticketsDB[ticketID].scanned) {
            results.innerHTML = `<span class="already-scanned">🔶 Ticket ID ${ticketID} already scanned!</span>`;
        } else {
            ticketsDB[ticketID].scanned = true;
            results.innerHTML = `<span class="valid">✔ Ticket ID ${ticketID} is valid!</span>`;
        }
    } else {
        results.innerHTML = `<span class="invalid">❌ Ticket ID ${ticketID} not found!</span>`;
    }

    displayLoadedTickets();
}