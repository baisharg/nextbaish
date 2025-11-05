const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputSvg = path.join(__dirname, '..', 'public', 'images', 'logo.svg');
const outputDir = path.join(__dirname, '..', 'public');

async function generateFavicons() {
  console.log('🎨 Generating favicon files from SVG...\n');

  try {
    // Generate favicon.ico (32x32)
    await sharp(inputSvg)
      .resize(32, 32)
      .toFile(path.join(outputDir, 'favicon-temp.png'));

    // Generate 16x16 favicon
    await sharp(inputSvg)
      .resize(16, 16)
      .png()
      .toFile(path.join(outputDir, 'favicon-16x16.png'));
    console.log('✅ Generated favicon-16x16.png');

    // Generate 32x32 favicon
    await sharp(inputSvg)
      .resize(32, 32)
      .png()
      .toFile(path.join(outputDir, 'favicon-32x32.png'));
    console.log('✅ Generated favicon-32x32.png');

    // Generate apple-touch-icon (180x180)
    await sharp(inputSvg)
      .resize(180, 180)
      .png()
      .toFile(path.join(outputDir, 'apple-touch-icon.png'));
    console.log('✅ Generated apple-touch-icon.png (180x180)');

    // Generate android-chrome icons for PWA manifest
    await sharp(inputSvg)
      .resize(192, 192)
      .png()
      .toFile(path.join(outputDir, 'android-chrome-192x192.png'));
    console.log('✅ Generated android-chrome-192x192.png');

    await sharp(inputSvg)
      .resize(512, 512)
      .png()
      .toFile(path.join(outputDir, 'android-chrome-512x512.png'));
    console.log('✅ Generated android-chrome-512x512.png');

    console.log('\n✨ Favicon generation complete!');
    console.log('\nNote: For favicon.ico, you may want to use an online converter to create a proper .ico file');
    console.log('with multiple sizes embedded. For now, browsers will fall back to favicon-32x32.png');

    // Clean up temp file
    if (fs.existsSync(path.join(outputDir, 'favicon-temp.png'))) {
      fs.unlinkSync(path.join(outputDir, 'favicon-temp.png'));
    }

  } catch (error) {
    console.error('❌ Error generating favicons:', error);
    process.exit(1);
  }
}

generateFavicons();
