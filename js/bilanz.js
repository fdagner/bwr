function generiereBilanz() {
  const BilanzContainer = document.getElementById('BilanzContainer');
  const BilanzButtonContainer = document.getElementById('BilanzButtonContainer');

  let BilanzHTML = '<table style="white-space:nowrap;background-color:#fff;font-family:courier;min-width:750px;"><tbody>';

  BilanzHTML += '<tr>';
  BilanzHTML += '<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px" tabindex="1">0000 Kt.</td>';
  BilanzHTML += '<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:170px;min-width: 120px" tabindex="1">2.000,00 €</td>';
  BilanzHTML += '</tbody></table>';
  BilanzContainer.innerHTML = BilanzHTML;

  // Display the buttons after generation
  BilanzButtonContainer.style.display = 'block';
}


function BilanzHerunterladen() {
  const BilanzHTML = document.getElementById('BilanzContainer').innerHTML;
  const blob = new Blob([BilanzHTML], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'Bilanz.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function BilanzKopiereInZwischenablage() {
  const BilanzHTML = document.getElementById('BilanzContainer').innerHTML;
  navigator.clipboard.writeText(BilanzHTML)
    .then(() => alert('Code wurde in die Zwischenablage kopiert'))
    .catch(err => console.error('Fehler beim Kopieren in die Zwischenablage:', err));
}

function BilanzHerunterladenAlsPNG() {
  const BilanzContainer = document.getElementById('BilanzContainer');

  html2canvas(BilanzContainer).then(canvas => {
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'Bilanz.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}

let clipboardBilanz = new ClipboardJS('#officeButtonBilanz');

clipboardBilanz.on('success', function (e) {
  console.log("Die Tabelle wurde in die Zwischenablage kopiert.");
  alert("Die Tabelle wurde in die Zwischenablage kopiert.");
});

clipboardBilanz.on('error', function (e) {
  console.error("Fehler beim Kopieren der Tabelle: ", e.action);
  alert("Fehler beim Kopieren der Tabelle.");
});


window.onload = function () {
  generiereTKonto();
  generiereBilanz();
};
