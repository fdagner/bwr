// ============================================================================
// PROZENTRECHNEN – DIAGRAMM-AUFGABEN GENERATOR
// Alle Prozentwerte ganzzahlig – rückwärts konstruiert
// Familienname per Input änderbar
// ============================================================================

// ── Familienname ─────────────────────────────────────────────────────────────
let FAMILIENNAME = "Müller";

function getFamilienname() {
  const inp = document.getElementById("familiennameInput");
  return inp && inp.value.trim() ? inp.value.trim() : FAMILIENNAME;
}

// ── Hilfsfunktionen ──────────────────────────────────────────────────────────
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CURRENT_YEAR = new Date().getFullYear();

function genJahresreihe(n) {
  return Array.from({ length: n }, (_, i) => CURRENT_YEAR - (n - 1 - i));
}

// ============================================================================
// GEMEINSAME STYLE-KONSTANTEN
// ============================================================================

const TOOLBAR = {
  show: true,
  tools: {
    download: true,
    zoom: true,
    zoomin: true,
    zoomout: true,
    pan: false,
    reset: true,
  },
};

// Achsentitel-Style (einheitlich für alle Diagramme)
const AXIS_TITLE_STYLE = {
  fontSize: '16px',
  fontFamily: 'Helvetica, Arial, sans-serif',
  fontWeight: 600,
  color: '#263238'
};

// Achsen-Label-Style (Werte/Kategorien auf den Achsen)
const AXIS_LABEL_STYLE = {
  style: {
    fontSize: '14px',
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: 500,
    colors: '#333'
  }
};

// Datenlabel-Style für Liniendiagramme
const DATALABEL_LINE_STYLE = {
  fontSize: '14px',
  fontFamily: 'Helvetica, Arial, sans-serif',
  fontWeight: 600,
};

// Datenlabel-Style für Säulen-/Balkendiagramme (weiß auf farbigem Hintergrund)
const DATALABEL_BAR_STYLE = {
  fontSize: '16px',
  fontFamily: 'Helvetica, Arial, sans-serif',
  fontWeight: 200,
  colors: ['#fff']
};

// Grid-Einstellungen (einheitlich für alle Diagramme)
const GRID_CONFIG = {
  padding: {
    right: 50,
    left: 10,
  },
  show: true,
  borderColor: '#e5e7eb',
  position: 'back',
  xaxis: {
    lines: { show: true, opacity: 0.35, width: 1 }
  },
  yaxis: {
    lines: { show: true, opacity: 0.35, width: 1 }
  }
};

// Stroke für Liniendiagramme
const LINE_STROKE = { curve: "smooth", width: 3 };
const LINE_MARKERS = { size: 6 };

// ============================================================================
// AUFGABEN-GENERATOREN
// ============================================================================

const aufgabenThemen = [
  {
    label: "Heizkosten (Okt–Apr)",
    icon: "🔥",
    gen: () => {
      const name = getFamilienname();
      const monate = ["Okt", "Nov", "Dez", "Jan", "Feb", "Mär", "Apr"];
      const basisSets = [
        [200, 300, 400, 400, 500, 300, 200],
        [200, 300, 500, 400, 600, 400, 200],
        [300, 400, 500, 400, 500, 400, 300],
        [200, 400, 500, 400, 500, 300, 200],
        [300, 400, 600, 500, 600, 400, 300],
        [200, 300, 500, 500, 600, 400, 200],
        [300, 400, 500, 500, 450, 300, 200],
        [200, 400, 600, 400, 300, 200, 200],
      ];
      const werte = pick(basisSets);

      const basis = werte[3];
      const end = werte[4];
      const diff = end - basis;
      const prozent = Math.round((diff / basis) * 100);
      const gesamt = werte.reduce((a, b) => a + b, 0);
      const prozJan = Math.round((werte[3] / gesamt) * 100);

      return {
        kontext: `Familie ${name} – Heizkosten aktuelle Heizperiode`,
        chartOptions: {
          chart: { type: "line", height: 400, width: 650, toolbar: TOOLBAR },
          series: [{ name: "Heizkosten (€)", data: werte }],
          xaxis: {
            categories: monate,
            title: { text: "Heizperiode", style: AXIS_TITLE_STYLE },
            labels: AXIS_LABEL_STYLE
          },
          yaxis: {
            title: { text: "Kosten in €", style: AXIS_TITLE_STYLE },
            min: 0,
            tickAmount: 6,
            labels: AXIS_LABEL_STYLE
          },
          stroke: LINE_STROKE,
          markers: LINE_MARKERS,
          colors: ["#E65100"],
          title: {
            text: `Heizkosten Familie ${name} – aktuelle Heizperiode`,
            align: "left",
          },
          grid: GRID_CONFIG,
          dataLabels: {
            enabled: true,
            formatter: (v) => v + " €",
            offsetX: 12,
            style: { ...DATALABEL_LINE_STYLE, colors: ["#E65100"] },
          },
        },
        aufgaben: [
          {
            text: `Nenne die vorliegende Diagrammart. Erkläre, warum sie hier verwendet wird.`,
            loesung: `Es handelt sich um ein <strong>Liniendiagramm</strong>. Es zeigt den Verlauf der monatlichen Heizkosten über die gesamte Heizperiode.`,
          },
          {
            text: `Berechne die absolute Veränderung der Heizkosten von Januar auf Februar.`,
            loesung: `Januar: <strong>${basis} €</strong> &nbsp;|&nbsp; Februar: <strong>${end} €</strong><br>
            Absolute Veränderung: ${end} − ${basis} = <strong>${diff > 0 ? "+" : ""}${diff} €</strong>`,
          },
          {
            text: `Berechne die relative Veränderung der Heizkosten von Januar auf Februar in Prozent.`,
            loesung: `(${end} − ${basis}) ÷ ${basis} × 100<br>
            = ${diff} ÷ ${basis} × 100 = <strong>${prozent > 0 ? "+" : ""}${prozent} %</strong><br>
            Die Heizkosten sind von Januar auf Februar um <strong>${Math.abs(prozent)} %</strong> ${prozent >= 0 ? "gestiegen" : "gesunken"}.`,
          },
        ],
      };
    },
  },

  {
    label: "Monatliche Konsumausgaben",
    icon: "🛒",
    gen: () => {
      const name = getFamilienname();
      const kategorien = ["Lebensmittel", "Wohnen", "Freizeit", "Kleidung", "Verkehr"];
      const gesamt = pick([1800, 2000, 2400, 2800, 3000, 3200]);
      const anteilSets = [
        [25, 40, 15, 10, 10],
        [30, 35, 10, 10, 15],
        [25, 45, 10, 5, 15],
        [20, 40, 15, 10, 15],
        [30, 30, 10, 15, 15],
        [25, 35, 15, 10, 15],
        [15, 50, 15, 10, 10],
      ];
      const anteile = pick(anteilSets);
      const werte = anteile.map((a) => (gesamt * a) / 100);
      const idx = Math.floor(Math.random() * kategorien.length);
      const fragenKat = kategorien[idx];
      const fragenWert = werte[idx];
      const fragenProz = anteile[idx];

      return {
        kontext: `Familie ${name} – Monatliche Konsumausgaben (aktuelles Jahr)`,
        chartOptions: {
          chart: { type: "bar", height: 300, toolbar: TOOLBAR },
          series: [{ name: "Ausgaben (€)", data: werte }],
          xaxis: {
            categories: kategorien,
            labels: AXIS_LABEL_STYLE
          },
          yaxis: {
            title: { text: "Betrag in €", style: AXIS_TITLE_STYLE },
            labels: AXIS_LABEL_STYLE
          },
          colors: ["#1565C0"],
          plotOptions: { bar: { borderRadius: 1, columnWidth: "55%" } },
          title: {
            text: `Monatliche Ausgaben Familie ${name} (aktuelles Jahr)`,
            align: "left",
          },
          grid: GRID_CONFIG,
          dataLabels: {
            enabled: true,
            formatter: (v) => v + " €",
            offsetY: 5,
            style: DATALABEL_BAR_STYLE
          },
        },
        aufgaben: [
          {
            text: `Nenne die vorliegende Diagrammart. Erkläre, warum sie hier verwendet wird.`,
            loesung: `Es handelt sich um ein <strong>Säulendiagramm</strong>. Es eignet sich zum Vergleich verschiedener Kategorien – hier der monatlichen Ausgaben der Familie ${name} in verschiedenen Bereichen.`,
          },
          {
            text: `Addiere alle Ausgaben und berechne die gesamten monatlichen Ausgaben der Familie ${name}.`,
            loesung: `${werte.join(" + ")} = <strong>${gesamt} €</strong> pro Monat`,
          },
          {
            text: `Berechne, wie viel Prozent die Ausgaben für ${fragenKat} am Gesamtbudget ausmachen.`,
            loesung: `${fragenWert} ÷ ${gesamt} × 100 = <strong>${fragenProz} %</strong><br>
        ${fragenKat} macht <strong>${fragenProz} %</strong> der monatlichen Ausgaben aus.`,
          },
        ],
      };
    },
  },

  {
    label: "Urlaubsangebote vergleichen",
    icon: "✈️",
    gen: () => {
      const name = getFamilienname();
      const reiseziele = ["Mallorca", "Türkei", "Italien", "Kroatien", "Griechenland"];
      const shuffledZiele = shuffle(reiseziele).slice(0, 5);

      const gv = pick([2500, 3000, 4500]);
      const p = pick([10, 20, 25, 50, 75, 100]);
      const tv = gv + (gv * p) / 100;
      const span = tv - gv;
      const mitte = [1, 2, 3].map(
        (i) => Math.round((gv + (span * i) / 4) / 100) * 100
      );

      const allePreise = [gv, ...mitte, tv];
      const kombiniert = allePreise
        .map((v, i) => ({ v, name: shuffledZiele[i] }))
        .sort((a, b) => b.v - a.v);

      const sortedNamen = kombiniert.map((x) => x.name);
      const sortedWerte = kombiniert.map((x) => x.v);
      const teuerstes = sortedNamen[0];
      const guenstigstes = sortedNamen[sortedNamen.length - 1];
      const topV = sortedWerte[0];
      const lowV = sortedWerte[sortedWerte.length - 1];
      const diff = topV - lowV;
      const prozDiff = Math.round((diff / lowV) * 100);

      return {
        kontext: `Familie ${name} vergleicht Urlaubsangebote, Pauschalreise 2 Personen`,
        chartOptions: {
          chart: { type: "bar", height: 300, toolbar: TOOLBAR },
          series: [{ name: "Preis (€)", data: sortedWerte }],
          xaxis: {
            categories: sortedNamen,
            title: { text: "Preis in €", style: AXIS_TITLE_STYLE },
            labels: AXIS_LABEL_STYLE
          },
          yaxis: {
            labels: AXIS_LABEL_STYLE
          },
          plotOptions: {
            bar: { horizontal: true, borderRadius: 4, barHeight: "80%" },
          },
          colors: ["#2E7D32"],
          title: {
            text: `Familie ${name} – Urlaubspreise im Vergleich`,
            align: "left",
          },
          grid: GRID_CONFIG,
          dataLabels: {
            enabled: true,
            formatter: (v) => v + " €",
            offsetX: 8,
            style: DATALABEL_BAR_STYLE,
            background: {
              enabled: true,
              foreColor: '#000000',
              padding: 5,
              borderRadius: 4,
              borderWidth: 1,
              opacity: 0.9
            }
          },
        },
        aufgaben: [
          {
            text: `Nenne die vorliegende Diagrammart. Erkläre, warum sie hier verwendet wird.`,
            loesung: `Es handelt sich um ein <strong>Balkendiagramm</strong>. Es stellt eine Rangliste der Urlaubsziele nach Preis dar – Familie ${name} kann auf einen Blick erkennen, welches Reiseziel am teuersten und welches am günstigsten ist.`,
          },
          {
            text: `Bestimme den Preis für ${teuerstes} und ${guenstigstes}. Berechne die absolute Preisdifferenz.`,
            loesung: `${teuerstes}: <strong>${topV} €</strong> &nbsp;|&nbsp; ${guenstigstes}: <strong>${lowV} €</strong><br>
            Differenz: ${topV} − ${lowV} = <strong>${diff} €</strong>`,
          },
          {
            text: `Berechne, um wie viel Prozent ${teuerstes} teurer im Vergleich zu ${guenstigstes} ist.`,
            loesung: `(${topV} − ${lowV}) ÷ ${lowV} × 100<br>
            = ${diff} ÷ ${lowV} × 100 = <strong>${prozDiff} %</strong>`,
          },
        ],
      };
    },
  },

  {
    label: "Jährliche Zinseinnahmen",
    icon: "🏦",
    gen: () => {
      const name = getFamilienname();
      const jahre = genJahresreihe(5);

      const konfigurationen = [
        { startKap: 500,  sparrate: 500,  zinssatz: 5,  werte: [25, 50, 150, 100, 150],   p: 50 },
        { startKap: 500,  sparrate: 500,  zinssatz: 10, werte: [50, 100, 100, 200, 250],  p: 25 },
        { startKap: 1000, sparrate: 500,  zinssatz: 5,  werte: [75, 50, 100, 125, 150],   p: 20 },
        { startKap: 1000, sparrate: 500,  zinssatz: 10, werte: [150, 150, 200, 250, 150], p: -40 },
        { startKap: 1000, sparrate: 1000, zinssatz: 5,  werte: [150, 100, 50, 200, 150],  p: -25 },
        { startKap: 1000, sparrate: 1000, zinssatz: 10, werte: [100, 200, 100, 400, 500], p: 25 },
        { startKap: 2000, sparrate: 1000, zinssatz: 5,  werte: [100, 150, 150, 250, 300], p: 20 },
        { startKap: 2000, sparrate: 1000, zinssatz: 10, werte: [350, 300, 200, 500, 450], p: -10 },
      ];
      const config = pick(konfigurationen);
      const { startKap, zinssatz } = config;
      const werte = config.werte;
      const basis = werte[3];
      const end = werte[4];
      const diff = end - basis;
      const prozent = config.p;

      return {
        kontext: `Familie ${name} – Jährliche Zinseinnahmen`,
        chartOptions: {
          chart: { type: "line", height: 300, width: 650, toolbar: TOOLBAR },
          series: [{ name: "Zinseinnahmen (€)", data: werte }],
          xaxis: {
            categories: jahre,
            title: { text: "Jahr", style: AXIS_TITLE_STYLE },
            labels: AXIS_LABEL_STYLE
          },
          yaxis: {
            title: { text: "Zinseinnahmen in €", style: AXIS_TITLE_STYLE },
            min: 0,
            tickAmount: 5,
            labels: AXIS_LABEL_STYLE
          },
          stroke: LINE_STROKE,
          markers: LINE_MARKERS,
          colors: ["#6A1B9A"],
          title: {
            text: `Jährliche Zinseinnahmen Familie ${name}`,
            align: "left",
          },
          grid: GRID_CONFIG,
          dataLabels: {
            enabled: true,
            formatter: (v) => v + " €",
            offsetX: 12,
            style: { ...DATALABEL_LINE_STYLE, colors: ["#6A1B9A"] },
          },
        },
        aufgaben: [
          {
            text: `Nenne die vorliegende Diagrammart. Erkläre, warum sie hier verwendet wird.`,
            loesung: `Es handelt sich um ein <strong>Liniendiagramm</strong>. Es zeigt den zeitlichen Verlauf der jährlichen Zinseinnahmen der Familie ${name}.`,
          },
          {
            text: `Bestimme die Zinseinnahmen für ${jahre[3]} und ${jahre[4]}. Berechne die absolute Veränderung.`,
            loesung: `${jahre[3]}: <strong>${basis} €</strong> &nbsp;|&nbsp; ${jahre[4]}: <strong>${end} €</strong><br>
            Veränderung: ${end} − ${basis} = <strong>+${diff} €</strong>`,
          },
          {
            text: `Berechne die prozentuale Steigerung der Zinseinnahmen von ${jahre[3]} auf ${jahre[4]}.`,
            loesung: `(${end} − ${basis}) ÷ ${basis} × 100<br>
            = ${diff} ÷ ${basis} × 100 = <strong>${prozent} %</strong>`,
          },
        ],
      };
    },
  },

  {
    label: "Energieverbrauch nach Monaten",
    icon: "⚡",
    gen: () => {
      const name = getFamilienname();
const energieSets = [
  {
    monate: ["Januar", "Februar", "März", "April", "Mai"],
    werte: [400, 300, 100, 100, 200],
  },
  {
    monate: ["Januar", "Februar", "März", "April", "Mai"],
    werte: [300, 100, 200, 200, 200],
  },
  {
    monate: ["Januar", "Februar", "März", "April", "Mai"],
    werte: [400, 200, 100, 200, 100],
  },
  {
    monate: ["Januar", "Februar", "März", "April", "Mai"],
    werte: [300, 200, 100, 200, 100],
  },
  {
    monate: ["Januar", "Februar", "März", "April", "Mai"],
    werte: [400, 300, 100, 200, 200],
  },
  {
    monate: ["Januar", "Februar", "März", "April", "Mai"],
    werte: [300, 400, 100, 200, 200],
  },
  {
    monate: ["Januar", "Februar", "März", "April", "Mai"],
    werte: [400, 300, 100, 100, 200],
  },
  {
    monate: ["Januar", "Februar", "März", "April", "Mai"],
    werte: [300, 400, 100, 200, 200],
  },
];
      const ds = pick(energieSets);
      const monate = ds.monate;
      const werte = ds.werte;

      const maxV = Math.max(...werte);
      const minV = Math.min(...werte);
      const maxMon = monate[werte.indexOf(maxV)];
      const minMon = monate[werte.indexOf(minV)];
      const diff = maxV - minV;
      const p = Math.round((diff / minV) * 100);

      return {
        kontext: `Familie ${name} – Monatlicher Energieverbrauch`,
        chartOptions: {
          chart: { type: "bar", height: 300, toolbar: TOOLBAR },
          series: [{ name: "Verbrauch (kWh)", data: werte }],
          xaxis: {
            categories: monate,
            title: { text: `Monate`, style: AXIS_TITLE_STYLE },
            labels: AXIS_LABEL_STYLE
          },
          yaxis: {
            title: { text: "Verbrauch in kWh", style: AXIS_TITLE_STYLE },
            min: 0,
            labels: AXIS_LABEL_STYLE
          },
          colors: ["#00838F"],
          plotOptions: { bar: { borderRadius: 4, columnWidth: "60%" } },
          title: {
            text: `Energieverbrauch Familie ${name}`,
            align: "left",
          },
          grid: GRID_CONFIG,
          dataLabels: {
            enabled: true,
            formatter: (v) => v + " kWh",
            offsetY: 5,
            style: DATALABEL_BAR_STYLE
          },
        },
        aufgaben: [
          {
            text: `Nenne die vorliegende Diagrammart. Erkläre, warum sie hier verwendet wird.`,
            loesung: `Es handelt sich um ein <strong>Säulendiagramm</strong>. Es vergleicht den Energieverbrauch verschiedener Monate und zeigt, in welchem Monat Familie ${name} am meisten bzw. am wenigsten Energie verbraucht.`,
          },
          {
            text: `Bestimme den Energieverbrauch für ${maxMon} und im ${minMon} ab. Berechne die absolute Differenz.`,
            loesung: `${maxMon}: <strong>${maxV} kWh</strong> &nbsp;|&nbsp; ${minMon}: ${minV} kWh<br>
            Differenz: ${maxV} − ${minV} = <strong>${diff} kWh</strong>`,
          },
          {
            text: `Berechne, um wie viel Prozent der Verbrauch im ${maxMon} höher ist im Vergleich zum ${minMon}.`,
            loesung: `(${maxV} − ${minV}) ÷ ${minV} × 100<br>
            = ${diff} ÷ ${minV} × 100 = <strong>${p} %</strong>`,
          },
        ],
      };
    },
  },

];

// ============================================================================
// DIAGRAMM RENDERN – genau 1 Aufgabenblock
// ============================================================================

let renderedCharts = [];

function getSelectedGenerator() {
  const sel = document.getElementById("themaSelect");
  const val = sel ? parseInt(sel.value) : -1;
  if (val >= 0 && val < aufgabenThemen.length) {
    return aufgabenThemen[val];
  }
  return pick(aufgabenThemen);
}

function zeigeZufaelligeProzentAufgaben() {
  renderedCharts.forEach(c => { try { c.destroy(); } catch (e) { } });
  renderedCharts = [];

  const container = document.getElementById("Container");
  if (!container) return;
  container.innerHTML = "";

  const chartWrapper = document.createElement("div");
  chartWrapper.id = "current-chart-wrapper";
  chartWrapper.style.cssText = `
    margin: 0 auto 1.5rem auto;
    max-width: 900px;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
    overflow: hidden;
    background: white;
    box-shadow: 0 3px 10px rgba(0,0,0,0.07);
  `;

  const oldWrapper = document.getElementById("current-chart-wrapper");
  if (oldWrapper) oldWrapper.remove();

  const chartHeader = document.createElement("div");
  chartHeader.style.cssText = `
    padding: 16px 20px;
    background: #f8f9fa;
    border-bottom: 1px solid #e9ecef;
    font-weight: bold;
    font-size: 1.25rem;
  `;

  const thema = getSelectedGenerator();
  const aufgabe = thema.gen();

  chartHeader.innerHTML = `<h2>Diagramm</h2>`;
  chartWrapper.appendChild(chartHeader);

  const chartDivWrapper = document.createElement("div");
  chartDivWrapper.style.padding = "20px";
  const chartId = `chart-${Date.now()}`;
  const chartDiv = document.createElement("div");
  chartDiv.id = chartId;
  chartDivWrapper.appendChild(chartDiv);
  chartWrapper.appendChild(chartDivWrapper);

  container.parentNode.insertBefore(chartWrapper, container);

  const aufgabenSection = document.createElement("div");
  aufgabenSection.style.cssText = `
    padding: 20px;
    background: white;
    border-radius: 8px;
    margin-bottom: 1.5rem;
  `;

  aufgabenSection.innerHTML = `
    <h2 style="margin-top:0;">Aufgaben</h2>
    <ol style="padding-left: 1.6rem; line-height: 1.6;">
      ${aufgabe.aufgaben.map(a => `<li>${a.text}</li>`).join("")}
    </ol>
  `;

  const loesungenSection = document.createElement("div");
  loesungenSection.style.cssText = `padding: 20px;`;

  let loesHtml = `<h2 style="margin-top:0;">Lösung</h2>`;
  aufgabe.aufgaben.forEach((a, i) => {
    loesHtml += `
      <div style="
        background: white;
        border: 1px solid #ddd;
        border-radius: 6px;
        padding: 14px;
        margin-bottom: 12px;
      ">
        <strong>Aufgabe ${i + 1}:</strong><br>
        ${a.loesung}
      </div>
    `;
  });
  loesungenSection.innerHTML = loesHtml;

  container.appendChild(aufgabenSection);
  container.appendChild(loesungenSection);

  setTimeout(() => {
    const exportName = (aufgabe.chartOptions.title?.text || "prozentrechnung")
      .replace(/[^a-zA-Z0-9_-äöüÄÖÜß]/g, "_")
      .replace(/__+/g, "_");

    const chartOptions = {
      ...aufgabe.chartOptions,
      chart: {
        ...aufgabe.chartOptions.chart,
        toolbar: {
          ...TOOLBAR,
          export: {
            csv: { filename: exportName },
            svg: { filename: exportName },
            png: { filename: exportName }
          }
        }
      }
    };

    const chart = new ApexCharts(document.getElementById(chartId), chartOptions);
    chart.render();
    renderedCharts.push(chart);
  }, 50);
}


// ============================================================================
// KI-ASSISTENT
// ============================================================================

const KI_ASSISTENT_PROMPT_PROZ = `
Du bist ein freundlicher Mathematik- und Wirtschaftsassistent für Schüler der Realschule (BwR, Klasse 8). Du hilfst beim Verständnis von Prozentrechnung anhand von Diagrammen aus dem Haushalt.

Aufgabe:
- Gib KEINE fertigen Lösungen vor.
- Führe die Schüler durch gezielte Fragen zur richtigen Lösung.
- Ziel: Förderung von Diagrammkompetenz und Prozentkompetenz.

Pädagogischer Ansatz (Sokratische Methode):
- Frage zunächst, welche Werte der Schüler aus dem Diagramm abgelesen hat.
- Frage dann, welche Formel für Prozentrechnung passt.
- Beantworte deine Rückfragen NICHT selbst.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Erst wenn der Schüler selbst auf eine begründete Antwort kommt, bestätige ihn.

Die drei Diagrammarten:
1. Liniendiagramm → zeigt zeitlichen Verlauf (z. B. Heizkosten, Zinseinnahmen, Preise)
2. Säulendiagramm → vergleicht verschiedene Kategorien (z. B. Ausgaben, Energieverbrauch)
3. Balkendiagramm → stellt Rangliste dar (horizontal, z. B. Urlaubspreise, Supermarktpreise)

Wichtige Prozentformeln:
- Prozentwert: p% von G = G × p ÷ 100
- Prozentsatz: p% = W ÷ G × 100
- Absolute Veränderung: Endwert − Ausgangswert
- Relative Veränderung: (Endwert − Ausgangswert) ÷ Ausgangswert × 100

Alle Aufgaben haben ganzzahlige Ergebnisse (Vielfache von 5 oder 10).

Methodik bei Rückfragen:
- Welche Werte liest du aus dem Diagramm ab?
- Welcher Wert ist der Ausgangswert (Basis)?
- Was berechnest du – absolute oder prozentuale Veränderung?
- Das Ergebnis ist immer eine glatte Zahl – stimmt deine Rechnung?

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe mit Realschülerinnen und -schülern
- Einfache Sprache, kurze Antworten (1–2 Sätze)
- Gelegentlich Emojis 📊📈💡🔢

Was du NICHT tust:
- Die Lösung direkt nennen
- Vollständige Rechenwege vorgeben
`;

function kopiereKiPromptProz() {
  navigator.clipboard
    .writeText(KI_ASSISTENT_PROMPT_PROZ)
    .then(() => {
      const btn = document.getElementById("kiPromptKopierenBtn");
      const orig = btn.innerHTML;
      btn.innerHTML = "✅ Kopiert!";
      setTimeout(() => { btn.innerHTML = orig; }, 2500);
    })
    .catch(() => {
      alert("Kopieren nicht möglich. Bitte manuell aus dem Textfeld kopieren.");
    });
}

function toggleKiPromptVorschauProz() {
  const vorschau = document.getElementById("kiPromptVorschau");
  const btn = document.getElementById("kiPromptToggleBtn");
  const hidden = getComputedStyle(vorschau).display === "none";
  vorschau.style.display = hidden ? "block" : "none";
  btn.textContent = hidden ? "Vorschau ausblenden ▲" : "Prompt anzeigen ▼";
}

// ── Initialisierung ──────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const vorschauEl = document.getElementById("kiPromptVorschau");
  if (vorschauEl) vorschauEl.textContent = KI_ASSISTENT_PROMPT_PROZ;
  setTimeout(zeigeZufaelligeProzentAufgaben, 300);
});