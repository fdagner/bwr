// ═══════════════════════════════════════════
// INFOGRAFIK-GENERATOR – infografik.js
// ═══════════════════════════════════════════

const COLOR_SCHEMES = {
  // ── Kräftige Mehrfarben ──
  vivid:   { name:"Bunt",      colors:["#e63946","#f4a261","#2a9d8f","#457b9d","#e9c46a","#6d2b8f"] },
  bold:    { name:"Kräftig",   colors:["#d62828","#f77f00","#fcbf49","#06d6a0","#118ab2","#073b4c"] },
  metro:   { name:"Metro",     colors:["#00b4d8","#e63946","#2dc653","#ff6b35","#7b2d8b","#f9c74f"] },
  fresh:   { name:"Frisch",    colors:["#52b788","#f4a261","#4895ef","#f72585","#fee440","#3a0ca3"] },
  // ── Helle / Pastelltöne ──
  pastel:  { name:"Pastell",   colors:["#a8dadc","#ffd6a5","#caffbf","#fdffb6","#ffafcc","#bde0fe"] },
  soft:    { name:"Weich",     colors:["#cdb4db","#ffc8dd","#ffafcc","#bde0fe","#a2d2ff","#b5e48c"] },
  // ── Abgestufte Einfarben ──
  classic: { name:"Blau",      colors:["#03045e","#0077b6","#00b4d8","#48cae4","#90e0ef","#caf0f8"] },
  eco:     { name:"Grün",      colors:["#1b4332","#2d6a4f","#40916c","#74c69d","#b7e4c7","#d8f3dc"] },
  warm:    { name:"Rot",       colors:["#6d1a1a","#c0392b","#e74c3c","#f1948a","#f5cba7","#fdebd0"] },
  gold:    { name:"Gold",      colors:["#7f4f24","#b5621c","#c8a96e","#e8c98e","#f5e2bc","#fdf6e3"] },
  // ── Spezial ──
  press:   { name:"Presse",    colors:["#111111","#444444","#777777","#aaaaaa","#cccccc","#eeeeee"] },
  mixed:   { name:"Divers",    colors:["#264653","#2a9d8f","#e9c46a","#f4a261","#e76f51","#a8dadc"] },
};


// ═══════════════════════════════════════════
// EINGABE-VALIDIERUNG & SANITISIERUNG
// ═══════════════════════════════════════════

// HTML-Tags und gefährliche Zeichen entfernen
function sanitizeText(str) {
  return str
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/&(?!(lt|gt|amp|quot|apos);)/g, "&amp;")
    .replace(/['"]/g, "")          // einfache & doppelte Anführungszeichen
    .trim();
}

// Prüft ob ein String HTML-Tags enthält
function containsHtml(str) {
  return /<[^>]+>/.test(str) || /javascript:/i.test(str);
}

// Zahl-Validierung: erlaubt ganze Zahlen und Dezimalzahlen (auch negativ)
function isValidNumber(val) {
  return /^-?\d{0,12}([.,]\d{0,6})?$/.test(val.trim()) && val.trim() !== "" && val.trim() !== "-";
}

// Text-Validierung: kein HTML, Längenbegrenzung
function isValidText(val, maxLen = 80) {
  return val.trim().length > 0 && val.length <= maxLen && !containsHtml(val);
}

// Verhindert das Einfügen von HTML in Textfelder (paste-Event)
function sanitizePaste(e, maxLen) {
  e.preventDefault();
  const text = (e.clipboardData || window.clipboardData).getData("text/plain");
  const clean = text.replace(/<[^>]+>/g, "").replace(/[<>"'`]/g, "").slice(0, maxLen);
  document.execCommand("insertText", false, clean);
}

// Nur Zahlen erlauben beim Tippen (keydown-Guard)
function numericKeyGuard(e) {
  const allowed = ["Backspace","Delete","ArrowLeft","ArrowRight","Tab","Enter","Home","End"];
  if (allowed.includes(e.key)) return;
  // Minus nur am Anfang
  if (e.key === "-" && e.target.selectionStart === 0 && !e.target.value.includes("-")) return;
  // Komma oder Punkt als Dezimalzeichen (nur einmal)
  if ((e.key === "," || e.key === ".") && !/[,.]/.test(e.target.value)) return;
  // Strg/Cmd + A/C/V/X erlauben
  if ((e.ctrlKey || e.metaKey) && ["a","c","v","x","z"].includes(e.key.toLowerCase())) return;
  // Ziffern
  if (!/^\d$/.test(e.key)) e.preventDefault();
}


// Relative Luminanz eines Hex-Farbwerts (WCAG-Formel)
function luminance(hex) {
  const r = parseInt(hex.slice(1,3),16)/255;
  const g = parseInt(hex.slice(3,5),16)/255;
  const b = parseInt(hex.slice(5,7),16)/255;
  const toL = c => c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4);
  return 0.2126*toL(r) + 0.7152*toL(g) + 0.0722*toL(b);
}

// Gibt "#ffffff" oder "#111111" zurück je nach Kontrast zur Hintergrundfarbe
function contrastColor(hex) {
  if (!hex || hex.length < 7) return "#111111";
  const l = luminance(hex);
  return l > 0.35 ? "#111111" : "#ffffff";
}

// Gibt ein Array mit passenden Schriftfarben für ein Array von Hintergrundfarben zurück
function autoLabelColors(bgColors) {
  return bgColors.map(c => contrastColor(c));
}


const LABEL_POSITIONS = {
  bar:    [ ["bottom","Am Start (innen)"], ["center","Mitte (innen)"] ],
  column: [ ["top","Über der Säule"],  ["center","Mitte (innen)"], ["bottom","Am Boden (innen)"] ],
  line:   [ ["top","Über dem Punkt"],  ["bottom","Unter dem Punkt"] ],
  pie:    [ ["inside","Innerhalb"] ],
  donut:  [ ["inside","Innerhalb"] ],
};

let activeScheme = "classic";
let currentChart = null;
let rowCount     = 0;

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════
function infografik_init() {
  // Farbschema-Buttons
  const container = document.getElementById("color-schemes");
  Object.entries(COLOR_SCHEMES).forEach(([key, scheme]) => {
    const btn = document.createElement("div");
    btn.className = "scheme-btn" + (key === activeScheme ? " active" : "");
    btn.onclick = () => selectScheme(key);
    btn.innerHTML = `
      <div class="scheme-preview">
        ${scheme.colors.slice(0,4).map(c => `<span style="background:${c}"></span>`).join("")}
      </div>
      <div class="scheme-name">${scheme.name}</div>`;
    container.appendChild(btn);
  });

  document.getElementById("inp-charttype").addEventListener("change", updatePositionOptions);
  updatePositionOptions();

  document.getElementById("inp-label-color").addEventListener("input", function() {
    document.getElementById("inp-label-color-hex").value = this.value;
  });

  // Standardvorlage laden und sofort rendern
  loadTemplate("bip");
}

// ═══════════════════════════════════════════
// POSITION-OPTIONEN & FARBSCHEMA
// ═══════════════════════════════════════════
function updatePositionOptions() {
  const type = document.getElementById("inp-charttype").value;
  const sel  = document.getElementById("inp-label-position");
  sel.innerHTML = (LABEL_POSITIONS[type] || []).map(([v,l]) => `<option value="${v}">${l}</option>`).join("");
  document.getElementById("ig-xaxis-wrap").style.display = type === "bar" ? "" : "none";
  // Auto-Schriftfarbe nur bei Balken, Pie und Donut anzeigen
  const autoCheckbox = document.getElementById("inp-label-auto");
  if (autoCheckbox) {
    const autoRow = autoCheckbox.closest("label");
    if (autoRow) autoRow.style.display = (type === "bar" || type === "pie" || type === "donut") ? "" : "none";
  }
  // Farbwähler für Linien/Säulen immer aktiv (kein Auto → color-wrap nie ausgeblendet)
  if (type === "line" || type === "column") {
    const colorWrap = document.getElementById("inp-label-color-wrap");
    if (colorWrap) { colorWrap.style.opacity = "1"; colorWrap.style.pointerEvents = "auto"; }
  }
}

function toggleLabelColorAuto() {
  const isAuto = document.getElementById("inp-label-auto").checked;
  const wrap   = document.getElementById("inp-label-color-wrap");
  wrap.style.opacity       = isAuto ? ".35" : "1";
  wrap.style.pointerEvents = isAuto ? "none" : "auto";
}

function syncColorFromHex() {
  const hex = document.getElementById("inp-label-color-hex").value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
    document.getElementById("inp-label-color").value = hex;
  }
}

function selectScheme(key) {
  activeScheme = key;
  document.querySelectorAll(".scheme-btn").forEach((btn, i) => {
    btn.classList.toggle("active", Object.keys(COLOR_SCHEMES)[i] === key);
  });
}

// ═══════════════════════════════════════════
// DATENPUNKTE
// ═══════════════════════════════════════════
function addRow(label = "", value = "") {
  rowCount++;
  const id  = rowCount;
  const div = document.createElement("div");
  div.className  = "ig-data-row";
  div.id         = "row-" + id;
  div.draggable  = true;

  // Label: HTML entfernen
  const safeLabel = String(label).replace(/<[^>]+>/g, "").replace(/[<>"'`]/g, "").slice(0, 40);

  div.innerHTML  = `
    <span class="ig-drag-handle" title="Ziehen zum Sortieren">⠿</span>
    <div style="display:flex;flex-direction:column;gap:1px;">
      <input type="text" placeholder="Bezeichnung" value="${safeLabel}" maxlength="40"
        oninput="
          this.value = this.value.replace(/<[^>]+>/g,'').replace(/[<>']/g,'');
          this.classList.remove('invalid');
          const c=this.nextElementSibling;
          c.textContent=this.value.length+' / 40';
          c.className='ig-char-counter'+(this.value.length>=40?' over':this.value.length>=34?' warn':'');
        "
        onpaste="sanitizePaste(event, 40)"
      />
      <div class="ig-char-counter">${safeLabel.length} / 40</div>
    </div>
    <input type="text" inputmode="decimal" placeholder="Wert" value="${value}"
      maxlength="20"
      onkeydown="numericKeyGuard(event)"
      oninput="
        this.classList.remove('invalid');
        const v = this.value.trim();
        this.classList.toggle('invalid', v !== '' && !isValidNumber(v));
      "
      onpaste="
        event.preventDefault();
        const t=(event.clipboardData||window.clipboardData).getData('text/plain').replace(/[^0-9.,-]/g,'').slice(0,20);
        document.execCommand('insertText',false,t);
      "
    />
    <button class="ig-btn-icon" onclick="removeRow(${id})">×</button>`;
  document.getElementById("data-rows").appendChild(div);
  initDragRow(div);
}

function removeRow(id) {
  const el = document.getElementById("row-" + id);
  if (el) el.remove();
}

function getDataPoints() {
  const rows   = document.querySelectorAll("#data-rows .ig-data-row");
  const labels = [], values = [];
  rows.forEach(row => {
    const inputs = row.querySelectorAll("input");
    const label  = inputs[0].value.trim();
    const val    = parseFloat(inputs[1].value);
    if (label && !isNaN(val)) { labels.push(label); values.push(val); }
  });
  return { labels, values };
}

// ═══════════════════════════════════════════
// SORTIERUNG
// ═══════════════════════════════════════════
function sortRows(mode) {
  document.querySelectorAll(".ig-sort-btn").forEach(b => b.classList.remove("active"));
  if (mode === "manual") document.getElementById("sort-manual-btn").classList.add("active");

  const container = document.getElementById("data-rows");
  const rows = [...container.querySelectorAll(".ig-data-row")];
  const getData = r => {
    const inputs = r.querySelectorAll("input");
    return { label: inputs[0].value.trim(), value: parseFloat(inputs[1].value) || 0 };
  };

  if (mode === "asc")   rows.sort((a,b) => getData(a).value - getData(b).value);
  if (mode === "desc")  rows.sort((a,b) => getData(b).value - getData(a).value);
  if (mode === "alpha") rows.sort((a,b) => getData(a).label.localeCompare(getData(b).label, "de"));
  if (mode === "manual") return;

  rows.forEach(r => container.appendChild(r));
}

// ═══════════════════════════════════════════
// DRAG & DROP
// ═══════════════════════════════════════════
let dragSrc = null;

function initDragRow(div) {
  div.addEventListener("dragstart", e => {
    dragSrc = div;
    div.classList.add("dragging");
    e.dataTransfer.effectAllowed = "move";
  });
  div.addEventListener("dragend", () => {
    div.classList.remove("dragging");
    document.querySelectorAll(".ig-data-row").forEach(r => r.classList.remove("drag-over"));
  });
  div.addEventListener("dragover", e => {
    e.preventDefault();
    document.querySelectorAll(".ig-data-row").forEach(r => r.classList.remove("drag-over"));
    if (div !== dragSrc) div.classList.add("drag-over");
  });
  div.addEventListener("drop", e => {
    e.preventDefault();
    if (dragSrc && dragSrc !== div) {
      const rows   = [...document.getElementById("data-rows").querySelectorAll(".ig-data-row")];
      const srcIdx = rows.indexOf(dragSrc);
      const tgtIdx = rows.indexOf(div);
      if (srcIdx < tgtIdx) div.after(dragSrc); else div.before(dragSrc);
    }
    div.classList.remove("drag-over");
  });
}

// ═══════════════════════════════════════════
// CSV IMPORT
// ═══════════════════════════════════════════
let csvLines = [];

function openCsvModal()  { document.getElementById("csv-modal").classList.add("open"); }
function closeCsvModal() {
  document.getElementById("csv-modal").classList.remove("open");
  csvLines = [];
  document.getElementById("csv-preview").textContent = "— noch keine Datei gewählt —";
  document.getElementById("csv-file").value = "";
}

function previewCsv() {
  const file = document.getElementById("csv-file").files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    csvLines = e.target.result.split(/\r?\n/).filter(l => l.trim());
    document.getElementById("csv-preview").textContent =
      csvLines.slice(0, 8).join("\n") + (csvLines.length > 8 ? "\n…" : "");
  };
  reader.readAsText(file, "UTF-8");
}

function importCsv() {
  if (!csvLines.length) { alert("Bitte erst eine CSV-Datei wählen."); return; }
  const skipHeader = document.getElementById("csv-skip-header").checked;
  const lines      = skipHeader ? csvLines.slice(1) : csvLines;
  document.getElementById("data-rows").innerHTML = "";
  rowCount = 0;
  lines.forEach(line => {
    const parts = line.split(";");
    const label = (parts[0] || "").trim();
    const value = parseFloat((parts[1] || "").trim().replace(",", "."));
    if (label) addRow(label, isNaN(value) ? "" : value);
  });
  closeCsvModal();
}

// ═══════════════════════════════════════════
// PNG EXPORT (gesamte Chart-Card inkl. Titel)
// ═══════════════════════════════════════════
function exportPng() {
  const card = document.getElementById("ig-chart-card");
  html2canvas(card, { backgroundColor:"#ffffff", scale:2, useCORS:true, logging:false })
    .then(canvas => {
      const a = document.createElement("a");
      a.href     = canvas.toDataURL("image/png");
      a.download = "infografik.png";
      a.click();
    });
}

// ═══════════════════════════════════════════
// SVG EXPORT – echtes SVG mit nativen Elementen
// ═══════════════════════════════════════════
function exportSvg() {
  const card    = document.getElementById("ig-chart-card");
  const origSvg = card.querySelector("svg");
  if (!origSvg) { alert("Bitte erst eine Infografik erstellen."); return; }

  const W       = card.offsetWidth;
  const PAD     = 32;
  const svgNS   = "http://www.w3.org/2000/svg";

  // Hilfsfunktion: SVG-Text-Element erstellen
  const svgText = (txt, x, y, attrs = {}) => {
    const el = document.createElementNS(svgNS, "text");
    el.setAttribute("x", x);
    el.setAttribute("y", y);
    el.setAttribute("font-family", "Georgia, serif");
    Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k, v));
    el.textContent = txt;
    return el;
  };

  // Elemente und ihre Höhen ermitteln
  const titleEl    = document.getElementById("ig-out-title");
  const subtitleEl = document.getElementById("ig-out-subtitle");
  const sourceEl   = document.getElementById("ig-out-source");
  const unitEl     = document.getElementById("ig-out-unit");
  const footerEl   = document.getElementById("ig-chart-footer");

  const hasTitle    = titleEl.style.display    !== "none" && titleEl.textContent.trim();
  const hasSubtitle = subtitleEl.style.display !== "none" && subtitleEl.textContent.trim();
  const hasFooter   = footerEl.style.display   !== "none";

  // Y-Cursor für Textelemente
  let curY = PAD;
  const elements = [];

  if (hasTitle) {
    curY += 22;
    elements.push(svgText(titleEl.textContent, PAD, curY, {
      "font-size": "22", "font-weight": "bold", "fill": "#1a1a1a"
    }));
    curY += 8;
  }
  if (hasSubtitle) {
    curY += 16;
    elements.push(svgText(subtitleEl.textContent, PAD, curY, {
      "font-size": "14", "fill": "#666"
    }));
    curY += 4;
  }

  // Abstand vor Chart
  curY += 12;
  const chartY = curY;

  // ApexCharts-SVG klonen und bereinigen
  const chartSvg   = origSvg.cloneNode(true);
  const chartW     = parseFloat(origSvg.getAttribute("width"))  || origSvg.viewBox.baseVal.width  || (W - PAD * 2);
  const chartH     = parseFloat(origSvg.getAttribute("height")) || origSvg.viewBox.baseVal.height || 400;
  chartSvg.setAttribute("x", PAD);
  chartSvg.setAttribute("y", chartY);
  chartSvg.setAttribute("width",  W - PAD * 2);
  chartSvg.setAttribute("height", chartH);
  chartSvg.removeAttribute("style");

  curY += chartH + 12;

  // Footer
  if (hasFooter) {
    curY += 8;
    const sep = document.createElementNS(svgNS, "line");
    sep.setAttribute("x1", PAD); sep.setAttribute("x2", W - PAD);
    sep.setAttribute("y1", curY); sep.setAttribute("y2", curY);
    sep.setAttribute("stroke", "#eee"); sep.setAttribute("stroke-width", "1");
    elements.push(sep);
    curY += 14;
    if (sourceEl.textContent.trim()) {
      elements.push(svgText(sourceEl.textContent, PAD, curY, { "font-size": "11", "fill": "#999" }));
    }
    curY += 4;
  }

  const totalH = curY + PAD;

  // Wrapper-SVG zusammenbauen
  const wrapper = document.createElementNS(svgNS, "svg");
  wrapper.setAttribute("xmlns",   svgNS);
  wrapper.setAttribute("width",   W);
  wrapper.setAttribute("height",  totalH);
  wrapper.setAttribute("viewBox", `0 0 ${W} ${totalH}`);

  // Weißer Hintergrund
  const bg = document.createElementNS(svgNS, "rect");
  bg.setAttribute("width", "100%"); bg.setAttribute("height", "100%"); bg.setAttribute("fill", "#fff");
  wrapper.appendChild(bg);

  // Blauer Balken oben (wie border-top)
  const topBar = document.createElementNS(svgNS, "rect");
  topBar.setAttribute("x", 0); topBar.setAttribute("y", 0);
  topBar.setAttribute("width", W); topBar.setAttribute("height", "5");
  topBar.setAttribute("fill", "#1f4e79");
  wrapper.appendChild(topBar);

  elements.forEach(el => wrapper.appendChild(el));
  wrapper.appendChild(chartSvg);

  // Serialisieren & herunterladen
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(wrapper);
  const b64 = btoa(unescape(encodeURIComponent(svgStr)));
  const a   = document.createElement("a");
  a.href    = "data:image/svg+xml;base64," + b64;
  a.download = "infografik.svg";
  a.click();
}

// ═══════════════════════════════════════════
// CSV EXPORT
// ═══════════════════════════════════════════
function downloadCsv() {
  const { labels, values } = getDataPoints();
  const content = "Bezeichnung;Wert\n" + labels.map((l,i) => `${l};${values[i]}`).join("\n");
  const b64     = btoa(unescape(encodeURIComponent(content)));
  const a       = document.createElement("a");
  a.href        = "data:text/csv;base64," + b64;
  a.download    = "daten.csv";
  a.click();
}
// ═══════════════════════════════════════════
// VORLAGEN
// ═══════════════════════════════════════════
const CY  = new Date().getFullYear();      // aktuelles Jahr
const PY  = CY - 1;                           // Vorjahr
const SY  = `${PY}/${String(CY).slice(-2)}`;  // Schuljahr z.B. 2025/26

const TEMPLATES = {
  bip: {
    title: "BIP ausgewählter Volkswirtschaften",
    subtitle: `Bruttoinlandsprodukt in Mrd. US-Dollar, ${PY}`,
    source: `Quelle: Fiktive Beispieldate, ${CY}`,
    unit: " ", xlabel: "",
    chartType: "bar", labelPos: "center", showLabels: "yes", thousandSep: "point", xaxis: "no",
    data: [["Deutschland",4072],["USA",25463],["China",17963],["Japan",4231],["Frankreich",2782]]
  },
  inflation: {
    title: "Inflationsrate im Vergleich",
    subtitle: `Jährliche Veränderung des Verbraucherpreisindex, ${PY}`,
    source: `Quelle: Fiktive Beispieldate, ${CY}`,
    unit: "%", xlabel: "",
    chartType: "bar", labelPos: "center", showLabels: "yes", thousandSep: "none", xaxis: "no",
    data: [["Deutschland",5.9],["Frankreich",5.7],["Italien",5.9],["Spanien",3.5],["Polen",10.9],["Ungarn",17.6]]
  },
  arbeitslosigkeit: {
    title: "Arbeitslosenquote ausgewählter Länder",
    subtitle: `Anteil der Arbeitslosen an der Erwerbsbevölkerung, ${PY}`,
    source: `Quelle: Fiktive Beispieldate, ${CY}`,
    unit: "%", xlabel: "",
    chartType: "bar", labelPos: "center", showLabels: "yes", thousandSep: "none", xaxis: "no",
    data: [["Deutschland",3.0],["USA",3.7],["Frankreich",7.3],["Spanien",12.1],["Italien",7.0],["Japan",2.5]]
  },
  umsatz: {
    title: "Quartalsumsatz Muster GmbH",
    subtitle: `Umsatz in Tsd. Euro, Geschäftsjahr ${PY}`,
    source: "Quelle: Interne Unternehmensstatistik",
    unit: "Tsd. €", xlabel: "Quartal",
    chartType: "column", labelPos: "top", showLabels: "yes", thousandSep: "point", xaxis: "no",
    data: [["Q1",312],["Q2",478],["Q3",391],["Q4",544]]
  },
  marktanteile: {
    title: "Marktanteile Sportartikelmarkt",
    subtitle: `Anteil am Gesamtmarkt in Prozent, Deutschland ${PY}`,
    source: `Quelle: Fiktive Beispieldate, ${CY}`,
    unit: "%", xlabel: "",
    chartType: "pie", labelPos: "inside", showLabels: "yes", thousandSep: "none", xaxis: "no",
    data: [["Unternehmen A",34],["Unternehmen B",28],["Unternehmen C",19],["Sonstige",19]]
  },
  kosten: {
    title: "Kostenstruktur Produktionsbetrieb",
    subtitle: `Anteile der Kostenstellen am Gesamtaufwand, ${PY}`,
    source: "Quelle: Interne Kostenrechnung",
    unit: "Tsd. €", xlabel: "",
    chartType: "donut", labelPos: "inside", showLabels: "yes", thousandSep: "point", xaxis: "no",
    data: [["Materialkosten",480],["Personalkosten",620],["Energiekosten",95],["Verwaltung",130],["Vertrieb",175]]
  },
  haushalt: {
    title: "Monatliche Haushaltsausgaben",
    subtitle: "Durchschnittlicher Haushalt mit 2 Personen, in Euro",
    source: `Quelle: Fiktive Beispieldate, ${PY}`,
    unit: "€", xlabel: "",
    chartType: "bar", labelPos: "center", showLabels: "yes", thousandSep: "point", xaxis: "no",
    data: [["Miete & Nebenkosten",980],["Lebensmittel",420],["Mobilität",230],["Freizeit",180],["Versicherungen",145],["Bekleidung",90],["Sonstiges",155]]
  },
  haushalt_familie: {
    title: "Monatsausgaben Familie mit 2 Kindern",
    subtitle: "Durchschnittliche Ausgaben in Euro pro Monat",
    source: "Quelle: Fiktive Beispieldaten",
    unit: "€", xlabel: "",
    chartType: "bar", labelPos: "center", showLabels: "yes", thousandSep: "point", xaxis: "no",
    data: [["Miete & Nebenkosten",1340],["Lebensmittel",680],["Kita / Schule",290],["Mobilität",310],["Freizeit & Hobbys",240],["Versicherungen",195],["Kleidung",160],["Sonstiges",185]]
  },
  haushalt_student: {
    title: "Monatliches Budget Studierende",
    subtitle: "Durchschnittliche Ausgaben in Euro, Beispiel WG-Zimmer",
    source: "Quelle: Fiktive Beispieldaten",
    unit: "", xlabel: "",
    chartType: "donut", labelPos: "inside", showLabels: "yes", thousandSep: "point", xaxis: "no",
    data: [["Miete & Nebenkosten",550],["Lebensmittel",210],["Semesterbeitrag",60],["Mobilität",85],["Freizeit",90],["Kleidung",45],["Sonstiges",60]]
  },
  haushalt_einnahmen: {
    title: "Monatliche Einnahmen Privathaushalt",
    subtitle: "Nettoeinkommen nach Herkunft, Beispielhaushalt",
    source: "Quelle: Fiktive Beispieldaten",
    unit: "€", xlabel: "",
    chartType: "pie", labelPos: "inside", showLabels: "yes", thousandSep: "point", xaxis: "no",
    data: [["Gehalt Person 1",2800],["Gehalt Person 2",1950],["Kindergeld",250],["Mieteinnahmen",480],["Sonstiges",120]]
  },
  haushalt_strom: {
    title: "Stromverbrauch im Jahresverlauf",
    subtitle: "Verbrauch in kWh pro Monat, Beispielhaushalt",
    source: "Quelle: Fiktive Beispieldaten",
    unit: "", xlabel: "Monat",
    chartType: "line", labelPos: "top", showLabels: "yes", thousandSep: "none", xaxis: "no",
    data: [["Jan",385],["Feb",350],["Mär",290],["Apr",240],["Mai",195],["Jun",175],["Jul",170],["Aug",178],["Sep",205],["Okt",265],["Nov",320],["Dez",390]]
  },
  haushalt_sparen: {
    title: "Sparquote im Jahresverlauf",
    subtitle: "Monatlich zurückgelegter Betrag in Euro",
    source: "Quelle: Fiktive Beispieldaten",
    unit: "", xlabel: "Monat",
    chartType: "column", labelPos: "top", showLabels: "yes", thousandSep: "point", xaxis: "no",
    data: [["Jan",180],["Feb",220],["Mär",150],["Apr",300],["Mai",270],["Jun",90],["Jul",50],["Aug",120],["Sep",200],["Okt",310],["Nov",260],["Dez",0]]
  },
  haushalt_schulden: {
    title: "Restschuld Immobilienkredit",
    subtitle: "Entwicklung der Restschuld über 10 Jahre, in Euro",
    source: "Quelle: Fiktive Beispieldaten",
    unit: "", xlabel: "Jahr",
    chartType: "line", labelPos: "top", showLabels: "yes", thousandSep: "point", xaxis: "no",
    data: [["Jahr 1",195000],["Jahr 2",188400],["Jahr 3",181500],["Jahr 4",174300],["Jahr 5",166700],["Jahr 6",158700],["Jahr 7",150200],["Jahr 8",141200],["Jahr 9",131600],["Jahr 10",121400]]
  },
  vermoegen: {
    title: "Vermögensaufteilung Privathaushalt",
    subtitle: `Anteile am Gesamtvermögen, Beispielhaushalt ${PY}`,
    source: "Quelle: Fiktive Beispieldaten",
    unit: "€", xlabel: "",
    chartType: "donut", labelPos: "inside", showLabels: "yes", thousandSep: "point", xaxis: "no",
    data: [["Immobilien",280000],["Aktien & Fonds",45000],["Tagesgeld",18000],["Rentenversicherung",62000],["Sonstiges",9000]]
  },
  noten: {
    title: "Notenverteilung Klasse 10b",
    subtitle: "Schulaufgabe Mathematik, Anzahl Schülerinnen und Schüler",
    source: "Quelle: Fiktive Schuldaten",
    unit: "", xlabel: "Note",
    chartType: "column", labelPos: "top", showLabels: "yes", thousandSep: "none", xaxis: "no",
    data: [["1",3],["2",7],["3",9],["4",6],["5",3],["6",2]]
  },
  mitglieder: {
    title: "Vereinsmitglieder nach Altersgruppe",
    subtitle: `Sportverein TSV Musterstadt, Stand Januar ${CY}`,
    source: "Quelle: Mitgliederverwaltung TSV",
    unit: "Mitglieder", xlabel: "Altersgruppe",
    chartType: "column", labelPos: "top", showLabels: "yes", thousandSep: "none", xaxis: "no",
    data: [["unter 14",48],["14–17",31],["18–30",55],["31–50",72],["51–65",44],["über 65",29]]
  },
  schulbuero: {
    title: "Einnahmen Schülermitverwaltung",
    subtitle: `Schuljahr ${SY}, in Euro`,
    source: "Quelle: SMV-Kassenabrechnung",
    unit: "", xlabel: "",
    chartType: "pie", labelPos: "inside", showLabels: "yes", thousandSep: "point", xaxis: "no",
    data: [["Schulheftverkauf",320],["Pausenverkauf",485],["Schulball",650],["Sponsoren",200],["Sonstiges",95]]
  },
  // ── Einkommen ──
  einkommen_netto: {
    title: "Nettoeinkommen nach Berufsgruppe",
    subtitle: `Durchschnittliches monatliches Nettoeinkommen in Euro, Deutschland ${PY}`,
    source: `Quelle: Fiktive Beispieldaten, ${CY}`,
    unit: "€", xlabel: "",
    chartType: "bar", labelPos: "center", showLabels: "yes", thousandSep: "point", xaxis: "no",
    data: [["Handwerk",2180],["Einzelhandel",1850],["Pflege & Soziales",2050],["Verwaltung",2640],["IT & Technik",3480],["Ingenieurwesen",3820],["Medizin",4950],["Management",5600]]
  },
  einkommen_quellen: {
    title: "Einkommensquellen eines Haushalts",
    subtitle: "Monatliche Bruttoeinkünfte nach Herkunft, Beispielhaushalt",
    source: "Quelle: Fiktive Beispieldaten",
    unit: "€", xlabel: "",
    chartType: "donut", labelPos: "inside", showLabels: "yes", thousandSep: "point", xaxis: "no",
    data: [["Gehalt (Vollzeit)",3400],["Gehalt (Teilzeit)",1200],["Kindergeld",250],["Mieteinnahmen",650],["Zinsen & Dividenden",120],["Nebentätigkeit",280]]
  },
  einkommen_entwicklung: {
    title: "Einkommensentwicklung über 10 Jahre",
    subtitle: "Jährliches Nettoeinkommen in Euro, Beispielperson",
    source: "Quelle: Fiktive Beispieldaten",
    unit: "€", xlabel: "Jahr",
    chartType: "line", labelPos: "top", showLabels: "yes", thousandSep: "point", xaxis: "no",
    data: [["Jahr 1",22400],["Jahr 2",23100],["Jahr 3",23800],["Jahr 4",25200],["Jahr 5",26500],["Jahr 6",27900],["Jahr 7",29400],["Jahr 8",31000],["Jahr 9",32600],["Jahr 10",34500]]
  },

  // ── Ausgaben ──
  ausgaben_kategorien: {
    title: "Ausgabenkategorien im Überblick",
    subtitle: "Monatliche Ausgaben nach Kategorie, Beispielhaushalt 2 Personen",
    source: "Quelle: Fiktive Beispieldaten",
    unit: "€", xlabel: "",
    chartType: "bar", labelPos: "center", showLabels: "yes", thousandSep: "point", xaxis: "no",
    data: [["Wohnen",1050],["Ernährung",430],["Mobilität",260],["Kommunikation",85],["Freizeit & Kultur",190],["Gesundheit",110],["Kleidung",95],["Bildung",60],["Sonstiges",140]]
  },
  ausgaben_regelmaessig: {
    title: "Regelmäßige monatliche Ausgaben",
    subtitle: "Feste, planbare Ausgaben eines Musterhaushalts in Euro",
    source: "Quelle: Fiktive Beispieldaten",
    unit: "€", xlabel: "",
    chartType: "bar", labelPos: "center", showLabels: "yes", thousandSep: "point", xaxis: "no",
    data: [["Kaltmiete",820],["Strom & Gas",95],["Internet & Telefon",50],["GEZ / Rundfunk",18],["KFZ-Versicherung",74],["Krankenversicherung",120],["Lebensversicherung",85],["Ratenzahlung Kredit",210],["Abonnements",35]]
  },
  ausgaben_unregelmaessig: {
    title: "Unregelmäßige Ausgaben im Jahresverlauf",
    subtitle: "Einmalige oder saisonale Ausgaben in Euro, Beispielhaushalt",
    source: "Quelle: Fiktive Beispieldaten",
    unit: "€", xlabel: "Monat",
    chartType: "column", labelPos: "top", showLabels: "yes", thousandSep: "point", xaxis: "no",
    data: [["Jan",120],["Feb",60],["Mär",240],["Apr",85],["Mai",380],["Jun",450],["Jul",890],["Aug",320],["Sep",160],["Okt",95],["Nov",280],["Dez",740]]
  },
  ausgaben_jahresvergleich: {
    title: "Jahresausgaben im Vergleich",
    subtitle: `Gesamtausgaben nach Kategorie, ${PY} vs. ${PY - 1}, in Euro`,
    source: "Quelle: Fiktive Beispieldaten",
    unit: "€", xlabel: "",
    chartType: "bar", labelPos: "center", showLabels: "yes", thousandSep: "point", xaxis: "no",
    data: [["Wohnen",12600],["Ernährung",5160],["Mobilität",3120],["Urlaub",2800],["Gesundheit",1320],["Freizeit",2280],["Kleidung",1140],["Sonstiges",1680]]
  },

  // ── Haushaltsplan ──
  haushaltsplan_monat: {
    title: "Monatlicher Haushaltsplan",
    subtitle: "Gegenüberstellung Einnahmen und Ausgaben, Beispielhaushalt",
    source: "Quelle: Fiktive Beispieldaten",
    unit: "€", xlabel: "",
    chartType: "bar", labelPos: "center", showLabels: "yes", thousandSep: "point", xaxis: "no",
    data: [["Einnahmen gesamt",3850],["Fixkosten",1480],["Lebensmittel & Alltag",530],["Mobilität",260],["Freizeit",190],["Sonstiges",145],["Sparanteil",400],["Freies Einkommen",845]]
  },

  haushaltsplan_anteil: {
    title: "Haushaltsplan nach Ausgabenanteilen",
    subtitle: "Prozentualer Anteil der Ausgabenkategorien am Nettoeinkommen",
    source: "Quelle: Fiktive Beispieldaten",
    unit: "%", xlabel: "",
    chartType: "donut", labelPos: "inside", showLabels: "yes", thousandSep: "none", xaxis: "no",
    data: [["Wohnen",34],["Ernährung",14],["Mobilität",9],["Freizeit",6],["Versicherungen",8],["Sparanteil",10],["Sonstiges",9],["Freies Einkommen",10]]
  },

  // ── Sparen ──
  sparanteil_einkommen: {
    title: "Sparquote nach Einkommensklasse",
    subtitle: `Anteil des Einkommens der gespart wird, in Prozent, Deutschland ${PY}`,
    source: `Quelle: Fiktive Beispieldaten, ${CY}`,
    unit: "%", xlabel: "",
    chartType: "bar", labelPos: "center", showLabels: "yes", thousandSep: "none", xaxis: "no",
    data: [["unter 1.500 € netto",2.1],["1.500–2.000 €",4.8],["2.000–2.500 €",7.3],["2.500–3.500 €",11.6],["3.500–5.000 €",16.4],["über 5.000 €",24.9]]
  },
  sparanteil_ziel: {
    title: "Sparziele eines Musterhaushalts",
    subtitle: "Monatliche Sparrücklagen nach Verwendungszweck, in Euro",
    source: "Quelle: Fiktive Beispieldaten",
    unit: "€", xlabel: "",
    chartType: "pie", labelPos: "inside", showLabels: "yes", thousandSep: "point", xaxis: "no",
    data: [["Notfallreserve",100],["Altersvorsorge",150],["Urlaub",80],["Auto-Rücklage",60],["Wohneigentum",200],["Sonstige Rücklagen",50]]
  },
  sparentwicklung: {
    title: "Entwicklung des Ersparten",
    subtitle: "Kumuliertes Erspartes über 10 Jahre bei 400 €/Monat, in Euro",
    source: "Quelle: Fiktive Beispieldaten",
    unit: "€", xlabel: "Jahr",
    chartType: "line", labelPos: "top", showLabels: "yes", thousandSep: "point", xaxis: "no",
    data: [["Jahr 1",4800],["Jahr 2",9700],["Jahr 3",14900],["Jahr 4",20200],["Jahr 5",25900],["Jahr 6",32000],["Jahr 7",38500],["Jahr 8",45400],["Jahr 9",52800],["Jahr 10",60700]]
  },

  // ── Verschuldung ──
  verschuldung_arten: {
    title: "Verschuldungsarten privater Haushalte",
    subtitle: `Durchschnittliche Restschuld nach Kreditart in Euro, Deutschland ${PY}`,
    source: `Quelle: Fiktive Beispieldaten, ${CY}`,
    unit: "€", xlabel: "",
    chartType: "bar", labelPos: "center", showLabels: "yes", thousandSep: "point", xaxis: "no",
    data: [["Immobilienkredit",186000],["KFZ-Kredit",8400],["Ratenkredit (Konsum)",4200],["Dispokredit",1850],["Kreditkartenkredit",980],["Studienkredit",12600]]
  },
  verschuldung_tilgung: {
    title: "Tilgungsplan Konsumkredit",
    subtitle: "Restschuld bei 5.000 € Kredit, 5 % Zinsen, 24 Monate Laufzeit",
    source: "Quelle: Fiktive Beispieldaten",
    unit: "€", xlabel: "Monat",
    chartType: "line", labelPos: "top", showLabels: "yes", thousandSep: "point", xaxis: "no",
    data: [["M1",4800],["M2",4598],["M3",4394],["M4",4188],["M5",3980],["M6",3770],["M9",3130],["M12",2462],["M15",1773],["M18",1060],["M21",322],["M24",0]]
  },
  verschuldung_haushalt: {
    title: "Verschuldungsquote nach Haushaltstyp",
    subtitle: `Anteil verschuldeter Haushalte in Prozent, Deutschland ${PY}`,
    source: `Quelle: Fiktive Beispieldaten, ${CY}`,
    unit: "%", xlabel: "",
    chartType: "bar", labelPos: "center", showLabels: "yes", thousandSep: "none", xaxis: "no",
    data: [["Single unter 35",42],["Paar ohne Kinder",38],["Familie mit Kindern",61],["Alleinerziehend",55],["Rentnerhaushalt",18]]
  },
  verschuldung_kosten: {
    title: "Gesamtkosten eines Ratenkredits",
    subtitle: "5.000 € Kredit – Vergleich Zinskosten nach Laufzeit",
    source: "Quelle: Fiktive Beispieldaten",
    unit: "€", xlabel: "",
    chartType: "column", labelPos: "top", showLabels: "yes", thousandSep: "point", xaxis: "no",
    data: [["12 Monate",136],["24 Monate",268],["36 Monate",402],["48 Monate",541],["60 Monate",684]]
  },
  abschreibung_maschine: {
    title: "Jährliche Restbuchwerte nach linearer Abschreibung einer Maschine",
    subtitle: `Restbuchwert in Euro, Anschaffungswert 120.000 €, Nutzungsdauer 8 Jahre, ${PY}`,
    source: `Quelle: Interne Buchhaltung, ${CY}`,
    unit: "€",
    xlabel: "Jahr",
    chartType: "column",
    labelPos: "top",
    showLabels: "yes",
    thousandSep: "point",
    xaxis: "no",
    data: [["Jahr 1",105000],["Jahr 2",90000],["Jahr 3",75000],["Jahr 4",60000],["Jahr 5",45000],["Jahr 6",30000],["Jahr 7",15000],["Jahr 8",1]]
  },

  preisentwicklung_gold: {
    title: "Preisentwicklung von Edelmetallen – GOLD",
    subtitle: `Schlusskurse am Monatsende in USD pro Feinunze, ${PY}`,
    source: `Quelle: Fiktive Marktdaten / LBMA, ${CY}`,
    unit: "USD/oz",
    xlabel: "Monat",
    chartType: "line",
    labelPos: "top",
    showLabels: "yes",
    thousandSep: "point",
    xaxis: "no",
    data: [["Jan",2650],["Feb",2720],["Mär",2810],["Apr",2950],["Mai",3080],["Jun",3150],["Jul",3220],["Aug",3380],["Sep",3550],["Okt",3720],["Nov",3910],["Dez",4150]]
  },

  gewinn_unternehmen: {
    title: "Jährlicher Gewinn in unserem Unternehmen",
    subtitle: `Jahresüberschuss nach Steuern in Tsd. Euro, ${PY-4}–${PY}`,
    source: `Quelle: Interne Unternehmensstatistik, ${CY}`,
    unit: "Tsd. €",
    xlabel: "Geschäftsjahr",
    chartType: "column",
    labelPos: "top",
    showLabels: "yes",
    thousandSep: "point",
    xaxis: "no",
    data: [["2022",1840],["2023",2210],["2024",1970],["2025",2650],["2026",3120]]
  },

  beschaeftigte_unternehmen: {
    title: "Beschäftigte im Unternehmen",
    subtitle: `Mitarbeiterinnen und Mitarbeiter nach Abteilung, Stand ${CY}`,
    source: "Quelle: Interne Personalstatistik",
    unit: "Mitarbeiter",
    xlabel: "",
    chartType: "bar",
    labelPos: "center",
    showLabels: "yes",
    thousandSep: "none",
    xaxis: "no",
    data: [["Fertigung",68],["Absatz",24],["Beschaffung",12],["Verwaltung",19]]
  },

  werkstoffverbrauch: {
    title: "Werkstoffverbrauch",
    subtitle: `Anteile am Gesamtverbrauch in Prozent, Geschäftsjahr ${PY}`,
    source: `Quelle: Interne Materialwirtschaft, ${CY}`,
    unit: "%",
    xlabel: "",
    chartType: "pie",
    labelPos: "inside",
    showLabels: "yes",
    thousandSep: "none",
    xaxis: "no",
    data: [["Rohstoffe",48],["Fremdbauteile",26],["Hilfsstoffe",17],["Betriebsstoffe",9]]
  },

  rechtsformen_deutschland: {
    title: "Verteilung der Rechtsformen deutscher Unternehmen",
    subtitle: `Rechtliche Einheiten nach Rechtsform, Deutschland ${PY}`,
    source: "Quelle: Statistisches Bundesamt (Destatis), Unternehmensregister",
    unit: "%",
    xlabel: "",
    chartType: "donut",
    labelPos: "inside",
    showLabels: "yes",
    thousandSep: "none",
    xaxis: "no",
    data: [["Einzelunternehmer",58],["Kapitalgesellschaften",24],["Personengesellschaften",12],["Sonstige",6]]
  },
 };

 // ═══════════════════════════════════════════
// VORLAGEN-GRUPPEN (automatischer Dropdown)
// ═══════════════════════════════════════════
const TEMPLATE_GROUPS = {
  // Volkswirtschaft
  bip:                    "Volkswirtschaft",
  inflation:              "Volkswirtschaft",
  arbeitslosigkeit:       "Volkswirtschaft",
  rechtsformen_deutschland: "Volkswirtschaft",

  // Unternehmen
  umsatz:                 "Unternehmen",
  marktanteile:           "Unternehmen",
  kosten:                 "Unternehmen",
  gewinn_unternehmen:     "Unternehmen",
  beschaeftigte_unternehmen: "Unternehmen",

  // Controlling & Produktion
  abschreibung_maschine:  "Unternehmen",
  werkstoffverbrauch:     "Unternehmen",

  // Finanzmärkte
  preisentwicklung_gold:  "Finanzmärkte",

  // Privathaushalte
  haushalt:               "Privathaushalte",
  haushalt_familie:       "Privathaushalte",
  haushalt_student:       "Privathaushalte",
  haushalt_einnahmen:     "Privathaushalte",
  haushalt_strom:         "Privathaushalte",
  haushalt_sparen:        "Privathaushalte",
  haushalt_schulden:      "Privathaushalte",
  vermoegen:              "Privathaushalte",

  // Schule & Verein
  noten:                  "Schule & Verein",
  mitglieder:             "Schule & Verein",
  schulbuero:             "Schule & Verein",

  // Einkommen
  einkommen_netto:        "Einkommen",
  einkommen_quellen:      "Einkommen",
  einkommen_entwicklung:  "Einkommen",

  // Ausgaben
  ausgaben_kategorien:      "Ausgaben",
  ausgaben_regelmaessig:    "Ausgaben",
  ausgaben_unregelmaessig:  "Ausgaben",
  ausgaben_jahresvergleich: "Ausgaben",

  // Haushaltsplan
  haushaltsplan_monat:               "Haushaltsplan",
  haushaltsplan_anteil:              "Haushaltsplan",

  // Sparen
  sparanteil_einkommen: "Sparen",
  sparanteil_ziel:      "Sparen",
  sparentwicklung:      "Sparen",

  // Verschuldung
  verschuldung_arten:    "Verschuldung",
  verschuldung_tilgung:  "Verschuldung",
  verschuldung_haushalt: "Verschuldung",
  verschuldung_kosten:   "Verschuldung",
};

// ═══════════════════════════════════════════
// DYNAMISCHEN DROPDOWN BEFÜLLEN
// ═══════════════════════════════════════════
function populateTemplateDropdown() {
  const select = document.getElementById("inp-template");
  if (!select) return;

  // Gruppen sammeln und sortieren
  const groups = {};
  Object.keys(TEMPLATES).forEach(key => {
    const groupName = TEMPLATE_GROUPS[key] || "Sonstige";
    if (!groups[groupName]) groups[groupName] = [];
    groups[groupName].push(key);
  });

  // Optgroups erstellen
  Object.keys(groups).sort().forEach(groupName => {
    const optgroup = document.createElement("optgroup");
    optgroup.label = groupName;

    groups[groupName].forEach(key => {
      const t = TEMPLATES[key];
      const option = document.createElement("option");
      option.value = key;
      option.textContent = t.title;           // schöner Titel aus der Vorlage
      optgroup.appendChild(option);
    });

    select.appendChild(optgroup);
  });
}

function loadTemplate(key) {
  if (!key) return;
  const t = TEMPLATES[key];
  if (!t) return;

  // Felder befüllen
  document.getElementById("inp-title").value    = t.title;
  document.getElementById("inp-subtitle").value = t.subtitle;
  document.getElementById("inp-source").value   = t.source;
  document.getElementById("inp-unit").value     = t.unit;
  document.getElementById("inp-xlabel").value   = t.xlabel;
  document.getElementById("inp-charttype").value    = t.chartType;
  document.getElementById("inp-datalabel-show").value = t.showLabels;
  document.getElementById("inp-xaxis-show").value  = t.xaxis;

  // Zeichenzähler aktualisieren
  [["inp-title",80],["inp-subtitle",120],["inp-source",100],["inp-unit",30]]
    .forEach(([id, max]) => updateCharCounter(id, max));

  // Positionsoptionen und X-Achse-Sichtbarkeit aktualisieren
  updatePositionOptions();
  document.getElementById("inp-label-position").value = t.labelPos;

  // Datenpunkte neu setzen
  document.getElementById("data-rows").innerHTML = "";
  rowCount = 0;
  t.data.forEach(([l, v]) => addRow(l, v));

  document.getElementById("inp-thousand-sep").value = t.thousandSep || "point";

  // Sofort rendern
  generate();

  // Dropdown zurücksetzen
  document.getElementById("inp-template").value = "";
}


function validateField(input, minLen = 0) {
  const val   = input.value.trim();
  const errEl = document.getElementById("err-" + input.id.replace("inp-", ""));
  const ok    = val.length >= minLen;
  input.classList.toggle("invalid", !ok);
  if (errEl) errEl.classList.toggle("visible", !ok);
  return ok;
}

function updateCharCounter(inputOrId, max) {
  const el  = typeof inputOrId === "string" ? document.getElementById(inputOrId) : inputOrId;
  if (!el) return;
  const len     = el.value.length;
  const counter = document.getElementById("counter-" + el.id);
  if (!counter) return;
  counter.textContent = `${len} / ${max}`;
  counter.className   = "ig-char-counter" + (len >= max ? " over" : len >= max * 0.85 ? " warn" : "");
}

function validateDataRow(row) {
  const inputs  = row.querySelectorAll("input");
  const labelIn = inputs[0];
  const valueIn = inputs[1];
  const label   = labelIn.value.trim();
  const val     = valueIn.value.trim();
  let ok = true;

  // Bezeichnung: max 40 Zeichen, kein HTML, nicht leer wenn Wert gesetzt
  const labelOk = label.length > 0 && label.length <= 40 && !containsHtml(label);
  labelIn.classList.toggle("invalid", !labelOk);
  if (!labelOk) ok = false;

  // Wert: gültige Zahl wenn Bezeichnung gesetzt
  const valOk = label === "" || isValidNumber(val);
  valueIn.classList.toggle("invalid", !valOk);
  if (!valOk) ok = false;

  return ok;
}

function validateAll() {
  let ok = true;

  // Titel Pflichtfeld
  const titleInput = document.getElementById("inp-title");
  if (!validateField(titleInput, 1)) ok = false;

  // Datenpunkte
  const rows = document.querySelectorAll("#data-rows .ig-data-row");
  if (rows.length === 0) {
    alert("Bitte mindestens einen Datenpunkt eingeben.");
    return false;
  }
  let validRows = 0;
  rows.forEach(row => {
    if (validateDataRow(row)) validRows++;
  });
  if (validRows === 0) {
    ok = false;
  }

  return ok && validRows > 0;
}


function niceScale(maxVal, headroomFactor = 1.0, targetTicks = 5) {
  const raw  = maxVal * headroomFactor;
  const mag  = Math.pow(10, Math.floor(Math.log10(raw / targetTicks)));
  const norm = (raw / targetTicks) / mag;
  let step;
  if      (norm <= 1)  step = 1;
  else if (norm <= 2)  step = 2;
  else if (norm <= 2.5) step = 2.5;
  else if (norm <= 5)  step = 5;
  else                 step = 10;
  step *= mag;
  const niceMax   = Math.ceil(raw / step) * step;
  const tickAmount = Math.round(niceMax / step);
  return { niceMax, tickAmount, step };
}

// ═══════════════════════════════════════════
// HILFSFUNKTION: Bar-Labels manuell außen rechts zeichnen
// ═══════════════════════════════════════════
function renderBarLabelsOutside(chartCtx, values, fmtVal, labelColor) {
  setTimeout(() => {
    const container = document.getElementById("ig-chart-container");
    const svg = container.querySelector("svg");
    if (!svg) return;

    svg.querySelectorAll(".manual-bar-label").forEach(el => el.remove());

    // ApexCharts rendert horizontale Balken als <path> mit Index-Attribut "i" und "j"
    // Selektor: paths mit j="0" (erster/einziger Datensatz) sortiert nach i (Kategorieindex)
    let paths = Array.from(svg.querySelectorAll("path[j='0']")).filter(p => {
      try { const bb = p.getBBox(); return bb.width > 0 && bb.height > 0; } catch(e) { return false; }
    });

    // Fallback: alle paths innerhalb .apexcharts-bar-area
    if (!paths.length) {
      svg.querySelectorAll(".apexcharts-bar-area").forEach(g => {
        g.querySelectorAll("path").forEach(p => {
          try { const bb = p.getBBox(); if (bb.width > 0) paths.push(p); } catch(e) {}
        });
      });
    }

    if (!paths.length) return;

    // Sortiere nach i-Attribut (Kategorieindex 0,1,2…) falls vorhanden, sonst nach Y
    paths.sort((a, b) => {
      const ai = parseInt(a.getAttribute("i") ?? "999");
      const bi = parseInt(b.getAttribute("i") ?? "999");
      if (ai !== bi) return ai - bi;
      try { return a.getBBox().y - b.getBBox().y; } catch(e) { return 0; }
    });

    paths.forEach((path, i) => {
      if (i >= values.length) return;
      let bb;
      try { bb = path.getBBox(); } catch(e) { return; }

      const x = bb.x + bb.width + 8;
      const y = bb.y + bb.height / 2 + 4;

      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", x);
      text.setAttribute("y", y);
      text.setAttribute("font-family", "Georgia, serif");
      text.setAttribute("font-size", "12");
      text.setAttribute("fill", labelColor);
      text.setAttribute("class", "manual-bar-label");
      text.textContent = fmtVal(values[i]);
      svg.appendChild(text);
    });
  }, 150);
}

// ═══════════════════════════════════════════
// CHART GENERIEREN
// ═══════════════════════════════════════════
function generate() {
// Texteingaben sanitisieren (HTML entfernen)
const title    = sanitizeText(document.getElementById("inp-title").value);
const subtitle = sanitizeText(document.getElementById("inp-subtitle").value);
const source   = sanitizeText(document.getElementById("inp-source").value);
const unit     = sanitizeText(document.getElementById("inp-unit").value);
const xlabel   = sanitizeText(document.getElementById("inp-xlabel").value);
  const chartType    = document.getElementById("inp-charttype").value;
  const showLabels   = document.getElementById("inp-datalabel-show").value === "yes";
  const labelColor   = document.getElementById("inp-label-color").value;
  const labelPos     = document.getElementById("inp-label-position").value;
  const xAxisShowSel   = document.getElementById("inp-xaxis-show").value;
  const thousandSep    = document.getElementById("inp-thousand-sep").value;
  if (!validateAll()) return;
  const { labels, values } = getDataPoints();
  if (!labels.length) return;

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    el.style.display = val ? "" : "none";
    el.textContent   = val;
  };
  setEl("ig-out-title",    title);
  setEl("ig-out-subtitle", subtitle);
  setEl("ig-out-source",   source ? "📊 " + source : "");
  document.getElementById("ig-chart-footer").style.display = (source || unit) ? "flex" : "none";
  document.getElementById("ig-placeholder").style.display  = "none";
  document.getElementById("ig-export-bar").style.display   = "flex";

  if (currentChart) { currentChart.destroy(); currentChart = null; }
  document.getElementById("ig-chart-container").innerHTML = "";

  const colors   = COLOR_SCHEMES[activeScheme].colors;
  const isPie    = chartType === "pie" || chartType === "donut";
  const formatNum = v => {
    const n = Number(v);
    if (thousandSep === "none") {
      // Keine Tausendertrennung, aber Dezimalkomma beibehalten
      return n % 1 === 0 ? String(Math.round(n)) : n.toLocaleString("de-DE", { useGrouping: false });
    }
    const base = n.toLocaleString("de-DE"); // z.B. "25.463" oder "1.234,5"
    if (thousandSep === "space") {
      // Punkt → Leerzeichen als Tausendertrennzeichen
      return base.replace(/\./g, " "); // schmales geschütztes Leerzeichen
    }
    return base; // "point" = Standard de-DE mit Punkt
  };
  const fmtVal = v => unit ? `${formatNum(v)} ${unit}` : formatNum(v);

  // Auto-Schriftfarbe nur bei Balken, Pie und Donut
  const isAutoColor      = document.getElementById("inp-label-auto").checked;
  const labelColorManual = document.getElementById("inp-label-color").value;
  const supportsAuto     = chartType === "bar" || chartType === "pie" || chartType === "donut";

  // Für Linien/Säulen: immer manuelle Farbe (Standard #333), kein Auto
  const singleLabelColor = (isAutoColor && supportsAuto) ? contrastColor(colors[0]) : labelColorManual;
  // multi-color (pie, donut, column distributed): Kontrast je Farbe oder manuell
  const multiLabelColors = (isAutoColor && supportsAuto)
    ? autoLabelColors(colors.slice(0, values.length))
    : values.map(() => labelColorManual);

  const dlBase = {
    enabled:   showLabels,
    formatter: fmtVal,
    style:     { fontSize:"14px", colors:[singleLabelColor], fontFamily:"Georgia, serif" }
  };

  const toolbar = { show:true, tools:{ download:false, zoom:true, zoomin:true, zoomout:true, pan:true, reset:true } };
  let opts;

  // ── PIE / DONUT ──
  if (isPie) {
    opts = {
      chart:  { type: chartType === "donut" ? "donut" : "pie", height:420, toolbar, fontFamily:"Georgia, serif" },
      series: values,
      labels,
      colors: colors.slice(0, values.length),
      legend: { position:"bottom", fontSize:"13px" },
      dataLabels: {
        enabled:    showLabels,
        formatter:  (pct, w) => fmtVal(values[w.seriesIndex]),
        style:      { fontSize:"14px", colors: multiLabelColors, fontFamily:"Georgia, serif" },
        dropShadow: { enabled: false }
      },
      plotOptions: {
        pie: {
          ...(chartType === "donut" ? { donut:{ size:"55%" } } : {}),
          dataLabels: { offset: 0, minAngleToShowLabel: 5 },
          expandOnClick: false
        }
      },
      tooltip: { y:{ formatter: fmtVal } }
    };

  // ── BALKEN (horizontal) ──
  } else if (chartType === "bar") {
    const showXAxis = xAxisShowSel === "yes";

    // labelPos: "bottom"=Am Start (innen), "center"=Mitte (innen)
    const dlOffsetX    = labelPos === "bottom" ? 8 : 0;
    const dlTextAnchor = labelPos === "bottom" ? "start" : "middle";
    const barLabelColor = (isAutoColor && supportsAuto) ? contrastColor(colors[0]) : labelColorManual;

    opts = {
      chart:  { type:"bar", height: Math.max(300, labels.length * 52), toolbar, fontFamily:"Georgia, serif" },
      series: [{ name: unit || "Wert", data: values }],
      plotOptions: { bar: { horizontal: true, borderRadius: 3, dataLabels: { position: labelPos } } },
      xaxis:  { categories: labels, labels:{ show: showXAxis, formatter: fmtVal },
                axisBorder:{ show: showXAxis }, axisTicks:{ show: showXAxis },
                title:{ text: showXAxis ? xlabel : "" }, min: 0 },
      yaxis:  { labels:{ style:{ fontSize:"13px" } } },
      colors: [colors[0]],
      dataLabels: {
        enabled: showLabels,
        formatter: fmtVal,
        offsetX: dlOffsetX,
        textAnchor: " " + dlTextAnchor,
        style: { fontSize:"12px", colors:[barLabelColor], fontFamily:"Georgia, serif", fontWeight:"normal" },
        dropShadow: { enabled: false },
        background: { enabled: false }
      },
      grid:   { xaxis:{ lines:{ show: showXAxis } }, yaxis:{ lines:{ show:true } } },
      tooltip:{ y:{ formatter: fmtVal } }
    };

  // ── SÄULEN (vertikal) ──
  } else if (chartType === "column") {
    const apexColPos = labelPos === "top" ? "top" : labelPos === "center" ? "center" : "bottom";
    const colOffsetY = apexColPos === "top" ? -22 : apexColPos === "bottom" ? 20 : 0;
    const { niceMax: colMax, tickAmount: colTicks } = niceScale(Math.max(...values), apexColPos === "top" ? 1.15 : 1.0);
    opts = {
      chart:  { type:"bar", height:420, toolbar, fontFamily:"Georgia, serif" },
      series: [{ name: unit || "Wert", data: values }],
      plotOptions: { bar:{ horizontal:false, borderRadius:3, columnWidth:"55%",
                           distributed: values.length > 1, dataLabels:{ position: apexColPos } } },
      xaxis:  { categories: labels, title:{ text: xlabel } },
      yaxis:  { min: 0, max: colMax, tickAmount: colTicks, labels:{ formatter: fmtVal } },
      colors: values.length > 1 ? colors.slice(0, values.length) : [colors[0]],
      legend: { show:false },
      dataLabels: { ...dlBase, offsetY: colOffsetY,
                    style:{ fontSize:"12px", colors: values.length > 1 ? multiLabelColors : [singleLabelColor], fontFamily:"Georgia, serif" } },
      tooltip:{ y:{ formatter: fmtVal } }
    };

  // ── LINIE ──
  } else if (chartType === "line") {
    const { niceMax: lineMax, tickAmount: lineTicks } = niceScale(Math.max(...values), 1.1);
    opts = {
      chart:  { type:"line", height:420, toolbar, fontFamily:"Georgia, serif" },
      series: [{ name: unit || "Wert", data: values }],
      stroke: { curve:"smooth", width:3 },
      markers:{ size:6, strokeWidth:2, hover:{ size:8 } },
      xaxis:  { categories: labels, title:{ text: xlabel } },
      yaxis:  { min: 0, max: lineMax, tickAmount: lineTicks, labels:{ formatter: fmtVal } },
      colors: [colors[0]],
      dataLabels: { ...dlBase, offsetY: labelPos === "bottom" ? 18 : -12 },
      grid:   { row:{ colors:["#f9f9f9","transparent"], opacity:.4 } },
      tooltip:{ y:{ formatter: fmtVal } }
    };
  }

  currentChart = new ApexCharts(document.getElementById("ig-chart-container"), opts);
  currentChart.render();
   populateTemplateDropdown();
}

// Start
document.addEventListener("DOMContentLoaded", infografik_init);