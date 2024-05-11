

// Formatieren der Währung mit Euro-Symbol, Tausenderpunkt und Dezimalkomma
function formatCurrency(amount) {
    return new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
    }).format(amount);
}

function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function generateRandomPercentage(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function updateTable() {
    let werkstoffe = ["Rohstoffe", "Fremdbauteile", "Hilfsstoffe", "Betriebsstoffe"];
    let tableBody = document.getElementById("table-body");
    let tableBodyl = document.getElementById("table-body-l");
    let tableContent = "";
    let tableContentl = "";
    let averageValue = 0;

    // Calculate average value for werkstoffe other than "Rohstoffe"
    for (let i = 1; i < werkstoffe.length; i++) {
        averageValue += generateRandomNumber(5000, 100000);
    }
    averageValue /= (werkstoffe.length - 1);

    for (let i = 0; i < werkstoffe.length; i++) {
        let werkstoff = werkstoffe[i];
        let inventoryValue = 0;

        if (werkstoff === "Rohstoffe") {
            inventoryValue = averageValue * 2;
        } else {
            inventoryValue = generateRandomNumber(5000, 100000);
        }

        let deviationPercentage = generateRandomPercentage(-2, 10);
        let accountingValue = Math.round(inventoryValue * (1 + deviationPercentage / 100));
        let inventoryDifference = -1 * (inventoryValue - accountingValue);

        tableContent += "<tr>";
        tableContent += "<td style='text-align: left;border: 1px solid #ccc;padding: 15px;'>" + werkstoff + "</td>";
        tableContent += "<td style='text-align: right;border: 1px solid #ccc;padding: 15px;'>" + formatCurrency(inventoryValue) + "</td>";
        tableContent += "<td style='text-align: right;border: 1px solid #ccc;padding: 15px;'>" + formatCurrency(accountingValue) + "</td>";
        tableContent += "<td style='text-align: right;border: 1px solid #ccc;padding: 15px;'></td>";
        tableContent += "</tr>";

        tableContentl += "<tr>";
        tableContentl += "<td style='text-align: left;border: 1px solid #ccc;padding: 15px;'>" + werkstoff + "</td>";
        tableContentl += "<td style='text-align: right;border: 1px solid #ccc;padding: 15px;'>" + formatCurrency(inventoryValue) + "</td>";
        tableContentl += "<td style='text-align: right;border: 1px solid #ccc;padding: 15px;'>" + formatCurrency(accountingValue) + "</td>";
        tableContentl += "<td style='text-align: right;border: 1px solid #ccc;padding: 15px;'>" + formatCurrency(inventoryDifference) + "</td>";
        tableContentl += "</tr>";
    }

    tableBody.innerHTML = tableContent;
    tableBodyl.innerHTML = tableContentl;
}

updateTable();

function inventurdifferenzenHerunterladen() {
    const inventurdifferenzenHTML = document.getElementById('inventurdifferenzenContainer').innerHTML;
    const blob = new Blob([inventurdifferenzenHTML], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'inventurdifferenzen.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function inventurdifferenzenKopiereInZwischenablage() {
    const inventurdifferenzenHTML = document.getElementById('inventurdifferenzenContainer').innerHTML;
    navigator.clipboard.writeText(inventurdifferenzenHTML)
        .then(() => alert('Code wurde in die Zwischenablage kopiert'))
        .catch(err => console.error('Fehler beim Kopieren in die Zwischenablage:', err));
}

function inventurdifferenzenHerunterladenAlsPNG() {
    const inventurdifferenzenContainer = document.getElementById('inventurdifferenzenContainer');

    html2canvas(inventurdifferenzenContainer, optionshtml2canvas).then(canvas => {
        const dataURL = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = 'inventurdifferenzen.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}

let clipboardVorkontierung = new ClipboardJS('#officeButtonVorkontierung');

clipboardVorkontierung.on('success', function (e) {
    console.log("Die Tabelle wurde in die Zwischenablage kopiert.");
    alert("Die Tabelle wurde in die Zwischenablage kopiert.");
});

clipboardVorkontierung.on('error', function (e) {
    console.error("Fehler beim Kopieren der Tabelle: ", e.action);
    alert("Fehler beim Kopieren der Tabelle.");
});
