import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  HomeContentSchema,
  LegalDocumentSchema,
  LegalIndexSchema,
  PageContentSchema,
  type HomeContent,
  type LegalDocument,
  type LegalIndex,
  type PageContent,
} from "./types";

const HOME_MD_PATH = path.join(process.cwd(), "src", "content", "home.md");
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
  const resolveIcon = (id: string, source: string) => {
    const resolvedPath = iconMap.get(id);
    if (!resolvedPath) {
      throw new Error(`Icon "${id}" not found in content/icons.json for ${source}`);
    }
    return resolvedPath;
  };

  const services = (data.services ?? []).map((svc: Record<string, unknown>) => ({
    ...svc,
    icons: (
      svc.icons as Array<{
        iconId: string;
        label: string;
        points: Array<{ iconId: string; label: string; copy: string }>;
      }>
    ).map((icon) => ({
      iconId: icon.iconId,
      label: icon.label,
      path: resolveIcon(icon.iconId, String(svc.title)),
      points: icon.points.map((point) => ({
        ...point,
        path: resolveIcon(point.iconId, icon.label),
      })),
    })),
  }));

  const merged = {
    hero: data.hero,
    manifesto: data.manifesto,
    services,
    process: data.process,
    navigation: data.navigation,
    contact: data.contact,
    footer: data.footer,
  };

  return HomeContentSchema.parse(merged);
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
