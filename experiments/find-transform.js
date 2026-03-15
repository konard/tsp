// The step 4 center 8x8 rank grid and step 3 grid are very close.
// Let me check all 8 symmetries more carefully and also check if
// maybe the issue is that the "rank" order within the center is
// computed differently.

// Step 4 center rank grid:
const centerRank = [
  [23, 24, 25, 26, 27, 28, 29, 30],  // row 0 (bottom)
  [22, 49, 48, 47, 46, 45, 44, 31],  // row 1
  [21, 50, 39, 40, 41, 42, 43, 32],  // row 2
  [20, 51, 38, 37, 36, 35, 34, 33],  // row 3
  [19, 52,  1,  2,  3,  4,  5,  6],  // row 4
  [18, 53,  0, 63, 62, 61, 60,  7],  // row 5
  [17, 54, 55, 56, 57, 58, 59,  8],  // row 6
  [16, 15, 14, 13, 12, 11, 10,  9],  // row 7
];

// Step 3 grid:
const step3Grid = [
  [10, 11, 12, 13, 14, 15, 16, 17],  // row 0 (bottom)
  [ 9, 36, 35, 34, 33, 32, 31, 18],  // row 1
  [ 8, 37, 26, 27, 28, 29, 30, 19],  // row 2
  [ 7, 38, 25, 24, 23, 22, 21, 20],  // row 3
  [ 6, 39, 52, 53, 54, 55, 56, 57],  // row 4
  [ 5, 40, 51, 50, 49, 48, 47, 58],  // row 5
  [ 4, 41, 42, 43, 44, 45, 46, 59],  // row 6
  [ 3,  2,  1,  0, 63, 62, 61, 60],  // row 7
];

// Check identity first - just compare directly
let diff = 0;
for (let r = 0; r < 8; r++) {
  for (let c = 0; c < 8; c++) {
    if (centerRank[r][c] !== step3Grid[r][c]) diff++;
  }
}
console.log('Direct comparison differences:', diff);

// Now check all 8 symmetries of step3Grid
function applyTransform(grid, n, t) {
  const result = Array.from({length: n}, () => Array(n).fill(-1));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      let nr, nc;
      switch(t) {
        case 0: nr = r; nc = c; break; // identity
        case 1: nr = c; nc = n-1-r; break; // CW 90
        case 2: nr = n-1-r; nc = n-1-c; break; // 180
        case 3: nr = n-1-c; nc = r; break; // CCW 90
        case 4: nr = r; nc = n-1-c; break; // flip horizontal
        case 5: nr = c; nc = r; break; // flip diagonal
        case 6: nr = n-1-r; nc = c; break; // flip vertical
        case 7: nr = n-1-c; nc = n-1-r; break; // flip anti-diagonal
      }
      result[nr][nc] = grid[r][c];
    }
  }
  return result;
}

const tNames = ['id', 'cw90', '180', 'ccw90', 'flipH', 'flipD', 'flipV', 'flipAD'];

for (let t = 0; t < 8; t++) {
  const tGrid = applyTransform(step3Grid, 8, t);
  let diff = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (centerRank[r][c] !== tGrid[r][c]) diff++;
    }
  }
  console.log(`Transform ${tNames[t]}: ${diff} differences`);
  if (diff < 10) {
    console.log('  Center rank:');
    for (let r = 7; r >= 0; r--) {
      console.log('    ' + centerRank[r].map(v => String(v).padStart(3)).join(''));
    }
    console.log('  Transformed step 3:');
    for (let r = 7; r >= 0; r--) {
      console.log('    ' + tGrid[r].map(v => String(v).padStart(3)).join(''));
    }
  }
}

// Maybe the center rank is a PERMUTATION of step 3 values?
// Let me check if the center rank is step 3 with values remapped.
// I.e., is there a bijection f such that centerRank[r][c] = f(step3Grid[r'][c']) 
// for some transform (r,c) -> (r',c')?

// Actually, let me look at it differently.
// If the inner structure is self-similar, then the CENTER of step N+1
// should have the SAME visiting PATTERN as step N.
// The "rank" gives us the relative order. If we apply a position transform
// AND a value remapping (e.g., reversal: d -> max-d), maybe we get a match.

for (let t = 0; t < 8; t++) {
  const tGrid = applyTransform(step3Grid, 8, t);
  
  // Check direct match
  let matchDirect = true;
  for (let r = 0; r < 8 && matchDirect; r++) {
    for (let c = 0; c < 8 && matchDirect; c++) {
      if (centerRank[r][c] !== tGrid[r][c]) matchDirect = false;
    }
  }
  
  // Check reversed match (d -> 63-d)
  let matchReversed = true;
  for (let r = 0; r < 8 && matchReversed; r++) {
    for (let c = 0; c < 8 && matchReversed; c++) {
      if (centerRank[r][c] !== 63 - tGrid[r][c]) matchReversed = false;
    }
  }
  
  if (matchDirect) console.log(`\nPERFECT MATCH: transform=${tNames[t]}, direct`);
  if (matchReversed) console.log(`\nPERFECT MATCH: transform=${tNames[t]}, reversed`);
}

// Let me also try: the center rank might need to account for the SPLIT.
// The center 64 cells of step 4 are visited in two groups:
// Group 1: d=0-19 (first 20 d-values of step 4 that fall in center)
// Group 2: d=212-255 (last 44 d-values... no wait)
// Actually the center cells have various d-values. Let me look at which
// d-values correspond to center cells.

// From earlier: center cells' d-values range from 0-19 and 212-255
// That's the entering and exiting portions.
// Within the entering portion, the cell visit order goes one way.
// Within the exiting portion, it goes another way.

// Maybe the two halves separately match step 3 somehow?
// Let me look at this more carefully.

// The key insight might be simpler: just construct the path directly
// using the spiral pattern with recursion.
// 
// At each level, the path does:
// 1. An outward spiral from center to the edge
// 2. Three sides of the outer perimeter
// 3. An inward spiral from the edge back to center
// 4. The CENTER is filled with a SMALLER version of the same pattern
//
// The "spiral" part at each level adds concentric rings.
// The self-similar center is n/2 x n/2.

// Let me check: step 3 has the center 4x4 visited as two separate
// traversals (entering at d=22-29 and exiting at d=48-55).
// These two traversals together cover all 16 center cells.
// The entering traversal visits 8 cells and the exiting also 8 cells.
// 
// For step 4, the center 8x8 would be visited as entering (d=0-19?)
// and exiting (d=?), each covering 32 cells.

// Actually, let me count more carefully.
// Step 4 center 8x8 (cols 4-11, rows 4-11):
// From the rank grid above, d-values in order: 0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19 and then 212-255.

// So entering = d 0-19 = 20 cells in center
// Exiting = d 212-255 = 44 cells? No, only those that are in center.
// Let me compute.

// From the center rank grid, the d-values present:
const centerDvals = new Set();
for (let r = 0; r < 8; r++) {
  for (let c = 0; c < 8; c++) {
    centerDvals.add(centerRank[r][c]);
  }
}
const sortedCenterD = [...centerDvals].sort((a,b) => a-b);
console.log('\nCenter d-values (sorted):', sortedCenterD.join(', '));
// These are RANKS 0-63, not actual step4 d-values.
// The ranks ARE 0-63, covering all 64 positions.

// What I need is to look at the ACTUAL d-values from step 4.
// Let me look at the d-values from step 4 that fall in the center 8x8.

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

const s4 = toGrid(parseSvgPath(readFileSync('target-svgs/tsp-tour-5.svg', 'utf8')));

const centerD4 = [];
for (let d = 0; d < 256; d++) {
  if (s4[d].col >= 4 && s4[d].col <= 11 && s4[d].row >= 4 && s4[d].row <= 11) {
    centerD4.push(d);
  }
}
console.log('\nActual step4 d-values in center 8x8:', centerD4.length, 'cells');
console.log('First 20:', centerD4.slice(0, 20).join(', '));
console.log('Last 20:', centerD4.slice(-20).join(', '));

// Groups of consecutive d-values
const groups = [];
let gStart = centerD4[0];
for (let i = 1; i <= centerD4.length; i++) {
  if (i === centerD4.length || centerD4[i] !== centerD4[i-1] + 1) {
    groups.push(`${gStart}-${centerD4[i-1]} (${centerD4[i-1]-gStart+1})`);
    if (i < centerD4.length) gStart = centerD4[i];
  }
}
console.log('Groups:', groups.join(', '));
