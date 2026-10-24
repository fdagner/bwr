// ============================================================================
// MOODLE-XML-EXPORT – ALLGEMEINER TEIL (Fragetyp „Buchungssatz“, qtype_accounting)
// https://github.com/lambda9-gmbh/moodle-qtype_accounting
//
// Enthält Kontenplan, Hilfsfunktionen, XML-Erzeugung und den Download-Button-
// Handler exportiereMoodleXML(). Wird VOR moodle-export-einkauf.js bzw.
// moodle-export-verkauf.js eingebunden.
// Die Fach-Dateien füllen die Liste moodleFragen über moodleFragen.push({...}).
// ============================================================================

// ID des Kontenplans in Ihrer Moodle-Instanz (aus dem Beispielexport: 2)
const MOODLE_KONTENPLAN_ID = 2;
const MOODLE_KONTENPLAN_NAME = 'Kontenplan BwR 8-10';
const MOODLE_KONTENPLAN = [
  '0500 GR', '0530 BVG', '0700 MA', '0840 FP', '0860 BM', '0870 BGA',
  '0890 GWG', '1500 WP', '2000 R', '2010 F', '2020 H', '2030 B',
  '2400 FO', '2470 ZWFO', '2600 VORST', '2800 BK', '2880 KA', '2900 ARA',
  '3000 EK', '3001 P', '3670 EWB', '3680 PWB', '3900 RST', '4200 KBKV',
  '4250 LBKV', '4400 VE', '4800 UST', '4830 VFA', '4840 VSV', '4900 PRA',
  '5000 UEFE', '5001 EBFE', '5400 EMP', '5430 ASBE', '5490 PFE', '5495 EFO',
  '5650 EAWP', '5710 ZE', '5780 DDE', '6000 AWR', '6001 BZKR', '6002 NR',
  '6010 AWF', '6011 BZKF', '6012 NF', '6020 AWH', '6021 BZKH', '6022 NH',
  '6030 AWB', '6031 BZKB', '6032 NB', '6040 AWVM', '6140 AFR', '6160 FRI',
  '6200 LG', '6400 AGASV', '6520 ABSA', '6540 ABGWG', '6700 AWMP', '6730 GEB',
  '6750 KGV', '6760 PROV', '6770 RBK', '6800 BMK', '6820 KOM', '6850 REK',
  '6870 WER', '6900 VBEI', '6950 ABFO', '6990 PFAW', '7000 GWST', '7020 GRST',
  '7030 KFZST', '7460 VAWP', '7510 ZAW'
];

let moodleFragen = [];

function moodleReset() {
  moodleFragen = [];
}

// "1.234,56 €" → 1234.56
function moodleBetrag(str) {
  const n = parseFloat(String(str ?? '').replace(/[^\d,-]/g, '').replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

function moodleEsc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function moodleCdata(s) {
  return '<![CDATA[' + String(s ?? '').replace(/\]\]>/g, ']]]]><![CDATA[>') + ']]>';
}

// ---------------------------------------------------------------------------
// Feedback-Tabellen (erscheinen in Moodle als allgemeines Feedback)
// ---------------------------------------------------------------------------
function moodleTabelle(zeilen) {
  const tr = ([a, b, c, top]) =>
    `<tr><td${top ? ' style="border-top:1px solid #ccc"' : ''}>${a}</td>` +
    `<td style="text-align:right;padding-left:16px${top ? ';border-top:1px solid #ccc' : ''}">${b}</td>` +
    `<td style="text-align:right;padding-left:8px">${c || ''}</td></tr>`;
  return `<table style="border-collapse:collapse;white-space:nowrap"><tbody>${zeilen.map(tr).join('')}</tbody></table>`;
}

// ---------------------------------------------------------------------------
// XML erzeugen
// ---------------------------------------------------------------------------
function moodlePunkte(zeilen) {
  // 1 Punkt je Konto (wie im Beispielexport: 3 Konten = 3 P, 2 Konten = 2 P)
  return zeilen.reduce((s, z) => s + (z.d ? 1 : 0) + (z.c ? 1 : 0), 0);
}

function baueMoodleXml(fragen, praefix) {
  const kontenplanXml =
    `    <chartofaccounts>\n      <chartname>${moodleEsc(MOODLE_KONTENPLAN_NAME)}</chartname>\n` +
    MOODLE_KONTENPLAN.map((k, i) =>
      `      <account>\n        <accountname>${moodleEsc(k)}</accountname>\n        <sortorder>${i}</sortorder>\n      </account>\n`
    ).join('') + `    </chartofaccounts>\n`;

  const kategorie = praefix.replace(/[\/\\]/g, '-');
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<quiz>\n`;

  // Kategorie (wird beim Import verwendet, wenn „Kategorie aus Datei übernehmen“ aktiv ist)
  xml += `  <question type="category">\n    <category>\n      <text>${moodleEsc('$course$/top/' + kategorie)}</text>\n    </category>\n` +
         `    <info format="moodle_auto_format">\n      <text></text>\n    </info>\n    <idnumber></idnumber>\n  </question>\n\n`;

  fragen.forEach(f => {
    const punkte = moodlePunkte(f.zeilen);
    xml += `  <question type="accounting">\n`;
    xml += `    <name>\n      <text>${moodleEsc(`${praefix}_${f.name} (${punkte}P)`)}</text>\n    </name>\n`;
    xml += `    <questiontext format="html">\n      <text>${moodleCdata(f.text)}</text>\n    </questiontext>\n`;
    xml += `    <generalfeedback format="html">\n      <text>${moodleCdata(f.feedback || '')}</text>\n    </generalfeedback>\n`;
    xml += `    <defaultgrade>${punkte.toFixed(7)}</defaultgrade>\n`;
    xml += `    <penalty>0.3333333</penalty>\n    <hidden>0</hidden>\n    <idnumber></idnumber>\n`;
    xml += `    <chartofaccountsid>${MOODLE_KONTENPLAN_ID}</chartofaccountsid>\n`;
    xml += `    <accountsindropdown>0</accountsindropdown>\n    <numberformat>de</numberformat>\n`;
    xml += `    <extraentrydeduction>0.0000000</extraentrydeduction>\n    <allornothinggrading>0</allornothinggrading>\n`;
    xml += `    <allowmultipleentries>1</allowmultipleentries>\n    <maxentries>${Math.max(5, f.zeilen.length + 1)}</maxentries>\n`;
    xml += `    <gradingmode>points</gradingmode>\n    <currency></currency>\n    <entries>\n`;
    f.zeilen.forEach((z, i) => {
      xml += `      <entry>\n        <sortorder>${i}</sortorder>\n` +
             `        <debitaccount>${moodleEsc(z.d)}</debitaccount>\n        <debitamount>${(z.d ? z.da : 0).toFixed(2)}</debitamount>\n` +
             `        <creditaccount>${moodleEsc(z.c)}</creditaccount>\n        <creditamount>${(z.c ? z.ca : 0).toFixed(2)}</creditamount>\n` +
             `        <weight_debitaccount>1</weight_debitaccount>\n        <weight_debitamount>1</weight_debitamount>\n` +
             `        <weight_creditaccount>1</weight_creditaccount>\n        <weight_creditamount>1</weight_creditamount>\n` +
             `        <explanation></explanation>\n      </entry>\n`;
    });
    xml += `    </entries>\n${kontenplanXml}  </question>\n\n`;
  });

  return xml + `</quiz>\n`;
}

// ---------------------------------------------------------------------------
// Button-Handler
// ---------------------------------------------------------------------------
function exportiereMoodle() {
  if (!moodleFragen.length) {
    alert('Keine exportierbaren Fragen vorhanden. Bitte zuerst Aufgaben erstellen (die Differenzkalkulation enthält keinen Buchungssatz und kann nicht exportiert werden).');
    return;
  }
  const praefix = (document.getElementById('moodlePraefix')?.value || 'BwR 8 Einkauf').trim();
  const xml = baueMoodleXml(moodleFragen, praefix);

  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  const dateiname = `quiz-${praefix.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.xml`;

  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = dateiname;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}