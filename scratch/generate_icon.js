const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Create a simple 128x128 RGBA PNG buffer with a gradient indigo background and a white N logo
const width = 128;
const height = 128;

// Create raw uncompressed RGBA pixel data (scanlines with 0 filter byte per line)
const rowSize = 1 + width * 4;
const buffer = Buffer.alloc(height * rowSize);

for (let y = 0; y < height; y++) {
  const rowOffset = y * rowSize;
  buffer[rowOffset] = 0; // Filter type 0 (None)
  
  for (let x = 0; x < width; x++) {
    const pixelOffset = rowOffset + 1 + x * 4;
    
    // Circle mask with radius 56
    const dx = x - 64;
    const dy = y - 64;
    const distSq = dx * dx + dy * dy;
    
    if (distSq <= 60 * 60) {
      // Modern Indigo-Purple gradient
      const r = Math.floor(79 + (x / 128) * 30);
      const g = Math.floor(70 + (y / 128) * 20);
      const b = Math.floor(229);
      
      // Draw "N" logo shape inside circle
      const isN = (x >= 42 && x <= 52 && y >= 36 && y <= 92) ||
                  (x >= 76 && x <= 86 && y >= 36 && y <= 92) ||
                  (x >= 42 && x <= 86 && Math.abs((y - 36) - (x - 42) * (56 / 44)) <= 5 && y >= 36 && y <= 92);
      
      if (isN) {
        buffer[pixelOffset] = 255;     // Red
        buffer[pixelOffset + 1] = 255; // Green
        buffer[pixelOffset + 2] = 255; // Blue
        buffer[pixelOffset + 3] = 255; // Alpha
      } else {
        buffer[pixelOffset] = r;
        buffer[pixelOffset + 1] = g;
        buffer[pixelOffset + 2] = b;
        buffer[pixelOffset + 3] = 255;
      }
    } else {
      // Transparent outside circle
      buffer[pixelOffset] = 0;
      buffer[pixelOffset + 1] = 0;
      buffer[pixelOffset + 2] = 0;
      buffer[pixelOffset + 3] = 0;
    }
  }
}

// Compress data with zlib
const compressed = zlib.deflateSync(buffer);

// Helpers for PNG chunk creation
function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  
  const crcVal = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crcVal >>> 0, 0);
  
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// Simple CRC32 implementation
function crc32(buf) {
  let table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return crc ^ 0xffffffff;
}

// PNG Header
const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

// IHDR Chunk
const ihdrData = Buffer.alloc(13);
ihdrData.writeUInt32BE(width, 0);
ihdrData.writeUInt32BE(height, 4);
ihdrData[8] = 8;  // bit depth
ihdrData[9] = 6;  // color type RGBA
ihdrData[10] = 0; // compression
ihdrData[11] = 0; // filter
ihdrData[12] = 0; // interlace
const ihdrChunk = createChunk('IHDR', ihdrData);

// IDAT Chunk
const idatChunk = createChunk('IDAT', compressed);

// IEND Chunk
const iendChunk = createChunk('IEND', Buffer.alloc(0));

const pngBuffer = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);

const outDir = path.join(__dirname, '..', 'extension', 'icons');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'icon128.png'), pngBuffer);
console.log('Successfully generated extension/icons/icon128.png');
