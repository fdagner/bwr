function generateRandomInventar() {
    const valueRanges = {
        "GR-value": { min: 500000, max: 1000000 },
        "BVG-value": { min: 800000, max: 1500000 },
        "MA-value": { min: 10000, max: 200000 },
        "FP1-value": { min: 10000, max: 80000 },
        "FP2-value": { min: 50000, max: 150000 },
        "BM-value": { min: 5000, max: 20000 },
        "BGA-value": { min: 20000, max: 200000 },
        "VORR-value": { min: 20000, max: 100000 },
        "FO-value": { min: 2000, max: 20000 },
        "BK1-value": { min: 20000, max: 200000 },
        "BK2-value": { min: 20000, max: 200000 },
        "KA-value": { min: 1000, max: 15000 },
        "LBKV-value": { min: 50000, max: 500000 },
        "KBKV-value": { min: 5000, max: 50000 },
        "VE-value": { min: 5000, max: 50000 },
    };


    function getRandomValueInRange(min, max) {
        const randomValue = Math.ceil(Math.random() * (max - min + 1)) + min;
    return Math.ceil(randomValue / 5000) * 5000;
    }


    function formatCurrency(value) {
        return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
    }

    function updateCellValueById(id, value) {
        const cell = document.getElementById(id);
        if (cell) {
            cell.textContent = formatCurrency(value);
        }
    }

    function calculateAndSetSum(cellIds, resultCellId) {
        const resultCell = document.getElementById(resultCellId);
        if (!resultCell) return;

        const sum = cellIds.reduce((acc, id) => {
            const value = parseFloat(document.getElementById(id)?.textContent.replace(/[^0-9,-]+/g, '')) || 0;
            return acc + value;
        }, 0);

        resultCell.textContent = formatCurrency(sum);
    }

    for (const id in valueRanges) {
        const randomValue = getRandomValueInRange(valueRanges[id].min, valueRanges[id].max);
        updateCellValueById(id, randomValue);
    }

    calculateAndSetSum(["FP1-value", "FP2-value"], "FP-value");
    calculateAndSetSum(["BK1-value", "BK2-value"], "BK-value");

    const avCellIds = ["GR-value", "BVG-value", "MA-value", "FP-value", "BM-value", "BGA-value"];
    const uvCellIds = ["VORR-value", "FO-value", "BK-value", "KA-value"];
    const fkCellIds = ["LBKV-value", "KBKV-value", "VE-value"]

    calculateAndSetSum(avCellIds, "AV-value");
    calculateAndSetSum(uvCellIds, "UV-value");
    calculateAndSetSum(fkCellIds, "FK-value");

    const avuvCellIds = ["AV-value", "UV-value"];
    const fkCellId = "FK-value";
    const ekCellId = "EK-value";

    calculateAndSetSum(avuvCellIds, "AVUV-value");
    calculateAndSetSum(["LBKV-value", "KBKV-value", "VE-value"], "FK-value");
    calculateAndSetSum(["AVUV-value", "FK-value"], ekCellId);

    const fkSumValue = parseFloat(document.getElementById("FK-value").textContent.replace(/[^0-9,-]+/g, '')) || 0;
    updateCellValueById("FKSum-value", fkSumValue);

    // Berechne und setze EK-Value gleich AVUV-Value - FK-Value
    const avuvValue = parseFloat(document.getElementById("AVUV-value").textContent.replace(/[^0-9,-]+/g, '')) || 0;
    const fkValue = parseFloat(document.getElementById("FK-value").textContent.replace(/[^0-9,-]+/g, '')) || 0;
    const ekValue = avuvValue - fkValue;
    updateCellValueById("EK-Value", ekValue);
}


function inventarHerunterladen() {
    const inventarHTML = document.getElementById('inventarContainer').innerHTML;
    const blob = new Blob([inventarHTML], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'inventar.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function inventarKopiereInZwischenablage() {
    const inventarHTML = document.getElementById('inventarContainer').innerHTML;
    navigator.clipboard.writeText(inventarHTML)
        .then(() => alert('Code wurde in die Zwischenablage kopiert'))
        .catch(err => console.error('Fehler beim Kopieren in die Zwischenablage:', err));
}

function inventarHerunterladenAlsPNG() {
    const inventarContainer = document.getElementById('inventarContainer');

    html2canvas(inventarContainer, optionshtml2canvas).then(canvas => {
        const dataURL = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = 'inventar.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}

let clipboardinventar = new ClipboardJS('#officeButtoninventar');

clipboardinventar.on('success', function (e) {
    console.log("Die Tabelle wurde in die Zwischenablage kopiert.");
    alert("Die Tabelle wurde in die Zwischenablage kopiert.");
});

clipboardinventar.on('error', function (e) {
    console.error("Fehler beim Kopieren der Tabelle: ", e.action);
    alert("Fehler beim Kopieren der Tabelle.");
});
