// Direct recursive construction of the U-fork curve.
// Instead of L-system, use a recursive function that fills the grid.
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

// From the analysis, we know:
// Step 2 sub-blocks (when dividing 4x4 into 2x2 blocks):
//   Block (0,0) = TL: id        -> (1,1),(0,1),(0,0),(1,0) = same as step1
//   Block (0,1) = BL: ccw90     -> (1,0),(1,1),(0,1),(0,0)
//   Block (1,1) = BR: 180       -> (0,0),(1,0),(1,1),(0,1)
//   Block (1,0) = TR: 180       -> (0,0),(1,0),(1,1),(0,1)
//
// And the interleaving: the blocks are NOT visited contiguously.
// Block visit order: TL(0) -> BL(1) -> BR(2,3,4,5) -> BL(6,7,8) -> TL(9,10,11) -> TR(12,13,14,15)
//
// The first point of each block is visited first in a specific order,
// then the remaining points fill in.
//
// This looks like the blocks visit their FIRST point, then recurse into sub-blocks.
// Let me check: if we take the first point visited in each block:
// TL: d=0 at (1,1)
// BL: d=1 at (1,2)
// BR: d=2 at (2,2)
// TR: d=12 at (2,0)
//
// TL first visit: d=0, BL first visit: d=1, BR first visit: d=2, TR first visit: d=12
// Order: TL, BL, BR... then TR much later.
// The first 3 blocks visited match: start, go down (to BL), go right (to BR)
//
// Actually, the first POINT of each block in order:
// d=0: (1,1) in TL
// d=1: (1,2) in BL
// d=2: (2,2) in BR
// That's the sub-curve of the first 3 points: (1,1)->(1,2)->(2,2)
// Which are the first 3 points of the BR sub-block's visit within the step2 path.
// Wait no, d=0 is the TL block's first visit (at local position (1,1)).
// d=1 is the BL block's first visit (at local position (1,0)).
// d=2 is the BR block's first visit (at local position (0,0)).
//
// Then BR fills completely: d=2,3,4,5
// Then BL fills: d=6,7,8 (remaining 3 points)
// Then TL fills: d=9,10,11 (remaining 3 points)
// Then TR fills completely: d=12,13,14,15

// So the pattern is: TL(1st) -> BL(1st) -> BR(all 4) -> BL(3) -> TL(3) -> TR(all 4)
// Total: 1 + 1 + 4 + 3 + 3 + 4 = 16

// In terms of block visit pattern, this is:
// First thread: TL -> BL -> BR (visiting first point of each)
// Then BR completes (3 more)
// Then BL completes going backward (3 more)
// Then TL completes going backward (3 more)
// Then TR all (4)

// Hmm, this is complex. Let me think about it as a specific recursive pattern.

// Actually, maybe this is a "meander" or "Peano-like" curve with a different structure.
// Let me try to think about it as a curve that, at each level, replaces each
// line segment with a specific pattern.

// Step 1 has 3 segments: L, U, R (each of length 1)
// Step 2 has segments: D1 R2 D1 L3 U3 R3 D1 L1

// What if each segment at level n gets replaced by a specific pattern at level n+1?
// L(1) at step 1 becomes what at step 2?
// The L segment goes from (1,1) to (0,1).
// At step 2, the corresponding portion should be from (1,1) [start] to...
// the point that corresponds to (0,1) at step 1.
// (0,1) maps to block (0,1) in step 2. The entry to block (0,1) happens at d=1.
// But block (0,0) [which is (0,0) at step 1] gets entered at d=9.
// So the "macro" L segment from (1,1) to (0,1) to (0,0) etc. doesn't map simply.

// Let me try a COMPLETELY different approach.
// Maybe this curve can be constructed using a specific d2xy function.
// Let me try to find a pattern in the binary representation of d.

console.log('=== Binary analysis of d values ===');
console.log('Step 2 (4x4):');
for (let d = 0; d < 16; d++) {
  const p = step2[d];
  const xBin = p.col.toString(2).padStart(2, '0');
  const yBin = p.row.toString(2).padStart(2, '0');
  const dBin = d.toString(2).padStart(4, '0');
  // Interleave x and y bits
  const xyInterleaved = `${xBin[0]}${yBin[0]}${xBin[1]}${yBin[1]}`;
  const yxInterleaved = `${yBin[0]}${xBin[0]}${yBin[1]}${xBin[1]}`;
  console.log(`  d=${String(d).padStart(2)} (${dBin}) -> (${p.col},${p.row}) x=${xBin} y=${yBin} xy=${xyInterleaved} yx=${yxInterleaved}`);
}

// Let me try Gray code encoding
function grayEncode(n) {
  return n ^ (n >> 1);
}

function grayDecode(g) {
  let n = g;
  while (g >>= 1) n ^= g;
  return n;
}

console.log('\n=== Gray code analysis ===');
for (let d = 0; d < 16; d++) {
  const p = step2[d];
  const gd = grayEncode(d);
  const xGray = grayEncode(p.col);
  const yGray = grayEncode(p.row);
  console.log(`  d=${String(d).padStart(2)} g(d)=${String(gd).padStart(2)} -> (${p.col},${p.row}) g(x)=${xGray} g(y)=${yGray}`);
}

// Let me check if there's a simple mapping using XOR, Gray code, or bit manipulation
console.log('\n=== Trying to find bitwise d2xy mapping for step 2 ===');
// For 4x4, d is 4 bits, x and y are 2 bits each
// Try: extract 2 bits from d for x and 2 bits for y, with possible transformations

for (let xBit1 = 0; xBit1 < 4; xBit1++) {
for (let xBit0 = 0; xBit0 < 4; xBit0++) {
for (let yBit1 = 0; yBit1 < 4; yBit1++) {
for (let yBit0 = 0; yBit0 < 4; yBit0++) {
  if (xBit1 === xBit0 || xBit1 === yBit1 || xBit1 === yBit0 ||
      xBit0 === yBit1 || xBit0 === yBit0 || yBit1 === yBit0) continue;

  let matches = true;
  for (let d = 0; d < 16 && matches; d++) {
    const p = step2[d];
    const x = ((d >> xBit1) & 1) * 2 + ((d >> xBit0) & 1);
    const y = ((d >> yBit1) & 1) * 2 + ((d >> yBit0) & 1);
    if (x !== p.col || y !== p.row) matches = false;
  }

  if (matches) {
    console.log(`Direct bit extraction: x bits [${xBit1},${xBit0}], y bits [${yBit1},${yBit0}]`);
  }

  // Try with XOR/NOT on individual bits
  for (let xFlip1 = 0; xFlip1 < 2; xFlip1++) {
  for (let xFlip0 = 0; xFlip0 < 2; xFlip0++) {
  for (let yFlip1 = 0; yFlip1 < 2; yFlip1++) {
  for (let yFlip0 = 0; yFlip0 < 2; yFlip0++) {
    let m2 = true;
    for (let d = 0; d < 16 && m2; d++) {
      const p = step2[d];
      const x = (((d >> xBit1) & 1) ^ xFlip1) * 2 + (((d >> xBit0) & 1) ^ xFlip0);
      const y = (((d >> yBit1) & 1) ^ yFlip1) * 2 + (((d >> yBit0) & 1) ^ yFlip0);
      if (x !== p.col || y !== p.row) m2 = false;
    }
    if (m2) {
      console.log(`Bit+flip: x=[bit${xBit1}^${xFlip1}, bit${xBit0}^${xFlip0}], y=[bit${yBit1}^${yFlip1}, bit${yBit0}^${yFlip0}]`);
    }
  }}}}
}}}}

// No simple bit extraction. Let me try Gray code on d
console.log('\n=== Gray code d -> bit extraction ===');
for (let xBit1 = 0; xBit1 < 4; xBit1++) {
for (let xBit0 = 0; xBit0 < 4; xBit0++) {
for (let yBit1 = 0; yBit1 < 4; yBit1++) {
for (let yBit0 = 0; yBit0 < 4; yBit0++) {
  if (new Set([xBit1,xBit0,yBit1,yBit0]).size < 4) continue;

  for (let xFlip1 = 0; xFlip1 < 2; xFlip1++) {
  for (let xFlip0 = 0; xFlip0 < 2; xFlip0++) {
  for (let yFlip1 = 0; yFlip1 < 2; yFlip1++) {
  for (let yFlip0 = 0; yFlip0 < 2; yFlip0++) {
    let m = true;
    for (let d = 0; d < 16 && m; d++) {
      const p = step2[d];
      const g = grayEncode(d);
      const x = (((g >> xBit1) & 1) ^ xFlip1) * 2 + (((g >> xBit0) & 1) ^ xFlip0);
      const y = (((g >> yBit1) & 1) ^ yFlip1) * 2 + (((g >> yBit0) & 1) ^ yFlip0);
      if (x !== p.col || y !== p.row) m = false;
    }
    if (m) {
      console.log(`Gray+flip: x=[g_bit${xBit1}^${xFlip1}, g_bit${xBit0}^${xFlip0}], y=[g_bit${yBit1}^${yFlip1}, g_bit${yBit0}^${yFlip0}]`);
    }
  }}}}
}}}}

// If nothing works with simple bit extraction, let me try an xy2d approach instead.
// Build an xy2d function using the known values and see if there's a recursive pattern.
console.log('\n=== Recursive xy2d pattern ===');
// Step 1 xy2d:
// (0,0)->2, (1,0)->3, (0,1)->1, (1,1)->0
// As a function of the two bits of x and y:
// x=0,y=0 -> 2
// x=1,y=0 -> 3
// x=0,y=1 -> 1
// x=1,y=1 -> 0
// Pattern: d = 2 - 2*y + x*(2*y - 1) = ... let me just tabulate
// Actually: d = (1-y)*2 + (1-y)*x + y*(1-x) = ...no
// d = 2*(1-x)*(1-y) + 3*x*(1-y) + 1*(1-x)*y + 0*x*y
// = 2 - 2y - 2x + 2xy + 3x - 3xy + y - xy
// = 2 + x - y - 2xy
// Check: (0,0): 2+0-0-0=2, (1,0): 2+1-0-0=3, (0,1): 2+0-1-0=1, (1,1): 2+1-1-2=0. YES!
// d = 2 + x - y - 2xy = 2 + x(1-2y) - y

// For step 2, using the parent-local decomposition:
// global (gx, gy) -> parent (px=gx>>1, py=gy>>1) -> parent d = f(px,py)
// local (lx=gx&1, ly=gy&1) -> local d depends on transform

// Step 1: d(x,y) = 2 + x - y - 2xy
// Step 2: d(gx,gy) = ?

// Let me compute the actual xy2d for step 2:
const xy2d_2 = {};
for (let d = 0; d < 16; d++) {
  const p = step2[d];
  xy2d_2[`${p.col},${p.row}`] = d;
}

// Check if d(gx,gy) = 4 * parentD + some_function(parentD, localX, localY)
console.log('Checking d = 4*parentD + f(parentD, lx, ly):');
for (let gy = 0; gy < 4; gy++) {
  for (let gx = 0; gx < 4; gx++) {
    const d = xy2d_2[`${gx},${gy}`];
    const px = gx >> 1, py = gy >> 1;
    const lx = gx & 1, ly = gy & 1;
    const parentD = 2 + px - py - 2*px*py;
    const offset = d - 4 * parentD;
    const localD = 2 + lx - ly - 2*lx*ly;
    process.stdout.write(`(${gx},${gy}):d=${String(d).padStart(2)},pd=${parentD},off=${String(offset).padStart(3)},ld=${localD} | `);
  }
  console.log('');
}

// The offsets within each parent are not contiguous.
// This confirms the interleaving.

// Let me try a completely different recursive approach.
// What if the recursion works by REFLECTING rather than ROTATING?

// Actually let me look at this from an entirely different angle.
// The original issue says "U-shaped tuning fork fractal".
// Let me search for known fractal curves with this name or description.
// A "tuning fork" fractal might be a specific known mathematical object.

// Meanwhile, let me try to build the curve directly using a BFS/DFS approach
// on the grid, guided by the recursive structure.

// The curve seems to have this property: at each level of the recursion (doubling the grid),
// a new "ring" is added around the outside, and the new curve spirals through this ring
// and then continues inward with the previous level's pattern.

// Let me verify: does the step 3 path contain the step 2 path embedded inside?
// Step 2 path: (1,1) -> (1,2) -> (2,2) -> (3,2) -> (3,3) -> (2,3) -> (1,3) -> (0,3) -> (0,2) -> (0,1) -> (0,0) -> (1,0) -> (2,0) -> (3,0) -> (3,1) -> (2,1)

// In step 3 (8x8), if we look at the "inner" 4x4 by taking every other point...
// Actually let me look at (2*x+1, 2*y+1) for step 2 coordinates
// mapped to step 3 coordinates:
console.log('\n=== Checking if step 2 embeds in step 3 ===');
const step2_mapped = step2.map(p => ({col: 2*p.col + 1, row: 2*p.row + 1}));
console.log('Step 2 mapped to step 3 coords:', step2_mapped.map(p => `(${p.col},${p.row})`).join(' -> '));

// Check what d-values these positions have in step 3:
const xy2d_3 = {};
for (let d = 0; d < 64; d++) {
  const p = step3[d];
  xy2d_3[`${p.col},${p.row}`] = d;
}

const embedded_d = step2_mapped.map(p => xy2d_3[`${p.col},${p.row}`]);
console.log('Embedded d-values:', embedded_d.join(', '));
console.log('Sorted:', [...embedded_d].sort((a,b) => a-b).join(', '));
console.log('Is monotonically increasing?', embedded_d.every((d, i) => i === 0 || d > embedded_d[i-1]));

// Also try offset (2*x, 2*y)
const step2_mapped2 = step2.map(p => ({col: 2*p.col, row: 2*p.row}));
const embedded_d2 = step2_mapped2.map(p => xy2d_3[`${p.col},${p.row}`] ?? -1);
console.log('\nWith (2x,2y) mapping:', embedded_d2.join(', '));
console.log('Sorted:', [...embedded_d2].filter(d=>d>=0).sort((a,b) => a-b).join(', '));
