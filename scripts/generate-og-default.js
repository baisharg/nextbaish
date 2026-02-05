const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const WIDTH = 1200;
const HEIGHT = 630;
const LOGO_SIZE = 300;

const inputPath = path.join(__dirname, "..", "public", "jacarandashield.png");
const outputPath = path.join(
  __dirname,
  "..",
  "public",
  "images",
  "og-default.png",
);

async function generateOgDefault() {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Missing input asset: ${inputPath}`);
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const logoBuffer = await sharp(inputPath)
    .resize(LOGO_SIZE, LOGO_SIZE, { fit: "contain" })
    .png()
    .toBuffer();

  const svgOverlay = `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f5f5f5"/>
      <stop offset="100%" stop-color="#ede7fc"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#9275E5"/>
      <stop offset="100%" stop-color="#C77DDA"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <circle cx="1030" cy="115" r="190" fill="#A8C5FF" fill-opacity="0.28"/>
  <circle cx="1030" cy="115" r="120" fill="#9275E5" fill-opacity="0.14"/>
  <rect x="460" y="206" width="620" height="9" rx="4.5" fill="url(#accent)"/>
  <text x="460" y="300" fill="#1e293b" font-family="system-ui, -apple-system, sans-serif" font-size="96" font-weight="700">BAISH</text>
  <text x="460" y="370" fill="#334155" font-family="system-ui, -apple-system, sans-serif" font-size="38" font-weight="500">Buenos Aires AI Safety Hub</text>
  <text x="460" y="425" fill="#475569" font-family="system-ui, -apple-system, sans-serif" font-size="30" font-weight="400">Research, education, and community for AI safety</text>
</svg>
  `;

  await sharp({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 4,
      background: { r: 245, g: 245, b: 245, alpha: 1 },
    },
  })
    .composite([
      { input: Buffer.from(svgOverlay), top: 0, left: 0 },
      { input: logoBuffer, top: 165, left: 120 },
    ])
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  console.log(`Generated ${outputPath}`);
}

generateOgDefault().catch((error) => {
  console.error("Failed to generate OG image:", error);
  process.exit(1);
});
