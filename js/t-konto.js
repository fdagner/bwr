// Convert the YAML string into a JavaScript object
const parsedData = jsyaml.load(kontoAuswahlYAML);

// Select the drop-down menu
const kontoAuswahlSelect = document.getElementById('kontoAuswahl');

// Fill the drop-down menu with the accounts from the YAML file
parsedData.konten.forEach(konto => {
  const option = document.createElement('option');
  option.value = konto.value_number + " " + konto.value_account;
  option.text = konto.label;
  kontoAuswahlSelect.appendChild(option);
});

function generiereTKonto() {
  const kontoAuswahl = document.getElementById('kontoAuswahl').value;
  const anzahlZeilen = document.getElementById('anzahlZeilen').value;
  const summenzeileCheckbox = document.getElementById('summenzeileCheckbox');
  const tkontoContainer = document.getElementById('tkontoContainer');
  const buttonContainer = document.getElementById('buttonContainer');


  let tkontoHTML = '<p>Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.</p><table style="border-collapse: collapse;width:650px;background-color:#fff"><tbody><tr><th style="width:25%;text-align:left" tabindex="1">Soll</th><th style="text-align:center;" colspan="2" tabindex="1">' + kontoAuswahl + '</th><th style="width:25%;text-align:right;" tabindex="1">Haben</th></tr>';

  for (let i = 0; i < anzahlZeilen; i++) {
    tkontoHTML += '<tr style="border-top: 1px solid #AAAAAA;">' +
      '<td style="width:25%; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; max-width: 160px" tabindex="1"></td>' +
      '<td style="width:25%; text-align:right; padding-right: 2px; height: 2em; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; max-width: 160px" tabindex="1"></td>' +
      '<td style="width:25%; border-left: 1px solid #AAAAAA; padding-left: 2px; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; max-width: 160px" tabindex="1"></td>' +
      '<td style="width:25%; text-align:right; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; max-width: 160px" tabindex="1"></td>' +
      '</tr>';
  }

  if (summenzeileCheckbox.checked) {
    tkontoHTML += '<tr style="border-bottom: 6px double #AAAAAA; border-top: 2px solid #AAAAAA;">' +
      '<td style="width:25%; height: 2em; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; max-width: 160px" tabindex="1"></td>' +
      '<td style="width:25%; text-align:right; padding-right: 2px; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; max-width: 160px" tabindex="1"></td>' +
      '<td style="width:25%; border-left: 1px solid #AAAAAA; padding-left: 2px; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; max-width: 160px" tabindex="1"></td>' +
      '<td style="width:25%; text-align:right; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; max-width: 160px" tabindex="1"></td>' +
      '</tr>';
  }

  tkontoHTML += '</tbody></table>';
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
  const kontoAuswahl = document.getElementById('kontoAuswahl').value;
  const tkontoContainer = document.getElementById('tkontoContainer');
  html2canvas(tkontoContainer).then(canvas => {
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = kontoAuswahl + '.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}


let clipboard = new ClipboardJS('#officeButton');

clipboard.on('success', function (e) {
  console.log("Die Tabelle wurde in die Zwischenablage kopiert.");
  alert("Die Tabelle wurde in die Zwischenablage kopiert.");
});

clipboard.on('error', function (e) {
  console.error("Fehler beim Kopieren der Tabelle: ", e.action);
  alert("Fehler beim Kopieren der Tabelle.");
});


