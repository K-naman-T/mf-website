#!/usr/bin/env bash
# OFY work-plate pipeline — photographic duotone plates. No dither anywhere.
#
#   base   raw photo -> master   (grayscale, denoise, cover-crop, ONE shared level clamp + paper knee)
#   render every master -> red + dark theme plates via one shared tone mapping, WebP
#
# The plate IS the generated photograph: its own grain and texture stay, nothing is screened
# or posterized on top. Tone is mapped onto the two brand colours as a continuous ramp
# (black at the dark end, #FF0000 at the light end), which is what keeps a photographic plate
# sitting inside a flat red/black page.
#
#   red theme  = photograph mapped black -> #FF0000
#   dark theme = the same master inverted, then mapped black -> #FF0000
#
# Needs: ImageMagick 7 (`magick`).
#
# Usage:
#   scripts/ofy-plate-pipeline.sh base <raw.png> <slug> [--zoom PCT] [--invert]
#   scripts/ofy-plate-pipeline.sh render [slug...]
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RAW_DIR="${OFY_RAW_DIR:-$ROOT/assets/ofy-plate-raws}"
MASTER_DIR="${OFY_MASTER_DIR:-$ROOT/assets/ofy-plate-masters}"
OUT_DIR="${OFY_OUT_DIR:-$ROOT/public/assets/ofy-brand/work}"

# --- shared, set-wide treatment: the only place these numbers live --------------
W="${OFY_W:-720}"; H="${OFY_H:-1280}"     # ~2x the rendered tile: right for DPR 2, ~30 KB a plate
DENOISE="${OFY_DENOISE:-3}"               # median; takes out generator JPEG artifacts, keeps grain
ZOOM_PCT="${OFY_ZOOM_PCT:-100}"           # cover-crop zoom in percent; >100 trims (108 cuts the generator watermark)
LEVEL_LO="${OFY_LEVEL_LO:-15%}"; LEVEL_HI="${OFY_LEVEL_HI:-85%}"   # ONE curve for the whole set
WHITE_KNEE="${OFY_WHITE_KNEE:-92%}"       # shared knee: anything at/above this is paper -> pure field
QUALITY="${OFY_QUALITY:-88}"              # WebP quality

command -v magick >/dev/null || { echo "missing: ImageMagick 7 (magick)" >&2; exit 1; }

slugs() {
  if [ "$#" -gt 0 ]; then printf '%s\n' "$@"
  else find "$MASTER_DIR" -maxdepth 1 -name '*.png' -printf '%f\n' | sed 's/\.png$//' | sort; fi
}

stage_base() {
  local raw="$1" slug="$2"; shift 2
  local zoom="$ZOOM_PCT" args=(-colorspace Gray)
  while [ "$#" -gt 0 ]; do case "$1" in
    --zoom) zoom="$2"; shift 2 ;;
    --invert) args+=(-negate); shift ;;
    *) echo "unknown option: $1" >&2; exit 1 ;;
  esac; done
  mkdir -p "$MASTER_DIR"
  magick "$raw" "${args[@]}" -statistic Median "$DENOISE" \
    -resize "$(( W * zoom / 100 ))x$(( H * zoom / 100 ))^" \
    -background white -gravity center -extent "${W}x${H}" \
    -level "$LEVEL_LO,$LEVEL_HI" -white-threshold "$WHITE_KNEE" -depth 8 "$MASTER_DIR/$slug.png"
  echo "base    $MASTER_DIR/$slug.png  ($(magick identify -format '%wx%h' "$MASTER_DIR/$slug.png"))"
}

# grayscale -> sRGB with G and B zeroed = black..red ramp, continuous tone.
# Pass `--invert` for the dark theme: the master is negated FIRST, so paper lands on black and
# the object on red. Negating the red plate itself would flip the hue to cyan.
duotone() { local src="$1" out="$2" invert="${3:-}" a=()
  [ "$invert" = "--invert" ] && a+=(-negate)
  magick "$src" -colorspace Gray "${a[@]}" -colorspace sRGB \
    -channel G -evaluate set 0 -channel B -evaluate set 0 +channel -depth 8 "$out"; }

stage_render() {
  mkdir -p "$OUT_DIR/red" "$OUT_DIR/dark"
  local slug tmp
  while read -r slug; do
    [ -n "$slug" ] || continue
    tmp="$(mktemp -d)"
    duotone "$MASTER_DIR/$slug.png" "$tmp/red.png"
    duotone "$MASTER_DIR/$slug.png" "$tmp/dark.png" --invert
    magick "$tmp/red.png"  -quality "$QUALITY" -define webp:method=6 "$OUT_DIR/red/$slug.webp"
    magick "$tmp/dark.png" -quality "$QUALITY" -define webp:method=6 "$OUT_DIR/dark/$slug.webp"
    rm -rf "$tmp"
  done < <(slugs "$@")
  echo "render  -> $OUT_DIR/{red,dark}  (${W}x${H} WebP q$QUALITY, level $LEVEL_LO..$LEVEL_HI, no dither)"
  local f
  for f in "$OUT_DIR"/red/*.webp; do
    printf '  %-20s %s  field=%s  %sKB\n' "$(basename "$f")" \
      "$(magick identify -format '%wx%h' "$f")" \
      "$(magick "$f" -format '%[pixel:p{2,2}]' info:)" \
      "$(( $(stat -c%s "$f") / 1024 ))"
  done
}

case "${1:-}" in
  base) shift; stage_base "$@" ;;
  render) shift; stage_render "$@" ;;
  *) sed -n '2,17p' "${BASH_SOURCE[0]}"; exit 1 ;;
esac
