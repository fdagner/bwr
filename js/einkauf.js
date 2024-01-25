const inputWerkstoffe = document.getElementById('inputWerkstoffe');
const inputSachanlagen = document.getElementById('inputSachanlagen');

// Funktion zum Generieren einer zufälligen Zahl
function generateRandomAnzahl() {
  const randomNumber = getRandomIntegerWithSteps(2, 10, 1);
  return randomNumber;
}

// Paare von Elementen und den entsprechenden kontenWerkstoffe
const kontenWerkstoffe = {
  "Rohstoffe": "6000 AWR",
  "Fremdbauteile": "6010 AWF",
  "Hilfsstoffe": "6020 AWH",
  "Betriebsstoffe": "6030 AWB" 
  // ... füge weitere Paare hinzu, wenn nötig
};

const kontenWerkstoffe_2 = {
  "von Rohstoffen": "6000 AWR",
  "von Fremdbauteilen": "6010 AWF",
  "von Hilfsstoffen": "6020 AWH",
  "von Betriebsstoffen": "6030 AWB"
  // ... füge weitere Paare hinzu, wenn nötig
};

const kontenSachanlagen = {

  "einen Computer": "0700 MA",
  "einen PC": "0860 BM",
  "einen Laptop": "0860 BM",
  "eine Fertigungsmaschine": "0700 MA",
  "Büromöbel": "0870 BGA",
  "einen Gabelstapler": "0840 FP",
  "einen Kommissionierroboter": "0700 MA",
  "eine Prüf- und Inspektionsanlage": "0700 MA",
  "einen Büro-3D-Drucker": "0860 BM",
  "einen gebrauchten Kleintransporter": "0840 FP",
  [`${generateRandomAnzahl()} Büroregalen`]: "0870 BGA",
  "einen Aktenschrank": "0870 BGA",
  [`${generateRandomAnzahl()} Netzwerkserver`]: "0860 BM",
  [`${generateRandomAnzahl()} Kopierer`]: "0860 BM",
  "eine Maschine": "0700 MA",
  "eine Produktionsmaschine": "0700 MA",
  "eine Fertigungsanlage": "0700 MA",
};

const kontenSachanlagen_2 = {

  "eines Computers": "0700 MA",
  "eines PC": "0860 BM",
  "eines Laptops": "0860 BM",
  "einer Fertigungsmaschine": "0700 MA",
  "von Büromöbeln": "0870 BGA",
  "eines Gabelstaplers": "0840 FP",
  "eines Kommissionierroboters": "0700 MA",
  "einer Prüf- und Inspektionsanlage": "0700 MA",
  "eines Büro-3D-Druckers": "0860 BM",
  "eines gebrauchten Kleintransporters": "0840 FP",
  [`von ${generateRandomAnzahl()} Büroregalen`]: "0870 BGA",
  "eines Aktenschranks": "0870 BGA",
  [`von ${generateRandomAnzahl()} Netzwerkservern`]: "0860 BM",
  [`von ${generateRandomAnzahl()} Kopierern`]: "0860 BM",
  "einer Maschine": "0700 MA",
  "einer Produktionsmaschine": "0700 MA",
  "einer Fertigungsanlage": "0700 MA",
};

let kontenZahlung;
function inputChangeCategory()
{
if (inputWerkstoffe.checked) {
  kontenZahlung = {
    "in bar": "2880 KA",
    "per Barzahlung": "2880 KA",
    "per Banküberweisung": "2800 BK",
    "gegen Rechnung": "4400 VE",
    "nebst Erhalt einer Eingangsrechnung": "4400 VE",
    "auf Rechnung": "4400 VE",
    "auf Ziel": "4400 VE",
  }
} else if (inputSachanlagen.checked) {
  kontenZahlung = {
    "per Banküberweisung": "2800 BK",
    "gegen Rechnung": "4400 VE",
    "nebst Erhalt einer Eingangsrechnung": "4400 VE",
    "auf Rechnung": "4400 VE",
    "auf Ziel": "4400 VE",
  }
}
}



// Funktion zur Generierung einer Zufallsganzzahl zwischen 100 und 5000 (gerundet auf hunderte Stellen)
function generateRandomNettoWert() {
  if (inputWerkstoffe.checked) {
    return Math.round(Math.random() * 49 + 2) * 100; // 2 to 50 times 100 (to round to the nearest hundred)
  } else if (inputSachanlagen.checked) {
    return Math.round(Math.random() * 99 + 20) * 100; // 10 to 300 times 100 (to round to the nearest hundred)
  }
  // Fallback-Wert, falls keine Checkbox ausgewählt ist
  return 0;
}


function getRandomIntegerWithSteps(min, max, step) {
  const range = (max - min) / step;
  return Math.floor(Math.random() * range) * step + min;
}

function getRandomRabatt() {
  return getRandomIntegerWithSteps(5, 20, 5);
}

function formatCurrency(value) {
  return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}
function erstelleZufallssatz() {
  inputChangeCategory();
  const array_Rabatt = getRandomRabatt();
// Arrays mit verschiedenen Teilen des Satzes
const array_Subjekt = ['Wir kaufen ', 'Wir beziehen ', 'Unsere Firma kauft ', 'Wir erwerben ', 'Wir haben bezogen: ', 'Wir haben gekauft: '];
const array_Subjekt_2 = ['Kauf ', 'Einkauf ', 'Erwerb ', 'Beschaffung ', 'Bezug '];
const array_Werkstoffe = Object.keys(kontenWerkstoffe);
const array_Werkstoffe_2 = Object.keys(kontenWerkstoffe_2);
const array_Sachanlagen = Object.keys(kontenSachanlagen);
const array_Sachanlagen_2 = Object.keys(kontenSachanlagen_2);
const array_Formulierung_Wert = ['mit einem Aufwand in Höhe von', 'im Wert von', 'mit', 'mit einem Wert in Höhe von', 'mit einem Betrag in Höhe von', 'mit einem finanziellen Einsatz von', 'im Umfang von'];
const array_Zahlung = Object.keys(kontenZahlung);
const array_Formulierung_Rabatt = [`, abzüglich ${array_Rabatt} % Rabatt`];
const array_Formulierung_Rabatt_2 = [
  `. Ausgehandelt wurde zusätzlich ${array_Rabatt} % Treuerabatt`,
  `. ${array_Rabatt} % Sonderrabatt können abgezogen werden`,
  `. ${array_Rabatt} % Rabatt können abgezogen werden`,
  `. Wir erhalten ${array_Rabatt} % Kundenrabatt`,
  `. Wir erhalten ${array_Rabatt} % Rabatt`,
];

// Funktion zum Erstellen eines zufälligen Satzes

  // Zufällige Auswahl der Elemente und der alternativen Arrays
  const selectedarray_Subjekt = Math.random() < 0.5 ? array_Subjekt : array_Subjekt_2;
  const selectedarray_Werkstoffe = selectedarray_Subjekt === array_Subjekt_2 ? array_Werkstoffe_2 : array_Werkstoffe;
  const selectedarray_Sachanlagen = selectedarray_Subjekt === array_Subjekt_2 ? array_Sachanlagen_2 : array_Sachanlagen;

  // Zufällige Auswahl der Elemente aus den ausgewählten Arrays
  const zufaelligesSubjekt = selectedarray_Subjekt[Math.floor(Math.random() * selectedarray_Subjekt.length)];
  const zufaelligesWerkstoff = selectedarray_Werkstoffe[Math.floor(Math.random() * selectedarray_Werkstoffe.length)];
  const zufaelligesSachanlagen = selectedarray_Sachanlagen[Math.floor(Math.random() * selectedarray_Sachanlagen.length)];
  const zufaelligesFormulierung_Wert = array_Formulierung_Wert[Math.floor(Math.random() * array_Formulierung_Wert.length)];
  const antwortWerkstoff = kontenWerkstoffe[zufaelligesWerkstoff] || kontenWerkstoffe_2[zufaelligesWerkstoff];
  const antwortSachanlagen = kontenSachanlagen[zufaelligesSachanlagen] || kontenSachanlagen_2[zufaelligesSachanlagen];
  const nettoOderBrutto = Math.random() < 0.5 ? 'Netto' : 'Brutto';
  const Wert = generateRandomNettoWert();
  const nettoWert = formatCurrency(Wert);
  const bruttoWert = formatCurrency(Math.round(Wert * 0.19 + Wert));
  let zufaelligesNettowert;
  if (inputWerkstoffe.checked) {
    zufaelligesNettowert = nettoOderBrutto === 'Netto' ? `Listenpreis ${nettoWert} netto` : `brutto ${bruttoWert}`;
  } else {
    zufaelligesNettowert = nettoOderBrutto === 'Netto' ? `${nettoWert} netto` : `brutto ${bruttoWert}`;
  }

  const zufaelligesZahlung = array_Zahlung[Math.floor(Math.random() * array_Zahlung.length)];
  const antwortZahlung = kontenZahlung[zufaelligesZahlung]

  let zufaelligesRabatt;
  let zufaelligesFormulierung_Rabatt;
  let zufaelligesFormulierung_Rabatt_2;
  let berechnung_nettoWert;
   const mitRabatt = document.getElementById('mitRabatt');
  if (mitRabatt.checked) {
    zufaelligesRabatt = array_Rabatt;
    zufaelligesFormulierung_Rabatt = array_Formulierung_Rabatt[Math.floor(Math.random() * array_Formulierung_Rabatt.length)];
    zufaelligesFormulierung_Rabatt_2 = array_Formulierung_Rabatt_2[Math.floor(Math.random() * array_Formulierung_Rabatt_2.length)];
    berechnung_nettoWert = parseFloat(nettoWert.replace(/[^\d,-]/g, '')) * (100 - parseFloat(zufaelligesRabatt)) / 100;
  } else {
    zufaelligesRabatt = "";
    zufaelligesFormulierung_Rabatt = "";
    zufaelligesFormulierung_Rabatt_2 = "";
    berechnung_nettoWert = parseFloat(nettoWert.replace(/[^\d,-]/g, ''));
  }

  let antwort_nettoWert = formatCurrency(berechnung_nettoWert);
  let berechnung_USTWert = berechnung_nettoWert * 0.19;
  let USTWert = formatCurrency(berechnung_USTWert);
  let berechnung_bruttoWert = berechnung_nettoWert + (berechnung_USTWert);
  let antwort_bruttoWert = formatCurrency(berechnung_bruttoWert);

  // Zusammenfügen der ausgewählten Elemente zu einem Satz
  const randomValue = Math.random();
  let zufaelligerSatz;

  if (inputWerkstoffe.checked) {
    if (randomValue < 0.33) {
      zufaelligerSatz = `${zufaelligesSubjekt} ${zufaelligesWerkstoff} ${zufaelligesZahlung} ${zufaelligesFormulierung_Wert} ${zufaelligesNettowert} ${zufaelligesFormulierung_Rabatt}.`;
    } else if (randomValue < 0.66) {
      zufaelligerSatz = `${zufaelligesSubjekt} ${zufaelligesWerkstoff} ${zufaelligesFormulierung_Wert} ${zufaelligesNettowert} ${zufaelligesZahlung} ${zufaelligesFormulierung_Rabatt_2}.`;
    } else {
      zufaelligerSatz = `${zufaelligesSubjekt} ${zufaelligesWerkstoff} ${zufaelligesZahlung} ${zufaelligesFormulierung_Wert} ${zufaelligesNettowert} ${zufaelligesFormulierung_Rabatt_2}.`;
    } const antwort_1 = `${antwortWerkstoff}`;
    const wert_1 = `${antwort_nettoWert}`;
    const antwort_2 = `${antwortZahlung}`;
    const wert_2 =  `${antwort_bruttoWert}`;

    return [zufaelligerSatz, antwort_1, wert_1, USTWert, antwort_2, wert_2];
  } else if (inputSachanlagen.checked) {
    if (randomValue < 0.33) {
      zufaelligerSatz = `${zufaelligesSubjekt} ${zufaelligesSachanlagen} ${zufaelligesZahlung} ${zufaelligesFormulierung_Wert} ${zufaelligesNettowert} ${zufaelligesFormulierung_Rabatt}.`;
    } else if (randomValue < 0.66) {
      zufaelligerSatz = `${zufaelligesSubjekt} ${zufaelligesSachanlagen} ${zufaelligesFormulierung_Wert} ${zufaelligesNettowert} ${zufaelligesZahlung} ${zufaelligesFormulierung_Rabatt_2}.`;
    } else {
      zufaelligerSatz = `${zufaelligesSubjekt} ${zufaelligesSachanlagen} ${zufaelligesZahlung} ${zufaelligesFormulierung_Wert} ${zufaelligesNettowert} ${zufaelligesFormulierung_Rabatt_2}.`;
    } const antwort_1 = `${antwortSachanlagen}`;
    const wert_1 = `${antwort_nettoWert}`;
    const antwort_2 = `${antwortZahlung}`;
    const wert_2 =  `${antwort_bruttoWert}`;

    return [zufaelligerSatz, antwort_1, wert_1, USTWert, antwort_2, wert_2];
  }

}


function zeigeZufaelligenSatz() {
  const anzahlDropdown = document.getElementById('anzahlDropdown');
  const anzahl = parseInt(anzahlDropdown.value);

  let satzOutput = '<h2>Aufgaben</h2>'; // Start der nummerierten Liste
  satzOutput += '<ol>'; // Start der nummerierten Liste
  let antwortOutput = `<h2>Lösung:</h2>`;
  antwortOutput += '<ol>'; // Start der nummerierten Liste für Antworten

  for (let i = 1; i <= anzahl; i++) {
    const [zufaelligerSatz, antwort_1, wert_1, USTWert, antwort_2, wert_2] = erstelleZufallssatz();
    const formattedSatz = zufaelligerSatz.replace(/\s+/g, ' ').replace(/\s(?=[.,;:!])/g, '');

    // Generierte Sätze hinzufügen
    satzOutput += `<li>${formattedSatz}</li>`;

    // Generierte Antworten hinzufügen
    antwortOutput += `<li>`;
    antwortOutput += `<table style="border: 1px solid #000;white-space:nowrap;background-color:#fff;font-family:courier;min-width:550px;margin-bottom:6px;">`;
    antwortOutput += `<tbody>`;
    antwortOutput += `<tr>`;
    antwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px" tabindex="1">${antwort_1} </td>`;
    antwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1">${wert_1}</td>`;
    antwortOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 50px" tabindex="1"></td>`;
    antwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px;text-align:right" tabindex="1"></td>`;
    antwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px;text-align:right" tabindex="1"></td>`;
   
    antwortOutput += `</tr>`;
    antwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px" tabindex="1">2600 VORST</td>`;
    antwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1">${USTWert}</td>`;
    antwortOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 50px" tabindex="1">an</td>`;
    antwortOutput += `<td style="text-align:left;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1">${antwort_2}</td>`;
    antwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1">${wert_2}</td>`;
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


