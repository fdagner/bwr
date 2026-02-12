// ============================================================================
// MARKETING & VERWALTUNG - GESCHÄFTSFÄLLE
// ============================================================================

// Globale Variablen
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
    console.log(`${userCompanies.length} Benutzerunternehmen hinzugefügt. Gesamt: ${yamlData.length} Unternehmen`);
  }
}

function loadYamlFromLocalStorage() {
  const saved = localStorage.getItem('uploadedYamlCompanyData');
  if (saved) {
    try {
      yamlData = JSON.parse(saved);
      console.log(`yamlData aus localStorage geladen (${yamlData.length} Unternehmen)`);
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
      console.log(`Standard yamlData geladen (${yamlData.length} Unternehmen)`);
      document.dispatchEvent(new Event('yamlDataLoaded'));
    })
    .catch(err => {
      console.error("Konnte unternehmen.yml nicht laden:", err);
    });
}

// ============================================================================
// GESCHÄFTSFALL-DEFINITIONEN
// ============================================================================

const geschaeftsfallTypen = {

  postwertzeichen: {
    name: 'Postwertzeichen/Briefmarken',
    konto: '6820 KOM',
    lieferanten: ['Post & Shop'],
    belegtyp: 'kassenbon',
    zahlungsarten: [
      { text: 'in bar', konto: '2880 KA' },
      { text: 'per Girocard', konto: '2800 BK' }
    ],
    mitVorsteuer: false,
    geschaeftsfaelle: [
      { beschreibung: ' kauft Briefmarken', artikel: 'Briefmarken (Kompakt)' },
      { beschreibung: ' erwirbt Postwertzeichen', artikel: 'Postwertzeichen' },
      { beschreibung: ' kauft Briefmarken für die Geschäftspost', artikel: 'Briefmarken (Standard)' },
      { beschreibung: ' erwirbt Postwertzeichen für den Postversand', artikel: 'Briefmarken (Maxi)' },
      { beschreibung: ' kauft Briefmarken', artikel: 'Briefmarken (Standard)' }
    ]
  },
  
  telefonInternet: {
    name: 'Telefon/Internet',
    konto: '6820 KOM',
    lieferanten: ['EU Glasfaser'],
    belegtyp: 'rechnung',
    zahlungsarten: [
      { text: ', wobei eine Rechnung eingeht', konto: '4400 VE' },
      { text: ' auf Ziel', konto: '4400 VE' },
      { text: '. Es geht eine Rechnung ein', konto: '4400 VE' }
    ],
    mitVorsteuer: true,
    geschaeftsfaelle: [
      { beschreibung: ' erhält die Anschlussgebühren für Internet', artikel: 'Internetanschluss (Monat)' },
      { beschreibung: ' erhält die monatliche Telefongebühr', artikel: 'Telefon- und Internetanschluss' },
      { beschreibung: ' bekommt die Aufstellung für Telefon und Internet', artikel: 'Business-Internetpaket' },
      { beschreibung: ' erhält die monatliche Kommunikationsgebühren', artikel: 'Kommunikationspaket' },
      { beschreibung: ' erhält die Kosten für den Glasfaseranschluss', artikel: 'Glasfaseranschluss' }
    ]
  },

  notar: {
    name: 'Notarkosten',
    konto: '6770 RBK',
    lieferanten: ['Notariat Weidner'],
    belegtyp: 'rechnung',
    zahlungsarten: [
       { text: ', wobei eine Rechnung eingeht', konto: '4400 VE' }
    ],
    mitVorsteuer: true,
    geschaeftsfaelle: [
      { beschreibung: ' lässt einen Vertrag notariell beglaubigen', artikel: 'Notarielle Beglaubigung' },
      { beschreibung: ' lässt ein Schreiben notariell beurkunden', artikel: 'Notarielle Beurkundung' },
      { beschreibung: ' nimmt eine notarielle Beratung in Anspruch', artikel: 'Notarielle Beratung' },
      { beschreibung: ' lässt einen Kaufvertrag notariell beurkunden', artikel: 'Beurkundung Kaufvertrag' },
      { beschreibung: ' lässt eine Unterschrift notariell beglaubigen', artikel: 'Beglaubigung Unterschrift' }
    ]
  },
  
  anwalt: {
    name: 'Anwaltskosten',
    konto: '6770 RBK',
    lieferanten: ['Meininger und Partner'],
    belegtyp: 'rechnung',
    zahlungsarten: [
      { text: ', wobei eine Rechnung eingeht', konto: '4400 VE' }
    ],
    mitVorsteuer: true,
    geschaeftsfaelle: [
      { beschreibung: ' nimmt eine rechtliche Beratung in Anspruch', artikel: 'Rechtsberatung' },
      { beschreibung: ' lässt einen Vertrag anwaltlich prüfen', artikel: 'Vertragsprüfung' },
      { beschreibung: ' beauftragt den Anwalt mit einem Schreiben', artikel: 'Anwaltliches Schreiben' },
      { beschreibung: ' lässt eine rechtliche Stellungnahme erstellen', artikel: 'Rechtliche Stellungnahme' },
      { beschreibung: ' nimmt ein anwaltliches Beratungsgespräch in Anspruch', artikel: 'Beratungsgespräch' }
    ]
  },
  
  werbung: {
    name: 'Werbekosten',
    konto: '6870 WER',
    lieferanten: ['Werbeagentur Mandic'],
    belegtyp: 'rechnung',
    zahlungsarten: [
      { text: ', per Rechnung', konto: '4400 VE' }
    ],
    mitVorsteuer: true,
    geschaeftsfaelle: [
      { beschreibung: ' überweist die Kosten für die Betreuung der Homepage', artikel: 'Homepage-Betreuung' },
      { beschreibung: ' lässt Werbeflyer erstellen', artikel: 'Werbeflyer (1000 Stück)' },
      { beschreibung: ' lässt Werbematerialien drucken', artikel: 'Druck Werbematerialien' },
      { beschreibung: ' beauftragt die Gestaltung eines Werbeplakats', artikel: 'Werbeplakat (DIN A1)' },
      { beschreibung: ' lässt Visitenkarten drucken', artikel: 'Visitenkarten (500 Stück)' },
      { beschreibung: ' beauftragt eine Social Media Kampagne', artikel: 'Social Media Kampagne' },
      { beschreibung: ' lässt ein Logo gestalten', artikel: 'Logogestaltung' }
    ]
  }
};

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================

function formatCurrency(value) {
  return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

function roundToTwoDecimals(num) {
  return Math.round(num * 100) / 100;
}

function generateRandomBetrag(min = 20, max = 500) {
  const steps = Math.floor((max - min) / 5);
  return min + (Math.floor(Math.random() * steps) * 5);
}

function parseNumericValue(value) {
  if (!value) return '0';
  return value.toString().replace(/[€\s]/g, '').replace(/\./g, '').replace(',', '.');
}

const wertFormulierungen = [
  " in Höhe von ",
  " mit einem Betrag von "
];

// ============================================================================
// GESCHÄFTSFALL GENERIEREN
// ============================================================================

function erstelleZufallsGeschaeftsfall() {
  const typen = Object.keys(geschaeftsfallTypen);
  const zufallsTyp = typen[Math.floor(Math.random() * typen.length)];
  const typ = geschaeftsfallTypen[zufallsTyp];
  
  const lieferant = typ.lieferanten[Math.floor(Math.random() * typ.lieferanten.length)];
  const zahlungsart = typ.zahlungsarten[Math.floor(Math.random() * typ.zahlungsarten.length)];
  
  const geschaeftsfall = typ.geschaeftsfaelle[Math.floor(Math.random() * typ.geschaeftsfaelle.length)];
  const beschreibung = geschaeftsfall.beschreibung;
  const artikel = geschaeftsfall.artikel;
  
  let nettoBetrag;
  if (zufallsTyp === 'postwertzeichen') {
    nettoBetrag = generateRandomBetrag(10, 100);
  } else if (zufallsTyp === 'telefonInternet') {
    nettoBetrag = generateRandomBetrag(30, 150);
  } else if (zufallsTyp === 'notar' || zufallsTyp === 'anwalt') {
    nettoBetrag = generateRandomBetrag(100, 500);
  } else {
    nettoBetrag = generateRandomBetrag(50, 400);
  }
  
  const nettoFormatted = formatCurrency(nettoBetrag);
  
  let vorsteuer = 0;
  let bruttoBetrag = nettoBetrag;
  let vorsteuerFormatted = formatCurrency(0);
  let bruttoFormatted = nettoFormatted;
  
  if (typ.mitVorsteuer) {
    vorsteuer = roundToTwoDecimals(nettoBetrag * 0.19);
    vorsteuerFormatted = formatCurrency(vorsteuer);
    bruttoBetrag = roundToTwoDecimals(nettoBetrag + vorsteuer);
    bruttoFormatted = formatCurrency(bruttoBetrag);
  }
  
  let betragText;
  let betragHinweis = '';

  if (!typ.mitVorsteuer) {
    betragText = nettoFormatted;
  } else {
    const showNetto = Math.random() < 0.5;
    if (showNetto) {
      betragText = nettoFormatted;
      betragHinweis = ' netto';
    } else {
      betragText = bruttoFormatted;
      betragHinweis = ' brutto';
    }
  }

  const zText = zahlungsart.text.trim();

  let verbindung = '';
  if (zText) {
    if (zText.startsWith(',') || zText.startsWith('.')) {
      verbindung = '';
    } else {
      verbindung = ' ';
    }
  }

  const varianten = [
    `${kunde}`,
    `Firma ${kunde}`,
    `Unternehmen ${kunde}`,
    `Das Unternehmen ${kunde}`,
    `Die Firma ${kunde}`
  ];

  const ausgabe = varianten[Math.floor(Math.random() * varianten.length)];
  const wertPhrase = wertFormulierungen[Math.floor(Math.random() * wertFormulierungen.length)];
  const geschaeftsfallText = `${ausgabe}${beschreibung}${verbindung}${zText}${wertPhrase}${betragText}${betragHinweis}.`;
  
  return {
    text: geschaeftsfallText,
    typ: zufallsTyp,
    typDaten: typ,
    lieferant: lieferant,
    artikel: artikel,
    zahlungsart: zahlungsart,
    nettoBetrag: nettoBetrag,
    nettoFormatted: nettoFormatted,
    vorsteuer: vorsteuer,
    vorsteuerFormatted: vorsteuerFormatted,
    bruttoBetrag: bruttoBetrag,
    bruttoFormatted: bruttoFormatted
  };
}

// ============================================================================
// BUCHUNGSSATZ ERSTELLEN
// ============================================================================

function erstelleBuchungssatz(geschaeftsfall) {
  const typ = geschaeftsfall.typDaten;
  
  let buchungssatzHTML = `
    <table style="border: 1px solid #ccc; white-space:nowrap; background-color:#fff; font-family:courier; width:600px; margin:0 0 6px;">
      <tbody>`;
  
  if (typ.mitVorsteuer) {
    buchungssatzHTML += `
        <tr>
          <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${typ.konto}</td>
          <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${geschaeftsfall.nettoFormatted}</td>
          <td style="text-align:center; width:100px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:40px" tabindex="1"></td>
          <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px; text-align:right" tabindex="1"></td>
          <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px; text-align:right" tabindex="1"></td>
        </tr>
        <tr>
          <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">2600 VORST</td>
          <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${geschaeftsfall.vorsteuerFormatted}</td>
          <td style="text-align:center; width:100px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:40px" tabindex="1">an</td>
          <td style="text-align:left; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${geschaeftsfall.zahlungsart.konto}</td>
          <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${geschaeftsfall.bruttoFormatted}</td>
        </tr>`;
  } else {
    buchungssatzHTML += `
        <tr>
          <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${typ.konto}</td>
          <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${geschaeftsfall.nettoFormatted}</td>
          <td style="text-align:center; width:100px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:40px" tabindex="1">an</td>
          <td style="text-align:left; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${geschaeftsfall.zahlungsart.konto}</td>
          <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${geschaeftsfall.nettoFormatted}</td>
        </tr>`;
  }
  
  buchungssatzHTML += `
      </tbody>
    </table><br>`;
  
  return buchungssatzHTML;
}

// ============================================================================
// BELEG-BUTTON ERSTELLEN
// ============================================================================

function erstelleBelegURL(geschaeftsfall) {
  const params = new URLSearchParams();
  
  params.set('beleg', geschaeftsfall.typDaten.belegtyp);
  
  const kundeSelect = document.getElementById('marketingKunde');
  if (kundeSelect?.value) {
    params.set('kunde', kundeSelect.value.trim());
  }
  params.set('lieferer', geschaeftsfall.lieferant);
  
  const ustWert = geschaeftsfall.typDaten.mitVorsteuer ? '19' : '0';
  params.set('ust', ustWert);

  const now = new Date();
  params.set('tag', now.getDate().toString().padStart(2, '0'));
  params.set('monat', (now.getMonth() + 1).toString().padStart(2, '0'));

  const typ = geschaeftsfall.typDaten;
  
  const preisWert = typ.mitVorsteuer 
    ? geschaeftsfall.bruttoBetrag 
    : geschaeftsfall.nettoBetrag;
  
  const preisString = parseNumericValue(formatCurrency(preisWert));

  if (typ.belegtyp === 'kassenbon') {
    params.set('netto', preisString);        
    params.set('bezeichnung', geschaeftsfall.artikel);     
    params.delete('artikel1');
    params.delete('einzelpreis1');
    params.delete('menge1');
  } else {
    params.set('artikel1', geschaeftsfall.artikel);
    params.set('einzelpreis1', preisString);
    params.set('menge1', '1');
  }

  return `belege.html?${params.toString()}`;
}

function erstelleBelegButton(nummer, geschaeftsfall) {
  const url = erstelleBelegURL(geschaeftsfall);
  let belegTypName = 'Beleg';
  
  if (geschaeftsfall.typDaten.belegtyp === 'kassenbon') {
    belegTypName = 'Kassenbon';
  } else if (geschaeftsfall.typDaten.belegtyp === 'rechnung') {
    belegTypName = 'Rechnung';
  } else if (geschaeftsfall.typDaten.belegtyp === 'quittung') {
    belegTypName = 'Quittung';
  }
  
  return `
    <button
      class="geschaeftsfall-beleg-button"
      onclick="window.open('${url}', '_blank')"
      title="${belegTypName} für Aufgabe ${nummer} erstellen"
      style="width: 100%; padding: 10px 12px; font-size: 14px; margin-bottom: 8px;"
    >
      📄 ${nummer}. ${belegTypName} erstellen
    </button>
  `;
}

// ============================================================================
// HAUPTFUNKTION - GESCHÄFTSFÄLLE ANZEIGEN
// ============================================================================

function zeigeZufaelligeGeschaeftsfaelle() {
  const anzahl = parseInt(document.getElementById('anzahlDropdown').value);
  const container = document.getElementById('marketingContainer');
  const buttonColumn = document.getElementById('button-column');
  
  if (!container || !buttonColumn) {
    console.error("Container oder Button-Column nicht gefunden");
    return;
  }
  
  container.innerHTML = '';
  buttonColumn.innerHTML = '';
  
  let aufgabenHTML = '<h2>Aufgaben</h2><ol>';
  let loesungenHTML = '<h2>Lösung</h2>';
  
  for (let i = 1; i <= anzahl; i++) {
    const geschaeftsfall = erstelleZufallsGeschaeftsfall();
    
    aufgabenHTML += `<li>${geschaeftsfall.text}</li>`;
    
    loesungenHTML += `<div style="margin-top: 1.5em;"><strong>${i}.</strong><br>`;
    loesungenHTML += erstelleBuchungssatz(geschaeftsfall);
    loesungenHTML += `</div>`;
    
    const buttonDiv = document.createElement('div');
    buttonDiv.style.margin = '12px 0';
    buttonDiv.innerHTML = erstelleBelegButton(i, geschaeftsfall);
    buttonColumn.appendChild(buttonDiv);
  }
  
  aufgabenHTML += '</ol>';
  container.innerHTML = aufgabenHTML + loesungenHTML;
}

// ============================================================================
// DROPDOWN BEFÜLLEN
// ============================================================================

function fillCompanyDropdowns() {
  if (!yamlData || yamlData.length === 0) {
    console.warn("yamlData ist leer → keine Unternehmen zum Befüllen");
    return;
  }
  
  const sortedCompanies = [...yamlData].sort((a, b) => {
    const brancheA = a.unternehmen?.branche || '';
    const brancheB = b.unternehmen?.branche || '';
    if (brancheA !== brancheB) return brancheA.localeCompare(brancheB);
    return (a.unternehmen?.name || '').localeCompare(b.unternehmen?.name || '');
  });
  
  const kundeSelect = document.getElementById('marketingKunde');
  
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
  
  console.log(`Dropdown befüllt mit ${sortedCompanies.length} Unternehmen`);
}

// ============================================================================
// EXPORT-FUNKTIONEN
// ============================================================================

function marketingHerunterladen() {
  const marketingHTML = document.getElementById('marketingContainer').innerHTML;
  const blob = new Blob([marketingHTML], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'marketing.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function marketingKopiereInZwischenablage() {
  const marketingHTML = document.getElementById('marketingContainer').innerHTML;
  navigator.clipboard.writeText(marketingHTML)
    .then(() => alert('Code wurde in die Zwischenablage kopiert'))
    .catch(err => console.error('Fehler beim Kopieren in die Zwischenablage:', err));
}

function marketingHerunterladenAlsPNG() {
  const marketingContainer = document.getElementById('marketingContainer');
  
  html2canvas(marketingContainer, optionshtml2canvas).then(canvas => {
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'marketing.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}

let clipboardMarketing = new ClipboardJS('#marketingOfficeButton');

clipboardMarketing.on('success', function (e) {
  console.log("Die Tabelle wurde in die Zwischenablage kopiert.");
  alert("Die Tabelle wurde in die Zwischenablage kopiert.");
});

clipboardMarketing.on('error', function (e) {
  console.error("Fehler beim Kopieren der Tabelle: ", e.action);
  alert("Fehler beim Kopieren der Tabelle.");
});

// ============================================================================
// KI-ASSISTENT PROMPT
// ============================================================================

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Buchführungs-Assistent für Schüler der Realschule (BwR), 8. Klasse. Du hilfst beim Verständnis von Buchungssätzen im Bereich Marketing und Verwaltung.

Aufgabe:
- Gib KEINE fertigen Buchungssätze, Beträge oder Konten vor.
- Führe die Schüler durch gezielte Fragen und Hinweise zur richtigen Lösung.
- Ziel: Lernförderung, nicht das Abnehmen der Denkarbeit.

Pädagogischer Ansatz:
- Frage nach dem konkreten Geschäftsfall oder Beleg und dessen Inhalt.
- Stelle gezielte Rückfragen, um den Stand des Schülers zu verstehen.
- Beantworte deine Rückfragen nicht selbst, hake bei falschen Antworten nach.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Erst wenn alle Teilschritte richtig beantwortet wurden, bestätige den vollständigen Buchungssatz.

Methodik bei Rückfragen:
- Was ist bei diesem Geschäftsfall der Aufwand?
- Wie wurde bezahlt – bar, per Girocard (Bank) oder auf Ziel (Rechnung)?
- Gibt es Vorsteuer? Woran erkennst du das?
- Welche Konten sind betroffen?
- Welche Seite (Soll/Haben) wird beim Aufwandskonto gebucht?

Kontenplan – Marketing und Verwaltung:

Aufwandskonten (immer im SOLL):
- 6820 KOM – Kommunikationsaufwendungen (Telefon, Internet, Briefmarken, Porto)
- 6770 RBK – Rechts- und Beratungskosten (Notar, Anwalt)
- 6870 WER – Werbeaufwendungen (Werbung, Flyer, Homepage, Logo)
- 6850 REK – Reisekosten (Hotelübernachtung, Geschäftsreise)

Vorsteuer (im SOLL, nur bei Rechnungen mit USt):
- 2600 VORST – Vorsteuer 7% oder 19%

Zahlungsarten (immer im HABEN):
- 2880 KA – Kasse (Barzahlung)
- 2800 BK – Bank (Zahlung per Girocard)
- 4400 VE – Verbindlichkeiten (Zahlung auf Ziel / offene Rechnung)

Buchungslogik:
- Aufwandskonto immer im Soll
- Zahlungskonto immer im Haben
- Zahlung per Rechnung: Gegenkonto = 4400 VE
- Barzahlung: Gegenkonto = 2880 KA
- Girocard/Überweisung: Gegenkonto = 2800 BK
- Vorsteuer (2600 VORST) nur bei Rechnung und umsatzsteuerpflichtig
- Keine Vorsteuer bei Briefmarken/Postwertzeichen

Vorsteuer-Berechnung:
- Nettobetrag × 0,19 = Vorsteuer
- Bruttobetrag = Nettobetrag + Vorsteuer
- Wenn „brutto“ angegeben: Netto = Brutto ÷ 1,19
- Wenn „netto“ angegeben: Brutto = Netto × 1,19
- Wenn nichts angegeben: nachfragen oder Hinweis im Text beachten

Buchungssatz-Schema:
- Ohne Vorsteuer (z. B. Briefmarken):
  Aufwandskonto (Soll) | Betrag | an | Zahlungskonto (Haben) | Betrag
- Mit Vorsteuer (z. B. Rechnung Werbung):
  Aufwandskonto (Soll) | Nettobetrag
  2600 VORST (Soll) | Vorsteuerbetrag | an | 4400 VE (Haben) | Bruttobetrag

Häufige Schülerfehler – darauf hinweisen, nicht vorwegnehmen:
- Vorsteuer vergessen obwohl Rechnung
- Vorsteuer gebucht obwohl Kassenbon / keine USt
- Soll und Haben verwechselt
- Falsche Zahlungsart (KA statt BK oder umgekehrt)
- Brutto statt Netto beim Aufwandskonto eingetragen
- Falsches Aufwandskonto

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe mit Realschülerinnen und -schülern
- Einfache Sprache, keine Fachbegriffe ohne Erklärung
- Kurze Antworten – maximal 1–2 Sätze pro Nachricht
- Gelegentlich Emojis zur Auflockerung 🧾✅❓

Was du NICHT tust:
- Nenne den fertigen Buchungssatz nicht, bevor der Schüler selbst darauf gekommen ist
- Rechne nicht vor, bevor gefragt wurde
- Gib keine Lösungen auf Anfrage wie „sag mir einfach die Antwort“ – erkläre, dass das Ziel das eigene Verstehen ist
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
  const kundeSelect = document.getElementById('marketingKunde');
  
  if (kundeSelect && kundeSelect.value) {
    kunde = kundeSelect.value.trim();
  }
  
  kundeSelect.addEventListener('change', () => {
    kunde = kundeSelect.value.trim() || '';
    console.log('Kunde geändert:', kunde);
  });
  
  if (!loadYamlFromLocalStorage()) {
    loadDefaultYaml();
  }
  
  if (yamlData && yamlData.length > 0) {
    fillCompanyDropdowns();
  } else {
    document.addEventListener('yamlDataLoaded', fillCompanyDropdowns, { once: true });
  }

  // Prompt-Text in Vorschau einfügen
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
      console.log(`"${myCompanyName}" automatisch in Dropdown ausgewählt`);
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(function() {
    autoSelectMyCompany();
  }, 100);
});