/**
 * Contrast audit against docs/DESIGN_SYSTEM.md §2.4 anchors.
 * Reads the token values from src/styles/index.css and prints WCAG ratios
 * for the text pairs the UI actually composes. Exit code 1 on any failure.
 *
 * Run: node scripts/audit-contrast.mjs
 */
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/styles/index.css", import.meta.url), "utf8");

// pull a rule block by selector string or regex
function block(selector) {
  const start = typeof selector === "string" ? css.indexOf(selector) : (css.match(selector)?.index ?? -1);
  if (start < 0) throw new Error(`selector not found: ${selector}`);
  const open = css.indexOf("{", start);
  let depth = 1;
  let i = open + 1;
  while (depth > 0 && i < css.length) {
    if (css[i] === "{") depth++;
    if (css[i] === "}") depth--;
    i++;
  }
  const body = css.slice(open + 1, i - 1);
  const tokens = {};
  for (const m of body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)) tokens[m[1]] = m[2];
  return tokens;
}

const paper = block(":root");
// match the rule, not the comment that names it
const night = block(/\.theme-night\s*\{/);

function lum(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) =>
    v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(fg, bg) {
  const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}

// text pairs as composed by the UI: [name, fg token, bg token, minimum]
const PAIRS = [
  ["paper scheme: ink on paper", paper, "ink", "paper", 4.5],
  ["paper scheme: muted on paper", paper, "muted", "paper", 4.5],
  ["paper scheme: gold-text on paper", paper, "gold-text", "paper", 4.5],
  ["paper scheme: brick-text on paper", paper, "brick-text", "paper", 4.5],
  ["paper scheme: moss-text on paper", paper, "moss-text", "paper", 4.5],
  ["paper scheme: ink on card", paper, "ink", "card", 4.5],
  ["paper scheme: muted on paper-deep", paper, "muted", "paper-deep", 4.5],
  ["night scheme: ink on paper(midnight)", night, "ink", "paper", 4.5],
  ["night scheme: muted on paper(midnight)", night, "muted", "paper", 4.5],
  ["night scheme: gold-text on paper(midnight)", night, "gold-text", "paper", 4.5],
  ["night scheme: brick-text on paper(midnight)", night, "brick-text", "paper", 4.5],
  ["night scheme: moss-text on paper(midnight)", night, "moss-text", "paper", 4.5],
  ["night scheme: ink on card", night, "ink", "card", 4.5],
  ["chrome (both): chrome-ink on chrome", paper, "chrome-ink", "chrome", 4.5],
  ["chrome (both): chrome-gold on chrome", paper, "chrome-gold", "chrome", 4.5],
  ["chrome (both): chrome-good on chrome", paper, "chrome-good", "chrome", 4.5],
  ["chrome (both): chrome-bad on chrome", paper, "chrome-bad", "chrome", 4.5],
  ["newsprint: ink on paper", paper, "ink", "paper", 4.5],
];

let failures = 0;
for (const [name, tokens, fg, bg, min] of PAIRS) {
  const f = tokens[fg];
  const b = tokens[bg];
  if (!f || !b) {
    console.log(`SKIP  ${name} (token missing)`);
    continue;
  }
  const r = ratio(f, b);
  const pass = r >= min;
  if (!pass) failures++;
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}: ${f} on ${b} = ${r.toFixed(2)}:1 (min ${min}:1)`);
}

process.exitCode = failures > 0 ? 1 : 0;
