// js/collection.js
// Zentraler Sammlungs-Store (IndexedDB) für Belege, Grafiken und Aufgaben.
// Global verfügbar über window.Collection.

(function () {
    'use strict';

    const DB_NAME = 'meinbwr_sammlung';
    const DB_VERSION = 1;
    let db = null;
    let openPromise = null;

    function genId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
    }

    function openDB() {
        return new Promise(function (resolve, reject) {
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            let fertig = false;
            req.onupgradeneeded = function (e) {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('collections')) {
                    db.createObjectStore('collections', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('items')) {
                    const store = db.createObjectStore('items', { keyPath: 'id' });
                    store.createIndex('collectionId', 'collectionId', { unique: false });
                    store.createIndex('type', 'type', { unique: false });
                }
            };
            req.onsuccess = function (e) {
                if (!fertig) { fertig = true; db = e.target.result; resolve(db); }
            };
            req.onerror = function (e) { reject(e.target.error); };
            // Blockade (andere Tab hält alte Version): nur melden, kein automatischer Reload
            req.onblocked = function () {
                console.error('[bwR-Sammlung] IndexedDB blockiert. Alle Tabs der Website schließen und neu öffnen.');
            };
        });
    }

    function ensureDB() {
        if (db) return Promise.resolve(db);
        if (!openPromise) {
            openPromise = openDB().catch(function (err) {
                console.error('[bwR-Sammlung] IndexedDB konnte nicht geöffnet werden', err);
                openPromise = null;
                throw err;
            });
        }
        return openPromise;
    }

    function tx(storeNames, mode) {
        return ensureDB().then(function (db) {
            return db.transaction(storeNames, mode);
        });
    }

    function reqPromise(request) {
        return new Promise(function (resolve, reject) {
            request.onsuccess = function () { resolve(request.result); };
            request.onerror = function () { reject(request.error); };
        });
    }

    function dispatchChanged() {
        try { document.dispatchEvent(new CustomEvent('collectionChanged')); } catch (e) {}
    }

    // ---- Collections ----
    function getCollections() {
        return ensureDB().then(function (db) {
            const t = db.transaction('collections', 'readonly');
            return reqPromise(t.objectStore('collections').getAll()).then(function (r) { return r || []; });
        });
    }

    function getCollection(id) {
        return ensureDB().then(function (db) {
            const t = db.transaction('collections', 'readonly');
            return reqPromise(t.objectStore('collections').get(id));
        });
    }

    function createCollection(name) {
        const col = {
            id: genId(),
            name: name || 'Neue Sammlung',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            cover: { title: name || 'Neue Sammlung', school: '', date: new Date().toLocaleDateString('de-DE') }
        };
        return ensureDB().then(function (db) {
            const t = db.transaction('collections', 'readwrite');
            t.objectStore('collections').add(col);
            return new Promise(function (resolve, reject) {
                t.oncomplete = function () { dispatchChanged(); resolve(col); };
                t.onerror = function () { reject(t.error); };
            });
        });
    }

    function renameCollection(id, name) {
        return getCollection(id).then(function (col) {
            if (!col) return null;
            col.name = name;
            col.cover.title = name;
            col.updatedAt = Date.now();
            return ensureDB().then(function (db) {
                const t = db.transaction('collections', 'readwrite');
                t.objectStore('collections').put(col);
                return new Promise(function (resolve, reject) {
                    t.oncomplete = function () { dispatchChanged(); resolve(col); };
                    t.onerror = function () { reject(t.error); };
                });
            });
        });
    }

    function deleteCollection(id) {
        return getItems(id).then(function (items) {
            return ensureDB().then(function (db) {
                const t = db.transaction(['collections', 'items'], 'readwrite');
                const itemStore = t.objectStore('items');
                items.forEach(function (it) { itemStore.delete(it.id); });
                t.objectStore('collections').delete(id);
                return new Promise(function (resolve, reject) {
                    t.oncomplete = function () { dispatchChanged(); resolve(); };
                    t.onerror = function () { reject(t.error); };
                });
            });
        });
    }

    function updateCollectionCover(id, patch) {
        return getCollection(id).then(function (col) {
            if (!col) return null;
            col.cover = Object.assign({}, col.cover, patch);
            col.updatedAt = Date.now();
            return ensureDB().then(function (db) {
                const t = db.transaction('collections', 'readwrite');
                t.objectStore('collections').put(col);
                return new Promise(function (resolve, reject) {
                    t.oncomplete = function () { dispatchChanged(); resolve(col); };
                    t.onerror = function () { reject(t.error); };
                });
            });
        });
    }

    // ---- Items ----
    function getItems(collectionId) {
        return ensureDB().then(function (db) {
            const t = db.transaction('items', 'readonly');
            const idx = t.objectStore('items').index('collectionId');
            return reqPromise(idx.getAll(collectionId)).then(function (r) {
                const items = r || [];
                items.sort(function (a, b) { return (a.order || 0) - (b.order || 0) || a.createdAt - b.createdAt; });
                return items;
            });
        });
    }

    function getAllItems() {
        return ensureDB().then(function (db) {
            const t = db.transaction('items', 'readonly');
            return reqPromise(t.objectStore('items').getAll()).then(function (r) { return r || []; });
        });
    }

    function getItem(id) {
        return ensureDB().then(function (db) {
            const t = db.transaction('items', 'readonly');
            return reqPromise(t.objectStore('items').get(id));
        });
    }

    function getItemCount(collectionId) {
        return getItems(collectionId).then(function (items) { return items.length; });
    }

    const MAX_ITEMS = 100;

    function addItem(item) {
        return getItemCount(item.collectionId).then(function (count) {
            if (count >= MAX_ITEMS) {
                return Promise.reject(new Error('MAX_ITEMS'));
            }
            const full = {
                id: genId(),
                collectionId: item.collectionId,
                type: item.type || 'beleg',
                title: String(item.title || 'Ohne Titel').trim().replace(/\.[a-zA-Z0-9]{2,5}$/i, '').trim(),
                content: item.content || '',
                thumbnail: item.thumbnail || '',
                svgContent: item.svgContent || null,
                htmlContent: item.htmlContent || null,
                pngContent: item.pngContent || null,
                containerId: item.containerId || null,
                belegType: item.belegType || null,
                shareUrl: item.shareUrl || null,
                formState: item.formState || null,
                parentId: item.parentId || null,
                order: count,
                createdAt: Date.now()
            };
            return ensureDB().then(function (db) {
                const t = db.transaction('items', 'readwrite');
                t.objectStore('items').add(full);
                return new Promise(function (resolve, reject) {
                    t.oncomplete = function () { dispatchChanged(); resolve(full); };
                    t.onerror = function () { reject(t.error); };
                });
            });
        });
    }

    function addItems(items) {
        const results = [];
        return items.reduce(function (p, it) {
            return p.then(function () { return addItem(it).then(function (r) { results.push(r); }); });
        }, Promise.resolve()).then(function () { return results; });
    }

    function updateItem(id, patch) {
        return getItem(id).then(function (item) {
            if (!item) return null;
            if (patch && patch.title) {
                patch = Object.assign({}, patch, { title: String(patch.title).trim().replace(/\.[a-zA-Z0-9]{2,5}$/i, '').trim() });
            }
            Object.assign(item, patch);
            return ensureDB().then(function (db) {
                const t = db.transaction('items', 'readwrite');
                t.objectStore('items').put(item);
                return new Promise(function (resolve, reject) {
                    t.oncomplete = function () { dispatchChanged(); resolve(item); };
                    t.onerror = function () { reject(t.error); };
                });
            });
        });
    }

    function deleteItem(id) {
        return getAllItems().then(function (all) {
            const toDelete = [id].concat(all.filter(function (it) { return it.parentId === id; }).map(function (it) { return it.id; }));
            return ensureDB().then(function (db) {
                const t = db.transaction('items', 'readwrite');
                const store = t.objectStore('items');
                toDelete.forEach(function (d) { store.delete(d); });
                return new Promise(function (resolve, reject) {
                    t.oncomplete = function () { dispatchChanged(); resolve(); };
                    t.onerror = function () { reject(t.error); };
                });
            });
        });
    }

    function reorderItems(collectionId, orderedIds) {
        return ensureDB().then(function (db) {
            const t = db.transaction('items', 'readwrite');
            const store = t.objectStore('items');
            orderedIds.forEach(function (id, idx) {
                const req = store.get(id);
                req.onsuccess = function () {
                    const it = req.result;
                    if (it) { it.order = idx; store.put(it); }
                };
            });
            return new Promise(function (resolve, reject) {
                t.oncomplete = function () { dispatchChanged(); resolve(); };
                t.onerror = function () { reject(t.error); };
            });
        });
    }

    function clearCollection(collectionId) {
        return getItems(collectionId).then(function (items) {
            return ensureDB().then(function (db) {
                const t = db.transaction('items', 'readwrite');
                const store = t.objectStore('items');
                items.forEach(function (it) { store.delete(it.id); });
                return new Promise(function (resolve, reject) {
                    t.oncomplete = function () { dispatchChanged(); resolve(); };
                    t.onerror = function () { reject(t.error); };
                });
            });
        });
    }

    // Active collection (remembered across pages)
    async function populateSelect(selectId) {
        const sel = document.getElementById(selectId);
        if (!sel) return;
        const cols = await getCollections();
        const active = getActiveCollectionId();
        sel.innerHTML = '';
        cols.forEach(function (c) {
            const o = document.createElement('option');
            o.value = c.id;
            o.textContent = c.name;
            if (c.id === active) o.selected = true;
            sel.appendChild(o);
        });
        const no = document.createElement('option');
        no.value = '__new__';
        no.textContent = '+ Neue Sammlung...';
        sel.appendChild(no);
        sel.onchange = async function () {
            if (sel.value === '__new__') {
                const name = prompt('Name der neuen Sammlung:');
                if (!name) { sel.value = active; return; }
                const c = await createCollection(name);
                setActiveCollectionId(c.id);
                await populateSelect(selectId);
            } else {
                setActiveCollectionId(sel.value);
            }
        };
    }

    function showCollectDialog(options) {
        options = options || {};
        return new Promise(function (resolve) {
            // Overlay
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:9999;';
            const box = document.createElement('div');
            box.style.cssText = 'background:#fff;border-radius:10px;padding:18px;max-width:420px;width:90%;box-shadow:0 8px 24px rgba(0,0,0,.25);';
            box.innerHTML =
                '<h3 style="margin:0 0 12px;">Zur Sammlung hinzufügen</h3>' +
                '<label style="display:block;margin-bottom:6px;font-weight:600;">Titel</label>' +
                '<input id="cdTitle" type="text" style="width:100%;padding:6px;margin-bottom:10px;border:1px solid #ccc;border-radius:4px;" value="' + escapeHtmlAttr(options.defaultTitle || '') + '" />' +
                (options.hasFormat ? '<label style="display:block;margin-bottom:6px;font-weight:600;">Format</label>' +
                '<select id="cdFormat" style="width:100%;padding:6px;margin-bottom:10px;border:1px solid #ccc;border-radius:4px;">' +
                  '<option value="png">PNG (Bild)</option>' +
                  '<option value="svg">SVG (Vektor)</option>' +
                '</select>' : '') +
                '<label style="display:block;margin-bottom:6px;font-weight:600;">Sammlung</label>' +
                '<select id="cdCollection" style="width:100%;padding:6px;margin-bottom:10px;border:1px solid #ccc;border-radius:4px;"></select>' +
                (options.hasSolution ? '<label style="display:block;margin-bottom:10px;"><input id="cdSolution" type="checkbox" checked /> Lösung mitspeichern</label>' : '') +
                '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:12px;">' +
                  '<button type="button" id="cdCancel" style="padding:6px 12px;border:1px solid #ccc;border-radius:4px;background:#f5f5f5;cursor:pointer;">Abbrechen</button>' +
                  '<button type="button" id="cdOk" style="padding:6px 12px;border:none;border-radius:4px;background:#2c5f2d;color:#fff;cursor:pointer;">' + (options.okLabel || 'Speichern') + '</button>' +
                '</div>';
            overlay.appendChild(box);
            document.body.appendChild(overlay);

            const sel = box.querySelector('#cdCollection');
            getCollections().then(function (cols) {
                const active = options.preselectCollection || getActiveCollectionId();
                sel.innerHTML = '';
                cols.forEach(function (c) {
                    const o = document.createElement('option');
                    o.value = c.id; o.textContent = c.name;
                    if (c.id === active) o.selected = true;
                    sel.appendChild(o);
                });
                const no = document.createElement('option');
                no.value = '__new__'; no.textContent = '+ Neue Sammlung...';
                sel.appendChild(no);
            });

            function close(result) { overlay.remove(); resolve(result); }
            box.querySelector('#cdCancel').onclick = function () { close(null); };
            box.querySelector('#cdOk').onclick = async function () {
                const title = box.querySelector('#cdTitle').value.trim();
                let cid = sel.value;
                if (cid === '__new__') {
                    const name = prompt('Name der neuen Sammlung:');
                    if (!name) { close(null); return; }
                    const c = await createCollection(name);
                    cid = c.id;
                    setActiveCollectionId(cid);
                } else {
                    setActiveCollectionId(cid);
                }
                const includeSol = options.hasSolution ? box.querySelector('#cdSolution').checked : false;
                const format = options.hasFormat ? (box.querySelector('#cdFormat')?.value || 'png') : null;
                close({ title: title || options.defaultTitle || 'Eintrag', collectionId: cid, includeSolution: includeSol, format: format });
            };
            // Enter key
            box.querySelector('#cdTitle').addEventListener('keydown', function (e) { if (e.key === 'Enter') box.querySelector('#cdOk').click(); });
        });
    }

    function escapeHtmlAttr(s) { return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'); }

    function getActiveCollectionId() {
        return localStorage.getItem('activeCollectionId');
    }
    function setActiveCollectionId(id) {
        if (localStorage.getItem('activeCollectionId') === id) return;
        localStorage.setItem('activeCollectionId', id);
        dispatchChanged();
    }

    async function ensureDefaultCollection() {
        const cols = await getCollections();
        if (cols.length === 0) {
            const c = await createCollection('Meine Sammlung');
            setActiveCollectionId(c.id);
            return c;
        }
        if (!getActiveCollectionId() || !cols.find(function (c) { return c.id === getActiveCollectionId(); })) {
            setActiveCollectionId(cols[0].id);
        }
        return cols[0];
    }

    // Collect helper for tool pages
    async function collectItem(item) {
        await ensureDefaultCollection();
        const cid = item.collectionId || getActiveCollectionId();
        const col = await getCollection(cid);
        if (!col) throw new Error('NO_COLLECTION');
        const count = await getItemCount(cid);
        if (count >= MAX_ITEMS) {
            alert('Diese Sammlung hat das Maximum von ' + MAX_ITEMS + ' Einträgen erreicht. Bitte leere sie oder lege eine neue an.');
            throw new Error('MAX_ITEMS');
        }
        item.collectionId = cid;
        const added = await addItem(item);
        // Auto-collect solution as separate item if provided
        if (item.solutionContent) {
            await addItem({
                collectionId: cid,
                type: 'loesung',
                title: (item.title || 'Ohne Titel') + ' – Lösung',
                content: item.solutionContent,
                thumbnail: item.thumbnail || '',
                parentId: added.id
            });
        }
        return added;
    }

    // Export helpers
    function buildExportHTML(items, collection, includeSolutions) {
        // Loesungen immer ans Ende setzen
        const base = items.filter(function (it) { return it.type !== 'loesung'; });
        const sols = items.filter(function (it) { return it.type === 'loesung'; });
        const ordered = includeSolutions ? base.concat(sols) : base;
        const sections = ordered.map(function (it, idx) {
            return '<section class="entry">' +
                '<h2>' + (idx + 1) + '. ' + escapeHtml(it.title) + '</h2>' +
                '<div class="content">' + it.content + '</div>' +
                '</section>';
        }).join('\n');
        const cover = collection && collection.cover ? collection.cover : { title: collection ? collection.name : '', school: '', date: '' };
        return '<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"><title>' + escapeHtml(cover.title || 'Sammlung') + '</title>' +
            '<style>' +
            'body{font-family:Arial,sans-serif;margin:2cm;color:#222;}' +
            '.cover{text-align:center;padding:4cm 0;page-break-after:always;}' +
            '.cover h1{font-size:2.4rem;margin-bottom:.5rem;}' +
            '.entry{page-break-after:always;padding:1rem 0;}' +
            '.entry h2{font-size:1.2rem;border-bottom:1px solid #ccc;padding-bottom:.3rem;margin-bottom:1rem;}' +
            '.content svg{max-width:100%;height:auto;display:block;}' +
            '.content img{max-width:100%;height:auto;}' +
            '@media print{.no-print{display:none;}}' +
            '</style></head><body>' +
            '<div class="cover"><h1>' + escapeHtml(cover.title || 'Sammlung') + '</h1>' +
            (cover.school ? '<p>' + escapeHtml(cover.school) + '</p>' : '') +
            (cover.date ? '<p>' + escapeHtml(cover.date) + '</p>' : '') +
            '</div>' +
            sections +
            '</body></html>';
    }

    function druckenPDF() {
        const activeId = getActiveCollectionId();
        return getCollections().then(function (cols) {
            const c = cols.find(function (x) { return x.id === activeId; });
            return getItems(activeId).then(function (items) {
                const includeSol = confirm('Loesungen in den Druck einschliessen?');
                const html = buildExportHTML(items, c, includeSol);
                const w = window.open('', '_blank');
                if (!w) { alert('Popup blockiert. Bitte Popups erlauben.'); return; }
                w.document.open();
                w.document.write(html);
                w.document.close();
                w.focus();
                w.onload = function () { setTimeout(function () { w.focus(); w.print(); }, 1000); };
                // Fallback falls onload nicht feuert
                setTimeout(function () { try { w.focus(); w.print(); } catch (e) {} }, 2500);
            });
        });
    }

    function escapeHtml(s) {
        return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function downloadHTML(html, filename) {
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'sammlung.html';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    window.Collection = {
        openDB: ensureDB,
        getCollections: getCollections,
        createCollection: createCollection,
        renameCollection: renameCollection,
        deleteCollection: deleteCollection,
        getCollection: getCollection,
        updateCollectionCover: updateCollectionCover,
        getItems: getItems,
        getAllItems: getAllItems,
        getItem: getItem,
        addItem: addItem,
        addItems: addItems,
        updateItem: updateItem,
        deleteItem: deleteItem,
        reorderItems: reorderItems,
        clearCollection: clearCollection,
        getItemCount: getItemCount,
        ensureDefaultCollection: ensureDefaultCollection,
        getActiveCollectionId: getActiveCollectionId,
        setActiveCollectionId: setActiveCollectionId,
        populateSelect: populateSelect,
        collectItem: collectItem,
        showCollectDialog: showCollectDialog,
        buildExportHTML: buildExportHTML,
        downloadHTML: downloadHTML,
        druckenPDF: druckenPDF,
        MAX_ITEMS: MAX_ITEMS
    };

    ensureDefaultCollection().catch(function (e) { console.warn('Collection init failed', e); });
})();
