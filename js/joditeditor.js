// js/joditeditor.js
// Jodit-basierter Rich-Text-Editor fuer textbasierte Bereiche.
// SVG-Container (Beleg-Vorschauen) werden uebersprungen.
// Lazy-Init: Jodit wird erst beim ersten setContent-Aufruf erstellt.

(function () {
  "use strict";

  const managed = new Set();

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function isJodit(el) {
    return !!(
      el &&
      el._jodit &&
      el._jodit.editor &&
      el._jodit.editor.isConnected
    );
  }

  function mitSeitenumbruch(html) {
    if (!html || html.indexOf('class="seitenumbruch"') !== -1) return html;
    return html.replace(
      /<h2 class="loesung">/g,
      '<div class="seitenumbruch"></div><h2 class="loesung">',
    );
  }

  function normHtml(s) {
    const d = document.createElement("div");
    d.innerHTML = s || "";
    return d.innerHTML;
  }

  function destroyJodit(el) {
    const j = el._jodit;
    el._jodit = null;
    if (!j) return;
    try {
      j.destruct();
    } catch (e) {}
    try {
      if (j.container && j.container.parentNode)
        j.container.parentNode.removeChild(j.container);
    } catch (e) {}
    el.style.display = "";
  }

  async function belegAlsPng(content) {
    if (!content) return null;
    const trimmed = content.trim();
    if (trimmed.startsWith("<svg")) {
      const root = new DOMParser().parseFromString(
        trimmed,
        "image/svg+xml",
      ).documentElement;
      const g = svgGroesse(root);
      return svgZuPng(root, g.w, g.h);
    }
    if (!content.startsWith("data:image/") && !content.startsWith("blob:")) {
      if (trimmed.startsWith("<") && typeof window.html2canvas === "function") {
        const holder = document.createElement("div");
        holder.style.cssText =
          "position:fixed;left:-9999px;top:0;background:#fff;display:inline-block;";
        holder.innerHTML = content;
        document.body.appendChild(holder);
        try {
          const target = holder.firstElementChild || holder;
          const canvas = await window.html2canvas(target, {
            scale: 2,
            backgroundColor: "#ffffff",
          });
          return canvas.toDataURL("image/png");
        } finally {
          holder.remove();
        }
      }
      return null;
    }
    const blob = await (await fetch(content)).blob();
    if (blob.type === "image/svg+xml" || content.startsWith("data:image/svg")) {
      const root = new DOMParser().parseFromString(
        await blob.text(),
        "image/svg+xml",
      ).documentElement;
      const g = svgGroesse(root);
      return svgZuPng(root, g.w, g.h);
    }
    const url = URL.createObjectURL(blob);
    try {
      const img = await new Promise(function (resolve, reject) {
        const i = new Image();
        i.onload = function () {
          resolve(i);
        };
        i.onerror = reject;
        i.src = url;
      });
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const g = c.getContext("2d");
      g.fillStyle = "#fff";
      g.fillRect(0, 0, c.width, c.height);
      g.drawImage(img, 0, 0);
      return c.toDataURL("image/png");
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function einfuegenAusSammlungJodit(editor) {
    if (!window.Collection) {
      zeigeModal("Sammlung nicht verfügbar.");
      return;
    }
    let cols = [];
    let aktiveId = null;
    let items = [];
    try {
      await Collection.ensureDefaultCollection();
      cols = await Collection.getCollections();
      if (!cols || cols.length === 0) {
        zeigeModal("Es existiert keine Sammlung.");
        return;
      }
      aktiveId = Collection.getActiveCollectionId();
      if (!cols.some((c) => c.id === aktiveId)) aktiveId = cols[0].id;
      items = await Collection.getItems(aktiveId);
    } catch (e) {
      console.error(e);
      zeigeModal("Fehler beim Laden der Sammlung.");
      return;
    }

    let savedRange = null;
    try {
      editor.selection.save();
    } catch (e) {}
    try {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0)
        savedRange = sel.getRangeAt(0).cloneRange();
    } catch (e) {}

    const overlay = document.createElement("div");
    overlay.style.cssText =
      "position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:9999;";
    const box = document.createElement("div");
    box.style.cssText =
      "background:#fff;border-radius:10px;padding:18px;max-width:520px;width:92%;max-height:85vh;display:flex;flex-direction:column;box-shadow:0 8px 24px rgba(0,0,0,.25);";
    const optionen = cols
      .map(
        (c) =>
          '<option value="' +
          escapeHtml(c.id) +
          '"' +
          (c.id === aktiveId ? " selected" : "") +
          ">" +
          escapeHtml(c.name || "Unbenannt") +
          "</option>",
      )
      .join("");
    box.innerHTML =
      '<h3 style="margin:0 0 12px;">Beleg aus Sammlung einfügen</h3>' +
      '<label style="display:block;margin-bottom:6px;font-weight:600;">Sammlung</label>' +
      '<select id="pickCollection" style="width:100%;padding:6px;margin-bottom:10px;border:1px solid #ccc;border-radius:4px;">' +
      optionen +
      "</select>" +
      '<label style="display:block;margin-bottom:6px;font-weight:600;">Größe</label>' +
      '<select id="pickSize" style="width:100%;padding:6px;margin-bottom:10px;border:1px solid #ccc;border-radius:4px;">' +
      '<option value="200">200 px</option>' +
      '<option value="300">300 px</option>' +
      '<option value="400">400 px</option>' +
      '<option value="500" selected>500 px</option>' +
      '<option value="600">600 px</option>' +
      '<option value="700">700 px</option>' +
      '<option value="800">800 px</option>' +
      "</select>" +
      '<div id="pickList" style="display:grid;gap:8px;flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;padding-right:4px;"></div>';
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    const list = box.querySelector("#pickList");

    function zeichEintraefe(eintragListe) {
      list.innerHTML = "";
      if (!eintragListe || eintragListe.length === 0) {
        list.innerHTML =
          '<p style="margin:4px 0;color:#666;font-style:italic;">Diese Sammlung ist leer – bitte eine andere Sammlung wählen oder Belege über „+ Sammlung“ hinzufügen.</p>';
        return;
      }
      eintragListe.forEach(function (it) {
        const row = document.createElement("div");
        row.style.cssText =
          "display:flex;gap:8px;align-items:center;padding:6px;border:1px solid #ddd;border-radius:6px;cursor:pointer;";
        const thumb = document.createElement("div");
        thumb.style.cssText =
          "width:60px;height:40px;overflow:hidden;background:#f7f7f7;border-radius:4px;flex-shrink:0;";
        thumb.innerHTML = it.thumbnail || it.content || "";
        const info = document.createElement("div");
        info.style.flex = "1";
        info.innerHTML =
          '<strong style="font-size:.9rem;">' +
          escapeHtml(it.title) +
          '</strong><br><span style="font-size:.75rem;color:#555;">' +
          it.type +
          "</span>";
        row.appendChild(thumb);
        row.appendChild(info);
        row.addEventListener("click", async function () {
          const size = document.getElementById("pickSize")
            ? document.getElementById("pickSize").value
            : "700";
          const pct = size + "px";
          const breite = size + "px";
          const content = it.content || "";
          let png =
            it.pngContent && it.pngContent.startsWith("data:image/png")
              ? it.pngContent
              : null;
          if (!png) {
            try {
              png = await belegAlsPng(content);
            } catch (e) {
              console.warn("Beleg konnte nicht als PNG erzeugt werden", e);
            }
          }
          try {
            editor.focus();
          } catch (e) {}
          try {
            editor.selection.restore();
          } catch (e) {}
          if (savedRange) {
            try {
              const sel = window.getSelection();
              sel.removeAllRanges();
              sel.addRange(savedRange);
            } catch (e) {}
          }
          let html = content;
          if (png) {
            html =
              '<img src="' +
              png +
              '" style="max-width:100%;width:' +
              breite +
              ';height:auto;display:block;margin:10px auto;border-radius:4px;" />';
          } else if (content.startsWith("data:image/")) {
            html =
              '<img src="' +
              content +
              '" style="max-width:100%;width:' +
              breite +
              ';height:auto;display:block;margin:10px auto;border-radius:4px;" />';
          } else if (content.trim().startsWith("<svg")) {
            //_feat Beleg bleibt portabel: Inline-SVG vorab zu einer base64-Daten-URL
            // (PNG) wandeln, damit kopierter Quelltext (z. B. Moodle-Textfeld)
            // das Bild überall anzeigt – blob:-Quellen und rohe <svg>-Blöcke
            // überlebeten einen Editor-/Moodle-Wechsel nicht.
            try {
              const root = new DOMParser().parseFromString(
                content,
                "image/svg+xml",
              ).documentElement;
              const g = svgGroesse(root);
              const pngAusSvg = await svgZuPng(root, g.w, g.h);
              html =
                '<img src="' +
                pngAusSvg +
                '" style="max-width:100%;width:' +
                breite +
                ';height:auto;display:block;margin:10px auto;border-radius:4px;" />';
            } catch (e) {
              console.warn("SVG konnte nicht zu base64 konvertiert werden", e);
              html =
                '<div style="margin:10px 0;">' +
                content.replace(
                  /<svg/g,
                  '<svg style="max-width:' +
                    pct +
                    ";width:" +
                    pct +
                    ';height:auto;"',
                ) +
                "</div>";
            }
          } else {
            html =
              '<div style="margin:10px 0;">' +
              content.replace(
                /<svg/g,
                '<svg style="max-width:' +
                  pct +
                  ";width:" +
                  pct +
                  ';height:auto;"',
              ) +
              "</div>";
          }
          try {
            if (
              editor.selection &&
              typeof editor.selection.insertHTML === "function"
            )
              editor.selection.insertHTML(html);
            else if (editor.s && typeof editor.s.insertHTML === "function")
              editor.s.insertHTML(html);
            else if (typeof editor.insertHTML === "function")
              editor.insertHTML(html);
            else editor.value = (editor.value || "") + html;
          } catch (e) {
            console.warn("insertHTML failed", e);
            editor.value = (editor.value || "") + html;
          }

          // Jodit wandelt Base64-Bilder beim Einfügen im visuellen Layer in
          // blob:-URLs um – für portablen Quelltext konvertieren wir direkt
          // nach dem Einfügen zurück zu base64-Daten-URLs.
          editorZuBase64(editor).catch(function (e) {
            console.warn("Base64-Bereinigung nach Einfügen fehlgeschlagen", e);
          });
          overlay.remove();
        });
        list.appendChild(row);
      });
    }

    zeichEintraefe(items);

    // Beim Wechsel der Sammlung die Einträge dieser Sammlung laden
    box
      .querySelector("#pickCollection")
      .addEventListener("change", async function () {
        try {
          const seineItems = await Collection.getItems(this.value);
          zeichEintraefe(seineItems);
        } catch (e) {
          console.error(e);
          list.innerHTML =
            '<p style="margin:4px 0;color:#c0392b;">Einträge konnten nicht geladen werden.</p>';
        }
      });

    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.textContent = "Abbrechen";
    cancel.style.cssText =
      "margin-top:12px;padding:6px 12px;border:1px solid #ccc;border-radius:4px;background:#f5f5f5;cursor:pointer;flex-shrink:0;";
    cancel.onclick = function () {
      overlay.remove();
    };
    box.appendChild(cancel);
  }

  function blobZuDataUrl(blob) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  function svgGroesse(svg) {
    const attr = function (n) {
      const raw = svg.getAttribute(n) || "";
      if (raw.includes("%")) return 0;
      const v = parseFloat(raw);
      return v > 0 ? v : 0;
    };
    let w = attr("width"),
      h = attr("height");
    const vb = (svg.getAttribute("viewBox") || "")
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    if ((!w || !h) && vb.length === 4 && vb[2] > 0 && vb[3] > 0) {
      if (!w && !h) {
        w = vb[2];
        h = vb[3];
      } else if (!w) w = (h * vb[2]) / vb[3];
      else h = (w * vb[3]) / vb[2];
    }
    return { w: Math.round(w) || 300, h: Math.round(h) || 150 };
  }

  function svgZuPng(svg, w, h) {
    return new Promise(function (resolve, reject) {
      const clone = svg.cloneNode(true);
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clone.setAttribute("width", w);
      clone.setAttribute("height", h);
      const xml = new XMLSerializer().serializeToString(clone);
      const img = new Image();
      img.onload = function () {
        const s = 2;
        const c = document.createElement("canvas");
        c.width = w * s;
        c.height = h * s;
        const g = c.getContext("2d");
        g.fillStyle = "#fff";
        g.fillRect(0, 0, c.width, c.height);
        g.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
    });
  }

  async function svgImgZuPng(img) {
    const src = img.getAttribute("src") || "";
    const blob = await (await fetch(src)).blob();
    const doc = new DOMParser().parseFromString(
      await blob.text(),
      "image/svg+xml",
    );
    const root = doc.documentElement;
    const g = svgGroesse(root);
    img.setAttribute("src", await svgZuPng(root, g.w, g.h));
    if (!img.getAttribute("width")) img.setAttribute("width", g.w);
    if (!img.getAttribute("height")) img.setAttribute("height", g.h);
  }

  async function bildFuerWordVorbereiten(img) {
    const src = img.getAttribute("src") || "";
    if (!src) return;
    if (src.startsWith("data:") && !src.startsWith("data:image/svg")) return;
    const blob = await (await fetch(src)).blob();
    if (blob.type === "image/svg+xml" || src.startsWith("data:image/svg")) {
      await svgImgZuPng(img);
    } else {
      img.setAttribute("src", await blobZuDataUrl(blob));
    }
  }

  async function svgElementZuBild(svg) {
    const g = svgGroesse(svg);
    const png = await svgZuPng(svg, g.w, g.h);
    const img = document.createElement("img");
    img.setAttribute("src", png);
    img.setAttribute("width", g.w);
    img.setAttribute("height", g.h);
    const style = svg.getAttribute("style");
    if (style) img.setAttribute("style", style);
    svg.replaceWith(img);
  }

  async function bereiteHtmlZumKopieren(ed) {
    const wrap = document.createElement("div");
    wrap.innerHTML = ed.value;
    const svgs = Array.from(wrap.querySelectorAll("svg")).filter(function (s) {
      return !s.parentElement.closest("svg");
    });
    const imgs = Array.from(wrap.querySelectorAll("img"));
    await Promise.all([
      ...svgs.map(function (s) {
        return svgElementZuBild(s).catch(function (e) {
          console.warn("SVG konnte nicht umgewandelt werden", e);
        });
      }),
      ...imgs.map(function (i) {
        return bildFuerWordVorbereiten(i).catch(function (e) {
          console.warn("Bild konnte nicht eingebettet werden", e);
        });
      }),
    ]);
    return wrap.innerHTML;
  }

  // Sorgt dafür, dass im Editor KEINE blob:-Bildquellen, externen/relativen
  // Bild-URLs oder Inline-SVGs übrig bleiben – direkt im Editor-DOM konvertiert
  // (nicht über ed.value, weil Jodits Quelltext-Ansicht (ACE) den Inhalt im
  // "value" sonst NICHT aktualisiert und ein veralteter Quelltext stehen bleibt).
  // Ergebnis: base64-Daten-URLs (PNG), portabel für Moodle & HTML-Export.
  async function editorZuBase64(ed) {
    const root = ed && ed.editor ? ed.editor : null;
    if (!root || !root.querySelectorAll) return;
    const svgs = Array.from(root.querySelectorAll("svg")).filter(function (s) {
      return !s.parentElement.closest("svg");
    });
    const imgs = Array.from(root.querySelectorAll("img")).filter(function (i) {
      const src = i.getAttribute("src") || "";
      return !src.startsWith("data:");
    });
    await Promise.all([
      ...svgs.map(function (s) {
        return svgElementZuBild(s).catch(function (e) {
          console.warn("SVG konnte nicht konvertiert werden", e);
        });
      }),
      ...imgs.map(function (i) {
        return bildFuerWordVorbereiten(i).catch(function (e) {
          console.warn("Bild konnte nicht konvertiert werden", e);
        });
      }),
    ]);
    // Jodits internen Wert + Quelltextansicht (ACE) nachziehen, sonst laggt
    // dort der alte(bzw. blob-chen) Inhalt.
    try {
      if (typeof ed.synchronizeValues === "function") ed.synchronizeValues();
    } catch (e) {
      /* Jodit-Anno-Kopplung ohne synchronizeValues */
    }
  }

  function kopiereUeberAuswahl(html) {
    const tmp = document.createElement("div");
    tmp.style.cssText = "position:fixed;left:-9999px;top:0;";
    tmp.innerHTML = html;
    document.body.appendChild(tmp);
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(tmp);
    sel.removeAllRanges();
    sel.addRange(range);
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (e) {}
    sel.removeAllRanges();
    tmp.remove();
    return ok;
  }

  function kopiereFormatierung(ed) {
    const msg = function (text) {
      try {
        // Toast oben im sichtbaren Bereich anzeigen (Jodit-message liegt oft außerhalb des Viewports)
        let toast = document.getElementById("jodit-toast");
        if (!toast) {
          toast = document.createElement("div");
          toast.id = "jodit-toast";
          toast.style.cssText =
            "position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:99999;background:#2c3e50;color:#fff;padding:10px 18px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,.3);font-size:14px;opacity:0;transition:opacity .2s;";
          document.body.appendChild(toast);
        }
        toast.textContent = text;
        toast.style.opacity = "1";
        clearTimeout(toast._t);
        toast._t = setTimeout(function () {
          toast.style.opacity = "0";
        }, 2500);
      } catch (e) {
        try {
          ed.message.success(text);
        } catch (e2) {
          zeigeModal(text);
        }
      }
    };
    const erfolg = "Formatierter Text wurde in die Zwischenablage kopiert.";
    const htmlPromise = bereiteHtmlZumKopieren(ed);
    const text = ed.editor.innerText;
    if (navigator.clipboard && window.ClipboardItem) {
      const item = new ClipboardItem({
        "text/html": htmlPromise.then(function (html) {
          return new Blob([html], { type: "text/html" });
        }),
        "text/plain": new Blob([text], { type: "text/plain" }),
      });
      navigator.clipboard.write([item]).then(
        function () {
          msg(erfolg);
        },
        function (e) {
          console.warn("Clipboard API fehlgeschlagen, nutze Fallback", e);
          htmlPromise.then(function (html) {
            msg(
              kopiereUeberAuswahl(html) ? erfolg : "Kopieren fehlgeschlagen.",
            );
          });
        },
      );
      return;
    }
    htmlPromise.then(function (html) {
      msg(kopiereUeberAuswahl(html) ? erfolg : "Kopieren fehlgeschlagen.");
    });
  }

  function ausrichten(ed, modus) {
    const cur = ed.selection.current();
    let target = cur && cur.nodeType === 1 ? cur : cur && cur.parentElement;
    const img =
      target &&
      (target.tagName === "IMG"
        ? target
        : (target.closest && target.closest("img")) ||
          (target.querySelector &&
          target.querySelectorAll("img").length === 1 &&
          !target.textContent.trim()
            ? target.querySelector("img")
            : null));
    if (img) {
      img.style.display = "block";
      img.style.marginTop = img.style.marginTop || "10px";
      img.style.marginBottom = img.style.marginBottom || "10px";
      img.style.marginLeft = modus === "left" ? "0" : "auto";
      img.style.marginRight = "auto";
      return;
    }
    ed.execCommand(modus === "left" ? "justifyLeft" : "justifyCenter");
  }

  function initJodit(el) {
    if (!el) return null;
    //~Jodit Guard: img/svg-Kindelemente = generierte Belege -> nicht als Editor
    // übernehmen. AUSNAHME: data-jodit-init="1" (expliziter Seiten-Opt-in,
    // z. B. lb8-2-bestellmenge, wo der Container die gerenderte Aufgabe
    // inkl. Diagramm-PNG enthält und trotzdem editierbar sein soll).
    // JODIT-CUSTOM: Belege-Guard (nicht entfernen bei Updates)
    const hatBelege =
      el.querySelector && (el.querySelector("svg") || el.querySelector("img"));
    if (hatBelege && el.getAttribute("data-jodit-init") !== "1") return null;
    if (el.closest && el.closest(".jodit-workplace, .jodit-wysiwyg"))
      return null;
    if (isJodit(el)) return el._jodit;
    // Re-entrancy guard
    if (el._joditInitializing) return null;
    el._joditInitializing = true;
    // Stale cleanup (ohne destruct, um Duplikation zu vermeiden)
    // JODIT-CUSTOM: Stale-Cleanup ohne destruct (nicht entfernen bei Updates)
    if (el._jodit) {
      el._jodit = null;
      if (el.classList)
        el.classList.remove(
          "jodit-container",
          "jodit-container_editor",
          "jodit",
        );
      el.removeAttribute("contenteditable");
      // Entferne Jodit-DOM manuell
      const jw = el.querySelector && el.querySelector(".jodit-workplace");
      if (jw) jw.remove();
      const jt = el.querySelector && el.querySelector(".jodit-toolbar");
      if (jt) jt.remove();
      el.innerHTML = "";
    }
    const existing = el.innerHTML;
    el.removeAttribute("contenteditable");
    el.innerHTML = "";
    let editor = null;
    try {
      editor = Jodit.make(el, {
        height: "auto",
        minHeight: 120, // Jodits Default (200 px) überschreiben
        toolbar: true,
        toolbarAdaptive: false,
        // Kein externes CDN (cdnjs.cloudflare.com) - Ace und Beautify werden
        // lokal aus js/ geladen. Ace haengt seine Untermodule (mode-html,
        // theme-idle_fingers, worker-html, ext-searchbox) an dieselbe Basis-URL an.
        // JODIT-CUSTOM: Cloudflare/CDN-Vermeidung (nicht entfernen bei Updates)
        // Bei Jodit-Update: diese Optionen beibehalten, sonst lädt Jodit
        // von cdnjs.cloudflare.com (Datenabfluss!).
        sourceEditorCDNUrlsJS: ["js/libraries/ace.js"],
        beautifyHTMLCDNUrlsJS: [
          "js/libraries/beautify.min.js",
          "js/libraries/beautify-html.min.js",
        ],
        buttons: [
          "bold",
          "italic",
          "underline",
          "|",
          "fontsize",
          "paragraph",
          "|",
          "ul",
          "ol",
          "|",
          "beleg",
          "|",
          "alignLeft",
          "alignCenter",
          "|",
          "copyformat",
          "|",
          "drucken",
          "exportHTML",
          "source",
          "|",
          "undo",
          "redo",
        ],
        controls: {
          beleg: {
            name: "Beleg einfügen",
            icon: "📄",
            tooltip: "Beleg aus Sammlung einfügen",
            exec: function (ed) {
              einfuegenAusSammlungJodit(ed);
            },
          },
          drucken: {
            name: "Drucken",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"></path><rect x="2" y="9" width="20" height="8" rx="2" fill="currentColor"></rect><rect x="6" y="14" width="12" height="8" fill="#fff"></rect></svg>',
            tooltip: "Drucken",
            exec: function () {
              window.print();
            },
          },
          exportHTML: {
            name: "Als HTML speichern",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>',
            tooltip: "Inhalt als HTML-Datei herunterladen",
            exec: function (ed) {
              try {
                // Bereinigt exportieren: base64-Bilder statt blob:/Inline-SVG
                bereiteHtmlZumKopieren(ed).then(function (html) {
                  const blob = new Blob([html], {
                    type: "text/html;charset=utf-8",
                  });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = "page.html";
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(a.href);
                });
              } catch (e) {
                console.warn("HTML-Export fehlgeschlagen", e);
              }
            },
          },
          alignLeft: {
            name: "Linksbündig",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>',
            tooltip: "Linksbündig ausrichten (Bild oder Absatz)",
            exec: function (ed) {
              ausrichten(ed, "left");
            },
          },
          alignCenter: {
            name: "Zentriert",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="10" x2="6" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="18" y1="18" x2="6" y2="18"></line></svg>',
            tooltip: "Zentriert ausrichten (Bild oder Absatz)",
            exec: function (ed) {
              ausrichten(ed, "center");
            },
          },
          copyformat: {
            name: "Formatierung kopieren",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" height="18" width="18" viewBox="0 0 384 512"><path d="M48 448V64c0-8.8 7.2-16 16-16H224v80c0 17.7 14.3 32 32 32h80V448c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16zM64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V154.5c0-17-6.7-33.3-18.7-45.3L274.7 18.7C262.7 6.7 246.5 0 229.5 0H64zm55 241.1c-3.8-12.7-17.2-19.9-29.9-16.1s-19.9 17.2-16.1 29.9l48 160c3 10.2 12.4 17.1 23 17.1s19.9-7 23-17.1l25-83.4 25 83.4c3 10.2 12.4 17.1 23 17.1s19.9-7 23-17.1l48-160c3.8-12.7-3.4-26.1-16.1-29.9s-26.1 3.4-29.9 16.1l-25 83.4-25-83.4c-3-10.2-12.4-17.1-23-17.1s-19.9 7-23 17.1l-25 83.4-25-83.4z"></path></svg>',
            tooltip: "Formatierten Text in die Zwischenablage kopieren",
            exec: function (ed) {
              kopiereFormatierung(ed);
            },
          },
        },
      });
      // Jodits inline min-width:200px entfernen, damit CSS (330px / 0 mobil) greift
      if (editor && editor.container) {
        editor.container.style.removeProperty("min-width");
      }
    } catch (e) {
      console.error("Jodit.make failed", e);
      el._joditInitializing = false;
      el.innerHTML = existing;
      return null;
    }
    el._joditInitializing = false;
    if (existing && existing.trim() && existing.trim() !== "<br>") {
      try {
        editor.value = mitSeitenumbruch(existing);
      } catch (e) {
        console.warn("setValue failed", e);
      }
    }

    // Auto-Konvertierung zu Base64: Sobald im Inhalt Quellen auftauchen, die beim
    // Weg zu Moodle/HTML nicht überleben (blob:-URLs, Inline-SVG, externe/relative
    // Bild-URLs), werden sie automatisch zu base64-Daten-URLs (PNG) konvertiert.
    // Trigger: Jodit 'change' UND MutationObserver am Editor-DOM (programmatische
    // Änderungen wie insertHTML feuern 'change' nicht immer zuverlässig).
    // Geschützt gegen Endlosschleife – die eigene Konvertierung feuert ein
    // weiteres Event, findet aber nichts mehr zu bereinigen.
    try {
      let konvertiereLaeuft = false;
      let konvertTimer = null;
      const brauchtBereinigung = function (v) {
        v = v || "";
        return (
          v.indexOf("blob:") > -1 ||
          v.indexOf("<svg") > -1 ||
          /<img[^>]+src=["'](?!data:)/i.test(v)
        );
      };
      const versucheKonvertierung = function () {
        if (konvertiereLaeuft) return;
        const domWert = editor.editor ? editor.editor.innerHTML : "";
        if (!brauchtBereinigung(editor.value) && !brauchtBereinigung(domWert))
          return;
        konvertiereLaeuft = true;
        editorZuBase64(editor).then(
          function () {
            konvertiereLaeuft = false;
          },
          function () {
            konvertiereLaeuft = false;
          },
        );
      };
      const losBereinigen = function () {
        clearTimeout(konvertTimer);
        konvertTimer = setTimeout(versucheKonvertierung, 600);
      };
      editor.events.on("change", losBereinigen);
      if (editor.editor && window.MutationObserver) {
        const mo = new MutationObserver(losBereinigen);
        mo.observe(editor.editor, {
          childList: true,
          subtree: true,
          attributes: true,
        });
        if (window.__joditBase64Observer) window.__joditBase64Observer.push(mo);
        else window.__joditBase64Observer = [mo];
      }
      // Einmal direkt nach dem Start prüfen (Vorbelegung / Wiederherstellung)
      setTimeout(versucheKonvertierung, 400);
    } catch (e) {
      console.warn("Auto-Base64-Konvertierung nicht registriert", e);
    }

    el._jodit = editor;
    el._joditSrc = el.innerHTML;
    el._joditInitializing = false;
    managed.add(el);
    return editor;
  }

  window.JoditEditor = {
    init: initJodit,
    ensure: function (el) {
      if (!el) return null;
      if (isJodit(el)) return el._jodit;
      return initJodit(el);
    },
    setContent: function (el, html) {
      if (!el) return;
      let ed = isJodit(el) ? el._jodit : initJodit(el);
      if (ed) {
        try {
          ed.value = mitSeitenumbruch(html || "");
        } catch (e) {
          console.warn("setContent failed", e);
          el.innerHTML = html || "";
        }
      } else {
        el.innerHTML = html || "";
      }
    },
    getHTML: function (el) {
      if (isJodit(el)) return el._jodit.value;
      return el ? el.innerHTML : "";
    },
  };

  // MutationObserver: verwaltete Container nach innerHTML-Aenderungen neu initialisieren.
  // Jodit schreibt seinen Inhalt selbst in den Container zurueck; das ist durch isJodit() abgedeckt (kein Loop).
  let _joditTimer = null;
  const _joditObs = new MutationObserver(function () {
    clearTimeout(_joditTimer);
    _joditTimer = setTimeout(function () {
      managed.forEach(function (el) {
        if (!el.isConnected) {
          managed.delete(el);
          return;
        }
        if (!isJodit(el)) {
          initJodit(el);
          return;
        }
        if (el.innerHTML === el._joditSrc) return;
        const html = el.innerHTML;
        if (normHtml(html) !== normHtml(el._jodit.value)) {
          try {
            el._jodit.value = mitSeitenumbruch(html);
          } catch (e) {
            console.warn("Jodit value update failed", e);
          }
        }
        el._joditSrc = el.innerHTML;
      });
      document
        .querySelectorAll('[contenteditable="true"]')
        .forEach(function (el) {
          if (managed.has(el)) return;
          if (el.closest(".jodit-container, .jodit-wysiwyg")) return;
          // Seiten können Container bewusst ausschließen (data-jodit-skip="1"),
          // z. B. wenn der Inhalt weiterhin als SVG exportierbar bleiben soll
          if (
            el.hasAttribute("data-jodit-skip") ||
            el.closest('[data-jodit-skip="1"]')
          )
            return;
          // Generator-/Beleg-Container überspringen: inline-SVG ODER eingebettete
          // Bilder (PNG-Daten-URLs) sind erzeugte Belege, keine Editier-Umgebung
          if (
            el.querySelector &&
            (el.querySelector("svg") || el.querySelector("img"))
          )
            return;
          //_doc Auch auf Diagramm-/Aufgabenblatt-Seiten (ApexCharts) kein Jodit:
          // die Seite schreibt dort Aufgabenblätter und Diagramm-PNGs programmatisch.
          if (window.ApexCharts) return;
          initJodit(el);
        });
    }, 300);
  });

  function druckKopienAnlegen() {
    if (document.querySelector(".druck-bereich")) return;
    managed.forEach(function (el) {
      if (!isJodit(el)) return;
      const d = document.createElement("div");
      d.className = "druck-bereich";
      d.innerHTML = el._jodit.value
        .replace(/<div class="seitenumbruch"[^>]*><\/div>/g, "")
        .replace(/<div class="seitenumbruch"[^>]*>[\s\S]*?<\/div>/g, "");
      document.body.appendChild(d);
    });
  }

  function druckKopienEntfernen() {
    document.querySelectorAll(".druck-bereich").forEach(function (d) {
      d.remove();
    });
  }

  window.addEventListener("beforeprint", druckKopienAnlegen);
  window.addEventListener("afterprint", druckKopienEntfernen);

  const nativePrint = window.print.bind(window);
  window.print = function () {
    druckKopienAnlegen();
    try {
      nativePrint();
    } finally {
      druckKopienEntfernen();
    }
  };

  // Init einmalig beim Laden (lazy, nur textbasierte Container); Observer erst, wenn <body> existiert
  function initAll() {
    document
      .querySelectorAll('[contenteditable="true"]')
      .forEach(function (el) {
        if (
          el.querySelector &&
          (el.querySelector("svg") || el.querySelector("img"))
        )
          return;
        //_doc Auf Diagramm-/Aufgabenblatt-Seiten (ApexCharts) ist der contenteditable
        // Container die ERZEUGTE Ausgabe (Aufgabenblatt + Diagramm-PNG), kein
        // Text-Editor. Jodit dort zu initialiseren fress.mit den Generator-Flows,
        // weil die Seite direkt innerHTML schreibt und Jodit zwischenspeichert.
        if (window.ApexCharts) return;
        initJodit(el);
      });
    _joditObs.observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
  } else {
    initAll();
  }
})();
