// QR codes to the online CV, ready to print or drop into a slide: qr/cv-qr.svg (vector) and
// qr/cv-qr.png (1200px). Error correction "Q" keeps it scannable when printed small or scuffed.
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import QRCode from 'qrcode';
import { ROOT } from './lib.mjs';

const URL_CV = 'https://eneko-ruiz-curriculum.vercel.app';
const options = { errorCorrectionLevel: 'Q', margin: 4, color: { dark: '#0f172a', light: '#ffffff' } };

await mkdir(join(ROOT, 'qr'), { recursive: true });
await writeFile(join(ROOT, 'qr', 'cv-qr.svg'), await QRCode.toString(URL_CV, { ...options, type: 'svg' }));
await writeFile(join(ROOT, 'qr', 'cv-qr.png'), await QRCode.toBuffer(URL_CV, { ...options, type: 'png', width: 1200 }));
console.log(`qr/cv-qr.svg and qr/cv-qr.png → ${URL_CV}`);
