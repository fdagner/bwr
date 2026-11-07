// ============================================================================
// LB8-1 ABSCHLUSSBUCHUNGSSÄTZE
// ============================================================================
// Gegeben: zufällige Konten mit Salden → gesucht: die passenden
// Abschlussbuchungssätze ohne T-Konten (nur Konto + Saldo als Geschäftsfall).
//
// Regeln (wie in lb8-1-guv.js / lb8-1-bestandskonten.js / lb8-1-erfolgskonten.js):
//   Aufwandskonto  (Sollsaldo) → 8020 GUV an <Konto>        (GuV im Soll)
//   Ertragskonto   (Habensaldo) → 5000 UEFE an 8020 GUV    (GuV im Haben)
//   Unterkonto Bezugskosten (Sollsaldo) → <Hauptkonto> an <BZK>
//   Unterkonto Nachlässe (Habensaldo) → <Nachlass> an <Hauptkonto>
//   Bestandskonto aktiv (Sollsaldo) → 8010 SBK an <Konto>
//   Bestandskonto passiv (Habensaldo) → <Konto> an 8010 SBK
//
// Die Konten stehen zentral im KONTENPLAN (js/utils.js); Abkürzung und Langname
// kommen aus kontoLabel()/kontoName(). Der Nutzer wählt per Häkchen, aus
// welchen Konten zufällige Geschäftsfälle gezogen werden, und deren Anzahl.
// ============================================================================

const SBK_KONTO = kontoLabel('8010');   // Schlussbilanzkonto
const GUV_KONTO = kontoLabel('8020');   // Gewinn- und Verlustkonto
const UEFE_KONTO = kontoLabel('5000');  // Umsatzerlöse (Abschlusskonto für Erlösberichtigungen)

// Zufällige Salden – wie in lb8-1-guv.js auf glatte 100 € gerundet
function zufallsSaldo(min, max) {
  return Math.round((Math.random() * (max - min) + min) / 100) * 100;
}

// ============================================================================
// AUSWÄHLBARE KONTEN (Gruppen mit Häkchen im Formular)
// ============================================================================

const ABSCHLUSS_GRUPPEN = [
  {
    id: 'aufwand',
    titel: 'Erfolgskonten – Aufwand',
    hinweis: 'Saldo im Soll → abgeschlossen über 8020 GUV (im Soll)',
    konten: [
      { nr: '6000', typ: 'aufwand', range: [80000, 250000] },   // Rohstoffe – groß
      { nr: '6010', typ: 'aufwand', range: [30000, 150000] },   // Fremdbauteile
      { nr: '6020', typ: 'aufwand', range: [5000, 30000] },     // Hilfsstoffe – klein
      { nr: '6030', typ: 'aufwand', range: [3000, 15000] },     // Betriebsstoffe – klein
    ],
  },
  {
    id: 'erloes',
    titel: 'Erfolgskonten – Ertrag',
    hinweis: 'Saldo im Haben → abgeschlossen über 8020 GUV (im Haben)',
    konten: [
      { nr: '5000', typ: 'erloes', range: [150000, 600000] },   // Umsatzerlöse – viel
    ],
  },
  {
    id: 'berichtigung',
    titel: 'Erlösberichtigungen',
    hinweis: 'Saldo im Soll → abgeschlossen über das Ertragskonto (5000 UEFE im Soll)',
    konten: [
      { nr: '5001', typ: 'berichtigung', range: [2000, 30000] },// kleine Korrekturposten
    ],
  },
  {
    id: 'unekonten',
    titel: 'Unterkonten (Bezugskosten / Nachlässe)',
    hinweis: 'Bezugskosten → Hauptkonto im Soll · Nachlässe → Hauptkonto im Haben',
    konten: [
      { nr: '6001', typ: 'bzk', haupt: '6000', range: [3000, 25000] },      // BZK Rohstoffe
      { nr: '6011', typ: 'bzk', haupt: '6010', range: [1500, 15000] },      // BZK Fremdbauteile
      { nr: '6021', typ: 'bzk', haupt: '6020', range: [500, 5000] },        // BZK Hilfsstoffe
      { nr: '6031', typ: 'bzk', haupt: '6030', range: [500, 4000] },        // BZK Betriebsstoffe
      { nr: '6002', typ: 'nachlass', haupt: '6000', range: [1000, 12000] },// Nachlässe Rohstoffe
      { nr: '6012', typ: 'nachlass', haupt: '6010', range: [500, 6000] },   // Nachlässe Fremdbauteile
      { nr: '6022', typ: 'nachlass', haupt: '6020', range: [300, 3000] },   // Nachlässe Hilfsstoffe
      { nr: '6032', typ: 'nachlass', haupt: '6030', range: [300, 2500] },   // Nachlässe Betriebsstoffe
    ],
  },
  {
    id: 'bestand',
    titel: 'Bestandskonten',
    hinweis: 'Aktiv (Soll) → 8010 SBK an Konto · Passiv (Haben) → Konto an 8010 SBK',
    konten: [
      { nr: '0500', typ: 'bestandAktiv', range: [300000, 800000] }, // Grundstücke – viel
      { nr: '0530', typ: 'bestandAktiv', range: [250000, 600000] }, // GebBäude – viel
      { nr: '0700', typ: 'bestandAktiv', range: [150000, 500000] }, // Maschinen – viel
      { nr: '0840', typ: 'bestandAktiv', range: [40000, 120000] },  // Fuhrpark
      { nr: '0860', typ: 'bestandAktiv', range: [8000, 30000] },    // Büromaschinen – wenig
      { nr: '0870', typ: 'bestandAktiv', range: [10000, 40000] },   // Büromöbel
      { nr: '2800', typ: 'bestandAktiv', range: [80000, 400000] },  // Bank – viel
      { nr: '2880', typ: 'bestandAktiv', range: [500, 5000] },      // Kasse – wenig
      { nr: '2400', typ: 'bestandAktiv', range: [20000, 150000] },  // Forderungen
      { nr: '4200', typ: 'bestandPassiv', range: [50000, 300000] }, // kurzfr. Bankverbindlichkeiten
      { nr: '4250', typ: 'bestandPassiv', range: [150000, 500000] },// langfr. Bankverbindlichkeiten
      { nr: '4400', typ: 'bestandPassiv', range: [20000, 150000] }, // Verbindlichkeiten aus LL
    ],
  },
];

// Fallback-Betragsrahmen je Kontentyp (wenn kein `range` angegeben ist)
const SALDO_UMFANG = {
  aufwand:        [10000, 300000],
  erloes:         [10000, 300000],
  berichtigung:   [2000, 60000],
  bzk:            [2000, 60000],
  nachlass:       [2000, 60000],
  bestandAktiv:   [5000, 250000],
  bestandPassiv:  [5000, 250000],
};

// Ein- und zweistelliger Kontotyp-Titel (für die Merkhilfe in der Lösung)
function saldoTitel(typ) {
  switch (typ) {
    case 'aufwand':       return 'Soll';   // Aufwandskonto
    case 'berichtigung':  return 'Soll';   // Erlösberichtigungen
    case 'erloes':        return 'Haben';  // Ertragskonto
    case 'bzk':           return 'Soll';   // Bezugskosten-Unterkonto
    case 'nachlass':      return 'Haben';  // Nachlass-Unterkonto
    case 'bestandAktiv':  return 'Soll';
    case 'bestandPassiv': return 'Haben';
  }
  return 'Soll';
}

// Er macht aus einem Auswahl-Eintrag {nr, typ, haupt?} den Abschlussbuchungssatz
function abschlussSatz(k) {
  const eigen = kontoLabel(k.nr);
  const haupt = k.haupt ? kontoLabel(k.haupt) : null;
  switch (k.typ) {
    case 'aufwand':       return { soll: GUV_KONTO, haben: eigen,     merk: 'Saldo im Soll → Aufwand ins Soll der GuV' };
    case 'berichtigung':  return { soll: UEFE_KONTO, haben: eigen,  merk: 'Erlösberichtigung → Übertrag ins Soll des Ertragskontos (5000 UEFE)' };
    case 'erloes':        return { soll: eigen,     haben: GUV_KONTO, merk: 'Saldo im Haben → Ertrag ins Haben der GuV' };
    case 'bzk':           return { soll: haupt,     haben: eigen,     merk: 'Bezugskosten → Übertrag ins Soll des Hauptkontos' };
    case 'nachlass':      return { soll: eigen,     haben: haupt,     merk: 'Nachlässe → Übertrag ins Haben des Hauptkontos' };
    case 'bestandAktiv':  return { soll: SBK_KONTO, haben: eigen,     merk: 'Bestandskonto aktiv (Sollsaldo) → ins Soll des SBK' };
    case 'bestandPassiv': return { soll: eigen,     haben: SBK_KONTO, merk: 'Bestandskonto passiv (Habensaldo) → ins Haben des SBK' };
  }
  return null;
}

// ============================================================================
// KONTEN-CHECKBOXEN (Formular) mit Speicherung der Auswahl
// ============================================================================

function erstelleKontoCheckboxes() {
  const box = document.getElementById('kontoCheckboxes');
  if (!box) return;

  const gespeichert = (function () {
    try { return JSON.parse(localStorage.getItem('abKontenAuswahl') || 'null'); }
    catch (e) { return null; }
  })();
  const vorher = Array.isArray(gespeichert) ? gespeichert : null;

  let html = `<p style="margin:0 0 6px; font-weight:bold;">Konten für die Zufallsauswahl:</p>`;
  ABSCHLUSS_GRUPPEN.forEach(gruppe => {
    html += `<div style="margin:8px 0 2px; font-weight:bold; font-size:14px;">${gruppe.titel}</div>`;
    html += `<div style="font-size:12px; color:#555; margin-bottom:4px;">${gruppe.hinweis}</div>`;
    gruppe.konten.forEach(k => {
      const label = kontoLabel(k.nr);
      const checked = !vorher ? 'checked' : (vorher.includes(k.nr) ? 'checked' : '');
      html += `<label style="display:inline-block; margin:0 14px 4px 0; white-space:nowrap;">
        <input type="checkbox" class="ab-konto-check" value="${k.nr}" ${checked}>
        ${label}
      </label>`;
    });
  });
  box.innerHTML = html;

  // Auswahl merken
  box.querySelectorAll('.ab-konto-check').forEach(cb => {
    cb.addEventListener('change', () => {
      const aktiv = [...box.querySelectorAll('.ab-konto-check:checked')].map(x => x.value);
      try { localStorage.setItem('abKontenAuswahl', JSON.stringify(aktiv)); } catch (e) { /* egal */ }
    });
  });
}

function auswahlKonten() {
  const box = document.getElementById('kontoCheckboxes');
  if (!box) return ABSCHLUSS_GRUPPEN.flatMap(g => g.konten);
  const nrListe = [...box.querySelectorAll('.ab-konto-check:checked')].map(x => x.value);
  const pool = ABSCHLUSS_GRUPPEN.flatMap(g => g.konten);
  const ausgewaehlt = pool.filter(k => nrListe.includes(k.nr));
  return ausgewaehlt.length ? ausgewaehlt : pool;   // Fallback: alle
}

// ============================================================================
// GENERIERUNG DER GESCHÄFTSFÄLLE + RENDERN
// ============================================================================

let letzteGefaehlle = [];   // für den KI-Prompt

function generiereAufgabe() {
  const anzahlSel = document.getElementById('anzGefaehlle');
  const n = anzahlSel ? Math.max(1, parseInt(anzahlSel.value, 10) || 4) : 4;

  // Auswahl mischen; jedes Konto nur einmal (keine doppelten Zeilen in der Aufgabe).
  // Wird mehr als vorhanden angefordert, wird auf die Anzahl ausgewählter Konten
  // begrenzt — kein Konto wird doppelt gezogen.
  const pool = auswahlKonten().slice().sort(() => Math.random() - 0.5);
  const ausgewaehlt = pool.slice(0, Math.min(n, pool.length));
  if (ausgewaehlt.length === 0) return;
  if (ausgewaehlt.length < n) {
    zeigeModal('Es sind nur ' + ausgewaehlt.length + ' Konten ausgewählt – es werden ' + ausgewaehlt.length + ' Aufgaben generiert (kein Konto doppelt).', 'Hinweis');
  }

  const gefaehlle = ausgewaehlt.map(k => {
    const [min, max] = (k.range || SALDO_UMFANG[k.typ]);   // Kontospezifischer Betragsrahmen
    const saldo = zufallsSaldo(min, max);
    const satz = abschlussSatz(k);
    return {
      nr: k.nr,
      label: kontoLabel(k.nr),
      name: kontoName(k.nr),
      saldo,
      saldoSeite: saldoTitel(k.typ),
      satz,
    };
  });
  letzteGefaehlle = gefaehlle;

  const container = document.getElementById('Container');
  if (container) container.innerHTML = renderAufgabeHtml(gefaehlle);

  setzeAufgabeKiText(erstelleAufgabenText());
  const vorschauEl = document.getElementById('kiPromptVorschau');
  if (vorschauEl && getComputedStyle(vorschauEl).display !== 'none') {
    vorschauEl.textContent = erstelleKiPromptText();
  }
}

function renderAufgabeHtml(gefaehlle) {
  // ── AUFGABE: Konten mit Salden (keine T-Konten) ───────────────────────────
  let html = '<h2>Aufgabe: Abschlussbuchungssätze</h2>';
  html += `<div style="background:#fff; border:1px solid #dde3ea; border-radius:8px;
              padding:14px 18px; margin-bottom:12px; font-size:16px; line-height:1.7;">
    Am Bilanzstichtag liegen folgende Salden im Hauptbuch vor.<br>
    Bilde zu jedem Konto den Buchungssatz zur Vorabschluss- bzw. Abschlussbuchung.
  </div>`;

  html += `<table style="border:1px solid #999; font-size:16px; width:640px; max-width:100%;
        border-collapse:collapse; margin-bottom:14px;">
    <tr style="background-color:#ccc; font-weight:bold;">
      <th style="padding:6px 10px; text-align:left; width:22%;">Konto</th>
      <th style="padding:6px 10px; text-align:left;">Kontobezeichnung</th>
      <th style="padding:6px 10px; text-align:right; width:22%;">Saldo</th>
    </tr>`;
  gefaehlle.forEach(g => {
    html += `<tr style="border:1px solid #999;">
      <td style="padding:4px 10px; white-space:nowrap;">${g.label}</td>
      <td style="padding:4px 10px;">${g.name}</td>
      <td style="padding:4px 10px; text-align:right; white-space:nowrap;">${formatBetrag(g.saldo)}&nbsp;€</td>
    </tr>`;
  });
  html += `</table>`;

  // ── LÖSUNG: Abschlussbuchungssätze (Courier-Tabelle wie lb8-1-guv) ────────
  html += `<h2 class="loesung">Lösung</h2>`;

  html += `
  <table style="white-space:nowrap; background-color:#fff; font-family:courier; min-width:700px;
        border-collapse:collapse; margin:0.6em 0 1.4em 0; max-width:100%;">
    <tbody>`;
  gefaehlle.forEach(g => {
    if (!g.satz) return;
    const bold = 'font-weight:normal;';
    html += `
    <tr>
      <td style="border:0;white-space:nowrap;width:190px;max-width:190px;${bold}" tabindex="1">${g.satz.soll}</td>
      <td style="border:0;text-align:right;white-space:nowrap;width:150px;max-width:150px;${bold}" tabindex="1">${formatBetrag(g.saldo)}</td>
      <td style="border:0;text-align:center;white-space:nowrap;width:60px;${bold}" tabindex="1">an</td>
      <td style="border:0;white-space:nowrap;width:190px;max-width:190px;${bold}" tabindex="1">${g.satz.haben}</td>
      <td style="border:0;white-space:nowrap;width:150px;max-width:150px;${bold}" tabindex="1">${formatBetrag(g.saldo)}</td>
    </tr>
    <tr>
      <td colspan="5" style="border:0; font-family:sans-serif; font-size:12px; color:#555;
          padding:2px 0 10px 2px; border-bottom:1px solid #eee;">${g.satz.merk}</td>
    </tr>`;
  });
  html += `
    </tbody>
  </table>`;

  return html;
}

// ============================================================================
// KI-ASSISTENT (Prompt mit dynamischem Aufgabenteil)
// ============================================================================

const KI_ASSISTENT_PROMPT = `Du bist ein freundlicher Buchführungs-Assistent für Schüler der Realschule (BwR), 8. Klasse. Du hilfst beim Verständnis des Jahresabschlusses – speziell beim Bilden von Abschlussbuchungssätzen (ohne T-Konten).

Aufgabe:
- Gib die erstellte Aufgabe an den Schüler weiter: Wähle eine Zeile mit Konto und Saldo aus, der Schüler muss dann den Buchungssatz bilden.
- Gib KEINE fertigen Buchungssätze vor, solange der Schüler nicht selbst abgeschlossen hat.
- Führe den Schüler durch gezielte Fragen zur richtigen Lösung.
- Ziel: Lernförderung, nicht das Abnehmen der Denkarbeit.

Pädagogischer Ansatz:
- Stelle gezielte Rückfragen, um den Stand des Schülers zu verstehen.
- Beantworte deine Rückfragen nicht selbst.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Erst wenn der Schüler die Rechnung selbst erarbeitet hat, vergleichst du schrittweise mit der unten stehenden Musterlösung.

Arbeitsauftrag: „Bilde zu jedem Konto den passenden Abschlussbuchungssatz bzw. Vorabschlussbuchungssatz. Lösungshinweis: Unterkonten werden zuerst über das zugehörige Hauptkonto, Erfolgskonten über das GuV-Konto und Bestandskonten über das Schlussbilanzkonto abgeschlossen."

Regeln (Merkhilfe für dich – erst andeuten, dann erklären):
- Aufwandskonto (Saldo im Soll) → 8020 GUV an <Konto> (GuV im Soll)
- Erlösberichtigungen (Saldo im Soll) → 5000 UEFE an <Konto> (Übertrag ins Soll des Ertragskontos)
- Ertragskonto (Saldo im Haben) → <Konto> an 8020 GUV (GuV im Haben)
- Unterkonto Bezugskosten (Saldo im Soll) → <Hauptkonto> an <Unterkonto>
- Unterkonto Nachlässe (Saldo im Haben) → <Unterkonto> an <Hauptkonto>
- Bestandskonto aktiv (Saldo im Soll) → 8010 SBK an <Konto>
- Bestandskonto passiv (Saldo im Haben) → <Konto> an 8010 SBK

Typische Fehler der Schüler:
- Bestandskonten über 8020 GUV statt über 8010 SBK abgeschlossen
- Erfolgskonten über 8010 SBK statt über 8020 GUV abgeschlossen
- Unterkonto (Bezugskosten/Nachlässe) direkt über GuV statt über das Hauptkonto abgeschlossen
- Buchungssatz seitenverkehrt (Soll/Haben getauscht)
- Betrag falsch übernommen

Wichtige Konten:
- 8010 SBK – Schlussbilanzkonto (Bestandskonten aktiv im SOLL, Bestandskonten passiv im HABEN)
- 8020 GUV – Gewinn- und Verlustkonto (Aufwand im SOLL, Ertrag im HABEN)

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe – du-Ansprache
- Einfache Sprache, keine Fachbegriffe ohne Erklärung
- Kurze Antworten – maximal 1–2 Sätze pro Nachricht
- Gelegentlich Emojis 📊✅❓💡

Am Ende einer erfolgreich gelösten Übung:
- Frage immer: „Möchtest du noch eine weitere Aufgabe üben?"

Du wartest stets auf die Eingabe des Schülers und gibst nichts vor.

Aufgabe mit Lösung:

###AUFGABEN und LOESUNGEN###`;

// Zuletzt generierte Aufgabe (Geschäftsfälle + Musterlösung) als Plain-Text
let letzteAufgabeKiText = null;

function setzeAufgabeKiText(text) {
  letzteAufgabeKiText = text;
  const vorschauEl = document.getElementById('kiPromptVorschau');
  if (vorschauEl && getComputedStyle(vorschauEl).display !== 'none') {
    vorschauEl.textContent = erstelleKiPromptText();
  }
}

function erstelleAufgabenText() {
  let text = 'Gegeben sind folgende Konten mit Salden:\n\n';
  letzteGefaehlle.forEach((g, i) => {
    text += `Geschäftsfall ${i + 1}: ${g.label} (${g.name}) – Saldo ${formatBetrag(g.saldo)} €\n`;
  });
  text += '\nGesucht: die Abschlussbuchungssätze zu jedem Konto.\n\nMusterlösung:\n';
  letzteGefaehlle.forEach((g, i) => {
    if (!g.satz) return;
    text += `Geschäftsfall ${i + 1}: ${g.satz.soll} an ${g.satz.haben} | ${formatBetrag(g.saldo)} – ${g.satz.merk}\n`;
  });
  return text;
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
    zeigeModal('Kopieren nicht möglich. Bitte manuell aus dem Textfeld kopieren.', 'Kopieren');
  });
}

function toggleKiPromptVorschau() {
  const vorschau = document.getElementById('kiPromptVorschau');
  const btn = document.getElementById('kiPromptToggleBtn');
  if (!vorschau || !btn) return;
  const isHidden = getComputedStyle(vorschau).display === 'none';
  if (isHidden) {
    vorschau.style.display = 'block';
    btn.textContent = 'Vorschau ausblenden ▲';
  } else {
    vorschau.style.display = 'none';
    btn.textContent = 'Prompt anzeigen ▼';
  }
}

// Export-Dateiname (überschreibt download.'format')
window.exportDateiname = function (format) {
  return 'abschlussbuchungssaetze.' + format;
};

// ============================================================================
// INITIALISIERUNG
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  const anzahlSel = document.getElementById('anzGefaehlle');
  if (anzahlSel) {
    anzahlSel.addEventListener('change', () => generiereAufgabe());
  }

  erstelleKontoCheckboxes();
  generiereAufgabe();

  const vorschauEl = document.getElementById('kiPromptVorschau');
  if (vorschauEl) {
    vorschauEl.textContent = erstelleKiPromptText();
  }
});
