/**
 * Build-time extractor: Natural Earth admin-1 state polygons for Malaysia
 * (public domain), keyed to the 16 game state ids. Same projection convention
 * as extract-geo.mjs so the shapes align with the country outlines exactly.
 *
 * Input:  geojson from nvkelso/natural-earth-vector (public domain; cached)
 * Output: src/data/geo-states.ts â€” GeoRing[] per state id.
 *
 * Run:  node scripts/extract-states.mjs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const cache = process.env.NE_CACHE ?? join(here, "..", "..", "..", "Temp", "opencode", "ne-cache");
const source = join(cache, "ne_10m_admin_1_states_provinces.geojson");
const url = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_1_states_provinces.geojson";
const out = join(here, "..", "src", "data", "geo-states.ts");

if (!existsSync(source)) {
  mkdirSync(cache, { recursive: true });
  console.log("fetching Natural Earth admin-1 (one-time, ~10 MB)...");
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
  const body = Buffer.from(await res.arrayBuffer());
  writeFileSync(source, body);
  console.log(`cached ${body.length} bytes`);
}

const geo = JSON.parse(readFileSync(source, "utf8"));

/** Same projection as extract-geo.mjs â€” baked coordinates keep every layer aligned. */
const LON0 = 92, LON1 = 132, LAT0 = -12, LAT1 = 30;
const W = 1200, H = 640;
const px = (lon) => ((lon - LON0) / (LON1 - LON0)) * W;
const py = (lat) => H - ((lat - LAT0) / (LAT1 - LAT0)) * H;

/** NE admin-1 name â†’ game state id (all 16). */
const NAME_TO_ID = {
  Perlis: "perlis",
  Kedah: "kedah",
  "Pulau Pinang": "penang",
  Penang: "penang",
  Perak: "perak",
  Kelantan: "kelantan",
  Terengganu: "terengganu",
  Pahang: "pahang",
  Selangor: "selangor",
  "Kuala Lumpur": "kuala-lumpur",
  Putrajaya: "putrajaya",
  "Negeri Sembilan": "negeri-sembilan",
  Melaka: "melaka",
  Johor: "johor",
  Sabah: "sabah",
  Sarawak: "sarawak",
  Labuan: "labuan",
};

/** signed area â€” keeps the largest ring as the state's mainland shape */
function area(ring) {
  let sum = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    sum += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return Math.abs(sum / 2);
}

const byId = {};
for (const f of geo.features) {
  const props = f.properties ?? {};
  if (props.admin !== "Malaysia" && props.adm0_a3 !== "MYS") continue;
  const id = NAME_TO_ID[props.name];
  if (!id) continue;
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.type === "MultiPolygon" ? f.geometry.coordinates : [];
  for (const poly of polys) {
    const outer = poly[0];
    if (!byId[id]) byId[id] = [];
    // keep every ring with its holes dropped; tiny islets under ~0.02 degÂ² are culled
    if (area(outer) < 0.003) continue;
    const pts = [];
    for (const [lon, lat] of outer) {
      const x = Math.round(px(lon) * 10) / 10;
      const y = Math.round(py(lat) * 10) / 10;
      const prev = pts[pts.length - 1];
      if (prev && Math.abs(prev[0] - x) < 0.6 && Math.abs(prev[1] - y) < 0.6) continue;
      pts.push([x, y]);
    }
    if (pts.length >= 4) byId[id].push(pts);
  }
}

let tsOut = `/**
 * Natural Earth admin-1 state polygons for the 16 states and federal
 * territories (public domain, ${""}nvkelso/natural-earth-vector 50m; extracted by
 * scripts/extract-states.mjs, provenance decision D-11). Coordinates are
 * baked with the same projection as geo-paths.ts, so every layer aligns.
 */
`;
tsOut += "export const GEO_STATES: Record<string, (number[][])[]> = {\n";
for (const id of Object.keys(byId)) {
  tsOut += `  "${id}": [\n`;
  for (const ring of byId[id]) {
    tsOut += `    [${ring.map((p) => `[${p[0]},${p[1]}]`).join(",")}],\n`;
  }
  tsOut += "  ],\n";
}
tsOut += "};\n";
writeFileSync(out, tsOut, "utf8");
console.log(`states: ${Object.keys(byId).join(", ")}`);
console.log(`rings per state: ${Object.values(byId).map((r) => r.length).join(", ")}`);
