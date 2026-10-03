// Generates a print-ready QR code PNG (logo in the centre) for the menu URL.
// Usage: node scripts/make-qr.mjs https://energy-menu-v2.vercel.app public/energy-menu-qr.png
import QRCode from "qrcode";
import sharp from "sharp";

const url = process.argv[2];
const out = process.argv[3] ?? "public/energy-menu-qr.png";
if (!url) {
  console.error("Usage: node scripts/make-qr.mjs <url> [output.png]");
  process.exit(1);
}

const SIZE = 1200;
const PAD = 80;
const qr = await QRCode.toBuffer(url, {
  errorCorrectionLevel: "H",
  margin: 0,
  width: SIZE,
  color: { dark: "#141714", light: "#FFFFFF" },
});

const logoSize = Math.round(SIZE * 0.22);
const ring = logoSize + 28;
const logo = await sharp("public/logo.png").resize(logoSize, logoSize).png().toBuffer();
const badge = Buffer.from(
  `<svg width="${ring}" height="${ring}"><circle cx="${ring / 2}" cy="${ring / 2}" r="${ring / 2}" fill="#fff"/></svg>`
);

await sharp({
  create: { width: SIZE + PAD * 2, height: SIZE + PAD * 2, channels: 3, background: "#FFFFFF" },
})
  .composite([
    { input: qr, left: PAD, top: PAD },
    { input: badge, left: Math.round((SIZE + PAD * 2 - ring) / 2), top: Math.round((SIZE + PAD * 2 - ring) / 2) },
    { input: logo, left: Math.round((SIZE + PAD * 2 - logoSize) / 2), top: Math.round((SIZE + PAD * 2 - logoSize) / 2) },
  ])
  .png()
  .toFile(out);
console.log(`QR for ${url} written to ${out}`);
