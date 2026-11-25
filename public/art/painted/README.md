# Painted scene drop-ins (optional)

Place a raster painting here to replace a scene's vector illustration with no code change:

```
public/art/painted/<sceneKey>.webp   (or .png / .jpg)
```

`<sceneKey>` is one of `office`, `chamber`, `treasury`, `ops`, `flood` — plus `hub` for the
Prime Minister's office hub.

Resolution order for a room:

1. the vector illustration (always shipped, always the fallback);
2. the authored pixel plate, if registered in `src/data/asset-manifest.ts`;
3. the painted drop-in listed above, which wins when present.

A missing file is silent: the layer beneath simply shows. Never make a screen depend on a
file in this folder existing.

Spec: 16:9 or wider, at least 1440 px on the long edge, sRGB, no text baked into the image.
Painted art is colour-graded in the browser (`.art-warm`); authored pixel plates are not.
