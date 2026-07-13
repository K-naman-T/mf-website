"use client";

import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import styles from "./footer.module.css";

const links = [
  { href: "/legal/privacy-policy", label: "Privacy Policy" },
  { href: "/legal/cookie-policy", label: "Cookie Policy" },
  { href: "/legal/terms-of-service", label: "Terms of Service" },
  { href: "/legal", label: "Legal" },
];

export function Footer() {
  const { theme } = useTheme();

  return (
    <footer className={styles.footer} data-theme={theme}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logoLink} aria-label="OddFromYou home">
            <img className={styles.logo} src="/brand/ofy-short-logo.svg" alt="" />
          </Link>
          <p className={styles.copyright}>&copy; OddFromYou. All rights reserved.</p>
        </div>
        <nav className={styles.links}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={styles.link}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
