let yamlData = [];
let kunde = '<i>[Modellunternehmen]</i>';

// ============================================================================
// YAML-DATEN LADEN
// ============================================================================

function getUserCompanies() {
  const stored = localStorage.getItem('userCompanies');
  return stored ? JSON.parse(stored) : [];
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
    console.log(`${userCompanies.length} Benutzerunternehmen hinzugefügt. Gesamt: ${yamlData.length} Unternehmen`);
  }
}

function loadYamlFromLocalStorage() {
  const saved = localStorage.getItem('uploadedYamlCompanyData');
  if (saved) {
    try {
      yamlData = JSON.parse(saved);
      console.log(`yamlData aus localStorage geladen (${yamlData.length} Unternehmen)`);
      mergeUserCompaniesIntoYamlData();
      document.dispatchEvent(new Event('yamlDataLoaded'));
      return true;
    } catch (err) {
      console.warn("localStorage YAML kaputt:", err);
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
      console.log(`Standard yamlData geladen (${yamlData.length} Unternehmen)`);
      document.dispatchEvent(new Event('yamlDataLoaded'));
    })
    .catch(err => {
      console.error("Konnte unternehmen.yml nicht laden:", err);
    });
}

// ============================================================================
// LINEARE ABSCHREIBUNG – DIAGRAMM-AUFGABEN GENERATOR
// Sachanlage-Abschreibung nach AfA-Tabelle (nur MA und FP)
// AK ist stets ganzzahlig UND (AK − 1) durch ND teilbar → AfA immer exakt ganzzahlig
// ============================================================================

// ── Hilfsfunktionen ──────────────────────────────────────────────────────────

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatEuro(val) {
  return val.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

// ============================================================================
// DROPDOWN BEFÜLLEN
// ============================================================================

function fillCompanyDropdowns() {
  if (!yamlData || yamlData.length === 0) {
    console.warn("yamlData ist leer → keine Unternehmen zum Befüllen");
    return;
  }
  
  const sortedCompanies = [...yamlData].sort((a, b) => {
    const brancheA = a.unternehmen?.branche || '';
    const brancheB = b.unternehmen?.branche || '';
    if (brancheA !== brancheB) return brancheA.localeCompare(brancheB);
    return (a.unternehmen?.name || '').localeCompare(b.unternehmen?.name || '');
  });
  
  const kundeSelect = document.getElementById('marketingKunde');
  
  if (!kundeSelect) return;
  
  kundeSelect.innerHTML = '';
  const opt = document.createElement('option');
  opt.value = '';
  opt.text = '— bitte Unternehmen auswählen —';
  opt.disabled = true;
  opt.selected = true;
  kundeSelect.appendChild(opt);
  
  sortedCompanies.forEach(company => {
    const u = company.unternehmen;
    if (!u?.name) return;
    
    const displayText = u.branche 
      ? `${u.branche} – ${u.name} ${u.rechtsform || ''}`.trim()
      : `${u.name} ${u.rechtsform || ''}`.trim();
    
    const option = document.createElement('option');
    option.value = u.name;
    option.textContent = displayText;
    option.dataset.id = u.id || '';
    option.dataset.rechtsform = u.rechtsform || '';
    option.dataset.branche = u.branche || '';
    
    kundeSelect.appendChild(option);
  });
  
  console.log(`Dropdown befüllt mit ${sortedCompanies.length} Unternehmen`);
}

// ============================================================================
// AfA-TABELLEN-DATEN – nur Maschinen und Fuhrpark
// ============================================================================

const afaTabelle = {
  maschinen: [
    { bezeichnung: 'Drehmaschine',            nd: 13, kontoHaben: '0700 MA', kontoHabenKurz: 'MA', icon: '⚙️' },
    { bezeichnung: 'Fräsmaschine',            nd: 13, kontoHaben: '0700 MA', kontoHabenKurz: 'MA', icon: '⚙️' },
    { bezeichnung: 'CNC-Maschine', nd: 13, kontoHaben: '0700 MA', kontoHabenKurz: 'MA', icon: '🦾' },
    { bezeichnung: 'Schweißmaschine',         nd: 10, kontoHaben: '0700 MA', kontoHabenKurz: 'MA', icon: '🔧' },
    { bezeichnung: 'Kompressor',              nd: 10, kontoHaben: '0700 MA', kontoHabenKurz: 'MA', icon: '🔧' },
    { bezeichnung: 'Förderanlage',            nd: 13, kontoHaben: '0700 MA', kontoHabenKurz: 'MA', icon: '⚙️' },
  ],
  fuhrpark: [
    { bezeichnung: 'LKW (7,5 t)',             nd:  9, kontoHaben: '0840 FP', kontoHabenKurz: 'FP', icon: '🚛' },
    { bezeichnung: 'LKW (über 7,5 t)',        nd:  9, kontoHaben: '0840 FP', kontoHabenKurz: 'FP', icon: '🚛' },
    { bezeichnung: 'Lieferwagen',             nd:  6, kontoHaben: '0840 FP', kontoHabenKurz: 'FP', icon: '🚚' },
    { bezeichnung: 'PKW / Kombi',             nd:  6, kontoHaben: '0840 FP', kontoHabenKurz: 'FP', icon: '🚗' },
    { bezeichnung: 'Transporter',             nd:  6, kontoHaben: '0840 FP', kontoHabenKurz: 'FP', icon: '🚐' },
    { bezeichnung: 'Anhänger / Auflieger',    nd: 10, kontoHaben: '0840 FP', kontoHabenKurz: 'FP', icon: '🚛' },
  ],
};

const kategorieKeys = ['maschinen', 'fuhrpark'];

// AK-Bereiche (werden nur als Orientierung verwendet; gültige AK werden per genAK() erzeugt)
const akRanges = {
  maschinen: { min: 26000, max: 195000 },
  fuhrpark:  { min: 18000, max: 108000 },
};

// ============================================================================
// AK GENERIEREN: ganzzahlig UND (AK − 1) durch ND teilbar
//
// Bedingung: AK = k * nd + 1   (dann gilt (AK−1) / nd = k, exakt ganzzahlig)
// Damit AK "schön" wirkt: k * nd soll durch 1000 teilbar sein.
// → k muss Vielfaches von (1000 / ggT(nd, 1000)) sein.
// ============================================================================

function ggT(a, b) { return b === 0 ? a : ggT(b, a % b); }

// ============================================================================
// GENERIERUNG: Erst AfA-Betrag, dann AK = AfA * ND  (AK immer Vielfaches von ND)
// ============================================================================
function genAfAundAK(nd, range) {
  const minAK = range.min;
  const maxAK = range.max;

  // Sinnvolle AfA-Beträge (runde Zahlen)
  const moeglicheAfa = [5000, 6000, 7000, 7500, 8000, 8500, 9000, 9500, 
                        10000, 11000, 12000, 12500, 13000, 14000, 15000, 
                        16000, 18000, 20000];

  // AfA so wählen, dass AK = afa * nd im gewünschten Bereich liegt
  let afaBetrag = pick(moeglicheAfa);
  
  let ak = afaBetrag * nd;

  // Falls AK außerhalb des Bereichs → korrigieren
  while (ak < minAK || ak > maxAK) {
    if (ak < minAK) {
      afaBetrag += 500;           // nächstgrößeren AfA versuchen
    } else {
      afaBetrag -= 500;
    }
    ak = afaBetrag * nd;
    
    if (afaBetrag < 3000 || afaBetrag > 30000) {
      // Fallback: AK auf schöne runde Zahl in der Mitte des Bereichs
      ak = Math.round((minAK + maxAK) / 2 / 1000) * 1000;
      afaBetrag = Math.floor(ak / nd);
      break;
    }
  }

  return { ak, afaBetrag };
}

// ============================================================================
// AUFGABEN-SET
// ============================================================================

function erstelleAufgabenSet(anlage, ak, nd, afaBetrag) {
  const letzteAfa       = afaBetrag - 1;                    // ← NEU
  const restVorLetztem  = afaBetrag;                        // Rest vor dem letzten Jahr
  
  const kontoHaben      = anlage.kontoHaben;
  const icon            = anlage.icon;
  const prozent         = parseFloat(((1 / nd) * 100).toFixed(2)).toLocaleString('de-DE');

  // Kauf-Buchungssatz bleibt gleich
  const kaufVorst  = Math.round(ak * 0.19 * 100) / 100;
  const kaufBrutto = ak + kaufVorst;

  const fragen = [
    // 0 – Definition
    {
      text: `Erkläre den Begriff "lineare Abschreibung".`,
      loesung: `Sachanlagen nutzen sich durch den Betrieb ab (Wertminderung). Die Abschreibung erfasst diesen Wertverlust als Aufwand in der Buchführung. Bei der <strong>linearen Abschreibung</strong> wird der Anschaffungspreis einer Sachanlage gleichmäßig auf alle Nutzungsjahre verteilt – in jedem Jahr wird exakt derselbe Betrag abgeschrieben.`,
    },
    // 1 – Nutzungsdauer ablesen
    {
      text: `Bestimme aus dem Diagramm die Nutzungsdauer.`,
      loesung: `Die Nutzungsdauer beträgt <span class="val">${nd} Jahre</span>.`,
    },
    // 2 – AK ablesen + AfA berechnen
   {
      text: `Lies die Anschaffungskosten aus dem Diagramm ab. Berechne daraus den jährlichen Abschreibungsbetrag (Jahres-AfA) und den Abschreibungssatz.`,
      loesung: `Anschaffungskosten (AK): <span class="val">${formatEuro(ak)}</span><br>
Jahres-AfA: <span class="val">${formatEuro(afaBetrag)} (${formatEuro(ak)} geteilt durch ${nd} Jahre Nutzungsdauer)</span><br>
Abschreibungssatz: <span class="val">${prozent}&nbsp;%</span>`
    },
    // 3 – Restbuchwert
   {
      text: `Berechne den Restbuchwert am Ende des ${nd - 1}. Nutzungsjahres.`,
      loesung: `Restbuchwert Ende Jahr ${nd-1}:<br>
= AK − (${nd-1} × Jahres-AfA)<br>
= ${formatEuro(ak)} − (${nd-1} × ${formatEuro(afaBetrag)})<br>
= <span class="val">${formatEuro(restVorLetztem)}</span>`,
    },
    // 4 – Erinnerungswert
  {
      text: `Erkläre die Bedeutung des der Erinnerungswerts von 1&nbsp;€ am Ende der Nutzungsdauer!`,
      loesung: `Am Ende der Nutzungsdauer bleibt ein symbolischer <strong>Erinnerungswert von 1,00&nbsp;€</strong>, falls das Anlagegut weiterhin im Betrieb genutzt wird. Im letzten Jahr werden daher nur ${formatEuro(letzteAfa)} statt ${formatEuro(afaBetrag)} abgeschrieben.<br>`,
    },
    // 5 – AfA-Tabelle
    {
      text: `Die Nutzungsdauer wurde aus der AfA-Tabelle entnommen. Was bedeutet „AfA"?`,
      loesung: `AfA steht für „Absetzung für Abnutzung".<br>`,
    },
    // 6 – Anschaffungskosten-Bestandteile
    {
      text: `Nenne alles, was allgemein zu den Anschaffungskosten gehört.`,
      loesung: `Zu den <strong>Anschaffungskosten</strong> gehören:<br>
&nbsp;&nbsp;• Kaufpreis (Nettobetrag, ohne USt)<br>
&nbsp;&nbsp;+ Anschaffungsnebenkosten (z.&nbsp;B. Transport, Montage, Zölle, Fundamentarbeiten)<br>
&nbsp;&nbsp;− Anschaffungspreisminderungen (z.&nbsp;B. Rabatte, Skonti)`,
    },
    // 7 – Buchungssatz Kauf
   {
      text: `Bilde den Buchungssatz für den Kauf der Sachanlage auf Ziel.`,
      loesung: `
<table style="border: 1px solid #ccc; white-space:nowrap; background-color:#fff; font-family:courier; width:600px; margin:0 0 6px;">
  <tr>
    <td style="min-width:160px;">${kontoHaben}</td>
    <td style="text-align:right;min-width:145px;">${formatEuro(ak)}</td>
    <td style="text-align:center;min-width:50px;"></td>
    <td style="min-width:90px;"></td>
    <td style="min-width:145px;"></td>
  </tr>
  <tr>
    <td>2600 VORST</td>
    <td style="text-align:right;">${formatEuro(kaufVorst)}</td>
    <td style="text-align:center;">an</td>
    <td>4400 VE</td>
    <td style="text-align:right;">${formatEuro(kaufBrutto)}</td>
  </tr>
</table>
Netto (AK): ${formatEuro(ak)} &nbsp;|&nbsp; Vorsteuer 19&nbsp;%: ${formatEuro(kaufVorst)} &nbsp;|&nbsp; Brutto: ${formatEuro(kaufBrutto)}`,
    },
    // 8 – Buchungssatz AfA  ← ERSETZT den bisherigen Eintrag
    {
      text: `Erstelle den Buchungssatz für die Abschreibung im 1.&nbsp;Nutzungsjahr.`,
      loesung: `
<table style="border: 1px solid #ccc; white-space:nowrap; background-color:#fff; font-family:courier; width:600px; margin:0 0 6px;">
  <tr>
    <td style="min-width:160px;">6520 ABSA</td>
    <td style="text-align:right;min-width:145px;">${formatEuro(afaBetrag)}</td>
    <td style="text-align:center;min-width:50px;">an</td>
    <td style="min-width:120px;">${kontoHaben}</td>
    <td style="text-align:right;min-width:145px;">${formatEuro(afaBetrag)}</td>
  </tr>
</table>`,
    },
  ];

  // Feste Fragen: 1 (ND), 2 (AfA berechnen), 7 (Buchungssatz Kauf), 8 (Buchungssatz AfA)
  // Zufällig 2 weitere aus dem optionalen Pool
  const fixedIdx  = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const optionIdx = [];
  const shuffled  = optionIdx.sort(() => Math.random() - 0.5).slice(0, 2);
  const selected  = [...fixedIdx, ...shuffled].sort((a, b) => a - b);
  return selected.map(i => fragen[i]);
}




// ============================================================================
// HAUPTGENERATOR
// ============================================================================

let letzteAfaAufgabe = null;
let renderedCharts   = [];

function getSelectedKategorie() {
  const sel = document.getElementById('anlageSelect');
  const val = sel ? parseInt(sel.value) : -1;
  if (val === 0) return 'maschinen';
  if (val === 1) return 'fuhrpark';
  return pick(kategorieKeys);
}

function zeigeAbschreibungMitManuellen() {
  const akIn = document.getElementById('akInput').value.trim();
  const ndIn = document.getElementById('ndInput').value.trim();
  const manAK = akIn ? parseInt(akIn) : null;
  const manND = ndIn ? parseInt(ndIn) : null;
  zeigeZufaelligeAbschreibungsAufgabe(manAK, manND);
}

function zeigeZufaelligeAbschreibungsAufgabe(manuelleAK = null, manuelleND = null) {
  renderedCharts.forEach(c => { try { c.destroy(); } catch (e) {} });
  renderedCharts = [];

  const katKey  = getSelectedKategorie();
  const anlagen = afaTabelle[katKey];
  const anlage  = pick(anlagen);
  const range   = akRanges[katKey];

// ── Nutzungsdauer ─────────────────────────────────────────────────────────
  const nd = (manuelleND && manuelleND >= 1 && manuelleND <= 50) 
             ? manuelleND 
             : anlage.nd;

  // ── NEU: Erst AfA-Betrag erzeugen, dann AK = AfA * ND (AK immer Vielfaches von ND)
  let ak, afaBetrag;
  
  if (manuelleAK && manuelleAK > 1000) {
    afaBetrag = Math.floor(manuelleAK / nd);
    ak = afaBetrag * nd;                    // AK wird exaktes Vielfaches von ND
  } else {
    const result = genAfAundAK(nd, range);
    ak = result.ak;
    afaBetrag = result.afaBetrag;
  }

  const letzteAfa = afaBetrag - 1;

  // ── Jahres-AfA Werte für das Diagramm ─────────────────────────────────────
  const jahresAfa = Array.from({ length: nd - 1 }, () => afaBetrag);
  jahresAfa.push(letzteAfa);                 // letztes Jahr: 1 € weniger

  // ── Restbuchwerte berechnen ───────────────────────────────────────────────
  const restbuchwerte = [];
  let rbw = ak;
  for (let i = 0; i < nd; i++) {
    rbw -= jahresAfa[i];
    restbuchwerte.push(rbw);
  }

  // ── Jahres-Labels ───────────────────────
  const jahrLabels = Array.from({ length: nd }, (_, i) => `Jahr ${i + 1}`);

  // ── Diagramm ──────────────────────────────────────────────────────────────
  const chartWrapper = document.getElementById('afaChartWrapper');
  const chartHeader  = document.getElementById('afaChartHeader');
  const chartInner   = document.getElementById('afaChartInner');

  chartWrapper.style.display = 'block';
  chartHeader.innerHTML = `<h2>Diagramm</h2>`;
  chartInner.innerHTML  = '';

  const chartId  = `afa-chart-${Date.now()}`;
  const chartDiv = document.createElement('div');
  chartDiv.id    = chartId;
  chartInner.appendChild(chartDiv);

  // Y-Achse: Werte in Tausend anzeigen
  const yFormatter = v => {
    if (v === 0) return '0 €';
    if (v >= 1000) return (v / 1000).toLocaleString('de-DE', { maximumFractionDigits: 0 }) + ' Tsd. €';
    return v.toLocaleString('de-DE') + ' €';
  };

  // Datenlabels IN den Säulen: nur wenn genug Platz (nd ≤ 8 und Segmenthöhe ≥ 8% der AK)
  const minSegmentFuerLabel = ak * 0.08;
  const showDataLabels      = nd <= 8;

  const chartOptions = {
    chart: {
      type: 'bar',
      height: nd <= 6 ? 340 : nd <= 12 ? 400 : 460,
      stacked: true,
      toolbar: { show: true, tools: { download: true, zoom: false, pan: false, reset: false } },
    },
    series: [
      { name: 'Restbuchwert', data: restbuchwerte, color: '#42A5F5' },
        { name: 'Abschreibungsbetrag',              data: jahresAfa,    color: '#EF5350' },
    ],
    xaxis: {
      categories: jahrLabels,
      title: {
        text: 'Nutzungsjahr',
        style: { fontSize: '14px', fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 600, color: '#263238' }
      },
      labels: {
        style: { fontSize: '12px', fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 500, colors: '#333' },
        rotate: nd > 10 ? -45 : 0,
      }
    },
    yaxis: {
      title: {
        text: 'Betrag in Tsd. €',
        style: { fontSize: '14px', fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 600, color: '#263238' }
      },
      min: 0,
      max: ak,
      tickAmount: 6,
      labels: {
        style: { fontSize: '12px', fontFamily: 'Helvetica, Arial, sans-serif' },
        formatter: yFormatter,
      }
    },
    plotOptions: {
      bar: {
        borderRadius: nd <= 8 ? 3 : 1,
        columnWidth: nd <= 5 ? '40%' : nd <= 10 ? '55%' : '72%',
      }
    },
    legend: {
      position: 'top',
      fontFamily: 'Helvetica, Arial, sans-serif',
      fontSize: '13px',
      markers: { radius: 3 },
    },
    dataLabels: {
      enabled: showDataLabels,
      formatter: function(v) {
        // Vollständiger Betrag – nur anzeigen wenn Segment groß genug
        if (v < minSegmentFuerLabel) return '';
        return '';
      },
      style: {
        fontSize: '11px',
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontWeight: 600,
        colors: ['#fff'],
      },
    },
    tooltip: {
      y: { formatter: v => formatEuro(v) },
      shared: true,
      intersect: false,
    },
    annotations: {
      yaxis: [{
        y: ak,
        borderColor: '#1565C0',
        strokeDashArray: 5,
        label: {
          text: `AK: ${formatEuro(ak)}`,
          style: {
            background: '#1565C0', color: '#fff', fontSize: '12px',
            padding: { top: 3, bottom: 3, left: 6, right: 6 }
          }
        }
      }]
    },
    grid: {
      padding: { right: 30, left: 10 },
      borderColor: '#e5e7eb',
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    },
    title: {
      text: `Lineare Abschreibung bei ${kunde} – ${anlage.icon} ${anlage.bezeichnung}`,
      align: 'left',
      style: { fontSize: '18px', fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 600, color: '#444' }
    },
  };

  // Legende unterhalb des Diagramms mit exakten Beträgen
  const legendeDiv = document.createElement('div');
  legendeDiv.style.cssText = `
    padding: 6px 20px 14px;
    font-size: 12.5px;
    color: #555;
    font-family: Helvetica, Arial, sans-serif;
    border-top: 1px solid #eee;
    margin-top: 4px;
  `;
  legendeDiv.innerHTML = `
    <strong>Kennzahlen:</strong>&nbsp;
    Anschaffungskosten: <strong>${formatEuro(ak)}</strong> &nbsp;|&nbsp;
    Jahres-AfA: <strong>${formatEuro(afaBetrag)}</strong> (gleichbleibend, alle ${nd} Jahre) &nbsp;|&nbsp;
    Restbuchwert nach Jahr&nbsp;${nd}: <strong>1,00&nbsp;€</strong> (Erinnerungswert) &nbsp;|&nbsp;
    Genaue Werte: Tooltip beim Hovern über die Säulen.
  `;

  setTimeout(() => {
    const chart = new ApexCharts(document.getElementById(chartId), chartOptions);
    chart.render();
    renderedCharts.push(chart);
    // Legende nach Render einfügen
    const wrapper = document.getElementById('afaChartInner');
    if (wrapper) wrapper.appendChild(legendeDiv);
  }, 50);


  // ── Aufgaben & Lösungen ───────────────────────────────────────────────────
  const container = document.getElementById('Container');
  const buttonColumn = document.getElementById('button-column');
   
  if (!container || !buttonColumn) {
    console.error("Container oder Button-Column nicht gefunden");
    return;
  }

  const aufgaben = erstelleAufgabenSet(anlage, ak, nd, afaBetrag);

  container.innerHTML = '';
  buttonColumn.innerHTML = '';

  // Aufgaben anzeigen
  const aufgabenSection = document.createElement('div');
  aufgabenSection.className = 'aufgaben-section';
  aufgabenSection.innerHTML = `
    <h2>Aufgaben</h2>
    <ol>${aufgaben.map(a => `<li>${a.text}</li>`).join('')}</ol>
  `;
  container.appendChild(aufgabenSection);

  // Lösungen anzeigen
  const loesungDiv = document.createElement('div');
  loesungDiv.className = 'loesung-section';
  let html = '<h2>Lösung</h2>';
  aufgaben.forEach((a, i) => {
    html += `<div style="background: #fff; border: 1px solid #dde3ea; border-radius: 8px; padding: 14px 18px; margin-bottom: 12px; font-size: 16px; line-height: 1.7;">
               <strong>Aufgabe ${i + 1}:</strong><br>${a.loesung}
             </div>`;
  });
  loesungDiv.innerHTML = html;
  container.appendChild(loesungDiv);

  // === BELEG-BUTTONS – nur bei Aufgabe 7 und 8 ===
  for (let i = 1; i <= aufgaben.length; i++) {
    const buttonDiv = document.createElement('div');
    buttonDiv.style.margin = '12px 0';

    if (i === 7) {
      // Aufgabe 7 → Rechnung mit passendem Lieferanten (Fuhrpark oder Maschinen)
      const lieferant = getZufaelligerLieferantFuerAnlage(katKey);
      const rechnungURL = erstelleRechnungURL(anlage, ak, nd, lieferant);

      buttonDiv.innerHTML = `
        <button
          class="geschaeftsfall-beleg-button"
          onclick="window.open('${rechnungURL}', '_blank')"
          title="Rechnung für Aufgabe 8 erstellen"
          style="width:100%; padding:10px 12px; font-size:14px; margin-bottom:8px;"
        >
          📄 8. Rechnung erstellen
        </button>
      `;
    } 
    else if (i === 8) {
      // Aufgabe 8 → nur Anlagenkarte
      const anlagenkarteURL = erstelleAnlagenkarteURL(anlage, ak, nd);

      buttonDiv.innerHTML = `
        <button
          class="geschaeftsfall-beleg-button"
          onclick="window.open('${anlagenkarteURL}', '_blank')"
          title="Anlagenkarte für Aufgabe 9 erstellen"
          style="width:100%; padding:10px 12px; font-size:14px; margin-bottom:8px;"
        >
          🗂️ 9. Anlagenkarte erstellen
        </button>
      `;
    }

    buttonColumn.appendChild(buttonDiv);
  }

  // KI-Prompt aktualisieren
  const vorschau = document.getElementById('kiPromptVorschau');
  if (vorschau && vorschau.style.display !== 'none') {
    vorschau.textContent = erstelleKiPromptTextAfa(anlage, ak, nd, afaBetrag, aufgaben);
  }

  letzteAfaAufgabe = { anlage, ak, nd, afaBetrag, aufgaben };
}

// ============================================================================
// ZUFÄLLIGER LIEFERANT JE NACH ANLAGENKATEGORIE (MA oder FP)
// ============================================================================
function getZufaelligerLieferantFuerAnlage(katKey) {
  if (!yamlData || yamlData.length === 0) {
    return katKey === 'fuhrpark' ? "AutoLux GmbH" : "Maschinenbau Schmidt AG";
  }

  const gewuenschteBranche = (katKey === 'fuhrpark') ? 'Fuhrpark' : 'Maschinen';

  // Filtere Unternehmen, deren Branche exakt oder teilweise passt
  let passendeUnternehmen = yamlData.filter(company => {
    const branche = company.unternehmen?.branche || '';
    return branche.includes(gewuenschteBranche);
  });

  // Falls keine passende Branche gefunden → Fallback auf alle Unternehmen
  if (passendeUnternehmen.length === 0) {
    passendeUnternehmen = yamlData;
  }

  const ausgewaehlt = pick(passendeUnternehmen);
  return ausgewaehlt.unternehmen?.name || "Unbekannter Lieferant";
}

// ============================================================================
// BELEG-URLS FÜR ABSCHREIBUNGS-BUCHUNGSSÄTZE
// ============================================================================

function erstelleRechnungURL(anlage, ak, nd, lieferant) {
  const now = new Date();
  const tag   = now.getDate().toString().padStart(2, '0');
  const monat = (now.getMonth() + 1).toString().padStart(2, '0');
  const jahr  = now.getFullYear().toString();

  const kaufVorst  = Math.round(ak * 0.19 * 100) / 100;
  const brutto     = ak + kaufVorst;

  const params = new URLSearchParams();
  params.set('beleg', 'rechnung');
  params.set('artikel1', anlage.bezeichnung);
  params.set('menge1', '1');
  params.set('einheit1', '');
  params.set('einzelpreis1', ak.toString().replace('.', ','));
  params.set('umsatzsteuer', '19');
  params.set('tag', tag);
  params.set('monat', "01");
  params.set('jahr', jahr);
  params.set('zahlungsziel', '30');
  params.set('skonto', '2');
  params.set('skontofrist', '20');

  // NEU: Lieferant aus YAML übergeben
  if (lieferant) {
    params.set('lieferer', lieferant);
  }

  return `belege.html?${params.toString()}`;
}

function erstelleAnlagenkarteURL(anlage, ak, nd) {
  const now = new Date();
  const tag   = now.getDate().toString().padStart(2, '0');
  const monat = (now.getMonth() + 1).toString().padStart(2, '0');
  const jahr  = now.getFullYear().toString();

  const params = new URLSearchParams();
  params.set('beleg', 'anlagenkarte');
  params.set('bezeichnung', anlage.bezeichnung);
  params.set('anlagenkonto', anlage.kontoHaben);
  params.set('anschaffungskosten', ak.toString().replace('.', ','));
  params.set('nutzungsdauer', nd.toString());
  params.set('tag', tag);
  params.set('monat', "01");
  params.set('jahr', jahr);

  return `belege.html?${params.toString()}`;
}

function erstelleAfaBelegButtons(nummer, anlage, ak, nd) {
  const rechnungURL     = erstelleRechnungURL(anlage, ak, nd);
  const anlagenkarteURL = erstelleAnlagenkarteURL(anlage, ak, nd);

  return `
    <div style="margin: 12px 0;">
      <button
        class="geschaeftsfall-beleg-button"
        onclick="window.open('${rechnungURL}', '_blank')"
        title="Rechnung (Kauf) für Aufgabe ${nummer} erstellen"
        style="width: 100%; padding: 10px 12px; font-size: 14px; margin-bottom: 8px; background:#1976D2; color:white; border:none; border-radius:6px;"
      >
        📄 ${nummer}. Rechnung (Kauf) erstellen
      </button>
      
      <button
        class="geschaeftsfall-beleg-button"
        onclick="window.open('${anlagenkarteURL}', '_blank')"
        title="Anlagenkarte für Aufgabe ${nummer} erstellen"
        style="width: 100%; padding: 10px 12px; font-size: 14px; background:#388E3C; color:white; border:none; border-radius:6px;"
      >
        🗂️ ${nummer}. Anlagenkarte erstellen
      </button>
    </div>
  `;
}

// ============================================================================
// KI-ASSISTENT PROMPT
// ============================================================================

const KI_BASE_PROMPT = `
Du bist ein freundlicher BwR-Assistent für Schülerinnen und Schüler der Realschule (Bayern, Klasse 9/10). Du hilfst beim Thema **lineare Abschreibung von Sachanlagen**.

## Deine Rolle
- Gib KEINE fertigen Lösungen, Buchungssätze oder Berechnungen vor.
- Führe die Schüler durch gezielte Fragen und Hinweise zur richtigen Lösung.
- Ziel: Lernförderung durch die Sokratische Methode – der Schüler denkt selbst.

## Pädagogischer Ansatz
1. Frage zunächst, was der Schüler aus dem Diagramm ablesen kann.
2. Frage dann, welche Formel angewendet werden soll.
3. Beantworte deine eigenen Rückfragen NICHT.
4. Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
5. Erst wenn der Schüler selbst zur richtigen Antwort gelangt, bestätige ihn.

---

## Fachwissen – Lineare Abschreibung

### Was ist lineare Abschreibung?
Bei der linearen Abschreibung wird der Anschaffungswert einer Sachanlage **gleichmäßig** auf die Nutzungsdauer verteilt.

### Formeln
- **Jahres-AfA** = (Anschaffungskosten − 1 €) ÷ Nutzungsdauer
- **Abschreibungssatz** = 100 % ÷ Nutzungsdauer
- **Restbuchwert (Ende Jahr n)** = Anschaffungskosten − n × Jahres-AfA
- Am Ende der Nutzungsdauer: Restbuchwert = **1,00 € (Erinnerungswert)**

### Anschaffungskosten umfassen
- Kaufpreis (Nettobetrag, ohne USt)
- + Anschaffungsnebenkosten (Transport, Montage, Zölle)
- − Anschaffungspreisminderungen (Rabatte, Skonti)
- Die Umsatzsteuer gehört NICHT zu den AK (wird als Vorsteuer abgezogen)

### AfA-Tabelle
AfA = **Absetzung für Abnutzung**.
Die amtliche AfA-Tabelle des Bundesfinanzministeriums legt die betriebsgewöhnliche Nutzungsdauer fest.

### Erinnerungswert
Nach vollständiger Abschreibung verbleibt ein **symbolischer Restwert von 1,00 €**, damit die Anlage im Anlagenverzeichnis sichtbar bleibt.

### Buchungssätze

**Kauf auf Ziel (Eingangsrechnung, 19 % USt):**
0700 MA (oder 0840 FP)   Nettobetrag (= AK)
2600 VORST               Vorsteuerbetrag    an    4400 VE    Bruttobetrag

**Jährliche Abschreibung (Jahres-AfA):**
6520 ABSA    Jahres-AfA-Betrag    an    0700 MA (oder 0840 FP)    Jahres-AfA-Betrag
(ABSA = Abschreibungen auf Sachanlagen)


## Tonalität
- Freundlich, ermutigend, auf Augenhöhe mit Realschülerinnen und -schülern
- Einfache Sprache, kurze Antworten (max. 2–3 Sätze pro Nachricht)
- Gelegentlich Emojis 📊📉💡🔢✅

## Was du NICHT tust
- Den fertigen Buchungssatz oder Rechenwege nennen, bevor der Schüler darauf gekommen ist
- Lösungen auf direkte Anfrage liefern

## Abschluss
Wenn der Schüler eine Aufgabe vollständig gelöst hat:
- Bestätige die Lösung.
- Weise auf Formfehler hin (Tausenderpunkt, € mit zwei Nachkommastellen, Großschreibung der Konten gemäß DIN 5008).
- Frage: „Möchtest du eine weitere Aufgabe üben?"
`;

function erstelleKiPromptTextAfa(anlage, ak, nd, afaBetrag, aufgaben) {
  if (!anlage) return KI_BASE_PROMPT.replace('###AUFGABEN###', '(Noch keine Aufgabe generiert.)');

  const kaufVorst  = Math.round(ak * 0.19 * 100) / 100;
  const kaufBrutto = ak + kaufVorst;
  const f = formatEuro;

  const kontext = `Sachanlage: ${anlage.icon} ${anlage.bezeichnung}
Anschaffungskosten: ${f(ak)}  |  Nutzungsdauer: ${nd} Jahre  |  Abschreibungsbetrag: ${f(afaBetrag)}
Restbuchwert nach Jahr ${nd}: 1,00 € (Erinnerungswert)
Buchungssatz Kauf (19 % USt, auf Ziel): ${anlage.kontoHaben} ${f(ak)} / 2600 VORST ${f(kaufVorst)} an 4400 VE ${f(kaufBrutto)}
Buchungssatz AfA: 6520 ABSA ${f(afaBetrag)} an ${anlage.kontoHaben} ${f(afaBetrag)}`;

  const aufgabenText = aufgaben.map((a, i) => {
    const textKlar = a.text
      .replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').trim();
    const loesKlar = a.loesung
      .replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
    return `Aufgabe ${i + 1}: ${textKlar}\nMusterlösung ${i + 1}: ${loesKlar}`;
  }).join('\n\n');

  return KI_BASE_PROMPT.replace('###AUFGABEN###', kontext + '\n\n' + aufgabenText);
}

function kopiereKiPromptAfa() {
  let text;
  if (letzteAfaAufgabe) {
    const { anlage, ak, nd, afaBetrag, aufgaben } = letzteAfaAufgabe;
    text = erstelleKiPromptTextAfa(anlage, ak, nd, afaBetrag, aufgaben);
  } else {
    text = KI_BASE_PROMPT.replace('###AUFGABEN###', '(Noch keine Aufgabe generiert.)');
  }
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('kiPromptKopierenBtn');
    const orig = btn.innerHTML;
    btn.innerHTML = '✅ Kopiert!';
    setTimeout(() => { btn.innerHTML = orig; }, 2500);
  }).catch(() => alert('Kopieren nicht möglich. Bitte manuell aus dem Textfeld kopieren.'));
}

function toggleKiPromptVorschauAfa() {
  const vorschau = document.getElementById('kiPromptVorschau');
  const btn      = document.getElementById('kiPromptToggleBtn');
  const isHidden = getComputedStyle(vorschau).display === 'none';
  if (isHidden) {
    let text;
    if (letzteAfaAufgabe) {
      const { anlage, ak, nd, afaBetrag, aufgaben } = letzteAfaAufgabe;
      text = erstelleKiPromptTextAfa(anlage, ak, nd, afaBetrag, aufgaben);
    } else {
      text = KI_BASE_PROMPT.replace('###AUFGABEN###', '(Noch keine Aufgabe generiert.)');
    }
    vorschau.textContent  = text;
    vorschau.style.display = 'block';
    btn.textContent = 'Vorschau ausblenden ▲';
  } else {
    vorschau.style.display = 'none';
    btn.textContent = 'Prompt anzeigen ▼';
  }
}

function autoSelectMyCompany() {
  const myCompanyName = localStorage.getItem('myCompany');
  
  if (!myCompanyName) return;
  
  const dropdowns = document.querySelectorAll('select.meinUnternehmen');
  
  dropdowns.forEach(dropdown => {
    const options = Array.from(dropdown.options);
    const matchingOption = options.find(opt => opt.value === myCompanyName);
    
    if (matchingOption) {
      dropdown.value = myCompanyName;
      
      const event = new Event('change', { bubbles: true });
      dropdown.dispatchEvent(event);
      
      console.log(`"${myCompanyName}" automatisch in Dropdown ausgewählt`);
    }
  });
}


// ============================================================================
// INITIALISIERUNG
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
const kundeSelect = document.getElementById('marketingKunde');
  
  if (kundeSelect && kundeSelect.value) {
    kunde = kundeSelect.value.trim();
  }
  
  kundeSelect.addEventListener('change', () => {
    kunde = kundeSelect.value.trim() || '';
    console.log('Kunde geändert:', kunde);
  });
  
  if (!loadYamlFromLocalStorage()) {
    loadDefaultYaml();
  }
  
  if (yamlData && yamlData.length > 0) {
    fillCompanyDropdowns();
  } else {
    document.addEventListener('yamlDataLoaded', fillCompanyDropdowns, { once: true });
  }
  setTimeout(function() {
    autoSelectMyCompany();
  }, 250);
  const vorschauEl = document.getElementById('kiPromptVorschau');
  if (vorschauEl) vorschauEl.textContent = KI_BASE_PROMPT.replace('###AUFGABEN###', '(Noch keine Aufgabe generiert.)');
  setTimeout(zeigeZufaelligeAbschreibungsAufgabe, 300);
});