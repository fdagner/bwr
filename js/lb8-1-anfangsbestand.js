// ============================================================================
// ANFANGSBESTAND INS T-KONTO EINTRAGEN – Aufgaben-Generator
// BwR Realschule Bayern, Klasse 8
//
// Ablauf:
//  1. Zufällige Bilanz (wie lb7-3-bilanz7.html, OHNE Vorräte) erzeugen
//  2. Zufällig EIN Aktivkonto und EIN Passivkonto auswählen
//  3. Aufgabe: zwei leere T-Kontos mit Kontobezeichnung (Layout wie
//     lb8-1-erfolgskonten.html: .tkonto / .tkonto-grid / Druck-CSS)
//  4. Lösung: AB + Betrag im SOLL (Aktivkonto) bzw. im HABEN (Passivkonto)
// ============================================================================

// ── Konten: zentral aus dem Kontenplan (js/utils.js) bezogen ────────────────
// Nur Kontonummern angeben – Abkürzung und Langname übernimmt der Kontenplan.
const AKTIV_KONTEN = [
  "0500",
  "0530",
  "0700",
  "0840",
  "0860",
  "0870",
  "2400",
  "2800",
  "2880",
];
const PASSIV_KONTEN = ["4200", "4250", "4400"];

// ── Bilanz-Generierung (ohne Vorräte, wie lb7-3-bilanz7.html) ───────────────

const BILANZ_RANGEBEN = {
  "0500": { min: 200000, max: 550000 }, // GR
  "0530": { min: 500000, max: 2000000 }, // BVG
  "0700": { min: 10000, max: 200000 }, // MA
  "0840": { min: 10000, max: 100000 }, // FP
  "0860": { min: 5000, max: 20000 }, // BM
  "0870": { min: 10000, max: 50000 }, // BGA
  2400: { min: 2000, max: 300000 }, // FO
  2800: { min: 40000, max: 400000 }, // BK
  2880: { min: 1000, max: 15000 }, // KA
  4200: { min: 1000, max: 50000 }, // KBKV
  4250: { min: 50000, max: 200000 }, // LBKV
  4400: { min: 5000, max: 50000 }, // VE
};

function generateRandomBestand(min, max) {
  // Wie bilanz7: auf glatte 5.000er runden
  const randomValue = Math.ceil(Math.random() * (max - min + 1)) + min;
  return Math.ceil(randomValue / 5000) * 5000;
}

function erstelleZufaelligeBilanz() {
  const salden = {};
  for (const [nr, { min, max }] of Object.entries(BILANZ_RANGEBEN)) {
    salden[nr] = generateRandomBestand(min, max);
  }

  const summeAktiv = AKTIV_KONTEN.reduce((s, nr) => s + salden[nr], 0);
  const summeFremdkapital = PASSIV_KONTEN.reduce((s, nr) => s + salden[nr], 0);
  const eigenkapital = summeAktiv - summeFremdkapital;

  salden["3000"] = eigenkapital; // 3000 EK als Restgröße (nur im Bilanz-Kontext gezeigt)

  return {
    salden,
    summeAktiv,
    summePassiv: summeFremdkapital + eigenkapital,
    eigenkapital,
  };
}

// ── Kontenauswahl ───────────────────────────────────────────────────────────

function waehleZufallsKonten() {
  const aktivNr = pick(AKTIV_KONTEN);
  let passivNr = pick(PASSIV_KONTEN);
  // optionally: Konten dürfen gleich häufig erscheinen; nothing to force
  return { aktivNr, passivNr };
}

// ── T-Konto Renderer (Layout aus lb8-1-erfolgskonten.html) ─────────────────

const formatBetrag2 = (v) =>
  v.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function tkKopf(kontoLabelTitel) {
  return `<table class="tkonto" style="border-collapse:collapse;width:100%;min-width:470px;background:#fff;font-size:1.0em;table-layout:fixed;">
    <thead><tr>
      <th style="width:25%;text-align:left;font-weight:600;padding:4px 0;">Soll</th>
      <th style="text-align:center;font-size:1.0em;padding:4px 0;" colspan="2"><span style="font-weight:700;">${kontoLabelTitel}</span></th>
      <th style="width:25%;text-align:right;font-weight:600;padding:4px 0;">Haben</th>
    </tr></thead><tbody>`;
}

function tkZeile(sLabel, sBetrag, hLabel, hBetrag) {
  const fmt = (b) =>
    b === null || b === undefined || b === "" ? "&nbsp;" : formatBetrag2(b);
  const lbl = (l) => (!l ? "&nbsp;" : l);
  return `<tr style="border-top:2px solid #ccc;">
    <td style="width:25%;padding:3px 2px;white-space:nowrap;">${lbl(sLabel)}</td>
    <td style="width:25%;text-align:right;padding:3px 4px 3px 2px;border-right:2px solid #999;min-width:100px;height:1.8em;">${fmt(sBetrag)}</td>
    <td style="width:25%;padding:3px 2px 3px 6px;min-width:100px;">${lbl(hLabel)}</td>
    <td style="width:25%;text-align:right;padding:3px 2px;min-width:100px;">${fmt(hBetrag)}</td>
  </tr>`;
}

function tkSumme(sSumme, hSumme) {
  return `<tr style="border-top:2px solid #888;border-bottom:4px double #888;">
    <td style="padding:3px 2px;"></td>
    <td style="text-align:right;padding:3px 4px;border-right:2px solid #999;font-weight:700;">${sSumme === null ? "&nbsp;" : formatBetrag2(sSumme)}</td>
    <td style="padding:3px 2px 3px 6px;"></td>
    <td style="text-align:right;padding:3px 2px;font-weight:700;">${hSumme === null ? "&nbsp;" : formatBetrag2(hSumme)}</td>
  </tr></tbody></table>`;
}

function tkLeerzeilen(anz) {
  let z = "";
  for (let i = 0; i < anz; i++) {
    z += tkZeile("", "", "", "");
  }
  return z;
}

// ── Bilanz-Tabelle (exakt im Layout von lb7-3-bilanz7.html, ohne Vorräte) ───

function renderBilanzTabelle(bilanz) {
  const cellLabel = 'style="width:25%;"';
  const cellWert = 'style="width:25%;text-align:right;padding-right: 4px;"';
  const cellPassiv =
    'style="width:25%;border-left: 1px solid #AAAAAA;padding-left: 6px;"';
  const leerWert = 'style="width:25%;text-align:right;padding-right: 4px;"';
  const leerPassiv =
    'style="width:25%;border-left: 1px solid #AAAAAA;padding-left: 6px;"';
  const leerWertFirst =
    'style="width:25%;text-align:right;padding-right: 4px;"';
  return `
<table style="border-collapse: collapse;font-family:calibri;background-color:#fff;width:700px;min-width: 700px;table-layout:fixed;line-height:1;">
  <tbody>
    <tr style="background-color: #ccc;">
      <th style="width:25%;text-align:left;padding-left:6px;">Aktiva</th>
      <th colspan="2" style="text-align:center;">Eröffnungsbilanz&nbsp;1. Januar</th>
      <th style="width:25%;text-align:right;padding-right:6px">Passiva</th>
    </tr>
    <tr style="border-top: 1px solid #AAAAAA;">
      <td style="width:25%"><b>I. Anlagevermögen</b></td>
      <td ${leerWert}></td>
      <td ${cellPassiv}><b>I. Eigenkapital</b></td>
      <td ${cellWert}>${formatCurrency(bilanz.eigenkapital)}</td>
    </tr>
    <tr style="border-top: 1px solid #AAAAAA;">
      <td ${cellLabel}>Grundstücke</td>
      <td ${cellWert}>${formatCurrency(bilanz.salden["0500"])}</td>
      <td ${cellPassiv}><b>II. Fremdkapital</b></td>
      <td ${cellWert}></td>
    </tr>
    <tr style="border-top: 1px solid #AAAAAA;">
      <td ${cellLabel}>Betriebs- und Verwaltungsgebäude</td>
      <td ${cellWert}>${formatCurrency(bilanz.salden["0530"])}</td>
      <td ${cellPassiv}>Langfristige Bankverbindlichkeiten
      </td>
      <td ${cellWert}>${formatCurrency(bilanz.salden["4250"])}</td>
    </tr>

    <tr style="border-top: 1px solid #AAAAAA;">
      <td ${cellLabel}>Maschinen und Anlagen</td>
      <td ${cellWert}>${formatCurrency(bilanz.salden["0700"])}</td>
      <td ${cellPassiv}>Kurzfristige Bankverbindlichkeiten
      </td>
      <td ${cellWert}>${formatCurrency(bilanz.salden["4200"])}</td>
    </tr>

    <tr style="border-top: 1px solid #AAAAAA;">
      <td ${cellLabel}>Fuhrpark</td>
      <td ${cellWert}>${formatCurrency(bilanz.salden["0840"])}</td>
      <td ${cellPassiv}>Verbindlichkeiten a. LL.
      </td>
      <td ${cellWert}>${formatCurrency(bilanz.salden["4400"])}</td>
    </tr>

    <tr style="border-top: 1px solid #AAAAAA;">
      <td ${cellLabel}>Büromaschinen</td>
      <td ${cellWert}>${formatCurrency(bilanz.salden["0860"])}</td>
      <td ${cellPassiv}></td>
      <td ${cellWert}></td>
    </tr>

    <tr style="border-top: 1px solid #AAAAAA;">
      <td ${cellLabel}>Büromöbel- und Geschäftsausst.</td>
      <td ${cellWert}>${formatCurrency(bilanz.salden["0870"])}</td>
      <td ${cellPassiv}></td>
      <td ${cellWert}></td>
    </tr>
    <tr style="border-top: 1px solid #AAAAAA;">
      <td ${cellLabel}><b>II. Umlaufvermögen</b></td>
      <td ${leerWertFirst}></td>
      <td ${cellPassiv}></td>
      <td ${cellWert}></td>
    </tr>

    <tr style="border-top: 1px solid #AAAAAA;">
      <td ${cellLabel}>Forderungen an Kunden</td>
      <td ${cellWert}>${formatCurrency(bilanz.salden["2400"])}</td>
      <td ${cellPassiv}></td>
      <td ${cellWert}></td>
    </tr>

    <tr style="border-top: 1px solid #AAAAAA;">
      <td ${cellLabel}>Bank</td>
      <td ${cellWert}>${formatCurrency(bilanz.salden["2800"])}</td>
      <td ${cellPassiv}></td>
      <td style="text-align:right;"></td>
    </tr>

    <tr style="border-top: 1px solid #AAAAAA;">
      <td ${cellLabel}>Kasse</td>
      <td style="text-align:right;padding-right: 2px;">${formatCurrency(bilanz.salden["2880"])}</td>
      <td ${cellPassiv}></td>
      <td ${cellWert}></td>
    </tr>

    <tr style="border-bottom: 6px double #AAAAAA;border-top: 2px solid #AAAAAA;">
      <td style="width:25%"></td>
      <td style="text-align:right;padding-right: 2px;font-weight:bold">${formatCurrency(bilanz.summeAktiv)}</td>
      <td style="border-left: 1px solid #AAAAAA;padding-left: 6px;padding-right: 4px;"></td>
      <td style="text-align:right;padding-right: 4px;font-weight:bold">${formatCurrency(bilanz.summeAktiv)}</td>
    </tr>
  </tbody>
</table>`;
}

// ── HAUPTFUNKTION ───────────────────────────────────────────────────────────

function zeigeZufaelligenAnfangsbestand() {
  const container = document.getElementById("Container");
  if (!container) return;
  container.innerHTML = "";

  const bilanz = erstelleZufaelligeBilanz();
  const { aktivNr, passivNr } = waehleZufallsKonten();
  const aktivBetrag = bilanz.salden[aktivNr];
  const passivBetrag = bilanz.salden[passivNr];
  const zeilenAnzahl = 2;

  letzteAnfangsbestandAufgabe = { bilanz, aktivNr, passivNr };

  // ── Aufgabe ───────────────────────────────────────────────────────────────
  let html = "<h2>Es liegt die folgende Bilanz vor</h2>";
  html += `<h3>Eröffne die T-Konten <strong>${kontoLabel(aktivNr)}</strong> und <strong>${kontoLabel(passivNr)}</strong>.</h3>`;

  html += renderBilanzTabelle(bilanz);
  html += `<div class="tkonto-grid" style="margin-top:1.6em;">`;

  html += `<div class="tkonto-cell" style="margin-top:20px;">${tkKopf(
    kontoLabel(aktivNr),
  )}${tkLeerzeilen(zeilenAnzahl)}</tbody></table></div>`;

  html += `<div class="tkonto-cell" style="margin-top:20px;">${tkKopf(
    kontoLabel(passivNr),
  )}${tkLeerzeilen(zeilenAnzahl)}</tbody></table></div>`;

  html += `</div>`;

  // ── Lösung ────────────────────────────────────────────────────────────────
  html += `<h2 class="loesung" style="margin-top:2.5em">Lösung</h2>`;

  html += `<div class="tkonto-grid">`;
  html += `<div class="tkonto-cell">${tkKopf(kontoLabel(aktivNr))}${tkZeile("AB", formatCurrency(aktivBetrag), "", "")}${tkLeerzeilen(1)}</tbody></table></div>`;
  html += `<div class="tkonto-cell">${tkKopf(kontoLabel(passivNr))}${tkZeile("", "", "AB", formatCurrency(passivBetrag))}${tkLeerzeilen(1)}</tbody></table></div>`;
  html += `</div>`;

  container.innerHTML = html;

  const vorschau = document.getElementById("kiPromptVorschau");
  if (vorschau && vorschau.style.display !== "none") {
    vorschau.textContent = erstelleKiPromptText();
  }
}

// ── KI-PROMPT ───────────────────────────────────────────────────────────────

let letzteAnfangsbestandAufgabe = null;

function plainBilanzText(bilanz) {
  const zeile = (bez, betrag) =>
    `  ${bez.padEnd(45, " ")} ${formatBetrag2(betrag)} €`;
  const ausgabe = ["  Bilanz (Mittelverwendung ⇔ Kapitalherkunft)"];
  AKTIV_KONTEN.forEach((nr) =>
    ausgabe.push(
      `  ${kontoLabel(nr).padEnd(40, " ")} ${formatBetrag2(bilanz.salden[nr])} €`,
    ),
  );
  ausgabe.push(`  Summe Aktivseite: ${formatBetrag2(bilanz.summeAktiv)} €`);
  ausgabe.push("");
  PASSIV_KONTEN.forEach((nr) =>
    ausgabe.push(
      `  ${kontoLabel(nr).padEnd(40, " ")} ${formatBetrag2(bilanz.salden[nr])} €`,
    ),
  );
  ausgabe.push(
    `  ${kontoLabel("3000")} (Restgröße): ${formatBetrag2(bilanz.eigenkapital)} €`,
  );
  ausgabe.push(`  Summe Passivseite: ${formatBetrag2(bilanz.summePassiv)} €`);
  return ausgabe.join("\n");
}

const KI_ASSISTENT_PROMPT_TEMPLATE = `
Du bist ein freundlicher Buchführungs-Assistent für Schüler der Realschule (BwR), 8. Klasse. Du hilfst beim Verständnis von Eröffnungsbuchungen ins T-Konto – speziell beim Eintragen des Anfangsbestands (AB) in Aktiv- und Passivkonten.

Aufgabe:
- Gib KEINE fertigen Lösungen (Soll/Haben-Seite oder Betragsplatzierung) vor.
- Führe die Schüler durch gezielte Fragen und Hinweise zur richtigen Lösung.
- Ziel: Lernförderung, nicht das Abnehmen der Denkarbeit.

Pädagogischer Ansatz:
- Frage, auf welcher Bilanzseite das jeweilige Konto steht.
- Stelle gezielte Rückfragen, um den Stand des Schülers zu verstehen.
- Beantworte deine Rückfragen nicht selbst – hake bei falschen Antworten nach.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Erst wenn der Schüler selbst zur richtigen Seite (Soll/Haben) und zum richtigen Betrag gefunden hat, bestätige die Lösung.

Methodik bei Rückfragen:
- Auf welcher Bilanzseite steht das Konto? (Aktivseite → Aktivkonto, Passivseite → Passivkonto)
- Welche Seite des T-Kontos entspricht der Bilanzseite des jeweiligen Kontos?
- Wozu gehört der Anfangsbestand – zum Bestand des Kontos oder zu einem Umsatz?
- Welcher Betrag ist der Anfangsbestand für das jeweilige Konto?

Regeln für den AB im T-Konto (nur für dich, nicht verraten):
- Aktivkonten (Sachanlagen, Forderungen, Bank, Kasse): AB steht im SOLL.
- Passivkonten (KBKV, LBKV, VE): AB steht im HABEN.
- Betrag: aus der Bilanz ablesen, Kontowert übernehmen (kein Umrechnen, keine Prozente).

###AUFGABEN und LÖSUNGEN###
`;

function erstelleKiPromptText() {
  if (!letzteAnfangsbestandAufgabe) {
    return KI_ASSISTENT_PROMPT_TEMPLATE.replace(
      "###AUFGABEN und LÖSUNGEN###",
      "(Noch keine Aufgabe generiert. Bitte zuerst „Neue Aufgabe erstellen“ klicken.)",
    );
  }
  const { bilanz, aktivNr, passivNr } = letzteAnfangsbestandAufgabe;
  const kontext = `Bilanz: ${plainBilanzText(bilanz)}
Aktivkonto für AB: ${kontoLabel(aktivNr)} → AB ${formatBetrag2(bilanz.salden[aktivNr])} € im SOLL
Passivkonto für AB: ${kontoLabel(passivNr)} → AB ${formatBetrag2(bilanz.salden[passivNr])} € im HABEN`;
  return KI_ASSISTENT_PROMPT_TEMPLATE.replace(
    "###AUFGABEN und LÖSUNGEN###",
    kontext,
  );
}

function kopiereKiPrompt() {
  navigator.clipboard
    .writeText(erstelleKiPromptText())
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
    .catch(() => {
      zeigeModal(
        "Kopieren nicht möglich. Bitte manuell aus dem Textfeld kopieren.",
      );
    });
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

// ── DRUCK-CSS (Muster aus lb8-1-erfolgskonten.html) ─────────────────────────

function addPrintCSS() {
  const style = document.createElement("style");
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

    /* ── Druck: exakt 1 Konto pro Spalte, Aufgabe vor Lösung wechseln ───── */
    @media print {
      body * { visibility: hidden; }
      #Container, #Container * { visibility: visible; }
      #Container {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
      #Container h2:first-of-type { page-break-after: avoid; }
      #Container h2.loesung {
        page-break-before: always !important;
        margin-top: 60px !important;
      }
      .tkonto-grid {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 12px 20px !important;
        width: 100% !important;
        margin: 0.8em 0 1.2em !important;
      }
      .tkonto-cell,
      .tkonto {
        width: 100% !important;
        font-size: 0.9em !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      @page { margin: 1.5cm 0.8cm; }
      h2 { page-break-after: avoid; }
    }
  `;
  document.head.appendChild(style);
}

// ── INITIALISIERUNG ─────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", function () {
  zeigeZufaelligenAnfangsbestand();
  addPrintCSS();

  const vorschauEl = document.getElementById("kiPromptVorschau");
  if (vorschauEl) vorschauEl.textContent = erstelleKiPromptText();
});
