import fs from "fs";
import path from "path";
import {
  HomeContentSchema,
  PageContentSchema,
  type HomeContent,
  type PageContent,
} from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");

export function getHomeContent(): HomeContent {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, "home.json"), "utf8");
  const parsed = JSON.parse(raw);
  return HomeContentSchema.parse(parsed);
}

export function getPageContent(slug: string): PageContent {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, "pages", `${slug}.json`), "utf8");
  const parsed = JSON.parse(raw);
  return PageContentSchema.parse(parsed);
}
