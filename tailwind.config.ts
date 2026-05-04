import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "brand-red": "#FF0000",
        "bg-red": "#FF0000",
        "bg-dark": "#000000",
        "bg-surface-dark": "#0A0A0A",
        "text-on-red": "#000000",
        "text-on-dark": "#FFFFFF",
        "text-secondary": "#888888",
        "text-secondary-dark": "#A0A0A0",
        "button-primary-red": "#000000",
        "button-primary-dark": "#FF0000",
        "border-subtle": "#333333",
        "border-strong": "#000000",
        "grid-line": "#000000",
      },
      fontFamily: {
        display: ["Teko", "Bebas Neue", "Anton", "Osazy", "system-ui", "sans-serif"],
        heading: ["Teko", "Bebas Neue", "Anton", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        label: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display": "clamp(3.5rem, 10vw, 8rem)",
        "display-mobile": "clamp(3rem, 15vw, 8rem)",
        "h1": "clamp(2.5rem, 6vw, 5rem)",
        "h2": "clamp(1.75rem, 4vw, 3rem)",
      },
      lineHeight: {
        display: "0.9",
        heading: "0.95",
        tight: "0.8",
      },
      letterSpacing: {
        label: "0.12em",
        logo: "0.15em",
      },
      borderRadius: {
        none: "0px",
        browser: "8px",
      },
      spacing: {
        section: "120px",
        "section-mobile": "80px",
      },
    },
  },
  plugins: [],
};

export default config;
