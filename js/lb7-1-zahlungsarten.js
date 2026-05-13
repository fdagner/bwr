// ============================================================================
// GLOBALE VARIABLEN
// ============================================================================

let yamlData = [];
let kunde = '<i>[Modellunternehmen]</i>';

// ============================================================================
// YAML-DATEN LADEN
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

  const kundeSelect = document.getElementById('zahlKunde');
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
// PREISVALIDIERUNG
// ============================================================================

function validierePreisEingabe() {
  const minInput = document.getElementById('preisMin');
  const maxInput = document.getElementById('preisMax');
  const hinweis  = document.getElementById('preisHinweis');
  if (!minInput || !maxInput) return;

  let minVal = parseInt(minInput.value);
  let maxVal = parseInt(maxInput.value);
  const fehler = [];

  if (isNaN(minVal) || minVal < 1)    { minVal = 1;     minInput.value = 1; }
  if (minVal > 99998)                  { minVal = 99998; minInput.value = 99998; }
  if (isNaN(maxVal) || maxVal < 2)    { maxVal = 2;     maxInput.value = 2; }
  if (maxVal > 99999)                  { maxVal = 99999; maxInput.value = 99999; }

  if (minVal >= maxVal) {
    minVal = maxVal - 1;
    minInput.value = minVal;
    fehler.push(`Mindestpreis wurde auf ${minVal} € korrigiert (muss kleiner als Höchstpreis sein).`);
  }

  if (fehler.length > 0) {
    hinweis.textContent = '⚠️ ' + fehler.join(' ');
    hinweis.style.display = 'block';
    setTimeout(() => { hinweis.style.display = 'none'; }, 4000);
  } else {
    hinweis.style.display = 'none';
  }
}

function getPreisBereich() {
  const min = parseInt(document.getElementById('preisMin')?.value) || 10;
  const max = parseInt(document.getElementById('preisMax')?.value) || 500;
  return { min: Math.min(min, max - 1), max: Math.max(min + 1, max) };
}

function zufallsPreisInBereich(von, bis) {
  const step = 5;
  const schritte = Math.floor((bis - von) / step);
  if (schritte <= 0) return von;
  return von + Math.floor(Math.random() * (schritte + 1)) * step;
}

function einPreis() {
  const { min, max } = getPreisBereich();
  return zufallsPreisInBereich(min, max);
}



// ============================================================================
// ZAHLUNGSARTEN – DEFINITIONEN
// ============================================================================

const zahlungsarten = {
  barzahlung: {
    label: 'Barzahlung',
    emoji: '💵',
    merkmale: {
      praktikabilitaet: 'Sofort, keine Technik nötig',
      gebuehren: 'Keine Gebühren',
      sicherheit: 'Diebstahlgefahr; Kassenbeleg kann verloren gehen – kein automatischer Nachweis wie bei Kontoauszug',
      datenschutz: 'Anonym, keine Datenspur',
    },
    vorteile: ['Anonym und keine Datenspur', 'Sofort verfügbar, keine Technik nötig', 'Keine Gebühren', 'Keine Abhängigkeit von Strom oder Internet'],
    nachteile: ['Diebstahlgefahr bei größeren Beträgen', 'Kassenbeleg kann verloren gehen – kein automatischer Nachweis wie bei Kontoauszug', 'Unpraktisch bei großen Summen', 'Keine Möglichkeit bei Online-Käufen'],
    empfehlung: 'Geeignet für kleine Alltagseinkäufe und wenn Anonymität gewünscht ist.'
  },
  ec_karte: {
    label: 'Girocard / Debitkarte',
    emoji: '💳',
    merkmale: {
      praktikabilitaet: 'Weit verbreitet, kontaktlos oder mit PIN, sofort verfügbar',
      gebuehren: 'Meist kostenlos für Verbraucher; Händler zahlt geringe Gebühr',
      sicherheit: 'PIN-gesichert; bei Verlust sofort sperrbar; Haftung bei grober Fahrlässigkeit',
      datenschutz: 'Transaktionen bei der Bank gespeichert, kein anonymer Kauf',
    },
    vorteile: ['Sehr weit verbreitet im stationären Handel', 'Kontaktloses Zahlen möglich', 'Keine Jahresgebühr', 'Sofortige Kontobelastung – kein Überschuldungsrisiko'],
    nachteile: ['Nur bei ausreichender Kontodeckung nutzbar', 'Nicht überall im Ausland akzeptiert', 'Kein Käuferschutz wie bei Kreditkarte', 'Datenspur bei der Bank'],
    empfehlung: 'Ideal für alltägliche Einkäufe im stationären Handel in Deutschland.'
  },
  ueberweisung: {
    label: 'Überweisung',
    emoji: '🏦',
    merkmale: {
      praktikabilitaet: 'Einfach per Online-Banking; Standard-SEPA dauert 1–2 Tage, Echtzeit-SEPA sofort',
      gebuehren: 'In der Regel kostenlos bei Inlandsüberweisungen',
      sicherheit: 'Sicher mit TAN-Verfahren, nachvollziehbar',
      datenschutz: 'Daten bei der Bank gespeichert',
    },
    vorteile: ['Sicher durch TAN-Verfahren', 'Guter Zahlungsnachweis durch Kontoauszug', 'Kostenlos im SEPA-Raum', 'Echtzeit-SEPA ermöglicht sofortige Zahlung'],
    nachteile: ['Standard-SEPA nicht sofort verfügbar (1–2 Tage)', 'Benötigt Internetverbindung / Bankfiliale', 'IBAN des Empfängers nötig', 'Rückbuchung nur eingeschränkt möglich'],
    empfehlung: 'Ideal für regelmäßige Zahlungen, Rechnungen und größere Beträge. Bei Zeitdruck: Echtzeit-SEPA nutzen.'
  },
  lastschrift: {
    label: 'Lastschrift (SEPA)',
    emoji: '🔄',
    merkmale: {
      praktikabilitaet: 'Komfortabel, automatisch eingezogen',
      gebuehren: 'Meist kostenlos für den Zahler',
      sicherheit: 'Rückbuchung innerhalb von 8 Wochen möglich',
      datenschutz: 'Kontodaten beim Empfänger hinterlegt',
    },
    vorteile: ['Sehr komfortabel, kein aktives Handeln nötig', 'Rückbuchungsmöglichkeit bei unberechtigter Abbuchung', 'Keine Gefahr vergessener Zahlungen', 'Kostenlos für Verbraucher'],
    nachteile: ['Kontodaten müssen weitergegeben werden', 'Risiko bei unseriösen Anbietern', 'Erfordert aktives Überprüfen des Kontoauszugs', 'Kontodeckung muss sichergestellt sein'],
    empfehlung: 'Geeignet für regelmäßige, wiederkehrende Zahlungen (z. B. Strom, Streaming).'
  },
  kreditkarte: {
    label: 'Kreditkarte',
    emoji: '💳',
    merkmale: {
      praktikabilitaet: 'International einsetzbar, online und stationär',
      gebuehren: 'Jahresgebühr möglich; ggf. Fremdwährungsgebühren',
      sicherheit: '3D-Secure, Chargeback-Möglichkeit',
      datenschutz: 'Kartendaten beim Händler und Anbieter gespeichert',
    },
    vorteile: ['Weltweit einsetzbar', 'Käuferschutz durch Chargeback', 'Zahlungsziel bis Monatsende', 'Auch für große Beträge und Reisebuchungen geeignet'],
    nachteile: ['Jahresgebühr bei manchen Karten', 'Missbrauchsgefahr bei Datenverlust', 'Kann zu Überschuldung verleiten', 'Kartendaten werden gespeichert'],
    empfehlung: 'Geeignet für Reisen, Online-Shopping, internationale Käufe und wenn Käuferschutz wichtig ist.'
  },
  paypal: {
    label: 'Online-Bezahldienst (z. B. PayPal)',
    emoji: '🅿️',
    merkmale: {
      praktikabilitaet: 'Schnell, weit verbreitet im Online-Handel',
      gebuehren: 'Kostenlos für Käufer; Gebühren für Händler',
      sicherheit: 'Käuferschutz bei Nichtlieferung',
      datenschutz: 'Umfangreiche Nutzerdaten beim US-Anbieter',
    },
    vorteile: ['Schnell und einfach', 'Käuferschutz bei vielen Transaktionen', 'Bankdaten bleiben dem Händler unbekannt', 'Weit verbreitet im Online-Handel'],
    nachteile: ['Umfangreiche Datenweitergabe an US-Konzern', 'Konto kann eingefroren werden', 'Nicht überall verfügbar', 'Keine vollständige Anonymität'],
    empfehlung: 'Praktisch für Online-Käufe, wenn Käuferschutz gewünscht ist.'
  },
  mobilepay: {
    label: 'Mobile Payment (Apple Pay / Google Pay)',
    emoji: '📱',
    merkmale: {
      praktikabilitaet: 'Sehr schnell per Smartphone oder Smartwatch, kontaktlos',
      gebuehren: 'Keine direkten Gebühren für Verbraucher',
      sicherheit: 'Tokenisierung – echte Kartendaten werden nicht übertragen',
      datenschutz: 'Nutzungsdaten bei Apple bzw. Google',
    },
    vorteile: ['Sehr schnell und kontaktlos', 'Echte Kartendaten werden nicht übermittelt', 'Im stationären Handel weit verbreitet', 'Auch ohne physische Karte nutzbar'],
    nachteile: ['Abhängig von Smartphone-Akku und NFC', 'Nutzungsdaten bei Tech-Konzernen', 'Nicht überall akzeptiert', 'Gerät muss entsperrt sein'],
    empfehlung: 'Praktisch für schnelle Alltagseinkäufe im stationären Handel.'
  },
  nachnahme: {
    label: 'Zahlung per Nachnahme',
    emoji: '📦',
    merkmale: {
      praktikabilitaet: 'Zahlung bei Lieferung – kein Vorauszahlungsrisiko',
      gebuehren: 'Nachnahmegebühr ca. 3–5 € durch Paketdienstleister',
      sicherheit: 'Kein Vorleistungsrisiko; Ware wird erst bei Zahlung übergeben',
      datenschutz: 'Daten beim Händler und Paketdienstleister',
    },
    vorteile: ['Kein Vorauszahlungsrisiko', 'Keine Bankdaten nötig', 'Geeignet ohne Online-Banking', 'Schutz vor unseriösen Händlern'],
    nachteile: ['Nachnahmegebühr fällt an', 'Paket muss persönlich entgegengenommen werden', 'Ware kann bei Lieferung nicht vollständig geprüft werden', 'Kaum noch üblich, nicht überall möglich'],
    empfehlung: 'Sinnvoll bei unbekannten Online-Händlern ohne PayPal oder Kreditkarte.'
  },
};

// ============================================================================
// FALLBEISPIELE – FAMILIÄRE SITUATIONEN
// ============================================================================

const familienSituationen = [
  {
    situation: (name, preis) => `Familie ${name} kauft beim Bäcker um die Ecke frische Brötchen und Kuchen für insgesamt ${preis} €.`,
    kontext: 'Alltäglicher Kauf beim lokalen Händler, kleiner Betrag',
    preisGen: () => pick([16, 18, 20, 22, 24, 28, 32, 36, 38]),
    geeignet: ['barzahlung', 'ec_karte', 'mobilepay'],
    wenigerGeeignet: ['kreditkarte', 'nachnahme', 'ueberweisung'],
  },
  {
    situation: (name, preis) => `Familie ${name} möchte online ein neues Fahrrad für ${preis} € bestellen. Der Händler ist noch unbekannt und hat kaum Bewertungen im Internet.`,
    kontext: 'Online-Kauf bei unbekanntem Händler, mittlerer Betrag',
    preisGen: () => pick([400, 500, 550, 650, 750, 800, 850, 900]),
    geeignet: ['nachnahme', 'paypal', 'kreditkarte'],
    wenigerGeeignet: ['barzahlung', 'ueberweisung', 'ec_karte'],
  },
  {
    situation: (name, preis) => `Herr ${name} bucht für seine Familie einen Sommerurlaub in Spanien für ${preis} €. Er möchte auch im Ausland sicher zahlen können und legt Wert auf Stornoschutz.`,
    kontext: 'Reisebuchung, großer Betrag, internationaler Kontext, Stornoschutz wichtig',
    preisGen: () => pick([3000, 3200, 3500, 3600, 3800, 4000]),
    geeignet: ['kreditkarte', 'ueberweisung'],
    wenigerGeeignet: ['barzahlung', 'lastschrift', 'nachnahme', 'ec_karte'],
  },
  {
    situation: (name, preis) => `Frau ${name} schließt einen Vertrag für einen Streaming-Dienst ab. Monatlich werden ${preis} € fällig. Sie möchte nichts vergessen und den Ablauf automatisieren.`,
    kontext: 'Monatliche Abo-Zahlung, Automatisierung gewünscht',
    preisGen: () => pick([15, 20, 25, 30]),
    geeignet: ['lastschrift', 'kreditkarte', 'paypal'],
    wenigerGeeignet: ['barzahlung', 'nachnahme', 'ec_karte'],
  },
  {
    situation: (name, preis) => `Tochter ${name} (16 Jahre) möchte im Schulausflug-Café bezahlen. Ihr Anteil beträgt ${preis} €. Sie hat kein eigenes Konto.`,
    kontext: 'Jugendliche ohne Bankkonto, kleiner Betrag, sofort',
    preisGen: () => pick([5, 6, 7, 8, 9, 10]),
    geeignet: ['barzahlung'],
    wenigerGeeignet: ['kreditkarte', 'ueberweisung', 'nachnahme', 'ec_karte'],
  },
  {
    situation: (name, preis) => `Familie ${name} kauft beim lokalen Möbelhändler ein neues Sofa für ${preis} €. Der Händler akzeptiert nur Barzahlung oder Überweisung.`,
    kontext: 'Stationärer Kauf, großer Betrag, eingeschränkte Zahlungsmittel',
    preisGen: () => pick([600, 700, 750, 800, 900, 1000]),
    geeignet: ['barzahlung', 'ueberweisung'],
    wenigerGeeignet: ['paypal', 'mobilepay', 'nachnahme', 'ec_karte'],
  },
  {
    situation: (name, preis) => `Herr ${name} möchte seiner Tochter schnell ${preis} € schicken, damit sie an der Klassenfahrt teilnehmen kann. Die Zahlung muss bis morgen früh beim Veranstalter eingehen.`,
    kontext: 'Eilige Zahlung, Zeitdruck, muss sofort ankommen',
    preisGen: () => pick([80, 100, 120, 150]),
    geeignet: ['ueberweisung'],
    wenigerGeeignet: ['barzahlung', 'nachnahme', 'lastschrift', 'ec_karte'],
  },
  {
    situation: (name, preis) => `Frau ${name} tankt ihr Auto für ${preis} € an einer Autobahntankstelle und möchte schnell und kontaktlos zahlen.`,
    kontext: 'Schnellzahlung, stationär, kontaktlos gewünscht',
    preisGen: () => pick([55, 60, 65, 70, 75, 80, 90, 100]),
    geeignet: ['mobilepay', 'kreditkarte', 'ec_karte'],
    wenigerGeeignet: ['nachnahme', 'barzahlung', 'ueberweisung'],
  },
  {
    situation: (name, preis) => `Familie ${name} kauft ein neues Smartphone für ${preis} €. Sie haben nicht genug Erspartes, möchten das Gerät aber sofort haben und in Raten zahlen.`,
    kontext: 'Große Anschaffung, Ratenzahlung gewünscht – Zahlung selbst per Lastschrift oder Überweisung',
    preisGen: () => pick([500, 600, 700, 800, 900, 1000]),
    geeignet: ['kreditkarte', 'lastschrift'],
    wenigerGeeignet: ['barzahlung', 'nachnahme', 'ec_karte'],
  },
  {
    situation: (name, preis) => `Opa ${name} möchte einen Online-Einkauf bei einem bekannten Versandhaus über ${preis} € tätigen. Er hat kein Smartphone und möchte seine Bankdaten nicht online eingeben.`,
    kontext: 'Älterer Nutzer, Datenschutzbedenken, Online-Kauf',
    preisGen: () => pick([30, 40, 50, 60, 70, 80]),
    geeignet: ['nachnahme', 'ueberweisung'],
    wenigerGeeignet: ['mobilepay', 'paypal', 'ec_karte'],
  },
  {
    situation: (name, preis) => `Frau ${name} kauft auf einem Wochenmarkt frisches Gemüse und Käse für ${preis} €. Der Marktstand hat kein Kartenterminal.`,
    kontext: 'Wochenmarkt, kein Kartenterminal, kleiner Betrag',
    preisGen: () => pick([14, 15, 18, 20, 22, 24, 26, 28]),
    geeignet: ['barzahlung'],
    wenigerGeeignet: ['kreditkarte', 'paypal', 'ueberweisung', 'mobilepay', 'ec_karte'],
  },
  {
    situation: (name, preis) => `Familie ${name} mietet für den Urlaub ein Ferienhaus und soll ${preis} € Anzahlung leisten. Der Vermieter möchte einen schriftlichen Zahlungsnachweis.`,
    kontext: 'Mietanzahlung, Nachweis gewünscht, größerer Betrag',
    preisGen: () => pick([500, 750, 1000, 1250, 1500]),
    geeignet: ['ueberweisung', 'kreditkarte'],
    wenigerGeeignet: ['barzahlung', 'nachnahme', 'lastschrift'],
  },
  {
    situation: (name, preis) => `Familie ${name} bestellt Essen bei einem Lieferdienst für ${preis} €. Die Lieferung kommt in ca. 30–40 Minuten.`,
    kontext: 'Essenslieferung, Online-Bestellung, mittlerer Betrag',
    preisGen: () => pick([28, 35, 42, 48, 55, 62]),
    geeignet: ['paypal', 'kreditkarte', 'mobilepay'],
    wenigerGeeignet: ['barzahlung', 'nachnahme', 'ueberweisung'],
  },
  {
    situation: (name, preis) => `Herr ${name} lässt seine Waschmaschine reparieren – der Handwerker verlangt ${preis} € und gibt eine ordentliche Rechnung aus.`,
    kontext: 'Handwerker vor Ort, mittlerer Betrag, Rechnung vorhanden',
    preisGen: () => pick([180, 220, 260, 290, 340, 380]),
    geeignet: ['barzahlung', 'ueberweisung', 'ec_karte'],
    wenigerGeeignet: ['paypal', 'lastschrift', 'nachnahme'],
  },
  {
    situation: (name, preis) => `Familie ${name} spendet ${preis} € an eine gemeinnützige Organisation und möchte eine Spendenquittung für die Steuererklärung.`,
    kontext: 'Spende, Nachweis für Steuer wichtig',
    preisGen: () => pick([50, 75, 100, 120, 150, 200, 250]),
    geeignet: ['ueberweisung', 'lastschrift', 'kreditkarte'],
    wenigerGeeignet: ['barzahlung', 'nachnahme'],
  },
  {
    situation: (name, preis) => `Tochter ${name} (19) bucht sich mit Freundinnen ein Festival-Ticket für ${preis} € pro Person. Die Tickets sind nur online erhältlich.`,
    kontext: 'Online-Ticketkauf, junges Publikum, mittlerer Betrag',
    preisGen: () => pick([89, 109, 129, 149, 169, 189]),
    geeignet: ['kreditkarte', 'paypal'],
    wenigerGeeignet: ['barzahlung', 'nachnahme', 'lastschrift'],
  },
  {
    situation: (name, preis) => `Familie ${name} kauft im Baumarkt Terrassenplatten, Erde und Pflanzen im Wert von ${preis} € und möchte alles sofort mitnehmen.`,
    kontext: 'Großer Einkauf im stationären Fachhandel',
    preisGen: () => pick([320, 380, 450, 520, 580, 650]),
    geeignet: ['ec_karte', 'kreditkarte', 'mobilepay', 'barzahlung'],
    wenigerGeeignet: ['paypal', 'nachnahme', 'lastschrift'],
  },
  {
    situation: (name, preis) => `Frau ${name} muss kurzfristig einen Flug innerhalb Deutschlands für morgen buchen – das Ticket kostet ${preis} €. Sie möchte maximale Flexibilität bei einer möglichen Stornierung.`,
    kontext: 'Last-Minute-Flugbuchung, Stornierungsoption wichtig',
    preisGen: () => pick([180, 220, 260, 310, 360, 420]),
    geeignet: ['kreditkarte', 'paypal'],
    wenigerGeeignet: ['barzahlung', 'nachnahme', 'lastschrift', 'ec_karte'],
  },
  {
    situation: (name, preis) => `Oma ${name} lässt sich vom Taxi nach Hause fahren. Die Fahrt kostet ${preis} € und sie hat nur Bargeld dabei.`,
    kontext: 'Taxi, ältere Person, Barzahlung üblich',
    preisGen: () => pick([18, 22, 26, 32, 38, 45]),
    geeignet: ['barzahlung'],
    wenigerGeeignet: ['ueberweisung', 'paypal', 'nachnahme'],
  },
  {
    situation: (name, preis) => `Familie ${name} richtet für den Sohn einen Dauerauftrag ein, um monatlich ${preis} € Vereinsbeitrag an den Fußballverein zu überweisen.`,
    kontext: 'Wiederkehrende Zahlung, Dauerauftrag, kleiner bis mittlerer Betrag',
    preisGen: () => pick([15, 20, 25, 30, 35, 40]),
    geeignet: ['ueberweisung', 'lastschrift'],
    wenigerGeeignet: ['barzahlung', 'nachnahme', 'ec_karte', 'mobilepay'],
  },
  {
    situation: (name, preis) => `Herr ${name} kauft im Supermarkt den Wocheneinkauf für die Familie – Gesamtbetrag ${preis} €. Er möchte schnell und unkompliziert an der Kasse zahlen.`,
    kontext: 'Supermarkt, mittlerer Betrag, schnelle Abwicklung',
    preisGen: () => pick([45, 55, 65, 75, 85, 95, 110]),
    geeignet: ['ec_karte', 'mobilepay', 'barzahlung'],
    wenigerGeeignet: ['ueberweisung', 'nachnahme', 'kreditkarte'],
  },
];

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

const familienNamen = [
  'Müller', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker',
  'Schulz', 'Hoffmann', 'Koch', 'Richter', 'Klein', 'Wolf', 'Schröder',
  'Neumann', 'Braun', 'Zimmermann', 'Krüger', 'Hartmann', 'Schmitt',
];

// ============================================================================
// HAUPTFUNKTION – ZAHLUNGSVERKEHR AUFGABEN ANZEIGEN
// ============================================================================

function zeigeZufaelligeZahlungsaufgaben() {
  const container = document.getElementById('Container');
  if (!container) { console.error("Container nicht gefunden"); return; }

  container.innerHTML = '';

  const anzahlInput = document.getElementById('anzahlAufgaben');
  const anzahl = Math.min(parseInt(anzahlInput?.value) || 4, familienSituationen.length);

  const ausgewaehlte = shuffle(familienSituationen).slice(0, anzahl);

  // ── 1. Übersichtstabelle ZUERST ─────────────────────────────────────────
  let tabelleHTML = ``;

  // ── 2. Aufgaben ──────────────────────────────────────────────────────────
  let aufgabenHTML = '<h2>Aufgaben</h2>';
  aufgabenHTML += '<p style="font-style: italic; color: #555; font-size: 0.95rem;">Lies die folgenden Fallbeispiele. Entscheide dich für eine oder mehrere geeignete Zahlungsarten. Begründe deine Wahl anhand der Kriterien <strong>Praktikabilität, Gebühren, Sicherheit</strong> und <strong>Datenschutz</strong>.</p>';
  aufgabenHTML += '<ol>';

  let loesungenHTML = '<h2>Lösung</h2>';

  ausgewaehlte.forEach((fall, idx) => {
    const name = pick(familienNamen);
    const preis = fall.preisGen();
    const situationstext = fall.situation(name, preis.toLocaleString('de-DE'));
    const geeigneteArten = fall.geeignet;
    const wenigerGeeignet = fall.wenigerGeeignet;

    aufgabenHTML += `<li style="margin-bottom: 1.2em;">${situationstext}</li>`;

    // Lösung
    loesungenHTML += `<div style="margin-top: 1.5em; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden;">`;
    loesungenHTML += `<div style="background: #f5f5f5; padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #e0e0e0;">`;
    loesungenHTML += `Aufgabe ${idx + 1}: ${fall.kontext}</div>`;
    loesungenHTML += `<div style="padding: 10px 14px;">`;

    loesungenHTML += `<p style="margin: 6px 0; color: #2a7a2a;"><strong>✅ Geeignete Zahlungsarten:</strong></p>`;
    geeigneteArten.forEach(key => {
      const z = zahlungsarten[key];
      if (!z) return;
      loesungenHTML += `<div style="border: 1px solid #ccc; background:#fff; font-family: courier; padding: 6px 10px; margin: 4px 0; font-size: 0.9rem;">`;
      loesungenHTML += `<strong>${z.emoji} ${z.label}</strong><br>`;
      loesungenHTML += `🔹 Praktikabilität: ${z.merkmale.praktikabilitaet}<br>`;
      loesungenHTML += `🔹 Gebühren: ${z.merkmale.gebuehren}<br>`;
      loesungenHTML += `🔹 Sicherheit: ${z.merkmale.sicherheit}<br>`;
      loesungenHTML += `🔹 Datenschutz: ${z.merkmale.datenschutz}<br>`;
      loesungenHTML += `<em>➡️ ${z.empfehlung}</em>`;
      loesungenHTML += `</div>`;
    });

    loesungenHTML += `<p style="margin: 10px 0 4px; color: #a00;"><strong>❌ Weniger geeignet in diesem Fall:</strong></p>`;
    loesungenHTML += `<div style="font-family: courier; font-size: 0.9rem; padding: 4px 8px; background: #fff5f5; border: 1px solid #f5c6c6; border-radius: 4px;">`;
    loesungenHTML += wenigerGeeignet.map(key => {
      const z = zahlungsarten[key];
      return z ? `${z.emoji} ${z.label}` : key;
    }).join(' &nbsp;|&nbsp; ');
    loesungenHTML += `</div>`;
    loesungenHTML += `</div></div>`;
  });

  aufgabenHTML += '</ol>';

  container.innerHTML = tabelleHTML + aufgabenHTML + loesungenHTML;
}

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Wirtschaftsassistent für Schüler der Realschule (BwR). Du hilfst beim Verständnis von Zahlungsarten im Alltag.
Du forderst den Schüler auf, ein Fallbeispiel zu nennen, das er bekommen hat.
Arbeitsauftrag ist immer: "Entscheide dich für eine oder mehrere geeignete Zahlungsarten. Begründe deine Wahl anhand der Kriterien Praktikabilität, Gebühren, Sicherheit und Datenschutz.

Aufgabe:
- Gib KEINE fertigen Lösungen (z. B. direkte Empfehlungen) vor.
- Führe die Schüler durch gezielte Fragen zur richtigen Abwägung.
- Ziel: Lernförderung, kritisches Verbraucherdenken.

Pädagogischer Ansatz:
- Frage, welche Merkmale in der Situation wichtig sind (Betrag? Ort? Datenschutz? Geschwindigkeit?).
- Stelle gezielte Rückfragen, um den Stand des Schülers zu verstehen.
- Beantworte deine Rückfragen nicht selbst.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Erst wenn der Schüler selbst auf eine begründete Antwort kommt, bestätige ihn.

Methodik bei Rückfragen:
- Wie groß ist der Betrag – lohnt sich die Zahlung mit Karte/App?
- Findet der Kauf stationär oder online statt?
- Ist Anonymität oder Datenschutz in dieser Situation wichtig?
- Ist Sicherheit oder Rückbuchungsmöglichkeit relevant?
- Fallen Gebühren an, die bei dem Betrag ins Gewicht fallen?

Die acht Zahlungsarten:

1. Barzahlung
   - Kein Konto, keine Technik nötig, anonym
   - Diebstahlgefahr, kein automatischer Nachweis

2. Girocard / Debitkarte (Girocard)
   - Weit verbreitet im stationären Handel, kontaktlos oder PIN, keine Jahresgebühr
   - Nur bei Kontodeckung nutzbar, kein Käuferschutz wie bei Kreditkarte

3. Überweisung (SEPA)
   - Sicher, nachvollziehbar, kostenlos; Echtzeit-SEPA auch sofort möglich
   - Standard-SEPA dauert 1–2 Tage, IBAN des Empfängers nötig

4. Lastschrift (SEPA)
   - Komfortabel, automatisch, Rückbuchung innerhalb von 8 Wochen möglich
   - Kontodaten beim Empfänger, Kontodeckung muss sichergestellt sein

5. Kreditkarte
   - International einsetzbar, Käuferschutz durch Chargeback, auch für Reisen geeignet
   - Jahresgebühr möglich, kann zu Überschuldung verleiten

6. Online-Bezahldienst (z. B. PayPal)
   - Schnell, Käuferschutz, Bankdaten bleiben dem Händler unbekannt
   - Umfangreiche Datenweitergabe an US-Konzern, Konto kann eingefroren werden

7. Mobile Payment (Apple Pay / Google Pay)
   - Kontaktlos, sehr schnell, echte Kartendaten werden nicht übertragen
   - Abhängig von Smartphone-Akku und NFC, Nutzungsdaten bei Tech-Konzernen

8. Nachnahme
   - Kein Vorauszahlungsrisiko, keine Bankdaten nötig
   - Nachnahmegebühr ca. 3–5 €, Paket muss persönlich entgegengenommen werden

Wichtiger Hinweis für dich:

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe mit Realschülerinnen und -schülern
- Einfache Sprache, keine Fachbegriffe ohne Erklärung
- Kurze Antworten – maximal 1–2 Sätze pro Nachricht
- Gelegentlich Emojis zur Auflockerung 💳💵📱🔒

Was du NICHT tust:
- Nenne die beste Zahlungsart nicht direkt, bevor der Schüler argumentiert hat
- Gib keine Lösungen auf Anfragen wie „sag mir einfach die Antwort"
- Erkläre, dass das Ziel das eigene Abwägen und kritische Denken ist
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
  const kundeSelect = document.getElementById('zahlKunde');
  if (kundeSelect) {
    if (kundeSelect.value) {
      kunde = kundeSelect.value.trim();
    }
    kundeSelect.addEventListener('change', () => {
      kunde = kundeSelect.value.trim() || '';
    });
  }

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
    zeigeZufaelligeZahlungsaufgaben();
  }, 500);
});