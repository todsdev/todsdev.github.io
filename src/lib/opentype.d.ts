/**
 * Minimal types for the parts of opentype.js 1.x that src/lib/og-image.ts uses (the package
 * ships none). Remove this file if opentype.js ever publishes its own types. Stay on 1.x: 2.0.0 returns NaN
 * coordinates for VT323's glyphs, which truncates the rendered text.
 */
declare module "opentype.js" {
  export interface Path {
    /** SVG path data; `decimalPlaces` rounds every coordinate. */
    toPathData(decimalPlaces?: number): string;
  }
  export interface Font {
    getPath(text: string, x: number, y: number, fontSize: number): Path;
    getAdvanceWidth(text: string, fontSize: number): number;
  }
  export function parse(buffer: ArrayBuffer): Font;
  const opentype: { parse: typeof parse };
  export default opentype;
}
