// ============================================================================
// AUSSAGEN-DATENBANK – Abschreibungskreislauf
// ============================================================================

const aussagenDatenbank = [

  // ── GRUNDLAGEN SACHANLAGEN & WERTMINDERUNG ──
  {
    aussage: "Sachanlagen wie Maschinen, Fahrzeuge oder Gebäude unterliegen im Laufe der Zeit einer Wertminderung.",
    korrekt: true,
    bereich: "Sachanlagen & Wertminderung",
    begruendung: "Sachanlagen verlieren durch Nutzung, Verschleiß und Zeitablauf an Wert. Dieser Werteverzehr ist ein zentraler Grund, warum Abschreibungen in der Buchführung notwendig sind."
  },
  {
    aussage: "Sachanlagen behalten ihren Wert dauerhaft, weil sie aus beständigem Material bestehen.",
    korrekt: false,
    bereich: "Sachanlagen & Wertminderung",
    begruendung: "Sachanlagen verlieren durch Nutzung und Zeitablauf an Wert – unabhängig vom Material. Dieser Werteverzehr wird als Abschreibung erfasst und ist ein typisches Merkmal aller abnutzbaren Wirtschaftsgüter."
  },
  {
    aussage: "Grundstücke zählen zu den nicht abnutzbaren Sachanlagen und werden deshalb in der Regel nicht abgeschrieben.",
    korrekt: true,
    bereich: "Sachanlagen & Wertminderung",
    begruendung: "Grundstücke gelten als nicht abnutzbar, da sie keinem typischen Wertverzehr durch Nutzung unterliegen. Im Gegensatz dazu werden Gebäude, Maschinen und Fahrzeuge planmäßig abgeschrieben."
  },
  {
    aussage: "Wertminderung bei Sachanlagen entsteht ausschließlich durch mechanischen Verschleiß.",
    korrekt: false,
    bereich: "Sachanlagen & Wertminderung",
    begruendung: "Wertminderung entsteht nicht nur durch mechanischen Verschleiß, sondern auch durch wirtschaftliche Überalterung (technischer Fortschritt macht Anlagen veraltet) sowie durch Zeitablauf und Witterungseinflüsse."
  },

  // ── REFINANZIERUNG & KREISLAUF ──
  {
    aussage: "Die Abschreibung wird in den Verkaufspreis der Produkte eingerechnet, sodass das Unternehmen den Werteverzehr über den Umsatz zurückerhält.",
    korrekt: true,
    bereich: "Abschreibungskreislauf",
    begruendung: "Das ist das Kernprinzip des Abschreibungskreislaufs: Der Abschreibungsbetrag fließt als Kostenbestandteil in den Verkaufspreis ein. Beim Verkauf der Produkte erhält das Unternehmen diesen Betrag vom Kunden zurück – er steht dann als Kapital zur Verfügung."
  },
  {
    aussage: "Das durch Abschreibungen freigesetzte Kapital steht dem Unternehmen für die Ersatzbeschaffung neuer Anlagen zur Verfügung.",
    korrekt: true,
    bereich: "Abschreibungskreislauf",
    begruendung: "Das zurückgeflossene Kapital (Abschreibungsgegenwert) kann für die Reinvestition verwendet werden – z. B. für den Kauf einer neuen Maschine, wenn die alte das Ende ihrer Nutzungsdauer erreicht. So schließt sich der Kreislauf."
  },
  {
    aussage: "Der Abschreibungskreislauf beginnt damit, dass das Unternehmen eine Sachanlage kauft und deren Wert über die Nutzungsdauer verteilt.",
    korrekt: true,
    bereich: "Abschreibungskreislauf",
    begruendung: "Am Anfang des Kreislaufs steht die Investition in eine Sachanlage. Dann wird der Wert planmäßig abgeschrieben, in den Verkaufspreisen weitergegeben, über den Umsatz zurückverdient und schließlich für Ersatzinvestitionen eingesetzt."
  },
  {
    aussage: "Abschreibungen führen unmittelbar zu einem Geldabfluss aus dem Unternehmen.",
    korrekt: false,
    bereich: "Abschreibungskreislauf",
    begruendung: "Abschreibungen sind ein nicht zahlungswirksamer Aufwand: Es fließt beim Buchen kein Geld ab. Der Geldabfluss fand bereits beim Kauf der Anlage statt. Die Abschreibung erfasst lediglich den Werteverzehr buchhalterisch."
  },
  {
    aussage: "Wenn ein Unternehmen die Abschreibungsbeträge nicht in den Verkaufspreisen einkalkuliert, fehlt das Kapital für spätere Ersatzinvestitionen.",
    korrekt: true,
    bereich: "Abschreibungskreislauf",
    begruendung: "Genau das macht der Abschreibungskreislauf deutlich: Werden Abschreibungen nicht im Preis berücksichtigt, fließt kein Kapital zurück. Das Unternehmen kann dann die Anlage am Ende der Nutzungsdauer nicht aus eigenen Mitteln ersetzen."
  },
  {
    aussage: "Abschreibungen sind nur für Aktiengesellschaften relevant, Einzelunternehmen müssen keine Abschreibungen vornehmen.",
    korrekt: false,
    bereich: "Abschreibung",
    begruendung: "Abschreibungen sind für alle buchführungspflichtigen Unternehmen – unabhängig von der Rechtsform – verpflichtend. Auch Einzelunternehmen und kleine GmbHs müssen Sachanlagen planmäßig abschreiben."
  },

  // ── ANWENDUNG & VERKNÜPFUNG ──
  {
    aussage: "Durch den Abschreibungskreislauf kann ein Unternehmen langfristig seine Produktionskapazität erhalten, ohne neues Fremdkapital aufnehmen zu müssen.",
    korrekt: true,
    bereich: "Abschreibungskreislauf",
    begruendung: "Der Kreislauf sorgt dafür, dass das Unternehmen über den Umsatz kontinuierlich Kapital für Ersatzinvestitionen ansammelt. Wenn der Betrag ausreicht, kann die Anlage aus eigenen Mitteln ersetzt werden – Fremdfinanzierung ist dann nicht zwingend notwendig."
  },
  {
    aussage: "Wenn eine Maschine nach Ende der Nutzungsdauer vollständig abgeschrieben ist, muss das Unternehmen für die Ersatzbeschaffung immer einen Bankkredit aufnehmen.",
    korrekt: false,
    bereich: "Abschreibungskreislauf",
    begruendung: "Genau das Gegenteil ist das Ziel des Abschreibungskreislaufs: Die über den Preis zurückgeflossenen Abschreibungsbeträge stehen als Eigenkapital für die Ersatzbeschaffung bereit. Ein Kredit ist daher nicht zwingend notwendig."
  },

// ── SELBSTFINANZIERUNG & SUBSTANZERHALTUNG ──
{
  aussage: "Abschreibungen ermöglichen eine verdeckte Selbstfinanzierung, weil sie zwar den Gewinn mindern, aber keinen Geldabfluss verursachen.",
  korrekt: true,
  bereich: "Selbstfinanzierung & Substanzerhaltung",
  begruendung: "Abschreibungen sind ein nicht zahlungswirksamer Aufwand. Der Gewinn sinkt, aber das Geld bleibt im Unternehmen (Kapitalfreisetzung). Dies wird als verdeckte Selbstfinanzierung bezeichnet."
},
{
  aussage: "Durch den Abschreibungskreislauf wird die Substanz des Unternehmens (Produktionskapazität) langfristig erhalten, ohne dass zusätzliches Eigen- oder Fremdkapital benötigt wird.",
  korrekt: true,
  bereich: "Selbstfinanzierung & Substanzerhaltung",
  begruendung: "Die über die Verkaufspreise zurückfließenden Abschreibungsbeträge stehen für die Ersatzbeschaffung zur Verfügung. So bleibt die betriebliche Substanz erhalten – dies ist ein zentrales Ziel des Abschreibungskreislaufs."
},
{
  aussage: "Bei steigenden Wiederbeschaffungspreisen (Inflation) reicht die normale Abschreibung auf Basis der Anschaffungskosten aus, um die volle Substanz des Unternehmens zu erhalten.",
  korrekt: false,
  bereich: "Selbstfinanzierung & Substanzerhaltung",
  begruendung: "Bei Inflation liegen die Wiederbeschaffungskosten höher als die historischen Anschaffungskosten. Die auf Basis der alten Kosten berechneten Abschreibungen reichen dann nicht aus – es entstehen Scheingewinne und eine Substanzgefährdung."
},
// ── Steuer & LIQUIDITÄT ──
{
  aussage: "Abschreibungen führen zu einer Steuerersparnis, weil sie den steuerpflichtigen Gewinn mindern.",
  korrekt: true,
  bereich: "Steuerersparnis & Liquidität",
  begruendung: "Als Betriebsausgaben reduzieren Abschreibungen den zu versteuernden Gewinn. Dadurch sinkt die Steuerlast (z. B. Körperschaftsteuer oder Einkommensteuer) – dies ist ein wichtiger Liquiditätsvorteil."
},
{
  aussage: "Abschreibungen verbessern die Liquidität unmittelbar, weil das Finanzamt dem Unternehmen Geld zurückzahlt.",
  korrekt: false,
  bereich: "Steuerersparnis & Liquidität",
  begruendung: "Abschreibungen verursachen keinen direkten Geldzufluss vom Finanzamt. Der Liquiditätsvorteil entsteht indirekt: Der Gewinn und damit die Steuerzahlung sinken, sodass weniger Geld abfließt."
},
{
  aussage: "Abschreibungen haben keinen Einfluss auf die Liquidität des Unternehmens, da sie nur buchhalterische Größen sind.",
  korrekt: false,
  bereich: "Steuerersparnis & Liquidität",
  begruendung: "Obwohl Abschreibungen keinen unmittelbaren Zahlungsmittelabfluss darstellen, verbessern sie die Liquidität indirekt über die Gewinnminderung und die damit verbundene Steuerersparnis sowie durch die Kapitalfreisetzung."
}
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
// SVG ABSCHREIBUNGSKREISLAUF – AUSGEFÜLLT
// ============================================================================

const svgAusgefuellt = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 680" style="width:100%;max-width:780px;display:block;margin-bottom:16px;font-family:Arial,sans-serif;">

  <!-- Titel -->
  <text x="410" y="30" text-anchor="middle" font-size="22" font-weight="bold" fill="#1a3a6e">Abschreibungskreislauf</text>

  <!-- Rückfluss-Pfeil links (gestrichelt) -->
  <path d="M145 580 L60 580 L60 95 L155 95" fill="none" stroke="#888" stroke-width="1.8" stroke-dasharray="7 4" marker-end="url(#arrowGray)"/>
  <text x="25" y="340" text-anchor="middle" font-size="13" fill="#555" transform="rotate(-90,25,340)">Reinvestition / Ersatzbeschaffung</text>

  <defs>
    <marker id="arrowGray" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="#888" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
    <marker id="arrowBlue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="#4a6fa5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
  </defs>

  <!-- 1. Sachanlagen -->
  <rect x="230" y="62" width="360" height="66" rx="8" fill="#4a6fa5" stroke="#1a3a6e" stroke-width="1.5"/>
  <text x="410" y="90" text-anchor="middle" fill="#fff" font-size="17" font-weight="bold">Sachanlagen</text>
  <text x="410" y="114" text-anchor="middle" fill="#dde6f5" font-size="13">z. B. Maschinen, Gebäude, Fahrzeuge</text>

  <!-- Pfeil 1→2 -->
  <line x1="410" y1="128" x2="410" y2="178" stroke="#4a6fa5" stroke-width="1.5" marker-end="url(#arrowBlue)"/>
  <text x="420" y="158" font-size="12" fill="#555">Nutzung &amp; Zeit</text>

  <!-- 2. Wertminderung -->
  <rect x="230" y="178" width="360" height="66" rx="8" fill="#c0392b" stroke="#922b21" stroke-width="1.5"/>
  <text x="410" y="205" text-anchor="middle" fill="#fff" font-size="17" font-weight="bold">Wertminderung</text>
  <text x="420" y="228" text-anchor="middle" fill="#f9d5d3" font-size="13">Werteverzehr durch Nutzung</text>

  <!-- Pfeil 2→3 -->
  <line x1="410" y1="244" x2="410" y2="294" stroke="#4a6fa5" stroke-width="1.5" marker-end="url(#arrowBlue)"/>
  <text x="420" y="273" font-size="12" fill="#555">wird erfasst als</text>

  <!-- 3. Abschreibung -->
  <rect x="230" y="294" width="360" height="70" rx="8" fill="#e67e22" stroke="#ca6f1e" stroke-width="1.5"/>
  <text x="410" y="323" text-anchor="middle" fill="#fff" font-size="17" font-weight="bold">Abschreibung (AfA)</text>
  <text x="420" y="349" text-anchor="middle" fill="#fde9d4" font-size="13">Aufwand in der GuV · mindert Gewinn</text>

  <!-- Pfeil 3→4 -->
  <line x1="410" y1="364" x2="410" y2="414" stroke="#4a6fa5" stroke-width="1.5" marker-end="url(#arrowBlue)"/>
  <text x="420" y="393" font-size="12" fill="#555">eingerechnet in</text>

  <!-- 4. Verkaufserlös -->
  <rect x="230" y="414" width="360" height="66" rx="8" fill="#1a7a5a" stroke="#145c43" stroke-width="1.5"/>
  <text x="410" y="441" text-anchor="middle" fill="#fff" font-size="17" font-weight="bold">Verkaufserlös / Umsatz</text>
  <text x="410" y="465" text-anchor="middle" fill="#b8f0d8" font-size="13">Abschreibung im Verkaufspreis enthalten</text>

  <!-- Pfeil 4→5 -->
  <line x1="410" y1="480" x2="410" y2="530" stroke="#4a6fa5" stroke-width="1.5" marker-end="url(#arrowBlue)"/>
  <text x="420" y="509" font-size="12" fill="#555">fließt zurück als</text>

  <!-- 5. Freigesetztes Kapital -->
  <rect x="230" y="530" width="360" height="66" rx="8" fill="#5a7a2a" stroke="#3d5a1e" stroke-width="1.5"/>
  <text x="410" y="558" text-anchor="middle" fill="#fff" font-size="17" font-weight="bold">Freigesetztes Kapital</text>
  <text x="410" y="582" text-anchor="middle" fill="#d8f0b0" font-size="13">Abschreibungsgegenwert · steht zur Verfügung</text>

</svg>`;

// ============================================================================
// SVG ABSCHREIBUNGSKREISLAUF – LEER (ohne Beschriftungen)
// ============================================================================

const svgLeer = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 780 680" style="width:100%;max-width:780px;display:block;margin-bottom:24px;font-family:Arial,sans-serif;">

  <!-- Titel -->
  <text x="410" y="30" text-anchor="middle" font-size="22" font-weight="bold" fill="#1a3a6e">Abschreibungskreislauf</text>

  <!-- Rückfluss-Pfeil links (gestrichelt) -->
  <path d="M145 580 L60 580 L60 95 L155 95" fill="none" stroke="#bbb" stroke-width="1.8" stroke-dasharray="7 4" marker-end="url(#arrowGrayL)"/>

  <defs>
    <marker id="arrowGrayL" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="#bbb" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
    <marker id="arrowBlueL" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M2 1L8 5L2 9" fill="none" stroke="#aac" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
  </defs>

  <!-- 1. Sachanlagen – leer -->
  <rect x="230" y="62" width="360" height="66" rx="8" fill="#d4dcee" stroke="#1a3a6e" stroke-width="1.5"/>

  <!-- Pfeil 1→2 -->
  <line x1="410" y1="128" x2="410" y2="178" stroke="#aac" stroke-width="1.5" marker-end="url(#arrowBlueL)"/>

  <!-- 2. Wertminderung – leer -->
  <rect x="230" y="178" width="360" height="66" rx="8" fill="#f5c5c0" stroke="#922b21" stroke-width="1.5"/>

  <!-- Pfeil 2→3 -->
  <line x1="410" y1="244" x2="410" y2="294" stroke="#aac" stroke-width="1.5" marker-end="url(#arrowBlueL)"/>

  <!-- 3. Abschreibung – leer -->
  <rect x="230" y="294" width="360" height="70" rx="8" fill="#fad5b0" stroke="#ca6f1e" stroke-width="1.5"/>

  <!-- Pfeil 3→4 -->
  <line x1="410" y1="364" x2="410" y2="414" stroke="#aac" stroke-width="1.5" marker-end="url(#arrowBlueL)"/>

  <!-- 4. Verkaufserlös – leer -->
  <rect x="230" y="414" width="360" height="66" rx="8" fill="#a8dbc8" stroke="#145c43" stroke-width="1.5"/>

  <!-- Pfeil 4→5 -->
  <line x1="410" y1="480" x2="410" y2="530" stroke="#aac" stroke-width="1.5" marker-end="url(#arrowBlueL)"/>

  <!-- 5. Freigesetztes Kapital – leer -->
  <rect x="230" y="530" width="360" height="66" rx="8" fill="#c8e0a0" stroke="#3d5a1e" stroke-width="1.5"/>

</svg>`;

// ============================================================================
// HAUPTFUNKTION
// ============================================================================

function zeigeZufaelligeWahrFalsch() {
  const container = document.getElementById('Container');
  if (!container) return;

  const anzahl = parseInt(document.getElementById('anzahlAussagen').value) || 6;

  // Aufgaben mischen und auswählen
  const ausgewaehlte = shuffle(aussagenDatenbank).slice(0, anzahl);
  letzteGenerierteAussagen = ausgewaehlte;   // ← wichtig für den KI-Prompt

  // SVG einfügen (ausgefüllt + leer)
  const svgContainer = document.getElementById('svgContainer');
  if (svgContainer) svgContainer.innerHTML = svgAusgefuellt;

  const svgContainerLeer = document.getElementById('svgContainerLeer');
  if (svgContainerLeer) svgContainerLeer.innerHTML = svgLeer;

  // ── Aufgaben ──────────────────────────────────────────────────────────────
  let aufgabenHTML = '<h2>Aufgaben</h2>';
  aufgabenHTML += '<p style="font-style: italic; color: #555; font-size: 0.95rem;">Lies die folgenden Aussagen. Entscheide jeweils, ob die Aussage <strong>wahr</strong> oder <strong>falsch</strong> ist. Begründe deine Entscheidung.</p>';
  aufgabenHTML += '<ol>';

  ausgewaehlte.forEach((item, idx) => {
    aufgabenHTML += `<li style="margin-bottom: 1.4em; font-size: 16px; line-height: 1.5;">${item.aussage}</li>`;
  });

  aufgabenHTML += '</ol>';

  // ── Lösungen ──────────────────────────────────────────────────────────────
  let loesungenHTML = '<h2>Lösungen</h2>';

  ausgewaehlte.forEach((item, idx) => {
    const badgeLabel = item.korrekt ? 'WAHR' : 'FALSCH';
    const badgeBg    = item.korrekt ? '#2a7a2a' : '#a00';
    const icon       = item.korrekt ? '✅' : '❌';

    loesungenHTML += `
    <div style="margin-top: 1.4em; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background: #f8f9fa; padding: 10px 14px; font-weight: bold; border-bottom: 1px solid #e0e0e0; display:flex; align-items:center; gap:12px;">
        <span>Aussage ${idx + 1}</span>
        <span style="background:${badgeBg}; color:#fff; border-radius:5px; padding:3px 11px; font-size:0.9rem;">${icon} ${badgeLabel}</span>
      </div>
      <div style="padding: 12px 16px; font-size: 15px; line-height: 1.5;">
        <strong>Begründung:</strong><br>${item.begruendung}
      </div>
    </div>`;
  });

  container.innerHTML = aufgabenHTML + loesungenHTML;

  // KI-Prompt-Vorschau aktualisieren (falls vorhanden)
  const vorschau = document.getElementById('kiPromptVorschau');
  if (vorschau) {
    vorschau.textContent = erstelleKiPromptTextAbschreibung();
  }
}

function kopiereKiPromptAbschreibung() {
  const text = erstelleKiPromptTextAbschreibung();
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('kiPromptKopierenBtn');
    if (btn) {
      const original = btn.textContent;
      btn.textContent = '✅ Kopiert!';
      setTimeout(() => { btn.textContent = original; }, 2500);
    }
  }).catch(() => alert('Kopieren nicht möglich.'));
}

function toggleKiPromptVorschau() {
  const v = document.getElementById('kiPromptVorschau');
  const b = document.getElementById('kiPromptToggleBtn');
  if (!v || !b) return;

  const hidden = getComputedStyle(v).display === 'none';
  v.style.display = hidden ? 'block' : 'none';
  b.textContent = hidden ? 'Vorschau ausblenden ▲' : 'Prompt anzeigen ▼';
}

// ============================================================================
// KI-ASSISTENT
// ============================================================================
let letzteGenerierteAussagen = [];

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Wirtschaftsassistent für Schüler der Realschule (BwR). Du hilfst beim Verständnis des Abschreibungskreislaufs und der Buchführung von Sachanlagen.

Aufgabe:
- Gib KEINE fertigen Lösungen (z. B. direkte Antworten "wahr" oder "falsch") vor.
- Führe die Schüler durch gezielte Fragen zur richtigen Einschätzung.
- Ziel: Lernförderung und Verständnis für die Zusammenhänge bei Abschreibungen.

Der Abschreibungskreislauf – Grundwissen:

1. Sachanlagen und Wertminderung
   - Sachanlagen (Maschinen, Gebäude, Fahrzeuge) verlieren durch Nutzung und Zeit an Wert
   - Dieser Werteverzehr heißt Wertminderung
   - Grundstücke sind nicht abnutzbar → keine Abschreibung

2. Abschreibung (AfA = Absetzung für Abnutzung)
   - Ist NICHT zahlungswirksam (kein Geldabfluss beim Buchen!)

3. Kreislauf der Refinanzierung
   - Abschreibungsbetrag wird in den Verkaufspreis einkalkuliert
   - Beim Verkauf der Produkte fließt das Kapital zurück
   - Das freigesetzte Kapital steht für Ersatzinvestitionen bereit
   - Ziel: Unternehmen kann Anlage aus eigenen Mitteln ersetzen

Pädagogischer Ansatz:
- Stelle Rückfragen wie: "Was passiert mit dem Buchwert nach einer Abschreibung?" oder "Woher bekommt das Unternehmen das Geld für die Ersatzbeschaffung?"
- Beantworte deine Rückfragen nicht selbst.
- Erkläre bei Fehlern das Prinzip, nicht direkt die Lösung.
- Bestätige den Schüler erst, wenn er selbst eine begründete Antwort gegeben hat.

Begrüße den Schüler freundlich und gib ihm eine Aufgabe aus der folgenden Aufgabenliste vor.
Arbeitsauftrag: „Lies den Sachverhalt und entscheide: Welchen Führungsstil wendet die Führungskraft an – autoritativ oder kooperativ? Begründe deine Antwort."

Aufgabenliste:

###AUFGABEN und LOESUNGEN###

Tonalität:
- Freundlich, ermutigend, einfache Sprache
- Kurze Antworten – maximal 2–3 Sätze pro Nachricht
- Gelegentlich Emojis 📉🏭💰🔄

Was du NICHT tust:
- Nenne nie direkt "wahr" oder "falsch" für eine Aussage
- Gib keine Lösungen auf Anfragen wie "sag mir die Antwort"
- Erkläre, dass das Ziel das eigene Nachdenken und kritische Urteilen ist

Am Ende einer guten Begründung durch den Schüler:
- Bewerte seine Begründung korrekt, aber wohlwollend.
- Ergänze die Musterlösung, falls notwendig.
- Frage immer: „Möchtest du noch eine weitere Aufgabe üben?"

Du wartest stets auf die Eingabe des Schülers und gibst nichts vor.`;

function erstelleKiPromptTextAbschreibung() {
  if (letzteGenerierteAussagen.length === 0) {
    return KI_ASSISTENT_PROMPT.replace("###AUFGABEN und LOESUNGEN###", "(Noch keine Aufgaben generiert.)");
  }

  const aufgabenText = letzteGenerierteAussagen.map((item, idx) => {
    const antwort = item.korrekt ? "WAHR" : "FALSCH";
    return `Aufgabe ${idx+1}:\n${item.aussage}\n\nMusterlösung ${idx+1}:\nAntwort: ${antwort}\nBegründung: ${item.begruendung}`;
  }).join("\n\n---\n\n");

  return KI_ASSISTENT_PROMPT.replace("###AUFGABEN und LOESUNGEN###", aufgabenText);
}

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
  // Prompt-Vorschau initial füllen
  const vorschau = document.getElementById('kiPromptVorschau');
  if (vorschau) vorschau.textContent = erstelleKiPromptTextAbschreibung();

  // Erste Aufgaben generieren
  zeigeZufaelligeWahrFalsch();
});