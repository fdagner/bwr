
document.getElementById('hideLEgend').addEventListener('click', function () {
    gewinnschwelleChart.options.plugins.legend.display = !gewinnschwelleChart.options.plugins.legend.display;
    gewinnschwelleChart.update();
});

function validateAndGenerateChart() {
    const fixkostenInput = document.getElementById('fixkosten');
    const variablestückkostenInput = document.getElementById('variablestückkosten');
    const nettoverkaufserlösestückInput = document.getElementById('nettoverkaufserlösestück');

    const fixkosten = parseFloat(fixkostenInput.value);
    const variablestückkosten = parseFloat(variablestückkostenInput.value);
    const nettoverkaufserlösestück = parseFloat(nettoverkaufserlösestückInput.value);

    if (isNaN(fixkosten) || isNaN(variablestückkosten) || isNaN(nettoverkaufserlösestück) ||
        fixkosten < 0 || fixkosten > 999999999 ||
        variablestückkosten < 0 || variablestückkosten > 100000 ||
        nettoverkaufserlösestück < 0 || nettoverkaufserlösestück > 50000) {
        alert('Bitte geben Sie gültige positive Werte ein:\nFixkosten: 0 - 999999999\nVariable Stückkosten: 0 - 100000\nNettoverkaufserlöse pro Stück: 0 - 50000');
        return;
    }

    generateChart();
}


function calculateData(fixkosten, variablestückkosten, nettoverkaufserlösestück, maxMenge) {

    let gewinnschwelle;
    let gewinnschwellenmenge;
    gewinnschwelle = fixkosten / (nettoverkaufserlösestück - variablestückkosten);
    gewinnschwellenmenge = gewinnschwelle * nettoverkaufserlösestück;


    const variablekosten = variablestückkosten * maxMenge;
    const gesamtkosten = fixkosten + variablekosten;
    const nettoverkaufserlöse = nettoverkaufserlösestück * maxMenge;

    return {
        gewinnschwelle,
        gewinnschwellenmenge,
        variablekosten,
        gesamtkosten,
        nettoverkaufserlöse
    };
}

function generateChart() {
    const plugin = {
        id: 'customCanvasBackgroundColor',
        options: {
            color: 'white', // Set the default color
        },
        beforeDraw: (myChart) => {
            const { ctx } = myChart;
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = plugin.options.color || '#ffffff';
            ctx.fillRect(0, 0, myChart.width, myChart.height);
            ctx.restore();
        }
    };
    const fixkosten = parseFloat(document.getElementById('fixkosten').value);
    const variablestückkosten = parseFloat(document.getElementById('variablestückkosten').value);
    const nettoverkaufserlösestück = parseFloat(document.getElementById('nettoverkaufserlösestück').value);

    if (isNaN(fixkosten) || isNaN(variablestückkosten) || isNaN(nettoverkaufserlösestück)) {
        alert('Please enter valid numeric values for all fields.');

    }
    let maxMenge;
    let gewinnschwelleNenner = nettoverkaufserlösestück - variablestückkosten;
    if (gewinnschwelleNenner > 0) {
        maxMenge = Math.ceil(fixkosten / (nettoverkaufserlösestück - variablestückkosten) * 2) || 1000 // Die maximale Menge wird dynamisch berechnet oder auf 1000 gesetzt, falls die Berechnung fehlschlägt
    } else {
        alert("Ungültige Werte: die Nettoverkaufserlöse müssen höher als die Variablen Stückkosten sein.")
        return {
            maxMenge: null,
        }
    }

    const {
        gewinnschwelle,
        gewinnschwellenmenge,
        variablekosten,
        gesamtkosten,
        nettoverkaufserlöse
    } = calculateData(fixkosten, variablestückkosten, nettoverkaufserlösestück, maxMenge);

    if (window.gewinnschwelleChart instanceof Chart) {
        window.gewinnschwelleChart.destroy();
    }

    const ctx = document.getElementById('gewinnschwelleChart').getContext('2d');
    window.gewinnschwelleChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Nettoverkaufserlöse',
                    data: [{ x: 0, y: 0 }, { x: maxMenge, y: nettoverkaufserlöse }],
                    backgroundColor: 'rgba(39, 245, 112, 0.8)',
                    borderColor: 'rgba(39, 245, 112, 0.8)',
                    borderWidth: 3,
                    showLine: true
                },
                {
                    label: 'Gesamtkosten',
                    data: [{ x: 0, y: fixkosten }, { x: maxMenge, y: gesamtkosten }],
                    backgroundColor: 'rgba(0, 99, 132, 1)',
                    borderColor: 'rgba(0, 99, 132, 1)',
                    borderWidth: 3,
                    showLine: true
                },
                {
                    label: 'Variablen Kosten',
                    data: [{ x: 0, y: 0 }, { x: maxMenge, y: variablekosten }],
                    backgroundColor: 'rgba(255, 99, 132, 1)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 3,
                    showLine: true
                },
                {
                    label: 'Fixkosten',
                    data: [{ x: 0, y: fixkosten }, { x: maxMenge, y: fixkosten }],
                    backgroundColor: 'rgba(245, 193, 39, 0.8)',
                    borderColor: 'rgba(245, 193, 39, 0.8)',
                    borderWidth: 3,
                    showLine: true
                },
                {
                    type: 'scatter',
                    label: 'Gewinnschwelle',
                    data: [{ x: 0, y: gewinnschwellenmenge }, { x: gewinnschwelle, y: gewinnschwellenmenge }, { x: gewinnschwelle, y: 0 }],
                    borderColor: 'rgba(0, 0, 0, 1)',
                    borderWidth: 2,
                    pointRadius: 12,
                    showLine: true,
                    borderDash: [5, 5]
                }
            ]
        },
        options: {
            plugins: {
                title: { display: true, text: 'Gewinnschwelle', font: { size: 20 } },
                legend: { position: 'bottom', labels: { font: { size: 16 } } },
                tooltip: { mode: 'index', intersect: false }
            },
            hover: { mode: 'x-axis', intersect: false },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Umsatz / Kosten'
                    },
                    beginAtZero: true,
                    max: gewinnschwellenmenge * 1.5,
                    min: 0
                },
                x: {
                    max: maxMenge,
                    title: {
                        display: true,
                        text: 'Absatz (verkaufte Menge)'
                    },
                }
            }
        },
        plugins: [plugin],
    });
}

function bestellmengeHerunterladenAlsPNG() {
    const wertetabelle = document.getElementById('gewinnschwelleContainer');

    html2canvas(wertetabelle).then(canvas => {
        const dataURL = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = 'gewinnschwelle.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // Hier wird generiereWertetabelle() beim Laden der Seite ausgeführt
    generateChart();
});
