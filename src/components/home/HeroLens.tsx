"use client";

import * as React from "react";
import { useReducedMotion, type MotionValue } from "motion/react";
import styles from "./ofy-art-home.module.css";

const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

/**
 * OFY hero → work: the hero picture is pulled through the carousel's edge lens.
 * The outer columns read back toward the centre, so the image stretches
 * horizontally; each colour channel samples a slightly different strip, and
 * row bands tear apart as the work ring arrives. `uProgress` is the scroll
 * seam: 0 at the top of the page, 1 when the work scene fills the viewport.
 */
const FRAG = `#version 300 es
precision highp float;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform float uProgress;
uniform float uAspect;
out vec4 outColor;

vec2 coverUv(vec2 uv) {
  float ca = uRes.x / uRes.y;
  if (uAspect > ca) uv.x = (uv.x - 0.5) * (ca / uAspect) + 0.5;
  else uv.y = (uv.y - 0.5) * (uAspect / ca) + 0.5;
  return uv;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  // stretch tracks the scroll distance linearly across the whole seam
  float p = uProgress;
  float x = (uv.x - 0.5) * 2.0;
  float ax = abs(x);

  // horizontal lens: edges sample toward the middle, stretching the picture outward.
  // The lower half (the artwork) bends hardest; the flat field above stays calm.
  float focus = mix(0.5, 1.0, 1.0 - smoothstep(0.2, 0.95, uv.y));
  float bend = p * (0.62 * pow(ax, 1.15) + 0.03) * focus;
  float wave = 0.02 * p * sin(uv.y * 14.0 + ax * 3.0) * (0.15 + ax);
  float sx = x - sign(x) * bend + wave;
  // a hair of dispersion at the outer edge only; the shape does the work
  float split = p * 0.003 * pow(ax, 3.0);

  float cx = sx * 0.5 + 0.5;
  vec3 col;
  col.r = texture(uTex, coverUv(vec2(cx + split, uv.y))).r;
  col.g = texture(uTex, coverUv(vec2(cx, uv.y))).g;
  col.b = texture(uTex, coverUv(vec2(cx - split, uv.y))).b;

  // a warm lens bloom sits over the lower image while it breaks up
  float seam = p * exp(-pow((uv.y - 0.14) / 0.12, 2.0));
  col += vec3(1.0, 0.5, 0.4) * seam * 0.22;

  // the picture gives way to the brand field as the ring takes the frame
  float alpha = 1.0 - smoothstep(0.62, 0.95, uProgress);
  outColor = vec4(col, alpha);
}`;

interface HeroLensProps {
  desktop: string;
  mobile: string;
  /** 0 at the top of the hero, 1 when the work scene fills the viewport. */
  progress: MotionValue<number>;
}

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function HeroLens({ desktop, mobile, progress }: HeroLensProps) {
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  React.useEffect(() => {
    if (reduced) return;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    if (!window.matchMedia("(min-width: 769px)").matches) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: false,
      preserveDrawingBuffer: true,
    });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.bindAttribLocation(prog, 0, "aPos");
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const tex = gl.createTexture();
    const loc = {
      tex: gl.getUniformLocation(prog, "uTex"),
      res: gl.getUniformLocation(prog, "uRes"),
      progress: gl.getUniformLocation(prog, "uProgress"),
      aspect: gl.getUniformLocation(prog, "uAspect"),
    };

    let disposed = false;
    let ready = false;
    let aspect = 1;
    let raf = 0;

    const setLive = (live: boolean) => {
      if (wrap.dataset.live !== String(live)) wrap.dataset.live = String(live);
    };

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const w = Math.max(2, Math.round(r.width * dpr));
      const h = Math.max(2, Math.round(r.height * dpr));
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
    };

    const draw = () => {
      raf = 0;
      if (disposed) return;
      const p = progress.get();
      if (!ready || p <= 0.001 || p >= 0.999) {
        setLive(false);
        return;
      }
      setLive(true);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(prog);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(loc.tex, 0);
      gl.uniform2f(loc.res, canvas.width, canvas.height);
      gl.uniform1f(loc.progress, p);
      gl.uniform1f(loc.aspect, aspect);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const requestDraw = () => {
      if (raf || disposed) return;
      raf = window.requestAnimationFrame(draw);
    };

    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (disposed) return;
      const iw = img.naturalWidth || 1;
      const ih = img.naturalHeight || 1;
      aspect = iw / ih;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      ready = true;
      requestDraw();
    };
    img.src = desktop;

    const onResize = () => {
      resize();
      requestDraw();
    };
    window.addEventListener("resize", onResize, { passive: true });
    const onLost = (e: Event) => {
      e.preventDefault();
      setLive(false);
      disposed = true;
      if (raf) window.cancelAnimationFrame(raf);
    };
    canvas.addEventListener("webglcontextlost", onLost);
    const unsubscribe = progress.on("change", requestDraw);
    resize();

    return () => {
      disposed = true;
      if (raf) window.cancelAnimationFrame(raf);
      setLive(false);
      unsubscribe();
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("webglcontextlost", onLost);
      gl.deleteTexture(tex);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, [desktop, reduced, progress]);

  return (
    <div ref={wrapRef} className={styles.heroLensWrap} data-live="false">
      <img src={desktop} alt="" className={`${styles.seamlessImg} ${styles.heroImgDesktop}`} />
      <img src={mobile} alt="" className={`${styles.seamlessImg} ${styles.heroImgMobile}`} />
      <canvas ref={canvasRef} className={styles.heroLensCanvas} aria-hidden="true" />
    </div>
  );
}
