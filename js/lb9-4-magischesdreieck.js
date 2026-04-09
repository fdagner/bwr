// ============================================================================
// AUSSAGEN-DATENBANK – Magisches Dreieck der Geldanlage & Nachhaltige Geldanlage
// ============================================================================

const aussagenDatenbank = [

  // ── MAGISCHES DREIECK – GRUNDLAGEN ──
  {
    aussage: "Das magische Dreieck der Geldanlage besteht aus den drei Zielen Rentabilität, Sicherheit und Liquidität.",
    korrekt: true,
    bereich: "Magisches Dreieck",
    begruendung: "Das magische Dreieck beschreibt die drei zentralen Ziele jeder Geldanlage: Rentabilität (Rendite/Ertrag), Sicherheit (Schutz des eingesetzten Kapitals) und Liquidität (Verfügbarkeit des Geldes). Diese drei Ziele stehen in einem Spannungsverhältnis zueinander."
  },
  {
    aussage: "Das magische Dreieck heißt 'magisch', weil man alle drei Ziele gleichzeitig in vollem Umfang erreichen kann.",
    korrekt: false,
    bereich: "Magisches Dreieck",
    begruendung: "Es heißt 'magisch', weil es eben NICHT möglich ist, alle drei Ziele gleichzeitig maximal zu erreichen. Zwischen den Zielen bestehen Zielkonflikte: Eine hohe Rendite geht meist mit höherem Risiko oder geringerer Liquidität einher."
  },
  {
    aussage: "Rentabilität bezeichnet den Ertrag oder die Rendite einer Geldanlage.",
    korrekt: true,
    bereich: "Rentabilität",
    begruendung: "Rentabilität beschreibt, wie viel Gewinn oder Ertrag (z. B. Zinsen, Dividenden, Kursgewinne) eine Geldanlage im Verhältnis zum eingesetzten Kapital abwirft. Je höher die Rentabilität, desto mehr Ertrag erwirtschaftet die Anlage."
  },
  {
    aussage: "Liquidität bei der Geldanlage bedeutet, dass das angelegte Geld jederzeit schnell und ohne große Verluste verfügbar ist.",
    korrekt: true,
    bereich: "Liquidität",
    begruendung: "Liquidität (auch: Verfügbarkeit) beschreibt, wie schnell und einfach der Anleger sein investiertes Geld wieder zurückbekommt. Bargeld oder Girokonten sind hoch liquide, eine 10-jährige Festgeldanlage dagegen wenig liquide."
  },
  {
    aussage: "Sicherheit einer Geldanlage bedeutet, dass der Anleger auf eine hohe Rendite verzichtet.",
    korrekt: false,
    bereich: "Sicherheit",
    begruendung: "Sicherheit bedeutet das Risiko des Kapitalverlusts ist gering – also dass das eingesetzte Geld nicht verloren geht. Der Verzicht auf hohe Rendite ist eine mögliche Konsequenz, aber nicht die Definition von Sicherheit."
  },
  {
    aussage: "Sicherheit bei der Geldanlage bezeichnet den Schutz des eingesetzten Kapitals vor Verlust.",
    korrekt: true,
    bereich: "Sicherheit",
    begruendung: "Sicherheit meint, wie hoch die Wahrscheinlichkeit ist, das investierte Kapital zu behalten. Eine sichere Anlage hat ein geringes Verlustrisiko. Bundesanleihen gelten z. B. als sehr sicher, Aktien als deutlich riskanter."
  },

  // ── ZIELKONFLIKTE ──
  {
    aussage: "Eine Geldanlage, die eine sehr hohe Rendite verspricht, ist in der Regel auch sehr sicher.",
    korrekt: false,
    bereich: "Zielkonflikte",
    begruendung: "Im Gegenteil: Hohe Renditechancen gehen fast immer mit höherem Risiko (geringerer Sicherheit) einher. Wer mehr Rendite erzielen möchte, muss in der Regel größere Verlustrisiken in Kauf nehmen – das ist ein typischer Zielkonflikt im magischen Dreieck."
  },
  {
    aussage: "Festgeld mit langer Laufzeit bietet meist höhere Zinsen als ein Tagesgeldkonto, ist aber weniger liquide.",
    korrekt: true,
    bereich: "Zielkonflikte",
    begruendung: "Festgeld bindet das Geld für eine vereinbarte Laufzeit – man kann es nicht vorzeitig abheben (geringe Liquidität). Als Ausgleich dafür bieten Banken höhere Zinsen (höhere Rentabilität). Das zeigt den typischen Zielkonflikt zwischen Liquidität und Rentabilität."
  },
  {
    aussage: "Ein Tagesgeldkonto ist besonders liquide, weil man täglich auf das Geld zugreifen kann.",
    korrekt: true,
    bereich: "Liquidität",
    begruendung: "Ein Tagesgeldkonto zeichnet sich durch hohe Liquidität aus: Das Geld kann täglich abgerufen werden. Dafür ist die Verzinsung meist geringer als bei länger gebundenen Anlagen – klassischer Zielkonflikt zwischen Liquidität und Rentabilität."
  },
  {
    aussage: "Aktien gelten als sehr sichere Geldanlage, weil Unternehmen immer Gewinne machen.",
    korrekt: false,
    bereich: "Sicherheit",
    begruendung: "Aktien gelten als vergleichsweise riskant: Aktienkurse können stark schwanken, Unternehmen können Verluste machen oder sogar insolvent werden. Aktionäre können ihr eingesetztes Kapital teilweise oder vollständig verlieren."
  },
  {
    aussage: "Eine Anlage kann nicht gleichzeitig höchste Rentabilität, höchste Sicherheit und höchste Liquidität bieten.",
    korrekt: true,
    bereich: "Zielkonflikte",
    begruendung: "Das ist das Kernprinzip des magischen Dreiecks: Die drei Ziele stehen in einem Spannungsverhältnis (Zielkonflikt). Wer z. B. maximale Sicherheit will, muss auf Rendite oder Liquidität verzichten. Ein optimales Gleichgewicht aller drei Ziele ist praktisch nicht möglich."
  },
  {
    aussage: "Staatsanleihen (z. B. von Deutschland) gelten als besonders sicher, bieten dafür aber oft nur geringe Zinsen.",
    korrekt: true,
    bereich: "Zielkonflikte",
    begruendung: "Staatsanleihen sicherer Länder wie Deutschland haben ein sehr geringes Ausfallrisiko (hohe Sicherheit). Im Gegenzug sind die Zinsen (Rentabilität) niedrig – typischer Zielkonflikt. Außerdem ist die Liquidität je nach Laufzeit eingeschränkt."
  },

  // ── NACHHALTIGE GELDANLAGE – GRUNDLAGEN ──
  {
    aussage: "Nachhaltige Geldanlage bedeutet, bei der Anlageentscheidung neben wirtschaftlichen auch ökologische, soziale und ethische Kriterien zu berücksichtigen.",
    korrekt: true,
    bereich: "Nachhaltige Geldanlage",
    begruendung: "Bei nachhaltiger Geldanlage (auch: ESG-Anlage) fließen neben Rendite, Sicherheit und Liquidität zusätzliche Kriterien ein: Ökologische Aspekte (Umwelt), soziale Aspekte (Gesellschaft, Arbeitnehmer) und ethische/Governance-Aspekte. Das Ziel ist ein verantwortungsvoller Umgang mit Kapital."
  },
  {
    aussage: "Ein Unternehmen, das hohe CO₂-Emissionen verursacht, würde bei ökologischen Kriterien der nachhaltigen Geldanlage negativ bewertet.",
    korrekt: true,
    bereich: "Ökologische Kriterien",
    begruendung: "Ökologische Kriterien bewerten z. B. CO₂-Ausstoß, Ressourcenverbrauch, Umweltverschmutzung und Klimastrategien. Hohe CO₂-Emissionen sind ein ökologisches Negativmerkmal – solche Unternehmen werden in nachhaltigen Portfolios oft ausgeschlossen."
  },
  {
    aussage: "Soziale Kriterien bei der nachhaltigen Geldanlage umfassen z. B. faire Arbeitsbedingungen, Gleichberechtigung und die Einhaltung von Menschenrechten.",
    korrekt: true,
    bereich: "Soziale Kriterien",
    begruendung: "Soziale Kriterien (S in ESG) betrachten, wie ein Unternehmen mit seinen Mitarbeitern, Zulieferern und der Gesellschaft umgeht: faire Löhne, sichere Arbeitsbedingungen, keine Kinderarbeit, Gleichberechtigung und gesellschaftliches Engagement."
  },
  {
    aussage: "Ethische Kriterien bei der Geldanlage beziehen sich nur auf die Rendite des Unternehmens.",
    korrekt: false,
    bereich: "Ethische Kriterien",
    begruendung: "Ethische Kriterien betreffen die Werte und Prinzipien, nach denen ein Unternehmen handelt: z. B. keine Produktion von Waffen oder Tabak, keine Korruption, transparente Unternehmensführung. Mit der Rendite haben sie direkt nichts zu tun."
  },
  {
    aussage: "Ein Rüstungsunternehmen, das Waffen herstellt, würde von Anlegern mit ethischen Kriterien in der Regel abgelehnt.",
    korrekt: true,
    bereich: "Ethische Kriterien",
    begruendung: "Viele nachhaltige Anlagekonzepte schließen Unternehmen aus bestimmten Branchen (Rüstung, Tabak, Glücksspiel) explizit aus – sogenannte Ausschlusskriterien. Rüstungsunternehmen gelten in der Regel als ethisch nicht vereinbar mit Nachhaltigkeitsprinzipien."
  },
  {
    aussage: "Bei nachhaltiger Geldanlage muss man zwangsläufig auf Rendite verzichten.",
    korrekt: false,
    bereich: "Nachhaltige Geldanlage",
    begruendung: "Studien zeigen, dass nachhaltige Anlagen langfristig ähnliche oder sogar bessere Renditen erzielen können wie konventionelle. Unternehmen mit guter ESG-Bewertung gelten als zukunftsfähiger und haben geringere Risiken (z. B. Umwelthaftung, Reputationsschäden)."
  },
  {
    aussage: "Die Einbeziehung ökologischer Kriterien bei der Geldanlage bedeutet z. B., bevorzugt in Unternehmen zu investieren, die erneuerbare Energien nutzen oder fördern.",
    korrekt: true,
    bereich: "Ökologische Kriterien",
    begruendung: "Ökologische Investitionskriterien umfassen die Bevorzugung von Unternehmen, die aktiv zum Klimaschutz beitragen: durch Nutzung erneuerbarer Energien, Reduktion von Emissionen, nachhaltige Lieferketten oder Entwicklung umweltfreundlicher Produkte."
  },
  {
    aussage: "Nachhaltige Geldanlage ist nur für sehr wohlhabende Anleger relevant und nicht für Schüler oder Kleinanleger.",
    korrekt: false,
    bereich: "Nachhaltige Geldanlage",
    begruendung: "Nachhaltige Geldanlage ist für jeden Anleger zugänglich – auch für Kleinanleger. Nachhaltige ETFs, Sparkonten bei nachhaltigen Banken oder Spareinlagen bei Genossenschaftsbanken mit Nachhaltigkeitsfokus ermöglichen auch mit kleinen Beträgen nachhaltig zu investieren."
  },

  // ── ERWEITERTE ZIELKONFLIKTE ──
  {
    aussage: "Ein Sparvertrag bei einer ethisch-nachhaltigen Bank bietet automatisch die höchste Rendite aller Anlageformen.",
    korrekt: false,
    bereich: "Nachhaltige Geldanlage",
    begruendung: "Nachhaltigkeit sagt nichts darüber aus, ob eine Anlage die höchste Rendite bietet. Auch bei nachhaltigen Anlagen gilt das magische Dreieck: Sicherere Sparverträge bieten meist geringere Zinsen als risikoreichere Aktienanlagen."
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
// SVG MAGISCHES DREIECK – AUSGEFÜLLT
// ============================================================================

const svgAusgefuellt = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 620" style="width:100%;max-width:980px;display:block;margin-bottom:16px;font-family:Arial,sans-serif;">

  <!-- Titel -->
  <text x="490" y="30" text-anchor="middle" font-size="30" font-weight="bold" fill="#1a3a6e">Magisches Dreieck der Geldanlage</text>
 
  <!-- Hauptdreieck -->
  <polygon points="490,70 120,560 860,560" fill="#f5f5f5" stroke="#1a3a6e" stroke-width="2.5"/>


  <!-- ECKE OBEN: RENTABILITÄT -->
  <rect x="340" y="65" width="300" height="66" rx="6" fill="#4a6fa5" stroke="#1a3a6e" stroke-width="1.5"/>
  <text x="490" y="105" text-anchor="middle" fill="#fff" font-size="24" font-weight="bold">Rentabilität</text>

  <!-- ECKE LINKS UNTEN: SICHERHEIT -->
  <rect x="50" y="520" width="300" height="66" rx="6" fill="#5a8a5a" stroke="#2a5a2a" stroke-width="1.5"/>
  <text x="200" y="560" text-anchor="middle" fill="#fff" font-size="24" font-weight="bold">Sicherheit</text>

  <!-- ECKE RECHTS UNTEN: LIQUIDITÄT -->
  <rect x="640" y="520" width="300" height="66" rx="6" fill="#a06020" stroke="#7a4a10" stroke-width="1.5"/>
  <text x="790" y="560" text-anchor="middle" fill="#fff" font-size="24" font-weight="bold">Liquidität</text>

  <!-- Beispiele im Dreieck -->
  <text x="490" y="290" text-anchor="middle" fill="#333" font-size="20" font-weight="bold">Beispiele</text>
  <text x="490" y="340" text-anchor="middle" fill="#555" font-size="22">📈 Aktien → hoch rentabel, riskant</text>
  <text x="490" y="390" text-anchor="middle" fill="#555" font-size="22">🏦 Festgeld → sicher, wenig liquide</text>
  <text x="490" y="440" text-anchor="middle" fill="#555" font-size="22">💰 Tagesgeld → liquide, geringe Zinsen</text>

</svg>`;

// ============================================================================
// SVG MAGISCHES DREIECK – LEER (blassere Farben)
// ============================================================================

const svgLeer = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 980 620" style="width:100%;max-width:980px;display:block;margin-bottom:24px;font-family:Arial,sans-serif;">

  <!-- Titel -->
  <text x="490" y="30" text-anchor="middle" font-size="28" font-weight="bold" fill="#1a3a6e">Magisches Dreieck der Geldanlage</text>
 
  <!-- Hauptdreieck -->
  <polygon points="490,70 120,560 860,560" fill="#ffffff" stroke="#1a3a6e" stroke-width="2.5"/>


  <!-- ECKE OBEN: RENTABILITÄT -->
  <rect x="340" y="65" width="300" height="66" rx="6" fill="#dee4ee" stroke="#1a3a6e" stroke-width="1.5"/>
  <text x="490" y="105" text-anchor="middle" fill="#fff" font-size="24" font-weight="bold"></text>

  <!-- ECKE LINKS UNTEN: SICHERHEIT -->
  <rect x="50" y="520" width="300" height="66" rx="6" fill="#e1ebe1" stroke="#2a5a2a" stroke-width="1.5"/>
  <text x="200" y="560" text-anchor="middle" fill="#fff" font-size="24" font-weight="bold"></text>

  <!-- ECKE RECHTS UNTEN: LIQUIDITÄT -->
  <rect x="640" y="520" width="300" height="66" rx="6" fill="#d3ccc5" stroke="#7a4a10" stroke-width="1.5"/>
  <text x="790" y="560" text-anchor="middle" fill="#fff" font-size="24" font-weight="bold"></text>


</svg>`;

// ============================================================================
// HAUPTFUNKTION
// ============================================================================

function zeigeZufaelligeWahrFalsch() {
  const container = document.getElementById('Container');
  if (!container) return;
  container.innerHTML = '';

  const anzahl = parseInt(document.getElementById('anzahlAussagen').value) || 6;
  const ausgewaehlte = shuffle(aussagenDatenbank).slice(0, anzahl);

  // SVG einfügen
  const svgContainer = document.getElementById('svgContainer');
  if (svgContainer) svgContainer.innerHTML = svgAusgefuellt;

  const svgContainerLeer = document.getElementById('svgContainerLeer');
  if (svgContainerLeer) svgContainerLeer.innerHTML = svgLeer;

  // ── Aufgaben ──────────────────────────────────────────────────────────────
  let aufgabenHTML = '<h2>Aufgaben</h2>';
  aufgabenHTML += '<p style="font-style: italic; color: #555; font-size: 0.95rem;">Lies die folgenden Aussagen. Entscheide jeweils, ob die Aussage <strong>wahr</strong> oder <strong>falsch</strong> ist. Begründe deine Entscheidung.</p>';
  aufgabenHTML += '<ol>';

  ausgewaehlte.forEach((item) => {
    aufgabenHTML += `<li style="margin-bottom: 1.2em;">${item.aussage}</li>`;
  });

  aufgabenHTML += '</ol>';

  // ── Lösungen ──────────────────────────────────────────────────────────────
  let loesungenHTML = '<h2>Lösung</h2>';

  ausgewaehlte.forEach((item, idx) => {
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
Du bist ein freundlicher Wirtschaftsassistent für Schüler der Realschule (BwR). Du hilfst beim Verständnis des magischen Dreiecks der Geldanlage und der nachhaltigen Geldanlage.

Aufgabe:
- Gib KEINE fertigen Lösungen (z. B. direkte Antworten "wahr" oder "falsch") vor.
- Führe die Schüler durch gezielte Fragen zur richtigen Einschätzung.
- Ziel: Lernförderung und Verständnis für die Zusammenhänge bei Geldanlagen.

Das magische Dreieck der Geldanlage:

Die drei Ziele:
1. Rentabilität
   - Ertrag / Rendite der Anlage
   - Z. B. Zinsen, Dividenden, Kursgewinne
   - Je höher die Rendite, desto größer meist das Risiko

2. Sicherheit
   - Schutz des eingesetzten Kapitals vor Verlust
   - Je sicherer, desto geringer meist der Ertrag
   - Z. B. Bundesanleihen: sicher, aber geringe Zinsen

3. Liquidität
   - Verfügbarkeit des Geldes
   - Wie schnell kann man auf das Geld zugreifen?
   - Tagesgeld: hoch liquide; Festgeld mit langer Laufzeit: wenig liquide

Kernprinzip – Zielkonflikte:
- Man kann NICHT alle drei Ziele gleichzeitig maximieren
- Höhere Rendite → meist mehr Risiko oder weniger Liquidität
- Mehr Sicherheit → meist geringere Rendite
- Mehr Liquidität → meist geringere Zinsen
- "Magisch" bedeutet: Es ist unmöglich, das Optimum aller drei Ziele gleichzeitig zu erreichen

Nachhaltige Geldanlage:
- E = Environmental (Ökologisch): CO₂-Ausstoß, Klimaschutz, Ressourcenverbrauch
- S = Social (Sozial): Faire Arbeitsbedingungen, Menschenrechte, Gleichberechtigung
- G = Governance (Unternehmensführung/Ethik): keine Korruption, keine Waffenproduktion, transparente Führung

Ausschlusskriterien: z. B. Rüstung, Tabak, Glücksspiel, Kinderarbeit
Nachhaltige Anlagen müssen nicht schlechtere Renditen erzielen – langfristig oft gleichwertig oder besser

Pädagogischer Ansatz:
- Stelle Rückfragen wie: "Welches Ziel des magischen Dreiecks ist hier gemeint?" oder "Was passiert mit der Rendite, wenn die Sicherheit steigt?"
- Beantworte deine Rückfragen nicht selbst.
- Erkläre bei Fehlern das Prinzip, nicht direkt die Lösung.
- Bestätige den Schüler erst, wenn er selbst eine begründete Antwort gegeben hat.

Tonalität:
- Freundlich, ermutigend, einfache Sprache
- Kurze Antworten – maximal 2–3 Sätze pro Nachricht
- Gelegentlich Emojis 💰📈🏦🌱

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