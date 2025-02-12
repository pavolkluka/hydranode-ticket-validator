let ticketsDB = {};

function loadTickets() {
    const fileUpload = document.getElementById('fileUpload').files[0];
    if (!fileUpload) {
        alert("Please select a file first!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        ticketsDB = {};
        sheet.forEach(row => {
            if (row["Invoice ID"]) {
                ticketsDB[row["Invoice ID"]] = { scanned: false };
            }
        });

        displayLoadedTickets();
        alert("Tickets successfully loaded!");
    };

    reader.readAsArrayBuffer(fileUpload);
}

function displayLoadedTickets() {
    const tbody = document.querySelector("#ticketTable tbody");
    tbody.innerHTML = "";

    Object.keys(ticketsDB).forEach((ticketID, index) => {
        const row = `<tr>
            <td>${index + 1}</td>
            <td>${ticketID}</td>
            <td class="${ticketsDB[ticketID].scanned ? 'already-scanned' : 'valid'}">
                ${ticketsDB[ticketID].scanned ? "Scanned" : "Not Scanned"}
            </td>
        </tr>`;
        tbody.innerHTML += row;
    });
}