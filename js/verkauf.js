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
  // Generiere eine zufällige Ganzzahl zwischen 0 und 20 in 1er-Schritten
  return Math.floor(Math.random() * 21);
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
      "in bar": "2880 KA",
      "per Barzahlung": "2880 KA",
      "per Banküberweisung": "2800 BK",
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
  const verkaufArray_Subjekt = ['Wir verkaufen ', 'Wir liefern ', 'Unsere Firma verkauft ', 'Wir veräußern ', 'Wir haben verkauft: '];
  const verkaufArray_Subjekt_2 = ['Verkauf '];
  const verkaufArray_Subjekt_3 = ['Ein Kunde bittet um ein Angebot für Fertigerzeugnisse. Berechne den Listenverkaufspreis unter den folgenden Bedingungen: ', 'Wir erhalten eine Anfrage für ein Angebot per E-Mail. Du sollst nun den Listenverkaufspreis berechnen, wenn wir mit den folgenden Werten kalkulieren: '];
  const verkaufArray_Subjekt_4 = ['Uns erreicht eine telefonische Anfrage für den Kauf von Fertigerzeugnissen. Berechne den Listenverkaufspreis bei', 'Wir erhalten eine Kundenanfrage per Mail. Berechne den Listenverkaufspreis bei '];
  const verkaufArray_Subjekt_5 = [`Unser Kunde bezahlt die Rechnung per Banküberweisung innerhalb der Skontofrist mit ${verkaufRandom_Skonto} % Skonto`, `Die Rechnung wird mit ${verkaufRandom_Skonto} % Skonto per Banküberweisung ausgeglichen`, `Der Rechnungsausgleich erfolgt mit ${verkaufRandom_Skonto} % Skonto per Bank`,];
  const verkaufArray_Subjekt_6 = [`Ein Kunde verhandelt mit uns über den Kauf von Fertigerzeugnissen`, 'Wir erhalten von einem Kunden eine Anfrage für Fertigerzeugnisse', 'Ein Kunde sendet uns per E-Mail eine Anfrage für den Bezug von Fertigerzeugnissen', 'Ein Stammkunde möchte bei uns Fertigerzeugnisse kaufen und sendet eine Anfrage'];
  const verkaufArray_Fertigerzeugnisse = Object.keys(kontenUmsatzserloese);
  const verkaufArray_Fertigerzeugnisse_2 = Object.keys(kontenUmsatzerloese_2);
  const verkaufArray_Supply_Wert = ['mit einem Verkaufspreis in Höhe von', 'im Wert von', 'mit', 'mit einem Wert in Höhe von', 'mit einem Betrag in Höhe von', 'im Umfang von'];
  const verkaufArray_Zahlung = Object.keys(verkaufKontenZahlung);
  const verkaufArray_Supply_Rabatt = [`, ${verkaufRandom_Rabatt} % Rabatt`];
  const verkaufArray_Supply_Rabatt_2 = [
    `. Wir bieten ${verkaufRandom_Rabatt} % Treuerabatt`,
    `. Wir bieten ${verkaufRandom_Rabatt} % Mengenrabatt`,
    `. ${verkaufRandom_Rabatt} % Sonderrabatt werden von uns angeboten`,
    `. ${verkaufRandom_Rabatt} % Rabatt können vom Kunden abgezogen werden`,
    `. Wir gewähren zudem ${verkaufRandom_Rabatt} % Kundenrabatt`,
    `. Wir gewähren zudem ${verkaufRandom_Rabatt} % Mengenrabatt`,
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
    `. Zusätzlich belasten wir den Kunden mit Versandkosten von netto ${verkaufRandom_Bezugskosten}`,
    `. Zusätzlich berechnen wir Verpackungskosten in Höhe von ${verkaufRandom_Bezugskosten} netto`,
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
  const verkaufNettoOderBrutto = Math.random() < 0.5 ? 'Netto' : 'Brutto';
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
    verkaufRandom_Gewinn = parseFloat(verkaufRandom_Gewinn) - parseFloat(verkaufWunschRandom_Gewinn);
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

    // Generierte Antworten hinzufügen
    verkaufAntwortOutput += `${parseInt(i)}.<br><br>`;
    if (verkaufBuchungsoptionDropdown.value === 'verkaufskalkulation' || verkaufBuchungsoptionDropdown.value === 'verkaufDifferenzkalkulation') {
      verkaufAntwortOutput += `<table style="border-collapse: collapse;white-space:nowrap;width:350px;margin: 0 0">`;
      verkaufAntwortOutput += `<tbody>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td>Selbstkostenpreis</td><td style="padding-left:16px;text-align:right;">${verkaufAntwort_Selbstkostenpreis}</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">&nbsp;</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td>+ Gewinn</td><td style="padding-left:16px;text-align:right;">${verkaufAntwort_GewinnWert}</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">${verkaufAntwort_GewinnSatz} %`;
      if (verkaufBuchungsoptionDropdown.value === 'verkaufDifferenzkalkulation') {
        verkaufAntwortOutput += ` (${verkaufAntwort_Gewinn_berechnet} %);`;
      }
      verkaufAntwortOutput += `</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td style="border-top: solid 1px #ccc">= Barverkaufspreis</td>`;
      verkaufAntwortOutput += `<td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc"">${verkaufAntwort_barverkaufspreis}</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">&nbsp;</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td>+ Kundenkonto</td>`;
      verkaufAntwortOutput += `<td style="padding-left:16px;text-align:right;">${verkaufAntwort_skontoBetrag}<br></td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">${verkaufAntwort_skontoSatz} %</td>`;
      verkaufAntwortOutput += ` </tr>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td style="border-top: solid 1px #ccc">= Zielverkaufspreis</td>`;
      verkaufAntwortOutput += `<td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc">${Zielverkaufspreis}</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">&nbsp;</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td>+ Kundenrabatt</td><td style="padding-left:16px;text-align:right;">${verkaufAntwort_rabattWert}</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">${verkaufAntwort_rabattSatz} %</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td style="border-top: solid 1px #ccc">= Listenverkaufspreis</td>`;
      verkaufAntwortOutput += `<td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc">${verkaufListenverkaufspreis}</td>`;
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
      verkaufAntwortOutput += `<table style="border: 1px solid #ccc;white-space:nowrap;background-color:#fff;font-family:courier;min-width:500px;margin:0 0;margin-bottom:6px;">`;
      verkaufAntwortOutput += `<tbody>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px" tabindex="1">${verkaufKonto_2}</td>`;
      verkaufAntwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1">${verkaufBetrag_2}</td>`;
      verkaufAntwortOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 50px" tabindex="1">an</td>`;
      verkaufAntwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px;text-align:left" tabindex="1">${verkaufKonto_1}</td>`;
      verkaufAntwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px;text-align:right" tabindex="1">${Zielverkaufspreis}</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px" tabindex="1"></td>`;
      verkaufAntwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1"></td>`;
      verkaufAntwortOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 50px" tabindex="1"></td>`;
      verkaufAntwortOutput += `<td style="text-align:left;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1">4800 UST</td>`;
      verkaufAntwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1">${verkaufUSTWert}</td>`;
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
      verkaufAntwortOutput += `<table style="border: 1px solid #ccc;white-space:nowrap;background-color:#fff;font-family:courier;min-width:500px;margin:0 0;margin-bottom:6px;">`;
      verkaufAntwortOutput += `<tbody>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px" tabindex="1">2800 BK</td>`;
      verkaufAntwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1">${verkaufAntwort_ueberweisungsbetrag}</td>`;
      verkaufAntwortOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 50px" tabindex="1">an</td>`;
      verkaufAntwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px;text-align:left" tabindex="1">2400 FO</td>`;
      verkaufAntwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px;text-align:right" tabindex="1">${verkaufBetrag_2}</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px" tabindex="1">${verkaufKonto_Skontobuchungssatz}</td>`;
      verkaufAntwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1">${verkaufAntwort_skontoBetrag}</td>`;
      verkaufAntwortOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 50px" tabindex="1"></td>`;
      verkaufAntwortOutput += `<td style="text-align:left;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1"></td>`;
      verkaufAntwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1"></td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px" tabindex="1">4800 UST</td>`;
      verkaufAntwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1">${verkaufAntwort_vorsteuer_berichtigung}</td>`;
      verkaufAntwortOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 50px" tabindex="1"></td>`;
      verkaufAntwortOutput += `<td style="text-align:left;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1"></td>`;
      verkaufAntwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1"></td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `</tbody>`;
      verkaufAntwortOutput += `</table>`;
      verkaufAntwortOutput += `<br>`;
    }
    verkaufAntwortOutput += `<br>`;
  }


  verkaufSatzOutput += '</ol>'; // Ende der nummerierten Liste für Sätze


  // Sätze und Antworten auf der Seite anzeigen
  document.getElementById('verkaufContainer').innerHTML = verkaufSatzOutput + verkaufAntwortOutput;
}

// Export

function verkaufHerunterladen() {
  const einkaufHTML = document.getElementById('verkaufContainer').innerHTML;
  const blob = new Blob([einkaufHTML], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'verkauf.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function verkaufKopiereInZwischenablage() {
  const einkaufHTML = document.getElementById('verkaufContainer').innerHTML;
  navigator.clipboard.writeText(einkaufHTML)
    .then(() => alert('Code wurde in die Zwischenablage kopiert'))
    .catch(err => console.error('Fehler beim Kopieren in die Zwischenablage:', err));
}

function verkaufHerunterladenAlsPNG() {
  const verkaufContainer = document.getElementById('verkaufContainer');

  html2canvas(verkaufContainer).then(canvas => {
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'einkauf.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}

let clipboardverkauf = new ClipboardJS('#verkaufOfficeButton');

clipboardverkauf.on('success', function (e) {
  console.log("Die Tabelle wurde in die Zwischenablage kopiert.");
  alert("Die Tabelle wurde in die Zwischenablage kopiert.");
});

clipboardverkauf.on('error', function (e) {
  console.error("Fehler beim Kopieren der Tabelle: ", e.action);
  alert("Fehler beim Kopieren der Tabelle.");
});


