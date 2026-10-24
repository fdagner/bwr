// ============================================================================
// MOODLE-XML-EXPORT – STAAT & STEUERN (Fragetyp „Buchungssatz“, qtype_accounting)
// Wird NACH dem Generator-Skript UND NACH moodle-export.js eingebunden.
// Der Generator ruft moodleErfasseStaat() je Geschäftsfall auf; die Fragen
// landen in moodleFragen (siehe moodle-export.js).
// ============================================================================

function moodleErfasseStaat(d) {
  const nr = String(d.nr).padStart(2, '0');

  // Steuern/Gebühren: Aufwandskonto an Verbindlichkeiten, gleicher Betrag, keine Vorsteuer
  const zeilen = [
    { d: d.aufwandskonto, da: moodleBetrag(d.betrag), c: d.zahlungskonto, ca: moodleBetrag(d.betrag) },
  ];

  let feedback = '<p>Keine Vorsteuer: Steuern und Gebühren an Behörden enthalten keine Umsatzsteuer.</p>';
  if (d.messbetrag && d.hebesatz) {
    feedback += `<p>Grundsteuer = Steuermessbetrag (${d.messbetrag} €) × Hebesatz (${d.hebesatz} %)</p>`;
  }

  moodleFragen.push({
    name: `${String(d.typName).replace(/[\/\\]/g, '-')}_${nr}`,
    text: `<p>Bilde den Buchungssatz mit Kontennummern.</p><p>${d.satz}</p>`,
    feedback,
    zeilen,
  });
}