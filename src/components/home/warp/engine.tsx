"use client";

// Warp Carousel by Louis Studios.
// 140+ more hand-made React components at https://studios.lou15.com/?ref=21st-code

import * as React from "react";

/** The small graphic under each numeral. */
export type WarpCardDetail = "slider" | "ring" | "wave" | "cross" | "none";

/** One card on the ring. */
export interface WarpCard {
  /** Two-line title, top left. Use "\n" for the line break. */
  title: string;
  /** The big thin numeral, for example "25". */
  value: string;
  /** Small superscript unit after the numeral, for example "%". */
  unit?: string;
  /** Small label at the bottom left. */
  footer?: string;
  /** Mesh gradient: 42 colours, a 6 by 7 grid read row by row from the top left, smoothed with a B-spline. Fewer colours are spread evenly over the grid. */
  mesh?: string[];
  /** Numeral fill, left to right. */
  numeral?: [string, string];
  /** Colour of the glow this card casts onto the top and bottom edges while it faces the viewer. */
  glow?: string;
  /** The small graphic under the numeral. */
  detail?: WarpCardDetail;
  /** Detail accent colour: slider knob glow, waveform marker, ring ticks. */
  accent?: string;
  /** Labels for the detail: slider ends, or the crosshair pill and its two badges. */
  labels?: string[];
  /** OFY: preloaded art photo drawn as a glowing plate in the card body. */
  image?: HTMLImageElement;
  /** OFY: preloaded service icon, tinted onto the frosted hover face. */
  icon?: HTMLImageElement;
  /** OFY: the category's three offerings, each with its own icon and description, shown when hovered. */
  points?: { label: string; copy: string; icon?: HTMLImageElement }[];
}

/** OFY: the frosted glass face a card turns into while hovered. */
export interface WarpHoverGlass {
  /** Glass body: deep black on the red field, red on the black field. */
  tint: string;
  /** Icon, label and numeral ink on the glass. */
  ink: string;
  /** Drifting smoke blooms seen through the glass, brightest first. */
  smoke: readonly string[];
}

export interface WarpCarouselProps {
  /** The cards on the ring, in order. The next card always enters from the right. Four is the designed count; fewer are repeated to fill the ring. */
  cards: WarpCard[];
  /** Controlled front card index. Pair it with onIndexChange. */
  index?: number;
  /** Front card when uncontrolled. */
  defaultIndex?: number;
  /** Called when the front card should change: autoplay, drag, click, or arrow keys. */
  onIndexChange?: (index: number) => void;
  /** Spin to the next card on a timer. */
  autoplay?: boolean;
  /** Seconds between autoplay spins, hold included. */
  interval?: number;
  /** Seconds one autoplay spin takes to travel its step; the rest of `interval` is a still hold. */
  spinSeconds?: number;
  /** Cards advanced per autoplay spin. One keeps every card readable in a single pass. */
  step?: number;
  /** OFY: hovering a card turns it into this frosted glass face and pauses autoplay. */
  hoverGlass?: WarpHoverGlass;
  /** Stage colour behind the ring. */
  background?: string;
  /** Overrides every card's own glow colour for the top and bottom glows. */
  glow?: string;
  /** Strength of the wide-lens flare at the left and right edges, 0 to 1. */
  warp?: number;
  /** Font stack for all card copy. */
  font?: string;
  /** Freeze the animation at this many seconds of autoplay time. For stills and tests. */
  seconds?: number;
  /** Accessible name for the carousel region. */
  ariaLabel?: string;
  /** Extra class on the outer element. */
  className?: string;
  /** Extra style on the outer element. The root fills its container (width and height 100%), falls back to a 5 / 4 aspect ratio when the container has no height, and is never shorter than 420 px. */
  style?: React.CSSProperties;
}

const DEFAULT_FONT =
  '"Inter", "SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, system-ui, "Helvetica Neue", Arial, sans-serif';


/* ------------------------------------------------------------------ */
/* Geometry: measured from the reference and fitted frame by frame.    */
/* Stage units: the stage is 720 units wide; a card is 256 by 320.     */
/* ------------------------------------------------------------------ */

const CW = 256;
const CH = 320;
const CR = 10;
const FOCAL = 734.103;
const G = {
  qA: 0.46401,
  XLA: 165.774,
  zA: 35.354,
  psiA: 1.44638,
  a1: 1.31454,
  a2: 1.10948,
  qB: 0.74999,
  XB: 204.525,
  ZB: 355.405,
  bB: 0.69311,
  bE: 0.04614,
  vC: 203.134,
  aC: 229.260,
  kB: 0.01087,
  bP: 0.99129,
  qPR: 1.01828,
  bPL: 1.00920,
  qPL: 1.07139,
};

type Pose = [number, number, number];

/** Pose of a card at ring offset q (0 front, +1 right, -1 left): centre x, depth behind the front plane, yaw. */
function poseAt(q0: number): Pose {
  let q = q0;
  if (Math.abs(q) < 1) q -= G.kB * Math.sin(Math.PI * q) ** 2;
  const s = q < 0 ? -1 : 1;
  const a = Math.abs(q);
  const half = CW / 2;
  if (a <= G.qA) {
    const t = a / G.qA;
    const xl = -half + (G.XLA + half) * Math.pow(t, G.a1);
    const zl = G.zA * t ** 4;
    const psi = G.psiA * Math.pow(t, G.a2);
    return [s * (xl + half * Math.cos(psi)), zl + half * Math.sin(psi), s * psi];
  }
  const dXL = ((G.XLA + half) * G.a1) / G.qA;
  const dZL = (G.zA * 4) / G.qA;
  const dps = (G.psiA * G.a2) / G.qA;
  // hinge (the edge away from the centre)
  let Hx: number;
  let Hz: number;
  if (a <= G.qB) {
    const L = G.qB - G.qA;
    const t = (a - G.qA) / L;
    const hx = G.XLA + CW * Math.cos(G.psiA);
    const hz = G.zA + CW * Math.sin(G.psiA);
    const dhx = dXL - CW * Math.sin(G.psiA) * dps;
    const dhz = dZL + CW * Math.cos(G.psiA) * dps;
    const h00 = 2 * t ** 3 - 3 * t ** 2 + 1;
    const h10 = t ** 3 - 2 * t ** 2 + t;
    const h01 = -2 * t ** 3 + 3 * t ** 2;
    const h11 = t ** 3 - t ** 2;
    Hx = h00 * hx + h10 * L * dhx * G.bB + h01 * G.XB + h11 * L * G.vC * G.bE;
    Hz = h00 * hz + h10 * L * dhz * G.bB + h01 * G.ZB;
  } else {
    const d = a - G.qB;
    Hx = G.XB + G.vC * d + G.aC * d * d;
    Hz = G.ZB;
  }
  // yaw finishes later on the outgoing side, as in the reference
  const qP = s < 0 ? G.qPL : G.qPR;
  const bP = s < 0 ? G.bPL : G.bP;
  const LP = qP - G.qA;
  const tp = Math.min(1, (a - G.qA) / LP);
  const psi = (2 * tp ** 3 - 3 * tp ** 2 + 1) * G.psiA + (tp ** 3 - 2 * tp ** 2 + tp) * LP * dps * bP + (-2 * tp ** 3 + 3 * tp ** 2) * Math.PI;
  return [s * (Hx - half * Math.cos(psi)), Hz - half * Math.sin(psi), s * psi];
}

/* Spin curve: ring progress over one autoplay step, in reference frames (30 fps). */
const TK = [0, 3, 6, 8, 10, 11, 12, 13, 14, 16, 18, 21, 25, 30, 36, 45, 55, 70, 88, 110];
const TB = [0, 0.02175, 0.12069, 0.22549, 0.35493, 0.43254, 0.51436, 0.5952, 0.6751, 0.83199, 0.9709, 1.12669, 1.27958, 1.40975, 1.53561, 1.68385, 1.79183, 1.89191, 1.95233, 2];
const DRIFT = 0.06511; // the ring keeps creeping past rest by this much before the next spin
const REST_PHASE = 81.828; // where reference frame 1 sits inside a step, in frames
const STEP_FRAMES = 110;

const SLOPES = (() => {
  const n = TK.length;
  const h = TK.slice(1).map((x, i) => x - TK[i]);
  const dl = h.map((hi, i) => (TB[i + 1] - TB[i]) / hi);
  const d = new Array(n).fill(0);
  for (let k = 1; k < n - 1; k++) {
    if (dl[k - 1] * dl[k] <= 0) d[k] = 0;
    else {
      const w1 = 2 * h[k] + h[k - 1];
      const w2 = h[k] + 2 * h[k - 1];
      d[k] = (w1 + w2) / (w1 / dl[k - 1] + w2 / dl[k]);
    }
  }
  const v = (dl[0] + dl[n - 2]) / 2;
  d[0] = v;
  d[n - 1] = v;
  return d;
})();

/** Normalised spin curve over 110 reference frames: 0 at the start, 1 at the end, with the reference's slow creep at both ends. */
function spin(frames: number): number {
  if (frames <= 0) return 0;
  if (frames >= STEP_FRAMES) return 1;
  let i = 0;
  while (i < TK.length - 2 && frames > TK[i + 1]) i++;
  const h = TK[i + 1] - TK[i];
  const t = (frames - TK[i]) / h;
  const h00 = 2 * t ** 3 - 3 * t ** 2 + 1;
  const h10 = t ** 3 - 2 * t ** 2 + t;
  const h01 = -2 * t ** 3 + 3 * t ** 2;
  const h11 = t ** 3 - t ** 2;
  return (h00 * TB[i] + h10 * h * SLOPES[i] + h01 * TB[i + 1] + h11 * h * SLOPES[i + 1]) / 2;
}

/** The spin curve fitted into `n` frames: the fast part keeps its timing, only the slow tail stretches. */
function spinN(frames: number, n: number): number {
  if (n <= STEP_FRAMES + 0.5) return spin((frames * STEP_FRAMES) / Math.max(1, n));
  const knee = 80;
  if (frames <= knee) return spin(frames);
  return spin(knee + ((frames - knee) * (STEP_FRAMES - knee)) / (n - knee));
}

const LEAD = (STEP_FRAMES - REST_PHASE) / 30;

/** Ring progress for pure autoplay at time t (seconds) after mount, starting on card `start`. Matches the live loop. */
function autoplayProgress(t: number, start: number, step: number, interval: number, spinSeconds: number): number {
  if (t < LEAD) return start - step + DRIFT + step * spin(REST_PHASE + t * 30);
  const k = Math.floor((t - LEAD) / interval);
  const tau = (t - LEAD - k * interval) * 30;
  return start + k * step + DRIFT + step * spinN(tau, Math.max(1, spinSeconds) * 30);
}

/* ------------------------------------------------------------------ */
/* Colour helpers                                                      */
/* ------------------------------------------------------------------ */

function parseColor(c: string, fallback: [number, number, number] = [0, 0, 0]): [number, number, number] { // ls:keep
  const s = (c || "").trim();
  let m = /^#([0-9a-f]{3,8})$/i.exec(s);
  if (m) {
    let h = m[1];
    if (h.length <= 4) h = h.split("").map((x) => x + x).join("");
    const n = parseInt(h.slice(0, 6), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  m = /^rgba?\(([^)]+)\)$/i.exec(s);
  if (m) {
    const p = m[1].split(/[ ,/]+/).filter(Boolean).map((x) => parseFloat(x));
    return [p[0] || 0, p[1] || 0, p[2] || 0];
  }
  if (typeof document !== "undefined" && s) {
    const cv = document.createElement("canvas");
    cv.width = cv.height = 1;
    const cx = cv.getContext("2d");
    if (cx) {
      cx.fillStyle = s;
      cx.fillRect(0, 0, 1, 1);
      const d = cx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2]];
    }
  }
  return fallback;
}

function rgba(c: [number, number, number], a: number) {
  return `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${a})`;
}

/* ------------------------------------------------------------------ */
/* Card painter                                                        */
/* ------------------------------------------------------------------ */

function bspline(t: number, out: number[]) {
  const it = 1 - t;
  out[0] = (it * it * it) / 6;
  out[1] = (3 * t * t * t - 6 * t * t + 4) / 6;
  out[2] = (-3 * t * t * t + 3 * t * t + 3 * t + 1) / 6;
  out[3] = (t * t * t) / 6;
}

function meshGrid(mesh: string[] | undefined): [number, number, number][] {
  const fallback = ["#1d1d3a", "#3b2f8f", "#2a6fd6", "#0d0d24"];
  const src = mesh && mesh.length ? mesh : fallback;
  const cols = src.map((c) => parseColor(c));
  const out: [number, number, number][] = [];
  for (let j = 0; j < 7; j++)
    for (let i = 0; i < 6; i++) {
      if (cols.length === 42) out.push(cols[j * 6 + i]);
      else {
        const k = Math.min(cols.length - 1, Math.round(((j * 6 + i) / 41) * (cols.length - 1)));
        out.push(cols[k]);
      }
    }
  return out;
}

function paintMesh(ctx: CanvasRenderingContext2D, w: number, h: number, mesh: string[] | undefined) {
  const grid = meshGrid(mesh);
  const img = ctx.createImageData(w, h);
  const d = img.data;
  const wx = new Float32Array(w * 4);
  const ix = new Int32Array(w * 4);
  const tmp = [0, 0, 0, 0];
  for (let x = 0; x < w; x++) {
    const u = ((x + 0.5) / w) * 5;
    const i = Math.floor(u);
    bspline(u - i, tmp);
    for (let k = 0; k < 4; k++) {
      wx[x * 4 + k] = tmp[k];
      ix[x * 4 + k] = Math.min(5, Math.max(0, i - 1 + k));
    }
  }
  const row = new Float32Array(6 * 3);
  let seed = 1234567;
  for (let y = 0; y < h; y++) {
    const v = ((y + 0.5) / h) * 6;
    const j = Math.floor(v);
    bspline(v - j, tmp);
    row.fill(0);
    for (let k = 0; k < 4; k++) {
      const jj = Math.min(6, Math.max(0, j - 1 + k));
      const wy = tmp[k];
      for (let i = 0; i < 6; i++) {
        const c = grid[jj * 6 + i];
        row[i * 3] += c[0] * wy;
        row[i * 3 + 1] += c[1] * wy;
        row[i * 3 + 2] += c[2] * wy;
      }
    }
    for (let x = 0; x < w; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let k = 0; k < 4; k++) {
        const wgt = wx[x * 4 + k];
        const i3 = ix[x * 4 + k] * 3;
        r += row[i3] * wgt;
        g += row[i3 + 1] * wgt;
        b += row[i3 + 2] * wgt;
      }
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      const n = (seed / 0x7fffffff - 0.5) * 1.6;
      const o = (y * w + x) * 4;
      d[o] = r + n;
      d[o + 1] = g + n;
      d[o + 2] = b + n;
      d[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}

function fontStr(weight: number, px: number, family: string) {
  return `${weight} ${px}px ${family}`;
}

/** Font size whose digit cap height equals `cap` pixels. */
function sizeForCap(ctx: CanvasRenderingContext2D, weight: number, family: string, cap: number, sample = "0") {
  ctx.font = fontStr(weight, 100, family);
  const m = ctx.measureText(sample);
  const asc = m.actualBoundingBoxAscent || 71;
  return (cap / asc) * 100;
}

function paintCard(cv: HTMLCanvasElement, card: WarpCard, family: string) {
  const w = cv.width;
  const h = cv.height;
  const ctx = cv.getContext("2d");
  if (!ctx) return;
  const k = w / CW;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);
  paintMesh(ctx, w, h, card.mesh);
  ctx.setTransform(k, 0, 0, k, 0, 0);
  ctx.textBaseline = "alphabetic";
  const white: [number, number, number] = [255, 255, 255];
  const accent = parseColor(card.accent || "#ffffff");

  // OFY: art photo plate in the card body, glowing onto the mesh
  if (card.image) {
    const px = 8;
    const py = 46;
    const pw = 240;
    const ph = 238;
    const hot = parseColor((card.numeral && card.numeral[1]) || card.accent || "#ffffff");

    // OFY: inner bloom — the plate sits on a hot core, so the body reads as a lit volume
    const bloom = ctx.createRadialGradient(128, 160, 6, 128, 160, 172);
    bloom.addColorStop(0, rgba(hot, 0.34));
    bloom.addColorStop(0.55, rgba(hot, 0.16));
    bloom.addColorStop(1, rgba(hot, 0));
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = bloom;
    ctx.fillRect(0, 0, CW, CH);
    ctx.restore();

    ctx.save();
    ctx.shadowColor = rgba(accent, 0.55);
    ctx.shadowBlur = 18 * k;
    ctx.fillStyle = "#0A0507";
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, 10);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, 10);
    ctx.clip();
    const iw = card.image.naturalWidth || 720;
    const ih = card.image.naturalHeight || 1280;
    // OFY: cover — the art fills the plate, so the image reads bigger than the card margin
    const scale = Math.max(pw / iw, ph / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    ctx.drawImage(card.image, px + (pw - dw) / 2, py + (ph - dh) / 2, dw, dh);
    // OFY: bottom scrim so the numeral stays legible over the art
    const scrim = ctx.createLinearGradient(0, py + ph * 0.45, 0, py + ph);
    scrim.addColorStop(0, "rgba(10, 5, 7, 0)");
    scrim.addColorStop(1, "rgba(10, 5, 7, 0.9)");
    ctx.fillStyle = scrim;
    ctx.fillRect(px, py, pw, ph);
    ctx.restore();

    // OFY: plate lift — a light inset edge instead of a pasted-on photo
    ctx.strokeStyle = rgba(white, 0.35);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(px + 0.5, py + 0.5, pw - 1, ph - 1, 9.5);
    ctx.stroke();

    // OFY: card rim — a lit silhouette that survives on both the red body and the black field
    const rimHot: [number, number, number] = [
      hot[0] + (white[0] - hot[0]) * 0.45,
      hot[1] + (white[1] - hot[1]) * 0.45,
      hot[2] + (white[2] - hot[2]) * 0.45,
    ];
    ctx.strokeStyle = rgba(rimHot, 0.5);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(0.9, 0.9, CW - 1.8, CH - 1.8, 8.8);
    ctx.stroke();

    // OFY: top sheen — brighter along the top edge, fading out toward the sides
    const sheenHot: [number, number, number] = [
      hot[0] + (white[0] - hot[0]) * 0.7,
      hot[1] + (white[1] - hot[1]) * 0.7,
      hot[2] + (white[2] - hot[2]) * 0.7,
    ];
    const sheen = ctx.createLinearGradient(0, 0, CW, 0);
    sheen.addColorStop(0, rgba(sheenHot, 0));
    sheen.addColorStop(0.22, rgba(sheenHot, 0.35));
    sheen.addColorStop(0.5, rgba(sheenHot, 0.7));
    sheen.addColorStop(0.78, rgba(sheenHot, 0.35));
    sheen.addColorStop(1, rgba(sheenHot, 0));
    ctx.strokeStyle = sheen;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(10, 1.1);
    ctx.lineTo(CW - 10, 1.1);
    ctx.stroke();
  }

  // title and footer
  const small = sizeForCap(ctx, 300, family, 7.9, "H");
  ctx.font = fontStr(300, small, family);
  ctx.fillStyle = rgba(white, 0.9);
  const lines = (card.title || "").split("\n");
  lines.slice(0, 2).forEach((ln, i) => ctx.fillText(ln, 17, 37 + i * 14));
  if (card.footer) {
    ctx.fillStyle = rgba(white, 0.88);
    ctx.fillText(card.footer, 17, 295);
  }

  // numeral
  const big = sizeForCap(ctx, 300, family, card.image ? 34 : 50);
  const unitPx = big * 0.31;
  ctx.font = fontStr(300, big, family);
  const value = card.value || "";
  const vw = ctx.measureText(value).width;
  ctx.font = fontStr(300, unitPx, family);
  const uw = card.unit ? ctx.measureText(card.unit).width + 4 : 0;
  const detail = card.detail || "none";
  // OFY: image cards carry a small left-aligned index numeral under the plate
  const centre = card.image ? 17 : detail === "wave" ? 112 : detail === "cross" ? 106 : 127;
  const x0 = card.image ? 17 : centre - (vw + uw) / 2 + (detail === "cross" ? uw / 2 : 0);
  const n0 = parseColor((card.numeral && card.numeral[0]) || "#ffffff");
  const n1 = parseColor((card.numeral && card.numeral[1]) || "#ffffff");
  const grad = ctx.createLinearGradient(x0, 0, x0 + vw, 0);
  grad.addColorStop(0, rgba(n0, 1));
  grad.addColorStop(1, rgba(n1, 1));

  // detail under the numeral (drawn first so the numeral sits on top)
  if (detail === "ring") {
    const cx0 = 126;
    const cy0 = 156;
    for (let i = 0; i < 132; i++) {
      const a = (i / 132) * Math.PI * 2 - Math.PI / 2;
      const seedLen = 0.5 + 0.5 * Math.sin(i * 12.9898) * Math.sin(i * 4.1414 + 1.3);
      const top = 0.5 + 0.5 * Math.cos(a + Math.PI / 2);
      const len = 4 + 4.5 * Math.abs(seedLen) + 2 * top;
      const fade = 0.22 + 0.5 * top * top;
      ctx.strokeStyle = rgba(accent, fade);
      ctx.lineWidth = 1.0 + 0.7 * top;
      const r1 = 68;
      ctx.beginPath();
      ctx.moveTo(cx0 + Math.cos(a) * r1, cy0 + Math.sin(a) * r1);
      ctx.lineTo(cx0 + Math.cos(a) * (r1 + len), cy0 + Math.sin(a) * (r1 + len));
      ctx.stroke();
    }
  } else if (detail === "slider") {
    const pct = Math.max(0, Math.min(100, parseFloat(value) || 0)) / 100;
    const xa = 24;
    const xb = 232;
    const y = 197.5;
    const kx = xa + 4 + (xb - xa - 8) * pct * 0.86;
    const lg = ctx.createLinearGradient(xa, 0, xb, 0);
    lg.addColorStop(0, rgba(accent, 0.15));
    lg.addColorStop(Math.max(0.01, (kx - xa) / (xb - xa)), rgba(accent, 0.85));
    lg.addColorStop(1, rgba(accent, 0.35));
    ctx.fillStyle = lg;
    ctx.fillRect(xa, y - 0.6, xb - xa, 1.2);
    ctx.save();
    ctx.shadowColor = rgba(accent, 0.95);
    ctx.shadowBlur = 9 * k;
    ctx.fillStyle = rgba(white, 1);
    ctx.beginPath();
    ctx.arc(kx, y, 4.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    const lab = card.labels || [];
    const lpx = sizeForCap(ctx, 400, family, 5.2, "H");
    ctx.font = fontStr(400, lpx, family);
    ctx.fillStyle = rgba(white, 0.6);
    if (lab[0]) ctx.fillText(lab[0], 14, 208);
    if (lab[1]) {
      ctx.textAlign = "right";
      ctx.fillText(lab[1], 230, 208);
      ctx.textAlign = "left";
    }
  } else if (detail === "wave") {
    ctx.fillStyle = "rgba(20, 0, 8, 0.32)"; // ls:keep
    ctx.beginPath();
    ctx.arc(27, 157, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = rgba(white, 0.75);
    ctx.lineWidth = 0.9;
    const plus = (px: number, py: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(px - r, py);
      ctx.lineTo(px + r, py);
      ctx.moveTo(px, py - r);
      ctx.lineTo(px, py + r);
      ctx.stroke();
    };
    plus(27, 157, 3);
    plus(199, 157, 3);
    for (let i = 0; i < 56; i++) {
      const x = 43 + i * 3;
      const r1 = Math.abs(Math.sin(i * 1.7 + 0.4) * Math.cos(i * 0.53));
      const hh = 1.5 + 6.5 * r1;
      const mark = i === 23;
      ctx.fillStyle = mark ? rgba(accent, 0.95) : rgba(white, 0.3);
      ctx.fillRect(x, 204 - (mark ? 8 : hh), mark ? 1.4 : 0.9, mark ? 16 : hh * 2);
    }
  } else if (detail === "cross") {
    ctx.fillStyle = rgba(white, 0.28);
    ctx.fillRect(105.5, 66, 0.8, 182);
    ctx.fillRect(12, 156.5, 186, 0.8);
    const lab = card.labels || [];
    // ghost numeral
    ctx.font = fontStr(300, big * 0.72, family);
    ctx.fillStyle = rgba(white, 0.07);
    ctx.textAlign = "center";
    ctx.fillText(String(Math.max(0, (parseFloat(value) || 0) - 8)), 106, 122);
    ctx.textAlign = "left";
    const badge = (x: number, y: number, t: string) => {
      ctx.fillStyle = "rgba(10, 0, 30, 0.35)"; // ls:keep
      ctx.beginPath();
      ctx.arc(x, y, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = rgba(white, 0.7);
      ctx.font = fontStr(500, 4.2, family);
      ctx.textAlign = "center";
      ctx.fillText(t, x, y + 1.5);
      ctx.textAlign = "left";
    };
    if (lab[1]) badge(28, 137, lab[1]);
    if (lab[2]) badge(181, 170, lab[2]);
    if (lab[0]) {
      ctx.font = fontStr(400, 5.2, family);
      const tw = ctx.measureText(lab[0]).width;
      const px = 208 - tw - 10;
      ctx.fillStyle = rgba(white, 0.1);
      ctx.beginPath();
      ctx.roundRect(px, 25, tw + 10, 11, 3);
      ctx.fill();
      ctx.fillStyle = rgba(white, 0.55);
      ctx.fillText(lab[0], px + 5, 32.5);
    }
  }

  ctx.save();
  ctx.shadowColor = rgba(n1, 0.35);
  ctx.shadowBlur = (card.image ? 14 : 10) * k;
  ctx.font = fontStr(300, big, family);
  ctx.fillStyle = grad;
  ctx.fillText(value, x0, card.image ? 306 : 186);
  if (card.unit) {
    ctx.font = fontStr(300, unitPx, family);
    ctx.fillStyle = rgba(n1, 1);
    ctx.fillText(card.unit, x0 + vw + 4, 186 - 50 + unitPx * 0.72);
  }
  ctx.restore();
}

/**
 * OFY hover face: the card under the pointer turns into frosted glass whose body is
 * the theme's deep black (red field) or red (black field). A few soft blooms drift
 * inside the glass, and the service icon + label sit on top.
 */
function paintHoverFace(
  cv: HTMLCanvasElement,
  frost: HTMLCanvasElement,
  icons: (HTMLCanvasElement | null)[],
  card: WarpCard,
  family: string,
  glass: WarpHoverGlass,
  grain: CanvasPattern | null,
  phase: number,
) {
  const w = cv.width;
  const h = cv.height;
  const ctx = cv.getContext("2d");
  if (!ctx) return;
  const k = w / CW;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.drawImage(frost, 0, 0);

  // moving smoke behind the glass: soft blooms on slow, out-of-phase paths
  const smoke = glass.smoke.map((c) => parseColor(c));
  const glassRgb = parseColor(glass.tint);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 5; i++) {
    const t = phase * (0.6 + i * 0.12) + i * 1.87;
    const cx = (128 + 76 * Math.sin(t * 1.13 + i * 0.9) + 20 * Math.cos(t * 0.61)) * k;
    const cy = (168 + 98 * Math.cos(t * 0.83 + i * 1.31)) * k;
    const r = (62 + (i % 3) * 36 + 12 * Math.sin(t * 1.4)) * k;
    const c = smoke[i % smoke.length];
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, rgba(c, i === 0 ? 0.24 : 0.15));
    g.addColorStop(0.5, rgba(c, 0.07));
    g.addColorStop(1, rgba(c, 0));
    ctx.fillStyle = g;
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
  // on the red glass the smoke has to go darker to read; black glass takes the glow pass alone
  const tintLum = (0.2126 * glassRgb[0] + 0.7152 * glassRgb[1] + 0.0722 * glassRgb[2]) / 255;
  if (tintLum > 0.35) {
    ctx.globalCompositeOperation = "source-over";
    const deep = smoke[smoke.length - 1];
    for (let i = 0; i < 3; i++) {
      const t = phase * (0.5 + i * 0.15) + i * 2.4;
      const cx = (128 + 90 * Math.cos(t * 0.9 + i * 1.3)) * k;
      const cy = (150 + 100 * Math.sin(t * 0.75 + i * 1.7)) * k;
      const r = (84 + i * 30) * k;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, rgba(deep, 0.2));
      g.addColorStop(0.6, rgba(deep, 0.07));
      g.addColorStop(1, rgba(deep, 0));
      ctx.fillStyle = g;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
  }
  ctx.restore();

  // glass sheen + frost grain
  const sheen = ctx.createLinearGradient(0, 0, 0, h);
  sheen.addColorStop(0, "rgba(255, 255, 255, 0.09)");
  sheen.addColorStop(0.3, "rgba(255, 255, 255, 0.015)");
  sheen.addColorStop(1, "rgba(0, 0, 0, 0.18)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, w, h);
  if (grain) {
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = grain;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  ctx.setTransform(k, 0, 0, k, 0, 0);
  ctx.textBaseline = "alphabetic";
  const ink = parseColor(glass.ink);
  const categoryIcon = icons[0] || null;

  // the category icon sits huge and dim behind the rows, so the glass keeps its identity
  if (categoryIcon) {
    ctx.globalAlpha = 0.055;
    ctx.drawImage(categoryIcon, 146, 168, 134, 134);
    ctx.globalAlpha = 1;
  }

  // header: category icon, category label, index on the right
  if (categoryIcon) ctx.drawImage(categoryIcon, 16, 14, 28, 28);
  const headPx = sizeForCap(ctx, 500, family, 9, "H");
  ctx.font = fontStr(500, headPx, family);
  ctx.fillStyle = rgba(ink, 0.96);
  const headLines = wrapLabel(ctx, card.title.replace(/\n/g, " "), 172).slice(0, 2);
  headLines.forEach((ln, i) => ctx.fillText(ln, 52, 35 + i * 16));
  ctx.textAlign = "right";
  ctx.font = fontStr(300, sizeForCap(ctx, 300, family, 7.5, "H"), family);
  ctx.fillStyle = rgba(ink, 0.5);
  ctx.fillText(card.value, 240, 35);
  ctx.textAlign = "left";

  // divider between the category and its offerings
  let y = 46 + (headLines.length - 1) * 16;
  ctx.fillStyle = rgba(ink, 0.2);
  ctx.fillRect(16, y, 224, 0.9);

  // the category's three points: icon, label and the descriptive sentence
  const points = card.points ?? [];
  // keep every sentence on three lines or fewer; step the copy size down instead of cutting words
  let copyCap = 7.2;
  for (;;) {
    ctx.font = fontStr(400, sizeForCap(ctx, 400, family, copyCap, "H"), family);
    if (points.every((point) => wrapLabel(ctx, point.copy, 224).length <= 3) || copyCap <= 5) break;
    copyCap -= 0.25;
  }
  y += 15;
  const rowH = (CH - y - 8) / 3;
  points.slice(0, 3).forEach((point, i) => {
    const rowTop = y + i * rowH;
    const icon = icons[i + 1];
    if (icon) {
      ctx.globalAlpha = 0.92;
      ctx.drawImage(icon, 16, rowTop + 1, 40, 40);
      ctx.globalAlpha = 1;
    }
    const labelPx = sizeForCap(ctx, 500, family, 9, "H");
    ctx.font = fontStr(500, labelPx, family);
    ctx.fillStyle = rgba(ink, 0.96);
    ctx.fillText(point.label, 68, rowTop + 21);
    const copyPx = sizeForCap(ctx, 400, family, copyCap, "H");
    ctx.font = fontStr(400, copyPx, family);
    ctx.fillStyle = rgba(ink, 0.85);
    let ty = rowTop + 46;
    for (const ln of wrapLabel(ctx, point.copy, 224).slice(0, 3)) {
      ctx.fillText(ln, 16, ty);
      ty += 11.4;
    }
    if (i < points.length - 1) {
      ctx.fillStyle = rgba(ink, 0.13);
      ctx.fillRect(16, rowTop + rowH - 6, 224, 0.7);
    }
  });

  // rim
  ctx.strokeStyle = rgba(ink, 0.22);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(0.5, 0.5, CW - 1, CH - 1, 9.5);
  ctx.stroke();
}

/** Greedy wrap for the hover label, in stage units at the current font. */
function wrapLabel(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const out: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxWidth) {
      out.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) out.push(line);
  return out;
}

/**
 * The glow a card casts above and below the ring, as one whole soft ellipse: [centre u, half width, strength].
 * It is moment-matched to the card's light spread through a fixed window over the stage centre (the card seen
 * from the bands, scaled out 1.8x, brightest along its nearer edge), so it lands where the reference's glow
 * sits but always as a complete ellipse.
 */
function glowShape(pose: Pose): [number, number, number] {
  const [px, pz, ps] = pose;
  const c = Math.cos(ps);
  const sn = Math.sin(ps);
  if (c <= 0.02) return [0, 1, 0];
  const A = px;
  const B = FOCAL + pz;
  const tNear = B - 0.5 * CW * Math.abs(sn);
  let m = 0;
  let mx = 0;
  let mxx = 0;
  for (let u = -360; u <= 360; u += 3) {
    const h = Math.exp(-((Math.abs(u - 9) / 138) ** 4));
    if (h < 0.003) continue;
    const k = u / 1.8 / FOCAL;
    const den = sn * k - c;
    if (Math.abs(den) < 1e-4) continue;
    const s = (A - B * k) / den;
    const t = B + s * sn;
    if (t < 4) continue;
    if ((u / 1.8 / FOCAL) * t * sn - t * c >= 0) continue;
    const dsdk = (B * c - A * sn) / (den * den);
    const soft = Math.min(Math.abs(dsdk / FOCAL) * 2.2, 40) + 0.5;
    const cov = Math.max(0, Math.min(1, (CW * 0.5 - Math.abs(s)) / soft + 0.5));
    if (cov <= 0) continue;
    const near = Math.min(1, FOCAL / t);
    const rel = Math.exp(-((Math.max(t - tNear, 0) / 36) ** 1.5));
    const w = cov * near * near * rel * c * h;
    m += w;
    mx += w * u;
    mxx += w * u * u;
  }
  if (m < 0.5) return [0, 1, 0];
  const mu = mx / m;
  const sd = Math.sqrt(Math.max(1, mxx / m - mu * mu));
  // exp(-(x/r)^4) has standard deviation 0.581 r and area 1.813 r
  const r = Math.max(6, sd / 0.581);
  return [mu, r, (m * 3) / (1.813 * r)];
}

/* ------------------------------------------------------------------ */
/* WebGL renderer                                                      */
/* ------------------------------------------------------------------ */

const VERT = `#version 300 es
in vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
precision highp sampler2DArray;
uniform sampler2DArray uTex;
uniform sampler2D uHoverTex;
uniform vec2 uRes;
uniform float uUnit;
uniform vec4 uPose[8];
uniform vec3 uGlowCol[8];
uniform vec3 uGlowShape[8];
uniform vec3 uBg;
uniform float uWarp;
uniform float uMix;
uniform float uHoverLayer;
uniform float uHoverMix;
out vec4 outColor;

const float F = ${FOCAL.toFixed(2)};
const float CW = ${CW.toFixed(1)};
const float CH = ${CH.toFixed(1)};
const float CR = ${CR.toFixed(1)};

// horizontal lens: output |u| -> source |u|. Past the start of the flare the slope collapses and then
// turns back, so the outer flare is a hugely stretched (and folded) strip of the card just past |u| = 232
float lensH(float a){
  if (a <= 232.0) return a;
  float k[9] = float[9](232.0, 238.0, 245.0, 253.0, 262.0, 275.0, 295.0, 325.0, 360.0);
  float d[9] = float[9](1.1759, 1.0671, 1.0156, 1.0965, 0.6487, 0.2700, -0.1991, -0.4782, -0.0318);
  float s = 232.0;
  for (int i = 0; i < 8; i++){
    if (a <= k[i]) break;
    float x = min(a, k[i+1]);
    float t = (x - k[i]) / (k[i+1] - k[i]);
    s += (x - k[i]) * mix(1.0, mix(d[i], d[i+1], t * 0.5), uWarp);
  }
  if (a > 360.0) s += (a - 360.0) * mix(1.0, d[8], uWarp);
  return s;
}
float lensS(float a){
  float t = clamp((a - 262.0) / 93.0, 0.0, 2.0);
  return 1.0 + uWarp * (0.42 * pow(t, 1.5) + 0.045 * smoothstep(320.0, 360.0, a));
}

float sdRound(vec2 p, vec2 b, float r){
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

// premultiplied colour of one card along a source ray
vec4 shadeCard(vec4 pose, vec2 ps, float fx, float fy, out float depth){
  depth = 1e9;
  if (pose.w < 0.0) return vec4(0.0);
  float k = ps.x / F;
  float c = cos(pose.z), sn = sin(pose.z);
  float den = sn * k - c;
  if (abs(den) < 1e-5) return vec4(0.0);
  float A = pose.x, B = F + pose.y;
  float s = (A - B * k) / den;
  float t = B + s * sn;
  if (t < 4.0) return vec4(0.0);
  float y = t * ps.y / F;
  float dsdk = (B * c - A * sn) / (den * den);
  float fs = min(abs(dsdk / F) * fx, 48.0);
  float fyc = min(t / F * fy, 48.0);
  vec2 p = vec2(s, y);
  float d = sdRound(p, vec2(CW, CH) * 0.5, CR);
  vec2 q = abs(p) - vec2(CW, CH) * 0.5 + CR;
  vec2 n = q.x > q.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  if (q.x > 0.0 && q.y > 0.0) n = normalize(q);
  float fp = length(vec2(fs * n.x, fyc * n.y)) + 1e-4;
  if (d > fp) return vec4(0.0);
  float cov = clamp(0.5 - d / fp, 0.0, 1.0);
  if (cov <= 0.0) return vec4(0.0);
  vec2 uv = vec2(s / CW + 0.5, 0.5 - y / CH);
  vec2 dx = vec2(fs / CW, 0.0);
  vec2 dy = vec2(0.0, fyc / CH);
  vec4 tex = textureGrad(uTex, vec3(uv, pose.w), dx, dy);
  if (uHoverMix > 0.0 && abs(pose.w - uHoverLayer) < 0.5) {
    // one hovered card at a time: the frosted face lives in its own texture
    tex = mix(tex, textureGrad(uHoverTex, uv, dx, dy), uHoverMix);
  }
  depth = t;
  return vec4(tex.rgb, 1.0) * cov;
}

vec4 scene(vec2 ps, float fx, float fy, int base){
  vec4 col[4];
  float dep[4];
  for (int i = 0; i < 4; i++) col[i] = shadeCard(uPose[base + i], ps, fx, fy, dep[i]);
  // sort by depth (4 entries)
  for (int i = 0; i < 3; i++)
    for (int j = 0; j < 3; j++)
      if (j < 3 - i && dep[j] > dep[j+1]) {
        float td = dep[j]; dep[j] = dep[j+1]; dep[j+1] = td;
        vec4 tc = col[j]; col[j] = col[j+1]; col[j+1] = tc;
      }
  vec4 acc = vec4(0.0);
  for (int i = 0; i < 4; i++) acc += (1.0 - acc.a) * col[i];
  return acc;
}

// the top and bottom glows: every card that faces the viewer lays one whole soft ellipse of its glow
// colour (centre, half width and strength come from glowShape on the CPU), so during a turn the bands
// slide, narrow and cross-fade colour but are never cut off
vec4 glowAt(vec2 pu, float halfH, int base){
  vec4 sum = vec4(0.0);
  // the bands sit just inside the top and bottom of a 5:4 stage; taller stages keep them near the cards
  float gH = min(halfH, 288.0);
  float dy = min(abs((gH - 11.0) - pu.y), abs(pu.y + (gH - 12.0)));
  if (dy > 40.0) return sum;
  for (int i = 0; i < 4; i++){
    vec3 sh = uGlowShape[base + i];
    if (sh.z <= 0.0) continue;
    float E = exp(-pow(abs(pu.x - sh.x) / sh.y, 4.0));
    if (E < 0.002) continue;
    float v = exp(-pow(dy / (18.5 * (0.45 + 0.55 * sqrt(E))), 3.0));
    float w = sh.z * E * v;
    sum += vec4(uGlowCol[base + i] * w, w);
  }
  return sum;
}

vec3 stage(vec2 pu, float halfH, int base){
  vec4 g = glowAt(pu, halfH, base);
  if (g.a <= 0.0) return uBg;
  float I = clamp(g.a, 0.0, 1.0);
  vec3 drop = uBg - g.rgb / g.a;
  return uBg - drop * pow(vec3(I), vec3(0.8, 1.6, 1.0)); // ls:keep (per-channel falloff exponents, not a colour)
}

vec3 render(vec2 pu, float halfH, int base){
  // stages wider than 5:4 simply run the outermost flare column on to the edge
  float au = min(abs(pu.x), 360.0);
  float px = 1.0 / uUnit;
  vec3 bg = stage(pu, halfH, base);
  if (au < 236.0 || uWarp <= 0.0) {
    vec4 c = scene(pu, px, px, base);
    return c.rgb + (1.0 - c.a) * bg;
  }
  // flare zone: one lens sample per channel. The smear is a widened texture footprint, so it stays smooth
  // with no tap banding; vertically red is spread furthest and blue least, which gives the cyan then blue rim
  float e = 0.064 * uWarp * smoothstep(275.0, 360.0, au);
  float S0 = lensS(au);
  float sg = pu.x < 0.0 ? -1.0 : 1.0;
  float blur = 1.0 + 30.0 * pow(smoothstep(240.0, 340.0, au), 1.5) * uWarp;
  float fyb = 1.0 + 15.0 * smoothstep(280.0, 352.0, au) * uWarp;
  // the stretched outer flare reads a touch brighter, as if lit through the lens
  float gain = 1.0 + 0.17 * smoothstep(285.0, 350.0, au) * uWarp;
  vec3 acc;
  for (int ch = 0; ch < 3; ch++){
    // each channel reads a slightly different strip at the outer edge: red nearest the centre, blue furthest,
    // so cards entering or leaving the flare split into cyan, blue and amber ghosts
    float off = uWarp * (ch == 0 ? -20.92 : (ch == 1 ? 0.0 : 11.91));
    float h = lensH(au) + off * smoothstep(289.8, 344.9, au);
    float h0 = lensH(au - 0.5) + off * smoothstep(289.8, 344.9, au - 0.5);
    float h1 = lensH(au + 0.5) + off * smoothstep(289.8, 344.9, au + 0.5);
    float fx = px * max(abs(h1 - h0), 0.02) * blur;
    float S = S0 * (ch == 0 ? 1.0 + e : (ch == 1 ? 1.0 : 1.0 - e));
    vec4 c = scene(vec2(sg * h, pu.y / S), fx, px / S * fyb, base);
    c.rgb = min(c.rgb * gain, vec3(c.a));
    acc[ch] = (c.rgb + (1.0 - c.a) * bg)[ch];
  }
  return acc;
}

void main(){
  vec2 fc = gl_FragCoord.xy;
  vec2 pu = (fc - 0.5 * uRes) / uUnit;
  float halfH = 0.5 * uRes.y / uUnit;
  vec3 col = render(pu, halfH, 0);
  if (uMix > 0.0) col = mix(col, render(pu, halfH, 4), uMix);
  outColor = vec4(col, 1.0);
}`;

interface GLState {
  gl: WebGL2RenderingContext;
  prog: WebGLProgram;
  tex: WebGLTexture;
  /** OFY: single frosted hover face, cross-faded into whichever card is hovered. */
  hoverTex: WebGLTexture;
  hoverW: number;
  hoverH: number;
  loc: Record<string, WebGLUniformLocation | null>;
  layers: number;
  texW: number;
}

function createGL(canvas: HTMLCanvasElement): GLState | null {
  const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
  if (!gl) return null;
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  };
  const vs = sh(gl.VERTEX_SHADER, VERT);
  const fs = sh(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.bindAttribLocation(prog, 0, "aPos");
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn(gl.getProgramInfoLog(prog));
    return null;
  }
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const tex = gl.createTexture()!;
  const hoverTex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, hoverTex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const loc: Record<string, WebGLUniformLocation | null> = {};
  for (const n of ["uTex", "uHoverTex", "uRes", "uUnit", "uPose", "uGlowCol", "uGlowShape", "uBg", "uWarp", "uMix", "uHoverLayer", "uHoverMix"]) loc[n] = gl.getUniformLocation(prog, n);
  const aniso = gl.getExtension("EXT_texture_filter_anisotropic");
  (tex as unknown as { aniso: unknown }).aniso = aniso;
  return { gl, prog, tex, hoverTex, hoverW: 0, hoverH: 0, loc, layers: 0, texW: 0 };
}

function uploadCards(st: GLState, canvases: HTMLCanvasElement[]) {
  const { gl, tex } = st;
  const w = canvases[0].width;
  const h = canvases[0].height;
  gl.bindTexture(gl.TEXTURE_2D_ARRAY, tex);
  gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, gl.RGBA8, w, h, canvases.length, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  canvases.forEach((cv, i) => {
    gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, i, w, h, 1, gl.RGBA, gl.UNSIGNED_BYTE, cv);
  });
  gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const an = (tex as unknown as { aniso: { TEXTURE_MAX_ANISOTROPY_EXT: number } | null }).aniso;
  if (an) gl.texParameterf(gl.TEXTURE_2D_ARRAY, an.TEXTURE_MAX_ANISOTROPY_EXT, 8);
  st.layers = canvases.length;
  st.texW = w;
}

/** OFY: upload the frosted hover face into its own texture, resizing only when the card texture does. */
function uploadHover(st: GLState, cv: HTMLCanvasElement) {
  const { gl } = st;
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, st.hoverTex);
  if (st.hoverW !== cv.width || st.hoverH !== cv.height) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, cv.width, cv.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    st.hoverW = cv.width;
    st.hoverH = cv.height;
  }
  gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, cv);
}

/* ------------------------------------------------------------------ */
/* Canvas 2D fallback: per-strip affine approximation, no lens blur.   */
/* ------------------------------------------------------------------ */

function drawFallback(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  unit: number,
  poses: { pose: Pose; layer: number }[],
  canvases: HTMLCanvasElement[],
  bg: string,
  glows: [number, number, number][],
  hoverLayer = -1,
  hoverCanvas: HTMLCanvasElement | null = null,
  hoverMix = 0,
) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  // top and bottom glow bands: one whole soft ellipse per card that faces the viewer, as in the WebGL path
  const gH = Math.min(h / 2 / unit, 288);
  for (const p of poses) {
    if (p.layer < 0) continue;
    const [mu, r, amp] = glowShape(p.pose);
    const a = Math.min(1, amp) * 0.9;
    if (a < 0.01) continue;
    const rx = r * 1.35 * unit;
    const col = glows[p.layer] || [127, 208, 240];
    const rgb = `${col[0]}, ${col[1]}, ${col[2]}`;
    for (const yy of [h / 2 - (gH - 11) * unit, h / 2 + (gH - 12) * unit]) {
      ctx.save();
      ctx.translate(w / 2 + mu * unit, yy);
      ctx.scale(1, (20 * unit) / rx);
      const rg = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      rg.addColorStop(0, `rgba(${rgb}, ${a})`);
      rg.addColorStop(0.55, `rgba(${rgb}, ${a * 0.55})`);
      rg.addColorStop(1, `rgba(${rgb}, 0)`);
      ctx.fillStyle = rg;
      ctx.fillRect(-rx, -rx, rx * 2, rx * 2);
      ctx.restore();
    }
  }
  const proj = (X: number, Zb: number, Y: number) => {
    const D = FOCAL + Zb;
    return [w / 2 + ((X * FOCAL) / D) * unit, h / 2 - ((Y * FOCAL) / D) * unit];
  };
  const items = poses
    .filter((p) => p.layer >= 0)
    .map((p) => ({ ...p, depth: p.pose[1] }))
    .sort((a, b) => b.depth - a.depth);
  const strips = 32;
  // neighbouring strips overlap a little so their anti-aliased clip edges never show as seams
  const eps = 1.5 / Math.max(unit, 0.25);
  const half = CW / 2;
  // card outline height at s, following the rounded corners
  const edgeY = (sv: number) => {
    const dx = Math.abs(sv) - (half - CR);
    if (dx <= 0) return CH / 2;
    return CH / 2 - CR + Math.sqrt(Math.max(0, CR * CR - Math.min(dx, CR) ** 2));
  };
  for (const it of items) {
    const [cx, zb, psi] = it.pose;
    // OFY: no cross-fade in the fallback path; the frosted face takes over past halfway
    const cv = it.layer === hoverLayer && hoverMix > 0.5 && hoverCanvas ? hoverCanvas : canvases[it.layer];
    if (!cv) continue;
    const tpu = cv.width / CW;
    const cs = Math.cos(psi);
    const sn = Math.sin(psi);
    const at = (sv: number, y: number) => proj(cx + sv * cs, zb + sv * sn, y);
    for (let i = 0; i < strips; i++) {
      const s0 = -half + (CW * i) / strips - (i > 0 ? eps : 0);
      const s1 = -half + (CW * (i + 1)) / strips + (i < strips - 1 ? eps : 0);
      if (FOCAL + zb + s0 * sn < 10 || FOCAL + zb + s1 * sn < 10) continue;
      // clip: the strip of the card outline (corner strips follow the rounding)
      const n = Math.abs(s0) > half - CR - 1 || Math.abs(s1) > half - CR - 1 ? 6 : 1;
      ctx.save();
      ctx.beginPath();
      for (let k = 0; k <= n; k++) {
        const sv = Math.max(-half, Math.min(half, s0 + ((s1 - s0) * k) / n));
        const pt = at(sv, edgeY(sv));
        if (k === 0) ctx.moveTo(pt[0], pt[1]);
        else ctx.lineTo(pt[0], pt[1]);
      }
      for (let k = n; k >= 0; k--) {
        const sv = Math.max(-half, Math.min(half, s0 + ((s1 - s0) * k) / n));
        const pt = at(sv, -edgeY(sv));
        ctx.lineTo(pt[0], pt[1]);
      }
      ctx.closePath();
      ctx.clip();
      // affine taken through the strip's centre line, overscanned slightly so perspective never leaves a gap
      const sm = (s0 + s1) / 2;
      const tl = at(s0, CH / 2);
      const tr = at(s1, CH / 2);
      const mt = at(sm, CH / 2);
      const mb = at(sm, -CH / 2);
      const sx0 = (s0 + half) * tpu;
      const sw = (s1 - s0) * tpu;
      const ov = 1.025;
      const a = (tr[0] - tl[0]) / sw;
      const b = (tr[1] - tl[1]) / sw;
      const c = ((mb[0] - mt[0]) / cv.height) * ov;
      const d = ((mb[1] - mt[1]) / cv.height) * ov;
      const smx = (sm + half) * tpu;
      // texture point (smx, H/2) lands on the centre of the strip's centre line
      const ox = (mt[0] + mb[0]) / 2 - a * smx - c * (cv.height / 2);
      const oy = (mt[1] + mb[1]) / 2 - b * smx - d * (cv.height / 2);
      ctx.setTransform(a, b, c, d, ox, oy);
      const x0 = Math.max(0, sx0 - 1);
      const x1 = Math.min(cv.width, sx0 + sw + 1);
      ctx.drawImage(cv, x0, 0, x1 - x0, cv.height, x0, 0, x1 - x0, cv.height);
      ctx.restore();
    }
  }
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return reduced;
}

const mod = (a: number, n: number) => ((a % n) + n) % n;

interface Live {
  P: number;
  from: number;
  to: number;
  t0: number;
  n: number;
  v: number;
  mode: "rest" | "spin" | "drag" | "spring" | "fade";
  nextAuto: number;
  autoPending: boolean;
  fadeFrom: number;
  fadeT0: number;
  dragX: number;
  dragP: number;
  downX: number;
  moved: boolean;
  lastT: number;
  visible: boolean;
  hiddenAt: number;
}

export function WarpCarousel({
  cards,
  index,
  defaultIndex = 0,
  onIndexChange,
  autoplay = true,
  interval = 6.5,
  spinSeconds = 2.1,
  step = 1,
  hoverGlass,
  background = "#f0f0f0",
  glow,
  warp = 1,
  font = DEFAULT_FONT,
  seconds,
  ariaLabel = "Stat cards",
  className,
  style,
}: WarpCarouselProps) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const reduced = usePrefersReducedMotion();
  const list = React.useMemo(() => {
    const out: WarpCard[] = [];
    while (out.length < 4) out.push(...cards);
    return out;
  }, [cards]);
  const realCount = cards.length;
  const N = list.length;
  const stepN = Math.max(1, Math.round(step));
  const gap = Math.max(0.5, interval);
  const spinDur = Math.min(gap, Math.max(0.4, spinSeconds));

  const controlled = index !== undefined;
  const [inner, setInner] = React.useState(defaultIndex);
  const current = controlled ? (index as number) : inner;
  const startIdx = React.useRef(current).current;

  const live = React.useRef<Live>({
    P: current,
    from: current,
    to: current,
    t0: 0,
    n: STEP_FRAMES,
    v: 0,
    mode: "rest",
    nextAuto: Infinity,
    autoPending: false,
    fadeFrom: current,
    fadeT0: 0,
    dragX: 0,
    dragP: 0,
    downX: 0,
    moved: false,
    lastT: 0,
    visible: true,
    hiddenAt: 0,
  });
  const props = React.useRef({ onIndexChange, controlled, autoplay, gap, spinDur, stepN, seconds, reduced, realCount });
  props.current = { onIndexChange, controlled, autoplay, gap, spinDur, stepN, seconds, reduced, realCount };
  const handles = React.useRef<{
    kick: () => void;
    draw: () => void;
    hover: (x: number, y: number) => void;
    unhover: () => void;
  }>({ kick: () => {}, draw: () => {}, hover: () => {}, unhover: () => {} });

  const lastIndex = React.useRef(current);
  const request = React.useCallback((next: number) => {
    const p = props.current;
    if (p.onIndexChange) p.onIndexChange(mod(next, p.realCount));
    if (!p.controlled) setInner(next);
  }, []);

  // a change of the effective index starts a spin (or a cross-fade when motion is reduced)
  React.useEffect(() => {
    const L = live.current;
    const prev = lastIndex.current;
    lastIndex.current = current;
    if (prev === current) return;
    let delta = current - prev;
    if (props.current.controlled && Math.abs(delta) > realCount / 2) delta -= Math.sign(delta) * realCount;
    const now = performance.now() / 1000;
    const fromAuto = L.autoPending;
    L.autoPending = false;
    if (props.current.reduced) {
      L.fadeFrom = L.P;
      L.P = Math.round(L.P) + delta;
      L.mode = "fade";
      L.fadeT0 = now;
    } else if (L.mode !== "spring") {
      const base = Math.round(L.P - DRIFT) + delta;
      L.from = L.P;
      L.to = base + DRIFT;
      L.t0 = now;
      L.n = fromAuto ? props.current.spinDur * 30 : STEP_FRAMES;
      L.mode = "spin";
    }
    if (!fromAuto) L.nextAuto = now + props.current.gap;
    handles.current.kick();
  }, [current, realCount]);

  React.useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    let gls: GLState | null = createGL(canvas);
    let ctx2d: CanvasRenderingContext2D | null = null;
    if (!gls) ctx2d = canvas.getContext("2d");
    let cardCanvases: HTMLCanvasElement[] = [];
    let texW = 0;
    let raf = 0;
    let disposed = false;
    // Start dark: the stage usually mounts above or below the fold and must not
    // render until it is genuinely on screen (a section flush against the
    // viewport edge is technically intersecting at ratio 0).
    live.current.visible = false;
    live.current.hiddenAt = performance.now() / 1000;
    const bg = parseColor(background, [240, 240, 240]);
    const glowOverride = glow ? parseColor(glow) : null;
    const glowCols = list.map((c) => (glowOverride ? glowOverride : parseColor(c.glow || "#7fd0f0")));

    // OFY: hover glass. One card at a time eases into its frosted face; the smoke
    // behind it is repainted at 30 fps and uploaded to a single texture, so only
    // the hovered card repaints, never the ring.
    const hover = {
      layer: -1,
      target: 0,
      amount: 0,
      lastT: 0,
      paintT: 0,
      frostLayer: -2,
      frost: null as HTMLCanvasElement | null,
      face: null as HTMLCanvasElement | null,
      icons: [] as (HTMLCanvasElement | null)[],
    };
    let grain: CanvasPattern | null = null;
    {
      const tile = document.createElement("canvas");
      tile.width = 128;
      tile.height = 128;
      const tctx = tile.getContext("2d");
      if (tctx) {
        const img = tctx.createImageData(128, 128);
        let seed = 987654321;
        for (let i = 0; i < img.data.length; i += 4) {
          seed = (seed * 1103515245 + 12345) & 0x7fffffff;
          const v = 128 + (seed / 0x7fffffff - 0.5) * 150;
          img.data[i] = v;
          img.data[i + 1] = v;
          img.data[i + 2] = v;
          img.data[i + 3] = 26;
        }
        tctx.putImageData(img, 0, 0);
        grain = tctx.createPattern(tile, "repeat");
      }
    }
    let lastSet: { pose: Pose; layer: number }[] = [];
    const pointInQuad = (x: number, y: number, quad: number[][]) => {
      let inside = false;
      for (let i = 0, j = quad.length - 1; i < quad.length; j = i++) {
        const [xi, yi] = quad[i];
        const [xj, yj] = quad[j];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
      }
      return inside;
    };

    type PaintHandle = { idle: boolean; id: number };
    let paintTimer: PaintHandle | null = null;
    let paintGen = 0;
    let paintW = -1;
    const idleWin = window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const schedulePaint = (fn: () => void): PaintHandle => {
      if (typeof idleWin.requestIdleCallback === "function") {
        return { idle: true, id: idleWin.requestIdleCallback(fn, { timeout: 100 }) };
      }
      return { idle: false, id: window.setTimeout(fn, 0) };
    };
    const stopPaint = () => {
      if (!paintTimer) return;
      if (paintTimer.idle && typeof idleWin.cancelIdleCallback === "function") idleWin.cancelIdleCallback(paintTimer.id);
      else clearTimeout(paintTimer.id);
      paintTimer = null;
    };

    // Each card is ~0.3M pixels of per-pixel JS. Painting all six in one pass
    // stalls the main thread for seconds, so paint exactly one card per task.
    const paintAll = (w: number) => {
      if (paintW === w) return;
      stopPaint();
      paintGen++;
      const gen = paintGen;
      paintW = w;
      const next: HTMLCanvasElement[] = [];
      const step = () => {
        paintTimer = null;
        if (disposed || gen !== paintGen) return;
        const cv = document.createElement("canvas");
        cv.width = w;
        cv.height = Math.round((w * CH) / CW);
        paintCard(cv, list[next.length], font);
        next.push(cv);
        if (next.length < list.length) {
          paintTimer = schedulePaint(step);
          return;
        }
        paintW = -1;
        cardCanvases = next;
        texW = w;
        // the frosted face is built from the card texture, so it must be rebuilt
        hover.frostLayer = -2;
        if (gls) uploadCards(gls, cardCanvases);
        handles.current.draw();
      };
      paintTimer = schedulePaint(step);
    };

    let W = 0;
    let H = 0;
    let unit = 1;
    const resize = () => {
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(2, Math.round(r.width * dpr));
      H = Math.max(2, Math.round(r.height * dpr));
      if (canvas.width !== W) canvas.width = W;
      if (canvas.height !== H) canvas.height = H;
      // the 720 unit stage fills the width; short, wide boxes shrink it so the cards always fit the height
      unit = Math.min(W / 720, H / 440);
      const want = Math.min(512, Math.max(256, Math.round(CW * unit * 1.25)));
      if (want !== texW) paintAll(want);
    };

    const poseSet = (P: number) => {
      const ids = Array.from({ length: N }, (_, c) => ({ c, q: mod(c - P + N / 2, N) - N / 2 }))
        .sort((a, b) => Math.abs(a.q) - Math.abs(b.q))
        .slice(0, 4);
      return ids.map(({ c, q }) => (Math.abs(q) > 2.05 ? { pose: [0, 0, 0] as Pose, layer: -1 } : { pose: poseAt(q), layer: c }));
    };

    const L = live.current;
    const progressAt = (now: number) => {
      const p = props.current;
      if (p.seconds !== undefined) {
        if (p.reduced) {
          const k = p.seconds < LEAD ? 0 : Math.floor((p.seconds - LEAD) / p.gap) + 1;
          return { P: startIdx + k * p.stepN, Pb: 0, mix: 0 };
        }
        return { P: autoplayProgress(p.seconds, startIdx, p.stepN, p.gap, p.spinDur), Pb: 0, mix: 0 };
      }
      if (L.mode === "spin") {
        const f = (now - L.t0) * 30;
        L.P = L.from + (L.to - L.from) * spinN(f, L.n);
        if (f >= L.n) L.mode = "rest";
      } else if (L.mode === "spring") {
        const dt = Math.min(0.034, Math.max(0, now - L.lastT));
        L.lastT = now;
        const sub = 4;
        for (let i = 0; i < sub; i++) {
          const acc = -60 * (L.P - L.to) - 13 * L.v;
          L.v += (acc * dt) / sub;
          L.P += (L.v * dt) / sub;
        }
        if (Math.abs(L.P - L.to) < 4e-4 && Math.abs(L.v) < 3e-3) {
          L.P = L.to;
          L.v = 0;
          L.mode = "rest";
        }
      } else if (L.mode === "fade") {
        const m = Math.min(1, (now - L.fadeT0) / 0.45);
        if (m >= 1) L.mode = "rest";
        return { P: L.P, Pb: L.fadeFrom, mix: 1 - m * m * (3 - 2 * m) };
      }
      return { P: L.P, Pb: 0, mix: 0 };
    };

    /** OFY: frosted backing — the card texture blurred, then flooded with the glass tint. */
    const buildHoverAssets = (layer: number) => {
      const src = cardCanvases[layer];
      if (!src || !hoverGlass) return;
      if (!hover.frost) hover.frost = document.createElement("canvas");
      const frost = hover.frost;
      frost.width = src.width;
      frost.height = src.height;
      const fctx = frost.getContext("2d");
      if (!fctx) return;
      const pad = Math.round(src.width * 0.03);
      fctx.setTransform(1, 0, 0, 1, 0, 0);
      fctx.clearRect(0, 0, frost.width, frost.height);
      fctx.filter = `blur(${Math.max(2, Math.round(src.width * 0.024))}px)`;
      fctx.drawImage(src, -pad, -pad, src.width + pad * 2, src.height + pad * 2);
      fctx.filter = "none";
      fctx.fillStyle = hoverGlass.tint;
      fctx.globalAlpha = 0.9;
      fctx.fillRect(0, 0, frost.width, frost.height);
      fctx.globalAlpha = 1;

      const card = list[layer];
      const tintIcon = (img: HTMLImageElement | undefined): HTMLCanvasElement | null => {
        if (!img) return null;
        const s = 128;
        const cv = document.createElement("canvas");
        cv.width = cv.height = s;
        const ictx = cv.getContext("2d");
        if (!ictx) return null;
        ictx.drawImage(img, 0, 0, s, s);
        ictx.globalCompositeOperation = "source-in";
        ictx.fillStyle = hoverGlass.ink;
        ictx.fillRect(0, 0, s, s);
        return cv;
      };
      hover.icons = [tintIcon(card?.icon), ...(card?.points ?? []).map((point) => tintIcon(point.icon))];
      hover.frostLayer = layer;
    };

    /** OFY: repaint the hovered card's glass face; the smoke drifts, the content stays put. */
    const paintHover = (now: number, force: boolean) => {
      const layer = hover.layer;
      if (!hoverGlass || layer < 0 || hover.amount <= 0.001) return;
      if (hover.frostLayer !== layer) buildHoverAssets(layer);
      if (!hover.frost || hover.frostLayer !== layer) return;
      if (!hover.face) hover.face = document.createElement("canvas");
      const face = hover.face;
      if (face.width !== hover.frost.width || face.height !== hover.frost.height) {
        face.width = hover.frost.width;
        face.height = hover.frost.height;
      }
      // under reduced motion the face is a still; otherwise keep the smoke moving at 30 fps
      if (!force && props.current.reduced && hover.paintT > 0) return;
      if (!force && now - hover.paintT < 1 / 30) return;
      hover.paintT = now;
      paintHoverFace(
        face,
        hover.frost,
        hover.icons,
        list[layer],
        font,
        hoverGlass,
        grain,
        props.current.reduced ? 0 : now * 0.55,
      );
      if (gls) uploadHover(gls, face);
    };

    const setHover = (layer: number) => {
      if (!hoverGlass || layer === hover.layer) return;
      const now = performance.now() / 1000;
      const wasHovered = hover.layer >= 0;
      hover.layer = layer;
      hover.target = layer >= 0 ? 1 : 0;
      hover.paintT = 0;
      if (layer >= 0) paintHover(now, true);
      if (wasHovered && layer < 0) L.nextAuto = Math.max(L.nextAuto, now + props.current.gap);
      handles.current.kick();
    };

    /** OFY: which visible card is under the pointer, using its projected quad. */
    const hitTest = (clientX: number, clientY: number) => {
      const r = wrap.getBoundingClientRect();
      if (clientX < r.left || clientY < r.top || clientX > r.right || clientY > r.bottom) return -1;
      const x = clientX - r.left;
      const y = clientY - r.top;
      const unitCss = Math.min(r.width / 720, r.height / 440);
      const half = CW / 2;
      const halfH = CH / 2;
      // only the settled card facing the viewer takes the glass: side cards are
      // inside the lens warp and would show mirrored, unreadable content
      const ordered = lastSet.filter((s) => s.layer >= 0).sort((a, b) => a.pose[1] - b.pose[1]);
      const front = ordered[0];
      if (!front || Math.abs(front.pose[0]) > 40) return -1;
      {
        const [cx, cz, psi] = front.pose;
        const c = Math.cos(psi);
        const sn = Math.sin(psi);
        const quad = [
          [-half, -halfH],
          [half, -halfH],
          [half, halfH],
          [-half, halfH],
        ].map(([sv, yy]) => {
          const d = FOCAL + cz + sv * sn;
          return [r.width / 2 + (((cx + sv * c) * FOCAL) / d) * unitCss, r.height / 2 - ((yy * FOCAL) / d) * unitCss];
        });
        if (pointInQuad(x, y, quad)) return front.layer;
      }
      return -1;
    };

    const poseArr = new Float32Array(32);
    const glowArr = new Float32Array(24);
    const shapeArr = new Float32Array(24);
    const fill = (set: { pose: Pose; layer: number }[], off: number) => {
      set.forEach((s, i) => {
        const j = off + i;
        poseArr[j * 4] = s.pose[0];
        poseArr[j * 4 + 1] = s.pose[1];
        poseArr[j * 4 + 2] = s.pose[2];
        poseArr[j * 4 + 3] = s.layer;
        const gc = s.layer >= 0 ? glowCols[s.layer] : [255, 255, 255]; // ls:keep (unused slot)
        glowArr[j * 3] = gc[0] / 255;
        glowArr[j * 3 + 1] = gc[1] / 255;
        glowArr[j * 3 + 2] = gc[2] / 255;
        const gs = s.layer >= 0 ? glowShape(s.pose) : [0, 1, 0];
        shapeArr[j * 3] = gs[0];
        shapeArr[j * 3 + 1] = gs[1];
        shapeArr[j * 3 + 2] = gs[2];
      });
    };

    const draw = (now: number) => {
      if (disposed || !L.visible) return;
      const { P, Pb, mix } = progressAt(now);
      const setA = poseSet(P);
      lastSet = setA;
      if (gls) {
        const { gl, prog, loc } = gls;
        gl.viewport(0, 0, W, H);
        if (gls.layers < 1) {
          // texture array not uploaded yet: paint the field only, never sample an empty texture array
          gl.clearColor(bg[0] / 255, bg[1] / 255, bg[2] / 255, 1);
          gl.clear(gl.COLOR_BUFFER_BIT);
          return;
        }
        gl.useProgram(prog);
        fill(setA, 0);
        if (mix > 0) fill(poseSet(Pb), 4);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, gls.tex);
        gl.uniform1i(loc.uTex, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, gls.hoverTex);
        gl.uniform1i(loc.uHoverTex, 1);
        gl.uniform2f(loc.uRes, W, H);
        gl.uniform1f(loc.uUnit, unit);
        gl.uniform4fv(loc.uPose, poseArr);
        gl.uniform3fv(loc.uGlowCol, glowArr);
        gl.uniform3fv(loc.uGlowShape, shapeArr);
        gl.uniform3f(loc.uBg, bg[0] / 255, bg[1] / 255, bg[2] / 255);
        gl.uniform1f(loc.uWarp, Math.max(0, Math.min(1, warp)));
        gl.uniform1f(loc.uMix, mix);
        gl.uniform1f(loc.uHoverLayer, hover.layer);
        gl.uniform1f(loc.uHoverMix, hover.amount);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      } else if (ctx2d) {
        const css = `rgb(${bg[0]}, ${bg[1]}, ${bg[2]})`;
        drawFallback(ctx2d, W, H, unit, setA, cardCanvases, css, glowCols, hover.layer, hover.face, hover.amount);
        if (mix > 0) {
          ctx2d.globalAlpha = mix;
          drawFallback(ctx2d, W, H, unit, poseSet(Pb), cardCanvases, css, glowCols, hover.layer, hover.face, hover.amount);
          ctx2d.globalAlpha = 1;
        }
      }
    };

    const loop = () => {
      raf = 0;
      if (disposed || !L.visible) return;
      const now = performance.now() / 1000;
      const p = props.current;
      // OFY: easing the glass in and out, and keeping its smoke alive
      const dt = Math.min(0.05, Math.max(0, now - (hover.lastT || now)));
      hover.lastT = now;
      if (hover.amount !== hover.target) {
        hover.amount += (hover.target - hover.amount) * Math.min(1, dt * 16);
        if (Math.abs(hover.target - hover.amount) < 0.002) hover.amount = hover.target;
      }
      if (hover.layer >= 0 || hover.amount > 0) paintHover(now, false);
      // a hovered card holds still, so the one being read does not spin away
      if (p.seconds === undefined && p.autoplay && hover.layer < 0 && L.mode !== "drag" && L.mode !== "spring" && now >= L.nextAuto) {
        L.nextAuto = Math.max(L.nextAuto + p.gap, now + p.gap * 0.5);
        L.autoPending = true;
        request(lastIndex.current + p.stepN);
      }
      draw(now);
      const busy = p.seconds === undefined && (L.mode !== "rest" || p.autoplay || hover.amount > 0 || hover.amount !== hover.target);
      if (busy) raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (!raf && !disposed && L.visible) raf = requestAnimationFrame(loop);
    };
    handles.current = {
      kick,
      draw: () => draw(performance.now() / 1000),
      hover: (x, y) => setHover(hitTest(x, y)),
      unhover: () => setHover(-1),
    };

    // the reference opens mid-rest, a moment before its first spin
    const t0 = performance.now() / 1000;
    if (props.current.autoplay && !props.current.reduced && props.current.seconds === undefined) {
      L.from = current - props.current.stepN + DRIFT;
      L.to = current + DRIFT;
      L.t0 = t0 - REST_PHASE / 30;
      L.n = STEP_FRAMES;
      L.mode = "spin";
      L.P = L.from + (L.to - L.from) * spin(REST_PHASE);
      L.nextAuto = t0 + LEAD;
    } else {
      L.nextAuto = t0 + props.current.gap;
    }

    resize();
    const ro = new ResizeObserver(() => {
      resize();
      draw(performance.now() / 1000);
    });
    ro.observe(wrap);

    const setVisible = (vis: boolean) => {
      const now = performance.now() / 1000;
      if (vis === L.visible) return;
      if (!vis) {
        L.hiddenAt = now;
        // leaving the stage releases the glass and lets the ring resume when it returns
        setHover(-1);
      } else {
        const dt = now - L.hiddenAt;
        L.t0 += dt;
        L.fadeT0 += dt;
        L.nextAuto += dt;
        L.lastT = now;
      }
      L.visible = vis;
      if (vis) kick();
    };
    // Derive visibility from geometry on scroll/resize: IntersectionObserver
    // does not deliver updates for a nested scroller in every browser build.
    const syncVisible = () => {
      const r = wrap.getBoundingClientRect();
      const onScreen = r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < window.innerHeight && r.left < window.innerWidth;
      setVisible(onScreen && document.visibilityState === "visible");
    };
    let visRaf = 0;
    const requestSync = () => {
      if (visRaf) return;
      visRaf = window.requestAnimationFrame(() => {
        visRaf = 0;
        syncVisible();
      });
    };
    const io = new IntersectionObserver(requestSync);
    io.observe(wrap);
    window.addEventListener("scroll", requestSync, { capture: true, passive: true });
    window.addEventListener("resize", requestSync, { passive: true });
    document.addEventListener("visibilitychange", syncVisible);
    syncVisible();

    let lost = false;
    const onLost = (e: Event) => {
      e.preventDefault();
      lost = true;
    };
    const onRestored = () => {
      if (!lost) return;
      lost = false;
      gls = createGL(canvas);
      texW = 0;
      hover.frostLayer = -2;
      hover.paintT = 0;
      resize();
      kick();
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    const fonts = (document as unknown as { fonts?: FontFaceSet }).fonts;
    const repaint = () => {
      if (disposed) return;
      texW = 0;
      hover.frostLayer = -2;
      resize();
      draw(performance.now() / 1000);
    };
    fonts?.addEventListener?.("loadingdone", repaint);

    draw(t0);
    kick();
    return () => {
      disposed = true;
      stopPaint();
      paintGen++;
      if (raf) cancelAnimationFrame(raf);
      if (visRaf) cancelAnimationFrame(visRaf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("scroll", requestSync, { capture: true });
      window.removeEventListener("resize", requestSync);
      document.removeEventListener("visibilitychange", syncVisible);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      fonts?.removeEventListener?.("loadingdone", repaint);
      if (gls) {
        gls.gl.deleteTexture(gls.tex);
        gls.gl.deleteTexture(gls.hoverTex);
        gls.gl.deleteProgram(gls.prog);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, background, glow, warp, font, N, hoverGlass]);

  React.useEffect(() => {
    if (seconds !== undefined) handles.current.draw();
    else handles.current.kick();
  }, [seconds, autoplay, reduced]);

  /* ---------------- interaction ---------------- */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (seconds !== undefined || e.button > 0) return;
    const L = live.current;
    handles.current.unhover();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    L.mode = "drag";
    L.dragX = e.clientX;
    L.downX = e.clientX;
    L.dragP = L.P;
    L.v = 0;
    L.moved = false;
    L.lastT = performance.now() / 1000;
    handles.current.kick();
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const L = live.current;
    if (L.mode !== "drag") {
      if (e.pointerType === "mouse" && seconds === undefined) handles.current.hover(e.clientX, e.clientY);
      return;
    }
    const r = wrapRef.current!.getBoundingClientRect();
    const unitCss = Math.min(r.width / 720, r.height / 440);
    const now = performance.now() / 1000;
    const P = L.dragP - (e.clientX - L.dragX) / (unitCss * 300);
    const dt = Math.max(1 / 240, now - L.lastT);
    L.v = 0.6 * L.v + 0.4 * ((P - L.P) / dt);
    L.P = P;
    L.lastT = now;
    if (Math.abs(e.clientX - L.downX) > 5) L.moved = true;
    handles.current.draw();
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const L = live.current;
    if (L.mode !== "drag") return;
    const now = performance.now() / 1000;
    L.nextAuto = now + gap;
    if (!L.moved) {
      L.mode = "rest";
      const r = wrapRef.current!.getBoundingClientRect();
      const u = (e.clientX - r.left - r.width / 2) / Math.min(r.width / 720, r.height / 440);
      if (u > 168) request(lastIndex.current + 1);
      else if (u < -168) request(lastIndex.current - 1);
      return;
    }
    if (now - L.lastT > 0.08) L.v = 0;
    const target = Math.round(L.P + L.v * 0.16);
    const from = Math.round(L.dragP - DRIFT);
    L.to = target;
    L.mode = "spring";
    L.lastT = now;
    const next = lastIndex.current + (target - from);
    if (next !== lastIndex.current) {
      lastIndex.current = next;
      const p = props.current;
      if (p.onIndexChange) p.onIndexChange(mod(next, p.realCount));
      if (!p.controlled) setInner(next);
    }
    handles.current.kick();
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    request(lastIndex.current + (e.key === "ArrowRight" ? 1 : -1));
  };

  const front = list[mod(current, N)];
  return (
    <div
      ref={wrapRef}
      className={className}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={() => handles.current.unhover()}
      onKeyDown={onKeyDown}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: 420,
        aspectRatio: "5 / 4",
        overflow: "hidden",
        background,
        touchAction: "pan-y",
        userSelect: "none",
        cursor: "grab",
        outline: "none",
        ...style,
      }}
    >
      <canvas ref={canvasRef} aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
      <div aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clipPath: "inset(50%)" }}>
        {front ? `${front.title.replace("\n", " ")}: ${front.value}${front.unit || ""}. ${front.footer || ""}` : ""}
      </div>
    </div>
  );
}

export default WarpCarousel;
