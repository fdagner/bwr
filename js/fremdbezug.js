// Auf 2 Dezimalstellen runden
function roundToTwoDecimals(num) {
    return Math.round(num * 100) / 100;
  }

// Funktion für zufällige Zahlen
function getRandomIntegerWithSteps(min, max, step) {
    const range = (max - min) / step;
    return Math.floor(Math.random() * range) * step + min;
}

function getrandom_kritischeMenge() {
    return getRandomIntegerWithSteps(100, 1000, 50);
}

function getrandom_faktor() {
    return getRandomIntegerWithSteps(0.25, 0.75, 0.05);
}

function getrandom_listeneinkaufspreis() {
    return getRandomIntegerWithSteps(20, 100, 10);
}

function getrandom_rabatt() {
    return getRandomIntegerWithSteps(5, 25, 5);
}

function getrandom_abweichung() {
    return getRandomIntegerWithSteps(-0.4, 0.4, 0.01);
}

function roundToNearest50(number) {
    return Math.ceil(number / 50) * 50;
}

function roundToNearest5(number) {
    return Math.ceil(number / 10) * 10;
}

// Formatieren der Währung mit Euro-Symbol, Tausenderpunkt und Dezimalkomma
function formatCurrency(amount) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

function formatiereMenge(menge) {
    return menge.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function rundeAufZehntausender(zahl) {
    return Math.ceil(zahl / 10000) * 10000;
}


function erstelleZufallssatz() {
    let random_listeneinkaufspreis = getrandom_listeneinkaufspreis();
    let random_rabatt = getrandom_rabatt();
    let kritischeMenge = getrandom_kritischeMenge();
    let random_einstandspreis = random_listeneinkaufspreis * (100 - random_rabatt) / 100;
    let random_variableKosten = random_einstandspreis - getrandom_faktor() * random_einstandspreis;

    // Berechnung für Aufgabe
    let random_menge = roundToNearest50(kritischeMenge + kritischeMenge * getrandom_abweichung());
    let random_fixeKostenGesamt_aufgabe = kritischeMenge * (random_einstandspreis - random_variableKosten);
    random_fixeKostenGesamt_aufgabe = roundToTwoDecimals(random_fixeKostenGesamt_aufgabe);
    let random_Kosten_Max_aufgabe = random_menge * random_einstandspreis;
    let random_gesamtkosten_aufgabe = random_menge * random_variableKosten + parseFloat(random_fixeKostenGesamt_aufgabe);
    let random_einstandspreis_gesamt_aufgabe = random_menge * random_einstandspreis;
    let random_rabatt_wert = random_listeneinkaufspreis * random_rabatt / 100;
    random_rabatt_wert = roundToTwoDecimals(random_rabatt_wert);
    let random_variableKosten_gesamt_aufgabe = random_menge * random_variableKosten;


    // Berechnung für Diagramm
    let random_fixeKostenGesamt_chart = kritischeMenge * (random_einstandspreis - random_variableKosten)
    random_fixeKostenGesamt_chart = roundToTwoDecimals(random_fixeKostenGesamt_chart);
    let random_Kosten_Max_chart = kritischeMenge * 2 * random_einstandspreis;
    let random_gesamtkosten_chart = kritischeMenge * 2 * random_variableKosten + parseFloat(random_fixeKostenGesamt_chart);
    let random_einstandspreis_gesamt_chart = kritischeMenge * 2 * random_einstandspreis;


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


    let maxMenge = kritischeMenge * 2;

    if (window.fremdbezugChart instanceof Chart) {
        window.fremdbezugChart.destroy();
    }

    const ctx = document.getElementById('fremdbezugChart').getContext('2d');
    window.fremdbezugChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Fremdbezug',
                    data: [{ x: 0, y: 0 }, { x: maxMenge, y: random_einstandspreis_gesamt_chart }],
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 4,
                    borderDash: [10,5],
                    showLine: true
                },
                {
                    label: 'Eigenfertigung',
                    data: [{ x: 0, y: random_fixeKostenGesamt_chart }, { x: maxMenge, y: random_gesamtkosten_chart }],
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 4,
                    showLine: true
                },

            ]
        },
        options: {
            responsive: true,
            aspectRatio: 1.5,
            plugins: {
                title: { display: true, text: 'Fremdbezug und Eigenfertigung', font: { size: 20 } },
                legend: { position: 'bottom', labels: { font: { size: 16 },  useLineStyle: true, } },
                tooltip: { mode: 'index', intersect: false }
            },
            hover: { mode: 'x-axis', intersect: false },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Kosten'
                    },
                    beginAtZero: true,
                    max: rundeAufZehntausender(random_Kosten_Max_chart),
                    min: 0
                },
                x: {
                    max: maxMenge,
                    ticks: {
                        // forces step size to be 50 units
                        stepSize: getStepSize(kritischeMenge)
                    },
                    title: {
                        display: true,
                        text: 'Menge'
                    },
                }
            }
        },
        plugins: [plugin],
    });

    function getStepSize(kritischeMenge) {
        if (kritischeMenge < 100) {
            return 1; // Bei zweistelligen Zahlen
        } else if (kritischeMenge < 1000) {
            return 50; // Bei dreistelligen Zahlen
        } else {
            return 50; // Bei vierstelligen Zahlen und höher
        }
    }

    let fremdbezug_Antwort;

    if (random_einstandspreis_gesamt_aufgabe < random_gesamtkosten_aufgabe) {
        fremdbezug_Antwort = "Der Fremdbezug ist wirtschaftlicher.";
    } else if (random_einstandspreis_gesamt_aufgabe === random_gesamtkosten_aufgabe) {
        fremdbezug_Antwort = "Eigenfertigung und Fremdbezug sind gleich wirtschaftlich.";
    } else {
        fremdbezug_Antwort = "Die Eigenfertigung ist wirtschaftlicher.";
    }


    random_einstandspreis = formatCurrency(random_einstandspreis);
    random_einstandspreis_gesamt_aufgabe = formatCurrency(random_einstandspreis_gesamt_aufgabe);
    random_listeneinkaufspreis = formatCurrency(random_listeneinkaufspreis);
    random_gesamtkosten_aufgabe = formatCurrency(random_gesamtkosten_aufgabe);
    random_variableKosten = formatCurrency(random_variableKosten);
    random_fixeKostenGesamt_aufgabe = formatCurrency(random_fixeKostenGesamt_aufgabe);
    random_rabatt_wert = formatCurrency(random_rabatt_wert);
    random_variableKosten_gesamt_aufgabe = formatCurrency(random_variableKosten_gesamt_aufgabe);
    random_menge = formatiereMenge(random_menge);

    const array_Subjekt = [
        `In der Einkaufsabteilung wird diskutiert, ob es sich im nächsten Abrechnungszeitraum lohnt ${random_menge} Stück Fremdbauteile selbst herzustellen`,
        `Wir benötigen im nächsten Abrechnungszeitraum ${random_menge} Fremdbauteile. Aufgrund freier Kapazitäten wird im Zweigwerk die Eigenfertigung beabsichtigt`,
    ];
    const array_Subjekt2 = [
        "Folgende Daten liegen vor: ",
        "Wir kalkulieren mit den folgenden Daten: ",
    ];
    const randomArray_Subjekt =
        array_Subjekt[Math.floor(Math.random() * array_Subjekt.length)];
    const randomArray_Subjekt2 =
        array_Subjekt2[Math.floor(Math.random() * array_Subjekt2.length)];


    let aufgabeSatz;
    const randomAufgabeSatz = Math.random();
    aufgabeSatz = `<h3>Aufgabe</h3>`;
    if (randomAufgabeSatz < 0.33) {
        aufgabeSatz += `<p>${randomArray_Subjekt}. ${randomArray_Subjekt2}</p><p><b>Eigenfertigung</b></p><ul><li>Variable Kosten je Stück: ${random_variableKosten}</li><li>Fixkosten gesamt: ${random_fixeKostenGesamt_aufgabe}</li></ul>
      <p><b>Fremdbezug</b></p><ul><li>Listeneinkaufspreis/Stück: ${random_listeneinkaufspreis}.</li><li>Rabatt: ${random_rabatt} %</li></ul><p>Überprüfen Sie rechnerisch, ob die Fremdbauteile in Eigenfertigung produziert oder per Fremdbezug beschafft werden sollen.</p>`;
    } else if (randomAufgabeSatz < 0.66) {
        aufgabeSatz += `<p>${randomArray_Subjekt}. ${randomArray_Subjekt2}</p><p><b>Eigenfertigung</b></p><ul><li>Bei variable Kosten je Stück von ${random_variableKosten} und gesamten Fixkosten in Höhe ${random_fixeKostenGesamt_aufgabe} ergeben sich Gesamtkosten von ${random_gesamtkosten_aufgabe}</li></ul>
      <p><b>Fremdbezug</b></p><ul><li>Listeneinkaufspreis/Stück: ${random_listeneinkaufspreis}.</li><li>Rabatt: ${random_rabatt} %</li></ul><p>Ermitteln Sie rechnerisch, ob die Eigenfertigung günstiger als der Fremdbezug ist.</p>`;
    } else if (randomAufgabeSatz > 0.66) {
        aufgabeSatz += `<p>${randomArray_Subjekt}. ${randomArray_Subjekt2}</p><p><b>Eigenfertigung</b></p><ul><li>Variable Kosten je Stück: ${random_variableKosten}</li><li>Fixkosten gesamt: ${random_fixeKostenGesamt_aufgabe}</li></ul>
      <p><b>Fremdbezug</b></p><ul><li>Bei einem Listeneinkaufspreis von ${random_listeneinkaufspreis} abzüglich ${random_rabatt} % Rabatt, bezahlen wir einen Einstandspreis/Stück von ${random_einstandspreis}.</li></ul><p>Ermitteln Sie rechnerisch, ob der Fremdbezug wirtschaftlicher als die Eigenfertigung ist.`;
    }
    aufgabeSatz += ``;
    let loesungSatz = `<h3>Lösung</h3>`;
    if (randomAufgabeSatz >= 0.33 && randomAufgabeSatz <= 0.66) {
    } else {
        loesungSatz += `<h4>Berechnung der Gesamtkosten bei Eigenfertigung</h4>`;
        loesungSatz += `<table style="border-collapse: collapse;white-space:nowrap;width:350px;margin: 0 0">`;
        loesungSatz += `<tbody>`;
        loesungSatz += `<tr>`;
        loesungSatz += `<td>Variable Kosten gesamt (${random_variableKosten}  &times; ${random_menge})</td><td style="padding-left:16px;text-align:right;">${random_variableKosten_gesamt_aufgabe}</td>`;
        loesungSatz += `</tr>`;
        loesungSatz += `<tr>`;
        loesungSatz += `<td>+ Fixkosten</td><td style="padding-left:16px;text-align:right;">${random_fixeKostenGesamt_aufgabe}</td>`;
        loesungSatz += `</tr>`;
        loesungSatz += `<tr>`;
        loesungSatz += `<td style="border-top: solid 1px #ccc">= Gesamtkosten</td>`;
        loesungSatz += `<td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc">${random_gesamtkosten_aufgabe}<br></td>`;
        loesungSatz += `</tr>`;
        loesungSatz += `</tbody>`;
        loesungSatz += `</table>`;
    }
    loesungSatz += `<h4>Berechnung der Kosten bei Fremdbezug</h4>`;
    if (randomAufgabeSatz < 0.66) {
        loesungSatz += `<table style="border-collapse: collapse;white-space:nowrap;width:350px;margin: 0 0">`;
        loesungSatz += `<tbody>`;
        loesungSatz += `<tr>`;
        loesungSatz += `<td>Listeneinkaufspreis</td><td style="padding-left:16px;text-align:right;">${random_listeneinkaufspreis}</td>`;
        loesungSatz += `<td style="padding-left:6px;text-align:right;">&nbsp;</td>`;
        loesungSatz += `</tr>`;
        loesungSatz += `<tr>`;
        loesungSatz += `<td>- Liefererrabatt</td><td style="padding-left:16px;text-align:right;">${random_rabatt_wert}</td>`;
        loesungSatz += `<td style="padding-left:6px;text-align:right;">${random_rabatt} %</td>`;
        loesungSatz += `</tr>`;
        loesungSatz += `<tr>`;
        loesungSatz += `<td style="border-top: solid 1px #ccc">= Einstandspreis</td>`;
        loesungSatz += `<td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc">${random_einstandspreis}<br></td>`;
        loesungSatz += `<td style="padding-left:6px;text-align:right;">&nbsp;</td>`;
        loesungSatz += `</tr>`;
        loesungSatz += `</tbody>`;
        loesungSatz += `</table><br>`;
    }
    loesungSatz += `Berechnung Einstandspreis (gesamt): ${random_einstandspreis} &times; ${random_menge} =  ${random_einstandspreis_gesamt_aufgabe}`;
    loesungSatz += `<h4>Antwort</h4>${fremdbezug_Antwort}`
    document.getElementById("fremdbezugContainer").innerHTML = aufgabeSatz + loesungSatz;
    return [aufgabeSatz, loesungSatz];
}


function fremdbezugHerunterladen() {
    const emailHTML = document.getElementById('fremdbezugContainer').innerHTML.replace(/&nbsp;/g, ' ');;
    const blob = new Blob([emailHTML], { type: 'html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'fremdbezug.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}



function fremdbezugKopiereInZwischenablage() {
    const fremdbezugHTML = document.getElementById('fremdbezugContainer').innerHTML;
    navigator.clipboard.writeText(fremdbezugHTML)
        .then(() => alert('Code wurde in die Zwischenablage kopiert'))
        .catch(err => console.error('Fehler beim Kopieren in die Zwischenablage:', err));
}

function fremdbezugHerunterladenAlsPNG() {
    const fremdbezugContainer = document.getElementById('fremdbezugContainer');

    html2canvas(fremdbezugContainer).then(canvas => {
        const dataURL = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = 'fremdbezug.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}

function fremdbezugDiagrammHerunterladenAlsPNG() {
    const fremdbezugContainer = document.getElementById('fremdbezugChart');

    html2canvas(fremdbezugContainer).then(canvas => {
        const dataURL = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = 'fremdbezugDiagramm.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}

let clipboardFremdbezug = new ClipboardJS('#officeButtonFremdbezug');

clipboardFremdbezug.on('success', function (e) {
    console.log("Die Tabelle wurde in die Zwischenablage kopiert.");
    alert("Die Tabelle wurde in die Zwischenablage kopiert.");
});

clipboardFremdbezug.on('error', function (e) {
    console.error("Fehler beim Kopieren der Tabelle: ", e.action);
    alert("Fehler beim Kopieren der Tabelle.");
});

