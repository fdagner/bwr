// js/lebenslauf_improved.js

// ────────────────────────────────────────────────
// Foto-zu-Base64-Konverter
// ────────────────────────────────────────────────
const fotoCache = {};

async function loadFotoAsBase64(fotoDateiname) {
  if (fotoCache[fotoDateiname]) return fotoCache[fotoDateiname];

  const moeglichePfade = [
    `media/pic/${fotoDateiname}`,
    `../media/pic/${fotoDateiname}`,
    `../../media/pic/${fotoDateiname}`,
    `./media/pic/${fotoDateiname}`
  ];

  for (const pfad of moeglichePfade) {
    try {
      const response = await fetch(pfad);
      if (response.ok) {
        const blob = await response.blob();
        const base64data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => { fotoCache[fotoDateiname] = reader.result; resolve(reader.result); };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        console.log(`✓ Foto geladen: ${pfad}`);
        return base64data;
      }
    } catch (error) { continue; }
  }

  console.warn(`✗ Foto nicht gefunden: ${fotoDateiname} - verwende Platzhalter`);
  return generatePlaceholderImage(fotoDateiname);
}

function generatePlaceholderImage(filename) {
  const match = filename.match(/([mw])_foto(\d)/);
  const geschlecht = match ? match[1] : 'm';
  const nummer = match ? parseInt(match[2]) : 1;

  const farbpalettenM = [
    { bg: '#3B82F6', text: '#1E3A8A' }, { bg: '#10B981', text: '#065F46' },
    { bg: '#F59E0B', text: '#92400E' }, { bg: '#8B5CF6', text: '#5B21B6' }, { bg: '#06B6D4', text: '#164E63' }
  ];
  const farbpalettenW = [
    { bg: '#EC4899', text: '#9F1239' }, { bg: '#F59E0B', text: '#92400E' },
    { bg: '#8B5CF6', text: '#5B21B6' }, { bg: '#06B6D4', text: '#164E63' }, { bg: '#10B981', text: '#065F46' }
  ];

  const paletten = geschlecht === 'm' ? farbpalettenM : farbpalettenW;
  const farben = paletten[(nummer - 1) % paletten.length];
  const initialenM = ['MK', 'JS', 'TL', 'FW', 'PH'];
  const initialenW = ['AS', 'LM', 'SK', 'EW', 'JB'];
  const initialen = geschlecht === 'm' ? initialenM : initialenW;
  const initiale = initialen[(nummer - 1) % initialen.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
    <rect width="200" height="200" fill="${farben.bg}"/>
    <g opacity="0.3">
      <circle cx="100" cy="70" r="30" fill="white"/>
      <path d="M 50 180 Q 50 120 100 120 Q 150 120 150 180 Z" fill="white"/>
    </g>
    <text x="100" y="115" font-family="Arial, sans-serif" font-size="40" font-weight="bold"
          fill="white" text-anchor="middle" dominant-baseline="middle">${initiale}</text>
  </svg>`;

  const base64 = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64}`;
}

// ────────────────────────────────────────────────
// A4-Layouts (210mm × 297mm bei 96dpi ≈ 794px × 1123px)
// Alle Layouts sind auf eine DIN-A4-Seite ausgelegt.
// Schriftgröße: 9–10pt, Padding: minimal, kompakte Abstände.
// ────────────────────────────────────────────────
const A4_STYLE = `
  width: 794px;
  min-height: 1123px;
  max-height: 1123px;
  overflow: hidden;
  box-sizing: border-box;
  font-size: 15px;
  line-height: 1.45;
`;

const layouts = [

  // Layout 1 – Klassisch & seriös (Blau)
  `<div style="${A4_STYLE} font-family: Arial, Helvetica, sans-serif; padding: 32px 36px; background: #ffffff; color: #0f172a;">
    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
      <div>
        <h1 style="margin:0; font-size:24px; font-weight:bold; color:#1e40af; line-height:1.2;">{vorname} {name}</h1>
        <p style="margin:5px 0 0; font-size:15px; color:#475569;">{strasse}<br>{plz} {ort}</p>
      </div>
      <img src="{foto_base64}" alt="Profilfoto" style="width:90px; height:90px; object-fit:cover; border-radius:50%; border:3px solid #dbeafe;">
    </div>
    <hr style="border:none; border-top:1px solid #cbd5e1; margin:10px 0;">
    <h2 style="font-size:16px; font-weight:bold; margin:0 0 6px; color:#1e40af; border-bottom:2px solid #bfdbfe; padding-bottom:3px;">Persönliche Daten</h2>
    <p style="margin:3px 0;">Geburtsdatum: {geburtsdatum} &nbsp;|&nbsp; Staatsangehörigkeit: {staatsangehoerigkeit} &nbsp;|&nbsp; Familienstand: {familienstand}</p>
    <hr style="border:none; border-top:1px solid #e2e8f0; margin:10px 0;">
    <h2 style="font-size:16px; font-weight:bold; margin:0 0 5px; color:#1e40af; border-bottom:2px solid #bfdbfe; padding-bottom:3px;">Schulausbildung</h2>
    <p style="margin:3px 0;">{schulausbildung}</p>
    <hr style="border:none; border-top:1px solid #e2e8f0; margin:10px 0;">
    <h2 style="font-size:16px; font-weight:bold; margin:0 0 5px; color:#1e40af; border-bottom:2px solid #bfdbfe; padding-bottom:3px;">Ausbildung</h2>
    <p style="margin:3px 0;">{ausbildung}</p>
    <hr style="border:none; border-top:1px solid #e2e8f0; margin:10px 0;">
    <h2 style="font-size:16px; font-weight:bold; margin:0 0 5px; color:#1e40af; border-bottom:2px solid #bfdbfe; padding-bottom:3px;">Berufspraxis</h2>
    <p style="margin:3px 0; white-space:pre-line;">{berufspraxis}</p>
    <hr style="border:none; border-top:1px solid #e2e8f0; margin:10px 0;">
    <h2 style="font-size:16px; font-weight:bold; margin:0 0 5px; color:#1e40af; border-bottom:2px solid #bfdbfe; padding-bottom:3px;">Kenntnisse & Qualifikationen</h2>
    <p style="margin:3px 0;">{besondere_kenntnisse}</p>
    <p style="margin:3px 0;"><strong>IT-Kenntnisse:</strong> {it_kenntnisse}</p>
    {soft_skills_section}
    <hr style="border:none; border-top:1px solid #e2e8f0; margin:10px 0;">
    <h2 style="font-size:16px; font-weight:bold; margin:0 0 5px; color:#1e40af; border-bottom:2px solid #bfdbfe; padding-bottom:3px;">Private Interessen</h2>
    <p style="margin:3px 0;">{interessen_privat}</p>
  </div>`,

  // Layout 2 – Modern mit Sidebar (Grün)
  `<div style="${A4_STYLE} font-family: 'Segoe UI', system-ui, sans-serif; background:#ffffff; display:flex;">
    <div style="width:220px; flex-shrink:0; background:#f0fdfa; padding:28px 18px; border-right:1px solid #99f6e4; box-sizing:border-box;">
      <img src="{foto_base64}" alt="Profilfoto" style="width:140px; height:140px; object-fit:cover; border-radius:8px; margin:0 auto 14px; display:block; border:2px solid #2dd4bf;">
      <h2 style="font-size:17px; font-weight:700; margin:0 0 8px; color:#065f46; text-align:center;">{vorname} {name}</h2>
      <p style="margin:3px 0; font-size:15px; color:#374151; text-align:center;">{strasse}<br>{plz} {ort}</p>
      <hr style="border:none; border-top:1px solid #6ee7b7; margin:12px 0;">
      <p style="margin:2px 0; font-size:15px; color:#374151;">Geb.: {geburtsdatum}</p>
      <p style="margin:2px 0; font-size:15px; color:#374151;">Staatsangeh.: {staatsangehoerigkeit}</p>
      <p style="margin:2px 0; font-size:15px; color:#374151;">Familienstand: {familienstand}</p>
      <hr style="border:none; border-top:1px solid #6ee7b7; margin:12px 0;">
      <h3 style="font-size:16px; font-weight:700; margin:0 0 5px; color:#065f46;">Qualifikationen</h3>
      <p style="margin:3px 0; font-size:15px; color:#1f2937; line-height:1.4;">{besondere_kenntnisse}</p>
      <hr style="border:none; border-top:1px solid #6ee7b7; margin:12px 0;">
      <h3 style="font-size:16px; font-weight:700; margin:0 0 5px; color:#065f46;">Interessen</h3>
      <p style="margin:3px 0; font-size:15px; color:#1f2937; line-height:1.4;">{interessen_privat}</p>
    </div>
    <div style="flex:1; padding:28px 24px; box-sizing:border-box;">
      <h1 style="margin:0 0 16px; font-size:24px; font-weight:700; color:#047857; text-align:center; border-bottom:2px solid #a7f3d0; padding-bottom:8px;">Lebenslauf</h1>
      <h2 style="font-size:16px; font-weight:700; margin:12px 0 5px; color:#065f46; border-bottom:2px solid #a7f3d0; padding-bottom:2px;">Schulausbildung</h2>
      <p style="margin:3px 0;">{schulausbildung}</p>
      <h2 style="font-size:16px; font-weight:700; margin:12px 0 5px; color:#065f46; border-bottom:2px solid #a7f3d0; padding-bottom:2px;">Ausbildung</h2>
      <p style="margin:3px 0;">{ausbildung}</p>
      <h2 style="font-size:16px; font-weight:700; margin:12px 0 5px; color:#065f46; border-bottom:2px solid #a7f3d0; padding-bottom:2px;">Berufspraxis</h2>
      <p style="margin:3px 0; white-space:pre-line;">{berufspraxis}</p>
      <h2 style="font-size:16px; font-weight:700; margin:12px 0 5px; color:#065f46; border-bottom:2px solid #a7f3d0; padding-bottom:2px;">IT-Kenntnisse</h2>
      <p style="margin:3px 0;">{it_kenntnisse}</p>
      {soft_skills_section}
    </div>
  </div>`,

  // Layout 3 – Warm & elegant (Terracotta)
  `<div style="${A4_STYLE} font-family: Georgia, serif; padding:28px 36px; background:#fffaf0; color:#1f2937;">
    <div style="text-align:center; margin-bottom:14px;">
      <img src="{foto_base64}" alt="Profilfoto" style="width:90px; height:90px; object-fit:cover; border-radius:50%; border:3px solid #fee2d5; margin-bottom:8px;">
      <h1 style="margin:0; font-size:24px; font-weight:700; color:#9f1239;">{vorname} {name}</h1>
      <p style="margin:4px 0 2px; font-size:15px; color:#4b5563;">{strasse} &bull; {plz} {ort}</p>
      <p style="margin:0; font-size:15px; color:#4b5563;">{geburtsdatum} &bull; {staatsangehoerigkeit} &bull; {familienstand}</p>
    </div>
    <hr style="border:none; border-top:2px solid #fdba74; margin:10px 0;">
    <h3 style="font-size:16px; font-weight:700; margin:8px 0 3px; color:#7c2d12;">Schulausbildung</h3>
    <p style="margin:0 0 8px; padding-left:12px; border-left:3px solid #fdba74;">{schulausbildung}</p>
    <h3 style="font-size:16px; font-weight:700; margin:8px 0 3px; color:#7c2d12;">Ausbildung</h3>
    <p style="margin:0 0 8px; padding-left:12px; border-left:3px solid #fdba74;">{ausbildung}</p>
    <h3 style="font-size:16px; font-weight:700; margin:8px 0 3px; color:#7c2d12;">Berufspraxis</h3>
    <p style="margin:0 0 8px; padding-left:12px; border-left:3px solid #fdba74; white-space:pre-line;">{berufspraxis}</p>
    <hr style="border:none; border-top:1px solid #fed7aa; margin:10px 0;">
    <h2 style="font-size:16px; font-weight:700; margin:0 0 6px; color:#9f1239; border-bottom:2px solid #fdba74; padding-bottom:3px;">Kompetenzen</h2>
    <p style="margin:3px 0;"><strong>Qualifikationen:</strong> {besondere_kenntnisse}</p>
    <p style="margin:3px 0;"><strong>IT-Kenntnisse:</strong> {it_kenntnisse}</p>
    {soft_skills_section}
    <hr style="border:none; border-top:1px solid #fed7aa; margin:10px 0;">
    <h2 style="font-size:16px; font-weight:700; margin:0 0 5px; color:#9f1239; border-bottom:2px solid #fdba74; padding-bottom:3px;">Interessen</h2>
    <p style="margin:3px 0;">{interessen_privat}</p>
  </div>`,

  // Layout 4 – Minimalistisch (Grau)
  `<div style="${A4_STYLE} font-family: Calibri, sans-serif; padding:32px 40px; background:#ffffff; color:#1f2937; border-left:5px solid #374151;">
    <div style="display:flex; gap:24px; margin-bottom:18px; align-items:center;">
      <img src="{foto_base64}" alt="Profilfoto" style="width:85px; height:85px; object-fit:cover; border-radius:3px; border:2px solid #e5e7eb; flex-shrink:0;">
      <div>
        <h1 style="margin:0 0 5px; font-size:24px; font-weight:700; color:#111827; letter-spacing:-0.3px;">{vorname} {name}</h1>
        <p style="margin:2px 0; font-size:15px; color:#6b7280;">{strasse}, {plz} {ort}</p>
        <p style="margin:2px 0; font-size:15px; color:#6b7280;">Geb.: {geburtsdatum} &nbsp;|&nbsp; {staatsangehoerigkeit} &nbsp;|&nbsp; {familienstand}</p>
      </div>
    </div>
    <div style="border-top:2px solid #e5e7eb; padding-top:14px;">
      <h2 style="font-size:17px; font-weight:700; margin:0 0 5px; color:#374151; text-transform:uppercase; letter-spacing:0.8px;">Schulausbildung</h2>
      <p style="margin:0 0 12px; color:#4b5563;">{schulausbildung}</p>
      <h2 style="font-size:17px; font-weight:700; margin:0 0 5px; color:#374151; text-transform:uppercase; letter-spacing:0.8px;">Ausbildung</h2>
      <p style="margin:0 0 12px; color:#4b5563;">{ausbildung}</p>
      <h2 style="font-size:17px; font-weight:700; margin:0 0 5px; color:#374151; text-transform:uppercase; letter-spacing:0.8px;">Berufspraxis</h2>
      <p style="margin:0 0 12px; color:#4b5563; white-space:pre-line;">{berufspraxis}</p>
      <h2 style="font-size:17px; font-weight:700; margin:0 0 5px; color:#374151; text-transform:uppercase; letter-spacing:0.8px;">Qualifikationen</h2>
      <p style="margin:0 0 4px; color:#4b5563;">{besondere_kenntnisse}</p>
      <p style="margin:0 0 12px; color:#4b5563;"><strong>IT:</strong> {it_kenntnisse}</p>
      {soft_skills_section}
      <h2 style="font-size:17px; font-weight:700; margin:0 0 5px; color:#374151; text-transform:uppercase; letter-spacing:0.8px;">Interessen</h2>
      <p style="margin:0; color:#4b5563;">{interessen_privat}</p>
    </div>
  </div>`,

  // Layout 5 – Kreativ (Lila)
  `<div style="${A4_STYLE} font-family: 'Trebuchet MS', sans-serif; padding:28px 32px; background:#faf5ff; color:#1f2937;">
    <div style="text-align:center; margin-bottom:14px;">
      <img src="{foto_base64}" alt="Profilfoto" style="width:88px; height:88px; object-fit:cover; border-radius:50%; border:3px solid #c084fc; margin-bottom:8px;">
      <h1 style="margin:0 0 4px; font-size:24px; font-weight:800; color:#6b21a8;">{vorname} {name}</h1>
      <p style="margin:2px 0; font-size:15px; color:#7c3aed;">{strasse} &bull; {plz} {ort}</p>
      <p style="margin:2px 0; font-size:15px; color:#6b7280;">{geburtsdatum} &bull; {staatsangehoerigkeit} &bull; {familienstand}</p>
    </div>
    <div style="background:white; padding:18px 22px; border-radius:8px; border:1px solid #e9d5ff;">
      <div style="margin-bottom:12px;">
        <h2 style="font-size:16px; font-weight:700; margin:0 0 3px; color:#7c3aed; border-bottom:2px solid #c084fc; padding-bottom:2px; display:inline-block;">Schulausbildung</h2>
        <p style="margin:5px 0 0;">{schulausbildung}</p>
      </div>
      <div style="margin-bottom:12px;">
        <h2 style="font-size:16px; font-weight:700; margin:0 0 3px; color:#7c3aed; border-bottom:2px solid #c084fc; padding-bottom:2px; display:inline-block;">Ausbildung</h2>
        <p style="margin:5px 0 0;">{ausbildung}</p>
      </div>
      <div style="margin-bottom:12px;">
        <h2 style="font-size:16px; font-weight:700; margin:0 0 3px; color:#7c3aed; border-bottom:2px solid #c084fc; padding-bottom:2px; display:inline-block;">Berufspraxis</h2>
        <p style="margin:5px 0 0; white-space:pre-line;">{berufspraxis}</p>
      </div>
      <div style="margin-bottom:12px;">
        <h2 style="font-size:16px; font-weight:700; margin:0 0 3px; color:#7c3aed; border-bottom:2px solid #c084fc; padding-bottom:2px; display:inline-block;">Kompetenzen</h2>
        <p style="margin:5px 0 3px;">{besondere_kenntnisse}</p>
        <p style="margin:3px 0;"><strong>IT:</strong> {it_kenntnisse}</p>
        {soft_skills_section}
      </div>
      <div>
        <h2 style="font-size:16px; font-weight:700; margin:0 0 3px; color:#7c3aed; border-bottom:2px solid #c084fc; padding-bottom:2px; display:inline-block;">Interessen</h2>
        <p style="margin:5px 0 0;">{interessen_privat}</p>
      </div>
    </div>
  </div>`,

  // Layout 6 – Zeitstrahl (Türkis)
  `<div style="${A4_STYLE} font-family: Verdana, sans-serif; padding:28px 34px; background:#ffffff; color:#0f172a;">
    <div style="display:flex; align-items:center; gap:20px; margin-bottom:14px; padding-bottom:12px; border-bottom:2px solid #99f6e4;">
      <img src="{foto_base64}" alt="Profilfoto" style="width:88px; height:88px; object-fit:cover; border-radius:8px; border:3px solid #2dd4bf; flex-shrink:0;">
      <div>
        <h1 style="margin:0 0 5px; font-size:24px; font-weight:700; color:#0f766e;">{vorname} {name}</h1>
        <p style="margin:2px 0; font-size:15px; color:#334155;">{strasse}, {plz} {ort}</p>
        <p style="margin:2px 0; font-size:15px; color:#475569;">{geburtsdatum} &bull; {staatsangehoerigkeit} &bull; {familienstand}</p>
      </div>
    </div>
    <div style="position:relative; padding-left:22px; border-left:3px solid #5eead4; margin-bottom:12px;">
      <h2 style="font-size:16px; font-weight:700; margin:0 0 4px; color:#0f766e;">Schulausbildung</h2>
      <p style="margin:0 0 12px; font-size:15px; color:#334155;">{schulausbildung}</p>
      <h2 style="font-size:16px; font-weight:700; margin:0 0 4px; color:#0f766e;">Ausbildung</h2>
      <p style="margin:0 0 12px; font-size:15px; color:#334155;">{ausbildung}</p>
      <h2 style="font-size:16px; font-weight:700; margin:0 0 4px; color:#0f766e;">Berufspraxis</h2>
      <p style="margin:0; font-size:15px; color:#334155; white-space:pre-line;">{berufspraxis}</p>
    </div>
    <hr style="border:none; border-top:2px solid #99f6e4; margin:12px 0;">
    <h2 style="font-size:16px; font-weight:700; margin:0 0 5px; color:#0f766e;">Qualifikationen & Kenntnisse</h2>
    <p style="margin:3px 0; font-size:15px; color:#334155;">{besondere_kenntnisse}</p>
    <p style="margin:3px 0; font-size:15px; color:#334155;"><strong>IT:</strong> {it_kenntnisse}</p>
    {soft_skills_section}
    <hr style="border:none; border-top:1px solid #ccfbf1; margin:12px 0;">
    <h2 style="font-size:16px; font-weight:700; margin:0 0 5px; color:#0f766e;">Private Interessen</h2>
    <p style="margin:0; font-size:15px; color:#334155;">{interessen_privat}</p>
  </div>`,

  // Layout 7 – Corporate Business (Dunkelblau/Gold)
  `<div style="${A4_STYLE} font-family: 'Times New Roman', serif; padding:28px 32px; background:#ffffff; color:#0f172a; border:3px solid #0f172a;">
    <div style="text-align:center; border-bottom:2px double #d4af37; padding-bottom:14px; margin-bottom:14px;">
      <img src="{foto_base64}" alt="Profilfoto" style="width:85px; height:85px; object-fit:cover; border-radius:50%; border:3px solid #d4af37; margin-bottom:8px;">
      <h1 style="margin:0; font-size:24px; font-weight:700; color:#0f172a; letter-spacing:1px;">{vorname} {name}</h1>
      <p style="margin:5px 0 0; font-size:15px; color:#475569; font-style:italic;">{strasse} &bull; {plz} {ort}</p>
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:14px; padding:10px 14px; background:#f1f5f9; border-left:3px solid #d4af37; font-size:15px;">
      <p style="margin:2px 0;"><strong>Geboren:</strong> {geburtsdatum}</p>
      <p style="margin:2px 0;"><strong>Nationalität:</strong> {staatsangehoerigkeit}</p>
      <p style="margin:2px 0;"><strong>Familienstand:</strong> {familienstand}</p>
    </div>
    <h2 style="font-size:16px; font-weight:700; margin:12px 0 5px; color:#0f172a; border-bottom:2px solid #d4af37; padding-bottom:3px;">Schulausbildung</h2>
    <p style="margin:0 0 8px;">{schulausbildung}</p>
    <h2 style="font-size:16px; font-weight:700; margin:12px 0 5px; color:#0f172a; border-bottom:2px solid #d4af37; padding-bottom:3px;">Ausbildung</h2>
    <p style="margin:0 0 8px;">{ausbildung}</p>
    <h2 style="font-size:16px; font-weight:700; margin:12px 0 5px; color:#0f172a; border-bottom:2px solid #d4af37; padding-bottom:3px;">Berufspraxis</h2>
    <p style="margin:0 0 8px; white-space:pre-line;">{berufspraxis}</p>
    <h2 style="font-size:16px; font-weight:700; margin:12px 0 5px; color:#0f172a; border-bottom:2px solid #d4af37; padding-bottom:3px;">Qualifikationen</h2>
    <p style="margin:0 0 4px;">{besondere_kenntnisse}</p>
    <p style="margin:0 0 8px;"><strong>IT:</strong> {it_kenntnisse}</p>
    {soft_skills_section}
    <h2 style="font-size:16px; font-weight:700; margin:12px 0 5px; color:#0f172a; border-bottom:2px solid #d4af37; padding-bottom:3px;">Interessen</h2>
    <p style="margin:0;">{interessen_privat}</p>
  </div>`,

  // Layout 8 – Zweispaltig (Orange)
  `<div style="${A4_STYLE} font-family: Arial, sans-serif; background:#ffffff; display:grid; grid-template-columns:210px 1fr;">
    <div style="background:linear-gradient(180deg, #fb923c 0%, #f97316 100%); padding:28px 18px; color:#ffffff; box-sizing:border-box;">
      <img src="{foto_base64}" alt="Profilfoto" style="width:140px; border-radius:10px; border:3px solid rgba(255,255,255,0.35); margin-bottom:14px; display:block;">
      <h1 style="margin:0 0 2px; font-size:19px; font-weight:700; text-shadow:1px 1px 2px rgba(0,0,0,0.2);">{vorname}</h1>
      <h2 style="margin:0 0 16px; font-size:17px; font-weight:700; color:#fff7ed; text-shadow:1px 1px 2px rgba(0,0,0,0.2);">{name}</h2>
      <div style="background:rgba(255,255,255,0.18); padding:10px 12px; border-radius:8px; margin-bottom:10px; font-size:16px;">
        <h3 style="margin:0 0 5px; font-size:16px; font-weight:700; color:#fff7ed;">Kontakt</h3>
        <p style="margin:2px 0;">{strasse}<br>{plz} {ort}</p>
      </div>
      <div style="background:rgba(255,255,255,0.18); padding:10px 12px; border-radius:8px; margin-bottom:10px; font-size:16px;">
        <h3 style="margin:0 0 5px; font-size:16px; font-weight:700; color:#fff7ed;">Persönliches</h3>
        <p style="margin:2px 0;">{geburtsdatum}</p>
        <p style="margin:2px 0;">{staatsangehoerigkeit}</p>
        <p style="margin:2px 0;">{familienstand}</p>
      </div>
      <div style="background:rgba(255,255,255,0.18); padding:10px 12px; border-radius:8px; font-size:16px;">
        <h3 style="margin:0 0 5px; font-size:16px; font-weight:700; color:#fff7ed;">Interessen</h3>
        <p style="margin:0; line-height:1.45;">{interessen_privat}</p>
      </div>
    </div>
    <div style="padding:28px 22px; background:#fafafa; box-sizing:border-box; font-size:15px;">
      <h2 style="font-size:16px; font-weight:700; margin:0 0 5px; color:#ea580c; border-left:4px solid #fb923c; padding-left:8px;">Schulausbildung</h2>
      <p style="margin:0 0 12px; color:#404040;">{schulausbildung}</p>
      <h2 style="font-size:16px; font-weight:700; margin:0 0 5px; color:#ea580c; border-left:4px solid #fb923c; padding-left:8px;">Ausbildung</h2>
      <p style="margin:0 0 12px; color:#404040;">{ausbildung}</p>
      <h2 style="font-size:16px; font-weight:700; margin:0 0 5px; color:#ea580c; border-left:4px solid #fb923c; padding-left:8px;">Berufspraxis</h2>
      <p style="margin:0 0 12px; color:#404040; white-space:pre-line;">{berufspraxis}</p>
      <h2 style="font-size:16px; font-weight:700; margin:0 0 5px; color:#ea580c; border-left:4px solid #fb923c; padding-left:8px;">Kenntnisse</h2>
      <p style="margin:0 0 4px; color:#404040;">{besondere_kenntnisse}</p>
      <p style="margin:0 0 10px; color:#404040;"><strong>IT:</strong> {it_kenntnisse}</p>
      {soft_skills_section}
    </div>
  </div>`,

  // Layout 9 – Schlicht & Elegant (Bordeaux)
  `<div style="${A4_STYLE} font-family: Georgia, serif; padding:28px 38px; background:#fefce8; color:#292524; border:6px solid #881337;">
    <div style="text-align:center; margin-bottom:12px;">
      <h1 style="margin:0 0 4px; font-size:24px; font-weight:400; color:#881337; font-variant:small-caps; letter-spacing:2px;">{vorname} {name}</h1>
      <div style="width:60px; height:2px; background:#be123c; margin:6px auto;"></div>
      <p style="margin:3px 0; font-size:15px; color:#78350f;">{strasse}, {plz} {ort}</p>
    </div>
    <div style="text-align:center; margin-bottom:12px;">
      <img src="{foto_base64}" alt="Profilfoto" style="width:85px; height:85px; object-fit:cover; border-radius:50%; border:3px solid #881337;">
    </div>
    <div style="background:#fffbeb; padding:8px 18px; border-left:3px solid #be123c; margin-bottom:12px; font-size:15px;">
      <p style="margin:2px 0;"><strong>Geburtsdatum:</strong> {geburtsdatum} &nbsp;&bull;&nbsp; <strong>Staatsangeh.:</strong> {staatsangehoerigkeit} &nbsp;&bull;&nbsp; <strong>Familienstand:</strong> {familienstand}</p>
    </div>
    <h2 style="font-size:17px; font-weight:400; margin:10px 0 5px; color:#881337; font-variant:small-caps; letter-spacing:1px; text-align:center; border-top:1px solid #be123c; border-bottom:1px solid #be123c; padding:4px 0;">Schulausbildung</h2>
    <p style="margin:0 0 8px; font-size:15px; line-height:1.5; text-align:justify;">{schulausbildung}</p>
    <h2 style="font-size:17px; font-weight:400; margin:10px 0 5px; color:#881337; font-variant:small-caps; letter-spacing:1px; text-align:center; border-top:1px solid #be123c; border-bottom:1px solid #be123c; padding:4px 0;">Ausbildung</h2>
    <p style="margin:0 0 8px; font-size:15px; line-height:1.5; text-align:justify;">{ausbildung}</p>
    <h2 style="font-size:17px; font-weight:400; margin:10px 0 5px; color:#881337; font-variant:small-caps; letter-spacing:1px; text-align:center; border-top:1px solid #be123c; border-bottom:1px solid #be123c; padding:4px 0;">Berufspraxis</h2>
    <p style="margin:0 0 8px; font-size:15px; line-height:1.5; text-align:justify; white-space:pre-line;">{berufspraxis}</p>
    <h2 style="font-size:17px; font-weight:400; margin:10px 0 5px; color:#881337; font-variant:small-caps; letter-spacing:1px; text-align:center; border-top:1px solid #be123c; border-bottom:1px solid #be123c; padding:4px 0;">Qualifikationen</h2>
    <p style="margin:0 0 4px; font-size:15px; line-height:1.5; text-align:justify;">{besondere_kenntnisse}</p>
    <p style="margin:0 0 8px; font-size:15px; line-height:1.5; text-align:justify;"><strong>IT:</strong> {it_kenntnisse}</p>
    {soft_skills_section}
    <h2 style="font-size:17px; font-weight:400; margin:10px 0 5px; color:#881337; font-variant:small-caps; letter-spacing:1px; text-align:center; border-top:1px solid #be123c; border-bottom:1px solid #be123c; padding:4px 0;">Interessen</h2>
    <p style="margin:0; font-size:15px; line-height:1.5; text-align:justify;">{interessen_privat}</p>
  </div>`,

  // Layout 10 – Tech/Startup (Cyan/Schwarz)
  `<div style="${A4_STYLE} font-family: 'Courier New', monospace; background:#1a1a1a; color:#00ffff; padding:4px;">
    <div style="border:1px solid #00ffff; padding:24px 28px; box-sizing:border-box; min-height:1115px;">
      <div style="display:flex; gap:24px; align-items:center; margin-bottom:14px; padding-bottom:12px; border-bottom:2px solid #00ffff;">
        <img src="{foto_base64}" alt="Profilfoto" style="width:85px; height:85px; object-fit:cover; border:2px solid #00ffff; flex-shrink:0; filter:grayscale(20%);">
        <div>
          <h1 style="margin:0 0 5px; font-size:19px; font-weight:700; color:#00ffff;">&gt; {vorname} {name}</h1>
          <p style="margin:2px 0; font-size:15px; color:#00ff88;">&#128205; {strasse}, {plz} {ort}</p>
          <p style="margin:2px 0; font-size:15px; color:#00ff88;">&#128197; {geburtsdatum} &nbsp;|&nbsp; &#127757; {staatsangehoerigkeit} &nbsp;|&nbsp; &#128188; {familienstand}</p>
        </div>
      </div>
      <div style="margin-bottom:10px;">
        <h2 style="font-size:16px; font-weight:700; margin:0 0 4px; color:#00ffff;">&gt;&gt; Schulausbildung</h2>
        <p style="margin:0 0 10px; padding-left:16px; border-left:2px solid #00ff88; font-size:15px; color:#e0e0e0;">{schulausbildung}</p>
      </div>
      <div style="margin-bottom:10px;">
        <h2 style="font-size:16px; font-weight:700; margin:0 0 4px; color:#00ffff;">&gt;&gt; Ausbildung</h2>
        <p style="margin:0 0 10px; padding-left:16px; border-left:2px solid #00ff88; font-size:15px; color:#e0e0e0;">{ausbildung}</p>
      </div>
      <div style="margin-bottom:10px;">
        <h2 style="font-size:16px; font-weight:700; margin:0 0 4px; color:#00ffff;">&gt;&gt; Berufspraxis</h2>
        <p style="margin:0 0 10px; padding-left:16px; border-left:2px solid #00ff88; font-size:15px; color:#e0e0e0; white-space:pre-line;">{berufspraxis}</p>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:10px;">
        <div style="background:rgba(0,255,255,0.06); padding:10px 14px; border:1px solid #00ffff;">
          <h3 style="margin:0 0 5px; font-size:16px; color:#00ffff;">&#9889; Skills</h3>
          <p style="margin:0; font-size:15px; color:#e0e0e0; line-height:1.45;">{besondere_kenntnisse}</p>
        </div>
        <div style="background:rgba(0,255,255,0.06); padding:10px 14px; border:1px solid #00ffff;">
          <h3 style="margin:0 0 5px; font-size:16px; color:#00ffff;">&#128187; Tech Stack</h3>
          <p style="margin:0; font-size:15px; color:#e0e0e0; line-height:1.45;">{it_kenntnisse}</p>
        </div>
      </div>
      {soft_skills_section}
      <div style="background:rgba(0,255,136,0.06); padding:10px 14px; border:1px solid #00ff88; margin-top:10px;">
        <h3 style="margin:0 0 5px; font-size:16px; color:#00ff88;">&#127919; Interessen</h3>
        <p style="margin:0; font-size:15px; color:#e0e0e0; line-height:1.45;">{interessen_privat}</p>
      </div>
    </div>
  </div>`
];

// ────────────────────────────────────────────────
// Personendaten
// ────────────────────────────────────────────────
const personen = [
  { vorname: 'Aghad', name: 'Esen', geschlecht: 'm', bildungsgrad: 'mittel' },
  { vorname: 'Dilara', name: 'Antal', geschlecht: 'w', bildungsgrad: 'hoch' },
  { vorname: 'Lukas', name: 'Schmidt', geschlecht: 'm', bildungsgrad: 'hoch' },
  { vorname: 'Sophia', name: 'Müller', geschlecht: 'w', bildungsgrad: 'mittel' },
  { vorname: 'Felix', name: 'Fischer', geschlecht: 'm', bildungsgrad: 'mittel' },
  { vorname: 'Emma', name: 'Weber', geschlecht: 'w', bildungsgrad: 'hoch' },
  { vorname: 'Noah', name: 'Meyer', geschlecht: 'm', bildungsgrad: 'niedrig' },
  { vorname: 'Mia', name: 'Wagner', geschlecht: 'w', bildungsgrad: 'mittel' },
  { vorname: 'Ben', name: 'Balic', geschlecht: 'm', bildungsgrad: 'mittel' },
  { vorname: 'Lea', name: 'Schulz', geschlecht: 'w', bildungsgrad: 'hoch' },
  { vorname: 'Paul', name: 'Hoffmann', geschlecht: 'm', bildungsgrad: 'hoch' },
  { vorname: 'Laura', name: 'Celik', geschlecht: 'w', bildungsgrad: 'mittel' },
  { vorname: 'David', name: 'Richter', geschlecht: 'm', bildungsgrad: 'hoch' },
  { vorname: 'Aylin', name: 'Masala', geschlecht: 'w', bildungsgrad: 'mittel' },
  { vorname: 'Leon', name: 'Wolf', geschlecht: 'm', bildungsgrad: 'niedrig' },
  { vorname: 'Hannah', name: 'Satari', geschlecht: 'w', bildungsgrad: 'hoch' },
  { vorname: 'Julian', name: 'Neumann', geschlecht: 'm', bildungsgrad: 'mittel' },
  { vorname: 'Eda', name: 'Yilmaz', geschlecht: 'w', bildungsgrad: 'hoch' },
  { vorname: 'Anthony', name: 'Brown', geschlecht: 'm', bildungsgrad: 'niedrig' },
  { vorname: 'Julia', name: 'Hofmann', geschlecht: 'w', bildungsgrad: 'mittel' },
  { vorname: 'Jonas', name: 'König', geschlecht: 'm', bildungsgrad: 'mittel' },
  { vorname: 'Marie', name: 'Krause', geschlecht: 'w', bildungsgrad: 'hoch' },
  { vorname: 'Elias', name: 'Panovski', geschlecht: 'm', bildungsgrad: 'mittel' },
  { vorname: 'Charlotte', name: 'Schmitt', geschlecht: 'w', bildungsgrad: 'hoch' }
];

const adressen = [
  { plz: '90402', ort: 'Nürnberg', strassen: ['Hauptstraße 12', 'Südliche Fürther Str. 45', 'Königstraße 78'] },
  { plz: '80331', ort: 'München', strassen: ['Bahnhofplatz 5', 'Marienplatz 8', 'Maximilianstraße 23'] },
  { plz: '10115', ort: 'Berlin', strassen: ['Friedrichstraße 101', 'Unter den Linden 42', 'Torstraße 67'] },
  { plz: '20095', ort: 'Hamburg', strassen: ['Mönckebergstraße 9', 'Jungfernstieg 15', 'Reeperbahn 88'] },
  { plz: '50667', ort: 'Köln', strassen: ['Hohe Straße 33', 'Schildergasse 21', 'Ehrenstraße 56'] },
  { plz: '70173', ort: 'Stuttgart', strassen: ['Königstraße 14', 'Schlossplatz 7', 'Calwer Straße 29'] },
  { plz: '60311', ort: 'Frankfurt', strassen: ['Zeil 112', 'Kaiserstraße 48', 'Große Bockenheimer Str. 19'] },
  { plz: '40213', ort: 'Düsseldorf', strassen: ['Königsallee 92', 'Schadowstraße 11', 'Immermannstraße 34'] },
  { plz: '04109', ort: 'Leipzig', strassen: ['Grimmaische Straße 25', 'Petersstraße 16', 'Hainstraße 8'] },
  { plz: '01067', ort: 'Dresden', strassen: ['Prager Straße 2', 'Wilsdruffer Straße 20', 'Neumarkt 12'] },
  { plz: '90762', ort: 'Fürth', strassen: ['Schwabacher Straße 45', 'Gustavstraße 12', 'Königstraße 89'] },
  { plz: '91052', ort: 'Erlangen', strassen: ['Hauptstraße 33', 'Nürnberger Straße 15', 'Goethestraße 8'] },
  { plz: '97070', ort: 'Würzburg', strassen: ['Domstraße 6', 'Juliuspromenade 40', 'Theaterstraße 22'] },
  { plz: '91074', ort: 'Herzogenaurach', strassen: ['Hauptstraße 21', 'Marktplatz 3', 'Einsteinstraße 5'] },
  { plz: '86150', ort: 'Augsburg', strassen: ['Maximilianstraße 54', 'Karolinenstraße 18', 'Hallstraße 9'] },
  { plz: '84028', ort: 'Landshut', strassen: ['Altstadt 82', 'Ländtorplatz 4', 'Neustadt 21'] },
  { plz: '93047', ort: 'Regensburg', strassen: ['Maximilianstraße 26', 'Gesandtenstraße 14', 'Dachauplatz 7'] },
  { plz: '96047', ort: 'Bamberg', strassen: ['Obere Brücke 3', 'Grüner Markt 10', 'Lange Straße 18'] },
  { plz: '87435', ort: 'Kempten', strassen: ['Residenzplatz 5', 'Fischerstraße 9', 'Bahnhofstraße 14'] }
];

const staatsangehoerigkeiten = ['Deutsch', 'Österreichisch', 'Schweizerisch'];
const familienstaende = ['Ledig', 'Verheiratet', 'Geschieden', 'In Partnerschaft'];

// ────────────────────────────────────────────────
// Bildungswege
// ────────────────────────────────────────────────
const bildungswege = {
  niedrig: {
    schulen: [
      { text: 'Hauptschulabschluss', ort: 'Nürnberg', jahre: '2006-2010' },
      { text: 'Hauptschulabschluss', ort: 'München', jahre: '2007-2011' },
      { text: 'Mittelschulabschluss', ort: 'Hamburg', jahre: '2008-2012' },
      { text: 'Hauptschulabschluss', ort: 'Berlin', jahre: '2009-2013' },
      { text: 'Hauptschulabschluss', ort: 'Köln', jahre: '2007-2011' },
      { text: 'Mittelschulabschluss', ort: 'Stuttgart', jahre: '2008-2012' }
    ],
    ausbildungen: {
      m: [
        'Ausbildung zum Verkäufer bei REWE (2012-2014)',
        'Ausbildung zur Fachkraft für Lagerlogistik bei Amazon (2013-2015)',
        'Ausbildung zum Koch im Restaurant "Zur Post" (2014-2017)',
        'Ausbildung zum Maler und Lackierer bei Malerbetrieb Schmidt (2015-2017)',
        'Ausbildung zum Gebäudereiniger bei ISS Facility Services (2013-2015)',
        'Ausbildung zum Bäcker in der Bäckerei Müller (2013-2016)',
        'Ausbildung zum Fleischer bei REWE (2014-2017)',
        'Ausbildung zum Gärtner bei der Stadt München (2012-2015)',
        'Ausbildung zum Dachdecker bei Dachdeckerei Wagner (2015-2018)',
        'Ausbildung zum Tischler in der Schreinerei Bauer (2014-2017)',
        'Ausbildung zum Altenpfleger im Seniorenheim St. Anna (2013-2016)',
        'Ausbildung zum Metallbauer bei Schlosserei Hoffmann (2015-2018)',
        'Ausbildung zum Kraftfahrzeugmechatroniker bei ATU (2014-2017)',
        'Ausbildung zum Lageristen bei DHL (2013-2015)',
        'Ausbildung zum Restaurantfachmann im Hotel Maritim (2013-2016)'
      ],
      w: [
        'Ausbildung zur Verkäuferin bei REWE (2012-2014)',
        'Ausbildung zur Fachkraft für Lagerlogistik bei Amazon (2013-2015)',
        'Ausbildung zur Köchin im Restaurant "Zur Post" (2014-2017)',
        'Ausbildung zur Malerin und Lackiererin bei Malerbetrieb Schmidt (2015-2017)',
        'Ausbildung zur Gebäudereinigerin bei ISS Facility Services (2013-2015)',
        'Ausbildung zur Friseurin bei Friseur Klier (2012-2014)',
        'Ausbildung zur Bäckerin in der Bäckerei Müller (2013-2016)',
        'Ausbildung zur Gärtnerin bei der Stadt München (2012-2015)',
        'Ausbildung zur Restaurantfachfrau im Hotel Maritim (2013-2016)',
        'Ausbildung zur Altenpflegerin im Seniorenheim St. Anna (2013-2016)',
        'Ausbildung zur Köchin im Hotel Adlon (2012-2015)',
        'Ausbildung zur Floristin bei Blumen Risse (2013-2016)',
        'Ausbildung zur Fachverkäuferin im Lebensmittelhandwerk bei EDEKA (2014-2017)'
      ]
    }
  },
  mittel: {
    schulen: [
      { text: 'Realschulabschluss', ort: 'Stuttgart', jahre: '2005-2011' },
      { text: 'Mittlere Reife', ort: 'Köln', jahre: '2006-2012' },
      { text: 'Realschulabschluss', ort: 'Frankfurt', jahre: '2007-2013' },
      { text: 'Fachabitur (Wirtschaft)', ort: 'Dresden', jahre: '2008-2014' },
      { text: 'Mittlere Reife', ort: 'Leipzig', jahre: '2009-2015' },
      { text: 'Realschulabschluss', ort: 'Nürnberg', jahre: '2006-2012' },
      { text: 'Fachabitur (Technik)', ort: 'München', jahre: '2007-2013' }
    ],
    ausbildungen: {
      m: [
        'Ausbildung zum Kaufmann für Büromanagement bei der Sparkasse Nürnberg (2013-2016)',
        'Ausbildung zum Bankkaufmann bei der Deutschen Bank (2014-2017)',
        'Ausbildung zum Fachinformatiker für Systemintegration bei Siemens (2015-2018)',
        'Ausbildung zum Industriekaufmann bei BMW (2013-2016)',
        'Ausbildung zum Elektroniker für Betriebstechnik bei Bosch (2014-2017)',
        'Ausbildung zum Gesundheits- und Krankenpfleger am Klinikum Nürnberg (2015-2018)',
        'Ausbildung zum Mechatroniker bei Audi (2016-2019)',
        'Ausbildung zum Steuerfachangestellten bei KPMG (2014-2017)',
        'Ausbildung zum Hotelfachmann im Hotel Adlon, Berlin (2015-2018)',
        'Ausbildung zum Speditionskaufmann bei DHL (2013-2016)',
        'Ausbildung zum Versicherungskaufmann bei der Allianz (2015-2018)',
        'Ausbildung zum Personaldienstleistungskaufmann bei Randstad (2016-2019)'
      ],
      w: [
        'Ausbildung zur Kauffrau für Büromanagement bei der Sparkasse Nürnberg (2013-2016)',
        'Ausbildung zur Bankkauffrau bei der Deutschen Bank (2014-2017)',
        'Ausbildung zur Fachinformatikerin für Systemintegration bei Siemens (2015-2018)',
        'Ausbildung zur Industriekauffrau bei BMW (2013-2016)',
        'Ausbildung zur Elektronikerin für Betriebstechnik bei Bosch (2014-2017)',
        'Ausbildung zur Gesundheits- und Krankenpflegerin am Klinikum Nürnberg (2015-2018)',
        'Ausbildung zur Mechatronikerin bei Audi (2016-2019)',
        'Ausbildung zur Steuerfachangestellten bei KPMG (2014-2017)',
        'Ausbildung zur Hotelfachfrau im Hotel Adlon, Berlin (2015-2018)',
        'Ausbildung zur Speditionskauffrau bei DHL (2013-2016)',
        'Ausbildung zur Versicherungskauffrau bei der Allianz (2015-2018)',
        'Ausbildung zur Personaldienstleistungskauffrau bei Randstad (2016-2019)'
      ]
    }
  },
  hoch: {
    schulen: [
      { text: 'Abitur', ort: 'Berlin', jahre: '2004-2012' },
      { text: 'Abitur', ort: 'München', jahre: '2005-2013' },
      { text: 'Abitur', ort: 'Hamburg', jahre: '2006-2014' },
      { text: 'Abitur', ort: 'Stuttgart', jahre: '2007-2015' },
      { text: 'Abitur', ort: 'Köln', jahre: '2006-2014' },
      { text: 'Abitur', ort: 'Frankfurt', jahre: '2005-2013' }
    ],
    ausbildungen: {
      m: [
        'Bachelor of Science in Informatik, TU Berlin (2014-2017)',
        'Bachelor of Arts in Betriebswirtschaft, LMU München (2015-2018)',
        'Bachelor of Engineering in Maschinenbau, RWTH Aachen (2016-2019)',
        'Master of Science in Wirtschaftsinformatik, Uni Mannheim (2018-2020)',
        'Bachelor in Psychologie, Uni Hamburg (2015-2018)',
        'Master in Marketing, Uni Köln (2019-2021)',
        'Bachelor in Rechtswissenschaften, Uni Frankfurt (2014-2018)',
        'Master of Science in Data Science, TU München (2018-2020)',
        'Master of Business Administration (MBA), WHU Koblenz (2019-2021)',
        'Bachelor of Laws, Uni Heidelberg (2014-2018)',
        'Master in International Management, ESMT Berlin (2018-2020)',
        'Bachelor in Kommunikationsdesign, Hochschule München (2016-2019)'
      ],
      w: [
        'Bachelor of Science in Informatik, TU Berlin (2014-2017)',
        'Bachelor of Arts in Betriebswirtschaft, LMU München (2015-2018)',
        'Bachelor of Engineering in Maschinenbau, RWTH Aachen (2016-2019)',
        'Master of Science in Wirtschaftsinformatik, Uni Mannheim (2018-2020)',
        'Bachelor in Psychologie, Uni Hamburg (2015-2018)',
        'Master in Marketing, Uni Köln (2019-2021)',
        'Bachelor in Rechtswissenschaften, Uni Frankfurt (2014-2018)',
        'Master of Science in Data Science, TU München (2018-2020)',
        'Master of Business Administration (MBA), WHU Koblenz (2019-2021)',
        'Bachelor of Laws, Uni Heidelberg (2014-2018)',
        'Master in International Management, ESMT Berlin (2018-2020)',
        'Bachelor in Kommunikationsdesign, Hochschule München (2016-2019)'
      ]
    }
  }
};

// ────────────────────────────────────────────────
// Berufspraxis-Profile
// ────────────────────────────────────────────────
const berufspraxisProfile = {
  niedrig: {
    m: [
      '2014-2016: Verkäufer bei REWE, München\n2016-2019: Schichtleiter bei Netto, München\n2019-heute: Filialleiter bei Penny, Augsburg',
      '2015-2017: Lagerhelfer bei Amazon, Leipzig\n2017-2020: Staplerfahrer bei DHL, Leipzig\n2020-heute: Teamleiter Logistik bei Hermes, Halle',
      '2017-2019: Küchenhilfe im Restaurant "Zur Post", Berlin\n2019-2022: Koch im Hotel Adlon, Berlin\n2022-heute: Souschef im Restaurant "Facil", Berlin',
      '2016-2018: Maler bei Malerbetrieb Schmidt, Hamburg\n2018-2021: Vorarbeiter bei Farben Fischer GmbH, Hamburg\n2021-heute: Selbstständiger Malermeister, Hamburg',
      '2015-2017: Reinigungskraft bei ISS Facility Services, Frankfurt\n2017-2020: Objektleiter bei Kötter Services, Frankfurt\n2020-heute: Bereichsleiter Gebäudereinigung, Frankfurt'
    ],
    w: [
      '2014-2016: Verkäuferin bei REWE, München\n2016-2019: Schichtleiterin bei Netto, München\n2019-heute: Filialleiterin bei Penny, Augsburg',
      '2015-2017: Lagerhelferin bei Amazon, Leipzig\n2017-2020: Lagerfachkraft bei DHL, Leipzig\n2020-heute: Teamleiterin Logistik bei Hermes, Halle',
      '2017-2019: Küchenhilfe im Restaurant "Zur Post", Berlin\n2019-2022: Köchin im Hotel Adlon, Berlin\n2022-heute: Souschefin im Restaurant "Facil", Berlin',
      '2015-2017: Reinigungskraft bei ISS Facility Services, Frankfurt\n2017-2020: Objektleiterin bei Kötter Services, Frankfurt\n2020-heute: Bereichsleiterin Gebäudereinigung, Frankfurt',
      '2014-2016: Friseurgesellin bei Friseur Klier, Stuttgart\n2016-2019: Friseurmeisterin bei Essanelle, Stuttgart\n2019-heute: Salonleiterin bei Intercoiffure, Stuttgart'
    ]
  },
  mittel: {
    m: [
      '2016-2018: Sachbearbeiter bei der Sparkasse Nürnberg\n2018-2021: Kundenberater bei der Volksbank Stuttgart\n2021-heute: Teamleiter Kundenservice bei der Commerzbank Frankfurt',
      '2017-2019: IT-Support bei der Stadt Köln\n2019-2022: Systemadministrator bei Bayer AG, Leverkusen\n2022-heute: Senior IT-Administrator bei BASF, Ludwigshafen',
      '2016-2019: Industriekaufmann bei Siemens, München\n2019-2021: Einkäufer bei BMW, München\n2021-heute: Senior Einkäufer bei Audi, Ingolstadt',
      '2019-2021: Junior Entwickler bei SAP, Walldorf\n2021-2023: Software Developer bei Microsoft, München\n2023-heute: Senior Developer bei Google, München',
      '2017-2019: Steuerfachangestellter bei KPMG, Frankfurt\n2019-2022: Steuerberater bei PwC, Frankfurt\n2022-heute: Senior Steuerberater bei EY, Frankfurt'
    ],
    w: [
      '2016-2018: Sachbearbeiterin bei der Sparkasse Nürnberg\n2018-2021: Kundenberaterin bei der Volksbank Stuttgart\n2021-heute: Teamleiterin Kundenservice bei der Commerzbank Frankfurt',
      '2017-2019: IT-Support bei der Stadt Köln\n2019-2022: Systemadministratorin bei Bayer AG, Leverkusen\n2022-heute: Senior IT-Administratorin bei BASF, Ludwigshafen',
      '2016-2019: Industriekauffrau bei Siemens, München\n2019-2021: Einkäuferin bei BMW, München\n2021-heute: Senior Einkäuferin bei Audi, Ingolstadt',
      '2019-2021: Junior Entwicklerin bei SAP, Walldorf\n2021-2023: Software Developerin bei Microsoft, München\n2023-heute: Senior Developerin bei Google, München',
      '2017-2019: Steuerfachangestellte bei KPMG, Frankfurt\n2019-2022: Steuerberaterin bei PwC, Frankfurt\n2022-heute: Senior Steuerberaterin bei EY, Frankfurt'
    ]
  },
  hoch: {
    m: [
      '2017-2019: Trainee bei McKinsey, München\n2019-2022: Junior Consultant bei Boston Consulting Group, Berlin\n2022-heute: Senior Consultant bei Deloitte, Frankfurt',
      '2018-2020: Junior Software Engineer bei Amazon, Berlin\n2020-2022: Software Engineer bei Google, München\n2022-heute: Senior Software Engineer & Team Lead bei Meta, München',
      '2019-2021: Produktmanager bei Zalando, Berlin\n2021-2023: Senior Product Manager bei N26, Berlin\n2023-heute: Head of Product bei Delivery Hero, Berlin',
      '2020-2022: Steuerberater bei Deloitte, München\n2022-2024: Senior Manager Tax bei KPMG, Frankfurt\n2024-heute: Partner bei PwC, Berlin',
      '2019-2021: Data Scientist bei SAP, Walldorf\n2021-2023: Senior Data Scientist bei Amazon, München\n2023-heute: Lead Data Scientist bei Google, Berlin'
    ],
    w: [
      '2017-2019: Trainee bei McKinsey, München\n2019-2022: Junior Consultant bei Boston Consulting Group, Berlin\n2022-heute: Senior Consultant bei Deloitte, Frankfurt',
      '2018-2020: Junior Software Engineer bei Amazon, Berlin\n2020-2022: Software Engineer bei Google, München\n2022-heute: Senior Software Engineer & Team Lead bei Meta, München',
      '2019-2021: Produktmanagerin bei Zalando, Berlin\n2021-2023: Senior Product Managerin bei N26, Berlin\n2023-heute: Head of Product bei Delivery Hero, Berlin',
      '2020-2022: Steuerberaterin bei Deloitte, München\n2022-2024: Senior Managerin Tax bei KPMG, Frankfurt\n2024-heute: Partnerin bei PwC, Berlin',
      '2019-2021: Data Scientist bei SAP, Walldorf\n2021-2023: Senior Data Scientist bei Amazon, München\n2023-heute: Lead Data Scientist bei Google, Berlin'
    ]
  }
};

// ────────────────────────────────────────────────
// Kenntnisse & Qualifikationen
// ────────────────────────────────────────────────
const qualifikationen = {
  niedrig: [
    'Führerschein Klasse B, Gabelstaplerschein',
    'Erste-Hilfe-Ausbildung, Englisch Grundkenntnisse',
    'Hygieneschulung, Umgang mit Lebensmitteln',
    'Arbeitssicherheitsschulung, Teamfähigkeit'
  ],
  mittel: [
    'Fließend Englisch (C1), MS Office (Word, Excel, PowerPoint, Outlook)',
    'Projektmanagement-Zertifikat (PRINCE2), Spanisch Grundkenntnisse',
    'SAP-Kenntnisse (Module FI/CO), Führerschein Klasse B',
    'Erste-Hilfe-Ausbildung, Französisch (B2)',
    'ITIL Foundation Zertifikat, Cisco CCNA'
  ],
  hoch: [
    'Fließend Englisch und Französisch (C2), Projektmanagement (PMP-zertifiziert)',
    'Scrum Master Zertifizierung, Product Owner (PSPO), Chinesisch Grundkenntnisse',
    'Six Sigma Green Belt, Lean Management, Spanisch (C1)',
    'Design Thinking Workshop-Leiter, Italienisch fließend',
    'Agile Coach Zertifikat, Change Management'
  ]
};

const itKenntnisse = {
  niedrig: [
    'MS Office Grundkenntnisse, E-Mail-Programme',
    'Warenwirtschaftssysteme, Kassensoftware',
    'Grundlegende PC-Kenntnisse'
  ],
  mittel: [
    'MS Office (sehr gut), Adobe Acrobat, CRM-Systeme (Salesforce)',
    'SAP ERP (FI, CO, MM), SQL Grundkenntnisse',
    'HTML, CSS, WordPress, Google Analytics',
    'Netzwerkverwaltung, Windows Server, Active Directory',
    'AutoCAD, SolidWorks, MS Project'
  ],
  hoch: [
    'Python, Java, JavaScript/TypeScript, React, Node.js',
    'AWS (EC2, S3, Lambda), Docker, Kubernetes, CI/CD',
    'Machine Learning (TensorFlow, PyTorch), Data Science (R, Pandas)',
    'Figma, Adobe Creative Suite (Photoshop, Illustrator, XD)',
    'SQL, NoSQL (MongoDB), PostgreSQL, GraphQL',
    'Agile Tools (Jira, Confluence), Git/GitHub, VS Code'
  ]
};

const softSkills = {
  niedrig: [
    'Zuverlässigkeit, Pünktlichkeit, Teamfähigkeit',
    'Belastbarkeit, Flexibilität, Lernbereitschaft',
    ''
  ],
  mittel: [
    'Teamfähigkeit, Kommunikationsstärke, Problemlösungsfähigkeiten',
    'Organisationstalent, Eigeninitiative, Kundenorientierung',
    'Zeitmanagement, Stressresistenz, Analytisches Denken',
    ''
  ],
  hoch: [
    'Führungsqualitäten, Strategisches Denken, Change Management',
    'Interkulturelle Kompetenz, Verhandlungsgeschick, Innovationsfähigkeit',
    'Empathie, Konfliktlösung, Entscheidungsstärke',
    ''
  ]
};

const interessenPrivat = [
  'Fußball spielen und Bundesliga schauen, Reisen in europäische Städte',
  'Lesen von Kriminalromanen, Kochen internationaler Gerichte, Weinverkostung',
  'Wandern in den Alpen, Bergsteigen, Naturfotografie',
  'Klavierspielen, klassische Konzerte besuchen, Opernaufführungen',
  'Fitness und Krafttraining, Gesunde Ernährung, Marathon laufen',
  'Fotografie (Portrait & Landschaft), Bildbearbeitung, Instagram',
  'Gaming (RPGs, Strategiespiele), E-Sports verfolgen',
  'Gartenarbeit, Gemüseanbau, Nachhaltigkeit, Zero-Waste',
  'Yoga und Meditation, Achtsamkeitstraining, Wellness',
  'Reiten, Pferdepflege, Turniere',
  'Heimwerken und DIY-Projekte, Möbel restaurieren',
  'Ehrenamtliche Arbeit (Tierschutz), Hunde-Training',
  'Theaterbesuche, Kulturveranstaltungen, Lesungen',
  'Radfahren (Rennrad), Triathlon-Training',
  'Podcasts hören (True Crime, Business), Hörbücher',
  'Schach spielen, Brettspiele mit Freunden, Escape Rooms',
  'Tanzen (Salsa, Bachata), Tanzschulen besuchen',
  'Astronomie, Sternbeobachtung, Wissenschaft',
  'Klettern (Boulder & Sportklettern), Outdoor-Aktivitäten',
  'Film und Serien (Kino-Enthusiast), Film-Kritiken schreiben'
];

// ────────────────────────────────────────────────
// Hilfsfunktionen
// ────────────────────────────────────────────────
function zufallsauswahl(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateGeburtsdatum(bildungsgrad) {
  const currentYear = new Date().getFullYear();
  let minAge, maxAge;
  if (bildungsgrad === 'niedrig') { minAge = 25; maxAge = 45; }
  else if (bildungsgrad === 'mittel') { minAge = 27; maxAge = 42; }
  else { minAge = 28; maxAge = 40; }

  const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
  const birthYear = currentYear - age;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;

  return {
    formatted: `${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${birthYear}`,
    birthYear,
    age
  };
}

function generateKonsistenteZeitlinie(geburtsjahr, bildungsgrad, geschlecht, stadt) {
  const currentYear = new Date().getFullYear();
  let timeline = {};

  if (bildungsgrad === 'niedrig') {
    timeline.schulStart = geburtsjahr + 6;
    timeline.schulEnde = timeline.schulStart + 9;
    timeline.schulText = `Hauptschulabschluss (${timeline.schulStart}-${timeline.schulEnde})`;
  } else if (bildungsgrad === 'mittel') {
    timeline.schulStart = geburtsjahr + 6;
    timeline.schulEnde = timeline.schulStart + 10;
    const schultyp = Math.random() > 0.5 ? 'Realschulabschluss' : 'Mittlere Reife';
    timeline.schulText = `${schultyp} (${timeline.schulStart}-${timeline.schulEnde})`;
  } else {
    timeline.schulStart = geburtsjahr + 6;
    timeline.schulEnde = timeline.schulStart + 12;
    timeline.schulText = `Abitur (${timeline.schulStart}-${timeline.schulEnde})`;
  }

  timeline.ausbildungStart = timeline.schulEnde;

  if (bildungsgrad === 'niedrig') {
    const dauer = Math.random() > 0.5 ? 2 : 3;
    timeline.ausbildungEnde = timeline.ausbildungStart + dauer;
    timeline.ausbildungText = zufallsauswahl(bildungswege[bildungsgrad].ausbildungen[geschlecht])
      .replace(/\(\d{4}-\d{4}\)/, `(${timeline.ausbildungStart}-${timeline.ausbildungEnde})`);
  } else if (bildungsgrad === 'mittel') {
    timeline.ausbildungEnde = timeline.ausbildungStart + 3;
    timeline.ausbildungText = zufallsauswahl(bildungswege[bildungsgrad].ausbildungen[geschlecht])
      .replace(/\(\d{4}-\d{4}\)/, `(${timeline.ausbildungStart}-${timeline.ausbildungEnde})`);
  } else {
    const ausbildungVorlage = zufallsauswahl(bildungswege[bildungsgrad].ausbildungen[geschlecht]);
    const dauer = Math.random() > 0.7 ? 4 : 3;
    timeline.ausbildungEnde = timeline.ausbildungStart + dauer;
    timeline.ausbildungText = ausbildungVorlage
      .replace(/\(\d{4}-\d{4}\)/, `(${timeline.ausbildungStart}-${timeline.ausbildungEnde})`);
  }

  timeline.berufStart = timeline.ausbildungEnde;
  const berufVorlage = zufallsauswahl(berufspraxisProfile[bildungsgrad][geschlecht]);
  const stationen = berufVorlage.split('\n');
  let berufspraxisNeu = [];
  let aktuellesJahr = timeline.berufStart;

  for (let i = 0; i < stationen.length; i++) {
    const station = stationen[i];
    if (i === stationen.length - 1) {
      const neueStation = station
        .replace(/(\d{4})-heute/, `${aktuellesJahr}-heute`)
        .replace(/,\s*[A-Za-zäöüÄÖÜß\s]+$/, `, ${stadt}`);
      berufspraxisNeu.push(neueStation);
    } else {
      const dauer = Math.floor(Math.random() * 3) + 2;
      const endeJahr = aktuellesJahr + dauer;
      if (endeJahr > currentYear) break;
      berufspraxisNeu.push(station.replace(/(\d{4})-(\d{4})/, `${aktuellesJahr}-${endeJahr}`));
      aktuellesJahr = endeJahr;
    }
  }

  timeline.berufspraxisText = berufspraxisNeu.join('\n');
  return timeline;
}

// ────────────────────────────────────────────────
// Hauptfunktion
// ────────────────────────────────────────────────
async function generateLebenslauf() {
  const person = zufallsauswahl(personen);
  const bildungsgrad = person.bildungsgrad;
  const geschlecht = person.geschlecht;

  const adresse = zufallsauswahl(adressen);
  const stadt = adresse.ort;
  const strasse = zufallsauswahl(adresse.strassen);

  const staatsangehoerigkeit = zufallsauswahl(staatsangehoerigkeiten);
  const familienstand = zufallsauswahl(familienstaende);
  const geburtsdatumObj = generateGeburtsdatum(bildungsgrad);

  const fotoNum = Math.floor(Math.random() * 5) + 1;
  const fotoDateiname = `${geschlecht}_foto${fotoNum}.jpg`;
  const fotoBase64 = await loadFotoAsBase64(fotoDateiname);

  const timeline = generateKonsistenteZeitlinie(geburtsdatumObj.birthYear, bildungsgrad, geschlecht, stadt);

  const besondereKenntnisseText = zufallsauswahl(qualifikationen[bildungsgrad]);
  const itKenntnisseText = zufallsauswahl(itKenntnisse[bildungsgrad]);
  const softSkillText = zufallsauswahl(softSkills[bildungsgrad]).trim();

  let softSkillsSection = '';
  if (softSkillText) {
    softSkillsSection = `<p style="margin:3px 0; font-size:15px;"><strong>Soft-Skills:</strong> ${softSkillText}</p>`;
  }

  const interessenPrivatText = zufallsauswahl(interessenPrivat);
  const layout = zufallsauswahl(layouts);

  return layout
    .replace(/{vorname}/g, person.vorname)
    .replace(/{name}/g, person.name)
    .replace(/{foto_base64}/g, fotoBase64)
    .replace(/{strasse}/g, strasse)
    .replace(/{plz}/g, adresse.plz)
    .replace(/{ort}/g, adresse.ort)
    .replace(/{geburtsdatum}/g, geburtsdatumObj.formatted)
    .replace(/{staatsangehoerigkeit}/g, staatsangehoerigkeit)
    .replace(/{familienstand}/g, familienstand)
    .replace(/{schulausbildung}/g, timeline.schulText)
    .replace(/{ausbildung}/g, timeline.ausbildungText)
    .replace(/{berufspraxis}/g, timeline.berufspraxisText)
    .replace(/{besondere_kenntnisse}/g, besondereKenntnisseText)
    .replace(/{it_kenntnisse}/g, itKenntnisseText)
    .replace(/{soft_skills_section}/g, softSkillsSection)
    .replace(/{interessen_privat}/g, interessenPrivatText);
}

// ────────────────────────────────────────────────
// Update- und Init-Funktionen
// ────────────────────────────────────────────────
async function updateLebenslauf() {
  const container = document.getElementById('Container');
  if (!container) { console.error("Container nicht gefunden!"); return; }

  container.innerHTML = '<div style="text-align:center; padding:60px 20px; color:#555; font-size:1.1em;">Lebenslauf wird generiert...</div>';
  const html = await generateLebenslauf();
  container.innerHTML = html;
}

async function checkFotoVerfuegbarkeit() {
  const moeglichePfade = ['media/pic/', '../media/pic/', '../../media/pic/', './media/pic/'];
  for (const basePath of moeglichePfade) {
    try {
      const response = await fetch(basePath + 'm_foto1.jpg');
      if (response.ok) { console.log(`✓ Fotos gefunden unter: ${basePath}`); return basePath; }
    } catch (error) { continue; }
  }
  console.warn('⚠ Keine Fotos gefunden - verwende Platzhalter-Avatare');
  return null;
}

function initLebenslaufGenerator() {
  checkFotoVerfuegbarkeit();
  updateLebenslauf();

  const btn = document.getElementById('generate-btn');
  if (btn) {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.textContent = "Wird generiert...";
      await updateLebenslauf();
      btn.disabled = false;
      btn.textContent = "Neuen Lebenslauf generieren";
    });
    console.log("Button initialisiert");
  } else {
    console.error("Button 'generate-btn' nicht gefunden!");
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLebenslaufGenerator);
} else {
  initLebenslaufGenerator();
}