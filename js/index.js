// ============================================================================
// BENUTZERDEFINIERTE UNTERNEHMEN - LOCAL STORAGE VERWALTUNG
// ============================================================================

let yamlData = []; // Initialize yamlData as an empty array

// ============================================================================
// YAML/DATEN-VERWALTUNG
// ============================================================================

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
  displayUserCompanies();
  populateAllCompaniesDropdown();

    console.log('Finale yamlData hat jetzt', yamlData.length, 'Unternehmen (Basis + eigene)');
}

// Event Listener für Dropdown-Änderungen erweitern
document.getElementById('allCompaniesDropdown')?.addEventListener('change', function() {
    const selectedName = this.value;
    const setButton = document.getElementById('setMyCompanyButton');
    const myCompanyName = localStorage.getItem('myCompany');
    
    // Button aktivieren/deaktivieren
    if (setButton) {
        setButton.disabled = !selectedName || (selectedName === myCompanyName);
    }
    
    if (!selectedName) return;

    const company = yamlData.find(c => c.unternehmen.name === selectedName);
    if (!company) return;

    // Beispiel: In einem Div anzeigen
    const previewDiv = document.getElementById('companyPreview');
    if (previewDiv) {
        const isMyCompany = (selectedName === myCompanyName);
        const myCompanyBadge = isMyCompany 
            ? '<span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 3px; font-size: 0.85em; margin-left: 8px;">★ Mein Unternehmen</span>' 
            : '';
        
        previewDiv.innerHTML = `
            <strong>${company.unternehmen.name} ${company.unternehmen.rechtsform}</strong>${myCompanyBadge}<br>
            Branche: ${company.unternehmen.branche}<br>
            Ort: ${company.unternehmen.adresse.plz} ${company.unternehmen.adresse.ort}<br>
            E-Mail: ${company.unternehmen.kontakt.email || '–'}
        `;
    }
});

// Funktion zum Befüllen des Dropdowns mit allen Unternehmen
// Funktion zum Befüllen des Dropdowns mit allen Unternehmen
function populateAllCompaniesDropdown() {
    const dropdown = document.getElementById('allCompaniesDropdown');
    if (!dropdown) return; // Sicherheitsabfrage

    // Leeren
    dropdown.innerHTML = '<option value="">— Bitte auswählen —</option>';

    if (!yamlData || yamlData.length === 0) {
        dropdown.innerHTML += '<option disabled>Keine Unternehmen verfügbar</option>';
        return;
    }

    // Sortieren (optional – nach Branche + Name)
    const sortedCompanies = [...yamlData].sort((a, b) => {
        const brancheA = a.unternehmen?.branche || '';
        const brancheB = b.unternehmen?.branche || '';
        if (brancheA !== brancheB) return brancheA.localeCompare(brancheB);
        return a.unternehmen?.name?.localeCompare(b.unternehmen?.name || '');
    });

    // Optionen erstellen
    sortedCompanies.forEach(company => {
        const u = company.unternehmen;
        const obsolete = company._obsolete === true;
        
        const option = document.createElement('option');
        option.value = u.name;
        
        // Text: Branche – Name Rechtsform (mit Hinweis bei obsolet)
        let text = `${u.branche ? u.branche + ' – ' : ''}${u.name} ${u.rechtsform || ''}`;
        if (obsolete) {
            text += ' (✗ obsolet)';
            option.style.color = '#dc3545';
            option.style.fontStyle = 'italic';
        }
        
        option.textContent = text;
        dropdown.appendChild(option);
    });

    console.log(`Dropdown befüllt mit ${sortedCompanies.length} Unternehmen`);
    
    // NEU: Aktualisiere "Mein Unternehmen" Status nach dem Befüllen
    updateMyCompanyStatus();
    
    // NEU: Auto-select in Dropdowns mit class="meinUnternehmen"
    autoSelectMyCompany();
}


document.getElementById('allCompaniesDropdown')?.addEventListener('change', function() {
    const selectedName = this.value;
    const setButton = document.getElementById('setMyCompanyButton');
    const myCompanyName = localStorage.getItem('myCompany');
    
    // Button aktivieren/deaktivieren
    if (setButton) {
        setButton.disabled = !selectedName || (selectedName === myCompanyName);
    }
    
    if (!selectedName) return;

    const company = yamlData.find(c => c.unternehmen.name === selectedName);
    if (!company) return;

    // Beispiel: In einem Div anzeigen
    const previewDiv = document.getElementById('companyPreview');
    if (previewDiv) {
        const isMyCompany = (selectedName === myCompanyName);
        const myCompanyBadge = isMyCompany 
            ? '<span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 3px; font-size: 0.85em; margin-left: 8px;">★ Mein Unternehmen</span>' 
            : '';
        
        previewDiv.innerHTML = `
            <strong>${company.unternehmen.name} ${company.unternehmen.rechtsform}</strong>${myCompanyBadge}<br>
            Branche: ${company.unternehmen.branche}<br>
            Ort: ${company.unternehmen.adresse.plz} ${company.unternehmen.adresse.ort}<br>
            E-Mail: ${company.unternehmen.kontakt.email || '–'}
        `;
    }
});

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
                    displayUserCompanies();
                    markObsoleteUserCompanies();    
                    initializeYamlData();
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



let uploadedLogoBase64 = null; // Globale Variable für hochgeladenes Logo

// Logo-Upload-Handler
function handleLogoUpload(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('logoPreview');
    
    if (!file) {
        uploadedLogoBase64 = null;
        preview.innerHTML = '<small style="color: #666;">Keine Datei ausgewählt</small>';
        return;
    }
    
    // Prüfe Dateityp
    const validTypes = ['image/svg+xml'];
    if (!validTypes.includes(file.type)) {
        alert('Bitte nur SVG-Dateien hochladen.');
        event.target.value = '';
        uploadedLogoBase64 = null;
        preview.innerHTML = '<small style="color: #666;">Keine Datei ausgewählt</small>';
        return;
    }
    
    // Prüfe Dateigröße (max 500KB)
    if (file.size > 500 * 1024) {
        alert('Die Datei ist zu groß. Maximal 500KB erlaubt.');
        event.target.value = '';
        uploadedLogoBase64 = null;
        preview.innerHTML = '<small style="color: #666;">Keine Datei ausgewählt</small>';
        return;
    }
    
    // Konvertiere zu Base64
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedLogoBase64 = e.target.result;
        preview.innerHTML = `
            <img src="${uploadedLogoBase64}" style="max-width: 150px; max-height: 80px; border: 1px solid #ccc; padding: 5px;">
            <br><small style="color: #28a745;">✓ Logo hochgeladen</small>
        `;
    };
    reader.onerror = function() {
        alert('Fehler beim Lesen der Datei.');
        uploadedLogoBase64 = null;
        preview.innerHTML = '<small style="color: #666;">Keine Datei ausgewählt</small>';
    };
    reader.readAsDataURL(file);
}

// Funktion zum Abrufen der benutzerdefinierten Unternehmen aus dem Local Storage
function getUserCompanies() {
    const stored = localStorage.getItem('userCompanies');
    return stored ? JSON.parse(stored) : [];
}

// Funktion zum Speichern der benutzerdefinierten Unternehmen im Local Storage
function saveUserCompanies(companies) {
    localStorage.setItem('userCompanies', JSON.stringify(companies));
}

// Funktion zum Generieren einer eindeutigen ID
function generateCompanyId() {
    const userCompanies = getUserCompanies();
    const existingIds = userCompanies.map(c => c.unternehmen.id);
    let newId = Math.floor(Math.random() * 9000) + 1000;
    
    // Stelle sicher, dass die ID einzigartig ist
    while (existingIds.includes(newId)) {
        newId = Math.floor(Math.random() * 9000) + 1000;
    }
    
    return newId;
}

/// Validierungs-Hilfsfunktionen
const CompanyValidation = {
    // Verhindere XSS und HTML-Tags
    sanitizeInput: (input) => {
        if (!input) return '';
        // Entferne HTML-Tags und Script-Tags
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]+>/g, '')
            .replace(/[{}]/g, '')
            .trim();
    },
    
    // Validiere Text (Buchstaben, Umlaute, Sonderzeichen)
    isValidText: (value, maxLength = 50, allowNumbers = false) => {
        if (!value) return true; // Optional field
        const sanitized = CompanyValidation.sanitizeInput(value);
        if (sanitized.length > maxLength) return false;
        if (!allowNumbers && /\d/.test(sanitized)) return false;
        return true;
    },
    
    // Validiere PLZ (genau 5 Ziffern)
    isValidPLZ: (value) => {
        if (!value) return true;
        return /^[0-9]{5}$/.test(value.trim());
    },
    
    // Validiere Telefon
    isValidPhone: (value) => {
        if (!value) return true;
        const sanitized = value.trim();
        return /^[0-9\s\+\-\/()]{0,25}$/.test(sanitized);
    },
    
    // Validiere E-Mail
    isValidEmail: (value) => {
        if (!value) return true;
        const sanitized = value.trim();
        return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(sanitized) 
            && sanitized.length <= 60;
    },
    
    // Validiere Website
    isValidWebsite: (value) => {
        if (!value) return true;
        const sanitized = value.trim();
        return /^[a-zA-Z0-9.\-:/]{0,60}$/.test(sanitized);
    },
    
    // Validiere IBAN
    isValidIBAN: (value) => {
        if (!value) return true;
        const cleaned = value.replace(/\s/g, '').toUpperCase();
        // Deutsche IBAN: DE + 20 Ziffern
        return /^DE[0-9]{20}$/.test(cleaned);
    },
    
    // Validiere BIC
isValidBIC: (value) => {
    if (!value) return true;

    const cleaned = value.replace(/\s/g, '').toUpperCase();

    return /^[A-Z0-9]+$/.test(cleaned);
},
    // Validiere USt-ID
    isValidUstID: (value) => {
        if (!value) return true;
        const cleaned = value.replace(/\s/g, '').toUpperCase();
        return /^DE[0-9]{9,20}$/.test(cleaned);
    },
    
isValidSteuernummer: (value) => {
    if (!value) return true;

    const s = value.trim();
    
    // Muss mindestens eine Ziffer enthalten
    return /^[0-9\/-]*[0-9]+[0-9\/-]*$/.test(s) && s.length <= 20;
},

};


// Zusätzliche Sicherheits-Validierung (verhindert XSS auch wenn HTML-Pattern umgangen wird)
function containsDangerousChars(value) {
    if (!value) return false;
    // Prüfe auf gefährliche Zeichen
    const dangerousChars = /<|>|\{|\}|<script|javascript:|onerror=|onload=/i;
    return dangerousChars.test(value);
}

// Formular-Handler zum Hinzufügen/Bearbeiten eines Unternehmens
function handleAddCompanyForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const isEditing = form.dataset.editIndex !== undefined;
    const editIndex = parseInt(form.dataset.editIndex);
    
    
    // Hole Formulardaten
    const rawName = document.getElementById('newCompanyName').value;
    const rechtsform = document.getElementById('newCompanyRechtsform').value;
    const rawBranche = document.getElementById('newCompanyBranche').value;
    const rawMotto = document.getElementById('newCompanyMotto').value;
    const rawInhaber = document.getElementById('newCompanyInhaber').value;
    const rawStrasse = document.getElementById('newCompanyStrasse').value;
    const rawPLZ = document.getElementById('newCompanyPLZ').value;
    const rawOrt = document.getElementById('newCompanyOrt').value;
    const rawTelefon = document.getElementById('newCompanyTelefon').value;
    const rawEmail = document.getElementById('newCompanyEmail').value;
    const rawInternet = document.getElementById('newCompanyInternet').value;
    const rawBank = document.getElementById('newCompanyBank').value;
    const rawIBAN = document.getElementById('newCompanyIBAN').value;
    const rawBIC = document.getElementById('newCompanyBIC').value;
    const rawUstID = document.getElementById('newCompanyUstID').value;
    const rawSteuernummer = document.getElementById('newCompanySteuernummer').value;
    const akzent = document.getElementById('newCompanyAkzent').value;
    
    // Erste Sicherheitsschicht: Prüfe auf gefährliche Zeichen
    const allInputs = [
        rawName, rawBranche, rawMotto, rawInhaber, rawStrasse, 
        rawOrt, rawTelefon, rawEmail, rawInternet, rawBank, 
        rawIBAN, rawBIC, rawUstID, rawSteuernummer
    ];
    
    for (const input of allInputs) {
        if (containsDangerousChars(input)) {
            alert('Ungültige Eingabe erkannt: Die Zeichen <, >, {, }, <script>, javascript: und Event-Handler sind nicht erlaubt.');
            return;
        }
    }
    
    // Sanitize alle Eingaben
    const name = CompanyValidation.sanitizeInput(rawName);

    // ===================================================================
    // NEU: Prüfe nur den NAMEN (ohne Rechtsform)
    // ===================================================================
    const existierendesUnternehmen = yamlData.find(company => {
        return company.unternehmen.name.toLowerCase() === name.toLowerCase();
    });
    
    // Wenn Duplikat gefunden UND wir bearbeiten nicht gerade dieses Unternehmen
    if (existierendesUnternehmen) {
        if (isEditing) {
            // Beim Bearbeiten: Erlaube den gleichen Namen nur für das aktuell bearbeitete Unternehmen
            const userCompanies = getUserCompanies();
            const currentCompany = userCompanies[editIndex];
            
            if (currentCompany.unternehmen.name.toLowerCase() !== name.toLowerCase()) {
                alert(`Ein Unternehmen mit dem Namen "${name}" existiert bereits!\n\nBitte wählen Sie einen anderen Namen.`);
                return;
            }
        } else {
            // Beim Hinzufügen: Kein Duplikat erlaubt
            alert(`Ein Unternehmen mit dem Namen "${name}" existiert bereits!\n\nBitte wählen Sie einen anderen Namen.`);
            return;
        }
    }
    // ===================================================================
    
    const branche = CompanyValidation.sanitizeInput(rawBranche);
    const motto = CompanyValidation.sanitizeInput(rawMotto);
    const inhaber = CompanyValidation.sanitizeInput(rawInhaber);
    const strasse = CompanyValidation.sanitizeInput(rawStrasse);
    const plz = rawPLZ.trim();
    const ort = CompanyValidation.sanitizeInput(rawOrt);
    const telefon = rawTelefon.trim();
    const email = rawEmail.trim().toLowerCase();
    const internet = rawInternet.trim().toLowerCase();
    const bank = CompanyValidation.sanitizeInput(rawBank);
    const iban = rawIBAN.replace(/\s/g, '').toUpperCase();
    const bic = rawBIC.replace(/\s/g, '').toUpperCase();
    const ustId = rawUstID.replace(/\s/g, '').toUpperCase();
    const steuernummer = rawSteuernummer.trim();
    
    // ALLE Pflichtfeld-Validierungen
    if (!name || name.length === 0) {
        alert('Bitte geben Sie einen Firmennamen ein.');
        return;
    }
    
    if (!rechtsform || rechtsform === '') {
        alert('Bitte wählen Sie eine Rechtsform aus.');
        return;
    }
    
    if (!branche || branche.length === 0) {
        alert('Bitte geben Sie eine Branche ein.');
        return;
    }
    
    if (!motto || motto.length === 0) {
        alert('Bitte geben Sie ein Motto ein.');
        return;
    }
    
    if (!inhaber || inhaber.length === 0) {
        alert('Bitte geben Sie einen Inhaber/Geschäftsführer ein.');
        return;
    }
    
    if (!strasse || strasse.length === 0) {
        alert('Bitte geben Sie eine Straße ein.');
        return;
    }
    
    if (!plz || plz.length === 0) {
        alert('Bitte geben Sie eine PLZ ein.');
        return;
    }
    
    if (!ort || ort.length === 0) {
        alert('Bitte geben Sie einen Ort ein.');
        return;
    }
    
    if (!telefon || telefon.length === 0) {
        alert('Bitte geben Sie eine Telefonnummer ein.');
        return;
    }
    
    if (!email || email.length === 0) {
        alert('Bitte geben Sie eine E-Mail-Adresse ein.');
        return;
    }
    
    if (!internet || internet.length === 0) {
        alert('Bitte geben Sie eine Internet-Adresse ein.');
        return;
    }
    
    if (!bank || bank.length === 0) {
        alert('Bitte geben Sie eine Bank ein.');
        return;
    }
    
    if (!iban || iban.length === 0) {
        alert('Bitte geben Sie eine IBAN ein.');
        return;
    }
    
    if (!bic || bic.length === 0) {
        alert('Bitte geben Sie einen BIC ein.');
        return;
    }
    
    if (!ustId || ustId.length === 0) {
        alert('Bitte geben Sie eine USt-IdNr. ein.');
        return;
    }
    
    if (!steuernummer || steuernummer.length === 0) {
        alert('Bitte geben Sie eine Steuernummer ein.');
        return;
    }
    
    // Detaillierte Format-Validierungen
    if (!CompanyValidation.isValidText(name, 50, true)) {
        alert('Firmenname: Maximal 50 Zeichen, keine HTML-Tags oder Scripte.');
        return;
    }
    
    if (!CompanyValidation.isValidText(branche, 50, true)) {
        alert('Branche: Maximal 50 Zeichen, keine HTML-Tags oder Scripte.');
        return;
    }
    
    if (!CompanyValidation.isValidText(motto, 100, true)) {
        alert('Motto: Maximal 100 Zeichen, keine HTML-Tags oder Scripte.');
        return;
    }
    
    if (!CompanyValidation.isValidText(inhaber, 50, false)) {
        alert('Inhaber: Maximal 50 Zeichen, nur Buchstaben, keine Zahlen.');
        return;
    }
    
    if (!CompanyValidation.isValidText(strasse, 60, true)) {
        alert('Straße: Maximal 60 Zeichen, keine HTML-Tags oder Scripte.');
        return;
    }
    
    if (!CompanyValidation.isValidPLZ(plz)) {
        alert('PLZ: Bitte geben Sie genau 5 Ziffern ein.');
        return;
    }
    
    if (!CompanyValidation.isValidText(ort, 50, false)) {
        alert('Ort: Maximal 50 Zeichen, nur Buchstaben.');
        return;
    }
    
    if (!CompanyValidation.isValidPhone(telefon)) {
        alert('Telefon: Ungültiges Format. Nur Zahlen und + - / ( ) erlaubt, maximal 25 Zeichen.');
        return;
    }
    
    if (!CompanyValidation.isValidEmail(email)) {
        alert('E-Mail: Bitte geben Sie eine gültige E-Mail-Adresse ein (maximal 60 Zeichen).');
        return;
    }
    
    if (!CompanyValidation.isValidWebsite(internet)) {
        alert('Internet: Ungültiges Format. Nur Buchstaben, Zahlen und . - : / erlaubt, maximal 60 Zeichen.');
        return;
    }
    
    if (!CompanyValidation.isValidText(bank, 50, true)) {
        alert('Bank: Maximal 50 Zeichen, keine HTML-Tags oder Scripte.');
        return;
    }
    
    if (!CompanyValidation.isValidIBAN(iban)) {
        alert('IBAN: Ungültiges Format. Erforderlich: DE + 20 Ziffern (z.B. DE89370400440532013000).');
        return;
    }
    
    if (!CompanyValidation.isValidBIC(bic)) {
        alert('BIC: Ungültiges Format. Erforderlich: 8 oder 11 Zeichen (z.B. COBADEFFXXX).');
        return;
    }
    
    if (!CompanyValidation.isValidUstID(ustId)) {
        alert('USt-IdNr.: Ungültiges Format. Erforderlich: DE + 9 Ziffern (z.B. DE123456789).');
        return;
    }
    
    if (!CompanyValidation.isValidSteuernummer(steuernummer)) {
        alert('Steuernummer: Nur Zahlen und / erlaubt, maximal 20 Zeichen.');
        return;
    }
    
    // Hole oder generiere ID
    let companyId;
    if (isEditing) {
        const userCompanies = getUserCompanies();
        companyId = userCompanies[editIndex].unternehmen.id;
    } else {
        companyId = generateCompanyId();
    }
    
    // Erstelle Unternehmensobjekt
    const newCompany = {
        unternehmen: {
            id: companyId,
            name: name,
            rechtsform: rechtsform,
            branche: branche,
            motto: motto,
            inhaber: inhaber,
            logo: uploadedLogoBase64 || '',
            adresse: {
                strasse: strasse,
                plz: plz,
                ort: ort,
                land: 'Deutschland'
            },
            kontakt: {
                telefon: telefon,
                email: email,
                internet: internet
            },
            bank: bank,
            iban: iban,
            bic: bic,
            ust_id: ustId,
            steuernummer: steuernummer,
            akzent: akzent
        },
        _permanentlyValid: true,
    };
    
    // Speichere im Local Storage
  const userCompanies = getUserCompanies();

if (isEditing) {
    userCompanies[editIndex] = newCompany;
    userCompanies[editIndex]._isUserAdded = true;
    delete userCompanies[editIndex]._obsolete;     // explizit zurücksetzen
    saveUserCompanies(userCompanies);

    // Wenn es vorher obsolet war → Flag explizit entfernen
    if (userCompanies[editIndex]._obsolete) {
        delete userCompanies[editIndex]._obsolete;
    }

    saveUserCompanies(userCompanies);

    if (userCompanies[editIndex]._obsolete === undefined) {  // war vorher obsolet
        alert('Unternehmen erfolgreich wieder hinzugefügt und aktualisiert!');
        updateLocalStorageStatus('Unternehmen reaktiviert.');
    } else {
        alert('Unternehmen erfolgreich aktualisiert!');
        updateLocalStorageStatus('Unternehmen aktualisiert.');
    }
} else {
    // Neues Unternehmen
    userCompanies.push(newCompany);
    saveUserCompanies(userCompanies);
    alert('Unternehmen erfolgreich hinzugefügt!');
    updateLocalStorageStatus('Eigenes Unternehmen hinzugefügt.');
}

// WICHTIG: Nach jedem Speichern neu mergen + prüfen + anzeigen
mergeUserCompaniesIntoYamlData();
markObsoleteUserCompanies();
displayUserCompanies();
populateAllCompaniesDropdown();

// Formular zurücksetzen
form.reset();
delete form.dataset.editIndex;
uploadedLogoBase64 = null;
document.getElementById('logoPreview').innerHTML = '<small style="color: #666;">Keine Datei ausgewählt</small>';

const submitButton = form.querySelector('button[type="submit"]');
submitButton.textContent = '✓ Unternehmen hinzufügen';
submitButton.style.background = '#28a745';

// Hinweis ausblenden
const hint = document.getElementById('editHint');
if (hint) hint.style.display = 'none';
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
// Funktion zum Anzeigen der benutzerdefinierten Unternehmen
function displayUserCompanies() {
    const userCompanies = getUserCompanies();
    const container = document.getElementById('userCompanyList');
    
    if (!container) return;
    
    if (userCompanies.length === 0) {
        container.innerHTML = '<p style="color: #666; font-style: italic;">Noch keine eigenen Unternehmen hinzugefügt.</p>';
        return;
    }
    
    let html = '<div style="display: grid; gap: 15px;">';
    
    userCompanies.forEach((company, index) => {
        const u = company.unternehmen;
        const isObsolete = company._obsolete === true;
        
        const style = isObsolete 
            ? 'opacity: 0.5; background: #fff5f5; border-color: #ffcccc;'
            : 'background: #f9f9f9; border-color: #ddd;';

        const obsoleteBadge = isObsolete 
            ? '<span style="color:#dc3545; font-weight:bold; font-size:0.9em;"> × Nicht mehr in der Quelldatei</span>'
            : '';

        html += `
            <div style="border: 1px solid; padding: 15px; border-radius: 4px; ${style}">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div style="flex: 1;">
                        <h4 style="margin: 0 0 10px 0;">
                            ${u.name} ${u.rechtsform}
                            ${obsoleteBadge}
                        </h4>
                        <p style="margin: 5px 0; color: #666;">
                            <strong>Branche:</strong> ${u.branche}<br>
                            <strong>Ort:</strong> ${u.adresse.ort}
                            ${u.kontakt.email ? `<br><strong>E-Mail:</strong> ${u.kontakt.email}` : ''}
                        </p>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="editUserCompany(${index})" style="background: #007bff; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; ${isObsolete ? 'opacity:0.6;' : ''}">
                            ✎ Bearbeiten
                        </button>
                        <button onclick="deleteUserCompany(${index})" style="background: #dc3545; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">
                            ✕ Löschen
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

// Funktion zum Löschen eines benutzerdefinierten Unternehmens
function deleteUserCompany(index) {
    if (!confirm('Möchten Sie dieses Unternehmen wirklich löschen?')) {
        return;
    }
    
    const userCompanies = getUserCompanies();
    userCompanies.splice(index, 1);
    saveUserCompanies(userCompanies);
    
    // Wenn alle benutzerdefinierten Unternehmen gelöscht wurden
    if (userCompanies.length === 0) {
        // Lade die Standard-YAML-Daten neu
        loadStandardYamlData();
        updateLocalStorageStatus('Alle eigenen Unternehmen gelöscht. Standard-Daten wiederhergestellt.');
    } else {
        mergeUserCompaniesIntoYamlData();
        updateLocalStorageStatus('Unternehmen gelöscht.');
    }
    
    displayUserCompanies();
    populateAllCompaniesDropdown();
}

// Funktion zum Bearbeiten eines benutzerdefinierten Unternehmens
function editUserCompany(index) {
const userCompanies = getUserCompanies();
    const company = userCompanies[index];
    const u = company.unternehmen;
    const isObsolete = company._obsolete === true;
  
    // Fülle das Formular mit den aktuellen Daten
    document.getElementById('newCompanyName').value = u.name;
    document.getElementById('newCompanyRechtsform').value = u.rechtsform;
    document.getElementById('newCompanyBranche').value = u.branche;
    document.getElementById('newCompanyMotto').value = u.motto;
    document.getElementById('newCompanyInhaber').value = u.inhaber;
    document.getElementById('newCompanyStrasse').value = u.adresse.strasse;
    document.getElementById('newCompanyPLZ').value = u.adresse.plz;
    document.getElementById('newCompanyOrt').value = u.adresse.ort;
    document.getElementById('newCompanyTelefon').value = u.kontakt.telefon;
    document.getElementById('newCompanyEmail').value = u.kontakt.email;
    document.getElementById('newCompanyInternet').value = u.kontakt.internet;
    document.getElementById('newCompanyBank').value = u.bank;
    document.getElementById('newCompanyIBAN').value = u.iban;
    document.getElementById('newCompanyBIC').value = u.bic;
    document.getElementById('newCompanyUstID').value = u.ust_id;
    document.getElementById('newCompanySteuernummer').value = u.steuernummer;
    document.getElementById('newCompanyAkzent').value = u.akzent;
    
    // Setze das Logo
   uploadedLogoBase64 = u.logo;
    const preview = document.getElementById('logoPreview');
    if (u.logo) {
        preview.innerHTML = `
            <img src="${u.logo}" style="max-width: 150px; max-height: 80px; border: 1px solid #ccc; padding: 5px;">
            <br><small style="color: #28a745;">✓ Aktuelles Logo</small>
        `;
    } else {
        preview.innerHTML = '<small style="color: #666;">Keine Datei ausgewählt</small>';
    }

    const form = document.getElementById('addCompanyForm');
    const submitButton = form.querySelector('button[type="submit"]');

    if (isObsolete) {
        submitButton.textContent = '→ Wieder hinzufügen';
        submitButton.style.background = '#fd7e14';      // orange / warnfarbe
        submitButton.style.color = 'white';
        submitButton.title = 'Unternehmen wieder in die aktuelle Datenbasis aufnehmen';
    } else {
        submitButton.textContent = '✓ Änderungen speichern';
        submitButton.style.background = '#ffc107';      // gelb (wie bisher)
        submitButton.style.color = 'black';
    }

    // Wichtig: Merken, dass wir im Bearbeiten-Modus sind + Index
    form.dataset.editIndex = index;

    let hint = document.getElementById('editHint');
    

if (!hint) {
    hint = document.createElement('p');
    hint.id = 'editHint';
    hint.style.color = '#dc3545';
    hint.style.margin = '0 0 12px 0';
    hint.style.padding = '8px 12px';
    hint.style.background = '#fff5f5';
    hint.style.borderLeft = '4px solid #dc3545';
    hint.style.borderRadius = '3px';
    
    // Sicher als erstes Kind ins Formular einfügen
    form.prepend(hint);
}

if (isObsolete) {
    hint.textContent = '⚠ Dieses Unternehmen fehlt in der aktuellen Quelldatei. ' +
                       'Bearbeiten Sie es und klicken Sie auf „Wieder hinzufügen“, um es wieder aufzunehmen.';
    hint.style.display = 'block';
} else {
    hint.style.display = 'none';
}
    
    // Scrolle zum Formular
    const detailsElement = document.querySelector('details[open]');
    if (detailsElement) {
        detailsElement.scrollIntoView({ behavior: 'smooth' });
    } else {
        // Öffne das Details-Element, falls geschlossen
        const addCompanyDetails = document.querySelector('details summary:contains("Eigenes Unternehmen hinzufügen")');
        if (addCompanyDetails && addCompanyDetails.parentElement) {
            addCompanyDetails.parentElement.open = true;
            addCompanyDetails.parentElement.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
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

// Funktion zum Exportieren der aktuellen YAML-Daten (inkl. Benutzerunternehmen)
function exportCurrentYamlData() {
    try {
        // 1. Nur nicht-obsolete Unternehmen auswählen
        const exportData = yamlData.filter(company => company._obsolete !== true);

        // 2. Alle internen Flags (_obsolete, _permanentlyValid, ...) entfernen
        const cleanExportData = exportData.map(company => {
            // flache Kopie des gesamten Objekts erstellen
            const clean = { ...company };

            // Unternehmen-Objekt bereinigen
            if (clean.unternehmen) {
                clean.unternehmen = { ...clean.unternehmen };
            }

            // Alle Keys entfernen, die mit _ beginnen (inkl. _obsolete, _permanentlyValid usw.)
            Object.keys(clean).forEach(key => {
                if (key.startsWith('_')) {
                    delete clean[key];
                }
            });

            // Falls Flags tief im unternehmen-Objekt liegen (selten, aber sicher ist sicher)
            if (clean.unternehmen) {
                Object.keys(clean.unternehmen).forEach(key => {
                    if (key.startsWith('_')) {
                        delete clean.unternehmen[key];
                    }
                });
            }

            return clean;
        });

        // 3. Sortierung (optional, aber schön)
        cleanExportData.sort((a, b) => {
            const brancheA = a.unternehmen?.branche || '';
            const brancheB = b.unternehmen?.branche || '';
            return brancheA.localeCompare(brancheB);
        });

        // 4. YAML erzeugen und downloaden
        const yamlString = jsyaml.dump(cleanExportData);
        const blob = new Blob([yamlString], { type: 'text/yaml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'meine_unternehmen.yml';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        alert(`Export erfolgreich: ${cleanExportData.length} Unternehmen`);
    } catch (error) {
        console.error('Export-Fehler:', error);
        alert('Fehler beim Exportieren der Daten.');
    }
}




// Modifizierte Funktion zum Laden der hochgeladenen Daten
function loadUploadedDataFromLocalStorage() {
    initializeYamlData(); // 
}



// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {
// Standard-Daten initialisieren (falls nötig)
    if (!localStorage.getItem('standardYamlData')) {
        loadStandardYamlData();
    }

    // Komplette YAML-Initialisierung + Merge + Mark + Display
    initializeYamlData();
    updateMyCompanyStatus();
    autoSelectMyCompany();
    
    // Füge Export-Button hinzu (optional)
    const modellunternehmenSection = document.getElementById('modellunternehmen');
    if (modellunternehmenSection && !document.getElementById('exportYamlButton')) {
        const exportButton = document.createElement('button');
        exportButton.id = 'exportYamlButton';
        exportButton.textContent = 'Aktuelle Unternehmen exportieren';
        exportButton.onclick = exportCurrentYamlData;
        
        // Füge den Button nach dem "Daten zurücksetzen" Button ein
        const resetButton = modellunternehmenSection.querySelector('button');
        if (resetButton && resetButton.parentNode) {
            resetButton.parentNode.insertBefore(exportButton, resetButton.nextSibling);
        }
    }
});


// Modifizierte deleteAndLoadDefaultData Funktion
function deleteAndLoadDefaultData() {
    if (!confirm('Möchten Sie wirklich die Daten zurücksetzen? Ihre eigenen Unternehmen bleiben erhalten')) {
        return;
    }
    
    // Lösche alle benutzerdefinierten Daten
    localStorage.removeItem('uploadedYamlCompanyData');
    localStorage.removeItem('standardYamlData');
    
    // Setze Datei-Input zurück
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
    
    // Lade Standard-YAML-Daten neu
    loadStandardYamlData();
    initializeYamlData();
    
    // Aktualisiere Anzeige
    displayUserCompanies();
    uploadedLogoBase64 = null;
    document.getElementById('logoPreview').innerHTML = '<small style="color: #666;">Keine Datei ausgewählt</small>';
    document.getElementById('addCompanyForm').reset();
    
    updateLocalStorageStatus('Alle Daten wurden erfolgreich zurückgesetzt.');
    alert('Daten erfolgreich zurückgesetzt.');
}

function markObsoleteUserCompanies() {
    const userCompanies = getUserCompanies();
    if (userCompanies.length === 0) return;

    // Hole die Basis-Liste (ohne die eigenen Unternehmen!)
    // Das ist entweder die hochgeladene YAML oder die Standard-Liste
    let baseYaml = [];
    const uploadedJSON = localStorage.getItem('uploadedYamlCompanyData');
    if (uploadedJSON) {
        try {
            baseYaml = JSON.parse(uploadedJSON);
        } catch (e) {}
    }
    if (baseYaml.length === 0) {
        const standardJSON = localStorage.getItem('standardYamlData');
        if (standardJSON) {
            baseYaml = JSON.parse(standardJSON);
        }
    }

    // Set aller offiziellen Namen aus der Basis-YAML (hochgeladen oder Standard)
    const officialNames = new Set(
        baseYaml
            .map(c => c?.unternehmen?.name?.toLowerCase?.())
            .filter(Boolean)
    );

    // Prüfung für jedes User-Unternehmen
    userCompanies.forEach(company => {
        const nameLower = company.unternehmen.name.toLowerCase();

        // Ist der Name in der aktuellen offiziellen Liste?
        const isOfficial = officialNames.has(nameLower);

        // Wenn es explizit wieder hinzugefügt / neu hinzugefügt wurde → nicht obsolet
        if (company._permanentlyValid === true) {
            company._obsolete = false;
        } else {
            // Ansonsten: obsolet, wenn nicht in offizieller Liste
            company._obsolete = !isOfficial;
        }
    });

    saveUserCompanies(userCompanies);
}


// ============================================================================
// MEIN UNTERNEHMEN - VERWALTUNG
// ============================================================================

// Funktion zum Speichern des Standard-Unternehmens
function setAsMyCompany() {
    const dropdown = document.getElementById('allCompaniesDropdown');
    const selectedName = dropdown.value;
    
    if (!selectedName) {
        alert('Bitte wählen Sie zuerst ein Unternehmen aus.');
        return;
    }
    
    const company = yamlData.find(c => c.unternehmen.name === selectedName);
    if (!company) {
        alert('Unternehmen nicht gefunden.');
        return;
    }
    
    // Speichere im Local Storage
    localStorage.setItem('myCompany', selectedName);
    
    // Aktualisiere die Anzeige
    updateMyCompanyStatus();
    
    alert(`"${selectedName}" wurde als Ihr Standard-Unternehmen gespeichert.`);
    updateLocalStorageStatus('Standard-Unternehmen gespeichert.');
}

// Funktion zum Entfernen des Standard-Unternehmens
function clearMyCompany() {
    if (!confirm('Möchten Sie Ihr Standard-Unternehmen wirklich entfernen?')) {
        return;
    }
    
    localStorage.removeItem('myCompany');
    updateMyCompanyStatus();
    
    alert('Standard-Unternehmen wurde entfernt.');
    updateLocalStorageStatus('Standard-Unternehmen entfernt.');
}

// Funktion zum Aktualisieren der Status-Anzeige
function updateMyCompanyStatus() {
    const myCompanyName = localStorage.getItem('myCompany');
    const statusDiv = document.getElementById('myCompanyStatus');
    const nameSpan = document.getElementById('myCompanyName');
    const setButton = document.getElementById('setMyCompanyButton');
    
    if (myCompanyName) {
        if (statusDiv) {
            statusDiv.style.display = 'block';
            if (nameSpan) nameSpan.textContent = myCompanyName;
        }
        // Prüfe ob das aktuell ausgewählte Unternehmen bereits "Mein Unternehmen" ist
        const dropdown = document.getElementById('allCompaniesDropdown');
        if (setButton && dropdown) {
            setButton.disabled = (dropdown.value === myCompanyName);
        }
    } else {
        if (statusDiv) statusDiv.style.display = 'none';
        if (setButton) setButton.disabled = false;
    }
}

// Funktion zum automatischen Auswählen in Dropdowns mit class="meinUnternehmen"
function autoSelectMyCompany() {
    const myCompanyName = localStorage.getItem('myCompany');
    
    if (!myCompanyName) return;
    
    // Finde alle Dropdowns mit der Klasse "meinUnternehmen"
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
