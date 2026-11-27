/**
 * The invented mandate emblem (v3a phase 5): a pixel scroll with a wax seal.
 * Deliberately NOT any real crest, coat of arms or party mark — a sealed
 * document, because the mandate is a document. Code-native SVG, crisp edges.
 */

const PALETTE: Record<string, string> = {
  D: "#17202b", // ink outline
  g: "#e6cd8e", // parchment light
  G: "#c9a96a", // parchment gold
  L: "#f2ede1", // ink line
  R: "#a44a3f", // wax seal
  r: "#c46b52", // seal light
};

const MAP: string[] = [
  "................",
  "..DDDDDDDDDDDD..",
  ".DgLLLLLLLLLLgD.",
  "DgLLLLLLLLLLLLgD",
  "DgLLLLLLLLLLLLgD",
  "DgLLDDLLLLDDLLgD",
  "DgLLDDLLLLDDLLgD",
  "DgLLLLLLLLLLLLgD",
  "DgLLLLLLLLLLLLgD",
  ".DgLLLLLLLLLLgD.",
  "..DDDDDDDDDDDD..",
  "...........DRD..",
  "..........DRrRD.",
  "..........DRrRD.",
  "...........DRD..",
  "................",
];

export function PixelEmblem({ scale = 4, className }: { scale?: 2 | 3 | 4 | 6; className?: string }) {
  return (
    <svg
      width={16 * scale}
      height={16 * scale}
      shapeRendering="crispEdges"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {MAP.flatMap((row, y) =>
        [...row].map((ch, x) => {
          const fill = PALETTE[ch];
          return fill ? (
            <rect key={`${x}-${y}`} x={x * scale} y={y * scale} width={scale} height={scale} fill={fill} />
          ) : null;
        }),
      )}
    </svg>
  );
}
