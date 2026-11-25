/**
 * Machine-readable asset manifest. Presentation only — nothing in the engine
 * imports this file.
 *
 * Rules:
 *  - `id` is stable and never renamed once shipped;
 *  - `width`/`height` describe the file on disk;
 *  - `scale` is the intended integer display multiplier;
 *  - optional/drop-in files are listed in `candidates`, never as the only path.
 *
 * The data lives in asset-manifest.json so the offline validator
 * (`npm run check:assets`) can read it without a TypeScript loader.
 */

import data from "./asset-manifest.json";

export type AssetKind = "environment" | "scene" | "sprite" | "bust" | "prop" | "map" | "icon" | "keyart";

export interface AssetEntry {
  id: string;
  kind: AssetKind;
  /** Path from /public, e.g. "/art/pixel/env-office-hub.png". */
  src: string;
  width: number;
  height: number;
  scale: 1 | 2 | 3 | 4;
  candidates?: string[];
  owner?: string;
  source: "authored" | "vector" | "ai" | "public-domain";
  licence: string;
  note?: string;
}

export interface AssetManifest {
  version: 1;
  assets: AssetEntry[];
}

export const ASSET_MANIFEST = data as AssetManifest;
