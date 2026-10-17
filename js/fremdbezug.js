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


// ────────────────────────────────────────────────
// Hauptfunktion – wird vom Dropdown und Button aufgerufen
// ────────────────────────────────────────────────
function generateProblem() {
    const problemType = parseInt(document.getElementById("problemType").value);
    erstelleZufallssatz(problemType);
}


function erstelleZufallssatz(problemType) {
    // Fallback falls kein Typ übergeben
    if (!problemType) {
        problemType = parseInt(document.getElementById("problemType").value) || 1;
    }

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
    let random_fixeKostenGesamt_chart = kritischeMenge * (random_einstandspreis - random_variableKosten);
    random_fixeKostenGesamt_chart = roundToTwoDecimals(random_fixeKostenGesamt_chart);
    let random_Kosten_Max_chart = kritischeMenge * 2 * random_einstandspreis;
    let random_gesamtkosten_chart = kritischeMenge * 2 * random_variableKosten + parseFloat(random_fixeKostenGesamt_chart);
    let random_einstandspreis_gesamt_chart = kritischeMenge * 2 * random_einstandspreis;

    // ────────────────────────────────────────────────
    // ApexCharts-Diagramm
    // ────────────────────────────────────────────────
    let maxMenge = kritischeMenge * 2;
    const colorFremd = '#FF6384';
    const colorEigen = '#36A2EB';

    const options = {
        chart: {
            type: 'line',
            height: 480,
            fontFamily: 'Arial, Helvetica, sans-serif',
            toolbar: { show: true, autoSelected: 'zoom' },
            zoom: { enabled: true },
            animations: { enabled: true }
        },
        title: {
            text: 'Fremdbezug und Eigenfertigung',
            align: 'center',
            style: { fontSize: '20px' }
        },
        series: [
            {
                name: 'Fremdbezug',
                data: [
                    { x: 0, y: 0 },
                    { x: maxMenge, y: random_einstandspreis_gesamt_chart }
                ]
            },
            {
                name: 'Eigenfertigung',
                data: [
                    { x: 0, y: random_fixeKostenGesamt_chart },
                    { x: maxMenge, y: random_gesamtkosten_chart }
                ]
            }
        ],
        grid: {
            strokeDashArray: 4,
            borderColor: '#e5e5e5',
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: true } }
        },
        colors: [colorFremd, colorEigen],
        stroke: {
            width: 4,
            curve: 'straight',
            dashArray: [8, 0]
        },
        markers: {
            size: 0,
            hover: { size: 6 }
        },
        xaxis: {
            type: 'numeric',
            title: { text: 'Menge' },
            min: 0,
            max: maxMenge,
            tickAmount: Math.floor(maxMenge / 50),
            labels: {
                formatter: val => Math.round(val).toLocaleString('de-DE')
            }
        },
        yaxis: {
            title: { text: 'Kosten' },
            min: 0,
            max: rundeAufZehntausender(random_Kosten_Max_chart),
            labels: {
                formatter: val => formatCurrency(Math.round(val))
            }
        },
        legend: {
            position: 'bottom',
            fontSize: '16px',
            markers: {
                width: 20,
                height: 4,
                radius: 0
            }
        },
        tooltip: {
            shared: true,
            intersect: false,
            x: {
                formatter: val => formatiereMenge(Math.round(val)) + ' Stück'
            },
            y: {
                formatter: val => formatCurrency(Math.round(val))
            }
        }
    };

    if (window.fremdbezugApexChart) {
        window.fremdbezugApexChart.updateOptions(options, true, true);
    } else {
        window.fremdbezugApexChart = new ApexCharts(
            document.querySelector("#fremdbezugChart"),
            options
        );
        window.fremdbezugApexChart.render();
    }

    // ────────────────────────────────────────────────
    // Antwort-Logik
    // ────────────────────────────────────────────────
    let fremdbezug_Antwort;
    if (random_einstandspreis_gesamt_aufgabe < random_gesamtkosten_aufgabe) {
        fremdbezug_Antwort = "Der Fremdbezug ist wirtschaftlicher.";
    } else if (random_einstandspreis_gesamt_aufgabe === random_gesamtkosten_aufgabe) {
        fremdbezug_Antwort = "Eigenfertigung und Fremdbezug sind gleich wirtschaftlich.";
    } else {
        fremdbezug_Antwort = "Die Eigenfertigung ist wirtschaftlicher.";
    }

    // ────────────────────────────────────────────────
    // Rohwerte für Aufgabentext speichern (vor Formatierung)
    // ────────────────────────────────────────────────
    const raw_variableKosten             = random_variableKosten;
    const raw_einstandspreis             = random_einstandspreis;
    const raw_fixeKostenGesamt_aufgabe   = random_fixeKostenGesamt_aufgabe;
    const raw_gesamtkosten_aufgabe       = random_gesamtkosten_aufgabe;
    const raw_einstandspreis_gesamt      = random_einstandspreis_gesamt_aufgabe;
    const raw_variableKosten_gesamt      = random_variableKosten_gesamt_aufgabe;
    const raw_menge                      = random_menge;

    // Formatierung
    random_einstandspreis                = formatCurrency(random_einstandspreis);
    random_einstandspreis_gesamt_aufgabe = formatCurrency(raw_einstandspreis_gesamt);
    random_listeneinkaufspreis           = formatCurrency(random_listeneinkaufspreis);
    random_gesamtkosten_aufgabe          = formatCurrency(raw_gesamtkosten_aufgabe);
    random_variableKosten                = formatCurrency(raw_variableKosten);
    random_fixeKostenGesamt_aufgabe      = formatCurrency(raw_fixeKostenGesamt_aufgabe);
    random_rabatt_wert                   = formatCurrency(random_rabatt_wert);
    random_variableKosten_gesamt_aufgabe = formatCurrency(raw_variableKosten_gesamt);
    random_menge                         = formatiereMenge(raw_menge);

    // ────────────────────────────────────────────────
    // Zufällige Einleitungstexte
    // ────────────────────────────────────────────────
    const array_Subjekt = [
        `In der Einkaufsabteilung wird diskutiert, ob es sich im nächsten Abrechnungszeitraum lohnt, ${random_menge} Stück Fremdbauteile selbst herzustellen`,
        `Wir benötigen im nächsten Abrechnungszeitraum ${random_menge} Fremdbauteile. Aufgrund freier Kapazitäten wird im Zweigwerk die Eigenfertigung beabsichtigt`,
    ];
    const array_Subjekt2 = [
        "Folgende Daten liegen vor: ",
        "Wir kalkulieren mit den folgenden Daten: ",
    ];
    const randomArray_Subjekt  = array_Subjekt[Math.floor(Math.random() * array_Subjekt.length)];
    const randomArray_Subjekt2 = array_Subjekt2[Math.floor(Math.random() * array_Subjekt2.length)];

    // ────────────────────────────────────────────────
    // Aufgabenstellung je nach Problem-Typ
    // ────────────────────────────────────────────────
    let aufgabeSatz = `<h2>Aufgabe <small style="font-size:0.65em;color:#666;">(Typ ${problemType})</small></h2>`;
    let loesungSatz = `<h2 class="loesung">Lösung</h2>`;

    if (problemType === 1) {
        // ── Typ 1: Fremdbezug berechnen ──────────────────
        // Gegeben: Eigenfertigung komplett (variableKosten + Fixkosten + Gesamtkosten)
        // Gesucht: Einstandspreis + Gesamtkosten Fremdbezug → Vergleich
        aufgabeSatz += `
            <p>${randomArray_Subjekt}. ${randomArray_Subjekt2}</p>
            <p><b>Eigenfertigung</b></p>
            <ul>
                <li>Variable Kosten je Stück: ${random_variableKosten}</li>
                <li>Fixkosten gesamt: ${random_fixeKostenGesamt_aufgabe}</li>
                <li>Gesamtkosten Eigenfertigung: ${random_gesamtkosten_aufgabe}</li>
            </ul>
            <p><b>Fremdbezug</b></p>
            <ul>
                <li>Listeneinkaufspreis/Stück: ${random_listeneinkaufspreis}</li>
                <li>Rabatt: ${random_rabatt}&nbsp;%</li>
            </ul>
            <p>Berechnen Sie die Kosten des Fremdbezugs und entscheiden Sie, welche Alternative wirtschaftlicher ist.</p>`;

        // Lösung: Nur Fremdbezug berechnen
        loesungSatz += `<h4>Berechnung der Kosten bei Fremdbezug</h4>`;
        loesungSatz += tabelleEinstandspreis(random_listeneinkaufspreis, random_rabatt_wert, random_rabatt, random_einstandspreis);
        loesungSatz += `<p>Berechnung Einstandspreis (gesamt): ${random_einstandspreis} &times; ${random_menge} = ${random_einstandspreis_gesamt_aufgabe}</p>`;
        loesungSatz += `<h4>Antwort</h4>${fremdbezug_Antwort}`;

    } else if (problemType === 2) {
        // ── Typ 2: Eigenfertigung berechnen ──────────────
        // Gegeben: Fremdbezug komplett (Einstandspreis + Gesamtkosten)
        // Gesucht: Gesamtkosten Eigenfertigung → Vergleich
        aufgabeSatz += `
            <p>${randomArray_Subjekt}. ${randomArray_Subjekt2}</p>
            <p><b>Fremdbezug</b></p>
            <ul>
                <li>Listeneinkaufspreis/Stück: ${random_listeneinkaufspreis}</li>
                <li>Rabatt: ${random_rabatt}&nbsp;%</li>
                <li>Einstandspreis/Stück: ${random_einstandspreis}</li>
                <li>Gesamtkosten Fremdbezug: ${random_einstandspreis_gesamt_aufgabe}</li>
            </ul>
            <p><b>Eigenfertigung</b></p>
            <ul>
                <li>Variable Kosten je Stück: ${random_variableKosten}</li>
                <li>Fixkosten gesamt: ${random_fixeKostenGesamt_aufgabe}</li>
            </ul>
            <p>Berechnen Sie die Gesamtkosten der Eigenfertigung und entscheiden Sie, welche Alternative wirtschaftlicher ist.</p>`;

        // Lösung: Nur Eigenfertigung berechnen
        loesungSatz += `<h4>Berechnung der Gesamtkosten bei Eigenfertigung</h4>`;
        loesungSatz += tabelleEigenfertigung(random_variableKosten, raw_menge, raw_variableKosten, raw_fixeKostenGesamt_aufgabe, random_variableKosten_gesamt_aufgabe, random_fixeKostenGesamt_aufgabe, random_gesamtkosten_aufgabe);
        loesungSatz += `<h4>Antwort</h4>${fremdbezug_Antwort}`;

    } else {
        // ── Typ 3: Beides berechnen ───────────────────────
        // Gegeben: Nur Rohdaten (variableKosten, Fixkosten, Listeneinkaufspreis, Rabatt)
        // Gesucht: Gesamtkosten Eigenfertigung UND Fremdbezug → Vergleich
        aufgabeSatz += `
            <p>${randomArray_Subjekt}. ${randomArray_Subjekt2}</p>
            <p><b>Eigenfertigung</b></p>
            <ul>
                <li>Variable Kosten je Stück: ${random_variableKosten}</li>
                <li>Fixkosten gesamt: ${random_fixeKostenGesamt_aufgabe}</li>
            </ul>
            <p><b>Fremdbezug</b></p>
            <ul>
                <li>Listeneinkaufspreis/Stück: ${random_listeneinkaufspreis}</li>
                <li>Rabatt: ${random_rabatt}&nbsp;%</li>
            </ul>
            <p>Überprüfen Sie rechnerisch, ob die Fremdbauteile in Eigenfertigung produziert oder per Fremdbezug beschafft werden sollen.</p>`;

        // Lösung: Beides berechnen
        loesungSatz += `<h4>Berechnung der Gesamtkosten bei Eigenfertigung</h4>`;
        loesungSatz += tabelleEigenfertigung(random_variableKosten, raw_menge, raw_variableKosten, raw_fixeKostenGesamt_aufgabe, random_variableKosten_gesamt_aufgabe, random_fixeKostenGesamt_aufgabe, random_gesamtkosten_aufgabe);
        loesungSatz += `<h4>Berechnung der Kosten bei Fremdbezug</h4>`;
        loesungSatz += tabelleEinstandspreis(random_listeneinkaufspreis, random_rabatt_wert, random_rabatt, random_einstandspreis);
        loesungSatz += `<p>Berechnung Einstandspreis (gesamt): ${random_einstandspreis} &times; ${random_menge} = ${random_einstandspreis_gesamt_aufgabe}</p>`;
        loesungSatz += `<h4>Antwort</h4>${fremdbezug_Antwort}`;
    }

    document.getElementById("Container").innerHTML = aufgabeSatz + loesungSatz;
    return [aufgabeSatz, loesungSatz];
}


// ────────────────────────────────────────────────
// Hilfs-Funktionen für HTML-Tabellen
// ────────────────────────────────────────────────

function tabelleEigenfertigung(random_variableKosten, raw_menge, raw_variableKosten, raw_fixeKostenGesamt, random_variableKosten_gesamt_aufgabe, random_fixeKostenGesamt_aufgabe, random_gesamtkosten_aufgabe) {
    return `
    <table style="border-collapse:collapse;white-space:nowrap;width:350px;margin:0 0">
      <tbody>
        <tr>
          <td>Variable Kosten gesamt (${formatCurrency(raw_variableKosten)} &times; ${formatiereMenge(raw_menge)})</td>
          <td style="padding-left:16px;text-align:right;">${random_variableKosten_gesamt_aufgabe}</td>
        </tr>
        <tr>
          <td>+ Fixkosten</td>
          <td style="padding-left:16px;text-align:right;">${random_fixeKostenGesamt_aufgabe}</td>
        </tr>
        <tr>
          <td style="border-top:solid 1px #ccc">= Gesamtkosten</td>
          <td style="padding-left:16px;text-align:right;border-top:solid 1px #ccc">${random_gesamtkosten_aufgabe}</td>
        </tr>
      </tbody>
    </table><br>`;
}

function tabelleEinstandspreis(listeneinkaufspreis, rabatt_wert, rabatt_prozent, einstandspreis) {
    return `
    <table style="border-collapse:collapse;white-space:nowrap;width:350px;margin:0 0">
      <tbody>
        <tr>
          <td>Listeneinkaufspreis</td>
          <td style="padding-left:16px;text-align:right;">${listeneinkaufspreis}</td>
          <td style="padding-left:6px;">&nbsp;</td>
        </tr>
        <tr>
          <td>- Liefererrabatt</td>
          <td style="padding-left:16px;text-align:right;">${rabatt_wert}</td>
          <td style="padding-left:6px;">${rabatt_prozent}&nbsp;%</td>
        </tr>
        <tr>
          <td style="border-top:solid 1px #ccc">= Einstandspreis</td>
          <td style="padding-left:16px;text-align:right;border-top:solid 1px #ccc">${einstandspreis}</td>
          <td style="padding-left:6px;">&nbsp;</td>
        </tr>
      </tbody>
    </table><br>`;
}

// ============================================================================
// KI-ASSISTENT PROMPT – FREMDBEZUG & EIGENFERTIGUNG
// ============================================================================

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Wirtschafts-Assistent für Schüler der Realschule (BwR), 10. Klasse. Du hilfst beim Verständnis der Kosten- und Entscheidungsrechnung im Bereich Fremdbezug und Eigenfertigung.

Aufgabe:
- Gib KEINE fertigen Berechnungen, Formeln oder Vergleichsergebnisse vor.
- Führe die Schüler durch gezielte Fragen und Hinweise zur richtigen Lösung.
- Ziel: Lernförderung, nicht das Abnehmen der Denkarbeit.

Pädagogischer Ansatz:
- Frage nach der konkreten Aufgabenstellung oder den vorliegenden Daten.
- Stelle gezielte Rückfragen, um den Stand des Schülers zu verstehen.
- Beantworte deine Rückfragen nicht selbst, hake bei falschen Antworten nach.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Erst wenn alle Teilschritte richtig beantwortet wurden, bestätige das vollständige Ergebnis.

Methodik bei Rückfragen:
- Was sind die beiden Alternativen, die verglichen werden?
- Welche Daten sind für den Fremdbezug gegeben? (Listeneinkaufspreis, Rabatt)
- Welche Daten sind für die Eigenfertigung gegeben? (Variable Kosten, Fixkosten)
- Was muss zuerst berechnet werden – der Einstandspreis oder die Gesamtkosten?
- Wie berechnet man den Einstandspreis aus Listeneinkaufspreis und Rabatt?
- Was sind variable Kosten? Was sind Fixkosten? Was ist der Unterschied?
- Wie berechnet man die Gesamtkosten der Eigenfertigung?
- Welches Ergebnis ist kleiner – und was bedeutet das für die Entscheidung?
- Wo liegt die kritische Menge, bei der beide Alternativen gleich teuer sind?

Konzepte – Fremdbezug und Eigenfertigung:

Was ist Fremdbezug?
- Das Unternehmen KAUFT Bauteile oder Produkte von einem externen Lieferanten
- Kosten hängen direkt von der Menge ab (rein variable Kosten)
- Formel: Einstandspreis × Menge = Gesamtkosten Fremdbezug
- Einstandspreis = Listeneinkaufspreis − Liefererrabatt

Was ist Eigenfertigung?
- Das Unternehmen STELLT Bauteile oder Produkte selbst her
- Es entstehen sowohl variable als auch fixe Kosten
- Formel: (Variable Kosten/Stück × Menge) + Fixkosten gesamt = Gesamtkosten Eigenfertigung
- Variable Kosten steigen mit der Menge
- Fixkosten bleiben gleich, egal wie viel produziert wird

Berechnung Einstandspreis:
- Listeneinkaufspreis − Liefererrabatt = Einstandspreis/Stück
- Liefererrabatt in € = Listeneinkaufspreis × Rabatt% ÷ 100
- Gesamtkosten Fremdbezug = Einstandspreis/Stück × Menge

Berechnung Gesamtkosten Eigenfertigung:
- Variable Kosten gesamt = Variable Kosten/Stück × Menge
- Gesamtkosten = Variable Kosten gesamt + Fixkosten gesamt

Kritische Menge (Gewinnschwelle zwischen den Alternativen):
- Die Menge, bei der Fremdbezug = Eigenfertigung
- Formel: Fixkosten ÷ (Einstandspreis/Stück − Variable Kosten/Stück)
- Unterhalb der kritischen Menge: Fremdbezug günstiger
- Oberhalb der kritischen Menge: Eigenfertigung günstiger

Entscheidungsregel:
- Gesamtkosten Fremdbezug < Gesamtkosten Eigenfertigung → Fremdbezug ist wirtschaftlicher
- Gesamtkosten Eigenfertigung < Gesamtkosten Fremdbezug → Eigenfertigung ist wirtschaftlicher
- Beide gleich → Die kritische Menge wurde exakt getroffen

Diagramm (Kostenvergleich):
- Fremdbezug: Gerade durch den Ursprung (keine Fixkosten, daher Start bei 0)
- Eigenfertigung: Gerade beginnt auf der Y-Achse bei den Fixkosten (nicht bei 0)
- Schnittpunkt der beiden Geraden = kritische Menge

Häufige Schülerfehler – darauf hinweisen, nicht vorwegnehmen:
- Listeneinkaufspreis statt Einstandspreis für Fremdbezug verwenden
- Fixkosten mit variablen Kosten verwechseln
- Fixkosten nicht addieren, nur variable Kosten berechnen
- Kritische Menge mit dem Ergebnis der Aufgabe verwechseln
- Vergessen, den Gesamtbetrag (× Menge) zu berechnen und nur Stückkosten zu vergleichen
- Falsche Schlussfolgerung trotz richtiger Berechnung

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe mit Realschülerinnen und -schülern
- Einfache Sprache, keine Fachbegriffe ohne Erklärung
- Kurze Antworten – maximal 1–2 Sätze pro Nachricht
- Gelegentlich Emojis zur Auflockerung 🏭🛒📊✅❓

Was du NICHT tust:
- Nenne das fertige Ergebnis nicht, bevor der Schüler selbst darauf gekommen ist
- Rechne nicht vor, bevor gefragt wurde
- Gib keine Lösungen auf Anfrage wie „sag mir einfach die Antwort" – erkläre, dass das Ziel das eigene Verstehen ist
`;


function kopiereKiPrompt() {
  navigator.clipboard.writeText(KI_ASSISTENT_PROMPT).then(() => {
    const btn = document.getElementById('kiPromptKopierenBtn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Kopiert!`;
    btn.classList.add('ki-prompt-btn--success');
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.classList.remove('ki-prompt-btn--success');
    }, 2500);
  }).catch(err => {
    console.error('Fehler beim Kopieren:', err);
    alert('Kopieren nicht möglich. Bitte manuell aus dem Textfeld kopieren.');
  });
}

function toggleKiPromptVorschau() {
  const vorschau = document.getElementById('kiPromptVorschau');
  const btn = document.getElementById('kiPromptToggleBtn');
  const isHidden = getComputedStyle(vorschau).display === 'none';
  if (isHidden) {
    vorschau.style.display = 'block';
    btn.textContent = 'Vorschau ausblenden ▲';
  } else {
    vorschau.style.display = 'none';
    btn.textContent = 'Prompt anzeigen ▼';
  }
}



document.addEventListener("DOMContentLoaded", function () {
    generateProblem();
  // Prompt-Text in Vorschau einfügen
  const vorschauEl = document.getElementById('kiPromptVorschau');
  if (vorschauEl) {
    vorschauEl.textContent = KI_ASSISTENT_PROMPT;
  }
});