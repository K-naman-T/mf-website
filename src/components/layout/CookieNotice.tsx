"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "mf-cookie-choice";

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!window.localStorage.getItem(STORAGE_KEY));
  }, []);

  const choose = (value: "essential" | "accepted") => {
    window.localStorage.setItem(STORAGE_KEY, value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside className="mf-cookie-notice" aria-label="Cookie notice">
      <div>
        <strong>Cookies, kept minimal.</strong>
        <p>We use essential storage for preferences. If analytics are added later, they will respect this choice.</p>
      </div>
      <Link href="/legal/cookie-policy">Cookie Policy</Link>
      <button type="button" onClick={() => choose("essential")}>Essential only</button>
      <button type="button" onClick={() => choose("accepted")}>Accept</button>
    </aside>
  );
}
