// Focus on understanding the frame construction for step 4.
// We know: step 4 = center(step3 shifted by 51) + frame(192 cells)
// The frame cells are d=20 to d=211 in step 4.
// These are all cells NOT in the center 8x8 region.
// 
// The frame of step 4 (n=16) spans: rows 0-3 and 12-15, plus cols 0-3 and 12-15.
// Total: 16^2 - 8^2 = 192 cells.
//
// The frame has width 4 on each side (n/4 = 4).
// 
// The key question: is the frame path itself a specific known pattern?
// Or can it be described by another recursion?

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

const step3 = toGrid(parseSvgPath(readFileSync('target-svgs/tsp-tour-2.svg', 'utf8')));
const step4 = toGrid(parseSvgPath(readFileSync('target-svgs/tsp-tour-5.svg', 'utf8')));

// Frame path of step 4: d=20 to d=211
const framePath = [];
for (let d = 20; d <= 211; d++) {
  framePath.push({col: step4[d].col, row: step4[d].row});
}

// Entry: from center at (4,8) -> frame at (3,8)
// Exit: from frame at (3,7) -> center at (4,7)

console.log('Frame entry: from center', JSON.stringify(step4[19]), '-> frame', JSON.stringify(step4[20]));
console.log('Frame exit: from frame', JSON.stringify(step4[211]), '-> center', JSON.stringify(step4[212]));

// The frame path compressed moves:
function compressMoves(path) {
  const segments = [];
  for (let i = 1; i < path.length; i++) {
    const dx = path[i].col - path[i-1].col;
    const dy = path[i].row - path[i-1].row;
    let dir = dx > 0 ? 'R' : dx < 0 ? 'L' : dy > 0 ? 'U' : 'D';
    if (segments.length > 0 && segments[segments.length-1].dir === dir) {
      segments[segments.length-1].len++;
    } else {
      segments.push({dir, len: 1});
    }
  }
  return segments;
}

const frameSegs = compressMoves(framePath);
console.log('\nFrame segments:', frameSegs.map(s => s.dir + s.len).join(' '));

// And let me look at step 3's frame too
const frame3path = [];
for (let d = 0; d < 64; d++) {
  const p = step3[d];
  if (!(p.col >= 2 && p.col <= 5 && p.row >= 2 && p.row <= 5)) {
    frame3path.push({col: p.col, row: p.row});
  }
}
// Wait, this won't work because the frame cells are NOT contiguous in step 3.
// Step 3 frame: d=0-21, d=30-47, d=56-63 (3 groups).

// Let me extract the 3 frame segments separately.
console.log('\nStep 3 frame segment 1 (d=0-21):');
const frame3a = step3.slice(0, 22);
console.log('  Moves:', compressMoves(frame3a).map(s => s.dir+s.len).join(' '));

console.log('Step 3 frame segment 2 (d=30-47):');
const frame3b = step3.slice(30, 48);
console.log('  Moves:', compressMoves(frame3b).map(s => s.dir+s.len).join(' '));

console.log('Step 3 frame segment 3 (d=56-63):');
const frame3c = step3.slice(56, 64);
console.log('  Moves:', compressMoves(frame3c).map(s => s.dir+s.len).join(' '));

// Combined frame path (concatenating all 3 segments):
console.log('\nStep 3 full frame as 3 parts:');
console.log('  Part 1 (d=0-21):', frame3a.map(p => `(${p.col},${p.row})`).join(' -> '));
console.log('  Part 2 (d=30-47):', frame3b.map(p => `(${p.col},${p.row})`).join(' -> '));
console.log('  Part 3 (d=56-63):', frame3c.map(p => `(${p.col},${p.row})`).join(' -> '));

// Transitions between center and frame:
// Center first half (d=22-29): ends at step3[29]=(5,2), enters frame at step3[30]=(6,2)
// Center second half (d=48-55): ends at step3[55]=(5,4), enters frame at step3[56]=(6,4)

// So the frame has 3 segments, separated by 2 center insertions.
// Frame seg 1: 22 cells, from (3,7) to (7,3)
// Center part 1: 8 cells
// Frame seg 2: 18 cells, from (6,2) to (6,5)
// Center part 2: 8 cells
// Frame seg 3: 8 cells, from (6,4) to (4,7)

// The complete step 3 frame path (if I trace it as one path):
// (3,7) L3 D7 R7 U3 | gap | R1 D1 L5 U5 R5 D1 | gap | R1 U3 L3
// Hmm this doesn't look right. Let me just print the moves.

console.log('\n=== Step 3 complete path segments ===');
const allSegs = compressMoves(step3);
console.log(allSegs.map(s => s.dir+s.len).join(' '));
// L3 D7 R7 U3 L5 D1 R4 D1 L5 U5 R5 D1 L4 D1 R5 U3 L3

// Now let me try to understand the frame as a boustrophedon meander.
// The frame goes:
// Part 1: outward spiral from center to outer perimeter
// Part 2: inward zigzag from one side 
// Part 3: outward zigzag to the other side
// Part 4: closing the outer perimeter

// Actually, let me take a step back. Since:
// 1. step 4 center 8x8 = step 3 cycle shifted by 51
// 2. step 3 center 4x4 ≠ step 2 cycle (different Hamiltonian cycle)
// 
// Maybe the pattern is that step N+1's center = step N's cycle ALWAYS,
// but step 3's center is step 2's cycle under a DIFFERENT embedding.
// And the relationship center3 ≠ step2 is because step 2 was NOT generated
// by this recursion (it was the base case, which has a different structure).
//
// In other words: maybe steps 1 and 2 are special base cases,
// and the recursion STARTS from step 3 onward.
//
// step 3 = direct construction (base case for 8x8)
// step 4 = recursive construction from step 3
// step 5 = recursive from step 4
// etc.
//
// But we don't have step 5 to verify this.
//
// Alternatively, maybe:
// step 1 = base (2x2)
// step 2 = base (4x4) 
// step 3 = recursion from step 2 BUT with a different center embedding
// step 4 = recursion from step 3 with identity center embedding
// step 5 = recursion from step 4 with the step-2 embedding again?
// (alternating?)

// Let me try yet another approach: construct the path as a direct
// BOUSTROPHEDON SPIRAL algorithm and see if it produces the right result.

// The pattern from the visit order grids is clear:
// The path spirals from inside out (or outside in) with alternating
// row directions, forming a boustrophedon meander.

// Let me try to directly generate step 3 using a spiral algorithm.
// Step 3 visit grid:
//    3  2  1  0 63 62 61 60    <- row 7
//    4 41 42 43 44 45 46 59    <- row 6
//    5 40 51 50 49 48 47 58    <- row 5
//    6 39 52 53 54 55 56 57    <- row 4
//    7 38 25 24 23 22 21 20    <- row 3
//    8 37 26 27 28 29 30 19    <- row 2
//    9 36 35 34 33 32 31 18    <- row 1
//   10 11 12 13 14 15 16 17    <- row 0

// Looking at this grid, I see a CLEAR pattern:
// The path forms nested rectangular spirals.
// Outermost ring: fills row 0 (L->R), col 7 (bottom->top partial), 
//                 top row (L->R partial), col 0 (top->bottom)
// Then inner rings alternate direction.

// Let me try to build an xy2d function.
// For each cell (x, y) in the n x n grid:
// 1. Determine which "ring" it's on (distance from center)
// 2. Determine position within ring
// 3. Compute d based on ring and position

// Actually, let me just try the simplest approach: 
// implement the EXACT frame generation as a boustrophedon spiral.

function generateFrame(n, entryPoint, exitPoint) {
  // Generate a path through all n^2 - (n/2)^2 = 3n^2/4 cells
  // in the outer region (outside the center n/2 x n/2).
  // The path goes from entryPoint to exitPoint.
  
  const half = n / 2;
  const quarter = n / 4;
  const path = [];
  
  // The frame consists of cells where col < quarter || col >= n-quarter ||
  // row < quarter || row >= n-quarter.
  
  // For step 4 (n=16, half=8, quarter=4):
  // Frame = all cells NOT in (4-11, 4-11)
  // Entry: (3,8) [from center (4,8)]
  // Exit: (3,7) [to center (4,7)]
  
  // Entry is at col 3, row 8. Exit is at col 3, row 7.
  // Both are on the inner boundary of the frame (col = quarter-1 = 3).
  
  // The frame path from the move segments:
  // L1 D6 L13 U6 R1 D5 R11 U5 L1 D4 L9 U4 R1 D3 R7 U3 L5 D1 R4 D1 L5 U5 R5 D1 L3
  // Wait that was part of step 4. Let me get the exact frame segments.
  
  return path; // placeholder
}

// Step 4 frame moves (d=20 to d=211):
console.log('\n=== Step 4 frame path ===');
console.log('Start:', JSON.stringify(step4[20]));
console.log('End:', JSON.stringify(step4[211]));
console.log('Moves:', frameSegs.map(s => s.dir+s.len).join(' '));

// Let me look at the frame moves more carefully:
// The frame path for step 4:
// From (3,8): L3 D8... wait let me re-derive
console.log('\nFrame path positions:');
for (let d = 20; d <= 30; d++) {
  console.log(`  d=${d}: (${step4[d].col},${step4[d].row})`);
}
console.log('...');
for (let d = 205; d <= 211; d++) {
  console.log(`  d=${d}: (${step4[d].col},${step4[d].row})`);
}
