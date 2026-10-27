// Globale Registrierung für den Window-Scope
window.generateProblem = generateProblem;
window.zeigeZufaelligeAufgabe = zeigeZufaelligeAufgabe;
window.kopiereKiPrompt = kopiereKiPrompt;
window.toggleKiPromptVorschau = toggleKiPromptVorschau;

let yamlData = [];

// ────────────────────────────────────────────────
// YAML / UNTERNEHMEN LADEN
// ────────────────────────────────────────────────
function getUserCompanies() {
  try { return JSON.parse(localStorage.getItem('userCompanies') || '[]'); } catch(e) { return []; }
}

function mergeUserCompaniesIntoYamlData() {
  const userCompanies = getUserCompanies();
  if (userCompanies.length > 0) {
    yamlData = [...yamlData, ...userCompanies];
    yamlData.sort((a, b) => {
      const brancheA = a.unternehmen?.branche || '';
      const brancheB = b.unternehmen?.branche || '';
      return brancheA.localeCompare(brancheB);
    });
  }
}

function loadYamlFromLocalStorage() {
  const saved = localStorage.getItem('uploadedYamlCompanyData');
  if (saved) {
    try {
      yamlData = JSON.parse(saved);
      mergeUserCompaniesIntoYamlData();
      document.dispatchEvent(new Event('yamlDataLoaded'));
      return true;
    } catch (err) {
      console.warn('localStorage YAML kaputt:', err);
    }
  }
  return false;
}

function loadDefaultYaml() {
  fetch('js/unternehmen.yml')
    .then(res => {
      if (!res.ok) throw new Error('unternehmen.yml nicht gefunden');
      return res.text();
    })
    .then(yamlText => {
      yamlData = jsyaml.load(yamlText) || [];
      if (!localStorage.getItem('standardYamlData')) {
        localStorage.setItem('standardYamlData', JSON.stringify(yamlData));
      }
      mergeUserCompaniesIntoYamlData();
      document.dispatchEvent(new Event('yamlDataLoaded'));
    })
    .catch(err => console.error('Konnte unternehmen.yml nicht laden:', err));
}

function fillCompanyDropdowns() {
  if (!yamlData || yamlData.length === 0) return;

  const sortedCompanies = [...yamlData].sort((a, b) => {
    const brancheA = a.unternehmen?.branche || '';
    const brancheB = b.unternehmen?.branche || '';
    if (brancheA !== brancheB) return brancheA.localeCompare(brancheB);
    return (a.unternehmen?.name || '').localeCompare(b.unternehmen?.name || '');
  });

  const kundeSelect = document.getElementById('marketingKunde');
  if (!kundeSelect) return;

  kundeSelect.innerHTML = '';

  sortedCompanies.forEach(company => {
    const u = company.unternehmen;
    if (!u?.name) return;
    const fullCompanyName = u.rechtsform
      ? `${u.name} ${u.rechtsform}`.trim()
      : u.name;
    const displayText = u.branche
      ? `${u.branche} – ${fullCompanyName}`
      : fullCompanyName;
      
    const option = document.createElement('option');
    option.value = fullCompanyName;
    option.textContent = displayText;
    kundeSelect.appendChild(option);
  });

  autoSelectMyCompany();
}

function autoSelectMyCompany() {
  const myCompanyName = localStorage.getItem('myCompany');
  if (!myCompanyName) return;
  const dropdown = document.getElementById('marketingKunde');
  if (dropdown) {
    const match = Array.from(dropdown.options).find(o => o.value.includes(myCompanyName));
    if (match) {
      dropdown.value = match.value;
    }
  }
}

// Hilfsfunktionen
function roundToTwoDecimals(num) {
    return Math.round(num * 100) / 100;
}

function getRandomIntegerWithSteps(min, max, step) {
    const range = (max - min) / step;
    return Math.floor(Math.random() * range) * step + min;
}

function roundToNearest50(number) {
    return Math.ceil(number / 50) * 50;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

function formatiereMenge(menge) {
    return menge.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function rundeAufZehntausender(zahl) {
    return Math.ceil(zahl / 10000) * 10000;
}

// Zufällige Werte in die Inputs schreiben und Aufgabe generieren
function zeigeZufaelligeAufgabe() {
    let listeneinkaufspreis = getRandomIntegerWithSteps(20, 100, 10);
    let rabatt = getRandomIntegerWithSteps(5, 25, 5);
    let kritischeMenge = getRandomIntegerWithSteps(100, 1000, 50);
    let einstandspreis = listeneinkaufspreis * (100 - rabatt) / 100;
    let faktor = getRandomIntegerWithSteps(0.25, 0.75, 0.05);
    let variableKosten = roundToTwoDecimals(einstandspreis - faktor * einstandspreis);
    let fixeKosten = roundToTwoDecimals(kritischeMenge * (einstandspreis - variableKosten));
    let menge = roundToNearest50(kritischeMenge + kritischeMenge * getRandomIntegerWithSteps(-0.4, 0.4, 0.01));

    document.getElementById("listeneinkaufspreisInput").value = listeneinkaufspreis;
    document.getElementById("rabattInput").value = rabatt;
    document.getElementById("variableKostenInput").value = variableKosten;
    document.getElementById("fixkostenInput").value = fixeKosten;
    document.getElementById("mengeInput").value = menge;

    generateProblem();
}

// ────────────────────────────────────────────────
// Hauptfunktion – liest Inputs aus und berechnet alles
// ────────────────────────────────────────────────
function generateProblem() {
    const problemType = parseInt(document.getElementById("problemType").value) || 1;

    // Ausgewähltes Unternehmen aus dem Dropdown ermitteln
    const kundeSelect = document.getElementById('marketingKunde');
    const unternehmensName = (kundeSelect && kundeSelect.value) ? kundeSelect.value : '<i>[Modellunternehmen]</i>';

    // Werte aus den Eingabefeldern auslesen
    const listeneinkaufspreisVal = parseFloat(document.getElementById("listeneinkaufspreisInput").value);
    const rabattVal = parseFloat(document.getElementById("rabattInput").value);
    const variableKostenVal = parseFloat(document.getElementById("variableKostenInput").value);
    const fixkostenVal = parseFloat(document.getElementById("fixkostenInput").value);
    const mengeVal = parseFloat(document.getElementById("mengeInput").value);

    let random_listeneinkaufspreis = !isNaN(listeneinkaufspreisVal) ? listeneinkaufspreisVal : 60;
    let random_rabatt = !isNaN(rabattVal) ? rabattVal : 10;
    let random_variableKosten = !isNaN(variableKostenVal) ? variableKostenVal : 30;
    let random_fixeKostenGesamt_aufgabe = !isNaN(fixkostenVal) ? fixkostenVal : 15000;
    let random_menge = !isNaN(mengeVal) ? mengeVal : 600;

    let random_einstandspreis = random_listeneinkaufspreis * (100 - random_rabatt) / 100;
    let random_rabatt_wert = roundToTwoDecimals(random_listeneinkaufspreis * random_rabatt / 100);
    
    let random_gesamtkosten_aufgabe = random_menge * random_variableKosten + parseFloat(random_fixeKostenGesamt_aufgabe);
    let random_einstandspreis_gesamt_aufgabe = random_menge * random_einstandspreis;
    let random_variableKosten_gesamt_aufgabe = random_menge * random_variableKosten;

    // Kritische Menge fürs Diagramm ermitteln (Schnittpunkt)
    let einstandspreisTemp = random_einstandspreis;
    let kritischeMengeCalc = (einstandspreisTemp - random_variableKosten) > 0 
        ? random_fixeKostenGesamt_aufgabe / (einstandspreisTemp - random_variableKosten) 
        : 500;

    let maxMenge = Math.max(kritischeMengeCalc * 2, random_menge * 1.5);
    let random_Kosten_Max_chart = maxMenge * random_einstandspreis;
    let random_gesamtkosten_chart = maxMenge * random_variableKosten + parseFloat(random_fixeKostenGesamt_aufgabe);
    let random_einstandspreis_gesamt_chart = maxMenge * random_einstandspreis;
    let random_fixeKostenGesamt_chart = random_fixeKostenGesamt_aufgabe;

    // ────────────────────────────────────────────────
    // ApexCharts-Diagramm
    // ────────────────────────────────────────────────
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
            tickAmount: Math.floor(maxMenge / 50) || 5,
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

    // Rohwerte speichern
    const raw_variableKosten             = random_variableKosten;
    const raw_einstandspreis             = random_einstandspreis;
    const raw_fixeKostenGesamt_aufgabe   = random_fixeKostenGesamt_aufgabe;
    const raw_gesamtkosten_aufgabe       = random_gesamtkosten_aufgabe;
    const raw_einstandspreis_gesamt      = random_einstandspreis_gesamt_aufgabe;
    const raw_variableKosten_gesamt      = random_variableKosten_gesamt_aufgabe;
    const raw_menge                      = random_menge;

    // Formatierung für Ausgabe
    let f_einstandspreis                 = formatCurrency(raw_einstandspreis);
    let f_einstandspreis_gesamt_aufgabe  = formatCurrency(raw_einstandspreis_gesamt);
    let f_listeneinkaufspreis            = formatCurrency(random_listeneinkaufspreis);
    let f_gesamtkosten_aufgabe           = formatCurrency(raw_gesamtkosten_aufgabe);
    let f_variableKosten                 = formatCurrency(raw_variableKosten);
    let f_fixeKostenGesamt_aufgabe       = formatCurrency(raw_fixeKostenGesamt_aufgabe);
    let f_rabatt_wert                    = formatCurrency(random_rabatt_wert);
    let f_variableKosten_gesamt_aufgabe  = formatCurrency(raw_variableKosten_gesamt);
    let f_menge                          = formatiereMenge(raw_menge);

    // Einleitungstexte mit dem Modellunternehmen anstelle von "Wir"
    const array_Subjekt = [
        `In der Einkaufsabteilung von ${unternehmensName} wird diskutiert, ob es sich im nächsten Abrechnungszeitraum lohnt, ${f_menge} Stück Fremdbauteile selbst herzustellen`,
        `${unternehmensName} benötigt im nächsten Abrechnungszeitraum ${f_menge} Fremdbauteile. Aufgrund freier Kapazitäten wird im Zweigwerk die Eigenfertigung beabsichtigt`,
    ];
    const array_Subjekt2 = [
        "Folgende Daten liegen vor: ",
        "Es wird mit den folgenden Daten kalkuliert: ",
    ];
    const randomArray_Subjekt  = array_Subjekt[Math.floor(Math.random() * array_Subjekt.length)];
    const randomArray_Subjekt2 = array_Subjekt2[Math.floor(Math.random() * array_Subjekt2.length)];

    let aufgabeSatz = `<h2>Eigenfertigung oder Fremdbezug</h2>`;
    let loesungSatz = `<h2 class="loesung">Lösung</h2>`;

    if (problemType === 1) {
        aufgabeSatz += `
            <p>${randomArray_Subjekt}. ${randomArray_Subjekt2}</p>
            <table style="border-collapse:separate;border-spacing:16px 0;margin:16px 0 20px;">
              <tr>
                <td style="background:#e3f2fd;border:1px solid #90caf9;padding:14px 18px;vertical-align:top;width:280px;">
                  <p style="margin:0 0 10px;font-weight:bold;color:#0d47a1;border-bottom:1px dashed #90caf9;padding-bottom:6px;">Eigenfertigung</p>
                  <ul style="margin:0;padding-left:18px;">
                    <li>Variable Kosten je Stück: ${f_variableKosten}</li>
                    <li>Fixkosten gesamt: ${f_fixeKostenGesamt_aufgabe}</li>
                    <li>Gesamtkosten Eigenfertigung: ${f_gesamtkosten_aufgabe}</li>
                  </ul>
                </td>
                <td style="background:#fff3e0;border:1px solid #ffcc80;padding:14px 18px;vertical-align:top;width:280px;">
                  <p style="margin:0 0 10px;font-weight:bold;color:#e65100;border-bottom:1px dashed #ffcc80;padding-bottom:6px;">Fremdbezug</p>
                  <ul style="margin:0;padding-left:18px;">
                    <li>Listeneinkaufspreis/Stück: ${f_listeneinkaufspreis}</li>
                    <li>Rabatt: ${random_rabatt}&nbsp;%</li>
                  </ul>
                </td>
              </tr>
            </table>
            <p>Berechnen Sie die Kosten des Fremdbezugs und entscheiden Sie, welche Alternative wirtschaftlicher ist.</p>`;

        loesungSatz += `<h4>Berechnung der Kosten bei Fremdbezug</h4>`;
        loesungSatz += tabelleEinstandspreis(f_listeneinkaufspreis, f_rabatt_wert, random_rabatt, f_einstandspreis);
        loesungSatz += `<p>Berechnung Einstandspreis (gesamt): ${f_einstandspreis} &times; ${f_menge} = ${f_einstandspreis_gesamt_aufgabe}</p>`;
        loesungSatz += `<h4>Antwort</h4>${fremdbezug_Antwort}`;

    } else if (problemType === 2) {
        aufgabeSatz += `
            <p>${randomArray_Subjekt}. ${randomArray_Subjekt2}</p>
            <table style="border-collapse:separate;border-spacing:16px 0;margin:16px 0 20px;">
              <tr>
                <td style="background:#fff3e0;border:1px solid #ffcc80;padding:14px 18px;vertical-align:top;width:280px;">
                  <p style="margin:0 0 10px;font-weight:bold;color:#e65100;border-bottom:1px dashed #ffcc80;padding-bottom:6px;">Fremdbezug</p>
                  <ul style="margin:0;padding-left:18px;">
                    <li>Listeneinkaufspreis/Stück: ${f_listeneinkaufspreis}</li>
                    <li>Rabatt: ${random_rabatt}&nbsp;%</li>
                    <li>Einstandspreis/Stück: ${f_einstandspreis}</li>
                    <li>Gesamtkosten Fremdbezug: ${f_einstandspreis_gesamt_aufgabe}</li>
                  </ul>
                </td>
                <td style="background:#e3f2fd;border:1px solid #90caf9;padding:14px 18px;vertical-align:top;width:280px;">
                  <p style="margin:0 0 10px;font-weight:bold;color:#0d47a1;border-bottom:1px dashed #90caf9;padding-bottom:6px;">Eigenfertigung</p>
                  <ul style="margin:0;padding-left:18px;">
                    <li>Variable Kosten je Stück: ${f_variableKosten}</li>
                    <li>Fixkosten gesamt: ${f_fixeKostenGesamt_aufgabe}</li>
                  </ul>
                </td>
              </tr>
            </table>
            <p>Berechnen Sie die Gesamtkosten der Eigenfertigung und entscheiden Sie, welche Alternative wirtschaftlicher ist.</p>`;

        loesungSatz += `<h4>Berechnung der Gesamtkosten bei Eigenfertigung</h4>`;
        loesungSatz += tabelleEigenfertigung(f_variableKosten, raw_menge, raw_variableKosten, raw_fixeKostenGesamt_aufgabe, f_variableKosten_gesamt_aufgabe, f_fixeKostenGesamt_aufgabe, f_gesamtkosten_aufgabe);
        loesungSatz += `<h4>Antwort</h4>${fremdbezug_Antwort}`;

    } else {
        aufgabeSatz += `
            <p>${randomArray_Subjekt}. ${randomArray_Subjekt2}</p>
            <table style="border-collapse:separate;border-spacing:16px 0;margin:16px 0 20px;">
              <tr>
                <td style="background:#e3f2fd;border:1px solid #90caf9;padding:14px 18px;vertical-align:top;width:280px;">
                  <p style="margin:0 0 10px;font-weight:bold;color:#0d47a1;border-bottom:1px dashed #90caf9;padding-bottom:6px;">Eigenfertigung</p>
                  <ul style="margin:0;padding-left:18px;">
                    <li>Variable Kosten je Stück: ${f_variableKosten}</li>
                    <li>Fixkosten gesamt: ${f_fixeKostenGesamt_aufgabe}</li>
                  </ul>
                </td>
                <td style="background:#fff3e0;border:1px solid #ffcc80;padding:14px 18px;vertical-align:top;width:280px;">
                  <p style="margin:0 0 10px;font-weight:bold;color:#e65100;border-bottom:1px dashed #ffcc80;padding-bottom:6px;">Fremdbezug</p>
                  <ul style="margin:0;padding-left:18px;">
                    <li>Listeneinkaufspreis/Stück: ${f_listeneinkaufspreis}</li>
                    <li>Rabatt: ${random_rabatt}&nbsp;%</li>
                  </ul>
                </td>
              </tr>
            </table>
            <p>Überprüfen Sie rechnerisch, ob die Fremdbauteile in Eigenfertigung produziert oder per Fremdbezug beschafft werden sollen.</p>`;

        loesungSatz += `<h4>Berechnung der Gesamtkosten bei Eigenfertigung</h4>`;
        loesungSatz += tabelleEigenfertigung(f_variableKosten, raw_menge, raw_variableKosten, raw_fixeKostenGesamt_aufgabe, f_variableKosten_gesamt_aufgabe, f_fixeKostenGesamt_aufgabe, f_gesamtkosten_aufgabe);
        loesungSatz += `<h4>Berechnung der Kosten bei Fremdbezug</h4>`;
        loesungSatz += tabelleEinstandspreis(f_listeneinkaufspreis, f_rabatt_wert, random_rabatt, f_einstandspreis);
        loesungSatz += `<p>Berechnung Einstandspreis (gesamt): ${f_einstandspreis} &times; ${f_menge} = ${f_einstandspreis_gesamt_aufgabe}</p>`;
        loesungSatz += `<h4>Antwort</h4>${fremdbezug_Antwort}`;
    }

    document.getElementById("Container").innerHTML = aufgabeSatz + loesungSatz;
    return [aufgabeSatz, loesungSatz];
}

// Hilfs-Funktionen für HTML-Tabellen
function tabelleEigenfertigung(f_variableKosten, raw_menge, raw_variableKosten, f_fixeKostenGesamt, f_variableKosten_gesamt_aufgabe, f_fixeKostenGesamt_aufgabe, f_gesamtkosten_aufgabe) {
    return `
    <table style="border-collapse:collapse;white-space:nowrap;width:350px;margin:0 0">
      <tbody>
        <tr>
          <td>Variable Kosten gesamt (${formatCurrency(raw_variableKosten)} &times; ${formatiereMenge(raw_menge)})</td>
          <td style="padding-left:16px;text-align:right;">${f_variableKosten_gesamt_aufgabe}</td>
        </tr>
        <tr>
          <td>+ Fixkosten</td>
          <td style="padding-left:16px;text-align:right;">${f_fixeKostenGesamt_aufgabe}</td>
        </tr>
        <tr>
          <td style="border-top:solid 1px #ccc">= Gesamtkosten</td>
          <td style="padding-left:16px;text-align:right;border-top:solid 1px #ccc">${f_gesamtkosten_aufgabe}</td>
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

// KI-Assistent Prompt
const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Wirtschafts-Assistent für Schüler der Realschule (BwR), 10. Klasse. Du hilfst beim Verständnis der Kosten- und Entscheidungsrechnung im Bereich Fremdbezug und Eigenfertigung.
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

// Initialisierung beim Laden der Seite
document.addEventListener("DOMContentLoaded", function () {
    if (!loadYamlFromLocalStorage()) {
        loadDefaultYaml();
    }

    if (yamlData && yamlData.length > 0) {
        fillCompanyDropdowns();
    } else {
        document.addEventListener('yamlDataLoaded', fillCompanyDropdowns, { once: true });
    }

    setTimeout(() => {
        zeigeZufaelligeAufgabe();
    }, 250);

    const vorschauEl = document.getElementById('kiPromptVorschau');
    if (vorschauEl) {
      vorschauEl.textContent = KI_ASSISTENT_PROMPT;
    }
});