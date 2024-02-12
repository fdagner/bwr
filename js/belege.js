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


// Function to reload dropdown options based on yamlData
function reloadDropdownOptions() {
    const dropdownCustomer = document.getElementById('datenKunde');
    const dropdownSupplier = document.getElementById('datenLieferer');
    const dropdownKontenauszug = document.getElementById('datenKontoauszug');
    const dropdownEmail = document.getElementById('datenEmail');
    const dropdownEmailKunde = document.getElementById('datenEmailKunde');
    const dropdownQuittung = document.getElementById('datenQuittung');
    const dropdownQuittungKunde = document.getElementById('datenQuittungKunde');
    const dropdownKassenbon = document.getElementById('datenKassenbon');
    const dropdownKassenbonKunde = document.getElementById('datenKassenbonKunde');


    // Clear existing options
    dropdownCustomer.innerHTML = '';
    dropdownSupplier.innerHTML = '';
    dropdownKontenauszug.innerHTML = '';
    dropdownEmail.innerHTML = '';
    dropdownEmailKunde.innerHTML = '';
    dropdownQuittung.innerHTML = '';
    dropdownQuittungKunde.innerHTML = '';
    dropdownKassenbon.innerHTML = '';
    dropdownKassenbonKunde.innerHTML = '';


    yamlData.forEach(company => {
        const optionCustomer = document.createElement('option');
        optionCustomer.value = company.unternehmen.name;
        optionCustomer.text = company.unternehmen.name + ' ' + company.unternehmen.rechtsform;;
        dropdownCustomer.appendChild(optionCustomer);

        const optionSupplier = document.createElement('option');
        optionSupplier.value = company.unternehmen.name;
        optionSupplier.text = company.unternehmen.name + ' ' + company.unternehmen.rechtsform;;
        dropdownSupplier.appendChild(optionSupplier);

        const optionKontoauszug = document.createElement('option');
        optionKontoauszug.value = company.unternehmen.name;
        optionKontoauszug.text = company.unternehmen.name + ' ' + company.unternehmen.rechtsform;
        dropdownKontenauszug.appendChild(optionKontoauszug);

        const optionEmail = document.createElement('option');
        optionEmail.value = company.unternehmen.name;
        optionEmail.text = company.unternehmen.name + ' ' + company.unternehmen.rechtsform;
        dropdownEmail.appendChild(optionEmail);

        const optionEmailKunde = document.createElement('option');
        optionEmailKunde.value = company.unternehmen.name;
        optionEmailKunde.text = company.unternehmen.name + ' ' + company.unternehmen.rechtsform;
        dropdownEmailKunde.appendChild(optionEmailKunde);

        const optionQuittung = document.createElement('option');
        optionQuittung.value = company.unternehmen.name;
        optionQuittung.text = company.unternehmen.name + ' ' + company.unternehmen.rechtsform;
        dropdownQuittung.appendChild(optionQuittung);

        const optionQuittungKunde = document.createElement('option');
        optionQuittungKunde.value = company.unternehmen.name;
        optionQuittungKunde.text = company.unternehmen.name + ' ' + company.unternehmen.rechtsform;
        dropdownQuittungKunde.appendChild(optionQuittungKunde);

        const optionKassenbon = document.createElement('option');
        optionKassenbon.value = company.unternehmen.name;
        optionKassenbon.text = company.unternehmen.name + ' ' + company.unternehmen.rechtsform;
        dropdownKassenbon.appendChild(optionKassenbon);

        const optionKassenbonKunde = document.createElement('option');
        optionKassenbonKunde.value = company.unternehmen.name;
        optionKassenbonKunde.text = company.unternehmen.name + ' ' + company.unternehmen.rechtsform;
        dropdownKassenbonKunde.appendChild(optionKassenbonKunde);


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
        const dropdownKontoauszug = document.getElementById('datenKontoauszug');
        const dropdownEmail = document.getElementById('datenEmail');
        const dropdownEmailKunde = document.getElementById('datenEmailKunde');
        const dropdownQuittung = document.getElementById('datenQuittung');
        const dropdownQuittungKunde = document.getElementById('datenQuittungKunde');
        const dropdownKassenbon = document.getElementById('datenKassenbon');
        const dropdownKassenbonKunde = document.getElementById('datenKassenbonKunde');

        yamlData.forEach(company => {
            const optionCustomer = document.createElement('option');
            optionCustomer.value = company.unternehmen.name;
            optionCustomer.text = company.unternehmen.name + ' ' + company.unternehmen.rechtsform;
            dropdownCustomer.appendChild(optionCustomer);

            const optionSupplier = document.createElement('option');
            optionSupplier.value = company.unternehmen.name;
            optionSupplier.text = company.unternehmen.name + ' ' + company.unternehmen.rechtsform;
            dropdownSupplier.appendChild(optionSupplier);

            const optionKontoauszug = document.createElement('option');
            optionKontoauszug.value = company.unternehmen.name;
            optionKontoauszug.text = company.unternehmen.name + ' ' + company.unternehmen.rechtsform;
            dropdownKontoauszug.appendChild(optionKontoauszug);

            const optionEmail = document.createElement('option');
            optionEmail.value = company.unternehmen.name;
            optionEmail.text = company.unternehmen.name + ' ' + company.unternehmen.rechtsform;
            dropdownEmail.appendChild(optionEmail);

            const optionEmailKunde = document.createElement('option');
            optionEmailKunde.value = company.unternehmen.name;
            optionEmailKunde.text = company.unternehmen.name + ' ' + company.unternehmen.rechtsform;
            dropdownEmailKunde.appendChild(optionEmailKunde);

            const optionQuittung = document.createElement('option');
            optionQuittung.value = company.unternehmen.name;
            optionQuittung.text = company.unternehmen.name + ' ' + company.unternehmen.rechtsform;
            dropdownQuittung.appendChild(optionQuittung);

            const optionQuittungKunde = document.createElement('option');
            optionQuittungKunde.value = company.unternehmen.name;
            optionQuittungKunde.text = company.unternehmen.name + ' ' + company.unternehmen.rechtsform;
            dropdownQuittungKunde.appendChild(optionQuittungKunde);

            const optionKassenbon = document.createElement('option');
            optionKassenbon.value = company.unternehmen.name;
            optionKassenbon.text = company.unternehmen.name + ' ' + company.unternehmen.rechtsform;
            dropdownKassenbon.appendChild(optionKassenbon);

            const optionKassenbonKunde = document.createElement('option');
            optionKassenbonKunde.value = company.unternehmen.name;
            optionKassenbonKunde.text = company.unternehmen.name + ' ' + company.unternehmen.rechtsform;
            dropdownKassenbonKunde.appendChild(optionKassenbonKunde);

        });


    });

let selectedSupplier;

function loadKontoauszugData() {
    const selectedKontoauszugName = document.getElementById('datenKontoauszug').value;
    const selectedKontoauszug = yamlData.find(quittung => quittung.unternehmen.name === selectedKontoauszugName);

    document.getElementById('kontoauszugBank').textContent = selectedKontoauszug.unternehmen.bank;
    document.getElementById('kontoauszugIban').textContent = selectedKontoauszug.unternehmen.iban;
    document.getElementById('kontoauszugBic').textContent = selectedKontoauszug.unternehmen.bic;
    document.getElementById('kontoauszugName').textContent = selectedKontoauszug.unternehmen.inhaber + ', ' + selectedKontoauszug.unternehmen.name;
    document.getElementById('kontoauszugAdresse').textContent = selectedKontoauszug.unternehmen.adresse.strasse;
    document.getElementById('kontoauszugOrt').textContent = selectedKontoauszug.unternehmen.adresse.plz + ' ' + selectedKontoauszug.unternehmen.adresse.ort;
}

function loadEmailData() {
    const selectedEmailName = document.getElementById('datenEmail').value;
    const selectedEmail = yamlData.find(email => email.unternehmen.name === selectedEmailName);
    document.getElementById('emailName').textContent = selectedEmail.unternehmen.name + ' ' + selectedEmail.unternehmen.rechtsform;
    const elementsWithClassemailInhaber = document.getElementsByClassName('emailInhaber');
    for (const element of elementsWithClassemailInhaber) {
        element.textContent = selectedEmail.unternehmen.inhaber;
    }
    const logoUrl = selectedEmail.unternehmen.logo;
    const svgContainer = document.getElementById('emailSVG');
    const rectElement = document.getElementById('logo-placeholderEmail');

    const existingImages = svgContainer.querySelectorAll('#uploaded-image');
    existingImages.forEach(existingImage => {
        svgContainer.removeChild(existingImage);
    });
    // Erstelle ein <image>-Element und füge es zur SVG hinzu
    const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    image.setAttribute('id', 'uploaded-image');
    image.setAttribute('x', rectElement.getAttribute('x'));
    image.setAttribute('y', rectElement.getAttribute('y'));
    image.setAttribute('width', rectElement.getAttribute('width'));
    image.setAttribute('height', rectElement.getAttribute('height'));

    // Setze den href-Attribut basierend auf logoUrl oder den Standardwert
    if (logoUrl && logoUrl.trim() !== '') {
        // Überprüfe, ob logoUrl eine externe URL oder ein Pfad zu einer lokalen Datei ist
        if (logoUrl.startsWith('http') || logoUrl.startsWith('data:image')) {
            // Wenn logoUrl bereits eine externe URL oder eine Data-URL ist, setze sie direkt
            image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', logoUrl);
            svgContainer.appendChild(image);
        } else {
            // Lade das Bild, konvertiere es in Base64 und setze es als Data-URL
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                const reader = new FileReader();
                reader.onloadend = function () {
                    image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', reader.result);
                    svgContainer.appendChild(image);
                };
                reader.readAsDataURL(xhr.response);
            };
            xhr.open('GET', logoUrl);
            xhr.responseType = 'blob';
            xhr.send();
        }
    } else {
        // Wenn der Eintrag in YAML leer ist, lade den Standard-SVG als Base64
        const standardImageURL = 'media/pic/standard.svg';

        const xhrStandard = new XMLHttpRequest();
        xhrStandard.onload = function () {
            const reader = new FileReader();
            reader.onloadend = function () {
                image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', reader.result);
                svgContainer.appendChild(image);
            };
            reader.readAsDataURL(xhrStandard.response);
        };
        xhrStandard.open('GET', standardImageURL);
        xhrStandard.responseType = 'blob';
        xhrStandard.send();
    }

}

// Lade die Unternehmensdaten basierend auf der Auswahl im Dropdown-Feld
function loadCompanyDataforEmail() {
    const selectedCompanyName = document.getElementById('datenEmailKunde').value;
    const selectedCompany = yamlData.find(company => company.unternehmen.name === selectedCompanyName);
    document.getElementById('emailNameKunde').textContent = selectedCompany.unternehmen.inhaber
    document.getElementById('emailAdresseKunde').textContent = selectedCompany.unternehmen.kontakt.email
}


function loadQuittungData() {
    const selectedQuittungName = document.getElementById('datenQuittung').value;
    const selectedQuittung = yamlData.find(quittung => quittung.unternehmen.name === selectedQuittungName);
    document.getElementById('quittungName').textContent = selectedQuittung.unternehmen.name + " " + selectedQuittung.unternehmen.rechtsform;
    document.getElementById('quittungStrasse').textContent = selectedQuittung.unternehmen.adresse.strasse;
    document.getElementById('quittungOrt').textContent = selectedQuittung.unternehmen.adresse.plz + " " + selectedQuittung.unternehmen.adresse.ort;
    document.getElementById('quittungInhaber').textContent = selectedQuittung.unternehmen.inhaber;
    document.getElementById('quittungOrtDatum').textContent = selectedQuittung.unternehmen.adresse.ort;

}

// Lade die Unternehmensdaten basierend auf der Auswahl im Dropdown-Feld
function loadCompanyDataforQuittung() {
    const selectedCompanyName = document.getElementById('datenQuittungKunde').value;
    const selectedCompany = yamlData.find(company => company.unternehmen.name === selectedCompanyName);
    document.getElementById('quittungNameKunde').textContent = selectedCompany.unternehmen.inhaber + ", " + selectedCompany.unternehmen.name;
}

function loadKassenbonData() {
    const selectedKassenbonName = document.getElementById('datenKassenbon').value;
    const selectedKassenbon = yamlData.find(kassenbon => kassenbon.unternehmen.name === selectedKassenbonName);
    document.getElementById('kassenbonName').textContent = selectedKassenbon.unternehmen.name + " " + selectedKassenbon.unternehmen.rechtsform;
    document.getElementById('kassenbonStrasse').textContent = selectedKassenbon.unternehmen.adresse.strasse;
    document.getElementById('kassenbonUSTID').textContent = selectedKassenbon.unternehmen.ust_id;
    document.getElementById('kassenbonSteuernummer').textContent = selectedKassenbon.unternehmen.steuernummer;
    document.getElementById('kassenbonOrt').textContent = selectedKassenbon.unternehmen.adresse.plz + " " + selectedKassenbon.unternehmen.adresse.ort;

}

// Lade die Unternehmensdaten basierend auf der Auswahl im Dropdown-Feld
function loadCompanyDataforKassenbon() {
    const selectedCompanyName = document.getElementById('datenKassenbonKunde').value;
    const selectedCompany = yamlData.find(company => company.unternehmen.name === selectedCompanyName);
    document.getElementById('kassenbonNameKunde').textContent = selectedCompany.unternehmen.inhaber + ", " + selectedCompany.unternehmen.name;
}

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
    document.getElementById('rechnungsNummer').textContent = rechnungsNummer;
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
    document.getElementById('nameLangLieferer').textContent = selectedSupplier.unternehmen.name;
    document.getElementById('strasseLieferer').textContent = selectedSupplier.unternehmen.adresse.strasse;
    document.getElementById('plzLieferer').textContent = selectedSupplier.unternehmen.adresse.plz + ' ' + selectedSupplier.unternehmen.adresse.ort;
    document.getElementById('adresseLieferer').textContent = selectedSupplier.unternehmen.name + ' ' + selectedSupplier.unternehmen.rechtsform + ' - ' + selectedSupplier.unternehmen.adresse.strasse +
        ' - ' + selectedSupplier.unternehmen.adresse.plz + ' ' + selectedSupplier.unternehmen.adresse.ort + ' - ' +
        selectedSupplier.unternehmen.adresse.land;
    document.getElementById('ansprechpartnerLieferer').textContent = selectedSupplier.unternehmen.inhaber;
    document.getElementById('telefonLieferer').textContent = selectedSupplier.unternehmen.kontakt.telefon;
    document.getElementById('emailLieferer').textContent = selectedSupplier.unternehmen.kontakt.email;
    document.getElementById('internetLieferer').textContent = selectedSupplier.unternehmen.kontakt.internet;
    document.getElementById('bankLieferer').textContent = selectedSupplier.unternehmen.bank;
    document.getElementById('ibanLieferer').textContent = 'IBAN: ' + selectedSupplier.unternehmen.iban;
    document.getElementById('bicLieferer').textContent = 'BIC: ' + selectedSupplier.unternehmen.bic;
    document.getElementById('nummerKunde').textContent = nummerKunde * selectedSupplier.unternehmen.id * 3;
    const colorSVGElements = document.querySelectorAll('.colorSVG');
    colorSVGElements.forEach(element => {
        // Check if selectedSupplier.unternehmen.akzent is undefined
        const akzentColor = selectedSupplier.unternehmen.akzent !== undefined ? selectedSupplier.unternehmen.akzent : "#7db9f5";

        element.setAttribute('fill', akzentColor);
        let colorPicker = document.getElementById("colorPicker");
        // Setze die Standardfarbe
        colorPicker.value = akzentColor;
    });
    adjustTextColor();


    let handelsregister = null;

    const erlaubteRechtsformen = ["e. K.", "e. Kfr.", "OHG", "KG", "GmbH & Co. KG", "GmbH & Co. OHG"];
    handelsregister;

    if (erlaubteRechtsformen.includes(selectedSupplier.unternehmen.rechtsform)) {
        handelsregister = "HRA";
    } else if (selectedSupplier.unternehmen.rechtsform === "") {
        handelsregister = "";
    } else {
        handelsregister = "HRB";
    }

    document.getElementById('amtsgerichtLieferer').textContent = 'Amtsgericht ' + selectedSupplier.unternehmen.adresse.ort + ' ' + handelsregister;
    document.getElementById('ustidLieferer').textContent = 'UST-IdNr.: ' + selectedSupplier.unternehmen.ust_id;
    document.getElementById('steuernummerLieferer').textContent = 'Steuernummer: ' + selectedSupplier.unternehmen.steuernummer;


    const logoUrl = selectedSupplier.unternehmen.logo;
    const svgContainer = document.getElementById('rechnungSVG');
    const rectElement = document.getElementById('logo-placeholder');

    const existingImages = svgContainer.querySelectorAll('#uploaded-image');
    existingImages.forEach(existingImage => {
        svgContainer.removeChild(existingImage);
    });
    // Erstelle ein <image>-Element und füge es zur SVG hinzu
    const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    image.setAttribute('id', 'uploaded-image');
    image.setAttribute('x', rectElement.getAttribute('x'));
    image.setAttribute('y', rectElement.getAttribute('y'));
    image.setAttribute('width', rectElement.getAttribute('width'));
    image.setAttribute('height', rectElement.getAttribute('height'));

    // Setze den href-Attribut basierend auf logoUrl oder den Standardwert
    if (logoUrl && logoUrl.trim() !== '') {
        // Überprüfe, ob logoUrl eine externe URL oder ein Pfad zu einer lokalen Datei ist
        if (logoUrl.startsWith('http') || logoUrl.startsWith('data:image')) {
            // Wenn logoUrl bereits eine externe URL oder eine Data-URL ist, setze sie direkt
            image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', logoUrl);
            svgContainer.appendChild(image);
        } else {
            // Lade das Bild, konvertiere es in Base64 und setze es als Data-URL
            const xhr = new XMLHttpRequest();
            xhr.onload = function () {
                const reader = new FileReader();
                reader.onloadend = function () {
                    image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', reader.result);
                    svgContainer.appendChild(image);
                };
                reader.readAsDataURL(xhr.response);
            };
            xhr.open('GET', logoUrl);
            xhr.responseType = 'blob';
            xhr.send();
        }
    } else {
        // Wenn der Eintrag in YAML leer ist, lade den Standard-SVG als Base64
        const standardImageURL = 'media/pic/standard.svg';

        const xhrStandard = new XMLHttpRequest();
        xhrStandard.onload = function () {
            const reader = new FileReader();
            reader.onloadend = function () {
                image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', reader.result);
                svgContainer.appendChild(image);
            };
            reader.readAsDataURL(xhrStandard.response);
        };
        xhrStandard.open('GET', standardImageURL);
        xhrStandard.responseType = 'blob';
        xhrStandard.send();
    }
}

// Funktion zum Laden eines Logos
function loadLogo(event) {
    const svgContainer = document.getElementById('rechnungSVG');
    const existingImages = svgContainer.querySelectorAll('#uploaded-image');

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
        const useScriptQuittung = document.getElementById('scriptJahrKassenbon').checked;

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

    // Verwendung der Hilfsfunktion für verschiedene Eingabefelder
    const rabattInput = getNumericValue('rabattInput');
    const bezugskostenInput = getNumericValue('bezugskostenInput');
    const umsatzsteuerInput = getNumericValue('umsatzsteuerInput');
    const zahlungszielInput = getNumericValue('zahlungszielInput');
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

    // Berechne und setze den Gesamtbetrag der Rechnung
    // Berechne die Zwischensumme
    const zwischensumme = gesamtpreis1 + gesamtpreis2;
    const rabattsumme = zwischensumme * rabattInput / 100;
    let nettowert;
    let umsatzsteuersumme;
    let gesamtRechnungsbetrag;

    // Setze die Zwischensumme in das SVG-Textelement
    document.getElementById('zwischensumme').textContent = formatCurrency(zwischensumme);
    document.getElementById('bezugskostenSumme').textContent = formatCurrency(bezugskostenInput);
    document.getElementById('bezugskosten').textContent = bezugskostenArtInput;
    if (rabattInput > 0) {
        document.getElementById('rabatt').textContent = '- ' + rabattInput + ' % Rabatt'
        document.getElementById('rabattsumme').textContent = formatCurrency(rabattsumme);
        nettowert = zwischensumme - rabattsumme + bezugskostenInput
    } else {
        document.getElementById('rabatt').textContent = ' '
        document.getElementById('rabattsumme').textContent = ' ';
        nettowert = zwischensumme + bezugskostenInput;
    }

    document.getElementById('nettowert').textContent = formatCurrency(nettowert);

    if (umsatzsteuerInput > 0) {
        umsatzsteuersumme = nettowert * umsatzsteuerInput / 100
        document.getElementById('ust').textContent = '+ ' + umsatzsteuerInput;
        document.getElementById('ustsumme').textContent = formatCurrency(umsatzsteuersumme);
        gesamtRechnungsbetrag = nettowert + umsatzsteuersumme;
    } else {
        umsatzsteuersumme = ' ';
        document.getElementById('ust').textContent = ' '
        document.getElementById('ustsumme').textContent = ' ';
        gesamtRechnungsbetrag = nettowert;
    }


    document.getElementById('rechnungsbetrag').textContent = formatCurrency(gesamtRechnungsbetrag);

    // Platz machen wenn keine Bezugskosten
    const warenwertUstRechnungsbetrag = document.getElementById('warenwertUstRechnungsbetrag');
    const warenwertUstRechnungsbetrag_quer = document.getElementById('warenwertUstRechnungsbetrag_quer');
    const gBezugskosten = document.getElementById('gBezugskosten');

    // Überprüfe, ob das Element vorhanden ist
    if (warenwertUstRechnungsbetrag) {
        // Hier überprüfen wir, ob bezugskostenInput gleich 0 ist
        if (bezugskostenInput > 0) {
            // Ändere den Transform-Wert, um die Y-Position um 20 zu verringern
            warenwertUstRechnungsbetrag.setAttribute('transform', 'translate(0, 0)');
        } else {
            // Setze den Transform-Wert auf den ursprünglichen Wert oder einen anderen Wert nach Bedarf
            warenwertUstRechnungsbetrag.setAttribute('transform', 'translate(0, -30)');
            gBezugskosten.remove();
        }
    } else {

    }

    // Überprüfe, ob das Element vorhanden ist
    if (warenwertUstRechnungsbetrag_quer) {
        // Hier überprüfen wir, ob bezugskostenInput gleich 0 ist
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


    // Laden der Daten für den Kontoauszug
    const kontoauszugNummer = document.getElementById('kontoauszugNummerInput').value;
    document.getElementById('kontoauszugNummer').textContent = kontoauszugNummer;

    const kontoauszugVorgang1 = document.getElementById('kontoauszugVorgang1Input').value;
    document.getElementById('kontoauszugVorgang1').textContent = kontoauszugVorgang1;

    const kontoauszugWertstellung1Input = document.getElementById('kontoauszugWertstellung1Input').value;
    const kontoauszugWertstellung1 = kontoauszugWertstellung1Input ? parseFloat(kontoauszugWertstellung1Input) : 0;
    document.getElementById('kontoauszugWertstellung1').textContent = kontoauszugWertstellung1 !== 0 ? formatCurrencyWithSign(kontoauszugWertstellung1) : "";

    const kontoauszugVorgang2 = document.getElementById('kontoauszugVorgang2Input').value;
    document.getElementById('kontoauszugVorgang2').textContent = kontoauszugVorgang2;

    const kontoauszugWertstellung2Input = document.getElementById('kontoauszugWertstellung2Input').value;
    const kontoauszugWertstellung2 = kontoauszugWertstellung2Input !== "" ? parseFloat(kontoauszugWertstellung2Input) : 0;
    document.getElementById('kontoauszugWertstellung2').textContent = kontoauszugWertstellung2 !== 0 ? formatCurrencyWithSign(kontoauszugWertstellung2) : "";

    const kontoauszugVorgang3 = document.getElementById('kontoauszugVorgang3Input').value;
    document.getElementById('kontoauszugVorgang3').textContent = kontoauszugVorgang3;

    const kontoauszugWertstellung3Input = document.getElementById('kontoauszugWertstellung3Input').value;
    const kontoauszugWertstellung3 = kontoauszugWertstellung3Input ? parseFloat(kontoauszugWertstellung3Input) : 0;
    document.getElementById('kontoauszugWertstellung3').textContent = kontoauszugWertstellung3 !== 0 ? formatCurrencyWithSign(kontoauszugWertstellung3) : "";

    const kontoauszugKontostand_altInput = document.getElementById('kontoauszugKontostand_altInput').value;
    const kontoauszugKontostand_alt = kontoauszugKontostand_altInput ? parseFloat(kontoauszugKontostand_altInput) : 0;
    document.getElementById('kontoauszugKontostand_alt').textContent = kontoauszugKontostand_alt !== 0 ? formatCurrencyWithSign(kontoauszugKontostand_alt) : "";

    let kontoauszugKontostand_neu = kontoauszugKontostand_alt + kontoauszugWertstellung1 + kontoauszugWertstellung2 + kontoauszugWertstellung3;

    document.getElementById('kontoauszugKontostand_neu').textContent = formatCurrencyWithSign(kontoauszugKontostand_neu);

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


    // Laden der Daten für den Kassenbon
    let kassenbonZweck = document.getElementById('kassenbonZweckInput').value;
    document.getElementById('kassenbonZweck').textContent = kassenbonZweck;
    const selectedkassenbonTag = document.getElementById('tagKassenbon').value;
    const selectedkassenbonMonat = document.getElementById('monatKassenbon').value;
    document.getElementById('kassenbonTag').textContent = selectedkassenbonTag;
    document.getElementById('kassenbonMonat').textContent = selectedkassenbonMonat;
    let kassenbonRandomTime = generateRandomTime();
    document.getElementById('kassenbonUhrzeit').textContent = kassenbonRandomTime + ' Uhr';
    const kassenbonRandomNumber = generateRandomNumber();
    document.getElementById('kassenbonTransaktionsnummer').textContent = kassenbonRandomNumber;
    let kassenbonNetto = document.getElementById('kassenbonNettoInput').value;
    // Überprüfen, ob das Eingabefeld leer ist
    if (kassenbonNetto === "") {
        // Wenn das Eingabefeld leer ist, setze quittungUST auf 0
        kassenbonNetto = 0;
    }

    document.getElementById('kassenbonNetto').textContent = formatCurrency(kassenbonNetto);
    kassenbonUST = document.getElementById('kassenbonUSTInput').value;
    // Überprüfen, ob das Eingabefeld leer ist
    if (quittungUST === "") {
        // Wenn das Eingabefeld leer ist, setze quittungUST auf 0
        quittungUST = 0;
    }

    document.getElementById('kassenbonUST').textContent = kassenbonUST;
    let kassenbonUSTBetrag = (kassenbonNetto * kassenbonUST / 100).toFixed(2);
    document.getElementById('kassenbonUSTBetrag').textContent = formatCurrency(kassenbonUSTBetrag);
    let kassenbonBrutto = parseFloat(kassenbonNetto) + parseFloat(kassenbonUSTBetrag);
    let kassenbonBruttoElements = Array.from(document.getElementsByClassName('kassenbonBrutto'));

    // Iteriere über jedes Element und setze den berechneten Bruttobetrag als Textinhalt
    kassenbonBruttoElements.forEach(function (element) {
        // Formatieren des Bruttobetrags
        var formattedKassenbonBrutto = formatCurrency(kassenbonBrutto);

        // Setze den formatierten Bruttobetrag als Textinhalt ins Element
        element.textContent = formattedKassenbonBrutto;
    });
    let kassenbonZahlungsart = document.getElementById('kassenbonDropdownZahlungsart').value;
    document.getElementById('kassenbonZahlungsart').textContent = kassenbonZahlungsart;

    loadCompanyData(); // Laden der Kundeninformationen
    loadSupplierData(); // Laden der Lieferanteninformationen
    loadKontoauszugData() // Laden der Quittungsdaten
    loadEmailData() // Laden der E-Mail-Daten
    loadCompanyDataforEmail(); // Laden der E-Mail-Daten (Kunde)
    loadQuittungData() // Laden der Quittung-Daten
    loadKassenbonData() // Laden der Kassenbon-Daten
    loadCompanyDataforQuittung(); // Laden der Quittung-Daten (Kunde)
}

// Funktion zur Generierung einer zufälligen 7-stelligen Nummer
function generateRandomNumber() {
    const min = 1000000; // Kleinste 7-stellige Nummer
    const max = 9999999; // Größte 7-stellige Nummer
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Formatieren der Zahl mit Tausenderpunkt und Dezimalkomma
function formatNumber(number) {
    return new Intl.NumberFormat('de-DE').format(number);
}

// Formatieren der Währung mit Euro-Symbol, Tausenderpunkt und Dezimalkomma
function formatCurrency(amount) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

// Funktion zum Formatieren des Betrags
function formatCurrencyWithSign(amount) {
    // Verwende die Intl.NumberFormat-API, um den Betrag zu formatieren
    let formattedAmount = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Math.abs(amount));

    // Füge das Vorzeichen hinzu
    let sign = amount >= 0 ? '+' : '–';
    formattedAmount = formattedAmount + ' ' + sign;

    return formattedAmount;
}

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

// Funktion zur Generierung einer zufälligen Uhrzeit zwischen 10:00 und 10:59
function generateRandomTime() {
    let hour = Math.floor(Math.random() * 7) + 10; // Zufällige Stunde zwischen 10 und 17
    let minute = Math.floor(Math.random() * 60); // Zufällige Minute zwischen 0 und 59
    return hour + ':' + (minute < 10 ? '0' + minute : minute);
}


// Funktion zum Aktualisieren der Farben
function updateColors() {

    let colorPicker = document.getElementById("colorPicker");
    let colorElements = document.querySelectorAll(".colorSVG");
    let textColorliefererInformationen2 = document.getElementById('liefererInformationen2')
    if (textColorliefererInformationen2 !== null) {
        textColorliefererInformationen2.setAttribute("fill", colorPicker.value);
    }
    else {
    }
    colorElements.forEach(function (element) {
        element.setAttribute("fill", colorPicker.value);
    });
    adjustTextColor();

}


// Initialisierung der Farben beim Laden des DOM
document.addEventListener("DOMContentLoaded", function () {
    let colorPicker = document.getElementById("colorPicker");
    colorPicker.addEventListener("input", updateColors);



});

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


function adjustTextColor() {
    const colorSVGElements = document.querySelectorAll('.colorSVG');
    const liefererInformationen = document.getElementById('liefererInformationen');
    const footerText = document.getElementById('footerText');

    if (liefererInformationen !== null) {

        // Überprüfe, ob das Element gefunden wurde, bevor die Hintergrundfarbe abgerufen wird
        if (colorSVGElements.length > 0) {
            // Nehme den Hex-Wert des ersten Rechtecks mit der Klasse "colorSVG"
            const backgroundColorHex = colorSVGElements[0].getAttribute('fill');

            // Wandele den Hex-Wert in RGB um
            const rgbBackground = hexToRgb(backgroundColorHex);
            const textColor = liefererInformationen.getAttribute('fill');

            // Überprüfe, ob RGB-Werte gültig sind
            if (rgbBackground && rgbBackground.length === 3) {
                const rgbText = hexToRgb(textColor);

                if (rgbText && rgbText.length === 3) {
                    const contrast = calculateContrast(rgbBackground, rgbText);

                    // Hier kannst du den Schwellenwert für den Kontrast anpassen
                    const contrastThreshold = 100;
                    const newTextColor = contrast > contrastThreshold ? '#000' : '#fff';

                    // Setze die Textfarbe unabhängig von der vorherigen Bedingung
                    liefererInformationen.setAttribute('fill', newTextColor);
                    footerText.setAttribute('fill', newTextColor);
                }
            } else { }
        }
    }
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


    let selectedKassenbon = document.getElementById("svgDropdownKassenbon").value;
    let svgContainerKassenbon = document.getElementById("kassenbonContainer");

    // Laden der SVG-Vorlage und Aktualisieren des Containers
    try {
        let svgData = await loadSVGTemplate(selectedKassenbon);
        svgContainerKassenbon.innerHTML = svgData;
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

// Export to PNG

function herunterladenAlsPNG(containerId, dateiname) {
    const container = document.getElementById(containerId);

    html2canvas(container).then(canvas => {
        const dataURL = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = dateiname;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}

function kontoauszugHerunterladenAlsPNG() {
    herunterladenAlsPNG('kontoauszugContainer', 'kontoauszug.png');
}

function rechnungHerunterladenAlsPNG() {
    herunterladenAlsPNG('rechnung1Container', 'rechnung.png');
}


function quittungHerunterladenAlsPNG() {
    herunterladenAlsPNG('quittungContainer', 'quittung.png');
}

function kassenbonHerunterladenAlsPNG() {
    herunterladenAlsPNG('kassenbonContainer', 'kassenbon.png');
}

function emailHerunterladenAlsPNG() {
    herunterladenAlsPNG('emailContainer', 'email.png');
}

// Export to SVG

function herunterladen(containerId, dateiname) {
    const containerHTML = document.getElementById(containerId).innerHTML.replace(/&nbsp;/g, ' ');
    const blob = new Blob([containerHTML], { type: 'svg' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = dateiname;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function rechnungHerunterladen() {
    herunterladen('rechnung1Container', 'rechnung.svg');
}

function kontoauszugHerunterladen() {
    herunterladen('kontoauszugContainer', 'kontoauszug.svg');
}

function quittungHerunterladen() {
    herunterladen('quittungContainer', 'quittung.svg');
}

function kassenbonHerunterladen() {
    herunterladen('kassenbonContainer', 'kassenbon.svg');
}





function kopiereInZwischenablage(containerId) {
    // SVG-Element aus dem Container abrufen
    const containerSVG = document.getElementById(containerId).querySelector('svg');
    
    // Kopie des SVG-Elements erstellen, um das Original nicht zu ändern
    const clonedSVG = containerSVG.cloneNode(true);

    // width und height Attribute entfernen
    clonedSVG.removeAttribute('width');
    clonedSVG.removeAttribute('height');

    // HTML des modifizierten SVGs erhalten
    const containerHTML = clonedSVG.outerHTML.replace(/&nbsp;/g, ' ');

    // Text in die Zwischenablage kopieren
    navigator.clipboard.writeText(containerHTML)
        .then(() => alert('Code wurde in die Zwischenablage kopiert'))
        .catch(err => console.error('Fehler beim Kopieren in die Zwischenablage:', err));
}

function rechnungKopiereInZwischenablage() {
    kopiereInZwischenablage('rechnung1Container');
}

function kontoauszugKopiereInZwischenablage() {
    kopiereInZwischenablage('kontoauszugContainer');
}

function quittungKopiereInZwischenablage() {
    kopiereInZwischenablage('quittungContainer');
}

function kassenbonKopiereInZwischenablage() {
    kopiereInZwischenablage('kassenbonContainer');
}

function emailKopiereInZwischenablage() {
    kopiereInZwischenablage('emailContainer');
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


function validateInputs() {
    // Validierung für Artikelbezeichnung Pos. 1
    let artikelInput = document.getElementById("artikelInput");
    if (!isValidInput(artikelInput.value, 25)) {
        alert("Bitte geben Sie eine gültige Artikelbezeichnung Pos. 1 ein. Maximal 25 Zeichen!");
        return false;
    }

    // Validierung für Artikelbezeichnung Pos. 2
    let artikelInput2 = document.getElementById("artikelInput2");
    if (!isValidInput(artikelInput2.value, 25)) {
        alert("Bitte geben Sie eine gültige Artikelbezeichnung Pos. 2 ein. Maximal 25 Zeichen!");
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

    // Validierung für Bezugskosten
    let bezugskostenInput = document.getElementById("bezugskostenInput");
    if (!isValidNumberInput(bezugskostenInput.value, 0, 9999999)) {
        alert("Bitte geben Sie bei Bezugskosten gültige Werte zwischen 0 und 9999 ein");
        return false;
    }

    // Validierung für Zahlungsziel und Skontofrist
    let zahlungszielInput = document.getElementById("zahlungszielInput");
    let skontofristInput = document.getElementById("skontofristInput");
    if (!isValidNumberInput(zahlungszielInput.value, 0, 365) || !isValidNumberInput(skontofristInput.value, 0, 365)) {
        alert("Bitte geben Sie gültige Zahlungsziele und Skontofristen zwischen 0 und 365 Tagen ein.");
        return false;
    }

    // Validierung für Jahr in der Rechnung
    let jahr = document.getElementById("jahr");
    if (!isValidInput(jahr.value, 4)) {
        alert("Bitte geben Sie bei Jahr (Rechnung) gültige Werte ein");
        return false;
    }

    // Validierung für Jahr im Kontoauszug
    let jahrKontoauszug = document.getElementById("jahrKontoauszug");
    if (!isValidNumberInput(jahrKontoauszug.value, 0, 9999)) {
        alert("Bitte geben Sie bei Jahr (Kontoauszug) gültige Werte zwischen 0 und 9999 ein");
        return false;
    }


    // Validierung für Kontoauszug Vorgang
    let kontoauszugVorgang1Input = document.getElementById("kontoauszugVorgang1Input");
    if (!isValidInput(kontoauszugVorgang1Input.value, 35)) {
        alert("Bitte geben Sie eine gültige Bezeichnung ein. Maximal 35 Zeichen!");
        return false;
    }

    // Validierung für Kontoauszug Vorgang
    let kontoauszugVorgang2Input = document.getElementById("kontoauszugVorgang1Input");
    if (!isValidInput(kontoauszugVorgang2Input.value, 35)) {
        alert("Bitte geben Sie eine gültige Bezeichnung ein. Maximal 35 Zeichen!");
        return false;
    }


    // Validierung für Kontoauszug Vorgang
    let kontoauszugVorgang3Input = document.getElementById("kontoauszugVorgang3Input");
    if (!isValidInput(kontoauszugVorgang3Input.value, 35)) {
        alert("Bitte geben Sie eine gültige Bezeichnung ein. Maximal 35 Zeichen!");
        return false;
    }


    // Validierung für Jahr in der Rechnung
    let kontoauszugKontostand_altInput = document.getElementById("kontoauszugKontostand_altInput");
    if (!isValidNumberInput(kontoauszugKontostand_altInput.value, -999999999, 999999999)) {
        alert("Bitte geben Sie bei Jahr (Rechnung) gültige Werte zwischen -999999999 und 999999999 ein");
        return false;
    }

    // Validierung für Kontoauszug Vorgang
    let emailSubjectInput = document.getElementById("emailSubjectInput");
    if (!isValidInput(emailSubjectInput.value, 100)) {
        alert("Bitte geben Sie eine gültige Bezeichnung ein. Maximal 100 Zeichen!");
        return false;
    }

    // Validierung für Kontoauszug Vorgang
    let emailInputText = document.getElementById("emailInputText");
    if (!isValidInput(emailInputText.value, 5000)) {
        alert("Bitte geben Sie eine gültige Bezeichnung ein. Maximal 5000 Zeichen!");
        return false;
    }

    // Validierung für Quittung
    let quittungNettoInput = document.getElementById("quittungNettoInput");
    if (!isValidNumberInput(quittungNettoInput.value, 0, 9999)) {
        alert("Bitte geben Sie beim Nettonbetrag gültige Werte zwischen 0 und 9999 ein");
        return false;
    }

    // Validierung für Quittung UST
    let quittungUSTInput = document.getElementById("quittungUSTInput");
    if (!isValidNumberInput(quittungUSTInput.value, 0, 99)) {
        alert("Bitte geben Sie bei UST gültige Werte zwischen 0 und 99 ein");
        return false;
    }


    // Validierung für Quittung Vorgang
    let quittungZweckInput = document.getElementById("quittungZweckInput");
    if (!isValidInput(quittungZweckInput.value, 50)) {
        alert("Bitte geben Sie eine gültige Bezeichnung bei Für ein. Maximal 50 Zeichen!");
        return false;
    }

    // Validierung für Kassenbon
    let kassenbonNettoInput = document.getElementById("kassenbonNettoInput");
    if (!isValidNumberInput(kassenbonNettoInput.value, 0, 9999)) {
        alert("Bitte geben Sie beim Nettonbetrag gültige Werte zwischen 0 und 9999 ein");
        return false;
    }

    // Validierung für Kassenbon UST
    let kassenbonUSTInput = document.getElementById("kassenbonUSTInput");
    if (!isValidNumberInput(kassenbonUSTInput.value, 0, 99)) {
        alert("Bitte geben Sie bei UST gültige Werte zwischen 0 und 99 ein");
        return false;
    }


    // Validierung für Kassenbon Vorgang
    let kassenbonZweckInput = document.getElementById("kassenbonZweckInput");
    if (!isValidInput(kassenbonZweckInput.value, 50)) {
        alert("Bitte geben Sie eine gültige Bezeichnung bei Kassenbon Artikel ein. Maximal 50 Zeichen!");
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
        alert("Ungültige Eingabe: HTML-Tags oder Skripte sind nicht erlaubt.");
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