// ============================================================================
// GLOBALE VARIABLEN
// ============================================================================
let yamlData = []; // Initialize yamlData as an empty array
let nummerKunde = 0;


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
    'datenWertpapiere': { onChange: loadWertpapiereData, autoUpdate: false }
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
    const imageUrl = (logoUrl && logoUrl.trim() !== '' && (logoUrl.startsWith('http') || logoUrl.endsWith('.svg')))
        ? logoUrl
        : standardImageURL;

    // Lade SVG-Datei
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
// YAML/DATEN-VERWALTUNG
// ============================================================================
function handleFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const uploadedFile = fileInput.files[0];

    if (uploadedFile) {
        const reader = new FileReader();

        reader.onload = function (e) {
            try {
                const uploadedYamlCompanyData = jsyaml.load(e.target.result);

                if (uploadedYamlCompanyData && Array.isArray(uploadedYamlCompanyData)) {
                    // Speichern der hochgeladenen Daten im Local Storage
                    localStorage.setItem('uploadedYamlCompanyData', JSON.stringify(uploadedYamlCompanyData));
                    yamlData = uploadedYamlCompanyData;
                    uploadedYamlCompanyData.sort((a, b) => {
                        if (!a.unternehmen.branche && b.unternehmen.branche) return 1;
                        if (a.unternehmen.branche && !b.unternehmen.branche) return -1;
                        if (!a.unternehmen.branche && !b.unternehmen.branche) return 0;
                        return a.unternehmen.branche.localeCompare(b.unternehmen.branche);
                    });
                    updateLocalStorageStatus('Daten wurden erfolgreich hochgeladen.');

                    // Reload dropdown and random companies based on the uploaded data
                    reloadDropdownOptions();
                    loadSupplierData();
                    alert("Datei erfolgreich hochgeladen!");
                } else {
                    console.error("Invalid YAML format in the uploaded file.");
                    alert("Fehler im YAML format. Datei bitte überprüfen.");
                }
            } catch (error) {
                console.error("Error processing uploaded YAML data:", error);
                alert("Error processing uploaded YAML data. Please check the file format.");
            }
        };

        reader.readAsText(uploadedFile);

    } else {
        alert("No file selected. Please choose a YAML file to upload.");
    }
}

function loadUploadedDataFromLocalStorage() {
    const uploadedDataJSON = localStorage.getItem('uploadedYamlCompanyData');
    if (uploadedDataJSON) {
        try {
            const uploadedData = JSON.parse(uploadedDataJSON);
            // Verarbeite die geladenen Daten wie gewünscht, z.B. Sortieren und Dropdowns aktualisieren
            yamlData = uploadedData;
            uploadedData.sort((a, b) => {
                if (!a.unternehmen.branche && b.unternehmen.branche) return 1;
                if (a.unternehmen.branche && !b.unternehmen.branche) return -1;
                if (!a.unternehmen.branche && !b.unternehmen.branche) return 0;
                return a.unternehmen.branche.localeCompare(b.unternehmen.branche);
            });
            reloadDropdownOptions();
        } catch (error) {
            console.error("Error parsing uploaded data from Local Storage:", error);
        }
    }
}
// Rufe die Funktion zum Laden der hochgeladenen Daten aus dem Local Storage auf
loadUploadedDataFromLocalStorage();


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

        dropdown.innerHTML = '';
        sortedData.forEach(company => {
            const option = document.createElement('option');
            option.value = company.unternehmen.name;
            option.text = `${company.unternehmen.branche} - ${company.unternehmen.name} ${company.unternehmen.rechtsform}`;
            dropdown.appendChild(option);
        });
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


// Function to delete uploaded data and load default data
function deleteAndLoadDefaultData() {
    // Löschen des Local Storage
    localStorage.removeItem('uploadedYamlCompanyData');

    // Dateieingabe zurücksetzen
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';

    // Standard-YAML-Daten neu laden
    fetch('js/unternehmen.yml')
        .then(response => response.text())
        .then(data => {
            yamlData = jsyaml.load(data);
            updateAllDropdowns();
            updateLocalStorageStatus('Daten wurden erfolgreich zurückgesetzt.');
            alert('Daten erfolgreich zurückgesetzt.');
        })
        .catch(error => {
            console.error("Fehler beim Laden der Standard-Daten:", error);
            alert('Fehler beim Zurücksetzen der Daten.');
        });
}


if (!localStorage.getItem('uploadedYamlCompanyData')) {
    fetch('js/unternehmen.yml')
        .then(response => response.text())
        .then(data => {
            yamlData = jsyaml.load(data);
            updateAllDropdowns(); // ← Einfach unsere zentrale Funktion verwenden!
        });
}

let selectedSupplier;

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


// Lade die Unternehmensdaten basierend auf der Auswahl im Dropdown-Feld
function loadCompanyDataforQuittung() {
    const selectedCompanyName = document.getElementById('datenQuittungKunde').value;
    const selectedCompany = yamlData.find(company => company.unternehmen.name === selectedCompanyName);
    document.getElementById('quittungNameKunde').textContent = selectedCompany.unternehmen.inhaber + ", " + selectedCompany.unternehmen.name;
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

// ERSETZEN Sie loadCompanyDataforQuittung:
function loadCompanyDataforQuittung() {
    loadBelegData('kundeQuittung', 'datenQuittungKunde');
}

// ERSETZEN Sie loadCompanyDataforKassenbon:
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
    const elementsWithClassRechnung7 = document.getElementById('rechnungDatum-7');
    if (elementsWithClassRechnung7) {
        const currentYear = new Date().getFullYear();
        const selectedDatumRechnung = new Date(`${selectedMonat}/${selectedTag}/${currentYear}`);
        const sevenDaysAgoRechnung = new Date(selectedDatumRechnung);
        sevenDaysAgoRechnung.setDate(selectedDatumRechnung.getDate() - 7);
        const formattedSevenDaysAgoRechnung = `${sevenDaysAgoRechnung.getDate().toString().padStart(2, '0')}.${(sevenDaysAgoRechnung.getMonth() + 1).toString().padStart(2, '0')}.`;
        elementsWithClassRechnung7.textContent = formattedSevenDaysAgoRechnung;
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
    const elementsWithClass = document.getElementsByClassName('rechnungsDatum');
    // Iteriere durch alle Elemente und setze das formatierte Datum
    for (const element of elementsWithClass) {
        element.textContent = formattedDatum;
    }

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

    const useScript = document.getElementById('scriptJahr').checked;
    if (!useScript) {
        // Verwende das Jahr aus dem Textfeld
        const selectedJahr = document.getElementById('jahr');
        const yearelementsWithClass = document.querySelectorAll('.aktuellesJahr');
        for (const yearelement of yearelementsWithClass) {
            yearelement.textContent = selectedJahr.value;
        }

    } else {

        const customDefs = document.getElementById('customDefs');
        const customJsScript = document.getElementById('customJs');
        const useScript = document.getElementById('scriptJahr').checked;

        if (customJsScript) {
            customJsScript.remove();
        }

        if (useScript) {
            let svgContainer = document.getElementById('rechnungSVG');
            if (svgContainer instanceof SVGElement) {
                // Füge das dynamische Script zum SVG hinzu
                const dynamicScript = document.createElement('script');
                dynamicScript.type = 'text/javascript';
                dynamicScript.id = 'customJs';
                dynamicScript.text = `
            function getCurrentYear() {
                return new Date().getFullYear();
            }

            function SVGonLoad() {
                const currentDate = new Date();
                const currentYear = getCurrentYear();
                const elementsWithClass = document.querySelectorAll('.aktuellesJahr');
                for (const element of elementsWithClass) {
                    element.textContent = currentYear;
                }
            }
        `;

                customDefs.appendChild(dynamicScript);

            }
            else {
                const dynamicScript = document.createElement('script');
                dynamicScript.type = 'text/javascript';
                dynamicScript.id = 'customJs';
                dynamicScript.text = `
            function getCurrentYear() {
                return new Date().getFullYear();
            }

            function SVGonLoad() {
                const currentDate = new Date();
                const currentYear = getCurrentYear();
                const elementsWithClass = document.querySelectorAll('.aktuellesJahr');
                for (const element of elementsWithClass) {
                    element.textContent = currentYear;
                }
            }
        `;

                // Füge das Skript zum body hinzu, wenn 'customDefs' nicht existiert
                document.body.appendChild(dynamicScript);


            }
        }
        SVGonLoad(); // Aktualisiere das SVG-Dokument basierend auf dem neuen Status der Checkbox

    }

    const useScriptKontoauszug = document.getElementById('scriptJahrKontoauszug').checked;
    if (!useScriptKontoauszug) {
        // Verwende das Jahr aus dem Textfeld
        const selectedJahr = document.getElementById('jahrKontoauszug');
        const yearelementsWithClass = document.querySelectorAll('.aktuellesJahrKontoauszug');
        for (const yearelement of yearelementsWithClass) {
            yearelement.textContent = selectedJahr.value;
        }

    } else {

        const customDefs = document.getElementById('customDefsKontoauszug');
        const customJsScript = document.getElementById('customJsKontoauszug');
        const useScriptKontoauszug = document.getElementById('scriptJahrKontoauszug').checked;

        if (customJsScript) {
            customJsScript.remove();
        }

        if (useScriptKontoauszug) {
            // Füge das dynamische Script zum SVG hinzu
            const dynamicScript = document.createElement('script');
            dynamicScript.type = 'text/javascript';
            dynamicScript.id = 'customJsKontoauszug';
            dynamicScript.text = `
            function getCurrentYear() {
                return new Date().getFullYear();
            }

            function SVGonLoadKontoauszug() {
                const currentDate = new Date();
                const currentYear = getCurrentYear();
                const elementsWithClass = document.querySelectorAll('.aktuellesJahrKontoauszug');
                for (const element of elementsWithClass) {
                    element.textContent = currentYear;
                }
            }
        `;

            customDefs.appendChild(dynamicScript);

        }
        SVGonLoadKontoauszug(); // Aktualisiere das SVG-Dokument basierend auf dem neuen Status der Checkbox


    }


    // Hilfsfunktion, um den numerischen Wert eines Eingabefelds zu erhalten
    function getNumericValue(inputId) {
        const inputValue = document.getElementById(inputId).value;
        return parseFloat(inputValue) || 0; // Rückgabe von 0, wenn die Umwandlung fehlschlägt
    }

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
        document.getElementById('pos1').textContent = '1';
        document.getElementById('artikel1').textContent = artikel;
        document.getElementById('menge1').textContent = FormatHelper.numberSpace(menge) + ' ' + einheit;
        document.getElementById('einzelpreis1').textContent = FormatHelper.currency(einzelpreis);
        document.getElementById('gesamtpreis1').textContent = FormatHelper.currency(gesamtpreis1);
    } else {
        gesamtpreis1 = 0;
        document.getElementById('pos1').textContent = '';
        document.getElementById('artikel1').textContent = artikel;
        document.getElementById('menge1').textContent = '';
        document.getElementById('einzelpreis1').textContent = '';
        document.getElementById('gesamtpreis1').textContent = '';
    }

    // Setze die gelesenen Daten in die SVG-Textelemente

    if (menge2 && einzelpreis2) {
        gesamtpreis2 = menge2 * einzelpreis2;
        document.getElementById('pos2').textContent = '2';
        document.getElementById('artikel2').textContent = artikel2;
        document.getElementById('menge2').textContent = FormatHelper.numberSpace(menge2) + ' ' + einheit2;
        document.getElementById('einzelpreis2').textContent = FormatHelper.currency(einzelpreis2);
        document.getElementById('gesamtpreis2').textContent = FormatHelper.currency(gesamtpreis2);
    } else {
        gesamtpreis2 = 0;
        document.getElementById('pos2').textContent = '';
        document.getElementById('artikel2').textContent = artikel2;
        document.getElementById('menge2').textContent = '';
        document.getElementById('einzelpreis2').textContent = '';
        document.getElementById('gesamtpreis2').textContent = '';
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
    document.getElementById('zwischensumme').textContent = FormatHelper.currency(zwischensumme);
    document.getElementById('bezugskostenSumme').textContent = FormatHelper.currency(bezugskostenInput);
    document.getElementById('bezugskosten').textContent = bezugskostenArtInput;
    if (rabattInput > 0) {
        document.getElementById('rabatt').textContent = '- ' + rabattInput + ' % Rabatt'
        document.getElementById('rabattsumme').textContent = FormatHelper.currency(rabattsumme);
        nettowert = zwischensumme - rabattsumme + bezugskostenInput
    } else {
        document.getElementById('rabatt').textContent = ' '
        document.getElementById('rabattsumme').textContent = ' ';
        nettowert = zwischensumme + bezugskostenInput;
    }

    document.getElementById('nettowert').textContent = FormatHelper.currency(nettowert);

    if (umsatzsteuerInput > 0) {
        umsatzsteuersumme = nettowert * umsatzsteuerInput / 100
        document.getElementById('ust').textContent = '+ ' + umsatzsteuerInput;
        document.getElementById('ustsumme').textContent = FormatHelper.currency(umsatzsteuersumme);
        gesamtRechnungsbetrag = nettowert + umsatzsteuersumme;
    } else {
        umsatzsteuersumme = ' ';
        document.getElementById('ust').textContent = ' '
        document.getElementById('ustsumme').textContent = ' ';
        gesamtRechnungsbetrag = nettowert;
    }


    document.getElementById('rechnungsbetrag').textContent = FormatHelper.currency(gesamtRechnungsbetrag);

    // Platz machen wenn keine Bezugskosten oder Rabatt
    const warenwertUstRechnungsbetrag = document.getElementById('warenwertUstRechnungsbetrag');
    const warenwertUstRechnungsbetrag_quer = document.getElementById('warenwertUstRechnungsbetrag_quer');
    const gBezugskosten = document.getElementById('gBezugskosten');

    if (warenwertUstRechnungsbetrag) {
        if (bezugskostenInput > 0) {
        } else {
            warenwertUstRechnungsbetrag.setAttribute('transform', 'translate(0, -30)');
            gBezugskosten.remove();
        };

        if (rabattInput > 0) {
        } else {
            warenwertUstRechnungsbetrag.setAttribute('transform', 'translate(0, -30)');
            gBezugskosten.setAttribute('transform', 'translate(0, -30)');
        };

    } else {

    }

    const elemWarenwert = document.getElementById('warenwert');
    const elemZwischensumme = document.getElementById('zwischensumme');
    if (elemWarenwert && warenwertUstRechnungsbetrag) {
        if (bezugskostenInput > 0 || rabattInput > 0) {
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
            gBezugskosten.remove();
        }
    } else {

    }

    const inputLieferbedingung = document.getElementById("lieferbedingungInput");


    const elemBezugskostenBedingung = document.getElementById('bezugskostenBedingung');
    if (elemBezugskostenBedingung) {
        const bezugskostenBedingung = document.getElementById('bezugskostenBedingung');
        if (inputLieferbedingung.checked) {
            if (bezugskostenInput > 0) {
                bezugskostenBedingung.textContent = "ab Werk";
            } else {
                bezugskostenBedingung.textContent = "frei Haus";
            }

        } else {
            bezugskostenBedingung.textContent = "";
        }
    } else { }

    const inputEigentumsvorbehalt = document.getElementById("eigentumsvorbehaltInput");
    const eigentumsvorbehalt = document.getElementById('Eigentumsvorbehalt');
    if (eigentumsvorbehalt) {
        if (inputEigentumsvorbehalt.checked) {
        } else {
            eigentumsvorbehalt.remove();
        }
    } else { }


    // Laden der Daten für den Kontoauszug
    const kontoauszugNummer = document.getElementById('kontoauszugNummerInput').value;
    document.getElementById('kontoauszugNummer').textContent = kontoauszugNummer;

    const kontoauszugVorgang1 = document.getElementById('kontoauszugVorgang1Input').value;
    document.getElementById('kontoauszugVorgang1').textContent = kontoauszugVorgang1;

    const kontoauszugWertstellung1Input = document.getElementById('kontoauszugWertstellung1Input').value;
    const kontoauszugWertstellung1 = kontoauszugWertstellung1Input ? parseFloat(kontoauszugWertstellung1Input) : 0;
    document.getElementById('kontoauszugWertstellung1').textContent = kontoauszugWertstellung1 !== 0 ? FormatHelper.currencyWithSign(kontoauszugWertstellung1) : "";

    const kontoauszugVorgang2 = document.getElementById('kontoauszugVorgang2Input').value;
    document.getElementById('kontoauszugVorgang2').textContent = kontoauszugVorgang2;

    const kontoauszugWertstellung2Input = document.getElementById('kontoauszugWertstellung2Input').value;
    const kontoauszugWertstellung2 = kontoauszugWertstellung2Input !== "" ? parseFloat(kontoauszugWertstellung2Input) : 0;
    document.getElementById('kontoauszugWertstellung2').textContent = kontoauszugWertstellung2 !== 0 ? FormatHelper.currencyWithSign(kontoauszugWertstellung2) : "";

    const kontoauszugVorgang3 = document.getElementById('kontoauszugVorgang3Input').value;
    document.getElementById('kontoauszugVorgang3').textContent = kontoauszugVorgang3;

    const kontoauszugWertstellung3Input = document.getElementById('kontoauszugWertstellung3Input').value;
    const kontoauszugWertstellung3 = kontoauszugWertstellung3Input ? parseFloat(kontoauszugWertstellung3Input) : 0;
    document.getElementById('kontoauszugWertstellung3').textContent = kontoauszugWertstellung3 !== 0 ? FormatHelper.currencyWithSign(kontoauszugWertstellung3) : "";

    const kontoauszugKontostand_altInput = document.getElementById('kontoauszugKontostand_altInput').value;
    const kontoauszugKontostand_alt = kontoauszugKontostand_altInput ? parseFloat(kontoauszugKontostand_altInput) : 0;
    document.getElementById('kontoauszugKontostand_alt').textContent = kontoauszugKontostand_alt !== 0 ? FormatHelper.currencyWithSign(kontoauszugKontostand_alt) : "";

    let kontoauszugKontostand_neu = kontoauszugKontostand_alt + kontoauszugWertstellung1 + kontoauszugWertstellung2 + kontoauszugWertstellung3;

    document.getElementById('kontoauszugKontostand_neu').textContent = FormatHelper.currencyWithSign(kontoauszugKontostand_neu);

    // Check if both kontoauszugWertstellung1 and kontoauszugVorgang1 are empty
    if (kontoauszugWertstellung1 === 0 && kontoauszugVorgang1.trim() === "") {
        // If both are empty, remove the element with id 'kontoauszugDatum1'
        const kontoauszugDatum1Element = document.getElementById('kontoauszugDatum1');
        if (kontoauszugDatum1Element) {
            kontoauszugDatum1Element.parentNode.removeChild(kontoauszugDatum1Element);
        }
    }

    // Check if both kontoauszugWertstellung1 and kontoauszugVorgang1 are empty
    if (kontoauszugWertstellung2 === 0 && kontoauszugVorgang2.trim() === "") {
        // If both are empty, remove the element with id 'kontoauszugDatum1'
        const kontoauszugDatum2Element = document.getElementById('kontoauszugDatum2');
        if (kontoauszugDatum2Element) {
            kontoauszugDatum2Element.parentNode.removeChild(kontoauszugDatum2Element);
        }
    }

    // Check if both kontoauszugWertstellung1 and kontoauszugVorgang1 are empty
    if (kontoauszugWertstellung3 === 0 && kontoauszugVorgang3.trim() === "") {
        // If both are empty, remove the element with id 'kontoauszugDatum1'
        const kontoauszugDatum3Element = document.getElementById('kontoauszugDatum3');
        if (kontoauszugDatum3Element) {
            kontoauszugDatum3Element.parentNode.removeChild(kontoauszugDatum3Element);
        }
    }

    // Laden der Daten für die Mail
    const emailTextMessage = document.getElementById('emailInputText').value;
    document.getElementById('emailTextMessage').textContent = emailTextMessage;
    const emailSubject = document.getElementById('emailSubjectInput').value;
    document.getElementById('emailSubject').textContent = emailSubject;

    loadCompanyData(); // Laden der Kundeninformationen
    loadSupplierData(); // Laden der Lieferanteninformationen
    loadKontoauszugData() // Laden der Quittungsdaten
    loadEmailData() // Laden der E-Mail-Daten
    loadCompanyDataforEmail(); // Laden der E-Mail-Daten (Kunde)
}

async function quittungApplySVGholen() {
    if (!validateInputs()) {
        // Wenn die Validierung fehlschlägt, stoppe die Funktion
        return;
    }

    // Laden der Daten für den Kassenbon

    let selectedQuittung = document.getElementById("svgDropdownQuittung").value;
    let svgContainerQuittung = document.getElementById("quittungContainer");

    // Laden der SVG-Vorlage und Aktualisieren des Containers
    try {
        let svgData = await loadSVGTemplate(selectedQuittung);
        svgContainerQuittung.innerHTML = svgData;
    } catch (error) {
        console.error("Fehler beim Anwenden der Daten:", error);
    }

    // Laden der Daten für die Quittung
    let quittungZweck = document.getElementById('quittungZweckInput').value;
    document.getElementById('quittungZweck').textContent = quittungZweck;
    const selectedquittungTag = document.getElementById('tagQuittung').value;
    const selectedquittungMonat = document.getElementById('monatQuittung').value;
    document.getElementById('quittungTag').textContent = selectedquittungTag;
    document.getElementById('quittungMonat').textContent = selectedquittungMonat;
    let quittungNetto = document.getElementById('quittungNettoInput').value;
    // Überprüfen, ob das Eingabefeld leer ist
    if (quittungNetto === "") {
        // Wenn das Eingabefeld leer ist, setze quittungUST auf 0
        quittungNetto = 0;
    }
    quittungNetto = parseFloat(quittungNetto).toFixed(2);
    let [nettoVorKomma, nettoNachKomma] = quittungNetto.split('.');
    document.getElementById('quittungNetto').textContent = nettoVorKomma;
    document.getElementById('quittungNettoCent').textContent = nettoNachKomma;

    quittungUST = document.getElementById('quittungUSTInput').value;

    // Überprüfen, ob das Eingabefeld leer ist
    if (quittungUST === "") {
        // Wenn das Eingabefeld leer ist, setze quittungUST auf 0
        quittungUST = 0;
    }
    document.getElementById('quittungUST').textContent = quittungUST;
    let quittungUSTBetrag = quittungNetto * quittungUST / 100;
    document.getElementById('quittungUSTBetrag').textContent = quittungUSTBetrag;
    quittungUSTBetrag = FormatHelper.roundToTwo(quittungUSTBetrag);
    quittungUSTBetrag = parseFloat(quittungUSTBetrag).toFixed(2);
    let [USTVorKomma, USTNachKomma] = quittungUSTBetrag.split('.');
    document.getElementById('quittungUSTBetrag').textContent = USTVorKomma;
    document.getElementById('quittungUSTBetragCent').textContent = USTNachKomma;
    let quittungSumme = parseFloat(quittungUSTBetrag) + parseFloat(quittungNetto);
    quittungSumme = quittungSumme.toFixed(2);
    let [summeVorKomma, summeNachKomma] = quittungSumme.split('.');
    document.getElementById('quittungSumme').textContent = summeVorKomma;
    document.getElementById('quittungSummeCent').textContent = summeNachKomma;
    summeVorKomma = parseFloat(summeVorKomma)
    const quittungInWorten = zahlwort(summeVorKomma);
    document.getElementById('quittungInWorten').textContent = quittungInWorten;



    const useScriptQuittung = document.getElementById('scriptJahrQuittung').checked;
    if (!useScriptQuittung) {
        // Verwende das Jahr aus dem Textfeld
        const selectedJahr = document.getElementById('jahrQuittung');
        const yearelementsWithClass = document.querySelectorAll('.aktuellesJahrQuittung');
        for (const yearelement of yearelementsWithClass) {
            yearelement.textContent = selectedJahr.value;
        }

    } else {

        const customDefs = document.getElementById('customDefsQuittung');
        const customJsScript = document.getElementById('customJsQuittung');
        const useScriptQuittung = document.getElementById('scriptJahrQuittung').checked;

        if (customJsScript) {
            customJsScript.remove();
        }

        if (useScriptQuittung) {
            // Füge das dynamische Script zum SVG hinzu
            const dynamicScript = document.createElement('script');
            dynamicScript.type = 'text/javascript';
            dynamicScript.id = 'customJsQuittung';
            dynamicScript.text = `
            function getCurrentYear() {
                return new Date().getFullYear();
            }

            function SVGonLoadQuittung() {
                const currentDate = new Date();
                const currentYear = getCurrentYear();
                const elementsWithClass = document.querySelectorAll('.aktuellesJahrQuittung');
                for (const element of elementsWithClass) {
                    element.textContent = currentYear;
                }
            }
        `;

            customDefs.appendChild(dynamicScript);

        }
        SVGonLoadQuittung(); // Aktualisiere das SVG-Dokument basierend auf dem neuen Status der Checkbox


    }


    loadQuittungData() // Laden der Quittung-Daten
    loadCompanyDataforQuittung(); // Laden der Quittung-Daten (Kunde) 
}

async function kassenbonApplySVGholen() {
    if (!validateInputs()) {
        // Wenn die Validierung fehlschlägt, stoppe die Funktion
        return;
    }
    // Laden der Daten für den Kassenbon

    let selectedKassenbon = document.getElementById("svgDropdownKassenbon").value;
    let svgContainerKassenbon = document.getElementById("kassenbonContainer");

    // Laden der SVG-Vorlage und Aktualisieren des Containers
    try {
        let svgData = await loadSVGTemplate(selectedKassenbon);
        svgContainerKassenbon.innerHTML = svgData;
    } catch (error) {
        console.error("Fehler beim Anwenden der Daten:", error);
    }


    let kassenbonZweck = document.getElementById('kassenbonZweckInput').value;
    document.getElementById('kassenbonZweck').textContent = kassenbonZweck;
    const selectedkassenbonTag = document.getElementById('tagKassenbon').value;
    const selectedkassenbonMonat = document.getElementById('monatKassenbon').value;
    document.getElementById('kassenbonTag').textContent = selectedkassenbonTag;
    document.getElementById('kassenbonMonat').textContent = selectedkassenbonMonat;
    let kassenbonRandomTime = RandomHelper.time();
    document.getElementById('kassenbonUhrzeit').textContent = kassenbonRandomTime + ' Uhr';
    const kassenbonRandomNumber = RandomHelper.sevenDigit();
    document.getElementById('kassenbonTransaktionsnummer').textContent = kassenbonRandomNumber;
    let kassenbonNetto = document.getElementById('kassenbonNettoInput').value;
    // Überprüfen, ob das Eingabefeld leer ist
    if (kassenbonNetto === "") {
        // Wenn das Eingabefeld leer ist, setze quittungUST auf 0
        kassenbonNetto = 0;
    }

    document.getElementById('kassenbonNetto').textContent = FormatHelper.currency(kassenbonNetto);
    kassenbonUST = document.getElementById('kassenbonUSTInput').value;
    // Überprüfen, ob das Eingabefeld leer ist
    if (quittungUST === "") {
        // Wenn das Eingabefeld leer ist, setze quittungUST auf 0
        quittungUST = 0;
    }

    document.getElementById('kassenbonUST').textContent = kassenbonUST;
    let kassenbonUSTBetrag = (kassenbonNetto * kassenbonUST / 100);
    kassenbonUSTBetrag = FormatHelper.roundToTwo(kassenbonUSTBetrag);
    document.getElementById('kassenbonUSTBetrag').textContent = FormatHelper.currency(kassenbonUSTBetrag);
    let kassenbonBrutto = parseFloat(kassenbonNetto) + parseFloat(kassenbonUSTBetrag);
    let kassenbonBruttoElements = Array.from(document.getElementsByClassName('kassenbonBrutto'));

    // Iteriere über jedes Element und setze den berechneten Bruttobetrag als Textinhalt
    kassenbonBruttoElements.forEach(function (element) {
        // Formatieren des Bruttobetrags
        var formattedKassenbonBrutto = FormatHelper.currency(kassenbonBrutto);

        // Setze den formatierten Bruttobetrag als Textinhalt ins Element
        element.textContent = formattedKassenbonBrutto;
    });
    let kassenbonZahlungsart = document.getElementById('kassenbonDropdownZahlungsart').value;
    document.getElementById('kassenbonZahlungsart').textContent = kassenbonZahlungsart;


    const useScriptKassenbon = document.getElementById('scriptJahrKassenbon').checked;
    if (!useScriptKassenbon) {
        // Verwende das Jahr aus dem Textfeld
        const selectedJahr = document.getElementById('jahrKassenbon');
        const yearelementsWithClass = document.querySelectorAll('.aktuellesJahrKassenbon');
        for (const yearelement of yearelementsWithClass) {
            yearelement.textContent = selectedJahr.value;
        }

    } else {

        const customDefs = document.getElementById('customDefsKassenbon');
        const customJsScript = document.getElementById('customJsKassenbon');
        const useScriptKassenbon = document.getElementById('scriptJahrKassenbon').checked;

        if (customJsScript) {
            customJsScript.remove();
        }

        if (useScriptKassenbon) {
            // Füge das dynamische Script zum SVG hinzu
            const dynamicScript = document.createElement('script');
            dynamicScript.type = 'text/javascript';
            dynamicScript.id = 'customJsKassenbon';
            dynamicScript.text = `
            function getCurrentYear() {
                return new Date().getFullYear();
            }

            function SVGonLoadKassenbon() {
                const currentDate = new Date();
                const currentYear = getCurrentYear();
                const elementsWithClass = document.querySelectorAll('.aktuellesJahrKassenbon');
                for (const element of elementsWithClass) {
                    element.textContent = currentYear;
                }
            }
        `;

            customDefs.appendChild(dynamicScript);

        }
        SVGonLoadKassenbon(); // Aktualisiere das SVG-Dokument basierend auf dem neuen Status der Checkbox


    }

    loadKassenbonData() // Laden der Kassenbon-Daten
    loadCompanyDataforKassenbon()
}

async function journalApplySVGholen() {

    let selectedLohnjournal = document.getElementById("svgDropdownLohnjournal").value;
    let svgContainerLohnjournal = document.getElementById("lohnjournalContainer");

    // Laden der SVG-Vorlage und Aktualisieren des Containers
    try {
        let svgData = await loadSVGTemplate(selectedLohnjournal);
        svgContainerLohnjournal.innerHTML = svgData;
    } catch (error) {
        console.error("Fehler beim Anwenden der Daten:", error);
    }
    // Laden der Daten des Lohnjournals

    // Funktion zum Zufälligen Auswählen von Mitarbeitern

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

    function chooseRandomMitarbeiter(mitarbeiterListe, anzahl) {
        const zufälligeMitarbeiter = [];
        const kopieDerMitarbeiterListe = [...mitarbeiterListe];
        for (let i = 0; i < anzahl; i++) {
            const index = Math.floor(Math.random() * kopieDerMitarbeiterListe.length);
            zufälligeMitarbeiter.push(kopieDerMitarbeiterListe.splice(index, 1)[0]);
        }
        return zufälligeMitarbeiter;
    }


    // Auswahl von drei zufälligen Mitarbeitern aus dem Array
    const ausgewählteMitarbeiter = chooseRandomMitarbeiter(mitarbeiter, 3);

    // Eintragen der ausgewählten Mitarbeiter ins Lohnjournal
    for (let i = 0; i < ausgewählteMitarbeiter.length; i++) {
        let lohnjournalEintrag = document.getElementById(`lohnjournalArbeitnehmer${i + 1}`);
        if (lohnjournalEintrag) {
            lohnjournalEintrag.textContent = `${ausgewählteMitarbeiter[i].name} (${ausgewählteMitarbeiter[i].steuerklasse}/${ausgewählteMitarbeiter[i].freibetrag})`;
        }
    }

    function generiereZufallsBruttogehalt() {
        return Math.round((Math.random() * 4000) + 2000) / 100 * 100; // Zwischen 2000 und 5000 gerundet auf Hunderter
    }

    // Funktion zur Berechnung der Steuern basierend auf der Steuerklasse
    function berechneSteuern(brutto, steuerklasse) {
        let steuersatz = 0;
        switch (steuerklasse) {
            case "I":
                steuersatz = 0.19; // 9% Steuern für Steuerklasse I
                break;
            case "III":
                steuersatz = 0.11; // 5,5% Steuern für Steuerklasse III
                break;
            case "IV":
                steuersatz = 0.14; // 8% Steuern für Steuerklasse IV
                break;
            default:
                steuersatz = 0;
        }
        return brutto * steuersatz;
    }

    // Funktion zur Berechnung der Sozialversicherungsbeiträge
    function berechneSozialversicherung(brutto) {
        const sozialversicherungssatz = 0.389; // 16,6% Sozialversicherungssatz (Arbeitnehmer und Arbeitgeber je 10%)
        return brutto * sozialversicherungssatz;
    }

    // Eintragen der zufälligen Bruttogehälter, Steuern, Sozialversicherungsbeiträge und Nettogehälter ins Lohnjournal
    for (let i = 0; i < ausgewählteMitarbeiter.length; i++) {
        // Generiere zufälliges Bruttogehalt für diesen Mitarbeiter
        const zufallsBruttogehalt = generiereZufallsBruttogehalt();

        // Eintragen des Bruttogehalts ins Lohnjournal
        const lohnjournalBrutto = document.getElementById(`lohnjournalBrutto${i + 1}`);
        if (lohnjournalBrutto) {
            lohnjournalBrutto.textContent = `${FormatHelper.currency(zufallsBruttogehalt.toFixed(2))}`;
        }

        // Berechnen der Steuern basierend auf der Steuerklasse und Eintragen ins Lohnjournal
        const lohnjournalSteuern = document.getElementById(`lohnjournalSteuern${i + 1}`);
        if (lohnjournalSteuern) {
            const steuern = berechneSteuern(zufallsBruttogehalt, ausgewählteMitarbeiter[i].steuerklasse);
            lohnjournalSteuern.textContent = `${FormatHelper.currency(steuern.toFixed(2))}`;
        }

        // Berechnen der Sozialversicherungsbeiträge und Eintragen ins Lohnjournal (Arbeitnehmer und Arbeitgeber)
        const lohnjournalAN = document.getElementById(`lohnjournalAN${i + 1}`);
        const lohnjournalAG = document.getElementById(`lohnjournalAG${i + 1}`);
        if (lohnjournalAN && lohnjournalAG) {
            const sozialversicherung = berechneSozialversicherung(zufallsBruttogehalt);
            const anBeitrag = sozialversicherung * 0.5; // 50% für Arbeitnehmer
            const agBeitrag = sozialversicherung * 0.5; // 50% für Arbeitgeber

            lohnjournalAN.textContent = `${FormatHelper.currency(anBeitrag.toFixed(2))}`;
            lohnjournalAG.textContent = `${FormatHelper.currency(agBeitrag.toFixed(2))}`;
        }

        // Berechnen und Eintragen des Nettogehalts ins Lohnjournal
        const lohnjournalNetto = document.getElementById(`lohnjournalNetto${i + 1}`);
        if (lohnjournalNetto) {
            const steuern = berechneSteuern(zufallsBruttogehalt, ausgewählteMitarbeiter[i].steuerklasse);
            const sozialversicherung = berechneSozialversicherung(zufallsBruttogehalt);

            const netto = zufallsBruttogehalt - steuern - (sozialversicherung * 0.5); // Abzug der Hälfte der Sozialversicherung für Arbeitnehmer
            lohnjournalNetto.textContent = `${FormatHelper.currency(netto.toFixed(2))}`;
        }
    }
    function berechneSummeBrutto(anzahlMitarbeiter) {
        let summe = 0;
        for (let i = 0; i < anzahlMitarbeiter; i++) {
            summe += generiereZufallsBruttogehalt();
        }
        return summe;
    }

    // Funktion zur Generierung einer zufälligen Ganzzahl zwischen min (inklusive) und max (exklusive)
    function zufallszahlMitarbeiter(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }


    // Generiere eine zufällige Anzahl von Mitarbeitern zwischen 15 und 45
    const anzahlMitarbeiter = zufallszahlMitarbeiter(15, 46); // 46, weil der obere Wert exklusiv ist, sodass 45 enthalten ist
    const summeBrutto = berechneSummeBrutto(anzahlMitarbeiter);

    // Eintragen der Summe der Bruttogehälter ins Lohnjournal
    const lohnjournalBruttoSumme = document.getElementById('lohnjournalBrutto4');
    if (lohnjournalBruttoSumme) {
        lohnjournalBruttoSumme.textContent = `${FormatHelper.currency(summeBrutto.toFixed(2))}`;
    }

    // Annahme: Steuerklasse 4 für alle Mitarbeiter
    const steuerklasse = "IV";

    // Berechnen der Steuern für die Summe
    const summeSteuern = berechneSteuern(summeBrutto, steuerklasse);

    // Eintragen der berechneten Steuern ins Lohnjournal
    const lohnjournalSteuernSumme = document.getElementById('lohnjournalSteuern4');
    if (lohnjournalSteuernSumme) {
        lohnjournalSteuernSumme.textContent = `${FormatHelper.currency(summeSteuern.toFixed(2))}`;
    }

    // Berechnen der Sozialversicherungsbeiträge für die Summe (Arbeitnehmer und Arbeitgeber)
    const summeSozialversicherung = berechneSozialversicherung(summeBrutto);
    const summeAnBeitrag = summeSozialversicherung * 0.5; // 50% für Arbeitnehmer
    const summeAgBeitrag = summeSozialversicherung * 0.5; // 50% für Arbeitgeber

    // Eintragen der berechneten Sozialversicherungsbeiträge ins Lohnjournal (Arbeitnehmer und Arbeitgeber)
    const lohnjournalANSumme = document.getElementById('lohnjournalAN4');
    const lohnjournalAGSumme = document.getElementById('lohnjournalAG4');
    if (lohnjournalANSumme && lohnjournalAGSumme) {
        lohnjournalANSumme.textContent = `${FormatHelper.currency(summeAnBeitrag.toFixed(2))}`;
        lohnjournalAGSumme.textContent = `${FormatHelper.currency(summeAgBeitrag.toFixed(2))}`;
    }

    // Berechnen des Nettogehalts für die Summe
    const summeNetto = summeBrutto - summeSteuern - summeAnBeitrag;

    // Eintragen des Nettogehalts ins Lohnjournal
    const lohnjournalNettoSumme = document.getElementById('lohnjournalNetto4');
    if (lohnjournalNettoSumme) {
        lohnjournalNettoSumme.textContent = `${FormatHelper.currency(summeNetto.toFixed(2))}`;
    }

    // Array mit den Monatsnamen
    const monate = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

    // Zufällige Auswahl eines Monats
    const zufälligerMonatIndex = Math.floor(Math.random() * monate.length);
    const zufälligerMonat = monate[zufälligerMonatIndex];

    // Eintragen des zufälligen Monats ins Lohnjournal
    const lohnjournalMonat = document.getElementById('lohnjournalMonat');
    if (lohnjournalMonat) {
        lohnjournalMonat.textContent = zufälligerMonat;
    }
    let lohnjournalSatzOutput = "";
    lohnjournalSatzOutput += ` <h3>Aufgabe</h3>`;
    lohnjournalSatzOutput += `<p>Von der Personalabteilung liegt der folgende Belegauszug vor. Bilde die Buchungssätze für die Erfassung
    des gesamten Personalaufwands, wenn die Auszahlung per Banküberweisung erfolgt.</p>
`;
    lohnjournalSatzOutput += `<h3>Lösung</h3>`;
    lohnjournalSatzOutput += `<table style="border: 1px solid #ccc;white-space:nowrap;background-color:#fff;font-family:courier;min-width:550px;margin:0 0;margin-bottom:6px;">`;
    lohnjournalSatzOutput += `<tbody>`;
    lohnjournalSatzOutput += `<tr>`;
    lohnjournalSatzOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px" tabindex="1">6200 LG</td>`;
    lohnjournalSatzOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1">${FormatHelper.currency(summeBrutto.toFixed(2))}</td>`;
    lohnjournalSatzOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 50px" tabindex="1">an</td>`;
    lohnjournalSatzOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px;text-align:left" tabindex="1">2800 BK</td>`;
    lohnjournalSatzOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px;text-align:right" tabindex="1">${FormatHelper.currency(summeNetto.toFixed(2))}</td>`;
    lohnjournalSatzOutput += `</tr>`;
    lohnjournalSatzOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px" tabindex="1"></td>`;
    lohnjournalSatzOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1"></td>`;
    lohnjournalSatzOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 50px" tabindex="1"></td>`;
    lohnjournalSatzOutput += `<td style="text-align:left;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1">4830 VFA</td>`;
    lohnjournalSatzOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1">${FormatHelper.currency(summeSteuern.toFixed(2))}</td>`;
    lohnjournalSatzOutput += `</tr>`;
    lohnjournalSatzOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px" tabindex="1"></td>`;
    lohnjournalSatzOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1"></td>`;
    lohnjournalSatzOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 50px" tabindex="1"></td>`;
    lohnjournalSatzOutput += `<td style="text-align:left;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1">4840 VSV</td>`;
    lohnjournalSatzOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1">${FormatHelper.currency(summeAnBeitrag.toFixed(2))}</td>`;
    lohnjournalSatzOutput += `</tr>`;
    lohnjournalSatzOutput += `</tbody>`;
    lohnjournalSatzOutput += `</table>`;
    lohnjournalSatzOutput += `<table style="border: 1px solid #ccc;white-space:nowrap;background-color:#fff;font-family:courier;min-width:550px;margin:0 0;margin-bottom:6px;">`;
    lohnjournalSatzOutput += `<tbody>`;
    lohnjournalSatzOutput += `<tr>`;
    lohnjournalSatzOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px" tabindex="1">6400 AGASV</td>`;
    lohnjournalSatzOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1"></td>`;
    lohnjournalSatzOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 50px" tabindex="1">an</td>`;
    lohnjournalSatzOutput += `<td style="text-align:left;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1">4840 VSV</td>`;
    lohnjournalSatzOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1">${FormatHelper.currency(summeAgBeitrag.toFixed(2))}</td>`;
    lohnjournalSatzOutput += `</tr>`;
    lohnjournalSatzOutput += `</tbody>`;
    lohnjournalSatzOutput += `</table>`;

    document.getElementById('lohnjournalBuchungssatzContainer').innerHTML = lohnjournalSatzOutput;
    loadLohnjournalData() // Laden des Lohnjournals

}

async function anlagenkarteApplySVGholen() {
    if (!validateInputs()) {
        // Wenn die Validierung fehlschlägt, stoppe die Funktion
        return;
    }

    let selectedAnlagenkarte = document.getElementById("svgDropdownAnlagenkarte").value;
    let svgContainerAnlagenkarte = document.getElementById("anlagenkarteContainer");

    // Laden der SVG-Vorlage und Aktualisieren des Containers
    try {
        let svgData = await loadSVGTemplate(selectedAnlagenkarte);
        svgContainerAnlagenkarte.innerHTML = svgData;
    } catch (error) {
        console.error("Fehler beim Anwenden der Daten:", error);
    }
    // Laden der Daten

    let anlagenkarteBezeichnung = document.getElementById('anlagenkarteBezeichnungInput').value;
    document.getElementById('anlagenkarteBezeichnung').textContent = anlagenkarteBezeichnung;

    let anlagenkarteAnlagekonto = document.getElementById('anlagenkarteAnlagenkontoInput').value;
    document.getElementById('anlagenkarteAnlagenkonto').textContent = anlagenkarteAnlagekonto;

    let anlagenkarteAnschaffungskosten = document.getElementById('anlagenkarteAnschaffungskostenInput').value;
    document.getElementById('anlagenkarteAnschaffungskosten').textContent = FormatHelper.currency(anlagenkarteAnschaffungskosten);

    let anlagenkarteNutzungsdauer = document.getElementById('anlagenkarteNutzungsdauerInput').value;
    document.getElementById('anlagenkarteNutzungsdauer').textContent = anlagenkarteNutzungsdauer;

    const selectedAnlagenkarteTag = document.getElementById('tagAnlagenkarte').value;
    const selectedAnlagenkarteMonat = document.getElementById('monatAnlagenkarte').value;
    document.getElementById('anlagenkarteTag').textContent = selectedAnlagenkarteTag;
    document.getElementById('anlagenkarteMonat').textContent = selectedAnlagenkarteMonat;

    const useScriptAnlagenkarte = document.getElementById('scriptJahrAnlagenkarte').checked;
    if (!useScriptAnlagenkarte) {
        // Verwende das Jahr aus dem Textfeld
        const selectedJahr = document.getElementById('jahrAnlagenkarte');
        const yearelementsWithClass = document.querySelectorAll('.aktuellesJahrAnlagenkarte');
        for (const yearelement of yearelementsWithClass) {
            yearelement.textContent = selectedJahr.value;
        }

    } else {

        const customDefs = document.getElementById('customDefsAnlagenkarte');
        const customJsScript = document.getElementById('customJsAnlagenkarte');
        const useScriptAnlagenkarte = document.getElementById('scriptJahrAnlagenkarte').checked;

        if (customJsScript) {
            customJsScript.remove();
        }

        if (useScriptAnlagenkarte) {
            // Füge das dynamische Script zum SVG hinzu
            const dynamicScript = document.createElement('script');
            dynamicScript.type = 'text/javascript';
            dynamicScript.id = 'customJsAnlagenkarte';
            dynamicScript.text = `
            function getCurrentYear() {
                return new Date().getFullYear();
            }

            function SVGonLoadAnlagenkarte() {
                const currentDate = new Date();
                const currentYear = getCurrentYear();
                const elementsWithClass = document.querySelectorAll('.aktuellesJahrAnlagenkarte');
                for (const element of elementsWithClass) {
                    element.textContent = currentYear;
                }
            }
        `;

            customDefs.appendChild(dynamicScript);

        }
        SVGonLoadAnlagenkarte(); // Aktualisiere das SVG-Dokument basierend auf dem neuen Status der Checkbox

    }

    loadAnlagenkarteData() // Laden der Anlagen-Daten
}

async function wertpapiereApplySVGholen() {
    if (!validateInputs()) {
        // Wenn die Validierung fehlschlägt, stoppe die Funktion
        return;
    }

    let selectedWertpapiere = document.getElementById("svgDropdownWertpapiere").value;
    let svgContainerWertpapiere = document.getElementById("wertpapiereContainer");

    // Laden der SVG-Vorlage und Aktualisieren des Containers
    try {
        let svgData = await loadSVGTemplate(selectedWertpapiere);
        svgContainerWertpapiere.innerHTML = svgData;
    } catch (error) {
        console.error("Fehler beim Anwenden der Daten:", error);
    }
    // Laden der Daten

    let wertpapiereBezeichnung = document.getElementById('wertpapiereBezeichnungInput').value;
    document.getElementById('wertpapiereBezeichnung').textContent = wertpapiereBezeichnung;
    let wertpapiereISIN = document.getElementById('wertpapiereISINInput').value;
    document.getElementById('wertpapiereISIN').textContent = wertpapiereISIN;
    let wertpapiereStueckkurs = document.getElementById('wertpapiereStueckkursInput').value;
    document.getElementById('wertpapiereStueckkurs').textContent = FormatHelper.currency(wertpapiereStueckkurs);

    let wertpapiereAnzahl = document.getElementById('wertpapiereAnzahlInput').value;
    document.getElementById('wertpapiereAnzahl').textContent = wertpapiereAnzahl;

    let wertpapiereKurswert = (wertpapiereAnzahl * wertpapiereStueckkurs); // Gesamtkurswert = Anzahl * Kurs
    let wertpapiereSpesen = (wertpapiereKurswert * 0.01); // 1% vom Kurswert
    let wertpapiereBanklastschrift = wertpapiereKurswert + wertpapiereSpesen;
    let wertpapiereBankgutschrift = wertpapiereKurswert - wertpapiereSpesen;
    wertpapiereKurswert = FormatHelper.currency(wertpapiereKurswert);
    document.getElementById('wertpapiereKurswert').textContent = wertpapiereKurswert;
    wertpapiereSpesen = FormatHelper.currency(wertpapiereSpesen);
    document.getElementById('wertpapiereSpesen').textContent = wertpapiereSpesen;
    wertpapiereBanklastschrift = FormatHelper.currency(wertpapiereBanklastschrift);
    wertpapiereBankgutschrift = FormatHelper.currency(wertpapiereBankgutschrift);
    let wertpapiereRandomTime = RandomHelper.time();
    document.getElementById('wertpapiereUhrzeit').textContent = wertpapiereRandomTime + ' Uhr';

    let wertpapiereArtInput = document.getElementById('wertpapiereArtInput');
    let wertpapiereArt;
    // Überprüfen, welche Option ausgewählt ist
    if (wertpapiereArtInput.value === 'wertpapiereKauf') {
        wertpapiereArt = 'gekauft';
        document.getElementById('wertpapiereBanklastschrift').textContent = wertpapiereBanklastschrift;
        document.getElementById('wertpapiereSpesenart').textContent = "+ 1 % Spesen";
        document.getElementById('wertpapiereBankart').textContent = "Banklastschrift";
    } else {
        wertpapiereArt = 'verkauft';
        document.getElementById('wertpapiereBanklastschrift').textContent = wertpapiereBankgutschrift;
        document.getElementById('wertpapiereSpesenart').textContent = "- 1 % Spesen";
        document.getElementById('wertpapiereBankart').textContent = "Bankgutschrift";
    }
    document.getElementById('wertpapiereArt').textContent = wertpapiereArt;

    const selectedWertpapiereTag = document.getElementById('tagWertpapiereInput').value;
    const selectedWertpapiereMonat = document.getElementById('monatWertpapiereInput').value;
    document.getElementById('wertpapiereTag').textContent = selectedWertpapiereTag;
    document.getElementById('wertpapiereMonat').textContent = selectedWertpapiereMonat;

    let lastGeneratedNumber = selectedWertpapiereTag + selectedWertpapiereMonat; // Initialwert (Startpunkt der Sequenz)

    function generateIncrementalWertpapiereNumber() {
        // Hole das aktuelle Datum und Zeit
        let now = new Date();
        let timestamp = now.getTime(); // Zeitstempel in Millisekunden

        // Kombiniere den Zeitstempel und Sekunden, um einen Basiswert zu erstellen
        let baseNumber = timestamp;

        // Stelle sicher, dass die neue Nummer höher ist als die letzte
        lastGeneratedNumber = Math.max(lastGeneratedNumber + 1, baseNumber);
        let shortenedNumber = lastGeneratedNumber.toString().slice(6);

        return parseInt(shortenedNumber, 10); // Rückgabe als Zahl
    }


    document.getElementById('wertpapiereAuftragsnummer').textContent = generateIncrementalWertpapiereNumber();

    const useScriptWertpapiere = document.getElementById('scriptJahrWertpapiere').checked;
    if (!useScriptWertpapiere) {
        // Verwende das Jahr aus dem Textfeld
        const selectedJahr = document.getElementById('jahrWertpapiere');
        const yearelementsWithClass = document.querySelectorAll('.aktuellesJahrWertpapiere');
        for (const yearelement of yearelementsWithClass) {
            yearelement.textContent = selectedJahr.value;
        }

    } else {

        const customDefs = document.getElementById('customDefsWertpapiere');
        const customJsScript = document.getElementById('customJsWertpapiere');
        const useScriptWertpapiere = document.getElementById('scriptJahrWertpapiere').checked;

        if (customJsScript) {
            customJsScript.remove();
        }

        if (useScriptWertpapiere) {
            // Füge das dynamische Script zum SVG hinzu
            const dynamicScript = document.createElement('script');
            dynamicScript.type = 'text/javascript';
            dynamicScript.id = 'customJsWertpapiere';
            dynamicScript.text = `
            function getCurrentYear() {
                return new Date().getFullYear();
            }

            function SVGonLoadWertpapiere() {
                const currentDate = new Date();
                const currentYear = getCurrentYear();
                const elementsWithClass = document.querySelectorAll('.aktuellesJahrWertpapiere');
                for (const element of elementsWithClass) {
                    element.textContent = currentYear;
                }
            }
        `;

            customDefs.appendChild(dynamicScript);

        }
        SVGonLoadWertpapiere(); // Aktualisiere das SVG-Dokument basierend auf dem neuen Status der Checkbox


    }


    loadWertpapiereData() // Laden der Anlagen-Daten
}

async function bescheidApplySVGholen() {
    if (!validateInputs()) {
        // Wenn die Validierung fehlschlägt, stoppe die Funktion
        return;
    }


    let selectedBescheid = document.getElementById("svgDropdownBescheid").value;
    let svgContainerBescheid = document.getElementById("bescheidContainer");

    // Laden der SVG-Vorlage und Aktualisieren des Containers
    try {
        let svgData = await loadSVGTemplate(selectedBescheid);
        svgContainerBescheid.innerHTML = svgData;
    } catch (error) {
        console.error("Fehler beim Anwenden der Daten:", error);
    }

    const selectedBescheidTag = document.getElementById('tagBescheid').value;
    const selectedBescheidMonat = document.getElementById('monatBescheid').value;
    document.getElementById('bescheidTag').textContent = selectedBescheidTag;
    document.getElementById('bescheidMonat').textContent = selectedBescheidMonat;

    // Grundsteuer
    const bescheidMessbetragInput = document.getElementById('bescheidMessbetragInput').value;
    const bescheidMessbetrag = document.getElementById('bescheidMessbetrag');
    const bescheidHebesatzInput = document.getElementById('bescheidHebesatzInput').value;
    const bescheidHebesatz = document.getElementById('bescheidHebesatz');

    if (bescheidMessbetrag) {
        bescheidMessbetrag.textContent = FormatHelper.currency(bescheidMessbetragInput);
    }

    if (bescheidHebesatz) {
        bescheidHebesatz.textContent = bescheidHebesatzInput + " %";
    }

    let bescheidJahressteuer = document.getElementById('bescheidJahressteuer');
    if (bescheidJahressteuer) {
        let bescheidMessbetragInput = parseFloat(document.getElementById('bescheidMessbetragInput').value);
        let bescheidHebesatzInput = parseFloat(document.getElementById('bescheidHebesatzInput').value);
        let bescheidBerechnungJahressteuer = bescheidMessbetragInput * (bescheidHebesatzInput / 100);
        bescheidJahressteuer.textContent = FormatHelper.currency(bescheidBerechnungJahressteuer);
        bescheidRate = FormatHelper.currency((bescheidBerechnungJahressteuer / 4));
        const elementsWithClassbescheidRate = document.getElementsByClassName('bescheidRate');
        // Iteriere durch alle Elemente und setze das formatierte Datum
        for (const element of elementsWithClassbescheidRate) {
            element.textContent = bescheidRate;
        }

    }

    // Abfallentsorgung
    const bescheidAbfallgebuehrInput = document.getElementById('bescheidAbfallgebuehrInput').value;
    const bescheidAbfallgebuehr = document.getElementById('bescheidAbfallgebuehr');
    if (bescheidAbfallgebuehr) {
        bescheidAbfallgebuehr.textContent = FormatHelper.currency(bescheidAbfallgebuehrInput);
    }

    const bescheidAbfallbezeichnungInput = document.getElementById('bescheidAbfallbezeichnungInput').value;
    const bescheidAbfallbezeichnung = document.getElementById('bescheidAbfallbezeichnung');
    if (bescheidAbfallbezeichnung) {
        bescheidAbfallbezeichnung.textContent = bescheidAbfallbezeichnungInput;
    }


    const useScriptBescheid = document.getElementById('scriptJahrBescheid').checked;
    if (!useScriptBescheid) {
        // Verwende das Jahr aus dem Textfeld
        const selectedJahr = document.getElementById('jahrBescheid');
        const yearelementsWithClass = document.querySelectorAll('.aktuellesJahrBescheid');
        for (const yearelement of yearelementsWithClass) {
            yearelement.textContent = selectedJahr.value;
        }

    } else {

        const customDefs = document.getElementById('customDefsBescheid');
        const customJsScript = document.getElementById('customJsBescheid');
        const useScriptBescheid = document.getElementById('scriptJahrBescheid').checked;

        if (customJsScript) {
            customJsScript.remove();
        }

        if (useScriptBescheid) {
            // Füge das dynamische Script zum SVG hinzu
            const dynamicScript = document.createElement('script');
            dynamicScript.type = 'text/javascript';
            dynamicScript.id = 'customJsBescheid';
            dynamicScript.text = `
            function getCurrentYear() {
                return new Date().getFullYear();
            }

            function SVGonLoadBescheid() {
                const currentDate = new Date();
                const currentYear = getCurrentYear();
                const elementsWithClass = document.querySelectorAll('.aktuellesJahrBescheid');
                for (const element of elementsWithClass) {
                    element.textContent = currentYear;
                }
            }
        `;

            customDefs.appendChild(dynamicScript);

        }
        SVGonLoadBescheid(); // Aktualisiere das SVG-Dokument basierend auf dem neuen Status der Checkbox

    }

    loadBescheidData() // Laden der Bescheid-Daten
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
    wertpapiere: { id: 'wertpapiereContainer', name: 'wertpapier' }
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
        'bescheidHebesatzInput': { min: 0, max: 999, label: 'Hebesatz' }
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