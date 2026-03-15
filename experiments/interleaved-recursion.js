// The key insight: in this curve, the 4 sub-blocks are NOT filled independently.
// Instead, they interleave: the curve visits 1 cell from block A, 1 from block B,
// then fills the rest of C completely, then backtracks to fill rest of B, rest of A,
// then fills D completely.
//
// This interleaving pattern is the defining feature.
// Let me analyze it by looking at which block each d value belongs to.

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

// For step 2 (4x4), map each d to its 2x2 block:
function getBlockId(col, row, half) {
  return `${Math.floor(col / half)},${Math.floor(row / half)}`;
}

console.log('=== Step 2: d -> block ===');
const blockSeq2 = step2.map(p => getBlockId(p.col, p.row, 2));
console.log(blockSeq2.join(' '));

// Step 2 blocks: 0,0  0,1  1,1  1,1  1,1  1,1  0,1  0,1  0,1  0,0  0,0  0,0  1,0  1,0  1,0  1,0
// Pattern: [0,0] [0,1] [1,1 x4] [0,1 x3] [0,0 x3] [1,0 x4]
// First visit: 0,0(1) 0,1(1) then 1,1(4) 0,1(3) 0,0(3) 1,0(4)
// Total: 1+1+4+3+3+4 = 16

console.log('\n=== Step 3: d -> 2x2 block ===');
const blockSeq3 = step3.map(p => getBlockId(p.col, p.row, 2));
// Group into runs:
let runs = [];
let currentBlock = null;
let currentCount = 0;
for (let d = 0; d < blockSeq3.length; d++) {
  if (blockSeq3[d] !== currentBlock) {
    if (currentBlock !== null) runs.push({ block: currentBlock, count: currentCount });
    currentBlock = blockSeq3[d];
    currentCount = 1;
  } else {
    currentCount++;
  }
}
runs.push({ block: currentBlock, count: currentCount });
console.log(runs.map(r => `${r.block}(${r.count})`).join(' '));

// Now let me look at 4x4 blocks in step 3:
console.log('\n=== Step 3: d -> 4x4 block ===');
const blockSeq3_4 = step3.map(p => getBlockId(p.col, p.row, 4));
runs = [];
currentBlock = null;
currentCount = 0;
for (let d = 0; d < blockSeq3_4.length; d++) {
  if (blockSeq3_4[d] !== currentBlock) {
    if (currentBlock !== null) runs.push({ block: currentBlock, count: currentCount });
    currentBlock = blockSeq3_4[d];
    currentCount = 1;
  } else {
    currentCount++;
  }
}
runs.push({ block: currentBlock, count: currentCount });
console.log(runs.map(r => `${r.block}(${r.count})`).join(' '));

// For step 3 with 4x4 blocks:
// Similar interleaving should be visible.

// CRITICAL INSIGHT: The interleaving pattern at each level is:
// block_0(1), block_1(1), block_2(N-2), block_1(N-3), block_0(N-3), block_3(N)
// where N = number of cells per block

// For step 2 with blocks of 4: 0(1) 1(1) 2(4) 1(3) 0(3) 3(4)
// For step 3 with 4x4 blocks of 16: let me check...

// Actually, let me think about this differently.
// The interleaving has a specific structure:
// The curve first visits 1 cell from each of blocks 0 and 1 (entering),
// then completes block 2, then completes blocks 1 and 0 in reverse,
// then completes block 3.

// This is like: enter(0), enter(1), fill(2), leave(1), leave(0), fill(3)
// Where enter(i) visits the FIRST cell and leave(i) visits the remaining cells.

// For a single level of recursion with blocks of size N:
// d=0: block 0 cell 0
// d=1: block 1 cell 0
// d=2 to d=N+1: block 2 cells 0 to N-1
// d=N+2 to d=2N-1: block 1 cells 1 to N-2 (wait, need to check counts)

// Let me verify with step 2:
// N=4 (block size), pattern: 0(1) 1(1) 2(4) 1(3) 0(3) 3(4)
// d=0: block 0 (1 cell)
// d=1: block 1 (1 cell)
// d=2-5: block 2 (4 cells)
// d=6-8: block 1 (3 cells)
// d=9-11: block 0 (3 cells)
// d=12-15: block 3 (4 cells)

// So the pattern is: 0(1), 1(1), 2(all), 1(rest), 0(rest), 3(all)
// Total: 1 + 1 + 4 + 3 + 3 + 4 = 16 OK

// Now if this is recursive, at the next level each "block" of 4 cells would follow
// the same interleaving pattern internally.

// For step 3 (8x8), viewing as 4x4 blocks of size 4:
// The top-level interleaving should still be: 0(1*4), 1(1*4), 2(all 16), 1(rest 12), 0(rest 12), 3(all 16)
// But with INTERNAL interleaving within each 4-cell-block visit.

// Actually no - let me check step 3 with 4x4 blocks:
// The runs are listed above. Let me look at them.

// At the HIGHEST level (splitting 8x8 into four 4x4 quadrants):
// How many of the 64 d-values belong to each quadrant?
const quadCounts3 = {};
for (const b of blockSeq3_4) {
  quadCounts3[b] = (quadCounts3[b] || 0) + 1;
}
console.log('\nQuadrant counts in step 3:', quadCounts3);

// Each quadrant has 16 cells. At the top level, the pattern should be:
// quad_0(first few), quad_1(first few), quad_2(all 16), quad_1(rest), quad_0(rest), quad_3(all 16)

// Wait, but what ARE the quadrants? In step 2, the blocks were visited in order:
// 0,0 -> 0,1 -> 1,1 -> 0,1 -> 0,0 -> 1,0
// The base pattern (A orientation) visits: (1,1) -> (0,1) -> (0,0) -> (1,0)
// So block 0 = (1,1)=BR, block 1 = (0,1)=BL, block 2 = (0,0)=TL, block 3 = (1,0)=TR

// For step 3, the 4x4 quadrants in A orientation visit order:
// block 0 = (1,1) = cols 4-7, rows 4-7
// block 1 = (0,1) = cols 0-3, rows 4-7
// block 2 = (0,0) = cols 0-3, rows 0-3
// block 3 = (1,0) = cols 4-7, rows 0-3

// Let me check which quadrant each d belongs to at the TOP level:
console.log('\nStep 3 top-level quadrant sequence:');
const topQuadSeq = step3.map(p => {
  const qx = p.col >= 4 ? 1 : 0;
  const qy = p.row >= 4 ? 1 : 0;
  // A orientation: (1,1)=0, (0,1)=1, (0,0)=2, (1,0)=3
  if (qx === 1 && qy === 1) return 0; // BR
  if (qx === 0 && qy === 1) return 1; // BL
  if (qx === 0 && qy === 0) return 2; // TL
  return 3; // TR
});

runs = [];
currentBlock = null;
currentCount = 0;
for (const q of topQuadSeq) {
  if (q !== currentBlock) {
    if (currentBlock !== null) runs.push({ block: currentBlock, count: currentCount });
    currentBlock = q;
    currentCount = 1;
  } else {
    currentCount++;
  }
}
runs.push({ block: currentBlock, count: currentCount });
console.log(runs.map(r => `q${r.block}(${r.count})`).join(' '));

// For step 2 the pattern was: q0(1) q1(1) q2(4) q1(3) q0(3) q3(4)
// If recursive, step 3 should be: q0(?) q1(?) q2(16) q1(?) q0(?) q3(16)

// ACTUALLY, looking at step 3's top-level:
// Starting at (3,7) which is in BL quadrant (cols 0-3, rows 4-7) = q1
// Hmm that changes things. Let me re-examine.

// Wait, I mapped the quadrants wrong. Let me use the actual block IDs:
console.log('\nStep 3 4x4 block IDs:');
const blockRuns3 = [];
let prevBlock3 = null;
let cnt = 0;
for (let d = 0; d < 64; d++) {
  const p = step3[d];
  const bx = Math.floor(p.col / 4);
  const by = Math.floor(p.row / 4);
  const bid = `${bx},${by}`;
  if (bid !== prevBlock3) {
    if (prevBlock3 !== null) blockRuns3.push({ block: prevBlock3, count: cnt });
    prevBlock3 = bid;
    cnt = 1;
  } else {
    cnt++;
  }
}
blockRuns3.push({ block: prevBlock3, count: cnt });
console.log(blockRuns3.map(r => `${r.block}(${r.count})`).join(' '));

// Now, step 1 visit order: (1,1) -> (0,1) -> (0,0) -> (1,0)
// In step 2 interleaving: block (0,0)=TL first, then...
// Wait, I need to be more careful about which block is which.
// In step 2, block visit order was: (0,0), (0,1), (1,1), (0,1), (0,0), (1,0)
// The step 1 path visits cells: (1,1), (0,1), (0,0), (1,0)
// So cell 0=(1,1), cell 1=(0,1), cell 2=(0,0), cell 3=(1,0)
// Block (0,0) = cell 2 = 3rd in step 1 visit order
// Block (0,1) = cell 1 = 2nd in step 1 visit order
// Block (1,1) = cell 0 = 1st in step 1 visit order
// Block (1,0) = cell 3 = 4th in step 1 visit order

// So step 2 block sequence: cell2(1), cell1(1), cell0(4), cell1(3), cell2(3), cell3(4)
// That's: [2][1][0000][111][222][3333]
// Interleaving: first cell2(1), cell1(1), then cell0 fills completely(4),
// then cell1 finishes(3), cell2 finishes(3), then cell3 fills(4).

// The pattern in terms of step-1 visit indices (0,1,2,3):
// 2(1) 1(1) 0(4) 1(3) 2(3) 3(4)

// Now for step 3 with 4x4 blocks, the visit indices should follow the same pattern
// but with the step 2 visit order determining the block assignment.

// Step 2 visits: (1,1),(1,2),(2,2),(3,2),(3,3),(2,3),(1,3),(0,3),(0,2),(0,1),(0,0),(1,0),(2,0),(3,0),(3,1),(2,1)
// 4x4 blocks in step 3: (bx,by) where bx=floor(x/4), by=floor(y/4) for the step-2 cell positions
// Wait, step 2 is 4x4, step 3 is 8x8. Each step-2 cell maps to a 2x2 block in step 3.
// But for the top-level recursion of step 3, we look at 4x4 quadrants.

// Hmm, let me simplify. The curve at order n fills a 2^n x 2^n grid.
// The first level of recursion splits it into 4 quadrants of size 2^(n-1) x 2^(n-1).
// The interleaving pattern at the top level is: q2(1*N), q1(1*N), q0(N*N), q1((N-1)*N), q2((N-1)*N), q3(N*N)
// where N is the size of one quadrant, and the numbers represent how many points are visited.

// Hmm but that gives 1+1+N+N-1+N-1+N = 4N which is correct only if N counts are off.
// For step 2: N=4, pattern 1+1+4+3+3+4 = 16 = 4*4 OK
// In terms of quadrant sizes: each quadrant has 4 points.
// Visit: q2(1), q1(1), q0(4), q1(3), q2(3), q3(4)

// For step 3: each quadrant has 16 points.
// Expected: q2(?), q1(?), q0(16), q1(?), q2(?), q3(16)
// But the ? values would come from recursive application of the same pattern within each quadrant.

// Actually, the pattern is:
// At the top level, the curve visits the quadrants in order (2,1,0,1,2,3)
// where quadrant indices follow the parent cell visit order reversed-ish.
// More precisely:
// The A orientation visits: (1,1)=idx0, (0,1)=idx1, (0,0)=idx2, (1,0)=idx3
// The interleaving: idx2(1), idx1(1), idx0(N), idx1(N-1), idx2(N-1), idx3(N)

// This means: start at idx2's first cell, then idx1's first cell,
// then complete idx0 (all N), then complete idx1 (N-1 remaining),
// then complete idx2 (N-1 remaining), then complete idx3 (all N).

// Within each sub-quadrant, the same interleaving applies recursively!
// So the total interleaving creates the observed spiral pattern.

console.log('\n\n=== VERIFYING INTERLEAVING HYPOTHESIS ===');

// Generate the path for a given order using interleaved recursion
function generateInterleaved(order) {
  if (order === 1) {
    // Base: A orientation: (1,1) -> (0,1) -> (0,0) -> (1,0)
    return [{col:1,row:1}, {col:0,row:1}, {col:0,row:0}, {col:1,row:0}];
  }

  const half = Math.pow(2, order - 1);
  // Get sub-paths for each quadrant
  const sub = generateInterleaved(order - 1);
  const N = sub.length; // points per quadrant

  // A orientation quadrants:
  // idx0 = (1,1): offset (half, half)
  // idx1 = (0,1): offset (0, half)
  // idx2 = (0,0): offset (0, 0)
  // idx3 = (1,0): offset (half, 0)
  const offsets = [
    {dx: half, dy: half},   // idx0
    {dx: 0, dy: half},      // idx1
    {dx: 0, dy: 0},         // idx2
    {dx: half, dy: 0},      // idx3
  ];

  // Generate sub-paths for each quadrant with appropriate transforms
  // For now, use the same orientation for all (we'll fix this later)
  const subPaths = offsets.map(off =>
    sub.map(p => ({col: p.col + off.dx, row: p.row + off.dy}))
  );

  // Interleaving: idx2(1), idx1(1), idx0(N), idx1(N-1), idx2(N-1), idx3(N)
  const result = [];
  result.push(subPaths[2][0]); // first cell of idx2
  result.push(subPaths[1][0]); // first cell of idx1
  for (let i = 0; i < N; i++) result.push(subPaths[0][i]); // all of idx0
  for (let i = 1; i < N; i++) result.push(subPaths[1][i]); // rest of idx1
  for (let i = 1; i < N; i++) result.push(subPaths[2][i]); // rest of idx2
  for (let i = 0; i < N; i++) result.push(subPaths[3][i]); // all of idx3

  return result;
}

const gen2 = generateInterleaved(2);
console.log('Generated order 2:', gen2.map(p => `(${p.col},${p.row})`).join(' -> '));
console.log('Target step 2:    ', step2.map(p => `(${p.col},${p.row})`).join(' -> '));
console.log('Match:', JSON.stringify(gen2) === JSON.stringify(step2));

const gen3 = generateInterleaved(3);
console.log('\nGenerated order 3:', gen3.map(p => `(${p.col},${p.row})`).join(' -> '));
console.log('Target step 3:    ', step3.map(p => `(${p.col},${p.row})`).join(' -> '));
console.log('Match:', JSON.stringify(gen3) === JSON.stringify(step3));
