    function Herunterladen() {
      const CodeHTML = document.getElementById('Container').innerHTML;
      const blob = new Blob([CodeHTML], { type: 'text/html' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'page.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    function KopiereInZwischenablage() {
      const CodeHTML = document.getElementById('Container').innerHTML;
      navigator.clipboard.writeText(CodeHTML)
        .then(() => alert('Code wurde in die Zwischenablage kopiert'))
        .catch(err => console.error('Fehler beim Kopieren in die Zwischenablage:', err));
    }

    function HerunterladenAlsPNG() {
      const Container = document.getElementById('Container');
      html2canvas(Container).then(canvas => {
        const dataURL = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = 'grafik.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
    }

    let clipboard = new ClipboardJS('#officeButton');

    clipboard.on('success', function (e) {
      console.log("Die Tabelle wurde in die Zwischenablage kopiert.");
      alert("Die Tabelle wurde in die Zwischenablage kopiert.");
    });

    clipboard.on('error', function (e) {
      console.error("Fehler beim Kopieren der Tabelle: ", e.action);
      alert("Fehler beim Kopieren der Tabelle.");
    });