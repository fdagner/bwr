

// Formatieren der Währung mit Euro-Symbol, Tausenderpunkt und Dezimalkomma

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
    // Auf glatte 5.000-EUR-Schritte runden (keine Centbeträge im Unterrichtsbeleg)
    averageValue = Math.round(averageValue / 5000) * 5000;

    for (let i = 0; i < werkstoffe.length; i++) {
        let werkstoff = werkstoffe[i];
        let inventoryValue = 0;

        if (werkstoff === "Rohstoffe") {
            inventoryValue = averageValue * 2;
        } else {
            // Glatte 100-EUR-Schritte
            inventoryValue = Math.round(generateRandomNumber(5000, 100000) / 100) * 100;
        }

        let deviationPercentage = generateRandomPercentage(-2, 10);
        // Buchführungswert ebenfalls auf glatte EUR runden
        let accountingValue = Math.round(inventoryValue * (1 + deviationPercentage / 100) / 100) * 100;
        let inventoryDifference = -1 * (inventoryValue - accountingValue);
        // Negativer Null-Stand vermeiden ("-0,00 €")
        if (inventoryDifference === 0) inventoryDifference = 0;

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

