// js/guv.js – Version mit strikter oberer Ausrichtung + UEFE ganz oben Haben + EK direkt darunter

// Globale Variable
let yamlData = [];
let unternehmen = '<i>[Modellunternehmen]</i>';

// (Die YAML-Ladefunktionen können wie zuvor bleiben – hier nur der relevante Teil)

function formatBetrag(value) {
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Zufällige Salden – angepasst für breitere Streuung
function generateRandomSaldo(min, max) {
  return Math.round((Math.random() * (max - min) + min) / 100) * 100;
}

function erstelleZufaelligenAbschluss() {
  const awr = generateRandomSaldo( 50000, 400000);
  const awf = generateRandomSaldo( 10000,  100000);
  const awh = generateRandomSaldo(  2000,   10000);
  const awb = generateRandomSaldo(  10000,  50000);

  const uefe = generateRandomSaldo(300000, 600000);

  const salden = {
    "6000 AWR":  awr,
    "6010 AWF":  awf,
    "6020 AWH":  awh,
    "6030 AWB":  awb,
    "5000 UEFE": uefe
  };

  const gesamtAufwand = awr + awf + awh + awb;
  const gesamtErtrag  = uefe;
  const erfolg        = gesamtErtrag - gesamtAufwand;
  const erfolgArt     = erfolg >= 0 ? "Gewinn" : "Verlust";
  const erfolgHoehe   = Math.abs(erfolg);

  return { salden, gesamtAufwand, gesamtErtrag, erfolg, erfolgArt, erfolgHoehe };
}

function zeigeZufaelligenAbschluss() {
  const container = document.getElementById('Container');  // ← korrigierter ID-Name
  if (!container) return;

  container.innerHTML = '';

  const { salden, erfolg, erfolgArt, erfolgHoehe } = erstelleZufaelligenAbschluss();

  // ── AUFGABE ───────────────────────────────────────────────────────────────
  let html = '<h2>Aufgabe</h2>';
  html += `<p>Das Unternehmen weist zum Bilanzstichtag folgende Salden aus:</p>`;
  html += `<ul style="line-height:1.6; margin-bottom:1.5em;">`;
  Object.keys(salden).forEach(konto => {
    html += `<li><strong>${konto}:</strong> ${formatBetrag(salden[konto])} €</li>`;
  });
  html += `</ul>`;
  html += `<p>Übertrage die Salden in das GuV-Konto, schließ es ab und ermittle Art und Höhe des Unternehmenserfolgs.</p>`;

  // Leeres T-Konto
  html += `<div style="width:100%;display:flex;flex-direction:row;flex-wrap:wrap;gap:12px">`;
  html += `<table style="margin: 0 auto;border-collapse: collapse;width:650px;background-color:#fff"><tbody>`;
  html += `<tr><th style="width:25%;text-align:left">Soll</th><th style="text-align:center;" colspan="2">8020 GUV</th><th style="width:25%;text-align:right;">Haben</th></tr>`;
  for (let i = 0; i < 6; i++) {
    html += `<tr style="border-top: 2px solid #AAAAAA">`;
    html += `<td style="border-top: 2px solid #AAAAAA;width:25%; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; max-width: 160px">&nbsp;</td>`;
    html += `<td style="border-top: 2px solid #AAAAAA;border-right: 2px solid #AAAAAA;width:25%; text-align:right; padding-right: 2px; height: 2em; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; max-width: 160px">&nbsp;</td>`;
    html += `<td style="border-top: 2px solid #AAAAAA;width:25%; border-left: 1px solid #AAAAAA; padding-left: 2px; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; max-width: 160px">&nbsp;</td>`;
    html += `<td style="border-top: 2px solid #AAAAAA;width:25%; text-align:right; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; max-width: 160px">&nbsp; </td>`;
    html += `</tr>`;
  }
  html += `</tbody></table><br><div></div></div>`;

  // ── LÖSUNG ────────────────────────────────────────────────────────────────
  html += '<h2 style="margin-top:2.5em">Lösung</h2>';

  // Buchungssätze
html += `<strong>Buchungssätze:</strong><br>`;

html += `
<table style="white-space:nowrap; background-color:#fff; font-family:courier; min-width:700px; border-collapse:collapse; margin:1em 0 1.8em 0;">
  <tbody>`;

// Alle vier Aufwandsbuchungen – 8020 GUV steht jetzt immer links
["6000 AWR", "6010 AWF", "6020 AWH", "6030 AWB"].forEach(konto => {
  html += `
  <tr>
    <td style="white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 150px; max-width: 150px" tabindex="1">8020 GUV</td>
    <td style="text-align:right; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 160px; max-width: 160px" tabindex="1"></td>
    <td style="text-align: center; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 80px" tabindex="1">an</td>
    <td style="white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 150px; max-width: 150px" tabindex="1">${konto}</td>
    <td style="white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 160px; max-width: 160px; text-align: right" tabindex="1">${formatBetrag(salden[konto])}</td>
  </tr>`;
});

// Ertragsbuchung (umgekehrt → Ertrag an GuV)
html += `
  <tr>
    <td style="white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 150px; max-width: 150px" tabindex="1">5000 UEFE</td>
    <td style="text-align:right; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 160px; max-width: 160px" tabindex="1"></td>
    <td style="text-align: center; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 80px" tabindex="1">an</td>
    <td style="white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 150px; max-width: 150px" tabindex="1">8020 GUV</td>
    <td style="white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 160px; max-width: 160px; text-align: right" tabindex="1">${formatBetrag(salden["5000 UEFE"])}</td>
  </tr>`;

// Abschlussbuchung
if (erfolg >= 0) {
  html += `
  <tr>
    <td style="white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 150px; max-width: 150px; font-weight:bold;" tabindex="1">8020 GUV</td>
    <td style="text-align:right; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 160px; max-width: 160px; font-weight:bold;" tabindex="1"></td>
    <td style="text-align: center; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 80px; font-weight:bold;" tabindex="1">an</td>
    <td style="white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 150px; max-width: 150px; font-weight:bold;" tabindex="1">3000 EK</td>
    <td style="white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 160px; max-width: 160px; text-align: right; font-weight:bold;" tabindex="1">${formatBetrag(erfolgHoehe)}</td>
  </tr>`;
} else {
  html += `
  <tr>
    <td style="white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 150px; max-width: 150px; font-weight:bold;" tabindex="1">3000 EK</td>
    <td style="text-align:right; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 160px; max-width: 160px; font-weight:bold;" tabindex="1"></td>
    <td style="text-align: center; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 80px; font-weight:bold;" tabindex="1">an</td>
    <td style="white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 150px; max-width: 150px; font-weight:bold;" tabindex="1">8020 GUV</td>
    <td style="white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 160px; max-width: 160px; text-align: right; font-weight:bold;" tabindex="1">${formatBetrag(erfolgHoehe)}</td>
  </tr>`;
}

html += `
  </tbody>
</table>`;

 // ── T-KONTO ───────────────────────────────────────────────────────────────
html += `<strong style="margin-top:2em; display:block;">T-Konto 8020 GUV:</strong><br>`;
html += `<div style="width:100%;display:flex;flex-direction:row;flex-wrap:wrap;gap:12px">`;
html += `<table style="margin: 0 auto;border-collapse: collapse;width:650px;background-color:#fff"><tbody>`;
html += `<tr><th style="width:25%;text-align:left">Soll</th><th style="text-align:center;" colspan="2">8020 GUV</th><th style="width:25%;text-align:right;">Haben</th></tr>`;

// Zeile 1: AWR + UEFE
html += `
<tr style="border-top: 2px solid #AAAAAA">
  <td style="border-top: 2px solid #AAAAAA;width:25%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:160px">6000 AWR</td>
  <td style="border-top: 2px solid #AAAAAA;border-right:2px solid #AAAAAA;width:25%;text-align:right;padding-right:2px;height:2em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px">${formatBetrag(salden["6000 AWR"])}</td>
  <td style="border-top: 2px solid #AAAAAA;width:25%;border-left:1px solid #AAAAAA;padding-left:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px">5000 UEFE</td>
  <td style="border-top: 2px solid #AAAAAA;width:25%;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px">${formatBetrag(salden["5000 UEFE"])}</td>
</tr>`;

// Zeile 2: AWF + bei Verlust EK
html += `
<tr style="border-top: 2px solid #AAAAAA">
  <td style="border-top: 2px solid #AAAAAA;width:25%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px">6010 AWF</td>
  <td style="border-top: 2px solid #AAAAAA;border-right:2px solid #AAAAAA;width:25%;text-align:right;padding-right:2px;height:2em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px">${formatBetrag(salden["6010 AWF"])}</td>
  <td style="border-top: 2px solid #AAAAAA;width:25%;border-left:1px solid #AAAAAA;padding-left:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px">`;
if (erfolg < 0) html += `3000 EK`;
html += `</td>
  <td style="border-top: 2px solid #AAAAAA;width:25%;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px">`;
if (erfolg < 0) html += `${formatBetrag(erfolgHoehe)}`;
html += `</td>
</tr>`;

// Zeile 3: AWH
html += `
<tr style="border-top: 2px solid #AAAAAA">
  <td style="border-top: 2px solid #AAAAAA;width:25%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px">6020 AWH</td>
  <td style="border-top: 2px solid #AAAAAA;border-right:2px solid #AAAAAA;width:25%;text-align:right;padding-right:2px;height:2em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px">${formatBetrag(salden["6020 AWH"])}</td>
  <td style="border-top: 2px solid #AAAAAA;width:25%;border-left:1px solid #AAAAAA;padding-left:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px">&nbsp;</td>
  <td style="border-top: 2px solid #AAAAAA;width:25%;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px">&nbsp;</td>
</tr>`;

// Zeile 4: AWB
html += `
<tr style="border-top: 2px solid #AAAAAA">
  <td style="border-top: 2px solid #AAAAAA;width:25%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px">6030 AWB</td>
  <td style="border-top: 2px solid #AAAAAA;border-right:2px solid #AAAAAA;width:25%;text-align:right;padding-right:2px;height:2em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px">${formatBetrag(salden["6030 AWB"])}</td>
  <td style="border-top: 2px solid #AAAAAA;width:25%;border-left:1px solid #AAAAAA;padding-left:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px">&nbsp;</td>
  <td style="border-top: 2px solid #AAAAAA;width:25%;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px">&nbsp;</td>
</tr>`;

// Zeile 5: Bei Gewinn EK im Soll
if (erfolg >= 0) {
  html += `
  <tr style="border-top: 2px solid #AAAAAA">
    <td style="border-top: 2px solid #AAAAAA;width:25%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px">3000 EK</td>
    <td style="border-top: 2px solid #AAAAAA;border-right:2px solid #AAAAAA;width:25%;text-align:right;padding-right:2px;height:2em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px">${formatBetrag(erfolgHoehe)}</td>
    <td style="border-top: 2px solid #AAAAAA;width:25%;border-left:1px solid #AAAAAA;padding-left:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px">&nbsp;</td>
    <td style="border-top: 2px solid #AAAAAA;width:25%;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px">&nbsp;</td>
  </tr>`;
}

// Leerzeilen (je nach Fall 1–2)
const leerZeilenAnzahl = erfolg >= 0 ? 1 : 2;
for (let i = 0; i < leerZeilenAnzahl; i++) {
  html += `
  <tr style="border-top: 2px solid #AAAAAA">
    <td style="border-top: 2px solid #AAAAAA;width:25%;">&nbsp;</td>
    <td style="border-top: 2px solid #AAAAAA;border-right:2px solid #AAAAAA;width:25%;text-align:right;">&nbsp;</td>
    <td style="border-top: 2px solid #AAAAAA;width:25%;border-left:1px solid #AAAAAA;padding-left:2px;">&nbsp;</td>
    <td style="border-top: 2px solid #AAAAAA;width:25%;text-align:right;">&nbsp;</td>
  </tr>`;
}

// ── SUMMENZEILE ───────────────────────────────────────────────────────────
let sollSumme = salden["6000 AWR"] + salden["6010 AWF"] + salden["6020 AWH"] + salden["6030 AWB"];
let habenSumme = salden["5000 UEFE"];

if (erfolg >= 0) {
  sollSumme += erfolgHoehe;  // EK im Soll bei Gewinn
} else {
  habenSumme += erfolgHoehe; // EK im Haben bei Verlust
}

// Summenzeile
html += `
<tr style="border-bottom: 6px double #AAAAAA; border-top: 3px solid #AAAAAA;">
  <td style="border-top: 2px solid #AAAAAA;width:25%; height: 2em; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; max-width: 160px"></td>
  <td style="border-top: 2px solid #AAAAAA;border-right: 2px solid #AAAAAA;width:25%; text-align:right; padding-right: 2px; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; max-width: 160px">
    <strong>${formatBetrag(sollSumme)}</strong>
  </td>
  <td style="border-top: 2px solid #AAAAAA;width:25%; border-left: 1px solid #AAAAAA; padding-left: 2px; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; max-width: 160px"></td>
  <td style="border-top: 2px solid #AAAAAA;width:25%; text-align:right; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; max-width: 160px">
    <strong>${formatBetrag(habenSumme)}</strong>
  </td>
</tr>`;

html += `</tbody></table><br><div></div></div>`;

  // Endergebnis
  html += `<p style="font-size:1.15em; margin-top:1.8em; font-weight:bold;">`;
  html += `Unternehmenserfolg: ${erfolgArt} in Höhe von ${formatBetrag(erfolgHoehe)} €`;
  html += `</p>`;

  container.innerHTML = html;
}
// ============================================================================
// KI-ASSISTENT PROMPT – GUV-ABSCHLUSS (Gewinn- und Verlustrechnung)
// ============================================================================

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Buchführungs-Assistent für Schüler der Realschule (BwR), 8. Klasse. Du hilfst beim Verständnis des Jahresabschlusses – speziell beim Abschluss über das Gewinn- und Verlustkonto (GuV).

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

THEMA: ABSCHLUSS ÜBER DAS GUV-KONTO (8020 GUV)

Methodik bei Rückfragen:
- Was zeigt ein Saldo auf einem Aufwandskonto – steht er im Soll oder im Haben?
- Was zeigt ein Saldo auf einem Ertragskonto – steht er im Soll oder im Haben?
- Wohin werden Aufwandskonten abgeschlossen – ins Soll oder ins Haben des GuV?
- Wohin werden Ertragskonten abgeschlossen – ins Soll oder ins Haben des GuV?
- Was passiert, wenn die Haben-Seite des GuV größer ist als die Soll-Seite?
- Was passiert, wenn die Soll-Seite des GuV größer ist als die Haben-Seite?
- Wohin wird der Erfolg des GuV-Kontos schließlich übertragen?

---

KONTENPLAN – GUV-ABSCHLUSS

Aufwandskonten (Saldo steht im SOLL → werden ins SOLL des GuV übertragen):
- 6000 AWR  – Aufwendungen für Rohstoffe
- 6010 AWF  – Aufwendungen für Fremdbauteile
- 6020 AWH  – Aufwendungen für Hilfsstoffe
- 6030 AWB  – Aufwendungen für Betriebsstoffe

Ertragskonto (Saldo steht im HABEN → wird ins HABEN des GuV übertragen):
- 5000 UEFE – Umsatzerlöse aus Fertigerzeugnissen

GuV-Konto:
- 8020 GUV  – Gewinn- und Verlustkonto (Abschlusskonto für Erfolgskonten)

Eigenkapitalkonto (Abschlusskonto des GuV):
- 3000 EK   – Eigenkapital

---

BUCHUNGSSÄTZE – SCHRITT FÜR SCHRITT

Schritt 1 – Aufwandskonten abschließen (je ein Buchungssatz pro Konto):
  8020 GUV (Soll) an 6000 AWR (Haben) | Betrag
  8020 GUV (Soll) an 6010 AWF (Haben) | Betrag
  8020 GUV (Soll) an 6020 AWH (Haben) | Betrag
  8020 GUV (Soll) an 6030 AWB (Haben) | Betrag

  Merkhilfe: Der Saldo des Aufwandskontos steht im Soll → zum Abschluss muss er auf die Haben-Seite → GuV steht im Soll.

Schritt 2 – Ertragskonto abschließen:
  5000 UEFE (Soll) an 8020 GUV (Haben) | Betrag

  Merkhilfe: Der Saldo des Ertragskontos steht im Haben → zum Abschluss muss er auf die Soll-Seite → GuV steht im Haben.

Schritt 3 – GuV-Konto abschließen (Erfolg ermitteln):
  Fall A – Gewinn (Haben-Seite > Soll-Seite):
    8020 GUV (Soll) an 3000 EK (Haben) | Gewinnbetrag
    → Gewinn erhöht das Eigenkapital → EK im Haben

  Fall B – Verlust (Soll-Seite > Haben-Seite):
    3000 EK (Soll) an 8020 GUV (Haben) | Verlustbetrag
    → Verlust vermindert das Eigenkapital → EK im Soll

---

T-KONTO 8020 GUV – AUFBAU

Soll-Seite (Aufwendungen + Ausgleich bei Gewinn):
  6000 AWR  | Betrag
  6010 AWF  | Betrag
  6020 AWH  | Betrag
  6030 AWB  | Betrag
  3000 EK   | Gewinnbetrag   ← nur bei Gewinn (Ausgleich, da Haben-Seite größer)

Haben-Seite (Erträge + Ausgleich bei Verlust):
  5000 UEFE | Betrag
  3000 EK   | Verlustbetrag  ← nur bei Verlust (Ausgleich, da Soll-Seite größer)

Merkhilfe T-Konto:
  Gewinn  → Haben-Seite (Erträge) war größer → EK auf die kleinere SOLL-Seite, um auszugleichen
  Verlust → Soll-Seite (Aufwände) war größer → EK auf die kleinere HABEN-Seite, um auszugleichen

Summenregel: Soll-Summe = Haben-Summe (nach Eintrag des Erfolgs muss das Konto ausgeglichen sein)

Erfolgsermittlung:
  Gesamtertrag − Gesamtaufwand = Erfolg
  Positiv → Gewinn
  Negativ → Verlust
  Betrag = absoluter Wert des Erfolgs

---

HÄUFIGE SCHÜLERFEHLER

- Aufwandskonten ins Haben des GuV statt ins Soll gebucht
- Ertragskonto ins Soll des GuV statt ins Haben gebucht
- Buchungssätze für Aufwand und Ertrag vertauscht
- Erfolg (Gewinn/Verlust) auf falscher Seite des GuV eingetragen
- Bei Gewinn: EK ins Soll statt ins Haben
- Bei Verlust: EK ins Haben statt ins Soll
- Summen nicht ausgeglichen (Rechen- oder Übertragungsfehler)
- Salden der Aufwandskonten addiert, aber Ertrag vergessen oder umgekehrt

---

ERKLÄRUNGSHILFEN FÜR SCHÜLER

Warum gehen Aufwandskonten ins SOLL des GuV?
→ Aufwandskonten haben ihren Saldo im Soll. Um das Konto auszugleichen (zu schließen), muss man die Haben-Seite füllen. Der Gegeneintrag landet dann im Soll des GuV.

Warum gehen Ertragskonten ins HABEN des GuV?
→ Ertragskonten haben ihren Saldo im Haben. Zum Abschluss muss man die Soll-Seite füllen. Der Gegeneintrag landet im Haben des GuV.

Warum steht EK bei Gewinn im SOLL des GuV-T-Kontos?
→ Die Haben-Seite (Erträge) ist größer als die Soll-Seite (Aufwände). Das GuV-Konto muss ausgeglichen werden → EK kommt auf die kleinere Soll-Seite. Im Buchungssatz lautet das: 8020 GUV an 3000 EK → EK im Haben des EK-Kontos, d. h. das Eigenkapital steigt.

Warum steht EK bei Verlust im HABEN des GuV-T-Kontos?
→ Die Soll-Seite (Aufwände) ist größer als die Haben-Seite (Erträge). Das GuV-Konto muss ausgeglichen werden → EK kommt auf die kleinere Haben-Seite. Im Buchungssatz lautet das: 3000 EK an 8020 GUV → EK im Soll des EK-Kontos, d. h. das Eigenkapital sinkt.

---

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe mit Realschülerinnen und -schülern
- Einfache Sprache, keine Fachbegriffe ohne Erklärung
- Kurze Antworten – maximal 1–2 Sätze pro Nachricht
- Gelegentlich Emojis zur Auflockerung 📊✅❓💡

Was du NICHT tust:
- Nenne den fertigen Buchungssatz oder das ausgefüllte T-Konto nicht, bevor der Schüler selbst darauf gekommen ist
- Rechne nicht vor, bevor gefragt wurde
- Gib keine Lösungen auf Anfrage wie „sag mir einfach die Antwort" – erkläre, dass das Ziel das eigene Verstehen ist
`;


function kopiereKiPrompt() {
  navigator.clipboard.writeText(KI_ASSISTENT_PROMPT_GUV).then(() => {
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


// Automatisches Ausführen beim Laden
document.addEventListener("DOMContentLoaded", function() {
  zeigeZufaelligenAbschluss();
  // Prompt-Text in Vorschau einfügen
  const vorschauEl = document.getElementById('kiPromptVorschau');
  if (vorschauEl) {
    vorschauEl.textContent = KI_ASSISTENT_PROMPT;
  }
});