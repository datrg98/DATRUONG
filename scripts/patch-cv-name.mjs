import fs from 'node:fs';
import zlib from 'node:zlib';

// 1. Extract GID 532 (Capital Breve) directly from system Calibri-Bold
const calibriBuf = fs.readFileSync('C:/Windows/Fonts/calibrib.ttf');
let glyfOffset = 0, locaOffset = 0;
const numTables = calibriBuf.readUInt16BE(4);
for (let i = 0; i < numTables; i++) {
  const tag = calibriBuf.slice(12 + i * 16, 12 + i * 16 + 4).toString('ascii');
  const off = calibriBuf.readUInt32BE(12 + i * 16 + 8);
  if (tag === 'glyf') glyfOffset = off;
  if (tag === 'loca') locaOffset = off;
}
function getLoc(gid) {
  return calibriBuf.readUInt32BE(locaOffset + gid * 4);
}
const gOff1 = getLoc(532);
const gOff2 = getLoc(533);
const gData = calibriBuf.slice(glyfOffset + gOff1, glyfOffset + gOff2);

const numContours = gData.readInt16BE(0);
const endPts = [];
for (let c = 0; c < numContours; c++) endPts.push(gData.readUInt16BE(10 + c * 2));
const instrLen = gData.readUInt16BE(10 + numContours * 2);
let p = 12 + numContours * 2 + instrLen;
const totalPoints = endPts[endPts.length - 1] + 1;

const flags = [];
while (flags.length < totalPoints) {
  const f = gData[p++];
  flags.push(f);
  if (f & 8) {
    const repeat = gData[p++];
    for (let r = 0; r < repeat; r++) flags.push(f);
  }
}
const xs = [], ys = [];
let curX = 0, curY = 0;
for (let i = 0; i < totalPoints; i++) {
  const f = flags[i];
  if (f & 2) { const dx = gData[p++]; curX += (f & 16) ? dx : -dx; }
  else if (!(f & 16)) { const dx = gData.readInt16BE(p); p += 2; curX += dx; }
  xs.push(curX);
}
for (let i = 0; i < totalPoints; i++) {
  const f = flags[i];
  if (f & 4) { const dy = gData[p++]; curY += (f & 32) ? dy : -dy; }
  else if (!(f & 32)) { const dy = gData.readInt16BE(p); p += 2; curY += dy; }
  ys.push(curY);
}

function generateBrevePath(scale, offsetX, offsetY) {
  let pts = [];
  for (let i = 0; i <= endPts[0]; i++) {
    pts.push({ x: xs[i], y: ys[i], on: !!(flags[i] & 1) });
  }
  let exp = [];
  for (let i = 0; i < pts.length; i++) {
    const curr = pts[i];
    const next = pts[(i + 1) % pts.length];
    exp.push(curr);
    if (!curr.on && !next.on) {
      exp.push({ x: (curr.x + next.x) / 2, y: (curr.y + next.y) / 2, on: true });
    }
  }
  if (!exp[0].on) {
    const last = exp[exp.length - 1];
    if (last.on) exp.unshift(exp.pop());
    else exp.unshift({ x: (exp[0].x + last.x) / 2, y: (exp[0].y + last.y) / 2, on: true });
  }

  const tx = (v) => (v * scale + offsetX).toFixed(4);
  const ty = (v) => (v * scale + offsetY).toFixed(4);

  let path = `${tx(exp[0].x)} ${ty(exp[0].y)} m\n`;
  let i = 1;
  while (i < exp.length) {
    const p1 = exp[i];
    if (p1.on) {
      path += `${tx(p1.x)} ${ty(p1.y)} l\n`;
      i++;
    } else {
      const p0 = exp[i - 1];
      const p2 = exp[(i + 1) % exp.length];
      const cp1x = p0.x + (2 / 3) * (p1.x - p0.x);
      const cp1y = p0.y + (2 / 3) * (p1.y - p0.y);
      const cp2x = p2.x + (2 / 3) * (p1.x - p2.x);
      const cp2y = p2.y + (2 / 3) * (p1.y - p2.y);
      path += `${tx(cp1x)} ${ty(cp1y)} ${tx(cp2x)} ${ty(cp2y)} ${tx(p2.x)} ${ty(p2.y)} c\n`;
      i += 2;
    }
  }
  path += 'h\nf*\n';
  return path;
}

// 2. Read the source CV PDF (from CV source if exists, or output/pdf)
let originalPdfBuf;
if (fs.existsSync('C:/DATRG/CV source/TRUONG_VAN_QUANG_DAT_CV.pdf')) {
  originalPdfBuf = fs.readFileSync('C:/DATRG/CV source/TRUONG_VAN_QUANG_DAT_CV.pdf');
} else {
  originalPdfBuf = fs.readFileSync('public/TRUONG_VAN_QUANG_DAT_CV.pdf');
}

function decodeAscii85(str) {
  let clean = str.replace(/\s+/g, '');
  if (clean.endsWith('~>')) clean = clean.slice(0, -2);
  let bytes = [];
  let tuple = 0, count = 0;
  for (let i = 0; i < clean.length; i++) {
    const c = clean.charCodeAt(i);
    if (c >= 33 && c <= 117) {
      tuple = tuple * 85 + (c - 33);
      count++;
      if (count === 5) {
        bytes.push((tuple >> 24) & 0xff);
        bytes.push((tuple >> 16) & 0xff);
        bytes.push((tuple >> 8) & 0xff);
        bytes.push(tuple & 0xff);
        tuple = 0;
        count = 0;
      }
    } else if (clean[i] === 'z' && count === 0) {
      bytes.push(0, 0, 0, 0);
    }
  }
  if (count > 0) {
    let padding = 5 - count;
    for (let p = 0; p < padding; p++) tuple = tuple * 85 + 84;
    for (let p = 0; p < count - 1; p++) {
      bytes.push((tuple >> (24 - 8 * p)) & 0xff);
    }
  }
  return Buffer.from(bytes);
}

let stream6Text;
if (originalPdfBuf.includes(Buffer.from('/ASCII85Decode /FlateDecode'))) {
  const s6Idx = originalPdfBuf.lastIndexOf(Buffer.from('/ASCII85Decode /FlateDecode'));
  const streamStart = originalPdfBuf.indexOf(Buffer.from('stream'), s6Idx) + 6;
  let start = streamStart;
  if (originalPdfBuf[start] === 0x0d && originalPdfBuf[start + 1] === 0x0a) start += 2;
  else if (originalPdfBuf[start] === 0x0a || originalPdfBuf[start] === 0x0d) start += 1;
  const end = originalPdfBuf.indexOf(Buffer.from('endstream'), start);
  const rawS6 = originalPdfBuf.slice(start, end).toString('latin1');
  const a85Decoded = decodeAscii85(rawS6);
  stream6Text = zlib.inflateSync(a85Decoded).toString('latin1');
} else {
  const s6Idx = originalPdfBuf.lastIndexOf(Buffer.from('/Filter [ /FlateDecode ]'));
  const streamStart = originalPdfBuf.indexOf(Buffer.from('stream'), s6Idx) + 6;
  let start = streamStart;
  if (originalPdfBuf[start] === 0x0d && originalPdfBuf[start + 1] === 0x0a) start += 2;
  else if (originalPdfBuf[start] === 0x0a || originalPdfBuf[start] === 0x0d) start += 1;
  const end = originalPdfBuf.indexOf(Buffer.from('endstream'), start);
  stream6Text = zlib.inflateSync(originalPdfBuf.slice(start, end)).toString('latin1');
}

// 3. Calculate position for A and the capital breve accent
const fontSize = 28;
const scale = fontSize / 2048;

// Character widths in F2+0 at 1000 units
const wStart = originalPdfBuf.indexOf('/Widths [') + 9;
const wEnd = originalPdfBuf.indexOf(']', wStart);
const widths = originalPdfBuf.toString('latin1').substring(wStart, wEnd).trim().split(/\s+/).map(Number);

const charsBeforeA = [84, 82, 3, 4, 78, 71, 32, 86]; // T, R, Ư, Ơ, N, G, ' ', V
let xA = 34;
for (const code of charsBeforeA) {
  xA += widths[code] * fontSize / 1000;
}
const dxBreve = 222 * fontSize / 2048;
const breveX = xA + dxBreve;
const baseY = 788.6898;

const brevePath = generateBrevePath(scale, breveX, baseY);

// Build new stream content
let newStream6Text = stream6Text;
if (newStream6Text.includes('(\\001\\002T TR\\003\\004NG) Tj')) {
  const targetRegex = /BT 1 0 0 1 34 788\.6898 Tm \/F2\+0 \d+(\.\d+)? Tf \d+(\.\d+)? TL \(\\001\\002T TR\\003\\004NG\) Tj T\* ET/;
  const replacement = `BT 1 0 0 1 34 788.6898 Tm /F2+0 ${fontSize} Tf ${fontSize * 1.2} TL (TR\\003\\004NG VAN QUANG \\001\\002T) Tj T* ET\nq\n.098039 .176471 .239216 rg\n${brevePath}Q`;
  newStream6Text = newStream6Text.replace(targetRegex, replacement);
} else if (newStream6Text.includes('(TR\\003\\004NG VAN QUANG \\001\\002T) Tj')) {
  const targetRegex = /BT 1 0 0 1 34 788\.6898 Tm \/F2\+0 \d+(\.\d+)? Tf \d+(\.\d+)? TL \(TR\\003\\004NG VAN QUANG \\001\\002T\) Tj T\* ET[\s\S]*?Q/;
  const replacement = `BT 1 0 0 1 34 788.6898 Tm /F2+0 ${fontSize} Tf ${fontSize * 1.2} TL (TR\\003\\004NG VAN QUANG \\001\\002T) Tj T* ET\nq\n.098039 .176471 .239216 rg\n${brevePath}Q`;
  newStream6Text = newStream6Text.replace(targetRegex, replacement);
}

const newStream6Deflated = zlib.deflateSync(Buffer.from(newStream6Text, 'latin1'));

// 4. Construct new object 20 and xref table
const obj20Offset = originalPdfBuf.lastIndexOf(Buffer.from('20 0 obj'));
const part1 = originalPdfBuf.slice(0, obj20Offset);

const newObj20 = `20 0 obj
<< /Filter [ /FlateDecode ] /Length ${newStream6Deflated.length} >>
stream
`;
const newObj20End = `\nendstream
endobj
`;

// Extract objects 0..19 offsets from original xref table
const xrefStart = originalPdfBuf.lastIndexOf(Buffer.from('xref'));
const xrefText = originalPdfBuf.slice(xrefStart).toString('latin1');
const xrefLines = xrefText.split('\n');

const objectOffsets = [];
let readingOffsets = false;
for (const line of xrefLines) {
  if (line.startsWith('0 21')) {
    readingOffsets = true;
    continue;
  }
  if (readingOffsets) {
    if (line.startsWith('trailer')) break;
    const parts = line.trim().split(' ');
    if (parts.length >= 2) {
      objectOffsets.push(parts[0]);
    }
  }
}

// Update object 20 offset
objectOffsets[20] = String(obj20Offset).padStart(10, '0');

// Rebuild xref table
const newXrefOffset = obj20Offset + Buffer.byteLength(newObj20) + newStream6Deflated.length + Buffer.byteLength(newObj20End);
let newXref = `xref\n0 21\n`;
for (let i = 0; i < 21; i++) {
  const type = i === 0 ? '65535 f' : '00000 n';
  newXref += `${objectOffsets[i]} ${type} \n`;
}
newXref += `trailer
<<
/ID 
[<21b84f26521bfd23257b9911429fe934><21b84f26521bfd23257b9911429fe934>]
/Info 18 0 R
/Root 17 0 R
/Size 21
>>
startxref
${newXrefOffset}
%%EOF
`;

const finalPdf = Buffer.concat([
  part1,
  Buffer.from(newObj20, 'latin1'),
  newStream6Deflated,
  Buffer.from(newObj20End, 'latin1'),
  Buffer.from(newXref, 'latin1')
]);

console.log('Original PDF length:', originalPdfBuf.length);
console.log('New PDF length:', finalPdf.length);

// Save to all destinations
fs.writeFileSync('output/pdf/TRUONG_VAN_QUANG_DAT_CV.pdf', finalPdf);
fs.writeFileSync('public/Dat-Truong-CV.pdf', finalPdf);
fs.writeFileSync('public/TRUONG_VAN_QUANG_DAT_CV.pdf', finalPdf);
if (fs.existsSync('C:/DATRG/CV source')) {
  fs.writeFileSync('C:/DATRG/CV source/TRUONG_VAN_QUANG_DAT_CV.pdf', finalPdf);
}

console.log('CV successfully updated with "TRƯƠNG VĂN QUANG ĐẠT"!');
