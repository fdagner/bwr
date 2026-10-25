let bestellChart = null;

// Formatieren der Währung mit Euro-Symbol, Tausenderpunkt und Dezimalkomma
function formatCurrency(amount) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

// Auf 2 Dezimalstellen runden
function roundToTwoDecimals(num) {
    return Math.round(num * 100) / 100;
}


// Formatieren der Zahl mit Leerzeichen als Tausendertrennzeichen, ohne Dezimalkomma
function formatNumberWithSpace(number) {
    const formattedNumber = new Intl.NumberFormat('de-DE', { useGrouping: false }).format(number);
    return formattedNumber.replace(/(\d)(?=(\d{3})+$)/g, '$1 ');
}

function roundUpToNearest(number) {
    const digits = Math.floor(Math.log10(number));
    const factor = Math.pow(10, digits);

    if (factor < 10) {
        return Math.ceil(number / 10) * 10;
    } else if (factor < 100) {
        return Math.ceil(number / 100) * 100;
    } else {
        return Math.ceil(number / 1000) * 1000;
    }
}

function escHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}


let lagerkosten;
let bedarf;
function berechneOptimaleBestellmengeUndHaeufigkeit() {

    let optimaleBestellmenge = parseInt(document.getElementById("optimaleBestellmenge").value, 10);
    let optimaleBestellhaeufigkeit = parseInt(document.getElementById("optimaleBestellhaeufigkeit").value, 10);
    let bestellkosten = parseInt(document.getElementById("bestellkosten").value, 10);
    let schrittweite = parseInt(document.getElementById("schrittweite").value, 10);

    function validateInputs(optimaleBestellmenge, optimaleBestellhaeufigkeit, bestellkosten, schrittweite) {
        const inputs = [
            { value: optimaleBestellmenge, min: 1, max: 999999999, message: "Optimale Bestellmenge (1 - 999999999)" },
            { value: optimaleBestellhaeufigkeit, min: 1, max: 100, message: "Optimale Bestellhäufigkeit (1 - 100)" },
            { value: bestellkosten, min: 1, max: 999999999, message: "Bestellkosten (1 - 999999999)" },
            { value: schrittweite, min: 1, max: 100, message: "Schrittweite (1 - 100)" }
        ];

        for (const input of inputs) {
            if (isNaN(input.value) || input.value < input.min || input.value > input.max) {
                alert(`Bitte eine gültige Zahl eingeben: ${input.message}.`);
                return false;
            }
        }

        return true;
    }

    // Verwendung:
    if (!validateInputs(optimaleBestellmenge, optimaleBestellhaeufigkeit, bestellkosten, schrittweite)) {
        return;
    }
    const haeufigkeitVon = parseInt(document.getElementById("haeufigkeitVon").value, 10);
    const haeufigkeitBis = parseInt(document.getElementById("haeufigkeitBis").value, 10);
    if (isNaN(haeufigkeitVon) || isNaN(haeufigkeitBis) || haeufigkeitVon < 1 || haeufigkeitBis > 100 || haeufigkeitVon >= haeufigkeitBis) {
        alert('Bitte einen gültigen Bereich für die Bestellhäufigkeit eingeben (1 bis 100, "von" kleiner als "bis").');
        return;
    }

    // Input-Feldwerte abrufen
    optimaleBestellmenge = document.getElementById('optimaleBestellmenge').value;
    bestellkosten = document.getElementById('bestellkosten').value;
    optimaleBestellhaeufigkeit = document.getElementById('optimaleBestellhaeufigkeit').value;
    bedarf = optimaleBestellmenge * optimaleBestellhaeufigkeit;
    // Andler-Formel anwenden
    lagerkosten = (2 * bedarf * bestellkosten) / (optimaleBestellmenge * optimaleBestellmenge);
    lagerkosten = roundToTwoDecimals(lagerkosten);
    // Container erstellen
    generiereContainer();
}

function generiereContainer() {
    // Tabelle leeren
    const lagerkostenElement = document.getElementById('lagerkosten');
    const bedarfElement = document.getElementById('bedarf');
    const ContainerElement = document.getElementById('Container');

    lagerkostenElement.innerText = formatCurrency(lagerkosten);
    bedarfElement.innerText = formatNumberWithSpace(bedarf);
    ContainerElement.innerHTML = '<h2>Tabelle</h2>';

    // Input-Feldwerte abrufen
    const bestellkosten = parseInt(document.getElementById('bestellkosten').value, 10);
    const optimaleBestellhaeufigkeit = parseInt(document.getElementById('optimaleBestellhaeufigkeit').value, 10);
    const schrittweite = parseInt(document.getElementById('schrittweite').value, 10);

    const werteArray = [];

    // Berechnungen außerhalb der Schleife
    const durchschnittlicherBestand = roundToTwoDecimals(bedarf / (2 * optimaleBestellhaeufigkeit));
    const bestellkostenGesamt = roundToTwoDecimals(bestellkosten * optimaleBestellhaeufigkeit);
    const lagerhaltungskosten = roundToTwoDecimals(durchschnittlicherBestand * lagerkosten);
    const gesamtkosten = roundToTwoDecimals(parseFloat(bestellkostenGesamt) + parseFloat(lagerhaltungskosten));

    werteArray.push({
        bestellmenge: Math.round(bedarf / optimaleBestellhaeufigkeit),
        haeufigkeit: optimaleBestellhaeufigkeit,
        durchschnittlicherBestand: durchschnittlicherBestand,
        bestellkostenGesamt: bestellkostenGesamt,
        lagerhaltungskosten: lagerhaltungskosten,
        gesamtkosten: gesamtkosten
    });

    const haeufigkeitVon = parseInt(document.getElementById('haeufigkeitVon').value, 10);
    const haeufigkeitBis = parseInt(document.getElementById('haeufigkeitBis').value, 10);
    let schritte = schrittweite;
    const startHaeufigkeit = Math.ceil(haeufigkeitVon / schritte) * schritte;
    for (let haeufigkeit = startHaeufigkeit; haeufigkeit <= haeufigkeitBis; haeufigkeit += schritte) {
        if (haeufigkeit === optimaleBestellhaeufigkeit) continue;

        // Werte berechnen
        const durchschnittlicherBestand = roundToTwoDecimals(bedarf / (2 * haeufigkeit));
        const bestellkostenGesamt = roundToTwoDecimals(bestellkosten * haeufigkeit);
        const lagerhaltungskosten = roundToTwoDecimals(durchschnittlicherBestand * lagerkosten);
        const gesamtkosten = roundToTwoDecimals(parseFloat(bestellkostenGesamt) + parseFloat(lagerhaltungskosten));

        // Werte zum Array hinzufügen
        werteArray.push({
            bestellmenge: Math.round(bedarf / haeufigkeit),
            haeufigkeit: haeufigkeit,
            durchschnittlicherBestand: durchschnittlicherBestand,
            bestellkostenGesamt: bestellkostenGesamt,
            lagerhaltungskosten: lagerhaltungskosten,
            gesamtkosten: gesamtkosten
        });
    }

    // Tabelle nach Bestellmenge absteigend sortieren
    werteArray.sort((a, b) => b.haeufigkeit - a.haeufigkeit);

    // Tabelle erstellen
    const table = document.createElement('table');
    table.style.width = '680px';
    table.style.borderCollapse = 'collapse';

    const thTitles = ['Bestellmenge', 'Bestellhäufigkeit', 'Durchschn. Lagerbestand', 'Bestellkosten', 'Lagerkosten', 'Gesamtkosten'];
    const headerRow = table.insertRow(0);

    thTitles.forEach(title => {
        const th = document.createElement('th');
        th.textContent = title;
        th.style.backgroundColor = '#f5f5f5';
        th.style.border = '1px solid #000';
        th.style.padding = '4px';
        headerRow.appendChild(th);
    });

    werteArray.forEach(wert => {
        const row = table.insertRow(-1);
        ['bestellmenge', 'haeufigkeit', 'durchschnittlicherBestand', 'bestellkostenGesamt', 'lagerhaltungskosten', 'gesamtkosten'].forEach(key => {
            const cell = row.insertCell();
            if (['bestellkostenGesamt', 'lagerhaltungskosten', 'gesamtkosten'].includes(key)) {
                cell.textContent = formatCurrency(wert[key]);
            } else {
                cell.textContent = formatNumberWithSpace(wert[key]);
            }
            cell.style.border = '1px solid #000';
            cell.style.textAlign = ['Bestellkosten', 'Lagerkosten', 'Gesamtkosten'].includes(key) ? 'right' : 'center';
            cell.style.padding = '4px';
        });
    });

    // Tabelle in DOM einfügen
    ContainerElement.appendChild(table);

    drawChart(werteArray);
}

function drawChart(werteArray) {

    // Berechnungen
    const optimaleBestellmenge = parseInt(document.getElementById("optimaleBestellmenge").value, 10);
    const bestellkosten = parseInt(document.getElementById("bestellkosten").value, 10);
    const optimaleBestellhaeufigkeit = parseInt(document.getElementById('optimaleBestellhaeufigkeit').value, 10);
    const bedarf = optimaleBestellmenge * optimaleBestellhaeufigkeit;
    const lagerkosten = (2 * bedarf * bestellkosten) / (optimaleBestellmenge * optimaleBestellmenge);
    const labels = [];
    const lagerhaltungskostenData = [];
    const bestellkostenData = [];
    const gesamtkostenData = [];

    let schrittebestellmenge = roundUpToNearest(optimaleBestellmenge / 100)

    // Daten für das Diagramm berechnen
    for (let i = schrittebestellmenge; i <= optimaleBestellmenge * 2; i += schrittebestellmenge) {
        const durchschnittlicherBestand = roundToTwoDecimals(i / 2);
        const bestellkostenGesamt = roundToTwoDecimals(bestellkosten * bedarf / i);
        const lagerhaltungskosten = roundToTwoDecimals(durchschnittlicherBestand * lagerkosten);
        const gesamtkosten = roundToTwoDecimals(parseFloat(bestellkostenGesamt) + parseFloat(lagerhaltungskosten));

        labels.push(i);
        lagerhaltungskostenData.push(parseFloat(lagerhaltungskosten));
        bestellkostenData.push(parseFloat(bestellkostenGesamt));
        gesamtkostenData.push(parseFloat(gesamtkosten));
    }

    // ApexCharts konfigurieren
    let ychartmax = roundUpToNearest((optimaleBestellhaeufigkeit * bestellkosten + optimaleBestellmenge / 2 * lagerkosten) * 3);
    // Berechne den Wert von tickAmount
    let tickAmount = schrittebestellmenge * 2;
    // Begrenze tickAmount auf maximal 20
    if (tickAmount > 20) {
        tickAmount = 20;
    }
    const options = {
        chart: {
            background: '#ffffff',
            animations: { enabled: false },
            type: 'line',
            height: 500,
            toolbar: {
                show: true, // Hier aktivierst du die Toolbar
                offsetX: 0,
                offsetY: 0,
                tools: {
                    download: true,  // Download Button aktivieren
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true | '<img src="/static/icons/reset.png" width="20">',
                    customIcons: []
                },
                export: {
                    svg: {
                        filename: 'chart-export.svg',  // SVG-Dateiname
                    },
                    png: {
                        filename: 'chart-export.png', // PNG-Dateiname
                    },
                    csv: {
                        filename: 'chart-export.csv', // CSV-Dateiname
                    }
                },
                autoSelected: 'zoom'
            },
        },
        dataLabels: {
            enabled: false
        },
        series: [
            {
                name: 'Lagerhaltungskosten',
                data: lagerhaltungskostenData,
            },
            {
                name: 'Bestellkosten',
                data: bestellkostenData,
            },
            {
                name: 'Gesamtkosten',
                data: gesamtkostenData,
            }
        ],
        stroke: {
            width: 4,
            curve: 'straight',

        },
        xaxis: {
            categories: labels,
            title: {
                text: 'Bestellmenge',
                style: {
                    fontSize: '14px',
                    fontWeight: 'bold',
                }
            },
            min: 0,
            tickAmount: tickAmount, // Reduziert die Anzahl der angezeigten Ticks
            labels: {
                style: {
                    fontSize: '14px',
                }
            },
        },
        yaxis: {
            title: {
                text: 'Kosten',
                style: {
                    fontSize: '14px',
                    fontWeight: 'bold',
                }
            },
            max: ychartmax,
            labels: {
                formatter: function (value) {
                    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
                },
                style: {
                    fontSize: '16px',
                }
            },
        },
        grid: {
            show: true, // Das Grid anzeigen
            borderColor: '#ccc', // Farbe der Gittergrenzen
            strokeDashArray: 0, // Strichmuster für Gitterlinien (5px Striche, 5px Lücken)
            xaxis: {
                lines: {
                    show: true, // X-Achse Linien anzeigen
                    width: 4,   // Linienbreite der X-Achse
                    color: '#000', // Farbe der X-Achse Linien
                }
            },
            yaxis: {
                lines: {
                    show: true, // Y-Achse Linien anzeigen
                    width: 1,   // Linienbreite der Y-Achse
                    color: '#000', // Farbe der Y-Achse Linien
                }
            },
        },
        tooltip: {
            enabled: false,
            y: {
                formatter: function (value) {
                    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
                }
            }
        },
        legend: {
            position: 'top', // Legende nach oben verschieben
            horizontalAlign: 'center', // Horizontal zentrieren
            verticalAlign: 'top', // Vertikal oben ausrichten
            floating: true, // Optional: floatet die Legende oben über dem Diagramm
        },
    };
    // Entferne den Inhalt des Containers und erstelle das Diagramm neu
    if (bestellChart) { try { bestellChart.destroy(); } catch (e) { } }
    const chartContainer = document.querySelector("#chart");
    chartContainer.innerHTML = "";

    bestellChart = new ApexCharts(chartContainer, options);
    bestellChart.render().then(aktualisiereDiagrammPng).catch(err => console.error('Diagramm-Fehler:', err));
}

// Diagramm als PNG unter die Tabelle im Container setzen (oder wieder entfernen)
function aktualisiereDiagrammPng() {
    const container = document.getElementById('Container');
    if (!container) return;

    const alt = document.getElementById('diagrammPng');
    if (alt) alt.remove();

    const cb = document.getElementById('chartAlsPng');
    if (!cb || !cb.checked || !bestellChart) return;

    bestellChart.dataURI({ scale: 2 }).then(({ imgURI }) => {
        const doppelt = document.getElementById('diagrammPng');
        if (doppelt) doppelt.remove();

        const img = document.createElement('img');
        img.src = imgURI;
        img.alt = 'Diagramm Optimale Bestellmenge';
        img.style.cssText = 'display:block; max-width:100%; height:auto;';
        img.style.width = (bestellChart.w?.globals?.svgWidth || 750) + 'px';

        const div = document.createElement('div');
        div.id = 'diagrammPng';
        div.innerHTML = '<br><h2>Diagramm</h2>';
        div.appendChild(img);
        container.appendChild(div);
    }).catch(err => console.error('PNG konnte nicht erstellt werden:', err));
}

document.addEventListener('DOMContentLoaded', function () {
    // Hier wird generiereContainer() beim Laden der Seite ausgeführt
    berechneOptimaleBestellmengeUndHaeufigkeit();
});

