import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";

const cssDir = join(process.cwd(), ".next", "static", "css");
const appCssDir = join(cssDir, "app");
const expected = join(appCssDir, "layout.css");

if (!existsSync(appCssDir)) mkdirSync(appCssDir, { recursive: true });

const cssFile = readdirSync(cssDir).find((file) => file.endsWith(".css"));

if (cssFile && !existsSync(expected)) {
  copyFileSync(join(cssDir, cssFile), expected);
  console.log(`Copied ${cssFile} to static/css/app/layout.css`);
}
