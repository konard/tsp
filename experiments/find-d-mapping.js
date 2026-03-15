/**
 * Find the d mapping formula.
 * From the previous analysis:
 * For step 2, d = f(parentD, localD)
 *
 * Parent d=0 (1,1): local visit (0,0)->(1,0)->(1,1)->(0,1) gives d 2,3,4,5
 *   local (0,0)=d2, (1,0)=d3, (1,1)=d4, (0,1)=d5
 *
 * Parent d=1 (0,1): local visit (1,0)->(1,1)->(0,1)->(0,0) gives d 1,6,7,8
 *   local (1,0)=d1, (1,1)=d6, (0,1)=d7, (0,0)=d8
 *
 * Parent d=2 (0,0): local visit (1,1)->(0,1)->(0,0)->(1,0) gives d 0,9,10,11
 *   local (1,1)=d0, (0,1)=d9, (0,0)=d10, (1,0)=d11
 *
 * Parent d=3 (1,0): local visit (0,0)->(1,0)->(1,1)->(0,1) gives d 12,13,14,15
 *   local (0,0)=d12, (1,0)=d13, (1,1)=d14, (0,1)=d15
 *
 * The d values within each parent:
 * pd=0: [2, 3, 4, 5] -> sorted local D = [0, 1, 2, 3]
 * pd=1: [1, 6, 7, 8] -> local D = [3, 0, 1, 2] ? No...
 * pd=2: [0, 9, 10, 11] -> local D = [0, 3, 2, 1] ? No...
 *
 * Wait, I need to look at local visit order vs d assignment differently.
 *
 * Let me define the local visit order index:
 * For pd=0, visit order: (0,0)=1st, (1,0)=2nd, (1,1)=3rd, (0,1)=4th
 * d values: 2, 3, 4, 5
 * So 1st visited = d2, 2nd = d3, 3rd = d4, 4th = d5
 * = 4*pd + local_visit_order (0-indexed) + something
 * = 4*0 + 0 + 2, 4*0 + 1 + 2, 4*0 + 2 + 2, 4*0 + 3 + 2
 * Offset = 2? Not consistent.
 *
 * Actually let me look at the combined values from previous analysis:
 * (x,y): d, 4*parentD+localD
 * (2,2): d=2, 4*0+2=2 ✓
 * (3,2): d=3, 4*0+3=3 ✓
 * (2,3): d=5, 4*0+1=1 ✗
 * (3,3): d=4, 4*0+0=0 ✗
 *
 * So 4*parentD + localD doesn't work directly.
 * But in parent d=0:
 * localD=0 (1,1) -> actual d=4
 * localD=1 (0,1) -> actual d=5
 * localD=2 (0,0) -> actual d=2
 * localD=3 (1,0) -> actual d=3
 *
 * So within parent d=0: actual_d = (localD <= 1) ? 4 + localD : localD
 * Or: actual_d = (localD + 2) % 4 + 4*0 + ...
 * Hmm, let me just see the pattern clearly.
 *
 * parent d=0: localDs map to [2,3,4,5]
 *   localD 0 -> 4
 *   localD 1 -> 5
 *   localD 2 -> 2
 *   localD 3 -> 3
 *   Permutation: [2,3,0,1] applied to [2,3,4,5]? No.
 *   Mapping: localD -> offset: 0->2, 1->3, 2->0, 3->1
 *   That's (localD + 2) % 4 -> offset
 *
 * parent d=1: d values [1,6,7,8]
 *   localD 0 -> 6 (via (1,1))
 *   localD 1 -> 7 (via (0,1))
 *   localD 2 -> 8 (via (0,0))
 *   localD 3 -> 1 (via (1,0))
 *   Offsets from base=1: 0->5, 1->6, 2->7, 3->0
 *   Hmm that's not clean. Range is 1,6,7,8 - not even contiguous.
 *
 * The d values are interleaved between parents. This is the key difference
 * from Hilbert - parents don't get contiguous d-value ranges.
 *
 * Let me map out ALL d values with their parent and local:
 */

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

function buildXY2D(path) {
  const n = Math.round(Math.sqrt(path.length));
  const table = Array.from({length: n}, () => Array(n).fill(-1));
  for (let d = 0; d < path.length; d++) {
    table[path[d].row][path[d].col] = d;
  }
  return table;
}

const t1 = buildXY2D(step1);
const t2 = buildXY2D(step2);
const t3 = buildXY2D(step3);

console.log('=== d values in step 2 with parent/local info ===');
console.log('d | (x,y) | parentD | localD | localVisitIdx');
for (let d = 0; d < 16; d++) {
  const p = step2[d];
  const px = Math.floor(p.col / 2);
  const py = Math.floor(p.row / 2);
  const parentD = t1[py][px];
  const lx = p.col % 2;
  const ly = p.row % 2;
  const localD = t1[ly][lx];
  console.log(`${String(d).padStart(2)} | (${p.col},${p.row}) | pd=${parentD} | ld=${localD}`);
}

// Try to find the general pattern
// d: pd, ld
// 0: 2, 0  -> 2*4+0 = 8 != 0
// 1: 1, 3  -> 1*4+3 = 7 != 1
// 2: 0, 2  -> 0*4+2 = 2 ✓
// 3: 0, 3  -> 0*4+3 = 3 ✓
// 4: 0, 0  -> 0*4+0 = 0 != 4
// 5: 0, 1  -> 0*4+1 = 1 != 5
// 6: 1, 0  -> 1*4+0 = 4 != 6
// 7: 1, 1  -> 1*4+1 = 5 != 7
// 8: 1, 2  -> 1*4+2 = 6 != 8
// 9: 2, 1  -> 2*4+1 = 9 ✓
// 10: 2, 2 -> 2*4+2 = 10 ✓
// 11: 2, 3 -> 2*4+3 = 11 ✓
// 12: 3, 2 -> 3*4+2 = 14 != 12
// 13: 3, 3 -> 3*4+3 = 15 != 13
// 14: 3, 0 -> 3*4+0 = 12 != 14
// 15: 3, 1 -> 3*4+1 = 13 != 15

// So 4*pd + ld works for some but not all. The mismatches are:
// d=0: pd=2, ld=0, should be 0 but 4*2+0=8
// d=1: pd=1, ld=3, should be 1 but 4*1+3=7
// d=4: pd=0, ld=0, should be 4 but 0
// etc.

// Maybe I need to rethink what the "local D" should be for each parent.
// The local traversal order CHANGES depending on the parent's d value.

// Parent d=0: visit (0,0)(1,0)(1,1)(0,1) -> 180° rotation
// Parent d=1: visit (1,0)(1,1)(0,1)(0,0) -> ccw90 rotation
// Parent d=2: visit (1,1)(0,1)(0,0)(1,0) -> identity
// Parent d=3: visit (0,0)(1,0)(1,1)(0,1) -> 180° rotation

// So the local visit index (0,1,2,3) within each parent gives:
// pd=0: d offset = {0->2, 1->3, 2->4, 3->5} = visit_idx + 2
// pd=1: d offset = {0->1, 1->6, 2->7, 3->8} = ???
// pd=2: d offset = {0->0, 1->9, 2->10, 3->11} = ???
// pd=3: d offset = {0->12, 1->13, 2->14, 3->15} = visit_idx + 12

// For pd=0: contiguous 2-5
// For pd=1: 1, 6, 7, 8 - not contiguous!
// For pd=2: 0, 9, 10, 11 - not contiguous!
// For pd=3: contiguous 12-15

// This non-contiguous pattern is the defining characteristic.
// pd=0 and pd=3 get contiguous blocks
// pd=1 gets: first visit = d1, then gap, then d6,7,8
// pd=2 gets: first visit = d0, then gap, then d9,10,11

// The first visits of pd=1 and pd=2 are interleaved at the beginning!
// d=0 is pd=2 first visit
// d=1 is pd=1 first visit
// d=2-5 is all of pd=0
// d=6-8 is pd=1 remaining
// d=9-11 is pd=2 remaining
// d=12-15 is all of pd=3

// So the pattern is:
// Start with innermost first visits, then expand outward.
// The curve visits inner points first, spiraling outward.

// This is essentially a "meander" or "boustrophedon" space-filling pattern
// where the recursion interleaves the sub-blocks rather than filling them sequentially.

// Maybe I should just try to construct this algorithmically.
// Let me try a direct recursive construction:

function generateUFork(order) {
  if (order === 0) {
    return [{ col: 0, row: 0 }];
  }

  const prevPath = generateUFork(order - 1);
  const prevSize = Math.pow(2, order - 1);
  const newSize = Math.pow(2, order);

  // Build xy2d for previous level
  const prevXY2D = Array.from({length: prevSize}, () => Array(prevSize).fill(-1));
  for (let d = 0; d < prevPath.length; d++) {
    prevXY2D[prevPath[d].row][prevPath[d].col] = d;
  }

  // For each cell in the new grid, compute its d value
  // Each cell (x,y) in new grid maps to parent cell (px,py) = (floor(x/2), floor(y/2))
  // and local position (lx,ly) = (x%2, y%2)

  // The local traversal order depends on the parent's d value
  // From the analysis:
  // pd=0: 180° -> visit (0,0)(1,0)(1,1)(0,1)
  // pd=1: ccw90 -> visit (1,0)(1,1)(0,1)(0,0)
  // pd=2: id -> visit (1,1)(0,1)(0,0)(1,0)
  // pd=3: 180° -> visit (0,0)(1,0)(1,1)(0,1)

  // Wait, these transforms should be functions of the parent d, and they need to work
  // for all levels. Let me check if the transforms are the same at step 2 -> step 3.

  // From step 2 -> step 3 analysis:
  // pd=0: id
  // pd=1: id
  // pd=2: id
  // pd=3: cw90
  // pd=4: 180
  // pd=5: 180
  // pd=6: id
  // pd=7: id
  // pd=8: cw90
  // pd=9: cw90
  // pd=10: cw90
  // pd=11: 180
  // pd=12: 180
  // pd=13: 180
  // pd=14: ccw90
  // pd=15: id

  // Hmm, this doesn't match the step1->step2 transforms.
  // step1->step2: pd 0=180, 1=ccw90, 2=id, 3=180
  // step2->step3: pd 0=id, 1=id, 2=id, 3=cw90, ...

  // So the transform depends on the POSITION, not just the d value at that level.
  // Or it depends on the direction of travel at that point.

  // Let me check what directions are involved
  return prevPath; // placeholder
}

// Let me instead trace the directions at each point and see if the transform
// depends on entry/exit directions

console.log('\n=== Direction analysis for step 1 ===');
for (let d = 0; d < 4; d++) {
  const p = step1[d];
  const prev = d > 0 ? step1[d-1] : null;
  const next = d < 3 ? step1[d+1] : null;
  const entryDir = prev ? getDir(prev, p) : 'none';
  const exitDir = next ? getDir(p, next) : 'none';
  console.log(`  d=${d}: (${p.col},${p.row}) entry=${entryDir}, exit=${exitDir}`);
}

function getDir(from, to) {
  const dx = to.col - from.col;
  const dy = to.row - from.row;
  if (dx === 1) return 'R';
  if (dx === -1) return 'L';
  if (dy === 1) return 'D';
  if (dy === -1) return 'U';
  return '?';
}

console.log('\n=== Direction analysis for step 2 ===');
for (let d = 0; d < 16; d++) {
  const p = step2[d];
  const prev = d > 0 ? step2[d-1] : null;
  const next = d < 15 ? step2[d+1] : null;
  const entryDir = prev ? getDir(prev, p) : 'none';
  const exitDir = next ? getDir(p, next) : 'none';
  const px = Math.floor(p.col / 2);
  const py = Math.floor(p.row / 2);
  const parentD = t1[py][px];
  console.log(`  d=${String(d).padStart(2)}: (${p.col},${p.row}) pd=${parentD} entry=${entryDir}, exit=${exitDir}`);
}

// Now I wonder: what if I look at the entry/exit directions of each parent cell
// and use those to determine the local traversal?

console.log('\n=== Parent cell entry/exit analysis for step 2 ===');
// For each parent cell, what's the entry and exit direction at the macro level?
// Step 1 path: (1,1) -> (0,1) -> (0,0) -> (1,0)
// Directions: L, U, R
// So:
// pd=0 (1,1): entry=none, exit=L
// pd=1 (0,1): entry=L, exit=U
// pd=2 (0,0): entry=U, exit=R
// pd=3 (1,0): entry=R, exit=none

for (let pd = 0; pd < 4; pd++) {
  const p = step1[pd];
  const prev = pd > 0 ? step1[pd-1] : null;
  const next = pd < 3 ? step1[pd+1] : null;
  const entry = prev ? getDir(prev, p) : 'none';
  const exit = next ? getDir(p, next) : 'none';

  // What local transform was applied?
  // pd=0: 180 (entry=none, exit=L)
  // pd=1: ccw90 (entry=L, exit=U)
  // pd=2: id (entry=U, exit=R)
  // pd=3: 180 (entry=R, exit=none)
  const transforms = {0: '180', 1: 'ccw90', 2: 'id', 3: '180'};
  console.log(`  pd=${pd} (${p.col},${p.row}): entry=${entry}, exit=${exit} -> ${transforms[pd]}`);
}

// Now check step 2's parent cells (step2 -> step3):
console.log('\n=== Parent cell entry/exit for step 3 construction ===');
for (let pd = 0; pd < 16; pd++) {
  const p = step2[pd];
  const prev = pd > 0 ? step2[pd-1] : null;
  const next = pd < 15 ? step2[pd+1] : null;
  const entry = prev ? getDir(prev, p) : 'none';
  const exit = next ? getDir(p, next) : 'none';

  // What local transform was found at step2->step3?
  const transforms2 = {0:'id',1:'id',2:'id',3:'cw90',4:'180',5:'180',6:'id',7:'id',8:'cw90',9:'cw90',10:'cw90',11:'180',12:'180',13:'180',14:'ccw90',15:'id'};
  console.log(`  pd=${String(pd).padStart(2)} (${p.col},${p.row}): entry=${entry.padEnd(4)}, exit=${exit.padEnd(4)} -> ${transforms2[pd]}`);
}

// Let me see if there's a mapping from (entry, exit) to transform:
console.log('\n=== Mapping (entry, exit) -> transform ===');
const mapping = {};
// step1->step2:
const t1_transforms = {0: '180', 1: 'ccw90', 2: 'id', 3: '180'};
for (let pd = 0; pd < 4; pd++) {
  const p = step1[pd];
  const prev = pd > 0 ? step1[pd-1] : null;
  const next = pd < 3 ? step1[pd+1] : null;
  const entry = prev ? getDir(prev, p) : 'none';
  const exit = next ? getDir(p, next) : 'none';
  const key = `${entry},${exit}`;
  mapping[key] = t1_transforms[pd];
}

// step2->step3:
const t2_transforms = {0:'id',1:'id',2:'id',3:'cw90',4:'180',5:'180',6:'id',7:'id',8:'cw90',9:'cw90',10:'cw90',11:'180',12:'180',13:'180',14:'ccw90',15:'id'};
for (let pd = 0; pd < 16; pd++) {
  const p = step2[pd];
  const prev = pd > 0 ? step2[pd-1] : null;
  const next = pd < 15 ? step2[pd+1] : null;
  const entry = prev ? getDir(prev, p) : 'none';
  const exit = next ? getDir(p, next) : 'none';
  const key = `${entry},${exit}`;
  if (mapping[key] && mapping[key] !== t2_transforms[pd]) {
    console.log(`  CONFLICT: (${entry},${exit}) -> ${mapping[key]} vs ${t2_transforms[pd]} at pd=${pd}`);
  } else if (!mapping[key]) {
    mapping[key] = t2_transforms[pd];
  }
}

console.log('\nFinal mapping:');
for (const [key, val] of Object.entries(mapping)) {
  console.log(`  (${key}) -> ${val}`);
}
