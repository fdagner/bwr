            // ============================================================================
            // YAML-Daten und Unternehmen laden
            // ============================================================================
            let yamlData = [];

  let kunde = '<i>[Modellunternehmen]</i>';

  // ============================================================================
// BENUTZERDEFINIERTE UNTERNEHMEN - Integration
// ============================================================================

// Funktion zum Abrufen der benutzerdefinierten Unternehmen aus dem Local Storage
function getUserCompanies() {
  const stored = localStorage.getItem('userCompanies');
  return stored ? JSON.parse(stored) : [];
}

// Funktion zum Zusammenführen der benutzerdefinierten Unternehmen mit den Standard-YAML-Daten
function mergeUserCompaniesIntoYamlData() {
  const userCompanies = getUserCompanies();
  
  if (userCompanies.length > 0) {
    // Füge Benutzerunternehmen zu yamlData hinzu
    yamlData = [...yamlData, ...userCompanies];
    
    // Sortiere nach Branche
    yamlData.sort((a, b) => {
      const brancheA = a.unternehmen?.branche || '';
      const brancheB = b.unternehmen?.branche || '';
      return brancheA.localeCompare(brancheB);
    });
    
    console.log(`${userCompanies.length} Benutzerunternehmen hinzugefügt. Gesamt: ${yamlData.length} Unternehmen`);
  }
}


// Versuch 1: Aus localStorage laden (wenn User eigene Datei hochgeladen hat)
function loadYamlFromLocalStorage() {
  const saved = localStorage.getItem('uploadedYamlCompanyData');
  if (saved) {
    try {
      yamlData = JSON.parse(saved);
      console.log(`yamlData aus localStorage geladen (${yamlData.length} Unternehmen)`);
      
      // ← NEU: Benutzerdefinierte Unternehmen hinzufügen
      mergeUserCompaniesIntoYamlData();
      
      document.dispatchEvent(new Event('yamlDataLoaded'));
      return true;
    } catch (err) {
      console.warn("localStorage YAML kaputt:", err);
    }
  }
  return false;
}

  // Versuch 2: Standard-Datei laden
// Versuch 2: Standard-Datei laden
function loadDefaultYaml() {
  fetch('js/unternehmen.yml')
    .then(res => {
      if (!res.ok) throw new Error('unternehmen.yml nicht gefunden');
      return res.text();
    })
    .then(yamlText => {
      yamlData = jsyaml.load(yamlText) || [];
      
      // ← NEU: Standard-Daten im LocalStorage speichern (falls noch nicht vorhanden)
      if (!localStorage.getItem('standardYamlData')) {
        localStorage.setItem('standardYamlData', JSON.stringify(yamlData));
      }
      
      // ← NEU: Benutzerdefinierte Unternehmen hinzufügen
      mergeUserCompaniesIntoYamlData();
      
      console.log(`Standard yamlData geladen (${yamlData.length} Unternehmen)`);
      document.dispatchEvent(new Event('yamlDataLoaded'));
    })
    .catch(err => {
      console.error("Konnte unternehmen.yml nicht laden:", err);
      // Optional: leere Liste oder Fehlermeldung im UI
    });
}



            async function loadYAML() {
                try {
                    const response = await fetch('js/unternehmen.yml');
                    const yamlText = await response.text();
                    const data = jsyaml.load(yamlText);
                    return data.map(item => item.unternehmen) || [];
                } catch (error) {
                    console.error('Fehler beim Laden der YAML-Datei:', error);
                    return [];
                }
            }

            // Filtere alle Unternehmen mit der Rechtsform "AG"
            async function filterAGUnternehmen() {
                const unternehmen = await loadYAML();

                if (!Array.isArray(unternehmen)) {
                    console.error("Die 'unternehmen'-Daten sind nicht im richtigen Format.");
                    return [];
                }

                const agUnternehmen = unternehmen.filter(company => company.rechtsform === "AG");
                return agUnternehmen;
            }

            // Dropdown für Käufer/Verkäufer (alle Unternehmen) befüllen
            function fillKaeuferDropdown() {
                if (!yamlData || yamlData.length === 0) {
                    console.warn("yamlData ist leer → keine Unternehmen zum Befüllen");
                    return;
                }

                const sortedCompanies = [...yamlData].sort((a, b) => {
                    const brancheA = a.unternehmen?.branche || '';
                    const brancheB = b.unternehmen?.branche || '';
                    if (brancheA !== brancheB) return brancheA.localeCompare(brancheB);
                    return (a.unternehmen?.name || '').localeCompare(b.unternehmen?.name || '');
                });

                const kaeuferSelect = document.getElementById('aktienKaeufer');
                
                if (!kaeuferSelect) return;

                kaeuferSelect.innerHTML = '';
                const opt = document.createElement('option');
                opt.value = '';
                opt.text = '— bitte Unternehmen auswählen —';
                opt.disabled = true;
                kaeuferSelect.appendChild(opt);

                sortedCompanies.forEach(company => {
                    const u = company.unternehmen;
                    if (!u?.name) return;

                    const displayText = u.branche 
                        ? `${u.branche} – ${u.name} ${u.rechtsform || ''}`.trim()
                        : `${u.name} ${u.rechtsform || ''}`.trim();

                    const option = document.createElement('option');
                    option.value = u.name;
                    option.textContent = displayText;
                    option.dataset.id = u.id || '';
                    option.dataset.rechtsform = u.rechtsform || '';
                    option.dataset.branche = u.branche || '';

                    kaeuferSelect.appendChild(option);
                });

                // Wähle den ersten Eintrag (nicht den Platzhalter)
                if (sortedCompanies.length > 0) {
                    kaeuferSelect.selectedIndex = 1; // Index 1, da 0 der Platzhalter ist
                }

                console.log(`Käufer-Dropdown befüllt mit ${sortedCompanies.length} Unternehmen`);
            }

            async function populateDropdown() {
                const agUnternehmen = await filterAGUnternehmen();
                const dropdown = document.getElementById("unternehmen");

                if (agUnternehmen.length === 0) {
                    console.log("Keine AG-Unternehmen gefunden.");
                    return;
                }

                agUnternehmen.forEach(company => {
                    const option = document.createElement("option");
                    option.value = company.id;
                    option.textContent = `${company.name} (${company.rechtsform})`;
                    option.dataset.name = company.name;
                    option.dataset.rechtsform = company.rechtsform;
                    dropdown.appendChild(option);
                });

                if (agUnternehmen.length > 0) {
                    dropdown.value = agUnternehmen[0].id;
                    // Initial das Chart und Text erstellen
     
                }
            }

            function generateStockData(period, year, timeframe) {
                const today = new Date();
                const data = [];
                let currentPrice = Math.floor(Math.random() * (250 - 10 + 1) + 10);

                const endDate = new Date(year, today.getMonth(), today.getDate());

                if (timeframe === "days") {
                    for (let i = 0; i < period; i++) {
                        const date = new Date(endDate);
                        date.setDate(endDate.getDate() - (period - i));
                        currentPrice += Math.floor(Math.random() * 5 - 2);
                        currentPrice = Math.max(currentPrice, 1);
                        data.push({ x: date, y: currentPrice });
                    }
                } else {
                    for (let i = 0; i < period; i++) {
                        const date = new Date(endDate.getFullYear(), endDate.getMonth() - period + i);
                        currentPrice += Math.floor(Math.random() * 5 - 2);
                        currentPrice = Math.max(currentPrice, 1);
                        data.push({ x: date, y: currentPrice });
                    }
                }

                return data;
            }

            function calculateChartWidth(months) {
                const widthPerMonth = 75;
                const maxWidth = 800;
                const calculatedWidth = months * widthPerMonth;
                return Math.min(calculatedWidth, maxWidth);
            }

            function formatXAxisDate(date, timeframe) {
                const months = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
                if (timeframe === "days") {
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = months[date.getMonth()];
                    const year = date.getFullYear();
                    return `${day}. ${month}`;
                } else {
                    const month = months[date.getMonth()];
                    const year = String(date.getFullYear()).slice(2);
                    return `${month} ${year}`;
                }
            }

            function getYearForLastPoint(data) {
                const lastDate = data[data.length - 1].x;
                const year = lastDate.getFullYear();
                return year;
            }

            let chart;

            async function updateChartAndText() {
                const timeframe = document.querySelector("#timeframe").value;
                const period = parseInt(document.querySelector("#period").value, 10);
                const year = parseInt(document.querySelector("#year").value, 10);
                const selectedCompanyId = document.querySelector("#unternehmen").value;

                const unternehmen = await loadYAML();
                const selectedCompany = unternehmen.find(company => company.id === selectedCompanyId);

                if (!selectedCompany) {
                    alert("Bitte wählen Sie ein Unternehmen aus!");
                    return;
                }

                const data = generateStockData(period, year, timeframe);

                if (chart) {
                    chart.destroy();
                }

                renderChart(data, selectedCompany, timeframe);
                insertDynamicText(new Date(), selectedCompany, data[data.length - 1].y, data);
            }

            function renderChart(data, company, timeframe) {
                const prices = data.map(point => point.y);
                const lastPrice = prices[prices.length - 1];
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);

                const yAxisMin = Math.floor(Math.max(minPrice - 5, 0) / 2) * 2;
                const yAxisMax = Math.ceil((maxPrice + 5) / 2) * 2;

                const formattedData = data.map(point => ({
                    x: formatXAxisDate(point.x, timeframe),
                    y: point.y
                }));

                const chartWidth = calculateChartWidth(data.length);
                const yearForLastPoint = getYearForLastPoint(data);

                const options = {
                    chart: {
                        type: 'line',
                        background: 'white',
                        height: 400,
                        width: chartWidth,
                        toolbar: {
                            show: true,
                            tools: {
                                download: true,
                                selection: true,
                                zoom: true,
                                zoomin: true,
                                zoomout: true,
                                pan: true,
                                reset: true
                            },
                            export: {
                                csv: {
                                    filename: "diagramm-daten",
                                    columnDelimiter: ',',
                                    headerCategory: 'Kategorie',
                                    headerValue: 'Wert',
                                    dateFormatter: (timestamp) => new Date(timestamp).toLocaleDateString("de-DE")
                                },
                                svg: {
                                    filename: "diagramm-svg"
                                },
                                png: {
                                    filename: "diagramm-png"
                                }
                            },
                            autoSelected: 'zoom'
                        },
                    },
                    series: [{
                        name: "Stückkurs",
                        data: formattedData
                    }],
                    stroke: {
                        curve: 'straight',
                    },
                    xaxis: {
                        type: 'category',
                        title: { text: '' },
                        labels: {
                            rotate: -45,
                            rotateAlways: true,
                            style: {
                                fontSize: '15px'
                            },

                        },
                        crosshairs: {
                            show: true,
                            width: 1,
                            stroke: {
                                color: '#999',
                                dashArray: 0
                            }
                        }
                    },
                    yaxis: {
                        title: { text: '' },
                        labels: {
                            style: {
                                fontSize: '15px'
                            },
                            formatter: (val) => {
                                return `${val.toFixed(0)} €`;
                            }
                        },
                        min: yAxisMin,
                        max: yAxisMax,
                        tickAmount: (yAxisMax - yAxisMin) / 2,
                    },
                    grid: {
                        borderColor: '#999',
                        strokeDashArray: [2],
                        xaxis: {
                            lines: {
                                show: true,
                            }
                        },
                        yaxis: {
                            lines: {
                                show: true,
                            },
                        }
                    },
                    title: {
                        text: `${company.name} ${company.rechtsform} Aktie`,
                        align: 'center',
                        style: {
                            fontSize: '20px'
                        },
                    },
                    markers: {
                        size: 5,
                        colors: ['#FF4560'],
                        strokeColors: '#000',
                        strokeWidth: 2,
                        hover: {
                            size: 7
                        }
                    }
                };

                const chartElement = document.querySelector("#chart");
                chartElement.innerHTML = "";
                chart = new ApexCharts(chartElement, options);
                chart.render();
            }

            document.querySelector("#wertpapiereArtInput").addEventListener("change", updateChartAndText);
            document.querySelector("#unternehmen").addEventListener("change", updateChartAndText);
            document.querySelector("#generate-chart").addEventListener("click", updateChartAndText);
            
            // Event-Listener für Käufer-Dropdown (aktualisiert nur den Text, nicht das Chart)
            document.addEventListener('DOMContentLoaded', () => {
                const kaeuferSelect = document.getElementById('aktienKaeufer');
                if (kaeuferSelect) {
                    kaeuferSelect.addEventListener("change", () => {
                        // Nur Text aktualisieren, nicht das gesamte Chart neu rendern
                        if (chart && chart.w && chart.w.globals.series[0] && chart.w.globals.series[0].data) {
                            const currentData = chart.w.globals.series[0].data;
                            const lastPrice = currentData[currentData.length - 1].y;
                            const selectedCompanyId = document.querySelector("#unternehmen").value;
                            
                            loadYAML().then(unternehmen => {
                                const selectedCompany = unternehmen.find(company => company.id === selectedCompanyId);
                                if (selectedCompany) {
                                    const chartDataArray = currentData.map(point => ({ x: new Date(), y: point.y }));
                                    insertDynamicText(new Date(), selectedCompany, lastPrice, chartDataArray);
                                }
                            });
                        }
                    });
                }
            });

            // Währung nach DIN 5008
            function formatCurrency(value) {
                return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
            }

            function generateRandomStep() {
                const possibleValues = [-0.2, -0.1, -0.05, 0.05, 0.1, 0.2];
                const randomIndex = Math.floor(Math.random() * possibleValues.length);
                return possibleValues[randomIndex];
            }

            // ============================================================================
            // HILFSFUNKTIONEN FÜR WERTPAPIER-BELEG-BUTTONS
            // ============================================================================

            function aktienParseNumericValue(value) {
                if (!value) return '0';
                return value.toString()
                    .replace(/[€\s]/g, '')
                    .replace(/\./g, '')
                    .replace(',', '.');
            }

            function generiereISIN() {
                // DE + 10 Zufallsziffern + Prüfziffer (vereinfacht)
                const ziffern = Array.from({length: 10}, () => Math.floor(Math.random() * 10)).join('');
                return `DE${ziffern}`;
            }

            function aktienErzeugeURLFuerBeleg(geschaeftsfallDaten) {
                const params = new URLSearchParams();

                // Basis-Parameter
                params.set('beleg', 'wertpapiere');
                params.set('vorlage', 'wertpapier.svg');

                // Art (Kauf/Verkauf)
                if (geschaeftsfallDaten.art) {
                    params.set('art', geschaeftsfallDaten.art);
                }

                // AG-Bezeichnung
                if (geschaeftsfallDaten.bezeichnung) {
                    params.set('bezeichnung', geschaeftsfallDaten.bezeichnung);
                }

                // ISIN
                if (geschaeftsfallDaten.isin) {
                    params.set('isin', geschaeftsfallDaten.isin);
                }

                // Stückkurs
                if (geschaeftsfallDaten.stueckkurs) {
                    params.set('stueckkurs', aktienParseNumericValue(geschaeftsfallDaten.stueckkurs));
                }

                // Anzahl
                if (geschaeftsfallDaten.anzahl) {
                    params.set('anzahl', geschaeftsfallDaten.anzahl);
                }

                // Datum
                if (geschaeftsfallDaten.datum) {
                    const d = geschaeftsfallDaten.datum;
                    params.set('tag', d.getDate().toString().padStart(2, '0'));
                    params.set('monat', (d.getMonth() + 1).toString().padStart(2, '0'));
                    params.set('jahr', d.getFullYear().toString());
                }

                // Unternehmen (Käufer/Verkäufer)
                const kaeuferSelect = document.getElementById('aktienKaeufer');
                if (kaeuferSelect?.value) {
                    params.set('unternehmen', kaeuferSelect.value.trim());
                }

                return `belege.html?${params.toString()}`;
            }

            function aktienErstelleBelegButton(daten) {
                const url = aktienErzeugeURLFuerBeleg(daten);
                const artText = daten.art === 'wertpapiereKauf' ? 'Kaufabrechnung' : 'Verkaufsabrechnung';
                
                return `
                    <button class="geschaeftsfall-beleg-button"
                            onclick="window.open('${url}', '_blank')"
                            title="${artText} als SVG-Beleg öffnen"
                            style="width: 100%; padding: 10px 12px; font-size: 14px;">
                        📄 ${artText} erstellen
                    </button>
                `;
            }

            function insertDynamicText(date, company, lastPrice, chartData) {
                // Formatierung des Datums ins deutsche Format
                date.setDate(date.getDate() - 1); 
                let formattedDate = date.toLocaleDateString("de-DE");
                
                // Käufer/Verkäufer aus Dropdown holen
                const kaeuferSelect = document.getElementById('aktienKaeufer');
                const kaeuferName = kaeuferSelect?.value || '[Unternehmen]';
                
                // Berechnung der Anzahl der Aktien (Zufallswert zwischen 100 und 1000, in 10er-Schritten)
                let anzahlAktien = Math.floor(Math.random() * (1000 - 100 + 1) / 10) * 10 + 100;
                
                // Berechnung der Spesen (1 % vom Kurswert)
                let kurswert = (anzahlAktien * lastPrice);
                let spesen = (kurswert * 0.01);
                let banklastschrift = kurswert + spesen;
                let bankgutschrift = kurswert - spesen;
                const abweichungKurswertKauf = generateRandomStep();
                let banklastschriftAlt = bankgutschrift + abweichungKurswertKauf*bankgutschrift;
                let differenzKurswert = banklastschriftAlt - bankgutschrift;
                let differenzKurswert_betrag = Math.abs(differenzKurswert);
                
                // ISIN generieren
                const isin = generiereISIN();

                // Daten für Beleg-Button
                const belegDaten = {
                    art: wertpapiereArtInput.value,
                    bezeichnung: `${company.name} ${company.rechtsform}`,
                    isin: isin,
                    stueckkurs: lastPrice,
                    anzahl: anzahlAktien,
                    datum: date
                };

                // Formatierung für Anzeige
                banklastschriftAlt = formatCurrency(banklastschriftAlt);
                kurswert = formatCurrency(kurswert);
                spesen = formatCurrency(spesen);
                banklastschrift = formatCurrency(banklastschrift);
                bankgutschrift = formatCurrency(bankgutschrift);
                differenzKurswert_betrag = formatCurrency(differenzKurswert_betrag);
                
                // Text erstellen
                let text;
                if (wertpapiereArtInput.value === 'wertpapiereKauf') {
                    text = `
                <h2>Aufgabe</h2>
        Am ${formattedDate} kauft ${kaeuferName} ${anzahlAktien} Aktien der „${company.name} ${company.rechtsform}".
        Die Spesen betragen 1 % vom Kurswert. Bilde den Buchungssatz.
        <h3>Lösung</h3>
           <h4>Nebenrechnung</h4>
         <table style="border-collapse: collapse;white-space:nowrap;width:400px;margin: 0 0">
            <tr>
                <td>Kurswert (${anzahlAktien} x ${lastPrice},00 €)</td>
                <td style="padding-left:6px;text-align:right;">${kurswert}</td><td style="padding-left:6px;text-align:right;">100 %</td>
            </tr>
            <tr>
                <td>+ Spesen</td><td style="padding-left:6px;text-align:right;">${spesen}</td><td style="padding-left:6px;text-align:right;">1 %</td>
            </tr>
            <tr>
                <td style="border-top: solid 1px #ccc">= Banklastschrift</td><td style="border-top: solid 1px #ccc;padding-left:6px;text-align:right;">${banklastschrift}</td><td style="border-top: solid 1px #ccc;padding-left:6px;text-align:right;">101 %</td>
            </tr>
        </table>
        <h4>Buchungssatz</h4>
        <table style="margin:0;white-space:nowrap;font-family:courier;min-width:540px;"><tbody>
            <tr>
            <td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;width: 150px;max-width: 150px" tabindex="1">1500 WP</td>
            <td style="text-align: center;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;width: 80px" tabindex="1">an</td>
            <td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;width: 150px;max-width: 150px" tabindex="1">2800 BK</td>
            <td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;width: 160px;max-width: 160px;text-align: right" tabindex="1">${banklastschrift}</td>
            </tr></tbody></table>
    `;
                } else {
                    text = `
                <h2>Aufgabe</h2>
        Am ${formattedDate} verkauft ${kaeuferName} ${anzahlAktien} Aktien der „${company.name} ${company.rechtsform}".
        Die Spesen betragen 1 % vom Kurswert. Die Banklastschrift beim Kauf betrug ${banklastschriftAlt}. Bilde den Buchungssatz.
        <h3>Lösung</h3>
           <h4>Nebenrechnung</h4>
         <table style="border-collapse: collapse;white-space:nowrap;width:400px;margin: 0 0">
            <tr>
                <td>Kurswert (${anzahlAktien} x ${lastPrice},00 €)</td>
                <td style="padding-left:6px;text-align:right;">${kurswert}</td><td style="padding-left:6px;text-align:right;">100 %</td>
            </tr>
            <tr>
                <td>- Spesen</td><td style="padding-left:6px;text-align:right;">${spesen}</td><td style="padding-left:6px;text-align:right;">1 %</td>
            </tr>
            <tr>
                <td style="border-top: solid 1px #ccc">= Bankgutschrift</td><td style="border-top: solid 1px #ccc;padding-left:6px;text-align:right;">${bankgutschrift}</td><td style="border-top: solid 1px #ccc;padding-left:6px;text-align:right;">99 %</td>
            </tr>
        </table>
        <h4>Buchungssatz</h4>
        <table style="margin:0;white-space:nowrap;font-family:courier;min-width:660px;"><tbody>
            <tr>
            <td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;width: 150px;max-width: 150px" tabindex="1">2800 BK</td>
             <td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;width: 160px;max-width: 140px;text-align: right" tabindex="1">${bankgutschrift}</td>
                       <td style="text-align: center;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;width: 80px" tabindex="1">an</td>
            <td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;width: 150px;max-width: 150px" tabindex="1">1500 WP</td>
            <td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;width: 160px;max-width: 140px;text-align: right" tabindex="1">${banklastschriftAlt}</td>
            </tr>
              `;
                    if (differenzKurswert < 0) {
                        text += `
            <tr>
            <td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;width: 150px;max-width: 150px" tabindex="1"></td>
             <td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;width: 160px;max-width: 140px;text-align: right" tabindex="1"></td>
                       <td style="text-align: center;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;width: 80px" tabindex="1">an</td>
            <td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;width: 150px;max-width: 150px" tabindex="1">5650 EAWP</td>
            <td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;width: 160px;max-width: 140px;text-align: right" tabindex="1">${differenzKurswert_betrag}</td>
            </tr></tbody></table>
           
    `;  
                    } else {
                        text += `
            <tr>
            <td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;width: 150px;max-width: 150px" tabindex="1">7460 VAWP</td>
             <td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;width: 160px;max-width: 140px;text-align: right" tabindex="1">${differenzKurswert_betrag}</td>
                       <td style="text-align: center;white-space: nowrap;overflow: hidden;text-overflow:ellipsis;width: 80px" tabindex="1">an</td>
            <td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;width: 150px;max-width: 150px" tabindex="1"></td>
            <td style="white-space: nowrap;overflow: hidden;text-overflow:ellipsis;width: 160px;max-width: 140px;text-align: right" tabindex="1"></td>
            </tr></tbody></table>
`;  
                    }
                }

                // Ausgabe im HTML
                const dynamicTextElement = document.getElementById("Container");
                dynamicTextElement.innerHTML = text;

                // Button-Column aktualisieren
                const buttonColumn = document.getElementById('aktien-button-column');
                if (buttonColumn) {
                    buttonColumn.innerHTML = aktienErstelleBelegButton(belegDaten);
                } else {
                    console.warn("aktien-button-column nicht gefunden");
                }
            }

            // Export-Funktionen

            function aktienHerunterladen() {
                const aktienHTML = document.getElementById('Container').innerHTML;
                const blob = new Blob([aktienHTML], { type: 'text/html' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'aktien.html';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }

            function aktienKopiereInZwischenablage() {
                const aktienHTML = document.getElementById('Container').innerHTML;
                navigator.clipboard.writeText(aktienHTML)
                    .then(() => alert('Code wurde in die Zwischenablage kopiert'))
                    .catch(err => console.error('Fehler beim Kopieren in die Zwischenablage:', err));
            }

            function aktienHerunterladenAlsPNG() {
                const Container = document.getElementById('Container');

                html2canvas(Container, optionshtml2canvas).then(canvas => {
                    const dataURL = canvas.toDataURL('image/png');
                    const a = document.createElement('a');
                    a.href = dataURL;
                    a.download = 'aktien.png';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                });
            }

            let clipboardaktien = new ClipboardJS('#aktienOfficeButton');

            clipboardaktien.on('success', function (e) {
                console.log("Die Tabelle wurde in die Zwischenablage kopiert.");
                alert("Die Tabelle wurde in die Zwischenablage kopiert.");
            });

            clipboardaktien.on('error', function (e) {
                console.error("Fehler beim Kopieren der Tabelle: ", e.action);
                alert("Fehler beim Kopieren der Tabelle.");
            });

            // Initialisierung beim Laden der Seite
            document.addEventListener('DOMContentLoaded', () => {
                // Aktuelles Jahr setzen
                const yearInput = document.getElementById('year');
                if (yearInput) {
                    yearInput.value = new Date().getFullYear();
                }
                
                if (!loadYamlFromLocalStorage()) {
                    loadDefaultYaml();
                }
                
                // Warte auf yamlData, dann fülle Käufer-Dropdown
                if (yamlData && yamlData.length > 0) {
                    fillKaeuferDropdown();
                } else {
                    document.addEventListener('yamlDataLoaded', fillKaeuferDropdown, { once: true });
                }
                
                populateDropdown();
            });

            function autoSelectMyCompany() {
        const myCompanyName = localStorage.getItem('myCompany');
        
        if (!myCompanyName) return;
        
        // Finde alle Dropdowns mit class="meinUnternehmen"
        const dropdowns = document.querySelectorAll('select.meinUnternehmen');
        
        dropdowns.forEach(dropdown => {
            // Suche nach der passenden Option
            const options = Array.from(dropdown.options);
            const matchingOption = options.find(opt => opt.value === myCompanyName);
            
            if (matchingOption) {
                dropdown.value = myCompanyName;
                
                // Trigger change event falls andere Scripts darauf reagieren
                const event = new Event('change', { bubbles: true });
                dropdown.dispatchEvent(event);
                
                console.log(`"${myCompanyName}" automatisch in Dropdown ausgewählt`);
            }
        });
    }

    // WICHTIG: Warte bis die Seite vollständig geladen ist
    document.addEventListener('DOMContentLoaded', function() {
        // Warte kurz, damit meinunternehmen.js das Dropdown befüllen kann
        setTimeout(function() {
            autoSelectMyCompany();
            updateChartAndText();
        }, 100);
    });