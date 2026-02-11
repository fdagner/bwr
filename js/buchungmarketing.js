// ============================================================================
// MARKETING & VERWALTUNG - GESCHÄFTSFALLE
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
    lieferanten: ['Post und Shop'],
    belegtyp: 'kassenbon',
    zahlungsarten: [
      { text: 'in bar', konto: '2880 KA' },
      { text: 'per Girocard', konto: '2800 BK' }
    ],
    mitVorsteuer: false,
    geschaeftsfaelle: [
      { beschreibung: ' kauft Briefmarken', artikel: 'Briefmarken (Kompakt)', einheit: 'Stück' },
      { beschreibung: ' erwirbt Postwertzeichen', artikel: 'Postwertzeichen', einheit: 'Stück' },
      { beschreibung: ' kauft Briefmarken für die Geschäftspost', artikel: 'Briefmarken (Standard)', einheit: 'Stück' },
      { beschreibung: ' erwirbt Postwertzeichen für den Postversand', artikel: 'Briefmarken (Maxi)', einheit: 'Stück' },
      { beschreibung: ' kauft Briefmarken', artikel: 'Briefmarken (Standard)', einheit: 'Stück' }
    ]
  },
  
  telefonInternet: {
    name: 'Telefon/Internet',
    konto: '6820 KOM',
    lieferanten: ['EU Glasfaser'],
    belegtyp: 'rechnung',
    zahlungsarten: [
      { text: ', es geht eine Rechnung ein', konto: '4400 VE' },
      { text: ' auf Ziel', konto: '4400 VE' },
      { text: '. Es geht eine Rechnung ein', konto: '4400 VE' }
    ],
    mitVorsteuer: true,
    geschaeftsfaelle: [
      { beschreibung: ' erhält die Anschlussgebühren für Internet', artikel: 'Internetanschluss (Monat)', einheit: 'Monat' },
      { beschreibung: ' erhält die monatliche Telefongebühr', artikel: 'Telefon- und Internetanschluss', einheit: 'Monat' },
      { beschreibung: ' bekommt die Aufstellung für Telefon und Internet', artikel: 'Business-Internetpaket', einheit: 'Monat' },
      { beschreibung: ' erhält die monatliche Internetgebühren', artikel: 'Internetpaket XXl', einheit: 'Monat' },
      { beschreibung: ' erhält die Kosten für den Glasfaseranschluss', artikel: 'Glasfaseranschluss', einheit: 'Monat' }
    ]
  },

  
  notar: {
    name: 'Notarkosten',
    konto: '6770 RBK',
    lieferanten: ['Notariat Weidner'],
    belegtyp: 'rechnung',
    zahlungsarten: [
       { text: ', hierfür geht eine Rechnung ein', konto: '4400 VE' }
    ],
    mitVorsteuer: true,
    geschaeftsfaelle: [
      { beschreibung: ' lässt einen Vertrag notariell beglaubigen', artikel: 'Notarielle Beglaubigung', einheit: 'Lst.' },
      { beschreibung: ' lässt ein Schreiben notariell beurkunden', artikel: 'Notarielle Beurkundung', einheit: 'Lst.' },
      { beschreibung: ' nimmt eine notarielle Beratung in Anspruch', artikel: 'Notarielle Beratung', einheit: 'Lst.' },
      { beschreibung: ' lässt einen Kaufvertrag notariell beurkunden', artikel: 'Beurkundung Kaufvertrag', einheit: 'Lst.' },
      { beschreibung: ' lässt eine Unterschrift notariell beglaubigen', artikel: 'Beglaubigung Unterschrift', einheit: 'Lst.' }
    ]
  },
  
  anwalt: {
    name: 'Anwaltskosten',
    konto: '6770 RBK',
    lieferanten: ['Meininger und Partner','Mona Klingenbeil'],
    belegtyp: 'rechnung',
    zahlungsarten: [
      { text: ', wobei eine Rechnung eingeht', konto: '4400 VE' }
    ],
    mitVorsteuer: true,
    geschaeftsfaelle: [
      { beschreibung: ' nimmt eine rechtliche Beratung in Anspruch', artikel: 'Rechtsberatung', einheit: 'Lst.' },
      { beschreibung: ' lässt einen Vertrag anwaltlich prüfen', artikel: 'Vertragsprüfung', einheit: 'Lst.' },
      { beschreibung: ' beauftragt den Anwalt mit einem Schreiben', artikel: 'Anwaltliches Schreiben', einheit: 'Lst.' },
      { beschreibung: ' lässt eine rechtliche Stellungnahme erstellen', artikel: 'Rechtliche Stellungnahme', einheit: 'Lst.' },
      { beschreibung: ' nimmt ein anwaltliches Beratungsgespräch in Anspruch', artikel: 'Beratungsgespräch', einheit: 'h' }
    ]
  },
  
  werbung: {
    name: 'Werbekosten',
    konto: '6870 WER',
    lieferanten: ['Werbeagentur Mandic', 'WebKreativ Studio'],
    belegtyp: 'rechnung',
    zahlungsarten: [
      { text: ', per Rechnung', konto: '4400 VE' }
    ],
    mitVorsteuer: true,
    geschaeftsfaelle: [
      { beschreibung: ' überweist die Kosten für die Betreuung der Homepage', artikel: 'Homepage-Betreuung', einheit: 'Monat' },
      { beschreibung: ' lässt Werbeflyer erstellen', artikel: 'Werbeflyer (1000 Stück)', einheit: 'Aufl.' },
      { beschreibung: ' lässt Werbematerialien drucken', artikel: 'Druck Werbematerialien', einheit: 'Aufl.' },
      { beschreibung: ' beauftragt die Gestaltung eines Werbeplakats', artikel: 'Werbeplakat (DIN A1)', einheit: 'Stück' },
      { beschreibung: ' lässt Visitenkarten drucken', artikel: 'Visitenkarten (500 Stück)', einheit: 'Aufl.' },
      { beschreibung: ' beauftragt eine Social Media Kampagne', artikel: 'Social Media Kampagne', einheit: 'Monat' },
      { beschreibung: ' lässt ein Logo gestalten', artikel: 'Logogestaltung', einheit: 'Lst.' }
    ]
  },
  
  reisekosten: {
    name: 'Reisekosten',
    konto: '6850 REK',
    lieferanten: ['Hotel Sonne', 'RelaxInn Hostel', 'CityStay Hotel'],
    belegtyp: 'rechnung',
    vorlage: 'template10.svg',
    zahlungsarten: [
      { text: ', es geht eine Rechnung ein', konto: '4400 VE' },
      { text: ' auf Ziel', konto: '4400 VE' }
    ],
    mitVorsteuer: true,
    umsatzsteuerSatz: 0.07, // 7% UST (ohne Frühstück)
    geschaeftsfaelle: [
      { beschreibung: ' erhält eine Rechnung für eine Hotelübernachtung aufgrund einer Fortbildung', artikel: 'Hotelübernachtung', einheit: 'ÜN' },
      { beschreibung: ' erhält eine Rechnung für eine Hotelübernachtung aufgrund eines Messebesuchs', artikel: 'Hotelübernachtung', einheit: 'ÜN' },
      { beschreibung: ' bekommt die Hotelrechnung für eine Fortbildungsreise', artikel: 'Übernachtung', einheit: 'ÜN' },
      { beschreibung: ' erhält die Hotelrechnung wegen eines Messebesuchs', artikel: 'Übernachtung Business', einheit: 'ÜN' }
    ]
  },

    reisekosten_pauschal: {
    name: 'Reisekosten pauschal',
    konto: '6850 REK',
    lieferanten: ['Horozont Reisebüro', 'Reisewelt Entdecker'],
    belegtyp: 'rechnung',
    vorlage: 'template10.svg',
    zahlungsarten: [
      { text: ', hierfür geht eine Rechnung ein', konto: '4400 VE' },
      { text: ' auf Ziel', konto: '4400 VE' }
    ],
    mitVorsteuer: true,
    umsatzsteuerSatz: 0.19,
    geschaeftsfaelle: [
      { beschreibung: ' erhält eine Rechnung für eine Reise aufgrund einer Fortbildung', artikel: 'Reiseleistungen mit Verpflegung', einheit: 'ÜN' },
      { beschreibung: ' erhält eine Rechnung für eine Reise aufgrund eines Messebesuchs', artikel: 'Businessreise Premium++', einheit: 'ÜN' },
      { beschreibung: ' bekommt die Rechnung für eine Fortbildungsreise', artikel: 'Businessreise inkl. Verpflg.', einheit: 'ÜN' },
      { beschreibung: ' erhält die Reiserechnung wegen eines Messebesuchs', artikel: 'Businessreise Messe', einheit: 'ÜN' }
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
  // Generiere Beträge in 5€-Schritten
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
  // Zufälligen Typ auswählen
  const typen = Object.keys(geschaeftsfallTypen);
  const zufallsTyp = typen[Math.floor(Math.random() * typen.length)];
  const typ = geschaeftsfallTypen[zufallsTyp];
  
  // Zufällige Werte generieren
  const lieferant = typ.lieferanten[Math.floor(Math.random() * typ.lieferanten.length)];
  const zahlungsart = typ.zahlungsarten[Math.floor(Math.random() * typ.zahlungsarten.length)];
  
  // WICHTIG: Wähle einen Geschäftsfall aus dem Array (Beschreibung + Artikel zusammen)
  const geschaeftsfall = typ.geschaeftsfaelle[Math.floor(Math.random() * typ.geschaeftsfaelle.length)];
  const beschreibung = geschaeftsfall.beschreibung;
  const artikel = geschaeftsfall.artikel;
  const einheit = geschaeftsfall.einheit || 'Stück'; // Fallback auf "Stück" falls nicht definiert
  
  // Betrag generieren (je nach Typ unterschiedlich)
  let nettoBetrag;
  if (zufallsTyp === 'postwertzeichen') {
    nettoBetrag = generateRandomBetrag(10, 100);
  } else if (zufallsTyp === 'telefonInternet') {
    nettoBetrag = generateRandomBetrag(50, 150);
  } else if (zufallsTyp === 'notar' || zufallsTyp === 'anwalt') {
    nettoBetrag = generateRandomBetrag(400, 1500);
  } else if (zufallsTyp === 'reisekosten') {
    nettoBetrag = generateRandomBetrag(90, 250);
  } else if (zufallsTyp === 'reisekosten_pauschal') {
    nettoBetrag = generateRandomBetrag(500, 2000);
  } else {
    nettoBetrag = generateRandomBetrag(50, 400);
  }
  
  const nettoFormatted = formatCurrency(nettoBetrag);
  
  let vorsteuer = 0;
  let bruttoBetrag = nettoBetrag;
  let vorsteuerFormatted = formatCurrency(0);
  let bruttoFormatted = nettoFormatted;
  
  if (typ.mitVorsteuer) {
    // Prüfe ob spezieller UST-Satz definiert ist (z.B. 7% für Reisekosten)
    const ustSatz = typ.umsatzsteuerSatz || 0.19;
    vorsteuer = roundToTwoDecimals(nettoBetrag * ustSatz);
    vorsteuerFormatted = formatCurrency(vorsteuer);
    bruttoBetrag = roundToTwoDecimals(nettoBetrag + vorsteuer);
    bruttoFormatted = formatCurrency(bruttoBetrag);
  }
  
  // Geschäftsfall-Text erstellen
let betragText;
let betragHinweis = '';

if (!typ.mitVorsteuer) {
  // Ohne Umsatzsteuer → immer nur netto (kein anderer Sinn möglich)
  betragText = nettoFormatted;
} else {
  // Mit Vorsteuer → zufällig netto ODER brutto zeigen
  const showNetto = Math.random() < 0.5;           // ~50:50 Chance
  // Alternativ: Math.random() < 0.35    → öfter netto
  //             Math.random() < 0.65    → öfter brutto
  
  if (showNetto) {
    betragText = nettoFormatted;
    betragHinweis = ' netto';
  } else {
    betragText = bruttoFormatted;
    betragHinweis = ' brutto';
  }
}

const zText = zahlungsart.text.trim();  // trim() statt nur trimStart(), um auch trailing spaces zu entfernen

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
    einheit: einheit,
    zahlungsart: zahlungsart,
    nettoBetrag: nettoBetrag,
    nettoFormatted: nettoFormatted,
    vorsteuer: vorsteuer,
    vorsteuerFormatted: vorsteuerFormatted,
    bruttoBetrag: bruttoBetrag,
    bruttoFormatted: bruttoFormatted,
    ustProzent: typ.umsatzsteuerSatz ? roundToTwoDecimals(typ.umsatzsteuerSatz * 100) : 19
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
    // Buchung mit Vorsteuer - 3 Konten in 2 Zeilen
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
    // Buchung ohne Vorsteuer - 2 Konten in einer Zeile
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
// BELEG-URL ERSTELLEN - KOMPLETT NEU STRUKTURIERT
// ============================================================================

function erstelleBelegURL(geschaeftsfall) {
  const params = new URLSearchParams();
  const typ = geschaeftsfall.typDaten;
  const belegtyp = typ.belegtyp;
  
  // Belegtyp setzen
  params.set('beleg', belegtyp);
  
  // Kunde auslesen
  const kundeSelect = document.getElementById('marketingKunde');
  const kundeValue = kundeSelect?.value?.trim() || '';
  
  // Datum - immer aktuell
  const now = new Date();
  const tag = now.getDate().toString().padStart(2, '0');
  const monat = (now.getMonth() + 1).toString().padStart(2, '0');
  const jahr = now.getFullYear().toString();
  
  // ========================================================================
  // RECHNUNG - Parameter gemäß URL_PARAM_CONFIG.rechnung
  // ========================================================================
  if (belegtyp === 'rechnung') {
    // Kunde & Lieferant
    if (kundeValue) params.set('kunde', kundeValue);
    params.set('lieferer', geschaeftsfall.lieferant);
    
    // Artikel 1
    params.set('artikel1', geschaeftsfall.artikel);
    params.set('menge1', '1');
    params.set('einheit1', geschaeftsfall.einheit);
    
    // Einzelpreis - bei Rechnung ist das der Netto-Einzelpreis
    const einzelpreis = parseNumericValue(formatCurrency(geschaeftsfall.nettoBetrag));
    params.set('einzelpreis1', einzelpreis);
    
    // Umsatzsteuer - IMMER explizit setzen (kann 0, 7 oder 19 sein)
    const ustWert = typ.mitVorsteuer ? geschaeftsfall.ustProzent.toString() : '0';
    params.set('umsatzsteuer', ustWert);
    
    // Vorlage - falls spezifisch definiert
    if (typ.vorlage) {
      params.set('vorlage', typ.vorlage);
    }
    
    // Datum
    params.set('tag', tag);
    params.set('monat', monat);
    params.set('jahr', jahr);
    
    // Standard-Zahlungskonditionen (können später angepasst werden)
    params.set('zahlungsziel', '30');
    params.set('skonto', '2');
    params.set('skontofrist', '20');
  }
  
  // ========================================================================
  // KASSENBON - Parameter gemäß URL_PARAM_CONFIG.kassenbon
  // ========================================================================
  else if (belegtyp === 'kassenbon') {
    // Empfänger & Kunde
    params.set('empfaenger', geschaeftsfall.lieferant);
    if (kundeValue) params.set('kunde', kundeValue);
    
    // Bezeichnung (= Artikel)
    params.set('bezeichnung', geschaeftsfall.artikel);
    
    // Nettobetrag - bei Kassenbon ist netto = brutto wenn ust=0
    const nettoWert = parseNumericValue(formatCurrency(geschaeftsfall.nettoBetrag));
    params.set('netto', nettoWert);
    
    // Umsatzsteuer - IMMER explizit setzen (bei Kassenbon meist 0 oder 19)
    const ustWert = typ.mitVorsteuer ? '19' : '0';
    params.set('ust', ustWert);
    
    // Zahlungsart - aus Geschäftsfall ableiten
    // "in bar" → "bar", "per Girocard" → "karte"
    let zahlungsart = 'bar';
    if (geschaeftsfall.zahlungsart.text.toLowerCase().includes('girocard') || 
        geschaeftsfall.zahlungsart.text.toLowerCase().includes('karte')) {
      zahlungsart = 'karte';
    }
    params.set('zahlungsart', zahlungsart);
    
    // Datum
    params.set('tag', tag);
    params.set('monat', monat);
    params.set('jahr', jahr);
  }
  
  // ========================================================================
  // QUITTUNG - Parameter gemäß URL_PARAM_CONFIG.quittung
  // ========================================================================
  else if (belegtyp === 'quittung') {
    // Empfänger & Kunde
    params.set('empfaenger', geschaeftsfall.lieferant);
    if (kundeValue) params.set('kunde', kundeValue);
    
    // Zweck (= Artikel)
    params.set('zweck', geschaeftsfall.artikel);
    
    // Nettobetrag
    const nettoWert = parseNumericValue(formatCurrency(geschaeftsfall.nettoBetrag));
    params.set('netto', nettoWert);
    
    // Umsatzsteuer
    const ustWert = typ.mitVorsteuer ? '19' : '0';
    params.set('ust', ustWert);
    
    // Datum
    params.set('tag', tag);
    params.set('monat', monat);
    params.set('jahr', jahr);
  }
  
  return `belege.html?${params.toString()}`;
}

// ============================================================================
// BELEG-BUTTON ERSTELLEN
// ============================================================================

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
  
  // Inhalte zurücksetzen
  container.innerHTML = '';
  buttonColumn.innerHTML = '';
  
  let aufgabenHTML = '<h2>Aufgaben</h2><ol>';
  let loesungenHTML = '<h2>Lösung</h2>';
  
  for (let i = 1; i <= anzahl; i++) {
    const geschaeftsfall = erstelleZufallsGeschaeftsfall();
    
    // Aufgabe
    aufgabenHTML += `<li>${geschaeftsfall.text}</li>`;
    
    // Lösung
    loesungenHTML += `<div style="margin-top: 1.5em;"><strong>${i}.</strong><br>`;
    loesungenHTML += erstelleBuchungssatz(geschaeftsfall);
    loesungenHTML += `</div>`;
    
    // Button
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
});


    function autoSelectMyCompany() {
        const myCompanyName = localStorage.getItem('myCompany');
        
        if (!myCompanyName) return;
        
        // Finde alle Dropdowns mit class="meinUnternehmen"
        const dropdowns = document.querySelectorAll('select.meinUnternehmen');
        
        dropdowns.forEach(dropdown => {
            // Suche nach der passenden Option
            const options = Array.from(dropdown.options);
            const matchingOption = options.find(opt => opt.value === myCompanyName);
            
            if (matchingOption) {
                dropdown.value = myCompanyName;
                
                // Trigger change event falls andere Scripts darauf reagieren
                const event = new Event('change', { bubbles: true });
                dropdown.dispatchEvent(event);
                
                console.log(`"${myCompanyName}" automatisch in Dropdown ausgewählt`);
            }
        });
    }

 // WICHTIG: Warte bis die Seite vollständig geladen ist
    document.addEventListener('DOMContentLoaded', function() {
        // Warte kurz, damit meinunternehmen.js das Dropdown befüllen kann
        setTimeout(function() {
            autoSelectMyCompany();
   }, 100);
    });