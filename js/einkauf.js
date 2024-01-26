const anzahlDropdown = document.getElementById('anzahlDropdown');
const mitRabatt = document.getElementById('mitRabatt');
const mitBezugskosten = document.getElementById('mitBezugskosten');
const inputEinkaufskalkulation = document.getElementById('mitEinkaufskalkulation');


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


// Funktion zur Generierung einer Zufallsganzzahl für den Nettowert
function generateRandomNettoWert() {
  return Math.round(Math.random() * 49 + 2) * 100;

}

// Währung nach DIN 5008
function formatCurrency(value) {
  return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

// Kontenplan
const kontenWerkstoffe = {
  "Rohstoffe": {
    "Hauptkonto": "6000 AWR",
    "Unterkonto": "6001 BZKR",
  },
  "Fremdbauteile": {
    "Hauptkonto": "6010 AWF",
    "Unterkonto": "6011 BZKF"
  },
  "Hilfsstoffe": {
    "Hauptkonto": "6020 AWH",
    "Unterkonto": "6021 BZKH",
  },
  "Betriebsstoffe": {
    "Hauptkonto": "6030 AWB",
    "Unterkonto": "6031 BZKB"
  },
};

const kontenWerkstoffe_2 = {
  "von Rohstoffen": {
    "Hauptkonto": "6000 AWR",
    "Unterkonto": "6001 BZKR",
  },
  "von Fremdbauteilen": {
    "Hauptkonto": "6010 AWF",
    "Unterkonto": "6011 BZKF"
  },
  "von Hilfsstoffen": {
    "Hauptkonto": "6020 AWH",
    "Unterkonto": "6021 BZKH",
  },
  "von Betriebsstoffen": {
    "Hauptkonto": "6030 AWB",
    "Unterkonto": "6031 BZKB"
  },
};


let kontenZahlung;
function inputChangeCategory() {
  kontenZahlung = {
    "in bar": "2880 KA",
    "per Barzahlung": "2880 KA",
    "per Banküberweisung": "2800 BK",
    "gegen Rechnung": "4400 VE",
    "mit Erhalt einer Eingangsrechnung": "4400 VE",
    "auf Rechnung": "4400 VE",
    "auf Ziel": "4400 VE",
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
  const array_Subjekt = ['Wir kaufen ', 'Wir beziehen ', 'Unsere Firma kauft ', 'Wir erwerben ', 'Wir haben bezogen: ', 'Wir haben gekauft: '];
  const array_Subjekt_2 = ['Kauf ', 'Einkauf ', 'Erwerb ', 'Beschaffung ', 'Bezug '];
  const array_Subjekt_3 = ['Berechne den Einstandspreis: Wir erhalten ein Angebot für ', 'Berechne den Einstandspreis, wenn wir ein Angebot erhalten für '];
  const array_Subjekt_4 = ['Berechne den Einstandspreis: Unser Lieferant sendet ein Angebot für den Bezug', 'Berechne den Einstandspreis eines Angebots für den Kauf '];
  const array_Werkstoffe = Object.keys(kontenWerkstoffe);
  const array_Werkstoffe_2 = Object.keys(kontenWerkstoffe_2);
  const array_Supply_Wert = ['mit einem Aufwand in Höhe von', 'im Wert von', 'mit', 'mit einem Wert in Höhe von', 'mit einem Betrag in Höhe von', 'mit einem finanziellen Einsatz von', 'im Umfang von'];
  const array_Zahlung = Object.keys(kontenZahlung);
  const array_Supply_Rabatt = [`, abzüglich ${random_Rabatt} % Rabatt`];
  const array_Supply_Rabatt_2 = [
    `. Ausgehandelt wurden zusätzlich ${random_Rabatt} % Treuerabatt`,
    `. ${random_Rabatt} % Sonderrabatt können abgezogen werden`,
    `. ${random_Rabatt} % Rabatt können abgezogen werden`,
    `. Wir erhalten ${random_Rabatt} % Kundenrabatt`,
    `. Wir erhalten ${random_Rabatt} % Rabatt`,
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
    `. Netto ${random_Bezugskosten} an Tansportkosten werden zusätzlich berechnet`,
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
  const nettoOderBrutto = Math.random() < 0.5 ? 'Netto' : 'Brutto';
  const Wert = generateRandomNettoWert();
  const nettoWert = formatCurrency(Wert);
  let bruttoWert = formatCurrency(Math.round(Wert * 0.19 + Wert));
  let randomNettowert;

  // Anzeige wenn Brutto oder Netto
  randomNettowert = nettoOderBrutto === 'Netto' ? `Listenpreis ${nettoWert} netto` : `brutto ${bruttoWert}`;


  const randomZahlung = array_Zahlung[Math.floor(Math.random() * array_Zahlung.length)];
  const antwortZahlung = kontenZahlung[randomZahlung]


  let randomSupply_Rabatt;
  let randomSupply_Rabatt_2;
  let berechnung_nettoWert;

  // Berechnung mit Rabatt
  if (mitRabatt.checked) {
    randomSupply_Rabatt = array_Supply_Rabatt[Math.floor(Math.random() * array_Supply_Rabatt.length)];
    randomSupply_Rabatt_2 = array_Supply_Rabatt_2[Math.floor(Math.random() * array_Supply_Rabatt_2.length)];
    berechnung_nettoWert = parseFloat(nettoWert.replace(/[^\d,-]/g, '')) * (100 - parseFloat(random_Rabatt)) / 100;
  } else {
    random_Rabatt = 0;
    randomSupply_Rabatt = "";
    randomSupply_Rabatt_2 = "";
    berechnung_nettoWert = parseFloat(nettoWert.replace(/[^\d,-]/g, ''));
  }
  let randomSupply_Skonto = array_Supply_Skonto[Math.floor(Math.random() * array_Supply_Skonto.length)];
  let antwortNettowert = formatCurrency(berechnung_nettoWert);
  let berechnung_skontoBetrag = random_Skonto / 100 * berechnung_nettoWert;
  let skontoBetrag = formatCurrency(berechnung_skontoBetrag);
  let berechnung_bareinkaufspreis = berechnung_nettoWert - berechnung_skontoBetrag;
  let bareinkaufspreis = formatCurrency(berechnung_bareinkaufspreis);
  let berechnung_USTWert = berechnung_nettoWert * 0.19;
  let berechnung_bruttoWert = berechnung_nettoWert + (berechnung_USTWert);
  let randomSupply_Bezugskosten;

  // Berechnung mit Bezugskosten
  if (mitBezugskosten.checked) {
    randomSupply_Bezugskosten = array_Supply_Bezugskosten[Math.floor(Math.random() * array_Supply_Bezugskosten.length)];
    berechnung_USTWert = (berechnung_nettoWert + parseFloat(random_Bezugskosten)) * 0.19;
    berechnung_bruttoWert = berechnung_nettoWert + (berechnung_USTWert) + parseFloat(random_Bezugskosten);
    bruttoWert = formatCurrency(Math.round(Wert * 0.19 + Wert) + parseFloat(random_Bezugskosten) * 0.19 + parseFloat(random_Bezugskosten));
  } else {
    random_Bezugskosten = 0;
    randomSupply_Bezugskosten = "";
    berechnung_USTWert = berechnung_USTWert;
  }
  let bezugskostenWert = formatCurrency(random_Bezugskosten);
  let berechnung_rabattWert = parseFloat(nettoWert.replace(/[^\d,-]/g, '')) * random_Rabatt / 100;
  let rabattWert = formatCurrency(berechnung_rabattWert);
  console.log(random_Rabatt);
  console.log(nettoWert);
  let berechnung_einstandspreis = berechnung_bareinkaufspreis + parseFloat(random_Bezugskosten);
  let einstandspreis = formatCurrency(berechnung_einstandspreis);
  let USTWert = formatCurrency(berechnung_USTWert);
  let antwortBruttowert = formatCurrency(berechnung_bruttoWert);

  // Zusammenfügen der ausgewählten Elemente zu einem Satz
  const randomAngebotSatz = Math.random();
  angebotSatz = `<ol style="list-style-type: lower-latin;">`;
  if (randomAngebotSatz < 0.33) {
    angebotSatz += `<li>${randomAngebot} ${randomWerkstoff} ${randomSupply_Wert} ${randomNettowert} ${randomSupply_Rabatt} ${randomSupply_Skonto} ${randomSupply_Bezugskosten}.</li><li>Bilde den Buchungssatz, wenn wir das Angebot akzeptieren. Die Bezahlung erfolgt ${randomZahlung}.</li>`;
  } else if (randomAngebotSatz < 0.66) {
    angebotSatz += `<li>${randomAngebot} ${randomWerkstoff} ${randomSupply_Wert} ${randomNettowert} ${randomSupply_Rabatt_2} ${randomSupply_Skonto} ${randomSupply_Bezugskosten}.</li><li>Bilde den Buchungssatz, wenn wir das Angebot annehmen. Die Abrechnung erfolgt ${randomZahlung}.</li>`;
  } else {
    angebotSatz += `<li>${randomAngebot} ${randomWerkstoff} ${randomSupply_Wert} ${randomNettowert} ${randomSupply_Rabatt_2} ${randomSupply_Skonto} ${randomSupply_Bezugskosten}.</li><li>Wir nehmen das Angebot annehmen an und die Bezahlung wird ${randomZahlung} vorgenommen. Bilde den Buchungssatz!</li>`;
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


  const listeneinkaufspreis = `${nettoWert}`;
  const antwort_rabattWert = `${rabattWert}`;
  const antwort_rabattSatz = `${random_Rabatt}`;
  const antwort_skontoSatz = `${random_Skonto}`;
  const antwort_skontoBetrag = `${skontoBetrag}`;
  const antwort_bareinkaufspreis = `${bareinkaufspreis}`;
  const antwort_einstandspreis = `${einstandspreis}`;
  const konto_1 = `${antwortWerkstoff}`;
  const zieleinkaufspreis = `${antwortNettowert}`;
  const konto_2 = `${antwortZahlung}`;
  const antwort_bezugskosten = `${antwortBezugskosten}`;
  const antwort_bezugskostenWert = `${bezugskostenWert}`;
  const betrag_2 = `${antwortBruttowert}`;

  return [zufaelligerSatz, angebotSatz, listeneinkaufspreis, antwort_rabattWert, antwort_rabattSatz, antwort_skontoSatz, antwort_skontoBetrag, antwort_bareinkaufspreis, antwort_einstandspreis, konto_1, zieleinkaufspreis, antwort_bezugskosten, antwort_bezugskostenWert, USTWert, konto_2, betrag_2];

}


function zeigeZufaelligenSatz() {

  const anzahl = parseInt(anzahlDropdown.value);

  let satzOutput = '<h2>Aufgaben</h2>';
  satzOutput += '<ol>';
  let antwortOutput = `<h2>Lösung</h2>`;
  antwortOutput += '<ol>';

  for (let i = 1; i <= anzahl; i++) {
    const [zufaelligerSatz, angebotSatz, listeneinkaufspreis, antwort_rabattWert, antwort_rabattSatz, antwort_skontoSatz, antwort_skontoBetrag, antwort_bareinkaufspreis, antwort_einstandspreis, konto_1, zieleinkaufspreis, antwort_bezugskosten, antwort_bezugskostenWert, USTWert, konto_2, betrag_2] = erstelleZufallssatz();
    const formattedSatz = zufaelligerSatz.replace(/\s+/g, ' ').replace(/\s(?=[.,;:!])/g, '');
    const formattedAngebot = angebotSatz.replace(/\s+/g, ' ').replace(/\s(?=[.,;:!])/g, '');

    // Generierte Sätze hinzufügen

    satzOutput += `<li>`;
    if (inputEinkaufskalkulation.checked) {
      satzOutput += `<div>${formattedAngebot}</div><br>`;
    } else {
      satzOutput += `${formattedSatz}<br><br>`;
    }
    satzOutput += `</li>`;

    // Generierte Antworten hinzufügen
    antwortOutput += `<li><br>`;
    if (inputEinkaufskalkulation.checked) {
      antwortOutput += `<table style="white-space:nowrap;width:350px;margin: 0 0">`;
      antwortOutput += `<tbody>`;
      antwortOutput += `<tr>`;
      antwortOutput += `<td>Listeneinkaufspreis</td><td style="padding-left:16px;text-align:right;">${listeneinkaufspreis}</td>`;
      antwortOutput += `<td style="padding-left:6px;text-align:right;">&nbsp;</td>`;
      antwortOutput += `</tr>`;
      antwortOutput += `<tr>`;
      antwortOutput += `<td>- Liefererrabatt</td><td style="padding-left:16px;text-align:right;">${antwort_rabattWert}</td>`;
      antwortOutput += `<td style="padding-left:6px;text-align:right;">${antwort_rabattSatz} %</td>`;
      antwortOutput += `</tr>`;
      antwortOutput += `<tr style="border-top: solid 1px #ccc">`;
      antwortOutput += `<td>= Zieleinkaufspreis</td>`;
      antwortOutput += `<td style="padding-left:16px;text-align:right;">${zieleinkaufspreis}</td>`;
      antwortOutput += `<td style="padding-left:6px;text-align:right;">&nbsp;</td>`;
      antwortOutput += `</tr>`;
      antwortOutput += `<tr>`;
      antwortOutput += `<td>- Liefererskonto</td>`;
      antwortOutput += `<td style="padding-left:16px;text-align:right;">${antwort_skontoBetrag}<br></td>`;
      antwortOutput += `<td style="padding-left:6px;text-align:right;">${antwort_skontoSatz} %</td>`;
      antwortOutput += ` </tr>`;
      antwortOutput += `<tr style="border-top: solid 1px #ccc">`;
      antwortOutput += `<td>= Bareinkaufspreis</td>`;
      antwortOutput += `<td style="padding-left:16px;text-align:right;">${antwort_bareinkaufspreis}</td>`;
      antwortOutput += `<td style="padding-left:6px;text-align:right;">&nbsp;</td>`;
      antwortOutput += `</tr>`;
      antwortOutput += `<tr>`;
      antwortOutput += `<td>+ Bezugskosten</td><td style="padding-left:16px;text-align:right;">${antwort_bezugskostenWert}</td>`;
      antwortOutput += `<td style="padding-left:6px;text-align:right;">&nbsp;</td>`;
      antwortOutput += `</tr>`;
      antwortOutput += `<tr style="border-top: solid 1px #ccc">`;
      antwortOutput += `<td>= Einstandspreis</td>`;
      antwortOutput += `<td style="padding-left:16px;text-align:right;">${antwort_einstandspreis}<br></td>`;
      antwortOutput += `<td style="padding-left:6px;text-align:right;">&nbsp;</td>`;
      antwortOutput += `</tr>`;
      antwortOutput += `</tbody>`;
      antwortOutput += `</table><br>`;
    }
    antwortOutput += `<table style="border: 1px solid #000;white-space:nowrap;background-color:#fff;font-family:courier;min-width:550px;margin:0 0;margin-bottom:6px;">`;
    antwortOutput += `<tbody>`;
    antwortOutput += `<tr>`;
    antwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px" tabindex="1">${konto_1}</td>`;
    antwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1">${zieleinkaufspreis}</td>`;
    antwortOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 50px" tabindex="1"></td>`;
    antwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px;text-align:right" tabindex="1"></td>`;
    antwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px;text-align:right" tabindex="1"></td>`;
    if (mitBezugskosten.checked) {
      antwortOutput += `</tr>`;
      antwortOutput += `<tr>`;
      antwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px" tabindex="1">${antwort_bezugskosten} </td>`;
      antwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1">${antwort_bezugskostenWert}</td>`;
      antwortOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 50px" tabindex="1"></td>`;
      antwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px;text-align:right" tabindex="1"></td>`;
      antwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px;text-align:right" tabindex="1"></td>`;
    }
    antwortOutput += `</tr>`;
    antwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px" tabindex="1">2600 VORST</td>`;
    antwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1">${USTWert}</td>`;
    antwortOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 50px" tabindex="1">an</td>`;
    antwortOutput += `<td style="text-align:left;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1">${konto_2}</td>`;
    antwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1">${betrag_2}</td>`;
    antwortOutput += `</tr>`;
    antwortOutput += `</tbody>`;
    antwortOutput += `</table>`;
    antwortOutput += `</li>`;
  }

  satzOutput += '</ol>'; // Ende der nummerierten Liste für Sätze
  antwortOutput += '</ol>'; // Ende der nummerierten Liste für Antworten

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

  html2canvas(einkaufContainer).then(canvas => {
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'einkauf.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}

let clipboardeinkauf = new ClipboardJS('#officeButtoneinkauf');

clipboardeinkauf.on('success', function (e) {
  console.log("Die Tabelle wurde in die Zwischenablage kopiert.");
  alert("Die Tabelle wurde in die Zwischenablage kopiert.");
});

clipboardeinkauf.on('error', function (e) {
  console.error("Fehler beim Kopieren der Tabelle: ", e.action);
  alert("Fehler beim Kopieren der Tabelle.");
});


