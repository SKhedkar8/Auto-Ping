const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Standard CRC32 implementation for PNG chunks
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function createPng(size, isMaskable = false) {
  // RGBA buffer
  const rawRows = [];

  const center = size / 2;
  const radius = isMaskable ? size * 0.48 : size * 0.44;
  const carScale = size / 100;

  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4);
    row[0] = 0; // Filter: None

    for (let x = 0; x < size; x++) {
      const idx = 1 + x * 4;
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background color: Vibrant AutoPing Primary Blue (#2563EB)
      // Slight vertical gradient from #3B82F6 to #1D4ED8
      const gradT = y / size;
      let r = Math.round(37 * (1 - gradT) + 29 * gradT);
      let g = Math.round(99 * (1 - gradT) + 78 * gradT);
      let b = Math.round(235 * (1 - gradT) + 216 * gradT);
      let a = 255;

      // Rounded squircle / circular corners for non-maskable icons
      if (!isMaskable) {
        // Smooth rounded rectangle
        const cornerR = size * 0.22;
        const clX = Math.max(0, Math.abs(dx) - (center - cornerR));
        const clY = Math.max(0, Math.abs(dy) - (center - cornerR));
        const cornerDist = Math.sqrt(clX * clX + clY * clY);
        if (cornerDist > cornerR) {
          const edgeAlpha = Math.max(0, Math.min(1, cornerR + 1 - cornerDist));
          a = Math.round(edgeAlpha * 255);
        }
      }

      // Draw stylized Car icon / "AP" in center
      // Simple recognizable modern vehicle silhouette
      const relX = (x - center) / carScale;
      const relY = (y - center) / carScale;

      let isCarPixel = false;

      // Car roof / cabin: relY between -16 and -4, relX between -20 and 20 (trapezoid)
      if (relY >= -16 && relY <= -4) {
        const halfWidth = 14 + (relY - (-16)) * 0.8;
        if (Math.abs(relX) <= halfWidth) isCarPixel = true;
      }
      // Car lower body: relY between -4 and 10, relX between -32 and 32
      if (relY >= -4 && relY <= 10 && Math.abs(relX) <= 32) {
        isCarPixel = true;
      }
      // Wheels cutouts (invert to make dark wheels)
      const wheel1Dist = Math.hypot(relX - (-18), relY - 11);
      const wheel2Dist = Math.hypot(relX - 18, relY - 11);
      if (wheel1Dist <= 7.5 || wheel2Dist <= 7.5) {
        isCarPixel = false;
      }
      // Wheel rims
      if ((wheel1Dist <= 3.5 && wheel1Dist >= 0) || (wheel2Dist <= 3.5 && wheel2Dist >= 0)) {
        isCarPixel = true;
      }
      // Headlights / taillights
      if (relY >= 0 && relY <= 5 && (relX <= -28 || relX >= 28)) {
        isCarPixel = true;
      }
      // Windshield cutout
      if (relY >= -13 && relY <= -5 && Math.abs(relX) <= 18) {
        // window
        if (Math.abs(relX) > 2.5) {
          // Glass color: Cyan accent (#38BDF8)
          r = 56;
          g = 189;
          b = 248;
          isCarPixel = true;
        }
      }

      if (isCarPixel) {
        // If not windshield, make crisp white
        if (r !== 56) {
          r = 255;
          g = 255;
          b = 255;
        }
      }

      row[idx] = r;
      row[idx + 1] = g;
      row[idx + 2] = b;
      row[idx + 3] = a;
    }
    rawRows.push(row);
  }

  const rawData = Buffer.concat(rawRows);
  const compressed = zlib.deflateSync(rawData);

  // PNG Header
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

const outDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'icon-192.png'), createPng(192, false));
fs.writeFileSync(path.join(outDir, 'icon-512.png'), createPng(512, false));
fs.writeFileSync(path.join(outDir, 'icon-maskable-192.png'), createPng(192, true));
fs.writeFileSync(path.join(outDir, 'icon-maskable-512.png'), createPng(512, true));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), createPng(180, false));

console.log('Successfully generated AutoPing PWA icons in public/icons/');
