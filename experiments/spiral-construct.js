// Construct the curve as a recursive spiral/meander.
//
// Looking at the visit-order matrices:
// Step 2 (4x4):
//  10  11  12  13
//   9   0  15  14
//   8   1   2   3
//   7   6   5   4
//
// Step 3 (8x8):
//  10  11  12  13  14  15  16  17
//   9  36  35  34  33  32  31  18
//   8  37  26  27  28  29  30  19
//   7  38  25  24  23  22  21  20
//   6  39  52  53  54  55  56  57
//   5  40  51  50  49  48  47  58
//   4  41  42  43  44  45  46  59
//   3   2   1   0  63  62  61  60
//
// Key observation: for step 3, the outer ring (rows 0,7 and cols 0,7) has d values:
// Row 0: 10-17 (left to right)
// Col 7: 18-20 (top to bottom, partial)
// Row 7: 3,2,1,0,63,62,61,60 (bidirectional!)
// Col 0: 4-10 (bottom to top)
// This is a BOUSTROPHEDON spiral!
//
// The pattern inside step 3:
// Layer 0 (outermost): perimeter of 8x8
//   Bottom row (row 7): left half goes 0->3 right-to-left, right half goes 63->60 left-to-right
//   Left col: 4->10 bottom to top
//   Top row: 11->17 left to right
//   Right col: 18->20 top to bottom (partial)
//   Then continues INWARD
//
// Layer 1: the 6x6 inner area (rows 1-6, cols 1-6) perimeter
//   Right side going down: 21->22 partial
//   Then left across row 3: 23,24,25
//   Then the inner portion... it's complex
//
// Actually, this is NOT a simple spiral. The inner structure has the same
// self-similar pattern. It's a recursive boustrophedon.
//
// Let me try to formalize the recursive structure:
// At each level, the curve traces a path that goes:
// 1. Down the right side of the bottom-left region
// 2. Left across the bottom
// 3. Up the left side (whole height)
// 4. Right across the top (whole width)
// 5. Down the right side (partial - to the middle)
// 6. Recurse into the inner region
// 7. Continue from the inner region
// 8. Right across the middle, completing the bottom-right region
// 9. Down the right side to bottom
// 10. Left across the bottom of the right region
//
// This is getting complex. Let me try a different tactic:
// Build xy2d directly as a mathematical function.

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

// Look at the relationship between d and position more carefully.
// For each position, compute the "ring" distance from the center.
// Center for 2^n grid: n/2-0.5

function analyzeRingPattern(path, n) {
  console.log(`\n=== Ring analysis for ${n}x${n} ===`);
  const center = (n - 1) / 2;

  // Chebyshev distance from center
  const distFromCenter = path.map(p =>
    Math.max(Math.abs(p.col - center), Math.abs(p.row - center))
  );

  // Print d vs distance
  for (let d = 0; d < path.length; d++) {
    if (d < 10 || d >= path.length - 5) {
      console.log(`  d=${String(d).padStart(3)}: (${path[d].col},${path[d].row}) dist=${distFromCenter[d].toFixed(1)}`);
    }
  }

  // Group d values by distance
  const byDist = {};
  for (let d = 0; d < path.length; d++) {
    const dist = distFromCenter[d];
    if (!byDist[dist]) byDist[dist] = [];
    byDist[dist].push(d);
  }

  console.log('\n  Distance groups:');
  for (const [dist, ds] of Object.entries(byDist).sort((a,b) => Number(a[0]) - Number(b[0]))) {
    console.log(`  dist=${Number(dist).toFixed(1)}: d=${Math.min(...ds)}-${Math.max(...ds)} (${ds.length} pts)`);
  }
}

analyzeRingPattern(step2, 4);
analyzeRingPattern(step3, 8);

// Now let me check: is there a pattern where d can be computed from
// (ring_number, position_within_ring)?

// For step 3 (8x8), the "rings" from center:
// Center is at (3.5, 3.5)
// dist 0.5: (3,3),(4,3),(3,4),(4,4) - 4 cells
// dist 1.5: cells at distance 1.5 from center - 12 cells
// dist 2.5: 20 cells
// dist 3.5: 28 cells (outer ring)
// Total: 4+12+20+28 = 64

// For each ring, what's the d-value pattern?
console.log('\n=== Detailed ring analysis for step 3 ===');
function buildXY2D(path) {
  const table = {};
  for (let d = 0; d < path.length; d++) {
    table[`${path[d].col},${path[d].row}`] = d;
  }
  return table;
}

const xy2d3 = buildXY2D(step3);
const n = 8;
const center = 3.5;

for (let ring = 0; ring < 4; ring++) {
  const dist = ring + 0.5;
  const lo = Math.ceil(center - dist);
  const hi = Math.floor(center + dist);
  console.log(`\nRing ${ring} (dist ${dist}, coords ${lo}-${hi}):`);

  // Collect all cells in this ring and their d values
  const cells = [];
  for (let row = lo; row <= hi; row++) {
    for (let col = lo; col <= hi; col++) {
      if (Math.max(Math.abs(col - center), Math.abs(row - center)) === dist) {
        const d = xy2d3[`${col},${row}`];
        cells.push({ col, row, d });
      }
    }
  }
  cells.sort((a, b) => a.d - b.d);
  console.log(`  ${cells.length} cells, d range: ${cells[0].d}-${cells[cells.length-1].d}`);
  console.log(`  In d order: ${cells.map(c => `(${c.col},${c.row}):${c.d}`).join(' ')}`);

  // Check if d values form two contiguous groups
  const ds = cells.map(c => c.d).sort((a,b) => a-b);
  const gaps = [];
  for (let i = 1; i < ds.length; i++) {
    if (ds[i] - ds[i-1] > 1) gaps.push(i);
  }
  console.log(`  Gaps in d sequence: ${gaps.length}`);
  if (gaps.length <= 2) {
    // Split into groups
    const groups = [ds.slice(0, gaps[0] || ds.length)];
    if (gaps.length > 0) groups.push(ds.slice(gaps[0], gaps[1] || ds.length));
    if (gaps.length > 1) groups.push(ds.slice(gaps[1]));
    console.log(`  Groups: ${groups.map(g => `[${g[0]}-${g[g.length-1]}]`).join(', ')}`);
  }
}

// KEY INSIGHT: Each ring has its d values split into exactly TWO contiguous groups!
// This is the characteristic of the "U-fork" pattern:
// One group is the "entering" portion and the other is the "exiting" portion.
// The curve enters from the outer ring, spirals inward to the center,
// then spirals back outward.

// This is essentially a Hamiltonian path that goes IN then OUT like a tuning fork!
// The "U" or "fork" shape is because the path enters on one side of the center,
// goes to the center, then exits on the other side of the center.

// Let me verify: for each ring, are the two groups exactly:
// Group 1: first N/2 cells (entering)
// Group 2: last N/2 cells (exiting)
// And they together cover the entire ring?

console.log('\n=== Verifying U-fork (in-out) structure ===');
const totalPoints = step3.length;
const halfPoint = totalPoints / 2; // d = 32 is the halfway point

for (let ring = 0; ring < 4; ring++) {
  const dist = ring + 0.5;
  const lo = Math.ceil(center - dist);
  const hi = Math.floor(center + dist);

  const cells = [];
  for (let row = lo; row <= hi; row++) {
    for (let col = lo; col <= hi; col++) {
      if (Math.max(Math.abs(col - center), Math.abs(row - center)) === dist) {
        const d = xy2d3[`${col},${row}`];
        cells.push({ col, row, d });
      }
    }
  }

  const entering = cells.filter(c => c.d < halfPoint).sort((a,b) => a.d - b.d);
  const exiting = cells.filter(c => c.d >= halfPoint).sort((a,b) => a.d - b.d);

  console.log(`Ring ${ring}: ${entering.length} entering + ${exiting.length} exiting = ${cells.length} total`);
  console.log(`  Entering d: ${entering.map(c=>c.d).join(',')}`);
  console.log(`  Exiting d: ${exiting.map(c=>c.d).join(',')}`);
}

// The midpoint of the path should be at the center of the grid.
// d=31 and d=32 should be at or near the center.
console.log('\nMidpoint of step 3:');
console.log(`  d=31: (${step3[31].col},${step3[31].row})`);
console.log(`  d=32: (${step3[32].col},${step3[32].row})`);
// d=31 = (6,1), d=32 = (5,1). These are NOT at the center!
// Center is (3.5, 3.5). d=31,32 are at the top-right area.

// Let me look at which d values are at the innermost ring:
console.log('\nInnermost ring (dist 0.5):');
const innerCells = [];
for (const [rc, d] of Object.entries(xy2d3)) {
  const [c, r] = rc.split(',').map(Number);
  if (Math.max(Math.abs(c-center), Math.abs(r-center)) === 0.5) {
    innerCells.push({ col: c, row: r, d });
  }
}
innerCells.sort((a,b) => a.d - b.d);
console.log(innerCells.map(c => `(${c.col},${c.row}):d=${c.d}`).join(', '));
// These should show the d values 23,24,53,54 (from earlier ring analysis)
