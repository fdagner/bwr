 // Kundenliste für Einzelwertberichtigung
    const ewbKunden = [
      { name: "Müller Handels GmbH", ort: "Landshut" },
      { name: "Schmidt & Partner KG", ort: "Coburg" },
      { name: "Bauer Großhandel e. K.", ort: "Hösbach" },
      { name: "Weber Trading GmbH", ort: "Bamberg" },
      { name: "Fischer Import-Export", ort: "Würzburg" },
      { name: "Hoffmann Vertrieb e. K.", ort: "Nürnberg" },
      { name: "Schneider & Söhne GbR", ort: "Fürth" },
      { name: "Lehmann Handelshaus", ort: "Erlangen" },
      { name: "Wagner Commerce GmbH", ort: "Regensburg" },
      { name: "Kraus Handelskontor", ort: "Ingolstadt" },
      { name: "Zimmermann Trading", ort: "Augsburg" },
      { name: "Meier & Co. KG", ort: "Passau" },
      { name: "Schulz Handel e. K.", ort: "Aschaffenburg" },
      { name: "Koch Großhandel GmbH", ort: "Schweinfurt" },
      { name: "Becker Handelsgesellschaft", ort: "Kempten" }
    ];

    // Funktion zum Generieren einer zufälligen Zahl zwischen min und max
    function ewbZufallsZahl(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Funktion zum Generieren eines glatten Betrags (durch 100 teilbar)
    function ewbGlatterBetrag(min, max) {
      const betrag = ewbZufallsZahl(min, max);
      const gerundet = Math.round(betrag / 100) * 100;
      return Math.max(gerundet, min); // Sicherstellen, dass Minimum eingehalten wird
    }

    // Funktion zum Generieren eines zufälligen Ausfall-Prozentsatzes in 10er-Schritten (10, 20, 30...90%)
    function ewbZufaelligerAusfallProzent() {
      const schritte = [10, 20, 30, 40, 50, 60, 70, 80, 90];
      return schritte[ewbZufallsZahl(0, schritte.length - 1)];
    }

    // Funktion zum Formatieren von Zahlen im deutschen Format
    function ewbFormatiereEuro(betrag) {
      return betrag.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    }

    // Funktion zum Berechnen der UST
    function ewbBerechneUST(nettobetrag) {
      return Math.round(nettobetrag * 0.19 * 100) / 100;
    }

    // Funktion zum Generieren der Tabelle
    function ewbZeigeZufaelligeTabelle() {
      const anzahlKunden = parseInt(document.getElementById('ewbAnzahlKunden').value);
      
      // Zufällige Kunden auswählen
      const verfuegbareKunden = [...ewbKunden];
      const ausgewaehlteKunden = [];
      
      for (let i = 0; i < anzahlKunden; i++) {
        const index = ewbZufallsZahl(0, verfuegbareKunden.length - 1);
        ausgewaehlteKunden.push(verfuegbareKunden[index]);
        verfuegbareKunden.splice(index, 1);
      }
      
      // Daten für jeden Kunden generieren
      const kundenDaten = ausgewaehlteKunden.map(kunde => {
        const nettobetrag = ewbGlatterBetrag(20, 800) * 100; // 2.000 bis 80.000 € (20-800 * 100)
        const ust = ewbBerechneUST(nettobetrag);
        const bruttobetrag = nettobetrag + ust;
        const ausfallProzent = ewbZufaelligerAusfallProzent(); // 10% bis 90%
        const ausfallBetrag = Math.round(nettobetrag * ausfallProzent / 100);
        
        return {
          name: kunde.name,
          ort: kunde.ort,
          bruttobetrag: bruttobetrag,
          ust: ust,
          nettobetrag: nettobetrag,
          ausfallProzent: ausfallProzent,
          ausfallBetrag: ausfallBetrag
        };
      });
      
      // Summe der geschätzten Ausfälle berechnen
      const summeDerAusfaelle = kundenDaten.reduce((sum, kunde) => sum + kunde.ausfallBetrag, 0);
      
      // HTML für Aufgabe generieren (ohne blaue Werte)
      let htmlAufgabe = `
        <h2>Aufgabe</h2>
        <p>Zweifelhaften Forderungen werden am Abschlussstichtag mit ihrem individuellen Ausfallrisiko bewertet. Bilde den Buchungssatz zur vorbereitenden Abschlussbuchung am 31.12</p>
        <br>
        <table style="width: 100%; max-width: 750px; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background-color: #d0d0d0;">
              <th style="border: 1px solid #000; padding: 8px; text-align: center;">Kunde</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: center;">Zweifelhafte<br>Forderung</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: center;">UST 19 %</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: center;">Zweifelhafte<br>Forderung netto</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: center;">Geschätzter<br>Ausfall</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: center;">Wertberichtigung</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      kundenDaten.forEach(kunde => {
        htmlAufgabe += `
            <tr>
              <td style="border: 1px solid #000; padding: 8px;">${kunde.name}<br>${kunde.ort}</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right;">${ewbFormatiereEuro(kunde.bruttobetrag)}</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right;"></td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right;"></td>
              <td style="border: 1px solid #000; padding: 8px; text-align: center;">${kunde.ausfallProzent} %</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right;"></td>
            </tr>
        `;
      });
      
      htmlAufgabe += `
            <tr>
              <td colspan="5" style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold; color: red;">Summe der geschätzten Ausfälle</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold;"></td>
            </tr>
          </tbody>
        </table>
        <br><br>
      `;
      
      // HTML für Lösung generieren (mit allen Werten)
      let htmlLoesung = `
        <h2>Lösung</h2>
        <table style="width: 100%; max-width: 750px; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background-color: #d0d0d0;">
              <th style="border: 1px solid #000; padding: 8px; text-align: center;">Kunde</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: center;">Zweifelhafte<br>Forderung</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: center;">UST 19 %</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: center;">Zweifelhafte<br>Forderung netto</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: center;">Geschätzter<br>Ausfall</th>
              <th style="border: 1px solid #000; padding: 8px; text-align: center;">Wertberichtigung</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      kundenDaten.forEach(kunde => {
        htmlLoesung += `
            <tr>
              <td style="border: 1px solid #000; padding: 8px;">${kunde.name}<br>${kunde.ort}</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right;">${ewbFormatiereEuro(kunde.bruttobetrag)}</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; color: #0066cc;">${ewbFormatiereEuro(kunde.ust)}</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; color: #0066cc;">${ewbFormatiereEuro(kunde.nettobetrag)}</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: center;">${kunde.ausfallProzent} %</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; color: #0066cc;">${ewbFormatiereEuro(kunde.ausfallBetrag)}</td>
            </tr>
        `;
      });
      
      htmlLoesung += `
            <tr>
              <td colspan="5" style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold; color: red;">Summe der geschätzten Ausfälle</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; font-weight: bold; color: red;">${ewbFormatiereEuro(summeDerAusfaelle)}</td>
            </tr>
          </tbody>
        </table>
        <br><br>
        <p style="font-size: 16px; margin-bottom: 10px;"><strong>Buchungssatz für die vorbereitende Abschlussbuchung am 31.12.:</strong></p>
        <table style="width: 500px;border: 1px solid #ccc;white-space:nowrap;background-color:#fff;font-family:courier;width:600px;margin:0 0;margin-bottom:6px;">
          <tbody>
            <tr>
              <td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">6950 ABFO</td>
              <td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">${ewbFormatiereEuro(summeDerAusfaelle)}</td>
              <td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 40px" tabindex="1">an</td>
              <td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px;text-align:left" tabindex="1">3670 EWB</td>
              <td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px;text-align:right" tabindex="1">${ewbFormatiereEuro(summeDerAusfaelle)}</td>
            </tr>
          </tbody>
        </table>
      `;
      
      document.getElementById('Container').innerHTML = htmlAufgabe + htmlLoesung;
    }

    // Export-Funktionen
    function ewbHerunterladenAlsPNG() {
      const element = document.getElementById('Container');
      if (!element.innerHTML) {
        alert('Bitte erstellen Sie zuerst eine Aufgabe!');
        return;
      }
      
      html2canvas(element).then(canvas => {
        const link = document.createElement('a');
        link.download = 'einzelwertberichtigung.png';
        link.href = canvas.toDataURL();
        link.click();
      });
    }

    function ewbHerunterladen() {
      const element = document.getElementById('Container');
      if (!element.innerHTML) {
        alert('Bitte erstellen Sie zuerst eine Aufgabe!');
        return;
      }
      
      const htmlContent = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Einzelwertberichtigung</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #000; padding: 8px; }
    th { background-color: #d0d0d0; text-align: center; }
  </style>
</head>
<body>
  ${element.innerHTML}
</body>
</html>`;
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'einzelwertberichtigung.html';
      link.click();
    }

    function ewbKopiereInZwischenablage() {
      const element = document.getElementById('Container');
      if (!element.innerHTML) {
        alert('Bitte erstellen Sie zuerst eine Aufgabe!');
        return;
      }
      
      const range = document.createRange();
      range.selectNode(element);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(range);
      
      try {
        document.execCommand('copy');
        alert('In Zwischenablage kopiert!');
      } catch (err) {
        alert('Fehler beim Kopieren');
      }
      
      window.getSelection().removeAllRanges();
    }

    // Beim Laden der Seite automatisch einen BAB erstellen
    document.addEventListener("DOMContentLoaded", function() {
      ewbZeigeZufaelligeTabelle();
    });

