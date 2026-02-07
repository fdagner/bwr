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
    <td style="text-align:right; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 160px; max-width: 160px" tabindex="1">${formatBetrag(salden[konto])}</td>
    <td style="text-align: center; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 80px" tabindex="1">an</td>
    <td style="white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 150px; max-width: 150px" tabindex="1">${konto}</td>
    <td style="white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 160px; max-width: 160px; text-align: right" tabindex="1"></td>
  </tr>`;
});

// Ertragsbuchung (umgekehrt → Ertrag an GuV)
html += `
  <tr>
    <td style="white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 150px; max-width: 150px" tabindex="1">5000 UEFE</td>
    <td style="text-align:right; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 160px; max-width: 160px" tabindex="1">${formatBetrag(salden["5000 UEFE"])}</td>
    <td style="text-align: center; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 80px" tabindex="1">an</td>
    <td style="white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 150px; max-width: 150px" tabindex="1">8020 GUV</td>
    <td style="white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 160px; max-width: 160px; text-align: right" tabindex="1"></td>
  </tr>`;

// Abschlussbuchung
if (erfolg >= 0) {
  html += `
  <tr>
    <td style="white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 150px; max-width: 150px; font-weight:bold;" tabindex="1">8020 GUV</td>
    <td style="text-align:right; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 160px; max-width: 160px; font-weight:bold;" tabindex="1">${formatBetrag(erfolgHoehe)}</td>
    <td style="text-align: center; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 80px; font-weight:bold;" tabindex="1">an</td>
    <td style="white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 150px; max-width: 150px; font-weight:bold;" tabindex="1">3000 EK</td>
    <td style="white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 160px; max-width: 160px; text-align: right; font-weight:bold;" tabindex="1"></td>
  </tr>`;
} else {
  html += `
  <tr>
    <td style="white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 150px; max-width: 150px; font-weight:bold;" tabindex="1">3000 EK</td>
    <td style="text-align:right; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 160px; max-width: 160px; font-weight:bold;" tabindex="1">${formatBetrag(erfolgHoehe)}</td>
    <td style="text-align: center; white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 80px; font-weight:bold;" tabindex="1">an</td>
    <td style="white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 150px; max-width: 150px; font-weight:bold;" tabindex="1">8020 GUV</td>
    <td style="white-space: nowrap; overflow: hidden; text-overflow:ellipsis; width: 160px; max-width: 160px; text-align: right; font-weight:bold;" tabindex="1"></td>
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

// Automatisches Ausführen beim Laden
document.addEventListener("DOMContentLoaded", function() {
  zeigeZufaelligenAbschluss();
});