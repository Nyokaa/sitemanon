import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#2c3a2e"/>
      <stop offset="100%" stop-color="#1f2a21"/>
    </linearGradient>
    <radialGradient id="glow" cx="78%" cy="42%" r="55%">
      <stop offset="0%" stop-color="#b25c3f" stop-opacity="0.45"/>
      <stop offset="60%" stop-color="#b25c3f" stop-opacity="0.0"/>
    </radialGradient>
    <linearGradient id="nail" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.95"/>
      <stop offset="55%" stop-color="#fad9c8" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#c98770" stop-opacity="0.95"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- top accent line -->
  <line x1="80" y1="80" x2="160" y2="80" stroke="#d18b6f" stroke-width="1.5" stroke-linecap="round"/>
  <text x="180" y="86" fill="#d18b6f" font-family="'Inter', system-ui, sans-serif" font-size="18" letter-spacing="6" font-weight="500">STUDIO PRIVÉ · LYON 6 · TÊTE D'OR</text>

  <!-- main title -->
  <text x="80" y="240" fill="#ebe2d4" font-family="'Fraunces', 'Cormorant Garamond', Georgia, serif" font-size="120" font-weight="500" letter-spacing="-2">Manon Jeanpert</text>

  <!-- subtitle -->
  <text x="82" y="320" fill="#d18b6f" font-family="'Fraunces', 'Cormorant Garamond', Georgia, serif" font-size="46" font-style="italic" font-weight="400">Prothésiste ongulaire à Lyon 6</text>

  <!-- value props -->
  <text x="82" y="400" fill="#ebe2d4" font-family="'Inter', system-ui, sans-serif" font-size="22" letter-spacing="0" opacity="0.85">Diagnostic personnalisé · Hygiène irréprochable · Tenue jusqu'à 4 semaines</text>

  <!-- decorative nails illustration on the right -->
  <g transform="translate(780, 380) rotate(-8)" opacity="0.85">
    <rect x="0"   y="40"  width="34" height="170" rx="16" fill="url(#nail)"/>
    <rect x="46"  y="0"   width="36" height="210" rx="17" fill="url(#nail)"/>
    <rect x="94"  y="-20" width="38" height="230" rx="18" fill="url(#nail)"/>
    <rect x="144" y="0"   width="36" height="210" rx="17" fill="url(#nail)"/>
    <!-- gold flake accents -->
    <circle cx="115" cy="60" r="3" fill="#d4a373" opacity="0.95"/>
    <circle cx="120" cy="80" r="2" fill="#d4a373" opacity="0.85"/>
    <circle cx="60"  cy="90" r="2.5" fill="#d4a373" opacity="0.85"/>
  </g>

  <!-- footer -->
  <line x1="80" y1="560" x2="160" y2="560" stroke="#d18b6f" stroke-width="1.5" stroke-linecap="round"/>
  <text x="80" y="540" fill="#d18b6f" font-family="'Inter', system-ui, sans-serif" font-size="16" letter-spacing="5" font-weight="500">RÉSERVATION 24H/24 SUR PLANITY</text>
  <text x="80" y="595" fill="#ebe2d4" font-family="'Inter', system-ui, sans-serif" font-size="20" font-weight="500" opacity="0.9">manonjeanpert.com</text>
</svg>
`;

const buffer = await sharp(Buffer.from(svg))
  .jpeg({ quality: 88, mozjpeg: true })
  .toBuffer();

await writeFile("public/og.jpg", buffer);
console.log(`og.jpg generated: ${(buffer.length / 1024).toFixed(0)} KB`);
