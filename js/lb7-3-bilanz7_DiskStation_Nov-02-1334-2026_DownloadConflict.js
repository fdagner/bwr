function generateRandomBilanz7() {
    const valueRanges = {
        "value-GR": { min: 200000, max: 550000 },
        "value-BVG": { min: 500000, max: 2000000 },
        "value-MA": { min: 10000, max: 200000 },
        "value-FP": { min: 10000, max: 100000 },
        "value-BM": { min: 5000, max: 20000 },
        "value-BGA": { min: 10000, max: 50000 },
        "value-VORR": { min: 20000, max: 100000 },
        "value-FO": { min: 2000, max: 300000 },
        "value-BK": { min: 40000, max: 400000 },
        "value-KA": { min: 1000, max: 15000 },
        "value-LBKV": { min: 50000, max: 200000 },
        "value-KBKV": { min: 1000, max: 50000 },
        "value-VE": { min: 5000, max: 50000 },
    };


    function getRandomValueInRange(min, max) {
        const randomValue = Math.ceil(Math.random() * (max - min + 1)) + min;
    return Math.ceil(randomValue / 5000) * 5000;
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


document.addEventListener("DOMContentLoaded", function () {
    // Generierung beim Laden der Seite ausführen
    generateRandomBilanz7();
});
