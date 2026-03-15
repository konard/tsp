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

// The segment patterns:
// Step 2 (n=4): U1 R2 U1 L3 D3 R3 U1 L1
// Step 3 (n=8): L3 D7 R7 U3 L5 D1 R4 D1 L5 U5 R5 D1 L4 D1 R5 U3 L3
// Step 4 (n=16): D1 R5 U3 L7 D3 L1 U4 R9 D4 R1 U5 L11 D5 L1 U6 R13 D6 R1 U7 L15 D15 R15 U7 L1 D6 L13 U6 R1 D5 R11 U5 L1 D4 L9 U4 R1 D3 R7 U3 L5 D1 R4 D1 L5 U5 R5 D1 L3

// Looking at step 4 more carefully:
// The middle part: U7 L15 D15 R15 U7  (the big outer loop)
// Then symmetrically on both sides, diminishing zigzag patterns

// Let me split step 4 into halves:
// First half (d=0 to d=127): entering
// Second half (d=128 to d=255): exiting

// Actually, let me look at the step 4 moves pattern as two arms of a U:
// The step 3 inner zigzag is embedded in step 4!
// Step 4 ends with: L5 D1 R4 D1 L5 U5 R5 D1 L3
// Step 3 has: L5 D1 R4 D1 L5 U5 R5 D1 L4 D1 R5 U3 L3
// Very similar but not identical.

// Let me try to understand the RECURSIVE structure.
// Consider step 3's segments more carefully:
// L3 | D7 R7 U3 | L5 D1 R4 D1 L5 | U5 R5 D1 L4 D1 R5 | U3 L3
//
// The outer frame: L3 D7 R7 ... U3 L3
// This traces: left (half-1), down (n-1), right (n-1), ... up (half-1), left (half-1)
// = the outer perimeter of the left half of the grid

// Step 4 has a similar structure but with nested levels.
// Let me look at step 4 segment lengths:
// 1,5,3,7,3,1,4,9,4,1,5,11,5,1,6,13,6,1,7,15,15,15,7,1,6,13,6,1,5,11,5,1,4,9,4,1,3,7,3,5,1,4,1,5,5,5,1,3

// The center of step 4 is: 7,15,15,15,7 = U7 L15 D15 R15 U7
// This is the outer frame! L15, D15, R15 trace 3 sides of the 16x16 grid.
// The U7 values = going up half the grid on both sides.

// Before the center: 1,5,3,7,3,1,4,9,4,1,5,11,5,1,6,13,6,1
// After the center:  1,6,13,6,1,5,11,5,1,4,9,4,1,3,7,3,5,1,4,1,5,5,5,1,3

// The before-center sequence forms an inward spiral:
// D1 R5 U3 L7 (small inner movement)
// D3 L1 U4 R9 (growing)
// D4 R1 U5 L11
// D5 L1 U6 R13
// D6 R1 U7 <- connects to outer frame

// After center:
// L1 D6 L13 U6 R1 D5 R11 U5 L1 D4 L9 U4 R1 D3 R7 U3 (mirror of before-center!)
// then: L5 D1 R4 D1 L5 U5 R5 D1 L3 (inner zigzag)

// So the structure has THREE parts:
// Part A: inward spiral (from center of grid, spiraling outward to the frame)
// Part B: outer frame (3 sides of the grid)
// Part C: inward spiral (from frame back toward center - mirror of Part A)
// Part D: inner zigzag (in the center region)

// Wait, let me re-examine by looking at directions:
// Step 4 dirs: DRULDLURDRULDLURDRULDRULDLURDRULDLURDRULDRDLURDL

// Let me group by the "spiral arms":
// First arm (going outward):
//  D R U L  (repeat with growing sizes)
//  D L U R  (alternate direction)
// ...

// Actually I think the pattern is clearer if I look at pairs.
// Step 3: L3 D7 R7 U3 | L5 D1 R4 D1 L5 | U5 R5 D1 L4 D1 R5 | U3 L3
// 
// Let me split differently:
// Phase 1 (left arm, inward): L3
// Phase 2 (outer frame): D7 R7
// Phase 3 (right arm, inward): U3 L5 D1 R4 D1 L5
// Phase 4 (left arm, outward): U5 R5 D1 L4 D1 R5
// Phase 5 (outer frame complement): U3
// Phase 6 (completion): L3

// Hmm, that's not quite right either. Let me think about this differently.

// NEW APPROACH: Look at the path as traversing concentric rectangular rings.
// For each ring, the path enters, traverses the ring, and exits.
// The rings alternate direction (boustrophedon).

// For step 3 (n=8), rings from outside in:
// Ring 0: outer border (rows 0,7 and cols 0,7) - 28 cells on perimeter
// Ring 1: rows 1-6, cols 1-6 border - 20 cells on perimeter
// Ring 2: rows 2-5, cols 2-5 border - 12 cells
// Ring 3: rows 3-4, cols 3-4 - 4 cells (center)

// Let me check which d values are on each ring:
function buildGrid(path, n) {
  const grid = Array.from({length: n}, () => Array(n).fill(-1));
  for (let d = 0; d < path.length; d++) {
    grid[path[d].row][path[d].col] = d;
  }
  return grid;
}

function getChebyshevRing(col, row, n) {
  const center = (n - 1) / 2;
  return Math.max(Math.abs(col - center), Math.abs(row - center));
}

console.log('=== Ring membership analysis for step 3 (n=8) ===');
const grid3 = buildGrid(step3, 8);
for (let ring = 3.5; ring >= 0.5; ring -= 1) {
  const cells = [];
  for (let d = 0; d < 64; d++) {
    const {col, row} = step3[d];
    if (getChebyshevRing(col, row, 8) === ring) {
      cells.push(d);
    }
  }
  // Find contiguous groups
  cells.sort((a,b) => a-b);
  const groups = [];
  let start = cells[0];
  for (let i = 1; i <= cells.length; i++) {
    if (i === cells.length || cells[i] !== cells[i-1] + 1) {
      groups.push(`${start}-${cells[i-1]}`);
      if (i < cells.length) start = cells[i];
    }
  }
  console.log(`  Ring ${ring}: ${cells.length} cells, groups: ${groups.join(', ')}`);
}

console.log('\n=== Ring membership analysis for step 4 (n=16) ===');
for (let ring = 7.5; ring >= 0.5; ring -= 1) {
  const cells = [];
  for (let d = 0; d < 256; d++) {
    const {col, row} = step4[d];
    if (getChebyshevRing(col, row, 16) === ring) {
      cells.push(d);
    }
  }
  cells.sort((a,b) => a-b);
  const groups = [];
  let start = cells[0];
  for (let i = 1; i <= cells.length; i++) {
    if (i === cells.length || cells[i] !== cells[i-1] + 1) {
      groups.push(`${start}-${cells[i-1]}`);
      if (i < cells.length) start = cells[i];
    }
  }
  console.log(`  Ring ${ring}: ${cells.length} cells, groups: ${groups.join(', ')}`);
}

// If each ring has exactly 2 contiguous groups, we can construct the path
// by alternating between "entering" and "exiting" spirals.
