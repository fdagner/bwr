// ============================================================================
// GLOBALE VARIABLEN
// ============================================================================
let kunde = '<i>[Modellunternehmen]</i>';
let letzteGenerierteGfListeEinkauf = [];

// ============================================================================
// INLINE-STYLE-KONSTANTEN (für HTML-Export – kein externes CSS nötig)
// ============================================================================
const S = {
  kartenGrid: 'display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:14px 0 20px;max-width: 700px;',
  loesungStack: 'display:grid;grid-template-columns:1fr;gap:18px;margin:14px 0 20px;',
  aKarte: 'max-width: 300px;border:2px solid #ddd;border-radius:8px;padding:16px 18px;background:#fafafa;font-size:0.93em;font-family:inherit;',
  aKarteAufgabe: 'max-width: 300px;border:2px solid #1565c0;border-radius:8px;padding:16px 18px;background:#f0f4ff;font-size:0.93em;font-family:inherit;',
  aKarteTitel: 'font-weight:700;font-size:1.05em;margin-bottom:10px;color:#1a237e;display:flex;align-items:center;gap:8px;flex-wrap:wrap;',
  lKarte: 'width: 600px;border:1px solid #ccc;border-radius:6px;padding:16px 18px;background:#fff;font-size:0.93em;font-family:inherit;',
  lKarteTitel: 'font-weight:700;font-size:1.05em;margin-bottom:10px;flex-wrap:wrap;',
  kalkTable_a: 'width:100%;border-collapse:collapse;font-size:0.91em;margin-bottom:10px;',
  kalkTable: 'width:500px;border-collapse:collapse;font-size:0.91em;margin-bottom:10px;',
  kalkTd: 'padding:2px 4px;',
  kalkTdRight: 'padding:2px 4px;text-align:right;font-family:Courier New,monospace;white-space:nowrap;min-width:90px;',
  kalkErgebnisTd: 'padding:2px 4px;font-weight:700;border-top:1px solid #bbb;',
  kalkErgebnisTdR: 'padding:2px 4px;text-align:right;font-family:Courier New,monospace;white-space:nowrap;min-width:90px;font-weight:700;border-top:1px solid #bbb;',
  kalkNormalTd: 'padding:2px 4px;',
  kalkNormalTdR: 'padding:2px 4px;text-align:right;font-family:Courier New,monospace;white-space:nowrap;min-width:90px;',
  kalkPctTd: 'padding:2px 4px;text-align:right;white-space:nowrap;min-width:58px;',
  kalkPctResultTd: 'padding:2px 4px;text-align:right;white-space:nowrap;min-width:58px;font-weight:700;border-top:1px solid #bbb;',
  nmAbschnitt: 'font-size:0.83em;color:#666;margin:10px 0 4px;font-weight:600;',
  nmGrid: 'display:grid;grid-template-columns:1fr 1fr;gap:4px 10px;font-size:0.88em;margin-top:8px;',
  nmItem: 'display:flex;flex-direction:column;',
  nmLabel: 'color:#555;font-size:0.82em;margin-bottom:1px;',
  nmWert: 'font-weight:600;color:#222;',
  sternGold: 'color:#f9a825;letter-spacing:1px;',
  sternGrau: 'color:#ddd;',
  fazit: 'margin-top:16px;padding:12px 16px;background:#fff8e1;border-left:4px solid #f9a825;border-radius:0 6px 6px 0;font-size:0.93em;line-height:1.7;',
  fazitViolett: 'margin-top:8px;padding:12px 16px;background:#f9f0ff;border-left:4px solid #7b1fa2;border-radius:0 6px 6px 0;font-size:0.93em;line-height:1.7;',
  aufgabeBox: 'background:#fff;border:1px solid #ddd;border-radius:6px;padding:14px 18px;margin-bottom:16px;line-height:1.7;',
  aufgabeOl: 'margin:6px 0 0 18px;padding:0;',
  aufgabeLi: 'margin-bottom:5px;',
  bsTable: 'max-width: 650px;border:1px solid #ccc;white-space:nowrap;background:#fff;font-family:Courier New,monospace;width:100%;font-size:0.85em;margin-top:4px;border-collapse:collapse;',
  bsTd: 'padding:3px 5px;',
  bsTdRight: 'padding:3px 5px;text-align:right;',
  bsTdCenter: 'padding:3px 5px;text-align:center;width:36px;',
  belegZeile: 'margin:14px 0 4px;padding-top:12px;border-top:1px dashed #ddd;',
  h2: 'font-size:1.3em;',
  h3: 'font-size:1.1em;',
  liefererLabel: 'font-size:0.85em;color:#555;margin-bottom:10px;',
  zusatzLabel: 'font-size:0.88em;font-weight:700;color:#888;margin:14px 0 4px;',
  bsLabel: 'font-size:0.83em;color:#555;margin-bottom:4px;',
  bsLabelGrau: 'font-size:0.83em;color:#888;margin-bottom:4px;',
};

// ============================================================================
// YAML-LADEN
// ============================================================================




document.addEventListener('DOMContentLoaded', () => {
  const kaeuferSelect = document.getElementById('einkaufKaeufer');
  if (kaeuferSelect?.value) kunde = kaeuferSelect.value.trim();
  kaeuferSelect.addEventListener('change', () => {
    kunde = kaeuferSelect.value.trim() || '';
    if (kaeuferSelect.value.trim()) fillBezeichnungsfelderEinkauf(kaeuferSelect.value.trim());
  });
});

// ============================================================================
// WERKSTOFF-BEZEICHNUNGEN
// ============================================================================
function fillBezeichnungsfelderEinkauf(unternehmensName) {
  if (!unternehmensName || !yamlData?.length) return;
  const eintrag = yamlData.find(e => e.unternehmen?.name === unternehmensName);
  const werkstoffe = eintrag?.unternehmen?.werkstoffe;
  if (!werkstoffe) return;
  ["AWR", "AWF", "AWH", "AWB"].forEach(konto => {
    const liste = werkstoffe[konto];
    if (!Array.isArray(liste)) return;
    [0, 1, 2].forEach(i => {
      const el = document.getElementById(`bezeichnung${konto}_${i}`);
      if (!el) return;
      const eintragW = liste[i];
      // neue Struktur: { name, stammlieferant } – alte Struktur: reiner String
      el.value = (typeof eintragW === 'object' && eintragW !== null)
        ? (eintragW.name ?? "")
        : (eintragW ?? "");
    });
  });
}

function getBezeichnungFuerKonto(kuerzel) {
  const kandidaten = [0, 1, 2]
    .map(i => document.getElementById(`bezeichnung${kuerzel}_${i}`)?.value?.trim() || "")
    .filter(v => v.length > 0);
  return kandidaten.length > 0 ? kandidaten[Math.floor(Math.random() * kandidaten.length)] : null;
}

// ============================================================================
// DROPDOWN-STEUERUNG
// ============================================================================
document.addEventListener('DOMContentLoaded', function () {
  const avWerkstoffTyp = document.getElementById('avWerkstoffTyp');
  if (avWerkstoffTyp) {
    avWerkstoffTyp.addEventListener('change', aktualisierAvWerkstoffName);
    aktualisierAvWerkstoffName();
  }
  if (yamlData && yamlData.length > 0) {
    fillCompanyDropdowns();
    autoSelectMyCompany();
    const sel = document.getElementById('einkaufKaeufer');
    if (sel?.value) fillBezeichnungsfelderEinkauf(sel.value.trim());
    befuelleZufallswerte();
    zeigeZufaelligenSatz();
  } else {
    document.addEventListener('yamlDataLoaded', () => {
      fillCompanyDropdowns();
      autoSelectMyCompany();
      const sel = document.getElementById('einkaufKaeufer');
      if (sel?.value) fillBezeichnungsfelderEinkauf(sel.value.trim());
      befuelleZufallswerte();
      zeigeZufaelligenSatz();
    }, { once: true });
  }
});

function aktualisierAvWerkstoffName() {
  const avWerkstoffTyp = document.getElementById('avWerkstoffTyp');
  const avWerkstoffName = document.getElementById('avWerkstoffName');
  if (!avWerkstoffTyp || !avWerkstoffName) return;
  const bsp = getBezeichnungFuerKonto(avWerkstoffTyp.value);
  avWerkstoffName.textContent = bsp ? `→ z. B. „${bsp}"` : '';
}

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================

function rndInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function rndOf(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function bzk_anzeige(bzk) { return bzk > 0 ? formatCurrency(bzk) : 'frei Haus'; }

// ============================================================================
// INPUT-VALIDIERUNG
// ============================================================================
const AV_INPUT_RULES = {
  avMengeA: { label: 'Menge A', min: 1, max: 10000, integer: true },
  avMengeB: { label: 'Menge B', min: 1, max: 10000, integer: true },
  avEinzelpreisA: { label: 'Einzelpreis A', min: 0.01, max: 50000, integer: false },
  avEinzelpreisB: { label: 'Einzelpreis B', min: 0.01, max: 50000, integer: false },
  avRabattA: { label: 'Rabatt A', min: 0, max: 40, integer: true },
  avRabattB: { label: 'Rabatt B', min: 0, max: 40, integer: true },
  avSkontoA: { label: 'Skonto A', min: 0, max: 5, integer: false },
  avSkontoB: { label: 'Skonto B', min: 0, max: 5, integer: false },
  avBzkA: { label: 'Bezugskosten A', min: 0, max: 500, integer: false },
  avBzkB: { label: 'Bezugskosten B', min: 0, max: 500, integer: false },
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
// ÄHNLICHE ZUFALLSPREISE GENERIEREN
// ============================================================================
function genAehnlicheEinzelpreise() {
  const pool = [5, 8, 10, 12, 15, 18, 20, 25, 30, 35, 40, 45, 50, 55, 60, 70, 75, 80, 90, 100, 120, 150, 180, 200, 250, 300, 350, 400, 500];
  const basis = rndOf(pool);
  const delta = Math.round(basis * (rndInt(5, 15) / 100) * 2) / 2;
  return {
    epA: Math.max(0.01, Math.round(basis * 100) / 100),
    epB: Math.max(0.01, Math.round(Math.max(0.01, rndOf([basis - delta, basis + delta])) * 100) / 100)
  };
}

// ============================================================================
// ZUFALLSWERTE IN FELDER SCHREIBEN
// ============================================================================
function befuelleZufallswerte() {
  const menge = rndOf([100, 200, 250, 500, 600, 800, 1000, 2000]);
  const ep = genAehnlicheEinzelpreise();
  document.getElementById('avMengeA').value = menge;
  document.getElementById('avMengeB').value = menge;
  document.getElementById('avEinzelpreisA').value = ep.epA;
  document.getElementById('avEinzelpreisB').value = ep.epB;
  document.getElementById('avRabattA').value = rndOf([5, 10, 15, 20]);
  document.getElementById('avRabattB').value = rndOf([5, 10, 15, 20]);
  document.getElementById('avSkontoA').value = rndOf([0, 2, 3]);
  document.getElementById('avSkontoB').value = rndOf([0, 2, 3]);
  document.getElementById('avBzkA').value = rndOf([0, 0, 25, 50, 75, 100, 125, 150, 175, 200]);
  document.getElementById('avBzkB').value = rndOf([0, 0, 25, 50, 75, 100, 125, 150, 175, 200]);
}

// ============================================================================
// KONTENPLAN
// ============================================================================
// ── Konten: zentral aus dem Kontenplan (js/utils.js) bezogen ────────────────
// Im Generator wird nur die Kontonummer angegeben – Abkürzung und Label
// liefert kontoLabel()/getKonto(). Bei Änderungen nur KONTENPLAN (utils.js)
// anpassen. AWR/AWF/AWH/AWB als Schlüssel = Werkstoffe-Schema der Nutzer-YAML
// und bleibt davon unberührt.
const VE         = kontoLabel('4400');        // Verbindlichkeiten aus LL
const VORST      = kontoLabel('2600');        // Vorsteuer
const VORST_ABK  = kontoLabel('2600', true);  // nur 'VORST' (für Aufgaben ohne Kontonummern)

const kuerzelZuKonto    = { AWR: kontoLabel('6000'), AWF: kontoLabel('6010'), AWH: kontoLabel('6020'), AWB: kontoLabel('6030') };
const kuerzelZuBZKKonto = { AWR: kontoLabel('6001'), AWF: kontoLabel('6011'), AWH: kontoLabel('6021'), AWB: kontoLabel('6031') };
const kuerzelZuWerkstoff = { AWR: "Rohstoffe", AWF: "Fremdbauteile", AWH: "Hilfsstoffe", AWB: "Betriebsstoffe" };

function formatKonto(kontoStr, ohneNummern) {
  return ohneNummern ? kontoStr.replace(/^\d+\s+/, '') : kontoStr;
}

// ============================================================================
// DROPDOWNS
// ============================================================================
function istWerkstoffBranche(b) { return (b || '').toLowerCase().includes('werkstoff'); }

function fillCompanyDropdowns() {
  if (!yamlData || yamlData.length === 0) return;
  const sorted = [...yamlData].sort((a, b) => {
    const bA = a.unternehmen?.branche || '', bB = b.unternehmen?.branche || '';
    return bA !== bB ? bA.localeCompare(bB) : (a.unternehmen?.name || '').localeCompare(b.unternehmen?.name || '');
  });
  const wFirmen = sorted.filter(c => istWerkstoffBranche(c.unternehmen?.branche));
  const liefFirmen = wFirmen.length >= 2 ? wFirmen : sorted;
  const kaeuferSel = document.getElementById('einkaufKaeufer');
  const liefASel = document.getElementById('einkaufLiefererA');
  const liefBSel = document.getElementById('einkaufLiefererB');

  const clear = sel => {
    if (!sel) return;
    sel.innerHTML = '';
    const o = document.createElement('option');
    o.value = ''; o.text = '— bitte Unternehmen auswählen —'; o.disabled = true; o.selected = true;
    sel.appendChild(o);
  };
  clear(kaeuferSel); clear(liefASel); clear(liefBSel);

  sorted.forEach(c => {
    const u = c.unternehmen; if (!u?.name) return;
    const t = u.branche ? `${u.branche} – ${u.name} ${u.rechtsform || ''}`.trim() : `${u.name} ${u.rechtsform || ''}`.trim();
    const o = document.createElement('option'); o.value = u.name; o.textContent = t;
    if (kaeuferSel) kaeuferSel.appendChild(o.cloneNode(true));
  });
  liefFirmen.forEach(c => {
    const u = c.unternehmen; if (!u?.name) return;
    const t = u.branche ? `${u.branche} – ${u.name} ${u.rechtsform || ''}`.trim() : `${u.name} ${u.rechtsform || ''}`.trim();
    const oA = document.createElement('option'); oA.value = u.name; oA.textContent = t;
    if (liefASel) liefASel.appendChild(oA);
    if (liefBSel) liefBSel.appendChild(oA.cloneNode(true));
  });
  if (liefASel?.options.length > 1) liefASel.selectedIndex = 1;
  if (liefBSel?.options.length > 2) liefBSel.selectedIndex = 2;
}

// ============================================================================
// BELEG-URL
// ============================================================================

function erzeugeURLFuerAngebotsvergleich(d) {
  const p = new URLSearchParams();
  const now = new Date();
  p.set('beleg', 'rechnung');
  // Menge und Einheit aus dem jeweiligen Angebot übernehmen; als Einzelpreis den
  // Preis je Einheit übergeben (die Rechnung rechnet: Menge × Einzelpreis = GEsamtpreis)
  const menge = (d.menge !== undefined && !isNaN(d.menge)) ? String(d.menge) : '1';
  const einheit = (d.einheit || 'Stk.').trim();
  if (d.einzelpreis) {
    // Plain number übergeben (parseFloat im Beleg erwartet "105.5"),
    // parseNumericValue würde den Punkt als Tausendertrenner entfernen!
    p.set('einzelpreis1', String(d.einzelpreis));
  } else if (d.listeneinkaufspreis) {
    p.set('einzelpreis1', parseNumericValue(d.listeneinkaufspreis));
  }
  if (d.rabattSatz && parseFloat(d.rabattSatz) > 0) p.set('rabatt', d.rabattSatz);
  if (d.bezugskostenWert && parseFloat(parseNumericValue(d.bezugskostenWert)) > 0) p.set('bezugskosten', parseNumericValue(d.bezugskostenWert));
  if (d.skontoSatz && parseFloat(d.skontoSatz) > 0) p.set('skonto', d.skontoSatz);
  if (d.werkstoff) p.set('artikel1', d.werkstoff);
  const ks = document.getElementById('einkaufKaeufer');
  if (ks?.value) p.set('kunde', ks.value.trim());
  if (d.lieferer) p.set('lieferer', d.lieferer);
  p.set('menge1', menge); p.set('einheit1', einheit); p.set('umsatzsteuer', '19');
  p.set('tag', now.getDate().toString().padStart(2, '0'));
  p.set('monat', (now.getMonth() + 1).toString().padStart(2, '0'));
  return `belege.html?${p.toString()}`;
}

// Registrierung der Angebots-Mail-Belege: URL erst beim Klick erzeugen, damit
// die aktuellen Dropdown-Auswahlwerte zuverlässig übernommen werden
let avMailRegistrierung = [];
function avMailQuelleAnlegen(buchstabe, daten) {
  avMailRegistrierung.push({ buchstabe: buchstabe, daten: daten });
  return avMailRegistrierung.length - 1;
}
function avMailUrlErzeugen(quelleIdx) {
  const eintrag = avMailRegistrierung[quelleIdx] || {};
  return erzeugeMailURLAngebotsvergleich(eintrag.daten || {}, eintrag.buchstabe || 'A');
}
window.avMailUrlErzeugen = avMailUrlErzeugen;

// Mail-URL für ein einzelnes Angebot (A oder B) im Angebotsvergleich:
// der Lieferer versendet das Angebot per E-Mail an den Käufer. Der Lieferer
// wird ZUM KLICK-ZEITPUNKT aus dem Dropdown gelesen (zuverlässig bei
// nachträglichen Änderungen).
function erzeugeMailURLAngebotsvergleich(d, buchstabe) {
  const p = new URLSearchParams();
  const ks = document.getElementById('einkaufKaeufer');
  const lfSel = document.getElementById(buchstabe === 'A' ? 'einkaufLiefererA' : 'einkaufLiefererB');
  const liefererName = (lfSel?.value || '').trim() || ('Lieferant ' + buchstabe);
  p.set('beleg', 'email');
  p.set('vorlage', 'mail3.html');
  if (liefererName) p.set('absender', liefererName);
  if (ks?.value) p.set('empfaenger', ks.value.trim());
  p.set('betreff', `Angebot ${buchstabe} – ${d.werkstoff || 'Werkstoffe'}`);
  p.set('text', erzeugeAngebotsvergleichMailText(d));
  return `belege.html?${p.toString()}`;
}

// Mailtext für ein Angebot (Angebotsvergleich) – vom Lieferer an den Käufer
function erzeugeAngebotsvergleichMailText(d) {
  const ep = formatCurrency(d.einzelpreis);
  const menge = d.menge;
  const einheit = d.einheit || 'Stk.';
  let text = `vielen Dank für Ihre Anfrage. Gerne unterbreiten wir Ihnen ein Angebot über ${menge} ${einheit} ${d.werkstoff || 'Werkstoffe'}: `;
  text += `Der Listenpreis beträgt ${ep} je ${einheit.replace(/\.$/, '')}. `;
  if (d.rabattSatz && parseFloat(d.rabattSatz) > 0) {
    text += `Bei dieser Abnahmemenge gewähren wir Ihnen einen Rabatt von ${d.rabattSatz} %. `;
  }
  if (d.skontoSatz && parseFloat(d.skontoSatz) > 0) {
    text += `Bei Zahlung innerhalb der Skontofrist gewähren wir Ihnen ${d.skontoSatz} % Skonto. `;
  }
  if (d.bezugskostenWert && parseFloat(parseNumericValue(d.bezugskostenWert)) > 0) {
    text += `Hinzu kommen Bezugskosten in Höhe von ${d.bezugskostenWert}. `;
  }
  text += `Wir freuen uns auf Ihre Bestellung und stehen für Rückfragen gerne zur Verfügung.`;
  return text;
}

// ============================================================================
// KALKULATION
// ============================================================================
function berechneKalkulation(listenpreis, rabatt, skonto, bezugskosten) {
  const lep = roundToTwoDecimals(listenpreis);
  const rabattBetrag = roundToTwoDecimals(lep * rabatt / 100);
  const zep = roundToTwoDecimals(lep - rabattBetrag);
  const skontoBetrag = roundToTwoDecimals(zep * skonto / 100);
  const bep = roundToTwoDecimals(zep - skontoBetrag);
  const esp = roundToTwoDecimals(bep + bezugskosten);
  const vorsteuer = roundToTwoDecimals(zep * UST_REGEL / 100);
  const brutto = roundToTwoDecimals(zep + vorsteuer);
  return { lep, rabattBetrag, rabatt, zep, skontoBetrag, skonto, bep, bezugskosten, esp, vorsteuer, brutto };
}

// ============================================================================
// NM-FAKTOREN
// ============================================================================
function sterne(n) {
  const f = Math.max(0, Math.min(5, n));
  return `<span style="${S.sternGold}">${'★'.repeat(f)}</span><span style="${S.sternGrau}">${'☆'.repeat(5 - f)}</span>`;
}

function nmRand() {
  const q = rndInt(2, 5);
  const qt = ['', '', 'mangelhaft', 'ausreichend', 'befriedigend', 'gut', 'sehr gut'];
  return {
    qualitaet: q, qualitaetText: qt[q],
    lieferzeit: rndOf([3, 5, 7, 10, 14, 21]), zahlungsziel: rndOf([14, 21, 30, 45, 60]),
    mindestmenge: rndOf([1, 5, 10, 20, 50, 100]), zuverlaessigkeit: rndInt(2, 5), service: rndInt(2, 5)
  };
}

function renderNmParameterTabelle(nm, einheit) {
  const item = (l, w) => `<div style="${S.nmItem}"><span style="${S.nmLabel}">${l}</span><span style="${S.nmWert}">${w}</span></div>`;
  return `
<div style="${S.nmAbschnitt}">Weitere Angaben</div>
<div style="${S.nmGrid}">
  ${item('Qualität', `${sterne(nm.qualitaet)} (${nm.qualitaetText})`)}
  ${item('Lieferzeit', `${nm.lieferzeit} Tage`)}
  ${item('Zahlungsziel', `${nm.zahlungsziel} Tage`)}
  ${item('Mindestbestellmenge', `${nm.mindestmenge} ${einheit || 'Einh.'}`)}
  ${item('Lieferzuverlässigkeit', sterne(nm.zuverlaessigkeit))}
  ${item('Service / Support', sterne(nm.service))}
</div>`;
}

// ============================================================================
// BUCHUNGSSATZ-BLOCK
// ============================================================================
function renderBuchungssatzBlock(kalk, kontoHauptStr, kontoBzkStr, konto2Str, ohneNummern) {
  const k1 = formatKonto(kontoHauptStr, ohneNummern);
  const kBzk = formatKonto(kontoBzkStr, ohneNummern);
  const k2 = formatKonto(konto2Str, ohneNummern);
  const kVst = ohneNummern ? VORST_ABK : VORST;
  const fmt = v => formatCurrency(v);
  const hasBzk = kalk.bezugskosten > 0;
  const nettoGes = roundToTwoDecimals(kalk.zep + kalk.bezugskosten);
  const vstGes = roundToTwoDecimals(nettoGes * UST_REGEL / 100);
  const bruttoGes = roundToTwoDecimals(nettoGes + vstGes);

  let rows = `
  <tr>
    <td style="${S.bsTd};min-width:120px;">${k1}</td>
    <td style="${S.bsTdRight}">${fmt(kalk.zep)}</td>
    <td style="${S.bsTdCenter}"></td>
    <td style="${S.bsTd}"></td>
    <td style="${S.bsTdRight}"></td>
  </tr>`;
  if (hasBzk) rows += `
  <tr>
    <td style="${S.bsTd}">${kBzk}</td>
    <td style="${S.bsTdRight}">${fmt(kalk.bezugskosten)}</td>
    <td style="${S.bsTdCenter}"></td>
    <td style="${S.bsTd}"></td>
    <td style="${S.bsTdRight}"></td>
  </tr>`;
  rows += `
  <tr>
    <td style="${S.bsTd}">${kVst}</td>
    <td style="${S.bsTdRight}">${fmt(hasBzk ? vstGes : kalk.vorsteuer)}</td>
    <td style="${S.bsTdCenter}">an</td>
    <td style="${S.bsTd}">${k2}</td>
    <td style="${S.bsTdRight}">${fmt(hasBzk ? bruttoGes : kalk.brutto)}</td>
  </tr>`;
  return `<table style="${S.bsTable}"><tbody>${rows}</tbody></table>`;
}

// ============================================================================
// KALKULATIONS-ZEILEN HELPER
// ============================================================================
function kalkZeileNormal(label, wert) {
  return `<tr><td style="${S.kalkNormalTd}">${label}</td><td style="${S.kalkNormalTdR}">${wert}</td></tr>`;
}
// Zeilen mit Prozent-Layout (wie Einkaufskalkulation): Betrag + zwei Prozent-Spalten
function kalkZeileNormalPct(label, wert, pct1 = '', pct2 = '') {
  return `<tr><td style="${S.kalkNormalTd}">${label}</td><td style="${S.kalkNormalTdR}">${wert}</td><td style="${S.kalkPctTd}">${pct1}</td><td style="${S.kalkPctTd}">${pct2}</td></tr>`;
}
function kalkZeileErgebnis(label, wert) {
  return `<tr><td style="${S.kalkErgebnisTd}">${label}</td><td style="${S.kalkErgebnisTdR}">${wert}</td></tr>`;
}
function kalkZeileErgebnisPct(label, wert, pct1 = '', pct2 = '') {
  return `<tr><td style="${S.kalkErgebnisTd}">${label}</td><td style="${S.kalkErgebnisTdR}">${wert}</td><td style="${S.kalkPctResultTd}">${pct1}</td><td style="${S.kalkPctResultTd}">${pct2}</td></tr>`;
}

// ============================================================================
// HAUPT-FUNKTION: ANGEBOTSVERGLEICH
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

  const kuerzel = document.getElementById('avWerkstoffTyp')?.value || 'AWR';
  const kontoHauptStr = kuerzelZuKonto[kuerzel] || kontoLabel('6000');
  const kontoBzkStr = kuerzelZuBZKKonto[kuerzel] || kontoLabel('6001');
  const werkstoffTypName = kuerzelZuWerkstoff[kuerzel] || 'Rohstoffe';
  const werkstoffAnzeige = getBezeichnungFuerKonto(kuerzel) || werkstoffTypName;
  const konto2Str = VE;
  const ohneNummern = document.getElementById('avOhneKontonummern')?.checked || false;

  const nameA = document.getElementById('einkaufLiefererA')?.value || 'Lieferant A';
  const nameB = document.getElementById('einkaufLiefererB')?.value || 'Lieferant B';
  const kaeuferName = document.getElementById('einkaufKaeufer')?.value?.trim() || String(kunde).replace(/<[^>]+>/g, '');
  const einheit = (document.getElementById('avEinheit')?.value || 'Stk.').trim();

  function leseInput(id, def) {
    const el = document.getElementById(id);
    if (!el || el.value === '') return def;
    const v = parseFloat(el.value);
    return isNaN(v) ? def : v;
  }

  const mengeA = leseInput('avMengeA', 100);
  const mengeB = leseInput('avMengeB', mengeA);
  const epA = leseInput('avEinzelpreisA', 50);
  const epB = leseInput('avEinzelpreisB', 50);
  const lepA = roundToTwoDecimals(mengeA * epA);
  const lepB = roundToTwoDecimals(mengeB * epB);

  const rabattA = leseInput('avRabattA', 10);
  const skontoA = leseInput('avSkontoA', 2);
  const bzkA = leseInput('avBzkA', 0);
  const kalkA = berechneKalkulation(lepA, rabattA, skontoA, bzkA);

  const rabattB = leseInput('avRabattB', 10);
  const skontoB = leseInput('avSkontoB', 2);
  const bzkB = leseInput('avBzkB', 0);
  const kalkB = berechneKalkulation(lepB, rabattB, skontoB, bzkB);

  const nmA = nmRand();
  const nmB = nmRand();

  const istAGuenstig = kalkA.esp <= kalkB.esp;
  const guenstigerName = istAGuenstig ? nameA : nameB;
  const guenstigerBrief = istAGuenstig ? 'A' : 'B';
  const teuerEsp = istAGuenstig ? kalkB.esp : kalkA.esp;
  const diff = formatCurrency(Math.abs(kalkA.esp - kalkB.esp));

  const belegDatenA = {
    listeneinkaufspreis: formatCurrency(kalkA.lep), rabattSatz: String(kalkA.rabatt),
    bezugskostenWert: formatCurrency(kalkA.bezugskosten), skontoSatz: String(kalkA.skonto),
    werkstoff: werkstoffAnzeige, lieferer: nameA,
    einzelpreis: epA, menge: mengeA, einheit: einheit,
  };
  const belegDatenB = {
    listeneinkaufspreis: formatCurrency(kalkB.lep), rabattSatz: String(kalkB.rabatt),
    bezugskostenWert: formatCurrency(kalkB.bezugskosten), skontoSatz: String(kalkB.skonto),
    werkstoff: werkstoffAnzeige, lieferer: nameB,
    einzelpreis: epB, menge: mengeB, einheit: einheit,
  };
  const belegDaten = istAGuenstig ? belegDatenA : belegDatenB;
  const belegUrl = erzeugeURLFuerAngebotsvergleich(belegDaten);
  // Mail-Belege: URL erst beim Klick erzeugen (Dropdown-Werte zuverlässig)
  const mailQuelleA = avMailQuelleAnlegen('A', belegDatenA);
  const mailQuelleB = avMailQuelleAnlegen('B', belegDatenB);

  const guenstigerNm = istAGuenstig ? nmA : nmB;
  const teurerNm = istAGuenstig ? nmB : nmA;
  const teuereName = istAGuenstig ? nameB : nameA;
  let nmHinweis = '';
  if (teurerNm.qualitaet > guenstigerNm.qualitaet) nmHinweis = `${teuereName} bietet jedoch eine höhere Qualität (${teurerNm.qualitaetText}) – das kann je nach Produktionsanforderungen die Entscheidung beeinflussen.`;
  else if (teurerNm.lieferzeit < guenstigerNm.lieferzeit) nmHinweis = `${teuereName} liefert schneller (${teurerNm.lieferzeit} vs. ${guenstigerNm.lieferzeit} Tage) – bei engen Produktionsterminen kann das ausschlaggebend sein.`;
  else nmHinweis = `Bei ähnlichen nichtmonetären Faktoren spricht der günstigere Preis klar für ${guenstigerName}.`;

  // ── AUFGABE ──────────────────────────────────────────────────────────
  const karteA_aufgabe = `
<div style="${S.aKarte}">
  <div style="${S.aKarteTitel}">Angebot A </div>
  <div style="${S.liefererLabel}">Lieferer: <strong>${nameA}</strong></div>
  <table style="${S.kalkTable_a}">
    ${kalkZeileErgebnis('<strong>Einstandspreis (ESP)</strong>', `<strong>${formatCurrency(kalkA.esp)}</strong>`)}
    <tr>
      <td style="${S.kalkNormalTd};color:#555;font-size:0.92em;">Lieferung</td>
      <td style="${S.kalkNormalTdR};color:#555;font-size:0.92em;">${bzk_anzeige(kalkA.bezugskosten)}</td>
    </tr>
  </table>
  ${renderNmParameterTabelle(nmA, einheit)}
</div>`;

  const karteB_aufgabe = `
<div style="${S.aKarteAufgabe}">
  <div style="${S.aKarteTitel}">Angebot B</div>
  <div style="${S.liefererLabel}">Lieferer: <strong>${nameB}</strong></div>
  <table style="${S.kalkTable_a}">
    ${kalkZeileNormal('Einzelpreis', formatCurrency(epB))}
    ${kalkZeileNormal('Liefererrabatt', `${kalkB.rabatt}&nbsp;%`)}
    ${kalkZeileNormal('Liefererskonto', `${kalkB.skonto}&nbsp;%`)}
    ${kalkZeileNormal('Lieferung', bzk_anzeige(bzkB))}
  </table>
  ${renderNmParameterTabelle(nmB, einheit)}
</div>`;

  const aufgabeHtml = `
<h2 style="${S.h2}">Aufgabe – Angebotsvergleich</h2>
<div style="${S.aufgabeBox}">
  <p>${kaeuferName} benötigt ${mengeB}&nbsp;${einheit} ${werkstoffAnzeige} (${werkstoffTypName}) und erhält zwei Angebote:</p>
  <ol style="${S.aufgabeOl}">
    <li style="${S.aufgabeLi}">Erstelle für das Angebot von <i>${nameB}</i> die vollständige Einkaufskalkulation und berechne den Einstandspreis.</li>
    <li style="${S.aufgabeLi}">Vergleiche beide Angebote und triff eine begründete Kaufentscheidung unter Berücksichtigung monetärer und nichtmonetärer Faktoren.</li>
    <li style="${S.aufgabeLi}">Bilde den Buchungssatz für den Einkauf der ${werkstoffAnzeige}, wenn sich ${kaeuferName} für das Angebot von <i>${guenstigerName}</i> entscheidet. Es geht eine Eingangsrechnung ein.</li>
  </ol>
</div>`;

  const belegHtml = `
  <div style="${S.belegZeile}; margin-top:20px;">
    <button class="geschaeftsfall-beleg-button" onclick="window.open(avMailUrlErzeugen(${mailQuelleA}),'_blank')"
            style="width:100%;padding:10px 12px;font-size:14px;margin-bottom:8px;">
      📧 Angebot A per Mail (${nameA})
    </button>
    <button class="geschaeftsfall-beleg-button" onclick="window.open(avMailUrlErzeugen(${mailQuelleB}),'_blank')"
            style="width:100%;padding:10px 12px;font-size:14px;margin-bottom:8px;">
      📧 Angebot B per Mail (${nameB})
    </button>
    <button class="geschaeftsfall-beleg-button" onclick="window.open('${belegUrl}','_blank')"
            style="width:100%;padding:10px 12px;font-size:14px;">
      📄 Eingangsrechnung erstellen
    </button>
  </div>`;

  // ── LÖSUNG ───────────────────────────────────────────────────────────
  const karteA_loesung = `
<div style="${S.lKarte}">
  <div style="${S.lKarteTitel}">
    Lösung: Kalkulation Angebot A – ${nameA}
    ${istAGuenstig ? '<strong>(günstigster Einstandspreis)</strong>' : ''}
  </div>
  <table style="${S.kalkTable}">
    ${kalkZeileNormalPct('Listeneinkaufspreis', formatCurrency(kalkA.lep), '100&nbsp;%')}
    ${kalkZeileNormalPct('− Liefererrabatt', `− ${formatCurrency(kalkA.rabattBetrag)}`, `${kalkA.rabatt}&nbsp;%`)}
    ${kalkZeileErgebnisPct('= Zieleinkaufspreis', formatCurrency(kalkA.zep), '100&nbsp;%', '100&nbsp;%')}
    ${kalkZeileNormalPct('− Liefererskonto', `− ${formatCurrency(kalkA.skontoBetrag)}`, '', `${kalkA.skonto}&nbsp;%`)}
    ${kalkZeileErgebnisPct('= Bareinkaufspreis', formatCurrency(kalkA.bep), '', `${100 - kalkA.skonto}&nbsp;%`)}
    ${kalkZeileNormalPct('+ Bezugskosten', bzk_anzeige(kalkA.bezugskosten))}
    ${kalkZeileErgebnisPct('= Einstandspreis', `<strong>${formatCurrency(kalkA.esp)}</strong>`)}
  </table>
</div>`;

  const karteB_loesung = `
<div style="${S.lKarte}">
  <div style="${S.lKarteTitel}">
    Lösung: Kalkulation Angebot B – ${nameB}
    ${!istAGuenstig ? '<strong>(günstigster Einstandspreis)</strong>' : ''}
  </div>
  <table style="${S.kalkTable}">
    ${kalkZeileNormalPct('Listeneinkaufspreis', formatCurrency(kalkB.lep), '100&nbsp;%')}
    ${kalkZeileNormalPct('− Liefererrabatt', `− ${formatCurrency(kalkB.rabattBetrag)}`, `${kalkB.rabatt}&nbsp;%`)}
    ${kalkZeileErgebnisPct('= Zieleinkaufspreis', formatCurrency(kalkB.zep), '100&nbsp;%', '100&nbsp;%')}
    ${kalkZeileNormalPct('− Liefererskonto', `− ${formatCurrency(kalkB.skontoBetrag)}`, '', `${kalkB.skonto}&nbsp;%`)}
    ${kalkZeileErgebnisPct('= Bareinkaufspreis', formatCurrency(kalkB.bep), '', `${100 - kalkB.skonto}&nbsp;%`)}
    ${kalkZeileNormalPct('+ Bezugskosten', bzk_anzeige(kalkB.bezugskosten))}
    ${kalkZeileErgebnisPct('= Einstandspreis', `<strong>${formatCurrency(kalkB.esp)}</strong>`)}
  </table>
</div>`;

  const fazitHtml = `
<div style="margin-top:16px;line-height:1.7;">
  <strong>Preisvergleich:</strong>
  Angebot ${guenstigerBrief} (${guenstigerName}) ist mit einem Einstandspreis von
  <strong>${formatCurrency(istAGuenstig ? kalkA.esp : kalkB.esp)}</strong>
  um <strong>${diff}</strong> günstiger als Angebot ${istAGuenstig ? 'B' : 'A'}
  (${formatCurrency(teuerEsp)}).
</div>
<div style="margin-top:8px;line-height:1.7;">
  <strong>Beispielhafte Faktoren:</strong>
  Qualität (${nmA.qualitaetText} bei A / ${nmB.qualitaetText} bei B),
  Lieferzeit (${nmA.lieferzeit} Tage / ${nmB.lieferzeit} Tage),
  Zahlungsziel (${nmA.zahlungsziel} Tage / ${nmB.zahlungsziel} Tage).<br>
  <strong>Kaufentscheidung:</strong> ${nmHinweis}
</div>`;

  const kalkGuenstig = istAGuenstig ? kalkA : kalkB;
  const kalkNichtGewaehlt = istAGuenstig ? kalkB : kalkA;
  const nameNichtGewaehlt = istAGuenstig ? nameB : nameA;
  const briefNichtGewaehlt = istAGuenstig ? 'B' : 'A';
  const kVorstLabel = ohneNummern ? kontoLabel('2600', true) : kontoLabel('2600');

  const buchungssatzGewaehlt_html = `
<div style="margin-top:4px;">
  <div style="${S.bsLabel}">Zugang ${werkstoffAnzeige} auf Ziel – Angebot&nbsp;${guenstigerBrief} (${guenstigerName})</div>
  ${renderBuchungssatzBlock(kalkGuenstig, kontoHauptStr, kontoBzkStr, konto2Str, ohneNummern)}
</div>`;

  const buchungssatzNichtGewaehlt_html = `
<div style="margin-top:4px;">
  <div style="${S.bsLabelGrau}">Zugang ${werkstoffAnzeige} auf Ziel – Angebot&nbsp;${briefNichtGewaehlt} (${nameNichtGewaehlt})</div>
  ${renderBuchungssatzBlock(kalkNichtGewaehlt, kontoHauptStr, kontoBzkStr, konto2Str, ohneNummern)}
</div>`;

  const loesungHtml = `
<h2 style="${S.h2}" class="loesung">Lösung</h2>
<h3 style="${S.h3}">Aufgabe 1 – Einkaufskalkulation Angebot B (${nameB})</h3>
<div style="${S.loesungStack}">${karteA_loesung}${karteB_loesung}</div>
<h3 style="${S.h3}">Aufgabe 2 – Nichtmonetäre Faktoren &amp; Kaufentscheidung</h3>
${fazitHtml}
<h3 style="${S.h3}">Aufgabe 3 – Buchungssatz</h3>
${buchungssatzGewaehlt_html}
<p style="${S.zusatzLabel}">Zusatz: Buchungssatz für das nicht gewählte Angebot (Vergleich)</p>
${buchungssatzNichtGewaehlt_html}`;

  container.innerHTML =
    aufgabeHtml +
    `<div style="${S.kartenGrid}">${karteA_aufgabe}${karteB_aufgabe}</div>` +
    loesungHtml;
  buttonColumn.innerHTML = belegHtml;
  // KI-Prompt
  letzteGenerierteGfListeEinkauf.push({
    aufgabe: `Angebotsvergleich – ${werkstoffAnzeige}: Angebot A (${nameA}): ${mengeA}&nbsp;${einheit} × ${formatCurrency(epA)}, Rabatt ${rabattA} %, Skonto ${skontoA} %, BZK ${bzk_anzeige(bzkA)}. Angebot B (${nameB}): ${mengeB}&nbsp;${einheit} × ${formatCurrency(epB)}, Rabatt ${rabattB} %, Skonto ${skontoB} %, BZK ${bzk_anzeige(bzkB)}.`,
    loesung: [
      `Kalkulation A: LEP ${formatCurrency(kalkA.lep)} − Rabatt ${formatCurrency(kalkA.rabattBetrag)} = ZEP ${formatCurrency(kalkA.zep)} − Skonto ${formatCurrency(kalkA.skontoBetrag)} = BEP ${formatCurrency(kalkA.bep)} + BZK ${bzk_anzeige(kalkA.bezugskosten)} = ESP ${formatCurrency(kalkA.esp)}.`,
      `Kalkulation B: LEP ${formatCurrency(kalkB.lep)} − Rabatt ${formatCurrency(kalkB.rabattBetrag)} = ZEP ${formatCurrency(kalkB.zep)} − Skonto ${formatCurrency(kalkB.skontoBetrag)} = BEP ${formatCurrency(kalkB.bep)} + BZK ${bzk_anzeige(kalkB.bezugskosten)} = ESP ${formatCurrency(kalkB.esp)}.`,
      `Günstigeres Angebot: ${guenstigerBrief} (${guenstigerName}), Differenz ${diff}.`,
      `Buchungssatz (Angebot ${guenstigerBrief}): ${formatKonto(kontoHauptStr, ohneNummern)} ${formatCurrency(kalkGuenstig.zep)}${kalkGuenstig.bezugskosten > 0 ? ' / ' + formatKonto(kontoBzkStr, ohneNummern) + ' ' + formatCurrency(kalkGuenstig.bezugskosten) : ''} / ${kVorstLabel} ${formatCurrency(kalkGuenstig.bezugskosten > 0 ? roundToTwoDecimals((kalkGuenstig.zep + kalkGuenstig.bezugskosten) * UST_REGEL / 100) : kalkGuenstig.vorsteuer)} an ${formatKonto(konto2Str, ohneNummern)} ${formatCurrency(kalkGuenstig.bezugskosten > 0 ? roundToTwoDecimals((kalkGuenstig.zep + kalkGuenstig.bezugskosten) * (1 + UST_REGEL / 100)) : kalkGuenstig.brutto)}.`,
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
      fillBezeichnungsfelderEinkauf(myCompanyName);
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
Du bist ein freundlicher Buchführungs-Assistent für Schüler der Realschule (BwR), 8. Klasse. Du hilfst beim Verständnis von Angebotsvergleichen und der Einkaufskalkulation.

Wichtige Regeln (streng einhalten!):
- Gib KEINE fertigen Buchungssätze, KEINE Beträge, KEINE Konten und KEINE fertigen Nebenrechnungen vor.
- Führe den Schüler ausschließlich durch gezielte, offene Fragen und kurze Denkanstöße.
- Warte immer auf die richtige Antwort des Schülers, bevor du die nächste Frage stellst.
- Bei Fehlern erkläre das zugrundeliegende Prinzip, ohne die richtige Lösung zu nennen.
- Erst wenn alle Teilschritte richtig beantwortet wurden, bestätige die vollständige Kalkulation oder den Buchungssatz.

---
Pädagogischer Ablauf:
Begrüße den Schüler freundlich und starte mit der folgenden Aufgabe:

###AUFGABEN und LÖSUNGEN###

---

AUFGABENTYP: ANGEBOTSVERGLEICH MIT EINKAUFSKALKULATION

Schritt 1 – Kalkulation beider Angebote:
- Womit beginnt die Kalkulation?
- Welche Abzüge gibt es (Rabatt, Skonto)?
- Was addiert man am Ende (Bezugskosten)?

Kalkulationsschema:
  Listeneinkaufspreis  100 %
  − Liefererrabatt      ? %
  = Zieleinkaufspreis  (= 100 % für Skonto)
  − Liefererskonto      ? %
  = Bareinkaufspreis
  + Bezugskosten
  = Einstandspreis

Schritt 2 – Preisvergleich:
- Welches Angebot hat den niedrigeren Einstandspreis?
- Welche nichtmonetären Faktoren (Qualität, Lieferzeit, Zahlungsziel, Zuverlässigkeit) spielen eine Rolle?
- Für welches Angebot entscheidest du dich und warum?

Schritt 3 – Buchungssatz (nur für das gewählte, günstigere Angebot):
- Welches Konto für den Werkstoff? (Soll)
- Vorsteuer ${UST_REGEL} % auf den Zieleinkaufspreis? (Soll)
- Gegenkonto Verbindlichkeiten auf Ziel (Haben)?

Kontenplan:
Aufwandskonten (Soll): 6000 AWR, 6010 AWF, 6020 AWH, 6030 AWB
Vorsteuer (Soll): 2600 VORST (${UST_REGEL} %)
Kauf auf Ziel (Haben): 4400 VE

Buchungssatz-Schema:
  Werkstoffkonto | ZEP (netto)
  2600 VORST     | Vorsteuer
  an 4400 VE     | Bruttobetrag

---

Allgemeine Hinweise:
- Netto × ${1 + UST_REGEL / 100} = Brutto; Brutto ÷ ${1 + UST_REGEL / 100} = Netto
- Aufwandskonten immer im Soll; Verbindlichkeiten immer im Haben
- Skonto bezieht sich auf den Zieleinkaufspreis, nicht den Listenpreis
- Bezugskosten werden absolut addiert

Tonalität: freundlich, kurz (1–2 Sätze), gelegentlich Emojis 📦✅❓⚖️
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

  const vorschauEl = document.getElementById('kiPromptVorschau');
  if (vorschauEl) vorschauEl.textContent = erstelleKiPromptText();
});