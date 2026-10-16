#!/usr/bin/env python3
"""OFY work-plate pipeline — raw image -> house-style 1-bit duotone plates.

v2 (2026-09-16): paper/ink clamping + denoise so line-art converts CLEANLY
(clean fields, solid darks, dithered midtones) instead of spraying speckle.

  red theme  = black ink on #FF0000 field
  dark theme = #FF0000 ink on black field

House spec (matches the existing plate set, verified 2026-09):
  - 720 x 1280 PNG
  - exactly 2 colors: (255, 0, 0) and (0, 0, 0)
  - ordered (Bayer 8x8) dither for tonal areas

Usage:
  python3 ofy_plate_pipeline.py raw/<slug>.png --slug prediction
  python3 ofy_plate_pipeline.py raw.png --slug voice --out ./out --invert
  python3 ofy_plate_pipeline.py raw.png --slug voice --ink 0.28   # force coverage (optional)
  python3 ofy_plate_pipeline.py --verify <plate.png>

Writes <out>/red/<slug>.png and <out>/dark/<slug>.png  (default out = ./out)
"""
from __future__ import annotations

import argparse
import os

import numpy as np
from PIL import Image, ImageFilter, ImageOps

BAYER8 = np.array(
    [
        [0, 32, 8, 40, 2, 34, 10, 42],
        [48, 16, 56, 24, 50, 18, 58, 26],
        [12, 44, 4, 36, 14, 46, 6, 38],
        [60, 28, 52, 20, 62, 30, 54, 22],
        [3, 35, 11, 43, 1, 33, 9, 41],
        [51, 19, 59, 27, 49, 17, 57, 25],
        [15, 47, 7, 39, 13, 45, 5, 37],
        [63, 31, 55, 23, 61, 29, 53, 21],
    ],
    dtype=np.float64,
)
BAYER8 = (BAYER8 + 0.5) / 64.0  # 0..1

W, H = 720, 1280
RED = (255, 0, 0)
BLACK = (0, 0, 0)


def cover_crop(im: Image.Image, w: int, h: int) -> Image.Image:
    sw, sh = im.size
    scale = max(w / sw, h / sh)
    nw, nh = max(w, int(round(sw * scale))), max(h, int(round(sh * scale)))
    im = im.resize((nw, nh), Image.LANCZOS)
    left, top = (nw - w) // 2, (nh - h) // 2
    return im.crop((left, top, left + w, top + h))


def to_ink_mask(gray: np.ndarray, paper: float, floor: float, ink_target: float | None) -> np.ndarray:
    """Clamp paper/ink zones, dither the midband. Returns boolean ink mask."""
    th = np.tile(BAYER8, (H // 8 + 2, W // 8 + 2))[:H, :W]
    g = np.clip(gray, 0.0, 1.0)

    if ink_target is not None:
        def frac(gamma: float) -> float:
            v = np.power(g, gamma)
            return float((v < th).mean())

        lo, hi = 0.02, 8.0
        for _ in range(50):
            mid = (lo + hi) / 2
            if frac(mid) > ink_target:
                hi = mid
            else:
                lo = mid
        gamma = (lo + hi) / 2
        g = np.power(g, gamma)

    ink = g < th
    ink[g <= floor] = True   # solid ink floor
    ink[g >= paper] = False  # clean paper
    return ink


def make_plate(raw_path: str, slug: str, out_dir: str, ink: float | None,
               invert: bool, denoise: int, paper: float, floor: float) -> None:
    im = Image.open(raw_path).convert("L")
    if invert:
        im = ImageOps.invert(im)
    im = ImageOps.autocontrast(im, cutoff=1)
    if denoise and denoise >= 3:
        im = im.filter(ImageFilter.MedianFilter(denoise))
    im = cover_crop(im, W, H)
    gray = np.asarray(im, dtype=np.float64) / 255.0

    ink_mask = to_ink_mask(gray, paper, floor, ink)
    cov = ink_mask.mean()
    tgt = f" (target {ink*100:.1f}%)" if ink is not None else ""
    print(f"{slug}: ink coverage {cov*100:.1f}%{tgt}")

    for theme in ("red", "dark"):
        field, mark = (RED, BLACK) if theme == "red" else (BLACK, RED)
        arr = np.zeros((H, W, 3), dtype=np.uint8)
        arr[:] = field
        arr[ink_mask] = mark
        out_path = os.path.join(out_dir, theme, f"{slug}.png")
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        Image.fromarray(arr).save(out_path, optimize=True)
        print("  wrote", out_path)


def verify(path: str) -> None:
    im = Image.open(path).convert("RGB")
    arr = np.asarray(im).reshape(-1, 3)
    colors, counts = np.unique(arr, axis=0, return_counts=True)
    total = counts.sum()
    print(f"{path}: {im.size[0]}x{im.size[1]}, {len(colors)} unique colors")
    for col, n in sorted(zip(colors.tolist(), counts.tolist()), key=lambda t: -t[1])[:6]:
        print(f"  {tuple(col)}  {100*n/total:.1f}%")


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("raw", nargs="?", help="raw image to process")
    ap.add_argument("--slug", help="plate name (prediction|voice|industrial|custom)")
    ap.add_argument("--out", default="./out", help="output dir (default ./out)")
    ap.add_argument("--ink", type=float, default=None, help="optional target ink coverage 0..1")
    ap.add_argument("--invert", action="store_true", help="use if the raw is light-on-dark")
    ap.add_argument("--denoise", type=int, default=3, help="median filter size; 0 = off (default 3)")
    ap.add_argument("--paper", type=float, default=0.90, help="clean-paper threshold (default 0.90)")
    ap.add_argument("--floor", type=float, default=0.10, help="solid-ink threshold (default 0.10)")
    ap.add_argument("--verify", help="verify an existing plate's spec")
    args = ap.parse_args()

    if args.verify:
        verify(args.verify)
        return
    if not args.raw or not args.slug:
        ap.error("need RAW and --slug (or --verify PATH)")
    make_plate(args.raw, args.slug, args.out, args.ink, args.invert, args.denoise, args.paper, args.floor)


if __name__ == "__main__":
    main()
