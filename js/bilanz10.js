function generateRandomBilanz10() {
    // ────────────────────────────────────────────────
    // Bereiche – realistisch für mittelgroßen Betrieb
    // ────────────────────────────────────────────────
    const ranges = {
        AV:       { min: 2000000, max: 5000000 },   // Anlagevermögen gesamt
        VORR:     { min:  180000, max:  520000 },
        FORD:     { min:   20000, max:  500000 },
        FLUS:     { min:   5000, max:  550000 },   // Bank + Kasse zusammen
        LFK:      { min:  600000, max: 1500000 },   // langfristig (z. B. Darlehen)
        KFK:      { min:   80000, max:  250000 },   // kurzfristig
    };

    function randRange(min, max) {
        let val = Math.floor(Math.random() * (max - min + 1)) + min;
        return Math.round(val / 5000) * 5000;   // Vielfaches von 5.000
    }

    function formatEuro(val) {
        return val.toLocaleString('de-DE', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }

    function set(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = formatEuro(value);
    }

    // ─── Zufallswerte generieren ───────────────────────────────────────
    const av    = randRange(ranges.AV.min,    ranges.AV.max);
    const vorr  = randRange(ranges.VORR.min,  ranges.VORR.max);
    const ford  = randRange(ranges.FORD.min,  ranges.FORD.max);
    const flus  = randRange(ranges.FLUS.min,  ranges.FLUS.max);
    const lfk   = randRange(ranges.LFK.min,   ranges.LFK.max);
    const kfk   = randRange(ranges.KFK.min,   ranges.KFK.max);

    const uv        = vorr + ford + flus;
    const aktiva    = av + uv;
    const fremd     = lfk + kfk;
    const ek        = aktiva - fremd;

    // ─── Werte in Tabelle schreiben ───────────────────────────────────
    set("value-AV",     av);
    set("value-VORR",   vorr);
    set("value-FORD",   ford);
    set("value-FLUS",   flus);
    set("value-LFK",    lfk);
    set("value-KFK",    kfk);
    set("value-EK",     ek);
    set("value-SUM-A",  aktiva);
    set("value-SUM-P",  aktiva);   // muss immer gleich sein

    // Optional: Farbliche Hervorhebung wie im Foto
    if (ek < 0) {
        document.getElementById("value-EK").style.color = "red";
    } else {
        document.getElementById("value-EK").style.color = "";
    }
}

function bilanz7Herunterladen() {
    const bilanz7HTML = document.getElementById('bilanz7Container').innerHTML;
    const blob = new Blob([bilanz7HTML], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'bilanz7.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function bilanz7KopiereInZwischenablage() {
    const bilanz7HTML = document.getElementById('bilanz7Container').innerHTML;
    navigator.clipboard.writeText(bilanz7HTML)
        .then(() => alert('Code wurde in die Zwischenablage kopiert'))
        .catch(err => console.error('Fehler beim Kopieren in die Zwischenablage:', err));
}

function bilanz7HerunterladenAlsPNG() {
    const bilanz7Container = document.getElementById('bilanz7Container');

    html2canvas(bilanz7Container, optionshtml2canvas).then(canvas => {
        const dataURL = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = 'bilanz7.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}

let clipboardbilanz7 = new ClipboardJS('#officeButtonbilanz7');

clipboardbilanz7.on('success', function (e) {
    console.log("Die Tabelle wurde in die Zwischenablage kopiert.");
    alert("Die Tabelle wurde in die Zwischenablage kopiert.");
});

clipboardbilanz7.on('error', function (e) {
    console.error("Fehler beim Kopieren der Tabelle: ", e.action);
    alert("Fehler beim Kopieren der Tabelle.");
});


document.addEventListener("DOMContentLoaded", function () {
    // Hier wird generiereWertetabelle() beim Laden der Seite ausgeführt
    generateRandomBilanz7();
  });
  