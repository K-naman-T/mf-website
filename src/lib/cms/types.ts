import { z } from "zod";

export const NavigationLinkSchema = z.object({
  href: z.string().min(1),
  label: z.string().min(1),
});

export const NavigationSchema = z.object({
  links: z.array(NavigationLinkSchema),
  cta: z.object({
    label: z.string().min(1),
    href: z.string().min(1),
  }),
});

export const HeroSchema = z.object({
  eyebrow: z.string().min(1),
  headline_line1: z.string().min(1),
  headline_line2: z.string().min(1),
  headline_line3: z.string().min(1),
  subheadline: z.string().min(1),
  cta_primary: z.string().min(1),
  cta_secondary: z.string().min(1),
});

export const SiteMetadataSchema = z.object({
  site_name: z.string().min(1),
  tagline: z.string().min(1),
});

export const HomeTileSchema = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1),
  href: z.string().min(1),
});

export const HomeProblemSchema = z.object({
  eyebrow: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1),
});

export const HomeProcessStepSchema = z.object({
  number: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

export const HomeContactSchema = z.object({
  email: z.string().min(1),
  website: z.string().min(1),
  tagline: z.string().min(1),
});

export const HomeContentSchema = z.object({
  hero: HeroSchema,
  navigation: NavigationSchema,
  problem: HomeProblemSchema,
  capabilities: z.array(HomeTileSchema),
  work: z.array(HomeTileSchema),
  process: z.object({
    eyebrow: z.string().min(1),
    title: z.string().min(1),
    description: z.string().min(1),
    steps: z.array(HomeProcessStepSchema),
    cta: z.string().min(1),
  }),
  contact: HomeContactSchema,
  metadata: SiteMetadataSchema,
});

export const PageCardSchema = z.object({
  number: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  tags: z.array(z.string()).optional(),
});

export const PageSectionSchema = z.object({
  eyebrow: z.string().min(1).optional(),
  title: z.string().min(1),
  body: z.string().min(1).optional(),
  cards: z.array(PageCardSchema).optional(),
});

export const PageContentSchema = z.object({
  slug: z.string().min(1),
  theme: z.enum(["red", "dark"]).default("red"),
  hero: z.object({
    eyebrow: z.string().min(1),
    title: z.array(z.string().min(1)).min(1),
    intro: z.string().min(1),
  }),
  sections: z.array(PageSectionSchema),
});

export type NavigationLink = z.infer<typeof NavigationLinkSchema>;
export type Navigation = z.infer<typeof NavigationSchema>;
export type Hero = z.infer<typeof HeroSchema>;
export type SiteMetadata = z.infer<typeof SiteMetadataSchema>;
export type HomeContent = z.infer<typeof HomeContentSchema>;
export type HomeTile = z.infer<typeof HomeTileSchema>;
export type HomeProblem = z.infer<typeof HomeProblemSchema>;
export type HomeProcessStep = z.infer<typeof HomeProcessStepSchema>;
export type HomeContact = z.infer<typeof HomeContactSchema>;
export type PageCard = z.infer<typeof PageCardSchema>;
export type PageSection = z.infer<typeof PageSectionSchema>;
export type PageContent = z.infer<typeof PageContentSchema>;
