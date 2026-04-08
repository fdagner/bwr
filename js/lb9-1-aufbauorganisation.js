// ============================================================================
// MERKMALE-POOL – Aufbauorganisation: Einlinien- vs. Mehrliniensystem
// ============================================================================
// Alle Merkmale sind EINDEUTIG – jedes trifft auf genau EINES der beiden Systeme zu.

const alleMerkmale = [

  // ── Einliniensystem ──────────────────────────────────────────────────────
  { text: 'Jede Stelle hat genau einen Vorgesetzten.',                                         einlinien: true,  mehrlinie: false },
  { text: 'Klare Kompetenzabgrenzung und eindeutige Verantwortungsbereiche',                   einlinien: true,  mehrlinie: false },
  { text: 'Übersichtliche und leicht verständliche Organisationsstruktur',                     einlinien: true,  mehrlinie: false },
  { text: 'Gute Kontrollmöglichkeiten durch den direkten Vorgesetzten',                        einlinien: true,  mehrlinie: false },
  { text: 'Einfache Einarbeitung neuer Mitarbeitender durch klare Strukturen',                 einlinien: true,  mehrlinie: false },
  { text: 'Geringe Abstimmungsprobleme zwischen den Führungskräften',                          einlinien: true,  mehrlinie: false },
  { text: 'Lange Dienstwege, da alle Informationen durch die Hierarchie laufen',               einlinien: true,  mehrlinie: false },
  { text: 'Gefahr der Bürokratisierung und langsamer Entscheidungswege',                       einlinien: true,  mehrlinie: false },
  { text: 'Überlastung der Führungskräfte, da alle Anweisungen über sie laufen',               einlinien: true,  mehrlinie: false },
  { text: 'Informationsverluste durch viele Hierarchiestufen möglich',                         einlinien: true,  mehrlinie: false },
  { text: 'Wenig Flexibilität bei sich schnell verändernden Situationen',                      einlinien: true,  mehrlinie: false },
  { text: 'Einheitliche Weisungskette von oben nach unten',                                    einlinien: true,  mehrlinie: false },
  { text: 'Eindeutige Zuordnung von Aufgaben, Kompetenzen und Verantwortung',                  einlinien: true,  mehrlinie: false },
  { text: 'Konflikte zwischen Vorgesetzten sind selten, da es nur einen gibt',                 einlinien: true,  mehrlinie: false },
  { text: 'Bei Ausfall einer Führungskraft stockt der gesamte Informationsfluss',              einlinien: true,  mehrlinie: false },

  // ── Mehrliniensystem ─────────────────────────────────────────────────────
  { text: 'Kurze Befehls- und Dienstwege durch direkte Fachvorgesetzte',                       einlinien: false, mehrlinie: true  },
  { text: 'Spezialisiertes Fachwissen mehrerer Vorgesetzter steht zur Verfügung',              einlinien: false, mehrlinie: true  },
  { text: 'Bessere Motivation der Mitarbeiter durch Einbindung verschiedener Spezialisten', einlinien: false, mehrlinie: true  },
  { text: 'Schnellere Entscheidungsfindung durch kurze Kommunikationswege',                    einlinien: false, mehrlinie: true  },
  { text: 'Fachlich optimale Betreuung der Mitarbeitenden durch Experten',                     einlinien: false, mehrlinie: true  },
  { text: 'Verständigungsschwierigkeiten und Kompetenzstreitigkeiten zwischen den Stellen',    einlinien: false, mehrlinie: true  },
  { text: 'Unklare Zuständigkeiten können zu Verunsicherung bei Mitarbeitenden führen',        einlinien: false, mehrlinie: true  },
  { text: 'Gefahr widersprüchlicher Anweisungen durch mehrere Vorgesetzte',                    einlinien: false, mehrlinie: true  },
  { text: 'Hoher Koordinationsaufwand zwischen den Fachvorgesetzten',                          einlinien: false, mehrlinie: true  },
  { text: 'Schwierige Schuldfrage bei Fehlern durch mehrere Weisungsstränge',                  einlinien: false, mehrlinie: true  },
  { text: 'Mitarbeitende erhalten Anweisungen von mehreren Vorgesetzten gleichzeitig',         einlinien: false, mehrlinie: true  },
  { text: 'Jede Stelle kann von verschiedenen Fachstellen direkt angewiesen werden',           einlinien: false, mehrlinie: true  },
  { text: 'Funktionale Spezialisierung der Vorgesetzten ist typisch',                          einlinien: false, mehrlinie: true  },
  { text: 'Gefahr von Kompetenzkonflikten zwischen den Leitungsstellen',                       einlinien: false, mehrlinie: true  },
];

// ============================================================================
// GLOBALE VARIABLE FÜR ZULETZT GENERIERTE AUFGABEN
// ============================================================================

let letzteGenerierteMerkmale = [];

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

function fill(pool, n) {
  let arr = [...pool];
  while (arr.length < n) arr = [...arr, ...pool];
  return arr.slice(0, n);
}

// ============================================================================
// MUSTERLÖSUNG ALS TEXT (für KI-Prompt)
// ============================================================================

function erstelleLoesungsText() {
  return letzteGenerierteMerkmale
    .map((m, idx) => {
      const system = m.einlinien ? 'Einliniensystem' : 'Mehrliniensystem';
      return `Merkmal ${idx + 1}: "${m.text}"\n  → ${system}`;
    })
    .join('\n');
}

// ============================================================================
// KI-PROMPT MIT AKTUELLEN AUFGABEN UND LÖSUNGEN
// ============================================================================

function erstelleKiPromptText() {
  let aufgabenUndLoesungen = '';
  if (letzteGenerierteMerkmale.length === 0) {
    aufgabenUndLoesungen = '(Noch keine Aufgaben generiert. Bitte zuerst neue Aufgaben erstellen.)';
  } else {
    const merkmalsListe = letzteGenerierteMerkmale
      .map((m, idx) => `${idx + 1}. ${m.text}`)
      .join('\n');
    aufgabenUndLoesungen =
      `Aufgabe:\nOrdne folgende Merkmale dem richtigen Organisationssystem zu (Einliniensystem oder Mehrliniensystem):\n\n${merkmalsListe}\n\nMusterlösung:\n${erstelleLoesungsText()}`;
  }
  return KI_ASSISTENT_PROMPT.replace('###AUFGABEN und LÖSUNGEN###', aufgabenUndLoesungen);
}

// ============================================================================
// KI-ASSISTENT PROMPT
// ============================================================================

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Assistent für Schülerinnen und Schüler der Realschule (BwR). Du hilfst beim Verständnis der Aufbauorganisation – insbesondere beim Unterschied zwischen dem Einliniensystem und dem Mehrliniensystem.

Sprich die Schülerinnen und Schüler immer mit „du" an.

Aufgabe:
- Gib KEINE fertigen Lösungen (Zuordnung der Merkmale) direkt vor.
- Führe die Schüler durch gezielte Fragen und Hinweise zur richtigen Einschätzung.
- Ziel: Lernförderung, nicht das Abnehmen der Denkarbeit.

Pädagogischer Ansatz:
- Frage nach den wesentlichen Eigenschaften des jeweiligen Merkmals.
- Stelle gezielte Rückfragen, um den Stand des Schülers zu verstehen.
- Beantworte deine Rückfragen nicht selbst, hake bei falschen Antworten nach.
- Bei Fehlern: erkläre das Prinzip, nicht direkt die Lösung.
- Erst wenn der Schüler die richtige Zuordnung erarbeitet hat, bestätige sie.

Begrüße den Schüler freundlich und gib ihm folgende Aufgabe:
Arbeitsauftrag: „Ordne die untenstehenden Merkmale dem jeweiligen System zu."

###AUFGABEN und LÖSUNGEN###

Methodik bei Rückfragen:
- Wie viele Vorgesetzte hat eine Stelle bei diesem Merkmal – einen oder mehrere?
- Fließen Informationen direkt oder durch viele Ebenen hindurch?
- Klingt das eher nach Ordnung und Übersichtlichkeit – oder nach Fachspezialisierung und kurzen Wegen?
- Wer ist zuständig, wenn ein Fehler passiert?
- Ist das eher ein Vorteil oder ein Nachteil – und für welches System?

Die zwei Organisationssysteme:

1. Einliniensystem
   - Jede Stelle hat genau EINEN direkten Vorgesetzten
   - Anweisungen folgen einer klaren Linie von oben nach unten
   - Klare Zuständigkeiten, übersichtliche Struktur
   - Nachteil: lange Dienstwege, Bürokratisierungsgefahr, Überlastung der Führungskräfte

2. Mehrliniensystem
   - Jede Stelle kann MEHRERE Vorgesetzte (Fachspezialisten) haben
   - Kurze Dienstwege, Fachwissen steht direkt zur Verfügung
   - Nachteil: widersprüchliche Anweisungen, Kompetenzstreitigkeiten, hoher Koordinationsaufwand

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe – du-Ansprache
- Einfache Sprache, Fachbegriffe bei Bedarf erklären
- Kurze Antworten – maximal 1–2 Sätze pro Nachricht
- Gelegentlich Emojis zur Auflockerung 🏢📋🔍✅❓

Was du NICHT tust:
- Nenne die Zuordnung nicht direkt – erkläre das Prinzip und frage nach
- Gib keine fertigen Kreuztabellen auf Anfrage heraus

Am Ende einer erfolgreich gelösten Übung:
- Frage immer: „Möchtest du noch eine andere Runde üben? Dann bekommst du neue Merkmale!"

Du wartest stets auf die Eingabe des Schülers und gibst nichts vor. Dein Ziel ist es, dass der Schüler die Lösung selbst findet und versteht.
`;

// ============================================================================
// BASE64-BILDER DER ORGANISATIONSSYSTEME
// ============================================================================

const IMG_EINLINIEN = 'data:image/png;base64,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';

const IMG_MEHRLINIE = 'data:image/png;base64,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';

// ============================================================================
// HAUPTFUNKTION – AUFGABEN GENERIEREN
// ============================================================================

function generiereAufgaben() {
  const anzahl    = parseInt(document.getElementById('anzahl').value) || 7;
  const container = document.getElementById('Container');
  if (!container) return;

  // Ausgewogene Verteilung: ca. 50/50 Einlinien/Mehrlinie
  const einlinienPool = shuffle(alleMerkmale.filter(m => m.einlinien));
  const mehrliniePool = shuffle(alleMerkmale.filter(m => m.mehrlinie));
  const haelfte1 = Math.floor(anzahl / 2);
  const haelfte2 = anzahl - haelfte1;

  letzteGenerierteMerkmale = shuffle([
    ...fill(einlinienPool, haelfte1),
    ...fill(mehrliniePool, haelfte2),
  ]);

  // ── Abbildung ────────────────────────────────────────────────────────────
  const abbildungHTML = `
    <div style="display:flex; flex-direction: row; gap:40px; flex-wrap:wrap; margin-bottom:18px; justify-content: center;">
      <div style="text-align:center;">
        <div style="font-weight:bold; font-size:0.95rem; margin-bottom:6px;">Einliniensystem</div>
        <img src="${IMG_EINLINIEN}" alt="Einliniensystem" width="220" style="max-width: 220px; margin:0 auto 4px;"/>
      </div>
      <div style="text-align:center;">
        <div style="font-weight:bold; font-size:0.95rem; margin-bottom:6px;">Mehrliniensystem</div>
        <img src="${IMG_MEHRLINIE}" alt="Mehrliniensystem" width="220" style="max-width: 220px; margin:0 auto 4px;"/>
      </div>
    </div>`;

  // ── Aufgaben-Tabelle ─────────────────────────────────────────────────────
  const thStyle     = 'background:#4a6fa5; color:#fff; padding:8px 10px; text-align:center; border:1px solid #ccc;';
  const thTextStyle = 'background:#4a6fa5; color:#fff; padding:8px 10px; text-align:left; border:1px solid #ccc;';
  const tdStyle     = 'border:1px solid #ccc; padding:8px 10px; text-align:center; width:120px;';
  const tdTextStyle = 'border:1px solid #ccc; padding:8px 10px;';

  let tabelleHTML = `
    <table style="width:100%; border-collapse:collapse;">
      <thead>
        <tr>
          <th style="${thTextStyle}">Merkmale</th>
          <th style="${thStyle}">Einliniensystem</th>
          <th style="${thStyle}">Mehrliniensystem</th>
        </tr>
      </thead>
      <tbody>`;

  letzteGenerierteMerkmale.forEach(m => {
    tabelleHTML += `
        <tr>
          <td style="${tdTextStyle}">${m.text}</td>
          <td style="${tdStyle}">&nbsp;</td>
          <td style="${tdStyle}">&nbsp;</td>
        </tr>`;
  });

  tabelleHTML += '</tbody></table><br><br>';

  // ── Lösungs-Tabelle ──────────────────────────────────────────────────────
  let loesungHTML = `
    <h2>Lösung</h2>
    <table style="width:100%; border-collapse:collapse;">
      <thead>
        <tr>
          <th style="${thTextStyle}">Merkmale</th>
          <th style="${thStyle}">Einliniensystem</th>
          <th style="${thStyle}">Mehrliniensystem</th>
        </tr>
      </thead>
      <tbody>`;

  letzteGenerierteMerkmale.forEach(m => {
    const eBg  = m.einlinien ? '#e6f4ea' : '#fff';
    const mlBg = m.mehrlinie ? '#e6f4ea' : '#fff';
    const eVal  = m.einlinien ? '✓' : '';
    const mlVal = m.mehrlinie ? '✓' : '';
    loesungHTML += `
        <tr>
          <td style="${tdTextStyle}">${m.text}</td>
          <td style="${tdStyle} background:${eBg}; color:#2a7a2a; font-weight:bold;">${eVal}</td>
          <td style="${tdStyle} background:${mlBg}; color:#2a7a2a; font-weight:bold;">${mlVal}</td>
        </tr>`;
  });

  loesungHTML += '</tbody></table>';

  container.innerHTML = `
    <h2>Aufgabe</h2>
    <p><strong>Arbeitsauftrag:</strong> Ordne die untenstehenden Merkmale dem jeweiligen System zu.</p>
    ${abbildungHTML}
    ${tabelleHTML}
    ${loesungHTML}`;

  const vorschau = document.getElementById('kiPromptVorschau');
  if (vorschau && vorschau.style.display !== 'none') {
    vorschau.textContent = erstelleKiPromptText();
  }
}

// ============================================================================
// KI-ASSISTENT FUNKTIONEN
// ============================================================================

function kopiereKiPrompt() {
  const promptText = erstelleKiPromptText();
  navigator.clipboard
    .writeText(promptText)
    .then(() => {
      const btn = document.getElementById('kiPromptKopierenBtn');
      const originalHTML = btn.innerHTML;
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Kopiert!`;
      btn.classList.add('ki-prompt-btn--success');
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.classList.remove('ki-prompt-btn--success');
      }, 2500);
    })
    .catch(() => alert('Kopieren nicht möglich. Bitte manuell aus dem Textfeld kopieren.'));
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

document.addEventListener('DOMContentLoaded', () => {
  const vorschauEl = document.getElementById('kiPromptVorschau');
  if (vorschauEl) {
    vorschauEl.textContent = KI_ASSISTENT_PROMPT;
  }
  setTimeout(() => {
    generiereAufgaben();
  }, 300);
});