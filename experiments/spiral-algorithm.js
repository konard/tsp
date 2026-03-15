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

console.log('Step 1:', step1.map(p => `(${p.col},${p.row})`).join(' -> '));
console.log('Step 2:', step2.map(p => `(${p.col},${p.row})`).join(' -> '));
console.log('\nStep 3 start:', `(${step3[0].col},${step3[0].row})`, 'end:', `(${step3[63].col},${step3[63].row})`);
console.log('Step 4 start:', `(${step4[0].col},${step4[0].row})`, 'end:', `(${step4[255].col},${step4[255].row})`);

// The visit-order grid for step 3 shows row 7 is the TOP:
//    3  2  1  0 63 62 61 60    <- row 7 (top)
//    4 41 42 43 44 45 46 59
//    5 40 51 50 49 48 47 58
//    6 39 52 53 54 55 56 57
//    7 38 25 24 23 22 21 20
//    8 37 26 27 28 29 30 19
//    9 36 35 34 33 32 31 18
//   10 11 12 13 14 15 16 17    <- row 0 (bottom)
//
// In SVG, y increases downward, so row 7 in my grid = top of SVG.
// But in the actual SVG, y=0 is top. So row 0 in my grid = largest y in SVG = bottom.
// This means: row 7 = y_min = top of image, row 0 = y_max = bottom of image.
// So the path starts at top-center and ends at top-center.

// Let me trace the step 4 path to verify the same pattern:
console.log('\n=== Step 4 compressed moves ===');
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

const moves3 = compressMoves(step3);
const moves4 = compressMoves(step4);
console.log('Step 3 segments:', moves3.map(s => s.dir + s.len).join(' '));
console.log('Step 4 segments:', moves4.map(s => s.dir + s.len).join(' '));

// Let me also print the segment lengths as arrays
console.log('\nStep 3 dirs:', moves3.map(s => s.dir).join(''));
console.log('Step 3 lens:', moves3.map(s => s.len).join(','));
console.log('Step 4 dirs:', moves4.map(s => s.dir).join(''));
console.log('Step 4 lens:', moves4.map(s => s.len).join(','));

// Let me also trace step 2
const moves2 = compressMoves(step2);
const moves1 = compressMoves(step1);
console.log('\nStep 1 segments:', moves1.map(s => s.dir + s.len).join(' '));
console.log('Step 2 segments:', moves2.map(s => s.dir + s.len).join(' '));

// Now let me try to find the PATTERN in the segment sequence.
// Step 1 (n=2): L1 D1 R1
// Step 2 (n=4): U1 R2 U1 L3 D3 R3 U1 L1
// Step 3 (n=8): L3 D7 R7 U3 L5 D1 R4 D1 L5 U5 R5 D1 L4 D1 R5 U3 L3

// Hmm wait, step 2 starts with U1. Let me re-check.
// Step 2 path: (1,1) -> (1,2) -> (2,2) -> (3,2) -> (3,3) -> (2,3) -> (1,3) -> (0,3) -> (0,2) -> (0,1) -> (0,0) -> (1,0) -> (2,0) -> (3,0) -> (3,1) -> (2,1)
// Moves: U R R U L L L D D D R R R U L
// Compressed: U1 R2 U1 L3 D3 R3 U1 L1
//
// In my coordinate system (row increases upward):
// Starting at (1,1), going U means row increases.
// (1,1)->(1,2) is UP.

// The start/end points:
// Step 1: start (1,1), end (1,0) - n=2, start=(n/2-1, n/2-1), end=(n/2, n/2-1)?
// No... step 1 start=(1,1), end=(1,0)

// Step 2: start=(1,1), end=(2,1) - n=4
// Step 3: start=(3,7), end=(4,7) - n=8
// Step 4: start=(6,9)? Let me check...

// Actually wait. n=16 for step 4. Let me re-derive.
// start=(6,9), end=(7,9) for step 4. That's NOT (n/2-1, n-1).
// n=16, n/2-1=7, n-1=15. So start=(6,9) doesn't fit.

// Hmm. Let me look at the visit grid for step 4 more carefully.
// Row 15 (topmost): starts at d=93, all filled L->R from col 15 to col 0
// Row 0 (bottommost): d=123 to d=138, all filled L->R from col 0 to col 15

// The path starts at d=0 at (6,9). That's kind of in the center of the grid.
// n=16, center is at (7.5, 7.5). Start is at (6,9) which is near center.

// OK so for step 3 (n=8): start=(3,7), end=(4,7). n/2-1=3, n-1=7. Start IS (n/2-1, n-1)! End is (n/2, n-1).
// For step 2 (n=4): start=(1,1), end=(2,1). n/2-1=1. But n-1=3, and start row is 1, not 3.
// For step 1 (n=2): start=(1,1), end=(1,0). n/2-1=0, n-1=1.

// The step 2 pattern doesn't start at the top! It starts at (1,1) which is near center.
// Let me re-examine the visit grid for step 2:
//  10  11  12  13    <- row 3 (top)
//   9   0  15  14    <- row 2
//   8   1   2   3    <- row 1
//   7   6   5   4    <- row 0 (bottom)

// d=0 is at (1,2), d=15 is at (2,2). Start is near center.

// The start position for each step:
// Step 1 (n=2): (1,1) - that's (n-1, n-1), i.e., top-right
// Step 2 (n=4): (1,2) - looking at the grid
// Step 3 (n=8): (3,7) - that's (n/2-1, n-1)
// Step 4 (n=16): let me check

// Wait, I said step 2 start is (1,1) but let me recheck
console.log('\n=== Exact start/end positions ===');
console.log('Step 1:', step1.map(p => `(${p.col},${p.row})`).join(' -> '));

// Hmm, step 2 start. Let me print step 2 in full:
console.log('\nStep 2 full path:');
step2.forEach((p, d) => console.log(`  d=${d}: (${p.col},${p.row})`));

// And look at step 4 start more carefully
console.log('\nStep 4 first 10:');
step4.slice(0, 10).forEach((p, d) => console.log(`  d=${d}: (${p.col},${p.row})`));
console.log('Step 4 last 10:');
step4.slice(-10).forEach((p, d) => console.log(`  d=${246+d}: (${p.col},${p.row})`));
