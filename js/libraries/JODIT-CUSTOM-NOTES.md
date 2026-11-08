# Jodit – Custom-Modifikationen (nicht entfernen bei Updates)

Diese Datei dokumentiert alle Stellen, an denen der Jodit-Editor von der
Standard-Konfiguration abweicht. Bei einem Jodit-Update (`jodit.min.js`,
`jodit.min.css`, `joditeditor.js`) diese Stellen per Such nach
`JODIT-CUSTOM:` finden und neu anwenden.

## 1. `js/joditeditor.js`

### 1.1 Belege-Guard (Zeile ~423–427)
- **Marker:** `// JODIT-CUSTOM: Belege-Guard`
- **Was:** Container mit SVG/img-Kindelementen (generierte Belege) werden
  standardmäßig **nicht** als Jodit-Editor übernommen. Ausnahme:
  `data-jodit-init="1"` (expliziter Opt-in, z. B. lb8-2-bestellmenge,
  lb9-4-aktienkurs).
- **Warum:** Verhindert, dass generierte Belege/Diagramme im Editor
  kaputtgehen.

### 1.2 Stale-Cleanup ohne `destruct` (Zeile ~433–434)
- **Marker:** `// JODIT-CUSTOM: Stale-Cleanup ohne destruct`
- **Was:** Bei Re-Init wird der alte Jodit-Editor nicht per `destruct()`
  zerstört, sondern manuell entfernt (Duplikation vermeiden).
- **Warum:** `destruct()` hinterlässt Artefakte bei dynamisch neu
  generierten Aufgaben.

### 1.3 `removeAttribute('contenteditable')` (Zeile ~446)
- **Marker:** (Teil des Init-Blocks)
- **Was:** Vor der Initialisierung wird `contenteditable` entfernt, um
  Duplikationen zu vermeiden.

### 1.4 Cloudflare/CDN-Vermeidung (Zeile ~455–459)
- **Marker:** `// JODIT-CUSTOM: Cloudflare/CDN-Vermeidung`
- **Was:** Ace und Beautify werden lokal aus `js/` geladen:
  ```js
  sourceEditorCDNUrlsJS: ['js/libraries/ace.js'],
  beautifyHTMLCDNUrlsJS: ['js/libraries/beautify.min.js', 'js/libraries/beautify-html.min.js'],
  ```
- **Warum:** Verhindert Datenabfluss an `cdnjs.cloudflare.com`.
- **Bei Update:** Diese Optionen **beibehalten**, sonst lädt Jodit von
  Cloudflare.

### 1.5 `minHeight: 120` (Zeile ~452)
- **Was:** Mindesthöhe des Editors auf 120 px.
- **Bei Update:** Wert beibehalten (Design-Konsistenz).

## 2. `css/style.css`

- `.output-wrapper .jodit-container { min-width: 580px !important; }`
  (Zeile ~2182) – Mindestbreite des Editors.
- `@media (max-width: 900px)`: `.output-wrapper .jodit-container {
  min-width: 0 !important; width: 100% !important; }` (Zeile ~2206) –
  Mobilanpassung.

## 3. `css/jodit.min.css`

- Unverändert (Original-Jodit-CSS). Nicht manuell editieren.

## 4. `js/libraries/jodit.min.js`

- Unverändert (Original-Jodit-JS). Nicht manuell editieren.
- Bei Update: Datei ersetzen, dann Custom-Stellen in `joditeditor.js`
  prüfen.

## Checkliste nach Jodit-Update

1. [ ] `jodit.min.js` und `jodit.min.css` ersetzen
2. [ ] `joditeditor.js` durchsuchen nach `JODIT-CUSTOM:` – alle Stellen prüfen
3. [ ] Cloudflare-Optionen (1.4) beibehalten
4. [ ] Belege-Guard (1.1) beibehalten
5. [ ] Stale-Cleanup (1.2) beibehalten
6. [ ] Testen: Belege einfügen, Editor-Init, Mobilansicht
7. [ ] Browser-Cache leeren / Cache-Bust erhöhen
