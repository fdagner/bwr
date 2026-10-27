// ============================================================================
// ORGANIGRAMM-GENERATOR – Einliniensystem / Mehrliniensystem (BwR 9)
// Inhaber des Modellunternehmens = CEO, darunter Abteilungen, Teams, optional Stabsstelle.
// Alle Texte sind im Editor änderbar; Export als SVG oder PNG.
// ============================================================================

const VORNAMEN = ['Anna','Lukas','Sarah','Max','Lena','Jonas','Marie','Tom','Julia','Tim','Laura','Simon','Sophie','Felix','Emma','Paul','Hannah','Elias','Mia','Noah','Clara','Ben','Lea','Jan'];
const NACHNAMEN = ['Konrad','Schmidt','Weber','Bauer','Müller','Wagner','Fischer','Becker','Braun','Hoffmann','Richter','Schulz','Meier','Schneider','Keller','Vogel','Huber','Maier','Lang','Krüger','Baumann','Roth','Winter','Ziegler'];

const ABTEILUNGEN = [
  { name: 'Verwaltung',      team: 'Verwaltungsteam' },
  { name: 'Einkauf',         team: 'Einkaufsteam' },
  { name: 'Verkauf',         team: 'Verkaufsteam' },
  { name: 'Produktion',      team: 'Produktionsteam' },
  { name: 'Marketing',       team: 'Marketingteam' },
  { name: 'Personal',        team: 'Personalteam' },
  { name: 'Logistik',        team: 'Logistikteam' },
  { name: 'Rechnungswesen',  team: 'Buchhaltung' },
];
const STAB_TITEL = [['Stabsstelle', 'Recht'], ['Stabsstelle', 'Controlling'], ['Stabsstelle', 'Qualität'], ['Stabsstelle', 'Datenschutz']];

// Platzhalter – wird durch js/unternehmen.yml ersetzt, sobald sich diese Datei laden lässt
const FALLBACK_UNTERNEHMEN = [
  { firma: 'Konrad Outdoor GmbH',      inhaber: 'Anna Konrad' },
  { firma: 'Fahrradhaus Berger e. K.', inhaber: 'Thomas Berger' },
  { firma: 'Kaiser Möbel GmbH',        inhaber: 'Sabine Kaiser' },
];

// Maße der Zeichnung
const W = 160, H = 64, GX = 36, GY = 60, M = 24, ZH = 16;

let unternehmen = [];
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
// Unternehmen laden (js/unternehmen.yml, sonst Platzhalter)

function normalisiere(daten) {
  const liste = Array.isArray(daten) ? daten : (Object.values(daten || {}).find(Array.isArray) || Object.values(daten || {}));
  return liste.map(e => ({
    firma: e && (e.name || e.firma || e.firmenname || e.unternehmen) || '',
    inhaber: e && [e.inhaber, e.geschaeftsfuehrer, e['geschäftsführer'], e.ceo, e.chef].find(x => typeof x === 'string' && x.trim()) || '',
  })).filter(e => typeof e.firma === 'string' && e.firma);
}

async function ladeUnternehmen() {
  try {
    const antwort = await fetch('js/unternehmen.yml');
    const liste = normalisiere(jsyaml.load(await antwort.text()));
    if (liste.length) { unternehmen = liste; return; }
  } catch (e) { console.warn('unternehmen.yml nicht lesbar, Platzhalter werden verwendet', e); }
  unternehmen = FALLBACK_UNTERNEHMEN;
}

// ───────────────────────────────────────────────
// Modell erzeugen

function erstelleModell() {
  const u = unternehmen[$('unternehmen').value] || unternehmen[0];
  const typ = $('typ').value, n = +$('anzahl').value, tiefe = +$('tiefe').value;
  const used = new Set();
  const inhaber = u.inhaber || neuePerson(used);
  used.add(inhaber);
  const abt = mischen(ABTEILUNGEN).slice(0, n);

  const ebenen = [[{ lines: ['CEO', inhaber], namen: [] }]];   // Inhaber bleibt beim Würfeln erhalten
  ebenen.push(abt.map(a => ({ lines: [a.name, 'Leitung', neuePerson(used)], namen: [2] })));
  for (let e = 2; e <= tiefe; e++) {
    ebenen.push(abt.map(a => {
      if (typ === 'mehr') return { lines: ['Mitarbeiter/-in', neuePerson(used)], namen: [1] };
      if (e === 2) return { lines: [a.team, neuePerson(used), neuePerson(used)], namen: [1, 2] };
      return { lines: ['Sachbearbeitung', neuePerson(used)], namen: [1] };
    }));
  }
  const st = zufall(STAB_TITEL);
  modell = { firma: u.firma, ebenen, stab: { lines: [...st, neuePerson(used)], namen: [2] } };
  $('firma').value = modell.firma;
  baueEditor();
  zeichne();
}

function neuePersonen() {
  if (!modell) return;
  const used = new Set([modell.ebenen[0][0].lines[1]]);
  [...modell.ebenen.slice(1).flat(), modell.stab].forEach(nd => nd.namen.forEach(k => { nd.lines[k] = neuePerson(used); }));
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
  if ($('stab').checked) zeile('Stabsstelle', modell.stab);
}

// ───────────────────────────────────────────────
// Zeichnung (SVG)

function baueSvg() {
  const typ = $('typ').value, mitStab = $('stab').checked, mitTitel = $('titel').checked;
  const L = modell.ebenen.length, n = modell.ebenen[1].length;
  const top = mitTitel ? 48 : M;
  const gridW = n * W + (n - 1) * GX;
  const cx = i => M + i * (W + GX) + W / 2;
  const y = l => top + l * (H + GY);
  const ceoX = M + (gridW - W) / 2, stabX = ceoX + W + 50;
  const breite = Math.max(gridW + 2 * M, mitStab ? stabX + W + M : 0);
  const hoehe = y(L - 1) + H + M;

  const ln = 'fill="none" stroke="#000" stroke-width="1.5"';
  const pf = 'marker-end="url(#pfeil)"';
  const box = (x, yy, lines, fuellung = '#fff') => {
    const y0 = yy + H / 2 - (lines.length - 1) * ZH / 2 + 5;
    return `<rect x="${x}" y="${yy}" width="${W}" height="${H}" fill="${fuellung}" stroke="#000" stroke-width="2"/>` +
      lines.map((z, k) => `<text x="${x + W / 2}" y="${y0 + k * ZH}" text-anchor="middle"${k === 0 ? ' font-weight="bold"' : ''}>${esc(z)}</text>`).join('');
  };

  // Kanten
  let kanten = '';
  const mid = y(0) + H + GY / 2, c0 = ceoX + W / 2;
  kanten += `<path d="M${c0} ${y(0) + H}V${mid}" ${ln}/><path d="M${cx(0)} ${mid}H${cx(n - 1)}" ${ln}/>`;
  for (let i = 0; i < n; i++) kanten += `<path d="M${cx(i)} ${mid}V${y(1)}" ${ln} ${pf}/>`;
  for (let l = 2; l < L; l++) {
    for (let j = 0; j < n; j++) {
      const von = typ === 'mehr' ? [Math.max(0, j - 1), Math.min(n - 1, j + 1)] : [j, j];   // Mehrlinie: Anweisungen von bis zu drei Leitungen
      for (let i = von[0]; i <= von[1]; i++) kanten += `<path d="M${cx(i)} ${y(l - 1) + H}L${cx(j)} ${y(l)}" ${ln} ${pf}/>`;
    }
  }
  if (mitStab) kanten += `<path d="M${ceoX + W} ${y(0) + H / 2}H${stabX}" ${ln}/>`;

  // Kästen
  let boxen = box(ceoX, y(0), modell.ebenen[0][0].lines);
  modell.ebenen.slice(1).forEach((eb, l) => eb.forEach((nd, i) => { boxen += box(cx(i) - W / 2, y(l + 1), nd.lines); }));
  if (mitStab) boxen += box(stabX, y(0), modell.stab.lines, '#eeeeee');

  const titel = mitTitel ? `<text x="${M}" y="30" font-size="17" font-weight="bold">${esc(modell.firma)}</text>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${breite} ${hoehe}" width="${breite}" height="${hoehe}" font-family="Arial, Helvetica, sans-serif" font-size="13">` +
    `<defs><marker id="pfeil" markerWidth="10" markerHeight="8" refX="10" refY="4" orient="auto" markerUnits="userSpaceOnUse"><path d="M0 0L10 4L0 8z" fill="#000"/></marker></defs>` +
    `<rect width="100%" height="100%" fill="#fff"/>${titel}${kanten}${boxen}</svg>`;
}

function zeichne() {
  if (modell) $('organigramm').innerHTML = baueSvg();
}

// ───────────────────────────────────────────────
// Export

function dateiname(ext) {
  const d = new Date(), p = n => String(n).padStart(2, '0');
  const firma = modell.firma.replace(/[^\wäöüÄÖÜß]+/g, '-').replace(/^-|-$/g, '');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-organigramm-${$('typ').value === 'mehr' ? 'mehrliniensystem' : 'einliniensystem'}-${firma}.${ext}`;
}

function laden(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportiereSvg() {
  if (!modell) return;
  laden(new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n' + baueSvg()], { type: 'image/svg+xml;charset=utf-8' }), dateiname('svg'));
}

function exportierePng() {
  if (!modell) return;
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas');
    c.width = img.naturalWidth * 2; c.height = img.naturalHeight * 2;
    const g = c.getContext('2d');
    g.scale(2, 2); g.drawImage(img, 0, 0);
    c.toBlob(b => laden(b, dateiname('png')), 'image/png');
  };
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(baueSvg());
}

// ───────────────────────────────────────────────
// Start

async function startOrganigramm() {
  await ladeUnternehmen();
  $('unternehmen').innerHTML = unternehmen.map((u, i) => `<option value="${i}">${esc(u.firma)}</option>`).join('');
  ['unternehmen', 'typ', 'anzahl', 'tiefe'].forEach(id => $(id).addEventListener('change', erstelleModell));
  ['stab', 'titel'].forEach(id => $(id).addEventListener('change', () => { baueEditor(); zeichne(); }));
  $('firma').addEventListener('input', () => { modell.firma = $('firma').value; zeichne(); });
  erstelleModell();
}