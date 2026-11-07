/* ===========================================================
   Confitura · the jar comes alive
   The Confitura screenshot, with a face now and then: a fruit opens
   its eyes and glances at the one waiting at the spout or at a
   neighbour, two of a kind look at each other, someone yawns. Nothing
   to click, nothing counted.

   The game draws the frames (Games/Confitura, WebStillDirector,
   launched with -ConfituraWebStill): the screen as the game shows it
   (confitura-dia.jpg, confitura-nit.jpg), the very same frame with the
   jar's fruits bare, without face or light (confitura-*-bare.jpg), and
   where every fruit is (SCENES below, in the game's screen points).
   This only paints the face that's being pulled: a patch of the bare
   frame over that fruit's face, then FruitArt.paintExpression and
   FruitArt.paintLight, ported line by line. When nobody is pulling a
   face the canvas is empty and what you see is the real screenshot.

   Hook: an element with data-confitura-faces holding the <picture>
   (its <img> is object-fit: cover, object-position: 50% 0).
   =========================================================== */

(() => {
"use strict";

const TAU = Math.PI * 2;
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

/* ── The two jars, from the game ──────────────────────────────
   Screen points of a 402 × 874 iPhone (the images are that at
   600 px wide). A fruit: [kind, x, y, radius, rolled angle, onTop,
   still]. onTop and still are FaceDirector's: at rest inside the jar,
   and with nothing resting on it. gaze is where JarScene has a face
   look when it looks at the spout. */
const POINTS = [402, 874];
const SCENES = {
  dia: {"fruits":[[2,59.8,771.37,24.4,-0.3767,0,1],[3,278.28,764.26,31.51,7.1574,0,1],[1,46.49,732.29,18.3,-0.0006,0,1],[0,279.38,718.91,14.23,-1.2892,0,1],[4,333.14,717.72,40.66,1.1086,0,1],[8,161.94,688.02,107.75,-0.2655,0,1],[1,355.51,663.25,18.3,11.9381,1,1],[6,306.71,590.26,67.09,0.2036,0,1],[1,222.58,577.87,18.3,-0.0097,0,1],[0,145.28,567.63,14.23,-9.4986,0,1],[5,81.05,549.29,52.86,-0.4972,1,1],[5,187.77,516.03,52.86,-0.4736,1,1],[4,333.14,485.83,40.66,0.025,1,1]],"spout":[2,332.13,276.56,24.4],"gaze":[332.13,277.36]},
  nit: {"fruits":[[1,46.49,777.47,18.3,-5.3422,0,1],[3,339.87,764.26,31.51,0.2491,0,1],[4,268.29,755.11,40.66,-0.1872,0,1],[1,306.81,710.54,18.3,14.4214,0,1],[2,349.41,709.21,24.4,7.1668,1,1],[8,135.95,688.02,107.75,-0.2001,0,1],[0,42.43,609.79,14.23,-7.7439,1,1],[1,184.84,572.02,18.3,7.7495,0,1],[7,288.42,569.78,85.38,0,0,1],[2,186.36,529.44,24.4,5.4831,0,1],[6,95.29,518.03,67.09,-0.2066,1,1],[5,320.95,435.47,52.86,3.5394,0,1],[2,349.41,363.7,24.4,0.0417,1,1]],"spout":[0,47.51,276.16,14.23],"gaze":[47.51,277.36]},
};

/* FruitArt's palettes, as far as a face needs them: how big the face
   is against the fruit, the ink, the cheeks, the light halo under the
   ink, and the gloss of the skin (for the light). Blueberry to
   watermelon. */
const PALETTES = [
  { face: 1,    ink: 0x141A3A, blush: 0xF2A6C8, halo: 0.3,  gloss: 0.3  }, // blueberry
  { face: 1,    ink: 0x4A0F22, blush: 0xFFD0DC, halo: 0.2,  gloss: 0.35 }, // raspberry
  { face: 1,    ink: 0x3A0710, blush: 0xFF9FAE, halo: 0.3,  gloss: 1    }, // cherry
  { face: 0.95, ink: 0x571114, blush: 0xFFC9C2, halo: 0.2,  gloss: 0.6  }, // strawberry
  { face: 0.9,  ink: 0x23102F, blush: 0xF4A3CB, halo: 0.3,  gloss: 0.4  }, // plum
  { face: 0.85, ink: 0x6A2B1C, blush: 0xFF7F7F, halo: 0.07, gloss: 0.12 }, // peach
  { face: 0.75, ink: 0x6B3407, blush: 0xFF8C6E, halo: 0.12, gloss: 0.4  }, // orange
  { face: 0.68, ink: 0x3A0810, blush: 0xFF9BAA, halo: 0.3,  gloss: 0.75 }, // pomegranate
  { face: 0.6,  ink: 0x6B4E05, blush: 0xFF9C7A, halo: 0.07, gloss: 0.45 }, // melon
  { face: 0.55, ink: 0x0F2D14, blush: 0xFFAAA8, halo: 0.3,  gloss: 0.55 }, // watermelon
];

const rgba = (hex, a) => `rgba(${(hex >> 16) & 255},${(hex >> 8) & 255},${hex & 255},${a})`;
const WHITE = 0xFFFFFF;

/* ── FruitArt, ported ─────────────────────────────────────────
   Everything below draws around the fruit's centre in screen points,
   like the game: the face in the body's rolled frame, the light
   upright (the window doesn't move). */

/* An ellipse in a rect, as a subpath of its own (SwiftUI's
   addEllipse(in:)): moving there first keeps it from joining the
   previous one. */
function ellipseIn(path, x, y, w, h) {
  path.moveTo(x + w, y + h / 2);
  path.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, TAU);
  path.closePath();
}

/* The house face: closed eyes, half a smile, warm cheeks. Only used to
   prove that the patches sit exactly where the game put the faces. */
function paintHouseFace(c, kind, r) {
  const p = PALETTES[kind];
  const f = r * p.face;
  const line = Math.max(f * 0.065, 0.8);
  const cy = r * 0.10;
  const features = new Path2D();
  for (const side of [-1, 1]) {
    const ex = side * f * 0.30;
    const ey = cy - f * 0.08;
    features.moveTo(ex - f * 0.11, ey);
    features.quadraticCurveTo(ex, ey + f * 0.11, ex + f * 0.11, ey);
    const cheek = new Path2D();
    ellipseIn(cheek, side * f * 0.47 - f * 0.10, cy + f * 0.04, f * 0.20, f * 0.12);
    c.fillStyle = rgba(p.blush, 0.55);
    c.fill(cheek);
  }
  features.moveTo(-f * 0.13, cy + f * 0.14);
  features.quadraticCurveTo(0, cy + f * 0.28, f * 0.13, cy + f * 0.14);
  c.lineCap = "round";
  c.lineJoin = "miter";
  c.strokeStyle = rgba(WHITE, p.halo);
  c.lineWidth = line * 2.4;
  c.stroke(features);
  c.strokeStyle = rgba(p.ink, 0.85);
  c.lineWidth = line;
  c.stroke(features);
}

/* FruitArt.paintExpression, for the faces a still jar can pull:
   glancing (eyes open for a moment, with a blink in the middle of a
   long look) and yawning. `age` is the seconds since it started;
   `gaze`, where it looks, as a unit vector in the body's rolled frame.
   Small fruits pull theirs a little bigger, so they still read. */
function paintExpression(c, expression, kind, r, age, duration, gaze) {
  const p = PALETTES[kind];
  const f = r * p.face * (1 + Math.max(0, (34 - r) / 70));
  const line = Math.max(f * 0.065, 0.8);
  const cy = r * 0.10;
  const ey = cy - f * 0.08;
  const ink = new Path2D();
  const fills = new Path2D();
  let anyFills = false;
  const blush = 0.55;

  if (expression === "glance") {
    const fade = 0.09;
    let open = Math.min(1, age / fade, (duration - age) / fade);
    if (Math.abs(age - duration * 0.5) < 0.06) open = 0.1;
    for (const side of [-1, 1]) {
      const ex = side * f * 0.30;
      if (open < 0.25) {
        ink.moveTo(ex - f * 0.11, ey);
        ink.quadraticCurveTo(ex, ey + f * 0.11, ex + f * 0.11, ey);
        continue;
      }
      const x = ex + gaze.dx * f * 0.045;
      const y = ey - f * 0.01 + gaze.dy * f * 0.045;
      const h = f * 0.23 * open;
      ellipseIn(fills, x - f * 0.085, y - h / 2, f * 0.17, h);
      anyFills = true;
    }
    if (gaze.dy < -0.3) {
      // Looking up at something coming: a small «o».
      ellipseIn(ink, -f * 0.045, cy + f * 0.16, f * 0.09, f * 0.09);
    } else {
      ink.moveTo(-f * 0.09, cy + f * 0.15);
      ink.quadraticCurveTo(0, cy + f * 0.25, f * 0.09, cy + f * 0.15);
    }
  } else if (expression === "yawn") {
    // Sleepy shut eyes, a little lower and flatter than the house's.
    for (const side of [-1, 1]) {
      const ex = side * f * 0.30;
      ink.moveTo(ex - f * 0.11, ey + f * 0.02);
      ink.quadraticCurveTo(ex, ey + f * 0.08, ex + f * 0.11, ey + f * 0.02);
    }
  }

  for (const side of [-1, 1]) {
    const cheek = new Path2D();
    ellipseIn(cheek, side * f * 0.47 - f * 0.11, cy + f * 0.03, f * 0.22, f * 0.13);
    c.fillStyle = rgba(p.blush, blush);
    c.fill(cheek);
  }

  if (expression === "yawn") {
    // The mouth opens slowly into an O and closes again.
    const open = Math.pow(Math.sin(Math.PI * clamp(age / duration, 0, 1)), 0.7);
    const h = f * (0.06 + 0.26 * open);
    const mouth = new Path2D();
    ellipseIn(mouth, -f * (0.07 + 0.04 * open), cy + f * 0.16, f * (0.14 + 0.08 * open), h);
    c.fillStyle = rgba(WHITE, p.halo * 1.6);
    c.fill(mouth);
    c.fillStyle = rgba(p.ink, 0.85);
    c.fill(mouth);
    c.save();
    c.clip(mouth);
    const tongue = new Path2D();
    ellipseIn(tongue, -f * 0.07, cy + f * 0.16 + h * 0.55, f * 0.14, h * 0.6);
    c.fillStyle = rgba(0xF08A8A, 1);
    c.fill(tongue);
    c.restore();
  }

  c.lineCap = "round";
  c.lineJoin = "round";
  c.strokeStyle = rgba(WHITE, p.halo);
  c.lineWidth = line * 2.4;
  c.stroke(ink);
  if (anyFills) {
    c.fillStyle = rgba(WHITE, p.halo);
    c.fill(fills);
  }
  c.strokeStyle = rgba(p.ink, 0.85);
  c.lineWidth = line * 1.1;
  c.stroke(ink);
  if (anyFills) {
    c.fillStyle = rgba(p.ink, 0.9);
    c.fill(fills);
  }
  // Glints in open eyes, so they look alive.
  if (expression === "glance" && Math.min(age, duration - age) > 0.09) {
    for (const side of [-1, 1]) {
      const ex = side * f * 0.30 + gaze.dx * f * 0.045;
      const gy = ey - f * 0.01 + gaze.dy * f * 0.045;
      c.beginPath();
      c.arc(ex - f * 0.025, gy - f * 0.045, f * 0.032, 0, TAU);
      c.fillStyle = rgba(WHITE, 0.9);
      c.fill();
    }
  }
}

/* FruitArt.paintLight: a form shadow, a broad glow, a bounce off the
   glass and, on shiny skins, a sharp highlight. At night the window
   is a lamp: warmer light, deeper shade. */
function paintLight(c, kind, r, night) {
  const gloss = PALETTES[kind].gloss;
  const disc = new Path2D();
  disc.arc(0, 0, r, 0, TAU);
  c.save();
  c.clip(disc);
  let g = c.createRadialGradient(-r * 0.32, -r * 0.38, 0, -r * 0.32, -r * 0.38, r * 1.65);
  g.addColorStop(0.42, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(0,0,0,${night ? 0.36 : 0.26})`);
  c.fillStyle = g;
  c.fill(disc);
  const glow = night ? 0xFFD9A0 : 0xFFF6E0;
  g = c.createRadialGradient(-r * 0.36, -r * 0.44, 0, -r * 0.36, -r * 0.44, r * 0.95);
  g.addColorStop(0, rgba(glow, night ? 0.30 : 0.34));
  g.addColorStop(1, rgba(glow, 0));
  c.fillStyle = g;
  c.fill(disc);
  c.beginPath();
  c.arc(0, 0, r * 0.86, 18 * Math.PI / 180, 78 * Math.PI / 180, false);
  c.strokeStyle = rgba(WHITE, night ? 0.07 : 0.12);
  c.lineWidth = r * 0.09;
  c.lineCap = "round";
  c.stroke();
  if (gloss > 0) {
    c.translate(-r * 0.40, -r * 0.46);
    c.rotate(-35 * Math.PI / 180);
    const spot = new Path2D();
    ellipseIn(spot, -r * 0.24, -r * 0.13, r * 0.48, r * 0.26);
    g = c.createRadialGradient(0, 0, 0, 0, 0, r * 0.25);
    g.addColorStop(0, rgba(WHITE, 0.80 * gloss));
    g.addColorStop(1, rgba(WHITE, 0));
    c.fillStyle = g;
    c.fill(spot);
    c.beginPath();
    c.arc(-r * 0.04, -r * 0.01, r * 0.05, 0, TAU);
    c.fillStyle = rgba(WHITE, 0.9 * gloss);
    c.fill();
  }
  c.restore();
}

/* ── The page ─────────────────────────────────────────────── */

const host = document.querySelector("[data-confitura-faces]");
const img = host && host.querySelector("img");
if (!host || !img || !window.CanvasRenderingContext2D) return;

/* Where the bare frames are: next to the screenshot the page shows, or
   failing that next to this script. */
const scriptBase = (document.currentScript && document.currentScript.src || "").replace(/[^/]*$/, "");
function bareURL(name) {
  const shown = img.currentSrc || img.src || "";
  const m = shown.match(/^(.*)confitura-(dia|nit)\.jpg(\?.*)?$/);
  return m ? `${m[1]}confitura-${name}-bare.jpg` : `${scriptBase}confitura-${name}-bare.jpg`;
}

const canvas = document.createElement("canvas");
canvas.setAttribute("aria-hidden", "true");
canvas.className = "confi-faces";
canvas.style.cssText = "position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;";
if (getComputedStyle(host).position === "static") host.style.position = "relative";
host.appendChild(canvas);
const ctx = canvas.getContext("2d");

const reduce = matchMedia("(prefers-reduced-motion: reduce)");
const bare = {};          // name → loaded Image
let sceneName = "dia";
let map = null;           // screen points → CSS px of the host
let dpr = 1;
let near = false;         // close enough to load the bare frame
let seen = false;         // on screen now
let moments = [];         // faces being pulled
let nextAt = null;        // seconds (performance clock) of the next face
let lastFruit = -1, lastType = "";
let frame = 0, timer = 0;
let proof = false;        // every house face, painted here: the alignment check
let frozen = null;        // a fixed clock, for screenshots…
let posed = [];           // …and the faces held at it

const now = () => frozen ?? performance.now() / 1000;

function currentScene() {
  const shown = img.currentSrc || img.src || "";
  return /confitura-nit/.test(shown) ? "nit" : "dia";
}

/* The <img> is object-fit: cover; object-position: 50% 0 (or whatever
   the stylesheet says): the same mapping, for the bare frame and the
   faces. */
function measure() {
  const w = host.clientWidth, h = host.clientHeight;
  if (!w || !h) { map = null; return; }
  const iw = img.naturalWidth || 600, ih = img.naturalHeight || 1304;
  const style = getComputedStyle(img);
  const fit = style.objectFit || "fill";
  let kx = w / iw, ky = h / ih;
  if (fit === "cover") kx = ky = Math.max(w / iw, h / ih);
  else if (fit === "contain") kx = ky = Math.min(w / iw, h / ih);
  const dw = iw * kx, dh = ih * ky;
  const pos = (style.objectPosition || "50% 50%").split(/\s+/);
  const along = (v, room) => v.endsWith("%") ? room * parseFloat(v) / 100 : parseFloat(v) || 0;
  const ox = along(pos[0] || "50%", w - dw);
  const oy = along(pos[1] || "50%", h - dh);
  dpr = Math.min(window.devicePixelRatio || 1, 3);
  map = { w, h, iw, ih, ox, oy, dw, dh, kx, ky, u: (iw / POINTS[0]) * kx };
  const cw = Math.round(w * dpr), ch = Math.round(h * dpr);
  if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
}

function loadBare(name) {
  if (bare[name] || bare[name] === null) return;
  bare[name] = null;
  const image = new Image();
  image.decoding = "async";
  image.onload = () => { bare[name] = image; schedule(); };
  image.onerror = () => { bare[name] = undefined; };
  image.src = bareURL(name);
}

function fruitsOf(name) {
  return SCENES[name].fruits.map(([kind, x, y, r, angle, onTop, still], i) =>
    ({ i, kind, x, y, r, angle, onTop: !!onTop, still: !!still }));
}

/* Where a face looks, as a unit vector in the fruit's own rolled frame
   (JarScene.gaze). */
function gazeOf(fruit, target) {
  const dx = target[0] - fruit.x, dy = target[1] - fruit.y;
  const length = Math.max(Math.hypot(dx, dy), 0.001);
  const ux = dx / length, uy = dy / length;
  const a = fruit.angle;
  return { dx: ux * Math.cos(a) + uy * Math.sin(a), dy: -ux * Math.sin(a) + uy * Math.cos(a) };
}

/* One fruit's face: a patch of the bare frame where the house face is,
   the face being pulled, and the fruit's light back on top, all inside
   the fruit's circle. */
function paintPatch(fruit, paintFace) {
  const m = map, img2 = bare[sceneName];
  if (!m || !img2) return;
  const cx = m.ox + fruit.x * m.u, cy = m.oy + fruit.y * m.u;
  const r = fruit.r;
  const p = PALETTES[fruit.kind];
  const f = r * p.face * (1 + Math.max(0, (34 - r) / 70));
  ctx.save();
  ctx.setTransform(dpr * m.u, 0, 0, dpr * m.u, dpr * cx, dpr * cy);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.clip();
  ctx.rotate(fruit.angle);
  ctx.beginPath();
  ctx.ellipse(0, r * 0.10 + f * 0.1, f * 0.74, f * 0.52, 0, 0, TAU);
  ctx.clip();
  // The bare frame, only the square around this fruit.
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const sx = clamp((fruit.x - r) * (m.iw / POINTS[0]), 0, m.iw), sy = clamp((fruit.y - r) * (m.iw / POINTS[0]), 0, m.ih);
  const side = 2 * r * (m.iw / POINTS[0]);
  const sw = Math.min(side, m.iw - sx), sh = Math.min(side, m.ih - sy);
  ctx.drawImage(img2, sx, sy, sw, sh, m.ox + sx * m.kx, m.oy + sy * m.ky, sw * m.kx, sh * m.ky);
  ctx.setTransform(dpr * m.u, 0, 0, dpr * m.u, dpr * cx, dpr * cy);
  ctx.rotate(fruit.angle);
  paintFace(ctx, r);
  ctx.rotate(-fruit.angle);
  paintLight(ctx, fruit.kind, r, sceneName === "nit");
  ctx.restore();
}

function draw() {
  frame = 0;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!map || !bare[sceneName]) return false;
  const fruits = fruitsOf(sceneName);
  if (proof) {
    for (const fruit of fruits) paintPatch(fruit, (c, r) => paintHouseFace(c, fruit.kind, r));
    return false;
  }
  const t = now();
  if (frozen != null) {
    for (const mo of posed) {
      const fruit = fruits[mo.fruit], age = t - mo.start;
      if (age < 0 || age >= mo.duration) continue;
      const gaze = mo.target ? gazeOf(fruit, mo.target) : { dx: 0, dy: 0 };
      paintPatch(fruit, c => paintExpression(c, mo.type, fruit.kind, fruit.r, age, mo.duration, gaze));
    }
    return false;
  }
  moments = moments.filter(mo => t < mo.start + mo.duration);
  let live = false;
  for (const mo of moments) {
    const age = t - mo.start;
    if (age < 0) { live = true; continue; }
    const fruit = fruits[mo.fruit];
    const gaze = mo.target ? gazeOf(fruit, mo.target) : { dx: 0, dy: 0 };
    paintPatch(fruit, c => paintExpression(c, mo.type, fruit.kind, fruit.r, age, mo.duration, gaze));
    live = true;
  }
  return live || moments.length > 0;
}

function loop() {
  if (draw() && running() && frozen == null) frame = requestAnimationFrame(loop);
  else schedule();
}

/* ── Who pulls a face, and when ───────────────────────────────
   Faces.swift, for a jar nobody is dropping anything into: one face
   at a time and a quiet spell after it; glances at the fruit waiting
   at the spout or at a neighbour, two of a kind looking at each other
   (the second a moment after the first), and yawns. Never the same
   fruit twice in a row. */
const GLANCE = 1.9, PAIR = 2.6, PAIR_LAG = 0.7, YAWN = 2.0;

function pick(list, weight = () => 1) {
  const total = list.reduce((s, x) => s + weight(x), 0);
  let roll = Math.random() * total;
  for (const x of list) { roll -= weight(x); if (roll < 0) return x; }
  return list[list.length - 1];
}

/* The two closest of a kind, at rest and apart; the small ones only if
   there's nothing else, because their faces are hard to see. */
function twins(fruits) {
  let best = null;
  for (let i = 0; i < fruits.length; i++) {
    for (let j = i + 1; j < fruits.length; j++) {
      const a = fruits[i], b = fruits[j];
      if (a.kind !== b.kind || !a.still || !b.still || (!a.onTop && !b.onTop)) continue;
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d <= a.r + b.r + 2) continue;
      const score = d - a.kind * 60;
      if (!best || score < best.score) best = { a, b, score };
    }
  }
  return best;
}

function nextMoment(start) {
  const scene = SCENES[sceneName];
  const fruits = fruitsOf(sceneName);
  const tops = fruits.filter(f => f.onTop && f.i !== lastFruit);
  const pair = twins(fruits);
  const options = [];
  if (pair && lastType !== "pair" && pair.a.i !== lastFruit && pair.b.i !== lastFruit) options.push(["pair", lastType === "" ? 100 : 2]);
  if (tops.length) {
    options.push(["spout", 3]);
    options.push(["neighbour", 2]);
    if (lastType !== "yawn") options.push(["yawn", 2.5]);
  }
  if (!options.length) return [];
  const type = pick(options, o => o[1])[0];
  // Bigger faces read better: they get picked more.
  const who = () => pick(tops, f => Math.sqrt(f.r));
  if (type === "pair") {
    const [a, b] = Math.random() < 0.5 ? [pair.a, pair.b] : [pair.b, pair.a];
    lastFruit = b.i; lastType = "pair";
    return [
      { fruit: a.i, type: "glance", start, duration: PAIR, target: [b.x, b.y] },
      { fruit: b.i, type: "glance", start: start + PAIR_LAG, duration: PAIR - PAIR_LAG + 0.3, target: [a.x, a.y] },
    ];
  }
  const fruit = who();
  lastFruit = fruit.i; lastType = type;
  if (type === "yawn") return [{ fruit: fruit.i, type: "yawn", start, duration: YAWN }];
  if (type === "spout") return [{ fruit: fruit.i, type: "glance", start, duration: GLANCE, target: scene.gaze }];
  // A neighbour: one of the three nearest.
  const others = fruits.filter(f => f.i !== fruit.i)
    .sort((p, q) => Math.hypot(p.x - fruit.x, p.y - fruit.y) - Math.hypot(q.x - fruit.x, q.y - fruit.y))
    .slice(0, 3);
  const other = pick(others);
  return [{ fruit: fruit.i, type: "glance", start, duration: GLANCE, target: [other.x, other.y] }];
}

const running = () => seen && !document.hidden && !reduce.matches && !proof;

function schedule() {
  clearTimeout(timer);
  if (frozen != null || proof) { draw(); return; }
  if (!running()) {
    if (moments.length) { moments = []; draw(); }
    nextAt = null;
    return;
  }
  if (!bare[sceneName]) { loadBare(sceneName); return; }
  const t = now();
  if (moments.length) { if (!frame) frame = requestAnimationFrame(loop); return; }
  if (nextAt == null) nextAt = t + (lastType === "" ? 1.5 : 2 + Math.random() * 2);
  if (t >= nextAt) {
    moments = nextMoment(t);
    const end = Math.max(t, ...moments.map(mo => mo.start + mo.duration));
    // The quiet spell: about five to nine seconds from one face to the next.
    nextAt = end + 3.2 + Math.random() * 3.5;
    if (moments.length) frame = requestAnimationFrame(loop);
    else timer = setTimeout(schedule, 2000);
    return;
  }
  timer = setTimeout(schedule, (nextAt - t) * 1000 + 16);
}

function stop() {
  cancelAnimationFrame(frame);
  frame = 0;
  clearTimeout(timer);
  moments = [];
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/* The night jar when the page shows the night screenshot: the <img>
   loads again when the <picture> switches. */
function onImage() {
  const name = currentScene();
  if (name !== sceneName) {
    stop();
    sceneName = name;
    lastFruit = -1;
    nextAt = null;
  }
  measure();
  if (near) loadBare(sceneName);
  if (proof || frozen != null) draw(); else schedule();
}

img.addEventListener("load", onImage);
if (img.complete) onImage();

new ResizeObserver(() => { measure(); if (moments.length || proof || frozen != null) draw(); }).observe(host);

new IntersectionObserver(entries => {
  for (const e of entries) {
    if (!near && e.isIntersecting) { near = true; loadBare(currentScene()); }
  }
}, { rootMargin: "400px 0px" }).observe(host);

new IntersectionObserver(entries => {
  for (const e of entries) {
    const was = seen;
    seen = e.isIntersecting;
    if (seen && !was) nextAt = null;   // the first face ~1.5 s after it comes into view
    if (!seen) stop();
    schedule();
  }
}, { threshold: 0.35 }).observe(host);

document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); nextAt = null; schedule(); });
reduce.addEventListener?.("change", () => { stop(); schedule(); });
matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => setTimeout(onImage, 50));

/* For checking it by eye and in screenshots; not part of the page. */
window.__confitura = {
  /* Every fruit's house face, painted here over the bare frame: should
     be indistinguishable from the screenshot. */
  proof(on = true) { proof = on; stop(); if (on) draw(); else schedule(); },
  /* A face on fruit `i` (or a pair of `i` and `j`), `age` seconds into
     it, held still. type: "glance-spout", "glance", "yawn", "pair". */
  pose(type, i, age = 0.6, j) {
    const fruits = fruitsOf(sceneName);
    const scene = SCENES[sceneName];
    stop();
    frozen = 1000;
    const start = frozen - age;
    if (type === "pair") {
      const a = fruits[i], b = fruits[j];
      posed = [
        { fruit: a.i, type: "glance", start, duration: PAIR, target: [b.x, b.y] },
        { fruit: b.i, type: "glance", start: start + PAIR_LAG, duration: PAIR - PAIR_LAG + 0.3, target: [a.x, a.y] },
      ];
    } else if (type === "yawn") {
      posed = [{ fruit: i, type: "yawn", start, duration: YAWN }];
    } else {
      const target = type === "glance-spout" ? scene.gaze : [fruits[j].x, fruits[j].y];
      posed = [{ fruit: i, type: "glance", start, duration: GLANCE, target }];
    }
    draw();
  },
  release() { frozen = null; posed = []; proof = false; stop(); nextAt = null; schedule(); },
  state: () => ({ scene: sceneName, seen, near, bare: !!bare[sceneName], map, moments: moments.length, nextAt, now: now() }),
  twins: () => { const t = twins(fruitsOf(sceneName)); return t && [t.a.i, t.b.i]; },
};
})();
