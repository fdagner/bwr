// ============================================================================
// BUCHUNGEN ANLAGEGÜTER – REPARATUREN, MIETE & VERSICHERUNGEN
// ============================================================================
// Globale Variablen
let yamlData = [];
let kunde = '<i>[Modellunternehmen]</i>';
let letzteGenerierteGeschaeftsfaelle = [];
let verwendeteSchluessel = new Set();

// Konten-Definitionen
const kontenDefinitionen = {
  '6160 FRI': {
    beschreibung: 'Fremdinstandhaltung',
  },
  '6700 AWMP': {
    beschreibung: 'Mieten, Pachten',
  },
  '6900 VBEI': {
    beschreibung: 'Versicherungsbeiträge',
  },
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
// KONTO-AUSWAHL FUNKTIONEN
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
    checkbox.checked = true;
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
  document.querySelectorAll('#kontoGrid input[type="checkbox"]').forEach(cb => cb.checked = true);
  updateAuswahlInfo();
}

function alleKontenAbwaehlen() {
  document.querySelectorAll('#kontoGrid input[type="checkbox"]').forEach(cb => cb.checked = false);
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

  // --------------------------------------------------------------------------
  // 6160 FRI – Fremdinstandhaltung
  // (mit Vorsteuer, Zahlung per Rechnung oder Kasse)
  // --------------------------------------------------------------------------
  fri_bank: {
    name: 'Fremdinstandhaltung (Rechnung)',
    konto: '6160 FRI',
    belegtyp: 'rechnung',
    zahlungsarten: [
      {konto: '4400 VE', belegArt: 'rechnung' },
    ],
    mitVorsteuer: true,
    mitUSt: false,
    vstSatz: 19,
    vstKonto: '2600 VORST',
    geschaeftsfaelle: [
      { beschreibung: 'Für den jährlichen Kundendienst an einem Transporter liegt eine Rechnung vor', vorgang: 'Kfz-Inspektion', branche: 'Fuhrpark', zahlungsweg: 'rechnung', betragNetto: 930 },
      { beschreibung: 'Eingang einer Rechnung für die Reparatur der Heizungsanlage', vorgang: 'Reparatur Heizung', branche: 'Fuhrpark', zahlungsweg: 'rechnung', betragNetto: null },
      { beschreibung: 'Für die Wartung der Klimaanlage liegt eine Rechnung vor', vorgang: 'Wartung Klimaanlage', branche: 'Maschinen',zahlungsweg: 'rechnung', betragNetto: null },
      { beschreibung: 'Rechnung für den Austausch von Bremsbelägen am Firmen-Lkw', vorgang: 'Kfz-Reparatur', branche: 'Fuhrpark', zahlungsweg: 'rechnung', betragNetto: null },
      { beschreibung: 'Rechnung für die Wartung der Produktionsmaschinen', vorgang: 'Maschinenwartung', branche: 'Maschinen',zahlungsweg: 'rechnung', betragNetto: null },
      { beschreibung: 'Eingansgrechnung für die Reparatur des Firmenfahrzeugs', vorgang: 'Kfz-Reparatur', branche: 'Fuhrpark',zahlungsweg: 'rechnung', betragNetto: null },
      { beschreibung: 'Eingang einer Rechnung für die Inspektion und Wartung des Firmentransporters', vorgang: 'Kfz-Reparatur', branche: 'Fuhrpark', zahlungsweg: 'rechnung', betragNetto: null },
      { beschreibung: 'Eingang einer Rechnung für die Wartung der Aufzugsanlage', vorgang: 'Wartung Aufzug', branche: 'Maschinen',zahlungsweg: 'rechnung', betragNetto: null },
      { beschreibung: 'Für die Reparatur der Lüftungsanlage geht eine Rechnung ein', vorgang: 'Reparatur Lüftung', branche: 'Maschinen', zahlungsweg: 'rechnung', betragNetto: null },
      { beschreibung: 'Eingangsrechnung für die Reparatur einer Maschine', vorgang: 'Reparatur Fräsmaschine', branche: 'Maschinen', zahlungsweg: 'rechnung', betragNetto: null },
    ],
    betragsbereich: { min: 200, max: 3000 }
  },

  fri_kasse: {
    name: 'Fremdinstandhaltung (Kasse)',
    konto: '6160 FRI',
    belegtyp: 'quittung',
    zahlungsarten: [
      {text: '', konto: '2880 KA', belegArt: 'quittung' },
    ],
    mitVorsteuer: true,
    mitUSt: false,
    vstSatz: 19,
    vstKonto: '2600 VORST',
    geschaeftsfaelle: [
      { beschreibung: 'Barzahlung der Wartungskosten für ein Kopiergerät', vorgang: 'Wartung Kopiergerät', branche: 'Büro', zahlungsweg: 'quittung', betragNetto: 79 },
      { beschreibung: 'Für die Reparatur eines Druckers liegt eine Quittung vor', vorgang: 'Reparatur Drucker',  branche: 'Büro', zahlungsweg: 'quittung', betragNetto: null },
      { beschreibung: 'Für die Entstörung der Telefonanlage liegt eine Quittung vor', vorgang: 'Entstörung Telefonanlage',  branche: 'Büro', zahlungsweg: 'quittung', betragNetto: null },
      { beschreibung: 'Barzahlung für die Reparatur einer Registrierkasse', vorgang: 'Reparatur Kasse',  branche: 'Büro', zahlungsweg: 'quittung', betragNetto: null },
      { beschreibung: 'Für die Reparatur eines Kopiergeräts liegt eine Quittung vor', vorgang: 'Reparatur Kopierer',  branche: 'Büro', zahlungsweg: 'quittung', betragNetto: null },
    ],
    betragsbereich: { min: 50, max: 500 }
  },

  // --------------------------------------------------------------------------
  // 6700 AWMP – Aufwendungen für Miete und Pacht
  // (Kein Vorsteuer-Abzug Wohnraummiete, aber oft steuerpflichtig Gewerbeflächen)
  // Hier: ohne Vorsteuer (vereinfacht für Unterricht), Zahlung per Bank
  // --------------------------------------------------------------------------
 
  awmp_bank: {
    name: 'Miete & Pacht (Bankabbuchung)',
    konto: '6700 AWMP',
    belegtyp: 'kontoauszug',
    kontoauszugArt: 'kontoauszug1.svg',
    zahlungsarten: [
      { text: '', konto: '2800 BK', belegArt: 'kontoauszug' },
      { text: '', konto: '2800 BK', belegArt: 'kontoauszug' },
      { text: '', konto: '2800 BK', belegArt: 'kontoauszug' },
    ],
    mitVorsteuer: true,
    mitUSt: false,
    vstSatz: 19,
    vstKonto: '2600 VORST',
    geschaeftsfaelle: [
      { beschreibung: 'Lastschrift für die Miete von Ausstellungsflächen auf einer Messe', vorgang: 'Miete Messefläche', zahlungsweg: 'kontoauszug', betragBrutto: 2359.77 },
      { beschreibung: 'Vom Bankkonto wird der Mietbetrag für Geschäftsräume abgebucht', vorgang: 'Miete Geschäftsräume', zahlungsweg: 'kontoauszug', betragBrutto: null },
      { beschreibung: 'Per Dauerauftrag wird die Kantinenpacht abgebucht', vorgang: 'Miete Betriebskantine', zahlungsweg: 'kontoauszug', betragBrutto: null },
      { beschreibung: 'Abbuchung der Pachtgebühr für den Firmenparkplatz vom Bankkonto', vorgang: 'Pacht Parkplatz', zahlungsweg: 'kontoauszug', betragBrutto: null },
      { beschreibung: 'Lastschrift der monatlichen Lagermiete', vorgang: 'Miete Lager', zahlungsweg: 'kontoauszug', betragBrutto: null },
      { beschreibung: 'Für ein Eingangslager wird vom Bankkonto die Miete eingezogen', vorgang: 'Miete Lager', zahlungsweg: 'kontoauszug', betragBrutto: null },
    ],
    betragsbereich: { min: 500, max: 2000 }
  },

  // --------------------------------------------------------------------------
  // 6900 VBEI – Versicherungsbeiträge
  // (keine USt, keine VSt, Zahlung per Bank-Einzug)
  // --------------------------------------------------------------------------
  vbei: {
    name: 'Versicherungsbeiträge',
    konto: '6900 VBEI',
    belegtyp: 'kontoauszug',
    kontoauszugArt: 'kontoauszug2.svg',
    zahlungsarten: [
      { text: '', konto: '2800 BK', belegArt: 'kontoauszug' },
      { text: '', konto: '2800 BK', belegArt: 'kontoauszug' },
      { text: '', konto: '2800 BK', belegArt: 'kontoauszug' },
    ],
    mitVorsteuer: false,
    mitUSt: false,
    geschaeftsfaelle: [
      { beschreibung: 'Bankeinzug der Beiträge für die Rechtsschutzversicherung', vorgang: 'Jahresbeitrag Rechtsschutzversicherung', zahlungsweg: 'kontoauszug', betragBrutto: 2770 },
      { beschreibung: 'Bankeinzug der jährlichen Kfz-Steuer', vorgang: 'Kfz-Steuer', zahlungsweg: 'kontoauszug', betragBrutto: 930 },
      { beschreibung: 'Abbuchung des Beitrags für die Betriebshaftpflichtversicherung vom Bankkonto', vorgang: 'Betriebshaftpflichtvers. Jahresbeitrag', zahlungsweg: 'kontoauszug', betragBrutto: null },
      { beschreibung: 'Lastschrift der Jahresprämie für die Feuerversicherung', vorgang: 'Jahresbeitrag Feuerversicherung', zahlungsweg: 'kontoauszug', betragBrutto: null },
      { beschreibung: 'Bankeinzug des Beitrags für die Transportversicherung', vorgang: 'Jahresbeitrag Transportversicherung', zahlungsweg: 'kontoauszug', betragBrutto: null },
      { beschreibung: 'Abbuchung der Jahresprämie für die Kfz-Haftpflichtversicherung', vorgang: 'Kfz-Haftpflicht', zahlungsweg: 'kontoauszug', betragBrutto: null },
      { beschreibung: 'Lastschrift der Beiträge für die Gebäudeversicherung', vorgang: 'Jahresbeitrag Gebäudeversicherung', zahlungsweg: 'kontoauszug', betragBrutto: null },
      { beschreibung: 'Bankeinzug der Prämie für die Elektronikversicherung', vorgang: 'Jahresbeitrag Elektronikversicherung', zahlungsweg: 'kontoauszug', betragBrutto: null },
      { beschreibung: 'Abbuchung des Beitrags für die Maschinenversicherung vom Geschäftskonto', vorgang: 'Maschinenversicherung Jahresbeitrag', zahlungsweg: 'kontoauszug', betragBrutto: null },
      { beschreibung: 'Lastschrift des Versicherungsbeitrags für die Inhaltsversicherung', vorgang: 'Jahresbeitrag Inhaltsversicherung', zahlungsweg: 'kontoauszug', betragBrutto: null },
    ],
    betragsbereich: { min: 1000, max: 3500 }
  },
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

function generateRandomBetrag(min = 100, max = 1000) {
  const steps = Math.floor((max - min) / 5);
  return min + (Math.floor(Math.random() * steps) * 5);
}

const wertFormulierungen = [
  ' in Höhe von ',
  ' über ',
  ', ',
];

// ============================================================================
// GESCHÄFTSFALL GENERIEREN
// ============================================================================
function erstelleZufallsGeschaeftsfall(verwendete = null) {
  const ausgewaehlteKonten = getAusgewaehlteKonten();

  let verfuegbareTypen = Object.keys(geschaeftsfallTypen);
  if (ausgewaehlteKonten.length > 0) {
    verfuegbareTypen = verfuegbareTypen.filter(typKey =>
      ausgewaehlteKonten.includes(geschaeftsfallTypen[typKey].konto)
    );
  }
  if (verfuegbareTypen.length === 0) {
    verfuegbareTypen = Object.keys(geschaeftsfallTypen);
  }

  const maxVersuche = 50;
  for (let versuch = 0; versuch < maxVersuche; versuch++) {
    const zufallsTyp = verfuegbareTypen[Math.floor(Math.random() * verfuegbareTypen.length)];
    const typ = geschaeftsfallTypen[zufallsTyp];
    const gfIndex = Math.floor(Math.random() * typ.geschaeftsfaelle.length);
    const schluessel = `${zufallsTyp}::${gfIndex}`;

    if (verwendete && verwendete.has(schluessel)) continue;
    if (verwendete) verwendete.add(schluessel);

    const zahlungsart = typ.zahlungsarten[Math.floor(Math.random() * typ.zahlungsarten.length)];
    const geschaeftsfall = typ.geschaeftsfaelle[gfIndex];
    const { min, max } = typ.betragsbereich;

    let nettoBetrag, bruttoBetrag, vstBetrag;

    if (typ.mitVorsteuer && typ.vstSatz) {
      const fixNetto = geschaeftsfall.betragNetto;
      nettoBetrag = fixNetto !== null && fixNetto !== undefined
        ? fixNetto
        : generateRandomBetrag(min, max);
      vstBetrag = roundToTwoDecimals(nettoBetrag * (typ.vstSatz / 100));
      bruttoBetrag = roundToTwoDecimals(nettoBetrag + vstBetrag);
    } else {
      const fixBrutto = geschaeftsfall.betragBrutto;
      bruttoBetrag = fixBrutto !== null && fixBrutto !== undefined
        ? fixBrutto
        : generateRandomBetrag(min, max);
      nettoBetrag = bruttoBetrag;
      vstBetrag = 0;
    }

    const betragFormatted = formatCurrency(bruttoBetrag);
    const nettoFormatted = formatCurrency(nettoBetrag);
    const vstFormatted = formatCurrency(vstBetrag);
    const wertPhrase = wertFormulierungen[Math.floor(Math.random() * wertFormulierungen.length)];

    let geschaeftsfallText = '';
if (typ.belegtyp === 'kontoauszug') {
  const bruttoLabel = typ.mitVorsteuer && typ.vstSatz ? ' brutto.' : '.';
  geschaeftsfallText = `${geschaeftsfall.beschreibung}${zahlungsart.text}${wertPhrase}${betragFormatted}${bruttoLabel}`;
} else if (typ.mitVorsteuer && typ.vstSatz) {
  // Rechnung / Quittung MIT Vorsteuer: zufällig Netto oder Brutto
  const zeigeNetto = Math.random() < 0.5;
  if (zeigeNetto) {
    geschaeftsfallText = `${geschaeftsfall.beschreibung}${wertPhrase}${nettoFormatted} netto.`;
  } else {
    geschaeftsfallText = `${geschaeftsfall.beschreibung}${wertPhrase}${betragFormatted} brutto.`;
  }

} else {
  // Ohne Vorsteuer: Netto = Brutto, einfach den Betrag
  geschaeftsfallText = `${geschaeftsfall.beschreibung}${wertPhrase}${betragFormatted}.`;
}

    return {
      text: geschaeftsfallText,
      typ: zufallsTyp,
      typDaten: typ,
      zahlungsart: zahlungsart,
      betrag: bruttoBetrag,
      nettoBetrag: nettoBetrag,
      vstBetrag: vstBetrag,
      betragFormatted: betragFormatted,
      nettoFormatted: nettoFormatted,
      vstFormatted: vstFormatted,
      vorgang: geschaeftsfall.vorgang || '',
      belegArt: geschaeftsfall.zahlungsweg || typ.belegtyp,
      branche: geschaeftsfall.branche || null,
    };
  }

  return null;
}

// ============================================================================
// BUCHUNGSSATZ ERSTELLEN
// ============================================================================
function erstelleBuchungssatz(gf) {
  const typ = gf.typDaten;

  if (typ.mitVorsteuer && gf.vstBetrag > 0) {
    // Soll: Aufwandskonto + VSt-Konto | Haben: Verbindlichkeiten oder Kasse
    return `
    <table style="border: 1px solid #ccc; white-space:nowrap; background-color:#fff; font-family:courier; width:600px; margin:0 0 6px;">
      <tbody>
        <tr>
          <td style="white-space:nowrap; max-width:140px; min-width:140px; vertical-align:top;" tabindex="1">${typ.konto}</td>
          <td style="text-align:right; white-space:nowrap; max-width:140px; min-width:140px; vertical-align:top;" tabindex="1">${gf.nettoFormatted}</td>
          <td rowspan="2" style="text-align:center; width:40px; vertical-align:top;" tabindex="1">an</td>
          <td rowspan="2" style="text-align:left; white-space:nowrap; max-width:140px; min-width:140px; vertical-align:top;" tabindex="1">${gf.zahlungsart.konto}</td>
          <td rowspan="2" style="text-align:right; white-space:nowrap; max-width:140px; min-width:140px; vertical-align:top;" tabindex="1">${gf.betragFormatted}</td>
        </tr>
        <tr>
          <td style="text-align:left; white-space:nowrap; max-width:140px; min-width:140px;" tabindex="1">${typ.vstKonto}</td>
          <td style="text-align:right; white-space:nowrap; max-width:140px; min-width:140px;" tabindex="1">${gf.vstFormatted}</td>
        </tr>
      </tbody>
    </table><br>`;
  }

  // Einfacher Buchungssatz (keine VSt)
  return `
    <table style="border: 1px solid #ccc; white-space:nowrap; background-color:#fff; font-family:courier; width:600px; margin:0 0 6px;">
      <tbody>
        <tr>
          <td style="white-space:nowrap; max-width:140px; min-width:140px;" tabindex="1">${typ.konto}</td>
          <td style="text-align:right; white-space:nowrap; max-width:140px; min-width:140px;" tabindex="1">${gf.betragFormatted}</td>
          <td style="text-align:center; width:100px; min-width:40px;" tabindex="1">an</td>
          <td style="text-align:left; white-space:nowrap; max-width:140px; min-width:140px;" tabindex="1">${gf.zahlungsart.konto}</td>
          <td style="text-align:right; white-space:nowrap; max-width:140px; min-width:140px;" tabindex="1">${gf.betragFormatted}</td>
        </tr>
      </tbody>
    </table><br>`;
}

function erstellePlainBuchungssatz(gf) {
  const typ = gf.typDaten;

  if (typ.mitVorsteuer && gf.vstBetrag > 0) {
    return `${typ.konto} ${gf.nettoFormatted} / ${typ.vstKonto} ${gf.vstFormatted} an ${gf.zahlungsart.konto} ${gf.betragFormatted}`;
  }

  return `${typ.konto} ${gf.betragFormatted} an ${gf.zahlungsart.konto} ${gf.betragFormatted}`;
}

// ============================================================================
// BELEG-URL ERSTELLEN
// ============================================================================
function erstelleBelegURL(gf) {
  const typ = gf.typDaten;
  const belegArt = gf.belegArt || typ.belegtyp;

  const params = new URLSearchParams();
  const now = new Date();
  const tag = now.getDate().toString().padStart(2, '0');
  const monat = (now.getMonth() + 1).toString().padStart(2, '0');
  const jahr = now.getFullYear().toString();

  // NEU: Lieferant aus passender Branche ermitteln
  const liefererName = findeLieferantFuerBranche(gf.branche);

 if (belegArt === 'kontoauszug') {
    params.set('beleg', 'kontoauszug');
    params.set('vorlage', typ.kontoauszugArt || 'kontoauszug1.svg');
    params.set('tag', tag);
    params.set('monat', monat);
    params.set('jahr', jahr);
    params.set('vorgang1', gf.vorgang || 'Zahlung');
    params.set('wertstellung1', gf.betragFormatted);
    if (liefererName) params.set('kontoinhaber', liefererName);
    return `belege.html?${params.toString()}`;
}

  if (belegArt === 'rechnung') {
    params.set('beleg', 'rechnung');
    params.set('vorlage', 'template7.svg');
    params.set('tag', tag);
    params.set('monat', monat);
    params.set('jahr', jahr);
    params.set('artikel1', gf.vorgang || 'Dienstleistung');
    params.set('menge1', '1');
    params.set('einheit1', '');
    params.set('einzelpreis1', gf.nettoBetrag.toString());
    if (typ.mitVorsteuer && typ.vstSatz) {
      params.set('umsatzsteuer', typ.vstSatz.toString());
    }
    if (liefererName) params.set('lieferer', liefererName);
    return `belege.html?${params.toString()}`;
}

  if (belegArt === 'quittung') {
    params.set('beleg', 'quittung');
    params.set('tag', tag);
    params.set('monat', monat);
    params.set('jahr', jahr);
    params.set('netto', gf.nettoBetrag.toString());
    params.set('ust', typ.vstSatz ? typ.vstSatz.toString() : '19');
    params.set('zweck', gf.vorgang || 'Dienstleistung');
    if (liefererName) params.set('empfaenger', liefererName); // ← bei Quittung
    return `belege.html?${params.toString()}`;
  }

  return null;
}

/**
 * Sucht einen zufälligen Lieferanten aus yamlData, dessen Branche passt.
 * Fallback: irgendein zufälliges Unternehmen, falls keine Branche matcht.
 */
function findeLieferantFuerBranche(branche) {
  if (!yamlData || yamlData.length === 0) return null;
  if (!branche) return null;

  // Alle Unternehmen mit passender Branche
  const passende = yamlData.filter(u =>
    u.unternehmen?.branche?.toLowerCase() === branche.toLowerCase()
  );

  const pool = passende.length > 0 ? passende : yamlData;
  const zufaellig = pool[Math.floor(Math.random() * pool.length)];
  return zufaellig?.unternehmen?.name || null;
}


// ============================================================================
// BELEG-BUTTON ERSTELLEN
// ============================================================================
function erstelleBelegButton(nummer, gf) {
  const url = erstelleBelegURL(gf);

  if (!url) {
    return `
      <div style="width:100%; padding:10px 12px; font-size:13px; margin-bottom:8px;
                  color:#999; border:1px dashed #ccc; border-radius:4px; text-align:center;"
           title="Für diesen Geschäftsfalltyp ist kein Beleg verfügbar">
        ${nummer}. Noch kein Beleg verfügbar
      </div>`;
  }

  const belegArt = gf.belegArt || gf.typDaten.belegtyp;
  const belegTypName = belegArt === 'kontoauszug' ? 'Kontoauszug'
                     : belegArt === 'rechnung'    ? 'Rechnung'
                     : belegArt === 'quittung'    ? 'Quittung'
                     : 'Beleg';
  const icon = belegArt === 'kontoauszug' ? '🏦' : belegArt === 'quittung' ? '🧾' : '📄';

  return `
    <button
      class="geschaeftsfall-beleg-button"
      data-url="${url.replace(/"/g, '&quot;')}"
      onclick="window.open(this.dataset.url, '_blank')"
      title="${belegTypName} für Aufgabe ${nummer} erstellen"
      style="width:100%; padding:10px 12px; font-size:14px; margin-bottom:8px;"
    >
      ${icon} ${nummer}. ${belegTypName} erstellen
    </button>`;
}

// ============================================================================
// HAUPTFUNKTION – GESCHÄFTSFÄLLE ANZEIGEN
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

  verwendeteSchluessel = new Set(); // ← RESET – das fehlte!

  const testGf = erstelleZufallsGeschaeftsfall(verwendeteSchluessel);
  if (!testGf) {
    container.innerHTML = `
      <div style="padding: 14px 16px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 5px; color: #856404; margin-top: 16px;">
        ⚠️ <strong>Keine passenden Geschäftsfälle verfügbar.</strong><br>
        Die gewählte Kombination aus Optionen und Konten ergibt keine gültigen Aufgaben.
        Bitte wählen Sie weitere Konten aus oder aktivieren Sie mehr Optionen.
      </div>`;
    return;
  }

  let aufgabenHTML = '<h2>Aufgaben</h2><ol>';
  let loesungenHTML = '<h2>Lösung</h2>';

  letzteGenerierteGeschaeftsfaelle = [testGf];
  for (let i = 1; i < anzahl; i++) {
    const gf = erstelleZufallsGeschaeftsfall(verwendeteSchluessel);
    if (gf) letzteGenerierteGeschaeftsfaelle.push(gf);
  }
  const geschaeftsfaelle = letzteGenerierteGeschaeftsfaelle;

  geschaeftsfaelle.forEach((gf, idx) => {
    const i = idx + 1;
    aufgabenHTML  += `<li>${gf.text}</li>`;
    loesungenHTML += `<div style="margin-top: 1.5em;"><strong>${i}.</strong><br>${erstelleBuchungssatz(gf)}</div>`;

    const buttonHTML = erstelleBelegButton(i, gf);
    const div = document.createElement('div');
    div.style.margin = '12px 0';
    div.innerHTML = buttonHTML;
    buttonColumn.appendChild(div);
  });

  aufgabenHTML += '</ol>';
  container.innerHTML = aufgabenHTML + loesungenHTML;

  const vorschau = document.getElementById("kiPromptVorschau");
  if (vorschau && vorschau.style.display !== "none") {
    vorschau.textContent = erstelleKiPromptText();
  }
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

  const kundeSelect = document.getElementById('kunde');
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
Du bist ein freundlicher Buchführungs-Assistent für Schüler der Realschule (BwR). Du hilfstm Verständnis von Buchungssätzen im Bereich betriebliche Aufwendungen: Reparaturen/Fremdleistungen (6160 FRI), Miete und Pacht (6700 AWMP) sowie Versicherungsbeiträge (6900 VBEI).

Aufgabe:
- Gib KEINE fertigen Buchungssätze, Beträge oder Konten vor.
- Führe die Schüler durch gezielte Fragen und Hinweise zur richtigen Lösung.
- Ziel: Lernförderung, nicht das Abnehmen der Denkarbeit.

Pädagogischer Ansatz:
- Frage nach dem konkreten Geschäftsfall oder Beleg und dessen Inhalt.
- Stelle gezielte Rückfragen, um den Stand des Schülers zu verstehen.
- Beantworte deine Rückfragen nicht selbst, hake falschen Antworten nach.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Erst wenn alle Teilschritte richtig beantwortet wurden, bestätige den vollständigen Buchungssatz.

Methodik Rückfragen:
- Um welche Art von Aufwand handelt es sich?
- Wie wurde gezahlt – per Überweisung (Bank), bar (Kasse) oder auf Rechnung (Verbindlichkeiten)?
- Gibt es Vorsteuer? (Ja Reparaturen und Miete, nein Versicherungen!)
- Welche Konten sind betroffen?
- Welche Seite (Soll/Haben) wirdm Aufwandskonto gebucht?

A. Begrüße den Schüler freundlich mit "Hallo" und gib ihm einen Geschäftsfall vor, den du zufällig aus der folgenden Aufgabenliste auswählst:
Arbeitsauftrag: "Bilde den Buchungssatz zum Geschäftsfall."

###AUFGABEN und LÖSUNGEN###

B. Sobald der Schüler einen Geschäftsfall geschickt hat, stelle die Fragen nacheinander (nicht in einer Antwort). Schreibe nie die Lösung in deine Antwort, wenn der Schüler falsch antwortet. Bevor du die nächste Frage stellst, sollte die aktuelle Frage richtig beantwortet sein.
   - Frage: „Welche Konten werden benötigt?" Prüfe, ob die Schülerlösung stimmt. Schaue dazu für dich in der Musterlösung nach welche Konten gebucht werden! Sage dann, ob der Schüler falsch liegt oder ob es richtig ist.
   - Frage weiter: „Bilde nun den vollständigen Buchungssatz."

Kontenplan – Betriebliche Aufwendungen:
Aufwandskonten (immer im SOLL):
- 6160 FRI – Fremdleistungen / Reparaturen
- 6700 AWMP – Aufwendungen für Miete und Pacht
- 6900 VBEI – Versicherungsbeiträge

Vorsteuerkonten (immer im SOLL):
- 2600 VORST – Vorsteuer (nur Reparaturen und Miete!)

Zahlungskonten:
- 2800 BK – Bank (Soll Eingang, Haben Zahlung)
- 2000 KA – Kasse (Haben Barzahlung)
- 4400 VE – Verbindlichkeiten (Haben Rechnungseingang, noch nicht bezahlt)

Buchungslogik:
- Aufwendungen immer im SOLL
- Bei Rechnungseingang (noch nicht bezahlt): Gegenkonto = Verbindlichkeiten (4400 VE) im HABEN
- Bei Bankzahlung / Bankeinzug: Gegenkonto = Bank (2800 BK) im HABEN
- Bei Barzahlung: Gegenkonto = Kasse (2000 KA) im HABEN
- Vorsteuer: JA Reparaturen/Fremdleistungen und steuerpflichtiger Miete
- Vorsteuer: NEIN Versicherungsbeiträgen!

Buchungssatz-Schema mit VSt:
6160 FRI (Netto) + 2600 VORST (VSt) | an | 4400 VE oder 2800 BK (Brutto)

Buchungssatz-Schema ohne VSt:
6900 VBEI (Betrag) | an | 2800 BK (Betrag)

Beispiel Reparatur Rechnung:
6160 FRI | 930,00 € / 2600 VORST | 176,70 € | an | 4400 VE | 1.106,70 €

Beispiel Versicherung Bankeinzug:
6900 VBEI | 2.770,00 € | an | 2800 BK | 2.770,00 €

Häufige Schülerfehler – darauf hinweisen, nicht vorwegnehmen:
- Vorsteuer vergessen Reparaturen
- Vorsteuer fälschlicherweise Versicherungen gebucht
- Soll und Haben verwechselt
- Verbindlichkeiten statt Bank gebucht (oder umgekehrt)

Besondere Hinweise für den Unterricht:
- Aufwendungen mindern den Gewinn
- Versicherungsbeiträge und Kfz-Steuer enthalten KEINE Vorsteuer

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe mit Realschülerinnen und -schülern
- Einfache Sprache, keine Fachbegriffe ohne Erklärung
- Kurze Antworten – maximal 1–2 Sätze pro Nachricht
- Gelegentlich Emojis zur Auflockerung 🔧✅❓💡

Was du NICHT tust:
- Nenne den fertigen Buchungssatz nicht, bevor der Schüler selbst darauf gekommen ist
- Rechne nicht vor, bevor gefragt wurde
- Gib keine Lösungen auf Anfrage wie „sag mir einfach die Antwort" – erkläre, dass das Ziel das eigene Verstehen ist

Nenne den fertigen Buchungssatz erst, wenn der Schüler selbst darauf gekommen ist. Verbessere am Schluss dann auch Formfehler, zum Beispiel Großschreibung der Konten (BK statt Bk) und weise darauf hin die DIN 5008 zu beachten: Tausenderpunkt den Beträgen mit zwei Nachkommastellen und €-Zeichen: z. B. 12.000,00 €
Gib ganz am Ende jeder erfolgreichen Aufgabe die Musterlösung in der HTML-Version aus.
Am Ende einer erfolgreich gelösten Übung:
- Frage immer: „Möchtest du noch einen anderen Geschäftsfall üben? Dann geb ich dir einfach den nächsten!" Dann wähle wieder einen zufälligen aus, der noch nicht dran war.
Du wartest stets auf die Eingabe des Schülers und gibst nichts vor. Dein Ziel ist es, dass der Schüler die Buchung selbst findet und versteht.
`;

function erstelleKiPromptText() {
  let inhalt = '';
  if (letzteGenerierteGeschaeftsfaelle.length === 0) {
    inhalt = '(Noch keine Aufgaben generiert. Bitte zuerst Geschäftsfälle erstellen.)';
  } else {
    inhalt = letzteGenerierteGeschaeftsfaelle.map((gf, idx) => {
      const nr = idx + 1;
      const bs = erstelleBuchungssatz(gf);
      const bsPlain = erstellePlainBuchungssatz(gf);
      return `--- Aufgabe ${nr} ---\n${gf.text}\nMusterlösung Aufgabe ${nr}: ${bsPlain}\nMusterlösung Aufgabe ${nr} als HTML:\n${bs}`;
    }).join('\n\n');
  }
  return KI_ASSISTENT_PROMPT.replace('###AUFGABEN und LÖSUNGEN###', inhalt);
}

function kopiereKiPrompt() {
  const promptText = erstelleKiPromptText();
  navigator.clipboard.writeText(promptText).then(() => {
    const btn = document.getElementById('kiPromptKopierenBtn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Kopiert!`;
    btn.classList.add('ki-prompt-btn--success');
    setTimeout(() => { btn.innerHTML = originalHTML; btn.classList.remove('ki-prompt-btn--success'); }, 2500);
  }).catch(err => {
    console.error('Fehlerm Kopieren:', err);
    alert('Kopieren nicht möglich. Bitte manuell aus dem Textfeld kopieren.');
  });
}

function toggleKiPromptVorschau() {
  const vorschau = document.getElementById('kiPromptVorschau');
  const btn = document.getElementById('kiPromptToggleBtn');
  const isHidden = getComputedStyle(vorschau).display === 'none';
  if (isHidden) {
    vorschau.style.display = 'block';
    vorschau.textContent = erstelleKiPromptText();
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
  initializeKontoAuswahl();

  const kundeSelect = document.getElementById('kunde');

  if (kundeSelect && kundeSelect.value) {
    kunde = kundeSelect.value.trim();
  }

  kundeSelect.addEventListener('change', () => {
    kunde = kundeSelect.value.trim() || '<i>[Modellunternehmen]</i>';
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

  const vorschauEl = document.getElementById('kiPromptVorschau');
  if (vorschauEl) {
    vorschauEl.textContent = KI_ASSISTENT_PROMPT;
  }
});

// Auto-Select: Mein Unternehmen aus localStorage
function autoSelectMyCompany() {
  const myCompanyName = localStorage.getItem('myCompany');
  if (!myCompanyName) return;

  const dropdowns = document.querySelectorAll('select.meinUnternehmen');
  dropdowns.forEach(dropdown => {
    const matchingOption = Array.from(dropdown.options).find(opt => opt.value === myCompanyName);
    if (matchingOption) {
      dropdown.value = myCompanyName;
      dropdown.dispatchEvent(new Event('change', { bubbles: true }));
      console.log(`"${myCompanyName}" automatisch in Dropdown ausgewählt`);
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  setTimeout(autoSelectMyCompany, 250);
  setTimeout(zeigeZufaelligeGeschaeftsfaelle, 500);
});