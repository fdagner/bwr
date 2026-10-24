// ============================================================================
// MOODLE-XML-EXPORT – AUSGANGSFRACHTEN / VERPACKUNGSMATERIAL
// (Fragetyp „Buchungssatz“, qtype_accounting)
// Wird NACH lb8-4-ausgangsfrachten.js UND NACH moodle-export.js eingebunden.
// Der Generator ruft moodleErfasseAusgangsfrachten() je Geschäftsfall auf; die
// Fragen landen in moodleFragen (siehe moodle-export.js).
// ============================================================================

function moodleErfasseAusgangsfrachten(d) {
  const nr = String(d.nr).padStart(2, '0');

  // Aufwand (netto) + 2600 VORST  an  Zahlungskonto (brutto)
  const zeilen = [
    { d: d.aufwandskonto, da: moodleBetrag(d.netto), c: d.zahlungskonto, ca: moodleBetrag(d.brutto) },
    { d: '2600 VORST', da: moodleBetrag(d.vorsteuer), c: '', ca: 0 },
  ];

  moodleFragen.push({
    name: `${String(d.typName).replace(/[\/\\]/g, '-')}_${nr}`,
    text: `<p>Bilde den Buchungssatz mit Kontennummern.</p><p>${d.satz}</p>`,
    feedback: `<p>Steuersatz: ${d.ustProzent} %</p>`,
    zeilen,
  });
}