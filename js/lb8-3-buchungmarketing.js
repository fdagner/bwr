// ============================================================================
// MARKETING & VERWALTUNG - GESCHÄFTSFALLE MIT KONTO-AUSWAHL
// ============================================================================

// Globale Variablen
let yamlData = [];
let kunde = '<i>[Modellunternehmen]</i>';

// NEU: Konten-Definitionen mit Beschreibungen
const kontenDefinitionen = {
  '6820 KOM': {
    beschreibung: '',
  },
  '6770 RBK': {
    beschreibung: '',
  },
  '6870 WER': {
    beschreibung: '',
  },
  '6850 REK': {
    beschreibung: '',
  }
};

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
// NEU: KONTO-AUSWAHL FUNKTIONEN
// ============================================================================

function initializeKontoAuswahl() {
  const kontoGrid = document.getElementById('kontoGrid');
  if (!kontoGrid) return;
  
  kontoGrid.innerHTML = '';
  
  Object.entries(kontenDefinitionen).forEach(([kontoNr, info]) => {
    const item = document.createElement('div');
    item.className = 'konto-checkbox-item';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `konto-${kontoNr.replace(/\s/g, '-')}`;
    checkbox.value = kontoNr;
    checkbox.checked = true; // Standardmäßig alle ausgewählt
    checkbox.onchange = updateAuswahlInfo;
    
    const label = document.createElement('label');
    label.className = 'konto-label';
    label.htmlFor = checkbox.id;
    
    const nummer = document.createElement('div');
    nummer.className = 'konto-nummer';
    nummer.textContent = kontoNr;
    
    const beschreibung = document.createElement('div');
    beschreibung.className = 'konto-beschreibung';
    beschreibung.textContent = info.beschreibung;
    
    label.appendChild(nummer);
    label.appendChild(beschreibung);
    
    item.appendChild(checkbox);
    item.appendChild(label);
    
    kontoGrid.appendChild(item);
  });
  
  updateAuswahlInfo();
}

function updateAuswahlInfo() {
  const auswahlInfo = document.getElementById('auswahlInfo');
  const checkboxes = document.querySelectorAll('#kontoGrid input[type="checkbox"]');
  const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
  
  if (checkedCount === 0) {
    auswahlInfo.textContent = '⚠️ Keine Konten ausgewählt - es werden alle verwendet';
    auswahlInfo.style.background = '#fff3cd';
    auswahlInfo.style.color = '#856404';
  } else if (checkedCount === checkboxes.length) {
    auswahlInfo.textContent = '✓ Alle Konten ausgewählt';
    auswahlInfo.style.background = '#d4edda';
    auswahlInfo.style.color = '#155724';
  } else {
    auswahlInfo.textContent = `✓ ${checkedCount} von ${checkboxes.length} Konten ausgewählt`;
    auswahlInfo.style.background = '#d1ecf1';
    auswahlInfo.style.color = '#0c5460';
  }
}

function alleKontenAuswaehlen() {
  const checkboxes = document.querySelectorAll('#kontoGrid input[type="checkbox"]');
  checkboxes.forEach(cb => cb.checked = true);
  updateAuswahlInfo();
}

function alleKontenAbwaehlen() {
  const checkboxes = document.querySelectorAll('#kontoGrid input[type="checkbox"]');
  checkboxes.forEach(cb => cb.checked = false);
  updateAuswahlInfo();
}

function getAusgewaehlteKonten() {
  const checkboxes = document.querySelectorAll('#kontoGrid input[type="checkbox"]:checked');
  return Array.from(checkboxes).map(cb => cb.value);
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
      { beschreibung: ' erhält die monatlichen Internetgebühren', artikel: 'Internetpaket XXl', einheit: 'Monat' },
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
    umsatzsteuerSatz: 0.07,
    geschaeftsfaelle: [
      { beschreibung: ' erhält die Kosten für eine Hotelübernachtung aufgrund einer Fortbildung', artikel: 'Hotelübernachtung', einheit: 'ÜN' },
      { beschreibung: ' erhält die Aufstellung für eine Hotelübernachtung aufgrund eines Messebesuchs', artikel: 'Hotelübernachtung', einheit: 'ÜN' },
      { beschreibung: ' bekommt die Übernachtungskosten für eine Fortbildungsreise', artikel: 'Übernachtung', einheit: 'ÜN' },
      { beschreibung: ' erhält die Hotelkosten wegen eines Messebesuchs', artikel: 'Übernachtung Business', einheit: 'ÜN' }
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
// GESCHÄFTSFALL GENERIEREN - ERWEITERT MIT KONTO-FILTER
// ============================================================================

function erstelleZufallsGeschaeftsfall() {
  // NEU: Hole ausgewählte Konten
  const ausgewaehlteKonten = getAusgewaehlteKonten();
  
  // Filtere Geschäftsfalltypen nach ausgewählten Konten
  let verfuegbareTypen = Object.keys(geschaeftsfallTypen);
  
  if (ausgewaehlteKonten.length > 0) {
    verfuegbareTypen = verfuegbareTypen.filter(typKey => {
      const typ = geschaeftsfallTypen[typKey];
      return ausgewaehlteKonten.includes(typ.konto);
    });
  }
  
  // Wenn keine Typen verfügbar sind, alle verwenden
  if (verfuegbareTypen.length === 0) {
    verfuegbareTypen = Object.keys(geschaeftsfallTypen);
  }
  
  // Zufälligen Typ aus verfügbaren auswählen
  const zufallsTyp = verfuegbareTypen[Math.floor(Math.random() * verfuegbareTypen.length)];
  const typ = geschaeftsfallTypen[zufallsTyp];
  
  // Rest wie gehabt...
  const lieferant = typ.lieferanten[Math.floor(Math.random() * typ.lieferanten.length)];
  const zahlungsart = typ.zahlungsarten[Math.floor(Math.random() * typ.zahlungsarten.length)];
  
  const geschaeftsfall = typ.geschaeftsfaelle[Math.floor(Math.random() * typ.geschaeftsfaelle.length)];
  const beschreibung = geschaeftsfall.beschreibung;
  const artikel = geschaeftsfall.artikel;
  const einheit = geschaeftsfall.einheit || 'Stück';
  
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
    const ustSatz = typ.umsatzsteuerSatz || 0.19;
    vorsteuer = roundToTwoDecimals(nettoBetrag * ustSatz);
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
    buchungssatzHTML += `
        <tr>
          <td style="border-with:0;white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${typ.konto}</td>
          <td style="border-with:0;text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${geschaeftsfall.nettoFormatted}</td>
          <td style="border-with:0;text-align:center; width:100px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:40px" tabindex="1"></td>
          <td style="border-with:0;white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px; text-align:right" tabindex="1"></td>
          <td style="border-with:0;white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px; text-align:right" tabindex="1"></td>
        </tr>
        <tr>
          <td style="border-with:0;white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">2600 VORST</td>
          <td style="border-with:0;text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${geschaeftsfall.vorsteuerFormatted}</td>
          <td style="border-with:0;text-align:center; width:100px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:40px" tabindex="1">an</td>
          <td style="border-with:0;text-align:left; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${geschaeftsfall.zahlungsart.konto}</td>
          <td style="border-with:0;text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${geschaeftsfall.bruttoFormatted}</td>
        </tr>`;
  } else {
    buchungssatzHTML += `
        <tr>
          <td style="border-with:0;white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${typ.konto}</td>
          <td style="border-with:0;text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${geschaeftsfall.nettoFormatted}</td>
          <td style="border-with:0;text-align:center; width:100px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:40px" tabindex="1">an</td>
          <td style="border-with:0;text-align:left; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${geschaeftsfall.zahlungsart.konto}</td>
          <td style="border-with:0;text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${geschaeftsfall.nettoFormatted}</td>
        </tr>`;
  }
  
  buchungssatzHTML += `
      </tbody>
    </table><br>`;
  
  return buchungssatzHTML;
}

// ============================================================================
// BELEG-URL ERSTELLEN
// ============================================================================

function erstelleBelegURL(geschaeftsfall) {
  const params = new URLSearchParams();
  const typ = geschaeftsfall.typDaten;
  const belegtyp = typ.belegtyp;
  
  params.set('beleg', belegtyp);
  
  const kundeSelect = document.getElementById('marketingKunde');
  const kundeValue = kundeSelect?.value?.trim() || '';
  
  const now = new Date();
  const tag = now.getDate().toString().padStart(2, '0');
  const monat = (now.getMonth() + 1).toString().padStart(2, '0');
  const jahr = now.getFullYear().toString();
  
  if (belegtyp === 'rechnung') {
    if (kundeValue) params.set('kunde', kundeValue);
    params.set('lieferer', geschaeftsfall.lieferant);
    
    params.set('artikel1', geschaeftsfall.artikel);
    params.set('menge1', '1');
    params.set('einheit1', geschaeftsfall.einheit);
    
    const einzelpreis = parseNumericValue(formatCurrency(geschaeftsfall.nettoBetrag));
    params.set('einzelpreis1', einzelpreis);
    
    const ustWert = typ.mitVorsteuer ? geschaeftsfall.ustProzent.toString() : '0';
    params.set('umsatzsteuer', ustWert);
    
    if (typ.vorlage) {
      params.set('vorlage', typ.vorlage);
    }
    
    params.set('tag', tag);
    params.set('monat', monat);
    params.set('jahr', jahr);
    
    params.set('zahlungsziel', '30');
    params.set('skonto', '2');
    params.set('skontofrist', '20');
  }
  else if (belegtyp === 'kassenbon') {
    params.set('empfaenger', geschaeftsfall.lieferant);
    if (kundeValue) params.set('kunde', kundeValue);
    
    params.set('bezeichnung', geschaeftsfall.artikel);
    
    const nettoWert = parseNumericValue(formatCurrency(geschaeftsfall.nettoBetrag));
    params.set('netto', nettoWert);
    
    const ustWert = typ.mitVorsteuer ? '19' : '0';
    params.set('ust', ustWert);
    
    let zahlungsart = 'bar';
    if (geschaeftsfall.zahlungsart.text.toLowerCase().includes('girocard') || 
        geschaeftsfall.zahlungsart.text.toLowerCase().includes('karte')) {
      zahlungsart = 'Girocard';
    }
    params.set('zahlungsart', zahlungsart);
    
    params.set('tag', tag);
    params.set('monat', monat);
    params.set('jahr', jahr);
  }
  else if (belegtyp === 'quittung') {
    params.set('empfaenger', geschaeftsfall.lieferant);
    if (kundeValue) params.set('kunde', kundeValue);
    
    params.set('zweck', geschaeftsfall.artikel);
    
    const nettoWert = parseNumericValue(formatCurrency(geschaeftsfall.nettoBetrag));
    params.set('netto', nettoWert);
    
    const ustWert = typ.mitVorsteuer ? '19' : '0';
    params.set('ust', ustWert);
    
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
  const container = document.getElementById('Container');
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
  // NEU: Konto-Auswahl initialisieren
  initializeKontoAuswahl();
  
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