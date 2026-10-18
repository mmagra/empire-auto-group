// Builds every logo variant the site uses from the client's black-background logo.
//
//   node scripts/brand-assets.mjs
//
// The client's transparent PNG has a jagged halo, so instead we "un-blend" black
// out of assets/brand-source/logo-black.png: for a bright logo on pure black,
// alpha = brightest channel and colour = channel / alpha. That gives clean,
// anti-aliased edges on any dark background.
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const SRC = "assets/brand-source/logo-black.png";
const OUT = "public/brand";
const APP = "src/app";
mkdirSync(OUT, { recursive: true });

// Row bands measured on the 1774×887 source (swoosh, EMPIRE, AUTO GROUP, LLC, tagline).
const BANDS = { top: 20, autoGroupBottom: 591, letterE: { left: 151, right: 404, top: 218, bottom: 443 } };

async function unblendBlack(input) {
  const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let p = 0, q = 0; p < data.length; p += 3, q += 4) {
    const r = data[p], g = data[p + 1], b = data[p + 2];
    const m = Math.max(r, g, b);
    // Treat near-black JPEG noise as fully transparent.
    const a = m < 14 ? 0 : m;
    out[q] = a ? Math.min(255, Math.round((r * 255) / a)) : 0;
    out[q + 1] = a ? Math.min(255, Math.round((g * 255) / a)) : 0;
    out[q + 2] = a ? Math.min(255, Math.round((b * 255) / a)) : 0;
    out[q + 3] = a;
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } });
}

const transparent = await (await unblendBlack(SRC)).png().toBuffer();
const meta = await sharp(transparent).metadata();

// Full logo with tagline (hero, footer, admin login).
await sharp(transparent).trim({ threshold: 1 }).resize({ width: 1400 }).png({ compressionLevel: 9 }).toFile(`${OUT}/logo-full.png`);
await sharp(transparent).trim({ threshold: 1 }).resize({ width: 1400 }).webp({ quality: 90, alphaQuality: 100 }).toFile(`${OUT}/logo-full.webp`);

// Compact header logo: swoosh + EMPIRE + AUTO GROUP (no LLC / tagline).
const mark = sharp(transparent).extract({ left: 0, top: BANDS.top, width: meta.width, height: BANDS.autoGroupBottom - BANDS.top + 6 });
const markBuf = await mark.png().toBuffer();
await sharp(markBuf).trim({ threshold: 1 }).resize({ width: 640 }).png({ compressionLevel: 9 }).toFile(`${OUT}/logo-mark.png`);
await sharp(markBuf).trim({ threshold: 1 }).resize({ width: 640 }).webp({ quality: 90, alphaQuality: 100 }).toFile(`${OUT}/logo-mark.webp`);

// Icon: the chrome "E" centred on black with a gold bar, like the logo's rules.
const { left, right, top, bottom } = BANDS.letterE;
const pad = 10;
const letter = await sharp(SRC)
  .extract({ left: left - pad, top: top - pad, width: right - left + pad * 2, height: bottom - top + pad * 2 })
  .resize({ width: 300, height: 300, fit: "contain", background: "#000" })
  .png()
  .toBuffer();
const goldBar = Buffer.from(
  `<svg width="512" height="512"><defs><linearGradient id="g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FFE066"/><stop offset="1" stop-color="#D9A400"/></linearGradient></defs><rect x="96" y="430" width="320" height="22" rx="4" fill="url(#g)"/></svg>`,
);
const icon = await sharp({ create: { width: 512, height: 512, channels: 3, background: "#000" } })
  .composite([{ input: letter, top: 92, left: 106 }, { input: goldBar, top: 0, left: 0 }])
  .png()
  .toBuffer();
await sharp(icon).resize(512).toFile(`${APP}/icon.png`);
await sharp(icon).resize(180).toFile(`${APP}/apple-icon.png`);
await sharp(icon).resize(192).toFile(`${OUT}/icon-192.png`);

// Default Open Graph / share image (1200×630): full logo on black.
const ogLogo = await sharp(transparent).trim({ threshold: 1 }).resize({ width: 1000, height: 520, fit: "inside" }).png().toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#000" } })
  .composite([{ input: ogLogo, gravity: "center" }])
  .jpeg({ quality: 88 })
  .toFile(`${OUT}/og-default.jpg`);

console.log("Brand assets written to", OUT, "and", APP);
