import type { CSSProperties } from "react";
import type { PageOrnament as PageOrnamentConfig } from "@/lib/cms/types";

interface PageOrnamentProps {
  ornament?: PageOrnamentConfig;
}

export function PageOrnament({ ornament }: PageOrnamentProps) {
  if (!ornament) {
    return null;
  }

  return (
    <span
      aria-hidden="true"
      className={`mf-page-ornament mf-page-ornament-${ornament.placement}`}
      style={{ "--mf-ornament-src": `url(${ornament.asset})` } as CSSProperties}
    />
  );
}
