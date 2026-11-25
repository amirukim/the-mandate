/**
 * Asset manifest validator.
 *
 * Checks that every registered asset exists, that IDs are unique, and that the
 * dimensions in the manifest match the file on disk (PNG IHDR, SVG viewBox).
 * Optional drop-in candidates are reported but never fail the build.
 *
 * Run: npm run check:assets
 */
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = resolve(root, "src/data/asset-manifest.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

let failures = 0;
let presentCandidates = 0;
const ids = new Set();

function fail(message) {
  failures += 1;
  console.error(`FAIL  ${message}`);
}

function pngSize(file) {
  const buffer = readFileSync(file);
  const signature = buffer.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function svgSize(file) {
  const text = readFileSync(file, "utf8");
  const match = text.match(/viewBox="([^"]+)"/);
  if (!match) return null;
  const parts = match[1].trim().split(/[\s,]+/).map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) return null;
  return { width: parts[2], height: parts[3] };
}

for (const asset of manifest.assets) {
  if (!asset.id) {
    fail("asset with no id");
    continue;
  }
  if (ids.has(asset.id)) fail(`duplicate id: ${asset.id}`);
  ids.add(asset.id);

  const file = resolve(root, "public", "." + asset.src);
  if (!existsSync(file)) {
    fail(`${asset.id}: missing file ${asset.src}`);
    continue;
  }

  const size = asset.src.endsWith(".png") ? pngSize(file) : asset.src.endsWith(".svg") ? svgSize(file) : null;
  if (!size) {
    fail(`${asset.id}: cannot read dimensions from ${asset.src}`);
    continue;
  }
  if (size.width !== asset.width || size.height !== asset.height) {
    fail(`${asset.id}: ${asset.src} is ${size.width}×${size.height}, manifest says ${asset.width}×${asset.height}`);
  }
  if (![1, 2, 3, 4].includes(asset.scale)) {
    fail(`${asset.id}: scale ${asset.scale} is not an integer multiplier`);
  }
  if (!["authored", "vector", "ai", "public-domain"].includes(asset.source)) {
    fail(`${asset.id}: unknown source "${asset.source}"`);
  }

  for (const candidate of asset.candidates ?? []) {
    const candidateFile = resolve(root, "public", "." + candidate);
    if (existsSync(candidateFile) && statSync(candidateFile).size > 0) presentCandidates += 1;
  }
}

const count = manifest.assets.length;
console.log(`${count} asset${count === 1 ? "" : "s"} checked, ${presentCandidates} optional drop-in(s) present, ${failures} failure(s)`);
if (failures > 0) process.exitCode = 1;
