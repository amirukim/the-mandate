/** Element screenshot helper: npx tsx scripts/shot-el.ts <url> <selector> <out.png>
 *  Grabs the sprite preview data URL to <out>.json when --data mode is used. */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const [url, selector, out, mode] = process.argv.slice(2);
if (!url || !selector || !out) { console.error("usage: shot-el <url> <selector> <out.png> [--data]"); process.exit(1); }
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
if (mode === "--data") {
  const src = await page.evaluate(() => {
    const img = [...document.querySelectorAll("img")].find((i) => (i.src || "").startsWith("data:image/png") && i.width >= 90);
    return img ? img.src : null;
  });
  if (src) writeFileSync(resolve(out), JSON.stringify(src));
  console.log("wrote", out, src ? "data url" : "EMPTY");
  await browser.close();
  process.exit(0);
}
const el = page.locator(selector).first();
mkdirSync(dirname(resolve(out)), { recursive: true });
await el.screenshot({ path: resolve(out) });
await browser.close();
console.log("saved", out);
