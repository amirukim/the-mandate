/** Types for the shared JS pixel canvas (scripts/pixel-canvas.mjs). */
export declare class PixelCanvas {
  used: Set<string>;
  constructor(width: number, height: number);
  set(x: number, y: number, hex: string): void;
  rect(x: number, y: number, w: number, h: number, hex: string): void;
  hline(x: number, y: number, w: number, hex: string): void;
  vline(x: number, y: number, h: number, hex: string): void;
  frame(x: number, y: number, w: number, h: number, hex: string): void;
  disc(cx: number, cy: number, r: number, hex: string): void;
  ellipse(cx: number, cy: number, rx: number, ry: number, hex: string): void;
  bevel(x: number, y: number, w: number, h: number, base: string, light: string, shade: string): void;
  colours(exclude?: Set<string>): string[];
  toPNG(): Buffer;
}
