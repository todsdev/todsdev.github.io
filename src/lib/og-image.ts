/**
 * The 1200×630 share image of a locale (README, "Search and sharing"): the hero's prompt line,
 * the name and the localized job title on the site's dark background. The glyphs of the
 * bundled @fontsource files become SVG paths (opentype.js) and sharp rasterizes them, so the
 * output doesn't depend on the fonts installed on the build machine. Build-time only.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import opentype, { type Font } from "opentype.js";
import sharp from "sharp";
import { t, type Locale } from "../i18n";
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from "./seo";

// The gray theme's tokens (src/styles/tokens.css).
const COLORS = {
  bg: "#0e0e0e",
  muted: "#8a8a8a",
  text: "#d6d6d6",
  highlight: "#ffffff",
};

const fonts: Record<string, Font> = {};
function font(pkg: "vt323" | "ibm-plex-mono"): Font {
  fonts[pkg] ??= (() => {
    const file = join(
      process.cwd(),
      "node_modules/@fontsource",
      pkg,
      `files/${pkg}-latin-400-normal.woff`,
    );
    const bytes = readFileSync(file);
    return opentype.parse(
      bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength,
      ) as ArrayBuffer,
    );
  })();
  return fonts[pkg];
}

/**
 * The PNG without its `pHYs` chunk (pixel density), which libvips always writes: the images
 * carry no metadata at all. Chunks are length, type, data and CRC; the others are untouched.
 */
function withoutDensity(png: Uint8Array): Uint8Array<ArrayBuffer> {
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  const kept: Uint8Array[] = [png.subarray(0, 8)];
  for (let at = 8; at < png.length;) {
    const size = 12 + view.getUint32(at);
    const type = String.fromCharCode(...png.subarray(at + 4, at + 8));
    if (type !== "pHYs") kept.push(png.subarray(at, at + size));
    at += size;
  }
  const out = new Uint8Array(kept.reduce((n, part) => n + part.length, 0));
  let at = 0;
  for (const part of kept) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}

/**
 * One line of text as an SVG path, its baseline at `y`. A NaN coordinate (opentype.js 2.0.0
 * produced them for VT323) would make the rasterizer stop mid-text, so it fails the build.
 */
function line(
  f: Font,
  text: string,
  x: number,
  y: number,
  size: number,
  fill: string,
): string {
  const d = f.getPath(text, x, y, size).toPathData(2);
  if (d.includes("NaN"))
    throw new Error(`og-image: NaN in the path of "${text}"`);
  return `<path fill="${fill}" d="${d}"/>`;
}

export async function ogImage(
  locale: Locale,
  name: string,
): Promise<Uint8Array<ArrayBuffer>> {
  const mono = font("ibm-plex-mono");
  const title = font("vt323");
  const x = 90;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_IMAGE_WIDTH}" height="${OG_IMAGE_HEIGHT}" viewBox="0 0 ${OG_IMAGE_WIDTH} ${OG_IMAGE_HEIGHT}">
<rect width="100%" height="100%" fill="${COLORS.bg}"/>
${line(mono, "~/portfolio $ ./hello", x, 230, 38, COLORS.muted)}
${line(title, name, x, 365, 150, COLORS.text)}
${line(title, `> ${t(locale, "meta.jobTitle")}`, x, 465, 84, COLORS.highlight)}
</svg>`;
  const png = await sharp(new TextEncoder().encode(svg))
    .png({ compressionLevel: 9 })
    .toBuffer();
  return withoutDensity(png);
}
