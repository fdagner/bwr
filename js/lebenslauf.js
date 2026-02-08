// js/lebenslauf_improved.js

// ────────────────────────────────────────────────
// Foto-zu-Base64-Konverter
// ────────────────────────────────────────────────
// Cache für Base64-konvertierte Fotos
const fotoCache = {};

async function loadFotoAsBase64(fotoDateiname) {
  // Prüfen ob bereits im Cache
  if (fotoCache[fotoDateiname]) {
    return fotoCache[fotoDateiname];
  }
  
  // Verschiedene Pfade ausprobieren
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
          reader.onloadend = () => {
            const result = reader.result;
            fotoCache[fotoDateiname] = result; // Im Cache speichern
            resolve(result);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        
        console.log(`✓ Foto geladen: ${pfad}`);
        return base64data;
      }
    } catch (error) {
      // Nächsten Pfad versuchen
      continue;
    }
  }
  
  // Alle Pfade fehlgeschlagen - Platzhalter verwenden
  console.warn(`✗ Foto nicht gefunden: ${fotoDateiname} - verwende Platzhalter`);
  return generatePlaceholderImage(fotoDateiname);
}

function generatePlaceholderImage(filename) {
  // Extrahiere Geschlecht und Nummer aus Dateinamen (z.B. "w_foto3.jpg")
  const match = filename.match(/([mw])_foto(\d)/);
  const geschlecht = match ? match[1] : 'm';
  const nummer = match ? parseInt(match[2]) : 1;
  
  // Farbpaletten basierend auf Geschlecht
  const farbpalettenM = [
    { bg: '#3B82F6', text: '#1E3A8A' }, // Blau
    { bg: '#10B981', text: '#065F46' }, // Grün
    { bg: '#F59E0B', text: '#92400E' }, // Orange
    { bg: '#8B5CF6', text: '#5B21B6' }, // Lila
    { bg: '#06B6D4', text: '#164E63' }  // Cyan
  ];
  
  const farbpalettenW = [
    { bg: '#EC4899', text: '#9F1239' }, // Pink
    { bg: '#F59E0B', text: '#92400E' }, // Orange
    { bg: '#8B5CF6', text: '#5B21B6' }, // Lila
    { bg: '#06B6D4', text: '#164E63' }, // Cyan
    { bg: '#10B981', text: '#065F46' }  // Grün
  ];
  
  const paletten = geschlecht === 'm' ? farbpalettenM : farbpalettenW;
  const farben = paletten[(nummer - 1) % paletten.length];
  
  // Initialen basierend auf Geschlecht und Nummer
  const initialenM = ['MK', 'JS', 'TL', 'FW', 'PH'];
  const initialenW = ['AS', 'LM', 'SK', 'EW', 'JB'];
  const initialen = geschlecht === 'm' ? initialenM : initialenW;
  const initiale = initialen[(nummer - 1) % initialen.length];
  
  // SVG-Platzhalter mit Person-Silhouette
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

// 10 verschiedene HTML-Layouts als Templates (mit Platzhaltern)
const layouts = [

  // Layout 1 – Klassisch & seriös (Blau-Töne)
  `
  <div style="font-family: Arial, Helvetica, sans-serif; max-width: 820px; margin: 0 auto; padding: 40px 35px; background: #ffffff; border: 1px solid #c0d4e8; box-shadow: 0 3px 14px rgba(0,0,80,0.08); line-height: 1.48; color: #0f172a;">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 35px;">
      <div>
        <h1 style="margin:0; font-size: 2.5em; font-weight: bold; color: #1e40af; line-height: 1.1;">{vorname} {name}</h1>
        <p style="margin:10px 0 0; font-size: 1.1em; color: #475569;">{strasse}<br>{plz} {ort}</p>
      </div>
      <img src="{foto_base64}" alt="Profilfoto" style="width: 160px; height: 160px; object-fit: cover; border-radius: 50%; border: 4px solid #dbeafe;">
    </div>

    <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 25px 0;">

    <h2 style="font-size: 1.6em; font-weight: bold; margin: 0 0 14px; color: #1e40af; border-bottom: 3px solid #bfdbfe; padding-bottom: 6px;">Persönliche Daten</h2>
    <p style="margin: 8px 0; font-size: 1.05em;">Geburtsdatum: {geburtsdatum}</p>
    <p style="margin: 8px 0; font-size: 1.05em;">Staatsangehörigkeit: {staatsangehoerigkeit}</p>
    <p style="margin: 8px 0; font-size: 1.05em;">Familienstand: {familienstand}</p>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;">

    <h2 style="font-size: 1.6em; font-weight: bold; margin: 0 0 14px; color: #1e40af; border-bottom: 3px solid #bfdbfe; padding-bottom: 6px;">Schulausbildung</h2>
    <p style="margin: 8px 0; font-size: 1.05em;">{schulausbildung}</p>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;">

    <h2 style="font-size: 1.6em; font-weight: bold; margin: 0 0 14px; color: #1e40af; border-bottom: 3px solid #bfdbfe; padding-bottom: 6px;">Ausbildung</h2>
    <p style="margin: 8px 0; font-size: 1.05em;">{ausbildung}</p>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;">

    <h2 style="font-size: 1.6em; font-weight: bold; margin: 0 0 14px; color: #1e40af; border-bottom: 3px solid #bfdbfe; padding-bottom: 6px;">Berufspraxis</h2>
    <p style="margin: 8px 0; font-size: 1.05em; white-space: pre-line;">{berufspraxis}</p>

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;">

    <h2 style="font-size: 1.6em; font-weight: bold; margin: 0 0 14px; color: #1e40af; border-bottom: 3px solid #bfdbfe; padding-bottom: 6px;">Kenntnisse & Qualifikationen</h2>
    <p style="margin: 8px 0; font-size: 1.05em;">{besondere_kenntnisse}</p>
    <p style="margin: 8px 0; font-size: 1.05em;"><strong>IT-Kenntnisse:</strong> {it_kenntnisse}</p>
    {soft_skills_section}

    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0;">

    <h2 style="font-size: 1.6em; font-weight: bold; margin: 0 0 14px; color: #1e40af; border-bottom: 3px solid #bfdbfe; padding-bottom: 6px;">Private Interessen</h2>
    <p style="margin: 8px 0; font-size: 1.05em;">{interessen_privat}</p>
  </div>
  `,

  // Layout 2 – Modern & frisch (Grün-Töne, Sidebar)
  `
  <div style="font-family: 'Segoe UI', system-ui, sans-serif; max-width: 860px; margin: 0 auto; background: #ffffff; border: 1px solid #a7f3d0; box-shadow: 0 4px 16px rgba(0,100,60,0.08); display: flex; min-height: 1050px;">
    <div style="flex: 0 0 320px; background: #f0fdfa; padding: 40px 30px; border-right: 1px solid #99f6e4;">
      <img src="{foto_base64}" alt="Profilfoto" style="width: 100%; max-width: 220px; height: auto; border-radius: 12px; margin: 0 auto 30px; display: block; box-shadow: 0 4px 12px rgba(0,120,80,0.15);">
      
      <h2 style="font-size: 1.55em; font-weight: 700; margin: 0 0 16px; color: #065f46; text-align: center;">{vorname} {name}</h2>
      
      <p style="margin: 6px 0; font-size: 0.98em; color: #374151; text-align: center;">{strasse}<br>{plz} {ort}</p>
      <p style="margin: 6px 0; font-size: 0.98em; color: #374151;">Geburtsdatum: {geburtsdatum}</p>
      <p style="margin: 6px 0; font-size: 0.98em; color: #374151;">Staatsangehörigkeit: {staatsangehoerigkeit}</p>
      <p style="margin: 6px 0; font-size: 0.98em; color: #374151;">Familienstand: {familienstand}</p>

      <hr style="border: none; border-top: 1px solid #6ee7b7; margin: 30px 0;">

      <h3 style="font-size: 1.2em; font-weight: 700; margin: 0 0 12px; color: #065f46;">Qualifikationen</h3>
      <p style="margin: 6px 0; font-size: 0.93em; color: #1f2937; line-height: 1.45;">{besondere_kenntnisse}</p>
      
      <hr style="border: none; border-top: 1px solid #6ee7b7; margin: 25px 0;">

      <h3 style="font-size: 1.2em; font-weight: 700; margin: 0 0 12px; color: #065f46;">Interessen</h3>
      <p style="margin: 6px 0; font-size: 0.93em; color: #1f2937; line-height: 1.45;">{interessen_privat}</p>
    </div>

    <div style="flex: 1; padding: 45px 40px; background: white;">
      <h1 style="margin: 0 0 35px; font-size: 2.3em; font-weight: 700; color: #047857; text-align: center;">Lebenslauf</h1>

      <h2 style="font-size: 1.5em; font-weight: 700; margin: 32px 0 14px; color: #065f46; border-bottom: 3px solid #a7f3d0; padding-bottom: 6px;">Schulausbildung</h2>
      <p style="margin: 8px 0 24px; font-size: 1.05em; line-height: 1.5;">{schulausbildung}</p>

      <h2 style="font-size: 1.5em; font-weight: 700; margin: 32px 0 14px; color: #065f46; border-bottom: 3px solid #a7f3d0; padding-bottom: 6px;">Ausbildung</h2>
      <p style="margin: 8px 0 24px; font-size: 1.05em; line-height: 1.5;">{ausbildung}</p>

      <h2 style="font-size: 1.5em; font-weight: 700; margin: 32px 0 14px; color: #065f46; border-bottom: 3px solid #a7f3d0; padding-bottom: 6px;">Berufspraxis</h2>
      <p style="margin: 8px 0 24px; font-size: 1.05em; line-height: 1.5; white-space: pre-line;">{berufspraxis}</p>

      <h2 style="font-size: 1.5em; font-weight: 700; margin: 32px 0 14px; color: #065f46; border-bottom: 3px solid #a7f3d0; padding-bottom: 6px;">IT-Kenntnisse</h2>
      <p style="margin: 8px 0 24px; font-size: 1.05em;">{it_kenntnisse}</p>

      {soft_skills_section}
    </div>
  </div>
  `,

  // Layout 3 – Warm & elegant (Terracotta / Gold-Töne)
  `
  <div style="font-family: 'Helvetica Neue', Georgia, serif; max-width: 820px; margin: 0 auto; padding: 50px 40px; background: #fffaf0; border: 1px solid #fed7aa; border-radius: 8px; box-shadow: 0 6px 20px rgba(120,50,20,0.08); color: #1f2937; line-height: 1.55;">
    <div style="text-align: center; margin-bottom: 45px;">
      <img src="{foto_base64}" alt="Profilfoto" style="width: 180px; height: 180px; object-fit: cover; border-radius: 50%; border: 5px solid #fee2d5; box-shadow: 0 6px 18px rgba(120,50,20,0.12); margin-bottom: 20px;">
      <h1 style="margin: 0; font-size: 2.7em; font-weight: 700; color: #9f1239;">{vorname} {name}</h1>
      <p style="margin: 12px 0 6px; font-size: 1.1em; color: #4b5563;">{strasse} • {plz} {ort}</p>
      <p style="margin: 4px 0; color: #4b5563; font-size: 1em;">
        Geburtsdatum: {geburtsdatum} • {staatsangehoerigkeit} • {familienstand}
      </p>
    </div>

    <hr style="border: none; border-top: 2px solid #f9a8d4; margin: 35px 0;">

    <h2 style="font-size: 1.8em; font-weight: 700; text-align: center; margin: 0 0 28px; color: #9f1239; border-bottom: 2px solid #fdba74; padding-bottom: 8px;">Werdegang</h2>

    <div style="margin: 0 0 30px;">
      <h3 style="display: block; font-size: 1.28em; font-weight: 700; margin: 0 0 10px; color: #7c2d12;">Schulausbildung</h3>
      <p style="margin: 0 0 28px; padding-left: 20px; border-left: 4px solid #fdba74; font-size: 1.03em;">{schulausbildung}</p>

      <h3 style="display: block; font-size: 1.28em; font-weight: 700; margin: 32px 0 10px; color: #7c2d12;">Ausbildung</h3>
      <p style="margin: 0 0 28px; padding-left: 20px; border-left: 4px solid #fdba74; font-size: 1.03em;">{ausbildung}</p>

      <h3 style="display: block; font-size: 1.28em; font-weight: 700; margin: 32px 0 10px; color: #7c2d12;">Berufspraxis</h3>
      <p style="margin: 0 0 28px; padding-left: 20px; border-left: 4px solid #fdba74; font-size: 1.03em; white-space: pre-line;">{berufspraxis}</p>
    </div>

    <hr style="border: none; border-top: 1px solid #fed7aa; margin: 40px 0;">

    <h2 style="font-size: 1.65em; font-weight: 700; margin: 0 0 20px; color: #9f1239; border-bottom: 2px solid #fdba74; padding-bottom: 8px;">Kompetenzen</h2>
    <p style="margin: 12px 0; font-size: 1.05em;"><strong>Qualifikationen:</strong> {besondere_kenntnisse}</p>
    <p style="margin: 12px 0; font-size: 1.05em;"><strong>IT-Kenntnisse:</strong> {it_kenntnisse}</p>
    {soft_skills_section}

    <hr style="border: none; border-top: 1px solid #fed7aa; margin: 40px 0;">

    <h2 style="font-size: 1.65em; font-weight: 700; margin: 0 0 20px; color: #9f1239; border-bottom: 2px solid #fdba74; padding-bottom: 8px;">Interessen</h2>
    <p style="margin: 12px 0; font-size: 1.05em;">{interessen_privat}</p>
  </div>
  `,

  // Layout 4 – Minimalistisch & professionell (Grau-Töne)
  `
  <div style="font-family: 'Calibri', sans-serif; max-width: 800px; margin: 0 auto; padding: 50px 45px; background: #ffffff; border-left: 6px solid #374151; box-shadow: 0 2px 12px rgba(0,0,0,0.06); color: #1f2937; line-height: 1.6;">
    <div style="display: flex; gap: 40px; margin-bottom: 40px; align-items: center;">
      <img src="{foto_base64}" alt="Profilfoto" style="width: 150px; height: 150px; object-fit: cover; border-radius: 4px; border: 3px solid #e5e7eb;">
      <div style="flex: 1;">
        <h1 style="margin: 0 0 12px; font-size: 2.6em; font-weight: 700; color: #111827; letter-spacing: -0.5px;">{vorname} {name}</h1>
        <p style="margin: 4px 0; font-size: 1.05em; color: #6b7280;">{strasse}, {plz} {ort}</p>
        <p style="margin: 4px 0; font-size: 1.05em; color: #6b7280;">Geboren: {geburtsdatum} | {staatsangehoerigkeit} | {familienstand}</p>
      </div>
    </div>

    <div style="border-top: 2px solid #e5e7eb; padding-top: 30px;">
      <h2 style="font-size: 1.4em; font-weight: 700; margin: 0 0 16px; color: #374151; text-transform: uppercase; letter-spacing: 1px;">Schulausbildung</h2>
      <p style="margin: 0 0 30px; font-size: 1.05em; color: #4b5563;">{schulausbildung}</p>

      <h2 style="font-size: 1.4em; font-weight: 700; margin: 0 0 16px; color: #374151; text-transform: uppercase; letter-spacing: 1px;">Ausbildung</h2>
      <p style="margin: 0 0 30px; font-size: 1.05em; color: #4b5563;">{ausbildung}</p>

      <h2 style="font-size: 1.4em; font-weight: 700; margin: 0 0 16px; color: #374151; text-transform: uppercase; letter-spacing: 1px;">Berufspraxis</h2>
      <p style="margin: 0 0 30px; font-size: 1.05em; color: #4b5563; white-space: pre-line;">{berufspraxis}</p>

      <h2 style="font-size: 1.4em; font-weight: 700; margin: 0 0 16px; color: #374151; text-transform: uppercase; letter-spacing: 1px;">Qualifikationen</h2>
      <p style="margin: 0 0 12px; font-size: 1.05em; color: #4b5563;">{besondere_kenntnisse}</p>
      <p style="margin: 0 0 30px; font-size: 1.05em; color: #4b5563;"><strong>IT:</strong> {it_kenntnisse}</p>
      {soft_skills_section}

      <h2 style="font-size: 1.4em; font-weight: 700; margin: 0 0 16px; color: #374151; text-transform: uppercase; letter-spacing: 1px;">Interessen</h2>
      <p style="margin: 0; font-size: 1.05em; color: #4b5563;">{interessen_privat}</p>
    </div>
  </div>
  `,

  // Layout 5 – Kreativ & modern (Lila/Violett-Töne)
  `
  <div style="font-family: 'Inter', 'Trebuchet MS', sans-serif; max-width: 850px; margin: 0 auto; background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); padding: 45px; border-radius: 16px; box-shadow: 0 8px 24px rgba(126,34,206,0.12); color: #1f2937;">
    <div style="text-align: center; margin-bottom: 40px;">
      <img src="{foto_base64}" alt="Profilfoto" style="width: 170px; height: 170px; object-fit: cover; border-radius: 50%; border: 5px solid #c084fc; box-shadow: 0 4px 16px rgba(168,85,247,0.25); margin-bottom: 20px;">
      <h1 style="margin: 0 0 8px; font-size: 2.8em; font-weight: 800; color: #6b21a8; text-shadow: 1px 1px 2px rgba(107,33,168,0.1);">{vorname} {name}</h1>
      <p style="margin: 6px 0; font-size: 1.1em; color: #7c3aed;">{strasse} • {plz} {ort}</p>
      <p style="margin: 6px 0; font-size: 0.98em; color: #6b7280;">{geburtsdatum} • {staatsangehoerigkeit} • {familienstand}</p>
    </div>

    <div style="background: white; padding: 35px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <div style="margin-bottom: 32px;">
        <h2 style="font-size: 1.6em; font-weight: 700; margin: 0 0 4px; color: #7c3aed; display: inline-block; border-bottom: 3px solid #c084fc; padding-bottom: 4px;">Schulausbildung</h2>
        <p style="margin: 12px 0 0; font-size: 1.05em; line-height: 1.6;">{schulausbildung}</p>
      </div>

      <div style="margin-bottom: 32px;">
        <h2 style="font-size: 1.6em; font-weight: 700; margin: 0 0 4px; color: #7c3aed; display: inline-block; border-bottom: 3px solid #c084fc; padding-bottom: 4px;">Ausbildung</h2>
        <p style="margin: 12px 0 0; font-size: 1.05em; line-height: 1.6;">{ausbildung}</p>
      </div>

      <div style="margin-bottom: 32px;">
        <h2 style="font-size: 1.6em; font-weight: 700; margin: 0 0 4px; color: #7c3aed; display: inline-block; border-bottom: 3px solid #c084fc; padding-bottom: 4px;">Berufspraxis</h2>
        <p style="margin: 12px 0 0; font-size: 1.05em; line-height: 1.6; white-space: pre-line;">{berufspraxis}</p>
      </div>

      <div style="margin-bottom: 32px;">
        <h2 style="font-size: 1.6em; font-weight: 700; margin: 0 0 4px; color: #7c3aed; display: inline-block; border-bottom: 3px solid #c084fc; padding-bottom: 4px;">Kompetenzen</h2>
        <p style="margin: 12px 0 8px; font-size: 1.05em; line-height: 1.6;">{besondere_kenntnisse}</p>
        <p style="margin: 8px 0; font-size: 1.05em; line-height: 1.6;"><strong>IT-Kenntnisse:</strong> {it_kenntnisse}</p>
        {soft_skills_section}
      </div>

      <div>
        <h2 style="font-size: 1.6em; font-weight: 700; margin: 0 0 4px; color: #7c3aed; display: inline-block; border-bottom: 3px solid #c084fc; padding-bottom: 4px;">Interessen</h2>
        <p style="margin: 12px 0 0; font-size: 1.05em; line-height: 1.6;">{interessen_privat}</p>
      </div>
    </div>
  </div>
  `,

  // Layout 6 – Zeitstrahl-Design (Türkis-Töne)
  `
  <div style="font-family: 'Verdana', sans-serif; max-width: 840px; margin: 0 auto; padding: 45px 40px; background: #ffffff; border: 1px solid #5eead4; box-shadow: 0 4px 18px rgba(20,184,166,0.1); color: #0f172a; line-height: 1.55;">
    <div style="display: flex; align-items: center; gap: 35px; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 3px solid #99f6e4;">
      <img src="{foto_base64}" alt="Profilfoto" style="width: 165px; height: 165px; object-fit: cover; border-radius: 12px; border: 4px solid #2dd4bf; box-shadow: 0 4px 12px rgba(45,212,191,0.2);">
      <div style="flex: 1;">
        <h1 style="margin: 0 0 10px; font-size: 2.6em; font-weight: 700; color: #0f766e;">{vorname} {name}</h1>
        <p style="margin: 5px 0; font-size: 1.08em; color: #334155;">{strasse}, {plz} {ort}</p>
        <p style="margin: 5px 0; font-size: 1.02em; color: #475569;">{geburtsdatum} • {staatsangehoerigkeit} • {familienstand}</p>
      </div>
    </div>

    <div style="position: relative; padding-left: 35px; border-left: 4px solid #5eead4;">
      <div style="margin-bottom: 35px;">
        <div style="position: absolute; left: -9px; width: 14px; height: 14px; background: #14b8a6; border-radius: 50%; border: 3px solid white;"></div>
        <h2 style="font-size: 1.5em; font-weight: 700; margin: 0 0 12px; color: #0f766e;">Schulausbildung</h2>
        <p style="margin: 0; font-size: 1.05em; color: #334155;">{schulausbildung}</p>
      </div>

      <div style="margin-bottom: 35px;">
        <div style="position: absolute; left: -9px; width: 14px; height: 14px; background: #14b8a6; border-radius: 50%; border: 3px solid white;"></div>
        <h2 style="font-size: 1.5em; font-weight: 700; margin: 0 0 12px; color: #0f766e;">Ausbildung</h2>
        <p style="margin: 0; font-size: 1.05em; color: #334155;">{ausbildung}</p>
      </div>

      <div style="margin-bottom: 35px;">
        <div style="position: absolute; left: -9px; width: 14px; height: 14px; background: #14b8a6; border-radius: 50%; border: 3px solid white;"></div>
        <h2 style="font-size: 1.5em; font-weight: 700; margin: 0 0 12px; color: #0f766e;">Berufspraxis</h2>
        <p style="margin: 0; font-size: 1.05em; color: #334155; white-space: pre-line;">{berufspraxis}</p>
      </div>
    </div>

    <hr style="border: none; border-top: 2px solid #99f6e4; margin: 35px 0;">

    <div style="margin-bottom: 30px;">
      <h2 style="font-size: 1.5em; font-weight: 700; margin: 0 0 12px; color: #0f766e;">Qualifikationen & Kenntnisse</h2>
      <p style="margin: 8px 0; font-size: 1.05em; color: #334155;">{besondere_kenntnisse}</p>
      <p style="margin: 8px 0; font-size: 1.05em; color: #334155;"><strong>IT-Kenntnisse:</strong> {it_kenntnisse}</p>
      {soft_skills_section}
    </div>

    <div>
      <h2 style="font-size: 1.5em; font-weight: 700; margin: 0 0 12px; color: #0f766e;">Private Interessen</h2>
      <p style="margin: 0; font-size: 1.05em; color: #334155;">{interessen_privat}</p>
    </div>
  </div>
  `,

  // Layout 7 – Corporate Business (Dunkelblau/Gold)
  `
  <div style="font-family: 'Times New Roman', serif; max-width: 850px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 2px;">
    <div style="background: #ffffff; color: #0f172a; padding: 50px 45px;">
      <div style="border: 3px solid #0f172a; padding: 40px; background: linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%);">
        <div style="text-align: center; border-bottom: 3px double #d4af37; padding-bottom: 25px; margin-bottom: 35px;">
          <img src="{foto_base64}" alt="Profilfoto" style="width: 140px; height: 140px; object-fit: cover; border-radius: 50%; border: 4px solid #d4af37; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 2.8em; font-weight: 700; color: #0f172a; letter-spacing: 2px;">{vorname} {name}</h1>
          <p style="margin: 12px 0 0; font-size: 1.1em; color: #475569; font-style: italic;">{strasse} • {plz} {ort}</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 30px; padding: 20px; background: #f1f5f9; border-left: 4px solid #d4af37;">
          <p style="margin: 4px 0;"><strong>Geboren:</strong> {geburtsdatum}</p>
          <p style="margin: 4px 0;"><strong>Nationalität:</strong> {staatsangehoerigkeit}</p>
          <p style="margin: 4px 0;"><strong>Familienstand:</strong> {familienstand}</p>
        </div>

        <h2 style="font-size: 1.6em; font-weight: 700; margin: 30px 0 16px; color: #0f172a; border-bottom: 2px solid #d4af37; padding-bottom: 8px;">Schulausbildung</h2>
        <p style="margin: 0 0 25px; line-height: 1.6;">{schulausbildung}</p>

        <h2 style="font-size: 1.6em; font-weight: 700; margin: 30px 0 16px; color: #0f172a; border-bottom: 2px solid #d4af37; padding-bottom: 8px;">Ausbildung</h2>
        <p style="margin: 0 0 25px; line-height: 1.6;">{ausbildung}</p>

        <h2 style="font-size: 1.6em; font-weight: 700; margin: 30px 0 16px; color: #0f172a; border-bottom: 2px solid #d4af37; padding-bottom: 8px;">Berufspraxis</h2>
        <p style="margin: 0 0 25px; line-height: 1.6; white-space: pre-line;">{berufspraxis}</p>

        <h2 style="font-size: 1.6em; font-weight: 700; margin: 30px 0 16px; color: #0f172a; border-bottom: 2px solid #d4af37; padding-bottom: 8px;">Qualifikationen</h2>
        <p style="margin: 0 0 10px; line-height: 1.6;">{besondere_kenntnisse}</p>
        <p style="margin: 0 0 25px; line-height: 1.6;"><strong>IT:</strong> {it_kenntnisse}</p>
        {soft_skills_section}

        <h2 style="font-size: 1.6em; font-weight: 700; margin: 30px 0 16px; color: #0f172a; border-bottom: 2px solid #d4af37; padding-bottom: 8px;">Interessen</h2>
        <p style="margin: 0; line-height: 1.6;">{interessen_privat}</p>
      </div>
    </div>
  </div>
  `,

  // Layout 8 – Zweispaltig Modern (Orange/Grau)
  `
  <div style="font-family: 'Arial', sans-serif; max-width: 900px; margin: 0 auto; background: #ffffff; box-shadow: 0 0 30px rgba(0,0,0,0.1); display: grid; grid-template-columns: 350px 1fr;">
    <div style="background: linear-gradient(180deg, #fb923c 0%, #f97316 100%); padding: 45px 35px; color: #ffffff;">
      <img src="{foto_base64}" alt="Profilfoto" style="width: 100%; max-width: 240px; border-radius: 16px; border: 5px solid rgba(255,255,255,0.3); margin-bottom: 30px; display: block;">
      
      <h1 style="margin: 0 0 8px; font-size: 2.2em; font-weight: 700; color: #ffffff; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">{vorname}</h1>
      <h2 style="margin: 0 0 25px; font-size: 1.8em; font-weight: 700; color: #fff7ed; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">{name}</h2>
      
      <div style="background: rgba(255,255,255,0.15); padding: 20px; border-radius: 12px; margin-bottom: 30px; backdrop-filter: blur(10px);">
        <h3 style="margin: 0 0 12px; font-size: 1.2em; font-weight: 700; color: #fff7ed;">Kontakt</h3>
        <p style="margin: 6px 0; font-size: 0.95em; line-height: 1.5;">{strasse}<br>{plz} {ort}</p>
      </div>

      <div style="background: rgba(255,255,255,0.15); padding: 20px; border-radius: 12px; margin-bottom: 30px; backdrop-filter: blur(10px);">
        <h3 style="margin: 0 0 12px; font-size: 1.2em; font-weight: 700; color: #fff7ed;">Persönliches</h3>
        <p style="margin: 6px 0; font-size: 0.95em;">{geburtsdatum}</p>
        <p style="margin: 6px 0; font-size: 0.95em;">{staatsangehoerigkeit}</p>
        <p style="margin: 6px 0; font-size: 0.95em;">{familienstand}</p>
      </div>

      <div style="background: rgba(255,255,255,0.15); padding: 20px; border-radius: 12px; backdrop-filter: blur(10px);">
        <h3 style="margin: 0 0 12px; font-size: 1.2em; font-weight: 700; color: #fff7ed;">Interessen</h3>
        <p style="margin: 0; font-size: 0.93em; line-height: 1.5;">{interessen_privat}</p>
      </div>
    </div>

    <div style="padding: 45px 40px; background: #fafafa;">
      <h2 style="font-size: 1.8em; font-weight: 700; margin: 0 0 20px; color: #ea580c; border-left: 5px solid #fb923c; padding-left: 15px;">Schulausbildung</h2>
      <p style="margin: 0 0 30px; font-size: 1.05em; line-height: 1.6; color: #404040;">{schulausbildung}</p>

      <h2 style="font-size: 1.8em; font-weight: 700; margin: 0 0 20px; color: #ea580c; border-left: 5px solid #fb923c; padding-left: 15px;">Ausbildung</h2>
      <p style="margin: 0 0 30px; font-size: 1.05em; line-height: 1.6; color: #404040;">{ausbildung}</p>

      <h2 style="font-size: 1.8em; font-weight: 700; margin: 0 0 20px; color: #ea580c; border-left: 5px solid #fb923c; padding-left: 15px;">Berufspraxis</h2>
      <p style="margin: 0 0 30px; font-size: 1.05em; line-height: 1.6; color: #404040; white-space: pre-line;">{berufspraxis}</p>

      <h2 style="font-size: 1.8em; font-weight: 700; margin: 0 0 20px; color: #ea580c; border-left: 5px solid #fb923c; padding-left: 15px;">Kenntnisse</h2>
      <p style="margin: 0 0 12px; font-size: 1.05em; line-height: 1.6; color: #404040;">{besondere_kenntnisse}</p>
      <p style="margin: 0 0 30px; font-size: 1.05em; line-height: 1.6; color: #404040;"><strong>IT:</strong> {it_kenntnisse}</p>
      {soft_skills_section}
    </div>
  </div>
  `,

  // Layout 9 – Schlicht & Elegant (Bordeaux/Creme)
  `
  <div style="font-family: 'Garamond', 'Georgia', serif; max-width: 820px; margin: 0 auto; background: #fefce8; padding: 55px 50px; border: 8px solid #881337; box-shadow: inset 0 0 0 2px #fef3c7, 0 8px 24px rgba(136,19,55,0.15);">
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="margin: 0 0 5px; font-size: 3em; font-weight: 400; color: #881337; font-variant: small-caps; letter-spacing: 3px;">{vorname} {name}</h1>
      <div style="width: 100px; height: 2px; background: #be123c; margin: 15px auto;"></div>
      <p style="margin: 15px 0 8px; font-size: 1.1em; color: #78350f;">{strasse}</p>
      <p style="margin: 0; font-size: 1.1em; color: #78350f;">{plz} {ort}</p>
    </div>

    <div style="text-align: center; margin-bottom: 35px;">
      <img src="{foto_base64}" alt="Profilfoto" style="width: 155px; height: 155px; object-fit: cover; border-radius: 50%; border: 5px solid #881337; box-shadow: 0 0 0 3px #fef3c7;">
    </div>

    <div style="background: #fffbeb; padding: 20px 30px; border-left: 4px solid #be123c; margin-bottom: 30px;">
      <p style="margin: 8px 0; font-size: 1.05em; color: #292524;"><strong>Geburtsdatum:</strong> {geburtsdatum}</p>
      <p style="margin: 8px 0; font-size: 1.05em; color: #292524;"><strong>Staatsangehörigkeit:</strong> {staatsangehoerigkeit}</p>
      <p style="margin: 8px 0; font-size: 1.05em; color: #292524;"><strong>Familienstand:</strong> {familienstand}</p>
    </div>

    <h2 style="font-size: 1.7em; font-weight: 400; margin: 35px 0 18px; color: #881337; font-variant: small-caps; letter-spacing: 2px; text-align: center; border-top: 2px solid #be123c; border-bottom: 2px solid #be123c; padding: 12px 0;">Schulausbildung</h2>
    <p style="margin: 0 0 30px; font-size: 1.08em; line-height: 1.7; text-align: justify; color: #292524;">{schulausbildung}</p>

    <h2 style="font-size: 1.7em; font-weight: 400; margin: 35px 0 18px; color: #881337; font-variant: small-caps; letter-spacing: 2px; text-align: center; border-top: 2px solid #be123c; border-bottom: 2px solid #be123c; padding: 12px 0;">Ausbildung</h2>
    <p style="margin: 0 0 30px; font-size: 1.08em; line-height: 1.7; text-align: justify; color: #292524;">{ausbildung}</p>

    <h2 style="font-size: 1.7em; font-weight: 400; margin: 35px 0 18px; color: #881337; font-variant: small-caps; letter-spacing: 2px; text-align: center; border-top: 2px solid #be123c; border-bottom: 2px solid #be123c; padding: 12px 0;">Berufspraxis</h2>
    <p style="margin: 0 0 30px; font-size: 1.08em; line-height: 1.7; text-align: justify; color: #292524; white-space: pre-line;">{berufspraxis}</p>

    <h2 style="font-size: 1.7em; font-weight: 400; margin: 35px 0 18px; color: #881337; font-variant: small-caps; letter-spacing: 2px; text-align: center; border-top: 2px solid #be123c; border-bottom: 2px solid #be123c; padding: 12px 0;">Qualifikationen</h2>
    <p style="margin: 0 0 12px; font-size: 1.08em; line-height: 1.7; text-align: justify; color: #292524;">{besondere_kenntnisse}</p>
    <p style="margin: 0 0 30px; font-size: 1.08em; line-height: 1.7; text-align: justify; color: #292524;"><strong>IT-Kenntnisse:</strong> {it_kenntnisse}</p>
    {soft_skills_section}

    <h2 style="font-size: 1.7em; font-weight: 400; margin: 35px 0 18px; color: #881337; font-variant: small-caps; letter-spacing: 2px; text-align: center; border-top: 2px solid #be123c; border-bottom: 2px solid #be123c; padding: 12px 0;">Interessen</h2>
    <p style="margin: 0; font-size: 1.08em; line-height: 1.7; text-align: justify; color: #292524;">{interessen_privat}</p>
  </div>
  `,

  // Layout 10 – Tech/Startup Style (Cyan/Schwarz)
  `
  <div style="font-family: 'Courier New', monospace; max-width: 880px; margin: 0 auto; background: #0a0a0a; color: #00ffff; padding: 3px; box-shadow: 0 0 30px rgba(0,255,255,0.3);">
    <div style="background: #1a1a1a; padding: 45px 40px; border: 1px solid #00ffff;">
      <div style="border: 2px dashed #00ffff; padding: 35px; background: rgba(0,255,255,0.03);">
        <div style="display: flex; gap: 40px; align-items: center; margin-bottom: 35px; padding-bottom: 25px; border-bottom: 2px solid #00ffff;">
          <img src="{foto_base64}" alt="Profilfoto" style="width: 160px; height: 160px; object-fit: cover; border: 3px solid #00ffff; filter: grayscale(30%) contrast(120%);">
          <div style="flex: 1;">
            <h1 style="margin: 0 0 10px; font-size: 2.5em; font-weight: 700; color: #00ffff; text-shadow: 0 0 10px rgba(0,255,255,0.5); font-family: 'Courier New', monospace;">&gt; {vorname} {name}</h1>
            <p style="margin: 6px 0; font-size: 1.05em; color: #00ff88;">📍 {strasse}, {plz} {ort}</p>
            <p style="margin: 6px 0; font-size: 1.05em; color: #00ff88;">📅 {geburtsdatum} | 🌍 {staatsangehoerigkeit} | 💼 {familienstand}</p>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 1.6em; font-weight: 700; margin: 0 0 12px; color: #00ffff; font-family: 'Courier New', monospace;">&gt;&gt; Schulausbildung</h2>
          <p style="margin: 0 0 25px; padding-left: 25px; border-left: 3px solid #00ff88; font-size: 1.05em; line-height: 1.6; color: #e0e0e0;">{schulausbildung}</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 1.6em; font-weight: 700; margin: 0 0 12px; color: #00ffff; font-family: 'Courier New', monospace;">&gt;&gt; Ausbildung</h2>
          <p style="margin: 0 0 25px; padding-left: 25px; border-left: 3px solid #00ff88; font-size: 1.05em; line-height: 1.6; color: #e0e0e0;">{ausbildung}</p>
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 1.6em; font-weight: 700; margin: 0 0 12px; color: #00ffff; font-family: 'Courier New', monospace;">&gt;&gt; Berufspraxis</h2>
          <p style="margin: 0 0 25px; padding-left: 25px; border-left: 3px solid #00ff88; font-size: 1.05em; line-height: 1.6; color: #e0e0e0; white-space: pre-line;">{berufspraxis}</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 30px;">
          <div style="background: rgba(0,255,255,0.05); padding: 20px; border: 1px solid #00ffff;">
            <h3 style="margin: 0 0 12px; font-size: 1.3em; color: #00ffff;">⚡ Skills</h3>
            <p style="margin: 0; font-size: 0.98em; line-height: 1.5; color: #e0e0e0;">{besondere_kenntnisse}</p>
          </div>
          <div style="background: rgba(0,255,255,0.05); padding: 20px; border: 1px solid #00ffff;">
            <h3 style="margin: 0 0 12px; font-size: 1.3em; color: #00ffff;">💻 Tech Stack</h3>
            <p style="margin: 0; font-size: 0.98em; line-height: 1.5; color: #e0e0e0;">{it_kenntnisse}</p>
          </div>
        </div>

        {soft_skills_section}

        <div style="background: rgba(0,255,136,0.05); padding: 20px; border: 1px solid #00ff88; margin-top: 25px;">
          <h3 style="margin: 0 0 12px; font-size: 1.3em; color: #00ff88;">🎯 Interessen</h3>
          <p style="margin: 0; font-size: 0.98em; line-height: 1.5; color: #e0e0e0;">{interessen_privat}</p>
        </div>
      </div>
    </div>
  </div>
  `
];

// ────────────────────────────────────────────────
// Personendaten mit realistischen Profilen
// ────────────────────────────────────────────────
const personen = [
  { vorname: 'Max', name: 'Mustermann', geschlecht: 'm', bildungsgrad: 'mittel' },
  { vorname: 'Anna', name: 'Musterfrau', geschlecht: 'w', bildungsgrad: 'hoch' },
  { vorname: 'Lukas', name: 'Schmidt', geschlecht: 'm', bildungsgrad: 'hoch' },
  { vorname: 'Sophia', name: 'Müller', geschlecht: 'w', bildungsgrad: 'mittel' },
  { vorname: 'Felix', name: 'Fischer', geschlecht: 'm', bildungsgrad: 'mittel' },
  { vorname: 'Emma', name: 'Weber', geschlecht: 'w', bildungsgrad: 'hoch' },
  { vorname: 'Noah', name: 'Meyer', geschlecht: 'm', bildungsgrad: 'niedrig' },
  { vorname: 'Mia', name: 'Wagner', geschlecht: 'w', bildungsgrad: 'mittel' },
  { vorname: 'Ben', name: 'Becker', geschlecht: 'm', bildungsgrad: 'mittel' },
  { vorname: 'Lea', name: 'Schulz', geschlecht: 'w', bildungsgrad: 'hoch' },
  { vorname: 'Paul', name: 'Hoffmann', geschlecht: 'm', bildungsgrad: 'hoch' },
  { vorname: 'Laura', name: 'Bauer', geschlecht: 'w', bildungsgrad: 'mittel' },
  { vorname: 'David', name: 'Richter', geschlecht: 'm', bildungsgrad: 'hoch' },
  { vorname: 'Sarah', name: 'Klein', geschlecht: 'w', bildungsgrad: 'mittel' },
  { vorname: 'Leon', name: 'Wolf', geschlecht: 'm', bildungsgrad: 'niedrig' },
  { vorname: 'Hannah', name: 'Schröder', geschlecht: 'w', bildungsgrad: 'hoch' },
  { vorname: 'Julian', name: 'Neumann', geschlecht: 'm', bildungsgrad: 'mittel' },
  { vorname: 'Lena', name: 'Schwarz', geschlecht: 'w', bildungsgrad: 'hoch' },
  { vorname: 'Tim', name: 'Braun', geschlecht: 'm', bildungsgrad: 'niedrig' },
  { vorname: 'Julia', name: 'Hofmann', geschlecht: 'w', bildungsgrad: 'mittel' },
  { vorname: 'Jonas', name: 'König', geschlecht: 'm', bildungsgrad: 'mittel' },
  { vorname: 'Marie', name: 'Krause', geschlecht: 'w', bildungsgrad: 'hoch' },
  { vorname: 'Elias', name: 'Lange', geschlecht: 'm', bildungsgrad: 'mittel' },
  { vorname: 'Charlotte', name: 'Schmitt', geschlecht: 'w', bildungsgrad: 'hoch' }
];

// Adressdaten
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
  { plz: '01067', ort: 'Dresden', strassen: ['Prager Straße 2', 'Wilsdruffer Straße 20', 'Neumarkt 12'] }
];

// Weitere persönliche Daten
const staatsangehoerigkeiten = ['Deutsch', 'Österreichisch', 'Schweizerisch'];
const familienstaende = ['Ledig', 'Verheiratet', 'Geschieden', 'In Partnerschaft'];

// ────────────────────────────────────────────────
// Bildungswege (realistisch nach Bildungsgrad)
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
        'Ausbildung zum Veranstaltungskaufmann bei Live Nation (2016-2019)',
        'Ausbildung zum Immobilienkaufmann bei Engel & Völkers (2015-2018)',
        'Ausbildung zum Mediengestalter Digital/Print bei der Agentur Scholz & Friends (2014-2017)',
        'Ausbildung zum Fachinformatiker für Anwendungsentwicklung bei SAP (2016-2019)',
        'Ausbildung zum Kaufmann im Gesundheitswesen bei der AOK (2015-2018)',
        'Ausbildung zum Automobilkaufmann bei Mercedes-Benz (2014-2017)',
        'Ausbildung zum Rechtsanwaltsfachangestellten in der Kanzlei Freshfields (2013-2016)',
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
        'Ausbildung zur Veranstaltungskauffrau bei Live Nation (2016-2019)',
        'Ausbildung zur Immobilienkauffrau bei Engel & Völkers (2015-2018)',
        'Ausbildung zur Mediengestalterin Digital/Print bei der Agentur Scholz & Friends (2014-2017)',
        'Ausbildung zur Fachinformatikerin für Anwendungsentwicklung bei SAP (2016-2019)',
        'Ausbildung zur Kauffrau im Gesundheitswesen bei der AOK (2015-2018)',
        'Ausbildung zur Automobilkauffrau bei Mercedes-Benz (2014-2017)',
        'Ausbildung zur Rechtsanwaltsfachangestellten in der Kanzlei Freshfields (2013-2016)',
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
        'Bachelor of Arts in Mediendesign, HTW Berlin (2016-2019)',
        'Master in Marketing, Uni Köln (2019-2021)',
        'Bachelor in Rechtswissenschaften, Uni Frankfurt (2014-2018)',
        'Master of Science in Data Science, TU München (2018-2020)',
        'Bachelor in Architektur, Uni Stuttgart (2015-2019)',
        'Ausbildung zum Fachinformatiker + Weiterbildung zum geprüften IT-Projektleiter IHK (2013-2016 + 2017-2019)',
        'Industriemeister Metall IHK nach Ausbildung zum Industriemechaniker (2014-2017 + 2018-2020)',
        'Ausbildung zum Bankkaufmann + Bankfachwirt-Weiterbildung (2013-2016 + 2017-2019)',
        'Ausbildung zum Steuerfachangestellten + Steuerfachwirt (2014-2017 + 2018-2020)',
        'Master of Business Administration (MBA), WHU Koblenz (2019-2021)',
        'Technischer Betriebswirt IHK nach Mechatroniker-Ausbildung (2015-2018 + 2019-2021)',
        'Bachelor of Laws, Uni Heidelberg (2014-2018)',
        'Master in International Management, ESMT Berlin (2018-2020)',
        'Geprüfter Handelsfachwirt IHK + Betriebswirt VWA (2015-2017 + 2018-2020)',
        'Bachelor in Kommunikationsdesign, Hochschule München (2016-2019)'
      ],
      w: [
        'Bachelor of Science in Informatik, TU Berlin (2014-2017)',
        'Bachelor of Arts in Betriebswirtschaft, LMU München (2015-2018)',
        'Bachelor of Engineering in Maschinenbau, RWTH Aachen (2016-2019)',
        'Master of Science in Wirtschaftsinformatik, Uni Mannheim (2018-2020)',
        'Bachelor in Psychologie, Uni Hamburg (2015-2018)',
        'Bachelor of Arts in Mediendesign, HTW Berlin (2016-2019)',
        'Master in Marketing, Uni Köln (2019-2021)',
        'Bachelor in Rechtswissenschaften, Uni Frankfurt (2014-2018)',
        'Master of Science in Data Science, TU München (2018-2020)',
        'Bachelor in Architektur, Uni Stuttgart (2015-2019)',
        'Ausbildung zur Fachinformatikerin + Weiterbildung zur geprüften IT-Projektleiterin IHK (2013-2016 + 2017-2019)',
        'Industriemeisterin Metall IHK nach Ausbildung zur Industriemechanikerin (2014-2017 + 2018-2020)',
        'Ausbildung zur Bankkauffrau + Bankfachwirtin-Weiterbildung (2013-2016 + 2017-2019)',
        'Ausbildung zur Steuerfachangestellten + Steuerfachwirtin (2014-2017 + 2018-2020)',
        'Master of Business Administration (MBA), WHU Koblenz (2019-2021)',
        'Technische Betriebswirtin IHK nach Mechatronikerin-Ausbildung (2015-2018 + 2019-2021)',
        'Bachelor of Laws, Uni Heidelberg (2014-2018)',
        'Master in International Management, ESMT Berlin (2018-2020)',
        'Geprüfte Handelsfachwirtin IHK + Betriebswirtin VWA (2015-2017 + 2018-2020)',
        'Bachelor in Kommunikationsdesign, Hochschule München (2016-2019)'
      ]
    }
  }
};

// ────────────────────────────────────────────────
// Berufspraxis-Profile (realistisch strukturiert)
// ────────────────────────────────────────────────
const berufspraxisProfile = {
  niedrig: {
    m: [
      '2014-2016: Verkäufer bei REWE, München\n2016-2019: Schichtleiter bei Netto, München\n2019-heute: Filialleiter bei Penny, Augsburg',
      '2015-2017: Lagerhelfer bei Amazon, Leipzig\n2017-2020: Staplerfahrer bei DHL, Leipzig\n2020-heute: Teamleiter Logistik bei Hermes, Halle',
      '2017-2019: Küchenhilfe im Restaurant "Zur Post", Berlin\n2019-2022: Koch im Hotel Adlon, Berlin\n2022-heute: Souschef im Restaurant "Facil", Berlin',
      '2016-2018: Maler bei Malerbetrieb Schmidt, Hamburg\n2018-2021: Vorarbeiter bei Farben Fischer GmbH, Hamburg\n2021-heute: Selbstständiger Malermeister, Hamburg',
      '2015-2017: Reinigungskraft bei ISS Facility Services, Frankfurt\n2017-2020: Objektleiter bei Kötter Services, Frankfurt\n2020-heute: Bereichsleiter Gebäudereinigung, Frankfurt',
      '2016-2018: Bäckergeselle in der Bäckerei Müller, Nürnberg\n2018-2021: Schichtleiter bei Hofpfisterei, München\n2021-heute: Filialleiter bei BackWerk, München',
      '2017-2019: Fleischergeselle bei REWE, Köln\n2019-2022: Fleischereifachverkäufer bei EDEKA, Köln\n2022-heute: Abteilungsleiter Fleisch/Wurst bei Kaufland, Bonn',
      '2015-2017: Gärtnerhelfer bei der Stadt München\n2017-2020: Gärtner im Botanischen Garten, München\n2020-heute: Garten- und Landschaftsbauer (selbstständig), München',
      '2018-2020: Dachdeckergeselle bei Wagner, Berlin\n2020-2023: Vorarbeiter bei Dachbau GmbH, Berlin\n2023-heute: Dachdeckermeister (selbstständig), Berlin',
      '2017-2019: Tischlergeselle in der Schreinerei Bauer, Stuttgart\n2019-2022: Möbeltischler bei IKEA Industry, Stuttgart\n2022-heute: Werkstattleiter bei Tischlerei Schmid, Stuttgart',
      '2016-2019: Altenpflegehelfer im Seniorenheim St. Anna, Leipzig\n2019-2022: Altenpfleger im Pflegeheim Augustinum, Leipzig\n2022-heute: Wohnbereichsleitung im Altenheim Pro Seniore, Leipzig',
      '2018-2020: Metallbauer bei Schlosserei Hoffmann, Dortmund\n2020-2023: Konstruktionsmechaniker bei ThyssenKrupp, Dortmund\n2023-heute: Schweißfachmann bei SMS Group, Düsseldorf',
      '2017-2019: KFZ-Mechatroniker bei ATU, Frankfurt\n2019-2022: Werkstattmeister bei Bosch Car Service, Frankfurt\n2022-heute: Serviceleiter bei Mercedes-Benz, Frankfurt',
      '2015-2017: Lagerist bei DHL, Hamburg\n2017-2020: Lagerfachkraft bei Tchibo Logistik, Hamburg\n2020-heute: Lagerleiter bei Zalando, Hamburg'
    ],
    w: [
      '2014-2016: Verkäuferin bei REWE, München\n2016-2019: Schichtleiterin bei Netto, München\n2019-heute: Filialleiterin bei Penny, Augsburg',
      '2015-2017: Lagerhelferin bei Amazon, Leipzig\n2017-2020: Lagerfachkraft bei DHL, Leipzig\n2020-heute: Teamleiterin Logistik bei Hermes, Halle',
      '2017-2019: Küchenhilfe im Restaurant "Zur Post", Berlin\n2019-2022: Köchin im Hotel Adlon, Berlin\n2022-heute: Souschefin im Restaurant "Facil", Berlin',
      '2015-2017: Reinigungskraft bei ISS Facility Services, Frankfurt\n2017-2020: Objektleiterin bei Kötter Services, Frankfurt\n2020-heute: Bereichsleiterin Gebäudereinigung, Frankfurt',
      '2014-2016: Friseurgesellin bei Friseur Klier, Stuttgart\n2016-2019: Friseurmeisterin bei Essanelle, Stuttgart\n2019-heute: Salonleiterin bei Intercoiffure, Stuttgart',
      '2016-2018: Bäckerin in der Bäckerei Müller, Nürnberg\n2018-2021: Schichtleiterin bei Hofpfisterei, München\n2021-heute: Filialleiterin bei BackWerk, München',
      '2016-2018: Servicekraft im Hotel Maritim, Hamburg\n2018-2021: Restaurantfachfrau im Vier Jahreszeiten, Hamburg\n2021-heute: Restaurantleiterin im Hotel Atlantic, Hamburg',
      '2016-2019: Altenpflegehelferin im Seniorenheim St. Anna, Leipzig\n2019-2022: Altenpflegerin im Pflegeheim Augustinum, Leipzig\n2022-heute: Wohnbereichsleitung im Altenheim Pro Seniore, Leipzig',
      '2015-2017: Commis de Cuisine im Hotel Adlon, Berlin\n2017-2020: Demi Chef de Partie im Restaurant Tim Raue, Berlin\n2020-heute: Chef de Partie im Lorenz Adlon Esszimmer, Berlin',
      '2014-2016: Floristin bei Blumen Risse, Hamburg\n2016-2019: Floristmeisterin bei Blume 2000, Hamburg\n2019-heute: Geschäftsführerin eigener Blumenladen, Hamburg',
      '2015-2017: Fachverkäuferin bei EDEKA, Köln\n2017-2020: Abteilungsleiterin Feinkost bei REWE, Köln\n2020-heute: Marktleiterin bei Bio Company, Bonn'
    ]
  },
  mittel: {
    m: [
      '2016-2018: Sachbearbeiter bei der Sparkasse Nürnberg\n2018-2021: Kundenberater bei der Volksbank Stuttgart\n2021-heute: Teamleiter Kundenservice bei der Commerzbank Frankfurt',
      '2017-2019: IT-Support bei der Stadt Köln\n2019-2022: Systemadministrator bei Bayer AG, Leverkusen\n2022-heute: Senior IT-Administrator bei BASF, Ludwigshafen',
      '2016-2019: Industriekaufmann bei Siemens, München\n2019-2021: Einkäufer bei BMW, München\n2021-heute: Senior Einkäufer bei Audi, Ingolstadt',
      '2018-2020: Gesundheits- und Krankenpfleger im Klinikum Nürnberg\n2020-2023: Stationsleiter im Universitätsklinikum Erlangen\n2023-heute: Pflegedienstleiter im Krankenhaus Fürth',
      '2019-2021: Junior Entwickler bei SAP, Walldorf\n2021-2023: Software Developer bei Microsoft, München\n2023-heute: Senior Developer bei Google, München',
      '2017-2019: Steuerfachangestellter bei KPMG, Frankfurt\n2019-2022: Steuerberater bei PwC, Frankfurt\n2022-heute: Senior Steuerberater bei EY, Frankfurt',
      '2018-2020: Rezeptionist im Hotel Adlon, Berlin\n2020-2022: Front Office Manager im Hotel Vier Jahreszeiten, Hamburg\n2022-heute: Hoteldirektor im Kempinski Hotel, München',
      '2016-2018: Sachbearbeiter Logistik bei DHL, Leipzig\n2018-2021: Disponent bei Schenker, Leipzig\n2021-heute: Logistikleiter bei DB Schenker, Dresden',
      '2019-2021: Event Manager bei Live Nation, Berlin\n2021-2023: Senior Event Manager bei Eventim, Hamburg\n2023-heute: Head of Events bei Coachella Europe, Berlin',
      '2018-2020: Immobilienmakler bei Engel & Völkers, München\n2020-2022: Teamleiter Vertrieb bei RE/MAX, München\n2022-heute: Niederlassungsleiter bei JLL, München',
      '2017-2019: Mediengestalter bei Scholz & Friends, Berlin\n2019-2022: Art Director bei Jung von Matt, Hamburg\n2022-heute: Creative Director bei Serviceplan, München',
      '2019-2021: Anwendungsentwickler bei SAP, Walldorf\n2021-2023: Full-Stack Developer bei Wirecard, München\n2023-heute: Lead Developer bei N26, Berlin',
      '2017-2019: Verkaufsberater bei Mercedes-Benz, Stuttgart\n2019-2021: Flottenmanager bei BMW, München\n2021-heute: Verkaufsleiter bei Porsche, Stuttgart',
      '2018-2020: Versicherungskaufmann bei der Allianz, München\n2020-2022: Gruppenleiter Vertrieb bei der AXA, Köln\n2022-heute: Agenturleiter bei der Generali, Stuttgart',
      '2019-2021: Recruiter bei Randstad, Hamburg\n2021-2023: Senior Recruiter bei Hays, Berlin\n2023-heute: Teamleiter Recruiting bei Adecco, Frankfurt',
      '2017-2019: Bankkaufmann bei der Deutschen Bank, Frankfurt\n2019-2021: Firmenkundenbetreuer bei der Commerzbank, Frankfurt\n2021-heute: Senior Relationship Manager bei der DZ Bank, Frankfurt',
      '2018-2020: Netzwerkadministrator bei Telekom, Bonn\n2020-2023: IT-Projektleiter bei Vodafone, Düsseldorf\n2023-heute: IT-Manager bei O2 Telefónica, München',
      '2016-2018: Elektroniker bei Bosch, Stuttgart\n2018-2021: Inbetriebnahme-Ingenieur bei Siemens, Erlangen\n2021-heute: Technischer Projektleiter bei ABB, Mannheim'
    ],
    w: [
      '2016-2018: Sachbearbeiterin bei der Sparkasse Nürnberg\n2018-2021: Kundenberaterin bei der Volksbank Stuttgart\n2021-heute: Teamleiterin Kundenservice bei der Commerzbank Frankfurt',
      '2017-2019: IT-Support bei der Stadt Köln\n2019-2022: Systemadministratorin bei Bayer AG, Leverkusen\n2022-heute: Senior IT-Administratorin bei BASF, Ludwigshafen',
      '2016-2019: Industriekauffrau bei Siemens, München\n2019-2021: Einkäuferin bei BMW, München\n2021-heute: Senior Einkäuferin bei Audi, Ingolstadt',
      '2018-2020: Gesundheits- und Krankenpflegerin im Klinikum Nürnberg\n2020-2023: Stationsleiterin im Universitätsklinikum Erlangen\n2023-heute: Pflegedienstleiterin im Krankenhaus Fürth',
      '2019-2021: Junior Entwicklerin bei SAP, Walldorf\n2021-2023: Software Developerin bei Microsoft, München\n2023-heute: Senior Developerin bei Google, München',
      '2017-2019: Steuerfachangestellte bei KPMG, Frankfurt\n2019-2022: Steuerberaterin bei PwC, Frankfurt\n2022-heute: Senior Steuerberaterin bei EY, Frankfurt',
      '2018-2020: Rezeptionistin im Hotel Adlon, Berlin\n2020-2022: Front Office Managerin im Hotel Vier Jahreszeiten, Hamburg\n2022-heute: Hoteldirektorin im Kempinski Hotel, München',
      '2016-2018: Sachbearbeiterin Logistik bei DHL, Leipzig\n2018-2021: Disponentin bei Schenker, Leipzig\n2021-heute: Logistikleiterin bei DB Schenker, Dresden',
      '2019-2021: Event Managerin bei Live Nation, Berlin\n2021-2023: Senior Event Managerin bei Eventim, Hamburg\n2023-heute: Head of Events bei Coachella Europe, Berlin',
      '2018-2020: Immobilienmaklerin bei Engel & Völkers, München\n2020-2022: Teamleiterin Vertrieb bei RE/MAX, München\n2022-heute: Niederlassungsleiterin bei JLL, München',
      '2017-2019: Mediengestalterin bei Scholz & Friends, Berlin\n2019-2022: Art Directorin bei Jung von Matt, Hamburg\n2022-heute: Creative Directorin bei Serviceplan, München',
      '2019-2021: Anwendungsentwicklerin bei SAP, Walldorf\n2021-2023: Full-Stack Developerin bei Wirecard, München\n2023-heute: Lead Developerin bei N26, Berlin',
      '2018-2020: Sachbearbeiterin bei der AOK, Stuttgart\n2020-2022: Produktmanagerin Krankenkasse bei der Techniker, Hamburg\n2022-heute: Bereichsleiterin Versicherungen bei der Barmer, Berlin',
      '2017-2019: Verkaufsberaterin bei Mercedes-Benz, Stuttgart\n2019-2021: Flottenmanagerin bei BMW, München\n2021-heute: Verkaufsleiterin bei Porsche, Stuttgart',
      '2016-2018: Rechtsanwaltsfachangestellte bei Freshfields, Frankfurt\n2018-2021: Paralegal bei Linklaters, Frankfurt\n2021-heute: Senior Legal Assistant bei Baker McKenzie, München',
      '2018-2020: Versicherungskauffrau bei der Allianz, München\n2020-2022: Gruppenleiterin Vertrieb bei der AXA, Köln\n2022-heute: Agenturl eiterin bei der Generali, Stuttgart',
      '2019-2021: Recruiterin bei Randstad, Hamburg\n2021-2023: Senior Recruiterin bei Hays, Berlin\n2023-heute: Teamleiterin Recruiting bei Adecco, Frankfurt',
      '2017-2019: Bankkauffrau bei der Deutschen Bank, Frankfurt\n2019-2021: Firmenkundenbetreuerin bei der Commerzbank, Frankfurt\n2021-heute: Senior Relationship Managerin bei der DZ Bank, Frankfurt'
    ]
  },
  hoch: {
    // Die meisten High-Level Berufe sind geschlechtsneutral, aber einige brauchen angepasste Versionen
    m: [
      '2017-2019: Trainee bei McKinsey, München\n2019-2022: Junior Consultant bei Boston Consulting Group, Berlin\n2022-heute: Senior Consultant bei Deloitte, Frankfurt',
      '2018-2020: Junior Software Engineer bei Amazon, Berlin\n2020-2022: Software Engineer bei Google, München\n2022-heute: Senior Software Engineer & Team Lead bei Meta, München',
      '2019-2021: Produktmanager bei Zalando, Berlin\n2021-2023: Senior Product Manager bei N26, Berlin\n2023-heute: Head of Product bei Delivery Hero, Berlin',
      '2018-2020: Marketing Manager bei Adidas, Herzogenaurach\n2020-2023: Senior Marketing Manager bei Puma, Herzogenaurach\n2023-heute: Director of Marketing bei Under Armour, Amsterdam',
      '2020-2022: UX Designer bei Spotify, Berlin\n2022-2024: Senior UX/UI Designer bei Adobe, Hamburg\n2024-heute: Lead Designer bei Figma, Berlin',
      '2019-2021: IT-Projektleiter bei Siemens, München\n2021-2023: Senior IT-Projektleiter bei SAP, Walldorf\n2023-heute: Head of IT Projects bei BMW, München',
      '2020-2022: Industriemeister bei Bosch, Stuttgart\n2022-2024: Produktionsleiter bei Daimler, Stuttgart\n2024-heute: Werksleiter bei Porsche, Zuffenhausen',
      '2019-2021: Filialleiter bei der Deutschen Bank, Hamburg\n2021-2023: Abteilungsleiter Private Banking bei der Commerzbank, Frankfurt\n2023-heute: Bereichsleiter Wealth Management bei der DZ Bank, Frankfurt',
      '2020-2022: Steuerberater bei Deloitte, München\n2022-2024: Senior Manager Tax bei KPMG, Frankfurt\n2024-heute: Partner bei PwC, Berlin',
      '2018-2020: Business Analyst bei McKinsey, Düsseldorf\n2020-2022: Engagement Manager bei BCG, München\n2022-heute: Principal bei Bain & Company, Frankfurt',
      '2019-2021: Data Scientist bei SAP, Walldorf\n2021-2023: Senior Data Scientist bei Amazon, München\n2023-heute: Lead Data Scientist bei Google, Berlin',
      '2020-2022: Architekt bei gmp Architekten, Hamburg\n2022-2024: Projektleiter bei Foster + Partners, Berlin\n2024-heute: Partner bei BIG - Bjarke Ingels Group, München',
      '2019-2021: Rechtsanwalt bei Freshfields, Frankfurt\n2021-2023: Senior Associate bei Linklaters, München\n2023-heute: Counsel bei White & Case, Berlin',
      '2018-2020: Investment Analyst bei Goldman Sachs, Frankfurt\n2020-2022: Associate bei Morgan Stanley, München\n2022-heute: Vice President bei JP Morgan, Frankfurt',
      '2020-2022: Unternehmensberater bei Roland Berger, München\n2022-2024: Senior Consultant bei Accenture, Frankfurt\n2024-heute: Managing Consultant bei Capgemini, Berlin',
      '2019-2021: Product Owner bei BMW, München\n2021-2023: Senior Product Owner bei Audi, Ingolstadt\n2023-heute: Director Product Management bei Porsche, Stuttgart',
      '2018-2020: Psychologe in eigener Praxis, Hamburg\n2020-2022: Leitender Psychologe am UKE Hamburg\n2022-heute: Chefarzt Psychosomatik im Asklepios Klinikum, Hamburg',
      '2020-2022: Designer bei MetaDesign, Berlin\n2022-2024: Creative Lead bei Interbrand, München\n2024-heute: Executive Creative Director bei Scholz & Friends, Hamburg',
      '2019-2021: Supply Chain Manager bei Amazon, Leipzig\n2021-2023: Head of Logistics bei Zalando, Berlin\n2023-heute: VP Operations bei Delivery Hero, Berlin',
      '2018-2020: Researcher bei Max-Planck-Institut, München\n2020-2022: Senior Researcher bei Fraunhofer Institut, Stuttgart\n2022-heute: Abteilungsleiter Forschung bei BASF, Ludwigshafen'
    ],
    w: [
      '2017-2019: Trainee bei McKinsey, München\n2019-2022: Junior Consultant bei Boston Consulting Group, Berlin\n2022-heute: Senior Consultant bei Deloitte, Frankfurt',
      '2018-2020: Junior Software Engineer bei Amazon, Berlin\n2020-2022: Software Engineer bei Google, München\n2022-heute: Senior Software Engineer & Team Lead bei Meta, München',
      '2019-2021: Produktmanagerin bei Zalando, Berlin\n2021-2023: Senior Product Managerin bei N26, Berlin\n2023-heute: Head of Product bei Delivery Hero, Berlin',
      '2018-2020: Marketing Managerin bei Adidas, Herzogenaurach\n2020-2023: Senior Marketing Managerin bei Puma, Herzogenaurach\n2023-heute: Director of Marketing bei Under Armour, Amsterdam',
      '2020-2022: UX Designerin bei Spotify, Berlin\n2022-2024: Senior UX/UI Designerin bei Adobe, Hamburg\n2024-heute: Lead Designerin bei Figma, Berlin',
      '2019-2021: IT-Projektleiterin bei Siemens, München\n2021-2023: Senior IT-Projektleiterin bei SAP, Walldorf\n2023-heute: Head of IT Projects bei BMW, München',
      '2020-2022: Industriemeisterin bei Bosch, Stuttgart\n2022-2024: Produktionsleiterin bei Daimler, Stuttgart\n2024-heute: Werksleiterin bei Porsche, Zuffenhausen',
      '2019-2021: Filialleiterin bei der Deutschen Bank, Hamburg\n2021-2023: Abteilungsleiterin Private Banking bei der Commerzbank, Frankfurt\n2023-heute: Bereichsleiterin Wealth Management bei der DZ Bank, Frankfurt',
      '2020-2022: Steuerberaterin bei Deloitte, München\n2022-2024: Senior Managerin Tax bei KPMG, Frankfurt\n2024-heute: Partnerin bei PwC, Berlin',
      '2018-2020: Business Analystin bei McKinsey, Düsseldorf\n2020-2022: Engagement Managerin bei BCG, München\n2022-heute: Principal bei Bain & Company, Frankfurt',
      '2019-2021: Data Scientist bei SAP, Walldorf\n2021-2023: Senior Data Scientist bei Amazon, München\n2023-heute: Lead Data Scientist bei Google, Berlin',
      '2020-2022: Architektin bei gmp Architekten, Hamburg\n2022-2024: Projektleiterin bei Foster + Partners, Berlin\n2024-heute: Partnerin bei BIG - Bjarke Ingels Group, München',
      '2019-2021: Rechtsanwältin bei Freshfields, Frankfurt\n2021-2023: Senior Associate bei Linklaters, München\n2023-heute: Counsel bei White & Case, Berlin',
      '2018-2020: Investment Analystin bei Goldman Sachs, Frankfurt\n2020-2022: Associate bei Morgan Stanley, München\n2022-heute: Vice President bei JP Morgan, Frankfurt',
      '2020-2022: Unternehmensberaterin bei Roland Berger, München\n2022-2024: Senior Consultant bei Accenture, Frankfurt\n2024-heute: Managing Consultant bei Capgemini, Berlin',
      '2019-2021: Product Owner bei BMW, München\n2021-2023: Senior Product Owner bei Audi, Ingolstadt\n2023-heute: Director Product Management bei Porsche, Stuttgart',
      '2018-2020: Psychologin in eigener Praxis, Hamburg\n2020-2022: Leitende Psychologin am UKE Hamburg\n2022-heute: Chefärztin Psychosomatik im Asklepios Klinikum, Hamburg',
      '2020-2022: Designerin bei MetaDesign, Berlin\n2022-2024: Creative Lead bei Interbrand, München\n2024-heute: Executive Creative Director bei Scholz & Friends, Hamburg',
      '2019-2021: Supply Chain Managerin bei Amazon, Leipzig\n2021-2023: Head of Logistics bei Zalando, Berlin\n2023-heute: VP Operations bei Delivery Hero, Berlin',
      '2018-2020: Researcherin bei Max-Planck-Institut, München\n2020-2022: Senior Researcherin bei Fraunhofer Institut, Stuttgart\n2022-heute: Abteilungsleiterin Forschung bei BASF, Ludwigshafen'
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
    'Kreativität, Visionäres Denken, Mentoring',
    ''
  ]
};

// ────────────────────────────────────────────────
// Private Interessen (vielfältiger und realistischer)
// ────────────────────────────────────────────────
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
  const currentYear = new Date().getFullYear(); // Dynamisch aktuelles Jahr ermitteln
  // Realistische Altersverteilung basierend auf Bildungsgrad
  let minAge, maxAge;
  
  if (bildungsgrad === 'niedrig') {
    minAge = 25;
    maxAge = 45;
  } else if (bildungsgrad === 'mittel') {
    minAge = 27;
    maxAge = 42;
  } else { // hoch
    minAge = 28;
    maxAge = 40;
  }
  
  const age = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
  const birthYear = currentYear - age;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  
  return {
    formatted: `${day.toString().padStart(2, '0')}.${month.toString().padStart(2, '0')}.${birthYear}`,
    birthYear: birthYear,
    age: age
  };
}

function generateKonsistenteZeitlinie(geburtsjahr, bildungsgrad, geschlecht, stadt) {
  const currentYear = new Date().getFullYear();
  let timeline = {};
  
  // Schulbildung
  if (bildungsgrad === 'niedrig') {
    timeline.schulStart = geburtsjahr + 6;
    timeline.schulEnde = timeline.schulStart + 9;
    timeline.schulText = `Hauptschulabschluss (${timeline.schulStart}-${timeline.schulEnde})`;
  } else if (bildungsgrad === 'mittel') {
    timeline.schulStart = geburtsjahr + 6;
    timeline.schulEnde = timeline.schulStart + 10;
    const schultyp = Math.random() > 0.5 ? 'Realschulabschluss' : 'Mittlere Reife';
    timeline.schulText = `${schultyp} (${timeline.schulStart}-${timeline.schulEnde})`;
  } else { // hoch
    timeline.schulStart = geburtsjahr + 6;
    timeline.schulEnde = timeline.schulStart + 12;
    timeline.schulText = `Abitur (${timeline.schulStart}-${timeline.schulEnde})`;
  }
  
  // Ausbildung/Studium
  timeline.ausbildungStart = timeline.schulEnde;
  
  if (bildungsgrad === 'niedrig') {
    const dauer = Math.random() > 0.5 ? 2 : 3;
    timeline.ausbildungEnde = timeline.ausbildungStart + dauer;
    timeline.ausbildungText = zufallsauswahl(bildungswege[bildungsgrad].ausbildungen[geschlecht])
      .replace(/\(\d{4}-\d{4}\)/, `(${timeline.ausbildungStart}-${timeline.ausbildungEnde})`);
  } else if (bildungsgrad === 'mittel') {
    const dauer = Math.random() > 0.5 ? 3 : 3.5;
    timeline.ausbildungEnde = timeline.ausbildungStart + Math.floor(dauer);
    timeline.ausbildungText = zufallsauswahl(bildungswege[bildungsgrad].ausbildungen[geschlecht])
      .replace(/\(\d{4}-\d{4}\)/, `(${timeline.ausbildungStart}-${timeline.ausbildungEnde})`);
  } else { // hoch
    const ausbildungVorlage = zufallsauswahl(bildungswege[bildungsgrad].ausbildungen[geschlecht]);
    
    if (ausbildungVorlage.includes('+')) {
      const erstausbildung = timeline.ausbildungStart;
      const erstausbildungEnde = erstausbildung + 3;
      const weiterbildungEnde = erstausbildungEnde + 2;
      timeline.ausbildungEnde = weiterbildungEnde;
      timeline.ausbildungText = ausbildungVorlage
        .replace(/\((\d{4})-(\d{4}) \+ (\d{4})-(\d{4})\)/, 
          `(${erstausbildung}-${erstausbildungEnde} + ${erstausbildungEnde}-${weiterbildungEnde})`);
    } else {
      const dauer = Math.random() > 0.7 ? 4 : 3;
      timeline.ausbildungEnde = timeline.ausbildungStart + dauer;
      timeline.ausbildungText = ausbildungVorlage
        .replace(/\(\d{4}-\d{4}\)/, `(${timeline.ausbildungStart}-${timeline.ausbildungEnde})`);
    }
  }
  
  // Berufspraxis - WICHTIG: Verwende die übergebene Stadt!
  timeline.berufStart = timeline.ausbildungEnde;
  const berufVorlage = zufallsauswahl(berufspraxisProfile[bildungsgrad][geschlecht]);
  
  const stationen = berufVorlage.split('\n');
  let berufspraxisNeu = [];
  let aktuellesJahr = timeline.berufStart;
  
  for (let i = 0; i < stationen.length; i++) {
    const station = stationen[i];
    
    if (i === stationen.length - 1) {
      // Letzte Station mit der gewählten Stadt!
      const neueStation = station
        .replace(/(\d{4})-heute/, `${aktuellesJahr}-heute`)
        .replace(/,\s*[A-Za-zäöüÄÖÜß\s]+$/, `, ${stadt}`); // Ersetze Stadt am Ende
      berufspraxisNeu.push(neueStation);
    } else {
      const dauer = Math.floor(Math.random() * 3) + 2;
      const endeJahr = aktuellesJahr + dauer;
      
      if (endeJahr > currentYear) {
        break;
      }
      
      const neueStation = station.replace(/(\d{4})-(\d{4})/, `${aktuellesJahr}-${endeJahr}`);
      berufspraxisNeu.push(neueStation);
      aktuellesJahr = endeJahr;
    }
  }
  
  timeline.berufspraxisText = berufspraxisNeu.join('\n');
  
  return timeline;
}

function generateSchulausbildung(bildungsgrad) {
  const schule = zufallsauswahl(bildungswege[bildungsgrad].schulen);
  return `${schule.text} an der Schule ${schule.ort} (${schule.jahre})`;
}

// ────────────────────────────────────────────────
// Hauptfunktion
// ────────────────────────────────────────────────
async function generateLebenslauf() {
  // Person auswählen
  const person = zufallsauswahl(personen);
  const bildungsgrad = person.bildungsgrad;
  const geschlecht = person.geschlecht;
  
  // EINE Stadt für Wohnadresse UND Arbeitgeber!
  const adresse = zufallsauswahl(adressen);
  const stadt = adresse.ort;
  const strasse = zufallsauswahl(adresse.strassen);
  
  // Persönliche Daten
  const staatsangehoerigkeit = zufallsauswahl(staatsangehoerigkeiten);
  const familienstand = zufallsauswahl(familienstaende);
  const geburtsdatumObj = generateGeburtsdatum(bildungsgrad);
  const geburtsdatum = geburtsdatumObj.formatted;
  
  // Foto - als Base64 laden
  const fotoNum = Math.floor(Math.random() * 5) + 1;
  const fotoDateiname = `${geschlecht}_foto${fotoNum}.jpg`;
  const fotoBase64 = await loadFotoAsBase64(fotoDateiname);
  
  // Bildungsweg - konsistente Zeitlinie mit derselben Stadt!
  const timeline = generateKonsistenteZeitlinie(geburtsdatumObj.birthYear, bildungsgrad, geschlecht, stadt);
  const schulausbildungText = timeline.schulText;
  const ausbildungText = timeline.ausbildungText;
  const berufspraxisText = timeline.berufspraxisText;
  
  // Kenntnisse
  const besondereKenntnisseText = zufallsauswahl(qualifikationen[bildungsgrad]);
  const itKenntnisseText = zufallsauswahl(itKenntnisse[bildungsgrad]);
  const softSkillText = zufallsauswahl(softSkills[bildungsgrad]).trim();
  
  // Soft-Skills-Sektion (nur wenn vorhanden)
  let softSkillsSection = '';
  if (softSkillText) {
    softSkillsSection = `<p style="margin: 8px 0; font-size: 1.05em;"><strong>Soft-Skills:</strong> ${softSkillText}</p>`;
  }
  
  // Interessen
  const interessenPrivatText = zufallsauswahl(interessenPrivat);
  
  // Layout auswählen
  const layout = zufallsauswahl(layouts);
  
  // HTML generieren
  let html = layout
    .replace(/{vorname}/g, person.vorname)
    .replace(/{name}/g, person.name)
    .replace(/{foto_base64}/g, fotoBase64)
    .replace(/{strasse}/g, strasse)
    .replace(/{plz}/g, adresse.plz)
    .replace(/{ort}/g, adresse.ort)
    .replace(/{geburtsdatum}/g, geburtsdatum)
    .replace(/{staatsangehoerigkeit}/g, staatsangehoerigkeit)
    .replace(/{familienstand}/g, familienstand)
    .replace(/{schulausbildung}/g, schulausbildungText)
    .replace(/{ausbildung}/g, ausbildungText)
    .replace(/{berufspraxis}/g, berufspraxisText)
    .replace(/{besondere_kenntnisse}/g, besondereKenntnisseText)
    .replace(/{it_kenntnisse}/g, itKenntnisseText)
    .replace(/{soft_skills_section}/g, softSkillsSection)
    .replace(/{interessen_privat}/g, interessenPrivatText);
  
  return html;
}

// ────────────────────────────────────────────────
// Update- und Init-Funktionen
// ────────────────────────────────────────────────
async function updateLebenslauf() {
  const container = document.getElementById('Container');
  if (!container) {
    console.error("Container nicht gefunden!");
    return;
  }

  container.innerHTML = '<div style="text-align:center; padding:60px 20px; color:#555; font-size:1.1em;">Lebenslauf wird generiert...</div>';

  // Async warten auf Foto-Laden
  const html = await generateLebenslauf();
  container.innerHTML = html;
}

async function checkFotoVerfuegbarkeit() {
  console.log('🔍 Prüfe Foto-Verfügbarkeit...');
  
  const testFotos = ['m_foto1.jpg', 'w_foto1.jpg'];
  const moeglichePfade = [
    'media/pic/',
    '../media/pic/',
    '../../media/pic/',
    './media/pic/'
  ];
  
  for (const basePath of moeglichePfade) {
    try {
      const response = await fetch(basePath + testFotos[0]);
      if (response.ok) {
        console.log(`✓ Fotos gefunden unter: ${basePath}`);
        return basePath;
      }
    } catch (error) {
      continue;
    }
  }
  
  console.warn('⚠ Keine Fotos gefunden - verwende Platzhalter-Avatare');
  return null;
}

function initLebenslaufGenerator() {
  // Prüfe Foto-Verfügbarkeit beim Start
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