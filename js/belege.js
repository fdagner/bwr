// ============================================================================
// GLOBALE VARIABLEN
// ============================================================================
let yamlData = []; // Initialize yamlData as an empty array
let nummerKunde = 0;

function initializeYamlData() {
    let baseData = [];

    // Priorität 1: Hochgeladene YAML (wenn vorhanden)
    const uploadedJSON = localStorage.getItem('uploadedYamlCompanyData');
    if (uploadedJSON) {
        try {
            baseData = JSON.parse(uploadedJSON);
            console.log('Hochgeladene YAML geladen mit', baseData.length, 'Unternehmen');
        } catch (err) {
            console.warn('Hochgeladene YAML korrupt → falle auf Standard zurück', err);
        }
    }

    // Priorität 2: Standard-YAML (nur wenn nichts hochgeladen)
    if (baseData.length === 0) {
        const standardJSON = localStorage.getItem('standardYamlData');
        if (standardJSON) {
            baseData = JSON.parse(standardJSON);
            console.log('Standard-YAML geladen mit', baseData.length, 'Unternehmen');
        } else {
            loadStandardYamlData(); // asynchron → Abbruch hier
            return;
        }
    }

    // Basis setzen
    yamlData = baseData;

    // Merge: Eigene Unternehmen IMMER hinzufügen (Option B)
    mergeUserCompaniesIntoYamlData();

    // Dropdowns aktualisieren
    updateAllDropdowns();

    console.log('Finale yamlData hat jetzt', yamlData.length, 'Unternehmen (Basis + eigene)');
}


// ============================================================================
// KONFIGURATIONEN
// ============================================================================
const DROPDOWN_CONFIG = {
    'datenKunde': { onChange: loadCompanyData, autoUpdate: true },
    'datenLieferer': { onChange: loadSupplierData, autoUpdate: true },
    'datenKontoauszug': { onChange: loadKontoauszugData, autoUpdate: false },
    'datenEmail': { onChange: loadEmailData, autoUpdate: false },
    'datenEmailKunde': { onChange: loadCompanyDataforEmail, autoUpdate: false },
    'datenQuittung': { onChange: loadQuittungData, autoUpdate: false },
    'datenQuittungKunde': { onChange: loadCompanyDataforQuittung, autoUpdate: false },
    'datenKassenbon': { onChange: loadKassenbonData, autoUpdate: false },
    'datenKassenbonKunde': { onChange: loadCompanyDataforKassenbon, autoUpdate: false },
    'datenLohnjournal': { onChange: loadLohnjournalData, autoUpdate: false },
    'datenBescheid': { onChange: loadBescheidData, autoUpdate: false },
    'datenAnlagenkarte': { onChange: loadAnlagenkarteData, autoUpdate: false },
    'datenWertpapiere': { onChange: loadWertpapiereData, autoUpdate: false },
    'datenLohnabrechnung': { onChange: loadLohnabrechnungFirma, autoUpdate: false },
};


// Konfiguration für Beleg-Datenfelder
const BELEG_FIELD_MAPPING = {
    kontoauszug: {
        fields: {
            'kontoauszugBank': 'unternehmen.bank',
            'kontoauszugIban': 'unternehmen.iban',
            'kontoauszugBic': 'unternehmen.bic',
            'kontoauszugName': (data) => `${data.unternehmen.name} ${data.unternehmen.rechtsform}`,
            'kontoauszugAdresse': 'unternehmen.adresse.strasse',
            'kontoauszugOrt': (data) => `${data.unternehmen.adresse.plz} ${data.unternehmen.adresse.ort}`
        }
    },
    quittung: {
        fields: {
            'quittungName': (data) => `${data.unternehmen.name} ${data.unternehmen.rechtsform}`,
            'quittungStrasse': 'unternehmen.adresse.strasse',
            'quittungOrt': (data) => `${data.unternehmen.adresse.plz} ${data.unternehmen.adresse.ort}`,
            'quittungInhaber': 'unternehmen.inhaber',
            'quittungOrtDatum': 'unternehmen.adresse.ort'
        }
    },
    kassenbon: {
        fields: {
            'kassenbonName': (data) => `${data.unternehmen.name} ${data.unternehmen.rechtsform}`,
            'kassenbonStrasse': 'unternehmen.adresse.strasse',
            'kassenbonUSTID': 'unternehmen.ust_id',
            'kassenbonSteuernummer': 'unternehmen.steuernummer',
            'kassenbonOrt': (data) => `${data.unternehmen.adresse.plz} ${data.unternehmen.adresse.ort}`,
            'kassenbonInhaber': 'unternehmen.inhaber'
        }
    },
    lohnjournal: {
        fields: {
            'lohnjournalName': (data) => `${data.unternehmen.name} ${data.unternehmen.rechtsform}`,
            'lohnjournalStrasse': 'unternehmen.adresse.strasse',
            'lohnjournalOrt': (data) => `${data.unternehmen.adresse.plz} ${data.unternehmen.adresse.ort}`
        }
    },
    anlagenkarte: {
        fields: {
            'anlagenkarteName': (data) => `${data.unternehmen.name} ${data.unternehmen.rechtsform}`,
            'anlagenkarteStrasse': 'unternehmen.adresse.strasse',
            'anlagenkarteOrt': (data) => `${data.unternehmen.adresse.plz} ${data.unternehmen.adresse.ort}`
        }
    },
    wertpapiere: {
        fields: {
            'wertpapiereName': (data) => `${data.unternehmen.name} ${data.unternehmen.rechtsform}`,
            'wertpapiereStrasse': 'unternehmen.adresse.strasse',
            'wertpapiereID': (data) => data.unternehmen.id * 6,
            'wertpapiereBank': 'unternehmen.bank',
            'wertpapiereOrt': (data) => `${data.unternehmen.adresse.plz} ${data.unternehmen.adresse.ort}`
        }
    },
    bescheid: {
        fields: {
            'bescheidName': (data) => `${data.unternehmen.name} ${data.unternehmen.rechtsform}`,
            'bescheidInhaber': 'unternehmen.inhaber'
        },
        classFields: {
            'bescheidOrtInhaber': (data) => `${data.unternehmen.adresse.plz} ${data.unternehmen.adresse.ort}`,
            'bescheidOrt': 'unternehmen.adresse.ort',
            'bescheidStrasse': 'unternehmen.adresse.strasse'
        },
        customLogic: (data) => {
            // Aktenzeichen
            const randomNum = Math.floor(Math.random() * 9000000) + 1000000;
            const aktenzeichen = document.getElementById('bescheidAktenzeichen1');
            if (aktenzeichen) aktenzeichen.textContent = "K" + randomNum;

            // Nummer
            const nummer = document.getElementById('bescheidNummer');
            if (nummer) nummer.textContent = FormatHelper.roundToTwo(randomNum / 3);
        }
    },
    email: {
        fields: {
            'emailName': (data) => `${data.unternehmen.name} ${data.unternehmen.rechtsform}`
        },
        classFields: {
            'emailInhaber': 'unternehmen.inhaber'
        },
        customLogic: (data) => {
            loadLogoToSVG(data.unternehmen.logo, 'emailSVG', 'logo-placeholderEmail');
        }
    },
    kunde: {
        fields: {
            'nameKunde': (data) => `${data.unternehmen.name} ${data.unternehmen.rechtsform}`,
            'inhaberKunde': 'unternehmen.inhaber',
            'strasseKunde': 'unternehmen.adresse.strasse',
            'plzKunde': (data) => `${data.unternehmen.adresse.plz} ${data.unternehmen.adresse.ort}`
        },
        customLogic: (data) => {
            const rechnungsNummer = Math.floor(Math.random() * 900) + 100;
            const element = document.getElementById('rechnungsNummer');
            if (element) element.textContent = rechnungsNummer;

            // Setze globale Variable für andere Berechnungen
            window.nummerKunde = data.unternehmen.id;
        }
    },
    kundeQuittung: {
        fields: {
            'quittungNameKunde': (data) => `${data.unternehmen.inhaber}, ${data.unternehmen.name}`
        }
    },
    kundeKassenbon: {
        fields: {
            'kassenbonStrasseKunde': 'unternehmen.adresse.strasse',
            'kassenbonOrtKunde': (data) => `${data.unternehmen.adresse.plz} ${data.unternehmen.adresse.ort}`
        }
    },
    lohnabrechnungFirma: {
        fields: {
            'lohnabrechnungFirmaName': (data) => `${data.unternehmen.name} ${data.unternehmen.rechtsform}`,
            'lohnabrechnungFirmaStrasse': 'unternehmen.adresse.strasse',
            'lohnabrechnungFirmaOrt': (data) => `${data.unternehmen.adresse.plz} ${data.unternehmen.adresse.ort}`
        }
    }
};

// ============================================================================
// HILFSFUNKTIONEN - Formatierung und Berechnungen
// ============================================================================
const FormatHelper = {
    // Auf 2 Dezimalstellen runden
    roundToTwo: (num) => Math.round(num * 100) / 100,

    // Zahl mit Tausenderpunkt formatieren
    number: (number) => new Intl.NumberFormat('de-DE').format(number),

    // Zahl mit Leerzeichen statt Punkt formatieren
    numberSpace: (number) => {
        const formatted = new Intl.NumberFormat('de-DE').format(number);
        return formatted.replace(/\./g, ' ');
    },

    // Währung formatieren (mit €)
    currency: (amount) => {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    },

    // Währung mit Vorzeichen formatieren
    currencyWithSign: (amount) => {
        const formatted = new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR'
        }).format(Math.abs(amount));
        const sign = amount >= 0 ? '+' : '–';
        return `${formatted} ${sign}`;
    }
};

// Hilfsfunktion, um den numerischen Wert eines Eingabefelds zu erhalten
function getNumericValue(inputId) {
    const inputValue = document.getElementById(inputId).value;
    return parseFloat(inputValue) || 0; // Rückgabe von 0, wenn die Umwandlung fehlschlägt
}

// Zufallsgeneratoren
const RandomHelper = {
    // Zufällige Nummer zwischen min und max
    number: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,

    // Zufällige 7-stellige Nummer
    sevenDigit: () => Math.floor(Math.random() * 9000000) + 1000000,

    // Zufällige Zeit zwischen 10:00 und 16:59
    time: () => {
        const hour = Math.floor(Math.random() * 7) + 10;
        const minute = Math.floor(Math.random() * 60);
        return `${hour}:${minute < 10 ? '0' + minute : minute}`;
    }
};

// ============================================================================
// SAFE DOM HELPER - Verhindert Null-Pointer Fehler
// ============================================================================
const SafeDOM = {
    setText: (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    },
    setHTML: (id, html) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    },
    setValue: (id, value) => {
        const el = document.getElementById(id);
        if (el) el.value = value;
    },
    setAttr: (id, attr, value) => {
        const el = document.getElementById(id);
        if (el) el.setAttribute(attr, value);
    },
    setClass: (className, text) => {
        const els = document.getElementsByClassName(className);
        for (const el of els) el.textContent = text;
    },
    exists: (id) => {
        return document.getElementById(id) !== null;
    },
    remove: (id) => {
        const el = document.getElementById(id);
        if (el) el.remove();
    }
};


// ============================================================================
// BELEG-DATEN LADEN (Generisch)
// ============================================================================
function loadBelegData(belegType, dropdownId) {
    const selectedName = document.getElementById(dropdownId)?.value;
    if (!selectedName) return;

    const selectedData = yamlData.find(item => item.unternehmen.name === selectedName);
    if (!selectedData) return;

    const config = BELEG_FIELD_MAPPING[belegType];
    if (!config) return;

    // Einzelne Element-IDs befüllen
    if (config.fields) {
        Object.entries(config.fields).forEach(([elementId, path]) => {
            const element = document.getElementById(elementId);
            if (!element) return;

            let value;
            if (typeof path === 'function') {
                value = path(selectedData);
            } else {
                value = path.split('.').reduce((obj, key) => obj?.[key], selectedData);
            }

            element.textContent = value || '';
        });
    }

    // Klassen-basierte Felder befüllen (z.B. für Bescheid)
    if (config.classFields) {
        Object.entries(config.classFields).forEach(([className, path]) => {
            const elements = document.getElementsByClassName(className);

            let value;
            if (typeof path === 'function') {
                value = path(selectedData);
            } else {
                value = path.split('.').reduce((obj, key) => obj?.[key], selectedData);
            }

            for (const element of elements) {
                element.textContent = value || '';
            }
        });
    }

    // Custom Logik ausführen (z.B. für Zufallsnummern)
    if (config.customLogic) {
        config.customLogic(selectedData);
    }
}


// Generische Logo-Lade-Funktion
function loadLogoToSVG(logoUrl, svgContainerId, placeholderId) {
    const svgContainer = document.getElementById(svgContainerId);
    const rectElement = document.getElementById(placeholderId);

    if (!svgContainer || !rectElement) return;

    // Entferne vorhandene Logos
    const existingImages = svgContainer.querySelectorAll('#uploaded-image');
    existingImages.forEach(img => img.remove());

    const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    image.setAttribute('id', 'uploaded-image');
    image.setAttribute('x', rectElement.getAttribute('x'));
    image.setAttribute('y', rectElement.getAttribute('y'));
    image.setAttribute('width', rectElement.getAttribute('width'));
    image.setAttribute('height', rectElement.getAttribute('height'));

    const standardImageURL = 'media/pic/standard.svg';
    const imageUrl = (logoUrl && logoUrl.trim() !== '') ? logoUrl : standardImageURL;

    // Prüfe ob URL oder Data-URL
    if (imageUrl.startsWith('http') || imageUrl.startsWith('data:image')) {
        image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', imageUrl);
        svgContainer.appendChild(image);
    } else {
        // Lade als Blob und konvertiere zu Base64
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            const reader = new FileReader();
            reader.onloadend = function () {
                image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', reader.result);
                svgContainer.appendChild(image);
            };
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', imageUrl);
        xhr.responseType = 'blob';
        xhr.send();
    }
}

// Hilfsfunktion für Handelsregister-Bestimmung
function getHandelsregister(rechtsform) {
    const erlaubteRechtsformen = ["e. K.", "e. Kfr.", "OHG", "KG", "GmbH & Co. KG", "GmbH & Co. OHG"];

    if (!rechtsform || rechtsform === "") return "";
    if (erlaubteRechtsformen.includes(rechtsform)) return "HRA";
    return "HRB";
}

// Lieferanten-spezifische Logik
function applySupplierSpecificData(data) {
    // Handelsregister
    const handelsregister = getHandelsregister(data.unternehmen.rechtsform);
    const amtsgericht = document.getElementById('amtsgerichtLieferer');
    if (amtsgericht) {
        amtsgericht.textContent = `Amtsgericht ${data.unternehmen.adresse.ort} ${handelsregister}`;
    }

    // Kundennummer berechnen
    const nummerKundeElement = document.getElementById('nummerKunde');
    if (nummerKundeElement && window.nummerKunde) {
        nummerKundeElement.textContent = (window.nummerKunde * data.unternehmen.id * 9) + 133;
    }


    // Akzentfarbe
    const akzentColor = data.unternehmen.akzent || "#7db9f5";
    const colorSVGElements = document.querySelectorAll('.colorSVG');
    colorSVGElements.forEach(element => {
        if (element instanceof SVGElement) {
            element.setAttribute('fill', akzentColor);
        } else {
            element.style.backgroundColor = akzentColor;
        }
    });

    const colorPicker = document.getElementById("colorPicker");
    if (colorPicker) colorPicker.value = akzentColor;

    adjustTextColor();

    // Logo laden
    loadSupplierLogo(data.unternehmen.logo);
}

// Logo-Logik für Lieferant (SVG-spezifisch)
// Logo-Logik für Lieferant (SVG-spezifisch)
function loadSupplierLogo(logoUrl) {
    const svgContainer = document.getElementById('rechnungSVG');
    const rectElement = document.getElementById('logo-placeholder');

    if (!svgContainer || !rectElement) return;

    // Entferne vorhandene Logos
    const existingImages = svgContainer.querySelectorAll('#uploaded-image, svg.logo-svg');
    existingImages.forEach(img => img.remove());

    const x = rectElement.getAttribute('x');
    const y = rectElement.getAttribute('y');
    const width = rectElement.getAttribute('width');
    const height = rectElement.getAttribute('height');

    const standardImageURL = 'media/pic/standard.svg';

    // Prüfe ob Base64-Logo (von Benutzerunternehmen)
    if (logoUrl && logoUrl.startsWith('data:image')) {
        // Base64 SVG - erstelle image Element
        const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        image.setAttribute('id', 'uploaded-image');
        image.setAttribute('x', x);
        image.setAttribute('y', y);
        image.setAttribute('width', width);
        image.setAttribute('height', height);
        image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', logoUrl);
        svgContainer.appendChild(image);
        return;
    }

    // Fallback: URL oder Standardbild
    const imageUrl = (logoUrl && logoUrl.trim() !== '' && (logoUrl.startsWith('http') || logoUrl.endsWith('.svg')))
        ? logoUrl
        : standardImageURL;

    // Lade SVG-Datei per XHR
    const xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.status === 200) {
            const svgContent = xhr.responseText;
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = svgContent;

            const svgElement = tempContainer.querySelector('svg');
            if (svgElement) {
                svgElement.setAttribute('x', x);
                svgElement.setAttribute('y', y);
                svgElement.setAttribute('width', width);
                svgElement.setAttribute('height', height);
                svgElement.classList.add('logo-svg');
                svgContainer.appendChild(svgElement);
            }
        }
    };
    xhr.onerror = function () {
        // Bei Fehler: Zeige Standardbild
        const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
        image.setAttribute('id', 'uploaded-image');
        image.setAttribute('x', x);
        image.setAttribute('y', y);
        image.setAttribute('width', width);
        image.setAttribute('height', height);

        fetch(standardImageURL)
            .then(r => r.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', reader.result);
                    svgContainer.appendChild(image);
                };
                reader.readAsDataURL(blob);
            });
    };
    xhr.open('GET', imageUrl);
    xhr.send();
}


// PNG-Export
function exportPNG(containerId, filename = 'download.png') {
    const container = document.getElementById(containerId);
    if (!container) return;
    html2canvas(container).then(canvas => {
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL();
        link.click();
    });
}

// SVG-Export
function exportSVG(containerId, filename = 'download.svg') {
    const container = document.getElementById(containerId);
    if (!container) return;
    const svg = container.querySelector('svg');
    if (!svg) return alert('Kein SVG gefunden');
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

// In Zwischenablage kopieren
function copyToClipboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const svg = container.querySelector('svg');
    if (!svg) return alert('Kein SVG zum Kopieren');
    const svgData = new XMLSerializer().serializeToString(svg);
    navigator.clipboard.writeText(svgData).then(() => {
        alert('SVG wurde in die Zwischenablage kopiert');
    });
}




// ============================================================================
// BENUTZERDEFINIERTE UNTERNEHMEN - LOCAL STORAGE VERWALTUNG
// ============================================================================

let uploadedLogoBase64 = null; // Globale Variable für hochgeladenes Logo


// Funktion zum Abrufen der benutzerdefinierten Unternehmen aus dem Local Storage
function getUserCompanies() {
    const stored = localStorage.getItem('userCompanies');
    return stored ? JSON.parse(stored) : [];
}



// Funktion zum Zusammenführen der benutzerdefinierten Unternehmen mit den Standard-YAML-Daten
function mergeUserCompaniesIntoYamlData() {
    const userCompanies = getUserCompanies();

    if (userCompanies.length === 0) {
        console.log('Keine eigenen Unternehmen zum Mergen');
        return;
    }

    yamlData = [...yamlData, ...userCompanies];

    // Sortieren nach Branche
    yamlData.sort((a, b) => {
        const brancheA = a.unternehmen?.branche || '';
        const brancheB = b.unternehmen?.branche || '';
        return brancheA.localeCompare(brancheB);
    });

    console.log('Merged:', userCompanies.length, 'eigene Unternehmen hinzugefügt → Gesamt:', yamlData.length);
}




// Funktion zum Laden der Standard-YAML-Daten
function loadStandardYamlData() {
    fetch('js/unternehmen.yml')
        .then(response => response.text())
        .then(data => {
            const standardData = jsyaml.load(data);
            localStorage.setItem('standardYamlData', JSON.stringify(standardData));
            console.log('Standard-YAML gespeichert');
            initializeYamlData();  // ← zurück zur zentralen Logik
        })
        .catch(error => {
            console.error("Fehler beim Laden der Standard-YAML:", error);
        });
}


// Modifizierte Funktion zum Laden der hochgeladenen Daten
function loadUploadedDataFromLocalStorage() {
    initializeYamlData(); // 
}

function mergeUserCompaniesIntoYamlData() {
    const userCompanies = getUserCompanies();

    if (userCompanies.length === 0) {
        console.log('Keine eigenen Unternehmen zum Mergen');
        return;
    }

    yamlData = [...yamlData, ...userCompanies];

    // Sortieren nach Branche
    yamlData.sort((a, b) => {
        const brancheA = a.unternehmen?.branche || '';
        const brancheB = b.unternehmen?.branche || '';
        return brancheA.localeCompare(brancheB);
    });

    console.log('Merged:', userCompanies.length, 'eigene Unternehmen hinzugefügt → Gesamt:', yamlData.length);
}

// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', function () {
    if (!localStorage.getItem('standardYamlData')) {
        loadStandardYamlData();
    }

    // Zentrale Initialisierung → Dropdowns werden befüllt
    initializeYamlData();

    initializeDropdownHandlers(); // deine Event-Listener
    
    applySVGholen();              // falls nötig
});


const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("belegImportInput");

// Klick → normaler Datei-Dialog
dropZone.addEventListener("click", () => fileInput.click());

// Drag & Drop Styling
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        handleBelegImport();
    }
});

// Normale Dateiauswahl
fileInput.addEventListener("change", handleBelegImport);

function handleBelegImport() {
    const file = fileInput.files[0];
    if (!file) return;

    dropZone.querySelector("p").textContent = file.name;

    console.log("Datei geladen:", file);
}



// Modifizierte deleteAndLoadDefaultData Funktion
function deleteAndLoadDefaultData() {
    if (!confirm('Möchten Sie wirklich alle Daten zurücksetzen? Dies löscht auch Ihre eigenen Unternehmen!')) {
        return;
    }

    // Lösche alle benutzerdefinierten Daten
    localStorage.removeItem('uploadedYamlCompanyData');
    localStorage.removeItem('userCompanies');
    localStorage.removeItem('standardYamlData');

    // Setze Datei-Input zurück
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';

    // Lade Standard-YAML-Daten neu
    loadStandardYamlData();

    // Aktualisiere Anzeige
    displayUserCompanies();
    uploadedLogoBase64 = null;
    document.getElementById('logoPreview').innerHTML = '<small style="color: #666;">Keine Datei ausgewählt</small>';
    document.getElementById('addCompanyForm').reset();

    updateLocalStorageStatus('Alle Daten wurden erfolgreich zurückgesetzt.');
    alert('Daten erfolgreich zurückgesetzt.');
}

// ============================================================================
// DROPDOWN-VERWALTUNG
// ============================================================================
function updateAllDropdowns() {
    if (!yamlData || yamlData.length === 0) return;

    // Sortiere Daten einmal
    const sortedData = [...yamlData].sort((a, b) => {
        const brancheA = a.unternehmen?.branche || '';
        const brancheB = b.unternehmen?.branche || '';
        return brancheA.localeCompare(brancheB);
    });

    // Befülle alle Dropdowns
    Object.keys(DROPDOWN_CONFIG).forEach(dropdownId => {
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) return;

        dropdown.innerHTML = '';  // alles löschen

        // ← Hier die entscheidende Zeile(n) hinzufügen
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.text = '— Bitte Unternehmen auswählen —';
        placeholder.disabled = true;           // optional: verhindert erneutes Auswählen
        placeholder.selected = true;           // ← das macht den Unterschied!
        dropdown.appendChild(placeholder);

        // Nun die echten Einträge
        sortedData.forEach(company => {
            const option = document.createElement('option');
            option.value = company.unternehmen.name;
            option.text = `${company.unternehmen.branche} - ${company.unternehmen.name} ${company.unternehmen.rechtsform || ''}`.trim();
            dropdown.appendChild(option);
        });

        // Sicherstellen, dass wirklich nichts anderes ausgewählt ist
        dropdown.value = '';
    });
}

// ============================================================================
// EVENT-HANDLER & INITIALISIERUNG
// ============================================================================
function initializeDropdownHandlers() {
    Object.entries(DROPDOWN_CONFIG).forEach(([dropdownId, config]) => {
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) return;

        dropdown.addEventListener('change', () => {
            config.onChange();
            // Wenn autoUpdate true ist, automatisch Daten übernehmen
            if (config.autoUpdate) {
                applyOrderData();
            }
        });
    });
}

// Debounce-Hilfsfunktion für verzögerte Ausführung
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}



// Vereinfachte reloadDropdownOptions
function reloadDropdownOptions() {
    updateAllDropdowns();
}



if (!localStorage.getItem('uploadedYamlCompanyData')) {
    fetch('js/unternehmen.yml')
        .then(response => response.text())
        .then(data => {
            const standardData = jsyaml.load(data);
            // Speichere Standard-Daten
            localStorage.setItem('standardYamlData', JSON.stringify(standardData));
            yamlData = standardData;

            // Füge Benutzerunternehmen hinzu
            mergeUserCompaniesIntoYamlData();
            updateAllDropdowns();
        });
} else {
    // Wenn hochgeladene Daten vorhanden sind, lade diese
    loadUploadedDataFromLocalStorage();
}


// ============================================================================
// BELEG-DATEN LADEN (Spezifisch)
// ============================================================================
function loadKontoauszugData() {
    loadBelegData('kontoauszug', 'datenKontoauszug');
}


function loadEmailData() {
    loadBelegData('email', 'datenEmail');
}

// Lade die Unternehmensdaten basierend auf der Auswahl im Dropdown-Feld
function loadCompanyDataforEmail() {
    const selectedName = document.getElementById('datenEmailKunde')?.value;
    if (!selectedName) return;

    const selectedData = yamlData.find(item => item.unternehmen.name === selectedName);
    if (!selectedData) return;

    const emailInhaber = document.getElementById('emailNameKunde');
    if (emailInhaber) emailInhaber.textContent = selectedData.unternehmen.inhaber;

    const emailAdresse = document.getElementById('emailAdresseKunde');
    if (emailAdresse) emailAdresse.textContent = selectedData.unternehmen.kontakt.email;
}

function loadQuittungData() {
    loadBelegData('quittung', 'datenQuittung');
}


function loadLohnjournalData() {
    loadBelegData('lohnjournal', 'datenLohnjournal');
}

function loadBescheidData() {
    loadBelegData('bescheid', 'datenBescheid');
}


function loadKassenbonData() {
    loadBelegData('kassenbon', 'datenKassenbon');
}


// Lade die Unternehmensdaten basierend auf der Auswahl im Dropdown-Feld
function loadCompanyDataforKassenbon() {
    const selectedCompanyName = document.getElementById('datenKassenbonKunde').value;
    const selectedCompany = yamlData.find(company => company.unternehmen.name === selectedCompanyName);

    let kassenbonStrasseKunde = document.getElementById('kassenbonStrasseKunde');
    if (kassenbonStrasseKunde) {
        kassenbonStrasseKunde.textContent = selectedCompany.unternehmen.adresse.strasse;
    } else {
    }

    let kassenbonOrtKunde = document.getElementById('kassenbonOrtKunde');
    if (kassenbonOrtKunde) {
        kassenbonOrtKunde.textContent = selectedCompany.unternehmen.adresse.plz + " " + selectedCompany.unternehmen.adresse.ort;
    } else {
    }
}

function loadAnlagenkarteData() {
    loadBelegData('anlagenkarte', 'datenAnlagenkarte');
}


function loadWertpapiereData() {
    loadBelegData('wertpapiere', 'datenWertpapiere');
}

// Lade die Unternehmensdaten basierend auf der Auswahl im Dropdown-Feld
function loadCompanyData() {
    loadBelegData('kunde', 'datenKunde');
    loadSupplierData(); // Aktualisiere auch Lieferant für nummerKunde
}


function loadCompanyDataforQuittung() {
    loadBelegData('kundeQuittung', 'datenQuittungKunde');
}


function loadCompanyDataforKassenbon() {
    loadBelegData('kundeKassenbon', 'datenKassenbonKunde');
}


// ============================================================================
// LIEFERANT & KUNDE
// ============================================================================
function loadSupplierData() {
    const selectedName = document.getElementById('datenLieferer')?.value;
    if (!selectedName) return;

    const selectedData = yamlData.find(item => item.unternehmen.name === selectedName);
    if (!selectedData) return;

    const u = selectedData.unternehmen; // Abkürzung

    // Basis-Textfelder
    const fields = {
        'nameLieferer': `${u.name} ${u.rechtsform}`,
        'mottoLieferer': u.motto,
        'nameLangLieferer': u.name,
        'strasseLieferer': u.adresse.strasse,
        'plzLieferer': `${u.adresse.plz} ${u.adresse.ort}`,
        'adresseLieferer': `${u.name} ${u.rechtsform} - ${u.adresse.strasse} - ${u.adresse.plz} ${u.adresse.ort} - ${u.adresse.land}`,
        'ansprechpartnerLieferer': u.inhaber,
        'telefonLieferer': u.kontakt.telefon,
        'emailLieferer': u.kontakt.email,
        'internetLieferer': u.kontakt.internet,
        'bankLieferer': u.bank,
        'ibanLieferer': `IBAN: ${u.iban}`,
        'bicLieferer': `BIC: ${u.bic}`,
        'ustidLieferer': `UST-IdNr.: ${u.ust_id}`,
        'steuernummerLieferer': `Steuernummer: ${u.steuernummer}`
    };

    Object.entries(fields).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });

    // Lieferanten-spezifische Logik
    applySupplierSpecificData(selectedData);
    adjustTextColor();
}

// Funktion zum Laden eines Logos
function loadLogo(event) {
    const svgContainer = document.getElementById('rechnungSVG');
    // Überprüfe, ob ein SVG-Element vorhanden ist
    if (!(svgContainer instanceof SVGElement)) {
        alert('In diesem Beleg kann kein Logo hochgeladen werden.');
        return;
    }
    // Entferne vorhandene Logos (sowohl <image> als auch SVGs)
    const existingImages = svgContainer.querySelectorAll('#uploaded-image, svg.logo-svg');
    existingImages.forEach(existingImage => {
        svgContainer.removeChild(existingImage);
    });
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const svgContainer = document.getElementById('rechnungSVG');
            const existingImage = document.getElementById('uploaded-image');
            const rectElement = document.getElementById('logo-placeholder');


            // Erstelle ein <image>-Element und füge es zur SVG hinzu
            const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
            image.setAttribute('id', 'uploaded-image');
            image.setAttribute('x', rectElement.getAttribute('x'));
            image.setAttribute('y', rectElement.getAttribute('y'));
            image.setAttribute('width', rectElement.getAttribute('width'));
            image.setAttribute('height', rectElement.getAttribute('height'));
            image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', e.target.result);

            svgContainer.appendChild(image);
        };
        reader.readAsDataURL(file);

    }
}


// ============================================================================
// BELEG-ANWENDUNG (Apply-Funktionen)
// ============================================================================
function applyOrderData() {

    if (!validateInputs()) {
        // Wenn die Validierung fehlschlägt, stoppe die Funktion
        return;
    }

    // Hole die ausgewählten Werte von Tag und Monat

    const selectedTag = document.getElementById('tag').value;
    const selectedMonat = document.getElementById('monat').value;
    const selectedTagKontoauszug = document.getElementById('tagKontoauszug').value;
    const selectedMonatKontoauszug = document.getElementById('monatKontoauszug').value;

    // Formatieren von Tag und Monat
    const formattedDatum = `${selectedTag}.${selectedMonat}.`;
    const formattedDatumKontoauszug = `${selectedTagKontoauszug}.${selectedMonatKontoauszug}.`;

    // 7 Tage abziehen
    if (SafeDOM.exists('rechnungDatum-7')) {
        const currentYear = new Date().getFullYear();
        const selectedDatumRechnung = new Date(`${selectedMonat}/${selectedTag}/${currentYear}`);
        const sevenDaysAgoRechnung = new Date(selectedDatumRechnung);
        sevenDaysAgoRechnung.setDate(selectedDatumRechnung.getDate() - 7);
        const formattedSevenDaysAgoRechnung = `${sevenDaysAgoRechnung.getDate().toString().padStart(2, '0')}.${(sevenDaysAgoRechnung.getMonth() + 1).toString().padStart(2, '0')}.`;
        SafeDOM.setText('rechnungDatum-7', formattedSevenDaysAgoRechnung);
    }

    // Fälligkeitsdatum
    const zahlungszielInput = getNumericValue('zahlungszielInput');
    const elementsWithClassZiel = document.getElementById('rechnungDatumZiel');
    if (elementsWithClassZiel) {
        const currentYear = new Date().getFullYear();
        const selectedDatumZiel = new Date(`${selectedMonat}/${selectedTag}/${currentYear}`);
        const datumZiel = new Date(selectedDatumZiel);
        datumZiel.setDate(selectedDatumZiel.getDate() + zahlungszielInput);
        const formattedZiel = `${datumZiel.getDate().toString().padStart(2, '0')}.${(datumZiel.getMonth() + 1).toString().padStart(2, '0')}.`;
        elementsWithClassZiel.textContent = formattedZiel;
    }

    // Annahme: Alle Elemente mit der Klasse 'rechnungsDatum' und kontoauszugDatum sollen aktualisiert werden
    SafeDOM.setClass('rechnungsDatum', formattedDatum);

    const elementsWithClassKontoauszug = document.getElementsByClassName('kontoauszugDatum');
    for (const element of elementsWithClassKontoauszug) {
        element.textContent = formattedDatumKontoauszug;
    }

    const currentYear = new Date().getFullYear();
    const selectedDatumKontoauszug = new Date(`${selectedMonatKontoauszug}/${selectedTagKontoauszug}/${currentYear}`);
    // 7 Tage abziehen
    const sevenDaysAgoKontoauszug = new Date(selectedDatumKontoauszug);
    sevenDaysAgoKontoauszug.setDate(selectedDatumKontoauszug.getDate() - 7);

    // Formatieren des Datums in Format DD.MM.)
    const formattedSevenDaysAgoKontoauszug = `${sevenDaysAgoKontoauszug.getDate().toString().padStart(2, '0')}.${(sevenDaysAgoKontoauszug.getMonth() + 1).toString().padStart(2, '0')}.`;

    // Finde alle Elemente mit der Klasse 'kontoauszugDatum'
    const elementsWithClassKontoauszug7 = document.getElementsByClassName('kontoauszugDatum-7');

    // Iteriere durch alle Elemente und setze das formatierte Datum für Kontoauszug minus 7 Tage
    for (const element of elementsWithClassKontoauszug7) {
        element.textContent = formattedSevenDaysAgoKontoauszug;
    }

    handleYearScript({
        jahrCheckbox: 'scriptJahr',
        jahrInput: 'jahr',
        jahrClass: 'aktuellesJahr',
        customDefs: 'customDefs',
        scriptId: 'customJs',
        scriptFunction: 'SVGonLoad'
    });


    handleYearScript({
        jahrCheckbox: 'scriptJahrKontoauszug',
        jahrInput: 'jahrKontoauszug',
        jahrClass: 'aktuellesJahrKontoauszug',
        customDefs: 'customDefsKontoauszug',
        scriptId: 'customJsKontoauszug',
        scriptFunction: 'SVGonLoadKontoauszug'
    });

    // Lese die eingegebenen Daten aus den Input-Feldern
    const artikel = document.getElementById('artikelInput').value;
    const menge = getNumericValue('mengeInput');
    const einheit = document.getElementById('einheitInput').value;
    const einzelpreis = getNumericValue('einzelpreisInput');

    // Lese die eingegebenen Daten aus den Input-Feldern
    const artikel2 = document.getElementById('artikelInput2').value;
    const menge2 = parseFloat(document.getElementById('mengeInput2').value);
    const einheit2 = document.getElementById('einheitInput2').value;
    const einzelpreis2 = parseFloat(document.getElementById('einzelpreisInput2').value);
    const angebotLieferzeit = document.getElementById('angebotLieferzeitInput').value;

    // Verwendung der Hilfsfunktion für verschiedene Eingabefelder
    const rabattInput = getNumericValue('rabattInput');
    const bezugskostenInput = getNumericValue('bezugskostenInput');
    const umsatzsteuerInput = getNumericValue('umsatzsteuerInput');
    const skontoInput = getNumericValue('skontoInput');
    const skontofristInput = getNumericValue('skontofristInput');
    let gesamtpreis1 = menge * einzelpreis;
    let gesamtpreis2 = menge2 * einzelpreis2;
    const bezugskostenArtInput = document.getElementById('bezugskostenArtInput').value;

    // Setze die gelesenen Daten in die SVG-Textelemente

    if (menge && einzelpreis) {
        gesamtpreis1 = menge * einzelpreis;
        SafeDOM.setText('pos1', '1');  // ✓ Kein Fehler mehr!
        SafeDOM.setText('artikel1', artikel);
        SafeDOM.setText('menge1', FormatHelper.numberSpace(menge) + ' ' + einheit);
        SafeDOM.setText('einzelpreis1', FormatHelper.currency(einzelpreis));
        SafeDOM.setText('gesamtpreis1', FormatHelper.currency(gesamtpreis1));
    } else {
        gesamtpreis1 = 0;
        SafeDOM.setText('pos1', '');
        SafeDOM.setText('artikel1', artikel);
        SafeDOM.setText('menge1', '');
        SafeDOM.setText('einzelpreis1', '');
        SafeDOM.setText('gesamtpreis1', '');
    }

    // Setze die gelesenen Daten in die SVG-Textelemente


    if (menge2 && einzelpreis2) {
        gesamtpreis2 = menge2 * einzelpreis2;
        SafeDOM.setText('pos2', '2');
        SafeDOM.setText('artikel2', artikel2);
        SafeDOM.setText('menge2', FormatHelper.numberSpace(menge2) + ' ' + einheit2);
        SafeDOM.setText('einzelpreis2', FormatHelper.currency(einzelpreis2));
        SafeDOM.setText('gesamtpreis2', FormatHelper.currency(gesamtpreis2));
    } else {
        gesamtpreis2 = 0;
        SafeDOM.setText('pos2', '');
        SafeDOM.setText('artikel2', artikel2);
        SafeDOM.setText('menge2', '');
        SafeDOM.setText('einzelpreis2', '');
        SafeDOM.setText('gesamtpreis2', '');
    }



    let angebotLieferzeitSVG = document.getElementById('angebotLieferzeit');
    if (angebotLieferzeitSVG) {
        // Die ID wurde gefunden, also füge den Text ein
        angebotLieferzeitSVG.textContent = angebotLieferzeit;
    }

    const elemZahlungsziel = document.getElementById('zahlungsziel');
    if (elemZahlungsziel) {
        document.getElementById('zahlungsziel').textContent = zahlungszielInput;
    } else { }

    const elemSkonto = document.getElementById('skonto');
    if (elemSkonto) {
        document.getElementById('skonto').textContent = skontoInput;
        // Überprüfen, ob skontoInput 0 oder leer ist
        if (skontoInput === "" || parseFloat(skontoInput) === 0) {
            // Falls 0 oder leer, das Element mit der ID "skontotext" entfernen
            const skontotextElement = document.getElementById('skontotext');
            if (skontotextElement) {
                skontotextElement.remove();
            }
        } else {
            // Falls nicht 0 oder leer, den Text des Elements mit der ID "skonto" setzen
            document.getElementById('skonto').textContent = skontoInput;
            document.getElementById('skontofrist').textContent = skontofristInput;

        }
    } else { }

    // Berechne und setze den Gesamtbetrag der Rechnung
    // Berechne die Zwischensumme
    const zwischensumme = gesamtpreis1 + gesamtpreis2;
    const rabattsumme = zwischensumme * rabattInput / 100;
    let nettowert;
    let umsatzsteuersumme;
    let gesamtRechnungsbetrag;

    // Setze die Zwischensumme in das SVG-Textelement
    SafeDOM.setText('zwischensumme', FormatHelper.currency(zwischensumme));
    SafeDOM.setText('bezugskostenSumme', FormatHelper.currency(bezugskostenInput));
    SafeDOM.setText('bezugskosten', bezugskostenArtInput);

    // Rabatt-Bereich
    if (rabattInput > 0) {
        SafeDOM.setText('rabatt', `- ${rabattInput} % Rabatt`);
        SafeDOM.setText('rabattsumme', FormatHelper.currency(rabattsumme));
        nettowert = zwischensumme - rabattsumme + bezugskostenInput;
    } else {
        SafeDOM.setText('rabatt', ' ');
        SafeDOM.setText('rabattsumme', ' ');
        nettowert = zwischensumme + bezugskostenInput;
    }

    // Nettowert
    SafeDOM.setText('nettowert', FormatHelper.currency(nettowert));

    // Umsatzsteuer
    if (umsatzsteuerInput > 0) {
        umsatzsteuersumme = nettowert * umsatzsteuerInput / 100;
        SafeDOM.setText('ust', `+ ${umsatzsteuerInput}`);
        SafeDOM.setText('ustsumme', FormatHelper.currency(umsatzsteuersumme));
        gesamtRechnungsbetrag = nettowert + umsatzsteuersumme;
    } else {
        umsatzsteuersumme = ' ';  // oder 0, je nach Logik
        SafeDOM.setText('ust', ' ');
        SafeDOM.setText('ustsumme', ' ');
        gesamtRechnungsbetrag = nettowert;
    }

    // Gesamtbetrag / Rechnungsbetrag
    SafeDOM.setText('rechnungsbetrag', FormatHelper.currency(gesamtRechnungsbetrag));

    // Platz machen wenn keine Bezugskosten oder Rabatt
    const warenwertUstRechnungsbetrag = document.getElementById('warenwertUstRechnungsbetrag');
    const warenwertUstRechnungsbetrag_quer = document.getElementById('warenwertUstRechnungsbetrag_quer');
    const gBezugskosten = document.getElementById('gBezugskosten');

    if (warenwertUstRechnungsbetrag) {
        if (bezugskostenInput > 0) {
            // Bezugskosten vorhanden - keine Änderung
        } else {
            SafeDOM.setAttr('warenwertUstRechnungsbetrag', 'transform', 'translate(0, -30)');
            SafeDOM.remove('gBezugskosten');
        }

        if (rabattInput > 0) {
            // Rabatt vorhanden - keine Änderung
        } else {
            SafeDOM.setAttr('warenwertUstRechnungsbetrag', 'transform', 'translate(0, -30)');
            if (gBezugskosten) {  // ← NUR wenn Element existiert
                gBezugskosten.setAttribute('transform', 'translate(0, -30)');
            }
        }
    }

    const elemWarenwert = document.getElementById('warenwert');
    const elemZwischensumme = document.getElementById('zwischensumme');
    if (elemWarenwert && warenwertUstRechnungsbetrag) {
        if (bezugskostenInput > 0 || rabattInput > 0) {
            // Bezugskosten oder Rabatt vorhanden - keine Änderung
        } else {
            elemWarenwert.remove();
            elemZwischensumme.remove();
            warenwertUstRechnungsbetrag.setAttribute('transform', 'translate(0, -60)');
        }
    }

    if (warenwertUstRechnungsbetrag_quer) {
        if (bezugskostenInput > 0) {
            // Ändere den Transform-Wert, um die Y-Position um 20 zu verringern
            warenwertUstRechnungsbetrag_quer.setAttribute('transform', 'translate(0, 0)');
        } else {
            // Setze den Transform-Wert auf den ursprünglichen Wert oder einen anderen Wert nach Bedarf
            warenwertUstRechnungsbetrag_quer.setAttribute('transform', 'translate(200, 0)');
            SafeDOM.remove('gBezugskosten');
        }
    }

    const inputLieferbedingung = document.getElementById("lieferbedingungInput");

    const elemBezugskostenBedingung = document.getElementById('bezugskostenBedingung');
    if (elemBezugskostenBedingung) {
        if (inputLieferbedingung && inputLieferbedingung.checked) {  // ← Prüfe auch inputLieferbedingung
            if (bezugskostenInput > 0) {
                elemBezugskostenBedingung.textContent = "ab Werk";
            } else {
                elemBezugskostenBedingung.textContent = "frei Haus";
            }
        } else {
            elemBezugskostenBedingung.textContent = "";
        }
    }

    const inputEigentumsvorbehalt = document.getElementById("eigentumsvorbehaltInput");
    const eigentumsvorbehalt = document.getElementById('Eigentumsvorbehalt');
    if (eigentumsvorbehalt) {
        if (inputEigentumsvorbehalt && inputEigentumsvorbehalt.checked) {  // ← Prüfe auch inputEigentumsvorbehalt
            // Eigentumsvorbehalt bleibt sichtbar
        } else {
            eigentumsvorbehalt.remove();
        }
    }


    // Laden der Daten für den Kontoauszug

    const kontoauszugNummer = document.getElementById('kontoauszugNummerInput').value;
    SafeDOM.setText('kontoauszugNummer', kontoauszugNummer);

    // Vorgang 1
    const kontoauszugVorgang1 = document.getElementById('kontoauszugVorgang1Input').value;
    SafeDOM.setText('kontoauszugVorgang1', kontoauszugVorgang1);

    const wert1Input = document.getElementById('kontoauszugWertstellung1Input').value;
    const wert1 = wert1Input ? parseFloat(wert1Input) : 0;
    SafeDOM.setText(
        'kontoauszugWertstellung1',
        wert1 !== 0 ? FormatHelper.currencyWithSign(wert1) : ''
    );

    // Vorgang 2
    const kontoauszugVorgang2 = document.getElementById('kontoauszugVorgang2Input').value;
    SafeDOM.setText('kontoauszugVorgang2', kontoauszugVorgang2);

    const wert2Input = document.getElementById('kontoauszugWertstellung2Input').value;
    const wert2 = wert2Input !== '' ? parseFloat(wert2Input) : 0;
    SafeDOM.setText(
        'kontoauszugWertstellung2',
        wert2 !== 0 ? FormatHelper.currencyWithSign(wert2) : ''
    );

    // Vorgang 3
    const kontoauszugVorgang3 = document.getElementById('kontoauszugVorgang3Input').value;
    SafeDOM.setText('kontoauszugVorgang3', kontoauszugVorgang3);

    const wert3Input = document.getElementById('kontoauszugWertstellung3Input').value;
    const wert3 = wert3Input ? parseFloat(wert3Input) : 0;
    SafeDOM.setText(
        'kontoauszugWertstellung3',
        wert3 !== 0 ? FormatHelper.currencyWithSign(wert3) : ''
    );

    // Alter Kontostand
    const kontostandAltInput = document.getElementById('kontoauszugKontostand_altInput').value;
    const kontostandAlt = kontostandAltInput ? parseFloat(kontostandAltInput) : 0;
    SafeDOM.setText(
        'kontoauszugKontostand_alt',
        kontostandAlt !== 0 ? FormatHelper.currencyWithSign(kontostandAlt) : ''
    );

    // Neuer Kontostand (berechnen + setzen)
    const kontostandNeu = kontostandAlt + wert1 + wert2 + wert3;
    SafeDOM.setText('kontoauszugKontostand_neu', FormatHelper.currencyWithSign(kontostandNeu));

    // Hilfsfunktion: Entfernt ein Element, wenn es existiert
    function removeIfExists(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.parentNode.removeChild(element);
        }
    }

    // Zeile 1 entfernen, wenn Vorgang UND Betrag leer sind
    if (wert1 === 0 && kontoauszugVorgang1.trim() === "") {
        removeIfExists('kontoauszugDatum1');
    }

    // Zeile 2 entfernen, wenn Vorgang UND Betrag leer sind
    if (wert2 === 0 && kontoauszugVorgang2.trim() === "") {
        removeIfExists('kontoauszugDatum2');
    }

    // Zeile 3 entfernen, wenn Vorgang UND Betrag leer sind
    if (wert3 === 0 && kontoauszugVorgang3.trim() === "") {
        removeIfExists('kontoauszugDatum3');
    }
    // Laden der Daten für die Mail / E-Mail-Vorschau


    const emailTextMessage = document.getElementById('emailInputText').value;
    SafeDOM.setText('emailTextMessage', emailTextMessage);

    const emailSubject = document.getElementById('emailSubjectInput').value;
    SafeDOM.setText('emailSubject', emailSubject);

    loadCompanyData(); // Laden der Kundeninformationen
    loadSupplierData(); // Laden der Lieferanteninformationen
    loadKontoauszugData() // Laden der Quittungsdaten
    loadEmailData() // Laden der E-Mail-Daten
    loadCompanyDataforEmail(); // Laden der E-Mail-Daten (Kunde)
}

async function quittungApplySVGholen() {
    await applyBelegWithSVG('quittung');
}

async function kassenbonApplySVGholen() {
    await applyBelegWithSVG('kassenbon');
}

async function journalApplySVGholen() {
    await applyBelegWithSVG('lohnjournal');
}

async function anlagenkarteApplySVGholen() {
    await applyBelegWithSVG('anlagenkarte');
}

async function wertpapiereApplySVGholen() {
    await applyBelegWithSVG('wertpapiere');
}

async function bescheidApplySVGholen() {
    await applyBelegWithSVG('bescheid');
}


// ============================================================================
// SPEZIALFUNKTIONEN
// ============================================================================
function zahlwort(zahl) {
    var sonderzahlen = [];
    sonderzahlen[11] = "elf";
    sonderzahlen[12] = "zwölf";
    sonderzahlen[16] = "sechzehn";
    sonderzahlen[17] = "siebzehn";

    var zahlen = [];
    zahlen[1] = "ein";
    zahlen[2] = "zwei";
    zahlen[3] = "drei";
    zahlen[4] = "vier";
    zahlen[5] = "fünf";
    zahlen[6] = "sechs";
    zahlen[7] = "sieben";
    zahlen[8] = "acht";
    zahlen[9] = "neun";
    zahlen[10] = "zehn";
    zahlen[20] = "zwanzig";
    zahlen[30] = "dreißig";
    zahlen[40] = "vierzig";
    zahlen[50] = "fünfzig";
    zahlen[60] = "sechzig";
    zahlen[70] = "siebzig";
    zahlen[80] = "achtzig";
    zahlen[90] = "neunzig";

    var einheiten = ["", "tausend", "Million", "Milliarde", "Billion"];
    var trennschritte = 1000;
    var zahlinworten = "";

    if (zahl == 0) zahlinworten = "null";
    for (var i = 0; i < Math.ceil(zahl.toString().length / 3); i++) {
        if (i > einheiten.length - 1) return "Zahl nicht unterstützt";
        if (i == 0) zahlenblock = zahl % trennschritte;
        else
            zahlenblock =
                ((zahl % trennschritte) - (zahl % (trennschritte / 1000))) /
                (trennschritte / 1000);
        einer = zahlenblock % 10;
        zehn = zahlenblock % 100;
        hunderter = (zahlenblock - (zahlenblock % 100)) / 100;
        einheitenendung = einheiten[i].substr(einheiten[i].length - 1, 1);

        if (zahlenblock > 0) {
            if (zahlenblock > 1 && einheitenendung == "n")
                zahlinworten = " " + einheiten[i] + "en " + zahlinworten;
            else if (zahlenblock > 1 && einheitenendung == "e")
                zahlinworten = " " + einheiten[i] + "n " + zahlinworten;
            else if (zahlenblock > 0 && i == 1)
                zahlinworten = einheiten[i] + zahlinworten;
            else zahlinworten = " " + einheiten[i] + " " + zahlinworten;
        }

        if (zehn > 0) {
            if (zehn == 1 && i == 0) zahlinworten = "eins" + zahlinworten;
            else if (zehn == 1 && i == 1) zahlinworten = "ein" + zahlinworten;
            else if (zehn == 1 && i > 1) zahlinworten = "eine" + zahlinworten;
            else if (sonderzahlen[zehn])
                zahlinworten = sonderzahlen[zehn] + zahlinworten;
            else {
                if (zehn > 9) zahlinworten = zahlen[zehn - einer] + zahlinworten;
                if (zehn > 20 && einer > 0) zahlinworten = "und" + zahlinworten;
                if (einer > 0) zahlinworten = zahlen[einer] + zahlinworten;
            }
        }

        if (hunderter > 0)
            zahlinworten = zahlen[hunderter] + "hundert" + zahlinworten;

        trennschritte *= 1000;
    }
    return zahlinworten.trim();
}

// Local Storage Status anzeigen
function updateLocalStorageStatus(message) {
    console.log('Local Storage Status:', message);
    // Optional: Status-Nachricht im UI anzeigen
    const statusElement = document.getElementById('localStorageStatus');
    if (statusElement) {
        statusElement.textContent = message;
    }
}

// ============================================================================
// UI-FUNKTIONEN
// ============================================================================
function updateColors() {

    let colorPicker = document.getElementById("colorPicker");
    let colorElements = document.querySelectorAll(".colorSVG");
    let textColorliefererInformationen2 = document.getElementById('liefererInformationen2')
    if (textColorliefererInformationen2 !== null) {
        textColorliefererInformationen2.setAttribute("fill", colorPicker.value);
    }
    else {
    }
    // Update the color of SVG elements and other elements with the color picker value
    colorElements.forEach(function (element) {
        if (element instanceof SVGElement) {
            element.setAttribute("fill", colorPicker.value);
        } else {
            element.style.backgroundColor = colorPicker.value;
        }
    });
    adjustTextColor();

}


// Initialisierung der Farben beim Laden des DOM
document.addEventListener("DOMContentLoaded", function () {
    let colorPicker = document.getElementById("colorPicker");
    colorPicker.addEventListener("input", updateColors);

});


// ============================================================================
// SVG/TEMPLATE-VERWALTUNG
// ============================================================================
function applySVGholen() {
    applySVG().then(() => {
        applyOrderData();
    });
}

function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return [r, g, b];
}

function calculateContrast(rgb1, rgb2) {
    const brightness1 = (rgb1[0] * 299 + rgb1[1] * 587 + rgb1[2] * 114) / 1000;
    const brightness2 = (rgb2[0] * 299 + rgb2[1] * 587 + rgb2[2] * 114) / 1000;

    const contrast = Math.abs(brightness1 - brightness2);

    return contrast;
}

function rgbToArray(rgb) {
    const result = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(rgb);
    return result ? [parseInt(result[1]), parseInt(result[2]), parseInt(result[3])] : [0, 0, 0];
}

function adjustTextColor() {
    const colorSVGElements = document.querySelectorAll('.colorSVG');
    const liefererInformationen = document.getElementById('liefererInformationen');
    const footerText = document.getElementById('footerText');
    let backgroundColorHex;
    let rgbBackground;

    if (liefererInformationen !== null) {

        // Überprüfe, ob das Element gefunden wurde, bevor die Hintergrundfarbe abgerufen wird
        if (colorSVGElements.length > 0) {
            // Nehme den Hex-Wert des ersten Rechtecks mit der Klasse "colorSVG"
            if (colorSVGElements[0] instanceof SVGElement) {
                backgroundColorHex = colorSVGElements[0].getAttribute('fill');
                rgbBackground = hexToRgb(backgroundColorHex);
            } else {
                rgbBackground = rgbToArray(colorSVGElements[0].style.backgroundColor);
            }
            let textColor;
            // Wandele den Hex-Wert in RGB um

            if (liefererInformationen instanceof SVGElement) {
                textColor = liefererInformationen.getAttribute('fill');
            } else {
                textColor = window.getComputedStyle(liefererInformationen).color;
            }
            // Überprüfe, ob RGB-Werte gültig sind
            if (rgbBackground && rgbBackground.length === 3) {
                let rgbText;
                rgbText = hexToRgb(textColor);
                if (rgbText && rgbText.length === 3) {
                    const contrast = calculateContrast(rgbBackground, rgbText);
                    const contrastThreshold = 100;
                    const newTextColor = contrast > contrastThreshold ? '#000' : '#fff';

                    // Setze die Textfarbe unabhängig von der vorherigen Bedingung
                    if (liefererInformationen instanceof SVGElement) {
                        liefererInformationen.setAttribute('fill', newTextColor);
                        footerText.setAttribute('fill', newTextColor);
                    } else {
                        liefererInformationen.style.color = newTextColor;
                        footerText.style.color = newTextColor;
                    }
                } else { }
            }
        } else {
            console.log("No elements found in colorSVGElements");
        }
    }
}

// newspaper

const applyChangesButton = document.getElementById('newspaperApplyChangesButton');

applyChangesButton.addEventListener('click', () => {
    const newspaperHeadlineInput = document.getElementById('newspaperHeadlineInput');
    const newspaperTextInput = document.getElementById('newspaperTextInput');
    const newspaperSourceInput = document.getElementById('newspaperSourceInput');



    document.getElementById('newspaperHeadline').innerText = newspaperHeadlineInput.value;
    document.getElementById('newspaperContent').innerText = newspaperTextInput.value;
    document.getElementById('newspaperSource').innerText = newspaperSourceInput.value;

});

const newspaperColumnRange = document.getElementById('newspaperColumnRange');
const newspaperColumnValue = document.getElementById('newspaperColumnValue');

newspaperColumnRange.addEventListener('input', () => {
    newspaperColumnValue.innerText = newspaperColumnRange.value;
    newspaperContent.style.columnCount = newspaperColumnRange.value;
});

const newspaperColorInput = document.getElementById('newspaperColorInput');
const newspaperDiv = document.getElementById('newspaperDiv');
newspaperColorInput.addEventListener('input', () => {
    newspaperDiv.style.backgroundColor = newspaperColorInput.value;
});

async function applySVG() {
    let selectedTemplate = document.getElementById("svgDropdown").value;
    let svgContainer = document.getElementById("rechnung1Container");

    // Laden der SVG-Vorlage und Aktualisieren des Containers
    try {
        let svgData = await loadSVGTemplate(selectedTemplate);
        svgContainer.innerHTML = svgData;
    } catch (error) {
        console.error("Fehler beim Anwenden der Daten:", error);
    }

    let selectedKontoauszug = document.getElementById("svgDropdownKontoauszug").value;
    let svgContainerKontoauszug = document.getElementById("kontoauszugContainer");

    // Laden der SVG-Vorlage und Aktualisieren des Containers
    try {
        let svgData = await loadSVGTemplate(selectedKontoauszug);
        svgContainerKontoauszug.innerHTML = svgData;
    } catch (error) {
        console.error("Fehler beim Anwenden der Daten:", error);
    }


    let selectedEmail = document.getElementById("svgDropdownEmail").value;
    let svgContainerEmail = document.getElementById("emailContainer");

    // Laden der SVG-Vorlage und Aktualisieren des Containers
    try {
        let svgData = await loadSVGTemplate(selectedEmail);
        svgContainerEmail.innerHTML = svgData;
    } catch (error) {
        console.error("Fehler beim Anwenden der Daten:", error);
    }

    let selectedQuittung = document.getElementById("svgDropdownQuittung").value;
    let svgContainerQuittung = document.getElementById("quittungContainer");

    // Laden der SVG-Vorlage und Aktualisieren des Containers
    try {
        let svgData = await loadSVGTemplate(selectedQuittung);
        svgContainerQuittung.innerHTML = svgData;
    } catch (error) {
        console.error("Fehler beim Anwenden der Daten:", error);
    }


}

async function loadSVGTemplate(templateName) {
    try {
        let templatePath = "templates/" + templateName;
        let response = await fetch(templatePath);
        let svgData = await response.text();
        return svgData;
    } catch (error) {
        console.error("Fehler beim Laden der SVG-Vorlage:", error);
    }
}


document.addEventListener('DOMContentLoaded', async (event) => {
    try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        initializeDropdownHandlers();
        applySVGholen();
    } catch (error) {
        console.error("Fehler beim Laden der SVG:", error);
    }
});


function toggleInput(inputId, checkboxId) {
    let inputElement = document.getElementById(inputId);
    let checkboxElement = document.getElementById(checkboxId);

    inputElement.disabled = checkboxElement.checked;
}

// Export

// ERSETZEN Sie die gesamte exportDokument Funktion:
const EXPORT_CONFIG = {
    kontoauszug: { id: 'kontoauszugContainer', name: 'kontoauszug' },
    rechnung: { id: 'rechnung1Container', name: 'rechnung' },
    quittung: { id: 'quittungContainer', name: 'quittung' },
    kassenbon: { id: 'kassenbonContainer', name: 'kassenbon' },
    lohnjournal: { id: 'lohnjournalContainer', name: 'lohnjournal' },
    email: { id: 'emailContainer', name: 'email' },
    newspaper: { id: 'newspaperContainer', name: 'newspaper' },
    lohnjournalBS: { id: 'lohnjournalBuchungssatzContainer', name: 'lohnjournalBuchungssatz' },
    bescheid: { id: 'bescheidContainer', name: 'bescheid' },
    anlagenkarte: { id: 'anlagenkarteContainer', name: 'anlagenkarte' },
    wertpapiere: { id: 'wertpapiereContainer', name: 'wertpapier' },
    lohnabrechnung: { id: 'lohnabrechnungContainer', name: 'lohnabrechnung' }
};

// ============================================================================
// EXPORT-FUNKTIONEN
// ============================================================================
function exportDokument(typ, format) {
    const config = EXPORT_CONFIG[typ];
    if (!config) {
        console.error('Unbekannter Dokumenttyp:', typ);
        return;
    }

    const filename = `${config.name}.${format === 'clipboard' ? 'svg' : format}`;

    switch (format) {
        case 'png':
            exportPNG(config.id, filename);
            break;
        case 'svg':
            exportSVG(config.id, filename);
            break;
        case 'clipboard':
            copyToClipboard(config.id);
            break;
        default:
            console.error('Unbekanntes Format:', format);
    }
}

function emailHerunterladen() {
    const emailHTML = document.getElementById('emailContainer').innerHTML.replace(/&nbsp;/g, ' ');;
    const blob = new Blob([emailHTML], { type: 'html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'email.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function newspaperHerunterladen() {
    const emailHTML = document.getElementById('newspaperContainer').innerHTML.replace(/&nbsp;/g, ' ');;
    const blob = new Blob([emailHTML], { type: 'html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'newspaper.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function lohnjournalBuchungssatzHerunterladen() {
    const emailHTML = document.getElementById('lohnjournalBuchungssatzContainer').innerHTML.replace(/&nbsp;/g, ' ');;
    const blob = new Blob([emailHTML], { type: 'html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'lohnjournalbuchungssatz.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}


let clipboardLohnjournal = new ClipboardJS('#officeButtonLohnjournalBuchungssatz');

clipboardLohnjournal.on('success', function (e) {
    console.log("Die Tabelle wurde in die Zwischenablage kopiert.");
    alert("Die Tabelle wurde in die Zwischenablage kopiert.");
});

clipboardLohnjournal.on('error', function (e) {
    console.error("Fehler beim Kopieren der Tabelle: ", e.action);
    alert("Fehler beim Kopieren der Tabelle.");
});

let clipboardNewspaper = new ClipboardJS('#officeButtonNewspaper');

clipboardNewspaper.on('success', function (e) {
    console.log("Die Tabelle wurde in die Zwischenablage kopiert.");
    alert("Die Tabelle wurde in die Zwischenablage kopiert.");
});

clipboardNewspaper.on('error', function (e) {
    console.error("Fehler beim Kopieren der Tabelle: ", e.action);
    alert("Fehler beim Kopieren der Tabelle.");
});


let clipboardEmail = new ClipboardJS('#officeButtonEmail');

clipboardEmail.on('success', function (e) {
    console.log("Die Tabelle wurde in die Zwischenablage kopiert.");
    alert("Die Tabelle wurde in die Zwischenablage kopiert.");
});

clipboardEmail.on('error', function (e) {
    console.error("Fehler beim Kopieren der Tabelle: ", e.action);
    alert("Fehler beim Kopieren der Tabelle.");
});


function validateInputs() {
    // Textfelder validieren
    for (const [inputId, rule] of Object.entries(VALIDATION_RULES.text)) {
        const input = document.getElementById(inputId);
        if (input && !isValidText(input.value, rule.max)) {
            alert(`Bitte geben Sie eine gültige ${rule.label} ein. Maximal ${rule.max} Zeichen!`);
            return false;
        }
    }

    // Zahlenfelder validieren
    for (const [inputId, rule] of Object.entries(VALIDATION_RULES.number)) {
        const input = document.getElementById(inputId);
        if (input && !isValidNumber(input.value, rule.min, rule.max)) {
            alert(`Bitte geben Sie bei ${rule.label} gültige Werte zwischen ${rule.min} und ${rule.max} ein.`);
            return false;
        }
    }

    // Prozentfelder validieren
    for (const [inputId, rule] of Object.entries(VALIDATION_RULES.percentage)) {
        const input = document.getElementById(inputId);
        if (input && !isValidPercentage(input.value)) {
            alert(`Bitte geben Sie bei ${rule.label} gültige Werte zwischen 0 und 100 ein.`);
            return false;
        }
    }

    // Spezielle Validierung: Gesamtpreis-Check
    const menge1 = parseFloat(document.getElementById('mengeInput')?.value || 0);
    const preis1 = parseFloat(document.getElementById('einzelpreisInput')?.value || 0);
    if (menge1 * preis1 > 999999999) {
        alert('Die Gesamtsumme (Menge * Einzelpreis) Pos. 1 darf nicht höher als 999.999.999,00 sein.');
        return false;
    }

    const menge2 = parseFloat(document.getElementById('mengeInput2')?.value || 0);
    const preis2 = parseFloat(document.getElementById('einzelpreisInput2')?.value || 0);
    if (menge2 * preis2 > 999999999) {
        alert('Die Gesamtsumme (Menge * Einzelpreis) Pos. 2 darf nicht höher als 999.999.999,00 sein.');
        return false;
    }

    return true;
}

// ============================================================================
// VALIDIERUNGS-KONFIGURATION
// ============================================================================

const VALIDATION_RULES = {
    // Textfelder mit Maximallänge
    text: {
        'artikelInput': { max: 32, label: 'Artikelbezeichnung Pos. 1' },
        'artikelInput2': { max: 32, label: 'Artikelbezeichnung Pos. 2' },
        'angebotLieferzeitInput': { max: 25, label: 'Lieferzeit' },
        'einheitInput': { max: 5, label: 'Einheit Pos. 1' },
        'einheitInput2': { max: 5, label: 'Einheit Pos. 2' },
        'kontoauszugVorgang1Input': { max: 45, label: 'Kontoauszug Vorgang 1' },
        'kontoauszugVorgang2Input': { max: 45, label: 'Kontoauszug Vorgang 2' },
        'kontoauszugVorgang3Input': { max: 45, label: 'Kontoauszug Vorgang 3' },
        'emailSubjectInput': { max: 100, label: 'E-Mail Betreff' },
        'emailInputText': { max: 5000, label: 'E-Mail Text' },
        'quittungZweckInput': { max: 50, label: 'Quittung Zweck' },
        'kassenbonZweckInput': { max: 50, label: 'Kassenbon Artikel' },
        'newspaperHeadlineInput': { max: 150, label: 'Zeitungs-Überschrift' },
        'newspaperTextInput': { max: 5000, label: 'Zeitungs-Text' },
        'newspaperSourceInput': { max: 150, label: 'Zeitungs-Quelle' },
        'anlagenkarteBezeichnungInput': { max: 20, label: 'Anlagenkarte Bezeichnung' },
        'wertpapiereBezeichnungInput': { max: 20, label: 'Wertpapiere Bezeichnung' },
        'wertpapiereISINInput': { max: 12, label: 'ISIN' },
        'jahr': { max: 4, label: 'Jahr (Rechnung)' },
        'jahrKontoauszug': { max: 6, label: 'Jahr (Kontoauszug)' },
        'jahrWertpapiere': { max: 6, label: 'Jahr (Wertpapiere)' }
    },

    // Zahlenfelder mit Min/Max
    number: {
        'mengeInput': { min: 0, max: 9999, label: 'Menge Pos. 1' },
        'mengeInput2': { min: 0, max: 9999, label: 'Menge Pos. 2' },
        'einzelpreisInput': { min: 0, max: 9999999, label: 'Einzelpreis Pos. 1' },
        'einzelpreisInput2': { min: 0, max: 9999999, label: 'Einzelpreis Pos. 2' },
        'bezugskostenInput': { min: 0, max: 9999999, label: 'Bezugskosten' },
        'zahlungszielInput': { min: 0, max: 365, label: 'Zahlungsziel' },
        'skontofristInput': { min: 0, max: 365, label: 'Skontofrist' },
        'kontoauszugKontostand_altInput': { min: -999999999, max: 999999999, label: 'Kontostand' },
        'quittungNettoInput': { min: 0, max: 9999, label: 'Quittung Nettobetrag' },
        'quittungUSTInput': { min: 0, max: 99, label: 'Quittung UST' },
        'kassenbonNettoInput': { min: 0, max: 9999, label: 'Kassenbon Nettobetrag' },
        'kassenbonUSTInput': { min: 0, max: 99, label: 'Kassenbon UST' },
        'anlagenkarteAnschaffungskostenInput': { min: 0, max: 999999, label: 'Anschaffungskosten' },
        'anlagenkarteNutzungsdauerInput': { min: 0, max: 99, label: 'Nutzungsdauer' },
        'wertpapiereStueckkursInput': { min: 1, max: 5000, label: 'Stückkurs' },
        'wertpapiereAnzahlInput': { min: 1, max: 5000, label: 'Wertpapiere Anzahl' },
        'bescheidMessbetragInput': { min: 0, max: 9999, label: 'Messbetrag' },
        'bescheidHebesatzInput': { min: 0, max: 999, label: 'Hebesatz' },
        'lohnabrechnungBruttoInput': { min: 0, max: 9999, label: 'Bruttogehalt' },
        'lohnabrechnungKVSatzInput': { min: 0, max: 20, label: 'KV-Satz' },
        'lohnabrechnungPVSatzInput': { min: 0, max: 5, label: 'PV-Satz' },
        'lohnabrechnungRVSatzInput': { min: 0, max: 20, label: 'RV-Satz' },
        'lohnabrechnungALVSatzInput': { min: 0, max: 10, label: 'ALV-Satz' },
    },

    // Prozentfelder
    percentage: {
        'rabattInput': { label: 'Rabatt' },
        'umsatzsteuerInput': { label: 'Umsatzsteuer' },
        'skontoInput': { label: 'Skonto' }
    }
};


// ============================================================================
// VALIDIERUNG
// ============================================================================

// Validierungs-Hilfsfunktionen
function isValidText(value, maxLength) {
    // Überprüfung auf HTML-Tags und Skripte
    const regex = /<.*?>/g;
    if (regex.test(value)) return false;

    // Leerer Wert ist gültig
    if (value.trim() === "") return true;

    // Längencheck
    return value.trim().length <= maxLength;
}

function isValidNumber(value, minValue, maxValue) {
    // Überprüfung auf HTML-Tags
    const regex = /<.*?>/g;
    if (regex.test(value)) return false;

    // Leerer Wert ist gültig
    if (value.trim() === "") return true;

    // Zahlencheck
    const numericValue = parseFloat(value);
    return !isNaN(numericValue) && numericValue >= minValue && numericValue <= maxValue;
}

function isValidPercentage(value) {
    return isValidNumber(value, 0, 100);
}






// ============================================================================
// BELEG-APPLY KONFIGURATION
// ============================================================================

const BELEG_APPLY_CONFIG = {
    quittung: {
        svgDropdown: 'svgDropdownQuittung',
        container: 'quittungContainer',
        jahrCheckbox: 'scriptJahrQuittung',
        jahrInput: 'jahrQuittung',
        jahrClass: 'aktuellesJahrQuittung',
        customDefs: 'customDefsQuittung',
        scriptId: 'customJsQuittung',
        scriptFunction: 'SVGonLoadQuittung',
        dataFunction: () => {
            // Quittung-spezifische Daten
            let quittungZweck = document.getElementById('quittungZweckInput').value;
            document.getElementById('quittungZweck').textContent = quittungZweck;

            const selectedTag = document.getElementById('tagQuittung').value;
            const selectedMonat = document.getElementById('monatQuittung').value;
            document.getElementById('quittungTag').textContent = selectedTag;
            document.getElementById('quittungMonat').textContent = selectedMonat;

            let quittungNetto = document.getElementById('quittungNettoInput').value || "0";
            quittungNetto = parseFloat(quittungNetto).toFixed(2);
            let [nettoVorKomma, nettoNachKomma] = quittungNetto.split('.');
            document.getElementById('quittungNetto').textContent = nettoVorKomma;
            document.getElementById('quittungNettoCent').textContent = nettoNachKomma;

            let quittungUST = document.getElementById('quittungUSTInput').value || "0";
            document.getElementById('quittungUST').textContent = quittungUST;

            let quittungUSTBetrag = parseFloat(quittungNetto) * parseFloat(quittungUST) / 100;
            quittungUSTBetrag = FormatHelper.roundToTwo(quittungUSTBetrag).toFixed(2);
            let [USTVorKomma, USTNachKomma] = quittungUSTBetrag.split('.');
            document.getElementById('quittungUSTBetrag').textContent = USTVorKomma;
            document.getElementById('quittungUSTBetragCent').textContent = USTNachKomma;

            let quittungSumme = (parseFloat(quittungUSTBetrag) + parseFloat(quittungNetto)).toFixed(2);
            let [summeVorKomma, summeNachKomma] = quittungSumme.split('.');
            document.getElementById('quittungSumme').textContent = summeVorKomma;
            document.getElementById('quittungSummeCent').textContent = summeNachKomma;

            const quittungInWorten = zahlwort(parseFloat(summeVorKomma));
            document.getElementById('quittungInWorten').textContent = quittungInWorten;

            loadQuittungData();
            loadCompanyDataforQuittung();
        }
    },
    kassenbon: {
        svgDropdown: 'svgDropdownKassenbon',
        container: 'kassenbonContainer',
        jahrCheckbox: 'scriptJahrKassenbon',
        jahrInput: 'jahrKassenbon',
        jahrClass: 'aktuellesJahrKassenbon',
        customDefs: 'customDefsKassenbon',
        scriptId: 'customJsKassenbon',
        scriptFunction: 'SVGonLoadKassenbon',
        dataFunction: () => {
            let kassenbonZweck = document.getElementById('kassenbonZweckInput').value;
            document.getElementById('kassenbonZweck').textContent = kassenbonZweck;

            const selectedTag = document.getElementById('tagKassenbon').value;
            const selectedMonat = document.getElementById('monatKassenbon').value;
            document.getElementById('kassenbonTag').textContent = selectedTag;
            document.getElementById('kassenbonMonat').textContent = selectedMonat;
            document.getElementById('kassenbonUhrzeit').textContent = RandomHelper.time() + ' Uhr';
            document.getElementById('kassenbonTransaktionsnummer').textContent = RandomHelper.sevenDigit();

            let kassenbonNetto = document.getElementById('kassenbonNettoInput').value || "0";
            document.getElementById('kassenbonNetto').textContent = FormatHelper.currency(kassenbonNetto);

            let kassenbonUST = document.getElementById('kassenbonUSTInput').value || "0";
            document.getElementById('kassenbonUST').textContent = kassenbonUST;

            let kassenbonUSTBetrag = FormatHelper.roundToTwo(kassenbonNetto * kassenbonUST / 100);
            document.getElementById('kassenbonUSTBetrag').textContent = FormatHelper.currency(kassenbonUSTBetrag);

            let kassenbonBrutto = parseFloat(kassenbonNetto) + parseFloat(kassenbonUSTBetrag);
            let kassenbonBruttoElements = Array.from(document.getElementsByClassName('kassenbonBrutto'));
            kassenbonBruttoElements.forEach(element => {
                element.textContent = FormatHelper.currency(kassenbonBrutto);
            });

            let kassenbonZahlungsart = document.getElementById('kassenbonDropdownZahlungsart').value;
            document.getElementById('kassenbonZahlungsart').textContent = kassenbonZahlungsart;

            loadKassenbonData();
            loadCompanyDataforKassenbon();
        }
    },

    // HINZUFÜGEN nach kassenbon (in BELEG_APPLY_CONFIG):
    anlagenkarte: {
        svgDropdown: 'svgDropdownAnlagenkarte',
        container: 'anlagenkarteContainer',
        jahrCheckbox: 'scriptJahrAnlagenkarte',
        jahrInput: 'jahrAnlagenkarte',
        jahrClass: 'aktuellesJahrAnlagenkarte',
        customDefs: 'customDefsAnlagenkarte',
        scriptId: 'customJsAnlagenkarte',
        scriptFunction: 'SVGonLoadAnlagenkarte',
        dataFunction: () => {
            const bezeichnung = document.getElementById('anlagenkarteBezeichnungInput').value;
            document.getElementById('anlagenkarteBezeichnung').textContent = bezeichnung;

            const anlagekonto = document.getElementById('anlagenkarteAnlagenkontoInput').value;
            document.getElementById('anlagenkarteAnlagenkonto').textContent = anlagekonto;

            const anschaffungskosten = document.getElementById('anlagenkarteAnschaffungskostenInput').value;
            document.getElementById('anlagenkarteAnschaffungskosten').textContent = FormatHelper.currency(anschaffungskosten);

            const nutzungsdauer = document.getElementById('anlagenkarteNutzungsdauerInput').value;
            document.getElementById('anlagenkarteNutzungsdauer').textContent = nutzungsdauer;

            const tag = document.getElementById('tagAnlagenkarte').value;
            const monat = document.getElementById('monatAnlagenkarte').value;
            document.getElementById('anlagenkarteTag').textContent = tag;
            document.getElementById('anlagenkarteMonat').textContent = monat;

            loadAnlagenkarteData();
        }
    },
    wertpapiere: {
        svgDropdown: 'svgDropdownWertpapiere',
        container: 'wertpapiereContainer',
        jahrCheckbox: 'scriptJahrWertpapiere',
        jahrInput: 'jahrWertpapiere',
        jahrClass: 'aktuellesJahrWertpapiere',
        customDefs: 'customDefsWertpapiere',
        scriptId: 'customJsWertpapiere',
        scriptFunction: 'SVGonLoadWertpapiere',
        dataFunction: () => {
            const bezeichnung = document.getElementById('wertpapiereBezeichnungInput').value;
            document.getElementById('wertpapiereBezeichnung').textContent = bezeichnung;

            const isin = document.getElementById('wertpapiereISINInput').value;
            document.getElementById('wertpapiereISIN').textContent = isin;

            const stueckkurs = document.getElementById('wertpapiereStueckkursInput').value;
            document.getElementById('wertpapiereStueckkurs').textContent = FormatHelper.currency(stueckkurs);

            const anzahl = document.getElementById('wertpapiereAnzahlInput').value;
            document.getElementById('wertpapiereAnzahl').textContent = anzahl;

            let kurswert = anzahl * stueckkurs;
            let spesen = kurswert * 0.01;
            let banklastschrift = kurswert + spesen;
            let bankgutschrift = kurswert - spesen;

            document.getElementById('wertpapiereKurswert').textContent = FormatHelper.currency(kurswert);
            document.getElementById('wertpapiereSpesen').textContent = FormatHelper.currency(spesen);
            document.getElementById('wertpapiereUhrzeit').textContent = RandomHelper.time() + ' Uhr';

            const artInput = document.getElementById('wertpapiereArtInput');
            if (artInput.value === 'wertpapiereKauf') {
                document.getElementById('wertpapiereArt').textContent = 'gekauft';
                document.getElementById('wertpapiereBanklastschrift').textContent = FormatHelper.currency(banklastschrift);
                document.getElementById('wertpapiereSpesenart').textContent = "+ 1 % Spesen";
                document.getElementById('wertpapiereBankart').textContent = "Banklastschrift";
            } else {
                document.getElementById('wertpapiereArt').textContent = 'verkauft';
                document.getElementById('wertpapiereBanklastschrift').textContent = FormatHelper.currency(bankgutschrift);
                document.getElementById('wertpapiereSpesenart').textContent = "- 1 % Spesen";
                document.getElementById('wertpapiereBankart').textContent = "Bankgutschrift";
            }

            const tag = document.getElementById('tagWertpapiereInput').value;
            const monat = document.getElementById('monatWertpapiereInput').value;
            document.getElementById('wertpapiereTag').textContent = tag;
            document.getElementById('wertpapiereMonat').textContent = monat;

            // Auftragsnummer
            let lastNum = parseInt(tag + monat);
            let timestamp = new Date().getTime();
            lastNum = Math.max(lastNum + 1, timestamp);
            let shortened = lastNum.toString().slice(6);
            document.getElementById('wertpapiereAuftragsnummer').textContent = parseInt(shortened, 10);

            loadWertpapiereData();
        }
    },
    bescheid: {
        svgDropdown: 'svgDropdownBescheid',
        container: 'bescheidContainer',
        jahrCheckbox: 'scriptJahrBescheid',
        jahrInput: 'jahrBescheid',
        jahrClass: 'aktuellesJahrBescheid',
        customDefs: 'customDefsBescheid',
        scriptId: 'customJsBescheid',
        scriptFunction: 'SVGonLoadBescheid',
        dataFunction: () => {
            const tag = document.getElementById('tagBescheid').value;
            const monat = document.getElementById('monatBescheid').value;
            document.getElementById('bescheidTag').textContent = tag;
            document.getElementById('bescheidMonat').textContent = monat;

            // Grundsteuer
            const messbetrag = document.getElementById('bescheidMessbetragInput').value;
            const hebesatz = document.getElementById('bescheidHebesatzInput').value;

            const messbetragElem = document.getElementById('bescheidMessbetrag');
            if (messbetragElem) messbetragElem.textContent = FormatHelper.currency(messbetrag);

            const hebesatzElem = document.getElementById('bescheidHebesatz');
            if (hebesatzElem) hebesatzElem.textContent = hebesatz + " %";

            const jahressteuerElem = document.getElementById('bescheidJahressteuer');
            if (jahressteuerElem) {
                const jahressteuer = parseFloat(messbetrag) * (parseFloat(hebesatz) / 100);
                jahressteuerElem.textContent = FormatHelper.currency(jahressteuer);

                const rate = FormatHelper.currency(jahressteuer / 4);
                const rateElements = document.getElementsByClassName('bescheidRate');
                for (const element of rateElements) {
                    element.textContent = rate;
                }
            }

            // Abfallentsorgung
            const abfallgebuehr = document.getElementById('bescheidAbfallgebuehrInput').value;
            const abfallgebuehrElem = document.getElementById('bescheidAbfallgebuehr');
            if (abfallgebuehrElem) abfallgebuehrElem.textContent = FormatHelper.currency(abfallgebuehr);

            const abfallbezeichnung = document.getElementById('bescheidAbfallbezeichnungInput').value;
            const abfallbezeichnungElem = document.getElementById('bescheidAbfallbezeichnung');
            if (abfallbezeichnungElem) abfallbezeichnungElem.textContent = abfallbezeichnung;

            loadBescheidData();
        }
    },
    // HINZUFÜGEN nach bescheid (in BELEG_APPLY_CONFIG):
    lohnjournal: {
        svgDropdown: 'svgDropdownLohnjournal',
        container: 'lohnjournalContainer',
        jahrCheckbox: null, // Kein Jahr-Script
        jahrInput: null,
        jahrClass: null,
        customDefs: null,
        scriptId: null,
        scriptFunction: null,
        dataFunction: () => {
            // Mitarbeiter-Array
            const mitarbeiter = [
                { name: "Smith, John", freibetrag: "0", steuerklasse: "I" },
                { name: "Garcia, Maria", freibetrag: "0", steuerklasse: "IV" },
                { name: "Müller, Hans", freibetrag: "0", steuerklasse: "I" },
                { name: "Nguyen, Linh", freibetrag: "0", steuerklasse: "III" },
                { name: "Andersen, Erik", freibetrag: "0", steuerklasse: "I" },
                { name: "Choi, Hye-jin", freibetrag: "0", steuerklasse: "IV" },
                { name: "Gomez, Juan", freibetrag: "0", steuerklasse: "I" },
                { name: "Abdullah, Fatima", freibetrag: "0", steuerklasse: "III" },
                { name: "Bauer, Stephan", freibetrag: "0", steuerklasse: "III" },
                { name: "Kovács, István", freibetrag: "0", steuerklasse: "I" },
                { name: "Santos, Sofia", freibetrag: "0", steuerklasse: "IV" },
                { name: "Ali, Ahmed", freibetrag: "0,5", steuerklasse: "I" },
                { name: "Hernandez, Carla", freibetrag: "0,5", steuerklasse: "III" },
                { name: "Novák, Katarina", freibetrag: "0,5", steuerklasse: "IV" },
                { name: "Fischer, Tobias", freibetrag: "0,5", steuerklasse: "I" },
                { name: "Silva, Pedro", freibetrag: "0,5", steuerklasse: "III" },
                { name: "Park, Min-woo", freibetrag: "2,0", steuerklasse: "IV" },
                { name: "Zhang, Wei", freibetrag: "2,0", steuerklasse: "I" },
                { name: "Molina, Ana", freibetrag: "2,0", steuerklasse: "III" },
                { name: "Schneider, Maria", freibetrag: "2,0", steuerklasse: "IV" },
                { name: "Mikhailova, Elena", freibetrag: "2,0", steuerklasse: "I" }
            ];

            // Hilfsfunktionen
            const chooseRandom = (liste, anzahl) => {
                const result = [];
                const copy = [...liste];
                for (let i = 0; i < anzahl; i++) {
                    const index = Math.floor(Math.random() * copy.length);
                    result.push(copy.splice(index, 1)[0]);
                }
                return result;
            };

            const genBruttogehalt = () => Math.round((Math.random() * 4000) + 2000) / 100 * 100;

            const berechneSteuern = (brutto, steuerklasse) => {
                const satz = { "I": 0.19, "III": 0.11, "IV": 0.14 }[steuerklasse] || 0;
                return brutto * satz;
            };

            const berechneSozialversicherung = (brutto) => brutto * 0.389;

            // 3 zufällige Mitarbeiter
            const ausgewählt = chooseRandom(mitarbeiter, 3);

            for (let i = 0; i < 3; i++) {
                const elem = document.getElementById(`lohnjournalArbeitnehmer${i + 1}`);
                if (elem) {
                    elem.textContent = `${ausgewählt[i].name} (${ausgewählt[i].steuerklasse}/${ausgewählt[i].freibetrag})`;
                }

                const brutto = genBruttogehalt();
                const steuern = berechneSteuern(brutto, ausgewählt[i].steuerklasse);
                const sv = berechneSozialversicherung(brutto);
                const anBeitrag = sv * 0.5;
                const agBeitrag = sv * 0.5;
                const netto = brutto - steuern - anBeitrag;

                const setBrutto = document.getElementById(`lohnjournalBrutto${i + 1}`);
                if (setBrutto) setBrutto.textContent = FormatHelper.currency(brutto.toFixed(2));

                const setSteuern = document.getElementById(`lohnjournalSteuern${i + 1}`);
                if (setSteuern) setSteuern.textContent = FormatHelper.currency(steuern.toFixed(2));

                const setAN = document.getElementById(`lohnjournalAN${i + 1}`);
                if (setAN) setAN.textContent = FormatHelper.currency(anBeitrag.toFixed(2));

                const setAG = document.getElementById(`lohnjournalAG${i + 1}`);
                if (setAG) setAG.textContent = FormatHelper.currency(agBeitrag.toFixed(2));

                const setNetto = document.getElementById(`lohnjournalNetto${i + 1}`);
                if (setNetto) setNetto.textContent = FormatHelper.currency(netto.toFixed(2));
            }

            // Summen berechnen
            const anzahlMitarbeiter = Math.floor(Math.random() * 31) + 15; // 15-45
            let summeBrutto = 0;
            for (let i = 0; i < anzahlMitarbeiter; i++) {
                summeBrutto += genBruttogehalt();
            }

            const summeSteuern = berechneSteuern(summeBrutto, "IV");
            const summeSV = berechneSozialversicherung(summeBrutto);
            const summeANBeitrag = summeSV * 0.5;
            const summeAGBeitrag = summeSV * 0.5;
            const summeNetto = summeBrutto - summeSteuern - summeANBeitrag;

            const setBruttoSumme = document.getElementById('lohnjournalBrutto4');
            if (setBruttoSumme) setBruttoSumme.textContent = FormatHelper.currency(summeBrutto.toFixed(2));

            const setSteuernSumme = document.getElementById('lohnjournalSteuern4');
            if (setSteuernSumme) setSteuernSumme.textContent = FormatHelper.currency(summeSteuern.toFixed(2));

            const setANSumme = document.getElementById('lohnjournalAN4');
            if (setANSumme) setANSumme.textContent = FormatHelper.currency(summeANBeitrag.toFixed(2));

            const setAGSumme = document.getElementById('lohnjournalAG4');
            if (setAGSumme) setAGSumme.textContent = FormatHelper.currency(summeAGBeitrag.toFixed(2));

            const setNettoSumme = document.getElementById('lohnjournalNetto4');
            if (setNettoSumme) setNettoSumme.textContent = FormatHelper.currency(summeNetto.toFixed(2));

            // Zufälliger Monat
            const monate = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
            const monatElem = document.getElementById('lohnjournalMonat');
            if (monatElem) monatElem.textContent = monate[Math.floor(Math.random() * monate.length)];

            // Buchungssatz-Tabelle
            let output = '<h3>Aufgabe</h3>';
            output += '<p>Von der Personalabteilung liegt der folgende Belegauszug vor. Bilde die Buchungssätze für die Erfassung des gesamten Personalaufwands, wenn die Auszahlung per Banküberweisung erfolgt.</p>';
            output += '<h3>Lösung</h3>';
            output += '<table style="border: 1px solid #ccc;white-space:nowrap;background-color:#fff;font-family:courier;min-width:550px;margin:0 0 6px;"><tbody>';
            output += '<tr>';
            output += `<td style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:145px;min-width:120px" tabindex="1">6200 LG</td>`;
            output += `<td style="text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px;min-width:120px" tabindex="1">${FormatHelper.currency(summeBrutto.toFixed(2))}</td>`;
            output += '<td style="text-align:center;width:100px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:50px" tabindex="1">an</td>';
            output += '<td style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:145px;min-width:120px;text-align:left" tabindex="1">2800 BK</td>';
            output += `<td style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:145px;min-width:120px;text-align:right" tabindex="1">${FormatHelper.currency(summeNetto.toFixed(2))}</td>`;
            output += '</tr><tr>';
            output += '<td style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:145px;min-width:120px"></td>';
            output += '<td style="text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px;min-width:120px"></td>';
            output += '<td style="text-align:center;width:100px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:50px"></td>';
            output += '<td style="text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px;min-width:120px" tabindex="1">4830 VFA</td>';
            output += `<td style="text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px;min-width:120px" tabindex="1">${FormatHelper.currency(summeSteuern.toFixed(2))}</td>`;
            output += '</tr><tr>';
            output += '<td style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:145px;min-width:120px"></td>';
            output += '<td style="text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px;min-width:120px"></td>';
            output += '<td style="text-align:center;width:100px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:50px"></td>';
            output += '<td style="text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px;min-width:120px" tabindex="1">4840 VSV</td>';
            output += `<td style="text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px;min-width:120px" tabindex="1">${FormatHelper.currency(summeANBeitrag.toFixed(2))}</td>`;
            output += '</tr></tbody></table>';
            output += '<table style="border: 1px solid #ccc;white-space:nowrap;background-color:#fff;font-family:courier;min-width:550px;margin:0 0 6px;"><tbody><tr>';
            output += '<td style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:145px;min-width:120px" tabindex="1">6400 AGASV</td>';
            output += '<td style="text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px;min-width:120px"></td>';
            output += '<td style="text-align:center;width:100px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:50px" tabindex="1">an</td>';
            output += '<td style="text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px;min-width:120px" tabindex="1">4840 VSV</td>';
            output += `<td style="text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px;min-width:120px" tabindex="1">${FormatHelper.currency(summeAGBeitrag.toFixed(2))}</td>`;
            output += '</tr></tbody></table>';

            document.getElementById('lohnjournalBuchungssatzContainer').innerHTML = output;

            loadLohnjournalData();
        }
    }
};

// Generische Beleg-Apply-Funktion
async function applyBelegWithSVG(belegType) {
    if (!validateInputs()) return;

    const config = BELEG_APPLY_CONFIG[belegType];
    if (!config) {
        console.error('Unbekannter Belegtyp:', belegType);
        return;
    }

    // 1. SVG-Template laden
    const selectedTemplate = document.getElementById(config.svgDropdown)?.value;
    const container = document.getElementById(config.container);

    if (selectedTemplate && container) {
        try {
            const svgData = await loadSVGTemplate(selectedTemplate);
            container.innerHTML = svgData;
        } catch (error) {
            console.error("Fehler beim Laden der SVG-Vorlage:", error);
            return;
        }
    }

    // 2. Beleg-spezifische Daten setzen
    if (config.dataFunction) {
        config.dataFunction();
    }

    // 3. Jahr-Script handhaben
    handleYearScript(config);
}

// Jahr-Script Handling (wiederverwendbar)
function handleYearScript(config) {
    if (!config.jahrCheckbox) return; // Kein Jahr-Handling nötig

    const useScript = document.getElementById(config.jahrCheckbox)?.checked;

    if (!useScript) {
        // Manuelle Jahreseingabe
        const jahrInput = document.getElementById(config.jahrInput);
        const yearElements = document.querySelectorAll(`.${config.jahrClass}`);
        yearElements.forEach(element => {
            element.textContent = jahrInput?.value || '';
        });
    } else {
        // Dynamisches Script
        const customDefs = document.getElementById(config.customDefs);
        const existingScript = document.getElementById(config.scriptId);

        if (existingScript) existingScript.remove();

        if (customDefs) {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.id = config.scriptId;
            script.text = `
                function getCurrentYear() {
                    return new Date().getFullYear();
                }
                
                function ${config.scriptFunction}() {
                    const currentYear = getCurrentYear();
                    const elements = document.querySelectorAll('.${config.jahrClass}');
                    elements.forEach(element => {
                        element.textContent = currentYear;
                    });
                }
            `;
            customDefs.appendChild(script);

            // Funktion sofort ausführen
            eval(script.text);
            if (typeof window[config.scriptFunction] === 'function') {
                window[config.scriptFunction]();
            }
        } else {
            // Falls customDefs nicht existiert, Script an body anhängen
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.id = config.scriptId;
            script.text = `
                function getCurrentYear() {
                    return new Date().getFullYear();
                }
                
                function ${config.scriptFunction}() {
                    const currentYear = getCurrentYear();
                    const elements = document.querySelectorAll('.${config.jahrClass}');
                    elements.forEach(element => {
                        element.textContent = currentYear;
                    });
                }
            `;
            document.body.appendChild(script);
            eval(script.text);
            if (typeof window[config.scriptFunction] === 'function') {
                window[config.scriptFunction]();
            }
        }
    }


}

/// ============================================================================
// LOHNABRECHNUNG
// ============================================================================
const MITARBEITER_DATEN = {
    vornamen: {
        m: [
            'Max', 'Alexander', 'Thomas', 'Michael', 'Andreas', 'Stefan', 'Christian', 'Daniel', 'Sebastian', 'Markus',
            'Ahmet', 'Mehmet', 'Ali', 'Emre', 'Yusuf', 'Hassan', 'Omar', 'Ivan', 'Dimitri', 'Carlos'
        ],
        w: [
            'Anna', 'Maria', 'Laura', 'Sarah', 'Julia', 'Lisa', 'Sophie', 'Hannah', 'Lena', 'Emma', 'Aylin', 'Fatima', 'Zeynep',
            'Mariam', 'Leila', 'Elena', 'Natalia', 'Sofia', 'Irina', 'Ana'
        ]
    },

    nachnamen: [
        // deutsch
        'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann',
        'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun',
        'Yılmaz', 'Demir', 'Kaya', 'Haddad', 'Khan', 'Hussein', 'Petrov', 'Ivanov', 'Smirnov', 'Garcia', 'Martinez', 'Lopez',
        'Nowak', 'Kowalski'
    ],

    strassen: [
        'Hauptstraße', 'Bahnhofstraße', 'Kirchstraße', 'Gartenstraße', 'Schulstraße', 'Bergstraße',
        'Dorfstraße', 'Lindenstraße', 'Ringstraße', 'Waldstraße'
    ],

    banken: [
        'Sparkasse', 'Volksbank', 'Commerzbank', 'Deutsche Bank', 'Postbank', 'HypoVereinsbank'
    ]
};


// Zufällige Mitarbeiterdaten generieren
function generateMitarbeiterDaten() {
    const geschlecht = Math.random() > 0.5 ? 'm' : 'w';
    const vorname = MITARBEITER_DATEN.vornamen[geschlecht][Math.floor(Math.random() * MITARBEITER_DATEN.vornamen[geschlecht].length)];
    const nachname = MITARBEITER_DATEN.nachnamen[Math.floor(Math.random() * MITARBEITER_DATEN.nachnamen.length)];
    const strasse = MITARBEITER_DATEN.strassen[Math.floor(Math.random() * MITARBEITER_DATEN.strassen.length)];
    const hausnummer = Math.floor(Math.random() * 150) + 1;
    const bank = MITARBEITER_DATEN.banken[Math.floor(Math.random() * MITARBEITER_DATEN.banken.length)];

    // Personalnummer
    const personalnr = String(Math.floor(Math.random() * 90000) + 10000) + '-' + String(Math.floor(Math.random() * 90) + 10);

    // Geburtsdatum (zwischen 25 und 60 Jahren)
    const alter = Math.floor(Math.random() * 36) + 25;
    const jahr = new Date().getFullYear() - alter;
    const monat = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const tag = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    const geburtsdatum = `${tag}.${monat}.${jahr.toString().slice(2)}`;

    // Eintrittsdatum (zwischen 1 und 15 Jahren zurück)
    const dienstjahre = Math.floor(Math.random() * 15) + 1;
    const eintrittJahr = new Date().getFullYear() - dienstjahre;
    const eintrittMonat = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const eintrittTag = '01';
    const eintrittsdatum = `${eintrittTag}.${eintrittMonat}.${eintrittJahr.toString().slice(2)}`;

    // Steuer-ID (11-stellig)
    const steuerID = String(Math.floor(Math.random() * 90000000000) + 10000000000);

    // IBAN (DE + 20 Ziffern)
    const iban = 'DE' + String(Math.floor(Math.random() * 90) + 10) + ' ' +
        String(Math.floor(Math.random() * 9000) + 1000) + ' ' +
        String(Math.floor(Math.random() * 9000) + 1000) + ' ' +
        String(Math.floor(Math.random() * 9000) + 1000) + ' ' +
        String(Math.floor(Math.random() * 9000) + 1000) + ' ' +
        String(Math.floor(Math.random() * 90) + 10);

    return {
        name: `${nachname}, ${vorname}`,
        strasse: `${strasse} ${hausnummer}`,
        personalnr: personalnr,
        geburtsdatum: geburtsdatum,
        eintrittsdatum: eintrittsdatum,
        steuerID: steuerID,
        bank: bank,
        iban: iban
    };
}

// Lohnsteuer-Berechnung (vereinfacht nach Grundtabelle 2024)
function berechneLohnsteuer(brutto, steuerklasse, kinderfreibetrag = "0") {
    const jahresbrutto = brutto * 12;

    function estGrundtarif(zvE) {
        // Grundfreibetrag
        const grundfreibetrag = 12096;

        if (zvE <= grundfreibetrag) {
            return 0;
        }

        // Progressionszone 1
        if (zvE <= 17443) {
            const y = (zvE - grundfreibetrag) / 10000;
            return (979.18 * y + 1400) * y;
        }

        // Progressionszone 2
        if (zvE <= 68480) {
            const z = (zvE - 17443) / 10000;
            return (192.59 * z + 2397) * z + 966.53;
        }

        // Proportionalzone
        if (zvE <= 277825) {
            return 0.42 * zvE - 10911.92;
        }

        // Reichensteuer
        return 0.45 * zvE - 19246.67;
    }

    function estSplittingtarif(zvE) {
        const halb = zvE / 2;
        return estGrundtarif(halb) * 2;
    }

    let jahressteuer = 0;

    switch (steuerklasse) {
        case "I":
        case "IV":
            jahressteuer = estGrundtarif(jahresbrutto);
            break;

        case "II":
            // Entlastungsbetrag für Alleinerziehende (vereinfacht)
            const entlastung = 4260;
            jahressteuer = estGrundtarif(Math.max(0, jahresbrutto - entlastung));
            break;

        case "III":
            jahressteuer = estSplittingtarif(jahresbrutto);
            break;

        case "V":
            // Näherung: Gegenstück zu III
            jahressteuer = estGrundtarif(jahresbrutto) * 1.25;
            break;

        case "VI":
            // Zweitjob ohne Freibeträge
            jahressteuer = estGrundtarif(jahresbrutto) * 1.1;
            break;
    }

    // Kinderfreibetrag (vereinfacht monatliche Wirkung)
    const freibetrag = parseFloat(kinderfreibetrag.replace(",", ".")) || 0;
    jahressteuer -= freibetrag * 12 * 250;

    jahressteuer = Math.max(0, jahressteuer);

    const monatlicheLohnsteuer = jahressteuer / 12;

    return FormatHelper.roundToTwo(monatlicheLohnsteuer);
}

// Firma laden
function loadLohnabrechnungFirma() {
    loadBelegData('lohnabrechnungFirma', 'datenLohnabrechnung');
}

// Hauptfunktion: Lohnabrechnung erstellen
async function lohnabrechnungApplySVGholen() {
    if (!validateInputs()) return;

    // SVG laden
    let selectedQuittung = document.getElementById("svgDropdownLohnabrechnung").value;
    const container = document.getElementById('lohnabrechnungContainer');
    try {
        const svgData = await loadSVGTemplate(selectedQuittung);
        container.innerHTML = svgData;
    } catch (error) {
        console.error("Fehler beim Laden der SVG-Vorlage:", error);
        return;
    }

    // Firmendaten laden
    loadLohnabrechnungFirma();

    // Mitarbeiterdaten generieren
    const mitarbeiter = generateMitarbeiterDaten();
    document.getElementById('lohnabrechnungMitarbeiterName').textContent = mitarbeiter.name;
    document.getElementById('lohnabrechnungMitarbeiterStrasse').textContent = mitarbeiter.strasse;
    document.getElementById('lohnabrechnungPersonalnr').textContent = mitarbeiter.personalnr;
    document.getElementById('lohnabrechnungGeburtsdatum').textContent = mitarbeiter.geburtsdatum;
    document.getElementById('lohnabrechnungEintrittsdatum').textContent = mitarbeiter.eintrittsdatum;
    document.getElementById('lohnabrechnungSteuerID').textContent = mitarbeiter.steuerID;
    document.getElementById('lohnabrechnungBank').textContent = mitarbeiter.bank;
    document.getElementById('lohnabrechnungIBAN').textContent = mitarbeiter.iban;

    // Monat
    const monat = document.getElementById('lohnabrechnungMonatInput').value;
    document.getElementById('lohnabrechnungMonat').textContent = monat;

    // Steuerliche Daten
    const steuerklasse = document.getElementById('lohnabrechnungSteuerklasseInput').value;
    const kinderfreibetrag = document.getElementById('lohnabrechnungKinderfreibetragInput').value;
    const religion = document.getElementById('lohnabrechnungKirchensteuerInput').checked
        ? (Math.random() < 0.5 ? 'röm.-kath.' : 'evangelisch')
        : 'keine';

    document.getElementById('lohnabrechnungSteuerklasse').textContent = steuerklasse;
    document.getElementById('lohnabrechnungKinderfreibetrag').textContent = kinderfreibetrag;
    document.getElementById('lohnabrechnungReligion').textContent = religion;

    // Brutto
    const brutto = parseFloat(document.getElementById('lohnabrechnungBruttoInput').value);
    document.getElementById('lohnabrechnungBrutto').textContent = FormatHelper.currency(brutto);

    // Lohnsteuer: Automatisch berechnen ODER manuellen Wert behalten
    const lohnsteuerGesperrt = document.getElementById('lohnabrechnungLohnsteuerSperreInput').checked;

    if (!lohnsteuerGesperrt) {
        // Entsperrt: Neu berechnen
        const lohnsteuerBerechnet = berechneLohnsteuer(brutto, steuerklasse, kinderfreibetrag);
        document.getElementById('lohnabrechnungLohnsteuerInput').value = lohnsteuerBerechnet.toFixed(2);
    }
    // Sonst: Gesperrt - manueller Wert bleibt im Input-Feld

    // Wert aus dem Input-Feld verwenden
    const lohnsteuer = parseFloat(document.getElementById('lohnabrechnungLohnsteuerInput').value);
    document.getElementById('lohnabrechnungLohnsteuer').textContent = FormatHelper.currency(lohnsteuer);

    // Solidaritätszuschlag
    const soliAktiv = document.getElementById('lohnabrechnungSoliInput').checked;
    const soli = soliAktiv ? FormatHelper.roundToTwo(lohnsteuer * 0.055) : 0;
    document.getElementById('lohnabrechnungSoli').textContent = soliAktiv ? FormatHelper.currency(soli) : '0,00 €';

    // Kirchensteuer
    const kirchensteuerAktiv = document.getElementById('lohnabrechnungKirchensteuerInput').checked;
    const kirchensteuer = kirchensteuerAktiv ? FormatHelper.roundToTwo(lohnsteuer * 0.08) : 0;
    document.getElementById('lohnabrechnungKirchensteuer').textContent = kirchensteuerAktiv ? FormatHelper.currency(kirchensteuer) : '0,00 €';

    // Steuerabzüge gesamt
    const steuerGesamt = lohnsteuer + soli + kirchensteuer;
    document.getElementById('lohnabrechnungSteuerGesamt').textContent = FormatHelper.currency(steuerGesamt);

    // Sozialversicherung AN-Anteile (VEREINFACHT - nur Prozentsätze, keine Sonderfälle)
    const kvSatz = parseFloat(document.getElementById('lohnabrechnungKVSatzInput').value) / 100;
    const pvSatz = parseFloat(document.getElementById('lohnabrechnungPVSatzInput').value) / 100;
    const rvSatz = parseFloat(document.getElementById('lohnabrechnungRVSatzInput').value) / 100;
    const alvSatz = parseFloat(document.getElementById('lohnabrechnungALVSatzInput').value) / 100;

    // Einfache Berechnung: Brutto × Prozentsatz
    const kvAN = FormatHelper.roundToTwo(brutto * kvSatz);
    const pvAN = FormatHelper.roundToTwo(brutto * pvSatz);
    const rvAN = FormatHelper.roundToTwo(brutto * rvSatz);
    const alvAN = FormatHelper.roundToTwo(brutto * alvSatz);

    document.getElementById('lohnabrechnungKrankenversicherung').textContent = FormatHelper.currency(kvAN);
    document.getElementById('lohnabrechnungPflegeversicherung').textContent = FormatHelper.currency(pvAN);
    document.getElementById('lohnabrechnungRentenversicherung').textContent = FormatHelper.currency(rvAN);
    document.getElementById('lohnabrechnungArbeitslosenversicherung').textContent = FormatHelper.currency(alvAN);

    const svGesamt = kvAN + pvAN + rvAN + alvAN;
    document.getElementById('lohnabrechnungSVGesamt').textContent = FormatHelper.currency(svGesamt);

    // Gesamtabzüge
    const abzuegeGesamt = steuerGesamt + svGesamt;
    document.getElementById('lohnabrechnungAbzuegeGesamt').textContent = FormatHelper.currency(abzuegeGesamt);

    // Netto
    const netto = brutto - abzuegeGesamt;
    document.getElementById('lohnabrechnungNetto').textContent = FormatHelper.currency(netto);


}