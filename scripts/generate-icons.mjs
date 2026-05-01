import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#2c3a2e"/>
      <stop offset="100%" stop-color="#1f2a21"/>
    </linearGradient>
    <radialGradient id="glow" cx="60%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#b25c3f" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#b25c3f" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="180" height="180" fill="url(#bg)"/>
  <rect width="180" height="180" fill="url(#glow)"/>

  <!-- "MJ" monogram in serif -->
  <text x="90" y="120" text-anchor="middle"
        fill="#ebe2d4"
        font-family="'Fraunces', 'Cormorant Garamond', Georgia, serif"
        font-size="100" font-weight="500"
        letter-spacing="-2">MJ</text>

  <!-- accent dot -->
  <circle cx="135" cy="55" r="4" fill="#d18b6f"/>
</svg>
`;

const buffer = await sharp(Buffer.from(svg))
  .png({ quality: 95, compressionLevel: 9 })
  .toBuffer();

await writeFile("public/apple-touch-icon.png", buffer);
console.log(`apple-touch-icon.png: ${(buffer.length / 1024).toFixed(0)} KB`);

// Aussi générer un favicon.ico équivalent
const favBuffer = await sharp(Buffer.from(svg))
  .resize(32, 32)
  .png()
  .toBuffer();
await writeFile("public/favicon.png", favBuffer);
console.log(`favicon.png: ${(favBuffer.length / 1024).toFixed(0)} KB`);
