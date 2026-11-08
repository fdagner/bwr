"use strict";
let wordList = [
    "0500",
    "0530",
    "0700",
    "0840",
    "0860",
    "0870",
    "0890",
    "1500",
    "2000",
    "2010",
    "2020",
    "2030",
    "2400",
    "2470",
    "2600",
    "2800",
    "2880",
    "2900",
    "3000",
    "3001",
    "3670",
    "3680",
    "3900",
    "4200",
    "4250",
    "4400",
    "4800",
    "4830",
    "4840",
    "4900",
    "5000",
    "5001",
    "5400",
    "5430",
    "5490",
    "5495",
    "5650",
    "5710",
    "5780",
    "6000",
    "6001",
    "6002",
    "6010",
    "6011",
    "6012",
    "6020",
    "6021",
    "6022",
    "6030",
    "6031",
    "6032",
    "6040",
    "6140",
    "6160",
    "6200",
    "6400",
    "6520",
    "6540",
    "6700",
    "6730",
    "6750",
    "6760",
    "6770",
    "6800",
    "6820",
    "6850",
    "6870",
    "6900",
    "6950",
    "6990",
    "7000",
    "7020",
    "7030",
    "7460",
    "7510",
    "8010",
    "8020",
  ],
  randomIndex = Math.floor(Math.random() * wordList.length),
  secret = wordList[randomIndex],
  currentAttempt = "",
  history = [];
function handleKeyDown(e) {
  !e.ctrlKey && !e.metaKey && !e.altKey && handleKey(e.key);
}
function handleKey(e) {
  if (6 === history.length || isAnimating) return;
  let t = e.toLowerCase();
  if ("enter" === t) {
    if (currentAttempt.length < 4) return;
    if (!wordList.includes(currentAttempt)) {
      zeigeKontleHinweis("Das Konto gibt es nicht in meinem Kontenplan 🙁", "warnung");
      return;
    }
    (currentAttempt === secret && showConfetti(),
      5 === history.length && currentAttempt !== secret && zeigeAntwort(secret),
      history.push(currentAttempt),
      (currentAttempt = ""),
      updateKeyboard(),
      pauseInput());
  } else
    "backspace" === t
      ? (currentAttempt = currentAttempt.slice(0, currentAttempt.length - 1))
      : /^[0123456789]$/.test(t) &&
        currentAttempt.length < 4 &&
        animatePress((currentAttempt += t).length - 1);
  updateGrid();
}
let isAnimating = !1;
function pauseInput() {
  if (isAnimating) throw Error("should never happen");
  ((isAnimating = !0),
    setTimeout(() => {
      isAnimating = !1;
    }, 2e3));
}
function buildGrid() {
  for (let e = 0; e < 6; e++) {
    let t = document.createElement("div");
    t.className = "rows";
    for (let n = 0; n < 4; n++) {
      let r = document.createElement("div");
      r.className = "cell";
      let o = document.createElement("div");
      o.className = "front";
      let l = document.createElement("div");
      l.className = "back";
      let $ = document.createElement("div");
      (($.className = "surface"),
        ($.style.transitionDelay = 300 * n + "ms"),
        $.appendChild(o),
        $.appendChild(l),
        r.appendChild($),
        t.appendChild(r));
    }
    grid.appendChild(t);
  }
}
function updateGrid() {
  for (let e = 0; e < 6; e++) {
    let t = grid.children[e];
    e < history.length
      ? drawAttempt(t, history[e], !0)
      : e === history.length
        ? drawAttempt(t, currentAttempt, !1)
        : drawAttempt(t, "", !1);
  }
}
function drawAttempt(e, t, n) {
  for (let r = 0; r < 4; r++) {
    let o = e.children[r],
      l = o.firstChild,
      $ = l.children[0],
      i = l.children[1];
    (void 0 !== t[r]
      ? (($.textContent = t[r]), (i.textContent = t[r]))
      : (($.innerHTML = '<div style="opacity: 0">X</div>'),
        (i.innerHTML = '<div style="opacity: 0">X</div>'),
        clearAnimation(o)),
      ($.style.backgroundColor = BLACK),
      ($.style.borderColor = ""),
      void 0 !== t[r] && ($.style.borderColor = MIDDLEGREY),
      (i.style.backgroundColor = getBgColor(t, r)),
      (i.style.borderColor = getBgColor(t, r)),
      n ? o.classList.add("solved") : o.classList.remove("solved"));
  }
}
let BLACK = "#ffffff",
  GREY = "#d3d6da",
  MIDDLEGREY = "#878a8c",
  LIGHTGREY = "#d3d6da",
  GREEN = "#6aaa64",
  YELLOW = "#c9b458";
function getBgColor(e, t) {
  let n = secret[t],
    r = e[t];
  return void 0 === r || -1 === secret.indexOf(r)
    ? GREY
    : n === r
      ? GREEN
      : YELLOW;
}
function buildKeyboard() {
  (buildKeyboardRow("789", !1),
    buildKeyboardRow("456", !1),
    buildKeyboardRow("123", !1),
    buildKeyboardRow("0", !0));
}
function buildKeyboardRow(e, t) {
  let n = document.createElement("div");
  if (((n.className = "keys"), t)) {
    let r = document.createElement("button");
    ((r.className = "button"),
      (r.textContent = "L\xf6schen"),
      (r.style.backgroundColor = LIGHTGREY),
      (r.onclick = () => {
        handleKey("Backspace");
      }),
      n.appendChild(r));
  }
  for (let o of e) {
    let l = document.createElement("button");
    ((l.className = "button"),
      (l.textContent = o),
      (l.style.backgroundColor = LIGHTGREY),
      (l.onclick = () => {
        handleKey(o);
      }),
      keyboardButtons.set(o, l),
      n.appendChild(l));
  }
  if (t) {
    let $ = document.createElement("button");
    (($.className = "button"),
      ($.textContent = "Enter"),
      ($.style.backgroundColor = LIGHTGREY),
      ($.onclick = () => {
        handleKey("Enter");
      }),
      n.appendChild($));
  }
  keyboard.appendChild(n);
}
function getBetterColor(e, t) {
  return e === GREEN || t === GREEN
    ? GREEN
    : e === YELLOW || t === YELLOW
      ? YELLOW
      : GREY;
}
function updateKeyboard() {
  let e = new Map();
  for (let t of history)
    for (let n = 0; n < t.length; n++) {
      let r = getBgColor(t, n),
        o = t[n],
        l = e.get(o);
      e.set(o, getBetterColor(r, l));
    }
  for (let [$, i] of keyboardButtons)
    ((i.style.backgroundColor = e.get($)), (i.style.borderColor = e.get($)));
}
function animatePress(e) {
  let t = history.length,
    n = grid.children[t].children[e];
  ((n.style.animationName = "press"),
    (n.style.animationDuration = "100ms"),
    (n.style.animationTimingFunction = "ease-out"));
}
function clearAnimation(e) {
  ((e.style.animationName = ""),
    (e.style.animationDuration = ""),
    (e.style.animationTimingFunction = ""));
}
// Eigene Konfetti-Animation ohne externe Bibliothek (canvas-confetti)
function showConfetti() {
  const colors = [
    "#2c5f2d",
    "#f1c40f",
    "#e74c3c",
    "#3498db",
    "#9b59b6",
    "#1abc9c",
    "#e67e22",
  ];
  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:hidden;z-index:9999;";
  document.body.appendChild(container);
  const count = 120;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement("div");
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 0.5;
    const duration = 2 + Math.random() * 2;
    const size = 6 + Math.random() * 8;
    const rotation = Math.random() * 360;
    piece.style.cssText = [
      "position:absolute",
      "top:-20px",
      "left:" + left + "%",
      "width:" + size + "px",
      "height:" + (size * 0.6) + "px",
      "background:" + color,
      "border-radius:2px",
      "opacity:0.9",
      "transform:rotate(" + rotation + "deg)",
      "animation:kontle-confetti-fall " +
        duration +
        "s ease-in " +
        delay +
        "s forwards",
    ].join(";");
    container.appendChild(piece);
  }
  // CSS-Keyframes einmalig einfügen
  if (!document.getElementById("kontle-confetti-style")) {
    const style = document.createElement("style");
    style.id = "kontle-confetti-style";
    style.textContent = [
      "@keyframes kontle-confetti-fall {",
      "  0% { transform: translateY(0) rotate(0deg); opacity: 1; }",
      "  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }",
      "}",
    ].join("\n");
    document.head.appendChild(style);
  }
  // Aufräumen nach Animation
  setTimeout(() => {
    container.remove();
  }, 4500);
}

// Export-Funktion (überschreibt export-buttons.js exportHTML): Erzeugt eine
// eigenständige HTML-Datei (All-in-One) mit CSS + JS inline.
async function exportHTML() {
  try {
    // CSS aus dem <style>-Block extrahieren
    const styleEl = document.querySelector("style");
    const css = styleEl ? styleEl.textContent : "";

    // JS-Code laden
    let jsCode = "";
    try {
      const resp = await fetch("js/kontle-inline.js");
      jsCode = await resp.text();
    } catch (e) {
      jsCode = "/* JS konnte nicht geladen werden */";
    }

    // Vollständiges HTML-Dokument zusammenbauen
    // </script> im JS-Code escapen, damit der exportierte HTML-Parser
    // das eingebettete Script nicht vorzeitig beendet.
    const safeJs = jsCode.replace(/<\/script>/gi, "<\\/script>");
    const scriptClose = "<" + "/script>";
    const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BwR-Kontle – Interaktives BwR-Lernspiel</title>
  <style>
${css}
  </style>
</head>
<body>
  <div class="wordle">
    <h1>BwR-Kontle</h1>
    <div id="grid"></div>
    <div id="keyboard"></div>
  </div>
  <script>
${safeJs}
  ${scriptClose}
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "BwR-Kontle.html";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
    if (typeof zeigeModal === "function") zeigeModal("Kontle wurde als HTML exportiert.");
  } catch (err) {
    console.error("Export-Fehler:", err);
    if (typeof zeigeModal === "function") zeigeModal("Export fehlgeschlagen: " + err.message);
  }
}

// Standard-Export-Funktion überschreiben (export-buttons.js lädt vorher)
window.exportHTML = exportHTML;

// Prominente Anzeige einer Hinweis-Nachricht (ersetzt alert)
function zeigeKontleHinweis(text, typ) {
  const overlay = document.createElement("div");
  overlay.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;z-index:10000;background:rgba(0,0,0,0.4);";
  const box = document.createElement("div");
  const farbe = typ === "warnung" ? "#e74c3c" : "#2c5f2d";
  box.style.cssText =
    "background:#fff;color:#2c3e50;padding:24px 32px;border-radius:12px;max-width:400px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,0.25);font-size:1.1rem;font-weight:600;";
  box.innerHTML =
    '<div style="font-size:2rem;margin-bottom:8px;">' +
    (typ === "warnung" ? "⚠️" : "ℹ️") +
    "</div>" +
    '<div style="color:' +
    farbe +
    ';">' +
    text +
    "</div>" +
    '<button id="kontleHinweisOk" style="margin-top:16px;padding:8px 24px;background:' +
    farbe +
    ';color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:1rem;">OK</button>';
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  // CSP-kompatibel: Listener statt Inline-onclick
  (box.querySelector("#kontleHinweisOk") || {}).onclick = function () {
    overlay.remove();
  };
  // Auto-Entfernung nach 4 Sekunden
  setTimeout(() => {
    if (overlay.parentElement) overlay.remove();
  }, 4000);
}

// Prominente Anzeige der Lösung (ersetzt alert(secret))
function zeigeAntwort(secret) {
  const overlay = document.createElement("div");
  overlay.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;z-index:10000;background:rgba(0,0,0,0.5);";
  const box = document.createElement("div");
  box.style.cssText =
    "background:#fff;color:#2c3e50;padding:32px 40px;border-radius:16px;max-width:420px;text-align:center;box-shadow:0 12px 48px rgba(0,0,0,0.3);";
  box.innerHTML =
    '<div style="font-size:2.5rem;margin-bottom:12px;">🏁</div>' +
    '<div style="font-size:1.1rem;color:#555;margin-bottom:8px;">Die Lösung war:</div>' +
    '<div style="font-size:2.2rem;font-weight:800;color:#2c5f2d;letter-spacing:4px;margin-bottom:16px;">' +
    secret +
    "</div>" +
    '<button id="kontleAntwortOk" style="padding:10px 28px;background:#2c5f2d;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:1rem;">OK</button>';
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  // CSP-kompatibel: Listener statt Inline-onclick
  (box.querySelector("#kontleAntwortOk") || {}).onclick = function () {
    overlay.remove();
  };
}

function loadGame() {
  let e;
  try {
    e = JSON.parse(localStorage.getItem("data"));
  } catch {}
  null != e && e.secret === secret && (history = e.history);
}
let grid = document.getElementById("grid"),
  keyboard = document.getElementById("keyboard"),
  keyboardButtons = new Map();
(loadGame(),
  buildGrid(),
  buildKeyboard(),
  updateGrid(),
  updateKeyboard(),
  window.addEventListener("keydown", handleKeyDown));
