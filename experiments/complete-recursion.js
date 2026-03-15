import { readFileSync } from 'fs';
function parseSvgPath(svgContent) {
  const pathMatch = svgContent.match(/d="([^"]+)"/);
  const points = [];
  const parts = pathMatch[1].trim().split(/\s+/);
  let i = 0;
  while (i < parts.length) {
    if (parts[i] === 'M' || parts[i] === 'L') {
      points.push({ x: parseFloat(parts[i + 1]), y: parseFloat(parts[i + 2]) });
      i += 3;
    } else { i += 1; }
  }
  return points;
}
function toGrid(points) {
  const xs = [...new Set(points.map(p => p.x))].sort((a, b) => a - b);
  const ys = [...new Set(points.map(p => p.y))].sort((a, b) => a - b);
  return points.map(p => ({ col: xs.indexOf(p.x), row: ys.indexOf(p.y) }));
}

const step1 = toGrid(parseSvgPath(readFileSync('target-svgs/tsp-tour-4.svg', 'utf8')));
const step2 = toGrid(parseSvgPath(readFileSync('target-svgs/tsp-tour-3.svg', 'utf8')));
const step3 = toGrid(parseSvgPath(readFileSync('target-svgs/tsp-tour-2.svg', 'utf8')));
const step4 = toGrid(parseSvgPath(readFileSync('target-svgs/tsp-tour-5.svg', 'utf8')));

function extractCenter(path, n, innerSize) {
  const offset = (n - innerSize) / 2;
  return path.filter(p => 
    p.col >= offset && p.col < offset + innerSize && 
    p.row >= offset && p.row < offset + innerSize
  ).map(p => ({col: p.col - offset, row: p.row - offset}));
}

// center3 path (step 3 center 4x4):
const center3 = extractCenter(step3, 8, 4);
console.log('center3:', center3.map(p => `(${p.col},${p.row})`).join(' -> '));
console.log('step2:  ', step2.map(p => `(${p.col},${p.row})`).join(' -> '));

// center3 = step2 shifted by 13? Let me check identity first:
for (let shift = 0; shift < 16; shift++) {
  let match = true;
  for (let i = 0; i < 16; i++) {
    const j = (i + shift) % 16;
    if (center3[i].col !== step2[j].col || center3[i].row !== step2[j].row) {
      match = false;
      break;
    }
  }
  if (match) console.log(`center3 = step2 shifted by ${shift} (identity)`);
}

// Hmm, the earlier search said no match for identity shift.
// Let me check all transforms + shifts again:
function transformPath(path, n, t) {
  return path.map(p => {
    let {col, row} = p;
    switch(t) {
      case 0: return {col, row};
      case 1: return {col: n-1-row, row: col}; // CW 90
      case 2: return {col: n-1-col, row: n-1-row}; // 180
      case 3: return {col: row, row: n-1-col}; // CCW 90
      case 4: return {col: n-1-col, row}; // flip horizontal
      case 5: return {col: row, row: col}; // flip diagonal
      case 6: return {col, row: n-1-row}; // flip vertical
      case 7: return {col: n-1-row, row: n-1-col}; // flip anti-diagonal
    }
  });
}
const tNames = ['id', 'cw90', '180', 'ccw90', 'flipH', 'flipD', 'flipV', 'flipAD'];

for (let t = 0; t < 8; t++) {
  const tStep2 = transformPath(step2, 4, t);
  for (let shift = 0; shift < 16; shift++) {
    let match = true;
    for (let i = 0; i < 16; i++) {
      const j = (i + shift) % 16;
      if (center3[i].col !== tStep2[j].col || center3[i].row !== tStep2[j].row) {
        match = false;
        break;
      }
    }
    if (match) console.log(`center3 = ${tNames[t]}(step2) shifted by ${shift}`);
  }
}

// And center4 = step3 shifted by 51 (identity). Let me double check:
const center4 = extractCenter(step4, 16, 8);
for (let shift = 0; shift < 64; shift++) {
  let match = true;
  for (let i = 0; i < 64; i++) {
    const j = (i + shift) % 64;
    if (center4[i].col !== step3[j].col || center4[i].row !== step3[j].row) {
      match = false;
      break;
    }
  }
  if (match) console.log(`center4 = step3 shifted by ${shift} (identity)`);
}

// And all transforms for center4:
for (let t = 1; t < 8; t++) {
  const tStep3 = transformPath(step3, 8, t);
  for (let shift = 0; shift < 64; shift++) {
    let match = true;
    for (let i = 0; i < 64; i++) {
      const j = (i + shift) % 64;
      if (center4[i].col !== tStep3[j].col || center4[i].row !== tStep3[j].row) {
        match = false;
        break;
      }
    }
    if (match) console.log(`center4 = ${tNames[t]}(step3) shifted by ${shift}`);
  }
}
