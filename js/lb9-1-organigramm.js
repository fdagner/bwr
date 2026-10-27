// ============================================================================
// ORGANIGRAMM-GENERATOR – Einliniensystem / Mehrliniensystem (BwR 9)
// Unternehmen aus js/unternehmen.yml (bzw. localStorage), Inhaber = CEO,
// darunter Abteilungen und Teams mit mehreren Personen, optional Stabsstelle.
// Alle Texte sind im Editor änderbar; der Export läuft über download.js (#Container).
// ============================================================================

const VORNAMEN = ['Anna','Lukas','Sarah','Max','Lena','Ahmet','Marie','Tom','Julia','Tim','Laura','Simon','Sophie','Felix','Emma','Paul','Hannah','Elias','Mia','Noah','Clara','Ben','Lea','Jan','Katharina','Stefan','Medina','Markus','Eren','Ali'];
const NACHNAMEN = ['Konrad','Schmidt','Weber','Bauer','Müller','Wagner','Fischer','Becker','Yilmaz','Trung','Richter','Kaya','Popescu','Schneider','Keller','Vogel','Holomir','Maier','Lang','Krüger','Baumann','Roth','Winter','Ziegler','Yilmaz','Khan','Gruber','Berger'];

const ABTEILUNGEN = [
  { name: 'Verwaltung',     team: 'Verwaltungsteam' },
  { name: 'Einkauf',        team: 'Einkaufsteam' },
  { name: 'Verkauf',        team: 'Verkaufsteam' },
  { name: 'Produktion',     team: 'Produktionsteam' },
  { name: 'Marketing',      team: 'Marketingteam' },
  { name: 'Personal',       team: 'Personalteam' },
  { name: 'Logistik',       team: 'Logistikteam' },
  { name: 'Rechnungswesen', team: 'Buchhaltung' },
];
const STAB_TITEL = [['Stabsstelle', 'Recht'], ['Stabsstelle', 'Controlling'], ['Stabsstelle', 'Qualität'], ['Stabsstelle', 'Datenschutz']];

// Nur Platzhalter, falls weder localStorage noch js/unternehmen.yml Daten liefern
const FALLBACK_UNTERNEHMEN = [
  { unternehmen: { name: 'Konrad Outdoor', rechtsform: 'GmbH', branche: 'Handel', inhaber: 'Anna Konrad' } },
  { unternehmen: { name: 'Fahrradhaus Berger', rechtsform: 'e. K.', branche: 'Handel', inhaber: 'Thomas Berger' } },
];

// Maße der Zeichnung
const GX = 36, GY = 60, M = 24, ZH = 16;

let yamlData = [];
let modell = null;

const $ = id => document.getElementById(id);
const zufall = a => a[Math.floor(Math.random() * a.length)];
const mischen = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function neuePerson(used) {
  let p;
  do { p = zufall(VORNAMEN) + ' ' + zufall(NACHNAMEN); } while (used.has(p));
  used.add(p);
  return p;
}

// ───────────────────────────────────────────────
// Unternehmensdaten (wie im Kreditvergleich: localStorage, sonst js/unternehmen.yml)

function getUserCompanies() {
  try { return JSON.parse(localStorage.getItem('userCompanies')) || []; } catch (e) { return []; }
}

async function ladeUnternehmen() {
  let daten = null;
  try { const s = localStorage.getItem('uploadedYamlCompanyData'); if (s) daten = JSON.parse(s); } catch (e) { /* ignorieren */ }
  if (!daten) {
    try {
      const antwort = await fetch('js/unternehmen.yml');
      if (!antwort.ok) throw new Error('nicht gefunden');
      daten = jsyaml.load(await antwort.text());
    } catch (e) { console.warn('Konnte unternehmen.yml nicht laden:', e); }
  }
  yamlData = [...(Array.isArray(daten) ? daten : []), ...getUserCompanies()].filter(c => c && c.unternehmen && c.unternehmen.name);
  if (!yamlData.length) yamlData = FALLBACK_UNTERNEHMEN;
  yamlData.sort((a, b) => (a.unternehmen.branche || '').localeCompare(b.unternehmen.branche || '') || a.unternehmen.name.localeCompare(b.unternehmen.name));
}

function fuelleUnternehmenDropdown() {
  const sel = $('unternehmen');
  sel.innerHTML = yamlData.map((c, i) => {
    const u = c.unternehmen;
    const text = u.branche ? `${u.branche} – ${u.name} ${u.rechtsform || ''}` : `${u.name} ${u.rechtsform || ''}`;
    return `<option value="${i}">${esc(text.trim())}</option>`;
  }).join('');
  const mein = localStorage.getItem('myCompany');
  const idx = yamlData.findIndex(c => c.unternehmen.name === mein);
  sel.value = idx >= 0 ? idx : 0;
}

// Sucht den Inhaber im Datensatz: Schlüssel wie inhaber, geschäftsführer, ceo, chef (auch verschachtelt)
function findeInhaber(datensatz) {
  const muster = /inhaber|gesch(ä|ae)ftsf(ü|ue)hr|^ceo$|^chef/i;
  const lies = v => {
    if (typeof v === 'string') return v.trim();
    if (Array.isArray(v)) return lies(v[0]);
    if (v && typeof v === 'object') {
      const vor = v.vorname || v.vornamen, nach = v.nachname || v.name;
      return [vor, nach].filter(x => typeof x === 'string').join(' ').trim();
    }
    return '';
  };
  const suche = (o, tiefe) => {
    if (!o || typeof o !== 'object' || tiefe > 3) return '';
    for (const [k, v] of Object.entries(o)) if (muster.test(k)) { const r = lies(v); if (r) return r; }
    for (const v of Object.values(o)) { const r = suche(v, tiefe + 1); if (r) return r; }
    return '';
  };
  return suche(datensatz, 0);
}

// ───────────────────────────────────────────────
// Modell erzeugen

const TIEFE_TEXTE = {
  normal: ['1 (Abteilungen)', '2 (Abteilungen und Teams)', '3 (zusätzlich Sachbearbeitung)'],
  matrix: ['2 Produktbereiche', '3 Produktbereiche', '4 Produktbereiche'],
};

// Bei der Matrixorganisation bestimmt die Auswahl die Zahl der Produktbereiche (Zeilen)
function passeTiefeAn() {
  const matrix = $('typ').value === 'matrix', t = TIEFE_TEXTE[matrix ? 'matrix' : 'normal'];
  [...$('tiefe').options].forEach((o, i) => { o.textContent = t[i]; });
  document.querySelector('label[for="tiefe"]').textContent = matrix ? 'Produktbereiche (Zeilen):' : 'Ebenen unter der Geschäftsleitung:';
}

function erstelleModell() {
  passeTiefeAn();
  const datensatz = yamlData[$('unternehmen').value] || yamlData[0];
  const u = datensatz.unternehmen;
  const typ = $('typ').value, n = +$('anzahl').value, tiefe = +$('tiefe').value, k = +$('personen').value;
  const used = new Set();
  let inhaber = findeInhaber(datensatz);
  $('inhaberHinweis').textContent = inhaber ? '' : 'Im Datensatz wurde kein Inhaber gefunden. Für den CEO wurde ein Zufallsname eingesetzt, Sie können ihn unten ändern.';
  if (!inhaber) inhaber = neuePerson(used);
  used.add(inhaber);
  const personen = () => Array.from({ length: k }, () => neuePerson(used));
  const namenIdx = Array.from({ length: k }, (_, i) => i + 1);
  const abt = mischen(ABTEILUNGEN).slice(0, n);

  const ebenen = [[{ lines: ['CEO', inhaber], namen: [] }]];   // Inhaber bleibt beim Neuwürfeln erhalten
  ebenen.push(abt.map(a => ({ lines: [a.name, 'Leitung', neuePerson(used)], namen: [2] })));
  let produkte = [];
  if (typ === 'matrix') {
    // Zeilen = Produktbereiche, Spalten = Funktionsbereiche; in jedem Kreuzungspunkt ein Team
    const buch = 'ABCD';
    produkte = Array.from({ length: tiefe + 1 }, (_, r) => ({ lines: [`Produktbereich ${buch[r]}`, 'Leitung', neuePerson(used)], namen: [2] }));
    produkte.forEach((pb, r) => ebenen.push(abt.map((a, i) => ({ lines: [`Team ${buch[r]}${i + 1}`, ...personen()], namen: namenIdx }))));
  }
  for (let e = 2; typ !== 'matrix' && e <= tiefe; e++) {
    ebenen.push(abt.map((a, i) => {
      const titel = typ === 'mehr' ? `Team ${i + 1}` : (e === 2 ? a.team : 'Sachbearbeitung');
      return { lines: [titel, ...personen()], namen: namenIdx };
    }));
  }
  const st = zufall(STAB_TITEL);
  modell = { typ, produkte, firma: `${u.name} ${u.rechtsform || ''}`.trim(), ebenen, stab: { lines: [...st, neuePerson(used)], namen: [2] } };
  $('firma').value = modell.firma;
  baueEditor();
  zeichne();
}

function neuePersonen() {
  if (!modell) return;
  const used = new Set([modell.ebenen[0][0].lines[1]]);
  [...modell.ebenen.slice(1).flat(), ...modell.produkte, modell.stab].forEach(nd => nd.namen.forEach(k => { nd.lines[k] = neuePerson(used); }));
  baueEditor();
  zeichne();
}

// ───────────────────────────────────────────────
// Editor

function baueEditor() {
  const el = $('editor');
  el.innerHTML = '';
  const zeile = (titel, node) => {
    const d = document.createElement('div');
    d.className = 'ao-zeile';
    const s = document.createElement('span');
    s.textContent = titel;
    d.appendChild(s);
    node.lines.forEach((t, k) => {
      const i = document.createElement('input');
      i.value = t;
      i.setAttribute('aria-label', `${titel}, Zeile ${k + 1}`);
      i.addEventListener('input', () => { node.lines[k] = i.value; zeichne(); });
      d.appendChild(i);
    });
    el.appendChild(d);
  };
  modell.ebenen.forEach((eb, l) => eb.forEach((nd, i) => zeile(l === 0 ? 'Geschäftsleitung' : `Ebene ${l}, Stelle ${i + 1}`, nd)));
  modell.produkte.forEach((nd, r) => zeile(`Produktbereich ${r + 1}`, nd));
  if ($('stab').checked) zeile('Stabsstelle', modell.stab);
}

// ───────────────────────────────────────────────
// Zeichnung (SVG)

function baueSvg() {
  const typ = modell.typ, mitStab = $('stab').checked, mitTitel = $('titel').checked;
  const matrix = typ === 'matrix', produkte = matrix ? modell.produkte : [];
  const L = modell.ebenen.length, n = modell.ebenen[1].length;

  // Kastenbreite passt sich dem längsten Text an, Kastenhöhe je Ebene der Zeilenzahl
  const alle = [...modell.ebenen.flat(), ...produkte, ...(mitStab ? [modell.stab] : [])];
  const maxLen = Math.max(...alle.flatMap(nd => nd.lines.map(z => z.length)));
  const W = Math.max(160, Math.ceil(maxLen * 7.6) + 24);
  const hL = modell.ebenen.map(eb => Math.max(64, Math.max(...eb.map(nd => nd.lines.length)) * ZH + 24));
  if (mitStab) hL[0] = Math.max(hL[0], modell.stab.lines.length * ZH + 24);

  const top = mitTitel ? 48 : M;
  const yL = []; let acc = top;
  hL.forEach((h, l) => { yL[l] = acc; acc += h + GY; });
  const hoehe = acc - GY + M;

  const pX = M + 36, trunkX = M + 10;                 // Matrix: Spalte der Produktbereiche links
  const x0 = matrix ? pX + W + GX : M;
  const gridW = n * W + (n - 1) * GX;
  const cx = i => x0 + i * (W + GX) + W / 2;
  const ceoX = x0 + (gridW - W) / 2, stabX = ceoX + W + 50;
  const breite = Math.max(x0 + gridW + M, mitStab ? stabX + W + M : 0);

  const ln = 'fill="none" stroke="#000" stroke-width="1.5"';
  const pf = 'marker-end="url(#pfeil)"';
  const box = (x, yy, h, lines, fuellung = '#fff') => {
    const y0 = yy + h / 2 - (lines.length - 1) * ZH / 2 + 5;
    return `<rect x="${x}" y="${yy}" width="${W}" height="${h}" fill="${fuellung}" stroke="#000" stroke-width="2"/>` +
      lines.map((z, k) => `<text x="${x + W / 2}" y="${y0 + k * ZH}" text-anchor="middle"${k === 0 ? ' font-weight="bold"' : ''}>${esc(z)}</text>`).join('');
  };

  // Kanten: Geschäftsleitung → Abteilungen / Funktionsbereiche über eine Sammelschiene
  let kanten = '';
  const mid = yL[0] + hL[0] + GY / 2, c0 = ceoX + W / 2;
  kanten += `<path d="M${c0} ${yL[0] + hL[0]}V${mid}" ${ln}/><path d="M${cx(0)} ${mid}H${cx(n - 1)}" ${ln}/>`;
  for (let i = 0; i < n; i++) kanten += `<path d="M${cx(i)} ${mid}V${yL[1]}" ${ln} ${pf}/>`;

  if (matrix) {
    // Funktionsbereiche weisen spaltenweise an, Produktbereiche zeilenweise
    for (let i = 0; i < n; i++) for (let l = 1; l < L - 1; l++) kanten += `<path d="M${cx(i)} ${yL[l] + hL[l]}V${yL[l + 1]}" ${ln} ${pf}/>`;
    let letzteMitte = 0;
    for (let l = 2; l < L; l++) {
      const my = yL[l] + hL[l] / 2;
      letzteMitte = my;
      kanten += `<path d="M${trunkX} ${my}H${pX}" ${ln} ${pf}/><path d="M${pX + W} ${my}H${x0}" ${ln} ${pf}/>`;
      for (let i = 0; i < n - 1; i++) kanten += `<path d="M${x0 + i * (W + GX) + W} ${my}H${x0 + (i + 1) * (W + GX)}" ${ln} ${pf}/>`;
    }
    kanten += `<path d="M${ceoX} ${yL[0] + hL[0] / 2}H${trunkX}V${letzteMitte}" ${ln}/>`;
  } else {
    // Einlinie = genau ein Vorgesetzter, Mehrlinie = bis zu drei Vorgesetzte
    for (let l = 2; l < L; l++) {
      for (let j = 0; j < n; j++) {
        const von = typ === 'mehr' ? [Math.max(0, j - 1), Math.min(n - 1, j + 1)] : [j, j];
        for (let i = von[0]; i <= von[1]; i++) kanten += `<path d="M${cx(i)} ${yL[l - 1] + hL[l - 1]}L${cx(j)} ${yL[l]}" ${ln} ${pf}/>`;
      }
    }
  }
  if (mitStab) kanten += `<path d="M${ceoX + W} ${yL[0] + hL[0] / 2}H${stabX}" ${ln}/>`;

  let boxen = box(ceoX, yL[0], hL[0], modell.ebenen[0][0].lines);
  modell.ebenen.slice(1).forEach((eb, i) => eb.forEach((nd, j) => { boxen += box(cx(j) - W / 2, yL[i + 1], hL[i + 1], nd.lines); }));
  produkte.forEach((nd, r) => { boxen += box(pX, yL[r + 2], hL[r + 2], nd.lines); });
  if (mitStab) boxen += box(stabX, yL[0], hL[0], modell.stab.lines, '#eeeeee');

  const titel = mitTitel ? `<text x="${M}" y="30" font-size="17" font-weight="bold">${esc(modell.firma)}</text>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${breite} ${hoehe}" width="${breite}" height="${hoehe}" font-family="Arial, Helvetica, sans-serif" font-size="13">` +
    `<defs><marker id="pfeil" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0L10 4L0 8z" fill="#000"/></marker></defs>` +
    `<rect width="100%" height="100%" fill="#fff"/>${titel}${kanten}${boxen}</svg>`;
}

function zeichne() {
  if (modell) $('Container').innerHTML = baueSvg();
}

// ───────────────────────────────────────────────
// Start

async function startOrganigramm() {
  await ladeUnternehmen();
  fuelleUnternehmenDropdown();
  ['unternehmen', 'typ', 'anzahl', 'tiefe', 'personen'].forEach(id => $(id).addEventListener('change', erstelleModell));
  ['stab', 'titel'].forEach(id => $(id).addEventListener('change', () => { baueEditor(); zeichne(); }));
  $('firma').addEventListener('input', () => { modell.firma = $('firma').value; zeichne(); });
  erstelleModell();
}