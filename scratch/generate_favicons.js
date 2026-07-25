const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 helper
function crc32(buf) {
  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return crc ^ 0xffffffff;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])) >>> 0, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function generatePNG(width, height, drawPixel) {
  const rowSize = 1 + width * 4;
  const buffer = Buffer.alloc(height * rowSize);
  for (let y = 0; y < height; y++) {
    buffer[y * rowSize] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixel(x, y, width, height);
      const off = y * rowSize + 1 + x * 4;
      buffer[off] = r; buffer[off+1] = g; buffer[off+2] = b; buffer[off+3] = a;
    }
  }
  const compressed = zlib.deflateSync(buffer);
  const signature = Buffer.from([137,80,78,71,13,10,26,10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8]=8; ihdr[9]=6; ihdr[10]=0; ihdr[11]=0; ihdr[12]=0;
  return Buffer.concat([
    signature,
    createChunk('IHDR', ihdr),
    createChunk('IDAT', compressed),
    createChunk('IEND', Buffer.alloc(0)),
  ]);
}

// Bugsnapr icon: dark rounded rect, yellow dashed reticle, red center dot
function drawBugsnaprIcon(x, y, w, h) {
  const cx = w/2, cy = h/2;
  const dx = x - cx, dy = y - cy;
  const dist = Math.sqrt(dx*dx + dy*dy);
  const cornerR = w * 0.25;

  // Rounded rect check
  const inset = cornerR;
  let inRect = false;
  if (x >= 0 && x < w && y >= 0 && y < h) {
    const nx = Math.max(inset, Math.min(x, w - inset));
    const ny = Math.max(inset, Math.min(y, h - inset));
    const cdx = x - nx, cdy = y - ny;
    inRect = Math.sqrt(cdx*cdx + cdy*cdy) <= cornerR;
  }

  if (!inRect) return [0, 0, 0, 0];

  // Crosshair lines (yellow)
  const lineW = Math.max(1, w * 0.06);
  const armStart = w * 0.12;
  const armEnd = w * 0.3;

  const onVertLine = Math.abs(x - cx) < lineW/2 && (
    (y >= cy - armEnd - armStart && y <= cy - armStart) ||
    (y >= cy + armStart && y <= cy + armStart + armEnd)
  );
  const onHorizLine = Math.abs(y - cy) < lineW/2 && (
    (x >= cx - armEnd - armStart && x <= cx - armStart) ||
    (x >= cx + armStart && x <= cx + armStart + armEnd)
  );

  if (onVertLine || onHorizLine) return [255, 201, 60, 255]; // #FFC93C

  // Reticle circle (yellow, dashed effect)
  const reticleR = w * 0.3;
  const reticleW = Math.max(1.5, w * 0.055);
  const onReticle = Math.abs(dist - reticleR) < reticleW;
  if (onReticle) {
    const angle = Math.atan2(dy, dx);
    const seg = ((angle + Math.PI) / (Math.PI * 2)) * 16;
    if (Math.floor(seg) % 2 === 0) return [255, 201, 60, 255];
  }

  // Center red dot
  const dotR = w * 0.12;
  if (dist < dotR) return [232, 84, 62, 255]; // #E8543E

  // Background: dark #14171F
  return [20, 23, 31, 255];
}

// Generate sizes
const sizes = [
  { name: 'favicon.ico', size: 32 },       // replaced default
  { name: 'icon.png', size: 32 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-icon.png', size: 180 },
  { name: 'opengraph-image.png', size: 1200, height: 630 },
];

const outDir = path.join(__dirname, '..', 'app');
const publicDir = path.join(__dirname, '..', 'public');

sizes.forEach(({ name, size, height }) => {
  const h = height || size;
  let png;

  if (name === 'opengraph-image.png') {
    // OG image: dark bg with centered brand
    png = generatePNG(size, h, (x, y, w, ht) => {
      // Dark background
      const bgR = 20, bgG = 23, bgB = 31;

      // Subtle radial gradient glow
      const cx = w/2, cy = ht/2;
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx*dx + dy*dy) / (w * 0.4);
      const glow = Math.max(0, 1 - dist);

      // Yellow accent glow
      const r = Math.min(255, Math.floor(bgR + glow * 40));
      const g = Math.min(255, Math.floor(bgG + glow * 30));
      const b = Math.min(255, Math.floor(bgB + glow * 5));

      // Draw "B" letterform in center
      const letterSize = 120;
      const lx = x - (cx - letterSize/2);
      const ly = y - (cy - letterSize/2);
      if (lx >= 0 && lx < letterSize && ly >= 0 && ly < letterSize) {
        const result = drawBugsnaprIcon(lx, ly, letterSize, letterSize);
        if (result[3] > 0) return result;
      }

      return [r, g, b, 255];
    });
  } else {
    png = generatePNG(size, h, drawBugsnaprIcon);
  }

  // favicon.ico goes to app/, icon files go to app/ for metadata API
  const destDir = name === 'favicon.ico' ? outDir : outDir;
  fs.writeFileSync(path.join(destDir, name), png);
  console.log(`Generated ${name} (${size}x${h})`);
});

// Also copy icon to public for direct access
fs.copyFileSync(path.join(outDir, 'icon.png'), path.join(publicDir, 'favicon.png'));
console.log('Copied favicon.png to public/');
