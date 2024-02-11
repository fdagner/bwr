// Convert the YAML string into a JavaScript object
const parsedData = jsyaml.load(kontoAuswahlYAML);

// Select the container for the checkboxes
const kontoAuswahlContainer = document.getElementById('kontoAuswahlContainer');


// Fill the container with checkboxes for the accounts from the YAML file
parsedData.konten.forEach(konto => {
  // Create a div to wrap the input and label
  const divContainer = document.createElement('div');
  divContainer.classList.add('radioKonto');

  // Checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.value = konto.value_number + ' ' + konto.value_account;
  checkbox.id = 'konto_' + konto.value_number; // Assign a unique ID for each checkbox
  const label = document.createElement('label');
  label.htmlFor = 'konto_' + konto.value_number;
  label.appendChild(document.createTextNode(konto.label));

  // Append to the div container
  divContainer.appendChild(checkbox);
  divContainer.appendChild(label);

  // Append the div container to kontoAuswahlContainer
  kontoAuswahlContainer.appendChild(divContainer);
});
function generiereTKonto() {
  const anzahlZeilen = document.getElementById('anzahlZeilen').value;
  const summenzeileCheckbox = document.getElementById('summenzeileCheckbox');
  const tkontoContainer = document.getElementById('tkontoContainer');
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

    tkontoHTML += '<table style="border-collapse: collapse;width:650px;background-color:#fff"><tbody><tr><th style="width:25%;text-align:left" >Soll</th><th style="text-align:center;" colspan="2" >' + kontoAuswahl + '</th><th style="width:25%;text-align:right;" >Haben</th></tr>';

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

    tkontoHTML += '</tbody></table>';
  });
  tkontoHTML += '<div>';
  tkontoContainer.innerHTML = tkontoHTML;

  // Display the buttons after generation
  buttonContainer.style.display = 'block';
}

function herunterladen() {
  const tkontoHTML = document.getElementById('tkontoContainer').innerHTML;
  const blob = new Blob([tkontoHTML], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'tkonto.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function kopiereInZwischenablage() {
  const tkontoHTML = document.getElementById('tkontoContainer').innerHTML;
  navigator.clipboard.writeText(tkontoHTML)
    .then(() => alert('Code wurde in die Zwischenablage kopiert'))
    .catch(err => console.error('Fehler beim Kopieren in die Zwischenablage:', err));
}

function herunterladenAlsPNG() {
  const tkontoContainer = document.getElementById('tkontoContainer');
  html2canvas(tkontoContainer).then(canvas => {
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'T-Konten' + '.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}


let clipboard = new ClipboardJS('#tkontoOfficeButton');

clipboard.on('success', function (e) {
  console.log("Die Tabelle wurde in die Zwischenablage kopiert.");
  alert("Die Tabelle wurde in die Zwischenablage kopiert.");
});

clipboard.on('error', function (e) {
  console.error("Fehler beim Kopieren der Tabelle: ", e.action);
  alert("Fehler beim Kopieren der Tabelle.");
});


