    function KopiereInZwischenablageSVGLeer() {
      const CodeHTML = document.getElementById('svgContainerLeer').innerHTML;
      navigator.clipboard.writeText(CodeHTML)
        .then(() => alert('Code wurde in die Zwischenablage kopiert'))
        .catch(err => console.error('Fehler beim Kopieren in die Zwischenablage:', err));
    }

    function HerunterladenAlsPNGSVGLeer() {
      const Container = document.getElementById('svgContainerLeer');
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

      // SVG-Export
function exportSVGSVGLeer(filename = 'download.svg') {
    const container = document.getElementById('svgContainerLeer');
    if (!container) return;
    const svg = container.querySelector('svg');
    if (!svg) return alert('Kein SVG gefunden');
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}
