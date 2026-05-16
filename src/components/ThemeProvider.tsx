"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "red" | "dark";
export type Accent =
  | "oxide"
  | "terracotta"
  | "sage"
  | "steel"
  | "ochre"
  | "plum"
  | "aqua"
  | "mint"
  | "sky"
  | "violet"
  | "lime"
  | "coral";

export const ACCENTS: { value: Accent; label: string }[] = [
  { value: "oxide", label: "Oxide" },
  { value: "terracotta", label: "Terracotta" },
  { value: "sage", label: "Sage" },
  { value: "steel", label: "Steel" },
  { value: "ochre", label: "Ochre" },
  { value: "plum", label: "Plum" },
  { value: "aqua", label: "Aqua" },
  { value: "mint", label: "Mint" },
  { value: "sky", label: "Sky" },
  { value: "violet", label: "Violet" },
  { value: "lime", label: "Lime" },
  { value: "coral", label: "Coral" },
];

const DEFAULT_ACCENT: Accent = "lime";

function isAccent(value: string | null): value is Accent {
  return ACCENTS.some((item) => item.value === value);
}

interface ThemeContextValue {
  theme: Theme;
  accent: Accent;
  toggleTheme: () => void;
  cycleAccent: () => void;
  setTheme: (t: Theme) => void;
  setAccent: (a: Accent) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [accent, setAccentState] = useState<Accent>(DEFAULT_ACCENT);

  useEffect(() => {
    const stored = localStorage.getItem("mf-theme") as Theme | null;
    const storedAccent = localStorage.getItem("mf-accent") as Accent | null;
    if (stored === "red" || stored === "dark") {
      setThemeState(stored);
      document.documentElement.setAttribute("data-theme", stored);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
    }

    if (isAccent(storedAccent)) {
      setAccentState(storedAccent);
      document.documentElement.setAttribute("data-accent", storedAccent);
    } else {
      document.documentElement.setAttribute("data-accent", DEFAULT_ACCENT);
    }
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("mf-theme", t);
    document.documentElement.setAttribute("data-theme", t);
  };

  const setAccent = (a: Accent) => {
    setAccentState(a);
    localStorage.setItem("mf-accent", a);
    document.documentElement.setAttribute("data-accent", a);
  };

  const toggleTheme = () => {
    setTheme(theme === "red" ? "dark" : "red");
  };

  const cycleAccent = () => {
    const currentIndex = ACCENTS.findIndex((item) => item.value === accent);
    setAccent(ACCENTS[(currentIndex + 1) % ACCENTS.length].value);
  };

  return (
    <ThemeContext.Provider value={{ theme, accent, toggleTheme, cycleAccent, setTheme, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
