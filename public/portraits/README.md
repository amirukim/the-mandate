# Character portraits — asset requirements

The game ships with **engraved line-art portraits** for every fictional
character (banknote style, drawn in `src/data/portraits.tsx`). Painted
portrait assets are **not** part of the build yet. This file documents exactly
what a painted set must look like, so it can be produced later without any
code changes.

## Registration (2 steps)

1. Save the file as `public/portraits/<characterId>.<ext>` (webp or jpg,
   ~512×640 or larger, 4:5 vertical, bust/head-and-shoulders).
2. Add the id to `PORTRAITS` in `src/data/portraits.tsx`:

```ts
export const PORTRAITS: Record<string, string> = {
  chiefOfStaff: "/portraits/chiefOfStaff.webp",
  // ...one entry per character id below
};
```

Nothing else changes: `Avatar` (name-keyed, dialogue) and `CharacterPortrait`
(id-keyed, pages) resolve painted assets first and fall back to the engravings
on a missing or broken file. Initials are never shown.

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
