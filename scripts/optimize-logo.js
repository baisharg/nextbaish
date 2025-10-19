const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../public/jacarandashield.png');
const outputDir = path.join(__dirname, '../public/images/logos');

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const sizes = [
  { size: 40, suffix: '40' },
  { size: 80, suffix: '80' },
  { size: 120, suffix: '120' },
  { size: 192, suffix: '192' },
];

async function optimizeLogo() {
  console.log('🖼️  Optimizing logo images...\n');

  for (const { size, suffix } of sizes) {
    // Generate WebP
    const webpPath = path.join(outputDir, `logo-${suffix}.webp`);
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .webp({ quality: 90, effort: 6 })
      .toFile(webpPath);

    const webpStats = fs.statSync(webpPath);
    console.log(`✅ Generated ${suffix}px WebP: ${(webpStats.size / 1024).toFixed(2)} KB`);

    // Generate AVIF
    const avifPath = path.join(outputDir, `logo-${suffix}.avif`);
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .avif({ quality: 80, effort: 6 })
      .toFile(avifPath);

    const avifStats = fs.statSync(avifPath);
    console.log(`✅ Generated ${suffix}px AVIF: ${(avifStats.size / 1024).toFixed(2)} KB`);

    // Generate PNG fallback
    const pngPath = path.join(outputDir, `logo-${suffix}.png`);
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({ compressionLevel: 9, effort: 10 })
      .toFile(pngPath);

    const pngStats = fs.statSync(pngPath);
    console.log(`✅ Generated ${suffix}px PNG: ${(pngStats.size / 1024).toFixed(2)} KB\n`);
  }

  console.log('✨ Logo optimization complete!');
}

optimizeLogo().catch(console.error);
