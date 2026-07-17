"use client";

import { useEffect, useRef } from "react";
import { animate } from "motion/react";
import { VIEWPORT } from "@/lib/config";
import styles from "./ofy-art-home.module.css";

export interface BgImage {
  desktop: string;
  mobile: string;
}

export function SeamlessBackgrounds({
  images,
  activeIndex,
}: {
  images: BgImage[];
  activeIndex: number;
}) {
  const layersRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    layersRef.current.forEach((layer, i) => {
      if (!layer) return;
      if (i === activeIndex) {
        animate(
          layer,
          { opacity: 1 },
          { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
        );
      } else if (i === activeIndex - 1 || i === activeIndex + 1) {
        animate(
          layer,
          { opacity: 0 },
          { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
        );
      } else {
        layer.style.opacity = "0";
      }
    });
  }, [activeIndex]);

  return (
    <div className={styles.seamlessBackgrounds} aria-hidden="true">
      {images.map((img, i) => (
        <div
          key={i}
          ref={(el) => {
            layersRef.current[i] = el;
          }}
          className={styles.seamlessBgLayer}
          style={{ opacity: i === 0 ? 1 : 0 }}
        >
          <picture className={styles.seamlessPicture}>
            <source media={`(max-width: ${VIEWPORT.tablet}px)`} srcSet={img.mobile} />
            <img
              src={img.desktop}
              alt=""
              className={styles.seamlessImg}
            />
          </picture>
        </div>
      ))}
    </div>
  );
}
