// ============================================================================
// GLOBALE VARIABLEN
// ============================================================================

let kunde = "<i>[Modellunternehmen]</i>";
let letztePreisAufgaben = [];
let letzteFallZeilen = []; // Fallbeispiel: Tabellenzeilen für den Moodle-Cloze-Export
let letzteFallName = ""; // Anzeigename des Unternehmens beim Generieren

// ============================================================================
// PREISRAHMEN AUS YAML-PRODUKTDATEN ÜBERNEHMEN
// Bei ausgewähltem Unternehmen mit Produktdaten (fertigerzeugnisse.hauptwerk)
// werden Min./Max.-Preis automatisch übernommen und die Felder ausgegraut.
// Nur ohne solche Daten bleibt der manuelle Preisrahmen aktiv.
// ============================================================================

function setzePreisfelderGesperrt(gesperrt) {
  ["preisMin", "preisMax"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.disabled = gesperrt;
    el.style.backgroundColor = gesperrt ? "#e9e9e9" : "";
    el.style.color = gesperrt ? "#777" : "";
  });
}

function wendePreisrahmenAn() {
  const kundeSelect = document.getElementById("diffKunde");
  const name = kundeSelect?.value?.trim() || "";
  const minInput = document.getElementById("preisMin");
  const maxInput = document.getElementById("preisMax");
  const hinweis = document.getElementById("preisRahmenHinweis");

  const company = name
    ? (yamlData || []).find((c) => c?.unternehmen?.name === name)
    : null;
  const produkte = (
    company?.unternehmen?.fertigerzeugnisse?.hauptwerk || []
  ).filter(
    (p) =>
      Number.isFinite(p?.preis_min) &&
      Number.isFinite(p?.preis_max) &&
      p.preis_max > p.preis_min,
  );

  if (produkte.length > 0 && minInput && maxInput) {
    const min = Math.min(...produkte.map((p) => p.preis_min));
    const max = Math.max(...produkte.map((p) => p.preis_max));
    if (min < max) {
      minInput.value = min;
      maxInput.value = max;
      setzePreisfelderGesperrt(true);
      if (hinweis) {
        hinweis.textContent = `🔒 Preisrahmen automatisch aus den Produktdaten von „${name}“ übernommen (${min.toLocaleString("de-DE")} € – ${max.toLocaleString("de-DE")} €).`;
        hinweis.style.color = "#155724";
      }
      return;
    }
  }

  setzePreisfelderGesperrt(false);
  if (hinweis) {
    hinweis.textContent =
      "Preisrahmen frei einstellbar (kein Unternehmen mit Produktdaten ausgewählt).";
    hinweis.style.color = "#666";
  }
}

// ============================================================================
// AUFGABENTYP-ADAPTER (Dropdown #aufgabenTyp)
// ============================================================================

function generiereAufgaben() {
  const typ = document.getElementById("aufgabenTyp")?.value || "text";
  if (typ === "fallbeispiel") {
    zeigeFallbeispielTabelle();
  } else {
    zeigeZufaelligePreisdifferenzierung();
  }
  // Moodle-Button-Beschriftung an den aktuellen Fragetyp anpassen
  window.exportMoodleLabel = () =>
    typ === "fallbeispiel"
      ? "Moodle-Lückentext (cloze, XML)"
      : "Moodle-Zuordnung (matching, XML)";
  if (typeof window.updateMoodleButtonLabel === "function")
    window.updateMoodleButtonLabel();
}

// ============================================================================
// YAML-DATEN LADEN (identisch zum Marketing-Generator)
// ============================================================================

// ============================================================================
// DROPDOWN BEFÜLLEN
// ============================================================================

function fillCompanyDropdowns() {
  if (!yamlData || yamlData.length === 0) return;

  const sortedCompanies = [...yamlData].sort((a, b) => {
    const brancheA = a.unternehmen?.branche || "";
    const brancheB = b.unternehmen?.branche || "";
    if (brancheA !== brancheB) return brancheA.localeCompare(brancheB);
    return (a.unternehmen?.name || "").localeCompare(b.unternehmen?.name || "");
  });

  const kundeSelect = document.getElementById("diffKunde");
  if (!kundeSelect) return;

  kundeSelect.innerHTML = "";
  const opt = document.createElement("option");
  opt.value = "";
  opt.text = "— bitte Unternehmen auswählen —";
  opt.disabled = true;
  opt.selected = true;
  kundeSelect.appendChild(opt);

  sortedCompanies.forEach((company) => {
    const u = company.unternehmen;
    if (!u?.name) return;

    const displayText = u.branche
      ? `${u.branche} – ${u.name} ${u.rechtsform || ""}`.trim()
      : `${u.name} ${u.rechtsform || ""}`.trim();

    const option = document.createElement("option");
    option.value = u.name;
    option.textContent = displayText;
    option.dataset.id = u.id || "";
    option.dataset.rechtsform = u.rechtsform || "";
    option.dataset.branche = u.branche || "";

    kundeSelect.appendChild(option);
  });
}

// ============================================================================
// PREISDIFFERENZIERUNG-DEFINITIONEN
// ============================================================================

function validierePreisEingabe() {
  const minInput = document.getElementById("preisMin");
  const maxInput = document.getElementById("preisMax");
  const hinweis = document.getElementById("preisHinweis");

  let minVal = parseInt(minInput.value);
  let maxVal = parseInt(maxInput.value);
  const fehler = [];

  // Absolutgrenzen erzwingen
  if (isNaN(minVal) || minVal < 1) {
    minVal = 1;
    minInput.value = 1;
  }
  if (minVal > 99998) {
    minVal = 99998;
    minInput.value = 99998;
  }
  if (isNaN(maxVal) || maxVal < 2) {
    maxVal = 2;
    maxInput.value = 2;
  }
  if (maxVal > 99999) {
    maxVal = 99999;
    maxInput.value = 99999;
  }

  // Mindestpreis muss kleiner als Höchstpreis sein
  if (minVal >= maxVal) {
    // Korrigiere: Mindestpreis auf Höchstpreis − 1 setzen
    minVal = maxVal - 1;
    minInput.value = minVal;
    fehler.push(
      `Mindestpreis wurde auf ${minVal} € korrigiert (muss kleiner als Höchstpreis sein).`,
    );
  }

  // Hinweisfeld anzeigen oder ausblenden
  if (fehler.length > 0) {
    hinweis.textContent = "⚠️ " + fehler.join(" ");
    hinweis.style.display = "block";
    setTimeout(() => {
      hinweis.style.display = "none";
    }, 4000);
  } else {
    hinweis.style.display = "none";
  }
}

function getPreisBereich() {
  const min = parseInt(document.getElementById("preisMin").value) || 100;
  const max = parseInt(document.getElementById("preisMax").value) || 1000;
  return { min: Math.min(min, max - 1), max: Math.max(min + 1, max) };
}

function zufallsPreisInBereich(von, bis) {
  const step = 5;
  const schritte = Math.floor((bis - von) / step);
  if (schritte <= 0) return von;
  return von + Math.floor(Math.random() * (schritte + 1)) * step;
}

// Gibt einen Preis und einen zweiten, abweichenden Preis zurück (für Vergleiche)
// Gibt einen Preis und einen zweiten, abweichenden Preis zurück (für Vergleiche)
function zweiPreise() {
  const { min, max } = getPreisBereich();
  // p1 im oberen Drittel wählen, damit nach unten genug Spielraum bleibt
  const drittel = Math.round((max - min) / 3);
  const p1 = zufallsPreisInBereich(min + drittel, max);
  // Zweiter Preis: 5–15 % günstiger
  const rabatt = 0.01 + Math.random() * 0.04;
  let p2 = Math.round((p1 * (1 - rabatt)) / 5) * 5;
  // Garantieren dass p2 wirklich kleiner als p1 und nicht unter min fällt
  p2 = Math.max(min, Math.min(p2, p1 - 5));
  return { hoch: p1, niedrig: p2 };
}

function einPreis() {
  const { min, max } = getPreisBereich();
  return zufallsPreisInBereich(min, max);
}

const differenzierungen = {
  person: {
    label: "Personenbezogene Preisdifferenzierung",
    kurzbeschreibung:
      "Verschiedene Preise für verschiedene Personengruppen (z. B. Schüler, Senioren)",
    formulierungen: [
      (u, ph, pn) =>
        `${u} verkauft ein Fertigerzeugnis regulär für ${ph} €. Schüler und Studierende erhalten dasselbe Produkt für ${pn} €, sofern sie ihren Ausweis vorzeigen.`,
      (u, ph, pn) =>
        `Ein Fertigerzeugnis von ${u} kostet für Erwachsene ${ph} €. Rentnerinnen und Rentner zahlen hingegen nur ${pn} € – der Preis richtet sich nach der Personengruppe, nicht nach dem Produkt.`,
      (u, ph, pn) =>
        `${u} bietet ein Fertigerzeugnis zum Preis von ${ph} € an. Mitglieder eines Vereins erhalten auf Nachweis einen Sonderpreis von ${pn} €.`,
      (u, ph, pn) =>
        `Für Gewerbetreibende berechnet ${u} bei einem Fertigerzeugnis ${ph} €. Privatpersonen zahlen denselben Listenpreis, Behörden hingegen erhalten einen Sonderpreis von ${pn} €.`,
      (u, ph, pn) =>
        `${u} legt für ein Fertigerzeugnis zwei Preise fest: ${ph} € für Neukunden und ${pn} € für Stammkunden, die bereits mehrfach gekauft haben.`,
      (u, ph, pn) =>
        `Das Fertigerzeugnis von ${u} kostet im Normalfall ${ph} €. Auszubildende und Schüler erhalten es auf Antrag für ${pn} €, da das Unternehmen junge Käufer gezielt ansprechen möchte.`,
    ],
  },

  menge: {
    label: "Mengenbezogene Preisdifferenzierung",
    kurzbeschreibung:
      "Günstigerer Preis bei größeren Abnahmemengen (Mengenrabatt)",
    formulierungen: [
      (u, ph, pn) =>
        `Bei ${u} kostet ein einzelnes Fertigerzeugnis ${ph} €. Wer mindestens zehn Stück auf einmal abnimmt, zahlt nur noch ${pn} € pro Stück.`,
      (u, ph, pn) =>
        `${u} berechnet für ein Fertigerzeugnis bei kleinen Bestellungen ${ph} € je Einheit. Ab einer Bestellmenge von 50 Stück sinkt der Stückpreis auf ${pn} €.`,
      (u, ph, pn) =>
        `Ein Fertigerzeugnis von ${u} wird im Einzelkauf für ${ph} € angeboten. Großabnehmer, die mehr als 20 Einheiten bestellen, erhalten einen Staffelpreis von ${pn} € pro Stück.`,
      (u, ph, pn) =>
        `${u} staffelt den Preis für ein Fertigerzeugnis nach Abnahmemenge: Bei 1–9 Stück werden ${ph} € fällig, ab 10 Stück nur noch ${pn} € je Einheit.`,
      (u, ph, pn) =>
        `Wer bei ${u} ein einzelnes Fertigerzeugnis kauft, zahlt ${ph} €. Für Bestellungen von Paletten oder Großmengen gilt ein reduzierter Preis von ${pn} € pro Stück.`,
      (u, ph, pn) =>
        `${u} gewährt bei einem Fertigerzeugnis einen Mengenrabatt: Der Einzelpreis beträgt ${ph} €, bei Abnahme von mindestens 25 Einheiten sinkt er auf ${pn} € pro Stück.`,
    ],
  },

  zeit: {
    label: "Zeitbezogene Preisdifferenzierung",
    kurzbeschreibung:
      "Verschiedene Preise zu verschiedenen Zeiten (z. B. Saison, Tageszeit)",
    formulierungen: [
      (u, ph, pn) =>
        `${u} verkauft ein Fertigerzeugnis in der Hauptsaison für ${ph} €. Außerhalb der Saison, wenn die Nachfrage geringer ist, wird dasselbe Produkt für ${pn} € angeboten.`,
      (u, ph, pn) =>
        `In den Sommermonaten berechnet ${u} für ein Fertigerzeugnis ${ph} €. Im Winter, wo die Nachfrage deutlich geringer ausfällt, liegt der Preis bei nur ${pn} €.`,
      (u, ph, pn) =>
        `${u} setzt den Preis für ein Fertigerzeugnis zu Spitzenzeiten auf ${ph} €. In Zeiten geringerer Nachfrage – etwa außerhalb der Stoßzeiten – werden nur ${pn} € verlangt.`,
      (u, ph, pn) =>
        `Kurz vor Weihnachten bietet ${u} ein Fertigerzeugnis für ${ph} € an. Nach den Feiertagen, wenn die Nachfrage abflaut, sinkt der Preis auf ${pn} €.`,
      (u, ph, pn) =>
        `${u} hat für ein Fertigerzeugnis unterschiedliche Preise je nach Jahreszeit festgelegt: In der Hochsaison ${ph} €, in der Nebensaison ${pn} €.`,
      (u, ph, pn) =>
        `Zu Messezeiten verkauft ${u} ein Fertigerzeugnis für ${ph} €. In den Wochen danach, wenn die Nachfrage nachlässt, reduziert das Unternehmen den Preis auf ${pn} €.`,
    ],
  },

  raum: {
    label: "Raumbezogene Preisdifferenzierung",
    kurzbeschreibung:
      "Verschiedene Preise je nach Verkaufsort oder Absatzgebiet (Region, Land, online/stationär)",
    formulierungen: [
      (u, ph, pn) =>
        `${u} verkauft ein Fertigerzeugnis im stationären Fachhandel für ${ph} €. Im eigenen Online-Shop ist dasselbe Produkt für ${pn} € erhältlich, da dort geringere Betriebskosten anfallen.`,
      (u, ph, pn) =>
        `Im Ladengeschäft von ${u} kostet ein Fertigerzeugnis ${ph} €. Wer es über die Website bestellt, zahlt nur ${pn} € – der Preis hängt davon ab, wo gekauft wird.`,
      (u, ph, pn) =>
        `${u} verkauft ein Fertigerzeugnis im Inland für ${ph} €. Auf dem ausländischen Markt, wo die Kaufkraft geringer ist, wird dasselbe Produkt für ${pn} € angeboten.`,
      (u, ph, pn) =>
        `In Großstädten berechnet ${u} für ein Fertigerzeugnis ${ph} €. In ländlichen Regionen mit schwächerer Nachfrage liegt der Preis bei ${pn} €.`,
      (u, ph, pn) =>
        `Auf dem deutschen Markt kostet ein Fertigerzeugnis von ${u} ${ph} €. Für den Export in Länder mit niedrigerem Preisniveau gilt ein Exportpreis von ${pn} €.`,
      (u, ph, pn) =>
        `${u} legt für ein Fertigerzeugnis je nach Absatzgebiet unterschiedliche Preise fest: Im Inland ${ph} €, im benachbarten Ausland ${pn} € – angepasst an die dortigen Marktbedingungen.`,
      (u, ph, pn) =>
        `Im eigenen Flagship-Store in der Innenstadt berechnet ${u} für ein Fertigerzeugnis ${ph} €. Auf dem Marktplatz einer Partnerplattform im Internet wird dasselbe Produkt für ${pn} € angeboten.`,
      (u, ph, pn) =>
        `${u} betreibt sowohl einen stationären Laden als auch einen Online-Shop. Ein Fertigerzeugnis kostet im Laden ${ph} €, online hingegen nur ${pn} € – das Unternehmen passt den Preis dem jeweiligen Vertriebsweg an.`,
      (u, ph, pn) =>
        `${u} differenziert den Preis für ein Fertigerzeugnis regional: Im wirtschaftsstarken Süden werden ${ph} € verlangt, in strukturschwächeren Regionen hingegen nur ${pn} €.`,
    ],
  },
};

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================

const unternehmensVarianten = [
  (name) => name,
  (name) => `Firma ${name}`,
  (name) => `Unternehmen ${name}`,
];

// ============================================================================
// AUFGABENTYP 2: FALLBEISPIEL – PREISLISTE
// Tabelle im Stil von Arbeitsblatt-Aufgaben (Modell | Nettopreis 1/2 |
// Preisdifferenzierung), letzte Spalte als Schreiblinie zum Eintragen.
// ============================================================================

// Beschriftungspaare je Differenzierungsart:
// „hoch" = Beschriftung Nettopreis 1, „niedrig" = Beschriftung Nettopreis 2
const preisLabelVarianten = {
  person: [
    { hoch: "Normalpreis", niedrig: "Bestandskunden-Preis" },
    { hoch: "Privatkunden", niedrig: "Geschäftskunden" },
    { hoch: "Regulärer Preis", niedrig: "Mitarbeiterpreis" },
    { hoch: "Listenpreis", niedrig: "Stammkunden-Preis" },
  ],
  menge: [
    { hoch: "Normalpreis", niedrig: "Stückpreis ab 10 Stück" },
    { hoch: "Einzelpreis", niedrig: "Staffelpreis ab 25 Stück" },
    { hoch: "Einzelpreis", niedrig: "Stückpreis ab größerer Stückzahl" },
    { hoch: "Kleinbestellung", niedrig: "Großabnehmer" },
    { hoch: "Einzelkauf", niedrig: "Mengenrabatt ab 20 Stück" },
  ],
  zeit: [
    { hoch: "Frühling/Sommer", niedrig: "Herbst/Winter" },
    { hoch: "Hochsaison", niedrig: "Nebensaison" },
    { hoch: "Vor Weihnachten", niedrig: "Nach den Feiertagen" },
    { hoch: "Messetage", niedrig: "Rest der Saison" },
    { hoch: "Wirtschaftsboom", niedrig: "Rezession" },
  ],
  raum: [
    { hoch: "Fachhandel", niedrig: "Werkverkauf" },
    { hoch: "Fachhandel", niedrig: "Online-Shop" },
    { hoch: "Inland", niedrig: "Export" },
    { hoch: "Innenstadt-Geschäft", niedrig: "Ländliche Region" },
    { hoch: "Eigenes Ladengeschäft", niedrig: "Internet-Marktplatz" },
    { hoch: "Deutschland", niedrig: "Ausland" },
  ],
};

// Begründungssätze wurden entfernt – Lösung ist die Aufgaben-Tabelle
// mit ausgefüllter Spalte „Preisdifferenzierung“ (siehe unten).

// Zuständige Kurzform je Differenzierungsart (u. a. Lösungstabelle & Moodle-Cloze-Dropdowns)
const FALL_CLOZE_OPTIONEN = {
  person: "personenbezogen",
  menge: "mengenbezogen",
  zeit: "zeitbezogen",
  raum: "raumbezogen",
};

function erzeugeFallPreise(pmin, pmax) {
  let min = Number.isFinite(pmin) ? pmin : 100;
  let max = Number.isFinite(pmax) ? pmax : 1000;
  if (min < 1) min = 1;
  if (max <= min) max = min + 5;
  // Normalpreis im oberen Drittel, damit genügend Spielraum nach unten bleibt
  const drittel = Math.round((max - min) / 3);
  const start = Math.min(min + drittel, max);
  let hoch = zufallsPreisInBereich(start, max);
  // Zweiter Preis 5–15 % günstiger, bleibt im Bereich des Produkts
  const rabatt = 0.05 + Math.random() * 0.1;
  let niedrig = Math.round((hoch * (1 - rabatt)) / 5) * 5;
  niedrig = Math.max(min, Math.min(niedrig, hoch - 5));
  if (niedrig >= hoch) niedrig = hoch - 5; // immer echt günstiger
  if (niedrig < min) {
    // sehr kleinen Bereich anheben
    niedrig = min;
    if (hoch - niedrig < 5) hoch = niedrig + 5;
  }
  return { hoch, niedrig };
}

function zeigeFallbeispielTabelle() {
  const container = document.getElementById("Container");
  if (!container) {
    console.error("Container nicht gefunden");
    return;
  }

  validierePreisEingabe();

  const kundeSelect = document.getElementById("diffKunde");
  const name = kundeSelect?.value?.trim() || "";
  const anzeigeName = name || "[Modellunternehmen]";

  // Modelle: aus den YAML-Produktdaten des Unternehmens, sonst Platzhalter
  const company = name
    ? (yamlData || []).find((c) => c?.unternehmen?.name === name)
    : null;
  const produkte = (company?.unternehmen?.fertigerzeugnisse?.hauptwerk || [])
    .filter(
      (p) =>
        p?.name &&
        Number.isFinite(p?.preis_min) &&
        Number.isFinite(p?.preis_max) &&
        p.preis_max > p.preis_min,
    )
    .filter((p, i, liste) => liste.findIndex((x) => x.name === p.name) === i);

  let modelle;
  if (produkte.length >= 2) {
    const anzahl = Math.min(produkte.length, 4); // 2–4 Zeilen
    modelle = shuffle([...produkte]).slice(0, anzahl);
  } else {
    // Platzhalter-Modelle auf Basis des (evtl. manuellen) Preisrahmens
    const { min, max } = getPreisBereich();
    const namen = ["Modell 1", "Modell 2", "Modell 3", "Modell 4"];
    const anzahl = Math.random() < 0.5 ? 3 : 4;
    modelle = [];
    for (let i = 0; i < anzahl; i++) {
      modelle.push({ name: namen[i], preis_min: min, preis_max: max });
    }
  }

  // Je Zeile eine andere Differenzierungsart (max. 4 Zeilen = alle 4 Arten)
  const diffKeys = shuffle(["person", "menge", "zeit", "raum"]).slice(
    0,
    modelle.length,
  );

  const zelle = "border:1px solid #555; padding:4px 10px;";
  const zelleZ = "border:1px solid #555; padding:4px 10px; text-align:center;";
  const kopf =
    "border:1px solid #555; padding:4px 10px; background-color:#d9d9d9;";
  const preis = (v) =>
    v.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €";

  let aufgabenHTML = `
    <p>In der Marketingabteilung von <strong>„${anzeigeName}“</strong> liegt eine Preisliste für verschiedene Modelle vor. Nenne mit dem Fachbegriff jeweils die Art der Preisdifferenzierung:</p>
    <table style="border-collapse: collapse; font-family: inherit; min-width: 560px;">
      <thead>
        <tr>
          <th style="${zelle}">Modell</th>
          <th style="${kopf}">Nettopreis 1</th>
          <th style="${kopf}">Nettopreis 2</th>
          <th style="${kopf}">Preisdifferenzierung</th>
        </tr>
      </thead>
      <tbody>`;

  const zeilen = letzteFallZeilen; // global: für den Moodle-Cloze-Export
  zeilen.length = 0;
  letzteFallName = anzeigeName;
  letztePreisAufgaben = [];

  modelle.forEach((modell, idx) => {
    const diffKey = diffKeys[idx];
    const diff = differenzierungen[diffKey];
    const vari = pick(preisLabelVarianten[diffKey]);
    const { hoch, niedrig } = erzeugeFallPreise(
      modell.preis_min,
      modell.preis_max,
    );
    const hochText = preis(hoch);
    const niedrigText = preis(niedrig);
    zeilen.push({
      name: modell.name,
      vari,
      hochText,
      niedrigText,
      diffKey,
      diff,
    });

    aufgabenHTML += `
        <tr>
          <td style="${zelle}">&bdquo;${modell.name}&ldquo;</td>
          <td style="${zelleZ}">${vari.hoch}<br><strong>${hochText}</strong></td>
          <td style="${zelleZ}">${vari.niedrig}<br><strong>${niedrigText}</strong></td>
          <td style="${zelleZ} min-width:140px;">&nbsp;</td>
        </tr>`;

    // Moodle-Export (Zuordnungs-Export fallback / Textausgabe): Tabellenzeile = Teilfrage
    letztePreisAufgaben.push({
      text: `Preisliste &bdquo;${modell.name}&ldquo;: ${vari.hoch} → ${hochText} / ${vari.niedrig} → ${niedrigText}`,
      label: diff.label,
    });
  });

  aufgabenHTML += "</tbody></table>";

  let loesungenHTML = '<h2 class="loesung">Lösung</h2>';
  // Identische Tabelle wie in der Aufgabe – letzte Spalte mit dem Fachbegriff gefüllt
  loesungenHTML += `
    <table style="border-collapse: collapse; font-family: inherit; min-width: 560px;">
      <thead>
        <tr>
          <th style="${zelle}">Modell</th>
          <th style="${kopf}">Nettopreis 1</th>
          <th style="${kopf}">Nettopreis 2</th>
          <th style="${kopf}">Preisdifferenzierung</th>
        </tr>
      </thead>
      <tbody>`;

  zeilen.forEach((z) => {
    loesungenHTML += `
        <tr>
          <td style="${zelle}">&bdquo;${z.name}&ldquo;</td>
          <td style="${zelleZ}">${z.vari.hoch}<br><strong>${z.hochText}</strong></td>
          <td style="${zelleZ}">${z.vari.niedrig}<br><strong>${z.niedrigText}</strong></td>
          <td style="${zelle}"><strong>${FALL_CLOZE_OPTIONEN[z.diffKey]}</strong></td>
        </tr>`;
  });

  loesungenHTML += "</tbody></table>";

  container.innerHTML = aufgabenHTML + loesungenHTML;
}

// ============================================================================
// HAUPTFUNKTION – PREISDIFFERENZIERUNG ANZEIGEN
// ============================================================================

function zeigeZufaelligePreisdifferenzierung() {
  const container = document.getElementById("Container");

  if (!container) {
    console.error("Container nicht gefunden");
    return;
  }

  validierePreisEingabe();

  const minVal = parseInt(document.getElementById("preisMin").value);
  const maxVal = parseInt(document.getElementById("preisMax").value);
  if (isNaN(minVal) || isNaN(maxVal) || minVal >= maxVal) return;

  container.innerHTML = "";

  const kundeSelect = document.getElementById("diffKunde");
  const kundeValue = kundeSelect?.value?.trim() || "";
  const anzeigeName = kundeValue || "[Modellunternehmen]";

  // Alle 4 Differenzierungsarten in zufälliger Reihenfolge
  const alleDiffKeys = shuffle(["person", "menge", "zeit", "raum"]);

  let aufgabenHTML = "<h2>Aufgaben</h2><ol>";
  let loesungenHTML = '<h2 class="loesung">Lösung</h2>';
  letztePreisAufgaben = [];

  alleDiffKeys.forEach((diffKey, idx) => {
    const diff = differenzierungen[diffKey];
    const { hoch, niedrig } = zweiPreise();
    const ausgabe = pick(unternehmensVarianten)(anzeigeName);
    const text = pick(diff.formulierungen)(
      ausgabe,
      hoch.toLocaleString("de-DE"),
      niedrig.toLocaleString("de-DE"),
    );
    letztePreisAufgaben.push({ text, label: diff.label });
    aufgabenHTML += `<li>${text}</li>`;

    loesungenHTML += `<div style="margin-top: 1.5em;"><strong>${idx + 1}.</strong><br>`;
    loesungenHTML += `<div style="border: 1px solid #ccc; background-color:#fff; font-family:courier; padding: 4px 8px; margin: 0 0 6px;">
      <strong>${diff.label}</strong> – ${diff.kurzbeschreibung}
    </div>`;
    loesungenHTML += `</div>`;
  });

  aufgabenHTML += "</ol>";
  container.innerHTML = aufgabenHTML + loesungenHTML;
}

// ============================================================================
// KI-ASSISTENT PROMPT
// ============================================================================

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Marketing-Assistent für Schüler der Realschule (BwR). Du hilfst beim Verständnis von Preisdifferenzierung.

Aufgabe:
- Gib KEINE fertigen Lösungen (Begriffsnamen) vor.
- Führe die Schüler durch gezielte Fragen und Hinweise zur richtigen Zuordnung.
- Ziel: Lernförderung, nicht das Abnehmen der Denkarbeit.

Pädagogischer Ansatz:
- Frage, welches Merkmal den Preisunterschied auslöst (Person? Menge? Zeit? Ort?).
- Stelle gezielte Rückfragen, um den Stand des Schülers zu verstehen.
- Beantworte deine Rückfragen nicht selbst, hake bei falschen Antworten nach.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Erst wenn der Schüler selbst auf den richtigen Begriff kommt, bestätige ihn.

Methodik bei Rückfragen:
- Wer zahlt den niedrigeren Preis – alle oder nur bestimmte Personen?
- Spielt die Menge eine Rolle?
- Hängt der Preis vom Zeitpunkt ab?
- Ist der Preis in einer Region anders als in einer anderen?

Die vier Arten der Preisdifferenzierung:

1. Personenbezogene Preisdifferenzierung
   - Verschiedene Preise für verschiedene Personengruppen
   - Beispiele: Schüler, Senioren, Vereinsmitglieder, Stammkunden
   - Kriterium: Wer kauft?

2. Mengenbezogene Preisdifferenzierung
   - Günstigerer Stückpreis bei größerer Abnahmemenge
   - Beispiele: Mengenrabatt, Staffelpreise, Großhandelspreise
   - Kriterium: Wie viel wird gekauft?

3. Zeitbezogene Preisdifferenzierung
   - Verschiedene Preise zu verschiedenen Zeiten
   - Beispiele: Saison, Tageszeit, Stoßzeiten, Feiertage
   - Kriterium: Wann wird gekauft?

4. Raumbezogene Preisdifferenzierung
   - Verschiedene Preise in verschiedenen Regionen oder Märkten
   - Beispiele: Inland vs. Ausland, Großstadt vs. Land, verschiedene Länder
   - Kriterium: Wo wird gekauft?

Typische Abgrenzungsfehler der Schüler – darauf hinweisen, nicht vorwegnehmen:
- Zeitbezogen ≠ Mengenbezogen (auch wenn beides „weniger zahlen" bedeuten kann)
- Raumbezogen ≠ Personenbezogen (Auslandspreise hängen am Ort, nicht an der Person)
- Das auslösende Merkmal entscheidet – nicht der Preis selbst

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe mit Realschülerinnen und -schülern
- Einfache Sprache, keine Fachbegriffe ohne Erklärung
- Kurze Antworten – maximal 1–2 Sätze pro Nachricht
- Gelegentlich Emojis zur Auflockerung 💰📊✅❓

Was du NICHT tust:
- Nenne den Fachbegriff nicht, bevor der Schüler ihn selbst erarbeitet hat
- Gib keine Lösungen auf Anfragen wie „sag mir einfach die Antwort" – erkläre, dass das Ziel das eigene Verstehen ist
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
    .catch((err) => {
      console.error("Fehler beim Kopieren:", err);
      zeigeModal(
        "Kopieren nicht möglich. Bitte manuell aus dem Textfeld kopieren.",
      );
    });
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
  const kundeSelect = document.getElementById("diffKunde");

  if (kundeSelect && kundeSelect.value) {
    kunde = kundeSelect.value.trim();
  }

  kundeSelect.addEventListener("change", () => {
    kunde = kundeSelect.value.trim() || "";
    wendePreisrahmenAn();
  });

  const starteGenerator = () => {
    fillCompanyDropdowns();
    autoSelectMyCompany();
    wendePreisrahmenAn();
    generiereAufgaben();
  };

  // Dropdown befüllen → "Modellunternehmen" wählen → Preisrahmen übernehmen →
  // Aufgaben starten, sobald die YAML-Daten tatsächlich geladen sind
  if (yamlData && yamlData.length > 0) {
    starteGenerator();
  } else {
    document.addEventListener("yamlDataLoaded", starteGenerator, {
      once: true,
    });
  }

  const vorschauEl = document.getElementById("kiPromptVorschau");
  if (vorschauEl) {
    vorschauEl.textContent = KI_ASSISTENT_PROMPT;
  }
});

// ============================================================================
// MOODLE-XML-EXPORT – Fragetyp „Zuordnung“ (matching), alle Aufgaben in EINER Frage
// ============================================================================

const MOODLE_PREIS_PRAEFIX = "8.3-03";
const MOODLE_PREIS_TITELENDE = "meinBwR-Zuordnen";
const MOODLE_FALL_TITELENDE = "meinBwR-Cloze";
const MOODLE_PREIS_ANWEISUNG =
  "Ordne die jeweilige Art der Preisdifferenzierung zu!";
const MOODLE_PREIS_PUNKTE_PRO_AUFGABE = 1;

function mxEsc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function mxCdata(s) {
  return (
    "<![CDATA[" + String(s ?? "").replace(/\]\]>/g, "]]]]><![CDATA[>") + "]]>"
  );
}

// Eindeutige, zeitabhängige ID (yyMMddHHmmss), pro Browser streng aufsteigend
function mxIdBasis() {
  const SCHLUESSEL = "moodlePreisLetzteIdSekunde";
  let sek = Math.floor(Date.now() / 1000);
  try {
    const letzte = Number(localStorage.getItem(SCHLUESSEL)) || 0;
    if (sek <= letzte) sek = letzte + 1;
    localStorage.setItem(SCHLUESSEL, String(sek));
  } catch (e) {
    /* ohne localStorage: nur Zeitstempel */
  }
  const d = new Date(sek * 1000);
  const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getFullYear() % 100)}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function mxBaueMatchingXml(aufgaben) {
  const punkte = aufgaben.length * MOODLE_PREIS_PUNKTE_PRO_AUFGABE;
  const titel = `${MOODLE_PREIS_PRAEFIX}T${mxIdBasis()}${MOODLE_PREIS_TITELENDE}`;
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n';
  xml += `  <question type="matching">\n`;
  xml += `    <name>\n      <text>${mxEsc(titel)}</text>\n    </name>\n`;
  xml += `    <questiontext format="html">\n      <text>${mxCdata(`<p>${MOODLE_PREIS_ANWEISUNG}</p>`)}</text>\n    </questiontext>\n`;
  xml += `    <generalfeedback format="html">\n      <text></text>\n    </generalfeedback>\n`;
  xml += `    <defaultgrade>${punkte}</defaultgrade>\n    <penalty>0.3333333</penalty>\n    <hidden>0</hidden>\n    <idnumber></idnumber>\n`;
  xml += `    <shuffleanswers>true</shuffleanswers>\n`;
  xml += `    <correctfeedback format="html">\n      <text>${mxCdata("<p>Die Antwort ist richtig.</p>")}</text>\n    </correctfeedback>\n`;
  xml += `    <partiallycorrectfeedback format="html">\n      <text>${mxCdata("<p>Die Antwort ist teilweise richtig.</p>")}</text>\n    </partiallycorrectfeedback>\n`;
  xml += `    <incorrectfeedback format="html">\n      <text>${mxCdata("<p>Die Antwort ist falsch.</p>")}</text>\n    </incorrectfeedback>\n`;
  xml += `    <shownumcorrect/>\n`;

  aufgaben.forEach(({ text, label }) => {
    xml += `    <subquestion format="html">\n`;
    xml += `      <text>${mxCdata(`<p>${text}</p><hr>`)}</text>\n`;
    xml += `      <answer>\n        <text>${mxEsc(label)}</text>\n      </answer>\n`;
    xml += `    </subquestion>\n`;
  });

  xml += `  </question>\n\n</quiz>\n`;
  return xml;
}

// ============================================================================
// MOODLE-XML-EXPORT FALLBEISPIEL – Fragetyp „Cloze“ (Lückentext)
// Die Preislisten-Tabelle wird als Frage übernommen, in jeder Zeile sitzt
// in der Spalte „Preisdifferenzierung“ ein Inline-Dropdown (MULTICHOICE).
// ============================================================================

// Kurzform der vier Differenzierungsarten für die Inline-Dropdowns
// (FALL_CLOZE_OPTIONEN ist im Fallbeispiel-Abschnitt oben definiert)

// Sonderzeichen, die in Cloze-Antworten maskiert werden müssen
function clozeEsc(s) {
  return String(s ?? "").replace(/([\\}#~\/])/g, "\\$1");
}

// Ein MULTICHOICE-Dropdown mit 4 shuffled Optionen (richtig = „=“)
function fallClozeSelect(diffKey) {
  const richtig = FALL_CLOZE_OPTIONEN[diffKey];
  const optionen = shuffle(Object.keys(FALL_CLOZE_OPTIONEN)).map(
    (k) =>
      (FALL_CLOZE_OPTIONEN[k] === richtig ? "=" : "") +
      clozeEsc(FALL_CLOZE_OPTIONEN[k]),
  );
  return "{1:MULTICHOICE:" + optionen.join("~") + "}";
}

function baueFallClozeXml() {
  if (!letzteFallZeilen.length) return null;

  const zelle = "border:1px solid #555; padding:4px 10px;";
  const zelleZ = "border:1px solid #555; padding:4px 10px; text-align:center;";
  const kopf =
    "border:1px solid #555; padding:4px 10px; background-color:#d9d9d9;";

  let table = `
    <table style="border-collapse: collapse; font-family: inherit; min-width: 560px;">
      <thead>
        <tr>
          <th style="${zelle}">Modell</th>
          <th style="${kopf}">Nettopreis 1</th>
          <th style="${kopf}">Nettopreis 2</th>
          <th style="${kopf}">Preisdifferenzierung</th>
        </tr>
      </thead>
      <tbody>`;

  letzteFallZeilen.forEach((z) => {
    table += `
        <tr>
          <td style="${zelle}">&bdquo;${z.name}&ldquo;</td>
          <td style="${zelleZ}">${z.vari.hoch}<br><strong>${z.hochText}</strong></td>
          <td style="${zelleZ}">${z.vari.niedrig}<br><strong>${z.niedrigText}</strong></td>
          <td style="${zelleZ} min-width:140px;">${fallClozeSelect(z.diffKey)}</td>
        </tr>`;
  });

  table += "</tbody></table>";

  const fragetext = `
    <p>In der Marketingabteilung von <strong>„${letzteFallName}“</strong> liegt eine Preisliste für verschiedene Modelle vor. Nenne mit dem Fachbegriff jeweils die Art der Preisdifferenzierung:</p>
    <p>In der Spalte <em>Preisdifferenzierung</em> jeweils die passende Art über das Dropdown auswählen: personenbezogen, mengenbezogen, zeitbezogen oder raumbezogen.</p>
    ${table}`;

  const punkte = letzteFallZeilen.length * MOODLE_PREIS_PUNKTE_PRO_AUFGABE;
  const titel = `${MOODLE_PREIS_PRAEFIX}T${mxIdBasis()}${MOODLE_FALL_TITELENDE}`;

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n';
  xml += `  <question type="cloze">\n`;
  xml += `    <name>\n      <text>${mxEsc(titel)}</text>\n    </name>\n`;
  xml += `    <questiontext format="html">\n      <text>${mxCdata(fragetext)}</text>\n    </questiontext>\n`;
  xml += `    <generalfeedback format="html">\n      <text></text>\n    </generalfeedback>\n`;
  xml += `    <defaultgrade>${punkte}</defaultgrade>\n    <penalty>0.3333333</penalty>\n    <hidden>0</hidden>\n    <idnumber></idnumber>\n`;
  xml += `    <shuffleanswers>false</shuffleanswers>\n`;
  xml += `  </question>\n\n</quiz>\n`;
  return xml;
}

function exportiereMoodleFallCloze() {
  const xml = baueFallClozeXml();
  if (!xml) {
    zeigeModal("Bitte zuerst Fallbeispiel-Aufgaben erstellen.");
    return;
  }

  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  const dateiname = `cloze-preisdifferenzierung-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.xml`;

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

function exportiereMoodle() {
  // Fallbeispiel → eigener Fragetyp „Cloze“ mit Inline-Dropdowns in der Tabelle
  const typ = document.getElementById("aufgabenTyp")?.value || "text";
  if (typ === "fallbeispiel") {
    exportiereMoodleFallCloze();
    return;
  }
  if (!letztePreisAufgaben.length) {
    zeigeModal("Bitte zuerst Aufgaben erstellen.");
    return;
  }
  const xml = mxBaueMatchingXml(letztePreisAufgaben);

  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  const dateiname = `quiz-preisdifferenzierung-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.xml`;

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

function autoSelectMyCompany() {
  const myCompanyName = localStorage.getItem("myCompany");
  if (!myCompanyName) return;

  const dropdowns = document.querySelectorAll("select.meinUnternehmen");
  dropdowns.forEach((dropdown) => {
    const options = Array.from(dropdown.options);
    const matchingOption = options.find((opt) => opt.value === myCompanyName);
    if (matchingOption) {
      dropdown.value = myCompanyName;
      const event = new Event("change", { bubbles: true });
      dropdown.dispatchEvent(event);
    }
  });
}

// (Aufruf erfolgt jetzt event-basiert über 'yamlDataLoaded' im ersten DOMContentLoaded-Handler)
