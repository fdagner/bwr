function generateRandomBilanz7() {
    const valueRanges = {
        "value-GR": { min: 1500000, max: 1000000 },
        "value-BVG": { min: 2500000, max: 5000000 },
        "value-MA": { min: 10000, max: 200000 },
        "value-FP": { min: 10000, max: 80000 },
        "value-BM": { min: 5000, max: 20000 },
        "value-BGA": { min: 20000, max: 200000 },
        "value-VORR": { min: 20000, max: 100000 },
        "value-FO": { min: 2000, max: 500000 },
        "value-BK": { min: 40000, max: 400000 },
        "value-KA": { min: 500, max: 5000 },
        "value-LBKV": { min: 50000, max: 4500000 },
        "value-KBKV": { min: 5000, max: 50000 },
        "value-VE": { min: 5000, max: 50000 },
    };


    function getRandomValueInRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
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

    const avuvCellIds = ["value-GR", "value-BVG", "value-MA", "value-FP", "value-BM", "value-BGA", "value-VORR", "value-FO", "value-BK", "value-KA"];
    const fkCellIds = ["value-LBKV", "value-KBKV", "value-VE"]
    calculateAndSetSum(avuvCellIds, "value-AVUV");
    const fkValue = fkCellIds.reduce((acc, id) => {
        const value = parseFloat(document.getElementById(id)?.textContent.replace(/[^0-9,-]+/g, '')) || 0;
        return acc + value;
    }, 0);
    

    const avuvValue = parseFloat(document.getElementById("value-AVUV").textContent.replace(/[^0-9,-]+/g, '')) || 0;
    updateCellValueById("value-AVUV2", avuvValue);
    const ekValue = avuvValue - fkValue;
    updateCellValueById("value-EK", ekValue);
}


function bilanz7Herunterladen() {
    const bilanz7HTML = document.getElementById('bilanz7Container').innerHTML;
    const blob = new Blob([bilanz7HTML], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'bilanz7.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function bilanz7KopiereInZwischenablage() {
    const bilanz7HTML = document.getElementById('bilanz7Container').innerHTML;
    navigator.clipboard.writeText(bilanz7HTML)
        .then(() => alert('Code wurde in die Zwischenablage kopiert'))
        .catch(err => console.error('Fehler beim Kopieren in die Zwischenablage:', err));
}

function bilanz7HerunterladenAlsPNG() {
    const bilanz7Container = document.getElementById('bilanz7Container');

    html2canvas(bilanz7Container).then(canvas => {
        const dataURL = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = 'bilanz7.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}

let clipboardbilanz7 = new ClipboardJS('#officeButtonbilanz7');

clipboardbilanz7.on('success', function (e) {
    console.log("Die Tabelle wurde in die Zwischenablage kopiert.");
    alert("Die Tabelle wurde in die Zwischenablage kopiert.");
});

clipboardbilanz7.on('error', function (e) {
    console.error("Fehler beim Kopieren der Tabelle: ", e.action);
    alert("Fehler beim Kopieren der Tabelle.");
});
