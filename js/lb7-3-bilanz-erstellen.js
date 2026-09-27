// ============================================================================
// BILANZPOSTEN-DEFINITIONEN
// ============================================================================

const bilanzPostenDefinitionen = [
  { id: "GR",   name: "Grundstücke",                         kategorie: "AV", min: 200000, max: 550000 },
  { id: "BVG",  name: "Betriebs- und Verwaltungsgebäude",    kategorie: "AV", min: 500000, max: 2000000 },
  { id: "MA",   name: "Maschinen und Anlagen",                kategorie: "AV", min: 10000,  max: 200000 },
  { id: "FP",   name: "Fuhrpark",                             kategorie: "AV", min: 10000,  max: 100000 },
  { id: "BM",   name: "Büromaschinen",                        kategorie: "AV", min: 5000,   max: 20000 },
  { id: "BGA",  name: "Büromöbel- und Geschäftsausstattung",  kategorie: "AV", min: 10000,  max: 50000 },
  { id: "VORR", name: "Vorräte",                              kategorie: "UV", min: 20000,  max: 100000 },
  { id: "FO",   name: "Forderungen an Kunden",                kategorie: "UV", min: 2000,   max: 300000 },
  { id: "BK",   name: "Bank",                                 kategorie: "UV", min: 40000,  max: 400000 },
  { id: "KA",   name: "Kasse",                                kategorie: "UV", min: 1000,   max: 15000 },
  { id: "LBKV", name: "Langfristige Bankverbindlichkeiten",   kategorie: "FK", min: 50000,  max: 200000 },
  { id: "KBKV", name: "Kurzfristige Bankverbindlichkeiten",   kategorie: "FK", min: 1000,   max: 50000 },
  { id: "VE",   name: "Verbindlichkeiten a. LL.",             kategorie: "FK", min: 5000,   max: 50000 },
];

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================

function getRandomValueInRange(min, max) {
  const randomValue = Math.ceil(Math.random() * (max - min + 1)) + min;
  return Math.ceil(randomValue / 5000) * 5000;
}

function formatCurrency(value) {
  return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ============================================================================
// GLOBALE VARIABLE FÜR DIE ZULETZT GENERIERTEN POSTEN (für KI-Prompt)
// ============================================================================

let letztePosten = [];

// ============================================================================
// KI-ASSISTENT PROMPT
// ============================================================================

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Buchführungs-Assistent für Schülerinnen und Schüler der Realschule (BwR). Du hilfst dabei, aus einzelnen Bilanzposten eine korrekte Bilanz zu erstellen.

Sprich die Schülerinnen und Schüler immer mit „du" an.

Aufgabe:
- Gib KEINE fertige Bilanz oder Zuordnung vor.
- Führe die Schüler durch gezielte Fragen zur richtigen Einordnung jedes Postens.
- Ziel: Lernförderung, nicht das Abnehmen der Denkarbeit.

Pädagogischer Ansatz:
- Frage bei jedem Posten: Gehört er zum Anlagevermögen, zum Umlaufvermögen oder zum Fremdkapital?
- Stelle Rückfragen wie: „Kann man diesen Posten kurzfristig zu Geld machen?" oder „Wird dieser Posten dauerhaft im Betrieb genutzt?"
- Bei Fehlern: erkläre das Abgrenzungskriterium, nicht die Lösung.
- Das Eigenkapital soll der Schüler selbst über die Bilanzgleichung (Vermögen − Fremdkapital) herleiten.

Die vorliegenden Bilanzposten (unsortiert, mit Werten):

###POSTEN###

Grundlagen zur Gliederung:
1. Aktivseite (Vermögen)
   - I. Anlagevermögen: Grundstücke, Gebäude, Maschinen, Fuhrpark, Büromaschinen, Büromöbel/-ausstattung – alles, was dauerhaft im Betrieb bleibt
   - II. Umlaufvermögen: Vorräte, Forderungen, Bank, Kasse – alles, was kurzfristig verbraucht oder zu Geld gemacht wird
2. Passivseite (Kapital)
   - I. Eigenkapital: Restgröße = Bilanzsumme − Fremdkapital
   - II. Fremdkapital: langfristige und kurzfristige Bankverbindlichkeiten, Verbindlichkeiten aus Lieferungen und Leistungen

Typische Fehler der Schüler – darauf hinweisen, nicht vorwegnehmen:
- Verbindlichkeiten werden fälschlich auf die Aktivseite gesetzt
- Forderungen und Verbindlichkeiten werden verwechselt
- Das Eigenkapital wird geraten statt berechnet

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe – du-Ansprache
- Kurze Antworten – maximal 1–2 Sätze pro Nachricht
- Gelegentlich Emojis zur Auflockerung 📊🏦✅❓

Was du NICHT tust:
- Nenne die fertige Bilanz nicht, bevor der Schüler jeden Posten selbst zugeordnet hat
- Verrate das Eigenkapital nicht, bevor der Schüler es selbst berechnet hat

Du wartest stets auf die Eingabe des Schülers und gibst nichts vor. Dein Ziel ist es, dass der Schüler die Bilanz selbst erstellt und versteht.
`;

function erstellePostenText(posten) {
  return posten.map(p => `- ${p.name}: ${formatCurrency(p.wert)}`).join('\n');
}

function erstelleKiPromptText() {
  const postenText = letztePosten.length
    ? erstellePostenText(letztePosten)
    : "(Noch keine Aufgabe generiert. Bitte zuerst eine neue Aufgabe erstellen.)";
  return KI_ASSISTENT_PROMPT.replace("###POSTEN###", postenText);
}

// ============================================================================
// HAUPTFUNKTION – AUFGABE GENERIEREN
// ============================================================================

function generiereAufgabe() {
  const container = document.getElementById('Container');
  if (!container) return;

  const posten = bilanzPostenDefinitionen.map(def => ({
    ...def,
    wert: getRandomValueInRange(def.min, def.max)
  }));
  letztePosten = posten;

  const av = posten.filter(p => p.kategorie === "AV");
  const uv = posten.filter(p => p.kategorie === "UV");
  const fk = posten.filter(p => p.kategorie === "FK");

  const avSumme = av.reduce((sum, p) => sum + p.wert, 0);
  const uvSumme = uv.reduce((sum, p) => sum + p.wert, 0);
  const fkSumme = fk.reduce((sum, p) => sum + p.wert, 0);
  const bilanzsumme = avSumme + uvSumme;
  const ek = bilanzsumme - fkSumme;

  // ── Aufgabe: unsortierte Postenliste ──────────────────────────────────
  const shuffled = shuffle(posten);
  let aufgabenHTML = `
    <h2>Aufgabe</h2>
    <p><strong>Arbeitsauftrag:</strong> Erstelle aus den folgenden Bilanzposten die vollständige Bilanz zum 1. Januar.</p>
    <table style="border-collapse: collapse;font-family:calibri;background-color:#fff;min-width:500px;max-width:700px;line-height:1.4;">
      <tbody>
        <tr style="background-color:#ccc;">
          <th style="text-align:left;padding:4px 6px;">Bilanzposten</th>
          <th style="text-align:right;padding:4px 6px;">Betrag</th>
        </tr>`;

  shuffled.forEach(p => {
    aufgabenHTML += `
        <tr style="border-top:1px solid #AAAAAA;">
          <td style="padding:4px 6px;">${p.name}</td>
          <td style="padding:4px 6px;text-align:right;">${formatCurrency(p.wert)}</td>
        </tr>`;
  });

  aufgabenHTML += `
      </tbody>
    </table>`;

  // ── Lösung: sortierte Bilanz ───────────────────────────────────────────
  let loesungHTML = `<h2>Lösung</h2>
    <table style="border-collapse: collapse;font-family:calibri;background-color:#fff;min-width:700px;max-width:1400px;line-height:1;">
      <tbody>
        <tr style="background-color:#ccc;">
          <th style="width:25%;text-align:left;padding-left:6px;">Aktiva</th>
          <th colspan="2" style="text-align:center;">Eröffnungsbilanz&nbsp;1. Januar</th>
          <th style="width:25%;text-align:right;padding-right:6px">Passiva</th>
        </tr>
        <tr style="border-top:1px solid #AAAAAA;">
          <td style="width:25%"><b>I. Anlagevermögen</b></td>
          <td style="width:25%;text-align:right;padding-right:4px;"></td>
          <td style="width:25%;border-left:1px solid #AAAAAA;padding-left:6px;"><b>I. Eigenkapital</b></td>
          <td style="width:25%;text-align:right;padding-right:4px;">${formatCurrency(ek)}</td>
        </tr>`;

  // Aktiva- und Passivseite werden unabhängig voneinander aufgebaut, damit das
  // Fremdkapital immer direkt unter dem Eigenkapital steht — unabhängig davon,
  // wie viele Anlagevermögen-Posten es gibt (kein Leerraum dazwischen).
  const aktivaZeilen = [
    ...av.map(p => ({ label: p.name, value: formatCurrency(p.wert) })),
    { label: "II. Umlaufvermögen", value: "", bold: true },
    ...uv.map(p => ({ label: p.name, value: formatCurrency(p.wert) })),
  ];

  const passivaZeilen = [
    { label: "II. Fremdkapital", value: "", bold: true },
    ...fk.map(p => ({ label: p.name, value: formatCurrency(p.wert) })),
  ];

  const zeilenAnzahl = Math.max(aktivaZeilen.length, passivaZeilen.length);
  for (let i = 0; i < zeilenAnzahl; i++) {
    const a = aktivaZeilen[i];
    const p = passivaZeilen[i];
    const aLabel = a ? (a.bold ? `<b>${a.label}</b>` : a.label) : "";
    const pLabel = p ? (p.bold ? `<b>${p.label}</b>` : p.label) : "";
    loesungHTML += `
        <tr style="border-top:1px solid #AAAAAA;">
          <td style="width:25%">${aLabel}</td>
          <td style="width:25%;text-align:right;padding-right:4px;">${a ? a.value : ""}</td>
          <td style="width:25%;border-left:1px solid #AAAAAA;padding-left:6px;">${pLabel}</td>
          <td style="width:25%;text-align:right;padding-right:4px;">${p ? p.value : ""}</td>
        </tr>`;
  }

  loesungHTML += `
        <tr style="border-bottom:6px double #AAAAAA;border-top:2px solid #AAAAAA;">
          <td style="width:25%"></td>
          <td style="text-align:right;padding-right:2px;font-weight:bold">${formatCurrency(bilanzsumme)}</td>
          <td style="border-left:1px solid #AAAAAA;padding-left:6px;padding-right:4px;"></td>
          <td style="text-align:right;padding-right:4px;font-weight:bold">${formatCurrency(bilanzsumme)}</td>
        </tr>
      </tbody>
    </table>`;

  container.innerHTML = aufgabenHTML + loesungHTML;

  const vorschau = document.getElementById('kiPromptVorschau');
  if (vorschau && getComputedStyle(vorschau).display !== 'none') {
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
      const btn = document.getElementById("kiPromptKopierenBtn");
      const originalHTML = btn.innerHTML;
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Kopiert!`;
      btn.classList.add("ki-prompt-btn--success");
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.classList.remove("ki-prompt-btn--success");
      }, 2500);
    })
    .catch(() => alert("Kopieren nicht möglich. Bitte manuell aus dem Textfeld kopieren."));
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
    generiereAufgabe();
  }, 300);
});