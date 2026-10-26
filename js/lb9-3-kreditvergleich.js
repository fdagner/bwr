// ============================================================================
// GLOBALE VARIABLEN
// ============================================================================
let yamlData = [];
let kunde = '<i>[Modellunternehmen]</i>';
let letzteGenerierteGfListeEinkauf = []; // Name aus der Vorlage beibehalten (Kompatibilität mit download.js)

// ============================================================================
// INLINE-STYLE-KONSTANTEN (für HTML-Export – kein externes CSS nötig)
// ============================================================================
const S = {
  kartenGrid: 'display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:14px 0 20px;',
  karte: 'border:2px solid #e625cc;border-radius:8px;padding:16px 18px;background-color: #f7e5f7;font-size:0.93em;font-family:inherit;',
  karteAufgabe: 'border:2px solid #1565c0;border-radius:8px;padding:16px 18px;background:#f0f4ff;font-size:0.93em;font-family:inherit;',
  karteGuenstig: 'border:2px solid #2e7d32;border-radius:8px;padding:16px 18px;background:#f1f8f1;font-size:0.93em;font-family:inherit;',
  karteTitel: 'font-weight:700;font-size:1.05em;margin-bottom:10px;color:#1a237e;display:flex;align-items:center;gap:8px;flex-wrap:wrap;',
  badgeGuenstig: 'font-size:0.72em;padding:2px 8px;border-radius:10px;font-weight:600;background:#2e7d32;color:#fff;',
  kalkTable: 'width:100%;border-collapse:collapse;font-size:0.91em;margin-bottom:10px;',
  kalkErgebnisTd: 'padding:2px 4px;font-weight:700;border-top:1px solid #bbb;',
  kalkErgebnisTdR: 'padding:2px 4px;text-align:right;font-family:Courier New,monospace;white-space:nowrap;min-width:90px;font-weight:700;border-top:1px solid #bbb;',
  kalkNormalTd: 'padding:2px 4px;',
  kalkNormalTdR: 'padding:2px 4px;text-align:right;font-family:Courier New,monospace;white-space:nowrap;min-width:90px;',
  fazit: 'margin-top:16px;padding:12px 16px;background:#fff8e1;border-left:4px solid #f9a825;border-radius:0 6px 6px 0;font-size:0.93em;line-height:1.7;',
  fazitViolett: 'margin-top:8px;padding:12px 16px;background:#f9f0ff;border-left:4px solid #7b1fa2;border-radius:0 6px 6px 0;font-size:0.93em;line-height:1.7;',
  aufgabeBox: 'background:#fff;border:1px solid #ddd;border-radius:6px;padding:14px 18px;margin-bottom:16px;line-height:1.7;',
  aufgabeOl: 'margin:6px 0 0 18px;padding:0;',
  aufgabeLi: 'margin-bottom:5px;',
  h2: 'font-size:1.3em;',
  h3: 'font-size:1.1em;',
  liefererLabel: 'font-size:0.85em;color:#555;margin-bottom:10px;',
  formelLabel: 'font-size:0.8em;color:#666;',
};

// ============================================================================
// BANKEN (Auswahlliste)
// ============================================================================
const BANKEN = [
  'Sparbank Lenggries',
  'Bayeralpbank Bad Tölz',
  'Volksbank Chiemgau',
  'Raiffeisenbank Altmühltal',
  'Frankenbank Bamberg',
  'Allgäubank Kempten',
  'Donaubank Regensburg',
  'Isarbank München',
  'Oberpfalzbank Amberg',
  'Sparkasse Fränkische Schweiz',
];

function fillBankDropdowns() {
  ['kkBankA', 'kkBankB'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = '';
    BANKEN.forEach(b => {
      const o = document.createElement('option');
      o.value = b; o.textContent = b;
      sel.appendChild(o);
    });
  });
  const a = document.getElementById('kkBankA');
  const b = document.getElementById('kkBankB');
  if (a) a.selectedIndex = 0;
  if (b) b.selectedIndex = 1;
}

// ============================================================================
// YAML-LADEN
// ============================================================================
function getUserCompanies() {
  const stored = localStorage.getItem('userCompanies');
  return stored ? JSON.parse(stored) : [];
}

function mergeUserCompaniesIntoYamlData() {
  const userCompanies = getUserCompanies();
  if (userCompanies.length > 0) {
    yamlData = [...yamlData, ...userCompanies];
    yamlData.sort((a, b) => (a.unternehmen?.branche || '').localeCompare(b.unternehmen?.branche || ''));
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
    } catch (err) { console.warn("localStorage YAML kaputt:", err); }
  }
  return false;
}

function loadDefaultYaml() {
  fetch('js/unternehmen.yml')
    .then(res => { if (!res.ok) throw new Error('nicht gefunden'); return res.text(); })
    .then(yamlText => {
      yamlData = jsyaml.load(yamlText) || [];
      if (!localStorage.getItem('standardYamlData')) localStorage.setItem('standardYamlData', JSON.stringify(yamlData));
      mergeUserCompaniesIntoYamlData();
      document.dispatchEvent(new Event('yamlDataLoaded'));
    })
    .catch(err => console.error("Konnte unternehmen.yml nicht laden:", err));
}

document.addEventListener('DOMContentLoaded', () => {
  fillBankDropdowns();

  const nehmerSelect = document.getElementById('kkKreditnehmer');
  if (nehmerSelect) {
    if (nehmerSelect.value) kunde = nehmerSelect.value.trim();
    nehmerSelect.addEventListener('change', () => {
      kunde = nehmerSelect.value.trim() || '';
    });
  }

  // Dropdown füllen, sobald Unternehmensdaten da sind
  document.addEventListener('yamlDataLoaded', () => {
    fillCompanyDropdown();
    autoSelectMyCompany();
  }, { once: true });

  if (!loadYamlFromLocalStorage()) loadDefaultYaml();
});

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================
function roundToTwoDecimals(num) { return Math.round((num + Number.EPSILON) * 100) / 100; }
function rndInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function rndOf(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function formatCurrency(value) { return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }); }
function fmtZahl(v, min = 0, max = 2) { return v.toLocaleString('de-DE', { minimumFractionDigits: min, maximumFractionDigits: max }); }
function fmtProzent(v) { return `${fmtZahl(v, 0, 2)}&nbsp;%`; }
function fmtEffektiv(v) { return `${fmtZahl(v, 2, 2)}&nbsp;%`; }

// ============================================================================
// INPUT-VALIDIERUNG
// ============================================================================
const AV_INPUT_RULES = {
  kkKredit: { label: 'Kreditbetrag', min: 100, max: 1000000, integer: true },
  kkTage: { label: 'Laufzeit (Tage)', min: 30, max: 3600, integer: true },
  kkZinsA: { label: 'Zinssatz A', min: 0.1, max: 15, integer: false },
  kkZinsB: { label: 'Zinssatz B', min: 0.1, max: 15, integer: false },
  kkDisagioA: { label: 'Disagio A', min: 0, max: 10, integer: false },
  kkDisagioB: { label: 'Disagio B', min: 0, max: 10, integer: false },
};

function enthaeltUnsicherenInhalt(str) { return /[<>"'`;&|{}()\[\]\\\/]/.test(str); }

function validiereAlleInputs() {
  const errors = [];
  for (const [id, rule] of Object.entries(AV_INPUT_RULES)) {
    const el = document.getElementById(id);
    if (!el) continue;
    const raw = el.value.trim();
    if (raw === '') { el.classList.remove('av-input-fehler'); continue; }
    if (enthaeltUnsicherenInhalt(raw)) { errors.push(`„${rule.label}": Ungültige Zeichen.`); el.classList.add('av-input-fehler'); continue; }
    const v = parseFloat(raw.replace(',', '.'));
    if (isNaN(v)) { errors.push(`„${rule.label}": Bitte eine gültige Zahl.`); el.classList.add('av-input-fehler'); continue; }
    if (rule.integer && !Number.isInteger(v)) { errors.push(`„${rule.label}": Bitte eine ganze Zahl.`); el.classList.add('av-input-fehler'); continue; }
    if (v < rule.min || v > rule.max) { errors.push(`„${rule.label}": Muss zwischen ${rule.min} und ${rule.max} liegen.`); el.classList.add('av-input-fehler'); continue; }
    el.classList.remove('av-input-fehler');
  }
  return { valid: errors.length === 0, errors };
}

function zeigeValidierungsFehler(errors) {
  document.getElementById('av-validierungs-banner')?.remove();
  if (errors.length === 0) return;
  const banner = document.createElement('div');
  banner.id = 'av-validierungs-banner';
  banner.style.cssText = 'background:#fdecea;border:1px solid #e53935;border-radius:6px;padding:10px 14px;margin:10px 0;font-size:0.88em;color:#b71c1c;line-height:1.7;';
  banner.innerHTML = `<strong>⚠️ Eingabefehler:</strong><ul style="margin:4px 0 0 16px;padding:0;">${errors.map(e => `<li>${e}</li>`).join('')}</ul>`;
  const btn = document.querySelector('button[onclick="zeigeZufaelligenSatz()"]');
  if (btn) btn.insertAdjacentElement('beforebegin', banner);
}

(function injectValidierungsCSS() {
  if (document.getElementById('av-validierung-style')) return;
  const s = document.createElement('style');
  s.id = 'av-validierung-style';
  s.textContent = `.av-input-fehler{border-color:#e53935!important;background:#fff5f5!important;}`;
  document.head.appendChild(s);
})();

// ============================================================================
// KALKULATION: EFFEKTIVER ZINSSATZ (360-Tage-Methode)
// ============================================================================
function berechneKredit(kredit, zins, disagio, tage) {
  const disagioBetrag = roundToTwoDecimals(kredit * disagio / 100);
  const auszahlung = roundToTwoDecimals(kredit - disagioBetrag);
  const zinsen = roundToTwoDecimals(kredit * zins * tage / (100 * 360));
  const kosten = roundToTwoDecimals(zinsen + disagioBetrag);
  const effektiv = roundToTwoDecimals(kosten * 100 * 360 / (auszahlung * tage));
  return { kredit, zins, disagio, tage, disagioBetrag, auszahlung, zinsen, kosten, effektiv };
}

// ============================================================================
// ZUFALLSKONDITIONEN
// Ziel: Ein Angebot hat den niedrigeren Nominalzins, das andere das höhere Disagio,
// sodass der Vergleich nicht trivial ist. Effektive Zinssätze sollen sich unterscheiden.
// ============================================================================
function genKonditionen(kredit, tage) {
  let ergebnis = null;
  for (let i = 0; i < 60; i++) {
    const zA = rndInt(15, 45) / 10;
    const dA = rndOf([0, 0.5, 1, 1.5, 2]);
    const deltaZ = rndInt(1, 4) / 10;
    const deltaD = rndOf([0.5, 1, 1.5]);
    const bNiedrigerZins = Math.random() < 0.5;
    const zB = Math.round((bNiedrigerZins ? zA - deltaZ : zA + deltaZ) * 10) / 10;
    const dB = bNiedrigerZins ? dA + deltaD : Math.max(0, dA - deltaD);
    if (zB < 0.5 || dB === dA) continue;
    ergebnis = { zA, dA, zB, dB };
    const eA = berechneKredit(kredit, zA, dA, tage).effektiv;
    const eB = berechneKredit(kredit, zB, dB, tage).effektiv;
    if (Math.abs(eA - eB) >= 0.02) break;
  }
  return ergebnis || { zA: 1.9, dA: 0.5, zB: 1.7, dB: 1 };
}

function befuelleZufallswerte() {
  const kredit = rndOf([10000, 15000, 20000, 25000, 30000, 40000, 45000, 50000, 60000, 75000, 80000, 100000]);
  const tage = rndInt(720, 2880);
  const k = genKonditionen(kredit, tage);
  document.getElementById('kkKredit').value = kredit;
  document.getElementById('kkTage').value = tage;
  document.getElementById('kkZinsA').value = k.zA;
  document.getElementById('kkDisagioA').value = k.dA;
  document.getElementById('kkZinsB').value = k.zB;
  document.getElementById('kkDisagioB').value = k.dB;

  // zwei verschiedene Banken zufällig wählen
  const selA = document.getElementById('kkBankA');
  const selB = document.getElementById('kkBankB');
  if (selA && selB && BANKEN.length > 1) {
    const i = rndInt(0, BANKEN.length - 1);
    let j = rndInt(0, BANKEN.length - 1);
    while (j === i) j = rndInt(0, BANKEN.length - 1);
    selA.selectedIndex = i;
    selB.selectedIndex = j;
  }
}

// ============================================================================
// DROPDOWN KREDITNEHMER
// ============================================================================
function fillCompanyDropdown() {
  if (!yamlData || yamlData.length === 0) return;
  const sorted = [...yamlData].sort((a, b) => {
    const bA = a.unternehmen?.branche || '', bB = b.unternehmen?.branche || '';
    return bA !== bB ? bA.localeCompare(bB) : (a.unternehmen?.name || '').localeCompare(b.unternehmen?.name || '');
  });
  const sel = document.getElementById('kkKreditnehmer');
  if (!sel) return;
  sel.innerHTML = '';
  const leer = document.createElement('option');
  leer.value = ''; leer.text = '— bitte Unternehmen auswählen —'; leer.disabled = true; leer.selected = true;
  sel.appendChild(leer);
  sorted.forEach(c => {
    const u = c.unternehmen; if (!u?.name) return;
    const t = u.branche ? `${u.branche} – ${u.name} ${u.rechtsform || ''}`.trim() : `${u.name} ${u.rechtsform || ''}`.trim();
    const o = document.createElement('option'); o.value = u.name; o.textContent = t;
    sel.appendChild(o);
  });
}

// ============================================================================
// KALKULATIONS-ZEILEN HELPER
// ============================================================================
function kalkZeileNormal(label, wert) {
  return `<tr><td style="${S.kalkNormalTd}">${label}</td><td style="${S.kalkNormalTdR}">${wert}</td></tr>`;
}
function kalkZeileErgebnis(label, wert) {
  return `<tr><td style="${S.kalkErgebnisTd}">${label}</td><td style="${S.kalkErgebnisTdR}">${wert}</td></tr>`;
}

// ============================================================================
// HAUPT-FUNKTION: KREDITVERGLEICH
// ============================================================================
function zeigeZufaelligenSatz() {
  const validierung = validiereAlleInputs();
  zeigeValidierungsFehler(validierung.errors);
  if (!validierung.valid) return;

  const container = document.getElementById('Container');
  const buttonColumn = document.getElementById('button-column');
  if (!container || !buttonColumn) return;
  container.innerHTML = ''; buttonColumn.innerHTML = '';
  letzteGenerierteGfListeEinkauf = [];

  const nameA = document.getElementById('kkBankA')?.value || 'Bank A';
  const nameB = document.getElementById('kkBankB')?.value || 'Bank B';
  const nehmer = document.getElementById('kkKreditnehmer')?.value?.trim() || String(kunde).replace(/<[^>]+>/g, '');

  function leseInput(id, def) {
    const el = document.getElementById(id);
    if (!el || el.value === '') return def;
    const v = parseFloat(el.value.replace(',', '.'));
    return isNaN(v) ? def : v;
  }

  const kredit = leseInput('kkKredit', 45000);
  const tage = leseInput('kkTage', 1888);
  const zinsA = leseInput('kkZinsA', 1.9);
  const disagioA = leseInput('kkDisagioA', 0.5);
  const zinsB = leseInput('kkZinsB', 1.7);
  const disagioB = leseInput('kkDisagioB', 1);

  const kalkA = berechneKredit(kredit, zinsA, disagioA, tage);
  const kalkB = berechneKredit(kredit, zinsB, disagioB, tage);

  const gleich = kalkA.effektiv === kalkB.effektiv;
  const istAGuenstig = kalkA.effektiv <= kalkB.effektiv;
  const guenstigerName = istAGuenstig ? nameA : nameB;
  const teurerName = istAGuenstig ? nameB : nameA;
  const guenstigerBrief = istAGuenstig ? 'A' : 'B';
  const teurerBrief = istAGuenstig ? 'B' : 'A';
  const kalkGuenstig = istAGuenstig ? kalkA : kalkB;
  const kalkTeuer = istAGuenstig ? kalkB : kalkA;
  const diffPP = fmtZahl(roundToTwoDecimals(Math.abs(kalkA.effektiv - kalkB.effektiv)), 2, 2);

  // ── AUFGABE ──────────────────────────────────────────────────────────
  const zeilenAufgabe = (kal, effText) => `
    ${kalkZeileNormal('Kreditbetrag', formatCurrency(kredit))}
    ${kalkZeileNormal('Zinssatz p.&nbsp;a.', fmtProzent(kal.zins))}
    ${kalkZeileNormal('Disagio', fmtProzent(kal.disagio))}
    ${kalkZeileNormal('Laufzeit (Tage)', fmtZahl(tage, 0, 0))}
    ${kalkZeileErgebnis('Effektiver Zinssatz', effText)}`;

  const karteA_aufgabe = `
<div style="${S.karte}">
  <div style="${S.karteTitel}">Angebot A</div>
  <div style="${S.liefererLabel}">Bank: <strong>${nameA}</strong></div>
  <table style="${S.kalkTable}">${zeilenAufgabe(kalkA, `<strong>${fmtEffektiv(kalkA.effektiv)}</strong>`)}</table>
</div>`;

  const karteB_aufgabe = `
<div style="${S.karteAufgabe}">
  <div style="${S.karteTitel}">Angebot B</div>
  <div style="${S.liefererLabel}">Bank: <strong>${nameB}</strong></div>
  <table style="${S.kalkTable}">${zeilenAufgabe(kalkB, '<strong>?</strong>')}</table>
</div>`;

  const aufgabeHtml = `
<h2 style="${S.h2}">Aufgabe – Kreditvergleich</h2>
<div style="${S.aufgabeBox}">
  <p>${nehmer} benötigt ein Darlehen über ${formatCurrency(kredit)} und holt zwei Kreditangebote ein:</p>
  <ol style="${S.aufgabeOl}">
    <li style="${S.aufgabeLi}">Berechne für das Angebot der <i>${nameB}</i> den Auszahlungsbetrag, die Zinsen in Euro und den effektiven Zinssatz (auf zwei Nachkommastellen gerundet).</li>
    <li style="${S.aufgabeLi}">Vergleiche beide Angebote. Für welche Bank soll sich ${nehmer} entscheiden? Begründe deine Entscheidung.</li>
  </ol>
</div>`;

  // ── LÖSUNG ───────────────────────────────────────────────────────────
function loesungKarte(brief, bank, kal, guenstig) {
  const proz = fmtZahl(100 - kal.disagio, 0, 2);

  // Originalfarben beibehalten, nur das günstigere Angebot grün machen
  let stil = brief === 'A' ? S.karte : S.karteAufgabe;
  if (guenstig && !gleich) {
    stil = S.karteGuenstig;
  }

  return `
<div style="${stil}">
  <div style="${S.karteTitel}">
    Lösung: Angebot ${brief} – ${bank}
    ${guenstig && !gleich ? `<span style="${S.badgeGuenstig}">✓ Niedrigster effektiver Zins</span>` : ''}
  </div>
  <table style="${S.kalkTable}">
    ${kalkZeileNormal('Kreditbetrag (100&nbsp;%)', formatCurrency(kal.kredit))}
    ${kalkZeileNormal(`− Disagio (${fmtProzent(kal.disagio)})`, `− ${formatCurrency(kal.disagioBetrag)}`)}
    ${kalkZeileErgebnis(`= Auszahlungsbetrag (${proz}&nbsp;%)`, formatCurrency(kal.auszahlung))}
  </table>
  <div style="${S.formelLabel}">Zinsen in Euro: ${fmtZahl(kal.kredit, 2, 2)} · ${fmtZahl(kal.zins, 0, 2)} · ${fmtZahl(kal.tage, 0, 0)} ÷ (100 · 360)</div>
  <table style="${S.kalkTable}">
    ${kalkZeileErgebnis('= Zinsen', formatCurrency(kal.zinsen))}
    ${kalkZeileNormal('+ Disagio', formatCurrency(kal.disagioBetrag))}
    ${kalkZeileErgebnis('= Kreditkosten', formatCurrency(kal.kosten))}
  </table>
  <div style="${S.formelLabel}">Effektive Verzinsung: (${fmtZahl(kal.zinsen, 2, 2)} + ${fmtZahl(kal.disagioBetrag, 2, 2)}) · 100 · 360 ÷ (${fmtZahl(kal.auszahlung, 2, 2)} · ${fmtZahl(kal.tage, 0, 0)})</div>
  <table style="${S.kalkTable}">
    ${kalkZeileErgebnis('= Effektiver Zinssatz', `<strong>${fmtEffektiv(kal.effektiv)}</strong>`)}
  </table>
</div>`;
}

  const karteA_loesung = loesungKarte('A', nameA, kalkA, istAGuenstig);
  const karteB_loesung = loesungKarte('B', nameB, kalkB, !istAGuenstig);

  // Hinweis: Nominalzins vs. effektiver Zins
  const niedrigerNominalIstA = kalkA.zins < kalkB.zins;
  const nominalGleich = kalkA.zins === kalkB.zins;
  const nominalNiedrigerName = niedrigerNominalIstA ? nameA : nameB;
  const nominalNiedrigerZins = niedrigerNominalIstA ? kalkA.zins : kalkB.zins;
  const nominalNiedrigerBrief = niedrigerNominalIstA ? 'A' : 'B';
  let hinweisText;
  if (gleich) {
    hinweisText = 'Beide Angebote haben denselben effektiven Zinssatz und sind damit gleich teuer. Dann können nichtmonetäre Faktoren (z.&nbsp;B. Beratung, bestehende Kundenbeziehung, Sondertilgungsmöglichkeiten) den Ausschlag geben.';
  } else if (!nominalGleich && nominalNiedrigerBrief !== guenstigerBrief) {
    hinweisText = `Obwohl die ${nominalNiedrigerName} mit ${fmtProzent(nominalNiedrigerZins)} den niedrigeren Nominalzinssatz bietet, ist Angebot ${guenstigerBrief} (${guenstigerName}) effektiv günstiger. Der Grund: Das höhere Disagio der ${nominalNiedrigerName} verringert den Auszahlungsbetrag, die Zinsen werden aber weiterhin auf den vollen Kreditbetrag berechnet.`;
  } else if (!nominalGleich) {
    hinweisText = `Hier hat die ${guenstigerName} sowohl den niedrigeren Nominalzinssatz als auch den niedrigeren effektiven Zinssatz. Das Disagio (Abschlag bei der Auszahlung) erhöht den effektiven Zinssatz, ändert hier aber nichts an der Rangfolge.`;
  } else {
    hinweisText = `Beide Banken verlangen denselben Nominalzinssatz. Den Unterschied macht allein das Disagio: Je höher das Disagio, desto geringer der Auszahlungsbetrag und desto höher der effektive Zinssatz.`;
  }

  const fazitHtml = gleich
    ? `<div style="${S.fazit}">
  <strong>Kreditvergleich:</strong> Beide Angebote haben einen effektiven Zinssatz von <strong>${fmtEffektiv(kalkA.effektiv)}</strong>.
</div>
<div style="${S.fazitViolett}"><strong>Hinweis:</strong> ${hinweisText}</div>`
    : `<div style="${S.fazit}">
  <strong>Kreditvergleich:</strong>
  Angebot ${guenstigerBrief} (${guenstigerName}) ist mit einem effektiven Zinssatz von
  <strong>${fmtEffektiv(kalkGuenstig.effektiv)}</strong>
  um <strong>${diffPP}&nbsp;Prozentpunkte</strong> günstiger als Angebot ${teurerBrief}
  (${teurerName}, ${fmtEffektiv(kalkTeuer.effektiv)}).
  ${nehmer} sollte sich daher für die <strong>${guenstigerName}</strong> entscheiden.
</div>
<div style="${S.fazitViolett}"><strong>Hinweis:</strong> ${hinweisText}</div>`;

  const loesungHtml = `
<h2 style="${S.h2}" class="loesung">Lösung</h2>
<h3 style="${S.h3}">Aufgabe 1 – Effektiver Zinssatz Angebot B (${nameB})</h3>
<div style="${S.kartenGrid}">${karteA_loesung}${karteB_loesung}</div>
<h3 style="${S.h3}">Aufgabe 2 – Kreditvergleich &amp; Entscheidung</h3>
${fazitHtml}`;

  container.innerHTML =
    aufgabeHtml +
    `<div style="${S.kartenGrid}">${karteA_aufgabe}${karteB_aufgabe}</div>` +
    loesungHtml;

  // KI-Prompt
  letzteGenerierteGfListeEinkauf.push({
    aufgabe: `Kreditvergleich für ${nehmer}: Kreditbetrag ${formatCurrency(kredit)}, Laufzeit ${fmtZahl(tage, 0, 0)} Tage. Angebot A (${nameA}): Zinssatz ${fmtZahl(zinsA, 0, 2)} % p. a., Disagio ${fmtZahl(disagioA, 0, 2)} %, effektiver Zinssatz ${fmtZahl(kalkA.effektiv, 2, 2)} % (vorgegeben). Angebot B (${nameB}): Zinssatz ${fmtZahl(zinsB, 0, 2)} % p. a., Disagio ${fmtZahl(disagioB, 0, 2)} %, effektiver Zinssatz gesucht.`,
    loesung: [
      `Angebot B: Auszahlungsbetrag = ${formatCurrency(kalkB.kredit)} − ${formatCurrency(kalkB.disagioBetrag)} = ${formatCurrency(kalkB.auszahlung)}.`,
      `Zinsen = ${fmtZahl(kalkB.kredit, 2, 2)} · ${fmtZahl(kalkB.zins, 0, 2)} · ${fmtZahl(kalkB.tage, 0, 0)} ÷ (100 · 360) = ${formatCurrency(kalkB.zinsen)}.`,
      `Effektiver Zinssatz = (${fmtZahl(kalkB.zinsen, 2, 2)} + ${fmtZahl(kalkB.disagioBetrag, 2, 2)}) · 100 · 360 ÷ (${fmtZahl(kalkB.auszahlung, 2, 2)} · ${fmtZahl(kalkB.tage, 0, 0)}) = ${fmtZahl(kalkB.effektiv, 2, 2)} %.`,
      gleich
        ? `Beide Angebote haben denselben effektiven Zinssatz (${fmtZahl(kalkA.effektiv, 2, 2)} %).`
        : `Günstigeres Angebot: ${guenstigerBrief} (${guenstigerName}) mit ${fmtZahl(kalkGuenstig.effektiv, 2, 2)} % statt ${fmtZahl(kalkTeuer.effektiv, 2, 2)} % (Differenz ${diffPP} Prozentpunkte).`,
    ].join('\n'),
  });

  const vorschau = document.getElementById('kiPromptVorschau');
  if (vorschau && vorschau.style.display !== 'none') vorschau.textContent = erstelleKiPromptText();
}

// ============================================================================
// AUTO-SELECT MEIN UNTERNEHMEN
// ============================================================================
function autoSelectMyCompany() {
  const myCompanyName = localStorage.getItem('myCompany');
  if (!myCompanyName) return;
  document.querySelectorAll('select.meinUnternehmen').forEach(dropdown => {
    const match = Array.from(dropdown.options).find(opt => opt.value === myCompanyName);
    if (match) {
      dropdown.value = myCompanyName;
      dropdown.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
}

// ============================================================================
// KI-PROMPT
// ============================================================================
function erstelleKiPromptText() {
  const al = letzteGenerierteGfListeEinkauf.length === 0
    ? "(Noch keine Aufgaben generiert.)"
    : letzteGenerierteGfListeEinkauf.map((e, i) => `Aufgabe ${i + 1}:\n${e.aufgabe}\n\nMusterlösung ${i + 1}:\n${e.loesung}`).join("\n\n---\n\n");
  return KI_ASSISTENT_PROMPT.replace("###AUFGABEN und LÖSUNGEN###", al);
}

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Buchführungs-Assistent für Schüler der Realschule (BwR). Du hilfst beim Verständnis von Kreditvergleichen und der Berechnung des effektiven Zinssatzes bei einem Darlehen mit Disagio.

Wichtige Regeln (streng einhalten!):
- Gib KEINE fertigen Beträge, KEINE Prozentwerte und KEINE fertigen Nebenrechnungen vor.
- Führe den Schüler ausschließlich durch gezielte, offene Fragen und kurze Denkanstöße.
- Warte immer auf die richtige Antwort des Schülers, bevor du die nächste Frage stellst.
- Bei Fehlern erkläre das zugrundeliegende Prinzip, ohne die richtige Lösung zu nennen.
- Erst wenn alle Teilschritte richtig beantwortet wurden, bestätige das vollständige Ergebnis.

---
Pädagogischer Ablauf:
Begrüße den Schüler freundlich und starte mit der folgenden Aufgabe:

###AUFGABEN und LÖSUNGEN###

---

AUFGABENTYP: KREDITVERGLEICH MIT EFFEKTIVEM ZINSSATZ

Schritt 1 – Auszahlungsbetrag:
- Was ist ein Disagio und wie wirkt es sich auf die Auszahlung aus?
- Wie viel Prozent des Kreditbetrags werden tatsächlich ausgezahlt?

Schritt 2 – Zinsen in Euro:
- Welche Größen brauchst du für die Zinsformel (Kapital, Zinssatz, Zeit)?
- Wie viele Tage hat ein Jahr in der kaufmännischen Zinsrechnung?
- Auf welchen Betrag werden die Zinsen berechnet – auf den Kreditbetrag oder den Auszahlungsbetrag?

Schritt 3 – Effektiver Zinssatz:
- Was gehört alles zu den Kosten des Kredits (Zinsen und ...)?
- Auf welchen Betrag beziehen sich die Kosten, wenn man den effektiven Zinssatz berechnet?
- Wie lautet die Formel für den Zinssatz bei einer Laufzeit in Tagen?

Formel-Gerüst (nicht vorsagen, nur bei Bedarf schrittweise erarbeiten):
  Zinsen = Kreditbetrag · Zinssatz · Tage ÷ (100 · 360)
  Effektiver Zinssatz = (Zinsen + Disagio) · 100 · 360 ÷ (Auszahlungsbetrag · Tage)

Schritt 4 – Vergleich und Entscheidung:
- Welches Angebot hat den niedrigeren effektiven Zinssatz?
- Warum reicht der Vergleich der Nominalzinssätze allein nicht aus?
- Für welche Bank entscheidest du dich und warum?

Allgemeine Hinweise:
- Das Disagio ist ein Abschlag bei der Auszahlung und erhöht den effektiven Zinssatz.
- Der effektive Zinssatz wird auf zwei Nachkommastellen gerundet.
- Der niedrigere Nominalzinssatz ist nicht automatisch das günstigere Angebot.

Tonalität: freundlich, kurz (1–2 Sätze), gelegentlich Emojis 🏦✅❓📉
Gib die fertige Lösung erst, wenn der Schüler selbst darauf gekommen ist.
Weise am Schluss auf DIN 5008 hin: Tausenderpunkt, zwei Nachkommastellen, €-Zeichen (z. B. 12.000,00 €).
`;

function kopiereKiPrompt() {
  navigator.clipboard.writeText(erstelleKiPromptText()).then(() => {
    const btn = document.getElementById('kiPromptKopierenBtn');
    const orig = btn.innerHTML;
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Kopiert!`;
    btn.classList.add('ki-prompt-btn--success');
    setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('ki-prompt-btn--success'); }, 2500);
  }).catch(() => alert('Kopieren nicht möglich. Bitte manuell aus dem Textfeld kopieren.'));
}

function toggleKiPromptVorschau() {
  const vorschau = document.getElementById('kiPromptVorschau');
  const btn = document.getElementById('kiPromptToggleBtn');
  const hidden = getComputedStyle(vorschau).display === 'none';
  if (hidden) { vorschau.style.display = 'block'; vorschau.textContent = erstelleKiPromptText(); btn.textContent = 'Vorschau ausblenden ▲'; }
  else { vorschau.style.display = 'none'; btn.textContent = 'Prompt anzeigen ▼'; }
}

// ============================================================================
// INIT
// ============================================================================
document.addEventListener('DOMContentLoaded', function () {
  // "Neue Zufallswerte"-Button direkt vor "Aufgabe erstellen" einfügen
  const aufgabeBtn = document.querySelector('button[onclick="zeigeZufaelligenSatz()"]');
  if (aufgabeBtn && !document.getElementById('avNeueZufallswerteBtn')) {
    const zBtn = document.createElement('button');
    zBtn.id = 'avNeueZufallswerteBtn';
    zBtn.type = 'button';
    zBtn.textContent = '🎲 Neue Zufallswerte';
    zBtn.style.cssText = 'margin-right:10px;';
    zBtn.onclick = befuelleZufallswerte;
    aufgabeBtn.insertAdjacentElement('beforebegin', zBtn);
  }

  setTimeout(function () {
    autoSelectMyCompany();
    befuelleZufallswerte();  // Felder beim ersten Laden befüllen
    zeigeZufaelligenSatz();  // Aufgabe sofort rendern
  }, 500);

  const vorschauEl = document.getElementById('kiPromptVorschau');
  if (vorschauEl) vorschauEl.textContent = erstelleKiPromptText();
});