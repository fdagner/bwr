// Satzbausteine für Unternehmensziele – Version 4
// Jahresangaben sind dynamisch: nächstes Jahr = aktuelles Jahr + 2 usw.
// Beim Laden werden alle Platzhalter automatisch ersetzt.

// ───────────────────────────────────────────────
// Jahres-Platzhalter ersetzen
// Verwendung in Vorlagen: nächstes Jahr, in drei Jahren, {Y+5}, {Y+8}, {Y+10}
// Basisjahr-Platzhalter:  {B-5} = aktuelles Jahr minus 5 (für Referenzjahre)

const AKTUELLES_JAHR = new Date().getFullYear();

function ersetzteJahre(text) {
    return text.replace(/\{[YB]([+-]\d+)\}/g, (_, offset) => {
        return AKTUELLES_JAHR + parseInt(offset);
    });
}

// ───────────────────────────────────────────────
// Zielvorlagen
// Konvention: Kurze Horizonte = Y+2 bis Y+3, mittlere = Y+4 bis Y+6, lange = Y+8 bis Y+10

const zielVorlagen = {

    oekologisch: [
        // Energie & Strom
        "Wir wollen in vier Jahren unseren gesamten Strom aus erneuerbaren Energien wie Solar- und Windkraft beziehen und keinen Strom aus Kohle oder Gas mehr nutzen.",
        "Unser Ziel ist es, bis in drei Jahren in unseren Gebäuden und Hallen 30 % weniger Energie zu verbrauchen – zum Beispiel durch bessere Dämmung, neue Heizungen und LED-Beleuchtung.",
        "In den kommenden fünf Jahren wollen wir auf allen unseren Firmendächern Solaranlagen installieren und damit einen Großteil unseres eigenen Stroms selbst erzeugen.",
        "Wir möchten bis in sechs Jahren so wenig Treibhausgase ausstoßen, dass unser Unternehmen als klimaneutral gilt – das bedeutet, wir heizen, produzieren und liefern, ohne die Umwelt zusätzlich zu belasten.",
        "Bis in drei Jahren wollen wir alle Firmenfahrzeuge auf Elektroautos oder andere umweltfreundliche Antriebe umstellen und keine Autos mit Verbrennungsmotor mehr kaufen.",
        "Wir werden in den nächsten vier Jahren in unserer Produktion Abwärme gezielt nutzen, anstatt sie ungenutzt zu verlieren – so sparen wir Energie und schonen die Umwelt.",

        // Abfall & Verpackung
        "Unser Ziel ist es, bis in drei Jahren alle Einwegverpackungen aus Plastik abzuschaffen und nur noch Verpackungen zu verwenden, die vollständig recycelt oder wiederverwendet werden können.",
        "in vier Jahren wollen wir die Menge an Abfall, die in unserer Produktion entsteht, um 40 % verringern – durch weniger Ausschuss, bessere Planung und konsequentes Recycling.",
        "Wir streben an, bis in fünf Jahren für unsere meistverkauften Produkte ein Rücknahmesystem einzuführen, damit alte oder kaputte Produkte repariert, aufgearbeitet oder recycelt werden können.",
        "Bis nächstes Jahr wollen wir dafür sorgen, dass mindestens 80 % unserer Verpackungsmaterialien aus recycelten Rohstoffen hergestellt werden.",

        // Wasser & Rohstoffe
        "Wir wollen in den nächsten vier Jahren in unserer Produktion 25 % weniger Wasser verbrauchen, indem wir Wasser häufiger aufbereiten und wiederverwenden.",
        "Unser Ziel ist es, bis in drei Jahren nur noch Rohstoffe zu kaufen, die aus nachweislich umweltfreundlicher und fairer Herstellung stammen.",
        "In den kommenden fünf Jahren wollen wir in unserer Fabrik kein sauberes Trinkwasser mehr für industrielle Prozesse verwenden, sondern aufbereitetes Regenwasser oder Brauchwasser einsetzen.",

        // Natur & Lieferanten
        "Wir verpflichten uns, in vier Jahren für jeden gefällten Baum, der durch unsere Lieferkette betroffen ist, mindestens zwei neue Bäume zu pflanzen.",
        "Bis in drei Jahren werden wir alle wichtigen Lieferanten daraufhin überprüfen, ob sie ebenfalls umweltfreundlich arbeiten – und nur mit solchen zusammenarbeiten, die klare Umweltziele verfolgen.",
        "Wir wollen bis in sechs Jahren unsere Produkte so gestalten, dass sie länger halten, leichter repariert werden können und am Ende ihres Lebens vollständig recycelt werden.",
        "In den kommenden fünf Jahren wollen wir den Anteil natürlicher oder nachwachsender Rohstoffe in unseren Produkten auf mindestens 60 % erhöhen und den Einsatz von neuem Kunststoff deutlich reduzieren.",
        "Unser Ziel ist es, bis {Y+7} den gesamten CO₂-Ausstoß unseres Unternehmens – von der Herstellung bis zur Lieferung – um die Hälfte zu senken.",
        "Bis in drei Jahren wollen wir in unseren Büros und Kantinen auf Einweggeschirr verzichten und stattdessen Mehrweggeschirr und -besteck einführen.",
        "Wir streben an, in den nächsten vier Jahren unsere Transportwege zu verkürzen, indem wir mehr Produkte regional herstellen und Lieferungen besser bündeln, um unnötige Fahrten zu vermeiden.",
    ],

    oekonomisch: [
        // Umsatz & Wachstum
        "Wir wollen bis in drei Jahren unseren Gesamtumsatz – also das Geld, das wir durch den Verkauf unserer Produkte einnehmen – um 20 % steigern.",
        "Unser Ziel ist es, in den nächsten vier Jahren in mindestens drei neuen Ländern unsere Produkte anzubieten und damit neue Kundinnen und Kunden zu gewinnen.",
        "In den kommenden fünf Jahren wollen wir unseren Anteil am Markt in unserem wichtigsten Produktbereich um 10 % erhöhen, indem wir mehr Kunden von unseren Produkten überzeugen als unsere Mitbewerber.",
        "Wir streben an, bis in drei Jahren 20 % unseres Umsatzes mit völlig neuen Produkten zu erzielen, die wir heute noch gar nicht verkaufen.",
        "in vier Jahren wollen wir unser Onlineangebot so ausbauen, dass mindestens ein Drittel unserer Einnahmen über digitale Kanäle erzielt wird.",

        // Kosten & Effizienz
        "Unser Ziel ist es, bis in drei Jahren die Herstellungskosten für unsere meistverkauften Produkte um 15 % zu senken – ohne dabei die Qualität zu verschlechtern.",
        "Bis nächstes Jahr wollen wir in unserer Produktion Abläufe so verbessern, dass wir bei gleicher Mitarbeiterzahl 15 % mehr Produkte herstellen können.",
        "Wir wollen in vier Jahren unsere Lagerkosten um 20 % senken, indem wir Materialien und Waren besser planen und weniger auf Vorrat halten.",
        "Bis in drei Jahren wollen wir die Zeit, die vom Eingang einer Bestellung bis zur Lieferung vergeht, um 30 % verkürzen.",
        "Unser Ziel ist es, bis nächstes Jahr alle wiederkehrenden Verwaltungsaufgaben – wie Rechnungen oder Bestellungen – vollständig digital und automatisch zu erledigen.",

        // Innovation & neue Produkte
        "Bis in drei Jahren wollen wir jedes Jahr mindestens fünf neue Produkte oder verbesserte Versionen bestehender Produkte auf den Markt bringen.",
        "Wir streben an, in vier Jahren einen eigenen Bereich für Forschung und Entwicklung aufzubauen, in dem unsere Mitarbeitenden gezielt an neuen Ideen und Verbesserungen arbeiten.",
        "bis in fünf Jahren wollen wir ein digitales Kundenportal einführen, über das Kunden Bestellungen aufgeben, den Lieferstatus verfolgen und den Kundenservice erreichen können.",
        "Wir wollen bis in drei Jahren in unserer Produktion Roboter und automatische Maschinen einsetzen, um gleichbleibend gute Qualität zu sichern und Fehler zu vermeiden.",
        "in vier Jahren wollen wir Reparatur- und Wartungsservices für unsere Produkte anbieten, damit Kunden ihre Geräte länger nutzen können und wir neue Einnahmequellen erschließen.",

        // Kunden & Bekanntheit
        "Unser Ziel ist es, bis nächstes Jahr die Zufriedenheit unserer Kunden durch schnelleren Service, freundlichere Beratung und bessere Produktqualität spürbar zu steigern.",
        "Bis in drei Jahren wollen wir unsere Marke so bekannt machen, dass jede zweite Person in unserer Zielgruppe unser Unternehmen kennt und mit positiven Eigenschaften verbindet.",
        "Wir streben an, in den kommenden vier Jahren ein Treueprogramm einzuführen, das Stammkunden belohnt und dafür sorgt, dass sie immer wieder bei uns kaufen.",
        "Bis in drei Jahren wollen wir die Zahl der Beschwerden von Kunden um die Hälfte reduzieren, indem wir unsere Produkte und unseren Service kontinuierlich verbessern.",
        "Unser Ziel ist es, in den kommenden fünf Jahren auch kleinere und mittelgroße Unternehmen als Kunden zu gewinnen und unser Angebot gezielt auf deren Bedürfnisse anzupassen.",
    ],

    sozial: [
        // Fairness & Gleichberechtigung
        "Wir werden bis in drei Jahren dafür sorgen, dass Frauen und Männer bei uns für gleiche Arbeit auch gleich viel verdienen – und das regelmäßig überprüfen.",
        "Unser Ziel ist es, in vier Jahren den Anteil von Frauen in Führungspositionen auf mindestens 40 % zu erhöhen, indem wir gezielt Frauen fördern und faire Auswahlverfahren sicherstellen.",
        "Bis in drei Jahren wollen wir sicherstellen, dass alle Bewerberinnen und Bewerber – unabhängig von Herkunft, Geschlecht oder Alter – die gleichen Chancen auf eine Stelle in unserem Unternehmen haben.",
        "Wir streben an, bis in fünf Jahren ein Unternehmen zu sein, in dem Menschen mit ganz unterschiedlichen Hintergründen und Lebensgeschichten arbeiten und sich willkommen fühlen.",

        // Arbeitsbedingungen & Zufriedenheit
        "Bis nächstes Jahr wollen wir allen Mitarbeitenden die Möglichkeit geben, zumindest an zwei Tagen pro Woche von zu Hause oder einem anderen Ort ihrer Wahl zu arbeiten.",
        "Unser Ziel ist es, bis in drei Jahren die Zufriedenheit unserer Mitarbeitenden durch regelmäßige Befragungen zu messen und auf Basis der Ergebnisse konkrete Verbesserungen umzusetzen.",
        "Wir wollen in vier Jahren sicherstellen, dass niemand in unserem Unternehmen dauerhaft Überstunden leisten muss – und dazu bei Bedarf zusätzliche Mitarbeitende einstellen.",
        "Bis in drei Jahren wollen wir die Zahl der Mitarbeitenden, die das Unternehmen verlassen, deutlich verringern, indem wir bessere Entwicklungsmöglichkeiten und ein angenehmes Arbeitsklima schaffen.",
        "Wir streben an, bis in fünf Jahren allen Mitarbeitenden faire Löhne zu zahlen, die deutlich über dem gesetzlichen Mindestlohn liegen und ein gutes Leben ermöglichen.",

        // Sicherheit & Gesundheit
        "Bis in drei Jahren wollen wir die Zahl der Arbeitsunfälle in unserem Betrieb um die Hälfte senken – durch bessere Schutzausrüstung, klare Regeln und regelmäßige Sicherheitstrainings.",
        "Wir verpflichten uns, bis nächstes Jahr ein Programm einzuführen, das Mitarbeitende bei Stress und psychischen Belastungen unterstützt – zum Beispiel durch Beratungsangebote oder Entspannungskurse.",
        "Unser Ziel ist es, in vier Jahren die Anzahl der Krankheitstage zu senken, indem wir auf gesunde Arbeitsbedingungen achten, zum Beispiel durch ergonomische Stühle, helle Räume und ausreichend Pausen.",
        "In den nächsten fünf Jahren sollen alle unsere Arbeitsplätze so gestaltet sein, dass sie auch für Menschen mit körperlichen Einschränkungen zugänglich und nutzbar sind.",

        // Ausbildung & Weiterentwicklung
        "Bis nächstes Jahr wollen wir jedem Mitarbeitenden mindestens fünf Tage im Jahr für Weiterbildungen, Schulungen oder Kurse zur Verfügung stellen – bezahlt vom Unternehmen.",
        "Wir wollen bis in drei Jahren die Zahl unserer Ausbildungsplätze verdoppeln und damit jungen Menschen einen guten Start ins Berufsleben ermöglichen.",
        "Unser Ziel ist es, in vier Jahren ein Mentoring-Programm einzuführen, bei dem erfahrene Mitarbeitende jüngere Kolleginnen und Kollegen begleiten und bei ihrer Entwicklung unterstützen.",
        "Bis in drei Jahren wollen wir für alle Mitarbeitenden einen persönlichen Entwicklungsplan erstellen, der zeigt, welche Fähigkeiten sie ausbauen können und welche nächsten Schritte in ihrer Karriere möglich sind.",
        "Wir streben an, in den nächsten fünf Jahren möglichst viele freie Stellen und Führungspositionen mit Mitarbeitenden zu besetzen, die bereits in unserem Unternehmen arbeiten und intern aufgestiegen sind.",

        // Gesellschaft & Gemeinschaft
        "Bis in drei Jahren wollen wir jedes Jahr an mindestens zwei sozialen Projekten in unserer Region teilnehmen – zum Beispiel Schülerinnen und Schüler beim Berufseinstieg unterstützen oder lokale Vereine fördern.",
        "Wir wollen in den kommenden vier Jahren unseren Mitarbeitenden ermöglichen, einmal pro Jahr bezahlt einen gemeinnützigen Einsatz zu leisten – etwa in einer Schule, einem Pflegeheim oder bei einer Umweltschutzaktion.",
    ]
};

// ───────────────────────────────────────────────
// Hilfsfunktionen

function randomSample(arr, n) {
    const result = [];
    const pool = [...arr];
    while (result.length < n) {
        if (pool.length === 0) pool.push(...arr);
        const idx = Math.floor(Math.random() * pool.length);
        result.push(pool.splice(idx, 1)[0]);
    }
    return result;
}

function shuffleArray(array) {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ───────────────────────────────────────────────
// Hauptfunktion

function updateZiele() {
    const anzahl = parseInt(document.getElementById("anzahlZiele").value) || 6;
    const zieleBody  = document.getElementById("ziele-body");
    const zieleBodyL = document.getElementById("ziele-body-l");

    const kategorieNamen = ['oekologisch', 'oekonomisch', 'sozial'];
    const kategorien = [];
    for (let i = 0; i < anzahl; i++) {
        kategorien.push(kategorieNamen[i % 3]);
    }

    const perKategorie = { oekologisch: 0, oekonomisch: 0, sozial: 0 };
    kategorien.forEach(kat => perKategorie[kat]++);

    const gezogeneVorlagen = {
        oekologisch: randomSample(zielVorlagen.oekologisch, perKategorie.oekologisch),
        oekonomisch: randomSample(zielVorlagen.oekonomisch, perKategorie.oekonomisch),
        sozial:      randomSample(zielVorlagen.sozial,      perKategorie.sozial),
    };

    const ziele = kategorien.map(kat => {
        const rohtext = gezogeneVorlagen[kat].shift();
        const text = ersetzteJahre(rohtext);
        const kategorieName = kat === 'oekologisch' ? 'ökologisch' :
                              kat === 'oekonomisch' ? 'ökonomisch' : 'sozial';
        return { text, kategorie: kat, kategorieName };
    });

    const gemischteZiele = shuffleArray(ziele);

    zieleBody.innerHTML = gemischteZiele.map((ziel, i) => `
        <tr>
            <td style="text-align:center; border:1px solid #ccc; padding:10px;">${i + 1}</td>
            <td style="border:1px solid #ccc; padding:10px;">${ziel.text}</td>
            <td style="border:1px solid #ccc; padding:10px;"></td>
        </tr>`).join('');

    zieleBodyL.innerHTML = gemischteZiele.map((ziel, i) => `
        <tr>
            <td style="text-align:center; border:1px solid #ccc; padding:10px;">${i + 1}</td>
            <td style="border:1px solid #ccc; padding:10px;">${ziel.text}</td>
            <td style="font-weight:bold; text-align:center; border:1px solid #ccc; padding:10px;">${ziel.kategorieName}</td>
        </tr>`).join('');
}

// Initialisierung
updateZiele();