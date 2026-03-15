// Analyze the path structure to find a direct construction algorithm.
// Focus on how the path navigates the grid - it appears to be a
// boustrophedon meander that spirals inward then outward.

import { readFileSync } from 'fs';

function parseSvgPath(svgContent) {
  const pathMatch = svgContent.match(/d="([^"]+)"/);
  const pathData = pathMatch[1];
  const points = [];
  const parts = pathData.trim().split(/\s+/);
  let i = 0;
  while (i < parts.length) {
    if (parts[i] === 'M' || parts[i] === 'L') {
      points.push({ x: parseFloat(parts[i + 1]), y: parseFloat(parts[i + 2]) });
      i += 3;
    } else if (parts[i] === 'Z') { i += 1; } else { i += 1; }
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

// Let me look at the path as a sequence of moves and find the pattern
function pathToMoves(path) {
  const moves = [];
  for (let i = 1; i < path.length; i++) {
    const dx = path[i].col - path[i-1].col;
    const dy = path[i].row - path[i-1].row;
    let dir;
    if (dx === 1 && dy === 0) dir = 'R';
    else if (dx === -1 && dy === 0) dir = 'L';
    else if (dx === 0 && dy === 1) dir = 'U';
    else if (dx === 0 && dy === -1) dir = 'D';
    else dir = `?(${dx},${dy})`;
    moves.push(dir);
  }
  return moves;
}

function compressMoves(moves) {
  const segments = [];
  let i = 0;
  while (i < moves.length) {
    let j = i;
    while (j < moves.length && moves[j] === moves[i]) j++;
    segments.push(moves[i] + (j - i));
    i = j;
  }
  return segments;
}

console.log('Step 1 moves:', compressMoves(pathToMoves(step1)).join(' '));
console.log('Step 2 moves:', compressMoves(pathToMoves(step2)).join(' '));
console.log('Step 3 moves:', compressMoves(pathToMoves(step3)).join(' '));
console.log('Step 4 moves:', compressMoves(pathToMoves(step4)).join(' '));

// Now let me look at this differently. The curve visits cells in a specific
// pattern that relates to concentric rectangles/rings.
// Let me trace the column visited at each row, forming a kind of "zigzag column" pattern.

console.log('\n=== Column sequences per row for step 3 (8x8) ===');
function buildD2XY(path) {
  return path.map((p, d) => ({d, col: p.col, row: p.row}));
}

const path3 = buildD2XY(step3);
for (let row = 7; row >= 0; row--) {
  const cellsInRow = path3.filter(c => c.row === row).sort((a,b) => a.d - b.d);
  console.log(`  row ${row}: ` + cellsInRow.map(c => `d${String(c.d).padStart(2)}@c${c.col}`).join(' '));
}

console.log('\n=== Column sequences per row for step 4 (16x16) ===');
const path4 = buildD2XY(step4);
for (let row = 15; row >= 0; row--) {
  const cellsInRow = path4.filter(c => c.row === row).sort((a,b) => a.d - b.d);
  console.log(`  row ${row}: ` + cellsInRow.map(c => `d${String(c.d).padStart(3)}@c${String(c.col).padStart(2)}`).join(' '));
}

// Let me look at it as "which column does the path go to at each step"
// and look for a pattern in the column sequence
console.log('\n=== Row-by-row visit pattern for step 3 ===');
// For each consecutive pair of visits in the same row, what's the direction?
const n3 = 8;
const grid3 = Array.from({length: n3}, () => Array(n3).fill(-1));
for (let d = 0; d < step3.length; d++) {
  grid3[step3[d].row][step3[d].col] = d;
}

// Print the grid with d values
console.log('Visit order grid (row 0 = bottom):');
for (let row = n3-1; row >= 0; row--) {
  console.log('  ' + grid3[row].map(d => String(d).padStart(3)).join(''));
}

console.log('\n=== Visit order grid for step 4 (16x16) ===');
const n4 = 16;
const grid4 = Array.from({length: n4}, () => Array(n4).fill(-1));
for (let d = 0; d < step4.length; d++) {
  grid4[step4[d].row][step4[d].col] = d;
}
for (let row = n4-1; row >= 0; row--) {
  console.log('  ' + grid4[row].map(d => String(d).padStart(4)).join(''));
}

// Now let me look at the recursive structure differently.
// Instead of orientation-based recursion, let me check if this is a
// Sierpinski curve variant or some other known space-filling curve.
//
// Key feature: the path starts near the center-bottom, goes left,
// spirals around the outside, comes back to the center, then goes
// outward again. This is characteristic of a "Greek key" or meander pattern.

// Let me check: is each 2x2 block visited in one of the 4 orientations,
// and can the FULL curve be constructed by knowing the block visit order
// and the inter-block connections?

console.log('\n=== 2x2 block analysis for step 3 ===');
for (let by = 0; by < 4; by++) {
  for (let bx = 0; bx < 4; bx++) {
    const cells = [];
    for (let ly = 0; ly < 2; ly++) {
      for (let lx = 0; lx < 2; lx++) {
        cells.push({lx, ly, d: grid3[by*2+ly][bx*2+lx]});
      }
    }
    cells.sort((a,b) => a.d - b.d);
    const order = cells.map(c => `(${c.lx},${c.ly})`).join('->');
    // Check which orientation
    let orient = '?';
    const orientations = {
      A: '(1,1)->(0,1)->(0,0)->(1,0)',
      B: '(0,0)->(1,0)->(1,1)->(0,1)',
      C: '(1,0)->(1,1)->(0,1)->(0,0)',
      D: '(0,1)->(0,0)->(1,0)->(1,1)',
    };
    for (const [name, pattern] of Object.entries(orientations)) {
      if (order === pattern) { orient = name; break; }
    }
    // Also check if the 4 cells are visited consecutively
    const ds = cells.map(c => c.d);
    const consecutive = (ds[3] - ds[0] === 3) && (ds[1] - ds[0] === 1) && (ds[2] - ds[1] === 1);
    process.stdout.write(`  (${bx},${by}):${orient}${consecutive ? '' : '*'}`);
  }
  console.log();
}

console.log('\n=== 2x2 block analysis for step 4 ===');
for (let by = 0; by < 8; by++) {
  for (let bx = 0; bx < 8; bx++) {
    const cells = [];
    for (let ly = 0; ly < 2; ly++) {
      for (let lx = 0; lx < 2; lx++) {
        cells.push({lx, ly, d: grid4[by*2+ly][bx*2+lx]});
      }
    }
    cells.sort((a,b) => a.d - b.d);
    const order = cells.map(c => `(${c.lx},${c.ly})`).join('->');
    let orient = '?';
    const orientations = {
      A: '(1,1)->(0,1)->(0,0)->(1,0)',
      B: '(0,0)->(1,0)->(1,1)->(0,1)',
      C: '(1,0)->(1,1)->(0,1)->(0,0)',
      D: '(0,1)->(0,0)->(1,0)->(1,1)',
    };
    for (const [name, pattern] of Object.entries(orientations)) {
      if (order === pattern) { orient = name; break; }
    }
    const ds = cells.map(c => c.d);
    const consecutive = (ds[3] - ds[0] === 3) && (ds[1] - ds[0] === 1) && (ds[2] - ds[1] === 1);
    process.stdout.write(`  ${orient}${consecutive ? '' : '*'}`);
  }
  console.log();
}

// Now check: are ALL blocks visited consecutively?
// If yes, this is a simple Hamiltonian path on the block graph
// with each block having a specific orientation.

console.log('\n=== Block visit order for step 3 (which block is visited at block-index i?) ===');
const blockOrder3 = [];
for (let d = 0; d < 64; d += 4) {
  const bx = Math.floor(step3[d].col / 2);
  const by = Math.floor(step3[d].row / 2);
  blockOrder3.push({bx, by, firstD: d});
}
console.log('Block order:', blockOrder3.map(b => `(${b.bx},${b.by})`).join(' -> '));

console.log('\n=== Block visit order for step 4 ===');
const blockOrder4 = [];
for (let d = 0; d < 256; d += 4) {
  const bx = Math.floor(step4[d].col / 2);
  const by = Math.floor(step4[d].row / 2);
  blockOrder4.push({bx, by, firstD: d});
}
console.log('Block order:', blockOrder4.map(b => `(${b.bx},${b.by})`).join(' -> '));

// KEY QUESTION: Is the block visit order for step 4 the SAME as the
// cell visit order for step 3?
// If so, the curve is self-similar at the block level!
console.log('\n=== Comparing step 3 cell order with step 4 block order ===');
let blockMatch = true;
for (let i = 0; i < 64; i++) {
  if (step3[i].col !== blockOrder4[i].bx || step3[i].row !== blockOrder4[i].by) {
    blockMatch = false;
    console.log(`  MISMATCH at i=${i}: step3=(${step3[i].col},${step3[i].row}) block4=(${blockOrder4[i].bx},${blockOrder4[i].by})`);
    break;
  }
}
if (blockMatch) {
  console.log('  PERFECT MATCH! The block order of step N+1 = cell order of step N');
}

// Similarly check step 2 cell order vs step 3 block order
console.log('\n=== Comparing step 2 cell order with step 3 block order ===');
const blockOrder3b = [];
for (let d = 0; d < 64; d += 4) {
  blockOrder3b.push({bx: Math.floor(step3[d].col / 2), by: Math.floor(step3[d].row / 2)});
}
let blockMatch2 = true;
for (let i = 0; i < 16; i++) {
  if (step2[i].col !== blockOrder3b[i].bx || step2[i].row !== blockOrder3b[i].by) {
    blockMatch2 = false;
    console.log(`  MISMATCH at i=${i}: step2=(${step2[i].col},${step2[i].row}) block3=(${blockOrder3b[i].bx},${blockOrder3b[i].by})`);
    break;
  }
}
if (blockMatch2) {
  console.log('  PERFECT MATCH! The block order of step 3 = cell order of step 2');
}
