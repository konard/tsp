/**
 * Find the algorithm by analyzing the step 2 pattern more carefully.
 * The key insight: the 4x4 grid has 4 sub-blocks of 2x2.
 * Each sub-block has its own local path which is a transformed version of step 1.
 * The order of sub-blocks should match step 1 at the macro level.
 */

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

// Step 1: base pattern
// (1,1) -> (0,1) -> (0,0) -> (1,0)
// In terms of movement: left, up, right
// Start: bottom-right, End: top-right

// Step 2: 4x4 grid, divided into four 2x2 sub-blocks
// Sub-block (0,0) = TL: points with col<2, row<2
// Sub-block (1,0) = TR: points with col>=2, row<2
// Sub-block (0,1) = BL: points with col<2, row>=2
// Sub-block (1,1) = BR: points with col>=2, row>=2

// Map each point to its sub-block and local position
function mapToSubBlocks(path, gridSize) {
  const half = gridSize / 2;
  const blocks = {};
  const blockSequence = [];

  for (let i = 0; i < path.length; i++) {
    const p = path[i];
    const bCol = Math.floor(p.col / half);
    const bRow = Math.floor(p.row / half);
    const key = `${bCol},${bRow}`;
    const local = { col: p.col - bCol * half, row: p.row - bRow * half };

    if (!blocks[key]) blocks[key] = [];
    blocks[key].push({ idx: i, local });

    if (blockSequence.length === 0 || blockSequence[blockSequence.length - 1] !== key) {
      blockSequence.push(key);
    }
  }

  return { blocks, blockSequence };
}

console.log('=== Step 2 sub-block analysis ===');
const { blocks: b2, blockSequence: bs2 } = mapToSubBlocks(step2, 4);
console.log('Block sequence:', bs2.join(' -> '));

for (const [key, pts] of Object.entries(b2)) {
  pts.sort((a, b) => a.idx - b.idx);
  const localPath = pts.map(p => `(${p.local.col},${p.local.row})`).join(' -> ');
  console.log(`  Block ${key}: ${localPath}`);
}

// Step 1 base: (1,1) -> (0,1) -> (0,0) -> (1,0)
// Naming the base: U_base = [(1,1), (0,1), (0,0), (1,0)]

// Block (0,0) TL: (1,1) -> (0,1) -> (0,0) -> (1,0)  -- SAME as base!
// Block (0,1) BL: (1,0) -> (1,1) -> (0,1) -> (0,0)  -- different
// Block (1,1) BR: (0,0) -> (1,0) -> (1,1) -> (0,1)  -- different
// Block (1,0) TR: (0,0) -> (1,0) -> (1,1) -> (0,1)  -- same as BR

// Let's identify the transformations
const base = [[1,1], [0,1], [0,0], [1,0]];

function identifyTransform(localPath, base, n) {
  // Try all 8 transformations (4 rotations x 2 reflections)
  // Also check reversed paths
  const transforms = [
    (c, r) => [c, r],           // identity
    (c, r) => [n-1-r, c],       // 90° CW
    (c, r) => [n-1-c, n-1-r],   // 180°
    (c, r) => [r, n-1-c],       // 270° CW
    (c, r) => [n-1-c, r],       // flip X
    (c, r) => [c, n-1-r],       // flip Y
    (c, r) => [r, c],           // flip diagonal
    (c, r) => [n-1-r, n-1-c],   // flip anti-diagonal
  ];
  const names = ['id', 'cw90', '180', 'ccw90', 'flipX', 'flipY', 'flipDiag', 'flipAntiDiag'];

  for (let t = 0; t < 8; t++) {
    const transformed = base.map(([c, r]) => transforms[t](c, r));
    const fwd = transformed.map(([c, r]) => `(${c},${r})`).join(' -> ');
    const rev = [...transformed].reverse().map(([c, r]) => `(${c},${r})`).join(' -> ');
    const pathStr = localPath.map(p => `(${p.col},${p.row})`).join(' -> ');

    if (fwd === pathStr) return `${names[t]}`;
    if (rev === pathStr) return `rev(${names[t]})`;
  }
  return 'unknown';
}

console.log('\nTransform identification for step 2 blocks:');
for (const [key, pts] of Object.entries(b2)) {
  pts.sort((a, b) => a.idx - b.idx);
  const localPath = pts.map(p => p.local);
  const transform = identifyTransform(localPath, base, 2);
  const entry = localPath[0];
  const exit = localPath[localPath.length - 1];
  console.log(`  Block ${key}: ${transform} | entry: (${entry.col},${entry.row}), exit: (${exit.col},${exit.row})`);
}

// Now check step 3 (8x8) with 4x4 sub-blocks
console.log('\n=== Step 3 sub-block analysis (4x4 sub-blocks) ===');
const { blocks: b3, blockSequence: bs3 } = mapToSubBlocks(step3, 8);
console.log('Block sequence:', bs3.join(' -> '));

// Each sub-block should contain 16 points matching step 2 (or a transform of it)
const base2 = step2.map(p => [p.col, p.row]);

for (const [key, pts] of Object.entries(b3)) {
  pts.sort((a, b) => a.idx - b.idx);
  const localPath = pts.map(p => p.local);
  const transform = identifyTransform(localPath, base2, 4);
  const entry = localPath[0];
  const exit = localPath[localPath.length - 1];
  console.log(`  Block ${key}: ${transform} | entry: (${entry.col},${entry.row}), exit: (${exit.col},${exit.row})`);
}

// And step 4 (16x16) with 8x8 sub-blocks
console.log('\n=== Step 4 sub-block analysis (8x8 sub-blocks) ===');
const { blocks: b4, blockSequence: bs4 } = mapToSubBlocks(step4, 16);
console.log('Block sequence:', bs4.join(' -> '));

const base3 = step3.map(p => [p.col, p.row]);

for (const [key, pts] of Object.entries(b4)) {
  pts.sort((a, b) => a.idx - b.idx);
  const localPath = pts.map(p => p.local);
  const transform = identifyTransform(localPath, base3, 8);
  const entry = localPath[0];
  const exit = localPath[localPath.length - 1];
  console.log(`  Block ${key}: ${transform} | entry: (${entry.col},${entry.row}), exit: (${exit.col},${exit.row})`);
}

// Now let's understand the recursion
// At each level, the curve fills 4 quadrants.
// The quadrant visit order and the transform applied to each quadrant define the recursion.
console.log('\n\n=== RECURSION ANALYSIS ===');
console.log('Step 1 base pattern: (1,1) -> (0,1) -> (0,0) -> (1,0)');
console.log('Directions: left, up, right');
console.log('Start: BR, End: TR');
console.log('The curve goes: BR -> BL -> TL -> TR (spatially)');

// Step 2 block order: 0,0 -> 0,1 -> 1,1 -> 1,0
// In block coords: (0,0)=TL -> (0,1)=BL -> (1,1)=BR -> (1,0)=TR
// This matches: TL -> BL -> BR -> TR
// But step 1 visits: BR -> BL -> TL -> TR
// Hmm, that's different. Let me re-check.

// Wait, block (0,0) has col<2, row<2 => top-left
// Step 1: (1,1) -> (0,1) -> (0,0) -> (1,0)
// Maps to blocks: (1,1)=BR -> (0,1)=BL -> (0,0)=TL -> (1,0)=TR
// Step 2 block order: 0,0 -> 0,1 -> 1,1 -> 0,1 -> 0,0 -> 1,0
// = TL -> BL -> BR -> BL -> TL -> TR
// That has 6 items not 4... the curve moves between blocks multiple times

// Actually in step 2, the sub-blocks are visited in a specific order without
// returning to previously visited blocks for new points. Let me check again.
// Block (0,0) = TL: indices 0, 9, 10, 11  (not contiguous!)
// Block (0,1) = BL: indices 1, 6, 7, 8    (not contiguous!)
// Block (1,1) = BR: indices 2, 3, 4, 5    (contiguous)
// Block (1,0) = TR: indices 12, 13, 14, 15 (contiguous)

// So the path visits: TL(0) -> BL(1) -> BR(2,3,4,5) -> BL(6,7,8) -> TL(9,10,11) -> TR(12,13,14,15)
// It interleaves between blocks! This means the sub-blocks are NOT independently filled.

// This is NOT a standard recursive space-filling curve where each quadrant is filled independently.
// Instead, the path weaves between sub-blocks.

// Let me re-think. Maybe the recursion works at the level of individual cells, not quadrants.
// Perhaps there's a simpler d2xy mapping.

console.log('\n=== Trying to find d2xy mapping directly ===');
// For each step, let's see if there's a simple coordinate-to-index mapping

// Step 1 visit order:
// (1,1)=0, (0,1)=1, (0,0)=2, (1,0)=3
console.log('Step 1 xy2d:');
for (const [i, p] of step1.entries()) {
  console.log(`  d=${i}: (${p.col},${p.row})`);
}

// For step 2, look for the reverse mapping
console.log('\nStep 2 d2xy table:');
const grid2 = Array.from({length: 4}, () => Array(4).fill(-1));
for (const [i, p] of step2.entries()) {
  grid2[p.row][p.col] = i;
}
for (let r = 0; r < 4; r++) {
  console.log(`  row ${r}: ${grid2[r].map(v => String(v).padStart(3)).join('')}`);
}

// Step 3
console.log('\nStep 3 d2xy table:');
const grid3 = Array.from({length: 8}, () => Array(8).fill(-1));
for (const [i, p] of step3.entries()) {
  grid3[p.row][p.col] = i;
}
for (let r = 0; r < 8; r++) {
  console.log(`  row ${r}: ${grid3[r].map(v => String(v).padStart(4)).join('')}`);
}

// Key observation from the visit-order matrices:
// Step 3:
//  10  11  12  13  14  15  16  17
//   9  36  35  34  33  32  31  18
//   8  37  26  27  28  29  30  19
//   7  38  25  24  23  22  21  20
//   6  39  52  53  54  55  56  57
//   5  40  51  50  49  48  47  58
//   4  41  42  43  44  45  46  59
//   3   2   1   0  63  62  61  60
//
// This looks like a SPIRAL pattern!
// Starting from position 0 at (3,7), it spirals outward...

// Actually, looking more carefully:
// Row 7: 3, 2, 1, 0, 63, 62, 61, 60  -- goes left from 3 to 0, then right part goes 63->60 (decreasing right to left)
// Row 0: 10, 11, 12, 13, 14, 15, 16, 17 -- left to right
// This is more like a boustrophedon (zigzag) pattern with concentric rectangles

// Let me check if this is a "spiral" space-filling curve
// Looking at the overall structure:
// 0 is at (3,7), then 1,2,3 go left along bottom
// Then 4,5,6,7,8,9 go up the left side
// Then 10-17 go right along top
// Then 18-20 go down the right side
// Then 21-22 go... wait let me trace more carefully

console.log('\n=== Tracing step 3 as a spiral ===');
for (let d = 0; d < 64; d++) {
  const p = step3[d];
  const prev = d > 0 ? step3[d-1] : null;
  const dir = prev ? `${p.col > prev.col ? 'R' : p.col < prev.col ? 'L' : ''}${p.row > prev.row ? 'D' : p.row < prev.row ? 'U' : ''}` : 'START';
  if (d < 20 || d > 58) {
    console.log(`  d=${String(d).padStart(2)}: (${p.col},${p.row}) ${dir}`);
  }
}

// Let me check: is this a boustrophedon pattern on concentric rectangles?
// Ring 0 (outermost): the perimeter of 8x8
// Ring 1: the perimeter of 6x6 centered
// Ring 2: the perimeter of 4x4 centered
// Ring 3 (innermost): the perimeter of 2x2 centered

// For 8x8:
// Ring 0 perimeter: 4*7 = 28 cells
// Ring 1 perimeter: 4*5 = 20 cells
// Ring 2 perimeter: 4*3 = 12 cells
// Ring 3 perimeter: 4*1 = 4 cells
// Total: 28 + 20 + 12 + 4 = 64 ✓

// Let me check which ring each point belongs to
console.log('\n=== Ring analysis for step 3 ===');
function getRing(col, row, gridSize) {
  return Math.min(col, row, gridSize - 1 - col, gridSize - 1 - row);
}

const ringGroups3 = {};
for (let d = 0; d < 64; d++) {
  const p = step3[d];
  const ring = getRing(p.col, p.row, 8);
  if (!ringGroups3[ring]) ringGroups3[ring] = [];
  ringGroups3[ring].push(d);
}

for (const [ring, indices] of Object.entries(ringGroups3)) {
  console.log(`  Ring ${ring}: d values ${indices.join(',')} (${indices.length} points)`);
  console.log(`    d range: ${Math.min(...indices)} to ${Math.max(...indices)}`);
}

// Check if the pattern is: inner ring first, then outer
// d=0 is at (3,7) which is ring 0 (on outer perimeter)
// Hmm, that's not inner-first

// Let me check step 4 rings too
console.log('\n=== Ring analysis for step 4 ===');
const ringGroups4 = {};
for (let d = 0; d < 256; d++) {
  const p = step4[d];
  const ring = getRing(p.col, p.row, 16);
  if (!ringGroups4[ring]) ringGroups4[ring] = [];
  ringGroups4[ring].push(d);
}

for (const [ring, indices] of Object.entries(ringGroups4)) {
  console.log(`  Ring ${ring}: d range: ${Math.min(...indices)} to ${Math.max(...indices)} (${indices.length} points)`);
}
