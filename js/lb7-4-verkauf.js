// ============================================================================
// ABSATZ – VERKAUFSBUCHUNGEN (UEFE)
// ============================================================================

let kundeVerkauf = "<i>[Modellunternehmen]</i>";
let yamlDataVerkauf = [];

// ============================================================================
// RABATT
// ============================================================================

const RABATT_SAETZE_V = [5, 10, 15, 20];

// Zielverkaufspreis (= Netto nach Rabatt) wird direkt als Vielfaches von 1000 gewählt.
// UST = Ziel × 0,19 → immer Vielfaches von 190 → leicht im Kopf (z. B. 8.000 × 19% = 1.520)
// Listenpreis wird rückwärts aus Zielverkaufspreis berechnet und auf 100 gerundet.
function genZielUndListenpreisV(rabattProzent) {
  // Listenpreis als Vielfaches von listSchritt wählen → Rabattbetrag ganzzahlig.
  // listSchritt = 100 / gcd(100, rabatt):
  //   5%  → 2000er-Schritte  (Liste*0,05 = ganze Zahl)
  //   10% → 1000er-Schritte
  //   15% → 2000er-Schritte
  //   20% →  500er-Schritte  (wir runden auf 1000 für schönere Zahlen)
  const listSchritt = { 5: 2000, 10: 1000, 15: 2000, 20: 1000 };
  const s = listSchritt[rabattProzent] || 1000;
  const minK = Math.ceil(2000 / s);
  const maxK = Math.floor(20000 / s);
  const liste = (minK + Math.floor(Math.random() * (maxK - minK + 1))) * s;
  const faktor = 1 - rabattProzent / 100;
  // Netto = liste * faktor: ganzzahlig wegen Schrittweiten-Konstruktion
  const netto = Math.round(liste * faktor);
  return { listennetto: liste, nettoBetrag: netto };
}

// ============================================================================
// GESCHÄFTSFALL-DEFINITIONEN
// Nur FO (Verkauf auf Ziel)
// ============================================================================

const alleGfVerkauf = [
  {
    id: "uefe_verkauf_fo",
    typ: "einfach_ust",
    soll: "FO",
    haben: "UEFE",
    belegtyp: "ausgangsrechnung",
    vorlagen: [
      "{kunde} stellt eine Ausgangsrechnung für {artikel} aus",
      "{kunde} liefert {artikel} auf Ziel",
      "{kunde} verkauft {artikel} gegen Rechnung",
      "Von {kunde} werden {artikel} geliefert, eine Rechnung geht an den Kunden",
      "{kunde} sendet eine Rechnung über {artikel} an einen Kunden",
      "{kunde} sendet {artikel} auf Ziel",
      "{kunde} schreibt einem Kunden eine Rechnung über {artikel}",
      "{kunde} beliefert einen Kunden auf Ziel mit {artikel}",
    ],
  },
];

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================

function formatCurrencyV(value) {
  return value.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}
function roundToTwoDecimalsV(num) {
  return Math.round(num * 100) / 100;
}
function pickV(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function parseNumericValueV(value) {
  if (!value) return "0";
  return value.toString().replace(/[€\s]/g, "").replace(/\./g, "").replace(",", ".");
}

// Ohne Rabatt: Nettobetrag als Vielfaches von 1000 → UST = N × 190, leicht im Kopf
function generateNettoOhneRabattV() {
  return (2 + Math.floor(Math.random() * 17)) * 1000; // 2000 … 18000
}

// ============================================================================
// YAML-HILFSFUNKTIONEN
// ============================================================================

function ladeYamlVerkauf() {
  const saved =
    localStorage.getItem("uploadedYamlCompanyData") ||
    localStorage.getItem("standardYamlData");
  if (saved) {
    try {
      yamlDataVerkauf = JSON.parse(saved);
      document.dispatchEvent(new Event("yamlDataVerkaufLoaded"));
      return true;
    } catch (e) { /* ignorieren */ }
  }
  fetch("js/unternehmen.yml")
    .then((r) => (r.ok ? r.text() : Promise.reject()))
    .then((txt) => {
      yamlDataVerkauf = jsyaml.load(txt) || [];
      document.dispatchEvent(new Event("yamlDataVerkaufLoaded"));
    })
    .catch(() => {});
  return false;
}

function fillCompanyDropdownV() {
  if (!yamlDataVerkauf?.length) return;
  const select = document.getElementById("verkaufKunde");
  if (!select) return;
  const sorted = [...yamlDataVerkauf].sort((a, b) => {
    const bA = a.unternehmen?.branche || "", bB = b.unternehmen?.branche || "";
    if (bA !== bB) return bA.localeCompare(bB);
    return (a.unternehmen?.name || "").localeCompare(b.unternehmen?.name || "");
  });
  select.innerHTML = "";
  const ph = document.createElement("option");
  ph.value = ""; ph.text = "— bitte Unternehmen auswählen —";
  ph.disabled = true; ph.selected = true;
  select.appendChild(ph);
  sorted.forEach((c) => {
    const u = c.unternehmen;
    if (!u?.name) return;
    const o = document.createElement("option");
    o.value = u.name;
    o.textContent = u.branche
      ? `${u.branche} – ${u.name} ${u.rechtsform || ""}`.trim()
      : `${u.name} ${u.rechtsform || ""}`.trim();
    select.appendChild(o);
  });
}

function autoSelectMyCompanyV() {
  const name = localStorage.getItem("myCompany");
  if (!name) return;
  const sel = document.getElementById("verkaufKunde");
  if (!sel) return;
  const opt = Array.from(sel.options).find((o) => o.value === name);
  if (opt) {
    sel.value = name;
    kundeVerkauf = name;
    sel.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

// Liefert zufälligen Eintrag aus YAML, der NICHT das eigene Unternehmen ist
function getZufaelligenAbnehmer() {
  if (!yamlDataVerkauf?.length) return { name: "Musterhandel GmbH" };
  const myName = document.getElementById("verkaufKunde")?.value?.trim() || "";
  const andere = yamlDataVerkauf.filter(
    (e) => e.unternehmen?.name && e.unternehmen.name !== myName
  );
  if (!andere.length) return { name: "Musterhandel GmbH" };
  const u = pickV(andere).unternehmen;
  return {
    name: `${u.name} ${u.rechtsform ?? ""}`.trim(),
    strasse: u.adresse?.strasse ?? "",
    plz: u.adresse?.plz ?? "",
    ort: u.adresse?.ort ?? "",
  };
}

// ============================================================================
// TABELLEN-HELPER
// ============================================================================

function tdV(content, align = "left", minW = 140) {
  return `<td style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:${minW}px;min-width:${minW}px;text-align:${align}" tabindex="1">${content}</td>`;
}
function tdCV(content) {
  return `<td style="text-align:center;width:100px;white-space:nowrap;min-width:40px" tabindex="1">${content}</td>`;
}
function tableWrapV(rowsHTML) {
  return `<table style="border:1px solid #ccc;white-space:nowrap;background-color:#fff;font-family:courier;width:600px;margin:0 0 0px"><tbody>${rowsHTML}</tbody></table>`;
}

// ============================================================================
// BUCHUNGSSATZ + NEBENRECHNUNG
//
//   FO  | Brutto  | an | UEFE | Netto
//       |         |    | UST  | UST
// ============================================================================

function bsEinfachUstV(gf) {
  const {
    sollKto, habenKto,
    nettoBetrag, Umsatzsteuer, bruttoBetrag,
    rabatt, rabattProzent,
    listennetto, listenbrutto, rabattBetrag,
    angabeIstBrutto,
  } = gf;

  // "an" + UEFE beginnen bereits in Zeile 1
  const bs = tableWrapV(
    `<tr>${tdV(sollKto)}${tdV(formatCurrencyV(bruttoBetrag), "right")}${tdCV("an")}${tdV(habenKto)}${tdV(formatCurrencyV(nettoBetrag), "right")}</tr>` +
    `<tr>${tdV("")}${tdV("", "right")}${tdCV("")}${tdV("UST")}${tdV(formatCurrencyV(Umsatzsteuer), "right")}</tr>`,
  );

  // ── Nebenrechnung ─────────────────────────────────────────────────────────
  function opRow(label, op, betrag) {
    return `<tr>
      <td style="padding:1px 10px 1px 2px;color:#444;">${label}</td>
      <td style="padding:1px 0;text-align:right;font-family:courier;color:#444;" colspan="2">${op}&nbsp;${formatCurrencyV(betrag)}</td>
    </tr>`;
  }
  function resRow(label, betrag) {
    return `<tr style="border-top:1px solid #aaa;">
      <td style="padding:2px 10px 2px 0;">${label}</td>
      <td style="padding:1px 0;text-align:right;font-family:courier;" colspan="2">${formatCurrencyV(betrag)}</td>
    </tr>`;
  }
  function startRow(label, betrag) {
    return `<tr>
      <td style="padding:2px 10px 2px 0;">${label}</td>
      <td style="padding:1px 0;text-align:right;font-family:courier;" colspan="2">${formatCurrencyV(betrag)}</td>
    </tr>`;
  }

  let rows = "";
  if (rabatt) {
    rows =
      startRow("Listenverkaufspreis netto", listennetto) +
      opRow(`- Rabatt ${rabattProzent} %`, "", rabattBetrag) +
      resRow("Zielverkaufspreis", nettoBetrag) +
      opRow("+ Umsatzsteuer (19 %)", "+", Umsatzsteuer) +
      resRow("Rechnungsbetrag", bruttoBetrag);
  } else if (!rabatt && angabeIstBrutto) {
    rows =
      startRow("Rechnungsbetrag", bruttoBetrag) +
      opRow("- Umsatzsteuer (19 %)", "", Umsatzsteuer) +
      resRow("Verkaufspreis netto", nettoBetrag);
  } else {
    rows =
      startRow("Verkaufspreis netto", nettoBetrag) +
      opRow("+ Umsatzsteuer (19 %)", "+", Umsatzsteuer) +
      resRow("Rechnungsbetrag", bruttoBetrag);
  }

  const nebenrechnung = `<div style="margin:12px 0 12px 0">
    <div style="font-size:14px;color:#666;margin-bottom:3px;font-style:italic">Nebenrechnung:</div>
    <table style="border-collapse:collapse;font-size:13px;color:#333;min-width:280px">
      <tbody>${rows}</tbody>
    </table>
  </div>`;

  return bs + nebenrechnung;
}

// ============================================================================
// GESCHÄFTSFALL GENERIEREN
// ============================================================================

function genReNrV() {
  return Math.floor(100 + Math.random() * 9900);
}

function getProduktbezeichnung() {
  const val = document.getElementById("produktBezeichnung")?.value?.trim();
  return val || "Fertigerzeugnisse";
}

function erstelleZufallsGeschaeftsfallV() {
  const mitRabattOpt = document.getElementById("optMitRabattV").checked;
  const ustAngegeben = document.getElementById("optUstAngegeben")?.checked ?? false;

  const typ = alleGfVerkauf[0];
  const produktname = getProduktbezeichnung();
  const abnehmerObj = getZufaelligenAbnehmer();

  // ── Betrag ────────────────────────────────────────────────────────────────
  // Zielverkaufspreis immer Vielfaches von 1000 → UST = Ziel × 190 (leicht im Kopf, z. B. 8.000 × 19 % = 1.520)
  const mitRabatt = mitRabattOpt;
  const rabattProzent = mitRabatt ? pickV(RABATT_SAETZE_V) : 0;

  let listennetto, nettoBetrag;
  if (mitRabatt) {
    // Zielverkaufspreis direkt wählen, Listenpreis rückwärts berechnen
    const betraege = genZielUndListenpreisV(rabattProzent);
    listennetto = betraege.listennetto;
    nettoBetrag = betraege.nettoBetrag;
  } else {
    // Ohne Rabatt: Netto direkt als Vielfaches von 1000
    nettoBetrag = generateNettoOhneRabattV();
    listennetto = nettoBetrag;
  }

  const rabattBetrag = listennetto - nettoBetrag;
  const Umsatzsteuer = nettoBetrag * 19 / 100; // ganzzahlig: 1000er * 0,19 = x10
  const bruttoBetrag = nettoBetrag + Umsatzsteuer;
  const listenbrutto = listennetto + Math.round(listennetto * 0.19);

  // Bei Rabatt: immer Netto-Angabe (Brutto+Rabatt-Kombination wäre didaktisch verwirrend)
  // Ohne Rabatt: zufällig netto oder brutto
  const angabeIstBrutto = mitRabatt ? false : Math.random() < 0.5;
  const rabattFormulierungen = [
    `${formatCurrencyV(listennetto)} netto, mit einem Rabatt von ${rabattProzent}\u00a0%`,
    `netto ${formatCurrencyV(listennetto)}. Es wird ein Rabatt von ${rabattProzent}\u00a0% gewährt`,
    `${formatCurrencyV(listennetto)} netto (abzüglich ${rabattProzent}\u00a0% Rabatt)`,
    `netto ${formatCurrencyV(listennetto)}, abzüglich ${rabattProzent}\u00a0% Rabatt`,
  ];
  const nettoFormulierungen = [
    `Verkaufspreis netto: ${formatCurrencyV(nettoBetrag)}`,
    `Nettobetrag: ${formatCurrencyV(nettoBetrag)}`,
    `Listenpreis netto: ${formatCurrencyV(nettoBetrag)}`,
  ];
  const bruttoFormulierungen = [
    `Rechnungsbetrag: ${formatCurrencyV(bruttoBetrag)}`,
    `Bruttobetrag: ${formatCurrencyV(bruttoBetrag)}`,
    `Rechnungsbetrag: ${formatCurrencyV(bruttoBetrag)}`,
  ];

  let betragText;
  if (mitRabatt) {
    betragText = pickV(rabattFormulierungen);
  } else {
    betragText = angabeIstBrutto
      ? pickV(bruttoFormulierungen)
      : pickV(nettoFormulierungen);
  }

  const ustFormulierungen = [
    `Die Umsatzsteuer beträgt ${formatCurrencyV(Umsatzsteuer)}.`,
    `Umsatzsteuer (19\u00a0%): ${formatCurrencyV(Umsatzsteuer)}.`,
    `Der Umsatzsteuerbetrag liegt bei ${formatCurrencyV(Umsatzsteuer)}.`,
  ];
  const ustHinweis = ustAngegeben ? ` ${pickV(ustFormulierungen)}` : "";

  const vorlagenIdx = Math.floor(Math.random() * typ.vorlagen.length);
  const textVorlage = typ.vorlagen[vorlagenIdx]
    .replace("{kunde}", kundeVerkauf)
    .replace("{artikel}", produktname);

  // Variation der Betragseinleitung
  const betragsEinleitungen = [
    "in Höhe von",
    "zum Betrag von",
    "mit einem Gesamtbetrag von",
    "mit einem Betrag von",
    "in Höhe von",   // doppelt gewichtet, da am natürlichsten
  ];
  // "mit einem Rechnungsbetrag von" passt nicht bei netto-Angabe → nur bei brutto oder ohne Rabatt
  const nurBrutto = angabeIstBrutto && !mitRabatt;
  const einleitungPool = nurBrutto
    ? betragsEinleitungen
    : betragsEinleitungen.filter(e => !e.includes("Rechnungsbetrag"));
  const einleitung = pickV(einleitungPool);

  const geschaeftsfallText = `${textVorlage} ${einleitung} ${betragText}.${ustHinweis}`;

  return {
    text: geschaeftsfallText,
    typ,
    abnehmerObj,
    produktname,
    artikelBelegName: produktname,
    einheit: "Stk",
    sollKto: typ.soll,
    habenKto: typ.haben,
    rabatt: mitRabatt,
    rabattProzent,
    listennetto,
    listenbrutto,
    rabattBetrag,
    nettoBetrag,
    Umsatzsteuer,
    bruttoBetrag,
    angabeIstBrutto,
  };
}

// ============================================================================
// BUCHUNGSSATZ DISPATCHER
// ============================================================================

function erstelleBuchungssatzV(gf) {
  return bsEinfachUstV(gf);
}

// ============================================================================
// BELEG-URL + BUTTON
// ============================================================================

function erstelleBelegURL(gf) {
  const params = new URLSearchParams();
  const now = new Date();
  const tag   = String(now.getDate()).padStart(2, "0");
  const monat = String(now.getMonth() + 1).padStart(2, "0");
  const jahr  = String(now.getFullYear());
  const kv = document.getElementById("verkaufKunde")?.value?.trim() || "";

  params.set("beleg", "rechnung");
  if (kv) params.set("lieferer", kv);
  params.set("kunde", gf.abnehmerObj.name);

  if (gf.rabatt) {
    params.set("artikel1",    gf.artikelBelegName);
    params.set("menge1",      "1");
    params.set("einheit1",    gf.einheit || "Stk");
    params.set("einzelpreis1", parseNumericValueV(formatCurrencyV(gf.listennetto)));
    params.set("rabatt",      gf.rabattProzent);
  } else {
    params.set("artikel1",    gf.artikelBelegName);
    params.set("menge1",      "1");
    params.set("einheit1",    gf.einheit || "Stk");
    params.set("einzelpreis1", parseNumericValueV(formatCurrencyV(gf.nettoBetrag)));
  }

  params.set("umsatzsteuer", "19");
  params.set("tag",          tag);
  params.set("monat",        monat);
  params.set("jahr",         jahr);
  params.set("zahlungsziel", "30");
  params.set("skonto",       "2");
  params.set("skontofrist",  "20");

  return `belege.html?${params.toString()}`;
}

function erstelleBelegButtonV(nummer, gf) {
  const url = erstelleBelegURL(gf);
  return `<button class="geschaeftsfall-beleg-button"
    onclick="window.open('${url}', '_blank')"
    title="Ausgangsrechnung für Aufgabe ${nummer} erstellen"
    style="width:100%;padding:10px 12px;font-size:14px;margin-bottom:8px;">
    📄 ${nummer}. Ausgangsrechnung erstellen</button>`;
}

// ============================================================================
// HAUPTFUNKTION
// ============================================================================

function zeigeZufaelligeGeschaeftsfaelleV() {
  const anzahl = parseInt(document.getElementById("anzahlDropdownV").value);
  const container   = document.getElementById("Container");
  const buttonColumn = document.getElementById("button-columnV");
  if (!container || !buttonColumn) return;
  container.innerHTML   = "";
  buttonColumn.innerHTML = "";

  let aufgabenHTML  = "<h2>Aufgaben</h2><ol>";
  let loesungenHTML = "<h2>Lösung</h2>";
  const liste = [];
  for (let i = 0; i < anzahl; i++) liste.push(erstelleZufallsGeschaeftsfallV());

  liste.forEach((gf, idx) => {
    const i = idx + 1;
    aufgabenHTML  += `<li>${gf.text}</li>`;
    loesungenHTML += `<div style="margin-top:1.5em"><strong>${i}.</strong><br>${erstelleBuchungssatzV(gf)}</div>`;
    const div = document.createElement("div");
    div.style.margin = "12px 0";
    div.innerHTML = erstelleBelegButtonV(i, gf);
    buttonColumn.appendChild(div);
  });

  aufgabenHTML += "</ol>";
  container.innerHTML = aufgabenHTML + loesungenHTML;
}

// ============================================================================
// KI-ASSISTENT PROMPT
// ============================================================================

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher, geduldiger Buchführungs-Assistent speziell für Schüler der Realschule im Fach BwR (Jahrgangsstufe 7).

Deine einzige Aufgabe:
Du hilfst Schülern, Absatzbuchungen (Verkäufe) selbstständig zu verstehen und zu lösen – ohne ihnen die Lösung abzunehmen.

Wichtige Regeln (streng einhalten!):
- Gib **KEINE** fertigen Buchungssätze, KEINE Beträge, KEINE Konten und KEINE fertigen Nebenrechnungen vor.
- Sage dem Schüler **nie**, welches Konto (FO, UEFE, UST etc.) er verwenden soll.
- Gib keine Hinweise wie „Denk an die Umsatzsteuer“ oder „FO kommt ins Soll“.
- Führe den Schüler ausschließlich durch **gezielte, offene Fragen** und kurze Denkanstöße.
- Warte immer auf die Antwort des Schülers, bevor du die nächste Frage stellst.
- Bei Fehlern erkläre das zugrundeliegende Prinzip, ohne die richtige Buchung zu nennen oder vorzurechnen.

Pädagogischer Ablauf (genau so beginnen):
1. Begrüße den Schüler freundlich und frage direkt nach einem konkreten Geschäftsfall.
   Beispiel: „Hallo! ✅ Toll, dass du den Verkauf üben möchtest. Hast du einen Geschäftsfall zum Absatz / Verkauf, den wir gemeinsam durchgehen können? Schick ihn mir einfach.“

2. Sobald der Schüler einen Geschäftsfall geschickt hat, stelle die Fragen nacheinander (nicht in einer Antwort):
   - Stelle zuerst die Frage: „Um was für einen Verkauf handelt es sich? (z. B. Verkauf von Fertigerzeugnissen)“
   - Frage dann: „Wird auf Ziel (per Rechnung) verkauft oder sofort bar/per Bank?“
   - Frage weiter: „Welche Konten könnten hier deiner Meinung nach benötigt werden?“
   - Lass den Schüler selbst entscheiden, welche Konten ins Soll und welche ins Haben kommen.
   - Frage gezielt nach Rabatt: „Gibt es einen Rabatt? Was machst du mit dem Rabatt bei der Berechnung?“
   - Stelle Fragen zu den Berechnungen: „Worauf berechnest du die Umsatzsteuer?“ oder „Welchen Betrag trägst du bei den Umsatzerlösen ein?“
   - Es wird nur dieser Geschäftsfall gebucht, kein anderer! Nur aus dem Geschäftsfall wird der Buchungssatz abgeleitet.

Konten (nur durch Fragen klären, nicht nennen oder erklären):
- FO – Forderungen aus Lieferungen und Leistungen (Verkauf auf Ziel)
- UEFE – Umsatzerlöse aus Fertigerzeugnissen (Nettobetrag nach Rabatt)
- UST – Umsatzsteuer (19 % auf den Nettobetrag nach Rabatt)

Buchungslogik (nur durch Fragen herausfinden lassen):
Verkauf auf Ziel: Aktivkonto (FO) im Soll, Ertragskonto (UEFE) und Passivkonto (UST) im Haben.
Rabatt wird NICHT gebucht – er wird nur in der Nebenrechnung abgezogen. Immer der Nettobetrag nach Rabatt zählt für UEFE und UST.

Tonalität:
- Sehr freundlich, motivierend und kurz (max. 1–2 Sätze pro Nachricht)
- Verwende gelegentlich passende Emojis: 📦 ✅ ❓ 👍 💰
- Sprich den Schüler direkt an („du“)
- Loben, wenn er etwas gut gemacht hat: „Genau richtig überlegt!“ oder „Super Ansatz!“

Wichtige Verbote:
- Nenne niemals selbst einen Buchungssatz oder Teile davon.
- Rechne keine Beträge vor und gib keine fertigen Nebenrechnungen.
- Korrigiere Fehler nicht direkt, sondern stelle eine Frage, die den Schüler zum Nachdenken bringt (z. B. „Warum hast du den Bruttobetrag bei den Erlösen eingetragen? Worauf wird die Umsatzsteuer eigentlich berechnet?“).
- Verwechsle niemals VORST (Einkauf) mit UST (Verkauf) – falls der Schüler das tut, lenke durch Fragen zurück.

Am Ende einer erfolgreich gelösten Übung:
- Frage immer: „Möchtest du noch einen anderen Geschäftsfall zum Verkauf üben? Dann schick mir einfach den nächsten!“

Du wartest stets auf die Eingabe des Schülers und gibst nichts vor. Dein Ziel ist es, dass der Schüler die Buchung selbst findet und versteht.
`;

function kopiereKiPromptV() {
  navigator.clipboard
    .writeText(KI_ASSISTENT_PROMPT)
    .then(() => {
      const btn = document.getElementById("kiPromptKopierenBtnV");
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
  const vorschau = document.getElementById("kiPromptVorschau");
  const btn = document.getElementById("kiPromptToggleBtn");
  const isHidden = getComputedStyle(vorschau).display === "none";
  if (isHidden) {
    vorschau.style.display = "block";
    btn.textContent = "Vorschau ausblenden ▲";
  } else {
    vorschau.style.display = "none";
    btn.textContent = "Prompt anzeigen ▼";
  }
}

// ============================================================================
// INITIALISIERUNG
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  const sel = document.getElementById("verkaufKunde");
  if (sel)
    sel.addEventListener("change", () => {
      kundeVerkauf = sel.value.trim() || "<i>[Modellunternehmen]</i>";
    });

  const vorschau = document.getElementById("kiPromptVorschau");
  if (vorschau) vorschau.textContent = KI_ASSISTENT_PROMPT;

  document.addEventListener(
    "yamlDataVerkaufLoaded",
    () => {
      fillCompanyDropdownV();
      setTimeout(autoSelectMyCompanyV, 100);
      setTimeout(zeigeZufaelligeGeschaeftsfaelleV, 200);
    },
    { once: true },
  );

  ladeYamlVerkauf();

  if (yamlDataVerkauf?.length) {
    fillCompanyDropdownV();
    setTimeout(autoSelectMyCompanyV, 100);
    setTimeout(zeigeZufaelligeGeschaeftsfaelleV, 200);
  }
});