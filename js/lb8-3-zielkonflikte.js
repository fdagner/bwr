// ============================================================================
// GLOBALE VARIABLEN
// ============================================================================

let yamlData = [];
let kunde = '<i>[Modellunternehmen]</i>';

// ============================================================================
// YAML-DATEN LADEN (identisch zum Marketing-Generator)
// ============================================================================

function getUserCompanies() {
  const stored = localStorage.getItem('userCompanies');
  return stored ? JSON.parse(stored) : [];
}

function mergeUserCompaniesIntoYamlData() {
  const userCompanies = getUserCompanies();
  if (userCompanies.length > 0) {
    yamlData = [...yamlData, ...userCompanies];
    yamlData.sort((a, b) => {
      const brancheA = a.unternehmen?.branche || '';
      const brancheB = b.unternehmen?.branche || '';
      return brancheA.localeCompare(brancheB);
    });
  }
}

function loadYamlFromLocalStorage() {
  const saved = localStorage.getItem('uploadedYamlCompanyData');
  if (saved) {
    try {
      yamlData = JSON.parse(saved);
      mergeUserCompaniesIntoYamlData();
      document.dispatchEvent(new Event('yamlDataLoaded'));
      return true;
    } catch (err) {
      console.warn("localStorage YAML kaputt:", err);
    }
  }
  return false;
}

function loadDefaultYaml() {
  fetch('js/unternehmen.yml')
    .then(res => {
      if (!res.ok) throw new Error('unternehmen.yml nicht gefunden');
      return res.text();
    })
    .then(yamlText => {
      yamlData = jsyaml.load(yamlText) || [];
      if (!localStorage.getItem('standardYamlData')) {
        localStorage.setItem('standardYamlData', JSON.stringify(yamlData));
      }
      mergeUserCompaniesIntoYamlData();
      document.dispatchEvent(new Event('yamlDataLoaded'));
    })
    .catch(err => {
      console.error("Konnte unternehmen.yml nicht laden:", err);
    });
}

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

  const kundeSelect = document.getElementById('zielKunde');
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
// MARKETINGZIELE
// ============================================================================

const marketingZiele = [
  {
    id: 'gewinn',
    label: 'Gewinnmaximierung',
    beschreibung: 'möglichst hohen Gewinn erzielen',
    kategorie: 'wirtschaftlich',
    erklaerung: 'Das Unternehmen will so viel Gewinn wie möglich erzielen – also möglichst viel mehr einnehmen, als es ausgibt. Der Gewinn ergibt sich aus: Umsatz minus alle Kosten.'
  },
  {
    id: 'marktanteil',
    label: 'Marktanteilssteigerung',
    beschreibung: 'den eigenen Marktanteil vergrößern',
    kategorie: 'wirtschaftlich',
    erklaerung: 'Das Unternehmen will einen größeren Anteil aller Verkäufe in seiner Branche auf sich vereinen. Werden z. B. in einer Branche 100 Produkte verkauft und das Unternehmen verkauft davon 20, hat es einen Marktanteil von 20 % – diesen Anteil will es vergrößern.'
  },
  {
    id: 'umsatz',
    label: 'Umsatzsteigerung',
    beschreibung: 'den Gesamtumsatz erhöhen',
    kategorie: 'wirtschaftlich',
    erklaerung: 'Das Unternehmen will mehr Einnahmen durch Verkäufe erzielen. Der Umsatz berechnet sich aus: verkaufte Menge × Preis. Er lässt sich steigern, indem mehr verkauft wird, der Preis erhöht wird – oder beides.'
  },
  {
    id: 'image',
    label: 'Imageverbesserung',
    beschreibung: 'das Ansehen des Unternehmens steigern',
    kategorie: 'qualitativ',
    erklaerung: 'Das Unternehmen will das Bild verbessern, das Kunden und die Öffentlichkeit von ihm haben. Ein gutes Image entsteht z. B. durch soziales Engagement, fairen Umgang mit Mitarbeitern oder umweltbewusstes Handeln – das kostet aber meist Geld.'
  },
  {
    id: 'kundenzufriedenheit',
    label: 'Kundenzufriedenheit',
    beschreibung: 'die Zufriedenheit der Kunden erhöhen',
    kategorie: 'qualitativ',
    erklaerung: 'Das Unternehmen will, dass seine Kunden so zufrieden sind, dass sie wiederkommen und es weiterempfehlen. Zufriedenheit entsteht, wenn das Produkt oder der Service die Erwartungen der Kunden erfüllt oder übertrifft – guter Service und Qualität kosten aber Geld.'
  },
  {
    id: 'neukundengewinnung',
    label: 'Neukundengewinnung',
    beschreibung: 'neue Kundengruppen erschließen',
    kategorie: 'wirtschaftlich',
    erklaerung: 'Das Unternehmen will Menschen ansprechen, die bisher noch nicht bei ihm gekauft haben – zum Beispiel durch Werbung, niedrigere Einstiegspreise oder neue Vertriebswege. Das erfordert Investitionen, also Geld.'
  },
  {
    id: 'kundenbindung',
    label: 'Kundenbindung',
    beschreibung: 'bestehende Kunden langfristig halten',
    kategorie: 'qualitativ',
    erklaerung: 'Das Unternehmen will, dass Kunden immer wieder bei ihm kaufen und nicht zur Konkurrenz wechseln. Mittel dazu sind z. B. Treueprogramme, Rabatte für Stammkunden oder besonders guter Service – das kostet aber ebenfalls Geld und Aufwand.'
  },
  {
    id: 'bekanntheit',
    label: 'Steigerung des Bekanntheitsgrades',
    beschreibung: 'das Unternehmen oder Produkt bekannter machen',
    kategorie: 'qualitativ',
    erklaerung: 'Das Unternehmen will, dass möglichst viele Menschen seinen Namen oder sein Produkt kennen. Je bekannter ein Unternehmen ist, desto mehr potenzielle Käufer gibt es – dafür sind meist teure Werbemaßnahmen nötig.'
  },
  {
    id: 'nachhaltigkeit',
    label: 'Nachhaltigkeit / Umweltschutz',
    beschreibung: 'umweltfreundlich und nachhaltig handeln',
    kategorie: 'gesellschaftlich',
    erklaerung: 'Das Unternehmen will seine Umweltbelastung reduzieren – z. B. durch weniger Verpackungsmüll, den Einsatz erneuerbarer Energien oder umweltfreundliche Produktionsmethoden. Das ist meist aufwendiger und teurer als herkömmliche Verfahren.'
  },
  {
    id: 'liquiditaet',
    label: 'Liquiditätssicherung',
    beschreibung: 'jederzeit zahlungsfähig bleiben',
    kategorie: 'wirtschaftlich',
    erklaerung: 'Das Unternehmen will sicherstellen, dass es seine Rechnungen, Löhne und laufenden Kosten jederzeit pünktlich bezahlen kann. Fehlt die Liquidität, droht die Zahlungsunfähigkeit – selbst dann, wenn das Unternehmen eigentlich Gewinne macht.'
  },
  {
    id: 'qualitaet',
    label: 'Qualitätsführerschaft',
    beschreibung: 'als qualitativ bestes Produkt am Markt gelten',
    kategorie: 'qualitativ',
    erklaerung: 'Das Unternehmen will das hochwertigste Produkt seiner Branche anbieten – nicht unbedingt das günstigste, sondern das beste. Dafür werden bessere Materialien, aufwendigere Verarbeitung und strenge Qualitätskontrollen eingesetzt, was höhere Kosten verursacht.'
  },
  {
    id: 'kosteneffizienz',
    label: 'Kosteneffizienz',
    beschreibung: 'Kosten senken und effizienter produzieren',
    kategorie: 'wirtschaftlich',
    erklaerung: 'Das Unternehmen will dasselbe Ergebnis mit möglichst wenig Aufwand erreichen – also Geld, Zeit und Material einsparen. Das gelingt z. B. durch optimierte Abläufe, den Einsatz von Maschinen oder günstigere Einkaufskonditionen.'
  },
];

// ============================================================================
// ZIELBEZIEHUNGEN (definiert für alle relevanten Paare)
// Schlüssel: 'id1__id2' (alphabetisch sortiert), damit egal welche Reihenfolge
// ============================================================================

function paarKey(id1, id2) {
  return [id1, id2].sort().join('__');
}

const zielbeziehungen = {
  // Gewinnmaximierung
  [paarKey('gewinn', 'marktanteil')]: {
    typ: 'konflikt',
    erklaerung: 'Marktanteilssteigerung erfordert oft niedrigere Preise oder hohe Werbeausgaben, was den Gewinn schmälert.'
  },
  [paarKey('gewinn', 'umsatz')]: {
    typ: 'harmonie',
    erklaerung: 'Mehr Umsatz führt bei gleichbleibenden Kosten zu höherem Gewinn – die Ziele ergänzen sich.'
  },
  [paarKey('gewinn', 'image')]: {
    typ: 'konflikt',
    erklaerung: 'Imageverbessernde Maßnahmen (z. B. Sponsoring, hochwertige Verpackung) kosten Geld und senken kurzfristig den Gewinn.'
  },
  [paarKey('gewinn', 'kundenzufriedenheit')]: {
    typ: 'konflikt',
    erklaerung: 'Höhere Kundenzufriedenheit erfordert oft Investitionen (Service, Qualität), die die Gewinnmarge senken.'
  },
  [paarKey('gewinn', 'neukundengewinnung')]: {
    typ: 'harmonie',
    erklaerung: 'Neue Kunden steigern den Umsatz, was langfristig den Gewinn erhöht.'
  },
  [paarKey('gewinn', 'kundenbindung')]: {
    typ: 'harmonie',
    erklaerung: 'Treue Kunden kaufen regelmäßig, was stabile Umsätze und damit Gewinne sichert.'
  },
  [paarKey('gewinn', 'bekanntheit')]: {
    typ: 'konflikt',
    erklaerung: 'Werbung und PR-Maßnahmen zur Steigerung des Bekanntheitsgrades verursachen Kosten, die den Gewinn senken.'
  },
  [paarKey('gewinn', 'nachhaltigkeit')]: {
    typ: 'konflikt',
    erklaerung: 'Umweltfreundliche Produktionsweisen sind häufig teurer und reduzieren so die Gewinnmarge.'
  },
  [paarKey('gewinn', 'liquiditaet')]: {
    typ: 'harmonie',
    erklaerung: 'Gewinne verbessern die Zahlungsfähigkeit eines Unternehmens – beide Ziele ergänzen sich.'
  },
  [paarKey('gewinn', 'qualitaet')]: {
    typ: 'konflikt',
    erklaerung: 'Höhere Qualität bedeutet oft höhere Produktionskosten, was den Gewinn je Stück senkt.'
  },
  [paarKey('gewinn', 'kosteneffizienz')]: {
    typ: 'harmonie',
    erklaerung: 'Wer Kosten senkt, erzielt bei gleichem Umsatz einen höheren Gewinn.'
  },

  // Marktanteil
  [paarKey('marktanteil', 'umsatz')]: {
    typ: 'harmonie',
    erklaerung: 'Ein größerer Marktanteil bedeutet in der Regel auch höheren Umsatz.'
  },
  [paarKey('marktanteil', 'image')]: {
    typ: 'harmonie',
    erklaerung: 'Ein positives Image zieht mehr Kunden an und hilft, den Marktanteil zu steigern.'
  },
  [paarKey('marktanteil', 'kundenzufriedenheit')]: {
    typ: 'harmonie',
    erklaerung: 'Zufriedene Kunden empfehlen das Unternehmen weiter, was den Marktanteil erhöht.'
  },
  [paarKey('marktanteil', 'neukundengewinnung')]: {
    typ: 'harmonie',
    erklaerung: 'Mehr Neukunden steigern direkt den Marktanteil.'
  },
  [paarKey('marktanteil', 'kundenbindung')]: {
    typ: 'harmonie',
    erklaerung: 'Gebundene Kunden stärken den bestehenden Marktanteil und reduzieren Kundenverluste.'
  },
  [paarKey('marktanteil', 'bekanntheit')]: {
    typ: 'harmonie',
    erklaerung: 'Wer bekannter ist, wird von mehr Kunden gewählt – der Marktanteil wächst.'
  },
  [paarKey('marktanteil', 'nachhaltigkeit')]: {
    typ: 'konflikt',
    erklaerung: 'Um schnell Marktanteile zu gewinnen, werden oft günstige Massenprodukte angeboten – das steht nachhaltiger, aufwendigerer Produktion entgegen.'
  },
  [paarKey('marktanteil', 'liquiditaet')]: {
    typ: 'konflikt',
    erklaerung: 'Aggressives Wachstum kostet Kapital – ein hoher Marktanteil kann die Liquidität kurzfristig belasten.'
  },
  [paarKey('marktanteil', 'qualitaet')]: {
    typ: 'harmonie',
    erklaerung: 'Hochwertige Produkte gewinnen Marktanteile, weil Kunden Qualität bevorzugen.'
  },
  [paarKey('marktanteil', 'kosteneffizienz')]: {
    typ: 'harmonie',
    erklaerung: 'Günstigere Preise durch Kosteneffizienz können den Marktanteil steigern.'
  },

  // Umsatz
  [paarKey('umsatz', 'image')]: {
    typ: 'harmonie',
    erklaerung: 'Ein gutes Image zieht mehr Käufer an und steigert den Umsatz.'
  },
  [paarKey('umsatz', 'kundenzufriedenheit')]: {
    typ: 'harmonie',
    erklaerung: 'Zufriedene Kunden kaufen mehr und öfter, was den Umsatz erhöht.'
  },
  [paarKey('umsatz', 'neukundengewinnung')]: {
    typ: 'harmonie',
    erklaerung: 'Mehr Kunden bedeuten mehr Verkäufe und damit höheren Umsatz.'
  },
  [paarKey('umsatz', 'kundenbindung')]: {
    typ: 'harmonie',
    erklaerung: 'Treue Kunden sorgen für regelmäßige Umsätze.'
  },
  [paarKey('umsatz', 'bekanntheit')]: {
    typ: 'harmonie',
    erklaerung: 'Höhere Bekanntheit führt zu mehr Nachfrage und damit zu höherem Umsatz.'
  },
  [paarKey('umsatz', 'nachhaltigkeit')]: {
    typ: 'konflikt',
    erklaerung: 'Nachhaltige Produkte sind oft teurer, was die Nachfrage und damit den Umsatz bremsen kann.'
  },
  [paarKey('umsatz', 'liquiditaet')]: {
    typ: 'harmonie',
    erklaerung: 'Höherer Umsatz verbessert den Geldfluss und sichert die Liquidität.'
  },
  [paarKey('umsatz', 'qualitaet')]: {
    typ: 'harmonie',
    erklaerung: 'Qualitätsprodukte rechtfertigen höhere Preise und steigern so den Umsatz.'
  },
  [paarKey('umsatz', 'kosteneffizienz')]: {
    typ: 'konflikt',
    erklaerung: 'Um mehr Umsatz zu erzielen, sind oft Investitionen in Werbung, Personal oder neue Produkte nötig – das widerspricht dem Ziel, Kosten zu senken.'
  },

  // Image
  [paarKey('image', 'kundenzufriedenheit')]: {
    typ: 'harmonie',
    erklaerung: 'Zufriedene Kunden berichten positiv – das verbessert das Image des Unternehmens.'
  },
  [paarKey('image', 'neukundengewinnung')]: {
    typ: 'harmonie',
    erklaerung: 'Ein gutes Image macht das Unternehmen attraktiv für potenzielle Neukunden.'
  },
  [paarKey('image', 'kundenbindung')]: {
    typ: 'harmonie',
    erklaerung: 'Kunden identifizieren sich mit einem positiven Markenimage und bleiben dem Unternehmen treu.'
  },
  [paarKey('image', 'bekanntheit')]: {
    typ: 'harmonie',
    erklaerung: 'Bekanntheit und Image bedingen sich oft gegenseitig – wer bekannt ist, wird auch wahrgenommen.'
  },
  [paarKey('image', 'nachhaltigkeit')]: {
    typ: 'harmonie',
    erklaerung: 'Nachhaltiges Handeln verbessert das öffentliche Bild des Unternehmens deutlich.'
  },
  [paarKey('image', 'liquiditaet')]: {
    typ: 'konflikt',
    erklaerung: 'Imagemaßnahmen wie Sponsoring, PR-Kampagnen oder hochwertige Verpackungen kosten viel Geld und können die Liquidität des Unternehmens belasten.'
  },
  [paarKey('image', 'qualitaet')]: {
    typ: 'harmonie',
    erklaerung: 'Hochwertige Produkte stärken das Ansehen des Unternehmens als Qualitätsanbieter.'
  },
  [paarKey('image', 'kosteneffizienz')]: {
    typ: 'konflikt',
    erklaerung: 'Kostensparmassnahmen (z. B. günstigere Materialien) können das Qualitätsimage beschädigen.'
  },

  // Kundenzufriedenheit
  [paarKey('kundenzufriedenheit', 'neukundengewinnung')]: {
    typ: 'harmonie',
    erklaerung: 'Zufriedene Kunden empfehlen das Unternehmen weiter – das bringt Neukunden.'
  },
  [paarKey('kundenzufriedenheit', 'kundenbindung')]: {
    typ: 'harmonie',
    erklaerung: 'Nur zufriedene Kunden bleiben langfristig treu – Zufriedenheit ist die Basis der Kundenbindung.'
  },
  [paarKey('kundenzufriedenheit', 'bekanntheit')]: {
    typ: 'harmonie',
    erklaerung: 'Positive Erfahrungen werden geteilt (Mundpropaganda, Bewertungen) und steigern die Bekanntheit.'
  },
  [paarKey('kundenzufriedenheit', 'nachhaltigkeit')]: {
    typ: 'harmonie',
    erklaerung: 'Viele Kunden schätzen nachhaltiges Handeln – das steigert ihre Zufriedenheit.'
  },
  [paarKey('kundenzufriedenheit', 'liquiditaet')]: {
    typ: 'konflikt',
    erklaerung: 'Maßnahmen zur Steigerung der Kundenzufriedenheit – z. B. besserer Service, Kulanzregelungen oder Qualitätsverbesserungen – kosten Geld und können die Liquidität belasten.'
  },
  [paarKey('kundenzufriedenheit', 'qualitaet')]: {
    typ: 'harmonie',
    erklaerung: 'Hohe Qualität erfüllt oder übertrifft Kundenerwartungen und erzeugt Zufriedenheit.'
  },
  [paarKey('kundenzufriedenheit', 'kosteneffizienz')]: {
    typ: 'konflikt',
    erklaerung: 'Kostensenkungen können sich negativ auf Qualität oder Service auswirken und die Zufriedenheit senken.'
  },

  // Neukundengewinnung
  [paarKey('neukundengewinnung', 'kundenbindung')]: {
    typ: 'konflikt',
    erklaerung: 'Ressourcen für Neukundenakquise fehlen oft bei der Betreuung von Bestandskunden – die Ziele konkurrieren um Budget.'
  },
  [paarKey('neukundengewinnung', 'bekanntheit')]: {
    typ: 'harmonie',
    erklaerung: 'Werbung steigert die Bekanntheit und macht es leichter, neue Kunden zu gewinnen.'
  },
  [paarKey('neukundengewinnung', 'nachhaltigkeit')]: {
    typ: 'harmonie',
    erklaerung: 'Nachhaltigkeit zieht umweltbewusste Neukunden an.'
  },
  [paarKey('neukundengewinnung', 'liquiditaet')]: {
    typ: 'konflikt',
    erklaerung: 'Neukundengewinnung erfordert Werbeinvestitionen, die die Liquidität kurzfristig belasten.'
  },
  [paarKey('neukundengewinnung', 'qualitaet')]: {
    typ: 'harmonie',
    erklaerung: 'Qualitätsprodukte sprechen sich herum und erleichtern die Gewinnung neuer Kunden.'
  },
  [paarKey('neukundengewinnung', 'kosteneffizienz')]: {
    typ: 'konflikt',
    erklaerung: 'Werbung und Akquisitionsmaßnahmen kosten Geld – das widerspricht dem Ziel der Kosteneffizienz.'
  },

  // Kundenbindung
  [paarKey('kundenbindung', 'bekanntheit')]: {
    typ: 'konflikt',
    erklaerung: 'Das Budget ist begrenzt: Wer viel Geld in Werbung für Neukunden steckt, hat weniger für die Pflege und Bindung bestehender Kunden – und umgekehrt.'
  },
  [paarKey('kundenbindung', 'nachhaltigkeit')]: {
    typ: 'harmonie',
    erklaerung: 'Kunden, die die Werte des Unternehmens teilen, bleiben ihm langfristig treu.'
  },
  [paarKey('kundenbindung', 'liquiditaet')]: {
    typ: 'harmonie',
    erklaerung: 'Treue Kunden sorgen für planbare Einnahmen, die die Liquidität sichern.'
  },
  [paarKey('kundenbindung', 'qualitaet')]: {
    typ: 'harmonie',
    erklaerung: 'Kunden, die dauerhaft hohe Qualität erleben, bleiben dem Unternehmen treu.'
  },
  [paarKey('kundenbindung', 'kosteneffizienz')]: {
    typ: 'konflikt',
    erklaerung: 'Kundenbindungsprogramme (Rabatte, Treuekarten, Service) kosten Geld und stehen der Kosteneffizienz entgegen.'
  },

  // Bekanntheit
  [paarKey('bekanntheit', 'nachhaltigkeit')]: {
    typ: 'harmonie',
    erklaerung: 'Nachhaltiges Engagement erzeugt Medienaufmerksamkeit und steigert die Bekanntheit.'
  },
  [paarKey('bekanntheit', 'liquiditaet')]: {
    typ: 'konflikt',
    erklaerung: 'Werbemaßnahmen zur Steigerung der Bekanntheit erfordern hohe Investitionen und beanspruchen die Liquidität.'
  },
  [paarKey('bekanntheit', 'qualitaet')]: {
    typ: 'harmonie',
    erklaerung: 'Qualitätsprodukte werden empfohlen und erhöhen so die Bekanntheit auf natürlichem Weg.'
  },
  [paarKey('bekanntheit', 'kosteneffizienz')]: {
    typ: 'konflikt',
    erklaerung: 'Werbung ist teuer – Bekanntheitssteigerung und Kosteneffizienz stehen häufig im Widerspruch.'
  },

  // Nachhaltigkeit
  [paarKey('nachhaltigkeit', 'liquiditaet')]: {
    typ: 'konflikt',
    erklaerung: 'Nachhaltige Investitionen (z. B. Solaranlagen, Recyclingprozesse) belasten die Liquidität kurzfristig.'
  },
  [paarKey('nachhaltigkeit', 'qualitaet')]: {
    typ: 'harmonie',
    erklaerung: 'Nachhaltige, hochwertige Materialien steigern oft die Produktqualität.'
  },
  [paarKey('nachhaltigkeit', 'kosteneffizienz')]: {
    typ: 'konflikt',
    erklaerung: 'Umweltfreundliche Prozesse sind oft aufwendiger und teurer als konventionelle Methoden.'
  },

  // Liquidität
  [paarKey('liquiditaet', 'qualitaet')]: {
    typ: 'konflikt',
    erklaerung: 'Investitionen in Qualität binden Kapital und können die Liquidität kurzfristig einschränken.'
  },
  [paarKey('liquiditaet', 'kosteneffizienz')]: {
    typ: 'harmonie',
    erklaerung: 'Wer Kosten spart, schont das Kapital und verbessert die Liquidität.'
  },

  // Qualität
  [paarKey('qualitaet', 'kosteneffizienz')]: {
    typ: 'konflikt',
    erklaerung: 'Hohe Qualität erfordert bessere Materialien und Verarbeitung – das widerspricht dem Ziel, Kosten zu minimieren.'
  },

  // Weitere Konfliktpaare
  [paarKey('gewinn', 'kundenbindung')]: {
    typ: 'konflikt',
    erklaerung: 'Kundenbindungsmaßnahmen wie Treueprogramme, Rabatte oder Sonderservice kosten Geld und senken damit den Gewinn.'
  },
  [paarKey('marktanteil', 'gewinn')]: {
    typ: 'konflikt',
    erklaerung: 'Marktanteilssteigerung erfordert oft niedrigere Preise oder hohe Werbeausgaben, was den Gewinn schmälert.'
  },
  [paarKey('umsatz', 'nachhaltigkeit')]: {
    typ: 'konflikt',
    erklaerung: 'Nachhaltige Produkte sind oft teurer, was die Nachfrage und damit den Umsatz bremsen kann.'
  },
  [paarKey('neukundengewinnung', 'qualitaet')]: {
    typ: 'konflikt',
    erklaerung: 'Um viele Neukunden anzusprechen, werden oft günstige Einstiegspreise oder Sonderangebote eingesetzt – das verträgt sich schlecht mit einer konsequenten Qualitätsführerschaft.'
  },
  [paarKey('kundenzufriedenheit', 'marktanteil')]: {
    typ: 'konflikt',
    erklaerung: 'Wer aggressiv auf Masse und Marktanteil setzt – z. B. durch Niedrigpreise – muss oft bei Qualität und Service sparen, was die Kundenzufriedenheit senken kann.'
  },
  [paarKey('nachhaltigkeit', 'umsatz')]: {
    typ: 'konflikt',
    erklaerung: 'Nachhaltige Produkte sind meist teurer und sprechen eine kleinere Zielgruppe an – das kann den Umsatz bremsen.'
  },
  [paarKey('qualitaet', 'neukundengewinnung')]: {
    typ: 'konflikt',
    erklaerung: 'Hohe Qualität bedeutet oft höhere Preise – das schreckt preisbewusste Neukunden ab und erschwert die Erschließung neuer Zielgruppen.'
  },
  [paarKey('kosteneffizienz', 'kundenzufriedenheit')]: {
    typ: 'konflikt',
    erklaerung: 'Wer Kosten spart – z. B. durch reduzierten Kundenservice oder günstigere Materialien – riskiert, dass die Qualität und damit die Kundenzufriedenheit sinkt.'
  },
  [paarKey('kosteneffizienz', 'image')]: {
    typ: 'konflikt',
    erklaerung: 'Sparmaßnahmen (z. B. günstigere Verpackung, weniger Werbung, einfachere Ausstattung) können das Erscheinungsbild des Unternehmens verschlechtern und das Image schädigen.'
  },
  [paarKey('liquiditaet', 'neukundengewinnung')]: {
    typ: 'konflikt',
    erklaerung: 'Neukundengewinnung erfordert Investitionen in Werbung und Vertrieb – das belastet die Liquidität, da das Geld erst später durch Einnahmen zurückfließt.'
  },
  [paarKey('bekanntheit', 'gewinn')]: {
    typ: 'konflikt',
    erklaerung: 'Werbung und PR-Maßnahmen zur Steigerung des Bekanntheitsgrades kosten viel Geld – das mindert kurzfristig den Gewinn.'
  },
  [paarKey('kundenbindung', 'kosteneffizienz')]: {
    typ: 'konflikt',
    erklaerung: 'Kundenbindungsprogramme wie Treuekarten, Rabattaktionen oder persönlicher Service verursachen laufende Kosten – das steht dem Ziel der Kosteneffizienz entgegen.'
  },
  [paarKey('qualitaet', 'marktanteil')]: {
    typ: 'konflikt',
    erklaerung: 'Hochwertige Produkte sind teurer und daher für viele Kunden unerschwinglich – das begrenzt die erreichbare Kundenzahl und damit den Marktanteil.'
  },
  [paarKey('nachhaltigkeit', 'marktanteil')]: {
    typ: 'konflikt',
    erklaerung: 'Nachhaltige Produkte haben oft höhere Preise und sprechen nur bestimmte Zielgruppen an – das macht es schwerer, einen großen Marktanteil zu gewinnen.'
  },
};

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const unternehmensVarianten = [
  (name) => name,
  (name) => `Firma ${name}`,
  (name) => `Unternehmen ${name}`,
];

// Erzeuge alle möglichen Ziel-Paare
function allePaare() {
  const paare = [];
  for (let i = 0; i < marketingZiele.length; i++) {
    for (let j = i + 1; j < marketingZiele.length; j++) {
      const z1 = marketingZiele[i];
      const z2 = marketingZiele[j];
      const key = paarKey(z1.id, z2.id);
      if (zielbeziehungen[key]) {
        paare.push({ z1, z2, beziehung: zielbeziehungen[key] });
      }
    }
  }
  return paare;
}

// ============================================================================
// HILFSFUNKTION – Zielerklärungsbox (für Aufgabentexte)
// ============================================================================

function zielInfoBox(z) {
  return `<div style="margin: 4px 0 4px 0; padding: 5px 10px; background:#f5f7fa; border-left: 3px solid #aac; font-size:0.88em; color:#333;">
    <strong>${z.label}:</strong> ${z.erklaerung}
  </div>`;
}

// ============================================================================
// SZENARIO-TEXTE (kontextualisierte Aufgabentexte, Du-Ansprache)
// ============================================================================

const szenarien = [
  (u, z1, z2) => `${u} verfolgt gleichzeitig zwei Marketingziele:<br>${zielInfoBox(z1)}${zielInfoBox(z2)}Handelt es sich um einen <strong>Zielkonflikt</strong> oder eine <strong>Zielharmonie</strong>? Begründe deine Entscheidung.`,
  (u, z1, z2) => `Die Geschäftsleitung von ${u} fragt sich, ob diese beiden Ziele gleichzeitig erreicht werden können:<br>${zielInfoBox(z1)}${zielInfoBox(z2)}Erkläre die Zielbeziehung zwischen den beiden Marketingzielen und begründe deine Antwort.`,
  (u, z1, z2) => `${u} plant, gleichzeitig folgende Ziele zu verfolgen:<br>${zielInfoBox(z1)}${zielInfoBox(z2)}Bestimme die Art der Zielbeziehung (<strong>Zielkonflikt, Zielharmonie</strong> oder <strong>Zielneutralität</strong>) und erläutere mögliche Auswirkungen.`,
  (u, z1, z2) => `Im Rahmen der Marketingplanung stellt ${u} folgende zwei Ziele auf:<br>${zielInfoBox(z1)}${zielInfoBox(z2)}Nimm Stellung: Unterstützen sich die Ziele gegenseitig, oder behindern sie sich? Begründe deine Antwort.`,
  (u, z1, z2) => `Folgende zwei Marketingziele stehen bei ${u} auf dem Programm:<br>${zielInfoBox(z1)}${zielInfoBox(z2)}Überlege, wie sich die Ziele gegenseitig beeinflussen, und bestimme die Zielbeziehung.`,
];

// ============================================================================
// HAUPTFUNKTION – ZIELBEZIEHUNGEN ANZEIGEN
// ============================================================================

function zeigeZufaelligeZielbeziehungen() {
  const anzahlSelect = document.getElementById('zielAnzahl');
  const anzahl = parseInt(anzahlSelect?.value) || 4;
  const container = document.getElementById('Container');

  if (!container) {
    console.error("Container nicht gefunden");
    return;
  }

  container.innerHTML = '';

  const kundeSelect = document.getElementById('zielKunde');
  const kundeValue = kundeSelect?.value?.trim() || '';
  const anzeigeName = kundeValue || '[Modellunternehmen]';

  // Alle definierten Paare holen, mischen, die gewünschte Anzahl nehmen
  let paare = shuffle(allePaare());

  // Falls weniger Paare als gewünscht vorhanden, wiederholen
  while (paare.length < anzahl) {
    paare = [...paare, ...shuffle(allePaare())];
  }
  const ausgewaehlte = paare.slice(0, anzahl);

  let aufgabenHTML = '<h2>Aufgaben</h2><ol>';
  let loesungenHTML = '<h2 class="loesung">Lösungen</h2>';

  ausgewaehlte.forEach((paar, idx) => {
    const { z1, z2, beziehung } = paar;
    const u = pick(unternehmensVarianten)(anzeigeName);
    const szenario = pick(szenarien);
    const text = szenario(u, z1, z2);

    aufgabenHTML += `<li style="margin-bottom: 1em;">${text}</li>`;

    const typFarbe = beziehung.typ === 'harmonie' ? '#2a7a2a' : beziehung.typ === 'konflikt' ? '#a00' : '#555';
    const typLabel = beziehung.typ === 'harmonie' ? '✅ Zielharmonie' : beziehung.typ === 'konflikt' ? '⚠️ Zielkonflikt' : '↔️ Zielneutralität';

    loesungenHTML += `
      <div style="margin-top: 1.5em;">
        <strong>${idx + 1}. ${z1.label} &amp; ${z2.label}</strong><br>
        <div style="border: 1px solid #ccc; background-color:#fff; font-family:courier; padding: 6px 10px; margin: 6px 0;">
          <span style="color:${typFarbe}; font-weight:bold;">${typLabel}</span><br>
          <span style="font-size:0.95em;">${beziehung.erklaerung}</span>
        </div>
      </div>`;
  });

  aufgabenHTML += '</ol>';
  container.innerHTML = aufgabenHTML + loesungenHTML;
}

// ============================================================================
// KI-ASSISTENT PROMPT
// ============================================================================

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Marketing-Assistent für Schülerinnen und Schüler der Realschule (BwR). Du hilfst beim Verständnis von Zielbeziehungen zwischen Marketingzielen.

Sprich die Schülerinnen und Schüler immer mit „du" an.

Aufgabe:
- Gib KEINE fertigen Lösungen (Zielkonflikt / Zielharmonie) vor.
- Führe die Schüler durch gezielte Fragen und Hinweise zur richtigen Einschätzung.
- Ziel: Lernförderung, nicht das Abnehmen der Denkarbeit.

Pädagogischer Ansatz:
- Frage nach den Eigenschaften der einzelnen Ziele (Was kostet das? Was bringt das? Für wen?).
- Stelle gezielte Rückfragen, um den Stand des Schülers zu verstehen.
- Beantworte deine Rückfragen nicht selbst, hake bei falschen Antworten nach.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Erst wenn alle Teilschritte richtig beantwortet wurden, bestätige den vollständigen Begriff.

Methodik bei Rückfragen:
- Welche Ressourcen (Geld, Zeit, Personal) braucht Ziel A?
- Welche Ressourcen braucht Ziel B?
- Konkurrieren die Ziele um dieselben Mittel?
- Hilft das Erreichen von Ziel A beim Erreichen von Ziel B – oder schadet es?
- Was passiert, wenn das Unternehmen mehr in A investiert – was passiert dann mit B?

Die drei Arten von Zielbeziehungen:

1. Zielharmonie
   - Das Erreichen von Ziel A unterstützt das Erreichen von Ziel B
   - Beide Ziele können gleichzeitig gut verfolgt werden
   - Beispiel: Kundenzufriedenheit und Kundenbindung

2. Zielkonflikt
   - Das Verfolgen von Ziel A erschwert oder verhindert das Erreichen von Ziel B
   - Das Unternehmen muss Prioritäten setzen
   - Beispiel: Gewinnmaximierung und Nachhaltigkeit

3. Zielneutralität
   - Ziel A und Ziel B beeinflussen sich kaum gegenseitig
   - Beide können unabhängig voneinander verfolgt werden
   - Beispiel: Marktanteil und Liquidität (in manchen Kontexten)

Erklärungen der Marketingziele für Schüler:
- Gewinnmaximierung: Mehr einnehmen als ausgeben – z. B. Brötchen für 0,80 € verkaufen, die nur 0,30 € kosten.
- Marktanteilssteigerung: Einen größeren Anteil aller Verkäufe in einer Branche gewinnen – z. B. von 20 % auf 30 % steigern.
- Umsatzsteigerung: Mehr Geld durch Verkäufe einnehmen – Menge × Preis erhöhen.
- Imageverbesserung: Das Ansehen verbessern – z. B. durch Sponsoring oder faire Arbeitsbedingungen.
- Kundenzufriedenheit: Kunden so zufriedenstellen, dass sie wiederkommen und weiterempfehlen.
- Neukundengewinnung: Neue Käufer ansprechen, die noch nie beim Unternehmen waren.
- Kundenbindung: Bestehende Kunden halten – z. B. durch Treuekarten oder guten Service.
- Bekanntheitsgrad: Mehr Menschen kennen das Unternehmen oder Produkt – z. B. durch Werbung.
- Nachhaltigkeit: Umweltfreundlich handeln – z. B. weniger Verpackung, erneuerbare Energien.
- Liquiditätssicherung: Immer genug Geld haben, um Rechnungen und Löhne pünktlich zu bezahlen.
- Qualitätsführerschaft: Das beste Produkt der Branche anbieten – z. B. wie Porsche bei Autos.
- Kosteneffizienz: Dasselbe Ergebnis mit weniger Aufwand erreichen – z. B. durch Maschinen statt Handarbeit.

Typische Abgrenzungsfehler der Schüler – darauf hinweisen, nicht vorwegnehmen:
- Zielharmonie ≠ „beide sind gut" – es kommt auf die gegenseitige Wirkung an
- Zielkonflikt ≠ „ein Ziel ist schlecht" – es geht um den Ressourcenwettbewerb
- Kurzfristige vs. langfristige Perspektive beachten (z. B. Nachhaltigkeitsinvestitionen)

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe – du-Ansprache
- Einfache Sprache, keine Fachbegriffe ohne Erklärung
- Kurze Antworten – maximal 1–2 Sätze pro Nachricht
- Gelegentlich Emojis zur Auflockerung 🎯📊✅❓⚠️

Was du NICHT tust:
- Nenne den Begriff (Zielkonflikt/Zielharmonie) nicht, bevor der Schüler ihn selbst erarbeitet hat
- Gib keine Lösungen auf Anfragen wie „sag mir einfach die Antwort" – erkläre, dass das Ziel das eigene Verstehen ist
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
  const kundeSelect = document.getElementById('zielKunde');

  if (kundeSelect && kundeSelect.value) {
    kunde = kundeSelect.value.trim();
  }

  kundeSelect.addEventListener('change', () => {
    kunde = kundeSelect.value.trim() || '';
  });

  if (!loadYamlFromLocalStorage()) {
    loadDefaultYaml();
  }

  if (yamlData && yamlData.length > 0) {
    fillCompanyDropdowns();
  } else {
    document.addEventListener('yamlDataLoaded', fillCompanyDropdowns, { once: true });
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

document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    autoSelectMyCompany();
    zeigeZufaelligeZielbeziehungen();
  }, 500);
});