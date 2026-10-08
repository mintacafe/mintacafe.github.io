/* ===========================================================
   Confitura · today's jar
   The website's demo of Confitura, ported from the game itself
   (Games/Confitura): the same engine, number for number, and the
   same art, painted on a canvas. Only the quantity is cut: one jar
   a day, the same for everyone, to fill as many times as you like.

   1. Dice         SplitMix64, the house RNG
   2. The ladder   radii, grams, what falls from the spout
   3. The engine   Physics.swift, operation for operation
                   (Games/Confitura/Tests/WebParity.swift checks it)
   4. Juice        rolling, squash, splashes, the lid: eye only
   5. Art          FruitArt.swift and JarArt on a 2D canvas
   6. The game     today's seed, the run, today's best
   7. The scene    StagePlan and JarScene: where it all goes
   8. The page     sprites, HUD, input and the loop
   =========================================================== */

(() => {
"use strict";

const TAU = Math.PI * 2;
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

/* ── 1. Dice ──────────────────────────────────────────────── */

const M64 = 0xFFFFFFFFFFFFFFFFn;

/* BigInt, so it walks exactly the app's sequence of UInt64s. */
class SplitMix64 {
  constructor(seed) { this.state = BigInt.asUintN(64, BigInt(seed)); }

  next() {
    this.state = (this.state + 0x9E3779B97F4A7C15n) & M64;
    let z = this.state;
    z = ((z ^ (z >> 30n)) * 0xBF58476D1CE4E5B9n) & M64;
    z = ((z ^ (z >> 27n)) * 0x94D049BB133111EBn) & M64;
    return z ^ (z >> 31n);
  }

  roll(bound) { return Number(this.next() % BigInt(bound)); }

  /* In 0..<1, the way Juice and the tests make one. */
  unit() { return Number(this.next() >> 11n) / 2 ** 53; }
}

/* FruitArt's artNoise: textures that look hand-placed and never move. */
const noiseMemo = new Map();
function artNoise(i, salt) {
  const key = i + ":" + salt;
  let v = noiseMemo.get(key);
  if (v === undefined) {
    let z = (BigInt.asUintN(64, BigInt(i * 7919 + salt * 104729)) + 0x9E3779B97F4A7C15n) & M64;
    z = ((z ^ (z >> 30n)) * 0xBF58476D1CE4E5B9n) & M64;
    z = ((z ^ (z >> 27n)) * 0x94D049BB133111EBn) & M64;
    z ^= z >> 31n;
    v = Number(z >> 11n) / 2 ** 53;
    noiseMemo.set(key, v);
  }
  return v;
}

/* ── 2. The ladder ────────────────────────────────────────── */
/* Ten fruits, blueberry to watermelon (GDD §2.1). A fruit is its level:
   0 blueberry, 1 raspberry, 2 cherry … 9 watermelon. Two watermelons
   make a finished jar of jam, which leaves the game. */

const RADIUS = [14, 18, 24, 31, 40, 52, 66, 84, 106, 134];
const GRAMS = [0, 1, 2, 4, 7, 12, 20, 33, 54, 88];
const MASS = RADIUS.map(r => r * r);
const STRAWBERRY = 3, PEACH = 5, POMEGRANATE = 7, WATERMELON = 9;
const FINISHED_JAR_GRAMS = 250;

/* Only levels 1–5 fall from the spout, small ones more often. */
const WEIGHTS = [30, 25, 20, 15, 10];

function drawKind(rng) {
  let roll = rng.roll(100);
  for (let k = 0; k < WEIGHTS.length; k++) {
    roll -= WEIGHTS[k];
    if (roll < 0) return k;
  }
  return 0;
}

/* ── 3. The engine ────────────────────────────────────────── */
/* Verlet integration plus positional constraints: circles against
   circles and the jar's walls. Every operation runs in the app's order,
   so the same drops give the same doubles, bit for bit. Jar interior
   coordinates: x across 0…340, y down, the mouth at y ≈ 0. */

const SUBSTEP = 1 / 120;
const ITERATIONS = 6;

class World {
  constructor() {
    this.width = 340;
    this.height = 470;
    /* Resting with your top above this line for too long ends the run. */
    this.overflowY = 10;
    this.bodies = [];
    this.nextID = 1;
    this.gravity = 2200;
    this.airFriction = 0.999;
    this.groundFriction = 0.90;
    this.accumulator = 0;
  }

  spawn(kind, x) {
    const r = RADIUS[kind];
    const cx = Math.min(Math.max(x, r + 1), this.width - r - 1);
    const cy = -r - 26;
    const body = { id: this.nextID++, kind, x: cx, y: cy, px: cx, py: cy, age: 0, overflowTime: 0 };
    this.bodies.push(body);
    return body;
  }

  /* Advances the simulation, returning any merges that happened. */
  step(dt) {
    const events = [];
    this.accumulator += Math.min(dt, 1 / 15);
    while (this.accumulator >= SUBSTEP) {
      this.accumulator -= SUBSTEP;
      this.integrate(SUBSTEP);
      for (let k = 0; k < ITERATIONS; k++) this.solveConstraints();
      for (const event of this.resolveMerges()) events.push(event);
      this.updateOverflow(SUBSTEP);
    }
    return events;
  }

  get overflowWarning() { return this.bodies.some(b => b.overflowTime > 0.15); }
  get overflowed() { return this.bodies.some(b => b.overflowTime > 1.8); }

  integrate(dt) {
    for (const b of this.bodies) {
      const vx = (b.x - b.px) * this.airFriction;
      const vy = (b.y - b.py) * this.airFriction;
      b.px = b.x;
      b.py = b.y;
      b.x += vx;
      b.y += vy + this.gravity * dt * dt;
      b.age += dt;
    }
  }

  solveConstraints() {
    const bodies = this.bodies;
    // Circles push apart, the heavier one moving less.
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i], b = bodies[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const rsum = RADIUS[a.kind] + RADIUS[b.kind];
        const d2 = dx * dx + dy * dy;
        if (!(d2 > 0.000001 && d2 < rsum * rsum)) continue;
        const d = Math.sqrt(d2);
        // Soften the push: deep overlaps (fresh merges) resolve over a few
        // steps instead of launching fruit out of the jar.
        const overlap = (rsum - d) * 0.45;
        const nx = dx / d;
        const ny = dy / d;
        const wi = MASS[b.kind] / (MASS[a.kind] + MASS[b.kind]);
        const wj = 1 - wi;
        a.x -= nx * overlap * wi;
        a.y -= ny * overlap * wi;
        b.x += nx * overlap * wj;
        b.y += ny * overlap * wj;
      }
    }
    // Walls and floor.
    for (const b of bodies) {
      const r = RADIUS[b.kind];
      if (b.x < r) b.x = r;
      if (b.x > this.width - r) b.x = this.width - r;
      if (b.y > this.height - r) {
        b.y = this.height - r;
        b.px = b.x - (b.x - b.px) * this.groundFriction;
      }
    }
  }

  resolveMerges() {
    const events = [];
    const consumed = new Set();
    const created = [];
    const bodies = this.bodies;
    for (let i = 0; i < bodies.length; i++) {
      if (consumed.has(bodies[i].id)) continue;
      for (let j = i + 1; j < bodies.length; j++) {
        if (bodies[i].kind !== bodies[j].kind || consumed.has(bodies[j].id)) continue;
        const dx = bodies[j].x - bodies[i].x;
        const dy = bodies[j].y - bodies[i].y;
        const reach = RADIUS[bodies[i].kind] + RADIUS[bodies[j].kind] + 1.0;
        if (!(dx * dx + dy * dy <= reach * reach)) continue;
        consumed.add(bodies[i].id);
        consumed.add(bodies[j].id);
        const mx = (bodies[i].x + bodies[j].x) / 2;
        const my = (bodies[i].y + bodies[j].y) / 2;
        const next = bodies[i].kind + 1;
        if (next <= WATERMELON) {
          // A merged fruit never counts as freshly dropped.
          created.push({ id: this.nextID++, kind: next, x: mx, y: my, px: mx, py: my, age: 2, overflowTime: 0 });
          events.push({ x: mx, y: my, created: next, grams: GRAMS[next] });
        } else {
          events.push({ x: mx, y: my, created: null, grams: FINISHED_JAR_GRAMS });
        }
        break;
      }
    }
    if (consumed.size) {
      this.bodies = bodies.filter(b => !consumed.has(b.id));
      for (const b of created) this.bodies.push(b);
    }
    return events;
  }

  updateOverflow(dt) {
    for (const b of this.bodies) {
      const dx = b.x - b.px;
      const dy = b.y - b.py;
      const slow = dx * dx + dy * dy < 0.35;
      if (b.age > 1.0 && slow && b.y - RADIUS[b.kind] < this.overflowY) {
        b.overflowTime += dt;
      } else {
        b.overflowTime = Math.max(0, b.overflowTime - dt * 2);
      }
    }
  }
}

/* The jar of the day: the date, as a number (20261008), is the seed.
   Everyone who plays on the same calendar day gets the same fruit in the
   same order, wherever they drop it. The app's own jar of the day (GDD
   §6, v1.1) can use the very same rule. */
function dayNumber(date = new Date()) {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

/* The parity test runs this file in Node: it only needs the engine. */
if (typeof module === "object" && module && module.exports) {
  module.exports = { SplitMix64, World, drawKind, dayNumber, RADIUS, GRAMS };
}
if (typeof document === "undefined") return;

/* ── 4. Juice ─────────────────────────────────────────────── */
/* The render-only life of the jar. It reads the world after every step
   and never writes to it: the physics stays exactly as tuned. */

const GHOST_TIME = 0.10;
const FLIGHT_TIME = 0.95;

class Juice {
  constructor() {
    this.motions = new Map();
    this.droplets = [];
    this.ghosts = [];
    this.popups = [];
    this.rings = [];
    this.flights = [];
    this.shakeAmp = 0;
    this.shakeAt = -10;
    /* 1 = the lid sits on the jar (or is trying to), 0 = put away. A run
       starts with it on, so the first thing you see is the jar opening. */
    this.lid = 1;
    /* Its own dice: the spawner's sequence must not change. */
    this.rng = new SplitMix64(0xC0F17A5An);
  }

  noteDrop(body) {
    this.motions.set(body.id, motion(body.kind, body.x, body.y, 0, null));
  }

  absorb(world, events, time, finishedJars) {
    const vanished = new Map(this.motions);
    for (const b of world.bodies) {
      vanished.delete(b.id);
      const fall = b.y - b.py;
      const m = this.motions.get(b.id);
      if (!m) {
        // Not dropped by us, so a merge made it.
        this.motions.set(b.id, motion(b.kind, b.x, b.y, fall, time));
        continue;
      }
      // Rolling without slipping: the angle follows the ground covered.
      const dx = b.x - m.lastX;
      if (Math.abs(dx) > 0.02) m.angle += dx / RADIUS[b.kind];
      // A sudden stop after a fall is a landing.
      const slowed = m.fall - fall;
      if (m.fall > 2.5 && slowed > 2.5 && time - m.squashAt > 0.2) {
        m.squash = Math.min(slowed * 0.018, 0.2);
        m.squashAt = time;
      }
      m.fall = fall;
      m.lastX = b.x;
      m.lastY = b.y;
    }

    const jarEvents = events.filter(e => e.created === null).length;
    let nextSlot = finishedJars - jarEvents;
    const pool = new Map(vanished);
    for (const event of events) {
      const source = event.created === null ? WATERMELON : event.created - 1;
      const near = m => (m.lastX - event.x) ** 2 + (m.lastY - event.y) ** 2;
      const pair = [...pool]
        .filter(([, m]) => m.kind === source)
        .sort((a, b) => near(a[1]) - near(b[1]))
        .slice(0, 2);
      for (const [id, m] of pair) {
        this.ghosts.push({
          kind: m.kind, fromX: m.lastX, fromY: m.lastY,
          toX: event.x, toY: event.y, angle: m.angle, birth: time });
        pool.delete(id);
      }
      if (event.created !== null) {
        this.splash(event.created, event, time);
      } else {
        this.celebrate(event, nextSlot, time);
        nextSlot += 1;
      }
    }
    for (const id of vanished.keys()) this.motions.delete(id);
  }

  /* Moves everything that lives on its own clock. */
  advance(dt, time, lidWanted) {
    for (const d of this.droplets) {
      const gravity = d.style === "spark" ? 260 : 1100;
      d.vy += gravity * dt;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
    }
    this.droplets = this.droplets.filter(d => time - d.birth <= d.life);
    this.ghosts = this.ghosts.filter(g => time - g.birth <= GHOST_TIME);
    this.popups = this.popups.filter(p => time - p.birth <= 1.0);
    this.rings = this.rings.filter(r => time - r.birth <= 0.5);
    this.flights = this.flights.filter(f => time - f.birth <= FLIGHT_TIME);
    const target = lidWanted ? 1 : 0;
    this.lid += (target - this.lid) * Math.min(1, dt * (lidWanted ? 5 : 3));
  }

  /* The jar jiggles on the counter after a big merge (world units). */
  shake(time) {
    const t = time - this.shakeAt;
    if (!(t >= 0 && t < 0.6 && this.shakeAmp > 0)) return [0, 0];
    const decay = this.shakeAmp * Math.exp(-10 * t);
    return [decay * Math.sin(55 * t), decay * 0.4 * Math.sin(43 * t + 1)];
  }

  /* A fresh fruit pops in small, overshoots and settles. */
  static pop(bornAt, time) {
    if (bornAt === null || bornAt === undefined) return 1;
    const t = time - bornAt;
    if (!(t >= 0 && t < 0.7)) return 1;
    return 1 - 0.32 * Math.cos(20 * t) * Math.exp(-8.5 * t);
  }

  /* Squash on landing, then a couple of wobbles (positive = flattened). */
  static squash(m, time) {
    const t = time - m.squashAt;
    if (!(t >= 0 && t < 0.6)) return 0;
    return m.squash * Math.cos(28 * t) * Math.exp(-9 * t);
  }

  /* A fast fall stretches the fruit a little along its path. */
  static stretch(m) { return Math.min(Math.max(m.fall - 4, 0) * 0.012, 0.10); }

  splash(created, event, time) {
    const radius = RADIUS[created];
    this.rings.push({ x: event.x, y: event.y, radius, look: created, birth: time });
    for (let i = 0; i < 7 + created * 2; i++) {
      const a = this.rng.unit() * TAU;
      const speed = (140 + this.rng.unit() * 220) * (0.7 + radius / 120);
      let style = "juice";
      if (created === POMEGRANATE && i % 2 === 0) style = "aril";
      if (created === WATERMELON && i % 4 === 0) style = "pip";
      this.droplets.push({
        x: event.x + Math.cos(a) * radius * 0.5, y: event.y + Math.sin(a) * radius * 0.5,
        vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 160,
        size: (0.035 + this.rng.unit() * 0.045) * radius + 1.2,
        birth: time, life: 0.45 + this.rng.unit() * 0.35, look: created, style });
    }
    this.popups.push({ x: event.x, y: event.y - radius * 0.3, grams: event.grams, birth: time, jar: false });
    if (created >= PEACH) this.startShake(1.2 + (created - PEACH), time);
  }

  /* Two watermelons became a jar of jam: gold, a big jiggle, and off it
     goes to the shelf. */
  celebrate(event, slot, time) {
    this.rings.push({ x: event.x, y: event.y, radius: RADIUS[WATERMELON], look: null, birth: time });
    for (let i = 0; i < 28; i++) {
      const a = this.rng.unit() * TAU;
      const speed = 160 + this.rng.unit() * 340;
      this.droplets.push({
        x: event.x, y: event.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 220,
        size: 3 + this.rng.unit() * 4, birth: time, life: 0.7 + this.rng.unit() * 0.5,
        look: 8, style: "spark" });
    }
    this.popups.push({ x: event.x, y: event.y - 40, grams: event.grams, birth: time, jar: true });
    this.flights.push({ fromX: event.x, fromY: event.y, slot, birth: time });
    this.startShake(7, time);
  }

  startShake(amp, time) {
    // A bigger shake wins; a smaller one doesn't cut a big one short.
    if (amp >= Math.abs(this.shake(time)[0]) + 0.5 || time - this.shakeAt > 0.3) {
      this.shakeAmp = amp;
      this.shakeAt = time;
    }
  }
}

function motion(kind, x, y, fall, bornAt) {
  return { kind, lastX: x, lastY: y, fall, angle: 0, squash: 0, squashAt: -10, bornAt };
}

/* ── 5. Art ───────────────────────────────────────────────── */
/* Everything the jar shows, painted in code, as in FruitArt.swift: ten
   jam fruits and the light on them, the glass jar, the counter, the
   gingham lid and the little jars on the shelf. Every function paints
   around the canvas's current origin, in the app's points. */

const ROUNDED = 'ui-rounded, "SF Pro Rounded", -apple-system, "Segoe UI Variable Display", "Varela Round", "Quicksand", "Nunito", system-ui, sans-serif';

function rgb(hex, a = 1) {
  return `rgba(${(hex >> 16) & 255},${(hex >> 8) & 255},${hex & 255},${a})`;
}
const white = a => rgb(0xFFFFFF, a);
const black = a => rgb(0x000000, a);

/* Gradient stops: evenly spaced colours, like SwiftUI's Gradient(colors:). */
const even = colors => colors.map((c, i) => [colors.length > 1 ? i / (colors.length - 1) : 0, c]);

function radial(c, x, y, r0, r1, stops) {
  const g = c.createRadialGradient(x, y, r0, x, y, Math.max(r1, 0.001));
  for (const [at, color] of stops) g.addColorStop(at, color);
  return g;
}

function linear(c, x0, y0, x1, y1, stops) {
  const g = c.createLinearGradient(x0, y0, x1, y1);
  for (const [at, color] of stops) g.addColorStop(at, color);
  return g;
}

function fill(c, path, style, rule) {
  c.fillStyle = style;
  if (rule) c.fill(path, rule); else c.fill(path);
}

function stroke(c, path, style, width, cap = "butt", join = "miter", dash = null) {
  c.strokeStyle = style;
  c.lineWidth = width;
  c.lineCap = cap;
  c.lineJoin = join;
  c.setLineDash(dash || []);
  c.stroke(path);
}

/* ── Shapes ── */

function circle(x, y, r) {
  const p = new Path2D();
  p.arc(x, y, r, 0, TAU);
  return p;
}

const disc = r => circle(0, 0, r);

function ellipse(x, y, w, h) {
  const p = new Path2D();
  p.ellipse(x + w / 2, y + h / 2, Math.abs(w / 2), Math.abs(h / 2), 0, 0, TAU);
  return p;
}

function box(x, y, w, h) {
  const p = new Path2D();
  p.rect(x, y, w, h);
  return p;
}

function roundBox(x, y, w, h, radius) {
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  const p = new Path2D();
  p.moveTo(x + r, y);
  p.arcTo(x + w, y, x + w, y + h, r);
  p.arcTo(x + w, y + h, x, y + h, r);
  p.arcTo(x, y + h, x, y, r);
  p.arcTo(x, y, x + w, y, r);
  p.closePath();
  return p;
}

function lines(points, close = false) {
  const p = new Path2D();
  points.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y)));
  if (close) p.closePath();
  return p;
}

function segment(x0, y0, x1, y1) {
  const p = new Path2D();
  p.moveTo(x0, y0);
  p.lineTo(x1, y1);
  return p;
}

function star(cx, cy, points, outer, inner) {
  const pts = [];
  for (let i = 0; i < points * 2; i++) {
    const a = -Math.PI / 2 + i * Math.PI / points;
    const rr = i % 2 === 0 ? outer : inner;
    pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
  }
  return lines(pts, true);
}

/* A pointed leaf growing from the base towards `angle` (degrees, y down). */
function leafPath(bx, by, angle, length, width) {
  const a = angle * Math.PI / 180;
  const dx = Math.cos(a), dy = Math.sin(a);
  const nx = -dy, ny = dx;
  const midX = bx + dx * length * 0.5, midY = by + dy * length * 0.5;
  const p = new Path2D();
  p.moveTo(bx, by);
  p.quadraticCurveTo(midX + nx * width, midY + ny * width, bx + dx * length, by + dy * length);
  p.quadraticCurveTo(midX - nx * width, midY - ny * width, bx, by);
  p.closePath();
  return p;
}

function paintLeaf(c, bx, by, angle, length, width, fillHex, veinHex) {
  fill(c, leafPath(bx, by, angle, length, width), rgb(fillHex));
  const a = angle * Math.PI / 180;
  stroke(c, segment(bx, by, bx + Math.cos(a) * length * 0.85, by + Math.sin(a) * length * 0.85),
    rgb(veinHex), Math.max(width * 0.12, 0.5), "round");
}

/* A line of longitude seen from the side: it bows out and meets the others
   at the poles, which is what makes a ball read as round. */
function meridian(r, longitude, wobble = 0, frequency = 0, phase = 0) {
  const n = 48;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const y = -r + 2 * r * t;
    const k = Math.sqrt(Math.max(0, 1 - (y / r) * (y / r)));
    const phi = (longitude + wobble * Math.sin(t * frequency * Math.PI + phase)) * Math.PI / 180;
    pts.push([r * Math.sin(phi) * k, y]);
  }
  return pts;
}

/* ── Fruit ── */

/* Market colours under afternoon light: ripe and clear, never neon.
   gloss: 0 is velvet (peach), 1 is lacquer (cherry). face: how big the
   face is against the fruit. halo: the light under the face. */
const PALETTES = [
  { skin: 0x4B5DA6, rim: 0x2E3B72, ink: 0x141A3A, blush: 0xF2A6C8, juice: 0x5C4AA0, gloss: 0.3,  face: 1,    halo: 0.3 },  // blueberry
  { skin: 0xB8304F, rim: 0x952443, ink: 0x4A0F22, blush: 0xFFD0DC, juice: 0xD2335E, gloss: 0.35, face: 1,    halo: 0.2 },  // raspberry
  { skin: 0xB01E32, rim: 0x74101F, ink: 0x3A0710, blush: 0xFF9FAE, juice: 0xA8172C, gloss: 1,    face: 1,    halo: 0.3 },  // cherry
  { skin: 0xE2433F, rim: 0xA3262B, ink: 0x571114, blush: 0xFFC9C2, juice: 0xE0383B, gloss: 0.6,  face: 0.95, halo: 0.2 },  // strawberry
  { skin: 0x6B3F8E, rim: 0x49255F, ink: 0x23102F, blush: 0xF4A3CB, juice: 0x7D3C92, gloss: 0.4,  face: 0.9,  halo: 0.3 },  // plum
  { skin: 0xF8B66E, rim: 0xD47A4F, ink: 0x6A2B1C, blush: 0xFF7F7F, juice: 0xF7A25E, gloss: 0.12, face: 0.85, halo: 0.07 }, // peach
  { skin: 0xF5961F, rim: 0xC46F12, ink: 0x6B3407, blush: 0xFF8C6E, juice: 0xFFA62E, gloss: 0.4,  face: 0.75, halo: 0.12 }, // orange
  { skin: 0xB3263A, rim: 0x7A1424, ink: 0x3A0810, blush: 0xFF9BAA, juice: 0xC42A45, gloss: 0.75, face: 0.68, halo: 0.3 },  // pomegranate
  { skin: 0xF3C431, rim: 0xC99A16, ink: 0x6B4E05, blush: 0xFF9C7A, juice: 0xF7D04E, gloss: 0.45, face: 0.6,  halo: 0.07 }, // melon
  { skin: 0x58A24E, rim: 0x24552B, ink: 0x0F2D14, blush: 0xFFAAA8, juice: 0xEF5A63, gloss: 0.55, face: 0.55, halo: 0.3 },  // watermelon
];

/* A sprite is a square this many radii from the centre: stems, leaves and
   crowns reach past the disc. */
const REACH = 1.65;

/* Every fruit is its disc, so the light layer always lands on skin; the
   strawberry adds a soft point at the bottom. */
function silhouette(look, r) {
  if (look !== STRAWBERRY) return disc(r);
  const start = 115 * Math.PI / 180, end = 425 * Math.PI / 180, steps = 72;
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const a = start + (end - start) * i / steps;
    pts.push([r * Math.cos(a), r * Math.sin(a)]);
  }
  const p = lines(pts);
  p.quadraticCurveTo(r * 0.30, r * 1.08, 0, r * 1.13);
  p.quadraticCurveTo(-r * 0.30, r * 1.08, r * Math.cos(start), r * Math.sin(start));
  p.closePath();
  return p;
}

/* The fruit itself, which turns as it rolls. */
function paintBody(c, look, r) {
  const palette = PALETTES[look];
  const outline = silhouette(look, r);
  fill(c, outline, rgb(palette.skin));
  c.save();
  c.clip(outline);
  paintSkin(c, look, r);
  c.restore();
  stroke(c, outline, rgb(palette.rim), Math.max(r * 0.05, 0.8));
  paintCrown(c, look, r);
  paintFace(c, palette, r);
}

/* Light from the window, top left: a form shadow, a broad glow, a bounce
   off the glass and, on shiny skins, a sharp highlight. At night the
   window is a lamp: warmer light, deeper shade. It doesn't turn. */
function paintLight(c, look, r, night) {
  const gloss = PALETTES[look].gloss;
  const d = disc(r);
  c.save();
  c.clip(d);
  fill(c, d, radial(c, -r * 0.32, -r * 0.38, 0, r * 1.65,
    [[0.42, black(0)], [1, black(night ? 0.36 : 0.26)]]));
  const glow = night ? 0xFFD9A0 : 0xFFF6E0;
  fill(c, d, radial(c, -r * 0.36, -r * 0.44, 0, r * 0.95,
    even([rgb(glow, night ? 0.30 : 0.34), rgb(glow, 0)])));
  const bounce = new Path2D();
  bounce.arc(0, 0, r * 0.86, 18 * Math.PI / 180, 78 * Math.PI / 180, false);
  stroke(c, bounce, white(night ? 0.07 : 0.12), r * 0.09, "round");
  if (gloss > 0) {
    c.translate(-r * 0.40, -r * 0.46);
    c.rotate(-35 * Math.PI / 180);
    fill(c, ellipse(-r * 0.24, -r * 0.13, r * 0.48, r * 0.26),
      radial(c, 0, 0, 0, r * 0.25, even([white(0.80 * gloss), white(0)])));
    fill(c, circle(-r * 0.04, -r * 0.01, r * 0.05), white(0.9 * gloss));
  }
  c.restore();
}

/* The soft dark a fruit leaves on whatever is under it. */
function paintShadow(c, r, night) {
  const drop = r * 0.14;
  fill(c, ellipse(-r * 1.07, -r * 1.07 + drop, r * 2.14, r * 2.14), radial(c, 0, drop, 0, r * 1.07,
    [[0.82, black(night ? 0.3 : 0.18)], [1, black(0)]]));
}

/* Body and light together, upright: for the saucer in the score strip. */
function paintWhole(c, look, r, night) {
  paintShadow(c, r, night);
  paintBody(c, look, r);
  paintLight(c, look, r, night);
}

function paintSkin(c, look, r) {
  const d = disc(r);
  switch (look) {
    case 0: { // blueberry: a dusty bloom over the blue, and the little crown
      fill(c, d, radial(c, r * 0.1, 0, 0, r, even([rgb(0xA9B8E0, 0.40), rgb(0xA9B8E0, 0.12)])));
      fill(c, star(0, -r * 0.60, 5, r * 0.27, r * 0.13), rgb(0x27315E));
      fill(c, circle(0, -r * 0.60, r * 0.07), rgb(0x161C3D));
      break;
    }
    case 1: { // raspberry: drupelets in a honeycomb, darker skin between
      const step = r * 0.40;
      let row = 0;
      for (let y = -r * 0.98; y <= r * 1.0; y += step * 0.866) {
        for (let x = -r * 1.1 + (row % 2 === 0 ? 0 : step / 2); x <= r * 1.1; x += step) {
          if (x * x + y * y < r * r * 1.04) {
            fill(c, circle(x, y, r * 0.205), rgb(0xE2557A));
            fill(c, circle(x - r * 0.06, y - r * 0.07, r * 0.06), white(0.45));
          }
        }
        row += 1;
      }
      break;
    }
    case 2: { // cherry
      fill(c, ellipse(-r * 0.22, -r * 1.02, r * 0.44, r * 0.22), rgb(0x5E0B18, 0.55));
      const crease = new Path2D();
      crease.moveTo(0, -r * 0.86);
      crease.quadraticCurveTo(-r * 0.14, -r * 0.3, r * 0.06, r * 0.25);
      stroke(c, crease, rgb(0x6E0D1C, 0.35), r * 0.05);
      break;
    }
    case 3: { // strawberry: seeds in a staggered net, each in its pocket
      fill(c, silhouette(STRAWBERRY, r), linear(c, 0, -r, 0, r * 1.1, even([rgb(0xD3323A), rgb(0xF25E4B)])));
      for (let row = 0; row < 7; row++) {
        const y = -r * 0.60 + row * r * 0.265;
        const shift = row % 2 === 0 ? 0 : r * 0.15;
        for (let col = -4; col <= 4; col++) {
          const x = col * r * 0.30 + shift;
          const inside = x * x + y * y < r * r * 0.74 || (y > r * 0.72 && Math.abs(x) < r * 0.22);
          if (!inside) continue;
          fill(c, ellipse(x - r * 0.055, y - r * 0.085, r * 0.11, r * 0.16), rgb(0xA8232C, 0.45));
          fill(c, ellipse(x - r * 0.034, y - r * 0.05, r * 0.068, r * 0.105), rgb(0xF7DA6A));
        }
      }
      break;
    }
    case 4: { // plum
      fill(c, d, radial(c, r * 0.2, r * 0.1, 0, r, even([rgb(0xBBA6DD, 0.30), rgb(0xBBA6DD, 0.08)])));
      paintSuture(c, r, [-r * 0.05, -r * 0.97], [-r * 0.24, r * 0.97], [-r * 0.62, 0], 0x46225F);
      break;
    }
    case 5: { // peach
      fill(c, d, radial(c, -r * 0.5, r * 0.45, 0, r * 0.85, even([rgb(0xFFDC8E, 0.8), rgb(0xFFDC8E, 0)])));
      fill(c, d, radial(c, r * 0.38, -r * 0.2, 0, r * 1.1,
        [[0, rgb(0xE9524F, 0.9)], [0.5, rgb(0xEE7562, 0.55)], [1, rgb(0xEE7562, 0)]]));
      paintSuture(c, r, [r * 0.02, -r * 0.96], [-r * 0.12, r * 0.98], [-r * 0.5, r * 0.05], 0xC9583F);
      break;
    }
    case 6: { // orange: pores, a field of tiny lighter and darker dots
      for (let i = 0; i < 70; i++) {
        const a = artNoise(i, 1) * TAU;
        const dist = Math.sqrt(artNoise(i, 2)) * r * 0.96;
        const light = i % 2 === 0;
        fill(c, circle(Math.cos(a) * dist, Math.sin(a) * dist, r * (light ? 0.026 : 0.021)),
          light ? rgb(0xFFC25A, 0.55) : rgb(0xD27410, 0.42));
      }
      break;
    }
    case 7: { // pomegranate
      for (const [x, y, radius, hex, alpha] of [
        [0.30, -0.20, 0.65, 0xD9584F, 0.38],
        [-0.38, 0.42, 0.75, 0xD98A4E, 0.32],
        [0.15, 0.6, 0.5, 0x8E1A2A, 0.28],
      ]) {
        fill(c, d, radial(c, r * x, r * y, 0, r * radius, even([rgb(hex, alpha), rgb(hex, 0)])));
      }
      for (const longitude of [-60, -25, 12, 48]) {
        stroke(c, lines(meridian(r, longitude)), rgb(0x7E1626, 0.18), r * 0.025);
      }
      for (let i = 0; i < 26; i++) {
        const a = artNoise(i, 7) * TAU;
        const dist = Math.sqrt(artNoise(i, 8)) * r * 0.92;
        fill(c, circle(Math.cos(a) * dist, Math.sin(a) * dist, r * (0.011 + 0.008 * artNoise(i, 9))),
          rgb(0xF4C0B0, 0.4));
      }
      break;
    }
    case 8: { // melon
      fill(c, d, radial(c, 0, -r, 0, r * 0.75, even([rgb(0xB9C24A, 0.45), rgb(0xB9C24A, 0)])));
      for (const longitude of [-72, -48, -22, 0, 22, 48, 72]) {
        stroke(c, lines(meridian(r, longitude)), rgb(0xCC9214, 0.5), r * 0.024);
      }
      for (let i = 0; i < 40; i++) {
        const a = artNoise(i, 4) * TAU;
        const dist = Math.sqrt(artNoise(i, 5)) * r * 0.9;
        const x = Math.cos(a) * dist, y = Math.sin(a) * dist;
        const tilt = artNoise(i, 6) * Math.PI;
        const dx = Math.cos(tilt) * r * 0.035, dy = Math.sin(tilt) * r * 0.035;
        stroke(c, segment(x - dx, y - dy, x + dx, y + dy), rgb(0xDDA520, 0.38), r * 0.013, "round");
      }
      break;
    }
    case 9: { // watermelon: dark bands with ragged edges, meeting at the poles
      [-74, -49, -24, 0, 24, 49, 74].forEach((longitude, i) => {
        const left = meridian(r, longitude - 7.5, 2.8, 10, i);
        const right = meridian(r, longitude + 7.5, 2.8, 10, i + 1.7);
        fill(c, lines(left.concat(right.reverse()), true), rgb(0x1F5C2B, 0.92));
      });
      break;
    }
  }
}

function paintSuture(c, r, from, to, bulge, hex) {
  const line = new Path2D();
  line.moveTo(from[0], from[1]);
  line.quadraticCurveTo(bulge[0], bulge[1], to[0], to[1]);
  stroke(c, line, rgb(hex, 0.5), r * 0.045, "round");
  c.save();
  c.translate(r * 0.05, 0);
  stroke(c, line, white(0.14), r * 0.03, "round");
  c.restore();
}

function stem(c, from, to, bend, width, hex) {
  const s = new Path2D();
  s.moveTo(from[0], from[1]);
  s.quadraticCurveTo(bend[0], bend[1], to[0], to[1]);
  stroke(c, s, rgb(hex), width, "round");
}

/* Stems, leaves and crowns. */
function paintCrown(c, look, r) {
  const brown = 0x6B4F36, green = 0x5FA251, vein = 0x3F7C3A;
  switch (look) {
    case 1: { // raspberry
      for (const angle of [205, 240, 300, 335]) {
        fill(c, leafPath(0, -r * 0.9, angle, r * 0.36, r * 0.12), rgb(0x4E8E44));
      }
      stem(c, [0, -r * 0.92], [r * 0.04, -r * 1.14], [r * 0.04, -r * 1.02], r * 0.08, 0x5E8E3E);
      break;
    }
    case 2: { // cherry
      const tip = [r * 0.40, -r * 1.50];
      const s = new Path2D();
      s.moveTo(0, -r * 0.92);
      s.bezierCurveTo(0, -r * 1.2, r * 0.18, -r * 1.42, tip[0], tip[1]);
      stroke(c, s, rgb(0x5E7F36), r * 0.075, "round");
      paintLeaf(c, tip[0], tip[1], -12, r * 0.62, r * 0.26, green, vein);
      break;
    }
    case 3: { // strawberry
      for (const angle of [196, 222, 249, 291, 318, 344]) {
        paintLeaf(c, 0, -r * 0.84, angle, r * 0.48, r * 0.17, 0x3E8C45, 0x2C6B34);
      }
      stem(c, [0, -r * 0.86], [r * 0.05, -r * 1.2], [-r * 0.02, -r * 1.05], r * 0.07, 0x4F8A3A);
      break;
    }
    case 4: { // plum
      stem(c, [0, -r * 0.95], [r * 0.08, -r * 1.26], [-r * 0.02, -r * 1.12], r * 0.07, brown);
      paintLeaf(c, r * 0.06, -r * 1.18, -24, r * 0.56, r * 0.22, green, vein);
      break;
    }
    case 5: { // peach
      stem(c, [0, -r * 0.95], [r * 0.03, -r * 1.14], [-r * 0.02, -r * 1.05], r * 0.08, brown);
      paintLeaf(c, r * 0.02, -r * 1.08, 202, r * 0.5, r * 0.2, 0x5C9C4E, vein);
      paintLeaf(c, r * 0.02, -r * 1.08, -30, r * 0.78, r * 0.3, 0x6BAA58, vein);
      break;
    }
    case 6: { // orange
      fill(c, star(0, -r * 0.94, 5, r * 0.11, r * 0.05), rgb(0x7D8F3B));
      paintLeaf(c, r * 0.04, -r * 0.98, -18, r * 0.58, r * 0.24, 0x4E9A4F, 0x357A3A);
      break;
    }
    case 7: { // pomegranate
      const neck = lines([[-r * 0.24, -r * 0.95], [-r * 0.17, -r * 1.06], [r * 0.17, -r * 1.06], [r * 0.24, -r * 0.95]]);
      neck.quadraticCurveTo(0, -r * 0.9, -r * 0.24, -r * 0.95);
      fill(c, neck, linear(c, 0, -r * 1.06, 0, -r * 0.92, even([rgb(0x9A2030), rgb(0xB3263A)])));
      const crown = lines([
        [-r * 0.20, -r * 1.03], [-r * 0.23, -r * 1.23], [-r * 0.11, -r * 1.09], [0, -r * 1.27],
        [r * 0.11, -r * 1.09], [r * 0.23, -r * 1.23], [r * 0.20, -r * 1.03],
      ], true);
      fill(c, crown, rgb(0xA92B3C));
      stroke(c, crown, rgb(0x6E1420), Math.max(r * 0.022, 0.6));
      fill(c, ellipse(-r * 0.15, -r * 1.09, r * 0.30, r * 0.07), rgb(0x5A0E18));
      break;
    }
    case 8: { // melon
      stem(c, [0, -r * 0.97], [r * 0.03, -r * 1.12], [-r * 0.01, -r * 1.05], r * 0.05, 0x8A6B3B);
      const tendril = new Path2D();
      tendril.moveTo(r * 0.03, -r * 1.1);
      tendril.quadraticCurveTo(r * 0.1, -r * 1.24, r * 0.2, -r * 1.16);
      tendril.quadraticCurveTo(r * 0.27, -r * 1.08, r * 0.17, -r * 1.05);
      tendril.quadraticCurveTo(r * 0.12, -r * 1.07, r * 0.14, -r * 1.12);
      stroke(c, tendril, rgb(0x6FAE55), r * 0.018, "round");
      paintLeaf(c, 0, -r * 1.06, 205, r * 0.42, r * 0.2, 0x5FA453, vein);
      break;
    }
    case 9: { // watermelon
      const curl = new Path2D();
      curl.moveTo(0, -r * 0.98);
      curl.quadraticCurveTo(-r * 0.01, -r * 1.12, r * 0.12, -r * 1.09);
      curl.quadraticCurveTo(r * 0.16, -r * 1.04, r * 0.09, -r * 1.03);
      stroke(c, curl, rgb(0x6B8E3A), r * 0.035, "round");
      break;
    }
  }
}

/* The house face: closed eyes, half a smile, warm cheeks (GDD §2.1). */
function paintFace(c, palette, r) {
  const f = r * palette.face;
  const line = Math.max(f * 0.065, 0.8);
  const cy = r * 0.10;
  const features = new Path2D();
  for (const side of [-1, 1]) {
    const ex = side * f * 0.30;
    const ey = cy - f * 0.08;
    features.moveTo(ex - f * 0.11, ey);
    features.quadraticCurveTo(ex, ey + f * 0.11, ex + f * 0.11, ey);
    fill(c, ellipse(side * f * 0.47 - f * 0.10, cy + f * 0.04, f * 0.20, f * 0.12), rgb(palette.blush, 0.55));
  }
  features.moveTo(-f * 0.13, cy + f * 0.14);
  features.quadraticCurveTo(0, cy + f * 0.28, f * 0.13, cy + f * 0.14);
  // A soft light halo under the ink, so the face reads on dark skins and
  // across the watermelon's stripes.
  stroke(c, features, white(palette.halo), line * 2.4, "round");
  stroke(c, features, rgb(palette.ink, 0.85), line, "round");
}

/* ── Jar, counter, lid, shelf ── */

/* Maps world units (jar interior: x 0…340, y down, mouth at 0) to points. */
class WorldFrame {
  constructor(scale, ox, oy) {
    this.scale = scale;
    this.ox = ox;
    this.oy = oy;
  }
  x(x) { return this.ox + x * this.scale; }
  y(y) { return this.oy + y * this.scale; }
}

/* Homemade jam: the colour of each finished jar on the shelf. */
const JAM = [0xC8323F, 0xE58A2E, 0x6B3F8E, 0x3F4E96, 0x9E1B32, 0xF08A24];
const jamColor = i => rgb(JAM[((i % JAM.length) + JAM.length) % JAM.length]);

/* The glass rises this far above the mouth line, in world units. */
const LIP = 18;

/* The U of the jar walls, open at the top (closed, it's the glass inside). */
function walls(f, width, height, closed = false) {
  const s = f.scale;
  const lx = f.x(-4), rx = f.x(width + 4), top = f.y(-LIP);
  const bottom = f.y(height + 4);
  const corner = 26 * s;
  const p = new Path2D();
  p.moveTo(lx, top);
  p.lineTo(lx, bottom - corner);
  p.quadraticCurveTo(lx, bottom, lx + corner, bottom);
  p.lineTo(rx - corner, bottom);
  p.quadraticCurveTo(rx, bottom, rx, bottom - corner);
  p.lineTo(rx, top);
  if (closed) p.closePath();
  return p;
}

/* The wooden counter, edge to edge, from `top` down to `bottom`: oak by
   day, walnut under the lamp at night. */
function paintCounter(c, top, bottom, width, s, night) {
  const depth = Math.max(14 * s, 9);
  fill(c, box(0, top, width, bottom - top), linear(c, 0, top + depth, 0, Math.max(bottom, top + depth + 1),
    even(night ? [rgb(0x4A3729), rgb(0x3A2B20)] : [rgb(0xDCC29A), rgb(0xCDAE80)])));
  fill(c, box(0, top, width, depth), linear(c, 0, top, 0, top + depth,
    even(night ? [rgb(0x6A503C), rgb(0x5A4332)] : [rgb(0xEAD8B5), rgb(0xE2CBA4)])));
  stroke(c, segment(0, top + depth, width, top + depth), rgb(night ? 0x2A1F17 : 0xB8966A), Math.max(1.5 * s, 1));
  stroke(c, segment(0, top + 0.75, width, top + 0.75), rgb(night ? 0x9C7A58 : 0xF6EAD2), 1.5);
  // Grain on the front face.
  const face = bottom - top - depth;
  if (face <= 12) return;
  for (let i = 0; i < 6; i++) {
    const y0 = top + depth + face * (0.15 + 0.14 * i) + artNoise(i, 11) * 4;
    const grain = new Path2D();
    grain.moveTo(-10, y0);
    let x = -10;
    while (x < width + 10) {
      x += 40;
      const xi = Math.trunc(x);
      grain.quadraticCurveTo(x - 20, y0 + artNoise(xi + i * 31, 13) * 4 - 2, x, y0 + artNoise(xi + i * 97, 12) * 3 - 1.5);
    }
    stroke(c, grain, rgb(night ? 0x22190F : 0xB8966A, night ? 0.4 : 0.28), 1);
  }
}

/* Behind the fruit: the tint of the glass and the contact shadow. */
function paintBack(c, f, width, height, night) {
  fill(c, walls(f, width, height, true), linear(c, f.x(0), f.y(0), f.x(0), f.y(height),
    even(night ? [white(0.07), rgb(0x9CC9B6, 0.06)] : [white(0.36), rgb(0xDBEAE2, 0.24)])));
  const s = f.scale;
  const bx = f.x(width / 2), by = f.y(height + 4);
  fill(c, ellipse(bx - (width / 2 + 20) * s, by - 5 * s, (width + 40) * s, 12 * s),
    radial(c, bx, by, 0, (width / 2 + 20) * s, even([black(night ? 0.35 : 0.14), black(0)])));
}

/* In front of the fruit: the walls, the thick bottom, reflections, the
   threaded neck and the lip. */
function paintFront(c, f, width, height, night) {
  const s = f.scale;
  const wall = walls(f, width, height);
  const rim = night ? 0x5E8A7B : 0xAFCBC1;
  const ridge = night ? 0x6E9A8C : 0x9DBCB1;
  const shine = night ? 0.55 : 1.0;
  stroke(c, wall, rgb(rim), Math.max(7 * s, 4), "round", "round");
  stroke(c, wall, white(0.35 * shine), Math.max(1.6 * s, 1), "round", "round");

  // The thick glass bottom catches the light.
  stroke(c, segment(f.x(22), f.y(height + 1), f.x(width - 22), f.y(height + 1)),
    white(0.45 * shine), Math.max(2 * s, 1.2), "round");

  // Reflections: a tall soft one on the left, a hairline beside it, a short
  // one on the right.
  for (const [x, w, y0, y1, alpha] of [
    [12, 15, 30, height - 70, 0.24],
    [33, 4, 46, height - 120, 0.18],
    [width - 26, 6, 60, height * 0.55, 0.18],
  ]) {
    fill(c, roundBox(f.x(x), f.y(y0), w * s, (y1 - y0) * s, w * s / 2),
      linear(c, f.x(0), f.y(y0), f.x(0), f.y(y1),
        even([white(alpha * shine), white(alpha * 0.4 * shine), white(alpha * 0.9 * shine)])));
  }

  // Threads on the neck, where the lid screws on.
  for (const [x, side] of [[-4, -1], [width + 4, 1]]) {
    for (const y of [-12, -4]) {
      stroke(c, segment(f.x(x + side), f.y(y + 2), f.x(x + side * 5), f.y(y - 1)),
        rgb(ridge), Math.max(3 * s, 2), "round");
    }
  }

  // The lip, slightly wider than the body.
  for (const x of [-4, width + 4]) {
    stroke(c, segment(f.x(x - 6), f.y(-LIP), f.x(x + 6), f.y(-LIP)), rgb(ridge), Math.max(8 * s, 5), "round");
  }
}

/* The jar lid: a gold band under a gingham cloth tied with twine. Centred
   on the origin; `w` is the width of the band. */
function paintLid(c, w) {
  const h = w * 0.085;
  fill(c, roundBox(-w / 2, -h / 2, w, h, h * 0.3), linear(c, 0, -h / 2, 0, h / 2,
    even([rgb(0xF2D892), rgb(0xCDA552), rgb(0xA9843C)])));
  const ridges = new Path2D();
  for (let x = -w / 2 + h * 0.3; x < w / 2 - h * 0.2; x += h * 0.34) {
    ridges.moveTo(x, h * 0.05);
    ridges.lineTo(x, h * 0.45);
  }
  stroke(c, ridges, rgb(0x8E6C2C, 0.4), Math.max(h * 0.06, 0.5));

  // The cloth: a dome over the top, a pinked hem over the band.
  const clothW = w * 1.05;
  const left = -clothW / 2, right = clothW / 2;
  const hemY = -h * 0.02;
  const cloth = new Path2D();
  cloth.moveTo(left, hemY);
  cloth.lineTo(left + w * 0.025, -h * 0.55);
  cloth.quadraticCurveTo(0, -h * 2.2, right - w * 0.025, -h * 0.55);
  cloth.lineTo(right, hemY);
  const teeth = Math.max(Math.trunc(w / Math.max(h * 0.55, 1)), 8);
  for (let i = 0; i < teeth; i++) {
    cloth.lineTo(right - (right - left) * (i + 0.5) / teeth, hemY + h * 0.26);
    cloth.lineTo(right - (right - left) * (i + 1) / teeth, hemY);
  }
  cloth.closePath();
  c.save();
  c.clip(cloth);
  fill(c, cloth, rgb(0xFBF3E4));
  const check = w / 15;
  const red = rgb(0xD2553F, 0.5);
  for (let cx = left; cx < right; cx += check * 2) fill(c, box(cx, -h * 3, check, h * 5), red);
  for (let cy = -h * 2.4; cy < h; cy += check * 2) fill(c, box(left - 1, cy, clothW + 2, check), red);
  fill(c, cloth, linear(c, 0, -h * 1.4, 0, hemY + h * 0.26, even([white(0.25), white(0), black(0.08)])));
  c.restore();
  stroke(c, cloth, rgb(0xB9472F, 0.45), Math.max(h * 0.05, 0.5));

  // Twine round the neck, and a bow.
  const twineY = -h * 0.3;
  const twine = new Path2D();
  twine.moveTo(left + w * 0.01, twineY);
  twine.quadraticCurveTo(0, twineY + h * 0.16, right - w * 0.01, twineY);
  stroke(c, twine, rgb(0xC9A66B), Math.max(h * 0.16, 1), "round");
  stroke(c, twine, rgb(0xA88449, 0.55), Math.max(h * 0.16, 1), "butt", "miter",
    [Math.max(h * 0.06, 0.6), Math.max(h * 0.1, 1)]);
  const kx = w * 0.18, ky = twineY + h * 0.06;
  for (const side of [-1, 1]) {
    c.save();
    c.translate(kx + side * h * 0.42, ky - h * 0.14);
    c.rotate(side * 22 * Math.PI / 180);
    stroke(c, ellipse(-h * 0.42, -h * 0.24, h * 0.84, h * 0.48), rgb(0xC9A66B), Math.max(h * 0.13, 1));
    c.restore();
    const tail = new Path2D();
    tail.moveTo(kx, ky);
    tail.quadraticCurveTo(kx + side * h * 0.1, ky + h * 0.4, kx + side * h * 0.45, ky + h * 0.75);
    stroke(c, tail, rgb(0xC9A66B), Math.max(h * 0.13, 1), "round");
  }
  fill(c, circle(kx, ky, Math.max(h * 0.13, 1)), rgb(0xA88449));
}

/* One finished jar for the shelf: glass, jam, label and gingham top. The
   origin is the middle of its base; `H` includes the lid. */
function paintMiniJar(c, H, flavor) {
  const w = H * 0.74;
  const bodyTop = -H * 0.80;
  const glass = roundBox(-w / 2, bodyTop, w, -bodyTop, w * 0.2);
  fill(c, glass, rgb(0xEAF3EE));
  const inset = Math.max(H * 0.045, 0.8);
  const jx = -w / 2 + inset, jy = bodyTop + H * 0.1, jw = w - inset * 2, jh = -bodyTop - H * 0.1 - inset;
  const jam = roundBox(jx, jy, jw, jh, w * 0.16);
  fill(c, jam, jamColor(flavor));
  fill(c, jam, linear(c, 0, jy, 0, jy + jh, even([white(0.12), black(0.25)])));
  stroke(c, glass, rgb(0xAFCBC1), Math.max(H * 0.04, 0.8));
  fill(c, roundBox(-w / 2 + w * 0.12, bodyTop + H * 0.14, w * 0.1, H * 0.48, w * 0.05), white(0.4));
  const label = roundBox(-w * 0.32, -H * 0.47, w * 0.64, H * 0.24, H * 0.04);
  fill(c, label, rgb(0xFBF3E4));
  stroke(c, label, rgb(0xC4A47A, 0.7), Math.max(H * 0.015, 0.5));
  fill(c, leafPath(-w * 0.1, -H * 0.47 + H * 0.12 + H * 0.03, -30, w * 0.24, w * 0.08), rgb(0x5FA251));
  c.save();
  c.translate(0, bodyTop - H * 0.02);
  paintLid(c, w * 0.94);
  c.restore();
}

/* A wall shelf: a plank from `left` to `right` whose top sits at `y`. */
function paintShelfPlank(c, left, right, y, s, night) {
  const t = Math.max(7 * s, 5);
  fill(c, box(left + 4, y + t, right - left - 8, Math.max(5 * s, 3)), black(night ? 0.25 : 0.07));
  for (const x of [left + (right - left) * 0.18, left + (right - left) * 0.82]) {
    fill(c, lines([[x - t * 0.4, y + t], [x + t * 0.4, y + t], [x - t * 0.4, y + t * 2.6]], true),
      rgb(night ? 0x4E3B2D : 0xBF9F72));
  }
  fill(c, roundBox(left, y, right - left, t, t * 0.3), linear(c, 0, y, 0, y + t,
    even(night ? [rgb(0x7A5D46), rgb(0x5E4635)] : [rgb(0xE3C99D), rgb(0xCDAE80)])));
}

/* MintaKit's background: cream paper with a sun glow and three leaves,
   barely there; at night deep green, moonlight and a few fireflies. */
function paintMintaBackground(c, w, h, night, pixelsPerPoint) {
  fill(c, box(0, 0, w, h), rgb(night ? 0x131E1A : 0xF3EEE0));
  const glow = night ? 0xA9C6D8 : 0xE8C468;
  fill(c, box(0, 0, w, h), radial(c, w * 0.5, h * 0.02, 0, w * 0.95,
    even([rgb(glow, night ? 0.10 : 0.22), rgb(glow, 0)])));
  for (const [size, degrees, alpha, x, y] of [
    [w * 1.05, 38, night ? 0.04 : 0.055, w * 0.06, h * 0.30],
    [w * 0.85, -24, night ? 0.035 : 0.05, w * 0.96, h * 0.62],
    [w * 0.95, 155, night ? 0.03 : 0.045, w * 0.22, h * 0.97],
  ]) {
    c.save();
    c.translate(x, y);
    c.rotate(degrees * Math.PI / 180);
    c.globalAlpha = alpha;
    fill(c, mintaLeaf(size * 0.42, size), rgb(night ? 0xA8C8B6 : 0x3E6B52), "evenodd");
    c.restore();
  }
  if (!night) return;
  for (const [x, y, r, alpha] of [
    [0.12, 0.18, 2.6, 0.45], [0.83, 0.11, 2.0, 0.35], [0.68, 0.34, 1.6, 0.30],
    [0.28, 0.52, 2.2, 0.25], [0.91, 0.58, 2.4, 0.35], [0.07, 0.74, 1.8, 0.30],
    [0.55, 0.86, 2.0, 0.25],
  ]) {
    c.save();
    c.shadowColor = rgb(0xF0CF78, alpha);
    c.shadowBlur = r * 5 * pixelsPerPoint;
    fill(c, circle(w * x, h * y, r), rgb(0xF0CF78, alpha));
    c.restore();
  }
}

/* LeafShape, centred on the origin: an elegant leaf and a slender vein. */
function mintaLeaf(w, h) {
  const x = -w / 2, y = -h / 2;
  const p = new Path2D();
  p.moveTo(x + 0.5 * w, y);
  p.bezierCurveTo(x + 0.02 * w, y + 0.22 * h, x + 0.24 * w, y + 0.92 * h, x + 0.5 * w, y + h);
  p.bezierCurveTo(x + 0.76 * w, y + 0.92 * h, x + 0.98 * w, y + 0.28 * h, x + 0.5 * w, y);
  p.closePath();
  p.moveTo(x + 0.5 * w, y + 0.06 * h);
  p.quadraticCurveTo(x + 0.455 * w, y + 0.5 * h, x + 0.5 * w, y + 0.96 * h);
  p.quadraticCurveTo(x + 0.525 * w, y + 0.5 * h, x + 0.5 * w, y + 0.06 * h);
  p.closePath();
  return p;
}

/* ── 6. The game ──────────────────────────────────────────── */
/* GameModel.swift without the week: the run flow around the world (aim,
   drop, grams, the overflow end). Today's best lives in this browser
   only, and only as a convenience. */

const BEST_KEY = "confitura.today";

const todaysBest = {
  read(day) {
    try {
      const saved = JSON.parse(localStorage.getItem(BEST_KEY));
      return saved && saved.day === day ? saved.best | 0 : 0;
    } catch { return 0; }
  },
  write(day, best) {
    try { localStorage.setItem(BEST_KEY, JSON.stringify({ day, best })); } catch { /* fine */ }
  },
};

class Game {
  constructor() {
    this.aimX = 170;
    this.reset();
  }

  reset() {
    this.day = dayNumber();
    this.world = new World();
    this.grams = 0;
    this.finishedJars = 0;
    this.time = 0;
    this.dropCooldown = 0;
    this.juice = new Juice();
    this.readySince = 0;
    this.showsResults = false;
    /* The run has played out: the card is up and the loop can rest. */
    this.resting = false;
    this.newBest = false;
    this.best = todaysBest.read(this.day);
    this.rng = new SplitMix64(this.day);
    this.heldKind = drawKind(this.rng);
    this.nextKind = drawKind(this.rng);
    this.phase = "playing";
    this.overAt = 0;
  }

  get canDrop() { return this.phase === "playing" && this.dropCooldown <= 0; }

  tick(dt) {
    this.time += dt;
    if (this.phase === "playing") {
      const wasCooling = this.dropCooldown > 0;
      this.dropCooldown = Math.max(0, this.dropCooldown - dt);
      if (wasCooling && this.dropCooldown === 0) this.readySince = this.time;
      const events = this.world.step(dt);
      for (const event of events) {
        this.grams += event.grams;
        if (event.created === null) this.finishedJars += 1;
      }
      this.juice.absorb(this.world, events, this.time, this.finishedJars);
      if (this.world.overflowed) this.endRun();
    }
    this.juice.advance(dt, this.time, this.phase === "over" || this.world.overflowWarning);
    if (this.phase === "over") {
      // Give the lid a second to fail before the card comes in, then let
      // the splashes finish and rest the loop.
      if (!this.showsResults && this.time - this.overAt > 1.1) this.showsResults = true;
      if (this.time - this.overAt > 3) this.resting = true;
    }
  }

  aim(x) {
    if (this.phase !== "playing") return;
    const r = RADIUS[this.heldKind];
    this.aimX = Math.min(Math.max(x, r + 1), this.world.width - r - 1);
  }

  drop() {
    if (!this.canDrop) return;
    const body = this.world.spawn(this.heldKind, this.aimX);
    this.juice.noteDrop(body);
    this.heldKind = this.nextKind;
    this.nextKind = drawKind(this.rng);
    this.aim(this.aimX); // re-clamp for the new fruit's radius
    this.dropCooldown = 0.45;
  }

  endRun() {
    this.phase = "over";
    this.newBest = this.best > 0 && this.grams > this.best;
    this.best = Math.max(this.best, this.grams);
    todaysBest.write(this.day, this.best);
    this.overAt = this.time;
  }
}

/* ── 7. The scene ─────────────────────────────────────────── */
/* StagePlan.swift for a tall screen, in the app's points: the phone on
   the page is laid out as an iPhone 402 points wide, then scaled, so the
   jar sits exactly where it sits on a real phone. */

const APP_WIDTH = 402;
const INSET_TOP = 62, INSET_BOTTOM = 34;
const WORLD_WIDTH = 340 + 24, DROP_ZONE = 90, WORLD_HEIGHT = DROP_ZONE + 470 + 14;

/* Where finished jars stand: on the wall above the jar when there's room,
   otherwise tucked into the corner of the drop zone. */
class ShelfSpot {
  constructor(left, right, y, jarHeight) {
    this.left = left;
    this.right = right;
    this.y = y;
    this.jarHeight = jarHeight;
    this.pitch = jarHeight * 1.04;
    this.capacity = Math.max(1, Math.trunc((right - left - 12) / this.pitch));
  }
  /* The middle of the base of jar `i`. */
  slot(i) { return [this.left + 6 + this.jarHeight * 0.37 + i * this.pitch, this.y]; }
}

function stagePlan(width, height) {
  const safeY = INSET_TOP, safeH = Math.max(height - INSET_TOP - INSET_BOTTOM, 1);
  const pad = 16, header = 56, captionHeight = 30;
  const bx = pad, by = safeY + header, bw = width - 2 * pad, bh = safeH - header - captionHeight;
  const scale = Math.max(Math.min(bw / WORLD_WIDTH, bh / WORLD_HEIGHT), 0.1);
  // Standing on the bottom of its box, so spare height becomes wall above.
  const originX = bx + bw / 2 - 340 * scale / 2;
  const originY = by + bh - (470 + 14) * scale;
  const hud = { x: pad, y: safeY + 4, w: width - 2 * pad, h: header - 8 };
  const caption = { x: pad, y: safeY + safeH - captionHeight, w: width - 2 * pad, h: captionHeight };
  const dropTop = originY - DROP_ZONE * scale;
  const wall = dropTop - (hud.y + hud.h + 4);
  const jarLeft = originX - 4 * scale, jarRight = originX + 344 * scale;
  const shelf = wall >= 44
    ? new ShelfSpot(jarLeft + 6, jarRight - 6, dropTop - 8, Math.min(wall - 18, 50))
    : new ShelfSpot(originX + 2 * scale, originX + 182 * scale, originY - 58 * scale, 26 * scale);
  return {
    width, height, hud, caption, shelf,
    frame: new WorldFrame(scale, originX, originY),
    // The jar stands a little way into the counter's top.
    floorY: originY + 466 * scale,
  };
}

/* What doesn't move: the wall, the lamp at night and the counter. */
function paintBackdrop(c, plan, night, pixelsPerPoint) {
  paintMintaBackground(c, plan.width, plan.height, night, pixelsPerPoint);
  if (night) {
    // A pool of lamplight on the wall behind the jar.
    fill(c, box(0, 0, plan.width, plan.height), radial(c, plan.frame.x(170), plan.frame.y(-40), 0,
      Math.max(plan.width, plan.height) * 0.7, even([rgb(0xF0CF78, 0.13), rgb(0xF0CF78, 0)])));
  }
  paintCounter(c, plan.floorY, plan.height, plan.width, plan.frame.scale, night);
}

/* One frame of the jar: JarScene.paint, minus the backdrop. */
function paintScene(c, view) {
  const { plan, game, night } = view;
  const f = plan.frame, s = f.scale;
  const world = game.world, juice = game.juice, time = game.time;

  paintShelf(c, view);

  c.save();
  const [sx, sy] = view.still ? [0, 0] : juice.shake(time);
  c.translate(sx * s, sy * s);
  paintBack(c, f, world.width, world.height, night);
  paintMouthLine(c, view);
  // Leaves and stems may reach past a fruit's circle; the glass keeps them
  // in, as it keeps the fruit.
  c.save();
  const left = f.x(-1);
  c.beginPath();
  c.rect(left, -plan.height, f.x(world.width + 1) - left, plan.height + f.y(world.height + 6));
  c.clip();
  paintFruits(c, view);
  paintGhosts(c, view);
  c.restore();
  paintFront(c, f, world.width, world.height, night);
  paintRings(c, view);
  paintDroplets(c, view);
  paintPopups(c, view);
  c.restore();

  paintAim(c, view);
  paintJarLid(c, view);
  paintFlights(c, view);
}

function paintFruits(c, view) {
  const { juice, time } = view.game;
  // Bottom first, so a fruit's shadow falls on the ones below it.
  const bodies = view.game.world.bodies.slice().sort((a, b) => b.y - a.y);
  for (const b of bodies) {
    const m = juice.motions.get(b.id);
    const pop = Juice.pop(m ? m.bornAt : null, time);
    const squash = m ? Juice.squash(m, time) : 0;
    const stretch = m ? Juice.stretch(m) : 0;
    paintFruit(c, view, b.kind,
      // Squash keeps the bottom planted where the physics put it.
      b.x, b.y + RADIUS[b.kind] * squash, m ? m.angle : 0,
      pop * (1 + squash * 0.75) * (1 - stretch * 0.5),
      pop * (1 - squash) * (1 + stretch));
  }
}

function paintGhosts(c, view) {
  const { juice, time } = view.game;
  for (const g of juice.ghosts) {
    const t = clamp((time - g.birth) / GHOST_TIME, 0, 1);
    const e = t * t;
    paintFruit(c, view, g.kind,
      g.fromX + (g.toX - g.fromX) * e, g.fromY + (g.toY - g.fromY) * e,
      g.angle, 1 - 0.25 * t, 1 - 0.25 * t, 1 - 0.8 * t);
  }
}

function paintFruit(c, view, kind, x, y, angle, sx = 1, sy = 1, alpha = 1) {
  const f = view.plan.frame;
  const book = view.sprites;
  c.save();
  c.translate(f.x(x), f.y(y));
  if (sx !== 1 || sy !== 1) c.scale(sx, sy);
  if (alpha < 1) c.globalAlpha = alpha;
  book.draw(c, book.shadows[kind]);
  c.save();
  c.rotate(angle);
  book.draw(c, book.bodies[kind]);
  c.restore();
  book.draw(c, book.lights[kind]);
  c.restore();
}

function paintMouthLine(c, view) {
  const { plan, game, night } = view;
  const f = plan.frame, world = game.world;
  const warning = world.overflowWarning || game.phase === "over";
  stroke(c, segment(f.x(2), f.y(world.overflowY), f.x(world.width - 2), f.y(world.overflowY)),
    warning ? rgb(0xC97B4A, 0.85) : rgb(night ? 0xA8C8B6 : 0x3E6B52, night ? 0.25 : 0.2),
    1.6, "butt", "miter", [6, 5]);
}

function paintAim(c, view) {
  const { plan, game, night } = view;
  if (!game.canDrop) return;
  const f = plan.frame, s = f.scale, world = game.world, time = game.time;
  const held = game.heldKind;
  const r = RADIUS[held];
  const mx = f.x(game.aimX), my = f.y(0);
  const ink = night ? 0xA8C8B6 : 0x3E6B52;
  // A faint column where it will fall, and a dotted plumb line.
  fill(c, roundBox(mx - r * s, my, 2 * r * s, world.height * s, r * s), linear(c, 0, my, 0, my + world.height * s,
    even([rgb(ink, night ? 0.05 : 0.035), rgb(ink, 0)])));
  stroke(c, segment(mx, f.y(-40 + r), mx, f.y(world.height)),
    linear(c, mx, my, mx, f.y(world.height), even([rgb(ink, 0.3), rgb(ink, 0.02)])),
    2, "round", "miter", [1, 7]);
  const pop = Juice.pop(game.readySince, time);
  paintFruit(c, view, held, game.aimX, -40 + Math.sin(time * 3.1) * 1.2, Math.sin(time * 2.2) * 0.06, pop, pop);
}

/* The lid lifts off as a run starts, and comes back to try to close the
   jar whenever something pokes out of the mouth: sitting on the culprit,
   bumping, failing. At the end it gives up, crooked. */
function paintJarLid(c, view) {
  const { plan, game } = view;
  const p = game.juice.lid;
  if (p <= 0.01) return;
  const f = plan.frame, s = f.scale, world = game.world, time = game.time;
  const width = (world.width + 24) * s;
  const band = width * 0.085 / s;
  const closedY = -LIP - band / 2 + 3;
  let restY = closedY;
  let tilt = 0;
  const poking = world.bodies.filter(b => b.y - RADIUS[b.kind] < world.overflowY);
  if (poking.length) {
    const top = poking.reduce((a, b) => (b.y - RADIUS[b.kind] < a.y - RADIUS[a.kind] ? b : a));
    // Never higher than the top of the drop zone, so it stays in view.
    restY = Math.max(Math.min(closedY, top.y - RADIUS[top.kind] - band / 2 - 1), -DROP_ZONE);
    // Resting on one side lifts that side.
    tilt = -Math.max(-0.18, Math.min(0.18, (top.x - world.width / 2) / world.width * 0.45));
  }
  const over = game.phase === "over";
  const trying = poking.length > 0 && !over;
  const bump = trying && !view.still ? Math.abs(Math.sin(time * 5.5)) * 7 : 0;
  const wobble = trying && !view.still ? Math.sin(time * 3.7) * 0.05 : 0;
  const giveUp = over && poking.length ? (tilt >= 0 ? 0.12 : -0.12) : 0;
  const e = p * p * (3 - 2 * p);
  c.save();
  c.translate(f.x(world.width / 2), f.y(restY - bump - (1 - e) * 150));
  c.rotate((tilt + giveUp) * e + wobble);
  c.globalAlpha = Math.min(1, p * 2.5);
  paintLid(c, width);
  c.restore();
}

function paintShelf(c, view) {
  const { plan, game, night } = view;
  // The plank goes up with the first jar, just as long as it needs.
  if (game.finishedJars <= 0) return;
  const shelf = plan.shelf;
  const shown = Math.min(game.finishedJars, shelf.capacity);
  const right = Math.min(shelf.right, shelf.slot(Math.max(shown, 3) - 1)[0] + shelf.jarHeight * 0.37 + 10);
  paintShelfPlank(c, shelf.left, right, shelf.y, plan.frame.scale, night);
  const flying = new Set(game.juice.flights.map(fl => fl.slot));
  for (let i = 0; i < shown; i++) {
    if (flying.has(i)) continue;
    const [x, y] = shelf.slot(i);
    c.save();
    c.translate(x, y);
    paintMiniJar(c, shelf.jarHeight, i);
    c.restore();
  }
}

function paintFlights(c, view) {
  const { plan, game } = view;
  const f = plan.frame, shelf = plan.shelf;
  for (const flight of game.juice.flights) {
    const t = clamp((game.time - flight.birth) / FLIGHT_TIME, 0, 1);
    const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const x0 = f.x(flight.fromX), y0 = f.y(flight.fromY);
    const [x1, y1] = shelf.slot(Math.min(flight.slot, shelf.capacity - 1));
    const cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - 140;
    const u = 1 - e;
    const grow = Math.min(t / 0.12, 1);
    c.save();
    c.translate(u * u * x0 + 2 * u * e * cx + e * e * x1, u * u * y0 + 2 * u * e * cy + e * e * y1);
    c.rotate(Math.sin(t * Math.PI) * 0.25);
    paintMiniJar(c, shelf.jarHeight * (0.4 + 0.6 * grow) * (2.3 - 1.3 * e), flight.slot);
    c.restore();
  }
}

function paintRings(c, view) {
  const { plan, game } = view;
  const f = plan.frame;
  for (const ring of game.juice.rings) {
    const t = clamp((game.time - ring.birth) / 0.5, 0, 1);
    const x = f.x(ring.x), y = f.y(ring.y);
    const base = ring.radius * f.scale;
    if (t < 0.4) {
      const ft = t / 0.4;
      fill(c, circle(x, y, base * 1.3), radial(c, x, y, 0, base * 1.3, even([white(0.55 * (1 - ft)), white(0)])));
    }
    const color = ring.look === null ? 0xE8C468 : PALETTES[ring.look].juice;
    for (const [lag, width] of [[0, 3.2], [0.16, 1.8]]) {
      const tt = clamp((t - lag) / (1 - lag), 0, 1);
      if (tt <= 0) continue;
      const grow = 1 - (1 - tt) * (1 - tt);
      stroke(c, circle(x, y, base * (0.95 + 0.8 * grow)), rgb(color, 0.7 * (1 - tt)), Math.max(width * (1 - tt), 0.5));
    }
  }
}

function paintDroplets(c, view) {
  const { plan, game } = view;
  const f = plan.frame, s = f.scale;
  for (const d of game.juice.droplets) {
    const age = clamp((game.time - d.birth) / d.life, 0, 1);
    const r = Math.max(d.size * s * (1 - 0.45 * age), 0.6);
    c.save();
    c.globalAlpha = age < 0.7 ? 1 : (1 - age) / 0.3;
    c.translate(f.x(d.x), f.y(d.y));
    if (d.style === "juice" || d.style === "aril") {
      // Drops stretch along their flight.
      const speed = Math.sqrt(d.vx * d.vx + d.vy * d.vy);
      c.rotate(Math.atan2(d.vy, d.vx));
      const long = r * (1 + Math.min(speed * 0.0012, 0.8));
      fill(c, ellipse(-long, -r, long * 2, r * 2), rgb(d.style === "aril" ? 0xC42A45 : PALETTES[d.look].juice));
      fill(c, circle(-long * 0.3, -r * 0.35, r * 0.35), white(d.style === "aril" ? 0.7 : 0.45));
    } else if (d.style === "pip") {
      c.rotate(Math.atan2(d.vy, d.vx));
      fill(c, ellipse(-r, -r * 0.6, r * 2, r * 1.2), rgb(0x2B1B12));
    } else {
      const twinkle = 0.75 + 0.25 * Math.sin((game.time - d.birth) * 30 + d.x);
      fill(c, star(0, 0, 4, r * 1.6 * twinkle, r * 0.45), rgb(0xF5D46B));
      fill(c, circle(0, 0, r * 0.4), white(0.9));
    }
    c.restore();
  }
}

function paintPopups(c, view) {
  const { plan, game, night } = view;
  const f = plan.frame;
  const unit = Math.max(0.9, Math.min(f.scale, 1.5));
  c.textAlign = "center";
  c.textBaseline = "middle";
  for (const popup of game.juice.popups) {
    const t = clamp(game.time - popup.birth, 0, 1);
    const rise = 1 - (1 - t) * (1 - t);
    const size = (popup.jar ? 24 : 15) * unit * Juice.pop(popup.birth, game.time);
    c.save();
    c.globalAlpha = t < 0.6 ? 1 : (1 - t) / 0.4;
    c.shadowColor = rgb(night ? 0x131E1A : 0xFBF7EC);
    c.shadowBlur = 5 * view.pixelsPerPoint;
    c.font = `800 ${size.toFixed(2)}px ${ROUNDED}`;
    c.fillStyle = popup.jar ? rgb(night ? 0xF0CF78 : 0xB8862B) : rgb(night ? 0xF3EEE0 : 0x2E4A3E);
    c.fillText(`+${popup.grams} g`, f.x(popup.x), f.y(popup.y - 34 * rise));
    c.restore();
  }
}

/* ── 8. The page ──────────────────────────────────────────── */

/* Fruit rendered once per size and stamped every frame, as the app's
   SpriteBook does: the bodies turn as they roll, the light and shadow
   don't. A full jar holds fifty fruits; this keeps it smooth on a phone. */
class SpriteBook {
  constructor() {
    this.key = "";
    this.lightKey = "";
    this.bodies = [];
    this.lights = [];
    this.shadows = [];
  }

  prepare(frameScale, pixelsPerPoint, night) {
    const key = frameScale.toFixed(5) + "@" + pixelsPerPoint.toFixed(4);
    if (key !== this.key) {
      this.key = key;
      this.lightKey = "";
      this.bodies = RADIUS.map((radius, look) => {
        const r = radius * frameScale;
        return this.make(r * REACH, pixelsPerPoint, c => paintBody(c, look, r));
      });
    }
    const lightKey = key + (night ? "/night" : "/day");
    if (lightKey !== this.lightKey) {
      this.lightKey = lightKey;
      this.lights = RADIUS.map((radius, look) => {
        const r = radius * frameScale;
        return this.make(r, pixelsPerPoint, c => paintLight(c, look, r, night));
      });
      this.shadows = RADIUS.map(radius => {
        const r = radius * frameScale;
        return this.make(r * 1.25, pixelsPerPoint, c => paintShadow(c, r, night));
      });
    }
  }

  make(half, pixelsPerPoint, paint) {
    const side = Math.max(2, Math.ceil(half * 2 * pixelsPerPoint));
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = side;
    const c = canvas.getContext("2d");
    c.scale(side / (half * 2), side / (half * 2));
    c.translate(half, half);
    paint(c);
    return { canvas, half };
  }

  draw(c, sprite) {
    c.drawImage(sprite.canvas, -sprite.half, -sprite.half, sprite.half * 2, sprite.half * 2);
  }
}

const screen = document.getElementById("jarScreen");
const template = document.getElementById("jarTemplate");
const probe = document.createElement("canvas");
if (!screen || !template || !probe.getContext || !probe.getContext("2d") || typeof Path2D !== "function") return;

const tr = (key, values = {}) => {
  let text = typeof t === "function" ? t(key) : key;
  for (const [name, value] of Object.entries(values)) text = text.replace(`{${name}}`, value);
  return text;
};
const currentLang = () => (typeof lang === "string" ? lang : "en");

/* Swap the screenshot for the real thing. Without scripts the page keeps
   showing the screenshot. */
screen.classList.remove("phone__screen--shot");
screen.classList.add("phone__screen--jar");
screen.replaceChildren(template.content.cloneNode(true));
const part = name => screen.querySelector(`[data-jar="${name}"]`);
const canvas = part("canvas");
const ctx = canvas.getContext("2d");
const hud = part("hud");
const gramsEl = part("grams");
const lineEl = part("line");
const nextCanvas = part("next");
const hintEl = part("hint");
const overEl = part("over");
const caption = document.getElementById("jarCaption");
if (caption) caption.dataset.i18n = "confitura.demo.caption";

const darkQuery = matchMedia("(prefers-color-scheme: dark)");
const stillQuery = matchMedia("(prefers-reduced-motion: reduce)");
const mouseQuery = matchMedia("(hover: hover) and (pointer: fine)");

const game = new Game();
const sprites = new SpriteBook();
const backdrop = document.createElement("canvas");
const view = { plan: null, game, night: darkQuery.matches, still: stillQuery.matches, sprites, pixelsPerPoint: 1 };
let k = 1;            // CSS pixels per app point
let dpr = 1;
let onScreen = false;
let raf = 0;
let last = 0;
let shown = { grams: -1, line: "", next: -1, over: false };

/* Lays everything out from the size the phone's screen has now. */
function layout() {
  const width = screen.clientWidth, height = screen.clientHeight;
  if (!width || !height) return;
  k = width / APP_WIDTH;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  view.pixelsPerPoint = k * dpr;
  view.plan = stagePlan(APP_WIDTH, height / k);
  canvas.width = backdrop.width = Math.round(width * dpr);
  canvas.height = backdrop.height = Math.round(height * dpr);
  screen.style.setProperty("--k", k.toFixed(4));
  const px = v => `${(v * k).toFixed(2)}px`;
  const { hud: h, caption: cap } = view.plan;
  Object.assign(hud.style, { left: px(h.x), top: px(h.y), width: px(h.w), height: px(h.h) });
  Object.assign(hintEl.style, { left: px(cap.x), top: px(cap.y), width: px(cap.w), height: px(cap.h) });
  repaintStatic();
}

/* Whatever depends on the size or on day and night. */
function repaintStatic() {
  if (!view.plan) return;
  const b = backdrop.getContext("2d");
  b.setTransform(view.pixelsPerPoint, 0, 0, view.pixelsPerPoint, 0, 0);
  paintBackdrop(b, view.plan, view.night, view.pixelsPerPoint);
  sprites.prepare(view.plan.frame.scale, view.pixelsPerPoint, view.night);
  shown.next = -1;
  render();
}

function render() {
  if (!view.plan) return;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(backdrop, 0, 0);
  ctx.setTransform(view.pixelsPerPoint, 0, 0, view.pixelsPerPoint, 0, 0);
  paintScene(ctx, view);
  updateHud();
}

/* ── HUD: the score strip, the hint and the card ── */

/* "Oct 8", "8 d’oct.": worked out once per day and language. */
let dateMemo = { key: "", text: "" };
function dateLabel() {
  const key = currentLang() + game.day;
  if (dateMemo.key !== key) {
    let text = "";
    try {
      text = new Intl.DateTimeFormat(currentLang(), { day: "numeric", month: "short" }).format(new Date());
    } catch { /* no date, then */ }
    dateMemo = { key, text };
  }
  return dateMemo.text;
}

function lineText() {
  if (game.best === 0) return [tr("confitura.demo.today", { date: dateLabel() }), false];
  if (game.grams > game.best) return [tr("confitura.demo.newBest"), true];
  return [tr("confitura.demo.todayBest", { n: game.best }), false];
}

function updateHud(force = false) {
  if (force || shown.grams !== game.grams) {
    shown.grams = game.grams;
    gramsEl.textContent = `${game.grams} g`;
  }
  const [line, best] = lineText();
  if (force || shown.line !== line) {
    shown.line = line;
    lineEl.textContent = line;
    lineEl.classList.toggle("is-best", best);
  }
  if (force || shown.next !== game.nextKind) {
    shown.next = game.nextKind;
    paintNext();
  }
  if (game.showsResults !== shown.over) {
    shown.over = game.showsResults;
    if (shown.over) showCard(); else hideCard();
  }
}

/* The fruit after the one at the spout, in its saucer. */
function paintNext() {
  const side = Math.max(2, Math.round(44 * k * dpr));
  if (nextCanvas.width !== side) nextCanvas.width = nextCanvas.height = side;
  const c = nextCanvas.getContext("2d");
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, side, side);
  c.setTransform(side / 44, 0, 0, side / 44, 0, 0);
  c.translate(22, 23);
  paintWhole(c, game.nextKind, 11, view.night);
}

function updateHint() {
  hintEl.textContent = tr(mouseQuery.matches ? "confitura.demo.mouse" : "confitura.demo.touch");
}

function showCard() {
  part("made").textContent = tr("confitura.demo.made", { n: game.grams });
  part("record").hidden = !game.newBest;
  const jars = part("jars");
  jars.hidden = game.finishedJars === 0;
  jars.textContent = tr("confitura.demo.jars", { n: game.finishedJars });
  part("best").textContent = tr("confitura.demo.best", { n: game.best });
  const full = part("full");
  const url = typeof STORE_LINKS === "object" && STORE_LINKS.confitura;
  if (url) {
    const link = document.createElement("a");
    link.href = url;
    link.textContent = tr("confitura.demo.store");
    full.replaceChildren(document.createTextNode(tr("confitura.demo.full") + " "), link);
  } else {
    full.textContent = tr("confitura.demo.soon");
  }
  overEl.classList.add("is-on");
  overEl.removeAttribute("inert");
  if (document.activeElement === canvas) part("replay").focus();
}

function hideCard() {
  overEl.classList.remove("is-on");
  overEl.setAttribute("inert", "");
}

function restart() {
  const hadFocus = overEl.contains(document.activeElement);
  game.reset();
  hideCard();
  shown.over = false;
  updateHud(true);
  if (hadFocus) canvas.focus();
  wake();
}

/* ── Input: slide to aim, release to drop ── */

function aimAt(event) {
  const rect = canvas.getBoundingClientRect();
  const points = (event.clientX - rect.left) * (APP_WIDTH / rect.width);
  game.aim((points - view.plan.frame.ox) / view.plan.frame.scale);
}

let pressed = null;
canvas.addEventListener("pointerdown", e => {
  if (e.button > 0 || !view.plan) return;
  pressed = e.pointerId;
  canvas.setPointerCapture?.(e.pointerId);
  aimAt(e);
  wake();
});
canvas.addEventListener("pointermove", e => {
  // A mouse aims just by hovering; a finger aims while it's down.
  if (!view.plan || (pressed !== e.pointerId && e.pointerType !== "mouse")) return;
  aimAt(e);
  wake();
});
canvas.addEventListener("pointerup", e => {
  if (pressed !== e.pointerId) return;
  pressed = null;
  aimAt(e);
  game.drop();
  wake();
});
/* The page took the gesture to scroll: no drop. */
canvas.addEventListener("pointercancel", () => { pressed = null; });

canvas.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    game.aim(game.aimX + (e.key === "ArrowLeft" ? -1 : 1) * (e.shiftKey ? 40 : 12));
  } else if (e.key === " " || e.key === "Enter") {
    game.drop();
  } else {
    return;
  }
  e.preventDefault();
  wake();
});

part("again").addEventListener("click", restart);
part("replay").addEventListener("click", restart);

/* ── The loop: it only runs while the jar is on screen ── */

const shouldRun = () => onScreen && !document.hidden && !game.resting;

function frame(now) {
  raf = 0;
  const dt = last ? Math.min((now - last) / 1000, 0.25) : 1 / 60;
  last = now;
  game.tick(dt);
  render();
  if (shouldRun()) raf = requestAnimationFrame(frame);
}

function wake() {
  if (raf || !shouldRun()) return;
  last = 0;
  raf = requestAnimationFrame(frame);
}

new IntersectionObserver(([entry]) => {
  onScreen = entry.isIntersecting;
  wake();
}, { threshold: 0.2 }).observe(screen);
document.addEventListener("visibilitychange", wake);

new ResizeObserver(layout).observe(screen);
darkQuery.addEventListener("change", () => { view.night = darkQuery.matches; repaintStatic(); });
stillQuery.addEventListener("change", () => { view.still = stillQuery.matches; render(); });
mouseQuery.addEventListener("change", updateHint);
document.addEventListener("langchange", () => {
  updateHint();
  updateHud(true);
  if (shown.over) showCard();
});

/* app.js has already translated the page; the demo arrived after that. */
screen.querySelectorAll("[data-i18n]").forEach(el => { el.textContent = tr(el.dataset.i18n); });
screen.querySelectorAll("[data-i18n-aria]").forEach(el => { el.setAttribute("aria-label", tr(el.dataset.i18nAria)); });
if (caption) caption.textContent = tr("confitura.demo.caption");
hideCard();
updateHint();
layout();
updateHud(true);
})();
