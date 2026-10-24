// ============================================================================
// MOODLE-XML-EXPORT – MARKETING (Fragetyp „Buchungssatz“, qtype_accounting)
// Wird NACH lb8-3-buchungmarketing.js UND NACH moodle-export.js eingebunden.
// Der Generator ruft moodleErfasseMarketing() je Geschäftsfall auf; die Fragen
// landen in moodleFragen (siehe moodle-export.js).
// ============================================================================

function moodleErfasseMarketing(d) {
  const nr = String(d.nr).padStart(2, '0');
  const zk = d.zahlungskonto;

  // Mit Vorsteuer:  Aufwand (netto) + 2600 VORST  an  Zahlungskonto (brutto)
  // Ohne Vorsteuer: Aufwand an Zahlungskonto (gleicher Betrag)
  const zeilen = d.mitVorsteuer
    ? [
        { d: d.aufwandskonto, da: moodleBetrag(d.netto), c: zk, ca: moodleBetrag(d.brutto) },
        { d: '2600 VORST', da: moodleBetrag(d.vorsteuer), c: '', ca: 0 },
      ]
    : [
        { d: d.aufwandskonto, da: moodleBetrag(d.netto), c: zk, ca: moodleBetrag(d.netto) },
      ];

  const feedback = d.mitVorsteuer
    ? `<p>Steuersatz: ${d.ustProzent} %</p>`
    : '<p>Keine Vorsteuer (kein Ausweis von Umsatzsteuer).</p>';

  moodleFragen.push({
    name: `${String(d.typName).replace(/[\/\\]/g, '-')}_${nr}`,
    text: `<p>Bilde den Buchungssatz mit Kontennummern.</p><p>${d.satz}</p>`,
    feedback,
    zeilen,
  });
}