// Satzbausteine für Unternehmensziele – Version 2 mit Genus-Unterscheidung

const zielBausteine = {
    oekologisch: {
        maskulinum_neutrum: {
            reduktionPraefix: [
                "Senkung des", "Reduzierung des", "Verringerung des", "Minimierung des",
                "Begrenzung des", "Vermeidung des"
            ],
            wachstumPraefix: ["Optimierung des"],  // selten, nur für Effizienz
            hauptteil: [
                { wort: "CO₂-Ausstoßes", richtung: "reduktion" },
                { wort: "Energieverbrauchs", richtung: "reduktion" },
                { wort: "Primärenergieverbrauchs", richtung: "reduktion" },
                { wort: "Stromverbrauchs", richtung: "reduktion" },
                { wort: "Wasserverbrauchs", richtung: "reduktion" },
                { wort: "Abfallaufkommens", richtung: "reduktion" },
                { wort: "Ressourcenverbrauchs", richtung: "reduktion" },
                { wort: "Rohstoffverbrauchs", richtung: "reduktion" },
                { wort: "Verpackungsmaterials", richtung: "reduktion" },
                { wort: "Schadstoffausstoßes", richtung: "reduktion" }
            ]
        },
        femininum: {
            reduktionPraefix: [
                "Senkung der", "Reduzierung der", "Verringerung der", "Minimierung der"
            ],
            wachstumPraefix: [
                "Verbesserung der", "Steigerung der", "Förderung der", "Optimierung der",
                "Maximierung der"
            ],
            hauptteil: [
                { wort: "Energieeffizienz", richtung: "wachstum" },
                { wort: "Treibhausgas-Emissionen", richtung: "reduktion" },
                { wort: "Recyclingquote", richtung: "wachstum" },
                { wort: "Wasserintensität", richtung: "reduktion" },  // Intensität = pro Einheit senken
                { wort: "CO₂-Intensität", richtung: "reduktion" },
                { wort: "Abfallmenge", richtung: "reduktion" },
                { wort: "Umweltbelastung", richtung: "reduktion" },
                { wort: "nachhaltigen Beschaffung", richtung: "wachstum" },
                { wort: "Kreislaufwirtschaft", richtung: "wachstum" },
                { wort: "Ökobilanz", richtung: "wachstum" },
                { wort: "Nutzung erneuerbarer Energien", richtung: "wachstum" }
            ]
        },
        suffix: [
            "um 20 % bis 2027",
            "um mindestens 30 % in den nächsten 5 Jahren",
            "um 50 % in den nächsten 10 Jahren",
            "durch Umstellung auf 100 % erneuerbare Energien",
            "durch innovative Technologien und Prozessoptimierung",
            "in allen Produktionsstätten und der Lieferkette",
            "auf unter 5 % Abfall",
            "um 40 % Reduktion der Intensität"
        ]
    },

    oekonomisch: {
        maskulinum_neutrum: {
            reduktionPraefix: [
                "Senkung des", "Reduzierung des", "Verringerung des", "Minimierung des"
            ],
            wachstumPraefix: [
                "Steigerung des", "Erhöhung des", "Ausbau des", "Maximierung des", "Optimierung des"
            ],
            hauptteil: [
                { wort: "Umsatzes", richtung: "wachstum" },
                { wort: "Marktanteils", richtung: "wachstum" },
                { wort: "Gewinns", richtung: "wachstum" },
                { wort: "Digitalisierungsgrads", richtung: "wachstum" },
                { wort: "Exportanteils", richtung: "wachstum" },


            ]
        },
        femininum: {
            reduktionPraefix: [
                "Senkung der", "Reduzierung der", "Verringerung der", "Minimierung der"
            ],
            wachstumPraefix: [
                "Steigerung der", "Erhöhung der", "Verbesserung der", "Optimierung der",
                "Stärkung der", "Förderung der"
            ],
            hauptteil: [
                { wort: "Produktivität", richtung: "wachstum" },
                { wort: "Kundenzufriedenheit", richtung: "wachstum" },
                { wort: "Markenbekanntheit", richtung: "wachstum" },
                { wort: "Liquidität", richtung: "wachstum" },
                { wort: "Innovationskraft", richtung: "wachstum" },
                { wort: "Mitarbeiterbindung", richtung: "wachstum" },
                { wort: "Wettbewerbsfähigkeit", richtung: "wachstum" },
                { wort: "Kostenstruktur", richtung: "reduktion" },
                { wort: "Preisstabilität", richtung: "wachstum" },
                { wort: "Produktionskosten", richtung: "reduktion" },
                { wort: "Eigenkapitalquote", richtung: "wachstum" },
            ]
        },
        suffix: [
            "um 10–15 % im aktuelle Geschäftsjahr",
            "um mindestens 18 % bis Ende nächstes Jahr",
            "durch Erschließung neuer Märkte",
            "durch konsequente Digitalisierung und Automatisierung",
            "durch gezielte Kostensenkungsprogramme",
            "bei gleichbleibender oder steigender Qualität",
            "in der DACH-Region um mindestens 12 %",
            "durch nachhaltige Produktlinien",
            "auf ein langfristig profitables Niveau",
        ]
    },

    sozial: {
        maskulinum_neutrum: {
            reduktionPraefix: ["Senkung des", "Reduzierung des", "Verringerung des"],
            wachstumPraefix: [
                "Ausbau des", "Erhöhung des", "Schaffung des", "Förderung des",
                "Steigerung des", "Verbesserung des", "Einführung von"
            ],
            hauptteil: [
                { wort: "Ausbildungsangebots", richtung: "wachstum" },
                { wort: "Angebots an flexiblen Arbeitsmodellen", richtung: "wachstum" },
                { wort: "Engagements der Belegschaft", richtung: "wachstum" },
                { wort: "Gesundheitsschutzes", richtung: "wachstum" },
                { wort: "Mentoring-Programms", richtung: "wachstum" },
                { wort: "Budgets für Weiterbildung", richtung: "wachstum" },
                { wort: "Anteils internationaler Mitarbeiter", richtung: "wachstum" }
            ]
        },
        femininum: {
            reduktionPraefix: [
                "Senkung der", "Reduzierung der", "Verringerung der", "Minimierung der"
            ],
            wachstumPraefix: [
                "Erhöhung der", "Steigerung der", "Verbesserung der", "Förderung der",
                "Stärkung der", "Erweiterung der"
            ],
            hauptteil: [
                { wort: "Mitarbeiterzufriedenheit", richtung: "wachstum" },
                { wort: "Arbeitssicherheit", richtung: "wachstum" },
                { wort: "Work-Life-Balance", richtung: "wachstum" },
                { wort: "Diversität in Führungspositionen", richtung: "wachstum" },
                { wort: "Chancengleichheit", richtung: "wachstum" },
                { wort: "Weiterbildungsquote", richtung: "wachstum" },
                { wort: "Mitarbeiterbindung", richtung: "wachstum" },
                { wort: "psychischen Gesundheit der Belegschaft", richtung: "wachstum" },
                { wort: "Gleichstellungsindex", richtung: "wachstum" },
                { wort: "Quote von Frauen in Führungspositionen", richtung: "wachstum" },
                { wort: "Krankheitsquote", richtung: "reduktion" }
            ]
        },
        suffix: [
            "auf ein branchenführendes Niveau in den nächsten 10 Jahren",
            "durch gezielte Programme und Initiativen",
            "für alle Mitarbeiterinnen und Mitarbeiter",
            "unter 2,5 %",
            "durch präventive Maßnahmen und Kampagnen",
            "durch flexible Arbeitsmodelle",
            "durch verpflichtende Trainings",
            "durch Ausbau von Mentoring und Netzwerken"
        ]
    }
};

// Hilfsfunktion: zufälliges Element aus Array
function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generiereZiel(kategorie) {
    const kat = zielBausteine[kategorie];
    const istFeminin = Math.random() < 0.5;  // 50:50 Genus
    const pool = istFeminin ? kat.femininum : kat.maskulinum_neutrum;

    const haupt = randomItem(pool.hauptteil);

    // Präfix je Richtung wählen
    let praefixPool = (haupt.richtung === "reduktion") 
        ? pool.reduktionPraefix 
        : pool.wachstumPraefix;

    // Fallback, falls Pool leer (sollte nicht passieren)
    if (praefixPool.length === 0) {
        praefixPool = [...pool.reduktionPraefix, ...pool.wachstumPraefix];
    }

    const praefix = randomItem(praefixPool);
    const suffix = randomItem(kat.suffix);

    return `${praefix} ${haupt.wort} ${suffix}`;
}

// ───────────────────────────────────────────────
// Rest des Codes bleibt fast gleich (nur kleine Anpassungen)

// Funktion zum Mischen eines Arrays (Fisher-Yates)
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function updateZiele() {
    const anzahl = parseInt(document.getElementById("anzahlZiele").value) || 6;
    const zieleBody  = document.getElementById("ziele-body");
    const zieleBodyL = document.getElementById("ziele-body-l");
    
    const kategorien = [];
    const kategorieNamen = ['oekologisch', 'oekonomisch', 'sozial'];
    
    for (let i = 0; i < anzahl; i++) {
        kategorien.push(kategorieNamen[i % 3]);
    }
    
    const ziele = kategorien.map(kat => {
        const text = generiereZiel(kat);
        const kategorieName = kat === 'oekologisch' ? 'ökologisch' :
                             kat === 'oekonomisch' ? 'ökonomisch' : 'sozial';
        return { text, kategorie: kat, kategorieName };
    });
    
    const gemischteZiele = shuffleArray(ziele);
    
    // Aufgabe (ohne Lösung)
    let aufgabeHTML = '';
    gemischteZiele.forEach((ziel, i) => {
        aufgabeHTML += `<tr>
            <td style="text-align:center; border:1px solid #ccc; padding:10px;">${i+1}</td>
            <td style="border:1px solid #ccc; padding:10px;">${ziel.text}</td>
            <td style="border:1px solid #ccc; padding:10px;"></td>
        </tr>`;
    });
    zieleBody.innerHTML = aufgabeHTML;
    
    // Lösung
    let loesungHTML = '';
    gemischteZiele.forEach((ziel, i) => {
        loesungHTML += `<tr>
            <td style="text-align:center; border:1px solid #ccc; padding:10px;">${i+1}</td>
            <td style="border:1px solid #ccc; padding:10px;">${ziel.text}</td>
            <td style="font-weight:bold; text-align:center; border:1px solid #ccc; padding:10px;">${ziel.kategorieName}</td>
        </tr>`;
    });
    zieleBodyL.innerHTML = loesungHTML;
}

// Initialisierung
updateZiele();