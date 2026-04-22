// ============================================================================
// KAUF HOCHWERTIGER SACHANLAGEN – Aufgaben-Generator
// BwR Realschule Bayern, Klasse 9/10
// ============================================================================

let yamlData = [];
let kunde = '<i>[Modellunternehmen]</i>';
let letzteAufgabe = null;

// ============================================================================
// AfA-TABELLEN-DATEN
// ============================================================================

const anlagenKonfig = {
  MA: {
    label: 'Maschinen & Anlagen', konto: '0700 MA',
    // Branche-Schlüssel für YAML-Filterung
    yamlBranche: ['Maschinen'],
    positionen: [
      { bezeichnung: 'CNC-Fräsmaschine',    nd: 7 },
      { bezeichnung: 'Drehmaschine',         nd: 6 },
      { bezeichnung: 'Schweißanlage',        nd: 10 },
      { bezeichnung: 'Förderanlage',         nd: 10 },
      { bezeichnung: 'Hydraulikpresse',      nd: 10 },
      { bezeichnung: 'Kompressoranlage',     nd: 12 },
    ],
    preisRange: { min: 20000, max: 150000 },
    nebenkostenArt: 'Montage',
    nebenkosten: { min: 400, max: 3000 },
    rabattProzent: [5, 10, 20],
  },
  FP: {
    label: 'Fuhrpark', konto: '0840 FP',
    yamlBranche: ['Fuhrpark'],
    positionen: [
      { bezeichnung: 'LKW',          nd:  9 },
      { bezeichnung: 'Lieferwagen',          nd:  8 },
      { bezeichnung: 'PKW / Kombi',          nd:  6 },
      { bezeichnung: 'Transporter',          nd:  8 },
      { bezeichnung: 'Anhänger / Auflieger', nd: 11 },
    ],
    preisRange: { min: 22000, max: 150000 },
    nebenkostenArt: 'Zulassung',
    nebenkosten: { min: 200, max: 1500 },
    rabattProzent: [5, 10, , 15, 20],
  },
  BM: {
    label: 'Büromaschinen', konto: '0860 BM',
    yamlBranche: ['Büro'],
    positionen: [
      { bezeichnung: 'Server (Rack-Server)',    nd: 5 },
      { bezeichnung: 'Fotokopierer / MFP',      nd: 7 },
      { bezeichnung: 'Frankiermaschine',        nd: 7 },
      { bezeichnung: 'Dokumentenscanner',       nd: 5 },
      { bezeichnung: 'Kassenanlage (POS)',      nd: 7 },
      { bezeichnung: 'Notebook-Workstation',    nd: 3 },
    ],
    preisRange: { min: 2000, max: 10000 },
    nebenkostenArt: 'Installation',
    nebenkosten: { min: 100, max: 800 },
    rabattProzent: [5, 10],
  },
  BGA: {
    label: 'Büromöbel & Geschäftsausstattung', konto: '0870 BGA',
    yamlBranche: ['Büro'],
    positionen: [
      { bezeichnung: 'Büromöbelgarnitur',         nd: 13 },
      { bezeichnung: 'Empfangstheke',             nd: 10 },
      { bezeichnung: 'Konferenzraumausstattung',  nd: 13 },
      { bezeichnung: 'Ladeneinrichtung',          nd: 8 },
    ],
    preisRange: { min: 3000, max: 25000 },
    nebenkostenArt: 'Lieferung',
    nebenkosten: { min: 150, max: 1200 },
    rabattProzent: [5, 10, 20],
  }
};

const kategorieKeys = ['MA', 'FP', 'BM', 'BGA'];

const monatsnamen = [
  'Januar','Februar','März','April','Mai','Juni',
  'Juli','August','September','Oktober','November','Dezember'
];

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rnd(min, max, step = 100) {
  const steps = Math.floor((max - min) / step);
  return min + Math.floor(Math.random() * (steps + 1)) * step;
}

function formatEuro(v) {
  return v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '\u00a0€';
}

function formatProzent(p) {
  return p.toLocaleString('de-DE') + '\u00a0%';
}

// ============================================================================
// YAML / UNTERNEHMEN LADEN
// ============================================================================

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

// ============================================================================
// DROPDOWN BEFÜLLEN
// ============================================================================

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
    option.dataset.branche = u.branche || '';
    kundeSelect.appendChild(option);
  });
}

function autoSelectMyCompany() {
  const myCompanyName = localStorage.getItem('myCompany');
  if (!myCompanyName) return;
  const dropdowns = document.querySelectorAll('select.meinUnternehmen');
  dropdowns.forEach(dropdown => {
    const match = Array.from(dropdown.options).find(o => o.value === myCompanyName);
    if (match) {
      dropdown.value = myCompanyName;
      dropdown.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
}

// ============================================================================
// LIEFERANT JE NACH ANLAGENKATEGORIE – aus YAML nach Branche filtern
// ============================================================================

function getLieferantFuer(katKey) {
  const conf = anlagenKonfig[katKey];

  // Fallback-Namen falls YAML leer
  const fallbacks = {
    MA:  'Maschinenbau GmbH',
    FP:  'AutoHaus AG',
    BM:  'Bürotechnik GmbH',
    BGA: 'Büromöbel AG'
  };

  if (!yamlData || yamlData.length === 0) {
    return fallbacks[katKey] || 'Lieferant GmbH';
  }

  // Firmen nach passender Branche filtern
  const passend = yamlData.filter(c => {
    const b = (c.unternehmen?.branche || '').toLowerCase();
    return conf.yamlBranche.some(w => b.toLowerCase().includes(w.toLowerCase()));
  });

  const pool = passend.length > 0 ? passend : yamlData;
  const chosen = pick(pool);
  const u = chosen.unternehmen;
  // Vollständiger Name inkl. Rechtsform
  return u?.rechtsform
    ? `${u.name} ${u.rechtsform}`.trim()
    : (u?.name || fallbacks[katKey]);
}

// ============================================================================
// GESCHÄFTSFALL-TEXT
// ============================================================================

function erstelleGeschaeftsfallText(d) {
  const { conf, nd, anlage, ap, rbtProzent, nbk, monat, lieferant, kunde } = d;
  const monatName = monatsnamen[monat - 1];
  const jahr = new Date().getFullYear();

  const artikel = ermittleArtikel(anlage.bezeichnung);

  let satz = `${kunde} kauft am 5.\u00a0${monatName} bei der Firma ${lieferant} `;
  satz += `${artikel} ${anlage.bezeichnung} `;
  satz += `zum Listenpreis von ${formatEuro(ap)}`;

  if (rbtProzent > 0) {
    satz += `, abzüglich ${formatProzent(rbtProzent)}\u00a0Treuerabatt`;
  }

  satz += `, auf Ziel`;

  if (nbk > 0) {
    satz += `. Es fallen Kosten für die ${conf.nebenkostenArt} in Höhe von ${formatEuro(nbk)} an`;
  }

  satz += `. Die Nutzungsdauer beträgt ${nd} Jahre.`;

  return satz;
}

function ermittleArtikel(bezeichnung) {
  const bez = bezeichnung.toLowerCase();
  if (/anlage|maschine|presse|garnitur|station|theke|ausstattung|einrichtung|werkzeugmaschine/.test(bez)) return 'eine';
  if (/fahrzeug|system|gerät/.test(bez)) return 'ein';
  return 'einen';
}

// ============================================================================
// ZUFÄLLIGE WERTE IN INPUTS SCHREIBEN
// ============================================================================

function schreibeZufaelligeWerteInInputs() {
  const katKey = getSelectedKategorie();
  const conf   = anlagenKonfig[katKey];
  const anlage = pick(conf.positionen);

  const rbtProzent = (Math.random() < 0.7) ? pick(conf.rabattProzent.filter(Boolean)) : 0;
  const nbk        = (Math.random() < 0.8) ? rnd(conf.nebenkosten.min, conf.nebenkosten.max, 50) : 0;
  const monat      = Math.ceil(Math.random() * 12);
  const nd         = anlage.nd;

  // AP so wählen, dass (ap - rbt + nbk) durch nd teilbar ist
  // → ap muss Vielfaches von snapUnit UND von nd sein (wenn kein nbk, sonst trial & error)
  let ap;
  if (rbtProzent > 0) {
    const snapUnit = Math.round(100 / rbtProzent);
    // ap als Vielfaches von kgV(snapUnit, nd) → AK immer glatt durch nd teilbar
    const kgv = lcm(snapUnit, nd);
    const minSteps = Math.ceil(conf.preisRange.min / kgv);
    const maxSteps = Math.floor(conf.preisRange.max / kgv);
    const step = minSteps + Math.floor(Math.random() * (maxSteps - minSteps + 1));
    ap = step * kgv;
  } else {
    // Ohne Rabatt: (ap + nbk) muss durch nd teilbar sein
    // → ap = nd*k - nbk, gerundet auf 500er
    ap = rnd(conf.preisRange.min, conf.preisRange.max, 500);
    const basis = ap + nbk;
    ap = Math.round(basis / nd) * nd - nbk;
    if (ap < conf.preisRange.min) ap += nd;
  }

  document.getElementById('akInput').value           = ap;
  document.getElementById('rabattInput').value       = rbtProzent;
  document.getElementById('bezugskostenInput').value = nbk;
  document.getElementById('kaufMonatInput').value    = monat;
  document.getElementById('ndInput').value           = nd;
}

// Hilfsfunktion: kleinstes gemeinsames Vielfaches
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
function lcm(a, b) { return (a * b) / gcd(a, b); }


// ============================================================================
// HAUPTGENERATOR
// ============================================================================

function getSelectedKategorie() {
  const sel = document.getElementById('anlageSelect');
  const val = sel ? sel.value : '-1';
  return (val === '-1') ? pick(kategorieKeys) : val;
}

/**
 * "Zufällige Werte" – generiert neue Zufallszahlen, trägt sie in die Inputs
 * ein und rendert sofort die Aufgabe.
 */
function zeigeZufaelligeAufgabe() {
  schreibeZufaelligeWerteInInputs();
  zeigeAufgabeMitInputs();
}

/**
 * "Neue Aufgabe" – liest die aktuellen Inputs aus und rendert damit die Aufgabe.
 */
function zeigeAbschreibungMitManuellen() {
  zeigeAufgabeMitInputs();
}

/**
 * Kernfunktion: liest Inputs, berechnet alle Werte, rendert Aufgabe + Lösung.
 */
function zeigeAufgabeMitInputs() {
  const akIn    = document.getElementById('akInput').value.trim();
  const rbtIn   = document.getElementById('rabattInput').value.trim();
  const nbkIn   = document.getElementById('bezugskostenInput').value.trim();
  const monatIn = document.getElementById('kaufMonatInput').value.trim();
  const ndIn    = document.getElementById('ndInput').value.trim();

  const katKey = getSelectedKategorie();
  const conf   = anlagenKonfig[katKey];
  const anlage = pick(conf.positionen);

  // === Eingaben auslesen ===
  let ap = akIn ? parseFloat(akIn) : rnd(conf.preisRange.min, conf.preisRange.max, 500);

  const rbtProzent = (rbtIn !== '') ? parseFloat(rbtIn) : 0;
  const nbk        = nbkIn ? parseInt(nbkIn) : 0;
  const monat      = (monatIn && parseInt(monatIn) >= 1 && parseInt(monatIn) <= 12)
                       ? parseInt(monatIn)
                       : Math.ceil(Math.random() * 12);

  let nd = ndIn ? parseInt(ndIn) : anlage.nd;

  // =============================================
  // AK-Rundung: AP anpassen, Rabatt korrekt halten
  // =============================================

let rbt = 0;

if (rbtProzent > 0) {
  // snapUnit stellt sicher, dass ap × rbtProzent/100 immer ganzzahlig ist
  // 10% → snap auf 10er | 5% → snap auf 20er | 20% → snap auf 5er | 15% → snap auf 20er
  const snapUnit = Math.round(100 / rbtProzent);
  ap  = Math.round(ap / snapUnit) * snapUnit;
  rbt = ap * rbtProzent / 100;   // garantiert ganzzahlig
}

// AK direkt berechnen – kein zweites Runden mehr
let ak = ap - rbt + nbk;

// AK auf Vielfaches von nd runden NUR wenn kein Rabatt,
// weil sonst rbt wieder schief wird.
// Mit Rabatt: ap wurde bereits so gewählt, dass ak "schön" ist.
if (rbtProzent === 0) {
  ak = Math.round(ak / nd) * nd;
}


  // =============================================

  // Umsatzsteuer
  const gesamtVorst  = Math.round(ak * 0.19 * 100) / 100;
  const gesamtBrutto = Math.round((ak + gesamtVorst) * 100) / 100;

  // Abschreibung zeitanteilig
  const monate        = 13 - monat;
  const afaJahr       = ak / nd;                    // jetzt immer ganzzahlig
  const afaErstesJahr = Math.round(afaJahr * monate / 12 * 100) / 100;

  const lieferant = getLieferantFuer(katKey);
  const kundeEl = document.getElementById('marketingKunde');
  const kunde = (kundeEl && kundeEl.value) ? kundeEl.value : '<i>[Modellunternehmen]</i>';

  letzteAufgabe = {
    katKey, conf, anlage,
    ap, rbtProzent, rbt, nbk, ak,
    gesamtVorst, gesamtBrutto,
    monat, nd, monate, afaJahr, afaErstesJahr,
    lieferant, kunde
  };

  renderAufgaben();
  renderBelegButtons();

  // KI-Prompt aktualisieren falls sichtbar
  const vorschau = document.getElementById('kiPromptVorschau');
  if (vorschau && getComputedStyle(vorschau).display !== 'none') {
    vorschau.textContent = erstelleKiPromptText();
  }
}

// ============================================================================
// AUFGABEN & LÖSUNG RENDERN
// ============================================================================

function renderAufgaben() {
  const d = letzteAufgabe;
  const container = document.getElementById('Container');
  if (!container) return;

  const { conf, anlage, ap, rbtProzent, rbt, nbk, ak,
          gesamtVorst, gesamtBrutto,
          monat, nd, monate, afaJahr, afaErstesJahr } = d;

  const monatName = monatsnamen[monat - 1];

  // ── Aufgabentexte ─────────────────────────────────────────────────────────
  const aufgaben = [
    `Berechne die Anschaffungskosten (AK).`,
    `Bilde den Buchungssatz zum Geschäftsfall.`,
    `Bilde den Buchungssatz zur Abschreibung zum 31. Dezember.`
  ];

  // ── Lösung 1 – Nebenrechnung AK ───────────────────────────────────────────
  let l1 = `<table style="border:none; font-size:15px; margin:4px 0 8px; border-collapse:collapse;">`;

  l1 += `<tr>
    <td style="min-width:340px; padding:2px 12px 2px 0;">Anschaffungspreis (netto)</td>
    <td style="text-align:right; min-width:130px; padding:2px 0;">${formatEuro(ap)}</td>
  </tr>`;

  if (rbtProzent > 0) {
    l1 += `<tr>
      <td style="padding:2px 12px 2px 0; color:#c0392b;">
        − Anschaffungspreisminderung (Treuerabatt\u00a0${formatProzent(rbtProzent)})
      </td>
      <td style="text-align:right; color:#c0392b; padding:2px 0;">−\u00a0${formatEuro(rbt)}</td>
    </tr>`;
  }

  if (nbk > 0) {
    l1 += `<tr>
      <td style="padding:2px 12px 2px 0; color:#1e7e5e;">
        + Anschaffungsnebenkosten\u00a0(${conf.nebenkostenArt})
      </td>
      <td style="text-align:right; color:#1e7e5e; padding:2px 0;">+\u00a0${formatEuro(nbk)}</td>
    </tr>`;
  }

  l1 += `<tr style="border-top:2px solid #555; font-weight:700;">
    <td style="padding:4px 12px 2px 0;">= Anschaffungskosten\u00a0(AK)</td>
    <td style="text-align:right; padding:4px 0;"><span class="val">${formatEuro(ak)}</span></td>
  </tr>`;
  l1 += `</table>`;
  l1 += `</small>`;

  // ── Lösung 2 – Buchungssatz Kauf ──────────────────────────────────────────
  let l2 = `
<table style="border: 1px solid #ccc; white-space:nowrap; background-color:#fff; font-family:courier; width:600px; margin:0 0 6px;">
  <tr>
    <td style="min-width:160px;">${conf.konto}</td>
    <td style="text-align:right;min-width:145px;">${formatEuro(ak)}</td>
    <td style="text-align:center;min-width:50px;"></td>
    <td style="min-width:90px;"></td>
    <td style="min-width:145px;"></td>
  </tr>
  <tr>
    <td>2600 VORST</td>
    <td style="text-align:right;">${formatEuro(gesamtVorst)}</td>
    <td style="text-align:center;">an</td>
    <td>4400 VE</td>
    <td style="text-align:right;">${formatEuro(gesamtBrutto)}</td>
  </tr>
</table>`;
  // ── Lösung 3 – zeitanteilige Abschreibung + Buchungssatz AfA ─────────────
  let l3 = `Kauf im <strong>${monatName}</strong>\u00a0(Monat\u00a0${monat})\u00a0→ verbleibende Monate im Geschäftsjahr: <strong>${monate}</strong><br><br>`;
  l3 += `Jahres-AfA\u00a0= ${formatEuro(ak)}\u00a0÷\u00a0${nd}\u00a0Jahre\u00a0=\u00a0<strong>${formatEuro(afaJahr)}</strong><br>`;
  l3 += `AfA\u00a01.\u00a0Jahr\u00a0=\u00a0${formatEuro(afaJahr)}\u00a0×\u00a0${monate}/12\u00a0=\u00a0<span class="val">${formatEuro(afaErstesJahr)}</span><br><br>`;
  l3 += `
<table style="border: 1px solid #ccc; white-space:nowrap; background-color:#fff; font-family:courier; width:600px; margin:0 0 6px;">
  <tr>
    <td style="min-width:160px;">6520 ABSA</td>
    <td style="text-align:right;min-width:145px;">${formatEuro(afaErstesJahr)}</td>
    <td style="text-align:center;min-width:50px;">an</td>
    <td>${conf.konto}</td>
    <td style="text-align:right;min-width:145px;">${formatEuro(afaErstesJahr)}</td>
  </tr>
</table>`;
  const loesungen = [l1, l2, l3];

  // ── HTML zusammenbauen ────────────────────────────────────────────────────
  container.innerHTML = `
    <div class="aufgaben-section">
      <h2>Aufgaben</h2>

      <div style="background:#f0f6ff; border-left:4px solid #2e7dba; border-radius:0 8px 8px 0;
                  padding:12px 18px; margin-bottom:16px; font-size:15px; line-height:1.8;">
        <strong>Geschäftsfall:</strong><br>
        ${erstelleGeschaeftsfallText(d)}
      </div>

      <ol>${aufgaben.map(a => `<li>${a}</li>`).join('')}</ol>
    </div>

    <div class="loesung-section">
      <h2>Lösung</h2>
      ${loesungen.map((l, i) => `
        <div style="background:#fff; border:1px solid #dde3ea; border-radius:8px;
                    padding:14px 18px; margin-bottom:12px; font-size:16px; line-height:1.7;">
          <strong>Aufgabe\u00a0${i + 1}:</strong><br>${l}
        </div>
      `).join('')}
    </div>
  `;
}

// ============================================================================
// BELEG-BUTTONS
// ============================================================================

function renderBelegButtons() {
  const d = letzteAufgabe;
  const col = document.getElementById('button-column');
  if (!col) return;
  col.innerHTML = '';

  const { katKey, conf, anlage, ap, rbtProzent, rbt, nbk, ak, nd, monat, lieferant } = d;
  const monatStr = monat.toString().padStart(2, '0');
  const jahr = new Date().getFullYear().toString();

  // ── Rechnung ──────────────────────────────────────────────────────────────
  const rParams = new URLSearchParams();
  rParams.set('beleg', 'rechnung');
  rParams.set('artikel1', anlage.bezeichnung);
  rParams.set('menge1', '1');
  rParams.set('einheit1', '');
  rParams.set('einzelpreis1', ap.toString());
  rParams.set('umsatzsteuer', '19');
  rParams.set('tag', '05');
  rParams.set('monat', monatStr);
  rParams.set('jahr', jahr);
  rParams.set('zahlungsziel', '30');
  rParams.set('skonto', '2');
  rParams.set('skontofrist', '14');
  rParams.set('lieferer', lieferant);        // Lieferant aus YAML übergeben
  // Rabatt als Prozentwert übergeben (statt absoluter Betrag)
  if (rbtProzent > 0) rParams.set('rabatt', rbtProzent.toString());
  if (nbk > 0) {
    rParams.set('bezugskosten', nbk.toString());
    rParams.set('bezugskostenart', conf.nebenkostenArt);
  }
  const rechnungURL = `belege.html?${rParams.toString()}`;

  // ── Anlagenkarte ──────────────────────────────────────────────────────────
  const aParams = new URLSearchParams();
  aParams.set('beleg', 'anlagenkarte');
  aParams.set('bezeichnung', anlage.bezeichnung);
  aParams.set('anlagenkonto', conf.konto);
  aParams.set('anschaffungskosten', ak.toString());
  aParams.set('nutzungsdauer', nd.toString());
  aParams.set('tag', '05');
  aParams.set('monat', monatStr);
  aParams.set('jahr', jahr);
  aParams.set('lieferant', lieferant);       // Lieferant aus YAML übergeben
  const karteURL = `belege.html?${aParams.toString()}`;

  const btnWrap1 = document.createElement('div');
  btnWrap1.style.margin = '12px 0';
  btnWrap1.innerHTML = `
    <button class="geschaeftsfall-beleg-button"
      onclick="window.open('${rechnungURL}','_blank')"
      style="width:100%; padding:10px 12px; font-size:14px; margin-bottom:8px;">
      📄 Rechnung erstellen
    </button>`;
  col.appendChild(btnWrap1);

  const btnWrap2 = document.createElement('div');
  btnWrap2.style.margin = '12px 0';
  btnWrap2.innerHTML = `
    <button class="geschaeftsfall-beleg-button"
      onclick="window.open('${karteURL}','_blank')"
      style="width:100%; padding:10px 12px; font-size:14px;">
      🗂️ Anlagenkarte erstellen
    </button>`;
  col.appendChild(btnWrap2);
}

// ============================================================================
// KI-ASSISTENT PROMPT
// ============================================================================

const KI_BASE_PROMPT = `
Du bist ein freundlicher BwR-Assistent für Schülerinnen und Schüler der Realschule (Bayern, Klasse 9/10).
Thema: Kauf hochwertiger Sachanlagen – Anschaffungskosten, Buchungssätze, lineare Abschreibung.

## Deine Rolle
- Gib KEINE fertigen Lösungen oder Buchungssätze vor.
- Führe die Schüler durch gezielte Fragen und Hinweise (Sokratische Methode).
- Einfache Sprache, kurze Antworten (max. 2–3 Sätze pro Nachricht).
- Gelegentlich Emojis 📊💡✅🔢

## Fachwissen

### Anschaffungskosten (AK)
AK = Anschaffungspreis
   − Anschaffungspreisminderungen (Rabatte, Skonti)
   + Anschaffungsnebenkosten (Transport, Montage, Zulassungsgebühren, Zölle)
Die Umsatzsteuer gehört NICHT zu den AK (→ wird als Vorsteuer abgezogen).

### Buchungssatz Kauf (auf Ziel, 19 % USt)
Anlagenkonto (z. B. 0700 MA)   Nettobetrag (= AK)
2600 VORST                      Vorsteuerbetrag     an   4400 VE   Bruttobetrag

### Konten
- 0700 MA  = Maschinen & Anlagen
- 0840 FP  = Fuhrpark
- 0860 BM  = Büromaschinen
- 0870 BGA = Büromöbel & Geschäftsausstattung

### Lineare Abschreibung (zeitanteilig)
Jahres-AfA = AK ÷ Nutzungsdauer
Bei Kauf in Monat M: AfA 1. Jahr = Jahres-AfA × (13 − M) ÷ 12
Erinnerungswert: am Ende der Nutzungsdauer verbleiben 1,00 €.

### Buchungssatz Abschreibung
6520 ABSA   AfA-Betrag   an   Anlagenkonto   AfA-Betrag
(ABSA = Abschreibungen auf Sachanlagen)

## Was du NICHT tust
- Fertige Buchungssätze oder Rechenwege nennen, bevor der Schüler selbst darauf gekommen ist.

---
###AUFGABEN###
`;

function erstelleKiPromptText() {
  if (!letzteAufgabe) return KI_BASE_PROMPT.replace('###AUFGABEN###', '(Noch keine Aufgabe generiert.)');

  const d = letzteAufgabe;
  const { conf, anlage, ap, rbtProzent, rbt, nbk, ak,
          gesamtVorst, gesamtBrutto, monat, nd, monate,
          afaJahr, afaErstesJahr, lieferant, kunde } = d;
  const monatName = monatsnamen[monat - 1];

  const gfText = erstelleGeschaeftsfallText(d).replace(/<[^>]+>/g, '');

  const kontext = `
## Geschäftsfall
${gfText}

## Lösung (nur für den Assistenten – dem Schüler nicht zeigen!)
Anschaffungspreis: ${formatEuro(ap)}
${rbtProzent > 0 ? '− Treuerabatt (' + formatProzent(rbtProzent) + '): − ' + formatEuro(rbt) : ''}
${nbk > 0 ? '+ ' + conf.nebenkostenArt + ': + ' + formatEuro(nbk) : ''}
= Anschaffungskosten (AK): ${formatEuro(ak)}

Vorsteuer 19 % auf ${formatEuro(ak)}: ${formatEuro(gesamtVorst)}
Brutto (VE): ${formatEuro(gesamtBrutto)}

Buchungssatz Kauf:
${conf.konto} ${formatEuro(ak)} / 2600 VORST ${formatEuro(gesamtVorst)} an 4400 VE ${formatEuro(gesamtBrutto)}

Jahres-AfA: ${formatEuro(afaJahr)}
AfA 1. Jahr (${monate}/12): ${formatEuro(afaErstesJahr)}

Buchungssatz AfA:
6520 ABSA ${formatEuro(afaErstesJahr)} an ${conf.konto} ${formatEuro(afaErstesJahr)}
`;

  return KI_BASE_PROMPT.replace('###AUFGABEN###', kontext);
}

function kopiereKiPromptKauf() {
  const text = erstelleKiPromptText();
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('kiPromptKopierenBtn');
    if (!btn) return;
    const orig = btn.innerHTML;
    btn.innerHTML = '✅ Kopiert!';
    setTimeout(() => { btn.innerHTML = orig; }, 2500);
  }).catch(() => alert('Kopieren nicht möglich. Bitte manuell aus dem Textfeld kopieren.'));
}

function toggleKiPromptVorschauKauf() {
  const vorschau = document.getElementById('kiPromptVorschau');
  const btn      = document.getElementById('kiPromptToggleBtn');
  if (!vorschau || !btn) return;
  const isHidden = getComputedStyle(vorschau).display === 'none';
  if (isHidden) {
    vorschau.textContent   = erstelleKiPromptText();
    vorschau.style.display = 'block';
    btn.textContent = 'Vorschau ausblenden ▲';
  } else {
    vorschau.style.display = 'none';
    btn.textContent = 'Prompt anzeigen ▼';
  }
}

// ============================================================================
// INITIALISIERUNG
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  const kundeSelect = document.getElementById('marketingKunde');
  if (kundeSelect) {
    kundeSelect.addEventListener('change', () => {
      kunde = kundeSelect.value.trim() || '<i>[Modellunternehmen]</i>';
    });
  }

  if (!loadYamlFromLocalStorage()) {
    loadDefaultYaml();
  }

  if (yamlData && yamlData.length > 0) {
    fillCompanyDropdowns();
  } else {
    document.addEventListener('yamlDataLoaded', fillCompanyDropdowns, { once: true });
  }

  setTimeout(autoSelectMyCompany, 250);

  const vorschauEl = document.getElementById('kiPromptVorschau');
  if (vorschauEl) vorschauEl.textContent = KI_BASE_PROMPT.replace('###AUFGABEN###', '(Noch keine Aufgabe generiert.)');

  // Direkt beim Laden: zufällige Werte in Inputs schreiben und Aufgabe rendern
  setTimeout(zeigeZufaelligeAufgabe, 300);
});