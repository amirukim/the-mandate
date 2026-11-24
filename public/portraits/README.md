# Character portraits — asset requirements

The game ships with **painted SVG portraits** for every fictional character
(built in `src/data/portraits.tsx`, with per-character colour, lighting and
silhouette). Painted **raster** portraits are **not** part of the build yet.
This file documents exactly how to add them — with **no code changes**.

## Drop-in (zero code)

Save each portrait as `public/portraits/<characterId>.webp` (`.png` and
`.jpg` also work — all three are tried in order). That's it. Every Avatar,
dialogue stage plate and cast-row portrait picks it up automatically; missing
files fall back to the painted SVG silently.

Requirements: 4:5 or square, 512×640 or larger, bust/head-and-shoulders.

## Manual override (optional)

For non-standard filenames, register the path in `PORTRAITS` (keyed by
character id) in `src/data/portraits.tsx`.

## The ten character ids

All characters are **fictional**. No asset may depict or resemble a real
Malaysian politician.

| id | Name | Role |
|---|---|---|
| `chiefOfStaff` | Sarah Tan | Principal Private Secretary |
| `finance` | Tan Sri Azlan Mahmud | Minister of Finance |
| `economicAdviser` | Dr. Kavitha Rao | Special Economic Adviser |
| `nationalSecurity` | Dato' Faridah Yusof | National Security Adviser |
| `foreign` | Datuk Lim Wei Sheng | Minister of Foreign Affairs |
| `home` | Datuk Seri Norliza Ahmad | Minister of Home Affairs |
| `borneoMinister` | Datuk Seri Peter Mojuntin | Minister (Sabah Affairs) |
| `gpsPremier` | Datuk Patinggi Jonathan Lingga | Premier of Sarawak |
| `bnChair` | Tan Sri Raja Nordin | Chairman, Barisan Nasional |
| `oppositionLeader` | Dato' Iskandar Rahman | Leader of the Opposition |

## Style guide (all portraits)

- Painterly oil portrait, prestige political-drama game aesthetic
  (Suzerain-like mood, **original artwork only** — never copy its assets).
- Bust, three-quarter view facing slightly left; serious, dignified expression.
- Warm directional key light from the left; subtle gold rim light.
- Deep dark blue-charcoal studio background (`#141a23`) so portraits sit
  cleanly on the dark UI surfaces.
- Muted cinematic palette; visible brushwork; no text, no watermarks, no
  real-world flags or party emblems.
- Fictional persons only: invented faces, not likenesses of real people.
