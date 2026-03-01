// ============================================================================
// AUSSAGEN-DATENBANK
// ============================================================================

const aussagenDatenbank = [

  // ── UNTERNEHMENSLEITUNG ──
  {
    aussage: "Die Unternehmensleitung ist für die strategische Planung und Führung des gesamten Unternehmens zuständig.",
    korrekt: true,
    bereich: "Unternehmensleitung",
    begruendung: "Die Unternehmensleitung (z. B. Geschäftsführung) koordiniert alle Funktionsbereiche, trifft grundlegende Entscheidungen und legt die Unternehmensziele fest. Sie steht hierarchisch über allen anderen Bereichen."
  },
  {
    aussage: "Die Unternehmensleitung ist dem Absatz (Verkauf) untergeordnet, da der Umsatz das Wichtigste im Betrieb ist.",
    korrekt: false,
    bereich: "Unternehmensleitung",
    begruendung: "Die Unternehmensleitung steht hierarchisch über allen anderen Funktionsbereichen – auch über dem Absatz. Sie gibt die übergeordneten Ziele vor, die alle Bereiche umsetzen müssen."
  },
  {
    aussage: "Die kaufmännische Leitung umfasst Bereiche wie Rechnungswesen und Verwaltung.",
    korrekt: true,
    bereich: "Kaufmännische Leitung",
    begruendung: "Die kaufmännische Leitung verantwortet betriebswirtschaftliche Aufgaben wie Buchhaltung, Rechnungswesen und allgemeine Verwaltung. Sie ist klar von der technischen Leitung (Produktion) getrennt."
  },
  {
    aussage: "Technische Leitung und kaufmännische Leitung haben in einem Fertigungsunternehmen dieselben Aufgaben.",
    korrekt: false,
    bereich: "Kaufmännische / Technische Leitung",
    begruendung: "Die technische Leitung verantwortet Fertigung und Produktion, die kaufmännische Leitung Verwaltung, Finanzen und Rechnungswesen. Beide Bereiche haben klar unterschiedliche Zuständigkeiten."
  },
  {
    aussage: "Rechnungswesen und Verwaltung gehören zur technischen Leitung eines Fertigungsunternehmens.",
    korrekt: false,
    bereich: "Kaufmännische Leitung",
    begruendung: "Rechnungswesen und Verwaltung sind Teil der kaufmännischen Leitung. Die technische Leitung ist für Produktion und technische Prozesse zuständig – nicht für kaufmännische Aufgaben."
  },

  // ── BESCHAFFUNG ──
  {
    aussage: "Die Beschaffung (Einkauf) ist dafür verantwortlich, dass die notwendigen Werkstoffe für die Produktion rechtzeitig und kostengünstig eingekauft werden.",
    korrekt: true,
    bereich: "Beschaffung (Einkauf)",
    begruendung: "Der Beschaffungsbereich sorgt dafür, dass Rohstoffe, Hilfsstoffe, Fremdbauteile und Betriebsstoffe in der richtigen Menge, zur richtigen Zeit und zum besten Preis vorhanden sind – als Voraussetzung für die Produktion."
  },
  {
    aussage: "Die Beschaffung kauft Fertigerzeugnisse ein, die direkt an Kunden verkauft werden.",
    korrekt: false,
    bereich: "Beschaffung (Einkauf)",
    begruendung: "Die Beschaffung kauft keine fertigen Verkaufsprodukte, sondern Werkstoffe (Rohstoffe, Hilfsstoffe, Fremdbauteile, Betriebsstoffe), aus denen in der Fertigung erst die Fertigerzeugnisse hergestellt werden. Den Verkauf übernimmt der Absatz."
  },
  {
    aussage: "Der Beschaffungsbereich bestellt die Werkstoffe direkt bei den Lieferanten.",
    korrekt: true,
    bereich: "Beschaffung (Einkauf)",
    begruendung: "Die Beschaffung ist die Verbindungsstelle zwischen dem Unternehmen und seinen Lieferanten: Sie vergleicht Angebote, schließt Verträge ab und bestellt die benötigten Werkstoffe (z. B. Rohstoffe, Fremdbauteile) direkt beim Lieferanten."
  },
  {
    aussage: "Der Beschaffungsbereich legt auch die Verkaufspreise für Kunden fest.",
    korrekt: false,
    bereich: "Beschaffung (Einkauf)",
    begruendung: "Die Preisgestaltung gegenüber Kunden ist Aufgabe des Absatzbereichs (Verkauf). Der Beschaffungsbereich verhandelt nur die Einkaufspreise für Werkstoffe bei Lieferanten."
  },

  // ── LAGER WERKSTOFFE ──
  {
    aussage: "Im Werkstofflager werden die eingekauften Werkstoffe aufbewahrt, bis sie von der Fertigung benötigt werden.",
    korrekt: true,
    bereich: "Lager Werkstoffe",
    begruendung: "Das Werkstofflager übernimmt die angelieferten Werkstoffe von der Beschaffung und lagert sie. Sobald die Fertigung Materialien anfordert, gibt das Lager diese weiter. So wird sichergestellt, dass die Produktion nie auf Materialien warten muss."
  },
  {
    aussage: "Das Werkstofflager und das Lager für Fertigerzeugnisse sind dasselbe Lager.",
    korrekt: false,
    bereich: "Lager Werkstoffe / Lager Fertigerzeugnisse",
    begruendung: "Es gibt zwei getrennte Lager: Das Werkstofflager kommt vor der Fertigung und enthält Materialien zur Verarbeitung. Das Lager für Fertigerzeugnisse kommt nach der Fertigung und enthält fertige Produkte, die an Kunden verkauft werden."
  },

  // ── FERTIGUNG / PRODUKTION ──
  {
    aussage: "In der Fertigung werden Werkstoffe (z. B. Rohstoffe und Fremdbauteile) zu verkaufsfertigen Fertigerzeugnissen verarbeitet.",
    korrekt: true,
    bereich: "Fertigung / Herstellung (Produktion)",
    begruendung: "Die Fertigung ist der Bereich, in dem aus den eingekauften Werkstoffen durch Bearbeitung und Montage die eigentlichen Produkte des Unternehmens entstehen – die sogenannten Fertigerzeugnisse, die anschließend verkauft werden."
  },
  {
    aussage: "Ein Fertigungsunternehmen kann auf den Produktionsbereich verzichten, wenn es genug Mitarbeiter im Verkauf hat.",
    korrekt: false,
    bereich: "Fertigung / Herstellung (Produktion)",
    begruendung: "Ohne Fertigung entstehen keine Fertigerzeugnisse – der Verkauf hat dann schlicht nichts zu verkaufen. Fertigung und Verkauf sind zwei völlig verschiedene Aufgaben, die einander nicht ersetzen können."
  },
  {
    aussage: "Die Fertigung entnimmt die benötigten Werkstoffe aus dem Werkstofflager.",
    korrekt: true,
    bereich: "Fertigung / Herstellung (Produktion)",
    begruendung: "Der Materialfluss läuft von der Beschaffung über das Werkstofflager in die Fertigung. Das Werkstofflager stellt die Materialien bereit, sobald die Produktion sie anfordert."
  },
  {
    aussage: "Die Fertigung entscheidet alleine, welche Produkte hergestellt werden, ohne Absprache mit dem Absatz.",
    korrekt: false,
    bereich: "Fertigung / Herstellung (Produktion)",
    begruendung: "Was und wie viel produziert wird, richtet sich nach den Bestellungen und Absatzplänen des Verkaufs. Ohne diese Abstimmung würden entweder zu viele oder zu wenige Produkte hergestellt."
  },

  // ── LAGER FERTIGERZEUGNISSE ──
  {
    aussage: "Die in der Fertigung hergestellten Fertigerzeugnisse werden zunächst ins Lager gebracht und von dort vom Absatz an Kunden geliefert.",
    korrekt: true,
    bereich: "Lager Fertigerzeugnisse",
    begruendung: "Nach der Produktion wandern die fertigen Produkte ins Lager für Fertigerzeugnisse. Erst wenn ein Kunde bestellt, entnimmt der Absatz die Ware aus diesem Lager und veranlasst die Lieferung."
  },

  // ── ABSATZ / VERKAUF ──
  {
    aussage: "Der Absatzbereich (Verkauf) ist dafür zuständig, die Fertigerzeugnisse an Kunden zu verkaufen.",
    korrekt: true,
    bereich: "Absatz (Verkauf)",
    begruendung: "Der Absatz verantwortet den Verkauf der Fertigerzeugnisse: Er wirbt für die Produkte, nimmt Bestellungen entgegen, legt Preise fest und sorgt für die Lieferung an den Kunden."
  },
  {
    aussage: "Kunden kaufen ihre Produkte direkt in der Fertigung ab.",
    korrekt: false,
    bereich: "Absatz (Verkauf)",
    begruendung: "Kunden haben keinen direkten Kontakt mit der Fertigung. Der Absatzbereich ist die Schnittstelle zum Kunden: Er nimmt Bestellungen entgegen und liefert die Fertigerzeugnisse aus dem Lager."
  },
  {
    aussage: "Der Absatz kauft Werkstoffe von Lieferanten ein, damit die Produktion starten kann.",
    korrekt: false,
    bereich: "Absatz (Verkauf)",
    begruendung: "Der Einkauf von Werkstoffen ist Aufgabe der Beschaffung, nicht des Absatzes. Der Absatz kümmert sich ausschließlich um den Verkauf der fertigen Erzeugnisse an Kunden."
  },

  // ── ZUSAMMENSPIEL / ALLGEMEIN ──
  {
    aussage: "In einem Fertigungsunternehmen läuft der Ablauf so: Lieferant → Beschaffung → Werkstofflager → Fertigung → Lager Fertigerzeugnisse → Absatz → Kunde.",
    korrekt: true,
    bereich: "Zusammenspiel der Bereiche",
    begruendung: "Dies ist der typische Ablauf in einem Fertigungsunternehmen. Erst werden Werkstoffe eingekauft und gelagert, dann zu Fertigerzeugnissen verarbeitet, erneut gelagert und schließlich an Kunden verkauft."
  },
  {
    aussage: "Die einzelnen Funktionsbereiche eines Unternehmens arbeiten völlig unabhängig voneinander.",
    korrekt: false,
    bereich: "Zusammenspiel der Bereiche",
    begruendung: "Alle Funktionsbereiche sind eng miteinander vernetzt. Die Fertigung richtet sich nach den Absatzplänen, die Beschaffung nach dem Bedarf der Fertigung – ohne Abstimmung entstehen Engpässe oder Überbestände."
  },
  {
    aussage: "Ein Fertigungsunternehmen unterscheidet sich von einem Handelsunternehmen dadurch, dass es seine Produkte selbst herstellt.",
    korrekt: true,
    bereich: "Zusammenspiel der Bereiche",
    begruendung: "Ein Fertigungsunternehmen verarbeitet Werkstoffe zu Fertigerzeugnissen – es hat einen eigenen Produktionsbereich. Ein Handelsunternehmen kauft dagegen bereits fertige Waren ein und verkauft sie weiter, ohne selbst etwas herzustellen."
  },
  {
    aussage: "Wenn der Absatz einen starken Anstieg der Nachfrage meldet, muss die Beschaffung entsprechend mehr Werkstoffe einkaufen.",
    korrekt: true,
    bereich: "Zusammenspiel der Bereiche",
    begruendung: "Mehr Nachfrage bedeutet: mehr Produktion nötig → mehr Werkstoffe benötigt → Beschaffung muss mehr einkaufen. Dieses Beispiel zeigt, wie eng alle Funktionsbereiche miteinander zusammenhängen."
  },
  {
    aussage: "Die Unternehmensleitung koordiniert alle Funktionsbereiche, gibt aber selbst keine Ziele vor.",
    korrekt: false,
    bereich: "Unternehmensleitung",
    begruendung: "Die Unternehmensleitung gibt explizit die übergeordneten Unternehmensziele (z. B. Umsatz, Gewinn, Wachstum) vor UND koordiniert alle Bereiche auf diese Ziele hin – beides gehört zu ihren Kernaufgaben."
  },
];

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

// ============================================================================
// HAUPTFUNKTION
// ============================================================================

function zeigeZufaelligeWahrFalsch() {
  const container = document.getElementById('Container');
  if (!container) return;
  container.innerHTML = '';
  

  const anzahl = parseInt(document.getElementById('anzahlAussagen').value) || 6;
  const ausgewaehlte = shuffle(aussagenDatenbank).slice(0, anzahl);

  // ── SVG Übersicht ─────────────────────────────────────────────────────────
  const svgHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 560" style="width:100%;max-width:980px;display:block;margin-bottom:16px;font-family:Arial,sans-serif;">

    <!-- Wandfläche -->
    <rect x="110" y="120" width="750" height="400" fill="#f0f4fa" stroke="none"/>

    <!-- Sägezahndach rechts -->
    <polygon points="500,120 500,30 590,120 590,30 680,120 680,30 770,120 770,30 860,120"
      fill="#d0daf0" stroke="none"/>
    <line x1="110" y1="120" x2="500" y2="120" stroke="#1a3a6e" stroke-width="2"/>
    <polyline points="500,120 500,30 590,120 590,30 680,120 680,30 770,120 770,30 860,120"
      fill="none" stroke="#1a3a6e" stroke-width="2"/>
    <polyline points="110,120 110,520 860,520 860,120" fill="none" stroke="#1a3a6e" stroke-width="2.5"/>

    <!-- Unternehmensleitung -->
    <rect x="135" y="132" width="700" height="56" rx="6" fill="#4a6fa5" stroke="#1a3a6e" stroke-width="1.5"/>
    <text x="485" y="166" text-anchor="middle" fill="#fff" font-size="19" font-weight="bold">Unternehmensleitung</text>

    <!-- Kaufmännische Leitung -->
    <rect x="135" y="204" width="310" height="126" rx="6" fill="#c8a4c8" stroke="#7a4a7a" stroke-width="1.5"/>
    <text x="290" y="228" text-anchor="middle" fill="#fff" font-size="15" font-weight="bold">Kaufmännische Leitung</text>
    <!-- Rechnungswesen -->
    <rect x="150" y="236" width="280" height="40" rx="4" fill="#b080b0" stroke="#7a4a7a" stroke-width="1"/>
    <text x="290" y="261" text-anchor="middle" fill="#fff" font-size="14">Rechnungswesen</text>
    <!-- Verwaltung -->
    <rect x="150" y="282" width="280" height="40" rx="4" fill="#b080b0" stroke="#7a4a7a" stroke-width="1"/>
    <text x="290" y="307" text-anchor="middle" fill="#fff" font-size="14">Verwaltung</text>

    <!-- Technische Leitung -->
    <rect x="495" y="204" width="340" height="126" rx="6" fill="#6a9ac4" stroke="#1a3a6e" stroke-width="1.5"/>
    <text x="665" y="274" text-anchor="middle" fill="#fff" font-size="16" font-weight="bold">Technische Leitung</text>

    <!-- Beschaffung -->
    <rect x="135" y="348" width="190" height="72" rx="6" fill="#8fa8c8" stroke="#1a3a6e" stroke-width="1.5"/>
    <text x="230" y="378" text-anchor="middle" fill="#fff" font-size="15" font-weight="bold">Beschaffung</text>
    <text x="230" y="399" text-anchor="middle" fill="#fff" font-size="13">(Einkauf)</text>

    <!-- Lager Werkstoffe (zweizeilig) -->
    <rect x="148" y="432" width="164" height="60" rx="4" fill="#fff" stroke="#8fa8c8" stroke-width="1.5"/>
    <text x="230" y="457" text-anchor="middle" fill="#1a3a6e" font-size="13">Lager</text>
    <text x="230" y="477" text-anchor="middle" fill="#1a3a6e" font-size="13">Werkstoffe</text>

    <!-- Fertigung -->
    <rect x="395" y="348" width="200" height="144" rx="6" fill="#8fa8c8" stroke="#1a3a6e" stroke-width="1.5"/>
    <text x="495" y="400" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold">Fertigung /</text>
    <text x="495" y="420" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold">Herstellung</text>
    <text x="495" y="440" text-anchor="middle" fill="#fff" font-size="12">(Produktion)</text>

    <!-- Absatz -->
    <rect x="655" y="348" width="190" height="72" rx="6" fill="#8fa8c8" stroke="#1a3a6e" stroke-width="1.5"/>
    <text x="750" y="378" text-anchor="middle" fill="#fff" font-size="15" font-weight="bold">Absatz</text>
    <text x="750" y="399" text-anchor="middle" fill="#fff" font-size="13">(Verkauf)</text>

    <!-- Lager Fertigerzeugnisse (zweizeilig) -->
    <rect x="658" y="432" width="194" height="60" rx="4" fill="#fff" stroke="#8fa8c8" stroke-width="1.5"/>
    <text x="755" y="457" text-anchor="middle" fill="#1a3a6e" font-size="13">Lager</text>
    <text x="755" y="477" text-anchor="middle" fill="#1a3a6e" font-size="13">Fertigerzeugnisse</text>

    <!-- Lieferant -->
    <rect x="0" y="362" width="100" height="42" rx="4" fill="#1a3a6e"/>
    <text x="50" y="388" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold">Lieferant</text>
    <line x1="100" y1="383" x2="132" y2="383" stroke="#1a3a6e" stroke-width="2.5"/>
    <polygon points="129,377 141,383 129,389" fill="#1a3a6e"/>

    <!-- Pfeil Beschaffung → Lager Werkstoffe -->
    <line x1="230" y1="420" x2="230" y2="430" stroke="#1a3a6e" stroke-width="2"/>
    <polygon points="225,430 230,439 235,430" fill="#1a3a6e"/>

    <!-- Pfeil Lager Werkstoffe → Fertigung -->
    <line x1="312" y1="462" x2="392" y2="462" stroke="#1a3a6e" stroke-width="2"/>
    <polygon points="389,456 401,462 389,468" fill="#1a3a6e"/>

    <!-- Pfeil Fertigung → Lager Fertigerzeugnisse -->
    <line x1="595" y1="462" x2="655" y2="462" stroke="#1a3a6e" stroke-width="2"/>
    <polygon points="652,456 664,462 652,468" fill="#1a3a6e"/>

    <!-- Pfeil Lager Fertigerzeugnisse → Absatz -->
    <line x1="755" y1="432" x2="755" y2="422" stroke="#1a3a6e" stroke-width="2"/>
    <polygon points="750,422 755,412 760,422" fill="#1a3a6e"/>

    <!-- Kunde -->
    <rect x="878" y="362" width="100" height="42" rx="4" fill="#1a3a6e"/>
    <text x="928" y="388" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold">Kunde</text>
    <line x1="860" y1="383" x2="876" y2="383" stroke="#1a3a6e" stroke-width="2.5"/>
    <polygon points="873,377 885,383 873,389" fill="#1a3a6e"/>

  </svg>`;

  const svgHTMLLeer = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 560" style="width:100%;max-width:980px;display:block;margin-bottom:24px;font-family:Arial,sans-serif;">

    <!-- Wandfläche -->
    <rect x="110" y="120" width="750" height="400" fill="#f5f5f5" stroke="none"/>

    <!-- Sägezahndach rechts -->
    <polygon points="500,120 500,30 590,120 590,30 680,120 680,30 770,120 770,30 860,120"
      fill="#e0e0e0" stroke="none"/>
    <line x1="110" y1="120" x2="500" y2="120" stroke="#999" stroke-width="2"/>
    <polyline points="500,120 500,30 590,120 590,30 680,120 680,30 770,120 770,30 860,120"
      fill="none" stroke="#999" stroke-width="2"/>
    <polyline points="110,120 110,520 860,520 860,120" fill="none" stroke="#999" stroke-width="2.5"/>

    <!-- Unternehmensleitung -->
    <rect x="135" y="132" width="700" height="56" rx="6" fill="#d8d8d8" stroke="#aaa" stroke-width="1.5"/>

    <!-- Kaufmännische Leitung -->
    <rect x="135" y="204" width="310" height="126" rx="6" fill="#e8e0e8" stroke="#bbb" stroke-width="1.5"/>
    <rect x="150" y="236" width="280" height="40" rx="4" fill="#ddd0dd" stroke="#bbb" stroke-width="1"/>
    <rect x="150" y="282" width="280" height="40" rx="4" fill="#ddd0dd" stroke="#bbb" stroke-width="1"/>

    <!-- Technische Leitung -->
    <rect x="495" y="204" width="340" height="126" rx="6" fill="#d8e0e8" stroke="#bbb" stroke-width="1.5"/>

    <!-- Beschaffung -->
    <rect x="135" y="348" width="190" height="72" rx="6" fill="#dce4ec" stroke="#aaa" stroke-width="1.5"/>

    <!-- Lager Werkstoffe (zweizeilig) -->
    <rect x="148" y="432" width="164" height="60" rx="4" fill="#f0f0f0" stroke="#bbb" stroke-width="1.5"/>

    <!-- Fertigung -->
    <rect x="395" y="348" width="200" height="144" rx="6" fill="#dce4ec" stroke="#aaa" stroke-width="1.5"/>

    <!-- Absatz -->
    <rect x="655" y="348" width="190" height="72" rx="6" fill="#dce4ec" stroke="#aaa" stroke-width="1.5"/>

    <!-- Lager Fertigerzeugnisse (zweizeilig) -->
    <rect x="658" y="432" width="194" height="60" rx="4" fill="#f0f0f0" stroke="#bbb" stroke-width="1.5"/>

    <!-- Lieferant -->
    <rect x="0" y="362" width="100" height="42" rx="4" fill="#c8c8c8" stroke="#aaa" stroke-width="1.5"/>
    <line x1="100" y1="383" x2="132" y2="383" stroke="#999" stroke-width="2.5"/>
    <polygon points="129,377 141,383 129,389" fill="#999"/>

    <!-- Pfeil Beschaffung → Lager Werkstoffe -->
    <line x1="230" y1="420" x2="230" y2="430" stroke="#999" stroke-width="2"/>
    <polygon points="225,430 230,439 235,430" fill="#999"/>

    <!-- Pfeil Lager Werkstoffe → Fertigung -->
    <line x1="312" y1="462" x2="392" y2="462" stroke="#999" stroke-width="2"/>
    <polygon points="389,456 401,462 389,468" fill="#999"/>

    <!-- Pfeil Fertigung → Lager Fertigerzeugnisse -->
    <line x1="595" y1="462" x2="655" y2="462" stroke="#999" stroke-width="2"/>
    <polygon points="652,456 664,462 652,468" fill="#999"/>

    <!-- Pfeil Lager Fertigerzeugnisse → Absatz -->
    <line x1="755" y1="432" x2="755" y2="422" stroke="#999" stroke-width="2"/>
    <polygon points="750,422 755,412 760,422" fill="#999"/>

    <!-- Kunde -->
    <rect x="878" y="362" width="100" height="42" rx="4" fill="#c8c8c8" stroke="#aaa" stroke-width="1.5"/>
    <line x1="860" y1="383" x2="876" y2="383" stroke="#999" stroke-width="2.5"/>
    <polygon points="873,377 885,383 873,389" fill="#999"/>

  </svg>`;

  // ── Aufgaben ──────────────────────────────────────────────────────────────
const svgContainer = document.getElementById('svgContainer');
if (svgContainer) svgContainer.innerHTML = svgHTML;

const svgContainerLeer = document.getElementById('svgContainerLeer');
if (svgContainerLeer) svgContainerLeer.innerHTML = svgHTMLLeer;

let aufgabenHTML = '<h2>Aufgaben</h2>';
  aufgabenHTML += '<p style="font-style: italic; color: #555; font-size: 0.95rem;">Lies die folgenden Aussagen. Entscheide jeweils, ob die Aussage <strong>wahr</strong> oder <strong>falsch</strong> ist, und begründe deine Entscheidung.</p>';
  aufgabenHTML += '<ol>';

  ausgewaehlte.forEach((item) => {
    aufgabenHTML += `<li style="margin-bottom: 1.2em;display:">${item.aussage}</li>`;
  });

  aufgabenHTML += '</ol>';

  // ── Lösungen ──────────────────────────────────────────────────────────────
  let loesungenHTML = '<h2>Lösung</h2>';

  ausgewaehlte.forEach((item, idx) => {
    const badgeColor = item.korrekt ? '#2a7a2a' : '#a00;';
    const badgeLabel = item.korrekt ? 'WAHR' : 'FALSCH';
    const badgeBg    = item.korrekt ? '#2a7a2a' : '#a00';
    const icon       = item.korrekt ? '✅' : '❌';

    loesungenHTML += `
    <div style="margin-top: 1.2em; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden;">
      <div style="background: #f5f5f5; padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #e0e0e0; display:flex; align-items:center; gap:10px;">
        <span>Aussage ${idx + 1}: <span style="color:#555; font-weight:normal;">${item.aussage.substring(0, 70)}${item.aussage.length > 70 ? '…' : ''}</span></span>
        <span style="background:${badgeBg}; color:#fff; border-radius:4px; padding:2px 10px; font-size:0.85rem; white-space:nowrap;">${icon} ${badgeLabel}</span>
      </div>
      <div style="padding: 10px 14px; font-family: courier; font-size: 0.9rem;">
        <strong>Bereich:</strong> ${item.bereich}<br>
        <strong>Begründung:</strong> ${item.begruendung}
      </div>
    </div>`;
  });

  container.innerHTML = aufgabenHTML + loesungenHTML;
}

// ============================================================================
// KI-ASSISTENT
// ============================================================================

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Wirtschaftsassistent für Schüler der Realschule (BwR). Du hilfst beim Verständnis der Funktionsbereiche eines Fertigungsunternehmens.

Aufgabe:
- Gib KEINE fertigen Lösungen (z. B. direkte Antworten "wahr" oder "falsch") vor.
- Führe die Schüler durch gezielte Fragen zur richtigen Einschätzung.
- Ziel: Lernförderung und Verständnis für die Zusammenhänge im Betrieb.

Die Funktionsbereiche eines Fertigungsunternehmens (von oben nach unten):

1. Unternehmensleitung
   - Strategische Führung, Zielsetzung, Koordination aller Bereiche
   - Unterteilt in: Kaufmännische Leitung (Rechnungswesen, Verwaltung) und Technische Leitung (Produktion)

2. Beschaffung (Einkauf)
   - Einkauf von Werkstoffen (Rohstoffe, Hilfsstoffe, Fremdbauteile, Betriebsstoffe) von Lieferanten
   - Ziel: richtiges Material, zur richtigen Zeit, in richtiger Menge, zu günstigem Preis

3. Lager Werkstoffe
   - Zwischenlager zwischen Beschaffung und Fertigung
   - Bewahrt Werkstoffe auf, bis sie von der Fertigung benötigt werden

4. Fertigung / Herstellung (Produktion)
   - Kernbereich: Werkstoffe werden zu Fertigerzeugnissen verarbeitet
   - Untersteht der technischen Leitung

5. Lager Fertigerzeugnisse
   - Zwischenlager zwischen Fertigung und Absatz
   - Fertigerzeugnisse warten hier auf den Verkauf

6. Absatz (Verkauf)
   - Verkauf der Fertigerzeugnisse an Kunden
   - Kundenberatung, Werbung, Preisgestaltung, Lieferung

Materialfluss: Lieferant → Beschaffung → Lager Werkstoffe → Fertigung → Lager Fertigerzeugnisse → Absatz → Kunde

Pädagogischer Ansatz:
- Stelle Rückfragen wie: "Was macht dieser Bereich genau?" oder "Wer steht über wem?"
- Beantworte deine Rückfragen nicht selbst.
- Erkläre bei Fehlern das Prinzip, nicht direkt die Lösung.
- Bestätige den Schüler erst, wenn er selbst eine begründete Antwort gegeben hat.

Tonalität:
- Freundlich, ermutigend, einfache Sprache
- Kurze Antworten – maximal 2 Sätze pro Nachricht
- Gelegentlich Emojis 🏭📦🛒💼

Was du NICHT tust:
- Nenne nie direkt "wahr" oder "falsch" für eine Aussage
- Gib keine Lösungen auf Anfragen wie "sag mir die Antwort"
- Erkläre, dass das Ziel das eigene Nachdenken und kritische Urteilen ist
`;

function kopiereKiPrompt() {
  navigator.clipboard.writeText(KI_ASSISTENT_PROMPT).then(() => {
    const btn = document.getElementById('kiPromptKopierenBtn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Kopiert!`;
    btn.classList.add('ki-prompt-btn--success');
    setTimeout(() => { btn.innerHTML = originalHTML; btn.classList.remove('ki-prompt-btn--success'); }, 2500);
  }).catch(() => alert('Kopieren nicht möglich. Bitte manuell aus dem Textfeld kopieren.'));
}

function toggleKiPromptVorschau() {
  const v = document.getElementById('kiPromptVorschau');
  const b = document.getElementById('kiPromptToggleBtn');
  const hidden = getComputedStyle(v).display === 'none';
  v.style.display = hidden ? 'block' : 'none';
  b.textContent = hidden ? 'Vorschau ausblenden ▲' : 'Prompt anzeigen ▼';
}

// ============================================================================
// INIT
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('kiPromptVorschau').textContent = KI_ASSISTENT_PROMPT;
  zeigeZufaelligeWahrFalsch();
});