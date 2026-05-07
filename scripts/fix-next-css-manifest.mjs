import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const cssDir = join(process.cwd(), ".next", "static", "css");
const appCssDir = join(cssDir, "app");
const expected = join(appCssDir, "layout.css");

if (!existsSync(appCssDir)) mkdirSync(appCssDir, { recursive: true });

const cssFiles = readdirSync(cssDir).filter((file) => file.endsWith(".css"));
const cssFile = cssFiles.find((file) => {
  const contents = readFileSync(join(cssDir, file), "utf8");
  return contents.includes(".mf-logo-intro") || contents.includes("--mf-nav-height");
}) ?? cssFiles[0];

if (cssFile && !existsSync(expected)) {
  copyFileSync(join(cssDir, cssFile), expected);
  console.log(`Copied ${cssFile} to static/css/app/layout.css`);
}
