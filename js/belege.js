// ============================================================================
// GLOBALE VARIABLEN
// ============================================================================
let yamlData = []; // Initialize yamlData as an empty array
let nummerKunde = 0;

// Hilfsfunktionen für die Deduplizierung von Unternehmen (Prüfung nach id + Name)
function unternehmenSchluesselBelege(c) {
  return (
    String(c?.unternehmen?.id ?? "") +
    "|" +
    String(c?.unternehmen?.name ?? "")
      .trim()
      .toLowerCase()
  );
}
function existiertInCoreBelege(unternehmen, coreData) {
  const schluessel = unternehmenSchluesselBelege(unternehmen);
  const name = String(unternehmen?.unternehmen?.name ?? "")
    .trim()
    .toLowerCase();
  return (coreData || []).some(
    (c) =>
      unternehmenSchluesselBelege(c) === schluessel ||
      String(c?.unternehmen?.name ?? "")
        .trim()
        .toLowerCase() === name,
  );
}
function dedupliziereUnternehmenBelege(liste) {
  const seen = new Set();
  const out = [];
  for (const c of liste || []) {
    const key = unternehmenSchluesselBelege(c);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}

// Zentrale Initialisierung: Core IMMER zuerst laden, dann (falls vorhanden)
// nur die zusätzlichen, hochgeladenen Unternehmen ergänzen.
async function initializeYamlData() {
  // 1. Core IMMER frisch laden (Cache-busting), damit Änderungen an
  //    js/unternehmen.yml sofort sichtbar werden. Cache nur als Fallback.
  let coreData = [];
  try {
    const resp = await fetch("js/unternehmen.yml?v=" + Date.now());
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    const text = await resp.text();
    coreData = jsyaml.load(text) || [];
    try {
      localStorage.setItem("standardYamlData", JSON.stringify(coreData));
    } catch (e) {}
  } catch (e) {
    console.warn(
      "Core-YAML konnte nicht frisch geladen werden, Fallback auf Cache",
      e,
    );
    try {
      coreData = JSON.parse(localStorage.getItem("standardYamlData") || "[]");
    } catch (_) {
      coreData = [];
    }
  }

  // 2. Zusätzliche (hochgeladene) Unternehmen, dedupliziert gegen Core.
  //    id-Kollisionen (gleiche id, anderer Name) werden durch Vergabe einer neuen id aufgelöst.
  let zusaetzliche = [];
  const uploadedJSON = localStorage.getItem("uploadedYamlCompanyData");
  if (uploadedJSON) {
    try {
      const uploaded = JSON.parse(uploadedJSON);
      const verwendeteIds = new Set(coreData.map((c) => c?.unternehmen?.id));
      for (const u of uploaded) {
        if (existiertInCoreBelege(u, coreData)) continue; // exaktes Duplikat → überspringen
        if (verwendeteIds.has(u?.unternehmen?.id)) {
          const maxId = Math.max(
            0,
            ...[...coreData, ...zusaetzliche].map(
              (c) => Number(c?.unternehmen?.id) || 0,
            ),
          );
          let neueId = maxId + 1;
          while (
            verwendeteIds.has(neueId) ||
            zusaetzliche.some((x) => x?.unternehmen?.id === neueId)
          )
            neueId++;
          const copy = JSON.parse(JSON.stringify(u));
          if (copy.unternehmen) copy.unternehmen.id = neueId;
          verwendeteIds.add(neueId);
          zusaetzliche.push(copy);
        } else {
          verwendeteIds.add(u?.unternehmen?.id);
          zusaetzliche.push(u);
        }
      }
      if (zusaetzliche.length === 0) {
        localStorage.removeItem("uploadedYamlCompanyData");
      } else {
        localStorage.setItem(
          "uploadedYamlCompanyData",
          JSON.stringify(zusaetzliche),
        );
      }
    } catch (e) {
      localStorage.removeItem("uploadedYamlCompanyData");
    }
  }

  // 3. Zusammenführen
  yamlData = dedupliziereUnternehmenBelege([...coreData, ...zusaetzliche]);

  // 4. Eigene (manuell angelegte) Unternehmen ergänzen
  mergeUserCompaniesIntoYamlData();

  // Dropdowns aktualisieren
  updateAllDropdowns();

  console.log(
    "Finale yamlData (belege) hat jetzt",
    yamlData.length,
    "Unternehmen (Core + zusätzliche + eigene)",
  );
  console.log(
    "[belege] Eigene Unternehmen:",
    getUserCompanies()
      .map((c) => c?.unternehmen?.name)
      .filter(Boolean),
  );
  console.log(
    "[belege] Gespeichertes Modellunternehmen (myCompany):",
    (localStorage.getItem("myCompany") || "").trim() || "(keines)",
  );
  console.log(
    "[belege] Liste:",
    yamlData.map((c) =>
      (
        c?.unternehmen?.id +
        " " +
        c?.unternehmen?.name +
        " " +
        (c?.unternehmen?.rechtsform || "")
      ).trim(),
    ),
  );
}

function safelyParseSVG(svgText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "text/html");
  const svg = doc.querySelector("svg");
  const target = svg || doc.body;
  if (!target || (target === doc.body && target.children.length === 0))
    return null;
  const scripts = target.querySelectorAll("script");
  scripts.forEach((s) => s.remove());
  if (svg) return svg;
  const fragment = document.createDocumentFragment();
  const children = [...target.children];
  children.forEach((child) => fragment.appendChild(child));
  return fragment;
}

// ============================================================================
// KONFIGURATIONEN
// ============================================================================
const DROPDOWN_CONFIG = {
  datenKunde: { onChange: loadCompanyData, autoUpdate: true },
  datenLieferer: { onChange: loadSupplierData, autoUpdate: true },
  datenKontoauszug: { onChange: loadKontoauszugData, autoUpdate: false },
  datenEmail: { onChange: loadEmailData, autoUpdate: false },
  datenEmailKunde: { onChange: loadCompanyDataforEmail, autoUpdate: false },
  datenQuittung: { onChange: loadQuittungData, autoUpdate: false },
  datenQuittungKunde: {
    onChange: loadCompanyDataforQuittung,
    autoUpdate: false,
  },
  datenKassenbon: { onChange: loadKassenbonData, autoUpdate: false },
  datenKassenbonKunde: {
    onChange: loadCompanyDataforKassenbon,
    autoUpdate: false,
  },
  datenLohnjournal: { onChange: loadLohnjournalData, autoUpdate: false },
  datenBescheid: { onChange: loadBescheidData, autoUpdate: false },
  datenMahnung: { onChange: loadMahnungData, autoUpdate: false },
  datenMahnungEmpfaenger: {
    onChange: loadMahnungEmpfaengerData,
    autoUpdate: false,
  },
  datenAnlagenkarte: { onChange: loadAnlagenkarteData, autoUpdate: false },
  datenWertpapiere: { onChange: loadWertpapiereData, autoUpdate: false },
  datenLohnabrechnung: { onChange: loadLohnabrechnungFirma, autoUpdate: false },
};

// Konfiguration für Beleg-Datenfelder
const BELEG_FIELD_MAPPING = {
  kontoauszug: {
    fields: {
      kontoauszugBank: "unternehmen.bank",
      kontoauszugIban: "unternehmen.iban",
      kontoauszugBic: "unternehmen.bic",
      kontoauszugName: (data) =>
        `${data.unternehmen.name} ${data.unternehmen.rechtsform}`,
      kontoauszugAdresse: "unternehmen.adresse.strasse",
      kontoauszugOrt: (data) =>
        `${data.unternehmen.adresse.plz} ${data.unternehmen.adresse.ort}`,
    },
  },
  quittung: {
    fields: {
      quittungName: (data) =>
        `${data.unternehmen.name} ${data.unternehmen.rechtsform}`,
      quittungStrasse: "unternehmen.adresse.strasse",
      quittungOrt: (data) =>
        `${data.unternehmen.adresse.plz} ${data.unternehmen.adresse.ort}`,
      quittungInhaber: "unternehmen.inhaber",
      quittungOrtDatum: "unternehmen.adresse.ort",
    },
  },
  kassenbon: {
    fields: {
      kassenbonName: (data) =>
        `${data.unternehmen.name} ${data.unternehmen.rechtsform}`,
      kassenbonStrasse: "unternehmen.adresse.strasse",
      kassenbonUSTID: "unternehmen.ust_id",
      kassenbonSteuernummer: "unternehmen.steuernummer",
      kassenbonOrt: (data) =>
        `${data.unternehmen.adresse.plz} ${data.unternehmen.adresse.ort}`,
      kassenbonInhaber: "unternehmen.inhaber",
    },
  },
  lohnjournal: {
    fields: {
      lohnjournalName: (data) =>
        `${data.unternehmen.name} ${data.unternehmen.rechtsform}`,
      lohnjournalStrasse: "unternehmen.adresse.strasse",
      lohnjournalOrt: (data) =>
        `${data.unternehmen.adresse.plz} ${data.unternehmen.adresse.ort}`,
    },
  },
  anlagenkarte: {
    fields: {
      anlagenkarteName: (data) =>
        `${data.unternehmen.name} ${data.unternehmen.rechtsform}`,
      anlagenkarteStrasse: "unternehmen.adresse.strasse",
      anlagenkarteOrt: (data) =>
        `${data.unternehmen.adresse.plz} ${data.unternehmen.adresse.ort}`,
    },
  },
  wertpapiere: {
    fields: {
      wertpapiereName: (data) =>
        `${data.unternehmen.name} ${data.unternehmen.rechtsform}`,
      wertpapiereStrasse: "unternehmen.adresse.strasse",
      wertpapiereID: (data) => data.unternehmen.id * 6,
      wertpapiereBank: "unternehmen.bank",
      wertpapiereOrt: (data) =>
        `${data.unternehmen.adresse.plz} ${data.unternehmen.adresse.ort}`,
    },
  },
  bescheid: {
    fields: {
      bescheidName: (data) =>
        `${data.unternehmen.name} ${data.unternehmen.rechtsform}`,
      bescheidInhaber: "unternehmen.inhaber",
    },
    classFields: {
      bescheidOrtInhaber: (data) =>
        `${data.unternehmen.adresse.plz} ${data.unternehmen.adresse.ort}`,
      bescheidOrt: "unternehmen.adresse.ort",
      bescheidStrasse: "unternehmen.adresse.strasse",
    },
    customLogic: (data) => {
      // Aktenzeichen
      const randomNum = Math.floor(Math.random() * 9000000) + 1000000;
      const aktenzeichen = document.getElementById("bescheidAktenzeichen1");
      if (aktenzeichen) aktenzeichen.textContent = "K" + randomNum;

      // Nummer im Kfz-Bescheid: Dokumentennummer der Zulassungsbehörde/
      // Bundesdruckerei – 2 Buchstaben (Druckerei-Code) + 10-stellige
      // fortlaufende Seriennummer + Prüfziffer (Luhn) → fälschungssicher
      const kfzNummer = document.getElementById("bescheidKfzNummer");
      if (kfzNummer) {
        const buchstaben = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const praefix =
          buchstaben.charAt(Math.floor(Math.random() * 26)) +
          buchstaben.charAt(Math.floor(Math.random() * 26));
        let seriennummer = "";
        for (let i = 0; i < 10; i++) {
          seriennummer += Math.floor(Math.random() * 10);
        }
        let summe = 0;
        for (let i = 0; i < seriennummer.length; i++) {
          let ziffer = parseInt(seriennummer.charAt(i), 10);
          if (i % 2 === 0) {
            ziffer *= 2;
            if (ziffer > 9) ziffer -= 9;
          }
          summe += ziffer;
        }
        const pruefziffer = (10 - (summe % 10)) % 10;
        kfzNummer.textContent = `${praefix} ${seriennummer}-${pruefziffer}`;
      }

      // Nummer
      const nummer = document.getElementById("bescheidNummer");
      if (nummer) nummer.textContent = FormatHelper.roundToTwo(randomNum / 3);

      if (data.unternehmen?.branche?.trim() === "Familie") {
        SafeDOM.setAttr("bescheidName", "transform", "translate(0, 20)");
      }
    },
  },
  mahnung: {
    fields: {
      mahnungName: (data) =>
        `${data.unternehmen.name} ${data.unternehmen.rechtsform}`,
      mahnungBank: "unternehmen.bank",
      mahnungIban: "unternehmen.iban",
      mahnungBic: "unternehmen.bic",
    },
    classFields: {
      mahnungKontaktzeile: (data) =>
        `${data.unternehmen.name} ${data.unternehmen.rechtsform || ""} * ${data.unternehmen.adresse.strasse} * ${data.unternehmen.adresse.plz} ${data.unternehmen.adresse.ort}`.trim(),
      mahnungOrt: "unternehmen.adresse.ort",
    },
    customLogic: (data) => {
      loadLogoToSVG(
        data.unternehmen.logo,
        "mahnungSVG",
        "logo-placeholderMahnung",
      );
      // Trennlinie im Briefkopf in der Akzentfarbe des Modells
      // Unternehmens aus der YAML (Fallback: Rot)
      SafeDOM.setAttr(
        "mahnungAkzentlinie",
        "fill",
        data.unternehmen.akzent || "red",
      );
    },
  },
  mahnungEmpfaenger: {
    fields: {
      mahnungKundeName: (data) =>
        `${data.unternehmen.name} ${data.unternehmen.rechtsform || ""}`.trim(),
      mahnungKundeInhaber: "unternehmen.inhaber",
      mahnungKundeStrasse: "unternehmen.adresse.strasse",
      mahnungKundeOrt: (data) =>
        `${data.unternehmen.adresse.plz} ${data.unternehmen.adresse.ort}`,
    },
  },
  email: {
    fields: {
      emailName: (data) =>
        `${data.unternehmen.name} ${data.unternehmen.rechtsform}`,
    },
    classFields: {
      emailInhaber: "unternehmen.inhaber",
    },
    customLogic: (data) => {
      loadLogoToSVG(data.unternehmen.logo, "emailSVG", "logo-placeholderEmail");
    },
  },
  kunde: {
    fields: {
      nameKunde: (data) =>
        `${data.unternehmen.name} ${data.unternehmen.rechtsform}`,
      inhaberKunde: "unternehmen.inhaber",
      strasseKunde: "unternehmen.adresse.strasse",
      plzKunde: (data) =>
        `${data.unternehmen.adresse.plz} ${data.unternehmen.adresse.ort}`,
    },
    customLogic: (data) => {
      // Bestehende Logik (unverändert)
      const rechnungsNummer = Math.floor(Math.random() * 900) + 100;
      const element = document.getElementById("rechnungsNummer");
      if (element) element.textContent = rechnungsNummer;

      window.nummerKunde = data.unternehmen.id;

      // === NEU: Bei Branche "Familie" → nameKunde 20 Einheiten nach unten ===
      if (data.unternehmen?.branche?.trim() === "Familie") {
        SafeDOM.setAttr("nameKunde", "transform", "translate(0, 20)");
      }
    },
  },
  kundeQuittung: {
    fields: {
      quittungNameKunde: (data) =>
        `${data.unternehmen.inhaber}, ${data.unternehmen.name}`,
    },
  },
  kundeKassenbon: {
    fields: {
      kassenbonStrasseKunde: "unternehmen.adresse.strasse",
      kassenbonOrtKunde: (data) =>
        `${data.unternehmen.adresse.plz} ${data.unternehmen.adresse.ort}`,
    },
  },
  lohnabrechnungFirma: {
    fields: {
      lohnabrechnungFirmaName: (data) =>
        `${data.unternehmen.name} ${data.unternehmen.rechtsform}`,
      lohnabrechnungFirmaStrasse: "unternehmen.adresse.strasse",
      lohnabrechnungFirmaOrt: (data) =>
        `${data.unternehmen.adresse.plz} ${data.unternehmen.adresse.ort}`,
    },
  },
};

// ============================================================================
// HILFSFUNKTIONEN - Formatierung und Berechnungen
// ============================================================================
const FormatHelper = {
  // Auf 2 Dezimalstellen runden
  roundToTwo: (num) => Math.round(num * 100) / 100,

  // Zahl mit Tausenderpunkt formatieren
  number: (number) => new Intl.NumberFormat("de-DE").format(number),

  // Zahl mit Leerzeichen statt Punkt formatieren
  numberSpace: (number) => {
    const formatted = new Intl.NumberFormat("de-DE").format(number);
    return formatted.replace(/\./g, " ");
  },

  // Währung formatieren (mit €)
  currency: (amount) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  },

  // Währung mit Vorzeichen formatieren
  currencyWithSign: (amount) => {
    const formatted = new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(Math.abs(amount));
    const sign = amount >= 0 ? "+" : "–";
    return `${formatted} ${sign}`;
  },
};

// Hilfsfunktion, um den numerischen Wert eines Eingabefelds zu erhalten
function getNumericValue(inputId) {
  const inputValue = document.getElementById(inputId).value;
  return parseFloat(inputValue) || 0; // Rückgabe von 0, wenn die Umwandlung fehlschlägt
}

// Zufallsgeneratoren
const RandomHelper = {
  // Zufällige Nummer zwischen min und max
  number: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,

  // Zufällige 7-stellige Nummer
  sevenDigit: () => Math.floor(Math.random() * 9000000) + 1000000,

  // Zufällige Zeit zwischen 10:00 und 16:59
  time: () => {
    const hour = Math.floor(Math.random() * 7) + 10;
    const minute = Math.floor(Math.random() * 60);
    return `${hour}:${minute < 10 ? "0" + minute : minute}`;
  },
};

// ============================================================================
// SAFE DOM HELPER - Verhindert Null-Pointer Fehler
// ============================================================================
const SafeDOM = {
  // Mehrfach-IDs erlaubt: Beleg-Vorlagen dürfen dieselbe id mehrfach einsetzen
  // (z. B. emailNameKunde mehrfach in mail3.html) – alle Treffer werden gefüllt.
  alleMitId: (id) => Array.from(document.querySelectorAll(`[id="${id}"]`)),
  setText: (id, text) => {
    document.querySelectorAll(`[id="${id}"]`).forEach((el) => {
      el.textContent = text;
    });
  },
  setHTML: (id, html) => {
    document.querySelectorAll(`[id="${id}"]`).forEach((el) => {
      el.innerHTML = html;
    });
  },
  setValue: (id, value) => {
    document.querySelectorAll(`[id="${id}"]`).forEach((el) => {
      el.value = value;
    });
  },
  setAttr: (id, attr, value) => {
    document
      .querySelectorAll(`[id="${id}"]`)
      .forEach((el) => el.setAttribute(attr, value));
  },
  setClass: (className, text) => {
    const els = document.getElementsByClassName(className);
    for (const el of els) el.textContent = text;
  },
  exists: (id) => {
    return document.querySelector(`[id="${id}"]`) !== null;
  },
  remove: (id) => {
    document.querySelectorAll(`[id="${id}"]`).forEach((el) => el.remove());
  },
};

// ============================================================================
// BELEG-DATEN LADEN (Generisch)
// ============================================================================
function loadBelegData(belegType, dropdownId) {
  const selectedName = document.getElementById(dropdownId)?.value;
  if (!selectedName) return;

  const selectedData = yamlData.find(
    (item) => item.unternehmen.name === selectedName,
  );
  if (!selectedData) return;

  const config = BELEG_FIELD_MAPPING[belegType];
  if (!config) return;

  // Einzelne Element-IDs befüllen (auch wenn dieselbe id mehrfach vorkommt)
  if (config.fields) {
    Object.entries(config.fields).forEach(([elementId, path]) => {
      const elements = document.querySelectorAll(`[id="${elementId}"]`);
      if (elements.length === 0) return;

      let value;
      if (typeof path === "function") {
        value = path(selectedData);
      } else {
        value = path.split(".").reduce((obj, key) => obj?.[key], selectedData);
      }

      elements.forEach((element) => {
        element.textContent = value || "";
      });
    });
  }

  // Klassen-basierte Felder befüllen (z.B. für Bescheid)
  if (config.classFields) {
    Object.entries(config.classFields).forEach(([className, path]) => {
      const elements = document.getElementsByClassName(className);

      let value;
      if (typeof path === "function") {
        value = path(selectedData);
      } else {
        value = path.split(".").reduce((obj, key) => obj?.[key], selectedData);
      }

      for (const element of elements) {
        element.textContent = value || "";
      }
    });
  }

  // Custom Logik ausführen (z.B. für Zufallsnummern)
  if (config.customLogic) {
    config.customLogic(selectedData);
  }
}

// Generische Logo-Lade-Funktion
function loadLogoToSVG(logoUrl, svgContainerId, placeholderId) {
  const svgContainer = document.getElementById(svgContainerId);
  const rectElement = document.getElementById(placeholderId);

  if (!svgContainer || !rectElement) return;

  const NS = "http://www.w3.org/2000/svg";
  const box = {
    x: parseFloat(rectElement.getAttribute("x")) || 0,
    y: parseFloat(rectElement.getAttribute("y")) || 0,
    w: parseFloat(rectElement.getAttribute("width")) || 0,
    h: parseFloat(rectElement.getAttribute("height")) || 0,
  };

  // Vorherige Logo-Varianten entfernen
  svgContainer
    .querySelectorAll("#uploaded-image, #uploaded-logo")
    .forEach((el) => el.remove());

  const standardImageURL = "media/pic/standard.svg";
  const imageUrl =
    logoUrl && logoUrl.trim() !== "" ? logoUrl : standardImageURL;

  // Fallback: Logo als <image> einbetten (contain, zentriert)
  function bildeImageFallback(url) {
    const image = document.createElementNS(NS, "image");
    image.setAttribute("id", "uploaded-image");
    image.setAttribute("x", box.x);
    image.setAttribute("y", box.y);
    image.setAttribute("width", box.w);
    image.setAttribute("height", box.h);
    image.setAttribute("preserveAspectRatio", "xMidYMid meet");
    image.setAttributeNS("http://www.w3.org/1999/xlink", "href", url);
    image.setAttribute("href", url);
    svgContainer.appendChild(image);
    const probe = new Image();
    probe.onload = function () {
      const iw = probe.naturalWidth,
        ih = probe.naturalHeight;
      if (!iw || !ih) return;
      const skala = Math.min(box.w / iw, box.h / ih);
      const w = iw * skala,
        h = ih * skala;
      image.setAttribute("width", w);
      image.setAttribute("height", h);
      image.setAttribute("x", box.x + (box.w - w) / 2);
      image.setAttribute("y", box.y + (box.h - h) / 2);
    };
    probe.src = url;
  }

  // Bevorzugt: Logo-Kindknoten inline in die Mail-SVG übernehmen.
  // Eingebettete SVG-Dokumente (<image href=".svg">) clippen auf ihren EIGENEN
  // ViewBox – viele Logos (z. B. lur.svg) malen aber mit Linienstärke über ihre
  // deklarierte viewBox-Grenze hinaus, wodurch Kanten fehlen – auch im
  // PNG-Export (html2canvas). Inline+transform entfällt dieser innere Clip.
  // Die Kindknoten werden "hygienisiert": metadata/script raus, alle IDs mit
  // Präfix (meinbwr-logo-) gedisst – inkl. Rückwärtsreferenzen url(#…)/#id –,
  // und exakt per getBBox() in die Platzhalterbox eingepasst.
  const LOGO_PRÄFIX = "meinbwr-logo-";

  function versucheInline(url) {
    fetch(url)
      .then((r) =>
        r.ok ? r.text() : Promise.reject(new Error("HTTP " + r.status)),
      )
      .then(function (text) {
        const doc = new DOMParser().parseFromString(text, "image/svg+xml");
        const inner = doc && doc.documentElement;
        if (
          !inner ||
          inner.nodeName.toLowerCase() !== "svg" ||
          doc.querySelector("parsererror")
        ) {
          return bildeImageFallback(url);
        }
        // deklarierte Maße als Fallback für die Einpassung
        let vw = 0,
          vh = 0,
          vx = 0,
          vy = 0;
        const vb = (inner.getAttribute("viewBox") || "").match(
          /(-?[\d.]+)[\s,]+(-?[\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/,
        );
        if (vb) {
          vx = +vb[1];
          vy = +vb[2];
          vw = +vb[3];
          vh = +vb[4];
        }
        if (!vw || !vh) {
          vw = parseFloat(inner.getAttribute("width"));
          vh = parseFloat(inner.getAttribute("height"));
          vx = 0;
          vy = 0;
        }
        if (!vw || !vh) return bildeImageFallback(url);

        const content = document.createElementNS(NS, "g");
        const aussen = document.createElementNS(NS, "g");
        aussen.setAttribute("id", "uploaded-logo");
        aussen.appendChild(content);
        let kinder = 0;
        Array.from(inner.childNodes).forEach(function (kind) {
          if (kind.nodeType === 8) return; // Kommentar
          const name = (kind.nodeName || "").toLowerCase();
          if (name === "metadata" || name === "script") return; // Lizenz-Blobs etc.
          content.appendChild(document.importNode(kind, true));
          kinder++;
        });
        if (!kinder) return bildeImageFallback(url);

        // IDs namespace-en und alle Referenzen auf sie mitziehen
        (function namespaceIds(wurzel) {
          const idMap = {};
          [wurzel]
            .concat(Array.from(wurzel.querySelectorAll("[id]")))
            .forEach(function (el) {
              const alt = el.getAttribute && el.getAttribute("id");
              if (alt && !idMap.hasOwnProperty(alt))
                idMap[alt] = LOGO_PRÄFIX + alt;
            });
          // IDs tatsächlich umbenennen (Referenzen werden unten mitgezogen)
          [wurzel]
            .concat(Array.from(wurzel.querySelectorAll("[id]")))
            .forEach(function (el) {
              const alt = el.getAttribute("id");
              if (alt && idMap[alt]) el.setAttribute("id", idMap[alt]);
            });
          function ersetzeRefs(text) {
            if (!text || text.indexOf("#") === -1) return text;
            return String(text)
              .replace(
                /url\(\s*['"]?#([^\s'")]+)['"]?\s*\)/g,
                function (a, id) {
                  return "url(#" + (idMap[id] || id) + ")";
                },
              )
              .replace(/^#([A-Za-z_][\w:.-]*)$/, function (a, id) {
                return "#" + (idMap[id] || id);
              })
              .replace(
                /(^|[\s,{])#([A-Za-z_][\w:.-]*)/g,
                function (a, pre, id) {
                  return pre + "#" + (idMap[id] || id);
                },
              );
          }
          [wurzel]
            .concat(Array.from(wurzel.querySelectorAll("*")))
            .forEach(function (el) {
              if (el.attributes) {
                Array.from(el.attributes).forEach(function (at) {
                  const neu = ersetzeRefs(at.value);
                  if (neu !== at.value) {
                    if (at.namespaceURI)
                      el.setAttributeNS(at.namespaceURI, at.name, neu);
                    else el.setAttribute(at.name, neu);
                  }
                });
              }
              if (el.nodeName && el.nodeName.toLowerCase() === "style") {
                el.textContent = ersetzeRefs(el.textContent);
              }
            });
        })(content);

        // Einpassung: exakte content-Grenzen messen, Fallback auf viewBox
        svgContainer.appendChild(aussen);
        let bb = null;
        try {
          const mess = content.getBBox();
          if (mess && mess.width > 0 && mess.height > 0) bb = mess;
        } catch (e) {
          /* nicht verlegbar/gerendert – Fallback unten */
        }
        // Pathologische BBox abfangen: manche Logos enthalten Elemente,
        // die weit außerhalb liegen (Inkscape-Artefakte; chemie.svg hat z. B.
        // einen Punkt bei y ≈ -13.000). Die deklarierte viewBox ist dann die
        // verlässliche Referenz – sonst würde das Logo winzig skaliert und
        // wäre unsichtbar. Bewusste kleine Überstände (z. B. lur.svg)
        // bleiben unangetastet.
        if (bb && (bb.height > vh * 20 || bb.width > vw * 20)) {
          bb = { x: vx, y: vy, width: vw, height: vh };
        }
        if (!bb) bb = { x: vx, y: vy, width: vw, height: vh };
        const zugabe = Math.max(bb.width, bb.height) * 0.025; // Linien-Überstand
        const ew = bb.width + zugabe * 2,
          eh = bb.height + zugabe * 2;
        const skala = Math.min(box.w / ew, box.h / eh);
        const tx = box.x + (box.w - ew * skala) / 2 - (bb.x - zugabe) * skala;
        const ty = box.y + (box.h - eh * skala) / 2 - (bb.y - zugabe) * skala;
        aussen.setAttribute(
          "transform",
          "translate(" + tx + " " + ty + ") scale(" + skala + ")",
        );
      })
      .catch(function () {
        bildeImageFallback(url);
      });
  }

  versucheInline(imageUrl);
}

// Hilfsfunktion für Handelsregister-Bestimmung
function getHandelsregister(rechtsform) {
  const erlaubteRechtsformen = [
    "e. K.",
    "e. Kfr.",
    "OHG",
    "KG",
    "GmbH & Co. KG",
    "GmbH & Co. OHG",
  ];

  if (!rechtsform || rechtsform === "") return "";
  if (erlaubteRechtsformen.includes(rechtsform)) return "HRA";
  return "HRB";
}

// Lieferanten-spezifische Logik
function applySupplierSpecificData(data) {
  // Handelsregister
  const handelsregister = getHandelsregister(data.unternehmen.rechtsform);
  const amtsgericht = document.getElementById("amtsgerichtLieferer");
  if (amtsgericht) {
    amtsgericht.textContent = `Amtsgericht ${data.unternehmen.adresse.ort} ${handelsregister}`;
  }

  // Kundennummer berechnen
  const nummerKundeElement = document.getElementById("nummerKunde");
  if (nummerKundeElement && window.nummerKunde) {
    nummerKundeElement.textContent =
      window.nummerKunde * data.unternehmen.id * 9 + 133;
  }

  // Akzentfarbe
  const akzentColor = data.unternehmen.akzent || "#7db9f5";
  const colorSVGElements = document.querySelectorAll(".colorSVG");
  colorSVGElements.forEach((element) => {
    if (element instanceof SVGElement) {
      element.setAttribute("fill", akzentColor);
    } else {
      element.style.backgroundColor = akzentColor;
    }
  });

  const colorPicker = document.getElementById("colorPicker");
  if (colorPicker) colorPicker.value = akzentColor;

  adjustTextColor();

  // Logo laden
  loadSupplierLogo(data.unternehmen.logo);
}

let supplierLogoRequestId = 0;

function removeSupplierLogos() {
  const svgContainer = document.getElementById("rechnungSVG");
  if (!svgContainer) return;
  svgContainer
    .querySelectorAll("#uploaded-image, g.logo-svg, image.logo-image")
    .forEach((el) => el.remove());
}

// Misst nur tatsächlich gezeichnete Elemente (ohne symbol/defs/clipPath/...)
function measureRenderedBBox(g) {
  const svgRoot = g.ownerSVGElement;
  const inv = g.getCTM().inverse();
  const pt = svgRoot.createSVGPoint();
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  g.querySelectorAll(
    "path,rect,circle,ellipse,line,polyline,polygon,text,image,use",
  ).forEach((el) => {
    if (el.closest("symbol,defs,clipPath,mask,marker,pattern")) return;
    let b;
    try {
      b = el.getBBox();
    } catch (e) {
      return;
    }
    if (b.width === 0 && b.height === 0) return;

    const m = inv.multiply(el.getCTM()); // Element → Koordinaten von g
    [
      [b.x, b.y],
      [b.x + b.width, b.y],
      [b.x, b.y + b.height],
      [b.x + b.width, b.y + b.height],
    ].forEach(([px, py]) => {
      pt.x = px;
      pt.y = py;
      const t = pt.matrixTransform(m);
      minX = Math.min(minX, t.x);
      minY = Math.min(minY, t.y);
      maxX = Math.max(maxX, t.x);
      maxY = Math.max(maxY, t.y);
    });
  });

  if (!isFinite(minX)) return { x: 0, y: 0, width: 0, height: 0 };
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

// Entfernt Editor-Metadaten und Elemente/Attribute mit Namespace-Präfix,
// die nach dem HTML-Parsing nicht mehr an einen Namespace gebunden sind
const SVG_ELEMENTS = new Set([
  // Struktur
  "svg",
  "g",
  "defs",
  "symbol",
  "use",
  "switch",
  "a",
  "view",
  // Formen
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  // Text
  "text",
  "tspan",
  "textpath",
  // Bild und Einbettung
  "image",
  "foreignobject",
  // Beschreibung
  "title",
  "desc",
  // Verläufe, Muster, Masken
  "lineargradient",
  "radialgradient",
  "stop",
  "pattern",
  "clippath",
  "mask",
  "marker",
  // Stil
  "style",
  // Filter
  "filter",
  "feblend",
  "fecolormatrix",
  "fecomponenttransfer",
  "fecomposite",
  "feconvolvematrix",
  "fediffuselighting",
  "fedisplacementmap",
  "fedropshadow",
  "feflood",
  "fefunca",
  "fefuncb",
  "fefuncg",
  "fefuncr",
  "fegaussianblur",
  "feimage",
  "femerge",
  "femergenode",
  "femorphology",
  "feoffset",
  "fespecularlighting",
  "fetile",
  "feturbulence",
  "fedistantlight",
  "fepointlight",
  "fespotlight",
]);

function stripForeignNamespaces(root) {
  [...root.querySelectorAll("*")].forEach((el) => {
    if (!root.contains(el)) return; // schon mit Elternteil entfernt
    if (!SVG_ELEMENTS.has(el.localName.toLowerCase())) el.remove();
  });
  root.querySelectorAll("*").forEach((el) => {
    [...el.attributes].forEach((attr) => {
      const n = attr.name;
      const ok = n === "xlink:href" || n === "xml:space" || !n.includes(":");
      if (n.startsWith("xmlns") || !ok) el.removeAttribute(n);
    });
  });
}

function loadSupplierLogo(logoUrl) {
  const svgContainer = document.getElementById("rechnungSVG");
  const rectElement = document.getElementById("logo-placeholder");
  if (!svgContainer || !rectElement) return;

  const requestId = ++supplierLogoRequestId; // nur der letzte Aufruf zählt
  removeSupplierLogos();

  const x = rectElement.getAttribute("x");
  const y = rectElement.getAttribute("y");
  const width = rectElement.getAttribute("width");
  const height = rectElement.getAttribute("height");
  const standardImageURL = "media/pic/standard.svg";

  const appendImage = (href) => {
    if (requestId !== supplierLogoRequestId) return; // veraltet
    removeSupplierLogos(); // Sicherheitsnetz
    const image = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image",
    );
    image.setAttribute("id", "uploaded-image");
    image.setAttribute("x", x);
    image.setAttribute("y", y);
    image.setAttribute("width", width);
    image.setAttribute("height", height);
    image.setAttributeNS("http://www.w3.org/1999/xlink", "href", href);
    svgContainer.appendChild(image);
  };

  // Base64-Logo (eigene Unternehmen): synchron
  if (logoUrl && logoUrl.startsWith("data:image")) {
    appendImage(logoUrl);
    return;
  }

  const imageUrl =
    logoUrl &&
    logoUrl.trim() !== "" &&
    (logoUrl.startsWith("http") || logoUrl.endsWith(".svg"))
      ? logoUrl
      : standardImageURL;

  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (requestId !== supplierLogoRequestId) return; // veraltet
    if (xhr.status !== 200) return;

    const svgElement = safelyParseSVG(xhr.responseText);
    if (!svgElement) return;

    removeSupplierLogos(); // Sicherheitsnetz

    const bx = parseFloat(x),
      by = parseFloat(y);
    const bw = parseFloat(width),
      bh = parseFloat(height);

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.classList.add("logo-svg");

    // Attribute des ursprünglichen Logo-<svg> übernehmen
    ["fill", "stroke", "stroke-width", "style"].forEach((a) => {
      if (svgElement.getAttribute?.(a))
        g.setAttribute(a, svgElement.getAttribute(a));
    });

    while (svgElement.firstChild) g.appendChild(svgElement.firstChild);
    stripForeignNamespaces(g);

    // Erst anhängen, damit getBBox() messen kann
    svgContainer.appendChild(g);

    // viewBox lesen und prüfen
    let ref = null; // {x, y, w, h}
    const vbAttr =
      svgElement.getAttribute?.("viewBox") ||
      svgElement.getAttribute?.("viewbox");
    let vw = 0,
      vh = 0;
    if (vbAttr) {
      const p = vbAttr
        .trim()
        .split(/[\s,]+/)
        .map(Number);
      if (p.length === 4 && p.every(Number.isFinite) && p[2] > 0 && p[3] > 0) {
        vw = p[2];
        vh = p[3];
      }
    }

    // Gemessener Inhalt (Fallback)
    let bb = measureRenderedBBox(g);
    // Pathologische BBox abfangen: manche Logos enthalten Elemente, die weit
    // außerhalb liegen (Inkscape-Artefakte; ehemals chemie.svg mit einem Punkt
    // bei y ≈ -13.000). Dann vertraut der Code unten der deklarierten viewBox –
    // sonst würde das Logo winzig skaliert und wäre unsichtbar. Bewusste
    // kleine Überstände (z. B. lur.svg) bleiben unangetastet.
    if (bb && vw > 0 && vh > 0 && (bb.height > vh * 20 || bb.width > vw * 20)) {
      bb = { x: 0, y: 0, width: 0, height: 0 };
    }

    if (vbAttr) {
      const p = vbAttr
        .trim()
        .split(/[\s,]+/)
        .map(Number);
      if (p.length === 4 && p.every(Number.isFinite) && p[2] > 0 && p[3] > 0) {
        const [vx, vy] = p;
        const tol = 0.05; // 5 % Toleranz
        const inside =
          bb.width === 0 ||
          bb.height === 0 || // nicht messbar → viewBox vertrauen
          (bb.x >= vx - vw * tol &&
            bb.y >= vy - vh * tol &&
            bb.x + bb.width <= vx + vw * (1 + tol) &&
            bb.y + bb.height <= vy + vh * (1 + tol));
        if (inside) ref = { x: vx, y: vy, w: vw, h: vh };
      }
    }

    // Fallback: tatsächlichen Inhalt verwenden
    if (!ref && bb.width > 0 && bb.height > 0) {
      ref = { x: bb.x, y: bb.y, w: bb.width, h: bb.height };
    }

    if (ref) {
      const s = Math.min(bw / ref.w, bh / ref.h);
      const tx = bx + (bw - ref.w * s) / 2 - ref.x * s;
      const ty = by + (bh - ref.h * s) / 2 - ref.y * s;
      g.setAttribute("transform", `translate(${tx} ${ty}) scale(${s})`);
    }
  };
  xhr.onerror = function () {
    if (requestId !== supplierLogoRequestId) return;
    fetch(standardImageURL)
      .then((r) => r.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => appendImage(reader.result);
        reader.readAsDataURL(blob);
      });
  };
  xhr.open("GET", imageUrl);
  xhr.send();
}

// Beleg als Grafik (PNG) in die Zwischenablage kopieren – genutzt von den
// „Zwischenablage"-Buttons in belege.html und der Sammlung
function grafikInZwischenablageSchreiben(blob) {
  if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
    zeigeModal(
      "Die Zwischenablage-Unterstützung (Grafik) ist in diesem Browser nicht verfügbar.",
    );
    return;
  }
  try {
    navigator.clipboard
      .write([new ClipboardItem({ "image/png": blob })])
      .then(() =>
        zeigeModal("Beleg-Grafik wurde in die Zwischenablage kopiert."),
      )
      .catch((err) =>
        zeigeModal("Kopieren in die Zwischenablage fehlgeschlagen: " + err),
      );
  } catch (err) {
    zeigeModal("Kopieren in die Zwischenablage fehlgeschlagen: " + err);
  }
}

function kopiereGrafikInZwischenablage(typ) {
  const config = EXPORT_CONFIG[typ];
  if (!config) {
    console.error("Unbekannter Dokumenttyp:", typ);
    zeigeModal("Unbekannter Dokumenttyp: " + typ);
    return;
  }
  const htmlTypes = ["email", "newspaper", "lohnjournalBS"];
  exportPNG(
    config.id,
    buildExportFilename(typ, "png"),
    null,
    htmlTypes.includes(typ),
    "clipboard",
  );
}

// PNG-Export
function exportPNG(
  containerId,
  filename = "download.png",
  exportWidth = null,
  forceRaster = false,
  ziel = "download",
) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // forceRaster = true für HTML-Belege (E-Mail, Zeitung, …): Diese enthalten evtl.
  // kleine einzelne SVGs (z. B. das Mail-Icon). Ohne Restriktion würde exportPNG
  // sonst nur dieses eine SVG-Icon rendern statt den ganzen Beleg.
  const svg = forceRaster ? null : container.querySelector(":scope > svg");
  const scale = 2;

  const download = (canvas) => {
    canvas.toBlob((blob) => {
      if (ziel === "clipboard") {
        grafikInZwischenablageSchreiben(blob);
        return;
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      URL.revokeObjectURL(a.href);
    }, "image/png");
  };

  // HTML-Typen (E-Mail, Zeitung, ...): wie bisher
  if (!svg) {
    html2canvas(container, { scale, backgroundColor: "#ffffff" }).then(
      download,
    );
    return;
  }

  const vb = svg.viewBox && svg.viewBox.baseVal;
  const hasVB = vb && vb.width > 0 && vb.height > 0;
  const rect = svg.getBoundingClientRect();

  const w = exportWidth || (hasVB ? vb.width : rect.width);
  const h = hasVB ? (w * vb.height) / vb.width : rect.height;

  const clone = svg.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  clone.setAttribute("width", w);
  clone.setAttribute("height", h);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  clone.querySelectorAll("script").forEach((s) => s.remove());

  const data = new XMLSerializer().serializeToString(clone);
  const img = new Image();

  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    download(canvas);
  };
  img.onerror = () => zeigeModal("PNG-Export fehlgeschlagen");
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(data);
}

// Macht das Export-SVG auch für OnlyOffice/Word verträglich
function prepareSvgForExport(live, clone) {
  const NS = "http://www.w3.org/2000/svg";
  const EMOJI_CHAR = /[\u2600-\u27BF\uFE0F\u200D]/;
  const EMOJI_ALL = /[\u2600-\u27BF\uFE0F\u200D]/g;

  // 1. Feste Größe statt width:100%
  const vb = live.viewBox && live.viewBox.baseVal;
  if (vb && vb.width > 0) {
    clone.setAttribute("width", vb.width);
    clone.setAttribute("height", vb.height);
  }
  clone.removeAttribute("style");
  clone.setAttribute("xmlns", NS);
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

  // 2. Jeden Text (auch ohne tspan) in <text>-Elemente mit absoluter Startposition auflösen
  const liveTexts = live.querySelectorAll("text");
  const cloneTexts = clone.querySelectorAll("text");

  const usedIds = new Set(); // IDs müssen im Dokument eindeutig bleiben
  liveTexts.forEach((lt, i) => {
    const ct = cloneTexts[i];
    if (!ct) return;
    if (!lt.textContent.trim()) {
      ct.remove();
      return;
    } // leere Texte nicht exportieren

    // Segmente bilden, Leerzeichen wie SVG zusammenfalten
    const segs = [];
    let pos = 0,
      lastSpace = true;
    lt.childNodes.forEach((node) => {
      if (node.nodeType !== 1 && node.nodeType !== 3) return; // Kommentare überspringen
      let t = (node.textContent || "").replace(/\s+/g, " ");
      if (lastSpace && t.startsWith(" ")) t = t.slice(1);
      if (!t) return;
      segs.push({ t, start: pos, el: node.nodeType === 1 ? node : lt });
      pos += t.length;
      lastSpace = t.endsWith(" ");
    });

    let made = 0;
    segs.forEach((seg) => {
      // erstes Zeichen, das weder Leerraum noch Emoji ist
      let k = 0;
      while (
        k < seg.t.length &&
        (/\s/.test(seg.t[k]) || EMOJI_CHAR.test(seg.t[k]))
      )
        k++;
      const text = seg.t
        .slice(k)
        .replace(EMOJI_ALL, "")
        .replace(/\s+/g, " ")
        .trim();
      if (!text) return;

      let p;
      try {
        p = lt.getStartPositionOfChar(seg.start + k);
      } catch (e) {
        return;
      }

      const cs = getComputedStyle(seg.el);
      const n = document.createElementNS(NS, "text");
      n.setAttribute("x", p.x);
      n.setAttribute("y", p.y);
      n.setAttribute("font-family", cs.fontFamily);
      n.setAttribute("font-size", parseFloat(cs.fontSize));
      n.setAttribute("font-weight", cs.fontWeight);
      n.setAttribute("font-style", cs.fontStyle);
      n.setAttribute("fill", cs.fill);
      if (lt.getAttribute("transform"))
        n.setAttribute("transform", lt.getAttribute("transform"));
      n.textContent = text;
      // id und Klasse für den Beleg-Import erhalten
      const src = seg.el;
      if (src.id && !usedIds.has(src.id)) {
        n.setAttribute("id", src.id);
        usedIds.add(src.id);
      }
      const cls = src.getAttribute("class");
      if (cls) n.setAttribute("class", cls);
      ct.parentNode.insertBefore(n, ct);
      made++;
    });
    if (made > 0) ct.remove(); // Original nur entfernen, wenn Ersatz erzeugt wurde
  });

  // 3. text-anchor überall entfernen (Positionen sind jetzt absolut)
  clone
    .querySelectorAll("[text-anchor]")
    .forEach((el) => el.removeAttribute("text-anchor"));

  // 4. Filter-Schatten (z. B. Logo) entfernen, OnlyOffice ignoriert Filter
  clone.querySelectorAll('[style*="filter"]').forEach((el) => el.remove());
}

// SVG-Export (fällt bei HTML-Vorlagen wie E-Rechnung auf HTML-Download zurück)
function exportSVG(containerId, filename = "download.svg", titel = "") {
  const container = document.getElementById(containerId);
  if (!container) return;
  const svg = container.querySelector(":scope > svg");
  if (!svg) {
    const htmlData = container.innerHTML.replace(/&nbsp;/g, " ");
    const blob = new Blob([htmlData], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename.replace(/\.svg$/i, ".html");
    link.click();
    URL.revokeObjectURL(url);
    return;
  }

  const clone = svg.cloneNode(true);
  prepareSvgForExport(svg, clone);
  if (titel) {
    const t = document.createElementNS("http://www.w3.org/2000/svg", "title");
    t.textContent = titel;
    clone.insertBefore(t, clone.firstChild);
  }

  const svgData = new XMLSerializer().serializeToString(clone);

  const blob = new Blob([svgData], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// In Zwischenablage kopieren
function copyToClipboard(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const svg = container.querySelector(":scope > svg");
  if (!svg) return copyHTMLToClipboard(containerId);
  const svgData = new XMLSerializer().serializeToString(svg);
  const check = new DOMParser().parseFromString(svgData, "image/svg+xml");
  if (check.querySelector("parsererror")) {
    zeigeModal(
      "Das SVG enthält Fehler (vermutlich im Logo) und kann nicht exportiert werden. Tauschen Sie das Logo aus.",
    );
    return;
  }
  navigator.clipboard.writeText(svgData).then(() => {
    zeigeModal("SVG wurde in die Zwischenablage kopiert");
  });
}

function copyHTMLToClipboard(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const html = container.innerHTML.replace(/&nbsp;/g, " ");
  navigator.clipboard
    .writeText(html)
    .then(() => {
      zeigeModal("HTML wurde in die Zwischenablage kopiert");
    })
    .catch((err) => {
      console.error("Fehler beim Kopieren:", err);
    });
}

// ============================================================================
// BENUTZERDEFINIERTE UNTERNEHMEN - LOCAL STORAGE VERWALTUNG
// ============================================================================

let uploadedLogoBase64 = null; // Globale Variable für hochgeladenes Logo

// Funktion zum Abrufen der benutzerdefinierten Unternehmen aus dem Local Storage
function getUserCompanies() {
  const stored = localStorage.getItem("userCompanies");
  return stored ? JSON.parse(stored) : [];
}

// Funktion zum Zusammenführen der benutzerdefinierten Unternehmen mit den Standard-YAML-Daten
function mergeUserCompaniesIntoYamlData() {
  const userCompanies = getUserCompanies();

  if (userCompanies.length === 0) {
    console.log("Keine eigenen Unternehmen zum Mergen");
    return;
  }

  yamlData = [...yamlData, ...userCompanies];

  // Sortieren nach Branche
  yamlData.sort((a, b) => {
    const brancheA = a.unternehmen?.branche || "";
    const brancheB = b.unternehmen?.branche || "";
    return brancheA.localeCompare(brancheB);
  });

  console.log(
    "Merged:",
    userCompanies.length,
    "eigene Unternehmen hinzugefügt → Gesamt:",
    yamlData.length,
  );
}

// Funktion zum Laden der Standard-YAML-Daten
function loadStandardYamlData() {
  fetch("js/unternehmen.yml")
    .then((response) => response.text())
    .then((data) => {
      const standardData = jsyaml.load(data);
      localStorage.setItem("standardYamlData", JSON.stringify(standardData));
      console.log("Standard-YAML gespeichert");
      initializeYamlData(); // ← zurück zur zentralen Logik
    })
    .catch((error) => {
      console.error("Fehler beim Laden der Standard-YAML:", error);
    });
}

// Modifizierte Funktion zum Laden der hochgeladenen Daten
function loadUploadedDataFromLocalStorage() {
  initializeYamlData(); //
}

function mergeUserCompaniesIntoYamlData() {
  const userCompanies = getUserCompanies();

  if (userCompanies.length === 0) {
    console.log("Keine eigenen Unternehmen zum Mergen");
    return;
  }

  yamlData = [...yamlData, ...userCompanies];

  // Sortieren nach Branche
  yamlData.sort((a, b) => {
    const brancheA = a.unternehmen?.branche || "";
    const brancheB = b.unternehmen?.branche || "";
    return brancheA.localeCompare(brancheB);
  });

  console.log(
    "Merged:",
    userCompanies.length,
    "eigene Unternehmen hinzugefügt → Gesamt:",
    yamlData.length,
  );
}

// Initialisierung beim Laden der Seite
document.addEventListener("DOMContentLoaded", function () {
  // Zentrale Initialisierung (lädt Core immer zuerst, dann zusätzliche hochgeladene)
  initializeYamlData();

  initializeDropdownHandlers(); // deine Event-Listener

  // Ausbildungsberuf-Feld nur bei Vorlage "Ausbildungsvergütung" zeigen
  lohnabrechnungsBerufFeldUmschalten();
  const selLohnabrechnung = document.getElementById(
    "svgDropdownLohnabrechnung",
  );
  if (selLohnabrechnung)
    selLohnabrechnung.addEventListener(
      "change",
      lohnabrechnungsBerufFeldUmschalten,
    );

  // (Alle Belege werden automatisch erstellt, sobald die Dropdowns befüllt sind –
  //  das übernimmt alleBelegeAutomatischErstellen() am Ende von updateAllDropdowns())
});

// Beleg aus Sammlung öffnen (wenn ?openBeleg=<id> in URL)
function restoreOpenedBeleg(item) {
  if (!item) return;
  const tabMap = {
    rechnung: "rechnung",
    kontoauszug: "kontoauszug",
    quittung: "quittung",
    kassenbon: "kassenbon",
    email: "email",
    newspaper: "newspaper",
    lohnabrechnung: "lohnabrechnung",
    lohnjournal: "lohnjournal",
    bescheid: "bescheid",
    anlagenkarte: "anlagenkarte",
    wertpapiere: "wertpapiere",
    mahnung: "mahnung",
    insolvenz: "insolvenz",
  };
  const rawMarkup =
    item.htmlContent ||
    item.svgContent ||
    (item.content && item.content.trim().startsWith("<") ? item.content : null);
  if (
    !rawMarkup &&
    !item.formState &&
    item.content &&
    item.content.startsWith("data:image/")
  ) {
    zeigeModal(
      "Dieser Beleg wurde nur als Bild ohne Vorlagendaten gespeichert. Bitte neu sammeln, um ihn bearbeiten zu können.",
    );
    return;
  }

  // 1. Wenn vollständiger Formularzustand gespeichert wurde (SVG- und HTML-Belege)
  if (item.formState && item.formState.fields) {
    const belegType = item.belegType || item.formState.belegType || "rechnung";
    const tabName = tabMap[belegType] || belegType;
    if (typeof openTabFromURL === "function") openTabFromURL(tabName);
    for (const [elId, info] of Object.entries(item.formState.fields)) {
      const el = document.getElementById(elId);
      const vorher = el ? String(el.value) : null;
      if (typeof setFieldValue === "function") {
        setFieldValue(elId, info.value, info.type);
      }
      // Selekt-Umschaltung "nachziehen": change-Event feuern, damit die
      // Listener greifen (z.B. Bescheidart → Grundsteuer/Kfz-Felder,
      // Kassenbon → Artikel 2/3). setFieldValue setzt nur .value.
      if (
        el &&
        el.tagName === "SELECT" &&
        info.type !== "checkbox" &&
        String(el.value) !== vorher
      ) {
        try {
          el.dispatchEvent(new Event("change", { bubbles: true }));
        } catch (e) {}
      }
    }
    const savedHtml = item.htmlContent || item.formState.containerHtml || "";
    setTimeout(async function () {
      if (belegType === "email") {
        try {
          await emailVorlageAnwenden();
        } catch (e) {
          console.warn(e);
        }
        const c = document.getElementById("emailContainer");
        if (c && savedHtml) c.innerHTML = savedHtml;
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
      } else if (belegType === "rechnung" || belegType === "kontoauszug") {
        try {
          await applySVGholen(true);
        } catch (e) {
          console.warn("applySVGholen failed", e);
        }
      } else if (typeof executeApplyFunction === "function") {
        executeApplyFunction(belegType);
      }
    }, 150);
    return;
  }

  // 2. Fallback über Markup-Analyse (SVG oder HTML)
  if (rawMarkup && typeof detectBelegType === "function") {
    try {
      const doc =
        typeof parseBelegMarkup === "function"
          ? parseBelegMarkup(rawMarkup)
          : new DOMParser().parseFromString(
              String(rawMarkup).replace(/&nbsp;/g, "&#160;"),
              "image/svg+xml",
            );
      const belegType = item.belegType || detectBelegType(doc);
      if (belegType) {
        const extractedData = extractBelegData(doc, belegType);
        window._lastImportData = extractedData;
        const tabName = tabMap[belegType] || belegType;
        setTimeout(function () {
          jumpToBeleg(belegType, tabName)
            .then(function () {
              if (belegType === "rechnung" || belegType === "kontoauszug") {
                try {
                  applySVGholen(true);
                } catch (e) {
                  console.warn("applySVGholen failed", e);
                }
              }
            })
            .catch(function (e) {
              console.warn("jumpToBeleg failed", e);
            });
        }, 200);
        return;
      }
    } catch (e) {
      console.warn("Beleg import failed", e);
    }
  }
  const cid = item.containerId || "rechnung1Container";
  const container = document.getElementById(cid);
  if (container) container.innerHTML = rawMarkup || item.content || "";
}

document.addEventListener(
  "yamlDataLoaded",
  function () {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("openBeleg");
    if (!id || !window.Collection) return;
    const run = function () {
      Collection.getItem(id)
        .then(function (item) {
          // Merken, dass dieser Beleg über „Öffnen" (openBeleg=<id>) aus der
          // Sammlung kam → „+ Sammlung" wird dann zu „Speichern" (updateItem
          // statt addItem). Reine Parameter-Links (shareUrl ohne openBeleg)
          // bleiben NEUTRAL und erzeugen einen neuen Eintrag.
          if (item && item.collectionId) {
            window.belegAusSammlung = {
              id: item.id,
              collectionId: item.collectionId,
            };
          } else {
            window.belegAusSammlung = null;
          }
          if (typeof aktualisiereSammlungButtons === "function")
            aktualisiereSammlungButtons();
          restoreOpenedBeleg(item);
        })
        .catch(function (e) {
          console.warn("openBeleg failed", e);
        });
    };
    if (window._belegeInitialisiert) run();
    else document.addEventListener("belegeInitialisiert", run, { once: true });
  },
  { once: true },
);

const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("belegImportInput");

// Klick auf das Input selbst darf nicht zur Dropzone hochbubbeln
fileInput.addEventListener("click", (e) => e.stopPropagation());

// Klick auf die Dropzone → Datei-Dialog
dropZone.addEventListener("click", () => fileInput.click());

// Drag & Drop Styling
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
  const file = e.dataTransfer.files[0];
  if (file) handleBelegImport(file);
});

// Dateiauswahl über den Dialog
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) handleBelegImport(file);
  fileInput.value = ""; // gleiche Datei kann erneut gewählt werden
});

// Normale Dateiauswahl
fileInput.addEventListener("change", handleBelegImport);

function handleBelegImport() {
  const file = fileInput.files[0];
  if (!file) return;

  dropZone.querySelector("p").textContent = file.name;

  console.log("Datei geladen:", file);
}

// Modifizierte deleteAndLoadDefaultData Funktion
function deleteAndLoadDefaultData() {
  if (
    !confirm(
      "Möchten Sie wirklich alle Daten zurücksetzen? Dies löscht auch Ihre eigenen Unternehmen!",
    )
  ) {
    return;
  }

  // Lösche alle benutzerdefinierten Daten
  localStorage.removeItem("uploadedYamlCompanyData");
  localStorage.removeItem("userCompanies");
  localStorage.removeItem("standardYamlData");

  // Setze Datei-Input zurück
  const fileInput = document.getElementById("fileInput");
  if (fileInput) fileInput.value = "";

  // Lade Standard-YAML-Daten neu
  loadStandardYamlData();

  // Aktualisiere Anzeige
  displayUserCompanies();
  uploadedLogoBase64 = null;
  document.getElementById("logoPreview").innerHTML =
    '<small style="color: #666;">Keine Datei ausgewählt</small>';
  document.getElementById("addCompanyForm").reset();

  updateLocalStorageStatus("Alle Daten wurden erfolgreich zurückgesetzt.");
  zeigeModal("Daten erfolgreich zurückgesetzt.");
}

// ============================================================================
// DROPDOWN-VERWALTUNG
// ============================================================================
function updateAllDropdowns() {
  if (!yamlData || yamlData.length === 0) return;

  // Sortiere Daten einmal
  const sortedData = [...yamlData].sort((a, b) => {
    const brancheA = a.unternehmen?.branche || "";
    const brancheB = b.unternehmen?.branche || "";
    return brancheA.localeCompare(brancheB);
  });

  // Befülle alle Dropdowns
  Object.keys(DROPDOWN_CONFIG).forEach((dropdownId) => {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;

    dropdown.innerHTML = ""; // alles löschen

    // ← Hier die entscheidende Zeile(n) hinzufügen
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.text = "— Bitte Unternehmen auswählen —";
    placeholder.disabled = true; // optional: verhindert erneutes Auswählen
    placeholder.selected = true; // ← das macht den Unterschied!
    dropdown.appendChild(placeholder);

    // Nun die echten Einträge
    sortedData.forEach((company) => {
      const option = document.createElement("option");
      option.value = company.unternehmen.name;
      option.text =
        `${company.unternehmen.branche} - ${company.unternehmen.name} ${company.unternehmen.rechtsform || ""}`.trim();
      dropdown.appendChild(option);
    });

    // Sicherstellen, dass wirklich nichts anderes ausgewählt ist
    dropdown.value = "";

    // Modellunternehmen direkt beim Befüllen automatisch wählen (bis der
    // Nutzer selbst ein anderes Unternehmen wählt). Damit funktioniert
    // die Auto-Auswahl unabhängig von Event-/Load-Timing.
    const myCompany = (localStorage.getItem("myCompany") || "").trim();
    if (myCompany && dropdown.classList.contains("meinUnternehmen")) {
      const opt = Array.from(dropdown.options).find(
        (o) => o.value.trim() === myCompany || o.text.trim() === myCompany,
      );
      if (opt) {
        dropdown.value = opt.value;
        dropdown.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
  });

  // Signal an andere Scripts (z. B. beleg_url_parameter.js), dass die
  // Unternehmensdaten geladen und alle Dropdowns befüllt sind
  document.dispatchEvent(new Event("yamlDataLoaded"));

  // ALLE Belege direkt beim Seitenaufruf erstellen (nicht erst auf Button-Druck)
  alleBelegeAutomatischErstellen();
}

// ============================================================================
// EVENT-HANDLER & INITIALISIERUNG
// ============================================================================
function initializeDropdownHandlers() {
  Object.entries(DROPDOWN_CONFIG).forEach(([dropdownId, config]) => {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;

    dropdown.addEventListener("change", () => {
      config.onChange();
      // Wenn autoUpdate true ist, automatisch Daten übernehmen
      if (config.autoUpdate) {
        applyOrderData();
      }
    });
  });
}

// Debounce-Hilfsfunktion für verzögerte Ausführung
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Vereinfachte reloadDropdownOptions
function reloadDropdownOptions() {
  updateAllDropdowns();
}

// (Kein eigenständiger Top-Level-Fetch mehr: Der Abruf der Standard-YAML passiert
// ausschließlich im DOMContentLoaded-Handler → updateAllDropdowns() läuft genau einmal
// und das Event 'yamlDataLoaded' löscht nicht mehr aus Versehen die Auto-Auswahl.)

// ============================================================================
// BELEG-DATEN LADEN (Spezifisch)
// ============================================================================
function loadKontoauszugData() {
  loadBelegData("kontoauszug", "datenKontoauszug");
}

function loadEmailData() {
  loadBelegData("email", "datenEmail");
}

// Wendet die aktuell gewählte Mailvorlage an: Vorlage rendern und
// Firmen-/Empfängerdaten sofort einsetzen. Wird beim Wechsel des Vorlagen-
// Dropdowns (onchange) und beim „Zurücksetzen"-Button verwendet.
async function emailVorlageAnwenden(preserveText = true) {
  // Aktuellen Betreff/Text sichern, damit ein Vorlagenwechsel den
  // vom Nutzer eingegebenen Text nicht verwirft.
  const savedSubject = document.getElementById("emailSubject")?.textContent;
  const savedBody = document.getElementById("emailTextMessage")?.textContent;
  const subjectEdited =
    preserveText &&
    savedSubject &&
    savedSubject.trim() !== "" &&
    !/^\[Hier Betreff einfügen\]$/i.test(savedSubject.trim());
  const bodyEdited =
    preserveText &&
    savedBody &&
    savedBody.trim() !== "" &&
    !/^\[Hier Mailtext bearbeiten\]$/i.test(savedBody.trim());

  const vorlage =
    document.getElementById("svgDropdownEmail")?.value || "mail1.html";
  await applyHTMLTemplate(vorlage, "emailContainer");
  // Firmen-/Kundendaten wieder einsetzen
  loadEmailData();
  loadCompanyDataforEmail();

  // Nutzertext nach Vorlagenwechsel wiederherstellen
  if (subjectEdited) {
    const el = document.getElementById("emailSubject");
    if (el) el.textContent = savedSubject;
  }
  if (bodyEdited) {
    const el = document.getElementById("emailTextMessage");
    if (el) el.textContent = savedBody;
  }
}

// Mail-Vorlage zurücksetzen: Den in der Vorlage hinterlegten Platzhalter-/Standardtext
// wiederherstellen (Vorschau ist contenteditable → Nutzer schreibt seinen Text direkt
// in die Mail; damit lässt er sich auch wiederherstellen).
async function emailZuruecksetzen() {
  await emailVorlageAnwenden(false);
}

// Lade die Unternehmensdaten basierend auf der Auswahl im Dropdown-Feld
function loadCompanyDataforEmail() {
  const selectedName = document.getElementById("datenEmailKunde")?.value;
  if (!selectedName) return;

  const selectedData = yamlData.find(
    (item) => item.unternehmen.name === selectedName,
  );
  if (!selectedData) return;

  // mail1/mail2 nutzen (eindeutige) ids, mail3 nutzt Klassen für mehrfach-Verwendung
  document
    .querySelectorAll('[id="emailNameKunde"], .emailNameKunde')
    .forEach((el) => {
      el.textContent = selectedData.unternehmen.inhaber;
    });
  document
    .querySelectorAll('[id="emailAdresseKunde"], .emailAdresseKunde')
    .forEach((el) => {
      el.textContent = selectedData.unternehmen.kontakt?.email || "";
    });
}

function loadQuittungData() {
  loadBelegData("quittung", "datenQuittung");
}

function loadLohnjournalData() {
  loadBelegData("lohnjournal", "datenLohnjournal");
}

function loadBescheidData() {
  loadBelegData("bescheid", "datenBescheid");
}

// ============================================================================
// KRAFTFAHRZEUGSTEUER: jährliche Frist (Zulassung + 1 Monat) berechnen
// ============================================================================
// Erkennt "TT.MM.JJJJ", "TT.MM.JJ", "JJJJ-MM-TT" und (ohne Jahr) "TT.MM.".
// Rückgabe: { datum: Date, mitJahr: boolean } oder null.
// Die Frist beginnt einen Monat nach der (Erst-)Zulassung und wiederholt sich
// danach jährlich. Rückgabe: Array mit den nächsten zwei zukünftigen
// Fälligkeitsterminen (mit Jahr → "TT.MM.JJJJ", ohne Jahr → "TT.MM.").
function bescheidKfzDatum(zulassungText) {
  if (!zulassungText || typeof zulassungText !== "string") return null;
  const text = zulassungText.trim();
  let tag = null;
  let monat = null;
  let jahr = null;
  let mitJahr = true;

  let treffer = text.match(/^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})$/);
  if (treffer) {
    tag = parseInt(treffer[1], 10);
    monat = parseInt(treffer[2], 10);
    jahr = parseInt(treffer[3], 10);
  } else if ((treffer = text.match(/^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{2})$/))) {
    tag = parseInt(treffer[1], 10);
    monat = parseInt(treffer[2], 10);
    jahr = 2000 + parseInt(treffer[3], 10);
  } else if ((treffer = text.match(/^(\d{4})-(\d{2})-(\d{2})$/))) {
    jahr = parseInt(treffer[1], 10);
    monat = parseInt(treffer[2], 10);
    tag = parseInt(treffer[3], 10);
  } else if ((treffer = text.match(/^(\d{1,2})\.\s*(\d{1,2})\.?$/))) {
    // Ohne Jahr (z. B. "15.03." oder "15.03") → kein Jahr im Beleg
    tag = parseInt(treffer[1], 10);
    monat = parseInt(treffer[2], 10);
    jahr = new Date().getFullYear(); // nur Platzhalter für die Gültigkeitsprüfung
    mitJahr = false;
  }
  if (!tag || !monat) return null;

  // Existiert das Datum wirklich (z. B. 31.02. korrekt abfangen)
  const datum = new Date(jahr, monat - 1, tag);
  if (
    datum.getDate() !== tag ||
    datum.getMonth() !== monat - 1 ||
    datum.getFullYear() !== jahr
  ) {
    return null;
  }
  return { datum, mitJahr };
}

// Helfer: Datum als "TT.MM." oder "TT.MM.JJJJ" formatieren;
// jahrAnzeige (z. B. "20..") ersetzt das konkrete Jahr beim Ausdruck
function bescheidKfzDatumText(x, mitJahr, jahrAnzeige) {
  return `${String(x.getDate()).padStart(2, "0")}.${String(
    x.getMonth() + 1,
  ).padStart(2, "0")}${mitJahr ? "." + (jahrAnzeige || x.getFullYear()) : "."}`;
}

// Die allererste Fälligkeit (Zulassung + 1 Monat) – auch rückwirkend,
// wenn sie bereits vergangen ist (z. B. Zulassung 15.03.2025 → 15.04.2025).
// Optional kann die Ausgabe ohne Jahr erzwungen werden (kein Jahr im Beleg).
function bescheidKfzErsteFrist(zulassungText, ohneJahrErzwungen, jahrAnzeige) {
  const info = bescheidKfzDatum(zulassungText);
  if (!info) return null;
  const mitJahr = ohneJahrErzwungen === true ? false : info.mitJahr;
  const z = info.datum;
  // Monatswechsel mit Tag-Klemme (z. B. 31.01. + 1 Monat → 28./29.02.)
  const termin = new Date(
    z.getFullYear(),
    z.getMonth() + 1,
    Math.min(
      z.getDate(),
      new Date(z.getFullYear(), z.getMonth() + 2, 0).getDate(),
    ),
  );
  return bescheidKfzDatumText(termin, mitJahr, jahrAnzeige);
}

function bescheidKfzFristen(zulassungText, ohneJahrErzwungen, jahrAnzeige) {
  const info = bescheidKfzDatum(zulassungText);
  if (!info) return [];
  const zulassung = info.datum;
  // Optional: auch bei Zulassung mit Jahr die Frist ohne Jahr ausgeben,
  // wenn im Beleg kein Jahr gedruckt werden soll (Jahr-Feld leer)
  const mitJahr = ohneJahrErzwungen === true ? false : info.mitJahr;

  // Erste Frist = Zulassung + 1 Monat, danach jährlich wiederkehrend.
  // Monatswechsel mit Tag-Klemme (z. B. 31.01. + 1 Monat → 28./29.02.)
  const termin = new Date(
    zulassung.getFullYear(),
    zulassung.getMonth() + 1,
    Math.min(
      zulassung.getDate(),
      new Date(zulassung.getFullYear(), zulassung.getMonth() + 2, 0).getDate(),
    ),
  );
  const termine = [
    termin,
    new Date(termin.getFullYear() + 1, termin.getMonth(), termin.getDate()),
  ];
  return termine.map((x) => bescheidKfzDatumText(x, mitJahr, jahrAnzeige));
}

window.bescheidKfzFristen = bescheidKfzFristen;
window.bescheidKfzDatum = bescheidKfzDatum;
window.bescheidKfzErsteFrist = bescheidKfzErsteFrist;

// Mahnung: Absender (Gläubiger) aus dem Absender-Dropdown laden
function loadMahnungData() {
  loadBelegData("mahnung", "datenMahnung");
}

// Mahnung: Empfänger (Schuldner) aus dem Empfänger-Dropdown laden
function loadMahnungEmpfaengerData() {
  const selectedName = document.getElementById("datenMahnungEmpfaenger")?.value;
  if (!selectedName) return;
  const selectedData = yamlData.find(
    (item) => item.unternehmen.name === selectedName,
  );
  if (!selectedData) return;
  loadBelegData("mahnungEmpfaenger", "datenMahnungEmpfaenger");
}

function loadKassenbonData() {
  loadBelegData("kassenbon", "datenKassenbon");
}

// Lade die Unternehmensdaten basierend auf der Auswahl im Dropdown-Feld
function loadCompanyDataforKassenbon() {
  const selectedCompanyName = document.getElementById(
    "datenKassenbonKunde",
  )?.value;
  const selectedCompany = yamlData.find(
    (company) => company.unternehmen.name === selectedCompanyName,
  );
  if (!selectedCompany) return;

  let kassenbonStrasseKunde = document.getElementById("kassenbonStrasseKunde");
  if (kassenbonStrasseKunde) {
    kassenbonStrasseKunde.textContent =
      selectedCompany.unternehmen.adresse.strasse;
  } else {
  }

  let kassenbonOrtKunde = document.getElementById("kassenbonOrtKunde");
  if (kassenbonOrtKunde) {
    kassenbonOrtKunde.textContent =
      selectedCompany.unternehmen.adresse.plz +
      " " +
      selectedCompany.unternehmen.adresse.ort;
  } else {
  }
}

function loadAnlagenkarteData() {
  loadBelegData("anlagenkarte", "datenAnlagenkarte");
}

function loadWertpapiereData() {
  loadBelegData("wertpapiere", "datenWertpapiere");
}

// Lade die Unternehmensdaten basierend auf der Auswahl im Dropdown-Feld
function loadCompanyData() {
  loadBelegData("kunde", "datenKunde");
  loadSupplierData(); // Aktualisiere auch Lieferant für nummerKunde
}

function loadCompanyDataforQuittung() {
  loadBelegData("kundeQuittung", "datenQuittungKunde");
}

// ============================================================================
// LIEFERANT & KUNDE
// ============================================================================
function loadSupplierData() {
  const selectedName = document.getElementById("datenLieferer")?.value;
  if (!selectedName) return;

  const selectedData = yamlData.find(
    (item) => item.unternehmen.name === selectedName,
  );
  if (!selectedData) return;

  const u = selectedData.unternehmen; // Abkürzung

  // Basis-Textfelder
  const fields = {
    nameLieferer: `${u.name} ${u.rechtsform}`,
    mottoLieferer: u.motto,
    nameLangLieferer: u.name,
    strasseLieferer: u.adresse.strasse,
    plzLieferer: `${u.adresse.plz} ${u.adresse.ort}`,
    adresseLieferer: `${u.name} ${u.rechtsform} - ${u.adresse.strasse} - ${u.adresse.plz} ${u.adresse.ort} - ${u.adresse.land}`,
    ansprechpartnerLieferer: u.inhaber,
    telefonLieferer: u.kontakt.telefon,
    emailLieferer: u.kontakt.email,
    internetLieferer: u.kontakt.internet,
    bankLieferer: u.bank,
    ibanLieferer: `IBAN: ${u.iban}`,
    bicLieferer: `BIC: ${u.bic}`,
    ustidLieferer: `UST-IdNr.: ${u.ust_id}`,
    steuernummerLieferer: `Steuernummer: ${u.steuernummer}`,
  };

  Object.entries(fields).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  });

  // Lieferanten-spezifische Logik
  applySupplierSpecificData(selectedData);
  adjustTextColor();
}

// Funktion zum Laden eines Logos
function loadLogo(event) {
  const svgContainer = document.getElementById("rechnungSVG");
  // Überprüfe, ob ein SVG-Element vorhanden ist
  if (!(svgContainer instanceof SVGElement)) {
    zeigeModal("In diesem Beleg kann kein Logo hochgeladen werden.");
    return;
  }
  // Entferne vorhandene Logos (sowohl <image> als auch SVGs)
  const existingImages = svgContainer.querySelectorAll(
    "#uploaded-image, g.logo-svg",
  );
  existingImages.forEach((existingImage) => {
    svgContainer.removeChild(existingImage);
  });
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const svgContainer = document.getElementById("rechnungSVG");
      const existingImage = document.getElementById("uploaded-image");
      const rectElement = document.getElementById("logo-placeholder");

      // Erstelle ein <image>-Element und füge es zur SVG hinzu
      const image = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "image",
      );
      image.setAttribute("id", "uploaded-image");
      image.setAttribute("x", rectElement.getAttribute("x"));
      image.setAttribute("y", rectElement.getAttribute("y"));
      image.setAttribute("width", rectElement.getAttribute("width"));
      image.setAttribute("height", rectElement.getAttribute("height"));
      image.setAttributeNS(
        "http://www.w3.org/1999/xlink",
        "href",
        e.target.result,
      );

      svgContainer.appendChild(image);
    };
    reader.readAsDataURL(file);
  }
}

// ============================================================================
// BELEG-ANWENDUNG (Apply-Funktionen)
// ============================================================================
function applyOrderData(validationUeberspringen = false) {
  if (!validationUeberspringen && !validateInputs()) {
    // Wenn die Validierung fehlschlägt, stoppe die Funktion
    return;
  }

  // Hole die ausgewählten Werte von Tag und Monat

  const selectedTag = document.getElementById("tag").value;
  const selectedMonat = document.getElementById("monat").value;
  const selectedTagKontoauszug =
    document.getElementById("tagKontoauszug").value;
  const selectedMonatKontoauszug =
    document.getElementById("monatKontoauszug").value;

  // Formatieren von Tag und Monat
  const formattedDatum = `${selectedTag}.${selectedMonat}.`;
  const formattedDatumKontoauszug = `${selectedTagKontoauszug}.${selectedMonatKontoauszug}.`;

  // 7 Tage abziehen
  if (SafeDOM.exists("rechnungDatum-7")) {
    const currentYear = new Date().getFullYear();
    const selectedDatumRechnung = new Date(
      `${selectedMonat}/${selectedTag}/${currentYear}`,
    );
    const sevenDaysAgoRechnung = new Date(selectedDatumRechnung);
    sevenDaysAgoRechnung.setDate(selectedDatumRechnung.getDate() - 7);
    const formattedSevenDaysAgoRechnung = `${sevenDaysAgoRechnung.getDate().toString().padStart(2, "0")}.${(sevenDaysAgoRechnung.getMonth() + 1).toString().padStart(2, "0")}.`;
    SafeDOM.setText("rechnungDatum-7", formattedSevenDaysAgoRechnung);
  }

  // Fälligkeitsdatum
  const zahlungszielRaw = document
    .getElementById("zahlungszielInput")
    ?.value?.trim();
  const zahlungszielInput = parseFloat(zahlungszielRaw) || 0;
  const elementsWithClassZiel = document.getElementById("rechnungDatumZiel");
  if (elementsWithClassZiel) {
    const currentYear = new Date().getFullYear();
    const selectedDatumZiel = new Date(
      `${selectedMonat}/${selectedTag}/${currentYear}`,
    );
    const datumZiel = new Date(selectedDatumZiel);
    datumZiel.setDate(selectedDatumZiel.getDate() + zahlungszielInput);
    const formattedZiel = `${datumZiel.getDate().toString().padStart(2, "0")}.${(datumZiel.getMonth() + 1).toString().padStart(2, "0")}.`;
    elementsWithClassZiel.textContent = formattedZiel;
  }

  // Annahme: Alle Elemente mit der Klasse 'rechnungsDatum' und kontoauszugDatum sollen aktualisiert werden
  SafeDOM.setClass("rechnungsDatum", formattedDatum);

  const elementsWithClassKontoauszug =
    document.getElementsByClassName("kontoauszugDatum");
  for (const element of elementsWithClassKontoauszug) {
    element.textContent = formattedDatumKontoauszug;
  }

  const currentYear = new Date().getFullYear();
  const selectedDatumKontoauszug = new Date(
    `${selectedMonatKontoauszug}/${selectedTagKontoauszug}/${currentYear}`,
  );
  // 7 Tage abziehen
  const sevenDaysAgoKontoauszug = new Date(selectedDatumKontoauszug);
  sevenDaysAgoKontoauszug.setDate(selectedDatumKontoauszug.getDate() - 7);

  // Formatieren des Datums in Format DD.MM.)
  const formattedSevenDaysAgoKontoauszug = `${sevenDaysAgoKontoauszug.getDate().toString().padStart(2, "0")}.${(sevenDaysAgoKontoauszug.getMonth() + 1).toString().padStart(2, "0")}.`;

  // Finde alle Elemente mit der Klasse 'kontoauszugDatum'
  const elementsWithClassKontoauszug7 =
    document.getElementsByClassName("kontoauszugDatum-7");

  // Iteriere durch alle Elemente und setze das formatierte Datum für Kontoauszug minus 7 Tage
  for (const element of elementsWithClassKontoauszug7) {
    element.textContent = formattedSevenDaysAgoKontoauszug;
  }

  handleYearScript({
    jahrCheckbox: "scriptJahr",
    jahrInput: "jahr",
    jahrClass: "aktuellesJahr",
    customDefs: "customDefs",
    scriptId: "customJs",
    scriptFunction: "SVGonLoad",
  });

  handleYearScript({
    jahrCheckbox: "scriptJahrKontoauszug",
    jahrInput: "jahrKontoauszug",
    jahrClass: "aktuellesJahrKontoauszug",
    customDefs: "customDefsKontoauszug",
    scriptId: "customJsKontoauszug",
    scriptFunction: "SVGonLoadKontoauszug",
  });

  // Lese die eingegebenen Daten aus den Input-Feldern
  const artikel = document.getElementById("artikelInput").value;
  const menge = getNumericValue("mengeInput");
  const einheit = document.getElementById("einheitInput").value;
  const einzelpreis = getNumericValue("einzelpreisInput");

  // Lese die eingegebenen Daten aus den Input-Feldern
  const artikel2 = document.getElementById("artikelInput2").value;
  const menge2 = parseFloat(document.getElementById("mengeInput2").value);
  const einheit2 = document.getElementById("einheitInput2").value;
  const einzelpreis2 = parseFloat(
    document.getElementById("einzelpreisInput2").value,
  );
  const angebotLieferzeit = document.getElementById(
    "angebotLieferzeitInput",
  ).value;

  // Verwendung der Hilfsfunktion für verschiedene Eingabefelder
  const rabattInput = getNumericValue("rabattInput");
  const bezugskostenInput = getNumericValue("bezugskostenInput");
  const umsatzsteuerInput = getNumericValue("umsatzsteuerInput");
  const skontoInput = getNumericValue("skontoInput");
  const skontofristInput = getNumericValue("skontofristInput");
  let gesamtpreis1 = menge * einzelpreis;
  let gesamtpreis2 = menge2 * einzelpreis2;
  const bezugskostenArtInput = document.getElementById(
    "bezugskostenArtInput",
  ).value;

  // Setze die gelesenen Daten in die SVG-Textelemente

  if (menge && einzelpreis) {
    gesamtpreis1 = menge * einzelpreis;
    SafeDOM.setText("pos1", "1"); // ✓ Kein Fehler mehr!
    SafeDOM.setText("artikel1", artikel);
    SafeDOM.setText("menge1", FormatHelper.numberSpace(menge) + " " + einheit);
    SafeDOM.setText("einzelpreis1", FormatHelper.currency(einzelpreis));
    SafeDOM.setText("gesamtpreis1", FormatHelper.currency(gesamtpreis1));
  } else {
    gesamtpreis1 = 0;
    SafeDOM.setText("pos1", "");
    SafeDOM.setText("artikel1", artikel);
    SafeDOM.setText("menge1", "");
    SafeDOM.setText("einzelpreis1", "");
    SafeDOM.setText("gesamtpreis1", "");
  }

  // Setze die gelesenen Daten in die SVG-Textelemente

  if (menge2 && einzelpreis2) {
    gesamtpreis2 = menge2 * einzelpreis2;
    SafeDOM.setText("pos2", "2");
    SafeDOM.setText("artikel2", artikel2);
    SafeDOM.setText(
      "menge2",
      FormatHelper.numberSpace(menge2) + " " + einheit2,
    );
    SafeDOM.setText("einzelpreis2", FormatHelper.currency(einzelpreis2));
    SafeDOM.setText("gesamtpreis2", FormatHelper.currency(gesamtpreis2));
  } else {
    gesamtpreis2 = 0;
    SafeDOM.setText("pos2", "");
    SafeDOM.setText("artikel2", artikel2);
    SafeDOM.setText("menge2", "");
    SafeDOM.setText("einzelpreis2", "");
    SafeDOM.setText("gesamtpreis2", "");
  }

  // 2. Artikelzeile nur anzeigen, wenn ausgefüllt (angebot3.svg Post-it)
  const artikel2Zeile = document.getElementById("artikel2Zeile");
  if (artikel2Zeile) {
    artikel2Zeile.style.display = menge2 && einzelpreis2 ? "" : "none";
  }

  let angebotLieferzeitSVG = document.getElementById("angebotLieferzeit");
  if (angebotLieferzeitSVG) {
    // Die ID wurde gefunden, also füge den Text ein
    angebotLieferzeitSVG.textContent = angebotLieferzeit;
  }

  const elemSkontoSuffix = document.getElementById("skontoSuffix");
  if (elemSkontoSuffix) {
    if (zahlungszielRaw !== "" && skontoInput > 0) {
      elemSkontoSuffix.textContent = `, ${skontoInput}% Skonto`;
    } else {
      elemSkontoSuffix.textContent = "";
    }
  }

  const elemZahlungsziel = document.getElementById("zahlungsziel");
  if (elemZahlungsziel) {
    if (zahlungszielRaw === "") {
      // Leer → ganzen Satz entfernen
      SafeDOM.remove("zahlungszielSatz");
    } else if (zahlungszielInput === 0) {
      // 0 eingetragen → Text anpassen
      const satz = document.getElementById("zahlungszielSatz");
      if (satz)
        satz.querySelector("text").textContent = "Zahlung fällig sofort";
    } else {
      elemZahlungsziel.textContent = zahlungszielInput;
    }
  }

  const elemSkonto = document.getElementById("skonto");
  if (elemSkonto) {
    document.getElementById("skonto").textContent = skontoInput;
    // Überprüfen, ob skontoInput 0 oder leer ist
    if (skontoInput === "" || parseFloat(skontoInput) === 0) {
      // Falls 0 oder leer, das Element mit der ID "skontotext" entfernen
      const skontotextElement = document.getElementById("skontotext");
      if (skontotextElement) {
        skontotextElement.remove();
      }
    } else {
      // Falls nicht 0 oder leer, den Text des Elements mit der ID "skonto" setzen
      document.getElementById("skonto").textContent = skontoInput;
      document.getElementById("skontofrist").textContent = skontofristInput;
    }
  } else {
  }

  // Berechne und setze den Gesamtbetrag der Rechnung
  // Berechne die Zwischensumme
  const zwischensumme = gesamtpreis1 + gesamtpreis2;
  const rabattsumme = (zwischensumme * rabattInput) / 100;
  let nettowert;
  let umsatzsteuersumme;
  let gesamtRechnungsbetrag;

  // Setze die Zwischensumme in das SVG-Textelement
  SafeDOM.setText("zwischensumme", FormatHelper.currency(zwischensumme));
  const hatWarenwertBlock = !!document.getElementById(
    "warenwertUstRechnungsbetrag",
  );
  if (bezugskostenInput > 0) {
    SafeDOM.setText("bezugskosten", bezugskostenArtInput);
    SafeDOM.setText(
      "bezugskostenSumme",
      FormatHelper.currency(bezugskostenInput),
    );
  } else if (!hatWarenwertBlock) {
    // Einfache Vorlagen (z. B. Post-it): „frei Haus" nur wenn Lieferbedingung angekreuzt
    if (document.getElementById("lieferbedingungInput")?.checked) {
      SafeDOM.setText("bezugskosten", "frei Haus");
    } else {
      SafeDOM.setText("bezugskosten", "");
    }
    SafeDOM.setText("bezugskostenSumme", "");
  } else {
    SafeDOM.setText("bezugskosten", bezugskostenArtInput);
    SafeDOM.setText(
      "bezugskostenSumme",
      FormatHelper.currency(bezugskostenInput),
    );
  }

  // Rabatt-Bereich
  if (rabattInput > 0) {
    SafeDOM.setText("rabatt", `- ${rabattInput} % Rabatt`);
    SafeDOM.setText("rabattsumme", FormatHelper.currency(rabattsumme));
    nettowert = zwischensumme - rabattsumme + bezugskostenInput;
  } else {
    SafeDOM.setText("rabatt", " ");
    SafeDOM.setText("rabattsumme", " ");
    nettowert = zwischensumme + bezugskostenInput;
  }

  // Nettowert
  SafeDOM.setText("nettowert", FormatHelper.currency(nettowert));

  // Umsatzsteuer
  if (umsatzsteuerInput > 0) {
    umsatzsteuersumme = (nettowert * umsatzsteuerInput) / 100;
    SafeDOM.setText("ust", `+ ${umsatzsteuerInput}`);
    SafeDOM.setText("ustsumme", FormatHelper.currency(umsatzsteuersumme));
    gesamtRechnungsbetrag = nettowert + umsatzsteuersumme;
  } else {
    umsatzsteuersumme = " "; // oder 0, je nach Logik
    SafeDOM.setText("ust", " ");
    SafeDOM.setText("ustsumme", " ");
    gesamtRechnungsbetrag = nettowert;
  }

  // Gesamtbetrag / Rechnungsbetrag
  SafeDOM.setText(
    "rechnungsbetrag",
    FormatHelper.currency(gesamtRechnungsbetrag),
  );

  // Platz machen wenn keine Bezugskosten oder Rabatt
  const warenwertUstRechnungsbetrag = document.getElementById(
    "warenwertUstRechnungsbetrag",
  );
  const warenwertUstRechnungsbetrag_quer = document.getElementById(
    "warenwertUstRechnungsbetrag_quer",
  );
  const gBezugskosten = document.getElementById("gBezugskosten");

  if (warenwertUstRechnungsbetrag) {
    if (bezugskostenInput > 0) {
      // Bezugskosten vorhanden - keine Änderung
    } else {
      SafeDOM.setAttr(
        "warenwertUstRechnungsbetrag",
        "transform",
        "translate(0, -30)",
      );
      SafeDOM.remove("gBezugskosten");
    }

    if (rabattInput > 0) {
      // Rabatt vorhanden - keine Änderung
    } else {
      SafeDOM.setAttr(
        "warenwertUstRechnungsbetrag",
        "transform",
        "translate(0, -30)",
      );
      if (gBezugskosten) {
        // ← NUR wenn Element existiert
        gBezugskosten.setAttribute("transform", "translate(0, -30)");
      }
    }
  }

  const elemWarenwert = document.getElementById("warenwert");
  const elemZwischensumme = document.getElementById("zwischensumme");
  if (elemWarenwert && warenwertUstRechnungsbetrag) {
    if (bezugskostenInput > 0 || rabattInput > 0) {
      // Bezugskosten oder Rabatt vorhanden - keine Änderung
    } else {
      elemWarenwert.remove();
      elemZwischensumme.remove();
      warenwertUstRechnungsbetrag.setAttribute(
        "transform",
        "translate(0, -60)",
      );
    }
  }

  if (warenwertUstRechnungsbetrag_quer) {
    if (bezugskostenInput > 0) {
      // Ändere den Transform-Wert, um die Y-Position um 20 zu verringern
      warenwertUstRechnungsbetrag_quer.setAttribute(
        "transform",
        "translate(0, 0)",
      );
    } else {
      // Setze den Transform-Wert auf den ursprünglichen Wert oder einen anderen Wert nach Bedarf
      warenwertUstRechnungsbetrag_quer.setAttribute(
        "transform",
        "translate(200, 0)",
      );
      SafeDOM.remove("gBezugskosten");
    }
  }

  const inputLieferbedingung = document.getElementById("lieferbedingungInput");

  const elemBezugskostenBedingung = document.getElementById(
    "bezugskostenBedingung",
  );
  if (elemBezugskostenBedingung) {
    if (
      inputLieferbedingung &&
      inputLieferbedingung.checked &&
      bezugskostenInput > 0
    ) {
      elemBezugskostenBedingung.textContent = "ab Werk";
    } else {
      elemBezugskostenBedingung.textContent = "";
    }
  }

  const inputEigentumsvorbehalt = document.getElementById(
    "eigentumsvorbehaltInput",
  );
  const eigentumsvorbehalt = document.getElementById("Eigentumsvorbehalt");
  if (eigentumsvorbehalt) {
    if (inputEigentumsvorbehalt && inputEigentumsvorbehalt.checked) {
      // ← Prüfe auch inputEigentumsvorbehalt
      // Eigentumsvorbehalt bleibt sichtbar
    } else {
      eigentumsvorbehalt.remove();
    }
  }

  // Laden der Daten für den Kontoauszug

  const kontoauszugNummer = document.getElementById(
    "kontoauszugNummerInput",
  ).value;
  SafeDOM.setText("kontoauszugNummer", kontoauszugNummer);

  // Vorgang 1
  const kontoauszugVorgang1 = document.getElementById(
    "kontoauszugVorgang1Input",
  ).value;
  SafeDOM.setText("kontoauszugVorgang1", kontoauszugVorgang1);

  const wert1Input = document.getElementById(
    "kontoauszugWertstellung1Input",
  ).value;
  const wert1 = wert1Input ? parseFloat(wert1Input) : 0;
  SafeDOM.setText(
    "kontoauszugWertstellung1",
    wert1 !== 0 ? FormatHelper.currencyWithSign(wert1) : "",
  );

  // Vorgang 2
  const kontoauszugVorgang2 = document.getElementById(
    "kontoauszugVorgang2Input",
  ).value;
  SafeDOM.setText("kontoauszugVorgang2", kontoauszugVorgang2);

  const wert2Input = document.getElementById(
    "kontoauszugWertstellung2Input",
  ).value;
  const wert2 = wert2Input !== "" ? parseFloat(wert2Input) : 0;
  SafeDOM.setText(
    "kontoauszugWertstellung2",
    wert2 !== 0 ? FormatHelper.currencyWithSign(wert2) : "",
  );

  // Vorgang 3
  const kontoauszugVorgang3 = document.getElementById(
    "kontoauszugVorgang3Input",
  ).value;
  SafeDOM.setText("kontoauszugVorgang3", kontoauszugVorgang3);

  const wert3Input = document.getElementById(
    "kontoauszugWertstellung3Input",
  ).value;
  const wert3 = wert3Input ? parseFloat(wert3Input) : 0;
  SafeDOM.setText(
    "kontoauszugWertstellung3",
    wert3 !== 0 ? FormatHelper.currencyWithSign(wert3) : "",
  );

  // Alter Kontostand
  const kontostandAltInput = document.getElementById(
    "kontoauszugKontostand_altInput",
  ).value;
  const kontostandAlt = kontostandAltInput ? parseFloat(kontostandAltInput) : 0;
  SafeDOM.setText(
    "kontoauszugKontostand_alt",
    kontostandAlt !== 0 ? FormatHelper.currencyWithSign(kontostandAlt) : "",
  );

  // Neuer Kontostand (berechnen + setzen)
  const kontostandNeu = kontostandAlt + wert1 + wert2 + wert3;
  SafeDOM.setText(
    "kontoauszugKontostand_neu",
    FormatHelper.currencyWithSign(kontostandNeu),
  );

  // Hilfsfunktion: Entfernt ein Element, wenn es existiert
  function removeIfExists(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.parentNode.removeChild(element);
    }
  }

  // Zeile 1 entfernen, wenn Vorgang UND Betrag leer sind
  if (wert1 === 0 && kontoauszugVorgang1.trim() === "") {
    removeIfExists("kontoauszugDatum1");
  }

  // Zeile 2 entfernen, wenn Vorgang UND Betrag leer sind
  if (wert2 === 0 && kontoauszugVorgang2.trim() === "") {
    removeIfExists("kontoauszugDatum2");
  }

  // Zeile 3 entfernen, wenn Vorgang UND Betrag leer sind
  if (wert3 === 0 && kontoauszugVorgang3.trim() === "") {
    removeIfExists("kontoauszugDatum3");
  }
  // Laden der Daten für die Mail / E-Mail-Vorschau
  // Die Text-/Betreff-Inputs gibt es nicht mehr: Der Platzhaltertext steckt direkt
  // in der Vorlage und wird in der editierbaren Vorschau geändert. Überschreiben
  // nur noch, falls doch ein Feld existiert (Abwärtskompatibilität).
  const emailTextInput = document.getElementById("emailInputText");
  if (emailTextInput) SafeDOM.setText("emailTextMessage", emailTextInput.value);

  const emailSubjectInput = document.getElementById("emailSubjectInput");
  if (emailSubjectInput)
    SafeDOM.setText("emailSubject", emailSubjectInput.value);

  loadCompanyData(); // Laden der Kundeninformationen
  loadSupplierData(); // Laden der Lieferanteninformationen
  loadKontoauszugData(); // Laden der Quittungsdaten
  loadEmailData(); // Laden der E-Mail-Daten
  loadCompanyDataforEmail(); // Laden der E-Mail-Daten (Kunde)
}

async function quittungApplySVGholen(validationUeberspringen = false) {
  await applyBelegWithSVG("quittung", validationUeberspringen);
}

async function kassenbonApplySVGholen(validationUeberspringen = false) {
  await applyBelegWithSVG("kassenbon", validationUeberspringen);
}

async function journalApplySVGholen(validationUeberspringen = false) {
  await applyBelegWithSVG("lohnjournal", validationUeberspringen);
}

async function anlagenkarteApplySVGholen(validationUeberspringen = false) {
  await applyBelegWithSVG("anlagenkarte", validationUeberspringen);
}

async function wertpapiereApplySVGholen(validationUeberspringen = false) {
  await applyBelegWithSVG("wertpapiere", validationUeberspringen);
}

async function bescheidApplySVGholen(validationUeberspringen = false) {
  await applyBelegWithSVG("bescheid", validationUeberspringen);
}

// ============================================================================
// INSOLVENZVERFAHREN
// ============================================================================
const INSOLVENZ_VERWALTER_BRANCHE = "Insolvenzverwaltung";

function insolvenzVerwalterKandidaten() {
  return (yamlData || []).filter(
    (c) =>
      (c.unternehmen?.branche || "").trim() ===
        INSOLVENZ_VERWALTER_BRANCHE && c.unternehmen?.name,
  );
}

// Schuldner/-in: alle Unternehmen aus der YAML AUCH das Modellunternehmen
// – nur das gespeicherte Modellunternehmen (myCompany) ist ausgeschlossen
// (das insolvente Unternehmen ist nicht das eigene).
function insolvenzSchuldnerKandidaten() {
  const myCompany = (localStorage.getItem("myCompany") || "").trim();
  return (yamlData || []).filter(
    (c) => c.unternehmen?.name && c.unternehmen.name.trim() !== myCompany,
  );
}

// Dropdowns Schuldner/Verwalter befüllen – idempotent: nur neu aufbauen,
// wenn die Kandidatenliste sich geändert hat; getroffene Auswahl bleibt.
function insolvenzOptionenBefuellen() {
  if (!Array.isArray(yamlData) || yamlData.length === 0) return;
  const schuldnerSel = document.getElementById("datenInsolvenzSchuldner");
  const verwalterSel = document.getElementById("datenInsolvenzVerwalter");
  if (!schuldnerSel || !verwalterSel) return;

  const schuldner = insolvenzSchuldnerKandidaten();
  // Wie in den anderen Beleg-Dropdowns: nach Branche (dann Name) sortiert
  schuldner.sort((a, b) => {
    const bA = a.unternehmen?.branche || "",
      bB = b.unternehmen?.branche || "";
    return bA !== bB
      ? bA.localeCompare(bB)
      : (a.unternehmen?.name || "").localeCompare(b.unternehmen?.name || "");
  });
  const verwalter = insolvenzVerwalterKandidaten();

  const baue = (sel, liste) => {
    const aktuell = sel.value;
    sel.innerHTML = "";
    const leer = document.createElement("option");
    leer.value = "";
    leer.text = "— bitte auswählen —";
    leer.disabled = true;
    sel.appendChild(leer);
    liste.forEach((c) => {
      const o = document.createElement("option");
      o.value = c.unternehmen.name;
      o.text = c.unternehmen.branche
        ? `${c.unternehmen.branche} – ${c.unternehmen.name} ${c.unternehmen.rechtsform || ""}`.trim()
        : c.unternehmen.name;
      sel.appendChild(o);
    });
    if (aktuell && Array.from(sel.options).some((o) => o.value === aktuell))
      sel.value = aktuell;
  };

  if (schuldnerSel.options.length !== schuldner.length + 1)
    baue(schuldnerSel, schuldner);
  if (verwalterSel.options.length !== verwalter.length + 1)
    baue(verwalterSel, verwalter);

  // Fehlende Auswahl zufällig setzen (auch ein Modellunternehmen möglich,
  // jedoch niemals das gespeicherte – die Kandidatenliste filtert das schon).
  const zufallsAuswahl = (sel, liste) => {
    if (sel.value && Array.from(sel.options).some((o) => o.value === sel.value))
      return;
    if (liste.length === 0) {
      sel.value = "";
      return;
    }
    sel.value = liste[Math.floor(Math.random() * liste.length)].unternehmen.name;
  };
  zufallsAuswahl(schuldnerSel, schuldner);
  zufallsAuswahl(verwalterSel, verwalter);

  // Modellunternehmen-Dropdown (wird für spätere Verfahrensphasen benötigt):
  // alle Unternehmen der Branche "Modellunternehmen", vorausgewählt ist das
  // gespeicherte Modellunternehmen (myCompany).
  const modellSel = document.getElementById("datenInsolvenzModellunternehmen");
  if (modellSel) {
    const modell = (yamlData || []).filter(
      (c) =>
        (c.unternehmen?.branche || "").trim() === "Modellunternehmen" &&
        c.unternehmen?.name,
    );
    modell.sort((a, b) => {
      const bA = a.unternehmen?.branche || "",
        bB = b.unternehmen?.branche || "";
      return bA !== bB
        ? bA.localeCompare(bB)
        : (a.unternehmen?.name || "").localeCompare(b.unternehmen?.name || "");
    });
    if (modellSel.options.length !== modell.length + 1)
      baue(modellSel, modell);
    // Auswählen: gespeichertes myCompany, sonst erster Eintrag
    if (
      !modellSel.value ||
      !Array.from(modellSel.options).some((o) => o.value === modellSel.value)
    ) {
      const myCompany = (localStorage.getItem("myCompany") || "").trim();
      const match = myCompany
        ? Array.from(modellSel.options).find((o) => o.value === myCompany)
        : null;
      modellSel.value = match
        ? match.value
        : modell.length > 0
          ? modell[0].unternehmen.name
          : "";
    }
  }
}

// Deutsche TT.MM.JJJJ-Daten: n Tage weiterrechnen (nur volle Jahresangabe)
function insolvenzDatumPlusTage(text, tage) {
  const m = String(text || "")
    .trim()
    .match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) return "";
  const d = new Date(
    parseInt(m[3], 10),
    parseInt(m[2], 10) - 1,
    parseInt(m[1], 10),
  );
  d.setDate(d.getDate() + tage);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
}

// Füllt die SVG-Elemente des Eröffnungsbekanntmachungs-Belegs
function insolvenzDatenAnwenden() {
  const schuldnerSel = document.getElementById("datenInsolvenzSchuldner");
  const verwalterSel = document.getElementById("datenInsolvenzVerwalter");
  if (!schuldnerSel || !verwalterSel) return;

  insolvenzOptionenBefuellen();

  const schuldner = (yamlData || []).find(
    (c) => c.unternehmen?.name === schuldnerSel.value,
  );
  const verwalter = (yamlData || []).find(
    (c) => c.unternehmen?.name === verwalterSel.value,
  );

  const svgText = (id, wert) => {
    const el = document.getElementById(id);
    if (el) el.textContent = wert == null ? "" : String(wert);
  };
  // Formularfeld-Defaults nur setzen, solange Felder leer sind
  const setzeDefault = (id, wert) => {
    const el = document.getElementById(id);
    if (el && !(el.value || "").trim()) el.value = wert;
  };
  // Zufällige Uhrzeit am Vormittag (08.00 – 11.45)
  const naechsterSchritt = [0, 15, 30, 45];
  const zufallsUhrzeitVormittags = () => {
    const stunde = 8 + Math.floor(Math.random() * 4);
    const minute = naechsterSchritt[Math.floor(Math.random() * 4)];
    const p = (n) => String(n).padStart(2, "0");
    return `${p(stunde)}.${p(minute)}`;
  };

  if (schuldner) {
    const u = schuldner.unternehmen;
    setzeDefault("insolvenzOeffnungDateInput", (() => {
      const d = new Date();
      const p = (n) => String(n).padStart(2, "0");
      return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
    })());
  }
  const datumText = (
    document.getElementById("insolvenzOeffnungDateInput")?.value || ""
  ).trim();
  setzeDefault("insolvenzFristInput", insolvenzDatumPlusTage(datumText, 42));

  const datum = datumText || "TT.MM.JJJJ";
  const zeit = zufallsUhrzeitVormittags();
  const grund =
    document.getElementById("insolvenzGrundInput")?.value ||
    "Zahlungsunfähigkeit und Überschuldung";
  // Ort des Registergerichts = Ort der Schuldner/-in
  const gericht = schuldner?.unternehmen?.adresse?.ort
    ? "Amtsgericht " + schuldner.unternehmen.adresse.ort
    : "Amtsgericht ###";
  const frist =
    (document.getElementById("insolvenzFristInput")?.value || "").trim() ||
    "TT.MM.JJJJ";

  if (schuldner) {
    const u = schuldner.unternehmen;
    const firma = `${u.name}${u.rechtsform ? " " + u.rechtsform : ""}`.trim();
    svgText("insolvenzSchuldnerZeile1", `${firma}, ${u.adresse?.strasse || ""},`);
    svgText("insolvenzSchuldnerZeile2", `${u.adresse?.plz || ""} ${u.adresse?.ort || ""},`);
    svgText("insolvenzSchuldnerInhaber", u.inhaber ? ` ${u.inhaber}` : "");
  }
  svgText("insolvenzRegistergericht", gericht);
  svgText("insolvenzGrund", grund);
  svgText("insolvenzOeffnungDatum", datum);
  svgText("insolvenzOeffnungZeit", zeit);
  svgText("insolvenzFrist", frist);

  if (verwalter) {
    const v = verwalter.unternehmen;
    svgText("insolvenzVerwalterName", v.name || "");
    svgText(
      "insolvenzVerwalterAdresse",
      `${v.adresse?.strasse || ""}, ${v.adresse?.plz || ""} ${v.adresse?.ort || ""}`.replace(/^,\s*/, ""),
    );
    svgText("insolvenzVerwalterTelefon", v.kontakt?.telefon || "");
    svgText("insolvenzVerwalterTelefax", v.kontakt?.telefax || "");
    svgText("insolvenzVerwalterEmail", v.kontakt?.email || "");
  }
}

async function insolvenzApplySVGholen(validationUeberspringen = false) {
  // Schuldner-/Verwalter-Selects vor dem Rendern sicher befüllt haben,
  // damit Sammlung/URL-Parameter die Werte wie bei den anderen Belegen
  // setzen können.
  insolvenzOptionenBefuellen();
  await applyBelegWithSVG("insolvenz", validationUeberspringen);
}
window.insolvenzApplySVGholen = insolvenzApplySVGholen;

async function mahnungApplySVGholen(validationUeberspringen = false) {
  // Absender automatisch vorbelegen: 'myCompany' (localStorage) oder
  // das erste erfasste Modellunternehmen – solange nichts gewählt wurde.
  const absender = document.getElementById("datenMahnung");
  if (absender && !absender.value) {
    const meine = (localStorage.getItem("myCompany") || "").trim();
    const kandidat =
      yamlData.find((item) => item.unternehmen.name === meine) ||
      yamlData.find(
        (item) => item.unternehmen.branche?.trim() === "Modellunternehmen",
      ) ||
      yamlData.find((item) => item.unternehmen.name);
    if (kandidat) absender.value = kandidat.unternehmen.name;
  }
  // Empfänger automatisch vorbelegen (erstes Unternehmen ≠ Absender),
  // solange nichts gewählt wurde.
  const empfaenger = document.getElementById("datenMahnungEmpfaenger");
  if (empfaenger && !empfaenger.value) {
    const absenderName = document.getElementById("datenMahnung")?.value;
    const kandidat = yamlData.find(
      (item) => item.unternehmen.name && item.unternehmen.name !== absenderName,
    );
    if (kandidat) empfaenger.value = kandidat.unternehmen.name;
  }
  await applyBelegWithSVG("mahnung", validationUeberspringen);
}

// ============================================================================
// START-AUFBAU: ALLE BELEGE SOFORT BEIM SEITENAUFRUF ERSTELLEN
// (nicht erst beim Klick auf „Alle Daten übernehmen")
// ============================================================================
let belegStartErstellungLaeuft = false;

async function alleBelegeAutomatischErstellen() {
  if (belegStartErstellungLaeuft) return;
  belegStartErstellungLaeuft = true;
  const still = true; // beim Aufbau keine Validierungs-Popups

  try {
    await applySVGholen(still);
  } catch (err) {
    console.warn("Startaufbau Rechnung/Kontoauszug/Mail fehlgeschlagen:", err);
  }

  // Jeder Beleg einzeln abgesichert: ein Fehler eines einzelnen Belegs
  // darf die restlichen nicht mehr abbrechen.
  const jobs = [
    ["Quittung", () => quittungApplySVGholen(still)],
    ["Kassenbon", () => kassenbonApplySVGholen(still)],
    ["Bescheid", () => bescheidApplySVGholen(still)],
    ["Mahnung", () => mahnungApplySVGholen(still)],
    ["Anlagenkarte", () => anlagenkarteApplySVGholen(still)],
    ["Wertpapiere", () => wertpapiereApplySVGholen(still)],
    ["Insolvenz", () => insolvenzApplySVGholen(still)],
    ["Lohnjournal", () => journalApplySVGholen(still)],
    ["Lohnabrechnung", () => lohnabrechnungApplySVGholen(still)],
  ];
  for (const [name, job] of jobs) {
    try {
      await job();
    } catch (err) {
      console.warn(`Startaufbau ${name} fehlgeschlagen:`, err);
    }
  }
  window._belegeInitialisiert = true;
  try {
    document.dispatchEvent(new Event("belegeInitialisiert"));
  } catch (e) {}
  // Zeitungsartikel wird live über seine Formular-Inputs gesteuert (kein Render-Schritt)
}

// ============================================================================
// SPEZIALFUNKTIONEN
// ============================================================================
function zahlwort(zahl) {
  var sonderzahlen = [];
  sonderzahlen[11] = "elf";
  sonderzahlen[12] = "zwölf";
  sonderzahlen[16] = "sechzehn";
  sonderzahlen[17] = "siebzehn";

  var zahlen = [];
  zahlen[1] = "ein";
  zahlen[2] = "zwei";
  zahlen[3] = "drei";
  zahlen[4] = "vier";
  zahlen[5] = "fünf";
  zahlen[6] = "sechs";
  zahlen[7] = "sieben";
  zahlen[8] = "acht";
  zahlen[9] = "neun";
  zahlen[10] = "zehn";
  zahlen[20] = "zwanzig";
  zahlen[30] = "dreißig";
  zahlen[40] = "vierzig";
  zahlen[50] = "fünfzig";
  zahlen[60] = "sechzig";
  zahlen[70] = "siebzig";
  zahlen[80] = "achtzig";
  zahlen[90] = "neunzig";

  var einheiten = ["", "tausend", "Million", "Milliarde", "Billion"];
  var trennschritte = 1000;
  var zahlinworten = "";

  if (zahl == 0) zahlinworten = "null";
  for (var i = 0; i < Math.ceil(zahl.toString().length / 3); i++) {
    if (i > einheiten.length - 1) return "Zahl nicht unterstützt";
    if (i == 0) zahlenblock = zahl % trennschritte;
    else
      zahlenblock =
        ((zahl % trennschritte) - (zahl % (trennschritte / 1000))) /
        (trennschritte / 1000);
    einer = zahlenblock % 10;
    zehn = zahlenblock % 100;
    hunderter = (zahlenblock - (zahlenblock % 100)) / 100;
    einheitenendung = einheiten[i].substr(einheiten[i].length - 1, 1);

    if (zahlenblock > 0) {
      if (zahlenblock > 1 && einheitenendung == "n")
        zahlinworten = " " + einheiten[i] + "en " + zahlinworten;
      else if (zahlenblock > 1 && einheitenendung == "e")
        zahlinworten = " " + einheiten[i] + "n " + zahlinworten;
      else if (zahlenblock > 0 && i == 1)
        zahlinworten = einheiten[i] + zahlinworten;
      else zahlinworten = " " + einheiten[i] + " " + zahlinworten;
    }

    if (zehn > 0) {
      if (zehn == 1 && i == 0) zahlinworten = "eins" + zahlinworten;
      else if (zehn == 1 && i == 1) zahlinworten = "ein" + zahlinworten;
      else if (zehn == 1 && i > 1) zahlinworten = "eine" + zahlinworten;
      else if (sonderzahlen[zehn])
        zahlinworten = sonderzahlen[zehn] + zahlinworten;
      else {
        if (zehn > 9) zahlinworten = zahlen[zehn - einer] + zahlinworten;
        if (zehn > 20 && einer > 0) zahlinworten = "und" + zahlinworten;
        if (einer > 0) zahlinworten = zahlen[einer] + zahlinworten;
      }
    }

    if (hunderter > 0)
      zahlinworten = zahlen[hunderter] + "hundert" + zahlinworten;

    trennschritte *= 1000;
  }
  return zahlinworten.trim();
}

// Local Storage Status anzeigen
function updateLocalStorageStatus(message) {
  console.log("Local Storage Status:", message);
  // Optional: Status-Nachricht im UI anzeigen
  const statusElement = document.getElementById("localStorageStatus");
  if (statusElement) {
    statusElement.textContent = message;
  }
}

// ============================================================================
// UI-FUNKTIONEN
// ============================================================================
function updateColors() {
  let colorPicker = document.getElementById("colorPicker");
  let colorElements = document.querySelectorAll(".colorSVG");
  let textColorliefererInformationen2 = document.getElementById(
    "liefererInformationen2",
  );
  if (textColorliefererInformationen2 !== null) {
    textColorliefererInformationen2.setAttribute("fill", colorPicker.value);
  } else {
  }
  // Update the color of SVG elements and other elements with the color picker value
  colorElements.forEach(function (element) {
    if (element instanceof SVGElement) {
      element.setAttribute("fill", colorPicker.value);
    } else {
      element.style.backgroundColor = colorPicker.value;
    }
  });
  adjustTextColor();
}

// Initialisierung der Farben beim Laden des DOM
document.addEventListener("DOMContentLoaded", function () {
  let colorPicker = document.getElementById("colorPicker");
  colorPicker.addEventListener("input", updateColors);
});

// ============================================================================
// SVG/TEMPLATE-VERWALTUNG
// ============================================================================
function applySVGholen(validationUeberspringen = false) {
  return applySVG().then(() => {
    applyOrderData(validationUeberspringen);
    adjustTextColor();
  });
}

// Zufällige Ausgangsrechnung erstellen
function zufaelligeAusgangsrechnungErstellen() {
  const dropdown = document.getElementById("svgDropdown");
  if (!dropdown) return;
  const options = Array.from(dropdown.options);
  const rechnungOptions = options.filter(
    (o) =>
      o.value.toLowerCase().includes("rechnung") ||
      o.value.toLowerCase().includes("angebot") ||
      o.value.toLowerCase().includes("gutschrift"),
  );
  if (rechnungOptions.length > 0) {
    const random =
      rechnungOptions[Math.floor(Math.random() * rechnungOptions.length)];
    dropdown.value = random.value;
  }
  applySVGholen();
}

// Zufällige Eingangsrechnung erstellen
function zufaelligeEingangsrechnungErstellen() {
  const dropdown = document.getElementById("svgDropdown");
  if (!dropdown) return;
  const options = Array.from(dropdown.options);
  const rechnungOptions = options.filter(
    (o) =>
      o.value.toLowerCase().includes("rechnung") ||
      o.value.toLowerCase().includes("angebot") ||
      o.value.toLowerCase().includes("gutschrift"),
  );
  if (rechnungOptions.length > 0) {
    const random =
      rechnungOptions[Math.floor(Math.random() * rechnungOptions.length)];
    dropdown.value = random.value;
  }
  applySVGholen();
}

function hexToRgb(hex) {
  hex = hex.replace(/^#/, "");
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return [r, g, b];
}

function calculateContrast(rgb1, rgb2) {
  const brightness1 = (rgb1[0] * 299 + rgb1[1] * 587 + rgb1[2] * 114) / 1000;
  const brightness2 = (rgb2[0] * 299 + rgb2[1] * 587 + rgb2[2] * 114) / 1000;

  const contrast = Math.abs(brightness1 - brightness2);

  return contrast;
}

function rgbToArray(rgb) {
  const result = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/.exec(rgb);
  return result
    ? [parseInt(result[1]), parseInt(result[2]), parseInt(result[3])]
    : [0, 0, 0];
}

function adjustTextColor() {
  const colorSVGElements = document.querySelectorAll(".colorSVG");
  const liefererInformationen = document.getElementById(
    "liefererInformationen",
  );
  const footerText = document.getElementById("footerText");
  let backgroundColorHex;
  let rgbBackground;

  if (liefererInformationen !== null) {
    // Überprüfe, ob das Element gefunden wurde, bevor die Hintergrundfarbe abgerufen wird
    if (colorSVGElements.length > 0) {
      // Nehme den Hex-Wert des ersten Rechtecks mit der Klasse "colorSVG"
      if (colorSVGElements[0] instanceof SVGElement) {
        backgroundColorHex = colorSVGElements[0].getAttribute("fill");
        rgbBackground = hexToRgb(backgroundColorHex);
      } else {
        rgbBackground = rgbToArray(colorSVGElements[0].style.backgroundColor);
      }
      let textColor;
      // Wandele den Hex-Wert in RGB um

      if (liefererInformationen instanceof SVGElement) {
        textColor = liefererInformationen.getAttribute("fill");
      } else {
        textColor = window.getComputedStyle(liefererInformationen).color;
      }
      // Überprüfe, ob RGB-Werte gültig sind
      if (rgbBackground && rgbBackground.length === 3) {
        let rgbText;
        rgbText = hexToRgb(textColor);
        if (rgbText && rgbText.length === 3) {
          const contrast = calculateContrast(rgbBackground, rgbText);
          const contrastThreshold = 150;
          const newTextColor = contrast > contrastThreshold ? "#000" : "#fff";

          // Setze die Textfarbe unabhängig von der vorherigen Bedingung
          if (liefererInformationen instanceof SVGElement) {
            liefererInformationen.setAttribute("fill", newTextColor);
            footerText.setAttribute("fill", newTextColor);
          } else {
            liefererInformationen.style.color = newTextColor;
            footerText.style.color = newTextColor;
          }
        } else {
        }
      }
    } else {
      console.log("No elements found in colorSVGElements");
    }
  }
}

// newspaper

const applyChangesButton = document.getElementById(
  "newspaperApplyChangesButton",
);

applyChangesButton.addEventListener("click", () => {
  const newspaperHeadlineInput = document.getElementById(
    "newspaperHeadlineInput",
  );
  const newspaperTextInput = document.getElementById("newspaperTextInput");
  const newspaperSourceInput = document.getElementById("newspaperSourceInput");

  document.getElementById("newspaperHeadline").innerText =
    newspaperHeadlineInput.value;
  document.getElementById("newspaperContent").innerText =
    newspaperTextInput.value;
  document.getElementById("newspaperSource").innerText =
    newspaperSourceInput.value;
});

const newspaperColumnRange = document.getElementById("newspaperColumnRange");
const newspaperColumnValue = document.getElementById("newspaperColumnValue");

newspaperColumnRange.addEventListener("input", () => {
  newspaperColumnValue.innerText = newspaperColumnRange.value;
  newspaperContent.style.columnCount = newspaperColumnRange.value;
});

const newspaperColorInput = document.getElementById("newspaperColorInput");
const newspaperDiv = document.getElementById("newspaperDiv");
newspaperColorInput.addEventListener("input", () => {
  newspaperDiv.style.backgroundColor = newspaperColorInput.value;
});

async function applySVG() {
  let selectedTemplate = document.getElementById("svgDropdown").value;
  let svgContainer = document.getElementById("rechnung1Container");

  try {
    let svgData = await loadSVGTemplate(selectedTemplate);
    svgContainer.innerHTML = "";
    svgContainer.appendChild(safelyParseSVG(svgData));
  } catch (error) {
    console.error("Fehler beim Anwenden der Daten:", error);
  }

  let selectedKontoauszug = document.getElementById(
    "svgDropdownKontoauszug",
  ).value;
  let svgContainerKontoauszug = document.getElementById("kontoauszugContainer");

  try {
    let svgData = await loadSVGTemplate(selectedKontoauszug);
    svgContainerKontoauszug.innerHTML = "";
    svgContainerKontoauszug.appendChild(safelyParseSVG(svgData));
  } catch (error) {
    console.error("Fehler beim Anwenden der Daten:", error);
  }

  try {
    await applyHTMLTemplate(
      document.getElementById("svgDropdownEmail").value,
      "emailContainer",
    );
  } catch (error) {
    console.error("Mail-Vorlage konnte nicht geladen werden:", error);
  }

  let selectedQuittung = document.getElementById("svgDropdownQuittung").value;
  let svgContainerQuittung = document.getElementById("quittungContainer");

  try {
    let svgData = await loadSVGTemplate(selectedQuittung);
    svgContainerQuittung.innerHTML = "";
    svgContainerQuittung.appendChild(safelyParseSVG(svgData));
  } catch (error) {
    console.error("Fehler beim Anwenden der Daten:", error);
  }
}

// Cache-Buster für Vorlage-Fetches: garantiert frische Vorlagen bei jedem Seitenaufruf
const vorlagenCacheBuster = Date.now();

async function loadSVGTemplate(templateName) {
  const response = await fetch(
    "templates/" + templateName + "?t=" + vorlagenCacheBuster,
  );
  if (!response.ok) {
    throw new Error(
      `Vorlage nicht gefunden: ${templateName} (${response.status})`,
    );
  }
  return await response.text();
}

async function applyHTMLTemplate(templateName, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const html = await loadSVGTemplate(templateName);
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.querySelectorAll("script").forEach((s) => s.remove());

  container.innerHTML = "";
  doc.head
    .querySelectorAll('style, link[rel="stylesheet"]')
    .forEach((el) => container.appendChild(el));
  while (doc.body.firstChild) {
    container.appendChild(doc.body.firstChild);
  }
}

// (Kein zweiter DOMContentLoaded-Handler mit setTimeout mehr: Die zentrale Pipeline
//  DOMContentLoaded → initializeYamlData → updateAllDropdowns → alleBelegeAutomatischErstellen
//  übernimmt alles. Die Farb-/Daten-Nachsorge (loadSupplierData etc.) läuft über
//  applySVGholen → applyOrderData. Doppelt registrierte Change-Listener waren
//  hier die Folge – deshalb weg damit.)

function toggleInput(inputId, checkboxId) {
  let inputElement = document.getElementById(inputId);
  let checkboxElement = document.getElementById(checkboxId);

  inputElement.disabled = checkboxElement.checked;
}

// Export

// ERSETZEN Sie die gesamte exportDokument Funktion:
const EXPORT_CONFIG = {
  kontoauszug: {
    id: "kontoauszugContainer",
    name: "kontoauszug",
    label: "Kontoauszug",
    firmaSelect: "datenKontoauszug",
    praep: "von",
  },
  rechnung: {
    id: "rechnung1Container",
    name: "rechnung",
    label: "Rechnung", // Fallback
    firmaSelect: "datenLieferer",
    praep: "von",
    labelSelect: "svgDropdown",
  },
  quittung: {
    id: "quittungContainer",
    name: "quittung",
    label: "Quittung",
    firmaSelect: "datenQuittung",
    praep: "von",
  },
  kassenbon: {
    id: "kassenbonContainer",
    name: "kassenbon",
    label: "Kassenbon",
    firmaSelect: "datenKassenbon",
    praep: "von",
  },
  lohnjournal: {
    id: "lohnjournalContainer",
    name: "lohnjournal",
    label: "Lohnjournal",
    firmaSelect: "datenLohnjournal",
    praep: "von",
  },
  email: {
    id: "emailContainer",
    name: "email",
    label: "E-Mail",
    firmaSelect: "datenEmail",
    praep: "von",
  },
  newspaper: {
    id: "newspaperContainer",
    name: "newspaper",
    label: "Zeitungsartikel",
    firmaSelect: null,
  },
  lohnjournalBS: {
    id: "lohnjournalBuchungssatzContainer",
    name: "lohnjournalBuchungssatz",
    label: "Lohnjournal-Buchungssatz",
    firmaSelect: null,
  },
  bescheid: {
    id: "bescheidContainer",
    name: "bescheid",
    label: "Bescheid",
    firmaSelect: "datenBescheid",
    praep: "für",
  },
  insolvenz: {
    id: "insolvenzContainer",
    name: "insolvenzbekanntmachung",
    label: "Insolvenzbekanntmachung",
    firmaSelect: "datenInsolvenzSchuldner",
    praep: "über",
  },
  mahnung: {
    id: "mahnungContainer",
    name: "mahnung",
    label: "Mahnung",
    firmaSelect: "datenMahnung",
    praep: "für",
  },
  anlagenkarte: {
    id: "anlagenkarteContainer",
    name: "anlagenkarte",
    label: "Anlagenkarte",
    firmaSelect: "datenAnlagenkarte",
    praep: "von",
  },
  wertpapiere: {
    id: "wertpapiereContainer",
    name: "wertpapier",
    label: "Wertpapierabrechnung",
    firmaSelect: "datenWertpapiere",
    praep: "für",
  },
  lohnabrechnung: {
    id: "lohnabrechnungContainer",
    name: "lohnabrechnung",
    label: "Lohnabrechnung",
    firmaSelect: "datenLohnabrechnung",
    praep: "von",
  },
};

// Datum des Exports als YYYY-MM-DD (lokale Zeit, nicht UTC)
function exportDatumString() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// Belegart: Anzeigetext der gewählten Vorlage (optional mit Präfix), sonst Standard-Label
function getExportLabel(config) {
  if (config.labelSelect) {
    const select = document.getElementById(config.labelSelect);
    const text = select?.options[select.selectedIndex]?.text?.trim();
    if (text)
      return config.labelPrefix ? `${config.labelPrefix} ${text}` : text;
  }
  return config.label;
}

// Entfernt Zeichen, die in Dateinamen Probleme machen
function sanitizeFilenamePart(text) {
  return String(text || "")
    .replace(/&/g, "und")
    .replace(/\./g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/[\\/:*?"<>|()]/g, "");
}

// Firmenname inkl. Rechtsform aus dem passenden Dropdown (leer, wenn nichts gewählt)
function getExportFirmenName(selectId) {
  if (!selectId) return "";
  const name = document.getElementById(selectId)?.value;
  if (!name) return "";
  const firma = yamlData.find((item) => item.unternehmen.name === name);
  const rechtsform = firma?.unternehmen?.rechtsform || "";
  return `${name} ${rechtsform}`.trim();
}

// z. B. "Gutschrift bei Mängelrüge von Müller GmbH"
function buildExportTitel(typ) {
  const config = EXPORT_CONFIG[typ];
  const label = getExportLabel(config); // ← Anzeigetext der gewählten Vorlage
  const firma = getExportFirmenName(config.firmaSelect);
  return firma ? `${label} ${config.praep || "von"} ${firma}` : label;
}

// z. B. "2026-10-18_Rechnung_von_Müller_GmbH.svg"
function buildExportFilename(typ, extension) {
  return `${exportDatumString()}_${sanitizeFilenamePart(buildExportTitel(typ))}.${extension}`;
}

// ============================================================================
// EXPORT-FUNKTIONEN
// ============================================================================
function exportDokument(typ, format) {
  const config = EXPORT_CONFIG[typ];
  if (!config) {
    console.error("Unbekannter Dokumenttyp:", typ);
    return;
  }

  // HTML-Typen, die kein SVG haben
  const htmlTypes = ["email", "newspaper", "lohnjournalBS"];

  switch (format) {
    case "png":
      exportPNG(
        config.id,
        buildExportFilename(typ, "png"),
        null,
        htmlTypes.includes(typ),
      );
      break;
    case "svg":
      if (htmlTypes.includes(typ)) {
        copyHTMLToClipboard(config.id);
      } else {
        exportSVG(
          config.id,
          buildExportFilename(typ, "svg"),
          buildExportTitel(typ),
        );
      }
      break;
    case "clipboard":
      if (htmlTypes.includes(typ)) {
        copyHTMLToClipboard(config.id);
      } else {
        copyToClipboard(config.id);
      }
      break;
    default:
      console.error("Unbekanntes Format:", format);
  }
}

function emailHerunterladen() {
  const emailHTML = document
    .getElementById("emailContainer")
    .innerHTML.replace(/&nbsp;/g, " ");
  const blob = new Blob([emailHTML], { type: "html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = buildExportFilename("email", "html");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function newspaperHerunterladen() {
  const emailHTML = document
    .getElementById("newspaperContainer")
    .innerHTML.replace(/&nbsp;/g, " ");
  const blob = new Blob([emailHTML], { type: "html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = buildExportFilename("newspaper", "html");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function lohnjournalBuchungssatzHerunterladen() {
  const emailHTML = document
    .getElementById("lohnjournalBuchungssatzContainer")
    .innerHTML.replace(/&nbsp;/g, " ");
  const blob = new Blob([emailHTML], { type: "html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = buildExportFilename("lohnjournalBS", "html");
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

let clipboardLohnjournal = new ClipboardJS(
  "#officeButtonLohnjournalBuchungssatz",
);

clipboardLohnjournal.on("success", function (e) {
  console.log("Die Tabelle wurde in die Zwischenablage kopiert.");
  zeigeModal("Die Tabelle wurde in die Zwischenablage kopiert.");
});

clipboardLohnjournal.on("error", function (e) {
  console.error("Fehler beim Kopieren der Tabelle: ", e.action);
  zeigeModal("Fehler beim Kopieren der Tabelle.");
});

let clipboardNewspaper = new ClipboardJS("#officeButtonNewspaper");

clipboardNewspaper.on("success", function (e) {
  console.log("Die Tabelle wurde in die Zwischenablage kopiert.");
  zeigeModal("Die Tabelle wurde in die Zwischenablage kopiert.");
});

clipboardNewspaper.on("error", function (e) {
  console.error("Fehler beim Kopieren der Tabelle: ", e.action);
  zeigeModal("Fehler beim Kopieren der Tabelle.");
});

let clipboardEmail = new ClipboardJS("#officeButtonEmail");

clipboardEmail.on("success", function (e) {
  console.log("Die Tabelle wurde in die Zwischenablage kopiert.");
  zeigeModal("Die Tabelle wurde in die Zwischenablage kopiert.");
});

clipboardEmail.on("error", function (e) {
  console.error("Fehler beim Kopieren der Tabelle: ", e.action);
  zeigeModal("Fehler beim Kopieren der Tabelle.");
});

function validateInputs(still = false) {
  // Textfelder validieren
  for (const [inputId, rule] of Object.entries(VALIDATION_RULES.text)) {
    const input = document.getElementById(inputId);
    if (input && !isValidText(input.value, rule.max)) {
      if (!still)
        zeigeModal(
          `Bitte geben Sie eine gültige ${rule.label} ein. Maximal ${rule.max} Zeichen!`,
        );
      return false;
    }
  }

  // Zahlenfelder validieren
  for (const [inputId, rule] of Object.entries(VALIDATION_RULES.number)) {
    const input = document.getElementById(inputId);
    if (input && !isValidNumber(input.value, rule.min, rule.max)) {
      if (!still)
        zeigeModal(
          `Bitte geben Sie bei ${rule.label} gültige Werte zwischen ${rule.min} und ${rule.max} ein.`,
        );
      return false;
    }
  }

  // Prozentfelder validieren
  for (const [inputId, rule] of Object.entries(VALIDATION_RULES.percentage)) {
    const input = document.getElementById(inputId);
    if (input && !isValidPercentage(input.value)) {
      if (!still)
        zeigeModal(
          `Bitte geben Sie bei ${rule.label} gültige Werte zwischen 0 und 100 ein.`,
        );
      return false;
    }
  }

  // Spezielle Validierung: Kraftfahrzeugsteuer-Zulassungsdatum
  // (leer ist erlaubt, aber wenn gesetzt: gültiges Datum verlangen)
  const zulassungInput = document.getElementById("bescheidZulassungInput");
  if (
    zulassungInput &&
    zulassungInput.value.trim() &&
    bescheidKfzFristen(zulassungInput.value).length === 0
  ) {
    if (!still)
      zeigeModal(
        "Bitte geben Sie bei der Zulassung ein gültiges Datum ein (z. B. 15.03.2025).",
      );
    return false;
  }

  // Spezielle Validierung: Gesamtpreis-Check
  const menge1 = parseFloat(document.getElementById("mengeInput")?.value || 0);
  const preis1 = parseFloat(
    document.getElementById("einzelpreisInput")?.value || 0,
  );
  if (menge1 * preis1 > 999999999) {
    if (!still)
      zeigeModal(
        "Die Gesamtsumme (Menge * Einzelpreis) Pos. 1 darf nicht höher als 999.999.999,00 sein.",
      );
    return false;
  }

  const menge2 = parseFloat(document.getElementById("mengeInput2")?.value || 0);
  const preis2 = parseFloat(
    document.getElementById("einzelpreisInput2")?.value || 0,
  );
  if (menge2 * preis2 > 999999999) {
    if (!still)
      zeigeModal(
        "Die Gesamtsumme (Menge * Einzelpreis) Pos. 2 darf nicht höher als 999.999.999,00 sein.",
      );
    return false;
  }

  return true;
}

// ============================================================================
// VALIDIERUNGS-KONFIGURATION
// ============================================================================

const VALIDATION_RULES = {
  // Textfelder mit Maximallänge
  text: {
    artikelInput: { max: 28, label: "Artikelbezeichnung Pos. 1" },
    artikelInput2: { max: 28, label: "Artikelbezeichnung Pos. 2" },
    angebotLieferzeitInput: { max: 25, label: "Lieferzeit" },
    einheitInput: { max: 5, label: "Einheit Pos. 1" },
    einheitInput2: { max: 5, label: "Einheit Pos. 2" },
    kontoauszugVorgang1Input: { max: 45, label: "Kontoauszug Vorgang 1" },
    kontoauszugVorgang2Input: { max: 45, label: "Kontoauszug Vorgang 2" },
    kontoauszugVorgang3Input: { max: 45, label: "Kontoauszug Vorgang 3" },
    quittungZweckInput: { max: 50, label: "Quittung Zweck" },
    kassenbonZweckInput: { max: 20, label: "Kassenbon Artikel" },
    kassenbonZweckInput2: { max: 20, label: "Kassenbon Artikel 2" },
    kassenbonZweckInput3: { max: 20, label: "Kassenbon Artikel 3" },
    newspaperHeadlineInput: { max: 150, label: "Zeitungs-Überschrift" },
    newspaperTextInput: { max: 5000, label: "Zeitungs-Text" },
    newspaperSourceInput: { max: 150, label: "Zeitungs-Quelle" },
    anlagenkarteBezeichnungInput: {
      max: 20,
      label: "Anlagenkarte Bezeichnung",
    },
    mahnungRechnungsNrInput: { max: 8, label: "Rechnungsnummer" },
    wertpapiereBezeichnungInput: { max: 20, label: "Wertpapiere Bezeichnung" },
    wertpapiereISINInput: { max: 12, label: "ISIN" },
    bescheidFahrzeugInput: { max: 50, label: "Fahrzeug (Kfz-Bescheid)" },
    bescheidZulassungInput: { max: 25, label: "Zulassung (Kfz-Bescheid)" },
    jahrBescheid: { max: 4, label: "Jahr (Bescheid)" },
    jahr: { max: 4, label: "Jahr (Rechnung)" },
    jahrKontoauszug: { max: 6, label: "Jahr (Kontoauszug)" },
    jahrWertpapiere: { max: 6, label: "Jahr (Wertpapiere)" },
    lohnabrechnungAusbildungsberufInput: { max: 60, label: "Ausbildungsberuf" },
  },

  // Zahlenfelder mit Min/Max
  number: {
    mengeInput: { min: 0, max: 9999, label: "Menge Pos. 1" },
    mengeInput2: { min: 0, max: 9999, label: "Menge Pos. 2" },
    einzelpreisInput: { min: 0, max: 9999999, label: "Einzelpreis Pos. 1" },
    einzelpreisInput2: { min: 0, max: 9999999, label: "Einzelpreis Pos. 2" },
    bezugskostenInput: { min: 0, max: 9999999, label: "Bezugskosten" },
    zahlungszielInput: { min: 0, max: 365, label: "Zahlungsziel" },
    skontofristInput: { min: 0, max: 365, label: "Skontofrist" },
    kontoauszugKontostand_altInput: {
      min: -999999999,
      max: 999999999,
      label: "Kontostand",
    },
    quittungNettoInput: { min: 0, max: 9999, label: "Quittung Nettobetrag" },
    quittungUSTInput: { min: 0, max: 99, label: "Quittung UST" },
    kassenbonNettoInput: { min: 0, max: 5000, label: "Kassenbon Nettobetrag" },
    kassenbonUSTInput: { min: 0, max: 99, label: "Kassenbon UST" },
    kassenbonNettoInput2: {
      min: 0,
      max: 5000,
      label: "Kassenbon Nettobetrag 2",
    },
    kassenbonUSTInput2: { min: 0, max: 99, label: "Kassenbon UST 2" },
    kassenbonNettoInput3: {
      min: 0,
      max: 5000,
      label: "Kassenbon Nettobetrag 3",
    },
    kassenbonUSTInput3: { min: 0, max: 99, label: "Kassenbon UST 3" },
    anlagenkarteAnschaffungskostenInput: {
      min: 0,
      max: 999999,
      label: "Anschaffungskosten",
    },
    anlagenkarteNutzungsdauerInput: { min: 0, max: 99, label: "Nutzungsdauer" },
    wertpapiereStueckkursInput: { min: 1, max: 5000, label: "Stückkurs" },
    wertpapiereAnzahlInput: { min: 1, max: 5000, label: "Wertpapiere Anzahl" },
    bescheidMessbetragInput: { min: 0, max: 9999, label: "Messbetrag" },
    bescheidHebesatzInput: { min: 0, max: 999, label: "Hebesatz" },
    bescheidBetragInput: { min: 0, max: 99999, label: "Betrag (Kfz-Steuer)" },
    mahnungBetragInput: { min: 0, max: 9999999, label: "Rechnungsbetrag" },
    mahnungZinssatzInput: { min: 0, max: 30, label: "Verzugszinssatz" },
    mahnungPauschaleInput: { min: 0, max: 999, label: "Mahngebühren" },
    mahnungFristInput: { min: 0, max: 365, label: "Zahlungsfrist" },
    lohnabrechnungBruttoInput: { min: 0, max: 20000, label: "Bruttogehalt" },
    lohnabrechnungKVSatzInput: { min: 0, max: 20, label: "KV-Satz" },
    lohnabrechnungPVSatzInput: { min: 0, max: 5, label: "PV-Satz" },
    lohnabrechnungRVSatzInput: { min: 0, max: 20, label: "RV-Satz" },
    lohnabrechnungALVSatzInput: { min: 0, max: 10, label: "ALV-Satz" },
  },

  // Prozentfelder
  percentage: {
    rabattInput: { label: "Rabatt" },
    umsatzsteuerInput: { label: "Umsatzsteuer" },
    skontoInput: { label: "Skonto" },
  },
};

// ============================================================================
// VALIDIERUNG
// ============================================================================

// Validierungs-Hilfsfunktionen
function isValidText(value, maxLength) {
  // Überprüfung auf HTML-Tags und Skripte
  const regex = /<.*?>/g;
  if (regex.test(value)) return false;

  // Leerer Wert ist gültig
  if (value.trim() === "") return true;

  // Längencheck
  return value.trim().length <= maxLength;
}

function isValidNumber(value, minValue, maxValue) {
  // Überprüfung auf HTML-Tags
  const regex = /<.*?>/g;
  if (regex.test(value)) return false;

  // Leerer Wert ist gültig
  if (value.trim() === "") return true;

  // Zahlencheck
  const numericValue = parseFloat(value);
  return (
    !isNaN(numericValue) && numericValue >= minValue && numericValue <= maxValue
  );
}

function isValidPercentage(value) {
  return isValidNumber(value, 0, 100);
}

// Globale Verfügbarkeit der Beleg-Validatoren
window.isValidText = isValidText;
window.isValidNumber = isValidNumber;
window.isValidPercentage = isValidPercentage;

// ============================================================================
// BELEG-APPLY KONFIGURATION
// ============================================================================

const BELEG_APPLY_CONFIG = {
  quittung: {
    svgDropdown: "svgDropdownQuittung",
    container: "quittungContainer",
    jahrCheckbox: "scriptJahrQuittung",
    jahrInput: "jahrQuittung",
    jahrClass: "aktuellesJahrQuittung",
    customDefs: "customDefsQuittung",
    scriptId: "customJsQuittung",
    scriptFunction: "SVGonLoadQuittung",
    dataFunction: () => {
      // Quittung-spezifische Daten
      let quittungZweck = document.getElementById("quittungZweckInput").value;
      document.getElementById("quittungZweck").textContent = quittungZweck;

      const selectedTag = document.getElementById("tagQuittung").value;
      const selectedMonat = document.getElementById("monatQuittung").value;
      document.getElementById("quittungTag").textContent = selectedTag;
      document.getElementById("quittungMonat").textContent = selectedMonat;

      let quittungNetto =
        document.getElementById("quittungNettoInput").value || "0";
      quittungNetto = parseFloat(quittungNetto).toFixed(2);
      let [nettoVorKomma, nettoNachKomma] = quittungNetto.split(".");
      document.getElementById("quittungNetto").textContent = nettoVorKomma;
      document.getElementById("quittungNettoCent").textContent = nettoNachKomma;

      let quittungUST =
        document.getElementById("quittungUSTInput").value || "0";
      document.getElementById("quittungUST").textContent = quittungUST;

      let quittungUSTBetrag =
        (parseFloat(quittungNetto) * parseFloat(quittungUST)) / 100;
      quittungUSTBetrag = FormatHelper.roundToTwo(quittungUSTBetrag).toFixed(2);
      let [USTVorKomma, USTNachKomma] = quittungUSTBetrag.split(".");
      document.getElementById("quittungUSTBetrag").textContent = USTVorKomma;
      document.getElementById("quittungUSTBetragCent").textContent =
        USTNachKomma;

      let quittungSumme = (
        parseFloat(quittungUSTBetrag) + parseFloat(quittungNetto)
      ).toFixed(2);
      let [summeVorKomma, summeNachKomma] = quittungSumme.split(".");
      document.getElementById("quittungSumme").textContent = summeVorKomma;
      document.getElementById("quittungSummeCent").textContent = summeNachKomma;

      const quittungInWorten = zahlwort(parseFloat(summeVorKomma));
      document.getElementById("quittungInWorten").textContent =
        quittungInWorten;

      loadQuittungData();
      loadCompanyDataforQuittung();
    },
  },
  kassenbon: {
    svgDropdown: "svgDropdownKassenbon",
    container: "kassenbonContainer",
    jahrCheckbox: "scriptJahrKassenbon",
    jahrInput: "jahrKassenbon",
    jahrClass: "aktuellesJahrKassenbon",
    customDefs: "customDefsKassenbon",
    scriptId: "customJsKassenbon",
    scriptFunction: "SVGonLoadKassenbon",
    dataFunction: () => {
      // Kassenbon: bis zu 3 Artikel (Taxi-Vorlage nutzt nur Artikel 1)
      const artikel = [];
      for (let n = 1; n <= 3; n++) {
        const suffix = n === 1 ? "" : String(n);
        const zweckEl = document.getElementById("kassenbonZweckInput" + suffix);
        const nettoEl = document.getElementById("kassenbonNettoInput" + suffix);
        const ustEl = document.getElementById("kassenbonUSTInput" + suffix);
        if (!zweckEl || !nettoEl) continue;
        const zweck = zweckEl.value.trim();
        const nettoText = nettoEl.value.trim();
        if (zweck === "" && nettoText === "") continue;
        const ustText = ustEl ? ustEl.value.trim() : "19";
        const nettoWert = parseFloat(nettoText.replace(",", ".")) || 0;
        const ustWert = parseFloat(ustText.replace(",", ".")) || 0;
        // Kein Netto-Betrag eingetragen → Zeile ohne Preis anzeigen
        artikel.push({
          zweck,
          netto: nettoText === "" ? null : nettoWert,
          ust: ustWert,
          brutto:
            nettoText === ""
              ? null
              : FormatHelper.roundToTwo(
                  nettoWert + (nettoWert * ustWert) / 100,
                ),
          // Kennzeichen nur, wenn ein Netto-Betrag eingetragen ist
          mitBetrag: nettoText !== "",
        });
      }

      // Artikelzeilen 2/3 ein-/ausblenden (nur Klassisch/eBon haben sie)
      for (let n = 2; n <= 3; n++) {
        const zeile = document.getElementById("kassenbonArtikel" + n + "Zeile");
        if (zeile) zeile.style.display = artikel.length >= n ? "" : "none";
      }

      // Artikelzeilen füllen (Bezeichnung ab 22 Zeichen mit "…" kürzen,
      // damit sie nicht in den Netto-Preis läuft; UST-Kennzeichen A/B/C)
      artikel.forEach((artikelObj, idx) => {
        const n = idx + 1;
        const zweckId = "kassenbonZweck" + (n === 1 ? "" : n);
        const bruttoClass = "kassenbonBrutto" + (n === 1 ? "1" : String(n));
        const zweckElem = document.getElementById(zweckId);
        if (zweckElem) {
          const zweck = artikelObj.zweck;
          zweckElem.textContent =
            zweck.length > 20 ? zweck.slice(0, 19).trimEnd() + "…" : zweck;
        }
        // Kennzeichen A (regulär) / B (vermindert) / C (steuerfrei) –
        // nur wenn ein Betrag eingetragen ist
        const code =
          artikelObj.mitBetrag &&
          typeof window.UST_KENNZEICHEN === "function"
            ? window.UST_KENNZEICHEN(artikelObj.ust)
            : "";
        document.querySelectorAll(".kassenbonUstCode" + n).forEach((el) => {
          el.textContent = code;
        });
        const nettoElem = document.getElementById("kassenbonBetrag" + n);
        if (nettoElem)
          nettoElem.textContent = artikelObj.mitBetrag
            ? FormatHelper.currency(artikelObj.netto)
            : "";
        document.querySelectorAll("." + bruttoClass).forEach((element) => {
          element.textContent = artikelObj.mitBetrag
            ? FormatHelper.currency(artikelObj.brutto)
            : "";
        });
      });

      const selectedTag = document.getElementById("tagKassenbon").value;
      const selectedMonat = document.getElementById("monatKassenbon").value;
      document.getElementById("kassenbonTag").textContent = selectedTag;
      document.getElementById("kassenbonMonat").textContent = selectedMonat;
      document.getElementById("kassenbonUhrzeit").textContent =
        RandomHelper.time() + " Uhr";
      document.getElementById("kassenbonTransaktionsnummer").textContent =
        RandomHelper.sevenDigit();

      // Summen über alle Artikel (Zeilen ohne Betrag zählen nicht mit)
      const mitBetragListe = artikel.filter((a) => a.mitBetrag);
      const summeNetto = mitBetragListe.reduce((s, a) => s + a.netto, 0);
      const summeUSTBetrag = mitBetragListe.reduce(
        (s, a) => s + FormatHelper.roundToTwo((a.netto * a.ust) / 100),
        0,
      );
      const summeBrutto = mitBetragListe.reduce((s, a) => s + a.brutto, 0);

      document.getElementById("kassenbonNetto").textContent =
        FormatHelper.currency(summeNetto);

      // UST-Satz anzeigen, wenn alle Artikel denselben Satz haben
      // (Kennzeichen A/B/C stehen an den Bezeichnungen)
      const saetze = [...new Set(artikel.map((a) => String(a.ust)))];
      document.getElementById("kassenbonUST").textContent =
        saetze.length === 1 ? saetze[0] : "";

      // Legende unten mit den aktuellen Sätzen aus utils.js füllen
      const ustA = document.getElementById("kassenbonUstA");
      if (ustA && window.UST_REGEL !== undefined)
        ustA.textContent = String(window.UST_REGEL);
      const ustB = document.getElementById("kassenbonUstB");
      if (ustB && window.UST_ERMAESSIGT !== undefined)
        ustB.textContent = String(window.UST_ERMAESSIGT);

      document.getElementById("kassenbonUSTBetrag").textContent =
        FormatHelper.currency(FormatHelper.roundToTwo(summeUSTBetrag));

      Array.from(document.getElementsByClassName("kassenbonBrutto")).forEach(
        (element) => {
          element.textContent = FormatHelper.currency(summeBrutto);
        },
      );

      let kassenbonZahlungsart = document.getElementById(
        "kassenbonDropdownZahlungsart",
      ).value;
      document.getElementById("kassenbonZahlungsart").textContent =
        kassenbonZahlungsart;

      loadKassenbonData();
      loadCompanyDataforKassenbon();
    },
  },

  anlagenkarte: {
    svgDropdown: "svgDropdownAnlagenkarte",
    container: "anlagenkarteContainer",
    jahrCheckbox: "scriptJahrAnlagenkarte",
    jahrInput: "jahrAnlagenkarte",
    jahrClass: "aktuellesJahrAnlagenkarte",
    customDefs: "customDefsAnlagenkarte",
    scriptId: "customJsAnlagenkarte",
    scriptFunction: "SVGonLoadAnlagenkarte",
    dataFunction: () => {
      const bezeichnung = document.getElementById(
        "anlagenkarteBezeichnungInput",
      ).value;
      document.getElementById("anlagenkarteBezeichnung").textContent =
        bezeichnung;

      const anlagekonto = document.getElementById(
        "anlagenkarteAnlagenkontoInput",
      ).value;
      document.getElementById("anlagenkarteAnlagenkonto").textContent =
        anlagekonto;

      const anschaffungskosten =
        parseFloat(
          document.getElementById("anlagenkarteAnschaffungskostenInput").value,
        ) || 0;
      document.getElementById("anlagenkarteAnschaffungskosten").textContent =
        FormatHelper.currency(anschaffungskosten);

      const nutzungsdauer =
        parseFloat(
          document.getElementById("anlagenkarteNutzungsdauerInput").value,
        ) || 0;
      document.getElementById("anlagenkarteNutzungsdauer").textContent =
        nutzungsdauer;

      const tag = document.getElementById("tagAnlagenkarte").value;
      const monat = document.getElementById("monatAnlagenkarte").value;
      document.getElementById("anlagenkarteTag").textContent = tag;
      document.getElementById("anlagenkarteMonat").textContent = monat;

      // Zeitanteilige Abschreibung im 1. Jahr (per Checkbox aktivierbar)
      const zeitanteiligCheckbox = document.getElementById(
        "anlagenkarteZeitanteiligInput",
      );
      const jahr1Elem = document.getElementById("anlagenkarteJahr1");
      const abschreibung1Elem = document.getElementById(
        "anlagenkarteAbschreibung1",
      );
      const restbuchwert1Elem = document.getElementById(
        "anlagenkarteRestbuchwert1",
      );

      if (
        zeitanteiligCheckbox &&
        zeitanteiligCheckbox.checked &&
        nutzungsdauer > 0
      ) {
        const monatNum = parseInt(monat, 10) || 1;
        const monateJahr1 = 13 - monatNum; // Monate von Anschaffung bis Jahresende
        const jahresAbschreibung = anschaffungskosten / nutzungsdauer;
        const abschreibungJahr1 = FormatHelper.roundToTwo(
          (jahresAbschreibung * monateJahr1) / 12,
        );
        const restbuchwertJahr1 = FormatHelper.roundToTwo(
          anschaffungskosten - abschreibungJahr1,
        );

        if (jahr1Elem) jahr1Elem.textContent = "1";
        if (abschreibung1Elem)
          abschreibung1Elem.textContent =
            FormatHelper.currency(abschreibungJahr1);
        if (restbuchwert1Elem)
          restbuchwert1Elem.textContent =
            FormatHelper.currency(restbuchwertJahr1);
      } else {
        if (jahr1Elem) jahr1Elem.textContent = "";
        if (abschreibung1Elem) abschreibung1Elem.textContent = "";
        if (restbuchwert1Elem) restbuchwert1Elem.textContent = "";
      }

      loadAnlagenkarteData();
    },
  },
  wertpapiere: {
    svgDropdown: "svgDropdownWertpapiere",
    container: "wertpapiereContainer",
    jahrCheckbox: "scriptJahrWertpapiere",
    jahrInput: "jahrWertpapiere",
    jahrClass: "aktuellesJahrWertpapiere",
    customDefs: "customDefsWertpapiere",
    scriptId: "customJsWertpapiere",
    scriptFunction: "SVGonLoadWertpapiere",
    dataFunction: () => {
      const bezeichnung = document.getElementById(
        "wertpapiereBezeichnungInput",
      ).value;
      document.getElementById("wertpapiereBezeichnung").textContent =
        bezeichnung;

      const isin = document.getElementById("wertpapiereISINInput").value;
      document.getElementById("wertpapiereISIN").textContent = isin;

      const stueckkurs = document.getElementById(
        "wertpapiereStueckkursInput",
      ).value;
      document.getElementById("wertpapiereStueckkurs").textContent =
        FormatHelper.currency(stueckkurs);

      const anzahl = document.getElementById("wertpapiereAnzahlInput").value;
      document.getElementById("wertpapiereAnzahl").textContent = anzahl;

      let kurswert = anzahl * stueckkurs;
      let spesen = kurswert * 0.01;
      let banklastschrift = kurswert + spesen;
      let bankgutschrift = kurswert - spesen;

      document.getElementById("wertpapiereKurswert").textContent =
        FormatHelper.currency(kurswert);
      document.getElementById("wertpapiereSpesen").textContent =
        FormatHelper.currency(spesen);
      document.getElementById("wertpapiereUhrzeit").textContent =
        RandomHelper.time() + " Uhr";

      const artInput = document.getElementById("wertpapiereArtInput");
      if (artInput.value === "wertpapiereKauf") {
        document.getElementById("wertpapiereArt").textContent = "gekauft";
        document.getElementById("wertpapiereBanklastschrift").textContent =
          FormatHelper.currency(banklastschrift);
        document.getElementById("wertpapiereSpesenart").textContent =
          "+ 1 % Spesen";
        document.getElementById("wertpapiereBankart").textContent =
          "Banklastschrift";
      } else {
        document.getElementById("wertpapiereArt").textContent = "verkauft";
        document.getElementById("wertpapiereBanklastschrift").textContent =
          FormatHelper.currency(bankgutschrift);
        document.getElementById("wertpapiereSpesenart").textContent =
          "- 1 % Spesen";
        document.getElementById("wertpapiereBankart").textContent =
          "Bankgutschrift";
      }

      const tag = document.getElementById("tagWertpapiereInput").value;
      const monat = document.getElementById("monatWertpapiereInput").value;
      document.getElementById("wertpapiereTag").textContent = tag;
      document.getElementById("wertpapiereMonat").textContent = monat;

      // Auftragsnummer
      let lastNum = parseInt(tag + monat);
      let timestamp = new Date().getTime();
      lastNum = Math.max(lastNum + 1, timestamp);
      let shortened = lastNum.toString().slice(6);
      document.getElementById("wertpapiereAuftragsnummer").textContent =
        parseInt(shortened, 10);

      loadWertpapiereData();
    },
  },
  bescheid: {
    svgDropdown: "svgDropdownBescheid",
    container: "bescheidContainer",
    jahrCheckbox: "scriptJahrBescheid",
    jahrInput: "jahrBescheid",
    jahrClass: "aktuellesJahrBescheid",
    customDefs: "customDefsBescheid",
    scriptId: "customJsBescheid",
    scriptFunction: "SVGonLoadBescheid",
    dataFunction: () => {
      // Kraftfahrzeugsteuer: Briefdatum automatisch = Zulassung + 7 Tage
      // (Tag/Monat/Jahr im Formular werden mitgesetzt, damit Jahr-Skript &
      // SVG-Datum konsistent bleiben). Ohne Jahr in der Zulassung bleibt
      // das Jahr leer → kein Jahr im Beleg.
      const artDropdown = document.getElementById("svgDropdownBescheid");
      if (artDropdown && artDropdown.value === "bescheid4.svg") {
        const briefInfo = bescheidKfzDatum(
          document.getElementById("bescheidZulassungInput").value,
        );
        if (briefInfo) {
          const brief = new Date(briefInfo.datum);
          brief.setDate(brief.getDate() + 7);
          const briefTag = String(brief.getDate()).padStart(2, "0");
          const briefMonat = String(brief.getMonth() + 1).padStart(2, "0");

          const tagSelect = document.getElementById("tagBescheid");
          if (tagSelect) tagSelect.value = briefTag;
          const monatSelect = document.getElementById("monatBescheid");
          if (monatSelect) monatSelect.value = briefMonat;

          const scriptJahrCheckbox =
            document.getElementById("scriptJahrBescheid");
          const jahrFeld = document.getElementById("jahrBescheid");
          if (jahrFeld && !(scriptJahrCheckbox && scriptJahrCheckbox.checked)) {
            if (!briefInfo.mitJahr) {
              // Zulassung ohne Jahr → Jahr leeren (kein Jahr im Beleg)
              jahrFeld.value = "";
            } else if (
              jahrFeld.dataset.kfzUser !== "1" &&
              (jahrFeld.dataset.kfzAuto === "1" || jahrFeld.value.trim() === "")
            ) {
              // Auto-Jahr nur solange der Nutzer das Feld nicht selbst
              // bearbeitet hat (Bearbeiten setzt kfzUser; dann bleibt die
              // Eingabe stehen – auch nach dem Leeren)
              jahrFeld.value = String(brief.getFullYear());
              jahrFeld.dataset.kfzAuto = "1";
            }
          }
        }
      }

      const tag = document.getElementById("tagBescheid").value;
      const monat = document.getElementById("monatBescheid").value;
      document.getElementById("bescheidTag").textContent = tag;
      document.getElementById("bescheidMonat").textContent = monat;

      // Grundsteuer
      const messbetrag = document.getElementById(
        "bescheidMessbetragInput",
      ).value;
      const hebesatz = document.getElementById("bescheidHebesatzInput").value;

      const messbetragElem = document.getElementById("bescheidMessbetrag");
      if (messbetragElem)
        messbetragElem.textContent = FormatHelper.currency(messbetrag);

      const hebesatzElem = document.getElementById("bescheidHebesatz");
      if (hebesatzElem) hebesatzElem.textContent = hebesatz + " %";

      const jahressteuerElem = document.getElementById("bescheidJahressteuer");
      if (jahressteuerElem) {
        const jahressteuer =
          parseFloat(messbetrag) * (parseFloat(hebesatz) / 100);
        jahressteuerElem.textContent = FormatHelper.currency(jahressteuer);

        const rate = FormatHelper.currency(jahressteuer / 4);
        const rateElements = document.getElementsByClassName("bescheidRate");
        for (const element of rateElements) {
          element.textContent = rate;
        }
      }

      // Abfallentsorgung
      const abfallgebuehr = document.getElementById(
        "bescheidAbfallgebuehrInput",
      ).value;
      const abfallgebuehrElem = document.getElementById(
        "bescheidAbfallgebuehr",
      );
      if (abfallgebuehrElem)
        abfallgebuehrElem.textContent = FormatHelper.currency(abfallgebuehr);

      const abfallbezeichnung = document.getElementById(
        "bescheidAbfallbezeichnungInput",
      ).value;
      const abfallbezeichnungElem = document.getElementById(
        "bescheidAbfallbezeichnung",
      );
      if (abfallbezeichnungElem)
        abfallbezeichnungElem.textContent = abfallbezeichnung;

      // Kraftfahrzeugsteuer
      const fahrzeugInput = document.getElementById("bescheidFahrzeugInput");
      if (fahrzeugInput) {
        const fahrzeugElem = document.getElementById("bescheidFahrzeug");
        if (fahrzeugElem) fahrzeugElem.textContent = fahrzeugInput.value || "–";
      }
      const betragInput = document.getElementById("bescheidBetragInput");
      if (betragInput) {
        const betragElem = document.getElementById("bescheidKfzBetrag");
        if (betragElem) {
          const betrag = betragInput.value.trim();
          if (betrag === "") {
            betragElem.textContent = "–";
          } else {
            // Deutsche Eingaben ("1.234,50") korrekt parsen:
            // Punkt = Tausender, Komma = Dezimalstelle
            let betragText = betrag.replace(/\s|€/g, "");
            if (betragText.includes(",")) {
              betragText = betragText.replace(/\./g, "").replace(",", ".");
            } else {
              betragText = betragText.replace(/\./g, "");
            }
            const betragWert = parseFloat(betragText);
            betragElem.textContent = !isNaN(betragWert)
              ? FormatHelper.currency(betragWert)
              : betrag;
          }
        }
      }
      const zulassungInput = document.getElementById("bescheidZulassungInput");
      if (zulassungInput) {
        const zulassungElem = document.getElementById("bescheidZulassung");
        if (zulassungElem) {
          // Mit "20.." im Jahr-Feld wird auch die Zulassung mit "20.." gedruckt
          let zuText = zulassungInput.value || "–";
          const jahrFeldZul = document.getElementById("jahrBescheid");
          if (jahrFeldZul && jahrFeldZul.value.trim() === "20..") {
            zuText = zuText.replace(/\d{4}$/, "20..");
          }
          zulassungElem.textContent = zuText;
        }

        // Frist: ohne Jahr ausgeben, wenn im Beleg kein Jahr gedruckt wird
        // (Jahr-Feld vom Nutzer geleert; „Skript verwenden" druckt immer ein Jahr).
        // "20.." im Jahr-Feld = Platzhalter: gerechnet wird mit dem
        // Zulassungsdatum, gedruckt wird überall das Jahr "20.."
        const scriptJahrFrist = document.getElementById("scriptJahrBescheid");
        const jahrFeldFrist = document.getElementById("jahrBescheid");
        const scriptAktivFrist = !!(scriptJahrFrist && scriptJahrFrist.checked);
        const jahrTextFrist = jahrFeldFrist ? jahrFeldFrist.value.trim() : "";
        const fristOhneJahr = !scriptAktivFrist && jahrTextFrist === "";
        const jahrAnzeige =
          !scriptAktivFrist && jahrTextFrist === "20.." ? "20.." : null;
        const fristen = bescheidKfzFristen(
          zulassungInput.value,
          fristOhneJahr,
          jahrAnzeige,
        );
        const fristText = fristen.length ? fristen.join(" und ") : "–";
        // bescheidFrist + Termine-Leiste = die ersten beiden jährlichen
        // Fälligkeitstermine (Erst-Frist, danach + 1 Jahr)
        const fristElem = document.getElementById("bescheidFrist");
        if (fristElem) {
          fristElem.textContent = fristen[0] || "–";
        }
        const fristJahr1 = document.getElementById("bescheidFristJahr1");
        const fristJahr2 = document.getElementById("bescheidFristJahr2");
        if (fristJahr1 || fristJahr2) {
          // Leiste: Datumspart + Jahres-Tspan (Skript-Modus füllt die Jahre
          // beim Rendern dynamisch – wichtig für den inline SVG-Export)
          const jahrJetzt = new Date().getFullYear();
          const spalten = [
            {
              element: fristJahr1,
              datumId: "bescheidFristJahr1Datum",
              term: fristen[0],
              jahr: jahrJetzt,
              offset: 0,
            },
            {
              element: fristJahr2,
              datumId: "bescheidFristJahr2Datum",
              term: fristen[1],
              jahr: jahrJetzt + 1,
              offset: 1,
            },
          ];
          for (const spalte of spalten) {
            if (!spalte.element) continue;
            const ma = String(spalte.term || "").match(
              /^(\d{1,2}\.\d{1,2})\.?(.*)$/,
            );
            const datumSpan = document.getElementById(spalte.datumId);
            let jahrSpan = null;
            for (const kind of spalte.element.childNodes) {
              if (
                kind.nodeType === 1 &&
                kind.classList &&
                kind.classList.contains("bescheidFristJahr")
              ) {
                jahrSpan = kind;
                break;
              }
            }
            if (datumSpan) datumSpan.textContent = ma ? ma[1] + "." : "–";
            if (jahrSpan) {
              jahrSpan.textContent = scriptAktivFrist
                ? String(spalte.jahr)
                : ma && ma[2]
                  ? ma[2]
                  : "";
            }
          }
        }

        // Live-Anzeige im Formular mit aktualisieren
        const anzeigeElem = document.getElementById("bescheidFristAnzeige");
        if (anzeigeElem)
          anzeigeElem.textContent = fristen.length
            ? `${fristen[0]}${fristen[1] ? `, danach ${fristen[1]}` : ""}`
            : "–";
      }

      loadBescheidData();
    },
  },
  insolvenz: {
    svgDropdown: "svgDropdownInsolvenz",
    container: "insolvenzContainer",
    dataFunction: () => {
      insolvenzDatenAnwenden();
    },
  },
  mahnung: {
    svgDropdown: "svgDropdownMahnung",
    container: "mahnungContainer",
    jahrCheckbox: "scriptJahrMahnung",
    jahrInput: "jahrMahnung",
    jahrClass: "aktuellesJahrMahnung",
    customDefs: "customDefsMahnung",
    scriptId: "customJsMahnung",
    scriptFunction: "SVGonLoadMahnung",
    dataFunction: () => {
      // Stufenkonfiguration: Titel + Hinweiszeile im Brief
      const STUFEN = {
        1: {
          titel: "Zahlungserinnerung",
          hinweis: "Für diese Zahlungserinnerung fallen keine Mahngebühren an.",
        },
        2: {
          titel: "Mahnung",
          hinweis: "Die Kosten des Verfahrens gehen zu Ihren Lasten.",
        },
        3: {
          titel: "Letzte Mahnung",
          hinweis:
            "Bei fruchtlosem Fristablauf leiten wir das gerichtliche Mahnverfahren ein.",
        },
      };
      const stufeNr =
        parseInt(document.getElementById("mahnungStufeInput")?.value, 10) || 1;
      const stufe = STUFEN[stufeNr] || STUFEN[1];
      const titelElem = document.getElementById("mahnungTitel");
      if (titelElem) titelElem.textContent = stufe.titel;
      const hinweisElem = document.getElementById("mahnungHinweis");
      if (hinweisElem) hinweisElem.textContent = stufe.hinweis;

      // Stufe 1 (Zahlungserinnerung): keine Zinsen und keine Mahngebühren –
      // die Eingabefelder werden ausgegraut, der Brief zeigt nur den Betrag.
      const ohneZusatz = stufeNr === 1;
      const zinsFeld = document.getElementById("mahnungZinssatzInput");
      const standardBtn = document.getElementById("mahnungZinssatzStandard");
      const pauschaleFeld = document.getElementById("mahnungPauschaleInput");
      if (zinsFeld) zinsFeld.disabled = ohneZusatz;
      if (standardBtn) standardBtn.disabled = ohneZusatz;
      if (pauschaleFeld) pauschaleFeld.disabled = ohneZusatz;

      // Formulierung im Anschreiben stufenabhängig
      const einleitungElem = document.getElementById("mahnungEinleitungEnde");
      if (einleitungElem) {
        einleitungElem.textContent = ohneZusatz
          ? " Sicherlich handelt es sich um ein Versehen."
          : " Daher belasten wir Sie mit:";
      }
      const zahlText1 = document.getElementById("mahnungZahltext1");
      if (zahlText1) {
        zahlText1.textContent = ohneZusatz
          ? "Wir bitten Sie, den offenen Betrag spätestens bis zum "
          : "Wir bitten Sie, die Gesamtforderung spätestens bis zum ";
      }
      const zahlText2 = document.getElementById("mahnungZahltext2");
      if (zahlText2) zahlText2.textContent = " auf";

      // Briefdatum: Tag/Monat aus den Auswahllisten, Jahr aus dem Eingabefeld
      // (Schutz: falls das Jahr leer ist, zählt das aktuelle Jahr)
      const tag = document.getElementById("tagMahnung").value;
      const monat = document.getElementById("monatMahnung").value;
      const tagElem = document.getElementById("mahnungTag");
      if (tagElem) tagElem.textContent = tag;
      const monatElem = document.getElementById("mahnungMonat");
      if (monatElem) monatElem.textContent = monat;
      const jahrBrief =
        parseInt(document.getElementById("jahrMahnung")?.value, 10) ||
        new Date().getFullYear();

      // Datum-Hilfsfunktionen (Anzeigeformat TT.MM.JJJJ)
      const p2 = (n) => String(n).padStart(2, "0");
      // ISO-Datum ('yyyy-mm-dd') als LOKALES Datum parsen, damit die
      // Differenzberechnung (Verzugstage) keine UTC-Verschiebung erhält
      const isoZuDatum = (iso) => {
        const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ""));
        if (!m) return null;
        const d = new Date(+m[1], +m[2] - 1, +m[3]);
        return isNaN(d) ? null : d;
      };
      const de = (d) =>
        d
          ? `${p2(d.getDate())}.${p2(d.getMonth() + 1)}.${d.getFullYear()}`
          : "";

      // Rechnungsnummer: Zufalls-Vorbelegung – eine vorhandene
      // Nutzereingabe wird NICHT überschrieben.
      const nrInput = document.getElementById("mahnungRechnungsNrInput");
      if (nrInput && nrInput.value.trim() === "") {
        nrInput.value = `${Math.floor(Math.random() * 9000) + 1000}/${String(jahrBrief).slice(-2)}`;
      }
      const nummerElem = document.getElementById("mahnungRechnungsNummer");
      if (nummerElem) nummerElem.textContent = nrInput?.value || "";

      // Rechnungsdatum
      const rechnungsdatum = isoZuDatum(
        document.getElementById("mahnungRechnungsdatumInput")?.value,
      );
      const rdElem = document.getElementById("mahnungRechnungsdatum");
      if (rdElem) rdElem.textContent = de(rechnungsdatum) || "—";

      // Verzugstage: Briefdatum − Fälligkeitsdatum
      // (ohne Fälligkeit: Fallback Rechnungsdatum + 30 Tage Zahlungsziel)
      const briefDatum = new Date(
        jahrBrief,
        parseInt(monat, 10) - 1,
        parseInt(tag, 10),
      );
      let faellig = isoZuDatum(
        document.getElementById("mahnungFaelligkeitInput")?.value,
      );
      if (!faellig && rechnungsdatum) {
        faellig = new Date(rechnungsdatum);
        faellig.setDate(faellig.getDate() + 30);
      }
      const tage = faellig
        ? Math.max(0, Math.floor((briefDatum - faellig) / 86400000))
        : 0;
      const tageElem = document.getElementById("mahnungTage");
      if (tageElem) tageElem.textContent = tage;

      // Zinssatz (Standard: Basiszinssatz + 9 Prozentpunkte) und Zinsen
      // nach der kaufmännischen Methode (360-Tage-Jahr)
      const zinsEingabe = parseFloat(
        document.getElementById("mahnungZinssatzInput")?.value,
      );
      const satz = isNaN(zinsEingabe)
        ? typeof verzugszinsSatz === "function"
          ? verzugszinsSatz("unternehmen")
          : 10.52
        : zinsEingabe;
      const satzElem = document.getElementById("mahnungZinssatzText");
      if (satzElem) {
        satzElem.textContent = satz.toLocaleString("de-DE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      }

      const betrag =
        parseFloat(document.getElementById("mahnungBetragInput")?.value) || 0;
      const zinsen = ohneZusatz
        ? 0
        : typeof verzugszinsen === "function"
          ? verzugszinsen(betrag, satz, tage)
          : Math.round(((betrag * satz * tage) / (360 * 100)) * 100) / 100;
      const pauschaleEingabe = parseFloat(
        document.getElementById("mahnungPauschaleInput")?.value,
      );
      const pauschale = ohneZusatz
        ? 0
        : isNaN(pauschaleEingabe)
          ? typeof MAHNPAUSCHALE !== "undefined"
            ? MAHNPAUSCHALE
            : 40
          : pauschaleEingabe;

      const betragElem = document.getElementById("mahnungBetrag");
      if (betragElem) betragElem.textContent = FormatHelper.currency(betrag);
      const zinsenElem = document.getElementById("mahnungZinsen");
      if (zinsenElem) zinsenElem.textContent = FormatHelper.currency(zinsen);
      const pauschaleElem = document.getElementById("mahnungPauschale");
      if (pauschaleElem)
        pauschaleElem.textContent = FormatHelper.currency(pauschale);
      const summeElem = document.getElementById("mahnungSumme");
      if (summeElem)
        summeElem.textContent = FormatHelper.currency(
          FormatHelper.roundToTwo(betrag + zinsen + pauschale),
        );

      // Berechnungszeilen ohne Betrag ausblenden und die Summenzeile
      // nachrücken lassen (Basis-Y: Zins 470, Pauschale 495, Summe 525)
      const zeige = (id, sichtbar) => {
        const el = document.getElementById(id);
        if (el) el.style.display = sichtbar ? "" : "none";
      };
      const sichtbarZins = zinsen !== 0;
      const sichtbarPauschale = pauschale !== 0;
      zeige("mahnungZeileZinsen", sichtbarZins);
      zeige("mahnungZeilePauschale", sichtbarPauschale);
      let yZeile = 470;
      const ruecke = (id, basisY) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (yZeile === basisY) el.removeAttribute("transform");
        else el.setAttribute("transform", `translate(0, ${yZeile - basisY})`);
        yZeile += 25;
      };
      if (sichtbarZins) ruecke("mahnungZeileZinsen", 470);
      if (sichtbarPauschale) ruecke("mahnungZeilePauschale", 495);
      const summeY = sichtbarZins || sichtbarPauschale ? yZeile + 5 : 475;
      ["mahnungSummeOp", "mahnungSummeLabel", "mahnungSumme"].forEach((id) => {
        document.getElementById(id)?.setAttribute("y", summeY);
      });
      const summenlinie = document.getElementById("mahnungSummeLinie");
      if (summenlinie) summenlinie.setAttribute("y", summeY + 10);
      // nur Vorlage 2 (Rahmenbox) vorhanden
      const berechnungsbox = document.getElementById("mahnungBerechnungsbox");
      if (berechnungsbox)
        berechnungsbox.setAttribute("height", summeY + 12 - 415);

      // Zahlungsfrist: Briefdatum + Frist (Tage)
      const frist =
        parseInt(document.getElementById("mahnungFristInput")?.value, 10) || 0;
      const fristDatum = new Date(briefDatum);
      fristDatum.setDate(fristDatum.getDate() + frist);
      const fristElem = document.getElementById("mahnungFrist");
      if (fristElem) fristElem.textContent = de(fristDatum);

      // Absender- und Empfängerdaten einsetzen
      loadMahnungData();
      loadMahnungEmpfaengerData();
    },
  },
  // HINZUFÜGEN nach bescheid (in BELEG_APPLY_CONFIG):
  lohnjournal: {
    svgDropdown: "svgDropdownLohnjournal",
    container: "lohnjournalContainer",
    jahrCheckbox: null, // Kein Jahr-Script
    jahrInput: null,
    jahrClass: null,
    customDefs: null,
    scriptId: null,
    scriptFunction: null,
    dataFunction: () => {
      // Mitarbeiter-Array
      const mitarbeiter = [
        { name: "Smith, John", freibetrag: "0", steuerklasse: "I" },
        { name: "Garcia, Maria", freibetrag: "0", steuerklasse: "IV" },
        { name: "Müller, Hans", freibetrag: "0", steuerklasse: "I" },
        { name: "Nguyen, Linh", freibetrag: "0", steuerklasse: "III" },
        { name: "Andersen, Erik", freibetrag: "0", steuerklasse: "I" },
        { name: "Choi, Hye-jin", freibetrag: "0", steuerklasse: "IV" },
        { name: "Gomez, Juan", freibetrag: "0", steuerklasse: "I" },
        { name: "Abdullah, Fatima", freibetrag: "0", steuerklasse: "III" },
        { name: "Bauer, Stephan", freibetrag: "0", steuerklasse: "III" },
        { name: "Kovács, István", freibetrag: "0", steuerklasse: "I" },
        { name: "Santos, Sofia", freibetrag: "0", steuerklasse: "IV" },
        { name: "Ali, Ahmed", freibetrag: "0,5", steuerklasse: "I" },
        { name: "Hernandez, Carla", freibetrag: "0,5", steuerklasse: "III" },
        { name: "Novák, Katarina", freibetrag: "0,5", steuerklasse: "IV" },
        { name: "Fischer, Tobias", freibetrag: "0,5", steuerklasse: "I" },
        { name: "Silva, Pedro", freibetrag: "0,5", steuerklasse: "III" },
        { name: "Park, Min-woo", freibetrag: "2,0", steuerklasse: "IV" },
        { name: "Zhang, Wei", freibetrag: "2,0", steuerklasse: "I" },
        { name: "Molina, Ana", freibetrag: "2,0", steuerklasse: "III" },
        { name: "Schneider, Maria", freibetrag: "2,0", steuerklasse: "IV" },
        { name: "Mikhailova, Elena", freibetrag: "2,0", steuerklasse: "I" },
      ];

      // Hilfsfunktionen
      const chooseRandom = (liste, anzahl) => {
        const result = [];
        const copy = [...liste];
        for (let i = 0; i < anzahl; i++) {
          const index = Math.floor(Math.random() * copy.length);
          result.push(copy.splice(index, 1)[0]);
        }
        return result;
      };

      const genBruttogehalt = () =>
        (Math.round(Math.random() * 4000 + 2000) / 100) * 100;

      const berechneSteuern = (brutto, steuerklasse) => {
        const satz = { I: 0.19, III: 0.11, IV: 0.14 }[steuerklasse] || 0;
        return brutto * satz;
      };

      const berechneSozialversicherung = (brutto) => {
        // Bemessungsbasis je Zweig begrenzt (KV/PV bzw. RV/ALV) – die
        // monatlichen Grenzen gelten aktuell laut BEITRAGSBEMESSUNGSGRENZEN
        // in js/utils.js. Pauschale Gesamtabgabe 38,9 %
        // (AN+AG), aufgeteilt KV+PV (18,2 von 39,4 Punkte) bzw. RV+ALV (21,2 von 39,4),
        // sodass unterhalb der Grenzen unverändert 38,9 % x Brutto herauskommen.
        const anteilKvPv = 18.2 / 39.4;
        const anteilRvAlv = 21.2 / 39.4;
        const basisKvPv = bbgBasisKVPV(brutto);
        const basisRvAlv = bbgBasisRVALV(brutto);
        return (
          basisKvPv * 0.389 * anteilKvPv + basisRvAlv * 0.389 * anteilRvAlv
        );
      };

      // 3 zufällige Mitarbeiter
      const ausgewählt = chooseRandom(mitarbeiter, 3);

      for (let i = 0; i < 3; i++) {
        const elem = document.getElementById(`lohnjournalArbeitnehmer${i + 1}`);
        if (elem) {
          elem.textContent = `${ausgewählt[i].name} (${ausgewählt[i].steuerklasse}/${ausgewählt[i].freibetrag})`;
        }

        const brutto = genBruttogehalt();
        const steuern = berechneSteuern(brutto, ausgewählt[i].steuerklasse);
        const sv = berechneSozialversicherung(brutto);
        const anBeitrag = sv * 0.5;
        const agBeitrag = sv * 0.5;
        const netto = brutto - steuern - anBeitrag;

        const setBrutto = document.getElementById(`lohnjournalBrutto${i + 1}`);
        if (setBrutto)
          setBrutto.textContent = FormatHelper.currency(brutto.toFixed(2));

        const setSteuern = document.getElementById(
          `lohnjournalSteuern${i + 1}`,
        );
        if (setSteuern)
          setSteuern.textContent = FormatHelper.currency(steuern.toFixed(2));

        const setAN = document.getElementById(`lohnjournalAN${i + 1}`);
        if (setAN)
          setAN.textContent = FormatHelper.currency(anBeitrag.toFixed(2));

        const setAG = document.getElementById(`lohnjournalAG${i + 1}`);
        if (setAG)
          setAG.textContent = FormatHelper.currency(agBeitrag.toFixed(2));

        const setNetto = document.getElementById(`lohnjournalNetto${i + 1}`);
        if (setNetto)
          setNetto.textContent = FormatHelper.currency(netto.toFixed(2));
      }

      // Summen berechnen
      const anzahlMitarbeiter = Math.floor(Math.random() * 31) + 15; // 15-45
      let summeBrutto = 0;
      for (let i = 0; i < anzahlMitarbeiter; i++) {
        summeBrutto += genBruttogehalt();
      }

      const summeSteuern = berechneSteuern(summeBrutto, "IV");
      const summeSV = berechneSozialversicherung(summeBrutto);
      const summeANBeitrag = summeSV * 0.5;
      const summeAGBeitrag = summeSV * 0.5;
      const summeNetto = summeBrutto - summeSteuern - summeANBeitrag;

      const setBruttoSumme = document.getElementById("lohnjournalBrutto4");
      if (setBruttoSumme)
        setBruttoSumme.textContent = FormatHelper.currency(
          summeBrutto.toFixed(2),
        );

      const setSteuernSumme = document.getElementById("lohnjournalSteuern4");
      if (setSteuernSumme)
        setSteuernSumme.textContent = FormatHelper.currency(
          summeSteuern.toFixed(2),
        );

      const setANSumme = document.getElementById("lohnjournalAN4");
      if (setANSumme)
        setANSumme.textContent = FormatHelper.currency(
          summeANBeitrag.toFixed(2),
        );

      const setAGSumme = document.getElementById("lohnjournalAG4");
      if (setAGSumme)
        setAGSumme.textContent = FormatHelper.currency(
          summeAGBeitrag.toFixed(2),
        );

      const setNettoSumme = document.getElementById("lohnjournalNetto4");
      if (setNettoSumme)
        setNettoSumme.textContent = FormatHelper.currency(
          summeNetto.toFixed(2),
        );

      // Zufälliger Monat
      const monate = [
        "Januar",
        "Februar",
        "März",
        "April",
        "Mai",
        "Juni",
        "Juli",
        "August",
        "September",
        "Oktober",
        "November",
        "Dezember",
      ];
      const monatElem = document.getElementById("lohnjournalMonat");
      if (monatElem)
        monatElem.textContent =
          monate[Math.floor(Math.random() * monate.length)];

      // Buchungssatz-Tabelle
      let output = "<h3>Aufgabe</h3>";
      output +=
        "<p>Von der Personalabteilung liegt ein Belegauszug vor. Bilde die Buchungssätze für die Erfassung des gesamten Personalaufwands, wenn die Auszahlung per Banküberweisung erfolgt.</p>";
      output += "<h3>Lösung</h3>";
      output +=
        '<table style="border: 1px solid #ccc;white-space:nowrap;background-color:#fff;font-family:courier;min-width:550px;margin:0 0 6px;"><tbody>';
      output += "<tr>";
      output += `<td style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:145px;min-width:120px" tabindex="1">6200 LG</td>`;
      output += `<td style="text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px;min-width:120px" tabindex="1">${FormatHelper.currency(summeBrutto.toFixed(2))}</td>`;
      output +=
        '<td style="text-align:center;width:100px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:50px" tabindex="1">an</td>';
      output +=
        '<td style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:145px;min-width:120px;text-align:left" tabindex="1">2800 BK</td>';
      output += `<td style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:145px;min-width:120px;text-align:right" tabindex="1">${FormatHelper.currency(summeNetto.toFixed(2))}</td>`;
      output += "</tr><tr>";
      output +=
        '<td style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:145px;min-width:120px"></td>';
      output +=
        '<td style="text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px;min-width:120px"></td>';
      output +=
        '<td style="text-align:center;width:100px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:50px"></td>';
      output +=
        '<td style="text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px;min-width:120px" tabindex="1">4830 VFA</td>';
      output += `<td style="text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px;min-width:120px" tabindex="1">${FormatHelper.currency(summeSteuern.toFixed(2))}</td>`;
      output += "</tr><tr>";
      output +=
        '<td style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:145px;min-width:120px"></td>';
      output +=
        '<td style="text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px;min-width:120px"></td>';
      output +=
        '<td style="text-align:center;width:100px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:50px"></td>';
      output +=
        '<td style="text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px;min-width:120px" tabindex="1">4840 VSV</td>';
      output += `<td style="text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px;min-width:120px" tabindex="1">${FormatHelper.currency(summeANBeitrag.toFixed(2))}</td>`;
      output += "</tr></tbody></table>";
      output +=
        '<table style="border: 1px solid #ccc;white-space:nowrap;background-color:#fff;font-family:courier;min-width:550px;margin:0 0 6px;"><tbody><tr>';
      output +=
        '<td style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:145px;min-width:120px" tabindex="1">6400 AGASV</td>';
      output +=
        '<td style="text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px;min-width:120px"></td>';
      output +=
        '<td style="text-align:center;width:100px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:50px" tabindex="1">an</td>';
      output +=
        '<td style="text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px;min-width:120px" tabindex="1">4840 VSV</td>';
      output += `<td style="text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px;min-width:120px" tabindex="1">${FormatHelper.currency(summeAGBeitrag.toFixed(2))}</td>`;
      output += "</tr></tbody></table>";

      document.getElementById("lohnjournalBuchungssatzContainer").innerHTML =
        output;

      loadLohnjournalData();
    },
  },
};

// Generische Beleg-Apply-Funktion
async function applyBelegWithSVG(belegType, validationUeberspringen = false) {
  if (!validationUeberspringen && !validateInputs()) return;

  const config = BELEG_APPLY_CONFIG[belegType];
  if (!config) {
    console.error("Unbekannter Belegtyp:", belegType);
    return;
  }

  // 1. SVG-Template laden
  const selectedTemplate = document.getElementById(config.svgDropdown)?.value;
  const container = document.getElementById(config.container);

  if (selectedTemplate && container) {
    try {
      const svgData = await loadSVGTemplate(selectedTemplate);
      container.innerHTML = "";
      container.appendChild(safelyParseSVG(svgData));
    } catch (error) {
      console.error("Fehler beim Laden der SVG-Vorlage:", error);
      return;
    }
  }

  // 2. Beleg-spezifische Daten setzen
  if (config.dataFunction) {
    config.dataFunction();
  }

  // 3. Jahr-Script handhaben
  handleYearScript(config);
}

// Jahr-Script Handling (wiederverwendbar)
function handleYearScript(config) {
  if (!config.jahrCheckbox) return;

  const useScript = document.getElementById(config.jahrCheckbox)?.checked;
  const customDefs = config.customDefs
    ? document.getElementById(config.customDefs)
    : null;
  const rootSvg = customDefs ? customDefs.ownerSVGElement : null;
  const yearElements = document.querySelectorAll(`.${config.jahrClass}`);

  // Altes Script immer zuerst entfernen
  document.getElementById(config.scriptId)?.remove();

  if (!useScript) {
    const jahrInput = document.getElementById(config.jahrInput);
    yearElements.forEach((el) => {
      el.textContent = jahrInput?.value || "";
    });

    // Skript-Teile entfernen
    if (rootSvg) rootSvg.removeAttribute("onload");
  } else {
    const currentYear = new Date().getFullYear();
    yearElements.forEach((el) => {
      el.textContent = currentYear;
    });

    window[config.scriptFunction] = function () {
      document.querySelectorAll(`.${config.jahrClass}`).forEach((el) => {
        el.textContent = new Date().getFullYear();
      });
    };

    if (customDefs) {
      const script = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "script",
      );
      script.id = config.scriptId;
      script.textContent =
        "function " +
        config.scriptFunction +
        "() {" +
        'var elements = document.querySelectorAll(".' +
        config.jahrClass +
        '");' +
        "elements.forEach(function(el) { el.textContent = new Date().getFullYear(); });" +
        // Jahres-Tspans (z. B. Fälligkeitstermine im Bescheid): Jahr aus dem
        // View-Jahr + Offset (data-jahroffset), damit inline SVG immer das
        // richtige Jahr zeigt
        'var fj = document.querySelectorAll(".bescheidFristJahr");' +
        'fj.forEach(function(el) { el.textContent = new Date().getFullYear() + parseInt(el.getAttribute("data-jahroffset") || "0", 10); });' +
        "}";
      customDefs.appendChild(script);
    }

    if (rootSvg) rootSvg.setAttribute("onload", config.scriptFunction + "()");
  }
}

/// ============================================================================
// LOHNABRECHNUNG
// ============================================================================
const MITARBEITER_DATEN = {
  vornamen: {
    m: [
      "Max",
      "Alexander",
      "Thomas",
      "Michael",
      "Andreas",
      "Stefan",
      "Christian",
      "Daniel",
      "Sebastian",
      "Markus",
      "Ahmet",
      "Mehmet",
      "Ali",
      "Emre",
      "Yusuf",
      "Hassan",
      "Omar",
      "Ivan",
      "Dimitri",
      "Carlos",
    ],
    w: [
      "Anna",
      "Maria",
      "Laura",
      "Sarah",
      "Julia",
      "Lisa",
      "Sophie",
      "Hannah",
      "Lena",
      "Emma",
      "Aylin",
      "Fatima",
      "Zeynep",
      "Mariam",
      "Leila",
      "Elena",
      "Natalia",
      "Sofia",
      "Irina",
      "Ana",
    ],
  },

  nachnamen: [
    // deutsch
    "Müller",
    "Schmidt",
    "Schneider",
    "Fischer",
    "Weber",
    "Meyer",
    "Wagner",
    "Becker",
    "Schulz",
    "Hoffmann",
    "Koch",
    "Bauer",
    "Richter",
    "Klein",
    "Wolf",
    "Schröder",
    "Neumann",
    "Schwarz",
    "Zimmermann",
    "Braun",
    "Yılmaz",
    "Demir",
    "Kaya",
    "Haddad",
    "Khan",
    "Hussein",
    "Petrov",
    "Ivanov",
    "Smirnov",
    "Garcia",
    "Martinez",
    "Lopez",
    "Nowak",
    "Kowalski",
  ],

  strassen: [
    "Hauptstraße",
    "Bahnhofstraße",
    "Kirchstraße",
    "Gartenstraße",
    "Schulstraße",
    "Bergstraße",
    "Dorfstraße",
    "Lindenstraße",
    "Ringstraße",
    "Waldstraße",
  ],

  banken: [
    "Sparkasse",
    "Volksbank",
    "Commerzbank",
    "Deutsche Bank",
    "Postbank",
    "HypoVereinsbank",
  ],
};

// Zufällige Mitarbeiterdaten generieren
// Ausbildungsberufe für das Ausbildungsvergütungs-Template (lohnabrechnungAusbildungsberuf)
const AUSBILDUNGSBERUFE = [
  "Kaufmann/-frau für Büromanagement",
  "Industriekaufmann/-frau",
  "Kaufmann/-frau im Einzelhandel",
  "Verkäufer/-in",
  "Fachkraft für Lagerlogistik",
  "Steuerfachangestellte/r",
  "Kaufmann/-frau im Groß- und Außenhandel",
  "Bankkaufmann/-frau",
  "Kaufmann/-frau für Versicherungen und Finanzberatung",
  "Fachinformatiker/-in",
  "Hotelfachmann/-frau",
  "Koch/Köchin",
];

function generateMitarbeiterDaten(
  ausbildung = false,
  ausbildungsjahrSoll = null,
) {
  const geschlecht = Math.random() > 0.5 ? "m" : "w";
  const vorname =
    MITARBEITER_DATEN.vornamen[geschlecht][
      Math.floor(Math.random() * MITARBEITER_DATEN.vornamen[geschlecht].length)
    ];
  const nachname =
    MITARBEITER_DATEN.nachnamen[
      Math.floor(Math.random() * MITARBEITER_DATEN.nachnamen.length)
    ];
  const strasse =
    MITARBEITER_DATEN.strassen[
      Math.floor(Math.random() * MITARBEITER_DATEN.strassen.length)
    ];
  const hausnummer = Math.floor(Math.random() * 150) + 1;
  const bank =
    MITARBEITER_DATEN.banken[
      Math.floor(Math.random() * MITARBEITER_DATEN.banken.length)
    ];

  // Personalnummer
  const personalnr =
    String(Math.floor(Math.random() * 90000) + 10000) +
    "-" +
    String(Math.floor(Math.random() * 90) + 10);

  // Alter & Betriebszugehörigkeit
  // Ausbildung: Alter 17–22, plausibel zum Ausbildungsjahr; Eintritt vor Beginn des AJ
  // Regulär: Alter 25–60, Eintritt 1–15 Jahre zurück
  // Ausbildungsjahr: wenn die Lehrkraft eines vorgibt (1–4), dieses verwenden,
  // sonst würfeln (in der Regel 1.–3. Jahr)
  let alter,
    dienstjahre,
    ausbildungsberuf = null,
    ausbildungsjahr = null;
  if (ausbildung) {
    const soll = parseInt(ausbildungsjahrSoll, 10);
    ausbildungsjahr =
      !isNaN(soll) && soll >= 1 && soll <= 4
        ? soll
        : Math.floor(Math.random() * 3) + 1;
    ausbildungsberuf = pick(AUSBILDUNGSBERUFE);
    alter = 16 + ausbildungsjahr + Math.floor(Math.random() * 3); // z. B. ->17–19 im 1. AJ
    dienstjahre = ausbildungsjahr - 1; // Eintritt im AJ bzw. bereits beschäftigt
  } else {
    alter = Math.floor(Math.random() * 36) + 25;
    dienstjahre = Math.floor(Math.random() * 15) + 1;
  }
  const jahr = new Date().getFullYear() - alter;
  const monat = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
  const tag = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
  const geburtsdatum = `${tag}.${monat}.${jahr.toString().slice(2)}`;

  // Eintrittsdatum (Ausbildung: zu Beginn des aktuellen Ausbildungsjahres)
  const eintrittJahr = new Date().getFullYear() - dienstjahre;
  const eintrittMonat = String(Math.floor(Math.random() * 12) + 1).padStart(
    2,
    "0",
  );
  const eintrittTag = "01";
  const eintrittsdatum = `${eintrittTag}.${eintrittMonat}.${eintrittJahr.toString().slice(2)}`;

  // Steuer-ID (11-stellig)
  const steuerID = String(
    Math.floor(Math.random() * 90000000000) + 10000000000,
  );

  // IBAN (DE + 20 Ziffern)
  const iban =
    "DE" +
    String(Math.floor(Math.random() * 90) + 10) +
    " " +
    String(Math.floor(Math.random() * 9000) + 1000) +
    " " +
    String(Math.floor(Math.random() * 9000) + 1000) +
    " " +
    String(Math.floor(Math.random() * 9000) + 1000) +
    " " +
    String(Math.floor(Math.random() * 9000) + 1000) +
    " " +
    String(Math.floor(Math.random() * 90) + 10);

  return {
    name: `${nachname}, ${vorname}`,
    strasse: `${strasse} ${hausnummer}`,
    personalnr: personalnr,
    geburtsdatum: geburtsdatum,
    eintrittsdatum: eintrittsdatum,
    steuerID: steuerID,
    bank: bank,
    iban: iban,
    ausbildungsberuf: ausbildungsberuf,
    ausbildungsjahr: ausbildungsjahr,
  };
}

// Lohnsteuer-Berechnung (vereinfachte Tarifformel)
// Alle Ankerwerte (Grundfreibetrag, Zonengrenzen, Steuersätze, Kinderfreibeträge)
// gelten jeweils aktuell laut js/utils.js – nichts hier fest verdrahten!
function berechneLohnsteuer(brutto, steuerklasse, kinderfreibetrag = "0") {
  const T = EINKOMMENSTEUERTARIF;

  // Steuerliche Kinderfreibeträge (inkl. BEA) mindern das zu versteuernde
  // Einkommen. Die Zähler im Select geben Freibetragsanteile an
  // (0,5 = ein Kind anteilig, 1,0 = ein Kind). In Steuerklasse VI
  // (Zweitjob) bleiben Kinderfreibeträge außen vor.
  const freibetragAnteile =
    parseFloat(String(kinderfreibetrag).replace(",", ".")) || 0;
  const kinderFreibetragJaehrlich =
    steuerklasse === "VI"
      ? 0
      : freibetragAnteile * KINDERFREIBETRAG.einschlBeaEUR; // Anteil × Freibetrag pro Kind (0,5 -> halber)
  const jahresbrutto = Math.max(0, brutto * 12 - kinderFreibetragJaehrlich);

  function estGrundtarif(zvE) {
    // Grundfreibetrag (Ledige) – aktueller Wert laut EINKOMMENSTEUERTARIF in js/utils.js
    const grundfreibetrag = T.grundfreibetragLedig;
    if (zvE <= grundfreibetrag) {
      return 0;
    }

    // Progressionszone 1
    if (zvE <= T.zone1Bis) {
      const y = (zvE - grundfreibetrag) / 10000;
      return (979.18 * y + 1400) * y;
    }

    // Progressionszone 2
    if (zvE <= T.zone2Bis) {
      const z = (zvE - T.zone1Bis) / 10000;
      return (192.59 * z + 2397) * z + 966.53;
    }

    // Proportionalzone (Spitzensteuersatz 42 %)
    if (zvE <= T.proportionalBis) {
      return 0.42 * zvE - 10911.92;
    }

    // Reichensteuer (45 %)
    return 0.45 * zvE - 19246.67;
  }

  function estSplittingtarif(zvE) {
    const halb = zvE / 2;
    return estGrundtarif(halb) * 2;
  }

  let jahressteuer = 0;

  switch (steuerklasse) {
    case "I":
    case "IV":
      jahressteuer = estGrundtarif(jahresbrutto);
      break;

    case "II":
      // Entlastungsbetrag für Alleinerziehende (vereinfacht)
      const entlastung = 4260;
      jahressteuer = estGrundtarif(Math.max(0, jahresbrutto - entlastung));
      break;

    case "III":
      jahressteuer = estSplittingtarif(jahresbrutto);
      break;

    case "V":
      // Näherung: Gegenstück zu III
      jahressteuer = estGrundtarif(jahresbrutto) * 1.25;
      break;

    case "VI":
      // Zweitjob ohne Freibeträge
      jahressteuer = estGrundtarif(jahresbrutto) * 1.1;
      break;
  }

  // Kinderfreibeträge wirken bereits über das geminderte zu versteuernde
  // Einkommen (siehe oben), daher keine weitere Absetzung hier mehr.

  jahressteuer = Math.max(0, jahressteuer);

  const monatlicheLohnsteuer = jahressteuer / 12;

  return FormatHelper.roundToTwo(monatlicheLohnsteuer);
}

// Firma laden
function loadLohnabrechnungFirma() {
  loadBelegData("lohnabrechnungFirma", "datenLohnabrechnung");
}

// ============================================================================
// AUSBILDUNGSFELDER-EINGABE (nur bei Vorlage "Ausbildungsvergütung" sichtbar)
// – Ausbildungsberuf (Standard: Kaufmann/-frau für Büromanagement, belege.html)
// – Ausbildungsjahr (leer = Zufall 1.–3. Jahr; sonst fix für Mindestvergütungsprüfung)
// ============================================================================
function lohnabrechnungsBerufFeldUmschalten() {
  const select = document.getElementById("svgDropdownLohnabrechnung");
  const sichtbar = select && select.value === "ausbildungsverguetung.svg";
  const feldBeruf = document.getElementById(
    "lohnabrechnungAusbildungsberufFeld",
  );
  const feldJahr = document.getElementById("lohnabrechnungAusbildungsjahrFeld");
  if (feldBeruf) feldBeruf.style.display = sichtbar ? "" : "none";
  if (feldJahr) feldJahr.style.display = sichtbar ? "" : "none";
}

// Leere Soli-Zeile aus einer Lohnabrechnungs-Vorlage entfernen (Soli = 0 €).
// Die Zeile (Label + Wert) wird gelöscht und ALLE darunter liegenden Elemente
// (Texte, Boxen, Trennlinien) um den Zeilenabstand nach oben verschoben – so
// entsteht keine Lücke, auch nicht im PNG-/Druckexport.
// Die vier Vorlagen haben die Soli-Zeile immer vor der Kirchensteuer-Zeile;
// der Rasterabstand (hier 20 px) wird aus der Vorlage dynamisch ermittelt.
function entferneLeereSoliZeile(soliWert) {
  if (soliWert !== 0) return;
  const wertEl = document.getElementById("lohnabrechnungSoli");
  if (!wertEl) return;
  const svg = wertEl.ownerSVGElement;
  if (!svg) return;
  const y = parseFloat(wertEl.getAttribute("y"));
  if (isNaN(y)) return;

  // 1) Rasterabstand: kleinste Text-y unterhalb der Soli-Zeile
  let naechsteY = null;
  svg.querySelectorAll("text").forEach((t) => {
    const ty = parseFloat(t.getAttribute("y"));
    if (!isNaN(ty) && ty > y + 0.5 && (naechsteY === null || ty < naechsteY))
      naechsteY = ty;
  });

  // 2) Zeileninhalt entfernen: alle <text> mit derselben y-Position (Label + Wert)
  svg.querySelectorAll("text").forEach((t) => {
    const ty = parseFloat(t.getAttribute("y"));
    if (!isNaN(ty) && Math.abs(ty - y) < 0.5) t.remove();
  });

  if (naechsteY === null) return; // Soli war die letzte Zeile – nichts zu verschieben
  const delta = naechsteY - y;

  // 3) Alles darunter um delta nach oben schieben (text/rect: y; line: y1/y2)
  svg.querySelectorAll("text, rect").forEach((el) => {
    const ey = parseFloat(el.getAttribute("y"));
    if (!isNaN(ey) && ey > y) el.setAttribute("y", ey - delta);
  });
  svg.querySelectorAll("line").forEach((el) => {
    const y1 = parseFloat(el.getAttribute("y1"));
    const y2 = parseFloat(el.getAttribute("y2"));
    if (!isNaN(y1) && y1 > y) el.setAttribute("y1", y1 - delta);
    if (!isNaN(y2) && y2 > y) el.setAttribute("y2", y2 - delta);
  });
}

// Hauptfunktion: Lohnabrechnung erstellen
async function lohnabrechnungApplySVGholen(validationUeberspringen = false) {
  if (!validationUeberspringen && !validateInputs()) return;

  // SVG laden
  let selectedQuittung = document.getElementById(
    "svgDropdownLohnabrechnung",
  ).value;
  const container = document.getElementById("lohnabrechnungContainer");
  try {
    const svgData = await loadSVGTemplate(selectedQuittung);
    container.innerHTML = "";
    container.appendChild(safelyParseSVG(svgData));
  } catch (error) {
    console.error("Fehler beim Laden der SVG-Vorlage:", error);
    return;
  }

  // Firmendaten laden
  loadLohnabrechnungFirma();

  // Mitarbeiterdaten generieren (bei Ausbildungsvergütung: Azubi-Daten mit Beruf + Ausbildungsjahr)
  const istAusbildung = selectedQuittung === "ausbildungsverguetung.svg";
  // Ausbildungsjahr: Auswahl der Lehrkraft (belegformular), sonst Zufall (1.–3. Jahr)
  let azubiJahrSoll = null;
  if (istAusbildung) {
    const jahrInput = document.getElementById(
      "lohnabrechnungAusbildungsjahrInput",
    );
    const jahrWert = jahrInput ? parseInt(jahrInput.value, 10) : NaN;
    if (!isNaN(jahrWert) && jahrWert >= 1 && jahrWert <= 4)
      azubiJahrSoll = jahrWert;
  }
  const mitarbeiter = generateMitarbeiterDaten(istAusbildung, azubiJahrSoll);
  document.getElementById("lohnabrechnungMitarbeiterName").textContent =
    mitarbeiter.name;
  document.getElementById("lohnabrechnungMitarbeiterStrasse").textContent =
    mitarbeiter.strasse;
  document.getElementById("lohnabrechnungPersonalnr").textContent =
    mitarbeiter.personalnr;
  document.getElementById("lohnabrechnungGeburtsdatum").textContent =
    mitarbeiter.geburtsdatum;
  document.getElementById("lohnabrechnungEintrittsdatum").textContent =
    mitarbeiter.eintrittsdatum;
  document.getElementById("lohnabrechnungSteuerID").textContent =
    mitarbeiter.steuerID;
  document.getElementById("lohnabrechnungBank").textContent = mitarbeiter.bank;
  document.getElementById("lohnabrechnungIBAN").textContent = mitarbeiter.iban;

  // Ausbildungsdaten (nur im Ausbildungsvergütungs-Template vorhanden – guarded)
  // Beruf: bevorzugt aus dem Eingabefeld (Standard: Kaufmann/-frau für Büromanagement),
  // Fallback: Zufallsberuf aus der Liste
  const elBeruf = document.getElementById("lohnabrechnungAusbildungsberuf");
  if (elBeruf) {
    const berufInput = document.getElementById(
      "lohnabrechnungAusbildungsberufInput",
    );
    const berufManuell =
      istAusbildung && berufInput && berufInput.value.trim()
        ? berufInput.value.trim()
        : null;
    elBeruf.textContent = berufManuell || mitarbeiter.ausbildungsberuf || "";
  }
  const elJahr = document.getElementById("lohnabrechnungAusbildungsjahr");
  if (elJahr && mitarbeiter.ausbildungsjahr)
    elJahr.textContent = `${mitarbeiter.ausbildungsjahr}. Ausbildungsjahr`;

  // Monat
  const monat = document.getElementById("lohnabrechnungMonatInput").value;
  document.getElementById("lohnabrechnungMonat").textContent = monat;

  // Steuerliche Daten
  const steuerklasse = document.getElementById(
    "lohnabrechnungSteuerklasseInput",
  ).value;
  const kinderfreibetrag = document.getElementById(
    "lohnabrechnungKinderfreibetragInput",
  ).value;
  const religion = document.getElementById("lohnabrechnungKirchensteuerInput")
    .checked
    ? Math.random() < 0.5
      ? "röm.-kath."
      : "evangelisch"
    : "keine";

  document.getElementById("lohnabrechnungSteuerklasse").textContent =
    steuerklasse;
  document.getElementById("lohnabrechnungKinderfreibetrag").textContent =
    kinderfreibetrag;
  document.getElementById("lohnabrechnungReligion").textContent = religion;

  // Brutto
  const brutto = parseFloat(
    document.getElementById("lohnabrechnungBruttoInput").value,
  );
  document.getElementById("lohnabrechnungBrutto").textContent =
    FormatHelper.currency(brutto);

  // MINDESTAUSBILDUNGSVERGÜTUNG: Wenn das Brutto unter dem gesetzlichen
  // Mindestsatz des aktuellen Ausbildungsjahres liegt, Hinweis-Banner zeigen.
  // Monatsbeträge aktualisiert laut MINDESTAUSBILDUNGSVERGUETUNG in js/utils.js
  // (jahr-Feld beachten); tarifvertragliche Regeln können höher ausfallen.
  const minHinweis = document.getElementById(
    "lohnabrechnungMindestlohnHinweis",
  );
  if (minHinweis) {
    const minSatz =
      istAusbildung && mitarbeiter.ausbildungsjahr
        ? mindestAusbildungsverguetung(mitarbeiter.ausbildungsjahr)
        : null;
    if (minSatz !== null && brutto < minSatz) {
      minHinweis.style.display = "";
      minHinweis.innerHTML =
        "<strong>Hinweis:</strong> Die Ausbildungsvergütung von <strong>" +
        FormatHelper.currency(brutto) +
        "</strong> liegt unter der gesetzlichen <strong>Mindestausbildungsvergütung (Monatsbetrag: " +
        FormatHelper.currency(minSatz) +
        " im " +
        mitarbeiter.ausbildungsjahr +
        ". Ausbildungsjahr)</strong>. " +
        "Bitte pr&uuml;fen – tarifvertragliche Regelungen k&ouml;nnen h&ouml;here Anspr&uuml;che begr&uuml;nden.";
    } else {
      minHinweis.style.display = "none";
      minHinweis.innerHTML = "";
    }
  }

  // Lohnsteuer: Automatisch berechnen ODER manuellen Wert behalten
  const lohnsteuerGesperrt = document.getElementById(
    "lohnabrechnungLohnsteuerSperreInput",
  ).checked;

  if (!lohnsteuerGesperrt) {
    // Entsperrt: Neu berechnen
    const lohnsteuerBerechnet = berechneLohnsteuer(
      brutto,
      steuerklasse,
      kinderfreibetrag,
    );
    document.getElementById("lohnabrechnungLohnsteuerInput").value =
      lohnsteuerBerechnet.toFixed(2);
  }
  // Sonst: Gesperrt - manueller Wert bleibt im Input-Feld

  // Wert aus dem Input-Feld verwenden
  const lohnsteuer = parseFloat(
    document.getElementById("lohnabrechnungLohnsteuerInput").value,
  );
  document.getElementById("lohnabrechnungLohnsteuer").textContent =
    FormatHelper.currency(lohnsteuer);

  // Solidaritätszuschlag
  const soliAktiv = document.getElementById("lohnabrechnungSoliInput").checked;
  const soli = soliAktiv ? FormatHelper.roundToTwo(lohnsteuer * 0.055) : 0;
  document.getElementById("lohnabrechnungSoli").textContent = soliAktiv
    ? FormatHelper.currency(soli)
    : "0,00 €";

  // Kirchensteuer
  const kirchensteuerAktiv = document.getElementById(
    "lohnabrechnungKirchensteuerInput",
  ).checked;
  const kirchensteuer = kirchensteuerAktiv
    ? FormatHelper.roundToTwo(lohnsteuer * 0.08)
    : 0;
  document.getElementById("lohnabrechnungKirchensteuer").textContent =
    kirchensteuerAktiv ? FormatHelper.currency(kirchensteuer) : "0,00 €";

  // Steuerabzüge gesamt
  const steuerGesamt = lohnsteuer + soli + kirchensteuer;
  document.getElementById("lohnabrechnungSteuerGesamt").textContent =
    FormatHelper.currency(steuerGesamt);

  // SOLIDARITÄTSZUSCHLAG 0: Zeile komplett aus der Vorlage entfernen
  // (statt "0,00 €" – inkl. Platz; alles darunter rückt nach oben).
  // Wirkt für Lohnabrechnung, Gehaltsabrechnung und Ausbildungsvergütung.
  entferneLeereSoliZeile(soli);

  // Sozialversicherung AN-Anteile
  // Beiträge nur bis zur Beitragsbemessungsgrenze berechnen – die
  // monatlichen Grenzwerte gelten jeweils aktuell laut
  // BEITRAGSBEMESSUNGSGRENZEN in js/utils.js
  // (über die Hilfsfunktionen bbgBasisKVPV/bbgBasisRVALV).
  const kvSatz =
    parseFloat(document.getElementById("lohnabrechnungKVSatzInput").value) /
    100;
  const pvSatz =
    parseFloat(document.getElementById("lohnabrechnungPVSatzInput").value) /
    100;
  const rvSatz =
    parseFloat(document.getElementById("lohnabrechnungRVSatzInput").value) /
    100;
  const alvSatz =
    parseFloat(document.getElementById("lohnabrechnungALVSatzInput").value) /
    100;

  // Bemessungsbasis je Zweig begrenzen (KV/PV bzw. RV/ALV)
  const basisKvPv = bbgBasisKVPV(brutto);
  const basisRvAlv = bbgBasisRVALV(brutto);

  // Beiträge = Bemessungsbasis × Prozentsatz
  const kvAN = FormatHelper.roundToTwo(basisKvPv * kvSatz);
  const pvAN = FormatHelper.roundToTwo(basisKvPv * pvSatz);
  const rvAN = FormatHelper.roundToTwo(basisRvAlv * rvSatz);
  const alvAN = FormatHelper.roundToTwo(basisRvAlv * alvSatz);

  document.getElementById("lohnabrechnungKrankenversicherung").textContent =
    FormatHelper.currency(kvAN);
  document.getElementById("lohnabrechnungPflegeversicherung").textContent =
    FormatHelper.currency(pvAN);
  document.getElementById("lohnabrechnungRentenversicherung").textContent =
    FormatHelper.currency(rvAN);
  document.getElementById(
    "lohnabrechnungArbeitslosenversicherung",
  ).textContent = FormatHelper.currency(alvAN);

  const svGesamt = kvAN + pvAN + rvAN + alvAN;
  document.getElementById("lohnabrechnungSVGesamt").textContent =
    FormatHelper.currency(svGesamt);

  // Gesamtabzüge
  const abzuegeGesamt = steuerGesamt + svGesamt;
  document.getElementById("lohnabrechnungAbzuegeGesamt").textContent =
    FormatHelper.currency(abzuegeGesamt);

  // Netto
  const netto = brutto - abzuegeGesamt;
  document.getElementById("lohnabrechnungNetto").textContent =
    FormatHelper.currency(netto);
}
