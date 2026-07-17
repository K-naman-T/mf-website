import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  HomeContentSchema,
  ManifestoContentSchema,
  LegalDocumentSchema,
  LegalIndexSchema,
  PageContentSchema,
  type HomeContent,
  type ManifestoContent,
  type LegalDocument,
  type LegalIndex,
  type PageContent,
} from "./types";

const HOME_MD_PATH = path.join(process.cwd(), "src", "content", "home.md");
const MANIFESTO_MD_PATH = path.join(process.cwd(), "src", "content", "manifesto.md");
const CONTENT_DIR = path.join(process.cwd(), "content");

function getIconMap(): Map<string, string> {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, "icons.json"), "utf8");
  const parsed = JSON.parse(raw);
  const map = new Map<string, string>();
  for (const icon of parsed.icons) {
    map.set(icon.id, icon.path);
  }
  return map;
}

export function getHomeContent(): HomeContent {
  const raw = fs.readFileSync(HOME_MD_PATH, "utf8");
  const { data } = matter(raw);

  const iconMap = getIconMap();

  const services = (data.services ?? []).map((svc: Record<string, unknown>) => ({
    ...svc,
    icons: (svc.icons as Array<{ iconId: string; label: string }>).map(
      (icon) => {
        const resolvedPath = iconMap.get(icon.iconId);
        if (!resolvedPath) {
          throw new Error(
            `Icon "${icon.iconId}" not found in content/icons.json for service "${svc.title}"`,
          );
        }
        return { ...icon, path: resolvedPath };
      },
    ),
  }));

  const merged = {
    hero: data.hero,
    services,
    navigation: data.navigation,
    contact: data.contact,
    footer: data.footer,
  };

  return HomeContentSchema.parse(merged);
}

export function getManifestoContent(): ManifestoContent {
  const raw = fs.readFileSync(MANIFESTO_MD_PATH, "utf8");
  const { data } = matter(raw);

  return ManifestoContentSchema.parse({
    title: data.title,
    eyebrow: data.eyebrow,
    intro: data.intro,
    backLabel: data.backLabel,
    beats: data.beats ?? [],
  });
}

export function getPageContent(slug: string): PageContent {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, "pages", `${slug}.json`), "utf8");
  const parsed = JSON.parse(raw);
  return PageContentSchema.parse(parsed);
}

export function getLegalIndex(): LegalIndex {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, "legal", "index.json"), "utf8");
  const parsed = JSON.parse(raw);
  return LegalIndexSchema.parse(parsed);
}

export function getLegalSlugs(): string[] {
  return getLegalIndex().documents.map((document) => document.slug);
}

export function getLegalDocument(slug: string): LegalDocument {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, "legal", `${slug}.md`), "utf8");
  const lines = raw.trim().split(/\r?\n/);
  const title = lines.find((line) => line.startsWith("# "))?.replace(/^#\s+/, "").trim() ?? slug;
  const lastUpdated = lines.find((line) => line.startsWith("**Last updated:"))?.replace(/^\*\*Last updated:\s*/, "").replace(/\*\*$/, "").trim();
  const body = lines.filter((line) => !line.startsWith("# ") && !line.startsWith("**Last updated:")).join("\n").trim();

  return LegalDocumentSchema.parse({
    slug,
    title,
    lastUpdated,
    body,
  });
}
