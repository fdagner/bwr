// ============================================================================
// GESCHÄFTSFÄLLE MIT KONTO-AUSWAHL - KREDITBEREICH
// ============================================================================
// Globale Variablen
let yamlData = [];
let kunde = '<i>[Modellunternehmen]</i>';
let letzteGenerierteGeschaeftsfaelle = [];

// Konten-Definitionen
const kontenDefinitionen = {
    '4200 KBKV': {
        beschreibung: 'Kurzfristige Bankverbindlichkeiten',
    },
    '4250 LBKV': {
        beschreibung: 'Langfristige Bankverbindlichkeiten',
    },
    '7510 ZAW': {
        beschreibung: 'Zinsaufwendungen (inkl. Disagio)',
    },
    '6750 KGV': {
        beschreibung: 'Kosten des Geldverkehrs',
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
// GESCHÄFTSFALL-TYPEN AUSWAHL FUNKTIONEN (ERSATZ FÜR KONTEN)
// ============================================================================

// Wird beim Start aufgerufen, prüft und aktualisiert die Anzeige
function initializeKontoAuswahl() {
    aktualisiereAuswahlInfo();
}

function aktualisiereAuswahlInfo() {
    const auswahlInfo = document.getElementById('auswahlInfo');
    const checkboxes = document.querySelectorAll('.typCheckbox');
    const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;

    if (!auswahlInfo) return;

    if (checkedCount === 0) {
        auswahlInfo.textContent = '⚠️ Keine Themen ausgewählt - es werden alle verfügbaren Geschäftsfälle verwendet';
        auswahlInfo.style.background = '#fff3cd';
        auswahlInfo.style.color = '#856404';
    } else if (checkedCount === checkboxes.length) {
        auswahlInfo.style.display = 'none'; // Blendet den Hinweistext aus, wenn alles gewählt ist
    } else {
        auswahlInfo.style.display = 'block';
        auswahlInfo.textContent = `✓ ${checkedCount} von ${checkboxes.length} Themen ausgewählt`;
        auswahlInfo.style.background = '#d1ecf1';
        auswahlInfo.style.color = '#0c5460';
    }
}

function alleTypenAuswaehlen() {
    document.querySelectorAll('.typCheckbox').forEach(cb => cb.checked = true);
    aktualisiereAuswahlInfo();
}

function alleTypenAbwaehlen() {
    document.querySelectorAll('.typCheckbox').forEach(cb => cb.checked = false);
    aktualisiereAuswahlInfo();
}

// Ersetzt das alte getAusgewaehlteKonten
function getAusgewaehlteTypen() {
    const checkboxes = document.querySelectorAll('.typCheckbox:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function generateGlattenBetrag(min = 10000, max = 100000, schritt = 5000) {
    const anzahlSchritte = Math.floor((max - min) / schritt);
    return min + (Math.floor(Math.random() * (anzahlSchritte + 1)) * schritt);
}



// ============================================================================
// GESCHÄFTSFALL-DEFINITIONEN
// ============================================================================
const geschaeftsfallTypen = {

    // --------------------------------------------------------------------------
    // 4200 KBKV – Kurzfristige Bankverbindlichkeiten (Kreditaufnahme)
    // --------------------------------------------------------------------------
    kbkv: {
        name: 'Kreditaufnahme (kurzfristig)',
        sollKonto: '2800 BK',
        habenKonto: '4200 KBKV',
        belegtyp: 'kontoauszug',
        kontoauszugArt: 'kontoauszug3.svg',
        zahlungsarten: [
            { text: 'wird gutgeschrieben', konto: '2800 BK' },
            { text: 'wird auf dem Konto gutgeschrieben', konto: '2800 BK' },
        ],
        mitVorsteuer: false,
        mitUSt: false,
        geschaeftsfaelle: [
            { beschreibung: 'Ein kurzfristiger Bankkredit ', vorgang: 'Kreditaufnahme kurzfristig' },
            { beschreibung: 'Ein kurzfristiges Darlehen zur Überbrückung von Engpässen ', vorgang: 'Gutschrift Kurzfristkredit' },
            { beschreibung: 'Ein kurzfristiger Betriebsmittelkredit ', vorgang: 'Kreditaufnahme KBKV' },
            { beschreibung: 'Ein Bankkredit mit einer Laufzeit von 6 Monaten ', vorgang: 'Kurzfristiges Darlehen' },
        ],
        customBetrag: () => generateGlattenBetrag(10000, 50000, 5000),
        betragsbereich: { min: 10000, max: 50000 }
    },

    // --------------------------------------------------------------------------
    // 4250 LBKV – Langfristige Bankverbindlichkeiten (Kreditaufnahme)
    // --------------------------------------------------------------------------
    lbkv: {
        name: 'Kreditaufnahme (langfristig)',
        sollKonto: '2800 BK',
        habenKonto: '4250 LBKV',
        belegtyp: 'kontoauszug',
        kontoauszugArt: 'kontoauszug3.svg',
        zahlungsarten: [
            { text: 'wird gutgeschrieben', konto: '2800 BK' },
            { text: 'wird auf dem Konto gutgeschrieben', konto: '2800 BK' },
        ],
        mitVorsteuer: false,
        mitUSt: false,
        geschaeftsfaelle: [
            { beschreibung: 'Ein langfristiges Darlehen ', vorgang: 'Kreditaufnahme langfristig' },
            { beschreibung: 'Ein langfristiger Investitionskredit ', vorgang: 'Investitionskredit' },
            { beschreibung: 'Ein Baudarlehen ', vorgang: 'Baudarlehen' }
        ],
        customBetrag: () => generateGlattenBetrag(50000, 200000, 10000),
        betragsbereich: { min: 50000, max: 200000 }
    },

    // --------------------------------------------------------------------------
    // 7510 ZAW – Zinsaufwendungen (Sollzinsen / Überziehungszinsen)
    // --------------------------------------------------------------------------
    zaw: {
        name: 'Zinsaufwendungen',
        sollKonto: '7510 ZAW',
        habenKonto: '2800 BK',
        belegtyp: 'kontoauszug',
        kontoauszugArt: 'kontoauszug1.svg',
        zahlungsarten: [
            { text: 'werden vom Geschäftskonto abgebucht', konto: '2800 BK' },
            { text: 'werden vom Bankkonto abgebucht', konto: '2800 BK' },
        ],
        mitVorsteuer: false,
        mitUSt: false,
        geschaeftsfaelle: [
            { beschreibung: 'Sollzinsen ', vorgang: 'Sollzinsen' },
            { beschreibung: 'Überziehungszinsen ', vorgang: 'Überziehungszinsen' },
            { beschreibung: 'Darlehenszinsen für den Bankkredit ', vorgang: 'Zinsaufwand' },
            { beschreibung: 'Zinsen für die Inanspruchnahme des Kontokorrentkredits ', vorgang: 'Sollzinsen Bank' },
            { beschreibung: 'Zinsaufwendungen ', vorgang: 'Zinsbelastung' },
        ],
        betragsbereich: { min: 150, max: 2800 }
    },

    // --------------------------------------------------------------------------
    // 6750 KGV – Kontoführungsgebühren / Bankspesen
    // --------------------------------------------------------------------------
    kgv: {
        name: 'Kontoführungsgebühren',
        sollKonto: '6750 KGV',
        habenKonto: '2800 BK',
        belegtyp: 'kontoauszug',
        kontoauszugArt: 'kontoauszug1.svg',
        zahlungsarten: [
            { text: 'werden vom Geschäftskonto abgebucht', konto: '2800 BK' },
            { text: 'werden vom Konto belastet', konto: '2800 BK' },
        ],
        mitVorsteuer: false,
        mitUSt: false,
        geschaeftsfaelle: [
            { beschreibung: 'Die vierteljährlichen Kontoführungsgebühren ', vorgang: 'Kontoführungsgebühren' },
            { beschreibung: 'Bankspesen für die Kontoführung ', vorgang: 'Bankspesen' },
            { beschreibung: 'Gebühren für den Zahlungsverkehr ', vorgang: 'Kontoführung' },
            { beschreibung: 'Bearbeitungsgebühren für die Bereitstellung des Geschäftskontos ', vorgang: 'Bankgebühren' },
        ],
        betragsbereich: { min: 25, max: 350 }
    },

    // --------------------------------------------------------------------------
    // Umwandlung kurzfristiger in langfristige Bankverbindlichkeiten
    // --------------------------------------------------------------------------
    umwandlung_kredit: {
        name: 'Kreditumwandlung',
        sollKonto: '4200 KBKV',
        habenKonto: '4250 LBKV',
        belegtyp: 'sonstiger',
        zahlungsarten: [],
        mitDisagio: false,
        geschaeftsfaelle: [
            { beschreibung: 'Ein kurzfristiger Bankkredit bei der Hausbank wird in ein langfristiges Darlehen umgewandelt ', vorgang: 'Kreditumwandlung' },
            { beschreibung: 'Bestehende kurzfristige Bankverbindlichkeiten werden in langfristige Verbindlichkeiten umgeschuldet ', vorgang: 'Umschuldung Kredit' },
            { beschreibung: 'Ein kurzfristiges Darlehen wird in ein langfristiges Immobiliendarlehen umgewandelt ', vorgang: 'Kreditumwandlung' },
        ],
        customBetrag: () => generateGlattenBetrag(20000, 100000, 5000),
        betragsbereich: { min: 20000, max: 100000 }
    },

    // --------------------------------------------------------------------------
    // Kreditaufnahme mit Disagio (Buchung auf ZAW)
    // --------------------------------------------------------------------------
    kredit_disagio: {
        name: 'Kreditaufnahme mit Disagio',
        sollKonto: '2800 BK',
        habenKonto: '4250 LBKV',
        belegtyp: 'kontoauszug',
        kontoauszugArt: 'kontoauszug1.svg',
        zahlungsarten: [
            { text: 'abzüglich Disagio ausgezahlt', konto: '2800 BK' }
        ],
        mitDisagio: true,
        disagioSatz: 1.5,
        geschaeftsfaelle: [
            { typText: 'Die Bank zahlt ein langfristiges Darlehen in Höhe von {summe} abzüglich von {satz} % Disagio auf dem Bankkonto von {kunde} aus.', vorgang: 'Kreditaufnahme mit Disagio' },
            { typText: 'Ein langfristiger Investitionskredit über {summe} wird unter Einbehalt von {satz} % Disagio auf dem Bankkonto von {kunde} gutgeschrieben.', vorgang: 'Darlehensauszahlung Disagio' },
            { typText: 'Die Hausbank bewilligt ein Baudarlehen in Höhe von {summe} abzüglich {satz} % Disagio zur Gutschrift auf dem Bankkonto von {kunde}.', vorgang: 'Baudarlehen mit Disagio' }
        ],
        customBetrag: () => generateGlattenBetrag(100000, 250000, 10000),
        betragsbereich: { min: 100000, max: 250000 }
    },

    // --------------------------------------------------------------------------
    // Kreditrückzahlung (Tilgung langfristiger Bankverbindlichkeiten)
    // --------------------------------------------------------------------------
    tilgung: {
        name: 'Kreditrückzahlung',
        sollKonto: '4250 LBKV',
        habenKonto: '2800 BK',
        belegtyp: 'kontoauszug',
        kontoauszugArt: 'kontoauszug1.svg',
        zahlungsarten: [
            { text: '', konto: '2800 BK' },
            { text: 'per Banküberweisung', konto: '2800 BK' }
        ],
        mitVorsteuer: false,
        mitUSt: false,
        geschaeftsfaelle: [
            { beschreibung: 'Die Tilgung des langfristigen Darlehens ', vorgang: 'Darlehenstilgung' },
            { beschreibung: 'Die planmäßige Rückzahlung des Investitionskredits ', vorgang: 'Kreditrückzahlung' },
            { beschreibung: 'Tilgung des Baudarlehens ', vorgang: 'Tilgung Baudarlehen' }
        ],
        customBetrag: () => generateGlattenBetrag(10000, 50000, 5000),
        betragsbereich: { min: 10000, max: 50000 }
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

function parseNumericValue(value) {
    if (!value) return '0';
    return value.toString().replace(/[€\s]/g, '').replace(/\./g, '').replace(',', '.');
}

const wertFormulierungen = [
    ' in Höhe von ',
    ' mit einem Betrag von '
];

// ============================================================================
// HIER GEHÖREN DIE NEUEN TEXT-VARIANTEN HIN:
// ============================================================================
const variantenSoll = [
    `auf dem Bankkonto von ${kunde} `,
    `auf dem Geschäftskonto der Firma ${kunde} `,
    `auf dem Bankkonto des Unternehmens ${kunde} `,
    `auf dem Girokonto von Fa. ${kunde} `,
];

const variantenHaben = [
    `vom Bankkonto von ${kunde} `,
    `vom Geschäftskonto der Firma ${kunde} `,
    `vom Bankkonto des Unternehmens ${kunde} `,
    `vom Girokonto von Fa. ${kunde} `,
];

// ============================================================================
// GESCHÄFTSFALL GENERIEREN
// ============================================================================

// ============================================================================
// GESCHÄFTSFALL GENERIEREN
// ============================================================================

function erstelleZufallsGeschaeftsfall() {
    // HIER DIE KORREKTUR: Wir holen die ausgewählten Typen statt Konten
    const ausgewaehlteTypen = getAusgewaehlteTypen();

    let verfuegbareTypen = Object.keys(geschaeftsfallTypen);
    
    if (ausgewaehlteTypen.length > 0) {
        verfuegbareTypen = verfuegbareTypen.filter(typKey => {
            return ausgewaehlteTypen.includes(typKey);
        });
    }
    
    // Wenn gar nichts ausgewählt ist, nimm sicherheitshalber alle
    if (verfuegbareTypen.length === 0) {
        verfuegbareTypen = Object.keys(geschaeftsfallTypen);
    }

    const zufallsTyp = verfuegbareTypen[Math.floor(Math.random() * verfuegbareTypen.length)];
    const typ = geschaeftsfallTypen[zufallsTyp];

    const geschaeftsfall = typ.geschaeftsfaelle[Math.floor(Math.random() * typ.geschaeftsfaelle.length)];
    const { min, max } = typ.betragsbereich;
    
    // Wenn der Typ eine eigene glatte Betragsfunktion hat, nutze diese, sonst den Standard
    const bruttoBetrag = typ.customBetrag ? typ.customBetrag() : generateRandomBetrag(min, max);

    let ausgabeData = {
        text: '',
        typ: zufallsTyp,
        typDaten: typ,
        betrag: bruttoBetrag,
        betragFormatted: formatCurrency(bruttoBetrag),
        vorgang: geschaeftsfall.vorgang || null,
        extraDaten: {}
    };

   // Textgenerierung je nach Geschäftsfall-Typ
    switch (zufallsTyp) {
        case 'kredit_disagio': {
            const zinssatz = typ.disagioSatz || 1.5;
            const disagioBetrag = roundToTwoDecimals(bruttoBetrag * (zinssatz / 100));
            const auszahlungsBetrag = roundToTwoDecimals(bruttoBetrag - disagioBetrag);

            ausgabeData.kreditsumme = bruttoBetrag;
            ausgabeData.disagioBetrag = disagioBetrag;
            ausgabeData.auszahlungsBetrag = auszahlungsBetrag;
            
            ausgabeData.kreditsummeFormatted = formatCurrency(bruttoBetrag);
            ausgabeData.disagioFormatted = formatCurrency(disagioBetrag);
            ausgabeData.auszahlungFormatted = formatCurrency(auszahlungsBetrag);
            ausgabeData.betragFormatted = formatCurrency(auszahlungsBetrag);
            ausgabeData.disagioSatz = zinssatz;

            const satzFormatted = zinssatz.toFixed(1).replace('.', ',');
            const zufallsGf = geschaeftsfall.typText;
            
            ausgabeData.text = zufallsGf
              .replace('{summe}', ausgabeData.kreditsummeFormatted)
              .replace('{satz}', satzFormatted)
              .replace('{kunde}', kunde);

            ausgabeData.betrag = auszahlungsBetrag; 
            break;
        }

        case 'umwandlung_kredit': {
            ausgabeData.text = `${geschaeftsfall.beschreibung} in Höhe von ${ausgabeData.betragFormatted} bei ${kunde}.`;
            break;
        }

        case 'kbkv': {
            ausgabeData.text = `${geschaeftsfall.beschreibung} über ${ausgabeData.betragFormatted}.`;
            break;
        }

        case 'tilgung': {
            const zahlungsart = typ.zahlungsarten[Math.floor(Math.random() * typ.zahlungsarten.length)];
            const variantenHaben = [
                `vom Bankkonto von ${kunde} `,
                `vom Geschäftskonto der Firma ${kunde} `,
            ];
            const habenero = variantenHaben[Math.floor(Math.random() * variantenHaben.length)];
            const wertPhrase = wertFormulierungen[Math.floor(Math.random() * wertFormulierungen.length)];

            ausgabeData.text = `${geschaeftsfall.beschreibung}${habenero}${wertPhrase}${ausgabeData.betragFormatted} ${zahlungsart.text}.`;
            ausgabeData.zahlungsart = zahlungsart;
            break;
        }

        default: {
            // Standard für ZAW, KGV, LBKV usw.
            const zahlungsart = typ.zahlungsarten[Math.floor(Math.random() * typ.zahlungsarten.length)];
            const variantenSoll = [
                `auf dem Bankkonto von ${kunde} `,
                `auf dem Geschäftskonto der Firma ${kunde} `,
            ];
            const variantenHaben = [
                `des Girokontos von ${kunde} `,
                `der Firma ${kunde} `,
            ];
            const ausgabe = typ.sollKonto === '2800 BK' ? variantenSoll[Math.floor(Math.random() * variantenSoll.length)] : variantenHaben[Math.floor(Math.random() * variantenHaben.length)];
            const wertPhrase = wertFormulierungen[Math.floor(Math.random() * wertFormulierungen.length)];

            ausgabeData.text = `${geschaeftsfall.beschreibung}${ausgabe}${zahlungsart.text}${wertPhrase}${ausgabeData.betragFormatted}.`;
            ausgabeData.zahlungsart = zahlungsart;
            break;
        }
    }

    return ausgabeData;
}
// ============================================================================
// BUCHUNGSSATZ ERSTELLEN (Mit Nebenrechnung bei Disagio)
// ============================================================================
function erstelleBuchungssatz(geschaeftsfall) {
    const typ = geschaeftsfall.typDaten;

    if (typ.mitDisagio) {
        // Prozentuale Anteile berechnen für die Tabelle
        const satzDisagio = geschaeftsfall.disagioSatz.toFixed(2).replace('.', ',') + '&nbsp;%';
        const prozentRest = (100 - geschaeftsfall.disagioSatz).toFixed(2).replace('.', ',') + '&nbsp;%';

        // Nebenrechnung als HTML-Tabelle + direkt darunter der Buchungssatz
        return `
    <table style="border-collapse: collapse; white-space: nowrap; width: 400px; margin: 0 0 6px; font-family: sans-serif; font-size: 14px;">
      <tbody>
        <tr>
          <td>Kreditsumme</td>
          <td style="padding-left: 6px; text-align: right;">${geschaeftsfall.kreditsummeFormatted}</td>
          <td style="padding-left: 6px; text-align: right;">100,00&nbsp;%</td>
        </tr>
        <tr>
          <td>- Disagio</td>
          <td style="padding-left: 6px; text-align: right;">${geschaeftsfall.disagioFormatted}</td>
          <td style="padding-left: 6px; text-align: right;">${satzDisagio}</td>
        </tr>
        <tr>
          <td style="border-top: solid 1px #ccc;">= Auszahlung</td>
          <td style="border-top: solid 1px #ccc; padding-left: 6px; text-align: right;">${geschaeftsfall.auszahlungFormatted}</td>
          <td style="border-top: solid 1px #ccc; padding-left: 6px; text-align: right;">${prozentRest}</td>
        </tr>
      </tbody>
    </table><br>
    <table style="border: 1px solid #ccc; white-space: nowrap; background-color: #fff; font-family: courier; width: 600px; margin: 0 0 6px;">
      <tbody>
        <tr>
          <td style="border-width: 0; white-space: nowrap; max-width: 140px; min-width: 140px; vertical-align: top;" tabindex="1">2800 BK</td>
          <td style="border-width: 0; text-align: right; white-space: nowrap; max-width: 140px; min-width: 140px; vertical-align: top;" tabindex="1">${geschaeftsfall.auszahlungFormatted}</td>
          <td rowspan="2" style="border-width: 0; text-align: center; width: 40px; vertical-align: top;" tabindex="1">an</td>
          <td rowspan="2" style="border-width: 0; text-align: left; white-space: nowrap; max-width: 140px; min-width: 140px; vertical-align: top;" tabindex="1">${typ.habenKonto}</td>
          <td rowspan="2" style="border-width: 0; text-align: right; white-space: nowrap; max-width: 140px; min-width: 140px; vertical-align: top;" tabindex="1">${geschaeftsfall.kreditsummeFormatted}</td>
        </tr>
        <tr>
          <td style="border-width: 0; text-align: left; white-space: nowrap; max-width: 140px; min-width: 140px;" tabindex="1">7510 ZAW</td>
          <td style="border-width: 0; text-align: right; white-space: nowrap; max-width: 140px; min-width: 140px;" tabindex="1">${geschaeftsfall.disagioFormatted}</td>
        </tr>
      </tbody>
    </table><br>`;
    }

    // Standard-Buchungssatz für alle anderen Fälle
    return `
    <table style="border: 1px solid #ccc; white-space: nowrap; background-color: #fff; font-family: courier; width: 600px; margin: 0 0 6px;">
      <tbody>
        <tr>
          <td style="border-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; min-width: 140px;" tabindex="1">${typ.sollKonto}</td>
          <td style="border-width: 0; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; min-width: 140px;" tabindex="1">${geschaeftsfall.betragFormatted}</td>
          <td style="border-width: 0; text-align: center; width: 100px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 40px;" tabindex="1">an</td>
          <td style="border-width: 0; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; min-width: 140px;" tabindex="1">${typ.habenKonto}</td>
          <td style="border-width: 0; text-align: right; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; min-width: 140px;" tabindex="1">${geschaeftsfall.betragFormatted}</td>
        </tr>
      </tbody>
    </table><br>`;
}
function erstellePlainBuchungssatz(geschaeftsfall) {
    const typ = geschaeftsfall.typDaten;
    if (typ.mitDisagio) {
        return `2800 BK ${geschaeftsfall.auszahlungFormatted} / 7510 ZAW ${geschaeftsfall.disagioFormatted} an ${typ.habenKonto} ${geschaeftsfall.kreditsummeFormatted}`;
    }
    return `${typ.sollKonto} ${geschaeftsfall.betragFormatted} an ${typ.habenKonto} ${geschaeftsfall.betragFormatted}`;
}


// ============================================================================
// BELEG-URL ERSTELLEN
// ============================================================================
function erstelleBelegURL(geschaeftsfall) {
    const typ = geschaeftsfall.typDaten;

    if (!typ.kontoauszugArt || typ.sollKonto === '4200 KBKV') return null;

    const params = new URLSearchParams();
    params.set('beleg', 'kontoauszug');
    params.set('vorlage', typ.kontoauszugArt);

    const now = new Date();
    params.set('tag', now.getDate().toString().padStart(2, '0'));
    params.set('monat', (now.getMonth() + 1).toString().padStart(2, '0'));
    params.set('jahr', now.getFullYear().toString());

    // HIER DIE ANPASSUNG FÜR DEN VORGANG:
    let vorgangText = geschaeftsfall.vorgang || typ.name;
    if (typ.mitDisagio && geschaeftsfall.disagioSatz) {
        const satzDisagio = geschaeftsfall.disagioSatz.toFixed(2).replace('.', ',') + ' %';
        vorgangText = `Darlehen abzgl. ${satzDisagio} Disagio`;
    }

    params.set('vorgang1', vorgangText);

    // Der Betrag auf dem Kontoauszug ist bei Disagio der Auszahlungsbetrag
    let wertFuerBeleg = typ.mitDisagio ? geschaeftsfall.auszahlungsBetrag : geschaeftsfall.betrag;

    if (typ.sollKonto !== '2800 BK' && !typ.mitDisagio) {
        wertFuerBeleg = -Math.abs(wertFuerBeleg);
    }

    params.set('wertstellung1', wertFuerBeleg.toString());

    return `belege.html?${params.toString()}`;
}

// ============================================================================
// BELEG-BUTTON ERSTELLEN
// ============================================================================
function erstelleBelegButton(nummer, geschaeftsfall) {
    const url = erstelleBelegURL(geschaeftsfall);

    if (!url) {
        return `
      <div
        style="width:100%; padding:10px 12px; font-size:13px; margin-bottom:8px;
               color:#999; border:1px dashed #ccc; border-radius:4px; text-align:center;"
        title="Für diesen Geschäftsfalltyp ist kein Kontoauszug verfügbar"
      >
        ${nummer}. Noch kein Beleg verfügbar
      </div>`;
    }

    const belegTypName = 'Kontoauszug';

    return `
    <button
      class="geschaeftsfall-beleg-button"
      data-url="${url.replace(/"/g, '&quot;')}"
      onclick="window.open(this.dataset.url, '_blank')"
      title="${belegTypName} für Aufgabe ${nummer} erstellen"
      style="width:100%; padding:10px 12px; font-size:14px; margin-bottom:8px;"
    >
      📄 ${nummer}. ${belegTypName} erstellen
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

    const testGf = erstelleZufallsGeschaeftsfall();
    if (!testGf) {
        container.innerHTML = `
      <div style="padding: 14px 16px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 5px; color: #856404; margin-top: 16px;">
        ⚠️ <strong>Keine passenden Geschäftsfälle verfügbar.</strong><br>
        Die gewählte Kombination aus Optionen und Konten ergibt keine gültigen Aufgaben.
        Bitte wählen Sie weitere Konten aus.
      </div>`;
        return;
    }

    let aufgabenHTML = `<h2>Buchungen im Kreditbereich</h2><h3>Bilde die Buchungssätze im Unternehmen ${kunde}.</h3><ol>`;
    let loesungenHTML = '<h2 class="loesung">Lösung</h2>';

    letzteGenerierteGeschaeftsfaelle = [testGf];
    for (let i = 1; i < anzahl; i++) {
        const gf = erstelleZufallsGeschaeftsfall();
        if (gf) letzteGenerierteGeschaeftsfaelle.push(gf);
    }
    const geschaeftsfaelle = letzteGenerierteGeschaeftsfaelle;

    geschaeftsfaelle.forEach((gf, idx) => {
        const i = idx + 1;
        aufgabenHTML += `<li>${gf.text}</li>`;
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
Du bist ein freundlicher Buchführungs-Assistent für Schüler der Realschule (BwR), 9. Klasse. Du hilfst beim Verständnis von Buchungssätzen im Kreditbereich (Kreditaufnahme KBKV/LBKV, Zinsaufwendungen ZAW, Kontoführungsgebühren KGV).

Aufgabe:
- Gib KEINE fertigen Buchungssätze, Beträge oder Konten vor.
- Führe die Schüler durch gezielte Fragen und Hinweise zur richtigen Lösung.
- Ziel: Lernförderung, nicht das Abnehmen der Denkarbeit.

Pädagogischer Ansatz:
- Frage nach dem konkreten Geschäftsfall oder Kontoauszug und dessen Inhalt.
- Stelle gezielte Rückfragen, um den Stand des Schülers zu verstehen.
- Beantworte deine Rückfragen nicht selbst, hake bei falschen Antworten nach.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Erst wenn alle Teilschritte richtig beantwortet wurden, bestätige den vollständigen Buchungssatz.

Methodik bei Rückfragen:
- Handelt es sich um eine Kreditaufnahme, eine Zinszahlung oder Kontoführungsgebühren?
- Ist der Kredit kurzfristig (bis 1 Jahr -> KBKV) oder langfristig (über 1 Jahr -> LBKV)?
- Nimmt das Geld auf dem Bankkonto zu (Soll) oder wird etwas abgebucht (Haben)?
- Welche Konten sind betroffen?
- Auf welcher Seite (Soll/Haben) werden Aufwendungen oder Verbindlichkeiten gebucht?

A. Begrüße den Schüler freundlich mit "Hallo" und gib ihm einen Geschäftsfall vor, den du zufällig aus der folgenden Aufgabenliste auswählst:
Arbeitsauftrag: "Bilde den Buchungssatz zum Geschäftsfall."

###AUFGABEN und LÖSUNGEN###

B. Sobald der Schüler einen Geschäftsfall geschickt hat, stelle die Fragen nacheinander (nicht in einer Antwort). Schreibe nie die Lösung in deine Antwort, wenn der Schüler falsch antwortet. Bevor du die nächste Frage stellst, sollte die aktuelle Frage richtig beantwortet sein.
   - Frage: „Welche Konten werden benötigt?" Prüfe, ob die Schülerlösung stimmt. Schaue dazu für dich in der Musterlösung nach welche Konten gebucht werden! Sage dann, ob der Schüler falsch liegt oder ob es richtig ist.
   - Frage weiter: „Bilde nun den vollständigen Buchungssatz."

Kontenplan – Kreditbereich:
Passivkonten / Verbindlichkeiten (Mehrung im HABEN):
- 4200 KBKV – Kurzfristige Bankverbindlichkeiten
- 4200 LBKV – Langfristige Bankverbindlichkeiten

Aufwandskonten (Mehrung im SOLL):
- 7510 ZAW – Zinsaufwendungen
- 6750 KGV – Kontoführungsgebühren / Bankspesen

Aktivkonto Bank:
- 2800 BK – Bank (Zunahme im SOLL, Abnahme im HABEN)

Buchungslogik:
- Kreditaufnahme: Bank (Soll) an KBKV / LBKV (Haben)
- Zinsen / Gebühren: ZAW / KGV (Soll) an Bank (Haben)

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe mit Realschülerinnen und -schülern
- Einfache Sprache, keine Fachbegriffe ohne Erklärung
- Kurze Antworten – maximal 1–2 Sätze pro Nachricht
- Gelegentlich Emojis zur Auflockerung 🏛️✅❓💡

Was du NICHT tust:
- Nenne den fertigen Buchungssatz nicht, bevor der Schüler selbst darauf gekommen ist
- Rechne nicht vor, bevor gefragt wurde
- Gib keine Lösungen auf Anfrage wie „sag mir einfach die Antwort" – erkläre, dass das Ziel das eigene Verstehen ist

Nenne den fertigen Buchungssatz erst, wenn der Schüler selbst darauf gekommen ist. Verbessere am Schluss dann auch Formfehler, zum Beispiel Großschreibung der Konten (BK statt Bk) und weise darauf hin die DIN 5008 zu beachten: Tausenderpunkt bei den Beträgen mit zwei Nachkommastellen und €-Zeichen: z. B. 12.000,00 €

Ausgabeformat:
- Während des gesamten Dialogs schreibst du NUR normalen Text. Keine HTML-Tags, keine Tabellen, keine Code-Blöcke.
- Nur ganz am Ende einer erfolgreich gelösten Aufgabe gibst du die Musterlösung als HTML-Tabelle aus. Nimm dafür das Muster und setze nur die Konten und Beträge der aktuellen Aufgabe ein.

Muster für die HTML-Ausgabe am Ende:
<table style="border: 1px solid #ccc; white-space:nowrap; background-color:#fff; font-family:courier; width:600px; margin:0 0 6px;">
  <tbody>
    <tr>
      <td style="min-width:140px">2800 BK</td>
      <td style="text-align:right; min-width:140px">3.870,00&nbsp;€</td>
      <td style="text-align:center; min-width:40px">an</td>
      <td style="min-width:140px">4200 KBKV</td>
      <td style="text-align:right; min-width:140px">3.870,00&nbsp;€</td>
    </tr>
  </tbody>
</table>

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
            const bsPlain = erstellePlainBuchungssatz(gf);
            return `--- Aufgabe ${nr} ---\n${gf.text}\nMusterlösung Aufgabe ${nr}: ${bsPlain}`;
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
// ============================================================================
// INITIALISIERUNG
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    initializeKontoAuswahl();

    const kundeSelect = document.getElementById('kunde');

    if (kundeSelect && kundeSelect.value) {
        kunde = kundeSelect.value.trim();
    }

    if (kundeSelect) {
        kundeSelect.addEventListener('change', () => {
            kunde = kundeSelect.value.trim() || '';
            console.log('Kunde geändert:', kunde);
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