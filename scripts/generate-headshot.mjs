import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const origPath = 'C:/Users/User/.gemini/antigravity/brain/726b2415-2163-49b1-8bda-faf74eb204d3/.user_uploaded/media_1791446412532_f4bbc0d2.jpg';
const dataUrl = 'data:image/jpeg;base64,' + fs.readFileSync(origPath).toString('base64');

const browser = await chromium.launch();
const page = await browser.newPage();

// Crop coordinates for fine_crop2:
// sx: 24, sy: 165, sw: 720, sh: 720
const crop = { sx: 24, sy: 165, sw: 720, sh: 720 };

const formats = [
  { file: 'foto.webp', mime: 'image/webp', quality: 0.92 },
  { file: 'foto.jpg', mime: 'image/jpeg', quality: 0.90 }
];

for (const f of formats) {
  const result = await page.evaluate(({ dataUrl, crop, mime, quality }) => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 720;
        canvas.height = 720;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, 720, 720);
        resolve(canvas.toDataURL(mime, quality));
      };
      img.src = dataUrl;
    });
  }, { dataUrl, crop, mime: f.mime, quality: f.quality });

  const base64Data = result.replace(/^data:[^;]+;base64,/, '');
  fs.writeFileSync(f.file, Buffer.from(base64Data, 'base64'));
  console.log(`Generated ${f.file} (${fs.statSync(f.file).size} bytes)`);
}

await browser.close();
