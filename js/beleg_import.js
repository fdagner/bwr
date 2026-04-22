// ============================================================================
// BELEG-IMPORT FUNKTIONALITÄT
// ============================================================================

/**
 * Erkennungsmuster für verschiedene Belegtypen
 * Basiert auf charakteristischen IDs im SVG (aus der svg id wie "rechnungSVG")
 */
const BELEG_SVG_ID_MAPPING = {
    'rechnungSVG': 'rechnung',
    'kontoauszugSVG': 'kontoauszug',
    'quittungSVG': 'quittung',
    'kassenbonSVG': 'kassenbon',
    'emailSVG': 'email',
    'lohnjournalSVG': 'lohnjournal',
    'bescheidSVG': 'bescheid',
    'anlagenkarteSVG': 'anlagenkarte',
    'wertpapiereSVG': 'wertpapiere',
    'lohnabrechnungSVG': 'lohnabrechnung',
    'angebotSVG': 'rechnung',  // Angebot nutzt Rechnung-Tab
    'gutschriftSVG': 'rechnung'  // Gutschrift nutzt Rechnung-Tab
};

/**
 * Zusätzliche Erkennungsmuster basierend auf Element-IDs
 */
const BELEG_DETECTION_PATTERNS = {
    rechnung: {
        ids: ['rechnungsDatum', 'rechnungsbetrag', 'liefererInformationen', 'zahlungsziel', 'pos1', 'artikel1'],
        texts: ['Rechnung', 'Zahlungsziel'],
        minMatches: 2
    },
    kontoauszug: {
        ids: ['kontoauszugNummer', 'kontoauszugKontostand_neu', 'kontoauszugVorgang1', 'kontoauszugIBAN'],
        texts: ['Kontoauszug', 'IBAN', 'Kontostand'],
        minMatches: 2
    },
    quittung: {
        ids: ['quittungNetto', 'quittungSumme', 'quittungZweck', 'quittungInWorten'],
        texts: ['Quittung', 'In Worten'],
        minMatches: 2
    },
    kassenbon: {
        ids: ['kassenbonBrutto', 'kassenbonTransaktionsnummer', 'kassenbonZahlungsart'],
        texts: ['Kassenbon', 'Transaktionsnummer'],
        minMatches: 2
    },
    lohnjournal: {
        ids: ['lohnjournalMonat', 'lohnjournalBrutto1', 'lohnjournalNetto1'],
        texts: ['Lohnjournal', 'Gehaltsjournal'],
        minMatches: 2
    },
    bescheid: {
        ids: ['bescheidAktenzeichen1', 'bescheidMessbetrag', 'bescheidJahressteuer'],
        texts: ['Bescheid', 'Aktenzeichen'],
        minMatches: 2
    },
    anlagenkarte: {
        ids: ['anlagenkarteBezeichnung', 'anlagenkarteAnschaffungskosten', 'anlagenkarteNutzungsdauer'],
        texts: ['Anlagenkarte', 'Nutzungsdauer'],
        minMatches: 2
    },
    wertpapiere: {
        ids: ['wertpapiereISIN', 'wertpapiereStueckkurs', 'wertpapiereKurswert'],
        texts: ['ISIN', 'Stückkurs'],
        minMatches: 2
    },
    lohnabrechnung: {
        ids: ['lohnabrechnungBrutto', 'lohnabrechnungNetto', 'lohnabrechnungSteuerklasse'],
        texts: ['Lohnabrechnung', 'Steuerklasse'],
        minMatches: 2
    }
};

/**
 * Hauptfunktion für Beleg-Import
 */
async function handleBelegImport() {
    const fileInput = document.getElementById('belegImportInput');
    
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        updateBelegImportStatus('Keine Datei ausgewählt', 'error');
        return;
    }
    
    const file = fileInput.files[0];
    
    // Prüfe Dateityp
    if (!file.name.toLowerCase().endsWith('.svg')) {
        updateBelegImportStatus('Bitte wählen Sie eine SVG-Datei aus', 'error');
        return;
    }
    
    try {
        updateBelegImportStatus('Datei wird gelesen...', 'info');
        
        // Lese Datei
        const svgContent = await readFileAsText(file);
        
        // Parse SVG
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
        
        // Prüfe auf Parser-Fehler
        const parserError = svgDoc.querySelector('parsererror');
        if (parserError) {
            throw new Error('SVG-Datei konnte nicht gelesen werden');
        }
        
        updateBelegImportStatus('Belegtyp wird erkannt...', 'info');
        
        // Erkenne Belegtyp
  const belegType = detectBelegType(svgDoc);

if (!belegType) {
    updateBelegImportStatus('Belegtyp konnte nicht erkannt werden', 'error');
    return;
}

updateBelegImportStatus(`${belegType.toUpperCase()} erkannt, Daten werden extrahiert...`, 'info');

const extractedData = extractBelegData(svgDoc, belegType);
window._lastImportData = extractedData;

console.log('Extrahierte Daten:', extractedData);

// tabName VOR showImportSummary berechnen
const tabName = TAB_MAPPING[belegType] || belegType;

showImportSummary(belegType, extractedData, tabName);
        
    } catch (error) {
        console.error('Fehler beim Import:', error);
        updateBelegImportStatus(`Fehler: ${error.message}`, 'error');
    }
}

function showImportSummary(belegType, extractedData, tabName) {
    const statusEl = document.getElementById('belegImportStatus');
    
    // Relevante Felder je Belegtyp für die Vorschau
    const SUMMARY_FIELDS = {
        rechnung:     ['nameLieferer', 'nameKunde', 'rechnungsDatum', 'aktuellesJahr', 'artikel1', 'rechnungsbetrag'],
        kontoauszug:  ['kontoauszugName', 'kontoauszugDatum', 'aktuellesJahrKontoauszug', 'kontoauszugNummer', 'kontoauszugKontostand_neu'],
        quittung:     ['quittungName', 'quittungTag', 'quittungMonat', 'quittungZweck', 'quittungSumme'],
        kassenbon:    ['kassenbonName', 'kassenbonTag', 'kassenbonMonat', 'kassenbonZweck'],
        anlagenkarte: ['anlagenkarteName', 'anlagenkarteTag', 'anlagenkarteMonat', 'anlagenkarteBezeichnung', 'anlagenkarteAnschaffungskosten'],
        wertpapiere:  ['wertpapiereName', 'wertpapiereTag', 'wertpapiereMonat', 'wertpapiereBezeichnung', 'wertpapiereISIN', 'wertpapiereStueckkurs'],
        bescheid:     ['bescheidName', 'bescheidTag', 'bescheidMonat', 'bescheidMessbetrag', 'bescheidJahressteuer'],
        lohnjournal:  ['lohnjournalName', 'lohnjournalMonat'],
        lohnabrechnung: ['lohnabrechnungFirmaName', 'lohnabrechnungMonat', 'lohnabrechnungBrutto', 'lohnabrechnungNetto'],
        email:        ['emailName', 'emailSubject']
    };

    // Lesbare Labels
    const FIELD_LABELS = {
        nameLieferer: 'Lieferer', nameKunde: 'Kunde',
        rechnungsDatum: 'Datum', aktuellesJahr: 'Jahr',
        aktuellesJahrKontoauszug: 'Jahr',
        artikel1: 'Artikel', rechnungsbetrag: 'Rechnungsbetrag',
        kontoauszugDatum: 'Datum', kontoauszugNummer: 'Auszug-Nr.',
        kontoauszugKontostand_neu: 'Neuer Kontostand',
        quittungTag: 'Tag', quittungMonat: 'Monat',
        quittungZweck: 'Zweck', quittungSumme: 'Summe',
        kassenbonTag: 'Tag', kassenbonMonat: 'Monat', kassenbonZweck: 'Artikel',
        anlagenkarteTag: 'Tag', anlagenkarteMonat: 'Monat',
        anlagenkarteBezeichnung: 'Bezeichnung', anlagenkarteAnschaffungskosten: 'Anschaffungskosten',
        wertpapiereTag: 'Tag', wertpapiereMonat: 'Monat',
        wertpapiereBezeichnung: 'Bezeichnung', wertpapiereISIN: 'ISIN', wertpapiereStueckkurs: 'Stückkurs',
        bescheidTag: 'Tag', bescheidMonat: 'Monat',
        bescheidMessbetrag: 'Messbetrag', bescheidJahressteuer: 'Jahressteuer',
        lohnjournalMonat: 'Monat', lohnabrechnungMonat: 'Monat',
        lohnabrechnungBrutto: 'Brutto', lohnabrechnungNetto: 'Netto',
        emailSubject: 'Betreff'
    };

    const BELEG_LABELS = {
        rechnung: 'Rechnung', kontoauszug: 'Kontoauszug', quittung: 'Quittung',
        kassenbon: 'Kassenbon', anlagenkarte: 'Anlagenkarte', wertpapiere: 'Wertpapiere',
        bescheid: 'Bescheid', lohnjournal: 'Lohnjournal', lohnabrechnung: 'Lohnabrechnung', email: 'E-Mail'
    };

    // Baue Tabelle der erkannten Felder
    const fields = SUMMARY_FIELDS[belegType] || [];
    let rows = '';
    let foundCount = 0;

    fields.forEach(key => {
        const val = extractedData[key];
        if (val && val.trim() !== '') {
            const label = FIELD_LABELS[key] || key;
            rows += `<tr>
                <td style="padding:3px 10px 3px 0;color:#555;font-size:13px;">${label}</td>
                <td style="padding:3px 0;font-size:13px;font-weight:bold;">${val}</td>
            </tr>`;
            foundCount++;
        }
    });

    if (rows === '') {
        rows = `<tr><td colspan="2" style="color:#888;font-size:13px;">Keine Vorschaudaten verfügbar</td></tr>`;
    }

    const belegLabel = BELEG_LABELS[belegType] || belegType;

    statusEl.style.backgroundColor = '#e8f5e9';
  statusEl.innerHTML = `
    <div style="margin-bottom:8px;">
        <strong>✓ ${belegLabel} erfolgreich erkannt</strong> 
    </div>
    <table style="border-collapse:collapse;margin-bottom:10px;">
        ${rows}
    </table>
    <button onclick="jumpToBeleg('${belegType}', '${tabName}')" 
            style="background:#4caf50;color:#fff;border:none;padding:7px 18px;border-radius:4px;cursor:pointer;font-size:14px;">
        → Zum ${belegLabel} springen und Felder übernehmen
    </button>
`;
}

async function jumpToBeleg(belegType, tabName) {
    const tabOpened = openTabFromURL(tabName);
    if (!tabOpened) return;

    await new Promise(resolve => setTimeout(resolve, 500));
    const fieldsSet = await fillFormWithExtractedData(belegType, window._lastImportData);
    
    // Status aktualisieren
    updateBelegImportStatus(`✓ ${fieldsSet} Felder importiert`, 'success');
    
    document.querySelector('.tab').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Erkenne Belegtyp anhand der SVG-ID und fallback auf Pattern-Matching
 */
function detectBelegType(svgDoc) {
    // 1. Versuche anhand der SVG root ID
    const svgRoot = svgDoc.querySelector('svg');
    if (svgRoot && svgRoot.id) {
        const mappedType = BELEG_SVG_ID_MAPPING[svgRoot.id];
        if (mappedType) {
            console.log(`Belegtyp erkannt via SVG-ID: ${mappedType}`);
            return mappedType;
        }
    }
    
    // 2. Fallback: Pattern-basierte Erkennung
    let bestMatch = null;
    let bestScore = 0;
    
    for (const [belegType, pattern] of Object.entries(BELEG_DETECTION_PATTERNS)) {
        let score = 0;
        
        // Zähle gefundene IDs
        for (const id of pattern.ids) {
            const element = svgDoc.getElementById(id);
            if (element) {
                score++;
            }
        }
        
        // Zähle gefundene Texte
        const allText = svgDoc.documentElement.textContent || '';
        for (const text of pattern.texts) {
            if (allText.includes(text)) {
                score++;
            }
        }
        
        // Prüfe ob genug Matches
        if (score >= pattern.minMatches && score > bestScore) {
            bestScore = score;
            bestMatch = belegType;
        }
    }
    
    if (bestMatch) {
        console.log(`Belegtyp erkannt via Pattern-Matching: ${bestMatch} (Score: ${bestScore})`);
    }
    
    return bestMatch;
}

/**
 * Extrahiere Daten aus dem SVG-Dokument
 */
function extractBelegData(svgDoc, belegType) {
    const data = {};
    
    const textElements = svgDoc.querySelectorAll('[id]');
    textElements.forEach(element => {
        const id = element.id;
        let textContent = element.textContent?.trim() || '';
        
        // Überspringen wenn leer
        if (textContent === '') return;

        // Überspringen wenn identisch mit Placeholder des Ziel-Inputs
        const targetInput = document.getElementById(id + 'Input') || document.getElementById(id);
        if (targetInput && targetInput.placeholder && targetInput.placeholder === textContent) return;

        data[id] = textContent;
    });
    
    // Menge und Einheit aus kombiniertem SVG-Text trennen (z.B. "100 Stück" → menge + einheit)
if (data['menge1']) {
    const mengeMatch = data['menge1'].match(/^([\d\s]+(?:\.\d+)?)\s*(.*)$/);
    if (mengeMatch) {
        // Zahl: Leerzeichen (Tausendertrenner) entfernen, dann normalisieren
        data['_mengeRaw'] = mengeMatch[1].replace(/\s/g, '');
        data['_einheitRaw'] = mengeMatch[2].trim();
    }
}
if (data['menge2']) {
    const mengeMatch2 = data['menge2'].match(/^([\d\s]+(?:\.\d+)?)\s*(.*)$/);
    if (mengeMatch2) {
        data['_menge2Raw'] = mengeMatch2[1].replace(/\s/g, '');
        data['_einheit2Raw'] = mengeMatch2[2].trim();
    }
}
    // Input-Werte
    const inputElements = svgDoc.querySelectorAll('input[id]');
    inputElements.forEach(input => {
        if (input.value) {
            data[input.id] = input.value;
        }
    });

    const classFields = [
        // Rechnung / Kontoauszug
        { class: 'rechnungsDatum',            key: 'rechnungsDatum' },
        { class: 'aktuellesJahr',             key: 'aktuellesJahr' },
        { class: 'kontoauszugDatum',          key: 'kontoauszugDatum' },
        { class: 'aktuellesJahrKontoauszug',  key: 'aktuellesJahrKontoauszug' },
        // Quittung
        { class: 'aktuellesJahrQuittung',     key: 'aktuellesJahrQuittung' },
        // Kassenbon
        { class: 'aktuellesJahrKassenbon',    key: 'aktuellesJahrKassenbon' },
        { class: 'kassenbonBrutto',           key: 'kassenbonBrutto' },
        // Anlagenkarte
        { class: 'aktuellesJahrAnlagenkarte', key: 'aktuellesJahrAnlagenkarte' },
        // Wertpapiere
        { class: 'aktuellesJahrWertpapiere',  key: 'aktuellesJahrWertpapiere' },
        // Bescheid
        { class: 'aktuellesJahrBescheid',     key: 'aktuellesJahrBescheid' },
        { class: 'bescheidOrt',               key: 'bescheidOrt' },
        { class: 'bescheidStrasse',           key: 'bescheidStrasse' },
        { class: 'bescheidOrtInhaber',        key: 'bescheidOrtInhaber' },
        // Lohnabrechnung
        { class: 'aktuellesJahrLohnabrechnung', key: 'aktuellesJahrLohnabrechnung' },
    ];

    classFields.forEach(({ class: cls, key }) => {
        const el = svgDoc.querySelector('.' + cls);
        if (el) {
            const text = el.textContent?.trim() || '';
            if (text !== '') {
                data[key] = text;
            }
        }
    });

    return data;
}
/**
 * Finde Unternehmen im YAML anhand von Name, Adresse oder anderen Merkmalen
 */
function findCompanyInYaml(searchText) {
    if (!searchText || !yamlData || yamlData.length === 0) {
        return null;
    }
    
    // Bereinige Suchtext (entferne Zeilenumbrüche und extra Leerzeichen)
    searchText = searchText.replace(/\n/g, ' ').replace(/\s+/g, ' ').toLowerCase().trim();
    
    // Extrahiere wichtige Tokens aus dem Suchtext
    const searchTokens = searchText.split(' ').filter(token => token.length > 2);
    
    let bestMatch = null;
    let bestScore = 0;
    
    // Durchsuche alle Unternehmen
    for (const company of yamlData) {
        const u = company.unternehmen;
        if (!u) continue;
        
        let score = 0;
        
        // Sammle alle vergleichbaren Felder
        const compareFields = [
            u.name,
            u.rechtsform,
            `${u.name} ${u.rechtsform}`,
            u.adresse?.strasse,
            u.adresse?.ort,
            u.adresse?.plz,
            `${u.adresse?.plz} ${u.adresse?.ort}`,
            u.inhaber
        ];
        
        // Erstelle kombinierten String aus allen Feldern
        const companyText = compareFields
            .filter(f => f)
            .join(' ')
            .toLowerCase()
            .replace(/\s+/g, ' ');
        
        // Score 1: Exakter Name-Match
        if (u.name && searchText.includes(u.name.toLowerCase())) {
            score += 10;
        }
        
        // Score 2: Rechtsform-Match
        if (u.rechtsform && searchText.includes(u.rechtsform.toLowerCase())) {
            score += 5;
        }
        
        // Score 3: Token-Matching
        for (const token of searchTokens) {
            if (companyText.includes(token)) {
                score += 1;
            }
        }
        
        // Score 4: Adresse-Match
        if (u.adresse?.strasse && searchText.includes(u.adresse.strasse.toLowerCase())) {
            score += 8;
        }
        
        if (u.adresse?.ort && searchText.includes(u.adresse.ort.toLowerCase())) {
            score += 6;
        }
        
        // Score 5: PLZ-Match
        if (u.adresse?.plz && searchText.includes(String(u.adresse.plz))) {
            score += 4;
        }
        
        // Prüfe ob dieser Match besser ist
        if (score > bestScore && score >= 5) { // Mindestens Score 5 erforderlich
            bestScore = score;
            bestMatch = u.name;
        }
    }
    
    if (bestMatch) {
        console.log(`✓ Unternehmen gefunden: ${bestMatch} (Score: ${bestScore})`);
        return bestMatch;
    }
    
    console.warn(`⚠ Kein Unternehmen gefunden für: "${searchText.substring(0, 50)}..."`);
    return null;
}

/**
 * Bereinige extrahierte Werte für Formular-Eingabe
 */
function cleanValueForInput(value, fieldType, elementId) {
    if (!value || value === '') return value;
    
    // String zu String konvertieren
    value = String(value).trim();
    
    // Für Dropdown-Felder (Unternehmensauswahl): Suche im YAML
    if (fieldType === 'select' && (
        elementId.includes('daten') || 
        elementId.includes('Lieferer') || 
        elementId.includes('Kunde') ||
        elementId.includes('kontoinhaber') ||
        elementId.includes('empfaenger')
    )) {
        const foundCompany = findCompanyInYaml(value);
        if (foundCompany) {
            return foundCompany;
        }
        // Falls nicht gefunden, gebe Original zurück
        return value;
    }
    
    // Für Zahlenfelder: Entferne Formatierung
    if (fieldType === 'input' || fieldType === 'number') {
        // Entferne Währungssymbole
        value = value.replace(/€/g, '').trim();
        
        // Entferne Einheiten (Stück, kg, etc.) - aber nur am Ende
        value = value.replace(/\s+(Stück|stück|kg|g|m|cm|l|ml)$/i, '').trim();
        
        // Deutsche Zahlenformatierung: 1.400,00 → 1400.00
        if (value.includes(',')) {
            value = value.replace(/\./g, ''); // Entferne Tausenderpunkte
            value = value.replace(/,/g, '.'); // Ersetze Komma durch Punkt
        }
        
        // Versuche zu einer Zahl zu konvertieren
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            return String(numValue);
        }
    }
    
    return value;
}

/**
 * Befülle das Formular mit den extrahierten Daten
 */
async function fillFormWithExtractedData(belegType, extractedData) {
    const config = URL_PARAM_CONFIG[belegType];
    if (!config) {
        console.warn(`Keine Konfiguration für ${belegType} gefunden`);
        return 0;
    }
    
    // WICHTIG: Zuerst SVG-Template laden, bevor Daten gesetzt werden
    const needsSVGLoad = ['rechnung', 'kontoauszug', 'email', 'quittung', 'kassenbon', 
                          'lohnjournal', 'bescheid', 'anlagenkarte', 'wertpapiere', 'lohnabrechnung'];
    
    if (needsSVGLoad.includes(belegType)) {
        console.log(`⏳ Lade SVG-Template für ${belegType}...`);
        if (typeof window.applySVGholen === 'function') {
            await window.applySVGholen();
            await new Promise(resolve => setTimeout(resolve, 800));
        }
    }
    
    // Datum-Felder direkt setzen (da sie über Klassen kommen, nicht IDs)
    const datumMappings = {
        rechnung: {
            raw:   'rechnungsDatum',
            jahr:  'aktuellesJahr',
            tagId: 'tag', monatId: 'monat', jahrId: 'jahr'
        },
        kontoauszug: {
            raw:   'kontoauszugDatum',
            jahr:  'aktuellesJahrKontoauszug',
            tagId: 'tagKontoauszug', monatId: 'monatKontoauszug', jahrId: 'jahrKontoauszug'
        },
        quittung: {
            tagId: 'tagQuittung',    tagKey: 'quittungTag',
            monatId: 'monatQuittung', monatKey: 'quittungMonat',
            jahrId: 'jahrQuittung',  jahrKey: 'aktuellesJahrQuittung'
        },
        kassenbon: {
            tagId: 'tagKassenbon',    tagKey: 'kassenbonTag',
            monatId: 'monatKassenbon', monatKey: 'kassenbonMonat',
            jahrId: 'jahrKassenbon',  jahrKey: 'aktuellesJahrKassenbon'
        },
        anlagenkarte: {
            tagId: 'tagAnlagenkarte',    tagKey: 'anlagenkarteTag',
            monatId: 'monatAnlagenkarte', monatKey: 'anlagenkarteMonat',
            jahrId: 'jahrAnlagenkarte',  jahrKey: 'aktuellesJahrAnlagenkarte'
        },
        wertpapiere: {
            tagId: 'tagWertpapiereInput',    tagKey: 'wertpapiereTag',
            monatId: 'monatWertpapiereInput', monatKey: 'wertpapiereMonat',
            jahrId: 'jahrWertpapiere',        jahrKey: 'aktuellesJahrWertpapiere'
        },
        bescheid: {
            tagId: 'tagBescheid',    tagKey: 'bescheidTag',
            monatId: 'monatBescheid', monatKey: 'bescheidMonat',
            jahrId: 'jahrBescheid',  jahrKey: 'aktuellesJahrBescheid'
        }
    };

    const dm = datumMappings[belegType];
    if (dm) {
        if (dm.raw && extractedData[dm.raw]) {
            const parts = extractedData[dm.raw].split('.');
            if (parts.length >= 2) {
                const tag   = parts[0].padStart(2, '0');
                const monat = parts[1].padStart(2, '0');
                setFieldValue(dm.tagId,   tag,   'select');
                setFieldValue(dm.monatId, monat, 'select');
            }
        } else if (dm.tagKey && extractedData[dm.tagKey]) {
            setFieldValue(dm.tagId,   extractedData[dm.tagKey],   'select');
            setFieldValue(dm.monatId, extractedData[dm.monatKey], 'select');
        }
        // Jahr
        if (dm.jahrKey && extractedData[dm.jahrKey]) {
            setFieldValue(dm.jahrId, extractedData[dm.jahrKey], 'input');
        } else if (dm.jahr && extractedData[dm.jahr]) {
            setFieldValue(dm.jahrId, extractedData[dm.jahr], 'input');
        }
    }

    let fieldsSet = 0;

    // Explizites Direkt-Mapping für Rechnung
    // (Felder die durch possibleKeys/fuzzy nicht zuverlässig gefunden werden)
    if (belegType === 'rechnung') {
        const direktMapping = {
            'artikelInput':      extractedData['artikel1'],
            'artikelInput2':     extractedData['artikel2'],
            'mengeInput':        extractedData['_mengeRaw'],
            'einheitInput':      extractedData['_einheitRaw'],
            'mengeInput2':       extractedData['_menge2Raw'],
            'einheitInput2':     extractedData['_einheit2Raw'],
            'einzelpreisInput':  extractedData['einzelpreis1']
                ? extractedData['einzelpreis1'].replace(/[€\s]/g, '').replace(',', '.')
                : undefined,
            'einzelpreisInput2': extractedData['einzelpreis2']
                ? extractedData['einzelpreis2'].replace(/[€\s]/g, '').replace(',', '.')
                : undefined,
        };
        for (const [inputId, val] of Object.entries(direktMapping)) {
            if (val !== undefined && val !== '') {
                const el = document.getElementById(inputId);
                if (el) {
                    el.value = val;
                    fieldsSet++;
                    console.log(`✓ Direkt-Mapping: ${inputId} = ${val}`);
                }
            }
        }
    }

    // Durchlaufe alle möglichen Felder für diesen Belegtyp
    for (const [paramName, paramConfig] of Object.entries(config)) {
        const possibleKeys = [
            paramConfig.elementId,
            paramName,
            paramConfig.elementId.replace('Input', ''),
            paramConfig.elementId.replace('Input', '1'),
            belegType + paramName.charAt(0).toUpperCase() + paramName.slice(1)
        ];
        
        let valueFound = false;
        
        for (const key of possibleKeys) {
            if (extractedData[key] !== undefined && extractedData[key] !== '') {
                let cleanedValue = cleanValueForInput(extractedData[key], paramConfig.type, paramConfig.elementId);
                const success = setFieldValue(paramConfig.elementId, cleanedValue, paramConfig.type);
                if (success) {
                    fieldsSet++;
                    valueFound = true;
                    console.log(`✓ Setze ${paramConfig.elementId} = ${cleanedValue}`);
                    break;
                }
            }
        }
        
        if (!valueFound) {
            for (const [dataKey, dataValue] of Object.entries(extractedData)) {
                // Jahr-Felder NIEMALS fuzzy matchen
                if (paramConfig.elementId.startsWith('jahr')) continue;

                const keyLower   = dataKey.toLowerCase();
                const paramLower = paramName.toLowerCase();

                if (keyLower.includes(paramLower) || paramLower.includes(keyLower)) {
                    let cleanedValue = cleanValueForInput(dataValue, paramConfig.type, paramConfig.elementId);
                    const success = setFieldValue(paramConfig.elementId, cleanedValue, paramConfig.type);
                    if (success) {
                        fieldsSet++;
                        console.log(`✓ Setze ${paramConfig.elementId} = ${cleanedValue} (fuzzy match)`);
                        break;
                    }
                }
            }
        }
    }
    
    console.log(`${fieldsSet} Felder wurden befüllt`);
    return fieldsSet;
}
/**
 * Hilfsfunktion: Lese Datei als Text
 */
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            resolve(e.target.result);
        };
        
        reader.onerror = (e) => {
            reject(new Error('Fehler beim Lesen der Datei'));
        };
        
        reader.readAsText(file);
    });
}

/**
 * Aktualisiere den Import-Status
 */
function updateBelegImportStatus(message, type = 'info') {
    const statusElement = document.getElementById('belegImportStatus');
    if (!statusElement) return;
    
    statusElement.textContent = message;
    
    // Setze Hintergrundfarbe basierend auf Typ
    const colors = {
        'info': '#e3f2fd',
        'success': '#e8f5e9',
        'error': '#ffebee',
        'warning': '#fff3e0'
    };
    
    statusElement.style.backgroundColor = colors[type] || colors.info;
    
    // Log in Konsole
    const logFn = type === 'error' ? console.error : console.log;
    logFn(`[Beleg-Import] ${message}`);
}

// Export für Module (falls verwendet)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleBelegImport,
        detectBelegType,
        extractBelegData,
        fillFormWithExtractedData
    };
}