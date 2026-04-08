// ============================================================================
// GEWERBESTEUER – AUFGABEN UND LÖSUNGEN
// ============================================================================

let kundeGewerbesteuer = "<i>[Modellunternehmen]</i>";
let ortGewerbesteuer = "der Stadt";
let yamlDataGewerbesteuer = [];

function getUserCompaniesGst() {
  const stored = localStorage.getItem('userCompanies');
  return stored ? JSON.parse(stored) : [];
}

function mergeUserCompaniesIntoYamlDataGst() {
  const userCompanies = getUserCompaniesGst();
  if (userCompanies.length === 0) return;
  yamlDataGewerbesteuer = [...yamlDataGewerbesteuer, ...userCompanies];
  yamlDataGewerbesteuer.sort((a, b) => {
    const bA = a.unternehmen?.branche || '';
    const bB = b.unternehmen?.branche || '';
    return bA.localeCompare(bB);
  });
}

// ============================================================================
// STANDORTFAKTOREN – POOLS
// ============================================================================

const harteStandortfaktorenPool = [
  "günstige Grundstückspreise und Mieten",
  "gute Verkehrsanbindung (Autobahn, Bahn)",
  "niedriger Gewerbesteuerhebesatz im Vergleich zur Region",
  "gut ausgebaute Infrastruktur (Breitband, Energieversorgung)",
  "Nähe zu Lieferanten und Zulieferern",
  "verfügbare Gewerbeflächen und Industriegebiete",
  "niedrige Lohnkosten im regionalen Vergleich",
  "Förderprogramme und Subventionen des Landes Bayern",
];

const weicheStandortfaktorenPool = [
  "hohe Lebensqualität und attraktives Wohnumfeld",
  "gutes Bildungsangebot (Schulen, Hochschulen)",
  "vielfältige Erholungs-, Kultur- und Freizeitangebote",
  "gute medizinische Versorgung",
  "soziales Umfeld und Gemeinschaftsgefühl",
  "attraktive Naturlage und Erholungsgebiete in der Umgebung",
  "gutes Image der Stadt / Region",
  "familienfreundliche Einrichtungen (Kitas, Betreuung)",
];

const standortfaktorIcons = {
  "günstige Grundstückspreise und Mieten":                    "€",
  "gute Verkehrsanbindung (Autobahn, Bahn)":                  "🚆",
  "niedriger Gewerbesteuerhebesatz im Vergleich zur Region":  "📋",
  "gut ausgebaute Infrastruktur (Breitband, Energieversorgung)": "⚡",
  "Nähe zu Lieferanten und Zulieferern":                      "📦",
  "verfügbare Gewerbeflächen und Industriegebiete":           "🏭",
  "niedrige Lohnkosten im regionalen Vergleich":              "💶",
  "Förderprogramme und Subventionen des Landes Bayern":       "📑",
  "hohe Lebensqualität und attraktives Wohnumfeld":           "🏡",
  "gutes Bildungsangebot (Schulen, Hochschulen)":             "🎓",
  "vielfältige Erholungs-, Kultur- und Freizeitangebote":     "🎭",
  "gute medizinische Versorgung":                             "🏥",
  "soziales Umfeld und Gemeinschaftsgefühl":                  "🤝",
  "attraktive Naturlage und Erholungsgebiete in der Umgebung":"🌳",
  "gutes Image der Stadt / Region":                           "⭐",
  "familienfreundliche Einrichtungen (Kitas, Betreuung)":     "👨‍👩‍👧",
};

function getIcon(text) {
  return standortfaktorIcons[text] || "•";
}

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================

function formatCurrencyGst(value) {
  return value.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + "";
}

function roundToTwoGst(num) {
  return Math.round(num * 100) / 100;
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateRandomGewerbeertrag() {
  const min = 100, max = 800;
  const val = (Math.floor(Math.random() * (max - min + 1)) + min) * 1000;
  const rest = Math.floor(Math.random() * 9) * 100;
  return val + rest;
}

function generateRandomHebesatz() {
  const h = [300,310,320,330,340,350,360,370,380,390,400,410,420,430,440,450,460,470,480,490];
  return h[Math.floor(Math.random() * h.length)];
}

// ============================================================================
// VALIDIERUNG
// ============================================================================

function validatePositiveNumber(val, fieldName) {
  const n = parseFloat(val.toString().replace(",", "."));
  if (isNaN(n) || n < 0) return { valid: false, error: `"${fieldName}" muss eine positive Zahl sein.` };
  return { valid: true, value: n };
}

function showValidationError(msg) {
  const el = document.getElementById("gstValidationError");
  if (!el) return;
  el.textContent = msg;
  el.style.display = msg ? "block" : "none";
}

function clearValidationError() { showValidationError(""); }

// ============================================================================
// INPUT-WERTE AUSLESEN
// ============================================================================

function getGstInputValues() {
  const errors = [];
  const gewerbeertragRaw  = document.getElementById("inputGewerbeertrag")?.value  || "0";
  const freibetragRaw     = document.getElementById("inputFreibetrag")?.value     || "0";
  const steuermesszahlRaw = document.getElementById("inputSteuermesszahl")?.value || "0";
  const hebesatzRaw       = document.getElementById("inputHebesatz")?.value       || "0";

  const gV = validatePositiveNumber(gewerbeertragRaw.replace(/\./g,"").replace(",","."),  "Gewerbeertrag");
  const fV = validatePositiveNumber(freibetragRaw.replace(/\./g,"").replace(",","."),     "Freibetrag");
  const mV = validatePositiveNumber(steuermesszahlRaw.replace(",","."),                   "Steuermesszahl");
  const hV = validatePositiveNumber(hebesatzRaw.replace(",","."),                         "Hebesatz");

  if (!gV.valid) errors.push(gV.error);
  if (!fV.valid) errors.push(fV.error);
  if (!mV.valid) errors.push(mV.error);
  if (!hV.valid) errors.push(hV.error);
  if (errors.length > 0) { showValidationError(errors.join(" | ")); return null; }

  const gewerbeertrag  = gV.value;
  const freibetrag     = fV.value;
  const steuermesszahl = mV.value;
  const hebesatz       = hV.value;

  if (freibetrag >= gewerbeertrag) {
    showValidationError("Der Freibetrag darf nicht größer oder gleich dem Gewerbeertrag sein.");
    return null;
  }
  if (steuermesszahl <= 0 || steuermesszahl > 100) {
    showValidationError("Die Steuermesszahl muss zwischen 0 und 100 liegen (z.\u00a0B. 3,5).");
    return null;
  }
  if (hebesatz < 200 || hebesatz > 900) {
    showValidationError("Der Hebesatz sollte zwischen 200 und 900 liegen.");
    return null;
  }

  // Grundsteuer A + B aus Inputs lesen
  const grundsteuerARaw = document.getElementById("inputGrundsteuerA")?.value || "340";
  const grundsteuerBRaw = document.getElementById("inputGrundsteuerB")?.value || "340";
  const grundsteuerA = parseFloat(grundsteuerARaw.replace(",",".")) || 340;
  const grundsteuerB = parseFloat(grundsteuerBRaw.replace(",",".")) || 340;

  clearValidationError();
  return { gewerbeertrag, freibetrag, steuermesszahl, hebesatz, grundsteuerA, grundsteuerB };
}

function getCheckedStandortfaktoren(pool) {
  const result = [];
  document.querySelectorAll(`input[type="checkbox"][data-pool="${pool}"]:checked`).forEach(cb => {
    result.push(cb.value);
  });
  return result;
}

// ============================================================================
// BERECHNUNG
// ============================================================================

function berechneGewerbesteuer(gewerbeertrag, freibetrag, steuermesszahl, hebesatz) {
  const steuerpflichtiger = gewerbeertrag - freibetrag;
  const messbetrag        = roundToTwoGst((steuermesszahl / 100) * steuerpflichtiger);
  const gewerbesteuer     = roundToTwoGst((hebesatz / 100) * messbetrag);
  return { steuerpflichtiger, messbetrag, gewerbesteuer };
}

// ============================================================================
// STADTVORLAGE HTML – modern, inline-CSS, Faktoren gemischt
// ============================================================================

function erstelleStadtVorlageHTML(ort, hebesatz, grundsteuerA, grundsteuerB, faktoren) {
  const stadtName = (ort && ort !== "der Stadt") ? ort.toUpperCase() : "STADT";
  const gemischt  = shuffleArray(faktoren);

  const faktorenItems = gemischt.map(f => `
    <div style="display:flex; align-items:flex-start; gap:10px; padding:7px 16px; border-top:1px solid rgba(255,255,255,0.4);">
      <span style="font-size:1.05em; flex-shrink:0; width:22px; text-align:center; margin-top:1px;">${getIcon(f)}</span>
      <span style="font-size:0.91em; color:#1a2a4a; line-height:1.4;">${f}</span>
    </div>`).join("");

  const steuerZeilen = [
    ["Grundsteuer A",        `${grundsteuerA}\u00a0%`],
    ["Grundsteuer B",        `${grundsteuerB}\u00a0%`],
    ["Gewerbesteuer Hebesatz", `${hebesatz}\u00a0%`],
  ].map(([label, wert]) => `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 16px; border-bottom:1px solid rgba(0,60,120,0.1);">
      <span style="font-size:0.91em; color:#1a2a4a;">${label}</span>
      <span style="font-weight:700; font-size:0.91em; color:#1a3a6a; white-space:nowrap;">${wert}</span>
    </div>`).join("");

  return `
<table style="
  max-width: 600px;
  width: 100%;
  border-collapse: collapse;
  border-radius: 16px;
  overflow: hidden;
  border: 1.5px solid #b8cde8;
  box-shadow: 0 4px 18px rgba(30,80,160,0.15);
  font-family: inherit;
  margin: 0 auto;
">
  <!-- Obere Zeile: Stadt-Header -->
  <tr>
    <td colspan="2" style="
      background: linear-gradient(155deg, #0f2a5a 0%, #1e5aa8 55%, #4a8fd0 100%);
      padding: 22px 12px;
      text-align: center;
    ">
      <div style="
        width: 100%;
        max-width: 260px;
        margin: 0 auto;
        border: 3px solid rgba(255,255,255,0.85);
        border-radius: 50%;
        background: rgba(255,255,255,0.10);
        padding: 14px 10px;
        box-sizing: border-box;
      ">
        <div style="font-size: 1.1em; letter-spacing: 0.22em; color: #fff; font-weight: 900; line-height: 1.2;">
          STADT
        </div>
        <div style="font-size: 1.35em; letter-spacing: 0.07em; color: #cce4ff; font-weight: 800; line-height: 1.35; word-break: break-word;">
          ${stadtName}
        </div>
      </div>
    </td>
  </tr>

  <!-- Inhaltszeile -->
  <tr>
    <!-- Rechte Spalte: Inhalt -->
    <td style="
      background: linear-gradient(155deg, #f2f7ff 0%, #deeaff 100%);
      padding: 0;
      vertical-align: top;
    ">
      <!-- Steuerzeilen -->
      <div style="padding: 10px 16px 4px 16px;">
        ${steuerZeilen}
      </div>

      <!-- "Bietet"-Header -->
      <div style="
        padding: 8px 16px 6px 16px;
        font-size: 0.91em;
        font-weight: 700;
        color: #1a3a6a;
        background: rgba(20,70,160,0.08);
        border-top: 1.5px solid rgba(0,60,120,0.18);
      ">
        Der Standort ${ort !== "der Stadt" ? ort : ""} bietet:
      </div>

      <!-- Faktoren -->
      <div style="padding: 0 16px 12px 16px;">
        ${faktorenItems}
      </div>
    </td>
  </tr>
</table>`.trim();
}

// ============================================================================
// HTML-AUSGABE AUFGABEN
// ============================================================================

function erstelleAufgabenHTML(values, faktoren) {
  const { gewerbeertrag, freibetrag, steuermesszahl, hebesatz, grundsteuerA, grundsteuerB } = values;
  const unternehmen = kundeGewerbesteuer;
  const ort = ortGewerbesteuer;

  return `
    <p style="margin:0 0 6px 0;">
     Es liegen Informationen zum Wirtschaftsstandort ${ort} vor:
    </p>
    <div style="margin:0 0 22px 0;">
      ${erstelleStadtVorlageHTML(ort, hebesatz, grundsteuerA, grundsteuerB, faktoren)}
    </div>

    <h2>Aufgaben</h2>
    <ol style="padding-left:1.4em;">
      <li style="margin-bottom:0.8em;">
        Erkläre die Auswirkung der Gewerbesteuer auf einen möglichen Gewinn von ${unternehmen}.
      </li>
      <li style="margin-bottom:0.8em;">
        ${unternehmen} hat einen Gewinn (Gewerbeertrag) in Höhe von
        <strong>${formatCurrencyGst(gewerbeertrag)} €</strong> erzielt und kann einen Freibetrag von
        <strong>${formatCurrencyGst(freibetrag)} €</strong> nutzen.
        Berechne die von ${unternehmen} zu zahlende Gewerbesteuer.
      </li>
      <li style="margin-bottom:0.8em;">
        Gib mithilfe der vorliegenden Informationen einen harten sowie einen weichen
        Standortfaktor für Unternehmen in ${ort} an.
      </li>
    </ol>
  `;
}

// ============================================================================
// HTML-AUSGABE LÖSUNG
// ============================================================================

function erstelleLoesungHTML(values) {
  const { gewerbeertrag, freibetrag, steuermesszahl, hebesatz } = values;
  const { steuerpflichtiger, messbetrag, gewerbesteuer } =
    berechneGewerbesteuer(gewerbeertrag, freibetrag, steuermesszahl, hebesatz);
  const unternehmen = kundeGewerbesteuer;
  const ort = ortGewerbesteuer;

  const harte  = getCheckedStandortfaktoren("hart");
  const weiche = getCheckedStandortfaktoren("weich");
  const harteText  = harte.length  ? harte.join(", ")  : "keine";
  const weicheText = weiche.length ? weiche.join(", ") : "keine";

  return `
    <h2>Lösung</h2>

    <div style="margin:1.2em 0 0.6em 0; padding-bottom:0.6em;">
      <strong>1. Auswirkung der Gewerbesteuer auf den Gewinn</strong>
      <p style="margin:6px 0 10px 0;">
        Der Gewinn von ${unternehmen} wird vermindert, da die Gewerbesteuer als betriebliche Steuer
        einen Aufwand darstellt.
      </p>
    </div>

    <div style="margin:1.2em 0 0.6em 0; padding-bottom:0.6em;">
      <strong>2. Berechnung der Gewerbesteuer</strong>
      <table style="border-collapse:collapse; font-family:courier,monospace; font-size:0.96em; width:550px; margin:6px 40px 10px 40px;">
        <tbody>
          <tr>
              <td style="padding:2px 4px; width:20px; padding-right:20px;"></td>
            <td style="padding:2px 4px; width:330px; padding-right:20px;">Gewinn (Gewerbeertrag)</td>
            <td style="padding:2px 8px; text-align:right; white-space:nowrap; width:200px;">${formatCurrencyGst(gewerbeertrag)}</td>
          </tr>
          <tr style="border-top:1px solid #ccc;">
        <td style="padding:2px 4px; width:20px; padding-right:20px;">- </td>
            <td style="padding:2px 4px; width:330px; padding-right:20px;">Freibetrag</td>
            <td style="padding:2px 8px; text-align:right; width:200px; white-space:nowrap;">${formatCurrencyGst(freibetrag)}</td>
          </tr>
          <tr style="border-top:2px solid #555; font-weight:bold;">
              <td style="padding:2px 4px; width:20px; padding-right:20px;">=</td>
            <td style="padding:2px 4px;width:330px;">steuerpflichtiger Gewerbeertrag</td>
            <td style="padding:2px 8px; text-align:right;width:200px; white-space:nowrap;">${formatCurrencyGst(steuerpflichtiger)}</td>
          </tr>
        </tbody>
      </table>

      <div style="margin:14px 0 10px 0; line-height:1.65;">
        <div style="display:flex; align-items:center; gap:16px; margin:14px 0; font-size:0.96em; flex-wrap:wrap;">
          <span style="min-width:220px; color:#333;">Gewerbesteuermessbetrag in Euro:</span>
          <span style="display:inline-flex; flex-direction:column; align-items:center; font-family:courier,monospace;">
            <span style="padding:1px 8px;">${steuermesszahl.toLocaleString("de-DE",{minimumFractionDigits:1,maximumFractionDigits:2})} · ${steuerpflichtiger.toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
            <span style="display:block; width:100%; border-top:1px solid #333; margin:1px 0;"></span>
            <span style="padding:1px 8px;">100</span>
          </span>
          <span style="white-space:nowrap;">= <strong>${formatCurrencyGst(messbetrag)}</strong></span>
        </div>
        <div style="display:flex; align-items:center; gap:16px; margin:14px 0; font-size:0.96em; flex-wrap:wrap;">
          <span style="min-width:220px; color:#333;">Gewerbesteuer in Euro:</span>
          <span style="display:inline-flex; flex-direction:column; align-items:center; font-family:courier,monospace;">
            <span style="padding:1px 8px;">${hebesatz} · ${messbetrag.toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2})}</span>
            <span style="display:block; width:100%; border-top:1px solid #333; margin:1px 0;"></span>
            <span style="padding:1px 8px;">100</span>
          </span>
          <span style="white-space:nowrap;">= <strong>${formatCurrencyGst(gewerbesteuer)}</strong></span>
        </div>
      </div>
    </div>

    <div style="margin:1.2em 0 0.6em 0; padding-bottom:0.6em;">
      <strong>3. Standortfaktoren für ${ort}</strong>
      <p style="margin:6px 0 10px 0;">
        <span style="font-weight:600; margin-right:6px;">Harter Standortfaktor:</span> z.&nbsp;B. ${harteText}<br>
        <span style="font-weight:600; margin-right:6px;">Weicher Standortfaktor:</span> z.&nbsp;B. ${weicheText}
      </p>
    </div>
  `;
}

// ============================================================================
// CHECKBOX-UI FÜR STANDORTFAKTOREN
// ============================================================================

function erstelleCheckboxUI() {
  const colStyle   = "display:flex; flex-direction:column; gap:0;";
  const headStyle  = "font-weight:600; font-size:0.88em; color:#444; margin-bottom:6px;";
  const labelStyle = "display:grid; grid-template-columns:18px 1fr; align-items:flex-start; gap:6px; margin:3px 0; font-size:0.91em; cursor:pointer; line-height:1.35;";
  const cbStyle    = "margin-top:3px; justify-self:start;";

  // Erste zwei jeweils vorausgewählt
  const harteChecks = harteStandortfaktorenPool.map((f, i) => `
    <label style="${labelStyle}">
      <input type="checkbox" data-pool="hart" value="${f}" style="${cbStyle}"${i < 2 ? " checked" : ""}>
      <span>${getIcon(f)}&nbsp;${f}</span>
    </label>`).join("");

  const weicheChecks = weicheStandortfaktorenPool.map((f, i) => `
    <label style="${labelStyle}">
      <input type="checkbox" data-pool="weich" value="${f}" style="${cbStyle}"${i < 2 ? " checked" : ""}>
      <span>${getIcon(f)}&nbsp;${f}</span>
    </label>`).join("");

  return `
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px 28px; margin:8px 0 4px 0;">
      <div style="${colStyle}">
        <div style="${headStyle}">Harte Standortfaktoren</div>
        ${harteChecks}
      </div>
      <div style="${colStyle}">
        <div style="${headStyle}">Weiche Standortfaktoren</div>
        ${weicheChecks}
      </div>
    </div>`;
}

function renderCheckboxUI() {
  const container = document.getElementById("standortCheckboxContainer");
  if (!container) return;
  container.innerHTML = erstelleCheckboxUI();
}

// ============================================================================
// YAML LADEN
// ============================================================================

function ladeYamlGewerbesteuer() {
  const saved =
    localStorage.getItem("uploadedYamlCompanyData") ||
    localStorage.getItem("standardYamlData");
  if (saved) {
    try {
      yamlDataGewerbesteuer = JSON.parse(saved);
      mergeUserCompaniesIntoYamlDataGst();
      document.dispatchEvent(new Event("yamlDataGewerbesteuerLoaded"));
      return true;
    } catch (e) { /* ignorieren */ }
  }
  fetch("js/unternehmen.yml")
    .then((r) => (r.ok ? r.text() : Promise.reject()))
    .then((txt) => {
      yamlDataGewerbesteuer = jsyaml.load(txt) || [];
      mergeUserCompaniesIntoYamlDataGst();
      document.dispatchEvent(new Event("yamlDataGewerbesteuerLoaded"));
    })
    .catch(() => { document.dispatchEvent(new Event("yamlDataGewerbesteuerLoaded")); });
  return false;
}

function fillCompanyDropdownGst() {
  if (!yamlDataGewerbesteuer?.length) return;
  const select = document.getElementById("gstKunde");
  if (!select) return;
  const sorted = [...yamlDataGewerbesteuer].sort((a, b) => {
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

function getOrtFromYaml(name) {
  if (!yamlDataGewerbesteuer?.length || !name) return null;
  const eintrag = yamlDataGewerbesteuer.find(e => e.unternehmen?.name === name);
  return eintrag?.unternehmen?.adresse?.ort || null;
}

function autoSelectMyCompanyGst() {
  const name = localStorage.getItem("myCompany");
  if (!name) return;
  const sel = document.getElementById("gstKunde");
  const opt = Array.from(sel?.options || []).find(o => o.value === name);
  if (!opt) return;
  sel.value = name;
  setKundeGst(name);
}

function setKundeGst(name) {
  kundeGewerbesteuer = name || "<i>[Modellunternehmen]</i>";
  const ort = getOrtFromYaml(name);
  if (ort) {
    ortGewerbesteuer = ort;
    const ortEl = document.getElementById("inputOrt");
    if (ortEl) ortEl.value = ort;
  }
}

// ============================================================================
// ZUFALLSWERTE
// ============================================================================

function setzeZufallswerte() {
  const gewerbeertrag = generateRandomGewerbeertrag();
  const freibetrag    = 24500;
  const hebesatz      = generateRandomHebesatz();

  const elG = document.getElementById("inputGewerbeertrag");
  const elF = document.getElementById("inputFreibetrag");
  const elH = document.getElementById("inputHebesatz");
  if (elG) elG.value = gewerbeertrag.toLocaleString("de-DE");
  if (elF) elF.value = freibetrag.toLocaleString("de-DE");
  if (elH) elH.value = hebesatz;

  const elM = document.getElementById("inputSteuermesszahl");
  if (elM && !elM.value) elM.value = "3,5";
}

// ============================================================================
// HAUPTFUNKTION
// ============================================================================

function zeigeGewerbesteuerAufgaben() {
  const values = getGstInputValues();
  if (!values) return;

  const harte  = getCheckedStandortfaktoren("hart");
  const weiche = getCheckedStandortfaktoren("weich");
  const alleFaktoren = [...harte, ...weiche];

  if (alleFaktoren.length === 0) {
    showValidationError("Bitte wählen Sie mindestens einen Standortfaktor aus.");
    return;
  }
  clearValidationError();

  const container = document.getElementById("Container");
  if (!container) return;

  // Aufgabe speichern für KI-Prompt
  letzteGstAufgabe = {
    values,
    faktoren: alleFaktoren,
    ort: ortGewerbesteuer,
    unternehmen: kundeGewerbesteuer,
  };

  container.innerHTML =
    erstelleAufgabenHTML(values, alleFaktoren) +
    erstelleLoesungHTML(values);

  // KI-Prompt-Vorschau aktualisieren falls sichtbar
  const vorschau = document.getElementById("kiPromptVorschau");
  if (vorschau && vorschau.style.display !== "none") {
    vorschau.textContent = erstelleKiPromptText();
  }
}

// ============================================================================
// KI-ASSISTENT – PROMPT
// ============================================================================

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Wirtschaftsassistent für Schüler der Realschule (BwR, Lernbereich 7/8 – Gewerbesteuer und Standortfaktoren).

Aufgabe:
- Gib KEINE fertigen Lösungen direkt vor.
- Führe die Schüler durch gezielte Fragen zur richtigen Lösung.
- Ziel: Lernförderung, eigenes Denken.

Wichtige Begriffe (korrekt verwenden!):
- Gewerbeertrag: Gewinn des Unternehmens vor Gewerbesteuer
- Freibetrag: Betrag, der vom Gewerbeertrag abgezogen wird (24.500 €)
- Steuerpflichtiger Gewerbeertrag = Gewerbeertrag − Freibetrag
- Steuermesszahl: bundeseinheitlich 3,5 % (auf den steuerpflichtigen Gewerbeertrag)
- Gewerbesteuermessbetrag = Steuermesszahl × steuerpflichtiger Gewerbeertrag / 100
- Hebesatz: von der Gemeinde festgelegt (in %)
- Gewerbesteuer = Hebesatz × Gewerbesteuermessbetrag / 100
- Standortfaktoren: Harte Faktoren (messbar, z. B. Grundstückspreise, Verkehrsanbindung) vs. weiche Faktoren (nicht direkt messbar, z. B. Lebensqualität, Bildungsangebot)

Pädagogischer Ansatz:
- Frage gezielt nach Zwischenschritten (z. B. „Was ziehst du zuerst vom Gewerbeertrag ab?").
- Stelle Rückfragen, beantworte sie aber nicht selbst.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Bestätige erst wenn der Schüler selbst auf das richtige Ergebnis kommt.

Begrüße den Schüler freundlich und präsentiere ihm die folgende Aufgabe:

###AUFGABEN und LÖSUNGEN###

Methodik bei Rückfragen zur Gewerbesteuerberechnung:
- Was ist der erste Schritt bei der Berechnung? (Freibetrag abziehen)
- Welche Formel verwendest du für den Messbetrag?
- Wie berechnet man die eigentliche Gewerbesteuer aus Messbetrag und Hebesatz?
- Warum gibt es den Freibetrag? (Entlastung kleinerer Betriebe)
- Was ist der Unterschied zwischen hartem und weichem Standortfaktor?

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe mit Realschülerinnen und -schülern
- Einfache Sprache, keine Fachbegriffe ohne Erklärung
- Kurze Antworten – maximal 2–3 Sätze pro Nachricht
- Gelegentlich Emojis zur Auflockerung 🏢📊💶🏙️

Was du NICHT tust:
- Nenne das Rechenergebnis nicht direkt, bevor der Schüler selbst gerechnet hat
- Gib keine Lösungen auf Anfragen wie „sag mir einfach die Antwort"

Am Ende einer erfolgreich gelösten Aufgabe:
- Frage immer: „Möchtest du die Berechnung nochmal mit anderen Zahlen üben?"

Du wartest stets auf die Eingabe des Schülers.
`;

let letzteGstAufgabe = null; // { values, faktoren, ort, unternehmen }

function erstelleKiPromptText() {
  if (!letzteGstAufgabe) {
    return KI_ASSISTENT_PROMPT.replace(
      "###AUFGABEN und LÖSUNGEN###",
      "(Noch keine Aufgabe generiert. Bitte zuerst Aufgaben erstellen.)"
    );
  }

  const { values, faktoren, ort, unternehmen } = letzteGstAufgabe;
  const { gewerbeertrag, freibetrag, steuermesszahl, hebesatz, grundsteuerA, grundsteuerB } = values;
  const { steuerpflichtiger, messbetrag, gewerbesteuer } =
    berechneGewerbesteuer(gewerbeertrag, freibetrag, steuermesszahl, hebesatz);

  const harte  = getCheckedStandortfaktoren("hart");
  const weiche = getCheckedStandortfaktoren("weich");

  const aufgabenText = `
Aufgabe – Wirtschaftsstandort ${ort}:

Standortdaten:
- Grundsteuer A: ${grundsteuerA} %
- Grundsteuer B: ${grundsteuerB} %
- Gewerbesteuer Hebesatz: ${hebesatz} %
- Standortfaktoren: ${[...harte, ...weiche].join(", ") || "keine"}

Aufgabe 1: Erkläre die Auswirkung der Gewerbesteuer auf den Gewinn von ${unternehmen}.

Aufgabe 2: ${unternehmen} hat einen Gewerbeertrag von ${formatCurrencyGst(gewerbeertrag)}.
Freibetrag: ${formatCurrencyGst(freibetrag)}, Steuermesszahl: ${steuermesszahl} %, Hebesatz: ${hebesatz} %.
Berechne die Gewerbesteuer.

Aufgabe 3: Nenne einen harten und einen weichen Standortfaktor für ${ort} anhand der Vorlage.

Musterlösung:
Aufgabe 1: Die Gewerbesteuer mindert den Gewinn, da sie als betrieblicher Aufwand zu buchen ist.

Aufgabe 2:
  Gewerbeertrag:                  ${formatCurrencyGst(gewerbeertrag)}
− Freibetrag:                     ${formatCurrencyGst(freibetrag)}
= Steuerpflichtiger Gewerbeertrag:${formatCurrencyGst(steuerpflichtiger)}

  Messbetrag = ${steuermesszahl} × ${steuerpflichtiger.toLocaleString("de-DE",{minimumFractionDigits:2})} / 100 = ${formatCurrencyGst(messbetrag)}
  Gewerbesteuer = ${hebesatz} × ${messbetrag.toLocaleString("de-DE",{minimumFractionDigits:2})} / 100 = ${formatCurrencyGst(gewerbesteuer)}

Aufgabe 3:
  Harte Standortfaktoren:  ${harte.join(", ") || "keine"}
  Weiche Standortfaktoren: ${weiche.join(", ") || "keine"}
`.trim();

  return KI_ASSISTENT_PROMPT.replace("###AUFGABEN und LÖSUNGEN###", aufgabenText);
}

function kopiereKiPrompt() {
  navigator.clipboard.writeText(erstelleKiPromptText()).then(() => {
    const btn = document.getElementById('kiPromptKopierenBtn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Kopiert!`;
    btn.classList.add('ki-prompt-btn--success');
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.classList.remove('ki-prompt-btn--success');
    }, 2500);
  }).catch(err => {
    console.error('Fehler beim Kopieren:', err);
    alert('Kopieren nicht möglich. Bitte manuell aus dem Textfeld kopieren.');
  });
}

function toggleKiPromptVorschau() {
  const vorschau = document.getElementById("kiPromptVorschau");
  const btn = document.getElementById("kiPromptToggleBtn");
  if (!vorschau || !btn) return;
  const isHidden = getComputedStyle(vorschau).display === "none";
  if (isHidden) {
    vorschau.style.display = "block";
    vorschau.textContent = erstelleKiPromptText();
    btn.textContent = "Prompt ausblenden ▲";
  } else {
    vorschau.style.display = "none";
    btn.textContent = "KI-Prompt anzeigen ▼";
  }
}

// ============================================================================
// INITIALISIERUNG
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  renderCheckboxUI();

  const sel = document.getElementById("gstKunde");
  if (sel) {
    sel.addEventListener("change", () => setKundeGst(sel.value.trim()));
  }

  const elM = document.getElementById("inputSteuermesszahl");
  if (elM && !elM.value) elM.value = "3,5";

  // Grundsteuer-Defaults setzen
  const elGA = document.getElementById("inputGrundsteuerA");
  const elGB = document.getElementById("inputGrundsteuerB");
  if (elGA && !elGA.value) elGA.value = "340";
  if (elGB && !elGB.value) elGB.value = "340";

  const ortEl = document.getElementById("inputOrt");
  if (ortEl) {
    ortEl.addEventListener("input", () => {
      ortGewerbesteuer = ortEl.value.trim() || "der Stadt";
    });
    
  }


  document.addEventListener(
    "yamlDataGewerbesteuerLoaded",
    () => {
      fillCompanyDropdownGst();
      autoSelectMyCompanyGst();
      setzeZufallswerte();
    },
    { once: true }
  );

  ladeYamlGewerbesteuer();

  if (yamlDataGewerbesteuer?.length) {
    fillCompanyDropdownGst();
    autoSelectMyCompanyGst();
    setzeZufallswerte();
  }
    zeigeGewerbesteuerAufgaben();
});