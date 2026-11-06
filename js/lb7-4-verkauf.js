// ============================================================================
// ABSATZ – VERKAUFSBUCHUNGEN (UEFE)
// ============================================================================

let kundeVerkauf = "<i>[Modellunternehmen]</i>";
let yamlDataVerkauf = [];
function getUserCompanies() {
  const stored = localStorage.getItem('userCompanies');
  return stored ? JSON.parse(stored) : [];
}

function mergeUserCompaniesIntoYamlDataVerkauf() {
  const userCompanies = getUserCompanies();
  
  if (userCompanies.length > 0) {
    yamlDataVerkauf = [...yamlDataVerkauf, ...userCompanies];
    
    yamlDataVerkauf.sort((a, b) => {
      const brancheA = a.unternehmen?.branche || '';
      const brancheB = b.unternehmen?.branche || '';
      return brancheA.localeCompare(brancheB);
    });
    
    console.log(`${userCompanies.length} Benutzerunternehmen zu yamlDataVerkauf hinzugefügt. Gesamt: ${yamlDataVerkauf.length}`);
  }
}


// ============================================================================
// RABATT
// ============================================================================

const RABATT_SAETZE_V = [5, 10, 15, 20];

function genZielUndListenpreisV(rabattProzent) {
  const listSchritt = { 5: 2000, 10: 1000, 15: 2000, 20: 1000 };
  const s = listSchritt[rabattProzent] || 1000;
  const minK = Math.ceil(2000 / s);
  const maxK = Math.floor(20000 / s);
  const liste = (minK + Math.floor(Math.random() * (maxK - minK + 1))) * s;
  const faktor = 1 - rabattProzent / 100;
  const netto = Math.round(liste * faktor);
  return { listennetto: liste, nettoBetrag: netto };
}

// ============================================================================
// GESCHÄFTSFALL-DEFINITIONEN
// ============================================================================

const alleGfVerkauf = [
  {
    id: "uefe_verkauf_fo",
    typ: "einfach_ust",
    soll: "FO",
    haben: "UEFE",
    belegtyp: "ausgangsrechnung",
    vorlagen: [
      "{kunde} stellt eine Ausgangsrechnung für {artikel} aus",
      "{kunde} liefert {artikel} auf Ziel",
      "{kunde} verkauft {artikel} gegen Rechnung",
      "Von {kunde} werden {artikel} geliefert, eine Rechnung geht an den Kunden",
      "{kunde} sendet eine Rechnung über {artikel} an einen Kunden",
      "{kunde} sendet {artikel} auf Ziel",
      "{kunde} schreibt einem Kunden eine Rechnung über {artikel}",
      "{kunde} beliefert einen Kunden auf Ziel mit {artikel}",
    ],
  },
];

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================

function formatCurrencyV(value) {
  return value.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}
function pickV(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function parseNumericValueV(value) {
  if (!value) return "0";
  return value.toString().replace(/[€\s]/g, "").replace(/\./g, "").replace(",", ".");
}

function generateNettoOhneRabattV() {
  return (2 + Math.floor(Math.random() * 17)) * 1000; // 2000 … 18000
}

// ============================================================================
// YAML-HILFSFUNKTIONEN
// ============================================================================

function existiertInCoreVK(unternehmen, coreData) {
  const key = String(unternehmen?.unternehmen?.id ?? '') + '|' + String(unternehmen?.unternehmen?.name ?? '').trim().toLowerCase();
  const name = String(unternehmen?.unternehmen?.name ?? '').trim().toLowerCase();
  return (coreData || []).some(c => (String(c?.unternehmen?.id ?? '') + '|' + String(c?.unternehmen?.name ?? '').trim().toLowerCase()) === key || String(c?.unternehmen?.name ?? '').trim().toLowerCase() === name);
}

function ladeYamlVerkauf() {
  fetch("js/unternehmen.yml?v=" + Date.now())
    .then((r) => (r.ok ? r.text() : Promise.reject()))
    .then((txt) => {
      const coreData = jsyaml.load(txt) || [];
      try { localStorage.setItem("standardYamlData", JSON.stringify(coreData)); } catch (e) {}
      const saved = localStorage.getItem("uploadedYamlCompanyData");
      let zusaetzliche = [];
      if (saved) {
        try {
          const uploaded = JSON.parse(saved);
          zusaetzliche = uploaded.filter(u => !existiertInCoreVK(u, coreData));
          if (zusaetzliche.length === 0) {
            localStorage.removeItem("uploadedYamlCompanyData");
          } else if (zusaetzliche.length !== uploaded.length) {
            localStorage.setItem("uploadedYamlCompanyData", JSON.stringify(zusaetzliche));
          }
        } catch (e) { localStorage.removeItem("uploadedYamlCompanyData"); }
      }
      yamlDataVerkauf = [...coreData, ...zusaetzliche];
      mergeUserCompaniesIntoYamlDataVerkauf();
      document.dispatchEvent(new Event("yamlDataVerkaufLoaded"));
    })
    .catch(() => {});
  return false;
}



function fillCompanyDropdownV() {
  if (!yamlDataVerkauf?.length) return;
  const select = document.getElementById("verkaufKunde");
  if (!select) return;
  const sorted = [...yamlDataVerkauf].sort((a, b) => {
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

function autoSelectMyCompanyV() {
  const name = localStorage.getItem("myCompany");
  if (!name) return;
  const sel = document.getElementById("verkaufKunde");
  if (!sel) return;
  const opt = Array.from(sel.options).find((o) => o.value === name);
  if (opt) {
    sel.value = name;
    kundeVerkauf = name;
    sel.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

function getZufaelligenAbnehmer() {
  if (!yamlDataVerkauf?.length) return { name: "Musterhandel GmbH" };
  const myName = document.getElementById("verkaufKunde")?.value?.trim() || "";
  const andere = yamlDataVerkauf.filter(
    (e) => e.unternehmen?.name && e.unternehmen.name !== myName
  );
  if (!andere.length) return { name: "Musterhandel GmbH" };
  const u = pickV(andere).unternehmen;
  return {
    name: `${u.name} ${u.rechtsform ?? ""}`.trim(),
    strasse: u.adresse?.strasse ?? "",
    plz: u.adresse?.plz ?? "",
    ort: u.adresse?.ort ?? "",
  };
}

// ============================================================================
// TABELLEN-HELPER
// ============================================================================

function tdV(content, align = "left", minW = 140) {
  return `<td style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:${minW}px;min-width:${minW}px;text-align:${align}" tabindex="1">${content}</td>`;
}
function tdCV(content) {
  return `<td style="text-align:center;width:100px;white-space:nowrap;min-width:40px" tabindex="1">${content}</td>`;
}
function tableWrapV(rowsHTML) {
  return `<table style="border:1px solid #ccc;white-space:nowrap;background-color:#fff;font-family:courier;width:600px;margin:0 0 0px"><tbody>${rowsHTML}</tbody></table>`;
}

// ============================================================================
// BUCHUNGSSATZ + NEBENRECHNUNG
// ============================================================================

function bsEinfachUstV(gf) {
  const {
    sollKto, habenKto,
    nettoBetrag, Umsatzsteuer, bruttoBetrag,
    rabatt, rabattProzent,
    listennetto, listenbrutto, rabattBetrag,
    angabeIstBrutto,
  } = gf;

  const bs = tableWrapV(
    `<tr>${tdV(sollKto)}${tdV(formatCurrencyV(bruttoBetrag), "right")}${tdCV("an")}${tdV(habenKto)}${tdV(formatCurrencyV(nettoBetrag), "right")}</tr>` +
    `<tr>${tdV("")}${tdV("", "right")}${tdCV("")}${tdV("UST")}${tdV(formatCurrencyV(Umsatzsteuer), "right")}</tr>`,
  );

  function opRow(label, op, betrag) {
    return `<tr>
      <td style="border-width: 0;padding:1px 10px 1px 2px;color:#444;">${label}</td>
      <td style="border-width: 0;padding:1px 0;text-align:right;font-family:courier;color:#444;" colspan="2">${op}&nbsp;${formatCurrencyV(betrag)}</td>
    </tr>`;
  }
  function resRow(label, betrag) {
    return `<tr style="border-top:1px solid #aaa;">
      <td style="border-width: 0;padding:2px 10px 2px 0;">${label}</td>
      <td style="border-width: 0;padding:1px 0;text-align:right;font-family:courier;" colspan="2">${formatCurrencyV(betrag)}</td>
    </tr>`;
  }
  function startRow(label, betrag) {
    return `<tr>
      <td style="padding:2px 10px 2px 0;">${label}</td>
      <td style="border-width: 0;padding:1px 0;text-align:right;font-family:courier;" colspan="2">${formatCurrencyV(betrag)}</td>
    </tr>`;
  }

  let rows = "";
  if (rabatt) {
    rows =
      startRow("Listenverkaufspreis netto", listennetto) +
      opRow(`- Rabatt ${rabattProzent} %`, "", rabattBetrag) +
      resRow("Zielverkaufspreis", nettoBetrag) +
      opRow("+ Umsatzsteuer (${UST_REGEL} %)", "+", Umsatzsteuer) +
      resRow("Rechnungsbetrag", bruttoBetrag);
  } else if (!rabatt && angabeIstBrutto) {
    rows =
      startRow("Rechnungsbetrag", bruttoBetrag) +
      opRow("- Umsatzsteuer (${UST_REGEL} %)", "", Umsatzsteuer) +
      resRow("Verkaufspreis netto", nettoBetrag);
  } else {
    rows =
      startRow("Verkaufspreis netto", nettoBetrag) +
      opRow("+ Umsatzsteuer (${UST_REGEL} %)", "+", Umsatzsteuer) +
      resRow("Rechnungsbetrag", bruttoBetrag);
  }

  const nebenrechnung = `<div style="margin:12px 0 12px 0">
    <div style="font-size:14px;color:#666;margin-bottom:3px;font-style:italic">Nebenrechnung:</div>
    <table style="border-collapse:collapse;font-size:13px;color:#333;min-width:280px">
      <tbody>${rows}</tbody>
    </table>
  </div>`;

  return bs + nebenrechnung;
}

// ============================================================================
// GESCHÄFTSFALL GENERIEREN
// ============================================================================
// ============================================================================
// DYNAMISCHE PRODUKTBEZEICHNUNG (ANALOG ZU LB8)
// ============================================================================

function getProduktbezeichnung() {
  // 1. Falls ein manuelles Eingabefeld genutzt wird, dieses bevorzugen
  const val = document.getElementById("produktBezeichnung")?.value?.trim();
  if (val) return val;

  // 2. Aktuell ausgewähltes Unternehmen ermitteln
  const selectedCompanyName = document.getElementById("verkaufKunde")?.value?.trim();
  
  if (selectedCompanyName && yamlDataVerkauf?.length) {
    const companyEntry = yamlDataVerkauf.find(
      (e) => e.unternehmen?.name === selectedCompanyName
    );
    
    // a) Prüfen, ob das Unternehmen Fertigerzeugnisse definiert hat (z. B. Werkstoffunternehmen)
    const hauptwerkProdukte = companyEntry?.unternehmen?.fertigerzeugnisse?.hauptwerk;
    if (hauptwerkProdukte && hauptwerkProdukte.length > 0) {
      const zufallsProdukt = pickV(hauptwerkProdukte);
      return zufallsProdukt.name;
    }

    // b) Prüfen, ob Werkstoffe definiert sind (falls als Erzeugnisse/Bauteile relevant)
    if (companyEntry?.unternehmen?.werkstoffe?.AWR?.length) {
      return pickV(companyEntry.unternehmen.werkstoffe.AWR);
    }
  }

  // Fallback, wenn kein spezielles Erzeugnis gefunden wurde
  return "Fertigerzeugnisse";
}

// Zufälliges Fertigerzeugnis des gewählten Verkäufers (oder null)
function waehleProduktV() {
  const name = document.getElementById("verkaufKunde")?.value?.trim() || "";
  const firma = yamlDataVerkauf.find((c) => c.unternehmen?.name === name);
  const u = firma?.unternehmen;
  // "ferigerzeugnisse" = alter Tippfehler-Schlüssel in bereits gespeicherten Unternehmen
  const liste = (u?.fertigerzeugnisse || u?.ferigerzeugnisse)?.hauptwerk;
  if (!Array.isArray(liste)) return null;
  const gueltig = liste.filter((p) => p?.name?.trim());
  return gueltig.length ? pickV(gueltig) : null;
}

// Menge + Stückpreis innerhalb der Preisspanne (oder null ohne gültige Preise)
function genMengePreisV(produkt) {
  const min = Number(produkt?.preis_min);
  const max = Number(produkt?.preis_max);
  if (!produkt || !Number.isFinite(min) || !Number.isFinite(max) || max < min) return null;

  // Schrittweite so, dass Rabatte (5/10/15/20 %) glatte Beträge ergeben
  const step = max >= 1000 ? 100 : (max >= 100 ? 20 : 1);
  const lo = Math.ceil(min / step);
  const hi = Math.floor(max / step);
  const stueckpreis = hi < lo
    ? Math.round(min)
    : (lo + Math.floor(Math.random() * (hi - lo + 1))) * step;

  // Menge: mindestens 2, Obergrenze je nach Stückpreis, Gesamtwert max. 100.000 €
  let maxMenge = stueckpreis >= 5000 ? 8 : stueckpreis >= 1000 ? 15 : stueckpreis >= 100 ? 30 : 100;
  maxMenge = Math.max(2, Math.min(maxMenge, Math.floor(100000 / stueckpreis)));
  const menge = 2 + Math.floor(Math.random() * (maxMenge - 1));

  return { menge, stueckpreis, gesamt: menge * stueckpreis };
}

// Zuletzt generierte GF-Liste (für KI-Prompt)
let letzteGenerierteGfListeV = [];

function erstelleZufallsGeschaeftsfallV() {
  const mitRabattOpt = document.getElementById("optMitRabattV").checked;
  const ustAngegeben = document.getElementById("optUstAngegeben")?.checked ?? false;

  const typ = alleGfVerkauf[0];
  const produkt = waehleProduktV();
  const posten = genMengePreisV(produkt);
  const mitMenge = !!posten;
  const produktname = produkt ? produkt.name.trim() : getProduktbezeichnung();
  // Einheit aus der YAML (z. B. "m²", "m"); ohne Angabe -> "Stk" für den Beleg, im Text keine Einheit
  const einheitYaml = produkt?.einheit ? String(produkt.einheit).trim() : "";
  const artikelText = mitMenge
    ? `${posten.menge}${einheitYaml ? "\u00a0" + einheitYaml : ""} ${produktname}`
    : produktname;
  const abnehmerObj = getZufaelligenAbnehmer();

  const mitRabatt = mitRabattOpt;
  const rabattProzent = mitRabatt ? pickV(RABATT_SAETZE_V) : 0;

  let listennetto, nettoBetrag;
  if (mitMenge) {
    listennetto = posten.gesamt;
    nettoBetrag = mitRabatt
      ? Math.round(listennetto * (1 - rabattProzent / 100))
      : listennetto;
  } else if (mitRabatt) {
    const betraege = genZielUndListenpreisV(rabattProzent);
    listennetto = betraege.listennetto;
    nettoBetrag = betraege.nettoBetrag;
  } else {
    nettoBetrag = generateNettoOhneRabattV();
    listennetto = nettoBetrag;
  }

  const rabattBetrag = listennetto - nettoBetrag;
  const Umsatzsteuer = nettoBetrag * UST_REGEL / 100;
  const bruttoBetrag = nettoBetrag + Umsatzsteuer;
  const listenbrutto = listennetto + Math.round(listennetto * UST_REGEL / 100);

  const angabeIstBrutto = mitRabatt ? false : Math.random() < 0.5;

  const rabattFormulierungen = mitMenge ? [
    `${formatCurrencyV(listennetto)} netto, mit einem Rabatt von ${rabattProzent}\u00a0%`,
    `${formatCurrencyV(listennetto)} netto für die gesamte Lieferung. Es wird ein Rabatt von ${rabattProzent}\u00a0% gewährt`,
    `${formatCurrencyV(listennetto)} netto (abzüglich ${rabattProzent}\u00a0% Rabatt)`,
    `${formatCurrencyV(listennetto)} netto, abzüglich ${rabattProzent}\u00a0% Rabatt`,
  ] : [
    `${formatCurrencyV(listennetto)} netto, mit einem Rabatt von ${rabattProzent}\u00a0%`,
    `${formatCurrencyV(listennetto)} netto. Es wird ein Rabatt von ${rabattProzent}\u00a0% gewährt`,
    `${formatCurrencyV(listennetto)} netto (abzüglich ${rabattProzent}\u00a0% Rabatt)`,
    `${formatCurrencyV(listennetto)} netto, abzüglich ${rabattProzent}\u00a0% Rabatt`,
  ];
  const nettoFormulierungen = mitMenge ? [
    `${formatCurrencyV(nettoBetrag)} netto`,
    `${formatCurrencyV(nettoBetrag)} netto`,
    `${formatCurrencyV(nettoBetrag)} netto`,
  ] : [
    `Verkaufspreis netto: ${formatCurrencyV(nettoBetrag)}`,
    `Nettobetrag: ${formatCurrencyV(nettoBetrag)}`,
    `Listenpreis netto: ${formatCurrencyV(nettoBetrag)}`,
  ];
  const bruttoFormulierungen = mitMenge ? [
    `${formatCurrencyV(bruttoBetrag)} brutto`,
    `${formatCurrencyV(bruttoBetrag)} brutto`,
    `${formatCurrencyV(bruttoBetrag)} brutto`,
  ] : [
    `Rechnungsbetrag: ${formatCurrencyV(bruttoBetrag)}`,
    `brutto: ${formatCurrencyV(bruttoBetrag)}`,
    `Rechnungsbetrag: ${formatCurrencyV(bruttoBetrag)}`,
  ];

  let betragText;
  if (mitRabatt) {
    betragText = pickV(rabattFormulierungen);
  } else {
    betragText = angabeIstBrutto ? pickV(bruttoFormulierungen) : pickV(nettoFormulierungen);
  }

  const ustFormulierungen = mitMenge ? [
    `Die Umsatzsteuer beträgt insgesamt ${formatCurrencyV(Umsatzsteuer)}.`,
    `Umsatzsteuer insgesamt (19\u00a0%): ${formatCurrencyV(Umsatzsteuer)}.`,
    `Der Umsatzsteuerbetrag liegt insgesamt bei ${formatCurrencyV(Umsatzsteuer)}.`,
  ] : [
    `Die Umsatzsteuer beträgt ${formatCurrencyV(Umsatzsteuer)}.`,
    `Umsatzsteuer (19\u00a0%): ${formatCurrencyV(Umsatzsteuer)}.`,
    `Der Umsatzsteuerbetrag liegt bei ${formatCurrencyV(Umsatzsteuer)}.`,
  ];

  const ustHinweis = ustAngegeben ? ` ${pickV(ustFormulierungen)}` : "";

  // "mit {artikel}" verlangt den Dativ -> bei echten Produkten weglassen
  const vorlagenPool = produkt
    ? typ.vorlagen.filter((v) => !v.includes("mit {artikel}"))
    : typ.vorlagen;
  const textVorlage = pickV(vorlagenPool)
    .replace("{kunde}", kundeVerkauf)
    .replace("{artikel}", artikelText);

  const betragsEinleitungen = [
    "in Höhe von insgesamt",
    "zum Betrag von insgesamt",
    "mit einem Betrag von insgesamt",
    "in Höhe von insgesamt",
  ];
  const nurBrutto = angabeIstBrutto && !mitRabatt;
  const einleitungPool = nurBrutto
    ? betragsEinleitungen
    : betragsEinleitungen.filter(e => !e.includes("Rechnungsbetrag"));
  const einleitung = pickV(einleitungPool);

  const geschaeftsfallText = `${textVorlage} ${einleitung} ${betragText}.${ustHinweis}`;

  return {
    text: geschaeftsfallText,
    typ,
    abnehmerObj,
    produktname,
    artikelBelegName: produktname,
    menge: posten ? posten.menge : null,
    stueckpreis: posten ? posten.stueckpreis : null,
    einheit: einheitYaml || "Stk",
    sollKto: typ.soll,
    habenKto: typ.haben,
    rabatt: mitRabatt,
    rabattProzent,
    listennetto,
    listenbrutto,
    rabattBetrag,
    nettoBetrag,
    Umsatzsteuer,
    bruttoBetrag,
    angabeIstBrutto,
  };
}

// ============================================================================
// BUCHUNGSSATZ DISPATCHER
// ============================================================================

function erstelleBuchungssatzV(gf) {
  return bsEinfachUstV(gf);
}

// ============================================================================
// MUSTERLÖSUNG ALS REINER TEXT (für KI-Prompt)
// ============================================================================

function erstelleLoesungsTextV(gf) {
  const fmtV = (v) =>
    v.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

  // Buchungssatz: FO Brutto an UEFE Netto / UST UST-Betrag
  const bs =
    `${gf.sollKto} ${fmtV(gf.bruttoBetrag)} an ${gf.habenKto} ${fmtV(gf.nettoBetrag)} / UST ${fmtV(gf.Umsatzsteuer)}`;

  const fmtLine = (label, betrag, prefix = "") =>
    `  ${label}: ${prefix}${fmtV(betrag)}`;

  let nr = "";
  if (gf.rabatt) {
    nr = [
      fmtLine("Listenverkaufspreis netto", gf.listennetto),
      fmtLine(`- Rabatt ${gf.rabattProzent} %`, gf.rabattBetrag, "- "),
      fmtLine("= Zielverkaufspreis (netto)", gf.nettoBetrag),
      fmtLine("+ Umsatzsteuer (${UST_REGEL} %)", gf.Umsatzsteuer, "+ "),
      fmtLine("= Rechnungsbetrag", gf.bruttoBetrag),
    ].join("\n");
  } else if (gf.angabeIstBrutto) {
    nr = [
      fmtLine("Rechnungsbetrag", gf.bruttoBetrag),
      fmtLine("- Umsatzsteuer (${UST_REGEL} %)", gf.Umsatzsteuer, "- "),
      fmtLine("= Verkaufspreis netto", gf.nettoBetrag),
    ].join("\n");
  } else {
    nr = [
      fmtLine("Verkaufspreis netto", gf.nettoBetrag),
      fmtLine("+ Umsatzsteuer (${UST_REGEL} %)", gf.Umsatzsteuer, "+ "),
      fmtLine("= Rechnungsbetrag", gf.bruttoBetrag),
    ].join("\n");
  }

  return `Buchungssatz: ${bs}\nNebenrechnung:\n${nr}`;
}

// ============================================================================
// KI-PROMPT MIT AKTUELLEN AUFGABEN UND LÖSUNGEN
// ============================================================================

function erstelleKiPromptText() {
  let aufgabenUndLoesungen = "";
  if (letzteGenerierteGfListeV.length === 0) {
    aufgabenUndLoesungen = "(Noch keine Aufgaben generiert. Bitte zuerst neue Aufgaben erstellen.)";
  } else {
    aufgabenUndLoesungen = letzteGenerierteGfListeV
      .map((gf, idx) => {
        const nr = idx + 1;
        return `Aufgabe ${nr}:\n${gf.text}\n\nMusterlösung ${nr}:\n${erstelleLoesungsTextV(gf)}`;
      })
      .join("\n\n---\n\n");
  }
  return KI_ASSISTENT_PROMPT.replace("###AUFGABEN und LÖSUNGEN###", aufgabenUndLoesungen);
}

// ============================================================================
// KI-ASSISTENT PROMPT-VORLAGE
// ============================================================================

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher, geduldiger Buchführungs-Assistent speziell für Schüler der Realschule im Fach BwR (Jahrgangsstufe 7).

Deine einzige Aufgabe:
Du hilfst Schülern, Absatzbuchungen (Verkäufe) selbstständig zu verstehen und zu lösen – ohne ihnen die Lösung abzunehmen.

Wichtige Regeln (streng einhalten!):
- Gib **KEINE** fertigen Buchungssätze, KEINE Beträge, KEINE Konten und KEINE fertigen Nebenrechnungen vor.
- Sage dem Schüler **nie**, welches Konto (FO, UEFE, UST etc.) er verwenden soll.
- Gib keine Hinweise wie „Denk an die Umsatzsteuer" oder „FO kommt ins Soll".
- Führe den Schüler ausschließlich durch **gezielte, offene Fragen** und kurze Denkanstöße.
- Warte immer auf die richtige Antwort des Schülers, bevor du die nächste Frage stellst.
- Bei Fehlern erkläre das zugrundeliegende Prinzip, ohne die richtige Buchung zu nennen oder vorzurechnen.

Pädagogischer Ablauf (genau so beginnen):
1. Begrüße den Schüler freundlich und gib ihm einen Geschäftfall vor, den du aus der folgenden Aufgabenliste zufällig auswählst:

###AUFGABEN und LÖSUNGEN###

2. Sobald der Schüler einen Geschäftsfall geschickt hat, stelle die Fragen nacheinander (nicht in einer Antwort). Schreibe nie die Lösung in deine Antwort, wenn der Schüler falsch antwortet. Bevor du die nächste Frage stellst, sollte die aktuelle Frage richtig beantwortet sein.
   - Frage : „Welche Konten werden benötigt?"  Prüfe, ob die Schülerlösung stimmt. Schaue dazu für dich in der Musterlösung nach welche Konten gebucht werden! Sage dann, ob der Schüler falsch liegt oder ob es richtig ist.
   - Lass den Schüler überlegen, ob Rabatt vorhanden ist und was das für die Berechnung bedeutet (nur wenn ein Rabatt im Geschäftsfall angegeben ist).
   - Frage gezielt: „Wie gehst du mit dem Rabatt um?" oder „Worauf berechnest du die Vorsteuer?" (nur wenn Rabatt im Geschäftsfall angegeben ist)
   - Frage, wie die Umsatzsteuer berechnet wird. (nur wenn die Umsatzsteuer nicht im Geschäftsfall angegeben ist).
   - Frage weiter "Bilde nun den vollständigen Buchungssatz"

Konten (nur durch Fragen klären, nicht nennen oder erklären):
- FO – Forderungen aus Lieferungen und Leistungen (Verkauf auf Ziel)
- UEFE – Umsatzerlöse aus Fertigerzeugnissen (Nettobetrag nach Rabatt)
- UST - Umsatzsteuer (${UST_REGEL} % auf den Nettobetrag nach Rabatt)

Buchungslogik (nur durch Fragen herausfinden lassen):
Verkauf auf Ziel: Aktivkonto (FO) im Soll, Ertragskonto (UEFE) und Passivkonto (UST) im Haben.
Rabatt wird NICHT gebucht – er wird nur in der Nebenrechnung abgezogen. Immer der Nettobetrag nach Rabatt zählt für UEFE und UST.

Tonalität:
- Sehr freundlich, motivierend und kurz (max. 1–2 Sätze pro Nachricht)
- Verwende gelegentlich passende Emojis: 📦 ✅ ❓ 👍 💰
- Sprich den Schüler direkt an („du")
- Loben, wenn er etwas gut gemacht hat: „Genau richtig überlegt!" oder „Super Ansatz!"

Wichtige Verbote:
- Nenne niemals selbst einen Buchungssatz oder Teile davon.
- Rechne keine Beträge vor und gib keine fertigen Nebenrechnungen.
- Korrigiere Fehler nicht direkt, sondern stelle eine Frage, die den Schüler zum Nachdenken bringt (z. B. „Warum hast du den Bruttobetrag bei den Erlösen eingetragen? Worauf wird die Umsatzsteuer eigentlich berechnet?").
- Verwechsle niemals VORST (Einkauf) mit UST (Verkauf) – falls der Schüler das tut, lenke durch Fragen zurück.

Kontenplan – Absatz / Verkauf:

Kontennummern sind in Jahrgangsstufe 7 noch nicht bekannt.

Aktivkonten (Zugang im SOLL):
- FO – Forderungen aus Lieferungen und Leistungen: Verkauf auf Ziel; Kunde schuldet den Betrag noch

Ertragskonten (Zugang im HABEN):
- UEFE – Umsatzerlöse aus Fertigerzeugnissen: Nettobetrag des Verkaufs (nach Rabatt)

Passivkonten (Zugang im HABEN):
- UST - Umsatzsteuer: ${UST_REGEL} % des Nettobetrags, bei jeder Ausgangsrechnung

Buchungslogik (Verkauf auf Ziel):
  FO  | Bruttobetrag  | an | UEFE | Nettobetrag (nach Rabatt)
      |               |    | UST  | ${UST_REGEL} % × Netto

Der Rabatt wird NICHT gebucht! Er erscheint nur in der Nebenrechnung.

Nebenrechnung – 4 Fälle:

Fall 1: Angabe Verkaufspreis netto, kein Rabatt
  Verkaufspreis netto       10.000 €
  + Umsatzsteuer (${UST_REGEL} %)    + 1.900 €
  Rechnungsbetrag           11.900 €

Fall 2: Angabe Rechnungsbetrag (brutto), kein Rabatt
  Rechnungsbetrag           11.900 €
  − Umsatzsteuer (${UST_REGEL} %)    − 1.900 €
  Verkaufspreis netto       10.000 €

Fall 3: Angabe Listenverkaufspreis netto, mit Rabatt (z. B. 10 %)
  Listenverkaufspreis netto   10.000 €
  − Rabatt 10 %               − 1.000 €
  Zielverkaufspreis            9.000 €
  + Umsatzsteuer (${UST_REGEL} %)       + 1.710 €
  Rechnungsbetrag             10.710 €


Häufige Schülerfehler:
- FO und UEFE verwechseln (was steht im Soll, was im Haben?)
- UST vergessen
- Brutto statt Netto bei UEFE eintragen
- Rabatt nicht abziehen, bevor UST berechnet wird
- Vorsteuer und Umsatzsteuer verwechseln (VORST = Einkauf, UST = Verkauf)
- FO mit VE verwechseln (Verkauf mit Einkauf verwechseln)

Tonalität: freundlich, kurz (1–2 Sätze), gelegentlich Emojis 📦✅❓

Du wartest stets auf die Eingabe des Schülers und gibst nichts vor. Dein Ziel ist es, dass der Schüler die Buchung selbst findet und versteht.
Nenne den fertigen Buchungssatz erst, wenn der Schüler selbst darauf gekommen ist. Verbessere am Schluss dann auch Formfehler, zum Beispiel Großschreibung der Konten (VE statt Ve) und weise darauf hin die DIN 5008 zu beachten: Tausenderpunkt bei den Beträgen mit zwei Nachkommastellen und €-Zeichen: z. B. 12.000,00 €
Gib ganz am Ende den Buchungssatz mit einer Tabellenstruktur in html aus (falls HTML zugelassen ist und gerendert wird, gib aber nicht den html Text zum kopieren aus), Vorlage:
<table style="border:1px solid #ccc;white-space:nowrap;background-color:#fff;font-family:courier;width:600px;margin:0 0 0px"><tbody><tr><td style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;min-width:140px;text-align:left" tabindex="1">FO</td><td style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;min-width:140px;text-align:right" tabindex="1">4.760,00&nbsp;€</td><td style="text-align:center;width:100px;white-space:nowrap;min-width:40px" tabindex="1">an</td><td style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;min-width:140px;text-align:left" tabindex="1">UEFE</td><td style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;min-width:140px;text-align:right" tabindex="1">4.000,00&nbsp;€</td></tr><tr><td style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;min-width:140px;text-align:left" tabindex="1"></td><td style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;min-width:140px;text-align:right" tabindex="1"></td><td style="text-align:center;width:100px;white-space:nowrap;min-width:40px" tabindex="1"></td><td style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;min-width:140px;text-align:left" tabindex="1">UST</td><td style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;min-width:140px;text-align:right" tabindex="1">760,00&nbsp;€</td></tr></tbody></table><div style="margin:12px 0 12px 0">
    <div style="font-size:14px;color:#666;margin-bottom:3px;font-style:italic">Nebenrechnung:</div>
    <table style="border-collapse:collapse;font-size:13px;color:#333;min-width:280px">
      <tbody><tr>
      <td style="padding:2px 10px 2px 0;">Verkaufspreis netto</td>
      <td style="border-width: 0;padding:1px 0;text-align:right;font-family:courier;" colspan="2">4.000,00&nbsp;€</td>
    </tr><tr>
      <td style="border-width: 0;padding:1px 10px 1px 2px;color:#444;">+ Umsatzsteuer (${UST_REGEL} %)</td>
      <td style="border-width: 0;padding:1px 0;text-align:right;font-family:courier;color:#444;" colspan="2">+&nbsp;760,00&nbsp;€</td>
    </tr><tr style="border-top:1px solid #aaa;">
      <td style="border-width: 0;padding:2px 10px 2px 0;">Rechnungsbetrag</td>
      <td style="border-width: 0;padding:1px 0;text-align:right;font-family:courier;" colspan="2">4.760,00&nbsp;€</td>
    </tr></tbody>
    </table>

Am Ende einer erfolgreich gelösten Übung:
- Frage immer: „Möchtest du noch einen anderen Geschäftsfall üben? Dann geb ich dir einfach den nächsten!" Dann wähle wieder einen zufälligen aus, der noch nicht dran war.
Du wartest stets auf die Eingabe des Schülers und gibst nichts vor. Dein Ziel ist es, dass der Schüler die Buchung selbst findet und versteht.
`;

// ============================================================================
// KI-PROMPT AKTIONEN
// ============================================================================

function kopiereKiPrompt() {
  const promptText = erstelleKiPromptText();
  navigator.clipboard
    .writeText(promptText)
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
    .catch(() => alert("Kopieren nicht möglich. Bitte manuell aus dem Textfeld kopieren."));
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

// ============================================================================
// BELEG-URL + BUTTON
// ============================================================================

function erstelleBelegURL(gf) {
  const params = new URLSearchParams();
  const now = new Date();
  const tag   = String(now.getDate()).padStart(2, "0");
  const monat = String(now.getMonth() + 1).padStart(2, "0");
  const jahr  = String(now.getFullYear());
  const kv = document.getElementById("verkaufKunde")?.value?.trim() || "";

  params.set("beleg", "rechnung");
  if (kv) params.set("lieferer", kv);
  params.set("kunde", gf.abnehmerObj.name);

  params.set("artikel1", gf.artikelBelegName);
  params.set("menge1",   String(gf.menge || 1));
  params.set("einheit1", gf.einheit || "Stk");

  if (gf.menge && gf.stueckpreis) {
    params.set("einzelpreis1", String(gf.stueckpreis));
    if (gf.rabatt) params.set("rabatt", gf.rabattProzent);
  } else if (gf.rabatt) {
    params.set("einzelpreis1", parseNumericValueV(formatCurrencyV(gf.listennetto)));
    params.set("rabatt", gf.rabattProzent);
  } else {
    params.set("einzelpreis1", parseNumericValueV(formatCurrencyV(gf.nettoBetrag)));
  }

  params.set("umsatzsteuer", "19");
  params.set("tag",          tag);
  params.set("monat",        monat);
  params.set("jahr",         jahr);
  params.set("zahlungsziel", "30");
  params.set("skonto",       "2");
  params.set("skontofrist",  "20");

  return `belege.html?${params.toString()}`;
}

function erstelleBelegButtonV(nummer, gf) {
  const url = erstelleBelegURL(gf);
  return `<button class="geschaeftsfall-beleg-button"
    onclick="window.open('${url}', '_blank')"
    title="Ausgangsrechnung für Aufgabe ${nummer} erstellen"
    style="width:100%;padding:10px 12px;font-size:14px;margin-bottom:8px;">
    📄 ${nummer}. Ausgangsrechnung erstellen</button>`;
}

// ============================================================================
// HAUPTFUNKTION
// ============================================================================

function zeigeZufaelligeGeschaeftsfaelleV() {
  const anzahl = parseInt(document.getElementById("anzahlDropdownV").value);
  const container    = document.getElementById("Container");
  const buttonColumn = document.getElementById("button-columnV");
  if (!container || !buttonColumn) return;
  container.innerHTML    = "";
  buttonColumn.innerHTML = "";

  let aufgabenHTML  = "<h2>Aufgaben</h2><ol>";
  let loesungenHTML = '<h2 class="loesung">Lösung</h2>';
  const liste = [];
  for (let i = 0; i < anzahl; i++) liste.push(erstelleZufallsGeschaeftsfallV());

  // Aktuelle Liste für KI-Prompt merken
  letzteGenerierteGfListeV = liste;

  liste.forEach((gf, idx) => {
    const i = idx + 1;
    aufgabenHTML  += `<li>${gf.text}</li>`;
    loesungenHTML += `<div style="margin-top:1.5em"><strong>${i}.</strong><br>${erstelleBuchungssatzV(gf)}</div>`;
    const div = document.createElement("div");
    div.style.margin = "12px 0";
    div.innerHTML = erstelleBelegButtonV(i, gf);
    buttonColumn.appendChild(div);
  });

  aufgabenHTML += "</ol>";
  container.innerHTML = aufgabenHTML + loesungenHTML;
  const vorschau = document.getElementById("kiPromptVorschau");
if (vorschau && vorschau.style.display !== "none") {
  vorschau.textContent = erstelleKiPromptText();
}
}

// ============================================================================
// INITIALISIERUNG
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  const sel = document.getElementById("verkaufKunde");
  if (sel)
    sel.addEventListener("change", () => {
      kundeVerkauf = sel.value.trim() || "<i>[Modellunternehmen]</i>";
    });

  const vorschau = document.getElementById("kiPromptVorschau");
  if (vorschau) vorschau.textContent = erstelleKiPromptText();

  document.addEventListener(
    "yamlDataVerkaufLoaded",
    () => {
      fillCompanyDropdownV();
      autoSelectMyCompanyV();
      zeigeZufaelligeGeschaeftsfaelleV();
    },
    { once: true },
  );

  ladeYamlVerkauf();

  if (yamlDataVerkauf?.length) {
    fillCompanyDropdownV();
    autoSelectMyCompanyV();
    zeigeZufaelligeGeschaeftsfaelleV();
  }
});