// ============================================================================
// BESTANDSKONTEN – GESCHÄFTSFÄLLE MIT KONTO-AUSWAHL
// ============================================================================

// Globale Variable für ausgewähltes Unternehmen
let kunde = '<i>[Modellunternehmen]</i>';

// YAML-Daten
let yamlData = [];

// ============================================================================
// KONTEN-DEFINITIONEN
// ============================================================================

const kontenDefinitionen = {
  'GR':   { beschreibung: 'Grundstücke',                        seite: 'aktiv'  },
  'BVG':  { beschreibung: 'Betriebs- und Geschäftsgebäude',     seite: 'aktiv'  },
  'MA':   { beschreibung: 'Maschinen',                           seite: 'aktiv'  },
  'FP':   { beschreibung: 'Fuhrpark',                            seite: 'aktiv'  },
  'BM':   { beschreibung: 'Büromaschinen',                       seite: 'aktiv'  },
  'BGA':  { beschreibung: 'Betriebs- und Geschäftsausstattung',  seite: 'aktiv'  },
  'FO':   { beschreibung: 'Forderungen aus L. u. L.',            seite: 'aktiv'  },
  'BK':   { beschreibung: 'Bank',                                seite: 'aktiv'  },
  'KA':   { beschreibung: 'Kasse',                               seite: 'aktiv'  },
  'EK':   { beschreibung: 'Eigenkapital',                        seite: 'passiv' },
  'KBKV': { beschreibung: 'Kurzfristige Bankverbindlichkeiten',  seite: 'passiv' },
  'LBKV': { beschreibung: 'Langfristige Bankverbindlichkeiten',  seite: 'passiv' },
  'VE':   { beschreibung: 'Verbindlichkeiten aus L. u. L.',      seite: 'passiv' },
};

// ============================================================================
// GESCHÄFTSFALL-DEFINITIONEN
//
// typ: 'einfach'         → ein Soll, ein Haben
//      'zusammengesetzt' → mehrere Soll- oder Haben-Konten
//      'einfach_ust'     → Kauf mit VORST (zwei Sollzeilen)
//      'verkauf_ust'     → Verkauf mit USt (zwei Habenzeilen: FO + USt)
//
// branchenKat: Branchen-Kategorie für den Filter
//   'MA'     → Fertigungsbetriebe, Handwerk, Industrie
//   'handel' → Einzel-/Großhandel, Möbel, KFZ, Bau
//   'BGA'    → Büro, Beratung, IT
//   'alle'   → passt immer (neutrale GF wie Kreditaufnahme, Bareinzahlung)
//
// artikelListe: synchron zu vorlagen – welcher Artikel soll auf dem Beleg stehen?
//   Fehlt artikelListe, wird artikel als Fallback verwendet.
// ============================================================================

const lieferantFallbackMap = {
  'MA':     'Maschinenbau Fischer KG',
  'handel': 'Großhandel Meyer GmbH',
  'BGA':    'Bürobedarf Hofmann',
  'alle':   'Lieferant AG',
};

const branchenKatMap = {
  'MA':     ['Maschinen'],
  'handel': ['Einzelhandel', 'Großhandel'],
  'BGA':    ['Büro'],
  'FP':    ['Fuhrpark'],
  'alle':   null,
};

function getBranchenKat(branche) {
  if (!branche) return 'alle';
  for (const [kat, branchen] of Object.entries(branchenKatMap)) {
    if (branchen && branchen.includes(branche)) return kat;
  }
  return 'alle';
}

// ── Einfache Geschäftsfälle (kein USt) ───────────────────────────────────────

const gfEinfach = [
    {
    id: 'tilgung_ve_bank',
    typ: 'einfach', mitUst: false,
    branchenKat: 'alle',
    soll: 'VE', haben: 'BK',
    kontFilter: ['VE', 'BK'],
    belegtyp: 'kontoauszug',
    artikel: 'Zahlung Rechnung Nr. 874',
    minBetrag: 5000, maxBetrag: 40000,
    vorlagen: [
      '{kunde} begleicht eine offene Rechnung bei {schuldner} per Banküberweisung',
      '{kunde} überweist den ausstehenden Rechnungsbetrag an {schuldner}',
      '{kunde} zahlt eine offene Liefererschuld an {schuldner} durch Banküberweisung',
    ],
    // kein artikelListe – Kontoauszug braucht keinen Artikel
  },
  {
    id: 'tilgung_ve_kasse',
    typ: 'einfach', mitUst: false,
    branchenKat: 'alle',
    soll: 'VE', haben: 'KA',
    kontFilter: ['VE', 'KA'],
    belegtyp: null,
    artikel: 'Barzahlung offene Rechnung Nr. 387', einheit: 'Lst.',
    minBetrag: 500, maxBetrag: 5000,
    vorlagen: [
      '{kunde} begleicht eine offene Rechnung bei {schuldner} in bar',
      '{kunde} zahlt eine Liefererschuld an {schuldner} in bar',
    ],
    // kein artikelListe – Quittung verwendet artikel fix
  },
  {
    id: 'eingang_fo_bank',
    typ: 'einfach', mitUst: false,
    branchenKat: 'alle',
    soll: 'BK', haben: 'FO',
    kontFilter: ['BK', 'FO'],
    belegtyp: 'kontoauszug',
    artikel: 'Zahlungseingang Kunde',
    minBetrag: 1000, maxBetrag: 20000,
    vorlagen: [
      'Unser Kunde {schuldner} begleicht seine offene Rechnung per Banküberweisung',
      '{schuldner} überweist uns den ausstehenden Rechnungsbetrag',
      'Es geht eine Überweisung von {schuldner} für eine offene Rechnung auf unserem Bankkonto ein',
    ],
  },
  {
    id: 'eingang_fo_kasse',
    typ: 'einfach', mitUst: false,
    branchenKat: 'alle',
    soll: 'KA', haben: 'FO',
    kontFilter: ['KA', 'FO'],
    belegtyp: null,
    artikel: 'Barzahlung Kundenrechnung', einheit: 'Lst.',
    minBetrag: 200, maxBetrag: 5000,
    vorlagen: [
      'Unser Kunde {schuldner} begleicht seine offene Rechnung in bar',
      '{schuldner} zahlt uns den offenen Rechnungsbetrag in bar',
      'Es geht eine Barzahlung von {schuldner} für eine offene Rechnung ein',
    ],
  },
  {
    id: 'tilgung_lbkv_bank',
    typ: 'einfach', mitUst: false,
    branchenKat: 'alle',
    soll: 'LBKV', haben: 'BK',
    kontFilter: ['LBKV', 'BK'],
    belegtyp: 'kontoauszug',
    artikel: 'Tilgung langfr. Bankdarlehen',
    minBetrag: 5000, maxBetrag: 50000,
    vorlagen: [
      '{kunde} zahlt eine Darlehensrate per Banküberweisung zurück',
      '{kunde} tilgt eine Rate des langfristigen Bankdarlehens per Überweisung',
      '{kunde} zahlt eine Kreditrate des Fünfjahres­kredits per Überweisung',
    ],
  },
  {
    id: 'tilgung_kbkv_bank',
    typ: 'einfach', mitUst: false,
    branchenKat: 'alle',
    soll: 'KBKV', haben: 'BK',
    kontFilter: ['KBKV', 'BK'],
    belegtyp: 'kontoauszug',
    artikel: 'Tilgung Kontokorrentkredit',
    minBetrag: 3000, maxBetrag: 20000,
    vorlagen: [
      '{kunde} tilgt den kurzfristigen Bankkredit durch Banküberweisung',
      '{kunde} begleicht einen Kredit mit Laufzeit von 10 Monaten per Lastschrift',
    ],
  },
  {
    id: 'umwandlung_ve_kbkv',
    typ: 'einfach', mitUst: false,
    branchenKat: 'alle',
    soll: 'VE', haben: 'KBKV',
    kontFilter: ['VE', 'KBKV'],
    belegtyp: null,
    minBetrag: 5000, maxBetrag: 40000,
    vorlagen: [
      '{kunde} wandelt eine Liefererschuld in einen kurzfristigen Bankkredit um',
      'Eine Verbindlichkeit gegenüber einem Lieferanten wird in einen kurzfristigen Kredit umgewandelt',
      '{kunde} wandelt eine offene Liefererschuld in einen Kredit mit Laufzeit von 9 Monaten um',
    ],
  },
   {
    id: 'umwandlung_kbkv_lbkv',
    typ: 'einfach', mitUst: false,
    branchenKat: 'alle',
    soll: 'KBKV', haben: 'LBKV',
    kontFilter: ['KBKV', 'LBKV'],
    belegtyp: null,
    minBetrag: 5000, maxBetrag: 40000,
    vorlagen: [
      '{kunde} wandelt einen kurzfristigen in einen langfristigen Bankkredit um',
      'Ein kurzfristiger Bankkredit wird in einen langfristiges Darlehen umgewandelt',
    ],
  },
  {
    id: 'aufnahme_lbkv_bank',
    typ: 'einfach', mitUst: false,
    branchenKat: 'alle',
    soll: 'BK', haben: 'LBKV',
    kontFilter: ['BK', 'LBKV'],
    belegtyp: 'kontoauszug',
    artikel: 'Aufnahme Bankdarlehen',
    minBetrag: 20000, maxBetrag: 100000,
    vorlagen: [
      '{kunde} nimmt ein langfristiges Bankdarlehen auf – der Betrag wird dem Konto gutgeschrieben',
      '{kunde} erhält einen Kredit mit einer Laufzeit von 2 Jahren, der auf das Bankkonto überwiesen wird',
    ],
  },
  {
    id: 'bareinzahlung_bank',
    typ: 'einfach', mitUst: false,
    branchenKat: 'alle',
    soll: 'BK', haben: 'KA',
    kontFilter: ['BK', 'KA'],
    belegtyp: 'kontoauszug',
    artikel: 'Bareinzahlung',
    minBetrag: 1000, maxBetrag: 10000,
    vorlagen: [
      '{kunde} zahlt Bargeld aus der Kasse auf das Bankkonto ein',
      '{kunde} legt einen Teil des Kassenbestands auf das Bankkonto',
    ],
  },
  {
    id: 'barabhebung_kasse',
    typ: 'einfach', mitUst: false,
    branchenKat: 'alle',
    soll: 'KA', haben: 'BK',
    kontFilter: ['KA', 'BK'],
    belegtyp: 'kontoauszug',
    artikel: 'Barabhebung',
    minBetrag: 500, maxBetrag: 5000,
    vorlagen: [
      '{kunde} hebt Bargeld vom Bankkonto ab',
      '{kunde} entnimmt dem Bankkonto Bargeld für die Kasse',
    ],
  },
];

// ── Einfache Geschäftsfälle MIT USt (Einkauf) ────────────────────────────────

const gfEinfachUst = [
  {
    id: 'kauf_lw_ziel_ust',
    typ: 'einfach_ust', mitUst: true, ustSatz: 0.19,
    branchenKat: 'FP',
    soll: 'FP', haben: 'VE',
    kontFilter: ['FP', 'VE'],
    einheit: 'Stück',
    belegtyp: 'rechnung',
    minBetrag: 30000, maxBetrag: 80000,
    vorlagen: [
      '{kunde} kauft einen neuen Lieferwagen auf Ziel, hierfür geht eine Rechnung ein',
      '{kunde} schafft einen Kastenwagen auf Ziel an, es geht eine Rechnung ein',
      '{kunde} erwirbt einen neuen Transporter gegen Rechnung',
    ],
    artikelListe: [
      'Lieferwagen',
      'Kastenwagen',
      'Transporter',
    ],
  },
  {
    id: 'kauf_ma_ziel_ust',
    typ: 'einfach_ust', mitUst: true, ustSatz: 0.19,
    branchenKat: 'MA',
    soll: 'MA', haben: 'VE',
    kontFilter: ['MA', 'VE'],
    einheit: 'Stück',
    belegtyp: 'rechnung',
    minBetrag: 20000, maxBetrag: 150000,
    vorlagen: [
      '{kunde} kauft eine neue Fertigungsmaschine gegen Rechnung',
      '{kunde} schafft eine Stanzmaschine auf Ziel an, es geht eine Rechnung ein',
      '{kunde} erwirbt eine CNC-Fräse gegen Rechnung',
      '{kunde} kauft eine Nutfräse auf Ziel, hierfür geht eine Rechnung ein',
    ],
    artikelListe: [
      'Fertigungsmaschine',
      'Stanzmaschine',
      'CNC-Fräse',
      'Nutfräse',
    ],
  },
  {
    id: 'kauf_bga_ziel_ust',
    typ: 'einfach_ust', mitUst: true, ustSatz: 0.19,
    branchenKat: 'BGA',
    soll: 'BGA', haben: 'VE',
    kontFilter: ['BGA', 'VE'],
    einheit: 'Stück',
    belegtyp: 'rechnung',
    minBetrag: 500, maxBetrag: 8000,
    vorlagen: [
      '{kunde} kauft neue Büroausstattung auf Ziel, hierfür geht eine Rechnung ein',
      '{kunde} erwirbt neue Büromöbel gegen Rechnung',
      '{kunde} schafft neue Schreibtische und Stühle gegen Rechnung an',
    ],
    artikelListe: [
      'Büroausstattung',
      'Büromöbel',
      'Schreibtische und Stühle',
    ],
  },
    {
    id: 'kauf_bga_kasse_ust',
    typ: 'einfach_ust', mitUst: true, ustSatz: 0.19,
    branchenKat: 'BGA',
    soll: 'BGA', haben: 'KA',
    kontFilter: ['BGA', 'KA'],
    einheit: 'Stück',
    belegtyp: 'kassenbon',
    minBetrag: 500, maxBetrag: 2000,
    vorlagen: [
      '{kunde} erwirbt einen neuen Bürostuhl gegen Rechnung',
      '{kunde} schafft einen neuen Schreibtisch in bar an',
    ],
    artikelListe: [
      'Bürostuhl',
      'Schreibtisch',
    ],
  },
  {
    id: 'kauf_bm_ziel_ust',
    typ: 'einfach_ust', mitUst: true, ustSatz: 0.19,
    branchenKat: 'BGA',
    soll: 'BM', haben: 'VE',
    kontFilter: ['BM', 'VE'],
    einheit: 'Stück',
    belegtyp: 'rechnung',
    minBetrag: 500, maxBetrag: 6000,
    vorlagen: [
      '{kunde} kauft einen neuen Drucker auf Ziel, es geht eine Rechnung ein',
      '{kunde} erwirbt ein Multifunktionsgerät gegen Rechnung',
      '{kunde} schafft einen neuen Kopierer gegen Rechnung an',
    ],
    artikelListe: [
      'Drucker',
      'Multifunktionsgerät',
      'Kopierer',
    ],
  },
    {
    id: 'kauf_bm_kasse_ust',
    typ: 'einfach_ust', mitUst: true, ustSatz: 0.19,
    branchenKat: 'BGA',
    soll: 'BM', haben: 'KA',
    kontFilter: ['BM', 'KA'],
    einheit: 'Stück',
    belegtyp: 'kassenbon',
    minBetrag: 500, maxBetrag: 2000,
    vorlagen: [
      '{kunde} kauft einen neuen Drucker in bar',
      '{kunde} erwirbt ein Multifunktionsgerät in bar',
      '{kunde} schafft einen neuen Kopierer in bar an',
    ],
    artikelListe: [
      'Drucker',
      'Multifunktionsgerät',
      'Kopierer',
    ],
  },
  {
    id: 'kauf_fp_bank_ust',
    typ: 'einfach_ust', mitUst: true, ustSatz: 0.19,
    branchenKat: 'FP',
    soll: 'FP', haben: 'BK',
    kontFilter: ['FP', 'BK'],
    einheit: 'Stück',
    belegtyp: 'kontoauszug',
    minBetrag: 15000, maxBetrag: 60000,
    vorlagen: [
      '{kunde} kauft einen neuen Firmenwagen, das Bankkonto wird per Lastschrift belastet',
      '{kunde} erwirbt ein Firmenfahrzeug, der Betrag wird per Lastschrift abgebucht',
      '{kunde} kauft einen neuen Lieferwagen, der Kaufpreis wird vom Bankkonto abgebucht',
    ],
    artikelListe: [
      'Kauf PKW Nr. 387',
      'Kauf Firmenfahrzeug Re 837',
      'Kauf Firmenfahrzeug Nr. 3807',
    ],
  },
];

// ── Verkauf MIT USt (Ausgangsrechnung) ───────────────────────────────────────

const gfVerkaufUst = [
  {
    id: 'verkauf_fp_fo_ust',
    typ: 'verkauf_ust', mitUst: true, ustSatz: 0.19,
    branchenKat: 'alle',
    soll: 'FO', haben: 'FP',
    kontFilter: ['FO', 'FP'],
    einheit: 'Stück',
    belegtyp: 'rechnung',
    minBetrag: 5000, maxBetrag: 40000,
    vorlagen: [
      '{kunde} verkauft einen gebrauchten Firmenwagen auf Rechnung',
      '{kunde} veräußert ein altes Firmenfahrzeug gegen Rechnung',
      '{kunde} verkauft einen ausgemusterten Transporter auf Rechnung',
    ],
    artikelListe: [
      'PKW (gebraucht)',
      'Firmenfahrzeug (gebraucht)',
      'Transporter (gebraucht)',
    ],
  },
  {
    id: 'verkauf_ma_fo_ust',
    typ: 'verkauf_ust', mitUst: true, ustSatz: 0.19,
    branchenKat: 'MA',
    soll: 'FO', haben: 'MA',
    kontFilter: ['FO', 'MA'],
    einheit: 'Stück',
    belegtyp: 'rechnung',
    minBetrag: 3000, maxBetrag: 30000,
    vorlagen: [
      '{kunde} verkauft eine gebrauchte Fertigungsmaschine auf Rechnung',
      '{kunde} veräußert eine ausgemusterte Drehmaschine gegen Rechnung',
      '{kunde} verkauft eine alte Stanzmaschine auf Rechnung',
    ],
    artikelListe: [
      'Fertigungsmaschine (gebraucht)',
      'Drehmaschine (gebraucht)',
      'Stanzmaschine (gebraucht)',
    ],
  },
  {
    id: 'verkauf_bm_fo_ust',
    typ: 'verkauf_ust', mitUst: true, ustSatz: 0.19,
    branchenKat: 'alle',
    soll: 'FO', haben: 'BM',
    kontFilter: ['FO', 'BM'],
    einheit: 'Stück',
    belegtyp: 'rechnung',
    minBetrag: 300, maxBetrag: 3000,
    vorlagen: [
      '{kunde} verkauft einen gebrauchten Computer auf Rechnung',
      '{kunde} veräußert ausgemusterte Bürotechnik auf Rechnung',
      '{kunde} verkauft einen alten Drucker auf Rechnung',
    ],
    artikelListe: [
      'Computer (gebraucht)',
      'Bürotechnik (gebraucht)',
      'Drucker (gebraucht)',
    ],
  },
];

// ── Zusammengesetzte Geschäftsfälle ──────────────────────────────────────────

const gfZusammengesetzt = [
  {
    id: 'kauf_lw_ka_ve',
    typ: 'zusammengesetzt', mitUst: true, ustSatz: 0.19,
    branchenKat: 'FP',
    kontFilter: ['FP', 'KA', 'VE'],
    belegtyp: null,
    einheit: 'Stück',
    minBetrag: 40000, maxBetrag: 80000,
    anteilKasse: [0.10, 0.30],
    zahlungA: 'bar', zahlungB: 'auf Ziel',
    vorlagen: [
      '{kunde} kauft einen neuen Lieferwagen',
      '{kunde} erwirbt einen neuen Kastenwagen',
      '{kunde} schafft einen neuen Transporter an',
    ],
    artikelListe: [
      'Lieferwagen',
      'Kastenwagen',
      'Transporter',
    ],
    erstelleBuchungssatz(gf) {
      return erstelleZusammengesetztenBSUst(gf, 'FP', 'KA', 'VE');
    }
  },
  {
    id: 'kauf_lw_bk_ve',
    typ: 'zusammengesetzt', mitUst: true, ustSatz: 0.19,
    branchenKat: 'FP',
    kontFilter: ['FP', 'BK', 'VE'],
    belegtyp: null,
    einheit: 'Stück',
    minBetrag: 40000, maxBetrag: 100000,
    anteilKasse: [0.15, 0.40],
    zahlungA: 'per Banküberweisung', zahlungB: 'auf Ziel',
    vorlagen: [
      '{kunde} kauft einen neuen Lieferwagen',
      '{kunde} erwirbt einen neuen Transporter',
      '{kunde} schafft einen neuen Kastenwagen an',
    ],
    artikelListe: [
      'Lieferwagen',
      'Transporter',
      'Kastenwagen',
    ],
    erstelleBuchungssatz(gf) {
      return erstelleZusammengesetztenBSUst(gf, 'FP', 'BK', 'VE');
    }
  },
  {
    id: 'kauf_ma_bk_ve',
    typ: 'zusammengesetzt', mitUst: true, ustSatz: 0.19,
    branchenKat: 'MA',
    kontFilter: ['MA', 'BK', 'VE'],
    belegtyp: null,
    einheit: 'Stück',
    minBetrag: 50000, maxBetrag: 200000,
    anteilKasse: [0.20, 0.50],
    zahlungA: 'per Banküberweisung', zahlungB: 'auf Ziel',
    vorlagen: [
      '{kunde} kauft eine neue Fertigungsmaschine',
      '{kunde} erwirbt eine neue Stanzmaschine',
      '{kunde} schafft eine neue CNC-Fräse an',
    ],
    artikelListe: [
      'Fertigungsmaschine',
      'Stanzmaschine',
      'CNC-Fräse',
    ],
    erstelleBuchungssatz(gf) {
      return erstelleZusammengesetztenBSUst(gf, 'MA', 'BK', 'VE');
    }
  },
  {
    id: 'verkauf_bm_ka_bk',
    typ: 'zusammengesetzt', mitUst: true, ustSatz: 0.19,
    branchenKat: 'alle',
    kontFilter: ['KA', 'BK', 'BM'],
    belegtyp: null,
    einheit: 'Stück',
    minBetrag: 500, maxBetrag: 3000,
    anteilKasse: [0.15, 0.40],
    zahlungA: 'bar', zahlungB: 'per Banküberweisung',
    vorlagen: [
      '{kunde} verkauft einen gebrauchten Computer',
      '{kunde} veräußert ausgemusterte Bürotechnik',
      '{kunde} verkauft einen alten Drucker',
    ],
    artikelListe: [
      'Computer (gebraucht)',
      'Bürotechnik (gebraucht)',
      'Drucker (gebraucht)',
    ],
    erstelleBuchungssatz(gf) {
      return erstelleZusammengesetztenBSVerkaufUst(gf, 'BM', 'KA', 'BK');
    }
  },
  {
    id: 'tilgung_ve_ka_bk',
    typ: 'zusammengesetzt', mitUst: false,
    branchenKat: 'alle',
    kontFilter: ['VE', 'KA', 'BK'],
    belegtyp: null,
    artikel: 'Zahlung Lieferantenrechnung',
    minBetrag: 2000, maxBetrag: 20000,
    anteilKasse: [0.10, 0.30],
    zahlungA: 'bar', zahlungB: 'per Banküberweisung',
    vorlagen: [
      '{kunde} begleicht eine offene Rechnung bei {schuldner}',
      '{kunde} zahlt eine Liefererschuld an {schuldner}',
    ],
    erstelleBuchungssatz(gf) {
      return erstelleZusammengesetztenBSTilgung(gf, 'VE', 'KA', 'BK');
    }
  },
];

// Alle Typen zusammen
const geschaeftsfallTypen = [...gfEinfach, ...gfEinfachUst, ...gfVerkaufUst, ...gfZusammengesetzt];

// Fallback-Schuldner falls yamlData noch nicht geladen
const schuldnerFallback = [
  'Sport-Haus AG', 'Bäckerei Schreiber', 'Kindergarten Kunterbunt',
  'Möbel Braun OHG', 'Autohaus Schmidt GmbH', 'Hotel Sonne KG',
  'Sanitätsbetrieb Weller', 'Druckerei Haas GmbH',
  'Apotheke Maier', 'Schreinerei Huber GmbH',
];

function getZufallsGegenunternehmen() {
  const aktuellerKunde = document.getElementById('bestandskontenKunde')?.value?.trim() || '';
  const verfuegbar = yamlData
    .map(c => c.unternehmen)
    .filter(u => u?.name && u.name !== aktuellerKunde);

  if (verfuegbar.length > 0) {
    const u = pick(verfuegbar);
    return `${u.name}${u.rechtsform ? ' ' + u.rechtsform : ''}`.trim();
  }
  return pick(schuldnerFallback);
}

function getZufallsLieferant(branchenKat) {
  const aktuellerKunde = document.getElementById('bestandskontenKunde')?.value?.trim() || '';
  
  // branchenKatMap direkt als Filter nutzen
  const erlaubteBranchen = branchenKatMap[branchenKat];  // z.B. ['Maschinen'] oder null

  const passend = yamlData
    .map(c => c.unternehmen)
    .filter(u => {
      if (!u?.name || u.name === aktuellerKunde) return false;
      if (!erlaubteBranchen) return true;              // null = 'alle' → alles erlaubt
      return erlaubteBranchen.includes(u.branche);     // exakter Branchen-Match
    });

  if (passend.length > 0) {
    const u = pick(passend);
    return `${u.name}${u.rechtsform ? ' ' + u.rechtsform : ''}`.trim();
  }

  // Fallback: alle Unternehmen außer aktuellem
  const alle = yamlData
    .map(c => c.unternehmen)
    .filter(u => u?.name && u.name !== aktuellerKunde);

  if (alle.length > 0) {
    const u = pick(alle);
    return `${u.name}${u.rechtsform ? ' ' + u.rechtsform : ''}`.trim();
  }

  return lieferantFallbackMap[branchenKat] || lieferantFallbackMap['alle'];
}

// ============================================================================
// YAML-DATEN LADEN
// ============================================================================

function getUserCompanies() {
  const stored = localStorage.getItem('userCompanies');
  return stored ? JSON.parse(stored) : [];
}

function mergeUserCompaniesIntoYamlData() {
  const userCompanies = getUserCompanies();
  if (userCompanies.length > 0) {
    yamlData = [...yamlData, ...userCompanies];
    yamlData.sort((a, b) => {
      const brancheA = a.unternehmen?.branche || '';
      const brancheB = b.unternehmen?.branche || '';
      return brancheA.localeCompare(brancheB);
    });
  }
}

function loadYamlFromLocalStorage() {
  const saved = localStorage.getItem('uploadedYamlCompanyData');
  if (saved) {
    try {
      yamlData = JSON.parse(saved);
      mergeUserCompaniesIntoYamlData();
      document.dispatchEvent(new Event('yamlDataLoaded'));
      return true;
    } catch (err) {
      console.warn('localStorage YAML kaputt:', err);
    }
  }
  return false;
}

function loadDefaultYaml() {
  fetch('js/unternehmen.yml')
    .then(res => {
      if (!res.ok) throw new Error('unternehmen.yml nicht gefunden');
      return res.text();
    })
    .then(yamlText => {
      yamlData = jsyaml.load(yamlText) || [];
      if (!localStorage.getItem('standardYamlData')) {
        localStorage.setItem('standardYamlData', JSON.stringify(yamlData));
      }
      mergeUserCompaniesIntoYamlData();
      document.dispatchEvent(new Event('yamlDataLoaded'));
    })
    .catch(err => console.error('Konnte unternehmen.yml nicht laden:', err));
}

// ============================================================================
// DROPDOWN BEFÜLLEN
// ============================================================================

function fillCompanyDropdowns() {
  if (!yamlData || yamlData.length === 0) return;

  const sortedCompanies = [...yamlData].sort((a, b) => {
    const brancheA = a.unternehmen?.branche || '';
    const brancheB = b.unternehmen?.branche || '';
    if (brancheA !== brancheB) return brancheA.localeCompare(brancheB);
    return (a.unternehmen?.name || '').localeCompare(b.unternehmen?.name || '');
  });

  const kundeSelect = document.getElementById('bestandskontenKunde');
  if (!kundeSelect) return;

  kundeSelect.innerHTML = '';
  const opt = document.createElement('option');
  opt.value = '';
  opt.text = '— bitte Unternehmen auswählen —';
  opt.disabled = true;
  opt.selected = true;
  kundeSelect.appendChild(opt);

  sortedCompanies.forEach(company => {
    const u = company.unternehmen;
    if (!u?.name) return;
    const displayText = u.branche
      ? `${u.branche} – ${u.name} ${u.rechtsform || ''}`.trim()
      : `${u.name} ${u.rechtsform || ''}`.trim();
    const option = document.createElement('option');
    option.value = u.name;
    option.textContent = displayText;
    kundeSelect.appendChild(option);
  });
}

function autoSelectMyCompany() {
  const myCompanyName = localStorage.getItem('myCompany');
  if (!myCompanyName) return;
  const dropdowns = document.querySelectorAll('select.meinUnternehmen');
  dropdowns.forEach(dropdown => {
    const options = Array.from(dropdown.options);
    const matchingOption = options.find(opt => opt.value === myCompanyName);
    if (matchingOption) {
      dropdown.value = myCompanyName;
      dropdown.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
}

// ============================================================================
// KONTO-AUSWAHL
// ============================================================================

function initializeKontoAuswahl() {
  const grid = document.getElementById('kontoGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const used = new Set();
  geschaeftsfallTypen.forEach(t => {
    (t.kontFilter || []).forEach(k => used.add(k));
  });

  Object.entries(kontenDefinitionen).forEach(([kto, info]) => {
    if (!used.has(kto)) return;

    const item = document.createElement('div');
    item.className = 'konto-checkbox-item';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.id = `konto-${kto}`;
    cb.value = kto;
    cb.checked = true;
    cb.onchange = updateAuswahlInfo;

    const lbl = document.createElement('label');
    lbl.className = 'konto-label';
    lbl.htmlFor = cb.id;

    const nummer = document.createElement('div');
    nummer.className = 'konto-nummer';
    nummer.textContent = kto;

    const beschreibung = document.createElement('div');
    beschreibung.className = 'konto-beschreibung';
    beschreibung.textContent = info.beschreibung;

    lbl.appendChild(nummer);
    item.appendChild(cb);
    item.appendChild(lbl);
    grid.appendChild(item);
  });

  updateAuswahlInfo();
}

function updateAuswahlInfo() {
  const auswahlInfo = document.getElementById('auswahlInfo');
  const checkboxes = document.querySelectorAll('#kontoGrid input[type="checkbox"]');
  const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;

  if (checkedCount === 0) {
    auswahlInfo.textContent = '⚠️ Keine Konten ausgewählt - es werden alle verwendet';
    auswahlInfo.style.background = '#fff3cd';
    auswahlInfo.style.color = '#856404';
  } else if (checkedCount === checkboxes.length) {
    auswahlInfo.textContent = '✓ Alle Konten ausgewählt';
    auswahlInfo.style.background = '#d4edda';
    auswahlInfo.style.color = '#155724';
  } else {
    auswahlInfo.textContent = `✓ ${checkedCount} von ${checkboxes.length} Konten ausgewählt`;
    auswahlInfo.style.background = '#d1ecf1';
    auswahlInfo.style.color = '#0c5460';
  }
}

function alleKontenAuswaehlen() {
  document.querySelectorAll('#kontoGrid input[type="checkbox"]').forEach(cb => cb.checked = true);
  updateAuswahlInfo();
}

function alleKontenAbwaehlen() {
  document.querySelectorAll('#kontoGrid input[type="checkbox"]').forEach(cb => cb.checked = false);
  updateAuswahlInfo();
}

function getAusgewaehlteKonten() {
  return Array.from(document.querySelectorAll('#kontoGrid input[type="checkbox"]:checked')).map(cb => cb.value);
}

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================

function formatCurrency(value) {
  return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

function roundToTwoDecimals(num) {
  return Math.round(num * 100) / 100;
}

function generateRandomBetrag(min, max) {
  let schritt;
  if (max <= 1000)       schritt = 50;
  else if (max <= 5000)  schritt = 100;
  else if (max <= 20000) schritt = 500;
  else                   schritt = 1000;

  const minRounded = Math.ceil(min / schritt) * schritt;
  const steps = Math.max(1, Math.floor((max - minRounded) / schritt));
  return minRounded + (Math.floor(Math.random() * (steps + 1)) * schritt);
}

function roundTo(val, schritt) {
  return Math.round(val / schritt) * schritt;
}

function parseNumericValue(value) {
  if (!value) return '0';
  return value.toString().replace(/[€\s]/g, '').replace(/\./g, '').replace(',', '.');
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function td(content, align = 'left', minW = 140) {
  return `<td style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:${minW}px; min-width:${minW}px; text-align:${align}" tabindex="1">${content}</td>`;
}
function tdCenter(content) {
  return `<td style="text-align:center; width:100px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:40px" tabindex="1">${content}</td>`;
}

function tableWrap(rowsHTML) {
  return `<table style="border: 1px solid #ccc; white-space:nowrap; background-color:#fff; font-family:courier; width:600px; margin:0 0 6px;"><tbody>${rowsHTML}</tbody></table><br>`;
}

// ============================================================================
// BUCHUNGSSATZ-HELPER
// ============================================================================

function bsEinfach(sollKto, betrag, habenKto) {
  const b = formatCurrency(betrag);
  return tableWrap(
    `<tr>${td(sollKto)}${td(b,'right')}${tdCenter('an')}${td(habenKto,'left')}${td(b,'right')}</tr>`
  );
}

function bsEinfachUst(sollKto, netto, habenKto, brutto, Vorsteuer) {
  return tableWrap(
    `<tr>${td(sollKto)}${td(formatCurrency(netto),'right')}${tdCenter('')}${td('','left')}${td('','right')}</tr>` +
    `<tr>${td('VORST')}${td(formatCurrency(Vorsteuer),'right')}${tdCenter('an')}${td(habenKto,'left')}${td(formatCurrency(brutto),'right')}</tr>`
  );
}

function bsVerkaufUst(sollKto, netto, habenKto, brutto, ust) {
  return tableWrap(
    `<tr>${td(sollKto)}${td(formatCurrency(brutto),'right')}${tdCenter('an')}${td(habenKto,'left')}${td(formatCurrency(netto),'right')}</tr>` +
    `<tr>${td('')}${td('','right')}${tdCenter('')}${td('USt','left')}${td(formatCurrency(ust),'right')}</tr>`
  );
}

function erstelleZusammengesetztenBSUst(gf, sollKto, habenKto1, habenKto2) {
  const gesamt = gf.nettoBetrag;
  const VORST  = gf.Vorsteuer;
  const a1     = gf.anteil1;
  const a2     = gf.anteil2;
  return tableWrap(
    `<tr>${td(sollKto)}${td(formatCurrency(gesamt),'right')}${tdCenter('an')}${td(habenKto1,'left')}${td(formatCurrency(a1),'right')}</tr>` +
    `<tr>${td('VORST')}${td(formatCurrency(VORST),'right')}${tdCenter('')}${td(habenKto2,'left')}${td(formatCurrency(a2),'right')}</tr>`
  );
}

function erstelleZusammengesetztenBS(gf, sollKto, habenKto1, habenKto2) {
  const a1 = gf.anteil1;
  const a2 = gf.anteil2;
  const gesamt = gf.nettoBetrag;
  return tableWrap(
    `<tr>${td(sollKto)}${td(formatCurrency(gesamt),'right')}${tdCenter('an')}${td(habenKto1,'left')}${td(formatCurrency(a1),'right')}</tr>` +
    `<tr>${td('')}${td('','right')}${tdCenter('')}${td(habenKto2,'left')}${td(formatCurrency(a2),'right')}</tr>`
  );
}

function erstelleZusammengesetztenBSVerkauf(gf, habenKto, sollKto1, sollKto2) {
  const a1 = gf.anteil1;
  const a2 = gf.anteil2;
  const gesamt = gf.nettoBetrag;
  return tableWrap(
    `<tr>${td(sollKto1)}${td(formatCurrency(a1),'right')}${tdCenter('')}${td('','left')}${td('','right')}</tr>` +
    `<tr>${td(sollKto2)}${td(formatCurrency(a2),'right')}${tdCenter('an')}${td(habenKto,'left')}${td(formatCurrency(gesamt),'right')}</tr>`
  );
}

function erstelleZusammengesetztenBSVerkaufUst(gf, habenKto, sollKto1, sollKto2) {
  const a1    = gf.anteil1;
  const a2    = gf.anteil2;
  const netto = gf.nettoBetrag;
  const ust   = gf.Vorsteuer;
  return tableWrap(
    `<tr>${td(sollKto1)}${td(formatCurrency(a1),'right')}${tdCenter('')}${td('','left')}${td('','right')}</tr>` +
    `<tr>${td(sollKto2)}${td(formatCurrency(a2),'right')}${tdCenter('an')}${td(habenKto,'left')}${td(formatCurrency(netto),'right')}</tr>` +
    `<tr>${td('')}${td('','right')}${tdCenter('')}${td('USt','left')}${td(formatCurrency(ust),'right')}</tr>`
  );
}

function erstelleZusammengesetztenBSTilgung(gf, sollKto, habenKto1, habenKto2) {
  const a1 = gf.anteil1;
  const a2 = gf.anteil2;
  const gesamt = gf.nettoBetrag;
  return tableWrap(
    `<tr>${td(sollKto)}${td(formatCurrency(gesamt),'right')}${tdCenter('an')}${td(habenKto1,'left')}${td(formatCurrency(a1),'right')}</tr>` +
    `<tr>${td('')}${td('','right')}${tdCenter('')}${td(habenKto2,'left')}${td(formatCurrency(a2),'right')}</tr>`
  );
}

// ============================================================================
// GESCHÄFTSFALL GENERIEREN
// ============================================================================

function erstelleZufallsGeschaeftsfall() {
  const mitUstOption          = document.getElementById('optMitUst').checked;
  const zusammengesetztOption = document.getElementById('optZusammengesetzt').checked;
  const ausgewaehlteKonten    = getAusgewaehlteKonten();

  let verfuegbareTypen = geschaeftsfallTypen.filter(t => {
    if (t.mitUst && !mitUstOption) return false;
    if (t.typ === 'zusammengesetzt' && !zusammengesetztOption) return false;
    if (ausgewaehlteKonten.length > 0) {
      return (t.kontFilter || []).every(k => ausgewaehlteKonten.includes(k));
    }
    return true;
  });

  if (verfuegbareTypen.length === 0) return null;

  const typ       = pick(verfuegbareTypen);
  const schuldner = getZufallsGegenunternehmen();
  const lieferant = getZufallsLieferant(typ.branchenKat || 'alle');

  let nettoBetrag = generateRandomBetrag(typ.minBetrag, typ.maxBetrag);
  if (typ.mitUst) {
    const ustSchritt = nettoBetrag >= 10000 ? 10000 : 1000;
    nettoBetrag = Math.round(nettoBetrag / ustSchritt) * ustSchritt;
    if (nettoBetrag < typ.minBetrag) nettoBetrag += ustSchritt;
  }
  const nettoFormatted = formatCurrency(nettoBetrag);

  let Vorsteuer = 0, bruttoBetrag = nettoBetrag;
  let VorsteuerFormatted = formatCurrency(0), bruttoFormatted = nettoFormatted;

  if (typ.mitUst) {
    const ustSatz = typ.ustSatz || 0.19;
    Vorsteuer    = roundToTwoDecimals(nettoBetrag * ustSatz);
    bruttoBetrag = roundToTwoDecimals(nettoBetrag + Vorsteuer);
    VorsteuerFormatted = formatCurrency(Vorsteuer);
    bruttoFormatted    = formatCurrency(bruttoBetrag);
  }

  let anteil1 = 0, anteil2 = 0;
  if (typ.typ === 'zusammengesetzt') {
    const [aMin, aMax] = typ.anteilKasse;
    const basis = typ.mitUst ? bruttoBetrag : nettoBetrag;
    const schritt = basis >= 20000 ? 1000 : basis >= 2000 ? 100 : 10;
    const anteil1Raw = basis * (aMin + Math.random() * (aMax - aMin));
    anteil1 = roundTo(anteil1Raw, schritt);
    const minAnteil = Math.max(20, schritt);
    if (anteil1 < minAnteil) anteil1 = minAnteil;
    if (anteil1 > basis - minAnteil) anteil1 = basis - minAnteil;
    anteil2 = roundToTwoDecimals(basis - anteil1);
  }

  let betragText, betragHinweis = '';
  if (!typ.mitUst) {
    betragText = nettoFormatted;
  } else {
    if (Math.random() < 0.5) {
      betragText = nettoFormatted; betragHinweis = ' netto';
    } else {
      betragText = bruttoFormatted; betragHinweis = ' brutto';
    }
  }

  // Vorlage und Artikel synchron per Index wählen
  const vorlagenIdx = Math.floor(Math.random() * typ.vorlagen.length);
  let textVorlage   = typ.vorlagen[vorlagenIdx];
  const artikel     = typ.artikelListe?.[vorlagenIdx] ?? (typ.artikel || 'Artikel');

  textVorlage = textVorlage
    .replace('{kunde}', kunde)
    .replace('{schuldner}', schuldner);

  let geschaeftsfallText;
  if (typ.typ === 'zusammengesetzt') {
    const zA = typ.zahlungA || 'bar';
    const zB = typ.zahlungB || 'auf Ziel';
    const istVerkauf = typ.id.startsWith('verkauf');
    const gesamtText = typ.mitUst ? `${bruttoFormatted} brutto` : nettoFormatted;
    if (istVerkauf) {
      geschaeftsfallText = `${textVorlage} in Höhe von ${gesamtText}. `
        + `${formatCurrency(anteil1)} werden ${zA} bezahlt, `
        + `${formatCurrency(anteil2)} per Banküberweisung.`;
    } else {
      geschaeftsfallText = `${textVorlage} in Höhe von ${gesamtText}. `
        + `${formatCurrency(anteil1)} werden ${zA} bezahlt, `
        + `${formatCurrency(anteil2)} ${zB}.`;
    }
  } else {
    geschaeftsfallText = `${textVorlage} in Höhe von ${betragText}${betragHinweis}.`;
  }

  return {
    text: geschaeftsfallText,
    typ,
    schuldner,
    lieferant,
    artikel,           // ← synchron zur gewählten Vorlage
    nettoBetrag,
    nettoFormatted,
    Vorsteuer,
    VorsteuerFormatted,
    bruttoBetrag,
    bruttoFormatted,
    anteil1,
    anteil2,
    ustProzent: typ.ustSatz ? roundToTwoDecimals(typ.ustSatz * 100) : 19,
  };
}

// ============================================================================
// BUCHUNGSSATZ ERSTELLEN (Dispatcher)
// ============================================================================

function erstelleBuchungssatz(gf) {
  const t = gf.typ;

  switch (t.typ) {
    case 'einfach':
      return bsEinfach(t.soll, gf.nettoBetrag, t.haben);

    case 'einfach_ust':
      return bsEinfachUst(t.soll, gf.nettoBetrag, t.haben, gf.bruttoBetrag, gf.Vorsteuer);

    case 'verkauf_ust':
      return bsVerkaufUst(t.soll, gf.nettoBetrag, t.haben, gf.bruttoBetrag, gf.Vorsteuer);

    case 'zusammengesetzt':
      return t.erstelleBuchungssatz(gf);

    default:
      return bsEinfach(t.soll, gf.nettoBetrag, t.haben);
  }
}

// ============================================================================
// BELEG-URL ERSTELLEN
// ============================================================================

function erstelleBelegURL(gf) {
  if (!gf.typ.belegtyp) return null;

  const params = new URLSearchParams();
  const bt  = gf.typ.belegtyp;
  const now = new Date();
  const tag   = String(now.getDate()).padStart(2, '0');
  const monat = String(now.getMonth() + 1).padStart(2, '0');
  const jahr  = String(now.getFullYear());

  const kundeSelect = document.getElementById('bestandskontenKunde');
  const kundeValue  = kundeSelect?.value?.trim() || '';

  params.set('beleg', bt);

  if (bt === 'rechnung') {
    const istVerkauf = gf.typ.soll === 'FO';
    if (istVerkauf) {
      if (kundeValue) params.set('lieferer', kundeValue);
      params.set('kunde', gf.schuldner);
    } else {
      params.set('lieferer', gf.lieferant);
      if (kundeValue) params.set('kunde', kundeValue);
    }
    params.set('artikel1', gf.artikel);           // ← jetzt aus gf.artikel (synchron zur Vorlage)
    params.set('menge1', '1');
    params.set('einheit1', gf.typ.einheit || 'Stück');
    params.set('einzelpreis1', parseNumericValue(gf.nettoFormatted));
    params.set('umsatzsteuer', gf.typ.mitUst ? String(gf.ustProzent) : '0');
    params.set('tag', tag); params.set('monat', monat); params.set('jahr', jahr);
    params.set('zahlungsziel', '30'); params.set('skonto', '2'); params.set('skontofrist', '20');

  } else if (bt === 'kassenbon') {
    // KA im Soll = wir empfangen Bargeld (Barverkauf oder Bareingang Forderung)
    // KA im Haben = wir zahlen bar (Barkauf bei Lieferant)
    const wirEmpfangen = gf.typ.soll === 'KA';

    if (wirEmpfangen) {
      // Wir = Empfänger, Gegenpartei (Käufer / Schuldner) = Zahler
      if (kundeValue) params.set('empfaenger', kundeValue);
      params.set('kunde', gf.schuldner);
    } else {
      // Lieferant = Empfänger, wir = Zahler
      params.set('empfaenger', gf.lieferant);
      if (kundeValue) params.set('kunde', kundeValue);
    }

    params.set('bezeichnung', gf.artikel);        // ← jetzt aus gf.artikel
    params.set('netto', parseNumericValue(gf.nettoFormatted));
    params.set('ust', gf.typ.mitUst ? String(gf.ustProzent) : '0');
    params.set('zahlungsart', 'Barzahlung');
    params.set('tag', tag); params.set('monat', monat); params.set('jahr', jahr);

  } else if (bt === 'kontoauszug') {
    if (kundeValue) params.set('kontoinhaber', kundeValue);
    const betragNum  = parseNumericValue(gf.nettoFormatted);
    const istEingang = gf.typ.soll === 'BK';

    let vorgang;
    if (istEingang && gf.typ.id === 'eingang_fo_bank') {
      const rgnr = Math.floor(Math.random() * 900) + 100;
      const prefixes = ['Rechnung Nr. ', 'Begleichung Rechnung '];
      vorgang = `${pick(prefixes)}${rgnr}`;
    } else if (!istEingang && (gf.typ.id === 'tilgung_ve_bank' || gf.typ.id === 'tilgung_ve_ka_bk')) {
      const rgnr = Math.floor(Math.random() * 900) + 100;
      const prefixes = ['Rechnung Nr. ', 'Begleichung Rechnung '];
      vorgang = `${pick(prefixes)}${rgnr}`;
    } else {
      vorgang = gf.artikel || (istEingang ? 'Gutschrift' : 'Überweisung');
    }

    params.set('vorgang1', vorgang);
    params.set('wertstellung1', istEingang ? betragNum : `-${betragNum}`);
    params.set('tag', tag); params.set('monat', monat); params.set('jahr', jahr);

  } else if (bt === 'quittung') {
    params.set('empfaenger', gf.schuldner || gf.lieferant);
    if (kundeValue) params.set('kunde', kundeValue);
    params.set('zweck', gf.artikel);              // ← jetzt aus gf.artikel
    params.set('netto', parseNumericValue(gf.nettoFormatted));
    params.set('ust', '0');
    params.set('tag', tag); params.set('monat', monat); params.set('jahr', jahr);
  }

  return `belege.html?${params.toString()}`;
}

// ============================================================================
// BELEG-BUTTON ERSTELLEN
// ============================================================================

function erstelleBelegButton(nummer, gf) {
  const url = erstelleBelegURL(gf);

  if (!url) {
    return `
      <button
        disabled
        style="width:100%; padding:10px 12px; font-size:13px; margin-bottom:8px;
                    color:#999; border:1px dashed #ccc; border-radius:4px; text-align:center;"
      >
        ${nummer}. Noch kein Beleg verfügbar
      </button>
    `;
  }

  const namen = { kassenbon: 'Kassenbon', rechnung: 'Rechnung', quittung: 'Quittung', kontoauszug: 'Kontoauszug' };
  const name  = namen[gf.typ.belegtyp] || 'Beleg';

  return `
    <button
      class="geschaeftsfall-beleg-button"
      onclick="window.open('${url}', '_blank')"
      title="${name} für Aufgabe ${nummer} erstellen"
      style="width: 100%; padding: 10px 12px; font-size: 14px; margin-bottom: 8px;"
    >
      📄 ${nummer}. ${name} erstellen
    </button>
  `;
}

// ============================================================================
// HAUPTFUNKTION
// ============================================================================

function zeigeZufaelligeGeschaeftsfaelle() {
  const anzahl       = parseInt(document.getElementById('anzahlDropdown').value);
  const container    = document.getElementById('Container');
  const buttonColumn = document.getElementById('button-column');

  if (!container || !buttonColumn) return;

  container.innerHTML    = '';
  buttonColumn.innerHTML = '';

  const testGf = erstelleZufallsGeschaeftsfall();
  if (!testGf) {
    container.innerHTML = `
      <div style="padding: 14px 16px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 5px; color: #856404; margin-top: 16px;">
        ⚠️ <strong>Keine passenden Geschäftsfälle verfügbar.</strong><br>
        Die gewählte Kombination aus Optionen und Konten ergibt keine gültigen Aufgaben.
        Bitte wählen Sie weitere Konten aus oder aktivieren Sie mehr Optionen.
      </div>`;
    return;
  }

  let aufgabenHTML  = '<h2>Aufgaben</h2><ol>';
  let loesungenHTML = '<h2>Lösung</h2>';

  const geschaeftsfaelle = [testGf];
  for (let i = 1; i < anzahl; i++) {
    const gf = erstelleZufallsGeschaeftsfall();
    if (gf) geschaeftsfaelle.push(gf);
  }

  geschaeftsfaelle.forEach((gf, idx) => {
    const i = idx + 1;
    aufgabenHTML  += `<li>${gf.text}</li>`;
    loesungenHTML += `<div style="margin-top: 1.5em;"><strong>${i}.</strong><br>${erstelleBuchungssatz(gf)}</div>`;

    const buttonHTML = erstelleBelegButton(i, gf);
    const div = document.createElement('div');
    div.style.margin = '12px 0';
    div.innerHTML = buttonHTML;
    buttonColumn.appendChild(div);
  });

  aufgabenHTML += '</ol>';
  container.innerHTML = aufgabenHTML + loesungenHTML;
}

// ============================================================================
// KI-ASSISTENT PROMPT
// ============================================================================

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Buchführungs-Assistent für Schüler der Realschule (BwR). Du hilfst beim Verständnis von Buchungssätzen im Bereich aktive und passive Bestandskonten.

Aufgabe:
- Gib KEINE fertigen Buchungssätze, Beträge oder Konten vor.
- Führe die Schüler durch gezielte Fragen und Hinweise zur richtigen Lösung.
- Ziel: Lernförderung, nicht das Abnehmen der Denkarbeit.

Pädagogischer Ansatz:
- Frage nach dem konkreten Geschäftsfall und dessen Inhalt.
- Stelle gezielte Rückfragen, um den Stand des Schülers zu verstehen.
- Beantworte deine Rückfragen nicht selbst, hake bei falschen Antworten nach.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Erst wenn alle Teilschritte richtig beantwortet wurden, bestätige den vollständigen Buchungssatz.

Kontenplan – Bestandskonten:

Aktive Bestandskonten (Zugang im SOLL, Abgang im HABEN):
- GR – Grundstücke
- BVG – Betriebs- und Geschäftsgebäude
- MA – Maschinen
- FP – Fuhrpark
- BM – Büromaschinen
- BGA – Betriebs- und Geschäftsausstattung
- FO – Forderungen aus Lieferungen und Leistungen
- BK – Bank
- KA – Kasse
- VORST – Vorsteuer (nur bei Eingangsrechnungen mit USt, im SOLL)

Passive Bestandskonten (Zugang im HABEN, Abgang im SOLL):
- EK – Eigenkapital
- KBKV – Kurzfristige Bankverbindlichkeiten
- LBKV – Langfristige Bankverbindlichkeiten
- VE – Verbindlichkeiten aus Lieferungen und Leistungen
- USt – Umsatzsteuer (nur bei Ausgangsrechnungen mit USt, im HABEN)

Buchungslogik:
- Aktives Konto nimmt zu → Soll; nimmt ab → Haben
- Passives Konto nimmt zu → Haben; nimmt ab → Soll
- VORST nur bei Einkauf mit USt
- USt nur bei Verkauf mit USt

Buchungssatz Einkauf mit VORST (Kauf MA auf Ziel):
  MA (Soll) | Nettobetrag
  VORST (Soll) | Vorsteuerbetrag | an | VE (Haben) | Bruttobetrag

Buchungssatz Verkauf mit USt (Verkauf FP auf Rechnung):
  FO (Soll) | Bruttobetrag | an | FP (Haben) | Nettobetrag
                                  USt (Haben) | Umsatzsteuerbetrag

Vorsteuer-/USt-Berechnung:
- Nettobetrag × 0,19 = VORST / USt
- Bruttobetrag = Nettobetrag + VORST
- Wenn „brutto" angegeben: Netto = Brutto ÷ 1,19
- Wenn „netto" angegeben: Brutto = Netto × 1,19

Häufige Schülerfehler:
- Soll und Haben vertauscht
- VORST vergessen obwohl Rechnung mit USt
- USt vergessen beim Verkauf mit Rechnung
- Brutto statt Netto beim Anlagenkonto eingetragen
- Falsches Bestandskonto gewählt
- Beim zusammengesetzten Buchungssatz einen Anteil vergessen (BK, VE, KA...)

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe mit Realschülerinnen und -schülern
- Einfache Sprache, keine Fachbegriffe ohne Erklärung
- Kurze Antworten – maximal 1–2 Sätze pro Nachricht
- Gelegentlich Emojis 📒✅❓

Was du NICHT tust:
- Nenne den fertigen Buchungssatz nicht, bevor der Schüler selbst darauf gekommen ist
- Rechne nicht vor, bevor gefragt wurde
- Gib keine Lösungen auf direkte Anfrage
`;

function kopiereKiPrompt() {
  navigator.clipboard.writeText(KI_ASSISTENT_PROMPT).then(() => {
    const btn = document.getElementById('kiPromptKopierenBtn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Kopiert!`;
    btn.classList.add('ki-prompt-btn--success');
    setTimeout(() => { btn.innerHTML = originalHTML; btn.classList.remove('ki-prompt-btn--success'); }, 2500);
  }).catch(err => {
    console.error('Fehler beim Kopieren:', err);
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

// ============================================================================
// INITIALISIERUNG
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  initializeKontoAuswahl();

  const kundeSelect = document.getElementById('bestandskontenKunde');
  if (kundeSelect) {
    if (kundeSelect.value) kunde = kundeSelect.value.trim();
    kundeSelect.addEventListener('change', () => {
      kunde = kundeSelect.value.trim() || '<i>[Modellunternehmen]</i>';
    });
  }

  if (!loadYamlFromLocalStorage()) loadDefaultYaml();

  if (yamlData && yamlData.length > 0) {
    fillCompanyDropdowns();
  } else {
    document.addEventListener('yamlDataLoaded', fillCompanyDropdowns, { once: true });

  }

  const vorschauEl = document.getElementById('kiPromptVorschau');
  if (vorschauEl) vorschauEl.textContent = KI_ASSISTENT_PROMPT;
  setTimeout(autoSelectMyCompany, 100);
  
  setTimeout(function () {
  zeigeZufaelligeGeschaeftsfaelle();
  }, 500);
});

