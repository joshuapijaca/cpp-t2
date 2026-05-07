/**
 * generate-pwa-icons.cjs — Generate PWA icon PNG files from scratch.
 *
 * Pure Node, zero external image deps. Produces:
 *   public/pwa-192x192.png  — square icon, theme color background, "C++"+"T2" monogram
 *   public/pwa-512x512.png  — same at 512
 *   public/pwa-maskable-512.png — same with safe-zone padding for adaptive icons
 *   public/favicon.ico      — 32x32 ICO file
 *
 * Encodes PNG manually:
 *   - signature
 *   - IHDR chunk (width/height/bit-depth/color-type)
 *   - IDAT chunk (compressed RGB filter-byte rows)
 *   - IEND chunk
 *
 * Glyph data is a tiny 5x7 bitmap font for "C++T2"; we draw it scaled into
 * the icon center on a dark bg (#0d1117) with text color #58a6ff (GitHub blue).
 */
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');
fs.mkdirSync(PUBLIC_DIR, { recursive: true });

// 5x7 bitmap font for the chars we need: C, +, T, 2.
// Each row is left-to-right (MSB = leftmost pixel).
const FONT = {
  C: [
    0b01110,
    0b10001,
    0b10000,
    0b10000,
    0b10000,
    0b10001,
    0b01110,
  ],
  '+': [
    0b00000,
    0b00100,
    0b00100,
    0b11111,
    0b00100,
    0b00100,
    0b00000,
  ],
  T: [
    0b11111,
    0b00100,
    0b00100,
    0b00100,
    0b00100,
    0b00100,
    0b00100,
  ],
  '2': [
    0b01110,
    0b10001,
    0b00001,
    0b00010,
    0b00100,
    0b01000,
    0b11111,
  ],
};

const BG = [0x0d, 0x11, 0x17]; // theme_color
const FG = [0x58, 0xa6, 0xff]; // monogram color (cool blue)

function makeImageRGB(w, h, drawFn) {
  // Allocate w*h*3 bytes filled with BG.
  const pixels = Buffer.alloc(w * h * 3);
  for (let i = 0; i < w * h; i++) {
    pixels[i * 3] = BG[0];
    pixels[i * 3 + 1] = BG[1];
    pixels[i * 3 + 2] = BG[2];
  }
  drawFn((x, y, color) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = (y * w + x) * 3;
    pixels[i] = color[0];
    pixels[i + 1] = color[1];
    pixels[i + 2] = color[2];
  });
  return pixels;
}

function drawGlyph(setPixel, ch, x0, y0, scale, color) {
  const glyph = FONT[ch];
  if (!glyph) return;
  for (let r = 0; r < 7; r++) {
    const row = glyph[r];
    for (let c = 0; c < 5; c++) {
      const bit = (row >> (4 - c)) & 1;
      if (!bit) continue;
      // Fill scale x scale block.
      for (let dy = 0; dy < scale; dy++) {
        for (let dx = 0; dx < scale; dx++) {
          setPixel(x0 + c * scale + dx, y0 + r * scale + dy, color);
        }
      }
    }
  }
}

function drawText(setPixel, text, cx, cy, scale, color) {
  // 5px wide, 7px tall, 1px space => 6px advance per char.
  const advance = 6 * scale;
  const totalW = text.length * 5 * scale + (text.length - 1) * scale;
  const x0 = cx - totalW / 2;
  const y0 = cy - (7 * scale) / 2;
  for (let i = 0; i < text.length; i++) {
    drawGlyph(setPixel, text[i], Math.round(x0 + i * advance), Math.round(y0), scale, color);
  }
}

function drawIcon(w, h, paddingFrac) {
  // paddingFrac=0   -> fill, used for normal icons
  // paddingFrac=0.2 -> safe-zone for maskable
  return makeImageRGB(w, h, (setPixel) => {
    // Center two text rows: "C++" on top, "T2" below.
    const safeW = w * (1 - paddingFrac * 2);
    // Pick text scale so "C++" (~17px raw) fits inside ~half the safe width.
    const targetW = safeW * 0.55;
    const rawWidth = 5 * 3 + 1 * 2; // 17 raw px for "C++"
    const scale = Math.max(2, Math.floor(targetW / rawWidth));
    const rowGap = scale * 3;
    const totalH = 7 * scale * 2 + rowGap;
    const cx = w / 2;
    const topCy = h / 2 - totalH / 2 + (7 * scale) / 2;
    const bottomCy = topCy + 7 * scale + rowGap;
    drawText(setPixel, 'C++', cx, topCy, scale, FG);
    drawText(setPixel, 'T2', cx, bottomCy, scale, FG);
  });
}

// ─── PNG encoder ───────────────────────────────────────────────────────

function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(width, height, rgb) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = chunk('IHDR', ihdr);
  // IDAT — prepend filter byte 0 to each row
  const stride = width * 3;
  const filtered = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    filtered[y * (stride + 1)] = 0;
    rgb.copy(filtered, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const compressed = zlib.deflateSync(filtered);
  const idatChunk = chunk('IDAT', compressed);
  const iendChunk = chunk('IEND', Buffer.alloc(0));
  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

function writePng(file, w, h, paddingFrac) {
  const rgb = drawIcon(w, h, paddingFrac);
  const png = encodePng(w, h, rgb);
  fs.writeFileSync(file, png);
  console.log(`wrote ${path.relative(process.cwd(), file)}  (${w}x${h}, ${png.length} B)`);
}

writePng(path.join(PUBLIC_DIR, 'pwa-192x192.png'), 192, 192, 0);
writePng(path.join(PUBLIC_DIR, 'pwa-512x512.png'), 512, 512, 0);
writePng(path.join(PUBLIC_DIR, 'pwa-maskable-512.png'), 512, 512, 0.2);

// ─── ICO encoder (favicon) ─────────────────────────────────────────────
//
// ICO container holding a single 32x32 PNG entry. Modern browsers accept
// PNG-in-ICO; we don't need the legacy BMP-in-ICO path.

function writeIco(file, size) {
  const rgb = drawIcon(size, size, 0);
  const png = encodePng(size, size, rgb);
  // ICONDIR (6 bytes): reserved=0, type=1 (icon), count=1
  // ICONDIRENTRY (16 bytes): width, height, palette, reserved, planes(2), bpp(2), size(4), offset(4)
  const dir = Buffer.alloc(6 + 16);
  dir.writeUInt16LE(0, 0);
  dir.writeUInt16LE(1, 2);
  dir.writeUInt16LE(1, 4);
  // entry
  dir.writeUInt8(size === 256 ? 0 : size, 6);
  dir.writeUInt8(size === 256 ? 0 : size, 7);
  dir.writeUInt8(0, 8); // palette
  dir.writeUInt8(0, 9); // reserved
  dir.writeUInt16LE(1, 10); // planes
  dir.writeUInt16LE(32, 12); // bpp
  dir.writeUInt32LE(png.length, 14); // size
  dir.writeUInt32LE(22, 18); // offset (after dir+entry)
  fs.writeFileSync(file, Buffer.concat([dir, png]));
  console.log(`wrote ${path.relative(process.cwd(), file)}  (${size}x${size} ICO, ${png.length + 22} B)`);
}

writeIco(path.join(PUBLIC_DIR, 'favicon.ico'), 32);

// ─── Source SVG (for re-generation reference) ──────────────────────────
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0d1117"/>
  <text x="256" y="220" font-family="JetBrains Mono, monospace" font-size="120" font-weight="700"
        text-anchor="middle" fill="#58a6ff">C++</text>
  <text x="256" y="360" font-family="JetBrains Mono, monospace" font-size="120" font-weight="700"
        text-anchor="middle" fill="#58a6ff">T2</text>
</svg>
`;
fs.writeFileSync(path.join(PUBLIC_DIR, 'pwa-icon-source.svg'), svg);
console.log(`wrote public/pwa-icon-source.svg  (${svg.length} B)`);
