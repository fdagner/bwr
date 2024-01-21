let yamlData = []; // Initialize yamlData as an empty array
let defaultYamlData = []; // Initialize variable for default YAML data

// Function to handle file upload
function handleFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const uploadedFile = fileInput.files[0];

    if (uploadedFile) {
        const reader = new FileReader();

        reader.onload = function (e) {
            try {
                const uploadedYamlData = jsyaml.load(e.target.result);

                if (uploadedYamlData && Array.isArray(uploadedYamlData)) {
                    yamlData = uploadedYamlData;

                    // Reload dropdown and random companies based on the uploaded data
                    reloadDropdownOptions();
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


// Function to reload dropdown options based on yamlData
function reloadDropdownOptions() {
    const dropdownCustomer = document.getElementById('datenKunde');
    const dropdownSupplier = document.getElementById('datenLieferer');

    // Clear existing options
    dropdownCustomer.innerHTML = '';
    dropdownSupplier.innerHTML = '';

    yamlData.forEach(company => {
        const optionCustomer = document.createElement('option');
        optionCustomer.value = company.unternehmen.name;
        optionCustomer.text = company.unternehmen.name;
        dropdownCustomer.appendChild(optionCustomer);

        const optionSupplier = document.createElement('option');
        optionSupplier.value = company.unternehmen.name;
        optionSupplier.text = company.unternehmen.name;
        dropdownSupplier.appendChild(optionSupplier);
    });
}

// Function to load default YAML data
function loadDefaultYamlData() {
    // Load default YAML data (replace 'defaultData.yml' with your actual default YAML file)
    fetch('js/unternehmen.yml')
        .then(response => response.text())
        .then(data => {
            defaultYamlData = jsyaml.load(data);

            // Use defaultYamlData to reload dropdown and random companies
            yamlData = [...defaultYamlData]; // Use spread operator to create a copy
            reloadDropdownOptions();
        })
        .catch(error => {
            console.error("Error loading default YAML data:", error);
        });
}

// Function to delete uploaded data and load default data
function deleteAndLoadDefaultData() {

    // Zurücksetzen von yamlData auf ein leeres Array
    yamlData = [];

    // Leeren des Dateieingabewerts
    document.getElementById('fileInput').value = '';

    // Leeren der Dropdown-Optionen
    reloadDropdownOptions();

    // Laden der Standard-YAML-Daten
    loadDefaultYamlData();

    // Verwenden von defaultYamlData zum Aktualisieren der Dropdown-Liste und zufälliger Unternehmen
    yamlData = [...defaultYamlData]; // Verwende den Spread-Operator, um eine Kopie zu erstellen
    reloadDropdownOptions();

    // Erfolgsmeldung
    alert('Daten erfolgreich zurückgesetzt.');

}


// Lade die YAML-Datei und fülle das Dropdown-Feld
fetch('js/unternehmen.yml')
    .then(response => response.text())
    .then(data => {
        yamlData = jsyaml.load(data); // Assign data to yamlData variable
        const dropdownCustomer = document.getElementById('datenKunde');
        const dropdownSupplier = document.getElementById('datenLieferer');

        yamlData.forEach(company => {
            const optionCustomer = document.createElement('option');
            optionCustomer.value = company.unternehmen.name;
            optionCustomer.text = company.unternehmen.name;
            dropdownCustomer.appendChild(optionCustomer);

            const optionSupplier = document.createElement('option');
            optionSupplier.value = company.unternehmen.name;
            optionSupplier.text = company.unternehmen.name;
            dropdownSupplier.appendChild(optionSupplier);
        });

    });

let selectedSupplier;

// Lade die Unternehmensdaten basierend auf der Auswahl im Dropdown-Feld
function loadCompanyData() {
    const selectedCompanyName = document.getElementById('datenKunde').value;

    const selectedCompany = yamlData.find(company => company.unternehmen.name === selectedCompanyName);

    // Update the SVG text elements with the selected company data
    document.getElementById('nameKunde').textContent = selectedCompany.unternehmen.name + ' ' + selectedCompany.unternehmen.rechtsform;
    document.getElementById('inhaberKunde').textContent = selectedCompany.unternehmen.inhaber;
    document.getElementById('strasseKunde').textContent = selectedCompany.unternehmen.adresse.strasse;
    document.getElementById('plzKunde').textContent = selectedCompany.unternehmen.adresse.plz + ' ' + selectedCompany.unternehmen.adresse.ort;
    const rechnungsNummer = Math.floor(Math.random() * 900) + 100;
    document.getElementById('rechnungsNummer').textContent = 'NR-' + rechnungsNummer;
    nummerKunde = selectedCompany.unternehmen.id;
    loadSupplierData(nummerKunde);
}


// Lade die Unternehmensdaten basierend auf der Auswahl im Dropdown-Feld
function loadSupplierData() {
    const selectedSupplierName = document.getElementById('datenLieferer').value;
    const selectedSupplier = yamlData.find(supplier => supplier.unternehmen.name === selectedSupplierName);
    // Update the SVG text elements with the selected supplier data
    document.getElementById('nameLieferer').textContent = selectedSupplier.unternehmen.name + ' ' + selectedSupplier.unternehmen.rechtsform;
    document.getElementById('mottoLieferer').textContent = selectedSupplier.unternehmen.motto;
    document.getElementById('nameLangLieferer').textContent = selectedSupplier.unternehmen.name + ' ' + selectedSupplier.unternehmen.rechtsform;
    document.getElementById('strasseLieferer').textContent = selectedSupplier.unternehmen.adresse.strasse;
    document.getElementById('plzLieferer').textContent = selectedSupplier.unternehmen.adresse.plz + ' ' + selectedSupplier.unternehmen.adresse.ort;
    document.getElementById('adresseLieferer').textContent = selectedSupplier.unternehmen.name + ', ' + selectedSupplier.unternehmen.rechtsform + ' ' + selectedSupplier.unternehmen.adresse.strasse +
        ', ' + selectedSupplier.unternehmen.adresse.plz + ' ' + selectedSupplier.unternehmen.adresse.ort + ', ' +
        selectedSupplier.unternehmen.adresse.land;
    document.getElementById('ansprechpartnerLieferer').textContent = selectedSupplier.unternehmen.inhaber;
    document.getElementById('telefonLieferer').textContent = selectedSupplier.unternehmen.kontakt.telefon;
    document.getElementById('emailLieferer').textContent = selectedSupplier.unternehmen.kontakt.email;
    document.getElementById('internetLieferer').textContent = selectedSupplier.unternehmen.kontakt.internet;
    document.getElementById('bankLieferer').textContent = selectedSupplier.unternehmen.bank;
    document.getElementById('ibanLieferer').textContent = 'IBAN: ' + selectedSupplier.unternehmen.iban;
    document.getElementById('bicLieferer').textContent = 'BIC: ' + selectedSupplier.unternehmen.bic;
    document.getElementById('nummerKunde').textContent = nummerKunde * selectedSupplier.unternehmen.id * 3;

    let handelsregister = null;

    if (selectedSupplier.unternehmen.rechtsform !== "e. K." && selectedSupplier.unternehmen.rechtsform !== "e. Kfr." && selectedSupplier.unternehmen.rechtsform !== "OHG" && selectedSupplier.unternehmen.rechtsform !== "KG") {
        handelsregister = "HRB";
    } else {
        handelsregister = "HRA";
    }

    document.getElementById('amtsgerichtLieferer').textContent = 'Amtsgericht ' + selectedSupplier.unternehmen.adresse.ort + ' ' + handelsregister;
    document.getElementById('ustidLieferer').textContent = 'UST-IdNr.: ' + selectedSupplier.unternehmen.ust_id;
    document.getElementById('steuernummerLieferer').textContent = 'Steuernummer: ' + selectedSupplier.unternehmen.steuernummer;

  
    const logoUrl = selectedSupplier.unternehmen.logo;
    const svgContainer = document.getElementById('rechnungSVG');
    const existingImage = document.getElementById('uploaded-image');
    const rectElement = document.getElementById('logo-placeholder');
    
    // Entferne das vorhandene Bild, falls vorhanden
    if (existingImage) {
        svgContainer.removeChild(existingImage);
    }
    
    // Erstelle ein <image>-Element und füge es zur SVG hinzu
    const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    image.setAttribute('id', 'uploaded-image');
    image.setAttribute('x', rectElement.getAttribute('x'));
    image.setAttribute('y', rectElement.getAttribute('y'));
    image.setAttribute('width', rectElement.getAttribute('width'));
    image.setAttribute('height', rectElement.getAttribute('height'));
    
    // Setze den href-Attribut basierend auf logoUrl oder den Standardwert
    if (logoUrl && logoUrl.trim() !== '') {
        image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', logoUrl);
    } else {
        // Wenn der Eintrag in YAML leer ist, lade den Standard-SVG
        image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'media/pic/standard.svg');
    }
    
    svgContainer.appendChild(image);

}

// Funktion zum Laden eines Logos
function loadLogo(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const svgContainer = document.getElementById('rechnungSVG');
            const existingImage = document.getElementById('uploaded-image');
            const rectElement = document.getElementById('logo-placeholder');

            // Entferne das vorhandene Bild, falls vorhanden
            if (existingImage) {
                svgContainer.removeChild(existingImage);
            }

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


function applyOrderData() {
    if (!validateInputs()) {
        // Wenn die Validierung fehlschlägt, stoppe die Funktion
        return;
    }

    // Hole die ausgewählten Werte von Tag und Monat

    const selectedTag = document.getElementById('tag').value;
    const selectedMonat = document.getElementById('monat').value;
    
    // Formatieren von Tag und Monat
    const formattedDatum = `${selectedTag}.${selectedMonat}.`;

    // Annahme: Alle Elemente mit der Klasse 'rechnungsDatum' sollen aktualisiert werden
    const elementsWithClass = document.getElementsByClassName('rechnungsDatum');
 // Iteriere durch alle Elemente und setze das formatierte Datum
    for (const element of elementsWithClass) {
        element.textContent = formattedDatum;
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
    SVGonLoad(); // Aktualisiere das SVG-Dokument basierend auf dem neuen Status der Checkbox
    }

    
     // Lese die eingegebenen Daten aus den Input-Feldern
    const artikel = document.getElementById('artikelInput').value;
    const menge = parseFloat(document.getElementById('mengeInput').value);
    const einheit = document.getElementById('einheitInput').value;
    const einzelpreis = parseFloat(document.getElementById('einzelpreisInput').value);

    // Lese die eingegebenen Daten aus den Input-Feldern
    const artikel2 = document.getElementById('artikelInput2').value;
    const menge2 = parseFloat(document.getElementById('mengeInput2').value);
    const einheit2 = document.getElementById('einheitInput2').value;
    const einzelpreis2 = parseFloat(document.getElementById('einzelpreisInput2').value);


    const rabattInput = document.getElementById('rabattInput').value;
    const umsatzsteuerInput = document.getElementById('umsatzsteuerInput').value;
    const zahlungszielInput = document.getElementById('zahlungszielInput').value;
    const skontoInput = document.getElementById('skontoInput').value;
    const skontofristInput = document.getElementById('skontofristInput').value;
    let gesamtpreis1 = menge * einzelpreis;
    let gesamtpreis2 = menge2 * einzelpreis2;

    // Setze die gelesenen Daten in die SVG-Textelemente

    if (menge && einzelpreis) {
        gesamtpreis1 = menge * einzelpreis;
        document.getElementById('pos1').textContent = '1';
        document.getElementById('artikel1').textContent = artikel;
        document.getElementById('menge1').textContent = formatNumber(menge) + ' ' + einheit;
        document.getElementById('einzelpreis1').textContent = formatCurrency(einzelpreis);
        document.getElementById('gesamtpreis1').textContent = formatCurrency(gesamtpreis1);
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
        document.getElementById('menge2').textContent = formatNumber(menge2) + ' ' + einheit2;
        document.getElementById('einzelpreis2').textContent = formatCurrency(einzelpreis2);
        document.getElementById('gesamtpreis2').textContent = formatCurrency(gesamtpreis2);
    } else {
        gesamtpreis2 = 0;
        document.getElementById('pos2').textContent = '';
        document.getElementById('artikel2').textContent = artikel2;
        document.getElementById('menge2').textContent = '';
        document.getElementById('einzelpreis2').textContent = '';
        document.getElementById('gesamtpreis2').textContent = '';
    }

    document.getElementById('zahlungsziel').textContent = zahlungszielInput;
    document.getElementById('skonto').textContent = skontoInput;
    document.getElementById('skontofrist').textContent = skontofristInput;

    // Berechne und setze den Gesamtbetrag der Rechnung
    // Berechne die Zwischensumme
    const zwischensumme = gesamtpreis1 + gesamtpreis2;
    const rabattsumme = zwischensumme * rabattInput / 100;
    let warenwert;
    let umsatzsteuersumme;
    let gesamtRechnungsbetrag;

    // Setze die Zwischensumme in das SVG-Textelement
    document.getElementById('zwischensumme').textContent = formatCurrency(zwischensumme);

    if (rabattInput > 0) {
        document.getElementById('rabatt').textContent = '- ' + rabattInput + ' % Rabatt'
        document.getElementById('rabattsumme').textContent = formatCurrency(rabattsumme);
        warenwert = zwischensumme - rabattsumme;
    } else {
        document.getElementById('rabatt').textContent = ' '
        document.getElementById('rabattsumme').textContent = ' ';
        warenwert = zwischensumme;
    }

    document.getElementById('warenwert').textContent = formatCurrency(warenwert);

    if (umsatzsteuerInput > 0) {
        umsatzsteuersumme = warenwert * umsatzsteuerInput / 100
        document.getElementById('ust').textContent = '+ ' + umsatzsteuerInput;
        document.getElementById('ustsumme').textContent = formatCurrency(umsatzsteuersumme);
        gesamtRechnungsbetrag = warenwert + umsatzsteuersumme;
    } else {
        umsatzsteuersumme = ' ';
        document.getElementById('ust').textContent = ' '
        document.getElementById('ustsumme').textContent = ' ';
        gesamtRechnungsbetrag = warenwert;
    }


    document.getElementById('rechnungsbetrag').textContent = formatCurrency(gesamtRechnungsbetrag);


    loadCompanyData(); // Laden der Kundeninformationen
    loadSupplierData(); // Laden der Lieferanteninformationen
}
// Formatieren der Zahl mit Tausenderpunkt und Dezimalkomma
function formatNumber(number) {
    return new Intl.NumberFormat('de-DE').format(number);
}

// Formatieren der Währung mit Euro-Symbol, Tausenderpunkt und Dezimalkomma
function formatCurrency(amount) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}


// Funktion zum Aktualisieren der Farben
function updateColors() {
    let colorPicker = document.getElementById("colorPicker");
    let colorElements = document.querySelectorAll(".colorSVG");

    colorElements.forEach(function (element) {
        element.setAttribute("fill", colorPicker.value);
    });
}

   

// Initialisierung der Farben beim Laden des DOM
document.addEventListener("DOMContentLoaded", function () {
    let colorPicker = document.getElementById("colorPicker");

    colorPicker.addEventListener("input", updateColors);

    let observer = new MutationObserver(updateColors);

    let body = document.body;

    // Konfiguration für den Observer
    let config = { childList: true, subtree: true };

    // Starten des Observers
    observer.observe(body, config);
});

function applySVGholen() {
    applySVG().then(() => {
        applyOrderData();
    });
}

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
}

function loadSVGTemplate(templateName) {
    let templatePath = "templates/" + templateName + ".svg";

    return fetch(templatePath)
        .then(response => response.text())
        .then(svgData => {
            return svgData;
        })
        .catch(error => {
            console.error("Fehler beim Laden der SVG-Vorlage:", error);
        });
}
document.addEventListener('DOMContentLoaded', (event) => {
    setTimeout(() => {
        applySVGholen();
    }, 1000);
});


function rechnungHerunterladen() {
    const rechnungHTML = document.getElementById('rechnung1Container').innerHTML.replace(/&nbsp;/g, ' ');;
    const blob = new Blob([rechnungHTML], { type: 'svg' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'rechnung.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function rechnungKopiereInZwischenablage() {
    const rechnungHTML = document.getElementById('rechnung1Container').innerHTML.replace(/&nbsp;/g, ' ');;
    navigator.clipboard.writeText(rechnungHTML)
        .then(() => alert('Code wurde in die Zwischenablage kopiert'))
        .catch(err => console.error('Fehler beim Kopieren in die Zwischenablage:', err));
}

function rechnungHerunterladenAlsPNG() {
    const rechnungContainer = document.getElementById('rechnung1Container');

    html2canvas(rechnungContainer).then(canvas => {
        const dataURL = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = 'rechnung.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}

function toggleInput() {
    let inputElement = document.getElementById("jahr");
    let checkboxElement = document.getElementById("scriptJahr");

    if (checkboxElement.checked) {
        inputElement.disabled = true;
    } else {
        inputElement.disabled = false;
    }
}

function rechnungHerunterladen() {
    const rechnungHTML = document.getElementById('rechnung1Container').innerHTML.replace(/&nbsp;/g, ' ');;
    const blob = new Blob([rechnungHTML], { type: 'svg' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'rechnung.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function rechnungKopiereInZwischenablage() {
    const rechnungHTML = document.getElementById('rechnung1Container').innerHTML.replace(/&nbsp;/g, ' ');;
    navigator.clipboard.writeText(rechnungHTML)
        .then(() => alert('Code wurde in die Zwischenablage kopiert'))
        .catch(err => console.error('Fehler beim Kopieren in die Zwischenablage:', err));
}

function rechnungHerunterladenAlsPNG() {
    const rechnungContainer = document.getElementById('rechnung1Container');

    html2canvas(rechnungContainer).then(canvas => {
        const dataURL = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = 'rechnung.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}

function validateInputs() {
    // Validierung für Artikelbezeichnung Pos. 1
    let artikelInput = document.getElementById("artikelInput");
    if (!isValidInput(artikelInput.value, 22)) {
        alert("Bitte geben Sie eine gültige Artikelbezeichnung Pos. 1 ein. Maximal 22 Zeichen!");
        return false;
    }

    // Validierung für Artikelbezeichnung Pos. 2
    let artikelInput2 = document.getElementById("artikelInput2");
    if (!isValidInput(artikelInput2.value, 22)) {
        alert("Bitte geben Sie eine gültige Artikelbezeichnung Pos. 2 ein. Maximal 22 Zeichen!");
        return false;
    }

    // Validierung für Menge Pos. 1
    let mengeInput = document.getElementById("mengeInput");
    if (!isValidNumberInput(mengeInput.value, 0, 9999)) {
        alert("Bitte geben Sie eine gültige Menge Pos. 1 zwischen 0 und 9999 ein.");
        return false;
    }

    // Validierung für Menge Pos. 2
    let mengeInput2 = document.getElementById("mengeInput2");
    if (!isValidNumberInput(mengeInput2.value, 0, 9999)) {
        alert("Bitte geben Sie eine gültige Menge Pos. 2 zwischen 0 und 9999 ein.");
        return false;
    }

    // Validierung für Einheit Pos. 1
    let einheitInput = document.getElementById("einheitInput");
    if (!isValidInput(einheitInput.value, 5)) {
        alert("Bitte geben Sie eine gültige Einheit Pos. 1 ein.");
        return false;
    }

    // Validierung für Einheit Pos. 2
    let einheitInput2 = document.getElementById("einheitInput2");
    if (!isValidInput(einheitInput2.value, 5)) {
        alert("Bitte geben Sie eine gültige Einheit Pos. 2 ein.");
        return false;
    }

    // Validierung für Einzelpreis Pos. 1
    let einzelpreisInput = document.getElementById("einzelpreisInput");
    if (!isValidNumberInput(einzelpreisInput.value, 0, 9999999)) {
        alert("Bitte geben Sie einen gültigen Einzelpreis Pos. 1 ein.");
        return false;
    }

    // Validierung für Einzelpreis Pos. 2
    let einzelpreisInput2 = document.getElementById("einzelpreisInput2");
    if (!isValidNumberInput(einzelpreisInput2.value, 0, 9999999)) {
        alert("Bitte geben Sie einen gültigen Einzelpreis Pos. 2 ein.");
        return false;
    }

    // Validierung für Menge * Einzelpreis Pos. 1
    let gesamtPreis1 = parseFloat(mengeInput.value) * parseFloat(einzelpreisInput.value);
    if (gesamtPreis1 > 999999999) {
        alert("Die Gesamtsumme (Menge * Einzelpreis) Pos. 1 darf nicht höher als 999.999.999,00 sein.");
        return false;
    }

    // Validierung für Menge * Einzelpreis Pos. 2
    let gesamtPreis2 = parseFloat(mengeInput2.value) * parseFloat(einzelpreisInput2.value);
    if (gesamtPreis2 > 999999999) {
        alert("Die Gesamtsumme (Menge * Einzelpreis) Pos. 2 darf nicht höher als 999.999.999,00 sein.");
        return false;
    }

    // Validierung für Rabatt, Umsatzsteuer und Skonto
    let rabattInput = document.getElementById("rabattInput");
    let umsatzsteuerInput = document.getElementById("umsatzsteuerInput");
    let skontoInput = document.getElementById("skontoInput");
    if (!isValidPercentage(rabattInput.value) || !isValidPercentage(umsatzsteuerInput.value) || !isValidPercentage(skontoInput.value)) {
        alert("Bitte geben Sie gültige Prozentwerte für Rabatt, Umsatzsteuer und Skonto zwischen 0 und 100 ein.");
        return false;
    }

    // Validierung für Zahlungsziel und Skontofrist
    let zahlungszielInput = document.getElementById("zahlungszielInput");
    let skontofristInput = document.getElementById("skontofristInput");
    if (!isValidNumberInput(zahlungszielInput.value, 0, 365) || !isValidNumberInput(skontofristInput.value, 0, 365)) {
        alert("Bitte geben Sie gültige Zahlungsziele und Skontofristen zwischen 0 und 365 Tagen ein.");
        return false;
    }

    return true; // Rückgabe true, wenn alle Validierungen erfolgreich sind
}

function isValidInput(value, maxLength) {
    // Überprüfung auf HTML-Tags und Skripte
    const regex = /<.*?>/g;
    if (regex.test(value)) {
        return false;
    }

     // Überprüfung auf leeren Wert
     if (value.trim() === "") {
        return true; // Leer ist gültig
    }


    // Überprüfung auf maximale Länge
    return value.trim().length <= maxLength;
}

function isValidNumberInput(value, minValue, maxValue) {
    // Überprüfung auf HTML-Tags und Skripte
    const regex = /<.*?>/g;
    if (regex.test(value)) {
        return false;
    }

 // Überprüfung auf leeren Wert
 if (value.trim() === "") {
    return true; // Leer ist gültig
}

    // Überprüfung auf gültige Zahl im angegebenen Bereich
    const numericValue = parseFloat(value);
    return !isNaN(numericValue) && numericValue >= minValue && numericValue <= maxValue;
}

function isValidPercentage(value) {
    // Überprüfung auf HTML-Tags und Skripte
    const regex = /<.*?>/g;
    if (regex.test(value)) {
        alert("Ungültige Eingabe: HTML-Tags oder Skripte sind nicht erlaubt.");
        return false;
    }

    // Überprüfung auf leeren Wert
    if (value.trim() === "") {
        return true; // Leer ist gültig
    }

    // Überprüfung auf gültigen Prozentwert
    const percentageValue = parseFloat(value);
    return !isNaN(percentageValue) && percentageValue >= 0 && percentageValue <= 100;
}