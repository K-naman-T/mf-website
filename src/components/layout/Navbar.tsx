"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";
import { MetafloorShortLogo } from "@/components/brand/MetafloorShortLogo";
import { useState } from "react";
import type { Navigation } from "@/lib/cms/types";

interface NavbarProps {
  content: Navigation;
  themeOverride?: "red" | "dark";
}

export function Navbar({ content, themeOverride }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const isDark = (themeOverride ?? theme) === "dark";

  return (
    <nav className={isDark ? "mf-nav mf-nav-dark" : "mf-nav mf-nav-red"}>
      <div className="mf-nav-inner">
        <Link href="/" className="mf-nav-brand">
          <MetafloorShortLogo theme={isDark ? "light" : "dark"} className="h-7 w-auto" />
        </Link>

        <div className="mf-nav-links">
          {content.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? "mf-nav-link mf-nav-link-active" : "mf-nav-link"}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="mf-nav-actions">
          <button
            type="button"
            onClick={toggleTheme}
            className="mf-theme-toggle"
            aria-label={isDark ? "Switch to red theme" : "Switch to dark theme"}
          >
            <span>{isDark ? "RED" : "DARK"}</span>
          </button>

          <Link
            href={content.cta.href}
            className="mf-nav-cta"
          >
            {content.cta.label}
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="mf-nav-toggle"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {menuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mf-mobile-menu">
          <div className="mf-mobile-menu-inner">
            <div className="mf-mobile-menu-header">
              <Link href="/" className="mf-nav-brand" onClick={() => setMenuOpen(false)}>
                <MetafloorShortLogo theme={isDark ? "light" : "dark"} className="h-7 w-auto" />
              </Link>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="mf-mobile-menu-close"
                aria-label="Close menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="mf-mobile-nav">
              {content.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={pathname === link.href ? "mf-mobile-link mf-mobile-link-active" : "mf-mobile-link"}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mf-mobile-menu-footer">
              <button
                type="button"
                onClick={() => {
                  toggleTheme();
                  setMenuOpen(false);
                }}
                className="mf-mobile-theme-toggle"
              >
                SWITCH TO {isDark ? "RED" : "DARK"}
              </button>
              <Link
                href={content.cta.href}
                onClick={() => setMenuOpen(false)}
                className="mf-mobile-cta"
              >
                {content.cta.label}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
