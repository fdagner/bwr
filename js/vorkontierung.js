function generiereVorkontierung() {
  const anzahlZeilenVorkontierung = document.getElementById('anzahlZeilenVorkontierung').value;
  const vorkontierungContainer = document.getElementById('vorkontierungContainer');
  const vorkontierungButtonContainer = document.getElementById('vorkontierungButtonContainer');

  let vorkontierungHTML = '<table style="font-family:courier;min-width:775px;border-collapse:collapse"><caption>Vorkontierung</caption><tbody>'
                        + '<tr style="background-color:#ededed;font-weight: bold;white-space:nowrap;">'
                        + '<th>BA</th>'
                        + '<th>Datum</th>'
                        + '<th>Soll</th>'
                        + '<th>Haben</th>'
                        + '<th>BNR</th>'
                        + '<th>Text</th>'
                        + '<th>B/N</th>'
                        + '<th>Betrag in €</th>'
                        + '<th>UCo</th>'
                        + '</tr>';

  for (let i = 0; i < anzahlZeilenVorkontierung; i++) {
    vorkontierungHTML += '<tr style="background-color:#fff;">'
    vorkontierungHTML += '<td style="width:15px;max-width:15px;border: 1px solid #ccc;padding: .75rem;white-space: nowrap; overflow: hidden; text-overflow:ellipsis;">B</td>'
                      + '<td style="width:80px;max-width:100px;border: 1px solid #ccc;padding: .75rem;white-space: nowrap; overflow: hidden; text-overflow:ellipsis;"></td>'
                      + '<td style="width:110px;max-width:140px;border: 1px solid #ccc;padding: .75rem;white-space: nowrap; overflow: hidden; text-overflow:ellipsis;"></td>'
                      + '<td style="width:110px;max-width:140px;border: 1px solid #ccc;padding: .75rem;white-space: nowrap; overflow: hidden; text-overflow:ellipsis;"></td>'
                      + '<td style="width:15px;max-width:15px;border: 1px solid #ccc;padding: .75rem;white-space: nowrap; overflow: hidden; text-overflow:ellipsis;"></td>'
                      + '<td style="width:160px;max-width:180px;border: 1px solid #ccc;padding: .75rem;white-space: nowrap; overflow: hidden; text-overflow:ellipsis;"></td>'
                      + '<td style="width:50px;max-width:50px;border: 1px solid #ccc;padding: .75rem;white-space: nowrap; overflow: hidden; text-overflow:ellipsis;"></td>'
                      + '<td style="width:110px;max-width:130px;border: 1px solid #ccc;padding: .75rem;white-space: nowrap; overflow: hidden; text-overflow:ellipsis;"></td>'
                      + '<td style="width:80px;max-width:110px;border: 1px solid #ccc;padding: .75rem;white-space: nowrap; overflow: hidden; text-overflow:ellipsis;"></td>'
    vorkontierungHTML += '</tr>';
  }

  vorkontierungHTML += '</tbody></table>';
  vorkontierungContainer.innerHTML = vorkontierungHTML;

  // Display the buttons after generation
  vorkontierungButtonContainer.style.display = 'block';
}


function vorkontierungHerunterladen() {
  const vorkontierungHTML = document.getElementById('vorkontierungContainer').innerHTML;
  const blob = new Blob([vorkontierungHTML], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'vorkontierung.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function vorkontierungKopiereInZwischenablage() {
  const vorkontierungHTML = document.getElementById('vorkontierungContainer').innerHTML;
  navigator.clipboard.writeText(vorkontierungHTML)
    .then(() => alert('Code wurde in die Zwischenablage kopiert'))
    .catch(err => console.error('Fehler beim Kopieren in die Zwischenablage:', err));
}

function vorkontierungHerunterladenAlsPNG() {
  const vorkontierungContainer = document.getElementById('vorkontierungContainer');

  html2canvas(vorkontierungContainer).then(canvas => {
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = 'vorkontierung.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}

let clipboardVorkontierung = new ClipboardJS('#officeButtonVorkontierung');

clipboardVorkontierung.on('success', function (e) {
  console.log("Die Tabelle wurde in die Zwischenablage kopiert.");
  alert("Die Tabelle wurde in die Zwischenablage kopiert.");
});

clipboardVorkontierung.on('error', function (e) {
  console.error("Fehler beim Kopieren der Tabelle: ", e.action);
  alert("Fehler beim Kopieren der Tabelle.");
});


