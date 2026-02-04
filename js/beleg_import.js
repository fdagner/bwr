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
        
        // Extrahiere Daten
        const extractedData = extractBelegData(svgDoc, belegType);
        
        console.log('Extrahierte Daten:', extractedData);
        
        // Öffne entsprechenden Tab
        const tabName = TAB_MAPPING[belegType] || belegType;
        const tabOpened = openTabFromURL(tabName);
        
        if (!tabOpened) {
            updateBelegImportStatus(`Tab für ${belegType} konnte nicht geöffnet werden`, 'error');
            return;
        }
        
        // Warte kurz, bis Tab geladen ist
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Befülle Formular (async - wartet bis SVG geladen ist)
        await fillFormWithExtractedData(belegType, extractedData);
        
        updateBelegImportStatus(`✓ Beleg erfolgreich importiert (${belegType.toUpperCase()})`, 'success');
        
        // Scroll zum Tab
        document.querySelector('.tab').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Fehler beim Import:', error);
        updateBelegImportStatus(`Fehler: ${error.message}`, 'error');
    }
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
    
    // Hole alle text/tspan Elemente mit IDs
    const textElements = svgDoc.querySelectorAll('[id]');
    
    textElements.forEach(element => {
        const id = element.id;
        let textContent = element.textContent || '';
        
        // Bereinige Text
        textContent = textContent.trim();
        
        if (textContent && textContent !== '') {
            data[id] = textContent;
        }
    });
    
    // Hole auch Input-Werte (falls vorhanden)
    const inputElements = svgDoc.querySelectorAll('input[id]');
    inputElements.forEach(input => {
        if (input.value) {
            data[input.id] = input.value;
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
        return;
    }
    
    // WICHTIG: Zuerst SVG-Template laden, bevor Daten gesetzt werden
    const needsSVGLoad = ['rechnung', 'kontoauszug', 'email', 'quittung', 'kassenbon', 
                          'lohnjournal', 'bescheid', 'anlagenkarte', 'wertpapiere', 'lohnabrechnung'];
    
    if (needsSVGLoad.includes(belegType)) {
        console.log(`⏳ Lade SVG-Template für ${belegType}...`);
        
        // Lade SVG-Template
        if (typeof window.applySVGholen === 'function') {
            await window.applySVGholen();
            // Warte bis SVG geladen ist
            await new Promise(resolve => setTimeout(resolve, 800));
        }
    }
    
    let fieldsSet = 0;
    
    // Durchlaufe alle möglichen Felder für diesen Belegtyp
    for (const [paramName, paramConfig] of Object.entries(config)) {
        // Suche nach passenden Daten in extractedData
        const possibleKeys = [
            paramConfig.elementId,  // Direkte ID
            paramName,              // Parameter-Name
            // Konstruiere mögliche SVG-IDs (z.B. 'artikel1' für 'artikelInput')
            paramConfig.elementId.replace('Input', ''),
            paramConfig.elementId.replace('Input', '1'),
            belegType + paramName.charAt(0).toUpperCase() + paramName.slice(1)
        ];
        
        let valueFound = false;
        
        for (const key of possibleKeys) {
            if (extractedData[key] !== undefined && extractedData[key] !== '') {
                // Bereinige Wert vor dem Setzen (mit elementId für YAML-Suche)
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
            // Versuche auch direkte Matches in extractedData
            for (const [dataKey, dataValue] of Object.entries(extractedData)) {
                if (dataKey.toLowerCase().includes(paramName.toLowerCase()) ||
                    paramName.toLowerCase().includes(dataKey.toLowerCase())) {
                    // Bereinige Wert vor dem Setzen (mit elementId für YAML-Suche)
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
    
    // Trigger Apply-Funktion NACH dem SVG-Laden
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const applyFunction = APPLY_FUNCTIONS[belegType];
    if (applyFunction && typeof window[applyFunction] === 'function') {
        console.log(`Führe Apply-Funktion aus: ${applyFunction}`);
        try {
            window[applyFunction]();
            console.log(`✓ Apply-Funktion erfolgreich ausgeführt`);
        } catch (error) {
            console.warn(`⚠ Fehler in Apply-Funktion (kann ignoriert werden):`, error.message);
        }
    }
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