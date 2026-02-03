// ============================================================================
// URL-PARAMETER KONFIGURATION
// ============================================================================

/**
 * Zentrale Konfiguration für URL-Parameter aller Belege
 * Struktur: 
 * - key: Parameter-Name in der URL
 * - elementId: ID des Input-Elements im HTML
 * - type: 'input' oder 'select' (für verschiedene Setzmethoden)
 */

const URL_PARAM_CONFIG = {
    // ========== RECHNUNG/ANGEBOT/GUTSCHRIFT ==========
    rechnung: {
        // Artikel 1
        artikel1: { elementId: 'artikelInput', type: 'input' },
        menge1: { elementId: 'mengeInput', type: 'input' },
        einheit1: { elementId: 'einheitInput', type: 'input' },
        einzelpreis1: { elementId: 'einzelpreisInput', type: 'input' },
        
        // Artikel 2
        artikel2: { elementId: 'artikelInput2', type: 'input' },
        menge2: { elementId: 'mengeInput2', type: 'input' },
        einheit2: { elementId: 'einheitInput2', type: 'input' },
        einzelpreis2: { elementId: 'einzelpreisInput2', type: 'input' },
        
        // Rabatt & Bezugskosten
        rabatt: { elementId: 'rabattInput', type: 'input' },
        bezugskosten: { elementId: 'bezugskostenInput', type: 'input' },
        bezugskostenart: { elementId: 'bezugskostenArtInput', type: 'input' },
        
        // Steuer & Zahlung
        umsatzsteuer: { elementId: 'umsatzsteuerInput', type: 'input', default: '19' },
        zahlungsziel: { elementId: 'zahlungszielInput', type: 'input', default: '30' },
        skonto: { elementId: 'skontoInput', type: 'input', default: '2' },
        skontofrist: { elementId: 'skontofristInput', type: 'input', default: '20' },
        
        // Sonstige
        lieferzeit: { elementId: 'angebotLieferzeitInput', type: 'input' },
        vorlage: { elementId: 'svgDropdown', type: 'select' },
        
        // Datum
        tag: { elementId: 'tag', type: 'select' },
        monat: { elementId: 'monat', type: 'select' },
        jahr: { elementId: 'jahr', type: 'input' },
        
        // Farbe
        farbe: { elementId: 'colorPicker', type: 'input' },
        
        // Unternehmen
        lieferer: { elementId: 'datenLieferer', type: 'select' },
        kunde: { elementId: 'datenKunde', type: 'select' }
    },
    
    // ========== KONTOAUSZUG ==========
    kontoauszug: {
        // Vorgänge
        vorgang1: { elementId: 'kontoauszugVorgang1Input', type: 'input' },
        wertstellung1: { elementId: 'kontoauszugWertstellung1Input', type: 'input' },
        vorgang2: { elementId: 'kontoauszugVorgang2Input', type: 'input' },
        wertstellung2: { elementId: 'kontoauszugWertstellung2Input', type: 'input' },
        vorgang3: { elementId: 'kontoauszugVorgang3Input', type: 'input' },
        wertstellung3: { elementId: 'kontoauszugWertstellung3Input', type: 'input' },
        
        // Beleg-Daten
        nummer: { elementId: 'kontoauszugNummerInput', type: 'input' },
        kontostand_alt: { elementId: 'kontoauszugKontostand_altInput', type: 'input' },
        
        // Datum
        tag: { elementId: 'tagKontoauszug', type: 'select' },
        monat: { elementId: 'monatKontoauszug', type: 'select' },
        jahr: { elementId: 'jahrKontoauszug', type: 'input' },
        
        // Vorlage
        vorlage: { elementId: 'svgDropdownKontoauszug', type: 'select' },
        
        // Unternehmen
        kontoinhaber: { elementId: 'datenKontoauszug', type: 'select' }
    },
    
    // ========== QUITTUNG ==========
    quittung: {
        // Beträge
        netto: { elementId: 'quittungNettoInput', type: 'input' },
        ust: { elementId: 'quittungUSTInput', type: 'input', default: '19' },
        
        // Weitere Daten
        zweck: { elementId: 'quittungZweckInput', type: 'input' },
        
        // Datum
        tag: { elementId: 'tagQuittung', type: 'select' },
        monat: { elementId: 'monatQuittung', type: 'select' },
        jahr: { elementId: 'jahrQuittung', type: 'input' },
        
        // Vorlage
        vorlage: { elementId: 'svgDropdownQuittung', type: 'select' },
        
        // Unternehmen
        empfaenger: { elementId: 'datenQuittung', type: 'select' },
        kunde: { elementId: 'datenQuittungKunde', type: 'select' }
    },
    
    // ========== KASSENBON ==========
    kassenbon: {
        // Beträge
        netto: { elementId: 'kassenbonNettoInput', type: 'input' },
        ust: { elementId: 'kassenbonUSTInput', type: 'input', default: '19' },
        
        // Weitere Daten
        bezeichnung: { elementId: 'kassenbonZweckInput', type: 'input' },
        zahlungsart: { elementId: 'kassenbonDropdownZahlungsart', type: 'select' },
        
        // Datum
        tag: { elementId: 'tagKassenbon', type: 'select' },
        monat: { elementId: 'monatKassenbon', type: 'select' },
        jahr: { elementId: 'jahrKassenbon', type: 'input' },
        
        // Vorlage
        vorlage: { elementId: 'svgDropdownKassenbon', type: 'select' },
        
        // Unternehmen
        empfaenger: { elementId: 'datenKassenbon', type: 'select' },
        kunde: { elementId: 'datenKassenbonKunde', type: 'select' }
    },
    
    // ========== EMAIL ==========
    email: {
        betreff: { elementId: 'emailSubjectInput', type: 'input' },
        text: { elementId: 'emailInputText', type: 'textarea' },
        
        // Vorlage
        vorlage: { elementId: 'svgDropdownEmail', type: 'select' },
        
        // Unternehmen
        absender: { elementId: 'datenEmail', type: 'select' },
        empfaenger: { elementId: 'datenEmailKunde', type: 'select' }
    },
    
    // ========== ZEITUNGSARTIKEL ==========
    newspaper: {
        ueberschrift: { elementId: 'newspaperHeadlineInput', type: 'input' },
        text: { elementId: 'newspaperTextInput', type: 'textarea' },
        quelle: { elementId: 'newspaperSourceInput', type: 'input' },
        farbe: { elementId: 'newspaperColorInput', type: 'input' },
        spalten: { elementId: 'newspaperColumnRange', type: 'input' }
    },
    
    // ========== LOHNABRECHNUNG ==========
    lohnabrechnung: {
        monat: { elementId: 'lohnabrechnungMonatInput', type: 'select' },
        brutto: { elementId: 'lohnabrechnungBruttoInput', type: 'input' },
        steuerklasse: { elementId: 'lohnabrechnungSteuerklasseInput', type: 'select' },
        kinderfreibetrag: { elementId: 'lohnabrechnungKinderfreibetragInput', type: 'select' },
        kvsatz: { elementId: 'lohnabrechnungKVSatzInput', type: 'input' },
        pvsatz: { elementId: 'lohnabrechnungPVSatzInput', type: 'input' },
        rvsatz: { elementId: 'lohnabrechnungRVSatzInput', type: 'input' },
        alvsatz: { elementId: 'lohnabrechnungALVSatzInput', type: 'input' },
        
        // Vorlage
        vorlage: { elementId: 'svgDropdownLohnabrechnung', type: 'select' },
        
        // Unternehmen
        unternehmen: { elementId: 'datenLohnabrechnung', type: 'select' }
    },
    
    // ========== LOHNJOURNAL ==========
    lohnjournal: {
        vorlage: { elementId: 'svgDropdownLohnjournal', type: 'select' },
        unternehmen: { elementId: 'datenLohnjournal', type: 'select' }
    },
    
    // ========== BESCHEID ==========
    bescheid: {
        // Grundsteuer
        messbetrag: { elementId: 'bescheidMessbetragInput', type: 'input' },
        hebesatz: { elementId: 'bescheidHebesatzInput', type: 'input' },
        
        // Abfall
        abfallgebuehr: { elementId: 'bescheidAbfallgebuehrInput', type: 'input' },
        abfallbezeichnung: { elementId: 'bescheidAbfallbezeichnungInput', type: 'input' },
        
        // Datum
        tag: { elementId: 'tagBescheid', type: 'select' },
        monat: { elementId: 'monatBescheid', type: 'select' },
        jahr: { elementId: 'jahrBescheid', type: 'input' },
        
        // Vorlage
        vorlage: { elementId: 'svgDropdownBescheid', type: 'select' },
        
        // Unternehmen
        unternehmen: { elementId: 'datenBescheid', type: 'select' }
    },
    
    // ========== ANLAGENKARTE ==========
    anlagenkarte: {
        bezeichnung: { elementId: 'anlagenkarteBezeichnungInput', type: 'input' },
        anlagenkonto: { elementId: 'anlagenkarteAnlagenkontoInput', type: 'input' },
        anschaffungskosten: { elementId: 'anlagenkarteAnschaffungskostenInput', type: 'input' },
        nutzungsdauer: { elementId: 'anlagenkarteNutzungsdauerInput', type: 'input' },
        
        // Datum
        tag: { elementId: 'tagAnlagenkarte', type: 'select' },
        monat: { elementId: 'monatAnlagenkarte', type: 'select' },
        jahr: { elementId: 'jahrAnlagenkarte', type: 'input' },
        
        // Vorlage
        vorlage: { elementId: 'svgDropdownAnlagenkarte', type: 'select' },
        
        // Unternehmen
        unternehmen: { elementId: 'datenAnlagenkarte', type: 'select' }
    },
    
    // ========== WERTPAPIERE ==========
    wertpapiere: {
        art: { elementId: 'wertpapiereArtInput', type: 'select' },
        bezeichnung: { elementId: 'wertpapiereBezeichnungInput', type: 'input' },
        isin: { elementId: 'wertpapiereISINInput', type: 'input' },
        stueckkurs: { elementId: 'wertpapiereStueckkursInput', type: 'input' },
        anzahl: { elementId: 'wertpapiereAnzahlInput', type: 'input' },
        
        // Datum
        tag: { elementId: 'tagWertpapiereInput', type: 'select' },
        monat: { elementId: 'monatWertpapiereInput', type: 'select' },
        jahr: { elementId: 'jahrWertpapiere', type: 'input' },
        
        // Vorlage
        vorlage: { elementId: 'svgDropdownWertpapiere', type: 'select' },
        
        // Unternehmen
        unternehmen: { elementId: 'datenWertpapiere', type: 'select' }
    }
};

// ============================================================================
// TAB-MAPPING
// ============================================================================

/**
 * Mapping von URL-Parametern zu Tab-IDs
 * Unterstützt mehrere Schreibweisen für denselben Beleg
 */
const TAB_MAPPING = {
    'rechnung': 'rechnung',
    'angebot': 'rechnung',
    'gutschrift': 'rechnung',
    'rechnung/angebot/gutschrift': 'rechnung',
    'kontoauszug': 'kontoauszug',
    'quittung': 'quittung',
    'kassenbon': 'kassenbon',
    'kassenbuch': 'kassenbon',
    'email': 'email',
    'mail': 'email',
    'zeitungsartikel': 'newspaper',
    'zeitung': 'newspaper',
    'artikel': 'newspaper',
    'lohnabrechnung': 'lohnabrechnung',
    'gehaltsabrechnung': 'lohnabrechnung',
    'lohnjournal': 'lohnjournal',
    'bescheid': 'bescheid',
    'anlagenkarte': 'anlagenkarte',
    'wertpapiere': 'wertpapiere',
    'modellunternehmen': 'modellunternehmen'
};

// ============================================================================
// APPLY-FUNKTIONEN MAPPING
// ============================================================================

/**
 * Mapping von Beleg-Typen zu ihren Apply-Funktionen
 */
const APPLY_FUNCTIONS = {
    'rechnung': 'applyOrderData',
    'kontoauszug': 'applyOrderData',
    'quittung': 'quittungApplySVGholen',
    'kassenbon': 'kassenbonApplySVGholen',
    'email': 'applyOrderData',
    'newspaper': null, // Verwendet speziellen Button
    'lohnabrechnung': 'lohnabrechnungApplySVGholen',
    'lohnjournal': 'journalApplySVGholen',
    'bescheid': 'bescheidApplySVGholen',
    'anlagenkarte': 'anlagenkarteApplySVGholen',
    'wertpapiere': 'wertpapiereApplySVGholen'
};

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================

/**
 * Sicher ein Element per ID holen und setzen
 * Gibt false zurück wenn Element nicht existiert (statt Error zu werfen)
 */
function safeSetElement(elementId, value, property = 'textContent') {
    const element = document.getElementById(elementId);
    if (!element) {
        console.warn(`⚠️ Element nicht gefunden: ${elementId}`);
        return false;
    }
    
    try {
        element[property] = value;
        return true;
    } catch (error) {
        console.error(`✗ Fehler beim Setzen von ${elementId}:`, error);
        return false;
    }
}

/**
 * Prüft ob alle erforderlichen Elemente für einen Beleg existieren
 */
function checkRequiredElements(elementIds) {
    const missing = [];
    for (const id of elementIds) {
        if (!document.getElementById(id)) {
            missing.push(id);
        }
    }
    
    if (missing.length > 0) {
        console.warn(`⚠️ Fehlende Elemente:`, missing);
        return false;
    }
    
    return true;
}

// ============================================================================
// HAUPTFUNKTIONEN
// ============================================================================

/**
 * Setzt einen einzelnen Wert in ein Formularfeld
 */
function setFieldValue(elementId, value, type) {
    const element = document.getElementById(elementId);
    if (!element) return false;
    
    switch(type) {
        case 'input':
        case 'select':
            element.value = value;
            break;
        case 'textarea':
            element.value = value;
            break;
        case 'checkbox':
            element.checked = value === 'true' || value === '1';
            break;
        default:
            element.value = value;
    }
    
    return true;
}

/**
 * Lädt URL-Parameter für einen spezifischen Beleg-Typ
 */
function loadURLParametersForBeleg(belegType, params) {
    const config = URL_PARAM_CONFIG[belegType];
    if (!config) return;
    
    let setCount = 0;
    
    // Durchlaufe alle Parameter für diesen Beleg
    for (const [paramName, paramConfig] of Object.entries(config)) {
        if (params.has(paramName)) {
            const value = params.get(paramName);
            if (setFieldValue(paramConfig.elementId, value, paramConfig.type)) {
                setCount++;
            }
        } else if (paramConfig.default) {
            // Setze Standardwert, falls kein Parameter übergeben wurde
            setFieldValue(paramConfig.elementId, paramConfig.default, paramConfig.type);
        }
    }
    
    console.log(`${setCount} Parameter für ${belegType} gesetzt`);
    return setCount > 0;
}

/**
 * Öffnet den Tab basierend auf URL-Parameter
 */
function openTabFromURL(tabName) {
    const tabId = TAB_MAPPING[tabName];
    if (!tabId) return false;
    
    // Finde den Tab-Button
    const tabButton = document.querySelector(`.tablinks[onclick*="openCity(event, '${tabId}')"]`);
    if (tabButton) {
        tabButton.click();
        return true;
    }
    
    return false;
}

/**
 * Führt die Apply-Funktion für einen Beleg aus
 * Mit Retry-Logik falls SVG noch nicht geladen ist
 */
function executeApplyFunction(belegType, retryCount = 0) {
    const functionName = APPLY_FUNCTIONS[belegType];
    if (!functionName) return false;
    
    if (typeof window[functionName] !== 'function') {
        console.warn(`Apply-Funktion ${functionName} nicht gefunden`);
        return false;
    }
    
    try {
        window[functionName]();
        console.log(`✓ Apply-Funktion ${functionName} erfolgreich ausgeführt`);
        return true;
    } catch (error) {
        // Falls SVG-Elemente noch nicht existieren, retry
        if (retryCount < 3 && error.message && error.message.includes('null')) {
            console.log(`⏳ Retry ${retryCount + 1}/3 für ${functionName}...`);
            setTimeout(() => {
                executeApplyFunction(belegType, retryCount + 1);
            }, 500);
            return false;
        }
        
        console.error(`✗ Fehler beim Ausführen von ${functionName}:`, error);
        return false;
    }
}

/**
 * Verarbeitet spezielle Datum-Parameter (kombiniert Tag/Monat/Jahr)
 */
function processDatumParameter(params, belegType) {
    if (!params.has('datum')) return;
    
    const datumValue = params.get('datum');
    const parts = datumValue.split(/[.-]/);
    
    if (parts.length !== 3) return;
    
    const [tag, monat, jahr] = parts;
    
    // Bestimme die richtigen Element-IDs basierend auf Beleg-Typ
    let tagId, monatId, jahrId;
    
    switch(belegType) {
        case 'rechnung':
            tagId = 'tag';
            monatId = 'monat';
            jahrId = 'jahr';
            break;
        case 'kontoauszug':
            tagId = 'tagKontoauszug';
            monatId = 'monatKontoauszug';
            jahrId = 'jahrKontoauszug';
            break;
        case 'quittung':
            tagId = 'tagQuittung';
            monatId = 'monatQuittung';
            jahrId = 'jahrQuittung';
            break;
        case 'kassenbon':
            tagId = 'tagKassenbon';
            monatId = 'monatKassenbon';
            jahrId = 'jahrKassenbon';
            break;
        case 'bescheid':
            tagId = 'tagBescheid';
            monatId = 'monatBescheid';
            jahrId = 'jahrBescheid';
            break;
        case 'anlagenkarte':
            tagId = 'tagAnlagenkarte';
            monatId = 'monatAnlagenkarte';
            jahrId = 'jahrAnlagenkarte';
            break;
        case 'wertpapiere':
            tagId = 'tagWertpapiereInput';
            monatId = 'monatWertpapiereInput';
            jahrId = 'jahrWertpapiere';
            break;
        default:
            return;
    }
    
    if (tag && tagId) setFieldValue(tagId, tag.padStart(2, '0'), 'select');
    if (monat && monatId) setFieldValue(monatId, monat.padStart(2, '0'), 'select');
    if (jahr && jahrId) setFieldValue(jahrId, jahr, 'input');
}

/**
 * Hauptinitialisierung - wird beim DOMContentLoaded aufgerufen
 */
function initializeURLParameters() {
    const params = new URLSearchParams(window.location.search);
    
    // Prüfe, ob überhaupt Parameter vorhanden sind
    if (params.toString() === '') return;
    
    // 1. Bestimme den Beleg-Typ
    let belegType = null;
    
    // Prüfe verschiedene Parameter-Namen für Beleg-Typ
    for (const paramName of ['beleg', 'tab', 'type']) {
        if (params.has(paramName)) {
            const value = params.get(paramName).toLowerCase().trim();
            belegType = TAB_MAPPING[value] || value;
            break;
        }
    }
    
    // Wenn kein Beleg-Typ angegeben, versuche zu erraten
    if (!belegType) {
        // Schaue, welche Parameter gesetzt sind und leite daraus den Typ ab
        if (params.has('artikel1') || params.has('menge1')) {
            belegType = 'rechnung';
        } else if (params.has('vorgang1') || params.has('kontostand_alt')) {
            belegType = 'kontoauszug';
        } else if (params.has('zweck') && params.has('netto')) {
            belegType = 'quittung';
        }
        // ... weitere Heuristiken können hier hinzugefügt werden
    }
    
    if (!belegType) {
        console.log('Kein gültiger Beleg-Typ gefunden');
        return;
    }
    
    console.log(`📋 Initialisiere Beleg: ${belegType}`);
    
    // 2. Öffne den richtigen Tab
    const tabOpened = openTabFromURL(belegType);
    if (!tabOpened) {
        console.error(`✗ Tab für ${belegType} konnte nicht geöffnet werden`);
        return;
    }
    
    console.log(`✓ Tab geöffnet: ${belegType}`);
    
    // 3. Warte, bis Tab vollständig geladen ist
    setTimeout(() => {
        // 4. Lade Parameter für diesen Beleg
        const parametersSet = loadURLParametersForBeleg(belegType, params);
        
        if (parametersSet) {
            console.log(`✓ Parameter gesetzt für ${belegType}`);
        }
        
        // 5. Verarbeite spezielle Datum-Parameter
        processDatumParameter(params, belegType);
        
        // 6. Warte nochmal kurz, dann SVG laden (falls nötig)
        setTimeout(() => {
            // Für Belege, die SVG-Templates laden müssen
            const needsSVGLoad = ['rechnung', 'kontoauszug', 'email', 'quittung', 'kassenbon', 
                                   'lohnjournal', 'bescheid', 'anlagenkarte', 'wertpapiere'];
            
            if (needsSVGLoad.includes(belegType)) {
                // Lade SVG zuerst (falls applySVGholen existiert)
                if (typeof window.applySVGholen === 'function') {
                    console.log('⏳ Lade SVG-Template...');
                    window.applySVGholen();
                    
                    // Warte bis SVG geladen ist
                    setTimeout(() => {
                        executeApplyFunction(belegType);
                    }, 1000);
                } else {
                    // Kein SVG-Laden nötig, direkt Apply
                    executeApplyFunction(belegType);
                }
            } else {
                // Direkt Apply für Belege ohne SVG
                if (parametersSet) {
                    executeApplyFunction(belegType);
                }
            }
        }, 300);
    }, 500);
}

// ============================================================================
// EVENT LISTENER
// ============================================================================

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', initializeURLParameters);

// ============================================================================
// EXPORT FÜR NODE.JS (falls benötigt)
// ============================================================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        URL_PARAM_CONFIG,
        TAB_MAPPING,
        APPLY_FUNCTIONS,
        initializeURLParameters,
        loadURLParametersForBeleg
    };
}