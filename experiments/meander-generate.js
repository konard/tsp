// Generate the U-fork curve as a recursive boustrophedon meander.
//
// The curve structure for step 3 (8x8):
// 1. Start near center-bottom of outer ring
// 2. Go left along bottom
// 3. Go up the left side
// 4. Go right along top
// 5. Go down the right side (partial - to row 3)
// 6. Now enter ring 2: go left along row 3 to col 2
// 7. Enter ring 1: go up to (2,2)
// 8. Enter ring 0: (right to (3,2), down to (3,3)... no)
//
// Actually, let me trace the exact path and understand the turning pattern.
//
// Step 3 path trace (8x8):
// d=0-3: (3,7)->(2,7)->(1,7)->(0,7) -- LEFT along row 7 (half of bottom)
// d=3-10: (0,7)->(0,6)->...->( 0,0) -- UP left col (full height)
// d=10-17: (0,0)->(1,0)->...->( 7,0) -- RIGHT along row 0 (full width)
// d=17-20: (7,0)->(7,1)->(7,2)->( 7,3) -- DOWN right col (partial - 3 steps)
// d=20-25: (7,3)->(6,3)->(5,3)->(4,3)->(3,3)->(2,3) -- LEFT along row 3 (5 steps)
// d=25-26: (2,3)->(2,2) -- UP 1 step
// d=26-30: (2,2)->(3,2)->(4,2)->(5,2)->(6,2) -- RIGHT along row 2 (4 steps)
// d=30-31: (6,2)->(6,1) -- UP 1 step
// d=31-36: (6,1)->(5,1)->(4,1)->(3,1)->(2,1)->(1,1) -- LEFT along row 1 (5 steps)
// d=36-41: (1,1)->(1,2)->(1,3)->(1,4)->(1,5)->(1,6) -- DOWN col 1 (5 steps)
// d=41-46: (1,6)->(2,6)->(3,6)->(4,6)->(5,6)->(6,6) -- RIGHT along row 6 (5 steps)
// d=46-47: (6,6)->(6,5) -- UP 1 step
// d=47-52: (6,5)->(5,5)->(4,5)->(3,5)->(2,5) -- LEFT along row 5 (4 steps... wait)
// d=47-51: (6,5)->(5,5)->(4,5)->(3,5)->(2,5) -- LEFT (4 steps)
// d=51-52: (2,5)->(2,4) -- UP 1 step
// d=52-57: (2,4)->(3,4)->(4,4)->(5,4)->(6,4)->(7,4) -- RIGHT along row 4 (5 steps)
// d=57-60: (7,4)->(7,5)->(7,6)->(7,7) -- DOWN right col (3 steps)
// d=60-63: (7,7)->(6,7)->(5,7)->(4,7) -- LEFT along row 7 (3 steps, other half)

// So the pattern is:
// First half (entering): spiral from outer to inner, going CW
//   LEFT(partial bottom), UP(full left), RIGHT(full top), DOWN(partial right to mid)
//   LEFT(to inner), UP(1), RIGHT(inner), UP(1), LEFT(inner)
//
// Second half (exiting): spiral from inner to outer, going CW
//   DOWN(inner), RIGHT(inner), UP(1), LEFT(inner), UP(1), RIGHT(to outer)
//   DOWN(partial right), LEFT(partial bottom)

// The path makes a "U" or tuning fork shape - it enters from one side of the bottom,
// spirals in to the center, then spirals back out to the other side of the bottom.

// Let me try to construct this algorithmically.
// For an NxN grid (N = 2^n):
// The path starts at (N/2 - 1, N-1) and ends at (N/2, N-1)

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

// Generate the U-fork meander for a grid of size N = 2^order
function generateUForkMeander(order) {
  const N = Math.pow(2, order);
  if (N < 2) return [{col: 0, row: 0}];

  const path = [];
  const visited = Array.from({length: N}, () => Array(N).fill(false));

  function visit(col, row) {
    path.push({col, row});
    visited[row][col] = true;
  }

  // The entering path: starts at (N/2 - 1, N-1), spirals CW inward
  // The exiting path: continues CW outward, ends at (N/2, N-1)

  // For the entering half:
  // We trace a path that alternates between:
  // - Going along a horizontal/vertical edge of the current bounding box
  // - Shrinking the bounding box and continuing

  // Let me trace it layer by layer.
  // Layer k goes from inner to outer, k=0 is innermost.
  // For N=8: 4 layers (k=0..3)
  // Layer k boundary: [k, N-1-k] in both dimensions

  // The entering half traces from outside to inside:
  // Layer 3 (outermost): partial bottom (right-to-left), full left side (bottom-to-top),
  //   full top (left-to-right), partial right side (top-to-bottom, stopping at row N/2)
  // Layer 2: LEFT across (right to left, inner), UP 1, RIGHT across (left to right, inner), UP 1
  // Layer 1: LEFT across, DOWN (inner col), RIGHT across, UP 1, LEFT across, UP 1
  // Layer 0: RIGHT across (final inner)

  // This is quite specific. Let me instead directly construct by following the observed pattern.

  // The key observation: the path consists of alternating horizontal and vertical segments
  // that form a spiral from outside in and then inside out.

  // Let me try to build it using the segment pattern:
  // Step 1: L1 U1 R1
  // Step 2: D1 R2 D1 L3 U3 R3 D1 L1
  // Step 3: L3 U7 R7 D3 L5 U1 R4 U1 L5 D5 R5 U1 L4 U1 R5 D3 L3

  // For step 3, the segment lengths are:
  // L3 U7 R7 D3 | L5 U1 R4 U1 L5 | D5 R5 U1 L4 U1 R5 | D3 L3

  // Let me see if I can find a recursive formula for the segments.
  // Step 1: L(N/2-1) U(N-1) R(N-1)  for N=2: L1 U1 R1
  // Step 2: D1 R(N/2) D1 L(N-1) U(N-1) R(N-1) D1 L1  for N=4
  // Hmm: D1 R2 D1 L3 U3 R3 D1 L1 -- R2=N/2, L3=N-1, U3=N-1, R3=N-1

  // Step 3 for N=8:
  // L3 U7 R7 D3 L5 U1 R4 U1 L5 D5 R5 U1 L4 U1 R5 D3 L3
  // L3=N/2-1, U7=N-1, R7=N-1, D3=N/2-1
  // Then: L5, U1, R4, U1, L5, D5, R5, U1, L4, U1, R5, D3, L3

  // Let me see if the inner part (after the first 4 segments) matches step 2's pattern
  // but reflected/transformed.
  // Inner of step 3 (after first 4 segments):
  // L5 U1 R4 U1 L5 D5 R5 U1 L4 U1 R5 D3 L3
  //
  // Step 2 was: D1 R2 D1 L3 U3 R3 D1 L1
  //
  // Hmm, not directly matching. But maybe with scaling.

  // Let me look at step 2 differently.
  // Step 2 (N=4): D1 R2 D1 L3 U3 R3 D1 L1
  // This can be split into: [D1 R2 D1] [L3 U3 R3] [D1 L1]
  // The middle [L3 U3 R3] is step 1 scaled by 3/1 = 3x? No, step 1 is L1 U1 R1.
  // [L3 U3 R3] = step 1 with each segment multiplied by 3. But that's just the outer ring.
  //
  // Actually, [D1 R2 D1] is the "entering" prefix that goes from start to the outer ring path.
  // [L3 U3 R3] traces 3 sides of the outer ring.
  // [D1 L1] is the "exiting" suffix that returns from the outer ring to near the start.

  // For step 3 (N=8): [L3 U7 R7 D3] traces part of the outer ring
  // Then the inner part traces the interior.

  // Actually wait, I realize I should think about this more carefully by looking at
  // what happens between steps. Let me look at step 2 and see if its inner part
  // (removing the outer ring) gives step 1.

  // Step 2 outer ring: the perimeter of 4x4 = 12 cells
  // Step 2 inner: 4 cells (the 2x2 center)
  // Step 2 path: D1 R2 D1 L3 U3 R3 D1 L1
  // The path visits 16 cells. The 4 inner cells are at (1,1),(2,1),(1,2),(2,2).
  // d=0:(1,1), d=1:(1,2), d=2:(2,2), d=15:(2,1) and d=3:(3,2)...
  // Actually inner cells: d=0,1,2,15. These are NOT contiguous and span the whole range.

  // OK let me just try a direct generation approach.
  // Looking at the step 3 segments: L3 U7 R7 D3 L5 U1 R4 U1 L5 D5 R5 U1 L4 U1 R5 D3 L3
  // Count: 3+7+7+3+5+1+4+1+5+5+5+1+4+1+5+3+3 = 63 moves (64 points)

  // Group into phases:
  // Phase 1 (outer, entering): L3 U7 R7 D3 = going left(partial), up(full), right(full), down(partial)
  // Phase 2 (inner zigzag): L5 U1 R4 U1 L5 D5 R5 U1 L4 U1 R5
  // Phase 3 (outer, exiting): D3 L3

  // Phase 2 can be further decomposed:
  // L5 U1 R4 U1 L5 -- entering inner (zigzag to the left/center)
  // D5 R5 U1 L4 U1 R5 -- exiting inner (zigzag back to the right)

  // This inner zigzag pattern has the same structure as the whole curve!
  // The number of zigzag segments scales with the order.

  // Let me try yet another approach: just generate the path by walking the grid
  // in the specific spiral pattern, using the observed rules.

  // For the entering half:
  // Start at (N/2-1, N-1)
  // 1. Go LEFT N/2-1 steps to (0, N-1)
  // 2. Go UP N-1 steps to (0, 0)
  // 3. Go RIGHT N-1 steps to (N-1, 0)
  // 4. Go DOWN N/2-1 steps to (N-1, N/2-1)
  // 5. Enter inner zigzag...

  // For the exiting half (symmetric):
  // ...exit inner zigzag
  // Go DOWN N/2-1 steps on right side
  // Go LEFT N/2-1 steps along bottom

  // The inner zigzag visits the remaining N*N - (outer ring cells already visited) cells
  // in a specific boustrophedon pattern.

  // Let me implement this as a direct path generator:
  return path;
}

// Instead, let me try to generate the segments programmatically.
function generateSegments(order) {
  const N = Math.pow(2, order);
  if (order === 1) {
    // N=2: L1 U1 R1
    return [{dir: 'L', len: 1}, {dir: 'U', len: 1}, {dir: 'R', len: 1}];
  }

  // The outer ring part:
  // L(N/2-1) U(N-1) R(N-1) D(N/2-1)
  const outerEntering = [
    {dir: 'L', len: N/2 - 1},
    {dir: 'U', len: N - 1},
    {dir: 'R', len: N - 1},
    {dir: 'D', len: N/2 - 1},
  ];

  // Inner zigzag: this is where the recursion happens
  // The inner part fills an (N-2) x (N-2) grid? No, it fills the middle rows/cols.

  // Actually, looking at the data:
  // Step 2 (N=4): D1 R2 D1 L3 U3 R3 D1 L1
  // outer entering = L(1) U(3) R(3) D(1) -> this gives us L1 U3 R3 D1
  // But actual step 2 is: D1 R2 D1 L3 U3 R3 D1 L1
  // So the first segment is D1, not L1!

  // Hmm, the starting direction depends on the orientation. Let me check.
  // Step 1 starts at (1,1) and first move is LEFT to (0,1). Start: (1,1), dir L.
  // Step 2 starts at (1,1) and first move is DOWN to (1,2). Start: (1,1), dir D.
  // Step 3 starts at (3,7) and first move is LEFT to (2,7). Start: (3,7), dir L.

  // Step 1 start: (N/2-1, N/2-1) = (0, 0) for N=2... wait no.
  // N=2: start (1,1). N/2-1 = 0. So start is NOT at (N/2-1, N/2-1).
  // N=4: start (1,1). N/2-1 = 1. Start IS at (1,1).
  // N=8: start (3,7). N/2-1 = 3. Start is at (3, 7) not (3, 3).
  // N=16: start (6,9). N/2-1 = 7. Start is at (6, 9).

  // For N=8: start = (3, 7) = (N/2-1, N-1)
  // For N=4: start = (1, 1) = (N/2-1, N/2-1)?? But it should be (1, 3) if following N=8 pattern
  // No wait, step 2 starts at (1,1) not (1,3).

  // Hmm, step sizes and start points:
  // Step 1 (N=2): start (1,1), segments L1 U1 R1
  // Step 2 (N=4): start (1,1), segments D1 R2 D1 L3 U3 R3 D1 L1
  // Step 3 (N=8): start (3,7), segments L3 U7 R7 D3 L5 U1 R4 U1 L5 D5 R5 U1 L4 U1 R5 D3 L3
  // Step 4 (N=16): start (6,9)

  // For step 2, start (1,1) is at the CENTER of the grid (1.5, 1.5 is center of 4x4).
  // (1,1) is one cell below-left of center.
  // For step 3, start (3,7) is at the bottom of the grid, center-left.
  // For step 4, start (6,9) is... let me check: center of 16x16 is at (7.5, 7.5).
  // (6,9) is at column 6 (below center), row 9 (below center).

  // The starting position doesn't follow a simple formula. Let me instead just
  // focus on building the algorithm that generates the correct path.

  return [];
}

// Let me take a step back and realize: maybe I should just store the d2xy mapping
// and generate it recursively. The key formula might be simpler than I think.

// From the data, I observed that the path starts at a specific point,
// spirals outward, then spirals inward. The spiral pattern alternates
// between rings in a specific way.

// ALTERNATIVE APPROACH: Since I have 4 known steps (step 1-4),
// maybe I should just build a recursive generator that correctly handles
// the interleaving, based on the observed block patterns.

// The block pattern for step 2 was:
// Block (0,0)(1) Block (0,1)(1) Block (1,1)(4) Block (0,1)(3) Block (0,0)(3) Block (1,0)(4)
// In terms of the visit order [A orientation: BR, BL, TL, TR]:
// BR(1) BL(1) TL(all) BL(rest) BR(rest) TR(all)

// But the sub-blocks need to be visited in a SPECIFIC ORDER within each block.
// The "first visit" to BR gives its first cell in BR's orientation.
// The "first visit" to BL gives its first cell in BL's orientation.
// Then TL is fully traced.
// Then BL continues from where it left off.
// Then BR continues from where it left off.
// Then TR is fully traced.

// But what ORIENTATION does each sub-block use?
// BR: orientation B -> visit (0,0),(1,0),(1,1),(0,1)
// BL: orientation C -> visit (1,0),(1,1),(0,1),(0,0)
// TL: orientation A -> visit (1,1),(0,1),(0,0),(1,0)
// TR: orientation B -> visit (0,0),(1,0),(1,1),(0,1)

// So the pattern is:
// d=0: BR's cell 0 = (0,0) in BR block = global (2+0, 2+0) = (2,2). But target d=0 is (1,1)!
// That doesn't match! The issue is the block assignment.

// Wait, the "A orientation" visit order is: (1,1), (0,1), (0,0), (1,0).
// These are the GLOBAL cell positions at step 1 level.
// At step 2, these become BLOCK positions:
// block 0 = cell (1,1) = block at (1,1) -> cols 2-3, rows 2-3
// block 1 = cell (0,1) = block at (0,1) -> cols 0-1, rows 2-3
// block 2 = cell (0,0) = block at (0,0) -> cols 0-1, rows 0-1
// block 3 = cell (1,0) = block at (1,0) -> cols 2-3, rows 0-1

// Block visit sequence: block2_first, block1_first, block0_all, block1_rest, block2_rest, block3_all
// = cell(0,0)_first, cell(0,1)_first, cell(1,1)_all, cell(0,1)_rest, cell(0,0)_rest, cell(1,0)_all

// Hmm, that's DIFFERENT from what I said before.
// In A's visit order: cell0=(1,1), cell1=(0,1), cell2=(0,0), cell3=(1,0)
// The interleaving is: cell2_first, cell1_first, cell0_all, cell1_rest, cell2_rest, cell3_all
// = 3rd_first, 2nd_first, 1st_all, 2nd_rest, 3rd_rest, 4th_all

// In 0-indexed: visit[2]_1st, visit[1]_1st, visit[0]_all, visit[1]_rest, visit[2]_rest, visit[3]_all

// Let me verify this with the actual data:
// Block at cell(0,0) = cols 0-1, rows 0-1 -> d values: 0,9,10,11
//   First visit: d=0 at (1,1) (local 1,1)
// Block at cell(0,1) = cols 0-1, rows 2-3 -> d values: 1,6,7,8
//   First visit: d=1 at (1,2) (local 1,0)
// Block at cell(1,1) = cols 2-3, rows 2-3 -> d values: 2,3,4,5
//   All visits: d=2-5
// Block at cell(0,1) remaining: d=6,7,8
// Block at cell(0,0) remaining: d=9,10,11
// Block at cell(1,0) = cols 2-3, rows 0-1 -> d values: 12,13,14,15
//   All visits: d=12-15

// YES! This matches! The pattern is:
// cell(0,0) = visit[2] = 3rd in A's visit order
// cell(0,1) = visit[1] = 2nd in A's visit order
// cell(1,1) = visit[0] = 1st in A's visit order
// cell(1,0) = visit[3] = 4th in A's visit order

// So the interleaving in terms of visit order indices is:
// idx2(1st), idx1(1st), idx0(all), idx1(rest), idx2(rest), idx3(all)

// And the orientation of each sub-block:
// idx0 = cell(1,1) = orientation B
// idx1 = cell(0,1) = orientation C
// idx2 = cell(0,0) = orientation A
// idx3 = cell(1,0) = orientation B

// A's children: [B, C, A, B] (indexed 0,1,2,3 in A's visit order)

// Now I need to know the children orientations for B, C, and D as well.
// Let me derive them from step2->step3 data.

// Step 2 cells and their orientations (from step1->2):
// pd=0 at (1,1) in A's block (1,1): orient B (child 0 of A)
// pd=1 at (1,2) in A's block (0,1): orient C (child 1 of A)
// pd=2 at (2,2) in A's block (1,1)... wait, pd=2 is at (2,2) which is in block (1,1).
// But pd=0 is also in block (1,1)... hmm.

// Actually, I'm confusing levels. Let me be precise.
// At step1->step2:
// Step 1 cells: (1,1)=d0, (0,1)=d1, (0,0)=d2, (1,0)=d3
// Each step-1 cell expands into a 2x2 sub-block in step 2.
// The sub-block orientations (determined from the step1->2 analysis) are:
// step1 cell d=0 at (1,1) -> orientation B (child 0 of A)
// step1 cell d=1 at (0,1) -> orientation C (child 1 of A)
// step1 cell d=2 at (0,0) -> orientation A (child 2 of A)
// step1 cell d=3 at (1,0) -> orientation B (child 3 of A)

// So: A's children = [B, C, A, B]

// Now for step2->step3, each step-2 cell expands into a 2x2 sub-block.
// Step-2 cell pd=0 has orientation B (from above). Its children are determined by B's rule.
// Step-2 cell pd=0 is at (1,1). Its sub-block in step 3 covers (2,2),(3,2),(2,3),(3,3).

// B's visit order: (0,0),(1,0),(1,1),(0,1)
// So B visits: (2,2),(3,2),(3,3),(2,3) in step 3.
// Their step3 orientations (from step2->3 mapping, which we computed as oSeq23):
// (2,2) = step2 pd=2, oSeq23[2] = A
// Wait, that's wrong. oSeq23 tells us the orientation of each step-2 cell for its step2->3 expansion.
// I need step3->step4 orientations to find B's children.

// Hmm, let me think more carefully. The orient of a cell at level k determines
// how it's visited at level k+1. So:
// Step-2 cell pd=0 has orient B. This means at step 2, cell pd=0 visits its internal
// 2x2 sub-cells in B's order.
// Those 4 sub-cells (in step 3) each have their own orient from the step2->3 mapping.
// The step2->3 mapping (oSeq23) gives us the orient of each STEP-2 cell for expansion to step 3.
// Not the orient of step-3 cells.

// I need to find the orient of step-3 cells from the step3->step4 data.
// The oSeq34 gives the orient of each step-3 cell for expansion to step 4.

// So: the children of B (step-2 cell pd=0 with orient B) are:
// B visits (0,0),(1,0),(1,1),(0,1) in its local 2x2.
// In global coords at step 3: (2,2),(3,2),(3,3),(2,3)
// These are step-3 cells at d values: d=26,27,24,25 (from xy2d3)
// Their step3->4 orientations (oSeq34): oSeq34[26], oSeq34[27], oSeq34[24], oSeq34[25]

// But I haven't computed oSeq34 in this script. Let me compute it.

const xy2d3 = {};
for (let d = 0; d < step3.length; d++) {
  xy2d3[`${step3[d].col},${step3[d].row}`] = d;
}
const xy2d4 = {};
for (let d = 0; d < step4.length; d++) {
  xy2d4[`${step4[d].col},${step4[d].row}`] = d;
}

const orientDefs = {
  A: [{col:1,row:1}, {col:0,row:1}, {col:0,row:0}, {col:1,row:0}],
  B: [{col:0,row:0}, {col:1,row:0}, {col:1,row:1}, {col:0,row:1}],
  C: [{col:1,row:0}, {col:1,row:1}, {col:0,row:1}, {col:0,row:0}],
  D: [{col:0,row:1}, {col:0,row:0}, {col:1,row:0}, {col:1,row:1}],
};

// Compute step3->4 orientations
const oSeq34 = [];
for (let d3 = 0; d3 < 64; d3++) {
  const px = step3[d3].col;
  const py = step3[d3].row;
  const localDs = [];
  for (let ly = 0; ly < 2; ly++) {
    for (let lx = 0; lx < 2; lx++) {
      const gx = px * 2 + lx;
      const gy = py * 2 + ly;
      localDs.push({ lx, ly, d4: xy2d4[`${gx},${gy}`] });
    }
  }
  localDs.sort((a, b) => a.d4 - b.d4);
  const visitOrder = localDs.map(l => `${l.lx},${l.ly}`).join(' -> ');
  let orient = '?';
  for (const [name, pattern] of Object.entries(orientDefs)) {
    if (pattern.map(p => `${p.col},${p.row}`).join(' -> ') === visitOrder) {
      orient = name;
      break;
    }
  }
  oSeq34.push(orient);
}

// Now derive the children rules for each orientation.
// A's children (from step1->2): A visits (1,1),(0,1),(0,0),(1,0) at step 1.
// These are step-1 d=0,1,2,3 which become step-2 cells.
// Step-2 cell d=0 at (1,1) has orient (from step2->3): oSeq23 computed below.
// oSeq23[d] is the orient of step-2 cell d for expansion into step 3.

const oSeq23 = [];
for (let d2 = 0; d2 < 16; d2++) {
  const px = step2[d2].col;
  const py = step2[d2].row;
  const localDs = [];
  for (let ly = 0; ly < 2; ly++) {
    for (let lx = 0; lx < 2; lx++) {
      const gx = px * 2 + lx;
      const gy = py * 2 + ly;
      localDs.push({ lx, ly, d3: xy2d3[`${gx},${gy}`] });
    }
  }
  localDs.sort((a, b) => a.d3 - b.d3);
  const visitOrder = localDs.map(l => `${l.lx},${l.ly}`).join(' -> ');
  let orient = '?';
  for (const [name, pattern] of Object.entries(orientDefs)) {
    if (pattern.map(p => `${p.col},${p.row}`).join(' -> ') === visitOrder) {
      orient = name;
      break;
    }
  }
  oSeq23.push(orient);
}

console.log('Step 2->3 orientations:', oSeq23.join(''));
console.log('Step 3->4 orientations:', oSeq34.join(''));

// Now: A visits cells in order (1,1),(0,1),(0,0),(1,0) = step-1 d=0,1,2,3
// These step-1 cells become step-2 cells d=0,1,...15 but in the INTERLEAVED order.
// Actually no - each step-1 cell becomes a 2x2 BLOCK of step-2 cells.
// The step-2 cells within block d1=0 (at (1,1)) are at step-2 d values: 2,3,4,5
// Wait, I need to find which step-2 cells belong to which step-1 cell.

// step-1 cell (1,1) = block cols 2-3, rows 2-3
// step-2 cells in this block: those with col in [2,3] and row in [2,3]
// d2 values: (2,2)=2, (3,2)=3, (3,3)=4, (2,3)=5
// Their oSeq23 values: A, D, B, B

// The visit order within this block (orient B since A's child 0 = B):
// B visits (0,0),(1,0),(1,1),(0,1) = local (0,0)=d2, (1,0)=d3, (1,1)=d4, (0,1)=d5
// Children orientations: oSeq23[2]=A, oSeq23[3]=D, oSeq23[4]=B, oSeq23[5]=B
// So B's children = [A, D, B, B]

// step-1 cell (0,1) = block cols 0-1, rows 2-3 (A's child 1 = orient C)
// step-2 cells: (0,2)=8, (1,2)=1, (0,3)=7, (1,3)=6
// C visits (1,0),(1,1),(0,1),(0,0) = local (1,0)=glob(1,2)=d1, (1,1)=glob(1,3)=d6, (0,1)=glob(0,3)=d7, (0,0)=glob(0,2)=d8
// Children orientations: oSeq23[1]=A, oSeq23[6]=A, oSeq23[7]=A, oSeq23[8]=D
// So C's children = [A, A, A, D]

// step-1 cell (0,0) = block cols 0-1, rows 0-1 (A's child 2 = orient A)
// step-2 cells: (0,0)=10, (1,0)=11, (0,1)=9, (1,1)=0
// A visits (1,1),(0,1),(0,0),(1,0) = local (1,1)=glob(1,1)=d0, (0,1)=glob(0,1)=d9, (0,0)=glob(0,0)=d10, (1,0)=glob(1,0)=d11
// Children orientations: oSeq23[0]=A, oSeq23[9]=D, oSeq23[10]=D, oSeq23[11]=B
// So A's children (at this level) = [A, D, D, B]

// step-1 cell (1,0) = block cols 2-3, rows 0-1 (A's child 3 = orient B)
// step-2 cells: (2,0)=12, (3,0)=13, (2,1)=15, (3,1)=14
// B visits (0,0),(1,0),(1,1),(0,1) = local (0,0)=glob(2,0)=d12, (1,0)=glob(3,0)=d13, (1,1)=glob(3,1)=d14, (0,1)=glob(2,1)=d15
// Children orientations: oSeq23[12]=B, oSeq23[13]=B, oSeq23[14]=C, oSeq23[15]=A
// So B's children (at this level) = [B, B, C, A]

// Wait! A's children at level 1->2 were [B, C, A, B]
// But A's children at level 2->3 (from cell (0,0)) are [A, D, D, B]
// These are DIFFERENT! So the children rule depends on the level!?

// Let me also check B's children at both levels:
// Level 1->2: B appears at positions 0 and 3 of A.
//   Position 0 (cell(1,1)): children [A, D, B, B]
//   Position 3 (cell(1,0)): children [B, B, C, A]
// These are different too! B's children depend on position within parent!

// So the recursion is NOT a simple "orient -> children" mapping.
// It depends on the specific position within the tree.

// This means the curve cannot be generated by a simple recursive rule.
// The transformation applied to each sub-block depends on its depth AND position.

// Let me verify at one more level. For B at level 2->3:
// Look at step-2 cell pd=2 at (2,2), orient A from oSeq23.
// It's in step-1 cell (1,1)'s block, position 0 in B's visit order.
// Its children in step 3 are at (4,4),(5,4),(5,5),(4,5) (A visits (1,1),(0,1),(0,0),(1,0))
// Their d3 values: xy2d3['4,4']=54, xy2d3['4,5']=49, xy2d3['5,4']=55, xy2d3['5,5']=48
// A visits: (1,1)=d54, (0,1)=d49, (0,0)=... wait
// A: (1,1),(0,1),(0,0),(1,0) in local coords
// local (1,1) = global (4+1, 4+1) = (5,5) = d48
// local (0,1) = global (4+0, 4+1) = (4,5) = d49
// local (0,0) = global (4+0, 4+0) = (4,4) = d54
// local (1,0) = global (4+1, 4+0) = (5,4) = d55
// Children: oSeq34[48], oSeq34[49], oSeq34[54], oSeq34[55]

console.log('\nChecking A children at level 2->3:');
console.log(`oSeq34[48]=${oSeq34[48]}, oSeq34[49]=${oSeq34[49]}, oSeq34[54]=${oSeq34[54]}, oSeq34[55]=${oSeq34[55]}`);
// A's children at this occurrence: [oSeq34[48], oSeq34[49], oSeq34[54], oSeq34[55]]

// From the step1->step2 derivation, A at depth 1 has children [B, C, A, B]
// From the step2->step3 derivation (cell(0,0)), A at depth 2 has children [A, D, D, B]
// Now checking A at depth 3...

// If it keeps changing at each depth, we can't use a finite recursion.
// But wait - maybe it CONVERGES after the first couple of levels?

// Let me check all orient A occurrences at level 2->3:
console.log('\n=== All A-orient cells at step 2->3 ===');
for (let d2 = 0; d2 < 16; d2++) {
  if (oSeq23[d2] !== 'A') continue;
  const px = step2[d2].col;
  const py = step2[d2].row;

  // A visits (1,1),(0,1),(0,0),(1,0) in local
  const children = [];
  for (const lp of orientDefs.A) {
    const gx = px * 2 + lp.col;
    const gy = py * 2 + lp.row;
    const d3 = xy2d3[`${gx},${gy}`];
    children.push(oSeq34[d3]);
  }
  console.log(`  d2=${d2} at (${px},${py}): A children = [${children.join(',')}]`);
}

console.log('\n=== All B-orient cells at step 2->3 ===');
for (let d2 = 0; d2 < 16; d2++) {
  if (oSeq23[d2] !== 'B') continue;
  const px = step2[d2].col;
  const py = step2[d2].row;
  const children = [];
  for (const lp of orientDefs.B) {
    const gx = px * 2 + lp.col;
    const gy = py * 2 + lp.row;
    const d3 = xy2d3[`${gx},${gy}`];
    children.push(oSeq34[d3]);
  }
  console.log(`  d2=${d2} at (${px},${py}): B children = [${children.join(',')}]`);
}

console.log('\n=== All C-orient cells at step 2->3 ===');
for (let d2 = 0; d2 < 16; d2++) {
  if (oSeq23[d2] !== 'C') continue;
  const px = step2[d2].col;
  const py = step2[d2].row;
  const children = [];
  for (const lp of orientDefs.C) {
    const gx = px * 2 + lp.col;
    const gy = py * 2 + lp.row;
    const d3 = xy2d3[`${gx},${gy}`];
    children.push(oSeq34[d3]);
  }
  console.log(`  d2=${d2} at (${px},${py}): C children = [${children.join(',')}]`);
}

console.log('\n=== All D-orient cells at step 2->3 ===');
for (let d2 = 0; d2 < 16; d2++) {
  if (oSeq23[d2] !== 'D') continue;
  const px = step2[d2].col;
  const py = step2[d2].row;
  const children = [];
  for (const lp of orientDefs.D) {
    const gx = px * 2 + lp.col;
    const gy = py * 2 + lp.row;
    const d3 = xy2d3[`${gx},${gy}`];
    children.push(oSeq34[d3]);
  }
  console.log(`  d2=${d2} at (${px},${py}): D children = [${children.join(',')}]`);
}
