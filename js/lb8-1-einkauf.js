// Globale Variable – wird von einkauf.js benötigt
let yamlData = [];
let kunde = '<i>[Modellunternehmen]</i>';

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

  const kaeuferSelect = document.getElementById('einkaufKaeufer');

  // Initialwert setzen
  if (kaeuferSelect && kaeuferSelect.value) {
    kunde = kaeuferSelect.value.trim();
  }

  // Bei jeder Änderung aktualisieren
  kaeuferSelect.addEventListener('change', () => {
    kunde = kaeuferSelect.value.trim() || '';
    leereBezeichnungsfelder();
    if (kaeuferSelect.value.trim()) fillBezeichnungsfelderEinkauf(kaeuferSelect.value.trim());
  });

  if (!loadYamlFromLocalStorage()) {
    loadDefaultYaml();
  }
});


// ============================================================================
// WERKSTOFF-BEZEICHNUNGEN AUS YAML LADEN UND FELDER BEFÜLLEN
// ============================================================================

function fillBezeichnungsfelderEinkauf(unternehmensName) {
  if (!unternehmensName || !yamlData?.length) return;
  const eintrag = yamlData.find(e => e.unternehmen?.name === unternehmensName);
  const werkstoffe = eintrag?.unternehmen?.werkstoffe;
  if (!werkstoffe) return;

  ["AWR", "AWF", "AWH", "AWB"].forEach(konto => {
    const liste = werkstoffe[konto];
    if (!Array.isArray(liste)) return;
    [0, 1, 2].forEach(i => {
      const el = document.getElementById(`bezeichnung${konto}_${i}`);
      if (el) el.value = liste[i] ?? "";
    });
  });
}

function leereBezeichnungsfelder() {
  ["AWR", "AWF", "AWH", "AWB"].forEach(konto => {
    [0, 1, 2].forEach(i => {
      const el = document.getElementById(`bezeichnung${konto}_${i}`);
      if (el) el.value = "";
    });
  });
}

function getBezeichnungFuerKonto(kontoKuerzel) {
  // z. B. kontoKuerzel = "AWR" → liefert zufälligen nicht-leeren Wert oder null
  const kandidaten = [0, 1, 2]
    .map(i => document.getElementById(`bezeichnung${kontoKuerzel}_${i}`)?.value?.trim() || "")
    .filter(v => v.length > 0);
  if (kandidaten.length > 0) return kandidaten[Math.floor(Math.random() * kandidaten.length)];
  return null;
}

function getWerkstoffAnzeigeName(werkstoffTyp) {
  // werkstoffTyp = "Rohstoffe" | "Fremdbauteile" | "Hilfsstoffe" | "Betriebsstoffe"
  const kuerzelMap = {
    "Rohstoffe": "AWR",
    "Fremdbauteile": "AWF",
    "Hilfsstoffe": "AWH",
    "Betriebsstoffe": "AWB",
    // auch _2-Varianten abfangen
    "von Rohstoffen": "AWR",
    "von Fremdbauteilen": "AWF",
    "von Hilfsstoffen": "AWH",
    "von Betriebsstoffen": "AWB",
  };
  const kuerzel = kuerzelMap[werkstoffTyp];
  if (!kuerzel) return werkstoffTyp;
  const benutzerdefiniert = getBezeichnungFuerKonto(kuerzel);
  return benutzerdefiniert || werkstoffTyp;
}


const anzahlDropdown = document.getElementById('anzahlDropdown');
const mitRabatt = document.getElementById('mitRabatt');
const mitBezugskosten = document.getElementById('mitBezugskosten');
const mitRuecksendung = document.getElementById('mitRuecksendung');
const mitEinkaufskalkulation = document.getElementById('mitEinkaufskalkulation');
const Skontobuchungssatz = document.getElementById('mitSkontobuchungssatz');

document.addEventListener('DOMContentLoaded', function () {
  const mitBezugskosten = document.getElementById('mitBezugskosten');
  const mitRuecksendung = document.getElementById('mitRuecksendung');
  const buchungsoptionDropdown = document.getElementById('buchungsoptionDropdown');

  function updateMitBezugskostenState() {

    if (buchungsoptionDropdown.value === 'einkaufskalkulation') {
      mitRuecksendung.disabled = true;
      mitRuecksendung.checked = false;
      mitBezugskosten.disabled = false;
    };

    if (buchungsoptionDropdown.value === 'skontobuchungssatz') {
      mitBezugskosten.disabled = true;
      mitBezugskosten.checked = false;
      mitRuecksendung.disabled = true;
      mitRuecksendung.checked = false;
    };

    if (buchungsoptionDropdown.value === 'buchungssatz') {
      mitBezugskosten.disabled = false;
      mitRuecksendung.disabled = false;
    };
  }

  buchungsoptionDropdown.addEventListener('change', updateMitBezugskostenState);

  // Initialisiere den Zustand der "mitBezugskosten"-Checkbox beim Laden der Seite
  updateMitBezugskostenState();
  if (yamlData && yamlData.length > 0) {
    fillCompanyDropdowns();
  } else {
    // Falls yamlData noch nicht geladen → auf Event warten oder fetch auslösen
    document.addEventListener('yamlDataLoaded', () => {
      fillCompanyDropdowns();
      autoSelectMyCompany();
      // ← NEU: Felder für vorausgewähltes Unternehmen befüllen
      const sel = document.getElementById('einkaufKaeufer');
      if (sel?.value) fillBezeichnungsfelderEinkauf(sel.value.trim());
    }, { once: true });
  }
});



// Auf 2 Dezimalstellen runden
function roundToTwoDecimals(num) {
  return Math.round(num * 100) / 100;
}


// Funktion für zufällige Zahlen Rabatt und Bezugskosten
function getRandomIntegerWithSteps(min, max, step) {
  const range = (max - min) / step;
  return Math.floor(Math.random() * range) * step + min;
}

function getrandom_Rabatt() {
  return getRandomIntegerWithSteps(5, 25, 5);
}

function getRandomBezugskosten() {
  return getRandomIntegerWithSteps(10, 50, 5);
}

function getRandomRuecksendung() {
  return getRandomIntegerWithSteps(10, 75, 5);
}

// Funktion zur Generierung einer Zufallsganzzahl für den Nettowert
function generateRandomNettoWert() {
  return Math.round(Math.random() * 49 + 2) * 100;

}

// Währung nach DIN 5008
function formatCurrency(value) {
  return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

// Auf 2 Dezimalstellen runden
function roundToTwoDecimals(num) {
  return Math.round(num * 100) / 100;
}

// Kontenplan
const kontenWerkstoffe = {
  "Rohstoffe": {
    "Hauptkonto": "6000 AWR",
    "Unterkonto": "6001 BZKR",
    "Nachlasskonto": "6002 NR"
  },
  "Fremdbauteile": {
    "Hauptkonto": "6010 AWF",
    "Unterkonto": "6011 BZKF",
    "Nachlasskonto": "6012 NF"
  },
  "Hilfsstoffe": {
    "Hauptkonto": "6020 AWH",
    "Unterkonto": "6021 BZKH",
    "Nachlasskonto": "6022 NH"
  },
  "Betriebsstoffe": {
    "Hauptkonto": "6030 AWB",
    "Unterkonto": "6031 BZKB",
    "Nachlasskonto": "6032 NB"
  },
};

const kontenWerkstoffe_2 = {
  "von Rohstoffen": {
    "Hauptkonto": "6000 AWR",
    "Unterkonto": "6001 BZKR",
    "Nachlasskonto": "6002 NR"
  },
  "von Fremdbauteilen": {
    "Hauptkonto": "6010 AWF",
    "Unterkonto": "6011 BZKF",
    "Nachlasskonto": "6012 NF"
  },
  "von Hilfsstoffen": {
    "Hauptkonto": "6020 AWH",
    "Unterkonto": "6021 BZKH",
    "Nachlasskonto": "6022 NH"
  },
  "von Betriebsstoffen": {
    "Hauptkonto": "6030 AWB",
    "Unterkonto": "6031 BZKB",
    "Nachlasskonto": "6032 NB"
  },
};

let kontenZahlung;
function inputChangeCategory() {
  if (buchungsoptionDropdown.value === 'einkaufskalkulation' || buchungsoptionDropdown.value === 'skontobuchungssatz') {
    kontenZahlung = {
      ", wobei eine Eingangsrechnung eingeht": "4400 VE",
      ". Die Werkstoffe werden geliefert und der Lieferer sendet eine Eingangsrechnung": "4400 VE",
      ", wobei die Rechnung des Lieferers eingeht": "4400 VE",
    }
  } else {
    kontenZahlung = {
      "per Barzahlung": "2880 KA",
      "per Banküberweisung": "2800 BK",
      "gegen Rechnung": "4400 VE",
      "auf Rechnung": "4400 VE",
      "auf Ziel": "4400 VE",
      "per Eingangsrechnung": "4400 VE",
      "per Rechnung": "4400 VE",
    }
  }
}


function erstelleZufallssatz() {
  inputChangeCategory();
  let random_Rabatt = getrandom_Rabatt();
  let random_Bezugskosten = getRandomBezugskosten();
  let randomSk = Math.random();
  let random_Skonto = (randomSk < 0.5) ? 2 : 3;
  random_Bezugskosten = formatCurrency(random_Bezugskosten);
  // Arrays mit verschiedenen Teilen des Satzes
  const array_Subjekt = [`${kunde} kauft`, `${kunde} bezieht `, `${kunde} kauft `, `${kunde} erwirbt `, `Ein Lieferant sendet an ${kunde} `];
  const array_Subjekt_2 = [`${kunde} kauft`, `${kunde} bezieht `, `${kunde} kauft `, `${kunde} erwirbt `, `Ein Lieferant sendet an ${kunde} `];
  const array_Subjekt_3 = [`Berechne den Einstandspreis: ${kunde} erhält ein Angebot für `, `Berechne den Einstandspreis, wenn ${kunde} ein Angebot erhält für `];
  const array_Subjekt_4 = ['Berechne den Einstandspreis: Unser Lieferant sendet ein Angebot für den Bezug', 'Berechne den Einstandspreis eines Angebots für den Kauf '];
  const array_Subjekt_5 = [`${kunde} bezahlt die Rechnung per Banküberweisung innerhalb der Skontofrist mit ${random_Skonto} % Skonto`, `Die Rechnung wird mit ${random_Skonto} % Skonto per Banküberweisung ausgeglichen`, `Der Rechnungsausgleich erfolgt mit ${random_Skonto} % Skonto per Bank`,];
  const array_Werkstoffe = Object.keys(kontenWerkstoffe);
  const array_Werkstoffe_2 = Object.keys(kontenWerkstoffe_2);
  const array_Supply_Wert = ['im Wert von', 'mit', 'in Höhe von', 'mit einem Warenwert von ', ' '];
  const array_Zahlung = Object.keys(kontenZahlung);
  const array_Supply_Rabatt = [`, abzüglich ${random_Rabatt} % Rabatt`];
  const array_Supply_Rabatt_2 = [
    `. Ausgehandelt wurden zusätzlich ${random_Rabatt} % Treuerabatt`,
    `. ${random_Rabatt} % Sonderrabatt werden gewährt`,
    `. ${random_Rabatt} % Rabatt können abgezogen werden`,
    `. Der Lieferer gewährt ${random_Rabatt} % Kundenrabatt`,
    `. ${kunde} hat zudem ${random_Rabatt} % Rabatt ausgehandelt`,
  ];
  const array_Supply_Skonto = [
    `. ${random_Skonto} % Skonto können abgezogen werden`,
    `. ${kunde} kann außerdem ${random_Skonto} % Skonto abziehen`,
    `. Der Skonto beträgt ${random_Skonto} %`,
  ];
  const array_Supply_Bezugskosten = [
    `. Versandkosten mit netto ${random_Bezugskosten} fallen darüberhinaus an`,
    `. ${kunde} zahlt zudem zusätzlich Verpackungskosten in Höhe von ${random_Bezugskosten} netto`,
    `. Transportversicherung und Rollgeld betragen darüber hinaus netto ${random_Bezugskosten}`,
    `. Die Leihverpackung in Höhe von ${random_Bezugskosten} netto wird zusätzlich berechnet`,
    `. Netto ${random_Bezugskosten} an Transportkosten werden zusätzlich berechnet`,
    `. Versandkosten in Höhe von netto ${random_Bezugskosten} fallen darüber hinaus an`,
    `. Es fallen des Weiteren Frachtgebühren in Höhe von netto ${random_Bezugskosten} an`,
    `. Es werden noch netto ${random_Bezugskosten} an Versandkosten berechnet`,
  ];


  // Zufällige Auswahl der Elemente und der alternativen Arrays
  const selectedarray_Subjekt = Math.random() < 0.5 ? array_Subjekt : array_Subjekt_2;
  const selectedarray_Werkstoffe = selectedarray_Subjekt === array_Subjekt_2 ? array_Werkstoffe_2 : array_Werkstoffe;
  const selectedarray_Angebot = selectedarray_Werkstoffe === array_Werkstoffe ? array_Subjekt_3 : array_Subjekt_4;
  // Zufällige Auswahl der Elemente aus den ausgewählten Arrays
  const randomSubjekt = selectedarray_Subjekt[Math.floor(Math.random() * selectedarray_Subjekt.length)];
  const randomAngebot = selectedarray_Angebot[Math.floor(Math.random() * selectedarray_Angebot.length)];
  const randomWerkstoff = selectedarray_Werkstoffe[Math.floor(Math.random() * selectedarray_Werkstoffe.length)];
  const werkstoffAnzeigeName = getWerkstoffAnzeigeName(randomWerkstoff);
  const randomSupply_Wert = array_Supply_Wert[Math.floor(Math.random() * array_Supply_Wert.length)];
  const antwortWerkstoff = kontenWerkstoffe[randomWerkstoff]?.Hauptkonto || kontenWerkstoffe_2[randomWerkstoff]?.Hauptkonto;
  const antwortBezugskosten = kontenWerkstoffe[randomWerkstoff]?.Unterkonto || kontenWerkstoffe_2[randomWerkstoff]?.Unterkonto;
  const antwortSkontobuchungssatz = kontenWerkstoffe[randomWerkstoff]?.Nachlasskonto || kontenWerkstoffe_2[randomWerkstoff]?.Nachlasskonto;
  const randomSkontobuchungssatz = array_Subjekt_5[Math.floor(Math.random() * array_Subjekt_5.length)];
  const nettoOderBrutto = Math.random() < 0.5 ? 'Netto' : 'Brutto';
  const Wert = generateRandomNettoWert();
  const nettoWert = formatCurrency(Wert);
  let bruttoWert = formatCurrency(Math.round(Wert * 0.19 + Wert));
  let randomNettowert;

  // Anzeige wenn Brutto oder Netto
  randomNettowert = nettoOderBrutto === 'Netto' ? `${nettoWert} netto` : `brutto ${bruttoWert}`;
  randomNettowertbeiAngebot = `Listenpreis ${nettoWert} netto`;


  const randomZahlung = array_Zahlung[Math.floor(Math.random() * array_Zahlung.length)];
  const antwortZahlung = kontenZahlung[randomZahlung]


  let randomSupply_Rabatt;
  let randomSupply_Rabatt_2;
  let berechnung_nettoWert;

  // Berechnung mit Rabatt
  if (mitRabatt.checked) {
    randomSupply_Rabatt = array_Supply_Rabatt[Math.floor(Math.random() * array_Supply_Rabatt.length)];
    randomSupply_Rabatt_2 = array_Supply_Rabatt_2[Math.floor(Math.random() * array_Supply_Rabatt_2.length)];
    berechnung_nettoWert = Wert * (100 - parseFloat(random_Rabatt)) / 100;
    berechnung_nettoWert = roundToTwoDecimals(berechnung_nettoWert);
  } else {
    random_Rabatt = 0;
    randomSupply_Rabatt = "";
    randomSupply_Rabatt_2 = "";
    berechnung_nettoWert = Wert;
    berechnung_nettoWert = roundToTwoDecimals(berechnung_nettoWert);
  }
  let randomSupply_Skonto = array_Supply_Skonto[Math.floor(Math.random() * array_Supply_Skonto.length)];
  let antwortNettowert = formatCurrency(berechnung_nettoWert);
  let berechnung_skontoBetrag = random_Skonto / 100 * berechnung_nettoWert;
  berechnung_skontoBetrag = roundToTwoDecimals(berechnung_skontoBetrag);
  let berechnung_skontoBetrag_brutto = (berechnung_skontoBetrag) + (berechnung_skontoBetrag * 0.19);
  berechnung_skontoBetrag_brutto = roundToTwoDecimals(berechnung_skontoBetrag_brutto);
  let berechnung_vorsteuer_berichtigung = berechnung_skontoBetrag_brutto - berechnung_skontoBetrag;
  let vorsteuer_berichtigung = formatCurrency(berechnung_vorsteuer_berichtigung);
  let skontoBetrag_brutto = formatCurrency(berechnung_skontoBetrag_brutto);

  let skontoBetrag = formatCurrency(berechnung_skontoBetrag);
  let berechnung_bareinkaufspreis = berechnung_nettoWert - berechnung_skontoBetrag;
  let bareinkaufspreis = formatCurrency(berechnung_bareinkaufspreis);
  let berechnung_USTWert = berechnung_nettoWert * 0.19;
  berechnung_USTWert = roundToTwoDecimals(berechnung_USTWert);
  let berechnung_bruttoWert = berechnung_nettoWert + (berechnung_USTWert);
  let randomSupply_Bezugskosten;

  // Berechnung mit Bezugskosten
  if (mitBezugskosten.checked) {
    randomSupply_Bezugskosten = array_Supply_Bezugskosten[Math.floor(Math.random() * array_Supply_Bezugskosten.length)];
    berechnung_USTWert = (berechnung_nettoWert + parseFloat(random_Bezugskosten)) * 0.19;
    berechnung_USTWert = roundToTwoDecimals(berechnung_USTWert);
    berechnung_bruttoWert = berechnung_nettoWert + (berechnung_USTWert) + parseFloat(random_Bezugskosten);
    bruttoWert = roundToTwoDecimals(Math.round(Wert * 0.19 + Wert) + parseFloat(random_Bezugskosten) * 0.19 + parseFloat(random_Bezugskosten));
    bruttoWert = formatCurrency(bruttoWert);
  } else {
    random_Bezugskosten = 0;
    randomSupply_Bezugskosten = "";
    berechnung_USTWert = berechnung_USTWert;
  }
  let bezugskostenWert = formatCurrency(random_Bezugskosten);
  let berechnung_rabattWert = parseFloat(nettoWert.replace(/[^\d,-]/g, '')) * random_Rabatt / 100;
  let rabattWert = formatCurrency(berechnung_rabattWert);
  let berechnung_einstandspreis = berechnung_bareinkaufspreis + parseFloat(random_Bezugskosten);
  let einstandspreis = formatCurrency(berechnung_einstandspreis);
  let USTWert = formatCurrency(berechnung_USTWert);
  let ueberweisungsbetrag_berechnung = berechnung_bruttoWert - berechnung_skontoBetrag_brutto;
  let ueberweisungsbetrag = formatCurrency(ueberweisungsbetrag_berechnung);
  let antwortBruttowert = formatCurrency(berechnung_bruttoWert);

  let randomRuecksendungProzent = getRandomRuecksendung();

  // Zusammenfügen der ausgewählten Elemente zu einem Satz
  const randomAngebotSatz = Math.random();

  let angebotSatz;
  angebotSatz = `<ol style="list-style-type: lower-latin;">`;
  if (randomAngebotSatz < 0.33) {
    angebotSatz += `<li>${randomAngebot} ${werkstoffAnzeigeName} ${randomSupply_Wert} ${randomNettowertbeiAngebot} ${randomSupply_Rabatt} ${randomSupply_Skonto} ${randomSupply_Bezugskosten}.</li><li>Bilde den Buchungssatz: ${kunde} akzeptiert das Angebot ${randomZahlung}.</li>`;
  } else if (randomAngebotSatz < 0.66) {
    angebotSatz += `<li>${randomAngebot} ${werkstoffAnzeigeName} ${randomSupply_Wert} ${randomNettowertbeiAngebot} ${randomSupply_Rabatt_2} ${randomSupply_Skonto} ${randomSupply_Bezugskosten}.</li><li>Bilde den Buchungssatz: ${kunde} gibt die Bestellung in Auftrag ${randomZahlung}.</li>`;
  } else {
    angebotSatz += `<li>${randomAngebot} ${werkstoffAnzeigeName} ${randomSupply_Wert} ${randomNettowertbeiAngebot} ${randomSupply_Rabatt_2} ${randomSupply_Skonto} ${randomSupply_Bezugskosten}.</li><li>${kunde} nimmt das Angebot an ${randomZahlung}. Bilde den Buchungssatz!</li>`;
  }
  angebotSatz += `</ol>`;


  let zufaelligerSatz;
  const randomValue = Math.random();
  if (randomValue < 0.33) {
    zufaelligerSatz = `${randomSubjekt} ${werkstoffAnzeigeName} ${randomZahlung} ${randomSupply_Wert} ${randomNettowert} ${randomSupply_Rabatt} ${randomSupply_Bezugskosten}.`;
  } else if (randomValue < 0.66) {
    zufaelligerSatz = `${randomSubjekt} ${werkstoffAnzeigeName} ${randomSupply_Wert} ${randomNettowert} ${randomZahlung} ${randomSupply_Rabatt_2} ${randomSupply_Bezugskosten}.`;
  } else {
    zufaelligerSatz = `${randomSubjekt} ${werkstoffAnzeigeName} ${randomZahlung} ${randomSupply_Wert} ${randomNettowert} ${randomSupply_Rabatt_2} ${randomSupply_Bezugskosten}.`;
  }

  let ruecksendungSatz;
  const randomRuecksendung = Math.random();
  let USTWertRuecksendung;
  let zieleinkaufspreis_Ruecksendung = berechnung_nettoWert;
  let berechnung_bruttoWertRuecksendung = berechnung_bruttoWert;
  if (randomRuecksendung < 0.33) {
    ruecksendungSatz = `Aufgrund einer Falschlieferung sendet ${kunde} alle Werkstoffe`;
    randomRuecksendungProzent = 100;
    zieleinkaufspreis_Ruecksendung = roundToTwoDecimals(zieleinkaufspreis_Ruecksendung * randomRuecksendungProzent / 100);
    USTWertRuecksendung = roundToTwoDecimals(zieleinkaufspreis_Ruecksendung * 19 / 100);
    berechnung_bruttoWertRuecksendung = USTWertRuecksendung + zieleinkaufspreis_Ruecksendung;
    USTWertRuecksendung = formatCurrency(USTWertRuecksendung);
    zieleinkaufspreis_Ruecksendung = formatCurrency(zieleinkaufspreis_Ruecksendung);
    berechnung_bruttoWertRuecksendung = formatCurrency(berechnung_bruttoWertRuecksendung);
  } else if (randomRuecksendung < 0.66) {
    ruecksendungSatz = `Aufgrund eines Sachmangels sendet ${kunde} ${randomRuecksendungProzent} % der Werkstoffe `;
    zieleinkaufspreis_Ruecksendung = roundToTwoDecimals(zieleinkaufspreis_Ruecksendung * randomRuecksendungProzent / 100);
    USTWertRuecksendung = roundToTwoDecimals(zieleinkaufspreis_Ruecksendung * 19 / 100);
    berechnung_bruttoWertRuecksendung = USTWertRuecksendung + zieleinkaufspreis_Ruecksendung;
    USTWertRuecksendung = formatCurrency(USTWertRuecksendung);
    zieleinkaufspreis_Ruecksendung = formatCurrency(zieleinkaufspreis_Ruecksendung);
    berechnung_bruttoWertRuecksendung = formatCurrency(berechnung_bruttoWertRuecksendung);
  } else {
    ruecksendungSatz = `${kunde} sendet ${randomRuecksendungProzent} % der Werkstoffe `;
    zieleinkaufspreis_Ruecksendung = roundToTwoDecimals(zieleinkaufspreis_Ruecksendung * randomRuecksendungProzent / 100);
    USTWertRuecksendung = roundToTwoDecimals(zieleinkaufspreis_Ruecksendung * 19 / 100);
    berechnung_bruttoWertRuecksendung = USTWertRuecksendung + zieleinkaufspreis_Ruecksendung;
    USTWertRuecksendung = formatCurrency(USTWertRuecksendung);
    zieleinkaufspreis_Ruecksendung = formatCurrency(zieleinkaufspreis_Ruecksendung);
    berechnung_bruttoWertRuecksendung = formatCurrency(berechnung_bruttoWertRuecksendung);
  }


  const randomSkontoSatz = Math.random();
  skontoSatz = `<ol style="list-style-type: lower-latin;">`;
  if (randomSkontoSatz < 0.33) {
    skontoSatz += `<li>Bilde den Buchungssatz zum Geschäftsfall.</li><li>Bilde den Buchungssatz: ${randomSkontobuchungssatz}.</li>`;
  } else if (randomSkontoSatz < 0.66) {
    skontoSatz += `<li>Bilde den Buchungssatz zum Geschäftsfall.</li><li>${randomSkontobuchungssatz}. Bilde den Buchungssatz.</li>`;
  } else {
    skontoSatz += `<li>Bilde den Buchungssatz zum Geschäftsfall.</li><li>Bilde den Buchungssatz: ${randomSkontobuchungssatz}.</li>`;
  }
  skontoSatz += `</ol>`;


  const listeneinkaufspreis = `${nettoWert}`;
  const antwort_rabattWert = `${rabattWert}`;
  const antwort_rabattSatz = `${random_Rabatt}`;
  const antwort_skontoSatz = `${random_Skonto}`;
  const antwort_skontoBetrag = `${skontoBetrag}`;
  const antwort_skontoBetrag_brutto = `${skontoBetrag_brutto}`;
  const antwort_vorsteuer_berichtigung = `${vorsteuer_berichtigung}`;
  const antwort_ueberweisungsbetrag = `${ueberweisungsbetrag}`;
  const antwort_bareinkaufspreis = `${bareinkaufspreis}`;
  const antwort_einstandspreis = `${einstandspreis}`;
  const konto_1 = `${antwortWerkstoff}`;
  const zieleinkaufspreis = `${antwortNettowert}`;
  const konto_2 = `${antwortZahlung}`;
  const antwort_bezugskosten = `${antwortBezugskosten}`;
  const konto_Skontobuchungssatz = `${antwortSkontobuchungssatz}`;
  const antwort_bezugskostenWert = `${bezugskostenWert}`;
  const betrag_2 = `${antwortBruttowert}`;

  return [zufaelligerSatz, angebotSatz, ruecksendungSatz, skontoSatz, listeneinkaufspreis, antwort_rabattWert, antwort_rabattSatz, antwort_skontoSatz, antwort_skontoBetrag, antwort_skontoBetrag_brutto, antwort_vorsteuer_berichtigung, antwort_ueberweisungsbetrag, antwort_bareinkaufspreis, antwort_einstandspreis, konto_1, zieleinkaufspreis, antwort_bezugskosten, antwort_bezugskostenWert, USTWert, konto_2, betrag_2, konto_Skontobuchungssatz, USTWertRuecksendung, zieleinkaufspreis_Ruecksendung, berechnung_bruttoWertRuecksendung, werkstoffAnzeigeName];

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

  const kaueferSelect = document.getElementById('einkaufKaeufer');
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
    option.dataset.id = u.id || '';
    option.dataset.rechtsform = u.rechtsform || '';
    option.dataset.branche = u.branche || '';

    // Kopie für beide Dropdowns
    if (kaueferSelect) kaueferSelect.appendChild(option.cloneNode(true));
    if (liefererSelect) liefererSelect.appendChild(option);
  });

  console.log(`Dropdowns befüllt mit ${sortedCompanies.length} Unternehmen`);
}


// ============================================================================
// NEUE HILFSFUNKTIONEN FÜR BELEG-BUTTONS
// ============================================================================

function parseNumericValue(value) {
  if (!value) return '0';
  return value.toString().replace(/[€\s]/g, '').replace(/\./g, '').replace(',', '.');
}

function extractZahlungsart(kontoCode) {
  const zahlungsarten = {
    '2880 KA': 'bar',
    '2800 BK': 'Banküberweisung',
    '4400 VE': 'Rechnung'
  };
  return zahlungsarten[kontoCode] || 'Rechnung';
}

function extractWerkstoffName(kontoCode) {
  const werkstoffe = {
    '6000 AWR': 'Rohstoffe',
    '6010 AWF': 'Fremdbauteile',
    '6020 AWH': 'Hilfsstoffe',
    '6030 AWB': 'Betriebsstoffe'
  };
  return werkstoffe[kontoCode] || 'Werkstoffe';
}

function getBelegtypAusKonto(konto_2) {
  if (konto_2 === "2880 KA") return "quittung";
  if (konto_2 === "2800 BK") return "kontoauszug";
  return "rechnung"; // 4400 VE → Eingangsrechnung
}

function erzeugeURLFuerGeschaeftsfall(geschaeftsfallDaten, typ = 'rechnung', isGutschrift = false) {
  const params = new URLSearchParams();

  // Belegtyp aus konto_2 ableiten
  const belegtyp = isGutschrift ? 'gutschrift' : (typ !== 'rechnung' && typ !== 'angebot' ? typ : getBelegtypAusKonto(geschaeftsfallDaten.konto_2 || ''));
  params.set('beleg', belegtyp);

  if (typ === 'angebot') params.set('vorlage', 'angebot1.svg');
  if (isGutschrift || typ === 'gutschrift') params.set('vorlage', 'gutschrift2.svg');

  const kaeuferSelect = document.getElementById('einkaufKaeufer');
  const liefererSelect = document.getElementById('einkaufLieferer');
  const now = new Date();
  const tag   = now.getDate().toString().padStart(2, '0');
  const monat = (now.getMonth() + 1).toString().padStart(2, '0');

  if (belegtyp === 'kontoauszug') {
    if (kaeuferSelect?.value) params.set('kontoinhaber', kaeuferSelect.value.trim());
    params.set('vorgang1', geschaeftsfallDaten.werkstoff || 'Werkstoffe');
    if (geschaeftsfallDaten.bruttoBetrag) {
      params.set('wertstellung1', `-${parseNumericValue(geschaeftsfallDaten.bruttoBetrag)}`);
    }
    params.set('tag', tag);
    params.set('monat', monat);

  } else if (belegtyp === 'quittung') {
    if (kaeuferSelect?.value) params.set('kunde', kaeuferSelect.value.trim());
    params.set('zweck', geschaeftsfallDaten.werkstoff || 'Werkstoffe');
    if (geschaeftsfallDaten.listeneinkaufspreis) {
      params.set('netto', parseNumericValue(geschaeftsfallDaten.listeneinkaufspreis));
    }
    params.set('ust', '19');
    params.set('tag', tag);
    params.set('monat', monat);

  } else {
    // rechnung, angebot, gutschrift
    if (geschaeftsfallDaten.listeneinkaufspreis)
      params.set('einzelpreis1', parseNumericValue(geschaeftsfallDaten.listeneinkaufspreis));
    if (geschaeftsfallDaten.rabattSatz) params.set('rabatt', geschaeftsfallDaten.rabattSatz);
    if (geschaeftsfallDaten.bezugskostenWert)
      params.set('bezugskosten', parseNumericValue(geschaeftsfallDaten.bezugskostenWert));
    if (geschaeftsfallDaten.skontoSatz) params.set('skonto', geschaeftsfallDaten.skontoSatz);
    if (geschaeftsfallDaten.werkstoff) params.set('artikel1', geschaeftsfallDaten.werkstoff);
    if (kaeuferSelect?.value) params.set('kunde', kaeuferSelect.value.trim());
    if (liefererSelect?.value) params.set('lieferer', liefererSelect.value.trim());
    params.set('menge1', '1');
    params.set('einheit1', 'PAL');
    params.set('umsatzsteuer', '19');
    params.set('tag', tag);
    params.set('monat', monat);
  }

  return `belege.html?${params.toString()}`;
}

function erstelleGeschaeftsfallButton(nummer, daten, isGutschrift = false) {
  const url = erzeugeURLFuerGeschaeftsfall(daten, isGutschrift ? 'gutschrift' : 'rechnung', isGutschrift);

  const belegtyp = isGutschrift ? 'gutschrift' : getBelegtypAusKonto(daten.konto_2 || '');
  const namen = {
    rechnung:    '📄 Eingangsrechnung',
    kontoauszug: '🏦 Kontoauszug',
    quittung:    '🧾 Quittung',
    gutschrift:  '📄 Gutschrift (Rücksendung)',
  };
  const name = namen[belegtyp] || '📄 Beleg';

  return `<button class="geschaeftsfall-beleg-button"
    onclick="window.open('${url}', '_blank')"
    style="width:100%;padding:10px 12px;font-size:14px;">
    ${name} ${nummer} erstellen
  </button>`;
}

function erstelleAngebotButton(nummer, daten) {
  const url = erzeugeURLFuerGeschaeftsfall(daten, 'angebot');
  return `
        <button
            class="geschaeftsfall-beleg-button angebot-button"
            onclick="window.open('${url}', '_blank')"
            title="Angebot für Aufgabe ${nummer} als SVG öffnen"
             style="width: 100%; padding: 10px 12px; font-size: 14px;"
        >
            📄 ${nummer}a. Angebot erstellen
        </button>
    `;
}

function erstelleRechnungButton(nummer, daten) {
  const url = erzeugeURLFuerGeschaeftsfall(daten, 'rechnung');   // → KEIN vorlage-Parameter
  return `
        <button
            class="geschaeftsfall-beleg-button rechnung-button"
            onclick="window.open('${url}', '_blank')"
            title="Eingangsrechnung für Aufgabe ${nummer} als SVG öffnen"
            style="width: 100%; padding: 9px 11px; font-size: 13px;"
        >
            📄 ${nummer}b. Eingangsrechnung erstellen
        </button>
    `;
}

function zeigeZufaelligenSatz() {
  // Falls eine andere Funktion vorhanden ist → abbrechen
  if (typeof zeigeZufaelligenSatzMitUnternehmen === 'function') {
    return zeigeZufaelligenSatzMitUnternehmen();
  }

  const anzahl = parseInt(anzahlDropdown.value);
  const container = document.getElementById('Container');
  const buttonColumn = document.getElementById('button-column'); // ← muss im HTML existieren!

  if (!container || !buttonColumn) {
    console.error("Container oder Button-Column nicht gefunden");
    return;
  }

  // Inhalte zurücksetzen
  container.innerHTML = '';
  buttonColumn.innerHTML = '';
  letzteGenerierteGfListeEinkauf = [];

  let satzOutput = '<h2>Aufgaben</h2><ol>';
  let antwortOutput = '<h2>Lösung</h2>';

  for (let i = 1; i <= anzahl; i++) {
    const currentI = i;
    const [
      zufaelligerSatz, angebotSatz, ruecksendungSatz, skontoSatz,
      listeneinkaufspreis, antwort_rabattWert, antwort_rabattSatz,
      antwort_skontoSatz, antwort_skontoBetrag, antwort_skontoBetrag_brutto,
      antwort_vorsteuer_berichtigung, antwort_ueberweisungsbetrag,
      antwort_bareinkaufspreis, antwort_einstandspreis, konto_1,
      zieleinkaufspreis, antwort_bezugskosten, antwort_bezugskostenWert,
      USTWert, konto_2, betrag_2, konto_Skontobuchungssatz,
      USTWertRuecksendung, zieleinkaufspreis_Ruecksendung,
      berechnung_bruttoWertRuecksendung, werkstoffAnzeigeName
    ] = erstelleZufallssatz();

    // Aufgabe und Lösung für KI-Prompt merken
const aufgabeText = (() => {
  switch (buchungsoptionDropdown.value) {
    case 'einkaufskalkulation': return angebotSatz.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    case 'skontobuchungssatz':  return (zufaelligerSatz + ' ' + skontoSatz).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    default:                    return zufaelligerSatz.replace(/\s+/g, ' ').trim();
  }
})();

const loesungText = (() => {
  const fmt = (v) => typeof v === 'string' ? v : String(v);
  switch (buchungsoptionDropdown.value) {
    case 'einkaufskalkulation':
      return [
        `Listeneinkaufspreis: ${listeneinkaufspreis} (100 %)`,
        `- Liefererrabatt: ${antwort_rabattWert} (${antwort_rabattSatz} %)`,
        `= Zieleinkaufspreis: ${zieleinkaufspreis} (${100 - parseFloat(antwort_rabattSatz)} %)`,
        `- Liefererskonto: ${antwort_skontoBetrag} (${antwort_skontoSatz} %)`,
        `= Bareinkaufspreis: ${antwort_bareinkaufspreis}`,
        `+ Bezugskosten: ${antwort_bezugskostenWert}`,
        `= Einstandspreis: ${antwort_einstandspreis}`,
        `Buchungssatz: ${konto_1} ${zieleinkaufspreis} / 2600 VORST ${USTWert} an ${konto_2} ${betrag_2}`,
      ].join('\n');
    case 'skontobuchungssatz':
      return [
        `Buchungssatz 1: ${konto_1} ${zieleinkaufspreis} / 2600 VORST ${USTWert} an ${konto_2} ${betrag_2}`,
        `Buchungssatz 2: 4400 VE ${betrag_2} an 2800 BK ${antwort_ueberweisungsbetrag} / ${konto_Skontobuchungssatz} ${antwort_skontoBetrag} / 2600 VORST ${antwort_vorsteuer_berichtigung}`,
        `Skonto brutto: ${antwort_skontoBetrag_brutto}, Skonto netto: ${antwort_skontoBetrag}, Vorsteuerberichtigung: ${antwort_vorsteuer_berichtigung}`,
        `Überweisungsbetrag: ${antwort_ueberweisungsbetrag}`,
      ].join('\n');
    default:
      return `Buchungssatz: ${konto_1} ${zieleinkaufspreis} / 2600 VORST ${USTWert} an ${konto_2} ${betrag_2}`;
  }
})();

letzteGenerierteGfListeEinkauf.push({ aufgabe: aufgabeText, loesung: loesungText });

    const formattedSatz = zufaelligerSatz.replace(/\s+/g, ' ').replace(/\s(?=[.,;:!])/g, '');
    const formattedAngebot = angebotSatz.replace(/\s+/g, ' ').replace(/\s(?=[.,;:!])/g, '');
    const formattedSkonto = skontoSatz.replace(/\s+/g, ' ').replace(/\s(?=[.,;:!])/g, '');
    const formattedRuecksendung = ruecksendungSatz.replace(/\s+/g, ' ').replace(/\s(?=[.,;:!])/g, '');

    // ── Aufgaben-Text (wird exportiert) ───────────────────────────────
    let aufgabeHtml = `<li>`;

    switch (buchungsoptionDropdown.value) {
      case 'einkaufskalkulation':
        aufgabeHtml += `<div>${formattedAngebot}</div>`;
        break;

      case 'buchungssatz':
        aufgabeHtml += `<div>${formattedSatz}</div>`;

        // ← Hier kommen die Rücksendungen – als bedingter Block innerhalb dieses Cases
        if (mitRuecksendung.checked && i > 0 && i < anzahl && konto_2 === "4400 VE") {
          aufgabeHtml += `<li>${formattedRuecksendung} aus Geschäftsfall ${currentI} zurück und erhält dafür eine Gutschrift.
        </div></li>
      `;
        }
        break;

      case 'skontobuchungssatz':
        aufgabeHtml += `<div>${formattedSatz}</div>`;
        aufgabeHtml += `<div style="margin: 8px 0 20px;">${formattedSkonto}</div>`;
        break;

      default:
        aufgabeHtml += `<div>${formattedSatz || formattedAngebot || 'Kein Text verfügbar'}</div>`;
        break;
    }

    aufgabeHtml += `</li>`;
    satzOutput += aufgabeHtml;
    // ── Button separat erzeugen (wird NICHT exportiert) ────────────────


    // Rechnungs-Button immer
const geschaeftsfallDaten = {
  listeneinkaufspreis: listeneinkaufspreis,
  rabattSatz: antwort_rabattSatz,
  bezugskostenWert: antwort_bezugskostenWert,
  skontoSatz: antwort_skontoSatz,
  werkstoff: werkstoffAnzeigeName,
  konto_2: konto_2,         
  bruttoBetrag: betrag_2,     
};

    const buttonDiv = document.createElement('div');
    buttonDiv.style.margin = '12px 0';

    if (buchungsoptionDropdown.value === 'einkaufskalkulation') {
      // Speziell für Einkaufskalkulation: Angebot + Rechnung
      buttonDiv.innerHTML = `
        ${erstelleAngebotButton(currentI, geschaeftsfallDaten)}
        <div style="margin-top:8px;"></div>
        ${erstelleRechnungButton(currentI, geschaeftsfallDaten)}
    `;
    } else {
      // Alle anderen Modi → nur eine Rechnung (wie bisher)
      const buttonHtml = erstelleGeschaeftsfallButton(currentI, geschaeftsfallDaten, false);
      buttonDiv.innerHTML = buttonHtml;
    }

    // Gutschrift-Button (Rücksendung) – bleibt wie bisher
    if (mitRuecksendung.checked && currentI > 0 && currentI < anzahl && konto_2 === "4400 VE" && buchungsoptionDropdown.value === 'buchungssatz') {
      const gutschriftNummer = currentI + 1;
      const gutschriftButtonHtml = erstelleGeschaeftsfallButton(gutschriftNummer, geschaeftsfallDaten, true);
      const gutschriftDiv = document.createElement('div');
      gutschriftDiv.style.margin = '8px 0 16px 0';
      gutschriftDiv.innerHTML = gutschriftButtonHtml;
      buttonColumn.appendChild(gutschriftDiv);

      // Hinweis in Aufgabe
      aufgabeHtml += `<div style="font-size:0.9em; color:#d32f2f; margin-top:6px;">
        → Rücksendung → Gutschrift erstellen (siehe Button für Aufgabe ${gutschriftNummer} rechts)
    </div>`;
    }

    buttonColumn.appendChild(buttonDiv);

    // ── Lösung / Antwort (wird exportiert) ─────────────────────────────
    antwortOutput += `<div style="margin-top: 1.5em;"><strong>${parseInt(i)}.</strong><br>`;

    if (buchungsoptionDropdown.value === 'einkaufskalkulation') {
      antwortOutput += `
        <table style="border-collapse: collapse; white-space:nowrap; width:350px; margin: 0 0">
          <tbody>
            <tr><td>Listeneinkaufspreis</td><td style="padding-left:16px;text-align:right;">${listeneinkaufspreis}</td><td style="padding-left:6px;text-align:right;">100 %</td><td style="padding-left:6px;text-align:right;">&nbsp;</td></tr>
            <tr><td>- Liefererrabatt</td><td style="padding-left:16px;text-align:right;">${antwort_rabattWert}</td><td style="padding-left:6px;text-align:right;">${antwort_rabattSatz} %</td><td style="padding-left:6px;text-align:right;">&nbsp;</td></tr>
            <tr><td style="border-top: solid 1px #ccc">= Zieleinkaufspreis</td><td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc">${zieleinkaufspreis}</td><td style="padding-left:6px;text-align:right;">${100 - antwort_rabattSatz} %</td><td style="padding-left:6px;text-align:right;">100 %</td></tr>
            <tr><td>- Liefererskonto</td><td style="padding-left:16px;text-align:right;">${antwort_skontoBetrag}</td><td style="padding-left:6px;text-align:right;">&nbsp;</td><td style="padding-left:6px;text-align:right;">${antwort_skontoSatz} %</td></tr>
            <tr><td style="border-top: solid 1px #ccc">= Bareinkaufspreis</td><td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc">${antwort_bareinkaufspreis}</td><td style="padding-left:6px;text-align:right;">&nbsp;</td><td style="padding-left:6px;text-align:right;">${100 - parseFloat(antwort_skontoSatz)} %</td></tr>
            <tr><td>+ Bezugskosten</td><td style="padding-left:16px;text-align:right;">${antwort_bezugskostenWert}</td><td style="padding-left:6px;text-align:right;">&nbsp;</td><td style="padding-left:6px;text-align:right;">&nbsp;</td></tr>
            <tr><td style="border-top: solid 1px #ccc">= Einstandspreis</td><td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc">${antwort_einstandspreis}</td><td style="padding-left:6px;text-align:right;">&nbsp;</td><td style="padding-left:6px;text-align:right;">&nbsp;</td></tr>
          </tbody>
        </table><br>`;
    }

    antwortOutput += `
      <table style="border: 1px solid #ccc; white-space:nowrap; background-color:#fff; font-family:courier; width:600px; margin:0 0 6px; margin-top:10px;">
        <tbody>
          <tr>
            <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${konto_1}</td>
            <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${zieleinkaufspreis}</td>
            <td style="text-align:center; width:100px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:40px" tabindex="1"></td>
            <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px; text-align:right" tabindex="1"></td>
            <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px; text-align:right" tabindex="1"></td>
          </tr>`;

    if (mitBezugskosten.checked) {
      antwortOutput += `
          <tr>
            <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${antwort_bezugskosten}</td>
            <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${antwort_bezugskostenWert}</td>
            <td style="text-align:center; width:100px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:40px" tabindex="1"></td>
            <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px; text-align:right" tabindex="1"></td>
            <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px; text-align:right" tabindex="1"></td>
          </tr>`;
    }

    antwortOutput += `
          <tr>
            <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">2600 VORST</td>
            <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:120px" tabindex="1">${USTWert}</td>
            <td style="text-align:center; width:100px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:40px" tabindex="1">an</td>
            <td style="text-align:left; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${konto_2}</td>
            <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${betrag_2}</td>
          </tr>
        </tbody>
      </table><br>`;

    if (buchungsoptionDropdown.value === 'skontobuchungssatz') {
      antwortOutput += `
        <br><b>Nebenrechnung:</b><br>
        <table style="border-collapse: collapse; white-space:nowrap; width:350px; margin: 0 0">
          <tbody>
            <tr><td>Rechnungsbetrag</td><td style="padding-left:16px;text-align:right;">${betrag_2}</td><td style="padding-left:6px;text-align:right;">&nbsp;</td></tr>
            <tr><td>- Skonto (brutto)</td><td style="padding-left:16px;text-align:right;">${antwort_skontoBetrag_brutto}</td><td style="padding-left:6px;text-align:right;">${antwort_skontoSatz} %</td></tr>
            <tr><td style="border-top: solid 1px #ccc">= Überweisungsbetrag</td><td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc">${antwort_ueberweisungsbetrag}</td><td style="padding-left:6px;text-align:right;">&nbsp;</td></tr>
          </tbody>
        </table><br>
        <table style="border-collapse: collapse; white-space:nowrap; width:350px; margin: 0 0">
          <tbody>
            <tr><td>Skonto (brutto)</td><td style="padding-left:16px;text-align:right;">${antwort_skontoBetrag_brutto}</td><td style="padding-left:6px;text-align:right;">119 %</td></tr>
            <tr><td>- Umsatzsteuer</td><td style="padding-left:16px;text-align:right;">${antwort_vorsteuer_berichtigung}</td><td style="padding-left:6px;text-align:right;">19 %</td></tr>
            <tr><td style="border-top: solid 1px #ccc">= Skonto (netto)</td><td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc">${antwort_skontoBetrag}</td><td style="padding-left:6px;text-align:right;">100 %</td></tr>
          </tbody>
        </table><br>
        <table style="border: 1px solid #ccc; white-space:nowrap; background-color:#fff; font-family:courier; width:600px; margin:0 0 6px;">
          <tbody>
            <tr>
              <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">4400 VE</td>
              <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${betrag_2}</td>
              <td style="text-align:center; width:100px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:40px" tabindex="1">an</td>
              <td style="text-align:left; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">2800 BK</td>
              <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${antwort_ueberweisungsbetrag}</td>
            </tr>
            <tr>
              <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1"></td>
              <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1"></td>
              <td style="text-align:center; width:100px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:40px" tabindex="1"></td>
              <td style="text-align:left; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${konto_Skontobuchungssatz}</td>
              <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${antwort_skontoBetrag}</td>
            </tr>
            <tr>
              <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1"></td>
              <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1"></td>
              <td style="text-align:center; width:100px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:40px" tabindex="1"></td>
              <td style="text-align:left; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">2600 VORST</td>
              <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">${antwort_vorsteuer_berichtigung}</td>
            </tr>
          </tbody>
        </table><br>`;
    }

    antwortOutput += `</div>`;
if (mitRuecksendung.checked && i > 0 && i < anzahl && konto_2 === "4400 VE" && buchungsoptionDropdown.value === 'buchungssatz') {
    letzteGenerierteGfListeEinkauf.push({
    aufgabe: `${formattedRuecksendung} aus Geschäftsfall ${currentI} zurück und erhält dafür eine Gutschrift.`,
    loesung: `Buchungssatz Rücksendung:\n${konto_2} ${berechnung_bruttoWertRuecksendung} an 2600 VORST ${USTWertRuecksendung} / ${konto_1} ${zieleinkaufspreis_Ruecksendung}`,
  });

  i++;
  // ... rest des Rücksendungs-HTML-Blocks bleibt unverändert
      antwortOutput += `<strong>${parseInt(i)}.</strong>`;
      antwortOutput += `<table style="border: 1px solid #ccc;white-space:nowrap;background-color:#fff;font-family:courier;min-width:500px;margin:0 0;margin-bottom:6px;">`;
      antwortOutput += `<tbody>`;
      antwortOutput += `<tr>`;
      antwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px" tabindex="1">${konto_2}</td>`;
      antwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1">${berechnung_bruttoWertRuecksendung}</td>`;
      antwortOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 50px" tabindex="1">an</td>`;
      antwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px;text-align:left" tabindex="1">2600 VORST</td>`;
      antwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px;text-align:right" tabindex="1">${USTWertRuecksendung}</td>`;
      antwortOutput += `</tr>`;
      antwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px" tabindex="1"></td>`;
      antwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1"></td>`;
      antwortOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 50px" tabindex="1"></td>`;
      antwortOutput += `<td style="text-align:left;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1">${konto_1}</td>`;
      antwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1">${zieleinkaufspreis_Ruecksendung}</td>`;
      antwortOutput += `</tr>`;
      antwortOutput += `</tbody>`;
      antwortOutput += `</table><br>`;
    } else {
    }
  }
  satzOutput += '</ol>'; // Ende der nummerierten Liste für Sätze

  container.innerHTML = satzOutput + antwortOutput;
  const vorschau = document.getElementById('kiPromptVorschau');
if (vorschau && vorschau.style.display !== 'none') {
  vorschau.textContent = erstelleKiPromptText();
}
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
      fillBezeichnungsfelderEinkauf(myCompanyName);

      // Trigger change event falls andere Scripts darauf reagieren
      const event = new Event('change', { bubbles: true });
      dropdown.dispatchEvent(event);

      console.log(`"${myCompanyName}" automatisch in Dropdown ausgewählt`);
    }
  });
}

// Zuletzt generierte Aufgabenliste (für KI-Prompt)
let letzteGenerierteGfListeEinkauf = [];

function erstelleKiPromptText() {
  let aufgabenUndLoesungen = "";
  if (letzteGenerierteGfListeEinkauf.length === 0) {
    aufgabenUndLoesungen = "(Noch keine Aufgaben generiert. Bitte zuerst neue Aufgaben erstellen.)";
  } else {
    aufgabenUndLoesungen = letzteGenerierteGfListeEinkauf
      .map((eintrag, idx) => {
        return `Aufgabe ${idx + 1}:\n${eintrag.aufgabe}\n\nMusterlösung ${idx + 1}:\n${eintrag.loesung}`;
      })
      .join("\n\n---\n\n");
  }
  return KI_ASSISTENT_PROMPT.replace("###AUFGABEN und LÖSUNGEN###", aufgabenUndLoesungen);
}


// ============================================================================
// KI-ASSISTENT PROMPT – EINKAUF (Buchungssatz, Einkaufskalkulation, Skontobuchungssatz)
// ============================================================================

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Buchführungs-Assistent für Schüler der Realschule (BwR), 8. Klasse. Du hilfst beim Verständnis von Buchungssätzen und der Einkaufskalkulation im Bereich Beschaffung/Einkauf.

Wichtige Regeln (streng einhalten!):
- Gib **KEINE** fertigen Buchungssätze, KEINE Beträge, KEINE Konten und KEINE fertigen Nebenrechnungen vor.
- Sage dem Schüler **nie**, welches Konto (AWR, AWH, AWF, AWB, VORST, VE, BK etc.) er verwenden soll.
- Gib keine Hinweise wie „Du brauchst das Konto für Rohstoffe" oder „Denk an die Vorsteuer".
- Führe den Schüler ausschließlich durch **gezielte, offene Fragen** und kurze Denkanstöße.
- Warte immer auf die richtige Antwort des Schülers, bevor du die nächste Frage stellst.
- Bei Fehlern erkläre das zugrundeliegende Prinzip, ohne die richtige Buchung zu nennen.
- Beantworte deine Rückfragen nicht selbst – hake bei falschen Antworten beim Schüler nach.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Erst wenn alle Teilschritte richtig beantwortet wurden, bestätige den vollständigen Buchungssatz oder die Kalkulation.

---
Pädagogischer Ablauf (genau so beginnen):
Begrüße den Schüler freundlich und gib ihm einen Geschäftfall vor, den du zufällig aus der folgenden Aufgabenliste auswählst:

###AUFGABEN und LÖSUNGEN###

AUFGABENTYP 1: BUCHUNGSSATZ (Einkauf von Werkstoffen)

Methodik bei Rückfragen:
- Was wurde eingekauft? Um welchen Werkstoff handelt es sich?
- Wie wurde bezahlt – bar (Kasse), per Banküberweisung oder auf Ziel (Rechnung)?
- Gibt es Rabatt? Wie wirkt sich das auf den Zieleinkaufspreis aus?
- Gibt es Bezugskosten? Welches Konto wird dafür verwendet?
- Gibt es Vorsteuer? Wie hoch ist sie, und auf welchen Betrag wird sie berechnet?
- Welches Konto kommt ins Soll, welches ins Haben?

Kontenplan – Einkauf von Werkstoffen:

Aufwandskonten Werkstoffe (immer im SOLL):
- 6000 AWR – Aufwand für Rohstoffe
- 6010 AWF – Aufwand für Fremdbauteile
- 6020 AWH – Aufwand für Hilfsstoffe
- 6030 AWB – Aufwand für Betriebsstoffe

Bezugskostenkonten (immer im SOLL, nur wenn Bezugskosten anfallen):
- 6001 BZKR – Bezugskosten Rohstoffe
- 6011 BZKF – Bezugskosten Fremdbauteile
- 6021 BZKH – Bezugskosten Hilfsstoffe
- 6031 BZKB – Bezugskosten Betriebsstoffe

Vorsteuer (immer im SOLL):
- 2600 VORST – Vorsteuer 19 %

Zahlungsarten (immer im HABEN):
- 2880 KA – Kasse (Barzahlung)
- 2800 BK – Bank (Banküberweisung)
- 4400 VE – Verbindlichkeiten gegenüber Lieferern (Kauf auf Ziel / Rechnung)

Buchungssatz-Schema ohne Bezugskosten:
  Werkstoffkonto (Soll) | Zieleinkaufspreis (netto)
  2600 VORST (Soll)     | Vorsteuer
  an Zahlungskonto (Haben) | Bruttobetrag

Buchungssatz-Schema mit Bezugskosten:
  Werkstoffkonto (Soll) | Zieleinkaufspreis (netto)
  Bezugskostenkonto (Soll) | Bezugskosten (netto)
  2600 VORST (Soll)     | Vorsteuer (auf Netto inkl. Bezugskosten)
  an Zahlungskonto (Haben) | Bruttobetrag gesamt

Rabattberechnung:
- Listeneinkaufspreis × (100 % − Rabatt %) = Zieleinkaufspreis
- Rabatt mindert nur den Zieleinkaufspreis, nicht die Bezugskosten
- Rabatte werden nicht, sondern sofort abgezogen 

Vorsteuerberechnung:
- Wenn Bezugskosten: (Zieleinkaufspreis + Bezugskosten) × 19 % = Vorsteuer
- Wenn keine Bezugskosten: Zieleinkaufspreis × 19 % = Vorsteuer

Buchung einer Rücksendung (Gutschrift):
- Stornobuchung (Buchungssatz wird umgedreht)
- Gegenkonto 4400 VE ins SOLL (Verbindlichkeit sinkt)
- Vorsteuerberichtigung: 2600 VORST ins HABEN
- Werkstoffkonto ins HABEN (Aufwand sinkt)
- Schema: 4400 VE (Soll) | Bruttobetrag an 2600 VORST (Haben) | Vorsteuer / Werkstoffkonto (Haben) | Nettobetrag

---

AUFGABENTYP 2: EINKAUFSKALKULATION (Einstandspreis berechnen)

Methodik bei Rückfragen:
- Womit beginnt die Kalkulation? Was ist der Ausgangspunkt?
- Was wird vom Listeneinkaufspreis abgezogen?
- Was ergibt sich nach dem Rabatt?
- Was zieht man beim Skonto ab, und von welchem Betrag?
- Wie werden Bezugskosten behandelt?

Kalkulationsschema Einkauf:
  Listeneinkaufspreis       100 %
  − Liefererrabatt           z. B. 10 %
  = Zieleinkaufspreis        z. B. 90 %   (= 100 % Basis für Skonto)
  − Liefererskonto           z. B. 2 %    (= 2 % vom Zieleinkaufspreis)
  = Bareinkaufspreis         z. B. 98 %   (des Zieleinkaufspreises)
  + Bezugskosten             (absoluter Betrag, netto)
  = Einstandspreis

Wichtige Hinweise zur Kalkulation:
- Rabatt bezieht sich immer auf den Listeneinkaufspreis
- Skonto bezieht sich immer auf den Zieleinkaufspreis (nach Rabatt)
- Bezugskosten werden absolut addiert, kein Prozentsatz
- Der Einstandspreis ist der tatsächliche Einstandspreis ohne Umsatzsteuer

Häufige Schülerfehler Kalkulation:
- Skonto vom falschen Betrag abziehen (vom Listenpreis statt Zieleinkaufspreis)
- Reihenfolge der Schritte vertauschen
- Bezugskosten vergessen oder doppelt abziehen
- Prozentwerte falsch berechnen (z. B. 10 % von falscher Basis)

---

AUFGABENTYP 3: SKONTOBUCHUNGSSATZ (Rechnungsausgleich mit Skonto)

Dieser Aufgabentyp besteht aus zwei Teilaufgaben:
a) Buchungssatz für den Einkauf (wie Aufgabentyp 1)
b) Buchungssatz für die Zahlung mit Skonto per Banküberweisung

Methodik bei Rückfragen Teil b:
- Was passiert beim Rechnungsausgleich mit Skonto?
- Welches Konto wird beim Überweisen belastet (Haben)?
- Die Verbindlichkeit 4400 VE wird ausgeglichen – welche Seite also?
- Skonto ist ein Nachlass – welches Konto erfasst das?
- Muss die Vorsteuer berichtigt werden? Warum?
- Wie berechnet man den Skontobetrag (brutto und netto)?
- Was ist der tatsächliche Überweisungsbetrag?

Nebenrechnung Skonto:
  Rechnungsbetrag (brutto)
  − Skonto brutto (= Rechnungsbetrag × Skontosatz %)
  = Überweisungsbetrag

  Skonto brutto           119 %
  − Umsatzsteueranteil     19 %
  = Skonto netto          100 %

Buchungssatz Skontobuchungssatz:
  4400 VE (Soll)             | Rechnungsbetrag (brutto)
  an 2800 BK (Haben)         | Überweisungsbetrag
  an Nachlasskonto (Haben)   | Skonto netto
  an 2600 VORST (Haben)      | Vorsteuerberichtigung

Nachlass-/Skontokonten (immer im HABEN beim Skontobuchungssatz):
- 6002 NR – Nachlässe auf Rohstoffe
- 6012 NF – Nachlässe auf Fremdbauteile
- 6022 NH – Nachlässe auf Hilfsstoffe
- 6032 NB – Nachlässe auf Betriebsstoffe

Häufige Schülerfehler Skontobuchungssatz:
- Skonto brutto statt netto beim Nachlasskonto einsetzen
- Vorsteuerberichtigung vergessen
- Überweisungsbetrag falsch berechnen (z. B. Skonto netto statt brutto abgezogen)
- Falsches Nachlasskonto (passend zum gebuchten Werkstoff verwenden)
- Soll und Haben vertauscht beim Ausgleich der Verbindlichkeit

---

Allgemeine Hinweise für alle Aufgabentypen:
- Netto = ohne Umsatzsteuer; Brutto = mit Umsatzsteuer
- Wenn „netto" angegeben: Brutto = Netto × 1,19
- Wenn „brutto" angegeben: Netto = Brutto ÷ 1,19
- Wenn nichts angegeben: nachfragen oder Hinweis im Aufgabentext beachten
- Aufwandskonten stehen immer im Soll
- Zahlungskonten (Kasse, Bank, Verbindlichkeit) stehen immer im Haben

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe mit Realschülerinnen und -schülern
- Einfache Sprache, keine Fachbegriffe ohne Erklärung
- Kurze Antworten – maximal 1–2 Sätze pro Nachricht
- Gelegentlich Emojis zur Auflockerung 🧾✅❓📦

Was du NICHT tust:
- Nenne den fertigen Buchungssatz oder das Ergebnis der Kalkulation nicht, bevor der Schüler selbst darauf gekommen ist
- Rechne nicht vor, bevor gefragt wurde
- Gib keine Lösungen auf Anfrage wie „sag mir einfach die Antwort" – erkläre, dass das Ziel das eigene Verstehen ist

Tonalität: freundlich, kurz (1–2 Sätze), gelegentlich Emojis 📦✅❓
Nenne die fertige Lösung erst, wenn der Schüler selbst darauf gekommen ist. Verbessere am Schluss dann auch Formfehler, zum Beispiel Großschreibung der Konten (VE statt ve) und weise darauf hin die DIN 5008 zu beachten: Tausenderpunkt bei den Beträgen, immer zwei Nachkommastellen und €-Zeichen: z. B. 12.000,00 €
Gib ganz am Ende den Buchungssatz mit einer Tabellenstruktur in html aus, Beispiele:

## Aufwand buchen (Aufghabentyp 1)
<h2>Aufgaben</h2><ol><li><div>Mayer Möbel erwirbt Aluminiumtischbeine auf Ziel in Höhe von 500,00 € netto, abzüglich 15 % Rabatt.</div></li><li>Mayer Möbel sendet 50 % der Werkstoffe  aus Geschäftsfall 1 zurück und erhält dafür eine Gutschrift.
        </li>
      </ol><h2>Lösung</h2><div style="margin-top: 1.5em;"><strong>1.</strong><br>
      <table style="border: 1px solid #ccc; white-space:nowrap; background-color:#fff; font-family:courier; width:600px; margin:0 0 6px; margin-top:10px;">
        <tbody>
          <tr>
            <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">6010 AWF</td>
            <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">425,00&nbsp;€</td>
            <td style="text-align:center; width:100px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:40px" tabindex="1"></td>
            <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px; text-align:right" tabindex="1"></td>
            <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px; text-align:right" tabindex="1"></td>
          </tr>
          <tr>
            <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">2600 VORST</td>
            <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:120px" tabindex="1">80,75&nbsp;€</td>
            <td style="text-align:center; width:100px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:40px" tabindex="1">an</td>
            <td style="text-align:left; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">4400 VE</td>
            <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">505,75&nbsp;€</td>
          </tr>
        </tbody>
      </table><br></div><strong>2.</strong><table style="border: 1px solid #ccc;white-space:nowrap;background-color:#fff;font-family:courier;min-width:500px;margin:0 0;margin-bottom:6px;"><tbody><tr><td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px" tabindex="1">4400 VE</td><td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1">252,88&nbsp;€</td><td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 50px" tabindex="1">an</td><td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px;text-align:left" tabindex="1">2600 VORST</td><td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px;text-align:right" tabindex="1">40,38&nbsp;€</td></tr><tr><td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px" tabindex="1"></td><td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1"></td><td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 50px" tabindex="1"></td><td style="text-align:left;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1">6010 AWF</td><td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1">212,50&nbsp;€</td></tr></tbody></table><br>

## Einkaufskalkulation (Aufgabentyp 2)

<h2>Aufgaben</h2><ol><li><div><ol style="list-style-type: lower-latin;"><li>Berechne den Einstandspreis eines Angebots für den Kauf Schließzylinder mit einem Warenwert von Listenpreis 300,00 € netto. Mayer Möbel kann außerdem 2 % Skonto abziehen.</li><li>Bilde den Buchungssatz: Mayer Möbel akzeptiert das Angebot. Die Werkstoffe werden geliefert und der Lieferer sendet eine Eingangsrechnung.</li></ol></div></li></ol><h2>Lösung</h2><div style="margin-top: 1.5em;"><strong>1.</strong><br>
        <table style="border-collapse: collapse; white-space:nowrap; width:350px; margin: 0 0">
          <tbody>
            <tr><td>Listeneinkaufspreis</td><td style="padding-left:16px;text-align:right;">300,00&nbsp;€</td><td style="padding-left:6px;text-align:right;">100 %</td><td style="padding-left:6px;text-align:right;">&nbsp;</td></tr>
            <tr><td>- Liefererrabatt</td><td style="padding-left:16px;text-align:right;">0,00&nbsp;€</td><td style="padding-left:6px;text-align:right;">0 %</td><td style="padding-left:6px;text-align:right;">&nbsp;</td></tr>
            <tr><td style="border-top: solid 1px #ccc">= Zieleinkaufspreis</td><td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc">300,00&nbsp;€</td><td style="padding-left:6px;text-align:right;">100 %</td><td style="padding-left:6px;text-align:right;">100 %</td></tr>
            <tr><td>- Liefererskonto</td><td style="padding-left:16px;text-align:right;">6,00&nbsp;€</td><td style="padding-left:6px;text-align:right;">&nbsp;</td><td style="padding-left:6px;text-align:right;">2 %</td></tr>
            <tr><td style="border-top: solid 1px #ccc">= Bareinkaufspreis</td><td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc">294,00&nbsp;€</td><td style="padding-left:6px;text-align:right;">&nbsp;</td><td style="padding-left:6px;text-align:right;">98 %</td></tr>
            <tr><td>+ Bezugskosten</td><td style="padding-left:16px;text-align:right;">0,00&nbsp;€</td><td style="padding-left:6px;text-align:right;">&nbsp;</td><td style="padding-left:6px;text-align:right;">&nbsp;</td></tr>
            <tr><td style="border-top: solid 1px #ccc">= Einstandspreis</td><td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc">294,00&nbsp;€</td><td style="padding-left:6px;text-align:right;">&nbsp;</td><td style="padding-left:6px;text-align:right;">&nbsp;</td></tr>
          </tbody>
        </table><br>
      <table style="border: 1px solid #ccc; white-space:nowrap; background-color:#fff; font-family:courier; width:600px; margin:0 0 6px; margin-top:10px;">
        <tbody>
          <tr>
            <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">6010 AWF</td>
            <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">300,00&nbsp;€</td>
            <td style="text-align:center; width:100px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:40px" tabindex="1"></td>
            <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px; text-align:right" tabindex="1"></td>
            <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px; text-align:right" tabindex="1"></td>
          </tr>
          <tr>
            <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">2600 VORST</td>
            <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:120px" tabindex="1">57,00&nbsp;€</td>
            <td style="text-align:center; width:100px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:40px" tabindex="1">an</td>
            <td style="text-align:left; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">4400 VE</td>
            <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">357,00&nbsp;€</td>
          </tr>
        </tbody>
      </table><br></div>

## Skontobuchungssatz (Aufgabentyp 3)

<h2>Aufgaben</h2><ol><li><div>Mayer Möbel kauft Reinigungsmittel, wobei eine Eingangsrechnung eingeht in Höhe von 4.400,00 € netto.</div><div style="margin: 8px 0 20px;"><ol style="list-style-type: lower-latin;"><li>Bilde den Buchungssatz zum Geschäftsfall.</li><li>Der Rechnungsausgleich erfolgt mit 2 % Skonto per Bank. Bilde den Buchungssatz.</li></ol></div></li></ol><h2>Lösung</h2><div style="margin-top: 1.5em;"><strong>1.</strong><br>
      <table style="border: 1px solid #ccc; white-space:nowrap; background-color:#fff; font-family:courier; width:600px; margin:0 0 6px; margin-top:10px;">
        <tbody>
          <tr>
            <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">6030 AWB</td>
            <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">4.400,00&nbsp;€</td>
            <td style="text-align:center; width:100px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:40px" tabindex="1"></td>
            <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px; text-align:right" tabindex="1"></td>
            <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px; text-align:right" tabindex="1"></td>
          </tr>
          <tr>
            <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">2600 VORST</td>
            <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:120px" tabindex="1">836,00&nbsp;€</td>
            <td style="text-align:center; width:100px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:40px" tabindex="1">an</td>
            <td style="text-align:left; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">4400 VE</td>
            <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">5.236,00&nbsp;€</td>
          </tr>
        </tbody>
      </table><br>
        <br><b>Nebenrechnung:</b><br>
        <table style="border-collapse: collapse; white-space:nowrap; width:350px; margin: 0 0">
          <tbody>
            <tr><td>Rechnungsbetrag</td><td style="padding-left:16px;text-align:right;">5.236,00&nbsp;€</td><td style="padding-left:6px;text-align:right;">&nbsp;</td></tr>
            <tr><td>- Skonto (brutto)</td><td style="padding-left:16px;text-align:right;">104,72&nbsp;€</td><td style="padding-left:6px;text-align:right;">2 %</td></tr>
            <tr><td style="border-top: solid 1px #ccc">= Überweisungsbetrag</td><td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc">5.131,28&nbsp;€</td><td style="padding-left:6px;text-align:right;">&nbsp;</td></tr>
          </tbody>
        </table><br>
        <table style="border-collapse: collapse; white-space:nowrap; width:350px; margin: 0 0">
          <tbody>
            <tr><td>Skonto (brutto)</td><td style="padding-left:16px;text-align:right;">104,72&nbsp;€</td><td style="padding-left:6px;text-align:right;">119 %</td></tr>
            <tr><td>- Umsatzsteuer</td><td style="padding-left:16px;text-align:right;">16,72&nbsp;€</td><td style="padding-left:6px;text-align:right;">19 %</td></tr>
            <tr><td style="border-top: solid 1px #ccc">= Skonto (netto)</td><td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc">88,00&nbsp;€</td><td style="padding-left:6px;text-align:right;">100 %</td></tr>
          </tbody>
        </table><br>
        <table style="border: 1px solid #ccc; white-space:nowrap; background-color:#fff; font-family:courier; width:600px; margin:0 0 6px;">
          <tbody>
            <tr>
              <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">4400 VE</td>
              <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">5.236,00&nbsp;€</td>
              <td style="text-align:center; width:100px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:40px" tabindex="1">an</td>
              <td style="text-align:left; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">2800 BK</td>
              <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">5.131,28&nbsp;€</td>
            </tr>
            <tr>
              <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1"></td>
              <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1"></td>
              <td style="text-align:center; width:100px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:40px" tabindex="1"></td>
              <td style="text-align:left; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">6032 NB</td>
              <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">88,00&nbsp;€</td>
            </tr>
            <tr>
              <td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1"></td>
              <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1"></td>
              <td style="text-align:center; width:100px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:40px" tabindex="1"></td>
              <td style="text-align:left; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">2600 VORST</td>
              <td style="text-align:right; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:140px; min-width:140px" tabindex="1">16,72&nbsp;€</td>
            </tr>
          </tbody>
        </table><br></div>

`;


function kopiereKiPrompt() {
  navigator.clipboard.writeText(erstelleKiPromptText()).then(() => {
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
    vorschau.textContent = erstelleKiPromptText(); // ← NEU
    btn.textContent = 'Vorschau ausblenden ▲';
  } else {
    vorschau.style.display = 'none';
    btn.textContent = 'Prompt anzeigen ▼';
  }
}


// WICHTIG: Warte bis die Seite vollständig geladen ist
document.addEventListener('DOMContentLoaded', function () {
  // Warte kurz, damit meinunternehmen.js das Dropdown befüllen kann
  setTimeout(function () {
    autoSelectMyCompany();
    zeigeZufaelligenSatz()
  }, 500);

  // Prompt-Text in Vorschau einfügen
  const vorschauEl = document.getElementById('kiPromptVorschau');
if (vorschauEl) {
  vorschauEl.textContent = erstelleKiPromptText();
}
});