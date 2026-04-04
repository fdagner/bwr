// ============================================================================
// GLOBALE VARIABLEN
// ============================================================================
let letzteGenerierteAufgaben = [];

// ============================================================================
// FAMILIEN-PROFILE
// ============================================================================
const familienProfile = [
  {
    id: 'familie_jung',
    label: 'Junge Familie',
    namen: ['Familie Maier', 'Familie Schneider', 'Familie Wagner', 'Familie Fischer', 'Familie Bauer'],
    intro: [
      '{name} lebt in einer gemütlichen Mietwohnung in einer mittelgroßen bayerischen Stadt. Die Eltern sind beide berufstätig und haben zwei Kinder im Grundschulalter.',
      '{name} ist eine junge Familie mit zwei Kindern. Die Eltern arbeiten beide in Vollzeit und wohnen zur Miete in der Nähe des Stadtzentrums.',
      '{name} zog vor einigen Jahren in ihre aktuelle Mietwohnung. Mit zwei Kindern ist das monatliche Budget sorgfältig geplant.',
    ],
  },
  {
    id: 'familie_allein',
    label: 'Alleinerziehend',
    personen: [
      { name: 'Sandra Huber',   geschlecht: 'w', familienname: 'Huber'    },
      { name: 'Thomas Klein',   geschlecht: 'm', familienname: 'Klein'    },
      { name: 'Nicole Richter', geschlecht: 'w', familienname: 'Richter'  },
      { name: 'Andreas Wolf',   geschlecht: 'm', familienname: 'Wolf'     },
      { name: 'Sabine Braun',   geschlecht: 'w', familienname: 'Braun'    },
      { name: 'Stefan Gruber',  geschlecht: 'm', familienname: 'Gruber'   },
    ],
    intro: [
      '{name} ist alleinerziehende Mutter eines Kindes im Teenageralter. Sie arbeitet halbtags und erhält zusätzliche staatliche Unterstützung.',
      '{name} lebt als alleinerziehender Vater mit seinem Kind in einer kleinen Mietwohnung. Neben dem Gehalt aus seiner Teilzeitstelle erhält er regelmäßige Unterhaltszahlungen.',
      '{name} zieht ihr Kind allein groß und ist auf ihre Arbeit sowie staatliche Unterstützung angewiesen, um den Alltag zu finanzieren.',
      '{name} ist alleinerziehender Vater und kümmert sich neben seiner Berufstätigkeit allein um sein Kind.',
    ],
    introGeschlecht: { w: [0, 2], m: [1, 3] },
  },
  {
    id: 'familie_rente',
    label: 'Rentnerpaar',
    namen: ['Familie Müller', 'Familie Schmitt', 'Familie Hofmann', 'Familie Weber', 'Familie Schäfer'],
    intro: [
      '{name} ist ein Rentnerpaar, das seit vielen Jahren in seinem eigenen Haus lebt. Die beiden erhalten monatlich ihre Renten und kommen mit ihrem überschaubaren Haushalt gut aus.',
      '{name} genießt den Ruhestand. Das Paar lebt in einer Eigentumswohnung und teilt sich zwei Renten. Der Haushalt ist überschaubar, aber gut organisiert.',
      '{name} ist seit wenigen Jahren im Ruhestand. Mit zwei Renteneinkünften und einem bescheidenen Lebensstil kommt das Paar gut durch den Monat.',
    ],
  },
  {
    id: 'familie_gross',
    label: 'Großfamilie',
    namen: ['Familie Zimmermann', 'Familie Krause', 'Familie Lehmann', 'Familie Hartmann', 'Familie König'],
    intro: [
      '{name} ist eine Großfamilie mit drei Kindern. Der Vater arbeitet in Vollzeit, die Mutter in Teilzeit. Der Haushalt erfordert eine sorgfältige Finanzplanung.',
      '{name} lebt mit drei Kindern in einem Einfamilienhaus am Stadtrand. Beide Elternteile sind berufstätig und müssen jeden Monat sorgfältig haushalten.',
      '{name} hat viele Ausgaben – drei Kinder und ein großes Haus wollen finanziert werden. Trotzdem versuchen die Eltern, jeden Monat etwas zur Seite zu legen.',
    ],
  },
];

// ============================================================================
// EINNAHMEN-BAUSTEINE
// ============================================================================
const einnahmenBausteine = {
  gehalt1: [
    'Das monatliche Netto-Gehalt von {person1} beträgt {betrag} Euro.',
    '{person1} verdient monatlich {betrag} Euro netto.',
    'Aus seiner / ihrer Berufstätigkeit erhält {person1} jeden Monat {betrag} Euro netto.',
  ],
  gehalt2: [
    'Dazu kommt das Gehalt von {person2} in Höhe von {betrag} Euro.',
    '{person2} steuert jeden Monat {betrag} Euro zum Familieneinkommen bei.',
    'Als weiteres Einkommen bringt {person2} monatlich {betrag} Euro netto ein.',
  ],
  kindergeld: [
    'Für {anzahlKinder} {kinderWort} beträgt das Kindergeld {betrag} Euro (je 259 Euro pro Kind).',
    'Das Familieneinkommen wird durch {betrag} Euro Kindergeld pro Monat ergänzt ({anzahlKinder} {kinderWort} × 259 Euro).',
    'Zusätzlich fließen {betrag} Euro Kindergeld monatlich in die Haushaltskasse – für {anzahlKinder} {kinderWort}.',
  ],
  rente1: [
    'Die monatliche Rente von {person1} beläuft sich auf {betrag} Euro.',
    '{person1} erhält jeden Monat eine Rente in Höhe von {betrag} Euro.',
  ],
  rente2: [
    'Auch {person2} bezieht eine monatliche Rente von {betrag} Euro.',
    '{person2} erhält zusätzlich eine Rente von {betrag} Euro pro Monat.',
  ],
  unterhalt: [
    'Außerdem fließen monatlich {betrag} Euro Unterhalt in den Haushalt.',
    'An Unterhaltszahlungen erhält der Haushalt monatlich {betrag} Euro.',
  ],
  sozialhilfe: [
    'Vom Staat erhält die Familie monatlich {betrag} Euro als finanzielle Unterstützung.',
    'Zusätzlich werden monatlich {betrag} Euro staatliche Unterstützung ausgezahlt.',
  ],
  mieteinnahmen: [
    'Eine vermietete Einliegerwohnung bringt monatlich {betrag} Euro Mieteinnahmen.',
    'Durch die Vermietung einer kleinen Wohnung nimmt die Familie {betrag} Euro im Monat ein.',
  ],
};

// ============================================================================
// AUSGABEN-BAUSTEINE
// ============================================================================
const ausgabenBausteine = {
  miete: [
    'Die monatliche Kaltmiete für die Wohnung beträgt {betrag} Euro.',
    'Für ihre Mietwohnung zahlt die Familie monatlich {betrag} Euro.',
    'Die Miete schlägt mit {betrag} Euro pro Monat zu Buche.',
  ],
  nebenkosten: [
    'Für Strom, Heizung und Wasser fallen monatlich {betrag} Euro an.',
    'Die Nebenkosten (Strom, Heizung, Wasser) betragen monatlich {betrag} Euro.',
    'Strom, Gas und Wasser kosten die Familie zusammen {betrag} Euro im Monat.',
  ],
  lebensmittel: [
    'Der Lebensmitteleinkauf kostet die Familie im Monat etwa {betrag} Euro.',
    'Für Lebensmittel und Grundbedarf gibt der Haushalt monatlich {betrag} Euro aus.',
    'Rund {betrag} Euro fließen jeden Monat in den Lebensmitteleinkauf.',
  ],
  versicherungen: [
    'Verschiedene Versicherungen (Haftpflicht, Hausrat, KFZ) kosten monatlich {betrag} Euro.',
    'Für ihre Versicherungen zahlt die Familie insgesamt {betrag} Euro im Monat.',
    'Die monatlichen Versicherungsbeiträge belaufen sich auf {betrag} Euro.',
  ],
  mobilitaet: [
    'Für das Auto (Benzin, Steuer, Versicherung) zahlt die Familie monatlich {betrag} Euro.',
    'Die monatlichen Fahrtkosten (Auto, ÖPNV) betragen {betrag} Euro.',
    'Mobilität kostet die Familie jeden Monat rund {betrag} Euro.',
  ],
  handy: [
    'Telefon- und Internetkosten belaufen sich auf {betrag} Euro monatlich.',
    'Für Handyverträge und Internet zahlt die Familie {betrag} Euro pro Monat.',
    'Die monatlichen Kosten für Kommunikation (Handy, Internet) betragen {betrag} Euro.',
  ],
  freizeit: [
    'Für Freizeitaktivitäten, Sport und Hobby gibt die Familie monatlich {betrag} Euro aus.',
    'Kino, Sport und gemeinsame Unternehmungen kosten die Familie {betrag} Euro im Monat.',
    'Für Freizeit und Unterhaltung sind monatlich {betrag} Euro eingeplant.',
  ],
  kleidung: [
    'Für Kleidung und Schuhe plant die Familie monatlich {betrag} Euro ein.',
    'Die monatlichen Ausgaben für Bekleidung betragen durchschnittlich {betrag} Euro.',
    'Rund {betrag} Euro gibt die Familie jeden Monat für Kleidung aus.',
  ],
  sparen: [
    'Außerdem legt die Familie jeden Monat {betrag} Euro auf einem Sparkonto zurück.',
    'Monatlich fließen {betrag} Euro auf das Familienkonto als Rücklage.',
    'Die Familie möchte jeden Monat {betrag} Euro sparen und überweist diesen Betrag auf ihr Sparkonto.',
  ],
  gesundheit: [
    'Für Zuzahlungen bei Arzt und Apotheke sind monatlich {betrag} Euro einkalkuliert.',
    'Gesundheitsausgaben (Apotheke, Zuzahlungen) schlagen mit {betrag} Euro im Monat zu Buche.',
  ],
  schule: [
    'Schulmaterialien, Ausflüge und Nachhilfe kosten monatlich {betrag} Euro.',
    'Für schulische Ausgaben (Bücher, Fahrten, Nachhilfe) fallen monatlich {betrag} Euro an.',
  ],
  haushalt: [
    'Haushaltsartikel und Reinigungsmittel kosten monatlich {betrag} Euro.',
    'Für Haushaltsmittel und kleinere Anschaffungen gibt die Familie {betrag} Euro im Monat aus.',
  ],
  abonnements: [
    'Streaming-Dienste und Mitgliedschaften kosten monatlich {betrag} Euro.',
    'Für Abonnements (Streaming, Zeitung, Fitnessstudio) zahlt die Familie {betrag} Euro im Monat.',
  ],
};

// ============================================================================
// ABSCHLUSSSÄTZE
// ============================================================================
const abschlussSaetze = [
  'Am Ende des Monats schaut {name} gemeinsam auf den Haushaltsplan, um zu prüfen, wie gut sie mit dem Budget ausgekommen sind.',
  'Mit einem guten Überblick über Einnahmen und Ausgaben behält {name} die Kontrolle über ihre Finanzen.',
  'Damit {name} stets den Überblick behält, wird der Haushaltsplan jeden Monat sorgfältig geführt.',
];

// ============================================================================
// PERSONEN-NAMEN
// ============================================================================
const personenNamen = {
  maennlich: ['Thomas', 'Michael', 'Andreas', 'Stefan', 'Markus', 'Klaus', 'Peter', 'Hans'],
  weiblich: ['Maria', 'Sandra', 'Claudia', 'Nicole', 'Sabine', 'Petra', 'Anna', 'Lisa'],
};

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function pickN(arr, n) { return shuffle(arr).slice(0, n); }

// Glatte Zahlen (Vielfache von 50)
function randGlatt(min, max) {
  const steps = Math.floor((max - min) / 50);
  return min + Math.floor(Math.random() * (steps + 1)) * 50;
}

function formatEuro(betrag) {
  return betrag.toLocaleString('de-DE') + ' €';
}

function fuelleSatz(vorlage, vars) {
  let s = vorlage;
  for (const [k, v] of Object.entries(vars)) {
    s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
  }
  return s;
}

// ── Moodle-Cloze ─────────────────────────────────────────────────────────────
function moodleZahlHP(betrag) {
  return betrag.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function clozeInlineHP(betrag) {
  const mitEuro  = moodleZahlHP(betrag) + ' €';
  const ohneEuro = moodleZahlHP(betrag);
  return `{1:SHORTANSWER:=${mitEuro}~=${ohneEuro}}`;
}

const CLOZE_SPAN = `font-family:'Courier New',monospace;font-size:10.5px;color:#1a5276;background:#eaf4fb;border:1px dashed #5dade2;border-radius:3px;padding:1px 5px;`;
const LEER_FELD  = `display:inline-block;width:110px;height:19px;border-bottom:1.5px solid #999;background:#fafaf7;vertical-align:bottom;`;

// Gibt Cloze-Span oder leeres Eingabefeld zurück (nie den Klarwert – dieser steht in der Lösung)
function zelleHP(betrag, clozeAktiv) {
  if (clozeAktiv) {
    return `<span style="${CLOZE_SPAN}">${clozeInlineHP(betrag)}</span>`;
  }
  return `<span style="${LEER_FELD}"></span>`;
}

function aktualisiereClozeAnzeige() {
  zeigeZufaelligeHaushaltsplaene();
}

// ============================================================================
// AUSGABEN-KATEGORIEN: REGELM. vs. UNREGELM.
// ============================================================================
const ausgabenArt = {
  miete:         'regelmaessig',
  nebenkosten:   'regelmaessig',
  lebensmittel:  'regelmaessig',
  versicherungen:'regelmaessig',
  mobilitaet:    'regelmaessig',
  handy:         'regelmaessig',
  freizeit:      'unregelmaessig',
  kleidung:      'unregelmaessig',
  sparen:        'regelmaessig',
  gesundheit:    'unregelmaessig',
  schule:        'unregelmaessig',
  haushalt:      'unregelmaessig',
  abonnements:   'regelmaessig',
};

// ============================================================================
// AUSGABENWUNSCH-SZENARIEN (nach Familientyp)
// Jedes Szenario: { person, wunsch, betrag, einmalig, bewertung }
// bewertung: 'kritisch' | 'vertretbar'
// ============================================================================
const ausgabenwuenschePool = {
  familie_jung: [
    { person: 'Der Vater', wunsch: 'ein neues Smartphone der neuesten Generation', betrag: 1200, einmalig: true,  bewertung: 'kritisch',   begruendung: 'Der Kaufpreis entspricht einem erheblichen Teil des Monatseinkommens. Da das bestehende Gerät noch funktioniert, sollte der Kauf aufgeschoben oder durch ein günstigeres Modell ersetzt werden.' },
    { person: 'Die Mutter', wunsch: 'einen Wochenend-Kurzurlaub für die Familie', betrag: 400, einmalig: true,  bewertung: 'vertretbar', begruendung: 'Bei einem positiven Saldo ist ein geplanter Kurzurlaub vertretbar, sofern er aus dem Überschuss bezahlt wird und kein Kredit aufgenommen werden muss.' },
    { person: 'Das Kind', wunsch: 'eine Spielekonsole', betrag: 500, einmalig: true,  bewertung: 'kritisch',   begruendung: 'Eine Spielekonsole ist ein Luxusartikel. Bei einem knappen Budget sollte dieser Wunsch zurückgestellt oder aus einem angesparten Betrag finanziert werden.' },
    { person: 'Der Vater', wunsch: 'ein neues Fahrrad auf Raten (50 € / Monat)', betrag: 50, einmalig: false, bewertung: 'vertretbar', begruendung: 'Wenn der Saldo positiv ist und die Ratenzahlung dauerhaft tragbar bleibt, ist dieser Wunsch vertretbar – jedoch sollte man Ratenkäufe grundsätzlich kritisch prüfen.' },
    { person: 'Die Mutter', wunsch: 'ein Abonnement für einen Online-Fitness-Kurs', betrag: 40, einmalig: false, bewertung: 'vertretbar', begruendung: 'Ein monatlicher Beitrag von 40 € für Gesundheit und Wohlbefinden ist vertretbar, wenn er im Haushaltsplan eingeplant wird.' },
    { person: 'Das Kind', wunsch: 'täglich Süßigkeiten und Fast Food', betrag: 80, einmalig: false, bewertung: 'kritisch',   begruendung: 'Regelmäßige Ausgaben für Fast Food und Süßigkeiten belasten das Budget dauerhaft und sind zudem gesundheitlich bedenklich.' },
  ],
  familie_allein: [
    { person: '{elternteil}', wunsch: 'ein neues Sofa auf Raten (60 € / Monat)', betrag: 60, einmalig: false, bewertung: 'kritisch',   begruendung: 'Bei einem ohnehin knappen Budget erhöhen Ratenzahlungen die monatliche Belastung dauerhaft. Die Gefahr der Überschuldung steigt, wenn weitere unvorhergesehene Ausgaben dazukommen.' },
    { person: 'Das Kind',    wunsch: 'ein Schulausflug ins Kletterpark (einmalig)', betrag: 25, einmalig: true,  bewertung: 'vertretbar', begruendung: 'Ein einmaliger Betrag von 25 € für einen Schulausflug ist sozial wichtig und bei entsprechendem Gewinn vertretbar.' },
    { person: '{elternteil}', wunsch: 'ein Konsumkredit über 3.000 € für Möbel', betrag: 150, einmalig: false, bewertung: 'kritisch',   begruendung: 'Ein Konsumkredit führt zu dauerhaften Zinsbelastungen. Gerade bei Alleinerziehenden mit geringem Puffer ist dies ein erhebliches Überschuldungsrisiko.' },
    { person: '{elternteil}', wunsch: 'ein Kursangebot zur Weiterbildung', betrag: 80, einmalig: true,  bewertung: 'vertretbar', begruendung: 'Investitionen in Weiterbildung können langfristig das Einkommen erhöhen und sind daher sinnvoll – sofern der Betrag einmalig und planbar ist.' },
    { person: 'Das Kind',       wunsch: 'ein Markenturnschuh-Paar (einmalig)', betrag: 180, einmalig: true,  bewertung: 'kritisch',   begruendung: 'Markenschuhe sind ein Luxuswunsch. Bei knappem Budget sollte auf günstigere Alternativen zurückgegriffen werden.' },
  ],
  familie_rente: [
    { person: 'Das Paar', wunsch: 'eine Kreuzfahrt auf Kredit', betrag: 200, einmalig: false, bewertung: 'kritisch',   begruendung: 'Im Rentenalter sind die Einnahmen fest und steigen nicht mehr. Kreditfinanzierte Urlaubsreisen gefährden die finanzielle Sicherheit und können zu Überschuldung führen.' },
    { person: 'Das Paar', wunsch: 'ein neues Lesegerät (E-Reader)', betrag: 120, einmalig: true,  bewertung: 'vertretbar', begruendung: 'Ein einmaliger Kauf von 120 € ist bei einem positiven Saldo vertretbar, da er aus Ersparnissen oder dem Überschuss gedeckt werden kann.' },
    { person: 'Das Paar', wunsch: 'monatlichen Beitrag für einen Seniorensportverein', betrag: 30, einmalig: false, bewertung: 'vertretbar', begruendung: 'Ein Vereinsbeitrag von 30 € monatlich fördert Gesundheit und soziale Teilhabe – das ist bei ausreichend Überschuss klar vertretbar.' },
    { person: 'Das Paar', wunsch: 'ein neuen Fernseher auf 0 %-Finanzierung (36 Monate)', betrag: 55, einmalig: false, bewertung: 'kritisch',   begruendung: 'Auch „0 %"-Finanzierungen binden monatlich Geld und verleiten zu weiteren Käufen auf Pump. Im Alter ist ein schuldenfreier Haushalt besonders wichtig.' },
  ],
  familie_gross: [
    { person: 'Der Vater', wunsch: 'ein neues Auto auf Kredit (250 € / Monat)', betrag: 250, einmalig: false, bewertung: 'kritisch',   begruendung: 'Eine monatliche Kreditrate von 250 € ist eine erhebliche Dauerbelastung. Bei drei Kindern und laufenden Ausgaben steigt das Risiko der Überschuldung deutlich.' },
    { person: 'Das Kind', wunsch: 'Mitgliedschaft im Fußballverein', betrag: 20, einmalig: false, bewertung: 'vertretbar', begruendung: 'Ein Vereinsbeitrag von 20 € monatlich fördert Sport und soziale Entwicklung und ist bei ausreichendem Überschuss klar vertretbar.' },
    { person: 'Die Mutter', wunsch: 'ein neuer Kühlschrank (einmalig, Ersatz für defektes Gerät)', betrag: 500, einmalig: true,  bewertung: 'vertretbar', begruendung: 'Der Ersatz eines defekten Haushaltsgeräts ist keine Luxusausgabe, sondern notwendig. Wenn möglich aus Rücklagen finanzieren.' },
    { person: 'Das Kind', wunsch: 'Nachhilfestunden (monatlich)', betrag: 80, einmalig: false, bewertung: 'vertretbar', begruendung: 'Investitionen in Bildung sind grundsätzlich sinnvoll. 80 € monatlich für Nachhilfe sind vertretbar, wenn sie dauerhaft im Budget eingeplant werden.' },
    { person: 'Der Vater', wunsch: 'Ratenkauf für eine Spielekonsole für alle Kinder (30 € / Monat)', betrag: 30, einmalig: false, bewertung: 'kritisch',   begruendung: 'Auch kleine Ratenzahlungen summieren sich. Bei mehreren laufenden Verpflichtungen erhöhen weitere Raten das Überschuldungsrisiko.' },
    { person: 'Die Mutter', wunsch: 'ein Familienurlaub im Ausland (einmalig)', betrag: 1800, einmalig: true,  bewertung: 'kritisch',   begruendung: 'Ein Auslandsurlaub für eine Großfamilie ist teuer. Wenn dafür ein Kredit aufgenommen werden müsste, ist er finanziell nicht vertretbar.' },
  ],
};

// ============================================================================
// AUSGABEN-KATEGORIEN: Regelm. / Unregelm. – Musterzuordnung für Lösung
// ============================================================================
const regelmaessigBeispiele = ['Miete', 'Nebenkosten', 'Lebensmittel', 'Versicherungen', 'Mobilität', 'Telefon & Internet', 'Abonnements', 'Sparbetrag'];
const unregelmaessigBeispiele = ['Kleidung', 'Arztbesuch / Zuzahlungen', 'Schulausflüge', 'Reparaturen', 'Urlaub', 'Geschenke', 'Haushaltsgeräte (Ersatz)'];

// ============================================================================
// AUFGABE GENERIEREN
// ============================================================================
function erstelleHaushaltsplan(profil) {
  let name, intro, familienName, alleinerziehendGeschlecht;

  if (profil.id === 'familie_allein') {
    // Alleinerziehend: echte Person mit Vor- und Nachname
    const person = pick(profil.personen);
    name = person.name;
    familienName = person.familienname;
    alleinerziehendGeschlecht = person.geschlecht;
    // Wähle passenden Intro-Text je nach Geschlecht
    const introIndizes = profil.introGeschlecht[person.geschlecht];
    intro = fuelleSatz(profil.intro[pick(introIndizes)], { name });
  } else {
    name = pick(profil.namen);
    familienName = name.replace('Familie ', '');
    intro = fuelleSatz(pick(profil.intro), { name });
  }

  const person1 = pick(personenNamen.weiblich);
  const person2 = pick(personenNamen.maennlich);

  let einnahmen = [];
  let ausgaben = [];

  // --- EINNAHMEN nach Profil ---
  if (profil.id === 'familie_rente') {
    const r1 = randGlatt(900, 1600);
    const r2 = randGlatt(700, 1300);
    einnahmen.push({ label: `Rente ${person1}`, betrag: r1, satz: fuelleSatz(pick(einnahmenBausteine.rente1), { person1, betrag: formatEuro(r1) }) });
    einnahmen.push({ label: `Rente ${person2}`, betrag: r2, satz: fuelleSatz(pick(einnahmenBausteine.rente2), { person2, betrag: formatEuro(r2) }) });
  } else if (profil.id === 'familie_allein') {
    const g1 = randGlatt(1000, 1800);
    const uh = randGlatt(200, 500);
    const soz = randGlatt(100, 400);
    const kg = 259; // 1 Kind
    einnahmen.push({ label: 'Gehalt', betrag: g1, satz: fuelleSatz(pick(einnahmenBausteine.gehalt1), { person1: name, betrag: formatEuro(g1) }) });
    einnahmen.push({ label: 'Kindergeld (1 Kind)', betrag: kg, satz: fuelleSatz(pick(einnahmenBausteine.kindergeld), { betrag: formatEuro(kg), anzahlKinder: 1, kinderWort: 'Kind' }) });
    einnahmen.push({ label: 'Unterhalt', betrag: uh, satz: fuelleSatz(pick(einnahmenBausteine.unterhalt), { betrag: formatEuro(uh) }) });
    einnahmen.push({ label: 'Staatliche Unterstützung', betrag: soz, satz: fuelleSatz(pick(einnahmenBausteine.sozialhilfe), { betrag: formatEuro(soz) }) });
  } else if (profil.id === 'familie_gross') {
    const g1 = randGlatt(2000, 3500);
    const g2 = randGlatt(800, 1500);
    const anzahlKinder = 3;
    const kg = 259 * anzahlKinder; // 777 €
    const kinderWort = 'Kinder';
    einnahmen.push({ label: `Gehalt ${person1}`, betrag: g1, satz: fuelleSatz(pick(einnahmenBausteine.gehalt1), { person1, betrag: formatEuro(g1) }) });
    einnahmen.push({ label: `Gehalt ${person2}`, betrag: g2, satz: fuelleSatz(pick(einnahmenBausteine.gehalt2), { person2, betrag: formatEuro(g2) }) });
    einnahmen.push({ label: `Kindergeld (${anzahlKinder} Kinder)`, betrag: kg, satz: fuelleSatz(pick(einnahmenBausteine.kindergeld), { betrag: formatEuro(kg), anzahlKinder, kinderWort }) });
  } else {
    // junge Familie – 2 Kinder
    const g1 = randGlatt(1500, 3000);
    const g2 = randGlatt(800, 2000);
    const anzahlKinder = 2;
    const kg = 259 * anzahlKinder; // 518 €
    const kinderWort = 'Kinder';
    einnahmen.push({ label: `Gehalt ${person1}`, betrag: g1, satz: fuelleSatz(pick(einnahmenBausteine.gehalt1), { person1, betrag: formatEuro(g1) }) });
    einnahmen.push({ label: `Gehalt ${person2}`, betrag: g2, satz: fuelleSatz(pick(einnahmenBausteine.gehalt2), { person2, betrag: formatEuro(g2) }) });
    einnahmen.push({ label: `Kindergeld (${anzahlKinder} Kinder)`, betrag: kg, satz: fuelleSatz(pick(einnahmenBausteine.kindergeld), { betrag: formatEuro(kg), anzahlKinder, kinderWort }) });
  }

  // Optionale Mieteinnahmen (20% Chance)
  if (Math.random() < 0.2 && profil.id !== 'familie_allein') {
    const mi = randGlatt(300, 700);
    einnahmen.push({ label: 'Mieteinnahmen', betrag: mi, satz: fuelleSatz(pick(einnahmenBausteine.mieteinnahmen), { betrag: formatEuro(mi) }) });
  }

  // --- AUSGABEN: Pflicht-Positionen ---
  const gesamtEinnahmen = einnahmen.reduce((s, e) => s + e.betrag, 0);

  // Ausgaben-Zielbereich: 80–110% der Einnahmen (damit manchmal Defizit möglich)
  const zielFaktor = 0.80 + Math.random() * 0.30;
  let budgetRest = Math.round(gesamtEinnahmen * zielFaktor);

  const pflichtkategorien = [];

  if (profil.id === 'familie_rente') {
    pflichtkategorien.push(
      { key: 'nebenkosten', min: 150, max: 300 },
      { key: 'lebensmittel', min: 300, max: 600 },
      { key: 'mobilitaet', min: 100, max: 250 },
      { key: 'versicherungen', min: 100, max: 250 },
      { key: 'gesundheit', min: 50, max: 200 },
      { key: 'freizeit', min: 100, max: 300 },
      { key: 'haushalt', min: 50, max: 150 },
    );
  } else if (profil.id === 'familie_allein') {
    pflichtkategorien.push(
      { key: 'miete', min: 500, max: 900 },
      { key: 'nebenkosten', min: 100, max: 200 },
      { key: 'lebensmittel', min: 200, max: 400 },
      { key: 'handy', min: 30, max: 80 },
      { key: 'mobilitaet', min: 50, max: 150 },
      { key: 'schule', min: 50, max: 150 },
      { key: 'kleidung', min: 50, max: 150 },
    );
  } else {
    pflichtkategorien.push(
      { key: 'miete', min: 700, max: 1400 },
      { key: 'nebenkosten', min: 150, max: 350 },
      { key: 'lebensmittel', min: 400, max: 900 },
      { key: 'versicherungen', min: 100, max: 300 },
      { key: 'mobilitaet', min: 150, max: 400 },
      { key: 'handy', min: 50, max: 120 },
      { key: 'freizeit', min: 100, max: 300 },
    );
    if (profil.id === 'familie_gross') {
      pflichtkategorien.push({ key: 'schule', min: 100, max: 250 });
    }
  }

  // Optionale Ausgaben
  const optionalKeys = ['kleidung', 'sparen', 'gesundheit', 'haushalt', 'abonnements', 'schule'];
  const bereitsGenutzt = pflichtkategorien.map(p => p.key);
  const optional = optionalKeys.filter(k => !bereitsGenutzt.includes(k));
  const anzahlOptional = 1 + Math.floor(Math.random() * 3);
  const gewaehltOptional = pickN(optional, Math.min(anzahlOptional, optional.length));
  gewaehltOptional.forEach(k => {
    pflichtkategorien.push({ key: k, min: 30, max: 200 });
  });

  // Beträge zuweisen
  pflichtkategorien.forEach(pos => {
    const betrag = randGlatt(pos.min, pos.max);
    const vorlage = ausgabenBausteine[pos.key];
    const satz = vorlage ? fuelleSatz(pick(vorlage), { betrag: formatEuro(betrag) }) : '';
    const label = labelFuerKey(pos.key);
    const art = ausgabenArt[pos.key] || 'unregelmaessig';
    ausgaben.push({ label, betrag, satz, art, key: pos.key });
  });

  const gesamtAusgaben = ausgaben.reduce((s, a) => s + a.betrag, 0);
  const saldo = gesamtEinnahmen - gesamtAusgaben;

  const abschluss = fuelleSatz(pick(abschlussSaetze), { name });

  // Ausgabenwunsch-Szenario
  const wuenschePool = ausgabenwuenschePool[profil.id] || ausgabenwuenschePool.familie_jung;
  const ausgabenwunsch = pick(wuenschePool);

  return {
    profil: profil.label,
    profilId: profil.id,
    name,
    familienName,
    alleinerziehendGeschlecht: alleinerziehendGeschlecht || null,
    intro,
    person1,
    person2,
    einnahmen,
    ausgaben,
    gesamtEinnahmen,
    gesamtAusgaben,
    saldo,
    abschluss,
    ausgabenwunsch,
  };
}

function labelFuerKey(key) {
  const map = {
    miete: 'Miete',
    nebenkosten: 'Nebenkosten (Strom, Heizung, Wasser)',
    lebensmittel: 'Lebensmittel',
    versicherungen: 'Versicherungen',
    mobilitaet: 'Mobilität (Auto / ÖPNV)',
    handy: 'Telefon & Internet',
    freizeit: 'Freizeit & Hobby',
    kleidung: 'Kleidung',
    sparen: 'Sparbetrag',
    gesundheit: 'Gesundheit (Apotheke, Arzt)',
    schule: 'Schule & Bildung',
    haushalt: 'Haushaltsbedarf',
    abonnements: 'Abonnements & Mitgliedschaften',
  };
  return map[key] || key;
}

// ============================================================================
// RENDER-FUNKTION
// Struktur: ALLE AUFGABEN zuerst, danach ALLE LÖSUNGEN
// Cloze-Syntax ausschließlich in der Lösung
// ============================================================================
function renderHaushaltsplanBlock(hp, nr, gesamt) {
  const clozeAktiv = document.getElementById('optClozeHP')?.checked ?? false;
  const tdE   = `border:1px solid #ccc; padding:7px 12px;`;
  const tdSep = `border:1px solid #ccc; padding:7px 12px; border-left:3px solid #999;`;

  // Hilfsdaten für Zusatzaufgaben
  const aw            = hp.ausgabenwunsch;
  const wunschBetragText = aw.einmalig ? `einmalig ${formatEuro(aw.betrag)}` : `${formatEuro(aw.betrag)} pro Monat`;
  const regelAusgaben   = hp.ausgaben.filter(a => a.art === 'regelmaessig').map(a => a.label);
  const unregelAusgaben = hp.ausgaben.filter(a => a.art === 'unregelmaessig').map(a => a.label);

  // Nummerierung der Teilaufgaben
  const praefix   = gesamt > 1 ? `${nr}` : '';
  const aufgaTitel = gesamt > 1 ? `Aufgabe ${nr}A` : 'Aufgabe A';
  const aufgbTitel = gesamt > 1 ? `Aufgabe ${nr}B` : 'Aufgabe B';
  const aufgcTitel = gesamt > 1 ? `Aufgabe ${nr}C` : 'Aufgabe C';
  const loesungTitel = gesamt > 1 ? `Lösung ${nr}` : 'Lösung ';

  // Elternteil-Bezeichnung für Alleinerziehend
  const elternteil = hp.alleinerziehendGeschlecht === 'm' ? `Der Vater (${hp.name})` : `Die Mutter (${hp.name})`;
  const elternteilKurz = hp.alleinerziehendGeschlecht === 'm' ? `Der Vater` : `Die Mutter`;

  // Ausgabenwunsch person auflösen
  const awPersonRoh = hp.ausgabenwunsch.person;
  const awPerson = awPersonRoh === '{elternteil}' ? elternteil : awPersonRoh;

  let html = '';

  // ══════════════════════════════════════════════════════════════════════════
  // AUFGABENTEIL
  // ══════════════════════════════════════════════════════════════════════════

  // ── Fallbeispiel-Kasten ──────────────────────────────────────────────────
  html += `<h2 style="margin-top:${nr > 1 ? '2.5em' : '0'};">${aufgaTitel} – Haushaltsplan erstellen</h2>`;
  html += `<p style="font-style:italic; color:#555; font-size:0.95rem; max-width:680px;">
    Lies das folgende Fallbeispiel sorgfältig durch.
  </p>`;

  html += `<div style="border:1px solid #ccc; border-left:5px solid #1a237e; border-radius:6px; padding:20px 24px; margin:12px 0 16px; background:#fafafa; max-width:680px;">`;
  html += `<h3 style="margin-bottom:4px; color:#1a237e;">${hp.name}</h3>`;
  html += `<p style="color:#546e7a; font-size:0.85rem; margin-bottom:14px; font-style:italic;">Familientyp: ${hp.profil}</p>`;
  html += `<p style="margin-bottom:12px;">${hp.intro}</p>`;
  html += `<p style="margin-bottom:10px;"><strong>Einnahmen:</strong> `;
  html += hp.einnahmen.map(e => e.satz).join(' ');
  html += `</p>`;
  const allAusgabenSaetze = shuffle(hp.ausgaben.map(a => a.satz).filter(Boolean));
  html += `<p style="margin-bottom:10px;"><strong>Ausgaben:</strong> `;
  html += allAusgabenSaetze.join(' ');
  html += `</p>`;
  html += `<p style="margin-top:14px; font-style:italic; color:#546e7a;">${hp.abschluss}</p>`;
  html += `</div>`;

  // Aufgabenstellung a
  html += `<ol style="max-width:680px; font-size:0.9rem; line-height:2; margin-bottom:0;">
    <li>Ermittle alle Einnahmen und Ausgaben aus dem Fallbeispiel und trage sie in den Haushaltsplan ein.</li>
    <li>Berechne die Summe der Einnahmen und die Summe der Ausgaben.</li>
    <li>Ermittle den monatlichen Gewinn bzw. Verlust.</li>
  </ol>`;

  // ── Aufgabentabelle Einnahmen (leere Zeilen zum Ausfüllen) ───────────────
  html += `<h3 style="margin-top:1.2em;">Haushaltsplan</h3>`;

  html += `<table style="border-collapse:collapse; font-size:0.9rem; width:100%; max-width:680px;">`;
  html += `<thead><tr style="background:#e8eaf6;">
    <th style="border:1px solid #ccc; padding:8px 12px; text-align:left; width:65%;">Einnahmen</th>
    <th style="border:1px solid #ccc; padding:8px 12px; text-align:right; width:35%;">Betrag (€)</th>
  </tr></thead><tbody>`;
  hp.einnahmen.forEach(() => {
    html += `<tr>
      <td style="${tdE} height:32px;">&nbsp;</td>
      <td style="${tdE} text-align:right;">&nbsp;</td>
    </tr>`;
  });
  html += `<tr style="background:#e8eaf6; font-weight:bold;">
    <td style="${tdE}">Summe Einnahmen</td>
    <td style="${tdE} text-align:right;">&nbsp;</td>
  </tr></tbody></table>`;

  html += `<table style="border-collapse:collapse; font-size:0.9rem; width:100%; max-width:680px; margin-top:8px;">`;
  html += `<thead><tr style="background:#fce4ec;">
    <th style="border:1px solid #ccc; padding:8px 12px; text-align:left; width:65%;">Ausgaben</th>
    <th style="border:1px solid #ccc; padding:8px 12px; text-align:right; width:35%;">Betrag (€)</th>
  </tr></thead><tbody>`;
  hp.ausgaben.forEach(() => {
    html += `<tr>
      <td style="${tdE} height:32px;">&nbsp;</td>
      <td style="${tdE} text-align:right;">&nbsp;</td>
    </tr>`;
  });
  html += `<tr style="background:#fce4ec; font-weight:bold;">
    <td style="${tdE}">Summe Ausgaben</td>
    <td style="${tdE} text-align:right;">&nbsp;</td>
  </tr></tbody></table>`;

  html += `<table style="border-collapse:collapse; font-size:0.9rem; width:100%; max-width:680px; margin-top:8px;">`;
  html += `<tbody><tr style="background:#f3e5f5; font-weight:bold;">
    <td style="${tdE} width:65%;">Monatlicher Gewinn / Verlust<br><span style="font-weight:400; font-size:0.82rem;">(Summe Einnahmen − Summe Ausgaben)</span></td>
    <td style="${tdE} text-align:right; width:35%;">&nbsp;</td>
  </tr></tbody></table>`;

  // ── Aufgabe B: Ausgabenwunsch ────────────────────────────────────────────
  html += `<h2 style="margin-top:2em;">${aufgbTitel} – Ausgabenwunsch bewerten</h2>`;

  const awBg     = aw.bewertung === 'kritisch' ? '#fff8e1' : '#f1f8e9';
  const awBorder = aw.bewertung === 'kritisch' ? '#f9a825' : '#558b2f';
  html += `<div style="border:1px solid ${awBorder}; border-left:5px solid ${awBorder}; border-radius:6px; padding:16px 20px; margin:12px 0; background:${awBg}; max-width:680px;">`;
  html += `<p style="margin:0; font-size:0.95rem;"><strong>${awPerson}</strong> von der Familie ${hp.familienName} wünscht sich <strong>${aw.wunsch}</strong>.<br>
    <span style="font-size:0.88rem; color:#555;">Kosten: <strong>${wunschBetragText}</strong>${aw.einmalig ? ' (einmalige Ausgabe)' : ' (laufende monatliche Ausgabe)'}</span></p>`;
  html += `</div>`;

  html += `<ol style="max-width:680px; font-size:0.9rem; line-height:2;">
    <li>Beurteile den Ausgabenwunsch: Ordne ihn als <strong>vertretbar</strong> oder <strong>kritisch</strong> ein und begründe deine Einschätzung.</li>
    <li>Ermittle die Auswirkung dieser Ausgabe auf den Gewinn / Verlust des Haushaltsplans von der Familie ${hp.familienName}.${aw.einmalig ? ' (Hinweis: einmalige Ausgabe)' : ' (Hinweis: monatlich wiederkehrende Ausgabe)'}</li>
    <li>Definiere den Begriff <strong>Überschuldung</strong>.</li>
    <li>Nenne zwei Maßnahmen, mit denen die Familie ${hp.familienName} einer Überschuldung entgegenwirken kann.</li>
  </ol>`;

  // ── Aufgabe C: Regelm. / Unregelm. Ausgaben ─────────────────────────────
  html += `<h2 style="margin-top:2em;">${aufgcTitel} – Regelmäßige und unregelmäßige Ausgaben</h2>`;
  html += `<p style="font-style:italic; color:#555; font-size:0.95rem; max-width:680px;">
    Beziehe dich auf den Haushaltsplan von der Familie ${hp.familienName}.
  </p>`;

  html += `<ol style="max-width:680px; font-size:0.9rem; line-height:2;">
    <li>Erkläre den Unterschied zwischen <strong>regelmäßigen</strong> und <strong>unregelmäßigen</strong> Ausgaben.</li>
    <li>Ordne alle Ausgaben aus dem Haushaltsplan von der Familie ${hp.familienName} in die untenstehende Tabelle ein.</li>
    <li>Nenne je zwei weitere Beispiele für regelmäßige und unregelmäßige Ausgaben, die nicht im Haushaltsplan enthalten sind.</li>
    <li>Begründe, weshalb es sinnvoll ist, auch für unregelmäßige Ausgaben monatlich einen Betrag zurückzulegen.</li>
  </ol>`;

  // Ausfülltabelle (leer – Schüler füllen aus)
  const maxZeilenC = Math.max(regelAusgaben.length, unregelAusgaben.length) + 2;
  html += `<table style="border-collapse:collapse; font-size:0.9rem; width:100%; max-width:680px; margin-top:8px;">`;
  html += `<thead><tr style="background:#e8eaf6;">
    <th style="border:1px solid #ccc; padding:8px 12px; text-align:left; width:50%;">Regelmäßige Ausgaben</th>
    <th style="border:1px solid #ccc; padding:8px 12px; text-align:left; width:50%;">Unregelmäßige Ausgaben</th>
  </tr></thead><tbody>`;
  for (let i = 0; i < maxZeilenC; i++) {
    html += `<tr>
      <td style="${tdE} height:30px;">&nbsp;</td>
      <td style="${tdE} height:30px;">&nbsp;</td>
    </tr>`;
  }
  html += `</tbody></table>`;

  // ══════════════════════════════════════════════════════════════════════════
  // LÖSUNGSTEIL  (Cloze nur hier)
  // ══════════════════════════════════════════════════════════════════════════
  html += `<h2 style="margin-top:2.5em;">${loesungTitel}</h2>`;


  // ── Lösung a: Haushaltsplan mit Werten ───────────────────────────────────
  html += `<h3 style="margin-top:0;">${loesungTitel}A – Haushaltsplan</h3>`;

  html += `<table style="border-collapse:collapse; font-size:0.9rem; width:100%; max-width:680px;">`;
  html += `<thead><tr style="background:#e8eaf6;">
    <th style="border:1px solid #ccc; padding:7px 12px; text-align:left; width:60%;">Einnahmen</th>
    <th style="border:1px solid #ccc; padding:7px 12px; text-align:right; width:40%;">Betrag</th>
  </tr></thead><tbody>`;
  hp.einnahmen.forEach(e => {
    html += `<tr>
      <td style="border:1px solid #ccc; padding:6px 12px;">${e.label}</td>
      <td style="border:1px solid #ccc; padding:6px 12px; text-align:right;">${clozeAktiv ? zelleHP(e.betrag, true) : formatEuro(e.betrag)}</td>
    </tr>`;
  });
  html += `<tr style="background:#e8eaf6; font-weight:bold;">
    <td style="border:1px solid #ccc; padding:6px 12px;">Summe Einnahmen</td>
    <td style="border:1px solid #ccc; padding:6px 12px; text-align:right;">${clozeAktiv ? zelleHP(hp.gesamtEinnahmen, true) : formatEuro(hp.gesamtEinnahmen)}</td>
  </tr></tbody></table>`;

  html += `<table style="border-collapse:collapse; font-size:0.9rem; width:100%; max-width:680px; margin-top:8px;">`;
  html += `<thead><tr style="background:#fce4ec;">
    <th style="border:1px solid #ccc; padding:7px 12px; text-align:left; width:60%;">Ausgaben</th>
    <th style="border:1px solid #ccc; padding:7px 12px; text-align:right; width:40%;">Betrag</th>
  </tr></thead><tbody>`;
  hp.ausgaben.forEach(a => {
    html += `<tr>
      <td style="border:1px solid #ccc; padding:6px 12px;">${a.label}</td>
      <td style="border:1px solid #ccc; padding:6px 12px; text-align:right;">${clozeAktiv ? zelleHP(a.betrag, true) : formatEuro(a.betrag)}</td>
    </tr>`;
  });
  html += `<tr style="background:#fce4ec; font-weight:bold;">
    <td style="border:1px solid #ccc; padding:6px 12px;">Summe Ausgaben</td>
    <td style="border:1px solid #ccc; padding:6px 12px; text-align:right;">${clozeAktiv ? zelleHP(hp.gesamtAusgaben, true) : formatEuro(hp.gesamtAusgaben)}</td>
  </tr></tbody></table>`;

  const saldoFarbe = hp.saldo >= 0 ? '#2e7d32' : '#c62828';
  const saldoBg    = hp.saldo >= 0 ? '#e8f5e9' : '#ffebee';
  const saldoLabel = hp.saldo >= 0 ? 'Gewinn' : 'Verlust';
  html += `<table style="border-collapse:collapse; font-size:0.9rem; width:100%; max-width:680px; margin-top:8px;">`;
  html += `<tbody><tr style="background:${saldoBg}; font-weight:bold; color:${saldoFarbe};">
    <td style="border:1px solid #ccc; padding:8px 12px; width:60%;">Monatlicher ${saldoLabel}</td>
    <td style="border:1px solid #ccc; padding:8px 12px; text-align:right; width:40%;">${clozeAktiv ? zelleHP(hp.saldo, true) : formatEuro(hp.saldo)}</td>
  </tr></tbody></table>`;

  // ── Lösung B: Ausgabenwunsch ─────────────────────────────────────────────
  html += `<h3 style="margin-top:1.6em;">${loesungTitel}B – Ausgabenwunsch</h3>`;

  const bewIcon  = aw.bewertung === 'kritisch' ? '⚠️' : '✅';
  const bewFarbe = aw.bewertung === 'kritisch' ? '#c62828' : '#2e7d32';
  const bewBg2   = aw.bewertung === 'kritisch' ? '#ffebee' : '#e8f5e9';
  html += `<div style="background:${bewBg2}; border:1px solid ${bewFarbe}; border-radius:4px; padding:10px 16px; max-width:680px; font-size:0.88rem; line-height:1.9;">`;
  html += `<strong>1. Beurteilung:</strong> ${bewIcon} <strong>${aw.bewertung === 'kritisch' ? 'Kritisch' : 'Vertretbar'}</strong><br>`;
  html += `${aw.begruendung}<br><br>`;

  if (!aw.einmalig) {
    const neuerSaldo = hp.saldo - aw.betrag;
    const neuerLabel = neuerSaldo >= 0 ? 'Gewinn' : 'Verlust';
    const neuerText  = `${neuerLabel} von ${formatEuro(Math.abs(neuerSaldo))}`;
    html += `<strong>2. Auswirkung auf den Gewinn / Verlust:</strong> Summe Ausgaben steigt um ${formatEuro(aw.betrag)} → neuer ${neuerText}.<br><br>`;
  } else {
    html += `<strong>2. Auswirkung auf den Gewinn / Verlust:</strong> Die einmalige Ausgabe von ${formatEuro(aw.betrag)} verringert den Gewinn bzw. die Rücklagen einmalig um diesen Betrag.<br><br>`;
  }
  html += `<strong>3. Überschuldung:</strong> Überschuldung liegt vor, wenn eine Person oder ein Haushalt die fälligen Schulden dauerhaft nicht mehr begleichen kann – auch nicht durch den Verkauf von Vermögen.<br><br>`;
  html += `<strong>4. Maßnahmen:</strong> z. B. Haushaltsbuch führen und Ausgaben reduzieren · Ratenkäufe und Konsumkredite vermeiden · Rücklagen für unvorhergesehene Ausgaben bilden · Schuldnerberatung aufsuchen.`;
  html += `</div>`;

  // ── Lösung C: Regelm. / Unregelm. – ausgefüllte Tabelle ─────────────────
  html += `<h3 style="margin-top:1.6em;">${loesungTitel}C – Regelmäßige und unregelmäßige Ausgaben</h3>`;
  html += `<div style="background:#f8f7f4; border:1px solid #ddd; border-radius:4px; padding:10px 16px; max-width:680px; font-size:0.88rem; line-height:1.9; margin-bottom:10px;">`;
  html += `<strong>1. Definition:</strong> <em>Regelmäßige Ausgaben</em> fallen jeden Monat in gleicher oder ähnlicher Höhe an (z. B. Miete, Versicherungen). <em>Unregelmäßige Ausgaben</em> entstehen nur gelegentlich oder schwankend (z. B. Kleidung, Reparaturen).<br><br>`;
  html += `<strong>3. Weitere Beispiele:</strong><br>`;
  html += `Regelmäßig: <em>${regelmaessigBeispiele.filter(b => !regelAusgaben.includes(b)).slice(0, 2).join(', ')}</em><br>`;
  html += `Unregelmäßig: <em>${unregelmaessigBeispiele.filter(b => !unregelAusgaben.includes(b)).slice(0, 2).join(', ')}</em><br><br>`;
  html += `<strong>4. Begründung:</strong> Unregelmäßige Ausgaben sind zeitlich und in ihrer Höhe unvorhersehbar. Wer monatlich einen festen Betrag zurücklegt, kann diese Ausgaben begleichen, ohne Schulden machen zu müssen.`;
  html += `</div>`;

  // Ausgefüllte Tabelle (Lösung 2)
  const maxZeilenLsg = Math.max(regelAusgaben.length, unregelAusgaben.length);
  html += `<table style="border-collapse:collapse; font-size:0.9rem; width:100%; max-width:680px;">`;
  html += `<thead><tr style="background:#e8eaf6;">
    <th style="border:1px solid #ccc; padding:8px 12px; text-align:left; width:50%;">Regelmäßige Ausgaben</th>
    <th style="border:1px solid #ccc; padding:8px 12px; text-align:left; width:50%;">Unregelmäßige Ausgaben</th>
  </tr></thead><tbody>`;
  for (let i = 0; i < maxZeilenLsg; i++) {
    html += `<tr>
      <td style="${tdE} height:30px;">${regelAusgaben[i] ? regelAusgaben[i] : '&nbsp;'}</td>
      <td style="${tdE} height:30px;">${unregelAusgaben[i] ? unregelAusgaben[i] : '&nbsp;'}</td>
    </tr>`;
  }
  html += `</tbody></table>`;

  return html;
}

// ============================================================================
// HAUPTFUNKTION
// ============================================================================
function zeigeZufaelligeHaushaltsplaene() {
  const container = document.getElementById('Container');
  if (!container) return;

  const typFilter = document.getElementById('typFilter')?.value || 'alle';
  const anzahl = parseInt(document.getElementById('anzahlAufgaben')?.value) || 1;

  let pool = familienProfile;
  if (typFilter !== 'alle') pool = familienProfile.filter(p => p.id === typFilter);
  if (pool.length === 0) pool = familienProfile;

  letzteGenerierteAufgaben = [];
  const genutzt = [];
  for (let i = 0; i < anzahl; i++) {
    const verfuegbar = pool.filter(p => !genutzt.includes(p.id));
    const profil = pick(verfuegbar.length > 0 ? verfuegbar : pool);
    genutzt.push(profil.id);
    letzteGenerierteAufgaben.push(erstelleHaushaltsplan(profil));
  }

  let html = '';
  letzteGenerierteAufgaben.forEach((hp, idx) => {
    html += renderHaushaltsplanBlock(hp, idx + 1, anzahl);
  });
  container.innerHTML = html;

  // KI-Prompt aktualisieren
  const vorschau = document.getElementById('kiPromptVorschau');
  if (vorschau && getComputedStyle(vorschau).display !== 'none') {
    vorschau.textContent = erstelleKiPromptText();
  }
}

// ============================================================================
// KI-ASSISTENT PROMPT
// ============================================================================
const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Lernassistent für Schülerinnen und Schüler der bayerischen Realschule (BwR, Klasse 7 oder 8). Du hilfst beim Verstehen und Erstellen von Haushaltsplänen.

Aufgabe:
- Gib KEINE fertigen Lösungen direkt vor.
- Führe die Lernenden durch gezielte Fragen zur richtigen Lösung.
- Ziel: eigenes Denken und Rechnen fördern.

Wichtige Begriffe (korrekt verwenden!):
- Einnahmen = Geld, das in den Haushalt fließt (Gehalt, Rente, Kindergeld, Unterhalt …)
- Ausgaben = Geld, das den Haushalt verlässt (Miete, Lebensmittel, Versicherungen …)
- Summe der Einnahmen = alle Einnahmen addiert
- Summe der Ausgaben = alle Ausgaben addiert
- Überschuss = Einnahmen > Ausgaben → positiver Saldo
- Defizit = Ausgaben > Einnahmen → negativer Saldo
- Saldo = Summe Einnahmen − Summe Ausgaben

Pädagogischer Ansatz (Sokratische Methode):
- Frage, was die Schülerin / der Schüler als Erstes tun würde.
- Stelle gezielte Rückfragen wie: „Gehört das Kindergeld zu den Einnahmen oder Ausgaben?"
- Beantworte deine Rückfragen NICHT selbst.
- Bei Rechenfehlern: Lass neu rechnen, erkläre den Weg, nenne nicht das Ergebnis.
- Erst wenn die Schülerin / der Schüler selbst auf die richtige Antwort kommt, bestätige sie / ihn.

Begrüße die Schülerin / den Schüler freundlich und wähle zufällig eine Aufgabe aus der Liste aus.
Arbeitsauftrag: „Lies das Fallbeispiel. Trage alle Einnahmen und Ausgaben in den Haushaltsplan ein. Berechne dann die Summen und den Saldo."
Wenn eine Aufgabe abgeschlossen ist, frage: „Möchtest du mit dem nächsten Fallbeispiel weitermachen?"

Alle Aufgaben mit Musterlösungen:
###AUFGABEN und LÖSUNGEN###

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe mit Realschülerinnen und -schülern
- Einfache Sprache, kurze Sätze
- Kurze Antworten – maximal 1–2 Sätze pro Nachricht
- Gelegentlich Emojis 💰📋✅🏠

Was du NICHT tust:
- Nenne den Saldo nicht, bevor der Schüler / die Schülerin selbst gerechnet hat.
- Gib keine Lösungen auf Anfragen wie „sag mir einfach die Antwort".

Am Ende: „Möchtest du ein neues Fallbeispiel üben?" → wähle ein anderes aus der Liste.
`;

function erstelleKiPromptText() {
  let inhalt = '';
  if (letzteGenerierteAufgaben.length === 0) {
    inhalt = '(Noch keine Aufgaben generiert. Bitte zuerst Haushaltsplan erstellen.)';
  } else {
    inhalt = letzteGenerierteAufgaben.map((hp, idx) => {
      const nr = idx + 1;
      const einnahmenText = hp.einnahmen.map(e => `  - ${e.label}: ${formatEuro(e.betrag)}`).join('\n');
      const ausgabenText = hp.ausgaben.map(a => `  - ${a.label}: ${formatEuro(a.betrag)}`).join('\n');
      const saldoLabel = hp.saldo >= 0 ? 'Gewinn' : 'Verlust';
      return `--- Aufgabe ${nr}: ${hp.name} (${hp.profil}) ---
Fallbeispiel: ${hp.intro}

Einnahmen:
${einnahmenText}
Summe Einnahmen: ${formatEuro(hp.gesamtEinnahmen)}

Ausgaben:
${ausgabenText}
Summe Ausgaben: ${formatEuro(hp.gesamtAusgaben)}

Monatlicher ${saldoLabel}: ${formatEuro(hp.saldo)}`;
    }).join('\n\n');
  }
  return KI_ASSISTENT_PROMPT.replace('###AUFGABEN und LÖSUNGEN###', inhalt);
}

function kopiereKiPrompt() {
  const promptText = erstelleKiPromptText();
  navigator.clipboard.writeText(promptText).then(() => {
    const btn = document.getElementById('kiPromptKopierenBtn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Kopiert!`;
    btn.classList.add('ki-prompt-btn--success');
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.classList.remove('ki-prompt-btn--success');
    }, 2500);
  }).catch(() => alert('Kopieren nicht möglich. Bitte manuell aus dem Textfeld kopieren.'));
}

function toggleKiPromptVorschau() {
  const vorschau = document.getElementById('kiPromptVorschau');
  const btn = document.getElementById('kiPromptToggleBtn');
  const isHidden = getComputedStyle(vorschau).display === 'none';
  if (isHidden) {
    vorschau.style.display = 'block';
    vorschau.textContent = erstelleKiPromptText();
    btn.textContent = 'Vorschau ausblenden ▲';
  } else {
    vorschau.style.display = 'none';
    btn.textContent = 'Prompt anzeigen ▼';
  }
}

// ============================================================================
// INITIALISIERUNG
// ============================================================================
document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    zeigeZufaelligeHaushaltsplaene();
  }, 500);
});