"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "motion/react";
import { VIEWPORT } from "@/lib/config";
import styles from "./ofy-art-home.module.css";

export type BgImage =
  | {
      desktop: string;
      mobile: string;
      desktopVideo?: string;
    }
  | {
      fill: string;
    };

export function SeamlessBackgrounds({
  images,
  activeIndex,
  visible = true,
}: {
  images: BgImage[];
  activeIndex: number;
  visible?: boolean;
}) {
  const layersRef = useRef<(HTMLDivElement | null)[]>([]);
  const introDoneRef = useRef(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${VIEWPORT.tablet + 1}px)`);
    const updateViewport = () => setIsDesktop(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    const firstLayer = layersRef.current[0];
    if (!firstLayer) return;
    firstLayer.style.transform = "translateY(48px)";
    animate(firstLayer, { opacity: 1, y: 0 }, { duration: 1.4, ease: [0.16, 1, 0.3, 1] }).then(() => {
      introDoneRef.current = true;
    });
  }, []);

  useEffect(() => {
    layersRef.current.forEach((layer, i) => {
      if (!layer) return;
      if (i === 0 && !introDoneRef.current) return;
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
    <div
      className={styles.seamlessBackgrounds}
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden="true"
    >
      {images.map((img, i) => (
        <div
          key={i}
          ref={(el) => {
            layersRef.current[i] = el;
          }}
          className={styles.seamlessBgLayer}
        >
          {"fill" in img ? (
            <div
              className={styles.seamlessImg}
              style={{ background: img.fill }}
            />
          ) : i === 0 && isDesktop && img.desktopVideo ? (
            <video
              className={styles.seamlessImg}
               src={img.desktopVideo}
              poster={img.desktop}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
            />
          ) : (
            <picture className={styles.seamlessPicture}>
              <source media={`(max-width: ${VIEWPORT.tablet}px)`} srcSet={img.mobile} />
              <img
                src={img.desktop}
                alt=""
                className={styles.seamlessImg}
              />
            </picture>
          )}
        </div>
      ))}
    </div>
  );
}
