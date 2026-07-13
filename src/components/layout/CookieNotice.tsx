"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "@/components/motion/core/useReducedMotion";

const STORAGE_KEY = "mf-cookie-choice";

export function CookieNotice() {
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    setVisible(!window.localStorage.getItem(STORAGE_KEY));
  }, []);

  const choose = (value: "essential" | "accepted" | "rejected") => {
    window.localStorage.setItem(STORAGE_KEY, value);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          className="mf-cookie-dock"
          aria-label="Cookie notice"
          initial={reduced ? { opacity: 0 } : { y: 20, opacity: 0, scale: 0.98 }}
          animate={reduced ? { opacity: 1 } : { y: 0, opacity: 1, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { y: 20, opacity: 0, scale: 0.98 }}
          transition={{ duration: reduced ? 0.2 : 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mf-cookie-dock-message">
            <span className="mf-cookie-dock-marks" aria-hidden="true">
              <span className="mf-cookie-dock-dot mf-cookie-dock-dot-red" />
              <span className="mf-cookie-dock-dot mf-cookie-dock-dot-second" />
            </span>
            <p className="mf-cookie-dock-text">
              We use essential storage for preferences. Optional cookies stay off unless you accept.{" "}
              <Link href="/legal/cookie-policy" className="mf-cookie-dock-link">
                Cookie Policy
              </Link>
            </p>
          </div>
          <div className="mf-cookie-dock-actions">
            <button
              type="button"
              className="mf-cookie-dock-btn mf-cookie-dock-btn-ghost"
              onClick={() => choose("rejected")}
            >
              Reject all
            </button>
            <button
              type="button"
              className="mf-cookie-dock-btn mf-cookie-dock-btn-outline"
              onClick={() => choose("essential")}
            >
              Essential only
            </button>
            <button
              type="button"
              className="mf-cookie-dock-btn mf-cookie-dock-btn-primary"
              onClick={() => choose("accepted")}
            >
              Accept all
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
