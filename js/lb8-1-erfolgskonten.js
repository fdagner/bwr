function formatBetrag(value) {
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function generateRandomSaldo(min, max, round = 100) {
  return Math.round((Math.random() * (max - min) + min) / round) * round;
}

// ── Buchungstyp-Bezeichnungen ────────────────────────────────────────────────

const BUCHUNGSTYP_LABEL = {
  'VE': '4400 VE',
  'BK': '2800 BK',
  'KA': '2880 KA',
};

// ── Nachlässe-Unterkonten (Haben-Buchungen → mindern Aufwand) ──────────────

const NACHLASS_MAP = {
  '6000 AWR': { nr: '6002 NR', label: 'Nachlässe für Rohstoffe',      hauptkonto: '6000 AWR' },
  '6010 AWF': { nr: '6012 NF', label: 'Nachlässe für Fremdbauteile',  hauptkonto: '6010 AWF' },
  '6020 AWH': { nr: '6022 NH', label: 'Nachlässe für Hilfsstoffe',    hauptkonto: '6020 AWH' },
  '6030 AWB': { nr: '6032 NB', label: 'Nachlässe für Betriebsstoffe', hauptkonto: '6030 AWB' },
};

// ── Bezugskosten-Unterkonten (Soll-Buchungen → erhöhen Aufwand) ────────────

const BZK_UNTERKONTO_MAP = {
  '6000 AWR': { nr: '6001 BZKR', label: 'Bezugskosten für Rohstoffe',      hauptkonto: '6000 AWR' },
  '6010 AWF': { nr: '6011 BZKF', label: 'Bezugskosten für Fremdbauteile',  hauptkonto: '6010 AWF' },
  '6020 AWH': { nr: '6021 BZKH', label: 'Bezugskosten für Hilfsstoffe',    hauptkonto: '6020 AWH' },
  '6030 AWB': { nr: '6031 BZKB', label: 'Bezugskosten für Betriebsstoffe', hauptkonto: '6030 AWB' },
};

// ── Buchungen für Nachlässe (Haben-Buchungen im Unterkonto) ─────────────────

function erzeugeNachlassBuchungen(hauptTyp) {
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

// ── Buchungen für BZK-Unterkonten (Soll-Buchungen im Unterkonto) ────────────

function erzeugeBzkUnterkontoBuchungen(hauptTyp) {
  const rahmen = {
    AWR: [500, 5000],
    AWF: [50,   500],
    AWH: [10,   150],
    AWB: [20,   200],
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

function erstelleZufaelligenBestandsabschluss(mitNachlaesse, mitBzkUnterkonten) {
  const kontenTypen = {
    '6000 AWR': 'AWR',
    '6010 AWF': 'AWF',
    '6020 AWH': 'AWH',
    '6030 AWB': 'AWB',
  };

  const konten = {};
  const nachlaesse = {};    // Haben-seitige Unterkonten (mindern Aufwand)
  const bzkUnterkonten = {}; // Soll-seitige Unterkonten (erhöhen Aufwand)

  for (const [nr, typ] of Object.entries(kontenTypen)) {
    const kDaten = erzeugeKontoBuchungen(typ);
    let nachlassSaldo = 0;
    let bzkSaldo = 0;

    if (mitNachlaesse) {
      const nDaten = erzeugeNachlassBuchungen(typ);
      nachlaesse[nr] = nDaten;
      nachlassSaldo = nDaten.saldo;
    }

    if (mitBzkUnterkonten) {
      const bDaten = erzeugeBzkUnterkontoBuchungen(typ);
      bzkUnterkonten[nr] = bDaten;
      bzkSaldo = bDaten.saldo;
    }

    // eigenSaldo = Summe der eigenen Buchungen im Hauptkonto
    // guvSaldo   = eigenSaldo − nachlassSaldo + bzkSaldo
    //   (Nachlässe stehen im Haben → mindern; BZK-Unterkonten werden auf Soll übertragen → erhöhen)
    konten[nr] = {
      buchungen:   kDaten.buchungen,
      eigenSaldo:  kDaten.saldo,
      nachlassSaldo,
      bzkSaldo,
      guvSaldo:    kDaten.saldo - nachlassSaldo + bzkSaldo,
    };
  }

  const uefeDaten = erzeugeUefeBuchungen();
  const uefe      = uefeDaten.saldo;

  const gesamtAufwand = Object.values(konten).reduce((s, k) => s + k.guvSaldo, 0);
  const erfolg        = uefe - gesamtAufwand;
  const erfolgArt     = erfolg >= 0 ? 'Gewinn' : 'Verlust';
  const erfolgHoehe   = Math.abs(erfolg);

  return { konten, nachlaesse, bzkUnterkonten, uefeDaten, uefe, gesamtAufwand, erfolg, erfolgArt, erfolgHoehe };
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
      <td style="padding:3px 2px;white-space:nowrap;">${b ? `${b.nr}. ${BUCHUNGSTYP_LABEL[b.typ] || b.typ}` : '&nbsp;'}</td>
      <td style="text-align:right;padding:3px 4px 3px 2px;border-right:2px solid #999;min-width:100px;height:1.8em;">${b ? formatBetrag(b.betrag) : '&nbsp;'}</td>
      <td style="padding:3px 2px 3px 6px;min-width:100px;">&nbsp;</td>
      <td style="text-align:right;padding:3px 2px;min-width:100px;">&nbsp;</td>
    </tr>`;
  }
  html += `</tbody></table>`;
  return html;
}

// Nachlasskonto AUFGABE – Haben-Einträge (Soll leer)
function renderTKontoNachlassAufgabe(bzkNr, buchungen) {
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
      <td style="padding:3px 2px 3px 6px;min-width:100px;white-space:nowrap;">${b ? `${b.nr}. ${BUCHUNGSTYP_LABEL[b.typ] || b.typ}` : '&nbsp;'}</td>
      <td style="text-align:right;padding:3px 2px;min-width:100px;">${b ? formatBetrag(b.betrag) : '&nbsp;'}</td>
    </tr>`;
  }
  html += `</tbody></table>`;
  return html;
}

// BZK-Unterkonto AUFGABE – Soll-Einträge (Haben leer) – wie normales Aufwandskonto
function renderTKontoBzkUnterkontoAufgabe(bzkNr, buchungen) {
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
      <td style="padding:3px 2px;white-space:nowrap;">${b ? `${b.nr}. ${BUCHUNGSTYP_LABEL[b.typ] || b.typ}` : '&nbsp;'}</td>
      <td style="text-align:right;padding:3px 4px 3px 2px;border-right:2px solid #999;min-width:100px;height:1.8em;">${b ? formatBetrag(b.betrag) : '&nbsp;'}</td>
      <td style="padding:3px 2px 3px 6px;min-width:100px;">&nbsp;</td>
      <td style="text-align:right;padding:3px 2px;min-width:100px;">&nbsp;</td>
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
      <td style="padding:3px 2px 3px 6px;min-width:100px;">${b ? `${b.nr}. ${BUCHUNGSTYP_LABEL[b.typ] || b.typ}` : '&nbsp;'}</td>
      <td style="text-align:right;padding:3px 2px;min-width:100px;">${b ? formatBetrag(b.betrag) : '&nbsp;'}</td>
    </tr>`;
  }
  html += `</tbody></table>`;
  return html;
}

// ── Lösungs-T-Konten ──────────────────────────────────────────────────────────

// Nachlasskonto LÖSUNG
// Soll: Gegenbuchung → Hauptkonto (= nachlassSaldo)
// Haben: eigene VE-Buchungen
function renderTKontoNachlassLoesung(bzkNr, hauptkontoNr, buchungen, saldo) {
  const alleZeilen = Math.max(buchungen.length, 3);
  let html = `<table style="border-collapse:collapse;width:580px;background:#fff;font-size:1.0em;">
    <thead><tr>
      <th style="width:25%;text-align:left;font-weight:600;padding:4px 0;">Soll</th>
      <th style="text-align:center;font-size:1.0em;padding:4px 0;" colspan="2"><span style="font-weight:700;">${bzkNr}</span></th>
      <th style="width:25%;text-align:right;font-weight:600;padding:4px 0;">Haben</th>
    </tr></thead><tbody>`;
  for (let i = 0; i < alleZeilen; i++) {
    const b = buchungen[i];
    html += `<tr style="border-top:2px solid #ccc;">
      <td style="padding:3px 2px;white-space:nowrap;">${i === 0 ? ` ${hauptkontoNr}` : ''}</td>
      <td style="text-align:right;padding:3px 4px 3px 2px;border-right:2px solid #999;min-width:100px;height:1.8em;">${i === 0 ? formatBetrag(saldo) : ''}</td>
      <td style="padding:3px 2px 3px 6px;min-width:100px;white-space:nowrap;">${b ? `${b.nr}. ${BUCHUNGSTYP_LABEL[b.typ] || b.typ}` : '&nbsp;'}</td>
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

// BZK-Unterkonto LÖSUNG
// Soll: eigene VE-Buchungen
// Haben: Gegenbuchung → Hauptkonto (= bzkSaldo) → Abschluss auf Haben-Seite
function renderTKontoBzkUnterkontoLoesung(bzkNr, hauptkontoNr, buchungen, saldo) {
  const alleZeilen = Math.max(buchungen.length, 3);
  let html = `<table style="border-collapse:collapse;width:580px;background:#fff;font-size:1.0em;">
    <thead><tr>
      <th style="width:25%;text-align:left;font-weight:600;padding:4px 0;">Soll</th>
      <th style="text-align:center;font-size:1.0em;padding:4px 0;" colspan="2"><span style="font-weight:700;">${bzkNr}</span></th>
      <th style="width:25%;text-align:right;font-weight:600;padding:4px 0;">Haben</th>
    </tr></thead><tbody>`;
  for (let i = 0; i < alleZeilen; i++) {
    const b = buchungen[i];
    html += `<tr style="border-top:2px solid #ccc;">
      <td style="padding:3px 2px;white-space:nowrap;">${b ? `${b.nr}. ${BUCHUNGSTYP_LABEL[b.typ] || b.typ}` : '&nbsp;'}</td>
      <td style="text-align:right;padding:3px 4px 3px 2px;border-right:2px solid #999;min-width:100px;height:1.8em;">${b ? formatBetrag(b.betrag) : '&nbsp;'}</td>
      <td style="padding:3px 2px 3px 6px;min-width:100px;white-space:nowrap;">${i === 0 ? ` ${hauptkontoNr}` : '&nbsp;'}</td>
      <td style="text-align:right;padding:3px 2px;min-width:100px;">${i === 0 ? formatBetrag(saldo) : '&nbsp;'}</td>
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
// Soll-Seite: eigene Buchungen + ggf. BZK-Übertrag (Soll)
// Haben-Seite: ggf. Nachlass-Übertrag (Haben) + GUV-Abschluss
//
// guvSaldo = eigenSaldo - nachlassSaldo + bzkSaldo
// Soll-Summe = eigenSaldo + bzkSaldo
// Haben-Summe = nachlassSaldo + guvSaldo = nachlassSaldo + eigenSaldo - nachlassSaldo + bzkSaldo = eigenSaldo + bzkSaldo ✓
function renderTKontoLoesung(kontoNr, buchungen, eigenSaldo, nachlassSaldo, bzkSaldo) {
  const guvSaldo = eigenSaldo - (nachlassSaldo || 0) + (bzkSaldo || 0);
  const gesamtSollSumme = eigenSaldo + (bzkSaldo || 0);

  // Soll-Zeilen: eigene Buchungen, dann BZK-Übertrag
  const sollZeilen = [...buchungen.map(b => ({ label: `${b.nr}. ${BUCHUNGSTYP_LABEL[b.typ] || b.typ}`, betrag: b.betrag }))];
  if (bzkSaldo) {
    const bzkNr = BZK_UNTERKONTO_MAP[kontoNr]?.nr || '';
    sollZeilen.push({ label: ` ${bzkNr}`, betrag: bzkSaldo });
  }

  // Haben-Zeilen: Nachlass-Übertrag, dann GUV-Abschluss
  const habenZeilen = [];
  if (nachlassSaldo) {
    const nachlassNr = NACHLASS_MAP[kontoNr]?.nr || '';
    habenZeilen.push({ label: nachlassNr, betrag: nachlassSaldo });
  }
  habenZeilen.push({ label: ' 8020 GUV', betrag: guvSaldo });

  const alleZeilen = Math.max(sollZeilen.length, habenZeilen.length);

  let html = `<table style="border-collapse:collapse;width:580px;background:#fff;font-size:1.0em;">
    <thead><tr>
      <th style="width:25%;text-align:left;font-weight:600;padding:4px 0;">Soll</th>
      <th style="text-align:center;font-size:1.0em;padding:4px 0;" colspan="2"><span style="font-weight:700;">${kontoNr}</span></th>
      <th style="width:25%;text-align:right;font-weight:600;padding:4px 0;">Haben</th>
    </tr></thead><tbody>`;

  for (let i = 0; i < alleZeilen; i++) {
    const s = sollZeilen[i];
    const h = habenZeilen[i];
    html += `<tr style="border-top:2px solid #ccc;">
      <td style="padding:3px 2px;white-space:nowrap;">${s ? s.label : '&nbsp;'}</td>
      <td style="text-align:right;padding:3px 4px 3px 2px;border-right:2px solid #999;min-width:100px;height:1.8em;">${s ? formatBetrag(s.betrag) : '&nbsp;'}</td>
      <td style="padding:3px 2px 3px 6px;min-width:100px;white-space:nowrap;">${h ? h.label : '&nbsp;'}</td>
      <td style="text-align:right;padding:3px 2px;min-width:100px;">${h ? formatBetrag(h.betrag) : '&nbsp;'}</td>
    </tr>`;
  }

  html += `<tr style="border-top:2px solid #888;border-bottom:4px double #888;">
    <td style="padding:3px 2px;"></td>
    <td style="text-align:right;padding:3px 4px;border-right:2px solid #999;font-weight:700;">${formatBetrag(gesamtSollSumme)}</td>
    <td style="padding:3px 2px 3px 6px;"></td>
    <td style="text-align:right;padding:3px 2px;font-weight:700;">${formatBetrag(gesamtSollSumme)}</td>
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
    html += `<tr style="border-top:2px solid #ccc;">
      <td style="padding:3px 2px;white-space:nowrap;">${i === 0 ? ' 8020 GUV' : ''}</td>
      <td style="text-align:right;padding:3px 4px 3px 2px;border-right:2px solid #999;min-width:100px;height:1.8em;">${i === 0 ? formatBetrag(saldo) : ''}</td>
      <td style="padding:3px 2px 3px 6px;min-width:100px;white-space:nowrap;">${b ? `${b.nr}. ${BUCHUNGSTYP_LABEL[b.typ] || b.typ}` : '&nbsp;'}</td>
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

  const mitNachlaesse    = document.getElementById('toggleNachlaesse')?.checked || false;
  const mitBzkUnterkonten = document.getElementById('toggleBzkUnterkonten')?.checked || false;

  const { konten, nachlaesse, bzkUnterkonten, uefeDaten, uefe, gesamtAufwand, erfolg, erfolgArt, erfolgHoehe } =
    erstelleZufaelligenBestandsabschluss(mitNachlaesse, mitBzkUnterkonten);

  const hatUnterkonten = mitNachlaesse || mitBzkUnterkonten;

  // ── AUFGABE ────────────────────────────────────────────────────────────────
  let html = '<h2>Aufgabe</h2>';

  let aufgabentext = '';
  if (mitNachlaesse && mitBzkUnterkonten) {
    aufgabentext = `Die folgenden Konten weisen zum Jahresende die aufgeführten Buchungen auf.<br>
      <strong>Schließe alle Konten ab: Zuerst die Bezugskosten- und Nachlasskonten über die jeweiligen Hauptkonten (Vorabschlussbuchungen), dann alle Erfolgskonten über das GuV-Konto. Ermittle Art und Höhe des Unternehmenserfolgs.</strong>`;
  } else if (mitNachlaesse) {
    aufgabentext = `Die folgenden Konten weisen zum Jahresende die aufgeführten Buchungen auf.<br>
      <strong>Schließe alle Konten ab: Zuerst die Nachlasskonten über die jeweiligen Hauptkonten (Vorabschlussbuchung), dann alle Erfolgskonten über das GuV-Konto. Ermittle Art und Höhe des Unternehmenserfolgs.</strong>`;
  } else if (mitBzkUnterkonten) {
    aufgabentext = `Die folgenden Konten weisen zum Jahresende die aufgeführten Buchungen auf.<br>
      <strong>Schließe alle Konten ab: Zuerst die Bezugskostenunterkonten über die jeweiligen Hauptkonten (Vorabschlussbuchung), dann alle Erfolgskonten über das GuV-Konto. Ermittle Art und Höhe des Unternehmenserfolgs.</strong>`;
  } else {
    aufgabentext = `Die folgenden Konten weisen zum Jahresende die aufgeführten Buchungen auf.<br>
      <strong>Schließe alle Konten ab und ermittle Art und Höhe des Unternehmenserfolgs.</strong>`;
  }
  html += `<p>${aufgabentext}</p>`;

  html += `<div style="display:flex;flex-wrap:wrap;gap:18px;margin:1.5em 0 2em;">`;

  if (hatUnterkonten) {
    // BZK-Unterkonten (Soll-seitig) zuerst
    if (mitBzkUnterkonten) {
      Object.entries(konten).forEach(([nr]) => {
        const bzkU = BZK_UNTERKONTO_MAP[nr];
        const bzkDaten = bzkUnterkonten[nr];
        if (bzkU && bzkDaten) {
          html += `<div>${renderTKontoBzkUnterkontoAufgabe(bzkU.nr, bzkDaten.buchungen)}</div>`;
        }
      });
    }
    // Nachlässe (Haben-seitig) danach
    if (mitNachlaesse) {
      Object.entries(konten).forEach(([nr]) => {
        const nl = NACHLASS_MAP[nr];
        const nlDaten = nachlaesse[nr];
        if (nl && nlDaten) {
          html += `<div>${renderTKontoNachlassAufgabe(nl.nr, nlDaten.buchungen)}</div>`;
        }
      });
    }
  }

  // Hauptkonten
  Object.entries(konten).forEach(([nr, data]) => {
    html += `<div>${renderTKontoAufgabe(nr, data.buchungen)}</div>`;
  });

  html += `<div>${renderTKontoUEFEAufgabe(uefeDaten.buchungen)}</div>`;
  html += `</div>`;

  // ── LÖSUNG ─────────────────────────────────────────────────────────────────
  html += `<h2 style="margin-top:2.5em">Lösung</h2>`;

  // Buchungssätze
  html += `<strong>Buchungssätze:</strong>
  <table style="white-space:nowrap;background-color:#fff;font-family:courier;min-width:700px;"><tbody>`;

  // Schritt 1: BZK-Unterkonten über Hauptkonten (erhöhen Aufwand: AWR an BZKR)
  if (mitBzkUnterkonten) {
    html += `<tr><td colspan="4" style="padding:4px 0;color:#555;font-style:italic;font-size:0.95em;">Schritt 1a: Vorabschluss – Bezugskostenunterkonten über Hauptkonten abschließen</td></tr>`;
    Object.entries(konten).forEach(([nr]) => {
      const bzkU = BZK_UNTERKONTO_MAP[nr];
      const bzkDaten = bzkUnterkonten[nr];
      if (bzkU && bzkDaten) {
        html += `<tr>
          <td style="padding:2px 10px 2px 0;white-space:nowrap;">${nr}</td>
          <td style="padding:2px 10px;text-align:center;">an</td>
          <td style="padding:2px 10px;white-space:nowrap;">${bzkU.nr}</td>
          <td style="padding:2px 0;text-align:right;min-width:120px;">${formatBetrag(bzkDaten.saldo)} €</td>
        </tr>`;
      }
    });
    html += `<tr><td colspan="4" style="padding:6px 0;"></td></tr>`;
  }

  // Schritt 1b: Nachlasskonten über Hauptkonten (mindern Aufwand: NR an AWR)
  if (mitNachlaesse) {
    const schrittLabel = mitBzkUnterkonten ? 'Schritt 1b' : 'Schritt 1';
    html += `<tr><td colspan="4" style="padding:4px 0;color:#555;font-style:italic;font-size:0.95em;">${schrittLabel}: Vorabschluss – Nachlasskonten über Hauptkonten abschließen</td></tr>`;
    Object.entries(konten).forEach(([nr]) => {
      const nl = NACHLASS_MAP[nr];
      const nlDaten = nachlaesse[nr];
      if (nl && nlDaten) {
        html += `<tr>
          <td style="padding:2px 10px 2px 0;white-space:nowrap;">${nl.nr}</td>
          <td style="padding:2px 10px;text-align:center;">an</td>
          <td style="padding:2px 10px;white-space:nowrap;">${nr}</td>
          <td style="padding:2px 0;text-align:right;min-width:120px;">${formatBetrag(nlDaten.saldo)} €</td>
        </tr>`;
      }
    });
    html += `<tr><td colspan="4" style="padding:6px 0;"></td></tr>`;
  }

  const schrittGUV = hatUnterkonten ? 'Schritt 2' : 'Schritt 1';
  html += `<tr><td colspan="4" style="padding:4px 0;color:#555;font-style:italic;font-size:0.95em;">${schrittGUV}: Aufwandskonten über GuV abschließen</td></tr>`;

  // GUV-Buchungssatz je Hauptkonto mit korrektem guvSaldo
  Object.entries(konten).forEach(([nr, data]) => {
    html += `<tr>
      <td style="padding:2px 10px 2px 0;white-space:nowrap;">8020 GUV</td>
      <td style="padding:2px 10px;text-align:center;">an</td>
      <td style="padding:2px 10px;white-space:nowrap;">${nr}</td>
      <td style="padding:2px 0;text-align:right;min-width:120px;">${formatBetrag(data.guvSaldo)} €</td>
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

  if (mitBzkUnterkonten) {
    Object.entries(konten).forEach(([nr]) => {
      const bzkU = BZK_UNTERKONTO_MAP[nr];
      const bzkDaten = bzkUnterkonten[nr];
      if (bzkU && bzkDaten) {
        html += `<div>${renderTKontoBzkUnterkontoLoesung(bzkU.nr, nr, bzkDaten.buchungen, bzkDaten.saldo)}</div>`;
      }
    });
  }

  if (mitNachlaesse) {
    Object.entries(konten).forEach(([nr]) => {
      const nl = NACHLASS_MAP[nr];
      const nlDaten = nachlaesse[nr];
      if (nl && nlDaten) {
        html += `<div>${renderTKontoNachlassLoesung(nl.nr, nr, nlDaten.buchungen, nlDaten.saldo)}</div>`;
      }
    });
  }

  Object.entries(konten).forEach(([nr, data]) => {
    html += `<div>${renderTKontoLoesung(nr, data.buchungen, data.eigenSaldo, data.nachlassSaldo, data.bzkSaldo)}</div>`;
  });

  html += `<div>${renderTKontoUEFELoesung(uefeDaten.buchungen, uefeDaten.saldo)}</div>`;
  html += `</div>`;

  // GuV-Konto
  const guvSaldos = {};
  Object.entries(konten).forEach(([nr, data]) => {
    guvSaldos[nr] = data.guvSaldo;
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

THEMA: ABSCHLUSS DER AUFWANDSKONTEN ÜBER DAS GUV-KONTO (ggf. mit Bezugskosten- und/oder Nachlassunterkonten)

Aufwandskonten:
- 6000 AWR – Aufwendungen für Rohstoffe
- 6010 AWF – Aufwendungen für Fremdbauteile
- 6020 AWH – Aufwendungen für Hilfsstoffe
- 6030 AWB – Aufwendungen für Betriebsstoffe

Bezugskosten-Unterkonten (Soll-Buchungen → ERHÖHEN den Aufwand):
- 6001 BZKR – Bezugskosten Rohstoffe → wird über 6000 AWR abgeschlossen
- 6011 BZKF – Bezugskosten Fremdbauteile → wird über 6010 AWF abgeschlossen
- 6021 BZKH – Bezugskosten Hilfsstoffe → wird über 6020 AWH abgeschlossen
- 6031 BZKB – Bezugskosten Betriebsstoffe → wird über 6030 AWB abgeschlossen
- Buchungsweg: Buchungen stehen im SOLL des BZK-Unterkontos
  Vorabschluss: Hauptkonto (z. B. 6000 AWR) an BZK-Unterkonto (6001 BZKR)
  → Saldo erscheint im HABEN des BZK-Unterkontos, im SOLL des Hauptkontos
  → Erhöht den Saldo (und damit den GuV-Betrag) des Hauptkontos

Nachlass-Unterkonten (Haben-Buchungen → MINDERN den Aufwand):
- 6002 NR – Nachlässe Rohstoffe → wird über 6000 AWR abgeschlossen
- 6012 NF – Nachlässe Fremdbauteile → wird über 6010 AWF abgeschlossen
- 6022 NH – Nachlässe Hilfsstoffe → wird über 6020 AWH abgeschlossen
- 6032 NB – Nachlässe Betriebsstoffe → wird über 6030 AWB abgeschlossen
- Buchungsweg: Buchungen stehen im HABEN des Nachlasskontos
  Vorabschluss: Nachlasskonto (z. B. 6002 NR) an Hauptkonto (6000 AWR)
  → Saldo erscheint im SOLL des Nachlasskontos, im HABEN des Hauptkontos
  → Mindert den Saldo (und damit den GuV-Betrag) des Hauptkontos

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
- Warum werden BZK-Unterkonten zuerst (Vorabschlussbuchung) über das Hauptkonto abgeschlossen?
- Was ist der Unterschied zwischen Bezugskosten-Unterkonten (Soll-seitig) und Nachlass-Unterkonten (Haben-seitig)?

---

BUCHUNGSSÄTZE – SCHRITT FÜR SCHRITT

Schritt 1a (nur wenn BZK-Unterkonten vorhanden) – Vorabschluss Bezugskosten:
  6000 AWR an 6001 BZKR | Saldo  (Saldo erscheint im Soll des Hauptkontos)
  6010 AWF an 6011 BZKF | Saldo
  6020 AWH an 6021 BZKH | Saldo
  6030 AWB an 6031 BZKB | Saldo

Schritt 1b (nur wenn Nachlasskonten vorhanden) – Vorabschluss Nachlässe:
  6002 NR an 6000 AWR | Saldo  (Saldo erscheint im Haben des Hauptkontos)
  6012 NF an 6010 AWF | Saldo
  6022 NH an 6020 AWH | Saldo
  6032 NB an 6030 AWB | Saldo

Schritt 2 – GuV-Saldo je Hauptkonto ermitteln:
  GuV-Saldo = eigenSaldo + bzkSaldo − nachlassSaldo

Schritt 3 – Aufwandskonten abschließen:
  8020 GUV an 6000 AWR | GuV-Saldo
  8020 GUV an 6010 AWF | GuV-Saldo
  8020 GUV an 6020 AWH | GuV-Saldo
  8020 GUV an 6030 AWB | GuV-Saldo

Schritt 4 – Ertragskonto abschließen:
  5000 UEFE an 8020 GUV | Betrag

Schritt 5 – GuV abschließen:
  Gewinn → 8020 GUV an 3000 EK | Gewinnbetrag
  Verlust → 3000 EK an 8020 GUV | Verlustbetrag

---

HÄUFIGE SCHÜLERFEHLER:
- Saldo falsch berechnet (einzelne Buchungen vergessen)
- Aufwandskonten ins Haben des GuV statt ins Soll gebucht
- Summe und Saldo verwechselt
- EK bei Gewinn auf falscher Seite eingetragen
- Summen im T-Konto stimmen nicht überein
- BZK-Unterkonten falsch abgeschlossen (Buchungsrichtung verwechselt)
- Nachlässe wie BZK-Unterkonten behandelt (Soll/Haben vertauscht)
- GuV-Saldo nicht korrekt um BZK und Nachlässe bereinigt

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