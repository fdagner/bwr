// ============================================================================
// GLOBALE VARIABLEN
// ============================================================================

let kunde = '<i>[Modellunternehmen]</i>';

// ============================================================================
// EINPRODUKT-MODUS HELPER
// ============================================================================

function isEinProdukt() {
  return (document.getElementById('tkProduktAnzahl')?.value || '2') === '1';
}

// UI-Reaktion auf Produktanzahl-Wechsel
function onProduktAnzahlChange() {
  const fieldset = document.getElementById('prod2-fieldset');
  if (!fieldset) return;
  if (isEinProdukt()) {
    fieldset.classList.add('prod2-disabled');
  } else {
    fieldset.classList.remove('prod2-disabled');
  }
  aktualisiereYamlModus();
}

// ============================================================================
// YAML-DATEN LADEN
// ============================================================================




// Versuch 1: Aus localStorage laden (wenn User eigene Datei hochgeladen hat).
// Core wird dabei aus dem Cache ergänzt; hochgeladene Unternehmen, die bereits
// im Core vorhanden sind (id + Name), werden herausgefiltert.

// Versuch 2: Standard-Datei laden (Core immer frisch), dann zusätzliche hochgeladene ergänzen

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

  const kundeSelect = document.getElementById('tkKunde');
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
}

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================

function randInt(min, max, step = 1) {
  const steps = Math.floor((max - min) / step);
  return min + Math.floor(Math.random() * (steps + 1)) * step;
}

function fmt(n) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtInt(n) {
  return n.toLocaleString('de-DE').replace(/\./g, ' ');
}

function getVal(id) {
  return document.getElementById(id)?.value?.trim() || '';
}

function getNum(id, fallback = 0) {
  return parseFloat(document.getElementById(id)?.value) || fallback;
}

function rundeAuf(wert, step) {
  return Math.round(wert / step) * step;
}

function mischen(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ============================================================================
// FERTIGERZEUGNISSE AUS DEN UNTERNEHMENSDATEN (unternehmen.yml)
// ============================================================================
// Ist ein Unternehmen mit Fertigerzeugnissen gewählt (und die Checkbox
// "Produkte aus Unternehmensdaten verwenden" aktiv), werden Produktname,
// Einheit und NVP-Preisspanne aus der YAML gezogen. Variable Kosten, Mengen
// und Fixkosten kommen weiterhin aus den manuellen Zahlenbereichs-Feldern.

const EINHEIT_STANDARD = 'Stück';

// Liefert die Firma der aktuell gewählten Dropdown-Option (erst per ID, dann per Name)
function getAktuelleFirma() {
  const sel = document.getElementById('tkKunde');
  const opt = sel?.selectedOptions?.[0];
  if (!opt || !opt.value || !Array.isArray(yamlData)) return null;
  const id = opt.dataset.id;
  return (id && yamlData.find(c => String(c.unternehmen?.id) === id))
      || yamlData.find(c => c.unternehmen?.name === opt.value)
      || null;
}

function getFertigerzeugnisse(unternehmensName) {
  const u = getAktuelleFirma()?.unternehmen;
  // "ferigerzeugnisse" = alter Tippfehler-Schlüssel in bereits gespeicherten Unternehmen
  const liste = (u?.fertigerzeugnisse || u?.ferigerzeugnisse)?.hauptwerk;
  if (!Array.isArray(liste)) return [];
  return liste.filter(p => {
    const min = Number(p?.preis_min), max = Number(p?.preis_max);
    return p?.name && String(p.name).trim() &&
      Number.isFinite(min) && Number.isFinite(max) && min > 0 && max >= min;
  });
}

function preisSchritt(max) {
  return max >= 5000 ? 100 : max >= 1000 ? 50 : max >= 100 ? 5 : 1;
}

// Profil eines Produkts aus der YAML.
// Nur die Produkt-Identität (Name, Einheit) und die NVP-Preisspanne kommen aus
// den Unternehmensdaten – variable Kosten, Mengen und Rundung kommen aus den
// manuellen Zahlenbereichs-Feldern (e), damit alles dort Eingestellte wirksam bleibt.
function profilAusProdukt(p, e) {
  const min = Number(p.preis_min);
  const max = Number(p.preis_max);
  return {
    name: String(p.name).trim(),
    einheit: p.einheit ? String(p.einheit).trim() : EINHEIT_STANDARD,
    quelle: 'yaml',
    nvpMin: min,
    nvpMax: max,
    nvpStep: preisSchritt(max),
    vkMin: e.vkMin,
    vkMax: e.vkMax,
    mengeMin: e.mengeMin,
    mengeMax: e.mengeMax,
    mengeStep: e.mengeStep,
  };
}

// Profil aus den manuellen Eingabefeldern (bisheriges Verhalten)
function profilManuell(e, name) {
  return {
    name,
    einheit: EINHEIT_STANDARD,
    quelle: 'manuell',
    nvpMin: e.nvpMin,
    nvpMax: e.nvpMax,
    vkMin: e.vkMin,
    vkMax: e.vkMax,
    mengeMin: e.mengeMin,
    mengeMax: e.mengeMax,
    mengeStep: e.mengeStep,
  };
}

function zufallsNvp(pr) {
  if (pr.quelle === 'manuell') return randInt(pr.nvpMin, pr.nvpMax);
  const lo = Math.ceil(pr.nvpMin / pr.nvpStep);
  const hi = Math.floor(pr.nvpMax / pr.nvpStep);
  const v = hi < lo
    ? Math.round(pr.nvpMin)
    : (lo + Math.floor(Math.random() * (hi - lo + 1))) * pr.nvpStep;
  return Math.max(2, v);
}

// Variable Kosten je Einheit.
// Manueller Modus: aus dem Zahlenbereich der Felder, stets unter dem gezogenen
// NVP geklemmt (und > 0), auch wenn der manuelle VK-Bereich über dem NVP-Bereich liegt.
// YAML-Produkt: am Nettoverkaufspreis orientiert – Kennziffer-Ziehung 40–70 %
// des NVP (Deckungsbeitrag je Einheit also 30–60 % des Preises), ganzzahlig.
function zufallsVk(pr, nvpRef) {
  if (pr.quelle === 'yaml') {
    const anteil = randInt(40, 70);
    const vk = Math.max(1, Math.round(nvpRef * anteil / 100));
    return Math.min(nvpRef - 1, vk);
  }
  const hi = Math.max(1, Math.min(pr.vkMax, nvpRef - 1));
  const lo = Math.min(Math.max(1, pr.vkMin), hi);
  return randInt(lo, hi);
}

// Zufälliges NVP/VK-Paar erzeugen (VK < NVP garantiert)
function erzeugePreisPaar(pr) {
  const nvp = zufallsNvp(pr);
  const vk  = zufallsVk(pr, nvp);
  return { nvp, vk };
}

function zufallsMenge(pr) {
  return randInt(pr.mengeMin, pr.mengeMax, pr.mengeStep);
}

// Fixkosten: in beiden Modi aus dem manuellen Bereich (Werte > 0)
function zufallsFix(e) {
  return randInt(e.fixMin, e.fixMax, e.fixStep);
}

// Fixkosten bei aktiven Unternehmensdaten: aus dem Deckungsbeitrag ableiten
// (45–150 % des DB, auf fixStep gerundet). Damit richten sich die Fixkosten
// am Geschäftsvolumen aus und das Betriebsergebnis kann plausibel – nicht mehr
// automatisch massiv – im Plus oder Minus landen.
function fixkostenAusDb(e, gesamtDb) {
  if (!e.yamlAktiv) return zufallsFix(e);
  const anteil = randInt(45, 150) / 100;
  return Math.max(e.fixStep, rundeAuf(Math.max(gesamtDb, 0) * anteil, e.fixStep));
}

// Fixkosten so wählen, dass der gesuchte NVP in der Preisspanne des Produkts liegt
// (für Preisuntergrenze: DB-Sockel = DB des bekannten Produkts bzw. 0 bei Einprodukt)
function fixFuerZielNvp(e, pr, dbSockel, vk, menge) {
  const nvpZiel = Math.max(zufallsNvp(pr), vk + 1);
  const summe = dbSockel + (nvpZiel - vk) * menge;
  return Math.max(e.fixStep, rundeAuf(summe, e.fixStep));
}

// Zusatzmenge: manuell wie bisher, bei YAML-Produkten 10–40 % der Normalmenge
function zufallsZusatzmenge(e, pr, mengeNormal) {
  if (!e.yamlAktiv) {
    return Math.max(
      1000,
      Math.round(
        randInt(Math.round(e.mengeMin / 2), Math.round(e.mengeMax / 2), e.mengeStep) / 1000
      ) * 1000
    );
  }
  const roh = mengeNormal * (0.10 + Math.random() * 0.30);
  return Math.max(pr.mengeStep, rundeAuf(roh, pr.mengeStep));
}

// ── Anzeige von Einheiten ────────────────────────────────────────────────────

function istStueck(pr) {
  return pr.einheit === EINHEIT_STANDARD;
}

// "1 500 Stück", "1 500 Stk.", "40 m²", "750 × 100 l"
function mengeText(menge, pr, kurz = false) {
  if (istStueck(pr)) return `${fmtInt(menge)} ${kurz ? 'Stk.' : 'Stück'}`;
  const zahl = fmtInt(menge);
  return /^\d/.test(pr.einheit) ? `${zahl} × ${pr.einheit}` : `${zahl} ${pr.einheit}`;
}

// Zusatzauftrag im Aufgabentext: "1 500 Einheiten" bzw. "40 m²"
function mengeZusatzText(menge, pr) {
  return istStueck(pr) ? `${fmtInt(menge)} Einheiten` : mengeText(menge, pr);
}

// "45,00 €" bzw. "45,00 € je m²"
function preisText(wert, pr) {
  return istStueck(pr) ? `${fmt(wert)} €` : `${fmt(wert)} € je ${pr.einheit}`;
}

function labelNvp(...prs) {
  return prs.every(istStueck) ? 'Nettoverkaufspreis pro Stück' : 'Nettoverkaufspreis pro Einheit';
}

function labelVk(...prs) {
  return prs.every(istStueck) ? 'Variable Kosten pro Stück' : 'Variable Kosten pro Einheit';
}

// ── UI: Info-Zeile und Ausgrauen der manuellen Felder ────────────────────────

// "A", "A und B", "A, B und C"
function produktListeText(namen) {
  if (namen.length <= 1) return namen[0] || '';
  return namen.slice(0, -1).join(', ') + ' und ' + namen[namen.length - 1];
}

// Manuell getippte Bezeichnung (null = nie getippt → Standardwert aus dem HTML)
let erzArtManuell = null;

// NVP-Zahlenbereich wurde manuell verändert? (false = YAML darf ihn vorbelegen)
let nvpBereichManuell = false;

// VK-/Fixkosten-Zahlenbereich wurde manuell verändert?
// (false = YAML darf die Felder mit den Generator-Spannen vorbelegen)
let vkFixBereichManuell = false;

function setzeErzeugnisFeld(aktiv, text) {
  const input = document.getElementById('erzeugnisArt');
  if (!input) return;
  const fs = input.closest('fieldset');
  if (aktiv) {
    if (text !== undefined) input.value = text;
    input.disabled = true;
    fs?.classList.add('erz-auto');
  } else {
    input.value = erzArtManuell ?? input.defaultValue;
    input.disabled = false;
    fs?.classList.remove('erz-auto');
  }
}

function aktualisiereYamlModus() {
  const cb = document.getElementById('nutzeYamlProdukte');
  const info = document.getElementById('yamlProduktInfo');
  const name = getVal('tkKunde');
  const liste = getFertigerzeugnisse(name);
  const anzahl = isEinProdukt() ? 1 : 2;
  const gewuenscht = !!cb?.checked;
  const aktiv = gewuenscht && liste.length >= anzahl;
   if (aktiv) {
    setzeErzeugnisFeld(true, produktListeText(liste.map(p => String(p.name).trim())));

    // NVP-Bereich automatisch aus den YAML-Preisspannen vorbelegen
    // (nur solange der Nutzer ihn nicht selbst verändert hat)
    if (!nvpBereichManuell) {
      const mins = liste.map(p => Number(p.preis_min));
      const maxs = liste.map(p => Number(p.preis_max));
      const nvpMinEl = document.getElementById('nvpMin');
      const nvpMaxEl = document.getElementById('nvpMax');
      if (mins.length) { if (nvpMinEl) nvpMinEl.value = Math.min(...mins); }
      if (maxs.length) { if (nvpMaxEl) nvpMaxEl.value = Math.max(...maxs); }
    }

    // VK-/Fixkosten-Bereiche mitführen: die Felder zeigen jetzt die Spannen,
    // in denen der Generator zeichnet (nur solange nicht selbst verändert).
    //   VK:   40–70 % des NVP  → aus dem NVP-Bereich des Produkts abgeleitet
    //   Fix:  45–150 % des Deckungsbeitrags → mit Mengenbereich überschlagen
    if (!vkFixBereichManuell) {
      const mins = liste.map(p => Number(p.preis_min)).filter(Number.isFinite);
      const maxs = liste.map(p => Number(p.preis_max)).filter(Number.isFinite);
      if (mins.length && maxs.length) {
        const nLo = Math.max(1, Math.min(...mins));
        const nHi = Math.max(...maxs, nLo + 1);
        const vkMinEl = document.getElementById('vkMin');
        const vkMaxEl = document.getElementById('vkMax');
        const vkNeuMin = Math.max(1, Math.round(nLo * 0.40));
        const vkNeuMax = Math.max(vkNeuMin + 1, Math.round(nHi * 0.70));
        if (vkMinEl) vkMinEl.value = vkNeuMin;
        if (vkMaxEl) vkMaxEl.value = vkNeuMax;

        const mengenLo = getNum('mengeMin', 500);
        const mengenHi = Math.max(mengenLo, getNum('mengeMax', 6000));
        const rundenE = parseInt(getVal('fixRunden')) || 1000;
        const dbLo = nLo * 0.30 * mengenLo;    // kleinster plausibler Deckungsbeitrag
        const dbHi = nHi * 0.60 * mengenHi;    // größter plausibler Deckungsbeitrag
        const fixMinEl = document.getElementById('fixMin');
        const fixMaxEl = document.getElementById('fixMax');
        const fixNeuLo = Math.max(rundenE, rundeAuf(dbLo * 0.45, rundenE));
        const fixNeuHi = Math.max(fixNeuLo + rundenE, rundeAuf(dbHi * 1.50, rundenE));
        if (fixMinEl) fixMinEl.value = fixNeuLo;
        if (fixMaxEl) fixMaxEl.value = fixNeuHi;
      }
    }
  } else {
    setzeErzeugnisFeld(false);   // kein Haken / keine (ausreichenden) Produkte → manuelle Eingabe zurück
  }

  ['zahlenbereiche-grid', 'produktnamen-grid'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('bereiche-auto', aktiv);
  });

  if (!info) return;
  if (!gewuenscht || !name) {
    info.textContent = '';
  } else if (liste.length === 0) {
    info.textContent = 'Für dieses Unternehmen sind keine Fertigerzeugnisse hinterlegt – es gelten die manuellen Eingaben.';
  } else if (liste.length < anzahl) {
    info.textContent = 'Es ist nur ein Fertigerzeugnis hinterlegt – für zwei Produkte gelten die manuellen Eingaben.';
  } else {
    info.textContent = 'Produkte werden zufällig gezogen aus: ' +
      liste.map(p => p.name).join(', ') +
      '. Produktname, Einheit und NVP-Preisspanne stammen aus den Unternehmensdaten – ' +
      'die variablen Kosten orientieren sich am Nettoverkaufspreis (Deckungsbeitrag je Einheit ' +
      '30 bis 60 % des Preises), die Mengen kommen aus dem Mengenbereich und die Fixkosten ' +
      'richten sich am Geschäftsvolumen aus.';
  }
}

// Gemeinsame Eingaben lesen
function leseEingaben() {
  const unternehmensName = getVal('tkKunde');
  const e = {
    unternehmen: unternehmensName || 'Muster GmbH',
    p1:          getVal('prod1') || 'Produkt A',
    p2:          getVal('prod2') || 'Produkt B',
    erzArt:      getVal('erzeugnisArt') || 'Fertigerzeugnisse',
    nvpMin:      getNum('nvpMin', 50),
    nvpMax:      getNum('nvpMax', 200),
    vkMin:       getNum('vkMin', 20),
    vkMax:       getNum('vkMax', 150),
    mengeMin:    getNum('mengeMin', 500),
    mengeMax:    getNum('mengeMax', 6000),
    fixMin:      getNum('fixMin', 50000),
    fixMax:      getNum('fixMax', 300000),
    mengeStep:   parseInt(getVal('mengeRunden')) || 500,
    fixStep:     parseInt(getVal('fixRunden')) || 1000,
    yamlAktiv:   false,
  };

  const anzahl = isEinProdukt() ? 1 : 2;
  const liste = getFertigerzeugnisse(unternehmensName);
  const gewuenscht = document.getElementById('nutzeYamlProdukte')?.checked;

   if (gewuenscht && liste.length >= anzahl) {
    const gewaehlt = mischen(liste).slice(0, anzahl);
    e.pr1 = profilAusProdukt(gewaehlt[0], e);
    e.p1  = e.pr1.name;
    if (gewaehlt[1]) {
      e.pr2 = profilAusProdukt(gewaehlt[1], e);
      e.p2  = e.pr2.name;
    } else {
      e.pr2 = profilManuell(e, e.p2);   // Einprodukt: wird nicht verwendet
    }
    e.yamlAktiv = true;

    // Gezogene Produkte als "Art der Fertigerzeugnisse" eintragen
    e.erzArt = anzahl === 2 ? `${e.p1} und ${e.p2}` : e.p1;
    setzeErzeugnisFeld(true, e.erzArt);
  } else {
    setzeErzeugnisFeld(false);
    e.erzArt = getVal('erzeugnisArt') || 'Fertigerzeugnisse';
    e.pr1 = profilManuell(e, e.p1);
    e.pr2 = profilManuell(e, e.p2);
  }
  return e;
}

// ============================================================================
// INLINE-STIL-STRINGS (nur für #Container-Output)
// ============================================================================

const S = {
  table:       'border-collapse:collapse; width:100%; font-size:0.93rem; margin:12px 0;',
  tableNarrow: 'border-collapse:collapse; width:auto; font-size:0.93rem; margin-top:10px;',
  thL:  'border:1px solid #aaa; padding:6px 10px; text-align:left;  background:#dde6f5;',
  thR:  'border:1px solid #aaa; padding:6px 10px; text-align:right; background:#dde6f5;',
  tdL:  'border:1px solid #aaa; padding:6px 10px; text-align:left;',
  tdR:  'border:1px solid #aaa; padding:6px 10px; text-align:right;',
  tdL2: 'border:1px solid #aaa; padding:6px 10px; text-align:left;  background:#f9f9f9;',
  tdR2: 'border:1px solid #aaa; padding:6px 10px; text-align:right; background:#f9f9f9;',
  tdDbL: 'border:1px solid #aaa; border-top:2px solid #aaa; padding:6px 10px; text-align:left;  background:#eef2fa; font-weight:600;',
  tdDbR: 'border:1px solid #aaa; border-top:2px solid #aaa; padding:6px 10px; text-align:right; background:#eef2fa; font-weight:600;',
  tdFkL: 'border:1px solid #aaa; padding:6px 10px; text-align:left;  color:#555;',
  tdFkR: 'border:1px solid #aaa; padding:6px 10px; text-align:right; color:#555;',
  tdBeL: 'border:1px solid #aaa; border-top:2px solid #555; padding:6px 10px; text-align:left;  background:#d0dff5; font-weight:700;',
  tdBeR: 'border:1px solid #aaa; border-top:2px solid #555; padding:6px 10px; text-align:right; background:#d0dff5;',
  tdGesuchtR: 'border:2px solid #1a56a0; padding:6px 10px; text-align:right; background:#fff8e1; font-weight:600; color:#1a56a0;',
  aufgabenBox: 'border:1px solid #ccc; border-radius:5px; padding:14px 18px; margin-bottom:18px;',
  hinweisBox:  'background:#fff8e1; border:1px solid #f0c040; border-radius:5px; padding:10px 14px; margin:10px 0 14px; font-size:0.92em;',
  rechenweg:   'margin-top:10px; font-size:0.88em; color:#555;',
  h2output:    'font-size:1.1rem; margin:0 0 12px 0; padding-bottom:6px; border-bottom:2px solid #1a56a0; color:#1a56a0;',
  loesBadge:   (color) => `display:inline-block; background:${color}; color:#fff; border-radius:3px; padding:1px 7px; font-size:0.82em; font-weight:600; margin-left:6px; vertical-align:middle;`,
};

// ============================================================================
// DISPATCHER
// ============================================================================

function generiereAufgabe() {
  const variante = getVal('tkVariante') || 'betriebsergebnis';
  switch (variante) {
    case 'preisuntergrenze':
      isEinProdukt() ? generierePreisuntergrenze1P() : generierePreisuntergrenze();
      break;
    case 'nettoverkaufserloes':
      isEinProdukt() ? generiereNettoverkaufserloes1P() : generiereNettoverkaufserloes();
      break;
    case 'fixkosten':
      isEinProdukt() ? generiereFixkosten1P() : generiereFixkosten();
      break;
    case 'zusatzauftrag':
      isEinProdukt() ? generiereZusatzauftrag1P() : generiereZusatzauftrag();
      break;
    default:
      isEinProdukt() ? generiereBetriebsergebnis1P() : generiereBetriebsergebnis();
  }
}

// ============================================================================
// DATENTABELLE – EINPRODUKT (nur Produkt 1, keine P2-Spalte)
// ============================================================================

function datentabelle1P(pr1, nvp1, vk1, menge1, fixKosten) {
  return `<table style="${S.tableNarrow}">` +
    `<thead><tr>` +
      `<th style="${S.thL}">Modell</th>` +
      `<th style="${S.thR}">„${pr1.name}"</th>` +
    `</tr></thead>` +
    `<tbody>` +
      `<tr>` +
        `<td style="${S.tdL}">${labelNvp(pr1)}</td>` +
        `<td style="${S.tdR}">${preisText(nvp1, pr1)}</td>` +
      `</tr>` +
      `<tr>` +
        `<td style="${S.tdL2}">${labelVk(pr1)}</td>` +
        `<td style="${S.tdR2}">${preisText(vk1, pr1)}</td>` +
      `</tr>` +
      `<tr>` +
        `<td style="${S.tdL}">Produktion ≙ Absatz</td>` +
        `<td style="${S.tdR}">${mengeText(menge1, pr1)}</td>` +
      `</tr>` +
      `<tr>` +
        `<td colspan="2" style="${S.tdL}">Fixkosten gesamt: ${fmt(fixKosten)} €</td>` +
      `</tr>` +
    `</tbody>` +
  `</table>`;
}

// Lösungsschema Einprodukt (2 Spalten: Produkt 1 + gesamt)
function loesungsSchema1P(pr1, menge1, nve1, gVK1, db1, fixKosten, beLabel, beWert) {
  return `<table style="${S.table}">` +
    `<thead><tr>` +
      `<th style="${S.thL}"></th>` +
      `<th style="${S.thR}">Modell „${pr1.name}"<br><span style="font-weight:400; font-size:0.85em;">(${mengeText(menge1, pr1)})<br>in €</span></th>` +
    `</tr></thead>` +
    `<tbody>` +
      `<tr>` +
        `<td style="${S.tdL}">Nettoverkaufserlöse</td>` +
        `<td style="${S.tdR}">${fmt(nve1)}</td>` +
      `</tr>` +
      `<tr>` +
        `<td style="${S.tdL2}"><span style="color:#555; font-size:0.85rem;">–</span> variable Kosten</td>` +
        `<td style="${S.tdR2}">${fmt(gVK1)}</td>` +
      `</tr>` +
      `<tr>` +
        `<td style="${S.tdDbL}">Deckungsbeitrag</td>` +
        `<td style="${S.tdDbR}">${fmt(db1)}</td>` +
      `</tr>` +
      `<tr>` +
        `<td style="${S.tdFkL}"><span style="font-size:0.85rem;">–</span> Fixkosten</td>` +
        `<td style="${S.tdFkR}">${fmt(fixKosten)}</td>` +
      `</tr>` +
      `<tr>` +
        `<td style="${S.tdBeL}">${beLabel}</td>` +
        `<td style="${S.tdBeR}">${beWert}</td>` +
      `</tr>` +
    `</tbody>` +
  `</table>`;
}

// ============================================================================
// VARIANTE 1A – BETRIEBSERGEBNIS (Zweiprodukt)
// ============================================================================

function generiereBetriebsergebnis() {
  const e = leseEingaben();

  const { nvp: nvp1, vk: vk1 } = erzeugePreisPaar(e.pr1);
  const { nvp: nvp2, vk: vk2 } = erzeugePreisPaar(e.pr2);

  const menge1    = zufallsMenge(e.pr1);
  const menge2    = zufallsMenge(e.pr2);

  const nve1      = nvp1 * menge1;
  const nve2      = nvp2 * menge2;
  const gesamtVK1 = vk1 * menge1;
  const gesamtVK2 = vk2 * menge2;
  const db1       = nve1 - gesamtVK1;
  const db2       = nve2 - gesamtVK2;
  const gesamtDB  = db1 + db2;

  const fixKosten = fixkostenAusDb(e, gesamtDB);
  const be        = gesamtDB - fixKosten;

  const quartal   = zufallsQuartal();
  const istGewinn = be >= 0;
  const beLabel   = istGewinn ? 'Gewinn' : 'Verlust';
  const beColor   = istGewinn ? '#2a7a2a' : '#a00';

  const container = document.getElementById('Container');
  if (!container) return;

  container.innerHTML =
    `<h2 style="${S.h2output}">Aufgabe – Betriebsergebnis</h2>` +

    `<div style="${S.aufgabenBox}">` +
      `<p style="margin-bottom:10px;">Das Unternehmen <strong>„${e.unternehmen}"</strong> stellt ${e.erzArt} her. ` +
      `Für das <strong>${quartal}</strong> liegen Ihnen folgende Zahlen vor:</p>` +
      datentabelle(e.pr1, e.pr2, nvp1, nvp2, vk1, vk2, menge1, menge2, fixKosten) +
    `</div>` +

    `<p style="margin-bottom:6px;"><strong>Aufgabe:</strong> Ermitteln Sie rechnerisch Art und Höhe des gesamten Betriebsergebnisses für das ${quartal}.</p>` +

    `<div style="margin-top:28px;">` +
    `<h2 style="${S.h2output}" class="loesung">Lösung</h2>` +
    loesungsSchema(
      e.pr1, e.pr2,
      menge1, menge2,
      nve1, nve2,
      gesamtVK1, gesamtVK2,
      db1, db2, gesamtDB,
      fixKosten,
      `<strong>Betriebsergebnis (${beLabel})</strong>`,
      `<strong style="color:${beColor};">${fmt(be)}</strong>`,
      ''
    ) +
    `<div style="${S.rechenweg}">` +
      `<strong>Rechenweg:</strong> ` +
      `NVE ${e.p1}: ${fmtInt(menge1)} × ${fmt(nvp1)} = ${fmt(nve1)} € &nbsp;|&nbsp; ` +
      `NVE ${e.p2}: ${fmtInt(menge2)} × ${fmt(nvp2)} = ${fmt(nve2)} € &nbsp;|&nbsp; ` +
      `VK ${e.p1}: ${fmtInt(menge1)} × ${fmt(vk1)} = ${fmt(gesamtVK1)} € &nbsp;|&nbsp; ` +
      `VK ${e.p2}: ${fmtInt(menge2)} × ${fmt(vk2)} = ${fmt(gesamtVK2)} € &nbsp;|&nbsp; ` +
      `DB gesamt: ${fmt(db1)} + ${fmt(db2)} = ${fmt(gesamtDB)} € &nbsp;|&nbsp; ` +
      `BE: ${fmt(gesamtDB)} − ${fmt(fixKosten)} = <strong>${fmt(be)} €</strong>` +
    `</div>` +
    `</div>`;
}

// ============================================================================
// VARIANTE 1B – BETRIEBSERGEBNIS (Einprodukt)
// ============================================================================

function generiereBetriebsergebnis1P() {
  const e = leseEingaben();

  const { nvp: nvp1, vk: vk1 } = erzeugePreisPaar(e.pr1);
  const menge1    = zufallsMenge(e.pr1);

  const nve1      = nvp1 * menge1;
  const gesamtVK1 = vk1 * menge1;
  const db1       = nve1 - gesamtVK1;

  const fixKosten = fixkostenAusDb(e, db1);
  const be        = db1 - fixKosten;

  const quartal   = zufallsQuartal();
  const istGewinn = be >= 0;
  const beLabel   = istGewinn ? 'Gewinn' : 'Verlust';
  const beColor   = istGewinn ? '#2a7a2a' : '#a00';

  const container = document.getElementById('Container');
  if (!container) return;

  container.innerHTML =
    `<h2 style="${S.h2output}">Aufgabe – Betriebsergebnis</h2>` +

    `<div style="${S.aufgabenBox}">` +
      `<p style="margin-bottom:10px;">Das Unternehmen <strong>„${e.unternehmen}"</strong> stellt ${e.erzArt} her. ` +
      `Für das <strong>${quartal}</strong> liegen Ihnen folgende Zahlen vor:</p>` +
      datentabelle1P(e.pr1, nvp1, vk1, menge1, fixKosten) +
    `</div>` +

    `<p style="margin-bottom:6px;"><strong>Aufgabe:</strong> Ermitteln Sie rechnerisch Art und Höhe des Betriebsergebnisses für das ${quartal}.</p>` +

    `<div style="margin-top:28px;">` +
    `<h2 style="${S.h2output}">Lösung</h2>` +
    loesungsSchema1P(
      e.pr1, menge1, nve1, gesamtVK1, db1, fixKosten,
      `<strong>Betriebsergebnis (${beLabel})</strong>`,
      `<strong style="color:${beColor};">${fmt(be)}</strong>`
    ) +
    `<div style="${S.rechenweg}">` +
      `<strong>Rechenweg:</strong> ` +
      `NVE: ${fmtInt(menge1)} × ${fmt(nvp1)} = ${fmt(nve1)} € &nbsp;|&nbsp; ` +
      `VK: ${fmtInt(menge1)} × ${fmt(vk1)} = ${fmt(gesamtVK1)} € &nbsp;|&nbsp; ` +
      `DB: ${fmt(nve1)} − ${fmt(gesamtVK1)} = ${fmt(db1)} € &nbsp;|&nbsp; ` +
      `BE: ${fmt(db1)} − ${fmt(fixKosten)} = <strong>${fmt(be)} €</strong>` +
    `</div>` +
    `</div>`;
}

// ============================================================================
// VARIANTE 2A – LANGFRISTIGE PREISUNTERGRENZE (Zweiprodukt)
// ============================================================================

function generierePreisuntergrenze() {
  const e = leseEingaben();

  const gesuchterIstP1 = Math.random() < 0.5;
  const prG = gesuchterIstP1 ? e.pr1 : e.pr2;   // gesuchtes Produkt
  const prB = gesuchterIstP1 ? e.pr2 : e.pr1;   // bekanntes Produkt

  const { nvp: nvpB, vk: vkB } = erzeugePreisPaar(prB);
  const mengeB    = zufallsMenge(prB);

  const nveB      = nvpB * mengeB;
  const gesamtVKB = vkB * mengeB;
  const dbB       = nveB - gesamtVKB;

  // Manuell: Fixkosten einmal aus dem Bereich; YAML: passend zum gesuchten NVP
  let fixKosten = e.yamlAktiv ? 0 : randInt(e.fixMin, e.fixMax, e.fixStep);
  //~flo Rechenbarkeit sichern: dbG = fixKosten − dbB muss positiv sein.
  // Bei manuellen Bereichswerten kann die DB des bekannten Produkts (Menge ×
  // DB je Einheit) weit über dem gezogenen Fixkosten-Wert liegen – sonst gibt
  // es keine gültige Konstellation und der alte Code rekurrierte unaufhörlich.
  if (!e.yamlAktiv) {
    const unter = dbB + Math.max(1000, e.fixStep || 1000);
    if (fixKosten < unter) fixKosten = Math.ceil(unter / Math.max(1, e.fixStep || 1000)) * Math.max(1, e.fixStep || 1000);
  }

  let vkG, mengeG, dbG, nveG, nvpG_exakt;
  let tries = 0;
  do {
    mengeG = zufallsMenge(prG);
    vkG    = zufallsVk(prG, zufallsNvp(prG));
    if (e.yamlAktiv) fixKosten = fixFuerZielNvp(e, prG, dbB, vkG, mengeG);
    dbG         = fixKosten - dbB;
    nveG        = vkG * mengeG + dbG;
    nvpG_exakt  = nveG / mengeG;
    tries++;
  } while ((dbG <= 0 || nvpG_exakt <= vkG) && tries < 200);

  if (dbG <= 0 || nvpG_exakt <= vkG) {
    //~flo Sicherheitsnetz (keine Selbst-Rekursion mehr): Werte direklärung
    // klemmen, so dass eine rechnerisch gültige Konstellation entsteht.
    fixKosten    = Math.max(fixKosten, dbB) + Math.max(1000, e.fixStep || 1000);
    mengeG       = zufallsMenge(prG);
    vkG          = Math.max(1, Math.min(prG.vkMax, Math.max(1, prG.vkMin)));
    dbG          = fixKosten - dbB;
    nveG         = vkG * mengeG + dbG;
    nvpG_exakt   = nveG / mengeG;
  }

  const p1    = e.p1;
  const p2    = e.p2;
  const pGes  = gesuchterIstP1 ? p1 : p2;
  const pBek  = gesuchterIstP1 ? p2 : p1;

  const nvp1  = gesuchterIstP1 ? null   : nvpB;
  const nvp2  = gesuchterIstP1 ? nvpB   : null;
  const vk1   = gesuchterIstP1 ? vkG    : vkB;
  const vk2   = gesuchterIstP1 ? vkB    : vkG;
  const menge1 = gesuchterIstP1 ? mengeG : mengeB;
  const menge2 = gesuchterIstP1 ? mengeB : mengeG;

  const nve1_loes    = gesuchterIstP1 ? nveG          : nveB;
  const nve2_loes    = gesuchterIstP1 ? nveB          : nveG;
  const gVK1_loes    = gesuchterIstP1 ? vkG * mengeG  : gesamtVKB;
  const gVK2_loes    = gesuchterIstP1 ? gesamtVKB     : vkG * mengeG;
  const db1_loes     = gesuchterIstP1 ? dbG           : dbB;
  const db2_loes     = gesuchterIstP1 ? dbB           : dbG;
  const gesamtDB_loes = db1_loes + db2_loes;

  const quartal = zufallsQuartal();

  const container = document.getElementById('Container');
  if (!container) return;

  const aufgabeTabelle =
    `<table style="${S.tableNarrow}">` +
      `<thead><tr>` +
        `<th style="${S.thL}">Modell</th>` +
        `<th style="${S.thR}">„${p1}"</th>` +
        `<th style="${S.thR}">„${p2}"</th>` +
      `</tr></thead>` +
      `<tbody>` +
        `<tr>` +
          `<td style="${S.tdL}">${labelNvp(e.pr1, e.pr2)}</td>` +
          `<td style="${gesuchterIstP1 ? S.tdGesuchtR : S.tdR}">${nvp1 !== null ? preisText(nvp1, e.pr1) : '<strong>?</strong>'}</td>` +
          `<td style="${gesuchterIstP1 ? S.tdR : S.tdGesuchtR}">${nvp2 !== null ? preisText(nvp2, e.pr2) : '<strong>?</strong>'}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL2}">${labelVk(e.pr1, e.pr2)}</td>` +
          `<td style="${S.tdR2}">${preisText(vk1, e.pr1)}</td>` +
          `<td style="${S.tdR2}">${preisText(vk2, e.pr2)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL}">Produktion ≙ Absatz</td>` +
          `<td style="${S.tdR}">${mengeText(menge1, e.pr1)}</td>` +
          `<td style="${S.tdR}">${mengeText(menge2, e.pr2)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td colspan="3" style="${S.tdL}">Fixkosten gesamt: ${fmt(fixKosten)} €</td>` +
        `</tr>` +
      `</tbody>` +
    `</table>`;

  const loesBE_label = `Betriebsergebnis (= 0, da Preisuntergrenze)`;

  const loesungsTabelle =
    `<table style="${S.table}">` +
      `<thead><tr>` +
        `<th style="${S.thL}"></th>` +
        `<th style="${S.thR}">Modell „${p1}"<br><span style="font-weight:400; font-size:0.85em;">(${mengeText(menge1, e.pr1)})<br>in €</span></th>` +
        `<th style="${S.thR}">Modell „${p2}"<br><span style="font-weight:400; font-size:0.85em;">(${mengeText(menge2, e.pr2)})<br>in €</span></th>` +
        `<th style="${S.thR}">gesamt<br><span style="font-weight:400; font-size:0.85em;">in €</span></th>` +
      `</tr></thead>` +
      `<tbody>` +
        `<tr>` +
          `<td style="${S.tdL}">Nettoverkaufserlöse</td>` +
          `<td style="${gesuchterIstP1 ? S.tdGesuchtR : S.tdR}">${fmt(nve1_loes)}</td>` +
          `<td style="${gesuchterIstP1 ? S.tdR : S.tdGesuchtR}">${fmt(nve2_loes)}</td>` +
          `<td style="${S.tdR}"></td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL2}"><span style="color:#555; font-size:0.85rem;">–</span> variable Kosten</td>` +
          `<td style="${S.tdR2}">${fmt(gVK1_loes)}</td>` +
          `<td style="${S.tdR2}">${fmt(gVK2_loes)}</td>` +
          `<td style="${S.tdR2}"></td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdDbL}">Deckungsbeitrag</td>` +
          `<td style="${S.tdDbR}">${fmt(db1_loes)}</td>` +
          `<td style="${S.tdDbR}">${fmt(db2_loes)}</td>` +
          `<td style="${S.tdDbR}">${fmt(gesamtDB_loes)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdFkL}"><span style="font-size:0.85rem;">–</span> Fixkosten</td>` +
          `<td style="${S.tdFkR}"></td>` +
          `<td style="${S.tdFkR}"></td>` +
          `<td style="${S.tdFkR}">${fmt(fixKosten)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdBeL}"><strong>${loesBE_label}</strong></td>` +
          `<td style="${S.tdBeR}"></td>` +
          `<td style="${S.tdBeR}"></td>` +
          `<td style="${S.tdBeR} font-weight:700; color:#2a7a2a;"><strong>0,00</strong></td>` +
        `</tr>` +
      `</tbody>` +
    `</table>`;

  const ergebnisZeile =
    `<div style="margin-top:14px; padding:10px 14px; background:#e8f0fe; border:1px solid #b0c4ef; border-radius:5px; font-size:0.97em;">` +
      `<strong>Langfristige Preisuntergrenze für „${pGes}":</strong><br>` +
      `NVE<sub>${pGes}</sub> = Gesamtdeckungsbeitrag − DB<sub>${pBek}</sub> + variable Kosten<sub>${pGes}</sub><br>` +
      `NVE<sub>${pGes}</sub> = ${fmt(fixKosten)} − ${fmt(dbB)} + ${fmt(vkG * mengeG)} = ${fmt(nveG)} €<br>` +
      `<strong>NVP<sub>${pGes}</sub> = NVE<sub>${pGes}</sub> ÷ Menge = ${fmt(nveG)} ÷ ${fmtInt(mengeG)} = <span style="color:#1a56a0;">${preisText(nvpG_exakt, prG)}</span></strong>` +
    `</div>`;

  const rechenwegText =
    `NVE ${pBek}: ${fmtInt(mengeB)} × ${fmt(nvpB)} = ${fmt(nveB)} € &nbsp;|&nbsp; ` +
    `VK ${pBek}: ${fmtInt(mengeB)} × ${fmt(vkB)} = ${fmt(gesamtVKB)} € &nbsp;|&nbsp; ` +
    `DB ${pBek}: ${fmt(nveB)} − ${fmt(gesamtVKB)} = ${fmt(dbB)} € &nbsp;|&nbsp; ` +
    `Benötigter DB ${pGes}: ${fmt(fixKosten)} − ${fmt(dbB)} = ${fmt(dbG)} € &nbsp;|&nbsp; ` +
    `NVE ${pGes}: ${fmt(vkG * mengeG)} + ${fmt(dbG)} = ${fmt(nveG)} € &nbsp;|&nbsp; ` +
    `NVP ${pGes}: ${fmt(nveG)} ÷ ${fmtInt(mengeG)} = <strong>${preisText(nvpG_exakt, prG)}</strong>`;

  container.innerHTML =
    `<h2 style="${S.h2output}">Aufgabe – Langfristige Preisuntergrenze</h2>` +
    `<div style="${S.aufgabenBox}">` +
      `<p style="margin-bottom:8px;">Das Unternehmen <strong>„${e.unternehmen}"</strong> stellt ${e.erzArt} her. ` +
      `Für das <strong>${quartal}</strong> liegen Ihnen folgende Zahlen vor:</p>` +
      aufgabeTabelle +
    `</div>` +
    `<p style="margin-bottom:6px;"><strong>Aufgabe</strong><br>Berechnen Sie die langfristige Preisuntergrenze für „${pGes}".</p>` +
    `<div style="margin-top:28px;">` +
    `<h2 style="${S.h2output}">Lösung</h2>` +
    loesungsTabelle +
    ergebnisZeile +
    `<div style="${S.rechenweg}">` +
      `<strong>Rechenweg:</strong> ` + rechenwegText +
    `</div>` +
    `</div>`;
}

// ============================================================================
// VARIANTE 2B – LANGFRISTIGE PREISUNTERGRENZE (Einprodukt)
// NVP ist unbekannt. Bedingung: BE = 0 → DB = Fixkosten
// NVE = VKg + Fixkosten; NVP = NVE / Menge
// ============================================================================

function generierePreisuntergrenze1P() {
  const e = leseEingaben();
  const pr1 = e.pr1;

  const menge1 = zufallsMenge(pr1);
  let vk1, fixKosten;

  if (e.yamlAktiv) {
    vk1       = zufallsVk(pr1, zufallsNvp(pr1));
    fixKosten = fixFuerZielNvp(e, pr1, 0, vk1, menge1);
  } else {
    vk1       = randInt(e.vkMin, e.vkMax);
    fixKosten = randInt(e.fixMin, e.fixMax, e.fixStep);
  }

  const gesamtVK1 = vk1 * menge1;
  const nve1      = gesamtVK1 + fixKosten;  // DB = Fixkosten → BE = 0
  const nvp1_exakt = nve1 / menge1;
  const db1       = fixKosten;               // DB = Fixkosten

  const quartal   = zufallsQuartal();
  const container = document.getElementById('Container');
  if (!container) return;

  // Aufgabentabelle: NVP = ?
  const aufgabeTabelle =
    `<table style="${S.tableNarrow}">` +
      `<thead><tr>` +
        `<th style="${S.thL}">Modell</th>` +
        `<th style="${S.thR}">„${e.p1}"</th>` +
      `</tr></thead>` +
      `<tbody>` +
        `<tr>` +
          `<td style="${S.tdL}">${labelNvp(pr1)}</td>` +
          `<td style="${S.tdGesuchtR}"><strong>?</strong></td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL2}">${labelVk(pr1)}</td>` +
          `<td style="${S.tdR2}">${preisText(vk1, pr1)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL}">Produktion ≙ Absatz</td>` +
          `<td style="${S.tdR}">${mengeText(menge1, pr1)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td colspan="2" style="${S.tdL}">Fixkosten gesamt: ${fmt(fixKosten)} €</td>` +
        `</tr>` +
      `</tbody>` +
    `</table>`;

  const loesungsTabelle =
    `<table style="${S.table}">` +
      `<thead><tr>` +
        `<th style="${S.thL}"></th>` +
        `<th style="${S.thR}">Modell „${e.p1}"<br><span style="font-weight:400; font-size:0.85em;">(${mengeText(menge1, pr1)})<br>in €</span></th>` +
      `</tr></thead>` +
      `<tbody>` +
        `<tr>` +
          `<td style="${S.tdL}">Nettoverkaufserlöse</td>` +
          `<td style="${S.tdGesuchtR}">${fmt(nve1)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL2}"><span style="color:#555; font-size:0.85rem;">–</span> variable Kosten</td>` +
          `<td style="${S.tdR2}">${fmt(gesamtVK1)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdDbL}">Deckungsbeitrag</td>` +
          `<td style="${S.tdDbR}">${fmt(db1)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdFkL}"><span style="font-size:0.85rem;">–</span> Fixkosten</td>` +
          `<td style="${S.tdFkR}">${fmt(fixKosten)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdBeL}"><strong>Betriebsergebnis (= 0, da Preisuntergrenze)</strong></td>` +
          `<td style="${S.tdBeR} font-weight:700; color:#2a7a2a;"><strong>0,00</strong></td>` +
        `</tr>` +
      `</tbody>` +
    `</table>`;

  const ergebnisZeile =
    `<div style="margin-top:14px; padding:10px 14px; background:#e8f0fe; border:1px solid #b0c4ef; border-radius:5px; font-size:0.97em;">` +
      `<strong>Langfristige Preisuntergrenze für „${e.p1}":</strong><br>` +
      `Bedingung: BE = 0 → Deckungsbeitrag = Fixkosten = ${fmt(fixKosten)} €<br>` +
      `NVE = variable Kosten gesamt + Fixkosten = ${fmt(gesamtVK1)} + ${fmt(fixKosten)} = ${fmt(nve1)} €<br>` +
      `<strong>NVP = NVE ÷ Menge = ${fmt(nve1)} ÷ ${fmtInt(menge1)} = <span style="color:#1a56a0;">${preisText(nvp1_exakt, pr1)}</span></strong>` +
    `</div>`;

  container.innerHTML =
    `<h2 style="${S.h2output}">Aufgabe – Langfristige Preisuntergrenze</h2>` +
    `<div style="${S.aufgabenBox}">` +
      `<p style="margin-bottom:8px;">Das Unternehmen <strong>„${e.unternehmen}"</strong> stellt ${e.erzArt} her. ` +
      `Für das <strong>${quartal}</strong> liegen Ihnen folgende Zahlen vor:</p>` +
      aufgabeTabelle +
    `</div>` +
    `<p style="margin-bottom:6px;"><strong>Aufgabe</strong><br>Berechnen Sie die langfristige Preisuntergrenze für „${e.p1}".</p>` +
    `<div style="margin-top:28px;">` +
    `<h2 style="${S.h2output}">Lösung</h2>` +
    loesungsTabelle +
    ergebnisZeile +
    `<div style="${S.rechenweg}">` +
      `<strong>Rechenweg:</strong> ` +
      `VK gesamt: ${fmtInt(menge1)} × ${fmt(vk1)} = ${fmt(gesamtVK1)} € &nbsp;|&nbsp; ` +
      `NVE = ${fmt(gesamtVK1)} + ${fmt(fixKosten)} = ${fmt(nve1)} € &nbsp;|&nbsp; ` +
      `NVP = ${fmt(nve1)} ÷ ${fmtInt(menge1)} = <strong>${preisText(nvp1_exakt, pr1)}</strong>` +
    `</div>` +
    `</div>`;
}

// ============================================================================
// VARIANTE 3A – NETTOVERKAUFSERLÖSE (Zweiprodukt)
// ============================================================================

function generiereNettoverkaufserloes() {
  const e = leseEingaben();

  const gesuchterIstP1 = Math.random() < 0.5;
  const prG = gesuchterIstP1 ? e.pr1 : e.pr2;   // gesuchtes Produkt
  const prB = gesuchterIstP1 ? e.pr2 : e.pr1;   // bekanntes Produkt

  const { nvp: nvpB, vk: vkB } = erzeugePreisPaar(prB);
  const mengeB    = zufallsMenge(prB);
  const nveB      = nvpB * mengeB;
  const gesamtVKB = vkB * mengeB;
  const dbB       = nveB - gesamtVKB;

  const mengeG = zufallsMenge(prG);
  let vkG, fixKosten, gewinn, gesamtDB, dbG, gesamtVKG, nveG, nvpG;

  if (e.yamlAktiv) {
    // Gesamt-DB so wählen, dass der gesuchte NVP in der Preisspanne des Produkts liegt
    const nvpZiel = Math.max(zufallsNvp(prG), 0);
    vkG = zufallsVk(prG, nvpZiel);
    const gesamtDBZiel = dbB + Math.max(nvpZiel - vkG, 1) * mengeG;
    const step = e.fixStep;
    gewinn    = Math.max(step, rundeAuf(gesamtDBZiel * (0.08 + Math.random() * 0.22), step));
    fixKosten = Math.max(step, rundeAuf(gesamtDBZiel - gewinn, step));
  } else {
    vkG       = randInt(Math.min(e.vkMin, e.vkMax), Math.max(e.vkMin, e.vkMax));
    fixKosten = randInt(Math.min(e.fixMin, e.fixMax), Math.max(e.fixMin, e.fixMax), e.fixStep);
    const fixStep = parseInt(getVal('fixRunden')) || 1000;
    gewinn    = randInt(fixStep, Math.max(fixStep, Math.round(Math.max(fixKosten, fixStep) * 0.4)), fixStep);
  }

  gesamtDB  = gewinn + fixKosten;
  dbG       = gesamtDB - dbB;
  gesamtVKG = vkG * mengeG;
  nveG      = dbG + gesamtVKG;
  nvpG      = nveG / mengeG;

  //~flo Manueller Zweig: Liegt dbB über der Summe aus Gewinn + Fixkosten,
  // fehlt die Differenz in den Fixkosten (sonst wäre dbG ≤ 0 und die Aufgabe
  // unsinnig). Fixkosten deutlich anheben, sodass dbG > 0 wird – dadurch
  // entfällt die unbeschränkte Neuaufruf-Rekursion.
  if (dbG <= 0) {
    const fehlt = (dbB - gesamtDB) + Math.max(1000, e.fixStep || 1000);
    fixKosten += fehlt;
    gesamtDB  = gewinn + fixKosten;
    dbG       = gesamtDB - dbB;
    nveG      = dbG + gesamtVKG;
    nvpG      = nveG / mengeG;
  }

  if (dbG <= 0 || nvpG <= vkG) {
    //~flo letzter Fallback ohne Selbstaufruf
    gewinn     = Math.max(gewinn, 1000);
    fixKosten  = dbB + 1000 + Math.max(gewinn, 1000);
    gesamtDB   = gewinn + fixKosten;
    dbG        = gesamtDB - dbB;
    nveG       = dbG + gesamtVKG;
    nvpG       = nveG / mengeG;
  }

  const p1 = e.p1;
  const p2 = e.p2;
  const pGes = gesuchterIstP1 ? p1 : p2;
  const pBek = gesuchterIstP1 ? p2 : p1;

  const nvp1   = gesuchterIstP1 ? null  : nvpB;
  const nvp2   = gesuchterIstP1 ? nvpB  : null;
  const vk1    = gesuchterIstP1 ? vkG   : vkB;
  const vk2    = gesuchterIstP1 ? vkB   : vkG;
  const menge1 = gesuchterIstP1 ? mengeG : mengeB;
  const menge2 = gesuchterIstP1 ? mengeB : mengeG;

  const nve1_loes  = gesuchterIstP1 ? nveG : nveB;
  const nve2_loes  = gesuchterIstP1 ? nveB : nveG;
  const gVK1_loes  = gesuchterIstP1 ? gesamtVKG : gesamtVKB;
  const gVK2_loes  = gesuchterIstP1 ? gesamtVKB : gesamtVKG;
  const db1_loes   = gesuchterIstP1 ? dbG : dbB;
  const db2_loes   = gesuchterIstP1 ? dbB : dbG;

  const quartal = zufallsQuartal();
  const container = document.getElementById('Container');
  if (!container) return;

  const aufgabeTabelle =
    `<table style="${S.tableNarrow}">` +
      `<thead><tr>` +
        `<th style="${S.thL}">Modell</th>` +
        `<th style="${S.thR}">„${p1}"</th>` +
        `<th style="${S.thR}">„${p2}"</th>` +
      `</tr></thead>` +
      `<tbody>` +
        `<tr>` +
          `<td style="${S.tdL}">${labelNvp(e.pr1, e.pr2)}</td>` +
          `<td style="${gesuchterIstP1 ? S.tdGesuchtR : S.tdR}">${nvp1 !== null ? preisText(nvp1, e.pr1) : '<strong>?</strong>'}</td>` +
          `<td style="${gesuchterIstP1 ? S.tdR : S.tdGesuchtR}">${nvp2 !== null ? preisText(nvp2, e.pr2) : '<strong>?</strong>'}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL2}">${labelVk(e.pr1, e.pr2)}</td>` +
          `<td style="${S.tdR2}">${preisText(vk1, e.pr1)}</td>` +
          `<td style="${S.tdR2}">${preisText(vk2, e.pr2)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL}">Produktion ≙ Absatz</td>` +
          `<td style="${S.tdR}">${mengeText(menge1, e.pr1)}</td>` +
          `<td style="${S.tdR}">${mengeText(menge2, e.pr2)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td colspan="3" style="${S.tdL}">Fixkosten gesamt: ${fmt(fixKosten)} €</td>` +
        `</tr>` +
        `<tr>` +
          `<td colspan="3" style="${S.tdL}">Betriebsergebnis (Gewinn): ${fmt(gewinn)} €</td>` +
        `</tr>` +
      `</tbody>` +
    `</table>`;

  const loesungsTabelle =
    `<table style="${S.table}">` +
      `<thead><tr>` +
        `<th style="${S.thL}"></th>` +
        `<th style="${S.thR}">Modell „${p1}"<br><span style="font-weight:400; font-size:0.85em;">(${mengeText(menge1, e.pr1)})<br>in €</span></th>` +
        `<th style="${S.thR}">Modell „${p2}"<br><span style="font-weight:400; font-size:0.85em;">(${mengeText(menge2, e.pr2)})<br>in €</span></th>` +
        `<th style="${S.thR}">gesamt<br><span style="font-weight:400; font-size:0.85em;">in €</span></th>` +
      `</tr></thead>` +
      `<tbody>` +
        `<tr>` +
          `<td style="${S.tdL}">Nettoverkaufserlöse</td>` +
          `<td style="${gesuchterIstP1 ? S.tdGesuchtR : S.tdR}">${fmt(nve1_loes)}</td>` +
          `<td style="${gesuchterIstP1 ? S.tdR : S.tdGesuchtR}">${fmt(nve2_loes)}</td>` +
          `<td style="${S.tdR}"></td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL2}"><span style="color:#555; font-size:0.85rem;">–</span> variable Kosten</td>` +
          `<td style="${S.tdR2}">${fmt(gVK1_loes)}</td>` +
          `<td style="${S.tdR2}">${fmt(gVK2_loes)}</td>` +
          `<td style="${S.tdR2}"></td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdDbL}">Deckungsbeitrag</td>` +
          `<td style="${S.tdDbR}">${fmt(db1_loes)}</td>` +
          `<td style="${S.tdDbR}">${fmt(db2_loes)}</td>` +
          `<td style="${S.tdDbR}">${fmt(gesamtDB)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdFkL}"><span style="font-size:0.85rem;">–</span> Fixkosten</td>` +
          `<td style="${S.tdFkR}"></td>` +
          `<td style="${S.tdFkR}"></td>` +
          `<td style="${S.tdFkR}">${fmt(fixKosten)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdBeL}"><strong>Betriebsergebnis (Gewinn)</strong></td>` +
          `<td style="${S.tdBeR}"></td>` +
          `<td style="${S.tdBeR}"></td>` +
          `<td style="${S.tdBeR} color:#2a7a2a; font-weight:700;"><strong>${fmt(gewinn)}</strong></td>` +
        `</tr>` +
      `</tbody>` +
    `</table>`;

  const ergebnisZeile =
    `<div style="margin-top:14px; padding:10px 14px; background:#e8f0fe; border:1px solid #b0c4ef; border-radius:5px; font-size:0.97em;">` +
      `<strong>Nettoverkaufspreis ${istStueck(prG) ? 'pro Stück' : 'pro Einheit'} für „${pGes}":</strong><br>` +
      `NVE<sub>${pGes}</sub> = ${fmt(nveG)} €<br>` +
      `<strong>NVP<sub>${pGes}</sub> = NVE<sub>${pGes}</sub> ÷ Menge = ${fmt(nveG)} ÷ ${fmtInt(mengeG)} = <span style="color:#1a56a0;">${preisText(nvpG, prG)}</span></strong>` +
    `</div>`;

  const rechenwegText =
    `NVE ${pBek}: ${fmtInt(mengeB)} × ${fmt(nvpB)} = ${fmt(nveB)} € &nbsp;|&nbsp; ` +
    `VK ${pBek}: ${fmtInt(mengeB)} × ${fmt(vkB)} = ${fmt(gesamtVKB)} € &nbsp;|&nbsp; ` +
    `DB ${pBek}: ${fmt(nveB)} − ${fmt(gesamtVKB)} = ${fmt(dbB)} € &nbsp;|&nbsp; ` +
    `Gesamt-DB: ${fmt(gewinn)} + ${fmt(fixKosten)} = ${fmt(gesamtDB)} € &nbsp;|&nbsp; ` +
    `DB ${pGes}: ${fmt(gesamtDB)} − ${fmt(dbB)} = ${fmt(dbG)} € &nbsp;|&nbsp; ` +
    `VK ${pGes}: ${fmtInt(mengeG)} × ${fmt(vkG)} = ${fmt(gesamtVKG)} € &nbsp;|&nbsp; ` +
    `NVE ${pGes}: ${fmt(dbG)} + ${fmt(gesamtVKG)} = ${fmt(nveG)} € &nbsp;|&nbsp; ` +
    `NVP ${pGes}: ${fmt(nveG)} ÷ ${fmtInt(mengeG)} = <strong>${preisText(nvpG, prG)}</strong>`;

  container.innerHTML =
    `<h2 style="${S.h2output}">Aufgabe – Nettoverkaufserlöse</h2>` +
    `<div style="${S.aufgabenBox}">` +
      `<p style="margin-bottom:8px;">Das Unternehmen <strong>„${e.unternehmen}"</strong> stellt ${e.erzArt} her. ` +
      `Für das <strong>${quartal}</strong> liegen Ihnen folgende Zahlen vor:</p>` +
      aufgabeTabelle +
    `</div>` +
    `<p style="margin-bottom:6px;"><strong>Aufgabe</strong><br>Berechnen Sie die Nettoverkaufserlöse sowie den Nettoverkaufspreis ${istStueck(prG) ? 'pro Stück' : 'pro Einheit'} für „${pGes}".</p>` +
    `<div style="margin-top:28px;">` +
    `<h2 style="${S.h2output}">Lösung</h2>` +
    loesungsTabelle +
    ergebnisZeile +
    `<div style="${S.rechenweg}">` +
      `<strong>Rechenweg:</strong> ` + rechenwegText +
    `</div>` +
    `</div>`;
}

// ============================================================================
// VARIANTE 3B – NETTOVERKAUFSERLÖSE (Einprodukt)
// Gewinn gegeben, NVP gesucht. Nur ein Produkt.
// NVE = VKg + DB; DB = Gewinn + Fixkosten; NVP = NVE / Menge
// ============================================================================

function generiereNettoverkaufserloes1P() {
  const e = leseEingaben();
  const pr1 = e.pr1;

  const menge1 = zufallsMenge(pr1);
  let vk1, fixKosten, gewinn, gesamtVK1, db1, nve1, nvp1;
  if (e.yamlAktiv) {
    const nvpZiel = zufallsNvp(pr1);
    vk1 = zufallsVk(pr1, nvpZiel);
    const dbZiel = Math.max(nvpZiel - vk1, 1) * menge1;
    const step = e.fixStep;
    gewinn    = Math.max(step, rundeAuf(dbZiel * (0.10 + Math.random() * 0.25), step));
    fixKosten = Math.max(step, rundeAuf(dbZiel - gewinn, step));
  } else {
    vk1       = randInt(e.vkMin, e.vkMax);
    fixKosten = randInt(e.fixMin, e.fixMax, e.fixStep);
    const fixStep = parseInt(getVal('fixRunden')) || 1000;
    gewinn    = randInt(fixStep, Math.max(fixStep, Math.round(Math.max(fixKosten, fixStep) * 0.4)), fixStep);
  }

  gesamtVK1 = vk1 * menge1;
  db1       = gewinn + fixKosten;
  nve1      = db1 + gesamtVK1;
  nvp1      = nve1 / menge1;

  //~flo Manueller Zweig: Sicherheitshaltung statt unbeschränkter
  // Neuaufruf-Rekursion – Laufzeitinvariante: db1 = gewinn + fix > 0 ⇒
  // nvp1 = vk1 + db1/menge > vk1 (mathematisch garantiert).
  if (nvp1 <= vk1 || db1 <= 0) {
    gewinn     = Math.max(gewinn, 1000);
    fixKosten  = Math.max(fixKosten, gewinn + 1000);
    gesamtVK1  = vk1 * menge1;
    db1        = gewinn + fixKosten;
    nve1       = db1 + gesamtVK1;
    nvp1       = nve1 / menge1;
  }

  const quartal   = zufallsQuartal();
  const container = document.getElementById('Container');
  if (!container) return;

  const aufgabeTabelle =
    `<table style="${S.tableNarrow}">` +
      `<thead><tr>` +
        `<th style="${S.thL}">Modell</th>` +
        `<th style="${S.thR}">„${e.p1}"</th>` +
      `</tr></thead>` +
      `<tbody>` +
        `<tr>` +
          `<td style="${S.tdL}">${labelNvp(pr1)}</td>` +
          `<td style="${S.tdGesuchtR}"><strong>?</strong></td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL2}">${labelVk(pr1)}</td>` +
          `<td style="${S.tdR2}">${preisText(vk1, pr1)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL}">Produktion ≙ Absatz</td>` +
          `<td style="${S.tdR}">${mengeText(menge1, pr1)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td colspan="2" style="${S.tdL}">Fixkosten gesamt: ${fmt(fixKosten)} €</td>` +
        `</tr>` +
        `<tr>` +
          `<td colspan="2" style="${S.tdL}">Betriebsergebnis (Gewinn): ${fmt(gewinn)} €</td>` +
        `</tr>` +
      `</tbody>` +
    `</table>`;

  const loesungsTabelle =
    `<table style="${S.table}">` +
      `<thead><tr>` +
        `<th style="${S.thL}"></th>` +
        `<th style="${S.thR}">Modell „${e.p1}"<br><span style="font-weight:400; font-size:0.85em;">(${mengeText(menge1, pr1)})<br>in €</span></th>` +
      `</tr></thead>` +
      `<tbody>` +
        `<tr>` +
          `<td style="${S.tdL}">Nettoverkaufserlöse</td>` +
          `<td style="${S.tdGesuchtR}">${fmt(nve1)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL2}"><span style="color:#555; font-size:0.85rem;">–</span> variable Kosten</td>` +
          `<td style="${S.tdR2}">${fmt(gesamtVK1)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdDbL}">Deckungsbeitrag</td>` +
          `<td style="${S.tdDbR}">${fmt(db1)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdFkL}"><span style="font-size:0.85rem;">–</span> Fixkosten</td>` +
          `<td style="${S.tdFkR}">${fmt(fixKosten)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdBeL}"><strong>Betriebsergebnis (Gewinn)</strong></td>` +
          `<td style="${S.tdBeR} color:#2a7a2a; font-weight:700;"><strong>${fmt(gewinn)}</strong></td>` +
        `</tr>` +
      `</tbody>` +
    `</table>`;

  const ergebnisZeile =
    `<div style="margin-top:14px; padding:10px 14px; background:#e8f0fe; border:1px solid #b0c4ef; border-radius:5px; font-size:0.97em;">` +
      `<strong>Nettoverkaufspreis ${istStueck(pr1) ? 'pro Stück' : 'pro Einheit'} für „${e.p1}":</strong><br>` +
      `DB = Gewinn + Fixkosten = ${fmt(gewinn)} + ${fmt(fixKosten)} = ${fmt(db1)} €<br>` +
      `NVE = DB + variable Kosten gesamt = ${fmt(db1)} + ${fmt(gesamtVK1)} = ${fmt(nve1)} €<br>` +
      `<strong>NVP = NVE ÷ Menge = ${fmt(nve1)} ÷ ${fmtInt(menge1)} = <span style="color:#1a56a0;">${preisText(nvp1, pr1)}</span></strong>` +
    `</div>`;

  container.innerHTML =
    `<h2 style="${S.h2output}">Aufgabe – Nettoverkaufserlöse</h2>` +
    `<div style="${S.aufgabenBox}">` +
      `<p style="margin-bottom:8px;">Das Unternehmen <strong>„${e.unternehmen}"</strong> stellt ${e.erzArt} her. ` +
      `Für das <strong>${quartal}</strong> liegen Ihnen folgende Zahlen vor:</p>` +
      aufgabeTabelle +
    `</div>` +
    `<p style="margin-bottom:6px;"><strong>Aufgabe</strong><br>Berechnen Sie die Nettoverkaufserlöse sowie den Nettoverkaufspreis ${istStueck(pr1) ? 'pro Stück' : 'pro Einheit'} für „${e.p1}".</p>` +
    `<div style="margin-top:28px;">` +
    `<h2 style="${S.h2output}">Lösung</h2>` +
    loesungsTabelle +
    ergebnisZeile +
    `<div style="${S.rechenweg}">` +
      `<strong>Rechenweg:</strong> ` +
      `DB = ${fmt(gewinn)} + ${fmt(fixKosten)} = ${fmt(db1)} € &nbsp;|&nbsp; ` +
      `VK gesamt: ${fmtInt(menge1)} × ${fmt(vk1)} = ${fmt(gesamtVK1)} € &nbsp;|&nbsp; ` +
      `NVE = ${fmt(db1)} + ${fmt(gesamtVK1)} = ${fmt(nve1)} € &nbsp;|&nbsp; ` +
      `NVP = ${fmt(nve1)} ÷ ${fmtInt(menge1)} = <strong>${preisText(nvp1, pr1)}</strong>` +
    `</div>` +
    `</div>`;
}

// ============================================================================
// VARIANTE 4A – FIXKOSTEN (Zweiprodukt)
// ============================================================================

function generiereFixkosten() {
  const e = leseEingaben();

  const { nvp: nvp1, vk: vk1 } = erzeugePreisPaar(e.pr1);
  const { nvp: nvp2, vk: vk2 } = erzeugePreisPaar(e.pr2);

  const menge1    = zufallsMenge(e.pr1);
  const menge2    = zufallsMenge(e.pr2);

  const nve1      = nvp1 * menge1;
  const nve2      = nvp2 * menge2;
  const gesamtVK1 = vk1 * menge1;
  const gesamtVK2 = vk2 * menge2;
  const db1       = nve1 - gesamtVK1;
  const db2       = nve2 - gesamtVK2;
  const gesamtDB  = db1 + db2;

  const fixStep   = e.fixStep;
  const beMin     = rundeAuf(-Math.round(gesamtDB * 0.3), fixStep);
  const beMax     = rundeAuf( Math.round(gesamtDB * 0.4), fixStep);
  const be        = randInt(beMin, beMax, fixStep);
  const fixKosten = gesamtDB - be;

  const istGewinn = be >= 0;
  const beLabel   = istGewinn ? 'Gewinn' : 'Verlust';
  const beColor   = istGewinn ? '#2a7a2a' : '#a00';

  const quartal   = zufallsQuartal();
  const container = document.getElementById('Container');
  if (!container) return;

  const aufgabeTabelle =
    `<table style="${S.tableNarrow}">` +
      `<thead><tr>` +
        `<th style="${S.thL}">Modell</th>` +
        `<th style="${S.thR}">„${e.p1}"</th>` +
        `<th style="${S.thR}">„${e.p2}"</th>` +
      `</tr></thead>` +
      `<tbody>` +
        `<tr>` +
          `<td style="${S.tdL}">${labelNvp(e.pr1, e.pr2)}</td>` +
          `<td style="${S.tdR}">${preisText(nvp1, e.pr1)}</td>` +
          `<td style="${S.tdR}">${preisText(nvp2, e.pr2)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL2}">${labelVk(e.pr1, e.pr2)}</td>` +
          `<td style="${S.tdR2}">${preisText(vk1, e.pr1)}</td>` +
          `<td style="${S.tdR2}">${preisText(vk2, e.pr2)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL}">Produktion ≙ Absatz</td>` +
          `<td style="${S.tdR}">${mengeText(menge1, e.pr1)}</td>` +
          `<td style="${S.tdR}">${mengeText(menge2, e.pr2)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL}">Fixkosten gesamt</td>` +
          `<td colspan="2" style="${S.tdGesuchtR}"><strong>?</strong></td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL}">Betriebsergebnis (${beLabel})</td>` +
          `<td colspan="2" style="${S.tdR}">${fmt(be)} €</td>` +
        `</tr>` +
      `</tbody>` +
    `</table>`;

  const loesungsTabelle =
    `<table style="${S.table}">` +
      `<thead><tr>` +
        `<th style="${S.thL}"></th>` +
        `<th style="${S.thR}">Modell „${e.p1}"<br><span style="font-weight:400; font-size:0.85em;">(${mengeText(menge1, e.pr1)})<br>in €</span></th>` +
        `<th style="${S.thR}">Modell „${e.p2}"<br><span style="font-weight:400; font-size:0.85em;">(${mengeText(menge2, e.pr2)})<br>in €</span></th>` +
        `<th style="${S.thR}">gesamt<br><span style="font-weight:400; font-size:0.85em;">in €</span></th>` +
      `</tr></thead>` +
      `<tbody>` +
        `<tr>` +
          `<td style="${S.tdL}">Nettoverkaufserlöse</td>` +
          `<td style="${S.tdR}">${fmt(nve1)}</td>` +
          `<td style="${S.tdR}">${fmt(nve2)}</td>` +
          `<td style="${S.tdR}"></td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL2}"><span style="color:#555; font-size:0.85rem;">–</span> variable Kosten</td>` +
          `<td style="${S.tdR2}">${fmt(gesamtVK1)}</td>` +
          `<td style="${S.tdR2}">${fmt(gesamtVK2)}</td>` +
          `<td style="${S.tdR2}"></td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdDbL}">Deckungsbeitrag</td>` +
          `<td style="${S.tdDbR}">${fmt(db1)}</td>` +
          `<td style="${S.tdDbR}">${fmt(db2)}</td>` +
          `<td style="${S.tdDbR}">${fmt(gesamtDB)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdFkL}"><span style="font-size:0.85rem;">–</span> Fixkosten</td>` +
          `<td style="${S.tdFkR}"></td>` +
          `<td style="${S.tdFkR}"></td>` +
          `<td style="${S.tdGesuchtR}">${fmt(fixKosten)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdBeL}"><strong>Betriebsergebnis (${beLabel})</strong></td>` +
          `<td style="${S.tdBeR}"></td>` +
          `<td style="${S.tdBeR}"></td>` +
          `<td style="${S.tdBeR} color:${beColor}; font-weight:700;"><strong>${fmt(be)}</strong></td>` +
        `</tr>` +
      `</tbody>` +
    `</table>`;

  const rechenwegText =
    `NVE ${e.p1}: ${fmtInt(menge1)} × ${fmt(nvp1)} = ${fmt(nve1)} € &nbsp;|&nbsp; ` +
    `NVE ${e.p2}: ${fmtInt(menge2)} × ${fmt(nvp2)} = ${fmt(nve2)} € &nbsp;|&nbsp; ` +
    `VK ${e.p1}: ${fmtInt(menge1)} × ${fmt(vk1)} = ${fmt(gesamtVK1)} € &nbsp;|&nbsp; ` +
    `VK ${e.p2}: ${fmtInt(menge2)} × ${fmt(vk2)} = ${fmt(gesamtVK2)} € &nbsp;|&nbsp; ` +
    `DB gesamt: ${fmt(db1)} + ${fmt(db2)} = ${fmt(gesamtDB)} € &nbsp;|&nbsp; ` +
    `Fixkosten: ${fmt(gesamtDB)} − ${fmt(be)} = <strong>${fmt(fixKosten)} €</strong>`;

  container.innerHTML =
    `<h2 style="${S.h2output}">Aufgabe – Fixkosten</h2>` +
    `<div style="${S.aufgabenBox}">` +
      `<p style="margin-bottom:8px;">Das Unternehmen <strong>„${e.unternehmen}"</strong> stellt ${e.erzArt} her. ` +
      `Für das <strong>${quartal}</strong> liegen Ihnen folgende Zahlen vor:</p>` +
      aufgabeTabelle +
    `</div>` +
    `<p style="margin-bottom:6px;"><strong>Aufgabe</strong><br>Berechnen Sie die Fixkosten des Unternehmens.</p>` +
    `<div style="margin-top:28px;">` +
    `<h2 style="${S.h2output}">Lösung</h2>` +
    loesungsTabelle +
    `<div style="${S.rechenweg}">` +
      `<strong>Rechenweg:</strong> ` + rechenwegText +
    `</div>` +
    `</div>`;
}

// ============================================================================
// VARIANTE 4B – FIXKOSTEN (Einprodukt)
// ============================================================================

function generiereFixkosten1P() {
  const e = leseEingaben();
  const pr1 = e.pr1;

  const { nvp: nvp1, vk: vk1 } = erzeugePreisPaar(pr1);
  const menge1    = zufallsMenge(pr1);

  const nve1      = nvp1 * menge1;
  const gesamtVK1 = vk1 * menge1;
  const db1       = nve1 - gesamtVK1;

  const fixStep   = e.fixStep;
  const beMin     = rundeAuf(-Math.round(db1 * 0.3), fixStep);
  const beMax     = rundeAuf( Math.round(db1 * 0.4), fixStep);
  const be        = randInt(beMin, beMax, fixStep);
  const fixKosten = db1 - be;

  const istGewinn = be >= 0;
  const beLabel   = istGewinn ? 'Gewinn' : 'Verlust';
  const beColor   = istGewinn ? '#2a7a2a' : '#a00';

  const quartal   = zufallsQuartal();
  const container = document.getElementById('Container');
  if (!container) return;

  const aufgabeTabelle =
    `<table style="${S.tableNarrow}">` +
      `<thead><tr>` +
        `<th style="${S.thL}">Modell</th>` +
        `<th style="${S.thR}">„${e.p1}"</th>` +
      `</tr></thead>` +
      `<tbody>` +
        `<tr>` +
          `<td style="${S.tdL}">${labelNvp(pr1)}</td>` +
          `<td style="${S.tdR}">${preisText(nvp1, pr1)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL2}">${labelVk(pr1)}</td>` +
          `<td style="${S.tdR2}">${preisText(vk1, pr1)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL}">Produktion ≙ Absatz</td>` +
          `<td style="${S.tdR}">${mengeText(menge1, pr1)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL}">Fixkosten gesamt</td>` +
          `<td style="${S.tdGesuchtR}"><strong>?</strong></td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL}">Betriebsergebnis (${beLabel})</td>` +
          `<td style="${S.tdR}">${fmt(be)} €</td>` +
        `</tr>` +
      `</tbody>` +
    `</table>`;

  const loesungsTabelle =
    `<table style="${S.table}">` +
      `<thead><tr>` +
        `<th style="${S.thL}"></th>` +
        `<th style="${S.thR}">Modell „${e.p1}"<br><span style="font-weight:400; font-size:0.85em;">(${mengeText(menge1, pr1)})<br>in €</span></th>` +
      `</tr></thead>` +
      `<tbody>` +
        `<tr>` +
          `<td style="${S.tdL}">Nettoverkaufserlöse</td>` +
          `<td style="${S.tdR}">${fmt(nve1)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL2}"><span style="color:#555; font-size:0.85rem;">–</span> variable Kosten</td>` +
          `<td style="${S.tdR2}">${fmt(gesamtVK1)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdDbL}">Deckungsbeitrag</td>` +
          `<td style="${S.tdDbR}">${fmt(db1)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdFkL}"><span style="font-size:0.85rem;">–</span> Fixkosten</td>` +
          `<td style="${S.tdGesuchtR}">${fmt(fixKosten)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdBeL}"><strong>Betriebsergebnis (${beLabel})</strong></td>` +
          `<td style="${S.tdBeR} color:${beColor}; font-weight:700;"><strong>${fmt(be)}</strong></td>` +
        `</tr>` +
      `</tbody>` +
    `</table>`;

  container.innerHTML =
    `<h2 style="${S.h2output}">Aufgabe – Fixkosten</h2>` +
    `<div style="${S.aufgabenBox}">` +
      `<p style="margin-bottom:8px;">Das Unternehmen <strong>„${e.unternehmen}"</strong> stellt ${e.erzArt} her. ` +
      `Für das <strong>${quartal}</strong> liegen Ihnen folgende Zahlen vor:</p>` +
      aufgabeTabelle +
    `</div>` +
    `<p style="margin-bottom:6px;"><strong>Aufgabe</strong><br>Berechnen Sie die Fixkosten des Unternehmens.</p>` +
    `<div style="margin-top:28px;">` +
    `<h2 style="${S.h2output}">Lösung</h2>` +
    loesungsTabelle +
    `<div style="${S.rechenweg}">` +
      `<strong>Rechenweg:</strong> ` +
      `NVE: ${fmtInt(menge1)} × ${fmt(nvp1)} = ${fmt(nve1)} € &nbsp;|&nbsp; ` +
      `VK: ${fmtInt(menge1)} × ${fmt(vk1)} = ${fmt(gesamtVK1)} € &nbsp;|&nbsp; ` +
      `DB: ${fmt(nve1)} − ${fmt(gesamtVK1)} = ${fmt(db1)} € &nbsp;|&nbsp; ` +
      `Fixkosten: ${fmt(db1)} − ${fmt(be)} = <strong>${fmt(fixKosten)} €</strong>` +
    `</div>` +
    `</div>`;
}

// ============================================================================
// VARIANTE 5A – ZUSATZAUFTRAG (Zweiprodukt)
// ============================================================================

function generiereZusatzauftrag() {
  const e = leseEingaben();

  const { nvp: nvp1, vk: vk1 } = erzeugePreisPaar(e.pr1);
  const { nvp: nvp2, vk: vk2 } = erzeugePreisPaar(e.pr2);
  const menge1    = zufallsMenge(e.pr1);
  const menge2    = zufallsMenge(e.pr2);

  const nve1      = nvp1 * menge1;
  const nve2      = nvp2 * menge2;
  const gesamtVK1 = vk1 * menge1;
  const gesamtVK2 = vk2 * menge2;
  const db1       = nve1 - gesamtVK1;
  const db2       = nve2 - gesamtVK2;
  const gesamtDB  = db1 + db2;

  const fixKosten = fixkostenAusDb(e, gesamtDB);
  const be        = gesamtDB - fixKosten;
  const istGewinn = be >= 0;

  const zusatzIstP1 = Math.random() < 0.5;
  const prZ      = zusatzIstP1 ? e.pr1 : e.pr2;
  const prAndere = zusatzIstP1 ? e.pr2 : e.pr1;
  const pZ       = zusatzIstP1 ? e.p1 : e.p2;
  const nvpZ     = zusatzIstP1 ? nvp1 : nvp2;
  const vkZ      = zusatzIstP1 ? vk1  : vk2;
  const dbNormal = nvpZ - vkZ;

  const mengeZ_normal = zusatzIstP1 ? menge1 : menge2;
  const mengeZ = zufallsZusatzmenge(e, prZ, mengeZ_normal);

  const sollAblehnenDB = Math.random() < 0.25;
  let rabattPct, nvpZrabatt, dbZStk;

  if (sollAblehnenDB) {
    const minRabatt = Math.ceil((dbNormal / nvpZ) * 100 / 5) * 5 + 5;
    const maxRabatt = Math.min(minRabatt + 20, 60);
    rabattPct  = maxRabatt >= minRabatt ? randInt(minRabatt, maxRabatt, 5) : minRabatt;
    nvpZrabatt = Math.round(nvpZ * (1 - rabattPct / 100) * 100) / 100;
    dbZStk     = Math.round((nvpZrabatt - vkZ) * 100) / 100;
  } else {
    const maxSichererRabatt = Math.floor((dbNormal / nvpZ) * 100 / 5) * 5 - 5;
    const rabattMax = Math.max(5, Math.min(maxSichererRabatt, 25));
    rabattPct  = randInt(5, rabattMax, 5);
    nvpZrabatt = Math.round(nvpZ * (1 - rabattPct / 100) * 100) / 100;
    dbZStk     = Math.round((nvpZrabatt - vkZ) * 100) / 100;
  }

  const nveZgesamt = Math.round(nvpZrabatt * mengeZ * 100) / 100;
  const gesamtVKZ  = vkZ * mengeZ;
  const dbZgesamt  = Math.round(dbZStk * mengeZ * 100) / 100;
  const annehmenDB = dbZStk > 0;

  const knappeKapazitaet = Math.random() < 0.30;

  let kapazitaet1, kapazitaet2, kapazitaetFreiZ, kapazitaetReicht;
  const stepZ = prZ.mengeStep;
  const kap_andere = Math.ceil((zusatzIstP1 ? menge2 : menge1) * 1.15 / prAndere.mengeStep) * prAndere.mengeStep;

  if (knappeKapazitaet) {
    const maxFreiKnapp = Math.max(0, mengeZ - stepZ);
    const freiKnapp    = randInt(0, maxFreiKnapp, stepZ);
    const kapZ_knapp   = mengeZ_normal + freiKnapp;
    kapazitaet1        = zusatzIstP1 ? kapZ_knapp : kap_andere;
    kapazitaet2        = zusatzIstP1 ? kap_andere : kapZ_knapp;
    kapazitaetFreiZ    = freiKnapp;
    kapazitaetReicht   = false;
  } else {
    const freiAusreichend = randInt(mengeZ, mengeZ + Math.round(prZ.mengeMax / 4), stepZ);
    const kapZ_gut        = mengeZ_normal + freiAusreichend;
    kapazitaet1           = zusatzIstP1 ? kapZ_gut   : kap_andere;
    kapazitaet2           = zusatzIstP1 ? kap_andere : kapZ_gut;
    kapazitaetFreiZ       = freiAusreichend;
    kapazitaetReicht      = true;
  }

  const annehmenFinal = kapazitaetReicht && annehmenDB;
  const kapFarbeFrei  = kapazitaetReicht ? '#2a7a2a' : '#a00';

  const quartal    = zufallsQuartal();
  const kundenarten = ['Ein Geschäftskunde', 'Ein Großhändler', 'Ein Neukunde', 'Ein langjähriger Kunde'];
  const kundeStr   = kundenarten[Math.floor(Math.random() * kundenarten.length)];

  const container = document.getElementById('Container');
  if (!container) return;

  const aufgabeTabelle =
    `<table style="${S.tableNarrow}">` +
      `<thead><tr>` +
        `<th style="${S.thL}">Modell</th>` +
        `<th style="${S.thR}">„${e.p1}"</th>` +
        `<th style="${S.thR}">„${e.p2}"</th>` +
      `</tr></thead>` +
      `<tbody>` +
        `<tr>` +
          `<td style="${S.tdL}">${labelNvp(e.pr1, e.pr2)}</td>` +
          `<td style="${S.tdR}">${preisText(nvp1, e.pr1)}</td>` +
          `<td style="${S.tdR}">${preisText(nvp2, e.pr2)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL2}">${labelVk(e.pr1, e.pr2)}</td>` +
          `<td style="${S.tdR2}">${preisText(vk1, e.pr1)}</td>` +
          `<td style="${S.tdR2}">${preisText(vk2, e.pr2)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL}">Produktion ≙ Absatz</td>` +
          `<td style="${S.tdR}">${mengeText(menge1, e.pr1)}</td>` +
          `<td style="${S.tdR}">${mengeText(menge2, e.pr2)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL2}">Produktionskapazität</td>` +
          `<td style="${S.tdR2}">${mengeText(kapazitaet1, e.pr1)}</td>` +
          `<td style="${S.tdR2}">${mengeText(kapazitaet2, e.pr2)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td colspan="3" style="${S.tdL}">Fixkosten gesamt: ${fmt(fixKosten)} €</td>` +
        `</tr>` +
      `</tbody>` +
    `</table>`;

  const gesamtDB_mit = gesamtDB + dbZgesamt;
  const be_mit       = gesamtDB_mit - fixKosten;
  const be_mit_color = be_mit >= 0 ? '#2a7a2a' : '#a00';

  const thZusNeu = `border:1px solid #aaa; padding:6px 10px; text-align:right; background:#fff8e1;`;
  const tdZusR   = `border:1px solid #aaa; padding:6px 10px; text-align:right; background:#fff8e1;`;
  const tdZusR2  = `border:1px solid #aaa; padding:6px 10px; text-align:right; background:#fffdf0;`;
  const tdZusDbR = `border:1px solid #aaa; border-top:2px solid #aaa; padding:6px 10px; text-align:right; background:#fff8e1; font-weight:600;`;
  const tdZusFkR = `border:1px solid #aaa; padding:6px 10px; text-align:right; background:#fff8e1; color:#aaa; font-size:0.85em;`;
  const tdZusBeR = `border:1px solid #aaa; border-top:2px solid #555; padding:6px 10px; text-align:right; background:#fff3cc; font-weight:700;`;

  const loesungsTabelle =
    `<table style="${S.table}">` +
      `<thead>` +
        `<tr>` +
          `<th style="${S.thL}" rowspan="2"></th>` +
          `<th style="${S.thR}">„${e.p1}"<br><span style="font-weight:400; font-size:0.85em;">(${mengeText(menge1, e.pr1, true)}) in €</span></th>` +
          `<th style="${S.thR}">„${e.p2}"<br><span style="font-weight:400; font-size:0.85em;">(${mengeText(menge2, e.pr2, true)}) in €</span></th>` +
          `<th style="${S.thR}">gesamt<br><span style="font-weight:400; font-size:0.85em;">in €</span></th>` +
          `<th style="${thZusNeu}">Zusatz „${pZ}"<br><span style="font-weight:400; font-size:0.85em;">(${mengeText(mengeZ, prZ, true)}) in €</span></th>` +
        `</tr>` +
        `<tr>` +
          `<th colspan="2" style="border:1px solid #aaa; padding:3px 10px; text-align:center; background:#eef2fa; font-size:0.82em; font-weight:600; color:#555;">Normalgeschäft</th>` +
          `<th style="border:1px solid #aaa; padding:3px 10px; text-align:center; background:#eef2fa; font-size:0.82em; font-weight:600; color:#555;">Normal</th>` +
          `<th style="${thZusNeu} font-size:0.82em; color:#b07000; text-align:center;">Zusatzauftrag</th>` +
        `</tr>` +
      `</thead>` +
      `<tbody>` +
        `<tr>` +
          `<td style="${S.tdL}">Nettoverkaufserlöse</td>` +
          `<td style="${S.tdR}">${fmt(nve1)}</td>` +
          `<td style="${S.tdR}">${fmt(nve2)}</td>` +
          `<td style="${S.tdR}"></td>` +
          `<td style="${tdZusR}">${fmt(nveZgesamt)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL2}"><span style="color:#555; font-size:0.85rem;">–</span> variable Kosten</td>` +
          `<td style="${S.tdR2}">${fmt(gesamtVK1)}</td>` +
          `<td style="${S.tdR2}">${fmt(gesamtVK2)}</td>` +
          `<td style="${S.tdR2}"></td>` +
          `<td style="${tdZusR2}">${fmt(gesamtVKZ)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdDbL}">Deckungsbeitrag</td>` +
          `<td style="${S.tdDbR}">${fmt(db1)}</td>` +
          `<td style="${S.tdDbR}">${fmt(db2)}</td>` +
          `<td style="${S.tdDbR}">${fmt(gesamtDB)}</td>` +
          `<td style="${tdZusDbR} color:${annehmenDB ? '#2a7a2a' : '#a00'};">${fmt(dbZgesamt)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdFkL}"><span style="font-size:0.85rem;">–</span> Fixkosten</td>` +
          `<td style="${S.tdFkR}"></td>` +
          `<td style="${S.tdFkR}"></td>` +
          `<td style="${S.tdFkR}">${fmt(fixKosten)}</td>` +
          `<td style="${tdZusFkR}">–</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdBeL}"><strong>Betriebsergebnis (${istGewinn ? 'Gewinn' : 'Verlust'})</strong></td>` +
          `<td style="${S.tdBeR}"></td>` +
          `<td style="${S.tdBeR}"></td>` +
          `<td style="${S.tdBeR} font-weight:700; color:${istGewinn ? '#2a7a2a' : '#a00'};"><strong>${fmt(be)}</strong></td>` +
          `<td style="${tdZusBeR} color:${be_mit_color};"><strong>${fmt(be_mit)}</strong></td>` +
        `</tr>` +
      `</tbody>` +
    `</table>`;

  const kapazitaetBox = _kapazitaetBox(pZ, zusatzIstP1 ? kapazitaet1 : kapazitaet2, mengeZ_normal, kapazitaetFreiZ, mengeZ, kapFarbeFrei, kapazitaetReicht, prZ);
  const entscheidungsBox = _entscheidungsBox(pZ, kapazitaetFreiZ, mengeZ, dbZStk, annehmenDB, annehmenFinal, kapazitaetReicht, prZ);

  const rechenwegText =
    `Freie Kap. „${pZ}": ${fmtInt(zusatzIstP1 ? kapazitaet1 : kapazitaet2)} − ${fmtInt(mengeZ_normal)} = ${mengeText(kapazitaetFreiZ, prZ)} ` +
    `(${kapazitaetReicht ? '≥' : '<'} ${mengeText(mengeZ, prZ)} → ${kapazitaetReicht ? 'reicht' : 'reicht nicht'}) &nbsp;|&nbsp; ` +
    (kapazitaetReicht
      ? `NVP Zusatz: ${fmt(nvpZ)} × ${100 - rabattPct} % = ${fmt(nvpZrabatt)} € &nbsp;|&nbsp; ` +
        `DB/${istStueck(prZ) ? 'Stk.' : prZ.einheit}: ${fmt(nvpZrabatt)} − ${fmt(vkZ)} = ${fmt(dbZStk)} € &nbsp;|&nbsp; ` +
        `DB gesamt: ${fmtInt(mengeZ)} × ${fmt(dbZStk)} = ${fmt(dbZgesamt)} € &nbsp;|&nbsp; ` +
        `→ <strong>${annehmenFinal ? 'annehmen' : 'ablehnen'}</strong>`
      : `→ <strong>ablehnen (keine Kapazität)</strong>`);

  container.innerHTML =
    `<h2 style="${S.h2output}">Aufgabe – Zusatzauftrag</h2>` +
    `<div style="${S.aufgabenBox}">` +
      `<p style="margin-bottom:8px;">Das Unternehmen <strong>„${e.unternehmen}"</strong> stellt ${e.erzArt} her. ` +
      `Für das <strong>${quartal}</strong> liegen Ihnen folgende Zahlen vor:</p>` +
      aufgabeTabelle +
      `<br><p><strong>Aufgabe</strong></p>` +
      `<ol>` +
        `<li>Ermitteln Sie rechnerisch Art und Höhe des gesamten Betriebsergebnisses.</li>` +
        `<li>${kundeStr} wäre bereit, ${mengeZusatzText(mengeZ, prZ)} von „${pZ}" zu einem Rabatt von ${rabattPct} % abzunehmen. ` +
        `Begründen Sie rechnerisch, ob das Unternehmen den Zusatzauftrag annehmen soll.</li>` +
      `</ol>` +
    `</div>` +
    `<div style="margin-top:28px;">` +
    `<h2 style="${S.h2output}">Lösung</h2>` +
    loesungsTabelle +
    kapazitaetBox +
    entscheidungsBox +
    `<div style="${S.rechenweg}">` +
      `<strong>Rechenweg:</strong> ` + rechenwegText +
    `</div>` +
    `</div>`;
}

// ============================================================================
// VARIANTE 5B – ZUSATZAUFTRAG (Einprodukt)
// ============================================================================

function generiereZusatzauftrag1P() {
  const e = leseEingaben();
  const pr1 = e.pr1;

  const { nvp: nvp1, vk: vk1 } = erzeugePreisPaar(pr1);
  const menge1    = zufallsMenge(pr1);

  const nve1      = nvp1 * menge1;
  const gesamtVK1 = vk1 * menge1;
  const db1       = nve1 - gesamtVK1;

  const fixKosten = fixkostenAusDb(e, db1);
  const be        = db1 - fixKosten;
  const istGewinn = be >= 0;

  const dbNormal = nvp1 - vk1;

  const mengeZ = zufallsZusatzmenge(e, pr1, menge1);

  const sollAblehnenDB = Math.random() < 0.25;
  let rabattPct, nvpZrabatt, dbZStk;

  if (sollAblehnenDB) {
    const minRabatt = Math.ceil((dbNormal / nvp1) * 100 / 5) * 5 + 5;
    const maxRabatt = Math.min(minRabatt + 20, 60);
    rabattPct  = maxRabatt >= minRabatt ? randInt(minRabatt, maxRabatt, 5) : minRabatt;
    nvpZrabatt = Math.round(nvp1 * (1 - rabattPct / 100) * 100) / 100;
    dbZStk     = Math.round((nvpZrabatt - vk1) * 100) / 100;
  } else {
    const maxSichererRabatt = Math.floor((dbNormal / nvp1) * 100 / 5) * 5 - 5;
    const rabattMax = Math.max(5, Math.min(maxSichererRabatt, 25));
    rabattPct  = randInt(5, rabattMax, 5);
    nvpZrabatt = Math.round(nvp1 * (1 - rabattPct / 100) * 100) / 100;
    dbZStk     = Math.round((nvpZrabatt - vk1) * 100) / 100;
  }

  const nveZgesamt = Math.round(nvpZrabatt * mengeZ * 100) / 100;
  const gesamtVKZ  = vk1 * mengeZ;
  const dbZgesamt  = Math.round(dbZStk * mengeZ * 100) / 100;
  const annehmenDB = dbZStk > 0;

  // Kapazität
  const stepZ = pr1.mengeStep;
  const knappeKapazitaet = Math.random() < 0.30;
  let kapazitaet1, kapazitaetFreiZ, kapazitaetReicht;

  if (knappeKapazitaet) {
    const maxFreiKnapp = Math.max(0, mengeZ - stepZ);
    kapazitaetFreiZ  = randInt(0, maxFreiKnapp, stepZ);
    kapazitaet1      = menge1 + kapazitaetFreiZ;
    kapazitaetReicht = false;
  } else {
    kapazitaetFreiZ  = randInt(mengeZ, mengeZ + Math.round(pr1.mengeMax / 4), stepZ);
    kapazitaet1      = menge1 + kapazitaetFreiZ;
    kapazitaetReicht = true;
  }

  const annehmenFinal = kapazitaetReicht && annehmenDB;
  const kapFarbeFrei  = kapazitaetReicht ? '#2a7a2a' : '#a00';

  const quartal    = zufallsQuartal();
  const kundenarten = ['Ein Geschäftskunde', 'Ein Großhändler', 'Ein Neukunde', 'Ein langjähriger Kunde'];
  const kundeStr   = kundenarten[Math.floor(Math.random() * kundenarten.length)];

  const container = document.getElementById('Container');
  if (!container) return;

  const aufgabeTabelle =
    `<table style="${S.tableNarrow}">` +
      `<thead><tr>` +
        `<th style="${S.thL}">Modell</th>` +
        `<th style="${S.thR}">„${e.p1}"</th>` +
      `</tr></thead>` +
      `<tbody>` +
        `<tr>` +
          `<td style="${S.tdL}">${labelNvp(pr1)}</td>` +
          `<td style="${S.tdR}">${preisText(nvp1, pr1)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL2}">${labelVk(pr1)}</td>` +
          `<td style="${S.tdR2}">${preisText(vk1, pr1)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL}">Produktion ≙ Absatz</td>` +
          `<td style="${S.tdR}">${mengeText(menge1, pr1)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL2}">Produktionskapazität</td>` +
          `<td style="${S.tdR2}">${mengeText(kapazitaet1, pr1)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td colspan="2" style="${S.tdL}">Fixkosten gesamt: ${fmt(fixKosten)} €</td>` +
        `</tr>` +
      `</tbody>` +
    `</table>`;

  // Lösungstabelle: Normal + Zusatzspalte (2 Spalten)
  const thZusNeu = `border:1px solid #aaa; padding:6px 10px; text-align:right; background:#fff8e1;`;
  const tdZusR   = `border:1px solid #aaa; padding:6px 10px; text-align:right; background:#fff8e1;`;
  const tdZusR2  = `border:1px solid #aaa; padding:6px 10px; text-align:right; background:#fffdf0;`;
  const tdZusDbR = `border:1px solid #aaa; border-top:2px solid #aaa; padding:6px 10px; text-align:right; background:#fff8e1; font-weight:600;`;
  const tdZusFkR = `border:1px solid #aaa; padding:6px 10px; text-align:right; background:#fff8e1; color:#aaa; font-size:0.85em;`;
  const tdZusBeR = `border:1px solid #aaa; border-top:2px solid #555; padding:6px 10px; text-align:right; background:#fff3cc; font-weight:700;`;

  const be_mit       = be + dbZgesamt;
  const be_mit_color = be_mit >= 0 ? '#2a7a2a' : '#a00';

  const loesungsTabelle =
    `<table style="${S.table}">` +
      `<thead>` +
        `<tr>` +
          `<th style="${S.thL}" rowspan="2"></th>` +
          `<th style="${S.thR}">„${e.p1}"<br><span style="font-weight:400; font-size:0.85em;">(${mengeText(menge1, pr1, true)}) in €</span></th>` +
          `<th style="${thZusNeu}">Zusatz „${e.p1}"<br><span style="font-weight:400; font-size:0.85em;">(${mengeText(mengeZ, pr1, true)}) in €</span></th>` +
        `</tr>` +
        `<tr>` +
          `<th style="border:1px solid #aaa; padding:3px 10px; text-align:center; background:#eef2fa; font-size:0.82em; font-weight:600; color:#555;">Normalgeschäft</th>` +
          `<th style="${thZusNeu} font-size:0.82em; color:#b07000; text-align:center;">Zusatzauftrag</th>` +
        `</tr>` +
      `</thead>` +
      `<tbody>` +
        `<tr>` +
          `<td style="${S.tdL}">Nettoverkaufserlöse</td>` +
          `<td style="${S.tdR}">${fmt(nve1)}</td>` +
          `<td style="${tdZusR}">${fmt(nveZgesamt)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL2}"><span style="color:#555; font-size:0.85rem;">–</span> variable Kosten</td>` +
          `<td style="${S.tdR2}">${fmt(gesamtVK1)}</td>` +
          `<td style="${tdZusR2}">${fmt(gesamtVKZ)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdDbL}">Deckungsbeitrag</td>` +
          `<td style="${S.tdDbR}">${fmt(db1)}</td>` +
          `<td style="${tdZusDbR} color:${annehmenDB ? '#2a7a2a' : '#a00'};">${fmt(dbZgesamt)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdFkL}"><span style="font-size:0.85rem;">–</span> Fixkosten</td>` +
          `<td style="${S.tdFkR}">${fmt(fixKosten)}</td>` +
          `<td style="${tdZusFkR}">–</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdBeL}"><strong>Betriebsergebnis (${istGewinn ? 'Gewinn' : 'Verlust'})</strong></td>` +
          `<td style="${S.tdBeR} font-weight:700; color:${istGewinn ? '#2a7a2a' : '#a00'};"><strong>${fmt(be)}</strong></td>` +
          `<td style="${tdZusBeR} color:${be_mit_color};"><strong>${fmt(be_mit)}</strong></td>` +
        `</tr>` +
      `</tbody>` +
    `</table>`;

  const kapazitaetBox = _kapazitaetBox(e.p1, kapazitaet1, menge1, kapazitaetFreiZ, mengeZ, kapFarbeFrei, kapazitaetReicht, pr1);
  const entscheidungsBox = _entscheidungsBox(e.p1, kapazitaetFreiZ, mengeZ, dbZStk, annehmenDB, annehmenFinal, kapazitaetReicht, pr1);

  const rechenwegText =
    `Freie Kap.: ${fmtInt(kapazitaet1)} − ${fmtInt(menge1)} = ${mengeText(kapazitaetFreiZ, pr1)} ` +
    `(${kapazitaetReicht ? '≥' : '<'} ${mengeText(mengeZ, pr1)} → ${kapazitaetReicht ? 'reicht' : 'reicht nicht'}) &nbsp;|&nbsp; ` +
    (kapazitaetReicht
      ? `NVP Zusatz: ${fmt(nvp1)} × ${100 - rabattPct} % = ${fmt(nvpZrabatt)} € &nbsp;|&nbsp; ` +
        `DB/${istStueck(pr1) ? 'Stk.' : pr1.einheit}: ${fmt(nvpZrabatt)} − ${fmt(vk1)} = ${fmt(dbZStk)} € &nbsp;|&nbsp; ` +
        `DB gesamt: ${fmtInt(mengeZ)} × ${fmt(dbZStk)} = ${fmt(dbZgesamt)} € &nbsp;|&nbsp; ` +
        `→ <strong>${annehmenFinal ? 'annehmen' : 'ablehnen'}</strong>`
      : `→ <strong>ablehnen (keine Kapazität)</strong>`);

  container.innerHTML =
    `<h2 style="${S.h2output}">Aufgabe – Zusatzauftrag</h2>` +
    `<div style="${S.aufgabenBox}">` +
      `<p style="margin-bottom:8px;">Das Unternehmen <strong>„${e.unternehmen}"</strong> stellt ${e.erzArt} her. ` +
      `Für das <strong>${quartal}</strong> liegen Ihnen folgende Zahlen vor:</p>` +
      aufgabeTabelle +
      `<br><p><strong>Aufgabe</strong></p>` +
      `<ol>` +
        `<li>Ermitteln Sie rechnerisch Art und Höhe des Betriebsergebnisses.</li>` +
        `<li>${kundeStr} wäre bereit, ${mengeZusatzText(mengeZ, pr1)} von „${e.p1}" zu einem Rabatt von ${rabattPct} % abzunehmen. ` +
        `Begründen Sie rechnerisch, ob das Unternehmen den Zusatzauftrag annehmen soll.</li>` +
      `</ol>` +
    `</div>` +
    `<div style="margin-top:28px;">` +
    `<h2 style="${S.h2output}">Lösung</h2>` +
    loesungsTabelle +
    kapazitaetBox +
    entscheidungsBox +
    `<div style="${S.rechenweg}">` +
      `<strong>Rechenweg:</strong> ` + rechenwegText +
    `</div>` +
    `</div>`;
}

// ── Gemeinsame Box-Helfer für Zusatzauftrag ──────────────────────────────────

function _kapazitaetBox(pZ, kapGesamt, mengeNormal, kapFrei, mengeZ, kapFarbe, reicht, pr) {
  return `<div style="margin-top:14px; padding:10px 14px; background:#f5f7fa; border:1px solid #ccc; border-radius:5px; font-size:0.93em;">` +
    `<strong>Schritt 1 – Kapazitätsprüfung „${pZ}":</strong><br>` +
    `Kapazität: ${mengeText(kapGesamt, pr)} &nbsp;−&nbsp; ` +
    `Produktion: ${mengeText(mengeNormal, pr)} = ` +
    `<strong style="color:${kapFarbe};">freie Kapazität: ${mengeText(kapFrei, pr)}</strong><br>` +
    `Benötigt: <strong>${mengeText(mengeZ, pr)}</strong> → ` +
    `<strong style="color:${kapFarbe};">${reicht ? 'Kapazität reicht aus ✅' : 'Kapazität reicht NICHT aus ❌'}</strong>` +
  `</div>`;
}

function _entscheidungsBox(pZ, kapFrei, mengeZ, dbZStk, annehmenDB, annehmenFinal, kapReicht, pr) {
  let kapBegr, dbBegr, entscheidText, entscheidColor;
  const einheitKurz = istStueck(pr) ? 'Stk.' : pr.einheit;

  if (!kapReicht) {
    kapBegr       = `Die freie Kapazität für „${pZ}" beträgt nur ${mengeText(kapFrei, pr)} – der Zusatzauftrag über ${mengeText(mengeZ, pr)} <strong>kann nicht produziert werden</strong>.`;
    dbBegr        = `(DB/${einheitKurz} wäre ${fmt(dbZStk)} € – rechnerisch ${annehmenDB ? 'positiv' : 'negativ'}, aber irrelevant da keine Kapazität.)`;
    entscheidText = `Der Zusatzauftrag <strong>muss abgelehnt werden</strong>, da die Kapazität für „${pZ}" nicht ausreicht (frei: ${mengeText(kapFrei, pr)}, benötigt: ${mengeText(mengeZ, pr)}).`;
    entscheidColor = '#a00';
  } else if (!annehmenDB) {
    kapBegr       = `Die freie Kapazität für „${pZ}" beträgt ${mengeText(kapFrei, pr)} – der Zusatzauftrag über ${mengeText(mengeZ, pr)} <strong>kann produziert werden</strong>. ✅`;
    dbBegr        = `Dennoch ist der Deckungsbeitrag pro ${istStueck(pr) ? 'Stück' : 'Einheit'} negativ (${fmt(dbZStk)} €) – das Unternehmen würde je Einheit einen Verlust erleiden.`;
    entscheidText = `Der Zusatzauftrag <strong>soll abgelehnt werden</strong>: Zwar reicht die Kapazität, aber der Deckungsbeitrag pro ${istStueck(pr) ? 'Stück' : 'Einheit'} ist negativ (${fmt(dbZStk)} €).`;
    entscheidColor = '#a00';
  } else {
    kapBegr       = `Die freie Kapazität für „${pZ}" beträgt ${mengeText(kapFrei, pr)} – der Zusatzauftrag über ${mengeText(mengeZ, pr)} <strong>kann produziert werden</strong>. ✅`;
    dbBegr        = `Der Deckungsbeitrag pro ${istStueck(pr) ? 'Stück' : 'Einheit'} ist positiv (${fmt(dbZStk)} €). Da die Fixkosten bereits gedeckt sind, verbessert jeder positive DB das Betriebsergebnis.`;
    entscheidText = `Der Zusatzauftrag <strong>soll angenommen werden</strong>: Kapazität reicht aus und der Deckungsbeitrag pro ${istStueck(pr) ? 'Stück' : 'Einheit'} ist positiv (${fmt(dbZStk)} €).`;
    entscheidColor = '#2a7a2a';
  }

  return `<div style="margin-top:10px; padding:10px 14px; border:2px solid ${entscheidColor}; border-radius:5px; background:${annehmenFinal ? '#f0fff0' : '#fff0f0'}; font-size:0.97em;">` +
    `<strong style="color:${entscheidColor};">Schritt 2 – Deckungsbeitragsanalyse:</strong><br>` +
    `${kapBegr}<br>` +
    `${dbBegr}<br><br>` +
    `<strong style="color:${entscheidColor};">Entscheidung: ${entscheidText}</strong>` +
  `</div>`;
}

// ============================================================================
// HILFSFUNKTIONEN (Quartal, Tabellen-Helfer für Zweiprodukt)
// ============================================================================

function zufallsQuartal() {
  const quartale = ['1. Quartal', '2. Quartal', '3. Quartal', '4. Quartal'];
  return quartale[Math.floor(Math.random() * 4)];
}

function datentabelle(pr1, pr2, nvp1, nvp2, vk1, vk2, menge1, menge2, fixKosten) {
  return `<table style="${S.tableNarrow}">` +
    `<thead><tr>` +
      `<th style="${S.thL}">Modell</th>` +
      `<th style="${S.thR}">„${pr1.name}"</th>` +
      `<th style="${S.thR}">„${pr2.name}"</th>` +
    `</tr></thead>` +
    `<tbody>` +
      `<tr>` +
        `<td style="${S.tdL}">${labelNvp(pr1, pr2)}</td>` +
        `<td style="${S.tdR}">${preisText(nvp1, pr1)}</td>` +
        `<td style="${S.tdR}">${preisText(nvp2, pr2)}</td>` +
      `</tr>` +
      `<tr>` +
        `<td style="${S.tdL2}">${labelVk(pr1, pr2)}</td>` +
        `<td style="${S.tdR2}">${preisText(vk1, pr1)}</td>` +
        `<td style="${S.tdR2}">${preisText(vk2, pr2)}</td>` +
      `</tr>` +
      `<tr>` +
        `<td style="${S.tdL}">Produktion ≙ Absatz</td>` +
        `<td style="${S.tdR}">${mengeText(menge1, pr1)}</td>` +
        `<td style="${S.tdR}">${mengeText(menge2, pr2)}</td>` +
      `</tr>` +
      `<tr>` +
        `<td colspan="3" style="${S.tdL}">Fixkosten gesamt: ${fmt(fixKosten)} €</td>` +
      `</tr>` +
    `</tbody>` +
  `</table>`;
}

function loesungsSchema(pr1, pr2, menge1, menge2, nve1, nve2, gVK1, gVK2, db1, db2, gesamtDB, fixKosten, beLabel, beWert, beWertGesamt) {
  return `<table style="${S.table}">` +
    `<thead><tr>` +
      `<th style="${S.thL}"></th>` +
      `<th style="${S.thR}">Modell „${pr1.name}"<br><span style="font-weight:400; font-size:0.85em;">(${mengeText(menge1, pr1)})<br>in €</span></th>` +
      `<th style="${S.thR}">Modell „${pr2.name}"<br><span style="font-weight:400; font-size:0.85em;">(${mengeText(menge2, pr2)})<br>in €</span></th>` +
      `<th style="${S.thR}">gesamt<br><span style="font-weight:400; font-size:0.85em;">in €</span></th>` +
    `</tr></thead>` +
    `<tbody>` +
      `<tr>` +
        `<td style="${S.tdL}">Nettoverkaufserlöse</td>` +
        `<td style="${S.tdR}">${fmt(nve1)}</td>` +
        `<td style="${S.tdR}">${fmt(nve2)}</td>` +
        `<td style="${S.tdR}"></td>` +
      `</tr>` +
      `<tr>` +
        `<td style="${S.tdL2}"><span style="color:#555; font-size:0.85rem;">–</span> variable Kosten</td>` +
        `<td style="${S.tdR2}">${fmt(gVK1)}</td>` +
        `<td style="${S.tdR2}">${fmt(gVK2)}</td>` +
        `<td style="${S.tdR2}"></td>` +
      `</tr>` +
      `<tr>` +
        `<td style="${S.tdDbL}">Deckungsbeitrag</td>` +
        `<td style="${S.tdDbR}">${fmt(db1)}</td>` +
        `<td style="${S.tdDbR}">${fmt(db2)}</td>` +
        `<td style="${S.tdDbR}">${fmt(gesamtDB)}</td>` +
      `</tr>` +
      `<tr>` +
        `<td style="${S.tdFkL}"><span style="font-size:0.85rem;">–</span> Fixkosten</td>` +
        `<td style="${S.tdFkR}"></td>` +
        `<td style="${S.tdFkR}"></td>` +
        `<td style="${S.tdFkR}">${fmt(fixKosten)}</td>` +
      `</tr>` +
      `<tr>` +
        `<td style="${S.tdBeL}">${beLabel}</td>` +
        `<td style="${S.tdBeR}"></td>` +
        `<td style="${S.tdBeR}"></td>` +
        `<td style="${S.tdBeR}">${beWert}</td>` +
      `</tr>` +
    `</tbody>` +
  `</table>`;
}

// ============================================================================
// KI-ASSISTENT PROMPT
// ============================================================================

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher, geduldiger Lernbegleiter für Schülerinnen und Schüler der Realschule im Fach BwR (Betriebswirtschaftslehre mit Rechnungswesen).
Dein Thema: Teilkostenrechnung (Deckungsbeitragsrechnung).

Sprich die Schülerinnen und Schüler immer mit „du" an. Bleibe stets ermutigend und auf Augenhöhe.

═══════════════════════════════════════════
DEINE ROLLE
═══════════════════════════════════════════
Du gibst KEINE fertigen Lösungen, Zwischenergebnisse oder Zahlen vor – auch nicht auf Nachfrage.
Stattdessen führst du durch gezielte Rückfragen Schritt für Schritt zur richtigen Lösung.
Erst wenn ein Schritt korrekt beantwortet wurde, bestätigst du ihn und leitest zum nächsten über.
Ziel: Der Schüler erarbeitet die Lösung selbst – du bist der Lotse, nicht die Antwort.

═══════════════════════════════════════════
GRUNDSCHEMA DER TEILKOSTENRECHNUNG
═══════════════════════════════════════════
Für jedes Produkt einzeln:
  Nettoverkaufserlöse (NVE)     = Nettoverkaufspreis (NVP) × Menge
− variable Kosten gesamt (VKg)  = variable Kosten/Stk. × Menge
= Deckungsbeitrag (DB)

Dann gesamt:
  Gesamtdeckungsbeitrag         = DB Produkt 1 + DB Produkt 2
− Fixkosten (gesamt, nur einmal!)
= Betriebsergebnis (Gewinn / Verlust)

Merksatz für Schüler: „Die Fixkosten kommen EINMAL am Ende – nie je Produkt aufteilen!"

═══════════════════════════════════════════
DIE 5 AUFGABENVARIANTEN – LÖSUNGSWEGE
═══════════════════════════════════════════

1) BETRIEBSERGEBNIS
   Alles gegeben → NVE, VKg, DB je Produkt, Gesamt-DB, dann − Fixkosten = BE
   Typischer Fehler: Fixkosten auf Produkte aufteilen statt am Ende abziehen.

2) LANGFRISTIGE PREISUNTERGRENZE
   Bedingung: Betriebsergebnis = 0 → Gesamt-DB = Fixkosten
   Schritte:
   a) NVE und DB des bekannten Produkts berechnen
   b) Benötigter DB (gesuchtes Produkt) = Fixkosten − DB (bekanntes Produkt)
   c) NVE (gesuchtes Produkt) = VKg + benötigter DB
   d) NVP/Stk. = NVE ÷ Menge
   Typischer Fehler: BE vergessen auf 0 zu setzen; direkt mit NVP zu rechnen statt über DB.

3) NETTOVERKAUFSERLÖSE
   Betriebsergebnis (Gewinn) ist gegeben, NVP eines Produkts fehlt.
   Schritte:
   a) Gesamt-DB = Betriebsergebnis + Fixkosten
   b) DB bekanntes Produkt berechnen
   c) DB gesuchtes Produkt = Gesamt-DB − DB bekanntes Produkt
   d) NVE gesuchtes Produkt = VKg + DB gesuchtes Produkt
   e) NVP/Stk. = NVE ÷ Menge
   Typischer Fehler: Gesamt-DB nicht aus BE rückrechnen, sondern einfach schätzen.

4) FIXKOSTEN
   Alles gegeben inkl. Betriebsergebnis, Fixkosten fehlen.
   Schritte: NVE und DB je Produkt berechnen → Gesamt-DB → Fixkosten = Gesamt-DB − BE
   Typischer Fehler: Formel falsch umstellen (BE + Fixkosten = Gesamt-DB vergessen).

5) ZUSATZAUFTRAG
   Ein Kunde möchte eine Zusatzmenge zu einem rabattierten Preis abnehmen.
   Entscheidungsregel: Da Fixkosten bereits durch das Normalgeschäft gedeckt sind,
   reicht ein positiver Deckungsbeitrag pro Stück zur Annahme.
   Schritte:
   a) NVP Zusatz = NVP normal × (1 − Rabatt %)
   b) DB/Stk. Zusatz = NVP Zusatz − variable Kosten/Stk.
   c) DB gesamt Zusatz = DB/Stk. × Zusatzmenge
   d) Entscheidung: DB/Stk. > 0 → annehmen | DB/Stk. < 0 → ablehnen
   Typischer Fehler: Fixkosten nochmals abziehen (sie sind bereits gedeckt!);
   Entscheidung ohne Begründung durch DB/Stk.

═══════════════════════════════════════════
BEGRIFFE EINFACH ERKLÄRT
═══════════════════════════════════════════
- Nettoverkaufspreis: Preis ohne Mehrwertsteuer, den das Unternehmen je Stück bekommt.
- Variable Kosten: Steigen mit der Menge (z. B. Material, Fertigungslohn).
- Fixkosten: Bleiben gleich, egal wie viel produziert wird (z. B. Miete, Gehälter).
- Deckungsbeitrag: Was nach Abzug der variablen Kosten übrig bleibt – zur Deckung der Fixkosten.
- Langfristige Preisuntergrenze: Der Mindestpreis, bei dem das Unternehmen weder Gewinn noch Verlust macht (BE = 0).
- Zusatzauftrag: Ein Sonderauftrag, der extra zu normalen Aufträgen kommt – Fixkosten spielen hier keine Rolle mehr.
- Einheit: Statt „Stück" kann eine andere Mengeneinheit vorkommen (z. B. m², m, t, l). Dann gilt alles „pro Einheit" genauso wie „pro Stück".

═══════════════════════════════════════════
PÄDAGOGISCHER ANSATZ
═══════════════════════════════════════════
- Stelle nach jeder Schülerantwort eine gezielte Folgefrage zum nächsten Schritt.
- Bei einem Fehler: Erkläre das Prinzip dahinter, nenne aber nicht den richtigen Wert.
- Bei richtiger Antwort: Kurz bestätigen, dann direkt weiterleiten.
- Wenn ein Schüler feststeckt: Gib einen konkreten Denkanstoß (z. B. „Was weißt du über den Zusammenhang von Betriebsergebnis und Deckungsbeitrag?").
- Antwortlänge: Maximal 3 Sätze. Lieber kürzer. Gelegentlich Emojis 🎯🧮✅❓

═══════════════════════════════════════════
VERBOTEN
═══════════════════════════════════════════
- Keine konkreten Zahlen aus der Aufgabe als Lösung nennen.
- Kein „Die Antwort ist …" oder „Das Ergebnis lautet …".
- Auch bei wiederholtem Drängen keine Lösung verraten – freundlich standhaft bleiben.
- Keine langen Erklärungen am Stück – immer mit Rückfrage enden.
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

// ============================================================================
// INITIALISIERUNG
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  const kundeSelect = document.getElementById('tkKunde');

  if (kundeSelect && kundeSelect.value) {
    kunde = kundeSelect.value.trim();
  }

  document.addEventListener('change', (ev) => {
    if (ev.target && ev.target.id === 'tkKunde') {
      kunde = ev.target.value.trim() || '';
      nvpBereichManuell = false;      // Vorschlag für das neue Unternehmen neu befüllen
      vkFixBereichManuell = false;    // ebenso VK-/Fix-Bereiche
      aktualisiereYamlModus();
    }
  });

  // Checkbox "Produkte aus Unternehmensdaten verwenden"
  const yamlCheckbox = document.getElementById('nutzeYamlProdukte');
  if (yamlCheckbox) {
    yamlCheckbox.addEventListener('change', () => {
      nvpBereichManuell = false;      // beim Umschalten Vorschlag neu befüllen
      vkFixBereichManuell = false;    // ebenso VK-/Fix-Bereiche
      aktualisiereYamlModus();
    });
  }

  // NVP- und VK-/Fix-Zahlenbereiche: manuelle Eingabe merken
  // (sperrt die jeweilige YAML-Vorbelegung)
  ['nvpMin', 'nvpMax'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => { nvpBereichManuell = true; });
  });
  ['vkMin', 'vkMax', 'fixMin', 'fixMax'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => { vkFixBereichManuell = true; });
  });

  // Produktanzahl-Dropdown: UI-Reaktion + Auto-Generate
  const produktAnzahlSelect = document.getElementById('tkProduktAnzahl');
  if (produktAnzahlSelect) {
    produktAnzahlSelect.addEventListener('change', () => {
      onProduktAnzahlChange();
    });
    // Initialzustand setzen
    onProduktAnzahlChange();
  }

  // Dropdown befüllen → "Modellunternehmen" wählen → Info-Zeile + Aufgabe,
  // sobald die YAML-Daten tatsächlich geladen sind
  if (yamlData && yamlData.length > 0) {
    fillCompanyDropdowns();
    autoSelectMyCompany();
    aktualisiereYamlModus();
    generiereAufgabe();
  } else {
    document.addEventListener('yamlDataLoaded', () => {
      fillCompanyDropdowns();
      autoSelectMyCompany();
      aktualisiereYamlModus();
      generiereAufgabe();
    }, { once: true });
  }

  const vorschauEl = document.getElementById('kiPromptVorschau');
  if (vorschauEl) {
    vorschauEl.textContent = KI_ASSISTENT_PROMPT;
  }
});

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
    }
  });
}

// (Aufruf erfolgt jetzt event-basiert über 'yamlDataLoaded' im ersten DOMContentLoaded-Handler)