// ============================================================================
// VORDRUCK – AUSGANGSRECHNUNG (BwR 7)
// ============================================================================

let vdYamlData = [];
let vdUnternehmen = "";

// ============================================================================
// BETRÄGE
// ============================================================================

const RABATT_SAETZE_VD = [5, 10, 15, 20];

function pickVD(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function fmtVD(value) {
  return value.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " €";
}

function genZielUndListenpreisVD(rabattProzent) {
  // Listenpreis-Schrittweite so gewählt, dass Rabattbetrag immer ganzzahlig:
  //   5% / 15% → 2000er-Schritte
  //   10% / 20% → 1000er-Schritte
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
    try {
      vdYamlData = JSON.parse(saved);
      fuellDropdownVD();
      return;
    } catch (e) { /* ignorieren */ }
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
  // myCompany automatisch wählen
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
    steuernummer: u.steuernummer ?? "",
    iban: u.iban ?? "",
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
// VORDRUCK HTML ERSTELLEN
// ============================================================================

function erstelleVordruck(nr, verkName, verkInfo, produkt, mitRabatt) {
  const kaeufer = getZufaelligenKaeuferVD(verkName);

  // ── Beträge ────────────────────────────────────────────────────
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
  const ust = Math.round(nettoBetrag * 0.19);
  const brutto = nettoBetrag + ust;

  // Menge: Teiler von listennetto aus sinnvollem Pool
  const mengePool = [1, 2, 4, 5, 10].filter((m) => listennetto % m === 0);
  const menge = pickVD(mengePool.length ? mengePool : [1]);
  const einzelpreis = listennetto / menge;

  // ── Datum + Rechnungsnummer ────────────────────────────────────
  const now = new Date();
  const tag = String(now.getDate()).padStart(2, "0");
  const mon = String(now.getMonth() + 1).padStart(2, "0");
  const jahr = now.getFullYear();
  const reNr = 1000 + Math.floor(Math.random() * 8999);

  // ── Absender-Info ──────────────────────────────────────────────
  const absName = verkInfo ? verkInfo.name : (verkName || "[Unternehmen]");
  const absAdresse = verkInfo ? `${verkInfo.strasse} · ${verkInfo.plz} ${verkInfo.ort}` : "";
  const absKontakt = verkInfo
    ? [verkInfo.telefon, verkInfo.email].filter(Boolean).join(" · ")
    : "";
  const absUst = verkInfo?.ust_id ? `USt-IdNr.: ${verkInfo.ust_id}` : "";

  // ── Summenblock ────────────────────────────────────────────────
  let summen = `<div class="summen-block">`;

  if (mitRabatt) {
    // Nettobetrag (Listenpreis) → vorgegeben
    summen += `
      <div class="summen-zeile">
        <div class="summen-label">Nettobetrag (Listenpreis)</div>
        <div class="summen-wert">${fmtVD(listennetto)}</div>
      </div>
      <div class="summen-zeile">
        <div class="summen-label">Rabatt <em>${rabattProzent}&nbsp;%</em></div>
        <div class="summen-wert"><span class="leer-feld"></span></div>
      </div>
      <div class="summen-zeile">
        <div class="summen-label">Zielverkaufspreis</div>
        <div class="summen-wert"><span class="leer-feld"></span></div>
      </div>`;
  } else {
    summen += `
      <div class="summen-zeile">
        <div class="summen-label">Nettobetrag</div>
        <div class="summen-wert">${fmtVD(listennetto)}</div>
      </div>`;
  }

  summen += `
      <div class="summen-zeile">
        <div class="summen-label">Umsatzsteuer <em>19&nbsp;%</em></div>
        <div class="summen-wert"><span class="leer-feld"></span></div>
      </div>
      <div class="summen-zeile rechnungsbetrag">
        <div class="summen-label">Rechnungsbetrag</div>
        <div class="summen-wert"><span class="leer-feld"></span></div>
      </div>
    </div>`;

  // ── vollständiger Vordruck ─────────────────────────────────────
  return `
<div class="vordruck-seite">
  <div class="vordruck-aufgaben-nr">Aufgabe ${nr}</div>

  <div class="vordruck-kopf">
    <div class="vordruck-absender">
      <strong>${absName}</strong>
      ${absAdresse ? absAdresse + "<br>" : ""}
      ${absKontakt ? absKontakt + "<br>" : ""}
      ${absUst}
    </div>
    <div class="vordruck-rechts">
      <h2>Ausgangsrechnung</h2>
      <div class="vordruck-meta">
        Rechnungsnummer: ${reNr}<br>
        Datum: ${tag}.${mon}.${jahr}<br>
        Zahlungsziel: 30 Tage
      </div>
    </div>
  </div>

  <div class="vordruck-empfaenger">
    <div class="vordruck-empfaenger-label">Rechnungsempfänger</div>
    <strong>${kaeufer.name}</strong><br>
    ${kaeufer.strasse}<br>
    ${kaeufer.plz} ${kaeufer.ort}
  </div>

  <table class="pos-tabelle">
    <thead>
      <tr>
        <th style="width:36px">Pos.</th>
        <th>Bezeichnung</th>
        <th class="r" style="width:56px">Menge</th>
        <th class="r" style="width:120px">Einzelpreis</th>
        <th class="r" style="width:120px">Gesamtpreis</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>${produkt}</td>
        <td class="r">${menge}</td>
        <td class="r mono">${fmtVD(einzelpreis)}</td>
        <td class="r mono">${fmtVD(listennetto)}</td>
      </tr>
    </tbody>
  </table>

  ${summen}
</div>`;
}

// ============================================================================
// HAUPTFUNKTION
// ============================================================================

function erstelleVordrucke() {
  const verkName = document.getElementById("vdKunde")?.value?.trim() || "";
  const produkt  = document.getElementById("vdProdukt")?.value?.trim() || "Fertigerzeugnisse";
  const anzahl   = parseInt(document.getElementById("anzahlDropdownVD")?.value) || 3;
  const mitRabatt = document.getElementById("optMitRabattVD")?.checked ?? false;

  const verkInfo = getUnternehmenInfoVD(verkName);

  let html = "";
  for (let i = 1; i <= anzahl; i++) {
    html += erstelleVordruck(i, verkName, verkInfo, produkt, mitRabatt);
  }

  document.getElementById("vordruck-ausgabe").innerHTML = html;
}

// ============================================================================
// KI-ASSISTENT PROMPT
// ============================================================================

const KI_ASSISTENT_PROMPT_VD = `
Du bist ein freundlicher Buchführungs-Assistent für Schüler der Realschule (BwR). Du hilfst beim Ausfüllen von Ausgangsrechnungen für Fertigerzeugnisse in Jahrgangsstufe 7.

Aufgabe:
- Gib KEINE fertigen Beträge vor.
- Führe die Schüler durch gezielte Fragen und Hinweise zur richtigen Lösung.
- Ziel: Lernförderung, nicht das Abnehmen der Denkarbeit.

Pädagogischer Ansatz:
- Frage zuerst: „Was ist auf der Rechnung schon gegeben?"
- Frage dann: „Wie berechnet man den Rabattbetrag?"
- Frage: „Was ist der Zielverkaufspreis?"
- Frage: „Wie berechnet man die Umsatzsteuer?"
- Frage: „Wie ergibt sich der Rechnungsbetrag?"
- Beantworte deine Rückfragen nicht selbst. Bei Fehlern: erkläre das Prinzip.

Berechnungsschritte auf der Ausgangsrechnung:

Ohne Rabatt:
  Nettobetrag (= Gesamtpreis aus Tabelle)
  + Umsatzsteuer 19 %
  = Rechnungsbetrag

Mit Rabatt:
  Nettobetrag (Listenpreis, aus Tabelle)
  − Rabatt x %
  = Zielverkaufspreis
  + Umsatzsteuer 19 % (auf Zielverkaufspreis!)
  = Rechnungsbetrag

Wichtige Hinweise:
- Die Umsatzsteuer wird immer auf den Zielverkaufspreis (nach Rabatt) berechnet, nicht auf den Listenpreis.
- Der Rabattbetrag = Nettobetrag × Rabattsatz / 100
- Rechnungsbetrag = Zielverkaufspreis + Umsatzsteuer

Häufige Schülerfehler:
- USt auf den Listenpreis statt auf den Zielverkaufspreis berechnen
- Rabatt vergessen
- Rechnungsbetrag mit Nettobetrag verwechseln

Tonalität: freundlich, kurz (1–2 Sätze), gelegentlich Emojis 🧾✅❓
Nenne den richtigen Betrag erst, wenn der Schüler selbst darauf gekommen ist.
Am Ende fragst du, ob eine weitere Übung gewünscht ist.
`;

function kopiereKiPromptVD() {
  navigator.clipboard
    .writeText(KI_ASSISTENT_PROMPT_VD)
    .then(() => {
      const btn = document.getElementById("kiPromptKopierenBtnVD");
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

function toggleKiPromptVorschauVD() {
  const vorschau = document.getElementById("kiPromptVorschauVD");
  const btn = document.getElementById("kiPromptToggleBtnVD");
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
  const sel = document.getElementById("vdKunde");
  if (sel) sel.addEventListener("change", () => { vdUnternehmen = sel.value; });

  const vorschau = document.getElementById("kiPromptVorschauVD");
  if (vorschau) vorschau.textContent = KI_ASSISTENT_PROMPT_VD;

  ladeYamlVD();

  // Nach YAML: Dropdown füllen, dann direkt Vordrucke generieren
  document.addEventListener("yamlDataVDLoaded", () => {
    fuellDropdownVD();
    setTimeout(erstelleVordrucke, 150);
  }, { once: true });

  if (vdYamlData.length) setTimeout(erstelleVordrucke, 150);
});