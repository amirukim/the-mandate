/**
 * Viewport-true screenshots for the art-pass before/after gates.
 *
 *   npx tsx scripts/shot.ts http://localhost:5173/ public/art/qa/menu-1280.png 1280 800
 *
 * Sizes: 1280x800 (desktop gate) and 390x844 (phone gate).
 */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const [url, out, w, h] = process.argv.slice(2);
if (!url || !out) {
  console.error("usage: tsx scripts/shot.ts <url> <out.png> [width] [height]");
  process.exit(1);
}
const width = Number(w ?? 1280);
const height = Number(h ?? 800);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height } });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
const file = resolve(out);
mkdirSync(dirname(file), { recursive: true });
await page.screenshot({ path: file });
await browser.close();
console.log(`shot: ${file} (${width}x${height})`);
