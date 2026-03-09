  function formatBetrag(value) {
      return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    function rnd(min, max, step) {
      return Math.round((Math.random() * (max - min) + min) / step) * step;
    }

    const KONTEN_CONFIG = {
      AWR: { nr: '6000', name: 'AWR', label: 'Rohstoffen',       rahmen: { VE: [5000,20000], BK: [1000,10000], KA: [500,3000] } },
      AWF: { nr: '6010', name: 'AWF', label: 'Fremdbauteilen',   rahmen: { VE: [1000, 5000], BK: [500,  3000], KA: [100, 800]  } },
      AWH: { nr: '6020', name: 'AWH', label: 'Hilfsstoffen',     rahmen: { VE: [500,  3000], BK: [200,  1500], KA: [50,  500]  } },
      AWB: { nr: '6030', name: 'AWB', label: 'Betriebsstoffen',  rahmen: { VE: [500,  3000], BK: [200,  1500], KA: [50,  500]  } }
    };

    const POOL = ['VE','VE','VE','BK','BK','KA'];

    function gegenKonto(typ) {
      if (typ === 'VE') return { nr: '4400', kurz: 'VE' };
      if (typ === 'BK') return { nr: '2800', kurz: 'BK' };
      if (typ === 'KA') return { nr: '2880', kurz: 'KA' };
    }

    function geschaeftsfall(key, b) {
      const cfg = KONTEN_CONFIG[key];
      const texte = {
        VE: `Einkauf von ${cfg.label} in Höhe von ${formatBetrag(b.betrag)}\u00a0€ auf Ziel.`,
        BK: `Kauf von ${cfg.label} in Höhe von ${formatBetrag(b.betrag)}\u00a0€ per Banküberweisung.`,
        KA: `Beschaffung von ${cfg.label} in Höhe von ${formatBetrag(b.betrag)}\u00a0€ in bar.`,
      };
      return texte[b.typ];
    }

    function renderTKontoAufgabe(titel, buchungen) {
      // Zeilenanzahl entspricht genau der Anzahl der Buchungen
      let rows = '';
      for (let i = 0; i < buchungen.length; i++) {
        const b = buchungen[i];
        rows += `<tr style="border-top:2px solid #ccc;">
          <td style="padding:3px 2px;white-space:nowrap;">${b ? `${b.nr}.) ${b.typ}` : '&nbsp;'}</td>
          <td style="text-align:right;padding:3px 4px 3px 2px;border-right:2px solid #999;min-width:100px;height:1.8em;">${b ? formatBetrag(b.betrag) + '\u00a0€' : '&nbsp;'}</td>
          <td style="padding:3px 2px 3px 6px;min-width:100px;">&nbsp;</td>
          <td style="text-align:right;padding:3px 2px;min-width:100px;">&nbsp;</td>
        </tr>`;
      }
      return `<table style="border-collapse:collapse;width:580px;background:#fff;font-size:1.0em;">
        <thead><tr>
          <th style="width:25%;text-align:left;font-weight:600;padding:4px 0;">Soll</th>
          <th style="text-align:center;font-size:1.0em;padding:4px 0;" colspan="2"><span style="font-weight:700;">${titel}</span></th>
          <th style="width:25%;text-align:right;font-weight:600;padding:4px 0;">Haben</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
    }
    
function generiereAufgabe() {
      const container = document.getElementById('Container');
      if (!container) return;
      container.innerHTML = '';

      const ausgewaehlt = ['AWR','AWF','AWH','AWB'].filter(k =>
        document.getElementById('cb_' + k).checked
      );

      if (ausgewaehlt.length === 0) {
        container.innerHTML = '<p>Bitte mindestens ein Konto auswählen.</p>';
        return;
      }

      const anzahl = parseInt(document.getElementById('anzahlSelect').value, 10);
      const showNr = document.getElementById('showKontoNr').checked;

      let globalNr = 1;
      const alleKonten = ausgewaehlt.map(key => {
        const cfg = KONTEN_CONFIG[key];
        const buchungen = [];
        for (let i = 0; i < anzahl; i++) {
          const typ = POOL[Math.floor(Math.random() * POOL.length)];
          const [mn, mx] = cfg.rahmen[typ];
          const step = typ === 'KA' ? 10 : 100;
          buchungen.push({ nr: globalNr++, typ, betrag: rnd(mn, mx, step) });
        }
        return { key, buchungen };
      });

      // ── AUFGABE ──────────────────────────────────────────────────────
      let html = '<h2>Aufgabe</h2>';
      html += `<p>Formuliere für die Eintragungen in den T-Konten jeweils einen Geschäftsfall.</p>`;

      html += `<div style="display:flex;flex-wrap:wrap;gap:18px;margin:1.5em 0 2em;">`;
      alleKonten.forEach(({ key, buchungen }) => {
        const cfg   = KONTEN_CONFIG[key];
        const titel = showNr ? `${cfg.nr} ${cfg.name}` : cfg.name;
        html += `<div>${renderTKontoAufgabe(titel, buchungen)}</div>`;
      });
      html += `</div>`;

      // ── LÖSUNG ───────────────────────────────────────────────────────
      html += `<h2 style="margin-top:2.5em">Lösung</h2>`;

      // Geschäftsfälle
      html += `<strong>Geschäftsfälle:</strong><br><br>`;
      let nr = 1;
      alleKonten.forEach(({ key, buchungen }) => {
        buchungen.forEach(b => {
          html += `<p><strong>${nr}.</strong> ${geschaeftsfall(key, b)}</p>`;
          nr++;
        });
      });

    
      container.innerHTML = html;
    }

    document.addEventListener('DOMContentLoaded', generiereAufgabe);