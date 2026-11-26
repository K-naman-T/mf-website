"use client";

import * as React from "react";
import type { HomeContent } from "@/lib/cms/types";
import { WarpCarousel as WarpEngine, type WarpCard } from "./warp/engine";
import styles from "./ofy-art-home.module.css";

type WarpCategory = HomeContent["services"][number]["icons"][number];

/** The section's original work art per theme, in home.md category order. */
const WORK_ART = {
  red: [
    "/assets/ofy-brand/work/red/decision.webp",
    "/assets/ofy-brand/work/red/connected.webp",
    "/assets/ofy-brand/work/red/conversation.webp",
    "/assets/ofy-brand/work/red/operations.webp",
    "/assets/ofy-brand/work/red/commerce.webp",
    "/assets/ofy-brand/work/red/brand.webp",
  ],
  dark: [
    "/assets/ofy-brand/work/dark/decision.webp",
    "/assets/ofy-brand/work/dark/connected.webp",
    "/assets/ofy-brand/work/dark/conversation.webp",
    "/assets/ofy-brand/work/dark/operations.webp",
    "/assets/ofy-brand/work/dark/commerce.webp",
    "/assets/ofy-brand/work/dark/brand.webp",
  ],
} as const;

/** Brand meshes: deep bodies with hot light blooms and dark pockets, edges lit for the lens folds. */
const MESHES: string[][] = [
  ["#FF6A50", "#FF8A72", "#FFB4A6", "#FFE2DC", "#7E1512", "#601412", "#4A1210", "#38100F", "#150809", "#120607", "#0A0507", "#170708", "#601412", "#7E1512", "#A01310", "#C40F0C", "#D4100A", "#FF0A00", "#FF2412", "#FF5030", "#FF8A72", "#FFB9AA", "#150809", "#0D0708"],
  ["#FFE2DC", "#FFB4A6", "#FF8A72", "#FF5030", "#FF2412", "#FF0A00", "#D4100A", "#C40F0C", "#A01310", "#7E1512", "#601412", "#38100F", "#150809", "#120607", "#0A0507", "#1A0608", "#4A1210", "#8F1512", "#D4100A", "#FF2C16", "#FF8060", "#FFCFC2", "#170708", "#100607"],
  ["#150809", "#120607", "#0A0507", "#170708", "#6E1311", "#4A1010", "#2E0B0C", "#1A0608", "#B01410", "#D4100A", "#F00A02", "#FF2412", "#FF4E2E", "#FF8060", "#FFB9A8", "#FFDDD6", "#2E0B0C", "#1A0608", "#100607", "#08080C", "#38100F", "#6E1210", "#FF9A86", "#26090A"],
  ["#FFF0EA", "#FFDDD6", "#FFC4B6", "#FF9A80", "#441010", "#2A080A", "#1C0708", "#120607", "#8A1410", "#661512", "#AA120C", "#CC0F08", "#EC0B03", "#FF180C", "#FF3A20", "#FF6045", "#170708", "#0D0708", "#1A0608", "#5A0F0E", "#B01310", "#FF4426", "#FF8A72", "#090910"],
  ["#FFB9AA", "#FF8060", "#FF6A4E", "#D8301C", "#24090A", "#1A0608", "#0D0708", "#100607", "#4A1010", "#7A1410", "#A8130E", "#D00E07", "#FF0A00", "#FF2C16", "#FF6A4E", "#FFA08C", "#FFCFC2", "#FFE8E0", "#FFF4F0", "#170708", "#38100F", "#8A1410", "#FF3A20", "#120607"],
  ["#FFE8E0", "#FFCFC2", "#FFA18A", "#FFD2C8", "#170708", "#100607", "#0D0708", "#140809", "#3E0C0D", "#7E1411", "#BE100A", "#DE0C04", "#FE0A00", "#FF2412", "#FF4A2E", "#FF7050", "#FFA18A", "#FFD2C8", "#FFF0EA", "#26090A", "#5C1110", "#9E130D", "#1C0708", "#100607"],
];

const NUMERALS: [string, string][] = [
  ["#FF0A00", "#FF3B20"],
  ["#FF1408", "#FF4A2C"],
  ["#FF1E0E", "#FF5535"],
  ["#FF0C04", "#FF3020"],
  ["#FF180C", "#FF4426"],
  ["#FF2412", "#FF6040"],
];


const ACCENTS = ["#FF5A4A", "#FF6A55", "#FF4A3A", "#FF5E4C", "#FF7060", "#FF4434"];

/**
 * Hover glass: on the red field a card frosts into deep black, on the black field
 * into the brand red. The smoke is a hotter/cooler pair from the same family.
 */
const HOVER_GLASS = {
  red: { tint: "#0A0507", ink: "#FFF0EA", smoke: ["#FF0A00", "#FF3A20", "#7E1512"] },
  dark: { tint: "#FF0A00", ink: "#120607", smoke: ["#7E1512", "#FF5030", "#FFB9AA"] },
} as const;

export interface WarpCarouselProps {
  categories: WarpCategory[];
  theme: "red" | "dark";
  /** Hold the field-colored placeholder until the intro is done; mounting the engine starts the card paint. */
  deferred?: boolean;
}

export function WarpCarousel({ categories, theme, deferred = false }: WarpCarouselProps) {
  const art = theme === "dark" ? WORK_ART.dark : WORK_ART.red;
  const [assets, setAssets] = React.useState<{
    art: HTMLImageElement[];
    icons: (HTMLImageElement | null)[];
  } | null>(null);

  React.useEffect(() => {
    let disposed = false;
    const loadArt = (src: string) => {
      const { promise, resolve, reject } = Promise.withResolvers<HTMLImageElement>();
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`warp art failed: ${src}`));
      img.src = src;
      return promise;
    };
    const iconSources: string[] = [];
    for (const category of categories) {
      iconSources.push(category.path);
      for (const point of category.points) iconSources.push(point.path);
    }
    Promise.all([
      // Cards fall back to mesh-only bodies if the art cannot load.
      Promise.all(art.map(loadArt)).catch(() => [] as HTMLImageElement[]),
      Promise.all(iconSources.map((src) => loadArt(src).catch(() => null))),
    ]).then(([loadedArt, icons]) => {
      if (!disposed) setAssets({ art: loadedArt, icons });
    });
    return () => {
      disposed = true;
    };
  }, [theme, art, categories]);

  const background = theme === "dark" ? "#000000" : "#FF0000";

  const cards = React.useMemo<WarpCard[] | null>(() => {
    if (!assets) return null;
    let cursor = 0;
    return categories.map((category, i) => {
      const icon = assets.icons[cursor++] ?? undefined;
      const points = category.points.map((point) => ({
        label: point.label,
        copy: point.copy,
        icon: assets.icons[cursor++] ?? undefined,
      }));
      return {
        title: category.label,
        value: String(i + 1).padStart(2, "0"),
        mesh: MESHES[i % MESHES.length],
        numeral: NUMERALS[i % NUMERALS.length],
        glow: background,
        accent: ACCENTS[i % ACCENTS.length],
        detail: "none",
        image: assets.art.length ? assets.art[i % assets.art.length] : undefined,
        icon,
        points,
      };
    });
  }, [background, categories, assets]);

  if (deferred || !cards) {
    return <div className={styles.warpStage} style={{ background }} aria-hidden="true" />;
  }

  return (
    <div className={styles.warpStage}>
      <WarpEngine
        cards={cards}
        background={background}
        hoverGlass={HOVER_GLASS[theme]}
        ariaLabel="What we build — category carousel"
      />
    </div>
  );
}
