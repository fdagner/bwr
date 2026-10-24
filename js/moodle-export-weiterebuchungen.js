// ============================================================================
// MOODLE-XML-EXPORT – WEITERE BUCHUNGEN ANLAGEGÜTER
// (Reparaturen, Miete/Pacht, Versicherungen; Fragetyp „Buchungssatz“)
// Wird NACH lb9-2-weiterebuchungen.js UND NACH moodle-export.js eingebunden.
// Der Generator ruft moodleErfasseWeitereBuchungen() je Geschäftsfall auf; die
// Fragen landen in moodleFragen (siehe moodle-export.js).
// ============================================================================

function moodleErfasseWeitereBuchungen(d) {
  const nr = String(d.nr).padStart(2, '0');

  // Mit Vorsteuer:  Aufwand (netto) + 2600 VORST  an  Zahlungskonto (brutto)
  // Ohne Vorsteuer: Aufwand an Zahlungskonto (gleicher Betrag)
  const zeilen = d.mitVorsteuer
    ? [
        { d: d.aufwandskonto, da: moodleBetrag(d.netto), c: d.zahlungskonto, ca: moodleBetrag(d.brutto) },
        { d: d.vorsteuerkonto || '2600 VORST', da: moodleBetrag(d.vorsteuer), c: '', ca: 0 },
      ]
    : [
        { d: d.aufwandskonto, da: moodleBetrag(d.brutto), c: d.zahlungskonto, ca: moodleBetrag(d.brutto) },
      ];

  const feedback = d.mitVorsteuer
    ? `<p>Steuersatz: ${d.vstSatz} %</p>`
    : '<p>Keine Vorsteuer (z. B. bei Versicherungsbeiträgen).</p>';

  moodleFragen.push({
    name: `${String(d.typName).replace(/[\/\\]/g, '-')}_${nr}`,
    text: `<p>Bilde den Buchungssatz mit Kontennummern.</p><p>${d.satz}</p>`,
    feedback,
    zeilen,
  });
}