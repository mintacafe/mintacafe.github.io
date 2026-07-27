/* ===========================================================
   Minta Cafè website behaviour
   1. STORE LINKS      paste the URLs here when you have them
   2. Language toggle  English / Català
   3. Circell demo     a real, playable rotation board
   4. Brillantor demo  a real gamma lift on a dark photo
   =========================================================== */

/* ── 1. Store links ───────────────────────────────────────────
   Leave a string empty and the button stays dimmed with a
   "Link coming soon" note. Fill it in and the button lights up.
   Nothing else needs changing.                                */
const STORE_LINKS = {
  circell:    "",   // e.g. "https://apps.apple.com/app/circell/id0000000000"
  brillantor: ""    // e.g. "https://apps.apple.com/app/brillantor/id0000000000"
};

/* ── 2. Copy, in both languages ───────────────────────────── */
const I18N = {
  en: {
    "html.lang": "en",
    "html.title": "Minta Cafè · small, honest apps for iPhone and Mac",
    "lang.toggle": "CA",
    "lang.aria": "Canvia la llengua a català",
    "skip": "Skip to content",
    "nav.promise": "The promise",

    "hero.eyebrow": "iPhone & Mac",
    "hero.title": "Small apps, made with care.",
    "hero.lede": "One payment, a round price. No ads, no subscriptions, no dark patterns. Each one is a pause, like a coffee.",
    "hero.cta1": "Circell for iPhone",
    "hero.cta2": "Brillantor for Mac",

    "platform.ios": "iPhone",
    "platform.mac": "Mac",
    "label.puzzle": "Puzzle",
    "label.utility": "Menu bar utility",

    "circell.tagline": "Turn, join, bloom.",
    "circell.body": "A puzzle of rotation and connection. Tap the tiles to turn the vine strands 90° until no end is left open and the whole board is one living vine. When the vine closes, a wave of golden light runs through it and it blooms.",
    "circell.f1": "A gentle ladder of levels that opens up as you go.",
    "circell.f2": "Everything drawn in code: no clutter, no noise.",
    "circell.f3": "Sound synthesised on the fly, and it never interrupts your music.",
    "circell.f4": "English and Catalan, fully localised.",
    "circell.demo.hint": "Tap the tiles to close the vine.",
    "circell.demo.won": "The vine lives!",
    "circell.demo.new": "New board",
    "circell.demo.caption": "A real board. Play it right here.",

    "brillantor.tagline": "Lighter shadows, darker nights.",
    "brillantor.body": "A small sun in your menu bar. Open it on any screen and you get one slider for that screen. Push it right and the dark parts of the picture open up, for a film that is too dark to follow. Push it left and the screen goes darker than macOS will let it go, for reading in bed at three in the morning.",
    "brillantor.f1": "One slider. That is the whole app.",
    "brillantor.f2": "Each display keeps its own light, and gets it back when you plug it in again.",
    "brillantor.f3": "Darker than the system minimum, when the room is dark too.",
    "brillantor.f4": "Restores your colours the moment you quit. Nothing is permanent.",
    "brillantor.slider.label": "Screen light",
    "brillantor.scene.alt": "A dark photo that opens up or dims further as you move the slider",
    "brillantor.demo.caption": "Move the slider both ways. The photo is the same one.",
    "brillantor.screen": "Built-in Display",
    "brillantor.off": "Turn Off",
    "brillantor.quit": "Quit Brillantor",
    "brillantor.neutral": "Neutral",
    "brillantor.lift": "Shadows +{n}%",
    "brillantor.dim": "Dimmed to {n}%",

    "store.pre.ios": "Download on the",
    "store.pre.mac": "Download on the",
    "store.soon": "Link coming soon",

    "promise.title": "How we sell things",
    "promise.lede": "The same rules for every app we make. Written here so you can hold us to them.",
    "promise.c1.t": "One payment",
    "promise.c1.b": "You buy it once and it is yours. No subscription on what you already own.",
    "promise.c2.t": "A round price",
    "promise.c2.b": "Whole numbers. Nothing ends in .99 to look smaller than it is.",
    "promise.c3.t": "No ads",
    "promise.c3.b": "Nothing interrupts you, nothing asks you to wait or watch.",
    "promise.c4.t": "No tracking",
    "promise.c4.b": "No analytics, no ad profiles, no accounts, nothing about you sold.",
    "promise.fine": "The small print, and it really is small. If we ever make a game that needs a server to connect players, that server costs us money every month, so that game may carry a subscription. We will say so here and on the App Store before you pay, never after. A game that talks to a server also has to send something, and we will spell out exactly what leaves your device and why. What we will never do is take something you have already bought and put it behind a subscription.",

    "brewing.title": "Brewing",
    "brewing.lede": "Being made now, in the same cup.",
    "brew.trac": "One green line.",
    "brew.vitrall": "Light, cell by cell.",
    "brew.confitura": "Fruit falls, the jar fills.",

    "foot.support": "Questions, bugs, ideas. Write to us and a person answers.",
    "foot.privacy": "Privacy",
    "foot.top": "Back to top",
    "foot.made": "Made in Catalonia.",

    /* privacy.html */
    "html.title.privacy": "Privacy · Minta Cafè",
    "privacy.title": "Privacy",
    "privacy.lede": "The short version: our apps collect nothing at all.",
    "privacy.updated": "Last updated: July 2026",
    "privacy.h1": "What we collect",
    "privacy.p1": "Nothing. Circell and Brillantor have no analytics, no crash reporting, no advertising identifiers and no accounts. Neither app opens a network connection.",
    "privacy.h2": "What stays on your device",
    "privacy.p2": "Circell remembers which level you reached, and your sound and music switches. Brillantor remembers nothing between launches. This data never leaves your device and is deleted with the app.",
    "privacy.h3": "Third parties",
    "privacy.p3": "There are none. We use no SDKs from anyone else. If you buy an app, Apple handles the payment and tells us nothing about you beyond anonymous sales totals.",
    "privacy.h4": "This website",
    "privacy.p4": "This page is static, hosted on GitHub Pages. There are no cookies and no analytics. GitHub keeps standard server logs of requests, which we do not read.",
    "privacy.h5": "Children",
    "privacy.p5": "Because we collect nothing, our apps are safe for any age.",
    "privacy.h6": "Getting in touch",
    "privacy.p6": "Write to info@mintacafe.com and a person answers.",
    "privacy.back": "Back to Minta Cafè"
  },

  ca: {
    "html.lang": "ca",
    "html.title": "Minta Cafè · apps petites i honestes per a iPhone i Mac",
    "lang.toggle": "EN",
    "lang.aria": "Switch language to English",
    "skip": "Ves al contingut",
    "nav.promise": "El compromís",

    "hero.eyebrow": "iPhone i Mac",
    "hero.title": "Apps petites, fetes amb cura.",
    "hero.lede": "Un sol pagament, preu rodó. Sense anuncis, sense subscripcions, sense trampes. Cada una és una pausa, com un cafè.",
    "hero.cta1": "Circell per a iPhone",
    "hero.cta2": "Brillantor per a Mac",

    "platform.ios": "iPhone",
    "platform.mac": "Mac",
    "label.puzzle": "Trencaclosques",
    "label.utility": "Utilitat de la barra de menú",

    "circell.tagline": "Gira, uneix, floreix.",
    "circell.body": "Un trencaclosques de rotació i connexió. Toca les caselles per girar els brins de vinya 90° fins que cap punta quedi oberta i tot el tauler sigui una sola parra viva. Quan la vinya es tanca, una onada de llum daurada la recorre i floreix.",
    "circell.f1": "Una escala suau de nivells que s'obre a mesura que avances.",
    "circell.f2": "Tot dibuixat amb codi: net, sense soroll.",
    "circell.f3": "So sintetitzat al moment, i mai no talla la teva música.",
    "circell.f4": "Anglès i català, completament localitzat.",
    "circell.demo.hint": "Toca les caselles per tancar la vinya.",
    "circell.demo.won": "Vinya viva!",
    "circell.demo.new": "Tauler nou",
    "circell.demo.caption": "Un tauler de debò. Juga-hi aquí mateix.",

    "brillantor.tagline": "Ombres més clares, nits més fosques.",
    "brillantor.body": "Un solet a la barra de menú. Obre'l a qualsevol pantalla i tens un control per a aquella pantalla. Cap a la dreta, les zones fosques de la imatge s'obren, per a una pel·lícula massa fosca de seguir. Cap a l'esquerra, la pantalla es fa més fosca del que el macOS et deixa arribar, per llegir al llit a les tres de la matinada.",
    "brillantor.f1": "Un control lliscant. L'app és això.",
    "brillantor.f2": "Cada pantalla guarda la seva llum, i la recupera quan la tornes a connectar.",
    "brillantor.f3": "Més fosca que el mínim del sistema, quan l'habitació també és fosca.",
    "brillantor.f4": "Recupera els teus colors just en sortir. Res no és permanent.",
    "brillantor.slider.label": "Llum de la pantalla",
    "brillantor.scene.alt": "Una foto fosca que s'obre o s'enfosqueix encara més quan mous el control",
    "brillantor.demo.caption": "Mou el control cap als dos costats. La foto és la mateixa.",
    "brillantor.screen": "Pantalla integrada",
    "brillantor.off": "Desactiva",
    "brillantor.quit": "Surt de Brillantor",
    "brillantor.neutral": "Neutre",
    "brillantor.lift": "Ombres +{n}%",
    "brillantor.dim": "Enfosquida al {n}%",

    "store.pre.ios": "Descarrega-la a l'",
    "store.pre.mac": "Descarrega-la al",
    "store.soon": "Enllaç a punt aviat",

    "promise.title": "Com venem les coses",
    "promise.lede": "Les mateixes regles per a totes les apps que fem. Escrites aquí perquè ens hi puguis fer complir.",
    "promise.c1.t": "Un sol pagament",
    "promise.c1.b": "La compres una vegada i és teva. Cap subscripció sobre el que ja és teu.",
    "promise.c2.t": "Preu rodó",
    "promise.c2.b": "Xifres senceres. Res no acaba en .99 per semblar més barat.",
    "promise.c3.t": "Sense anuncis",
    "promise.c3.b": "Res no t'interromp, res no et fa esperar ni mirar.",
    "promise.c4.t": "Sense seguiment",
    "promise.c4.b": "Ni analítiques, ni perfils publicitaris, ni comptes, ni res teu venut.",
    "promise.fine": "La lletra petita, i és petita de debò. Si algun dia fem un joc que necessiti un servidor per connectar jugadors, aquell servidor ens costarà diners cada mes, i per tant aquell joc pot portar subscripció. Ho direm aquí i a l'App Store abans que paguis, mai després. Un joc que parla amb un servidor també ha d'enviar alguna cosa, i direm exactament què surt del teu dispositiu i per què. El que no farem mai és agafar una cosa que ja has comprat i posar-la darrere d'una subscripció.",

    "brewing.title": "Al foc",
    "brewing.lede": "S'estan fent ara, a la mateixa tassa.",
    "brew.trac": "Una sola línia verda.",
    "brew.vitrall": "Llum, cel·la a cel·la.",
    "brew.confitura": "Cau la fruita, s'omple el pot.",

    "foot.support": "Dubtes, errors, idees. Escriu-nos i et contesta una persona.",
    "foot.privacy": "Privadesa",
    "foot.top": "Torna a dalt",
    "foot.made": "Fet a Catalunya.",

    /* privacy.html */
    "html.title.privacy": "Privadesa · Minta Cafè",
    "privacy.title": "Privadesa",
    "privacy.lede": "La versió curta: les nostres apps no recullen absolutament res.",
    "privacy.updated": "Darrera actualització: juliol del 2026",
    "privacy.h1": "Què recollim",
    "privacy.p1": "Res. Circell i Brillantor no tenen analítiques, ni informes d'errors, ni identificadors publicitaris, ni comptes. Cap de les dues apps obre una connexió de xarxa.",
    "privacy.h2": "Què es queda al teu dispositiu",
    "privacy.p2": "Circell recorda a quin nivell has arribat i els teus interruptors de so i música. Brillantor no recorda res entre execucions. Aquestes dades no surten mai del dispositiu i s'esborren amb l'app.",
    "privacy.h3": "Tercers",
    "privacy.p3": "No n'hi ha. No fem servir cap SDK de ningú altre. Si compres una app, Apple gestiona el pagament i no ens diu res de tu més enllà de totals de vendes anònims.",
    "privacy.h4": "Aquest web",
    "privacy.p4": "Aquesta pàgina és estàtica i està allotjada a GitHub Pages. No hi ha galetes ni analítiques. GitHub manté registres de servidor estàndard de les peticions, que nosaltres no llegim.",
    "privacy.h5": "Infants",
    "privacy.p5": "Com que no recollim res, les nostres apps són segures per a qualsevol edat.",
    "privacy.h6": "Contacte",
    "privacy.p6": "Escriu a info@mintacafe.com i et contesta una persona.",
    "privacy.back": "Torna a Minta Cafè"
  }
};

/* ── Language machinery ───────────────────────────────────── */

const LANG_KEY = "minta-lang";
let lang = localStorage.getItem(LANG_KEY)
        || ((navigator.language || "en").toLowerCase().startsWith("ca") ? "ca" : "en");

function t(key) {
  return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
}

function applyLang() {
  const dict = I18N[lang];
  document.documentElement.lang = dict["html.lang"];
  const titleKey = document.documentElement.dataset.titleKey || "html.title";
  if (dict[titleKey]) document.title = dict[titleKey];

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const val = dict[el.dataset.i18n];
    if (val != null) el.textContent = val;
  });
  document.querySelectorAll("[data-i18n-aria]").forEach(el => {
    const val = dict[el.dataset.i18nAria];
    if (val != null) el.setAttribute("aria-label", val);
  });

  const toggle = document.getElementById("langToggle");
  if (toggle) {
    toggle.querySelector(".lang__flip").textContent = dict["lang.toggle"];
    toggle.setAttribute("aria-label", dict["lang.aria"]);
  }

  document.dispatchEvent(new CustomEvent("langchange"));
}

document.getElementById("langToggle")?.addEventListener("click", () => {
  lang = lang === "ca" ? "en" : "ca";
  localStorage.setItem(LANG_KEY, lang);
  applyLang();
});

/* ── Store links ──────────────────────────────────────────── */

function wireStores() {
  document.querySelectorAll("[data-store]").forEach(box => {
    const url = STORE_LINKS[box.dataset.store];
    const link = box.querySelector("[data-store-link]");
    if (!link) return;
    if (url) {
      link.href = url;
      link.classList.remove("is-soon");
      link.removeAttribute("aria-disabled");
    } else {
      link.classList.add("is-soon");
      link.setAttribute("aria-disabled", "true");
      link.setAttribute("tabindex", "-1");
    }
  });
}

/* ── 3. Circell: a playable board ─────────────────────────── */
/* Bits: N=1 E=2 S=4 W=8. A random spanning tree over the grid
   guarantees the board is solvable; then every tile is spun. */

const COLS = 4, ROWS = 4;
const DIRS = [
  { bit: 1, dx:  0, dy: -1, opp: 4 },  // N
  { bit: 2, dx:  1, dy:  0, opp: 8 },  // E
  { bit: 4, dx:  0, dy:  1, opp: 1 },  // S
  { bit: 8, dx: -1, dy:  0, opp: 2 }   // W
];

const rot = (mask, times) => {
  let m = mask;
  for (let i = 0; i < (times % 4 + 4) % 4; i++) m = ((m << 1) | (m >> 3)) & 15;
  return m;
};

function spanningTree() {
  const masks = new Array(COLS * ROWS).fill(0);
  const seen  = new Array(COLS * ROWS).fill(false);
  const stack = [[0, 0]];
  seen[0] = true;

  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    const open = DIRS.filter(d => {
      const nx = x + d.dx, ny = y + d.dy;
      return nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && !seen[ny * COLS + nx];
    });
    if (!open.length) { stack.pop(); continue; }
    const d  = open[(Math.random() * open.length) | 0];
    const nx = x + d.dx, ny = y + d.dy;
    masks[y * COLS + x]   |= d.bit;
    masks[ny * COLS + nx] |= d.opp;
    seen[ny * COLS + nx] = true;
    stack.push([nx, ny]);
  }
  return masks;
}

const board = document.getElementById("board");
const status = document.getElementById("boardStatus");
/* `turns` is the logical quarter-turn (0 to 3); `spin` only ever grows, so a
   tile going from 3 back to 0 still turns forwards on screen. */
let base = [], turns = [], spin = [], won = false;

function tileSVG(mask) {
  const bits = DIRS.filter(d => mask & d.bit);
  const ends = {
    1: "M50 50 L50 0",
    2: "M50 50 L100 50",
    4: "M50 50 L50 100",
    8: "M50 50 L0 50"
  };
  const stems = bits.map(d => `<path class="stem" d="${ends[d.bit]}"/>`).join("");
  const bud = bits.length === 1 ? '<circle class="bud" cx="50" cy="50" r="5"/>' : "";
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><g class="tile__art">${stems}<circle class="hub" cx="50" cy="50" r="9"/>${bud}</g></svg>`;
}

function isSolved() {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const i = y * COLS + x;
      const m = rot(base[i], turns[i]);
      for (const d of DIRS) {
        if (!(m & d.bit)) continue;
        const nx = x + d.dx, ny = y + d.dy;
        if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return false;
        const n = ny * COLS + nx;
        if (!(rot(base[n], turns[n]) & d.opp)) return false;
      }
    }
  }
  return true;
}

function paint() {
  board.querySelectorAll(".tile").forEach((tile, i) => {
    tile.querySelector(".tile__art").style.transform = `rotate(${spin[i] * 90}deg)`;
  });
}

function checkWin() {
  if (!isSolved()) return;
  won = true;
  board.classList.add("is-won");
  status.textContent = t("circell.demo.won");
  status.classList.add("is-won");
  board.querySelectorAll(".tile").forEach((tile, i) => {
    const x = i % COLS, y = (i / COLS) | 0;
    const art = tile.querySelector(".tile__art");
    art.style.transitionDelay = "";
    tile.querySelectorAll(".stem, .hub").forEach(el => {
      el.style.transitionDelay = `${(x + y) * 70}ms`;
    });
  });
}

function newBoard() {
  base = spanningTree();
  won = false;
  board.classList.remove("is-won");
  status.classList.remove("is-won");
  status.textContent = t("circell.demo.hint");

  // Spin every tile; make sure we do not hand out an already-solved board.
  do {
    turns = base.map(() => (Math.random() * 4) | 0);
  } while (isSolved());
  spin = turns.slice();

  board.innerHTML = "";
  base.forEach((mask, i) => {
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "tile";
    tile.innerHTML = tileSVG(mask);
    tile.setAttribute("aria-label",
      `Rotate tile ${(i % COLS) + 1}, ${((i / COLS) | 0) + 1}`);
    tile.addEventListener("click", () => {
      if (won) return;
      turns[i] = (turns[i] + 1) % 4;
      spin[i] += 1;
      tile.querySelector(".tile__art").style.transform = `rotate(${spin[i] * 90}deg)`;
      checkWin();
    });
    board.appendChild(tile);
  });
  paint();
}

document.getElementById("newBoard")?.addEventListener("click", newBoard);

/* Keep the board's caption in the right language when it switches. */
document.addEventListener("langchange", () => {
  if (!status) return;
  status.textContent = won ? t("circell.demo.won") : t("circell.demo.hint");
});

/* ── 4. Brillantor: a real gamma lift ─────────────────────── */
/* Exactly what the app does to your displays: gamma = 1 / boost. */

const boost = document.getElementById("boost");
const funcs = document.querySelectorAll("#gammaFuncs > *");
const readout = document.getElementById("boostReadout");
const offRow = document.getElementById("offRow");

/* The same `t` as the app: -1 is as dark as it goes, 0 is neutral, +1 lifts
   the shadows the most. An feFunc computes amplitude * C^exponent, which maps
   one to one onto what CGSetDisplayTransferByFormula does in main.swift:
   a pure gamma to lift, a linear scale to dim. */
function applyBoost() {
  const level = parseFloat(boost.value);
  let exponent = 1, amplitude = 1;

  if (level > 0.001) {
    exponent = 1 / (1 + 1.5 * level);        // lift the shadows
  } else if (level < -0.001) {
    amplitude = 1 + 0.75 * level;            // dim below the system minimum
  }

  funcs.forEach(f => {
    f.setAttribute("exponent", exponent.toFixed(3));
    f.setAttribute("amplitude", amplitude.toFixed(3));
  });

  const neutral = Math.abs(level) < 0.05;
  offRow.classList.toggle("is-off", neutral);
  readout.textContent =
    neutral   ? t("brillantor.neutral")
  : level > 0 ? t("brillantor.lift").replace("{n}", Math.round(level * 150))
              : t("brillantor.dim").replace("{n}", Math.round(amplitude * 100));
}

if (boost) {
  boost.addEventListener("input", applyBoost);
  document.addEventListener("langchange", applyBoost);
}

/* Quit row follows the language too. */
document.addEventListener("langchange", () => {
  const quit = document.querySelector(".popover__item--quiet");
  if (quit) quit.textContent = t("brillantor.quit");
});

/* ── Small touches ────────────────────────────────────────── */

const head = document.querySelector(".head");
if (head) {
  const onScroll = () => head.classList.toggle("is-stuck", window.scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const targets = document.querySelectorAll(".app, .promise, .brewing, .foot__inner");
  targets.forEach(el => el.classList.add("reveal"));
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    });
  }, { rootMargin: "-40px" });
  targets.forEach(el => io.observe(el));
}

/* ── Go ───────────────────────────────────────────────────── */

applyLang();
wireStores();
if (board) newBoard();
if (boost) applyBoost();
