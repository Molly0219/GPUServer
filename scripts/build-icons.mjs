import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

// Optional local authoring tool. Generated icons are served as ordinary files.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = await fs.readFile(path.join(root, 'images/ateamdata-mark.svg'), 'utf8');
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  const pngs = new Map();
  for (const size of [16, 32, 48, 180]) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<style>html,body{margin:0;width:100%;height:100%}svg{display:block;width:100%;height:100%}</style>${source}`);
    pngs.set(size, await page.screenshot({ omitBackground: true, type: 'png' }));
  }
  await fs.writeFile(path.join(root, 'images/ateamdata-icon-32.png'), pngs.get(32));
  await fs.writeFile(path.join(root, 'images/apple-touch-icon.png'), pngs.get(180));
  // ICO directory with PNG-encoded images at native browser tab resolutions.
  const sizes = [16, 32, 48];
  const directory = Buffer.alloc(6 + sizes.length * 16);
  directory.writeUInt16LE(1, 2);
  directory.writeUInt16LE(sizes.length, 4);
  let offset = directory.length;
  sizes.forEach((size, i) => {
    const position = 6 + i * 16;
    const png = pngs.get(size);
    directory[position] = directory[position + 1] = size;
    directory.writeUInt16LE(1, position + 4);
    directory.writeUInt16LE(32, position + 6);
    directory.writeUInt32LE(png.length, position + 8);
    directory.writeUInt32LE(offset, position + 12);
    offset += png.length;
  });
  const ico = Buffer.concat([directory, ...sizes.map(size => pngs.get(size))]);
  await fs.writeFile(path.join(root, 'favicon.ico'), ico);
  // Existing template pages already reference this path.
  await fs.writeFile(path.join(root, 'images/favicon.ico'), ico);
  console.log('Generated SVG-derived PNG and ICO fallbacks for the existing static site.');
} finally {
  await browser.close();
}
