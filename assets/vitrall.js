/* ===========================================================
   Vitrall · five windows to play on the web
   The game (Games/Vitrall) ported to the browser: the same boards,
   the same rules and the same drawing, number for number —
   WallArt, WindowArt, ClueViews, BoardPlan, GameModel and
   PaneAnimator. Five windows from the start of the game's own
   ladder (levels 6, 8, 13, 25 and 36), each bringing one new idea,
   the way the game teaches.

   It lays out an iPhone screen 402 points wide, the size of the
   store screenshots, and draws it at whatever size the phone on the
   page has, so it looks like the game and not like a web page.
   Mounts on [data-vitrall-demo] and draws everything itself.

   1. Dice          SplitMix64, the game's own generator
   2. The glass     families, ink, colour mixing
   3. The windows   the five boards, their numbers, their pieces
   4. The plan      BoardPlan: where everything goes
   5. Art           the wall, the window, the light it throws
   6. The game      marks, modes, dragging, Check, the win
   7. The page      elements, canvases, input, the drawing loop
   =========================================================== */

(() => {
"use strict";

const root = document.querySelector("[data-vitrall-demo]");
if (!root) return;

/* ── Words ─────────────────────────────────────────────────── */

const WORDS = {
  en: {
    title: "Window {n} of 5",
    pane: "Window {n}",
    paneDone: "Window {n}, lit",
    panes: "The five windows",
    check: "Check",
    clear: "Clear the board",
    paint: "Paint",
    note: "Note",
    modes: "What a tap does",
    glows: "The window glows!",
    next: "Next: window {n}",
    last: "In the app they go on, up to 8×8.",
    board: "Window {n} of 5, {size} by {size} panes. Tap a pane to light it; with Note, mark one that stays clear. Arrow keys and Space work too, and N switches between Paint and Note.",
  },
  ca: {
    title: "Finestra {n} de 5",
    pane: "Finestra {n}",
    paneDone: "Finestra {n}, encesa",
    panes: "Les cinc finestres",
    check: "Comprova",
    clear: "Neteja el tauler",
    paint: "Pinta",
    note: "Nota",
    modes: "Què fa un toc",
    glows: "La finestra s'encén!",
    next: "Següent: finestra {n}",
    last: "A l'app continuen, fins a 8×8.",
    board: "Finestra {n} de 5, de {size} per {size} vidres. Toca un vidre per encendre'l; amb Nota, marca'n un que es queda clar. També van les fletxes i l'espai, i la N canvia entre Pinta i Nota.",
  },
};

const lang = () => ((document.documentElement.lang || "en").toLowerCase().startsWith("ca") ? "ca" : "en");
const say = (key, values = {}) =>
  (WORDS[lang()][key] || WORDS.en[key]).replace(/\{(\w+)\}/g, (_, k) => values[k] ?? "");

/* ── 1. Dice ───────────────────────────────────────────────── */

const MASK64 = (1n << 64n) - 1n;

/* BigInt, so it walks exactly the game's sequence of UInt64s. */
class SplitMix64 {
  constructor(seed) { this.state = BigInt.asUintN(64, BigInt(seed)); }

  next() {
    this.state = (this.state + 0x9E3779B97F4A7C15n) & MASK64;
    let z = this.state;
    z = ((z ^ (z >> 30n)) * 0xBF58476D1CE4E5B9n) & MASK64;
    z = ((z ^ (z >> 27n)) * 0x94D049BB133111EBn) & MASK64;
    return z ^ (z >> 31n);
  }

  /* In 0..<1. */
  unit() { return Number(this.next() >> 11n) * (1 / 9007199254740992); }
}

/* The glass is drawn many times a second with the same dice: thrown once, read again. */
class Tape {
  constructor(seed, count) {
    const rng = new SplitMix64(seed);
    this.list = new Float64Array(count);
    for (let i = 0; i < count; i++) this.list[i] = rng.unit();
    this.at = 0;
  }
  rewind() { this.at = 0; return this; }
  unit() { return this.list[this.at++ % this.list.length]; }
}

/* ── 2. The glass ──────────────────────────────────────────── */

const clamp01 = t => Math.min(1, Math.max(0, t));
const smoothstep = t => { t = clamp01(t); return t * t * (3 - 2 * t); };

/* `b` at `t`, over `a`. */
function mixHex(a, b, t) {
  t = clamp01(t);
  const channel = shift => {
    const x = (a >> shift) & 255, y = (b >> shift) & 255;
    return Math.round(x + (y - x) * t) << shift;
  };
  return channel(16) | channel(8) | channel(0);
}

const rgba = (hex, a = 1) => `rgba(${(hex >> 16) & 255},${(hex >> 8) & 255},${hex & 255},${a})`;

/* Eight families, one to a level and round again, from the windows of the Modernisme. */
const FAMILIES = [
  { main: 0xE9A20F, light: 0xF9CF4A, deep: 0xB8700A, jewels: [0xE9A20F, 0xF6C938, 0xD9541E, 0x1F5FD0] }, // honey
  { main: 0x1F5FD0, light: 0x5B9BF0, deep: 0x123A8C, jewels: [0x1F5FD0, 0x3E8DE8, 0x123A8C, 0xE9A20F] }, // cobalt
  { main: 0xC9222F, light: 0xF0584F, deep: 0x8E0F24, jewels: [0xC9222F, 0xE8553C, 0x8E0F24, 0xE9A20F] }, // ruby
  { main: 0x0F8F5F, light: 0x4FCB8A, deep: 0x0A5C42, jewels: [0x0F8F5F, 0x45BE7B, 0x0A5C42, 0xE9C21F] }, // emerald
  { main: 0x7A35B8, light: 0xB57BE8, deep: 0x4A1E7E, jewels: [0x7A35B8, 0xA962DB, 0x4A1E7E, 0xE05A9A] }, // amethyst
  { main: 0x0E97A4, light: 0x50D0D6, deep: 0x0A6470, jewels: [0x0E97A4, 0x3CC3C8, 0x0A6470, 0xF0A030] }, // turquoise
  { main: 0xE0620F, light: 0xF8A040, deep: 0xA23A08, jewels: [0xE0620F, 0xF49A26, 0xB83214, 0x7A35B8] }, // dusk
  { main: 0xC92A78, light: 0xF06CA8, deep: 0x8E1450, jewels: [0xC92A78, 0xEE6AA0, 0x8E1450, 0xF4B13A] }, // pomegranate
];

const family = level => FAMILIES[Math.max(0, level - 1) % FAMILIES.length];

/* The colour a filled pane has while playing, along the board's diagonal. */
const working = (f, night) => night
  ? [mixHex(f.light, 0xFFFFFF, 0.18), f.light, f.main]
  : [mixHex(f.main, f.light, 0.35), f.main, f.deep];

const jewel = (f, i) => f.jewels[i % f.jewels.length];

/* The glass around the pieces once it's solved: pale by day, dark by night, tinted. */
function field(f, index, night) {
  const tints = [f.jewels[0], f.jewels[f.jewels.length - 1], f.jewels[1]];
  const tint = tints[index % tints.length];
  const weight = (night ? [0.42, 0.30, 0.36] : [0.24, 0.30, 0.34])[index % 3];
  return night ? mixHex(0x10162A, mixHex(tint, f.deep, 0.45), weight) : mixHex(0xF8F5EA, tint, weight);
}

/* The rest of the room. */
const ink = night => ({
  lead: night ? 0x05070E : 0x2F3339,
  leadEdge: night ? 0x4A546E : 0x7B818B,
  wallTop: night ? 0x151C2E : 0xCFC7B8,
  wallBottom: night ? 0x0B0F1B : 0xB5AC9A,
});

/* ── 3. The windows ────────────────────────────────────────── */

/* Five levels of the game, as it keeps them: a byte of hex per row, bit c is column c. */
const WINDOWS = [
  { level: 6,  code: "1f1e071c1e" }, // friendly: half the lines give themselves away
  { level: 8,  code: "170b040306" }, // no empty lines: closing a line off, with notes
  { level: 13, code: "150f0f0b1a" }, // «3» in 5: the middle's safe
  { level: 25, code: "1706051801" }, // one number and some glass: it joins up
  { level: 36, code: "100b120d1e" }, // a piece as big as the biggest number can't grow
];

function decode(code) {
  const n = code.length / 2;
  const rows = [];
  for (let r = 0; r < n; r++) {
    const value = parseInt(code.substr(r * 2, 2), 16);
    rows.push(Array.from({ length: n }, (_, c) => (value & (1 << c)) !== 0));
  }
  return rows;
}

function runLengths(line) {
  const runs = [];
  let run = 0;
  for (const cell of line) {
    if (cell) run++;
    else if (run > 0) { runs.push(run); run = 0; }
  }
  if (run > 0) runs.push(run);
  return runs;
}

const sameRuns = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);

/* What a solved board becomes: each run of touching lit cells one piece of glass, each
   stretch of touching clear ones another. Numbered in reading order, as Regions.swift. */
function regionsOf(solution) {
  const n = solution.length;
  const piece = solution.map(row => row.map(() => -1));
  const island = solution.map(row => row.map(() => null));
  const fieldOf = solution.map(row => row.map(() => null));
  let pieces = 0, islands = 0, fields = 0;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (piece[r][c] >= 0) continue;
      const filled = solution[r][c];
      const stack = [[r, c]];
      piece[r][c] = pieces;
      while (stack.length) {
        const [y, x] = stack.pop();
        if (filled) island[y][x] = islands; else fieldOf[y][x] = fields;
        for (const [dy, dx] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const ny = y + dy, nx = x + dx;
          if (ny < 0 || ny >= n || nx < 0 || nx >= n || piece[ny][nx] >= 0 || solution[ny][nx] !== filled) continue;
          piece[ny][nx] = pieces;
          stack.push([ny, nx]);
        }
      }
      pieces++;
      if (filled) islands++; else fields++;
    }
  }
  return { piece, island, field: fieldOf };
}

const UNKNOWN = 0, FILLED = 1, DOT = 2;

/* Whether at least one way of filling the line fits its numbers and the marks: Check. */
function hasCandidate(clue, marks) {
  const n = marks.length;
  for (let pattern = 0; pattern < (1 << n); pattern++) {
    let ok = true;
    for (let i = 0; i < n && ok; i++) {
      const bit = (pattern & (1 << i)) !== 0;
      if ((marks[i] === FILLED && !bit) || (marks[i] === DOT && bit)) ok = false;
    }
    if (!ok) continue;
    const line = Array.from({ length: n }, (_, i) => (pattern & (1 << i)) !== 0);
    if (sameRuns(runLengths(line), clue)) return true;
  }
  return false;
}

const puzzles = WINDOWS.map(w => {
  const solution = decode(w.code);
  const n = solution.length;
  return {
    level: w.level,
    n,
    solution,
    rowClues: solution.map(runLengths),
    colClues: Array.from({ length: n }, (_, c) => runLengths(solution.map(row => row[c]))),
    regions: regionsOf(solution),
    family: family(w.level),
    // The glass of each level has its own clouds, reams and bubbles.
    tape: new Tape(w.level + 91, 512),
  };
});

/* ── 4. The plan ───────────────────────────────────────────── */
/* BoardPlan.make, in points of a 402-point-wide phone. */

const CASING = 7, GAP = 5, MARGIN = 10;
const LARGEST_CELL = 104, SMALLEST_CELL = 26;
const HEADER_H = 48, TOOLBAR_H = 118, SIDE_W = 224;
const PHONE_WIDTH = 402;

const clueFont = cell => Math.min(25, Math.max(12.5, cell * 0.44));
const rowClueWidth = (count, font) => Math.max(1, count) * (font * 0.62 + 3.5) + 3;
const colClueHeight = (count, font) => Math.max(1, count) * (font * 1.13) + 2;

function makePlan(width, height, insets, n, rowCount, colCount) {
  const wide = width > height * 1.08;
  const safe = {
    x: insets.left, y: insets.top,
    w: Math.max(1, width - insets.left - insets.right),
    h: Math.max(1, height - insets.top - insets.bottom),
  };
  let header, toolbar, room;
  if (wide) {
    const side = { x: safe.x + MARGIN, y: safe.y + 6, w: SIDE_W, h: safe.h - 12 };
    header = { x: side.x, y: side.y, w: side.w, h: HEADER_H * 2.4 };
    toolbar = { x: side.x, y: side.y + side.h - TOOLBAR_H - 40, w: side.w, h: TOOLBAR_H + 40 };
    room = { x: side.x + side.w + MARGIN, y: safe.y + 6, w: safe.x + safe.w - (side.x + side.w) - MARGIN * 2, h: safe.h - 12 };
  } else {
    header = { x: safe.x + 8, y: safe.y + 2, w: safe.w - 16, h: HEADER_H };
    toolbar = { x: safe.x + 8, y: safe.y + safe.h - TOOLBAR_H - 4, w: safe.w - 16, h: TOOLBAR_H };
    room = {
      x: safe.x + MARGIN, y: header.y + header.h + 8,
      w: safe.w - MARGIN * 2, h: toolbar.y - (header.y + header.h) - 14,
    };
  }

  // The biggest pane at which it all fits, numbers and frame included.
  let cell = LARGEST_CELL;
  while (cell > SMALLEST_CELL) {
    const font = clueFont(cell);
    const w = rowClueWidth(rowCount, font) + GAP + CASING * 2 + n * cell;
    const h = colClueHeight(colCount, font) + GAP + CASING * 2 + n * cell;
    if (w <= room.w && h <= room.h) break;
    cell -= 0.5;
  }
  cell = Math.floor(cell);

  const font = clueFont(cell);
  const rowWidth = rowClueWidth(rowCount, font);
  const colHeight = colClueHeight(colCount, font);
  const side = n * cell;
  const leftmost = room.x + rowWidth + GAP + CASING;
  const rightmost = room.x + room.w - CASING - side;
  const x = Math.min(rightmost, Math.max(leftmost, (width - side) / 2));
  const topmost = room.y + colHeight + GAP + CASING;
  const spare = Math.max(0, room.y + room.h - CASING - side - topmost);
  const y = topmost + spare * (wide ? 0.5 : 0.38);
  const centred = wide ? Math.max(leftmost, Math.min(rightmost, room.x + room.w / 2 - side / 2 + rowWidth / 3)) : x;
  const win = { x: Math.round(centred), y: Math.round(y), w: side, h: side };

  return {
    width, height, wide, n, cell, font,
    window: win,
    rowClues: { x: win.x - CASING - GAP - rowWidth, y: win.y, w: rowWidth, h: side },
    colClues: { x: win.x, y: win.y - CASING - GAP - colHeight, w: side, h: colHeight },
    header, toolbar,
  };
}

/* ── 5. Art ────────────────────────────────────────────────── */

function roundRectPath(c, x, y, w, h, r) {
  c.beginPath();
  if (c.roundRect) { c.roundRect(x, y, w, h, r); return; }
  r = Math.min(r, w / 2, h / 2);
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

function fillEllipse(c, x, y, w, h, style) {
  c.beginPath();
  c.ellipse(x + w / 2, y + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, Math.PI * 2);
  c.fillStyle = style;
  c.fill();
}

/* The stone the window is set in: ashlar, each block a shade of its own, grain, and the
   corners falling away. By day an interior in the shade; by night the wall from outside. */
function paintWall(c, w, h, night) {
  const k = ink(night);
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, rgba(k.wallTop));
  g.addColorStop(1, rgba(k.wallBottom));
  c.fillStyle = g;
  c.fillRect(0, 0, w, h);

  const rng = new SplitMix64(7741);
  const course = 58;
  let y = -8, row = 0;
  c.lineWidth = 1;
  while (y < h) {
    let x = row % 2 === 0 ? -34 : -92;
    while (x < w) {
      const width = 96 + rng.unit() * 52;
      const shade = rng.unit();
      const amount = (night ? 0.018 : 0.028) * Math.abs(shade - 0.5) * 2;
      roundRectPath(c, x + 1, y + 1, width - 2, course - 2, 2);
      c.fillStyle = shade < 0.5 ? `rgba(0,0,0,${amount})` : `rgba(255,255,255,${amount})`;
      c.fill();
      // The joint.
      c.beginPath(); c.moveTo(x + width, y); c.lineTo(x + width, y + course);
      c.strokeStyle = `rgba(0,0,0,${night ? 0.22 : 0.07})`; c.stroke();
      if (!night) {
        c.beginPath(); c.moveTo(x + width + 1, y); c.lineTo(x + width + 1, y + course);
        c.strokeStyle = "rgba(255,255,255,0.13)"; c.stroke();
      }
      x += width;
    }
    c.beginPath(); c.moveTo(0, y + course); c.lineTo(w, y + course);
    c.strokeStyle = `rgba(0,0,0,${night ? 0.24 : 0.075})`; c.stroke();
    if (!night) {
      c.beginPath(); c.moveTo(0, y + course + 1); c.lineTo(w, y + course + 1);
      c.strokeStyle = "rgba(255,255,255,0.15)"; c.stroke();
    }
    y += course;
    row++;
  }

  // The grain of it.
  const grains = Math.floor(w * h / 900);
  for (let i = 0; i < grains; i++) {
    const gx = rng.unit() * w, gy = rng.unit() * h;
    const r = 0.35 + rng.unit() * 0.9;
    const dark = rng.unit() < 0.6;
    const a = (night ? 0.10 : 0.07) * rng.unit();
    fillEllipse(c, gx, gy, r, r, dark ? `rgba(0,0,0,${a})` : `rgba(255,255,255,${a})`);
  }

  // The corners fall away.
  const far = Math.max(w, h) * 0.78;
  const v = c.createRadialGradient(w / 2, h * 0.42, far * 0.45, w / 2, h * 0.42, far);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, `rgba(0,0,0,${night ? 0.42 : 0.16})`);
  c.fillStyle = v;
  c.fillRect(0, 0, w, h);
}

const WAVE_STEP = 0.04, WAVE_LENGTH = 0.45;
const waveDelay = (r, c) => (r + c) * WAVE_STEP;
const waveEnd = n => (2 * n - 2) * WAVE_STEP + WAVE_LENGTH;

/* One frame of the window as plain data, like WindowArt.Scene. */
class Scene {
  constructor(p, marks, night, cell, fill, glint, active, bad, win) {
    Object.assign(this, { p, marks, night, cell, fill, glint, active, bad, win });
    this.n = p.n;
  }
  fillAmount(r, c) { return this.fill(r, c); }
  revealed(r, c) {
    if (this.win == null) return 0;
    return smoothstep((this.win - waveDelay(r, c)) / WAVE_LENGTH);
  }
  get leadMoved() {
    if (this.win == null) return 0;
    return smoothstep((this.win - 0.2) / Math.max(0.4, waveEnd(this.n) - 0.2));
  }
}

const cellRect = (r, c, cell) => [c * cell, r * cell, cell, cell];

function islandBox(s, island) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let r = 0; r < s.n; r++) for (let c = 0; c < s.n; c++) {
    if (s.p.regions.island[r][c] !== island) continue;
    x0 = Math.min(x0, c * s.cell); y0 = Math.min(y0, r * s.cell);
    x1 = Math.max(x1, (c + 1) * s.cell); y1 = Math.max(y1, (r + 1) * s.cell);
  }
  return x0 === Infinity ? [0, 0, 0, 0] : [x0, y0, x1, y1];
}

/* The glass itself, inside its frame: clear glass, the panes, the surface, the focus,
   the notes, the lead and, once solved, the light crossing it. In window coordinates. */
function paintGlass(c, s) {
  const n = s.n, side = n * s.cell;
  c.save();
  roundRectPath(c, 0, 0, side, side, 3);
  c.clip();

  // Daylight through old clear glass; at night, nothing behind it but the dark.
  const clear = s.night ? [0x202A40, 0x171E31, 0x121829] : [0xE3EDF0, 0xF1F3EC, 0xF8F3E2];
  let g = c.createLinearGradient(0, 0, side * 0.5, side);
  clear.forEach((hex, i) => g.addColorStop(i / 2, rgba(hex)));
  c.fillStyle = g;
  c.fillRect(0, 0, side, side);

  const f = s.p.family;
  const work = working(f, s.night);
  const workGradient = c.createLinearGradient(0, 0, side, side);
  work.forEach((hex, i) => workGradient.addColorStop(i / 2, rgba(hex)));

  for (let r = 0; r < n; r++) {
    for (let col = 0; col < n; col++) {
      const [x, y, w, h] = cellRect(r, col, s.cell);
      const rx = x - 0.35, ry = y - 0.35, rw = w + 0.7, rh = h + 0.7;
      const reveal = s.revealed(r, col);
      const isFilled = s.p.solution[r][col];
      // The field: clear glass taking the level's tint.
      if (reveal > 0 && !isFilled) {
        const index = s.p.regions.field[r][col];
        if (index != null) {
          c.globalAlpha = reveal;
          c.fillStyle = rgba(field(f, index, s.night));
          c.fillRect(rx, ry, rw, rh);
          c.globalAlpha = 1;
        }
      }
      const fill = s.fillAmount(r, col);
      if (fill > 0 && reveal < 1) {
        c.globalAlpha = fill;
        c.fillStyle = workGradient;
        c.fillRect(rx, ry, rw, rh);
        c.globalAlpha = 1;
      }
      if (reveal > 0 && isFilled) {
        const island = s.p.regions.island[r][col];
        if (island != null) {
          const jw = jewel(f, island);
          const [bx0, by0, bx1, by1] = islandBox(s, island);
          const jg = c.createLinearGradient(bx0, by0, bx1, by1);
          jg.addColorStop(0, rgba(mixHex(jw, 0xFFFFFF, s.night ? 0.34 : 0.22)));
          jg.addColorStop(0.5, rgba(jw));
          jg.addColorStop(1, rgba(mixHex(jw, 0x000000, s.night ? 0.08 : 0.2)));
          c.globalAlpha = reveal;
          c.fillStyle = jg;
          c.fillRect(rx, ry, rw, rh);
          c.globalAlpha = 1;
        }
      }
      const glint = s.glint(r, col);
      if (glint > 0) {
        c.globalAlpha = glint * 0.75;
        c.fillStyle = "#fff";
        c.fillRect(rx, ry, rw, rh);
        c.globalAlpha = 1;
      }
    }
  }

  paintSurface(c, s, side);
  paintFocus(c, s, side);
  paintDots(c, s);
  paintLead(c, s);
  paintSweep(c, s, side);
  c.restore();
}

function radialSpot(c, x, y, reach, white, strength) {
  const tone = white ? "255,255,255" : "0,0,0";
  const g = c.createRadialGradient(x, y, 0, x, y, reach);
  g.addColorStop(0, `rgba(${tone},${strength})`);
  g.addColorStop(1, `rgba(${tone},0)`);
  c.fillStyle = g;
  c.beginPath();
  c.ellipse(x, y, reach, reach, 0, 0, Math.PI * 2);
  c.fill();
}

/* What makes it glass and not paint: reams in the blowing, small bubbles, the sheen. */
function paintSurface(c, s, side) {
  const rng = s.p.tape.rewind();
  const n = s.n, cell = s.cell;
  // Glass made by hand is never one thickness: it clouds, lighter here, darker there.
  for (let i = 0; i < n * 2 + 4; i++) {
    const x = rng.unit() * side, y = rng.unit() * side;
    const reach = cell * (0.8 + rng.unit() * 1.5);
    const light = rng.unit() < 0.55;
    const strength = (light ? (s.night ? 0.07 : 0.2) : (s.night ? 0.14 : 0.12)) * (0.4 + rng.unit() * 0.6);
    radialSpot(c, x, y, reach, light, strength);
  }
  // Reams: broad, faint swells in the thickness, not lines drawn on it.
  const reams = Math.max(5, n * 2);
  c.lineCap = "round";
  for (let i = 0; i < reams; i++) {
    const y = rng.unit() * side;
    const tilt = (rng.unit() - 0.5) * side * 0.5;
    const wave = (rng.unit() - 0.5) * cell * 1.3;
    const width = cell * (0.1 + rng.unit() * 0.28);
    const light = rng.unit() < 0.62;
    const strength = (s.night ? 0.02 : (light ? 0.06 : 0.035)) * (0.5 + rng.unit() * 0.5);
    const path = new Path2D();
    path.moveTo(-4, y);
    path.bezierCurveTo(side * 0.33, y + wave, side * 0.66, y + tilt - wave, side + 4, y + tilt);
    c.strokeStyle = light ? `rgba(255,255,255,${strength})` : `rgba(0,0,0,${strength})`;
    c.lineWidth = width;
    c.stroke(path);
    c.lineWidth = width * 0.45;
    c.stroke(path);
  }
  // Coloured glass clouds more than clear: that's what makes it look lit from behind.
  const coloured = new Path2D();
  let any = false;
  for (let r = 0; r < n; r++) for (let col = 0; col < n; col++) {
    if (s.fillAmount(r, col) > 0.5 || (s.win != null && s.p.solution[r][col])) {
      coloured.rect(col * cell, r * cell, cell, cell);
      any = true;
    }
  }
  if (any) {
    c.save();
    c.clip(coloured);
    for (let i = 0; i < n * 2 + 2; i++) {
      const x = rng.unit() * side, y = rng.unit() * side;
      const reach = cell * (0.6 + rng.unit() * 1.1);
      const light = rng.unit() < 0.5;
      const strength = (light ? 0.16 : 0.22) * (0.5 + rng.unit() * 0.5);
      radialSpot(c, x, y, reach, light, strength);
    }
    c.restore();
  }
  // Seeds: the little bubbles a blower can't keep out.
  for (let i = 0; i < Math.floor(n * n / 2) + 3; i++) {
    const x = rng.unit() * side, y = rng.unit() * side;
    const r = 0.5 + rng.unit() * Math.max(0.8, cell * 0.025);
    fillEllipse(c, x - r + 0.4, y - r + 0.5, r * 2, r * 2, "rgba(0,0,0,0.10)");
    fillEllipse(c, x - r, y - r, r * 2, r * 2, `rgba(255,255,255,${s.night ? 0.16 : 0.34})`);
  }
  // The sky on the glass, across one corner.
  const sheen = c.createLinearGradient(0, 0, side, side);
  sheen.addColorStop(0, `rgba(255,255,255,${s.night ? 0.07 : 0.17})`);
  sheen.addColorStop(0.42, `rgba(255,255,255,${s.night ? 0.015 : 0.03})`);
  sheen.addColorStop(0.55, "rgba(255,255,255,0)");
  c.fillStyle = sheen;
  c.fillRect(0, 0, side, side);
}

/* The line under your finger, so you can count, and the lines Check has found wrong. */
function paintFocus(c, s, side) {
  const band = `rgba(255,255,255,${s.night ? 0.05 : 0.24})`;
  const dark = `rgba(0,0,0,${s.night ? 0 : 0.045})`;
  const line = (x, y, w, h, style) => { c.fillStyle = style; c.fillRect(x, y, w, h); };
  const { row, col } = s.active;
  if (row != null && row < s.n) {
    line(0, row * s.cell, side, s.cell, dark);
    line(0, row * s.cell, side, s.cell, band);
  }
  if (col != null && col < s.n) {
    line(col * s.cell, 0, s.cell, side, dark);
    line(col * s.cell, 0, s.cell, side, band);
  }
  const wrong = rgba(0xE5402E, s.night ? 0.28 : 0.2);
  for (const r of s.bad.rows) if (r < s.n) line(0, r * s.cell, side, s.cell, wrong);
  for (const k of s.bad.cols) if (k < s.n) line(k * s.cell, 0, s.cell, side, wrong);
}

/* A dab where you've noted that nothing goes. */
function paintDots(c, s) {
  if (s.win != null) return;
  const r = Math.max(2.6, s.cell * 0.085);
  c.fillStyle = rgba(s.night ? 0xA9B6CE : 0x5A6672);
  for (let row = 0; row < s.n; row++) for (let col = 0; col < s.n; col++) {
    if (s.marks[row][col] !== DOT) continue;
    c.beginPath();
    c.arc((col + 0.5) * s.cell, (row + 0.5) * s.cell, r, 0, Math.PI * 2);
    c.fill();
  }
}

function paintLead(c, s) {
  const n = s.n, cell = s.cell, moved = s.leadMoved;
  const plain = new Path2D(), heavy = new Path2D(), soft = new Path2D(), strong = new Path2D();
  const add = (a, b, x0, y0, x1, y1) => {
    let path;
    if (s.win != null) {
      path = s.p.regions.piece[a[0]][a[1]] === s.p.regions.piece[b[0]][b[1]] ? plain : strong;
    } else {
      const fa = s.fillAmount(a[0], a[1]) >= 0.5, fb = s.fillAmount(b[0], b[1]) >= 0.5;
      if (fa && fb) path = soft;
      else if (fa !== fb) path = strong;
      else if (n >= 6 && (a[0] !== b[0] ? b[0] : b[1]) % 5 === 0) path = heavy;
      else path = plain;
    }
    path.moveTo(x0, y0);
    path.lineTo(x1, y1);
  };
  for (let r = 0; r < n; r++) for (let col = 0; col < n; col++) {
    const x = col * cell, y = r * cell;
    if (col + 1 < n) add([r, col], [r, col + 1], x + cell, y, x + cell, y + cell);
    if (r + 1 < n) add([r, col], [r + 1, col], x, y + cell, x + cell, y + cell);
  }

  const k = ink(s.night);
  const lead = s.night ? 0x2E3650 : 0x2F3339;
  const base = Math.min(3.4, Math.max(1.3, cell * 0.052));
  c.lineCap = "round";
  c.lineJoin = "round";
  const stroke = (path, style, width) => { c.strokeStyle = style; c.lineWidth = width; c.stroke(path); };
  if (s.win != null) {
    // What's inside a piece fades as the lead moves out to its edges.
    stroke(plain, rgba(lead, (s.night ? 0.8 : 0.45) * (1 - moved)), base * 0.7);
  } else {
    stroke(plain, rgba(lead, s.night ? 0.95 : 0.46), base * 0.72);
    stroke(heavy, rgba(lead, s.night ? 1 : 0.68), base * 1.05);
    stroke(soft, rgba(k.lead, s.night ? 0.26 : 0.22), base * 0.6);
  }
  const strongWidth = base * (1.16 + 0.42 * moved);
  stroke(strong, rgba(k.lead), strongWidth);
  // The lit edge along the top of the came.
  c.save();
  c.translate(-0.35, -0.35);
  stroke(strong, rgba(k.leadEdge, s.night ? 0.6 : 0.5), Math.max(0.5, strongWidth * 0.26));
  c.restore();
}

/* The moment it's solved: the light crosses the window once, corner to corner. */
function paintSweep(c, s, side) {
  if (s.win == null) return;
  const length = waveEnd(s.n) + 0.25;
  if (s.win >= length) return;
  const t = s.win / length;
  const at = -0.3 + 1.6 * t;
  const strength = Math.sin(Math.PI * Math.min(1, t * 1.1)) * (s.night ? 0.5 : 0.65);
  const g = c.createLinearGradient(0, 0, side, side);
  // The band's position along the diagonal, with a soft edge either way. A canvas
  // gradient only takes stops inside 0…1, so the ends are held there.
  g.addColorStop(clamp01(at - 0.22), "rgba(255,255,255,0)");
  g.addColorStop(clamp01(at), `rgba(255,255,255,${Math.max(0, strength)})`);
  g.addColorStop(clamp01(at + 0.22), "rgba(255,255,255,0)");
  c.save();
  c.globalCompositeOperation = "lighter";
  c.fillStyle = g;
  c.fillRect(0, 0, side, side);
  c.restore();
}

/* At night what's lit shines past its own edges: drawn sharp here, the page blurs it.
   As in the game's layer, the patches add up among themselves and the layer is then
   laid over the window as it is. */
function paintGlow(c, s) {
  c.globalCompositeOperation = "lighter";
  for (let r = 0; r < s.n; r++) for (let col = 0; col < s.n; col++) {
    const reveal = s.revealed(r, col);
    const [x, y, w, h] = cellRect(r, col, s.cell);
    const fill = s.fillAmount(r, col) * (1 - reveal);
    if (fill > 0) {
      c.fillStyle = rgba(s.p.family.light, 0.26 * fill);
      c.fillRect(x, y, w, h);
    }
    const island = s.p.regions.island[r][col];
    if (reveal > 0 && island != null) {
      c.fillStyle = rgba(jewel(s.p.family, island), 0.3 * reveal);
      c.fillRect(x, y, w, h);
    }
  }
}

/* The frame: lead, in a shallow cut in the stone. The light comes from the top left. */
function paintCasing(c, side, night) {
  const k = ink(night);
  const lead = [-2.2, -2.2, side + 4.4, side + 4.4];
  const cut = [-(CASING - 1), -(CASING - 1), side + 2 * (CASING - 1), side + 2 * (CASING - 1)];
  let g = c.createLinearGradient(cut[0], cut[1], cut[0] + cut[2], cut[1] + cut[3]);
  const cutColours = night ? [0x05070E, 0x262E44] : [0x6F685B, 0xE6DFD0];
  g.addColorStop(0, rgba(cutColours[0]));
  g.addColorStop(1, rgba(cutColours[1]));
  roundRectPath(c, ...cut, 6);
  c.strokeStyle = g;
  c.lineWidth = 2;
  c.stroke();
  roundRectPath(c, ...lead, 4);
  c.strokeStyle = rgba(k.lead);
  c.lineWidth = 4.4;
  c.stroke();
  const edge = [lead[0] - 1.6, lead[1] - 1.6, lead[2] + 3.2, lead[3] + 3.2];
  g = c.createLinearGradient(lead[0], lead[1], lead[0] + lead[2], lead[1] + lead[3]);
  g.addColorStop(0, rgba(k.leadEdge, night ? 0.8 : 0.75));
  g.addColorStop(1, rgba(k.leadEdge, 0.12));
  roundRectPath(c, ...edge, 5);
  c.strokeStyle = g;
  c.lineWidth = 0.7;
  c.stroke();
}

/* Each lit pane throws its colour down the wall, softly, nearest the window for the lowest
   row. Drawn sharp here and blurred by the page. Like the game's layer, the spots add up
   among themselves and the layer is laid over the stone as it is, so the light reads as a
   colour on the wall, as it does on the phone. */
function paintLight(c, s, win, floorTop, floorBottom) {
  if (floorBottom <= floorTop + 20) return;
  c.globalCompositeOperation = "lighter";
  const n = s.n, height = floorBottom - floorTop;
  const bloom = 1 + 0.45 * s.leadMoved;
  const point = (u, v) => {
    const down = 1 - v, spread = 1 + 0.26 * down;
    return [win.x + win.w / 2 + (u - 0.5) * win.w * spread + 12 * down, floorTop + height * down];
  };
  const spot = (r, col, colour, amount) => {
    if (amount <= 0) return;
    const u0 = col / n, u1 = (col + 1) / n, v0 = r / n, v1 = (r + 1) / n;
    const fade = 0.35 + 0.65 * v1; // Further away is fainter.
    c.beginPath();
    c.moveTo(...point(u0, v0));
    c.lineTo(...point(u1, v0));
    c.lineTo(...point(u1, v1));
    c.lineTo(...point(u0, v1));
    c.closePath();
    c.fillStyle = rgba(colour, Math.min(1, amount * fade));
    c.fill();
  };
  const strength = (s.night ? 0.42 : 0.5) * bloom;
  for (let r = 0; r < n; r++) for (let col = 0; col < n; col++) {
    const reveal = s.revealed(r, col);
    const island = s.p.regions.island[r][col];
    if (s.p.solution[r][col] && reveal > 0 && island != null) spot(r, col, jewel(s.p.family, island), strength * reveal);
    const fill = s.fillAmount(r, col) * (1 - reveal);
    if (fill > 0) spot(r, col, s.p.family.main, strength * fill);
  }
}

/* ── 6. The game ───────────────────────────────────────────── */

const FADE_IN = 0.16, FADE_OUT = 0.12, GLINT = 0.32, SETTLE = 0.4;
const LONG_PRESS = 450;
const CHECK_SHOWN = 1050;

const now = () => performance.now() / 1000;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const darkScheme = matchMedia("(prefers-color-scheme: dark)");

/* The page may set its own theme; otherwise the system's. */
function isNight() {
  const forced = document.documentElement.dataset.theme;
  if (forced === "dark") return true;
  if (forced === "light") return false;
  return darkScheme.matches;
}

const state = {
  index: 0,
  marks: [],
  satisfiedRows: [],
  satisfiedCols: [],
  badRows: new Set(),
  badCols: new Set(),
  phase: "playing",            // playing, celebrating, finished
  solvedAt: null,
  mode: "fill",                // fill, dot
  active: { row: null, col: null },
  solved: new Set(),           // which of the five are lit, this visit only
  changes: new Map(),          // PaneAnimator: when each pane last changed
  night: isNight(),
};

let drag = null;               // { from, to, start, moved, locked, visited, pointer }
let debugWin = null;           // a moment of the win, held still, for pictures
let longPressTimer = 0, checkTimer = 0, celebrationTimers = [];

const puzzle = () => puzzles[state.index];

function freshMarks(n) { return Array.from({ length: n }, () => new Array(n).fill(UNKNOWN)); }

function startWindow(index) {
  celebrationTimers.forEach(clearTimeout);
  celebrationTimers = [];
  clearTimeout(checkTimer);
  cancelDrag();
  state.index = index;
  const p = puzzle();
  state.marks = freshMarks(p.n);
  state.satisfiedRows = p.rowClues.map(c => c.length === 0);
  state.satisfiedCols = p.colClues.map(c => c.length === 0);
  state.badRows = new Set();
  state.badCols = new Set();
  state.phase = "playing";
  state.solvedAt = null;
  state.changes = new Map();
  clearTimeout(nudgeTimer);
  if (puzzles[index].level === NUDGE_LEVEL) setTimeout(rescheduleNudge);
}

const boardIsTouched = () => state.marks.some(row => row.some(m => m !== UNKNOWN));

function tapResult(mark, mode = state.mode) {
  if (mode === "fill") return mark === FILLED ? UNKNOWN : FILLED;
  return mark === DOT ? UNKNOWN : DOT;
}

function lineSatisfied(line, clue) { return sameRuns(runLengths(line.map(m => m === FILLED)), clue); }

function refreshSatisfaction(row, col) {
  const p = puzzle();
  state.satisfiedRows[row] = lineSatisfied(state.marks[row], p.rowClues[row]);
  state.satisfiedCols[col] = lineSatisfied(state.marks.map(r => r[col]), p.colClues[col]);
}

function apply(mark, row, col) {
  const old = state.marks[row][col];
  if (old === mark) return;
  state.marks[row][col] = mark;
  // PaneAnimator.note: only lighting or unlighting animates.
  if ((old === FILLED) !== (mark === FILLED)) state.changes.set(row * 16 + col, { at: now(), lit: mark === FILLED });
  refreshSatisfaction(row, col);
  keepAnimating(SETTLE);
  checkWin();
  if (mark === DOT) { nudgeOff = true; clearTimeout(nudgeTimer); } else rescheduleNudge();
  view.update();
}

/* Single entry point for a tap and a drag that paints, like GameModel.dragChanged. */
function dragChanged(row, col, mode) {
  if (state.phase !== "playing" || !drag || drag.locked) return;
  const n = puzzle().n;
  if (row < 0 || row >= n || col < 0 || col >= n) return;
  state.active = { row, col };
  const id = row * 16 + col;
  if (drag.to == null) {
    // Drag start: apply the tap transition and remember it.
    const from = state.marks[row][col];
    drag.from = from;
    drag.to = tapResult(from, mode);
    drag.start = [row, col];
    drag.visited = new Set([id]);
    apply(drag.to, row, col);
    if (mode === state.mode) scheduleLongPress(row, col, from);
  } else {
    if ((row !== drag.start[0] || col !== drag.start[1]) && !drag.moved) {
      drag.moved = true;
      clearTimeout(longPressTimer);
    }
    if (drag.visited.has(id)) { view.update(); return; }
    drag.visited.add(id);
    // Cells that don't match the source state are skipped.
    if (state.marks[row][col] === drag.from) apply(drag.to, row, col);
  }
  view.update();
}

/* Long-press always places or removes a dot, whatever the mode. */
function scheduleLongPress(row, col, original) {
  clearTimeout(longPressTimer);
  longPressTimer = setTimeout(() => {
    if (state.phase !== "playing" || !drag || drag.moved || drag.locked) return;
    drag.locked = true;
    apply(original === DOT ? UNKNOWN : DOT, row, col);
  }, LONG_PRESS);
}

function dragExitedBoard() {
  if (!drag || drag.to == null) return;
  drag.moved = true;
  clearTimeout(longPressTimer);
}

function cancelDrag() {
  state.active = { row: null, col: null };
  clearTimeout(longPressTimer);
  drag = null;
}

/* Flags every line no way of filling can fit any more. Nothing is recorded. */
function check() {
  if (state.phase !== "playing") return;
  const p = puzzle(), n = p.n;
  const rows = new Set(), cols = new Set();
  for (let r = 0; r < n; r++) if (!hasCandidate(p.rowClues[r], state.marks[r])) rows.add(r);
  for (let c = 0; c < n; c++) if (!hasCandidate(p.colClues[c], state.marks.map(row => row[c]))) cols.add(c);
  state.badRows = rows;
  state.badCols = cols;
  view.update(true);
  clearTimeout(checkTimer);
  checkTimer = setTimeout(() => {
    state.badRows = new Set();
    state.badCols = new Set();
    view.update();
  }, CHECK_SHOWN);
}

function clearBoard() {
  if (state.phase !== "playing" || !boardIsTouched()) return;
  cancelDrag();
  clearTimeout(checkTimer);
  const p = puzzle();
  state.marks = freshMarks(p.n);
  state.satisfiedRows = p.rowClues.map(c => c.length === 0);
  state.satisfiedCols = p.colClues.map(c => c.length === 0);
  state.badRows = new Set();
  state.badCols = new Set();
  state.changes = new Map();
  rescheduleNudge();
  view.update();
}

/* Won when the lit panes are exactly the solution's. Notes don't count. */
function checkWin() {
  if (state.phase !== "playing") return;
  const p = puzzle();
  for (let r = 0; r < p.n; r++) for (let c = 0; c < p.n; c++) {
    if ((state.marks[r][c] === FILLED) !== p.solution[r][c]) return;
  }
  // The colours cross the board corner to corner, and the lead moves out with them.
  clearTimeout(longPressTimer);
  clearTimeout(checkTimer);
  if (drag) drag.locked = true;
  state.badRows = new Set();
  state.badCols = new Set();
  state.solvedAt = now();
  state.phase = "celebrating";
  state.solved.add(state.index);
  view.paintMinis();
  const end = waveEnd(p.n);
  keepAnimating(end + 1.4);
  // A moment to look at it before anything asks you to go on.
  celebrationTimers.push(setTimeout(() => {
    if (state.phase !== "celebrating") return;
    state.phase = "finished";
    view.update();
    view.announce(say("glows"));
  }, (end + Math.max(0.7, 1.6 - end)) * 1000));
}

/* The game's only nudge, alive on its level 8 alone (window 2 here): when Note has never
   been used, painting is still the mode, the two columns that give themselves away are done
   and nothing has changed for 7 seconds, Note breathes once; once more after 20 seconds
   more at most; never again once a note has been placed. In memory only. */
const NUDGE_LEVEL = 8;
let nudgeTimer = 0, nudgePulses = 0, nudgeOff = false;

function rescheduleNudge() {
  clearTimeout(nudgeTimer);
  if (puzzle().level !== NUDGE_LEVEL || state.phase !== "playing" || nudgeOff || nudgePulses >= 2) return;
  nudgeTimer = setTimeout(() => {
    if (puzzle().level !== NUDGE_LEVEL || state.phase !== "playing" || state.mode !== "fill" || nudgeOff || nudgePulses >= 2) return;
    if (!(state.satisfiedCols[1] && state.satisfiedCols[2])) return;
    nudgePulses++;
    view.breathe();
    rescheduleNudge();
  }, (nudgePulses === 0 ? 7 : 20) * 1000);
}

function goTo(index) {
  if (index === state.index && state.phase === "playing" && !boardIsTouched()) return;
  view.crossfade(() => startWindow(index));
}

/* PaneAnimator: how lit a pane is right now, and the flash it gives as it's lit. */
function paneFill(r, c, t) {
  const mark = state.marks[r][c];
  const settled = mark === FILLED ? 1 : 0;
  const change = state.changes.get(r * 16 + c);
  if (!change) return settled;
  const age = t - change.at;
  if (change.lit) { const k = Math.min(1, age / FADE_IN); return 1 - (1 - k) * (1 - k); }
  return Math.max(0, 1 - age / FADE_OUT);
}

function paneGlint(r, c, t) {
  const change = state.changes.get(r * 16 + c);
  if (!change || !change.lit) return 0;
  const k = (t - change.at) / GLINT;
  return k < 1 ? (1 - k) * (1 - k) : 0;
}

/* ── 7. The page ───────────────────────────────────────────── */

let animateUntil = 0, frame = 0, visible = true;

function keepAnimating(seconds) {
  animateUntil = Math.max(animateUntil, now() + seconds);
  if (!frame) frame = requestAnimationFrame(tick);
}

function tick() {
  frame = 0;
  if (!visible || document.hidden) return;
  view.paint();
  if (now() < animateUntil) frame = requestAnimationFrame(tick);
}

const el = (tag, cls, parent) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (parent) parent.appendChild(e);
  return e;
};

const view = (() => {
  root.classList.add("vit");
  root.innerHTML = "";
  const stage = el("div", "vit__stage", root);
  const wall = el("canvas", "vit__wall", stage);
  const light = el("canvas", "vit__light", stage);
  const glass = el("canvas", "vit__glass", stage);
  const glow = el("canvas", "vit__glow", stage);
  const casing = el("canvas", "vit__casing", stage);
  [wall, light, glass, glow, casing].forEach(cv => cv.setAttribute("aria-hidden", "true"));
  const clues = el("div", "vit__clues", stage);
  clues.setAttribute("aria-hidden", "true");
  const board = el("div", "vit__board", stage);
  board.tabIndex = 0;
  board.setAttribute("role", "application");

  // The header: clear on the left, the window's name and the five panes, Check.
  const head = el("div", "vit__head", stage);
  const clear = el("button", "vit__round vit__clear", head);
  clear.type = "button";
  clear.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5.2 6.4A6.1 6.1 0 1 1 3.9 10.6"/><path d="M5.6 2.6 5.1 6.6 9 7.2"/></svg>';
  const middle = el("div", "vit__middle", head);
  const title = el("p", "vit__title", middle);
  const panes = el("div", "vit__panes", middle);
  panes.setAttribute("role", "group");
  const paneButtons = puzzles.map((_, i) => {
    const b = el("button", "vit__pane", panes);
    b.type = "button";
    const mini = el("canvas", "vit__mini", b);
    mini.setAttribute("aria-hidden", "true");
    b.addEventListener("click", () => goTo(i));
    return b;
  });
  const checkButton = el("button", "vit__check", head);
  checkButton.type = "button";

  // The bottom: the switch while you work; when it's solved, the way on.
  const foot = el("div", "vit__foot", stage);
  const modes = el("div", "vit__modes", foot);
  modes.setAttribute("role", "group");
  const modeButtons = ["fill", "dot"].map(mode => {
    const b = el("button", "vit__mode vit__mode--" + mode, modes);
    b.type = "button";
    const icon = el("span", "vit__icon", b);
    icon.setAttribute("aria-hidden", "true");
    el("span", "vit__label", b);
    b.addEventListener("click", () => {
      if (state.mode === mode) return;
      state.mode = mode;
      rescheduleNudge();
      update();
    });
    return b;
  });
  const done = el("div", "vit__done", foot);
  const glows = el("p", "vit__glows", done);
  const next = el("button", "vit__next", done);
  next.type = "button";
  const last = el("p", "vit__last", done);
  const live = el("p", "vit__live", stage);
  live.setAttribute("aria-live", "polite");

  clear.addEventListener("click", clearBoard);
  checkButton.addEventListener("click", check);
  next.addEventListener("click", () => { if (state.index < puzzles.length - 1) goTo(state.index + 1); });

  let k = 1, height = 0, dpr = 1, plan = null;
  let rowEls = [], colEls = [];
  let lastNight = null;

  /* Sizes a canvas to a rectangle of the stage, in points, at the screen's own pixels, or
     at fewer for what's blurred anyway (`sharpness` caps the pixels per CSS pixel). */
  function place(cv, x, y, w, h, sharpness = Infinity) {
    cv.style.left = x + "px";
    cv.style.top = y + "px";
    cv.style.width = w + "px";
    cv.style.height = h + "px";
    const scale = k * Math.min(dpr, sharpness);
    cv.width = Math.max(1, Math.round(w * scale));
    cv.height = Math.max(1, Math.round(h * scale));
    cv._box = { x, y, w, h };
  }

  function context(cv) {
    const c = cv.getContext("2d");
    const { x, y, w, h } = cv._box;
    const sx = cv.width / w, sy = cv.height / h;
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = "source-over";
    c.globalAlpha = 1;
    c.clearRect(0, 0, cv.width, cv.height);
    c.setTransform(sx, 0, 0, sy, -x * sx, -y * sy);
    return c;
  }

  function layout() {
    // The layout size, which a transform on the page (a reveal, a hover) doesn't change.
    const width = root.clientWidth, tall = root.clientHeight;
    if (width < 50 || tall < 50) return;
    k = width / PHONE_WIDTH;
    height = tall / k;
    dpr = Math.min(3, window.devicePixelRatio || 1);
    stage.style.width = PHONE_WIDTH + "px";
    stage.style.height = height + "px";
    stage.style.transform = `scale(${k})`;

    const p = puzzle();
    // The island sits over the top 50 pixels of the phone, and a little air at the bottom.
    const insets = { top: 50 / k, left: 0, bottom: 12 / k, right: 0 };
    plan = makePlan(PHONE_WIDTH, height, insets, p.n,
      Math.max(...p.rowClues.map(c => Math.max(1, c.length))),
      Math.max(...p.colClues.map(c => Math.max(1, c.length))));
    const w = plan.window;
    const blurLight = Math.max(14, plan.cell * 0.5);
    const blurGlow = Math.max(3, plan.cell * 0.14);
    stage.style.setProperty("--vit-blur-light", blurLight + "px");
    stage.style.setProperty("--vit-blur-glow", blurGlow + "px");

    place(wall, 0, 0, PHONE_WIDTH, height);
    const lightTop = Math.max(0, w.y + w.h - blurLight * 2);
    place(light, 0, lightTop, PHONE_WIDTH, height - lightTop, 1);
    place(glass, w.x, w.y, w.w, w.h);
    const g = blurGlow * 3;
    place(glow, w.x - g, w.y - g, w.w + 2 * g, w.h + 2 * g, 1.5);
    place(casing, w.x - 10, w.y - 10, w.w + 20, w.h + 20);

    Object.assign(board.style, { left: w.x + "px", top: w.y + "px", width: w.w + "px", height: w.h + "px" });
    const h = plan.header, t = plan.toolbar;
    Object.assign(head.style, { left: h.x + "px", top: h.y + "px", width: h.w + "px", height: h.h + "px" });
    Object.assign(foot.style, { left: t.x + "px", top: t.y + "px", width: t.w + "px", height: t.h + "px" });

    buildClues();
    paintStill();
    update();
    paint();
  }

  /* The numbers, cut into the stone around the window. */
  function buildClues() {
    const p = puzzle();
    clues.innerHTML = "";
    clues.style.fontSize = plan.font + "px";
    rowEls = p.rowClues.map((clue, i) => {
      const line = el("div", "vit__line vit__line--row", clues);
      Object.assign(line.style, {
        left: plan.rowClues.x + "px", top: plan.rowClues.y + i * plan.cell + "px",
        width: plan.rowClues.w + "px", height: plan.cell + "px",
      });
      (clue.length ? clue : [0]).forEach(v => { el("span", "vit__digit", line).textContent = v; });
      if (!clue.length) line.classList.add("is-empty");
      return line;
    });
    colEls = p.colClues.map((clue, i) => {
      const line = el("div", "vit__line vit__line--col", clues);
      Object.assign(line.style, {
        left: plan.colClues.x + i * plan.cell + "px", top: plan.colClues.y + "px",
        width: plan.cell + "px", height: plan.colClues.h + "px",
      });
      (clue.length ? clue : [0]).forEach(v => { el("span", "vit__digit", line).textContent = v; });
      if (!clue.length) line.classList.add("is-empty");
      return line;
    });
    markClues();
  }

  /* What only changes with the size or the time of day: the wall and the frame. */
  function paintStill() {
    paintWall(context(wall), PHONE_WIDTH, height, state.night);
    const c = context(casing);
    c.translate(plan.window.x, plan.window.y);
    paintCasing(c, plan.window.w, state.night);
    paintMinis();
  }

  /* The five little panes: clear glass until you light it, then its finished window. */
  function paintMinis() {
    paneButtons.forEach((b, i) => {
      const cv = b.firstChild;
      const side = 13;
      const scale = k * dpr;
      cv.width = Math.round(side * scale);
      cv.height = Math.round(side * scale);
      const c = cv.getContext("2d");
      c.setTransform(scale, 0, 0, scale, 0, 0);
      const p = puzzles[i];
      if (state.solved.has(i)) {
        const cell = side / p.n;
        for (let r = 0; r < p.n; r++) for (let col = 0; col < p.n; col++) {
          const island = p.regions.island[r][col];
          c.fillStyle = rgba(island != null ? jewel(p.family, island) : field(p.family, p.regions.field[r][col] ?? 0, state.night));
          c.fillRect(col * cell - 0.2, r * cell - 0.2, cell + 0.4, cell + 0.4);
        }
      } else {
        const g = c.createLinearGradient(0, 0, side * 0.5, side);
        (state.night ? [0x202A40, 0x171E31, 0x121829] : [0xE3EDF0, 0xF1F3EC, 0xF8F3E2])
          .forEach((hex, j) => g.addColorStop(j / 2, rgba(hex)));
        c.fillStyle = g;
        c.fillRect(0, 0, side, side);
      }
    });
  }

  function scene(t) {
    const p = puzzle();
    const settled = reduceMotion.matches ? 60 : 0;
    return new Scene(
      p, state.marks, state.night, plan.cell,
      (r, c) => paneFill(r, c, t),
      (r, c) => paneGlint(r, c, t),
      state.active,
      { rows: state.badRows, cols: state.badCols },
      debugWin != null ? debugWin : state.solvedAt == null ? null : t - state.solvedAt + settled);
  }

  /* One frame: the light on the wall, the glass, the glow. */
  function paint() {
    if (!plan) return;
    const t = now();
    const s = scene(t);
    const w = plan.window;
    paintLight(context(light), s, w, w.y + w.h + CASING, height);
    const c = context(glass);
    c.translate(w.x, w.y);
    paintGlass(c, s);
    const g = context(glow);
    if (state.night) {
      g.translate(w.x, w.y);
      paintGlow(g, s);
    }
  }

  /* Everything that isn't drawn: words, states, what can be pressed. */
  function update(pulse = false) {
    if (!plan) return;
    markClues(pulse);
    const p = puzzle();
    const playing = state.phase === "playing";
    root.classList.toggle("is-night", state.night);
    stage.classList.toggle("is-playing", playing);
    stage.classList.toggle("is-finished", state.phase === "finished");
    stage.classList.toggle("is-last", state.index === puzzles.length - 1);
    stage.classList.toggle("is-reduced", reduceMotion.matches);

    title.textContent = say("title", { n: state.index + 1 });
    fitTitle();
    panes.setAttribute("aria-label", say("panes"));
    paneButtons.forEach((b, i) => {
      b.classList.toggle("is-current", i === state.index);
      b.classList.toggle("is-lit", state.solved.has(i));
      b.setAttribute("aria-label", say(state.solved.has(i) ? "paneDone" : "pane", { n: i + 1 }));
      if (i === state.index) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current");
    });

    clear.setAttribute("aria-label", say("clear"));
    clear.disabled = !playing || !boardIsTouched();
    clear.classList.toggle("is-idle", !boardIsTouched());
    checkButton.textContent = say("check");
    checkButton.disabled = !playing;

    modes.setAttribute("aria-label", say("modes"));
    modeButtons.forEach(b => {
      const mode = b.classList.contains("vit__mode--fill") ? "fill" : "dot";
      b.querySelector(".vit__label").textContent = say(mode === "fill" ? "paint" : "note");
      b.classList.toggle("is-selected", state.mode === mode);
      b.setAttribute("aria-pressed", String(state.mode === mode));
      b.disabled = !playing;
    });
    modes.style.setProperty("--vit-paint", rgba(p.family.main));

    glows.textContent = say("glows");
    next.textContent = say("next", { n: state.index + 2 });
    last.textContent = say("last");
    next.hidden = state.index === puzzles.length - 1;
    last.hidden = state.index !== puzzles.length - 1;
    next.tabIndex = state.phase === "finished" ? 0 : -1;

    board.setAttribute("aria-label", say("board", { n: state.index + 1, size: p.n }));

    if (!frame) frame = requestAnimationFrame(tick);
  }

  /* The numbers: dim once their line is right, red for a moment when Check finds it wrong.
     Before anything reads the layout, so new numbers start in their colour, not fading to it. */
  function markClues(pulse = false) {
    const p = puzzle();
    const mark = (line, satisfied, wrong, active, empty) => {
      line.classList.toggle("is-done", satisfied || empty);
      line.classList.toggle("is-active", active);
      if (wrong && pulse) {
        line.classList.remove("is-wrong");
        void line.offsetWidth;
      }
      line.classList.toggle("is-wrong", wrong);
    };
    rowEls.forEach((line, i) => mark(line, state.satisfiedRows[i], state.badRows.has(i), state.active.row === i, !p.rowClues[i].length));
    colEls.forEach((line, i) => mark(line, state.satisfiedCols[i], state.badCols.has(i), state.active.col === i, !p.colClues[i].length));
  }

  /* The title is one line between the buttons: if it doesn't fit, it shrinks, down to 70 %. */
  function fitTitle() {
    const side = Math.max(clear.offsetWidth, checkButton.offsetWidth);
    const room = Math.max(60, head.clientWidth - 2 * side - 8);
    middle.style.width = room + "px";
    title.style.fontSize = "";
    const natural = title.scrollWidth;
    if (natural > room) title.style.fontSize = Math.max(0.7, room / natural) * 18 + "px";
  }

  /* The next window replaces this one with a soft cut, not a jump. */
  let fading = false;
  function crossfade(swap) {
    if (fading) return;
    const parts = [light, glass, glow, casing, clues];
    if (reduceMotion.matches) {
      swap();
      afterSwap();
      return;
    }
    fading = true;
    parts.forEach(p => p.classList.add("is-hidden"));
    setTimeout(() => {
      swap();
      afterSwap();
      requestAnimationFrame(() => {
        parts.forEach(p => p.classList.remove("is-hidden"));
        fading = false;
      });
    }, 160);
  }

  function afterSwap() {
    layout();
    live.textContent = say("title", { n: state.index + 1 });
  }

  function announce(words) { live.textContent = words; }

  /* The Note segment breathes once: GameModel's nudge, on the game's level 8. */
  function breathe() {
    const dot = modeButtons[1];
    if (reduceMotion.matches || !dot.animate) return;
    dot.animate(
      [{ transform: "scale(1)", opacity: 1 }, { transform: "scale(1.1)", opacity: 0.72 }, { transform: "scale(1)", opacity: 1 }],
      { duration: 900, easing: "ease-in-out" });
  }

  function setNight() {
    const night = isNight();
    if (night === lastNight && plan) return;
    lastNight = night;
    state.night = night;
    if (plan) { paintStill(); update(); paint(); }
  }

  return { layout, update, paint, crossfade, setNight, announce, breathe, board, root, paintMinis, get plan() { return plan; } };
})();

/* ── Input ─────────────────────────────────────────────────── */

const board = view.board;

function cellAt(e) {
  const box = board.getBoundingClientRect();
  const n = puzzle().n;
  return {
    row: Math.floor((e.clientY - box.top) / box.height * n),
    col: Math.floor((e.clientX - box.left) / box.width * n),
  };
}

board.addEventListener("pointerdown", e => {
  if (state.phase !== "playing") return;
  if (e.pointerType === "mouse" && e.button !== 0 && e.button !== 2) return;
  e.preventDefault();
  try { board.setPointerCapture(e.pointerId); } catch {}
  // A right click is the mouse's long-press: a note, whatever the mode.
  const mode = e.button === 2 ? "dot" : state.mode;
  drag = { from: null, to: null, start: null, moved: false, locked: false, visited: new Set(), pointer: e.pointerId, mode };
  const { row, col } = cellAt(e);
  dragChanged(row, col, mode);
});

board.addEventListener("pointermove", e => {
  if (!drag || drag.pointer !== e.pointerId) return;
  const { row, col } = cellAt(e);
  const n = puzzle().n;
  if (row >= 0 && row < n && col >= 0 && col < n) dragChanged(row, col, drag.mode);
  else dragExitedBoard();
});

const endDrag = e => {
  if (!drag || drag.pointer !== e.pointerId) return;
  cancelDrag();
  view.update();
};
board.addEventListener("pointerup", endDrag);
board.addEventListener("pointercancel", endDrag);
board.addEventListener("lostpointercapture", endDrag);
board.addEventListener("contextmenu", e => e.preventDefault());

/* The keyboard: arrows move, Space or Enter is a tap, N switches Paint and Note. */
let cursor = { row: 0, col: 0 }, keyboard = false;
board.addEventListener("keydown", e => {
  if (state.phase !== "playing") return;
  const n = puzzle().n;
  const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
  if (moves[e.key]) {
    const [dr, dc] = moves[e.key];
    cursor = { row: (cursor.row + dr + n) % n, col: (cursor.col + dc + n) % n };
  } else if (e.key === " " || e.key === "Enter") {
    apply(tapResult(state.marks[cursor.row][cursor.col]), cursor.row, cursor.col);
  } else if (e.key === "n" || e.key === "N") {
    state.mode = state.mode === "fill" ? "dot" : "fill";
    rescheduleNudge();
  } else {
    return;
  }
  e.preventDefault();
  keyboard = true;
  state.active = { ...cursor };
  view.update();
});
board.addEventListener("focus", () => {
  if (!board.matches(":focus-visible")) return;
  keyboard = true;
  state.active = { ...cursor };
  view.update();
});
board.addEventListener("blur", () => {
  if (!keyboard) return;
  keyboard = false;
  state.active = { row: null, col: null };
  view.update();
});

/* ── Go ────────────────────────────────────────────────────── */

startWindow(0);
new ResizeObserver(() => view.layout()).observe(root);
view.layout();

document.addEventListener("langchange", () => view.update());
darkScheme.addEventListener?.("change", () => view.setNight());
new MutationObserver(() => view.setNight()).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
reduceMotion.addEventListener?.("change", () => { view.update(); view.paint(); });

new IntersectionObserver(entries => {
  visible = entries.some(e => e.isIntersecting);
  if (visible) { view.paint(); if (now() < animateUntil && !frame) frame = requestAnimationFrame(tick); }
}).observe(root);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && now() < animateUntil && !frame) frame = requestAnimationFrame(tick);
});

/* For checking it without hands. */
window.__vitrall = {
  solve() {
    const p = puzzle();
    state.marks = p.solution.map(row => row.map(f => (f ? FILLED : UNKNOWN)));
    for (let r = 0; r < p.n; r++) for (let c = 0; c < p.n; c++) refreshSatisfaction(r, c);
    checkWin();
    view.update();
  },
  go(i) { startWindow(i); view.layout(); },
  pose(marks, active) {
    // marks: rows of ".", "#" and "x" (unknown, lit, note).
    state.marks = marks.map(row => [...row].map(ch => (ch === "#" ? FILLED : ch === "x" ? DOT : UNKNOWN)));
    const p = puzzle();
    for (let r = 0; r < p.n; r++) for (let c = 0; c < p.n; c++) refreshSatisfaction(r, c);
    state.active = active || { row: null, col: null };
    view.update();
    view.paint();
  },
  check,
  nudges: () => nudgePulses,
  /* Where a pane is on the page, for driving it with real input. */
  cellPoint(r, c) {
    const box = board.getBoundingClientRect(), n = puzzle().n;
    return { x: box.left + (c + 0.5) * box.width / n, y: box.top + (r + 0.5) * box.height / n };
  },
  /* Holds the drawing at a moment of the win, in seconds; null lets it run. */
  win(seconds) { debugWin = seconds; view.paint(); },
  state,
};
})();
