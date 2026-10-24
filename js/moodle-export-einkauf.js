// ============================================================================
// MOODLE-XML-EXPORT – EINKAUF
// Wird NACH lb8-1-einkauf.js UND NACH moodle-export.js eingebunden.
// Der Generator ruft moodleErfasseGeschaeftsfall() und moodleErfasseRuecksendung()
// auf; die Fragen landen in moodleFragen (siehe moodle-export.js).
// ============================================================================

function moodleKalkulationHtml(d) {
  const rabatt = parseFloat(d.rabattSatz) || 0;
  return '<p><b>Einkaufskalkulation (Teilaufgabe a)</b></p>' + moodleTabelle([
    ['Listeneinkaufspreis', d.listeneinkaufspreis, '100 %'],
    ['- Liefererrabatt', d.rabattWert, `${rabatt} %`],
    ['= Zieleinkaufspreis', d.zieleinkaufspreis, '', true],
    ['- Liefererskonto', d.skontoBetrag, `${d.skontoProzent} %`],
    ['= Bareinkaufspreis', d.bareinkaufspreis, '', true],
    ['+ Bezugskosten', d.bezugskosten, ''],
    ['= Einstandspreis', d.einstandspreis, '', true],
  ]);
}

function moodleSkontoHtml(d) {
  return '<p><b>Nebenrechnung</b></p>' + moodleTabelle([
    ['Rechnungsbetrag', d.brutto, ''],
    ['- Skonto (brutto)', d.skontoBrutto, `${d.skontoProzent} %`],
    ['= Überweisungsbetrag', d.ueberweisung, '', true],
  ]) + '<br>' + moodleTabelle([
    ['Skonto (brutto)', d.skontoBrutto, '119 %'],
    ['- Umsatzsteuer', d.vorsteuerBerichtigung, '19 %'],
    ['= Skonto (netto)', d.skontoBetrag, '100 %', true],
  ]);
}

// ---------------------------------------------------------------------------
// Erfassung der Geschäftsfälle (wird vom Generator in jeder Runde aufgerufen)
// ---------------------------------------------------------------------------
function moodleErfasseGeschaeftsfall(d) {
  const nr = String(d.nr).padStart(2, '0');
  const hinweis = '<p>Bilde den Buchungssatz mit Kontennummern.</p>';
  const bk = d.mitBezugskosten ? moodleBetrag(d.bezugskosten) : 0;

  // Einkaufsbuchung: Aufwand (+ Bezugskosten) + Vorsteuer an Zahlungskonto
  const einkaufZeilen = () => {
    const z = [{ d: d.konto1, da: moodleBetrag(d.zieleinkaufspreis), c: d.konto2, ca: moodleBetrag(d.brutto) }];
    if (d.mitBezugskosten) z.push({ d: d.kontoBezug, da: bk, c: '', ca: 0 });
    z.push({ d: '2600 VORST', da: moodleBetrag(d.ust), c: '', ca: 0 });
    return z;
  };

  if (d.modus === 'einkaufskalkulation') {
    moodleFragen.push({
      name: `Kalkulation_${nr}`,
      text: '<p><em>Teilaufgabe a) wird auf Papier gelöst. Im Antwortfeld wird nur der Buchungssatz zu b) eingetragen.</em></p>' + d.angebotSatz,
      feedback: moodleKalkulationHtml(d),
      zeilen: einkaufZeilen(),
    });

  } else if (d.modus === 'skontobuchungssatz') {
    // Teil a): Einkauf
    moodleFragen.push({
      name: `Skonto_${nr}a`,
      text: `<p>${d.satz}</p><p>Bilde den Buchungssatz zum Geschäftsfall.</p>`,
      feedback: '',
      zeilen: einkaufZeilen(),
    });
    // Teil b): Rechnungsausgleich mit Skonto – Satz aus der zweiten Teilaufgabe übernehmen
    const lis = [...String(d.skontoSatz).matchAll(/<li>([\s\S]*?)<\/li>/g)].map(m => m[1].trim());
    const teilB = lis[1] || 'Der Rechnungsausgleich erfolgt mit Skonto per Bank. Bilde den Buchungssatz.';
    moodleFragen.push({
      name: `Skonto_${nr}b`,
      text: `<p>Ausgangsfall (bereits gebucht): ${d.satz}</p><p>${teilB}</p>`,
      feedback: moodleSkontoHtml(d),
      zeilen: [
        { d: '4400 VE', da: moodleBetrag(d.brutto), c: '2800 BK', ca: moodleBetrag(d.ueberweisung) },
        { d: '', da: 0, c: d.kontoNachlass, ca: moodleBetrag(d.skontoBetrag) },
        { d: '', da: 0, c: '2600 VORST', ca: moodleBetrag(d.vorsteuerBerichtigung) },
      ],
    });

  } else {
    moodleFragen.push({
      name: `Aufwand_${nr}`,
      text: hinweis + `<p>${d.satz}</p>`,
      feedback: '',
      zeilen: einkaufZeilen(),
    });
  }
}

function moodleErfasseRuecksendung(d) {
  const nr = String(d.nr).padStart(2, '0');
  const satz = String(d.text).replace(/\s+/g, ' ').trim();
  moodleFragen.push({
    name: `Ruecksendung_${nr}`,
    text: `<p>Bilde den Buchungssatz mit Kontennummern.</p>` +
          `<p>Ausgangsfall (bereits gebucht): ${d.ausgangssatz}</p>` +
          `<p>${satz} aus dem Ausgangsfall zurück und erhält dafür eine Gutschrift.</p>`,
    feedback: '',
    zeilen: [
      { d: d.konto2, da: moodleBetrag(d.brutto), c: '2600 VORST', ca: moodleBetrag(d.ust) },
      { d: '', da: 0, c: d.konto1, ca: moodleBetrag(d.netto) },
    ],
  });
}