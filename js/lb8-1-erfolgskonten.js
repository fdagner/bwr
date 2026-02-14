

function formatBetrag(value) {
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function generateRandomSaldo(min, max, round = 100) {
  return Math.round((Math.random() * (max - min) + min) / round) * round;
}

// ── Buchungen generieren ─────────────────────────────────────────────────────

function erzeugeKontoBuchungen(typ) {
  const buchungsTypen = ['VE', 'VE', 'VE', 'VE', 'VE', 'BK', 'BK', 'KA'];
  const rahmen = {
    AWR: { VE: [80000, 280000], BK: [20000, 80000], KA: [5000,  15000] },
    AWF: { VE: [8000,   28000], BK: [2000,   8000], KA: [500,    1500] },
    AWH: { VE: [1500,    6000], BK: [400,    1500], KA: [100,     400] },
    AWB: { VE: [2000,    8000], BK: [500,    2000], KA: [100,     500] },
  };
  const anzahl = 2 + Math.floor(Math.random() * 3);
  const buchungen = [];
  for (let i = 0; i < anzahl; i++) {
    const bTyp = buchungsTypen[Math.floor(Math.random() * buchungsTypen.length)];
    const [min, max] = rahmen[typ][bTyp];
    const betrag = generateRandomSaldo(min, max, bTyp === 'KA' ? 10 : 100);
    buchungen.push({ typ: bTyp, nr: i + 1, betrag });
  }
  const saldo = buchungen.reduce((s, b) => s + b.betrag, 0);
  return { buchungen, saldo };
}

function erzeugeUefeBuchungen() {
  const buchungsTypen = ['VE', 'VE', 'VE', 'VE', 'VE', 'BK', 'BK', 'KA'];
  const rahmen = {
    VE: [200000, 600000],
    BK: [20000,   80000],
    KA: [5000,    15000],
  };
  const anzahl = 2 + Math.floor(Math.random() * 3);
  const buchungen = [];
  for (let i = 0; i < anzahl; i++) {
    const bTyp = buchungsTypen[Math.floor(Math.random() * buchungsTypen.length)];
    const [min, max] = rahmen[bTyp];
    const betrag = generateRandomSaldo(min, max, bTyp === 'KA' ? 10 : 100);
    buchungen.push({ typ: bTyp, nr: i + 1, betrag });
  }
  const saldo = buchungen.reduce((s, b) => s + b.betrag, 0);
  return { buchungen, saldo };
}

// ── Gesamtdaten zusammenstellen ──────────────────────────────────────────────

function erstelleZufaelligenBestandsabschluss() {
  const konten = {
    '6000 AWR': erzeugeKontoBuchungen('AWR'),
    '6010 AWF': erzeugeKontoBuchungen('AWF'),
    '6020 AWH': erzeugeKontoBuchungen('AWH'),
    '6030 AWB': erzeugeKontoBuchungen('AWB'),
  };
  const uefeDaten     = erzeugeUefeBuchungen();
  const uefe          = uefeDaten.saldo;
  const gesamtAufwand = Object.values(konten).reduce((s, k) => s + k.saldo, 0);
  const erfolg        = uefe - gesamtAufwand;
  const erfolgArt     = erfolg >= 0 ? 'Gewinn' : 'Verlust';
  const erfolgHoehe   = Math.abs(erfolg);
  return { konten, uefeDaten, uefe, gesamtAufwand, erfolg, erfolgArt, erfolgHoehe };
}

// ── T-Konto Renderer ─────────────────────────────────────────────────────────

// Aufwandskonto AUFGABE – Soll-Einträge, Haben leer
function renderTKontoAufgabe(kontoNr, buchungen) {
  const alleZeilen = Math.max(buchungen.length, 3) + 2;
  let html = `<table style="border-collapse:collapse;width:580px;background:#fff;font-size:1.0em;">
    <thead><tr>
      <th style="width:25%;text-align:left;font-weight:600;padding:4px 0;">Soll</th>
      <th style="text-align:center;font-size:1.0em;padding:4px 0;" colspan="2"><span style="font-weight:700;">${kontoNr}</span></th>
      <th style="width:25%;text-align:right;font-weight:600;padding:4px 0;">Haben</th>
    </tr></thead><tbody>`;
  for (let i = 0; i < alleZeilen; i++) {
    const b = buchungen[i];
    html += `<tr style="border-top:2px solid #ccc;">
      <td style="padding:3px 2px;white-space:nowrap;">${b ? `${b.nr}. ${b.typ}` : '&nbsp;'}</td>
      <td style="text-align:right;padding:3px 4px 3px 2px;border-right:2px solid #999;min-width:100px;height:1.8em;">${b ? formatBetrag(b.betrag) : '&nbsp;'}</td>
      <td style="padding:3px 2px 3px 6px;min-width:100px;">&nbsp;</td>
      <td style="text-align:right;padding:3px 2px;min-width:100px;">&nbsp;</td>
    </tr>`;
  }
  html += `</tbody></table>`;
  return html;
}

// UEFE AUFGABE – Haben-Einträge, Soll leer
function renderTKontoUEFEAufgabe(buchungen) {
  const alleZeilen = Math.max(buchungen.length, 3) + 2;
  let html = `<table style="border-collapse:collapse;width:580px;background:#fff;font-size:1.0em;">
    <thead><tr>
      <th style="width:25%;text-align:left;font-weight:600;padding:4px 0;">Soll</th>
      <th style="text-align:center;font-size:1.0em;padding:4px 0;" colspan="2"><span style="font-weight:700;">5000 UEFE</span></th>
      <th style="width:25%;text-align:right;font-weight:600;padding:4px 0;">Haben</th>
    </tr></thead><tbody>`;
  for (let i = 0; i < alleZeilen; i++) {
    const b = buchungen[i];
    html += `<tr style="border-top:2px solid #ccc;">
      <td style="padding:3px 2px;white-space:nowrap;">&nbsp;</td>
      <td style="text-align:right;padding:3px 4px 3px 2px;border-right:2px solid #999;min-width:100px;height:1.8em;">&nbsp;</td>
      <td style="padding:3px 2px 3px 6px;min-width:100px;">${b ? `${b.nr}. ${b.typ}` : '&nbsp;'}</td>
      <td style="text-align:right;padding:3px 2px;min-width:100px;">${b ? formatBetrag(b.betrag) : '&nbsp;'}</td>
    </tr>`;
  }
  html += `</tbody></table>`;
  return html;
}

// Aufwandskonto LÖSUNG – Soll-Einträge + Saldo im Haben
function renderTKontoLoesung(kontoNr, buchungen, saldo) {
  const alleZeilen = Math.max(buchungen.length, 3);
  let html = `<table style="border-collapse:collapse;width:580px;background:#fff;font-size:1.0em;">
    <thead><tr>
      <th style="width:25%;text-align:left;font-weight:600;padding:4px 0;">Soll</th>
      <th style="text-align:center;font-size:1.0em;padding:4px 0;" colspan="2"><span style="font-weight:700;">${kontoNr}</span></th>
      <th style="width:25%;text-align:right;font-weight:600;padding:4px 0;">Haben</th>
    </tr></thead><tbody>`;
  for (let i = 0; i < alleZeilen; i++) {
    const b = buchungen[i];
    const habenLabel  = i === 0 ? ' 8020 GUV' : '';
    const habenBetrag = i === 0 ? formatBetrag(saldo) : '';
    html += `<tr style="border-top:2px solid #ccc;">
      <td style="padding:3px 2px;white-space:nowrap;">${b ? `${b.nr}. ${b.typ}` : '&nbsp;'}</td>
      <td style="text-align:right;padding:3px 4px 3px 2px;border-right:2px solid #999;min-width:100px;height:1.8em;">${b ? formatBetrag(b.betrag) : '&nbsp;'}</td>
      <td style="padding:3px 2px 3px 6px;min-width:100px;white-space:nowrap;">${habenLabel}</td>
      <td style="text-align:right;padding:3px 2px;min-width:100px;">${habenBetrag}</td>
    </tr>`;
  }
  html += `<tr style="border-top:2px solid #888;border-bottom:4px double #888;">
    <td style="padding:3px 2px;"></td>
    <td style="text-align:right;padding:3px 4px;border-right:2px solid #999;font-weight:700;">${formatBetrag(saldo)}</td>
    <td style="padding:3px 2px 3px 6px;"></td>
    <td style="text-align:right;padding:3px 2px;font-weight:700;">${formatBetrag(saldo)}</td>
  </tr>`;
  html += `</tbody></table>`;
  return html;
}

// UEFE LÖSUNG – Haben-Einträge + Saldo im Soll
function renderTKontoUEFELoesung(buchungen, saldo) {
  const alleZeilen = Math.max(buchungen.length, 3);
  let html = `<table style="border-collapse:collapse;width:580px;background:#fff;font-size:1.0em;">
    <thead><tr>
      <th style="width:25%;text-align:left;font-weight:600;padding:4px 0;">Soll</th>
      <th style="text-align:center;font-size:1.0em;padding:4px 0;" colspan="2"><span style="font-weight:700;">5000 UEFE</span></th>
      <th style="width:25%;text-align:right;font-weight:600;padding:4px 0;">Haben</th>
    </tr></thead><tbody>`;
  for (let i = 0; i < alleZeilen; i++) {
    const b = buchungen[i];
    const sollLabel  = i === 0 ? ' 8020 GUV' : '';
    const sollBetrag = i === 0 ? formatBetrag(saldo) : '';
    html += `<tr style="border-top:2px solid #ccc;">
      <td style="padding:3px 2px;white-space:nowrap;">${sollLabel}</td>
      <td style="text-align:right;padding:3px 4px 3px 2px;border-right:2px solid #999;min-width:100px;height:1.8em;">${sollBetrag}</td>
     <td style="padding:3px 2px 3px 6px;min-width:100px;white-space:nowrap;">${b ? `${b.nr}. ${b.typ}` : '&nbsp;'}</td>
       <td style="text-align:right;padding:3px 2px;min-width:100px;">${b ? formatBetrag(b.betrag) : '&nbsp;'}</td>
    </tr>`;
  }
  html += `<tr style="border-top:2px solid #888;border-bottom:4px double #888;">
    <td style="padding:3px 2px;"></td>
    <td style="text-align:right;padding:3px 4px;border-right:2px solid #999;font-weight:700;">${formatBetrag(saldo)}</td>
    <td style="padding:3px 2px 3px 6px;"></td>
    <td style="text-align:right;padding:3px 2px;font-weight:700;">${formatBetrag(saldo)}</td>
  </tr>`;
  html += `</tbody></table>`;
  return html;
}

// GuV-T-Konto LÖSUNG
function renderTKontoGUV(konten, uefe, erfolgHoehe, erfolgArt) {
  const gesamtAufwand = Object.values(konten).reduce((s, k) => s + k.saldo, 0);
  const isGewinn = erfolgArt === 'Gewinn';

  const sollZeilen = [
    { label: '6000 AWR', betrag: konten['6000 AWR'].saldo },
    { label: '6010 AWF', betrag: konten['6010 AWF'].saldo },
    { label: '6020 AWH', betrag: konten['6020 AWH'].saldo },
    { label: '6030 AWB', betrag: konten['6030 AWB'].saldo },
  ];
  if (isGewinn) sollZeilen.push({ label: '3000 EK', betrag: erfolgHoehe, fett: true });

  const habenZeilen = [{ label: '5000 UEFE', betrag: uefe }];
  if (!isGewinn) habenZeilen.push({ label: '3000 EK', betrag: erfolgHoehe, fett: true });

  const maxZeilen  = Math.max(sollZeilen.length, habenZeilen.length);
  const sollSumme  = isGewinn ? gesamtAufwand + erfolgHoehe : gesamtAufwand;
  const habenSumme = isGewinn ? uefe : uefe + erfolgHoehe;

  let html = `<table style="border-collapse:collapse;width:580px;background:#fff;font-size:1.0em;">
    <thead><tr>
      <th style="width:25%;text-align:left;font-weight:600;padding:4px 0;">Soll</th>
      <th style="text-align:center;font-size:1.0em;padding:4px 0;" colspan="2"><span style="font-weight:700;">8020 GUV</span></th>
      <th style="width:25%;text-align:right;font-weight:600;padding:4px 0;">Haben</th>
    </tr></thead><tbody>`;

  for (let i = 0; i < maxZeilen; i++) {
    const s = sollZeilen[i];
    const h = habenZeilen[i];
    const fett = (s && s.fett) || (h && h.fett) ? 'font-weight:700;' : '';
    html += `<tr style="border-top:2px solid #ccc;">
      <td style="padding:3px 2px;white-space:nowrap;">${s ? s.label : ''}</td>
      <td style="text-align:right;padding:3px 4px 3px 2px;border-right:2px solid #999;min-width:100px;height:1.8em;">${s ? formatBetrag(s.betrag) : ''}</td>
       <td style="padding:3px 2px 3px 6px;min-width:100px;white-space:nowrap;">${h ? h.label : ''}</td>
      <td style="text-align:right;padding:3px 2px;min-width:100px;">${h ? formatBetrag(h.betrag) : ''}</td>
    </tr>`;
  }
  html += `<tr style="border-top:2px solid #888;border-bottom:4px double #888;">
    <td style="padding:3px 2px;"></td>
    <td style="text-align:right;padding:3px 4px;border-right:2px solid #999;font-weight:700;">${formatBetrag(sollSumme)}</td>
    <td style="padding:3px 2px 3px 6px;"></td>
    <td style="text-align:right;padding:3px 2px;font-weight:700;">${formatBetrag(habenSumme)}</td>
  </tr>`;
  html += `</tbody></table>`;
  return html;
}

// ── HAUPTFUNKTION ────────────────────────────────────────────────────────────

function zeigeZufaelligenBestandsabschluss() {
  const container = document.getElementById('Container');
  if (!container) return;
  container.innerHTML = '';

  const { konten, uefeDaten, uefe, gesamtAufwand, erfolg, erfolgArt, erfolgHoehe } =
    erstelleZufaelligenBestandsabschluss();

  // ── AUFGABE ────────────────────────────────────────────────────────────────
  let html = '<h2>Aufgabe</h2>';
  html += `<p>Die folgenden Konten weisen zum Jahresende die aufgeführten Buchungen auf.<br>
    <strong>Schließe alle Konten ab und ermittle Art und Höhe des Unternehmenserfolgs.</strong></p>`;

  html += `<div style="display:flex;flex-wrap:wrap;gap:18px;margin:1.5em 0 2em;">`;
  Object.entries(konten).forEach(([nr, data]) => {
    html += `<div>${renderTKontoAufgabe(nr, data.buchungen)}</div>`;
  });
  html += `<div>${renderTKontoUEFEAufgabe(uefeDaten.buchungen)}</div>`;
  html += `</div>`;

  // ── LÖSUNG ─────────────────────────────────────────────────────────────────
  html += `<h2 style="margin-top:2.5em">Lösung</h2>`;

  // Buchungssätze
  html += `<strong>Buchungssätze:</strong>
  <table style="white-space:nowrap;background-color:#fff;font-family:courier;min-width:700px;"><tbody>`;

  Object.entries(konten).forEach(([nr, data]) => {
    html += `<tr>
      <td style="padding:2px 10px 2px 0;white-space:nowrap;">8020 GUV</td>
      <td style="padding:2px 10px;text-align:center;">an</td>
      <td style="padding:2px 10px;white-space:nowrap;">${nr}</td>
      <td style="padding:2px 0;text-align:right;min-width:120px;">${formatBetrag(data.saldo)} €</td>
    </tr>`;
  });

  html += `<tr><td colspan="4" style="padding:4px 0;"></td></tr>`;
  html += `<tr>
    <td style="padding:2px 10px 2px 0;white-space:nowrap;">5000 UEFE</td>
    <td style="padding:2px 10px;text-align:center;">an</td>
    <td style="padding:2px 10px;white-space:nowrap;">8020 GUV</td>
    <td style="padding:2px 0;text-align:right;min-width:120px;">${formatBetrag(uefe)} €</td>
  </tr>`;

  html += `<tr><td colspan="4" style="padding:4px 0;"></td></tr>`;

  if (erfolg >= 0) {
    html += `<tr style="font-weight:700;">
      <td style="padding:2px 10px 2px 0;white-space:nowrap;">8020 GUV</td>
      <td style="padding:2px 10px;text-align:center;">an</td>
      <td style="padding:2px 10px;white-space:nowrap;">3000 EK</td>
      <td style="padding:2px 0;text-align:right;min-width:120px;">${formatBetrag(erfolgHoehe)} €</td>
    </tr>`;
  } else {
    html += `<tr style="font-weight:700;">
      <td style="padding:2px 10px 2px 0;white-space:nowrap;">3000 EK</td>
      <td style="padding:2px 10px;text-align:center;">an</td>
      <td style="padding:2px 10px;white-space:nowrap;">8020 GUV</td>
      <td style="padding:2px 0;text-align:right;min-width:120px;">${formatBetrag(erfolgHoehe)} €</td>
    </tr>`;
  }
  html += `</tbody></table>`;

  // Abgeschlossene T-Konten
  html += `<br>`;
  html += `<div style="display:flex;flex-wrap:wrap;gap:18px;margin-bottom:2em;">`;
  Object.entries(konten).forEach(([nr, data]) => {
    html += `<div>${renderTKontoLoesung(nr, data.buchungen, data.saldo)}</div>`;
  });
  html += `<div>${renderTKontoUEFELoesung(uefeDaten.buchungen, uefeDaten.saldo)}</div>`;
  html += `</div>`;

  // GuV-Konto
  html += `<br>`;
  html += renderTKontoGUV(konten, uefe, erfolgHoehe, erfolgArt);

  // Ergebnis
  html += `<p style="font-size:1.15em;font-weight:bold;margin-top:1.8em;">
    Unternehmenserfolg: ${erfolgArt} in Höhe von ${formatBetrag(erfolgHoehe)} €
  </p>`;

  container.innerHTML = html;
}

// ── KI-PROMPT ────────────────────────────────────────────────────────────────

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Buchführungs-Assistent für Schüler der Realschule (BwR), 8. Klasse. Du hilfst beim Verständnis des Jahresabschlusses – speziell beim Abschluss der Erfolgskonten (Aufwandskonten und Ertragskonten) über das GuV-Konto.

Aufgabe:
- Gib KEINE fertigen Buchungssätze, T-Konten oder Ergebnisse vor.
- Führe die Schüler durch gezielte Fragen und Hinweise zur richtigen Lösung.
- Ziel: Lernförderung, nicht das Abnehmen der Denkarbeit.

Pädagogischer Ansatz:
- Frage nach den vorliegenden Salden und was diese bedeuten.
- Stelle gezielte Rückfragen, um den Stand des Schülers zu verstehen.
- Beantworte deine Rückfragen nicht selbst – hake bei falschen Antworten nach.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Erst wenn alle Teilschritte richtig beantwortet wurden, bestätige den vollständigen Abschluss.

---

THEMA: ABSCHLUSS DER AUFWANDSKONTEN ÜBER DAS GUV-KONTO

Aufwandskonten:
- 6000 AWR – Aufwendungen für Rohstoffe
- 6010 AWF – Aufwendungen für Fremdbauteile
- 6020 AWH – Aufwendungen für Hilfsstoffe
- 6030 AWB – Aufwendungen für Betriebsstoffe

Ertragskonto:
- 5000 UEFE – Umsatzerlöse aus Fertigerzeugnissen

GuV-Konto:
- 8020 GUV – Gewinn- und Verlustkonto

Eigenkapitalkonto:
- 3000 EK – Eigenkapital

---

METHODIK BEI RÜCKFRAGEN:
- Was bedeuten VE, BK, KA auf der Soll-Seite des Aufwandskontos?
- Wie ermittle ich den Saldo eines Aufwandskontos (nur Soll-Einträge)?
- Warum steht der Saldo beim Abschluss auf der Haben-Seite des Aufwandskontos?
- Wohin wird der Saldo übertragen – ins Soll oder ins Haben des GuV?
- Wie ermittle ich den Unternehmenserfolg aus dem GuV-Konto?
- Wohin geht der Erfolg (Gewinn/Verlust) beim Abschluss des GuV?

---

BUCHUNGSSÄTZE – SCHRITT FÜR SCHRITT

Schritt 1 – Saldo der Aufwandskonten ermitteln:
  Saldo = Summe aller Soll-Buchungen (da nur Soll-Einträge vorhanden sind)

Schritt 2 – Aufwandskonten abschließen (je ein Buchungssatz pro Konto):
  8020 GUV an 6000 AWR | Saldo
  8020 GUV an 6010 AWF | Saldo
  8020 GUV an 6020 AWH | Saldo
  8020 GUV an 6030 AWB | Saldo

Schritt 3 – Ertragskonto abschließen:
  5000 UEFE an 8020 GUV | Betrag

Schritt 4 – GuV abschließen:
  Gewinn → 8020 GUV an 3000 EK | Gewinnbetrag
  Verlust → 3000 EK an 8020 GUV | Verlustbetrag

---

HÄUFIGE SCHÜLERFEHLER:
- Saldo falsch berechnet (einzelne Buchungen vergessen)
- Aufwandskonten ins Haben des GuV statt ins Soll gebucht
- Summe und Saldo verwechselt
- EK bei Gewinn auf falscher Seite eingetragen
- Summen im T-Konto stimmen nicht überein

---

Tonalität:
- Freundlich, ermutigend, Realschulniveau
- Einfache Sprache, kurze Antworten (1–2 Sätze)
- Gelegentlich Emojis 📊✅❓💡

Was du NICHT tust:
- Keine fertigen Lösungen nennen, bevor der Schüler sie selbst erarbeitet hat
- Nicht vorrechnen, bevor der Schüler es versucht hat
`;

function kopiereKiPrompt() {
  navigator.clipboard.writeText(KI_ASSISTENT_PROMPT_BESTAND).then(() => {
    const btn = document.getElementById('kiPromptKopierenBtn');
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Kopiert!`;
    btn.classList.add('ki-prompt-btn--success');
    setTimeout(() => {
      btn.innerHTML = originalHTML;
      btn.classList.remove('ki-prompt-btn--success');
    }, 2500);
  }).catch(() => {
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

document.addEventListener('DOMContentLoaded', function () {
  zeigeZufaelligenBestandsabschluss();
  const vorschauEl = document.getElementById('kiPromptVorschau');
  if (vorschauEl) vorschauEl.textContent = KI_ASSISTENT_PROMPT;
});