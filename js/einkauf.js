const anzahlDropdown = document.getElementById('anzahlDropdown');
const mitRabatt = document.getElementById('mitRabatt');
const mitBezugskosten = document.getElementById('mitBezugskosten');
const mitRuecksendung = document.getElementById('mitRuecksendung');
const mitEinkaufskalkulation = document.getElementById('mitEinkaufskalkulation');
const Skontobuchungssatz = document.getElementById('mitSkontobuchungssatz');

document.addEventListener('DOMContentLoaded', function() {
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
  if (buchungsoptionDropdown.value === 'einkaufskalkulation' || buchungsoptionDropdown.value === 'skontobuchungssatz' ) {
    kontenZahlung = {
      ", wobei wir eine Eingangsrechnung erhalten": "4400 VE",
      ". Die Werkstoffe werden geliefert und der Lieferer sendet uns eine Eingangsrechnung": "4400 VE",
      ", wobei wir die Rechnung des Lieferers erhalten": "4400 VE",
    } } else {
  kontenZahlung = {
    "in bar": "2880 KA",
    "per Barzahlung": "2880 KA",
    "per Banküberweisung": "2800 BK",
    "gegen Rechnung": "4400 VE",
    "auf Rechnung": "4400 VE",
    "auf Ziel": "4400 VE",
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
  const array_Subjekt = ['Wir kaufen ', 'Wir beziehen ', 'Unsere Firma kauft ', 'Wir erwerben ', 'Ein Lieferant sendet ', 'Wir haben gekauft: '];
  const array_Subjekt_2 = ['Kauf ', 'Einkauf ', 'Erwerb ', 'Beschaffung ', 'Bezug '];
  const array_Subjekt_3 = ['Berechne den Einstandspreis: Wir erhalten ein Angebot für ', 'Berechne den Einstandspreis, wenn wir ein Angebot erhalten für '];
  const array_Subjekt_4 = ['Berechne den Einstandspreis: Unser Lieferant sendet ein Angebot für den Bezug', 'Berechne den Einstandspreis eines Angebots für den Kauf '];
  const array_Subjekt_5 = [`Wir bezahlen die Rechnung per Banküberweisung innerhalb der Skontofrist mit ${random_Skonto} % Skonto`, `Die Rechnung wird mit ${random_Skonto} % Skonto per Banküberweisung ausgeglichen`, `Der Rechnungsausgleich erfolgt mit ${random_Skonto} % Skonto per Bank`,  ];
  const array_Werkstoffe = Object.keys(kontenWerkstoffe);
  const array_Werkstoffe_2 = Object.keys(kontenWerkstoffe_2);
  const array_Supply_Wert = ['mit einem Aufwand in Höhe von', 'im Wert von', 'mit', 'mit einem Wert in Höhe von', 'mit einem Betrag in Höhe von', 'mit einem finanziellen Einsatz von', 'im Umfang von'];
  const array_Zahlung = Object.keys(kontenZahlung);
  const array_Supply_Rabatt = [`, abzüglich ${random_Rabatt} % Rabatt`];
  const array_Supply_Rabatt_2 = [
    `. Ausgehandelt wurden zusätzlich ${random_Rabatt} % Treuerabatt`,
    `. ${random_Rabatt} % Sonderrabatt können abgezogen werden`,
    `. ${random_Rabatt} % Rabatt können abgezogen werden`,
    `. Der Lieferer gewährt uns ${random_Rabatt} % Kundenrabatt`,
    `. Wir haben zudem ${random_Rabatt} % Rabatt ausgehandelt`,
  ];
  const array_Supply_Skonto = [
    `. Wir können zudem ${random_Skonto} % Skonto abziehen`,
    `. Wir können außerdem ${random_Skonto} % Skonto abziehen`,
    `. Der Skonto beträgt ${random_Skonto} %`,
    `. Als nachträglichen Preisnachlass können wir ${random_Skonto} % Skonto ansetzen`,
  ];
  const array_Supply_Bezugskosten = [
    `. Versandkosten mit netto ${random_Bezugskosten} fallen obendrein an`,
    `. Wir zahlen zudem zusätzlich Verpackungskosten in Höhe von ${random_Bezugskosten} netto`,
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
  randomNettowert = nettoOderBrutto === 'Netto' ? `Listenpreis ${nettoWert} netto` : `brutto ${bruttoWert}`;
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
  let berechnung_skontoBetrag_brutto = (berechnung_skontoBetrag) + (berechnung_skontoBetrag*0.19);
  berechnung_skontoBetrag_brutto = roundToTwoDecimals(berechnung_skontoBetrag_brutto);
  let berechnung_vorsteuer_berichtigung = berechnung_skontoBetrag_brutto-berechnung_skontoBetrag;
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
  let ueberweisungsbetrag_berechnung = berechnung_bruttoWert-berechnung_skontoBetrag_brutto;
  let ueberweisungsbetrag = formatCurrency(ueberweisungsbetrag_berechnung);
  let antwortBruttowert = formatCurrency(berechnung_bruttoWert);

  let randomRuecksendungProzent = getRandomRuecksendung();

  // Zusammenfügen der ausgewählten Elemente zu einem Satz
  const randomAngebotSatz = Math.random();
  
  let angebotSatz;
  angebotSatz = `<ol style="list-style-type: lower-latin;">`;
  if (randomAngebotSatz < 0.33) {
    angebotSatz += `<li>${randomAngebot} ${randomWerkstoff} ${randomSupply_Wert} ${randomNettowertbeiAngebot} ${randomSupply_Rabatt} ${randomSupply_Skonto} ${randomSupply_Bezugskosten}.</li><li>Bilde den Buchungssatz: wir akzeptieren das Angebot ${randomZahlung}.</li>`;
  } else if (randomAngebotSatz < 0.66) {
    angebotSatz += `<li>${randomAngebot} ${randomWerkstoff} ${randomSupply_Wert} ${randomNettowertbeiAngebot} ${randomSupply_Rabatt_2} ${randomSupply_Skonto} ${randomSupply_Bezugskosten}.</li><li>Bilde den Buchungssatz: Wir geben die Bestellung in Auftrag ${randomZahlung}.</li>`;
  } else {
    angebotSatz += `<li>${randomAngebot} ${randomWerkstoff} ${randomSupply_Wert} ${randomNettowertbeiAngebot} ${randomSupply_Rabatt_2} ${randomSupply_Skonto} ${randomSupply_Bezugskosten}.</li><li>Wir nehmen das Angebot an ${randomZahlung}. Bilde den Buchungssatz!</li>`;
  }
  angebotSatz += `</ol>`;


  let zufaelligerSatz;
  const randomValue = Math.random();
  if (randomValue < 0.33) {
    zufaelligerSatz = `${randomSubjekt} ${randomWerkstoff} ${randomZahlung} ${randomSupply_Wert} ${randomNettowert} ${randomSupply_Rabatt} ${randomSupply_Bezugskosten}.`;
  } else if (randomValue < 0.66) {
    zufaelligerSatz = `${randomSubjekt} ${randomWerkstoff} ${randomSupply_Wert} ${randomNettowert} ${randomZahlung} ${randomSupply_Rabatt_2} ${randomSupply_Bezugskosten}.`;
  } else {
    zufaelligerSatz = `${randomSubjekt} ${randomWerkstoff} ${randomZahlung} ${randomSupply_Wert} ${randomNettowert} ${randomSupply_Rabatt_2} ${randomSupply_Bezugskosten}.`;
  }

  let ruecksendungSatz;
  const randomRuecksendung = Math.random();
  let USTWertRuecksendung;
  let zieleinkaufspreis_Ruecksendung = berechnung_nettoWert;
  let berechnung_bruttoWertRuecksendung= berechnung_bruttoWert;
  if (randomRuecksendung < 0.33) {
    ruecksendungSatz = `Aufgrund einer Falschlieferung senden wir alle Werkstoffe aus dem Geschäftsfall`;
    randomRuecksendungProzent = 100;
    zieleinkaufspreis_Ruecksendung = roundToTwoDecimals(zieleinkaufspreis_Ruecksendung*randomRuecksendungProzent/100);
    USTWertRuecksendung = roundToTwoDecimals(zieleinkaufspreis_Ruecksendung*19/100);
    berechnung_bruttoWertRuecksendung = USTWertRuecksendung+zieleinkaufspreis_Ruecksendung;
    USTWertRuecksendung = formatCurrency(USTWertRuecksendung);
    zieleinkaufspreis_Ruecksendung = formatCurrency(zieleinkaufspreis_Ruecksendung);
    berechnung_bruttoWertRuecksendung = formatCurrency(berechnung_bruttoWertRuecksendung);
  } else if (randomRuecksendung < 0.66) {
    ruecksendungSatz = `Aufgrund eines Sachmangels senden wir ${randomRuecksendungProzent} % der Werkstoffe aus Geschäftsfall`;
    zieleinkaufspreis_Ruecksendung = roundToTwoDecimals(zieleinkaufspreis_Ruecksendung*randomRuecksendungProzent/100);
    USTWertRuecksendung = roundToTwoDecimals(zieleinkaufspreis_Ruecksendung*19/100);
    berechnung_bruttoWertRuecksendung = USTWertRuecksendung+zieleinkaufspreis_Ruecksendung;
    USTWertRuecksendung = formatCurrency(USTWertRuecksendung);
    zieleinkaufspreis_Ruecksendung = formatCurrency(zieleinkaufspreis_Ruecksendung);
    berechnung_bruttoWertRuecksendung = formatCurrency(berechnung_bruttoWertRuecksendung);
  } else {
    ruecksendungSatz = `Wir senden ${randomRuecksendungProzent} % der Werkstoffe aus dem Geschäftsfall`;
    zieleinkaufspreis_Ruecksendung = roundToTwoDecimals(zieleinkaufspreis_Ruecksendung*randomRuecksendungProzent/100);
    USTWertRuecksendung = roundToTwoDecimals(zieleinkaufspreis_Ruecksendung*19/100);
    berechnung_bruttoWertRuecksendung = USTWertRuecksendung+zieleinkaufspreis_Ruecksendung;
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

  return [zufaelligerSatz, angebotSatz, ruecksendungSatz, skontoSatz, listeneinkaufspreis, antwort_rabattWert, antwort_rabattSatz, antwort_skontoSatz, antwort_skontoBetrag, antwort_skontoBetrag_brutto, antwort_vorsteuer_berichtigung, antwort_ueberweisungsbetrag, antwort_bareinkaufspreis, antwort_einstandspreis, konto_1, zieleinkaufspreis, antwort_bezugskosten, antwort_bezugskostenWert, USTWert, konto_2, betrag_2, konto_Skontobuchungssatz, USTWertRuecksendung, zieleinkaufspreis_Ruecksendung, berechnung_bruttoWertRuecksendung];

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

function erzeugeURLFuerGeschaeftsfall(geschaeftsfallDaten) {
    const params = new URLSearchParams();
    params.set('beleg', 'rechnung');
    
    if (geschaeftsfallDaten.listeneinkaufspreis) {
        params.set('einzelpreis1', parseNumericValue(geschaeftsfallDaten.listeneinkaufspreis));
    }
    if (geschaeftsfallDaten.rabattSatz) {
        params.set('rabatt', geschaeftsfallDaten.rabattSatz);
    }
    if (geschaeftsfallDaten.bezugskostenWert) {
        params.set('bezugskosten', parseNumericValue(geschaeftsfallDaten.bezugskostenWert));
    }
    if (geschaeftsfallDaten.skontoSatz) {
        params.set('skonto', geschaeftsfallDaten.skontoSatz);
    }
    if (geschaeftsfallDaten.werkstoff) {
        params.set('artikel1', geschaeftsfallDaten.werkstoff);
    }
    
    // Standard-Werte
    params.set('menge1', '1');
    params.set('einheit1', 'Stück');
    params.set('umsatzsteuer', '19');
    params.set('tag', new Date().getDate().toString());
    params.set('monat', (new Date().getMonth() + 1).toString());
    
    return `belege.html?${params.toString()}`;
}

function erstelleGeschaeftsfallButton(nummer, daten) {
    const url = erzeugeURLFuerGeschaeftsfall(daten);
    return `<button class="geschaeftsfall-beleg-button" onclick="window.open('${url}', '_blank')" title="Beleg für Geschäftsfall ${nummer} erstellen">📄 Beleg erstellen</button>`;
}

function zeigeZufaelligenSatz(i) {

  const anzahl = parseInt(anzahlDropdown.value);

  let satzOutput = '<h2>Aufgaben</h2>';
  satzOutput += '<ol>';
  let antwortOutput = `<h2>Lösung</h2>`;
  antwortOutput += '';

  for (let i = 1; i <= anzahl; i++) {
    const currentI = i;
    const [zufaelligerSatz, angebotSatz, ruecksendungSatz, skontoSatz, listeneinkaufspreis, antwort_rabattWert, antwort_rabattSatz, antwort_skontoSatz, antwort_skontoBetrag, antwort_skontoBetrag_brutto, antwort_vorsteuer_berichtigung, antwort_ueberweisungsbetrag, antwort_bareinkaufspreis, antwort_einstandspreis, konto_1, zieleinkaufspreis, antwort_bezugskosten, antwort_bezugskostenWert, USTWert, konto_2, betrag_2, konto_Skontobuchungssatz, USTWertRuecksendung, zieleinkaufspreis_Ruecksendung, berechnung_bruttoWertRuecksendung] = erstelleZufallssatz();
    const formattedSatz = zufaelligerSatz.replace(/\s+/g, ' ').replace(/\s(?=[.,;:!])/g, '');
    const formattedAngebot = angebotSatz.replace(/\s+/g, ' ').replace(/\s(?=[.,;:!])/g, '');
    const formattedSkonto = skontoSatz.replace(/\s+/g, ' ').replace(/\s(?=[.,;:!])/g, '');
    const formattedRuecksendung = ruecksendungSatz.replace(/\s+/g, ' ').replace(/\s(?=[.,;:!])/g, '');

       // Generierte Sätze hinzufügen

 satzOutput += `<li>`;
if (buchungsoptionDropdown.value === 'einkaufskalkulation') {
    satzOutput += `<div>${formattedAngebot}</div>`;
} else {
    satzOutput += `<div>${formattedSatz}</div>`;  // ← Ohne </li>!
    
    // ============ NEU: BUTTON HINZUFÜGEN ============
    const geschaeftsfallDaten = {
        listeneinkaufspreis: listeneinkaufspreis,
        rabattSatz: antwort_rabattSatz,
        bezugskostenWert: antwort_bezugskostenWert,
        skontoSatz: antwort_skontoSatz,
        werkstoff: extractWerkstoffName(konto_1)
    };
    
    satzOutput += `<div style="margin: 10px 0;">`;
    satzOutput += erstelleGeschaeftsfallButton(i, geschaeftsfallDaten);
    satzOutput += `</div>`;
    satzOutput += `</li>`;  // ← Jetzt erst </li>
      if (mitRuecksendung.checked && i > 0 && i < anzahl && konto_2 === "4400 VE" && buchungsoptionDropdown.value === 'buchungssatz') {
      satzOutput += `<li><div>${formattedRuecksendung}  ${currentI} zurück und erhalten dafür eine Gutschrift.</div></li>`;
      }
      if (buchungsoptionDropdown.value === 'skontobuchungssatz') {
        satzOutput += `<div style="margin-bottom:20px">${formattedSkonto}</div><br>`;
      }
    }
    satzOutput += `</li>`;

    // Generierte Antworten hinzufügen
    antwortOutput += `${parseInt(i)}.<br>`;
    if (buchungsoptionDropdown.value === 'einkaufskalkulation') {
      antwortOutput += `<table style="border-collapse: collapse;white-space:nowrap;width:350px;margin: 0 0">`;
      antwortOutput += `<tbody>`;
      antwortOutput += `<tr>`;
      antwortOutput += `<td>Listeneinkaufspreis</td><td style="padding-left:16px;text-align:right;">${listeneinkaufspreis}</td>`;
      antwortOutput += `<td style="padding-left:6px;text-align:right;">100 %</td>`;
      antwortOutput += `<td style="padding-left:6px;text-align:right;">&nbsp;</td>`;
      antwortOutput += `</tr>`;
      antwortOutput += `<tr>`;
      antwortOutput += `<td>- Liefererrabatt</td><td style="padding-left:16px;text-align:right;">${antwort_rabattWert}</td>`;
      antwortOutput += `<td style="padding-left:6px;text-align:right;">${antwort_rabattSatz} %</td>`;
      antwortOutput += `<td style="padding-left:6px;text-align:right;">&nbsp;</td>`;
      antwortOutput += `</tr>`;
      antwortOutput += `<tr>`;
      antwortOutput += `<td style="border-top: solid 1px #ccc">= Zieleinkaufspreis</td>`;
      antwortOutput += `<td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc"">${zieleinkaufspreis}</td>`;
      antwortOutput += `<td style="padding-left:6px;text-align:right;">${100-antwort_rabattSatz} %</td>`;
      antwortOutput += `<td style="padding-left:6px;text-align:right;">100 %</td>`;
      antwortOutput += `</tr>`;
      antwortOutput += `<tr>`;
      antwortOutput += `<td>- Liefererskonto</td>`;
      antwortOutput += `<td style="padding-left:16px;text-align:right;">${antwort_skontoBetrag}<br></td>`;
      antwortOutput += `<td style="padding-left:6px;text-align:right;">&nbsp;</td>`;
      antwortOutput += `<td style="padding-left:6px;text-align:right;">${antwort_skontoSatz} %</td>`;
      antwortOutput += ` </tr>`;
      antwortOutput += `<tr>`;
      antwortOutput += `<td style="border-top: solid 1px #ccc">= Bareinkaufspreis</td>`;
      antwortOutput += `<td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc">${antwort_bareinkaufspreis}</td>`;
      antwortOutput += `<td style="padding-left:6px;text-align:right;">&nbsp;</td>`;
      antwortOutput += `<td style="padding-left:6px;text-align:right;">${100-parseFloat(antwort_skontoSatz)} %</td>`;
      antwortOutput += `</tr>`;
      antwortOutput += `<tr>`;
      antwortOutput += `<td>+ Bezugskosten</td><td style="padding-left:16px;text-align:right;">${antwort_bezugskostenWert}</td>`;
      antwortOutput += `<td style="padding-left:6px;text-align:right;">&nbsp;</td>`;
      antwortOutput += `<td style="padding-left:6px;text-align:right;">&nbsp;</td>`;
      antwortOutput += `</tr>`;
      antwortOutput += `<tr>`;
      antwortOutput += `<td style="border-top: solid 1px #ccc">= Einstandspreis</td>`;
      antwortOutput += `<td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc">${antwort_einstandspreis}<br></td>`;
      antwortOutput += `<td style="padding-left:6px;text-align:right;">&nbsp;</td>`;
      antwortOutput += `<td style="padding-left:6px;text-align:right;">&nbsp;</td>`;
      antwortOutput += `</tr>`;
      antwortOutput += `</tbody>`;
      antwortOutput += `</table><br>`;
    }
    antwortOutput += `<table style="border: 1px solid #ccc;white-space:nowrap;background-color:#fff;font-family:courier;width:600px;margin:0 0;margin-bottom:6px;margin-top: 10px;">`;
    antwortOutput += `<tbody>`;
    antwortOutput += `<tr>`;
    antwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">${konto_1}</td>`;
    antwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">${zieleinkaufspreis}</td>`;
    antwortOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 40px" tabindex="1"></td>`;
    antwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px;text-align:right" tabindex="1"></td>`;
    antwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px;text-align:right" tabindex="1"></td>`;
    if (mitBezugskosten.checked) {
      antwortOutput += `</tr>`;
      antwortOutput += `<tr>`;
      antwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">${antwort_bezugskosten} </td>`;
      antwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">${antwort_bezugskostenWert}</td>`;
      antwortOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 40px" tabindex="1"></td>`;
      antwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px;text-align:right" tabindex="1"></td>`;
      antwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px;text-align:right" tabindex="1"></td>`;
    }
    antwortOutput += `</tr>`;
    antwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">2600 VORST</td>`;
    antwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 120px" tabindex="1">${USTWert}</td>`;
    antwortOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 40px" tabindex="1">an</td>`;
    antwortOutput += `<td style="text-align:left;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">${konto_2}</td>`;
    antwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">${betrag_2}</td>`;
    antwortOutput += `</tr>`;
    antwortOutput += `</tbody>`;
    antwortOutput += `</table><br>`;
    if (buchungsoptionDropdown.value === 'skontobuchungssatz') {
      antwortOutput += `<br><b>Nebenrechnung:</b><br>`;
      antwortOutput += `<table style="border-collapse: collapse;white-space:nowrap;width:350px;margin: 0 0">`;
      antwortOutput += `<tbody>`;
      antwortOutput += `<tr>`;
      antwortOutput += `<td>Rechnungsbetrag</td><td style="padding-left:16px;text-align:right;">${betrag_2}</td>`;
      antwortOutput += `<td style="padding-left:6px;text-align:right;">&nbsp;</td>`;
      antwortOutput += `</tr>`;
      antwortOutput += `<tr>`;
      antwortOutput += `<td>- Skonto (brutto)</td><td style="padding-left:16px;text-align:right;">${antwort_skontoBetrag_brutto}</td>`;
      antwortOutput += `<td style="padding-left:6px;text-align:right;">${antwort_skontoSatz} %</td>`;
      antwortOutput += `</tr>`;
      antwortOutput += `<tr border-top: solid 1px #ccc>`;
      antwortOutput += `<td style="border-top: solid 1px #ccc">= Überweisungsbetrag</td>`;
      antwortOutput += `<td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc">${antwort_ueberweisungsbetrag}</td>`;
      antwortOutput += `<td style="padding-left:6px;text-align:right;">&nbsp;</td>`;
      antwortOutput += `</tr>`;
      antwortOutput += `</table>`;
      antwortOutput += `<br>`;
      antwortOutput += `<table style="border-collapse: collapse;white-space:nowrap;width:350px;margin: 0 0">`;
      antwortOutput += `<tbody>`;
      antwortOutput += `<tr>`;
      antwortOutput += `<td>Skonto (brutto)</td><td style="padding-left:16px;text-align:right;">${antwort_skontoBetrag_brutto}</td>`;
      antwortOutput += `<td style="padding-left:6px;text-align:right;">119 %</td>`;
      antwortOutput += `</tr>`;
      antwortOutput += `<tr>`;
      antwortOutput += `<td>- Umsatzsteuer</td><td style="padding-left:16px;text-align:right;">${antwort_vorsteuer_berichtigung}</td>`;
      antwortOutput += `<td style="padding-left:6px;text-align:right;">19 %</td>`;
      antwortOutput += `</tr>`;
      antwortOutput += `<tr border-top: solid 1px #ccc>`;
      antwortOutput += `<td style="border-top: solid 1px #ccc">= Skonto (netto)</td>`;
      antwortOutput += `<td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc">${antwort_skontoBetrag}</td>`;
      antwortOutput += `<td style="padding-left:6px;text-align:right;">100 %</td>`;
      antwortOutput += `</tr>`;
      antwortOutput += `</table>`;
      antwortOutput += `<br>`;
      antwortOutput += `<table style="border: 1px solid #ccc;white-space:nowrap;background-color:#fff;font-family:courier;width:600px;margin:0 0;margin-bottom:6px;">`;
      antwortOutput += `<tbody>`;
      antwortOutput += `<tr>`;
      antwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">4400 VE</td>`;
      antwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">${betrag_2}</td>`;
      antwortOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 40px" tabindex="1">an</td>`;
      antwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px;text-align:left" tabindex="1">2800 BK</td>`;
      antwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px;text-align:right" tabindex="1">${antwort_ueberweisungsbetrag}</td>`;
      antwortOutput += `</tr>`;
      antwortOutput += `<tr>`;
      antwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1"></td>`;
      antwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1"></td>`;
      antwortOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 40px" tabindex="1"></td>`;
      antwortOutput += `<td style="text-align:left;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">${konto_Skontobuchungssatz}</td>`;
      antwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">${antwort_skontoBetrag}</td>`;
      antwortOutput += `</tr>`;
      antwortOutput += `</tr>`;
      antwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1"></td>`;
      antwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1"></td>`;
      antwortOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 40px" tabindex="1"></td>`;
      antwortOutput += `<td style="text-align:left;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">2600 VORST</td>`;
      antwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">${antwort_vorsteuer_berichtigung}</td>`;
      antwortOutput += `</tr>`;
      antwortOutput += `</tbody>`;
      antwortOutput += `</table><br>`;      
    }
    antwortOutput += `</li></div>`;
  if (mitRuecksendung.checked && i > 0 && i < anzahl && konto_2 === "4400 VE" && buchungsoptionDropdown.value === 'buchungssatz') {
    i++;
    antwortOutput += `${parseInt(i)}.`;
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

  // Sätze und Antworten auf der Seite anzeigen
  document.getElementById('einkaufContainer').innerHTML = satzOutput + antwortOutput;
}

// Export

function einkaufHerunterladen() {
  const einkaufHTML = document.getElementById('einkaufContainer').innerHTML;
  const blob = new Blob([einkaufHTML], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'einkauf.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function einkaufKopiereInZwischenablage() {
  const einkaufHTML = document.getElementById('einkaufContainer').innerHTML;
  navigator.clipboard.writeText(einkaufHTML)
    .then(() => alert('Code wurde in die Zwischenablage kopiert'))
    .catch(err => console.error('Fehler beim Kopieren in die Zwischenablage:', err));
}

function einkaufHerunterladenAlsPNG() {
  const einkaufContainer = document.getElementById('einkaufContainer');

  html2canvas(einkaufContainer, optionshtml2canvas).then(canvas => {
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'einkauf.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}

let clipboardeinkauf = new ClipboardJS('#einkaufOfficeButton');

clipboardeinkauf.on('success', function (e) {
  console.log("Die Tabelle wurde in die Zwischenablage kopiert.");
  alert("Die Tabelle wurde in die Zwischenablage kopiert.");
});

clipboardeinkauf.on('error', function (e) {
  console.error("Fehler beim Kopieren der Tabelle: ", e.action);
  alert("Fehler beim Kopieren der Tabelle.");
});


