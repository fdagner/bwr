let kunde = '<i>[Modellunternehmen]</i>';

// ============================================================================
// KONTEN – ZENTRAL AUS DEM KONTENPLAN (js/utils.js)
// ============================================================================
// Nur Kontonummern angeben – Abkürzung und Label liefert kontoLabel().
// Bei Änderungen nur KONTENPLAN in utils.js anpassen.
const KONTO_BANK     = kontoLabel('2800');   // Bank
const KONTO_DARLEHEN = kontoLabel('4250');   // Langfristige Bankverbindlichkeiten
const KONTO_ZINS     = kontoLabel('7510');   // Zinsaufwendungen

// ============================================================================
// YAML / UNTERNEHMEN
// ============================================================================




function fillCompanyDropdowns() {
  if (!yamlData || yamlData.length === 0) return;
  const sel = document.getElementById('marketingKunde');
  if (!sel) return;
  const sorted = [...yamlData].sort((a, b) => {
    const ba = a.unternehmen?.branche || '', bb = b.unternehmen?.branche || '';
    if (ba !== bb) return ba.localeCompare(bb);
    return (a.unternehmen?.name || '').localeCompare(b.unternehmen?.name || '');
  });
  sel.innerHTML = '';
  const opt = document.createElement('option');
  opt.value = ''; opt.text = '— bitte Unternehmen auswählen —'; opt.disabled = true; opt.selected = true;
  sel.appendChild(opt);
  sorted.forEach(c => {
    const u = c.unternehmen;
    if (!u?.name) return;
    const o = document.createElement('option');
    o.value = u.name;
    o.textContent = (u.branche ? `${u.branche} – ` : '') + `${u.name} ${u.rechtsform || ''}`.trim();
    sel.appendChild(o);
  });
}
function autoSelectMyCompany() {
  const my = localStorage.getItem('myCompany');
  if (!my) return;
  document.querySelectorAll('select.meinUnternehmen').forEach(dd => {
    const m = Array.from(dd.options).find(o => o.value === my);
    if (m) { dd.value = my; dd.dispatchEvent(new Event('change', { bubbles: true })); }
  });
}

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================

function r2(x) { return Math.round(x * 100) / 100; }
function formatEuro(v) { return v.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }); }
function formatProzent(p) { return p.toLocaleString('de-DE', { maximumFractionDigits: 2 }) + '&nbsp;%'; }

const ARTEN = {
  fest:      { name: 'Festdarlehen',        icon: '📌' },
  abzahlung: { name: 'Abzahlungsdarlehen',  icon: '📉' },
  annuitaet: { name: 'Annuitätendarlehen',  icon: '⚖️' },
};

// ============================================================================
// TILGUNGSPLAN BERECHNEN
// ============================================================================
function berechnePlan(art, K, n, p) {
  const q = p / 100;
  if (art === 'annuitaet') {
    // Rechnung ohne Zwischenrundung (wie Excel/PMT); Anzeige auf Cent gerundet
    const A = q === 0 ? K / n : K * q * Math.pow(1 + q, n) / (Math.pow(1 + q, n) - 1);
    const rowsA = [];
    let restA = K, gz = 0;
    for (let j = 1; j <= n; j++) {
      const z = restA * q, t = A - z;
      rowsA.push({ j, anfang: r2(restA), zins: r2(z), tilgung: r2(t), sd: r2(A), ende: r2(restA - t) });
      gz += z; restA -= t;
    }
    return { rows: rowsA, annuitaet: r2(A), gesamtZins: r2(gz), gesamtZahlung: r2(K + gz) };
  }
  let annuitaet = null;
  if (art === 'annuitaet') {
    annuitaet = q === 0 ? r2(K / n)
      : r2(K * q * Math.pow(1 + q, n) / (Math.pow(1 + q, n) - 1));
  }
  const rows = [];
  let rest = K;
  for (let j = 1; j <= n; j++) {
    const z = r2(rest * q);
    let t;
    if (j === n) t = rest;                       // letzte Rate: Restschuld
    else if (art === 'fest') t = 0;
    else if (art === 'abzahlung') t = r2(K / n);
    else t = r2(annuitaet - z);
    rows.push({ j, anfang: rest, zins: z, tilgung: t, sd: r2(z + t), ende: r2(rest - t) });
    rest = r2(rest - t);
  }
  const gesamtZins = r2(rows.reduce((s, r) => s + r.zins, 0));
  return { rows, annuitaet, gesamtZins, gesamtZahlung: r2(K + gesamtZins) };
}

// Sucht die nächstgelegene Kreditsumme (±500 €, 10-€-Schritte), bei der die letzte
// Rate exakt der Annuität entspricht (keine Rundungsdifferenz im Tilgungsplan).
function findeRundungsfreieKreditsumme(K, n, p) {
  for (let d = 0; d <= 500; d += 10) {
    for (const s of (d === 0 ? [0] : [-1, 1])) {
      const k = K + s * d;
      if (k < 1000) continue;
      const pl = berechnePlan('annuitaet', k, n, p);
      if (Math.abs(pl.rows[n - 1].sd - pl.annuitaet) < 0.005) return k;
    }
  }
  return K;   // Fallback: Rundungsdifferenz in der letzten Rate
}

// ============================================================================
// BUCHUNGSSATZ-TABELLE
// soll / haben: [[konto, betrag], ...]
// ============================================================================
function bsHtml(soll, haben) {
  const rows = Math.max(soll.length, haben.length + soll.length - 1);
  const off = soll.length - 1;
  let h = '<table style="border:1px solid #ccc; white-space:nowrap; background-color:#fff; font-family:courier; width:600px; margin:0 0 6px;">';
  for (let i = 0; i < rows; i++) {
    const s = soll[i], hb = haben[i - off];
    h += `<tr>
      <td style="min-width:160px;">${s ? s[0] : ''}</td>
      <td style="text-align:right;min-width:145px;">${s ? formatEuro(s[1]) : ''}</td>
      <td style="text-align:center;min-width:50px;">${i === off ? 'an' : ''}</td>
      <td style="min-width:120px;">${hb ? hb[0] : ''}</td>
      <td style="text-align:right;min-width:145px;">${hb ? formatEuro(hb[1]) : ''}</td>
    </tr>`;
  }
  return h + '</table>';
}

function planTabelle(plan, art) {
  const th = 'style="border:1px solid #ccc;padding:4px 8px;background:#f0f4f8;text-align:right;"';
  const td = 'style="border:1px solid #ccc;padding:4px 8px;text-align:right;"';
  const lastHeader = (art === 'annuitaet') ? 'Annuität' : 'Schuldendienst';
  let h = `<table style="border-collapse:collapse;font-size:14px;margin:6px 0;">
    <tr><th ${th}>Jahr</th><th ${th}>Restschuld Jahresanfang</th><th ${th}>Zinsen</th><th ${th}>Tilgung</th><th ${th}>${lastHeader}</th></tr>`;
  plan.rows.forEach(r => {
    h += `<tr><td ${td}>${r.j}</td><td ${td}>${formatEuro(r.anfang)}</td><td ${td}>${formatEuro(r.zins)}</td><td ${td}>${formatEuro(r.tilgung)}</td><td ${td}>${formatEuro(r.sd)}</td></tr>`;
  });
  h += `<tr><td ${td}><strong>Σ</strong></td><td ${td}></td><td ${td}><strong>${formatEuro(plan.gesamtZins)}</strong></td><td ${td}><strong>${formatEuro(plan.rows[0].anfang)}</strong></td><td ${td}><strong>${formatEuro(plan.gesamtZahlung)}</strong></td></tr></table>`;
  return h;
}
// ============================================================================
// AUFGABEN
// ============================================================================
function erstelleAufgaben(art, K, n, p, plan) {
  const r1 = plan.rows[0];
  const rl = plan.rows[n - 1];
  const f = formatEuro;
  const pz = formatProzent(p);
  const val = s => `<span class="val">${s}</span>`;

  const buchAufnahme = {
    text: `Bilde den Buchungssatz für die Aufnahme des Darlehens (Gutschrift auf dem Bankkonto).`,
    loesung: bsHtml([[KONTO_BANK, K]], [[KONTO_DARLEHEN, K]]),
    // Beleg: Bankkontoauszug mit der Gutschrift der Kreditsumme
    beleg: {
      titel: 'Kontoauszug – Darlehensaufnahme',
      monat: '01', jahrOffset: 0,
      vorgaenge: [{ bez: 'Darlehensgutschrift', wert: K }],
    },
  };

  if (art === 'fest') {
    return [
      { text: `Erkläre den Begriff „Festdarlehen“ (auch Fälligkeitsdarlehen).`,
        loesung: `Beim <strong>Festdarlehen</strong> wird die gesamte Kreditsumme am <strong>Ende der Laufzeit in einer Summe</strong> zurückgezahlt. Während der Laufzeit werden nur die <strong>Zinsen</strong> gezahlt.` },
      { text: `Erkläre, weshalb die Zinsen in jedem Jahr gleich hoch sind.`,
        loesung: `Die Restschuld bleibt bis zum Ende der Laufzeit unverändert bei ${f(K)}, da keine Tilgung erfolgt. Die Zinsen werden immer von derselben Bemessungsgrundlage berechnet und sind daher in jedem Jahr gleich.` },
      { text: `Beschreibe anhand der Tilgungstabelle und des Diagramms, wie sich Zinsen, Tilgung und Gesamtzahlung (Schuldendienst) im Laufe der Laufzeit entwickeln.`,
        loesung: `Zinsen: in jedem Jahr konstant (${f(r1.zins)}).<br>Tilgung: in den Jahren 1 bis ${n - 1} keine Tilgung, im letzten Jahr die gesamte Kreditsumme (${f(K)}).<br>Schuldendienst: in den Jahren 1 bis ${n - 1} nur Zinsen (${f(r1.zins)}), im letzten Jahr ${f(rl.sd)}.` },
      { text: `Erläutere, wie sich die Gesamtzinsen ändern, wenn die Laufzeit verlängert wird.`,
        loesung: `Bei längerer Laufzeit zahlt das Unternehmen in mehr Jahren Zinsen auf die volle Kreditsumme. Die jährlichen Zinsen bleiben gleich, die <strong>Gesamtzinsen steigen</strong> aber proportional zur Laufzeit.` },
      buchAufnahme,
      { text: `Bilde den Buchungssatz für die Zinszahlung im 1.&nbsp;Jahr per Banküberweisung.`,
        loesung: bsHtml([[KONTO_ZINS, r1.zins]], [[KONTO_BANK, r1.zins]]) + `Beim Festdarlehen wird im 1. Jahr nur Zins gezahlt, keine Tilgung.`,
        beleg: {
          titel: 'Kontoauszug – Zinszahlung 1. Jahr',
          monat: '12', jahrOffset: 0,
          vorgaenge: [{ bez: 'Zinsen Darlehen', wert: -r1.zins }],
        } },
      { text: `Bilde den Buchungssatz für den Schuldendienst im letzten Jahr (${n}.&nbsp;Jahr).`,
        loesung: bsHtml([[KONTO_DARLEHEN, rl.tilgung], [KONTO_ZINS, rl.zins]], [[KONTO_BANK, rl.sd]]),
        beleg: {
          titel: `Kontoauszug – Schuldendienst ${n}. Jahr`,
          monat: '12', jahrOffset: n - 1,
          vorgaenge: [{ bez: 'Tilgung Darlehen', wert: -rl.tilgung }, { bez: 'Zinsen Darlehen', wert: -rl.zins }],
        } },
    ];
  }

  if (art === 'abzahlung') {
    return [
      { text: `Erkläre den Begriff „Abzahlungsdarlehen“.`,
        loesung: `Beim <strong>Abzahlungsdarlehen</strong> wird die Kreditsumme in <strong>gleichbleibenden Tilgungsraten</strong> zurückgezahlt. Die Zinsen werden von der jeweiligen Restschuld berechnet. Der Schuldendienst (Zins + Tilgung) sinkt daher von Jahr zu Jahr.` },
      { text: `Erkläre anhand der Tilgungstabelle, weshalb die Zinsen von Jahr zu Jahr sinken.`,
        loesung: `Durch die Tilgung sinkt die Restschuld jedes Jahr um ${f(r1.tilgung)}. Die Zinsen werden von der Restschuld zu Jahresbeginn berechnet. Eine geringere Restschuld bedeutet geringere Zinsen: Jahr 1: ${f(r1.zins)}, Jahr ${n}: ${f(rl.zins)}.` },
      { text: `Beschreibe anhand der Tilgungstabelle und des Diagramms, wie sich Zinsen, Tilgung und Gesamtzahlung (Schuldendienst) im Laufe der Laufzeit entwickeln.`,
        loesung: `Zinsen: sinken (von ${f(r1.zins)} auf ${f(rl.zins)}).<br>Tilgung: konstant (${f(r1.tilgung)}).<br>Schuldendienst: sinkt (von ${f(r1.sd)} auf ${f(rl.sd)}), da nur die Zinsen sinken.` },
      { text: `Erläutere, wie sich der Schuldendienst ändert, wenn die Laufzeit erhöht wird.`,
        loesung: `Bei längerer Laufzeit sinkt die jährliche Tilgungsrate (Kreditsumme : Laufzeit), der jährliche Schuldendienst wird geringer. Da die Restschuld aber langsamer sinkt, fallen insgesamt <strong>mehr Zinsen</strong> an.` },
      buchAufnahme,
      { text: `Bilde den Buchungssatz für den Schuldendienst (Tilgung und Zinsen) im 1.&nbsp;Jahr per Banküberweisung.`,
        loesung: bsHtml([[KONTO_DARLEHEN, r1.tilgung], [KONTO_ZINS, r1.zins]], [[KONTO_BANK, r1.sd]]) + `Zinsen 1. Jahr: ${f(K)} · ${pz} = ${f(r1.zins)}`,
        beleg: {
          titel: 'Kontoauszug – Schuldendienst 1. Jahr',
          monat: '12', jahrOffset: 0,
          vorgaenge: [{ bez: 'Tilgung Darlehen', wert: -r1.tilgung }, { bez: 'Zinsen Darlehen', wert: -r1.zins }],
        } },
      { text: `Unterscheide Abzahlungsdarlehen und Annuitätendarlehen.`,
        loesung: `<strong>Abzahlungsdarlehen:</strong> Tilgung konstant, Zinsen sinken, Schuldendienst sinkt.<br><strong>Annuitätendarlehen:</strong> Schuldendienst (Annuität) konstant, Zinsen sinken, Tilgung steigt.` },
    ];
  }

  // Annuitätendarlehen
  return [
    { text: `Erkläre den Begriff „Annuitätendarlehen“.`,
      loesung: `Beim <strong>Annuitätendarlehen</strong> zahlt der Kreditnehmer jedes Jahr denselben Betrag (<strong>Annuität</strong> = Zinsen + Tilgung). Da die Zinsen durch die sinkende Restschuld abnehmen, steigt der Tilgungsanteil.` },
    { text: `Beschreibe anhand der Tilgungstabelle und des Diagramms, wie sich Zinsen, Tilgung und Gesamtzahlung (Annuität) im Laufe der Laufzeit entwickeln.`,
      loesung: `Zinsen: sinken (von ${f(r1.zins)} auf ${f(rl.zins)}).<br>Tilgung: steigt (von ${f(r1.tilgung)} auf ${f(rl.tilgung)}).<br>Annuität: bleibt konstant (${f(r1.sd)}).` },
    { text: `Erkläre, weshalb die Tilgung von Jahr zu Jahr steigt, obwohl die Annuität gleich bleibt.`,
      loesung: `Mit jeder Tilgung sinkt die Restschuld und damit der Zinsbetrag. Die ersparten Zinsen werden bei gleichbleibender Annuität zusätzlich zur Tilgung verwendet.` },
    { text: `Erläutere, wie sich der Schuldendienst ändert, wenn die Laufzeit erhöht wird.`,
      loesung: `Bei längerer Laufzeit sinkt die jährliche Annuität, weil die Schuld auf mehr Jahre verteilt wird. Die Restschuld sinkt langsamer, daher steigen die <strong>Gesamtzinsen</strong>.` },
    buchAufnahme,
    { text: `Bilde den Buchungssatz für den Schuldendienst (Tilgung und Zinsen) im 1.&nbsp;Jahr per Banküberweisung.`,
      loesung: bsHtml([[KONTO_DARLEHEN, r1.tilgung], [KONTO_ZINS, r1.zins]], [[KONTO_BANK, r1.sd]]),
      beleg: {
        titel: 'Kontoauszug – Schuldendienst 1. Jahr',
        monat: '12', jahrOffset: 0,
        vorgaenge: [{ bez: 'Tilgung Darlehen', wert: -r1.tilgung }, { bez: 'Zinsen Darlehen', wert: -r1.zins }],
      } },
    { text: `Unterscheide Annuitätendarlehen und Abzahlungsdarlehen.`,
      loesung: `<strong>Annuitätendarlehen:</strong> Schuldendienst konstant, Tilgung steigt, Zinsen sinken.<br><strong>Abzahlungsdarlehen:</strong> Tilgung konstant, Zinsen sinken, Schuldendienst sinkt.` },
  ];
}

// ============================================================================
// HAUPTGENERATOR
// ============================================================================
let letzteDarlehensAufgabe = null;
let renderedCharts = [];
// Hochzähler pro Generierung: veraltete Chart-Exporte (async nach destroy())
// werden abgebrochen, statt "Element not found"-Fehler zu werfen
let chartGeneration = 0;


function zufallswerteSetzen() {
  document.getElementById('kreditInput').value = pick([9000, 12000, 18000, 24000, 30000, 60000]);
  document.getElementById('laufzeitInput').value = pick([3, 4, 5, 6]);
  document.getElementById('zinsInput').value = pick([2, 2.5, 3, 3.5, 4, 4.5, 5, 6]);
  zeigeDarlehensAufgabe();
}


function zeigeDarlehensAufgabe() {
  renderedCharts.forEach(c => { try { c.destroy(); } catch (e) {} });
  renderedCharts = [];
  const chartGen = ++chartGeneration;

  let art = document.getElementById('darlehenSelect').value;
  if (art === 'zufall') art = pick(Object.keys(ARTEN));

  // ===== Validierung =====
  let K = parseFloat(document.getElementById('kreditInput').value);
  let n = parseInt(document.getElementById('laufzeitInput').value);
  let p = parseFloat(document.getElementById('zinsInput').value);

  let hinweis = [];

  if (isNaN(K) || K < 1000) {
    K = 9000;
    hinweis.push('Kreditsumme wurde auf 9.000 € gesetzt.');
  }
  if (isNaN(n) || n < 2) {
    n = 3;
    hinweis.push('Laufzeit wurde auf 3 Jahre gesetzt.');
  }
  if (isNaN(p) || p < 0.5) {
    p = 3;
    hinweis.push('Zinssatz wurde auf 3 % gesetzt.');
  }

  // Grenzen erzwingen
  K = Math.min(Math.max(Math.round(K), 1000), 1000000);
  n = Math.min(Math.max(n, 2), 10);
  p = Math.min(Math.max(p, 0.5), 12);

  // Abzahlungsdarlehen: ganzzahlige Tilgungsrate
  if (art === 'abzahlung') {
    const Kneu = Math.floor(K / n) * n;
    if (Kneu !== K) {
      hinweis.push(`Kreditsumme wurde auf ${formatEuro(Kneu)} angepasst (ganzzahlige Tilgung).`);
      K = Kneu;
    }
  }

  // Rundungsfreie Kreditsumme nur bei Annuität
  const KOriginal = K;
  if (art === 'annuitaet') {
    K = findeRundungsfreieKreditsumme(K, n, p);
    if (K !== KOriginal) {
      hinweis.push(`Kreditsumme wurde von ${formatEuro(KOriginal)} auf ${formatEuro(K)} angepasst, damit die Annuität in jedem Jahr exakt gleich hoch ist.`);
    }
  }

  // Hinweis anzeigen
  const hinweisEl = document.getElementById('darlehenHinweis');
  if (hinweisEl) {
    hinweisEl.innerHTML = hinweis.length > 0
      ? `<p style="font-size:12px;color:#888;">${hinweis.join(' ')}</p>`
      : '';
  }
  // =======================

  const plan = berechnePlan(art, K, n, p);
  const info = ARTEN[art];

  // ── Diagramm ──
  const wrapper = document.getElementById('darlehenChartWrapper');
  const inner = document.getElementById('darlehenChartInner');
  wrapper.style.display = 'block';
  inner.innerHTML = '';
  const chartId = `darlehen-chart-${Date.now()}`;
  const chartDiv = document.createElement('div');
  chartDiv.id = chartId;
  inner.appendChild(chartDiv);

  const chartOptions = {
    chart: { type: 'bar', background: '#fff', animations: { enabled: false }, height: 420, stacked: true,
             toolbar: { show: true, tools: { download: true, zoom: false, pan: false, reset: false } } },
   series: [
  { name: 'Tilgung', data: plan.rows.map(r => r.tilgung), color: '#00468C' }, // dunkles Blau
  { name: 'Zinsen',  data: plan.rows.map(r => r.zins),     color: '#F5B041' }, // helles Orange
],
fill: {
  type: ['solid', 'pattern'],
  pattern: {
    style: ['', 'slantedLines'],
    width: 6,
    height: 6,
    strokeWidth: 2
  }
},
stroke: {
  show: true,
  width: 1,
  colors: ['#00468C', '#8A5A00']  // dunkle Umrandung, trennt die Flächen
},
    xaxis: {
      categories: plan.rows.map(r => `Jahr ${r.j}`),
      title: { text: 'Jahr der Laufzeit', style: { fontSize: '14px', fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 600, color: '#263238' } },
      labels: { style: { fontSize: '12px', fontFamily: 'Helvetica, Arial, sans-serif', colors: '#333' } },
    },
    yaxis: {
      title: { text: 'Schuldendienst in €', style: { fontSize: '14px', fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 600, color: '#263238' } },
      min: 0,
      labels: { style: { fontSize: '12px' }, formatter: v => v.toLocaleString('de-DE', { maximumFractionDigits: 0 }) + ' €' },
    },
    plotOptions: { bar: { borderRadius: 2, columnWidth: n <= 4 ? '45%' : '65%' } },
    legend: { position: 'top', fontFamily: 'Helvetica, Arial, sans-serif', fontSize: '13px' },
    dataLabels: { enabled: false },
    tooltip: { y: { formatter: v => formatEuro(v) }, shared: true, intersect: false },
    grid: { padding: { right: 30, left: 10 }, borderColor: '#e5e7eb', xaxis: { lines: { show: false } } },
    title: { text: `${info.name} bei ${kunde} – Kreditsumme ${formatEuro(K)}, ${n} Jahre`, align: 'left',
             style: { fontSize: '17px', fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 600, color: '#444' } },
  };

  setTimeout(async () => {
    const chart = new ApexCharts(document.getElementById(chartId), chartOptions);
    renderedCharts.push(chart);
    try {
      await chart.render();
      if (chartGen !== chartGeneration) return; // neue Generierung → Export veraltet
      const { imgURI } = await chart.dataURI({ scale: 2 });
      if (chartGen !== chartGeneration) return;
      // PNG in den ROH-Container schreiben und dann den Jodit-Editor
      // synchronisieren (Muster aus lb8-2-bestellmenge). Ein direkter Insert
      // in den Editor-Layer wird von der Jodit-Synchronisierung mit dem
      // (bildlosen) Roh-Container-Stand überschrieben → Diagramm verschwände.
      const cont = document.getElementById('Container');
      const platz = (cont && cont.querySelector('#darlehenImg-' + chartId)) ||
                    document.getElementById('darlehenImg-' + chartId);
      if (platz && imgURI) {
        platz.innerHTML = `<p><img src="${imgURI}" alt="Diagramm zum ${info.name}" style="max-width:90%;height:auto;"></p>`;
        // Editor sofort auf den neuen Stand bringen, damit die Jodit-Sync-Logik
        // (MutationObserver, 300 ms) das Diagramm nicht wieder herauslöst
        if (window.JoditEditor && cont && cont._jodit && cont._jodit.editor && cont._jodit.editor.isConnected) {
          try {
            cont._jodit.value = cont.innerHTML;
            cont._joditSrc = cont.innerHTML;
          } catch (e) { console.warn('Editor-Sync nach Diagramm-Export fehlgeschlagen', e); }
        }
      }
    } catch (e) {
      if (chartGen === chartGeneration) console.warn('Diagramm-Export übersprungen:', e);
    }
  }, 50);

  // ── Aufgaben & Lösungen ──
  const container = document.getElementById('Container');
  const buttonColumn = document.getElementById('button-column');
  if (!container || !buttonColumn) return;
  buttonColumn.innerHTML = '';

  const aufgaben = erstelleAufgaben(art, K, n, p, plan);
  const zinsText = formatProzent(p);

  const aufgabenHtml = `
    <div class="aufgaben-section">
      <h2>Aufgaben</h2>
      <p>${kunde} nimmt zu Jahresbeginn ein <strong>${info.name}</strong> über ${formatEuro(K)} mit einer Laufzeit von ${n} Jahren und einem Zinssatz von ${zinsText} auf. Die Tilgungstabelle und das Diagramm zeigen den jährlichen Schuldendienst.</p>
      
      <h3 style="margin:16px 0 8px;">Tilgungsplan</h3>
      ${planTabelle(plan, art)}
      
      <h3 style="margin:16px 0 8px;">Diagramm</h3>
      <div id="darlehenImg-${chartId}"></div>
      
      <ol>${aufgaben.map(a => `<li>${a.text}</li>`).join('')}</ol>
    </div>`;

  let loesungHtml = '<h2 class="loesung">Lösung</h2>';
  aufgaben.forEach((a, i) => {
    loesungHtml += `<div style="background:#fff; border:1px solid #dde3ea; border-radius:8px; padding:14px 18px; margin-bottom:12px; font-size:16px; line-height:1.7;">
      <strong>Aufgabe ${i + 1}:</strong><br>${a.loesung}</div>`;
  });

  const gesamtHtml = aufgabenHtml + `<div class="loesung-section">${loesungHtml}</div>`;

  // Ausgabe: läuft schon ein Editor, über JoditEditor.setContent schreiben,
  // damit Editor-Wert und Quelle synchron bleiben.
  if (window.JoditEditor && container._jodit) {
    window.JoditEditor.setContent(container, gesamtHtml);
  } else {
    container.innerHTML = gesamtHtml;
  }

  // Aufgabe steht: Editor (Jodit) aktivieren – einmalig. data-jodit-init erlaubt
  // den Adopt auch auf ApexCharts-Seiten (Diagramm-PNG im Container) –
  // Muster aus lb8-2-bestellmenge / lb10-4-gewinnschwelle.
  if (window.JoditEditor && !container._jodit) {
    container.setAttribute('data-jodit-init', '1');
    try { window.JoditEditor.init(container); } catch (e) { console.warn('Editor-Init fehlgeschlagen', e); }
  }

  letzteDarlehensAufgabe = { art, K, n, p, plan, aufgaben };
  renderBelegButtonsDarlehen();
  const vorschau = document.getElementById('kiPromptVorschau');
  if (vorschau && vorschau.style.display !== 'none') vorschau.textContent = erstelleKiPromptTextDarlehen();
}

// ============================================================================
// BELEG-BUTTONS (Kontoauszüge der Bank für Aufgaben mit Buchungssatz)
// ============================================================================
// Für jede Aufgabe, die einen Buchungssatz verlangt, wird ein Button angelegt,
// der die zugehörige Gutschrift-/Überweisung auf einem Bankkontoauszug
// (belege.html, beleg=kontoauszug) zeigt. Die Wertstellungen (plus Gutschrift /
// minus Abbuchung) entsprechen exakt den Buchungsbeträgen der Lösung.

function renderBelegButtonsDarlehen() {
  const col = document.getElementById('button-column');
  if (!col || !letzteDarlehensAufgabe) return;
  col.innerHTML = '';

  const jahr = new Date().getFullYear();

  letzteDarlehensAufgabe.aufgaben.forEach(a => {
    if (!a || !a.beleg) return;   // nur Buchungssatz-Aufgaben bekommen einen Beleg
    const info = a.beleg;

    const params = new URLSearchParams();
    params.set('beleg', 'kontoauszug');
    info.vorgaenge.forEach((v, k) => {
      params.set(`vorgang${k + 1}`, v.bez);       // z. B. „Darlehensgutschrift“
      params.set(`wertstellung${k + 1}`, String(Math.round(v.wert * 100) / 100));
    });
    params.set('nummer', String(1 + Math.floor(Math.random() * 24)));
    params.set('tag', String(1 + Math.floor(Math.random() * 28)).padStart(2, '0'));
    params.set('monat', info.monat || '12');
    params.set('jahr', String(jahr + (info.jahrOffset || 0)));
    // Plausibler alter Kontostand: übersteigt die Abbuchungen (Schuldendienst)
    // und liegt sonst in einem typischen Rahmen für ein Bankkonto
    const ausgaben = info.vorgaenge.filter(v => v.wert < 0).reduce((s, v) => s - v.wert, 0);
    const altSaldo = ausgaben + Math.round((5000 + Math.random() * 130000) / 500) * 500;
    params.set('kontostand_alt', String(Math.round(altSaldo * 100) / 100));
    // Kontoinhaber = gewähltes Modellunternehmen (nur bei echtem Namen)
    if (kunde && !/^</.test(kunde)) params.set('kontoinhaber', kunde);
    const bankURL = `belege.html?${params.toString()}`;

    const wrap = document.createElement('div');
    wrap.style.margin = '12px 0';
    wrap.innerHTML = `
      <button class="geschaeftsfall-beleg-button"
        onclick="window.open('${bankURL}','_blank')"
        style="width:100%; padding:10px 12px; font-size:14px;">
        🏦 ${info.titel}
      </button>`;
    col.appendChild(wrap);
  });
}

// ============================================================================
// KI-ASSISTENT PROMPT
// ============================================================================
const KI_BASE_PROMPT = `
Du bist ein freundlicher BwR-Assistent für Schülerinnen und Schüler der Realschule (Bayern, Klasse 9). Du hilfst beim Thema **Darlehen: Festdarlehen, Abzahlungsdarlehen und Annuitätendarlehen**.

## Deine Rolle
- Gib KEINE fertigen Lösungen, Buchungssätze oder Berechnungen vor.
- Führe die Schüler mit gezielten Fragen und Hinweisen zur Lösung (Sokratische Methode).
- Beantworte deine eigenen Rückfragen NICHT. Bestätige erst, wenn der Schüler selbst richtig liegt.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.

## Fachwissen
- **Festdarlehen:** Rückzahlung der gesamten Kreditsumme am Ende der Laufzeit; bis dahin nur Zinsen (konstant).
- **Abzahlungsdarlehen:** konstante Tilgungsrate (Kreditsumme ÷ Laufzeit); Zinsen auf die Restschuld sinken; Schuldendienst sinkt.
- **Annuitätendarlehen:** konstante Annuität (Zins + Tilgung); Zinsen sinken, Tilgung steigt.
- Zinsen = Restschuld zu Jahresbeginn × Zinssatz.
- Längere Laufzeit: geringerer jährlicher Schuldendienst, aber höhere Gesamtzinsen.

## Buchungssätze
Kreditaufnahme: ${KONTO_BANK} an ${KONTO_DARLEHEN}
Schuldendienst (Abzahl./Annuität): ${KONTO_DARLEHEN} (Tilgung) + ${KONTO_ZINS} (Zinsen) an ${KONTO_BANK} (Summe)
Festdarlehen vor Fälligkeit: nur ${KONTO_ZINS} an ${KONTO_BANK}

## Tonalität
Freundlich, ermutigend, einfache Sprache, max. 2–3 Sätze pro Nachricht, gelegentlich Emojis 🏦📉💡✅

## Abschluss
Bei gelöster Aufgabe: bestätigen, auf Formfehler hinweisen (Tausenderpunkt, € mit zwei Nachkommastellen, Großschreibung der Konten) und fragen: „Möchtest du eine weitere Aufgabe üben?“

###AUFGABEN###
`;

function klartext(s) {
  return s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

function erstelleKiPromptTextDarlehen() {
  if (!letzteDarlehensAufgabe) return KI_BASE_PROMPT.replace('###AUFGABEN###', '(Noch keine Aufgabe generiert.)');
  const { art, K, n, p, plan, aufgaben } = letzteDarlehensAufgabe;
  const kontext = `Darlehensart: ${ARTEN[art].name}\nKreditsumme: ${formatEuro(K)} | Laufzeit: ${n} Jahre | Zinssatz: ${p} %\nGesamtzinsen: ${formatEuro(plan.gesamtZins)}`;
  const txt = aufgaben.map((a, i) => `Aufgabe ${i + 1}: ${klartext(a.text)}\nMusterlösung ${i + 1}: ${klartext(a.loesung)}`).join('\n\n');
  return KI_BASE_PROMPT.replace('###AUFGABEN###', kontext + '\n\n' + txt);
}

function kopiereKiPromptDarlehen() {
  navigator.clipboard.writeText(erstelleKiPromptTextDarlehen()).then(() => {
    const btn = document.getElementById('kiPromptKopierenBtn');
    const orig = btn.innerHTML;
    btn.innerHTML = '✅ Kopiert!';
    setTimeout(() => { btn.innerHTML = orig; }, 2500);
  }).catch(() => {
    console.error('Fehler beim Kopieren');
    zeigeModal('Kopieren nicht möglich. Bitte manuell aus dem Textfeld kopieren.', 'Kopieren');
  });
}

function toggleKiPromptVorschauDarlehen() {
  const v = document.getElementById('kiPromptVorschau');
  const btn = document.getElementById('kiPromptToggleBtn');
  if (getComputedStyle(v).display === 'none') {
    v.textContent = erstelleKiPromptTextDarlehen();
    v.style.display = 'block';
    btn.textContent = 'Vorschau ausblenden ▲';
  } else {
    v.style.display = 'none';
    btn.textContent = 'Prompt anzeigen ▼';
  }
}

// ============================================================================
// INITIALISIERUNG
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  const kundeSelect = document.getElementById('marketingKunde');
  if (kundeSelect) {
    kundeSelect.addEventListener('change', () => { kunde = kundeSelect.value.trim() || '<i>[Modellunternehmen]</i>'; });
  }
  // Dropdown befüllen → "Modellunternehmen" wählen → Aufgabe rendern,
  // sobald die YAML-Daten tatsächlich geladen sind
  if (yamlData && yamlData.length > 0) {
    fillCompanyDropdowns();
    autoSelectMyCompany();
    zeigeDarlehensAufgabe();
  } else {
    document.addEventListener('yamlDataLoaded', () => {
      fillCompanyDropdowns();
      autoSelectMyCompany();
      zeigeDarlehensAufgabe();
    }, { once: true });
  }

  const vorschauEl = document.getElementById('kiPromptVorschau');
  if (vorschauEl) vorschauEl.textContent = KI_BASE_PROMPT.replace('###AUFGABEN###', '(Noch keine Aufgabe generiert.)');
});