import { z } from "zod";

export const NavigationLinkSchema = z.object({
  href: z.string().min(1),
  label: z.string().min(1),
});

export const NavigationSchema = z.object({
  links: z.array(NavigationLinkSchema),
  cta: z.object({
    label: z.string().min(1),
    shortLabel: z.string().optional(),
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

export const ServiceIconSchema = z.object({
  iconId: z.string().min(1),
  label: z.string().min(1),
  path: z.string().min(1),
});

export const ServiceSectionSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  icons: z.array(ServiceIconSchema),
});

export const BeatSchema = z.object({
  heading: z.string().min(1),
  body: z.string().min(1),
});

export const ManifestoContentSchema = z.object({
  title: z.string().min(1),
  eyebrow: z.string().min(1),
  intro: z.string().min(1),
  backLabel: z.string().min(1),
  beats: z.array(BeatSchema),
});

export const HomeContactSchema = z.object({
  heading: z.string().optional(),
  email: z.string().min(1),
  buttonText: z.string().optional(),
});

export const HomeMetadataSchema = z.object({
  site_name: z.string().min(1),
  tagline: z.string().min(1),
  site_url: z.string().url(),
  description: z.string().min(1),
});

export const HomeContentSchema = z.object({
  hero: z.object({
    heading: z.string().min(1),
    body: z.string().min(1),
  }),
  services: z.array(ServiceSectionSchema),
  navigation: NavigationSchema,
  cta: z.object({
    label: z.string().min(1),
    href: z.string().min(1),
  }).default({ label: "SEND THE PROBLEM", href: "mailto:hello@oddfromyou.com" }),
  contact: HomeContactSchema,
  footer: z.object({
    copyright: z.string().min(1),
    links: z.array(LinkSchema),
  }).default({ copyright: "© 2024 OddFromYou.", links: [] }),
  metadata: HomeMetadataSchema.default({
    site_name: "OddFromYou",
    tagline: "We make the internet less forgettable.",
    site_url: "https://oddfromyou.com",
    description: "OddFromYou builds production-grade systems with design taste and engineering soul.",
  }),
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
export type HomeContent = z.infer<typeof HomeContentSchema>;
export type HomeContact = z.infer<typeof HomeContactSchema>;
export type LegalIndex = z.infer<typeof LegalIndexSchema>;
export type LegalDocument = z.infer<typeof LegalDocumentSchema>;
export type LegalDocumentEntry = z.infer<typeof LegalDocumentEntrySchema>;
export type IconCatalog = z.infer<typeof IconCatalogSchema>;
export type IconEntry = z.infer<typeof IconEntrySchema>;
export type ServiceIcon = z.infer<typeof ServiceIconSchema>;
export type ServiceSection = z.infer<typeof ServiceSectionSchema>;
export type Beat = z.infer<typeof BeatSchema>;
export type ManifestoContent = z.infer<typeof ManifestoContentSchema>;
export type PageCard = z.infer<typeof PageCardSchema>;
export type PageSection = z.infer<typeof PageSectionSchema>;
export type PageContent = z.infer<typeof PageContentSchema>;
