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

export const LinkSchema = z.object({
  href: z.string().min(1),
  label: z.string().min(1),
});

export const IconEntrySchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  path: z.string().min(1),
});

export const IconCatalogSchema = z.object({
  icons: z.array(IconEntrySchema),
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
  site_url: z.string().url(),
  description: z.string().min(1),
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
  homeSections: z.object({
    capabilitiesEyebrow: z.string().min(1),
    capabilitiesTitle: z.string().min(1),
    workEyebrow: z.string().min(1),
    workTitle: z.string().min(1),
    primaryCtaLabel: z.string().min(1),
    secondaryCtaLabel: z.string().min(1),
  }),
  contact: HomeContactSchema,
  footer: z.object({
    description: z.string().min(1),
    ctaLabel: z.string().min(1),
    headline: z.string().min(1),
    body: z.string().min(1),
    copyright: z.string().min(1),
    columns: z.array(z.object({
      title: z.string().min(1),
      links: z.array(LinkSchema),
    })),
    companyLinks: z.array(LinkSchema),
    bottomLinks: z.array(LinkSchema),
  }),
  metadata: SiteMetadataSchema,
});

export const LegalDocumentEntrySchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
});

export const LegalIndexSchema = z.object({
  hero: z.object({
    eyebrow: z.string().min(1),
    title: z.array(z.string().min(1)).min(1),
    intro: z.string().min(1),
  }),
  documents: z.array(LegalDocumentEntrySchema),
});

export const LegalDocumentSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  lastUpdated: z.string().optional(),
  body: z.string().min(1),
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
  cta: z.object({
    title: z.string().min(1),
  }).default({ title: "READY WHEN IT NEEDS TO SHIP." }),
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
export type LegalIndex = z.infer<typeof LegalIndexSchema>;
export type LegalDocument = z.infer<typeof LegalDocumentSchema>;
export type LegalDocumentEntry = z.infer<typeof LegalDocumentEntrySchema>;
export type IconCatalog = z.infer<typeof IconCatalogSchema>;
export type IconEntry = z.infer<typeof IconEntrySchema>;
export type PageCard = z.infer<typeof PageCardSchema>;
export type PageSection = z.infer<typeof PageSectionSchema>;
export type PageContent = z.infer<typeof PageContentSchema>;
