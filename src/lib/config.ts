export const VIEWPORT = {
  tablet: 768,
  desktop: 1024,
  mobileMax: 390,
} as const;

export const QUERIES = {
  mobile: `(max-width: ${VIEWPORT.tablet}px)`,
  desktop: `(min-width: ${VIEWPORT.desktop}px)`,
} as const;
