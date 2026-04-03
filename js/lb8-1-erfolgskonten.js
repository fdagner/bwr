function formatBetrag(value) {
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function generateRandomSaldo(min, max, round = 100) {
  return Math.round((Math.random() * (max - min) + min) / round) * round;
}

// ── Nachlässe-Unterkonten ─────────────────────────────────────────────────

const BEZUGSKOSTEN_MAP = {
  '6000 AWR': { nr: '6002 NR', label: 'Nachlässe für Rohstoffe',      hauptkonto: '6000 AWR' },
  '6010 AWF': { nr: '6012 NF', label: 'Nachlässe für Fremdbauteile',  hauptkonto: '6010 AWF' },
  '6020 AWH': { nr: '6022 NH', label: 'Nachlässe für Hilfsstoffe',    hauptkonto: '6020 AWH' },
  '6030 AWB': { nr: '6032 NB', label: 'Nachlässe für Betriebsstoffe', hauptkonto: '6030 AWB' },
};

function erzeugeBzkBuchungen(hauptTyp) {
  const rahmen = {
    AWR: [1000, 8000],
    AWF: [100,   800],
    AWH: [20,    200],
    AWB: [30,    300],
  };
  const [min, max] = rahmen[hauptTyp];
  const anzahl = 1 + Math.floor(Math.random() * 2);
  const buchungen = [];
  for (let i = 0; i < anzahl; i++) {
    const betrag = generateRandomSaldo(min, max, hauptTyp === 'AWR' ? 100 : 10);
    buchungen.push({ typ: 'VE', nr: i + 1, betrag });
  }
  const saldo = buchungen.reduce((s, b) => s + b.betrag, 0);
  return { buchungen, saldo };
}

// ── Buchungen generieren ─────────────────────────────────────────────────────

function erzeugeKontoBuchungen(typ) {
  const buchungsTypen = ['VE', 'VE', 'VE', 'VE', 'VE', 'BK', 'BK', 'KA'];
  const rahmen = {
    AWR: { VE: [80000, 280000], BK: [20000, 80000], KA: [5000,  15000] },
    AWF: { VE: [8000,   28000], BK: [2000,   8000], KA: [500,    1500] },
    AWH: { VE: [1500,    6000], BK: [400,    1500], KA: [100,     400] },
    AWB: { VE: [2000,    8000], BK: [500,    2000], KA: [100,     500] },
  };
  const anzahl = 2 + Math.floor(Math.random() * 3);
  const buchungen = [];
  for (let i = 0; i < anzahl; i++) {
    const bTyp = buchungsTypen[Math.floor(Math.random() * buchungsTypen.length)];
    const [min, max] = rahmen[typ][bTyp];
    const betrag = generateRandomSaldo(min, max, bTyp === 'KA' ? 10 : 100);
    buchungen.push({ typ: bTyp, nr: i + 1, betrag });
  }
  const saldo = buchungen.reduce((s, b) => s + b.betrag, 0);
  return { buchungen, saldo };
}

function erzeugeUefeBuchungen() {
  const buchungsTypen = ['VE', 'VE', 'VE', 'VE', 'VE', 'BK', 'BK', 'KA'];
  const rahmen = {
    VE: [200000, 600000],
    BK: [20000,   80000],
    KA: [5000,    15000],
  };
  const anzahl = 2 + Math.floor(Math.random() * 3);
  const buchungen = [];
  for (let i = 0; i < anzahl; i++) {
    const bTyp = buchungsTypen[Math.floor(Math.random() * buchungsTypen.length)];
    const [min, max] = rahmen[bTyp];
    const betrag = generateRandomSaldo(min, max, bTyp === 'KA' ? 10 : 100);
    buchungen.push({ typ: bTyp, nr: i + 1, betrag });
  }
  const saldo = buchungen.reduce((s, b) => s + b.betrag, 0);
  return { buchungen, saldo };
}

// ── Gesamtdaten zusammenstellen ──────────────────────────────────────────────

function erstelleZufaelligenBestandsabschluss(mitBezugskosten) {
  const kontenTypen = {
    '6000 AWR': 'AWR',
    '6010 AWF': 'AWF',
    '6020 AWH': 'AWH',
    '6030 AWB': 'AWB',
  };

  const konten = {};
  const bezugskosten = {};

  for (const [nr, typ] of Object.entries(kontenTypen)) {
    const kDaten = erzeugeKontoBuchungen(typ);

    if (mitBezugskosten) {
      const bzkDaten = erzeugeBzkBuchungen(typ);
      bezugskosten[nr] = bzkDaten;
      konten[nr] = {
        buchungen:  kDaten.buchungen,
        eigenSaldo: kDaten.saldo,              // nur eigene Soll-Buchungen
        saldo:      kDaten.saldo + bzkDaten.saldo, // gesamtSaldo inkl. BZK (für T-Konto-Summe)
      };
    } else {
      konten[nr] = {
        buchungen:  kDaten.buchungen,
        eigenSaldo: kDaten.saldo,
        saldo:      kDaten.saldo,
      };
    }
  }

  const uefeDaten = erzeugeUefeBuchungen();
  const uefe      = uefeDaten.saldo;

  // Gesamtaufwand für GuV = Summe der GUV-Saldos je Hauptkonto
  // GUV-Saldo = eigenSaldo − bzkSaldo (BZK steht im Haben des Hauptkontos)
  const gesamtAufwand = Object.entries(konten).reduce((s, [nr, k]) => {
    const bzk = mitBezugskosten && bezugskosten[nr] ? bezugskosten[nr].saldo : 0;
    return s + k.eigenSaldo - bzk;
  }, 0);
  const erfolg        = uefe - gesamtAufwand;
  const erfolgArt     = erfolg >= 0 ? 'Gewinn' : 'Verlust';
  const erfolgHoehe   = Math.abs(erfolg);

  return { konten, bezugskosten, uefeDaten, uefe, gesamtAufwand, erfolg, erfolgArt, erfolgHoehe };
}

// ── T-Konto Renderer ─────────────────────────────────────────────────────────

// Aufwandskonto AUFGABE – Soll-Einträge, Haben leer
function renderTKontoAufgabe(kontoNr, buchungen) {
  const alleZeilen = Math.max(buchungen.length, 3) + 2;
  let html = `<table style="border-collapse:collapse;width:580px;background:#fff;font-size:1.0em;">
    <thead><tr>
      <th style="width:25%;text-align:left;font-weight:600;padding:4px 0;">Soll</th>
      <th style="text-align:center;font-size:1.0em;padding:4px 0;" colspan="2"><span style="font-weight:700;">${kontoNr}</span></th>
      <th style="width:25%;text-align:right;font-weight:600;padding:4px 0;">Haben</th>
    </tr></thead><tbody>`;
  for (let i = 0; i < alleZeilen; i++) {
    const b = buchungen[i];
    html += `<tr style="border-top:2px solid #ccc;">
      <td style="padding:3px 2px;white-space:nowrap;">${b ? `${b.nr}. ${b.typ}` : '&nbsp;'}</td>
      <td style="text-align:right;padding:3px 4px 3px 2px;border-right:2px solid #999;min-width:100px;height:1.8em;">${b ? formatBetrag(b.betrag) : '&nbsp;'}</td>
      <td style="padding:3px 2px 3px 6px;min-width:100px;">&nbsp;</td>
      <td style="text-align:right;padding:3px 2px;min-width:100px;">&nbsp;</td>
    </tr>`;
  }
  html += `</tbody></table>`;
  return html;
}

// Bezugskostenkonto AUFGABE – Haben-Einträge (VE-Buchungen), Soll leer
function renderTKontoBzkAufgabe(bzkNr, buchungen) {
  const alleZeilen = Math.max(buchungen.length, 3) + 2;
  let html = `<table style="border-collapse:collapse;width:580px;background:#fff;font-size:1.0em;">
    <thead><tr>
      <th style="width:25%;text-align:left;font-weight:600;padding:4px 0;">Soll</th>
      <th style="text-align:center;font-size:1.0em;padding:4px 0;" colspan="2"><span style="font-weight:700;">${bzkNr}</span></th>
      <th style="width:25%;text-align:right;font-weight:600;padding:4px 0;">Haben</th>
    </tr></thead><tbody>`;
  for (let i = 0; i < alleZeilen; i++) {
    const b = buchungen[i];
    html += `<tr style="border-top:2px solid #ccc;">
      <td style="padding:3px 2px;white-space:nowrap;">&nbsp;</td>
      <td style="text-align:right;padding:3px 4px 3px 2px;border-right:2px solid #999;min-width:100px;height:1.8em;">&nbsp;</td>
      <td style="padding:3px 2px 3px 6px;min-width:100px;white-space:nowrap;">${b ? `${b.nr}. ${b.typ}` : '&nbsp;'}</td>
      <td style="text-align:right;padding:3px 2px;min-width:100px;">${b ? formatBetrag(b.betrag) : '&nbsp;'}</td>
    </tr>`;
  }
  html += `</tbody></table>`;
  return html;
}

// UEFE AUFGABE – Haben-Einträge, Soll leer
function renderTKontoUEFEAufgabe(buchungen) {
  const alleZeilen = Math.max(buchungen.length, 3) + 2;
  let html = `<table style="border-collapse:collapse;width:580px;background:#fff;font-size:1.0em;">
    <thead><tr>
      <th style="width:25%;text-align:left;font-weight:600;padding:4px 0;">Soll</th>
      <th style="text-align:center;font-size:1.0em;padding:4px 0;" colspan="2"><span style="font-weight:700;">5000 UEFE</span></th>
      <th style="width:25%;text-align:right;font-weight:600;padding:4px 0;">Haben</th>
    </tr></thead><tbody>`;
  for (let i = 0; i < alleZeilen; i++) {
    const b = buchungen[i];
    html += `<tr style="border-top:2px solid #ccc;">
      <td style="padding:3px 2px;white-space:nowrap;">&nbsp;</td>
      <td style="text-align:right;padding:3px 4px 3px 2px;border-right:2px solid #999;min-width:100px;height:1.8em;">&nbsp;</td>
      <td style="padding:3px 2px 3px 6px;min-width:100px;">${b ? `${b.nr}. ${b.typ}` : '&nbsp;'}</td>
      <td style="text-align:right;padding:3px 2px;min-width:100px;">${b ? formatBetrag(b.betrag) : '&nbsp;'}</td>
    </tr>`;
  }
  html += `</tbody></table>`;
  return html;
}

// Bezugskostenkonto LÖSUNG
// Soll: Gegenbuchung → Hauptkonto (= bzkSaldo)
// Haben: eigene VE-Buchungen
// Summe Soll = Summe Haben = bzkSaldo ✓
function renderTKontoBzkLoesung(bzkNr, hauptkontoNr, buchungen, saldo) {
  const alleZeilen = Math.max(buchungen.length, 3);
  let html = `<table style="border-collapse:collapse;width:580px;background:#fff;font-size:1.0em;">
    <thead><tr>
      <th style="width:25%;text-align:left;font-weight:600;padding:4px 0;">Soll</th>
      <th style="text-align:center;font-size:1.0em;padding:4px 0;" colspan="2"><span style="font-weight:700;">${bzkNr}</span></th>
      <th style="width:25%;text-align:right;font-weight:600;padding:4px 0;">Haben</th>
    </tr></thead><tbody>`;
  for (let i = 0; i < alleZeilen; i++) {
    const b = buchungen[i];
    const sollLabel  = i === 0 ? ` ${hauptkontoNr}` : '';
    const sollBetrag = i === 0 ? formatBetrag(saldo) : '';
    html += `<tr style="border-top:2px solid #ccc;">
      <td style="padding:3px 2px;white-space:nowrap;">${sollLabel}</td>
      <td style="text-align:right;padding:3px 4px 3px 2px;border-right:2px solid #999;min-width:100px;height:1.8em;">${sollBetrag}</td>
      <td style="padding:3px 2px 3px 6px;min-width:100px;white-space:nowrap;">${b ? `${b.nr}. ${b.typ}` : '&nbsp;'}</td>
      <td style="text-align:right;padding:3px 2px;min-width:100px;">${b ? formatBetrag(b.betrag) : '&nbsp;'}</td>
    </tr>`;
  }
  html += `<tr style="border-top:2px solid #888;border-bottom:4px double #888;">
    <td style="padding:3px 2px;"></td>
    <td style="text-align:right;padding:3px 4px;border-right:2px solid #999;font-weight:700;">${formatBetrag(saldo)}</td>
    <td style="padding:3px 2px 3px 6px;"></td>
    <td style="text-align:right;padding:3px 2px;font-weight:700;">${formatBetrag(saldo)}</td>
  </tr>`;
  html += `</tbody></table>`;
  return html;
}

// Aufwandskonto LÖSUNG
//
// BZK-Saldo erscheint im HABEN des Hauptkontos (Gegenbuchung zum Vorabschluss).
//
// Soll-Seite:  eigene Buchungen                      → Summe = eigenSaldo
// Haben-Seite: BZK-Übertrag (bzkSaldo)
//              GUV-Abschluss (eigenSaldo − bzkSaldo)
//              Summe Haben = bzkSaldo + (eigenSaldo − bzkSaldo) = eigenSaldo ✓
//
// GUV-Saldo = Soll-Summe − Haben-BZK = eigenSaldo − bzkSaldo
function renderTKontoLoesung(kontoNr, buchungen, eigenSaldo, bzkSaldo) {
  const guvSaldo   = eigenSaldo - (bzkSaldo || 0);
  const alleZeilen = Math.max(buchungen.length + (bzkSaldo ? 1 : 0), 3);

  const habenZeilen = [];
  if (bzkSaldo) {
    const bzkNr = BEZUGSKOSTEN_MAP[kontoNr]?.nr || '';
    habenZeilen.push({ label: bzkNr,       betrag: bzkSaldo  });
  }
  habenZeilen.push(  { label: ' 8020 GUV', betrag: guvSaldo });

  let html = `<table style="border-collapse:collapse;width:580px;background:#fff;font-size:1.0em;">
    <thead><tr>
      <th style="width:25%;text-align:left;font-weight:600;padding:4px 0;">Soll</th>
      <th style="text-align:center;font-size:1.0em;padding:4px 0;" colspan="2"><span style="font-weight:700;">${kontoNr}</span></th>
      <th style="width:25%;text-align:right;font-weight:600;padding:4px 0;">Haben</th>
    </tr></thead><tbody>`;

  for (let i = 0; i < alleZeilen; i++) {
    const b = buchungen[i];
    const h = habenZeilen[i];
    html += `<tr style="border-top:2px solid #ccc;">
      <td style="padding:3px 2px;white-space:nowrap;">${b ? `${b.nr}. ${b.typ}` : '&nbsp;'}</td>
      <td style="text-align:right;padding:3px 4px 3px 2px;border-right:2px solid #999;min-width:100px;height:1.8em;">${b ? formatBetrag(b.betrag) : '&nbsp;'}</td>
      <td style="padding:3px 2px 3px 6px;min-width:100px;white-space:nowrap;">${h ? h.label : '&nbsp;'}</td>
      <td style="text-align:right;padding:3px 2px;min-width:100px;">${h ? formatBetrag(h.betrag) : '&nbsp;'}</td>
    </tr>`;
  }

  // Summe Soll = Summe Haben = eigenSaldo ✓
  html += `<tr style="border-top:2px solid #888;border-bottom:4px double #888;">
    <td style="padding:3px 2px;"></td>
    <td style="text-align:right;padding:3px 4px;border-right:2px solid #999;font-weight:700;">${formatBetrag(eigenSaldo)}</td>
    <td style="padding:3px 2px 3px 6px;"></td>
    <td style="text-align:right;padding:3px 2px;font-weight:700;">${formatBetrag(eigenSaldo)}</td>
  </tr>`;
  html += `</tbody></table>`;
  return html;
}

// UEFE LÖSUNG – Haben-Einträge + Saldo im Soll
function renderTKontoUEFELoesung(buchungen, saldo) {
  const alleZeilen = Math.max(buchungen.length, 3);
  let html = `<table style="border-collapse:collapse;width:580px;background:#fff;font-size:1.0em;">
    <thead><tr>
      <th style="width:25%;text-align:left;font-weight:600;padding:4px 0;">Soll</th>
      <th style="text-align:center;font-size:1.0em;padding:4px 0;" colspan="2"><span style="font-weight:700;">5000 UEFE</span></th>
      <th style="width:25%;text-align:right;font-weight:600;padding:4px 0;">Haben</th>
    </tr></thead><tbody>`;
  for (let i = 0; i < alleZeilen; i++) {
    const b = buchungen[i];
    const sollLabel  = i === 0 ? ' 8020 GUV' : '';
    const sollBetrag = i === 0 ? formatBetrag(saldo) : '';
    html += `<tr style="border-top:2px solid #ccc;">
      <td style="padding:3px 2px;white-space:nowrap;">${sollLabel}</td>
      <td style="text-align:right;padding:3px 4px 3px 2px;border-right:2px solid #999;min-width:100px;height:1.8em;">${sollBetrag}</td>
      <td style="padding:3px 2px 3px 6px;min-width:100px;white-space:nowrap;">${b ? `${b.nr}. ${b.typ}` : '&nbsp;'}</td>
      <td style="text-align:right;padding:3px 2px;min-width:100px;">${b ? formatBetrag(b.betrag) : '&nbsp;'}</td>
    </tr>`;
  }
  html += `<tr style="border-top:2px solid #888;border-bottom:4px double #888;">
    <td style="padding:3px 2px;"></td>
    <td style="text-align:right;padding:3px 4px;border-right:2px solid #999;font-weight:700;">${formatBetrag(saldo)}</td>
    <td style="padding:3px 2px 3px 6px;"></td>
    <td style="text-align:right;padding:3px 2px;font-weight:700;">${formatBetrag(saldo)}</td>
  </tr>`;
  html += `</tbody></table>`;
  return html;
}

// GuV-T-Konto LÖSUNG
// guvSaldos: { '6000 AWR': eigenSaldo, ... } – nur die eigenSaldos fließen ins GuV
function renderTKontoGUV(guvSaldos, uefe, erfolgHoehe, erfolgArt) {
  const gesamtAufwand = Object.values(guvSaldos).reduce((s, v) => s + v, 0);
  const isGewinn = erfolgArt === 'Gewinn';

  const sollZeilen = [
    { label: '6000 AWR', betrag: guvSaldos['6000 AWR'] },
    { label: '6010 AWF', betrag: guvSaldos['6010 AWF'] },
    { label: '6020 AWH', betrag: guvSaldos['6020 AWH'] },
    { label: '6030 AWB', betrag: guvSaldos['6030 AWB'] },
  ];
  if (isGewinn) sollZeilen.push({ label: '3000 EK', betrag: erfolgHoehe, fett: true });

  const habenZeilen = [{ label: '5000 UEFE', betrag: uefe }];
  if (!isGewinn) habenZeilen.push({ label: '3000 EK', betrag: erfolgHoehe, fett: true });

  const maxZeilen  = Math.max(sollZeilen.length, habenZeilen.length);
  const sollSumme  = isGewinn ? gesamtAufwand + erfolgHoehe : gesamtAufwand;
  const habenSumme = isGewinn ? uefe : uefe + erfolgHoehe;

  let html = `<table style="border-collapse:collapse;width:580px;background:#fff;font-size:1.0em;">
    <thead><tr>
      <th style="width:25%;text-align:left;font-weight:600;padding:4px 0;">Soll</th>
      <th style="text-align:center;font-size:1.0em;padding:4px 0;" colspan="2"><span style="font-weight:700;">8020 GUV</span></th>
      <th style="width:25%;text-align:right;font-weight:600;padding:4px 0;">Haben</th>
    </tr></thead><tbody>`;

  for (let i = 0; i < maxZeilen; i++) {
    const s = sollZeilen[i];
    const h = habenZeilen[i];
    html += `<tr style="border-top:2px solid #ccc;">
      <td style="padding:3px 2px;white-space:nowrap;">${s ? s.label : ''}</td>
      <td style="text-align:right;padding:3px 4px 3px 2px;border-right:2px solid #999;min-width:100px;height:1.8em;">${s ? formatBetrag(s.betrag) : ''}</td>
      <td style="padding:3px 2px 3px 6px;min-width:100px;white-space:nowrap;">${h ? h.label : ''}</td>
      <td style="text-align:right;padding:3px 2px;min-width:100px;">${h ? formatBetrag(h.betrag) : ''}</td>
    </tr>`;
  }
  html += `<tr style="border-top:2px solid #888;border-bottom:4px double #888;">
    <td style="padding:3px 2px;"></td>
    <td style="text-align:right;padding:3px 4px;border-right:2px solid #999;font-weight:700;">${formatBetrag(sollSumme)}</td>
    <td style="padding:3px 2px 3px 6px;"></td>
    <td style="text-align:right;padding:3px 2px;font-weight:700;">${formatBetrag(habenSumme)}</td>
  </tr>`;
  html += `</tbody></table>`;
  return html;
}

// ── HAUPTFUNKTION ────────────────────────────────────────────────────────────

function zeigeZufaelligenBestandsabschluss() {
  const container = document.getElementById('Container');
  if (!container) return;
  container.innerHTML = '';

  const mitBezugskosten = document.getElementById('toggleBezugskosten')?.checked || false;

  const { konten, bezugskosten, uefeDaten, uefe, gesamtAufwand, erfolg, erfolgArt, erfolgHoehe } =
    erstelleZufaelligenBestandsabschluss(mitBezugskosten);

  // ── AUFGABE ────────────────────────────────────────────────────────────────
  let html = '<h2>Aufgabe</h2>';

  if (mitBezugskosten) {
    html += `<p>Die folgenden Konten weisen zum Jahresende die aufgeführten Buchungen auf.<br>
      <strong>Schließe alle Konten ab: Zuerst die Nachlasskonten über die jeweiligen Hauptkonten (Vorabschlussbuchung), dann alle Erfolgskonten über das GuV-Konto. Ermittle Art und Höhe des Unternehmenserfolgs.</strong></p>`;
  } else {
    html += `<p>Die folgenden Konten weisen zum Jahresende die aufgeführten Buchungen auf.<br>
      <strong>Schließe alle Konten ab und ermittle Art und Höhe des Unternehmenserfolgs.</strong></p>`;
  }

  if (mitBezugskosten) {
    html += `<div style="display:flex;flex-wrap:wrap;gap:18px;margin:1.5em 0 2em;">`;

    // Erst alle BZK-Unterkonten
    Object.entries(konten).forEach(([nr]) => {
      const bzk     = BEZUGSKOSTEN_MAP[nr];
      const bzkDaten = bezugskosten[nr];
      if (bzk && bzkDaten) {
        html += `<div>${renderTKontoBzkAufgabe(bzk.nr, bzkDaten.buchungen)}</div>`;
      }
    });

    // Dann alle Hauptkonten
    Object.entries(konten).forEach(([nr, data]) => {
      html += `<div>${renderTKontoAufgabe(nr, data.buchungen)}</div>`;
    });

    html += `<div>${renderTKontoUEFEAufgabe(uefeDaten.buchungen)}</div>`;
    html += `</div>`;
  } else {
    html += `<div style="display:flex;flex-wrap:wrap;gap:18px;margin:1.5em 0 2em;">`;
    Object.entries(konten).forEach(([nr, data]) => {
      html += `<div>${renderTKontoAufgabe(nr, data.buchungen)}</div>`;
    });
    html += `<div>${renderTKontoUEFEAufgabe(uefeDaten.buchungen)}</div>`;
    html += `</div>`;
  }

  // ── LÖSUNG ─────────────────────────────────────────────────────────────────
  html += `<h2 style="margin-top:2.5em">Lösung</h2>`;

  // Buchungssätze
  html += `<strong>Buchungssätze:</strong>
  <table style="white-space:nowrap;background-color:#fff;font-family:courier;min-width:700px;"><tbody>`;

  if (mitBezugskosten) {
    html += `<tr><td colspan="4" style="padding:4px 0;color:#555;font-style:italic;font-size:0.95em;">Schritt 1: Vorabschluss – Bezugskostenkonten über Hauptkonten abschließen</td></tr>`;
    Object.entries(konten).forEach(([nr]) => {
      const bzk     = BEZUGSKOSTEN_MAP[nr];
      const bzkDaten = bezugskosten[nr];
      if (bzk && bzkDaten) {
        html += `<tr>
          <td style="padding:2px 10px 2px 0;white-space:nowrap;">${bzk.nr}</td>
          <td style="padding:2px 10px;text-align:center;">an</td>
          <td style="padding:2px 10px;white-space:nowrap;">${nr}</td>
          <td style="padding:2px 0;text-align:right;min-width:120px;">${formatBetrag(bzkDaten.saldo)} €</td>
        </tr>`;
      }
    });
    html += `<tr><td colspan="4" style="padding:6px 0;"></td></tr>`;
    html += `<tr><td colspan="4" style="padding:4px 0;color:#555;font-style:italic;font-size:0.95em;">Schritt 2: Aufwandskonten über GuV abschließen</td></tr>`;
  }

  // Buchungssatz GUV an Hauptkonto: Betrag = eigenSaldo − bzkSaldo
  Object.entries(konten).forEach(([nr, data]) => {
    const bzkS = mitBezugskosten && bezugskosten[nr] ? bezugskosten[nr].saldo : 0;
    const guvS = data.eigenSaldo - bzkS;
    html += `<tr>
      <td style="padding:2px 10px 2px 0;white-space:nowrap;">8020 GUV</td>
      <td style="padding:2px 10px;text-align:center;">an</td>
      <td style="padding:2px 10px;white-space:nowrap;">${nr}</td>
      <td style="padding:2px 0;text-align:right;min-width:120px;">${formatBetrag(guvS)} €</td>
    </tr>`;
  });

  html += `<tr><td colspan="4" style="padding:4px 0;"></td></tr>`;
  html += `<tr>
    <td style="padding:2px 10px 2px 0;white-space:nowrap;">5000 UEFE</td>
    <td style="padding:2px 10px;text-align:center;">an</td>
    <td style="padding:2px 10px;white-space:nowrap;">8020 GUV</td>
    <td style="padding:2px 0;text-align:right;min-width:120px;">${formatBetrag(uefe)} €</td>
  </tr>`;

  html += `<tr><td colspan="4" style="padding:4px 0;"></td></tr>`;

  if (erfolg >= 0) {
    html += `<tr style="font-weight:700;">
      <td style="padding:2px 10px 2px 0;white-space:nowrap;">8020 GUV</td>
      <td style="padding:2px 10px;text-align:center;">an</td>
      <td style="padding:2px 10px;white-space:nowrap;">3000 EK</td>
      <td style="padding:2px 0;text-align:right;min-width:120px;">${formatBetrag(erfolgHoehe)} €</td>
    </tr>`;
  } else {
    html += `<tr style="font-weight:700;">
      <td style="padding:2px 10px 2px 0;white-space:nowrap;">3000 EK</td>
      <td style="padding:2px 10px;text-align:center;">an</td>
      <td style="padding:2px 10px;white-space:nowrap;">8020 GUV</td>
      <td style="padding:2px 0;text-align:right;min-width:120px;">${formatBetrag(erfolgHoehe)} €</td>
    </tr>`;
  }
  html += `</tbody></table>`;

  // Abgeschlossene T-Konten
  html += `<br>`;
  html += `<div style="display:flex;flex-wrap:wrap;gap:18px;margin-bottom:2em;">`;

  if (mitBezugskosten) {
    // Erst alle BZK-Konten
    Object.entries(konten).forEach(([nr]) => {
      const bzk     = BEZUGSKOSTEN_MAP[nr];
      const bzkDaten = bezugskosten[nr];
      if (bzk && bzkDaten) {
        html += `<div>${renderTKontoBzkLoesung(bzk.nr, nr, bzkDaten.buchungen, bzkDaten.saldo)}</div>`;
      }
    });

    // Dann alle Hauptkonten: eigenSaldo + bzkSaldo übergeben
    Object.entries(konten).forEach(([nr, data]) => {
      const bzkDaten = bezugskosten[nr];
      html += `<div>${renderTKontoLoesung(nr, data.buchungen, data.eigenSaldo, bzkDaten ? bzkDaten.saldo : 0)}</div>`;
    });
  } else {
    Object.entries(konten).forEach(([nr, data]) => {
      html += `<div>${renderTKontoLoesung(nr, data.buchungen, data.eigenSaldo, 0)}</div>`;
    });
  }

  html += `<div>${renderTKontoUEFELoesung(uefeDaten.buchungen, uefeDaten.saldo)}</div>`;
  html += `</div>`;

  // GuV-Konto: GUV-Saldo = eigenSaldo − bzkSaldo je Hauptkonto
  const guvSaldos = {};
  Object.entries(konten).forEach(([nr, data]) => {
    const bzkS = mitBezugskosten && bezugskosten[nr] ? bezugskosten[nr].saldo : 0;
    guvSaldos[nr] = data.eigenSaldo - bzkS;
  });

  html += `<br>`;
  html += renderTKontoGUV(guvSaldos, uefe, erfolgHoehe, erfolgArt);

  html += `<p style="font-size:1.15em;font-weight:bold;margin-top:1.8em;">
    Unternehmenserfolg: ${erfolgArt} in Höhe von ${formatBetrag(erfolgHoehe)} €
  </p>`;

  container.innerHTML = html;
}

// ── KI-PROMPT ────────────────────────────────────────────────────────────────

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Buchführungs-Assistent für Schüler der Realschule (BwR), 8. Klasse. Du hilfst beim Verständnis des Jahresabschlusses – speziell beim Abschluss der Erfolgskonten (Aufwandskonten und Ertragskonten) über das GuV-Konto.

Aufgabe:
- Gib KEINE fertigen Buchungssätze, T-Konten oder Ergebnisse vor.
- Führe die Schüler durch gezielte Fragen und Hinweise zur richtigen Lösung.
- Ziel: Lernförderung, nicht das Abnehmen der Denkarbeit.

Pädagogischer Ansatz:
- Frage nach den vorliegenden Salden und was diese bedeuten.
- Stelle gezielte Rückfragen, um den Stand des Schülers zu verstehen.
- Beantworte deine Rückfragen nicht selbst – hake bei falschen Antworten nach.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Erst wenn alle Teilschritte richtig beantwortet wurden, bestätige den vollständigen Abschluss.

---

THEMA: ABSCHLUSS DER AUFWANDSKONTEN ÜBER DAS GUV-KONTO (ggf. mit Bezugskostenkonten)

Aufwandskonten:
- 6000 AWR – Aufwendungen für Rohstoffe
- 6010 AWF – Aufwendungen für Fremdbauteile
- 6020 AWH – Aufwendungen für Hilfsstoffe
- 6030 AWB – Aufwendungen für Betriebsstoffe

Bezugskostenkonten (Unterkonten, optional):
- 6002 NR– Nachlässe Rohstoffe → wird über 6000 AWR abgeschlossen
- 6012 NF– Nachlässe Fremdbauteile → wird über 6010 AWF abgeschlossen
- 6022 NH– Nachlässe Hilfsstoffe → wird über 6020 AWH abgeschlossen
- 6032 NB– Nachlässe Betriebsstoffe → wird über 6030 AWB abgeschlossen

Ertragskonto:
- 5000 UEFE – Umsatzerlöse aus Fertigerzeugnissen

GuV-Konto:
- 8020 GUV – Gewinn- und Verlustkonto

Eigenkapitalkonto:
- 3000 EK – Eigenkapital

---

METHODIK BEI RÜCKFRAGEN:
- Was bedeuten VE, BK, KA auf der Soll-Seite des Aufwandskontos?
- Wie ermittle ich den Saldo eines Aufwandskontos (nur Soll-Einträge)?
- Warum steht der Saldo beim Abschluss auf der Haben-Seite des Aufwandskontos?
- Wohin wird der Saldo übertragen – ins Soll oder ins Haben des GuV?
- Wie ermittle ich den Unternehmenserfolg aus dem GuV-Konto?
- Wohin geht der Erfolg (Gewinn/Verlust) beim Abschluss des GuV?
- Warum werden Bezugskostenkonten zuerst (Vorabschlussbuchung) über das Hauptkonto abgeschlossen?

---

BUCHUNGSSÄTZE – SCHRITT FÜR SCHRITT

Schritt 0 (nur wenn Nachlässe vorhanden) – Vorabschluss Bezugskostenkonten:
  6002 NR an 6000 AWR | Saldo
  6012 NF an 6010 AWF | Saldo
  6022 NH an 6020 AWH | Saldo
  6032 NB an 6030 AWB | Saldo
  → Der Saldo des BZK-Kontos erscheint im Hauptkonto auf der Haben-Seite.

Schritt 1 – Saldo der Aufwandskonten ermitteln:
  Saldo = Summe aller Soll-Buchungen (inkl. übertragener BZK-Salden)

Schritt 2 – Aufwandskonten abschließen (je ein Buchungssatz pro Konto):
  8020 GUV an 6000 AWR | eigenSaldo (nur eigene Buchungen, ohne BZK)
  8020 GUV an 6010 AWF | eigenSaldo
  8020 GUV an 6020 AWH | eigenSaldo
  8020 GUV an 6030 AWB | eigenSaldo

Schritt 3 – Ertragskonto abschließen:
  5000 UEFE an 8020 GUV | Betrag

Schritt 4 – GuV abschließen:
  Gewinn → 8020 GUV an 3000 EK | Gewinnbetrag
  Verlust → 3000 EK an 8020 GUV | Verlustbetrag

---

HÄUFIGE SCHÜLERFEHLER:
- Saldo falsch berechnet (einzelne Buchungen vergessen)
- Aufwandskonten ins Haben des GuV statt ins Soll gebucht
- Summe und Saldo verwechselt
- EK bei Gewinn auf falscher Seite eingetragen
- Summen im T-Konto stimmen nicht überein
- Nachlässe direkt über GuV abgeschlossen (statt Vorabschluss über Hauptkonto)
- BZK-Saldo nicht zum Hauptkonto-Saldo addiert

---

Tonalität:
- Freundlich, ermutigend, Realschulniveau
- Einfache Sprache, kurze Antworten (1–2 Sätze)
- Gelegentlich Emojis 📊✅❓💡

Was du NICHT tust:
- Keine fertigen Lösungen nennen, bevor der Schüler sie selbst erarbeitet hat
- Nicht vorrechnen, bevor der Schüler es versucht hat
`;

function kopiereKiPrompt() {
  navigator.clipboard.writeText(KI_ASSISTENT_PROMPT).then(() => {
    const btn = document.getElementById('kiPromptKopierenBtn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Kopiert!`;
    btn.classList.add('ki-prompt-btn--success');
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.classList.remove('ki-prompt-btn--success');
    }, 2500);
  }).catch(() => {
    alert('Kopieren nicht möglich. Bitte manuell aus dem Textfeld kopieren.');
  });
}

function toggleKiPromptVorschau() {
  const vorschau = document.getElementById('kiPromptVorschau');
  const btn = document.getElementById('kiPromptToggleBtn');
  const isHidden = getComputedStyle(vorschau).display === 'none';
  if (isHidden) {
    vorschau.style.display = 'block';
    btn.textContent = 'Vorschau ausblenden ▲';
  } else {
    vorschau.style.display = 'none';
    btn.textContent = 'Prompt anzeigen ▼';
  }
}

document.addEventListener('DOMContentLoaded', function () {
  zeigeZufaelligenBestandsabschluss();
  const vorschauEl = document.getElementById('kiPromptVorschau');
  if (vorschauEl) vorschauEl.textContent = KI_ASSISTENT_PROMPT;
});