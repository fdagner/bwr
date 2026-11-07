(function () {
  const NEWS_FILE = 'news.md';

  const track = document.getElementById('newsTrack');
  const dotsBox = document.getElementById('newsDots');
  const root = document.getElementById('news');
  if (!track || !root) return;

  const TYP = { neu: 'Neu', update: 'Update', info: 'Info' };
  const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Inline-Markdown: erst HTML escapen, dann **fett** und [Text](url)
  const inline = s => esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');

  const fmt = iso => {
    const d = new Date(iso);
    return isNaN(d) ? iso : d.toLocaleDateString('de-DE',
      { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  function parse(md) {
     md = md.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
    return md.split(/^##\s+/m).slice(1).map(block => {
      const lines = block.split('\n');
      const [datum, ...rest] = lines.shift().split('|').map(s => s.trim());
      const titel = rest.join('|');
      const punkte = lines
        .map(l => l.match(/^\s*[-*]\s+\[(\w+)\]\s+(.+)$/))
        .filter(Boolean)
        .map(m => ({ typ: m[1].toLowerCase(), html: inline(m[2]) }));
      return { datum, titel, punkte };
    }).filter(n => n.punkte.length);
  }

  function render(NEWS) {
    track.innerHTML = NEWS.map(n => `
      <article class="news-card">
        <div class="news-meta"><time datetime="${n.datum}">${fmt(n.datum)}</time></div>
        ${n.titel ? `<h3>${esc(n.titel)}</h3>` : ''}
        <ul class="news-list">
          ${n.punkte.map(p => `
            <li>
              <span class="news-badge ${TYP[p.typ] ? p.typ : 'info'}">${TYP[p.typ] || 'Info'}</span>
              <div>${p.html}</div>
            </li>`).join('')}
        </ul>
      </article>`).join('');

    dotsBox.innerHTML = NEWS.map((_, i) =>
      `<button type="button" class="news-dot" aria-label="Neuigkeit ${i + 1}" data-i="${i}"></button>`
    ).join('');
    const dots = [...dotsBox.children];

    const count = NEWS.length;
    const index = () => Math.round(track.scrollLeft / track.clientWidth);
    const goTo = i => track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
    const next = () => goTo((index() + 1) % count);
    const prev = () => goTo((index() - 1 + count) % count);

    function updateHeight() {
  const card = track.children[Math.min(index(), count - 1)];
  if (card) track.style.height = card.offsetHeight + 'px';
}

    function updateDots() {
  const i = Math.min(index(), count - 1);
  dots.forEach((d, k) => d.classList.toggle('active', k === i));
  updateHeight();
}
track.addEventListener('scroll', updateDots, { passive: true });
window.addEventListener('resize', updateDots);

// Höhe nachführen, wenn sich eine Karte ändert (Schrift lädt nach, Umbruch bei anderer Breite)
if ('ResizeObserver' in window) {
  const ro = new ResizeObserver(updateHeight);
  [...track.children].forEach(c => ro.observe(c));
}
updateDots();

    root.querySelector('.news-next').addEventListener('click', next);
    root.querySelector('.news-prev').addEventListener('click', prev);
    dotsBox.addEventListener('click', e => {
      const b = e.target.closest('.news-dot');
      if (b) goTo(+b.dataset.i);
    });
    track.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    });
  }

  fetch(NEWS_FILE, { cache: 'no-cache' })
    .then(r => { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(md => {
      const news = parse(md);
      if (!news.length) throw new Error('keine Einträge');
      render(news);
    })
    .catch(err => {
      console.warn('News konnten nicht geladen werden:', err);
      root.style.display = 'none';
    });
})();



// ============================================================================
// BENUTZERDEFINIERTE UNTERNEHMEN - LOCAL STORAGE VERWALTUNG
// ============================================================================

let yamlData = []; // Initialize yamlData as an empty array

// ============================================================================
// YAML/DATEN-VERWALTUNG
// ============================================================================

// Hilfsfunktionen für die Deduplizierung von Unternehmen (Prüfung nach id + Name)
function unternehmenSchluessel(c) {
    return String(c?.unternehmen?.id ?? '') + '|' + String(c?.unternehmen?.name ?? '').trim().toLowerCase();
}
function existiertInCore(unternehmen, coreData) {
    const schluessel = unternehmenSchluessel(unternehmen);
    const name = String(unternehmen?.unternehmen?.name ?? '').trim().toLowerCase();
    return (coreData || []).some(c => unternehmenSchluessel(c) === schluessel || String(c?.unternehmen?.name ?? '').trim().toLowerCase() === name);
}
function dedupliziereUnternehmen(liste) {
    const seen = new Set();
    const out = [];
    for (const c of (liste || [])) {
        const key = unternehmenSchluessel(c);
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(c);
    }
    return out;
}

// Zentrale Initialisierung: Core IMMER zuerst laden, dann (falls vorhanden)
// nur die zusätzlichen, hochgeladenen Unternehmen ergänzen.
async function initializeYamlData() {
    // 1. Core (Standard) laden — immer frisch vom Server, Fallback auf Cache
    let coreData = [];
    try {
        const resp = await fetch('js/unternehmen.yml?v=' + Date.now());
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        const text = await resp.text();
        coreData = jsyaml.load(text) || [];
        sessionStorage.setItem('standardYamlData', JSON.stringify(coreData));
        console.log('Core-YAML frisch geladen mit', coreData.length, 'Unternehmen');
    } catch (err) {
        console.warn('Core-YAML konnte nicht geladen werden, Fallback auf Cache', err);
        try { coreData = JSON.parse(sessionStorage.getItem('standardYamlData') || localStorage.getItem('standardYamlData') || '[]'); }
        catch (e) { coreData = []; }
    }

    // 2. Hochgeladene Datei: nur die zusätzlichen Unternehmen behalten (Dedup gegen Core).
    //    id-Kollisionen (gleiche id, anderer Name) werden durch Vergabe einer neuen id aufgelöst.
    let zusaetzliche = [];
    const uploadedJSON = localStorage.getItem('uploadedYamlCompanyData');
    if (uploadedJSON) {
        try {
            const uploaded = JSON.parse(uploadedJSON);
            if (Array.isArray(uploaded)) {
                const verwendeteIds = new Set(coreData.map(c => c?.unternehmen?.id));
                for (const u of uploaded) {
                    if (existiertInCore(u, coreData)) continue; // exaktes Duplikat (id + Name) → überspringen
                    // id-Kollision → neue eindeutige id vergeben
                    if (verwendeteIds.has(u?.unternehmen?.id)) {
                        const maxId = Math.max(0, ...[...coreData, ...zusaetzliche].map(c => Number(c?.unternehmen?.id) || 0));
                        let neueId = maxId + 1;
                        while (verwendeteIds.has(neueId) || zusaetzliche.some(x => x?.unternehmen?.id === neueId)) neueId++;
                        if (u.unternehmen) u.unternehmen.id = neueId;
                        verwendeteIds.add(neueId);
                    } else {
                        verwendeteIds.add(u?.unternehmen?.id);
                    }
                    zusaetzliche.push(u);
                }
                if (zusaetzliche.length === 0) {
                    localStorage.removeItem('uploadedYamlCompanyData');
                } else {
                    localStorage.setItem('uploadedYamlCompanyData', JSON.stringify(zusaetzliche));
                    if (zusaetzliche.length !== uploaded.length) {
                        console.log('Hochgeladene Datei bereinigt: nur', zusaetzliche.length, 'zusätzliche Unternehmen gespeichert');
                    }
                }
            }
        } catch (err) {
            console.warn('uploadedYamlCompanyData korrupt → entfernt', err);
            localStorage.removeItem('uploadedYamlCompanyData');
        }
    }

    // 3. Zusammenführen (Core + zusätzliche, dedupliziert)
    yamlData = dedupliziereUnternehmen([...coreData, ...zusaetzliche]);

    // 4. Eigene (manuell angelegte) Unternehmen ergänzen
    mergeUserCompaniesIntoYamlData();
    markObsoleteUserCompanies();
    displayUserCompanies();
    populateAllCompaniesDropdown();

    console.log('Finale yamlData hat jetzt', yamlData.length, 'Unternehmen (Core + zusätzliche + eigene)');
    console.log('[index] Eigene Unternehmen:', getUserCompanies().map(c => c?.unternehmen?.name).filter(Boolean));
    console.log('[index] Gespeichertes Modellunternehmen (myCompany):', (localStorage.getItem('myCompany') || '').trim() || '(keines)');
    console.log('[index] Liste:', yamlData.map(c => (c?.unternehmen?.id + ' ' + c?.unternehmen?.name + ' ' + (c?.unternehmen?.rechtsform || '')).trim()));
}



// Event Listener für Dropdown-Änderungen erweitern
document.getElementById('allCompaniesDropdown')?.addEventListener('change', function() {
    const selectedName = this.value;
    const setButton = document.getElementById('setMyCompanyButton');
    const myCompanyName = localStorage.getItem('myCompany');
    
    // Button aktivieren/deaktivieren
    if (setButton) {
        setButton.disabled = !selectedName || (selectedName === myCompanyName);
    }
    
    if (!selectedName) return;

    const company = yamlData.find(c => c.unternehmen.name === selectedName);
    if (!company) return;

    const previewDiv = document.getElementById('companyPreview');
    if (previewDiv) {
        previewDiv.innerHTML = '';
        const isMyCompany = (selectedName === myCompanyName);

        const strong = document.createElement('strong');
        strong.textContent = company.unternehmen.name + ' ' + (company.unternehmen.rechtsform || '');
        previewDiv.appendChild(strong);

        if (isMyCompany) {
            const badge = document.createElement('span');
            badge.style.cssText = 'background: #28a745; color: white; padding: 2px 8px; border-radius: 3px; font-size: 0.85em; margin-left: 8px;';
            badge.textContent = '★ Modellunternehmen';
            previewDiv.appendChild(badge);
        }

        previewDiv.appendChild(document.createElement('br'));
        previewDiv.appendChild(document.createTextNode('Branche: ' + (company.unternehmen.branche || '')));
        previewDiv.appendChild(document.createElement('br'));
        previewDiv.appendChild(document.createTextNode('Ort: ' + (company.unternehmen.adresse.plz || '') + ' ' + (company.unternehmen.adresse.ort || '')));
        previewDiv.appendChild(document.createElement('br'));
        previewDiv.appendChild(document.createTextNode('E-Mail: ' + (company.unternehmen.kontakt.email || '–')));
    }
});

// Funktion zum Befüllen des Dropdowns mit allen Unternehmen
function populateAllCompaniesDropdown() {
    const dropdown = document.getElementById('allCompaniesDropdown');
    if (!dropdown) return; // Sicherheitsabfrage

    // Leeren
    dropdown.innerHTML = '<option value="">— Bitte auswählen —</option>';

    if (!yamlData || yamlData.length === 0) {
        dropdown.innerHTML += '<option disabled>Keine Unternehmen verfügbar</option>';
        return;
    }

    // Sortieren (optional – nach Branche + Name)
    const sortedCompanies = [...yamlData].sort((a, b) => {
        const brancheA = a.unternehmen?.branche || '';
        const brancheB = b.unternehmen?.branche || '';
        if (brancheA !== brancheB) return brancheA.localeCompare(brancheB);
        return a.unternehmen?.name?.localeCompare(b.unternehmen?.name || '');
    });

    // Optionen erstellen
    sortedCompanies.forEach(company => {
        const u = company.unternehmen;
        const obsolete = company._obsolete === true;
        
        const option = document.createElement('option');
        option.value = u.name;
        
        // Text: Branche – Name Rechtsform (mit Hinweis bei obsolet)
        let text = `${u.branche ? u.branche + ' – ' : ''}${u.name} ${u.rechtsform || ''}`;
        if (obsolete) {
            text += ' (✗ obsolet)';
            option.style.color = '#dc3545';
            option.style.fontStyle = 'italic';
        }
        
        option.textContent = text;
        dropdown.appendChild(option);
    });

    console.log(`Dropdown befüllt mit ${sortedCompanies.length} Unternehmen`);
    
    // NEU: Aktualisiere Modellunternehmen Status nach dem Befüllen
    updateMyCompanyStatus();
    
    // NEU: Auto-select in Dropdowns mit class="meinUnternehmen"
    autoSelectMyCompany();
}


document.getElementById('allCompaniesDropdown')?.addEventListener('change', function() {
    const selectedName = this.value;
    const setButton = document.getElementById('setMyCompanyButton');
    const myCompanyName = localStorage.getItem('myCompany');
    
    // Button aktivieren/deaktivieren
    if (setButton) {
        setButton.disabled = !selectedName || (selectedName === myCompanyName);
    }
    
    if (!selectedName) return;

    const company = yamlData.find(c => c.unternehmen.name === selectedName);
    if (!company) return;

    const previewDiv = document.getElementById('companyPreview');
    if (previewDiv) {
        previewDiv.innerHTML = '';

        function txt(v) { return document.createTextNode(v || '–'); }
        function bold(v) { const b = document.createElement('b'); b.textContent = v; return b; }
        function br() { return document.createElement('br'); }

        const isMyCompany = (selectedName === myCompanyName);
        if (isMyCompany) {
            const badge = document.createElement('span');
            badge.style.cssText = 'background: #28a745; color: white; padding: 2px 8px; border-radius: 3px; font-size: 0.85em; margin-left: 8px;';
            badge.textContent = '★ Modellunternehmen';
            previewDiv.appendChild(badge);
            previewDiv.appendChild(br());
        }

        const h4 = document.createElement('h4');
        const img = document.createElement('img');
        img.src = company.unternehmen.logo || '';
        img.style.cssText = 'width: 50px;vertical-align: middle';
        h4.appendChild(img);
        h4.appendChild(txt(' ' + (company.unternehmen.name || '') + ' ' + (company.unternehmen.rechtsform || '')));
        previewDiv.appendChild(h4);

        previewDiv.appendChild(bold('Motto: ')); previewDiv.appendChild(txt(company.unternehmen.motto)); previewDiv.appendChild(br());
        previewDiv.appendChild(bold('Branche: ')); previewDiv.appendChild(txt(company.unternehmen.branche)); previewDiv.appendChild(br());
        previewDiv.appendChild(bold('Inhaber/Verantwortlicher: ')); previewDiv.appendChild(txt(company.unternehmen.inhaber)); previewDiv.appendChild(br());
        previewDiv.appendChild(bold('Adresse: ')); previewDiv.appendChild(txt((company.unternehmen.adresse?.strasse || '') + ', ' + (company.unternehmen.adresse?.plz || '') + ' ' + (company.unternehmen.adresse?.ort || ''))); previewDiv.appendChild(br());
        previewDiv.appendChild(bold('E-Mail: ')); previewDiv.appendChild(txt(company.unternehmen.kontakt?.email)); previewDiv.appendChild(br());
        previewDiv.appendChild(bold('Werkstoffe: ')); previewDiv.appendChild(br());

       if (company.unternehmen.werkstoffe && typeof company.unternehmen.werkstoffe === 'object') {
    Object.entries(company.unternehmen.werkstoffe).forEach(([kategorie, liste]) => {
        if (Array.isArray(liste) && liste.length > 0) {
            previewDiv.appendChild(bold(kategorie + ': '));
            
            // Objekte ({ name, ... }) und alte reine Strings gleichermaßen unterstützen:
            const werkstoffNamen = liste
                .map(item => (item && typeof item === 'object') ? item.name : item)
                .filter(Boolean)
                .join(', ');
            
            previewDiv.appendChild(txt(werkstoffNamen));
            previewDiv.appendChild(br());
        }
    });
} else {
    previewDiv.appendChild(txt('–'));
    previewDiv.appendChild(br());
}

        // Fertigerzeugnisse anzeigen
previewDiv.appendChild(bold('Fertigerzeugnisse: '));
previewDiv.appendChild(br());

const fertigerzeugnisse =
    company.unternehmen.fertigerzeugnisse?.hauptwerk || [];

if (fertigerzeugnisse.length > 0) {
    fertigerzeugnisse.forEach(produkt => {
        const zeile = document.createElement('div');
        zeile.style.marginLeft = '15px';

        const name = document.createElement('strong');
        name.textContent = produkt.name || 'Unbenanntes Produkt';

        zeile.appendChild(name);

        const preis = document.createTextNode(
            ` – Preis: ${Number(produkt.preis_min).toLocaleString('de-DE', {
                style: 'currency',
                currency: 'EUR'
            })} bis ${Number(produkt.preis_max).toLocaleString('de-DE', {
                style: 'currency',
                currency: 'EUR'
            })}`
        );

        zeile.appendChild(preis);
        previewDiv.appendChild(zeile);
    });
} else {
    previewDiv.appendChild(txt('Keine Fertigerzeugnisse hinterlegt.'));
    previewDiv.appendChild(br());
}
        previewDiv.appendChild(bold('Bank: ')); previewDiv.appendChild(txt(company.unternehmen.bank)); previewDiv.appendChild(br());
    }
});

function handleFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const uploadedFile = fileInput.files[0];

    if (uploadedFile) {
        const reader = new FileReader();

        reader.onload = async function (e) {
            try {
                const uploadedYamlCompanyData = jsyaml.load(e.target.result);

                if (uploadedYamlCompanyData && Array.isArray(uploadedYamlCompanyData)) {
                    // Core (Standard) frisch laden, um Duplikate zu erkennen (Prüfung: id + Name)
                    let coreData = [];
                    try {
                        const resp = await fetch('js/unternehmen.yml?v=' + Date.now());
                        const text = await resp.text();
                        coreData = jsyaml.load(text) || [];
                        sessionStorage.setItem('standardYamlData', JSON.stringify(coreData));
                    } catch (err) {
                        console.warn('Core-Fetch fehlgeschlagen, verwende Cache', err);
                        try { coreData = JSON.parse(localStorage.getItem('standardYamlData') || sessionStorage.getItem('standardYamlData') || '[]'); } catch (e) { coreData = []; }
                    }

                    // Nur die zusätzlichen Unternehmen speichern; id-Kollisionen (gleiche id, anderer Name)
                    // werden durch Vergabe einer neuen, noch nicht vergebenen id aufgelöst.
                    const verwendeteIds = new Set(coreData.map(c => c?.unternehmen?.id));
                    const zusaetzliche = [];
                    for (const u of uploadedYamlCompanyData) {
                        if (existiertInCore(u, coreData)) continue; // exaktes Duplikat (id + Name) → überspringen
                        if (verwendeteIds.has(u?.unternehmen?.id)) {
                            const maxId = Math.max(0, ...[...coreData, ...zusaetzliche].map(c => Number(c?.unternehmen?.id) || 0));
                            let neueId = maxId + 1;
                            while (verwendeteIds.has(neueId) || zusaetzliche.some(x => x?.unternehmen?.id === neueId)) neueId++;
                            const copy = JSON.parse(JSON.stringify(u));
                            if (copy.unternehmen) copy.unternehmen.id = neueId;
                            verwendeteIds.add(neueId);
                            zusaetzliche.push(copy);
                        } else {
                            verwendeteIds.add(u?.unternehmen?.id);
                            zusaetzliche.push(u);
                        }
                    }
                    if (zusaetzliche.length === 0) {
                        localStorage.removeItem('uploadedYamlCompanyData');
                        updateLocalStorageStatus('Alle Unternehmen der Datei sind bereits im Core vorhanden – nichts zusätzlich gespeichert.');
                    } else {
                        localStorage.setItem('uploadedYamlCompanyData', JSON.stringify(zusaetzliche));
                        updateLocalStorageStatus('Daten hochgeladen: ' + zusaetzliche.length + ' zusätzliche Unternehmen gespeichert (' + (uploadedYamlCompanyData.length - zusaetzliche.length) + ' bereits im Core).');
                    }

                    // Core + zusätzliche neu aufbauen
                    await initializeYamlData();
                    zeigeModal("Datei erfolgreich hochgeladen!");
                } else {
                    console.error("Invalid YAML format in the uploaded file.");
                    zeigeModal("Fehler im YAML format. Datei bitte überprüfen.");
                }
            } catch (error) {
                console.error("Error processing uploaded YAML data:", error);
                zeigeModal("Error processing uploaded YAML data. Please check the file format.");
            }
        };

        reader.readAsText(uploadedFile);

    } else {
        zeigeModal("No file selected. Please choose a YAML file to upload.");
    }

}



let uploadedLogoBase64 = null; // Globale Variable für hochgeladenes Logo

// Logo-Upload-Handler
function handleLogoUpload(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('logoPreview');
    
    if (!file) {
        uploadedLogoBase64 = null;
        preview.innerHTML = '<small style="color: #666;">Keine Datei ausgewählt</small>';
        return;
    }
    
    // Prüfe Dateityp
    const validTypes = ['image/svg+xml'];
    if (!validTypes.includes(file.type)) {
        zeigeModal('Bitte nur SVG-Dateien hochladen.');
        event.target.value = '';
        uploadedLogoBase64 = null;
        preview.innerHTML = '<small style="color: #666;">Keine Datei ausgewählt</small>';
        return;
    }
    
    // Prüfe Dateigröße (max 500KB)
    if (file.size > 500 * 1024) {
        zeigeModal('Die Datei ist zu groß. Maximal 500KB erlaubt.');
        event.target.value = '';
        uploadedLogoBase64 = null;
        preview.innerHTML = '<small style="color: #666;">Keine Datei ausgewählt</small>';
        return;
    }
    
    // Konvertiere zu Base64
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedLogoBase64 = e.target.result;
        preview.innerHTML = '';
        const logoImg = document.createElement('img');
        logoImg.src = uploadedLogoBase64;
        logoImg.style.cssText = 'max-width: 150px; max-height: 80px; border: 1px solid #ccc; padding: 5px;';
        preview.appendChild(logoImg);
        preview.appendChild(document.createElement('br'));
        const okMsg = document.createElement('small');
        okMsg.style.cssText = 'color: #28a745;';
        okMsg.textContent = '✓ Logo hochgeladen';
        preview.appendChild(okMsg);
    };
    reader.onerror = function() {
        zeigeModal('Fehler beim Lesen der Datei.');
        uploadedLogoBase64 = null;
        preview.innerHTML = '<small style="color: #666;">Keine Datei ausgewählt</small>';
    };
    reader.readAsDataURL(file);
}

// Funktion zum Abrufen der benutzerdefinierten Unternehmen aus dem Local Storage
function getUserCompanies() {
    const stored = localStorage.getItem('userCompanies');
    return stored ? JSON.parse(stored) : [];
}

// Funktion zum Speichern der benutzerdefinierten Unternehmen im Local Storage
function saveUserCompanies(companies) {
    localStorage.setItem('userCompanies', JSON.stringify(companies));
}

// Funktion zum Generieren einer eindeutigen ID
function generateCompanyId() {
    const userCompanies = getUserCompanies();
    const existingIds = userCompanies.map(c => c.unternehmen.id);
    let newId = Math.floor(Math.random() * 9000) + 1000;
    
    // Stelle sicher, dass die ID einzigartig ist
    while (existingIds.includes(newId)) {
        newId = Math.floor(Math.random() * 9000) + 1000;
    }
    
    return newId;
}

/// Validierungs-Hilfsfunktionen
const CompanyValidation = {
    // Verhindere XSS und HTML-Tags
    sanitizeInput: (input) => {
        if (!input) return '';
        // Entferne HTML-Tags und Script-Tags
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]+>/g, '')
            .replace(/[{}]/g, '')
            .trim();
    },
    
    // Validiere Text (Buchstaben, Umlaute, Sonderzeichen)
    isValidText: (value, maxLength = 50, allowNumbers = false) => {
        if (!value) return true; // Optional field
        const sanitized = CompanyValidation.sanitizeInput(value);
        if (sanitized.length > maxLength) return false;
        if (!allowNumbers && /\d/.test(sanitized)) return false;
        return true;
    },
    
    // Validiere PLZ (genau 5 Ziffern)
    isValidPLZ: (value) => {
        if (!value) return true;
        return /^[0-9]{5}$/.test(value.trim());
    },
    
    // Validiere Telefon
    isValidPhone: (value) => {
        if (!value) return true;
        const sanitized = value.trim();
        return /^[0-9\s\+\-\/()]{0,25}$/.test(sanitized);
    },
    
    // Validiere E-Mail
    isValidEmail: (value) => {
        if (!value) return true;
        const sanitized = value.trim();
        return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(sanitized) 
            && sanitized.length <= 60;
    },
    
    // Validiere Website
    isValidWebsite: (value) => {
        if (!value) return true;
        const sanitized = value.trim();
        return /^[a-zA-Z0-9.\-:/]{0,60}$/.test(sanitized);
    },
    
    // Validiere IBAN
    isValidIBAN: (value) => {
        if (!value) return true;
        const cleaned = value.replace(/\s/g, '').toUpperCase();
        // Deutsche IBAN: DE + 20 Ziffern
        return /^DE[0-9]{20}$/.test(cleaned);
    },
    
    // Validiere BIC
isValidBIC: (value) => {
    if (!value) return true;

    const cleaned = value.replace(/\s/g, '').toUpperCase();

    return /^[A-Z0-9]+$/.test(cleaned);
},
    // Validiere USt-ID
    isValidUstID: (value) => {
        if (!value) return true;
        const cleaned = value.replace(/\s/g, '').toUpperCase();
        return /^DE[0-9]{9,20}$/.test(cleaned);
    },
    
isValidSteuernummer: (value) => {
    if (!value) return true;

    const s = value.trim();
    
    // Muss mindestens eine Ziffer enthalten
    return /^[0-9\/-]*[0-9]+[0-9\/-]*$/.test(s) && s.length <= 20;
},

};


// Zusätzliche Sicherheits-Validierung (verhindert XSS auch wenn HTML-Pattern umgangen wird)
function containsDangerousChars(value) {
    if (!value) return false;
    // Prüfe auf gefährliche Zeichen
    const dangerousChars = /<|>|\{|\}|<script|javascript:|onerror=|onload=/i;
    return dangerousChars.test(value);
}

// Formular-Handler zum Hinzufügen/Bearbeiten eines Unternehmens
function handleAddCompanyForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const isEditing = form.dataset.editIndex !== undefined;
    const editIndex = parseInt(form.dataset.editIndex);
    
    
    // Hole Formulardaten
    const rawName = document.getElementById('newCompanyName').value;
    const rechtsform = document.getElementById('newCompanyRechtsform').value;
    const rawBranche = document.getElementById('newCompanyBranche').value;
    const rawMotto = document.getElementById('newCompanyMotto').value;
    const rawInhaber = document.getElementById('newCompanyInhaber').value;
    const rawStrasse = document.getElementById('newCompanyStrasse').value;
    const rawPLZ = document.getElementById('newCompanyPLZ').value;
    const rawOrt = document.getElementById('newCompanyOrt').value;
    const rawTelefon = document.getElementById('newCompanyTelefon').value;
    const rawEmail = document.getElementById('newCompanyEmail').value;
    const rawInternet = document.getElementById('newCompanyInternet').value;
    const rawBank = document.getElementById('newCompanyBank').value;
    const rawIBAN = document.getElementById('newCompanyIBAN').value;
    const rawBIC = document.getElementById('newCompanyBIC').value;
    const rawUstID = document.getElementById('newCompanyUstID').value;
    const rawSteuernummer = document.getElementById('newCompanySteuernummer').value;
    const akzent = document.getElementById('newCompanyAkzent').value;

    // Werkstoffe: Zeilen auslesen (Einheit + Preise vom Nutzer, Stammlieferer je Kategorie automatisch)
    let werkstoffe;
    try {
        werkstoffe = {
            AWR: getWerkstoffeFromForm('newCompanyAWR'),
            AWF: getWerkstoffeFromForm('newCompanyAWF'),
            AWH: getWerkstoffeFromForm('newCompanyAWH'),
            AWB: getWerkstoffeFromForm('newCompanyAWB'),
        };
    } catch (error) {
        zeigeModal(error.message);
        return;
    }

let fertigerzeugnisse;

try {
    fertigerzeugnisse = {
        hauptwerk: getFertigerzeugnisseFromForm()
    };
} catch (error) {
    zeigeModal(error.message);
    return;
}
    
    // Erste Sicherheitsschicht: Prüfe auf gefährliche Zeichen
    const allInputs = [
        rawName, rawBranche, rawMotto, rawInhaber, rawStrasse, 
        rawOrt, rawTelefon, rawEmail, rawInternet, rawBank, 
        rawIBAN, rawBIC, rawUstID, rawSteuernummer
    ];
    
    for (const input of allInputs) {
        if (containsDangerousChars(input)) {
            zeigeModal('Ungültige Eingabe erkannt: Die Zeichen <, >, {, }, <script>, javascript: und Event-Handler sind nicht erlaubt.');
            return;
        }
    }
    
    // Sanitize alle Eingaben
    const name = CompanyValidation.sanitizeInput(rawName);

    // ===================================================================
    // NEU: Prüfe nur den NAMEN (ohne Rechtsform)
    // ===================================================================
    const existierendesUnternehmen = yamlData.find(company => {
        return company.unternehmen.name.toLowerCase() === name.toLowerCase();
    });
    
    // Wenn Duplikat gefunden UND wir bearbeiten nicht gerade dieses Unternehmen
    if (existierendesUnternehmen) {
        if (isEditing) {
            // Beim Bearbeiten: Erlaube den gleichen Namen nur für das aktuell bearbeitete Unternehmen
            const userCompanies = getUserCompanies();
            const currentCompany = userCompanies[editIndex];
            
            if (currentCompany.unternehmen.name.toLowerCase() !== name.toLowerCase()) {
                zeigeModal(`Ein Unternehmen mit dem Namen "${name}" existiert bereits!\n\nBitte wählen Sie einen anderen Namen.`);
                return;
            }
        } else {
            // Beim Hinzufügen: Kein Duplikat erlaubt
            zeigeModal(`Ein Unternehmen mit dem Namen "${name}" existiert bereits!\n\nBitte wählen Sie einen anderen Namen.`);
            return;
        }
    }
    // ===================================================================
    
    const branche = CompanyValidation.sanitizeInput(rawBranche);
    const motto = CompanyValidation.sanitizeInput(rawMotto);
    const inhaber = CompanyValidation.sanitizeInput(rawInhaber);
    const strasse = CompanyValidation.sanitizeInput(rawStrasse);
    const plz = rawPLZ.trim();
    const ort = CompanyValidation.sanitizeInput(rawOrt);
    const telefon = rawTelefon.trim();
    const email = rawEmail.trim().toLowerCase();
    const internet = rawInternet.trim().toLowerCase();
    const bank = CompanyValidation.sanitizeInput(rawBank);
    const iban = rawIBAN.replace(/\s/g, '').toUpperCase();
    const bic = rawBIC.replace(/\s/g, '').toUpperCase();
    const ustId = rawUstID.replace(/\s/g, '').toUpperCase();
    const steuernummer = rawSteuernummer.trim();
    
    // ALLE Pflichtfeld-Validierungen
    if (!name || name.length === 0) {
        zeigeModal('Bitte geben Sie einen Firmennamen ein.');
        return;
    }
    
    if (!rechtsform || rechtsform === '') {
        zeigeModal('Bitte wählen Sie eine Rechtsform aus.');
        return;
    }
    
    if (!branche || branche.length === 0) {
        zeigeModal('Bitte geben Sie eine Branche ein.');
        return;
    }
    
    if (!motto || motto.length === 0) {
        zeigeModal('Bitte geben Sie ein Motto ein.');
        return;
    }
    
    if (!inhaber || inhaber.length === 0) {
        zeigeModal('Bitte geben Sie einen Inhaber/Geschäftsführer ein.');
        return;
    }
    
    if (!strasse || strasse.length === 0) {
        zeigeModal('Bitte geben Sie eine Straße ein.');
        return;
    }
    
    if (!plz || plz.length === 0) {
        zeigeModal('Bitte geben Sie eine PLZ ein.');
        return;
    }
    
    if (!ort || ort.length === 0) {
        zeigeModal('Bitte geben Sie einen Ort ein.');
        return;
    }
    
    if (!telefon || telefon.length === 0) {
        zeigeModal('Bitte geben Sie eine Telefonnummer ein.');
        return;
    }
    
    if (!email || email.length === 0) {
        zeigeModal('Bitte geben Sie eine E-Mail-Adresse ein.');
        return;
    }
    
    if (!internet || internet.length === 0) {
        zeigeModal('Bitte geben Sie eine Internet-Adresse ein.');
        return;
    }
    
    if (!bank || bank.length === 0) {
        zeigeModal('Bitte geben Sie eine Bank ein.');
        return;
    }
    
    if (!iban || iban.length === 0) {
        zeigeModal('Bitte geben Sie eine IBAN ein.');
        return;
    }
    
    if (!bic || bic.length === 0) {
        zeigeModal('Bitte geben Sie einen BIC ein.');
        return;
    }
    
    if (!ustId || ustId.length === 0) {
        zeigeModal('Bitte geben Sie eine USt-IdNr. ein.');
        return;
    }
    
    if (!steuernummer || steuernummer.length === 0) {
        zeigeModal('Bitte geben Sie eine Steuernummer ein.');
        return;
    }
    
    // Detaillierte Format-Validierungen
    if (!CompanyValidation.isValidText(name, 50, true)) {
        zeigeModal('Firmenname: Maximal 50 Zeichen, keine HTML-Tags oder Scripte.');
        return;
    }
    
    if (!CompanyValidation.isValidText(branche, 50, true)) {
        zeigeModal('Branche: Maximal 50 Zeichen, keine HTML-Tags oder Scripte.');
        return;
    }
    
    if (!CompanyValidation.isValidText(motto, 100, true)) {
        zeigeModal('Motto: Maximal 100 Zeichen, keine HTML-Tags oder Scripte.');
        return;
    }
    
    if (!CompanyValidation.isValidText(inhaber, 50, false)) {
        zeigeModal('Inhaber: Maximal 50 Zeichen, nur Buchstaben, keine Zahlen.');
        return;
    }
    
    if (!CompanyValidation.isValidText(strasse, 60, true)) {
        zeigeModal('Straße: Maximal 60 Zeichen, keine HTML-Tags oder Scripte.');
        return;
    }
    
    if (!CompanyValidation.isValidPLZ(plz)) {
        zeigeModal('PLZ: Bitte geben Sie genau 5 Ziffern ein.');
        return;
    }
    
    if (!CompanyValidation.isValidText(ort, 50, false)) {
        zeigeModal('Ort: Maximal 50 Zeichen, nur Buchstaben.');
        return;
    }
    
    if (!CompanyValidation.isValidPhone(telefon)) {
        zeigeModal('Telefon: Ungültiges Format. Nur Zahlen und + - / ( ) erlaubt, maximal 25 Zeichen.');
        return;
    }
    
    if (!CompanyValidation.isValidEmail(email)) {
        zeigeModal('E-Mail: Bitte geben Sie eine gültige E-Mail-Adresse ein (maximal 60 Zeichen).');
        return;
    }
    
    if (!CompanyValidation.isValidWebsite(internet)) {
        zeigeModal('Internet: Ungültiges Format. Nur Buchstaben, Zahlen und . - : / erlaubt, maximal 60 Zeichen.');
        return;
    }
    
    if (!CompanyValidation.isValidText(bank, 50, true)) {
        zeigeModal('Bank: Maximal 50 Zeichen, keine HTML-Tags oder Scripte.');
        return;
    }
    
    if (!CompanyValidation.isValidIBAN(iban)) {
        zeigeModal('IBAN: Ungültiges Format. Erforderlich: DE + 20 Ziffern (z.B. DE89370400440532013000).');
        return;
    }
    
    if (!CompanyValidation.isValidBIC(bic)) {
        zeigeModal('BIC: Ungültiges Format. Erforderlich: 8 oder 11 Zeichen (z.B. COBADEFFXXX).');
        return;
    }
    
    if (!CompanyValidation.isValidUstID(ustId)) {
        zeigeModal('USt-IdNr.: Ungültiges Format. Erforderlich: DE + 9 Ziffern (z.B. DE123456789).');
        return;
    }
    
    if (!CompanyValidation.isValidSteuernummer(steuernummer)) {
        zeigeModal('Steuernummer: Nur Zahlen und / erlaubt, maximal 20 Zeichen.');
        return;
    }
    
    // Hole oder generiere ID
    let companyId;
    if (isEditing) {
        const userCompanies = getUserCompanies();
        companyId = userCompanies[editIndex].unternehmen.id;
    } else {
        companyId = generateCompanyId();
    }
    
    // Erstelle Unternehmensobjekt
    const newCompany = {
        unternehmen: {
            id: companyId,
            name: name,
            rechtsform: rechtsform,
            branche: branche,
            motto: motto,
            inhaber: inhaber,
            logo: uploadedLogoBase64 || '',
            adresse: {
                strasse: strasse,
                plz: plz,
                ort: ort,
                land: 'Deutschland'
            },
            kontakt: {
                telefon: telefon,
                email: email,
                internet: internet
            },
            bank: bank,
            iban: iban,
            bic: bic,
            ust_id: ustId,
            steuernummer: steuernummer,
            akzent: akzent,
            werkstoffe: werkstoffe,
            fertigerzeugnisse: fertigerzeugnisse,
        },
        _permanentlyValid: true,
    };
    
    // Speichere im Local Storage
  const userCompanies = getUserCompanies();

if (isEditing) {
    userCompanies[editIndex] = newCompany;
    userCompanies[editIndex]._isUserAdded = true;
    delete userCompanies[editIndex]._obsolete;     // explizit zurücksetzen
    saveUserCompanies(userCompanies);

    // Wenn es vorher obsolet war → Flag explizit entfernen
    if (userCompanies[editIndex]._obsolete) {
        delete userCompanies[editIndex]._obsolete;
    }

    saveUserCompanies(userCompanies);

    if (userCompanies[editIndex]._obsolete === undefined) {  // war vorher obsolet
        zeigeModal('Unternehmen erfolgreich wieder hinzugefügt und aktualisiert!');
        updateLocalStorageStatus('Unternehmen reaktiviert.');
    } else {
        zeigeModal('Unternehmen erfolgreich aktualisiert!');
        updateLocalStorageStatus('Unternehmen aktualisiert.');
    }
} else {
    // Neues Unternehmen
    userCompanies.push(newCompany);
    saveUserCompanies(userCompanies);
    zeigeModal('Unternehmen erfolgreich hinzugefügt!');
    updateLocalStorageStatus('Eigenes Unternehmen hinzugefügt.');
}

// WICHTIG: Nach jedem Speichern neu mergen + prüfen + anzeigen
mergeUserCompaniesIntoYamlData();
markObsoleteUserCompanies();
displayUserCompanies();
populateAllCompaniesDropdown();

// Formular zurücksetzen
form.reset();
setFertigerzeugnisseInForm([]);
WERKSTOFF_FELDER.forEach(id => setWerkstoffeInForm(id, []));
delete form.dataset.editIndex;
uploadedLogoBase64 = null;
document.getElementById('logoPreview').innerHTML = '<small style="color: #666;">Keine Datei ausgewählt</small>';

const submitButton = form.querySelector('button[type="submit"]');
submitButton.textContent = '✓ Unternehmen hinzufügen';
submitButton.style.background = '#28a745';

// Hinweis ausblenden
const hint = document.getElementById('editHint');
if (hint) hint.style.display = 'none';
}

// Funktion zum Zusammenführen der benutzerdefinierten Unternehmen mit den Standard-YAML-Daten
function mergeUserCompaniesIntoYamlData() {
    const userCompanies = getUserCompanies();

    if (userCompanies.length === 0) {
        console.log('Keine eigenen Unternehmen zum Mergen');
        return;
    }

    // Basis-Daten nach Branche sortieren, eigene Unternehmen immer ans Ende
    const baseData = yamlData
        .filter(c => !c._isUserCompany)
        .sort((a, b) => {
            const brancheA = a.unternehmen?.branche || '';
            const brancheB = b.unternehmen?.branche || '';
            return brancheA.localeCompare(brancheB);
        });

    userCompanies.forEach(c => { c._isUserCompany = true; });

    yamlData = [...baseData, ...userCompanies];

    console.log('Merged:', userCompanies.length, 'eigene Unternehmen hinzugefügt → Gesamt:', yamlData.length);
}
// Funktion zum Anzeigen der benutzerdefinierten Unternehmen
function displayUserCompanies() {
    const userCompanies = getUserCompanies();
    const container = document.getElementById('userCompanyList');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (userCompanies.length === 0) {
        const p = document.createElement('p');
        p.style.cssText = 'color: #666; font-style: italic;';
        p.textContent = 'Noch keine eigenen Unternehmen hinzugefügt.';
        container.appendChild(p);
        return;
    }
    
    const grid = document.createElement('div');
    grid.style.cssText = 'display: grid; gap: 15px;';
    
    userCompanies.forEach((company, index) => {
        const u = company.unternehmen;
        const isObsolete = company._obsolete === true;
        
        const card = document.createElement('div');
        card.style.cssText = 'border: 1px solid; padding: 15px; border-radius: 4px;' +
            (isObsolete ? 'opacity: 0.5; background: #fff5f5; border-color: #ffcccc;'
                       : 'background: #f9f9f9; border-color: #ddd;');

        const flexRow = document.createElement('div');
        flexRow.style.cssText = 'display: flex; justify-content: space-between; align-items: start;';

        const leftDiv = document.createElement('div');
        leftDiv.style.flex = '1';

        const h4 = document.createElement('h4');
        h4.style.cssText = 'margin: 0 0 10px 0;';
        h4.textContent = (u.name || '') + ' ' + (u.rechtsform || '');
        leftDiv.appendChild(h4);

        if (isObsolete) {
            const badge = document.createElement('span');
            badge.style.cssText = 'color:#dc3545; font-weight:bold; font-size:0.9em;';
            badge.textContent = ' × Nicht mehr in der Quelldatei';
            h4.appendChild(badge);
        }

        const p = document.createElement('p');
        p.style.cssText = 'margin: 5px 0; color: #666;';

        const b1 = document.createElement('strong');
        b1.textContent = 'Branche: ';
        p.appendChild(b1);
        p.appendChild(document.createTextNode(u.branche || ''));
        p.appendChild(document.createElement('br'));

        const b2 = document.createElement('strong');
        b2.textContent = 'Ort: ';
        p.appendChild(b2);
        p.appendChild(document.createTextNode(u.adresse?.ort || ''));

        if (u.kontakt?.email) {
            p.appendChild(document.createElement('br'));
            const b3 = document.createElement('strong');
            b3.textContent = 'E-Mail: ';
            p.appendChild(b3);
            p.appendChild(document.createTextNode(u.kontakt.email));
        }

        leftDiv.appendChild(p);

        flexRow.appendChild(leftDiv);

        const btnDiv = document.createElement('div');
        btnDiv.style.cssText = 'display: flex; gap: 10px;';

        const editBtn = document.createElement('button');
        editBtn.style.cssText = 'background: #007bff; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;' + (isObsolete ? 'opacity:0.6;' : '');
        editBtn.textContent = '✎ Bearbeiten';
        editBtn.addEventListener('click', () => editUserCompany(index));
        btnDiv.appendChild(editBtn);

        const delBtn = document.createElement('button');
        delBtn.style.cssText = 'background: #dc3545; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;';
        delBtn.textContent = '✕ Löschen';
        delBtn.addEventListener('click', () => deleteUserCompany(index));
        btnDiv.appendChild(delBtn);

        flexRow.appendChild(btnDiv);
        card.appendChild(flexRow);
        grid.appendChild(card);
    });
    
    container.appendChild(grid);
}

// Funktion zum Löschen eines benutzerdefinierten Unternehmens
function deleteUserCompany(index) {
    if (!confirm('Möchten Sie dieses Unternehmen wirklich löschen?')) {
        return;
    }
    
    const userCompanies = getUserCompanies();
    userCompanies.splice(index, 1);
    saveUserCompanies(userCompanies);
    
    // Wenn alle benutzerdefinierten Unternehmen gelöscht wurden
    if (userCompanies.length === 0) {
        // Lade die Standard-YAML-Daten neu
        loadStandardYamlData();
        updateLocalStorageStatus('Alle eigenen Unternehmen gelöscht. Standard-Daten wiederhergestellt.');
    } else {
        mergeUserCompaniesIntoYamlData();
        updateLocalStorageStatus('Unternehmen gelöscht.');
    }
    
    displayUserCompanies();
    populateAllCompaniesDropdown();
}

// Funktion zum Bearbeiten eines benutzerdefinierten Unternehmens
function editUserCompany(index) {
    const userCompanies = getUserCompanies();
    const company = userCompanies[index];
    const u = company.unternehmen;           // ← wichtig: u = unternehmen-Objekt
    const isObsolete = company._obsolete === true;

    // === Grunddaten ins Formular laden ===
    document.getElementById('newCompanyName').value = u.name;
    document.getElementById('newCompanyRechtsform').value = u.rechtsform;
    document.getElementById('newCompanyBranche').value = u.branche;
    document.getElementById('newCompanyMotto').value = u.motto;
    document.getElementById('newCompanyInhaber').value = u.inhaber;
    document.getElementById('newCompanyStrasse').value = u.adresse.strasse;
    document.getElementById('newCompanyPLZ').value = u.adresse.plz;
    document.getElementById('newCompanyOrt').value = u.adresse.ort;
    document.getElementById('newCompanyTelefon').value = u.kontakt.telefon;
    document.getElementById('newCompanyEmail').value = u.kontakt.email;
    document.getElementById('newCompanyInternet').value = u.kontakt.internet;
    document.getElementById('newCompanyBank').value = u.bank;
    document.getElementById('newCompanyIBAN').value = u.iban;
    document.getElementById('newCompanyBIC').value = u.bic;
    document.getElementById('newCompanyUstID').value = u.ust_id;
    document.getElementById('newCompanySteuernummer').value = u.steuernummer;
    document.getElementById('newCompanyAkzent').value = u.akzent;

    // === WERKSTOFFE ins Formular laden (JETZT KORREKT!) ===
    function arrayToTextarea(id, arr) {
        setWerkstoffeInForm(id, arr);
    }
    const w = u.werkstoffe || {};      

    arrayToTextarea('newCompanyAWR', w.AWR);
    arrayToTextarea('newCompanyAWF', w.AWF);
    arrayToTextarea('newCompanyAWH', w.AWH);
    arrayToTextarea('newCompanyAWB', w.AWB);

    // Fertigerzeugnisse des Hauptwerks laden
const fertigerzeugnisse = u.fertigerzeugnisse?.hauptwerk || [];

setFertigerzeugnisseInForm(fertigerzeugnisse);

    uploadedLogoBase64 = u.logo || null;
    const preview = document.getElementById('logoPreview');
    preview.innerHTML = '';
    if (u.logo && String(u.logo).startsWith('data:image/')) {
        const img = document.createElement('img');
        img.src = u.logo;
        img.style.cssText = 'max-width: 150px; max-height: 80px; border: 1px solid #ccc; padding: 5px;';
        preview.appendChild(img);
        preview.appendChild(document.createElement('br'));
        const okMsg = document.createElement('small');
        okMsg.style.cssText = 'color: #28a745;';
        okMsg.textContent = '✓ Aktuelles Logo';
        preview.appendChild(okMsg);
    } else {
        const msg = document.createElement('small');
        msg.style.cssText = 'color: #666;';
        msg.textContent = 'Keine Datei ausgewählt';
        preview.appendChild(msg);
    }

    // Bearbeiten-Modus aktivieren
    const form = document.getElementById('addCompanyForm');
    const submitButton = form.querySelector('button[type="submit"]');

    if (isObsolete) {
        submitButton.textContent = '→ Wieder hinzufügen';
        submitButton.style.background = '#fd7e14';
        submitButton.style.color = 'white';
    } else {
        submitButton.textContent = '✓ Änderungen speichern';
        submitButton.style.background = '#ffc107';
        submitButton.style.color = 'black';
    }

    form.dataset.editIndex = index;

    // Hinweis für obsolete Unternehmen
    let hint = document.getElementById('editHint');
    if (!hint) {
        hint = document.createElement('p');
        hint.id = 'editHint';
        hint.style.cssText = 'color:#dc3545; margin:0 0 12px 0; padding:8px 12px; background:#fff5f5; border-left:4px solid #dc3545; border-radius:3px;';
        form.prepend(hint);
    }

    if (isObsolete) {
        hint.textContent = '⚠ Dieses Unternehmen fehlt in der aktuellen Quelldatei. Bearbeiten Sie es und klicken Sie auf „Wieder hinzufügen“.';
        hint.style.display = 'block';
    } else {
        hint.style.display = 'none';
    }

    // Zum Formular scrollen
    form.scrollIntoView({ behavior: 'smooth' });
}

// Funktion zum Laden der Standard-YAML-Daten
function loadStandardYamlData() {
    fetch('js/unternehmen.yml?v=' + Date.now()) // Cache-Buster für Updates
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            const standardData = jsyaml.load(data);
            console.log('Standard-YAML frisch geladen mit', standardData.length, 'Unternehmen');
            
            // NICHT im Local Storage speichern - immer frisch laden
            // (Nur für Fallback-Zwecke im Session Storage)
            sessionStorage.setItem('standardYamlData', JSON.stringify(standardData));
            
            // Basis setzen
            yamlData = standardData;
            
            // Merge: Eigene Unternehmen IMMER hinzufügen
            mergeUserCompaniesIntoYamlData();
            markObsoleteUserCompanies();
            displayUserCompanies();
            populateAllCompaniesDropdown();
            
            console.log('Finale yamlData hat jetzt', yamlData.length, 'Unternehmen (Standard + eigene)');
        })
        .catch(error => {
            console.error("Fehler beim Laden der Standard-YAML:", error);
            
            // Fallback: Versuche Session Storage
            const sessionData = sessionStorage.getItem('standardYamlData');
            if (sessionData) {
                console.warn('Verwende Standard-YAML aus Session Storage (Fallback)');
                yamlData = JSON.parse(sessionData);
                mergeUserCompaniesIntoYamlData();
                markObsoleteUserCompanies();
                displayUserCompanies();
                populateAllCompaniesDropdown();
            } else {
                zeigeModal('Fehler beim Laden der Unternehmensdaten. Bitte Seite neu laden.');
            }
        });
}

function exportCurrentYamlData() {
    try {
        // 1. Nur nicht-obsolete Unternehmen auswählen
               const exportData = yamlData
            .filter(company => company._obsolete !== true)
            .sort((a, b) => {
                if (!!a._isUserCompany !== !!b._isUserCompany) {
                    return a._isUserCompany ? 1 : -1;   // eigene ans Ende
                }
                const brancheA = a.unternehmen?.branche || '';
                const brancheB = b.unternehmen?.branche || '';
                return brancheA.localeCompare(brancheB);
            });

        // 2. Alle internen Flags (_obsolete, _permanentlyValid, ...) entfernen
        const cleanExportData = exportData.map(company => {
            // flache Kopie des gesamten Objekts erstellen
            const clean = { ...company };

            // Unternehmen-Objekt bereinigen
            if (clean.unternehmen) {
                clean.unternehmen = { ...clean.unternehmen };
            }

            // Alle Keys entfernen, die mit _ beginnen (inkl. _obsolete, _permanentlyValid usw.)
            Object.keys(clean).forEach(key => {
                if (key.startsWith('_')) {
                    delete clean[key];
                }
            });

            // Falls Flags tief im unternehmen-Objekt liegen (selten, aber sicher ist sicher)
            if (clean.unternehmen) {
                Object.keys(clean.unternehmen).forEach(key => {
                    if (key.startsWith('_')) {
                        delete clean.unternehmen[key];
                    }
                });
            }

            return clean;
        });


        // 4. YAML erzeugen und downloaden
        const yamlString = jsyaml.dump(cleanExportData);
        const blob = new Blob([yamlString], { type: 'text/yaml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'meine_unternehmen.yml';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        zeigeModal(`Export erfolgreich: ${cleanExportData.length} Unternehmen`);
    } catch (error) {
        console.error('Export-Fehler:', error);
        zeigeModal('Fehler beim Exportieren der Daten.');
    }
}



// Modifizierte Funktion zum Laden der hochgeladenen Daten
function loadUploadedDataFromLocalStorage() {
    initializeYamlData(); // 
}



// Initialisierung beim Laden der Seite
document.addEventListener('DOMContentLoaded', function() {

    
    // Komplette YAML-Initialisierung + Merge + Mark + Display
    // (populateAllCompaniesDropdown() ruft updateMyCompanyStatus() und
    //  autoSelectMyCompany() am Ende selbst auf – auch beim Nachladen via fetch)
    initializeYamlData();
    
    // Export-Button hinzufügen
    const modellunternehmenSection = document.getElementById('exportbutton');
    if (modellunternehmenSection && !document.getElementById('exportYamlButton')) {
        const exportButton = document.createElement('button');
        exportButton.id = 'exportYamlButton';
        exportButton.textContent = 'Aktuelle Unternehmen exportieren';
        exportButton.onclick = exportCurrentYamlData;
        
        const resetButton = modellunternehmenSection.querySelector('button');
        if (resetButton && resetButton.parentNode) {
            resetButton.parentNode.insertBefore(exportButton, resetButton.nextSibling);
        }
    }
});


// Modifizierte deleteAndLoadDefaultData Funktion
function deleteAndLoadDefaultData() {
    if (!confirm('Möchten Sie wirklich die Daten zurücksetzen? Ihre eigenen Unternehmen bleiben erhalten.')) {
        return;
    }
    
    // Lösche hochgeladene Daten
    localStorage.removeItem('uploadedYamlCompanyData');
    
    // Session Storage leeren (wird beim nächsten Laden neu gefüllt)
    sessionStorage.removeItem('standardYamlData');
    
    // Setze Datei-Input zurück
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
    
    // Lade Standard-YAML-Daten frisch vom Server
    console.log('Lade frische Standard-Daten nach Reset...');
    loadStandardYamlData();
    
    updateLocalStorageStatus('Daten wurden zurückgesetzt. Standard-Liste wird vom Server geladen.');
    zeigeModal('Daten erfolgreich zurückgesetzt. Standard-Liste wurde aktualisiert.');
}

function markObsoleteUserCompanies() {
    const userCompanies = getUserCompanies();
    if (userCompanies.length === 0) return;

    // Hole die Basis-Liste (ohne die eigenen Unternehmen!)
    // Das ist entweder die hochgeladene YAML oder die Standard-Liste
    let baseYaml = [];
    const uploadedJSON = localStorage.getItem('uploadedYamlCompanyData');
    if (uploadedJSON) {
        try {
            baseYaml = JSON.parse(uploadedJSON);
        } catch (e) {}
    }
    if (baseYaml.length === 0) {
        const standardJSON = localStorage.getItem('standardYamlData');
        if (standardJSON) {
            baseYaml = JSON.parse(standardJSON);
        }
    }

    // Set aller offiziellen Namen aus der Basis-YAML (hochgeladen oder Standard)
    const officialNames = new Set(
        baseYaml
            .map(c => c?.unternehmen?.name?.toLowerCase?.())
            .filter(Boolean)
    );

    // Prüfung für jedes User-Unternehmen
    userCompanies.forEach(company => {
        const nameLower = company.unternehmen.name.toLowerCase();

        // Ist der Name in der aktuellen offiziellen Liste?
        const isOfficial = officialNames.has(nameLower);

        // Wenn es explizit wieder hinzugefügt / neu hinzugefügt wurde → nicht obsolet
        if (company._permanentlyValid === true) {
            company._obsolete = false;
        } else {
            // Ansonsten: obsolet, wenn nicht in offizieller Liste
            company._obsolete = !isOfficial;
        }
    });

    saveUserCompanies(userCompanies);
}


// ============================================================================
// MEIN UNTERNEHMEN - VERWALTUNG
// ============================================================================

// Funktion zum Speichern des Standard-Unternehmens
function setAsMyCompany() {
    const dropdown = document.getElementById('allCompaniesDropdown');
    const selectedName = dropdown.value;
    
    if (!selectedName) {
        zeigeModal('Bitte wählen Sie zuerst ein Unternehmen aus.');
        return;
    }
    
    const company = yamlData.find(c => c.unternehmen.name === selectedName);
    if (!company) {
        zeigeModal('Unternehmen nicht gefunden.');
        return;
    }
    
    // Speichere im Local Storage
    localStorage.setItem('myCompany', selectedName);
    
    // Aktualisiere die Anzeige
    updateMyCompanyStatus();
    
    zeigeModal(`"${selectedName}" wurde als Ihr Standard-Unternehmen gespeichert.`);
    updateLocalStorageStatus('Standard-Unternehmen gespeichert.');
}

// Funktion zum Entfernen des Standard-Unternehmens
function clearMyCompany() {
    if (!confirm('Möchten Sie Ihr Standard-Unternehmen wirklich entfernen?')) {
        return;
    }
    
    localStorage.removeItem('myCompany');
    updateMyCompanyStatus();
    
    zeigeModal('Standard-Unternehmen wurde entfernt.');
    updateLocalStorageStatus('Standard-Unternehmen entfernt.');
}

// Funktion zum Aktualisieren der Status-Anzeige
function updateMyCompanyStatus() {
    const myCompanyName = localStorage.getItem('myCompany');
    const statusDiv = document.getElementById('myCompanyStatus');
    const nameSpan = document.getElementById('myCompanyName');
    const setButton = document.getElementById('setMyCompanyButton');
    
    if (myCompanyName) {
        if (statusDiv) {
            statusDiv.style.display = 'block';
            if (nameSpan) nameSpan.textContent = myCompanyName;
        }
        // Prüfe ob das aktuell ausgewählte Unternehmen bereits Modellunternehmen ist
        const dropdown = document.getElementById('allCompaniesDropdown');
        if (setButton && dropdown) {
            setButton.disabled = (dropdown.value === myCompanyName);
        }
    } else {
        if (statusDiv) statusDiv.style.display = 'none';
        if (setButton) setButton.disabled = false;
    }
}

// Funktion zum automatischen Auswählen in Dropdowns mit class="meinUnternehmen"
function autoSelectMyCompany() {
    const myCompanyName = localStorage.getItem('myCompany');
    
    if (!myCompanyName) return;
    
    // Finde alle Dropdowns mit der Klasse "meinUnternehmen"
    const dropdowns = document.querySelectorAll('select.meinUnternehmen');
    
    dropdowns.forEach(dropdown => {
        // Suche nach der passenden Option
        const options = Array.from(dropdown.options);
        const matchingOption = options.find(opt => opt.value === myCompanyName);
        
        if (matchingOption) {
            dropdown.value = myCompanyName;
            
            // Trigger change event falls andere Scripts darauf reagieren
            const event = new Event('change', { bubbles: true });
            dropdown.dispatchEvent(event);
            
            console.log(`"${myCompanyName}" automatisch in Dropdown ausgewählt`);
        }
    });
}

// Zufällige gültige Werte erzeugen
function generateRandomField(type) {
    switch (type) {
        case 'iban':
            const ibanCheck = document.getElementById('randomIBAN');
            if (!ibanCheck.checked) return;
            let ibanDigits = '';
            for (let i = 0; i < 20; i++) ibanDigits += Math.floor(Math.random() * 10);
            document.getElementById('newCompanyIBAN').value = 'DE' + ibanDigits;
            break;

        case 'bic':
            const bicCheck = document.getElementById('randomBIC');
            if (!bicCheck.checked) return;
            const banks = ['COBA', 'DEUT', 'HYVE', 'INGD', 'BYLA', 'DRES', 'UNCR'];
            const suffix = Math.random() > 0.5 ? 'FFXXX' : 'DBXXX';
            document.getElementById('newCompanyBIC').value = 
                banks[Math.floor(Math.random() * banks.length)] + 'DE' + suffix;
            break;

        case 'ustid':
            const ustCheck = document.getElementById('randomUstID');
            if (!ustCheck.checked) return;
            let ustDigits = '';
            for (let i = 0; i < 9; i++) ustDigits += Math.floor(Math.random() * 10);
            document.getElementById('newCompanyUstID').value = 'DE' + ustDigits;
            break;

        case 'steuernummer':
            const steuerCheck = document.getElementById('randomSteuernummer');
            if (!steuerCheck.checked) return;
            const fa = Math.floor(100 + Math.random() * 900);   // 100-999
            const nr = Math.floor(1000 + Math.random() * 9000); // 1000-9999
            const suffixx = Math.floor(10000 + Math.random() * 90000);
            document.getElementById('newCompanySteuernummer').value = 
                `${fa}/${nr}/${suffixx}`;
            break;
    }
}


// Fertigerzeugnis-Eingabezeile hinzufügen
function addFertigerzeugnisRow(produkt = {}) {
    const container = document.getElementById('newCompanyFertigerzeugnisse');
    if (!container) return;

    const row = document.createElement('div');

    row.className = 'fertigerzeugnis-row';
    row.style.cssText =
        'display:flex; flex-wrap:wrap; gap:8px; margin-bottom:8px; align-items:center;';

    const name = document.createElement('input');
    name.type = 'text';
    name.className = 'fertigerzeugnis-name';
    name.placeholder = 'Produktbezeichnung (Plural, z. B. Bürostühle)';
    name.maxLength = 80;
    name.value = produkt.name || '';
    name.style.cssText = 'flex:3 1 220px; min-width:0;';

    const preisMin = document.createElement('input');
    preisMin.type = 'number';
    preisMin.className = 'fertigerzeugnis-preis-min';
    preisMin.placeholder = 'Preis min.';
    preisMin.min = '0';
    preisMin.step = '0.01';
    preisMin.value = produkt.preis_min ?? '';
    preisMin.style.cssText = 'flex:1 1 110px; min-width:0;';

    const preisMax = document.createElement('input');
    preisMax.type = 'number';
    preisMax.className = 'fertigerzeugnis-preis-max';
    preisMax.placeholder = 'Preis max.';
    preisMax.min = '0';
    preisMax.step = '0.01';
    preisMax.value = produkt.preis_max ?? '';
    preisMax.style.cssText = 'flex:1 1 110px; min-width:0;';

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = '✕';
    removeButton.title = 'Fertigerzeugnis entfernen';
    removeButton.style.cssText =
        'background:#dc3545; color:white; border:0; border-radius:4px; padding:7px 10px; cursor:pointer;';

    removeButton.addEventListener('click', () => row.remove());

    row.append(name, preisMin, preisMax, removeButton);
    container.appendChild(row);
}


// Fertigerzeugnisse aus dem Formular auslesen
function getFertigerzeugnisseFromForm() {
    const rows = document.querySelectorAll(
        '#newCompanyFertigerzeugnisse .fertigerzeugnis-row'
    );

    const produkte = [];

    rows.forEach(row => {
        const name = row.querySelector('.fertigerzeugnis-name').value.trim();
        const minValue = row.querySelector('.fertigerzeugnis-preis-min').value;
        const maxValue = row.querySelector('.fertigerzeugnis-preis-max').value;

        // Leere Zeilen ignorieren
        if (!name && !minValue && !maxValue) return;

        if (!name || minValue === '' || maxValue === '') {
            throw new Error(
                'Bitte bei jedem Fertigerzeugnis Bezeichnung und beide Preise angeben.'
            );
        }

        const preisMin = Number(minValue);
        const preisMax = Number(maxValue);

        if (
            !Number.isFinite(preisMin) ||
            !Number.isFinite(preisMax) ||
            preisMin < 0 ||
            preisMax < preisMin
        ) {
            throw new Error(
                'Bitte prüfen Sie die Preise. Der Höchstpreis muss mindestens so hoch wie der Mindestpreis sein.'
            );
        }

        produkte.push({
            name: CompanyValidation.sanitizeInput(name),
            preis_min: preisMin,
            preis_max: preisMax
        });
    });

    return produkte;
}


// Fertigerzeugnisse im Formular anzeigen
function setFertigerzeugnisseInForm(produkte) {
    const container = document.getElementById('newCompanyFertigerzeugnisse');
    if (!container) return;

    container.innerHTML = '';

    if (Array.isArray(produkte) && produkte.length > 0) {
        produkte.forEach(produkt => addFertigerzeugnisRow(produkt));
    } else {
        addFertigerzeugnisRow();
    }
}


// ===== Werkstoffe: Eingabezeilen (Bezeichnung, Einheit, Preis min/max) mit Plus-Button =====
const WERKSTOFF_FELDER = ['newCompanyAWR', 'newCompanyAWF', 'newCompanyAWH', 'newCompanyAWB'];

// Stammlieferer (Unternehmens-ID) je Werkstoffkategorie – beim Speichern automatisch gesetzt
const WERKSTOFF_STAMMLIEFERANT = { AWR: '106', AWF: '67', AWH: '16', AWB: '22' };

// Formular-ID -> Kategorie (newCompanyAWR -> AWR)
function werkstoffKategorie(id) {
    return id.replace('newCompany', '');
}

// Zeilen -> verstecktes Textarea (nur Bezeichnungen, bleibt der Abwärtskompatibilität erhalten)
function syncWerkstoffTextarea(id) {
    const ta = document.getElementById(id);
    const list = document.getElementById(id + 'Rows');
    if (!ta || !list) return;
    ta.value = Array.from(list.querySelectorAll('.werkstoff-input'))
        .map(input => input.value.trim())
        .filter(Boolean)
        .join('\n');
}

// value: alter Bestandswert (reiner String) oder neues Objekt
// { name, einheit, preis_min, preis_max }
function addWerkstoffRow(id, value = '') {
    const list = document.getElementById(id + 'Rows');
    if (!list) return;

    const w = (value && typeof value === 'object') ? value : { name: value };

    const row = document.createElement('div');
    row.className = 'werkstoff-row';
    row.style.cssText = 'margin-bottom:10px; padding-bottom:8px; border-bottom:1px dashed #e0e0e0;';

    // Zeile 1: Bezeichnung + Entfernen-Button
    const top = document.createElement('div');
    top.style.cssText = 'display:grid; grid-template-columns:1fr auto; gap:8px; align-items:center;';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'werkstoff-input';
    input.placeholder = 'Werkstoffbezeichnung';
    input.maxLength = 80;
    input.value = w.name || '';
    input.style.minWidth = '0';
    input.addEventListener('input', () => syncWerkstoffTextarea(id));

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.textContent = '✕';
    removeButton.title = 'Werkstoff entfernen';
    removeButton.style.cssText =
        'background:#dc3545; color:white; border:0; border-radius:4px; padding:7px 10px; cursor:pointer;';
    removeButton.addEventListener('click', () => {
        row.remove();
        if (!list.querySelector('.werkstoff-row')) addWerkstoffRow(id); // immer mind. 1 Zeile
        syncWerkstoffTextarea(id);
    });

    top.append(input, removeButton);

    // Zeile 2: Einheit + Preisspanne (bricht bei schmalem Platz um; Stammlieferer wird automatisch hinterlegt)
    const details = document.createElement('div');
    details.style.cssText = 'display:flex; flex-wrap:wrap; gap:6px; margin-top:6px;';

    const einheit = document.createElement('input');
    einheit.type = 'text';
    einheit.className = 'werkstoff-einheit';
    einheit.placeholder = 'Einheit';
    einheit.maxLength = 5;
    einheit.value = w.einheit || '';
    einheit.title = 'Einheit (max. 5 Zeichen)';
    einheit.style.cssText = 'flex:1 1 80px; min-width:0;';

    const preisMin = document.createElement('input');
    preisMin.type = 'number';
    preisMin.className = 'werkstoff-preis-min';
    preisMin.placeholder = 'Preis min.';
    preisMin.title = 'Preis minimum in € (größer als 0)';
    preisMin.min = '0.01';
    preisMin.step = '0.01';
    preisMin.value = w.preis_min ?? '';
    preisMin.style.cssText = 'flex:1 1 100px; min-width:0;';

    const preisMax = document.createElement('input');
    preisMax.type = 'number';
    preisMax.className = 'werkstoff-preis-max';
    preisMax.placeholder = 'Preis max.';
    preisMax.title = 'Preis maximum in € (größer als 0)';
    preisMax.min = '0.01';
    preisMax.step = '0.01';
    preisMax.value = w.preis_max ?? '';
    preisMax.style.cssText = 'flex:1 1 100px; min-width:0;';

    details.append(einheit, preisMin, preisMax);
    row.append(top, details);
    list.appendChild(row);
}

// Werkstoffe inkl. Einheit und Preisspanne aus dem Formular auslesen.
// Der Stammlieferer wird je Kategorie automatisch ergänzt (WERKSTOFF_STAMMLIEFERANT).
function getWerkstoffeFromForm(id) {
    const list = document.getElementById(id + 'Rows');
    const kategorie = werkstoffKategorie(id);
    const items = [];
    if (!list) return items;

    list.querySelectorAll('.werkstoff-row').forEach(row => {
        const name = row.querySelector('.werkstoff-input').value.trim();
        const einheit = row.querySelector('.werkstoff-einheit').value.trim();
        const minVal = row.querySelector('.werkstoff-preis-min').value;
        const maxVal = row.querySelector('.werkstoff-preis-max').value;

        // Völlig leere Zeilen ignorieren
        if (!name && !einheit && !minVal && !maxVal) return;

        if (!name || !einheit || minVal === '' || maxVal === '') {
            throw new Error(
                `Bitte bei jedem Werkstoff (${kategorie}) Bezeichnung, Einheit und beide Preise angeben.`
            );
        }

        if (containsDangerousChars(name) || containsDangerousChars(einheit)) {
            throw new Error(
                `Ungültige Zeichen im Werkstoff "${kategorie}" erkannt: Die Zeichen <, >, {, } sind nicht erlaubt.`
            );
        }

        if (einheit.length > 5) {
            throw new Error(
                `Die Einheit bei "${name}" (${kategorie}) darf höchstens 5 Zeichen haben.`
            );
        }

        const preisMin = Number(minVal);
        const preisMax = Number(maxVal);

        if (
            !Number.isFinite(preisMin) ||
            !Number.isFinite(preisMax) ||
            preisMin <= 0 ||
            preisMax <= 0 ||
            preisMax < preisMin
        ) {
            throw new Error(
                `Bitte die Preise bei "${name}" (${kategorie}) prüfen: Beide Preise müssen größer als 0 sein und der Höchstpreis mindestens so hoch wie der Mindestpreis.`
            );
        }

        items.push({
            name: CompanyValidation.sanitizeInput(name),
            stammlieferant: WERKSTOFF_STAMMLIEFERANT[kategorie] || null,
            einheit: CompanyValidation.sanitizeInput(einheit),
            preis_min: preisMin,
            preis_max: preisMax
        });
    });

    return items;
}

// Liste im Formular setzen (leeres Array = zurücksetzen)
function setWerkstoffeInForm(id, werte) {
    initWerkstoffUI();
    const list = document.getElementById(id + 'Rows');
    if (!list) return;

    list.innerHTML = '';
    const items = Array.isArray(werte) && werte.length > 0 ? werte : [''];
    items.forEach(w => addWerkstoffRow(id, w));
    syncWerkstoffTextarea(id);
}

// Baut pro Textarea die Zeilen-Oberfläche + Plus-Button (nur einmal)
function initWerkstoffUI() {
    WERKSTOFF_FELDER.forEach(id => {
        const ta = document.getElementById(id);
        if (!ta || document.getElementById(id + 'Rows')) return;

        ta.style.display = 'none';
        ta.removeAttribute('required'); // sonst blockiert das versteckte Feld das Absenden

        const wrapper = document.createElement('div');

        const list = document.createElement('div');
        list.id = id + 'Rows';

        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.textContent = '+ Werkstoff hinzufügen';
        addButton.style.cssText =
            'background:#28a745; color:white; border:0; border-radius:4px; padding:7px 12px; cursor:pointer;';
        addButton.addEventListener('click', () => {
            addWerkstoffRow(id);
            list.querySelector('.werkstoff-row:last-child .werkstoff-input')?.focus();
        });

        wrapper.append(list, addButton);
        ta.insertAdjacentElement('afterend', wrapper);

        // vorhandenen Textarea-Inhalt übernehmen
        const vorhanden = ta.value.split('\n').map(s => s.trim()).filter(Boolean);
        (vorhanden.length ? vorhanden : ['']).forEach(w => addWerkstoffRow(id, w));
    });
}


document.addEventListener('DOMContentLoaded', function () {
    setFertigerzeugnisseInForm([]);
    initWerkstoffUI();
});