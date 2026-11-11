let bestellChart = null;

(function () {
  "use strict";

  // Alle Zahlen im Interview stammen aus den Eingabefeldern der Seite (siehe leseDaten).

  const VORNAMEN = [
    "Anna",
    "Lukas",
    "Sarah",
    "Max",
    "Lena",
    "Ahmet",
    "Marie",
    "Tom",
    "Julia",
    "Tim",
    "Laura",
    "Simon",
    "Sophie",
    "Felix",
    "Emma",
    "Paul",
    "Hannah",
    "Elias",
    "Mia",
    "Noah",
    "Clara",
    "Ben",
    "Lea",
    "Jan",
    "Katharina",
    "Stefan",
    "Medina",
    "Markus",
    "Eren",
    "Ali",
  ];
  const NACHNAMEN = [
    "Konrad",
    "Schmidt",
    "Weber",
    "Bauer",
    "Müller",
    "Wagner",
    "Fischer",
    "Becker",
    "Yilmaz",
    "Trung",
    "Richter",
    "Kaya",
    "Popescu",
    "Schneider",
    "Keller",
    "Vogel",
    "Holomir",
    "Maier",
    "Lang",
    "Krüger",
    "Baumann",
    "Roth",
    "Winter",
    "Ziegler",
    "Khan",
    "Gruber",
    "Berger",
  ];

  const S = {
    box: "background:#fff;border:1px solid #ddd;border-radius:6px;padding:14px 18px;margin-bottom:16px;line-height:1.7;",
    h2: "font-size:1.3em;",
    p: "margin:0 0 8px 0;",
  };

  let yamlData = [];
  let personen = null;
  let html = "";

  const $ = (id) => document.getElementById(id);
  const zufall = (a) => a[Math.floor(Math.random() * a.length)];
  const esc = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const eur = (n) =>
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(n);
  const zahl = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");

  function neuePerson(ausschluss) {
    let p;
    do {
      p = zufall(VORNAMEN) + " " + zufall(NACHNAMEN);
    } while (ausschluss.includes(p));
    return p;
  }

  // ───────────────────────────────────────────────
  // Unternehmensdaten (wie im Kreditvergleich)

  function getUserCompanies() {
    try {
      return JSON.parse(localStorage.getItem("userCompanies")) || [];
    } catch (e) {
      return [];
    }
  }

  async function ladeUnternehmen() {
    let coreData = null;
    try {
      const antwort = await fetch("js/unternehmen.yml?v=" + Date.now());
      if (antwort.ok) coreData = jsyaml.load(await antwort.text());
      if (Array.isArray(coreData))
        localStorage.setItem("standardYamlData", JSON.stringify(coreData));
    } catch (e) {
      console.warn("Konnte unternehmen.yml nicht laden:", e);
    }
    if (!coreData) {
      try {
        coreData = JSON.parse(localStorage.getItem("standardYamlData") || "[]");
      } catch (e) {
        coreData = [];
      }
    }
    if (!Array.isArray(coreData)) coreData = [];

    // Hochgeladene Datei: nur zusätzliche Unternehmen (Dedup gegen Core)
    let zusaetzliche = [];
    const uploadedJSON = localStorage.getItem("uploadedYamlCompanyData");
    if (uploadedJSON) {
      try {
        const uploaded = JSON.parse(uploadedJSON);
        zusaetzliche = uploaded.filter((u) => {
          const key =
            String(u?.unternehmen?.id ?? "") +
            "|" +
            String(u?.unternehmen?.name ?? "")
              .trim()
              .toLowerCase();
          return !(coreData || []).some(
            (c) =>
              String(c?.unternehmen?.id ?? "") +
                "|" +
                String(c?.unternehmen?.name ?? "")
                  .trim()
                  .toLowerCase() ===
              key,
          );
        });
        if (zusaetzliche.length === 0) {
          localStorage.removeItem("uploadedYamlCompanyData");
        } else if (zusaetzliche.length !== uploaded.length) {
          localStorage.setItem(
            "uploadedYamlCompanyData",
            JSON.stringify(zusaetzliche),
          );
        }
      } catch (e) {
        localStorage.removeItem("uploadedYamlCompanyData");
      }
    }

    yamlData = [...coreData, ...zusaetzliche, ...getUserCompanies()].filter(
      (c) => c && c.unternehmen && c.unternehmen.name,
    );
    yamlData.sort(
      (a, b) =>
        (a.unternehmen.branche || "").localeCompare(
          b.unternehmen.branche || "",
        ) || a.unternehmen.name.localeCompare(b.unternehmen.name),
    );
  }

  function fuelleDropdown() {
    const sel = $("bmUnternehmen");
    sel.innerHTML = yamlData
      .map((c, i) => {
        const u = c.unternehmen;
        const text = u.branche
          ? `${u.branche} – ${u.name} ${u.rechtsform || ""}`
          : `${u.name} ${u.rechtsform || ""}`;
        return `<option value="${i}">${esc(text.trim())}</option>`;
      })
      .join("");
    const idx = yamlData.findIndex(
      (c) => c.unternehmen.name === localStorage.getItem("myCompany"),
    );
    sel.value = idx >= 0 ? idx : 0;
  }

  // ───────────────────────────────────────────────
  // Interview

  // Liest die Eingaben und leitet daraus die Zahlen des Interviews ab (gleiche Formeln wie die Tabelle)
  function leseDaten() {
    const lies = (id) => parseInt($(id).value, 10);
    const menge = lies("optimaleBestellmenge"),
      haeuf = lies("optimaleBestellhaeufigkeit"),
      bk = lies("bestellkosten");
    const s = lies("schrittweite"),
      von = lies("haeufigkeitVon"),
      bis = lies("haeufigkeitBis");
    if ([menge, haeuf, bk, s, von, bis].some((x) => !(x > 0))) return null;

    const bedarf = menge * haeuf;
    const lager = Math.round(((2 * bedarf * bk) / (menge * menge)) * 100) / 100;

    // Bestellhäufigkeiten, die in der Tabelle vorkommen
    const freq = new Set([haeuf]);
    for (let h = Math.ceil(von / s) * s; h <= bis; h += s) freq.add(h);
    const liste = [...freq].sort((x, y) => x - y),
      idx = liste.indexOf(haeuf);

    // bisherige Weise: häufiger als optimal; Vorschlag: seltener als optimal (möglichst ganzzahlige Mengen)
    const waehle = (r) => {
      for (const k of [2, 3, 1, 4]) {
        const h = liste[idx + r * k];
        if (h && bedarf % h === 0) return h;
      }
      for (const k of [2, 1, 3, 4]) {
        const h = liste[idx + r * k];
        if (h) return h;
      }
      return null;
    };
    const h1 = waehle(1) || Math.round(haeuf * 1.5) + 1;
    const h2 = waehle(-1) || Math.max(1, Math.round(haeuf / 2));
    return {
      bedarf,
      lager,
      bk,
      h1,
      m1: Math.round(bedarf / h1),
      h2,
      m2: Math.round(bedarf / h2),
    };
  }

  function baueAufgabe() {
    const d = leseDaten();
    if (!d) return "";
    const variante = ($("bmVariante") && $("bmVariante").value) || "1";
    const u = (yamlData[$("bmUnternehmen").value] || yamlData[0]).unternehmen;

    // Rohstoff: erster Eintrag unter werkstoffe.AWR, sonst allgemein "Rohstoffeinheiten"
    const awr =
      u.werkstoffe && Array.isArray(u.werkstoffe.AWR) ? u.werkstoffe.AWR : [];
    const rohstoff =
      typeof awr[0] === "string" && awr[0].trim() ? awr[0].trim() : "";
    const mehrzahl = rohstoff ? `Einheiten ${rohstoff}` : "Rohstoffeinheiten";

    const firma = `${u.name} ${u.rechtsform || ""}`.trim();
    const ort = u.adresse && u.adresse.ort ? ` in ${u.adresse.ort}` : "";

    // ── Variante 2: nur Diagramm – optimale Bestellmenge ablesen ──────────
    if (variante === "2") {
      return `<div id="bmAufgabe" style="${S.box}">
<h2 style="${S.h2}">Aufgabe – Optimale Bestellmenge (Diagramm)</h2>
<p style="${S.p}">Es liegt folgende Grafik vor.</p>
<p style="${S.p}"><strong>Arbeitsauftrag:</strong> Ermittle aus dem Diagramm die optimale Bestellmenge.</p>
</div>`;
    }

    // ── Variante 3: nur Tabelle – optimale Bestellmenge ermitteln ─────────
    if (variante === "3") {
      return `<div id="bmAufgabe" style="${S.box}">
<h2 style="${S.h2}">Aufgabe – Optimale Bestellmenge (Tabelle)</h2>
<p style="${S.p}">Es liegt folgende Tabelle vor.</p>
<p style="${S.p}"><strong>Arbeitsauftrag:</strong> Ermittle aus der Tabelle die optimale Bestellmenge und die optimale Bestellhäufigkeit.</p>
</div>`;
    }

    // ── Variante 1: Interview (bisherig) ──────────────────────────────────
    const inhaber =
      (typeof u.inhaber === "string" && u.inhaber.trim()) || neuePerson([]);
    if (!personen || personen.inhaber !== inhaber)
      personen = { inhaber, a: "", b: "" };
    if (!personen.a) {
      personen.a = neuePerson([inhaber]);
      personen.b = neuePerson([inhaber, personen.a]);
    }
    const { a, b } = personen;

    const rede = (name, text) =>
      `<p style="${S.p}"><strong>${esc(name)}:</strong> „${text}“</p>`;

    return `<div id="bmAufgabe" style="${S.box}">
<h2 style="${S.h2}">Aufgabe – Optimale Bestellmenge</h2>
<p style="${S.p}">Das Unternehmen ${esc(firma)}${esc(ort)} benötigt für die Fertigung ${rohstoff ? `den Rohstoff ${esc(rohstoff)}` : "Rohstoffeinheiten"}. Der Jahresbedarf beträgt ${zahl(d.bedarf)} ${esc(mehrzahl)}. Sie werden eingelagert und bei Bedarf von der Fertigung entnommen. In der Einkaufsabteilung besprechen ${esc(a)} und ${esc(b)} mit dem Inhaber ${esc(inhaber)}, wie oft und in welcher Menge bestellt werden soll.</p>
${rede(a, `Bisher bestellen wir ${d.h1}-mal im Jahr jeweils ${zahl(d.m1)} ${esc(mehrzahl)}. Ich schlage vor, nur noch ${d.h2}-mal im Jahr zu bestellen, dann jeweils ${zahl(d.m2)}. So sparen wir Bestellkosten: Jede Bestellung kostet ${eur(d.bk)} für Personal, Papier und Fracht.`)}
${rede(b, `Dafür müssen wir aber mehr Ware lagern. Für jede gelagerte Einheit fallen im Jahr ${eur(d.lager)} Lagerkosten an, zum Beispiel für Platz, Energie und Versicherung. Außerdem wird Geld gebunden. Ich bin dafür, bei der bisherigen Bestellweise zu bleiben.`)}
${rede(inhaber, `Wir suchen die optimale Bestellmenge. Das ist die Menge, bei der die Gesamtkosten aus Bestellkosten und Lagerkosten am niedrigsten sind.`)}
<p style="${S.p}margin-top:12px;"><strong>Arbeitsaufträge:</strong></p>
<ol style="margin:0;padding-left:22px;">
  <li>Beschreibe den Zielkonflikt, der bei der Festlegung der Bestellmenge besteht.</li>
  <li>Erläutere mit Hilfe der grafischen Darstellung den Zusammenhang zwischen Bestellkosten und Lagerhaltungskosten.</li>
  <li>Ermittle und begründe mit Hilfe der Tabelle und der Grafik die Höhe der optimalen Bestellmenge.</li>
</ol>
</div>`;
  }

  // ───────────────────────────────────────────────
  // Einfügen in #Container (bleibt oben, auch nach Neuberechnung)

  const container = $("Container");
  const beobachter = new MutationObserver(() => {
    if (container.children.length && !container.querySelector("#bmAufgabe"))
      aktualisiere(false);
  });

  function einfuegen() {
    beobachter.disconnect();
    const vorhanden = container.querySelector("#bmAufgabe");
    if (vorhanden) vorhanden.outerHTML = html;
    else if (container.children.length)
      container.insertAdjacentHTML("afterbegin", html);
    beobachter.observe(container, { childList: true });
  }

  function aktualisiere(neuWuerfeln) {
    if (!yamlData.length) return;
    if (neuWuerfeln) personen = null;
    html = baueAufgabe() || html; // bei ungültigen Eingaben bleibt der letzte Stand
    if (html) einfuegen();
  }

  async function start() {
    await ladeUnternehmen();
    if (!yamlData.length) {
      console.warn("Keine Unternehmen gefunden – keine Aufgabe erzeugt.");
      return;
    }
    fuelleDropdown();
    $("bmUnternehmen").addEventListener("change", () => aktualisiere(true));
    aktualisiere(true);
    beobachter.observe(container, { childList: true });
  }

  start();
})();

// Formatieren der Währung mit Euro-Symbol, Tausenderpunkt und Dezimalkomma

// Auf 2 Dezimalstellen runden

// Formatieren der Zahl mit Leerzeichen als Tausendertrennzeichen, ohne Dezimalkomma
function formatNumberWithSpace(number) {
  const formattedNumber = new Intl.NumberFormat("de-DE", {
    useGrouping: false,
  }).format(number);
  return formattedNumber.replace(/(\d)(?=(\d{3})+$)/g, "$1 ");
}

function roundUpToNearest(number) {
  const digits = Math.floor(Math.log10(number));
  const factor = Math.pow(10, digits);

  if (factor < 10) {
    return Math.ceil(number / 10) * 10;
  } else if (factor < 100) {
    return Math.ceil(number / 100) * 100;
  } else {
    return Math.ceil(number / 1000) * 1000;
  }
}

let lagerkosten;
let bedarf;
function berechneOptimaleBestellmengeUndHaeufigkeit() {
  // Export-Button nur bei "Nur Diagramm" anzeigen
  const _fallTyp = (document.getElementById("bmVariante") || {}).value || "1";
  const _exportBtns = document.querySelector(".export-buttons");
  if (_exportBtns) _exportBtns.style.display = _fallTyp === "2" ? "" : "none";
  let optimaleBestellmenge = parseInt(
    document.getElementById("optimaleBestellmenge").value,
    10,
  );
  let optimaleBestellhaeufigkeit = parseInt(
    document.getElementById("optimaleBestellhaeufigkeit").value,
    10,
  );
  let bestellkosten = parseInt(
    document.getElementById("bestellkosten").value,
    10,
  );
  let schrittweite = parseInt(
    document.getElementById("schrittweite").value,
    10,
  );

  function validateInputs(
    optimaleBestellmenge,
    optimaleBestellhaeufigkeit,
    bestellkosten,
    schrittweite,
  ) {
    const inputs = [
      {
        value: optimaleBestellmenge,
        min: 1,
        max: 999999999,
        message: "Optimale Bestellmenge (1 - 999999999)",
      },
      {
        value: optimaleBestellhaeufigkeit,
        min: 1,
        max: 100,
        message: "Optimale Bestellhäufigkeit (1 - 100)",
      },
      {
        value: bestellkosten,
        min: 1,
        max: 999999999,
        message: "Bestellkosten (1 - 999999999)",
      },
      {
        value: schrittweite,
        min: 1,
        max: 100,
        message: "Schrittweite (1 - 100)",
      },
    ];

    for (const input of inputs) {
      if (
        isNaN(input.value) ||
        input.value < input.min ||
        input.value > input.max
      ) {
        zeigeModal(`Bitte eine gültige Zahl eingeben: ${input.message}.`);
        return false;
      }
    }

    return true;
  }

  // Verwendung:
  if (
    !validateInputs(
      optimaleBestellmenge,
      optimaleBestellhaeufigkeit,
      bestellkosten,
      schrittweite,
    )
  ) {
    return;
  }
  const haeufigkeitVon = parseInt(
    document.getElementById("haeufigkeitVon").value,
    10,
  );
  const haeufigkeitBis = parseInt(
    document.getElementById("haeufigkeitBis").value,
    10,
  );
  if (
    isNaN(haeufigkeitVon) ||
    isNaN(haeufigkeitBis) ||
    haeufigkeitVon < 1 ||
    haeufigkeitBis > 100 ||
    haeufigkeitVon >= haeufigkeitBis
  ) {
    zeigeModal(
      'Bitte einen gültigen Bereich für die Bestellhäufigkeit eingeben (1 bis 100, "von" kleiner als "bis").',
    );
    return;
  }

  // Input-Feldwerte abrufen
  optimaleBestellmenge = document.getElementById("optimaleBestellmenge").value;
  bestellkosten = document.getElementById("bestellkosten").value;
  optimaleBestellhaeufigkeit = document.getElementById(
    "optimaleBestellhaeufigkeit",
  ).value;
  bedarf = optimaleBestellmenge * optimaleBestellhaeufigkeit;
  // Andler-Formel anwenden
  lagerkosten =
    (2 * bedarf * bestellkosten) /
    (optimaleBestellmenge * optimaleBestellmenge);
  lagerkosten = roundToTwoDecimals(lagerkosten);
  // Container erstellen
  generiereContainer();
}

function generiereContainer() {
  // Tabelle leeren
  const lagerkostenElement = document.getElementById("lagerkosten");
  const bedarfElement = document.getElementById("bedarf");
  const ContainerElement = document.getElementById("Container");

  lagerkostenElement.innerText = formatCurrency(lagerkosten);
  bedarfElement.innerText = formatNumberWithSpace(bedarf);

  // Fall-Typ: 2 = nur Diagramm (keine Tabelle im Container), 3 = nur Tabelle
  const fallTyp = (document.getElementById("bmVariante") || {}).value || "1";
  ContainerElement.innerHTML = fallTyp === "2" ? "" : "<h3>Tabelle</h3>";

  // Kein Tabellenaufbau bei "nur Diagramm" – Diagramm-PNG wird über
  // drawChart → aktualisiereDiagrammPng() unter die Aufgabe gesetzt
  if (fallTyp === "2") {
    drawChart([]);
    return;
  }

  // Input-Feldwerte abrufen
  const bestellkosten = parseInt(
    document.getElementById("bestellkosten").value,
    10,
  );
  const optimaleBestellhaeufigkeit = parseInt(
    document.getElementById("optimaleBestellhaeufigkeit").value,
    10,
  );
  const schrittweite = parseInt(
    document.getElementById("schrittweite").value,
    10,
  );

  const werteArray = [];

  // Berechnungen außerhalb der Schleife
  const durchschnittlicherBestand = roundToTwoDecimals(
    bedarf / (2 * optimaleBestellhaeufigkeit),
  );
  const bestellkostenGesamt = roundToTwoDecimals(
    bestellkosten * optimaleBestellhaeufigkeit,
  );
  const lagerhaltungskosten = roundToTwoDecimals(
    durchschnittlicherBestand * lagerkosten,
  );
  const gesamtkosten = roundToTwoDecimals(
    parseFloat(bestellkostenGesamt) + parseFloat(lagerhaltungskosten),
  );

  werteArray.push({
    bestellmenge: Math.round(bedarf / optimaleBestellhaeufigkeit),
    haeufigkeit: optimaleBestellhaeufigkeit,
    durchschnittlicherBestand: durchschnittlicherBestand,
    bestellkostenGesamt: bestellkostenGesamt,
    lagerhaltungskosten: lagerhaltungskosten,
    gesamtkosten: gesamtkosten,
  });

  const haeufigkeitVon = parseInt(
    document.getElementById("haeufigkeitVon").value,
    10,
  );
  const haeufigkeitBis = parseInt(
    document.getElementById("haeufigkeitBis").value,
    10,
  );
  let schritte = schrittweite;
  const startHaeufigkeit = Math.ceil(haeufigkeitVon / schritte) * schritte;
  for (
    let haeufigkeit = startHaeufigkeit;
    haeufigkeit <= haeufigkeitBis;
    haeufigkeit += schritte
  ) {
    if (haeufigkeit === optimaleBestellhaeufigkeit) continue;

    // Werte berechnen
    const durchschnittlicherBestand = roundToTwoDecimals(
      bedarf / (2 * haeufigkeit),
    );
    const bestellkostenGesamt = roundToTwoDecimals(bestellkosten * haeufigkeit);
    const lagerhaltungskosten = roundToTwoDecimals(
      durchschnittlicherBestand * lagerkosten,
    );
    const gesamtkosten = roundToTwoDecimals(
      parseFloat(bestellkostenGesamt) + parseFloat(lagerhaltungskosten),
    );

    // Werte zum Array hinzufügen
    werteArray.push({
      bestellmenge: Math.round(bedarf / haeufigkeit),
      haeufigkeit: haeufigkeit,
      durchschnittlicherBestand: durchschnittlicherBestand,
      bestellkostenGesamt: bestellkostenGesamt,
      lagerhaltungskosten: lagerhaltungskosten,
      gesamtkosten: gesamtkosten,
    });
  }

  // Tabelle nach Bestellmenge absteigend sortieren
  werteArray.sort((a, b) => b.haeufigkeit - a.haeufigkeit);

  // Tabelle erstellen
  const table = document.createElement("table");
  table.style.width = "680px";
  table.style.borderCollapse = "collapse";

  const thTitles = [
    "Bestellmenge",
    "Bestellhäufigkeit",
    "Durchschn. Lagerbestand",
    "Bestellkosten",
    "Lagerkosten",
    "Gesamtkosten",
  ];
  const headerRow = table.insertRow(0);

  thTitles.forEach((title) => {
    const th = document.createElement("th");
    th.textContent = title;
    th.style.backgroundColor = "#f5f5f5";
    th.style.border = "1px solid #000";
    th.style.padding = "4px";
    headerRow.appendChild(th);
  });

  werteArray.forEach((wert) => {
    const row = table.insertRow(-1);
    [
      "bestellmenge",
      "haeufigkeit",
      "durchschnittlicherBestand",
      "bestellkostenGesamt",
      "lagerhaltungskosten",
      "gesamtkosten",
    ].forEach((key) => {
      const cell = row.insertCell();
      if (
        ["bestellkostenGesamt", "lagerhaltungskosten", "gesamtkosten"].includes(
          key,
        )
      ) {
        cell.textContent = formatCurrency(wert[key]);
      } else {
        cell.textContent = formatNumberWithSpace(wert[key]);
      }
      cell.style.border = "1px solid #000";
      cell.style.textAlign = [
        "Bestellkosten",
        "Lagerkosten",
        "Gesamtkosten",
      ].includes(key)
        ? "right"
        : "center";
      cell.style.padding = "4px";
    });
  });

  // Tabelle in DOM einfügen
  ContainerElement.appendChild(table);

  drawChart(werteArray);
  // Die Lösung wird NICHT hier erzeugt, sondern erst nach dem Rendern des
  // Diagramms in aktualisiereDiagrammPng() – sonst steht die Lösung doppelt
  // und das Diagramm läge zwischen den beiden Lösungen.
}

function drawChart(werteArray) {
  // Berechnungen
  const optimaleBestellmenge = parseInt(
    document.getElementById("optimaleBestellmenge").value,
    10,
  );
  const bestellkosten = parseInt(
    document.getElementById("bestellkosten").value,
    10,
  );
  const optimaleBestellhaeufigkeit = parseInt(
    document.getElementById("optimaleBestellhaeufigkeit").value,
    10,
  );
  const bedarf = optimaleBestellmenge * optimaleBestellhaeufigkeit;
  const lagerkosten =
    (2 * bedarf * bestellkosten) /
    (optimaleBestellmenge * optimaleBestellmenge);
  const labels = [];
  const lagerhaltungskostenData = [];
  const bestellkostenData = [];
  const gesamtkostenData = [];

  let schrittebestellmenge = roundUpToNearest(optimaleBestellmenge / 100);

  // Daten für das Diagramm berechnen
  for (
    let i = schrittebestellmenge;
    i <= optimaleBestellmenge * 2;
    i += schrittebestellmenge
  ) {
    const durchschnittlicherBestand = roundToTwoDecimals(i / 2);
    const bestellkostenGesamt = roundToTwoDecimals(
      (bestellkosten * bedarf) / i,
    );
    const lagerhaltungskosten = roundToTwoDecimals(
      durchschnittlicherBestand * lagerkosten,
    );
    const gesamtkosten = roundToTwoDecimals(
      parseFloat(bestellkostenGesamt) + parseFloat(lagerhaltungskosten),
    );

    labels.push(i);
    lagerhaltungskostenData.push(parseFloat(lagerhaltungskosten));
    bestellkostenData.push(parseFloat(bestellkostenGesamt));
    gesamtkostenData.push(parseFloat(gesamtkosten));
  }

  const lastIdx = Math.max(0, labels.length - 1); // Endpunkt der Linien für die Direkt-Bezeichnung

  // ApexCharts konfigurieren
  let ychartmax = roundUpToNearest(
    (optimaleBestellhaeufigkeit * bestellkosten +
      (optimaleBestellmenge / 2) * lagerkosten) *
      3,
  );
  // Berechne den Wert von tickAmount
  let tickAmount = schrittebestellmenge * 2;
  // Begrenze tickAmount auf maximal 20
  if (tickAmount > 20) {
    tickAmount = 20;
  }
  const options = {
    chart: {
      background: "#ffffff",
      animations: { enabled: false },
      type: "line",
      height: 500,
      toolbar: {
        show: true, // Toolbar bleibt – NUR für Export
        offsetX: 0,
        offsetY: 0,
        tools: {
          download: true, // Export (SVG/PNG/CSV) aktiv
          selection: false,
          zoom: false,
          zoomin: false,
          zoomout: false,
          pan: false,
          reset: false,
          customIcons: [],
        },
        export: {
          svg: {
            filename: "chart-export.svg",
          },
          png: {
            filename: "chart-export.png",
          },
          csv: {
            filename: "chart-export.csv",
          },
        },
      },
      zoom: { enabled: false }, // Zoom-Interaktion im Diagramm aus
    },
    dataLabels: {
      enabled: false,
    },
    series: [
      {
        name: "Lagerhaltungskosten",
        data: lagerhaltungskostenData,
      },
      {
        name: "Bestellkosten",
        data: bestellkostenData,
      },
      {
        name: "Gesamtkosten",
        data: gesamtkostenData,
      },
    ],
    // Farben dunkel (drucker-/ kopierfest), Linien mit unterscheidbaren Mustern:
    // Lagerhaltungskosten gestrichelt, Bestellkosten gepunktet, Gesamtkosten durchgezogen
    colors: ["#1F4E79", "#C00000", "#262626"],
    stroke: {
      width: 5,
      curve: "straight",
      dashArray: [10, 2, 0],
    },
    xaxis: {
      categories: labels,
      title: {
        text: "Bestellmenge",
        style: {
          fontSize: "14px",
          fontWeight: "bold",
        },
      },
      min: 0,
      tickAmount: tickAmount, // Reduziert die Anzahl der angezeigten Ticks
      labels: {
        style: {
          fontSize: "14px",
        },
      },
    },
    yaxis: {
      title: {
        text: "Kosten",
        style: {
          fontSize: "14px",
          fontWeight: "bold",
        },
      },
      max: ychartmax,
      labels: {
        formatter: function (value) {
          return new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "EUR",
          }).format(value);
        },
        style: {
          fontSize: "16px",
        },
      },
    },
    grid: {
      show: true, // Das Grid anzeigen
      borderColor: "#ccc", // Farbe der Gittergrenzen
      strokeDashArray: 0, // Strichmuster für Gitterlinien (5px Striche, 5px Lücken)
      xaxis: {
        lines: {
          show: true, // X-Achse Linien anzeigen
          width: 4, // Linienbreite der X-Achse
          color: "#000", // Farbe der X-Achse Linien
        },
      },
      yaxis: {
        lines: {
          show: true, // Y-Achse Linien anzeigen
          width: 1, // Linienbreite der Y-Achse
          color: "#000", // Farbe der Y-Achse Linien
        },
      },
    },
    tooltip: {
      enabled: false,
      y: {
        formatter: function (value) {
          return new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "EUR",
          }).format(value);
        },
      },
    },
    legend: {
      show: false, // Bezeichnungen stehen direkt an den Linien (siehe annotations)
    },
    // Bezeichnung direkt an der Linie (Endpunkt als Punkt-Annotation) –
    // weißer Hintergrund, damit keine Linie den Text durchbricht; auch für
    // kopierte schwarz-weiß-Versionen eindeutig (gestrichelt/gepunktet/durchgezogen)
    annotations: {
      points: [
        {
          x: labels[lastIdx],
          y: parseFloat(lagerhaltungskostenData[lastIdx]),
          marker: { size: 0 },
          label: {
            text: "Lagerhaltungskosten",
            textAnchor: "end",
            offsetX: -12,
            offsetY: 24,
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
          x: labels[lastIdx],
          y: parseFloat(bestellkostenData[lastIdx]),
          marker: { size: 0 },
          label: {
            text: "Bestellkosten",
            textAnchor: "end",
            offsetX: -12,
            offsetY: -18,
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
          x: labels[lastIdx],
          y: parseFloat(gesamtkostenData[lastIdx]),
          marker: { size: 0 },
          label: {
            text: "Gesamtkosten",
            textAnchor: "end",
            offsetX: -12,
            offsetY: -8,
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
      ],
    },
  };
  // Entferne den Inhalt des Containers und erstelle das Diagramm neu
  if (bestellChart) {
    try {
      bestellChart.destroy();
    } catch (e) {}
  }
  const chartContainer = document.querySelector("#chart");
  chartContainer.innerHTML = "";

  bestellChart = new ApexCharts(chartContainer, options);
  bestellChart
    .render()
    // Verzögerung: ApexCharts zeichnet die Annotation-Labels erst nach dem
    // auflösen des render()-Promises – sonst fehlen die Bezeichnungen im PNG
    .then(() => new Promise((warten) => setTimeout(warten, 1200)))
    .then(aktualisiereDiagrammPng)
    .catch((err) => {
      console.error("Diagramm-Fehler:", err);
      aktualisiereDiagrammPng(); // Lösung auch ohne Diagramm erzeugen
    });

  //~Ansichtsoptionen aus: Legende nur informativ (kein Ein-/Ausblende-Klick)
  chartContainer.style.position = "relative";
}

// Die Ansichtsoptionen (Legende aus, Export-Werkzeuge bleiben) nach dem
// Rendern in das Chart-DOM einsetzen – ApexCharts baut den Container-Inhalt
// beim Rendern neu auf, darum mehrfach/prüfen.
// Rastert das LIVE-SVG des Diagramms zu einem PNG-Daten-URI – im Gegensatz zu
// dataURI() bleiben die Annotation-Label-Texte (Bezeichnungen an den Linien)
// garantiert erhalten, weil genau das gerenderte SVG als Vorlage dient.
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

(function () {
  // Legende aus + Export-Werkzeuge beibehalten – im <head>, damit ApexCharts
  // den Stil bei jedem DOM-Neuaufbau nicht wieder entfernen kann
  window.chartStilSetzen = function () {
    if (document.getElementById("chartStil")) return;
    const pe = document.createElement("style");
    pe.id = "chartStil";
    pe.textContent =
      "#chart .apexcharts-legend{display:none!important;} " +
      "#chart .apexcharts-toolbar .apexcharts-zoom-icon, #chart .apexcharts-toolbar .apexcharts-zoomin-icon, #chart .apexcharts-toolbar .apexcharts-zoomout-icon, #chart .apexcharts-toolbar .apexcharts-pan-icon, #chart .apexcharts-toolbar .apexcharts-reset-zoom-icon{display:none!important;}";
    document.head.appendChild(pe);
  };
})();

// Diagramm als PNG unter die Tabelle im Container setzen (oder wieder entfernen)
function aktualisiereDiagrammPng() {
  const container = document.getElementById("Container");
  if (!container) return;

  window.chartStilSetzen();

  // Alle vorhandenen Diagramm-Kopien entfernen (auch im Editor-Layer)
  document.querySelectorAll("#diagrammPng").forEach((el) => el.remove());

  // Fall-Typ 3 ("nur Tabelle"): kein Diagramm im Container
  const fallTyp = (document.getElementById("bmVariante") || {}).value || "1";
  if (fallTyp === "3") {
    aktualisiereLoesung();
    return;
  }

  const cb = document.getElementById("chartAlsPng");
  if (!cb || !cb.checked || !bestellChart) {
    aktualisiereLoesung();
    return;
  }

  bestellChart
    .dataURI({ scale: 1 })
    .then(({ imgURI }) => {
      document.querySelectorAll("#diagrammPng").forEach((d) => d.remove());

      const img = document.createElement("img");
      img.src = imgURI;
      img.alt = "Diagramm Optimale Bestellmenge";
      img.style.cssText = "display:block; max-width:100%; height:auto;";
      img.style.width = (bestellChart.w?.globals?.svgWidth || 750) + "px";

      const div = document.createElement("div");
      div.id = "diagrammPng";
      div.innerHTML = "<br><h3>Diagramm</h3>";
      div.appendChild(img);

      // Diagramm direkt unter die Tabelle setzen (nicht ans Container-Ende,
      // sonst steht es hinter bzw. zwischen den Lösungen)
      const tabelle = container.querySelector("table");
      if (tabelle) tabelle.after(div);
      else container.appendChild(div);
      window.chartStilSetzen();
      aktualisiereLoesung();
    })
    .catch((err) => {
      console.error("PNG konnte nicht erstellt werden:", err);
      aktualisiereLoesung();
    });
}

// Lösung ans Ende des Containers setzen (unter Aufgabe, Tabelle und Diagramm)
function aktualisiereLoesung() {
  const container = document.getElementById("Container");
  if (!container) return;

  // ALLE vorhanden-Lösungen entfernen (auch Kopien im Editor-Layer),
  // damit die Lösung nie doppelt erscheint
  document.querySelectorAll("#bmLoesung").forEach((el) => el.remove());

  const menge = parseInt(
    document.getElementById("optimaleBestellmenge").value,
    10,
  );
  const haeuf = parseInt(
    document.getElementById("optimaleBestellhaeufigkeit").value,
    10,
  );
  const bk = parseInt(document.getElementById("bestellkosten").value, 10);
  if (!(menge > 0 && haeuf > 0 && bk > 0)) return;

  const bedarfL = menge * haeuf;
  const lager = roundToTwoDecimals((2 * bedarfL * bk) / (menge * menge));
  const durchschnitt = roundToTwoDecimals(bedarfL / (2 * haeuf));
  const bestellGes = roundToTwoDecimals(bk * haeuf);
  const lagerGes = roundToTwoDecimals(durchschnitt * lager);
  const gesamt = roundToTwoDecimals(bestellGes + lagerGes);

  const p = "margin:0 0 8px 0;";
  const div = document.createElement("div");
  div.id = "bmLoesung";

  const fallTyp = (document.getElementById("bmVariante") || {}).value || "1";
  if (fallTyp === "2") {
    // Nur Diagramm: Lösung verweist auf das Ablesen aus der Grafik –
    // nur die Bestellmenge ist ablesbar, keine Bestellhäufigkeit
    div.innerHTML = `
<h2 style="font-size:1.3em;" class="loesung">Lösung</h2>
<p style="${p}"><strong>Optimale Bestellmenge laut Diagramm</strong></p>
<p style="${p}">Aus dem Diagramm ergibt sich eine optimale Bestellmenge von <strong>${formatNumberWithSpace(menge)} Stück</strong>. An dieser Stelle schneiden sich die Kurven für Bestellkosten und Lagerkosten – beide Kostenarten sind hier gleich hoch. An der Kostenachse ist ablesbar, dass die Gesamtkosten an dieser Bestellmenge ihren niedrigsten Wert haben; bei jeder größeren oder kleineren Bestellmenge steigen die Gesamtkosten.</p>
<p style="${p}"><strong>Begründung</strong></p>
<p style="${p}">Mit steigender Bestellmenge sinken die Bestellkosten, da weniger Bestellungen nötig sind. Gleichzeitig steigen die Lagerkosten, weil der durchschnittliche Lagerbestand (Bestellmenge : 2) größer wird. Die Gesamtkosten fallen zunächst, erreichen ihr Minimum am Schnittpunkt beider Kurven und steigen danach wieder an. Die optimale Bestellmenge liegt genau an diesem Schnittpunkt.</p>`;
  } else if (fallTyp === "3") {
    // Nur Tabelle: Lösung verweist auf das Ermitteln aus der Tabelle
    div.innerHTML = `
<h2 style="font-size:1.3em;" class="loesung">Lösung</h2>
<p style="${p}"><strong>Optimale Bestellmenge laut Tabelle</strong></p>
<p style="${p}">Aus der Tabelle ergibt sich eine optimale Bestellmenge von <strong>${formatNumberWithSpace(menge)} Stück</strong> bei <strong>${haeuf} Bestellungen</strong> im Jahr (Jahresbedarf ${formatNumberWithSpace(bedarfL)} Stück), weil die Gesamtkosten hier mit <strong>${formatCurrency(gesamt)}</strong> am niedrigsten sind. Bestellkosten (${formatCurrency(bestellGes)}) und Lagerkosten (${formatCurrency(lagerGes)}) sind an dieser Stelle (ungefähr) gleich hoch.</p>
<p style="${p}"><strong>Begründung</strong></p>
<p style="${p}">Bei kleinen Bestellmengen übersteigen die hohen Bestellkosten die Einsparungen bei den Lagerkosten, bei großen Bestellmengen kehren sich die Größenverhältnisse um. Die Gesamtkosten sind genau dort am niedrigsten, wo beide Kostenarten (ungefähr) gleich hoch sind – also bei der optimalen Bestellmenge.</p>`;
  } else {
    div.innerHTML = `
<h2 style="font-size:1.3em;" class="loesung">Lösung</h2>
<p style="${p}"><strong>1. Zielkonflikt</strong></p>
<p style="${p}">Bestellt das Unternehmen selten, aber in großen Mengen, sinken die Bestellkosten, weil nur wenige Bestellungen anfallen. Gleichzeitig steigt der durchschnittliche Lagerbestand und damit steigen die Lagerkosten. Bestellt es dagegen oft kleine Mengen, sind die Lagerkosten niedrig, aber die Bestellkosten hoch. Beide Kostenarten verhalten sich gegenläufig. Ziel ist es, die Bestellmenge zu finden, bei der die Gesamtkosten am niedrigsten sind.</p>
<p style="${p}"><strong>2. Zusammenhang laut Diagramm</strong></p>
<p style="${p}">Mit steigender Bestellmenge sinken die Bestellkosten, da weniger Bestellungen nötig sind. Die Lagerhaltungskosten steigen dagegen gleichmäßig an, da der durchschnittliche Lagerbestand (Bestellmenge : 2) größer wird. Die Gesamtkosten sind die Summe beider Kurven. Sie fallen zunächst, erreichen ein Minimum und steigen dann wieder an. Das Minimum der Gesamtkosten liegt genau im Schnittpunkt der Kurven für Bestellkosten und Lagerhaltungskosten.</p>
<p style="${p}"><strong>3. Optimale Bestellmenge</strong></p>
<p style="${p}">Die optimale Bestellmenge beträgt <strong>${formatNumberWithSpace(menge)} Stück</strong> bei <strong>${haeuf} Bestellungen</strong> im Jahr. In der Tabelle sind hier die Gesamtkosten mit <strong>${formatCurrency(gesamt)}</strong> am niedrigsten. Bestellkosten (${formatCurrency(bestellGes)}) und Lagerkosten (${formatCurrency(lagerGes)}) sind (ungefähr) gleich hoch. In der Grafik liegt das Minimum der Gesamtkosten beim Schnittpunkt der Kurven für Bestell- und Lagerhaltungskosten.</p>`;
  }
  container.appendChild(div);

  // Editor initialisieren (einmalig), sobald die Aufgabe vollständig steht
  // (Aufgabe + Tabelle + Diagramm-PNG + Lösung). data-jodit-init erlaubt den
  // Jodit-Adopt auch für Container mit generierten Bildern.
  if (window.JoditEditor && !container._jodit) {
    container.setAttribute("data-jodit-init", "1");
    try {
      window.JoditEditor.init(container);
    } catch (e) {
      console.warn("Editor-Init fehlgeschlagen", e);
    }
  } else if (
    container._jodit &&
    container._jodit.editor &&
    container._jodit.editor.isConnected
  ) {
    // Bereits übernommen: Inhalt sofort in den Editor übernehmen, damit
    // die Lösung nie doppelt erscheint (sonst synchronisiert der
    // MutationObserver 300 ms später noch mal aus einem veralteten Stand)
    try {
      container._jodit.value = container.innerHTML;
      container._joditSrc = container.innerHTML;
    } catch (e) {
      console.warn("Editor-Sync fehlgeschlagen", e);
    }
  }
}

function exportiereMoodle() {
  const fallTyp = (document.getElementById("bmVariante") || {}).value || "1";
  if (fallTyp !== "2") {
    zeigeModal(
      "Moodle-Export ist nur für den Fall-Typ „Nur Diagramm (Bestellmenge ablesen)“ verfügbar. Bitte diesen Fall-Typ wählen und neu generieren.",
    );
    return;
  }

  const menge = parseInt(
    document.getElementById("optimaleBestellmenge")?.value,
    10,
  );
  if (!(menge > 0)) {
    zeigeModal("Bitte zuerst eine Aufgabe erstellen („Neue Aufgabe“).");
    return;
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n  <question type="cloze">\n    <name><text>Optimale Bestellmenge (Diagramm)</text></name>\n    <questiontext format="html"><text><![CDATA[{1:NUMERICAL:${menge}#0}]]></text></questiontext>\n    <generalfeedback format="html"><text></text></generalfeedback>\n    <penalty>0.3333333</penalty>\n    <hidden>0</hidden>\n  </question>\n</quiz>\n`;

  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  const dateiname = `quiz-bestellmenge-diagramm-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.xml`;

  const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = dateiname;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
window.exportiereMoodle = exportiereMoodle;

document.addEventListener("DOMContentLoaded", function () {
  // Hier wird generiereContainer() beim Laden der Seite ausgeführt
  berechneOptimaleBestellmengeUndHaeufigkeit();
});
