// ============================================================================
// LB9-2 INVESTITIONSRECHNUNG
// ============================================================================
// Aufgabentypen (Dropdown):
//   1. ersatzmaschine – Ersatzbeschaffung einer Maschine: Amortisationszeit
//      berechnen (Angebotsvergleich zweier Maschinenlieferer aus der YAML)
//   2. datenblatt     – Datenblatt mit Kostenvergleichs- und
//      Amortisationsrechnung (Portierung aus investitionsrechnung.html)
//   3. angebotsvergleich – Angebotsvergleich zweier Maschinen im Tabellenformat
//      (Kostenvergleichsrechnung + zwei weitere Kaufkriterien + Buchungssatz
//      für den Rechnungseingang beim Kauf – Aufgabenstil 4.4.x)
//
// Die Unternehmensdaten (inkl. Inhaber) kommen aus der über js/company-loader.js
// geladenen YAML. Lieferer werden aus der Branche "Maschinen" gewählt.
// ============================================================================

let kunde = '<i>[Modellunternehmen]</i>';
let letzteAufgabe = null;   // aktueller Aufgabendatensatz (für Beleg-Buttons)
let letzteArt = 'ersatzmaschine'; // zuletzt generierter Aufgabentyp

// ============================================================================
// KONSTANTEN
// ============================================================================

// Kleine Liste möglicher Maschinen (beim Vergleich immer die selbe Art).
//   n = Bezeichnung, plural = Bezeichnung im Mehrzahl, g = Genus für Artikel
const MASCHINEN_ARTEN = [
  { n: 'CNC-Fräsmaschine',        plural: 'CNC-Fräsmaschinen',        g: 'f' },
  { n: 'CNC-Drehmaschine',        plural: 'CNC-Drehmaschinen',        g: 'f' },
  { n: 'CNC-Schleifmaschine',     plural: 'CNC-Schleifmaschinen',     g: 'f' },
  { n: 'CNC-Laserschneidanlage',  plural: 'CNC-Laserschneidanlagen',  g: 'f' },
  { n: 'CNC-Bearbeitungszentrum', plural: 'CNC-Bearbeitungszentren',  g: 'n' },
  { n: 'CNC-Bohrwerk',            plural: 'CNC-Bohrwerke',            g: 'n' },
];

// Fiktive Modellbezeichnungen der beiden Anbieter
const MASCHINEN_MODELLE = [
  'EXAKT 4000', 'Sayo-Nara', 'TopCut 800', 'PowerMill V2',
  'Stark 900', 'NovaCut 300', 'Futura 5', 'Precision 1200',
];

// Mögliche Zusatzinformationen der Lieferer
function liefererInfos(lieferer) {
  const pool = [
    'Kostenloser Wartungsservice',
    'Kostenloser Ersatzteilservice',
    'Schulung der Bediener inklusive',
    'Wartungsvertrag für 3 Jahre inklusive',
    'Lieferzeit: ' + randInt(4, 12) + ' Wochen',
    'Händlernetz in ganz Deutschland',
  ];
  // Mischen und 1–2 eindeutige Zusatzinfos entnehmen
  const gemischt = pool.sort(() => Math.random() - 0.5);
  const anzahl = 1 + (Math.random() < 0.5 ? 1 : 0);
  const infos = gemischt.slice(0, anzahl);
  // Sitz des Lieferers immer als erste Information (aus der YAML-Adresse)
  return ['Name des Lieferers: ' + (lieferer.name || '–'),
          'Sitz des Lieferers: ' + (lieferer.adresse?.ort || 'Deutschland')].concat(infos);
}

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================

function randInt(min, max, step = 1) {
  const steps = Math.floor((max - min) / step);
  return min + Math.floor(Math.random() * (steps + 1)) * step;
}

// Zufallszahl zwischen min und max, gerundet auf Vielfache von `auf`
function randTo(auf, min, max) {
  return Math.round(randInt(min, max) / auf) * auf;
}

function euro(n) {
  return Number(n).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function menge(n) {
  // Produktionsmengen werden mit Leerzeichen als Tausendertrenner geschrieben
  // (z. B. „90 000 Stück" statt „90.000 Stück")
  return Number(n).toLocaleString('de-DE').replace(/\./g, ' ');
}

function zahl(n) {
  return Number(n).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Bruch-Darstellung (Zähler über Nenner) für Lösungen
function bruch(zaehler, nenner) {
  return `<span style="display:inline-block; text-align:center; vertical-align:middle;">
    <span style="display:block; border-bottom:1px solid #000; padding:0 8px;">${zaehler}</span>
    <span style="display:block; padding:0 8px;">${nenner}</span>
  </span>`;
}

// "360.000,00" (ohne €) – für Rechenwege in Lösungen
function betragOhneEuro(n) {
  return euro(n).replace(/\s*€\s*$/, '');
}

// Unternehmen per Name aus der YAML holen
function getUnternehmen(name) {
  const found = (typeof getCompanyByName === 'function')
    ? getCompanyByName(name)
    : (yamlData || []).find(c => c?.unternehmen?.name === name);
  return found?.unternehmen || null;
}

// Alle Lieferer der Branche "Maschinen" aus der YAML
function getMaschinenLieferer() {
  return (yamlData || []).filter(c =>
    c?.unternehmen?.name && String(c.unternehmen.branche || '').trim() === 'Maschinen');
}

// ============================================================================
// YML-DROPDOWN BEFÜLLEN
// ============================================================================

function fillCompanyDropdowns() {
  if (!yamlData || yamlData.length === 0) return;

  const sortedCompanies = [...yamlData].sort((a, b) => {
    const brancheA = a.unternehmen?.branche || '';
    const brancheB = b.unternehmen?.branche || '';
    if (brancheA !== brancheB) return brancheA.localeCompare(brancheB);
    return (a.unternehmen?.name || '').localeCompare(b.unternehmen?.name || '');
  });

  const kundeSelect = document.getElementById('irKunde');
  if (!kundeSelect) return;

  kundeSelect.innerHTML = '';
  const opt = document.createElement('option');
  opt.value = '';
  opt.text = '— bitte Unternehmen auswählen —';
  opt.disabled = true;
  opt.selected = true;
  kundeSelect.appendChild(opt);

  sortedCompanies.forEach(company => {
    const u = company.unternehmen;
    if (!u?.name) return;
    const displayText = u.branche
      ? `${u.branche} – ${u.name} ${u.rechtsform || ''}`.trim()
      : `${u.name} ${u.rechtsform || ''}`.trim();
    const option = document.createElement('option');
    option.value = u.name;
    option.textContent = displayText;
    option.dataset.id = u.id || '';
    option.dataset.rechtsform = u.rechtsform || '';
    option.dataset.branche = u.branche || '';
    kundeSelect.appendChild(option);
  });
}

function autoSelectMyCompany() {
  const kundeSelect = document.getElementById('irKunde');
  if (!kundeSelect) return;

  // Gespeichertes Modellunternehmen (localStorage) wählen
  const myCompanyName = localStorage.getItem('myCompany');
  if (myCompanyName && [...kundeSelect.options].some(o => o.value === myCompanyName)) {
    kundeSelect.value = myCompanyName;
  } else {
    // Fallback: erstes Modellunternehmen der YAML
    const modell = (yamlData || []).find(c => c?.unternehmen?.branche?.trim() === 'Modellunternehmen');
    if (modell && [...kundeSelect.options].some(o => o.value === modell.unternehmen.name)) {
      kundeSelect.value = modell.unternehmen.name;
    }
  }
  kunde = kundeSelect.value.trim() || '<i>[Modellunternehmen]</i>';
}

// ============================================================================
// EXPORT-DATEINAMEN
// ============================================================================

window.exportDateiname = function (format) {
  return 'investitionsrechnung.' + format;
};

// ============================================================================
// AUFGABENTYP 1: ERSATZ EINER MASCHINE (AMORTISATIONSZEIT)
// ============================================================================

function generiereErsatzmaschine() {
  // ── Unternehmen + Inhaber aus der YAML ──────────────────────────────────
  const kundeSelect = document.getElementById('irKunde');
  const kundenName = kundeSelect && kundeSelect.value ? kundeSelect.value.trim() : '';
  const u = getUnternehmen(kundenName);
  const inhaber = (u && u.inhaber) ? u.inhaber : '<i>[Inhaber]</i>';
  const unternehmensName = (u && u.name) ? u.name : '<i>[Modellunternehmen]</i>';

  // ── Maschine + Lieferer ──────────────────────────────────────────────────
  const art = MASCHINEN_ARTEN[Math.floor(Math.random() * MASCHINEN_ARTEN.length)];
  const lieferer = getMaschinenLieferer().sort(() => Math.random() - 0.5);
  const maschinenLiefererPool = lieferer.map(c => c.unternehmen);
  let l1, l2;
  if (maschinenLiefererPool.length >= 2) {
    const idx = Math.floor(Math.random() * maschinenLiefererPool.length);
    l1 = maschinenLiefererPool[idx];
    l2 = maschinenLiefererPool[(idx + 1) % maschinenLiefererPool.length]; // anders als l1
  } else {
    l1 = { name: 'Maschinenbau KG', adresse: { ort: 'München' } };
    l2 = { name: 'TechMachines GmbH', adresse: { ort: 'Nürnberg' } };
  }

  const modell1 = MASCHINEN_MODELLE[Math.floor(Math.random() * MASCHINEN_MODELLE.length)];
  let modell2 = MASCHINEN_MODELLE[Math.floor(Math.random() * MASCHINEN_MODELLE.length)];
  if (modell2 === modell1) modell2 = MASCHINEN_MODELLE[(MASCHINEN_MODELLE.indexOf(modell1) + 1) % MASCHINEN_MODELLE.length];

  // ── Zahlen Angebot 1 ────────────────────────────────────────────────────
  const ak1 = randTo(10000, 100000, 400000);                  // Anschaffungskosten (glatt)
  const nd1 = [4, 5, 8, 10][Math.floor(Math.random() * 4)];   // Nutzungsdauer (teilt AK glatt)
  const absch1 = ak1 / nd1;                                   // Abschreibung pro Jahr
  const zinsSatz1 = randInt(8, 16) / 2;                       // 4,0–8,0 % in 0,5er-Schritten
  const zins1 = Math.round(ak1 * zinsSatz1 / 200 / 100) * 100; // kalk. Zinsen (runde 100 €)
  const gewinn1 = randTo(100, 5000, 40000);                   // Gewinn pro Jahr
  const sonstige1 = randTo(100, 15000, 60000);                // sonstige Kosten (Personal, Material ...)
  const dk1 = absch1 + zins1 + gewinn1 + sonstige1;           // durchschnittl. Gesamtkosten p. a.

  // ── Zahlen Angebot 2 ────────────────────────────────────────────────────
  const abweichung = randTo(10000, -40000, 40000);
  const ak2 = Math.max(40000, ak1 + abweichung);
  const nd2 = [4, 5, 8, 10][Math.floor(Math.random() * 4)];
  const absch2 = ak2 / nd2;
  const zinsSatz2 = randInt(8, 16) / 2;
  const zins2 = Math.round(ak2 * zinsSatz2 / 200 / 100) * 100;
  const gewinn2 = randTo(100, 5000, 40000);
  const sonstige2 = randTo(100, 15000, 60000);
  const dk2 = absch2 + zins2 + gewinn2 + sonstige2;
  const amort2 = ak2 / (absch2 + zins2 + gewinn2);            // gegebene Amortisationszeit

  // ── Lösung selbst berechnen (Aufgabe: Amortisationszeit Angebot 1) ──────
  const amort1 = ak1 / (absch1 + zins1 + gewinn1);

  const infos1 = liefererInfos(l1);
  const infos2 = liefererInfos(l2);

  // ── Aufgabentext ─────────────────────────────────────────────────────────
  const einleitung =
    `<strong>${inhaber}</strong> plant den Ersatz ` +
    `einer alten Maschine durch ${art.g === 'f' ? 'eine moderne, energiesparende' : 'ein modernes, energiesparendes'} ${art.n}. ` +
    `Aufgrund der langjährigen hervorragenden Auftragslage ist eine Selbstfinanzierung ` +
    `der Sachanlage in voller Höhe möglich. Die Daten von zwei unterschiedlichen Anbietern ` +
    `für ${art.plural} wurden bereits vorgelegt.`;

  // ── Datenblatt (Angebotsvergleich) ───────────────────────────────────────
  function zeile(label, wert) {
    return `<tr style="border:1px solid #999;">
      <td style="padding:4px 8px;">${label}</td>
      <td style="padding:4px 8px; text-align:right; white-space:nowrap;">${wert}</td>
    </tr>`;
  }
  function infoZeile(infos) {
    return `<tr style="border:1px solid #999;">
      <td style="padding:4px 8px; width:55%;">Weitere Informationen zum Lieferer</td>
      <td style="padding:4px 8px; white-space:nowrap;">- ${infos.join(';<br>- ')}</td>
    </tr>`;
  }
  function angebotTitel(nummer, modell) {
    return `<tr style="background-color:#6b7f99; color:#fff; font-weight:bold;">
      <td colspan="2" style="padding:6px 8px; text-align:center;">Angebot ${nummer}: ${art.n} ${modell}</td>
    </tr>`;
  }

  const datenblatt =
    `<table style="border:1px solid #999; font-size:16px; width:640px; max-width:100%; border-collapse:collapse;">
      ${angebotTitel(1, modell1)}
      ${zeile('Anschaffungskosten', euro(ak1))}
      ${zeile('Abschreibungsbetrag pro Jahr', euro(absch1))}
      ${zeile('Kalkulatorische Zinsen pro Jahr', euro(zins1))}
      ${zeile('Gewinn pro Jahr', euro(gewinn1))}
      ${zeile('Durchschnittliche Gesamtkosten pro Jahr', euro(dk1))}
      ${infoZeile(infos1)}
    </table>

    <div style="height:10px;"></div>

    <table style="border:1px solid #999; font-size:16px; width:640px; max-width:100%; border-collapse:collapse;">
      ${angebotTitel(2, modell2)}
      ${zeile('Amortisationszeit', zahl(amort2) + ' Jahre')}
      ${zeile('Durchschnittliche Gesamtkosten pro Jahr', euro(dk2))}
      ${infoZeile(infos2)}
    </table>`;

  // ── Lösung ───────────────────────────────────────────────────────────────
  const loesung =
    `Amortisationszeit in Jahren:<br>
    <span style="display:inline-block; text-align:center; vertical-align:middle;">
      <span style="display:block; border-bottom:1px solid #000; padding:0 8px;">${euro(ak1).replace(/\s*€\s*$/, '')}</span>
      <span style="display:block; padding:0 8px;">(${euro(absch1).replace(/\s*€\s*$/, '')} + ${euro(zins1).replace(/\s*€\s*$/, '')} + ${euro(gewinn1).replace(/\s*€\s*$/, '')})</span>
    </span>
    &nbsp;=&nbsp;<strong>${zahl(amort1)} Jahre</strong> &#10004;`;

  // ── HTML zusammensetzen ──────────────────────────────────────────────────
  const container = document.getElementById('Container');
  container.innerHTML = `
    <h2>Aufgabe: Amortisationszeit</h2>
    <h3>Berechne die Amortisationszeit des Angebots 1.</h3>
    <div style="background:#fff; border:1px solid #dde3ea; border-radius:8px;
                padding:14px 18px; margin-bottom:12px; font-size:16px; line-height:1.7;">
      ${einleitung}
    </div>
    ${datenblatt}
    <h2 class="loesung">Lösung</h2>
    <div style="background:#fff; border:1px solid #dde3ea; border-radius:8px;
                padding:12px 18px; margin-top:12px; font-size:16px; line-height:2;">
      ${loesung}
    </div>
  `;

  // ── Aufgabenstellung + Musterlösung als Text für den KI-Prompt ───────────
  setzeAufgabeKiText(
    `${inhaber} von ${unternehmensName} plant den Ersatz einer alten Maschine ` +
    `durch ${art.g === 'f' ? 'eine moderne, energiesparende' : 'ein modernes, energiesparendes'} ${art.n}. Aufgrund der langjährigen ` +
    `hervorragenden Auftragslage ist eine Selbstfinanzierung der Sachanlage in ` +
    `voller Höhe möglich. Die Daten von zwei unterschiedlichen Anbietern für ` +
    `${art.plural} wurden bereits vorgelegt.\n\n` +
    `Angebot 1: ${art.n} ${modell1}\n` +
    `  Anschaffungskosten: ${euro(ak1)}\n` +
    `  Abschreibungsbetrag pro Jahr: ${euro(absch1)}\n` +
    `  Kalkulatorische Zinsen pro Jahr: ${euro(zins1)}\n` +
    `  Gewinn pro Jahr: ${euro(gewinn1)}\n` +
    `  Durchschnittliche Gesamtkosten pro Jahr: ${euro(dk1)}\n` +
    `  Weitere Informationen zum Lieferer: - ${infos1.join('; - ')}\n\n` +
    `Angebot 2: ${art.n} ${modell2}\n` +
    `  Amortisationszeit: ${zahl(amort2)} Jahre\n` +
    `  Durchschnittliche Gesamtkosten pro Jahr: ${euro(dk2)}\n` +
    `  Weitere Informationen zum Lieferer: - ${infos2.join('; - ')}\n\n` +
    `Berechne die Amortisationszeit des Angebots 1.\n\n` +
    `Musterlösung:\n` +
    `Amortisationszeit in Jahren = ${euro(ak1)} ÷ (${euro(absch1)} + ${euro(zins1)} + ${euro(gewinn1)}) = ${zahl(amort1)}`
  );

  // ── Beleg (Eingangsrechnungen der Lieferer von Angebot 1 und 2) ──────────
  letzteAufgabe = {
    art,
    anbieter: [
      { nummer: 1, ak: ak1, modell: modell1, lieferer: l1.name },
      { nummer: 2, ak: ak2, modell: modell2, lieferer: l2.name },
    ],
  };
  renderBelegButtons();
}

// ============================================================================
// AUFGABENTYP 1c: PRODUKTIONSMASCHINE – AMORTISATIONSZEIT (ERWEITERT)
// Wie Aufgabentyp "umfassend", jedoch ist der Gewinn pro Jahr NICHT gegeben:
// Der Schüler muss ihn aus Produktionsmenge und Gewinn je Stück berechnen.
// ============================================================================

function generiereProduktionsmaschineErweitert() {
  // ── Unternehmen + Inhaber aus der YAML ──────────────────────────────────
  const kundeSelect = document.getElementById('irKunde');
  const kundenName = kundeSelect && kundeSelect.value ? kundeSelect.value.trim() : '';
  const u = getUnternehmen(kundenName);
  const inhaber = (u && u.inhaber) ? u.inhaber : '<i>[Inhaber]</i>';
  const unternehmensName = (u && u.name) ? u.name : '<i>[Modellunternehmen]</i>';

  // ── Maschine + Lieferer ──────────────────────────────────────────────────
  const art = { n: 'Produktionsmaschine', plural: 'Produktionsmaschinen', g: 'f' };
  const maschinenLiefererPool = getMaschinenLieferer().map(c => c.unternehmen);
  const l1 = maschinenLiefererPool.length > 0
    ? maschinenLiefererPool[0]
    : { name: 'Maschinenbau KG', adresse: { ort: 'München' } };
  const modell = MASCHINEN_MODELLE[Math.floor(Math.random() * MASCHINEN_MODELLE.length)];

  // ── Zahlen ───────────────────────────────────────────────────────────────
  const absch = randTo(500, 3000, 25000);        // Abschreibungsbetrag pro Jahr
  const nd = randInt(8, 20);                     // Nutzungsdauer (Jahre)
  const ak = absch * nd;                         // Anschaffungskosten (glatt)
  const zinsSatz = randInt(5, 12) / 2;           // 2,5–6,0 % in 0,5er-Schritten
  const zins = ak * zinsSatz / 200;              // kalk. Zinsen (durchschn. Kapital)

  // Gewinn pro Jahr NICHT angeben: Produktionsmenge + Gewinn je Stück
  const qty = randTo(100, 5000, 100000);         // Produktionsmenge (Stück/Jahr)
  const m = qty / 100;
  const kMin = Math.max(1, Math.ceil(5000 / m));
  const kMax = Math.max(kMin, Math.floor(40000 / m));
  const k = randInt(kMin, kMax);
  const gjs = k / 100;                           // Gewinn je Stück (€) – exakt
  const gewinn = qty * gjs;                      // ganzzahlig, wird berechnet

  // ── Lösung selbst berechnen ──────────────────────────────────────────────
  const amort = ak / (absch + zins + gewinn);

  // ── Aufgabentext ─────────────────────────────────────────────────────────
  const einleitung =
    `Aufgrund der guten Auftragslage plant <strong>${inhaber}</strong> von ` +
    `<strong>${unternehmensName}</strong> die Anschaffung einer zusätzlichen ` +
    `Produktionsmaschine. In der engeren Auswahl ist das Modell ` +
    `<strong>&bdquo;${modell}&ldquo;</strong>:`;

  // ── Datenblatt (eine Maschine) ───────────────────────────────────────────
  function zeile(label, wert) {
    return `<tr style="border:1px solid #999;">
      <td style="padding:4px 8px;">${label}</td>
      <td style="padding:4px 8px; text-align:right; white-space:nowrap;">${wert}</td>
    </tr>`;
  }

  const datenblatt =
    `<table style="border:1px solid #999; font-size:16px; width:560px; max-width:100%; border-collapse:collapse;">
      <tr style="background-color:#6b7f99; color:#fff; font-weight:bold;">
        <td colspan="2" style="padding:6px 8px; text-align:center;">${modell}</td>
      </tr>
      ${zeile('Anschaffungskosten', euro(ak))}
      ${zeile('Nutzungsdauer', nd + ' Jahre')}
      ${zeile('Kalkulatorischer Zinssatz', String(zinsSatz).replace('.', ',') + ' %')}
      ${zeile('Produktionsmenge', menge(qty) + ' Stück pro Jahr')}
      ${zeile('Gewinn je Stück', euro(gjs))}
    </table>`;

  // ── Lösung ───────────────────────────────────────────────────────────────
  const loesung =
    `Abschreibung pro Jahr in Euro: ${bruch(betragOhneEuro(ak), nd)} &nbsp;=&nbsp;<strong>${euro(absch)}</strong> &#10004;<br><br>` +
    `Kalkulatorische Zinsen pro Jahr in Euro: ${bruch(betragOhneEuro(ak) + ' · ' + String(zinsSatz).replace('.', ','), '100 · 2')} &nbsp;=&nbsp;<strong>${euro(zins)}</strong> &#10004;<br><br>` +
    `Gewinn pro Jahr in Euro: ${menge(qty)} Stück · ${euro(gjs)} &nbsp;=&nbsp;<strong>${euro(gewinn)}</strong> &#10004;<br><br>` +
    `Amortisationszeit in Jahren: ${bruch(betragOhneEuro(ak), `(${betragOhneEuro(absch)} + ${betragOhneEuro(zins)} + ${betragOhneEuro(gewinn)})`)} &nbsp;=&nbsp;<strong>${zahl(amort)}</strong> &#10004;`;

  // ── HTML zusammensetzen ──────────────────────────────────────────────────
  const container = document.getElementById('Container');
  container.innerHTML = `
    <h2>Aufgabe: Amortisationszeit</h2>
    <h3>Berechne die Amortisationszeit für die Produktionsmaschine &bdquo;${modell}&ldquo;.</h3>
    <div style="background:#fff; border:1px solid #dde3ea; border-radius:8px;
                padding:14px 18px; margin-bottom:12px; font-size:16px; line-height:1.7;">
      ${einleitung}
    </div>
    ${datenblatt}
    <h2 class="loesung">Lösung</h2>
    <div style="background:#fff; border:1px solid #dde3ea; border-radius:8px;
                padding:12px 18px; margin-top:12px; font-size:16px; line-height:1.7;">
      ${loesung}
    </div>
  `;

  // ── Aufgabenstellung + Musterlösung als Text für den KI-Prompt ───────────
  setzeAufgabeKiText(
    `Aufgrund der guten Auftragslage plant ${inhaber} von ${unternehmensName} ` +
    `die Anschaffung einer zusätzlichen Produktionsmaschine. In der engeren ` +
    `Auswahl ist das Modell „${modell}".\n\n` +
    `${modell}\n` +
    `  Anschaffungskosten: ${euro(ak)}\n` +
    `  Nutzungsdauer: ${nd} Jahre\n` +
    `  Kalkulatorischer Zinssatz: ${String(zinsSatz).replace('.', ',')} %\n` +
    `  Produktionsmenge: ${menge(qty)} Stück pro Jahr\n` +
    `  Gewinn je Stück: ${euro(gjs)}\n\n` +
    `Berechne die Amortisationszeit für die Produktionsmaschine „${modell}".\n\n` +
    `Musterlösung:\n` +
    `Abschreibung pro Jahr in Euro = ${euro(ak)} ÷ ${nd} = ${euro(absch)}\n` +
    `Kalkulatorische Zinsen pro Jahr in Euro = (${euro(ak)} · ${String(zinsSatz).replace('.', ',')}) ÷ (100 · 2) = ${euro(zins)}\n` +
    `Gewinn pro Jahr in Euro = Produktionsmenge × Gewinn je Stück = ${menge(qty)} × ${euro(gjs)} = ${euro(gewinn)}\n` +
    `Amortisationszeit in Jahren = ${euro(ak)} ÷ (${euro(absch)} + ${euro(zins)} + ${euro(gewinn)}) = ${zahl(amort)}`
  );

  // ── Beleg (Eingangsrechnung des Lieferers) ───────────────────────────────
  letzteAufgabe = {
    art,
    anbieter: [
      { nummer: 1, ak, modell, lieferer: l1.name },
    ],
  };
  renderBelegButtons();
}

// ============================================================================
// AUFGABENTYP: KOSTENVERGLEICHSRECHNUNG (EINZELNE MASCHINE)
// Prüft, ob die Gesamtkosten pro Jahr eine vorgegebene Obergrenze einhalten.
// ============================================================================
function generiereKostenvergleichsrechnung() {
  // ── Unternehmen + Inhaber aus der YAML ──────────────────────────────────
  const kundeSelect = document.getElementById('irKunde');
  const kundenName = kundeSelect && kundeSelect.value ? kundeSelect.value.trim() : '';
  const u = getUnternehmen(kundenName);
  const inhaber = (u && u.inhaber) ? u.inhaber : '<i>[Inhaber]</i>';
  const unternehmensName = (u && u.name) ? u.name : '<i>[Modellunternehmen]</i>';

  // ── Maschine + Lieferer ──────────────────────────────────────────────────
  const art = { n: 'Fertigungsmaschine', plural: 'Fertigungsmaschinen', g: 'f' };
  const maschinenLiefererPool = getMaschinenLieferer().map(c => c.unternehmen);
  const l1 = maschinenLiefererPool.length > 0
    ? maschinenLiefererPool[Math.floor(Math.random() * maschinenLiefererPool.length)]
    : { name: 'Maschinenbau KG', adresse: { ort: 'München' } };
  const modell = MASCHINEN_MODELLE[Math.floor(Math.random() * MASCHINEN_MODELLE.length)];

  // ── Zahlen ───────────────────────────────────────────────────────────────
  const nd = [8, 10, 12, 14, 15, 16, 20][Math.floor(Math.random() * 7)];
  const absch = randTo(500, 2000, 10000);          // Abschreibungsbetrag pro Jahr
  const ak = absch * nd;                            // Anschaffungskosten (glatt)
  const zinsSatz = randInt(5, 12) / 2;             // 2,5–6,0 % in 0,5er-Schritten
  const zins = ak * zinsSatz / 200;                // kalk. Zinsen (durchschn. Kapital)
  const sonstige = randTo(100, 5000, 15000);       // Sonstige fixe Kosten pro Jahr

  const qty = randTo(10000, 50000, 120000);       // Maximale Produktionsmenge pro Jahr
  const personal = randTo(5, 20, 45) / 100;       // Personalkosten pro Stück (0,20–0,45)
  const material = randTo(5, 15, 35) / 100;       // Materialkosten pro Stück (0,15–0,35)
  const energie = randTo(5, 5, 20) / 100;         // Energiekosten pro Stück (0,05–0,20)

  // ── Lösung selbst berechnen ──────────────────────────────────────────────
  const personalkosten = personal * qty;
  const materialkosten = material * qty;
  const energiekosten = energie * qty;
  const variable = personalkosten + materialkosten + energiekosten;
  const fix = absch + zins + sonstige;
  const gesamt = fix + variable;
  // Obergrenze: nächste glatte 10.000 € über den Gesamtkosten
  const obergrenze = Math.ceil(gesamt / 10000) * 10000;
  const nachgewiesen = gesamt <= obergrenze;

  const infos = liefererInfos(l1);

  // ── Aufgabentext ─────────────────────────────────────────────────────────
  const einleitung =
    `Im Unternehmen „<strong>${unternehmensName}</strong>" liegen folgende Daten für die ` +
    `Anschaffung einer ${art.n} vor. Das Modell <strong>&bdquo;${modell}&ldquo;</strong> ` +
    `steht in der engeren Auswahl und Voraussetzung für die Anschaffung ist, dass die ` +
    `Gesamtkosten pro Jahr nicht höher als <strong>${euro(obergrenze)}</strong> sind. ` +
    `Weise dies rechnerisch nach.`;

  function zeile(label, wert) {
    return `<tr style="border:1px solid #999;">
      <td style="padding:4px 8px;">${label}</td>
      <td style="padding:4px 8px; text-align:right; white-space:nowrap;">${wert}</td>
    </tr>`;
  }

  const datenblatt =
    `<table style="border:1px solid #999; font-size:16px; width:560px; max-width:100%; border-collapse:collapse;">
      <tr style="background-color:#6b7f99; color:#fff; font-weight:bold;">
        <td colspan="2" style="padding:6px 8px; text-align:center;">${modell}</td>
      </tr>
      ${zeile('Anschaffungskosten', euro(ak))}
      ${zeile('Maximale Produktionsmenge pro Jahr', menge(qty) + ' Stück')}
      ${zeile('Nutzungsdauer', nd + ' Jahre')}
      ${zeile('Kalkulatorischer Zinssatz', String(zinsSatz).replace('.', ',') + ' %')}
      ${zeile('Sonstige fixe Kosten pro Jahr', euro(sonstige))}
      ${zeile('Personalkosten', euro(personal) + ' pro Stück')}
      ${zeile('Materialkosten', euro(material) + ' pro Stück')}
      ${zeile('Energiekosten', euro(energie) + ' pro Stück')}
      <tr style="border:1px solid #999;">
        <td style="padding:4px 8px;">Weitere Informationen zum Lieferer</td>
        <td style="padding:4px 8px; white-space:nowrap;">- ${infos.join(';<br>- ')}</td>
      </tr>
    </table>`;

  // ── Lösung ───────────────────────────────────────────────────────────────
  const loesung =
    `Abschreibung pro Jahr in Euro: ${bruch(betragOhneEuro(ak), nd)} &nbsp;=&nbsp;<strong>${euro(absch)}</strong> &#10004;<br><br>` +
    `Kalkulatorische Zinsen pro Jahr in Euro: ${bruch(betragOhneEuro(ak) + ' · ' + String(zinsSatz).replace('.', ','), '100 · 2')} &nbsp;=&nbsp;<strong>${euro(zins)}</strong> &#10004;<br><br>` +
    `Abschreibung pro Jahr ${euro(absch)}<br>` +
    `+ kalkulatorische Zinsen pro Jahr ${euro(zins)}<br>` +
    `+ Sonstige fixe Kosten pro Jahr ${euro(sonstige)}<br>` +
    `Fixe Kosten pro Jahr ${euro(fix)} &#10004;<br><br>` +
    `Personalkosten = ${euro(personal)} · ${menge(qty)} = ${euro(personalkosten)}<br>` +
    `+ Materialkosten = ${euro(material)} · ${menge(qty)} = ${euro(materialkosten)}<br>` +
    `+ Energiekosten = ${euro(energie)} · ${menge(qty)} = ${euro(energiekosten)}<br>` +
    `Variable Kosten pro Jahr ${euro(variable)} &#10004;<br><br>` +
    `Fixe Kosten pro Jahr ${euro(fix)}<br>` +
    `+ Variable Kosten pro Jahr ${euro(variable)}<br>` +
    `Gesamtkosten pro Jahr ${euro(gesamt)} &#10004;<br><br>` +
    `<strong>Ergebnis:</strong> Die Gesamtkosten pro Jahr von ${euro(gesamt)} ` +
    `liegen ${nachgewiesen ? 'nicht höher als' : 'über'} der Obergrenze von ${euro(obergrenze)} ` +
    `– die Voraussetzung ist ${nachgewiesen ? 'erfüllt (nachgewiesen) ✔' : 'nicht erfüllt ✘'}.</strong>`;

  // ── HTML zusammensetzen ──────────────────────────────────────────────────
  const container = document.getElementById('Container');
  container.innerHTML = `
    <h2>Aufgabe: Kostenvergleichsrechnung</h2>
    <h3>Berechne die Gesamtkosten pro Jahr für die ${art.n} &bdquo;${modell}&ldquo; und weise nach, dass sie die Obergrenze von ${euro(obergrenze)} nicht überschreiten.</h3>
    <div style="background:#fff; border:1px solid #dde3ea; border-radius:8px;
                padding:14px 18px; margin-bottom:12px; font-size:16px; line-height:1.7;">
      ${einleitung}
    </div>
    ${datenblatt}
    <h2 class="loesung">Lösung</h2>
    <div style="background:#fff; border:1px solid #dde3ea; border-radius:8px;
                padding:12px 18px; margin-top:12px; font-size:16px; line-height:2;">
      ${loesung}
    </div>
  `;

  // ── Aufgabenstellung + Musterlösung als Text für den KI-Prompt ───────────
  setzeAufgabeKiText(
    `Im Unternehmen „${unternehmensName}" liegen folgende Daten für die Anschaffung ` +
    `einer ${art.n} vor. Das Modell „${modell}" steht in der engeren Auswahl und ` +
    `Voraussetzung für die Anschaffung ist, dass die Gesamtkosten pro Jahr nicht ` +
    `höher als ${euro(obergrenze)} sind. Weise dies rechnerisch nach.\\n\\n` +
    `${modell}\\n` +
    `  Anschaffungskosten: ${euro(ak)}\\n` +
    `  Maximale Produktionsmenge pro Jahr: ${menge(qty)} Stück\\n` +
    `  Nutzungsdauer: ${nd} Jahre\\n` +
    `  Kalkulatorischer Zinssatz: ${String(zinsSatz).replace('.', ',')} %\\n` +
    `  Sonstige fixe Kosten pro Jahr: ${euro(sonstige)}\\n` +
    `  Personalkosten: ${euro(personal)} pro Stück\\n` +
    `  Materialkosten: ${euro(material)} pro Stück\\n` +
    `  Energiekosten: ${euro(energie)} pro Stück\\n` +
    `  Weitere Informationen zum Lieferer: - ${infos.join('; - ')}\\n\\n` +
    `Berechne die Gesamtkosten pro Jahr.\\n\\n` +
    `Musterlösung:\\n` +
    `Abschreibung pro Jahr in Euro = ${euro(ak)} ÷ ${nd} = ${euro(absch)}\\n` +
    `Kalkulatorische Zinsen pro Jahr in Euro = (${euro(ak)} · ${String(zinsSatz).replace('.', ',')}) ÷ (100 · 2) = ${euro(zins)}\\n` +
    `Fixe Kosten pro Jahr = ${euro(absch)} + ${euro(zins)} + ${euro(sonstige)} = ${euro(fix)}\\n` +
    `Personalkosten = ${euro(personal)} · ${menge(qty)} = ${euro(personalkosten)}\\n` +
    `Materialkosten = ${euro(material)} · ${menge(qty)} = ${euro(materialkosten)}\\n` +
    `Energiekosten = ${euro(energie)} · ${menge(qty)} = ${euro(energiekosten)}\\n` +
    `Variable Kosten pro Jahr = ${euro(personalkosten)} + ${euro(materialkosten)} + ${euro(energiekosten)} = ${euro(variable)}\\n` +
    `Gesamtkosten pro Jahr = ${euro(fix)} + ${euro(variable)} = ${euro(gesamt)}\\n` +
    `Ergebnis: ${euro(gesamt)} ≤ ${euro(obergrenze)} – nachgewiesen.`
  );

  // ── Beleg (Eingangsrechnung des Lieferers) ───────────────────────────────
  letzteAufgabe = {
    art,
    anbieter: [
      { nummer: 1, ak, modell, lieferer: l1.name },
    ],
  };
  renderBelegButtons();
}

// ============================================================================
// AUFGABENTYP: ANGEBOTSVERGLEICH (KOSTENVERGLEICHSRECHNUNG + BUCHUNGSSATZ)
// Zwei Angebote im Tabellenvergleich (Aufgabenstil 4.4.x):
//   1. Gesamtkosten pro Jahr des Angebots 2 berechnen (kalk. Zinssatz gegeben)
//   2. Zwei weitere Kriterien nennen, die für Angebot 1 sprechen
//   3. Buchungssatz für den Rechnungseingang beim Kauf bilden
// ============================================================================

function generiereAngebotsvergleich() {
  // ── Unternehmen + Inhaber aus der YAML ──────────────────────────────────
  const kundeSelect = document.getElementById('irKunde');
  const kundenName = kundeSelect && kundeSelect.value ? kundeSelect.value.trim() : '';
  const u = getUnternehmen(kundenName);
  const inhaber = (u && u.inhaber) ? u.inhaber : '<i>[Inhaber]</i>';
  const unternehmensName = (u && u.name) ? u.name : '<i>[Modellunternehmen]</i>';

  // ── Maschine + Lieferer ──────────────────────────────────────────────────
  const art = MASCHINEN_ARTEN[Math.floor(Math.random() * MASCHINEN_ARTEN.length)];
  const maschinenLiefererPool = getMaschinenLieferer().map(c => c.unternehmen)
    .sort(() => Math.random() - 0.5);
  const l1 = maschinenLiefererPool[0] || { name: 'Maschinenbau KG', adresse: { ort: 'München' } };
  const l2 = (maschinenLiefererPool.length > 1
    ? maschinenLiefererPool[1]
    : { name: 'TechMachines GmbH', adresse: { ort: 'Nürnberg' } });

  const modell1 = MASCHINEN_MODELLE[Math.floor(Math.random() * MASCHINEN_MODELLE.length)];
  let modell2 = MASCHINEN_MODELLE[Math.floor(Math.random() * MASCHINEN_MODELLE.length)];
  if (modell2 === modell1) modell2 = MASCHINEN_MODELLE[(MASCHINEN_MODELLE.indexOf(modell1) + 1) % MASCHINEN_MODELLE.length];

  // ── Zahlen Angebot 1 ────────────────────────────────────────────────────
  const nd = [4, 5, 8, 10][Math.floor(Math.random() * 4)];    // Nutzungsdauer (beide Angebote gleich)
  const absch1 = randTo(100, 7000, 18000);                    // Abschreibung pro Jahr
  const ak1 = absch1 * nd;                                    // Anschaffungskosten (glatt)
  const zinsSatz = randInt(8, 16) / 2;                        // 4,0–8,0 % in 0,5er-Schritten
  const zins1 = ak1 * zinsSatz / 200;                         // kalk. Zinsen (durchschn. Kapital)
  const variable1 = randTo(100, 60000, 120000);               // Variable Kosten pro Jahr
  const gesamt1 = absch1 + zins1 + variable1;                 // Gesamtkosten pro Jahr
  const amort1 = randInt(12, 28) / 10;                        // 1,2–2,8 Jahre

  // ── Zahlen Angebot 2 ────────────────────────────────────────────────────
  const absch2 = absch1 + randTo(100, -600, 600);
  const ak2 = absch2 * nd;
  const variable2 = randTo(100, 60000, 120000);
  const amort2 = amort1 + randInt(2, 8) / 10;                 // länger als Angebot 1

  // ── Lösungswerte Angebot 2 (zu berechnen) ────────────────────────────────
  const zins2 = ak2 * zinsSatz / 200;
  const fixe2 = absch2 + zins2;
  const gesamt2 = fixe2 + variable2;

  // ── Weitere Informationen ────────────────────────────────────────────────
  // Der Flächenbedarf ist NICHT immer Teil der Aufgabe (Zufall):
  //  - Ist er dabei und bei Angebot 1 geringer, zählt er neben der kürzeren
  //    Amortisationszeit als zweites Kriterium zu 2.
  //  - Ist er dabei, aber größer, ist er (wie ein negatives Zusatzinfo,
  //    z. B. „Kürzere Garantiezeit") NICHT wirksam; dann besteht das zweite
  //    Kriterium aus dem positiven Zusatzinfo, das nur Angebot 1 erhalten hat.
  //  - Fehlt er, ist das positive Zusatzinfo das zweite Kriterium.
  const mitFlaeche = Math.random() < 0.5;
  const flKleinerBei1 = mitFlaeche && Math.random() < 0.5;
  // Immer mindestens eine Vergleichsinfo (Flächenbedarf ODER Lieferzeit),
  // damit die Zeile „Weitere Informationen" bei BEIDEN Angeboten gefüllt ist.
  const mitLieferzeit = !mitFlaeche || Math.random() < 0.5;

  const poolPositiv = [
    'Kostenloser Wartungsservice',
    'Kostenloser Ersatzteilservice',
    'Schulung der Bediener inklusive',
    'Wartungsvertrag für 3 Jahre inklusive',
    'Längere Garantiezeit',
  ];
  const poolNegativ = [
    'Kürzere Garantiezeit',
    'Kostenpflichtiger Wartungsservice',
  ];
  const klein = s => s.charAt(0).toLowerCase() + s.slice(1);   // kleingeschrieben

  // Kriterien zu 2. (zweites Kriterium: geringerer Flächenbedarf ODER positives Zusatzinfo)
  const zweitesKriteriumIstFlaeche = mitFlaeche && flKleinerBei1;
  const zusatzPositiv = zweitesKriteriumIstFlaeche
    ? null
    // groß geschrieben (Wartungsvertrag, Schulung ...), wie im Datenblatt
    : poolPositiv[Math.floor(Math.random() * poolPositiv.length)];

  // Lieferzeit konkret in Tagen – wie der Flächenbedarf bei BEIDEN Angeboten
  // angegeben (Angebot 1 liefert langsamer: Nachteil, aber nicht wirksam).
  // Fehlt sie, erscheint stattdessen ein negatives Zusatzinfo nur bei Angebot 1.
  const lieferzeit1 = randInt(14, 28);     // Tage (Angebot 1: länger)
  const lieferzeit2 = randInt(3, 10);      // Tage (Angebot 2: kürzer)
  const negativAuswahl = poolNegativ[Math.floor(Math.random() * poolNegativ.length)];

  // Nicht wirksame Information(en) für die Musterlösung
  const nachteile = [];
  if (mitLieferzeit) nachteile.push(`die längere Lieferzeit (${lieferzeit1} Tage gegenüber ${lieferzeit2} Tagen bei Angebot 2)`);
  else nachteile.push(klein(negativAuswahl));
  if (mitFlaeche && !flKleinerBei1) nachteile.push('der größere Flächenbedarf');
  const mehrereNachteile = nachteile.length > 1;
  const nachteilVerb = mehrereNachteile ? 'sind' : 'ist';
  const nachteilEndung = mehrereNachteile ? 'e' : '';
  const nachteilText = `${nachteile.join(' und ')} ${nachteilVerb} Nachteil${nachteilEndung} und spricht${mehrereNachteile ? 'en' : ''} nicht für Angebot&nbsp;1.`;
  const nachteilPlain = `${nachteile.join(' und ')} – ${nachteilVerb} Nachteil${nachteilEndung} und nicht wirksam`;

  // Flächenbedarf (nur relevant, wenn er Teil der Aufgabe ist)
  const fl1 = mitFlaeche ? (flKleinerBei1 ? randInt(12, 17) : randInt(18, 30)) : null;
  const fl2 = mitFlaeche ? (flKleinerBei1 ? randInt(18, 30) : randInt(12, 17)) : null;

  // Zeile „Weitere Informationen" im Datenblatt (HTML) und für den KI-Prompt
  const zeilen1 = [];
  const zeilen2 = [];
  if (fl1 !== null) zeilen1.push(`Flächenbedarf: ${fl1} m²`);
  if (fl2 !== null) zeilen2.push(`Flächenbedarf: ${fl2} m²`);
  if (zusatzPositiv) zeilen1.push(zusatzPositiv);
  if (mitLieferzeit) {
    zeilen1.push(`Lieferzeit: ${lieferzeit1} Tage`);
    zeilen2.push(`Lieferzeit: ${lieferzeit2} Tage`);
  } else {
    zeilen1.push(klein(negativAuswahl));
  }
  // Zeile „Weitere Informationen" im Datenblatt (mit Spiegelstrichen zur
  // besseren Unterscheidung der Begriffe) und für den KI-Prompt
  const strich = s => '– ' + s;
  const zeilen1Html = zeilen1.map(strich).join('<br>');
  const zeilen2Html = zeilen2.length ? zeilen2.map(strich).join('<br>') : '&ndash;';
  const info1 = zeilen1Html;
  const info2 = zeilen2Html;
  const info1Ki = zeilen1.map(z => '- ' + z).join('; ');
  const info2Ki = zeilen2.length ? zeilen2.map(z => '- ' + z).join('; ') : '–';

  // Musterlösung zu 2.
  const kriterienVariante = zweitesKriteriumIstFlaeche
    ? {
        html: `kürzere Amortisationszeit &#10004;, geringerer Flächenbedarf &#10004;<br>
          <small>${nachteile[0].charAt(0).toUpperCase() + nachteile[0].slice(1)} ist ein Nachteil und spricht nicht für Angebot&nbsp;1.</small>`,
        text: `kürzere Amortisationszeit, geringerer Flächenbedarf (nicht ${nachteile[0]} – ist ein Nachteil und nicht wirksam)`
      }
    : {
        html: `kürzere Amortisationszeit &#10004;, ${zusatzPositiv} &#10004;<br>
          <small>${nachteilText}</small>`,
        text: `kürzere Amortisationszeit, ${zusatzPositiv} (nicht ${nachteilPlain})`
      };

  // ── Zahlenwerte für die Buchung ──────────────────────────────────────────
  const MA = kontoLabel('0700');        // Maschinen & Anlagen
  const VORST = kontoLabel('2600');     // Vorsteuer
  const VE = kontoLabel('4400');        // Verbindlichkeiten aus LL
  const vorst1 = ak1 * UST_REGEL / 100;
  const brutto1 = ak1 + vorst1;

  const zsTxt = String(zinsSatz).replace('.', ',');

  // ── Aufgabentext ─────────────────────────────────────────────────────────
  const einleitung =
    `<strong>${inhaber}</strong> von <strong>${unternehmensName}</strong> plant die Anschaffung ` +
    `${art.g === 'f' ? 'einer neuen' : 'eines neuen'} ${art.n}. Zwei Anbieter ` +
    `für ${art.plural} haben ihre Angebote vorgelegt (Kostenvergleichsrechnung):`;

  // ── Angebotsvergleichstabelle ────────────────────────────────────────────
  function zelle(label, v1, v2) {
    return `<tr style="border:1px solid #999;">
      <td style="padding:4px 8px;">${label}</td>
      <td style="padding:4px 8px; text-align:center;">${v1}</td>
      <td style="padding:4px 8px; text-align:center;">${v2}</td>
    </tr>`;
  }

  const datenblatt =
    `<table style="border:1px solid #999; font-size:16px; width:680px; max-width:100%; border-collapse:collapse;">
      <tr style="background-color:#ccc; font-weight:bold;">
        <th style="padding:6px 8px; width:28%;"></th>
        <th style="padding:6px 8px; width:36%; text-align:center;">Angebot 1:<br>${art.n} &bdquo;${modell1}&ldquo;</th>
        <th style="padding:6px 8px; width:36%; text-align:center;">Angebot 2:<br>${art.n} &bdquo;${modell2}&ldquo;</th>
      </tr>
      ${zelle('Anschaffungskosten', euro(ak1), euro(ak2))}
      ${zelle('Abschreibung pro Jahr', euro(absch1), euro(absch2))}
      ${zelle('Kalkulatorische Zinsen pro Jahr', euro(zins1), '')}
      ${zelle('Variable Kosten pro Jahr', euro(variable1), euro(variable2))}
      ${zelle('Gesamtkosten pro Jahr', euro(gesamt1), '')}
      ${zelle('Amortisationszeit', zahl(amort1) + ' Jahre', zahl(amort2) + ' Jahre')}
      ${zelle('Weitere Informationen', info1, info2)}
    </table>`;

  // ── Arbeitsauftrag (Nummer links, Text mit hängendem Einzug) ─────────────
  const aufgabeZeile = (nr, text) =>
    `<tr>
      <td style="vertical-align:top; padding:4px 16px 4px 0; font-weight:bold; white-space:nowrap; width:40px;">${nr}</td>
      <td style="padding:4px 0; line-height:1.6;">${text}</td>
    </tr>`;

  const aufgaben =
    `<table style="border:none; border-collapse:collapse; font-size:16px; width:100%;">
      ${aufgabeZeile('1.', `Berechne die Gesamtkosten pro Jahr des Angebots 2 anhand der Kostenvergleichsrechnung, wenn ein kalkulatorischer Zinssatz von <strong>${zsTxt}&nbsp;%</strong> vorliegt.`)}
      ${aufgabeZeile('2.', `Für den Kauf der Maschine sind nicht nur die Gesamtkosten ausschlaggebend. Nenne auf Grundlage der Informationen zwei weitere Kriterien, die für das Angebot&nbsp;1 sprechen.`)}
      ${aufgabeZeile('3.', `„Alois" entscheidet sich für Angebot&nbsp;1. Bilde den Buchungssatz für den Rechnungseingang beim Kauf der Maschine &bdquo;${modell1}&ldquo; (Kauf auf Ziel).`)}
    </table>`;

  // ── Lösung ───────────────────────────────────────────────────────────────
  const loesung1 =
    `Kalk. Zinsen/Jahr in Euro: ${bruch(betragOhneEuro(ak2) + ' · ' + zsTxt, '100 · 2')} &nbsp;=&nbsp;<strong>${euro(zins2)}</strong> &#10004;<br><br>` +
    `Abschreibung/Jahr&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${euro(absch2)}<br>` +
    `+ Kalkulatorische Zinsen/Jahr&nbsp;&nbsp;${euro(zins2)}<br>` +
    `Fixe Kosten/Jahr&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${euro(fixe2)} &#10004;<br><br>` +
    `Variable Kosten/Jahr&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${euro(variable2)}<br>` +
    `+ Fixe Kosten/Jahr&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${euro(fixe2)}<br>` +
    `Gesamtkosten/Jahr&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>${euro(gesamt2)}</strong> &#10004;`;

  const loesung2 = kriterienVariante.html;

  const loesung3 =
    `<table style="border:1px solid #ccc; white-space:nowrap; background-color:#fff; font-family:courier; width:600px; max-width:100%; margin:0 0 6px;">
      <tr>
        <td style="min-width:160px;">${MA}</td>
        <td style="text-align:right; min-width:145px;">${euro(ak1)}</td>
        <td style="text-align:center; min-width:50px;"></td>
        <td style="min-width:90px;"></td>
        <td style="min-width:145px;"></td>
      </tr>
      <tr>
        <td>${VORST}</td>
        <td style="text-align:right;">${euro(vorst1)}</td>
        <td style="text-align:center;">an</td>
        <td>${VE}</td>
        <td style="text-align:right;">${euro(brutto1)}</td>
      </tr>
    </table>`;

  // ── HTML zusammensetzen ──────────────────────────────────────────────────
  const container = document.getElementById('Container');
  container.innerHTML = `
    <h2>Aufgabe: Angebotsvergleich</h2>
    <div style="background:#fff; border:1px solid #dde3ea; border-radius:8px;
                padding:14px 18px; margin-bottom:12px; font-size:16px; line-height:1.7;">
      ${einleitung}
    </div>
    ${datenblatt}
    <div style="background:#fff; border:1px solid #dde3ea; border-radius:8px;
                padding:12px 18px; margin-top:14px; font-size:16px;">
      <strong style="font-size:16px;">Arbeitsauftrag</strong>
      ${aufgaben}
    </div>
    <h2 class="loesung">Lösung</h2>
    <div style="background:#fff; border:1px solid #dde3ea; border-radius:8px;
                padding:12px 18px; margin-top:12px; font-size:16px; line-height:1.7;">
      <strong>Zu 1.:</strong><br>${loesung1}<br><br>
      <strong>Zu 2.:</strong><br>${loesung2}<br><br>
      <strong>Zu 3.:</strong><br>${loesung3}
    </div>
  `;

  // ── Aufgabenstellung + Musterlösung als Text für den KI-Prompt ───────────
  setzeAufgabeKiText(
    `${inhaber} von ${unternehmensName} plant die Anschaffung ` +
    `${art.g === 'f' ? 'einer neuen' : 'eines neuen'} ${art.n}. Zwei Anbieter ` +
    `für ${art.plural} haben ihre Angebote vorgelegt.\n\n` +
    `Angebot 1: ${art.n} „${modell1}"\n` +
    `  Anschaffungskosten: ${euro(ak1)}\n` +
    `  Abschreibung pro Jahr: ${euro(absch1)}\n` +
    `  Kalkulatorische Zinsen pro Jahr: ${euro(zins1)}\n` +
    `  Variable Kosten pro Jahr: ${euro(variable1)}\n` +
    `  Gesamtkosten pro Jahr: ${euro(gesamt1)}\n` +
    `  Amortisationszeit: ${zahl(amort1)} Jahre\n` +
    `  Weitere Informationen: ${info1Ki}\n\n` +
    `Angebot 2: ${art.n} „${modell2}"\n` +
    `  Anschaffungskosten: ${euro(ak2)}\n` +
    `  Abschreibung pro Jahr: ${euro(absch2)}\n` +
    `  Variable Kosten pro Jahr: ${euro(variable2)}\n` +
    `  Amortisationszeit: ${zahl(amort2)} Jahre\n` +
    `  Weitere Informationen: ${info2Ki}\n\n` +
    `Aufgaben:\n` +
    `1. Berechne die Gesamtkosten pro Jahr des Angebots 2 anhand der Kostenvergleichsrechnung, wenn ein kalkulatorischer Zinssatz von ${zsTxt} % vorliegt.\n` +
    `2. Nenne auf Grundlage der Informationen zwei weitere Kriterien, die für das Angebot 1 sprechen.\n` +
    `3. Bilde den Buchungssatz für den Rechnungseingang beim Kauf der Maschine „${modell1}" (Kauf auf Ziel, ${UST_REGEL} % USt).\n\n` +
    `Musterlösung:\n` +
    `1. Kalk. Zinsen/Jahr in Euro = ${euro(ak2)} · ${zsTxt} ÷ (100 · 2) = ${euro(zins2)}\n` +
    `   Fixe Kosten/Jahr = ${euro(absch2)} + ${euro(zins2)} = ${euro(fixe2)}\n` +
    `   Gesamtkosten/Jahr = ${euro(variable2)} + ${euro(fixe2)} = ${euro(gesamt2)}\n` +
    `2. ${kriterienVariante.text}\n` +
    `3. ${MA} ${euro(ak1)} / ${VORST} ${euro(vorst1)} an ${VE} ${euro(brutto1)}\n` +
    `   (Maschinen & Anlagen netto, 19 % Vorsteuer, Verbindlichkeiten brutto)`
  );

  // ── Beleg (Eingangsrechnungen der Lieferer von Angebot 1 und 2) ──────────
  letzteAufgabe = {
    art,
    anbieter: [
      { nummer: 1, ak: ak1, modell: modell1, lieferer: l1.name },
      { nummer: 2, ak: ak2, modell: modell2, lieferer: l2.name },
    ],
  };
  renderBelegButtons();
}

// ============================================================================
// BELEG-BUTTONS (Eingangsrechnungen je Angebot)
// ============================================================================

function renderBelegButtons() {
  const col = document.getElementById('button-column');
  if (!col || !letzteAufgabe) return;
  col.innerHTML = '';

  const tag = '05';
  const monatStr = String(randInt(1, 12)).padStart(2, '0');
  const jahr = new Date().getFullYear().toString();

  letzteAufgabe.anbieter.forEach(a => {
    // Artikel 1: Maschinentyp (Bezeichnung) mit Menge, Einheit und Einzelpreis
    // Artikel 2: nur Bezeichnung = Modellname (Rest leer)
    const params = new URLSearchParams();
    params.set('beleg', 'rechnung');
    params.set('artikel1', letzteAufgabe.art.n);
    params.set('menge1', '1');
    params.set('einheit1', 'Stück');
    params.set('einzelpreis1', a.ak.toString());
    params.set('artikel2', String(a.modell).slice(0, 28));
    params.set('umsatzsteuer', String(UST_REGEL));
    params.set('tag', tag);
    params.set('monat', monatStr);
    params.set('jahr', jahr);
    params.set('zahlungsziel', '30');
    params.set('skonto', '2');
    params.set('skontofrist', '14');
    params.set('lieferer', a.lieferer);   // Lieferant aus der YAML (Branche "Maschinen")
    // Empfänger (Modellunternehmen) aus dem Dropdown übernehmen, damit der Beleg
    // zur gewählten Firma passt – nicht nur zur im localStorage gespeicherten
    const kundeSel = document.getElementById('irKunde');
    const kundeName = (kundeSel && kundeSel.value) ? kundeSel.value.trim() : kunde;
    if (kundeName && !/^</.test(kundeName)) params.set('kunde', kundeName);
    const rechnungURL = `belege.html?${params.toString()}`;

    const wrap = document.createElement('div');
    wrap.style.margin = '12px 0';
    wrap.innerHTML = `
      <button class="geschaeftsfall-beleg-button"
        onclick="window.open('${rechnungURL}','_blank')"
        style="width:100%; padding:10px 12px; font-size:14px;">
        📄 Eingangsrechnung${letzteAufgabe.anbieter.length > 1 ? ' Angebot ' + a.nummer : ''}
      </button>`;
    col.appendChild(wrap);
  });
}

// ============================================================================
// AUFGABENTYP 2: DATENBLATT (KOSTENVERGLEICHS- UND AMORTISATIONSRECHNUNG)
// (Portierung aus investitionsrechnung.html – gleiche Zufallszahlen wie dort)
// ============================================================================

function generiereDatenblatt() {
  // ── Zufallszahlen (identische Logik wie investitionsrechnung.html) ───────
  let anlageI = randTo(1000, 30000, 300000);
  let quantity = randTo(100, anlageI / 100 * 0.5, anlageI / 100 * 1.25) * 100;
  let personalI = randTo(100, 15000, 30000) / 100000;
  let materialI = randTo(100, 15000, 30000) / 100000;
  let energyI = randTo(100, 5000, 15000) / 100000;
  let variableI = randTo(1000, anlageI * 0.05, anlageI * 0.10);
  let fixI = randTo(1000, anlageI * 0.05, anlageI * 0.10);
  let interest = randInt(2, 6);

  let anlageII = anlageI + randTo(100, -10000, 10000);
  let abweichung2 = randTo(1000, -10000, 10000);
  let personalII = personalI + randTo(100, -10000, 10000) / 2 / 100000;
  let materialII = materialI + randTo(100, -10000, 10000) / 2 / 100000;
  let energyII = energyI + randTo(100, -10000, 10000) / 2 / 100000;
  let variableII = variableI + abweichung2;
  let fixII = fixI + abweichung2;

  anlageII = Math.min(300000, Math.max(30000, anlageII));
  personalII = Math.min(0.30, Math.max(0.15, personalII));
  materialII = Math.min(0.40, Math.max(0.10, materialII));
  energyII = Math.min(0.15, Math.max(0.05, energyII));
  if (variableII < Math.round(anlageI / 100 / 1000) * 1000 || variableII > Math.round(anlageI / 10 / 1000) * 1000) variableII = variableI;
  if (fixII < Math.round(anlageI / 100 / 1000) * 1000 || fixII > Math.round(anlageI / 10 / 1000) * 1000) fixII = fixI;

  let nutzungsdauer = randInt(5, 10);

  let costI = parseFloat(personalI + materialI + energyI + (variableI / quantity) + (fixI / quantity));
  let costII = parseFloat(personalII + materialII + energyII + (variableII / quantity) + (fixII / quantity));
  let minSell = Math.min(costI, costII);
  let sell = randInt(Math.round(minSell * 1.25), Math.round(minSell * 1.75));
  let profitI = sell - costI;
  let profitII = sell - costII;

  let abschreibungI = anlageI / nutzungsdauer;
  let abschreibungII = anlageII / nutzungsdauer;
  let zinsenI = anlageI * interest / 200;
  let zinsenII = anlageII * interest / 200;
  let gewinnI = quantity * profitI;
  let gewinnII = quantity * profitII;
  let zeitI = anlageI / (abschreibungI + zinsenI + gewinnI);
  let zeitII = anlageII / (abschreibungII + zinsenII + gewinnII);
  let summeFixI = abschreibungI + zinsenI + fixI;
  let summeFixII = abschreibungII + zinsenII + fixII;
  let vgzI = quantity * personalI;
  let vgzII = quantity * personalII;
  let vgmI = quantity * materialI;
  let vgmII = quantity * materialII;
  let vgeI = quantity * energyI;
  let vgeII = quantity * energyII;
  let summeVariableI = vgzI + vgmI + vgeI + variableI;
  let summeVariableII = vgzII + vgmII + vgeII + variableII;
  let gesamtI = summeVariableI + summeFixI;
  let gesamtII = summeVariableII + summeFixII;

  // ── Werte-Zeilen ─────────────────────────────────────────────────────────
  function zelle(v) {
    return `<td style="text-align:right; padding:4px 8px;">${v}</td>`;
  }
  function td(label, v1, v2) {
    return `<tr style="border:1px solid #ccc;">
      <td style="padding:4px 8px;">${label}</td>${zelle(v1)}${zelle(v2)}</tr>`;
  }
  function gruppe(titel, farbe) {
    return `<tr style="border:1px solid #ccc; text-align:center; background-color:${farbe}; font-weight:bold;">
      <td colspan="3">${titel}</td></tr>`;
  }
  function tdRight(label, v1, v2, farbe) {
    return `<tr style="border:1px solid ${farbe || '#ccc'};">
      <td style="padding:4px 8px;">${label}</td>${zelle(v1)}${zelle(v2)}</tr>`;
  }

  const datenblatt =
    `<table style="border:1px solid #ccc; font-size:16px; width:640px; max-width:100%; border-collapse:collapse;">
      <tr style="background-color:#ccc;">
        <th style="width:40%; text-align:left; padding:4px 8px;"></th>
        <th style="width:30%; text-align:left; padding:4px 8px;">Anlage I</th>
        <th style="width:30%; text-align:left; padding:4px 8px;">Anlage II</th>
      </tr>
      ${td('Anschaffungskosten', euro(anlageI), euro(anlageII))}
      ${td('Nutzungsdauer', nutzungsdauer + ' Jahre', nutzungsdauer + ' Jahre')}
      ${td('Produktionsmenge', menge(quantity) + ' Teile/Jahr', menge(quantity) + ' Teile/Jahr')}
      ${td('Personalkosten', euro(personalI) + ' /Stück', euro(personalII) + ' /Stück')}
      ${td('Materialkosten', euro(materialI) + ' /Stück', euro(materialII) + ' /Stück')}
      ${td('Energiekosten', euro(energyI) + ' /Stück', euro(energyII) + ' /Stück')}
      ${td('Sonstige variable Kosten pro Jahr', euro(variableI), euro(variableII))}
      ${td('Sonstige fixe Kosten pro Jahr', euro(fixI), euro(fixII))}
      ${td('Kalkulatorischer Zinssatz', interest.toLocaleString('de-DE') + ' %', interest.toLocaleString('de-DE') + ' %')}
      ${td('Gewinn je Stück', euro(profitI), euro(profitII))}
    </table>`;

  const kostenvergleich =
    `<table style="border:1px solid #ccc; font-size:16px; width:640px; max-width:100%; border-collapse:collapse;">
      <tr style="background-color:#9ec2ec;">
        <th style="width:50%; text-align:left; padding:4px 8px;"></th>
        <th style="width:25%; text-align:left; padding:4px 8px;">Anlage I</th>
        <th style="width:25%; text-align:left; padding:4px 8px;">Anlage II</th>
      </tr>
      ${td('Anschaffungskosten', euro(anlageI), euro(anlageII))}
      ${td('Nutzungsdauer (Jahre)', nutzungsdauer, nutzungsdauer)}
      ${gruppe('Fixe Kosten p. a.', '#ecb0b0')}
      ${tdRight('Abschreibung (€)', euro(abschreibungI), euro(abschreibungII), '#ecb0b0')}
      ${tdRight('Kalkulatorische Zinsen (€)', euro(zinsenI), euro(zinsenII), '#ecb0b0')}
      ${tdRight('Sonstige fixe Kosten', euro(fixI), euro(fixII), '#ecb0b0')}
      <tr style="border:1px solid #ecb0b0;">
        <td style="background-color:#ecb0b0; padding:4px 8px;">Summe fixe Kosten</td>${zelle(euro(summeFixI))}${zelle(euro(summeFixII))}
      </tr>
      ${gruppe('Variable Kosten p. a.', '#f0f7ab')}
      ${tdRight('Personalkosten', euro(vgzI), euro(vgzII), '#f0f7ab')}
      ${tdRight('Materialkosten', euro(vgmI), euro(vgmII), '#f0f7ab')}
      ${tdRight('Energiekosten', euro(vgeI), euro(vgeII), '#f0f7ab')}
      ${tdRight('Sonstige variable Kosten', euro(variableI), euro(variableII), '#f0f7ab')}
      <tr style="border:1px solid #f0f7ab;">
        <td style="background-color:#f0f7ab; padding:4px 8px;">Summe variable Kosten</td>${zelle(euro(summeVariableI))}${zelle(euro(summeVariableII))}
      </tr>
      <tr style="background-color:#f7d29b; font-weight:bold; border:1px solid #ccc;">
        <td style="padding:4px 8px;">Gesamtkosten p. a.</td>${zelle(euro(gesamtI))}${zelle(euro(gesamtII))}
      </tr>
    </table>`;

  const amortisationsrechnung =
    `<table style="border:1px solid #ccc; font-size:16px; width:640px; max-width:100%; border-collapse:collapse;">
      <tr style="background-color:#9ec2ec;">
        <th style="width:50%; text-align:left; padding:4px 8px;"></th>
        <th style="width:25%; text-align:left; padding:4px 8px;">Anlage I</th>
        <th style="width:25%; text-align:left; padding:4px 8px;">Anlage II</th>
      </tr>
      ${td('Anschaffungskosten (€)', euro(anlageI), euro(anlageII))}
      ${td('Nutzungsdauer (Jahre)', nutzungsdauer, nutzungsdauer)}
      ${td('Abschreibung pro Jahr (€)', euro(abschreibungI), euro(abschreibungII))}
      ${td('Kalkulatorische Zinsen pro Jahr (€)', euro(zinsenI), euro(zinsenII))}
      ${td('Gewinn pro Jahr (€)', euro(gewinnI), euro(gewinnII))}
      <tr style="background-color:#f7d29b; font-weight:bold; border:1px solid #ccc;">
        <td style="padding:4px 8px;">Amortisationszeit in Jahren</td>${zelle(zahl(zeitI))}${zelle(zahl(zeitII))}
      </tr>
    </table>`;

  const container = document.getElementById('Container');
  container.innerHTML = `
    <h2 style="margin-bottom:6px;">Datenblatt</h2>
    ${datenblatt}
    <h2 class="loesung">Lösung</h2>
    <h3 style="margin-bottom:6px;">Kostenvergleichsrechnung</h3>
    ${kostenvergleich}
    <h3 style="margin-top:14px; margin-bottom:6px;">Amortisationsrechnung</h3>
    ${amortisationsrechnung}
  `;

  // ── Aufgabenstellung + Musterlösung als Text für den KI-Prompt ───────────
  setzeAufgabeKiText(
    `Ein zufälliges Datenblatt mit zwei Anlagen wurde erstellt.\n\n` +
    `Datenblatt:\n` +
    `  Anlage I / Anlage II\n` +
    `  Anschaffungskosten: ${euro(anlageI)} / ${euro(anlageII)}\n` +
    `  Nutzungsdauer: ${nutzungsdauer} Jahre / ${nutzungsdauer} Jahre\n` +
    `  Produktionsmenge: ${menge(quantity)} Teile/Jahr\n` +
    `  Personalkosten pro Stück: ${euro(personalI)} / ${euro(personalII)}\n` +
    `  Materialkosten pro Stück: ${euro(materialI)} / ${euro(materialII)}\n` +
    `  Energiekosten pro Stück: ${euro(energyI)} / ${euro(energyII)}\n` +
    `  Sonstige variable Kosten pro Jahr: ${euro(variableI)} / ${euro(variableII)}\n` +
    `  Sonstige fixe Kosten pro Jahr: ${euro(fixI)} / ${euro(fixII)}\n` +
    `  Kalkulatorischer Zinssatz: ${interest} % / ${interest} %\n` +
    `  Gewinn je Stück: ${euro(profitI)} / ${euro(profitII)}\n\n` +
    `Musterlösung (Kostenvergleichsrechnung):\n` +
    `  Abschreibung pro Jahr: Anschaffungskosten ÷ Nutzungsdauer = ${euro(abschreibungI)} / ${euro(abschreibungII)}\n` +
    `  Kalkulatorische Zinsen pro Jahr: Anschaffungskosten × Zinssatz ÷ 100 ÷ 2 = ${euro(zinsenI)} / ${euro(zinsenII)}\n` +
    `  Summe fixe Kosten p. a.: ${euro(summeFixI)} / ${euro(summeFixII)}\n` +
    `  Personalkosten: Menge × Stückkosten = ${euro(vgzI)} / ${euro(vgzII)}\n` +
    `  Materialkosten: ${euro(vgmI)} / ${euro(vgmII)}\n` +
    `  Energiekosten: ${euro(vgeI)} / ${euro(vgeII)}\n` +
    `  Summe variable Kosten p. a.: ${euro(summeVariableI)} / ${euro(summeVariableII)}\n` +
    `  Gesamtkosten p. a.: ${euro(gesamtI)} / ${euro(gesamtII)}\n\n` +
    `Musterlösung (Amortisationsrechnung):\n` +
    `  Abschreibung pro Jahr: ${euro(abschreibungI)} / ${euro(abschreibungII)}\n` +
    `  Kalkulatorische Zinsen pro Jahr: ${euro(zinsenI)} / ${euro(zinsenII)}\n` +
    `  Gewinn pro Jahr: Menge × Gewinn je Stück = ${euro(gewinnI)} / ${euro(gewinnII)}\n` +
    `  Amortisationszeit in Jahren = Anschaffungskosten ÷ (Abschreibung + Zinsen + Gewinn):\n` +
    `  Anlage I: ${euro(anlageI)} ÷ (${euro(abschreibungI)} + ${euro(zinsenI)} + ${euro(gewinnI)}) = ${zahl(zeitI)}\n` +
    `  Anlage II: ${euro(anlageII)} ÷ (${euro(abschreibungII)} + ${euro(zinsenII)} + ${euro(gewinnII)}) = ${zahl(zeitII)}`
  );

  letzteAufgabe = null;
  const col = document.getElementById('button-column');
  if (col) col.innerHTML = '';
}

// ============================================================================
// AUFGABENTYP 1b: ANSCHAFFUNG EINER PRODUKTIONSMASCHINE (AMORTISATIONSZEIT)
// (nach Vorlage BwR 9.2 "Amortisationsrechnung" – ohne Foto)
// ============================================================================

function generiereProduktionsmaschine() {
  // ── Unternehmen + Inhaber aus der YAML ──────────────────────────────────
  const kundeSelect = document.getElementById('irKunde');
  const kundenName = kundeSelect && kundeSelect.value ? kundeSelect.value.trim() : '';
  const u = getUnternehmen(kundenName);
  const inhaber = (u && u.inhaber) ? u.inhaber : '<i>[Inhaber]</i>';
  const unternehmensName = (u && u.name) ? u.name : '<i>[Modellunternehmen]</i>';

  // ── Maschine + Lieferer ──────────────────────────────────────────────────
  const art = { n: 'Produktionsmaschine', plural: 'Produktionsmaschinen', g: 'f' };
  const lieferer = getMaschinenLieferer().sort(() => Math.random() - 0.5);
  const maschinenLiefererPool = lieferer.map(c => c.unternehmen);
  const l1 = maschinenLiefererPool.length > 0
    ? maschinenLiefererPool[0]
    : { name: 'Maschinenbau KG', adresse: { ort: 'München' } };
  const modell = MASCHINEN_MODELLE[Math.floor(Math.random() * MASCHINEN_MODELLE.length)];

  // ── Zahlen ───────────────────────────────────────────────────────────────
  const absch = randTo(500, 3000, 25000);        // Abschreibungsbetrag pro Jahr
  const nd = randInt(8, 20);                     // Nutzungsdauer (Jahre)
  const ak = absch * nd;                         // Anschaffungskosten (glatt)
  const zinsSatz = randInt(5, 12) / 2;           // 2,5–6,0 % in 0,5er-Schritten
  const zins = ak * zinsSatz / 200;              // kalk. Zinsen (durchschn. Kapital)
  const gewinn = randTo(500, 8000, 40000);       // Gewinn pro Jahr

  // ── Lösung selbst berechnen ──────────────────────────────────────────────
  const amort = ak / (absch + zins + gewinn);

  // ── Aufgabentext ─────────────────────────────────────────────────────────
  const einleitung =
    `Aufgrund der guten Auftragslage plant <strong>${inhaber}</strong> von ` +
    `<strong>${unternehmensName}</strong> die Anschaffung einer zusätzlichen ` +
    `Produktionsmaschine. In der engeren Auswahl ist das Modell ` +
    `<strong>&bdquo;${modell}&ldquo;</strong>:`;

  // ── Datenblatt (eine Maschine) ───────────────────────────────────────────
  function zeile(label, wert) {
    return `<tr style="border:1px solid #999;">
      <td style="padding:4px 8px;">${label}</td>
      <td style="padding:4px 8px; text-align:right; white-space:nowrap;">${wert}</td>
    </tr>`;
  }

  const datenblatt =
    `<table style="border:1px solid #999; font-size:16px; width:560px; max-width:100%; border-collapse:collapse;">
      <tr style="background-color:#6b7f99; color:#fff; font-weight:bold;">
        <td colspan="2" style="padding:6px 8px; text-align:center;">${modell}</td>
      </tr>
      ${zeile('Anschaffungskosten', euro(ak))}
      ${zeile('Nutzungsdauer', nd + ' Jahre')}
      ${zeile('Kalkulatorischer Zinssatz', String(zinsSatz).replace('.', ',') + ' %')}
      ${zeile('Gewinn pro Jahr', euro(gewinn))}
    </table>`;

  // ── Lösung ───────────────────────────────────────────────────────────────
  const loesung =
    `Abschreibung pro Jahr in Euro: ${bruch(betragOhneEuro(ak), nd)} &nbsp;=&nbsp;<strong>${euro(absch)}</strong> &#10004;<br><br>` +
    `Kalkulatorische Zinsen pro Jahr in Euro: ${bruch(betragOhneEuro(ak) + ' · ' + String(zinsSatz).replace('.', ','), '100 · 2')} &nbsp;=&nbsp;<strong>${euro(zins)}</strong> &#10004;<br><br>` +
    `Amortisationszeit in Jahren: ${bruch(betragOhneEuro(ak), `(${betragOhneEuro(absch)} + ${betragOhneEuro(zins)} + ${betragOhneEuro(gewinn)})`)} &nbsp;=&nbsp;<strong>${zahl(amort)}</strong> &#10004;`;

  // ── HTML zusammensetzen ──────────────────────────────────────────────────
  const container = document.getElementById('Container');
  container.innerHTML = `
    <h2>Aufgabe: Amortisationszeit</h2>
    <h3>Berechne die Amortisationszeit für die Produktionsmaschine &bdquo;${modell}&ldquo;.</h3>
    <div style="background:#fff; border:1px solid #dde3ea; border-radius:8px;
                padding:14px 18px; margin-bottom:12px; font-size:16px; line-height:1.7;">
      ${einleitung}
    </div>
    ${datenblatt}
    <h2 class="loesung">Lösung</h2>
    <div style="background:#fff; border:1px solid #dde3ea; border-radius:8px;
                padding:12px 18px; margin-top:12px; font-size:16px; line-height:1.7;">
      ${loesung}
    </div>
  `;

  // ── Aufgabenstellung + Musterlösung als Text für den KI-Prompt ───────────
  setzeAufgabeKiText(
    `Aufgrund der guten Auftragslage plant ${inhaber} von ${unternehmensName} ` +
    `die Anschaffung einer zusätzlichen Produktionsmaschine. In der engeren ` +
    `Auswahl ist das Modell „${modell}".\n\n` +
    `${modell}\n` +
    `  Anschaffungskosten: ${euro(ak)}\n` +
    `  Nutzungsdauer: ${nd} Jahre\n` +
    `  Kalkulatorischer Zinssatz: ${String(zinsSatz).replace('.', ',')} %\n` +
    `  Gewinn pro Jahr: ${euro(gewinn)}\n\n` +
    `Berechne die Amortisationszeit für die Produktionsmaschine „${modell}".\n\n` +
    `Musterlösung:\n` +
    `Abschreibung pro Jahr in Euro = ${euro(ak)} ÷ ${nd} = ${euro(absch)}\n` +
    `Kalkulatorische Zinsen pro Jahr in Euro = (${euro(ak)} · ${String(zinsSatz).replace('.', ',')}) ÷ (100 · 2) = ${euro(zins)}\n` +
    `Amortisationszeit in Jahren = ${euro(ak)} ÷ (${euro(absch)} + ${euro(zins)} + ${euro(gewinn)}) = ${zahl(amort)}`
  );

  // ── Beleg (Eingangsrechnung des Lieferers) ───────────────────────────────
  letzteAufgabe = {
    art,
    anbieter: [
      { nummer: 1, ak, modell, lieferer: l1.name },
    ],
  };
  renderBelegButtons();
}

// ============================================================================
// AUFGABEN-DISPATCH
// ============================================================================

function generiereAufgabe() {
  const sel = document.getElementById('irAufgabe');
  const art = sel ? sel.value : 'ersatzmaschine';
  letzteArt = art;
  if (art === 'datenblatt') {
    generiereDatenblatt();
  } else if (art === 'produktionsmaschine') {
    generiereProduktionsmaschine();
  } else if (art === 'produktionsmaschine_ext') {
    generiereProduktionsmaschineErweitert();
  } else if (art === 'kostenvergleich') {
    generiereKostenvergleichsrechnung();
  } else if (art === 'angebotsvergleich') {
    generiereAngebotsvergleich();
  } else {
    generiereErsatzmaschine();
  }
}

// ============================================================================
// KI-ASSISTENT
// ============================================================================

// Prompt-Vorlage mit Platzhalter „###AUFGABEN und LOESUNGEN###" – bei der
// Übergabe wird dort die aktuell generierte Aufgabe inkl. Musterlösung
// eingesetzt (derselbe Mechanismus wie auf den anderen Generator-Seiten).
const KI_ASSISTENT_PROMPT = `Du bist ein freundlicher Lernassistent für Schülerinnen und Schüler der Realschule (BwR). Du hilfst beim Verständnis der Investitionsrechnung (Amortisationsrechnung, Kostenvergleichsrechnung).

Sprich die Schülerinnen und Schüler immer mit „du" an.

Aufgabe:
- Gib die vom Modellunternehmen erstellte Aufgabe an den Schüler weiter – so, wie sie vor dir liegt.
- Gib KEINE fertigen Lösungen vor, solange der Schüler nicht selbst gerechnet hat.
- Führe den Schüler durch gezielte Fragen zur richtigen Rechnung.
- Ziel: Lernförderung, nicht das Abnehmen der Denkarbeit.

Pädagogischer Ansatz:
- Der Schüler soll die Aufgabe selbst lösen: Lasse ihn zuerst formulieren, welche Werte er für die Rechnung braucht.
- Stelle gezielte Rückfragen, um den Stand des Schülers zu verstehen (Welcher Wert wird abgeschrieben? Was ist das durchschnittliche gebundene Kapital?).
- Beantworte deine Rückfragen nicht selbst.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung (z. B. kalkulatorische Zinsen = Anschaffungskosten × Zinssatz ÷ 100 ÷ 2, weil auf das durchschnittlich gebundene Kapital abgestellt wird).
- Erst wenn der Schüler die Rechnung selbst erarbeitet hat, vergleichst du sie schrittweise mit der unten stehenden Musterlösung.

Begrüße den Schüler freundlich und gib ihm die folgende Aufgabe vor.
Arbeitsauftrag: „Bearbeite die unten stehende Aufgabe. Führe alle Rechenschritte nachvollziehbar durch und runde kaufmännisch auf zwei Nachkommastellen."

Aufgabe mit Lösung:

###AUFGABEN und LOESUNGEN###

Wichtige Formeln:
- Abschreibung pro Jahr = Anschaffungskosten ÷ Nutzungsdauer in Jahren
- Kalkulatorische Zinsen pro Jahr = Anschaffungskosten × Zinssatz (%) ÷ 100 ÷ 2
- Amortisationszeit in Jahren = Anschaffungskosten ÷ (Abschreibung pro Jahr + kalkulatorische Zinsen pro Jahr + Gewinn pro Jahr)

Typische Fehler der Schüler:
- Die kalkulatorischen Zinsen auf die vollen Anschaffungskosten statt auf das durchschnittlich gebundene Kapital (die Hälfte) beziehen
- Den Gewinn pro Jahr in der Rechnung vergessen
- Abschreibung, Zinsen und Gewinn summieren statt aufteilen, oder falsch umstellen
- Ergebnisse nicht kaufmännisch auf zwei Nachkommastellen runden

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe – du-Ansprache
- Einfache Sprache, keine Fachbegriffe ohne Erklärung
- Kurze Antworten – maximal 1–2 Sätze pro Nachricht
- Gelegentlich Emojis 💶⏱️🔍❓✅

Am Ende einer erfolgreich gelösten Übung:
- Frage immer: „Möchtest du noch eine weitere Aufgabe üben?"

Du wartest stets auf die Eingabe des Schülers und gibst nichts vor.`;

// ============================================================================
// AUGABENTEXT FÜR DEN KI-PROMPT (Aufgabenstellung + Musterlösung als Text)
// ============================================================================

// Zuletzt generierte Aufgabe (Aufgabenstellung + Musterlösung) als Plain-Text
let letzteAufgabeKiText = null;

function setzeAufgabeKiText(text) {
  letzteAufgabeKiText = text;
  const vorschauEl = document.getElementById('kiPromptVorschau');
  if (vorschauEl) {
    vorschauEl.textContent = erstelleKiPromptText();
  }
}

function erstelleKiPromptText() {
  return KI_ASSISTENT_PROMPT.replace('###AUFGABEN und LOESUNGEN###',
    letzteAufgabeKiText || '(Noch keine Aufgabe generiert.)');
}

function kopiereKiPrompt() {
  navigator.clipboard.writeText(erstelleKiPromptText()).then(() => {
    const btn = document.getElementById('kiPromptKopierenBtn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Kopiert!`;
    btn.classList.add('ki-prompt-btn--success');
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.classList.remove('ki-prompt-btn--success');
    }, 2500);
  }).catch(err => {
    console.error('Fehler beim Kopieren:', err);
    zeigeModal('Kopieren nicht möglich. Bitte manuell aus dem Textfeld kopieren.');
  });
}

function toggleKiPromptVorschau() {
  const vorschau = document.getElementById('kiPromptVorschau');
  const btn = document.getElementById('kiPromptToggleBtn');
  const isHidden = getComputedStyle(vorschau).display === 'none';
  if (isHidden) {
    vorschau.style.display = 'block';
    btn.textContent = 'Vorschau ausblenden ▲';
  } else {
    vorschau.style.display = 'none';
    btn.textContent = 'Prompt anzeigen ▼';
  }
}

// ============================================================================
// INITIALISIERUNG
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  const kundeSelect = document.getElementById('irKunde');

  if (kundeSelect && kundeSelect.value) {
    kunde = kundeSelect.value.trim();
  }

  if (kundeSelect) {
    kundeSelect.addEventListener('change', (ev) => {
      kunde = ev.target.value.trim() || '<i>[Modellunternehmen]</i>';
      generiereAufgabe();   // Aufgabe + Beleg-Buttons für das neue Unternehmen neu generieren
    });
  }

  const aufgabSelect = document.getElementById('irAufgabe');
  if (aufgabSelect) {
    aufgabSelect.addEventListener('change', () => {
      generiereAufgabe();   // Bei Wechsel des Aufgabentyps sofort neue Aufgabe
    });
  }

  // Dropdown befüllen → Modellunternehmen wählen → Aufgabe generieren,
  // sobald die YAML-Daten tatsächlich geladen sind
  if (typeof yamlData !== 'undefined' && yamlData && yamlData.length > 0) {
    fillCompanyDropdowns();
    autoSelectMyCompany();
    generiereAufgabe();
  } else {
    document.addEventListener('yamlDataLoaded', () => {
      fillCompanyDropdowns();
      autoSelectMyCompany();
      generiereAufgabe();
    }, { once: true });
  }

  const vorschauEl = document.getElementById('kiPromptVorschau');
  if (vorschauEl) {
    vorschauEl.textContent = erstelleKiPromptText();
  }
});
