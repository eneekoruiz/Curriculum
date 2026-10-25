import { chromium } from 'playwright';
import fs from 'fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const origPath = process.argv[2];
if (!origPath) throw new Error('Usage: node scripts/generate-headshot.mjs <original-image>');
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataUrl = 'data:image/jpeg;base64,' + fs.readFileSync(origPath).toString('base64');

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  const crop = { sx: 24, sy: 165, sw: 720, sh: 720 };
  const formats = [
    { file: 'foto.webp', mime: 'image/webp', quality: 0.92 },
    { file: 'foto.jpg', mime: 'image/jpeg', quality: 0.90 }
  ];

  for (const f of formats) {
    const result = await page.evaluate(async ({ dataUrl, crop, mime, quality }) => {
      const img = new Image();
      img.src = dataUrl;
      await img.decode();
      if (img.naturalWidth < crop.sx + crop.sw || img.naturalHeight < crop.sy + crop.sh) {
        throw new Error('The original image must be at least 744 × 885 pixels for this crop');
      }
      const canvas = document.createElement('canvas');
      canvas.width = 720;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, 720, 720);
      return canvas.toDataURL(mime, quality);
    }, { dataUrl, crop, mime: f.mime, quality: f.quality });

    const base64Data = result.replace(/^data:[^;]+;base64,/, '');
    const output = join(root, f.file);
    fs.writeFileSync(output, Buffer.from(base64Data, 'base64'));
    console.log(`Generated ${f.file} (${fs.statSync(output).size} bytes)`);
  }
} finally {
  await browser.close();
}
