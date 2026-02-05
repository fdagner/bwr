// Satzbausteine für Unternehmensziele – Version 2 mit Genus-Unterscheidung

const zielBausteine = {
    oekologisch: {
        typ: "ökologisch",
        beschreibung: "Ziele mit Fokus auf Umwelt-, Ressourcen- und Klimawirkungen",
        maskulinum_neutrum: {
            reduktionPraefix: [
                "Senkung des", "Reduzierung des", "Verringerung des", 
                "Minimierung des", "Begrenzung des", "Vermeidung des"
            ],
            wachstumPraefix: ["Optimierung des", "Steigerung des"],
            hauptteil: [
                { wort: "CO₂-Ausstoßes", richtung: "reduktion" },
                { wort: "Energieverbrauchs", richtung: "reduktion" },
                { wort: "Primärenergieverbrauchs", richtung: "reduktion" },
                { wort: "Stromverbrauchs", richtung: "reduktion" },
                { wort: "Wasserverbrauchs", richtung: "reduktion" },
                { wort: "Abfallaufkommens", richtung: "reduktion" },
                { wort: "Ressourcenverbrauchs", richtung: "reduktion" },
                { wort: "Rohstoffverbrauchs", richtung: "reduktion" }
            ]
        },
        femininum: {
            reduktionPraefix: [
                "Senkung der", "Reduzierung der", "Verringerung der", 
                "Minimierung der", "Begrenzung der"
            ],
            wachstumPraefix: [
                "Verbesserung der", "Steigerung der", "Förderung der", 
                "Optimierung der", "Erhöhung der", "Maximierung der"
            ],
            hauptteil: [
                { wort: "Energieeffizienz", richtung: "wachstum" },
                { wort: "Treibhausgas-Emissionen", richtung: "reduktion" },
                { wort: "Recyclingquote", richtung: "wachstum" },
                { wort: "Wasserintensität", richtung: "reduktion" },
                { wort: "CO₂-Intensität", richtung: "reduktion" },
                { wort: "Abfallmenge", richtung: "reduktion" },
                { wort: "Umweltbelastung", richtung: "reduktion" },
                { wort: "nachhaltigen Beschaffung", richtung: "wachstum" },
                { wort: "Kreislaufwirtschaft", richtung: "wachstum" },
                { wort: "Nutzung erneuerbarer Energien", richtung: "wachstum" }
            ]
        },
        suffix: [
            "um mindestens 20–30 % in den kommenden Jahren",
            "um mindestens 40 % innerhalb der nächsten 5–7 Jahre",
            "um rund 50 % in den nächsten 8–10 Jahren",
            "deutlich und nachweisbar innerhalb des laufenden Jahrzehnts",
            "kontinuierlich pro Jahr",
            "bis hin zu einer sehr ambitionierten Reduktion in den kommenden 10–15 Jahren",
            "durch schrittweise Umstellung auf 100 % erneuerbare Energien",
            "durch konsequente Dekarbonisierung der gesamten Wertschöpfungskette",
            "in allen relevanten Scopes spürbar und nachweisbar",
            "im Einklang mit wissenschaftsbasierten Klimazielen",
            "auf dem Weg zur Klimaneutralität",
            "durch innovative Technologien, Prozessoptimierung und Kreislaufwirtschaft",
            "bei gleichzeitiger Sicherung der Wettbewerbsfähigkeit"
        ]
    },

    oekonomisch: {
        typ: "ökonomisch",
        beschreibung: "Ziele mit Fokus auf wirtschaftliche Leistung, Wachstum und Effizienz",
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
                { wort: "Exportanteils", richtung: "wachstum" }
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
                { wort: "Produktionskosten", richtung: "reduktion" },
                { wort: "Eigenkapitalquote", richtung: "wachstum" }
            ]
        },
        suffix: [
            "deutlich und spürbar im laufenden Geschäftsjahr",
            "um mindestens 10–20 % innerhalb der nächsten 1–2 Jahre",
            "nachhaltig und profitabel in den kommenden 3–5 Jahren",
            "durch konsequente Umsetzung unserer Wachstumsstrategie",
            "durch Erschließung neuer Märkte und Kundensegmente",
            "bei gleichbleibender oder steigender Qualität und Kundenzufriedenheit",
            "durch gezielte Digitalisierung, Automatisierung und Prozesseffizienz",
            "durch konsequente Kostendisziplin und Produktivitätssteigerung",
            "in unseren Kernmärkten spürbar und nachhaltig",
            "auf ein langfristig stabiles und profitables Niveau",
            "durch gezielte Investitionen in Innovation und Markenaufbau"
        ]
    },

    sozial: {
        typ: "sozial",
        beschreibung: "Ziele mit Fokus auf Mitarbeitende, Arbeitsbedingungen und Gesellschaft",
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
                { wort: "Budgets für Weiterbildung", richtung: "wachstum" }
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
                { wort: "Quote von Frauen in Führungspositionen", richtung: "wachstum" },
                { wort: "Krankheitsquote", richtung: "reduktion" }
            ]
        },
        suffix: [
            "deutlich und spürbar in den kommenden Jahren",
            "kontinuierlich und nachweisbar",
            "durch konsequente Umsetzung gezielter Programme und Maßnahmen",
            "für alle Mitarbeiter weltweit",
            "auf ein branchenführendes Niveau",
            "durch präventive Maßnahmen, Sensibilisierung und Kulturwandel",
            "durch Ausbau flexibler Arbeitsmodelle und moderner Arbeitsumgebungen",
            "durch verpflichtende Trainings, Mentoring und Netzwerke",
            "durch regelmäßige Mitarbeiterbefragungen und transparente Kommunikation",
            "mit messbaren Fortschritten Jahr für Jahr",
            "im Einklang mit unseren Werten und unserer Unternehmenskultur"
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