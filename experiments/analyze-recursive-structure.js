/**
 * Analyze the recursive structure of the target U-fork pattern.
 * Look at how sub-quadrants are traversed.
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

// Parse all steps
const step1 = toGrid(parseSvgPath(readFileSync('target-svgs/tsp-tour-4.svg', 'utf8')));
const step2 = toGrid(parseSvgPath(readFileSync('target-svgs/tsp-tour-3.svg', 'utf8')));
const step3 = toGrid(parseSvgPath(readFileSync('target-svgs/tsp-tour-2.svg', 'utf8')));
const step4 = toGrid(parseSvgPath(readFileSync('target-svgs/tsp-tour-5.svg', 'utf8')));

// Step 1 (2x2): (1,1) -> (0,1) -> (0,0) -> (1,0)
// This is a U-shape: start bottom-right, go left, up, right
// Let's call this the "base pattern"
console.log('=== Step 1 (2x2) ===');
console.log('Path:', step1.map(p => `(${p.col},${p.row})`).join(' -> '));
// Directions: left, up, right  (L, U, R)
// Opens downward - like ∪

// Step 2 (4x4): analyze which quadrant each point belongs to
console.log('\n=== Step 2 (4x4) - Quadrant analysis ===');
function analyzeQuadrants(pts, gridSize) {
  const half = gridSize / 2;
  const quadrants = { TL: [], TR: [], BL: [], BR: [] };

  pts.forEach((p, i) => {
    const qCol = p.col < half ? 'L' : 'R';
    const qRow = p.row < half ? 'T' : 'B';
    quadrants[qRow + qCol].push({ idx: i, col: p.col, row: p.row,
      localCol: p.col % half, localRow: p.row % half });
  });

  console.log('Visit order by quadrant:');
  for (const [name, qpts] of Object.entries(quadrants)) {
    console.log(`  ${name}: indices ${qpts.map(p => p.idx).join(',')} | local coords: ${qpts.map(p => `(${p.localCol},${p.localRow})`).join(' -> ')}`);
  }

  // What's the order of quadrants visited?
  const quadOrder = [];
  let lastQuad = null;
  pts.forEach((p, i) => {
    const qCol = p.col < half ? 'L' : 'R';
    const qRow = p.row < half ? 'T' : 'B';
    const quad = qRow + qCol;
    if (quad !== lastQuad) {
      quadOrder.push({ quad, startIdx: i });
      lastQuad = quad;
    }
  });
  console.log('Quadrant visit order:', quadOrder.map(q => q.quad).join(' -> '));

  return quadrants;
}

analyzeQuadrants(step2, 4);

console.log('\n=== Step 3 (8x8) - Quadrant analysis ===');
analyzeQuadrants(step3, 8);

console.log('\n=== Step 4 (16x16) - Quadrant analysis ===');
analyzeQuadrants(step4, 16);

// Now let's look at step 2 more carefully
// The base pattern (step 1) is: (1,1) -> (0,1) -> (0,0) -> (1,0)
// In step 2, quadrant order should follow a similar pattern but at the quadrant level
// Step 2 starts at (1,1) which is in BL quadrant... wait, let me check
// With 4x4 grid, half=2
// (1,1) -> col 1 < 2 so L, row 1 < 2 so T => TL quadrant
// Hmm, but the step-1 pattern has start at (1,1) which is bottom-right of 2x2

// Let me think about this differently - what if coordinates start from bottom?
// In SVGs, y increases downward. Let me check the actual SVG coordinates
console.log('\n=== Checking SVG coordinate interpretation ===');
const raw1 = parseSvgPath(readFileSync('target-svgs/tsp-tour-4.svg', 'utf8'));
console.log('Step 1 raw SVG coords:', raw1.map(p => `(${p.x},${p.y})`).join(' -> '));
// (380,380) -> (20,380) -> (20,20) -> (380,20)
// In SVG: x=380 is right, x=20 is left; y=380 is bottom, y=20 is top
// So: bottom-right -> bottom-left -> top-left -> top-right
// Grid with y=0 at top: (1,1) -> (0,1) -> (0,0) -> (1,0)
// This is correct. The U opens to the right (not down).

// Let me re-examine with proper spatial understanding:
// Step 1 path in spatial terms (origin top-left):
// BR -> BL -> TL -> TR
// Movement: left, up, right -> ∪ rotated 90° clockwise, opening right

// For step 2, trace which 2x2 sub-quadrant is visited:
console.log('\n=== Step 2 detailed sub-quadrant trace ===');
const s2 = step2;
for (let i = 0; i < s2.length; i++) {
  const p = s2[i];
  const subQ = (p.col >= 2 ? 'R' : 'L') + (p.row >= 2 ? 'B' : 'T');
  const localCol = p.col % 2;
  const localRow = p.row % 2;
  console.log(`  ${i}: (${p.col},${p.row}) -> sub-quadrant ${subQ}, local (${localCol},${localRow})`);
}

// Now for step 3, trace 4x4 sub-quadrant order
console.log('\n=== Step 3 - 4x4 sub-quadrant trace ===');
const s3 = step3;
let lastQ3 = null;
const q3Order = [];
for (let i = 0; i < s3.length; i++) {
  const p = s3[i];
  const subQ = (p.col >= 4 ? 'R' : 'L') + (p.row >= 4 ? 'B' : 'T');
  if (subQ !== lastQ3) {
    q3Order.push({ quad: subQ, idx: i, point: `(${p.col},${p.row})` });
    lastQ3 = subQ;
  }
}
console.log('Quadrant transitions:', q3Order.map(q => `${q.quad}@${q.idx}`).join(' -> '));

// Let me look at step 3 sub-quadrants with local coordinates
console.log('\n=== Step 3 per-quadrant local paths ===');
for (const qName of ['LT', 'RT', 'LB', 'RB']) {
  const inQ = [];
  for (let i = 0; i < s3.length; i++) {
    const p = s3[i];
    const subQ = (p.col >= 4 ? 'R' : 'L') + (p.row >= 4 ? 'B' : 'T');
    if (subQ === qName) {
      inQ.push({ idx: i, localCol: p.col % 4, localRow: p.row % 4 });
    }
  }
  if (inQ.length > 0) {
    // Sort by visit order
    inQ.sort((a, b) => a.idx - b.idx);
    console.log(`  ${qName}: ${inQ.map(p => `(${p.localCol},${p.localRow})`).join(' -> ')}`);

    // Compare with step 2 path
    const s2Path = step2.map(p => `(${p.col},${p.row})`).join(' -> ');
    const qPath = inQ.map(p => `(${p.localCol},${p.localRow})`).join(' -> ');

    // Check if it's a rotation/reflection of step 2
    // Original step 2: (1,1) -> (1,2) -> (2,2) -> (3,2) -> (3,3) -> (2,3) -> (1,3) -> (0,3) -> (0,2) -> (0,1) -> (0,0) -> (1,0) -> (2,0) -> (3,0) -> (3,1) -> (2,1)
  }
}

// Let me try a completely different approach - maybe this is NOT a standard Hilbert curve
// but a custom recursive space-filling curve

// The key observation from step 1: (1,1) -> (0,1) -> (0,0) -> (1,0)
// This traces: BR -> BL -> TL -> TR
// It's an open path (not closed)
// The start is at bottom-right, end at top-right
// Net movement: from bottom to top on the right side

// For step 2, the curve visits 16 points starting from (1,1) ending at (2,1)
// In terms of 2x2 sub-blocks:
// Starts in LT block, ends in RT block
// Let's map each 2x2 block and see the intra-block pattern

console.log('\n=== Step 2 - 2x2 block analysis ===');
const blocks2 = {};
for (let i = 0; i < s2.length; i++) {
  const p = s2[i];
  const bCol = Math.floor(p.col / 2);
  const bRow = Math.floor(p.row / 2);
  const key = `${bCol},${bRow}`;
  if (!blocks2[key]) blocks2[key] = [];
  blocks2[key].push({ idx: i, localCol: p.col % 2, localRow: p.row % 2 });
}

for (const [key, pts] of Object.entries(blocks2)) {
  pts.sort((a, b) => a.idx - b.idx);
  console.log(`  Block (${key}): indices ${pts.map(p => p.idx).join(',')} | local: ${pts.map(p => `(${p.localCol},${p.localRow})`).join(' -> ')}`);
}

// Now map the block visit order
console.log('\nBlock visit order for step 2:');
let lastBlock2 = null;
const blockOrder2 = [];
for (let i = 0; i < s2.length; i++) {
  const p = s2[i];
  const bKey = `${Math.floor(p.col / 2)},${Math.floor(p.row / 2)}`;
  if (bKey !== lastBlock2) {
    blockOrder2.push(bKey);
    lastBlock2 = bKey;
  }
}
console.log(blockOrder2.join(' -> '));

// Block order: these should match step-1 pattern somehow
// Step 1: (1,1) -> (0,1) -> (0,0) -> (1,0)
// Block order for step 2: (0,0) -> (1,1) -> (1,1) -> ... let me see

console.log('\n=== Step 3 - 2x2 block analysis ===');
let lastBlock3 = null;
const blockOrder3 = [];
for (let i = 0; i < s3.length; i++) {
  const p = s3[i];
  const bKey = `${Math.floor(p.col / 2)},${Math.floor(p.row / 2)}`;
  if (bKey !== lastBlock3) {
    blockOrder3.push(bKey);
    lastBlock3 = bKey;
  }
}
console.log('Block visit order:', blockOrder3.join(' -> '));
// These should trace out the step-2 pattern

// Compare with step 2 path
console.log('\nStep 2 path:', step2.map(p => `(${p.col},${p.row})`).join(' -> '));
console.log('\nDo block coords of step 3 match step 2?');
const match = blockOrder3.length === step2.length &&
  blockOrder3.every((bk, i) => {
    const [bc, br] = bk.split(',').map(Number);
    return bc === step2[i].col && br === step2[i].row;
  });
console.log('Match:', match);

// Check step 4 block order vs step 3
console.log('\n=== Step 4 - 2x2 block analysis ===');
let lastBlock4 = null;
const blockOrder4 = [];
for (let i = 0; i < step4.length; i++) {
  const p = step4[i];
  const bKey = `${Math.floor(p.col / 2)},${Math.floor(p.row / 2)}`;
  if (bKey !== lastBlock4) {
    blockOrder4.push(bKey);
    lastBlock4 = bKey;
  }
}
console.log('Block visit order length:', blockOrder4.length);
console.log('Step 3 path length:', step3.length);
const match34 = blockOrder4.length === step3.length &&
  blockOrder4.every((bk, i) => {
    const [bc, br] = bk.split(',').map(Number);
    return bc === step3[i].col && br === step3[i].row;
  });
console.log('Step 4 blocks match step 3 path:', match34);
