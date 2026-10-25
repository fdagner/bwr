// ============================================================================
// GLOBALE VARIABLEN
// ============================================================================

let letzteZahlungsAufgaben = [];


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
};

// ============================================================================
// FALLBEISPIELE – FAMILIÄRE SITUATIONEN
// ============================================================================

const familienSituationen = [
  {
    situation: (n, preis) => `Familie ${n} kauft beim Bäcker um die Ecke Brötchen und Kuchen für ${preis} €.`,
    preisGen: () => pick([8, 10, 12, 15, 18]),
    loesung: [
      { art: 'barzahlung', grund: 'Bei kleinen Beträgen geht Bargeld schnell und kostet nichts.' },
      { art: 'ec_karte', grund: 'Mit der Girocard kann man kontaktlos und ohne Bargeld zahlen.' },
    ],
  },
  {
    situation: (n, preis) => `Familie ${n} möchte online ein Fahrrad für ${preis} € kaufen. Der Händler ist ihr unbekannt und sie hat Angst, dass das Fahrrad nicht ankommt.`,
    preisGen: () => pick([400, 500, 650, 800]),
    loesung: [
      { art: 'paypal', grund: 'Der Käuferschutz hilft, wenn die Ware nicht ankommt.' },
      { art: 'kreditkarte', grund: 'Bei Problemen kann das Geld zurückgefordert werden.' },
    ],
  },
  {
    situation: (n, preis) => `Herr ${n} bucht online einen Familienurlaub in Spanien für ${preis} €.`,
    preisGen: () => pick([2000, 2500, 3000, 3500]),
    loesung: [
      { art: 'kreditkarte', grund: 'Sie ist weltweit einsetzbar und bei großen Online-Buchungen üblich.' },
      { art: 'ueberweisung', grund: 'Sie ist sicher und gut nachweisbar, und viele Reiseanbieter akzeptieren sie.' },
    ],
  },
  {
    situation: (n, preis) => `Frau ${n} schließt ein Streaming-Abo ab. Jeden Monat werden ${preis} € fällig. Sie möchte nicht jeden Monat daran denken müssen.`,
    preisGen: () => pick([8, 10, 13, 15]),
    loesung: [
      { art: 'lastschrift', grund: 'Der Betrag wird jeden Monat automatisch abgebucht.' },
      { art: 'paypal', grund: 'Die Abbuchung läuft automatisch über das PayPal-Konto.' },
    ],
  },
  {
    situation: (n, preis, v) => `${v} (16) hat noch kein eigenes Konto. Im Schulcafé kostet das Mittagessen ${preis} €.`,
    preisGen: () => pick([3, 4, 5, 6]),
    loesung: [
      { art: 'barzahlung', grund: 'Ohne Konto und Karte ist Bargeld die einzige Möglichkeit.' },
    ],
  },
  {
    situation: (n, preis) => `Frau ${n} kauft auf dem Wochenmarkt Gemüse und Käse für ${preis} €. Der Stand hat kein Kartenlesegerät.`,
    preisGen: () => pick([14, 18, 22, 26]),
    loesung: [
      { art: 'barzahlung', grund: 'Ohne Kartenlesegerät kann man dort nur bar bezahlen.' },
    ],
  },
  {
    situation: (n, preis) => `Frau ${n} tankt für ${preis} € und möchte schnell und kontaktlos bezahlen.`,
    preisGen: () => pick([55, 65, 75, 90]),
    loesung: [
      { art: 'ec_karte', grund: 'Kontaktlos mit der Girocard geht es in wenigen Sekunden.' },
      { art: 'mobilepay', grund: 'Mit dem Smartphone ist kontaktloses Zahlen ohne Karte möglich.' },
    ],
  },
  {
    situation: (n, preis) => `Familie ${n} lässt die Waschmaschine reparieren. Der Handwerker schickt eine Rechnung über ${preis} €.`,
    preisGen: () => pick([180, 240, 290, 340]),
    loesung: [
      { art: 'ueberweisung', grund: 'Die Rechnung wird bequem per Online-Banking bezahlt, der Kontoauszug dient als Nachweis.' },
    ],
  },
  {
    situation: (n, preis, v) => `Der Sportverein von ${v} verlangt jeden Monat ${preis} € Beitrag. Familie ${n} möchte nicht jeden Monat selbst daran denken.`,
    preisGen: () => pick([15, 20, 25, 30]),
    loesung: [
      { art: 'lastschrift', grund: 'Der Verein bucht den Beitrag automatisch ab.' },
      { art: 'ueberweisung', grund: 'Mit einem Dauerauftrag wird der Beitrag jeden Monat automatisch überwiesen.' },
    ],
  },
  {
    situation: (n, preis, v) => `${v} (19) kauft ein Festival-Ticket für ${preis} €. Das Ticket gibt es nur im Internet.`,
    preisGen: () => pick([89, 109, 129, 149]),
    loesung: [
      { art: 'paypal', grund: 'Schnell bezahlt, und der Käuferschutz hilft, wenn das Ticket nicht ankommt.' },
      { art: 'kreditkarte', grund: 'Online weit verbreitet, und bei Problemen kann man das Geld zurückfordern.' },
    ],
  },
  {
    situation: (n, preis) => `Frau ${n} fährt mit dem Taxi nach Hause. Die Fahrt kostet ${preis} €. Sie hat nur Bargeld dabei.`,
    preisGen: () => pick([18, 22, 26, 32]),
    loesung: [
      { art: 'barzahlung', grund: 'Sie hat nur Bargeld dabei, und das nimmt der Taxifahrer immer an.' },
    ],
  },
  {
    situation: (n, preis) => `Herr ${n} bezahlt an der Supermarktkasse den Wocheneinkauf von ${preis} €.`,
    preisGen: () => pick([45, 65, 85, 110]),
    loesung: [
      { art: 'ec_karte', grund: 'Mit der Girocard geht es schnell und ohne Gebühren für den Kunden.' },
      { art: 'mobilepay', grund: 'Mit dem Smartphone kann man kontaktlos zahlen.' },
      { art: 'barzahlung', grund: 'Bargeld funktioniert an jeder Kasse.' },
      { art: 'kreditkarte', grund: 'Sie wird in vielen Supermärkten akzeptiert, ist im Alltag aber seltener als die Girocard.' },
    ],
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

const vornamen = ['Lena', 'Paul', 'Mia', 'Jonas', 'Emma', 'Luca', 'Anna', 'Felix', 'Sophie', 'Tim'];

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

  const vorschauEl = document.getElementById('kiPromptVorschau');
  if (vorschauEl) vorschauEl.textContent = erstelleKiPromptText();

  const anzahlInput = document.getElementById('anzahlAufgaben');
  const anzahl = Math.min(parseInt(anzahlInput?.value) || 4, familienSituationen.length);
  const ausgewaehlte = shuffle(familienSituationen).slice(0, anzahl);

  let aufgabenHTML = '<h2>Fallbeispiele: Zahlungsarten</h2>';
  aufgabenHTML += '<p style="font-style: italic; color: #555; font-size: 0.95rem;">Lies die Fallbeispiele. Entscheide dich für eine geeignete Zahlungsart.</p>';
  aufgabenHTML += '<ol>';

  let loesungenHTML = '<h2 class="loesung">Lösung</h2>';
  letzteZahlungsAufgaben = [];
  loesungenHTML += '<p style="font-style: italic; color: #555; font-size: 0.95rem;">Mehrere Zahlungsarten können richtig sein, wenn die Begründung zur Situation passt.</p>';

  ausgewaehlte.forEach((fall, idx) => {
    const name = pick(familienNamen);
    const vorname = pick(vornamen);
    const preis = fall.preisGen();
    const text = fall.situation(name, preis.toLocaleString('de-DE'), vorname);
    letzteZahlungsAufgaben.push({ text, loesung: fall.loesung });

    aufgabenHTML += `<li style="margin-bottom: 1.2em;">${text}</li>`;

    loesungenHTML += `<div style="margin-top: 1.2em;"><strong>${idx + 1}.</strong>`;
    fall.loesung.forEach(({ art, grund }) => {
      const z = zahlungsarten[art];
      if (!z) return;
      loesungenHTML += `<div style="border: 1px solid #ccc; background:#fff; font-family: courier; padding: 6px 10px; margin: 4px 0; font-size: 0.9rem;"><strong>${z.emoji} ${z.label}</strong> – ${grund}</div>`;
    });
    loesungenHTML += `</div>`;
  });

  aufgabenHTML += '</ol>';
  container.innerHTML = aufgabenHTML + loesungenHTML;
}

function erstelleKiPromptText() {
  let aufgabenBlock;

  if (!letzteZahlungsAufgaben.length) {
    aufgabenBlock = '(Noch keine Aufgaben generiert.)';
  } else {
    aufgabenBlock = letzteZahlungsAufgaben.map(({ text, loesung }, i) => {
      const loesungText = loesung
        .map(({ art, grund }) => `- ${zahlungsarten[art].label}: ${grund}`)
        .join('\n');
      return `--- Aufgabe ${i + 1} ---\nFallbeispiel: ${text}\n\nGeeignete Zahlungsarten (Musterlösung):\n${loesungText}`;
    }).join('\n\n');
  }

  return KI_ASSISTENT_PROMPT.replace('###AUFGABEN###', () => aufgabenBlock);
}

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Wirtschaftsassistent für Schüler der Realschule (BwR). Du hilfst beim Verständnis von Zahlungsarten im Alltag.
Unten findest du eine Liste mit Fallbeispielen und Musterlösungen. Begrüße den Schüler und wähle zufällig ein Fallbeispiel aus der Liste. Schreibe es vollständig in den Chat. Wähle bei jeder weiteren Aufgabe zufällig ein Fallbeispiel, das noch nicht bearbeitet wurde.
Arbeitsauftrag ist immer: "Entscheide dich für eine geeignete Zahlungsart."

FALLBEISPIELE MIT MUSTERLÖSUNGEN:
###AUFGABEN###

Aufgabe:
- Gib KEINE fertigen Lösungen (z. B. direkte Empfehlungen) vor.
- Führe die Schüler durch gezielte Fragen zur richtigen Abwägung.
- Ziel: Lernförderung, kritisches Verbraucherdenken.

Pädagogischer Ansatz:
- Stelle gezielte Rückfragen, um den Stand des Schülers zu verstehen.
- Beantworte deine Rückfragen nicht selbst.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Erst wenn der Schüler selbst auf eine begründete Antwort kommt, bestätige ihn.
- Mehrere Zahlungsarten können richtig sein. Lass dir von der Schülerin oder dem Schüler kurz erklären, warum die Wahl passt.

Die sieben Zahlungsarten:

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

Nach jeder gelösten Aufgabe frage: „Möchtest du die nächste Aufgabe bearbeiten?"
Die Musterlösungen sind nur für dich. Verrate sie nie, bevor der Schüler selbst eine geeignete Zahlungsart genannt hat.

`;

function kopiereKiPrompt() {
  navigator.clipboard.writeText(erstelleKiPromptText()).then(() => {
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
    vorschau.textContent = erstelleKiPromptText();
    vorschau.style.display = 'block';
    btn.textContent = 'Vorschau ausblenden ▲';
  } else {
    vorschau.style.display = 'none';
    btn.textContent = 'Prompt anzeigen ▼';
  }
}


// ============================================================================
// MOODLE-XML-EXPORT – Multiple Choice (eine Antwort), jede geeignete Zahlungsart = richtig
// ============================================================================

const MOODLE_ZAHL_PRAEFIX = '7.1-05#T';           
const MOODLE_ZAHL_TITELENDE = 'meinBwR-Auswaehlen';
const MOODLE_ZAHL_ANWEISUNG = 'Gib eine geeignete Zahlungsart an. Hinweis: Es können mehrere korrekt sein.';

function zxEsc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function zxCdata(s) {
  return '<![CDATA[' + String(s ?? '').replace(/\]\]>/g, ']]]]><![CDATA[>') + ']]>';
}

// Eindeutige, zeitabhängige ID (yyMMddHHmmss), pro Browser streng aufsteigend
function zxIdBasis() {
  const SCHLUESSEL = 'moodleZahlungLetzteIdSekunde';
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

function zxBaueMultichoiceXml(aufgaben) {
  const basis = zxIdBasis();
  const alleArten = Object.keys(zahlungsarten);
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n';

  aufgaben.forEach(({ text, loesung }, i) => {
    const id = `${basis}${String(i + 1).padStart(3, '0')}`;
    const titel = `${MOODLE_ZAHL_PRAEFIX}${id}${MOODLE_ZAHL_TITELENDE}`;
    const richtig = new Map(loesung.map(l => [l.art, l.grund]));

    const rueckmeldung = '<p><strong>Geeignet sind:</strong></p><ul>' +
      loesung.map(({ art, grund }) => `<li><strong>${zahlungsarten[art].label}</strong>: ${grund}</li>`).join('') +
      '</ul>';

    xml += `  <question type="multichoice">\n`;
    xml += `    <name>\n      <text>${zxEsc(titel)}</text>\n    </name>\n`;
    xml += `    <questiontext format="html">\n      <text>${zxCdata(`<p>${text}</p><p><em>${MOODLE_ZAHL_ANWEISUNG}</em></p>`)}</text>\n    </questiontext>\n`;
    xml += `    <generalfeedback format="html">\n      <text>${zxCdata(rueckmeldung)}</text>\n    </generalfeedback>\n`;
    xml += `    <defaultgrade>1</defaultgrade>\n    <penalty>0.3333333</penalty>\n    <hidden>0</hidden>\n    <idnumber></idnumber>\n`;
    xml += `    <single>true</single>\n    <shuffleanswers>true</shuffleanswers>\n    <answernumbering>abc</answernumbering>\n    <showstandardinstruction>0</showstandardinstruction>\n`;
    xml += `    <correctfeedback format="html">\n      <text>${zxCdata('<p>Die Antwort ist richtig.</p>')}</text>\n    </correctfeedback>\n`;
    xml += `    <partiallycorrectfeedback format="html">\n      <text>${zxCdata('<p>Die Antwort ist teilweise richtig.</p>')}</text>\n    </partiallycorrectfeedback>\n`;
    xml += `    <incorrectfeedback format="html">\n      <text>${zxCdata('<p>Die Antwort ist falsch.</p>')}</text>\n    </incorrectfeedback>\n`;

    alleArten.forEach(art => {
      const ok = richtig.has(art);
      xml += `    <answer fraction="${ok ? 100 : 0}" format="html">\n`;
      xml += `      <text>${zxCdata(`<p>${zahlungsarten[art].label}</p>`)}</text>\n`;
      xml += `      <feedback format="html">\n        <text>${ok ? zxCdata(`<p>${richtig.get(art)}</p>`) : ''}</text>\n      </feedback>\n`;
      xml += `    </answer>\n`;
    });

    xml += `  </question>\n\n`;
  });

  return xml + '</quiz>\n';
}

function exportiereMoodle() {
  if (!letzteZahlungsAufgaben.length) {
    alert('Bitte zuerst Aufgaben erstellen.');
    return;
  }
  const xml = zxBaueMultichoiceXml(letzteZahlungsAufgaben);

  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  const dateiname = `quiz-zahlungsarten-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.xml`;

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

function startZahlungsaufgaben() {
  zeigeZufaelligeZahlungsaufgaben();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startZahlungsaufgaben);
} else {
  startZahlungsaufgaben();
}