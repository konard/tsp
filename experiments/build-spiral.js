// Build the spiral path directly based on the observed pattern.
//
// From analyzing the move segments:
// Step 1 (n=2): L1 D1 R1
// Step 2 (n=4): U1 R2 U1 L3 D3 R3 U1 L1
// Step 3 (n=8): L3 D7 R7 U3 L5 D1 R4 D1 L5 U5 R5 D1 L4 D1 R5 U3 L3
// Step 4 (n=16): D1 R5 U3 L7 D3 L1 U4 R9 D4 R1 U5 L11 D5 L1 U6 R13 D6 R1 U7 L15 D15 R15 U7 L1 D6 L13 U6 R1 D5 R11 U5 L1 D4 L9 U4 R1 D3 R7 U3 L5 D1 R4 D1 L5 U5 R5 D1 L3
//
// For step 4, let me split into the outer frame and inner part:
// Outer frame (the big traverse): U7 L15 D15 R15 U7
// Before outer frame (inward spiral from center): D1 R5 U3 L7 D3 L1 U4 R9 D4 R1 U5 L11 D5 L1 U6 R13 D6 R1
// After outer frame (inward spiral back to center): L1 D6 L13 U6 R1 D5 R11 U5 L1 D4 L9 U4 R1 D3 R7 U3
// Inner zigzag: L5 D1 R4 D1 L5 U5 R5 D1 L3
//
// The "inward spiral from center" pattern:
// D1 R5 U3 L7 | D3 L1 U4 R9 | D4 R1 U5 L11 | D5 L1 U6 R13 | D6 R1 U7
// Groups of 4 moves (except the last which connects to the frame):
// Level 0: D1 R(n/2-3) U(n/4-1) L(n/2-1)
// Level 1: D(n/4-1) [L1|R1] U(n/4) R(n/2+1)... hmm too complex
//
// Let me think about this differently. The "spiral" has concentric rectangular tracks.
// From center outward, alternating direction on each track.
//
// Actually, let me look at the pattern as pairs of rows scanned in opposite directions:
//
// Step 3 (n=8):
// Row 7 (top): d=0-3 go LEFT from col 3 to 0, d=60-63 go LEFT from col 7 to 4
// Row 0 (bottom): d=10-17 go RIGHT from col 0 to 7
// Row 6: d=4 at col 0, d=41-46 go RIGHT from col 1 to 6, d=59 at col 7
// Row 1: d=9 at col 0, d=36-31 go LEFT from col 1 to 6, d=18 at col 7
// Row 5: d=5 at col 0, d=51-47 go LEFT from col 2 to 6, d=58 at col 7
// Row 2: d=8 at col 0, d=26-30 go RIGHT from col 2 to 6, d=19 at col 7
// Row 4: d=6 at col 0, d=52-56 go RIGHT from col 2 to 6, d=57 at col 7
// Row 3: d=7 at col 0, d=25-21 go LEFT from col 2 to 7, d=20 at col 7... 
// wait row 3: d=7 at col 0, then 38@col1, 25@col2, 24@col3, 23@col4, 22@col5, 21@col6, 20@col7

// Let me look at this with concentric "U"-shapes or rectangular spirals.
// Think of it as: the curve traces a RECTANGULAR SPIRAL from inside out, 
// but with TWO interlocked spirals (entering and exiting).
//
// ENTERING SPIRAL (first half, d=0 to ~31):
// d=0-3: Row 7 cols 3->0 (LEFT, top-left quarter of top row)
// d=4-9: Col 0 rows 6->1 (DOWN, left column except corners)
// d=10-17: Row 0 cols 0->7 (RIGHT, full bottom row)
// d=18-20: Col 7 rows 1->3 (UP, right col bottom half)
// d=21-25: Row 3 cols 6->2 (LEFT)
// d=26: Col 2 row 2 (DOWN 1)
// d=27-30: Row 2 cols 3->6 (RIGHT)
// d=31: Col 6 row 1 (DOWN 1)
// d=32-36: Row 1 cols 5->1 (LEFT)
//
// TRANSITION (going up the center column):
// d=37-41: Col 1 rows 2->6 (UP)
//
// EXITING SPIRAL (second half):
// d=42-46: Row 6 cols 2->6 (RIGHT)
// d=47: Col 6 row 5 (DOWN 1)
// d=48-51: Row 5 cols 5->2 (LEFT)
// d=52: Col 2 row 4 (DOWN 1)
// d=53-56: Row 4 cols 3->6 (RIGHT)
// d=57: Col 7... wait no, d=57 at (7,4)
// Actually d=53-56 goes to col 6, d=57=(7,4)
// d=57-60: Col 7 rows 4->7 (UP)
// d=61-63: Row 7 cols 6->4 (LEFT)

// So the structure is:
// 1. ENTER from center-top, go LEFT to corner
// 2. DOWN the left side
// 3. RIGHT across bottom
// 4. UP the right side (partial - to middle)
// 5. LEFT-DOWN-RIGHT-DOWN-LEFT zigzag INWARD (approaching col 1)
// 6. UP column 1 to near-top
// 7. RIGHT-DOWN-LEFT-DOWN-RIGHT zigzag OUTWARD (approaching col n-1)
// 8. UP column n-1 (remainder)
// 9. LEFT across top (right half)

// This is a "U" shape: enter on the left arm, traverse to the center,
// exit on the right arm. The two arms zigzag inward/outward between the
// vertical "columns" at col 1 and col n-2.

// Let me verify this structure works for step 4 too.
// Step 4 (n=16) first moves: D1 R5 U3 L7 ...
// Start at (6,9). D1 -> (6,8). R5 -> (11,8). U3 -> (11,11). L7 -> (4,11).
// That doesn't match the "enter from top, go left" pattern of step 3.

// Wait - step 4 starts at (6,9) which is in the CENTER of the 16x16 grid!
// Not at the top edge. So step 4's pattern is different from step 3.

// For step 3, start=(3,7) which IS the top edge (row 7 = top).
// For step 4, start=(6,9) which is near center.
// For step 2, start=(1,1) which is near center-bottom.
// For step 1, start=(1,1) which is top-right of a 2x2 grid.

// The start position varies! Let me compute what's consistent.
// Maybe the start is always at the same RELATIVE position within the
// self-similar inner structure?

// Step 1 (n=2): start=(1,1) - that's (n-1, n-1) in {0..n-1}
// Step 2 (n=4): start=(1,1) - NOT (3,3). It's at (1,1).
// Step 3 (n=8): start=(3,7) - that's (n/2-1, n-1)
// Step 4 (n=16): start=(6,9) - hmm, 6 = 16/2-2, 9 = 16/2+1

// These don't follow a simple pattern. Let me think recursively.
// If step N+1 is built by expanding step N, then each cell of step N
// becomes a 2x2 block in step N+1.
// The start of step N+1 should be within the 2x2 block that corresponds
// to the start of step N.

// Step 2 start = (1,1). This cell in step 3 = 2x2 block at (2-3, 2-3).
// Step 3 start = (3,7). Is (3,7) in block (2-3, 2-3)? NO, it's at row 7.

// Hmm. So it's NOT a simple quadtree expansion. The structure must be
// more complex.

// Let me go back to the direct construction approach.
// Maybe I should try to GENERATE the path algorithmically and compare.

// APPROACH: Generate the path as a rectangular spiral with specific rules.
// The path visits cells in a "U" or "tuning fork" pattern:
// - Two "prongs" of the U are at the top of the grid
// - The base of the U is at the bottom
// - Between the prongs, there are zigzag levels

// For step 3 (n=8), the actual traversal is:
// Prong 1 (left): top rows 7->enter, down col 0, bottom row 0
// Base: right across bottom, up right side
// Prong 2 (right): zigzag back up through center, complete top-right

// Let me try generating this with a simple algorithm.

function generateUFork(n) {
  if (n === 2) {
    return [{col:1,row:1}, {col:0,row:1}, {col:0,row:0}, {col:1,row:0}];
  }

  const path = [];
  const visited = Array.from({length:n}, () => Array(n).fill(false));
  
  function visit(col, row) {
    path.push({col, row});
    visited[row][col] = true;
  }
  
  const half = n / 2;
  
  // Phase 1: Start at (half-1, n-1), go LEFT to (0, n-1)
  for (let c = half - 1; c >= 0; c--) visit(c, n - 1);
  
  // Phase 2: Go DOWN from (0, n-2) to (0, 0)
  for (let r = n - 2; r >= 0; r--) visit(0, r);
  
  // Phase 3: Go RIGHT from (1, 0) to (n-1, 0)
  for (let c = 1; c < n; c++) visit(c, 0);
  
  // Phase 4: Go UP from (n-1, 1) to (n-1, half-1)
  for (let r = 1; r < half; r++) visit(n - 1, r);
  
  // Phase 5: Zigzag inward (left arm descent)
  // From (n-1, half-1), zigzag rows going inward toward col 1
  // Rows: half-1, half-2, ..., 1
  // Alternating: LEFT then RIGHT, with DOWN steps between
  let leftEdge = 2;
  let rightEdge = n - 2;
  let row = half - 1;
  let goingLeft = true;
  
  while (row >= 1 && leftEdge <= rightEdge) {
    if (goingLeft) {
      // Go LEFT from rightEdge to leftEdge
      for (let c = rightEdge; c >= leftEdge; c--) visit(c, row);
      // DOWN 1 step to (leftEdge, row-1) - but only if there's room
      if (row > 1) {
        row--;
        // Go RIGHT from leftEdge+1 to rightEdge
        for (let c = leftEdge + 1; c <= rightEdge; c++) visit(c, row); // Hmm wait, we need to go the other direction
      }
    }
    // This is getting complicated. Let me trace the actual step 3 pattern.
    break;
  }
  
  return path;
}

// Let me just trace step 3 exactly and find the pattern.
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

// Step 3 trace with phases marked:
console.log('=== Step 3 detailed trace ===');
const n = 8;
const half = 4;

// Phase 1: d=0-3: (3,7)(2,7)(1,7)(0,7) - LEFT from half-1 to 0 at row n-1
console.log('Phase 1 (L across top-left): d=0-3');

// Phase 2: d=4-10: (0,6)(0,5)(0,4)(0,3)(0,2)(0,1)(0,0) - DOWN col 0
console.log('Phase 2 (D col 0): d=4-10');

// Phase 3: d=11-17: (1,0)(2,0)(3,0)(4,0)(5,0)(6,0)(7,0) - RIGHT across bottom
// Wait, d=10=(0,0), d=11=(1,0)... but I originally had d=10 at (0,0)
// Let me recheck
for (let d = 0; d < 20; d++) {
  console.log(`  d=${d}: (${step3[d].col},${step3[d].row})`);
}

// OK so phase 1: d=0-3, 4 points (half points on top row)
// Phase 2: d=4-10, 7 points (n-1 down left col)  
// Phase 3: d=10-17, 8 points (n across bottom row)... wait d=10 is at (0,0)
// Actually d=10 is both the end of phase 2 AND start of phase 3?
// No - phase 2 goes from (0,6) to (0,0). That's 7 points (d=4 to d=10).
// Phase 3 goes from (1,0) to (7,0). That's 7 points (d=11 to d=17).

// Phase 4: d=18-20: (7,1)(7,2)(7,3) - UP col n-1, 3 points (half-1 rows)
// Phase 5 (zigzag inward):
// d=21-25: (6,3)(5,3)(4,3)(3,3)(2,3) - LEFT across row half-1
// d=26: (2,2) - DOWN 1
// d=27-30: (3,2)(4,2)(5,2)(6,2) - RIGHT across row half-2
// d=31: (6,1) - DOWN 1
// d=32-36: (5,1)(4,1)(3,1)(2,1)(1,1) - LEFT across row 1 to col 1
// Phase 6 (UP transition):
// d=37-41: (1,2)(1,3)(1,4)(1,5)(1,6) - UP col 1
// Phase 7 (zigzag outward):
// d=42-46: (2,6)(3,6)(4,6)(5,6)(6,6) - RIGHT across row n-2
// d=47: (6,5) - DOWN 1
// d=48-51: (5,5)(4,5)(3,5)(2,5) - LEFT across row n-3
// d=52: (2,4) - DOWN 1
// d=53-56: (3,4)(4,4)(5,4)(6,4) - RIGHT across row half
// d=57: (7,4) - RIGHT to col n-1
// Phase 8 (complete right side and top):
// d=58-60: (7,5)(7,6)(7,7) - UP col n-1
// d=61-63: (6,7)(5,7)(4,7) - LEFT to col half

console.log('\n=== Phase analysis ===');
// Let me formalize the zigzag phases.
// 
// ZIGZAG INWARD (Phase 5):
// The zigzag goes between row (half-1) and row 1, with col bounds shrinking:
// Row half-1: LEFT from col (n-2) to col 2 -- length n-3
// Step down to row half-2
// Row half-2: RIGHT from col (2+1)=3 to col (n-2) -- length n-5+1=n-4... 
// Hmm let me just count the cols.
//
// Row 3 (half-1): cols 6->2 (length 5 = n-3)
// Down to row 2
// Row 2: cols 3->6 (length 4 = n-4)
// Down to row 1
// Row 1: cols 5->1 (length 5 = n-3) -- reaches col 1!
//
// Actually in step 3, the inward zigzag has 3 row scans:
// row 3: L from col 6 to col 2 (5 cells)
// row 2: R from col 2 to col 6 (but starts at col 3, so 4 cells from col 3 to 6)
// Wait no, d=26=(2,2) then d=27=(3,2). So col goes 2->3->4->5->6.
// That's RIGHT from col 2 but it's the DOWN step that placed us at col 2.
// So row 2: R from col 3 to col 6 (4 cells, but after the D step at col 2)
// Then D to row 1 at col 6.
// Row 1: L from col 5 to col 1 (5 cells, ending at col 1)

// ZIGZAG OUTWARD (Phase 7):
// After going UP col 1 from row 2 to row 6:
// Row 6: R from col 2 to col 6 (5 cells)
// Down to row 5
// Row 5: L from col 5 to col 2 (4 cells)
// Down to row 4
// Row 4: R from col 3 to col 6 (4 cells)
// Then reaches col 7 (1 extra step RIGHT to n-1)

// So the zigzag pattern for n=8:
// INWARD: row direction start_col end_col
//   row 3: LEFT, 6->2
//   (down)
//   row 2: RIGHT, 3->6
//   (down)
//   row 1: LEFT, 5->1
//
// OUTWARD: 
//   row 6: RIGHT, 2->6
//   (down)
//   row 5: LEFT, 5->2
//   (down)
//   row 4: RIGHT, 3->6 (then +1 to col 7)

// I notice the inward zigzag ends at col 1, and the outward zigzag ends at col n-1.
// The transition goes UP col 1 from row 2 to row 6.
// The outward zigzag ends at col n-1, then goes UP col n-1 from row 4 to row 7.

// For step 4, the structure should be similar but with more levels.
// Let me verify by checking step 4's phases.

console.log('\n=== Step 4 trace analysis ===');
// Step 4 moves: D1 R5 U3 L7 D3 L1 U4 R9 D4 R1 U5 L11 D5 L1 U6 R13 D6 R1 U7 L15 D15 R15 U7 L1 D6 L13 U6 R1 D5 R11 U5 L1 D4 L9 U4 R1 D3 R7 U3 L5 D1 R4 D1 L5 U5 R5 D1 L3
// Start: (6,9)

// For step 4 (n=16, half=8):
// The start is (6,9) which is NOT at (half-1, n-1)=(7,15).
// Instead it's at (6,9) = (half-2, half+1).
// 
// This suggests step 4 starts in the CENTER of the grid, not at the top.
// The CENTER portion of step 4 has a self-similar structure!
//
// Step 4's center is a sub-problem. The outer rings are the "frame" 
// and the center 8x8 is a recursive instance of the same problem.
//
// But wait - step 3's center 4x4 has d=22-29 and d=48-55 (two groups),
// not a continuous block starting at d=0.
// However, step 4 starts at d=0 in the center!
//
// So maybe the recursion works differently at different levels.
// Or maybe the entire curve is defined by a SINGLE recursive function
// where at each level you:
// 1. Recursively fill the center (n/2 x n/2)
// 2. Then spiral outward to fill the surrounding ring

// Let me check: does step 4 fill its center 8x8 first (d=0 to some value),
// then the outer ring?
// From ring analysis: center 8x8 uses d=0-19 and d=212-255.
// That's NOT "center first" - it's split.
//
// d=0-19 goes into center, then d=20-211 fills outer rings, then d=212-255 back to center.
// So it enters the center, partially fills it, goes out to fill the frame,
// comes back, and finishes the center.
//
// This matches the "U" / "tuning fork" pattern:
// Enter center -> partial fill -> exit to frame -> traverse frame -> 
// re-enter center -> complete fill -> exit

// The number of cells: center has 64, frame has 192.
// d=0-19: 20 center cells (first arm of U in center)
// d=20-211: 192 frame cells (the frame)
// d=212-255: 44 center cells (second arm of U in center)
// Total: 20+192+44 = 256. Correct!

// And within the center 8x8, the 64 cells are visited as:
// First 20 (entering), then gap (frame), then 44 (exiting).
// The center's visit pattern should match step 3's pattern somehow.

// Let me check: within the center, what's the relative path?
// Extract center cells in step 4 order:
const centerPath4 = [];
for (let d = 0; d < 256; d++) {
  const p = step4[d];
  if (p.col >= 4 && p.col <= 11 && p.row >= 4 && p.row <= 11) {
    centerPath4.push({col: p.col - 4, row: p.row - 4, d});
  }
}
console.log('Center 8x8 path (relative coords):');
centerPath4.forEach(p => {
  console.log(`  real_d=${p.d}: (${p.col},${p.row})`);
});

// Compare with step 3 path:
console.log('\nStep 3 path:');
step3.forEach((p, d) => {
  console.log(`  d=${d}: (${p.col},${p.row})`);
});
