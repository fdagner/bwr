// Inventar aller <button>-Elemente in den Root-HTML-Dateien
// Ausgabe: Datei : Zeile : (Klassen) : Label-Text
const fs = require('fs');
const path = require('path');

const root = '\\\\DS720\\homes\\Florian\\Drive\\Schule\\visualstudio\\bwr-tools';
const files = fs.readdirSync(root).filter(f => f.toLowerCase().endsWith('.html'));

const out = [];
for (const f of files.sort()) {
  const src = fs.readFileSync(path.join(root, f), 'utf8');
  const lines = src.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!/<button\b/i.test(line)) continue;

    // Button-Körper: von dieser Zeile bis zum ersten </button> (über Zeilen hinweg)
    let text = line;
    let endLine = i;
    if (!/<\/button>/i.test(line)) {
      let j = i + 1;
      while (j < lines.length) {
        text += '\n' + lines[j];
        endLine = j;
        if (/<\/button>/i.test(lines[j])) break;
        j++;
      }
    }
    const m = text.match(/<button\b([\s\S]*?)>([\s\S]*?)<\/button>/i);
    if (!m) { out.push(`${f}:L${i + 1}:PARSE-FEHLGESCHLAGEN: ${line.trim().slice(0, 120)}`); continue; }
    const attrs = m[1];
    const cls = (attrs.match(/class="([^"]*)"/) || [])[1] || '';
    const label = m[2].replace(/<[\s\S]*?>/g, '').replace(/\s+/g, ' ').trim();
    const classTag = cls ? `[${cls}]` : '[]';
    const multiline = endLine > i ? `(+${endLine - i} Zeilen)` : '';
    out.push(`${f}:L${i + 1}:: ${classTag} ${multiline} "${label}" :: onclick=${(attrs.match(/onclick="([^"]*)"/) || [])[1] || ''} :: id=${(attrs.match(/id="([^"]*)"/) || [])[1] || ''}`);
  }
}

fs.writeFileSync(path.join(root, 'tools', 'button-inventar.txt'), out.join('\n'), 'utf8');
console.log(`${files.length} HTML-Dateien, ${out.length} Buttons → tools/button-inventar.txt`);
