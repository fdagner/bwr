// ============================================================================
// VORDRUCK – AUSGANGSRECHNUNG (BwR 7)
// ============================================================================

let yamlData = [];
let vdUnternehmen = "";

function getUserCompanies() {
  const stored = localStorage.getItem('userCompanies');
  return stored ? JSON.parse(stored) : [];
}

function mergeUserCompaniesIntoYamlData() {
  const userCompanies = getUserCompanies();
  
  if (userCompanies.length > 0) {
    yamlData = [...yamlData, ...userCompanies];
    
    yamlData.sort((a, b) => {
      const brancheA = a.unternehmen?.branche || '';
      const brancheB = b.unternehmen?.branche || '';
      return brancheA.localeCompare(brancheB);
    });
    
    console.log(`${userCompanies.length} Benutzerunternehmen zu yamlData hinzugefügt. Gesamt: ${yamlData.length}`);
  }
}

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================

const RABATT_SAETZE_VD = [5, 10, 15, 20];

function pickVD(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function fmtVD(value) {
  return value.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " €";
}

function moodleZahl(betrag) {
  return betrag.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Moodle SHORTANSWER-Cloze: akzeptiert "1.710,00 €" und "1.710,00"
function clozeFeld(label, betrag) {
  const mitEuro  = moodleZahl(betrag) + " €";
  const ohneEuro = moodleZahl(betrag);
  const cloze    = `{1:SHORTANSWER:=${mitEuro}~=${ohneEuro}}`;
  return label ? `${label} ${cloze}` : cloze;
}

// Inline-Cloze-Syntax mit € als Pflichtantwort, ohne € als Alternative
function clozeInline(betrag) {
  const mitEuro  = moodleZahl(betrag) + " €";
  const ohneEuro = moodleZahl(betrag);
  return `{1:SHORTANSWER:=${mitEuro}~=${ohneEuro}}`;
}

function genZielUndListenpreisVD(rabattProzent) {
  const listSchritt = { 5: 2000, 10: 1000, 15: 2000, 20: 1000 };
  const s = listSchritt[rabattProzent] || 1000;
  const minK = Math.ceil(2000 / s);
  const maxK = Math.floor(20000 / s);
  const liste = (minK + Math.floor(Math.random() * (maxK - minK + 1))) * s;
  const netto = Math.round(liste * (1 - rabattProzent / 100));
  return { listennetto: liste, nettoBetrag: netto };
}

function genNettoOhneRabattVD() {
  return (2 + Math.floor(Math.random() * 17)) * 1000;
}

// ============================================================================
// YAML
// ============================================================================

function ladeYamlVD() {
  const saved =
    localStorage.getItem("uploadedYamlCompanyData") ||
    localStorage.getItem("standardYamlData");  // ← Tippfehler korrigiert
  if (saved) {
    try {
      yamlData = JSON.parse(saved);             // ← yamlDataVerkauf → yamlData
      mergeUserCompaniesIntoYamlData();
      document.dispatchEvent(new Event("yamlDataLoaded"));
      return true;
    } catch (e) { /* ignorieren */ }
  }
  fetch("js/unternehmen.yml")
    .then((r) => (r.ok ? r.text() : Promise.reject()))
    .then((txt) => {
      yamlData = jsyaml.load(txt) || [];        // ← yamlDataVerkauf → yamlData
      mergeUserCompaniesIntoYamlData();
      document.dispatchEvent(new Event("yamlDataLoaded"));
    })
    .catch(() => {});
  return false;
}

function fuellDropdownVD() {
  const sel = document.getElementById("vdKunde");
  if (!sel || !yamlData.length) return;
  const sorted = [...yamlData].sort((a, b) =>
    (a.unternehmen?.branche || "").localeCompare(b.unternehmen?.branche || "") ||
    (a.unternehmen?.name || "").localeCompare(b.unternehmen?.name || "")
  );
  sel.innerHTML = "";
  const ph = document.createElement("option");
  ph.value = ""; ph.textContent = "— bitte Unternehmen auswählen —";
  ph.disabled = true; ph.selected = true;
  sel.appendChild(ph);
  sorted.forEach((c) => {
    const u = c.unternehmen;
    if (!u?.name) return;
    const o = document.createElement("option");
    o.value = u.name;
    o.textContent = u.branche
      ? `${u.branche} – ${u.name} ${u.rechtsform || ""}`.trim()
      : `${u.name} ${u.rechtsform || ""}`.trim();
    sel.appendChild(o);
  });
  const my = localStorage.getItem("myCompany");
  if (my) {
    const opt = Array.from(sel.options).find((o) => o.value === my);
    if (opt) { sel.value = my; vdUnternehmen = my; }
  }
}

function getUnternehmenInfoVD(name) {
  if (!yamlData.length || !name) return null;
  const e = yamlData.find((e) => e.unternehmen?.name === name);
  if (!e) return null;
  const u = e.unternehmen;
  return {
    name: `${u.name} ${u.rechtsform ?? ""}`.trim(),
    strasse: u.adresse?.strasse ?? "",
    plz: u.adresse?.plz ?? "",
    ort: u.adresse?.ort ?? "",
    telefon: u.kontakt?.telefon ?? "",
    email: u.kontakt?.email ?? "",
    ust_id: u.ust_id ?? "",
  };
}

function getZufaelligenKaeuferVD(verkaeufername) {
  if (!yamlData.length) return { name: "Musterhandel GmbH", strasse: "", plz: "", ort: "" };
  const andere = yamlData.filter(
    (e) => e.unternehmen?.name && e.unternehmen.name !== verkaeufername
  );
  if (!andere.length) return { name: "Musterhandel GmbH", strasse: "", plz: "", ort: "" };
  const u = pickVD(andere).unternehmen;
  return {
    name: `${u.name} ${u.rechtsform ?? ""}`.trim(),
    strasse: u.adresse?.strasse ?? "",
    plz: u.adresse?.plz ?? "",
    ort: u.adresse?.ort ?? "",
  };
}

// ============================================================================
// AUFGABEN-VARIANTEN
// ============================================================================

// Jede Variante ist ein Objekt { felder: Set, rueckwaerts: bool }
// rueckwaerts: true  → Rechnungsbetrag ist gegeben, oben wird gesucht
// rueckwaerts: false → klassisch von oben nach unten

const VARIANTEN_OHNE_RABATT = [
  // ── vorwärts ──────────────────────────────────────────────────
  { felder: new Set(["ust", "brutto"]),                          rueckwaerts: false },
  { felder: new Set(["nettobetrag", "ust", "brutto"]),           rueckwaerts: false },
  { felder: new Set(["gesamtpreis", "ust", "brutto"]),           rueckwaerts: false },
  { felder: new Set(["gesamtpreis", "nettobetrag", "ust", "brutto"]), rueckwaerts: false },
  // ── rückwärts (Rechnungsbetrag gegeben) ───────────────────────
  { felder: new Set(["nettobetrag", "ust"]),                     rueckwaerts: true  },
  { felder: new Set(["gesamtpreis", "nettobetrag", "ust"]),      rueckwaerts: true  },
];

const VARIANTEN_MIT_RABATT = [
  // ── vorwärts ──────────────────────────────────────────────────
  { felder: new Set(["rabatt", "ziel", "ust", "brutto"]),        rueckwaerts: false },
  { felder: new Set(["nettobetrag", "rabatt", "ziel", "ust", "brutto"]), rueckwaerts: false },
  { felder: new Set(["gesamtpreis", "nettobetrag", "rabatt", "ziel", "ust", "brutto"]), rueckwaerts: false },
  // ── rückwärts (Rechnungsbetrag gegeben) ───────────────────────
  { felder: new Set(["ziel", "ust"]),                            rueckwaerts: true  },
  { felder: new Set(["rabatt", "ziel", "ust"]),                  rueckwaerts: true  },
  { felder: new Set(["nettobetrag", "rabatt", "ziel", "ust"]),   rueckwaerts: true  },
];

// ============================================================================
// VORDRUCK ERSTELLEN
// ============================================================================


// ============================================================================
// VORDRUCK – AUSGANGSRECHNUNG (BwR 7)
// erstelleVordruck() komplett auf Tabellen-Layout umgestellt
// → Word-kompatibler Copy-Paste
// ============================================================================

function erstelleVordruck(verkName, verkInfo, produkt, mitRabatt) {
  const kaeufer = getZufaelligenKaeuferVD(verkName);

  // ── Beträge ──────────────────────────────────────────────────────────────
  const rabattProzent = mitRabatt ? pickVD(RABATT_SAETZE_VD) : 0;
  let listennetto, nettoBetrag;
  if (mitRabatt) {
    const b = genZielUndListenpreisVD(rabattProzent);
    listennetto = b.listennetto;
    nettoBetrag = b.nettoBetrag;
  } else {
    nettoBetrag = genNettoOhneRabattVD();
    listennetto = nettoBetrag;
  }
  const rabattBetrag = listennetto - nettoBetrag;
  const ust    = Math.round(nettoBetrag * 0.19);
  const brutto = nettoBetrag + ust;

  const mengePool   = [1, 2, 4, 5, 10].filter((m) => listennetto % m === 0);
  const menge       = pickVD(mengePool.length ? mengePool : [1]);
  const einzelpreis = listennetto / menge;

  const now  = new Date();
  const tag  = String(now.getDate()).padStart(2, "0");
  const mon  = String(now.getMonth() + 1).padStart(2, "0");
  const jahr = now.getFullYear();
  const reNr = 1000 + Math.floor(Math.random() * 8999);

  const absName    = verkInfo ? verkInfo.name    : (verkName || "[Unternehmen]");
  const absAdresse = verkInfo ? `${verkInfo.strasse}, ${verkInfo.plz} ${verkInfo.ort}` : "";
  const absKontakt = verkInfo ? [verkInfo.telefon, verkInfo.email].filter(Boolean).join(" · ") : "";
  const absUst     = verkInfo?.ust_id ? `USt-IdNr.: ${verkInfo.ust_id}` : "";

  const varianten   = mitRabatt ? VARIANTEN_MIT_RABATT : VARIANTEN_OHNE_RABATT;
  const variante    = pickVD(varianten);
  const leerFelder  = variante.felder;
  const rueckwaerts = variante.rueckwaerts;

  const clozeAktiv = document.getElementById("optClozeVD")?.checked ?? false;

  // ── Hilfsfunktionen ──────────────────────────────────────────────────────
  const mono     = `font-family:'Courier New',monospace;`;
  const leerFeld = `display:inline-block;width:130px;height:20px;border-bottom:1.5px solid #999;background:#fafaf7;vertical-align:bottom;`;
  const clozeSpan = `font-family:'Courier New',monospace;font-size:10.5px;color:#1a5276;background:#eaf4fb;border:1px dashed #5dade2;border-radius:3px;padding:1px 5px;`;

  function zelle(feldname, wert) {
    if (!leerFelder.has(feldname)) {
      return `<span style="font-size:13px;${mono}">${fmtVD(wert)}</span>`;
    }
    if (clozeAktiv) {
      return `<span style="${clozeSpan}">${clozeInline(wert)}</span>`;
    }
    return `<span style="${leerFeld}"></span>`;
  }

  const gesamtpreisZelle = leerFelder.has("gesamtpreis")
    ? (clozeAktiv
        ? `<td style="text-align:right;padding:8px 9px;border-bottom:1px solid #eee;${mono}"><span style="${clozeSpan}">${clozeInline(listennetto)}</span></td>`
        : `<td style="text-align:right;padding:8px 9px;border-bottom:1px solid #eee;"><span style="${leerFeld}"></span></td>`)
    : `<td style="text-align:right;padding:8px 9px;border-bottom:1px solid #eee;"><span style="font-size:13px;${mono}">${fmtVD(listennetto)}</span></td>`;

  // Summenzeile als <tr> – mit leerer Spalte links für Word-Rechtsausrichtung
  function sumZeile(label, wertHTML, opts = {}) {
    const { fett = false, doppelLinie = false, letzte = false } = opts;
    const bTop       = doppelLinie ? "border-top:2px solid #555;" : "border-top:1px solid #eee;";
    const bBot       = letzte ? "" : "border-bottom:1px solid #eee;";
    const tdBase     = "padding:5px 9px;font-size:12px;" + bTop + bBot;
    const labelStyle = fett ? "font-weight:700;font-size:13px;" : "color:#444;";
    const spanLabel = "font-size:12px;" + labelStyle + "white-space:nowrap;";
    const spanWert  = "font-size:13px;" + mono + "white-space:nowrap;";
    return (
      "<tr>" +
        "<td style=\"" + bTop + bBot + "\"></td>" +
        "<td style=\"" + tdBase + "width:180px;\"><span style=\"" + spanLabel + "\">" + label + "</span></td>" +
        "<td style=\"" + tdBase + "text-align:right;width:150px;\"><span style=\"" + spanWert + "\">" + wertHTML + "</span></td>" +
      "</tr>"
    );
  }

  // ── Summenblock ──────────────────────────────────────────────────────────
  let summenRows = "";
  if (mitRabatt) {
    summenRows += sumZeile("Nettobetrag (Listenpreis)",                            zelle("nettobetrag", listennetto));
    summenRows += sumZeile(`Rabatt <span style="font-size:11px;color:#888;">${rabattProzent}&nbsp;%</span>`, zelle("rabatt", rabattBetrag));
    summenRows += sumZeile("Zielverkaufspreis",                                    zelle("ziel", nettoBetrag));
  } else {
    summenRows += sumZeile("Nettobetrag",                                          zelle("nettobetrag", listennetto));
  }
  summenRows += sumZeile(`Umsatzsteuer <span style="font-size:11px;color:#888;">19&nbsp;%</span>`, zelle("ust", ust));
  summenRows += sumZeile("Rechnungsbetrag",                                        zelle("brutto", brutto), { fett: true, doppelLinie: true, letzte: true });

  // ── Lösungsblock ─────────────────────────────────────────────────────────
  let loesungHTML = "<strong>Lösung:</strong><br>";
  if (rueckwaerts) loesungHTML += `<em>Rückwärtsrechnung – Rechnungsbetrag ist gegeben:</em><br>`;

  if (leerFelder.has("gesamtpreis")) loesungHTML += `Menge ${menge} × Einzelpreis ${fmtVD(einzelpreis)} = <strong>Gesamtpreis ${fmtVD(listennetto)}</strong><br>`;

  if (mitRabatt) {
    if (leerFelder.has("nettobetrag")) loesungHTML += `Nettobetrag (Listenpreis) = Gesamtpreis = <strong>${fmtVD(listennetto)}</strong><br>`;
    if (leerFelder.has("rabatt")) {
      if (rueckwaerts)
        loesungHTML += `Rabatt: Zielverkaufspreis ÷ (1 − ${rabattProzent}/100) × ${rabattProzent}/100 = <strong>${fmtVD(rabattBetrag)}</strong><br>`;
      else
        loesungHTML += `Rabatt: ${fmtVD(listennetto)} × ${rabattProzent}&nbsp;% = <strong>${fmtVD(rabattBetrag)}</strong><br>`;
    }
    if (leerFelder.has("ziel")) {
      if (rueckwaerts)
        loesungHTML += `Zielverkaufspreis: ${fmtVD(brutto)} ÷ 1,19 = <strong>${fmtVD(nettoBetrag)}</strong><br>`;
      else
        loesungHTML += `Zielverkaufspreis: ${fmtVD(listennetto)} − ${fmtVD(rabattBetrag)} = <strong>${fmtVD(nettoBetrag)}</strong><br>`;
    }
    if (leerFelder.has("ust")) {
      if (rueckwaerts)
        loesungHTML += `Umsatzsteuer: ${fmtVD(brutto)} − ${fmtVD(nettoBetrag)} = <strong>${fmtVD(ust)}</strong><br>`;
      else
        loesungHTML += `Umsatzsteuer: ${fmtVD(nettoBetrag)} × 19&nbsp;% = <strong>${fmtVD(ust)}</strong><br>`;
    }
    if (leerFelder.has("brutto")) loesungHTML += `Rechnungsbetrag: ${fmtVD(nettoBetrag)} + ${fmtVD(ust)} = <strong>${fmtVD(brutto)}</strong>`;
  } else {
    if (leerFelder.has("nettobetrag")) {
      if (rueckwaerts)
        loesungHTML += `Nettobetrag: ${fmtVD(brutto)} ÷ 1,19 = <strong>${fmtVD(listennetto)}</strong><br>`;
      else
        loesungHTML += `Nettobetrag = Gesamtpreis = <strong>${fmtVD(listennetto)}</strong><br>`;
    }
    if (leerFelder.has("ust")) {
      if (rueckwaerts)
        loesungHTML += `Umsatzsteuer: ${fmtVD(brutto)} − ${fmtVD(listennetto)} = <strong>${fmtVD(ust)}</strong><br>`;
      else
        loesungHTML += `Umsatzsteuer: ${fmtVD(listennetto)} × 19&nbsp;% = <strong>${fmtVD(ust)}</strong><br>`;
    }
    if (leerFelder.has("brutto")) loesungHTML += `Rechnungsbetrag: ${fmtVD(nettoBetrag)} + ${fmtVD(ust)} = <strong>${fmtVD(brutto)}</strong>`;
  }

  // ── Haupt-HTML (komplett tabellenbasiert) ─────────────────────────────────
  return `
<div style="background:#fff;border:1px solid #d0cfc8;border-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,0.07);padding:22px 26px;max-width:700px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1a1a1a;">

  <!-- ① Kopfzeile: Absender links | Rechnungstitel rechts -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
    <tr>
      <td style="vertical-align:top;">
        <span style="font-size:24px;color:#1a1a1a;display:block;margin-bottom:4px;font-weight: bold">${absName}</span><br>
        <span style="font-size:13px;color:#555;line-height:1.7;">
          ${absAdresse ? absAdresse + "<br>" : ""}
          ${absKontakt ? absKontakt + "<br>" : ""}
          ${absUst}
        </span>
      </td>
      <td style="vertical-align:top;text-align:right;white-space:nowrap;">
        <span style="font-size:20px;display:block;margin-bottom:4px;font-weight: bold">Rechnung</span><br>
        <span style="font-size:12px;color:#555;line-height:1.7;">
          Rechnungsnummer: ${reNr}<br>
          Datum: ${tag}.${mon}.${jahr}<br>
          Zahlungsziel: 30 Tage
        </span>
      </td>
    </tr>
  </table>

  <!-- ② Empfängerblock -->
  <table width="100%" cellpadding="0" cellspacing="0"
    style="border:1px solid #ddd;border-radius:3px;margin-bottom:16px;">
    <tr>
      <td style="padding:7px 11px;">
        <span style="font-size:11px;color:#bbb;text-transform:uppercase;letter-spacing:0.4px;display:block;margin-bottom:2px;">Rechnungsempfänger</span>
        <span style="font-size:12px;line-height:1.6;display:block;"><strong>${kaeufer.name}</strong><br>
        ${kaeufer.strasse}<br>
        ${kaeufer.plz} ${kaeufer.ort}</span>
      </td>
    </tr>
  </table>

  <!-- ③ Positionstabelle -->
  <table width="100%" cellpadding="0" cellspacing="0"
    style="border-collapse:collapse;margin-bottom:0;">
    <thead>
      <tr style="background:#f0efe9;border-bottom:2px solid #c8c6be;">
        <th style="width:36px;padding:5px 9px;text-align:left;"><span style="font-size:11px;font-weight:600;color:#444;">Pos.</span></th>
        <th style="padding:5px 9px;text-align:left;"><span style="font-size:11px;font-weight:600;color:#444;">Bezeichnung</span></th>
        <th style="width:56px;padding:5px 9px;text-align:right;"><span style="font-size:11px;font-weight:600;color:#444;">Menge</span></th>
        <th style="width:130px;padding:5px 9px;text-align:right;"><span style="font-size:11px;font-weight:600;color:#444;">Einzelpreis</span></th>
        <th style="width:130px;padding:5px 9px;text-align:right;"><span style="font-size:11px;font-weight:600;color:#444;">Gesamtpreis</span></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:8px 9px;border-bottom:1px solid #eee;"><span style="font-size:13px;">1</span></td>
        <td style="padding:8px 9px;border-bottom:1px solid #eee;"><span style="font-size:13px;">${produkt}</span></td>
        <td style="padding:8px 9px;border-bottom:1px solid #eee;text-align:right;"><span style="font-size:13px;">${menge}</span></td>
        <td style="padding:8px 9px;border-bottom:1px solid #eee;text-align:right;"><span style="font-size:13px;${mono}">${fmtVD(einzelpreis)}</span></td>
        ${gesamtpreisZelle}
      </tr>
    </tbody>
  </table>

  <!-- ④ Summenblock – rechtsbündig via voller Breite + leere linke Spalte -->
  <table width="100%" cellpadding="0" cellspacing="0"
    style="margin-top:10px;border-top:2px solid #c8c6be;">
    ${summenRows}
  </table>

  <!-- ⑤ Trennlinie -->
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
    <tr>
      <td style="font-size:16px;color:#aaa;width:18px;">✂</td>
      <td style="border-top:1.5px dashed #bbb;"></td>
    </tr>
  </table>

</div>

<!-- ⑥ Lösungsblock -->
<div style="max-width:700px;margin-top:10px;">
  <div style="background:#f8f7f4;border:1px solid #ddd;border-radius:4px;padding:10px 14px;font-size:13px;line-height:1.9;color:#333;">
    ${loesungHTML}
  </div>
</div>`;
}

// Wird beim Umschalten der Checkbox aufgerufen – Vordruck neu rendern
function aktualisiereClozeAnzeige() {
  erstelleVordrucke();
}


// ============================================================================
// HAUPTFUNKTION
// ============================================================================

function erstelleVordrucke() {
  const verkName  = document.getElementById("vdKunde")?.value?.trim() || "";
  const produkt   = document.getElementById("vdProdukt")?.value?.trim() || "Fertigerzeugnisse";
  const mitRabatt = document.getElementById("optMitRabattVD")?.checked ?? false;
  const verkInfo  = getUnternehmenInfoVD(verkName);
  document.getElementById("vordruck-ausgabe").innerHTML =
    erstelleVordruck(verkName, verkInfo, produkt, mitRabatt);
}

// ============================================================================
// KI-ASSISTENT PROMPT
// ============================================================================

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Buchführungs-Assistent für Schüler der Realschule (BwR). Du hilfst beim Ausfüllen von Ausgangsrechnungen für Fertigerzeugnisse in Jahrgangsstufe 7.

Aufgabe:
- Gib KEINE fertigen Beträge vor.
- Führe die Schüler durch gezielte Fragen und Hinweise zur richtigen Lösung.
- Ziel: Lernförderung, nicht das Abnehmen der Denkarbeit.

Pädagogischer Ansatz:
- Frage zuerst: „Was ist auf der Rechnung schon gegeben?"
- Frage dann je nach Aufgabe:
  - „Wie berechnet man den Gesamtpreis aus Menge und Einzelpreis?"
  - „Wie berechnet man den Rabattbetrag?"
  - „Was ist der Zielverkaufspreis?"
  - „Auf welchen Betrag wird die Umsatzsteuer berechnet?"
  - „Wie ergibt sich der Rechnungsbetrag?"
- Beantworte deine Rückfragen nicht selbst. Bei Fehlern: erkläre das Prinzip.

Berechnungsschritte auf der Rechnung:

Ohne Rabatt:
  Menge × Einzelpreis = Gesamtpreis (= Nettobetrag)
  + Umsatzsteuer 19 %
  = Rechnungsbetrag

Mit Rabatt:
  Menge × Einzelpreis = Gesamtpreis (= Nettobetrag / Listenpreis)
  − Rabatt x %
  = Zielverkaufspreis
  + Umsatzsteuer 19 % (auf den Zielverkaufspreis!)
  = Rechnungsbetrag

Wichtige Hinweise:
- Die Umsatzsteuer wird IMMER auf den Zielverkaufspreis berechnet, nicht auf den Listenpreis.
- Rabattbetrag = Nettobetrag × Rabattsatz / 100
- Rechnungsbetrag = Zielverkaufspreis + Umsatzsteuer

Häufige Schülerfehler:
- USt auf den Listenpreis statt Zielverkaufspreis berechnen
- Menge × Einzelpreis vergessen (Gesamtpreis ≠ Einzelpreis)
- Rechnungsbetrag mit Nettobetrag verwechseln

Tonalität: freundlich, kurz (1–2 Sätze), gelegentlich Emojis 🧾✅❓
Nenne den richtigen Betrag erst, wenn der Schüler selbst darauf gekommen ist.
Am Ende fragst du, ob eine weitere Übung gewünscht ist.
`;

function kopiereKiPromptVD() {
  navigator.clipboard.writeText(KI_ASSISTENT_PROMPT).then(() => {
    const btn = document.getElementById("kiPromptKopierenBtnVD");
    const orig = btn.innerHTML;
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Kopiert!`;
    btn.classList.add("ki-prompt-btn--success");
    setTimeout(() => { btn.innerHTML = orig; btn.classList.remove("ki-prompt-btn--success"); }, 2500);
  }).catch(() => alert("Kopieren nicht möglich."));
}

function togglekiPromptVorschau() {
  const vorschau = document.getElementById("kiPromptVorschau");
  const btn = document.getElementById("kiPromptToggleBtn");
  const hidden = getComputedStyle(vorschau).display === "none";
  vorschau.style.display = hidden ? "block" : "none";
  btn.textContent = hidden ? "Vorschau ausblenden ▲" : "Prompt anzeigen ▼";
}

// ============================================================================
// INITIALISIERUNG
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  const sel = document.getElementById("vdKunde");
  if (sel) sel.addEventListener("change", () => { vdUnternehmen = sel.value; });

  const vorschau = document.getElementById("kiPromptVorschau");
  if (vorschau) vorschau.textContent = KI_ASSISTENT_PROMPT;

  document.addEventListener("yamlDataLoaded", () => {    // ← NEU
    fuellDropdownVD();
    setTimeout(erstelleVordrucke, 150);
  }, { once: true });

  ladeYamlVD();

  // Fallback falls YAML bereits synchron geladen
  if (yamlData.length) {
    fuellDropdownVD();
    setTimeout(erstelleVordrucke, 150);
  }
});