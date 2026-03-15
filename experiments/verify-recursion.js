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

const step2 = toGrid(parseSvgPath(readFileSync('target-svgs/tsp-tour-3.svg', 'utf8')));
const step3 = toGrid(parseSvgPath(readFileSync('target-svgs/tsp-tour-2.svg', 'utf8')));
const step4 = toGrid(parseSvgPath(readFileSync('target-svgs/tsp-tour-5.svg', 'utf8')));

// Verify: center 8x8 of step 4 = step 3 (same coordinates!)
console.log('=== Verify center of step 4 matches step 3 ===');
const centerPath4 = [];
for (let d = 0; d < 256; d++) {
  const p = step4[d];
  if (p.col >= 4 && p.col <= 11 && p.row >= 4 && p.row <= 11) {
    centerPath4.push({col: p.col - 4, row: p.row - 4, origD: d});
  }
}

let allMatch = true;
for (let i = 0; i < 64; i++) {
  const center = centerPath4[i];
  const target = step3[i];
  if (center.col !== target.col || center.row !== target.row) {
    console.log(`MISMATCH at rank ${i}: center=(${center.col},${center.row}) d=${center.origD}, step3=(${target.col},${target.row})`);
    allMatch = false;
  }
}
if (allMatch) console.log('PERFECT MATCH! Center of step4 = step3 (offset by (4,4))');

// Now verify: center 4x4 of step 3 = step 2
console.log('\n=== Verify center of step 3 matches step 2 ===');
const centerPath3 = [];
for (let d = 0; d < 64; d++) {
  const p = step3[d];
  if (p.col >= 2 && p.col <= 5 && p.row >= 2 && p.row <= 5) {
    centerPath3.push({col: p.col - 2, row: p.row - 2, origD: d});
  }
}

console.log(`Center 4x4 of step 3 has ${centerPath3.length} cells`);
let allMatch2 = true;
for (let i = 0; i < 16; i++) {
  const center = centerPath3[i];
  const target = step2[i];
  if (center.col !== target.col || center.row !== target.row) {
    console.log(`MISMATCH at rank ${i}: center=(${center.col},${center.row}) d=${center.origD}, step2=(${target.col},${target.row})`);
    allMatch2 = false;
  }
}
if (allMatch2) console.log('PERFECT MATCH! Center of step3 = step2 (offset by (2,2))');

// Now the critical question: what is the "frame" between the two halves of the center?
// For step 3: center 4x4 first half d=22-29, frame, center second half d=48-55
// The "entry point" into the frame from center: after d=29 at (5,2) -> next d=30 at (6,2)
// The "exit point" from frame back to center: d=47 at (6,5) -> d=48 at (5,5)

// For step 4: center first half d=0-19, frame d=20-211, center second half d=212-255
// Entry into frame: d=19 at (4+0,4+4)=(4,8) in global, local (0,4) -> d=20 at (3,8) in global

// So the split point in the center path is:
// Step 3: after 10 cells out of 16 center cells (10/16 = 62.5%)
// Wait, let me count. d=22-29 = 8 cells (entering). d=48-55 = 8 cells (exiting). Total 16.
// Entering = 8, exiting = 8. Split at 50%.

// Step 4: d=0-19 = 20 cells (entering), d=212-255 = 44 cells (exiting). Total 64.
// 20+44 = 64. But 20/64 = 31.25% and 44/64 = 68.75%.
// That's NOT 50/50.

// Hmm, let me reconsider. For the step 3 center:
// The center cells visited are (in order): d=22-29 and d=48-55.
// d=22-29: 8 cells. d=48-55: 8 cells.
// Split at rank 8 (out of 16) = exactly half.

// For step 4 center:
// d=0-19: 20 cells. d=212-255: 44 cells.
// Split at rank 20 (out of 64). 20/64 is NOT half.

// But wait - looking at the step 3 path:
// d=0-21: cells NOT in center (outer frame first half)
// d=22-29: center first half (8 cells)
// d=30-47: cells NOT in center (outer frame second half?)
// d=48-55: center second half (8 cells)
// d=56-63: cells NOT in center

// Hmm so in step 3, the outer frame is split into 3 parts: d=0-21, d=30-47, d=56-63.
// While in step 4, the outer frame is one contiguous block: d=20-211.
// That's a structural difference!

// Let me look at step 3's frame more carefully.
console.log('\n=== Step 3 frame structure ===');
for (let d = 0; d < 64; d++) {
  const p = step3[d];
  const inCenter = p.col >= 2 && p.col <= 5 && p.row >= 2 && p.row <= 5;
  if (!inCenter) {
    process.stdout.write(`${d} `);
  } else {
    process.stdout.write(`[${d}] `);
  }
}
console.log();

console.log('\n=== Step 4 frame structure ===');
for (let d = 0; d < 256; d++) {
  const p = step4[d];
  const inCenter = p.col >= 4 && p.col <= 11 && p.row >= 4 && p.row <= 11;
  if (!inCenter) {
    process.stdout.write(`${d} `);
  } else {
    process.stdout.write(`[${d}] `);
  }
  if ((d+1) % 32 === 0) console.log();
}
console.log();

// Key question: WHERE does the path exit the center to traverse the frame,
// and where does it re-enter?
console.log('\n=== Center entry/exit points for step 3 ===');
for (let d = 0; d < 63; d++) {
  const p = step3[d];
  const pn = step3[d+1];
  const inC = p.col >= 2 && p.col <= 5 && p.row >= 2 && p.row <= 5;
  const inCn = pn.col >= 2 && pn.col <= 5 && pn.row >= 2 && pn.row <= 5;
  if (inC !== inCn) {
    console.log(`  d=${d}->${d+1}: (${p.col},${p.row})[${inC?'C':'F'}] -> (${pn.col},${pn.row})[${inCn?'C':'F'}]`);
  }
}

console.log('\n=== Center entry/exit points for step 4 ===');
for (let d = 0; d < 255; d++) {
  const p = step4[d];
  const pn = step4[d+1];
  const inC = p.col >= 4 && p.col <= 11 && p.row >= 4 && p.row <= 11;
  const inCn = pn.col >= 4 && pn.col <= 11 && pn.row >= 4 && pn.row <= 11;
  if (inC !== inCn) {
    console.log(`  d=${d}->${d+1}: (${p.col},${p.row})[${inC?'C':'F'}] -> (${pn.col},${pn.row})[${inCn?'C':'F'}]`);
  }
}

// Now check: does the frame path of step 4 match step 3's frame path?
// I.e., is the frame of step N+1 a scaled version of step N's frame?
console.log('\n=== Frame path comparison ===');
const frame4 = [];
for (let d = 20; d <= 211; d++) {
  frame4.push({col: step4[d].col, row: step4[d].row});
}

// The frame of step 4 spans rows 0-15, cols 0-15, excluding the center 8x8.
// It has 256-64 = 192 cells.
// Step 3 has 64 cells total.
// The ratio is 3:1. This doesn't directly correspond.

// Let me think about this differently. The recursion is:
// generatePath(n):
//   if n == 2: return base case
//   inner = generatePath(n/2) with coords offset by (n/4, n/4)
//   Split inner into enterPart and exitPart at a specific point
//   frame = generate the frame traversal for the outer n/4 ring
//   return enterPart + frame + exitPart

// The split point: where does the inner path transition from "entering" to "exiting"?
// For step 3 inner: enters 8, exits 8. Split at the halfway point of inner.
// For step 4 inner: enters 20, exits 44. Split at... 

// Wait, 20 is NOT half of 64. Let me check if 20 corresponds to a specific
// position in step 3.

// Step 3 d=0-19 covers cells from (3,7) to (7,2).
// The corresponding position in step 4's center is (2,5) to (0,4) at d=0-19.

// At d=19, step 3 is at (7,2). But step 4's center d=19 is at (0,4).
// These are DIFFERENT positions! This contradicts my earlier "perfect match" finding.

// Wait no - let me re-check. I verified that center of step 4 matches step 3
// by comparing centerPath4[i] with step3[i]. centerPath4 is ordered by 
// appearance in step 4 (i.e., by step 4's d-value). So centerPath4[0] is 
// the first center cell visited in step 4, and it should match step3[0].

// But the split point in step 4 is at rank 20 (after 20 center cells), 
// while in step 3 the split point should be where the frame traversal happens.
// Since step 3 IS the center path (no frame above it), step 3 has NO split.
// The split only happens when step 3 is EMBEDDED as the center of step 4.

// So the question is: at what point in step 3's path does the "frame of step 4" 
// get inserted?
// Answer: after step3[19] = (7,2), which is at d=19 in step 3.
// After visiting (7,2), step 3 would go to (7,3) at d=20.
// But in step 4, after visiting the corresponding center cell at 
// (7+4,2+4)=(11,6), it exits to the frame instead.

// So the split is: the first 20 points of step 3 are the "entering" part,
// and points 20-63 are the "exiting" part. The frame is inserted between them.

// Looking at step 3's d=19: (7,2) -> d=20: (7,3).
// The step from (7,2) to (7,3) goes UP at the right edge.
// In step 4, instead of going UP to (11,7), the path exits the center
// to the frame at (3,8) which is outside the center.

// What is special about d=19 in step 3? It's at position (7,2) which is
// at the RIGHT edge (col 7 = n-1) of the grid.
// At this point, the path has traversed the outer perimeter of the grid.
// d=20 starts the "inner zigzag".

// So the split point is: the end of the outer perimeter traversal!
// Phase 1-4 (outer perimeter) = d=0-19 for step 3 (n=8)
// = half + (n-1) + (n-1) + (half-1) = 4+7+7+3 = 21... 
// wait that's 21 moves = 22 points (d=0 to d=21 inclusive).
// But the outer perimeter in step 3 ends at d=20 (7,3), not d=19.

// Hmm, d=0 is at (3,7). The path goes:
// d=0-3: 4 points LEFT across top (half points)
// d=3-10: 8 points DOWN left column (7+1 with the corner)
// Actually d=3 is (0,7), d=4 is (0,6)... d=10 is (0,0). That's 7 moves down.
// d=10-17: 7 moves RIGHT across bottom.
// d=17-20: 3 moves UP right column.
// d=20 is at (7,3). So d=0 through d=20 = 21 points is the outer C-shape.
// Then d=21 starts the zigzag.

// But the split is at rank 20 (0-indexed), meaning the first 20 center cells
// of step 4 are step3[0] through step3[19].
// d=19 in step 3 is at (7,2). d=20 is at (7,3).
// So the split is at d=19, which is the second-to-last point of phase 4 (UP right col).

// Let me check: step3[19] = (7,2), step3[20] = (7,3).
// In step 4, the center cell at step 4's d=19 is (0,4) in local coords.
// step3[19] = (7,2). So center4[19] should be (7,2). Let me verify.
console.log('\ncenterPath4[19]:', centerPath4[19]);
console.log('step3[19]:', step3[19]);
console.log('centerPath4[20]:', centerPath4[20]);
console.log('step3[20]:', step3[20]);

// After d=19 (step 3), the path is at (7,2) = right edge, row 2.
// The step from (7,2) to (7,3) stays on the right edge going UP.
// In step 4, the corresponding center position is (11,6) in global.
// But the step 4 path at d=19 is at (4,8) = local (0,4).
// That doesn't match (7,2)!

// There's a discrepancy. Let me re-verify the "perfect match" claim.
console.log('\n=== Re-verify centerPath4 vs step3 ===');
for (let i = 0; i < 5; i++) {
  console.log(`i=${i}: center4=(${centerPath4[i].col},${centerPath4[i].row}) step3=(${step3[i].col},${step3[i].row})`);
}
console.log('...');
for (let i = 19; i < 22; i++) {
  console.log(`i=${i}: center4=(${centerPath4[i].col},${centerPath4[i].row}) step3=(${step3[i].col},${step3[i].row})`);
}
