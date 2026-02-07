// Convert the YAML string into a JavaScript object
const parsedData = jsyaml.load(kontoAuswahlYAML);

// Select the container for the checkboxes
const kontoAuswahlContainer = document.getElementById('kontoAuswahlContainer');

// Hilfsfunktion: Kontenklasse anhand erster Ziffer ermitteln
function getKlassenName(kontonummer) {
    const ersteZiffer = kontonummer.charAt(0);
    const klassen = {
        '0': 'Klasse 0 – Anlagevermögen',
        '1': 'Klasse 1 – Umlaufvermögen und ARA',
        '2': 'Klasse 2 – Finanzanlagen',
        '3': 'Klasse 3 – Eigenkapital & Rückstellungen',
        '4': 'Klasse 4 – Verbindlichkeiten und PRA',
        '5': 'Klasse 5 – Erträge',
        '6': 'Klasse 6 – Betriebliche Aufwanden',
        '7': 'Klasse 7 – Weitere Aufwendungen',
        '8': 'Klasse 8 – Ergebnisrechnungen',
        '9': 'Klasse 9 – Kosten- und Leistungsrechnung'
    };
    return klassen[ersteZiffer] || 'Sonstige Konten';
}

// Konten nach Klassen gruppieren
const gruppen = {};
parsedData.konten.forEach(konto => {
    const klasse = getKlassenName(konto.value_number);
    if (!gruppen[klasse]) {
        gruppen[klasse] = [];
    }
    gruppen[klasse].push(konto);
});

// Sortierte Reihenfolge der Klassen (0 → 9)
const sortierteKlassen = Object.keys(gruppen).sort((a, b) => {
    const nrA = a.match(/\d+/) ? parseInt(a.match(/\d+/)[0]) : 99;
    const nrB = b.match(/\d+/) ? parseInt(b.match(/\d+/)[0]) : 99;
    return nrA - nrB;
});

// HTML-Ausgabe erzeugen
// ... (der obere Teil mit Gruppierung bleibt gleich)

// HTML-Ausgabe erzeugen
sortierteKlassen.forEach(klasse => {
    // Ganzer Block pro Klasse
    const gruppenDiv = document.createElement('div');
    gruppenDiv.className = 'konto-gruppe';

    // Überschrift (jetzt allein in der Zeile)
    const ueberschrift = document.createElement('h4');
    ueberschrift.textContent = klasse;
    gruppenDiv.appendChild(ueberschrift);

    // Container für die Checkboxen dieser Klasse
    const flexRow = document.createElement('div');
    flexRow.className = 'flex-row';

    gruppen[klasse]
        .sort((a, b) => a.value_number.localeCompare(b.value_number, undefined, { numeric: true }))
        .forEach(konto => {
            const divContainer = document.createElement('div');
            divContainer.classList.add('radioKonto');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = konto.value_number + ' ' + konto.value_account;
            checkbox.id = 'konto_' + konto.value_number;

            const label = document.createElement('label');
            label.htmlFor = checkbox.id;
            label.textContent = konto.value_number + ' ' + konto.value_account;  
            // ↑ Hier kannst du auch konto.label nehmen, wenn du die längeren Texte willst

            divContainer.appendChild(checkbox);
            divContainer.appendChild(label);
            flexRow.appendChild(divContainer);
        });

    gruppenDiv.appendChild(flexRow);
    kontoAuswahlContainer.appendChild(gruppenDiv);
});
function generiereTKonto() {
  const anzahlZeilen = document.getElementById('anzahlZeilen').value;
  const summenzeileCheckbox = document.getElementById('summenzeileCheckbox');
  const Container = document.getElementById('Container');
  const buttonContainer = document.getElementById('buttonContainer');

  // Sammle die ausgewählten Konten
  const ausgewaehlteKonten = Array.from(document.querySelectorAll('[id^="konto_"]:checked'))
    .map(checkbox => checkbox.value);

  // Überprüfe, ob Konten ausgewählt wurden
  if (ausgewaehlteKonten.length === 0) {
    alert('Bitte wählen Sie mindestens ein Konto aus.');
    return; // Beende die Funktion, wenn keine Konten ausgewählt wurden
  }

  // Erstelle für jedes ausgewählte Konto ein T-Konto
  let tkontoHTML = '<div style="width:100%;display:flex;flex-direction:row;flex-wrap:wrap;gap:12px">';
  ausgewaehlteKonten.forEach(kontoAuswahl => {
    // Extrahiere die erste Ziffer aus der Kontonummer
    const ersteZiffer = kontoAuswahl.charAt(0);

    const abKonten = document.getElementById('abKonten');
    let abSollWert;
    let abHabenWert;
    let randomZahlWertKonto;
    let randomZahlWertHaben;
    if (abKonten.checked) {
    // Setze den Wert für AB basierend auf der ersten Ziffer
    abSollWert = (ersteZiffer === '0' || ersteZiffer === '1' || ersteZiffer === '2') ? 'AB' : '';
    abHabenWert = (ersteZiffer === '3' || ersteZiffer === '4') ? 'AB' : '';
    let randomZahlWert = '';
    // Setze den Wert für die Zufallszahl basierend auf der ersten Ziffer
    if (ersteZiffer === '0') {
      // Bereich von 100000 bis 5000000
      randomZahlWert = Math.floor(Math.random() * (5000000 - 100000 + 1)) + 100000;
    } else if (ersteZiffer === '1' || ersteZiffer === '2') {
      // Bereich von 5000 bis 50000
      randomZahlWert = Math.floor(Math.random() * (50000 - 5000 + 1)) + 5000;
    }

    const randomZahlWertH = (ersteZiffer === '3' || ersteZiffer === '4') ?
      Math.floor(Math.random() * (100000 - 10000 + 1)) + 1000 : '';

    // Währung nach DIN 5008
    function formatCurrencyKonto(value) {
      return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
    } 
      randomZahlWertKonto = formatCurrencyKonto(randomZahlWert);
      randomZahlWertHaben = formatCurrencyKonto(randomZahlWertH);
    } else {
      abSollWert = "";
      abHabenWert = "";
      randomZahlWertKonto = "";
      randomZahlWertHaben = "";
    }

    tkontoHTML += '<table style="margin: 0 auto;border-collapse: collapse;width:650px;background-color:#fff"><tbody><tr><th style="width:25%;text-align:left" >Soll</th><th style="text-align:center;" colspan="2" >' + kontoAuswahl + '</th><th style="width:25%;text-align:right;" >Haben</th></tr>';

    tkontoHTML += '<tr style="border-top: 2px solid #AAAAAA">' +
      `<td style="border-top: 2px solid #AAAAAA;width:25%; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; max-width: 160px">${abSollWert}&nbsp;</td>` +
      `<td style="border-top: 2px solid #AAAAAA;border-right: 2px solid #AAAAAA;width:25%; text-align:right; padding-right: 2px; height: 2em; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; max-width: 160px">${randomZahlWertKonto}&nbsp;</td>` +
      `<td style="border-top: 2px solid #AAAAAA;width:25%; border-left: 1px solid #AAAAAA; padding-left: 2px; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; max-width: 160px">${abHabenWert}&nbsp;</td>` +
      `<td style="border-top: 2px solid #AAAAAA;width:25%; text-align:right; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; max-width: 160px">${randomZahlWertHaben}&nbsp; </td>` +
      '</tr>';

    for (let i = 1; i < anzahlZeilen; i++) {
      tkontoHTML += '<tr style="border-top: 2px solid #AAAAAA">' +
        '<td style="border-top: 2px solid #AAAAAA;width:25%; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; max-width: 160px" ></td>' +
        `<td style="border-top: 2px solid #AAAAAA;border-right: 2px solid #AAAAAA;width:25%; text-align:right; padding-right: 2px; height: 2em; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; max-width: 160px">&nbsp; </td>` +
        '<td style="border-top: 2px solid #AAAAAA;width:25%; border-left: 1px solid #AAAAAA; padding-left: 2px; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; max-width: 160px">&nbsp; </td>' +
        '<td style="border-top: 2px solid #AAAAAA;width:25%; text-align:right; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; max-width: 160px">&nbsp; </td>' +
        '</tr>';
    }

    if (summenzeileCheckbox.checked) {
      tkontoHTML += '<tr style="border-bottom: 6px double #AAAAAA; border-top: 3px solid #AAAAAA;">' +
        '<td style="border-top: 2px solid #AAAAAA;width:25%; height: 2em; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; max-width: 160px" ></td>' +
        `<td style="border-top: 2px solid #AAAAAA;border-right: 2px solid #AAAAAA;width:25%; text-align:right; padding-right: 2px; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; max-width: 160px">&nbsp; </td>` +
        '<td style="border-top: 2px solid #AAAAAA;width:25%; border-left: 1px solid #AAAAAA; padding-left: 2px; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; max-width: 160px">&nbsp; </td>' +
        '<td style="border-top: 2px solid #AAAAAA;width:25%; text-align:right; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; max-width: 160px">&nbsp; </td>' +
        '</tr>';
    }

    tkontoHTML += '</tbody></table><br>';
  });
  tkontoHTML += '<div>';
  Container.innerHTML = tkontoHTML;

  // Display the buttons after generation
  buttonContainer.style.display = 'block';
}

