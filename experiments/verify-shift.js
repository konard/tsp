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

// Center of step4 = step3 shifted by 51.
// step3[51] = (2,5). In step4 center, this is (2+4,5+4)=(6,9) = step4[0]! Makes sense.

// The shift of 51: step3 has 64 points. 64-51=13.
// step3[51] is position (2,5), which corresponds to step4 starting position (6,9).

// Now check: center of step3 = step2 shifted by ?
function extractCenter(path, n, innerSize) {
  const offset = (n - innerSize) / 2;
  return path.filter(p => 
    p.col >= offset && p.col < offset + innerSize && 
    p.row >= offset && p.row < offset + innerSize
  ).map(p => ({col: p.col - offset, row: p.row - offset}));
}

const center3 = extractCenter(step3, 8, 4);
console.log('center3 has', center3.length, 'cells');

// Find shift
for (let shift = 0; shift < 16; shift++) {
  let match = true;
  for (let i = 0; i < 16; i++) {
    const j = (i + shift) % 16;
    if (center3[i].col !== step2[j].col || center3[i].row !== step2[j].row) {
      match = false;
      break;
    }
  }
  if (match) console.log(`center3 = step2 shifted by ${shift}`);
}

// Also check with geometric transforms
function transformPath(path, n, t) {
  return path.map(p => {
    let {col, row} = p;
    switch(t) {
      case 0: return {col, row};
      case 1: return {col: n-1-row, row: col};
      case 2: return {col: n-1-col, row: n-1-row};
      case 3: return {col: row, row: n-1-col};
      case 4: return {col: n-1-col, row};
      case 5: return {col: row, row: col};
      case 6: return {col, row: n-1-row};
      case 7: return {col: n-1-row, row: n-1-col};
    }
  });
}
const tNames = ['id', 'cw90', '180', 'ccw90', 'flipH', 'flipD', 'flipV', 'flipAD'];

for (let t = 0; t < 8; t++) {
  const tStep2 = transformPath(step2, 4, t);
  for (let shift = 0; shift < 16; shift++) {
    let match = true;
    for (let i = 0; i < 16; i++) {
      const j = (i + shift) % 16;
      if (center3[i].col !== tStep2[j].col || center3[i].row !== tStep2[j].row) {
        match = false;
        break;
      }
    }
    if (match) console.log(`center3 = ${tNames[t]}(step2) shifted by ${shift}`);
  }
}

// Check center of step2 = step1 shifted by ?
const center2 = extractCenter(step2, 4, 2);
console.log('\ncenter2 has', center2.length, 'cells');
console.log('center2:', center2.map(p => `(${p.col},${p.row})`).join(' -> '));
console.log('step1:', step1.map(p => `(${p.col},${p.row})`).join(' -> '));

for (let t = 0; t < 8; t++) {
  const tStep1 = transformPath(step1, 2, t);
  for (let shift = 0; shift < 4; shift++) {
    let match = true;
    for (let i = 0; i < 4; i++) {
      const j = (i + shift) % 4;
      if (center2[i].col !== tStep1[j].col || center2[i].row !== tStep1[j].row) {
        match = false;
        break;
      }
    }
    if (match) console.log(`center2 = ${tNames[t]}(step1) shifted by ${shift}`);
  }
}

// Now the key question: WHAT IS THE FRAME?
// The frame is the path traversal of the outer ring (n/4 cells wide).
// For step 3 (n=8): frame is the outermost 2-cell border.
// Wait, the center is 4x4 in 8x8, so the frame is 2 cells wide on each side.
// Frame cells: those NOT in the center 4x4.

// For step 4 (n=16): center is 8x8, frame is 4 cells wide.
// Frame = rows 0-3 and 12-15, plus cols 0-3 and 12-15 of middle rows.

// The frame of step N+1 has 3*n^2/4 cells (for n x n grid, center n/2 x n/2).
// step3 frame: 64 - 16 = 48 cells
// step4 frame: 256 - 64 = 192 cells

// Is the frame of step4 related to step3? 
// step4 frame has 192 cells. step3 has 64 cells. Ratio 3:1.
// Interesting: the frame has 3 times as many cells as the center.
// And the center IS the previous level.

// So at each level: total = center + frame = n^2/4 + 3*n^2/4 = n^2.
// And the frame has 3 times as many cells as the center.

// Now: how is the frame constructed?
// The frame traversal for step 3 goes:
// d=0-21 (22 cells before entering center), d=30-47 (18 cells), d=56-63 (8 cells)
// Total frame: 22 + 18 + 8 = 48. Correct.

// For step 4:
// d=20-211 (192 cells, all in frame). That's one contiguous block!
// So in step 4, the frame is traversed in one go, while in step 3
// it's split into 3 parts.

// This means: at step N, the frame is split into pieces by the center insertions.
// At step N+1, the frame becomes one contiguous block because the center
// is inserted only at the boundaries.

// OK let me think about the frame differently.
// For step 3:
// - First 22 frame cells (d=0-21): "entering" phase
// - Then 8 center cells (d=22-29)
// - Then 18 frame cells (d=30-47): "middle" phase
// - Then 8 center cells (d=48-55)
// - Then 8 frame cells (d=56-63): "exiting" phase

// For step 4:
// - First 20 center cells (d=0-19): entering center
// - Then 192 frame cells (d=20-211): frame traversal
// - Then 44 center cells (d=212-255): exiting center

// The structure at step 4:
// The step 4 center = step 3 cycle starting at position 51.
// Position 51 in step 3 is in the EXITING CENTER phase (d=48-55, specifically d=51).
// So step 4 enters the center at step3's position 51, visits center cells 51->55,
// then hits the split point.

// Let me figure out the split point.
// step3[51] = (2,5) in 8x8 coords.
// In step4, this is (6,9), which is the start of step 4.
// step4 enters the center, visits 20 cells (step3 positions 51-63 and then 0-6?),
// then exits to frame.

// 51 + 20 = 71. 71 mod 64 = 7. So center cells visited: positions 51..63 (13 cells) and 0..6 (7 cells) = 20 total.
// Then frame. Then remaining center: positions 7..50 = 44 cells. 20 + 44 = 64. Correct!

// Let me verify:
console.log('\n=== Verify split point ===');
console.log('Step3 positions 51-63 (13 cells) and 0-6 (7 cells):');
for (let rank = 0; rank < 20; rank++) {
  const step3pos = (51 + rank) % 64;
  const s3 = step3[step3pos];
  const c4 = center3; // wrong variable, let me use the right one
  console.log(`  rank=${rank}: step3[${step3pos}]=(${s3.col},${s3.row})`);
}

// OK now I know the structure:
// generatePath(n):
//   if n <= 2: return base path
//   
//   innerPath = generatePath(n/2)  // path for center
//   shift = ??? // some function of n
//   shiftedInner = circularShift(innerPath, shift) offset by (n/4, n/4)
//   
//   Split shiftedInner into enterPart (first K cells) and exitPart (remaining)
//   K = ???
//   
//   framePath = generateFrame(n, enterPart.last, exitPart.first)
//   
//   return enterPart + framePath + exitPart

// The split point K: where does the center exit to the frame?
// For step 3: center enters at d=22, exits at d=29. Enter point step3[22]=(5,3), exit step3[29]=(5,2).
// Wait no - step3's center3 has its own ordering. Let me look at center3 more carefully.

// center3 ordering (extracted from step 3 in visit order):
console.log('\ncenter3 (step3 center cells in visit order):');
center3.forEach((p, i) => console.log(`  rank=${i}: (${p.col},${p.row})`));

// The split in step 3's center: step 3 visits center cells in 2 groups.
// Group 1: d=22-29 (8 cells)
// Group 2: d=48-55 (8 cells)
// So the split is at rank 8: first 8 in, then 8 out.

// And we know center3 = step2 shifted by 13 (from earlier match).
// step2 has 16 cells. The first 8 center cells = step2 positions 13..4 (wrapping).
// Actually center3 = step2 shifted by 13 means center3[i] = step2[(i+13) % 16].

// The split at rank 8: step2 positions (13+0)...(13+7) mod 16 = 13,14,15,0,1,2,3,4
// Then step2 positions (13+8)...(13+15) mod 16 = 5,6,7,8,9,10,11,12

// Position 4 in step2 is step2[4]=(3,3). Position 5 is step2[5]=(2,3).
// Between these the frame is inserted.
// Position 4=(3,3) is the top-right corner of the 4x4 grid.
// Position 5=(2,3) is one step left from there.

// What about the shift values?
// center2 = step1 shifted by ? (need to check)
// center3 = step2 shifted by 13
// center4 = step3 shifted by 51

// Ratios: 13/16 = 0.8125, 51/64 = 0.796875
// Is there a pattern? 
// n=4 (step2): shift 13 out of 16 total
// n=8 (step3): shift 51 out of 64 total
// 13 = 16 - 3
// 51 = 64 - 13
// 3, 13, 51... each is previous * 4 - 1?
// 3*4-1 = 11 (not 13). Hmm.
// 3, 13, 51: 
// 3 = 3
// 13 = 3*4 + 1
// 51 = 13*4 - 1
// Or: 3, 13, 51 are (4^k - 1)/... let me check
// 4^1 = 4, 4^1-1=3
// 4^2 = 16, 16-3=13
// 4^3 = 64, 64-13=51
// So shift(k) = 4^k - shift(k-1) where shift(1) = 3!
// Or equivalently: shift(k) = 4^k - shift(k-1)
// shift(1) = 3, shift(2) = 16-3=13, shift(3) = 64-13=51, shift(4) = 256-51=205
// Let me verify shift(1):

// For center of step 2 = step 1:
console.log('\n=== Verify shift for step1->step2 ===');
console.log('center2:', center2.map(p => `(${p.col},${p.row})`).join(' -> '));
console.log('step1:', step1.map(p => `(${p.col},${p.row})`).join(' -> '));
// center2 = step1 shifted by 3?
// step1 shifted by 3: step1[(3+0)%4] = step1[3] = (1,0)
// center2[0] should be (1,0)
console.log('step1[3]:', `(${step1[3].col},${step1[3].row})`);
console.log('center2[0]:', `(${center2[0].col},${center2[0].row})`);

// Great! So the pattern is:
// shift(k) = 4^k - shift(k-1), with shift(1) = 3
// Or: shift(k) alternates between 4^k - prev
// shift(1) = 3
// shift(2) = 4^2 - 3 = 13
// shift(3) = 4^3 - 13 = 51
// shift(4) = 4^4 - 51 = 205
// shift(k) = (4^k + (-1)^k) / (4+1)... wait let me check
// shift(k) = (4^k + (-1)^k) / 5?
// k=1: (4+(-1))/5 = 3/5 NO
// Actually: shift(1)=3, shift(2)=13, shift(3)=51
// 3 = (4^2-1)/5 = 15/5 = 3 YES
// 13 = (4^3-1)/5 = 63/5 NO... 63/5=12.6
// Hmm. Let me just use the recurrence.

console.log('\n=== Shift values ===');
let prevShift = 3;
console.log('shift(1) = 3');
for (let k = 2; k <= 5; k++) {
  const shift = Math.pow(4, k) - prevShift;
  console.log(`shift(${k}) = ${Math.pow(4,k)} - ${prevShift} = ${shift}`);
  prevShift = shift;
}

// Now what about K (the number of entering center cells before the frame)?
// step 3: K = 8 out of 16 center cells (50%)
// step 4: K = 20 out of 64 center cells (31.25%)

// The entering cells come from the shifted cycle.
// For step 3: shift=13, cycle length=16. 
// Entering: positions 13,...,16-1,0,...,K-1
// The frame is inserted after K center cells. 
// K=8 means: 16-13=3 cells from end + 5 cells from start.
// Actually that's 3+5=8. Yes!

// But where exactly is the split? It's where the center path crosses
// the boundary between center region and frame.
// step3[29] = (5,2) -> step3[30] = (6,2): exits center at (5,2) going to (6,2)
// In center coords: (5-2,2-2) = (3,0). Next is (4,0) which is outside 4x4.
// So the center path exits when it reaches edge cell (3,0).

// In step 2: the split happens at position step2[(13+8-1) % 16] = step2[4] = (3,3).
// In center coords, that's (3,3). From there, step2[5]=(2,3).
// But (3,3) is a corner of the 4x4 grid. The next cell (2,3) is still inside the grid.
// Wait... the center is the inner n/2 x n/2 = 4x4 grid (cols 2-5, rows 2-5).
// In center coords, (3,3) = (5,5) in global which is inside.
// But step3[29]=(5,2) in global, which is center coord (3,0). 
// The exit goes to step3[30]=(6,2) which is center coord (4,0) = outside center.
// So the exit happens when the path steps outside the center boundary.

// So K is determined by tracing the shifted cycle and counting how many
// cells the path visits before it steps outside the n/2 x n/2 center region.
// But wait - the center path IS contained within the center region by construction.
// The exit happens when we need to step to a NEIGHBOR outside the center.

// Actually, I think the split is simpler: the frame path connects two specific
// boundary cells of the center. The center path is split at those cells.

// Let me identify the entry/exit cells more precisely.

console.log('\n=== Entry/exit boundary cells ===');
console.log('Step 3:');
console.log('  Center exit: step3[29]=(5,2) -> step3[30]=(6,2)');
console.log('  Center re-entry: step3[47]=(6,5) -> step3[48]=(5,5)');
console.log('  In center coords: exit from (3,0), re-enter at (3,3)');

console.log('Step 4:');
console.log('  Center exit: step4[19]=(4,8) -> step4[20]=(3,8)');
console.log('  Center re-entry: step4[211]=(3,7)... wait');
// Let me check
console.log('  step4[19]:', step4[19], 'step4[20]:', step4[20]);
console.log('  step4[211]:', step4[211], 'step4[212]:', step4[212]);
console.log('  In center coords:');
console.log('    exit from', `(${step4[19].col-4},${step4[19].row-4})`);
console.log('    re-enter at', `(${step4[212].col-4},${step4[212].row-4})`);

// For step 3: exit from center coord (3,0), re-enter at (3,3).
// For step 4: exit from center coord (0,4), re-enter at (?,?).

// In step 2 terms:
// step3 center = step2 shifted by 13.
// Exit is at the 8th center cell = step2[(13+7) % 16] = step2[4] = (3,3).
// Re-enter at step2[(13+8) % 16] = step2[5] = (2,3).
// Exit position (3,3) is at row 3 (top row of 4x4), col 3 (right column).
// Re-enter (2,3) is at row 3, col 2.

// In step 3 terms:
// step4 center = step3 shifted by 51.
// Exit is at the 20th center cell = step3[(51+19) % 64] = step3[6] = (0,4).
// Re-enter at step3[(51+20) % 64] = step3[7] = (0,3).
// Exit position (0,4) is at col 0 (left column), row 4 (middle).
// Re-enter (0,3) is at col 0, row 3.

// Hmm, exit and re-entry are ADJACENT cells on the boundary!
// step3: exit (3,0) to frame, re-enter at (3,3). NOT adjacent.
// step4: exit (0,4) to frame, re-enter at (0,3). Adjacent (same col, row differs by 1).

// Actually in step 3, exit from center coord (3,0) and re-enter at (3,3):
// These are on opposite sides of the center! Top-right corner and bottom-left.
// Wait no: (3,0) is bottom-right, (3,3) is top-right of the 4x4 center.

// And in step 4: exit from (0,4) and re-enter at (0,3).
// These are adjacent on the left side of the center.

// The pattern seems to be: the exit/entry points are where the center path
// hits the boundary of the center region, and the frame connects them.

// KEY INSIGHT: The frame is just the OUTER RING of the next level grid.
// The construction is:
// 1. Take the previous level's Hamiltonian cycle
// 2. Shift it to start at a specific position
// 3. Embed it in the center of the new grid
// 4. At a specific point, break the cycle and insert the frame traversal
// 5. The frame traversal connects the two break points

// The frame traversal itself must also follow a specific pattern.
// For step 3: the frame is 48 cells in the outer 2-cell border.
// The frame path goes: LEFT across top-left, DOWN left col, RIGHT across bottom,
// UP right col (partial), LEFT/DOWN/RIGHT zigzag, UP col 1, RIGHT/DOWN/LEFT zigzag,
// UP right col (rest), LEFT across top-right.

// This is the "U-fork" pattern at the frame level!

// Let me now just try to directly construct the path.
// The construction:
// Step k: n = 2^k
// 1. Generate step k-1 path for n/2 x n/2
// 2. Shift it by shift(k-1)
// 3. Offset coordinates by (n/4, n/4) to center it
// 4. Generate the frame path
// 5. Insert frame at the split point

// The frame path: this is the part that fills the outer n/4-cell border.
// Looking at step 3's frame:
// d=0-3: L across top row from (n/2-1, n-1) to (0, n-1) -- 4 cells = n/2
// d=4-10: D from (0, n-2) to (0, 0) -- 7 cells = n-1
// d=10-17: R from (0, 0) to (n-1, 0) -- 8 cells = n (wait, 7 moves = 8 cells but d=10 is the start, d=17 is end)
// Hmm d=10=(0,0) to d=17=(7,0). 0,0 -> 1,0 -> ... -> 7,0. That's n cells if including start.

// Frame cells: I should focus on which cells are in the frame and how they're connected.
// Let me just implement the algorithm and test it.

console.log('\n=== Summary ===');
console.log('Shift recurrence: shift(k) = 4^k - shift(k-1), shift(1) = 3');
console.log('Center of step k = step (k-1) circularly shifted');
console.log('Frame is inserted at the split point');
console.log('Need to determine frame construction algorithm');
