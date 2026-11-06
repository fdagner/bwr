   // Funktion zum Generieren einer zufälligen Zahl zwischen min und max
    function pwbZufallsZahl(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Funktion zum Generieren eines glatten Betrags (durch 100 teilbar)
    function pwbGlatterBetrag(min, max) {
      const betrag = pwbZufallsZahl(min, max);
      const gerundet = Math.round(betrag / 100) * 100;
      return Math.max(gerundet, min);
    }

    // Funktion zum Formatieren von Zahlen im deutschen Format
    function pwbFormatiereEuro(betrag) {
      return betrag.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    }

    // Funktion zum Formatieren von Prozent
    
    // Funktion zum Berechnen der UST
    function pwbBerechneUST(nettobetrag) {
      return Math.round(nettobetrag * UST_REGEL / 100 * 100) / 100;
    }

    // Funktion zum Generieren der Tabelle
    function pwbZeigeZufaelligeTabelle() {
      const pwbProzent = parseFloat(document.getElementById('pwbProzentsatz').value);
      
      // Einwandfreie Forderungen netto generieren (40.000 bis 400.000 €)
      const forderungenNetto = pwbGlatterBetrag(400, 4000) * 100;
      
      // Berechnungen
      const ust = pwbBerechneUST(forderungenNetto);
      const forderungenBrutto = forderungenNetto + ust;
      const pwbBetrag = Math.round(forderungenNetto * pwbProzent / 100 * 100) / 100;
      
      // HTML für Aufgabe generieren (ohne blaue Werte)
      let htmlAufgabe = `
        <h2>Aufgabe</h2>
        <h3>Abrechnungsschema:</h3>
        <table style="border-collapse: collapse; font-size: 14px; margin-top: 20px;">
          <tbody>
            <tr>
              <td style="border: 1px solid #000; padding: 8px; text-align: left;">einwandfreie Forderungen brutto</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; min-width: 120px;">${pwbFormatiereEuro(forderungenBrutto)}</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; min-width: 80px; color: #0066cc;"></td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; min-width: 80px;"></td>
            </tr>
            <tr style="border-top: 2px solid #000;">
              <td style="border: 1px solid #000; padding: 8px; text-align: left;">- Umsatzsteuer</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right;"></td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; color: #0066cc;"></td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right;"></td>
            </tr>
            <tr style="border-top: 2px solid #000;">
              <td style="border: 1px solid #000; padding: 8px; text-align: left;">= einwandfreie Forderungen netto</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right;"></td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; color: #0066cc;"></td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; color: #0066cc;"></td>
            </tr>
            <tr style="border-top: 2px solid #000;">
              <td style="border: 1px solid #000; padding: 8px; text-align: left;">davon ${pwbProzent} % PWB</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right;"></td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right;"></td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; color: red;"></td>
            </tr>
          </tbody>
        </table>
        <br><br>
      `;
      
      // HTML für Lösung generieren (mit allen Werten)
      let htmlLoesung = `
        <h2 class="loesung">Lösung</h2>
        <table style="border-collapse: collapse; font-size: 14px; margin-top: 20px;">
          <tbody>
            <tr>
              <td style="border: 1px solid #000; padding: 8px; text-align: left;">einwandfreie Forderungen brutto</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; min-width: 120px;">${pwbFormatiereEuro(forderungenBrutto)}</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; min-width: 80px; color: #0066cc;">${100 + UST_REGEL} %</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; min-width: 80px;"></td>
            </tr>
            <tr style="border-top: 2px solid #000;">
              <td style="border: 1px solid #000; padding: 8px; text-align: left;">- Umsatzsteuer</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; color: #0066cc;">${pwbFormatiereEuro(ust)}</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; color: #0066cc;">${UST_REGEL} %</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right;"></td>
            </tr>
            <tr style="border-top: 2px solid #000;">
               <td style="border: 1px solid #000; padding: 8px; text-align: left;">= einwandfreie Forderungen netto</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; color: #0066cc;">${pwbFormatiereEuro(forderungenNetto)}</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; color: #0066cc;">100 %</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; color: #0066cc;">100 %</td>
            </tr>
            <tr style="border-top: 2px solid #000;">
              <td style="border: 1px solid #000; padding: 8px; text-align: left;">davon ${pwbProzent} % PWB</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; color: #0066cc;"">${pwbFormatiereEuro(pwbBetrag)}</td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right;"></td>
              <td style="border: 1px solid #000; padding: 8px; text-align: right; color: #0066cc;"">${pwbProzent} %</td>
            </tr>
          </tbody>
        </table>
        <br><br>
        <p style="font-size: 16px; margin-bottom: 10px;"><strong>Buchungssatz für die vorbereitende Abschlussbuchung am 31.12.:</strong></p>
        <table style="border: 1px solid #ccc;white-space:nowrap;background-color:#fff;font-family:courier;width:600px;margin:0 0;margin-bottom:6px;">
          <tbody>
            <tr>
              <td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">6950 ABFO</td>
              <td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">${pwbFormatiereEuro(pwbBetrag)}</td>
              <td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 40px" tabindex="1">an</td>
              <td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px;text-align:left" tabindex="1">3680 PWB</td>
              <td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px;text-align:right" tabindex="1">${pwbFormatiereEuro(pwbBetrag)}</td>
            </tr>
          </tbody>
        </table>
      `;
      
      document.getElementById('Container').innerHTML = htmlAufgabe + htmlLoesung;
    }

    // Export-Funktionen
    
    
    
     // Beim Laden der Seite automatisch einen BAB erstellen
    document.addEventListener("DOMContentLoaded", function() {
      pwbZeigeZufaelligeTabelle();
    });

