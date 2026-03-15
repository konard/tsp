// Complete U-fork algorithm.
//
// Structure:
// step 1 (n=2): hardcoded base case
// step 2 (n=4): hardcoded base case  
// step 3 (n=8): hardcoded base case
// step k (n=2^k, k>=4): recursive from step k-1
//   center = step(k-1) cycle, shifted by shift(k-1)
//   frame = boustrophedon spiral meander around center
//   Split center at the boundary crossing point
//   Full path = centerEntering + frame + centerExiting
//
// Actually, let me reconsider. Maybe I can generate ALL steps from a
// single algorithm without hardcoding base cases.
//
// The frame of step 4 has this structure:
// Starting from entry point (3,8) [col=quarter-1, row=half]:
//   1. Go UP quarter steps to row n-quarter (3,12)
//   2. Go RIGHT across to col n-quarter-1 (12,12), then back...
//   Actually let me trace it more carefully.
//
// Frame moves: U4 R9 D4 R1 U5 L11 D5 L1 U6 R13 D6 R1 U7 L15 D15 R15 U7 L1 D6 L13 U6 R1 D5 R11 U5 L1 D4 L9 U4
//
// Let me split into the "zigzag outward" part:
// From (3,8):
//   U4: (3,8)->(3,12)
//   R9: (3,12)->(12,12)  [cross to right side]
//   D4: (12,12)->(12,8)  [down back to middle]
//   R1: (12,8)->(13,8)   [step right]
//   U5: (13,8)->(13,13)
//   L11: (13,13)->(2,13)
//   D5: (2,13)->(2,8)
//   L1: (2,8)->(1,8)
//   U6: (1,8)->(1,14)
//   R13: (1,14)->(14,14)
//   D6: (14,14)->(14,8)
//   R1: (14,8)->(15,8)
//   U7: (15,8)->(15,15)
//
// The outer perimeter:
//   L15: (15,15)->(0,15)
//   D15: (0,15)->(0,0)
//   R15: (0,0)->(15,0)
//
// The "zigzag inward" part (mirror):
//   U7: (15,0)->(15,7)
//   L1: (15,7)->(14,7)
//   D6: (14,7)->(14,1)
//   L13: (14,1)->(1,1)
//   U6: (1,1)->(1,7)
//   R1: (1,7)->(2,7)
//   D5: (2,7)->(2,2)
//   R11: (2,2)->(13,2)
//   U5: (13,2)->(13,7)
//   L1: (13,7)->(12,7)
//   D4: (12,7)->(12,3)
//   L9: (12,3)->(3,3)
//   U4: (3,3)->(3,7)
//
// Exit to center at (3,7) -> (4,7).
//
// BEAUTIFUL! The pattern is:
// Zigzag outward:
//   Level 0: U(q) R(n-q-q+1) D(q)  [go up, across right, down]
//   R1 [step right]
//   Level 1: U(q+1) L(n-q-q+3) D(q+1)  [up, across left, down]
//   L1 [step left]
//   Level 2: U(q+2) R(n-q-q+5) D(q+2)  [up, across right, down]
//   R1 [step right]
//   Level 3: U(q+3) [up to corner]
//
// Outer perimeter: L(n-1) D(n-1) R(n-1)
//
// Zigzag inward (mirror):
//   U(q+3) [up from bottom]
//   L1
//   D(q+2) L(n-q-q+5) U(q+2)
//   R1
//   D(q+1) R(n-q-q+3) U(q+1)
//   L1
//   D(q) L(n-q-q+1) U(q)
//
// Where q = quarter = n/4.
//
// Wait, let me verify with n=16, q=4:
// Level 0: U4 R(16-8+1=9) D4. YES: U4 R9 D4.
// R1. YES.
// Level 1: U5 L(16-8+3=11) D5. YES: U5 L11 D5.
// L1. YES.
// Level 2: U6 R(16-8+5=13) D6. YES: U6 R13 D6.
// R1. YES.
// Level 3: U7. YES: U7.
// Outer: L15 D15 R15. YES.
// Inward: U7 L1 D6 L13 U6 R1 D5 R11 U5 L1 D4 L9 U4. YES!
//
// The pattern for the zigzag has q-1 = 3 "levels" (0, 1, 2) plus
// level 3 which only has the final U.
//
// General formula for n with q = n/4:
// Outward zigzag (q-1 full levels):
//   For level i = 0, 1, ..., q-2:
//     direction = (i%2==0) ? R : L
//     vert = q + i
//     horiz = n - 2*q + 1 + 2*i = n/2 + 1 + 2*i
//     U(vert) dir(horiz) D(vert)
//     step: (i%2==0) ? R1 : L1
//   Final up: U(q + q-1) = U(2q-1) = U(n/2-1)
//
// Outer perimeter: L(n-1) D(n-1) R(n-1)
//
// Inward zigzag (mirror of outward):
//   Final up: U(2q-1) = U(n/2-1)
//   For level i = q-2, q-3, ..., 0:
//     step: (i%2==0) ? L1 : R1  (opposite of outward!)
//     direction = (i%2==0) ? L : R  (opposite of outward!)
//     D(q+i) dir(n/2+1+2*i) U(q+i)
//   Final: the path ends at (quarter-1, half-1) = (q-1, 2q-1)

// Wait, the inward starts with U(2q-1) not matching the end of outer R(n-1).
// R(n-1) goes from (0,0) to (n-1,0). Then U(2q-1) from (n-1,0) to (n-1,2q-1)=(n-1,n/2-1).
// Then L1 to (n-2,n/2-1). Then D(n/2-2) L(n-2-something)... let me re-check.

// For n=16, after R15: at (15,0).
// U7: (15,0) -> (15,7). Good, 2q-1=7.
// L1: (15,7) -> (14,7).
// D6: (14,7) -> (14,1).  6 = q+2 = 4+2.
// L13: (14,1) -> (1,1). 13 = n/2+1+2*2 = 8+5 = 13. Yes!
// U6: (1,1) -> (1,7). 
// R1: (1,7) -> (2,7).
// D5: (2,7) -> (2,2). 5 = q+1 = 5.
// R11: (2,2) -> (13,2). 11 = n/2+1+2*1 = 11. Yes!
// U5: (13,2) -> (13,7).
// L1: (13,7) -> (12,7).
// D4: (12,7) -> (12,3). 4 = q+0 = 4.
// L9: (12,3) -> (3,3). 9 = n/2+1+2*0 = 9. Yes!
// U4: (3,3) -> (3,7).

// Great! Now let me also verify with step 3's frame.
// Step 3 (n=8, q=2):
// Frame of step 3 has 48 cells. But step 3's frame is split into 3 parts.
// Actually, step 3 is itself a single level (no previous step to embed).
// 
// Let me check: if I apply this frame algorithm to step 3 (treating it
// as the ENTIRE path, not just the frame):
// step 3 moves: L3 D7 R7 U3 L5 D1 R4 D1 L5 U5 R5 D1 L4 D1 R5 U3 L3
// Starting at (3,7):
// L3: (3,7) -> (0,7). That's LEFT half-1=3 steps.
// D7: (0,7) -> (0,0). That's DOWN n-1=7 steps.
// R7: (0,0) -> (7,0). That's RIGHT n-1=7 steps.
// U3: (7,0) -> (7,3). That's UP half-1=3 steps.
// These are the "outer perimeter" (3 full sides + partial).
// Then: L5 D1 R4 D1 L5 U5 R5 D1 L4 D1 R5 U3 L3
// This is the "zigzag" part.
//
// For n=8, q=2, the zigzag should be:
// Outward: q-1=1 full level:
//   Level 0: U(2) R(5) D(2)  [n/2+1+0=5]
//   R1
//   Final up: U(3)
// Outer: L(7) D(7) R(7)
// Inward: U(3) L1 D(2) L(5) U(2)
// 
// But step 3 starts differently:
// L3 D7 R7 U3 ... this is the partial left + 3 sides of outer perimeter
// Then zigzag.
//
// For step 3 (where the center IS the inner part, not an embedded previous step):
// The structure is:
// Start at (half-1, n-1) = (3,7).
// Phase A: L(half-1) = L3 to reach corner (0,7)
// Phase B: Outer perimeter - D(n-1) R(n-1) = D7 R7
// Phase C: UP to middle = U(half-1) = U3 to reach (7,3)
// Phase D: Inward zigzag
// Phase E: UP center column
// Phase F: Outward zigzag
// Phase G: UP remainder of right col + LEFT across top
//
// From step 3 moves after U3: L5 D1 R4 D1 L5 U5 R5 D1 L4 D1 R5 U3 L3
// This is: L5 D1 R4 D1 L5 | U5 | R5 D1 L4 D1 R5 | U3 L3
//
// Hmm, this has a different structure from the frame in step 4.
// In step 4, the frame is the zigzag spiral AROUND the center.
// In step 3, the ENTIRE path is: outer_perimeter + center_zigzag.
//
// The "center zigzag" in step 3 is what becomes the "center + frame" in step 4.
// This is confusing. Let me think about it differently.

// NEW APPROACH: Forget about center vs frame decomposition.
// Just directly generate the path using the zigzag spiral pattern.
// The FULL PATH for any n x n grid (n = 2^k, k >= 1) follows this pattern:

// For n=2 (step 1):
// (1,1) -> (0,1) -> (0,0) -> (1,0)
// = L1 D1 R1
// Start: (1,1), End: (1,0)

// For n=4 (step 2):
// Start at (1,1). Moves: U1 R2 U1 L3 D3 R3 U1 L1
// This is: UP to row 2, RIGHT to (3,2), UP to (3,3), LEFT across top row,
// DOWN left col, RIGHT across bottom, UP, LEFT back.
//
// Hmm, step 2 doesn't start at (n/2-1, n-1)=(1,3) like step 3 does.
// step 2 starts at (1,1) which is more center-ish.

// And step 4 starts at (6,9). 
// Step 3 starts at (3,7) = (n/2-1, n-1).
// Step 4 starts at (6,9) = center of step 3 shifted.

// OK so step 3 IS special - it's the first step that starts at the top edge.
// Steps 4+ start in the center (because they embed the previous step's cycle).

// What if steps 1, 2, 3 are all special base cases?
// Then for step 4: center = step3(shifted) + frame_spiral
// For step 5: center = step4(shifted) + frame_spiral
// 
// The frame spiral algorithm works the same for all levels >= 4.
// Steps 1-3 are hardcoded.

// Let me try generating step 3 first from the frame algorithm to verify.
// If the frame algorithm works for step 3 treated as a single spiral,
// then maybe ALL steps can be generated directly (without recursion).

// The step 3 path can be decomposed as:
// 1. Start at (half-1, n-1) = (3,7)
// 2. L(half-1): go left to (0,7)
// 3. D(n-1): go down to (0,0)
// 4. R(n-1): go right to (7,0)
// 5. UP from right edge, zigzag inward to left edge
// 6. UP left edge
// 7. Zigzag outward to right edge
// 8. UP right edge to top
// 9. L(half-1): go left to (half, n-1)

// Steps 5-9 are the "inner zigzag" pattern.
// From step 3 after the outer perimeter (U3 at d=17-20):
// We're at (7,3). Then:
// L5: (7,3)->(2,3)
// D1: (2,3)->(2,2)
// R4: (2,2)->(6,2)
// D1: (6,2)->(6,1)
// L5: (6,1)->(1,1)
// U5: (1,1)->(1,6)
// R5: (1,6)->(6,6)
// D1: (6,6)->(6,5)
// L4: (6,5)->(2,5)
// D1: (2,5)->(2,4)
// R5: (2,4)->(7,4)
// U3: (7,4)->(7,7)
// L3: (7,7)->(4,7)

// So the zigzag inward:
// L5 D1 R4 D1 L5 [reached col 1]
// Then UP col 1: U5 [from row 1 to row 6]
// Then zigzag outward:
// R5 D1 L4 D1 R5 [reached col 7]
// Then UP col 7: U3 [from row 4 to row 7]
// Then L3 [from col 7 to col 4]

// The zigzag has:
// Inward: L5 D1 R4 D1 L5 (3 scans: 5, 4, 5 cells)
// Outward: R5 D1 L4 D1 R5 (3 scans: 5, 4, 5 cells)
// These are MIRROR images of each other!

// For n=8, q=n/4=2:
// Inward zigzag scans: 
//   Row 3: L from col 6 to col 2 (5 = n-3)
//   Down 1
//   Row 2: R from col 3 to col 6 (4 = n-4)  [wait: from (2,2) R4 = (2,2)->(3,2)->(4,2)->(5,2)->(6,2)]
//   Hmm that's from col 2 right by 4 cells to col 6. So 4 cells = n-4.
//   Down 1
//   Row 1: L from col 6 to col 1 (5 cells = n-3... but wait: (6,1) L5 = (6,1)->(5,1)->(4,1)->(3,1)->(2,1)->(1,1))
//   That's 5 cells from col 6 to col 1.
//
// Outward zigzag scans:
//   Row 6: R from col 2 to col 6 (5 cells)
//   Down 1
//   Row 5: L from col 6 to col 2 (4 cells: (6,5)->(5,5)->(4,5)->(3,5)->(2,5) = 4 cells)
//   Hmm wait: (6,5) L4 = (6,5)->(5,5)->(4,5)->(3,5)->(2,5). That's 4 cells to col 2.
//   Down 1
//   Row 4: R from col 3 to col 7 (5 cells: (2,4) R5 = (2,4)->(3,4)->(4,4)->(5,4)->(6,4)->(7,4))
//   Hmm that's from col 2 right by 5 to col 7. Wait: (2,4) starts, R5 goes to (7,4).
//   Actually from (2,4), R5 means move right 5 times: (3,4),(4,4),(5,4),(6,4),(7,4).
//   So col 3 to col 7, which is 5 cells = half-1 + (q-1)*2 + 1

// OK I think the pattern is clear enough. Let me just code it up and test.

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

const step1 = toGrid(parseSvgPath(readFileSync('target-svgs/tsp-tour-4.svg', 'utf8')));
const step2 = toGrid(parseSvgPath(readFileSync('target-svgs/tsp-tour-3.svg', 'utf8')));
const step3 = toGrid(parseSvgPath(readFileSync('target-svgs/tsp-tour-2.svg', 'utf8')));
const step4 = toGrid(parseSvgPath(readFileSync('target-svgs/tsp-tour-5.svg', 'utf8')));

function generateStep3(n) {
  // n must be 8 for step 3
  const path = [];
  let x, y;
  
  function moveTo(col, row) { path.push({col, row}); x = col; y = row; }
  function move(dx, dy, steps) {
    for (let i = 0; i < steps; i++) { x += dx; y += dy; path.push({col: x, row: y}); }
  }
  
  const half = n / 2; // 4
  
  // Start at (half-1, n-1)
  moveTo(half - 1, n - 1);
  
  // Outer perimeter: L, D, R
  move(-1, 0, half - 1);  // L to (0, n-1)
  move(0, -1, n - 1);     // D to (0, 0)
  move(1, 0, n - 1);      // R to (n-1, 0)
  
  // UP right side to middle
  move(0, 1, half - 1);   // U to (n-1, half-1)
  
  // Zigzag inward (from right edge toward col 1)
  // q-1 = 1 zigzag level for n=8 (q=2)
  // But step 3 has more zigzag levels...
  // Let me count: L5 D1 R4 D1 L5 = 3 scans = half-1 = 3 scans
  // Then U5 = go up col 1
  // Then R5 D1 L4 D1 R5 = 3 scans
  // Then U3 L3 = complete
  
  // Actually, the number of zigzag levels in the inward part is half/2 - 1 = 1 for n=8.
  // But there are 3 row scans (rows 3, 2, 1 for the inward part).
  // These 3 scans cover rows from half-1 down to 1.
  
  // Inward zigzag:
  // Start at (n-1, half-1). Go LEFT.
  // Row half-1 (row 3): L from n-2 to 2 (n-3 = 5 cells)
  // D1
  // Row half-2 (row 2): R from 3 to n-2 (n-4 = 4 cells... wait that's from col 3 to col 6)
  // Actually from (2,2) we go R4 to (6,2). Starting at col 2, going to col 6.
  // Hmm the col we arrive at after D1 determines the start of the next scan.
  
  // Let me just directly encode the zigzag:
  // Inward: rows from half-1 down to 1.
  // First row (half-1): LEFT from (n-2, half-1) to (2, half-1). 
  //   Width = n-2-2+1 = n-3 = 5 for n=8.
  //   But wait: we're at (n-1, half-1) and need to go LEFT. So from col n-2 to... 
  //   Actually from (7,3), L5 goes to (2,3). That's from col 7-1=6 down to col 2.
  //   Width 5 = 6-2+1 = 5.
  //   Hmm, we start at (7,3) which is col 7. L5 means 5 steps left: (6)(5)(4)(3)(2).
  //   So we go from col 7 to col 2 by taking 5 steps. New col = 2.
  // 
  // D1: to row 2, col 2.
  //
  // Row half-2: RIGHT from (3, half-2) to (n-2, half-2).
  //   We're at (2,2), go R4: (3)(4)(5)(6). To col 6.
  //   Width 4. From col 3 to col 6.
  //
  // D1: to row 1, col 6.
  //
  // Row 1: LEFT from col 5 to col 1.
  //   We're at (6,1), go L5: (5)(4)(3)(2)(1). To col 1.
  //   Width 5.
  //
  // Then UP col 1 from row 2 to row n-2:
  // U5: (1,2)(1,3)(1,4)(1,5)(1,6). From row 2 to row 6. = n-2-1 = 5 cells.
  //
  // Outward zigzag:
  // Row n-2 (row 6): RIGHT from (2, n-2) to (n-2, n-2).
  //   R5: (2)(3)(4)(5)(6). Width 5.
  //
  // D1: to row n-3 (row 5), col n-2 (6).
  //
  // Row n-3 (row 5): LEFT from col n-3 to col 2.
  //   L4: (5)(4)(3)(2). Width 4.
  //
  // D1: to row n-4 (row 4), col 2.
  //
  // Row half (row 4): RIGHT from col 3 to col n-1.
  //   R5: (3)(4)(5)(6)(7). To col n-1!
  //
  // UP from (n-1, half) to (n-1, n-1):
  //   U3: to (7,7). = half-1 = 3.
  //
  // LEFT across top row right half:
  //   L3: (6)(5)(4). To col half = 4. = half-1 = 3.
  //
  // End at (half, n-1) = (4, 7).
  
  // Generalizing: for n=2^k, the zigzag has half-1 row scans in each direction.
  
  // INWARD zigzag (from col n-1 side toward col 1):
  // Rows from half-1 down to 1.
  // Number of rows: half-1.
  // Each pair of consecutive scans forms one "level" of the zigzag.
  // For half-1 rows, there are ceil((half-1)/2) levels? No...
  // For n=8, half=4, half-1=3 rows: rows 3, 2, 1. Scans: L, R, L.
  // 3 scans = 3 rows.
  
  // For n=16, what would the inward zigzag be?
  // half=8, rows from 7 down to 1 = 7 rows.
  // Scans would be: L, R, L, R, L, R, L (7 scans).
  // But step 4 uses a different structure (the frame, not the full path).
  
  // Actually, step 3 IS a direct construction. Let me verify my algorithm.
  
  // For n=8:
  // half=4. Start at (3,7).
  // Phase 1: L3 to (0,7). 
  // Phase 2: D7 to (0,0).
  // Phase 3: R7 to (7,0).
  // Phase 4: U3 to (7,3).
  // Phase 5 (inward zigzag, rows 3 down to 1):
  //   Row 3: L5 from (7,3) to (2,3).
  //   D1 to (2,2).
  //   Row 2: R4 from (2,2) to (6,2).
  //   D1 to (6,1).
  //   Row 1: L5 from (6,1) to (1,1).
  // Phase 6: U5 from (1,1) to (1,6). (UP col 1, from row 2 to row n-2)
  //   Wait: from (1,1) we go UP to (1,6). That's 5 steps = n-2-1 = 5.
  // Phase 7 (outward zigzag, rows n-2 down to half):
  //   Row 6: R5 from (1,6) to (6,6).
  //   D1 to (6,5).
  //   Row 5: L4 from (6,5) to (2,5).
  //   D1 to (2,4).
  //   Row 4: R5 from (2,4) to (7,4).
  // Phase 8: U3 from (7,4) to (7,7). (UP col n-1, rows half to n-1)
  // Phase 9: L3 from (7,7) to (4,7). (LEFT across top, cols n-1 to half)

  // Now let me code this and verify.
  path.length = 0; // reset
  
  moveTo(half - 1, n - 1);
  
  // Phase 1: L across top-left
  move(-1, 0, half - 1);
  
  // Phase 2: D left column
  move(0, -1, n - 1);
  
  // Phase 3: R across bottom
  move(1, 0, n - 1);
  
  // Phase 4: U right column to middle
  move(0, 1, half - 1);
  
  // Phase 5: Inward zigzag (rows half-1 down to 1)
  // Current position: (n-1, half-1)
  let curRow = half - 1;
  let leftLimit = 2;
  let rightLimit = n - 2;
  let goLeft = true;
  
  for (let row = half - 1; row >= 1; row--) {
    if (goLeft) {
      // LEFT from current col to leftLimit
      const steps = x - leftLimit;
      move(-1, 0, steps);
    } else {
      // RIGHT from current col to rightLimit
      const steps = rightLimit - x;
      move(1, 0, steps);
    }
    
    if (row > 1) {
      // D1
      move(0, -1, 1);
    }
    
    goLeft = !goLeft;
  }
  
  // Phase 6: UP col 1 from current row to n-2
  move(0, 1, (n - 2) - y);
  
  // Phase 7: Outward zigzag (rows n-2 down to half)
  goLeft = false; // start going RIGHT
  for (let row = n - 2; row >= half; row--) {
    if (!goLeft) {
      // RIGHT from current col to rightLimit
      const steps = rightLimit - x;
      move(1, 0, steps);
    } else {
      // LEFT from current col to leftLimit
      const steps = x - leftLimit;
      move(-1, 0, steps);
    }
    
    if (row > half) {
      // D1
      move(0, -1, 1);
    }
    
    goLeft = !goLeft;
  }
  
  // After outward zigzag, we should be at some col on row half.
  // For n=8: at (7,4).
  // Need to be at col n-1. Let me check.
  // For n=8: outward zigzag rows 6, 5, 4.
  // Row 6: R5 to col 6. (rightLimit=6, starting from col 1+1=2... wait no, after U5 we're at (1,6))
  // Starting at (1,6): R5 to (6,6). OK so rightLimit is 6.
  // D1 to (6,5). Row 5: L4 from (6,5) to (2,5). leftLimit=2. Then D1 to (2,4).
  // Row 4: R5 from (2,4) to (7,4). But rightLimit is 6, not 7!
  
  // The LAST row of outward zigzag goes to col n-1, not col rightLimit!
  // This is special behavior. Let me adjust.
  
  console.log('After phase 7, position:', x, y);
  console.log('Expected: (7, 4)');
  
  // Phase 8: UP right column
  // If we're at (n-2, half) instead of (n-1, half), we need to adjust.
  // The last outward row goes one extra step to col n-1.
  
  return path;
}

const gen3 = generateStep3(8);
console.log('Generated:', gen3.length, 'cells');
console.log('Step 3 has:', step3.length, 'cells');

// Check first 25 cells
let correct = true;
for (let i = 0; i < Math.min(gen3.length, step3.length); i++) {
  if (gen3[i].col !== step3[i].col || gen3[i].row !== step3[i].row) {
    console.log(`MISMATCH at d=${i}: gen=(${gen3[i].col},${gen3[i].row}) target=(${step3[i].col},${step3[i].row})`);
    correct = false;
    break;
  }
}
if (correct) console.log('All cells match!');
