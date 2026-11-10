// ============================================================================
// URL-PARAMETER KONFIGURATION
// ============================================================================

/**
 * Zentrale Konfiguration für URL-Parameter aller Belege
 * Struktur:
 * - key: Parameter-Name in der URL
 * - elementId: ID des Input-Elements im HTML
 * - type: 'input' oder 'select' (für verschiedene Setzmethoden)
 */

const URL_PARAM_CONFIG = {
  // ========== RECHNUNG/ANGEBOT/GUTSCHRIFT ==========
  rechnung: {
    // Artikel 1
    artikel1: { elementId: "artikelInput", type: "input" },
    menge1: { elementId: "mengeInput", type: "input" },
    einheit1: { elementId: "einheitInput", type: "input" },
    einzelpreis1: { elementId: "einzelpreisInput", type: "input" },

    // Artikel 2
    artikel2: { elementId: "artikelInput2", type: "input" },
    menge2: { elementId: "mengeInput2", type: "input" },
    einheit2: { elementId: "einheitInput2", type: "input" },
    einzelpreis2: { elementId: "einzelpreisInput2", type: "input" },

    // Rabatt & Bezugskosten
    rabatt: { elementId: "rabattInput", type: "input" },
    bezugskosten: { elementId: "bezugskostenInput", type: "input" },
    bezugskostenart: { elementId: "bezugskostenArtInput", type: "input" },

    // Steuer & Zahlung
    umsatzsteuer: {
      elementId: "umsatzsteuerInput",
      type: "input",
      default: String(UST_REGEL),
    },
    zahlungsziel: {
      elementId: "zahlungszielInput",
      type: "input",
      default: "30",
    },
    skonto: { elementId: "skontoInput", type: "input", default: "2" },
    skontofrist: {
      elementId: "skontofristInput",
      type: "input",
      default: "20",
    },

    // Sonstige
    lieferzeit: { elementId: "angebotLieferzeitInput", type: "input" },
    vorlage: { elementId: "svgDropdown", type: "select" },

    // Datum
    tag: { elementId: "tag", type: "select" },
    monat: { elementId: "monat", type: "select" },
    jahr: { elementId: "jahr", type: "input" },

    // Farbe
    farbe: { elementId: "colorPicker", type: "input" },

    // Unternehmen
    lieferer: { elementId: "datenLieferer", type: "select" },
    kunde: { elementId: "datenKunde", type: "select" },
  },

  // ========== KONTOAUSZUG ==========
  kontoauszug: {
    // Vorgänge
    vorgang1: { elementId: "kontoauszugVorgang1Input", type: "input" },
    wertstellung1: {
      elementId: "kontoauszugWertstellung1Input",
      type: "input",
    },
    vorgang2: { elementId: "kontoauszugVorgang2Input", type: "input" },
    wertstellung2: {
      elementId: "kontoauszugWertstellung2Input",
      type: "input",
    },
    vorgang3: { elementId: "kontoauszugVorgang3Input", type: "input" },
    wertstellung3: {
      elementId: "kontoauszugWertstellung3Input",
      type: "input",
    },

    // Beleg-Daten
    nummer: { elementId: "kontoauszugNummerInput", type: "input" },
    kontostand_alt: {
      elementId: "kontoauszugKontostand_altInput",
      type: "input",
    },

    // Datum
    tag: { elementId: "tagKontoauszug", type: "select" },
    monat: { elementId: "monatKontoauszug", type: "select" },
    jahr: { elementId: "jahrKontoauszug", type: "input" },

    // ➔ HIER MUSS DIE VORLAGE ERGÄNZT WERDEN:
    vorlage: { elementId: "svgDropdownKontoauszug", type: "select" },

    // Unternehmen
    kontoinhaber: { elementId: "datenKontoauszug", type: "select" },
  },

  // ========== QUITTUNG ==========
  quittung: {
    // Beträge
    netto: { elementId: "quittungNettoInput", type: "input" },
    ust: {
      elementId: "quittungUSTInput",
      type: "input",
      default: String(UST_REGEL),
    },

    // Weitere Daten
    zweck: { elementId: "quittungZweckInput", type: "input" },

    // Datum
    tag: { elementId: "tagQuittung", type: "select" },
    monat: { elementId: "monatQuittung", type: "select" },
    jahr: { elementId: "jahrQuittung", type: "input" },

    // Vorlage
    vorlage: { elementId: "svgDropdownQuittung", type: "select" },

    // Unternehmen
    empfaenger: { elementId: "datenQuittung", type: "select" },
    kunde: { elementId: "datenQuittungKunde", type: "select" },
  },

  // ========== KASSENBON ==========
  kassenbon: {
    // Vorlage (Klassisch / eBon / Taxi)
    art: { elementId: "svgDropdownKassenbon", type: "select" },
    // Beträge
    netto: { elementId: "kassenbonNettoInput", type: "input" },
    ust: {
      elementId: "kassenbonUSTInput",
      type: "input",
      default: String(UST_REGEL),
    },

    // Weitere Daten
    bezeichnung: { elementId: "kassenbonZweckInput", type: "input" },
    zahlungsart: { elementId: "kassenbonDropdownZahlungsart", type: "select" },

    // Artikel 2 / 3 (nur Kassenbon/eBon, nicht Taxi)
    bezeichnung2: { elementId: "kassenbonZweckInput2", type: "input" },
    netto2: { elementId: "kassenbonNettoInput2", type: "input" },
    ust2: { elementId: "kassenbonUSTInput2", type: "input" },
    bezeichnung3: { elementId: "kassenbonZweckInput3", type: "input" },
    netto3: { elementId: "kassenbonNettoInput3", type: "input" },
    ust3: { elementId: "kassenbonUSTInput3", type: "input" },

    // Datum
    tag: { elementId: "tagKassenbon", type: "select" },
    monat: { elementId: "monatKassenbon", type: "select" },
    jahr: { elementId: "jahrKassenbon", type: "input" },

    // Vorlage
    vorlage: { elementId: "svgDropdownKassenbon", type: "select" },

    // Unternehmen
    iceer: { elementId: "datenKassenbon", type: "select" },
    kunde: { elementId: "datenKassenbonKunde", type: "select" },
  },

  // ========== EMAIL ==========
  email: {
    // Betreff/Text werden direkt in der editierbaren Mailvorschau geändert
    // (Platzhaltertext kommt aus der Vorlage, "Zurücksetzen"-Button stellt ihn wieder her)

    // Vorlage
    vorlage: { elementId: "svgDropdownEmail", type: "select" },

    // Unternehmen
    absender: { elementId: "datenEmail", type: "select" },
    empfaenger: { elementId: "datenEmailKunde", type: "select" },

    // Optionales Logo
    logo: { elementId: "emailLogoCheckbox", type: "checkbox" },
  },

  // ========== ZEITUNGSARTIKEL ==========
  newspaper: {
    ueberschrift: { elementId: "newspaperHeadlineInput", type: "input" },
    text: { elementId: "newspaperTextInput", type: "textarea" },
    quelle: { elementId: "newspaperSourceInput", type: "input" },
    farbe: { elementId: "newspaperColorInput", type: "input" },
    spalten: { elementId: "newspaperColumnRange", type: "input" },
  },

  // ========== LOHNABRECHNUNG ==========
  lohnabrechnung: {
    monat: { elementId: "lohnabrechnungMonatInput", type: "select" },
    brutto: { elementId: "lohnabrechnungBruttoInput", type: "input" },
    steuerklasse: {
      elementId: "lohnabrechnungSteuerklasseInput",
      type: "select",
    },
    kinderfreibetrag: {
      elementId: "lohnabrechnungKinderfreibetragInput",
      type: "select",
    },
    kvsatz: { elementId: "lohnabrechnungKVSatzInput", type: "input" },
    pvsatz: { elementId: "lohnabrechnungPVSatzInput", type: "input" },
    rvsatz: { elementId: "lohnabrechnungRVSatzInput", type: "input" },
    alvsatz: { elementId: "lohnabrechnungALVSatzInput", type: "input" },

    // Vorlage
    vorlage: { elementId: "svgDropdownLohnabrechnung", type: "select" },

    // Unternehmen
    unternehmen: { elementId: "datenLohnabrechnung", type: "select" },
  },

  // ========== LOHNJOURNAL ==========
  lohnjournal: {
    vorlage: { elementId: "svgDropdownLohnjournal", type: "select" },
    unternehmen: { elementId: "datenLohnjournal", type: "select" },
  },

  // ========== BESCHEID ==========
  bescheid: {
    // Grundsteuer
    messbetrag: { elementId: "bescheidMessbetragInput", type: "input" },
    hebesatz: { elementId: "bescheidHebesatzInput", type: "input" },

    // Abfall
    abfallgebuehr: { elementId: "bescheidAbfallgebuehrInput", type: "input" },
    abfallbezeichnung: {
      elementId: "bescheidAbfallbezeichnungInput",
      type: "input",
    },

    // Kraftfahrzeugsteuer
    // type "text"/"date": verhindert die Zahlen-Konvertierung von
    // cleanValueForInput (sonst würde "15.03.2025" zu "15.03" verkürzt)
    fahrzeug: { elementId: "bescheidFahrzeugInput", type: "text" },
    zulassung: { elementId: "bescheidZulassungInput", type: "date" },
    betrag: { elementId: "bescheidBetragInput", type: "text" },

    // Datum
    tag: { elementId: "tagBescheid", type: "select" },
    monat: { elementId: "monatBescheid", type: "select" },
    jahr: { elementId: "jahrBescheid", type: "input" },

    // Vorlage
    art: { elementId: "svgDropdownBescheid", type: "select" },

    // Unternehmen
    unternehmen: { elementId: "datenBescheid", type: "select" },
  },

  // ========== INSOLVENZVERFAHREN ==========
  insolvenz: {
    verfahren: { elementId: "svgDropdownInsolvenz", type: "select" },
    schuldner: { elementId: "datenInsolvenzSchuldner", type: "select" },
    verwalter: { elementId: "datenInsolvenzVerwalter", type: "select" },
    grund: { elementId: "insolvenzGrundInput", type: "select" },
    // type "text": verhindert die Zahlen-Konvertierung von
    // cleanValueForInput (sonst würde "01.07.2026" zu "1.07" verkürzt)
    datum: { elementId: "insolvenzOeffnungDateInput", type: "text" },
    frist: { elementId: "insolvenzFristInput", type: "text" },
  },

  // ========== MAHNUNG ==========
  mahnung: {
    // Mahnstufe
    stufe: { elementId: "mahnungStufeInput", type: "select" },

    // Rechnungs- und Verzugsdaten
    rechnungsnr: { elementId: "mahnungRechnungsNrInput", type: "input" },
    betrag: { elementId: "mahnungBetragInput", type: "input" },
    zinssatz: { elementId: "mahnungZinssatzInput", type: "input" },
    pauschale: { elementId: "mahnungPauschaleInput", type: "input" },
    frist: { elementId: "mahnungFristInput", type: "input" },
    rechnungsdatum: { elementId: "mahnungRechnungsdatumInput", type: "input" },
    faelligkeit: { elementId: "mahnungFaelligkeitInput", type: "input" },

    // Briefdatum
    tag: { elementId: "tagMahnung", type: "select" },
    monat: { elementId: "monatMahnung", type: "select" },
    jahr: { elementId: "jahrMahnung", type: "input" },

    // Vorlage
    vorlage: { elementId: "svgDropdownMahnung", type: "select" },

    // Unternehmen
    unternehmen: { elementId: "datenMahnung", type: "select" },
    empfaenger: { elementId: "datenMahnungEmpfaenger", type: "select" },
  },

  // ========== ANLAGENKARTE ==========
  anlagenkarte: {
    bezeichnung: { elementId: "anlagenkarteBezeichnungInput", type: "input" },
    anlagenkonto: { elementId: "anlagenkarteAnlagenkontoInput", type: "input" },
    anschaffungskosten: {
      elementId: "anlagenkarteAnschaffungskostenInput",
      type: "input",
    },
    nutzungsdauer: {
      elementId: "anlagenkarteNutzungsdauerInput",
      type: "input",
    },

    // Datum
    tag: { elementId: "tagAnlagenkarte", type: "select" },
    monat: { elementId: "monatAnlagenkarte", type: "select" },
    jahr: { elementId: "jahrAnlagenkarte", type: "input" },

    // Vorlage
    vorlage: { elementId: "svgDropdownAnlagenkarte", type: "select" },

    // Unternehmen
    unternehmen: { elementId: "datenAnlagenkarte", type: "select" },
  },

  // ========== WERTPAPIERE ==========
  wertpapiere: {
    art: { elementId: "wertpapiereArtInput", type: "select" },
    bezeichnung: { elementId: "wertpapiereBezeichnungInput", type: "input" },
    isin: { elementId: "wertpapiereISINInput", type: "input" },
    stueckkurs: { elementId: "wertpapiereStueckkursInput", type: "input" },
    anzahl: { elementId: "wertpapiereAnzahlInput", type: "input" },

    // Datum
    tag: { elementId: "tagWertpapiereInput", type: "select" },
    monat: { elementId: "monatWertpapiereInput", type: "select" },
    jahr: { elementId: "jahrWertpapiere", type: "input" },

    // Vorlage
    vorlage: { elementId: "svgDropdownWertpapiere", type: "select" },

    // Unternehmen
    unternehmen: { elementId: "datenWertpapiere", type: "select" },
  },
};

// ============================================================================
// TAB-MAPPING
// ============================================================================

/**
 * Mapping von URL-Parametern zu Tab-IDs
 * Unterstützt mehrere Schreibweisen für denselben Beleg
 */
const TAB_MAPPING = {
  rechnung: "rechnung",
  angebot: "rechnung",
  gutschrift: "rechnung",
  "rechnung/angebot/gutschrift": "rechnung",
  kontoauszug: "kontoauszug",
  quittung: "quittung",
  kassenbon: "kassenbon",
  kassenbuch: "kassenbon",
  email: "email",
  mail: "email",
  newspaper: "newspaper",
  zeitungsartikel: "newspaper",
  zeitung: "newspaper",
  artikel: "newspaper",
  lohnabrechnung: "lohnabrechnung",
  gehaltsabrechnung: "lohnabrechnung",
  lohnjournal: "lohnjournal",
  bescheid: "bescheid",
  insolvenz: "insolvenz",
  insolvenzverfahren: "insolvenz",
  mahnung: "mahnung",
  zahlungserinnerung: "mahnung",
  "letzte-mahnung": "mahnung",
  anlagenkarte: "anlagenkarte",
  wertpapiere: "wertpapiere",
  modellunternehmen: "modellunternehmen",
};

// ============================================================================
// APPLY-FUNKTIONEN MAPPING
// ============================================================================

/**
 * Mapping von Beleg-Typen zu ihren Apply-Funktionen
 */
const APPLY_FUNCTIONS = {
  rechnung: "applyOrderData",
  kontoauszug: "applyOrderData",
  quittung: "quittungApplySVGholen",
  kassenbon: "kassenbonApplySVGholen",
  email: "applyOrderData",
  newspaper: null, // Verwendet speziellen Button
  lohnabrechnung: "lohnabrechnungApplySVGholen",
  lohnjournal: "journalApplySVGholen",
  bescheid: "bescheidApplySVGholen",
  insolvenz: "insolvenzApplySVGholen",
  mahnung: "mahnungApplySVGholen",
  anlagenkarte: "anlagenkarteApplySVGholen",
  wertpapiere: "wertpapiereApplySVGholen",
};

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================

// ============================================================================
// HAUPTFUNKTIONEN
// ============================================================================

/**
 * Setzt einen einzelnen Wert in ein Formularfeld
 */
function setFieldValue(elementId, value, type) {
  const element = document.getElementById(elementId);
  if (!element) return false;

  value = String(value).replace(/<[^>]*>/g, "");

  switch (type) {
    case "select":
      const options = [...element.options];
      const valid = options.some((o) => o.value === value);
      if (!valid) return false;
      element.value = value;
      break;
    case "input":
      element.value = value;
      break;
    case "textarea":
      element.value = value;
      break;
    case "checkbox":
      element.checked = value === "true" || value === "1";
      break;
    default:
      element.value = value;
  }

  return true;
}

/**
 * Lädt URL-Parameter für einen spezifischen Beleg-Typ
 */
function loadURLParametersForBeleg(belegType, params) {
  const config = URL_PARAM_CONFIG[belegType];
  if (!config) return;

  let setCount = 0;

  for (const [paramName, paramConfig] of Object.entries(config)) {
    if (params.has(paramName)) {
      let value = params.get(paramName).replace(/<[^>]*>/g, "");

      if (typeof cleanValueForInput === "function") {
        value = cleanValueForInput(
          value,
          paramConfig.type,
          paramConfig.elementId,
        );
      }

      if (setFieldValue(paramConfig.elementId, value, paramConfig.type)) {
        setCount++;
        console.log(`  ✓ ${paramName} = ${value}`);
        // Kassenbon-Vorlage: change feuern, damit die Artikel-2/3-Sichtbarkeit
        // (Taxi ⇒ versteckt) sofort stimmt
        if (paramConfig.elementId === "svgDropdownKassenbon") {
          document
            .getElementById("svgDropdownKassenbon")
            ?.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
    } else if (paramConfig.default) {
      // Setze Standardwert, falls kein Parameter übergeben wurde
      setFieldValue(
        paramConfig.elementId,
        paramConfig.default,
        paramConfig.type,
      );
    }
  }

  // E-Mail: Betreff/Text aus URL wiederherstellen (contenteditable) –
  // verzögert, weil die Vorlage erst später (belegeInitialisiert) gerendert wird.
  if (belegType === "email") {
    window._pendingEmailParams = {
      subject: params.has("betreff") ? params.get("betreff") : null,
      body: params.has("text") ? params.get("text") : null,
    };
  }

  // Zeitungsartikel: Vorschau aktualisieren
  if (belegType === "newspaper") {
    setTimeout(function () {
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
    }, 300);
  }

  console.log(`✓ ${setCount} Parameter für ${belegType} gesetzt`);
  return setCount > 0;
}

/**
 * Öffnet den Tab basierend auf URL-Parameter
 */
function openTabFromURL(tabName) {
  const tabId = TAB_MAPPING[tabName] || tabName;
  if (!tabId) return false;

  // Tab-Inhalte umschalten (robust, unabhängig von Inline-onclick-Handler-Delegation)
  const tabcontents = document.getElementsByClassName("tabcontent");
  for (let i = 0; i < tabcontents.length; i++)
    tabcontents[i].style.display = "none";
  const target = document.getElementById(tabId);
  if (!target) return false;
  target.style.display = "block";

  // Aktiven Tab-Button markieren
  const tablinks = document.getElementsByClassName("tablinks");
  for (let i = 0; i < tablinks.length; i++)
    tablinks[i].className = tablinks[i].className.replace(/\s*active/g, "");
  for (let i = 0; i < tablinks.length; i++) {
    const attr = tablinks[i].getAttribute("data-on-click") || "";
    if (attr.indexOf(tabId) !== -1) {
      tablinks[i].className += " active";
      break;
    }
  }

  // moodleDropdown ein-/ausblenden (wie openCity)
  let moodleDropdown = document.getElementById("moodleDropdown");
  if (moodleDropdown) {
    if (
      tabId === "t-konto" ||
      tabId === "buchungssatz" ||
      tabId === "vorkontierung" ||
      tabId === "einkauf" ||
      tabId === "verkauf"
    ) {
      moodleDropdown.style.display = "block";
    } else {
      moodleDropdown.style.display = "none";
    }
  }
  return true;
}

/**
 * Führt die Apply-Funktion für einen Beleg aus
 * Mit Retry-Logik falls SVG noch nicht geladen ist
 */
function executeApplyFunction(belegType, retryCount = 0) {
  const functionName = APPLY_FUNCTIONS[belegType];
  if (!functionName) return false;

  if (typeof window[functionName] !== "function") {
    console.warn(`Apply-Funktion ${functionName} nicht gefunden`);
    return false;
  }

  try {
    window[functionName]();
    console.log(`✓ Apply-Funktion ${functionName} erfolgreich ausgeführt`);
    return true;
  } catch (error) {
    // Falls SVG-Elemente noch nicht existieren, retry
    if (retryCount < 3 && error.message && error.message.includes("null")) {
      console.log(`⏳ Retry ${retryCount + 1}/3 für ${functionName}...`);
      setTimeout(() => {
        executeApplyFunction(belegType, retryCount + 1);
      }, 500);
      return false;
    }

    console.error(`✗ Fehler beim Ausführen von ${functionName}:`, error);
    return false;
  }
}

/**
 * Verarbeitet spezielle Datum-Parameter (kombiniert Tag/Monat/Jahr)
 */
function processDatumParameter(params, belegType) {
  if (!params.has("datum")) return;

  const datumValue = params.get("datum");
  const parts = datumValue.split(/[.-]/);

  if (parts.length !== 3) return;

  const [tag, monat, jahr] = parts;

  // Bestimme die richtigen Element-IDs basierend auf Beleg-Typ
  let tagId, monatId, jahrId;

  switch (belegType) {
    case "rechnung":
      tagId = "tag";
      monatId = "monat";
      jahrId = "jahr";
      break;
    case "kontoauszug":
      tagId = "tagKontoauszug";
      monatId = "monatKontoauszug";
      jahrId = "jahrKontoauszug";
      break;
    case "quittung":
      tagId = "tagQuittung";
      monatId = "monatQuittung";
      jahrId = "jahrQuittung";
      break;
    case "kassenbon":
      tagId = "tagKassenbon";
      monatId = "monatKassenbon";
      jahrId = "jahrKassenbon";
      break;
    case "bescheid":
      tagId = "tagBescheid";
      monatId = "monatBescheid";
      jahrId = "jahrBescheid";
      break;
    case "mahnung":
      tagId = "tagMahnung";
      monatId = "monatMahnung";
      jahrId = "jahrMahnung";
      break;
    case "anlagenkarte":
      tagId = "tagAnlagenkarte";
      monatId = "monatAnlagenkarte";
      jahrId = "jahrAnlagenkarte";
      break;
    case "wertpapiere":
      tagId = "tagWertpapiereInput";
      monatId = "monatWertpapiereInput";
      jahrId = "jahrWertpapiere";
      break;
    default:
      return;
  }

  if (tag && tagId) setFieldValue(tagId, tag.padStart(2, "0"), "select");
  if (monat && monatId)
    setFieldValue(monatId, monat.padStart(2, "0"), "select");
  if (jahr && jahrId) setFieldValue(jahrId, jahr, "input");
}

/**
 * Hauptinitialisierung - wird beim DOMContentLoaded aufgerufen
 */
function initializeURLParameters() {
  const params = new URLSearchParams(window.location.search);

  // Prüfe, ob überhaupt Parameter vorhanden sind
  if (params.toString() === "") return;

  // 1. Bestimme den Beleg-Typ
  let belegType = null;

  // Prüfe verschiedene Parameter-Namen für Beleg-Typ
  for (const paramName of ["beleg", "tab", "type"]) {
    if (params.has(paramName)) {
      const value = params.get(paramName).toLowerCase().trim();
      belegType = TAB_MAPPING[value] || value;
      break;
    }
  }

  // Wenn kein Beleg-Typ angegeben, versuche zu erraten
  if (!belegType) {
    // Schaue, welche Parameter gesetzt sind und leite daraus den Typ ab
    if (params.has("artikel1") || params.has("menge1")) {
      belegType = "rechnung";
    } else if (params.has("vorgang1") || params.has("kontostand_alt")) {
      belegType = "kontoauszug";
    } else if (params.has("zweck") && params.has("netto")) {
      belegType = "quittung";
    }
    // ... weitere Heuristiken können hier hinzugefügt werden
  }

  if (!belegType) {
    console.log("Kein gültiger Beleg-Typ gefunden");
    return;
  }

  console.log(`📋 Initialisiere Beleg: ${belegType}`);

  // 2. Öffne den richtigen Tab
  const tabOpened = openTabFromURL(belegType);
  if (!tabOpened) {
    console.error(`✗ Tab für ${belegType} konnte nicht geöffnet werden`);
    return;
  }

  console.log(`✓ Tab geöffnet: ${belegType}`);

  // E-Mail-Inhalte (Betreff/Text) sofort vormerken, damit sie nach dem
  // Beleg-Aufbau (belegeInitialisiert) gesetzt werden können.
  if (belegType === "email") {
    const p = new URLSearchParams(window.location.search);
    window._pendingEmailParams = {
      subject: p.has("betreff") ? p.get("betreff") : null,
      body: p.has("text") ? p.get("text") : null,
    };
  }

  // 3. Warte, bis Tab vollständig geladen ist
  setTimeout(() => {
    // 4. Lade Parameter für diesen Beleg
    const parametersSet = loadURLParametersForBeleg(belegType, params);

    if (parametersSet) {
      console.log(`✓ Parameter gesetzt für ${belegType}`);
    }

    // 5. Verarbeite spezielle Datum-Parameter
    processDatumParameter(params, belegType);

    // 6. Warte nochmal kurz, dann SVG laden (falls nötig)
    setTimeout(() => {
      // Für Belege, die SVG-Templates laden müssen
      const needsSVGLoad = [
        "rechnung",
        "kontoauszug",
        "email",
        "quittung",
        "kassenbon",
        "lohnjournal",
        "bescheid",
        "insolvenz",
        "mahnung",
        "anlagenkarte",
        "wertpapiere",
      ];

      if (needsSVGLoad.includes(belegType)) {
        // Lade SVG zuerst (falls applySVGholen existiert)
        if (typeof window.applySVGholen === "function") {
          console.log("⏳ Lade SVG-Template...");
          window.applySVGholen();

          // Warte bis SVG geladen ist
          setTimeout(() => {
            executeApplyFunction(belegType);
          }, 1000);
        } else {
          // Kein SVG-Laden nötig, direkt Apply
          executeApplyFunction(belegType);
        }
      } else {
        // Direkt Apply für Belege ohne SVG
        if (parametersSet) {
          executeApplyFunction(belegType);
        }
      }
    }, 300);
  }, 500);
}

// ============================================================================
// EVENT LISTENER
// ============================================================================

// Initialisierung beim Laden der Seite

function autoSelectMyCompanyOnlyIfNeeded() {
  const company = localStorage.getItem("myCompany");
  if (!company) return;

  document.querySelectorAll("select.meinUnternehmen").forEach((select) => {
    // Nur setzen, wenn leer oder Placeholder
    if (
      !select.value ||
      select.value.trim() === "" ||
      select.value === "Bitte wählen"
    ) {
      const opt = Array.from(select.options).find(
        (o) => o.value === company || o.text === company,
      );
      if (opt) {
        select.value = opt.value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // URL-Parameter (insbesondere Selects wie lieferer/kunde) erst anwenden, nachdem
  // die YAML-Unternehmensdaten geladen sind – sonst sind die Dropdown-Optionen
  // noch leer und Select-Parameter gehen verloren.
  function runInit() {
    initializeURLParameters(); // zuerst!
  }
  if (
    typeof yamlData !== "undefined" &&
    yamlData?.length > 0 &&
    document.querySelector("select.meinUnternehmen")?.options.length > 0
  ) {
    autoSelectMyCompanyOnlyIfNeeded();
    runInit();
  } else {
    document.addEventListener(
      "yamlDataLoaded",
      () => {
        autoSelectMyCompanyOnlyIfNeeded();
        runInit();
      },
      { once: true },
    );
  }
});

// Nach vollständigem Beleg-Aufbau (applySVG etc.) ausstehende E-Mail-Inhalte setzen
document.addEventListener(
  "belegeInitialisiert",
  function () {
    const p = window._pendingEmailParams;
    // E-Mail-Daten (Absendername etc.) nachladen
    try {
      if (typeof loadEmailData === "function") loadEmailData();
    } catch (e) {}
    try {
      if (typeof loadCompanyDataforEmail === "function")
        loadCompanyDataforEmail();
    } catch (e) {}
    if (!p) return;
    function applyEmailContent() {
      if (p.subject) {
        const el = document.getElementById("emailSubject");
        if (el) el.textContent = p.subject;
      }
      if (p.body) {
        const el = document.getElementById("emailTextMessage");
        if (el) el.textContent = p.body;
      }
    }
    applyEmailContent();
    setTimeout(applyEmailContent, 300);
    setTimeout(applyEmailContent, 1000);
    setTimeout(function () {
      window._pendingEmailParams = null;
    }, 1100);
  },
  { once: true },
);
