// js/bestand.js

// Konten für Werkstoffe
const werkstoffe = [
  { name: "Rohstoffe", aufwand: "6000 AWR", bestand: "2000 R", faktor: 2 }, // ← Rohstoffe 10x höher
  { name: "Fremdbauteile", aufwand: "6010 AWF", bestand: "2010 F" },
  { name: "Hilfsstoffe", aufwand: "6020 AWH", bestand: "2020 H" },
  { name: "Betriebsstoffe", aufwand: "6030 AWB", bestand: "2030 B" }
];

// Hilfsfunktion für zufällige Bestände
function generateRandomBestand(faktor = 1) {
  // Basisbereich: 1.000 – 50.000
  // Rohstoffe bekommen Faktor ~10 → 10.000 – 500.000
  const min = 1000 * faktor;
  const max = 50000 * faktor;
  return Math.round((Math.random() * (max - min) + min) / 100) * 100;
}

// Formatierung (unverändert)
function formatBetrag(value) {
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function erstelleZufaelligeBestandsveraenderungen() {
  const bestandsdaten = werkstoffe.map(w => {
    // Rohstoffe bekommen explizit den 10-fachen Faktor
    const faktor = w.faktor || 1;
    const anfangs = generateRandomBestand(faktor);
    const schluss = generateRandomBestand(faktor);
    const veraenderung = schluss - anfangs;
    const art = veraenderung > 0 ? "Mehrung" : "Minderung";
    const betrag = Math.abs(veraenderung);
    let buchung = "";
    if (veraenderung > 0) {
      buchung = `${w.bestand} an ${w.aufwand}`;
    } else if (veraenderung < 0) {
      buchung = `${w.aufwand} an ${w.bestand}`;
    } else {
      buchung = "Keine Veränderung – keine Buchung";
    }
    return { ...w, anfangs, schluss, veraenderung, art, betrag, buchung };
  });

  return bestandsdaten;
}

function zeigeZufaelligeBestandsveraenderungen() {
  const container = document.getElementById('Container');
  if (!container) return;

  container.innerHTML = '';

  const bestandsdaten = erstelleZufaelligeBestandsveraenderungen();

  // ── AUFGABE ───────────────────────────────────────────────────────────────
  let html = '<h2>Aufgabe</h2>';
  html += `<p>Berechne die Bestandsveränderungen für die Werkstoffe:</p>`;
  html += `<table style="border-collapse: collapse; width: 100%; max-width: 900px; margin-bottom: 2em; font-family: courier;">`;
  html += `<thead><tr style="background:#f0f0f0;"><th style="padding:8px; text-align:left;">Werkstoff</th><th style="padding:8px; text-align:right;">Anfangsbestand €</th><th style="padding:8px; text-align:right;">Schlussbestand €</th><th style="padding:8px; text-align:right;">Bestandsveränderung €</th><th style="padding:8px; text-align:right;">Art</th></tr></thead>`;
  html += `<tbody>`;
  bestandsdaten.forEach(d => {
    html += `<tr style="border-bottom:1px solid #ccc;">
      <td style="padding:8px;">${d.name}</td>
      <td style="padding:8px; text-align:right;">${formatBetrag(d.anfangs)}</td>
      <td style="padding:8px; text-align:right;">${formatBetrag(d.schluss)}</td>
      <td style="padding:8px; text-align:right;">&nbsp;</td>
      <td style="padding:8px; text-align:right;">&nbsp;</td>
    </tr>`;
  });
  html += `</tbody></table>`;

  html += `<p>Bilde die Buchungssätze zu den ermittelten Bestandsveränderungen.</p>`;

  // ── LÖSUNG ────────────────────────────────────────────────────────────────
  html += '<h2 style="margin-top:2.5em" class="loesung">Lösung</h2>';

  // Tabelle mit Veränderungen (wie in Aufgabe, aber jetzt ausgefüllt)
  html += `<table style="border-collapse: collapse; width: 100%; max-width: 900px; margin-bottom: 2em; font-family: courier;">`;
  html += `<thead><tr style="background:#f0f0f0;"><th style="padding:8px; text-align:left;">Werkstoff</th><th style="padding:8px; text-align:right;">Anfangsbestand €</th><th style="padding:8px; text-align:right;">Schlussbestand €</th><th style="padding:8px; text-align:right;">Bestandsveränderung €</th><th style="padding:8px; text-align:left;">Art</th></tr></thead>`;
  html += `<tbody>`;
  bestandsdaten.forEach(d => {
    html += `<tr style="border-bottom:1px solid #ccc;">
      <td style="padding:8px;">${d.name}</td>
      <td style="padding:8px; text-align:right;">${formatBetrag(d.anfangs)}</td>
      <td style="padding:8px; text-align:right;">${formatBetrag(d.schluss)}</td>
      <td style="padding:8px; text-align:right;">${d.veraenderung !== 0 ? formatBetrag(d.betrag) : '—'}</td>
      <td style="padding:8px;">${d.art}</td>
    </tr>`;
  });
  html += `</tbody></table>`;

  // ── BUCHUNGSSÄTZE (separat darunter, im gewohnten Tabellen-Format) ───────
  html += `<strong>Buchungssätze:</strong><br>`;
  html += `
  <table style="white-space:nowrap; background-color:#fff; font-family:courier; min-width:700px; border-collapse:collapse; margin:1em 0 1.8em 0;">
    <tbody>`;

bestandsdaten.forEach(d => {
  if (d.veraenderung !== 0) {
    html += `
    <tr>
      <td style="white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 150px; max-width: 150px" tabindex="1">${d.buchung.split(' an ')[0]}</td>
      <td style="text-align:right; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 160px; max-width: 160px" tabindex="1"></td>
      <td style="text-align: center; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 80px" tabindex="1">an</td>
      <td style="white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 150px; max-width: 150px" tabindex="1">${d.buchung.split(' an ')[1]}</td>
      <td style="white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 160px; max-width: 160px; text-align: right" tabindex="1">${formatBetrag(d.betrag)} €</td>
    </tr>`;
  } else {
    html += `
    <tr>
      <td style="white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 150px; max-width: 150px" colspan="5" tabindex="1"><em>${d.name}: Keine Bestandsveränderung – keine Buchung</em></td>
    </tr>`;
  }
});

  html += `</tbody></table>`;

  container.innerHTML = html;
}

// ── KI-ASSISTENT PROMPT ─────────────────────────────────────────────────────

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Buchführungs-Assistent für Schüler der Realschule (BwR), 8. Klasse. Du hilfst beim Verständnis von Bestandsveränderungen bei Werkstoffen – speziell beim Berechnen von Mehrungen und Minderungen sowie beim Ableiten der richtigen Buchungssätze.

Aufgabe:
- Gib KEINE fertigen Buchungssätze oder Ergebnisse vor.
- Führe die Schüler durch gezielte Fragen und Hinweise zur richtigen Lösung.
- Ziel: Lernförderung, nicht das Abnehmen der Denkarbeit.

Pädagogischer Ansatz:
- Frage nach Anfangs- und Schlussbestand und was die Differenz bedeutet.
- Stelle gezielte Rückfragen, um den Stand des Schülers zu verstehen.
- Beantworte deine Rückfragen nicht selbst – hake bei falschen Antworten nach.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Erst wenn alle Teilschritte richtig beantwortet wurden, bestätige die vollständige Lösung.

---

THEMA: BESTANDSVERÄNDERUNGEN BEI WERKSTOFFEN

Bestandskonten (Aktivkonten):
- 2000 R  – Rohstoffe
- 2010 F  – Fremdbauteile
- 2020 H  – Hilfsstoffe
- 2030 B  – Betriebsstoffe

Aufwandskonten (Erfolgskonten):
- 6000 AWR – Aufwendungen für Rohstoffe
- 6010 AWF – Aufwendungen für Fremdbauteile
- 6020 AWH – Aufwendungen für Hilfsstoffe
- 6030 AWB – Aufwendungen für Betriebsstoffe

---

METHODIK BEI RÜCKFRAGEN:
- Was ist der Unterschied zwischen Anfangsbestand und Schlussbestand?
- Wie berechnet man die Bestandsveränderung (Mehrung oder Minderung)?
- Wann liegt eine Bestandsmehrung vor, wann eine Bestandsminderung?
- Was passiert buchhalterisch bei einer Mehrung – welches Konto wird im Soll, welches im Haben gebucht?
- Was passiert buchhalterisch bei einer Minderung – welches Konto wird im Soll, welches im Haben gebucht?
- Welcher Betrag steht im Buchungssatz?

---

BUCHUNGSSÄTZE – SCHRITT FÜR SCHRITT

Schritt 1 – Bestandsveränderung berechnen:
  Veränderung = Schlussbestand – Anfangsbestand
  → Positives Ergebnis = Bestandsmehrung
  → Negatives Ergebnis = Bestandsminderung

Schritt 2 – Buchungssatz ableiten:
  Bestandsmehrung (Schlussbestand > Anfangsbestand):
    Bestandskonto (z. B. 2000 R) an Aufwandskonto (z. B. 6000 AWR) | Betrag

  Bestandsminderung (Schlussbestand < Anfangsbestand):
    Aufwandskonto (z. B. 6000 AWR) an Bestandskonto (z. B. 2000 R) | Betrag

  Keine Veränderung (Schlussbestand = Anfangsbestand):
    Keine Buchung notwendig

---

LOGIK DAHINTER (für Verständnis):
- Aufwandskonten zeigen den Verbrauch an Werkstoffen.
- Bei einer Minderung wurde mehr verbraucht als zugegangen → Aufwand steigt → Aufwandskonto im Soll.
- Bei einer Mehrung wurde mehr zugegangen als verbraucht → Aufwand sinkt → Bestandskonto im Soll (Aufwandskonto im Haben = Aufwand wird reduziert).

---

HÄUFIGE SCHÜLERFEHLER:
- Vorzeichen der Bestandsveränderung falsch (Minderung als Mehrung eingestuft)
- Soll und Haben im Buchungssatz vertauscht
- Falschen Betrag verwendet (z. B. Schlussbestand statt Differenz)
- Buchung trotz keiner Veränderung erstellt
- Bestandskonto und Aufwandskonto verwechselt

---

Tonalität:
- Freundlich, ermutigend, Realschulniveau
- Einfache Sprache, kurze Antworten (1–2 Sätze)
- Gelegentlich Emojis 📦✅❓💡

Was du NICHT tust:
- Keine fertigen Lösungen nennen, bevor der Schüler sie selbst erarbeitet hat
- Nicht vorrechnen, bevor der Schüler es versucht hat
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
  zeigeZufaelligeBestandsveraenderungen();
  const vorschauEl = document.getElementById('kiPromptVorschau');
  if (vorschauEl) vorschauEl.textContent = KI_ASSISTENT_PROMPT;
});


