// Initiale Werte
        let fertigungsmaterial = 500000;
        let zuschlagssatz = 10; // in Prozent
        let fertigungslöhne = 250000;
        let fertigungsgemeinkostenSatz = 120; // in Prozent
        let sondereinzelkosten = 15000;
        let dataLabelsVisible = true;
        let tickAmount = 10; // Initialer Wert der Y-Achsen-Ticks

        // Funktion zur Berechnung der Materialgemeinkosten
        function berechneMaterialgemeinkosten(fertigungsmaterial, zuschlagssatz) {
            return (fertigungsmaterial * zuschlagssatz) / 100;
        }

        // Funktion zur Berechnung der Fertigungsgemeinkosten
        function berechneFertigungsgemeinkosten(fertigungslöhne, fertigungsgemeinkostenSatz) {
            return (fertigungslöhne * fertigungsgemeinkostenSatz) / 100;
        }

        // Konfiguration des Diagramms
        let options = {
            chart: {
                type: 'bar',
                stacked: true,
                height: 400,
                width: 400,
                background: 'white',
                toolbar: {
                        show: true,
            }
            
            },
            
            title: {
                text: 'Materialkosten gesamt',
                align: 'center',
                style: {
                            fontSize: '20px'
                        },
            },
            series: [
                { name: 'Fertigungsmaterial', data: [fertigungsmaterial] },
                { name: 'Materialgemeinkosten', data: [berechneMaterialgemeinkosten(fertigungsmaterial, zuschlagssatz)] }
            ],
            xaxis: {
                categories: [''],
                axisBorder: {
                    show: true,
                    color: '#999', // Farbe der Achsenlinie (rot)
                    height: 2, // Dicke der Achsenlinie
                },
            },
            yaxis: {
                tickAmount: tickAmount,
                title: {
                    text: 'Kosten (€)'
                },
                labels: {
                    style: {
                                fontSize: '14px'
                            },
                        formatter: function (val) {
                        return new Intl.NumberFormat('de-DE', {
                            style: 'currency',
                            currency: 'EUR'
                        }).format(val);
                    }
                }
            },
            
            tooltip: {
                y: {
                    formatter: function (val) {
                        return new Intl.NumberFormat('de-DE', {
                            style: 'currency',
                            currency: 'EUR'
                        }).format(val);
                    }
                }
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '50%'
                }
                
            },
            stroke: {
                show: true,
                width: 1,
                colors: 'transparent',
            },
            dataLabels: {
                enabled: dataLabelsVisible,
                formatter: function (val) {
                    return new Intl.NumberFormat('de-DE', {
                        style: 'currency',
                        currency: 'EUR'
                    }).format(val);
                }
            },
            colors: ['#4CAF50', '#333333'],
            grid: {
                borderColor: '#999',
                strokeDashArray: [0],
                xaxis: {
                    lines: {
                        show: false,
                    }
                },
                yaxis: {
                    lines: {
                        show: true,
                    },
                }
            },
        };
        // Diagramm erstellen
        let chart = new ApexCharts(document.querySelector("#chart"), options);
        chart.render();

        // Konfiguration des Kreisdiagramms
        let pieOptions = {
            chart: {
        type: 'pie',
        height: 380,
        width: 450,
        toolbar: {
            show: true,
        },
    },
    plotOptions: {
  pie: {
    dataLabels: {
      offset: -10,
      minAngleToShowLabel: 0,
    }, 
    
 }
},
    legend: {
        show: false,  // Legende ausblenden
              },
            title: {
                text: 'Fertigungskosten gesamt',
                align: 'center',
                style: {
                            fontSize: '20px'
                        },
            },
            series: [
                fertigungslöhne,
                berechneFertigungsgemeinkosten(fertigungslöhne, fertigungsgemeinkostenSatz),
                sondereinzelkosten,
                
            ],
            labels: ['Fertigungslöhne', 'Fertigungsgemeinkosten', 'Sondereinzelkosten'],
            dataLabels: {
                formatter: (val, opts) => {
                    const name = opts.w.globals.labels[opts.seriesIndex]; // Hole das Label für die Serie
                    const euroWert = opts.w.config.series[opts.seriesIndex]; // Extrahiere den tatsächlichen Euro-Wert
                    // Gib den Label und den formatierten Betrag in zwei Zeilen zurück
                    return [
                        name, // Label auf erster Zeile
                        new Intl.NumberFormat('de-DE', {
                            style: 'currency',
                            currency: 'EUR'
                        }).format(euroWert) // Betrag auf der zweiten Zeile, formatiert als Euro (€)
                    ];
                },
    style: {
        fontSize: '18px',  // Schriftgröße
        colors: ['#333'],  // Schriftfarbe (hier weiß)
    },
},

            colors: ['#f5b7b1', '#f7dc6f', '#aed6f1'],
            tooltip: {
                y: {
                    formatter: function (val) {
                        return new Intl.NumberFormat('de-DE', {
                            style: 'currency',
                            currency: 'EUR'
                        }).format(val);
                    }
                }
            }
        };
        let pieChart = new ApexCharts(document.querySelector("#pieChart"), pieOptions);
        pieChart.render();

        // Funktion zum Aktualisieren des Diagramms
        function updateChart() {
            let fertigungsmaterialInput = parseFloat(document.getElementById('fertigungsmaterial').value) || 0;
            let zuschlagssatzInput = parseFloat(document.getElementById('zuschlagssatz').value) || 0;
            let fertigungslöhneInput = parseFloat(document.getElementById('fertigungslöhne').value) || 0;
            let fertigungsgemeinkostenInput = parseFloat(document.getElementById('fertigungsgemeinkosten').value) || 0;
            let sondereinzelkostenInput = parseFloat(document.getElementById('sondereinzelkosten').value) || 0;

            // Validierungen
            if (zuschlagssatzInput < 1 || zuschlagssatzInput > 25) {
                zeigeModal("Der Zuschlagssatz muss zwischen 1 % und 25 % liegen.");
                return;
            }

            if (fertigungsmaterialInput < 10 || fertigungsmaterialInput > 99999999) {
                zeigeModal("Der Zuschlagssatz muss zwischen 10 und 99999999 liegen.");
                return;
            }
            if (fertigungslöhneInput < 10 || fertigungsmaterialInput > 99999999) {
                zeigeModal("Der Zuschlagssatz muss zwischen 10 und 99999999 liegen.");
                return;
            }
            if (fertigungsgemeinkostenInput < 100 || fertigungsgemeinkostenInput > 200) {
                zeigeModal("Der Fertigungsgemeinkostensatz muss zwischen 100 % und 200 % liegen.");
                return;
            }

            // Materialgemeinkosten und Fertigungsgemeinkosten berechnen
            let materialgemeinkosten = berechneMaterialgemeinkosten(fertigungsmaterialInput, zuschlagssatzInput);
            let fertigungsgemeinkosten = berechneFertigungsgemeinkosten(fertigungslöhneInput, fertigungsgemeinkostenInput);

            // Diagramm aktualisieren
            chart.updateSeries([
                { name: 'Fertigungsmaterial', data: [fertigungsmaterialInput] },
                { name: 'Materialgemeinkosten', data: [materialgemeinkosten] }
            ]);

            // Kreisdiagramm aktualisieren
            pieChart.updateOptions({
                series: [
                    fertigungslöhneInput,
                    fertigungsgemeinkosten,
                    sondereinzelkostenInput
                ]
            });
        }

        // Funktion zum Ein-/Ausblenden der Werte auf den Säulen
        function toggleDataLabels() {
            dataLabelsVisible = !dataLabelsVisible;
            chart.updateOptions({
                dataLabels: {
                    enabled: dataLabelsVisible
                }
            });
        }

        // Funktion zum Aktualisieren der Y-Achsen-Ticks
        function updateTickAmount(value) {
            tickAmount = parseInt(value, 10);
            document.getElementById('ticks-value').textContent = tickAmount;
            chart.updateOptions({
                yaxis: {
                    tickAmount: tickAmount,
                    labels: {
                        style: {
                                fontSize: '14px'
                            },
                        formatter: function (val) {
                            return new Intl.NumberFormat('de-DE', {
                                style: 'currency',
                                currency: 'EUR'
                            }).format(val);
                        }
                    }
                }
            });
        }
