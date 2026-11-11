// ============================================================================
// BILANZPOSTEN-DEFINITIONEN
// ============================================================================

const bilanzPostenDefinitionen = [
  { id: "GR", name: "Grundstücke", kategorie: "AV", min: 200000, max: 550000 },
  {
    id: "BVG",
    name: "Betriebs- und Verwaltungsgebäude",
    kategorie: "AV",
    min: 500000,
    max: 2000000,
  },
  {
    id: "MA",
    name: "Maschinen und Anlagen",
    kategorie: "AV",
    min: 10000,
    max: 200000,
  },
  { id: "FP", name: "Fuhrpark", kategorie: "AV", min: 10000, max: 100000 },
  { id: "BM", name: "Büromaschinen", kategorie: "AV", min: 5000, max: 20000 },
  {
    id: "BGA",
    name: "Büromöbel- und Geschäftsausstattung",
    kategorie: "AV",
    min: 10000,
    max: 50000,
  },
  { id: "VORR", name: "Vorräte", kategorie: "UV", min: 20000, max: 100000 },
  {
    id: "FO",
    name: "Forderungen an Kunden",
    kategorie: "UV",
    min: 2000,
    max: 300000,
  },
  { id: "BK", name: "Bank", kategorie: "UV", min: 40000, max: 400000 },
  { id: "KA", name: "Kasse", kategorie: "UV", min: 1000, max: 15000 },
  {
    id: "LBKV",
    name: "Langfristige Bankverbindlichkeiten",
    kategorie: "FK",
    min: 50000,
    max: 200000,
  },
  {
    id: "KBKV",
    name: "Kurzfristige Bankverbindlichkeiten",
    kategorie: "FK",
    min: 1000,
    max: 50000,
  },
  {
    id: "VE",
    name: "Verbindlichkeiten a. LL.",
    kategorie: "FK",
    min: 5000,
    max: 50000,
  },
];

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================

function getRandomValueInRange(min, max) {
  const randomValue = Math.ceil(Math.random() * (max - min + 1)) + min;
  return Math.ceil(randomValue / 5000) * 5000;
}

// ============================================================================
// GLOBALE VARIABLE FÜR DIE ZULETZT GENERIERTEN POSTEN (für KI-Prompt)
// ============================================================================

let letztePosten = [];
let letzteBilanzLoesung = null; // für Moodle-Export

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
  return posten.map((p) => `- ${p.name}: ${formatCurrency(p.wert)}`).join("\n");
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
  const container = document.getElementById("Container");
  if (!container) return;

  const posten = bilanzPostenDefinitionen.map((def) => ({
    ...def,
    wert: getRandomValueInRange(def.min, def.max),
  }));
  letztePosten = posten;

  const av = posten.filter((p) => p.kategorie === "AV");
  const uv = posten.filter((p) => p.kategorie === "UV");
  const fk = posten.filter((p) => p.kategorie === "FK");

  const avSumme = av.reduce((sum, p) => sum + p.wert, 0);
  const uvSumme = uv.reduce((sum, p) => sum + p.wert, 0);
  const fkSumme = fk.reduce((sum, p) => sum + p.wert, 0);
  const bilanzsumme = avSumme + uvSumme;
  const ek = bilanzsumme - fkSumme;

  // ── Aufgabe: unsortierte Postenliste ──────────────────────────────────
  const shuffled = shuffle(posten);

  // Lösungsdaten für Moodle-Export merken (nach shuffled, da TDZ)
  letzteBilanzLoesung = {
    av,
    uv,
    fk,
    avSumme,
    uvSumme,
    fkSumme,
    bilanzsumme,
    ek,
    posten,
    shuffled,
  };

  let aufgabenHTML = `
    <h2>Aufgabe: Eine Bilanz erstellen</h2>
    <h3>Erstelle aus den folgenden Bilanzposten die vollständige Bilanz zum 1. Januar.</h3>
    <table style="border-collapse: collapse;font-family:calibri;background-color:#fff;min-width:500px;max-width:700px;line-height:1.4;">
      <tbody>
        <tr style="background-color:#ccc;">
          <th style="text-align:left;padding:4px 6px;">Bilanzposten</th>
          <th style="text-align:right;padding:4px 6px;">Betrag</th>
        </tr>`;

  shuffled.forEach((p) => {
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
  let loesungHTML = `<h2 class="loesung">Lösung</h2>
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
    ...av.map((p) => ({ label: p.name, value: formatCurrency(p.wert) })),
    { label: "II. Umlaufvermögen", value: "", bold: true },
    ...uv.map((p) => ({ label: p.name, value: formatCurrency(p.wert) })),
  ];

  const passivaZeilen = [
    { label: "II. Fremdkapital", value: "", bold: true },
    ...fk.map((p) => ({ label: p.name, value: formatCurrency(p.wert) })),
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

  container.innerHTML = aufgabenHTML + "\n" + mbLeereBilanzHtml() + "\n" + loesungHTML;

  const vorschau = document.getElementById("kiPromptVorschau");
  if (vorschau && getComputedStyle(vorschau).display !== "none") {
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
    .catch(() =>
      zeigeModal(
        "Kopieren nicht möglich. Bitte manuell aus dem Textfeld kopieren.",
      ),
    );
}

function toggleKiPromptVorschau() {
  const vorschau = document.getElementById("kiPromptVorschau");
  const btn = document.getElementById("kiPromptToggleBtn");
  const isHidden = getComputedStyle(vorschau).display === "none";
  if (isHidden) {
    vorschau.style.display = "block";
    vorschau.textContent = erstelleKiPromptText();
    btn.textContent = "Vorschau ausblenden ▲";
  } else {
    vorschau.style.display = "none";
    btn.textContent = "Prompt anzeigen ▼";
  }
}

// ============================================================================
// MOODLE-XML-EXPORT – FREITEXT (essay): Bilanz erstellen
// ============================================================================
// Aufgabe: unsortierte Bilanzposten-Liste + Aufforderung, die Bilanz zu
// erstellen. Vorlage (HTML-Editor): leere Bilanz (Aktiva/Passiva) zum
// Ausfüllen. Bewerterinformation: die Lösung (gefüllte Bilanz).

const MOODLE_BILANZ_PUNKTE = 3; // 3 Punkte je Frage

function mbEsc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function mbCdata(s) {
  return (
    "<![CDATA[" + String(s ?? "").replace(/\]\]>/g, "]]]]><![CDATA[>") + "]]>"
  );
}

function mbLeereBilanzHtml() {
  const L = letzteBilanzLoesung;
  if (!L) return "";
  const { av, uv, fk } = L;

  let html = `<table style="border-collapse: collapse; font-family:calibri; background-color:#fff; min-width:700px; max-width:1400px; line-height:1;">`;
  html += `<thead><tr style="background-color:#ccc;">
    <th style="width:25%;text-align:left;padding-left:6px;"></th>
    <th colspan="2" style="text-align:center;">Eröffnungsbilanz 1. Januar</th>
    <th style="width:25%;text-align:right;padding-right:6px"></th>
  </tr></thead><tbody>`;
  html += `<tr style="border-top:1px solid #AAAAAA;">
    <td style="width:25%"></td>
    <td style="width:25%;text-align:right;padding-right:4px;"></td>
    <td style="width:25%;border-left:1px solid #AAAAAA;padding-left:6px;"></td>
    <td style="width:25%;text-align:right;padding-right:4px;"></td>
  </tr>`;

  const aktivaZeilen = [
    ...av.map(() => ({ label: "", value: "" })),
    { label: "", value: "", bold: true },
    ...uv.map(() => ({ label: "", value: "" })),
  ];
  const passivaZeilen = [
    { label: "", value: "", bold: true },
    ...fk.map(() => ({ label: "", value: "" })),
  ];
  const zeilenAnzahl = Math.max(aktivaZeilen.length, passivaZeilen.length);
  for (let i = 0; i < zeilenAnzahl; i++) {
    const a = aktivaZeilen[i];
    const p = passivaZeilen[i];
    const aLabel = a ? (a.bold ? `<b>${a.label}</b>` : a.label) : "";
    const pLabel = p ? (p.bold ? `<b>${p.label}</b>` : p.label) : "";
    html += `<tr style="border-top:1px solid #AAAAAA;">
      <td style="width:25%">${aLabel}</td>
      <td style="width:25%;text-align:right;padding-right:4px;">${a ? a.value : ""}</td>
      <td style="width:25%;border-left:1px solid #AAAAAA;padding-left:6px;">${pLabel}</td>
      <td style="width:25%;text-align:right;padding-right:4px;">${p ? p.value : ""}</td>
    </tr>`;
  }
  html += `<tr style="border-bottom:6px double #AAAAAA;border-top:2px solid #AAAAAA;">
    <td style="width:25%"></td>
    <td style="text-align:right;padding-right:2px;font-weight:bold"></td>
    <td style="border-left:1px solid #AAAAAA;padding-left:6px;padding-right:4px;"></td>
    <td style="text-align:right;padding-right:4px;font-weight:bold"></td>
  </tr>`;
  html += `</tbody></table>`;
  return html;
}


// Aufgaben-HTML (unsortierte Bilanzposten)
function mbAufgabeHtml() {
  if (!letztePosten || !letztePosten.length) return "";
  let html = `<h3>Erstelle aus den folgenden Bilanzposten die vollständige Bilanz zum 1. Januar.</h3>`;
  html += `<table style="border-collapse: collapse; font-family:calibri; background-color:#fff; min-width:400px; max-width:600px; line-height:1.4;">`;
  html += `<tbody><tr style="background-color:#ccc;"><th style="text-align:left;padding:4px 6px;">Bilanzposten</th><th style="text-align:right;padding:4px 6px;">Betrag</th></tr>`;
  letztePosten.forEach((p) => {
    html += `<tr style="border-top:1px solid #AAAAAA;"><td style="padding:4px 6px;">${mbEsc(p.name)}</td><td style="padding:4px 6px;text-align:right;">${formatCurrency(p.wert)}</td></tr>`;
  });
  html += `</tbody></table>`;
  return html;
}

// Lösungs-HTML (gefüllte Bilanz)
function mbLoesungHtml() {
  const L = letzteBilanzLoesung;
  if (!L) return "";
  const { av, uv, fk, avSumme, uvSumme, fkSumme, bilanzsumme, ek } = L;

  let html = `<table style="border-collapse: collapse; font-family:calibri; background-color:#fff; min-width:700px; max-width:1400px; line-height:1;">`;
  html += `<tbody><tr style="background-color:#ccc;">
    <th style="width:25%;text-align:left;padding-left:6px;">Aktiva</th>
    <th colspan="2" style="text-align:center;">Eröffnungsbilanz 1. Januar</th>
    <th style="width:25%;text-align:right;padding-right:6px">Passiva</th>
  </tr>`;
  html += `<tr style="border-top:1px solid #AAAAAA;">
    <td style="width:25%"><b>I. Anlagevermögen</b></td>
    <td style="width:25%;text-align:right;padding-right:4px;"></td>
    <td style="width:25%;border-left:1px solid #AAAAAA;padding-left:6px;"><b>I. Eigenkapital</b></td>
    <td style="width:25%;text-align:right;padding-right:4px;">${formatCurrency(ek)}</td>
  </tr>`;

  const aktivaZeilen = [
    ...av.map((p) => ({ label: p.name, value: formatCurrency(p.wert) })),
    { label: "II. Umlaufvermögen", value: "", bold: true },
    ...uv.map((p) => ({ label: p.name, value: formatCurrency(p.wert) })),
  ];
  const passivaZeilen = [
    { label: "II. Fremdkapital", value: "", bold: true },
    ...fk.map((p) => ({ label: p.name, value: formatCurrency(p.wert) })),
  ];
  const zeilenAnzahl = Math.max(aktivaZeilen.length, passivaZeilen.length);
  for (let i = 0; i < zeilenAnzahl; i++) {
    const a = aktivaZeilen[i];
    const p = passivaZeilen[i];
    const aLabel = a ? (a.bold ? `<b>${a.label}</b>` : a.label) : "";
    const pLabel = p ? (p.bold ? `<b>${p.label}</b>` : p.label) : "";
    html += `<tr style="border-top:1px solid #AAAAAA;">
      <td style="width:25%">${aLabel}</td>
      <td style="width:25%;text-align:right;padding-right:4px;">${a ? a.value : ""}</td>
      <td style="width:25%;border-left:1px solid #AAAAAA;padding-left:6px;">${pLabel}</td>
      <td style="width:25%;text-align:right;padding-right:4px;">${p ? p.value : ""}</td>
    </tr>`;
  }
  html += `<tr style="border-bottom:6px double #AAAAAA;border-top:2px solid #AAAAAA;">
    <td style="width:25%"></td>
    <td style="text-align:right;padding-right:2px;font-weight:bold">${formatCurrency(bilanzsumme)}</td>
    <td style="border-left:1px solid #AAAAAA;padding-left:6px;padding-right:4px;"></td>
    <td style="text-align:right;padding-right:4px;font-weight:bold">${formatCurrency(bilanzsumme)}</td>
  </tr>`;
  html += `</tbody></table>`;
  return html;
}

function mbBaueXml() {
  if (!letztePosten || !letztePosten.length || !letzteBilanzLoesung) {
    return null;
  }
  const basis = Math.floor(Math.random() * 900000) + 100000;
  const titel = `7.3-${basis}meinBwR-Bilanz`;
  const aufgabe = mbAufgabeHtml();
  const vorlage = mbLeereBilanzHtml();
  const loesung = mbLoesungHtml();

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n';
  xml += `  <question type="essay">\n`;
  xml += `    <name>\n      <text>${mbEsc(titel)}</text>\n    </name>\n`;
  xml += `    <questiontext format="html">\n      <text>${mbCdata(aufgabe + "<p><strong>Aufgabe:</strong> Erstelle aus den Bilanzposten die vollständige Bilanz zum 1. Januar und trage sie in die Vorlage ein.</p>")}</text>\n    </questiontext>\n`;
  xml += `    <defaultgrade>${MOODLE_BILANZ_PUNKTE}</defaultgrade>\n`;
  xml += `    <penalty>0</penalty>\n`;
  xml += `    <hidden>0</hidden>\n`;
  xml += `    <idnumber></idnumber>\n`;
  xml += `    <responseformat>editor</responseformat>\n`;
  xml += `    <responserequired>1</responserequired>\n`;
  xml += `    <responsefieldlines>20</responsefieldlines>\n`;
  xml += `    <attachments>0</attachments>\n`;
  xml += `    <attachmentsrequired>0</attachmentsrequired>\n`;
  xml += `    <maxbytes>0</maxbytes>\n`;
  xml += `    <filetypeslist></filetypeslist>\n`;
  xml += `    <responsetemplate format="html">\n      <text>${mbCdata(vorlage)}</text>\n    </responsetemplate>\n`;
  xml += `    <graderinfo format="html">\n      <text>${mbCdata(loesung)}</text>\n    </graderinfo>\n`;
  xml += `  </question>\n\n`;
  xml += "</quiz>\n";
  return xml;
}

function exportiereMoodle() {
  if (!letztePosten || !letztePosten.length || !letzteBilanzLoesung) {
    zeigeModal("Bitte zuerst eine Aufgabe erstellen (Neue Aufgabe).");
    return;
  }
  const xml = mbBaueXml();
  if (!xml) {
    zeigeModal("Export fehlgeschlagen: keine Aufgabe vorhanden.");
    return;
  }

  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  const dateiname = `quiz-bilanz-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.xml`;

  const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = dateiname;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ============================================================================
// INITIALISIERUNG
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  const vorschauEl = document.getElementById("kiPromptVorschau");
  if (vorschauEl) {
    vorschauEl.textContent = KI_ASSISTENT_PROMPT;
  }
  setTimeout(() => {
    generiereAufgabe();
  }, 300);
});
