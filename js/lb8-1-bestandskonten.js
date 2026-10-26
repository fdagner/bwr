function formatBetrag(value) {
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function generateRandomSaldo(min, max, round = 100) {
  return Math.round((Math.random() * (max - min) + min) / round) * round;
}

function anzahl12() {
  return 1 + Math.floor(Math.random() * 2);
}

function summe(arr) {
  return arr.reduce((s, b) => s + b.betrag, 0);
}

// ── Konfiguration ────────────────────────────────────────────────────────────

const AKTIV_REIHE = ['0500 GR', '0530 BVG', '0700 MA', '0840 FP', '0860 BM', '0870 BGA', '2400 FO', '2800 BK', '2880 KA'];
const BANK_PASSIV = ['4200 KBKV', '4250 LBKV'];

// Anlagekonten: AB-Rahmen [min, max, Rundung]; optional kauf = Zukauf auf Ziel (4400 VE) [min, max, Rundung]
// Ohne kauf (GR, BVG, MA, FP) steht nur der AB im Konto.
const ANLAGEN = {
  '0500 GR':  { ab: [150000, 400000, 1000] },
  '0530 BVG': { ab: [100000, 300000, 1000] },
  '0700 MA':  { ab: [100000, 500000, 1000] },
  '0840 FP':  { ab: [30000,  150000, 1000] },
  '0860 BM':  { ab: [5000,   25000,  1000], kauf: [1000, 20000, 1000] },
  '0870 BGA': { ab: [20000,  90000,  1000], kauf: [1000, 20000, 1000] },
};

// Aufwandskonten, die im Haben von 4400 VE stehen (je eine Buchung, 1.000–5.000 €)
const VE_AUFWAND_KONTEN = ['6000 AWR', '6020 AWH'];

// Umsatzsteuersatz; Beträge in 2400 FO und 4400 VE sind Bruttobeträge
const UST_SATZ = 19;
function mitUst(netto)    { return Math.round(netto * (100 + UST_SATZ)) / 100; }
function ustBetrag(netto) { return Math.round(netto * UST_SATZ) / 100; }

function chkId(nr) {
  return 'chk' + nr.split(' ')[0];
}

function getAusgewaehlteKonten() {
  const aktiv = AKTIV_REIHE.filter(nr => nr === '2400 FO' || nr === '2800 BK' || document.getElementById(chkId(nr))?.checked);
  const passiv = BANK_PASSIV.filter(nr => document.getElementById(chkId(nr))?.checked);
  return { aktiv, passiv };
}

// ── Aufgabe erzeugen ─────────────────────────────────────────────────────────

function verteileBetrag(nrListe, gesamt, rund) {
  for (let versuch = 0; versuch < 50; versuch++) {
    const gew = nrListe.map(() => 1 + Math.random() * 3);
    const sumG = gew.reduce((s, g) => s + g, 0);
    const werte = {};
    let rest = Math.round(gesamt / rund) * rund;
    nrListe.forEach((nr, i) => {
      const b = (i === nrListe.length - 1)
        ? rest
        : Math.round(gesamt * gew[i] / sumG / rund) * rund;
      rest -= b;
      werte[nr] = b;
    });
    if (Object.values(werte).every(b => b >= 5000)) return werte;
  }
  return null;
}

function neuesKonto(istAktiv) {
  return { istAktiv, soll: [], haben: [] };
}

function aufTausend(x) { return Math.ceil(x / 1000) * 1000; }

function versucheAufgabe(aktivNr, passivNr) {
  // 2400 FO und 2800 BK sind immer dabei (Umsatzsteuer, Zahllast, Zahlungen)
  if (!aktivNr.includes('2400 FO') || !aktivNr.includes('2800 BK')) return null;
  const k = {};

  const veAufwand = [];  // Haben in 4400 VE (brutto): Werkstoffeinkäufe
  const veHaben   = [];  // Haben in 4400 VE (brutto): Anlagekäufe
  const veSoll    = [];  // Soll in 4400 VE: Zahlungen per BK
  const bkSoll    = [];  // Soll in 2800 BK: Zahlungen von Kunden
  let vorsteuer = 0;
  let umsatzsteuer = 0;
  let aufwandNetto = 0;  // AWR + AWH (netto)
  let uefeNetto = 0;     // UEFE (netto)

  // Zusatzbuchungen mit 2800 BK
  const lbkvZugang = passivNr.includes('4250 LBKV') ? generateRandomSaldo(10000, 50000, 1000) : 0; // Darlehensaufnahme
  const kaAbhebung = aktivNr.includes('2880 KA') ? generateRandomSaldo(500, 2000, 500) : 0;        // Barabhebung

  // Anlagekonten: AB (+ bei BM/BGA 1–2 Käufe auf Ziel, netto im Konto, brutto in VE)
  aktivNr.filter(nr => ANLAGEN[nr]).forEach(nr => {
    const c = ANLAGEN[nr];
    const konto = neuesKonto(true);
    konto.soll.push({ label: 'AB', betrag: generateRandomSaldo(...c.ab) });
    if (c.kauf) {
      const n = anzahl12();
      for (let i = 0; i < n; i++) {
        const netto = generateRandomSaldo(...c.kauf);
        konto.soll.push({ label: '4400 VE', betrag: netto });
        veHaben.push({ label: nr + ', 2600 VORST', betrag: mitUst(netto) });
        vorsteuer += ustBetrag(netto);
      }
    }
    k[nr] = konto;
  });

  // Werkstoffeinkäufe auf Ziel (AWR, AWH): brutto in VE
  VE_AUFWAND_KONTEN.forEach(nr => {
    const netto = generateRandomSaldo(1000, 4000, 1000);
    veAufwand.push({ label: nr + ', 2600 VORST', betrag: mitUst(netto) });
    vorsteuer += ustBetrag(netto);
    aufwandNetto += netto;
  });

  // 2400 FO: Soll 1–2× UEFE (brutto), Haben 1–2× BK
  {
    const konto = neuesKonto(true);
    let netto = [];
    const nU = anzahl12();
    for (let i = 0; i < nU; i++) netto.push(generateRandomSaldo(5000, 15000, 1000));
    const summeNetto = () => netto.reduce((s, b) => s + b, 0);
    // UEFE muss größer sein als AWR+AWH (Gewinn) und UST größer als VORST (Zahllast) → ggf. hochskalieren
    const nettoMin = Math.max(aufwandNetto + 2000, Math.ceil((vorsteuer + 1000) / UST_SATZ) * 100);
    if (summeNetto() < nettoMin) {
      const ziel = aufTausend(nettoMin) + generateRandomSaldo(1000, 5000, 1000);
      const faktor = ziel / summeNetto();
      netto = netto.map(b => Math.round(b * faktor / 1000) * 1000);
      netto[netto.length - 1] += ziel - summeNetto();
    }
    uefeNetto = summeNetto();
    umsatzsteuer = netto.reduce((s, b) => s + ustBetrag(b), 0);
    if (umsatzsteuer <= vorsteuer || uefeNetto <= aufwandNetto) return null;
    const uefe = netto.map(b => ({ label: '5000 UEFE, 4800 UST', betrag: mitUst(b) }));

    const zahlungen = [];
    const nZ = anzahl12();
    for (let i = 0; i < nZ; i++) {
      const betrag = generateRandomSaldo(2000, 15000, 1000);
      zahlungen.push({ label: '2800 BK', betrag });
      bkSoll.push({ label: '2400 FO', betrag });
    }
    const ab = aufTausend(Math.max(0, summe(zahlungen) - summe(uefe))) + generateRandomSaldo(3000, 30000, 1000);
    konto.soll = [{ label: 'AB', betrag: ab }, ...uefe];
    konto.haben = zahlungen;
    k['2400 FO'] = konto;
  }

  // 4400 VE: Soll 1–2× BK
  {
    const n = anzahl12();
    for (let i = 0; i < n; i++) veSoll.push({ label: '2800 BK', betrag: generateRandomSaldo(2000, 10000, 1000) });
  }

  // 2800 BK: Haben auch Zahllast (UST − VORST, einmal im Jahr)
  {
    const konto = neuesKonto(true);
    const sollBuch = [...bkSoll];
    if (lbkvZugang) sollBuch.push({ label: '4250 LBKV', betrag: lbkvZugang });
    const habenBuch = veSoll.map(b => ({ label: '4400 VE', betrag: b.betrag }));
    if (kaAbhebung) habenBuch.push({ label: '2880 KA', betrag: kaAbhebung });
    habenBuch.push({ label: '4800 UST', betrag: umsatzsteuer - vorsteuer });
    const ab = aufTausend(Math.max(0, summe(habenBuch) - summe(sollBuch))) + generateRandomSaldo(10000, 60000, 1000);
    konto.soll = [{ label: 'AB', betrag: ab }, ...sollBuch];
    konto.haben = habenBuch;
    k['2800 BK'] = konto;
  }

  // 2880 KA
  if (aktivNr.includes('2880 KA')) {
    const konto = neuesKonto(true);
    konto.soll = [{ label: 'AB', betrag: generateRandomSaldo(500, 5000, 500) }];
    if (kaAbhebung) konto.soll.push({ label: '2800 BK', betrag: kaAbhebung });
    k['2880 KA'] = konto;
  }

  // 4400 VE zusammensetzen (AB so wählen, dass der Saldo positiv bleibt)
  const veKonto = neuesKonto(false);
  const habenOhneAB = [...veAufwand, ...veHaben];
  const veAB = aufTausend(Math.max(0, summe(veSoll) - summe(habenOhneAB))) + generateRandomSaldo(3000, 20000, 1000);
  veKonto.haben = [{ label: 'AB', betrag: veAB }, ...habenOhneAB];
  veKonto.soll = veSoll;

  // Aktiv geordnet
  const aktiv = {};
  AKTIV_REIHE.forEach(nr => { if (k[nr]) aktiv[nr] = k[nr]; });
  const aktivSumme = Object.values(aktiv).reduce((s, x) => s + (summe(x.soll) - summe(x.haben)), 0);
  const veSaldo = summe(veKonto.haben) - summe(veKonto.soll);

  // Bankverbindlichkeiten
  const bank = {};
  if (passivNr.length > 0) {
    const ziel = aktivSumme * (0.25 + Math.random() * 0.35) - veSaldo;
    if (ziel < passivNr.length * 5000) return null;
    const verteilt = verteileBetrag(passivNr, ziel, 1000);
    if (!verteilt) return null;
    Object.assign(bank, verteilt);
  }
  const summeBank = Object.values(bank).reduce((s, v) => s + v, 0);

  // EK = Restgröße; im Haben stehen AB und der Gewinn (UEFE − AWR − AWH, netto)
  const gewinn = uefeNetto - aufwandNetto;
  const ekSaldo = Math.round((aktivSumme - veSaldo - summeBank) * 100) / 100;
  const ekAB = Math.round((ekSaldo - gewinn) * 100) / 100;
  if (ekSaldo < 0.2 * aktivSumme || ekAB < 5000) return null;

  const passiv = {};
  const ekKonto = neuesKonto(false);
  ekKonto.haben = [{ label: 'AB', betrag: ekAB }, { label: '8020 GUV', betrag: gewinn }];
  passiv['3000 EK'] = ekKonto;
  for (const nr of passivNr) {
    const kk = neuesKonto(false);
    if (nr === '4250 LBKV' && lbkvZugang) {
      const ab = bank[nr] - lbkvZugang;
      if (ab < 5000) return null;
      kk.haben = [{ label: 'AB', betrag: ab }, { label: '2800 BK', betrag: lbkvZugang }];
    } else {
      kk.haben = [{ label: 'AB', betrag: bank[nr] }];
    }
    passiv[nr] = kk;
  }
  passiv['4400 VE'] = veKonto;

  return { aktiv, passiv, summe: aktivSumme, ust: umsatzsteuer, vorst: vorsteuer, uefeNetto, aufwandNetto, gewinn };
}

function erstelleBestandsabschluss(aktivNr, passivNr) {
  for (let i = 0; i < 300; i++) {
    const r = versucheAufgabe(aktivNr, passivNr);
    if (r) return r;
  }
  return null;
}

// ── Salden ───────────────────────────────────────────────────────────────────

function berechneSaldo(k) {
  const s = summe(k.soll), h = summe(k.haben);
  return { saldo: Math.abs(s - h), summe: Math.max(s, h) };
}

// ── T-Konto Renderer ─────────────────────────────────────────────────────────

function tkKopf(titel, klein) {
  // feste Spaltenbreiten → Mittellinie sitzt bei jedem Konto an derselben Stelle
  const w = klein ? [26, 24, 26, 24] : [25, 25, 25, 25];
  return `<table class="tkonto${klein ? ' tkonto-klein' : ''}" style="border-collapse:collapse;table-layout:fixed;width:100%;background:#fff;font-size:1.0em;">
    <colgroup><col style="width:${w[0]}%"><col style="width:${w[1]}%"><col style="width:${w[2]}%"><col style="width:${w[3]}%"></colgroup>
    <thead><tr>
      <th style="text-align:left;font-weight:600;padding:4px 0;">Soll</th>
      <th style="text-align:center;font-size:1.0em;padding:4px 0;" colspan="2"><span style="font-weight:700;">${titel}</span></th>
      <th style="text-align:right;font-weight:600;padding:4px 0;">Haben</th>
    </tr></thead><tbody>`;
}

function tkZeile(sLabel, sBetrag, hLabel, hBetrag) {
  const fmt = b => (b === null || b === undefined) ? '&nbsp;' : formatBetrag(b);
  // lange Buchungstexte (z. B. "5000 UEFE, 4800 UST") kleiner, kurze (AB, 2800 BK) normal
  const lbl = l => !l ? '&nbsp;' : (l.length > 12 ? `<span style="font-size:0.82em;">${l}</span>` : l);
  return `<tr style="border-top:2px solid #ccc;">
      <td style="padding:3px 2px;white-space:nowrap;">${lbl(sLabel)}</td>
      <td style="text-align:right;padding:3px 4px 3px 2px;border-right:2px solid #999;min-width:100px;height:1.8em;">${fmt(sBetrag)}</td>
      <td style="padding:3px 2px 3px 6px;min-width:100px;white-space:nowrap;">${lbl(hLabel)}</td>
      <td style="text-align:right;padding:3px 2px;min-width:100px;">${fmt(hBetrag)}</td>
    </tr>`;
}

function tkSumme(sSumme, hSumme) {
  return `<tr style="border-top:2px solid #888;border-bottom:4px double #888;">
    <td style="padding:3px 2px;"></td>
    <td style="text-align:right;padding:3px 4px;border-right:2px solid #999;font-weight:700;">${sSumme === null ? '&nbsp;' : formatBetrag(sSumme)}</td>
    <td style="padding:3px 2px 3px 6px;"></td>
    <td style="text-align:right;padding:3px 2px;font-weight:700;">${hSumme === null ? '&nbsp;' : formatBetrag(hSumme)}</td>
  </tr></tbody></table>`;
}

// Bestandskonto: Aufgabe (Buchungen) bzw. Lösung (mit Saldo über 8010 SBK)
function renderTKonto(kontoNr, k, loesung) {
  const zeilen = Math.max(k.soll.length, k.haben.length) + (loesung ? 1 : 2);   // Buchungen + freie Zeilen (Aufgabe: 2, Lösung: 1)
  const soll = [...k.soll];
  const haben = [...k.haben];
  const { saldo, summe: sum } = berechneSaldo(k);
  if (loesung) {
    if (k.istAktiv) haben.push({ label: '8010 SBK', betrag: saldo });
    else soll.push({ label: '8010 SBK', betrag: saldo });
  }
  const klein = [...k.soll, ...k.haben].some(b => b.label.length > 12);   // lange Labels (FO, VE) → kleinere Schrift
  let html = tkKopf(kontoNr, klein);
  for (let i = 0; i < zeilen; i++) {
    const s = soll[i], h = haben[i];
    html += tkZeile(s?.label, s?.betrag, h?.label, h?.betrag);
  }
  return loesung ? html + tkSumme(sum, sum) : html + '</tbody></table>';
}

// SBK AUFGABE – leer
function renderTKontoSBKAufgabe(zeilen) {
  let html = tkKopf('8010 SBK');
  for (let i = 0; i < zeilen; i++) html += tkZeile('', null, '', null);
  return html + '</tbody></table>';
}

// SBK LÖSUNG – Aktivkonten im Soll, Passivkonten im Haben
function renderTKontoSBKLoesung(aktivSalden, passivSalden, sum) {
  const a = Object.entries(aktivSalden);
  const p = Object.entries(passivSalden);
  const n = Math.max(a.length, p.length);
  let html = tkKopf('8010 SBK');
  for (let i = 0; i < n; i++) {
    html += tkZeile(a[i] ? a[i][0] : '', a[i] ? a[i][1] : null,
                    p[i] ? p[i][0] : '', p[i] ? p[i][1] : null);
  }
  return html + tkSumme(sum, sum);
}

// ── HAUPTFUNKTION ────────────────────────────────────────────────────────────

function zeigeZufaelligenBestandsabschluss() {
  const container = document.getElementById('Container');
  if (!container) return;
  container.innerHTML = '';

  const { aktiv: aktivNr, passiv: passivNr } = getAusgewaehlteKonten();
  if (aktivNr.length === 0) {
    container.innerHTML = '<p style="color:#b00;font-weight:600;">Bitte mindestens ein Aktivkonto auswählen.</p>';
    return;
  }

  const ergebnis = erstelleBestandsabschluss(aktivNr, passivNr);
  if (!ergebnis) {
    container.innerHTML = '<p style="color:#b00;font-weight:600;">Mit dieser Kontenauswahl lässt sich keine sinnvolle Aufgabe erzeugen. Bitte weitere Aktivkonten auswählen (z. B. Anlagekonten).</p>';
    return;
  }
  const { aktiv, passiv, summe: bilanzsumme, ust, vorst, uefeNetto, aufwandNetto, gewinn } = ergebnis;

  const anzahlSBK = Math.max(Object.keys(aktiv).length, Object.keys(passiv).length) + 1;   // eine Zeile extra

  // ── AUFGABE ────────────────────────────────────────────────────────────────
  let html = '<h2>Aufgabe</h2>';
  html += `<p>Die folgenden Bestandskonten weisen zum Jahresende die aufgeführten Buchungen auf.<br>Ermittle die Salden und schließe alle Konten ab. Bilde die Buchungssätze.</p>`;

  html += `<div class="tkonto-grid">`;
  Object.entries(aktiv).forEach(([nr, k]) => {
    html += `<div class="tkonto-cell">${renderTKonto(nr, k, false)}</div>`;
  });
  Object.entries(passiv).forEach(([nr, k]) => {
    html += `<div class="tkonto-cell">${renderTKonto(nr, k, false)}</div>`;
  });
  html += `</div>`;

  html += `<div class="tkonto-fullwidth">${renderTKontoSBKAufgabe(anzahlSBK)}</div>`;

  // ── LÖSUNG ─────────────────────────────────────────────────────────────────
  const aktivSalden = {};
  Object.entries(aktiv).forEach(([nr, k]) => { aktivSalden[nr] = berechneSaldo(k).saldo; });
  const passivSalden = {};
  Object.entries(passiv).forEach(([nr, k]) => { passivSalden[nr] = berechneSaldo(k).saldo; });

  html += `<h2 class="loesung" style="margin-top:2.5em">Lösung</h2>`;

  html += `<strong>Buchungssätze:</strong>
  <table style="white-space:nowrap;background-color:#fff;font-family:courier;min-width:700px;"><tbody>`;

  const bsZeile = (soll, haben, betrag) => `<tr>
      <td style="border-with:0px;padding:2px 10px 2px 0;white-space:nowrap;">${soll}</td>
      <td style="border-with:0px;padding:2px 10px;text-align:right;min-width:120px;">${formatBetrag(betrag)} €</td>
      <td style="border-with:0px;padding:2px 10px;text-align:center;">an</td>
      <td style="border-with:0px;padding:2px 10px;white-space:nowrap;">${haben}</td>
      <td style="border-with:0px;padding:2px 0;text-align:right;min-width:120px;">${formatBetrag(betrag)} €</td>
    </tr>`;

  html += `<tr><td colspan="5" style="padding:4px 0;color:#555;font-style:italic;font-size:0.95em;">Schritt 1: Aktivkonten über SBK abschließen</td></tr>`;
  Object.entries(aktivSalden).forEach(([nr, saldo]) => { html += bsZeile('8010 SBK', nr, saldo); });

  html += `<tr><td colspan="5" style="padding:6px 0;"></td></tr>`;
  html += `<tr><td colspan="5" style="padding:4px 0;color:#555;font-style:italic;font-size:0.95em;">Schritt 2: Passivkonten über SBK abschließen</td></tr>`;
  Object.entries(passivSalden).forEach(([nr, saldo]) => { html += bsZeile(nr, '8010 SBK', saldo); });

  html += `</tbody></table><br>`;

  html += `<div class="tkonto-grid">`;
  Object.entries(aktiv).forEach(([nr, k]) => {
    html += `<div class="tkonto-cell">${renderTKonto(nr, k, true)}</div>`;
  });
  Object.entries(passiv).forEach(([nr, k]) => {
    html += `<div class="tkonto-cell">${renderTKonto(nr, k, true)}</div>`;
  });
  html += `<div class="tkonto-cell">${renderTKontoSBKLoesung(aktivSalden, passivSalden, bilanzsumme)}</div>`;
  html += `</div>`;

  html += `<p style="font-size:1.15em;font-weight:bold;margin-top:1.8em;">
    Bilanzsumme: ${formatBetrag(bilanzsumme)} € (Aktiva = Passiva)
  </p>`;
  html += `<p style="color:#555;">Zur Kontrolle – Zahllast: ${formatBetrag(ust)} € Umsatzsteuer − ${formatBetrag(vorst)} € Vorsteuer = ${formatBetrag(ust - vorst)} € (im Haben von 2800 BK)<br>Gewinn: ${formatBetrag(uefeNetto)} € UEFE − ${formatBetrag(aufwandNetto)} € AWR/AWH = ${formatBetrag(gewinn)} € (im Haben von 3000 EK)</p>`;

  container.innerHTML = html;
}

// ── KI-PROMPT ────────────────────────────────────────────────────────────────

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Buchführungs-Assistent für Schüler der Realschule (BwR), 8. Klasse. Du hilfst beim Verständnis des Jahresabschlusses – speziell beim Abschluss der Bestandskonten (Aktiv- und Passivkonten) über das Schlussbilanzkonto (8010 SBK).

Aufgabe:
- Gib KEINE fertigen Buchungssätze, T-Konten, Salden oder Ergebnisse vor.
- Führe die Schüler durch gezielte Fragen und Hinweise zur richtigen Lösung.
- Ziel: Lernförderung, nicht das Abnehmen der Denkarbeit.

Pädagogischer Ansatz:
- Frage nach den vorliegenden Buchungen und wie daraus der Saldo entsteht.
- Stelle gezielte Rückfragen, um den Stand des Schülers zu verstehen.
- Beantworte deine Rückfragen nicht selbst – hake bei falschen Antworten nach.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Erst wenn alle Teilschritte richtig beantwortet wurden, bestätige den vollständigen Abschluss.

---

THEMA: ABSCHLUSS DER BESTANDSKONTEN ÜBER DAS SCHLUSSBILANZKONTO (8010 SBK)

Aufbau der Konten in der Aufgabe:
- Aktivkonten: AB (Anfangsbestand) steht im SOLL, Zugänge im SOLL, Abgänge im HABEN
- Passivkonten: AB (Anfangsbestand) steht im HABEN, Zugänge im HABEN, Abgänge im SOLL
- Der Saldo ist der Unterschied der beiden Kontoseiten und steht auf der wertmäßig kleineren Seite.

Aktivkonten:
- 0500 GR – Grundstücke
- 0530 BVG – Betriebs- und Verwaltungsgebäude
- 0700 MA – Maschinen und Anlagen
- 0840 FP – Fuhrpark
- 0860 BM – Büromaschinen
- 0870 BGA – Betriebs- und Geschäftsausstattung
- 2400 FO – Forderungen aus Lieferungen und Leistungen
- 2800 BK – Bankguthaben
- 2880 KA – Kasse

Passivkonten:
- 3000 EK – Eigenkapital
- 4200 KBKV – Kurzfristige Bankverbindlichkeiten
- 4250 LBKV – Langfristige Bankverbindlichkeiten
- 4400 VE – Verbindlichkeiten aus Lieferungen und Leistungen

Typische Gegenkonten in den Buchungen:
- 4400 VE bei Anlagekäufen auf Ziel (Anlagekonto im Soll, VE im Haben)
- 5000 UEFE bei Ausgangsrechnungen (FO im Soll)
- 2800 BK bei Zahlungen von Kunden (FO Haben, BK Soll) und an Lieferanten (VE Soll, BK Haben)
- 6000 AWR / 6020 AWH bei Einkäufen auf Ziel (VE im Haben)
- Bei Einkäufen und Verkäufen auf Ziel gilt 19 % Umsatzsteuer: Forderungen und Verbindlichkeiten stehen mit dem Bruttobetrag im Konto, Anlage- und Aufwandskonten mit dem Nettobetrag. 2600 VORST und 4800 UST sind schon über die Zahllast abgeschlossen (Zahllast = UST − VORST, steht im Haben von 2800 BK). Der Gewinn (UEFE − AWR − AWH, netto) steht bereits im Haben von 3000 EK (Gegenkonto 8020 GUV).
- 2800 BK bei Darlehensaufnahme (4250 LBKV im Haben, BK im Soll) und bei Barabhebung (2880 KA im Soll, BK im Haben)

Schlussbilanzkonto:
- 8010 SBK – Aktivkonten stehen im SOLL, Passivkonten im HABEN
- Beide Seiten müssen gleich groß sein (Aktiva = Passiva)

---

METHODIK BEI RÜCKFRAGEN:
- Was bedeutet AB?
- Auf welcher Seite stehen Zugänge, auf welcher Abgänge bei einem Aktiv- bzw. Passivkonto?
- Wie ermittle ich den Saldo (Summe beider Seiten, Unterschied)?
- Auf welcher Seite des Kontos steht der Saldo beim Abschluss?
- Auf welcher Seite des SBK erscheinen Aktivkonten, auf welcher Passivkonten?
- Woran erkenne ich, dass der Abschluss richtig ist (Summen im SBK gleich)?

---

BUCHUNGSSÄTZE – SCHRITT FÜR SCHRITT

Schritt 1 – Aktivkonten abschließen:
  8010 SBK an Aktivkonto | Saldo   (je Aktivkonto ein Buchungssatz)

Schritt 2 – Passivkonten abschließen:
  Passivkonto an 8010 SBK | Saldo  (je Passivkonto ein Buchungssatz)

---

HÄUFIGE SCHÜLERFEHLER:
- Saldo falsch berechnet (AB oder einzelne Buchungen vergessen, Soll und Haben verwechselt)
- Aktiv- und Passivkonten im SBK auf der falschen Seite eingetragen
- Buchungssatz seitenverkehrt (SBK an Passivkonto statt Passivkonto an SBK)
- Saldo auf der falschen Kontoseite eingetragen
- Summen im SBK stimmen nicht überein (Betrag vergessen oder verwechselt)
- Eigenkapital vergessen

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

// ── DRUCK-CSS (identisch zu lb8-1-erfolgskonten.js) ──────────────────────────

function addPrintCSS() {
  const style = document.createElement('style');
  style.innerHTML = `
    .tkonto-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 18px;
      margin: 1.5em 0 2em;
    }
    .tkonto-cell {
      width: 580px;
      max-width: 100%;
      box-sizing: border-box;
    }
    .tkonto-fullwidth {
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      margin: 1em 0 2em;
    }

    .tkonto-klein td { white-space: normal !important; }

    @media print {
      body * { visibility: hidden; }
      #Container, #Container * { visibility: visible; }
      #Container {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
      }
      #Container h2:first-of-type { page-break-after: avoid; }
      #Container h2.loesung {
        page-break-before: always !important;
        margin-top: 60px !important;
      }
      .tkonto-grid {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: 12px 20px !important;
        width: 100% !important;
        margin: 0.8em 0 1.2em !important;
      }
      .tkonto-cell {
        width: 100% !important;
        max-width: 100% !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      .tkonto-fullwidth {
        width: 100% !important;
        max-width: 100% !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        margin: 0.8em 0 1em !important;
      }
      .tkonto-cell table,
      .tkonto {
        width: 100% !important;
        font-size: 0.85em !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      @page { margin: 1.5cm 0.8cm; }
      h2 { page-break-after: avoid; }
    }
  `;
  document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', function () {
  zeigeZufaelligenBestandsabschluss();
  addPrintCSS();

  const vorschauEl = document.getElementById('kiPromptVorschau');
  if (vorschauEl) {
    vorschauEl.value = KI_ASSISTENT_PROMPT;
    vorschauEl.style.display = 'none';
  }
});