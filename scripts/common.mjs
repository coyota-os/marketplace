// What publish.mjs and verify.mjs agree on.
import { execFileSync } from 'node:child_process';

/** Where approved packages live: the repository's main branch, served raw. */
/** A reverse domain and a name (net.ludei.checkers), as Kino's agentd checks it. */
export const ID = /^(?=.{1,80}$)[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9]+(-[a-z0-9]+)*){2,}$/;
export const VERSION = /^\d+(\.\d+){0,3}$/;
export const SDK = /^\d+\.\d+$/;
/** The publisher's website, and their contact (a page or an address), as Ludei opens them. */
export const HOMEPAGE = /^https:\/\/\S+$/i;
export const SUPPORT = /^(https:\/\/\S+|mailto:[^\s@]+@[^\s@]+)$/i;
export const CATEGORIES = ['accessories', 'games', 'multimedia', 'internet', 'office', 'development', 'system'];

/** Whether version `a` is newer than `b` ("1.10.0" > "1.9.2"). */
export const isNewer = (a, b) => {
  const pa = String(a).split('.').map(Number);
  const pb = String(b).split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d > 0;
  }
  return false;
};

/** One file out of a .app (a zip). unzip reads * ? [ ] in names as patterns: escaped. */
export const unzip = (pkg, file, encoding = 'utf8') =>
  execFileSync('unzip', ['-p', pkg, file.replace(/([*?[\]])/g, '\\$1')], { encoding, maxBuffer: 64 << 20 });

/** Screenshots: at most this many, each this big at most, in these formats. */
export const SCREENSHOTS_MAX = 6;
export const SCREENSHOT_BYTES = 1 << 20;
export const SCREENSHOT_SIDE = 1920;
export const SCREENSHOT_FILE = /^screenshots\/[A-Za-z0-9._-]+\.(png|webp|jpe?g)$/;

/** A PNG's, JPEG's or WebP's width and height, read from its header; null if it is none. */
export const imageSize = (b) => {
  if (b.length > 24 && b.readUInt32BE(0) === 0x89504e47) return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  if (b.length > 30 && b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const kind = b.toString('ascii', 12, 16);
    if (kind === 'VP8 ') return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
    if (kind === 'VP8L') {
      const bits = b.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (kind === 'VP8X') return { width: b.readUIntLE(24, 3) + 1, height: b.readUIntLE(27, 3) + 1 };
    return null;
  }
  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
    let at = 2;
    while (at + 9 < b.length) {
      if (b[at] !== 0xff) return null;
      const marker = b[at + 1];
      const length = b.readUInt16BE(at + 2);
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) return { width: b.readUInt16BE(at + 7), height: b.readUInt16BE(at + 5) };
      at += 2 + length;
    }
  }
  return null;
};

/** What is wrong with one screenshot's bytes, or null. */
export const screenshotProblem = (b) => {
  if (b.length > SCREENSHOT_BYTES) return `is larger than ${SCREENSHOT_BYTES} bytes`;
  const size = imageSize(b);
  if (!size) return 'is not a PNG, JPEG or WebP image';
  if (size.width > SCREENSHOT_SIDE || size.height > SCREENSHOT_SIDE) return `is larger than ${SCREENSHOT_SIDE} px on a side`;
  return null;
};
