// js/utils.js
// Globale Hilfsfunktionen (reine Utilities, keine Geschäftslogik).
// Wird in allen Seiten eingebunden (nach js-yaml.min.js, vor den Seiten-Skripten).

// ============================================================================
// ZINS-ANKERWERT: HAUPTREFINANZIERUNGSSATZ (HRS)
// ============================================================================
// Zentraler Ankerwert für alle Zinsberechnungen auf der Website (EZB-
// Hauptrefinanzierungssatz, in % p. a.). HIER einfach anpassen:
//
//   HAUPTREFINANZIERUNGSSATZ = 2.4   <-- Standardwert ändern
//
// Nutzer-Override: Ein auf einer Seite geänderter Wert gilt NUR für die
// laufende Sitzung (Speicher, kein localStorage) und wird beim Neuladen
// wieder auf den Standard (HAUPTREFINANZIERUNGSSATZ) zurückgesetzt.
//
// Zinsformel (Faktor-Modell):  Nominalzins = HRS × Faktor
//   Unternehmenskredite, gute Bonität:  Faktor 1,5 bis 2,5
//   (bei HRS = 2,4 % ergibt das 3,6 % bis 6,0 %)
// Mindestnominalzinssatz (MINDEST_NOMINALZINS): Banken kalkulieren selbst bei
// sehr niedrigem Leitzins eine Mindestmarge – der Zinskorridor endet deshalb
// nie unterhalb dieses Werts. Bei HRS = 0 gilt: Korridor = Mindestzins
// bis Mindestzins × (Faktor-Obergrenze / Faktor-Untergrenze).
// ============================================================================
const HAUPTREFINANZIERUNGSSATZ = 2.4;                 // Standard-Ankerwert in % p. a.
const MINDEST_NOMINALZINS = 0.5;                      // Mindestzins in % p. a. – hier einfach anpassen
let hrsNutzerWert = null;                             // Sitzungs-Override (nicht persistent)
const HRS_STANDARDS = {
    // Faktoren (Kreditfaktor = Nominalzins / Hauptrefinanzierungssatz)
    'unternehmenskredit-gut': { min: 1.5, max: 2.5 }  // Unternehmenskredite, gute Bonität
};

// Gibt den aktuell gültigen Ankerwert zurück (Sitzungs-Override > Standard).
function getHauptrefinanzierungssatz() {
    if (hrsNutzerWert !== null && !isNaN(hrsNutzerWert) && hrsNutzerWert >= 0 && hrsNutzerWert <= 20) {
        return hrsNutzerWert;
    }
    return HAUPTREFINANZIERUNGSSATZ;
}

// Setzt den Ankerwert für diese Sitzung und informiert alle Seiten
// über das Event 'hrschange'. Ungültige Werte werden abgelehnt.
function setHauptrefinanzierungssatz(wert) {
    const v = parseFloat(wert);
    if (isNaN(v) || v < 0 || v > 20) return getHauptrefinanzierungssatz();
    hrsNutzerWert = v;
    document.dispatchEvent(new CustomEvent('hrschange', { detail: { satz: v } }));
    return v;
}

// Zinskorridor für eine Kreditart (Ankerwert × Faktor), auf 0,1 gerundet.
// art: z. B. 'unternehmenskredit-gut' (Standard, wenn frei gelassen)
// Der Korridor endet nie unterhalb des MINDEST_NOMINALZINS – bei kollabierender
// Formel (HRS ≈ 0) wird eine proportionale Restbreite im Faktorenverhältnis gehalten.
function zinsbereich(art) {
    const art_ = art || 'unternehmenskredit-gut';
    const faktor = HRS_STANDARDS[art_] || { min: 0, max: 0 };
    const h = getHauptrefinanzierungssatz();
    let min = h * faktor.min;
    let max = h * faktor.max;
    if (min < MINDEST_NOMINALZINS) {
        min = MINDEST_NOMINALZINS;
        // proportionale Restbreite (Faktor-Obergrenze / Faktor-Untergrenze),
        // damit auch am Boden des Ankerwerts zwei verschiedene Nominalzinsätze möglich sind
        const breite = (faktor.min > 0) ? (faktor.max / faktor.min) : 1;
        max = Math.max(max, MINDEST_NOMINALZINS * breite);
    }
    return {
        min: Math.round(min * 10) / 10,
        max: Math.round(max * 10) / 10
    };
}

// Zufälliger Zinssatz aus dem Korridor einer Kreditart (Schritte à 0,1 %).
function zufallsZinsWert(art) {
    const b = zinsbereich(art);
    const schritte = Math.max(0, Math.round((b.max - b.min) * 10));
    const zufallsschritt = Math.floor(Math.random() * (schritte + 1)); // ganze Zehntel-Schritte
    return Math.round((b.min + zufallsschritt / 10) * 10) / 10;
}

// Kurzname ohne Umlaut-Probleme:
function getHRS() { return getHauptrefinanzierungssatz(); }
function setHRS(wert) { return setHauptrefinanzierungssatz(wert); }

// Nutzer-Override entfernen → wieder der zentrale Standardwert.
function resetHauptrefinanzierungssatz() {
    hrsNutzerWert = null;
    document.dispatchEvent(new CustomEvent('hrschange', { detail: { satz: HAUPTREFINANZIERUNGSSATZ } }));
    return HAUPTREFINANZIERUNGSSATZ;
}

window.getHauptrefinanzierungssatz = getHauptrefinanzierungssatz;
window.setHauptrefinanzierungssatz = setHauptrefinanzierungssatz;
window.resetHauptrefinanzierungssatz = resetHauptrefinanzierungssatz;
window.zinsbereich = zinsbereich;
window.zufallsZinsWert = zufallsZinsWert;
window.getHRS = getHRS;
window.setHRS = setHRS;

// ============================================================================
// BEITRAGSBEMESSUNGSGRENZEN (BBG) – GESETZLICHE SOZIALVERSICHERUNG
// (aktuell gültiger Jahrgang: siehe jahr-Feld unten)
// ============================================================================
// Gesetzl. Kranken-/Pflegeversicherung und Renten-/Arbeitslosenversicherung:
// monatliche/jährliche Grenzen im Datensatz unten.
// GILT IMMER FÜR DEN IM jahr-FELD ANGEGEBENEN JAHRGANG – HIER einfach
// heruntertereis ersetzen, wenn das Bundesministerium neue Werte bekannt gibt.
// ============================================================================
const BEITRAGSBEMESSUNGSGRENZEN = {
    jahr: 2026,
    kvPvMonat: 5812.50,   // KV & PV, monatliche Grenze
    kvPvJahr: 69750.00,   // KV & PV, jährliche Grenze
    rvAvMonat: 8450.00,   // RV & ALV, monatliche Grenze (bundeseinheitlich)
    rvAvJahr: 101400.00   // RV & ALV, jährliche Grenze
};

// Allgemeine Bemessungsbasis: Beiträge werden nur bis zum Grenzbetrag berechnet.
function bbgBasis(brutto, grenze) {
    const b = parseFloat(brutto) || 0;
    return Math.min(Math.max(0, b), grenze);
}

// Bemessungsbasis Kranken-/Pflegeversicherung (monatlicher Lohn)
function bbgBasisKVPV(brutto) {
    return bbgBasis(brutto, BEITRAGSBEMESSUNGSGRENZEN.kvPvMonat);
}

// Bemessungsbasis Renten-/Arbeitslosenversicherung (monatlicher Lohn)
function bbgBasisRVALV(brutto) {
    return bbgBasis(brutto, BEITRAGSBEMESSUNGSGRENZEN.rvAvMonat);
}

window.BEITRAGSBEMESSUNGSGRENZEN = BEITRAGSBEMESSUNGSGRENZEN;
window.bbgBasis = bbgBasis;
window.bbgBasisKVPV = bbgBasisKVPV;
window.bbgBasisRVALV = bbgBasisRVALV;

// ============================================================================
// MINDESTAUSBILDUNGSVERGÜTUNG (aktuell gültiger Jahrgang: jahr-Feld unten)
// ============================================================================
// Gesetzliche Mindestausbildungsvergütung für Azubis in erfassten dualen
// Ausbildungsberufen (Ausbildungsbeginn im unten angegebenen Jahr) –
// monatliche Beträge je Ausbildungsjahr. HIER einfach ersetzen, sobald
// die Werte für Folgejahre bekannt werden (jahr-Feld mit anpassen!).
// ACHTUNG: Tarifvertragliche Regelungen und weitere gesetzliche Besonderheiten
// können dazu führen, dass die tatsächliche Vergütung HÖHER ausfällt – die
// Mindestsätze sind nur die absolute Untergrenze.
// ============================================================================
const MINDESTAUSBILDUNGSVERGUETUNG = {
    jahr: 2026,
    monatlich: { 1: 724.00, 2: 854.00, 3: 977.00, 4: 1014.00 } // je Ausbildungsjahr
};

// Mindestvergütung für ein Ausbildungsjahr in €/Monat; null, wenn unbekannt
function mindestAusbildungsverguetung(ausbildungsjahr) {
    const j = parseInt(ausbildungsjahr, 10);
    if (!isNaN(j) && MINDESTAUSBILDUNGSVERGUETUNG.monatlich[j] !== undefined) {
        return MINDESTAUSBILDUNGSVERGUETUNG.monatlich[j];
    }
    return null;
}

window.MINDESTAUSBILDUNGSVERGUETUNG = MINDESTAUSBILDUNGSVERGUETUNG;
window.mindestAusbildungsverguetung = mindestAusbildungsverguetung;

// ============================================================================
// KINDERFREIBETRÄGE (aktuell gültiger Jahrgang: jahr-Feld unten)
// ============================================================================
// Steuerliche Freibeträge für Kinder einschließlich des Freibetrags für
// Betreuung, Erziehung oder Ausbildung (BEA). Der Gesamt-Freibetrag pro Kind
// entfällt bei zusammen veranlagten Eltern je zur Hälfte auf beide Elternteile.
// HIER einfach ersetzen, sobald die Werte für Folgejahre bekannt werden
// (jahr-Feld mit anpassen!).
// ============================================================================
const KINDERFREIBETRAG = {
    jahr: 2026,
    einschlBeaEUR: 9756.00,   // pro Kind und Jahr (beide Elternteile zusammen)
    jeElternteilEUR: 4878.00  // pro Kind und Jahr, je Elternteil
};

window.KINDERFREIBETRAG = KINDERFREIBETRAG;

// ============================================================================
// FAMILIE – Sozialleistungen & familienbezogene Beträge
// ============================================================================
// ============================================================================
// Kindergeld pro Kind und Monat (aktueller Satz, Stand 2025/2026: 259,00 €)
const KINDERGELD = 259; // € pro Kind und Monat
window.KINDERGELD = KINDERGELD;

// ============================================================================
// STEUER – Umsatzsteuer (Mehrwertsteuer) Sätze
// ============================================================================
// HIER einfach anpassen, wenn sich die gesetzlichen Sätze ändern.
//   UST_REGEL        – Regelsatz (derzeit 19 %)
//   UST_ERMAESSIGT   – Ermäßigter Satz (derzeit 7 %, z. B. Lebensmittel, Bücher)
// ============================================================================
const UST_REGEL = 19;          // % Regelsatz
const UST_ERMAESSIGT = 7;      // % ermäßigter Satz
window.UST_REGEL = UST_REGEL;
window.UST_ERMAESSIGT = UST_ERMAESSIGT;

// ============================================================================
// EINKOMMENSTEUERTARIF (aktuell gültiger Jahrgang: jahr-Feld unten)
// ============================================================================
// Grundfreibetrag (Ledige) laut jahr-Feld; für Verheiratete gilt der doppelte
// Betrag (Splitting). Zwischen dem Eingangssteuersatz und dem Spitzensteuersatz
// greift die Progressionszone; darüber steht die Reichensteuer.
// Die Zonengrenzen sind vereinfacht (gerundet, Umlegung §32a EStG) –
// HIER einfach ersetzen, sobald der Tarif angepasst wird (jahr-Feld mit anpassen!).
// ============================================================================
const EINKOMMENSTEUERTARIF = {
    jahr: 2026,
    grundfreibetragLedig: 12348.00,       // Ledige
    grundfreibetragVerheiratet: 24696.00, // Splitting (doppeltes Grundfreibetrag)
    eingangssteuersatz: 14,               // %
    spitzensteuersatz: 42,                // %
    reichensteuersatz: 45,                // %
    // Grenzen (vereinfachte Tarifformel):
    zone1Bis: 17443.00,
    zone2Bis: 68480.00,
    proportionalBis: 277825.00
};

window.EINKOMMENSTEUERTARIF = EINKOMMENSTEUERTARIF;

// ============================================================================
// ZINS-ANKERWERT: BASISZINSSATZ (VERTRAGSSTRafe/BASISZINS § 247 BGB)
// ============================================================================
// Zentraler Ankerwert für Verzugszinsen auf der Website (EZB-Basiszinssatz,
// in % p. a.). HIER einfach anpassen, wenn sich der Satz ändert:
//
//   BASISZINSSATZ = 1.52   <-- Standardwert ändern (inklusive "seit"-Datum!
//   BASISZINSSATZ_SEIT = '01.07.2026'   unten mit anpassen)
//
// Nutzer-Override: Ein auf einer Seite geänderter Wert gilt NUR für die
// laufende Sitzung (Speicher, kein localStorage) und wird beim Neuladen
// wieder auf den Standard (BASISZINSSATZ) zurückgesetzt.
//
// Verzugszinsen nach § 288 BGB = Basiszinssatz + Aufschlag:
//   Verbrauchergeschäft (§ 288 Abs. 1 BGB):  Basiszinssatz + 5 Prozentpunkte
//   Entgeltforderungen B2B (§ 288 Abs. 2 BGB): Basiszinssatz + 9 Prozentpunkte
//   (bei Basiszinssatz 1,52 % → 6,52 % bzw. 10,52 % p. a.)
// STANDARD (Standardwert von verzugszinsSatz()): B2B = Basiszins + 9 pp.
// Zinsmethode: kaufmännische Zinsrechnung (Zinstage-Jahr mit 360 Tagen):
//   Zinsen = Betrag × Zinssatz × Tage / (360 × 100)
// ============================================================================
const BASISZINSSATZ = 1.52;                    // Standard-Ankerwert in % p. a. (seit 01.07.2026)
const BASISZINSSATZ_SEIT = '01.07.2026';       // Gültigkeitsbeginn des Standardwerts
const VERZUGSZAUSCHLAG_VERBRAUCHER = 5;        // Prozentpunkte (§ 288 Abs. 1 BGB)
const VERZUGSZAUSCHLAG_B2B = 9;                // Prozentpunkte (§ 288 Abs. 2 BGB)
let basiszinsNutzerWert = null;                // Sitzungs-Override (nicht persistent)

// Gibt den aktuell gültigen Basiszinssatz zurück (Sitzungs-Override > Standard).
function getBasiszinssatz() {
    if (basiszinsNutzerWert !== null && !isNaN(basiszinsNutzerWert) && basiszinsNutzerWert >= 0 && basiszinsNutzerWert <= 20) {
        return basiszinsNutzerWert;
    }
    return BASISZINSSATZ;
}

// Setzt den Basiszinssatz für diese Sitzung und informiert alle Seiten
// über das Event 'basiszinschange'. Ungültige Werte werden abgelehnt.
function setBasiszinssatz(wert) {
    const v = parseFloat(wert);
    if (isNaN(v) || v < 0 || v > 20) return getBasiszinssatz();
    basiszinsNutzerWert = v;
    document.dispatchEvent(new CustomEvent('basiszinschange', { detail: { satz: v } }));
    return v;
}

// Nutzer-Override entfernen → wieder der zentrale Standardwert.
function resetBasiszinssatz() {
    basiszinsNutzerWert = null;
    document.dispatchEvent(new CustomEvent('basiszinschange', { detail: { satz: BASISZINSSATZ } }));
    return BASISZINSSATZ;
}

// Verzugszinssatz nach § 288 BGB: 'verbraucher' → Basiszins + 5 pp,
// (Standard) 'unternehmen'/'b2b' → Basiszins + 9 pp (auf 0,01 gerundet).
function verzugszinsSatz(wer) {
    const aufschlag = (String(wer).toLowerCase() === 'verbraucher')
        ? VERZUGSZAUSCHLAG_VERBRAUCHER
        : VERZUGSZAUSCHLAG_B2B;
    return Math.round((getBasiszinssatz() + aufschlag) * 100) / 100;
}

// Kaufmännische Zinsrechnung (360-Tage-Jahr), auf 2 Nachkommastellen gerundet:
// Zinsen = Betrag × Zinssatz (in %) × Tage / (360 × 100)
function verzugszinsen(betrag, satz, tage) {
    const b = parseFloat(betrag) || 0;
    const s = parseFloat(satz) || 0;
    const t = Math.max(0, parseInt(tage, 10) || 0);
    return Math.round(b * s * t / (360 * 100) * 100) / 100;
}

// ============================================================================
// MAHNPAUSCHALE (§ 288 Abs. 3 BGB)
// ============================================================================
// Sobald ein Unternehmen mit einer Zahlung in Verzug gerät, kann der Gläubiger
// eine pauschale Unkostenvergütung von 40 € verlangen (Rechtsgeschäft
// Unternehmer ↔ natürliche Person, § 288 Abs. 3 BGB). Darüber hinausgehende,
// nachgewiesene Mahnkosten können zusätzlich geltend gemacht werden.
// HIER einfach anpassen, wenn sich der gesetzliche Pauschalbetrag ändert.
// ============================================================================
const MAHNPAUSCHALE = 40; // € je Mahnung
window.MAHNPAUSCHALE = MAHNPAUSCHALE;

window.BASISZINSSATZ = BASISZINSSATZ;
window.BASISZINSSATZ_SEIT = BASISZINSSATZ_SEIT;
window.MAHNPAUSCHALE = MAHNPAUSCHALE;
window.getBasiszinssatz = getBasiszinssatz;
window.setBasiszinssatz = setBasiszinssatz;
window.resetBasiszinssatz = resetBasiszinssatz;
window.verzugszinsSatz = verzugszinsSatz;
window.verzugszinsen = verzugszinsen;
window.getBasiszins = getBasiszinssatz;
window.setBasiszins = setBasiszinssatz;

// Währung nach DIN 5008 (z. B. "1.234,56 €")
function formatCurrency(value) {
    return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

// Betrag mit genau 2 Nachkommastellen (ohne Währungszeichen)
function formatBetrag(value) {
    return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Rundet auf 2 Dezimalstellen
function roundToTwoDecimals(num) {
    return Math.round(num * 100) / 100;
}

// Parst einen deutschen Zahlenstring (z. B. "1.234,56 €") in eine Number
function parseNumericValue(value) {
    if (!value) return '0';
    return value.toString()
        .replace(/[€\s]/g, '')
        .replace(/\./g, '')
        .replace(',', '.');
}

// Zufälliges Element aus einem Array
function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Fisher-Yates-Shuffle (liefert eine neue, gemischte Kopie)
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// Generische Eingabevalidierung (wiederverwendbar in allen Seiten)
function validateInput(el, opts) {
    opts = opts || {};
    if (!el) return true;
    const v = (el.value == null) ? '' : String(el.value);
    const trimmed = v.trim();
    if (opts.required && !trimmed) return false;
    if (opts.maxLen && v.length > opts.maxLen) return false;
    if (opts.minLen && v.length < opts.minLen) return false;
    if (el.type === 'number' || opts.numeric) {
        if (trimmed === '' && !opts.required) return true;
        const n = Number(trimmed.replace(',', '.'));
        if (isNaN(n)) return false;
        if (opts.min !== undefined && n < opts.min) return false;
        if (opts.max !== undefined && n > opts.max) return false;
    }
    if (opts.pattern && !new RegExp(opts.pattern).test(v)) return false;
    return true;
}
// Validiert eine Liste von {id, opts}-Einträgen; gibt false zurück, wenn einer ungültig ist.
function validateInputs(list) {
    for (const entry of (list || [])) {
        const el = document.getElementById(entry.id);
        if (!validateInput(el, entry.opts)) {
            if (entry.message) zeigeModal(entry.message, 'Eingabe überprüfen');
            try { el && el.focus(); } catch (e) {}
            return false;
        }
    }
    return true;
}
window.validateInput = validateInput;
window.validateInputs = validateInputs;

// Automatische Validierung aller Inputs auf Basis ihrer HTML-Attribute
// (min, max, maxlength, required, pattern) – läuft auf jeder Seite.
(function () {
    function pruefe(el) {
        if (!el || (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA')) return;
        const v = (el.value == null) ? '' : String(el.value);
        let ok = true;
        // badInput: Browser konnte den Text nicht als Zahl interpretieren
        // (z. B. Kommawerte in type="number" bei nicht-deutscher Locale, Buchstaben)
        if (el.validity && el.validity.badInput) {
            el.classList.toggle('input-invalid', true);
            el.title = 'Ungültige Eingabe';
            return true;
        }
        if (el.hasAttribute('required') && !v.trim()) ok = false;
        if (el.getAttribute('maxlength')) {
            const m = parseInt(el.getAttribute('maxlength'), 10);
            if (!isNaN(m) && v.length > m) ok = false;
        }
        if (el.getAttribute('minlength')) {
            const m = parseInt(el.getAttribute('minlength'), 10);
            if (!isNaN(m) && v.length < m && v.length > 0) ok = false;
        }
        if (el.type === 'number' || el.getAttribute('data-numeric') === '1') {
            if (v.trim() !== '') {
                const n = Number(v.replace(',', '.'));
                if (isNaN(n)) ok = false;
                const min = el.getAttribute('min');
                const max = el.getAttribute('max');
                if (min !== null && !isNaN(Number(min)) && n < Number(min)) ok = false;
                if (max !== null && !isNaN(Number(max)) && n > Number(max)) ok = false;
            }
        }
        if (el.getAttribute('pattern')) {
            try { if (v !== '' && !new RegExp(el.getAttribute('pattern')).test(v)) ok = false; } catch (e) {}
        }
        el.classList.toggle('input-invalid', !ok);
        el.title = ok ? '' : 'Ungültige Eingabe';
        return ok;
    }
    function init() {
        // Event-Delegation: auch dynamisch erzeugte Inputs werden automatisch erfasst.
        // Capture-Phase nötig, da 'blur' nicht bubblet. 'change' deckt u. a. dynamisch
        // gesetzte Werte ab, die kein 'input' feuern.
        document.addEventListener('input', function (e) { pruefe(e.target); }, true);
        document.addEventListener('blur', function (e) { pruefe(e.target); }, true);
        document.addEventListener('change', function (e) { pruefe(e.target); }, true);
    }
    init();
})();

// Globale Verfügbarkeit explizit sicherstellen
window.formatCurrency = formatCurrency;
window.formatBetrag = formatBetrag;
window.roundToTwoDecimals = roundToTwoDecimals;
window.parseNumericValue = parseNumericValue;
window.pick = pick;
window.shuffle = shuffle;

// Helper für window.open in data-on-click (Phase 2: Inline-onclick in JS-Templates entfernt)
window.__openDataUrl = function (el) {
  const url = el && el.dataset ? el.dataset.url : null;
  if (url) window.open(url, '_blank');
};

// ============================================================================
// EVENT-DELEGATION (Phase 1 der Inline-Handler-Entfernung)
// ============================================================================
// Statt inline onX="..."-Attributen werden data-on-click / data-on-change /
// data-on-input / data-on-blur / data-on-submit mit einem JSON-Array von
// {fn, args}-Einträgen verwendet. Ein globaler Delegations-Handler (capture
// phase) ruft die benannten Funktionen auf. '__THIS__'/'__VALUE__'/'__EVENT__'
// in args werden zur Laufzeit durch das Element / seinen Wert / das Event
// ersetzt. data-prevent="true" ruft preventDefault() auf.
// ============================================================================
function dispatchDataOn(el, attr, e) {
  const raw = el.getAttribute(attr);
  if (!raw) return;
  let actions;
  try { actions = JSON.parse(raw); } catch (err) { return; }
  if (!Array.isArray(actions)) actions = [actions];
  for (const a of actions) {
    let fn = null;
    if (a.fn === '__clickElement') fn = (id) => { const t = document.getElementById(id); if (t) t.click(); };
    else if (a.fn === '__print') fn = () => window.print();
    else if (a.fn === '__callMethod') fn = null; // (derzeit ungenutzt)
    else fn = window[a.fn];
    if (typeof fn !== 'function') continue;
    const args = (a.args || []).map(x =>
      x === '__THIS__' ? el :
      x === '__VALUE__' ? el.value :
      x === '__EVENT__' ? Object.assign({}, e, { currentTarget: el, target: (e && e.target) ? e.target : el }) : x);
    try { fn(...args); } catch (err) { console.error('Delegation-Fehler (' + a.fn + '):', err); }
  }
}

function setupDelegation() {
  const events = ['click', 'change', 'input', 'blur', 'submit'];
  for (const evt of events) {
    document.addEventListener(evt, (e) => {
      const el = e.target && e.target.closest ? e.target.closest('[data-on-' + evt + ']') : null;
      if (!el) return;
      dispatchDataOn(el, 'data-on-' + evt, e);
      if (el.getAttribute('data-prevent') === 'true') {
        try { e.preventDefault(); } catch (err) { /* ignore */ }
      }
    }, true);
  }
  // SVG/image load-Handler (onload="..."): nach DOMContentLoaded an jedes
  // Element mit data-on-load binden.
  const bindLoad = () => {
    document.querySelectorAll('[data-on-load]').forEach(el => {
      if (el.__loadBound) return;
      el.__loadBound = true;
      const run = () => dispatchDataOn(el, 'data-on-load', null);
      // Inline-SVGs/Bilder: Aktion beim Laden der Seite ausführen (onload
      // feuert bei Inline-SVGs oft nicht), plus load-Listener als Fallback.
      run();
      el.addEventListener('load', run, { once: true });
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindLoad);
  else bindLoad();
}
setupDelegation();

// ============================================================================
// MODAL (Hinweis- und Eingabedialog im Stil des Sammlungs-Dialogs)
// ============================================================================
// Ersetzt die Browser-Dialoge projektweit durch hübsche Overlays:
//   zeigeModal(text, titel)              → Hinweis-Box mit OK-Button
//   await frageModal(titel, vorlage)     → Eingabe-Box, Promise → Text | null
// Aufgebaut wie Collection.showCollectDialog: dunkles Overlay, weiße Box mit
// Schatten, Button im bwr-Grün. Schließen per OK / Overlay-Klick / Escape.
// window.zeigeModal/window.frageModal sind global verfügbar.
// ============================================================================

function escapeHtmlModal(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function zeigeModal(nachricht, titel) {
    if (!nachricht) return;
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:9999;';
    const box = document.createElement('div');
    box.style.cssText = 'background:#fff;border-radius:10px;padding:18px;max-width:420px;width:90%;box-shadow:0 8px 24px rgba(0,0,0,.25);';
    box.innerHTML =
        '<h3 style="margin:0 0 12px;">' + escapeHtmlModal(titel || 'Hinweis') + '</h3>' +
        '<p style="margin:0 0 14px;line-height:1.5;white-space:pre-line;">' + escapeHtmlModal(nachricht) + '</p>' +
        '<div style="display:flex;gap:8px;justify-content:flex-end;">' +
          '<button type="button" class="zm-ok" style="padding:6px 12px;border:none;border-radius:4px;background:#2c5f2d;color:#fff;cursor:pointer;">OK</button>' +
        '</div>';
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    function close() { document.removeEventListener('keydown', onKey); overlay.remove(); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    box.querySelector('.zm-ok').onclick = close;
    overlay.onclick = function (e) { if (e.target === overlay) close(); };
    document.addEventListener('keydown', onKey);
    box.querySelector('.zm-ok').focus();
}
window.zeigeModal = zeigeModal;

function frageModal(titel, defaultWert) {
    return new Promise(function (resolve) {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:9999;';
        const box = document.createElement('div');
        box.style.cssText = 'background:#fff;border-radius:10px;padding:18px;max-width:420px;width:90%;box-shadow:0 8px 24px rgba(0,0,0,.25);';
        box.innerHTML =
            '<h3 style="margin:0 0 12px;">' + escapeHtmlModal(titel || 'Eingabe') + '</h3>' +
            '<input type="text" style="width:100%;padding:6px;margin-bottom:12px;border:1px solid #ccc;border-radius:4px;">' +
            '<div style="display:flex;gap:8px;justify-content:flex-end;">' +
              '<button type="button" class="zm-abbr" style="padding:6px 12px;border:1px solid #ccc;border-radius:4px;background:#f5f5f5;cursor:pointer;">Abbrechen</button>' +
              '<button type="button" class="zm-ok" style="padding:6px 12px;border:none;border-radius:4px;background:#2c5f2d;color:#fff;cursor:pointer;">OK</button>' +
            '</div>';
        const input = box.querySelector('input');
        if (defaultWert != null && defaultWert !== '') input.value = defaultWert;
        overlay.appendChild(box);
        document.body.appendChild(overlay);
        function close(result) { document.removeEventListener('keydown', onKey); overlay.remove(); resolve(result); }
        function onKey(e) { if (e.key === 'Escape') close(null); }
        box.addEventListener('keydown', e => { if (e.key === 'Enter') close(input.value.trim()); });
        box.querySelector('.zm-abbr').onclick = function () { close(null); };
        box.querySelector('.zm-ok').onclick = function () { close(input.value.trim()); };
        overlay.onclick = function (e) { if (e.target === overlay) close(null); };
        document.addEventListener('keydown', onKey);
        input.focus();
        input.select();
    });
}
window.frageModal = frageModal;

// ============================================================================
// KONTENPLAN (BwR 8+) – ZENTRALE KONTENLISTE
// ============================================================================
// DIE EINE Quelle für alle Konten: Kontonummer, Abkürzung, Langname und
// Kontenklasse. HIER einfach ergänzen/ändern – alle abgeleiteten Stellen
// (Kontenplan-Widget in js/kontenplan.js, kontenplan.html, Generatoren mit
// kontoLabel()/kontoName()) übernehmen die Änderung automatisch.
//
// Felder:
//   nr     – vierstellige Kontonummer (String, z. B. '2800')
//   abk    – offizielle Abkürzung (z. B. BK, VORST, UEFE)
//   name   – Langname (z. B. „Bank“, „Umsatzerlöse für eigene Erzeugnisse“)
//   klasse – erste Ziffer der Kontonummer = Kontenklasse (0–8, automatisch)
//   art    – aktiv | passiv | ertrag | aufwand | abschluss (automatisch, für
//            die Farb-/Filterlogik im Kontenplan)
// ============================================================================

const KONTENPLAN = [
  // Kontenklasse 0 (Sachanlagen)
  { nr: '0500', abk: 'GR',    name: 'Grundstücke' },
  { nr: '0530', abk: 'BVG',   name: 'Betriebs- und Verwaltungsgebäude' },
  { nr: '0700', abk: 'MA',    name: 'Maschinen und Anlagen' },
  { nr: '0840', abk: 'FP',    name: 'Fuhrpark' },
  { nr: '0860', abk: 'BM',    name: 'Büromaschinen' },
  { nr: '0870', abk: 'BGA',   name: 'Büromöbel und Geschäftsausstattung' },
  { nr: '0890', abk: 'GWG',   name: 'Geringwertige Wirtschaftsgüter' },
  // Kontenklasse 1 (Finanzanlagen)
  { nr: '1500', abk: 'WP',    name: 'Wertpapiere des Anlagevermögens' },
  // Kontenklasse 2 (Umlaufvermögen)
  { nr: '2000', abk: 'R',     name: 'Rohstoffe' },
  { nr: '2010', abk: 'F',     name: 'Fremdbauteile' },
  { nr: '2020', abk: 'H',     name: 'Hilfsstoffe' },
  { nr: '2030', abk: 'B',     name: 'Betriebsstoffe' },
  { nr: '2400', abk: 'FO',    name: 'Forderungen aus Lieferungen und Leistungen' },
  { nr: '2470', abk: 'ZWFO',  name: 'Zweifelhafte Forderungen' },
  { nr: '2600', abk: 'VORST', name: 'Vorsteuer' },
  { nr: '2800', abk: 'BK',    name: 'Bank' },
  { nr: '2880', abk: 'KA',    name: 'Kasse' },
  { nr: '2900', abk: 'ARA',   name: 'Aktive Rechnungsabgrenzung' },
  // Kontenklasse 3 (Eigenkapital und Rückstellungen)
  { nr: '3000', abk: 'EK',    name: 'Eigenkapital' },
  { nr: '3001', abk: 'P',     name: 'Privatkonto' },
  { nr: '3670', abk: 'EWB',   name: 'Einzelwertberichtigung' },
  { nr: '3680', abk: 'PWB',   name: 'Pauschalwertberichtigung' },
  { nr: '3900', abk: 'RST',   name: 'Rückstellungen' },
  // Kontenklasse 4 (Verbindlichkeiten)
  { nr: '4200', abk: 'KBKV',  name: 'Kurzfristige Bankverbindlichkeiten' },
  { nr: '4250', abk: 'LBKV',  name: 'Langfristige Bankverbindlichkeiten' },
  { nr: '4400', abk: 'VE',    name: 'Verbindlichkeiten aus LL' },
  { nr: '4800', abk: 'UST',   name: 'Umsatzsteuer' },
  { nr: '4830', abk: 'VFA',   name: 'Sonst. Steuerverbindlichkeiten' },
  { nr: '4840', abk: 'VSV',   name: 'Verbindlichkeiten gegenüber Sozialversicherungsträgern' },
  { nr: '4900', abk: 'PRA',   name: 'Passive Rechnungsabgrenzung' },
  // Kontenklasse 5 (Ertragskonten)
  { nr: '5000', abk: 'UEFE',  name: 'Umsatzerlöse für eigene Erzeugnisse' },
  { nr: '5001', abk: 'EBFE',  name: 'Erlösberichtigungen' },
  { nr: '5400', abk: 'EMP',   name: 'Erlöse aus Vermietung und Verpachtung' },
  { nr: '5430', abk: 'ASBE',  name: 'Andere sonst. betriebl. Erträge' },
  { nr: '5490', abk: 'PFE',   name: 'Periodenfremde Erträge' },
  { nr: '5495', abk: 'EFO',   name: 'Erträge aus abgeschriebenen Forderungen' },
  { nr: '5650', abk: 'EAWP',  name: 'Erträge aus dem Abgang von Wertpapieren des Anlagevermögens' },
  { nr: '5710', abk: 'ZE',    name: 'Zinserträge' },
  { nr: '5780', abk: 'DDE',   name: 'Dividendenerträge' },
  // Kontenklasse 6 (Aufwandskonten)
  { nr: '6000', abk: 'AWR',   name: 'Aufwendungen für Rohstoffe' },
  { nr: '6001', abk: 'BZKR',  name: 'Bezugskosten für Rohstoffe' },
  { nr: '6002', abk: 'NR',    name: 'Nachlässe für Rohstoffe' },
  { nr: '6010', abk: 'AWF',   name: 'Aufwendungen für Fremdbauteile' },
  { nr: '6011', abk: 'BZKF',  name: 'Bezugskosten für Fremdbauteile' },
  { nr: '6012', abk: 'NF',    name: 'Nachlässe für Fremdbauteile' },
  { nr: '6020', abk: 'AWH',   name: 'Aufwendungen für Hilfsstoffe' },
  { nr: '6021', abk: 'BZKH',  name: 'Bezugskosten für Hilfsstoffe' },
  { nr: '6022', abk: 'NH',    name: 'Nachlässe für Hilfsstoffe' },
  { nr: '6030', abk: 'AWB',   name: 'Aufwendungen für Betriebsstoffe' },
  { nr: '6031', abk: 'BZKB',  name: 'Bezugskosten für Betriebsstoffe' },
  { nr: '6032', abk: 'NB',    name: 'Nachlässe für Betriebsstoffe' },
  { nr: '6040', abk: 'AWVM',  name: 'Aufwendungen für Verpackungsmaterial' },
  { nr: '6140', abk: 'AFR',   name: 'Ausgangsfrachten' },
  { nr: '6160', abk: 'FRI',   name: 'Fremdinstandhaltung' },
  { nr: '6200', abk: 'LG',    name: 'Löhne und Gehälter' },
  { nr: '6400', abk: 'AGASV', name: 'Arbeitgeberanteil zur Sozialversicherung' },
  { nr: '6520', abk: 'ABSA',  name: 'Abschr. auf Sachanlagen' },
  { nr: '6540', abk: 'ABGWG', name: 'Abschreibungen auf GWG' },
  { nr: '6700', abk: 'AWMP',  name: 'Mieten, Pachten' },
  { nr: '6730', abk: 'GEB',   name: 'Gebühren' },
  { nr: '6750', abk: 'KGV',   name: 'Kosten des Geldverkehrs' },
  { nr: '6760', abk: 'PROV',  name: 'Provisionen' },
  { nr: '6770', abk: 'RBK',   name: 'Rechts- und Beratungskosten' },
  { nr: '6800', abk: 'BMK',   name: 'Büromaterial und Kleingüter' },
  { nr: '6820', abk: 'KOM',   name: 'Kommunikationsgebühren' },
  { nr: '6850', abk: 'REK',   name: 'Reisekosten' },
  { nr: '6870', abk: 'WER',   name: 'Werbung' },
  { nr: '6900', abk: 'VBEI',  name: 'Versicherungsbeiträge' },
  { nr: '6950', abk: 'ABFO',  name: 'Abschreibungen auf Forderungen' },
  { nr: '6990', abk: 'PFAW',  name: 'Periodenfremde Aufwendungen' },
  // Kontenklasse 7 (Aufwandskonten)
  { nr: '7000', abk: 'GWST',  name: 'Gewerbesteuer' },
  { nr: '7020', abk: 'GRST',  name: 'Grundsteuer' },
  { nr: '7030', abk: 'KFZST', name: 'Kraftfahrzeugsteuer' },
  { nr: '7460', abk: 'VAWP',  name: 'Verluste aus dem Abgang von Wertpapieren des Anlagevermögens' },
  { nr: '7510', abk: 'ZAW',   name: 'Zinsaufwendungen' },
  // Kontenklasse 8 (Ergebnisrechnung)
  { nr: '8010', abk: 'SBK',   name: 'Schlussbilanzkonto' },
  { nr: '8020', abk: 'GUV',   name: 'Gewinn- und Verlustkonto' }
];

// Kontenklasse 0–2 = Aktiv, 3–4 = Passiv, 5 = Ertrag, 6–7 = Aufwand, 8 = Abschluss
const KONTENKLASSE_ART = {
  0: 'aktiv', 1: 'aktiv', 2: 'aktiv',
  3: 'passiv', 4: 'passiv',
  5: 'ertrag', 6: 'aufwand', 7: 'aufwand',
  8: 'abschluss'
};

// charmäß Kontenklasse + Art ergänzen und Nachschlage-Indizes aufbauen
const KONTENPLAN_NACH_NR = {};
const KONTENPLAN_NACH_ABK = {};
KONTENPLAN.forEach(k => {
  k.klasse = k.nr.charAt(0);
  k.art = KONTENKLASSE_ART[k.klasse] || null;
  KONTENPLAN_NACH_NR[k.nr] = k;
  if (!KONTENPLAN_NACH_ABK[k.abk]) KONTENPLAN_NACH_ABK[k.abk] = k;
});

// Löst ein Kontokennzeichen auf: '2800' / 2800 / 'BK' / '2800 BK' / Kontenobjekt
// → Kontenobjekt aus KONTENPLAN, sonst null.
function getKonto(kennzeichen) {
  if (kennzeichen == null) return null;
  if (typeof kennzeichen === 'object' && kennzeichen.nr) {
    return KONTENPLAN_NACH_NR[kennzeichen.nr] || null;
  }
  const s = String(kennzeichen).trim();
  if (!s) return null;
  if (KONTENPLAN_NACH_NR[s]) return KONTENPLAN_NACH_NR[s];
  if (KONTENPLAN_NACH_ABK[s]) return KONTENPLAN_NACH_ABK[s];
  const m = s.match(/^(\d{3,4})\b/);   // z. B. "2800 BK" → 2800
  if (m) return KONTENPLAN_NACH_NR[m[1]] || null;
  return null;
}

// Kurzes Label: '2800 BK' – mit ohneNummern=true nur die Abkürzung ('BK').
// Unbekannte Kennzeichen werden unverändert zurückgegeben (kein Crash).
function kontoLabel(kennzeichen, ohneNummern) {
  const k = getKonto(kennzeichen);
  if (!k) return String(kennzeichen ?? '');
  return ohneNummern ? k.abk : (k.nr + ' ' + k.abk);
}

// Langname: kontoName('2800 BK') → 'Bank'. Unbekannt → Leerstring.
function kontoName(kennzeichen) {
  const k = getKonto(kennzeichen);
  return k ? k.name : '';
}

// Komplette Bez.: kontoLangBez('2800 BK') → '2800 BK (Bank)' (wie auf kontenplan.html)
function kontoLangBez(kennzeichen) {
  const k = getKonto(kennzeichen);
  return k ? (k.nr + ' ' + k.abk + ' (' + k.name + ')') : String(kennzeichen ?? '');
}

// Alle Konten einer Kontenklasse ('0'–'8', z. B. kontenplan-Filter)
function kontenDerKlasse(klasse) {
  const s = String(klasse).charAt(0);
  return KONTENPLAN.filter(k => k.klasse === s);
}

// Alle Konten einer Art ('aktiv' | 'passiv' | 'ertrag' | 'aufwand' | 'abschluss')
function kontenDerArt(art) {
  return KONTENPLAN.filter(k => k.art === art);
}

window.KONTENPLAN = KONTENPLAN;
window.getKonto = getKonto;
window.kontoLabel = kontoLabel;
window.kontoName = kontoName;
window.kontoLangBez = kontoLangBez;
window.kontenDerKlasse = kontenDerKlasse;
window.kontenDerArt = kontenDerArt;

