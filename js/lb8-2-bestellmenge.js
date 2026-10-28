let bestellChart = null;

(function () {
  'use strict';

  // Alle Zahlen im Interview stammen aus den Eingabefeldern der Seite (siehe leseDaten).

  const VORNAMEN = ['Anna','Lukas','Sarah','Max','Lena','Ahmet','Marie','Tom','Julia','Tim','Laura','Simon','Sophie','Felix','Emma','Paul','Hannah','Elias','Mia','Noah','Clara','Ben','Lea','Jan','Katharina','Stefan','Medina','Markus','Eren','Ali'];
  const NACHNAMEN = ['Konrad','Schmidt','Weber','Bauer','Müller','Wagner','Fischer','Becker','Yilmaz','Trung','Richter','Kaya','Popescu','Schneider','Keller','Vogel','Holomir','Maier','Lang','Krüger','Baumann','Roth','Winter','Ziegler','Khan','Gruber','Berger'];

  const S = {
    box: 'background:#fff;border:1px solid #ddd;border-radius:6px;padding:14px 18px;margin-bottom:16px;line-height:1.7;',
    h2: 'font-size:1.3em;',
    p: 'margin:0 0 8px 0;',
  };

  let yamlData = [];
  let personen = null;
  let html = '';

  const $ = id => document.getElementById(id);
  const zufall = a => a[Math.floor(Math.random() * a.length)];
  const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const eur = n => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);
  const zahl = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');

  function neuePerson(ausschluss) {
    let p;
    do { p = zufall(VORNAMEN) + ' ' + zufall(NACHNAMEN); } while (ausschluss.includes(p));
    return p;
  }

  // ───────────────────────────────────────────────
  // Unternehmensdaten (wie im Kreditvergleich)

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
    yamlData.sort((a, b) => (a.unternehmen.branche || '').localeCompare(b.unternehmen.branche || '') || a.unternehmen.name.localeCompare(b.unternehmen.name));
  }

  function fuelleDropdown() {
    const sel = $('bmUnternehmen');
    sel.innerHTML = yamlData.map((c, i) => {
      const u = c.unternehmen;
      const text = u.branche ? `${u.branche} – ${u.name} ${u.rechtsform || ''}` : `${u.name} ${u.rechtsform || ''}`;
      return `<option value="${i}">${esc(text.trim())}</option>`;
    }).join('');
    const idx = yamlData.findIndex(c => c.unternehmen.name === localStorage.getItem('myCompany'));
    sel.value = idx >= 0 ? idx : 0;
  }

  // ───────────────────────────────────────────────
  // Interview

  // Liest die Eingaben und leitet daraus die Zahlen des Interviews ab (gleiche Formeln wie die Tabelle)
  function leseDaten() {
    const lies = id => parseInt($(id).value, 10);
    const menge = lies('optimaleBestellmenge'), haeuf = lies('optimaleBestellhaeufigkeit'), bk = lies('bestellkosten');
    const s = lies('schrittweite'), von = lies('haeufigkeitVon'), bis = lies('haeufigkeitBis');
    if ([menge, haeuf, bk, s, von, bis].some(x => !(x > 0))) return null;

    const bedarf = menge * haeuf;
    const lager = Math.round(2 * bedarf * bk / (menge * menge) * 100) / 100;

    // Bestellhäufigkeiten, die in der Tabelle vorkommen
    const freq = new Set([haeuf]);
    for (let h = Math.ceil(von / s) * s; h <= bis; h += s) freq.add(h);
    const liste = [...freq].sort((x, y) => x - y), idx = liste.indexOf(haeuf);

    // bisherige Weise: häufiger als optimal; Vorschlag: seltener als optimal (möglichst ganzzahlige Mengen)
    const waehle = r => {
      for (const k of [2, 3, 1, 4]) { const h = liste[idx + r * k]; if (h && bedarf % h === 0) return h; }
      for (const k of [2, 1, 3, 4]) { const h = liste[idx + r * k]; if (h) return h; }
      return null;
    };
    const h1 = waehle(1) || Math.round(haeuf * 1.5) + 1;
    const h2 = waehle(-1) || Math.max(1, Math.round(haeuf / 2));
    return { bedarf, lager, bk, h1, m1: Math.round(bedarf / h1), h2, m2: Math.round(bedarf / h2) };
  }

  function baueAufgabe() {
    const d = leseDaten();
    if (!d) return '';
    const u = (yamlData[$('bmUnternehmen').value] || yamlData[0]).unternehmen;
    const inhaber = (typeof u.inhaber === 'string' && u.inhaber.trim()) || neuePerson([]);
    if (!personen || personen.inhaber !== inhaber) personen = { inhaber, a: '', b: '' };
    if (!personen.a) {
      personen.a = neuePerson([inhaber]);
      personen.b = neuePerson([inhaber, personen.a]);
    }
    const { a, b } = personen;

    // Rohstoff: erster Eintrag unter werkstoffe.AWR, sonst allgemein "Rohstoffeinheiten"
    const awr = u.werkstoffe && Array.isArray(u.werkstoffe.AWR) ? u.werkstoffe.AWR : [];
    const rohstoff = typeof awr[0] === 'string' && awr[0].trim() ? awr[0].trim() : '';
    const mehrzahl = rohstoff ? `Einheiten ${rohstoff}` : 'Rohstoffeinheiten';

    const firma = `${u.name} ${u.rechtsform || ''}`.trim();
    const ort = u.adresse && u.adresse.ort ? ` in ${u.adresse.ort}` : '';
    const rede = (name, text) => `<p style="${S.p}"><strong>${esc(name)}:</strong> „${text}“</p>`;

    return `<div id="bmAufgabe" style="${S.box}">
<h2 style="${S.h2}">Aufgabe – Optimale Bestellmenge</h2>
<p style="${S.p}">Das Unternehmen ${esc(firma)}${esc(ort)} benötigt für die Fertigung ${rohstoff ? `den Rohstoff ${esc(rohstoff)}` : 'Rohstoffeinheiten'}. Der Jahresbedarf beträgt ${zahl(d.bedarf)} ${esc(mehrzahl)}. Sie werden eingelagert und bei Bedarf von der Fertigung entnommen. In der Einkaufsabteilung besprechen ${esc(a)} und ${esc(b)} mit dem Inhaber ${esc(inhaber)}, wie oft und in welcher Menge bestellt werden soll.</p>
${rede(a, `Bisher bestellen wir ${d.h1}-mal im Jahr jeweils ${zahl(d.m1)} ${esc(mehrzahl)}. Ich schlage vor, nur noch ${d.h2}-mal im Jahr zu bestellen, dann jeweils ${zahl(d.m2)}. So sparen wir Bestellkosten: Jede Bestellung kostet ${eur(d.bk)} für Personal, Papier und Fracht.`)}
${rede(b, `Dafür müssen wir aber mehr Ware lagern. Für jede gelagerte Einheit fallen im Jahr ${eur(d.lager)} Lagerkosten an, zum Beispiel für Platz, Energie und Versicherung. Außerdem wird Geld gebunden. Ich bin dafür, bei der bisherigen Bestellweise zu bleiben.`)}
${rede(inhaber, `Wir suchen die optimale Bestellmenge. Das ist die Menge, bei der die Gesamtkosten aus Bestellkosten und Lagerkosten am niedrigsten sind.`)}
<p style="${S.p}margin-top:12px;"><strong>Arbeitsaufträge:</strong></p>
<ol style="margin:0;padding-left:22px;">
  <li>Beschreibe den Zielkonflikt, der bei der Festlegung der Bestellmenge besteht.</li>
  <li>Erläutere mit Hilfe der grafischen Darstellung den Zusammenhang zwischen Bestellkosten und Lagerhaltungskosten.</li>
  <li>Ermittle und begründe mit Hilfe der Tabelle und der Grafik die Höhe der optimalen Bestellmenge.</li>
</ol>
</div>`;
;
  }

  // ───────────────────────────────────────────────
  // Einfügen in #Container (bleibt oben, auch nach Neuberechnung)

  const container = $('Container');
  const beobachter = new MutationObserver(() => {
    if (container.children.length && !container.querySelector('#bmAufgabe')) aktualisiere(false);
  });

  function einfuegen() {
    beobachter.disconnect();
    const vorhanden = container.querySelector('#bmAufgabe');
    if (vorhanden) vorhanden.outerHTML = html;
    else if (container.children.length) container.insertAdjacentHTML('afterbegin', html);
    beobachter.observe(container, { childList: true });
  }

  function aktualisiere(neuWuerfeln) {
    if (!yamlData.length) return;
    if (neuWuerfeln) personen = null;
    html = baueAufgabe() || html;   // bei ungültigen Eingaben bleibt der letzte Stand
    if (html) einfuegen();
  }

  async function start() {
    await ladeUnternehmen();
    if (!yamlData.length) { console.warn('Keine Unternehmen gefunden – keine Aufgabe erzeugt.'); return; }
    fuelleDropdown();
    $('bmUnternehmen').addEventListener('change', () => aktualisiere(true));
    $('bmNeuePersonen').addEventListener('click', () => aktualisiere(true));
    aktualisiere(true);
    beobachter.observe(container, { childList: true });
  }

  start();
})();

// Formatieren der Währung mit Euro-Symbol, Tausenderpunkt und Dezimalkomma
function formatCurrency(amount) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

// Auf 2 Dezimalstellen runden
function roundToTwoDecimals(num) {
    return Math.round(num * 100) / 100;
}


// Formatieren der Zahl mit Leerzeichen als Tausendertrennzeichen, ohne Dezimalkomma
function formatNumberWithSpace(number) {
    const formattedNumber = new Intl.NumberFormat('de-DE', { useGrouping: false }).format(number);
    return formattedNumber.replace(/(\d)(?=(\d{3})+$)/g, '$1 ');
}

function roundUpToNearest(number) {
    const digits = Math.floor(Math.log10(number));
    const factor = Math.pow(10, digits);

    if (factor < 10) {
        return Math.ceil(number / 10) * 10;
    } else if (factor < 100) {
        return Math.ceil(number / 100) * 100;
    } else {
        return Math.ceil(number / 1000) * 1000;
    }
}

function escHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}


let lagerkosten;
let bedarf;
function berechneOptimaleBestellmengeUndHaeufigkeit() {

    let optimaleBestellmenge = parseInt(document.getElementById("optimaleBestellmenge").value, 10);
    let optimaleBestellhaeufigkeit = parseInt(document.getElementById("optimaleBestellhaeufigkeit").value, 10);
    let bestellkosten = parseInt(document.getElementById("bestellkosten").value, 10);
    let schrittweite = parseInt(document.getElementById("schrittweite").value, 10);

    function validateInputs(optimaleBestellmenge, optimaleBestellhaeufigkeit, bestellkosten, schrittweite) {
        const inputs = [
            { value: optimaleBestellmenge, min: 1, max: 999999999, message: "Optimale Bestellmenge (1 - 999999999)" },
            { value: optimaleBestellhaeufigkeit, min: 1, max: 100, message: "Optimale Bestellhäufigkeit (1 - 100)" },
            { value: bestellkosten, min: 1, max: 999999999, message: "Bestellkosten (1 - 999999999)" },
            { value: schrittweite, min: 1, max: 100, message: "Schrittweite (1 - 100)" }
        ];

        for (const input of inputs) {
            if (isNaN(input.value) || input.value < input.min || input.value > input.max) {
                alert(`Bitte eine gültige Zahl eingeben: ${input.message}.`);
                return false;
            }
        }

        return true;
    }

    // Verwendung:
    if (!validateInputs(optimaleBestellmenge, optimaleBestellhaeufigkeit, bestellkosten, schrittweite)) {
        return;
    }
    const haeufigkeitVon = parseInt(document.getElementById("haeufigkeitVon").value, 10);
    const haeufigkeitBis = parseInt(document.getElementById("haeufigkeitBis").value, 10);
    if (isNaN(haeufigkeitVon) || isNaN(haeufigkeitBis) || haeufigkeitVon < 1 || haeufigkeitBis > 100 || haeufigkeitVon >= haeufigkeitBis) {
        alert('Bitte einen gültigen Bereich für die Bestellhäufigkeit eingeben (1 bis 100, "von" kleiner als "bis").');
        return;
    }

    // Input-Feldwerte abrufen
    optimaleBestellmenge = document.getElementById('optimaleBestellmenge').value;
    bestellkosten = document.getElementById('bestellkosten').value;
    optimaleBestellhaeufigkeit = document.getElementById('optimaleBestellhaeufigkeit').value;
    bedarf = optimaleBestellmenge * optimaleBestellhaeufigkeit;
    // Andler-Formel anwenden
    lagerkosten = (2 * bedarf * bestellkosten) / (optimaleBestellmenge * optimaleBestellmenge);
    lagerkosten = roundToTwoDecimals(lagerkosten);
    // Container erstellen
    generiereContainer();
}

function generiereContainer() {
    // Tabelle leeren
    const lagerkostenElement = document.getElementById('lagerkosten');
    const bedarfElement = document.getElementById('bedarf');
    const ContainerElement = document.getElementById('Container');

    lagerkostenElement.innerText = formatCurrency(lagerkosten);
    bedarfElement.innerText = formatNumberWithSpace(bedarf);
    ContainerElement.innerHTML = '<h3>Tabelle</h3>';

    // Input-Feldwerte abrufen
    const bestellkosten = parseInt(document.getElementById('bestellkosten').value, 10);
    const optimaleBestellhaeufigkeit = parseInt(document.getElementById('optimaleBestellhaeufigkeit').value, 10);
    const schrittweite = parseInt(document.getElementById('schrittweite').value, 10);

    const werteArray = [];

    // Berechnungen außerhalb der Schleife
    const durchschnittlicherBestand = roundToTwoDecimals(bedarf / (2 * optimaleBestellhaeufigkeit));
    const bestellkostenGesamt = roundToTwoDecimals(bestellkosten * optimaleBestellhaeufigkeit);
    const lagerhaltungskosten = roundToTwoDecimals(durchschnittlicherBestand * lagerkosten);
    const gesamtkosten = roundToTwoDecimals(parseFloat(bestellkostenGesamt) + parseFloat(lagerhaltungskosten));

    werteArray.push({
        bestellmenge: Math.round(bedarf / optimaleBestellhaeufigkeit),
        haeufigkeit: optimaleBestellhaeufigkeit,
        durchschnittlicherBestand: durchschnittlicherBestand,
        bestellkostenGesamt: bestellkostenGesamt,
        lagerhaltungskosten: lagerhaltungskosten,
        gesamtkosten: gesamtkosten
    });

    const haeufigkeitVon = parseInt(document.getElementById('haeufigkeitVon').value, 10);
    const haeufigkeitBis = parseInt(document.getElementById('haeufigkeitBis').value, 10);
    let schritte = schrittweite;
    const startHaeufigkeit = Math.ceil(haeufigkeitVon / schritte) * schritte;
    for (let haeufigkeit = startHaeufigkeit; haeufigkeit <= haeufigkeitBis; haeufigkeit += schritte) {
        if (haeufigkeit === optimaleBestellhaeufigkeit) continue;

        // Werte berechnen
        const durchschnittlicherBestand = roundToTwoDecimals(bedarf / (2 * haeufigkeit));
        const bestellkostenGesamt = roundToTwoDecimals(bestellkosten * haeufigkeit);
        const lagerhaltungskosten = roundToTwoDecimals(durchschnittlicherBestand * lagerkosten);
        const gesamtkosten = roundToTwoDecimals(parseFloat(bestellkostenGesamt) + parseFloat(lagerhaltungskosten));

        // Werte zum Array hinzufügen
        werteArray.push({
            bestellmenge: Math.round(bedarf / haeufigkeit),
            haeufigkeit: haeufigkeit,
            durchschnittlicherBestand: durchschnittlicherBestand,
            bestellkostenGesamt: bestellkostenGesamt,
            lagerhaltungskosten: lagerhaltungskosten,
            gesamtkosten: gesamtkosten
        });
    }

    // Tabelle nach Bestellmenge absteigend sortieren
    werteArray.sort((a, b) => b.haeufigkeit - a.haeufigkeit);

    // Tabelle erstellen
    const table = document.createElement('table');
    table.style.width = '680px';
    table.style.borderCollapse = 'collapse';

    const thTitles = ['Bestellmenge', 'Bestellhäufigkeit', 'Durchschn. Lagerbestand', 'Bestellkosten', 'Lagerkosten', 'Gesamtkosten'];
    const headerRow = table.insertRow(0);

    thTitles.forEach(title => {
        const th = document.createElement('th');
        th.textContent = title;
        th.style.backgroundColor = '#f5f5f5';
        th.style.border = '1px solid #000';
        th.style.padding = '4px';
        headerRow.appendChild(th);
    });

    werteArray.forEach(wert => {
        const row = table.insertRow(-1);
        ['bestellmenge', 'haeufigkeit', 'durchschnittlicherBestand', 'bestellkostenGesamt', 'lagerhaltungskosten', 'gesamtkosten'].forEach(key => {
            const cell = row.insertCell();
            if (['bestellkostenGesamt', 'lagerhaltungskosten', 'gesamtkosten'].includes(key)) {
                cell.textContent = formatCurrency(wert[key]);
            } else {
                cell.textContent = formatNumberWithSpace(wert[key]);
            }
            cell.style.border = '1px solid #000';
            cell.style.textAlign = ['Bestellkosten', 'Lagerkosten', 'Gesamtkosten'].includes(key) ? 'right' : 'center';
            cell.style.padding = '4px';
        });
    });

    // Tabelle in DOM einfügen
    ContainerElement.appendChild(table);

    drawChart(werteArray);
    aktualisiereLoesung();
}

function drawChart(werteArray) {

    // Berechnungen
    const optimaleBestellmenge = parseInt(document.getElementById("optimaleBestellmenge").value, 10);
    const bestellkosten = parseInt(document.getElementById("bestellkosten").value, 10);
    const optimaleBestellhaeufigkeit = parseInt(document.getElementById('optimaleBestellhaeufigkeit').value, 10);
    const bedarf = optimaleBestellmenge * optimaleBestellhaeufigkeit;
    const lagerkosten = (2 * bedarf * bestellkosten) / (optimaleBestellmenge * optimaleBestellmenge);
    const labels = [];
    const lagerhaltungskostenData = [];
    const bestellkostenData = [];
    const gesamtkostenData = [];

    let schrittebestellmenge = roundUpToNearest(optimaleBestellmenge / 100)

    // Daten für das Diagramm berechnen
    for (let i = schrittebestellmenge; i <= optimaleBestellmenge * 2; i += schrittebestellmenge) {
        const durchschnittlicherBestand = roundToTwoDecimals(i / 2);
        const bestellkostenGesamt = roundToTwoDecimals(bestellkosten * bedarf / i);
        const lagerhaltungskosten = roundToTwoDecimals(durchschnittlicherBestand * lagerkosten);
        const gesamtkosten = roundToTwoDecimals(parseFloat(bestellkostenGesamt) + parseFloat(lagerhaltungskosten));

        labels.push(i);
        lagerhaltungskostenData.push(parseFloat(lagerhaltungskosten));
        bestellkostenData.push(parseFloat(bestellkostenGesamt));
        gesamtkostenData.push(parseFloat(gesamtkosten));
    }

    // ApexCharts konfigurieren
    let ychartmax = roundUpToNearest((optimaleBestellhaeufigkeit * bestellkosten + optimaleBestellmenge / 2 * lagerkosten) * 3);
    // Berechne den Wert von tickAmount
    let tickAmount = schrittebestellmenge * 2;
    // Begrenze tickAmount auf maximal 20
    if (tickAmount > 20) {
        tickAmount = 20;
    }
    const options = {
        chart: {
            background: '#ffffff',
            animations: { enabled: false },
            type: 'line',
            height: 500,
            toolbar: {
                show: true, // Hier aktivierst du die Toolbar
                offsetX: 0,
                offsetY: 0,
                tools: {
                    download: true,  // Download Button aktivieren
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                    reset: true | '<img src="/static/icons/reset.png" width="20">',
                    customIcons: []
                },
                export: {
                    svg: {
                        filename: 'chart-export.svg',  // SVG-Dateiname
                    },
                    png: {
                        filename: 'chart-export.png', // PNG-Dateiname
                    },
                    csv: {
                        filename: 'chart-export.csv', // CSV-Dateiname
                    }
                },
                autoSelected: 'zoom'
            },
        },
        dataLabels: {
            enabled: false
        },
        series: [
            {
                name: 'Lagerhaltungskosten',
                data: lagerhaltungskostenData,
            },
            {
                name: 'Bestellkosten',
                data: bestellkostenData,
            },
            {
                name: 'Gesamtkosten',
                data: gesamtkostenData,
            }
        ],
        stroke: {
            width: 4,
            curve: 'straight',

        },
        xaxis: {
            categories: labels,
            title: {
                text: 'Bestellmenge',
                style: {
                    fontSize: '14px',
                    fontWeight: 'bold',
                }
            },
            min: 0,
            tickAmount: tickAmount, // Reduziert die Anzahl der angezeigten Ticks
            labels: {
                style: {
                    fontSize: '14px',
                }
            },
        },
        yaxis: {
            title: {
                text: 'Kosten',
                style: {
                    fontSize: '14px',
                    fontWeight: 'bold',
                }
            },
            max: ychartmax,
            labels: {
                formatter: function (value) {
                    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
                },
                style: {
                    fontSize: '16px',
                }
            },
        },
        grid: {
            show: true, // Das Grid anzeigen
            borderColor: '#ccc', // Farbe der Gittergrenzen
            strokeDashArray: 0, // Strichmuster für Gitterlinien (5px Striche, 5px Lücken)
            xaxis: {
                lines: {
                    show: true, // X-Achse Linien anzeigen
                    width: 4,   // Linienbreite der X-Achse
                    color: '#000', // Farbe der X-Achse Linien
                }
            },
            yaxis: {
                lines: {
                    show: true, // Y-Achse Linien anzeigen
                    width: 1,   // Linienbreite der Y-Achse
                    color: '#000', // Farbe der Y-Achse Linien
                }
            },
        },
        tooltip: {
            enabled: false,
            y: {
                formatter: function (value) {
                    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
                }
            }
        },
        legend: {
            position: 'top', // Legende nach oben verschieben
            horizontalAlign: 'center', // Horizontal zentrieren
            verticalAlign: 'top', // Vertikal oben ausrichten
            floating: true, // Optional: floatet die Legende oben über dem Diagramm
        },
    };
    // Entferne den Inhalt des Containers und erstelle das Diagramm neu
    if (bestellChart) { try { bestellChart.destroy(); } catch (e) { } }
    const chartContainer = document.querySelector("#chart");
    chartContainer.innerHTML = "";

    bestellChart = new ApexCharts(chartContainer, options);
    bestellChart.render().then(aktualisiereDiagrammPng).catch(err => console.error('Diagramm-Fehler:', err));
}

// Diagramm als PNG unter die Tabelle im Container setzen (oder wieder entfernen)
function aktualisiereDiagrammPng() {
    const container = document.getElementById('Container');
    if (!container) return;

    const alt = document.getElementById('diagrammPng');
    if (alt) alt.remove();

    const cb = document.getElementById('chartAlsPng');
    if (!cb || !cb.checked || !bestellChart) { aktualisiereLoesung(); return; }

    bestellChart.dataURI({ scale: 2 }).then(({ imgURI }) => {
        const doppelt = document.getElementById('diagrammPng');
        if (doppelt) doppelt.remove();

        const img = document.createElement('img');
        img.src = imgURI;
        img.alt = 'Diagramm Optimale Bestellmenge';
        img.style.cssText = 'display:block; max-width:100%; height:auto;';
        img.style.width = (bestellChart.w?.globals?.svgWidth || 750) + 'px';

        const div = document.createElement('div');
        div.id = 'diagrammPng';
        div.innerHTML = '<br><h3>Diagramm</h3>';
        div.appendChild(img);
        container.appendChild(div);
        aktualisiereLoesung();
    }).catch(err => console.error('PNG konnte nicht erstellt werden:', err));
}

// Lösung ans Ende des Containers setzen (unter Aufgabe, Tabelle und Diagramm)
function aktualisiereLoesung() {
    const container = document.getElementById('Container');
    if (!container) return;

    const alt = document.getElementById('bmLoesung');
    if (alt) alt.remove();

    const menge = parseInt(document.getElementById('optimaleBestellmenge').value, 10);
    const haeuf = parseInt(document.getElementById('optimaleBestellhaeufigkeit').value, 10);
    const bk = parseInt(document.getElementById('bestellkosten').value, 10);
    if (!(menge > 0 && haeuf > 0 && bk > 0)) return;

    const bedarfL = menge * haeuf;
    const lager = roundToTwoDecimals(2 * bedarfL * bk / (menge * menge));
    const durchschnitt = roundToTwoDecimals(bedarfL / (2 * haeuf));
    const bestellGes = roundToTwoDecimals(bk * haeuf);
    const lagerGes = roundToTwoDecimals(durchschnitt * lager);
    const gesamt = roundToTwoDecimals(bestellGes + lagerGes);

    const p = 'margin:0 0 8px 0;';
    const div = document.createElement('div');
    div.id = 'bmLoesung';
    div.innerHTML = `
<h2 style="font-size:1.3em;" class="loesung">Lösung</h2>
<p style="${p}"><strong>1. Zielkonflikt</strong></p>
<p style="${p}">Bestellt das Unternehmen selten, aber in großen Mengen, sinken die Bestellkosten, weil nur wenige Bestellungen anfallen. Gleichzeitig steigt der durchschnittliche Lagerbestand und damit steigen die Lagerkosten. Bestellt es dagegen oft kleine Mengen, sind die Lagerkosten niedrig, aber die Bestellkosten hoch. Beide Kostenarten verhalten sich gegenläufig. Ziel ist es, die Bestellmenge zu finden, bei der die Gesamtkosten am niedrigsten sind.</p>
<p style="${p}"><strong>2. Zusammenhang laut Diagramm</strong></p>
<p style="${p}">Mit steigender Bestellmenge sinken die Bestellkosten, da weniger Bestellungen nötig sind. Die Lagerhaltungskosten steigen dagegen gleichmäßig an, da der durchschnittliche Lagerbestand (Bestellmenge : 2) größer wird. Die Gesamtkosten sind die Summe beider Kurven. Sie fallen zunächst, erreichen ein Minimum und steigen dann wieder an. Das Minimum der Gesamtkosten liegt genau im Schnittpunkt der Kurven für Bestellkosten und Lagerhaltungskosten.</p>
<p style="${p}"><strong>3. Optimale Bestellmenge</strong></p>
<p style="${p}">Die optimale Bestellmenge beträgt <strong>${formatNumberWithSpace(menge)} Stück</strong> bei <strong>${haeuf} Bestellungen</strong> im Jahr. In der Tabelle sind hier die Gesamtkosten mit <strong>${formatCurrency(gesamt)}</strong> am niedrigsten. Bestellkosten (${formatCurrency(bestellGes)}) und Lagerkosten (${formatCurrency(lagerGes)}) sind (ungefähr) gleich hoch. In der Grafik liegt das Minimum der Gesamtkosten beim Schnittpunkt der Kurven für Bestell- und Lagerhaltungskosten.</p>`;
    container.appendChild(div);
}

document.addEventListener('DOMContentLoaded', function () {
    // Hier wird generiereContainer() beim Laden der Seite ausgeführt
    berechneOptimaleBestellmengeUndHaeufigkeit();
});

