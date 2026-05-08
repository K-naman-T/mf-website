import fs from "fs";
import path from "path";
import {
  HomeContentSchema,
  IconCatalogSchema,
  LegalDocumentSchema,
  LegalIndexSchema,
  type IconCatalog,
  PageContentSchema,
  type HomeContent,
  type LegalDocument,
  type LegalIndex,
  type PageContent,
} from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");

export function getIconCatalog(): IconCatalog {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, "icons.json"), "utf8");
  const parsed = JSON.parse(raw);
  return IconCatalogSchema.parse(parsed);
}

function resolveIcon(icon: string): string {
  if (icon.startsWith("/")) return icon;
  const match = getIconCatalog().icons.find((entry) => entry.id === icon);
  if (!match) throw new Error(`Unknown icon id: ${icon}`);
  return match.path;
}

export function getHomeContent(): HomeContent {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, "home.json"), "utf8");
  const parsed = JSON.parse(raw);
  const content = HomeContentSchema.parse(parsed);
  return {
    ...content,
    problem: {
      ...content.problem,
      icon: resolveIcon(content.problem.icon),
    },
    capabilities: content.capabilities.map((item) => ({ ...item, icon: resolveIcon(item.icon) })),
    work: content.work.map((item) => ({ ...item, icon: resolveIcon(item.icon) })),
  };
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
