// ============================================================================
// VORDRUCK – AUSGANGSRECHNUNG (BwR 7)
// ============================================================================

let vdYamlData = [];
let vdUnternehmen = "";

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
    localStorage.getItem("standardYamlData");
  if (saved) {
    try { vdYamlData = JSON.parse(saved); fuellDropdownVD(); return; }
    catch (e) { /* ignorieren */ }
  }
  fetch("js/unternehmen.yml")
    .then((r) => (r.ok ? r.text() : Promise.reject()))
    .then((txt) => { vdYamlData = jsyaml.load(txt) || []; fuellDropdownVD(); })
    .catch(() => {});
}

function fuellDropdownVD() {
  const sel = document.getElementById("vdKunde");
  if (!sel || !vdYamlData.length) return;
  const sorted = [...vdYamlData].sort((a, b) =>
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
  if (!vdYamlData.length || !name) return null;
  const e = vdYamlData.find((e) => e.unternehmen?.name === name);
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
  if (!vdYamlData.length) return { name: "Musterhandel GmbH", strasse: "", plz: "", ort: "" };
  const andere = vdYamlData.filter(
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


function erstelleVordruck(verkName, verkInfo, produkt, mitRabatt) {
  const kaeufer = getZufaelligenKaeuferVD(verkName);

  // Beträge
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
  const ust   = Math.round(nettoBetrag * 0.19);
  const brutto = nettoBetrag + ust;

  const mengePool   = [1, 2, 4, 5, 10].filter((m) => listennetto % m === 0);
  const menge       = pickVD(mengePool.length ? mengePool : [1]);
  const einzelpreis = listennetto / menge;

  const now  = new Date();
  const tag  = String(now.getDate()).padStart(2, "0");
  const mon  = String(now.getMonth() + 1).padStart(2, "0");
  const jahr = now.getFullYear();
  const reNr = 1000 + Math.floor(Math.random() * 8999);

  const absName    = verkInfo ? verkInfo.name : (verkName || "[Unternehmen]");
  const absAdresse = verkInfo ? `${verkInfo.strasse} · ${verkInfo.plz} ${verkInfo.ort}` : "";
  const absKontakt = verkInfo ? [verkInfo.telefon, verkInfo.email].filter(Boolean).join(" · ") : "";
  const absUst     = verkInfo?.ust_id ? `USt-IdNr.: ${verkInfo.ust_id}` : "";

  const varianten  = mitRabatt ? VARIANTEN_MIT_RABATT : VARIANTEN_OHNE_RABATT;
  const variante   = pickVD(varianten);
  const leerFelder = variante.felder;
  const rueckwaerts = variante.rueckwaerts;

  // Ob Cloze-Modus aktiv
  const clozeAktiv = document.getElementById("optClozeVD")?.checked ?? false;

  // Inline-Styles
  const S = {
    mono:       `font-family:'Courier New',monospace;`,
    leerFeld:   `display:inline-block;width:130px;height:22px;border-bottom:1.5px solid #999;background:#fafaf7;vertical-align:bottom;`,
    leerFett:   `display:inline-block;width:130px;height:22px;border-bottom:2px solid #444;background:#fafaf7;vertical-align:bottom;`,
    cloze:      `display:inline-block;font-family:'Courier New',monospace;font-size:10.5px;color:#1a5276;background:#eaf4fb;border:1px dashed #5dade2;border-radius:3px;padding:1px 5px;line-height:1.4;vertical-align:middle;word-break:break-all;`,
    summenBlock:`margin-top:10px;border-top:2px solid #c8c6be;padding-top:4px;display:flex;flex-direction:column;align-items:flex-end;`,
    summenZeile:`display:flex;justify-content:flex-end;width:360px;padding:5px 0;border-bottom:1px solid #eee;`,
    summenZeileLetzte:`display:flex;justify-content:flex-end;width:360px;padding:5px 0;`,
    summenZeileRb:`display:flex;justify-content:flex-end;width:360px;padding:8px 0 5px;border-top:2px solid #555;margin-top:2px;`,
    summenLabel:`flex:1;font-size:12px;color:#444;padding-right:10px;display:flex;align-items:center;`,
    summenLabelRb:`flex:1;font-size:13px;font-weight:700;color:#1a1a1a;padding-right:10px;display:flex;align-items:center;`,
    summenWert: `width:140px;text-align:right;font-family:'Courier New',monospace;font-size:13px;display:flex;align-items:center;justify-content:flex-end;`,
    em:         `font-size:11px;color:#888;font-style:normal;margin-left:3px;`,
  };

  // Zelle: entweder Leerfeld, Cloze-Syntax oder Betrag
  function zelle(feldname, wert, fett = false) {
    if (!leerFelder.has(feldname)) {
      return `<span style="${S.mono}">${fmtVD(wert)}</span>`;
    }
    if (clozeAktiv) {
      return `<span style="${S.cloze}" title="Moodle Cloze">${clozeInline(wert)}</span>`;
    }
    return `<span style="${fett ? S.leerFett : S.leerFeld}"></span>`;
  }

  const gesamtpreisZelle = leerFelder.has("gesamtpreis")
    ? (clozeAktiv
        ? `<td style="text-align:right"><span style="${S.cloze}" title="Moodle Cloze">${clozeInline(listennetto)}</span></td>`
        : `<td style="text-align:right"><span style="${S.leerFeld}"></span></td>`)
    : `<td style="text-align:right;${S.mono}">${fmtVD(listennetto)}</td>`;

  // Summenzeile-Helper
  function summenZeile(label, wertHTML, istRechnungsbetrag = false, istLetzte = false) {
    const zStyle = istRechnungsbetrag ? S.summenZeileRb : (istLetzte ? S.summenZeileLetzte : S.summenZeile);
    const lStyle = istRechnungsbetrag ? S.summenLabelRb : S.summenLabel;
    return `
      <div style="${zStyle}">
        <div style="${lStyle}">${label}</div>
        <div style="${S.summenWert}">${wertHTML}</div>
      </div>`;
  }

  // Summenblock
  let summen = `<div style="${S.summenBlock}">`;
  if (mitRabatt) {
    summen += summenZeile(`Nettobetrag (Listenpreis)`, zelle("nettobetrag", listennetto));
    summen += summenZeile(`Rabatt <span style="${S.em}">${rabattProzent}&nbsp;%</span>`, zelle("rabatt", rabattBetrag));
    summen += summenZeile(`Zielverkaufspreis`, zelle("ziel", nettoBetrag));
  } else {
    summen += summenZeile(`Nettobetrag`, zelle("nettobetrag", listennetto));
  }
  summen += summenZeile(`Umsatzsteuer <span style="${S.em}">19&nbsp;%</span>`, zelle("ust", ust));
  summen += summenZeile(`Rechnungsbetrag`, zelle("brutto", brutto, true), true);
  summen += `</div>`;

  // Lösung (ohne Cloze-Block – Syntax ist jetzt direkt im Vordruck)
  let loesungHTML = "<strong>Lösung:</strong><br>";

  if (rueckwaerts) {
    loesungHTML += `<em>Rückwärtsrechnung – Rechnungsbetrag ist gegeben:</em><br>`;
  }

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

  return `
<div style="background:#fff;border:1px solid #d0cfc8;border-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,0.07);padding:22px 26px;max-width:700px;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#1a1a1a;">

  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;gap:20px;">
    <div style="font-size:14px;color:#555;line-height:1.6;">
      <strong style="font-size:28px;color:#1a1a1a;display:block;margin-bottom:2px;">${absName}</strong>
      ${absAdresse ? absAdresse + "<br>" : ""}
      ${absKontakt ? absKontakt + "<br>" : ""}
      ${absUst}
    </div>
    <div style="text-align:right;">
      <h2 style="font-size:20px;font-weight:700;margin:0 0 4px;color:#1a1a1a;">Rechnung</h2>
      <div style="font-size:12px;color:#555;line-height:1.7;">
        Rechnungsnummer: ${reNr}<br>
        Datum: ${tag}.${mon}.${jahr}<br>
        Zahlungsziel: 30 Tage
      </div>
    </div>
  </div>

  <div style="border:1px solid #ddd;border-radius:3px;padding:7px 11px;margin-bottom:16px;font-size:12px;line-height:1.6;min-height:56px;">
    <div style="font-size:12px;color:#bbb;text-transform:uppercase;letter-spacing:0.4px;margin-bottom:2px;">Rechnungsempfänger</div>
    <strong>${kaeufer.name}</strong><br>
    ${kaeufer.strasse}<br>
    ${kaeufer.plz} ${kaeufer.ort}
  </div>

  <table style="width:100%;border-collapse:collapse;margin-bottom:0;">
    <thead>
      <tr>
        <th style="width:36px;background:#f0efe9;border-bottom:2px solid #c8c6be;padding:5px 9px;font-size:11px;font-weight:600;color:#444;white-space:nowrap;text-align:left;">Pos.</th>
        <th style="background:#f0efe9;border-bottom:2px solid #c8c6be;padding:5px 9px;font-size:11px;font-weight:600;color:#444;text-align:left;">Bezeichnung</th>
        <th style="width:56px;background:#f0efe9;border-bottom:2px solid #c8c6be;padding:5px 9px;font-size:11px;font-weight:600;color:#444;text-align:right;">Menge</th>
        <th style="width:130px;background:#f0efe9;border-bottom:2px solid #c8c6be;padding:5px 9px;font-size:11px;font-weight:600;color:#444;text-align:right;">Einzelpreis</th>
        <th style="width:130px;background:#f0efe9;border-bottom:2px solid #c8c6be;padding:5px 9px;font-size:11px;font-weight:600;color:#444;text-align:right;">Gesamtpreis</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding:9px;border-bottom:1px solid #eee;font-size:13px;">1</td>
        <td style="padding:9px;border-bottom:1px solid #eee;font-size:13px;">${produkt}</td>
        <td style="padding:9px;border-bottom:1px solid #eee;font-size:13px;text-align:right;">${menge}</td>
        <td style="padding:9px;border-bottom:1px solid #eee;font-size:13px;text-align:right;${S.mono}">${fmtVD(einzelpreis)}</td>
        ${gesamtpreisZelle}
      </tr>
    </tbody>
  </table>

  ${summen}

  <div style="display:flex;align-items:center;margin-top:20px;gap:6px;color:#aaa;font-size:16px;">
    <span>✂</span>
    <span style="flex:1;border-top:1.5px dashed #bbb;"></span>
  </div>
</div>

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

  ladeYamlVD();
  if (vdYamlData.length) setTimeout(erstelleVordrucke, 150);
});