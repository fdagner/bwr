// js/belege-zufall.js
// Zufällige Rechnungen (Buttons in belege.html -> Rechnung)
// Wird nach belege.js geladen, nutzt dessen globale Funktionen/Variablen.

function setRechnungDatumHeute() {
    const now = new Date();
    const tag = String(now.getDate()).padStart(2, '0');
    const monat = String(now.getMonth() + 1).padStart(2, '0');
    const jahr = String(now.getFullYear());
    const tagSel = document.getElementById('tag');
    const monatSel = document.getElementById('monat');
    const jahrInput = document.getElementById('jahr');
    if (tagSel) tagSel.value = tag;
    if (monatSel) monatSel.value = monat;
    if (jahrInput) jahrInput.value = jahr;
}

function zufaelligeAusgangsrechnungErstellen() {
    // Lieferer auf das gespeicherte Modellunternehmen setzen
    const myCompany = (localStorage.getItem('myCompany') || '').trim();
    const liefererSelect = document.getElementById('datenLieferer');
    if (myCompany && liefererSelect && Array.from(liefererSelect.options).some(o => o.value === myCompany)) {
        liefererSelect.value = myCompany;
    }
    const liefererName = liefererSelect?.value;
    const company = (typeof yamlData !== 'undefined' ? yamlData : []).find(c => c?.unternehmen?.name === liefererName);
    const produkte = company?.unternehmen?.fertigerzeugnisse?.hauptwerk || [];
    if (produkte.length === 0) {
        alert('Keine Fertigerzeugnisse für den gewählten Lieferer gefunden. Bitte wählen Sie ein Modell- oder Werkstoffunternehmen.');
        return;
    }
    const produkt = produkte[Math.floor(Math.random() * produkte.length)];
    const min = Number(produkt.preis_min) || 0;
    const max = Number(produkt.preis_max) || min;
    const preis = min + Math.floor(Math.random() * (max - min + 1));
    const menge = 1 + Math.floor(Math.random() * 10);

    const artikelEl = document.getElementById('artikelInput');
    const mengeEl = document.getElementById('mengeInput');
    const einheitEl = document.getElementById('einheitInput');
    const preisEl = document.getElementById('einzelpreisInput');
    const einheit = produkt.einheit || 'Stück';
    if (artikelEl) artikelEl.value = produkt.name || '';
    if (mengeEl) mengeEl.value = menge;
    if (einheitEl) einheitEl.value = einheit;
    if (preisEl) preisEl.value = preis;

    setRechnungDatumHeute();

    // Empfänger auf ein anderes zufälliges Unternehmen setzen
    try {
        const liefererName = document.getElementById('datenLieferer')?.value;
        const kandidaten = (typeof yamlData !== 'undefined' ? yamlData : [])
            .map(c => c?.unternehmen?.name)
            .filter(n => n && n !== liefererName);
        if (kandidaten.length > 0) {
            const neuerEmpfaenger = kandidaten[Math.floor(Math.random() * kandidaten.length)];
            const kundeSelect = document.getElementById('datenKunde');
            if (kundeSelect) kundeSelect.value = neuerEmpfaenger;
        }
    } catch (e) { console.warn('Empfänger-Zufall fehlgeschlagen', e); }

    try { applySVGholen(true); } catch (e) { console.warn('applySVGholen fehlgeschlagen', e); }
}

function zufaelligeEingangsrechnungErstellen() {
    // Empfänger auf das gespeicherte Modellunternehmen setzen
    const myCompany = (localStorage.getItem('myCompany') || '').trim();
    const kundeSelect = document.getElementById('datenKunde');
    if (myCompany && kundeSelect && Array.from(kundeSelect.options).some(o => o.value === myCompany)) {
        kundeSelect.value = myCompany;
    }
    const kundeName = kundeSelect?.value;
    const empfaenger = (typeof yamlData !== 'undefined' ? yamlData : []).find(c => c?.unternehmen?.name === kundeName);
    const werkstoffe = empfaenger?.unternehmen?.werkstoffe || {};
    const kategorien = ['AWR', 'AWF', 'AWH', 'AWB'].filter(k => Array.isArray(werkstoffe[k]) && werkstoffe[k].length > 0);
    if (kategorien.length === 0) {
        alert('Keine Werkstoffe für den gewählten Empfänger gefunden. Bitte wählen Sie ein Modell- oder Werkstoffunternehmen.');
        return;
    }
    const kategorie = kategorien[Math.floor(Math.random() * kategorien.length)];
    const liste = werkstoffe[kategorie];
    const werkstoff = liste[Math.floor(Math.random() * liste.length)];
    const werkstoffName = (typeof werkstoff === 'object') ? (werkstoff.name || '') : String(werkstoff || '');
    const stammlieferantId = (typeof werkstoff === 'object') ? werkstoff.stammlieferant : null;

    if (stammlieferantId != null) {
        const lieferant = (typeof yamlData !== 'undefined' ? yamlData : []).find(c => String(c?.unternehmen?.id) === String(stammlieferantId));
        if (lieferant) {
            const liefererSelect = document.getElementById('datenLieferer');
            if (liefererSelect) {
                liefererSelect.value = lieferant.unternehmen.name;
            }
        } else {
            console.warn('Stammlieferant nicht gefunden:', stammlieferantId);
        }
    }

    const menge = 10 + Math.floor(Math.random() * 91);
    const einheit = (typeof werkstoff === 'object' && werkstoff.einheit) ? werkstoff.einheit : 'Stück';
    const pmin = (typeof werkstoff === 'object' && Number.isFinite(Number(werkstoff.preis_min))) ? Number(werkstoff.preis_min) : 10;
    const pmax = (typeof werkstoff === 'object' && Number.isFinite(Number(werkstoff.preis_max))) ? Number(werkstoff.preis_max) : 200;
    const preis = pmin + Math.floor(Math.random() * (pmax - pmin + 1));

    const artikelEl = document.getElementById('artikelInput');
    const mengeEl = document.getElementById('mengeInput');
    const einheitEl = document.getElementById('einheitInput');
    const preisEl = document.getElementById('einzelpreisInput');
    if (artikelEl) artikelEl.value = werkstoffName;
    if (mengeEl) mengeEl.value = menge;
    if (einheitEl) einheitEl.value = einheit;
    if (preisEl) preisEl.value = preis;

    setRechnungDatumHeute();

    try { applySVGholen(true); } catch (e) { console.warn('applySVGholen fehlgeschlagen', e); }
}

// Explizit global exponieren
async function svgContainerToPng(container) {
    if (!container) throw new Error('Kein Container gefunden');
    const svg = container.querySelector(':scope > svg');
    if (!svg) {
        if (typeof html2canvas !== 'function') throw new Error('html2canvas nicht verfügbar');
        const target = container.firstElementChild || container;
        const canvas = await html2canvas(target, { scale: 2, backgroundColor: '#ffffff' });
        return canvas.toDataURL('image/png');
    }
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    return new Promise(function (resolve, reject) {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const vb = svg.viewBox && svg.viewBox.baseVal;
            const w = (vb && vb.width) ? vb.width : (svg.width.baseVal.value || svg.getBoundingClientRect().width || 800);
            const h = (vb && vb.height) ? vb.height : (svg.height.baseVal.value || svg.getBoundingClientRect().height || 600);
            const scale = 2;
            canvas.width = w * scale;
            canvas.height = h * scale;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('SVG konnte nicht gerendert werden')); };
        img.src = url;
    });
}

function captureBelegFormState(belegType, container) {
    const fields = {};
    if (typeof URL_PARAM_CONFIG !== 'undefined' && URL_PARAM_CONFIG[belegType]) {
        for (const [, paramConfig] of Object.entries(URL_PARAM_CONFIG[belegType])) {
            const el = document.getElementById(paramConfig.elementId);
            if (!el) continue;
            fields[paramConfig.elementId] = {
                type: paramConfig.type || (el.tagName === 'SELECT' ? 'select' : (el.tagName === 'TEXTAREA' ? 'textarea' : 'input')),
                value: el.type === 'checkbox' ? (el.checked ? '1' : '0') : el.value
            };
        }
    }
    return {
        belegType: belegType,
        fields: fields,
        containerHtml: container ? container.innerHTML : ''
    };
}

// Mapping Container-ID -> Belegtyp für Dateiname
const BELEG_CONTAINER_TYPE = {
    'rechnung1Container': 'rechnung',
    'kontoauszugContainer': 'kontoauszug',
    'quittungContainer': 'quittung',
    'kassenbonContainer': 'kassenbon',
    'emailContainer': 'email',
    'newspaperContainer': 'newspaper',
    'lohnabrechnungContainer': 'lohnabrechnung',
    'lohnjournalContainer': 'lohnjournal',
    'bescheidContainer': 'bescheid',
    'anlagenkarteContainer': 'anlagenkarte',
    'wertpapiereContainer': 'wertpapiere'
};

// Baut eine teilbare URL aus den aktuellen Formularfeldern
function buildBelegShareUrl(containerId) {
    const cid = containerId || 'rechnung1Container';
    // Belegtyp aus Container-ID ableiten
    let belegType = 'rechnung';
    if (cid.indexOf('kontoauszug') >= 0) belegType = 'kontoauszug';
    else if (cid.indexOf('quittung') >= 0) belegType = 'quittung';
    else if (cid.indexOf('kassenbon') >= 0) belegType = 'kassenbon';
    else if (cid.indexOf('email') >= 0) belegType = 'email';
    else if (cid.indexOf('newspaper') >= 0) belegType = 'newspaper';
    else if (cid.indexOf('lohnabrechnung') >= 0) belegType = 'lohnabrechnung';
    else if (cid.indexOf('lohnjournal') >= 0) belegType = 'lohnjournal';
    else if (cid.indexOf('bescheid') >= 0) belegType = 'bescheid';
    else if (cid.indexOf('anlagenkarte') >= 0) belegType = 'anlagenkarte';
    else if (cid.indexOf('wertpapiere') >= 0) belegType = 'wertpapiere';

    const params = new URLSearchParams();
    params.set('beleg', belegType);

    // 1. Wenn URL_PARAM_CONFIG verfügbar ist, dessen Felder (id -> param) nutzen
    if (typeof URL_PARAM_CONFIG !== 'undefined' && URL_PARAM_CONFIG[belegType]) {
        for (const [paramName, cfg] of Object.entries(URL_PARAM_CONFIG[belegType])) {
            const el = document.getElementById(cfg.elementId);
            if (!el) continue;
            const val = (el.type === 'checkbox') ? (el.checked ? '1' : '0') : (el.value || '');
            if (val === '' || val === null) continue;
            params.set(paramName, val);
        }
    }

    // 2. Fallback: alle Inputs/Selects erfassen (für nicht in Config gelistete Felder)
    const form = document.querySelector('.rechnung-form') || document;
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
        if (!el.id) return;
        const val = (el.type === 'checkbox') ? (el.checked ? '1' : '0') : (el.value || '');
        if (val === '' || val === null) return;
        // skip if already set via config
        // (best effort: nur setzen wenn noch nicht vorhanden)
    });

    // newspaper: contenteditable values als text param
    if (belegType === 'newspaper') {
        const hl = document.getElementById('newspaperHeadlineInput');
        const tx = document.getElementById('newspaperTextInput');
        const sr = document.getElementById('newspaperSourceInput');
        const ci = document.getElementById('newspaperColorInput');
        const cr = document.getElementById('newspaperColumnRange');
        if (hl && hl.value) params.set('ueberschrift', hl.value);
        if (tx && tx.value) params.set('text', tx.value);
        if (sr && sr.value) params.set('quelle', sr.value);
        if (ci && ci.value) params.set('farbe', ci.value);
        if (cr && cr.value) params.set('spalten', cr.value);
    }

    // email: Betreff und Text aus den contenteditable-Bereichen mitspeichern
    if (belegType === 'email') {
        const subj = document.getElementById('emailSubject');
        const body = document.getElementById('emailTextMessage');
        if (subj && subj.textContent.trim()) params.set('betreff', subj.textContent.trim());
        if (body && body.textContent.trim()) params.set('text', body.textContent.trim());
    }

    // Vorlage aus svgDropdown (generisch)
    const svgDd = document.getElementById('svgDropdown') || document.getElementById('svgDropdownEmail');
    if (svgDd && svgDd.value && !params.has('vorlage')) params.set('vorlage', svgDd.value);

    return window.location.origin + window.location.pathname.replace(/[^/]*$/, '') + 'belege.html?' + params.toString();
}

async function belegZurSammlung(containerId) {
    const cid = containerId || 'rechnung1Container';
    const container = document.getElementById(cid);
    if (!container) { alert('Keine Beleg-Vorschau gefunden.'); return; }
    const belegType = BELEG_CONTAINER_TYPE[cid] || 'rechnung';
    // Open-Beleg-Flow: Wenn dieser Beleg aus der Sammlung geöffnet wurde,
    // wird beim Speichern der URSPRÜNGLICHE Eintrag ersetzt (updateItem).
    let updateZiel = null;
    let alterTitel = null;
    if (window.belegAusSammlung && window.belegAusSammlung.id) {
        try {
            const alt = await Collection.getItem(window.belegAusSammlung.id);
            if (alt && alt.collectionId) {
                updateZiel = window.belegAusSammlung;
                alterTitel = alt.title || null;
            } else {
                window.belegAusSammlung = null;   // Eintrag gelöscht → normal
                aktualisiereSammlungButtons();
            }
        } catch (e) { window.belegAusSammlung = null; }
    }
    // Standard-Titel wie beim Export (Datum_Titel), ohne Endung
    let defaultTitle = 'Rechnung';
    try {
        if (alterTitel) {
            defaultTitle = alterTitel;   // Titel des Original-Eintrags vorschlagen
        } else if (typeof buildExportFilename === 'function') {
            defaultTitle = buildExportFilename(belegType, 'png').trim().replace(/\.[a-zA-Z0-9]{2,5}$/i, '').trim();
        } else if (typeof buildExportTitel === 'function' && typeof exportDatumString === 'function') {
            defaultTitle = (exportDatumString() + '_' + buildExportTitel(belegType)).trim().replace(/\.[a-zA-Z0-9]{2,5}$/i, '').trim();
        }
    } catch (e) { console.warn('defaultTitle failed', e); }
    const res = await Collection.showCollectDialog({ defaultTitle: defaultTitle, hasSolution: false, hasFormat: false, okLabel: updateZiel ? 'Speichern' : undefined, preselectCollection: updateZiel ? updateZiel.collectionId : undefined });
    if (!res) return;
    try {
        const isSvg = !!(container.querySelector(':scope > svg'));
        const pngContent = await svgContainerToPng(container);
        const rawInner = container.innerHTML || '';
        const svgContent = isSvg
            ? rawInner
                .replace(/&nbsp;/g, '&#160;')
                .replace(/&copy;/g, '&#169;')
                .replace(/&reg;/g, '&#174;')
                .replace(/&trade;/g, '&#8482;')
            : null;
        const htmlContent = isSvg ? null : rawInner;
        const payload = {
            collectionId: res.collectionId,
            type: 'beleg',
            title: (res.title || 'Rechnung').trim().replace(/\.[a-zA-Z0-9]{2,5}$/i, '').trim(),
            content: isSvg ? svgContent : htmlContent,
            thumbnail: '<img src="' + pngContent + '" style="max-width:100%;max-height:100%;object-fit:contain;" />',
            containerId: cid,
            belegType: belegType,
            shareUrl: buildBelegShareUrl(cid),
            pngContent: pngContent,
            svgContent: svgContent,
            htmlContent: htmlContent,
            formState: captureBelegFormState(belegType, container)
        };
        if (updateZiel) {
            // Original-Eintrag ersetzen (Titel/Reihenfolge/Sammlung bleiben erhalten)
            payload.collectionId = updateZiel.collectionId;
            await Collection.updateItem(updateZiel.id, payload);
            alert('Beleg in der Sammlung aktualisiert.');
        } else {
            await Collection.collectItem(payload);
            alert('Beleg zur Sammlung hinzufügt.');
        }
    } catch (e) {
        if (e && e.message === 'MAX_ITEMS') {
            alert('Sammlung voll (max. 100 Einträge).');
        } else {
            console.error(e);
            alert('Fehler beim Hinzufügen zur Sammlung: ' + (e && e.message ? e.message : e));
        }
    }
}

// Button-Beschriftung: im Open-Beleg-Flow „Speichern" statt „+ Sammlung"
function aktualisiereSammlungButtons() {
    const offene = !!(window.belegAusSammlung && window.belegAusSammlung.id);
    document.querySelectorAll('button[onclick*="belegZurSammlung("]').forEach(function (btn) {
        if (offene) {
            btn.textContent = '+ Speichern';
            btn.title = 'Aktualisiert den ursprünglichen Sammlungseintrag';
            btn.setAttribute('aria-label', 'Aktualisiert den ursprünglichen Sammlungseintrag');
            btn.setAttribute('data-tooltip', 'Aktualisiert den ursprünglichen Sammlungseintrag');
        } else {
            btn.textContent = '+ Sammlung';
            btn.title = 'Zur Sammlung hinzufügen';
            btn.setAttribute('aria-label', 'Zur Sammlung hinzufügen');
            btn.setAttribute('data-tooltip', 'Zur Sammlung hinzufügen');
        }
    });
}
window.belegZurSammlung = belegZurSammlung;
window.aktualisiereSammlungButtons = aktualisiereSammlungButtons;

window.setRechnungDatumHeute = setRechnungDatumHeute;
window.zufaelligeAusgangsrechnungErstellen = zufaelligeAusgangsrechnungErstellen;
window.zufaelligeEingangsrechnungErstellen = zufaelligeEingangsrechnungErstellen;