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
  const nachlaesse = {};
  const bzkUnterkonten = {};

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

// ── Hilfsfunktion: maximale Buchungsanzahl einer Gruppe ermitteln ─────────────

function maxBuchungsanzahl(buchungsArrays) {
  return Math.max(...buchungsArrays.map(b => b.length));
}

// ── T-Konto Renderer ─────────────────────────────────────────────────────────

// Aufwandskonto AUFGABE – Soll-Einträge, Haben leer
function renderTKontoAufgabe(kontoNr, buchungen, minZeilen) {
  const alleZeilen = Math.max(buchungen.length, minZeilen || 3) + 2;
  let html = `<table class="tkonto" style="border-collapse:collapse;width:100%;background:#fff;font-size:1.0em;">
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
function renderTKontoNachlassAufgabe(bzkNr, buchungen, minZeilen) {
  const alleZeilen = Math.max(buchungen.length, minZeilen || 3) + 2;
  let html = `<table class="tkonto" style="border-collapse:collapse;width:100%;background:#fff;font-size:1.0em;">
    <thead><tr>
      <th style="width:25%;text-align:left;font-weight:600;padding:4px 0;min-width:80px;">Soll</th>
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

// BZK-Unterkonto AUFGABE – Soll-Einträge (Haben leer)
function renderTKontoBzkUnterkontoAufgabe(bzkNr, buchungen, minZeilen) {
  const alleZeilen = Math.max(buchungen.length, minZeilen || 3) + 2;
  let html = `<table class="tkonto" style="border-collapse:collapse;width:100%;background:#fff;font-size:1.0em;">
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
function renderTKontoUEFEAufgabe(buchungen, minZeilen) {
  const alleZeilen = Math.max(buchungen.length, minZeilen || 3) + 2;
  let html = `<table class="tkonto" style="border-collapse:collapse;width:100%;background:#fff;font-size:1.0em;">
    <thead><tr>
      <th style="width:25%;text-align:left;font-weight:600;padding:4px 0;min-width:80px;">Soll</th>
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

// GUV AUFGABE – komplett leer, aber mit genug Zeilen für alle Hauptkonten + UEFE + Erfolg
function renderTKontoGUVAufgabe(minZeilen) {
  // Soll-Seite: 4 Aufwandskonten + ggf. Gewinn → mindestens 5 Zeilen
  // Haben-Seite: UEFE + ggf. Verlust → mindestens 2 Zeilen
  // Wir nehmen das Maximum beider Seiten + 2 Puffer
  const alleZeilen = Math.max(minZeilen || 6, 6) + 2;
  let html = `<table class="tkonto" style="border-collapse:collapse;width:100%;background:#fff;font-size:1.0em;">
    <thead><tr>
      <th style="width:25%;text-align:left;font-weight:600;padding:4px 0;">Soll</th>
      <th style="text-align:center;font-size:1.0em;padding:4px 0;" colspan="2"><span style="font-weight:700;">8020 GUV</span></th>
      <th style="width:25%;text-align:right;font-weight:600;padding:4px 0;">Haben</th>
    </tr></thead><tbody>`;
  for (let i = 0; i < alleZeilen; i++) {
    html += `<tr style="border-top:2px solid #ccc;">
      <td style="padding:3px 2px;white-space:nowrap;">&nbsp;</td>
      <td style="text-align:right;padding:3px 4px 3px 2px;border-right:2px solid #999;min-width:100px;height:1.8em;">&nbsp;</td>
      <td style="padding:3px 2px 3px 6px;min-width:100px;">&nbsp;</td>
      <td style="text-align:right;padding:3px 2px;min-width:100px;">&nbsp;</td>
    </tr>`;
  }
  html += `</tbody></table>`;
  return html;
}

// ── Lösungs-T-Konten ──────────────────────────────────────────────────────────

// Nachlasskonto LÖSUNG
function renderTKontoNachlassLoesung(bzkNr, hauptkontoNr, buchungen, saldo, minZeilen) {
  const alleZeilen = Math.max(buchungen.length, minZeilen || 3);
  let html = `<table class="tkonto" style="border-collapse:collapse;width:100%;background:#fff;font-size:1.0em;">
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
function renderTKontoBzkUnterkontoLoesung(bzkNr, hauptkontoNr, buchungen, saldo, minZeilen) {
  const alleZeilen = Math.max(buchungen.length, minZeilen || 3);
  let html = `<table class="tkonto" style="border-collapse:collapse;width:100%;background:#fff;font-size:1.0em;">
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
function renderTKontoLoesung(kontoNr, buchungen, eigenSaldo, nachlassSaldo, bzkSaldo, minZeilen) {
  const guvSaldo = eigenSaldo - (nachlassSaldo || 0) + (bzkSaldo || 0);
  const gesamtSollSumme = eigenSaldo + (bzkSaldo || 0);

  const sollZeilen = [...buchungen.map(b => ({ label: `${b.nr}. ${BUCHUNGSTYP_LABEL[b.typ] || b.typ}`, betrag: b.betrag }))];
  if (bzkSaldo) {
    const bzkNr = BZK_UNTERKONTO_MAP[kontoNr]?.nr || '';
    sollZeilen.push({ label: ` ${bzkNr}`, betrag: bzkSaldo });
  }

  const habenZeilen = [];
  if (nachlassSaldo) {
    const nachlassNr = NACHLASS_MAP[kontoNr]?.nr || '';
    habenZeilen.push({ label: nachlassNr, betrag: nachlassSaldo });
  }
  habenZeilen.push({ label: ' 8020 GUV', betrag: guvSaldo });

  const alleZeilen = Math.max(sollZeilen.length, habenZeilen.length, minZeilen || 3);

  let html = `<table class="tkonto" style="border-collapse:collapse;width:100%;background:#fff;font-size:1.0em;">
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

// UEFE LÖSUNG
function renderTKontoUEFELoesung(buchungen, saldo, minZeilen) {
  const alleZeilen = Math.max(buchungen.length, minZeilen || 3);
  let html = `<table class="tkonto" style="border-collapse:collapse;width:100%;background:#fff;font-size:1.0em;">
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

  let html = `<table class="tkonto" style="border-collapse:collapse;width:100%;background:#fff;font-size:1.0em;">
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

  // ── Gleichmäßige Zeilenzahlen pro Gruppe ermitteln ────────────────────────

  // BZK-Unterkonten Aufgabe: alle auf gleiche Länge
  const bzkBuchungsArrays = Object.keys(konten).map(nr => bzkUnterkonten[nr]?.buchungen || []);
  const maxBzkAufgabe = mitBzkUnterkonten ? maxBuchungsanzahl(bzkBuchungsArrays) : 0;

  // BZK-Unterkonten Lösung: Soll = eigene Buchungen, Haben = 1 Gegenbuchung → max(buchungen, 1)
  const maxBzkLoesung = mitBzkUnterkonten
    ? Math.max(...Object.keys(konten).map(nr => Math.max((bzkUnterkonten[nr]?.buchungen || []).length, 1)))
    : 0;

  // Nachlasskonten Aufgabe: alle auf gleiche Länge
  const nlBuchungsArrays = Object.keys(konten).map(nr => nachlaesse[nr]?.buchungen || []);
  const maxNlAufgabe = mitNachlaesse ? maxBuchungsanzahl(nlBuchungsArrays) : 0;

  // Nachlasskonten Lösung: Haben = eigene Buchungen, Soll = 1 Gegenbuchung → max(buchungen, 1)
  const maxNlLoesung = mitNachlaesse
    ? Math.max(...Object.keys(konten).map(nr => Math.max((nachlaesse[nr]?.buchungen || []).length, 1)))
    : 0;

  // Hauptkonten (Aufgabe): alle auf gleiche Länge
  const hauptBuchungsArrays = Object.values(konten).map(k => k.buchungen);
  const maxHaupt = maxBuchungsanzahl(hauptBuchungsArrays);

  // Hauptkonten (Lösung): Soll = buchungen + ggf. BZK-Übertrag, Haben = ggf. Nachlass-Übertrag + GUV
  // Beide Seiten müssen gleich lang sein → nimm das Max beider Seiten über alle Konten
  const maxHauptLoesung = Math.max(...Object.values(konten).map(k => {
    const sollZeilen = k.buchungen.length + (k.bzkSaldo ? 1 : 0);
    const habenZeilen = (k.nachlassSaldo ? 1 : 0) + 1; // +1 für GUV-Abschlussbuchung
    return Math.max(sollZeilen, habenZeilen);
  }));

  // UEFE Aufgabe/Lösung: eigene Buchungsanzahl (nur 1 Konto, kein Gruppenabgleich nötig)
  const uefeBuchungenAnzahl = uefeDaten.buchungen.length;

  // GUV Aufgabe: großzügig leer (4 AWs + UEFE + Erfolg + Puffer)
  const guvAufgabeZeilen = 6;

  // ── AUFGABE ────────────────────────────────────────────────────────────────
  let html = '<h2>Aufgabe</h2>';

  let aufgabentext = 'Die folgenden Konten weisen zum Jahresende die aufgeführten Buchungen auf.<br>Schließe alle Konten ordnungsgemäß ab und bilde die Buchungssätze.';
  html += `<p>${aufgabentext}</p>`;

  // Aufgabe: 2-Spalten-Grid für den Druck
  html += `<div class="tkonto-grid">`;

  if (hatUnterkonten) {
    if (mitBzkUnterkonten) {
      Object.entries(konten).forEach(([nr]) => {
        const bzkU = BZK_UNTERKONTO_MAP[nr];
        const bzkDaten = bzkUnterkonten[nr];
        if (bzkU && bzkDaten) {
          html += `<div class="tkonto-cell">${renderTKontoBzkUnterkontoAufgabe(bzkU.nr, bzkDaten.buchungen, maxBzkAufgabe)}</div>`;
        }
      });
    }
    if (mitNachlaesse) {
      Object.entries(konten).forEach(([nr]) => {
        const nl = NACHLASS_MAP[nr];
        const nlDaten = nachlaesse[nr];
        if (nl && nlDaten) {
          html += `<div class="tkonto-cell">${renderTKontoNachlassAufgabe(nl.nr, nlDaten.buchungen, maxNlAufgabe)}</div>`;
        }
      });
    }
  }

  Object.entries(konten).forEach(([nr, data]) => {
    html += `<div class="tkonto-cell">${renderTKontoAufgabe(nr, data.buchungen, maxHaupt)}</div>`;
  });

  html += `<div class="tkonto-cell">${renderTKontoUEFEAufgabe(uefeDaten.buchungen, uefeBuchungenAnzahl)}</div>`;

  html += `</div>`; // end tkonto-grid

  html += `<div class="tkonto-fullwidth">${renderTKontoGUVAufgabe(guvAufgabeZeilen)}</div>`;

  // ── LÖSUNG ─────────────────────────────────────────────────────────────────
  html += `<h2 class="loesung" style="margin-top:2.5em">Lösung</h2>`;

  // Buchungssätze
  html += `<strong>Buchungssätze:</strong>
  <table style="white-space:nowrap;background-color:#fff;font-family:courier;min-width:700px;"><tbody>`;

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
  html += `<div class="tkonto-grid">`;

  if (mitBzkUnterkonten) {
    Object.entries(konten).forEach(([nr]) => {
      const bzkU = BZK_UNTERKONTO_MAP[nr];
      const bzkDaten = bzkUnterkonten[nr];
      if (bzkU && bzkDaten) {
        html += `<div class="tkonto-cell">${renderTKontoBzkUnterkontoLoesung(bzkU.nr, nr, bzkDaten.buchungen, bzkDaten.saldo, maxBzkLoesung)}</div>`;
      }
    });
  }

  if (mitNachlaesse) {
    Object.entries(konten).forEach(([nr]) => {
      const nl = NACHLASS_MAP[nr];
      const nlDaten = nachlaesse[nr];
      if (nl && nlDaten) {
        html += `<div class="tkonto-cell">${renderTKontoNachlassLoesung(nl.nr, nr, nlDaten.buchungen, nlDaten.saldo, maxNlLoesung)}</div>`;
      }
    });
  }

  Object.entries(konten).forEach(([nr, data]) => {
    html += `<div class="tkonto-cell">${renderTKontoLoesung(nr, data.buchungen, data.eigenSaldo, data.nachlassSaldo, data.bzkSaldo, maxHauptLoesung)}</div>`;
  });

  html += `<div class="tkonto-cell">${renderTKontoUEFELoesung(uefeDaten.buchungen, uefeDaten.saldo, Math.max(uefeBuchungenAnzahl, maxHauptLoesung))}</div>`;

  // GUV-Konto in der Lösung ebenfalls in das Grid
  const guvSaldos = {};
  Object.entries(konten).forEach(([nr, data]) => {
    guvSaldos[nr] = data.guvSaldo;
  });
  // GUV Lösung: Soll hat 4 AWs (+ ggf. EK Gewinn), Haben hat UEFE (+ ggf. EK Verlust)
  // maxZeilen wird intern berechnet – kein minZeilen-Parameter nötig
  html += `<div class="tkonto-cell">${renderTKontoGUV(guvSaldos, uefe, erfolgHoehe, erfolgArt)}</div>`;

  html += `</div>`; // end tkonto-grid

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

// ── DRUCK-FUNKTION ───────────────────────────────────────────────────────────
function drucken() {
  window.print();
}

function addPrintCSS() {
  const style = document.createElement('style');
  style.innerHTML = `
    /* ── Bildschirm: flexibles Grid ──────────────────────────────────────── */
    .tkonto-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 18px;
      margin: 1.5em 0 2em;
    }
    .tkonto-cell {
      width: 580px;
      max-width: 100%;
      box-sizing: border-box;
    }
    .tkonto-fullwidth {
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      margin: 1em 0 2em;
    }

    /* ── Druck: exakt 2 Konten pro Zeile ─────────────────────────────────── */
    @media print {
      body * { visibility: hidden; }
      #Container, #Container * { visibility: visible; }
      #Container {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }

      /* Aufgabe und Lösung sauber trennen */
      #Container h2:first-of-type {
        page-break-after: avoid;
      }
      #Container h2.loesung {
        page-break-before: always !important;
        margin-top: 60px !important;
      }

      /* Grid: 2 gleichbreite Spalten */
      .tkonto-grid {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 12px 20px !important;
        width: 100% !important;
        margin: 0.8em 0 1.2em !important;
      }

      /* Jede Zelle füllt ihre Spalte */
      .tkonto-cell {
        width: 100% !important;
        max-width: 100% !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      /* Vollbreites Konto (GUV Aufgabe) – überspannt beide Spalten */
      .tkonto-fullwidth {
        width: 100% !important;
        max-width: 100% !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        margin: 0.8em 0 1em !important;
      }

      /* T-Konten-Tabellen füllen die Zelle */
      .tkonto-cell table,
      .tkonto {
        width: 100% !important;
        font-size: 0.85em !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }

      @page {
        margin: 1.5cm 0.8cm;
      }

      h2 { page-break-after: avoid; }
    }
  `;
  document.head.appendChild(style);
}

// Sofort beim Laden ausführen
document.addEventListener('DOMContentLoaded', function () {
  zeigeZufaelligenBestandsabschluss();
  addPrintCSS();

  const vorschauEl = document.getElementById('kiPromptVorschau');
  if (vorschauEl) {
    vorschauEl.value = KI_ASSISTENT_PROMPT;
    vorschauEl.style.display = 'none';
  }
});