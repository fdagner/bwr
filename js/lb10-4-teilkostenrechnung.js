// ============================================================================
// GLOBALE VARIABLEN
// ============================================================================

let yamlData = [];
let kunde = '<i>[Modellunternehmen]</i>';

// ============================================================================
// YAML-DATEN LADEN
// ============================================================================

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
  }
}

function loadYamlFromLocalStorage() {
  const saved = localStorage.getItem('uploadedYamlCompanyData');
  if (saved) {
    try {
      yamlData = JSON.parse(saved);
      mergeUserCompaniesIntoYamlData();
      document.dispatchEvent(new Event('yamlDataLoaded'));
      return true;
    } catch (err) {
      console.warn("localStorage YAML kaputt:", err);
    }
  }
  return false;
}

function loadDefaultYaml() {
  fetch('js/unternehmen.yml')
    .then(res => {
      if (!res.ok) throw new Error('unternehmen.yml nicht gefunden');
      return res.text();
    })
    .then(yamlText => {
      yamlData = jsyaml.load(yamlText) || [];
      if (!localStorage.getItem('standardYamlData')) {
        localStorage.setItem('standardYamlData', JSON.stringify(yamlData));
      }
      mergeUserCompaniesIntoYamlData();
      document.dispatchEvent(new Event('yamlDataLoaded'));
    })
    .catch(err => {
      console.error("Konnte unternehmen.yml nicht laden:", err);
    });
}

// ============================================================================
// DROPDOWN BEFÜLLEN
// ============================================================================

function fillCompanyDropdowns() {
  if (!yamlData || yamlData.length === 0) return;

  const sortedCompanies = [...yamlData].sort((a, b) => {
    const brancheA = a.unternehmen?.branche || '';
    const brancheB = b.unternehmen?.branche || '';
    if (brancheA !== brancheB) return brancheA.localeCompare(brancheB);
    return (a.unternehmen?.name || '').localeCompare(b.unternehmen?.name || '');
  });

  const kundeSelect = document.getElementById('tkKunde');
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

// ============================================================================
// HILFSFUNKTIONEN
// ============================================================================

function randInt(min, max, step = 1) {
  const steps = Math.floor((max - min) / step);
  return min + Math.floor(Math.random() * (steps + 1)) * step;
}

function fmt(n) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtInt(n) {
  return n.toLocaleString('de-DE').replace(/\./g, ' ');
}

function getVal(id) {
  return document.getElementById(id)?.value?.trim() || '';
}

function getNum(id, fallback = 0) {
  return parseFloat(document.getElementById(id)?.value) || fallback;
}

// Gemeinsame Eingaben lesen
function leseEingaben() {
  return {
    unternehmen: getVal('tkKunde') || 'Muster GmbH',
    p1:          getVal('prod1') || 'Produkt A',
    p2:          getVal('prod2') || 'Produkt B',
    erzArt:      getVal('erzeugnisArt') || 'Fertigerzeugnisse',
    nvpMin:      getNum('nvpMin', 50),
    nvpMax:      getNum('nvpMax', 200),
    vkMin:       getNum('vkMin', 20),
    vkMax:       getNum('vkMax', 150),
    mengeMin:    getNum('mengeMin', 500),
    mengeMax:    getNum('mengeMax', 6000),
    fixMin:      getNum('fixMin', 50000),
    fixMax:      getNum('fixMax', 300000),
    mengeStep:   parseInt(getVal('mengeRunden')) || 500,
    fixStep:     parseInt(getVal('fixRunden')) || 1000,
  };
}

// Zufälliges NVP/VK-Paar erzeugen (VK < NVP garantiert)
function erzeugePreisPaar(nvpMin, nvpMax, vkMin, vkMax) {
  let nvp, vk, tries = 0;
  do {
    nvp = randInt(nvpMin, nvpMax);
    vk  = randInt(vkMin, Math.min(vkMax, nvp - 1));
    tries++;
  } while (nvp <= vk && tries < 100);
  return { nvp, vk };
}

// ============================================================================
// INLINE-STIL-STRINGS (nur für #Container-Output)
// ============================================================================

const S = {
  table:       'border-collapse:collapse; width:100%; font-size:0.93rem; margin:12px 0;',
  tableNarrow: 'border-collapse:collapse; width:auto; font-size:0.93rem; margin-top:10px;',
  thL:  'border:1px solid #aaa; padding:6px 10px; text-align:left;  background:#dde6f5;',
  thR:  'border:1px solid #aaa; padding:6px 10px; text-align:right; background:#dde6f5;',
  tdL:  'border:1px solid #aaa; padding:6px 10px; text-align:left;',
  tdR:  'border:1px solid #aaa; padding:6px 10px; text-align:right;',
  tdL2: 'border:1px solid #aaa; padding:6px 10px; text-align:left;  background:#f9f9f9;',
  tdR2: 'border:1px solid #aaa; padding:6px 10px; text-align:right; background:#f9f9f9;',
  tdDbL: 'border:1px solid #aaa; border-top:2px solid #aaa; padding:6px 10px; text-align:left;  background:#eef2fa; font-weight:600;',
  tdDbR: 'border:1px solid #aaa; border-top:2px solid #aaa; padding:6px 10px; text-align:right; background:#eef2fa; font-weight:600;',
  tdFkL: 'border:1px solid #aaa; padding:6px 10px; text-align:left;  color:#555;',
  tdFkR: 'border:1px solid #aaa; padding:6px 10px; text-align:right; color:#555;',
  tdBeL: 'border:1px solid #aaa; border-top:2px solid #555; padding:6px 10px; text-align:left;  background:#d0dff5; font-weight:700;',
  tdBeR: 'border:1px solid #aaa; border-top:2px solid #555; padding:6px 10px; text-align:right; background:#d0dff5;',
  // Gesuchte Zelle (Preisuntergrenze – hervorgehoben)
  tdGesuchtR: 'border:2px solid #1a56a0; padding:6px 10px; text-align:right; background:#fff8e1; font-weight:600; color:#1a56a0;',
  aufgabenBox: 'border:1px solid #ccc; border-radius:5px; padding:14px 18px; margin-bottom:18px;',
  hinweisBox:  'background:#fff8e1; border:1px solid #f0c040; border-radius:5px; padding:10px 14px; margin:10px 0 14px; font-size:0.92em;',
  rechenweg:   'margin-top:10px; font-size:0.88em; color:#555;',
  h2output:    'font-size:1.1rem; margin:0 0 12px 0; padding-bottom:6px; border-bottom:2px solid #1a56a0; color:#1a56a0;',
  loesBadge:   (color) => `display:inline-block; background:${color}; color:#fff; border-radius:3px; padding:1px 7px; font-size:0.82em; font-weight:600; margin-left:6px; vertical-align:middle;`,
};

// ============================================================================
// DISPATCHER
// ============================================================================

function generiereAufgabe() {
  const variante = getVal('tkVariante') || 'betriebsergebnis';
  switch (variante) {
    case 'preisuntergrenze':
      generierePreisuntergrenze();
      break;
    case 'nettoverkaufserloes':
      generiereNettoverkaufserloes();
      break;
    case 'fixkosten':
      generiereFixkosten();
      break;
    case 'zusatzauftrag':
      generiereZusatzauftrag();
      break;
    default:
      generiereBetriebsergebnis();
  }
}

// ============================================================================
// VARIANTE 1 – BETRIEBSERGEBNIS
// ============================================================================

function generiereBetriebsergebnis() {
  const e = leseEingaben();

  const { nvp: nvp1, vk: vk1 } = erzeugePreisPaar(e.nvpMin, e.nvpMax, e.vkMin, e.vkMax);
  const { nvp: nvp2, vk: vk2 } = erzeugePreisPaar(e.nvpMin, e.nvpMax, e.vkMin, e.vkMax);

  const menge1    = randInt(e.mengeMin, e.mengeMax, e.mengeStep);
  const menge2    = randInt(e.mengeMin, e.mengeMax, e.mengeStep);
  const fixKosten = randInt(e.fixMin, e.fixMax, e.fixStep);

  const nve1      = nvp1 * menge1;
  const nve2      = nvp2 * menge2;
  const gesamtVK1 = vk1 * menge1;
  const gesamtVK2 = vk2 * menge2;
  const db1       = nve1 - gesamtVK1;
  const db2       = nve2 - gesamtVK2;
  const gesamtDB  = db1 + db2;
  const be        = gesamtDB - fixKosten;

  const quartal   = zufallsQuartal();
  const istGewinn = be >= 0;
  const beLabel   = istGewinn ? 'Gewinn' : 'Verlust';
  const beColor   = istGewinn ? '#2a7a2a' : '#a00';

  const container = document.getElementById('Container');
  if (!container) return;

  container.innerHTML =
    `<h2 style="${S.h2output}">Aufgabe – Betriebsergebnis</h2>` +

    `<div style="${S.aufgabenBox}">` +
      `<p style="margin-bottom:10px;">Das Unternehmen <strong>„${e.unternehmen}"</strong> stellt ${e.erzArt} her. ` +
      `Für das <strong>${quartal}</strong> liegen Ihnen folgende Zahlen vor:</p>` +
      datentabelle(e.p1, e.p2, nvp1, nvp2, vk1, vk2, menge1, menge2, fixKosten) +
    `</div>` +

    `<p style="margin-bottom:6px;"><strong>Aufgabe:</strong> Berechnen Sie das Betriebsergebnis für das ${quartal}.</p>` +

    `<div style="margin-top:28px;">` +
    `<h2 style="${S.h2output}">Lösung</h2>` +
    loesungsSchema(
      e.p1, e.p2,
      menge1, menge2,
      nve1, nve2,
      gesamtVK1, gesamtVK2,
      db1, db2, gesamtDB,
      fixKosten,
      `<strong>Betriebsergebnis (${beLabel})</strong>`,
      `<strong style="color:${beColor};">${fmt(be)}</strong>`,
      ''
    ) +
    `<div style="${S.rechenweg}">` +
      `<strong>Rechenweg:</strong> ` +
      `NVE ${e.p1}: ${fmtInt(menge1)} × ${fmt(nvp1)} = ${fmt(nve1)} € &nbsp;|&nbsp; ` +
      `NVE ${e.p2}: ${fmtInt(menge2)} × ${fmt(nvp2)} = ${fmt(nve2)} € &nbsp;|&nbsp; ` +
      `VK ${e.p1}: ${fmtInt(menge1)} × ${fmt(vk1)} = ${fmt(gesamtVK1)} € &nbsp;|&nbsp; ` +
      `VK ${e.p2}: ${fmtInt(menge2)} × ${fmt(vk2)} = ${fmt(gesamtVK2)} € &nbsp;|&nbsp; ` +
      `DB gesamt: ${fmt(db1)} + ${fmt(db2)} = ${fmt(gesamtDB)} € &nbsp;|&nbsp; ` +
      `BE: ${fmt(gesamtDB)} − ${fmt(fixKosten)} = <strong>${fmt(be)} €</strong>` +
    `</div>` +
    `</div>`;
}

// ============================================================================
// VARIANTE 2 – LANGFRISTIGE PREISUNTERGRENZE
// Betriebsergebnis = 0 → Gesamtdeckungsbeitrag = Fixkosten
// Für ein zufälliges Produkt (gesucht) wird der NVP berechnet.
// Das andere Produkt (bekannt) hat vollständige Daten inkl. NVP.
// ============================================================================

function generierePreisuntergrenze() {
  const e = leseEingaben();

  // Bekanntes Produkt: vollständige Daten inklusive NVP
  const { nvp: nvpB, vk: vkB } = erzeugePreisPaar(e.nvpMin, e.nvpMax, e.vkMin, e.vkMax);
  const mengeB    = randInt(e.mengeMin, e.mengeMax, e.mengeStep);
  const fixKosten = randInt(e.fixMin, e.fixMax, e.fixStep);

  const nveB      = nvpB * mengeB;
  const gesamtVKB = vkB * mengeB;
  const dbB       = nveB - gesamtVKB;

  // Gesuchtes Produkt: VK und Menge bekannt, NVP gesucht
  // dbG muss so sein, dass dbB + dbG = fixKosten → dbG = fixKosten - dbB
  // Außerdem: dbG > 0, damit NVP > VK (sinnvolle Aufgabe)
  // → wir stellen sicher dass fixKosten > dbB
  let vkG, mengeG, dbG, nveG, nvpG_exakt;
  let tries = 0;
  do {
    vkG    = randInt(e.vkMin, e.vkMax);
    mengeG = randInt(e.mengeMin, e.mengeMax, e.mengeStep);
    dbG         = fixKosten - dbB;       // benötigter DB des gesuchten Produkts
    nveG        = vkG * mengeG + dbG;   // NVE des gesuchten Produkts
    nvpG_exakt  = nveG / mengeG;         // exakter gesuchter NVP
    tries++;
  } while ((dbG <= 0 || nvpG_exakt <= vkG) && tries < 200);

  // Falls kein sinnvolles Paar gefunden → Fixkosten hochsetzen und nochmal
  // (Fallback: fixKosten neu würfeln bis dbG > 0)
  if (dbG <= 0 || nvpG_exakt <= vkG) {
    // Einfacher Fallback: bekanntes Produkt neu mit kleinerem DB
    return generierePreisuntergrenze();
  }

  // Zufällig entscheiden, welches Produkt p1 und welches p2 ist
  const gesuchterIstP1 = Math.random() < 0.5;

  const p1    = e.p1;
  const p2    = e.p2;
  const pGes  = gesuchterIstP1 ? p1 : p2;   // gesuchtes Produkt
  const pBek  = gesuchterIstP1 ? p2 : p1;   // bekanntes Produkt

  // Werte für Ausgabe sortiert nach p1/p2
  const nvp1  = gesuchterIstP1 ? null   : nvpB;
  const nvp2  = gesuchterIstP1 ? nvpB   : null;
  const vk1   = gesuchterIstP1 ? vkG    : vkB;
  const vk2   = gesuchterIstP1 ? vkB    : vkG;
  const menge1 = gesuchterIstP1 ? mengeG : mengeB;
  const menge2 = gesuchterIstP1 ? mengeB : mengeG;

  // Berechnungswerte für Lösung
  const nve1_loes    = gesuchterIstP1 ? nveG          : nveB;
  const nve2_loes    = gesuchterIstP1 ? nveB          : nveG;
  const gVK1_loes    = gesuchterIstP1 ? vkG * mengeG  : gesamtVKB;
  const gVK2_loes    = gesuchterIstP1 ? gesamtVKB     : vkG * mengeG;
  const db1_loes     = gesuchterIstP1 ? dbG           : dbB;
  const db2_loes     = gesuchterIstP1 ? dbB           : dbG;
  const gesamtDB_loes = db1_loes + db2_loes; // = fixKosten

  const quartal = zufallsQuartal();

  const container = document.getElementById('Container');
  if (!container) return;

  // Datentabelle für Aufgabenstellung (NVP des gesuchten Produkts = „?")
  const aufgabeTabelle =
    `<table style="${S.tableNarrow}">` +
      `<thead><tr>` +
        `<th style="${S.thL}">Modell</th>` +
        `<th style="${S.thR}">„${p1}"</th>` +
        `<th style="${S.thR}">„${p2}"</th>` +
      `</tr></thead>` +
      `<tbody>` +
        `<tr>` +
          `<td style="${S.tdL}">Nettoverkaufspreis pro Stück</td>` +
          `<td style="${gesuchterIstP1 ? S.tdGesuchtR : S.tdR}">${nvp1 !== null ? fmt(nvp1) + ' €' : '<strong>?</strong>'}</td>` +
          `<td style="${gesuchterIstP1 ? S.tdR : S.tdGesuchtR}">${nvp2 !== null ? fmt(nvp2) + ' €' : '<strong>?</strong>'}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL2}">Variable Kosten pro Stück</td>` +
          `<td style="${S.tdR2}">${fmt(vk1)} €</td>` +
          `<td style="${S.tdR2}">${fmt(vk2)} €</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL}">Produktion ≙ Absatz</td>` +
          `<td style="${S.tdR}">${fmtInt(menge1)} Stück</td>` +
          `<td style="${S.tdR}">${fmtInt(menge2)} Stück</td>` +
        `</tr>` +
        `<tr>` +
          `<td colspan="3" style="${S.tdL}">Fixkosten gesamt: ${fmt(fixKosten)} €</td>` +
        `</tr>` +
      `</tbody>` +
    `</table>`;

  // Lösungsschema: NVP-Zeile des gesuchten Produkts bleibt leer in der Datentabelle,
  // dafür eigene Zeile „Langfristige Preisuntergrenze" am Ende
  const loesBE_label = `Betriebsergebnis (= 0, da Preisuntergrenze)`;

  // Lösungstabelle: NVE des gesuchten Produkts hervorgehoben
  const nveBekannt  = gesuchterIstP1 ? nve2_loes : nve1_loes;
  const nveGesucht  = gesuchterIstP1 ? nve1_loes : nve2_loes;
  const gVKBekannt  = gesuchterIstP1 ? gVK2_loes : gVK1_loes;
  const gVKGesucht  = gesuchterIstP1 ? gVK1_loes : gVK2_loes;
  const dbBekannt   = gesuchterIstP1 ? db2_loes  : db1_loes;
  const dbGesucht   = gesuchterIstP1 ? db1_loes  : db2_loes;

  const loesungsTabelle =
    `<table style="${S.table}">` +
      `<thead><tr>` +
        `<th style="${S.thL}"></th>` +
        `<th style="${S.thR}">Modell „${p1}"<br><span style="font-weight:400; font-size:0.85em;">(${fmtInt(menge1)} Stück)<br>in €</span></th>` +
        `<th style="${S.thR}">Modell „${p2}"<br><span style="font-weight:400; font-size:0.85em;">(${fmtInt(menge2)} Stück)<br>in €</span></th>` +
        `<th style="${S.thR}">gesamt<br><span style="font-weight:400; font-size:0.85em;">in €</span></th>` +
      `</tr></thead>` +
      `<tbody>` +
        `<tr>` +
          `<td style="${S.tdL}">Nettoverkaufserlöse</td>` +
          `<td style="${gesuchterIstP1 ? S.tdGesuchtR : S.tdR}">${fmt(nve1_loes)}</td>` +
          `<td style="${gesuchterIstP1 ? S.tdR : S.tdGesuchtR}">${fmt(nve2_loes)}</td>` +
          `<td style="${S.tdR}"></td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL2}"><span style="color:#555; font-size:0.85rem;">–</span> variable Kosten</td>` +
          `<td style="${S.tdR2}">${fmt(gVK1_loes)}</td>` +
          `<td style="${S.tdR2}">${fmt(gVK2_loes)}</td>` +
          `<td style="${S.tdR2}"></td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdDbL}">Deckungsbeitrag</td>` +
          `<td style="${S.tdDbR}">${fmt(db1_loes)}</td>` +
          `<td style="${S.tdDbR}">${fmt(db2_loes)}</td>` +
          `<td style="${S.tdDbR}">${fmt(gesamtDB_loes)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdFkL}"><span style="font-size:0.85rem;">–</span> Fixkosten</td>` +
          `<td style="${S.tdFkR}"></td>` +
          `<td style="${S.tdFkR}"></td>` +
          `<td style="${S.tdFkR}">${fmt(fixKosten)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdBeL}"><strong>${loesBE_label}</strong></td>` +
          `<td style="${S.tdBeR}"></td>` +
          `<td style="${S.tdBeR}"></td>` +
          `<td style="${S.tdBeR} font-weight:700; color:#2a7a2a;"><strong>0,00</strong></td>` +
        `</tr>` +
      `</tbody>` +
    `</table>`;

  // Ergebnis-Zeile: NVP des gesuchten Produkts
  const ergebnisZeile =
    `<div style="margin-top:14px; padding:10px 14px; background:#e8f0fe; border:1px solid #b0c4ef; border-radius:5px; font-size:0.97em;">` +
      `<strong>Langfristige Preisuntergrenze für „${pGes}":</strong><br>` +
      `NVE<sub>${pGes}</sub> = Gesamtdeckungsbeitrag − DB<sub>${pBek}</sub> + variable Kosten<sub>${pGes}</sub><br>` +
      `NVE<sub>${pGes}</sub> = ${fmt(fixKosten)} − ${fmt(gesuchterIstP1 ? dbB : dbB)} + ${fmt(vkG * mengeG)} = ${fmt(nveG)} €<br>` +
      `<strong>NVP<sub>${pGes}</sub> = NVE<sub>${pGes}</sub> ÷ Menge = ${fmt(nveG)} ÷ ${fmtInt(mengeG)} = <span style="color:#1a56a0;">${fmt(nvpG_exakt)} €</span></strong>` +
    `</div>`;

  // Rechenweg
  const rechenwegText =
    `NVE ${pBek}: ${fmtInt(mengeB)} × ${fmt(nvpB)} = ${fmt(nveB)} € &nbsp;|&nbsp; ` +
    `VK ${pBek}: ${fmtInt(mengeB)} × ${fmt(vkB)} = ${fmt(gesamtVKB)} € &nbsp;|&nbsp; ` +
    `DB ${pBek}: ${fmt(nveB)} − ${fmt(gesamtVKB)} = ${fmt(dbB)} € &nbsp;|&nbsp; ` +
    `Benötigter DB ${pGes}: ${fmt(fixKosten)} − ${fmt(dbB)} = ${fmt(dbG)} € &nbsp;|&nbsp; ` +
    `NVE ${pGes}: ${fmt(vkG * mengeG)} + ${fmt(dbG)} = ${fmt(nveG)} € &nbsp;|&nbsp; ` +
    `NVP ${pGes}: ${fmt(nveG)} ÷ ${fmtInt(mengeG)} = <strong>${fmt(nvpG_exakt)} €</strong>`;

  container.innerHTML =
    `<h2 style="${S.h2output}">Aufgabe – Langfristige Preisuntergrenze</h2>` +

    `<div style="${S.aufgabenBox}">` +
      `<p style="margin-bottom:8px;">Das Unternehmen <strong>„${e.unternehmen}"</strong> stellt ${e.erzArt} her. ` +
      `Für das <strong>${quartal}</strong> liegen Ihnen folgende Zahlen vor:</p>` +
      aufgabeTabelle +
    `</div>` +

    `<p style="margin-bottom:6px;"><strong>Aufgabe</strong><br>Berechnen Sie die langfristige Preisuntergrenze für „${pGes}".</p>` +

    `<div style="margin-top:28px;">` +
    `<h2 style="${S.h2output}">Lösung</h2>` +
    loesungsTabelle +
    ergebnisZeile +
    `<div style="${S.rechenweg}">` +
      `<strong>Rechenweg:</strong> ` + rechenwegText +
    `</div>` +
    `</div>`;
}

// ============================================================================
// VARIANTE 3 – NETTOVERKAUFSERLÖSE
// Betriebsergebnis (Gewinn) ist gegeben.
// Von einem zufälligen Produkt fehlen die NVE (und damit der NVP/Stk.).
// Gesucht: NVE gesamt und NVP pro Stück des gesuchten Produkts.
// ============================================================================

function generiereNettoverkaufserloes() {
  const e = leseEingaben();

  // Bekanntes Produkt: vollständige Daten
  const { nvp: nvpB, vk: vkB } = erzeugePreisPaar(e.nvpMin, e.nvpMax, e.vkMin, e.vkMax);
  const mengeB    = randInt(e.mengeMin, e.mengeMax, e.mengeStep);
  const nveB      = nvpB * mengeB;
  const gesamtVKB = vkB * mengeB;
  const dbB       = nveB - gesamtVKB;

  // Gesuchtes Produkt: VK und Menge bekannt, NVE/NVP gesucht
  const vkG    = randInt(e.vkMin, e.vkMax);
  const mengeG = randInt(e.mengeMin, e.mengeMax, e.mengeStep);
  const fixKosten = randInt(e.fixMin, e.fixMax, e.fixStep);

  // Gewinn zufällig wählen (positiv, rund)
  const fixStep = parseInt(getVal('fixRunden')) || 1000;
  const gewinn  = randInt(fixStep, Math.round(fixKosten * 0.4), fixStep);

  // Rückrechnung: NVE gesuchtes Produkt
  // BE = gesamtDB - fixKosten = gewinn
  // gesamtDB = gewinn + fixKosten
  // dbG = gesamtDB - dbB = gewinn + fixKosten - dbB
  // nveG = dbG + gesamtVKG
  const gesamtDB  = gewinn + fixKosten;
  const dbG       = gesamtDB - dbB;
  const gesamtVKG = vkG * mengeG;
  const nveG      = dbG + gesamtVKG;
  const nvpG      = nveG / mengeG;

  // Prüfen ob sinnvoll (nvpG > vkG, nveG > 0)
  if (dbG <= 0 || nvpG <= vkG) {
    return generiereNettoverkaufserloes();
  }

  // Zufällig welches Produkt p1 / p2 ist
  const gesuchterIstP1 = Math.random() < 0.5;
  const p1 = e.p1;
  const p2 = e.p2;
  const pGes = gesuchterIstP1 ? p1 : p2;
  const pBek = gesuchterIstP1 ? p2 : p1;

  const nvp1   = gesuchterIstP1 ? null  : nvpB;
  const nvp2   = gesuchterIstP1 ? nvpB  : null;
  const vk1    = gesuchterIstP1 ? vkG   : vkB;
  const vk2    = gesuchterIstP1 ? vkB   : vkG;
  const menge1 = gesuchterIstP1 ? mengeG : mengeB;
  const menge2 = gesuchterIstP1 ? mengeB : mengeG;

  const nve1_loes  = gesuchterIstP1 ? nveG : nveB;
  const nve2_loes  = gesuchterIstP1 ? nveB : nveG;
  const gVK1_loes  = gesuchterIstP1 ? gesamtVKG : gesamtVKB;
  const gVK2_loes  = gesuchterIstP1 ? gesamtVKB : gesamtVKG;
  const db1_loes   = gesuchterIstP1 ? dbG : dbB;
  const db2_loes   = gesuchterIstP1 ? dbB : dbG;

  const quartal = zufallsQuartal();

  const container = document.getElementById('Container');
  if (!container) return;

  // Aufgabentabelle: NVE-Zeile fehlt beim gesuchten Produkt (NVP = „?")
  const aufgabeTabelle =
    `<table style="${S.tableNarrow}">` +
      `<thead><tr>` +
        `<th style="${S.thL}">Modell</th>` +
        `<th style="${S.thR}">„${p1}"</th>` +
        `<th style="${S.thR}">„${p2}"</th>` +
      `</tr></thead>` +
      `<tbody>` +
        `<tr>` +
          `<td style="${S.tdL}">Nettoverkaufspreis pro Stück</td>` +
          `<td style="${gesuchterIstP1 ? S.tdGesuchtR : S.tdR}">${nvp1 !== null ? fmt(nvp1) + ' €' : '<strong>?</strong>'}</td>` +
          `<td style="${gesuchterIstP1 ? S.tdR : S.tdGesuchtR}">${nvp2 !== null ? fmt(nvp2) + ' €' : '<strong>?</strong>'}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL2}">Variable Kosten pro Stück</td>` +
          `<td style="${S.tdR2}">${fmt(vk1)} €</td>` +
          `<td style="${S.tdR2}">${fmt(vk2)} €</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL}">Produktion ≙ Absatz</td>` +
          `<td style="${S.tdR}">${fmtInt(menge1)} Stück</td>` +
          `<td style="${S.tdR}">${fmtInt(menge2)} Stück</td>` +
        `</tr>` +
        `<tr>` +
          `<td colspan="3" style="${S.tdL}">Fixkosten gesamt: ${fmt(fixKosten)} €</td>` +
        `</tr>` +
        `<tr>` +
          `<td colspan="3" style="${S.tdL}">Betriebsergebnis (Gewinn): ${fmt(gewinn)} €</td>` +
        `</tr>` +
      `</tbody>` +
    `</table>`;

  // Lösungsschema
  const loesungsTabelle =
    `<table style="${S.table}">` +
      `<thead><tr>` +
        `<th style="${S.thL}"></th>` +
        `<th style="${S.thR}">Modell „${p1}"<br><span style="font-weight:400; font-size:0.85em;">(${fmtInt(menge1)} Stück)<br>in €</span></th>` +
        `<th style="${S.thR}">Modell „${p2}"<br><span style="font-weight:400; font-size:0.85em;">(${fmtInt(menge2)} Stück)<br>in €</span></th>` +
        `<th style="${S.thR}">gesamt<br><span style="font-weight:400; font-size:0.85em;">in €</span></th>` +
      `</tr></thead>` +
      `<tbody>` +
        `<tr>` +
          `<td style="${S.tdL}">Nettoverkaufserlöse</td>` +
          `<td style="${gesuchterIstP1 ? S.tdGesuchtR : S.tdR}">${fmt(nve1_loes)}</td>` +
          `<td style="${gesuchterIstP1 ? S.tdR : S.tdGesuchtR}">${fmt(nve2_loes)}</td>` +
          `<td style="${S.tdR}"></td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL2}"><span style="color:#555; font-size:0.85rem;">–</span> variable Kosten</td>` +
          `<td style="${S.tdR2}">${fmt(gVK1_loes)}</td>` +
          `<td style="${S.tdR2}">${fmt(gVK2_loes)}</td>` +
          `<td style="${S.tdR2}"></td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdDbL}">Deckungsbeitrag</td>` +
          `<td style="${S.tdDbR}">${fmt(db1_loes)}</td>` +
          `<td style="${S.tdDbR}">${fmt(db2_loes)}</td>` +
          `<td style="${S.tdDbR}">${fmt(gesamtDB)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdFkL}"><span style="font-size:0.85rem;">–</span> Fixkosten</td>` +
          `<td style="${S.tdFkR}"></td>` +
          `<td style="${S.tdFkR}"></td>` +
          `<td style="${S.tdFkR}">${fmt(fixKosten)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdBeL}"><strong>Betriebsergebnis (Gewinn)</strong></td>` +
          `<td style="${S.tdBeR}"></td>` +
          `<td style="${S.tdBeR}"></td>` +
          `<td style="${S.tdBeR} color:#2a7a2a; font-weight:700;"><strong>${fmt(gewinn)}</strong></td>` +
        `</tr>` +
      `</tbody>` +
    `</table>`;

  const ergebnisZeile =
    `<div style="margin-top:14px; padding:10px 14px; background:#e8f0fe; border:1px solid #b0c4ef; border-radius:5px; font-size:0.97em;">` +
      `<strong>Nettoverkaufspreis pro Stück für „${pGes}":</strong><br>` +
      `NVE<sub>${pGes}</sub> = ${fmt(nveG)} €<br>` +
      `<strong>NVP<sub>${pGes}</sub> = NVE<sub>${pGes}</sub> ÷ Menge = ${fmt(nveG)} ÷ ${fmtInt(mengeG)} = <span style="color:#1a56a0;">${fmt(nvpG)} €</span></strong>` +
    `</div>`;

  const rechenwegText =
    `NVE ${pBek}: ${fmtInt(mengeB)} × ${fmt(nvpB)} = ${fmt(nveB)} € &nbsp;|&nbsp; ` +
    `VK ${pBek}: ${fmtInt(mengeB)} × ${fmt(vkB)} = ${fmt(gesamtVKB)} € &nbsp;|&nbsp; ` +
    `DB ${pBek}: ${fmt(nveB)} − ${fmt(gesamtVKB)} = ${fmt(dbB)} € &nbsp;|&nbsp; ` +
    `Gesamt-DB: ${fmt(gewinn)} + ${fmt(fixKosten)} = ${fmt(gesamtDB)} € &nbsp;|&nbsp; ` +
    `DB ${pGes}: ${fmt(gesamtDB)} − ${fmt(dbB)} = ${fmt(dbG)} € &nbsp;|&nbsp; ` +
    `VK ${pGes}: ${fmtInt(mengeG)} × ${fmt(vkG)} = ${fmt(gesamtVKG)} € &nbsp;|&nbsp; ` +
    `NVE ${pGes}: ${fmt(dbG)} + ${fmt(gesamtVKG)} = ${fmt(nveG)} € &nbsp;|&nbsp; ` +
    `NVP ${pGes}: ${fmt(nveG)} ÷ ${fmtInt(mengeG)} = <strong>${fmt(nvpG)} €</strong>`;

  container.innerHTML =
    `<h2 style="${S.h2output}">Aufgabe – Nettoverkaufserlöse</h2>` +

    `<div style="${S.aufgabenBox}">` +
      `<p style="margin-bottom:8px;">Das Unternehmen <strong>„${e.unternehmen}"</strong> stellt ${e.erzArt} her. ` +
      `Für das <strong>${quartal}</strong> liegen Ihnen folgende Zahlen vor:</p>` +
      aufgabeTabelle +
    `</div>` +

    `<p style="margin-bottom:6px;"><strong>Aufgabe</strong><br>Berechnen Sie die Nettoverkaufserlöse sowie den Nettoverkaufspreis pro Stück für „${pGes}".</p>` +

    `<div style="margin-top:28px;">` +
    `<h2 style="${S.h2output}">Lösung</h2>` +
    loesungsTabelle +
    ergebnisZeile +
    `<div style="${S.rechenweg}">` +
      `<strong>Rechenweg:</strong> ` + rechenwegText +
    `</div>` +
    `</div>`;
}

// ============================================================================
// VARIANTE 4 – FIXKOSTEN
// Alle Produktdaten inkl. NVP sind gegeben, Betriebsergebnis (Gewinn/Verlust)
// ist bekannt. Fixkosten sind unbekannt und sollen berechnet werden.
// Fixkosten = Gesamtdeckungsbeitrag − Betriebsergebnis
// ============================================================================

function generiereFixkosten() {
  const e = leseEingaben();

  const { nvp: nvp1, vk: vk1 } = erzeugePreisPaar(e.nvpMin, e.nvpMax, e.vkMin, e.vkMax);
  const { nvp: nvp2, vk: vk2 } = erzeugePreisPaar(e.nvpMin, e.nvpMax, e.vkMin, e.vkMax);

  const menge1    = randInt(e.mengeMin, e.mengeMax, e.mengeStep);
  const menge2    = randInt(e.mengeMin, e.mengeMax, e.mengeStep);

  const nve1      = nvp1 * menge1;
  const nve2      = nvp2 * menge2;
  const gesamtVK1 = vk1 * menge1;
  const gesamtVK2 = vk2 * menge2;
  const db1       = nve1 - gesamtVK1;
  const db2       = nve2 - gesamtVK2;
  const gesamtDB  = db1 + db2;

  // Betriebsergebnis zufällig – Gewinn oder Verlust, gerundet
  const fixStep   = parseInt(getVal('fixRunden')) || 1000;
  // BE liegt zwischen -30% und +40% des Gesamt-DB, damit Fixkosten positiv & realistisch
  const beMin     = -Math.round(gesamtDB * 0.3);
  const beMax     =  Math.round(gesamtDB * 0.4);
  const be        = randInt(beMin, beMax, fixStep);

  const fixKosten = gesamtDB - be;   // immer positiv durch obige Grenzen

  const istGewinn = be >= 0;
  const beLabel   = istGewinn ? 'Gewinn' : 'Verlust';
  const beColor   = istGewinn ? '#2a7a2a' : '#a00';

  const quartal   = zufallsQuartal();

  const container = document.getElementById('Container');
  if (!container) return;

  // Aufgabentabelle: vollständige Produktdaten + BE gegeben, Fixkosten = „?"
  const aufgabeTabelle =
    `<table style="${S.tableNarrow}">` +
      `<thead><tr>` +
        `<th style="${S.thL}">Modell</th>` +
        `<th style="${S.thR}">„${e.p1}"</th>` +
        `<th style="${S.thR}">„${e.p2}"</th>` +
      `</tr></thead>` +
      `<tbody>` +
        `<tr>` +
          `<td style="${S.tdL}">Nettoverkaufspreis pro Stück</td>` +
          `<td style="${S.tdR}">${fmt(nvp1)} €</td>` +
          `<td style="${S.tdR}">${fmt(nvp2)} €</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL2}">Variable Kosten pro Stück</td>` +
          `<td style="${S.tdR2}">${fmt(vk1)} €</td>` +
          `<td style="${S.tdR2}">${fmt(vk2)} €</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL}">Produktion ≙ Absatz</td>` +
          `<td style="${S.tdR}">${fmtInt(menge1)} Stück</td>` +
          `<td style="${S.tdR}">${fmtInt(menge2)} Stück</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL}">Fixkosten gesamt</td>` +
          `<td colspan="2" style="${S.tdGesuchtR}"><strong>?</strong></td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL}">Betriebsergebnis (${beLabel})</td>` +
          `<td colspan="2" style="${S.tdR}">${fmt(be)} €</td>` +
        `</tr>` +
      `</tbody>` +
    `</table>`;

  // Lösungsschema
  const loesungsTabelle =
    `<table style="${S.table}">` +
      `<thead><tr>` +
        `<th style="${S.thL}"></th>` +
        `<th style="${S.thR}">Modell „${e.p1}"<br><span style="font-weight:400; font-size:0.85em;">(${fmtInt(menge1)} Stück)<br>in €</span></th>` +
        `<th style="${S.thR}">Modell „${e.p2}"<br><span style="font-weight:400; font-size:0.85em;">(${fmtInt(menge2)} Stück)<br>in €</span></th>` +
        `<th style="${S.thR}">gesamt<br><span style="font-weight:400; font-size:0.85em;">in €</span></th>` +
      `</tr></thead>` +
      `<tbody>` +
        `<tr>` +
          `<td style="${S.tdL}">Nettoverkaufserlöse</td>` +
          `<td style="${S.tdR}">${fmt(nve1)}</td>` +
          `<td style="${S.tdR}">${fmt(nve2)}</td>` +
          `<td style="${S.tdR}"></td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL2}"><span style="color:#555; font-size:0.85rem;">–</span> variable Kosten</td>` +
          `<td style="${S.tdR2}">${fmt(gesamtVK1)}</td>` +
          `<td style="${S.tdR2}">${fmt(gesamtVK2)}</td>` +
          `<td style="${S.tdR2}"></td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdDbL}">Deckungsbeitrag</td>` +
          `<td style="${S.tdDbR}">${fmt(db1)}</td>` +
          `<td style="${S.tdDbR}">${fmt(db2)}</td>` +
          `<td style="${S.tdDbR}">${fmt(gesamtDB)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdFkL}"><span style="font-size:0.85rem;">–</span> Fixkosten</td>` +
          `<td style="${S.tdFkR}"></td>` +
          `<td style="${S.tdFkR}"></td>` +
          `<td style="${S.tdGesuchtR}">${fmt(fixKosten)}</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdBeL}"><strong>Betriebsergebnis (${beLabel})</strong></td>` +
          `<td style="${S.tdBeR}"></td>` +
          `<td style="${S.tdBeR}"></td>` +
          `<td style="${S.tdBeR} color:${beColor}; font-weight:700;"><strong>${fmt(be)}</strong></td>` +
        `</tr>` +
      `</tbody>` +
    `</table>`;

  const rechenwegText =
    `NVE ${e.p1}: ${fmtInt(menge1)} × ${fmt(nvp1)} = ${fmt(nve1)} € &nbsp;|&nbsp; ` +
    `NVE ${e.p2}: ${fmtInt(menge2)} × ${fmt(nvp2)} = ${fmt(nve2)} € &nbsp;|&nbsp; ` +
    `VK ${e.p1}: ${fmtInt(menge1)} × ${fmt(vk1)} = ${fmt(gesamtVK1)} € &nbsp;|&nbsp; ` +
    `VK ${e.p2}: ${fmtInt(menge2)} × ${fmt(vk2)} = ${fmt(gesamtVK2)} € &nbsp;|&nbsp; ` +
    `DB gesamt: ${fmt(db1)} + ${fmt(db2)} = ${fmt(gesamtDB)} € &nbsp;|&nbsp; ` +
    `Fixkosten: ${fmt(gesamtDB)} − ${fmt(be)} = <strong>${fmt(fixKosten)} €</strong>`;

  container.innerHTML =
    `<h2 style="${S.h2output}">Aufgabe – Fixkosten</h2>` +

    `<div style="${S.aufgabenBox}">` +
      `<p style="margin-bottom:8px;">Das Unternehmen <strong>„${e.unternehmen}"</strong> stellt ${e.erzArt} her. ` +
      `Für das <strong>${quartal}</strong> liegen Ihnen folgende Zahlen vor:</p>` +
      aufgabeTabelle +
    `</div>` +

    `<p style="margin-bottom:6px;"><strong>Aufgabe</strong><br>Berechnen Sie die Fixkosten des Unternehmens.</p>` +

    `<div style="margin-top:28px;">` +
    `<h2 style="${S.h2output}">Lösung</h2>` +
    loesungsTabelle +
    `<div style="${S.rechenweg}">` +
      `<strong>Rechenweg:</strong> ` + rechenwegText +
    `</div>` +
    `</div>`;
}



// ============================================================================
// VARIANTE 5 – ZUSATZAUFTRAG
// Normales Betriebsergebnis ist gegeben (alle Daten für P1 + P2 + Fixkosten).
// Ein Geschäftskunde möchte eine zusätzliche Menge von P1 ODER P2 zu einem
// rabattierten NVP abnehmen. Da die Fixkosten bereits gedeckt sind, reicht
// ein positiver Deckungsbeitrag pro Stück zur Annahme.
// ============================================================================

function generiereZusatzauftrag() {
  const e = leseEingaben();

  const { nvp: nvp1, vk: vk1 } = erzeugePreisPaar(e.nvpMin, e.nvpMax, e.vkMin, e.vkMax);
  const { nvp: nvp2, vk: vk2 } = erzeugePreisPaar(e.nvpMin, e.nvpMax, e.vkMin, e.vkMax);
  const menge1    = randInt(e.mengeMin, e.mengeMax, e.mengeStep);
  const menge2    = randInt(e.mengeMin, e.mengeMax, e.mengeStep);
  const fixKosten = randInt(e.fixMin, e.fixMax, e.fixStep);

  // Reguläres Betriebsergebnis
  const nve1      = nvp1 * menge1;
  const nve2      = nvp2 * menge2;
  const gesamtVK1 = vk1 * menge1;
  const gesamtVK2 = vk2 * menge2;
  const db1       = nve1 - gesamtVK1;
  const db2       = nve2 - gesamtVK2;
  const gesamtDB  = db1 + db2;
  const be        = gesamtDB - fixKosten;
  const istGewinn = be >= 0;

  // Zusatzauftrag: zufälliges Produkt
  const zusatzIstP1 = Math.random() < 0.5;
  const pZ     = zusatzIstP1 ? e.p1 : e.p2;
  const nvpZ   = zusatzIstP1 ? nvp1 : nvp2;
  const vkZ    = zusatzIstP1 ? vk1  : vk2;
  const dbNormal = nvpZ - vkZ;

  // Zusatzmenge
const mengeZ = Math.max(
  1000,
  Math.round(
    randInt(
      Math.round(e.mengeMin / 2),
      Math.round(e.mengeMax / 2),
      e.mengeStep
    ) / 1000
  ) * 1000
);

  // ── KAPAZITÄT ────────────────────────────────────────────────────────────
  // Gesamtauslastung normal = menge1 + menge2
  // Kapazität: in ~30 % der Fälle zu knapp für Zusatzauftrag → nur rein rechnerische Ablehnung
  const normalAuslastung = menge1 + menge2;
  const knappeKapazitaet = Math.random() < 0.30;

  let kapazitaet, kapazitaetFrei, kapazitaetReicht;
  if (knappeKapazitaet) {
    // Kapazität so wählen, dass freie Kapazität < mengeZ
    const maxFreiKnapp = Math.max(0, mengeZ - e.mengeStep);
    const freiKnapp    = randInt(0, maxFreiKnapp, e.mengeStep);
    kapazitaet         = normalAuslastung + freiKnapp;
    kapazitaetFrei     = freiKnapp;
    kapazitaetReicht   = false;
  } else {
    // Kapazität so wählen, dass freie Kapazität >= mengeZ
    const freiAusreichend = randInt(mengeZ, mengeZ + e.mengeMax / 2, e.mengeStep);
    kapazitaet            = normalAuslastung + freiAusreichend;
    kapazitaetFrei        = freiAusreichend;
    kapazitaetReicht      = true;
  }

  // ── RABATT & DB ──────────────────────────────────────────────────────────
  // Nur wenn Kapazität reicht: Outcome-first 25 % Ablehnung wegen negativem DB
  // Wenn Kapazität nicht reicht: DB trotzdem berechnen (bleibt oft positiv, aber irrelevant)
  const sollAblehnenDB = kapazitaetReicht && Math.random() < 0.25;
  let rabattPct, nvpZrabatt, dbZStk;

  if (sollAblehnenDB) {
    const minRabatt = Math.ceil((dbNormal / nvpZ) * 100 / 5) * 5 + 5;
    const maxRabatt = Math.min(minRabatt + 20, 60);
    rabattPct  = maxRabatt >= minRabatt ? randInt(minRabatt, maxRabatt, 5) : minRabatt;
    nvpZrabatt = Math.round(nvpZ * (1 - rabattPct / 100) * 100) / 100;
    dbZStk     = Math.round((nvpZrabatt - vkZ) * 100) / 100;
  } else {
    const maxSichererRabatt = Math.floor((dbNormal / nvpZ) * 100 / 5) * 5 - 5;
    const rabattMax = Math.max(5, Math.min(maxSichererRabatt, 25));
    rabattPct  = randInt(5, rabattMax, 5);
    nvpZrabatt = Math.round(nvpZ * (1 - rabattPct / 100) * 100) / 100;
    dbZStk     = Math.round((nvpZrabatt - vkZ) * 100) / 100;
  }

  const nveZgesamt = Math.round(nvpZrabatt * mengeZ * 100) / 100;
  const gesamtVKZ  = vkZ * mengeZ;
  const dbZgesamt  = Math.round(dbZStk * mengeZ * 100) / 100;

  // ── ENTSCHEIDUNGSLOGIK ────────────────────────────────────────────────────
  // Schritt 1: Kapazität prüfen → Schritt 2: DB prüfen (nur wenn Kap. reicht)
  const annehmenDB  = dbZStk > 0;
  const annehmen    = kapazitaetReicht && annehmenDB;

  let kapazitaetBegr, dbBegr, entscheidText, entscheidColor;

  if (!kapazitaetReicht) {
    kapazitaetBegr = `Die freie Kapazität beträgt nur ${fmtInt(kapazitaetFrei)} Stück – der Zusatzauftrag über ${fmtInt(mengeZ)} Stück <strong>kann nicht produziert werden</strong>.`;
    dbBegr         = `(DB/Stk. wäre ${fmt(dbZStk)} € – rechnerisch ${annehmenDB ? 'positiv' : 'negativ'}, aber irrelevant da keine Kapazität.)`;
    entscheidText  = `Der Zusatzauftrag <strong>muss abgelehnt werden</strong>, da die Produktionskapazität nicht ausreicht (freie Kapazität: ${fmtInt(kapazitaetFrei)} Stück, benötigt: ${fmtInt(mengeZ)} Stück).`;
    entscheidColor = '#a00';
  } else if (!annehmenDB) {
    kapazitaetBegr = `Die freie Kapazität beträgt ${fmtInt(kapazitaetFrei)} Stück – der Zusatzauftrag über ${fmtInt(mengeZ)} Stück <strong>kann produziert werden</strong>. ✅`;
    dbBegr         = `Dennoch ist der Deckungsbeitrag pro Stück negativ (${fmt(dbZStk)} €) – das Unternehmen würde je Einheit einen Verlust erleiden.`;
    entscheidText  = `Der Zusatzauftrag <strong>soll abgelehnt werden</strong>: Zwar reicht die Kapazität, aber der Deckungsbeitrag pro Stück ist negativ (${fmt(dbZStk)} €).`;
    entscheidColor = '#a00';
  } else {
    kapazitaetBegr = `Die freie Kapazität beträgt ${fmtInt(kapazitaetFrei)} Stück – der Zusatzauftrag über ${fmtInt(mengeZ)} Stück <strong>kann produziert werden</strong>. ✅`;
    dbBegr         = `Der Deckungsbeitrag pro Stück ist positiv (${fmt(dbZStk)} €). Da die Fixkosten bereits gedeckt sind, verbessert jeder positive DB das Betriebsergebnis.`;
    entscheidText  = `Der Zusatzauftrag <strong>soll angenommen werden</strong>: Kapazität reicht aus und der Deckungsbeitrag pro Stück ist positiv (${fmt(dbZStk)} €).`;
    entscheidColor = '#2a7a2a';
  }

  const quartal = zufallsQuartal();
  const kundenarten = ['Ein Geschäftskunde', 'Ein Großhändler', 'Ein Neukunde', 'Ein langjähriger Kunde'];
  const kundeStr = kundenarten[Math.floor(Math.random() * kundenarten.length)];

  const container = document.getElementById('Container');
  if (!container) return;

  const thZusatz = `border:1px solid #aaa; padding:6px 10px; text-align:right; background:#fff8e1;`;
  const tdZgesR  = `border:1px solid #aaa; padding:6px 10px; text-align:right; background:#fff8e1;`;
  const kapFarbeFrei = kapazitaetReicht ? '#2a7a2a' : '#a00';

  // ── AUFGABENTABELLE ───────────────────────────────────────────────────────
  const aufgabeTabelle =
    `<table style="${S.tableNarrow}">` +
      `<thead><tr>` +
        `<th style="${S.thL}">Modell</th>` +
        `<th style="${S.thR}">„${e.p1}"</th>` +
        `<th style="${S.thR}">„${e.p2}"</th>` +
      `</tr></thead>` +
      `<tbody>` +
        `<tr>` +
          `<td style="${S.tdL}">Nettoverkaufspreis pro Stück</td>` +
          `<td style="${S.tdR}">${fmt(nvp1)} €</td>` +
          `<td style="${S.tdR}">${fmt(nvp2)} €</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL2}">Variable Kosten pro Stück</td>` +
          `<td style="${S.tdR2}">${fmt(vk1)} €</td>` +
          `<td style="${S.tdR2}">${fmt(vk2)} €</td>` +
        `</tr>` +
        `<tr>` +
          `<td style="${S.tdL}">Produktion ≙ Absatz</td>` +
          `<td style="${S.tdR}">${fmtInt(menge1)} Stück</td>` +
          `<td style="${S.tdR}">${fmtInt(menge2)} Stück</td>` +
        `</tr>` +
        `<tr>` +
          `<td colspan="4" style="${S.tdL}">Fixkosten gesamt: ${fmt(fixKosten)} €</td>` +
        `</tr>` +
        `<tr>` +
          `<td colspan="4" style="${S.tdL}">Produktionskapazität gesamt: ${fmtInt(kapazitaet)} Stück</td>` +
        `</tr>` +
      `</tbody>` +
    `</table>`;

  // ── LÖSUNGSSCHEMA ─────────────────────────────────────────────────────────
 // ============================================================================
// PATCH v2: generiereZusatzauftrag() – Lösungsschema
// Ersetze den alten "// ── LÖSUNGSSCHEMA ─────"-Block komplett durch diesen.
// ============================================================================

// ── LÖSUNGSSCHEMA ─────────────────────────────────────────────────────────
// Betriebsergebnis mit Zusatzauftrag (für die letzte Zeile der Zusatzspalte)
const gesamtDB_mit = gesamtDB + dbZgesamt;
const be_mit       = gesamtDB_mit - fixKosten;
const be_mit_color = be_mit >= 0 ? '#2a7a2a' : '#a00';

// Trennlinie-Stil: blauer linker Rand markiert die Zusatz-Gesamtspalte
const thZusNeu = `border:1px solid #aaa; padding:6px 10px; text-align:right; background:#fff8e1;`;

const tdZusR   = `border:1px solid #aaa; padding:6px 10px; text-align:right; background:#fff8e1;`;
const tdZusR2  = `border:1px solid #aaa; padding:6px 10px; text-align:right; background:#fffdf0;`;
const tdZusDbR = `border:1px solid #aaa; padding:1px 10px; border-top:2px solid #aaa; text-align:right; background:#fff8e1; font-weight:600;`;
const tdZusFkR = `border:1px solid #aaa; padding:6px 10px; text-align:right; background:#fff8e1; color:#aaa; font-size:0.85em;`;
const tdZusBeR = `border:1px solid #aaa; border-top:2px solid #555; padding:6px 10px; text-align:right; background:#fff3cc; font-weight:700;`;

const loesungsTabelle =
  `<table style="${S.table}">` +
    `<thead>` +
      `<tr>` +
        `<th style="${S.thL}" rowspan="2"></th>` +
        `<th style="${S.thR}">„${e.p1}"<br><span style="font-weight:400; font-size:0.85em;">(${fmtInt(menge1)} Stk.) in €</span></th>` +
        `<th style="${S.thR}">„${e.p2}"<br><span style="font-weight:400; font-size:0.85em;">(${fmtInt(menge2)} Stk.) in €</span></th>` +
        `<th style="${S.thR}">gesamt<br><span style="font-weight:400; font-size:0.85em;">in €</span></th>` +
        `<th style="${thZusNeu}">Zusatz „${pZ}"<br><span style="font-weight:400; font-size:0.85em;">(${fmtInt(mengeZ)} Stk.) in €</span></th>` +
      `</tr>` +
    `</thead>` +
    `<tbody>` +
      /* NVE */
      `<tr>` +
        `<td style="${S.tdL}">Nettoverkaufserlöse</td>` +
        `<td style="${S.tdR}">${fmt(nve1)}</td>` +
        `<td style="${S.tdR}">${fmt(nve2)}</td>` +
        `<td style="${S.tdR}"></td>` +
        `<td style="${tdZusR}">${fmt(nveZgesamt)}</td>` +
      `</tr>` +
      /* variable Kosten */
      `<tr>` +
        `<td style="${S.tdL2}"><span style="color:#555; font-size:0.85rem;">–</span> variable Kosten</td>` +
        `<td style="${S.tdR2}">${fmt(gesamtVK1)}</td>` +
        `<td style="${S.tdR2}">${fmt(gesamtVK2)}</td>` +
        `<td style="${S.tdR2}"></td>` +
        `<td style="${tdZusR2}">${fmt(gesamtVKZ)}</td>` +
      `</tr>` +
      /* Deckungsbeitrag */
      `<tr>` +
        `<td style="${S.tdDbL}">Deckungsbeitrag</td>` +
        `<td style="${S.tdDbR}">${fmt(db1)}</td>` +
        `<td style="${S.tdDbR}">${fmt(db2)}</td>` +
        `<td style="${S.tdDbR}">${fmt(gesamtDB)}</td>` +
        `<td style="${tdZusDbR} color:${annehmenDB ? '#2a7a2a' : '#a00'};">${fmt(dbZgesamt)}</td>` +
      `</tr>` +
      /* Fixkosten */
      `<tr>` +
        `<td style="${S.tdFkL}"><span style="font-size:0.85rem;">–</span> Fixkosten</td>` +
        `<td style="${S.tdFkR}"></td>` +
        `<td style="${S.tdFkR}"></td>` +
        `<td style="${S.tdFkR}">${fmt(fixKosten)}</td>` +
        `<td style="${tdZusFkR}">–</td>` +
      `</tr>` +
      /* Betriebsergebnis Normal */
      `<tr>` +
        `<td style="${S.tdBeL}"><strong>Betriebsergebnis (${istGewinn ? 'Gewinn' : 'Verlust'})</strong></td>` +
        `<td style="${S.tdBeR}"></td>` +
        `<td style="${S.tdBeR}"></td>` +
        `<td style="${S.tdBeR} font-weight:700; color:${istGewinn ? '#2a7a2a' : '#a00'};"><strong>${fmt(be)}</strong></td>` +
        `<td style="${tdZusBeR} color:${be_mit_color};">` +
          `<strong>${fmt(be_mit)}</strong>` +
        `</td>` +
      `</tr>` +
    `</tbody>` +
  `</table>`;

  // ── KAPAZITÄTSPRÜFUNG ─────────────────────────────────────────────────────
  const kapazitaetBox =
    `<div style="margin-top:14px; padding:10px 14px; background:#f5f7fa; border:1px solid #ccc; border-radius:5px; font-size:0.93em;">` +
      `<strong>Schritt 1 – Kapazitätsprüfung:</strong><br>` +
      `Aktuelle Auslastung: ${fmtInt(menge1)} + ${fmtInt(menge2)} = ${fmtInt(normalAuslastung)} Stück<br>` +
      `Freie Kapazität: ${fmtInt(kapazitaet)} − ${fmtInt(normalAuslastung)} = ` +
      `<strong style="color:${kapFarbeFrei};">${fmtInt(kapazitaetFrei)} Stück</strong><br>` +
      `Benötigt: <strong>${fmtInt(mengeZ)} Stück</strong> → ` +
      `<strong style="color:${kapFarbeFrei};">${kapazitaetReicht ? 'Kapazität reicht aus ✅' : 'Kapazität reicht NICHT aus ❌'}</strong>` +
    `</div>`;

  // ── ENTSCHEIDUNGSBOX ──────────────────────────────────────────────────────
  const entscheidungsBox =
    `<div style="margin-top:10px; padding:10px 14px; border:2px solid ${entscheidColor}; border-radius:5px; background:${annehmen ? '#f0fff0' : '#fff0f0'}; font-size:0.97em;">` +
      `<strong style="color:${entscheidColor};">Schritt 2 – Deckungsbeitragsanalyse:</strong><br>` +
      `${kapazitaetBegr}<br>` +
      `${dbBegr}<br><br>` +
      `<strong style="color:${entscheidColor};">Entscheidung: ${entscheidText}</strong>` +
    `</div>`;

  // ── RECHENWEG ─────────────────────────────────────────────────────────────
  const rechenwegText =
    `Freie Kap.: ${fmtInt(kapazitaet)} − ${fmtInt(normalAuslastung)} = ${fmtInt(kapazitaetFrei)} Stück ` +
    `(${kapazitaetReicht ? '≥' : '<'} ${fmtInt(mengeZ)} Stück → ${kapazitaetReicht ? 'reicht' : 'reicht nicht'}) &nbsp;|&nbsp; ` +
    (kapazitaetReicht
      ? `NVP Zusatz: ${fmt(nvpZ)} × ${100 - rabattPct} % = ${fmt(nvpZrabatt)} € &nbsp;|&nbsp; ` +
        `DB/Stk.: ${fmt(nvpZrabatt)} − ${fmt(vkZ)} = ${fmt(dbZStk)} € &nbsp;|&nbsp; ` +
        `DB gesamt: ${fmtInt(mengeZ)} × ${fmt(dbZStk)} = ${fmt(dbZgesamt)} € &nbsp;|&nbsp; ` +
        `→ <strong>${annehmen ? 'annehmen' : 'ablehnen'}</strong>`
      : `→ <strong>ablehnen (keine Kapazität)</strong>`);

  // ── AUSGABE ───────────────────────────────────────────────────────────────
  container.innerHTML =
    `<h2 style="${S.h2output}">Aufgabe – Zusatzauftrag</h2>` +

    `<div style="${S.aufgabenBox}">` +
      `<p style="margin-bottom:8px;">Das Unternehmen <strong>„${e.unternehmen}"</strong> stellt ${e.erzArt} her. ` +
      `Für das <strong>${quartal}</strong> liegen Ihnen folgende Zahlen vor:</p>` +
      aufgabeTabelle +
      `<br><p><strong>Aufgabe</strong></p>` +
      `<ol><li>Berechnen Sie das Betriebsergebnis.</li>` +
      `<li>${kundeStr} wäre bereit, ${fmtInt(mengeZ)} Einheiten von „${pZ}" ` +
      `zu einem Rabatt von ${rabattPct} % abzunehmen.` +
    ` Begründen Sie rechnerisch, ob das Unternehmen den Zusatzauftrag annehmen soll.</li></ol>` +

    `</div>` +
    `<div style="margin-top:28px;">` +
    `<h2 style="${S.h2output}">Lösung</h2>` +
    loesungsTabelle +
    kapazitaetBox +
    entscheidungsBox +
    `<div style="${S.rechenweg}">` +
      `<strong>Rechenweg:</strong> ` + rechenwegText +
    `</div>` +
    `</div>`;
}





function zufallsQuartal() {
  const quartale = ['1. Quartal', '2. Quartal', '3. Quartal', '4. Quartal'];
  return quartale[Math.floor(Math.random() * 4)];
}

function datentabelle(p1, p2, nvp1, nvp2, vk1, vk2, menge1, menge2, fixKosten) {
  return `<table style="${S.tableNarrow}">` +
    `<thead><tr>` +
      `<th style="${S.thL}">Modell</th>` +
      `<th style="${S.thR}">„${p1}"</th>` +
      `<th style="${S.thR}">„${p2}"</th>` +
    `</tr></thead>` +
    `<tbody>` +
      `<tr>` +
        `<td style="${S.tdL}">Nettoverkaufspreis pro Stück</td>` +
        `<td style="${S.tdR}">${fmt(nvp1)} €</td>` +
        `<td style="${S.tdR}">${fmt(nvp2)} €</td>` +
      `</tr>` +
      `<tr>` +
        `<td style="${S.tdL2}">Variable Kosten pro Stück</td>` +
        `<td style="${S.tdR2}">${fmt(vk1)} €</td>` +
        `<td style="${S.tdR2}">${fmt(vk2)} €</td>` +
      `</tr>` +
      `<tr>` +
        `<td style="${S.tdL}">Produktion ≙ Absatz</td>` +
        `<td style="${S.tdR}">${fmtInt(menge1)} Stück</td>` +
        `<td style="${S.tdR}">${fmtInt(menge2)} Stück</td>` +
      `</tr>` +
      `<tr>` +
        `<td colspan="3" style="${S.tdL}">Fixkosten gesamt: ${fmt(fixKosten)} €</td>` +
      `</tr>` +
    `</tbody>` +
  `</table>`;
}

function loesungsSchema(p1, p2, menge1, menge2, nve1, nve2, gVK1, gVK2, db1, db2, gesamtDB, fixKosten, beLabel, beWert, beWertGesamt) {
  return `<table style="${S.table}">` +
    `<thead><tr>` +
      `<th style="${S.thL}"></th>` +
      `<th style="${S.thR}">Modell „${p1}"<br><span style="font-weight:400; font-size:0.85em;">(${fmtInt(menge1)} Stück)<br>in €</span></th>` +
      `<th style="${S.thR}">Modell „${p2}"<br><span style="font-weight:400; font-size:0.85em;">(${fmtInt(menge2)} Stück)<br>in €</span></th>` +
      `<th style="${S.thR}">gesamt<br><span style="font-weight:400; font-size:0.85em;">in €</span></th>` +
    `</tr></thead>` +
    `<tbody>` +
      `<tr>` +
        `<td style="${S.tdL}">Nettoverkaufserlöse</td>` +
        `<td style="${S.tdR}">${fmt(nve1)}</td>` +
        `<td style="${S.tdR}">${fmt(nve2)}</td>` +
        `<td style="${S.tdR}"></td>` +
      `</tr>` +
      `<tr>` +
        `<td style="${S.tdL2}"><span style="color:#555; font-size:0.85rem;">–</span> variable Kosten</td>` +
        `<td style="${S.tdR2}">${fmt(gVK1)}</td>` +
        `<td style="${S.tdR2}">${fmt(gVK2)}</td>` +
        `<td style="${S.tdR2}"></td>` +
      `</tr>` +
      `<tr>` +
        `<td style="${S.tdDbL}">Deckungsbeitrag</td>` +
        `<td style="${S.tdDbR}">${fmt(db1)}</td>` +
        `<td style="${S.tdDbR}">${fmt(db2)}</td>` +
        `<td style="${S.tdDbR}">${fmt(gesamtDB)}</td>` +
      `</tr>` +
      `<tr>` +
        `<td style="${S.tdFkL}"><span style="font-size:0.85rem;">–</span> Fixkosten</td>` +
        `<td style="${S.tdFkR}"></td>` +
        `<td style="${S.tdFkR}"></td>` +
        `<td style="${S.tdFkR}">${fmt(fixKosten)}</td>` +
      `</tr>` +
      `<tr>` +
        `<td style="${S.tdBeL}">${beLabel}</td>` +
        `<td style="${S.tdBeR}"></td>` +
        `<td style="${S.tdBeR}"></td>` +
        `<td style="${S.tdBeR}">${beWert}</td>` +
      `</tr>` +
    `</tbody>` +
  `</table>`;
}

// ============================================================================
// KI-ASSISTENT PROMPT
// ============================================================================

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher, geduldiger Lernbegleiter für Schülerinnen und Schüler der Realschule im Fach BwR (Betriebswirtschaftslehre mit Rechnungswesen).
Dein Thema: Teilkostenrechnung (Deckungsbeitragsrechnung).

Sprich die Schülerinnen und Schüler immer mit „du" an. Bleibe stets ermutigend und auf Augenhöhe.

═══════════════════════════════════════════
DEINE ROLLE
═══════════════════════════════════════════
Du gibst KEINE fertigen Lösungen, Zwischenergebnisse oder Zahlen vor – auch nicht auf Nachfrage.
Stattdessen führst du durch gezielte Rückfragen Schritt für Schritt zur richtigen Lösung.
Erst wenn ein Schritt korrekt beantwortet wurde, bestätigst du ihn und leitest zum nächsten über.
Ziel: Der Schüler erarbeitet die Lösung selbst – du bist der Lotse, nicht die Antwort.

═══════════════════════════════════════════
GRUNDSCHEMA DER TEILKOSTENRECHNUNG
═══════════════════════════════════════════
Für jedes Produkt einzeln:
  Nettoverkaufserlöse (NVE)     = Nettoverkaufspreis (NVP) × Menge
− variable Kosten gesamt (VKg)  = variable Kosten/Stk. × Menge
= Deckungsbeitrag (DB)

Dann gesamt:
  Gesamtdeckungsbeitrag         = DB Produkt 1 + DB Produkt 2
− Fixkosten (gesamt, nur einmal!)
= Betriebsergebnis (Gewinn / Verlust)

Merksatz für Schüler: „Die Fixkosten kommen EINMAL am Ende – nie je Produkt aufteilen!"

═══════════════════════════════════════════
DIE 5 AUFGABENVARIANTEN – LÖSUNGSWEGE
═══════════════════════════════════════════

1) BETRIEBSERGEBNIS
   Alles gegeben → NVE, VKg, DB je Produkt, Gesamt-DB, dann − Fixkosten = BE
   Typischer Fehler: Fixkosten auf Produkte aufteilen statt am Ende abziehen.

2) LANGFRISTIGE PREISUNTERGRENZE
   Bedingung: Betriebsergebnis = 0 → Gesamt-DB = Fixkosten
   Schritte:
   a) NVE und DB des bekannten Produkts berechnen
   b) Benötigter DB (gesuchtes Produkt) = Fixkosten − DB (bekanntes Produkt)
   c) NVE (gesuchtes Produkt) = VKg + benötigter DB
   d) NVP/Stk. = NVE ÷ Menge
   Typischer Fehler: BE vergessen auf 0 zu setzen; direkt mit NVP zu rechnen statt über DB.

3) NETTOVERKAUFSERLÖSE
   Betriebsergebnis (Gewinn) ist gegeben, NVP eines Produkts fehlt.
   Schritte:
   a) Gesamt-DB = Betriebsergebnis + Fixkosten
   b) DB bekanntes Produkt berechnen
   c) DB gesuchtes Produkt = Gesamt-DB − DB bekanntes Produkt
   d) NVE gesuchtes Produkt = VKg + DB gesuchtes Produkt
   e) NVP/Stk. = NVE ÷ Menge
   Typischer Fehler: Gesamt-DB nicht aus BE rückrechnen, sondern einfach schätzen.

4) FIXKOSTEN
   Alles gegeben inkl. Betriebsergebnis, Fixkosten fehlen.
   Schritte: NVE und DB je Produkt berechnen → Gesamt-DB → Fixkosten = Gesamt-DB − BE
   Typischer Fehler: Formel falsch umstellen (BE + Fixkosten = Gesamt-DB vergessen).

5) ZUSATZAUFTRAG
   Ein Kunde möchte eine Zusatzmenge zu einem rabattierten Preis abnehmen.
   Entscheidungsregel: Da Fixkosten bereits durch das Normalgeschäft gedeckt sind,
   reicht ein positiver Deckungsbeitrag pro Stück zur Annahme.
   Schritte:
   a) NVP Zusatz = NVP normal × (1 − Rabatt %)
   b) DB/Stk. Zusatz = NVP Zusatz − variable Kosten/Stk.
   c) DB gesamt Zusatz = DB/Stk. × Zusatzmenge
   d) Entscheidung: DB/Stk. > 0 → annehmen | DB/Stk. < 0 → ablehnen
   Typischer Fehler: Fixkosten nochmals abziehen (sie sind bereits gedeckt!);
   Entscheidung ohne Begründung durch DB/Stk.

═══════════════════════════════════════════
BEGRIFFE EINFACH ERKLÄRT
═══════════════════════════════════════════
- Nettoverkaufspreis: Preis ohne Mehrwertsteuer, den das Unternehmen je Stück bekommt.
- Variable Kosten: Steigen mit der Menge (z. B. Material, Fertigungslohn).
- Fixkosten: Bleiben gleich, egal wie viel produziert wird (z. B. Miete, Gehälter).
- Deckungsbeitrag: Was nach Abzug der variablen Kosten übrig bleibt – zur Deckung der Fixkosten.
- Langfristige Preisuntergrenze: Der Mindestpreis, bei dem das Unternehmen weder Gewinn noch Verlust macht (BE = 0).
- Zusatzauftrag: Ein Sonderauftrag, der extra zu normalen Aufträgen kommt – Fixkosten spielen hier keine Rolle mehr.

═══════════════════════════════════════════
PÄDAGOGISCHER ANSATZ
═══════════════════════════════════════════
- Stelle nach jeder Schülerantwort eine gezielte Folgefrage zum nächsten Schritt.
- Bei einem Fehler: Erkläre das Prinzip dahinter, nenne aber nicht den richtigen Wert.
- Bei richtiger Antwort: Kurz bestätigen, dann direkt weiterleiten.
- Wenn ein Schüler feststeckt: Gib einen konkreten Denkanstoß (z. B. „Was weißt du über den Zusammenhang von Betriebsergebnis und Deckungsbeitrag?").
- Antwortlänge: Maximal 3 Sätze. Lieber kürzer. Gelegentlich Emojis 🎯🧮✅❓

═══════════════════════════════════════════
VERBOTEN
═══════════════════════════════════════════
- Keine konkreten Zahlen aus der Aufgabe als Lösung nennen.
- Kein „Die Antwort ist …" oder „Das Ergebnis lautet …".
- Auch bei wiederholtem Drängen keine Lösung verraten – freundlich standhaft bleiben.
- Keine langen Erklärungen am Stück – immer mit Rückfrage enden.
`;

function kopiereKiPrompt() {
  navigator.clipboard.writeText(KI_ASSISTENT_PROMPT).then(() => {
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
    alert('Kopieren nicht möglich. Bitte manuell aus dem Textfeld kopieren.');
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
  const kundeSelect = document.getElementById('tkKunde');

  if (kundeSelect && kundeSelect.value) {
    kunde = kundeSelect.value.trim();
  }

  kundeSelect.addEventListener('change', () => {
    kunde = kundeSelect.value.trim() || '';
  });

  if (!loadYamlFromLocalStorage()) {
    loadDefaultYaml();
  }

  if (yamlData && yamlData.length > 0) {
    fillCompanyDropdowns();
  } else {
    document.addEventListener('yamlDataLoaded', fillCompanyDropdowns, { once: true });
  }

  const vorschauEl = document.getElementById('kiPromptVorschau');
  if (vorschauEl) {
    vorschauEl.textContent = KI_ASSISTENT_PROMPT;
  }
});

function autoSelectMyCompany() {
  const myCompanyName = localStorage.getItem('myCompany');
  if (!myCompanyName) return;

  const dropdowns = document.querySelectorAll('select.meinUnternehmen');
  dropdowns.forEach(dropdown => {
    const options = Array.from(dropdown.options);
    const matchingOption = options.find(opt => opt.value === myCompanyName);
    if (matchingOption) {
      dropdown.value = myCompanyName;
      const event = new Event('change', { bubbles: true });
      dropdown.dispatchEvent(event);
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    autoSelectMyCompany();
    generiereAufgabe();
  }, 500);
});