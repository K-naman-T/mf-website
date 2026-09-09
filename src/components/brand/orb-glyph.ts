/** Left O from public/brand/ofy-short-logo.svg, fitted to a square viewBox. */
export const OFY_O_PATH =
  "M197.28 0.129317C257.639 -2.37486 357.111 31.3609 329.151 112.634C296.323 208.043 124.134 246.196 44.0571 201.171C-22.5053 163.741 -6.58047 96.6609 44.9872 54.198C88.1356 18.6569 142.372 2.40055 197.28 0.129317ZM80.5492 94.5894C87.3106 101.644 104.125 108 112.65 114.648C118.319 119.065 118.732 121.669 117.284 128.566C114.477 141.894 103.446 161.861 109.722 175.131C111.881 179.698 115.003 179.74 119.484 179.507C143.432 178.267 154.852 150.372 172.329 137.26C183.442 145.064 191.861 156.645 202.95 164.623C215.34 173.542 223.242 175.838 224.585 156.72C225.587 142.369 218.244 131.462 220.007 117.684C222.174 100.696 250.967 87.2099 262.249 75.729C275.295 62.4593 253.11 63.2414 244.351 63.7072C231.217 64.3978 218.414 69.689 206.274 70.8205C198.752 71.5193 197.887 70.313 194.474 63.9901C191.473 58.441 179.511 30.8367 175.702 29.0231C172.402 27.459 169.264 29.8134 166.805 31.8268C161.427 36.2361 155.143 49.3727 151.52 56.0117C149.352 59.9884 145.68 70.0384 142.615 72.3928C138.862 75.2797 123.495 74.3563 117.907 74.9137C103.882 76.303 88.3135 79.4645 75.6318 85.7291C75.3811 86.8772 79.4493 93.433 80.5411 94.5727L80.5492 94.5894Z";

export const OFY_O_VIEWBOX = "0 0 380 380";
export const OFY_O_TRANSFORM = "translate(22.697 68.089)";

/** Standard 8×8 ordered Bayer matrix (values 0–63). */
export const BAYER_8: readonly (readonly number[])[] = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

export const BAYER_THRESHOLD = 40;
export const BAYER_CELL = 3;
export const BAYER_TILE = BAYER_8.length * BAYER_CELL;

export function bayerMaskImage(): string {
  const rects: string[] = [];
  for (let y = 0; y < BAYER_8.length; y++) {
    const row = BAYER_8[y]!;
    for (let x = 0; x < row.length; x++) {
      if (row[x]! < BAYER_THRESHOLD) {
        rects.push(
          `<rect x="${x * BAYER_CELL}" y="${y * BAYER_CELL}" width="${BAYER_CELL}" height="${BAYER_CELL}" fill="white"/>`,
        );
      }
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${BAYER_TILE}" height="${BAYER_TILE}">${rects.join("")}</svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}
