   function formatEuro(val) {
      return val.toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) + ' €';
    }

    function formatPercent(val) {
      return val.toFixed(0) + ' %';
    }

    function randRange(min, max) {
      return Math.round((Math.random() * (max - min) + min) / 20) * 20;
    }

    function generateBAB() {
      const kostenarten = [
        { name: 'Hilfsstoffe', verteilung: 'Belege', basis: randRange(15000, 35000) },
        { name: 'Betriebsstoffe', verteilung: 'Belege', basis: randRange(8000, 18000) },
        { name: 'Mietaufwendungen', verteilung: 'Fläche', basis: randRange(8000, 12000) },
        { name: 'Gehälter', verteilung: 'Köpfe', basis: randRange(80000, 150000) },
        { name: 'Sozialkosten', verteilung: 'Köpfe', basis: randRange(25000, 45000) },
        { name: 'Stromkosten', verteilung: 'kWh', basis: randRange(6000, 12000) },
        { name: 'Versicherungen', verteilung: 'Prozentsätze', basis: randRange(4000, 8000) },
        { name: 'Kalk. Abschreibung', verteilung: 'Wert Sachanlagen', basis: randRange(15000, 25000) },
        { name: 'Kalk. Unternehmerlohn', verteilung: 'Prozentsätze', basis: randRange(20000, 30000) }
      ];

      // Verteilungsschlüssel (verursachungsgerecht, nicht alle Kosten gehen an alle Stellen!)
      const verteilungen = {
        // Hilfsstoffe: nur Material & Fertigung (keine Verwaltung/Vertrieb)
        'Belege': { material: 0.04, fertigung: 0.96, verwaltung: 0, vertrieb: 0 },
        // Miete: Material, Fertigung, Vertrieb (keine Verwaltung im Beispiel)
        'Fläche': { material: 0.12, fertigung: 0.70, verwaltung: 0, vertrieb: 0.18 },
        // Gehälter & Sozialkosten: alle Stellen
        'Köpfe': { material: 0.08, fertigung: 0.62, verwaltung: 0.15, vertrieb: 0.15 },
        // Strom: hauptsächlich Fertigung, etwas andere
        'kWh': { material: 0.05, fertigung: 0.80, verwaltung: 0.05, vertrieb: 0.10 },
        // Kalkulatorische Kosten: alle Stellen
        'Prozentsätze': { material: 0.10, fertigung: 0.50, verwaltung: 0.25, vertrieb: 0.15 },
        // Abschreibungen: hauptsächlich Fertigung
        'Wert Sachanlagen': { material: 0.06, fertigung: 0.69, verwaltung: 0.11, vertrieb: 0.14 }
      };

      let html = '';
      let summen = { material: 0, fertigung: 0, verwaltung: 0, vertrieb: 0 };

      // Kostenarten durchgehen
      kostenarten.forEach(kostenart => {
        const verteilung = verteilungen[kostenart.verteilung];
        
        const material = Math.round(kostenart.basis * verteilung.material / 20) * 20;
        const fertigung = Math.round(kostenart.basis * verteilung.fertigung / 20) * 20;
        const verwaltung = Math.round(kostenart.basis * verteilung.verwaltung / 20) * 20;
        const vertrieb = Math.round(kostenart.basis * verteilung.vertrieb / 20) * 20;

        summen.material += material;
        summen.fertigung += fertigung;
        summen.verwaltung += verwaltung;
        summen.vertrieb += vertrieb;

        html += `
          <tr>
            <td style="border: 1px solid #ccc;">${kostenart.name}</td>
            <td style="border: 1px solid #ccc;text-align: right;padding-right: 6px">${formatEuro(kostenart.basis)}</td>
            <td style="border: 1px solid #ccc;text-align: center">${kostenart.verteilung}</td>
            <td style="border: 1px solid #ccc;text-align: right;padding-right: 6px"">${material > 0 ? formatEuro(material) : '-'}</td>
            <td style="border: 1px solid #ccc;text-align: right;padding-right: 6px"">${fertigung > 0 ? formatEuro(fertigung) : '-'}</td>
            <td style="border: 1px solid #ccc;text-align: right;padding-right: 6px"">${verwaltung > 0 ? formatEuro(verwaltung) : '-'}</td>
            <td style="border: 1px solid #ccc;text-align: right;padding-right: 6px"">${vertrieb > 0 ? formatEuro(vertrieb) : '-'}</td>
          </tr>
        `;
      });

      const gesamtKosten = summen.material + summen.fertigung + summen.verwaltung + summen.vertrieb;

      // Summe der Gemeinkosten
      html += `
        <tr style="font-weight: bold;">
          <td style="border: 1px solid #ccc">Summe der Gemeinkosten</td>
          <td style="border: 1px solid #ccc;text-align: right;padding-right: 6px"">${formatEuro(gesamtKosten)}</td>
          <td></td>
          <td style="border: 1px solid #ccc;text-align: right;padding-right: 6px"">${formatEuro(summen.material)}</td>
          <td style="border: 1px solid #ccc;text-align: right;padding-right: 6px"">${formatEuro(summen.fertigung)}</td>
          <td style="border: 1px solid #ccc;text-align: right;padding-right: 6px"">${formatEuro(summen.verwaltung)}</td>
          <td style="border: 1px solid #ccc;text-align: right;padding-right: 6px"">${formatEuro(summen.vertrieb)}</td>
        </tr>
      `;

      // Zuschlagsgrundlagen (realistische Werte)
      const zgMaterial = randRange(120000, 180000);
      const zgFertigung = randRange(100000, 180000);

      // Zuschlagsgrundlage
      html += `
        <tr style="font-weight: bold;">
          <td style="border: 1px solid #ccc" colspan="3" class="center"><b>Zuschlagsgrundlage</b></td>
          <td style="border: 1px solid #ccc;text-align: right;padding-right: 6px""><b>${formatEuro(zgMaterial)}</b></td>
          <td style="border: 1px solid #ccc;text-align: right;padding-right: 6px""><b>${formatEuro(zgFertigung)}</b></td>
          <td colspan="2"></td>
        </tr>
      `;

      // Zuschlagssätze berechnen
      const zsMaterial = (summen.material / zgMaterial) * 100;
      const zsFertigung = (summen.fertigung / zgFertigung) * 100;

      // Zuschlagssatz
      html += `
        <tr style="font-weight: bold;">
          <td colspan="3" class="center"><b>Zuschlagssatz</b></td>
          <td style="border: 1px solid #ccc;text-align: right;padding-right: 6px""><b>${formatPercent(zsMaterial)}</b></td>
          <td style="border: 1px solid #ccc;text-align: right;padding-right: 6px""><b>${formatPercent(zsFertigung)}</b></td>
          <td colspan="2"></td>
        </tr>
      `;

      document.getElementById('babBody').innerHTML = html;
    }

    // Beim Laden der Seite automatisch einen BAB erstellen
    document.addEventListener("DOMContentLoaded", function() {
      generateBAB();
    });