// Builds circular, transparent-corner logo assets from ../Logo.jpeg
import sharp from "sharp";

const SRC = process.argv[2] ?? "../Logo.jpeg";
const meta = await sharp(SRC).metadata();
const size = Math.min(meta.width, meta.height);
const r = Math.round(size * 0.482);
const mask = Buffer.from(
  `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="#fff"/></svg>`
);

const circular = await sharp(SRC)
  .resize(size, size, { fit: "cover" })
  .composite([{ input: mask, blend: "dest-in" }])
  .png()
  .toBuffer();

await sharp(circular).resize(640, 640).png({ compressionLevel: 9 }).toFile("public/logo.png");
await sharp(circular).resize(256, 256).png().toFile("src/app/icon.png");
await sharp(circular).resize(180, 180).png().toFile("src/app/apple-icon.png");
console.log("logo assets written");
