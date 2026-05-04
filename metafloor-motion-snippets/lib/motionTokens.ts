export const motionTokens = {
  duration: {
    micro: 0.12,
    fast: 0.18,
    medium: 0.24,
    slow: 0.6,
    loop: 6,
  },
  ease: {
    standard: [0.22, 1, 0.36, 1] as const,
    smooth: [0.4, 0, 0.2, 1] as const,
    signal: [0.45, 0.05, 0.55, 0.95] as const,
  },
  delay: {
    staggerTight: 0.05,
    staggerMedium: 0.1,
  },
  color: {
    red: "#E31B23",
    black: "#050505",
    white: "#F5F5F5",
  },
};

export const siteAnimation = {
  ooBlinkRepeatMs: 10000,
  heroAmbientSeconds: 6,
};
