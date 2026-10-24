// ============================================================================
// MOODLE-XML-EXPORT – VERKAUF (Fragetyp „Buchungssatz“, qtype_accounting)
// Wird NACH lb8-4-verkauf.js UND NACH moodle-export.js eingebunden.
// Nutzt moodleFragen, moodleBetrag, moodleTabelle und exportiereMoodleXML()
// aus moodle-export.js.
// ============================================================================

function moodleVerkaufKalkulationHtml(d) {
  return '<p><b>Verkaufskalkulation (Teilaufgabe a)</b></p>' + moodleTabelle([
    ['Selbstkostenpreis', d.selbstkostenpreis, '100 %'],
    ['+ Gewinn', d.gewinnWert, `${d.gewinnSatz} %`],
    ['= Barverkaufspreis', d.barverkaufspreis, '', true],
    ['+ Kundenskonto', d.skontoBetrag, `${d.skontoProzent} %`],
    ['= Zielverkaufspreis', d.zielverkaufspreis, '', true],
    ['+ Kundenrabatt', d.rabattWert, `${d.rabattSatz} %`],
    ['= Listenverkaufspreis', d.listenverkaufspreis, '', true],
  ]);
}

function moodleVerkaufSkontoHtml(d) {
  return '<p><b>Nebenrechnung</b></p>' + moodleTabelle([
    ['Rechnungsbetrag', d.brutto, ''],
    ['- Skonto (brutto)', d.skontoBrutto, `${d.skontoProzent} %`],
    ['= Überweisungsbetrag', d.ueberweisung, '', true],
  ]) + '<br>' + moodleTabelle([
    ['Skonto (brutto)', d.skontoBrutto, '119 %'],
    ['- Umsatzsteuer', d.ustBerichtigung, '19 %'],
    ['= Skonto (netto)', d.skontoBetrag, '100 %', true],
  ]);
}

function moodleErfasseVerkauf(d) {
  const nr = String(d.nr).padStart(2, '0');

  // Verkaufsbuchung: Forderung an Erlöse + Umsatzsteuer
  const verkaufZeilen = () => [
    { d: d.konto2, da: moodleBetrag(d.brutto), c: d.konto1, ca: moodleBetrag(d.zielverkaufspreis) },
    { d: '', da: 0, c: '4800 UST', ca: moodleBetrag(d.ust) },
  ];

  if (d.modus === 'verkaufDifferenzkalkulation') {
    return; // enthält keinen Buchungssatz → mit diesem Fragetyp nicht abbildbar

  } else if (d.modus === 'verkaufskalkulation') {
    moodleFragen.push({
      name: `Kalkulation_${nr}`,
      text: '<p><em>Teilaufgabe a) wird auf Papier gelöst. Im Antwortfeld wird der Buchungssatz zu b) eingetragen.</em></p>' + d.angebotSatz,
      feedback: moodleVerkaufKalkulationHtml(d),
      zeilen: verkaufZeilen(),
    });

  } else if (d.modus === 'verkaufSkontobuchungssatz') {
    moodleFragen.push({
      name: `Skonto_${nr}a`,
      text: `<p>${d.satz}</p><p>Bilde den Buchungssatz zum Geschäftsfall.</p>`,
      feedback: '',
      zeilen: verkaufZeilen(),
    });
    const lis = [...String(d.skontoSatz).matchAll(/<li>([\s\S]*?)<\/li>/g)].map(m => m[1].trim());
    const teilB = lis[1] || 'Der Rechnungsausgleich erfolgt mit Skonto per Bank. Bilde den Buchungssatz.';
    moodleFragen.push({
      name: `Skonto_${nr}b`,
      text: `<p>Ausgangsfall (bereits gebucht): ${d.satz}</p><p>${teilB}</p>`,
      feedback: moodleVerkaufSkontoHtml(d),
      zeilen: [
        { d: '2800 BK', da: moodleBetrag(d.ueberweisung), c: '2400 FO', ca: moodleBetrag(d.brutto) },
        { d: d.kontoNachlass, da: moodleBetrag(d.skontoBetrag), c: '', ca: 0 },
        { d: '4800 UST', da: moodleBetrag(d.ustBerichtigung), c: '', ca: 0 },
      ],
    });

  } else {
    moodleFragen.push({
      name: `Umsatz_${nr}`,
      text: `<p>Bilde den Buchungssatz mit Kontennummern.</p><p>${d.satz}</p>`,
      feedback: '',
      zeilen: verkaufZeilen(),
    });
  }
}