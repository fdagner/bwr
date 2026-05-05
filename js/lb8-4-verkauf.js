// Globale Variable – wird von einkauf.js benötigt
  let yamlData = [];
  let lieferer = '<i>[Modellunternehmen]</i>';

  // ============================================================================
// BENUTZERDEFINIERTE UNTERNEHMEN - Integration
// ============================================================================

// Funktion zum Abrufen der benutzerdefinierten Unternehmen aus dem Local Storage
function getUserCompanies() {
  const stored = localStorage.getItem('userCompanies');
  return stored ? JSON.parse(stored) : [];
}

// Funktion zum Zusammenführen der benutzerdefinierten Unternehmen mit den Standard-YAML-Daten
function mergeUserCompaniesIntoYamlData() {
  const userCompanies = getUserCompanies();
  
  if (userCompanies.length > 0) {
    // Füge Benutzerunternehmen zu yamlData hinzu
    yamlData = [...yamlData, ...userCompanies];
    
    // Sortiere nach Branche
    yamlData.sort((a, b) => {
      const brancheA = a.unternehmen?.branche || '';
      const brancheB = b.unternehmen?.branche || '';
      return brancheA.localeCompare(brancheB);
    });
    
    console.log(`${userCompanies.length} Benutzerunternehmen hinzugefügt. Gesamt: ${yamlData.length} Unternehmen`);
  }
}


// Versuch 1: Aus localStorage laden (wenn User eigene Datei hochgeladen hat)
function loadYamlFromLocalStorage() {
  const saved = localStorage.getItem('uploadedYamlCompanyData');
  if (saved) {
    try {
      yamlData = JSON.parse(saved);
      console.log(`yamlData aus localStorage geladen (${yamlData.length} Unternehmen)`);
      
      // ← NEU: Benutzerdefinierte Unternehmen hinzufügen
      mergeUserCompaniesIntoYamlData();
      
      document.dispatchEvent(new Event('yamlDataLoaded'));
      return true;
    } catch (err) {
      console.warn("localStorage YAML kaputt:", err);
    }
  }
  return false;
}

// Versuch 2: Standard-Datei laden
function loadDefaultYaml() {
  fetch('js/unternehmen.yml')
    .then(res => {
      if (!res.ok) throw new Error('unternehmen.yml nicht gefunden');
      return res.text();
    })
    .then(yamlText => {
      yamlData = jsyaml.load(yamlText) || [];
      
      // ← NEU: Standard-Daten im LocalStorage speichern (falls noch nicht vorhanden)
      if (!localStorage.getItem('standardYamlData')) {
        localStorage.setItem('standardYamlData', JSON.stringify(yamlData));
      }
      
      // ← NEU: Benutzerdefinierte Unternehmen hinzufügen
      mergeUserCompaniesIntoYamlData();
      
      console.log(`Standard yamlData geladen (${yamlData.length} Unternehmen)`);
      document.dispatchEvent(new Event('yamlDataLoaded'));
    })
    .catch(err => {
      console.error("Konnte unternehmen.yml nicht laden:", err);
      // Optional: leere Liste oder Fehlermeldung im UI
    });
}

  // Start: zuerst localStorage, sonst Standard
  document.addEventListener('DOMContentLoaded', () => {

    const kaeuferSelect = document.getElementById('einkaufLieferer');

    // Initialwert setzen
    if (kaeuferSelect && kaeuferSelect.value) {
        lieferer = kaeuferSelect.value.trim();
    }

    // Bei jeder Änderung aktualisieren
    kaeuferSelect.addEventListener('change', () => {
        lieferer = kaeuferSelect.value.trim() || '';  // leer wenn nichts ausgewählt
        console.log('Lieferer geändert:', lieferer);
    });

    if (!loadYamlFromLocalStorage()) {
      loadDefaultYaml();
    }
  });



const verkaufAnzahlDropdown = document.getElementById('verkaufAnzahlDropdown');
const verkaufMitRabatt = document.getElementById('verkaufMitRabatt');
const verkaufMitBezugskosten = document.getElementById('verkaufMitBezugskosten');
const verkaufMitVerkaufskalkulation = document.getElementById('verkaufMitVerkaufskalkulation');
const verkaufSkontobuchungssatz = document.getElementById('verkaufMitSkontobuchungssatz');

document.addEventListener('DOMContentLoaded', function () {
  const verkaufMitBezugskosten = document.getElementById('verkaufMitBezugskosten');
  const verkaufBuchungsoptionDropdown = document.getElementById('verkaufBuchungsoptionDropdown');

  function verkaufUpdateMitBezugskostenState() {
    if (verkaufBuchungsoptionDropdown.value === 'verkaufskalkulation' || verkaufBuchungsoptionDropdown.value === 'verkaufDifferenzkalkulation') {
      verkaufMitBezugskosten.disabled = true;
      verkaufMitBezugskosten.checked = false;
    } else {
      verkaufMitBezugskosten.disabled = false;
    }
  }

  verkaufBuchungsoptionDropdown.addEventListener('change', verkaufUpdateMitBezugskostenState);

  // Initialisiere den Zustand der "mitBezugskosten"-Checkbox beim Laden der Seite
  verkaufUpdateMitBezugskostenState();
  if (yamlData && yamlData.length > 0) {
        fillCompanyDropdowns();
    } else {
        // Falls yamlData noch nicht geladen → auf Event warten oder fetch auslösen
        document.addEventListener('yamlDataLoaded', fillCompanyDropdowns, { once: true });
    }

});

// Auf 2 Dezimalstellen runden
function roundToTwoDecimals(num) {
  return Math.round(num * 100) / 100;
}


// Funktion für zufällige Zahlen Rabatt, Gewinn und Bezugskosten
function getRandomIntegerWithSteps(min, max, step) {
  const range = (max - min) / step;
  return Math.floor(Math.random() * range) * step + min;
}

function getRandomRabatt() {
  return getRandomIntegerWithSteps(5, 25, 5);
}

function getRandomGewinn() {
  // Generiere eine zufällige Ganzzahl zwischen 0 und 25 in 1er-Schritten
  let randomNumber = Math.floor(Math.random() * 26);
  // Stelle sicher, dass die Zahl zwischen 6 und 25 liegt
  while (randomNumber < 5) {
    randomNumber = Math.floor(Math.random() * 26);
  }
  return randomNumber;
}

function getRandomWunschGewinn() {
  // Generiere eine zufällige Ganzzahl zwischen -15 und 10 in 1er-Schritten
  return Math.floor(Math.random() * 26) - 15;
}

function getRandomBezugskosten() {
  return getRandomIntegerWithSteps(50, 250, 5);
}


// Funktion zur Generierung einer Zufallsganzzahl für den Nettowert
function generateRandomNettoWert() {
  let randomNumber = Math.round(Math.random() * (20000 - 500)) + 500; // Zufallszahl zwischen 2500 und 50000
  randomNumber = Math.round(randomNumber / 100) * 100; // Auf Hundert gerundet
  return randomNumber;
}

// Währung nach DIN 5008
function formatCurrency(value) {
  return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

// Kontenplan
const kontenUmsatzserloese = {
  "Fertigerzeugnisse": {
    "Hauptkonto": "5000 UEFE",
    "Nachlasskonto": "5001 EBFE",
  },
};

const kontenUmsatzerloese_2 = {
  "von Fertigerzeugnissen": {
    "Hauptkonto": "5000 UEFE",
    "Nachlasskonto": "5001 EBFE",
  },
};

let kontenVerkaufZahlung;
function inputSellChangeCategory() {
  if (verkaufBuchungsoptionDropdown.value === 'verkaufskalkulation' || verkaufBuchungsoptionDropdown.value === 'verkaufSkontobuchungssatz') {
    verkaufKontenZahlung = {
      " gegen Rechnung": "2400 FO",
      " auf Rechnung": "2400 FO",
    }
  } else {
    verkaufKontenZahlung = {
      "gegen Rechnung": "2400 FO",
      "mit Versenden einer Ausgangsrechnung": "2400 FO",
      "auf Rechnung": "2400 FO",
      "auf Ziel": "2400 FO",
    }
  }
}


function verkaufErstelleZufallssatz() {
  inputSellChangeCategory();
  let verkaufRandom_Rabatt = getRandomRabatt();
  let verkaufRandom_Bezugskosten = getRandomBezugskosten();
  let verkaufRandom_Gewinn = getRandomGewinn();
  let verkaufRandomSk = Math.random();
  let verkaufRandom_Skonto = (verkaufRandomSk < 0.5) ? 2 : 3;
  verkaufRandom_Bezugskosten = formatCurrency(verkaufRandom_Bezugskosten);
  // Arrays mit verschiedenen Teilen des Satzes
  const verkaufArray_Subjekt = [`${lieferer} verkauft `, `${lieferer} liefert `, `Firma ${lieferer} verkauft `, `${lieferer} veräußert `, `${lieferer} hat verkauft: `];
  const verkaufArray_Subjekt_2 = [`Verkauf `];
  const verkaufArray_Subjekt_3 = [`Ein Kunde bittet um ein Angebot für Fertigerzeugnisse. Berechne den Listenverkaufspreis unter den folgenden Bedingungen: `, `${lieferer} erhält eine Anfrage für ein Angebot per E-Mail. Du sollst nun den Listenverkaufspreis berechnen, wenn wir mit den folgenden Werten kalkulieren: `];
  const verkaufArray_Subjekt_4 = [`${lieferer} erreicht eine telefonische Anfrage für den Kauf von Fertigerzeugnissen. Berechne den Listenverkaufspreis bei`, `${lieferer} erhält eine Kundenanfrage per Mail. Berechne den Listenverkaufspreis bei `];
  const verkaufArray_Subjekt_5 = [`Ein Kunde bezahlt die Rechnung per Banküberweisung innerhalb der Skontofrist mit ${verkaufRandom_Skonto} % Skonto`, `Die Rechnung wird mit ${verkaufRandom_Skonto} % Skonto per Banküberweisung ausgeglichen`, `Der Rechnungsausgleich erfolgt mit ${verkaufRandom_Skonto} % Skonto per Bank`,];
  const verkaufArray_Subjekt_6 = [`Ein Kunde verhandelt mit ${lieferer} über den Kauf von Fertigerzeugnissen`, `${lieferer} erhalten von einem Kunden eine Anfrage für Fertigerzeugnisse`, `Ein Kunde sendet ${lieferer} per E-Mail eine Anfrage für den Bezug von Fertigerzeugnissen`, `Ein Stammkunde möchte bei ${lieferer} Fertigerzeugnisse kaufen und sendet eine Anfrage`];
  const verkaufArray_Fertigerzeugnisse = Object.keys(kontenUmsatzserloese);
  const verkaufArray_Fertigerzeugnisse_2 = Object.keys(kontenUmsatzerloese_2);
  const verkaufArray_Supply_Wert = ['mit einem Verkaufspreis in Höhe von', 'im Wert von', 'mit', 'in Höhe von', 'mit einem Betrag in Höhe von', 'im Umfang von'];
  const verkaufArray_Zahlung = Object.keys(verkaufKontenZahlung);
  const verkaufArray_Supply_Rabatt = [`, ${verkaufRandom_Rabatt} % Rabatt`];
  const verkaufArray_Supply_Rabatt_2 = [
    `. ${lieferer} bietet ${verkaufRandom_Rabatt} % Treuerabatt`,
    `. ${lieferer} bietet ${verkaufRandom_Rabatt} % Mengenrabatt`,
    `. ${verkaufRandom_Rabatt} % Sonderrabatt werden von uns angeboten`,
    `. ${verkaufRandom_Rabatt} % Rabatt können vom Kunden abgezogen werden`,
    `. ${lieferer} gewährt zudem ${verkaufRandom_Rabatt} % Kundenrabatt`,
    `. ${lieferer} gewährt zudem ${verkaufRandom_Rabatt} % Mengenrabatt`,
  ];
  const verkaufArray_Supply_Skonto = [
    `. Der Kunde kann ${verkaufRandom_Skonto} % Skonto abziehen`,
    `. Der Skonto beträgt ${verkaufRandom_Skonto} %`,
    `. Als nachträglichen Preisnachlass wird ${verkaufRandom_Skonto} % Skonto angesetzt`,
  ];
  const verkaufArray_Supply_Skonto_2 = [
    ` und ${verkaufRandom_Skonto} % Skonto`,
    ` sowie ${verkaufRandom_Skonto} % Skonto`,
  ];
  const verkaufArray_Supply_Bezugskosten = [
    `. Zusätzlich belastet ${lieferer} den Kunden mit Versandkosten von netto ${verkaufRandom_Bezugskosten}`,
    `. Zusätzlich berechnet ${lieferer} Verpackungskosten in Höhe von ${verkaufRandom_Bezugskosten} netto`,
    `. Transportversicherung und Rollgeld betragen darüber hinaus netto ${verkaufRandom_Bezugskosten} und werden dem Kunden zusätzlich berechnet`,
    `. Die Leihverpackung in Höhe von ${verkaufRandom_Bezugskosten} netto wird dem Kunden zusätzlich berechnet`,
    `. Es werden darüber hinaus netto ${verkaufRandom_Bezugskosten} an Versandkosten dem Kunden berechnet`,
  ];
  const verkaufArray_Supply_Gewinn = [
    ` ${verkaufRandom_Gewinn} % Gewinnzuschlag `,
    ` ${verkaufRandom_Gewinn} % Gewinn `,
  ];


  // Zufällige Auswahl der Elemente und der alternativen Arrays
  const verkaufSelectedarray_Subjekt = Math.random() < 0.5 ? verkaufArray_Subjekt : verkaufArray_Subjekt_2;
  const verkaufSelectedarray_Fertigerzeugnisse = verkaufSelectedarray_Subjekt === verkaufArray_Subjekt_2 ? verkaufArray_Fertigerzeugnisse_2 : verkaufArray_Fertigerzeugnisse;
  const verkaufSelectedarray_Angebot = verkaufSelectedarray_Fertigerzeugnisse === verkaufArray_Fertigerzeugnisse ? verkaufArray_Subjekt_3 : verkaufArray_Subjekt_4;
  // Zufällige Auswahl der Elemente aus den ausgewählten Arrays
  const verkaufRandomSubjekt = verkaufSelectedarray_Subjekt[Math.floor(Math.random() * verkaufSelectedarray_Subjekt.length)];
  const verkaufRandomAngebot = verkaufSelectedarray_Angebot[Math.floor(Math.random() * verkaufSelectedarray_Angebot.length)];
  const verkaufRandomFertigerzeugnis = verkaufSelectedarray_Fertigerzeugnisse[Math.floor(Math.random() * verkaufSelectedarray_Fertigerzeugnisse.length)];
  const verkaufRandomSupply_Wert = verkaufArray_Supply_Wert[Math.floor(Math.random() * verkaufArray_Supply_Wert.length)];
  const verkaufAntwortFertigerzeugnis = kontenUmsatzserloese[verkaufRandomFertigerzeugnis]?.Hauptkonto || kontenUmsatzerloese_2[verkaufRandomFertigerzeugnis]?.Hauptkonto;
  const verkaufAntwortBezugskosten = kontenUmsatzserloese[verkaufRandomFertigerzeugnis]?.Unterkonto || kontenUmsatzerloese_2[verkaufRandomFertigerzeugnis]?.Unterkonto;
  const verkaufAntwortSkontobuchungssatz = kontenUmsatzserloese[verkaufRandomFertigerzeugnis]?.Nachlasskonto || kontenUmsatzerloese_2[verkaufRandomFertigerzeugnis]?.Nachlasskonto;
  const verkaufRandomSkontobuchungssatz = verkaufArray_Subjekt_5[Math.floor(Math.random() * verkaufArray_Subjekt_5.length)];
  const verkaufRandomDifferenzkalkulation = verkaufArray_Subjekt_6[Math.floor(Math.random() * verkaufArray_Subjekt_6.length)];
 const verkaufNettoOderBrutto = verkaufMitRabatt.checked ? 'Netto' : (Math.random() < 0.5 ? 'Netto' : 'Brutto');
  let verkaufWert = generateRandomNettoWert();
  const verkaufRandomZahlung = verkaufArray_Zahlung[Math.floor(Math.random() * verkaufArray_Zahlung.length)];
  const verkaufAntwortZahlung = verkaufKontenZahlung[verkaufRandomZahlung]
  if (verkaufAntwortZahlung === "2880 KA") {
    verkaufWert = parseFloat(verkaufWert) / 10;
  }
  const verkaufNettoWert = formatCurrency(verkaufWert);
  let verkaufBruttoWert = formatCurrency(Math.round(verkaufWert * 0.19 + verkaufWert));
  let verkaufRandomNettowert;

  // Anzeige wenn Brutto oder Netto
  verkaufRandomNettowert = verkaufNettoOderBrutto === 'Netto' ? `${verkaufNettoWert} netto` : `brutto ${verkaufBruttoWert}`;
  let verkaufRandomSupply_Rabatt;
  let verkaufRandomSupply_Rabatt_2;
  let verkaufBerechnung_nettoWert;


  // Berechnung mit Rabatt
  if (verkaufMitRabatt.checked) {
    verkaufRandomSupply_Rabatt = verkaufArray_Supply_Rabatt[Math.floor(Math.random() * verkaufArray_Supply_Rabatt.length)];
    verkaufRandomSupply_Rabatt_2 = verkaufArray_Supply_Rabatt_2[Math.floor(Math.random() * verkaufArray_Supply_Rabatt_2.length)];
    verkaufBerechnung_nettoWert = parseFloat(verkaufNettoWert.replace(/[^\d,-]/g, '')) * (100 - parseFloat(verkaufRandom_Rabatt)) / 100;
  } else {
    verkaufRandom_Rabatt = 0;
    verkaufRandomSupply_Rabatt = "";
    verkaufRandomSupply_Rabatt_2 = "";
    verkaufBerechnung_nettoWert = parseFloat(verkaufNettoWert.replace(/[^\d,-]/g, ''));
  }

  let verkaufRandomSupply_Skonto = verkaufArray_Supply_Skonto[Math.floor(Math.random() * verkaufArray_Supply_Skonto.length)];
  let verkaufRandomSupply_Skonto_2 = verkaufArray_Supply_Skonto_2[Math.floor(Math.random() * verkaufArray_Supply_Skonto_2.length)];
  let verkaufBerechnung_skontoBetrag = verkaufRandom_Skonto / 100 * verkaufBerechnung_nettoWert;
  verkaufBerechnung_skontoBetrag = roundToTwoDecimals(verkaufBerechnung_skontoBetrag);
  verkaufBerechnung_skontoBetrag = roundToTwoDecimals(verkaufBerechnung_skontoBetrag);
  verkaufBerechnung_skontoBetrag = parseFloat(verkaufBerechnung_skontoBetrag);
  let verkaufBerechnung_skontoBetrag_brutto = (verkaufBerechnung_skontoBetrag) + (verkaufBerechnung_skontoBetrag * 0.19);
  let verkaufBerechnung_vorsteuer_berichtigung = verkaufBerechnung_skontoBetrag_brutto - verkaufBerechnung_skontoBetrag;
  let verkaufVorsteuer_berichtigung = formatCurrency(verkaufBerechnung_vorsteuer_berichtigung);
  let verkaufSkontoBetrag_brutto = formatCurrency(verkaufBerechnung_skontoBetrag_brutto);


  let verkaufSkontoBetrag = formatCurrency(verkaufBerechnung_skontoBetrag);
  let verkaufBerechnung_USTWert = verkaufBerechnung_nettoWert * 0.19;
  verkaufBerechnung_USTWert = roundToTwoDecimals(verkaufBerechnung_USTWert);
  let verkaufBerechnung_bruttoWert = verkaufBerechnung_nettoWert + (verkaufBerechnung_USTWert);
  let verkaufRandomSupply_Bezugskosten;

  // Berechnung mit Bezugskosten
  if (verkaufMitBezugskosten.checked) {
    verkaufRandomSupply_Bezugskosten = verkaufArray_Supply_Bezugskosten[Math.floor(Math.random() * verkaufArray_Supply_Bezugskosten.length)];
    verkaufBerechnung_USTWert = (verkaufBerechnung_nettoWert + parseFloat(verkaufRandom_Bezugskosten)) * 0.19;
    verkaufBerechnung_USTWert = roundToTwoDecimals(verkaufBerechnung_USTWert);
    verkaufBerechnung_bruttoWert = verkaufBerechnung_nettoWert + (verkaufBerechnung_USTWert) + parseFloat(verkaufRandom_Bezugskosten);
    verkaufBerechnung_bruttoWert = roundToTwoDecimals(verkaufBerechnung_bruttoWert);
    verkaufBruttoWert = roundToTwoDecimals((verkaufWert * 0.19 + verkaufWert) + parseFloat(verkaufRandom_Bezugskosten) * 0.19 + parseFloat(verkaufRandom_Bezugskosten));
    verkaufBruttoWert = formatCurrency(verkaufBruttoWert);
  } else {
    verkaufRandom_Bezugskosten = 0;
    verkaufRandomSupply_Bezugskosten = "";
    verkaufBerechnung_USTWert = verkaufBerechnung_USTWert;
  }
  verkaufBerechnung_nettoWert = parseFloat(verkaufBerechnung_nettoWert) + parseFloat(verkaufRandom_Bezugskosten);
  verkaufBerechnung_nettoWert = roundToTwoDecimals(verkaufBerechnung_nettoWert);
  verkaufBerechnung_nettoWert = parseFloat(verkaufBerechnung_nettoWert);
  let verkaufBezugskostenWert = formatCurrency(verkaufRandom_Bezugskosten);

  let verkaufAntwortNettowert = formatCurrency(verkaufBerechnung_nettoWert);
  let verkaufBerechnung_rabattWert = parseFloat(verkaufNettoWert.replace(/[^\d,-]/g, '')) * verkaufRandom_Rabatt / 100;
  verkaufBerechnung_rabattWert = roundToTwoDecimals(verkaufBerechnung_rabattWert);
  let verkaufRabattWert = formatCurrency(verkaufBerechnung_rabattWert);

  // Gewinn Berechnen
  let verkaufBerechnung_barverkaufspreis = parseFloat(verkaufBerechnung_nettoWert) - parseFloat(verkaufBerechnung_skontoBetrag);
  verkaufBerechnung_barverkaufspreis = roundToTwoDecimals(verkaufBerechnung_barverkaufspreis);
  verkaufBerechnung_barverkaufspreis = parseFloat(verkaufBerechnung_barverkaufspreis);
  let verkaufBarverkaufspreis = formatCurrency(verkaufBerechnung_barverkaufspreis);
  let verkaufRandomSupply_Gewinn = verkaufArray_Supply_Gewinn[Math.floor(Math.random() * verkaufArray_Supply_Gewinn.length)];
  // Diferenzkalkualtion Gewinn
  let verkaufWunschRandom_Gewinn = getRandomWunschGewinn();
  let verkaufWunschGewinn;
  let verkauf_Random_Gewinn_Berechnet = 0;
  if (verkaufBuchungsoptionDropdown.value === 'verkaufDifferenzkalkulation') {
    verkaufWunschGewinn = parseFloat(verkaufRandom_Gewinn);
    verkaufRandom_Gewinn = parseFloat(verkaufRandom_Gewinn) + parseFloat(verkaufWunschRandom_Gewinn);
  } else {
    verkaufRandom_Gewinn = verkaufRandom_Gewinn;
  }
  let verkaufBerechnungGewinnWert = parseFloat(verkaufBerechnung_barverkaufspreis) * parseFloat(verkaufRandom_Gewinn) / (100 + parseFloat(verkaufRandom_Gewinn))
  verkaufBerechnungGewinnWert = roundToTwoDecimals(verkaufBerechnungGewinnWert);
  let verkaufGewinnWert = formatCurrency(verkaufBerechnungGewinnWert);
  let verkaufBerechnungSelbstkostenpreis = parseFloat(verkaufBerechnung_barverkaufspreis) - parseFloat(verkaufBerechnungGewinnWert);
  verkaufBerechnungSelbstkostenpreis = roundToTwoDecimals(verkaufBerechnungSelbstkostenpreis);
  verkauf_Random_Gewinn_Berechnet = (verkaufBerechnungGewinnWert * 100 / verkaufBerechnungSelbstkostenpreis).toLocaleString('de-DE', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  let verkaufSelbstkostenpreis = formatCurrency(verkaufBerechnungSelbstkostenpreis);

  let verkaufKundenanfrage;
  if (verkaufBuchungsoptionDropdown.value === 'verkaufDifferenzkalkulation') {

    if (verkaufRandom_Gewinn < 0) {
      verkaufKundenanfrage = "Wir können die Kundenanfrage nicht akzeptieren, da wir Verlust machen würden.";
    } else if (verkaufRandom_Gewinn === 0) {
      verkaufKundenanfrage = "Wir würden unter den angegebenen Konditionen keinen Gewinn erzielen. Unter gewissen Umständen sollte der Auftrag dennoch angenommen werden, falls damit zum Beispiel ein neuer Kunde gewonnen werden kann.";
    } else if (verkaufRandom_Gewinn > 0) {
      if (verkaufRandom_Gewinn < verkaufWunschGewinn) {
        verkaufKundenanfrage = "Der Mindestgewinn wird zu den angegebenen Konditionen nicht erreicht. Unter gewissen Umständen sollte der Auftrag dennoch angenommen werden, falls damit zum Beispiel ein neuer Kunde gewonnen werden kann.";
      } else if (verkaufRandom_Gewinn >= verkaufWunschGewinn) {
        verkaufKundenanfrage = "Wir können die Kundenanfrage akzeptieren, da wir den Mindestgewinn erzielen.";
      }
    }
  }


  let verkaufUSTWert = formatCurrency(verkaufBerechnung_USTWert);
  let verkaufUeberweisungsbetrag_berechnung = verkaufBerechnung_bruttoWert - verkaufBerechnung_skontoBetrag_brutto;
  let verkaufUeberweisungsbetrag = formatCurrency(verkaufUeberweisungsbetrag_berechnung);
  let verkaufAntwortBruttowert = formatCurrency(verkaufBerechnung_bruttoWert);
  const verkaufAntwort_Selbstkostenpreis = `${verkaufSelbstkostenpreis}`;

  const listenverkaufspreis = `${verkaufNettoWert}`;
  const verkaufAntwort_rabattWert = `${verkaufRabattWert}`;
  const verkaufAntwort_rabattSatz = `${verkaufRandom_Rabatt}`;
  const verkaufAntwort_GewinnWert = `${verkaufGewinnWert}`;
  const verkaufAntwort_GewinnSatz = `${verkaufRandom_Gewinn}`;
  const verkaufAntwort_Gewinn_berechnet = `${verkauf_Random_Gewinn_Berechnet}`;
  const verkaufAntwort_wunschGewinn = `${verkaufWunschGewinn}`;
  const verkaufAntwort_Kundenanfrage = `${verkaufKundenanfrage}`;
  const verkaufAntwort_skontoSatz = `${verkaufRandom_Skonto}`;
  const verkaufAntwort_skontoBetrag = `${verkaufSkontoBetrag}`;
  const verkaufAntwort_skontoBetrag_brutto = `${verkaufSkontoBetrag_brutto}`;
  const verkaufAntwort_vorsteuer_berichtigung = `${verkaufVorsteuer_berichtigung}`;
  const verkaufAntwort_ueberweisungsbetrag = `${verkaufUeberweisungsbetrag}`;
  const verkaufAntwort_barverkaufspreis = `${verkaufBarverkaufspreis}`;
  const verkaufKonto_1 = `${verkaufAntwortFertigerzeugnis}`;
  const Zielverkaufspreis = `${verkaufAntwortNettowert}`;
  const verkaufAntwort_bezugskosten = `${verkaufAntwortBezugskosten}`;
  const verkaufKonto_2 = `${verkaufAntwortZahlung}`;
  const verkaufKonto_Skontobuchungssatz = `${verkaufAntwortSkontobuchungssatz}`;
  const verkaufAntwort_bezugskostenWert = `${verkaufBezugskostenWert}`;
  const verkaufBetrag_2 = `${verkaufAntwortBruttowert}`;

  // Zusammenfügen der ausgewählten Elemente zu einem Satz
  let verkaufAngebotSatz;
  const verkaufRandomAngebotSatz = Math.random();
  verkaufAngebotSatz = `<ol style="list-style-type: lower-latin;">`;
  if (verkaufRandomAngebotSatz < 0.33) {
    verkaufAngebotSatz += `<li>${verkaufRandomAngebot} Selbstkostenpreis ${verkaufAntwort_Selbstkostenpreis}, ${verkaufRandomSupply_Gewinn} ${verkaufRandomSupply_Rabatt} ${verkaufRandomSupply_Skonto_2}.</li><li>Bilde den Buchungssatz: der Kunde akzeptiert das Angebot. Die Bezahlung erfolgt ${verkaufRandomZahlung}.</li>`;
  } else if (verkaufRandomAngebotSatz < 0.66) {
    verkaufAngebotSatz += `<li>${verkaufRandomAngebot} Selbstkostenpreis ${verkaufAntwort_Selbstkostenpreis}, ${verkaufRandomSupply_Gewinn} ${verkaufRandomSupply_Rabatt} ${verkaufRandomSupply_Skonto_2}.</li><li>Der Kunde akzeptiert das Angebot und gibt die Bestellung in Auftrag. Wir liefern ${verkaufRandomZahlung}.</li>`;
  } else {
    verkaufAngebotSatz += `<li>${verkaufRandomAngebot} ${verkaufRandomSupply_Gewinn} ${verkaufRandomSupply_Rabatt} ${verkaufRandomSupply_Skonto_2}. Die Selbstkosten betragen ${verkaufAntwort_Selbstkostenpreis}.</li><li>Der Kunde nimmt das Angebot ${verkaufRandomZahlung} an. Bilde den Buchungssatz!</li>`;
  }
  verkaufAngebotSatz += `</ol>`;

  let verkaufDifferenzSatz;
  const verkaufRandomDifferenzkalkulationSatz = Math.random();
  if (verkaufRandomDifferenzkalkulationSatz < 0.33) {
    verkaufDifferenzSatz = `${verkaufRandomDifferenzkalkulation} zum Listenpreis von ${verkaufRandomNettowert} ${verkaufRandomSupply_Rabatt} ${verkaufRandomSupply_Skonto_2}. Berechne, ob wir die Anfrage zu den genannten Konditionen akzeptieren können, wenn der Selbstkostenpreis ${verkaufAntwort_Selbstkostenpreis} beträgt und wir mindestens ${verkaufWunschGewinn} % Gewinn erzielen wollen.`;
  } else if (verkaufRandomDifferenzkalkulationSatz < 0.66) {
    verkaufDifferenzSatz = `${verkaufRandomDifferenzkalkulation}. Er schlägt einen Listenpreis von ${verkaufRandomNettowert} vor ${verkaufRandomSupply_Rabatt} ${verkaufRandomSupply_Skonto_2}. Der Selbstkostenpreis beträgt dabei ${verkaufAntwort_Selbstkostenpreis} und wir wollen mindestens ${verkaufWunschGewinn} % Gewinn erzielen. Berechne, ob wir die Anfrage zu den genannten Konditionen akzeptieren können.`;
  } else {
    verkaufDifferenzSatz = `${verkaufRandomDifferenzkalkulation}. Er möchte einen Listenpreis von ${verkaufRandomNettowert} bezahlen ${verkaufRandomSupply_Rabatt} ${verkaufRandomSupply_Skonto_2} erhalten. Berechne, ob wir die Anfrage akzeptieren können. Wir möchten mindestens ${verkaufWunschGewinn} % Gewinn erzielen, die Selbstkosten betragen ${verkaufAntwort_Selbstkostenpreis}.`;
  }

  let verkaufZufaelligerSatz;
  const verkaufRandomValue = Math.random();
  if (verkaufRandomValue < 0.33) {
    verkaufZufaelligerSatz = `${verkaufRandomSubjekt} ${verkaufRandomFertigerzeugnis} ${verkaufRandomZahlung} ${verkaufRandomSupply_Wert} ${verkaufRandomNettowert} ${verkaufRandomSupply_Rabatt_2} ${verkaufRandomSupply_Bezugskosten}.`;
  } else if (verkaufRandomValue < 0.66) {
    verkaufZufaelligerSatz = `${verkaufRandomSubjekt} ${verkaufRandomFertigerzeugnis} ${verkaufRandomSupply_Wert} ${verkaufRandomNettowert} ${verkaufRandomZahlung} ${verkaufRandomSupply_Rabatt_2} ${verkaufRandomSupply_Bezugskosten}.`;
  } else {
    verkaufZufaelligerSatz = `${verkaufRandomSubjekt} ${verkaufRandomFertigerzeugnis} ${verkaufRandomZahlung} ${verkaufRandomSupply_Wert} ${verkaufRandomNettowert} ${verkaufRandomSupply_Rabatt_2} ${verkaufRandomSupply_Bezugskosten}.`;
  }

  const verkaufRandomSkontoSatz = Math.random();
  verkaufSkontoSatz = `<ol style="list-style-type: lower-latin;">`;
  if (verkaufRandomSkontoSatz < 0.33) {
    verkaufSkontoSatz += `<li>Bilde den Buchungssatz zum Geschäftsfall.</li><li>Bilde den Buchungssatz: ${verkaufRandomSkontobuchungssatz}.</li>`;
  } else if (verkaufRandomSkontoSatz < 0.66) {
    verkaufSkontoSatz += `<li>Bilde den Buchungssatz zum Geschäftsfall.</li><li>${verkaufRandomSkontobuchungssatz}. Bilde den Buchungssatz.</li>`;
  } else {
    verkaufSkontoSatz += `<li>Bilde den Buchungssatz zum Geschäftsfall.</li><li>Bilde den Buchungssatz: ${verkaufRandomSkontobuchungssatz}.</li>`;
  }
  verkaufSkontoSatz += `</ol>`;



  return [verkaufZufaelligerSatz, verkaufAngebotSatz, verkaufDifferenzSatz, verkaufSkontoSatz, listenverkaufspreis, verkaufAntwort_rabattWert, verkaufAntwort_Selbstkostenpreis, verkaufAntwort_rabattSatz, verkaufAntwort_GewinnWert, verkaufAntwort_GewinnSatz, verkaufAntwort_Gewinn_berechnet, verkaufAntwort_wunschGewinn, verkaufAntwort_Kundenanfrage, verkaufAntwort_skontoSatz, verkaufAntwort_skontoBetrag, verkaufAntwort_skontoBetrag_brutto, verkaufAntwort_vorsteuer_berichtigung, verkaufAntwort_ueberweisungsbetrag, verkaufAntwort_barverkaufspreis, verkaufKonto_1, Zielverkaufspreis, verkaufAntwort_bezugskosten, verkaufAntwort_bezugskostenWert, verkaufUSTWert, verkaufKonto_2, verkaufBetrag_2, verkaufKonto_Skontobuchungssatz];

}


function verkaufZeigeZufaelligenSatz() {

  const verkaufAnzahl = parseInt(verkaufAnzahlDropdown.value);
  const container = document.getElementById('Container');
  const buttonColumn = document.getElementById('verkauf-button-column'); // ← muss im HTML existieren!

  if (!container || !buttonColumn) {
    console.error("Container oder Button-Column nicht gefunden");
    return;
  }

  // Inhalte zurücksetzen
  container.innerHTML = '';
  buttonColumn.innerHTML = '';


  let verkaufSatzOutput = '<h2>Aufgaben</h2>';
  verkaufSatzOutput += '<ol>';
  let verkaufAntwortOutput = `<h2>Lösung</h2>`;

  

  for (let i = 1; i <= verkaufAnzahl; i++) {
    const [verkaufZufaelligerSatz, verkaufAngebotSatz, verkaufDifferenzSatz, verkaufSkontoSatz, verkaufListenverkaufspreis, verkaufAntwort_rabattWert, verkaufAntwort_Selbstkostenpreis, verkaufAntwort_rabattSatz, verkaufAntwort_GewinnWert, verkaufAntwort_GewinnSatz, verkaufAntwort_Gewinn_berechnet, verkaufAntwort_wunschGewinn, verkaufAntwort_Kundenanfrage, verkaufAntwort_skontoSatz, verkaufAntwort_skontoBetrag, verkaufAntwort_skontoBetrag_brutto, verkaufAntwort_vorsteuer_berichtigung, verkaufAntwort_ueberweisungsbetrag, verkaufAntwort_barverkaufspreis, verkaufKonto_1, Zielverkaufspreis, verkaufAntwort_bezugskosten, verkaufAntwort_bezugskostenWert, verkaufUSTWert, verkaufKonto_2, verkaufBetrag_2, verkaufKonto_Skontobuchungssatz] = verkaufErstelleZufallssatz();
    const verkaufFormattedSatz = verkaufZufaelligerSatz.replace(/\s+/g, ' ').replace(/\s(?=[.,;:!])/g, '');
    const verkaufFormattedAngebot = verkaufAngebotSatz.replace(/\s+/g, ' ').replace(/\s(?=[.,;:!])/g, '');
    const verkaufFormattedSkonto = verkaufSkontoSatz.replace(/\s+/g, ' ').replace(/\s(?=[.,;:!])/g, '');
    const verkaufFormattedDifferenz = verkaufDifferenzSatz.replace(/\s+/g, ' ').replace(/\s(?=[.,;:!])/g, '');
    // Generierte Sätze hinzufügen

    verkaufSatzOutput += `<li>`;

    switch (verkaufBuchungsoptionDropdown.value) {
      case 'verkaufskalkulation':
        verkaufSatzOutput += `<div>${verkaufFormattedAngebot}</div><br>`;
        break;
      case 'verkaufSkontobuchungssatz':
        verkaufSatzOutput += `${verkaufFormattedSatz}<br><br>`;
        verkaufSatzOutput += `${verkaufFormattedSkonto}<br><br>`;
        break;
      case 'verkaufDifferenzkalkulation':
        verkaufSatzOutput += `${verkaufFormattedDifferenz}<br><br>`;
        break;
      default:
        verkaufSatzOutput += `${verkaufFormattedSatz}<br><br>`;
    }

    verkaufSatzOutput += `</li>`;

    // ── Beleg-Buttons erzeugen ────────────────────────────────────────────────
const buttonColumn = document.getElementById('verkauf-button-column'); // ← Muss im HTML existieren!

if (!buttonColumn) {
    console.warn("verkauf-button-column nicht gefunden → Buttons werden nicht angezeigt");
} else {
    const geschaeftsfallDaten = {
        listenverkaufspreis: verkaufListenverkaufspreis,
        rabattSatz:          verkaufAntwort_rabattSatz,
        bezugskostenWert:    verkaufAntwort_bezugskostenWert,   // meist Versandkosten
        skontoSatz:          verkaufAntwort_skontoSatz,
        produktName:         verkaufExtractProduktName(verkaufKonto_1)
    };

    const buttonDiv = document.createElement('div');
    buttonDiv.style.margin = '12px 0';

    if (verkaufBuchungsoptionDropdown.value === 'verkaufskalkulation') {
        // Angebot + Rechnung bei Kalkulation
        buttonDiv.innerHTML = `
            ${verkaufErstelleAngebotButton(i, geschaeftsfallDaten)}
            <div style="margin-top:8px;"></div>
            ${verkaufErstelleRechnungButton(i, geschaeftsfallDaten)}
        `;
    } else {
        // Alle anderen Fälle → (vorerst) nur Rechnung
        buttonDiv.innerHTML = erstelleGeschaeftsfallButton(i, geschaeftsfallDaten);
    }

    // Neuen Container pro Aufgabe erzeugen (oder einfach anhängen)
    const colItem = document.createElement('div');
    colItem.style.marginBottom = '20px';
    colItem.appendChild(buttonDiv);

    buttonColumn.appendChild(colItem);
}

    // Generierte Antworten hinzufügen
    verkaufAntwortOutput += `${parseInt(i)}.<br><br>`;
    if (verkaufBuchungsoptionDropdown.value === 'verkaufskalkulation' || verkaufBuchungsoptionDropdown.value === 'verkaufDifferenzkalkulation') {
      verkaufAntwortOutput += `<table style="border-collapse: collapse;white-space:nowrap;width:350px;margin: 0 0">`;
      verkaufAntwortOutput += `<tbody>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td>Selbstkostenpreis</td><td style="padding-left:16px;text-align:right;">${verkaufAntwort_Selbstkostenpreis}</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">100 %</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td>+ Gewinn</td><td style="padding-left:16px;text-align:right;">${verkaufAntwort_GewinnWert}</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">${verkaufAntwort_GewinnSatz} %</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">&nbsp;`;
      if (verkaufBuchungsoptionDropdown.value === 'verkaufDifferenzkalkulation') {
        verkaufAntwortOutput += ` (${verkaufAntwort_Gewinn_berechnet} %)`;
      }
      verkaufAntwortOutput += `</td>`;
      verkaufAntwortOutput += `</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td style="border-top: solid 1px #ccc">= Barverkaufspreis</td>`;
      verkaufAntwortOutput += `<td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc"">${verkaufAntwort_barverkaufspreis}</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">${100+parseFloat(verkaufAntwort_GewinnSatz)} %</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">${100-verkaufAntwort_skontoSatz} %</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td>+ Kundenkonto</td>`;
      verkaufAntwortOutput += `<td style="padding-left:16px;text-align:right;">${verkaufAntwort_skontoBetrag}<br></td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;"></td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">${verkaufAntwort_skontoSatz} %</td>`;
      verkaufAntwortOutput += ` </tr>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td style="border-top: solid 1px #ccc">= Zielverkaufspreis</td>`;
      verkaufAntwortOutput += `<td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc">${Zielverkaufspreis}</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">${100-verkaufAntwort_rabattSatz} %</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">100 %</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td>+ Kundenrabatt</td><td style="padding-left:16px;text-align:right;">${verkaufAntwort_rabattWert}</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">${verkaufAntwort_rabattSatz} %</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">&nbsp;</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td style="border-top: solid 1px #ccc">= Listenverkaufspreis</td>`;
      verkaufAntwortOutput += `<td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc">${verkaufListenverkaufspreis}</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">100 %</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">&nbsp;</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `</tbody>`;
      verkaufAntwortOutput += `</table>`;
      verkaufAntwortOutput += `<br><br>`;
    }
    if (verkaufBuchungsoptionDropdown.value === 'verkaufDifferenzkalkulation') {
      verkaufAntwortOutput += `<p>${verkaufAntwort_Kundenanfrage}</p>`;
    }
    if (verkaufBuchungsoptionDropdown.value != 'verkaufDifferenzkalkulation') {
      verkaufAntwortOutput += `<table style="border: 1px solid #ccc;white-space:nowrap;background-color:#fff;font-family:courier;width:600px;margin:0 0;margin-bottom:6px;">`;
      verkaufAntwortOutput += `<tbody>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">${verkaufKonto_2}</td>`;
      verkaufAntwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">${verkaufBetrag_2}</td>`;
      verkaufAntwortOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 40px" tabindex="1">an</td>`;
      verkaufAntwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px;text-align:left" tabindex="1">${verkaufKonto_1}</td>`;
      verkaufAntwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px;text-align:right" tabindex="1">${Zielverkaufspreis}</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1"></td>`;
      verkaufAntwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 120px" tabindex="1"></td>`;
      verkaufAntwortOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 50px" tabindex="1"></td>`;
      verkaufAntwortOutput += `<td style="text-align:left;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">4800 UST</td>`;
      verkaufAntwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">${verkaufUSTWert}</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `</tbody>`;
      verkaufAntwortOutput += `</table>`;
      verkaufAntwortOutput += `<br>`;
    }
    if (verkaufBuchungsoptionDropdown.value === 'verkaufSkontobuchungssatz') {
      verkaufAntwortOutput += `<h4>Nebenrechnung:</h4>`;
      verkaufAntwortOutput += `<table style="border-collapse: collapse;white-space:nowrap;width:350px;margin: 0 0">`;
      verkaufAntwortOutput += `<tbody>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td>Rechnungsbetrag</td><td style="padding-left:16px;text-align:right;">${verkaufBetrag_2}</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">&nbsp;</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td>- Skonto (brutto)</td><td style="padding-left:16px;text-align:right;">${verkaufAntwort_skontoBetrag_brutto}</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">${verkaufAntwort_skontoSatz} %</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<tr border-top: solid 1px #ccc>`;
      verkaufAntwortOutput += `<td style="border-top: solid 1px #ccc">= Überweisungsbetrag</td>`;
      verkaufAntwortOutput += `<td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc">${verkaufAntwort_ueberweisungsbetrag}</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">&nbsp;</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `</table>`;
      verkaufAntwortOutput += `<br>`;
      verkaufAntwortOutput += `<table style="border-collapse: collapse;white-space:nowrap;width:350px;margin: 0 0">`;
      verkaufAntwortOutput += `<tbody>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td>Skonto (brutto)</td><td style="padding-left:16px;text-align:right;">${verkaufAntwort_skontoBetrag_brutto}</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">119 %</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td>- Umsatzsteuer</td><td style="padding-left:16px;text-align:right;">${verkaufAntwort_vorsteuer_berichtigung}</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">19 %</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<tr border-top: solid 1px #ccc>`;
      verkaufAntwortOutput += `<td style="border-top: solid 1px #ccc">= Skonto (netto)</td>`;
      verkaufAntwortOutput += `<td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc">${verkaufAntwort_skontoBetrag}</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">100 %</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `</table>`;
      verkaufAntwortOutput += `<br>`;
      verkaufAntwortOutput += `<table style="border: 1px solid #ccc;white-space:nowrap;background-color:#fff;font-family:courier;width:600px;margin:0 0;margin-bottom:6px;">`;
      verkaufAntwortOutput += `<tbody>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">2800 BK</td>`;
      verkaufAntwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">${verkaufAntwort_ueberweisungsbetrag}</td>`;
      verkaufAntwortOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 40px" tabindex="1">an</td>`;
      verkaufAntwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px;text-align:left" tabindex="1">2400 FO</td>`;
      verkaufAntwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px;text-align:right" tabindex="1">${verkaufBetrag_2}</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">${verkaufKonto_Skontobuchungssatz}</td>`;
      verkaufAntwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">${verkaufAntwort_skontoBetrag}</td>`;
      verkaufAntwortOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 50px" tabindex="1"></td>`;
      verkaufAntwortOutput += `<td style="text-align:left;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1"></td>`;
      verkaufAntwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1"></td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">4800 UST</td>`;
      verkaufAntwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">${verkaufAntwort_vorsteuer_berichtigung}</td>`;
      verkaufAntwortOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 50px" tabindex="1"></td>`;
      verkaufAntwortOutput += `<td style="text-align:left;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1"></td>`;
      verkaufAntwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1"></td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `</tbody>`;
      verkaufAntwortOutput += `</table>`;
      verkaufAntwortOutput += `<br>`;
    }
    verkaufAntwortOutput += `<br>`;
  }


  verkaufSatzOutput += '</ol>'; // Ende der nummerierten Liste für Sätze


  // Sätze und Antworten auf der Seite anzeigen
  document.getElementById('Container').innerHTML = verkaufSatzOutput + verkaufAntwortOutput;
}

// ============================================================================
// Dropdowns mit YAML-Unternehmen befüllen
// ============================================================================
function fillCompanyDropdowns() {
    if (!yamlData || yamlData.length === 0) {
        console.warn("yamlData ist leer → keine Unternehmen zum Befüllen");
        return;
    }

    // Sortierung: erst nach Branche, dann nach Name
    const sortedCompanies = [...yamlData].sort((a, b) => {
        const brancheA = a.unternehmen?.branche || '';
        const brancheB = b.unternehmen?.branche || '';
        if (brancheA !== brancheB) return brancheA.localeCompare(brancheB);
        return (a.unternehmen?.name || '').localeCompare(b.unternehmen?.name || '');
    });

    const kaueferSelect  = document.getElementById('einkaufKaeufer');
    const liefererSelect = document.getElementById('einkaufLieferer');

    // Leeren + Option "Bitte auswählen" hinzufügen
    const clearAndAddPlaceholder = (select) => {
        if (!select) return;
        select.innerHTML = '';
        const opt = document.createElement('option');
        opt.value = '';
        opt.text = '— bitte Unternehmen auswählen —';
        opt.disabled = true;
        opt.selected = true;
        select.appendChild(opt);
    };

    clearAndAddPlaceholder(kaueferSelect);
    clearAndAddPlaceholder(liefererSelect);

    // Alle Unternehmen einfügen
    sortedCompanies.forEach(company => {
        const u = company.unternehmen;
        if (!u?.name) return;

        const displayText = u.branche 
            ? `${u.branche} – ${u.name} ${u.rechtsform || ''}`.trim()
            : `${u.name} ${u.rechtsform || ''}`.trim();

        const option = document.createElement('option');
        option.value = u.name;           // ← wichtig: value = Firmenname
        option.textContent = displayText;

        // Optional: data-Attribute für spätere Verwendung
        option.dataset.id       = u.id       || '';
        option.dataset.rechtsform = u.rechtsform || '';
        option.dataset.branche  = u.branche  || '';

        // Kopie für beide Dropdowns
        if (kaueferSelect)  kaueferSelect.appendChild(option.cloneNode(true));
        if (liefererSelect) liefererSelect.appendChild(option);
    });

    console.log(`Dropdowns befüllt mit ${sortedCompanies.length} Unternehmen`);
}

// ============================================================================
// HILFSFUNKTIONEN FÜR VERKAUFS-BELEG-BUTTONS
// ============================================================================

function verkaufParseNumericValue(value) {
    if (!value) return '0';
    return value.toString()
        .replace(/[€\s]/g, '')
        .replace(/\./g, '')
        .replace(',', '.');
}

function verkaufExtractZahlungsart(kontoCode) {
    const map = {
        '2400 FO': 'Rechnung'
    };
    return map[kontoCode] || 'Rechnung';
}

function verkaufExtractProduktName(kontoCode) {
    // Hier kannst du später erweitern, wenn du mehrere Erlöskonten hast
    if (kontoCode.includes('5000')) return 'Fertigerzeugnisse';
    return 'Erzeugnisse';
}

function verkaufErzeugeURLFuerBeleg(geschaeftsfallDaten, typ = 'rechnung') {
    const params = new URLSearchParams();

    // Basis-Parameter
    params.set('beleg', 'rechnung');   // oder 'ausgangsrechnung' – je nach deinem belege.html

    // Vorlage je nach Typ
    let vorlage = null;
    if (typ === 'angebot') {
        vorlage = 'angebot2.svg';     //
    } else if (typ === 'rechnung') {
        vorlage = 'template1.svg';   // ← anpassen!
    }

    if (vorlage) {
        params.set('vorlage', vorlage);
    }

    // ── Verkaufsspezifische Parameter ───────────────────────────────────────
    if (geschaeftsfallDaten.listenverkaufspreis) {
        params.set('einzelpreis1', verkaufParseNumericValue(geschaeftsfallDaten.listenverkaufspreis));
    }
    if (geschaeftsfallDaten.rabattSatz) {
        params.set('rabatt', geschaeftsfallDaten.rabattSatz);
    }
    if (geschaeftsfallDaten.bezugskostenWert) {   // meist Versandkosten beim Verkauf
        params.set('bezugskosten', verkaufParseNumericValue(geschaeftsfallDaten.bezugskostenWert));
    }
    if (geschaeftsfallDaten.skontoSatz) {
        params.set('skonto', geschaeftsfallDaten.skontoSatz);
    }
    if (geschaeftsfallDaten.produktName) {
        params.set('artikel1', geschaeftsfallDaten.produktName);
    }

    // Kunde / Verkäufer (deine Dropdown-IDs anpassen!)
    const kundeSelect   = document.getElementById('einkaufKaeufer');   
    const liefererSelect = document.getElementById('einkaufLieferer'); 

    if (kundeSelect?.value)    params.set('kunde',    kundeSelect.value.trim());
    if (liefererSelect?.value) params.set('lieferer', liefererSelect.value.trim());

    // Standardwerte
    params.set('menge1',     '1');
    params.set('einheit1',   'Stück');
    params.set('umsatzsteuer', '19');
const now = new Date();

params.set('tag', now.getDate().toString().padStart(2, '0'));
params.set('monat', (now.getMonth() + 1).toString().padStart(2, '0'));

    return `belege.html?${params.toString()}`;
}


function erstelleGeschaeftsfallButton(nummer, daten) {
const url = verkaufErzeugeURLFuerBeleg(daten, 'rechnung');
    
    let buttonText = `📄 ${nummer}. Ausgangsrechnung erstellen`;
    let titleText = `Eingangsrechnung für Aufgabe ${nummer} als SVG-Beleg öffnen`;
       
    return `
        <button
            class="geschaeftsfall-beleg-button"
            onclick="window.open('${url}', '_blank')"
            title="${titleText}"
            style="width: 100%; padding: 10px 12px; font-size: 14px;"
        >
            ${buttonText}
        </button>
    `;
}

function verkaufErstelleAngebotButton(nummer, daten) {
    const url = verkaufErzeugeURLFuerBeleg(daten, 'angebot');
    
    return `
        <button class="geschaeftsfall-beleg-button angebot-button"
                onclick="window.open('${url}', '_blank')"
                title="Angebot für Aufgabe ${nummer} erstellen"
                style="width: 100%; padding: 10px 12px; font-size: 14px;">
            📄 ${nummer}a. Angebot erstellen
        </button>
    `;
}

function verkaufErstelleRechnungButton(nummer, daten) {
    const url = verkaufErzeugeURLFuerBeleg(daten, 'rechnung');
    return `
        <button class="geschaeftsfall-beleg-button rechnung-button"
                onclick="window.open('${url}', '_blank')"
                title="Ausgangsrechnung für Aufgabe ${nummer} erstellen"
                style="width:100%; padding:10px 12px; font-size:14px;">
            📄 ${nummer}b. Ausgangsrechnung erstellen
        </button>
    `;
}






            function autoSelectMyCompany() {
        const myCompanyName = localStorage.getItem('myCompany');
        
        if (!myCompanyName) return;
        
        // Finde alle Dropdowns mit class="meinUnternehmen"
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


// ============================================================================
// KI-ASSISTENT PROMPT – VERKAUF (Buchungssatz, Verkaufskalkulation, Skontobuchungssatz, Differenzkalkulation)
// ============================================================================

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Buchführungs-Assistent für Schüler der Realschule (BwR), 8. Klasse. Du hilfst beim Verständnis von Buchungssätzen und der Verkaufskalkulation im Bereich Absatz/Verkauf.

Aufgabe:
- Gib KEINE fertigen Buchungssätze, Berechnungen oder Konten vor.
- Führe die Schüler durch gezielte Fragen und Hinweise zur richtigen Lösung.
- Ziel: Lernförderung, nicht das Abnehmen der Denkarbeit.

Pädagogischer Ansatz:
- Frage nach dem konkreten Geschäftsfall und dessen Inhalt.
- Stelle gezielte Rückfragen, um den Stand des Schülers zu verstehen.
- Beantworte deine Rückfragen nicht selbst – hake bei falschen Antworten nach.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Erst wenn alle Teilschritte richtig beantwortet wurden, bestätige den vollständigen Buchungssatz oder die Kalkulation.

---

AUFGABENTYP 1: BUCHUNGSSATZ (Verkauf von Fertigerzeugnissen)

Methodik bei Rückfragen:
- Was wurde verkauft?
- Gibt es Rabatt? Wie wirkt sich das auf den Zielverkaufspreis aus?
- Gibt es Bezugskosten (Versandkosten), die dem Kunden berechnet werden?
- Gibt es Umsatzsteuer? Wie hoch ist sie, und auf welchen Betrag wird sie berechnet?
- Welches Konto kommt ins Soll, welches ins Haben?

Kontenplan – Verkauf von Fertigerzeugnissen:

Erlöskonto (immer im HABEN):
- 5000 UEFE – Umsatzerlöse aus Fertigerzeugnissen

Umsatzsteuer (immer im HABEN):
- 4800 UST – Umsatzsteuer 19 %

Zahlungskonto (immer im SOLL):
- 2400 FO – Forderungen gegenüber Kunden (Verkauf auf Ziel / Rechnung)

Buchungssatz-Schema ohne Bezugskosten:
  2400 FO (Soll)    | Bruttobetrag
  an 5000 UEFE (Haben) | Zielverkaufspreis (netto)
  an 4800 UST (Haben)  | Umsatzsteuer

Buchungssatz-Schema mit Bezugskosten (Versandkosten):
  2400 FO (Soll)    | Bruttobetrag gesamt
  an 5000 UEFE (Haben)    | Zielverkaufspreis (netto)
  an [Erlöskonto] (Haben) | Bezugskosten (netto)
  an 4800 UST (Haben)     | Umsatzsteuer gesamt

Rabattberechnung:
- Listenverkaufspreis × (100 % − Rabatt %) = Zielverkaufspreis
- Rabatt mindert den Zielverkaufspreis

Umsatzsteuerberechnung:
- Wenn Bezugskosten: (Zielverkaufspreis + Bezugskosten) × 19 % = Umsatzsteuer
- Wenn keine Bezugskosten: Zielverkaufspreis × 19 % = Umsatzsteuer

Häufige Schülerfehler Buchungssatz:
- Soll und Haben vertauscht (Forderung gehört ins Soll, Erlös ins Haben)
- Umsatzsteuer vergessen
- Listenverkaufspreis statt Zielverkaufspreis beim Erlöskonto eingetragen
- Brutto statt Netto beim Erlöskonto eingetragen
- Bezugskosten vergessen, wenn sie dem Kunden berechnet werden

---

AUFGABENTYP 2: VERKAUFSKALKULATION (Listenverkaufspreis berechnen)

Methodik bei Rückfragen:
- Womit beginnt die Verkaufskalkulation? Was ist der Ausgangspunkt?
- Was wird zum Selbstkostenpreis hinzugerechnet?
- Was ergibt sich nach dem Gewinnzuschlag?
- Wozu wird das Kundenskonto beim Berechnen des Listenpreises addiert (nicht subtrahiert)?
- Was wird zum Zielverkaufspreis noch addiert, um den Listenverkaufspreis zu erhalten?

Kalkulationsschema Verkauf:
  Selbstkostenpreis         100 %
  + Gewinn                  z. B. 20 %
  = Barverkaufspreis        120 %   (= 100 % Basis für Skonto)
  + Kundenskonto            z. B. 2 %    (= 2 % vom Barverkaufspreis, da Skonto auf Zielpreis)
  = Zielverkaufspreis       z. B. 102 %  (des Barverkaufspreises)
  + Kundenrabatt            z. B. 10 %   (= Zielverkaufspreis ÷ 90 % × 10 %)
  = Listenverkaufspreis     100 %

Wichtige Hinweise zur Kalkulation:
- Gewinn bezieht sich auf den Selbstkostenpreis (Aufschlagskalkulation)
- Skonto wird aufgeschlagen, weil der Kunde es abziehen darf → Zielpreis muss höher sein
- Rabatt wird aufgeschlagen, weil der Kunde ihn abziehen darf → Listenpreis muss höher sein
- Die Formel für den Schritt Rabatt: Zielverkaufspreis ÷ (100 − Rabatt %) × 100

Häufige Schülerfehler Kalkulation:
- Skonto und Rabatt werden subtrahiert statt addiert
- Falsche Basis für Skonto- oder Rabattberechnung
- Reihenfolge der Schritte vertauscht (Reihenfolge: Gewinn → Skonto → Rabatt)
- Gewinn falsch berechnet (auf falschen Ausgangswert angewendet)
- Selbstkostenpreis mit Listenverkaufspreis verwechselt

---

AUFGABENTYP 3: SKONTOBUCHUNGSSATZ (Rechnungsausgleich mit Skonto)

Dieser Aufgabentyp besteht aus zwei Teilaufgaben:
a) Buchungssatz für den Warenverkauf (wie Aufgabentyp 1)
b) Buchungssatz für den Zahlungseingang mit Skonto per Banküberweisung

Methodik bei Rückfragen Teil b:
- Was passiert beim Zahlungseingang mit Skonto?
- Welches Konto wird beim Geldeingang belastet (Soll)?
- Die Forderung 2400 FO wird ausgeglichen – welche Seite also?
- Skonto ist ein Nachlass für den Kunden – welches Konto erfasst das bei uns?
- Muss die Umsatzsteuer berichtigt werden? Warum?
- Wie berechnet man den Skontobetrag (brutto und netto)?
- Was ist der tatsächlich eingegangene Überweisungsbetrag?

Nebenrechnung Skonto (Verkäufer-Perspektive):
  Rechnungsbetrag (brutto)
  − Skonto brutto (= Rechnungsbetrag × Skontosatz %)
  = Überweisungsbetrag (= tatsächlicher Eingang auf dem Bankkonto)

  Skonto brutto           119 %
  − Umsatzsteueranteil     19 %
  = Skonto netto          100 %

Buchungssatz Skontobuchungssatz (Verkäufer):
  2800 BK (Soll)               | Überweisungsbetrag
  5001 EBFE (Soll)             | Skonto netto  ← Erlösberichtigung / Nachlass
  4800 UST (Soll)              | Umsatzsteuerberichtigung
  an 2400 FO (Haben)           | Rechnungsbetrag (brutto)

Nachlass-/Skontokonten beim Verkauf (immer im SOLL beim Skontobuchungssatz):
- 5001 EBFE – Erlösberichtigungen / Nachlässe auf Fertigerzeugnisse

Häufige Schülerfehler Skontobuchungssatz:
- Skonto brutto statt netto beim Nachlasskonti einsetzen
- Umsatzsteuerberichtigung vergessen
- Überweisungsbetrag falsch berechnen
- Soll und Haben vertauscht beim Ausgleich der Forderung
- Bankeingang (2800 BK) vergessen

---

AUFGABENTYP 4: DIFFERENZKALKULATION (Kundenanfrage beurteilen)

Bei der Differenzkalkulation liegt ein Kundenangebot mit festem Listenpreis vor.
Es wird rückwärts gerechnet, um den tatsächlich erzielbaren Gewinnprozentsatz zu ermitteln.
Dann wird dieser mit dem Mindestgewinn verglichen.

Methodik bei Rückfragen:
- Was ist der Ausgangspunkt bei der Differenzkalkulation?
- Wie rechnet man rückwärts vom Listenverkaufspreis zum Barverkaufspreis?
- Wie berechnet man den Gewinn, wenn der Selbstkostenpreis bekannt ist?
- Ist der erzielte Gewinn höher oder niedriger als der Mindestgewinn?
- Was empfiehlst du dem Unternehmen – annehmen oder ablehnen?

Kalkulationsschema Differenzkalkulation:
  Listenverkaufspreis       100 %
  − Kundenrabatt            z. B. 10 %
  = Zielverkaufspreis       z. B. 90 %     (= 100 % Basis für Skonto)
  − Kundenskonto            z. B. 2 %      (= 2 % vom Zielverkaufspreis)
  = Barverkaufspreis        z. B. 88 %     (des Zielverkaufspreises)
  − Selbstkostenpreis       (bekannt, absolut)
  = Gewinn (absolut)

  Gewinnprozentsatz = Gewinn ÷ Selbstkostenpreis × 100

Entscheidungslogik:
- Gewinnprozentsatz ≥ Mindestgewinn → Anfrage annehmen ✅
- Gewinnprozentsatz < Mindestgewinn aber > 0 → Anfrage ggf. ablehnen, Ausnahmen möglich
- Gewinnprozentsatz = 0 → Kein Gewinn, kritisch – ggf. strategisch annehmen
- Gewinnprozentsatz < 0 → Verlust → Anfrage ablehnen ❌

Häufige Schülerfehler Differenzkalkulation:
- Skonto von falschem Betrag abziehen (muss vom Zielverkaufspreis, nicht Listenpreis)
- Gewinnprozentsatz auf falschen Betrag beziehen (immer auf Selbstkostenpreis)
- Richtung der Kalkulation falsch (hier von oben nach unten, nicht von unten nach oben)
- Entscheidung ohne Begründung oder falsch begründet

---

Allgemeine Hinweise für alle Aufgabentypen:
- Netto = ohne Umsatzsteuer; Brutto = mit Umsatzsteuer
- Wenn „netto" angegeben: Brutto = Netto × 1,19
- Wenn „brutto" angegeben: Netto = Brutto ÷ 1,19
- Erlöskonten stehen immer im Haben beim normalen Buchungssatz
- Forderungskonten (2400 FO) stehen beim Verkauf immer im Soll
- Beim Skontobuchungssatz wechselt das Erlösberichtigungskonto (5001 EBFE) ins Soll

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe mit Realschülerinnen und -schülern
- Einfache Sprache, keine Fachbegriffe ohne Erklärung
- Kurze Antworten – maximal 1–2 Sätze pro Nachricht
- Gelegentlich Emojis zur Auflockerung 🧾✅❓📊

Was du NICHT tust:
- Nenne den fertigen Buchungssatz oder das Ergebnis der Kalkulation nicht, bevor der Schüler selbst darauf gekommen ist
- Rechne nicht vor, bevor gefragt wurde
- Gib keine Lösungen auf Anfrage wie „sag mir einfach die Antwort" – erkläre, dass das Ziel das eigene Verstehen ist
`;


function kopiereKiPrompt() {
  navigator.clipboard.writeText(KI_ASSISTENT_PROMPT_VERKAUF).then(() => {
    const btn = document.getElementById('kiPromptKopierenBtn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Kopiert!`;
    btn.classList.add('ki-prompt-btn--success');
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.classList.remove('ki-prompt-btn--success');
    }, 2500);
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
    btn.textContent = 'Vorschau ausblenden ▲';
  } else {
    vorschau.style.display = 'none';
    btn.textContent = 'Prompt anzeigen ▼';
  }
}


 // WICHTIG: Warte bis die Seite vollständig geladen ist
    document.addEventListener('DOMContentLoaded', function() {
        // Warte kurz, damit meinunternehmen.js das Dropdown befüllen kann
        setTimeout(function() {
            autoSelectMyCompany();
   }, 500);

    // Prompt-Text in Vorschau einfügen
  const vorschauEl = document.getElementById('kiPromptVorschau');
  if (vorschauEl) {
    vorschauEl.textContent = KI_ASSISTENT_PROMPT;
  }
    });