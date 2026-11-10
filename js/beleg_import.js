// ============================================================================
// BELEG-IMPORT FUNKTIONALITÄT
// ============================================================================

/**
 * Erkennungsmuster für verschiedene Belegtypen
 * Basiert auf charakteristischen IDs im SVG (aus der svg id wie "rechnungSVG")
 */
const BELEG_SVG_ID_MAPPING = {
  rechnungSVG: "rechnung",
  kontoauszugSVG: "kontoauszug",
  quittungSVG: "quittung",
  kassenbonSVG: "kassenbon",
  emailSVG: "email",
  lohnjournalSVG: "lohnjournal",
  bescheidSVG: "bescheid",
  mahnungSVG: "mahnung",
  anlagenkarteSVG: "anlagenkarte",
  wertpapiereSVG: "wertpapiere",
  lohnabrechnungSVG: "lohnabrechnung",
  insolvenzSVG: "insolvenz", // beide Insolvenz-Vorlagen (Eröffnung + Vorlage 2)
  angebotSVG: "rechnung", // Angebot nutzt Rechnung-Tab
  gutschriftSVG: "rechnung", // Gutschrift nutzt Rechnung-Tab
};

/**
 * Zusätzliche Erkennungsmuster basierend auf Element-IDs
 */
const BELEG_DETECTION_PATTERNS = {
  rechnung: {
    ids: [
      "rechnungsDatum",
      "rechnungsbetrag",
      "liefererInformationen",
      "zahlungsziel",
      "pos1",
      "artikel1",
    ],
    texts: ["Rechnung", "Zahlungsziel"],
    minMatches: 2,
  },
  kontoauszug: {
    ids: [
      "kontoauszugNummer",
      "kontoauszugKontostand_neu",
      "kontoauszugVorgang1",
      "kontoauszugIBAN",
    ],
    texts: ["Kontoauszug", "IBAN", "Kontostand"],
    minMatches: 2,
  },
  quittung: {
    ids: [
      "quittungNetto",
      "quittungSumme",
      "quittungZweck",
      "quittungInWorten",
    ],
    texts: ["Quittung", "In Worten"],
    minMatches: 2,
  },
  kassenbon: {
    ids: [
      "kassenbonBrutto",
      "kassenbonTransaktionsnummer",
      "kassenbonZahlungsart",
    ],
    texts: ["Kassenbon", "Transaktionsnummer"],
    minMatches: 2,
  },
  lohnjournal: {
    ids: ["lohnjournalMonat", "lohnjournalBrutto1", "lohnjournalNetto1"],
    texts: ["Lohnjournal", "Gehaltsjournal"],
    minMatches: 2,
  },
  bescheid: {
    ids: [
      "bescheidAktenzeichen1",
      "bescheidMessbetrag",
      "bescheidJahressteuer",
    ],
    texts: ["Bescheid", "Aktenzeichen"],
    minMatches: 2,
  },
  mahnung: {
    ids: [
      "mahnungRechnungsNummer",
      "mahnungZinsen",
      "mahnungSumme",
      "mahnungFrist",
    ],
    texts: ["Mahnung", "Verzugszinsen", "Gesamtforderung"],
    minMatches: 2,
  },
  anlagenkarte: {
    ids: [
      "anlagenkarteBezeichnung",
      "anlagenkarteAnschaffungskosten",
      "anlagenkarteNutzungsdauer",
    ],
    texts: ["Anlagenkarte", "Nutzungsdauer"],
    minMatches: 2,
  },
  wertpapiere: {
    ids: ["wertpapiereISIN", "wertpapiereStueckkurs", "wertpapiereKurswert"],
    texts: ["ISIN", "Stückkurs"],
    minMatches: 2,
  },
  lohnabrechnung: {
    ids: [
      "lohnabrechnungBrutto",
      "lohnabrechnungNetto",
      "lohnabrechnungSteuerklasse",
    ],
    texts: ["Lohnabrechnung", "Steuerklasse"],
    minMatches: 2,
  },
  insolvenz: {
    ids: [
      "insolvenzGrund",
      "insolvenzOeffnungDatum",
      "insolvenzFrist",
      "insolvenzBoxZeile1",
      "insolvenzForderungZeile2",
    ],
    texts: ["Insolvenzverfahren", "Insolvenzverwalter", "Schlussverteilung"],
    minMatches: 2,
  },
};

function parseBelegMarkup(rawContent) {
  const parser = new DOMParser();
  const trimmed = String(rawContent || "").trim();
  if (trimmed.startsWith("<svg") || trimmed.startsWith("<?xml")) {
    const cleaned = trimmed
      .replace(/&nbsp;/g, "&#160;")
      .replace(/&copy;/g, "&#169;")
      .replace(/&reg;/g, "&#174;")
      .replace(/&trade;/g, "&#8482;");
    const svgDoc = parser.parseFromString(cleaned, "image/svg+xml");
    if (!svgDoc.querySelector("parsererror")) return svgDoc;
  }
  return parser.parseFromString(trimmed, "text/html");
}

/**
 * Hauptfunktion für Beleg-Import
 */
async function handleBelegImport(fileArg) {
  const fileInput = document.getElementById("belegImportInput");

  // Event-Objekte (z.B. von onchange) ignorieren, nur echte Files übernehmen
  const file = fileArg instanceof File ? fileArg : fileInput?.files?.[0];

  if (!file) {
    updateBelegImportStatus("Keine Datei ausgewählt", "error");
    return;
  }

  // Prüfe Dateityp (SVG oder HTML)
  const lowerName = file.name.toLowerCase();
  if (
    !lowerName.endsWith(".svg") &&
    !lowerName.endsWith(".html") &&
    !lowerName.endsWith(".htm")
  ) {
    updateBelegImportStatus(
      "Bitte wählen Sie eine SVG- oder HTML-Datei aus",
      "error",
    );
    return;
  }

  try {
    updateBelegImportStatus("Datei wird gelesen...", "info");

    // Lese Datei
    const svgContent = await readFileAsText(file);

    // Parse SVG oder HTML
    const svgDoc = parseBelegMarkup(svgContent);

    // Prüfe auf Parser-Fehler
    const parserError = svgDoc.querySelector("parsererror");
    if (parserError) {
      throw new Error("Datei konnte nicht gelesen werden");
    }

    updateBelegImportStatus("Belegtyp wird erkannt...", "info");

    // Erkenne Belegtyp
    const belegType = detectBelegType(svgDoc);

    if (!belegType) {
      updateBelegImportStatus("Belegtyp konnte nicht erkannt werden", "error");
      return;
    }

    updateBelegImportStatus(
      `${belegType.toUpperCase()} erkannt, Daten werden extrahiert...`,
      "info",
    );

    const extractedData = extractBelegData(svgDoc, belegType);
    window._lastImportData = extractedData;

    console.log("Extrahierte Daten:", extractedData);

    // tabName VOR showImportSummary berechnen
    const tabName = TAB_MAPPING[belegType] || belegType;

    showImportSummary(belegType, extractedData, tabName);
  } catch (error) {
    console.error("Fehler beim Import:", error);
    updateBelegImportStatus(`Fehler: ${error.message}`, "error");
  }
}

function showImportSummary(belegType, extractedData, tabName) {
  const statusEl = document.getElementById("belegImportStatus");

  const SUMMARY_FIELDS = {
    rechnung: [
      "nameLieferer",
      "nameKunde",
      "rechnungsDatum",
      "aktuellesJahr",
      "artikel1",
      "rechnungsbetrag",
    ],
    kontoauszug: [
      "kontoauszugName",
      "kontoauszugDatum",
      "aktuellesJahrKontoauszug",
      "kontoauszugNummer",
      "kontoauszugKontostand_neu",
    ],
    quittung: [
      "quittungName",
      "quittungTag",
      "quittungMonat",
      "quittungZweck",
      "quittungSumme",
    ],
    kassenbon: [
      "kassenbonName",
      "kassenbonTag",
      "kassenbonMonat",
      "kassenbonZweck",
    ],
    anlagenkarte: [
      "anlagenkarteName",
      "anlagenkarteTag",
      "anlagenkarteMonat",
      "anlagenkarteBezeichnung",
      "anlagenkarteAnschaffungskosten",
    ],
    wertpapiere: [
      "wertpapiereName",
      "wertpapiereTag",
      "wertpapiereMonat",
      "wertpapiereBezeichnung",
      "wertpapiereISIN",
      "wertpapiereStueckkurs",
    ],
    bescheid: [
      "bescheidName",
      "bescheidTag",
      "bescheidMonat",
      "bescheidMessbetrag",
      "bescheidJahressteuer",
    ],
    mahnung: [
      "mahnungName",
      "mahnungTag",
      "mahnungMonat",
      "mahnungRechnungsNummer",
      "mahnungBetrag",
      "mahnungSumme",
    ],
    lohnjournal: ["lohnjournalName", "lohnjournalMonat"],
    lohnabrechnung: [
      "lohnabrechnungFirmaName",
      "lohnabrechnungMonat",
      "lohnabrechnungBrutto",
      "lohnabrechnungNetto",
    ],
    email: ["emailName", "emailKunde", "emailSubject"],
    newspaper: ["ueberschrift", "quelle"],
    insolvenz: [
      "_insolvenzSchuldner",
      "_insolvenzVerwalter",
      "insolvenzGrund",
      "insolvenzOeffnungDatum",
      "insolvenzFrist",
      "_insolvenzBetrag",
      "_insolvenzQuote",
    ],
  };

  const FIELD_LABELS = {
    nameLieferer: "Lieferer",
    nameKunde: "Kunde",
    rechnungsDatum: "Datum",
    aktuellesJahr: "Jahr",
    aktuellesJahrKontoauszug: "Jahr",
    artikel1: "Artikel",
    rechnungsbetrag: "Rechnungsbetrag",
    kontoauszugDatum: "Datum",
    kontoauszugNummer: "Auszug-Nr.",
    kontoauszugKontostand_neu: "Neuer Kontostand",
    quittungTag: "Tag",
    quittungMonat: "Monat",
    quittungZweck: "Zweck",
    quittungSumme: "Summe",
    kassenbonTag: "Tag",
    kassenbonMonat: "Monat",
    kassenbonZweck: "Artikel",
    anlagenkarteTag: "Tag",
    anlagenkarteMonat: "Monat",
    anlagenkarteBezeichnung: "Bezeichnung",
    anlagenkarteAnschaffungskosten: "Anschaffungskosten",
    wertpapiereTag: "Tag",
    wertpapiereMonat: "Monat",
    wertpapiereBezeichnung: "Bezeichnung",
    wertpapiereISIN: "ISIN",
    wertpapiereStueckkurs: "Stückkurs",
    bescheidTag: "Tag",
    bescheidMonat: "Monat",
    bescheidMessbetrag: "Messbetrag",
    bescheidJahressteuer: "Jahressteuer",
    mahnungTag: "Tag",
    mahnungMonat: "Monat",
    mahnungRechnungsNummer: "Rechnungsnummer",
    mahnungBetrag: "Rechnungsbetrag",
    mahnungSumme: "Gesamtforderung",
    lohnjournalMonat: "Monat",
    lohnabrechnungMonat: "Monat",
    lohnabrechnungBrutto: "Brutto",
    lohnabrechnungNetto: "Netto",
    emailName: "Absender",
    emailKunde: "Empfänger",
    emailSubject: "Betreff",
    ueberschrift: "Überschrift",
    quelle: "Quelle",
    _insolvenzSchuldner: "Schuldner/-in",
    _insolvenzVerwalter: "Insolvenzverwalter",
    _insolvenzBetrag: "Forderungsbetrag",
    _insolvenzQuote: "Insolvenzquote",
    insolvenzGrund: "Grund",
    insolvenzOeffnungDatum: "Eröffnung am",
    insolvenzFrist: "Anmeldefrist",
  };

  const BELEG_LABELS = {
    rechnung: "Rechnung",
    kontoauszug: "Kontoauszug",
    quittung: "Quittung",
    kassenbon: "Kassenbon",
    anlagenkarte: "Anlagenkarte",
    wertpapiere: "Wertpapiere",
    bescheid: "Bescheid",
    lohnjournal: "Lohnjournal",
    lohnabrechnung: "Lohnabrechnung",
    mahnung: "Mahnung",
    email: "E-Mail",
    newspaper: "Zeitungsartikel",
    insolvenz: "Insolvenzverfahren",
  };

  statusEl.style.backgroundColor = "#e8f5e9";
  statusEl.innerHTML = "";

  const headerDiv = document.createElement("div");
  headerDiv.style.marginBottom = "8px";
  const strong = document.createElement("strong");
  strong.textContent = `✓ ${BELEG_LABELS[belegType] || belegType} erfolgreich erkannt`;
  headerDiv.appendChild(strong);
  statusEl.appendChild(headerDiv);

  const fields = SUMMARY_FIELDS[belegType] || [];
  let foundCount = 0;

  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.marginBottom = "10px";

  fields.forEach((key) => {
    const val = extractedData[key];
    if (val && val.trim() !== "") {
      const tr = document.createElement("tr");

      const tdLabel = document.createElement("td");
      tdLabel.style.cssText =
        "padding:3px 10px 3px 0;color:#555;font-size:13px;";
      tdLabel.textContent = FIELD_LABELS[key] || key;

      const tdVal = document.createElement("td");
      tdVal.style.cssText = "padding:3px 0;font-size:13px;font-weight:bold;";
      tdVal.textContent = val;

      tr.appendChild(tdLabel);
      tr.appendChild(tdVal);
      table.appendChild(tr);
      foundCount++;
    }
  });

  if (foundCount === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 2;
    td.style.cssText = "color:#888;font-size:13px;";
    td.textContent = "Keine Vorschaudaten verfügbar";
    tr.appendChild(td);
    table.appendChild(tr);
  }

  statusEl.appendChild(table);

  const btn = document.createElement("button");
  btn.style.cssText =
    "background:#4caf50;color:#fff;border:none;padding:7px 18px;border-radius:4px;cursor:pointer;font-size:14px;";
  btn.textContent = `→ Zum ${BELEG_LABELS[belegType] || belegType} springen und Felder übernehmen`;
  btn.addEventListener("click", () => jumpToBeleg(belegType, tabName));
  statusEl.appendChild(btn);
}

async function jumpToBeleg(belegType, tabName) {
  const tabOpened = openTabFromURL(tabName);
  if (!tabOpened) return;

  await new Promise((resolve) => setTimeout(resolve, 500));
  const fieldsSet = await fillFormWithExtractedData(
    belegType,
    window._lastImportData,
  );

  // Status aktualisieren
  updateBelegImportStatus(`✓ ${fieldsSet} Felder importiert`, "success");

  document.querySelector(".tab").scrollIntoView({ behavior: "smooth" });
}

/**
 * Erkenne Belegtyp anhand der SVG-ID und fallback auf Pattern-Matching
 */
function detectBelegType(svgDoc) {
  // 0. HTML-Belege direkt erkennen (E-Mail, Zeitungsartikel, E-Rechnung)
  if (svgDoc.querySelector("#mailHtml, #emailSubject, #emailTextMessage")) {
    return "email";
  }
  if (
    svgDoc.querySelector("#newspaperDiv, #newspaperHeadline, #newspaperContent")
  ) {
    return "newspaper";
  }
  if (svgDoc.querySelector("div#rechnungSVG")) {
    return "rechnung";
  }

  // 1. Versuche anhand der SVG root ID
  const svgRoot = svgDoc.querySelector("svg");
  if (svgRoot && svgRoot.id) {
    const mappedType = BELEG_SVG_ID_MAPPING[svgRoot.id];
    if (mappedType) {
      console.log(`Belegtyp erkannt via SVG-ID: ${mappedType}`);
      return mappedType;
    }
  }

  // 2. Fallback: Pattern-basierte Erkennung
  let bestMatch = null;
  let bestScore = 0;

  for (const [belegType, pattern] of Object.entries(BELEG_DETECTION_PATTERNS)) {
    let score = 0;

    // Zähle gefundene IDs
    for (const id of pattern.ids) {
      const element = svgDoc.getElementById(id);
      if (element) {
        score++;
      }
    }

    // Zähle gefundene Texte
    const allText = svgDoc.documentElement.textContent || "";
    for (const text of pattern.texts) {
      if (allText.includes(text)) {
        score++;
      }
    }

    // Prüfe ob genug Matches
    if (score >= pattern.minMatches && score > bestScore) {
      bestScore = score;
      bestMatch = belegType;
    }
  }

  if (bestMatch) {
    console.log(
      `Belegtyp erkannt via Pattern-Matching: ${bestMatch} (Score: ${bestScore})`,
    );
  }

  return bestMatch;
}

/**
 * Extrahiere Daten aus dem SVG-Dokument
 */
function extractBelegData(svgDoc, belegType) {
  const data = {};

  const textElements = svgDoc.querySelectorAll("[id]");
  textElements.forEach((element) => {
    const id = element.id;
    let textContent = element.textContent?.trim() || "";

    // Überspringen wenn leer
    if (textContent === "") return;

    // Überspringen wenn Platzhalter-/Spaltenüberschrift aus dem SVG
    const PLATZHALTER = [
      "Bezeichnung",
      "Artikelbezeichnung",
      "Menge",
      "Einheit",
      "Einzelpreis",
      "Artikel",
      "Leistung",
      "Leistungen",
    ];
    // Spaltenüberschriften (ohne Ziffer) immer überspringen
    if (/^(artikel|menge|einheit|einzelpreis)$/i.test(id)) return;
    if (
      /^(artikel|menge|einheit|einzelpreis)\d*$/i.test(id) &&
      PLATZHALTER.includes(textContent)
    )
      return;

    // Mahnung: berechnete Anzeige-Felder nicht als Eingabewerte übernehmen
    // (Frist-/Tagesangaben werden aus den Formular-Eingaben neu berechnet)
    if (belegType === "mahnung" && /^(mahnungFrist|mahnungTage)$/i.test(id))
      return;

    // Überspringen wenn identisch mit Placeholder des Ziel-Inputs
    const targetInput =
      document.getElementById(id + "Input") || document.getElementById(id);
    if (
      targetInput &&
      targetInput.placeholder &&
      targetInput.placeholder === textContent
    )
      return;

    data[id] = textContent;
  });

  // Menge und Einheit aus kombiniertem SVG-Text trennen (z.B. "100 Stück" → menge + einheit)
  if (data["menge1"]) {
    const mengeMatch = data["menge1"].match(/^([\d\s]+(?:\.\d+)?)\s*(.*)$/);
    if (mengeMatch) {
      // Zahl: Leerzeichen (Tausendertrenner) entfernen, dann normalisieren
      data["_mengeRaw"] = mengeMatch[1].replace(/\s/g, "");
      data["_einheitRaw"] = mengeMatch[2].trim();
    }
  }
  if (data["menge2"]) {
    const mengeMatch2 = data["menge2"].match(/^([\d\s]+(?:\.\d+)?)\s*(.*)$/);
    if (mengeMatch2) {
      data["_menge2Raw"] = mengeMatch2[1].replace(/\s/g, "");
      data["_einheit2Raw"] = mengeMatch2[2].trim();
    }
  }
  // Input-Werte
  const inputElements = svgDoc.querySelectorAll("input[id]");
  inputElements.forEach((input) => {
    if (input.value) {
      data[input.id] = input.value;
    }
  });

  const classFields = [
    // Rechnung / Kontoauszug
    { class: "rechnungsDatum", key: "rechnungsDatum" },
    { class: "aktuellesJahr", key: "aktuellesJahr" },
    { class: "kontoauszugDatum", key: "kontoauszugDatum" },
    { class: "aktuellesJahrKontoauszug", key: "aktuellesJahrKontoauszug" },
    // Quittung
    { class: "aktuellesJahrQuittung", key: "aktuellesJahrQuittung" },
    // Kassenbon
    { class: "aktuellesJahrKassenbon", key: "aktuellesJahrKassenbon" },
    { class: "kassenbonBrutto", key: "kassenbonBrutto" },
    // Anlagenkarte
    { class: "aktuellesJahrAnlagenkarte", key: "aktuellesJahrAnlagenkarte" },
    // Wertpapiere
    { class: "aktuellesJahrWertpapiere", key: "aktuellesJahrWertpapiere" },
    // Bescheid
    { class: "aktuellesJahrBescheid", key: "aktuellesJahrBescheid" },
    { class: "bescheidOrt", key: "bescheidOrt" },
    { class: "bescheidStrasse", key: "bescheidStrasse" },
    { class: "bescheidOrtInhaber", key: "bescheidOrtInhaber" },
    // Mahnung
    { class: "aktuellesJahrMahnung", key: "aktuellesJahrMahnung" },
    { class: "mahnungKontaktzeile", key: "mahnungKontaktzeile" },
    { class: "mahnungOrt", key: "mahnungOrt" },
    // Lohnabrechnung
    {
      class: "aktuellesJahrLohnabrechnung",
      key: "aktuellesJahrLohnabrechnung",
    },
  ];

  classFields.forEach(({ class: cls, key }) => {
    const el = svgDoc.querySelector("." + cls);
    if (el) {
      const text = el.textContent?.trim() || "";
      if (text !== "") {
        data[key] = text;
      }
    }
  });

  // HTML-Belege: Zusatzfelder für E-Mail, Zeitungsartikel und E-Rechnung extrahieren
  if (belegType === "email") {
    const mailRoot = svgDoc.querySelector("#mailHtml");
    const rootStyle = mailRoot ? mailRoot.getAttribute("style") || "" : "";
    if (rootStyle.includes("#2b4a73")) data.vorlage = "mail3.html";
    else if (rootStyle.includes("#e6d8ca")) data.vorlage = "mail2.html";
    else data.vorlage = "mail1.html";
    const kundeEl = svgDoc.querySelector(
      ".emailNameKunde, #emailNameKunde, .emailAdresseKunde, #emailAdresseKunde",
    );
    if (kundeEl && kundeEl.textContent.trim())
      data.emailKunde = kundeEl.textContent.trim();
    if (svgDoc.body && svgDoc.body.innerHTML.trim())
      data._rawHtml = svgDoc.body.innerHTML;
  } else if (belegType === "newspaper") {
    const hl = svgDoc.querySelector("#newspaperHeadline");
    const ct = svgDoc.querySelector("#newspaperContent");
    const sr = svgDoc.querySelector("#newspaperSource");
    const nd = svgDoc.querySelector("#newspaperDiv");
    if (hl) data.ueberschrift = hl.textContent.trim();
    if (ct) {
      data.text = ct.textContent.trim();
      if (ct.style && ct.style.columnCount) data.spalten = ct.style.columnCount;
    }
    if (sr) data.quelle = sr.textContent.replace(/^\s*Quelle:\s*/i, "").trim();
    if (nd && nd.style && nd.style.backgroundColor) {
      const bg = nd.style.backgroundColor.trim();
      const m = bg.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i);
      data.farbe = m
        ? "#" +
          [m[1], m[2], m[3]]
            .map((x) => Number(x).toString(16).padStart(2, "0"))
            .join("")
        : bg;
    }
  } else if (
    belegType === "rechnung" &&
    svgDoc.querySelector("div#rechnungSVG")
  ) {
    const allText = svgDoc.documentElement.textContent || "";
    if (allText.includes("E-Rechnung im Posteingang"))
      data.vorlage = "e-rechnung-er.html";
    else if (allText.includes("E-Rechnung im Postausgang"))
      data.vorlage = "e-rechnung-ar.html";
    if (data.rabatt) {
      const rm = String(data.rabatt).match(/(\d+(?:[.,]\d+)?)\s*%/);
      if (rm) data.rabatt = rm[1];
    }
    if (
      data.bezugskostenSumme &&
      (!data.bezugskosten || !/\d/.test(data.bezugskosten))
    ) {
      data.bezugskosten = data.bezugskostenSumme;
    }
  }

  // Insolvenz: Schuldner/Verwalter/Betrag/Quote aus dem Brieftext ableiten
  // (die Roh-IDs enthalten zusammengesetzte Sätze, nicht einzeln ablegbare
  // Werte). Unterstrich-Keys sind interne Helfer für Summary + Formular.
  else if (belegType === "insolvenz") {
    // Verwalter (Vorlage 1: mit „Rechtsanwalt“-Präfix, Vorlage 2: ohne)
    const verwalterRaw =
      data.insolvenzVerwalterName || data.insolvenzVerwalterName2 || "";
    if (verwalterRaw) data._insolvenzVerwalter = verwalterRaw;

    if (data.insolvenzBoxZeile1 || data.insolvenzForderungZeile2) {
      // Vorlage 2 „Zweifelhafte Forderung“: Firma aus der Bekanntmachung
      const firmaMatch = String(data.insolvenzBoxZeile2 || "").match(
        /der Firma (.+?),\s*$/,
      );
      // Betrag im Stil „2.380,00 €“
      const betragMatch = String(
        data.insolvenzForderungZeile2 || "",
      ).match(/beträgt\s+((?:\d{1,3}(?:\.\d{3})*|\d+)(?:,\d{1,2})?)/);
      // Quote im Stil „Insolvenzquote von 20 %“
      const quoteMatch = String(
        data.insolvenzForderungZeile3 || "",
      ).match(/Insolvenzquote von\s+(\d+(?:,\d+)?)/);
      if (firmaMatch) {
        data._insolvenzFirma = firmaMatch[1].trim();
        data._insolvenzSchuldner =
          `${data._insolvenzFirma} ${data.insolvenzBoxZeile3 || ""}`.trim();
      }
      if (betragMatch) data._insolvenzBetrag = betragMatch[1];
      if (quoteMatch) data._insolvenzQuote = quoteMatch[1].replace(",", ".");
    } else if (data.insolvenzSchuldnerZeile1) {
      // Vorlage 1 „Eröffnungsbeschluss“: Adresszeile + PLZ/Ort kombiniert
      data._insolvenzSchuldner = `${data.insolvenzSchuldnerZeile1} ${data.insolvenzSchuldnerZeile2 || ""}`.trim();
    }
  }

  return data;
}
/**
 * Finde Unternehmen im YAML anhand von Name, Adresse oder anderen Merkmalen
 */
function findCompanyInYaml(searchText) {
  if (!searchText || !yamlData || yamlData.length === 0) {
    return null;
  }

  // Bereinige Suchtext (entferne Zeilenumbrüche und extra Leerzeichen)
  searchText = searchText
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();

  // Extrahiere wichtige Tokens aus dem Suchtext
  const searchTokens = searchText
    .split(" ")
    .filter((token) => token.length > 2);

  let bestMatch = null;
  let bestScore = 0;

  // Durchsuche alle Unternehmen
  for (const company of yamlData) {
    const u = company.unternehmen;
    if (!u) continue;

    let score = 0;

    // Sammle alle vergleichbaren Felder
    const compareFields = [
      u.name,
      u.rechtsform,
      `${u.name} ${u.rechtsform}`,
      u.adresse?.strasse,
      u.adresse?.ort,
      u.adresse?.plz,
      `${u.adresse?.plz} ${u.adresse?.ort}`,
      u.inhaber,
    ];

    // Erstelle kombinierten String aus allen Feldern
    const companyText = compareFields
      .filter((f) => f)
      .join(" ")
      .toLowerCase()
      .replace(/\s+/g, " ");

    // Score 1: Exakter Name-Match
    if (u.name && searchText.includes(u.name.toLowerCase())) {
      score += 10;
    }

    // Score 2: Rechtsform-Match
    if (u.rechtsform && searchText.includes(u.rechtsform.toLowerCase())) {
      score += 5;
    }

    // Score 3: Token-Matching
    for (const token of searchTokens) {
      if (companyText.includes(token)) {
        score += 1;
      }
    }

    // Score 4: Adresse-Match
    if (
      u.adresse?.strasse &&
      searchText.includes(u.adresse.strasse.toLowerCase())
    ) {
      score += 8;
    }

    if (u.adresse?.ort && searchText.includes(u.adresse.ort.toLowerCase())) {
      score += 6;
    }

    // Score 5: PLZ-Match
    if (u.adresse?.plz && searchText.includes(String(u.adresse.plz))) {
      score += 4;
    }

    // Prüfe ob dieser Match besser ist
    if (score > bestScore && score >= 5) {
      // Mindestens Score 5 erforderlich
      bestScore = score;
      bestMatch = u.name;
    }
  }

  if (bestMatch) {
    console.log(`✓ Unternehmen gefunden: ${bestMatch} (Score: ${bestScore})`);
    return bestMatch;
  }

  console.warn(
    `⚠ Kein Unternehmen gefunden für: "${searchText.substring(0, 50)}..."`,
  );
  return null;
}

/**
 * Bereinige extrahierte Werte für Formular-Eingabe
 */
function cleanValueForInput(value, fieldType, elementId) {
  if (!value || value === "") return value;

  // String zu String konvertieren
  value = String(value).trim();

  // Für Dropdown-Felder (Unternehmensauswahl): Suche im YAML
  if (
    fieldType === "select" &&
    (elementId.includes("daten") ||
      elementId.includes("Lieferer") ||
      elementId.includes("Kunde") ||
      elementId.includes("kontoinhaber") ||
      elementId.includes("empfaenger"))
  ) {
    const foundCompany = findCompanyInYaml(value);
    if (foundCompany) {
      return foundCompany;
    }
    // Falls nicht gefunden, gebe Original zurück
    return value;
  }

  // Für Zahlenfelder: Entferne Formatierung
  if (fieldType === "input" || fieldType === "number") {
    // Entferne Währungssymbole
    value = value.replace(/€/g, "").trim();

    // Entferne Einheiten (Stück, kg, etc.) - aber nur am Ende
    value = value.replace(/\s+(Stück|stück|kg|g|m|cm|l|ml)$/i, "").trim();

    // Deutsche Zahlenformatierung: 1.400,00 → 1400.00
    if (value.includes(",")) {
      value = value.replace(/\./g, ""); // Entferne Tausenderpunkte
      value = value.replace(/,/g, "."); // Ersetze Komma durch Punkt
    }

    // Versuche zu einer Zahl zu konvertieren
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      return String(numValue);
    }
  }

  return value;
}

/**
 * Befülle das Formular mit den extrahierten Daten
 */
async function fillFormWithExtractedData(belegType, extractedData) {
  const config = URL_PARAM_CONFIG[belegType];
  if (!config) {
    console.warn(`Keine Konfiguration für ${belegType} gefunden`);
    return 0;
  }

  // Vorlage (z. B. e-rechnung-er.html, mail3.html) VOR applySVGholen setzen
  if (extractedData.vorlage && config.vorlage) {
    setFieldValue(config.vorlage.elementId, extractedData.vorlage, "select");
  }

  // WICHTIG: Zuerst SVG/HTML-Template laden, bevor Daten gesetzt werden
  const needsSVGLoad = [
    "rechnung",
    "kontoauszug",
    "email",
    "quittung",
    "kassenbon",
    "lohnjournal",
    "bescheid",
    "mahnung",
    "anlagenkarte",
    "wertpapiere",
    "lohnabrechnung",
  ];

  if (needsSVGLoad.includes(belegType)) {
    console.log(`⏳ Lade SVG-Template für ${belegType}...`);
    if (typeof window.applySVGholen === "function") {
      await window.applySVGholen(true);
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }

  // Datum-Felder direkt setzen (da sie über Klassen kommen, nicht IDs)
  const datumMappings = {
    rechnung: {
      raw: "rechnungsDatum",
      jahr: "aktuellesJahr",
      tagId: "tag",
      monatId: "monat",
      jahrId: "jahr",
    },
    kontoauszug: {
      raw: "kontoauszugDatum",
      jahr: "aktuellesJahrKontoauszug",
      tagId: "tagKontoauszug",
      monatId: "monatKontoauszug",
      jahrId: "jahrKontoauszug",
    },
    quittung: {
      tagId: "tagQuittung",
      tagKey: "quittungTag",
      monatId: "monatQuittung",
      monatKey: "quittungMonat",
      jahrId: "jahrQuittung",
      jahrKey: "aktuellesJahrQuittung",
    },
    kassenbon: {
      tagId: "tagKassenbon",
      tagKey: "kassenbonTag",
      monatId: "monatKassenbon",
      monatKey: "kassenbonMonat",
      jahrId: "jahrKassenbon",
      jahrKey: "aktuellesJahrKassenbon",
    },
    anlagenkarte: {
      tagId: "tagAnlagenkarte",
      tagKey: "anlagenkarteTag",
      monatId: "monatAnlagenkarte",
      monatKey: "anlagenkarteMonat",
      jahrId: "jahrAnlagenkarte",
      jahrKey: "aktuellesJahrAnlagenkarte",
    },
    wertpapiere: {
      tagId: "tagWertpapiereInput",
      tagKey: "wertpapiereTag",
      monatId: "monatWertpapiereInput",
      monatKey: "wertpapiereMonat",
      jahrId: "jahrWertpapiere",
      jahrKey: "aktuellesJahrWertpapiere",
    },
    bescheid: {
      tagId: "tagBescheid",
      tagKey: "bescheidTag",
      monatId: "monatBescheid",
      monatKey: "bescheidMonat",
      jahrId: "jahrBescheid",
      jahrKey: "aktuellesJahrBescheid",
    },
    mahnung: {
      tagId: "tagMahnung",
      tagKey: "mahnungTag",
      monatId: "monatMahnung",
      monatKey: "mahnungMonat",
      jahrId: "jahrMahnung",
      jahrKey: "aktuellesJahrMahnung",
    },
  };

  const dm = datumMappings[belegType];
  if (dm) {
    if (dm.raw && extractedData[dm.raw]) {
      const parts = extractedData[dm.raw].split(".");
      if (parts.length >= 2) {
        const tag = parts[0].padStart(2, "0");
        const monat = parts[1].padStart(2, "0");
        setFieldValue(dm.tagId, tag, "select");
        setFieldValue(dm.monatId, monat, "select");
      }
    } else if (dm.tagKey && extractedData[dm.tagKey]) {
      setFieldValue(dm.tagId, extractedData[dm.tagKey], "select");
      setFieldValue(dm.monatId, extractedData[dm.monatKey], "select");
    }
    // Jahr
    if (dm.jahrKey && extractedData[dm.jahrKey]) {
      setFieldValue(dm.jahrId, extractedData[dm.jahrKey], "input");
    } else if (dm.jahr && extractedData[dm.jahr]) {
      setFieldValue(dm.jahrId, extractedData[dm.jahr], "input");
    }
  }

  let fieldsSet = 0;

  // Firmenfelder: Namens-Element im SVG → Unternehmens-Dropdown
  const FIRMEN_FELDER = {
    kassenbon: [{ key: "kassenbonName", elementId: "datenKassenbon" }],
    kontoauszug: [{ key: "kontoauszugName", elementId: "datenKontoauszug" }],
    quittung: [
      { key: "quittungName", elementId: "datenQuittung" },
      { key: "quittungNameKunde", elementId: "datenQuittungKunde" },
    ],
    anlagenkarte: [{ key: "anlagenkarteName", elementId: "datenAnlagenkarte" }],
    wertpapiere: [{ key: "wertpapiereName", elementId: "datenWertpapiere" }],
    bescheid: [{ key: "bescheidName", elementId: "datenBescheid" }],
    mahnung: [
      { key: "mahnungName", elementId: "datenMahnung" },
      { key: "mahnungKundeName", elementId: "datenMahnungEmpfaenger" },
    ],
    lohnjournal: [{ key: "lohnjournalName", elementId: "datenLohnjournal" }],
    lohnabrechnung: [
      { key: "lohnabrechnungFirmaName", elementId: "datenLohnabrechnung" },
    ],
    email: [
      { key: "emailName", elementId: "datenEmail" },
      { key: "emailKunde", elementId: "datenEmailKunde" },
    ],
  };

  (FIRMEN_FELDER[belegType] || []).forEach(({ key, elementId }) => {
    const val = extractedData[key];
    console.log(`[Firma] ${key} = "${val}" → Dropdown ${elementId}`);
    if (!val) return;

    const firma = findCompanyInYaml(val);
    const ok = firma && setFieldValue(elementId, firma, "select");
    console.log(
      `[Firma] gefunden: ${firma}, gesetzt: ${ok}, Wert jetzt: "${document.getElementById(elementId)?.value}"`,
    );

    if (ok) {
      document
        .getElementById(elementId)
        .dispatchEvent(new Event("change", { bubbles: true }));
      fieldsSet++;
    }
  });

  // Explizites Direkt-Mapping für Rechnung
  // (Felder die durch possibleKeys/fuzzy nicht zuverlässig gefunden werden)
  if (belegType === "rechnung") {
    const direktMapping = {
      artikelInput: extractedData["artikel1"],
      artikelInput2: extractedData["artikel2"],
      mengeInput: extractedData["_mengeRaw"],
      einheitInput: extractedData["_einheitRaw"],
      mengeInput2: extractedData["_menge2Raw"],
      einheitInput2: extractedData["_einheit2Raw"],
      einzelpreisInput: extractedData["einzelpreis1"]
        ? extractedData["einzelpreis1"].replace(/[€\s]/g, "").replace(",", ".")
        : undefined,
      einzelpreisInput2: extractedData["einzelpreis2"]
        ? extractedData["einzelpreis2"].replace(/[€\s]/g, "").replace(",", ".")
        : undefined,
    };
    for (const [inputId, val] of Object.entries(direktMapping)) {
      if (val !== undefined && val !== "") {
        const el = document.getElementById(inputId);
        if (el) {
          el.value = val;
          fieldsSet++;
          console.log(`✓ Direkt-Mapping: ${inputId} = ${val}`);
        }
      }
    }
  }

  // Durchlaufe alle möglichen Felder für diesen Belegtyp
  for (const [paramName, paramConfig] of Object.entries(config)) {
    const possibleKeys = [
      paramConfig.elementId,
      paramName,
      paramConfig.elementId.replace("Input", ""),
      paramConfig.elementId.replace("Input", "1"),
      belegType + paramName.charAt(0).toUpperCase() + paramName.slice(1),
    ];

    let valueFound = false;

    for (const key of possibleKeys) {
      if (extractedData[key] !== undefined && extractedData[key] !== "") {
        let cleanedValue = cleanValueForInput(
          extractedData[key],
          paramConfig.type,
          paramConfig.elementId,
        );
        const success = setFieldValue(
          paramConfig.elementId,
          cleanedValue,
          paramConfig.type,
        );
        if (success) {
          fieldsSet++;
          valueFound = true;
          console.log(`✓ Setze ${paramConfig.elementId} = ${cleanedValue}`);
          break;
        }
      }
    }

    if (!valueFound) {
      for (const [dataKey, dataValue] of Object.entries(extractedData)) {
        // Jahr-Felder NIEMALS fuzzy matchen
        if (paramConfig.elementId.startsWith("jahr")) continue;

        const keyLower = dataKey.toLowerCase();
        const paramLower = paramName.toLowerCase();

        if (keyLower.includes(paramLower) || paramLower.includes(keyLower)) {
          let cleanedValue = cleanValueForInput(
            dataValue,
            paramConfig.type,
            paramConfig.elementId,
          );
          const success = setFieldValue(
            paramConfig.elementId,
            cleanedValue,
            paramConfig.type,
          );
          if (success) {
            fieldsSet++;
            console.log(
              `✓ Setze ${paramConfig.elementId} = ${cleanedValue} (fuzzy match)`,
            );
            break;
          }
        }
      }
    }
  }

  if (belegType === "email" && extractedData._rawHtml) {
    const emailContainer = document.getElementById("emailContainer");
    if (emailContainer) {
      emailContainer.innerHTML = extractedData._rawHtml;
      fieldsSet++;
    }
  } else if (belegType === "newspaper") {
    const colRange = document.getElementById("newspaperColumnRange");
    const colVal = document.getElementById("newspaperColumnValue");
    if (colRange && colVal) colVal.innerText = colRange.value;
    const applyBtn = document.getElementById("newspaperApplyChangesButton");
    if (applyBtn) applyBtn.click();
    const nd = document.getElementById("newspaperDiv");
    const nc = document.getElementById("newspaperContent");
    const colorIn = document.getElementById("newspaperColorInput");
    if (nd && colorIn) nd.style.backgroundColor = colorIn.value;
    if (nc && colRange) nc.style.columnCount = colRange.value;
  }

  // Mahnung: Anzeige-/Datumswerte korrekt zuordnen (nach dem generischen Lauf)
  if (belegType === "mahnung") {
    // Mahnstufe aus dem Brief-Titel ableiten
    const titelText = String(extractedData["mahnungTitel"] || "");
    const stufeSel = document.getElementById("mahnungStufeInput");
    if (stufeSel) {
      if (/letzte/i.test(titelText)) stufeSel.value = "3";
      else if (/erinnerung/i.test(titelText)) stufeSel.value = "1";
      else if (/mahnung/i.test(titelText)) stufeSel.value = "2";
    }

    // Rechnungsdatum (TT.MM.JJJJ) → ISO-Format in den Datums-Input
    const rdMatch = String(extractedData["mahnungRechnungsdatum"] || "").match(
      /(\d{1,2})\.(\d{1,2})\.(\d{2,4})/,
    );
    if (rdMatch) {
      let rdJahr = rdMatch[3];
      if (rdJahr.length === 2) rdJahr = "20" + rdJahr;
      const rdInput = document.getElementById("mahnungRechnungsdatumInput");
      if (rdInput)
        rdInput.value = `${rdJahr}-${rdMatch[2].padStart(2, "0")}-${rdMatch[1].padStart(2, "0")}`;
    }

    // Zinssatz aus der Anzeige im Brief ("10,52")
    const zinsText = String(extractedData["mahnungZinssatzText"] || "").replace(
      ",",
      ".",
    );
    const zinsWert = parseFloat(zinsText.replace(/[^\d.]/g, ""));
    const zinsInput = document.getElementById("mahnungZinssatzInput");
    if (zinsInput && !isNaN(zinsWert)) zinsInput.value = zinsWert;
  }

  // Insolvenz: Vorlage erkennen, Schuldner/Verwalter zuordnen und die
  // Vorlage laden+befüllen (nach dem generischen Lauf, damit Grund/Datum/
  // Frist schon gesetzt sind)
  if (belegType === "insolvenz") {
    const istVorlage2 = !!(
      extractedData.insolvenzBoxZeile1 || extractedData.insolvenzForderungZeile2
    );
    const vorlageSel = document.getElementById("svgDropdownInsolvenz");
    if (vorlageSel && [...vorlageSel.options].some((o) => o.value === (istVorlage2 ? "insolvenz2.svg" : "insolvenz1.svg"))) {
      vorlageSel.value = istVorlage2 ? "insolvenz2.svg" : "insolvenz1.svg";
      fieldsSet++;
    }

    // Schuldner/Verwalter über YAML-Matcher in die Dropdowns stellen
    const setzeUnternehmen = (elementId, searchText) => {
      if (!searchText) return false;
      const firma = findCompanyInYaml(searchText);
      const sel = document.getElementById(elementId);
      if (firma && sel && [...sel.options].some((o) => o.value === firma)) {
        sel.value = firma;
        return true;
      }
      return false;
    };
    if (
      setzeUnternehmen(
        "datenInsolvenzSchuldner",
        extractedData._insolvenzSchuldner ||
          [
            extractedData.insolvenzSchuldnerZeile1,
            extractedData.insolvenzSchuldnerZeile2,
          ]
            .filter(Boolean)
            .join(" "),
      )
    )
      fieldsSet++;
    if (
      setzeUnternehmen(
        "datenInsolvenzVerwalter",
        extractedData._insolvenzVerwalter,
      )
    )
      fieldsSet++;

    // Betrag (deutsche Notation direkt übernehmbar) + Quote für Vorlage 2
    if (extractedData._insolvenzBetrag) {
      const betragInput = document.getElementById("insolvenzForderungBetragInput");
      if (betragInput) {
        betragInput.value = extractedData._insolvenzBetrag;
        fieldsSet++;
      }
    }
    if (extractedData._insolvenzQuote) {
      const quoteInput = document.getElementById("insolvenzQuoteInput");
      if (quoteInput) {
        quoteInput.value = String(extractedData._insolvenzQuote).replace(".", ",");
        fieldsSet++;
      }
    }

    // SVG je nach Verfahrensart laden und Daten einsetzen
    if (typeof window.insolvenzApplySVGholen === "function") {
      await window.insolvenzApplySVGholen(true);
    }
  }

  console.log(`${fieldsSet} Felder wurden befüllt`);
  return fieldsSet;
}
/**
 * Hilfsfunktion: Lese Datei als Text
 */
function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      resolve(e.target.result);
    };

    reader.onerror = (e) => {
      reject(new Error("Fehler beim Lesen der Datei"));
    };

    reader.readAsText(file);
  });
}

/**
 * Aktualisiere den Import-Status
 */
function updateBelegImportStatus(message, type = "info") {
  const statusElement = document.getElementById("belegImportStatus");
  if (!statusElement) return;

  statusElement.textContent = message;

  // Setze Hintergrundfarbe basierend auf Typ
  const colors = {
    info: "#e3f2fd",
    success: "#e8f5e9",
    error: "#ffebee",
    warning: "#fff3e0",
  };

  statusElement.style.backgroundColor = colors[type] || colors.info;

  // Log in Konsole
  const logFn = type === "error" ? console.error : console.log;
  logFn(`[Beleg-Import] ${message}`);
}

// Export für Module (falls verwendet)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    handleBelegImport,
    detectBelegType,
    extractBelegData,
    fillFormWithExtractedData,
  };
}
