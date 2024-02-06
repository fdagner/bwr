function generiereBuchungssatz() {
  const anzahlZeilenBuchungssatz = document.getElementById('anzahlZeilenBuchungssatz').value;
  const buchungssatzContainer = document.getElementById('buchungssatzContainer');
  const buchungssatzButtonContainer = document.getElementById('buchungssatzButtonContainer');

  let buchungssatzHTML = '<table style="white-space:nowrap;background-color:#fff;font-family:courier;min-width:650px;"><tbody>';

  for (let i = 0; i < anzahlZeilenBuchungssatz; i++) {
    buchungssatzHTML += '<tr>';
    buchungssatzHTML += '<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px" tabindex="1">0000 Kt.</td>';
    buchungssatzHTML += '<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:170px;min-width: 120px" tabindex="1">2.000,00 €</td>';

    if (i === 0) {
      buchungssatzHTML += '<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 100px" tabindex="1">an</td>';
    } else {
      buchungssatzHTML += '<td style="text-align: center;width:100px;white-space: pre;overflow: hidden;text-overflow:ellipsis;min-width: 100px" tabindex="1"> </td>';
    }

    buchungssatzHTML += '<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px" tabindex="1">0000 Kt.</td>';
    buchungssatzHTML += '<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:170px;min-width: 120px" tabindex="1">2.000,00 €</td>';
    buchungssatzHTML += '</tr>';
  }

  buchungssatzHTML += '</tbody></table>';
  buchungssatzContainer.innerHTML = buchungssatzHTML;

  // Display the buttons after generation
  buchungssatzButtonContainer.style.display = 'block';
}


function buchungssatzHerunterladen() {
  herunterladen('buchungssatzContainer', 'buchungssatz');
}


function buchungssatzKopiereInZwischenablage() {
  const buchungssatzHTML = document.getElementById('buchungssatzContainer').innerHTML;
  navigator.clipboard.writeText(buchungssatzHTML)
    .then(() => alert('Code wurde in die Zwischenablage kopiert'))
    .catch(err => console.error('Fehler beim Kopieren in die Zwischenablage:', err));
}

function buchungssatzHerunterladenAlsPNG() {
  const buchungssatzContainer = document.getElementById('buchungssatzContainer');

  html2canvas(buchungssatzContainer).then(canvas => {
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'buchungssatz.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}

let clipboardBuchungssatz = new ClipboardJS('#officeButtonBuchungssatz');

clipboardBuchungssatz.on('success', function (e) {
  console.log("Die Tabelle wurde in die Zwischenablage kopiert.");
  alert("Die Tabelle wurde in die Zwischenablage kopiert.");
});

clipboardBuchungssatz.on('error', function (e) {
  console.error("Fehler beim Kopieren der Tabelle: ", e.action);
  alert("Fehler beim Kopieren der Tabelle.");
});


window.onload = function () {

};


