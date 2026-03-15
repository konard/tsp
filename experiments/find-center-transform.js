// Check if step4's center 8x8 path is step3's path under a geometric transform.
// The rank grid comparison showed they differ, but let me check all 8 symmetries.

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

const step2 = toGrid(parseSvgPath(readFileSync('target-svgs/tsp-tour-3.svg', 'utf8')));
const step3 = toGrid(parseSvgPath(readFileSync('target-svgs/tsp-tour-2.svg', 'utf8')));
const step4 = toGrid(parseSvgPath(readFileSync('target-svgs/tsp-tour-5.svg', 'utf8')));

// Extract center path
function extractCenter(path, n, innerSize) {
  const offset = (n - innerSize) / 2;
  const result = [];
  for (let d = 0; d < path.length; d++) {
    const p = path[d];
    if (p.col >= offset && p.col < offset + innerSize && 
        p.row >= offset && p.row < offset + innerSize) {
      result.push({col: p.col - offset, row: p.row - offset, origD: d});
    }
  }
  return result;
}

// Transform a path
function transformPath(path, n, t) {
  return path.map(p => {
    let {col, row} = p;
    switch(t) {
      case 0: return {...p, col, row}; // identity
      case 1: return {...p, col: n-1-row, row: col}; // CW 90
      case 2: return {...p, col: n-1-col, row: n-1-row}; // 180
      case 3: return {...p, col: row, row: n-1-col}; // CCW 90
      case 4: return {...p, col: n-1-col, row}; // flip horizontal
      case 5: return {...p, col: row, row: col}; // flip diagonal
      case 6: return {...p, col, row: n-1-row}; // flip vertical
      case 7: return {...p, col: n-1-row, row: n-1-col}; // flip anti-diagonal
    }
  });
}

const tNames = ['id', 'cw90', '180', 'ccw90', 'flipH', 'flipD', 'flipV', 'flipAD'];

// Center of step 4 (8x8 in 16x16)
const center4 = extractCenter(step4, 16, 8);
console.log('Center of step 4: ' + center4.length + ' cells');

// Center of step 3 (4x4 in 8x8)
const center3 = extractCenter(step3, 8, 4);
console.log('Center of step 3: ' + center3.length + ' cells');

// Compare center4 with all transforms of step3
console.log('\n=== Compare center4 path with transforms of step3 ===');
for (let t = 0; t < 8; t++) {
  const tStep3 = transformPath(step3, 8, t);
  let match = true;
  for (let i = 0; i < 64; i++) {
    if (center4[i].col !== tStep3[i].col || center4[i].row !== tStep3[i].row) {
      match = false;
      break;
    }
  }
  if (match) console.log(`  MATCH: center4 = ${tNames[t]}(step3)`);
}

// Also try reversed step3 (traversed in opposite direction)
for (let t = 0; t < 8; t++) {
  const reversed3 = [...step3].reverse();
  const tStep3 = transformPath(reversed3, 8, t);
  let match = true;
  for (let i = 0; i < 64; i++) {
    if (center4[i].col !== tStep3[i].col || center4[i].row !== tStep3[i].row) {
      match = false;
      break;
    }
  }
  if (match) console.log(`  MATCH: center4 = ${tNames[t]}(reversed(step3))`);
}

// Compare center3 with all transforms of step2
console.log('\n=== Compare center3 path with transforms of step2 ===');
for (let t = 0; t < 8; t++) {
  const tStep2 = transformPath(step2, 4, t);
  let match = true;
  for (let i = 0; i < 16; i++) {
    if (center3[i].col !== tStep2[i].col || center3[i].row !== tStep2[i].row) {
      match = false;
      break;
    }
  }
  if (match) console.log(`  MATCH: center3 = ${tNames[t]}(step2)`);
}

// Also try reversed
for (let t = 0; t < 8; t++) {
  const reversed2 = [...step2].reverse();
  const tStep2 = transformPath(reversed2, 4, t);
  let match = true;
  for (let i = 0; i < 16; i++) {
    if (center3[i].col !== tStep2[i].col || center3[i].row !== tStep2[i].row) {
      match = false;
      break;
    }
  }
  if (match) console.log(`  MATCH: center3 = ${tNames[t]}(reversed(step2))`);
}

// If no match found, let's look at the actual sequences side by side
console.log('\n=== Side-by-side: center4 vs step3 ===');
console.log('First 5:');
for (let i = 0; i < 5; i++) {
  console.log(`  i=${i}: center4=(${center4[i].col},${center4[i].row}) step3=(${step3[i].col},${step3[i].row})`);
}

// Let me check if center4 is a SHIFTED version of step3.
// E.g., step3 rotated by some number of positions.
console.log('\n=== Check if center4 is a circular shift of step3 ===');
for (let shift = 0; shift < 64; shift++) {
  let match = true;
  for (let i = 0; i < 64; i++) {
    const j = (i + shift) % 64;
    if (center4[i].col !== step3[j].col || center4[i].row !== step3[j].row) {
      match = false;
      break;
    }
  }
  if (match) console.log(`  MATCH: center4 = step3 shifted by ${shift}`);
}

// Check shifted + transformed
for (let t = 0; t < 8; t++) {
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
    if (match) console.log(`  MATCH: center4 = ${tNames[t]}(step3) shifted by ${shift}`);
  }
}

// Also check center3 = shifted + transformed step2
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
    if (match) console.log(`  MATCH: center3 = ${tNames[t]}(step2) shifted by ${shift}`);
  }
}
