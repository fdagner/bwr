// yamlData wird von company-loader.js global bereitgestellt
let lieferer = "<i>[Modellunternehmen]</i>";

// ── Vermischte Aufgaben ──────────────────────────────────────────────────
let verkaufModusUeberschreibung = null;
const VERKAUF_MODI = [
  "verkaufBuchungssatz",
  "verkaufskalkulation",
  "verkaufDifferenzkalkulation",
  "verkaufSkontobuchungssatz",
];
function verkaufGetModus() {
  return (
    verkaufModusUeberschreibung ||
    document.getElementById("verkaufBuchungsoptionDropdown").value
  );
}

// ============================================================================
// BENUTZERDEFINIERTE UNTERNEHMEN - Integration
// ============================================================================

// Funktion zum Abrufen der benutzerdefinierten Unternehmen aus dem Local Storage

// Funktion zum Zusammenführen der benutzerdefinierten Unternehmen mit den Standard-YAML-Daten

// Versuch 1: Aus localStorage laden (wenn User eigene Datei hochgeladen hat)

// Start: zuerst localStorage, sonst Standard
document.addEventListener("DOMContentLoaded", () => {
  const kaeuferSelect = document.getElementById("einkaufLieferer");

  // Initialwert setzen
  if (kaeuferSelect && kaeuferSelect.value) {
    lieferer = kaeuferSelect.value.trim();
  }

  // Bei jeder Änderung aktualisieren
  kaeuferSelect.addEventListener("change", () => {
    lieferer = kaeuferSelect.value.trim() || ""; // leer wenn nichts ausgewählt
    console.log("Lieferer geändert:", lieferer);
  });
});

const verkaufAnzahlDropdown = document.getElementById("verkaufAnzahlDropdown");
const verkaufMitRabatt = document.getElementById("verkaufMitRabatt");
const verkaufMitBezugskosten = document.getElementById(
  "verkaufMitBezugskosten",
);
const verkaufMitVerkaufskalkulation = document.getElementById(
  "verkaufMitVerkaufskalkulation",
);
const verkaufSkontobuchungssatz = document.getElementById(
  "verkaufMitSkontobuchungssatz",
);
const verkaufMitRuecksendung = document.getElementById(
  "verkaufMitRuecksendung",
);

// ============================================================================
// OPTIONS-STATE: Wechselwirkung Rücksendungen ↔ Bezugskosten
// - verkaufskalkulation / verkaufDifferenzkalkulation: beide Checkboxen aus
// - reine Buchungssatz-Modi + Rücksendungen aktiv: Bezugskosten gesperrt
//   (Rücksendebeträge sind reine Warenwerte)
// - vermischt (gemischt): beide verfügbar, pro Geschäftsfall gegenseitig
//   ausgeschlossen (bzk-Fälle werden nie zurückgesendet)
// ============================================================================
function verkaufAktualisiereOptionenState() {
  const modus = verkaufGetModus();
  const rueckAktiv = !!verkaufMitRuecksendung?.checked;

  if (
    modus === "verkaufskalkulation" ||
    modus === "verkaufDifferenzkalkulation"
  ) {
    verkaufMitBezugskosten.disabled = true;
    verkaufMitBezugskosten.checked = false;
    if (verkaufMitRuecksendung) {
      verkaufMitRuecksendung.disabled = true;
      verkaufMitRuecksendung.checked = false;
    }
    return;
  }

  if (verkaufMitRuecksendung) verkaufMitRuecksendung.disabled = false;

  const bzkGesperrt =
    rueckAktiv &&
    (modus === "verkaufBuchungssatz" || modus === "verkaufSkontobuchungssatz");
  verkaufMitBezugskosten.disabled = bzkGesperrt;
  if (bzkGesperrt) verkaufMitBezugskosten.checked = false;
}

document.addEventListener("DOMContentLoaded", function () {
  const verkaufMitBezugskostenEl = document.getElementById(
    "verkaufMitBezugskosten",
  );
  const verkaufBuchungsoptionDropdown = document.getElementById(
    "verkaufBuchungsoptionDropdown",
  );

  verkaufBuchungsoptionDropdown.addEventListener(
    "change",
    verkaufAktualisiereOptionenState,
  );
  if (verkaufMitRuecksendung) {
    verkaufMitRuecksendung.addEventListener(
      "change",
      verkaufAktualisiereOptionenState,
    );
  }

  // Initialisiere den Zustand der Checkboxen beim Laden der Seite
  verkaufAktualisiereOptionenState();

  // Dropdown befüllen → "Modellunternehmen" wählen → Aufgaben starten,
  // sobald die YAML-Daten tatsächlich geladen sind
  if (yamlData && yamlData.length > 0) {
    fillCompanyDropdowns();
    autoSelectMyCompany();
    verkaufZeigeZufaelligenSatz();
  } else {
    // Falls yamlData noch nicht geladen → auf Event warten oder fetch auslösen
    document.addEventListener(
      "yamlDataLoaded",
      () => {
        fillCompanyDropdowns();
        autoSelectMyCompany();
        verkaufZeigeZufaelligenSatz();
      },
      { once: true },
    );
  }
});

// Auf 2 Dezimalstellen runden

// Funktion für zufällige Zahlen Rabatt, Gewinn und Bezugskosten
function getRandomIntegerWithSteps(min, max, step) {
  const range = (max - min) / step;
  return Math.floor(Math.random() * range) * step + min;
}

function getRandomRabatt() {
  return getRandomIntegerWithSteps(5, 25, 5);
}

function getRandomGewinn() {
  // Generiere eine zufällige Ganzzahl zwischen 0 und 25 in 1er-Schritten
  let randomNumber = Math.floor(Math.random() * 26);
  // Stelle sicher, dass die Zahl zwischen 6 und 25 liegt
  while (randomNumber < 5) {
    randomNumber = Math.floor(Math.random() * 26);
  }
  return randomNumber;
}

function getRandomWunschGewinn() {
  // Generiere eine zufällige Ganzzahl zwischen -15 und 10 in 1er-Schritten
  return Math.floor(Math.random() * 26) - 15;
}

function getRandomBezugskosten() {
  return getRandomIntegerWithSteps(50, 250, 5);
}

// Funktion zur Generierung einer Zufallsganzzahl für den Nettowert
function generateRandomNettoWert() {
  let randomNumber = Math.round(Math.random() * (20000 - 500)) + 500; // Zufallszahl zwischen 2500 und 50000
  randomNumber = Math.round(randomNumber / 100) * 100; // Auf Hundert gerundet
  return randomNumber;
}

// Währung nach DIN 5008

// Kontenplan
// ── Konten: zentral aus dem Kontenplan (js/utils.js) bezogen ────────────────
// Nur Kontonummern angeben – Abkürzung und Label liefert kontoLabel().
const UEFE = kontoLabel("5000"); // Umsatzerlöse für eigene Erzeugnisse
const EBFE = kontoLabel("5001"); // Erlösberichtigungen (Nachlässe)
const FO = kontoLabel("2400"); // Forderungen aus LL
const UST = kontoLabel("4800"); // Umsatzsteuer
const KA = kontoLabel("2880"); // Kasse
const BK = kontoLabel("2800"); // Bank

const kontenUmsatzserloese = {
  Fertigerzeugnisse: {
    Hauptkonto: UEFE,
    Nachlasskonto: EBFE,
  },
};

const kontenUmsatzerloese_2 = {
  "von Fertigerzeugnissen": {
    Hauptkonto: UEFE,
    Nachlasskonto: EBFE,
  },
};

let verkaufKontenZahlung;
function inputSellChangeCategory() {
  if (
    verkaufGetModus() === "verkaufskalkulation" ||
    verkaufGetModus() === "verkaufSkontobuchungssatz"
  ) {
    verkaufKontenZahlung = {
      " gegen Rechnung": FO,
      " auf Rechnung": FO,
    };
  } else {
    verkaufKontenZahlung = {
      "gegen Rechnung": FO,
      "mit Versenden einer Ausgangsrechnung": FO,
      "auf Rechnung": FO,
      "auf Ziel": FO,
    };
  }
}

// Zuletzt gewähltes Fertigerzeugnis (wird auch für den Beleg-Button gebraucht)
let verkaufAktuellesProdukt = null;
let verkaufAktuelleMenge = null;
let verkaufAktuellerStueckpreis = null;
let verkaufAktuelleEinheit = null;

// Zufälliges Fertigerzeugnis des gewählten Verkäufers (oder null)
function verkaufWaehleProdukt() {
  const firma = yamlData.find((c) => c.unternehmen?.name === lieferer);
  const u = firma?.unternehmen;
  // "ferigerzeugnisse" = alter Tippfehler-Schlüssel in bereits gespeicherten Unternehmen
  const liste = (u?.fertigerzeugnisse || u?.ferigerzeugnisse)?.hauptwerk;
  if (!Array.isArray(liste)) return null;
  const gueltig = liste.filter((p) => p?.name && p.name.trim());
  if (gueltig.length === 0) return null;
  return gueltig[Math.floor(Math.random() * gueltig.length)];
}

// Zufällige Menge + Stückpreis innerhalb der Preisspanne des Produkts
function verkaufGeneriereMengeUndPreis(produkt) {
  const min = Number(produkt?.preis_min);
  const max = Number(produkt?.preis_max);

  // Kein Produkt oder keine gültige Spanne -> bisheriges Verhalten (ohne Menge)
  if (!produkt || !Number.isFinite(min) || !Number.isFinite(max) || max < min) {
    return {
      menge: null,
      stueckpreis: null,
      gesamt: generateRandomNettoWert(),
    };
  }

  // Stückpreis: zufällig in [min, max], gerundet (teure Produkte auf 100 €)
  const step = max >= 1000 ? 100 : max >= 100 ? 10 : 1;
  const lo = Math.ceil(min / step);
  const hi = Math.floor(max / step);
  const stueckpreis =
    hi < lo
      ? Math.round(min)
      : (lo + Math.floor(Math.random() * (hi - lo + 1))) * step;

  // Menge: mindestens 2, Obergrenze je nach Stückpreis, Gesamtwert max. 250.000 €
  let maxMenge =
    stueckpreis >= 5000
      ? 10
      : stueckpreis >= 1000
        ? 20
        : stueckpreis >= 100
          ? 50
          : 200;
  maxMenge = Math.max(2, Math.min(maxMenge, Math.floor(250000 / stueckpreis)));
  const menge = 2 + Math.floor(Math.random() * (maxMenge - 1));

  return { menge, stueckpreis, gesamt: menge * stueckpreis };
}

function verkaufErstelleZufallssatz() {
  inputSellChangeCategory();
  verkaufAktuellesProdukt = verkaufWaehleProdukt();
  const verkaufPosten = verkaufGeneriereMengeUndPreis(verkaufAktuellesProdukt);
  // Kein Fertigerzeugnis hinterlegt → zufällige Stückzahl; sie taucht dann in
  // der Aufgabe (Kalkulation/Differenzkalkulation), in der Mail und den Belegen auf
  let verkaufMengeStueck = null;
  if (
    !verkaufAktuellesProdukt &&
    (verkaufGetModus() === "verkaufDifferenzkalkulation" ||
      verkaufGetModus() === "verkaufskalkulation")
  ) {
    verkaufMengeStueck = 100 + Math.floor(Math.random() * 19) * 50; // 100–1000, 50er-Schritte
  }
  verkaufAktuelleMenge = verkaufPosten.menge || verkaufMengeStueck;
  verkaufAktuellerStueckpreis = verkaufPosten.stueckpreis;
  verkaufAktuelleEinheit = verkaufAktuellesProdukt?.einheit
    ? String(verkaufAktuellesProdukt.einheit).trim()
    : verkaufMengeStueck
      ? "Stück"
      : null;
  const verkaufMengeText = verkaufPosten.menge
    ? `${verkaufPosten.menge}${verkaufAktuelleEinheit ? " " + verkaufAktuelleEinheit : ""} `
    : "";
  const verkaufProduktAkk = verkaufAktuellesProdukt
    ? `${verkaufMengeText}${verkaufAktuellesProdukt.name.trim()}`
    : "Fertigerzeugnisse";
  // Für Kundenanfrage/Angebot (Verkaufskalkulation & Differenzkalkulation):
  // ohne hinterlegtes Fertigerzeugnis wird eine zufällige Stückzahl
  // erwähnt ("150 Stück Fertigerzeugnisse"); mit Produkt gilt der
  // übliche Text (Menge + Einheit + Name)
  const verkaufProduktAkkAnfrage = verkaufMengeStueck
    ? `${verkaufMengeStueck} Stück Fertigerzeugnisse`
    : verkaufProduktAkk;
  const verkaufMitMenge = !!verkaufAktuelleMenge;
  const verkaufGes = verkaufMitMenge ? " insgesamt" : "";
  const verkaufLief = verkaufMitMenge ? " für die gesamte Lieferung" : "";
  const verkaufLP = verkaufMitMenge ? "Listenpreis" : "Listenpreis";
  let verkaufRandom_Rabatt = getRandomRabatt();
  let verkaufRandom_Bezugskosten = getRandomBezugskosten();
  let verkaufRandom_Gewinn = getRandomGewinn();
  let verkaufRandomSk = Math.random();
  let verkaufRandom_Skonto = verkaufRandomSk < 0.5 ? 2 : 3;
  verkaufRandom_Bezugskosten = formatCurrency(verkaufRandom_Bezugskosten);
  // Arrays mit verschiedenen Teilen des Satzes
  const verkaufArray_Subjekt = [
    `${lieferer} verkauft `,
    `${lieferer} liefert `,
    `Firma ${lieferer} verkauft `,
    `${lieferer} veräußert `,
    `${lieferer} hat verkauft: `,
  ];
  const verkaufArray_Subjekt_2 = [`Es werden von ${lieferer} verkauft: `];
  const verkaufArray_Subjekt_3 = [
    `Ein Kunde bittet um ein Angebot für ${verkaufProduktAkkAnfrage}. Berechne den Listenverkaufspreis${verkaufLief} unter den folgenden Bedingungen: `,
    `${lieferer} erhält eine Anfrage für ein Angebot per E-Mail für ${verkaufProduktAkkAnfrage}. Du sollst nun den Listenverkaufspreis${verkaufLief} berechnen, wenn wir mit den folgenden Werten kalkulieren: `,
  ];
  const verkaufArray_Subjekt_4 = [
    `${lieferer} erreicht eine telefonische Anfrage für ${verkaufProduktAkkAnfrage}. Berechne den Listenverkaufspreis${verkaufLief} bei`,
    `${lieferer} erhält eine Kundenanfrage per Mail für ${verkaufProduktAkkAnfrage}. Berechne den Listenverkaufspreis${verkaufLief} bei `,
  ];
  const verkaufArray_Subjekt_5 = [
    `Ein Kunde bezahlt die Rechnung per Banküberweisung innerhalb der Skontofrist mit ${verkaufRandom_Skonto} % Skonto`,
    `Die Rechnung wird mit ${verkaufRandom_Skonto} % Skonto per Banküberweisung ausgeglichen`,
    `Der Rechnungsausgleich erfolgt mit ${verkaufRandom_Skonto} % Skonto per Bank`,
  ];
  const verkaufArray_Subjekt_6 = [
    `Ein Kunde möchte bei ${lieferer} ${verkaufProduktAkkAnfrage} kaufen und verhandelt über den Preis`,
    `${lieferer} erhält von einem Kunden eine Anfrage für ${verkaufProduktAkkAnfrage}`,
    `Ein Kunde sendet ${lieferer} per E-Mail eine Anfrage für ${verkaufProduktAkkAnfrage}`,
    `Ein Stammkunde möchte bei ${lieferer} ${verkaufProduktAkkAnfrage} kaufen und sendet eine Anfrage`,
  ];
  const verkaufArray_Fertigerzeugnisse = Object.keys(kontenUmsatzserloese);
  const verkaufArray_Fertigerzeugnisse_2 = Object.keys(kontenUmsatzerloese_2);
  const verkaufArray_Supply_Wert = verkaufMitMenge
    ? ["im Gesamtwert von", "mit einem Gesamtbetrag in Höhe von"]
    : [
        "mit einem Verkaufspreis in Höhe von",
        "im Wert von",
        "mit",
        "in Höhe von",
        "mit einem Betrag in Höhe von",
        "im Umfang von",
      ];
  const verkaufArray_Zahlung = Object.keys(verkaufKontenZahlung);
  const verkaufArray_Supply_Rabatt = [`, ${verkaufRandom_Rabatt} % Rabatt`];
  const verkaufArray_Supply_Rabatt_2 = [
    `. ${lieferer} bietet ${verkaufRandom_Rabatt} % Treuerabatt`,
    `. ${lieferer} bietet ${verkaufRandom_Rabatt} % Mengenrabatt`,
    `. ${verkaufRandom_Rabatt} % Sonderrabatt werden zusätzlich angeboten`,
    `. ${verkaufRandom_Rabatt} % Rabatt können vom Kunden abgezogen werden`,
    `. ${lieferer} gewährt zudem ${verkaufRandom_Rabatt} % Kundenrabatt`,
    `. ${lieferer} gewährt zudem ${verkaufRandom_Rabatt} % Mengenrabatt`,
  ];
  const verkaufArray_Supply_Skonto = [
    `. Der Kunde kann ${verkaufRandom_Skonto} % Skonto abziehen`,
    `. Der Skonto beträgt ${verkaufRandom_Skonto} %`,
    `. Als nachträglichen Preisnachlass wird ${verkaufRandom_Skonto} % Skonto angesetzt`,
  ];
  const verkaufArray_Supply_Skonto_2 = [
    ` und ${verkaufRandom_Skonto} % Skonto`,
    ` sowie ${verkaufRandom_Skonto} % Skonto`,
  ];
  const verkaufArray_Supply_Bezugskosten = [
    `. Zusätzlich belastet ${lieferer} den Kunden mit Versandkosten${verkaufLief} von netto ${verkaufRandom_Bezugskosten}`,
    `. Zusätzlich berechnet ${lieferer} Verpackungskosten${verkaufLief} in Höhe von ${verkaufRandom_Bezugskosten} netto`,
    `. Transportversicherung und Rollgeld betragen${verkaufLief} darüber hinaus netto ${verkaufRandom_Bezugskosten} und werden dem Kunden zusätzlich berechnet`,
    `. Die Leihverpackung${verkaufLief} in Höhe von ${verkaufRandom_Bezugskosten} netto wird dem Kunden zusätzlich berechnet`,
    `. Es werden darüber hinaus netto ${verkaufRandom_Bezugskosten} an Versandkosten${verkaufLief} dem Kunden berechnet`,
  ];
  const verkaufArray_Supply_Gewinn = [
    ` ${verkaufRandom_Gewinn} % Gewinnzuschlag `,
    ` ${verkaufRandom_Gewinn} % Gewinn `,
  ];

  // Zufällige Auswahl der Elemente und der alternativen Arrays
  const verkaufSelectedarray_Subjekt =
    Math.random() < 0.5 ? verkaufArray_Subjekt : verkaufArray_Subjekt_2;
  const verkaufSelectedarray_Fertigerzeugnisse =
    verkaufSelectedarray_Subjekt === verkaufArray_Subjekt_2
      ? verkaufArray_Fertigerzeugnisse_2
      : verkaufArray_Fertigerzeugnisse;
  const verkaufSelectedarray_Angebot =
    verkaufSelectedarray_Fertigerzeugnisse === verkaufArray_Fertigerzeugnisse
      ? verkaufArray_Subjekt_3
      : verkaufArray_Subjekt_4;
  // Zufällige Auswahl der Elemente aus den ausgewählten Arrays
  const verkaufRandomSubjekt =
    verkaufSelectedarray_Subjekt[
      Math.floor(Math.random() * verkaufSelectedarray_Subjekt.length)
    ];
  const verkaufRandomAngebot =
    verkaufSelectedarray_Angebot[
      Math.floor(Math.random() * verkaufSelectedarray_Angebot.length)
    ];
  const verkaufRandomFertigerzeugnis =
    verkaufSelectedarray_Fertigerzeugnisse[
      Math.floor(Math.random() * verkaufSelectedarray_Fertigerzeugnisse.length)
    ];
  const verkaufAnzeigeFertigerzeugnis = verkaufAktuellesProdukt
    ? verkaufProduktAkk
    : verkaufRandomFertigerzeugnis;
  const verkaufRandomSupply_Wert =
    verkaufArray_Supply_Wert[
      Math.floor(Math.random() * verkaufArray_Supply_Wert.length)
    ];
  const verkaufAntwortFertigerzeugnis =
    kontenUmsatzserloese[verkaufRandomFertigerzeugnis]?.Hauptkonto ||
    kontenUmsatzerloese_2[verkaufRandomFertigerzeugnis]?.Hauptkonto;
  const verkaufAntwortBezugskosten =
    kontenUmsatzserloese[verkaufRandomFertigerzeugnis]?.Unterkonto ||
    kontenUmsatzerloese_2[verkaufRandomFertigerzeugnis]?.Unterkonto;
  const verkaufAntwortSkontobuchungssatz =
    kontenUmsatzserloese[verkaufRandomFertigerzeugnis]?.Nachlasskonto ||
    kontenUmsatzerloese_2[verkaufRandomFertigerzeugnis]?.Nachlasskonto;
  const verkaufRandomSkontobuchungssatz =
    verkaufArray_Subjekt_5[
      Math.floor(Math.random() * verkaufArray_Subjekt_5.length)
    ];
  const verkaufRandomDifferenzkalkulation =
    verkaufArray_Subjekt_6[
      Math.floor(Math.random() * verkaufArray_Subjekt_6.length)
    ];
  const verkaufNettoOderBrutto = verkaufMitRabatt.checked
    ? "Netto"
    : Math.random() < 0.5
      ? "Netto"
      : "Brutto";
  let verkaufWert = verkaufPosten.gesamt;
  const verkaufRandomZahlung =
    verkaufArray_Zahlung[
      Math.floor(Math.random() * verkaufArray_Zahlung.length)
    ];
  const verkaufAntwortZahlung = verkaufKontenZahlung[verkaufRandomZahlung];
  if (verkaufAntwortZahlung === KA) {
    verkaufWert = parseFloat(verkaufWert) / 10;
  }
  const verkaufNettoWert = formatCurrency(verkaufWert);
  let verkaufBruttoWert = formatCurrency(
    Math.round((verkaufWert * UST_REGEL) / 100 + verkaufWert),
  );
  let verkaufRandomNettowert;

  // Anzeige wenn Brutto oder Netto
  verkaufRandomNettowert =
    verkaufNettoOderBrutto === "Netto"
      ? `${verkaufNettoWert} netto`
      : `brutto ${verkaufBruttoWert}`;
  let verkaufRandomSupply_Rabatt;
  let verkaufRandomSupply_Rabatt_2;
  let verkaufBerechnung_nettoWert;

  // Berechnung mit Rabatt
  if (verkaufMitRabatt.checked) {
    verkaufRandomSupply_Rabatt =
      verkaufArray_Supply_Rabatt[
        Math.floor(Math.random() * verkaufArray_Supply_Rabatt.length)
      ];
    verkaufRandomSupply_Rabatt_2 =
      verkaufArray_Supply_Rabatt_2[
        Math.floor(Math.random() * verkaufArray_Supply_Rabatt_2.length)
      ];
    verkaufBerechnung_nettoWert =
      (parseFloat(verkaufNettoWert.replace(/[^\d,-]/g, "")) *
        (100 - parseFloat(verkaufRandom_Rabatt))) /
      100;
  } else {
    verkaufRandom_Rabatt = 0;
    verkaufRandomSupply_Rabatt = "";
    verkaufRandomSupply_Rabatt_2 = "";
    verkaufBerechnung_nettoWert = parseFloat(
      verkaufNettoWert.replace(/[^\d,-]/g, ""),
    );
  }

  let verkaufRandomSupply_Skonto =
    verkaufArray_Supply_Skonto[
      Math.floor(Math.random() * verkaufArray_Supply_Skonto.length)
    ];
  let verkaufRandomSupply_Skonto_2 =
    verkaufArray_Supply_Skonto_2[
      Math.floor(Math.random() * verkaufArray_Supply_Skonto_2.length)
    ];
  let verkaufBerechnung_skontoBetrag =
    (verkaufRandom_Skonto / 100) * verkaufBerechnung_nettoWert;
  verkaufBerechnung_skontoBetrag = roundToTwoDecimals(
    verkaufBerechnung_skontoBetrag,
  );
  verkaufBerechnung_skontoBetrag = roundToTwoDecimals(
    verkaufBerechnung_skontoBetrag,
  );
  verkaufBerechnung_skontoBetrag = parseFloat(verkaufBerechnung_skontoBetrag);
  let verkaufBerechnung_skontoBetrag_brutto =
    verkaufBerechnung_skontoBetrag +
    (verkaufBerechnung_skontoBetrag * UST_REGEL) / 100;
  let verkaufBerechnung_vorsteuer_berichtigung =
    verkaufBerechnung_skontoBetrag_brutto - verkaufBerechnung_skontoBetrag;
  let verkaufVorsteuer_berichtigung = formatCurrency(
    verkaufBerechnung_vorsteuer_berichtigung,
  );
  let verkaufSkontoBetrag_brutto = formatCurrency(
    verkaufBerechnung_skontoBetrag_brutto,
  );

  let verkaufSkontoBetrag = formatCurrency(verkaufBerechnung_skontoBetrag);
  let verkaufBerechnung_USTWert =
    (verkaufBerechnung_nettoWert * UST_REGEL) / 100;
  verkaufBerechnung_USTWert = roundToTwoDecimals(verkaufBerechnung_USTWert);
  let verkaufBerechnung_bruttoWert =
    verkaufBerechnung_nettoWert + verkaufBerechnung_USTWert;
  let verkaufRandomSupply_Bezugskosten;

  // Berechnung mit Bezugskosten
  if (verkaufMitBezugskosten.checked) {
    verkaufRandomSupply_Bezugskosten =
      verkaufArray_Supply_Bezugskosten[
        Math.floor(Math.random() * verkaufArray_Supply_Bezugskosten.length)
      ];
    verkaufBerechnung_USTWert =
      ((verkaufBerechnung_nettoWert + parseFloat(verkaufRandom_Bezugskosten)) *
        UST_REGEL) /
      100;
    verkaufBerechnung_USTWert = roundToTwoDecimals(verkaufBerechnung_USTWert);
    verkaufBerechnung_bruttoWert =
      verkaufBerechnung_nettoWert +
      verkaufBerechnung_USTWert +
      parseFloat(verkaufRandom_Bezugskosten);
    verkaufBerechnung_bruttoWert = roundToTwoDecimals(
      verkaufBerechnung_bruttoWert,
    );
    verkaufBruttoWert = roundToTwoDecimals(
      (verkaufWert * UST_REGEL) / 100 +
        verkaufWert +
        (parseFloat(verkaufRandom_Bezugskosten) * UST_REGEL) / 100 +
        parseFloat(verkaufRandom_Bezugskosten),
    );
    verkaufBruttoWert = formatCurrency(verkaufBruttoWert);
  } else {
    verkaufRandom_Bezugskosten = 0;
    verkaufRandomSupply_Bezugskosten = "";
    verkaufBerechnung_USTWert = verkaufBerechnung_USTWert;
  }
  // Reiner Waren-Netto-Wert (BEVOR Bezugskosten aufgeschlagen werden) –
  // Basis für die Rücksende-Berechnung: Bei der Rücksendung zählen nur die
  // Fertigerzeugnisse, die Bezugskosten (direkt auf UEFE gebucht) nicht.
  const verkaufNettoWertWare = verkaufBerechnung_nettoWert;
  verkaufBerechnung_nettoWert =
    parseFloat(verkaufBerechnung_nettoWert) +
    parseFloat(verkaufRandom_Bezugskosten);
  verkaufBerechnung_nettoWert = roundToTwoDecimals(verkaufBerechnung_nettoWert);
  verkaufBerechnung_nettoWert = parseFloat(verkaufBerechnung_nettoWert);
  let verkaufBezugskostenWert = formatCurrency(verkaufRandom_Bezugskosten);

  let verkaufAntwortNettowert = formatCurrency(verkaufBerechnung_nettoWert);
  let verkaufBerechnung_rabattWert =
    (parseFloat(verkaufNettoWert.replace(/[^\d,-]/g, "")) *
      verkaufRandom_Rabatt) /
    100;
  verkaufBerechnung_rabattWert = roundToTwoDecimals(
    verkaufBerechnung_rabattWert,
  );
  let verkaufRabattWert = formatCurrency(verkaufBerechnung_rabattWert);

  // Gewinn Berechnen
  let verkaufBerechnung_barverkaufspreis =
    parseFloat(verkaufBerechnung_nettoWert) -
    parseFloat(verkaufBerechnung_skontoBetrag);
  verkaufBerechnung_barverkaufspreis = roundToTwoDecimals(
    verkaufBerechnung_barverkaufspreis,
  );
  verkaufBerechnung_barverkaufspreis = parseFloat(
    verkaufBerechnung_barverkaufspreis,
  );
  let verkaufBarverkaufspreis = formatCurrency(
    verkaufBerechnung_barverkaufspreis,
  );
  let verkaufRandomSupply_Gewinn =
    verkaufArray_Supply_Gewinn[
      Math.floor(Math.random() * verkaufArray_Supply_Gewinn.length)
    ];
  // Diferenzkalkualtion Gewinn
  let verkaufWunschRandom_Gewinn = getRandomWunschGewinn();
  let verkaufWunschGewinn;
  let verkauf_Random_Gewinn_Berechnet = 0;
  if (verkaufGetModus() === "verkaufDifferenzkalkulation") {
    verkaufWunschGewinn = parseFloat(verkaufRandom_Gewinn);
    verkaufRandom_Gewinn =
      parseFloat(verkaufRandom_Gewinn) + parseFloat(verkaufWunschRandom_Gewinn);
  } else {
    verkaufRandom_Gewinn = verkaufRandom_Gewinn;
  }
  let verkaufBerechnungGewinnWert =
    (parseFloat(verkaufBerechnung_barverkaufspreis) *
      parseFloat(verkaufRandom_Gewinn)) /
    (100 + parseFloat(verkaufRandom_Gewinn));
  verkaufBerechnungGewinnWert = roundToTwoDecimals(verkaufBerechnungGewinnWert);
  let verkaufGewinnWert = formatCurrency(verkaufBerechnungGewinnWert);
  let verkaufBerechnungSelbstkostenpreis =
    parseFloat(verkaufBerechnung_barverkaufspreis) -
    parseFloat(verkaufBerechnungGewinnWert);
  verkaufBerechnungSelbstkostenpreis = roundToTwoDecimals(
    verkaufBerechnungSelbstkostenpreis,
  );
  verkauf_Random_Gewinn_Berechnet = (
    (verkaufBerechnungGewinnWert * 100) /
    verkaufBerechnungSelbstkostenpreis
  ).toLocaleString("de-DE", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  });
  let verkaufSelbstkostenpreis = formatCurrency(
    verkaufBerechnungSelbstkostenpreis,
  );

  let verkaufKundenanfrage;
  if (verkaufGetModus() === "verkaufDifferenzkalkulation") {
    if (verkaufRandom_Gewinn < 0) {
      verkaufKundenanfrage =
        "Wir können die Kundenanfrage nicht akzeptieren, da wir Verlust machen würden.";
    } else if (verkaufRandom_Gewinn === 0) {
      verkaufKundenanfrage =
        "Wir würden unter den angegebenen Konditionen keinen Gewinn erzielen. Unter gewissen Umständen sollte der Auftrag dennoch angenommen werden, falls damit zum Beispiel ein neuer Kunde gewonnen werden kann.";
    } else if (verkaufRandom_Gewinn > 0) {
      if (verkaufRandom_Gewinn < verkaufWunschGewinn) {
        verkaufKundenanfrage =
          "Der Mindestgewinn wird zu den angegebenen Konditionen nicht erreicht. Unter gewissen Umständen sollte der Auftrag dennoch angenommen werden, falls damit zum Beispiel ein neuer Kunde gewonnen werden kann.";
      } else if (verkaufRandom_Gewinn >= verkaufWunschGewinn) {
        verkaufKundenanfrage =
          "Wir können die Kundenanfrage akzeptieren, da wir den Mindestgewinn erzielen.";
      }
    }
  }

  let verkaufUSTWert = formatCurrency(verkaufBerechnung_USTWert);
  let verkaufUeberweisungsbetrag_berechnung =
    verkaufBerechnung_bruttoWert - verkaufBerechnung_skontoBetrag_brutto;
  let verkaufUeberweisungsbetrag = formatCurrency(
    verkaufUeberweisungsbetrag_berechnung,
  );
  let verkaufAntwortBruttowert = formatCurrency(verkaufBerechnung_bruttoWert);
  const verkaufAntwort_Selbstkostenpreis = `${verkaufSelbstkostenpreis}`;

  // ── Rücksendung von Fertigerzeugnissen (analog Einkauf: Falschlieferung /
  //    Sachmangel) – Beträge anteilig auf den gebuchten Zielverkaufspreis
  //    (netto, inkl. ggf. Bezugskosten). Weil der Saldo des SOLL-Aufwands-
  //    kontos UEFE den Wert der Ware + Bezugskosten enthält, wird im
  //    Geschäftsfall IMMER der konkrete Betrag der Rücksendung genannt – so
  //    ist der Umsatz unabhängig von Rabatt/Bezugskosten nachvollziehbar.
  let verkaufGesendeteProzent =
    Math.random() < 0.33 ? 100 : 10 + Math.floor(Math.random() * 14) * 5; // 10 – 75 %
  let verkaufNettoRuecksendung = roundToTwoDecimals(
    (parseFloat(verkaufNettoWertWare) * verkaufGesendeteProzent) / 100,
  );
  let verkaufUSTWertRuecksendung = roundToTwoDecimals(
    (verkaufNettoRuecksendung * UST_REGEL) / 100,
  );
  let verkaufBruttoRuecksendung = roundToTwoDecimals(
    verkaufNettoRuecksendung + verkaufUSTWertRuecksendung,
  );
  const verkaufUSTRuecksendung = formatCurrency(verkaufUSTWertRuecksendung);
  const verkaufZielverkaufspreisRuecksendung = formatCurrency(
    verkaufNettoRuecksendung,
  );
  const verkaufBruttoRuecksendungFormatted = formatCurrency(
    verkaufBruttoRuecksendung,
  );
  const wertTextRuecksendung = ` im Wert von ${verkaufZielverkaufspreisRuecksendung} netto`;
  const verkaufRuecksendungSatz =
    verkaufGesendeteProzent === 100
      ? `Aufgrund einer Falschlieferung sendet der Kunde alle Fertigerzeugnisse${wertTextRuecksendung} `
      : `Aufgrund eines Sachmangels sendet der Kunde Fertigerzeugnisse${wertTextRuecksendung} `;

  const listenverkaufspreis = `${verkaufNettoWert}`;
  const verkaufAntwort_rabattWert = `${verkaufRabattWert}`;
  const verkaufAntwort_rabattSatz = `${verkaufRandom_Rabatt}`;
  const verkaufAntwort_GewinnWert = `${verkaufGewinnWert}`;
  const verkaufAntwort_GewinnSatz = `${verkaufRandom_Gewinn}`;
  const verkaufAntwort_Gewinn_berechnet = `${verkauf_Random_Gewinn_Berechnet}`;
  const verkaufAntwort_wunschGewinn = `${verkaufWunschGewinn}`;
  const verkaufAntwort_Kundenanfrage = `${verkaufKundenanfrage}`;
  const verkaufAntwort_skontoSatz = `${verkaufRandom_Skonto}`;
  const verkaufAntwort_skontoBetrag = `${verkaufSkontoBetrag}`;
  const verkaufAntwort_skontoBetrag_brutto = `${verkaufSkontoBetrag_brutto}`;
  const verkaufAntwort_vorsteuer_berichtigung = `${verkaufVorsteuer_berichtigung}`;
  const verkaufAntwort_ueberweisungsbetrag = `${verkaufUeberweisungsbetrag}`;
  const verkaufAntwort_barverkaufspreis = `${verkaufBarverkaufspreis}`;
  const verkaufKonto_1 = `${verkaufAntwortFertigerzeugnis}`;
  const Zielverkaufspreis = `${verkaufAntwortNettowert}`;
  const verkaufAntwort_bezugskosten = `${verkaufAntwortBezugskosten}`;
  const verkaufKonto_2 = `${verkaufAntwortZahlung}`;
  const verkaufKonto_Skontobuchungssatz = `${verkaufAntwortSkontobuchungssatz}`;
  const verkaufAntwort_bezugskostenWert = `${verkaufBezugskostenWert}`;
  const verkaufBetrag_2 = `${verkaufAntwortBruttowert}`;

  // Zusammenfügen der ausgewählten Elemente zu einem Satz
  let verkaufAngebotSatz;
  const verkaufRandomAngebotSatz = Math.random();
  verkaufAngebotSatz = `<ol style="list-style-type: lower-latin;">`;
  if (verkaufRandomAngebotSatz < 0.33) {
    verkaufAngebotSatz += `<li>${verkaufRandomAngebot} Selbstkostenpreis${verkaufGes} ${verkaufAntwort_Selbstkostenpreis}, ${verkaufRandomSupply_Gewinn} ${verkaufRandomSupply_Rabatt} ${verkaufRandomSupply_Skonto_2}.</li><li>Bilde den Buchungssatz: der Kunde akzeptiert das Angebot. Die Bezahlung erfolgt ${verkaufRandomZahlung}.</li>`;
  } else if (verkaufRandomAngebotSatz < 0.66) {
    verkaufAngebotSatz += `<li>${verkaufRandomAngebot} Selbstkostenpreis${verkaufGes} ${verkaufAntwort_Selbstkostenpreis}, ${verkaufRandomSupply_Gewinn} ${verkaufRandomSupply_Rabatt} ${verkaufRandomSupply_Skonto_2}.</li><li>Der Kunde akzeptiert das Angebot und gibt die Bestellung in Auftrag. Wir liefern ${verkaufRandomZahlung}.</li>`;
  } else {
    verkaufAngebotSatz += `<li>${verkaufRandomAngebot} ${verkaufRandomSupply_Gewinn} ${verkaufRandomSupply_Rabatt} ${verkaufRandomSupply_Skonto_2}. Die Selbstkosten betragen${verkaufGes} ${verkaufAntwort_Selbstkostenpreis}.</li><li>Der Kunde nimmt das Angebot ${verkaufRandomZahlung} an. Bilde den Buchungssatz!</li>`;
  }
  verkaufAngebotSatz += `</ol>`;

  let verkaufDifferenzSatz;
  const verkaufRandomDifferenzkalkulationSatz = Math.random();
  if (verkaufRandomDifferenzkalkulationSatz < 0.33) {
    verkaufDifferenzSatz = `${verkaufRandomDifferenzkalkulation} zum ${verkaufLP} von insgesamt ${verkaufRandomNettowert} ${verkaufRandomSupply_Rabatt} ${verkaufRandomSupply_Skonto_2}. Berechne, ob wir die Anfrage zu den genannten Konditionen akzeptieren können, wenn der Selbstkostenpreis${verkaufGes} ${verkaufAntwort_Selbstkostenpreis} beträgt und wir mindestens ${verkaufWunschGewinn} % Gewinn erzielen wollen.`;
  } else if (verkaufRandomDifferenzkalkulationSatz < 0.66) {
    verkaufDifferenzSatz = `${verkaufRandomDifferenzkalkulation}. Er schlägt einen ${verkaufLP} von insgesamt ${verkaufRandomNettowert} vor ${verkaufRandomSupply_Rabatt} ${verkaufRandomSupply_Skonto_2}. Der Selbstkostenpreis beträgt dabei${verkaufGes} ${verkaufAntwort_Selbstkostenpreis} und wir wollen mindestens ${verkaufWunschGewinn} % Gewinn erzielen. Berechne, ob wir die Anfrage zu den genannten Konditionen akzeptieren können.`;
  } else {
    verkaufDifferenzSatz = `${verkaufRandomDifferenzkalkulation}. Er möchte einen ${verkaufLP} von insgesamt ${verkaufRandomNettowert} bezahlen ${verkaufRandomSupply_Rabatt} ${verkaufRandomSupply_Skonto_2} erhalten. Berechne, ob wir die Anfrage akzeptieren können. Wir möchten mindestens ${verkaufWunschGewinn} % Gewinn erzielen, die Selbstkosten betragen ingesamt ${verkaufAntwort_Selbstkostenpreis}.`;
  }

  let verkaufZufaelligerSatz;
  const verkaufRandomValue = Math.random();
  if (verkaufRandomValue < 0.33) {
    verkaufZufaelligerSatz = `${verkaufRandomSubjekt} ${verkaufAnzeigeFertigerzeugnis} ${verkaufRandomZahlung} ${verkaufRandomSupply_Wert} ${verkaufRandomNettowert} ${verkaufRandomSupply_Rabatt_2} ${verkaufRandomSupply_Bezugskosten}.`;
  } else if (verkaufRandomValue < 0.66) {
    verkaufZufaelligerSatz = `${verkaufRandomSubjekt} ${verkaufAnzeigeFertigerzeugnis} ${verkaufRandomSupply_Wert} ${verkaufRandomNettowert} ${verkaufRandomZahlung} ${verkaufRandomSupply_Rabatt_2} ${verkaufRandomSupply_Bezugskosten}.`;
  } else {
    verkaufZufaelligerSatz = `${verkaufRandomSubjekt} ${verkaufAnzeigeFertigerzeugnis} ${verkaufRandomZahlung} ${verkaufRandomSupply_Wert} ${verkaufRandomNettowert} ${verkaufRandomSupply_Rabatt_2} ${verkaufRandomSupply_Bezugskosten}.`;
  }

  const verkaufRandomSkontoSatz = Math.random();
  verkaufSkontoSatz = `<ol style="list-style-type: lower-latin;">`;
  if (verkaufRandomSkontoSatz < 0.33) {
    verkaufSkontoSatz += `<li>Bilde den Buchungssatz zum Geschäftsfall.</li><li>Bilde den Buchungssatz: ${verkaufRandomSkontobuchungssatz}.</li>`;
  } else if (verkaufRandomSkontoSatz < 0.66) {
    verkaufSkontoSatz += `<li>Bilde den Buchungssatz zum Geschäftsfall.</li><li>${verkaufRandomSkontobuchungssatz}. Bilde den Buchungssatz.</li>`;
  } else {
    verkaufSkontoSatz += `<li>Bilde den Buchungssatz zum Geschäftsfall.</li><li>Bilde den Buchungssatz: ${verkaufRandomSkontobuchungssatz}.</li>`;
  }
  verkaufSkontoSatz += `</ol>`;

  return [
    verkaufZufaelligerSatz,
    verkaufAngebotSatz,
    verkaufDifferenzSatz,
    verkaufSkontoSatz,
    listenverkaufspreis,
    verkaufAntwort_rabattWert,
    verkaufAntwort_Selbstkostenpreis,
    verkaufAntwort_rabattSatz,
    verkaufAntwort_GewinnWert,
    verkaufAntwort_GewinnSatz,
    verkaufAntwort_Gewinn_berechnet,
    verkaufAntwort_wunschGewinn,
    verkaufAntwort_Kundenanfrage,
    verkaufAntwort_skontoSatz,
    verkaufAntwort_skontoBetrag,
    verkaufAntwort_skontoBetrag_brutto,
    verkaufAntwort_vorsteuer_berichtigung,
    verkaufAntwort_ueberweisungsbetrag,
    verkaufAntwort_barverkaufspreis,
    verkaufKonto_1,
    Zielverkaufspreis,
    verkaufAntwort_bezugskosten,
    verkaufAntwort_bezugskostenWert,
    verkaufUSTWert,
    verkaufKonto_2,
    verkaufBetrag_2,
    verkaufKonto_Skontobuchungssatz,
    verkaufRuecksendungSatz,
    verkaufUSTRuecksendung,
    verkaufZielverkaufspreisRuecksendung,
    verkaufBruttoRuecksendungFormatted,
  ];
}

function verkaufZeigeZufaelligenSatz() {
  // Checkbox-Wechselwirkung (Rücksendungen vs. Bezugskosten) aktuell halten
  if (typeof verkaufAktualisiereOptionenState === "function")
    verkaufAktualisiereOptionenState();

  const verkaufAnzahl = parseInt(verkaufAnzahlDropdown.value);
  const container = document.getElementById("Container");
  const buttonColumn = document.getElementById("verkauf-button-column"); // ← muss im HTML existieren!

  if (!container || !buttonColumn) {
    console.error("Container oder Button-Column nicht gefunden");
    return;
  }

  // Inhalte zurücksetzen
  container.innerHTML = "";
  buttonColumn.innerHTML = "";
  letzteGenerierteGfListeVerkauf = [];
  if (typeof moodleReset === "function") moodleReset();

  let verkaufSatzOutput = "<h2>Aufgaben</h2>";
  verkaufSatzOutput += "<ol>";
  let verkaufAntwortOutput = `<h2 class="loesung">Lösung</h2>`;
  const gemischt =
    document.getElementById("verkaufBuchungsoptionDropdown").value ===
    "gemischt";
  const origBezug = verkaufMitBezugskosten.checked;
  verkaufModusUeberschreibung = null;

  for (let i = 1; i <= verkaufAnzahl; i++) {
    if (gemischt) {
      verkaufModusUeberschreibung =
        VERKAUF_MODI[Math.floor(Math.random() * VERKAUF_MODI.length)];
      const rueckAktivGemischt = !!verkaufMitRuecksendung?.checked;
      // Kalkulation und Differenzkalkulation kennen keine Bezugskosten.
      // Im verkaufBuchungssatz-Fall bleibt der Fall ohne Bezugskosten, wenn
      // Rücksendungen aktiv sind – damit Rücksendungen überhaupt vorkommen
      // (Bezugskosten-Fälle werden nie zurückgesendet). Die bezugskosten-
      // Fälle bleiben im verkaufSkontobuchungssatz erhalten.
      verkaufMitBezugskosten.checked =
        origBezug &&
        !["verkaufskalkulation", "verkaufDifferenzkalkulation"].includes(
          verkaufModusUeberschreibung,
        ) &&
        !(
          rueckAktivGemischt &&
          verkaufModusUeberschreibung === "verkaufBuchungssatz"
        );
    }
    const [
      verkaufZufaelligerSatz,
      verkaufAngebotSatz,
      verkaufDifferenzSatz,
      verkaufSkontoSatz,
      verkaufListenverkaufspreis,
      verkaufAntwort_rabattWert,
      verkaufAntwort_Selbstkostenpreis,
      verkaufAntwort_rabattSatz,
      verkaufAntwort_GewinnWert,
      verkaufAntwort_GewinnSatz,
      verkaufAntwort_Gewinn_berechnet,
      verkaufAntwort_wunschGewinn,
      verkaufAntwort_Kundenanfrage,
      verkaufAntwort_skontoSatz,
      verkaufAntwort_skontoBetrag,
      verkaufAntwort_skontoBetrag_brutto,
      verkaufAntwort_vorsteuer_berichtigung,
      verkaufAntwort_ueberweisungsbetrag,
      verkaufAntwort_barverkaufspreis,
      verkaufKonto_1,
      Zielverkaufspreis,
      verkaufAntwort_bezugskosten,
      verkaufAntwort_bezugskostenWert,
      verkaufUSTWert,
      verkaufKonto_2,
      verkaufBetrag_2,
      verkaufKonto_Skontobuchungssatz,
      verkaufRuecksendungSatz,
      verkaufUSTRuecksendung,
      verkaufZielverkaufspreisRuecksendung,
      verkaufBruttoRuecksendungFormatted,
    ] = verkaufErstelleZufallssatz();
    const verkaufFormattedSatz = verkaufZufaelligerSatz
      .replace(/\s+/g, " ")
      .replace(/\s(?=[.,;:!])/g, "");
    const verkaufFormattedAngebot = verkaufAngebotSatz
      .replace(/\s+/g, " ")
      .replace(/\s(?=[.,;:!])/g, "");
    const verkaufFormattedSkonto = verkaufSkontoSatz
      .replace(/\s+/g, " ")
      .replace(/\s(?=[.,;:!])/g, "");
    const verkaufFormattedDifferenz = verkaufDifferenzSatz
      .replace(/\s+/g, " ")
      .replace(/\s(?=[.,;:!])/g, "");
    // Aufgabe und Lösung für KI-Prompt merken
    const klartext = (s) =>
      s
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .replace(/\s(?=[.,;:!])/g, "")
        .trim();
    const buchung = `${verkaufKonto_2} ${verkaufBetrag_2} an ${verkaufKonto_1} ${Zielverkaufspreis} / ${UST} ${verkaufUSTWert}`;
    const kalkulation = [
      `Selbstkostenpreis: ${verkaufAntwort_Selbstkostenpreis} (100 %)`,
      `+ Gewinn: ${verkaufAntwort_GewinnWert} (${verkaufAntwort_GewinnSatz} %)`,
      `= Barverkaufspreis: ${verkaufAntwort_barverkaufspreis}`,
      `+ Kundenskonto: ${verkaufAntwort_skontoBetrag} (${verkaufAntwort_skontoSatz} %)`,
      `= Zielverkaufspreis: ${Zielverkaufspreis}`,
      `+ Kundenrabatt: ${verkaufAntwort_rabattWert} (${verkaufAntwort_rabattSatz} %)`,
      `= Listenverkaufspreis: ${verkaufListenverkaufspreis}`,
    ].join("\n");

    let aufgabeText, loesungText;
    switch (verkaufGetModus()) {
      case "verkaufskalkulation":
        aufgabeText = klartext(verkaufFormattedAngebot);
        loesungText = `${kalkulation}\nBuchungssatz: ${buchung}`;
        break;
      case "verkaufSkontobuchungssatz":
        aufgabeText = klartext(
          verkaufFormattedSatz + " " + verkaufFormattedSkonto,
        );
        loesungText = [
          `Buchungssatz 1: ${buchung}`,
          `Buchungssatz 2: ${BK} ${verkaufAntwort_ueberweisungsbetrag} / ${verkaufKonto_Skontobuchungssatz} ${verkaufAntwort_skontoBetrag} / ${UST} ${verkaufAntwort_vorsteuer_berichtigung} an ${FO} ${verkaufBetrag_2}`,
          `Skonto brutto: ${verkaufAntwort_skontoBetrag_brutto}, Skonto netto: ${verkaufAntwort_skontoBetrag}, Umsatzsteuerberichtigung: ${verkaufAntwort_vorsteuer_berichtigung}`,
          `Überweisungsbetrag: ${verkaufAntwort_ueberweisungsbetrag}`,
        ].join("\n");
        break;
      case "verkaufDifferenzkalkulation":
        aufgabeText = klartext(verkaufFormattedDifferenz);
        loesungText = `${kalkulation}\nErzielter Gewinn: ${verkaufAntwort_Gewinn_berechnet} % (Mindestgewinn: ${verkaufAntwort_wunschGewinn} %)\nEntscheidung: ${verkaufAntwort_Kundenanfrage}`;
        break;
      default:
        aufgabeText = klartext(verkaufFormattedSatz);
        loesungText = `Buchungssatz: ${buchung}`;
    }
    letzteGenerierteGfListeVerkauf.push({
      aufgabe: aufgabeText,
      loesung: loesungText,
    });

    if (typeof moodleErfasseVerkauf === "function") {
      moodleErfasseVerkauf({
        nr: i,
        modus: verkaufGetModus(),
        satz: verkaufFormattedSatz,
        angebotSatz: verkaufFormattedAngebot,
        skontoSatz: verkaufFormattedSkonto,
        selbstkostenpreis: verkaufAntwort_Selbstkostenpreis,
        gewinnWert: verkaufAntwort_GewinnWert,
        gewinnSatz: verkaufAntwort_GewinnSatz,
        barverkaufspreis: verkaufAntwort_barverkaufspreis,
        skontoBetrag: verkaufAntwort_skontoBetrag,
        skontoProzent: verkaufAntwort_skontoSatz,
        skontoBrutto: verkaufAntwort_skontoBetrag_brutto,
        ustBerichtigung: verkaufAntwort_vorsteuer_berichtigung,
        ueberweisung: verkaufAntwort_ueberweisungsbetrag,
        zielverkaufspreis: Zielverkaufspreis,
        rabattWert: verkaufAntwort_rabattWert,
        rabattSatz: verkaufAntwort_rabattSatz,
        listenverkaufspreis: verkaufListenverkaufspreis,
        konto1: verkaufKonto_1,
        konto2: verkaufKonto_2,
        brutto: verkaufBetrag_2,
        ust: verkaufUSTWert,
        kontoNachlass: verkaufKonto_Skontobuchungssatz,
      });
    }
    // ── Rücksendung (nur bei FO-Buchungssatz, analog Einkauf) ────────────────
    //  Früh berechnet, damit der Aufgaben-Satz ohne den unnötigen
    //  Unterabstand (<br><br>) gerendert werden kann, wenn eine
    //  Rücksendung folgt.
    const mitRuecksendung =
      verkaufMitRuecksendung?.checked &&
      verkaufGetModus() === "verkaufBuchungssatz" &&
      verkaufKonto_2 === FO &&
      !verkaufMitBezugskosten.checked &&
      i < verkaufAnzahl;

    // Generierte Sätze hinzufügen

    verkaufSatzOutput += `<li>`;

    switch (verkaufGetModus()) {
      case "verkaufskalkulation":
        verkaufSatzOutput += `<div>${verkaufFormattedAngebot}</div><br>`;
        break;
      case "verkaufSkontobuchungssatz":
        verkaufSatzOutput += `${verkaufFormattedSatz}<br><br>`;
        verkaufSatzOutput += `${verkaufFormattedSkonto}<br><br>`;
        break;
      case "verkaufDifferenzkalkulation":
        verkaufSatzOutput += `${verkaufFormattedDifferenz}<br><br>`;
        break;
      default:
        // Wenn eine Rücksendung folgt, keinen doppelten Zusatzabstand erzeugen
        verkaufSatzOutput += `${verkaufFormattedSatz}${mitRuecksendung ? "" : "<br><br>"}`;
    }

    if (mitRuecksendung) {
      verkaufSatzOutput += `<li>${verkaufRuecksendungSatz}aus Geschäftsfall ${i} zurück und erhält dafür eine Gutschrift.</li>`;
    }

    verkaufSatzOutput += `</li>`;

    // ── Beleg-Buttons erzeugen ────────────────────────────────────────────────
    const buttonColumn = document.getElementById("verkauf-button-column"); // ← Muss im HTML existieren!

    if (!buttonColumn) {
      console.warn(
        "verkauf-button-column nicht gefunden → Buttons werden nicht angezeigt",
      );
    } else {
      const geschaeftsfallDaten = {
        listenverkaufspreis: verkaufListenverkaufspreis,
        rabattSatz: verkaufAntwort_rabattSatz,
        bezugskostenWert: verkaufAntwort_bezugskostenWert, // meist Versandkosten
        skontoSatz: verkaufAntwort_skontoSatz,
        produktName:
          verkaufAktuellesProdukt?.name ||
          verkaufExtractProduktName(verkaufKonto_1),
        produkt: !!verkaufAktuellesProdukt, // true = konkretes Fertigerzeugnis hinterlegt
        menge: verkaufAktuelleMenge,
        einzelpreis: verkaufAktuellerStueckpreis,
        einheit: verkaufAktuelleEinheit,
      };

      const buttonDiv = document.createElement("div");
      buttonDiv.style.margin = "12px 0";

      if (verkaufGetModus() === "verkaufskalkulation") {
        // Beide Angebots-Belege (Mail + SVG) gehören zu 1a, die Ausgangsrechnung zu 1b
        buttonDiv.innerHTML = `
            ${verkaufErstelleAngebotMailButton(i, geschaeftsfallDaten)}
            <div style="margin-top:8px;"></div>
            ${verkaufErstelleAngebotButton(i, geschaeftsfallDaten, "a")}
            <div style="margin-top:8px;"></div>
            ${verkaufErstelleRechnungButton(i, geschaeftsfallDaten, "b")}
        `;
      } else if (verkaufGetModus() === "verkaufDifferenzkalkulation") {
        // Kundenanfrage per Mail (der Kunde fragt an) + Ausgangsrechnung –
        // beide einfach "1." nummeriert (kein a/b/c)
        buttonDiv.innerHTML = `
            ${verkaufErstelleMailButton(i, geschaeftsfallDaten)}
            <div style="margin-top:8px;"></div>
            ${verkaufErstelleRechnungButton(i, geschaeftsfallDaten, "")}
        `;
      } else {
        // Alle anderen Fälle → (vorerst) nur Rechnung
        buttonDiv.innerHTML = erstelleGeschaeftsfallButton(
          i,
          geschaeftsfallDaten,
        );
      }

      // Neuen Container pro Aufgabe erzeugen (oder einfach anhängen)
      const colItem = document.createElement("div");
      colItem.style.marginBottom = "20px";
      colItem.appendChild(buttonDiv);

      buttonColumn.appendChild(colItem);
    }

    // Generierte Antworten hinzufügen
    verkaufAntwortOutput += `<div style="margin: 10px 0 2px;"><strong>${parseInt(i)}.</strong></div>`;
    if (
      verkaufGetModus() === "verkaufskalkulation" ||
      verkaufGetModus() === "verkaufDifferenzkalkulation"
    ) {
      verkaufAntwortOutput += `<table style="border-collapse: collapse;white-space:nowrap;width:350px;margin: 0 0">`;
      verkaufAntwortOutput += `<tbody>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td>Selbstkostenpreis</td><td style="padding-left:16px;text-align:right;">${verkaufAntwort_Selbstkostenpreis}</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">100 %</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td>+ Gewinn</td><td style="padding-left:16px;text-align:right;">${verkaufAntwort_GewinnWert}</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">${verkaufAntwort_GewinnSatz} %</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">&nbsp;`;
      if (verkaufGetModus() === "verkaufDifferenzkalkulation") {
        verkaufAntwortOutput += ` (${verkaufAntwort_Gewinn_berechnet} %)`;
      }
      verkaufAntwortOutput += `</td>`;
      verkaufAntwortOutput += `</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td style="border-top: solid 1px #ccc">= Barverkaufspreis</td>`;
      verkaufAntwortOutput += `<td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc"">${verkaufAntwort_barverkaufspreis}</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">${100 + parseFloat(verkaufAntwort_GewinnSatz)} %</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">${100 - verkaufAntwort_skontoSatz} %</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td>+ Kundenkonto</td>`;
      verkaufAntwortOutput += `<td style="padding-left:16px;text-align:right;">${verkaufAntwort_skontoBetrag}<br></td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;"></td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">${verkaufAntwort_skontoSatz} %</td>`;
      verkaufAntwortOutput += ` </tr>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td style="border-top: solid 1px #ccc">= Zielverkaufspreis</td>`;
      verkaufAntwortOutput += `<td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc">${Zielverkaufspreis}</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">${100 - verkaufAntwort_rabattSatz} %</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">100 %</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td>+ Kundenrabatt</td><td style="padding-left:16px;text-align:right;">${verkaufAntwort_rabattWert}</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">${verkaufAntwort_rabattSatz} %</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">&nbsp;</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td style="border-top: solid 1px #ccc">= Listenverkaufspreis</td>`;
      verkaufAntwortOutput += `<td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc">${verkaufListenverkaufspreis}</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">100 %</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">&nbsp;</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `</tbody>`;
      verkaufAntwortOutput += `</table>`;
      verkaufAntwortOutput += `<br><br>`;
    }
    if (verkaufGetModus() === "verkaufDifferenzkalkulation") {
      verkaufAntwortOutput += `<p>${verkaufAntwort_Kundenanfrage}</p>`;
    }
    if (verkaufGetModus() != "verkaufDifferenzkalkulation") {
      verkaufAntwortOutput += `<table style="border: 1px solid #ccc;white-space:nowrap;background-color:#fff;font-family:courier;width:600px;margin:0 0;margin-bottom:6px;">`;
      verkaufAntwortOutput += `<tbody>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">${verkaufKonto_2}</td>`;
      verkaufAntwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">${verkaufBetrag_2}</td>`;
      verkaufAntwortOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 40px" tabindex="1">an</td>`;
      verkaufAntwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px;text-align:left" tabindex="1">${verkaufKonto_1}</td>`;
      verkaufAntwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px;text-align:right" tabindex="1">${Zielverkaufspreis}</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1"></td>`;
      verkaufAntwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 120px" tabindex="1"></td>`;
      verkaufAntwortOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 50px" tabindex="1"></td>`;
      verkaufAntwortOutput += `<td style="text-align:left;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">${UST}</td>`;
      verkaufAntwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">${verkaufUSTWert}</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `</tbody>`;
      verkaufAntwortOutput += `</table>`;
      verkaufAntwortOutput += `<br>`;
    }
    if (verkaufGetModus() === "verkaufSkontobuchungssatz") {
      verkaufAntwortOutput += `<h4>Nebenrechnung:</h4>`;
      verkaufAntwortOutput += `<table style="border-collapse: collapse;white-space:nowrap;width:350px;margin: 0 0">`;
      verkaufAntwortOutput += `<tbody>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td>Rechnungsbetrag</td><td style="padding-left:16px;text-align:right;">${verkaufBetrag_2}</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">&nbsp;</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td>- Skonto (brutto)</td><td style="padding-left:16px;text-align:right;">${verkaufAntwort_skontoBetrag_brutto}</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">${verkaufAntwort_skontoSatz} %</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<tr border-top: solid 1px #ccc>`;
      verkaufAntwortOutput += `<td style="border-top: solid 1px #ccc">= Überweisungsbetrag</td>`;
      verkaufAntwortOutput += `<td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc">${verkaufAntwort_ueberweisungsbetrag}</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">&nbsp;</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `</table>`;
      verkaufAntwortOutput += `<br>`;
      verkaufAntwortOutput += `<table style="border-collapse: collapse;white-space:nowrap;width:350px;margin: 0 0">`;
      verkaufAntwortOutput += `<tbody>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td>Skonto (brutto)</td><td style="padding-left:16px;text-align:right;">${verkaufAntwort_skontoBetrag_brutto}</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">${100 + UST_REGEL} %</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td>- Umsatzsteuer</td><td style="padding-left:16px;text-align:right;">${verkaufAntwort_vorsteuer_berichtigung}</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">${UST_REGEL} %</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<tr border-top: solid 1px #ccc>`;
      verkaufAntwortOutput += `<td style="border-top: solid 1px #ccc">= Skonto (netto)</td>`;
      verkaufAntwortOutput += `<td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc">${verkaufAntwort_skontoBetrag}</td>`;
      verkaufAntwortOutput += `<td style="padding-left:6px;text-align:right;">100 %</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `</table>`;
      verkaufAntwortOutput += `<br>`;
      verkaufAntwortOutput += `<table style="border: 1px solid #ccc;white-space:nowrap;background-color:#fff;font-family:courier;width:600px;margin:0 0;margin-bottom:6px;">`;
      verkaufAntwortOutput += `<tbody>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">${BK}</td>`;
      verkaufAntwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">${verkaufAntwort_ueberweisungsbetrag}</td>`;
      verkaufAntwortOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 40px" tabindex="1">an</td>`;
      verkaufAntwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px;text-align:left" tabindex="1">${FO}</td>`;
      verkaufAntwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px;text-align:right" tabindex="1">${verkaufBetrag_2}</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">${verkaufKonto_Skontobuchungssatz}</td>`;
      verkaufAntwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">${verkaufAntwort_skontoBetrag}</td>`;
      verkaufAntwortOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 50px" tabindex="1"></td>`;
      verkaufAntwortOutput += `<td style="text-align:left;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1"></td>`;
      verkaufAntwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1"></td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">${UST}</td>`;
      verkaufAntwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1">${verkaufAntwort_vorsteuer_berichtigung}</td>`;
      verkaufAntwortOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 50px" tabindex="1"></td>`;
      verkaufAntwortOutput += `<td style="text-align:left;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1"></td>`;
      verkaufAntwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:140px;min-width: 140px" tabindex="1"></td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `</tbody>`;
      verkaufAntwortOutput += `</table>`;
      verkaufAntwortOutput += `<br>`;
    }

    // ── Rücksendung: umgedrehter Buchungssatz (nur FO-Fall), analog Einkauf ──
    if (mitRuecksendung) {
      i++; // Rücksendung erhält eine eigene Nummerierung

      letzteGenerierteGfListeVerkauf.push({
        aufgabe: `${verkaufRuecksendungSatz}aus Geschäftsfall ${i - 1} zurück und erhält dafür eine Gutschrift.`,
        loesung: `Buchungssatz Rücksendung:\n${UEFE} ${verkaufZielverkaufspreisRuecksendung} / ${UST} ${verkaufUSTRuecksendung} an ${FO} ${verkaufBruttoRuecksendungFormatted}`,
      });

      verkaufAntwortOutput += `<strong>${parseInt(i)}.</strong>`;
      verkaufAntwortOutput += `<table style="border: 1px solid #ccc;white-space:nowrap;background-color:#fff;font-family:courier;width:600px;margin:0 0;margin-bottom:6px;">`;
      verkaufAntwortOutput += `<tbody>`;
      verkaufAntwortOutput += `<tr>`;
      verkaufAntwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px" tabindex="1">${UEFE}</td>`;
      verkaufAntwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1">${verkaufZielverkaufspreisRuecksendung}</td>`;
      verkaufAntwortOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 50px" tabindex="1">an</td>`;
      verkaufAntwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px;text-align:left" tabindex="1">${FO}</td>`;
      verkaufAntwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px;text-align:right" tabindex="1">${verkaufBruttoRuecksendungFormatted}</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `<td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px" tabindex="1"></td>`;
      verkaufAntwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1"></td>`;
      verkaufAntwortOutput += `<td style="text-align: center;width:100px;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;min-width: 50px" tabindex="1"></td>`;
      verkaufAntwortOutput += `<td style="text-align:left;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:120px;min-width: 120px" tabindex="1">${UST}</td>`;
      verkaufAntwortOutput += `<td style="text-align:right;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;max-width:145px;min-width: 120px" tabindex="1">${verkaufUSTRuecksendung}</td>`;
      verkaufAntwortOutput += `</tr>`;
      verkaufAntwortOutput += `</tbody>`;
      verkaufAntwortOutput += `</table><br>`;
    }
  }

  verkaufModusUeberschreibung = null;
  verkaufMitBezugskosten.checked = origBezug;
  verkaufSatzOutput += "</ol>"; // Ende der nummerierten Liste für Sätze

  // Sätze und Antworten auf der Seite anzeigen
  document.getElementById("Container").innerHTML =
    verkaufSatzOutput + verkaufAntwortOutput;
  const vorschau = document.getElementById("kiPromptVorschau");
  if (vorschau && vorschau.style.display !== "none") {
    vorschau.textContent = erstelleKiPromptText();
  }
}

// ============================================================================
// Dropdowns mit YAML-Unternehmen befüllen
// ============================================================================
function fillCompanyDropdowns() {
  if (!yamlData || yamlData.length === 0) {
    console.warn("yamlData ist leer → keine Unternehmen zum Befüllen");
    return;
  }

  // Sortierung: erst nach Branche, dann nach Name
  const sortedCompanies = [...yamlData].sort((a, b) => {
    const brancheA = a.unternehmen?.branche || "";
    const brancheB = b.unternehmen?.branche || "";
    if (brancheA !== brancheB) return brancheA.localeCompare(brancheB);
    return (a.unternehmen?.name || "").localeCompare(b.unternehmen?.name || "");
  });

  const kaueferSelect = document.getElementById("einkaufKaeufer");
  const liefererSelect = document.getElementById("einkaufLieferer");

  // Leeren + Option "Bitte auswählen" hinzufügen
  const clearAndAddPlaceholder = (select) => {
    if (!select) return;
    select.innerHTML = "";
    const opt = document.createElement("option");
    opt.value = "";
    opt.text = "— bitte Unternehmen auswählen —";
    opt.disabled = true;
    opt.selected = true;
    select.appendChild(opt);
  };

  clearAndAddPlaceholder(kaueferSelect);
  clearAndAddPlaceholder(liefererSelect);

  // Alle Unternehmen einfügen
  sortedCompanies.forEach((company) => {
    const u = company.unternehmen;
    if (!u?.name) return;

    const displayText = u.branche
      ? `${u.branche} – ${u.name} ${u.rechtsform || ""}`.trim()
      : `${u.name} ${u.rechtsform || ""}`.trim();

    const option = document.createElement("option");
    option.value = u.name; // ← wichtig: value = Firmenname
    option.textContent = displayText;

    // Optional: data-Attribute für spätere Verwendung
    option.dataset.id = u.id || "";
    option.dataset.rechtsform = u.rechtsform || "";
    option.dataset.branche = u.branche || "";

    // Kopie für beide Dropdowns
    if (kaueferSelect) kaueferSelect.appendChild(option.cloneNode(true));
    if (liefererSelect) liefererSelect.appendChild(option);
  });

  console.log(`Dropdowns befüllt mit ${sortedCompanies.length} Unternehmen`);
}

// ============================================================================
// HILFSFUNKTIONEN FÜR VERKAUFS-BELEG-BUTTONS
// ============================================================================

function verkaufParseNumericValue(value) {
  if (!value) return "0";
  return value
    .toString()
    .replace(/[€\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
}

// Mailtext der Kundenanfrage (Differenzkalkulation): höfliche Anfrage,
// in der der Kunde Listenpreis, ggf. Rabatt und Skonto nennt.
// Mit Fertigerzeugnis: "450 Mountainbike" (ohne "Stück").
// Ohne Fertigerzeugnis: "450 Stück".
function verkaufBaueKundenanfrageText(daten) {
  const menge = parseInt(daten.menge, 10);
  const mengeText = daten.produkt
    ? menge > 0
      ? `${menge} `
      : "" // "Stück" entfällt bei hinterlegtem Fertigerzeugnis
    : menge > 0
      ? `${menge} Stück `
      : "";
  const einheitText =
    daten.produkt && daten.einheit && daten.einheit !== "Stück"
      ? `${daten.einheit} `
      : "";
  const produkt = daten.produktName || "Fertigerzeugnisse";
  const gesamtliefer = menge > 0 ? " für die gesamte Lieferung" : "";

  let text = `wir möchten ${mengeText}${einheitText}${produkt} bei Ihnen bestellen und bitten Sie höflich um ein Angebot. `;
  if (daten.produkt && parseFloat(daten.einzelpreis) > 0) {
    // Mit Fertigerzeugnis: realistischer Listenpreis je Stück
    text += `Wir möchten diese zum Listenpreis von ${formatCurrency(daten.einzelpreis)} je Stück bei Ihnen beziehen. `;
  } else {
    text += `Wir möchten diese zum Listenpreis von ${daten.listenverkaufspreis || ""}${gesamtliefer} bei Ihnen beziehen. `;
  }
  if (parseFloat(verkaufParseNumericValue(daten.rabattSatz)) > 0) {
    text += `Aufgrund der größeren Abnahmemenge bitten wir Sie um einen Rabatt von ${daten.rabattSatz} %. `;
  }
  if (parseFloat(verkaufParseNumericValue(daten.skontoSatz)) > 0) {
    text += `Da wir unsere Rechnungen zuverlässig innerhalb der Skontofrist begleichen, würden wir ${daten.skontoSatz} % Skonto nutzen. `;
  }
  text += `Bitte senden Sie uns alsbald ein passendes Angebot zu – wir freuen uns auf Ihre Rückmeldung.`;
  return text;
}

// Mailtext des Angebots (Verkaufskalkulation): der Lieferer versendet das
// Angebot an den Kunden mit Listenpreis, ggf. Rabatt und Skonto.
// Mit Fertigerzeugnis: Listenpreis je Stück; ohne: Gesamtbetrag.
function verkaufBaueAngebotText(daten) {
  const menge = parseInt(daten.menge, 10);
  const mengeText = daten.produkt
    ? menge > 0
      ? `${menge} `
      : "" // "Stück" entfällt bei hinterlegtem Fertigerzeugnis
    : menge > 0
      ? `${menge} Stück `
      : "";
  const einheitText =
    daten.produkt && daten.einheit && daten.einheit !== "Stück"
      ? `${daten.einheit} `
      : "";
  const produkt = daten.produktName || "Fertigerzeugnisse";
  const gesamtliefer = menge > 0 ? " für die gesamte Lieferung" : "";

  let text = `vielen Dank für Ihre Anfrage. Gerne unterbreiten wir Ihnen ein Angebot über ${mengeText}${einheitText}${produkt}: `;
  if (daten.produkt && parseFloat(daten.einzelpreis) > 0) {
    // Mit Fertigerzeugnis: realistischer Listenpreis je Stück
    text += `Der Listenpreis beträgt ${formatCurrency(daten.einzelpreis)} je Stück. `;
  } else {
    text += `Der Listenpreis beträgt ${daten.listenverkaufspreis || ""}${gesamtliefer}. `;
  }
  if (parseFloat(verkaufParseNumericValue(daten.rabattSatz)) > 0) {
    text += `Bei dieser Abnahmemenge gewähren wir Ihnen einen Rabatt von ${daten.rabattSatz} %. `;
  }
  if (parseFloat(verkaufParseNumericValue(daten.skontoSatz)) > 0) {
    text += `Bei Zahlung innerhalb der Skontofrist gewähren wir Ihnen ${daten.skontoSatz} % Skonto. `;
  }
  text += `Wir freuen uns auf Ihre Bestellung und stehen für Rückfragen gerne zur Verfügung.`;
  return text;
}

function verkaufExtractProduktName(kontoCode) {
  // Hier kannst du später erweitern, wenn du mehrere Erlöskonten hast
  if (kontoCode.includes("5000")) return "Fertigerzeugnisse";
  return "Erzeugnisse";
}

function verkaufErzeugeURLFuerBeleg(geschaeftsfallDaten, typ = "rechnung") {
  const params = new URLSearchParams();

  // Beleg-Typ: Mail → E-Mail-Tab in belege.html, sonst Rechnungs-Tab
  params.set(
    "beleg",
    typ === "mail" || typ === "mailangebot" ? "email" : "rechnung",
  );

  // Vorlage je nach Typ
  let vorlage = null;
  if (typ === "angebot") {
    vorlage = "angebot2.svg"; //
  } else if (typ === "rechnung") {
    vorlage = "template1.svg"; // ← anpassen!
  } else if (typ === "mail") {
    vorlage = "mail3.html"; // Klassische Mail-Vorlage (Kundenanfrage)
  } else if (typ === "mailangebot") {
    vorlage = "mail3.html"; // Klassische Mail-Vorlage (Angebot des Lieferers)
  }

  if (vorlage) {
    params.set("vorlage", vorlage);
  }

  // ── Verkaufsspezifische Parameter ───────────────────────────────────────
  if (typ === "mail" || typ === "mailangebot") {
    // Mail-Fälle:
    //  mail        → Kundenanfrage (Differenzkalkulation): der Kunde fragt an
    //  mailangebot → Angebot (Verkaufskalkulation): der Lieferer versendet das Angebot
    const kundeSelectM = document.getElementById("einkaufKaeufer");
    const liefererSelectM = document.getElementById("einkaufLieferer");

    let kundeName = (kundeSelectM?.value || "").trim();
    if (!kundeName && kundeSelectM) {
      // Keine Kundenwahl: zufälliges echtes Kundenunternehmen einsetzen
      const echteKunden = [...kundeSelectM.options].filter((o) =>
        o.value.trim(),
      );
      if (echteKunden.length) {
        const opt = echteKunden[Math.floor(Math.random() * echteKunden.length)];
        kundeName = opt.value.trim();
        kundeSelectM.value = kundeName;
      }
    }

    let firmaName = (liefererSelectM?.value || "").trim();
    if (!firmaName && liefererSelectM) {
      const echteFirmen = [...liefererSelectM.options].filter((o) =>
        o.value.trim(),
      );
      if (echteFirmen.length) firmaName = echteFirmen[0].value.trim();
    }

    // Richtung: Anfrage = Kunde → Firma; Angebot = Firma → Kunde
    if (typ === "mail") {
      if (kundeName) params.set("absender", kundeName);
      if (firmaName) params.set("empfaenger", firmaName);
    } else {
      if (firmaName) params.set("absender", firmaName);
      if (kundeName) params.set("empfaenger", kundeName);
    }

    // Betreff: Angebot + Fertigerzeugnis
    const produktName = geschaeftsfallDaten.produktName || "Fertigerzeugnisse";
    params.set("betreff", `Angebot ${produktName}`);

    // Mailtext: Anfrage vom Kunden bzw. Angebot vom Lieferer
    params.set(
      "text",
      typ === "mail"
        ? verkaufBaueKundenanfrageText(geschaeftsfallDaten)
        : verkaufBaueAngebotText(geschaeftsfallDaten),
    );
    return `belege.html?${params.toString()}`;
  }

  if (geschaeftsfallDaten.menge && geschaeftsfallDaten.einzelpreis) {
    params.set("einzelpreis1", String(geschaeftsfallDaten.einzelpreis));
  } else if (geschaeftsfallDaten.listenverkaufspreis) {
    params.set(
      "einzelpreis1",
      verkaufParseNumericValue(geschaeftsfallDaten.listenverkaufspreis),
    );
  }
  if (geschaeftsfallDaten.rabattSatz) {
    params.set("rabatt", geschaeftsfallDaten.rabattSatz);
  }
  if (geschaeftsfallDaten.bezugskostenWert) {
    // meist Versandkosten beim Verkauf
    params.set(
      "bezugskosten",
      verkaufParseNumericValue(geschaeftsfallDaten.bezugskostenWert),
    );
  }
  if (geschaeftsfallDaten.skontoSatz) {
    params.set("skonto", geschaeftsfallDaten.skontoSatz);
  }
  if (geschaeftsfallDaten.produktName) {
    params.set("artikel1", geschaeftsfallDaten.produktName);
  }

  // Kunde / Verkäufer (deine Dropdown-IDs anpassen!)
  const kundeSelect = document.getElementById("einkaufKaeufer");
  const liefererSelect = document.getElementById("einkaufLieferer");

  if (kundeSelect?.value) params.set("kunde", kundeSelect.value.trim());
  if (liefererSelect?.value)
    params.set("lieferer", liefererSelect.value.trim());

  // Standardwerte
  params.set("menge1", String(geschaeftsfallDaten.menge || 1));
  params.set("einheit1", geschaeftsfallDaten.einheit || "Stück");
  params.set("umsatzsteuer", "19");
  const now = new Date();

  params.set("tag", now.getDate().toString().padStart(2, "0"));
  params.set("monat", (now.getMonth() + 1).toString().padStart(2, "0"));

  return `belege.html?${params.toString()}`;
}

function erstelleGeschaeftsfallButton(nummer, daten) {
  const url = verkaufErzeugeURLFuerBeleg(daten, "rechnung");

  let buttonText = `📄 ${nummer}. Ausgangsrechnung erstellen`;
  let titleText = `Eingangsrechnung für Aufgabe ${nummer} als SVG-Beleg öffnen`;

  return `
        <button
            class="geschaeftsfall-beleg-button"
            data-url="${url.replace(/&/g, "&amp;")}" data-on-click='[{"fn":"__openDataUrl","args":["__THIS__"]}]'
            title="${titleText}"
            style="width: 100%; padding: 10px 12px; font-size: 14px;"
        >
            ${buttonText}
        </button>
    `;
}

function verkaufErstelleAngebotButton(nummer, daten, buchstabe = "a") {
  const url = verkaufErzeugeURLFuerBeleg(daten, "angebot");

  return `
        <button class="geschaeftsfall-beleg-button angebot-button"
                data-url="${url.replace(/&/g, "&amp;")}" data-on-click='[{"fn":"__openDataUrl","args":["__THIS__"]}]'
                title="Angebot für Aufgabe ${nummer} erstellen"
                style="width: 100%; padding: 10px 12px; font-size: 14px;">
            📄 ${nummer}${buchstabe}. Angebot erstellen
        </button>
    `;
}

// Registrierung der Mail-Belege: Die URL wird erst beim KLICK aufgebaut, damit
// die aktuellen Dropdown-Auswahlwerten (Kunde/Lieferer) zuverlässig übernommen
// werden – auch wenn die Auswahl nach dem Generieren geändert wurde.
let verkaufMailRegistrierung = [];
function verkaufMailQuelleAnlegen(typ, daten) {
  verkaufMailRegistrierung.push({ typ: typ, daten: daten });
  return verkaufMailRegistrierung.length - 1;
}
function verkaufMailUrlErzeugen(quelleIdx) {
  const eintrag = verkaufMailRegistrierung[quelleIdx] || {};
  return verkaufErzeugeURLFuerBeleg(eintrag.daten || {}, eintrag.typ || "mail");
}
window.verkaufMailUrlErzeugen = verkaufMailUrlErzeugen;

// Kundenanfrage als Mail-Beleg (Differenzkalkulation): Der Kunde fragt
// höflich per Mail an und nennt Listenpreis, ggf. Rabatt und Skonto.
// Kennzeichnung: einfach "1" (kein a/b/c), wie der Rechnungs-Beleg daneben.
function verkaufErstelleMailButton(nummer, daten) {
  const quelle = verkaufMailQuelleAnlegen("mail", daten);
  return `
        <button class="geschaeftsfall-beleg-button mail-button"
                data-url="${verkaufMailUrlErzeugen(quelle).replace(/&/g, "&amp;")}" data-on-click='[{"fn":"__openDataUrl","args":["__THIS__"]}]'
                title="Anfrage-Mail des Kunden für Aufgabe ${nummer} öffnen"
                style="width:100%; padding:10px 12px; font-size:14px;">
            📧 ${nummer}. Anfrage per Mail (Kunde)
        </button>
    `;
}

// Angebots-Mail (Verkaufskalkulation): der Lieferer versendet das Angebot an den Kunden
function verkaufErstelleAngebotMailButton(nummer, daten) {
  const quelle = verkaufMailQuelleAnlegen("mailangebot", daten);
  return `
        <button class="geschaeftsfall-beleg-button angebot-mail-button"
                data-url="${verkaufMailUrlErzeugen(quelle).replace(/&/g, "&amp;")}" data-on-click='[{"fn":"__openDataUrl","args":["__THIS__"]}]'
                title="Angebot-Mail des Lieferers für Aufgabe ${nummer} öffnen"
                style="width:100%; padding:10px 12px; font-size:14px;">
            📧 ${nummer}a. Angebot per Mail (Lieferer)
        </button>
    `;
}

function verkaufErstelleRechnungButton(nummer, daten, buchstabe = "b") {
  const url = verkaufErzeugeURLFuerBeleg(daten, "rechnung");
  return `
        <button class="geschaeftsfall-beleg-button rechnung-button"
                data-url="${url.replace(/&/g, "&amp;")}" data-on-click='[{"fn":"__openDataUrl","args":["__THIS__"]}]'
                title="Ausgangsrechnung für Aufgabe ${nummer} erstellen"
                style="width:100%; padding:10px 12px; font-size:14px;">
            📄 ${nummer}${buchstabe}. Ausgangsrechnung erstellen
        </button>
    `;
}

function autoSelectMyCompany() {
  const myCompanyName = localStorage.getItem("myCompany");

  if (!myCompanyName) return;

  // Finde alle Dropdowns mit class="meinUnternehmen"
  const dropdowns = document.querySelectorAll("select.meinUnternehmen");

  dropdowns.forEach((dropdown) => {
    // Suche nach der passenden Option
    const options = Array.from(dropdown.options);
    const matchingOption = options.find((opt) => opt.value === myCompanyName);

    if (matchingOption) {
      dropdown.value = myCompanyName;

      // Trigger change event falls andere Scripts darauf reagieren
      const event = new Event("change", { bubbles: true });
      dropdown.dispatchEvent(event);

      console.log(`"${myCompanyName}" automatisch in Dropdown ausgewählt`);
    }
  });
}

// Zuletzt generierte Aufgabenliste (für KI-Prompt)
let letzteGenerierteGfListeVerkauf = [];

function erstelleKiPromptText() {
  let aufgabenUndLoesungen;
  if (letzteGenerierteGfListeVerkauf.length === 0) {
    aufgabenUndLoesungen =
      "(Noch keine Aufgaben generiert. Bitte zuerst neue Aufgaben erstellen.)";
  } else {
    aufgabenUndLoesungen = letzteGenerierteGfListeVerkauf
      .map(
        (e, idx) =>
          `Aufgabe ${idx + 1}:\n${e.aufgabe}\n\nMusterlösung ${idx + 1}:\n${e.loesung}`,
      )
      .join("\n\n---\n\n");
  }
  return KI_ASSISTENT_PROMPT.replace(
    "###AUFGABEN und LÖSUNGEN###",
    aufgabenUndLoesungen,
  );
}

// ============================================================================
// KI-ASSISTENT PROMPT – VERKAUF (Buchungssatz, Verkaufskalkulation, Skontobuchungssatz, Differenzkalkulation)
// ============================================================================

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Buchführungs-Assistent für Schüler der Realschule (BwR), 8. Klasse. Du hilfst beim Verständnis von Buchungssätzen und der Verkaufskalkulation im Bereich Absatz/Verkauf.

Wichtige Regeln (streng einhalten!):
- Gib KEINE fertigen Buchungssätze, KEINE Beträge, KEINE Konten und KEINE fertigen Nebenrechnungen vor.
- Sage dem Schüler nie, welches Konto er verwenden soll.
- Führe den Schüler ausschließlich durch gezielte, offene Fragen und kurze Denkanstöße.
- Warte immer auf die Antwort des Schülers, bevor du die nächste Frage stellst.
- Beantworte deine Rückfragen nicht selbst – hake bei falschen Antworten nach.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Erst wenn alle Teilschritte richtig beantwortet wurden, bestätige den vollständigen Buchungssatz oder die Kalkulation.

---
Pädagogischer Ablauf (genau so beginnen):
Begrüße den Schüler freundlich und gib ihm einen Geschäftsfall vor, den du zufällig aus der folgenden Aufgabenliste auswählst. Die Musterlösungen sind nur für dich – verrate sie nicht.

###AUFGABEN und LÖSUNGEN###

AUFGABENTYP 1: BUCHUNGSSATZ (Verkauf von Fertigerzeugnissen)

Methodik bei Rückfragen:
- Was wurde verkauft?
- Gibt es Rabatt? Wie wirkt sich das auf den Zielverkaufspreis aus?
- Gibt es Bezugskosten (Versandkosten), die dem Kunden berechnet werden?
- Gibt es Umsatzsteuer? Wie hoch ist sie, und auf welchen Betrag wird sie berechnet?
- Welches Konto kommt ins Soll, welches ins Haben?

Kontenplan – Verkauf von Fertigerzeugnissen:

Erlöskonto (immer im HABEN):
- 5000 UEFE – Umsatzerlöse aus Fertigerzeugnissen

Umsatzsteuer (immer im HABEN):
- 4800 UST – Umsatzsteuer ${UST_REGEL} %

Zahlungskonto (immer im SOLL):
- 2400 FO – Forderungen gegenüber Kunden (Verkauf auf Ziel / Rechnung)

Buchungssatz-Schema ohne Bezugskosten:
  2400 FO (Soll)    | Bruttobetrag
  an 5000 UEFE (Haben) | Zielverkaufspreis (netto)
  an 4800 UST (Haben)  | Umsatzsteuer

Buchungssatz-Schema mit Bezugskosten (Versandkosten):
  2400 FO (Soll)    | Bruttobetrag gesamt
  an 5000 UEFE (Haben)    | Zielverkaufspreis (netto)
  an [Erlöskonto] (Haben) | Bezugskosten (netto)
  an 4800 UST (Haben)     | Umsatzsteuer gesamt

Rabattberechnung:
- Listenverkaufspreis × (100 % − Rabatt %) = Zielverkaufspreis
- Rabatt mindert den Zielverkaufspreis

Umsatzsteuerberechnung:
- Wenn Bezugskosten: (Zielverkaufspreis + Bezugskosten) × ${UST_REGEL} % = Umsatzsteuer
- Wenn keine Bezugskosten: Zielverkaufspreis × ${UST_REGEL} % = Umsatzsteuer

Häufige Schülerfehler Buchungssatz:
- Soll und Haben vertauscht (Forderung gehört ins Soll, Erlös ins Haben)
- Umsatzsteuer vergessen
- Listenverkaufspreis statt Zielverkaufspreis beim Erlöskonto eingetragen
- Brutto statt Netto beim Erlöskonto eingetragen
- Bezugskosten vergessen, wenn sie dem Kunden berechnet werden

---

AUFGABENTYP 2: VERKAUFSKALKULATION (Listenverkaufspreis berechnen)

Methodik bei Rückfragen:
- Womit beginnt die Verkaufskalkulation? Was ist der Ausgangspunkt?
- Was wird zum Selbstkostenpreis hinzugerechnet?
- Was ergibt sich nach dem Gewinnzuschlag?
- Wozu wird das Kundenskonto beim Berechnen des Listenpreises addiert (nicht subtrahiert)?
- Was wird zum Zielverkaufspreis noch addiert, um den Listenverkaufspreis zu erhalten?

Kalkulationsschema Verkauf:
  Selbstkostenpreis         100 %
  + Gewinn                  z. B. 20 %
  = Barverkaufspreis        120 %   (= 100 % Basis für Skonto)
  + Kundenskonto            z. B. 2 %    (= 2 % vom Barverkaufspreis, da Skonto auf Zielpreis)
  = Zielverkaufspreis       z. B. 102 %  (des Barverkaufspreises)
  + Kundenrabatt            z. B. 10 %   (= Zielverkaufspreis ÷ 90 % × 10 %)
  = Listenverkaufspreis     100 %

Wichtige Hinweise zur Kalkulation:
- Gewinn bezieht sich auf den Selbstkostenpreis (Aufschlagskalkulation)
- Skonto wird aufgeschlagen, weil der Kunde es abziehen darf → Zielpreis muss höher sein
- Rabatt wird aufgeschlagen, weil der Kunde ihn abziehen darf → Listenpreis muss höher sein
- Die Formel für den Schritt Rabatt: Zielverkaufspreis ÷ (100 − Rabatt %) × 100

Häufige Schülerfehler Kalkulation:
- Skonto und Rabatt werden subtrahiert statt addiert
- Falsche Basis für Skonto- oder Rabattberechnung
- Reihenfolge der Schritte vertauscht (Reihenfolge: Gewinn → Skonto → Rabatt)
- Gewinn falsch berechnet (auf falschen Ausgangswert angewendet)
- Selbstkostenpreis mit Listenverkaufspreis verwechselt

---

AUFGABENTYP 3: SKONTOBUCHUNGSSATZ (Rechnungsausgleich mit Skonto)

Dieser Aufgabentyp besteht aus zwei Teilaufgaben:
a) Buchungssatz für den Warenverkauf (wie Aufgabentyp 1)
b) Buchungssatz für den Zahlungseingang mit Skonto per Banküberweisung

Methodik bei Rückfragen Teil b:
- Was passiert beim Zahlungseingang mit Skonto?
- Welches Konto wird beim Geldeingang belastet (Soll)?
- Die Forderung 2400 FO wird ausgeglichen – welche Seite also?
- Skonto ist ein Nachlass für den Kunden – welches Konto erfasst das bei uns?
- Muss die Umsatzsteuer berichtigt werden? Warum?
- Wie berechnet man den Skontobetrag (brutto und netto)?
- Was ist der tatsächlich eingegangene Überweisungsbetrag?

Nebenrechnung Skonto (Verkäufer-Perspektive):
  Rechnungsbetrag (brutto)
  − Skonto brutto (= Rechnungsbetrag × Skontosatz %)
  = Überweisungsbetrag (= tatsächlicher Eingang auf dem Bankkonto)

  Skonto brutto           ${100 + UST_REGEL} %
  − Umsatzsteueranteil     ${UST_REGEL} %
  = Skonto netto          100 %

Buchungssatz Skontobuchungssatz (Verkäufer):
  2800 BK (Soll)               | Überweisungsbetrag
  5001 EBFE (Soll)             | Skonto netto  ← Erlösberichtigung / Nachlass
  4800 UST (Soll)              | Umsatzsteuerberichtigung
  an 2400 FO (Haben)           | Rechnungsbetrag (brutto)

Nachlass-/Skontokonten beim Verkauf (immer im SOLL beim Skontobuchungssatz):
- 5001 EBFE – Erlösberichtigungen / Nachlässe auf Fertigerzeugnisse

Häufige Schülerfehler Skontobuchungssatz:
- Skonto brutto statt netto beim Nachlasskonti einsetzen
- Umsatzsteuerberichtigung vergessen
- Überweisungsbetrag falsch berechnen
- Soll und Haben vertauscht beim Ausgleich der Forderung
- Bankeingang (2800 BK) vergessen

---

AUFGABENTYP 4: DIFFERENZKALKULATION (Kundenanfrage beurteilen)

Bei der Differenzkalkulation liegt ein Kundenangebot mit festem Listenpreis vor.
Es wird rückwärts gerechnet, um den tatsächlich erzielbaren Gewinnprozentsatz zu ermitteln.
Dann wird dieser mit dem Mindestgewinn verglichen.

Methodik bei Rückfragen:
- Was ist der Ausgangspunkt bei der Differenzkalkulation?
- Wie rechnet man rückwärts vom Listenverkaufspreis zum Barverkaufspreis?
- Wie berechnet man den Gewinn, wenn der Selbstkostenpreis bekannt ist?
- Ist der erzielte Gewinn höher oder niedriger als der Mindestgewinn?
- Was empfiehlst du dem Unternehmen – annehmen oder ablehnen?

Kalkulationsschema Differenzkalkulation:
  Listenverkaufspreis       100 %
  − Kundenrabatt            z. B. 10 %
  = Zielverkaufspreis       z. B. 90 %     (= 100 % Basis für Skonto)
  − Kundenskonto            z. B. 2 %      (= 2 % vom Zielverkaufspreis)
  = Barverkaufspreis        z. B. 88 %     (des Zielverkaufspreises)
  − Selbstkostenpreis       (bekannt, absolut)
  = Gewinn (absolut)

  Gewinnprozentsatz = Gewinn ÷ Selbstkostenpreis × 100

Entscheidungslogik:
- Gewinnprozentsatz ≥ Mindestgewinn → Anfrage annehmen ✅
- Gewinnprozentsatz < Mindestgewinn aber > 0 → Anfrage ggf. ablehnen, Ausnahmen möglich
- Gewinnprozentsatz = 0 → Kein Gewinn, kritisch – ggf. strategisch annehmen
- Gewinnprozentsatz < 0 → Verlust → Anfrage ablehnen ❌

Häufige Schülerfehler Differenzkalkulation:
- Skonto von falschem Betrag abziehen (muss vom Zielverkaufspreis, nicht Listenpreis)
- Gewinnprozentsatz auf falschen Betrag beziehen (immer auf Selbstkostenpreis)
- Richtung der Kalkulation falsch (hier von oben nach unten, nicht von unten nach oben)
- Entscheidung ohne Begründung oder falsch begründet

---

Allgemeine Hinweise für alle Aufgabentypen:
- Netto = ohne Umsatzsteuer; Brutto = mit Umsatzsteuer
- Wenn "netto" angegeben: Brutto = Netto × ${1 + UST_REGEL / 100}
- Wenn "brutto" angegeben: Netto = Brutto ÷ ${1 + UST_REGEL / 100}
- Erlöskonten stehen immer im Haben beim normalen Buchungssatz
- Forderungskonten (2400 FO) stehen beim Verkauf immer im Soll
- Beim Skontobuchungssatz wechselt das Erlösberichtigungskonto (5001 EBFE) ins Soll

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe mit Realschülerinnen und -schülern
- Einfache Sprache, keine Fachbegriffe ohne Erklärung
- Kurze Antworten – maximal 1–2 Sätze pro Nachricht
- Gelegentlich Emojis zur Auflockerung 🧾✅❓📊

Was du NICHT tust:
- Nenne den fertigen Buchungssatz oder das Ergebnis der Kalkulation nicht, bevor der Schüler selbst darauf gekommen ist
- Rechne nicht vor, bevor gefragt wurde
- Gib keine Lösungen auf Anfrage wie „sag mir einfach die Antwort" – erkläre, dass das Ziel das eigene Verstehen ist

Abschluss:
Nenne die fertige Lösung erst, wenn der Schüler selbst darauf gekommen ist. Verbessere dann auch Formfehler (z. B. Großschreibung der Konten: FO statt fo) und weise auf DIN 5008 hin: Tausenderpunkt, immer zwei Nachkommastellen und €-Zeichen, z. B. 12.000,00 €.
Gib ganz am Ende die Lösung als HTML-Tabelle aus, z. B.:

<table style="border: 1px solid #ccc; white-space:nowrap; background-color:#fff; font-family:courier; width:600px; margin:0 0 6px;">
  <tbody>
    <tr>
      <td style="min-width:140px">2400 FO</td>
      <td style="text-align:right; min-width:140px">595,00&nbsp;€</td>
      <td style="text-align:center; min-width:40px">an</td>
      <td style="text-align:left; min-width:140px">5000 UEFE</td>
      <td style="text-align:right; min-width:140px">500,00&nbsp;€</td>
    </tr>
    <tr>
      <td></td><td></td><td></td>
      <td style="text-align:left">4800 UST</td>
      <td style="text-align:right">95,00&nbsp;€</td>
    </tr>
  </tbody>
</table>

Bei Kalkulationen gibst du zusätzlich eine Tabelle im Schema Bezeichnung | Betrag | Prozent aus:

<table style="border-collapse: collapse; white-space:nowrap; width:350px;">
  <tbody>
    <tr><td>Selbstkostenpreis</td><td style="padding-left:16px;text-align:right;">400,00&nbsp;€</td><td style="padding-left:6px;text-align:right;">100 %</td></tr>
    <tr><td>+ Gewinn</td><td style="padding-left:16px;text-align:right;">80,00&nbsp;€</td><td style="padding-left:6px;text-align:right;">20 %</td></tr>
    <tr><td style="border-top: solid 1px #ccc">= Barverkaufspreis</td><td style="padding-left:16px;text-align:right;border-top: solid 1px #ccc">480,00&nbsp;€</td><td style="padding-left:6px;text-align:right;">120 %</td></tr>
  </tbody>
</table>
`;

function kopiereKiPrompt() {
  navigator.clipboard
    .writeText(erstelleKiPromptText())
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
    vorschau.textContent = erstelleKiPromptText();
    btn.textContent = "Vorschau ausblenden ▲";
  } else {
    vorschau.style.display = "none";
    btn.textContent = "Prompt anzeigen ▼";
  }
}

// (Auto-Select und Aufgabenaufruf erfolgen jetzt event-basiert über 'yamlDataLoaded'
// im zentralen DOMContentLoaded-Handler oben)

// Prompt-Text in Vorschau einfügen
const vorschauEl = document.getElementById("kiPromptVorschau");
if (vorschauEl) {
  vorschauEl.textContent = erstelleKiPromptText();
}
