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
            if (entry.message) alert(entry.message);
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