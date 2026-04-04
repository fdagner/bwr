// ============================================================================
// PROZENTRECHNEN – ALLTAGSAUFGABEN GENERATOR
// Alle Ergebnisse ganzzahlig (Vielfache von 5 oder 10) – rückwärts konstruiert
// ============================================================================

// ── Hilfsfunktionen ──────────────────────────────────────────────────────────
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Euro-Beträge: Tausenderpunkt nach deutschem Standard (1.000 €)
function fmtE(n) {
  return n.toLocaleString('de-DE');
}

// Stückzahlen (Personen, Schüler, mAh usw.): schmales Leerzeichen als Tausendertrenner (1 000)
function fmt(n) {
  return n.toLocaleString('de-DE').replace(/\./g, '\u202F');
}

// Lösungs-Builder: je nach Einheit den richtigen Formatter wählen
function fmtU(n, einheit) {
  return einheit === '€' ? fmtE(n) : fmt(n);
}

// ============================================================================
// AUFGABEN-DATENBANK
// Struktur: { sache, einheit, kategorie, emoji, daten[], textW, textG, textp, textGv, textGe }
// daten[]: { G, p } – alle W = G×p÷100 sowie Gv, Ge sind ganzzahlig
// Neue Einträge einfach am Ende des Arrays ergänzen.
// ============================================================================

const AUFGABEN_DB = [

  // ── RABATT & PREISSENKUNGEN ───────────────────────────────────────────────
  {
    sache: 'Winterjacke',
    einheit: '€',
    kategorie: 'Rabatt & Preissenkung',
    emoji: '🧥',
    daten: [
      { G: 80,  p: 25 }, { G: 120, p: 25 }, { G: 200, p: 25 },
      { G: 160, p: 25 }, { G: 100, p: 20 }, { G: 240, p: 25 },
    ],
    textW:  (d) => `Eine Winterjacke kostet ${fmtE(d.G)} €. Im Winterschlussverkauf gibt es ${d.p} % Rabatt. Berechne den Rabattbetrag in Euro.`,
    textG:  (d) => `Im Sale beträgt der Rabatt auf eine Winterjacke ${d.p} %. Du sparst ${fmtE(d.W)} €. Berechne den ursprünglichen Preis der Jacke.`,
    textp:  (d) => `Eine Winterjacke kostet regulär ${fmtE(d.G)} €. Im Sale kostet sie nur ${fmtE(d.Gv)} €. Berechne den Rabatt in Prozent.`,
    textGv: (d) => `Eine Winterjacke kostet ${fmtE(d.G)} €. Der Shop gibt ${d.p} % Rabatt. Berechne den Preis nach Rabatt.`,
    textGe: (d) => `Eine Winterjacke kostet ${fmtE(d.G)} €. Der Hersteller erhöht den Preis um ${d.p} %. Berechne den neuen Preis.`,
 
    textGe_r: (d) => `Eine Winterjacke kostet nach einer Preiserhöhung von ${d.p} % nun ${fmtE(d.Ge)} €. Berechne den ursprünglichen Preis.`,
    textGv_r: (d) => `Eine Winterjacke kostet nach einem Rabatt von ${d.p} % nur noch ${fmtE(d.Gv)} €. Berechne den ursprünglichen Preis.`,
  },
  {
    sache: 'Smartphone',
    einheit: '€',
    kategorie: 'Rabatt & Preissenkung',
    emoji: '📱',
    daten: [
      { G: 400, p: 25 }, { G: 600, p: 20 }, { G: 800, p: 25 },
      { G: 500, p: 20 }, { G: 1000, p: 20 }, { G: 480, p: 25 },
    ],
    textW:  (d) => `Ein Smartphone kostet ${fmtE(d.G)} €. Der Händler gibt ${d.p} % Rabatt. Berechne den Rabattbetrag.`,
    textG:  (d) => `Ein Smartphone ist um ${d.p} % rabattiert. Der Preisnachlass beträgt ${fmtE(d.W)} €. Berechne den ursprünglichen Preis.`,
    textp:  (d) => `Ein Smartphone kostet regulär ${fmtE(d.G)} €. Im Angebot zahlt man ${fmtE(d.Gv)} €. Um wie viel Prozent wurde der Preis gesenkt?`,
    textGv: (d) => `Ein Smartphone kostet ${fmtE(d.G)} €. Online gibt es ${d.p} % Rabatt. Berechne den Aktionspreis.`,
    textGe: (d) => `Ein Smartphone kostet ${fmtE(d.G)} €. Der Händler erhöht den Preis um ${d.p} %. Berechne den neuen Preis.`,
 
    textGe_r: (d) => `Ein Smartphone kostet nach einer Preiserhöhung von ${d.p} % nun ${fmtE(d.Ge)} €. Berechne den ursprünglichen Preis.`,
    textGv_r: (d) => `Ein Smartphone kostet im Angebot (${d.p} % Rabatt) nur ${fmtE(d.Gv)} €. Berechne den ursprünglichen Preis.`,
  },
  {
    sache: 'Fahrrad',
    einheit: '€',
    kategorie: 'Rabatt & Preissenkung',
    emoji: '🚴',
    daten: [
      { G: 400, p: 25 }, { G: 600, p: 20 }, { G: 800, p: 25 },
      { G: 500, p: 20 }, { G: 1000, p: 20 }, { G: 300, p: 20 },
    ],
    textW:  (d) => `Ein Fahrrad kostet ${fmtE(d.G)} €. Im Herbst gibt es ${d.p} % Saisonrabatt. Berechne die Ersparnis in Euro.`,
    textG:  (d) => `Beim Saisonschlussverkauf gibt es ${d.p} % auf Fahrräder. Der Rabatt beträgt ${fmtE(d.W)} €. Berechne den Originalpreis.`,
    textp:  (d) => `Ein Fahrrad kostet normalerweise ${fmtE(d.G)} €. Im Sale zahlt man nur ${fmtE(d.Gv)} €. Berechne den Preisnachlass in Prozent.`,
    textGv: (d) => `Ein Fahrrad kostet ${fmtE(d.G)} €. Die Filiale reduziert es um ${d.p} %. Berechne den neuen Preis.`,
    textGe: (d) => `Ein Fahrrad kostet ${fmtE(d.G)} €. Wegen gestiegener Materialkosten erhöht sich der Preis um ${d.p} %. Berechne den neuen Preis.`,
 
    textGe_r: (d) => `Ein Fahrrad kostet nach einer Preiserhöhung von ${d.p} % nun ${fmtE(d.Ge)} €. Berechne den ursprünglichen Preis.`,
    textGv_r: (d) => `Ein Fahrrad kostet nach dem Saisonrabatt (${d.p} %) nur noch ${fmtE(d.Gv)} €. Berechne den regulären Preis.`,
  },
  {
    sache: 'Turnschuhe',
    einheit: '€',
    kategorie: 'Rabatt & Preissenkung',
    emoji: '👟',
    daten: [
      { G: 80, p: 25 }, { G: 100, p: 20 }, { G: 120, p: 25 },
      { G: 60, p: 20 }, { G: 160, p: 25 }, { G: 200, p: 20 },
    ],
    textW:  (d) => `Ein Paar Turnschuhe kostet ${fmtE(d.G)} €. Im Sale gibt es ${d.p} % Rabatt. Berechne den Rabattbetrag in Euro.`,
    textG:  (d) => `Turnschuhe sind um ${d.p} % reduziert. Du sparst ${fmtE(d.W)} €. Berechne den ursprünglichen Preis.`,
    textp:  (d) => `Ein Paar Turnschuhe kostet regulär ${fmtE(d.G)} €. Im Angebot zahlt man ${fmtE(d.Gv)} €. Berechne den Rabatt in Prozent.`,
    textGv: (d) => `Ein Paar Turnschuhe kostet ${fmtE(d.G)} €. Der Shop wirbt mit ${d.p} % Rabatt. Berechne den Preis nach Rabatt.`,
    textGe: (d) => `Turnschuhe kosten ${fmtE(d.G)} €. Die neue Kollektion ist um ${d.p} % teurer. Berechne den Preis des neuen Modells.`,
 
    textGe_r: (d) => `Turnschuhe kosten nach einer Preiserhöhung von ${d.p} % nun ${fmtE(d.Ge)} €. Berechne den ursprünglichen Preis.`,
    textGv_r: (d) => `Turnschuhe kosten im Sale (${d.p} % Rabatt) nur noch ${fmtE(d.Gv)} €. Berechne den regulären Preis.`,
  },
  {
    sache: 'Spielekonsole',
    einheit: '€',
    kategorie: 'Rabatt & Preissenkung',
    emoji: '🎮',
    daten: [
      { G: 400, p: 25 }, { G: 500, p: 20 }, { G: 600, p: 25 },
      { G: 300, p: 20 }, { G: 800, p: 25 }, { G: 200, p: 25 },
    ],
    textW:  (d) => `Eine Spielekonsole kostet ${fmtE(d.G)} €. Am Black Friday gibt es ${d.p} % Rabatt. Berechne den Rabattbetrag in Euro.`,
    textG:  (d) => `Eine Spielekonsole ist um ${d.p} % reduziert. Der Rabatt beträgt ${fmtE(d.W)} €. Berechne den ursprünglichen Preis.`,
    textp:  (d) => `Eine Spielekonsole kostet regulär ${fmtE(d.G)} €. Im Angebot zahlt man ${fmtE(d.Gv)} €. Berechne den Preisnachlass in Prozent.`,
    textGv: (d) => `Eine Spielekonsole kostet ${fmtE(d.G)} €. Der Online-Shop gibt ${d.p} % Rabatt. Berechne den Preis nach Rabatt.`,
    textGe: (d) => `Eine Spielekonsole kostet ${fmtE(d.G)} €. Durch einen Chip-Engpass steigt der Preis um ${d.p} %. Berechne den neuen Preis.`,
 
    textGe_r: (d) => `Eine Spielekonsole kostet nach einer Preiserhöhung von ${d.p} % nun ${fmtE(d.Ge)} €. Berechne den ursprünglichen Preis.`,
    textGv_r: (d) => `Eine Spielekonsole kostet am Black Friday (${d.p} % Rabatt) nur ${fmtE(d.Gv)} €. Berechne den Originalpreis.`,
  },
  // ── UMSATZSTEUER ─────────────────────────────────────────────────────────
  // Regelsteuersatz 19 %: G × 19 ÷ 100 ganzzahlig → G Vielfaches von 100
  {
    sache: 'Laptop',
    einheit: '€',
    kategorie: 'Umsatzsteuer (19 %)',
    emoji: '💻',
    daten: [
      { G: 500,  p: 19 }, { G: 1000, p: 19 }, { G: 200, p: 19 },
      { G: 300,  p: 19 }, { G: 700,  p: 19 }, { G: 400, p: 19 },
    ],
    textW:  (d) => `Der Nettopreis eines Laptops beträgt ${fmtE(d.G)} €. Der Umsatzsteuersatz beträgt ${d.p} %. Berechne den Umsatzsteuerbetrag.`,
    textG:  (d) => `Die Umsatzsteuer (${d.p} %) für einen Laptop beträgt ${fmtE(d.W)} €. Berechne den Nettopreis.`,
    textp:  (d) => `Ein Laptop kostet netto ${fmtE(d.G)} €. Brutto zahlt man ${fmtE(d.Ge)} €. Berechne den Umsatzsteuersatz in Prozent.`,
    textGv: (d) => `Ein Laptop wird zu einem Bruttopreis von ${fmtE(d.Ge)} € angeboten (inkl. ${d.p} % USt.). Berechne den Nettopreis.`,
    textGe: (d) => `Ein Laptop hat einen Nettopreis von ${fmtE(d.G)} €. Berechne den Bruttopreis inklusive ${d.p} % Umsatzsteuer.`,
 
    textGe_r: (d) => `Ein Laptop kostet brutto ${fmtE(d.Ge)} € (inkl. ${d.p} % USt.). Berechne den Nettopreis.`,
    textGv_r: (d) => `Ein Laptop kostet nach ${d.p} % Rabatt nur noch ${fmtE(d.Gv)} €. Berechne den ursprünglichen Preis.`,
  },
  {
    sache: 'Handwerkerrechnung',
    einheit: '€',
    kategorie: 'Umsatzsteuer (19 %)',
    emoji: '🔧',
    daten: [
      { G: 300,  p: 19 }, { G: 500,  p: 19 }, { G: 400, p: 19 },
      { G: 600,  p: 19 }, { G: 800,  p: 19 }, { G: 1000, p: 19 },
    ],
    textW:  (d) => `Eine Handwerkerrechnung beläuft sich netto auf ${fmtE(d.G)} €. Der Umsatzsteuersatz beträgt ${d.p} %. Berechne den Umsatzsteuerbetrag.`,
    textG:  (d) => `Auf einer Handwerkerrechnung stehen ${fmtE(d.W)} € Umsatzsteuer (${d.p} %). Berechne den Nettobetrag.`,
    textp:  (d) => `Eine Handwerkerrechnung beträgt netto ${fmtE(d.G)} € und brutto ${fmtE(d.Ge)} €. Welchen Umsatzsteuersatz hat der Handwerker berechnet?`,
    textGv: (d) => `Eine Handwerkerrechnung beträgt brutto ${fmtE(d.Ge)} € (inkl. ${d.p} % USt.). Berechne den Nettobetrag.`,
    textGe: (d) => `Eine Handwerkerleistung kostet netto ${fmtE(d.G)} €. Berechne den Bruttobetrag bei ${d.p} % Umsatzsteuer.`,
 
    textGe_r: (d) => `Eine Handwerkerrechnung beträgt brutto ${fmtE(d.Ge)} € (inkl. ${d.p} % USt.). Berechne den Nettobetrag.`,
    textGv_r: (d) => `Nach einem Preisnachlass von ${d.p} % beträgt eine Rechnung noch ${fmtE(d.Gv)} €. Berechne den ursprünglichen Rechnungsbetrag.`,
  },
  // Ermäßigter Steuersatz 7 %: G × 7 ÷ 100 ganzzahlig → G Vielfaches von 100
  {
    sache: 'Lebensmitteleinkauf',
    einheit: '€',
    kategorie: 'Umsatzsteuer (7 %)',
    emoji: '🛒',
    daten: [
      { G: 100, p: 7 }, { G: 200, p: 7 }, { G: 300, p: 7 },
      { G: 400, p: 7 }, { G: 500, p: 7 }, { G: 600, p: 7 },
    ],
    textW:  (d) => `Der Nettobetrag eines Lebensmitteleinkaufs beträgt ${fmtE(d.G)} €. Der ermäßigte Umsatzsteuersatz beträgt ${d.p} %. Berechne den Umsatzsteuerbetrag.`,
    textG:  (d) => `Die Umsatzsteuer (${d.p} %, ermäßigt) für Lebensmittel beträgt ${fmtE(d.W)} €. Berechne den Nettobetrag.`,
    textp:  (d) => `Lebensmittel kosten netto ${fmtE(d.G)} € und brutto ${fmtE(d.Ge)} €. Berechne den Umsatzsteuersatz in Prozent.`,
    textGv: (d) => `Ein Lebensmitteleinkauf kostet brutto ${fmtE(d.Ge)} € (inkl. ${d.p} % USt.). Berechne den Nettopreis.`,
    textGe: (d) => `Lebensmittel kosten netto ${fmtE(d.G)} €. Berechne den Bruttobetrag inklusive ${d.p} % Umsatzsteuer (ermäßigter Steuersatz).`,
 
    textGe_r: (d) => `Ein Lebensmitteleinkauf kostet brutto ${fmtE(d.Ge)} € (inkl. ${d.p} % USt., ermäßigt). Berechne den Nettobetrag.`,
    textGv_r: (d) => `Nach einem Rabatt von ${d.p} % kostet ein Lebensmitteleinkauf nur noch ${fmtE(d.Gv)} €. Berechne den ursprünglichen Preis.`,
  },
  // ── KONSUM & HAUSHALT ─────────────────────────────────────────────────────
  {
    sache: 'Monatliches Taschengeld',
    einheit: '€',
    kategorie: 'Konsum & Haushalt',
    emoji: '💰',
    daten: [
      { G: 40,  p: 25 }, { G: 80,  p: 25 }, { G: 100, p: 20 },
      { G: 60,  p: 20 }, { G: 50,  p: 20 }, { G: 120, p: 25 },
    ],
    textW:  (d) => `Lisa bekommt ${fmtE(d.G)} € Taschengeld im Monat und spart ${d.p} % davon. Berechne den monatlichen Sparbetrag.`,
    textG:  (d) => `Lena gibt ${d.p} % ihres Taschengeldes für Süßigkeiten aus. Das sind ${fmtE(d.W)} €. Berechne das gesamte monatliche Taschengeld.`,
    textp:  (d) => `Paul bekommt ${fmtE(d.G)} € Taschengeld. Er gibt ${fmtE(d.W)} € für Videospiele aus. Berechne den prozentualen Anteil für Videospiele.`,
    textGv: (d) => `Das Taschengeld soll um ${d.p} % gekürzt werden. Derzeit erhält man ${fmtE(d.G)} €. Berechne den Betrag nach der Kürzung.`,
    textGe: (d) => `Das Taschengeld wird um ${d.p} % erhöht. Derzeit beträgt es ${fmtE(d.G)} €. Berechne das neue Taschengeld.`,
 
    textGe_r: (d) => `Nach einer Erhöhung um ${d.p} % beträgt das Taschengeld ${fmtE(d.Ge)} €. Berechne das ursprüngliche Taschengeld.`,
    textGv_r: (d) => `Nach einer Kürzung um ${d.p} % beträgt das Taschengeld nur noch ${fmtE(d.Gv)} €. Berechne das ursprüngliche Taschengeld.`,
  },
  {
    sache: 'Monatliche Handykosten',
    einheit: '€',
    kategorie: 'Konsum & Haushalt',
    emoji: '📞',
    daten: [
      { G: 40,  p: 25 }, { G: 60,  p: 25 }, { G: 80,  p: 25 },
      { G: 30,  p: 20 }, { G: 50,  p: 20 }, { G: 100, p: 20 },
    ],
    textW:  (d) => `Ein Handytarif kostet ${fmtE(d.G)} € im Monat. Der Anbieter gewährt ${d.p} % Rabatt im ersten Jahr. Berechne die monatliche Ersparnis.`,
    textG:  (d) => `Ein Mobilfunkanbieter wirbt: „Spare ${d.p} % – nur noch ${fmtE(d.Gv)} € im Monat!" Berechne den ursprünglichen Monatspreis.`,
    textp:  (d) => `Ein Handytarif kostet bisher ${fmtE(d.G)} € monatlich. Im Aktionsangebot beträgt der Tarif nur ${fmtE(d.Gv)} €. Berechne den Preisnachlass in Prozent.`,
    textGv: (d) => `Dein Handytarif kostet ${fmtE(d.G)} € monatlich. Du wechselst und sparst ${d.p} %. Berechne den neuen Monatspreis.`,
    textGe: (d) => `Ein Handytarif kostet ${fmtE(d.G)} € monatlich. Ab dem nächsten Monat wird er um ${d.p} % teurer. Berechne den neuen Monatspreis.`,
 
    textGe_r: (d) => `Ein Handytarif kostet nach einer Preiserhöhung von ${d.p} % nun ${fmtE(d.Ge)} € monatlich. Berechne den ursprünglichen Monatspreis.`,
    textGv_r: (d) => `Nach einem Wechselrabatt von ${d.p} % zahlt man für einen Tarif nur noch ${fmtE(d.Gv)} €. Berechne den ursprünglichen Preis.`,
  },
  {
    sache: 'Kinokarte',
    einheit: '€',
    kategorie: 'Freizeit',
    emoji: '🎬',
    daten: [
      { G: 10,  p: 20 }, { G: 15, p: 20 }, { G: 20, p: 25 },
      { G: 12,  p: 25 }, { G: 8,  p: 25 }, { G: 16, p: 25 },
    ],
    textW:  (d) => `Eine Kinokarte kostet ${fmtE(d.G)} €. Montags gibt es ${d.p} % Rabatt. Berechne den Rabattbetrag.`,
    textG:  (d) => `Schüler erhalten ${d.p} % Ermäßigung auf die Kinokarte. Die Ermäßigung beträgt ${fmtE(d.W)} €. Berechne den regulären Kartenpreis.`,
    textp:  (d) => `Eine Kinokarte kostet regulär ${fmtE(d.G)} €. Mit Schülerausweis zahlt man ${fmtE(d.Gv)} €. Berechne die Ermäßigung in Prozent.`,
    textGv: (d) => `Eine Kinokarte kostet ${fmtE(d.G)} €. Am Dienstag gibt es ${d.p} % Ermäßigung. Berechne den ermäßigten Preis.`,
    textGe: (d) => `Eine Kinokarte kostet ${fmtE(d.G)} €. Das Kino erhöht die Preise um ${d.p} %. Berechne den neuen Kartenpreis.`,
 
    textGe_r: (d) => `Eine Kinokarte kostet nach einer Preiserhöhung von ${d.p} % nun ${fmtE(d.Ge)} €. Berechne den ursprünglichen Preis.`,
    textGv_r: (d) => `Mit Schülerausweis zahlt man für eine Kinokarte (${d.p} % Ermäßigung) nur ${fmtE(d.Gv)} €. Berechne den regulären Kartenpreis.`,
  },
  {
    sache: 'Schulranzen',
    einheit: '€',
    kategorie: 'Konsum & Haushalt',
    emoji: '🎒',
    daten: [
      { G: 80,  p: 25 }, { G: 100, p: 20 }, { G: 120, p: 25 },
      { G: 60,  p: 20 }, { G: 160, p: 25 }, { G: 200, p: 20 },
    ],
    textW:  (d) => `Ein Schulranzen kostet ${fmtE(d.G)} €. Beim Schulanfangsangebot gibt es ${d.p} % Rabatt. Berechne den Rabattbetrag in Euro.`,
    textG:  (d) => `Ein Schulranzen ist um ${d.p} % reduziert. Der Rabatt beträgt ${fmtE(d.W)} €. Berechne den Originalpreis.`,
    textp:  (d) => `Ein Schulranzen kostet ${fmtE(d.G)} €. Nach dem Schulstart kostet er nur noch ${fmtE(d.Gv)} €. Berechne den Rabatt in Prozent.`,
    textGv: (d) => `Ein Schulranzen kostet ${fmtE(d.G)} € und wird um ${d.p} % rabattiert. Berechne den Preis nach Rabatt.`,
    textGe: (d) => `Ein Schulranzen kostet ${fmtE(d.G)} €. Im nächsten Jahr steigt der Preis um ${d.p} %. Berechne den neuen Preis.`,
 
    textGe_r: (d) => `Ein Schulranzen kostet nach einer Preiserhöhung von ${d.p} % nun ${fmtE(d.Ge)} €. Berechne den ursprünglichen Preis.`,
    textGv_r: (d) => `Ein Schulranzen kostet nach dem Schulanfangsrabatt (${d.p} %) nur noch ${fmtE(d.Gv)} €. Berechne den Originalpreis.`,
  },
  // ── SUPERMARKT & LEBENSMITTEL ─────────────────────────────────────────────
  {
    sache: 'Wocheneinkauf',
    einheit: '€',
    kategorie: 'Supermarkt',
    emoji: '🛍️',
    daten: [
      { G: 80,  p: 25 }, { G: 100, p: 20 }, { G: 120, p: 25 },
      { G: 200, p: 25 }, { G: 160, p: 25 }, { G: 50,  p: 20 },
    ],
    textW:  (d) => `Der Wocheneinkauf kostet ${fmtE(d.G)} €. Mit der App spart man ${d.p} %. Berechne die Ersparnis in Euro.`,
    textG:  (d) => `Familie Müller hat beim Wocheneinkauf ${d.p} % gespart. Die Ersparnis beträgt ${fmtE(d.W)} €. Berechne den ursprünglichen Einkaufspreis.`,
    textp:  (d) => `Der Wocheneinkauf kostet regulär ${fmtE(d.G)} €. Mit Treuekarte zahlt man ${fmtE(d.Gv)} €. Berechne die Ersparnis in Prozent.`,
    textGv: (d) => `Der Wocheneinkauf kostet ${fmtE(d.G)} €. Mit dem Supermarkt-Coupon gibt es ${d.p} % Rabatt. Berechne den Preis nach Rabatt.`,
    textGe: (d) => `Der Wocheneinkauf kostet ${fmtE(d.G)} €. Durch Inflation steigen die Preise um ${d.p} %. Berechne den neuen Einkaufspreis.`,
 
    textGe_r: (d) => `Der Wocheneinkauf kostet nach einer Preiserhöhung von ${d.p} % nun ${fmtE(d.Ge)} €. Berechne den ursprünglichen Einkaufspreis.`,
    textGv_r: (d) => `Mit einem Coupon (${d.p} % Rabatt) zahlt man für den Wocheneinkauf nur ${fmtE(d.Gv)} €. Berechne den regulären Einkaufspreis.`,
  },
  {
    sache: 'Drogerieeinkauf',
    einheit: '€',
    kategorie: 'Supermarkt',
    emoji: '🧴',
    daten: [
      { G: 20, p: 25 }, { G: 40, p: 25 }, { G: 30, p: 20 },
      { G: 50, p: 20 }, { G: 60, p: 25 }, { G: 80, p: 25 },
    ],
    textW:  (d) => `Ein Drogerieeinkauf kostet ${fmtE(d.G)} €. Mit der Kundenkarte spart man ${d.p} %. Berechne die Ersparnis in Euro.`,
    textG:  (d) => `In der Drogerie gibt es ${d.p} % auf alle Pflegeprodukte. Du sparst ${fmtE(d.W)} €. Berechne den ursprünglichen Einkaufspreis.`,
    textp:  (d) => `Ein Drogerieeinkauf kostet regulär ${fmtE(d.G)} €. Mit Coupon zahlt man ${fmtE(d.Gv)} €. Berechne die Ersparnis in Prozent.`,
    textGv: (d) => `Ein Drogerieeinkauf kostet ${fmtE(d.G)} €. Am Aktionstag gibt es ${d.p} % Rabatt. Berechne den Preis nach Rabatt.`,
    textGe: (d) => `Ein Drogerieeinkauf kostet ${fmtE(d.G)} €. Der Hersteller erhöht die Preise um ${d.p} %. Berechne den neuen Einkaufspreis.`,
 
    textGe_r: (d) => `Ein Drogerieeinkauf kostet nach einer Preiserhöhung von ${d.p} % nun ${fmtE(d.Ge)} €. Berechne den ursprünglichen Einkaufspreis.`,
    textGv_r: (d) => `Mit der Kundenkarte (${d.p} % Rabatt) zahlt man für einen Drogerieeinkauf nur ${fmtE(d.Gv)} €. Berechne den regulären Einkaufspreis.`,
  },
  {
    sache: 'Kaffeemaschine',
    einheit: '€',
    kategorie: 'Supermarkt',
    emoji: '☕',
    daten: [
      { G: 80,  p: 25 }, { G: 100, p: 20 }, { G: 120, p: 25 },
      { G: 200, p: 25 }, { G: 160, p: 25 }, { G: 300, p: 20 },
    ],
    textW:  (d) => `Eine Kaffeemaschine kostet ${fmtE(d.G)} €. Im Angebot gibt es ${d.p} % Rabatt. Berechne den Rabattbetrag in Euro.`,
    textG:  (d) => `Eine Kaffeemaschine ist um ${d.p} % reduziert. Du sparst ${fmtE(d.W)} €. Berechne den ursprünglichen Preis.`,
    textp:  (d) => `Eine Kaffeemaschine kostet regulär ${fmtE(d.G)} €. Im Aktionspreis zahlt man ${fmtE(d.Gv)} €. Berechne den Rabatt in Prozent.`,
    textGv: (d) => `Eine Kaffeemaschine kostet ${fmtE(d.G)} €. Der Händler gibt ${d.p} % Aktionsrabatt. Berechne den Aktionspreis.`,
    textGe: (d) => `Eine Kaffeemaschine kostet ${fmtE(d.G)} €. Der Preis steigt um ${d.p} %. Berechne den neuen Preis.`,
 
    textGe_r: (d) => `Eine Kaffeemaschine kostet nach einer Preiserhöhung von ${d.p} % nun ${fmtE(d.Ge)} €. Berechne den ursprünglichen Preis.`,
    textGv_r: (d) => `Eine Kaffeemaschine kostet im Angebot (${d.p} % Rabatt) nur noch ${fmtE(d.Gv)} €. Berechne den ursprünglichen Preis.`,
  },
  // ── BEVÖLKERUNG & ANTEILE ─────────────────────────────────────────────────
  {
    sache: 'Schüler einer Klasse',
    einheit: 'Schüler',
    kategorie: 'Anteile & Zusammensetzung',
    emoji: '👩‍🏫',
    daten: [
      { G: 20, p: 25 }, { G: 30, p: 20 }, { G: 25, p: 20 },
      { G: 40, p: 25 }, { G: 20, p: 20 }, { G: 30, p: 10 },
    ],
    textW:  (d) => `Eine Klasse hat ${fmt(d.G)} Schüler. ${d.p} % kommen mit dem Fahrrad zur Schule. Berechne die Anzahl dieser Schüler.`,
    textG:  (d) => `In einer Klasse sind ${d.p} % der Schüler krank. Das sind ${fmt(d.W)} Schüler. Berechne die Gesamtzahl der Schüler.`,
    textp:  (d) => `In einer Klasse mit ${fmt(d.G)} Schülern sind ${fmt(d.W)} Mädchen. Berechne den Anteil der Mädchen in Prozent.`,
    textGv: (d) => `Eine Klasse hat ${fmt(d.G)} Schüler. ${d.p} % fehlen krankheitsbedingt. Berechne die Anzahl der anwesenden Schüler.`,
    textGe: (d) => `Eine Klasse hat ${fmt(d.G)} Schüler. Durch Zuzüge wächst sie um ${d.p} %. Berechne die neue Schülerzahl.`,
 
    textGe_r: (d) => `Eine Klasse zählt nach Zuzügen (${d.p} % mehr) nun ${fmt(d.Ge)} Schüler. Berechne die ursprüngliche Schülerzahl.`,
    textGv_r: (d) => `Nach Abgängen (${d.p} % weniger) hat eine Klasse nur noch ${fmt(d.Gv)} Schüler. Berechne die ursprüngliche Schülerzahl.`,
  },
  {
    sache: 'Schüler einer Schule',
    einheit: 'Schüler',
    kategorie: 'Anteile & Zusammensetzung',
    emoji: '🏫',
    daten: [
      { G: 400, p: 25 }, { G: 500, p: 20 }, { G: 600, p: 25 },
      { G: 800, p: 25 }, { G: 400, p: 20 }, { G: 600, p: 20 },
    ],
    textW:  (d) => `Eine Schule hat ${fmt(d.G)} Schüler. ${d.p} % nutzen die Schulbibliothek regelmäßig. Berechne die Anzahl dieser Schüler.`,
    textG:  (d) => `${d.p} % der Schüler einer Schule nehmen am Mittagessen teil. Das sind ${fmt(d.W)} Schüler. Berechne die Gesamtzahl der Schüler.`,
    textp:  (d) => `Eine Schule hat ${fmt(d.G)} Schüler. ${fmt(d.W)} davon fahren mit dem Bus. Berechne den Anteil der Busfahrer in Prozent.`,
    textGv: (d) => `Eine Schule hat ${fmt(d.G)} Schüler. Durch Umzüge wechseln ${d.p} % die Schule. Berechne die Anzahl der verbleibenden Schüler.`,
    textGe: (d) => `Eine Schule hat ${fmt(d.G)} Schüler. Im nächsten Jahr wächst sie um ${d.p} %. Berechne die neue Schülerzahl.`,
 
    textGe_r: (d) => `Eine Schule hat nach einem Zuwachs von ${d.p} % nun ${fmt(d.Ge)} Schüler. Berechne die ursprüngliche Schülerzahl.`,
    textGv_r: (d) => `Nach Umzügen (${d.p} % weniger) hat eine Schule nur noch ${fmt(d.Gv)} Schüler. Berechne die ursprüngliche Schülerzahl.`,
  },
  {
    sache: 'Einwohner einer Gemeinde',
    einheit: 'Einwohner',
    kategorie: 'Anteile & Zusammensetzung',
    emoji: '🏘️',
    daten: [
      { G: 2000,  p: 25 }, { G: 5000,  p: 20 }, { G: 10000, p: 20 },
      { G: 4000,  p: 25 }, { G: 8000,  p: 25 }, { G: 6000,  p: 20 },
    ],
    textW:  (d) => `Eine Gemeinde hat ${fmt(d.G)} Einwohner. ${d.p} % besitzen ein Auto. Berechne die Anzahl der Autobesitzer.`,
    textG:  (d) => `${d.p} % der Einwohner einer Gemeinde sind unter 18 Jahre alt. Das sind ${fmt(d.W)} Personen. Berechne die Gesamtzahl der Einwohner.`,
    textp:  (d) => `Eine Gemeinde hat ${fmt(d.G)} Einwohner. ${fmt(d.W)} davon sind Rentner. Berechne den Anteil der Rentner in Prozent.`,
    textGv: (d) => `Eine Gemeinde hat ${fmt(d.G)} Einwohner. ${d.p} % sind in dieser Woche im Urlaub. Berechne die Anzahl der vor Ort verbliebenen Einwohner.`,
    textGe: (d) => `Eine Gemeinde hat ${fmt(d.G)} Einwohner. Durch Zuzüge wächst sie um ${d.p} %. Berechne die neue Einwohnerzahl.`,
 
    textGe_r: (d) => `Eine Gemeinde hat nach einem Zuzug von ${d.p} % nun ${fmt(d.Ge)} Einwohner. Berechne die ursprüngliche Einwohnerzahl.`,
    textGv_r: (d) => `Nach Wegzügen (${d.p} % weniger) hat eine Gemeinde nur noch ${fmt(d.Gv)} Einwohner. Berechne die ursprüngliche Einwohnerzahl.`,
  },
  {
    sache: 'Belegschaft eines Betriebs',
    einheit: 'Mitarbeiter',
    kategorie: 'Anteile & Zusammensetzung',
    emoji: '🏭',
    daten: [
      { G: 80,  p: 25 }, { G: 200, p: 25 }, { G: 120, p: 25 },
      { G: 400, p: 20 }, { G: 80,  p: 20 }, { G: 100, p: 20 },
    ],
    textW:  (d) => `Ein Unternehmen beschäftigt ${fmt(d.G)} Mitarbeiter. ${d.p} % sind in Teilzeit tätig. Berechne die Anzahl der Teilzeitbeschäftigten.`,
    textG:  (d) => `In einem Betrieb sind ${d.p} % der Beschäftigten Frauen. Das sind ${fmt(d.W)} Mitarbeiterinnen. Berechne die Gesamtzahl der Mitarbeiter.`,
    textp:  (d) => `Ein Betrieb hat ${fmt(d.G)} Mitarbeiter, davon sind ${fmt(d.W)} Männer. Berechne den Männeranteil in Prozent.`,
    textGv: (d) => `Ein Betrieb hat ${fmt(d.G)} Mitarbeiter. Durch Stellenabbau werden ${d.p} % entlassen. Berechne die Anzahl der verbleibenden Mitarbeiter.`,
    textGe: (d) => `Ein Betrieb hat ${fmt(d.G)} Mitarbeiter und stellt ${d.p} % mehr ein. Berechne die neue Mitarbeiterzahl.`,
 
    textGe_r: (d) => `Ein Betrieb hat nach einer Aufstockung um ${d.p} % nun ${fmt(d.Ge)} Mitarbeiter. Berechne die ursprüngliche Mitarbeiterzahl.`,
    textGv_r: (d) => `Nach Stellenabbau (${d.p} % weniger) hat ein Betrieb nur noch ${fmt(d.Gv)} Mitarbeiter. Berechne die ursprüngliche Mitarbeiterzahl.`,
  },
  {
    sache: 'Vereinsmitglieder',
    einheit: 'Mitglieder',
    kategorie: 'Anteile & Zusammensetzung',
    emoji: '⚽',
    daten: [
      { G: 200, p: 25 }, { G: 400, p: 25 }, { G: 300, p: 20 },
      { G: 500, p: 20 }, { G: 80,  p: 25 }, { G: 100, p: 20 },
    ],
    textW:  (d) => `Ein Sportverein hat ${fmt(d.G)} Mitglieder. ${d.p} % davon nehmen an Turnieren teil. Berechne die Anzahl der Turnierteilnehmer.`,
    textG:  (d) => `${d.p} % der Vereinsmitglieder sind Jugendliche. Das sind ${fmt(d.W)} Personen. Berechne die Gesamtzahl der Vereinsmitglieder.`,
    textp:  (d) => `Ein Verein hat ${fmt(d.G)} Mitglieder. ${fmt(d.W)} davon sind weiblich. Berechne den Frauenanteil in Prozent.`,
    textGv: (d) => `Ein Verein hat ${fmt(d.G)} Mitglieder. ${d.p} % treten aus. Berechne die Anzahl der verbleibenden Mitglieder.`,
    textGe: (d) => `Ein Verein hat ${fmt(d.G)} Mitglieder. Durch eine Werbeaktion steigt die Zahl um ${d.p} %. Berechne die neue Mitgliederzahl.`,
 
    textGe_r: (d) => `Ein Verein hat nach einer Werbeaktion (${d.p} % mehr) nun ${fmt(d.Ge)} Mitglieder. Berechne die ursprüngliche Mitgliederzahl.`,
    textGv_r: (d) => `Nach Austritten (${d.p} % weniger) hat ein Verein nur noch ${fmt(d.Gv)} Mitglieder. Berechne die ursprüngliche Mitgliederzahl.`,
  },
  {
    sache: 'Wahlbeteiligung',
    einheit: 'Personen',
    kategorie: 'Anteile & Zusammensetzung',
    emoji: '🗳️',
    daten: [
      { G: 2000,  p: 25 }, { G: 4000,  p: 25 }, { G: 5000,  p: 20 },
      { G: 8000,  p: 25 }, { G: 10000, p: 20 }, { G: 6000,  p: 20 },
    ],
    textW:  (d) => `In einer Stadt gibt es ${fmt(d.G)} Wahlberechtigte. Die Wahlbeteiligung beträgt ${d.p} %. Berechne die Anzahl der Wähler.`,
    textG:  (d) => `Bei einer Wahl haben ${d.p} % der Wahlberechtigten gewählt. Das waren ${fmt(d.W)} Personen. Berechne die Gesamtzahl der Wahlberechtigten.`,
    textp:  (d) => `Von ${fmt(d.G)} Wahlberechtigten gingen ${fmt(d.W)} zur Wahl. Berechne die Wahlbeteiligung in Prozent.`,
    textGv: (d) => `Bei der letzten Wahl stimmten ${fmt(d.G)} Personen für Partei X. Diesmal ging die Stimmenanzahl um ${d.p} % zurück. Berechne die neue Stimmenzahl für Partei X.`,
    textGe: (d) => `Bei der letzten Wahl haben ${fmt(d.G)} Personen gewählt. Diesmal steigt die Wahlbeteiligung um ${d.p} %. Berechne die Anzahl der Wähler.`,
 
    textGe_r: (d) => `Die Wahlbeteiligung stieg um ${d.p} %. Es wählten ${fmt(d.Ge)} Personen. Berechne die Anzahl der Wähler bei der letzten Wahl.`,
    textGv_r: (d) => `Die Wahlbeteiligung sank um ${d.p} %. Es wählten nur noch ${fmt(d.Gv)} Personen. Berechne die Anzahl der Wähler bei der letzten Wahl.`,
  },
  // ── TECHNIK ───────────────────────────────────────────────────────────────
  {
    sache: 'Smartphone-Akku',
    einheit: 'mAh',
    kategorie: 'Technik & Alltag',
    emoji: '🔋',
    daten: [
      { G: 4000, p: 25 }, { G: 5000, p: 20 }, { G: 6000, p: 25 },
      { G: 8000, p: 25 }, { G: 2000, p: 25 }, { G: 3000, p: 20 },
    ],
    textW:  (d) => `Ein Smartphone-Akku fasst ${fmt(d.G)} mAh. Nach dem Laden ist er zu ${d.p} % geladen. Berechne die geladene Kapazität in mAh.`,
    textG:  (d) => `Ein Akku wurde um ${fmt(d.W)} mAh aufgeladen. Das entspricht ${d.p} % der Gesamtkapazität. Berechne die Gesamtkapazität in mAh.`,
    textp:  (d) => `Ein Akku hat eine Kapazität von ${fmt(d.G)} mAh. Nach dem Laden sind ${fmt(d.W)} mAh geladen. Berechne den Ladestand in Prozent.`,
    textGv: (d) => `Ein Akku hat eine Kapazität von ${fmt(d.G)} mAh. Nach einer Nacht ist er um ${d.p} % entladen. Berechne die verbleibende Kapazität in mAh.`,
    textGe: (d) => `Ein Akku hat ${fmt(d.G)} mAh Kapazität. Das neue Modell hat ${d.p} % mehr. Berechne die Kapazität des neuen Akkus in mAh.`,
 
    textGe_r: (d) => `Ein neuer Akku hat ${d.p} % mehr Kapazität und fasst ${fmt(d.Ge)} mAh. Berechne die Kapazität des alten Akkus.`,
    textGv_r: (d) => `Ein Akku hat nach Alterung (${d.p} % weniger) nur noch ${fmt(d.Gv)} mAh. Berechne die ursprüngliche Kapazität.`,
  },
  {
    sache: 'Ladezeit (Schnellladung)',
    einheit: 'Minuten',
    kategorie: 'Technik & Alltag',
    emoji: '⚡',
    daten: [
      { G: 100, p: 25 }, { G: 120, p: 25 }, { G: 200, p: 25 },
      { G: 80,  p: 25 }, { G: 160, p: 25 }, { G: 60,  p: 20 },
    ],
    textW:  (d) => `Ein Tablet braucht ${fmt(d.G)} Minuten zum vollständigen Aufladen. Der Akku ist bereits zu ${d.p} % geladen. Berechne die bisherige Ladezeit in Minuten.`,
    textG:  (d) => `Ein Schnellladegerät verkürzt die Ladezeit um ${d.p} %. Es spart ${fmt(d.W)} Minuten. Berechne die Ladezeit ohne Schnellladung.`,
    textp:  (d) => `Ein Akku lädt normalerweise ${fmt(d.G)} Minuten. Mit Schnellladung dauert es nur ${fmt(d.Gv)} Minuten. Berechne die Zeitersparnis in Prozent.`,
    textGv: (d) => `Ein Akku lädt normalerweise ${fmt(d.G)} Minuten. Ein Schnellladegerät reduziert die Zeit um ${d.p} %. Berechne die Ladezeit mit Schnellladegerät.`,
    textGe: (d) => `Ein Akku lädt in ${fmt(d.G)} Minuten. Ein langsameres Ladegerät braucht ${d.p} % länger. Berechne die Ladezeit mit dem langsameren Gerät.`,
 
    textGe_r: (d) => `Ein langsameres Ladegerät braucht ${d.p} % länger und lädt in ${fmt(d.Ge)} Minuten. Berechne die Ladezeit mit dem normalen Gerät.`,
    textGv_r: (d) => `Mit Schnellladung (${d.p} % schneller) lädt ein Akku in nur ${fmt(d.Gv)} Minuten. Berechne die Ladezeit ohne Schnellladung.`,
  },
];

// ============================================================================
// AUFGABEN-TYPEN
// ============================================================================

const AUFGABEN_TYPEN_DEF = {
  W:    { cbId: 'cb-W',    label: 'Prozentwert (W)',               buildText: (e, d) => e.textW(d),    buildLoesung: buildLoesungW    },
  G:    { cbId: 'cb-G',    label: 'Grundwert (G)',                 buildText: (e, d) => e.textG(d),    buildLoesung: buildLoesungG    },
  p:    { cbId: 'cb-p',    label: 'Prozentsatz (p %)',             buildText: (e, d) => e.textp(d),    buildLoesung: buildLoesungp    },
  Gv:   { cbId: 'cb-Gv',  label: 'Verminderter GW (G → G−)',      buildText: (e, d) => e.textGv(d),   buildLoesung: buildLoesungGv   },
  Gv_r: { cbId: 'cb-Gv_r',label: 'Grundwert aus G− berechnen',   buildText: (e, d) => e.textGv_r(d), buildLoesung: buildLoesungGv_r },
  Ge:   { cbId: 'cb-Ge',  label: 'Vermehrter GW (G → G+)',        buildText: (e, d) => e.textGe(d),   buildLoesung: buildLoesungGe   },
  Ge_r: { cbId: 'cb-Ge_r',label: 'Grundwert aus G+ berechnen',   buildText: (e, d) => e.textGe_r(d), buildLoesung: buildLoesungGe_r },
};

// ============================================================================
// LÖSUNGS-BUILDER – Dreisatz + Überkreuz
// ============================================================================

// Prozentwert W gesucht: W = G × p ÷ 100
function buildLoesungW(eintrag, d) {
  return `
    <strong>Gegeben:</strong> G = ${fmtU(d.G, eintrag.einheit)} ${eintrag.einheit}, p = ${d.p} %<br>
    <strong>Gesucht:</strong> Prozentwert W<br><br>
    <strong>Dreisatz:</strong><br>
    <table class="dreisatz">
      <tr><td>${fmtU(d.G, eintrag.einheit)} ${eintrag.einheit}</td><td>→</td><td>100 %</td></tr>
      <tr><td><strong>W = ?</strong></td><td>→</td><td>${d.p} %</td></tr>
    </table>
    <strong>Überkreuz:</strong> W × 100 = ${fmtU(d.G, eintrag.einheit)} × ${d.p}<br>
    W = ${fmtU(d.G, eintrag.einheit)} × ${d.p} ÷ 100 = <strong>${fmtU(d.W, eintrag.einheit)} ${eintrag.einheit}</strong>
  `;
}

// Grundwert G gesucht: G = W × 100 ÷ p
function buildLoesungG(eintrag, d) {
  return `
    <strong>Gegeben:</strong> W = ${fmtU(d.W, eintrag.einheit)} ${eintrag.einheit}, p = ${d.p} %<br>
    <strong>Gesucht:</strong> Grundwert G<br><br>
    <strong>Dreisatz:</strong><br>
    <table class="dreisatz">
      <tr><td><strong>G = ?</strong></td><td>→</td><td>100 %</td></tr>
      <tr><td>${fmtU(d.W, eintrag.einheit)} ${eintrag.einheit}</td><td>→</td><td>${d.p} %</td></tr>
    </table>
    <strong>Überkreuz:</strong> G × ${d.p} = ${fmtU(d.W, eintrag.einheit)} × 100<br>
    G = ${fmtU(d.W, eintrag.einheit)} × 100 ÷ ${d.p} = <strong>${fmtU(d.G, eintrag.einheit)} ${eintrag.einheit}</strong>
  `;
}

// Prozentsatz p gesucht: p = W × 100 ÷ G
function buildLoesungp(eintrag, d) {
  return `
    <strong>Gegeben:</strong> G = ${fmtU(d.G, eintrag.einheit)} ${eintrag.einheit}, W = ${fmtU(d.W, eintrag.einheit)} ${eintrag.einheit}<br>
    <strong>Gesucht:</strong> Prozentsatz p<br><br>
    <strong>Dreisatz:</strong><br>
    <table class="dreisatz">
      <tr><td>${fmtU(d.G, eintrag.einheit)} ${eintrag.einheit}</td><td>→</td><td>100 %</td></tr>
      <tr><td>${fmtU(d.W, eintrag.einheit)} ${eintrag.einheit}</td><td>→</td><td><strong>p = ?</strong></td></tr>
    </table>
    <strong>Überkreuz:</strong> p × ${fmtU(d.G, eintrag.einheit)} = ${fmtU(d.W, eintrag.einheit)} × 100<br>
    p = ${fmtU(d.W, eintrag.einheit)} × 100 ÷ ${fmtU(d.G, eintrag.einheit)} = <strong>${d.p} %</strong>
  `;
}

// Verminderter Grundwert: Gv = G × (100 − p) ÷ 100
function buildLoesungGv(eintrag, d) {
  const faktor = 100 - d.p;
  return `
    <strong>Gegeben:</strong> G = ${fmtU(d.G, eintrag.einheit)} ${eintrag.einheit}, p = ${d.p} %<br>
    <strong>Gesucht:</strong> Verminderter Grundwert G<sub>−</sub><br><br>
    <strong>Dreisatz:</strong><br>
    <table class="dreisatz">
      <tr><td>${fmtU(d.G, eintrag.einheit)} ${eintrag.einheit}</td><td>→</td><td>100 %</td></tr>
      <tr><td><strong>G<sub>−</sub> = ?</strong></td><td>→</td><td>${faktor} %</td></tr>
    </table>
    <strong>Überkreuz:</strong> G<sub>−</sub> × 100 = ${fmtU(d.G, eintrag.einheit)} × ${faktor}<br>
    G<sub>−</sub> = ${fmtU(d.G, eintrag.einheit)} × ${faktor} ÷ 100 = <strong>${fmtU(d.Gv, eintrag.einheit)} ${eintrag.einheit}</strong>
  `;
}

// Vermehrter Grundwert: Ge = G × (100 + p) ÷ 100
function buildLoesungGe(eintrag, d) {
  const faktor = 100 + d.p;
  return `
    <strong>Gegeben:</strong> G = ${fmtU(d.G, eintrag.einheit)} ${eintrag.einheit}, p = ${d.p} %<br>
    <strong>Gesucht:</strong> Vermehrter Grundwert G<sub>+</sub><br><br>
    <strong>Dreisatz:</strong><br>
    <table class="dreisatz">
      <tr><td>${fmtU(d.G, eintrag.einheit)} ${eintrag.einheit}</td><td>→</td><td>100 %</td></tr>
      <tr><td><strong>G<sub>+</sub> = ?</strong></td><td>→</td><td>${faktor} %</td></tr>
    </table>
    <strong>Überkreuz:</strong> G<sub>+</sub> × 100 = ${fmtU(d.G, eintrag.einheit)} × ${faktor}<br>
    G<sub>+</sub> = ${fmtU(d.G, eintrag.einheit)} × ${faktor} ÷ 100 = <strong>${fmtU(d.Ge, eintrag.einheit)} ${eintrag.einheit}</strong>
  `;
}

// Grundwert aus G+ berechnen: G = Ge × 100 ÷ (100 + p)
function buildLoesungGe_r(eintrag, d) {
  const faktor = 100 + d.p;
  return `
    <strong>Gegeben:</strong> G<sub>+</sub> = ${fmtU(d.Ge, eintrag.einheit)} ${eintrag.einheit}, p = ${d.p} %<br>
    <strong>Gesucht:</strong> Ursprünglicher Grundwert G (= 100 %)<br><br>
    <strong>Dreisatz:</strong><br>
    <table class="dreisatz">
      <tr><td><strong>G = ?</strong></td><td>→</td><td>100 %</td></tr>
      <tr><td>${fmtU(d.Ge, eintrag.einheit)} ${eintrag.einheit}</td><td>→</td><td>${faktor} %</td></tr>
    </table>
    <strong>Überkreuz:</strong> G × ${faktor} = ${fmtU(d.Ge, eintrag.einheit)} × 100<br>
    G = ${fmtU(d.Ge, eintrag.einheit)} × 100 ÷ ${faktor} = <strong>${fmtU(d.G, eintrag.einheit)} ${eintrag.einheit}</strong>
  `;
}

// Grundwert aus G− berechnen: G = Gv × 100 ÷ (100 − p)
function buildLoesungGv_r(eintrag, d) {
  const faktor = 100 - d.p;
  return `
    <strong>Gegeben:</strong> G<sub>−</sub> = ${fmtU(d.Gv, eintrag.einheit)} ${eintrag.einheit}, p = ${d.p} %<br>
    <strong>Gesucht:</strong> Ursprünglicher Grundwert G (= 100 %)<br><br>
    <strong>Dreisatz:</strong><br>
    <table class="dreisatz">
      <tr><td><strong>G = ?</strong></td><td>→</td><td>100 %</td></tr>
      <tr><td>${fmtU(d.Gv, eintrag.einheit)} ${eintrag.einheit}</td><td>→</td><td>${faktor} %</td></tr>
    </table>
    <strong>Überkreuz:</strong> G × ${faktor} = ${fmtU(d.Gv, eintrag.einheit)} × 100<br>
    G = ${fmtU(d.Gv, eintrag.einheit)} × 100 ÷ ${faktor} = <strong>${fmtU(d.G, eintrag.einheit)} ${eintrag.einheit}</strong>
  `;
}

// ============================================================================
// DATEN ERGÄNZEN (W, Gv, Ge aus G und p berechnen)
// ============================================================================

function ergaenzeDaten(d) {
  return {
    G:  d.G,
    p:  d.p,
    W:  Math.round(d.G * d.p / 100),
    Gv: Math.round(d.G * (100 - d.p) / 100),
    Ge: Math.round(d.G * (100 + d.p) / 100),
  };
}

// ============================================================================
// GENERATOR
// ============================================================================

function getAktiveTypen() {
  return Object.keys(AUFGABEN_TYPEN_DEF).filter(typ => {
    const cb = document.getElementById(AUFGABEN_TYPEN_DEF[typ].cbId);
    return cb && cb.checked;
  });
}

function generiereAufgaben() {
  const aktiveTypen = getAktiveTypen();
  const container = document.getElementById('Container');
  if (!container) return;

  if (aktiveTypen.length === 0) {
    container.innerHTML = `<p style="color:red;">Bitte mindestens einen Aufgabentyp auswählen.</p>`;
    return;
  }

  const anzahl = parseInt(document.getElementById('anzahlSelect').value) || 5;
  const shuffledEintraege = shuffle(AUFGABEN_DB);
  const aufgabenListe = [];

  for (let i = 0; i < anzahl; i++) {
    const typ = aktiveTypen[i % aktiveTypen.length];
    const eintrag = shuffledEintraege[i % shuffledEintraege.length];
    const rohdaten = pick(eintrag.daten);
    const d = ergaenzeDaten(rohdaten);
    aufgabenListe.push({ typ, eintrag, d });
  }

  // ── Aufgaben-HTML ──
  let aufgabenHtml = `<h2>Aufgaben</h2><ol style="padding-left: 1.6rem; line-height: 1.8;">`;
  aufgabenListe.forEach(({ typ, eintrag, d }) => {
    const def = AUFGABEN_TYPEN_DEF[typ];
    const text = def.buildText(eintrag, d);
    aufgabenHtml += `<li>
      ${text}
    </li>`;
  });
  aufgabenHtml += `</ol>`;

  // ── Lösungen-HTML ──
  let loesungenHtml = `<h2 style="margin-top: 1.5rem;">Lösung</h2>`;
  aufgabenListe.forEach(({ typ, eintrag, d }, i) => {
    const def = AUFGABEN_TYPEN_DEF[typ];
    const loesung = def.buildLoesung(eintrag, d);
    loesungenHtml += `
      <div style="
        background: white;
        border: 1px solid #ddd;
        border-radius: 6px;
        padding: 14px;
        margin-bottom: 12px;
        line-height: 1.7;
      ">
        <strong>Aufgabe ${i + 1}:</strong> ${eintrag.emoji} ${eintrag.sache} – ${def.label}<br><br>
        ${loesung}
      </div>
    `;
  });

  container.innerHTML = aufgabenHtml + loesungenHtml;
}

// ============================================================================
// KI-ASSISTENT
// ============================================================================

const KI_ASSISTENT_PROMPT = `
Du bist ein freundlicher Mathematik- und Wirtschaftsassistent für Schüler der Realschule (BwR, Klasse 7). Du hilfst beim Verständnis der Prozentrechnung anhand von Alltagssituationen aus dem wirtschaftlichen Leben.

Aufgabe:
- Gib KEINE fertigen Lösungen vor.
- Führe die Schüler durch gezielte Fragen zur richtigen Lösung.
- Ziel: Förderung des Verständnisses für Grundwert, Prozentwert und Prozentsatz.

Pädagogischer Ansatz (Sokratische Methode):
- Frage zunächst, welche Größe gesucht ist (G, p % oder W).
- Frage dann, welche Formel passt.
- Beantworte deine Rückfragen NICHT selbst.
- Bei Fehlern: erkläre das Prinzip, nicht die Lösung.
- Erst wenn der Schüler selbst auf eine begründete Antwort kommt, bestätige ihn.

Die sieben Aufgabentypen:
1. Prozentwert W gesucht      → W  = G × p ÷ 100
2. Grundwert G gesucht        → G  = W × 100 ÷ p
3. Prozentsatz p gesucht      → p  = W × 100 ÷ G
4. Verminderter Grundwert     → G− = G × (100 − p) ÷ 100     [G und p gegeben, G− gesucht]
5. G aus G− berechnen         → G  = G− × 100 ÷ (100 − p)    [G− und p gegeben, G gesucht]
6. Vermehrter Grundwert       → G+ = G × (100 + p) ÷ 100     [G und p gegeben, G+ gesucht]
7. G aus G+ berechnen         → G  = G+ × 100 ÷ (100 + p)    [G+ und p gegeben, G gesucht]

Wichtige Hinweise zu Typ 5 und 7 (Grundwert aus verändertem Wert berechnen):
- Der Schüler muss erkennen: der gegebene Wert ist NICHT der Grundwert (100 %), sondern bereits ein veränderter Wert.
- Bei G− (z. B. Preis nach Rabatt): G− entspricht (100 − p) %, also ist G− der kleinere Wert.
  Typischer Fehler: Schüler rechnen G + Rabatt statt rückwärts.
  Hilfreiche Frage: „Welche Prozentzahl entspricht dem Preis, den du kennst – 100 % oder weniger?"
- Bei G+ (z. B. Bruttopreis inkl. USt.): G+ entspricht (100 + p) %, also ist G+ der größere Wert.
  Typischer Fehler: Schüler ziehen den Prozentwert direkt vom Bruttopreis ab.
  Hilfreiche Frage: „Der Bruttopreis entspricht 119 % – welche Prozentzahl hat der Nettopreis?"
- In beiden Fällen gilt: der unbekannte Grundwert G = 100 % steht im Dreisatz immer oben.

Hinweis zur Umsatzsteuer in Deutschland:
- Regelsteuersatz: 19 % (z. B. Elektronik, Handwerkerleistungen)
- Ermäßigter Steuersatz: 7 % (z. B. Lebensmittel, Bücher)
- Korrekte Bezeichnung: Umsatzsteuer (USt.), nicht Mehrwertsteuer

Rechenmethodik (Dreisatz / Überkreuz):
- Hilf dem Schüler, die bekannten Werte in eine Dreisatztabelle einzutragen.
- Erkläre das Überkreuz-Ausmultiplizieren: die gesuchte Größe × einen Wert = bekannte Größe × anderen Wert.
- Alle Ergebnisse sind glatte Zahlen (Vielfache von 5 oder 10) – stimmt das Ergebnis nicht, liegt ein Rechenfehler vor.

Tonalität:
- Freundlich, ermutigend, auf Augenhöhe mit Realschülerinnen und -schülern
- Einfache Sprache, kurze Antworten (1–2 Sätze)
- Gelegentlich Emojis 💶📊🔢💡

Was du NICHT tust:
- Die Lösung direkt nennen
- Vollständige Rechenwege vorgeben
`;

function kopiereKiPrompt() {
  navigator.clipboard
    .writeText(KI_ASSISTENT_PROMPT)
    .then(() => {
      const btn = document.getElementById('kiPromptKopierenBtn');
      const orig = btn.innerHTML;
      btn.innerHTML = '✅ Kopiert!';
      setTimeout(() => { btn.innerHTML = orig; }, 2500);
    })
    .catch(() => {
      alert('Kopieren nicht möglich. Bitte manuell aus dem Textfeld kopieren.');
    });
}

function toggleKiPromptVorschau() {
  const vorschau = document.getElementById('kiPromptVorschau');
  const btn = document.getElementById('kiPromptToggleBtn');
  const hidden = getComputedStyle(vorschau).display === 'none';
  vorschau.style.display = hidden ? 'block' : 'none';
  btn.textContent = hidden ? 'Vorschau ausblenden ▲' : 'Prompt anzeigen ▼';
}

// ── Initialisierung ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const vorschauEl = document.getElementById('kiPromptVorschau');
  if (vorschauEl) vorschauEl.textContent = KI_ASSISTENT_PROMPT;
  setTimeout(generiereAufgaben, 300);
});