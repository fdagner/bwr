// ============================================================================
// WERKSTOFFE – BESCHAFFUNGSBUCHUNGEN (AWR, AWF, AWH, AWB)
// ============================================================================

let kundeWerkstoffe = "<i>[Modellunternehmen]</i>";
let yamlDataWerkstoffe = [];

// ============================================================================
// KONTEN-DEFINITIONEN
// ============================================================================

// Nur Werkstoffkonten wählbar — VE und BK sind immer aktiv, aber nicht als Option
const kontenWerkstoffe = {
  AWR: { beschreibung: "" },
  AWF: { beschreibung: "" },
  AWH: { beschreibung: "" },
  AWB: { beschreibung: "" },
};

// ============================================================================
// WERKSTOFF-ARTIKEL
// ============================================================================

const werkstoffArtikel = {
  AWR: {
    belegName: "Rohstoffe",
    einheit: "PAL",
    minNetto: 2000,
    maxNetto: 20000,
  },
  AWF: {
    belegName: "Fremdbauteile",
    einheit: "PAL",
    minNetto: 1000,
    maxNetto: 5000,
  },
  AWH: {
    belegName: "Hilfsstoffe",
    einheit: "PAL",
    minNetto: 1000,
    maxNetto: 5000,
  },
  AWB: {
    belegName: "Betriebsstoffe",
    einheit: "CO",
    minNetto: 1000,
    maxNetto: 15000,
  },
};

// AWB-Bezeichnungen – Energie und Betriebsstoffe
const awbBezeichnungen = [
  "Heizöl",
  "Erdgas",
  "Schmieröl",
  "Reinigungsmittel",
  "Strom",
];

// ============================================================================
// FESTE LIEFERANTEN FÜR BELEGE
// ============================================================================

// Hilfsfunktion: Lieferant per Name aus YAML-Daten holen
function getLieferantAusYaml(name) {
  if (!yamlDataWerkstoffe?.length) return null;
  const eintrag = yamlDataWerkstoffe.find((e) => e.unternehmen?.name === name);
  if (!eintrag) return null;
  const u = eintrag.unternehmen;
  return {
    name: `${u.name} ${u.rechtsform ?? ""}`.trim(),
    strasse: u.adresse?.strasse ?? "",
    plz: u.adresse?.plz ?? "",
    ort: u.adresse?.ort ?? "",
    telefon: u.kontakt?.telefon ?? "",
    email: u.kontakt?.email ?? "",
    ust_id: u.ust_id ?? "",
    steuernummer: u.steuernummer ?? "",
    iban: u.iban ?? "",
    bic: u.bic ?? "",
    inhaber: u.inhaber ?? "",
  };
}

function getLieferantFuerGf(konto, awbArt) {
  if (konto === "AWB") {
    if (awbArt === "Strom") return getLieferantAusYaml("EcoEnergie");
    if (["Heizöl", "Erdgas", "Schmieröl"].includes(awbArt))
      return getLieferantAusYaml("EcoFuel");
    // Reinigungsmittel → Werkstoffunion
  }
  // AWR, AWF, AWH → Werkstoffunion
  return getLieferantAusYaml("Werkstoffunion");
}

// ============================================================================
// RABATT
// ============================================================================

const RABATT_SAETZE = [5, 10, 15, 20];

function passeNettoFuerRabattAn(netto, rabattProzent) {
  // Schritt so wählen, dass Bezugspreis (nach Rabatt) ein Vielfaches von 1000 bleibt
  // → VORST (19 %) immer ganzzahlig
  // 5 %:  LP muss Vielfaches von 20·100 = 2000 sein (95 % × 2000 = 1900 ✓)
  // 10 %: LP muss Vielfaches von  1000  sein         (90 % × 1000 =  900 ✓)
  // 20 %: LP muss Vielfaches von  1000  sein         (80 % × 1000 =  800 ✓)
  // Aber 800/900 × 0.19 → Komma! Daher: Bezugspreis auf 1000er halten,
  // d.h. LP muss Vielfaches von 1000/(1−rabatt/100) sein:
  // 5 %: 1000/0.95 ≈ 1053 → nicht schön. Besser: Bezugspreis auf 1000er snappen:
  // → LP so runden, dass LP×(1−r/100) ein Vielfaches von 1000 ist
  // Für 5 %: Schritt = 1000/0.95 → aufrunden auf nächstes sauberes Vielfaches
  // Einfachste Lösung: Bezugspreis berechnen, auf 1000 runden, LP zurückrechnen
  const faktor = 1 - rabattProzent / 100;
  const bezug = Math.round((netto * faktor) / 1000) * 1000;
  return Math.round(bezug / faktor / 1000) * 1000;
}

// ============================================================================
// GESCHÄFTSFALL-DEFINITIONEN
// Nur einfache GF: AWR/AWF/AWH → VE; AWB → VE oder BK (nie beides)
// ============================================================================

const alleGfWerkstoffe = [
  // ── AWR: auf Ziel → VE ───────────────────────────────────────────────────
  {
    id: "awr_kauf_ve",
    typ: "einfach_ust",
    konto: "AWR",
    soll: "AWR",
    haben: "VE",
    kontFilter: ["AWR", "VE"],
    belegtyp: "rechnung",
    vorlagen: [
      "{kunde} kauft Rohstoffe, es geht eine Eingangsrechnung ein",
      "Von {kunde} werden Rohstoffe beschafft, eine Rechnung liegt vor",
      "{kunde} bezieht Rohstoffe gegen Rechnung",
    ],
  },
  // ── AWF: auf Ziel → VE ───────────────────────────────────────────────────
  {
    id: "awf_kauf_ve",
    typ: "einfach_ust",
    konto: "AWF",
    soll: "AWF",
    haben: "VE",
    kontFilter: ["AWF", "VE"],
    belegtyp: "rechnung",
    vorlagen: [
      "Von {kunde} werden Fremdbauteile gekauft, es geht eine Eingangsrechnung ein",
      "{kunde} beschafft Fremdbauteile gegen Rechnung",
      "{kunde} bezieht Fremdbauteile, Rechnung liegt vor",
    ],
  },
  // ── AWH: auf Ziel → VE ───────────────────────────────────────────────────
  {
    id: "awh_kauf_ve",
    typ: "einfach_ust",
    konto: "AWH",
    soll: "AWH",
    haben: "VE",
    kontFilter: ["AWH", "VE"],
    belegtyp: "rechnung",
    vorlagen: [
      "{kunde} kauft Hilfsstoffe, eine Eingangsrechnung geht ein",
      "{kunde} beschafft Hilfsstoffe auf Ziel",
      "Von {kunde} werden Hilfsstoffe bezogen, eine Rechnung liegt vor",
    ],
  },
  // ── AWB: Rechnung → VE ───────────────────────────────────────────────────
  {
    id: "awb_kauf_ve",
    typ: "einfach_ust",
    konto: "AWB",
    soll: "AWB",
    haben: "VE",
    kontFilter: ["AWB", "VE"],
    belegtyp: "rechnung",
    vorlagen: [
      "{kunde} erhält eine Rechnung über {awbArt}",
      "Für {kunde} geht eine Rechnung über {awbArt} ein",
      "{kunde} beschafft {awbArt} auf Ziel, eine Rechnung liegt vor",
    ],
  },
  // ── AWB: Lastschrift/Überweisung → BK ────────────────────────────────────
  {
    id: "awb_kauf_bk",
    typ: "einfach_ust",
    konto: "AWB",
    soll: "AWB",
    haben: "BK",
    kontFilter: ["AWB", "BK"],
    belegtyp: "kontoauszug",
    vorlagen: [
      "{kunde} wird mit {awbArt} beliefert, der Betrag wird per Lastschrift abgebucht",
      "{kunde} bezahlt {awbArt} per Banküberweisung",
      "{kunde} erhält {awbArt}, der Rechnungsbetrag wird per Lastschrift vom Bankkonto abgebucht",
    ],
  },
];

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================

function formatCurrencyW(value) {
  return value.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}
function roundToTwoDecimalsW(num) {
  return Math.round(num * 100) / 100;
}
function roundToW(val, s) {
  return Math.round(val / s) * s;
}
function pickW(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function parseNumericValueW(value) {
  if (!value) return "0";
  return value
    .toString()
    .replace(/[€\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
}

function generateRandomBetragW(min, max) {
  // Immer 1000er-Schritte → VORST (19 %) immer ganzzahlig, leicht im Kopf
  const s = 1000;
  const minR = Math.ceil(min / s) * s;
  const steps = Math.max(1, Math.floor((max - minR) / s));
  return minR + Math.floor(Math.random() * (steps + 1)) * s;
}

// ============================================================================
// TABELLEN-HELPER
// ============================================================================

function tdW(content, align = "left", minW = 140) {
  return `<td style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:${minW}px;min-width:${minW}px;text-align:${align}" tabindex="1">${content}</td>`;
}
function tdCW(content) {
  return `<td style="text-align:center;width:100px;white-space:nowrap;min-width:40px" tabindex="1">${content}</td>`;
}
function tableWrapW(rowsHTML) {
  return `<table style="border:1px solid #ccc;white-space:nowrap;background-color:#fff;font-family:courier;width:600px;margin:0 0 0px"><tbody>${rowsHTML}</tbody></table>`;
}

// ============================================================================
// BUCHUNGSSATZ + NEBENRECHNUNG
// ============================================================================

function bsEinfachW(sollKto, betrag, habenKto) {
  const b = formatCurrencyW(betrag);
  return (
    tableWrapW(
      `<tr>${tdW(sollKto)}${tdW(b, "right")}${tdCW("an")}${tdW(habenKto)}${tdW(b, "right")}</tr>`,
    ) + "<br>"
  );
}

// Buchungssatz — Rabatt erscheint NICHT im Buchungssatz, sondern in der Nebenrechnung
function bsEinfachUstW(gf) {
  const {
    sollKto,
    habenKto,
    nettoBetrag,
    Vorsteuer,
    bruttoBetrag,
    rabatt,
    rabattProzent,
    listennetto,
    listenbrutto,
    rabattBetrag,
    angabeIstBrutto,
  } = gf;

  const bs = tableWrapW(
    `<tr>${tdW(sollKto)}${tdW(formatCurrencyW(nettoBetrag), "right")}${tdCW("")}${tdW("")}${tdW("", "right")}</tr>` +
      `<tr>${tdW("VORST")}${tdW(formatCurrencyW(Vorsteuer), "right")}${tdCW("an")}${tdW(habenKto)}${tdW(formatCurrencyW(bruttoBetrag), "right")}</tr>`,
  );

  // ── Nebenrechnung als HTML-Tabelle ────────────────────────────────────────
  // Spalten: Bezeichnung | Operator | Betrag
  // Zeilen je nach Fall (netto/brutto angegeben, mit/ohne Rabatt)

  // opRow: Zeile mit Operator und Betrag (z. B. "− 50,00 €")
  function opRow(label, op, betrag) {
    return `<tr>
      <td style="padding:1px 10px 1px 2px;color:#444;">${label}</td>
      <td style="padding:1px 0;text-align:right;font-family:courier;color:#444;" colspan="2">${op}&nbsp;${formatCurrencyW(betrag)}</td>
    </tr>`;
  }
  // resRow: Ergebniszeile mit Trennlinie oben und Fettdruck
  function resRow(label, betrag) {
    return `<tr style="border-top:1px solid #aaa;">
      <td style="padding:2px 10px 2px 0;">${label}</td>
      <td style="padding:1px 0;text-align:right;font-family:courier;" colspan="2">${formatCurrencyW(betrag)}</td>
    </tr>`;
  }
  // startRow: erste Zeile (kein Operator, normale Schrift)
  function startRow(label, betrag) {
    return `<tr>
      <td style="padding:2px 10px 2px 0;">${label}</td>
      <td style="padding:1px 0;text-align:right;font-family:courier;" colspan="2">${formatCurrencyW(betrag)}</td>
    </tr>`;
  }

  // Umsatzsteuer auf Listenpreis (für Brutto-Angabe) und auf Bezugspreis (für Netto-Angabe)
  const ustAufListenpreis = roundToTwoDecimalsW(listennetto * 0.19);

  let rows = "";

  if (rabatt && angabeIstBrutto) {
    // Rechnungsbetrag (LP brutto) − USt = Listeneinkaufspreis netto → − Rabatt = Bezugspreis → + USt = Rechnungsbetrag
    const ustAufListenpreis = roundToTwoDecimalsW(listennetto * 0.19);
    rows =
      startRow("Rechnungsbetrag", listenbrutto) +
      opRow("- Umsatzsteuer (19 %)", "", ustAufListenpreis) +
      resRow("Listeneinkaufspreis netto", listennetto) +
      opRow(`Rabatt ${rabattProzent} %`, "", rabattBetrag) +
      resRow("Bezugspreis", nettoBetrag) +
      opRow("+ Umsatzsteuer", "+", Vorsteuer) +
      resRow("Rechnungsbetrag", bruttoBetrag);
  } else if (rabatt && !angabeIstBrutto) {
    // Listeneinkaufspreis netto − Rabatt = Bezugspreis → + USt = Rechnungsbetrag
    rows =
      startRow("Listeneinkaufspreis netto", listennetto) +
      opRow(`- Rabatt ${rabattProzent} %`, "", rabattBetrag) +
      resRow("Bezugspreis", nettoBetrag) +
      opRow("+ Umsatzsteuer (19 %)", "", Vorsteuer) +
      resRow("Rechnungsbetrag", bruttoBetrag);
  } else if (!rabatt && angabeIstBrutto) {
    // Rechnungsbetrag − USt = Listeneinkaufspreis netto (= Bezugspreis)
    rows =
      startRow("Rechnungsbetrag", bruttoBetrag) +
      opRow("- Umsatzsteuer (19 %)", "", Vorsteuer) +
      resRow("Listeneinkaufspreis netto", nettoBetrag);
  } else {
    // Bezugspreis (= Listeneinkaufspreis netto) + USt = Rechnungsbetrag
    rows =
      startRow("Bezugspreis", nettoBetrag) +
      opRow("+ Umsatzsteuer (19 %)", "+", Vorsteuer) +
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
// KONTO-AUSWAHL
// ============================================================================

function initializeKontoAuswahlW() {
  const grid = document.getElementById("kontoGridW");
  if (!grid) return;
  grid.innerHTML = "";
  const used = new Set();
  alleGfWerkstoffe.forEach((t) =>
    (t.kontFilter || []).forEach((k) => used.add(k)),
  );
  Object.entries(kontenWerkstoffe).forEach(([kto, info]) => {
    if (!used.has(kto)) return;
    const item = document.createElement("div");
    item.className = "konto-checkbox-item";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.id = `kontoW-${kto}`;
    cb.value = kto;
    cb.checked = true;
    cb.onchange = updateAuswahlInfoW;
    const lbl = document.createElement("label");
    lbl.className = "konto-label";
    lbl.htmlFor = cb.id;
    const nr = document.createElement("div");
    nr.className = "konto-nummer";
    nr.textContent = kto;
    const bez = document.createElement("div");
    bez.className = "konto-beschreibung";
    bez.textContent = info.beschreibung;
    lbl.appendChild(nr);
    lbl.appendChild(bez);
    item.appendChild(cb);
    item.appendChild(lbl);
    grid.appendChild(item);
  });
  updateAuswahlInfoW();
}

function updateAuswahlInfoW() {
  const el = document.getElementById("auswahlInfoW");
  if (!el) return;
  const cbs = document.querySelectorAll('#kontoGridW input[type="checkbox"]');
  const n = Array.from(cbs).filter((c) => c.checked).length;
  if (n === 0) {
    el.textContent = "⚠️ Keine Konten ausgewählt – es werden alle verwendet";
    el.style.background = "#fff3cd";
    el.style.color = "#856404";
  } else if (n === cbs.length) {
    el.textContent = "✓ Alle Konten ausgewählt";
    el.style.background = "#d4edda";
    el.style.color = "#155724";
  } else {
    el.textContent = `✓ ${n} von ${cbs.length} Konten ausgewählt`;
    el.style.background = "#d1ecf1";
    el.style.color = "#0c5460";
  }
}

function alleKontenAuswaehlenW() {
  document
    .querySelectorAll("#kontoGridW input")
    .forEach((c) => (c.checked = true));
  updateAuswahlInfoW();
}
function alleKontenAbwaehlenW() {
  document
    .querySelectorAll("#kontoGridW input")
    .forEach((c) => (c.checked = false));
  updateAuswahlInfoW();
}
function getAusgewaehlteKontenW() {
  return Array.from(document.querySelectorAll("#kontoGridW input:checked")).map(
    (c) => c.value,
  );
}

// ============================================================================
// YAML LADEN
// ============================================================================

function ladeYamlWerkstoffe() {
  const saved =
    localStorage.getItem("uploadedYamlCompanyData") ||
    localStorage.getItem("standardYamlData");
  if (saved) {
    try {
      yamlDataWerkstoffe = JSON.parse(saved);
      document.dispatchEvent(new Event("yamlDataWerkstoffeLoaded"));
      return true;
    } catch (e) {
      /* ignorieren */
    }
  }
  fetch("js/unternehmen.yml")
    .then((r) => (r.ok ? r.text() : Promise.reject()))
    .then((txt) => {
      yamlDataWerkstoffe = jsyaml.load(txt) || [];
      document.dispatchEvent(new Event("yamlDataWerkstoffeLoaded"));
    })
    .catch(() => {});
  return false;
}

function fillCompanyDropdownW() {
  if (!yamlDataWerkstoffe?.length) return;
  const select = document.getElementById("werkstoffeKunde");
  if (!select) return;
  const sorted = [...yamlDataWerkstoffe].sort((a, b) => {
    const bA = a.unternehmen?.branche || "",
      bB = b.unternehmen?.branche || "";
    if (bA !== bB) return bA.localeCompare(bB);
    return (a.unternehmen?.name || "").localeCompare(b.unternehmen?.name || "");
  });
  select.innerHTML = "";
  const ph = document.createElement("option");
  ph.value = "";
  ph.text = "— bitte Unternehmen auswählen —";
  ph.disabled = true;
  ph.selected = true;
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

function autoSelectMyCompanyW() {
  const name = localStorage.getItem("myCompany");
  if (!name) return;
  const sel = document.getElementById("werkstoffeKunde");
  if (!sel) return;
  const opt = Array.from(sel.options).find((o) => o.value === name);
  if (opt) {
    sel.value = name;
    kundeWerkstoffe = name;
    sel.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

// ============================================================================
// GESCHÄFTSFALL GENERIEREN
// ============================================================================

function genReNrW() {
  return Math.floor(100 + Math.random() * 9900);
}

function erstelleZufallsGeschaeftsfallW() {
  const mitRabattOpt = document.getElementById("optMitRabattW").checked;
  const vorstAngegeben =
    document.getElementById("optVorstAngegeben")?.checked ?? false;
  const ausgewaehlteKonten = getAusgewaehlteKontenW();

  // Nur Werkstoffkonten filtern — VE und BK sind immer aktiv
  const werkstoffKonten = ["AWR", "AWF", "AWH", "AWB"];
  const verfuegbar = alleGfWerkstoffe.filter((t) => {
    if (ausgewaehlteKonten.length > 0) {
      return (t.kontFilter || [])
        .filter((k) => werkstoffKonten.includes(k))
        .every((k) => ausgewaehlteKonten.includes(k));
    }
    return true;
  });

  if (verfuegbar.length === 0) return null;

  const typ = pickW(verfuegbar);
  const konto = typ.konto;
  const artikel = werkstoffArtikel[konto] || werkstoffArtikel["AWR"];
  const awbArt = pickW(awbBezeichnungen);

  // Fester Lieferant je nach Konto und AWB-Art
  const lieferantObj = getLieferantFuerGf(konto, awbArt);
  const lieferantName = lieferantObj.name;

  // ── Rabatt: nur bei einfach_ust ──────────────────────────────────────────
  const rabatt = mitRabattOpt && typ.typ === "einfach_ust";
  const rabattProzent = rabatt ? pickW(RABATT_SAETZE) : 0;

  // ── Betrag ────────────────────────────────────────────────────────────────
  // Nettobetrag immer auf 100 € gerundet
  let listennetto = generateRandomBetragW(artikel.minNetto, artikel.maxNetto);
  // Sicherstellen: Vielfaches von 1000 → VORST immer ganzzahlig
  listennetto = Math.round(listennetto / 1000) * 1000;
  if (listennetto < 1000) listennetto = 1000;
  if (rabatt) listennetto = passeNettoFuerRabattAn(listennetto, rabattProzent);

  const rabattBetrag = rabatt
    ? Math.round((listennetto * rabattProzent) / 100)
    : 0;
  const nettoBetrag = listennetto - rabattBetrag;
  const Vorsteuer = roundToTwoDecimalsW(nettoBetrag * 0.19);
  const bruttoBetrag = roundToTwoDecimalsW(nettoBetrag + Vorsteuer);

  // ── Text ─────────────────────────────────────────────────────────────────
  const vorlagenIdx = Math.floor(Math.random() * typ.vorlagen.length);
  let textVorlage = typ.vorlagen[vorlagenIdx]
    .replace("{kunde}", kundeWerkstoffe)
    .replace("{awbArt}", awbArt);

  // Angabe: zufällig Listenpreis netto oder Rechnungsbetrag (brutto)
  const angabeIstBrutto = Math.random() < 0.5;
  let betragText;
  if (rabatt) {
    const listenbrutto = roundToTwoDecimalsW(listennetto * 1.19);
    betragText = angabeIstBrutto
      ? `Listenpreis: ${formatCurrencyW(listenbrutto)} (Rechnungsbetrag), es wird ein Rabatt in Höhe von ${rabattProzent}\u00a0% gewährt`
      : `Listenpreis: ${formatCurrencyW(listennetto)} netto, der Rabatt beträgt ${rabattProzent}\u00a0%`;
  } else {
    betragText = angabeIstBrutto
      ? `Rechnungsbetrag: ${formatCurrencyW(bruttoBetrag)}`
      : `Listenpreis netto: ${formatCurrencyW(nettoBetrag)}`;
  }

  const vorstHinweis = vorstAngegeben
    ? ` Die Umsatzsteuer beträgt ${formatCurrencyW(Vorsteuer)}.`
    : "";
  const geschaeftsfallText = `${textVorlage} in Höhe von ${betragText}.${vorstHinweis}`;

  const listenbrutto = roundToTwoDecimalsW(listennetto * 1.19);

  return {
    text: geschaeftsfallText,
    typ,
    lieferantObj,
    lieferantName,
    artikelBelegName:
      konto === "AWB" && typ.haben === "BK"
        ? `${awbArt} Re.Nr. ${genReNrW()}`
        : konto === "AWB"
          ? awbArt
          : artikel.belegName,
    einheit: artikel.einheit,
    awbArt,
    sollKto: typ.soll,
    habenKto: typ.haben,
    rabatt,
    rabattProzent,
    listennetto,
    listenbrutto,
    rabattBetrag,
    nettoBetrag,
    Vorsteuer,
    bruttoBetrag,
    angabeIstBrutto,
    ustProzent: 19,
  };
}

// ============================================================================
// BUCHUNGSSATZ DISPATCHER
// ============================================================================

function erstelleBuchungssatzW(gf) {
  if (gf.typ.typ === "einfach_ust") return bsEinfachUstW(gf);
  return bsEinfachW(gf.typ.soll, gf.nettoBetrag, gf.typ.haben);
}

// ============================================================================
// BELEG-URL ERSTELLEN
// ============================================================================

function erstelleBelegURLW(gf) {
  if (!gf.typ.belegtyp) return null;

  const params = new URLSearchParams();
  const bt = gf.typ.belegtyp;
  const now = new Date();
  const tag = String(now.getDate()).padStart(2, "0");
  const monat = String(now.getMonth() + 1).padStart(2, "0");
  const jahr = String(now.getFullYear());
  const kv = document.getElementById("werkstoffeKunde")?.value?.trim() || "";

  params.set("beleg", bt);

  if (bt === "rechnung") {
    // Lieferant aus festem Objekt
    params.set("lieferer", gf.lieferantObj.name);
    if (kv) params.set("kunde", kv);

    if (gf.rabatt) {
      // Auf Beleg: Listenpreis + Rabatt als negative Position → Netto stimmt
      params.set("artikel1", gf.artikelBelegName);
      params.set("menge1", "1");
      params.set("einheit1", gf.einheit || "kg");
      params.set(
        "einzelpreis1",
        parseNumericValueW(formatCurrencyW(gf.listennetto)),
      );
      params.set('rabatt', gf.rabattProzent);
    } else {
      params.set("artikel1", gf.artikelBelegName);
      params.set("menge1", "1");
      params.set("einheit1", gf.einheit || "kg");
      params.set(
        "einzelpreis1",
        parseNumericValueW(formatCurrencyW(gf.nettoBetrag)),
      );
    }

    params.set("umsatzsteuer", "19");
    params.set("tag", tag);
    params.set("monat", monat);
    params.set("jahr", jahr);
    params.set("zahlungsziel", "30");
    params.set("skonto", "2");
    params.set("skontofrist", "20");
  } else if (bt === "kontoauszug") {
    if (kv) params.set("kontoinhaber", kv);
    params.set("vorgang1", gf.artikelBelegName);
    // Brutto bei Kontoauszug (Lastschrift bucht Bruttobetrag)
    params.set(
      "wertstellung1",
      `-${parseNumericValueW(formatCurrencyW(gf.bruttoBetrag))}`,
    );
    params.set("tag", tag);
    params.set("monat", monat);
    params.set("jahr", jahr);
  }

  return `belege.html?${params.toString()}`;
}

// ============================================================================
// BELEG-BUTTON ERSTELLEN
// ============================================================================

function erstelleBelegButtonW(nummer, gf) {
  const url = erstelleBelegURLW(gf);
  if (!url) {
    return `<button disabled style="width:100%;padding:10px 12px;font-size:13px;margin-bottom:8px;
      color:#999;border:1px dashed #ccc;border-radius:4px;text-align:center;">
      ${nummer}. Noch kein Beleg verfügbar</button>`;
  }
  const namen = { rechnung: "Eingangsrechnung", kontoauszug: "Kontoauszug" };
  const name = namen[gf.typ.belegtyp] || "Beleg";
  return `<button class="geschaeftsfall-beleg-button"
    onclick="window.open('${url}', '_blank')"
    title="${name} für Aufgabe ${nummer} erstellen"
    style="width:100%;padding:10px 12px;font-size:14px;margin-bottom:8px;">
    📄 ${nummer}. ${name} erstellen</button>`;
}

// ============================================================================
// HAUPTFUNKTION
// ============================================================================

function zeigeZufaelligeGeschaeftsfaelleW() {
  const anzahl = parseInt(document.getElementById("anzahlDropdownW").value);
  const container = document.getElementById("Container");
  const buttonColumn = document.getElementById("button-columnW");
  if (!container || !buttonColumn) return;
  container.innerHTML = "";
  buttonColumn.innerHTML = "";

  const testGf = erstelleZufallsGeschaeftsfallW();
  if (!testGf) {
    container.innerHTML = `<div style="padding:14px 16px;background:#fff3cd;border:1px solid #ffc107;
      border-radius:5px;color:#856404;margin-top:16px;">
      ⚠️ <strong>Keine passenden Geschäftsfälle verfügbar.</strong><br>
      Bitte wählen Sie weitere Konten aus.</div>`;
    return;
  }

  let aufgabenHTML = "<h2>Aufgaben</h2><ol>";
  let loesungenHTML = "<h2>Lösung</h2>";
  const liste = [testGf];
  for (let i = 1; i < anzahl; i++) {
    const gf = erstelleZufallsGeschaeftsfallW();
    if (gf) liste.push(gf);
  }

  liste.forEach((gf, idx) => {
    const i = idx + 1;
    aufgabenHTML += `<li>${gf.text}</li>`;
    loesungenHTML += `<div style="margin-top:1.5em"><strong>${i}.</strong><br>${erstelleBuchungssatzW(gf)}</div>`;
    const div = document.createElement("div");
    div.style.margin = "12px 0";
    div.innerHTML = erstelleBelegButtonW(i, gf);
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
Du hilfst Schülern, Beschaffungsbuchungen von Werkstoffen selbstständig zu verstehen und zu lösen – ohne ihnen die Lösung abzunehmen.

Wichtige Regeln (streng einhalten!):
- Gib **KEINE** fertigen Buchungssätze, KEINE Beträge, KEINE Konten und KEINE fertigen Nebenrechnungen vor.
- Sage dem Schüler **nie**, welches Konto (AWR, AWH, AWF, AWB, VORST, VE, BK etc.) er verwenden soll.
- Gib keine Hinweise wie „Du brauchst das Konto für Rohstoffe“ oder „Denk an die Vorsteuer“.
- Führe den Schüler ausschließlich durch **gezielte, offene Fragen** und kurze Denkanstöße.
- Warte immer auf die Antwort des Schülers, bevor du die nächste Frage stellst.
- Bei Fehlern erkläre das zugrundeliegende Prinzip, ohne die richtige Buchung zu nennen.

Pädagogischer Ablauf (genau so beginnen):
1. Begrüße den Schüler freundlich und frage direkt nach einem konkreten Geschäftsfall.
   Beispiel: „Hallo! 📦 Super, dass du üben möchtest. Hast du einen Geschäftsfall zur Beschaffung von Werkstoffen, den wir gemeinsam durchgehen können? Schick ihn mir einfach.“

2. Sobald der Schüler einen Geschäftsfall geschickt hat, stelle die Fragen nacheinander (nicht in einer Antwort):
   - Stelle zuerst die Frage: „Um welche Art von Werkstoff handelt es sich bei diesem Einkauf?“ Nenne nicht die Werkstoffarten!
   - Danach: „Wird auf Ziel (per Rechnung) oder sofort per Bank bezahlt?“
   - Frage weiter: „Welche Konten könnten hier deiner Meinung nach benötigt werden?“
   - Lass den Schüler selbst überlegen, ob Rabatt vorhanden ist und was das für die Berechnung bedeutet.
   - Frage gezielt: „Wie gehst du mit dem Rabatt um?“ oder „Worauf berechnest du die Vorsteuer?“
  - Es wird nur dieser Geschäftsfall gebucht, kein anderer! Nur aus dem Geschäftsfall wird der Buchungssatz abgeleitet.

Unterscheidung der Werkstoffe (nur durch Fragen klären, nicht erklären):
- Rohstoffe (gehen in großer Menge direkt ins Produkt)
- Hilfsstoffe (gehen ins Produkt, sind aber nicht der Hauptbestandteil)
- Fremdbauteile (werden zugekauft und gehen direkt ins Produkt)
- Betriebsstoffe (werden verbraucht, gehen aber nicht ins Produkt ein)
- Die Schüler haben eine Liste, in der diese Werkstoffe aufgeführt sind! zum Beispiel Schrauben --> Hilfsstoff, Reinigungsmittel --> Betriebsstoff
- Wenn du unsicher bist, ob der richtige Werkstoff genannt wird, sage, dass der Schüler das Modellunternehmens ja besser kennt und du ihm vertraust.

Kontenplan – Werkstoffe / Beschaffung:

Kontennummern sind in Jahrgangsstufe 7 noch nicht bekannt.

Aktivkonten (Zugang im SOLL):
- AWR – Aufwendungen für Rohstoffe: gehen direkt und in größerer Menge in das Produkt ein (z. B. Stahl, Holz, Mehl...)
- AWF – Aufwendungen für Frendbauteile: werden fremd bezogen und gehen direkt ins Produkt ein.
- AWH – Aufwendungen für Hilfsstoffe: sind im Gegensatz zu den Rohstofffen nicht Hauptbestandteil, gehen aber ins Produkt ein (z. B. Schrauben, Nägel...)
- AWB – Aufwendungen für Betriebsstoffe: werden im Betrieb verbraucht und sind notwendig, gehen aber NICHT ins Produkt ein (z. B. Heizöl, Erdgas, Strom, Schmieröl, Reinigungsmittel...)
- VORST – Vorsteuer: 19 % des Nettobetrags, bei jeder Eingangsrechnung mit ausgewiesener USt

Passivkonten:
- VE – Verbindlichkeiten: Kauf auf Ziel (Rechnung)
- BK – Bank: Zahlung per Lastschrift oder Überweisung

Buchungslogik – immer gleich (nur Netto nach Rabatt zählt):
  AWR  | Nettobetrag (nach Rabatt)  |    |
  VORST| 19 % × Netto               | an | VE | Bruttobetrag

Der Rabatt wird NICHT gebucht! Er erscheint nur in der Nebenrechnung.

Nebenrechnung – 4 Fälle je nach Angabe im Geschäftsfall:

Fall 1: Angabe Listenpreis netto, kein Rabatt
  Listenpreis netto (= Bezugspreis)   10.000 €
  + Umsatzsteuer (19 %)               + 1.900 €
  Rechnungsbetrag                     11.900 €

Fall 2: Angabe Rechnungsbetrag (brutto), kein Rabatt
  Rechnungsbetrag                     11.900 €
  − Umsatzsteuer (19 %)               − 1.900 €
  Listenpreis netto (= Bezugspreis)   10.000 €

Fall 3: Angabe Listenpreis netto, mit Rabatt (z. B. 10 %)
  Listenpreis netto                   10.000 €
  − Rabatt 10 %                       − 1.000 €
  Bezugspreis                          9.000 €
  + Umsatzsteuer (19 % auf Bezugspreis) + 1.710 €
  Rechnungsbetrag                     10.710 €

Fall 4: Angabe Listenpreis als Rechnungsbetrag, mit Rabatt (z. B. 10 %)
  Rechnungsbetrag (Listenpreis brutto) 11.900 €
  − Umsatzsteuer (19 %)               − 1.900 €
  Listenpreis netto                   10.000 €
  − Rabatt 10 %                       − 1.000 €
  Bezugspreis                          9.000 €
  + Umsatzsteuer (19 % auf Bezugspreis) + 1.710 €
  Rechnungsbetrag                     10.710 €

Buchungssatz ist in allen Fällen identisch (Bezugspreis als Netto):
  AWR  | 9.000 €   |    |
  VORST| 1.710 €   | an | VE | 10.710 €

Wichtig: Im Buchungssatz steht immer der Bezugspreis (Listenpreis nach Rabatt).

Häufige Schülerfehler:
- AWR / AWF / AWH / AWB verwechseln
- VORST vergessen
- Brutto statt Netto auf dem Werkstoffkonto eingetragen
- Rabatt wird vorher nicht abgezogen
- Vorsteuer auf den Listenpreis statt auf Netto nach Rabatt berechnen

Am Ende einer erfolgreich gelösten Übung:
- Frage immer: „Möchtest du noch einen anderen Geschäftsfall üben? Dann schick mir einfach den nächsten!“

Du wartest stets auf die Eingabe des Schülers und gibst nichts vor. Dein Ziel ist es, dass der Schüler die Buchung selbst findet und versteht.
`;

function kopiereKiPrompt() {
  navigator.clipboard
    .writeText(KI_ASSISTENT_PROMPT)
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
      alert("Kopieren nicht möglich. Bitte manuell aus dem Textfeld kopieren."),
    );
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
  initializeKontoAuswahlW();

  const sel = document.getElementById("werkstoffeKunde");
  if (sel)
    sel.addEventListener("change", () => {
      kundeWerkstoffe = sel.value.trim() || "<i>[Modellunternehmen]</i>";
    });

  const vorschau = document.getElementById("kiPromptVorschau");
  if (vorschau) vorschau.textContent = KI_ASSISTENT_PROMPT;

  // Erst nach dem YAML-Laden initialisieren
  document.addEventListener(
    "yamlDataWerkstoffeLoaded",
    () => {
      fillCompanyDropdownW();
      setTimeout(autoSelectMyCompanyW, 100);
      setTimeout(zeigeZufaelligeGeschaeftsfaelleW, 200);
    },
    { once: true },
  );

  ladeYamlWerkstoffe();

  // Falls YAML synchron aus localStorage geladen wurde
  if (yamlDataWerkstoffe?.length) {
    fillCompanyDropdownW();
    setTimeout(autoSelectMyCompanyW, 100);
    setTimeout(zeigeZufaelligeGeschaeftsfaelleW, 200);
  }
});
