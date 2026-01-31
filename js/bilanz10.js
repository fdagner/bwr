 function validateRange(prefix) {
      const minInput = document.getElementById(prefix + '-min');
      const maxInput = document.getElementById(prefix + '-max');
      
      const minVal = parseFloat(minInput.value);
      const maxVal = parseFloat(maxInput.value);
      
      if (minVal > maxVal) {
        minInput.classList.add('error');
        maxInput.classList.add('error');
        return false;
      } else {
        minInput.classList.remove('error');
        maxInput.classList.remove('error');
        return true;
      }
    }

    function validateAllRanges() {
      const valid1 = validateRange('barLiq');
      const valid2 = validateRange('einzugsLiq');
      const valid3 = validateRange('deckung1');
      const valid4 = validateRange('deckung2');
      
      return valid1 && valid2 && valid3 && valid4;
    }

    function generateRandomBilanz10() {
      // Validierung durchführen
      if (!validateAllRanges()) {
        alert('Fehler: Der Minimalwert darf nicht höher als der Maximalwert sein!');
        return;
      }

      // Kennzahlen-Bereiche aus Eingabefeldern holen
      const barLiqMin = parseFloat(document.getElementById('barLiq-min').value) || 20;
      const barLiqMax = parseFloat(document.getElementById('barLiq-max').value) || 50;
      const einzugsLiqMin = parseFloat(document.getElementById('einzugsLiq-min').value) || 80;
      const einzugsLiqMax = parseFloat(document.getElementById('einzugsLiq-max').value) || 120;
      const deckung1Min = parseFloat(document.getElementById('deckung1-min').value) || 60;
      const deckung1Max = parseFloat(document.getElementById('deckung1-max').value) || 90;
      const deckung2Min = parseFloat(document.getElementById('deckung2-min').value) || 100;
      const deckung2Max = parseFloat(document.getElementById('deckung2-max').value) || 130;

      console.log('Bereiche:', {
        barLiq: barLiqMin + '-' + barLiqMax,
        einzugsLiq: einzugsLiqMin + '-' + einzugsLiqMax,
        deckung1: deckung1Min + '-' + deckung1Max,
        deckung2: deckung2Min + '-' + deckung2Max
      });

      const kennzahlenRanges = {
        barLiq:     { min: barLiqMin, max: barLiqMax },
        einzugsLiq: { min: einzugsLiqMin, max: einzugsLiqMax },
        deckung1:   { min: deckung1Min, max: deckung1Max },
        deckung2:   { min: deckung2Min, max: deckung2Max }
      };

      const sizeRanges = {
        AV:   { min: 2000000, max: 4000000 },
        KFK:  { min: 150000,  max: 250000  }
      };

      function randRange(min, max) {
        let val = Math.random() * (max - min) + min;
        return Math.round(val / 5000) * 5000;
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

      // Mehrere Versuche, um gültige Werte zu finden
      let attempts = 0;
      let maxAttempts = 100;
      let av, kfk, flus, ford, ek, lfk, fremd, aktiva, uv, vorr;
      let barLiq, einzugsLiq, deckung1, deckung2;

      do {
        attempts++;
        
        // Zufällige Kennzahlen generieren
        barLiq     = Math.random() * (kennzahlenRanges.barLiq.max - kennzahlenRanges.barLiq.min) + kennzahlenRanges.barLiq.min;
        einzugsLiq = Math.random() * (kennzahlenRanges.einzugsLiq.max - kennzahlenRanges.einzugsLiq.min) + kennzahlenRanges.einzugsLiq.min;
        deckung1   = Math.random() * (kennzahlenRanges.deckung1.max - kennzahlenRanges.deckung1.min) + kennzahlenRanges.deckung1.min;
        deckung2   = Math.random() * (kennzahlenRanges.deckung2.max - kennzahlenRanges.deckung2.min) + kennzahlenRanges.deckung2.min;

        // Ankerwerte
        av  = randRange(sizeRanges.AV.min, sizeRanges.AV.max);
        kfk = randRange(sizeRanges.KFK.min, sizeRanges.KFK.max);

        // Aus Kennzahlen berechnen
        flus = Math.max(25000, Math.round((barLiq * kfk / 100) / 5000) * 5000);
        ford = Math.max(25000, Math.round(((einzugsLiq * kfk / 100) - flus) / 5000) * 5000);
        ek = Math.max(100000, Math.round((deckung1 * av / 100) / 5000) * 5000);
        lfk = Math.max(50000, Math.round(((deckung2 * av / 100) - ek) / 5000) * 5000);

        fremd = lfk + kfk;
        aktiva = ek + fremd;
        uv = aktiva - av;
        vorr = uv - ford - flus;

        // Prüfen ob alle Werte positiv und größer als Minimum sind
        if (vorr >= 50000 && av > 0 && kfk > 0 && flus > 0 && ford > 0 && ek > 0 && lfk > 0) {
          vorr = Math.round(vorr / 5000) * 5000;
          break; // Gültige Kombination gefunden
        }

      } while (attempts < maxAttempts);

      // Fallback falls keine gültige Kombination gefunden wurde
      if (attempts >= maxAttempts || vorr < 50000) {
        // Neu berechnen mit angepassten Werten
        av = randRange(sizeRanges.AV.min, sizeRanges.AV.max);
        kfk = randRange(sizeRanges.KFK.min, sizeRanges.KFK.max);
        
        // Kennzahlen neu ziehen
        barLiq = Math.random() * (kennzahlenRanges.barLiq.max - kennzahlenRanges.barLiq.min) + kennzahlenRanges.barLiq.min;
        einzugsLiq = Math.random() * (kennzahlenRanges.einzugsLiq.max - kennzahlenRanges.einzugsLiq.min) + kennzahlenRanges.einzugsLiq.min;
        deckung1 = Math.random() * (kennzahlenRanges.deckung1.max - kennzahlenRanges.deckung1.min) + kennzahlenRanges.deckung1.min;
        deckung2 = Math.random() * (kennzahlenRanges.deckung2.max - kennzahlenRanges.deckung2.min) + kennzahlenRanges.deckung2.min;
        
        flus = Math.max(25000, Math.round((barLiq * kfk / 100) / 5000) * 5000);
        ford = Math.max(25000, Math.round(((einzugsLiq * kfk / 100) - flus) / 5000) * 5000);
        ek = Math.max(100000, Math.round((deckung1 * av / 100) / 5000) * 5000);
        lfk = Math.max(50000, Math.round(((deckung2 * av / 100) - ek) / 5000) * 5000);
        
        // Vorräte künstlich auf Mindestwert setzen
        vorr = randRange(150000, 300000);
        
        // UV und Bilanzsumme rückwärts berechnen
        uv = vorr + ford + flus;
        aktiva = av + uv;
        fremd = lfk + kfk;
        ek = aktiva - fremd;
        
        // Kennzahlen neu berechnen (werden leicht abweichen)
        barLiq = (flus / kfk) * 100;
        einzugsLiq = ((flus + ford) / kfk) * 100;
        deckung1 = (ek / av) * 100;
        deckung2 = ((ek + lfk) / av) * 100;
      }

      console.log('Generierte Kennzahlen:', {
        barLiq: barLiq.toFixed(1) + '%',
        einzugsLiq: einzugsLiq.toFixed(1) + '%',
        deckung1: deckung1.toFixed(1) + '%',
        deckung2: deckung2.toFixed(1) + '%'
      });

      console.log('Versuche benötigt:', attempts);

      set("value-AV", av);
      set("value-VORR", vorr);
      set("value-FORD", ford);
      set("value-FLUS", flus);
      set("value-LFK", lfk);
      set("value-KFK", kfk);
      set("value-EK", ek);
      set("value-SUM-A", aktiva);
      set("value-SUM-P", aktiva);

      if (ek < 0) {
        document.getElementById("value-EK").style.color = "red";
      } else {
        document.getElementById("value-EK").style.color = "";
      }

      document.getElementById("kennzahl-barliquiditaet").textContent = barLiq.toFixed(1) + " %";
      document.getElementById("kennzahl-einzugsliquiditaet").textContent = einzugsLiq.toFixed(1) + " %";
      document.getElementById("kennzahl-anlagendeckung1").textContent = deckung1.toFixed(1) + " %";
      document.getElementById("kennzahl-anlagendeckung2").textContent = deckung2.toFixed(1) + " %";
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
      html2canvas(bilanz7Container).then(canvas => {
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

    function generateBilanzUndKennzahlen() {
      generateRandomBilanz10();
    }

    document.addEventListener("DOMContentLoaded", function () {
      generateBilanzUndKennzahlen();
    });