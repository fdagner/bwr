// ============================================================
// Rollout: Einheitliche Aktions-Buttons (Zufallswerte /
// Daten übernehmen / Neue Aufgabe) auf allen Seiten
// + CSS-Cache-Bump auf v=14.
// Nur Buttons nach expliziter Map (tools/convert-buttons.js);
// Export-/Tab-/KI-/Sortier-Buttons bleiben unangetastet,
// onclick-Funktionen werden nicht geändert.
// ============================================================
const fs = require('fs');

const DICE_PATH = 'M205.4 66.3C167 56 127.5 78.8 117.3 117.2L66.5 306.7C56.2 345.1 79 384.6 117.4 394.9L306.9 445.7C345.3 456 384.8 433.2 395.1 394.8L445.9 205.3C456.2 166.9 433.4 127.4 395 117.1L205.4 66.3zM228.4 272C222.3 262.1 222.1 249.6 227.8 239.5C233.5 229.4 244.3 223.2 256 223.3C267.6 223.4 278.2 229.8 283.8 240C289.9 249.9 290.1 262.4 284.4 272.5C278.7 282.6 267.9 288.8 256.2 288.7C244.6 288.6 234 282.2 228.4 272zM143.2 284.3C153.1 278.2 165.6 278 175.7 283.7C185.8 289.4 192 300.2 191.9 311.9C191.8 323.5 185.4 334.1 175.2 339.7C165.3 345.8 152.8 346 142.7 340.3C132.6 334.6 126.4 323.8 126.5 312.1C126.6 300.5 133 289.9 143.2 284.3zM328.2 380.7C318.3 386.8 305.8 387 295.7 381.3C285.6 375.6 279.4 364.8 279.5 353.1C279.6 341.5 286 330.9 296.2 325.3C306.1 319.2 318.6 319 328.7 324.7C338.8 330.4 345 341.2 344.9 352.9C344.8 364.5 338.4 375.1 328.2 380.7zM337.2 172.3C347.1 166.2 359.6 166 369.7 171.7C379.8 177.4 386 188.2 385.9 199.9C385.8 211.5 379.4 222.1 369.2 227.7C359.3 233.8 346.8 234 336.7 228.3C326.6 222.6 320.4 211.8 320.5 200.1C320.6 188.5 327 177.9 337.2 172.3zM216.2 186.7C206.3 192.8 193.8 193 183.7 187.3C173.6 181.6 167.4 170.8 167.5 159.1C167.6 147.5 174 136.9 184.2 131.3C194.1 125.2 206.6 125 216.7 130.7C226.8 136.4 233 147.2 232.9 158.9C232.8 170.5 226.4 181.1 216.2 186.7zM482 256L441.4 407.2C424.2 471.2 358.4 509.2 294.4 492.1L256.1 481.8L256.1 512C256.1 547.3 284.8 576 320.1 576L512.1 576C547.4 576 576.1 547.3 576.1 512L576.1 320C576.1 284.7 547.4 256 512.1 256L482 256z';
const CHECK_PATH = 'M320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576zM320 112C205.1 112 112 205.1 112 320C112 434.9 205.1 528 320 528C434.9 528 528 434.9 528 320C528 205.1 434.9 112 320 112zM390.7 233.9C398.5 223.2 413.5 220.8 424.2 228.6C434.9 236.4 437.3 251.4 429.5 262.1L307.4 430.1C303.3 435.8 296.9 439.4 289.9 439.9C282.9 440.4 276 437.9 271.1 433L215.2 377.1C205.8 367.7 205.8 352.5 215.2 343.2C224.6 333.9 239.8 333.8 249.1 343.2L285.1 379.2L390.7 234z';

function iconFor(action) {
  const path = action === 'check' ? CHECK_PATH : DICE_PATH;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" fill="currentColor" height="16" width="16" aria-hidden="true"><path d="${path}"/></svg>`;
}

const L_ZUFALL = 'Zufallswerte';
const L_UEBERNEHMEN = 'Daten übernehmen';
const L_NEUE = 'Neue Aufgabe';

// ------------------------------------------------------------
// Zuordnungs-Map: file -> Liste von Buttons
//   key:    { onclick: '…()' } | { id: '…' }
//   expect: Fragment des bisherigen Labeltexts (Validierung)
//   action: 'dice' | 'check'
//   label:  neuer Labeltext
// ------------------------------------------------------------
const MAP = {
  'lb8-2-bestellmenge.html': [
    { key: { onclick: 'berechneOptimaleBestellmengeUndHaeufigkeit()' }, expect: 'daten übernehmen', action: 'check', label: L_UEBERNEHMEN }
  ],
  'lb10-4-fremdbezug.html': [
    { key: { onclick: 'zeigeZufaelligeAufgabe()' }, expect: 'zufällige werte', action: 'dice', label: L_ZUFALL },
    { key: { onclick: 'generateProblem()' }, expect: 'daten übernehmen', action: 'check', label: L_UEBERNEHMEN }
  ],
  'lb9-2-sachanlagen.html': [
    { key: { onclick: 'zeigeZufaelligeAufgabe()' }, expect: 'zufällige werte', action: 'dice', label: L_ZUFALL },
    { key: { onclick: 'zeigeAbschreibungMitManuellen()' }, expect: 'aufgabe aktualisieren', action: 'check', label: L_UEBERNEHMEN }
  ],
  'lb9-2-abschreibungen.html': [
    { key: { onclick: 'zeigeAbschreibungMitManuellen()' }, expect: 'neue aufgabe', action: 'check', label: L_UEBERNEHMEN }
  ],
  'lb8-3-portfolioanalyse.html': [
    { key: { onclick: 'generatePortfolio()' }, expect: 'daten übernehmen', action: 'check', label: L_UEBERNEHMEN },
    { key: { onclick: 'randomizePortfolios()' }, expect: 'zufälliges portfolio', action: 'dice', label: L_ZUFALL }
  ],
  'lb8-6-gewerbesteuer.html': [
    { key: { onclick: 'setzeZufallswerte(); clearValidationError();' }, expect: 'neue zufallswerte', action: 'dice', label: L_ZUFALL },
    { key: { onclick: 'zeigeGewerbesteuerAufgaben()' }, expect: 'aufgaben erstellen', action: 'check', label: L_UEBERNEHMEN }
  ],
  'vollkostenrechnung.html': [
    { key: { onclick: 'updateChart()' }, expect: 'diagramme aktualisieren', action: 'check', label: L_UEBERNEHMEN }
  ],
  'zinsformel.html': [
    { key: { onclick: 'umstellen()' }, expect: 'formel aktualisieren', action: 'check', label: L_UEBERNEHMEN }
  ],
  'belege.html': [
    { key: { onclick: 'applySVGholen()' }, expect: 'alle daten übernehmen', action: 'check', label: L_UEBERNEHMEN },
    { key: { onclick: 'quittungApplySVGholen()' }, expect: 'alle daten übernehmen', action: 'check', label: L_UEBERNEHMEN },
    { key: { onclick: 'kassenbonApplySVGholen()' }, expect: 'alle daten übernehmen', action: 'check', label: L_UEBERNEHMEN },
    { key: { id: 'newspaperApplyChangesButton' }, expect: 'änderungen übernehmen', action: 'check', label: L_UEBERNEHMEN },
    { key: { onclick: 'lohnabrechnungApplySVGholen()' }, expect: 'abrechnung erstellen', action: 'check', label: L_UEBERNEHMEN },
    { key: { onclick: 'journalApplySVGholen()' }, expect: 'beleg erstellen', action: 'check', label: L_UEBERNEHMEN },
    { key: { onclick: 'bescheidApplySVGholen()' }, expect: 'bescheid erstellen', action: 'check', label: L_UEBERNEHMEN },
    { key: { onclick: 'mahnungApplySVGholen()' }, expect: 'mahnung erstellen', action: 'check', label: L_UEBERNEHMEN },
    { key: { onclick: 'anlagenkarteApplySVGholen()' }, expect: 'beleg erstellen', action: 'check', label: L_UEBERNEHMEN },
    { key: { onclick: 'wertpapiereApplySVGholen()' }, expect: 'beleg erstellen', action: 'check', label: L_UEBERNEHMEN },
    { key: { onclick: 'zufaelligeAusgangsrechnungErstellen()' }, expect: 'ausgangsrechnung erstellen', action: 'dice', label: L_ZUFALL },
    { key: { onclick: 'zufaelligeEingangsrechnungErstellen()' }, expect: 'eingangsrechnung erstellen', action: 'dice', label: L_ZUFALL }
  ],
  'lb7-1-infografik.html': [
    { key: { id: 'generate-chart' }, expect: 'infografik erstellen', action: 'check', label: L_UEBERNEHMEN }
  ],

  // ---- Reine Zufallsseiten -> "Neue Aufgabe" (Würfel) ----
  'bab.html': [{ key: { onclick: 'generateBAB()' }, expect: 'bab erstellen', action: 'dice', label: L_NEUE }],
  'bilanz10.html': [{ key: { onclick: 'generateBilanzUndKennzahlen()' }, expect: 'bilanz erstellen', action: 'dice', label: L_NEUE }],
  'buchungssatz.html': [{ key: { onclick: 'generiereBuchungssatz()' }, expect: 'buchungssatz erstellen', action: 'dice', label: L_NEUE }],
  'investitionsrechnung.html': [{ key: { onclick: 'setAnschaffungskosten()' }, expect: 'datenblatt erstellen', action: 'dice', label: L_NEUE }],
  'kariert.html': [{ key: { id: 'generate' }, expect: 'generieren', action: 'dice', label: L_NEUE }],
  'vorkontierung.html': [{ key: { onclick: 'generiereVorkontierung()' }, expect: 'vorkontierung erstellen', action: 'dice', label: L_NEUE }],
  't-konto.html': [{ key: { onclick: 'generiereTKonto()' }, expect: 't-konten zeichnen', action: 'dice', label: L_NEUE }],
  'lb10-4-gewinnschwelle.html': [{ key: { onclick: 'validateAndGenerateChart()' }, expect: 'aufgabe erstellen', action: 'dice', label: L_NEUE }],
  'lb10-4-teilkostenrechnung.html': [{ key: { onclick: 'generiereAufgabe()' }, expect: 'aufgabe erstellen', action: 'dice', label: L_NEUE }],
  'lb7-1-einkommensarten.html': [{ key: { onclick: 'zeigeZufaelligeEinkommensaufgaben()' }, expect: 'aufgaben erstellen', action: 'dice', label: L_NEUE }],
  'lb7-1-haushaltsplan.html': [{ key: { onclick: 'zeigeZufaelligeHaushaltsplaene()' }, expect: 'aufgaben erstellen', action: 'dice', label: L_NEUE }],
  'lb7-1-konsumgewohnheiten.html': [{ key: { onclick: 'zeigeZufaelligeKonsumaufgaben()' }, expect: 'aufgaben erstellen', action: 'dice', label: L_NEUE }],
  'lb7-1-prozentdiagramm.html': [{ key: { onclick: 'zeigeZufaelligeProzentAufgaben()' }, expect: 'aufgabe', action: 'dice', label: L_NEUE }],
  'lb7-1-prozentrechnen.html': [{ key: { onclick: 'generiereAufgaben()' }, expect: 'aufgaben', action: 'dice', label: L_NEUE }],
  'lb7-1-zahlungsarten.html': [{ key: { onclick: 'zeigeZufaelligeZahlungsaufgaben()' }, expect: 'aufgaben erstellen', action: 'dice', label: L_NEUE }],
  'lb7-2-funktionsbereiche.html': [{ key: { onclick: 'zeigeZufaelligeWahrFalsch()' }, expect: 'aufgaben erstellen', action: 'dice', label: L_NEUE }],
  'lb7-2-leitbild.html': [{ key: { onclick: 'zeigeZufaelligeLeitbilder()' }, expect: 'leitbilder erstellen', action: 'dice', label: L_NEUE }],
  'lb7-2-name.html': [{ key: { onclick: 'generiereAufgaben()' }, expect: 'aufgaben erstellen', action: 'dice', label: L_NEUE }],
  'lb7-2-unternehmensziele.html': [{ key: { onclick: 'updateZiele()' }, expect: 'ziele erstellen', action: 'dice', label: L_NEUE }],
  'lb7-3-bilanz-erstellen.html': [{ key: { onclick: 'generiereAufgabe()' }, expect: 'aufgabe erstellen', action: 'dice', label: L_NEUE }],
  'lb7-3-bilanz7.html': [{ key: { onclick: 'generateRandomBilanz7()' }, expect: 'bilanz erstellen', action: 'dice', label: L_NEUE }],
  'lb7-3-buchungsatz.html': [{ key: { onclick: 'zeigeZufaelligeGeschaeftsfaelle()' }, expect: 'aufgaben erstellen', action: 'dice', label: L_NEUE }],
  'lb7-3-inventar.html': [{ key: { onclick: 'generateRandomInventar()' }, expect: 'inventar erstellen', action: 'dice', label: L_NEUE }],
  'lb7-4-buchungslesen-werkstoffe.html': [{ key: { onclick: 'generiereAufgabe()' }, expect: 'aufgabe erstellen', action: 'dice', label: L_NEUE }],
  'lb7-4-einkauf.html': [{ key: { onclick: 'zeigeZufaelligeGeschaeftsfaelleW()' }, expect: 'aufgaben erstellen', action: 'dice', label: L_NEUE }],
  'lb7-4-verkauf.html': [{ key: { onclick: 'zeigeZufaelligeGeschaeftsfaelleV()' }, expect: 'aufgaben erstellen', action: 'dice', label: L_NEUE }],
  'lb7-4-vordruck.html': [{ key: { onclick: 'erstelleVordrucke()' }, expect: 'vordruck erstellen', action: 'dice', label: L_NEUE }],
  'lb7-5-eigenkapitalvergleich.html': [{ key: { onclick: 'zeigeZufaelligeEkAufgaben()' }, expect: 'aufgaben erstellen', action: 'dice', label: L_NEUE }],
  'lb7-5-inventurdifferenzen.html': [{ key: { onclick: 'updateTable()' }, expect: 'tabelle erstellen', action: 'dice', label: L_NEUE }],
  'lb8-1-anfangsbestand.html': [{ key: { onclick: 'zeigeZufaelligenAnfangsbestand()' }, expect: 'aufgabe erstellen', action: 'dice', label: L_NEUE }],
  'lb8-1-bestand.html': [{ key: { onclick: 'zeigeZufaelligeBestandsveraenderungen()' }, expect: 'aufgaben erstellen', action: 'dice', label: L_NEUE }],
  'lb8-1-bestandskonten.html': [{ key: { onclick: 'zeigeZufaelligenBestandsabschluss()' }, expect: 'aufgabe erstellen', action: 'dice', label: L_NEUE }],
  'lb8-1-einkauf.html': [{ key: { onclick: 'zeigeZufaelligenSatz()' }, expect: 'aufgaben erstellen', action: 'dice', label: L_NEUE }],
  'lb8-1-erfolgskonten.html': [{ key: { onclick: 'zeigeZufaelligenBestandsabschluss()' }, expect: 'aufgabe erstellen', action: 'dice', label: L_NEUE }],
  'lb8-1-guv.html': [{ key: { onclick: 'zeigeZufaelligenAbschluss()' }, expect: 'aufgabe erstellen', action: 'dice', label: L_NEUE }],
  'lb8-2-angebotsvergleich.html': [{ key: { onclick: 'zeigeZufaelligenSatz()' }, expect: 'aufgabe erstellen', action: 'dice', label: L_NEUE }],
  'lb8-3-buchungmarketing.html': [{ key: { onclick: 'zeigeZufaelligeGeschaeftsfaelle()' }, expect: 'aufgaben erstellen', action: 'dice', label: L_NEUE }],
  'lb8-3-preisdifferenzierung.html': [{ key: { onclick: 'generiereAufgaben()' }, expect: 'aufgaben erstellen', action: 'dice', label: L_NEUE }],
  'lb8-3-preisstrategien.html': [{ key: { onclick: 'zeigeZufaelligePreisstrategien()' }, expect: 'aufgaben erstellen', action: 'dice', label: L_NEUE }],
  'lb8-3-vertriebswege.html': [{ key: { onclick: 'zeigeZufaelligeVertriebswege()' }, expect: 'aufgaben erstellen', action: 'dice', label: L_NEUE }],
  'lb8-3-zielkonflikte.html': [{ key: { onclick: 'zeigeZufaelligeZielbeziehungen()' }, expect: 'aufgaben erstellen', action: 'dice', label: L_NEUE }],
  'lb8-4-ausgangsfrachten.html': [{ key: { onclick: 'zeigeZufaelligeGeschaeftsfaelle()' }, expect: 'aufgaben erstellen', action: 'dice', label: L_NEUE }],
  'lb8-4-verkauf.html': [{ key: { onclick: 'verkaufZeigeZufaelligenSatz()' }, expect: 'aufgaben erstellen', action: 'dice', label: L_NEUE }],
  'lb8-5-entgeltformen.html': [{ key: { onclick: 'zeigeZufaelligeEntgeltformen()' }, expect: 'aufgaben erstellen', action: 'dice', label: L_NEUE }],
  'lb8-5-lebenslauf.html': [{ key: { id: 'generate-btn' }, expect: 'lebenslauf generieren', action: 'dice', label: L_NEUE }],
  'lb8-5-personalzusatzkosten.html': [{ key: { onclick: 'generiereAufgaben()' }, expect: 'aufgaben erstellen', action: 'dice', label: L_NEUE }],
  'lb8-6-buchungenstaat.html': [{ key: { onclick: 'zeigeZufaelligeGeschaeftsfaelle()' }, expect: 'aufgaben erstellen', action: 'dice', label: L_NEUE }],
  'lb9-1-aufbauorganisation.html': [{ key: { onclick: 'generiereAufgaben()' }, expect: 'aufgabe erstellen', action: 'dice', label: L_NEUE }],
  'lb9-1-fuehrung.html': [{ key: { onclick: 'generiereAufgaben()' }, expect: 'aufgaben erstellen', action: 'dice', label: L_NEUE }],
  'lb9-1-fuehrungsstil.html': [{ key: { onclick: 'generiereAufgaben()' }, expect: 'aufgaben erstellen', action: 'dice', label: L_NEUE }],
  'lb9-1-organigramm.html': [
    { key: { onclick: 'erstelleModell()' }, expect: 'neu erstellen', action: 'dice', label: L_NEUE },
    { key: { onclick: 'neuePersonen()' }, expect: 'personen', action: 'dice', label: L_ZUFALL }
  ],
  'lb9-2-abschreibungskreislauf.html': [{ key: { onclick: 'zeigeZufaelligeWahrFalsch()' }, expect: 'aufgaben erstellen', action: 'dice', label: L_NEUE }],
  'lb9-2-weiterebuchungen.html': [{ key: { onclick: 'zeigeZufaelligeGeschaeftsfaelle()' }, expect: 'aufgaben erstellen', action: 'dice', label: L_NEUE }],
  'lb9-3-buchungenkreditbereich.html': [{ key: { onclick: 'zeigeZufaelligeGeschaeftsfaelle()' }, expect: 'aufgaben erstellen', action: 'dice', label: L_NEUE }],
  'lb9-3-kreditvergleich.html': [{ key: { onclick: 'zeigeZufaelligenSatz()' }, expect: 'aufgabe erstellen', action: 'dice', label: L_NEUE }],
  'lb9-4-aktienkurs.html': [{ key: { id: 'generate-chart' }, expect: 'aufgabe neu erstellen', action: 'dice', label: L_NEUE }],
  'lb9-4-buchungenkapitalanlage.html': [{ key: { onclick: 'zeigeZufaelligeGeschaeftsfaelle()' }, expect: 'aufgaben erstellen', action: 'dice', label: L_NEUE }],
  'lb9-4-magischesdreieck.html': [{ key: { onclick: 'zeigeZufaelligeWahrFalsch()' }, expect: 'aufgaben erstellen', action: 'dice', label: L_NEUE }],
  'ewb.html': [{ key: { onclick: 'ewbZeigeZufaelligeTabelle()' }, expect: 'aufgabe erstellen', action: 'dice', label: L_NEUE }],
  'pwb.html': [{ key: { onclick: 'pwbZeigeZufaelligeTabelle()' }, expect: 'aufgabe erstellen', action: 'dice', label: L_NEUE }]
};

// ------------------------------------------------------------
const DRY = process.argv.includes('--dry');
const files = fs.readdirSync('.').filter(f => f.toLowerCase().endsWith('.html'));
const problems = [];
let bumpCount = 0;
const report = [];

for (const file of files.sort()) {
  const src = fs.readFileSync(file, 'utf8');

  // ---- 1. CSS-Cache-Bump auf v=14 ----
  let out = src;
  if (/css\/style\.css\?v=\d+/.test(out) && !/css\/style\.css\?v=14/.test(out)) {
    out = out.replace(/css\/style\.css\?v=\d+/g, 'css/style.css?v=14');
    bumpCount++;
  } else if (/href="css\/style\.css"/.test(out)) {
    out = out.replace(/href="css\/style\.css"/g, 'href="css/style.css?v=14"');
    bumpCount++;
  }

  // ---- 2. Button-Umwandlung ----
  const entries = MAP[file];
  let buttonCount = 0;
  if (entries) {
    let bump = 0;
    out = out.replace(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi, (whole, attrs, inner, offset) => {
      const onclick = (attrs.match(/onclick="([^"]*)"/) || [])[1];
      const id = (attrs.match(/id="([^"]*)"/) || [])[1];

      const labelNorm = inner.replace(/<svg[\s\S]*?<\/svg>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/[^a-zäöüß0-9()/+-]+/gi, ' ').replace(/\s+/g, ' ').trim().toLowerCase();

      const entry = entries.find(e => {
        const keyOk = e.key.onclick !== undefined ? onclick === e.key.onclick : id === e.key.id;
        if (!keyOk) return false;
        return labelNorm.includes(e.expect);
      });
      if (!entry) return whole;

      // Attribute normalisieren (type/class/onclick/id/title)
      const keep = {};
      let at;
      const atRe = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
      while ((at = atRe.exec(attrs)) !== null) {
        const name = at[1].toLowerCase();
        const val = at[2] !== undefined ? at[2] : at[3];
        if (['onclick', 'id', 'title'].includes(name)) keep[name] = val;
      }
      // Bestehendes `type=` (nicht in getretenen Tabs usw.) behalten,
      // sonst type="button" ergänzen
      keep.type = (attrs.match(/\btype="([^"]*)"/) || [])[1];

      const parts = [];
      parts.push(keep.type ? `type="${keep.type}"` : 'type="button"');
      parts.push(`class="${entry.action === 'check' ? 'btn-uebernehmen' : 'btn-zufall'}"`);
      if (keep.onclick) parts.push(`onclick="${keep.onclick}"`);
      if (keep.id) parts.push(`id="${keep.id}"`);
      if (keep.title) parts.push(`title="${keep.title}"`);

      // Einrückung der Zeile, in der <button beginnt
      const pre = src.slice(0, offset);
      const nl = pre.lastIndexOf('\n');
      const indent = pre.slice(nl + 1).match(/^[ \t]*/)[0];

      const body = `${indent}<button ${parts.join(' ')}>\n${indent}  ${iconFor(entry.action)}\n${indent}  ${entry.label}\n${indent}</button>`;
      bump++;
      return body;
    });
    buttonCount = bump;
    // Gefunden-Prüfung: Entry matched kein Button mit passendem onclick/id?
    for (const e of entries) {
      const keyRe = e.key.onclick !== undefined
        ? new RegExp(`<button[^>]*onclick="${e.key.onclick.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'i')
        : new RegExp(`<button[^>]*id="${e.key.id}"`, 'i');
      if (!keyRe.test(out)) problems.push(`NICHT GEFUNDEN in ${file}: ${e.key.onclick || e.key.id} (${e.label})`);
    }
  }

  if (out !== src) {
    if (!DRY) fs.writeFileSync(file, out, 'utf8');
    report.push(`${file} (Buttons konvertiert: ${buttonCount})`);
  }
}

// ---- 3. Gruppen-Wrapping (.btn-aktion-row) ----
// Benachbarte konvertierte Buttons (nur Whitespace dazwischen)
// bekommen eine .btn-aktion-row — nur in den Seiten mit Paaren.
const WRAP = ['lb10-4-fremdbezug.html', 'lb9-2-sachanlagen.html', 'lb8-3-portfolioanalyse.html',
  'lb9-1-organigramm.html'];
let wrapTotal = 0;
for (const file of WRAP) {
  if (DRY) continue;
  let src = fs.readFileSync(file, 'utf8');
  if (/class="btn-aktion-row"/.test(src)) { // bereits ummantelt -> idempotent überspringen
    continue;
  }
  const re = /<button\b[^>]*class="btn-(?:zufall|uebernehmen)"[^>]*>[\s\S]*?<\/button>/gi;
  const spans = [];
  let m;
  while ((m = re.exec(src)) !== null) spans.push({ start: m.index, end: m.index + m[0].length, text: m[0] });

  // Gruppen bilden
  const groups = [];
  for (const s of spans) {
    const g = groups[groups.length - 1];
    if (g && /^\s*$/.test(src.slice(g[g.length - 1].end, s.start))) {
      g.push(s); continue;
    }
    groups.push([s]);
  }
  // von hinten einfügen, damit Indizes gültig bleiben
  for (let gi = groups.length - 1; gi >= 0; gi--) {
    const g = groups[gi];
    if (g.length < 2) continue;
    const first = g[0];
    const indent = src.slice(0, first.start).match(/[ \t]*$/)[0];
    const ind = indent + '  ';
    const inner = g.map(sp => ind + sp.text.replace(/\r?\n/g, '\n' + ind)).join('\n' + ind);
    const block = `${indent}<div class="btn-aktion-row">\n${inner}\n${indent}</div>`;
    src = src.slice(0, g[0].start) + block + src.slice(g[g.length - 1].end);
    wrapTotal++;
    console.log(`btn-aktion-row eingefügt in ${file} (${g.length} Buttons)`);
  }
  fs.writeFileSync(file, src, 'utf8');
}

console.log(`\n${DRY ? 'DRY RUN – nichts geschrieben' : 'GESCHRIEBEN'}:`);
report.forEach(f => console.log('  ' + f));
console.log(`\nCSS-Bump auf v=14: ${bumpCount} Datei(en)`);
console.log(`btn-aktion-row-Gruppen: ${wrapTotal}`);
if (problems.length) {
  console.log('\nPROBLEME:');
  problems.forEach(p => console.log('  ' + p));
  process.exitCode = 1;
} else {
  console.log('\nAlle Map-Einträge gefunden und konvertiert.');
}
