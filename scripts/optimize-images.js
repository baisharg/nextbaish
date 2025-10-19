const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const inputDir = path.join(__dirname, '../public');
const outputDir = path.join(__dirname, '../public/images/optimized');

// Image type configurations
const configs = {
  photos: {
    pattern: '{Luca,Lucas,Eitan,Sergio,Charly*,hackathon}.{jpg,jpeg,png}',
    sizes: [
      { width: 400, suffix: '400w' },
      { width: 800, suffix: '800w' },
      { width: 1200, suffix: '1200w' },
    ],
    quality: { webp: 85, avif: 80, jpg: 85 }
  },
  books: {
    pattern: '{LIFE3.0,humancompatible,superintelligence,thealignmentproblem,uncontrollable}.{jpg,jpeg}',
    sizes: [
      { width: 300, suffix: '300w' },
      { width: 600, suffix: '600w' },
    ],
    quality: { webp: 90, avif: 85, jpg: 90 }
  }
};

async function optimizeImages() {
  console.log('🖼️  Starting image optimization...\n');

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (const [category, config] of Object.entries(configs)) {
    console.log(`\n📁 Processing ${category}...`);

    const files = await glob(config.pattern, { cwd: inputDir });

    for (const file of files) {
      const inputPath = path.join(inputDir, file);
      const basename = path.parse(file).name;

      console.log(`\n  Processing: ${file}`);

      for (const { width, suffix } of config.sizes) {
        const image = sharp(inputPath);
        const metadata = await image.metadata();

        // Don't upscale
        const finalWidth = Math.min(width, metadata.width);

        // WebP
        const webpPath = path.join(outputDir, `${basename}-${suffix}.webp`);
        await image
          .clone()
          .resize(finalWidth, null, { withoutEnlargement: true })
          .webp({ quality: config.quality.webp, effort: 6 })
          .toFile(webpPath);

        const webpSize = fs.statSync(webpPath).size;
        console.log(`    ✅ ${suffix} WebP: ${(webpSize / 1024).toFixed(1)}KB`);

        // AVIF
        const avifPath = path.join(outputDir, `${basename}-${suffix}.avif`);
        await image
          .clone()
          .resize(finalWidth, null, { withoutEnlargement: true })
          .avif({ quality: config.quality.avif, effort: 6 })
          .toFile(avifPath);

        const avifSize = fs.statSync(avifPath).size;
        console.log(`    ✅ ${suffix} AVIF: ${(avifSize / 1024).toFixed(1)}KB`);
      }
    }
  }

  console.log('\n✨ Image optimization complete!\n');
}

optimizeImages().catch(console.error);
