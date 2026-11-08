// Auf 2 Dezimalstellen runden

// Formatieren der Währung mit Euro-Symbol, Tausenderpunkt und Dezimalkomma

// Formatieren der Währung mit Euro-Symbol, Tausenderpunkt und Dezimalkomma
function formatDecimal(amount) {
  return new Intl.NumberFormat("de-DE", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Formatieren der Zahl mit Leerzeichen als Tausendertrennzeichen, ohne Dezimalkomma
function formatNumberWithSpace(number) {
  const formattedNumber = new Intl.NumberFormat("de-DE", {
    useGrouping: false,
  }).format(number);
  return formattedNumber.replace(/(\d)(?=(\d{3})+$)/g, "$1 ");
}

// Globale Variable für das Chart
let gewinnschwelleChart = null;

function validateAndGenerateChart() {
  const fixkostenInput = document.getElementById("fixkosten");
  const variablestückkostenInput = document.getElementById(
    "variablestückkosten",
  );
  const nettoverkaufserlösestückInput = document.getElementById(
    "nettoverkaufserlösestück",
  );

  const fixkosten = parseFloat(fixkostenInput.value);
  const variablestückkosten = parseFloat(variablestückkostenInput.value);
  const nettoverkaufserlösestück = parseFloat(
    nettoverkaufserlösestückInput.value,
  );

  if (
    isNaN(fixkosten) ||
    isNaN(variablestückkosten) ||
    isNaN(nettoverkaufserlösestück) ||
    fixkosten < 0 ||
    fixkosten > 999999999 ||
    variablestückkosten < 0 ||
    variablestückkosten > 100000 ||
    nettoverkaufserlösestück < 0 ||
    nettoverkaufserlösestück > 50000
  ) {
    zeigeModal(
      "Bitte geben Sie gültige positive Werte ein:\nFixkosten: 0 - 999999999\nVariable Stückkosten: 0 - 100000\nNettoverkaufserlöse pro Stück: 0 - 50000",
    );
    return;
  }

  generateChart();
}

function calculateData(
  fixkosten,
  variablestückkosten,
  nettoverkaufserlösestück,
  maxMenge,
) {
  let gewinnschwelle;
  let gewinnschwellenmenge;
  gewinnschwelle = fixkosten / (nettoverkaufserlösestück - variablestückkosten);
  gewinnschwelle = roundToTwoDecimals(gewinnschwelle);
  gewinnschwellenmenge = gewinnschwelle * nettoverkaufserlösestück;

  let variablekosten = variablestückkosten * maxMenge;
  let gesamtkosten = fixkosten + variablekosten;
  let nettoverkaufserlöse = nettoverkaufserlösestück * maxMenge;

  return {
    gewinnschwelle,
    gewinnschwellenmenge,
    variablekosten,
    gesamtkosten,
    nettoverkaufserlöse,
  };
}

// Rastert das LIVE-SVG des Diagramms zu einem PNG-Daten-URI – im Gegensatz zu
// dataURI() bleiben die Direktbeschriftungen an den Linien (Annotation-Labels)
// garantiert erhalten, weil genau das gerenderte SVG als Vorlage dient.
// (Muster aus lb8-2-bestellmenge)
function svgElementNachPng(svgEl, skalierung) {
  return new Promise((aufs, fehler) => {
    try {
      const mass = svgEl.getBoundingClientRect();
      const breite = Math.round(mass.width || svgEl.clientWidth || 800);
      const hoehe = Math.round(mass.height || svgEl.clientHeight || 480);
      const klon = svgEl.cloneNode(true);
      klon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      klon.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
      klon.setAttribute("width", String(breite));
      klon.setAttribute("height", String(hoehe));
      if (!klon.getAttribute("viewBox"))
        klon.setAttribute("viewBox", "0 0 " + breite + " " + hoehe);
      // CSS-Klassen-Stile (z. B. Beschriftungen der Linien) als Inline-Styles
      // übernehmen – in <style>-Blöcken definierte Styles überleben das Klonen
      // nicht, ohne sie rendert der Browser beim PNG nur schwarze Flächen
      const quelle = svgEl.querySelectorAll("*");
      const ziel = klon.querySelectorAll("*");
      const cssProps = [
        "fill",
        "stroke",
        "stroke-width",
        "stroke-dasharray",
        "stroke-linecap",
        "font-family",
        "font-size",
        "font-weight",
        "font-style",
        "letter-spacing",
        "text-anchor",
        "dominant-baseline",
        "opacity",
      ];
      for (let i = 0; i < ziel.length; i++) {
        if (!quelle[i]) break;
        let inline = ziel[i].getAttribute("style") || "";
        for (const p of cssProps) {
          const v = getComputedStyle(quelle[i]).getPropertyValue(p);
          if (v) inline += p + ":" + v + ";";
        }
        ziel[i].setAttribute("style", inline);
      }
      // Beschriftungen sichtbar erzwingen – ApexCharts steuert deren Deckkraft
      // über Opacity, das Raster-Abbild bekommt sonst unsichtbare Texte
      klon
        .querySelectorAll(
          ".apexcharts-point-annotations, .apexcharts-point-annotations *",
        )
        .forEach((el) => {
          el.setAttribute(
            "style",
            (el.getAttribute("style") || "") + "opacity:1;",
          );
        });
      let quelltext = "";
      if (typeof XMLSerializer === "function")
        quelltext = new XMLSerializer().serializeToString(klon);
      const bildSvg = new Image();
      bildSvg.onload = () => {
        const leinwand = document.createElement("canvas");
        leinwand.width = Math.round(breite * skalierung);
        leinwand.height = Math.round(hoehe * skalierung);
        const cx = leinwand.getContext("2d");
        cx.fillStyle = "#ffffff";
        cx.fillRect(0, 0, leinwand.width, leinwand.height);
        cx.drawImage(bildSvg, 0, 0, leinwand.width, leinwand.height);
        aufs(leinwand.toDataURL("image/png"));
      };
      bildSvg.onerror = fehler;
      bildSvg.src =
        "data:image/svg+xml;charset=utf-8," + encodeURIComponent(quelltext);
    } catch (e) {
      fehler(e);
    }
  });
}

async function generateChart() {
  let fixkosten = parseFloat(document.getElementById("fixkosten").value);
  let variablestückkosten = parseFloat(
    document.getElementById("variablestückkosten").value,
  );
  let nettoverkaufserlösestück = parseFloat(
    document.getElementById("nettoverkaufserlösestück").value,
  );

  if (
    isNaN(fixkosten) ||
    isNaN(variablestückkosten) ||
    isNaN(nettoverkaufserlösestück)
  ) {
    zeigeModal("Please enter valid numeric values for all fields.");
    return;
  }

  let maxMenge;
  let gewinnschwelleNenner = nettoverkaufserlösestück - variablestückkosten;
  if (gewinnschwelleNenner > 0) {
    const rawMaxMenge =
      Math.ceil(
        (fixkosten / (nettoverkaufserlösestück - variablestückkosten)) * 2,
      ) || 1000;

    // Round maxMenge to a nice round number
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawMaxMenge)));
    const normalized = rawMaxMenge / magnitude;

    let roundedNormalized;
    if (normalized <= 1.5) roundedNormalized = 1.5;
    else if (normalized <= 2) roundedNormalized = 2;
    else if (normalized <= 2.5) roundedNormalized = 2.5;
    else if (normalized <= 3) roundedNormalized = 3;
    else if (normalized <= 4) roundedNormalized = 4;
    else if (normalized <= 5) roundedNormalized = 5;
    else if (normalized <= 6) roundedNormalized = 6;
    else if (normalized <= 8) roundedNormalized = 8;
    else roundedNormalized = 10;

    maxMenge = roundedNormalized * magnitude;
  } else {
    zeigeModal(
      "Ungültige Werte: die Nettoverkaufserlöse müssen höher als die Variablen Stückkosten sein.",
    );
    return;
  }

  let {
    gewinnschwelle,
    gewinnschwellenmenge,
    variablekosten,
    gesamtkosten,
    nettoverkaufserlöse,
  } = calculateData(
    fixkosten,
    variablestückkosten,
    nettoverkaufserlösestück,
    maxMenge,
  );

  // Destroy existing chart if it exists
  if (gewinnschwelleChart) {
    gewinnschwelleChart.destroy();
  }

  // Store gewinnschwelle values for use in event handlers
  const gewinnschwelleValue = gewinnschwelle;
  const gewinnschwellenmengeValue = gewinnschwellenmenge;

  // Calculate optimal number of ticks and nice round step size
  const calculateNiceAxisValues = (max) => {
    const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
    const normalized = max / magnitude;

    let step, tickCount;
    if (normalized <= 1.5) {
      step = magnitude * 0.1; // e.g., 1500 -> step 100
      tickCount = 15; // 0, 100, 200, ..., 1400, 1500
    } else if (normalized <= 2) {
      step = magnitude * 0.25; // e.g., 2000 -> step 250
      tickCount = 8; // 0, 250, 500, 750, 1000, 1250, 1500, 1750, 2000
    } else if (normalized <= 2.5) {
      step = magnitude * 0.25; // e.g., 2500 -> step 250
      tickCount = 10; // 0, 250, 500, ..., 2250, 2500
    } else if (normalized <= 3) {
      step = magnitude * 0.25; // e.g., 3000 -> step 250
      tickCount = 12; // 0, 250, 500, ..., 2750, 3000
    } else if (normalized <= 4) {
      step = magnitude * 0.5; // e.g., 4000 -> step 500
      tickCount = 8; // 0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000
    } else if (normalized <= 5) {
      step = magnitude * 0.5; // e.g., 5000 -> step 500
      tickCount = 10; // 0, 500, 1000, ..., 4500, 5000
    } else if (normalized <= 6) {
      step = magnitude * 0.5; // e.g., 6000 -> step 500
      tickCount = 12; // 0, 500, 1000, ..., 5500, 6000
    } else if (normalized <= 8) {
      step = magnitude * 0.5; // e.g., 8000 -> step 500
      tickCount = 16; // 0, 500, 1000, 1500, ..., 7500, 8000
    } else {
      step = magnitude * 1; // e.g., 10000 -> step 1000
      tickCount = 10; // 0, 1000, 2000, ..., 9000, 10000
    }

    // Generate exact tick positions
    const ticks = [];
    for (let i = 0; i <= tickCount; i++) {
      ticks.push(i * step);
    }

    return { step, ticks, tickCount };
  };

  const {
    step: axisStep,
    ticks: axisTicks,
    tickCount: axisTickCount,
  } = calculateNiceAxisValues(maxMenge);

  // Variable to track if Gewinnschwelle is visible
  let gewinnschwelleVisible = true;

  // ApexCharts Konfiguration
  const options = {
    series: [
      {
        name: "Nettoverkaufserlöse",
        type: "line",
        data: [
          [0, 0],
          [maxMenge, nettoverkaufserlöse],
        ],
      },
      {
        name: "Gesamtkosten",
        type: "line",
        data: [
          [0, fixkosten],
          [maxMenge, gesamtkosten],
        ],
      },
      {
        name: "Variablen Kosten",
        type: "line",
        data: [
          [0, 0],
          [maxMenge, variablekosten],
        ],
      },
      {
        name: "Fixkosten",
        type: "line",
        data: [
          [0, fixkosten],
          [maxMenge, fixkosten],
        ],
      },
      {
        name: "Gewinnschwelle",
        type: "line",
        data: [
          [0, gewinnschwellenmenge],
          [gewinnschwelle, gewinnschwellenmenge],
          [gewinnschwelle, 0],
        ],
      },
    ],
    chart: {
      height: 500,
      type: "line",
      background: "#ffffff",
      // Animationen aus (wie lb8-2-bestellmenge) – sonst bleiben die
      // Direktbeschriftungen der Linien unsichtbar (Opacity 0)
      animations: { enabled: false },
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      events: {
        legendClick: function (chartContext, seriesIndex, config) {
          // Check if the clicked series is "Gewinnschwelle" (index 4)
          if (seriesIndex === 4) {
            gewinnschwelleVisible = !gewinnschwelleVisible;

            // Toggle annotations visibility
            if (gewinnschwelleVisible) {
              chartContext.addXaxisAnnotation({
                id: "gewinnschwelle-x",
                x: gewinnschwelleValue,
                strokeDashArray: 5,
                borderColor: "#000",
                label: {
                  borderColor: "#000",
                  style: {
                    color: "#fff",
                    background: "#000",
                  },
                  text: "Gewinnschwelle",
                },
              });
              chartContext.addYaxisAnnotation({
                id: "gewinnschwelle-y",
                y: gewinnschwellenmengeValue,
                strokeDashArray: 5,
                borderColor: "#000",
              });
            } else {
              chartContext.removeAnnotation("gewinnschwelle-x");
              chartContext.removeAnnotation("gewinnschwelle-y");
            }
          }
        },
      },
    },
    // Dunkle, drucker-/kopierfeste Farben; Linien mit unterscheidbaren Mustern
    // (wie lb8-2-bestellmenge): Erlöse gestrichelt, Gesamtkosten durchgezogen,
    // Variablen Kosten gepunktet, Fixkosten gepunktet (horizontal), Gewinnschwelle Hilfslinie
    colors: ["#1F4E79", "#262626", "#C00000", "#843C0C", "#000000"],
    stroke: {
      width: [5, 5, 5, 5, 2],
      dashArray: [10, 0, 2, 2, 5],
    },
    markers: {
      size: [0, 0, 0, 0, 6],
      hover: {
        sizeOffset: 6,
      },
    },
    // Direkte Beschriftung an den Linien für den Schwarz-Weiß-Druck
    // (wie lb8-2-bestellmenge) – die Gewinnschwelle/die Gewinnschwellenmenge
    // bleiben bewusst unbeschriftet (Soll abgelesen werden)
    annotations: {
      points: [
        {
          x: maxMenge,
          y: nettoverkaufserlöse,
          marker: { size: 0 },
          label: {
            text: "Nettoverkaufserlöse",
            textAnchor: "end",
            offsetX: -12,
            offsetY: -14,
            borderColor: "transparent",
            borderWidth: 0,
            style: {
              background: "#fff9c4",
              color: "#1F4E79",
              fontSize: "15px",
              fontWeight: 700,
              fontFamily: "Arial, Helvetica, sans-serif",
              padding: { left: 6, right: 6, top: 2, bottom: 2 },
            },
          },
        },
        {
          x: maxMenge,
          y: gesamtkosten,
          marker: { size: 0 },
          label: {
            text: "Gesamtkosten",
            textAnchor: "end",
            offsetX: -12,
            offsetY: 22,
            borderColor: "transparent",
            borderWidth: 0,
            style: {
              background: "#fff9c4",
              color: "#262626",
              fontSize: "15px",
              fontWeight: 700,
              fontFamily: "Arial, Helvetica, sans-serif",
              padding: { left: 6, right: 6, top: 2, bottom: 2 },
            },
          },
        },
        {
          x: maxMenge,
          y: variablekosten,
          marker: { size: 0 },
          label: {
            text: "Variablen Kosten",
            textAnchor: "end",
            offsetX: -12,
            offsetY: 22,
            borderColor: "transparent",
            borderWidth: 0,
            style: {
              background: "#fff9c4",
              color: "#C00000",
              fontSize: "15px",
              fontWeight: 700,
              fontFamily: "Arial, Helvetica, sans-serif",
              padding: { left: 6, right: 6, top: 2, bottom: 2 },
            },
          },
        },
        {
          x: maxMenge,
          y: fixkosten,
          marker: { size: 0 },
          label: {
            text: "Fixkosten",
            textAnchor: "end",
            offsetX: -12,
            offsetY: -14,
            borderColor: "transparent",
            borderWidth: 0,
            style: {
              background: "#fff9c4",
              color: "#843C0C",
              fontSize: "15px",
              fontWeight: 700,
              fontFamily: "Arial, Helvetica, sans-serif",
              padding: { left: 6, right: 6, top: 2, bottom: 2 },
            },
          },
        },
      ],
    },
    title: {
      text: "Gewinnschwelle",
      align: "center",
      style: {
        fontSize: "20px",
        fontWeight: "bold",
      },
    },
    xaxis: {
      type: "numeric",
      title: {
        text: "Absatz (verkaufte Menge)",
        style: {
          fontSize: "14px",
        },
      },
      min: 0,
      max: maxMenge,
      tickAmount: axisTickCount - 1,
      forceNiceScale: false,
      decimalsInFloat: 0,
      labels: {
        formatter: function (val) {
          // Round to nearest step
          const rounded = Math.round(val / axisStep) * axisStep;
          return rounded.toLocaleString("de-DE");
        },
        rotate: 0,
      },
      axisBorder: {
        show: true,
      },
      axisTicks: {
        show: true,
      },
    },
    yaxis: {
      title: {
        text: "Umsatz / Kosten",
        style: {
          fontSize: "14px",
        },
      },
      min: 0,
      // Maxima reichlich bemessen, damit alle Linien inkl. Beschriftung
      // sichtbar sind (Erlösende liegt bei maxMenge deutlich über der
      // Gewinnschwellenmenge)
      max: nettoverkaufserlöse * 1.1,
      tickAmount: 8,
      labels: {
        formatter: function (val) {
          return (
            val.toLocaleString("de-DE", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }) + " €"
          );
        },
      },
    },
    legend: {
      position: "bottom",
      fontSize: "16px",
      markers: {
        width: 12,
        height: 12,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      x: {
        formatter: function (val) {
          return "Menge: " + Math.round(val).toLocaleString("de-DE");
        },
      },
      y: {
        formatter: function (val) {
          return formatCurrency(val);
        },
      },
    },
    grid: {
      show: true,
      borderColor: "#e0e0e0",
      strokeDashArray: 0,
      position: "back",
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    crosshairs: {
      show: true,
      position: "back",
      stroke: {
        color: "#b6b6b6",
        width: 1,
        dashArray: 3,
      },
    },
  };

  // Chart erstellen
  const chartElement = document.querySelector("#gewinnschwelleChart");
  gewinnschwelleChart = new ApexCharts(chartElement, options);
  await gewinnschwelleChart.render();

  // Verzögerung: ApexCharts zeichnet die Annotation-Labels (Beschriftung der
  // Linien) erst nach dem Auflösen des render()-Promises – wie bei
  // lb8-2-bestellmenge, sonst fehlen die Bezeichnungen im PNG
  await new Promise((warten) => setTimeout(warten, 1200));

  // Grafik als PNG für die Aufgabe exportieren – wie bei lb8-2-bestellmenge
  // wird das gerenderte LIVE-SVG gerastert, damit die Direktbeschriftungen der
  // Linien (Annotation-Labels) im PNG erhalten bleiben (dataURI() verliert sie).
  // WICHTIG: Export vor dem Hinzufügen der Beschriftung "Gewinnschwelle",
  // damit im Bild nichts gelöst wird.
  let aufgabeGrafik = "";
  try {
    const svgEl = chartElement.querySelector("svg");
    const imgURI = svgEl ? await svgElementNachPng(svgEl, 1) : null;
    if (imgURI) {
      aufgabeGrafik = `<img src="${imgURI}" alt="Gewinnschwellendiagramm" style="max-width:700px;width:100%">`;
    }
  } catch (e) {
    console.warn("Chart-Export fehlgeschlagen", e);
  }

  // Add annotations after chart is rendered
  gewinnschwelleChart.addXaxisAnnotation({
    id: "gewinnschwelle-x",
    x: gewinnschwelleValue,
    strokeDashArray: 5,
    borderColor: "#000",
    label: {
      borderColor: "#000",
      style: {
        color: "#fff",
        background: "#000",
      },
      text: "Gewinnschwelle",
    },
  });

  gewinnschwelleChart.addYaxisAnnotation({
    id: "gewinnschwelle-y",
    y: gewinnschwellenmengeValue,
    strokeDashArray: 5,
    borderColor: "#000",
  });

  // Aufgabe und Lösung generieren
  let deckungsbeitragstück = nettoverkaufserlösestück - variablestückkosten;

  // Für die Verlust-Variante: Zufallszahl zwischen 10-25% unter der Gewinnschwelle
  let zufallszahl = Math.floor(Math.random() * 16) + 10;
  gewinnschwelleMitVerlust = Math.round(
    gewinnschwelle - (zufallszahl * gewinnschwelle) / 100,
  );
  let deckungsbeitraGesamtmitVerlust =
    deckungsbeitragstück * gewinnschwelleMitVerlust;
  let verlust = deckungsbeitraGesamtmitVerlust - fixkosten;
  verlust = formatCurrency(verlust);
  let gewinnzone = formatNumberWithSpace(Math.ceil(gewinnschwelle));
  gewinnschwelleMitVerlust = formatNumberWithSpace(gewinnschwelleMitVerlust);
  deckungsbeitragstück = formatCurrency(deckungsbeitragstück);
  gewinnschwellenmenge = formatCurrency(gewinnschwellenmenge);
  variablekosten = formatCurrency(variablekosten);
  gesamtkosten = formatCurrency(gesamtkosten);
  nettoverkaufserlöse = formatCurrency(nettoverkaufserlöse);
  fixkosten = formatCurrency(fixkosten);
  nettoverkaufserlösestück = formatCurrency(nettoverkaufserlösestück);
  variablestückkosten = formatCurrency(variablestückkosten);
  gewinnschwelle = parseFloat(gewinnschwelle);
  gewinnschwelle = formatDecimal(gewinnschwelle);
  deckungsbeitraGesamtmitVerlust = formatCurrency(
    deckungsbeitraGesamtmitVerlust,
  );

  let aufgabeSatz;
  const aufgabenVariante = document.getElementById("aufgabenVariante").value;
  let randomAufgabeSatz;

  if (aufgabenVariante === "variante1") {
    randomAufgabeSatz = 0.3; // Will trigger variant 1 (< 0.5)
  } else if (aufgabenVariante === "variante2") {
    randomAufgabeSatz = 0.7; // Will trigger variant 2 (>= 0.5)
  } else {
    randomAufgabeSatz = 0.3; // Variante 3 (Grafik); wird im Zweig eigenständig behandelt
  }

  aufgabeSatz = `<h2>Aufgabe</h2>`;
  if (aufgabenVariante === "variante3") {
    // Variante 3: Nur das Grafikdiagramm ist gegeben (ohne Beschriftung der
    // Gewinnschwelle) – die Gewinnschwellenmenge soll abgelesen werden.
    aufgabeSatz += `<p>${aufgabeGrafik}</p>`;
    aufgabeSatz += `<p>Es liegt die obige Darstellung vor. Ermitteln Sie daraus die <b>Gewinnschwellenmenge</b></p>`;
  } else {
    // Diagramm oberhalb des Sachverhalts mitliefern (grafische Lösung)
    if (randomAufgabeSatz < 0.5) {
      aufgabeSatz += `Wir planen die Produktion von Fertigerzeugnissen, die zu einem Nettoverkaufspreis von ${nettoverkaufserlösestück} verkauft werden sollen. 
      Die Fixkosten belaufen sich auf ${fixkosten}. Bei der Produktion entstehen variable Kosten je Stück in Höhe von ${variablestückkosten}. 
      Berechnen Sie die Gewinnschwelle, also wie viele Fertigerzeugnisse mindestens hergestellt und abgesetzt werden müssen, um Gewinn zu erwirtschaften.`;
    } else {
      aufgabeSatz += `Wir produzierten im letzten Quartal ${gewinnschwelleMitVerlust} Fertigerzeugnisse, die zu einem Nettoverkaufspreis von je ${nettoverkaufserlösestück} verkauft wurden. 
      Bei der Produktion entstanden variable Kosten je Stück in Höhe von ${variablestückkosten}. Wir haben einen Verlust in Höhe von ${verlust} erzielt.
      Berechnen Sie die Gewinnschwelle, also wie viele Fertigerzeugnisse hergestellt und abgesetzt werden müssen, um im nächsten Quartal Gewinn zu erwirtschaften.`;
    }
  }

  let loesungSatz = `<h2 class="loesung">Lösung</h2>`;
  if (aufgabenVariante === "variante3") {
    // Lösung Variante 3: grafisches Ablesen der Gewinnschwellenmenge
    loesungSatz += `<p>Die Gewinnschwelle liegt am Schnittpunkt der Gesamtkostenlinie mit der Linie der Nettoverkaufserlöse. Von diesem Punkt geht man senkrecht nach unten bis zur x-Achse.</p>`;
    loesungSatz += `<br>`;
    loesungSatz += `<p><b>Abgelesene Gewinnschwellenmenge: ${gewinnzone} Stück</b></p>`;
  } else {
    loesungSatz += `<table style="border-collapse: collapse;white-space:nowrap;width:350px;margin: 0 0">`;
    loesungSatz += `<tbody>`;
    loesungSatz += `<tr>`;
    loesungSatz += `<td>Nettoverkaufspreis / Stück</td><td style="padding-left:16px;text-align:right;">${nettoverkaufserlösestück}</td>`;
    loesungSatz += `</tr>`;
    loesungSatz += `<tr>`;
    loesungSatz += `<td>- variable Kosten / Stück</td><td style="padding-left:16px;text-align:right;">${variablestückkosten}</td>`;
    loesungSatz += `</tr>`;
    loesungSatz += `<tr>`;
    loesungSatz += `<td style="border-top: solid 1px #ccc">= Deckungsbeitrag / Stück</td>`;
    loesungSatz += `<td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc">${deckungsbeitragstück}<br></td>`;
    loesungSatz += `</tr>`;
    loesungSatz += `</tbody>`;
    loesungSatz += `</table>`;
    loesungSatz += `<br>`;
    if (randomAufgabeSatz >= 0.5) {
      loesungSatz += `<table style="border-collapse: collapse;white-space:nowrap;width:350px;margin: 0 0">`;
      loesungSatz += `<tbody>`;
      loesungSatz += `<tr>`;
      loesungSatz += `<td>Deckungsbeitrag gesamt</td><td style="padding-left:16px;text-align:right;">${deckungsbeitraGesamtmitVerlust}</td>`;
      loesungSatz += `</tr>`;
      loesungSatz += `<tr>`;
      loesungSatz += `<td>Fixkosten</td><td style="padding-left:16px;text-align:right;">${fixkosten}</td>`;
      loesungSatz += `</tr>`;
      loesungSatz += `<tr>`;
      loesungSatz += `<td style="border-top: solid 1px #ccc">Verlust</td>`;
      loesungSatz += `<td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc">${verlust}<br></td>`;
      loesungSatz += `</tr>`;
      loesungSatz += `</tbody>`;
      loesungSatz += `</table>`;
      loesungSatz += `<br>`;
    }
    loesungSatz += `Gewinnschwelle: ${fixkosten} / ${deckungsbeitragstück} = ${gewinnschwelle}  `;
    loesungSatz += `<br><br>`;
    loesungSatz += `Es müssen ${gewinnzone} Fertigerzeugnisse produziert und abgesetzt werden, um den Beginn der Gewinnzone zu erreichen.`;
  }

  // Ausgabe: läuft schon ein Editor, über JoditEditor.setContent schreiben,
  // damit Editor-Wert und Quelle synchron bleiben.
  const gsContainer = document.getElementById("gewinnschwelleAufgabeContainer");
  if (window.JoditEditor && gsContainer._jodit) {
    window.JoditEditor.setContent(gsContainer, aufgabeSatz + loesungSatz);
  } else {
    gsContainer.innerHTML = aufgabeSatz + loesungSatz;
  }

  // Aufgabe steht: Editor (Jodit) aktivieren – einmalig. data-jodit-init erlaubt
  // den Adopt auch auf ApexCharts-Seiten (Muster aus lb8-2-bestellmenge).
  if (window.JoditEditor && !gsContainer._jodit) {
    gsContainer.setAttribute("data-jodit-init", "1");
    try {
      window.JoditEditor.init(gsContainer);
    } catch (e) {
      console.warn("Editor-Init fehlgeschlagen", e);
    }
  }
}

// Hilfsfunktionen: Inhalt bzw. sichtbares Element des Aufgaben-Containers,
// unabhängig davon ob der Jodit-Editor aktiv ist.
function gsAufgabeHtml() {
  const el = document.getElementById("gewinnschwelleAufgabeContainer");
  if (!el) return "";
  let html =
    window.JoditEditor && el._jodit
      ? window.JoditEditor.getHTML(el)
      : el.innerHTML;
  // Seitenumbruch-Marker (nur für den Druck) entfernen
  return html
    .replace(/<div class="seitenumbruch"[^>]*>[\s\S]*?<\/div>/g, "")
    .replace(/<div class="seitenumbruch"[^>]*><\/div>/g, "");
}

function gsAufgabeElement() {
  const el = document.getElementById("gewinnschwelleAufgabeContainer");
  if (window.JoditEditor && el && el._jodit) {
    // nach dem Adopt ist el ausgeblendet – sichtbaren Editor-Inhalt erfassen
    return el._jodit.editor || el.closest(".jodit-container") || el;
  }
  return el;
}

function gewinnschwelleHerunterladenAlsPNG() {
  const wertetabelle = gsAufgabeElement();

  html2canvas(wertetabelle, optionshtml2canvas).then((canvas) => {
    const dataURL = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataURL;
    a.download = "gewinnschwelle.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}

function gewinnschwelleKopiereInZwischenablage() {
  const gewinnschwelleHTML = gsAufgabeHtml().replace(/&nbsp;/g, " ");
  navigator.clipboard
    .writeText(gewinnschwelleHTML)
    .then(() => zeigeModal("Code wurde in die Zwischenablage kopiert"))
    .catch((err) =>
      console.error("Fehler beim Kopieren in die Zwischenablage:", err),
    );
}

function gewinnschwelleHerunterladen() {
  const emailHTML = gsAufgabeHtml().replace(/&nbsp;/g, " ");
  const blob = new Blob([emailHTML], { type: "html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "gewinnschwelle.html";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Aufgabe beim Seitenaufruf automatisch erzeugen (Defaultwerte des Formulars)
document.addEventListener("DOMContentLoaded", function () {
  validateAndGenerateChart();
});
