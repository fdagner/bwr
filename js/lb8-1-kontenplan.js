// ============================================================================
// KONTENPLAN – LÜCKENTEXT (BwR 8.1)
// ============================================================================

const KONTENPLAN_AUSWAHL_NR = [
  "0500",
  "0530",
  "0700",
  "0840",
  "0860",
  "0870",
  "2600",
  "2800",
  "2880",
  "2400",
  "3000",
  "4200",
  "4250",
  "4400",
  "4800",
  "8010",
  "8020",
  "6000",
  "6010",
  "6020",
  "6030",
  "5000",
];

function getKonto(nr) {
  return (
    (typeof KONTENPLAN_NACH_NR !== "undefined" && KONTENPLAN_NACH_NR[nr]) ||
    null
  );
}

const KONTEN = KONTENPLAN_AUSWAHL_NR.map((nr) => getKonto(nr)).filter(Boolean);

let letzteZeilen = [];
let letzteSchwierigkeit = 2;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom(arr, n) {
  return shuffle(arr).slice(0, n);
}

function generiereAufgabe() {
  const sel = document.getElementById("schwierigkeit");
  const schw = sel ? parseInt(sel.value, 10) : 2;
  letzteSchwierigkeit = schw === 1 ? 1 : 2;

  const zSel = document.getElementById("zeilenAnzahl");
  const anzahl = zSel ? parseInt(zSel.value, 10) : 5;
  const n = Math.min(Math.max(anzahl || 5, 5), 20, KONTEN.length);

  const gewaehlt = pickRandom(KONTEN, n);

  letzteZeilen = gewaehlt.map((konto) => {
    const spalten = shuffle([0, 1, 2]).slice(0, letzteSchwierigkeit);
    return { konto, gaps: spalten };
  });

  renderAufgabe();
  setzeAufgabeKiText(baueAufgabeKiText());
}

function istLuecke(zeile, col) {
  return zeile.gaps.includes(col);
}

function baueAufgabeKiText() {
  const spaltenNamen = ["Kontennummer", "Kontenabkürzung", "Kontenbezeichnung"];
  let t = `Kontenplan – Lückentext (Schwierigkeitsgrad ${letzteSchwierigkeit}).\n`;
  t += `Ergänze die fehlenden Werte (je Zeile ${letzteSchwierigkeit === 1 ? "ein Wert" : "zwei Werte"}).\n\n`;
  t += "Tabelle:\n";
  t += "Kontennummer | Kontenabkürzung | Kontenbezeichnung\n";
  letzteZeilen.forEach((z) => {
    const vals = [z.konto.nr, z.konto.abk, z.konto.name].map((v, ci) =>
      istLuecke(z, ci) ? "___" : v,
    );
    t += vals.join(" | ") + "\n";
  });
  t += "\nLösung (vollständige Tabelle):\n";
  t += "Kontennummer | Kontenabkürzung | Kontenbezeichnung\n";
  letzteZeilen.forEach((z) => {
    t += `${z.konto.nr} | ${z.konto.abk} | ${z.konto.name}\n`;
  });
  return t;
}

const ZELLE =
  "padding:8px; border:1px solid #999; min-height:4.6em; height:4.6em; vertical-align:middle;";

function renderAufgabe() {
  const container = document.getElementById("Container");
  if (!container) return;

  const head = `
    <table style="border-collapse:collapse; font-size:16px; width:100%; max-width:760px;">
      <thead>
        <tr style="background:#6b7f99; color:#fff; height:2.6em;">
          <th style="${ZELLE} text-align:left; background:#6b7f99; color:#fff;">Kontennummer</th>
          <th style="${ZELLE} text-align:left; background:#6b7f99; color:#fff;">Kontenabkürzung</th>
          <th style="${ZELLE} text-align:left; background:#6b7f99; color:#fff;">Kontenbezeichnung</th>
        </tr>
      </thead>
      <tbody>`;

  let body = "";
  letzteZeilen.forEach((z) => {
    const zellen = [z.konto.nr, z.konto.abk, z.konto.name]
      .map((val, ci) => {
        if (istLuecke(z, ci)) {
          // Lücke: kein Eingabefeld, nur freier Raum (zwei Zeilen hoch)
          return `<td style="${ZELLE}">&nbsp;</td>`;
        }
        return `<td style="${ZELLE}">${val}</td>`;
      })
      .join("");
    body += `<tr style="height:4.6em;">${zellen}</tr>`;
  });

  const tabelle = head + body + `</tbody></table>`;

  container.innerHTML = `
    <h2>Aufgabe: Kontenplan</h2>
    <h3>Ergänze die fehlenden Werte in der Tabelle.</h3>
    <div style="background:#fff; border:1px solid #dde3ea; border-radius:8px; padding:14px 18px; margin-bottom:12px; font-size:16px; line-height:1.7;">
      In der folgenden Tabelle fehlen je Zeile ${letzteSchwierigkeit === 1 ? "ein Wert" : "zwei Werte"} (Kontennummer, Abkürzung oder Bezeichnung). Trage die fehlenden Werte ein.
    </div>
    ${tabelle}
    <h2 class="loesung">Lösung</h2>
    <div style="background:#fff; border:1px solid #dde3ea; border-radius:8px; padding:12px 18px; margin-top:12px; font-size:16px; line-height:1.7;">
      ${baueLoesungsTabelle()}
    </div>
  `;
}

function baueLoesungsTabelle() {
  let html = `<table style="border-collapse:collapse; font-size:16px; width:100%; max-width:760px;">
    <thead><tr style="background:#6b7f99; color:#fff; height:2.6em;">
      <th style="${ZELLE} background:#6b7f99; color:#fff;">Kontennummer</th>
      <th style="${ZELLE} background:#6b7f99; color:#fff;">Kontenabkürzung</th>
      <th style="${ZELLE} background:#6b7f99; color:#fff;">Kontenbezeichnung</th>
    </tr></thead><tbody>`;
  letzteZeilen.forEach((z) => {
    html += `<tr style="height:4.6em;">
      <td style="${ZELLE}">${z.konto.nr}</td>
      <td style="${ZELLE}">${z.konto.abk}</td>
      <td style="${ZELLE}">${z.konto.name}</td>
    </tr>`;
  });
  html += `</tbody></table>`;
  return html;
}

// ============================================================================
// MOODLE CLOZE EXPORT
// ============================================================================
function mxEsc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function mxCdata(s) {
  return (
    "<![CDATA[" + String(s ?? "").replace(/\]\]>/g, "]]]]><![CDATA[>") + "]]>"
  );
}
function mxIdBasis() {
  const SCHLUESSEL = "moodleKontenplanLetzteIdSekunde";
  let sek = Math.floor(Date.now() / 1000);
  try {
    const letzte = Number(localStorage.getItem(SCHLUESSEL)) || 0;
    if (sek <= letzte) sek = letzte + 1;
    localStorage.setItem(SCHLUESSEL, String(sek));
  } catch (e) {
    /* ohne localStorage */
  }
  const d = new Date(sek * 1000);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getFullYear() % 100)}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function baueKontenplanClozeXml() {
  if (!letzteZeilen.length) return null;

  const zelle = "border:1px solid #555; padding:4px 10px;";
  const kopf =
    "border:1px solid #555; padding:4px 10px; background-color:#d9d9d9;";

  let table = `
    <table style="border-collapse:collapse; font-family:inherit; min-width:560px;">
      <thead><tr>
        <th style="${kopf}">Kontennummer</th>
        <th style="${kopf}">Kontenabkürzung</th>
        <th style="${kopf}">Kontenbezeichnung</th>
      </tr></thead><tbody>`;

  letzteZeilen.forEach((z) => {
    const werte = [z.konto.nr, z.konto.abk, z.konto.name];
    const zellen = werte
      .map((w, ci) => {
        if (z.gaps.includes(ci)) {
          return `<td style="${zelle} text-align:center;">{1:SHORTANSWER:=${mxEsc(w)}}</td>`;
        }
        return `<td style="${zelle}">${mxEsc(w)}</td>`;
      })
      .join("");
    table += `<tr>${zellen}</tr>`;
  });
  table += `</tbody></table>`;

  const fragetext = `<p>Ergänze die fehlenden Werte im Kontenplan:</p>${table}`;
  const punkte = letzteZeilen.reduce((s, z) => s + z.gaps.length, 0);
  const titel = `Kontenplan-Lueckentext-${mxIdBasis()}`;

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n';
  xml += `  <question type="cloze">\n`;
  xml += `    <name>\n      <text>${mxEsc(titel)}</text>\n    </name>\n`;
  xml += `    <questiontext format="html">\n      <text>${mxCdata(fragetext)}</text>\n    </questiontext>\n`;
  xml += `    <generalfeedback format="html">\n      <text>${mxCdata(baueLoesungsTabelle())}</text>\n    </generalfeedback>\n`;
  xml += `    <defaultgrade>${punkte}</defaultgrade>\n    <penalty>0</penalty>\n    <hidden>0</hidden>\n    <idnumber></idnumber>\n`;
  xml += `    <shuffleanswers>false</shuffleanswers>\n`;
  xml += `  </question>\n\n</quiz>\n`;
  return xml;
}

function exportiereMoodle() {
  const xml = baueKontenplanClozeXml();
  if (!xml) {
    zeigeModal("Bitte zuerst Aufgaben erstellen.");
    return;
  }
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  const dateiname = `cloze-kontenplan-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.xml`;
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
// KI-ASSISTENT
// ============================================================================
// Prompt-Vorlage mit Platzhalter „###AUFGABEN und LOESUNGEN###" – bei der
// Übergabe wird dort die aktuell generierte Aufgabe inkl. Lösung eingesetzt.
const KI_ASSISTENT_PROMPT = `Du bist ein freundlicher Lernassistent für Schülerinnen und Schüler der Realschule (BwR). Du hilfst beim Verständnis des Kontenplans (Kontennummer, Abkürzung, Bezeichnung).

Sprich die Schülerinnen und Schüler immer mit „du" an.

Aufgabe:
- Gib die vom Lehrer erstellte Kontenplan-Übung zeilenweise an den Schüler weiter – eine Zeile (ein Konto) nach der anderen.
- Gib KEINE fertigen Lösungen vor, solange der Schüler nicht selbst ergänzt hat.
- Frage pro Zeile nach den fehlenden Werten (Kontennummer, Abkürzung oder Bezeichnung) und lass den Schüler antworten.
- Bestätige richtige Eingaben, korrigiere freundlich bei Fehlern und erkläre das Prinzip (z. B. dass die Kontonummer die Kontenklasse verrät).
- Ziel: Lernförderung, nicht das Abnehmen der Denkarbeit.

Pädagogischer Ansatz:
- Arbeite die Tabelle Zeile für Zeile ab – erst wenn eine Zeile vollständig und richtig ist, gehe zur nächsten.
- Stelle gezielte Rückfragen, um den Stand des Schülers zu verstehen.
- Beantworte deine Rückfragen nicht selbst.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung (z. B. Kontenklasse 0 = Sachanlagen, 2 = Umlaufvermögen).
- Erst wenn der Schüler alle Zeilen selbst erarbeitet hat, vergleichst du mit der unten stehenden Lösung.

Begrüße den Schüler freundlich und gib ihm die folgende Aufgabe vor.
Arbeitsauftrag: „Ergänze die fehlenden Werte in der Kontenplan-Tabelle zeilenweise."

Aufgabe mit Lösung:

###AUFGABEN und LOESUNGEN###

Wichtige Hinweise:
- Die Kontonummer ist vierstellig; die erste Ziffer gibt die Kontenklasse an (0 Sachanlagen, 2 Umlaufvermögen, 3 Eigenkapital, 4 Verbindlichkeiten, 5 Erträge, 6/7 Aufwendungen, 8 Abschluss).
- Die Abkürzung ist die offizielle Kurzform des Kontos (z. B. BK = Bank, UST = Umsatzsteuer).
- Die Bezeichnung ist der Langname des Kontos.

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe – du-Ansprache
- Einfache Sprache, keine Fachbegriffe ohne Erklärung
- Kurze Antworten – maximal 1–2 Sätze pro Nachricht
- Gelegentlich Emojis 📒✅❓

Am Ende einer erfolgreich gelösten Übung:
- Frage immer: „Möchtest du noch eine weitere Aufgabe üben?"

Du wartest stets auf die Eingabe des Schülers und gibst nichts vor.`;

let letzteAufgabeKiText = null;

function setzeAufgabeKiText(text) {
  letzteAufgabeKiText = text;
  const vorschauEl = document.getElementById("kiPromptVorschau");
  if (vorschauEl) vorschauEl.textContent = erstelleKiPromptText();
}

function erstelleKiPromptText() {
  return KI_ASSISTENT_PROMPT.replace(
    "###AUFGABEN und LOESUNGEN###",
    letzteAufgabeKiText || "(Noch keine Aufgabe generiert.)",
  );
}

function kopiereKiPrompt() {
  navigator.clipboard
    .writeText(erstelleKiPromptText())
    .then(() => {
      const btn = document.getElementById("kiPromptKopierenBtn");
      if (!btn) return;
      const originalHTML = btn.innerHTML;
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Kopiert!`;
      btn.classList.add("ki-prompt-btn--success");
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.classList.remove("ki-prompt-btn--success");
      }, 2500);
    })
    .catch((err) => {
      console.error("Fehler beim Kopieren:", err);
      zeigeModal(
        "Kopieren nicht möglich. Bitte manuell aus dem Textfeld kopieren.",
      );
    });
}

function toggleKiPromptVorschau() {
  const vorschau = document.getElementById("kiPromptVorschau");
  const btn = document.getElementById("kiPromptToggleBtn");
  if (!vorschau) return;
  const isHidden = getComputedStyle(vorschau).display === "none";
  if (isHidden) {
    vorschau.style.display = "block";
    if (btn) btn.textContent = "Prompt ausblenden ▲";
  } else {
    vorschau.style.display = "none";
    if (btn) btn.textContent = "Prompt anzeigen ▼";
  }
}

// ============================================================================
// INIT
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  const sel = document.getElementById("schwierigkeit");
  if (sel) sel.addEventListener("change", () => generiereAufgabe());
  const zsel = document.getElementById("zeilenAnzahl");
  if (zsel) zsel.addEventListener("change", () => generiereAufgabe());
  generiereAufgabe();
});

window.exportiereMoodle = exportiereMoodle;
