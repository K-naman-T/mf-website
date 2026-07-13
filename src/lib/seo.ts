import type { Metadata } from "next";
import { getHomeContent, getLegalDocument, getLegalIndex, getLegalSlugs, getPageContent } from "@/lib/cms/loader";

export function getSiteUrl() {
  return getHomeContent().metadata.site_url.replace(/\/$/, "");
}

export function getRootMetadata(): Metadata {
  const home = getHomeContent();
  return {
    metadataBase: new URL(home.metadata.site_url),
    title: {
      default: `${home.metadata.site_name} — ${home.metadata.tagline}`,
      template: `%s — ${home.metadata.site_name}`,
    },
    description: home.metadata.description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      url: home.metadata.site_url,
      siteName: home.metadata.site_name,
      title: `${home.metadata.site_name} — ${home.metadata.tagline}`,
      description: home.metadata.description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${home.metadata.site_name} — ${home.metadata.tagline}`,
      description: home.metadata.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export function getHomeMetadata(): Metadata {
  const home = getHomeContent();
  return {
    title: home.metadata.site_name,
    description: home.metadata.description,
    alternates: { canonical: "/" },
  };
}

export function getPageMetadata(slug: string): Metadata {
  const page = getPageContent(slug);
  return {
    title: page.hero.title.join(" "),
    description: page.hero.intro,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title: page.hero.title.join(" "),
      description: page.hero.intro,
      url: `/${slug}`,
      type: "website",
    },
  };
}

export function getLegalIndexMetadata(): Metadata {
  const legal = getLegalIndex();
  return {
    title: legal.hero.title.join(" "),
    description: legal.hero.intro,
    alternates: { canonical: "/legal" },
  };
}

export function getLegalDocumentMetadata(slug: string): Metadata {
  if (!getLegalSlugs().includes(slug)) return {};
  const document = getLegalDocument(slug);
  const description = document.body.replace(/[#*_`>-]/g, "").replace(/\s+/g, " ").trim().slice(0, 158);
  return {
    title: document.title,
    description,
    alternates: { canonical: `/legal/${slug}` },
    openGraph: {
      title: document.title,
      description,
      url: `/legal/${slug}`,
      type: "article",
    },
  };
}

export function getOrganizationJsonLd() {
  const home = getHomeContent();
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: home.metadata.site_name,
    url: siteUrl,
    email: home.contact.email,
    description: home.metadata.description,
    sameAs: [],
  };
}

export function getWebsiteJsonLd() {
  const home = getHomeContent();
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: home.metadata.site_name,
    url: siteUrl,
    description: home.metadata.description,
    inLanguage: "en",
  };
}

export function getLegalDocumentJsonLd(slug: string) {
  const document = getLegalDocument(slug);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: document.title,
    url: `${getSiteUrl()}/legal/${slug}`,
    dateModified: document.lastUpdated,
    isPartOf: {
      "@type": "WebSite",
      name: getHomeContent().metadata.site_name,
      url: getSiteUrl(),
    },
  };
}
