// ============================================================================
// MOODLE-XML-EXPORT – PROZENTRECHNEN (Fragetyp „Kurzantwort“ / shortanswer)
// Wird NACH lb7-1-prozentrechnen.js eingebunden (braucht keine weitere Datei).
// Nutzt die globalen Variablen letzteGenerierteAufgaben und AUFGABEN_TYPEN_DEF
// des Generators. Button: onclick="exportiereMoodle()"
// ============================================================================

// ── Einstellungen ───────────────────────────────────────────────────────────
const MOODLE_PROZENT_PRAEFIX_STANDARD = '7.1-07';   // Prozentwert, Grundwert, Prozentsatz
const MOODLE_PROZENT_PRAEFIX_VERMEHRT = '7.1-08';   // vermehrter / verminderter Grundwert
const MOODLE_PROZENT_TRENNER = '-';                 // zwischen Präfix und „R…“ (im Beispielexport: '#')
const MOODLE_PROZENT_TITELENDE = 'meinBwR-Berechnen';
const MOODLE_PROZENT_GRUPPE_08 = ['Gv', 'Gv_r', 'Ge', 'Ge_r'];

// ── Hilfsfunktionen ─────────────────────────────────────────────────────────
function mpEsc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function mpCdata(s) {
  return '<![CDATA[' + String(s ?? '').replace(/\]\]>/g, ']]]]><![CDATA[>') + ']]>';
}

// Eindeutige, zeitabhängige ID-Basis (yyMMddHHmmss). Pro Browser garantiert streng
// aufsteigend: Wird innerhalb derselben Sekunde erneut exportiert, rückt sie um 1 Sekunde vor.
function mpIdBasis() {
  const SCHLUESSEL = 'moodleProzentLetzteIdSekunde';
  let sek = Math.floor(Date.now() / 1000);
  try {
    const letzte = Number(localStorage.getItem(SCHLUESSEL)) || 0;
    if (sek <= letzte) sek = letzte + 1;
    localStorage.setItem(SCHLUESSEL, String(sek));
  } catch (e) { /* ohne localStorage: nur Zeitstempel */ }
  const d = new Date(sek * 1000);
  const p = n => String(n).padStart(2, '0');
  return `${p(d.getFullYear() % 100)}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

// Bei Umsatzsteuer-Aufgaben vom Typ „Gv“ steht im Text der Bruttopreis und der Nettopreis
// ist gesucht – das ist rechnerisch „Grundwert aus vermehrtem Grundwert“ (Ge_r).
function mpEffektiverTyp(typ, eintrag) {
  if (typ === 'Gv' && String(eintrag.kategorie || '').startsWith('Umsatzsteuer')) return 'Ge_r';
  return typ;
}

// Gesuchter Wert je Aufgabentyp
function mpLoesungswert(typ, d) {
  switch (typ) {
    case 'W':    return d.W;
    case 'G':    return d.G;
    case 'p':    return d.p;
    case 'Gv':   return d.Gv;
    case 'Ge':   return d.Ge;
    case 'Gv_r': return d.G;
    case 'Ge_r': return d.G;
    default:     return d.G;
  }
}

// Alle Schreibweisen einer Zahl: 20 / 20,00 bzw. 20,5 / 20,50 (jeweils auch mit Punkt und ohne Tausenderpunkt)
function mpZahlVarianten(wert) {
  const zwei = wert.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const kurz = zwei.replace(/,00$/, '').replace(/(,\d)0$/, '$1');
  const basis = [zwei, kurz];
  const ohneTausender = basis.map(z => z.replace(/\./g, ''));
  return [...new Set([...basis, ...ohneTausender])];
}

// Akzeptierte Schreibweisen der richtigen Antwort (die erste ist die Standardform)
function mpAntworten(typ, eintrag, d) {
  const wert = mpLoesungswert(typ, d);
  const liste = [];

if (typ === 'p') {
  mpZahlVarianten(wert).forEach(z => liste.push(`${z} %`));
} else if (eintrag.einheit === '€') {
  mpZahlVarianten(wert).forEach(z => liste.push(`${z} €`));
} else {
    // Stückzahlen/Einheiten (Schüler, mAh, Minuten …): mit und ohne Einheit, mit/ohne Tausenderpunkt
    const roh = String(wert);
    const punkt = wert.toLocaleString('de-DE');
    const leer = punkt.replace(/\./g, ' ');
    [roh, punkt, leer].forEach(z => {
      liste.push(z, `${z} ${eintrag.einheit}`);
    });
  }
  return [...new Set(liste)];
}

// ── XML aufbauen ────────────────────────────────────────────────────────────
function mpBaueXml(aufgaben) {
  const basis = mpIdBasis();
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n';

  aufgaben.forEach(({ typ, eintrag, d }, i) => {
    const def = AUFGABEN_TYPEN_DEF[typ];
    const eff = mpEffektiverTyp(typ, eintrag);
    const effDef = AUFGABEN_TYPEN_DEF[eff];

    const praefix = MOODLE_PROZENT_GRUPPE_08.includes(eff)
      ? MOODLE_PROZENT_PRAEFIX_VERMEHRT
      : MOODLE_PROZENT_PRAEFIX_STANDARD;
    const id = `${basis}${String(i + 1).padStart(3, '0')}`;
    const titel = `${praefix}${MOODLE_PROZENT_TRENNER}R${id}${MOODLE_PROZENT_TITELENDE}`;

    const text = def.buildText(eintrag, d).replace(/\s{2,}/g, ' ').trim();
    const rechenweg = `<p><strong>Rechenweg</strong></p>${effDef.buildLoesung(eintrag, d)}`;
    const antworten = mpAntworten(eff, eintrag, d);

    xml += `  <question type="shortanswer">\n`;
    xml += `    <name>\n      <text>${mpEsc(titel)}</text>\n    </name>\n`;
    xml += `    <questiontext format="html">\n      <text>${mpCdata(`<p>${text}</p>`)}</text>\n    </questiontext>\n`;
    xml += `    <generalfeedback format="html">\n      <text>${mpCdata(rechenweg)}</text>\n    </generalfeedback>\n`;
    xml += `    <defaultgrade>1</defaultgrade>\n    <penalty>0.3333333</penalty>\n    <hidden>0</hidden>\n    <idnumber></idnumber>\n    <usecase>0</usecase>\n`;
    antworten.forEach(a => {
      xml += `    <answer fraction="100" format="moodle_auto_format">\n      <text>${mpEsc(a)}</text>\n      <feedback format="html">\n        <text></text>\n      </feedback>\n    </answer>\n`;
    });
    xml += `  </question>\n\n`;
  });

  return xml + '</quiz>\n';
}

// ── Button-Handler ──────────────────────────────────────────────────────────
function exportiereMoodle() {
  if (typeof letzteGenerierteAufgaben === 'undefined' || !letzteGenerierteAufgaben.length) {
    alert('Bitte zuerst Aufgaben erstellen.');
    return;
  }
  const xml = mpBaueXml(letzteGenerierteAufgaben);

  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  const dateiname = `quiz-prozentrechnen-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.xml`;

  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = dateiname;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}