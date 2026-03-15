// Construct the U-fork curve by directly generating the spiral path.
// 
// The pattern from the step 3/4 analysis:
// - The path starts near center-top, spirals OUTWARD to the outer ring
// - Traverses the outer ring  
// - Spirals INWARD back toward center
// - Then has a self-similar inner structure
//
// Actually, looking at step 4 more carefully:
// Ring 7.5 (outer): d=86-145 (60 cells) - one contiguous block
// Ring 6.5: d=60-85 and d=146-171 - two blocks, symmetric around d=115.5
// Ring 5.5: d=38-59 and d=172-193
// Ring 4.5: d=20-37 and d=194-211
// Ring 3.5: d=6-19 and d=212-225
// Ring 2.5: d=5,226, and d=235-252 - 3 groups!
// Ring 1.5: d=0-1,4, and d=227,230-234,253-255 - fragmented
// Ring 0.5: d=2-3 and d=228-229
//
// So the outer rings (3.5 to 7.5) each split into exactly 2 contiguous groups.
// The inner rings (0.5 to 2.5) are fragmented - this is where the recursive
// sub-structure lives.
//
// For step 3:
// Ring 3.5 (outer): d=0-20 and d=57-63 - entering and exiting
// Ring 2.5: d=21,30-47,56 - some fragmentation
// Ring 1.5: d=22,25-29,48-52,55
// Ring 0.5: d=23-24,53-54
//
// WAIT - the inner rings of step 3 look exactly like what step 2 would produce
// if placed at the center! Let me check.
//
// Step 2 has 16 cells arranged in a 4x4 grid.
// Step 3's inner 4 rings (0.5 to 3.5) correspond to the center 8x8 portion...
// no, the rings are defined by Chebyshev distance from center.
// The innermost 4x4 area of step 3 is rows 2-5, cols 2-5.
//
// Let me check: what are the d-values in the center 4x4 of step 3?

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

const step2 = toGrid(parseSvgPath(readFileSync('target-svgs/tsp-tour-3.svg', 'utf8')));
const step3 = toGrid(parseSvgPath(readFileSync('target-svgs/tsp-tour-2.svg', 'utf8')));
const step4 = toGrid(parseSvgPath(readFileSync('target-svgs/tsp-tour-5.svg', 'utf8')));

function buildGrid(path, n) {
  const grid = Array.from({length: n}, () => Array(n).fill(-1));
  for (let d = 0; d < path.length; d++) {
    grid[path[d].row][path[d].col] = d;
  }
  return grid;
}

// Step 3 center 4x4 (rows 2-5, cols 2-5):
const grid3 = buildGrid(step3, 8);
console.log('Step 3 center 4x4 (rows 2-5, cols 2-5):');
for (let row = 5; row >= 2; row--) {
  console.log('  ' + [2,3,4,5].map(col => String(grid3[row][col]).padStart(3)).join(''));
}

// Extract the d-values in the center 4x4 and sort them to see the path
const centerCells3 = [];
for (let row = 2; row <= 5; row++) {
  for (let col = 2; col <= 5; col++) {
    centerCells3.push({col, row, d: grid3[row][col]});
  }
}
centerCells3.sort((a,b) => a.d - b.d);
console.log('\nCenter path (in d order):');
centerCells3.forEach(c => console.log(`  d=${c.d}: (${c.col},${c.row})`));

// Now normalize: subtract the base d and offset the coordinates
const minD = Math.min(...centerCells3.map(c => c.d));
const sortedCenter = centerCells3.map(c => ({
  col: c.col - 2,
  row: c.row - 2,
  d: c.d - minD
}));
console.log('\nNormalized center path:');
sortedCenter.forEach(c => console.log(`  d=${c.d}: (${c.col},${c.row})`));

// Compare with step 2:
console.log('\nStep 2 path:');
step2.forEach((p, d) => console.log(`  d=${d}: (${p.col},${p.row})`));

// Are they the same?
const centerPath = sortedCenter.map(c => `${c.col},${c.row}`).join(' ');
const step2Path = step2.map(p => `${p.col},${p.row}`).join(' ');
console.log('\nCenter matches step 2:', centerPath === step2Path);

// OK so the center 4x4 might NOT match step 2 directly because the ring
// analysis showed fragmentation. But maybe it matches with a rotation/reflection?

// Let me check if the center visits in the same ORDER as step 2:
// Center path d-order gives positions. Step 2 also gives positions.
// Let me check if there's a transform.
console.log('\nCenter visit order:');
const centerOrder = sortedCenter.map(c => `(${c.col},${c.row})`).join(' -> ');
console.log(centerOrder);
console.log('Step 2 visit order:');
const step2Order = step2.map(p => `(${p.col},${p.row})`).join(' -> ');
console.log(step2Order);

// Check all 8 transforms (4 rotations x 2 reflections)
function transform(path, n, t) {
  return path.map(p => {
    let {col, row} = p;
    switch(t) {
      case 0: return {col, row}; // identity
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
  const transformed = transform(step2, 4, t);
  const tPath = transformed.map(p => `(${p.col},${p.row})`).join(' -> ');
  const match = tPath === centerOrder;
  if (match) console.log(`\nMATCH with transform ${tNames[t]}!`);
}

// Hmm, let me also check if the center path, when RENUMBERED (rank-ordered),
// matches step 2 under some transform.
// Actually the problem might be that the center cells are NOT visited 
// consecutively. Let me check.
const centerDs = centerCells3.map(c => c.d).sort((a,b) => a-b);
console.log('\nCenter d-values:', centerDs);
// Check if consecutive
let isConsec = true;
for (let i = 1; i < centerDs.length; i++) {
  if (centerDs[i] !== centerDs[i-1] + 1) {
    isConsec = false;
    break;
  }
}
console.log('Consecutive:', isConsec);

// They're NOT consecutive - the spiral interleaves between center and rings.
// So I need to look at the RELATIVE order within the center cells.
// Map each center cell to its rank among center cells.
const centerRanks = {};
centerCells3.sort((a,b) => a.d - b.d);
centerCells3.forEach((c, rank) => {
  centerRanks[`${c.col-2},${c.row-2}`] = rank;
});
console.log('\nCenter cell ranks:');
for (let row = 3; row >= 0; row--) {
  console.log('  ' + [0,1,2,3].map(col => String(centerRanks[`${col},${row}`] || 0).padStart(3)).join(''));
}

// Step 2 grid:
console.log('\nStep 2 grid:');
const grid2 = buildGrid(step2, 4);
for (let row = 3; row >= 0; row--) {
  console.log('  ' + [0,1,2,3].map(col => String(grid2[row][col]).padStart(3)).join(''));
}

// Do they match under any transform?
for (let t = 0; t < 8; t++) {
  const transformed = transform(step2, 4, t);
  const tGrid = Array.from({length: 4}, () => Array(4).fill(-1));
  transformed.forEach((p, d) => { tGrid[p.row][p.col] = d; });
  
  let match = true;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (tGrid[row][col] !== (centerRanks[`${col},${row}`] ?? -2)) {
        match = false;
        break;
      }
    }
    if (!match) break;
  }
  if (match) {
    console.log(`\nCenter RANK order matches step 2 with transform ${tNames[t]}!`);
  }
}

// Also check step 4's center 8x8 vs step 3:
console.log('\n=== Step 4 center 8x8 (rows 4-11, cols 4-11) ===');
const grid4 = buildGrid(step4, 16);
for (let row = 11; row >= 4; row--) {
  console.log('  ' + Array.from({length: 8}, (_, col) => String(grid4[row][col+4]).padStart(4)).join(''));
}

const centerCells4 = [];
for (let row = 4; row <= 11; row++) {
  for (let col = 4; col <= 11; col++) {
    centerCells4.push({col, row, d: grid4[row][col]});
  }
}
centerCells4.sort((a,b) => a.d - b.d);
const centerRanks4 = {};
centerCells4.forEach((c, rank) => {
  centerRanks4[`${c.col-4},${c.row-4}`] = rank;
});

console.log('\nStep 4 center 8x8 rank grid:');
for (let row = 7; row >= 0; row--) {
  console.log('  ' + Array.from({length: 8}, (_, col) => String(centerRanks4[`${col},${row}`]).padStart(3)).join(''));
}

console.log('\nStep 3 grid:');
for (let row = 7; row >= 0; row--) {
  console.log('  ' + Array.from({length: 8}, (_, col) => String(grid3[row][col]).padStart(3)).join(''));
}

// Check if they match under any transform
for (let t = 0; t < 8; t++) {
  const transformed = transform(step3, 8, t);
  const tGrid = Array.from({length: 8}, () => Array(8).fill(-1));
  transformed.forEach((p, d) => { tGrid[p.row][p.col] = d; });
  
  let match = true;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (tGrid[row][col] !== (centerRanks4[`${col},${row}`] ?? -2)) {
        match = false;
        break;
      }
    }
    if (!match) break;
  }
  if (match) {
    console.log(`Step 4 center RANK order matches step 3 with transform ${tNames[t]}!`);
  }
}
