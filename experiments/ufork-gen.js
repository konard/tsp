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

// Step 3 (n=8) detailed trace:
// d=0:  (3,7) start
// d=1-3: L3 to (0,7)
// d=4-10: D7 to (0,0)
// d=11-17: R7 to (7,0)
// d=18-20: U3 to (7,3)
// -- inward zigzag --
// d=21-25: L5 from (7,3) to (2,3). LEFT from col 7 by 5 to col 2.
// d=26: D1 to (2,2)
// d=27-30: R4 from (2,2) to (6,2). RIGHT from col 2 by 4 to col 6.
// d=31: D1 to (6,1)
// d=32-36: L5 from (6,1) to (1,1). LEFT from col 6 by 5 to col 1.
// -- up transition --
// d=37-41: U5 from (1,1) to (1,6). UP from row 1 by 5 to row 6.
// -- outward zigzag --
// d=42-46: R5 from (1,6) to (6,6). RIGHT from col 1 by 5 to col 6.
// d=47: D1 to (6,5)
// d=48-51: L4 from (6,5) to (2,5). LEFT from col 6 by 4 to col 2.
// d=52: D1 to (2,4)
// d=53-57: R5 from (2,4) to (7,4). RIGHT from col 2 by 5 to col 7.
// -- final --
// d=58-60: U3 from (7,4) to (7,7). UP from row 4 by 3 to row 7.
// d=61-63: L3 from (7,7) to (4,7). LEFT from col 7 by 3 to col 4.

// Key insight for the zigzag bounds:
// Inward zigzag:
//   Row 3 (first): L from col n-1-1=6 to col 2. WAIT: we're at (7,3), go L5.
//     Actually we go from col 7, taking 5 steps left, to col 2.
//     So the LEFT limit is 2.
//   Row 2: R from col 2+1=3 (after D1 at col 2) to col 6.
//     So RIGHT limit is n-2=6.
//   Row 1: L from col 6-1=5 (after D1 at col 6... wait we're at (6,1), go L5 to col 1.
//     LEFT limit is 1.
//
// Outward zigzag:
//   Row 6: R from col 1+1=2 to col 6.
//     RIGHT limit is n-2=6. But wait, we're at (1,6), go R5 to col 6.
//   Row 5: L from col 6-1=5 to col 2.
//     LEFT limit is 2.
//   Row 4: R from col 2+1=3 to col 7=n-1.
//     RIGHT limit is n-1=7 (last row extends to edge!)

// So the zigzag uses limits that shrink/grow by 1 each level:
// Inward:
//   Row half-1: from col n-1 L to col 2 (RIGHT edge to leftLimit=2)
//   Down 1 (at col 2)
//   Row half-2: from col 2 R to col n-2 (LEFT of leftLimit to rightLimit=n-2)
//     Actually from col 2+1=3 to col 6. That's rightLimit=n-2.
//     Wait: (2,2) R4 goes to (6,2). From col 2, 4 steps right = col 6. So starting from col 2.
//     Actually after D1 at (2,2), we're at col 2. Then R4 goes to col 6.
//     So we start at col 2 (the col we arrived at) and go right.
//   Down 1 (at col 6)
//   Row 1: from col 6 L to col 1

// The pattern is:
// For the inward zigzag (going DOWN from row half-1 to row 1):
//   Row half-1: L from current_col to col 2. Steps = current_col - 2.
//   D1. Now at col 2.
//   Row half-2: R from col 2 to col n-2. Steps = n-2-2 = n-4.
//   D1. Now at col n-2.
//   Row half-3: L from col n-2 to col 1. Steps = n-2-1 = n-3.
//   (If more rows, D1. Now at col 1.)
//   Row half-4: R from col 1 to col n-1... no wait.

// For n=8, there are exactly 3 inward rows (half-1=3 rows: 3, 2, 1).
// For general n:
// Row half-1: L to col 2
// Row half-2: R to col n-2
// Row 1: L to col 1
// This is 3 rows = half-1 = 3 for n=8.

// For larger n, say n=16, half=8:
// Row 7: L to col ?
// Row 6: R to col ?
// Row 5: L to col ?
// Row 4: R to col ?
// Row 3: L to col ?
// Row 2: R to col ?
// Row 1: L to col ?
// That's 7 rows.

// But wait - for n=16, the inner region starts at col 4 and row 4.
// The inward zigzag should only be in the FRAME region (outside the center).
// But in step 3, there IS no separate center (it's all one path).

// OK let me just re-derive the exact column limits by looking at what 
// the algorithm actually does for n=8, then generalize.

// For n=8:
// Inward zigzag from (n-1, half-1)=(7,3):
//   Row 3: L from col 7 to col 2. leftLimit=2. Steps=5.
//   D1 at col 2.
//   Row 2: R from col 2 to col 6. rightLimit=6=n-2. Steps=4.
//   D1 at col 6.
//   Row 1: L from col 6 to col 1. leftLimit=1. Steps=5.
//
// Col limits: 2, 6, 1.
// Or: for odd-indexed scans (0-based): leftLimit decreases by 1 each time.
// Scan 0 (row 3, L): limit 2
// Scan 1 (row 2, R): limit 6
// Scan 2 (row 1, L): limit 1
//
// Up transition: from (1,1) to (1,n-2)=(1,6). Steps=5=n-2-1.
//
// Outward zigzag:
//   Row 6: R from col 1 to col 6. rightLimit=6=n-2. Steps=5.
//   D1 at col 6.
//   Row 5: L from col 6 to col 2. leftLimit=2. Steps=4.
//   D1 at col 2.
//   Row 4: R from col 2 to col 7. rightLimit=7=n-1! Steps=5.
//
// Col limits: 6, 2, 7.
// Scan 0 (row 6, R): limit 6
// Scan 1 (row 5, L): limit 2
// Scan 2 (row 4, R): limit 7 (extended by 1!)
//
// Final: from (7,4) U3 to (7,7), L3 to (4,7).

// The key difference: the LAST scan of the outward zigzag extends
// to col n-1 (one extra column).

// And the LAST scan of the inward zigzag extends to col 1.

// Let me formalize:
// Inward zigzag from (n-1, half-1):
//   Scans rows: half-1, half-2, ..., 1 (total: half-1 scans)
//   Each scan alternates L/R starting with L.
//   L scans go to leftBound, R scans go to rightBound.
//   Initial bounds: leftBound=2, rightBound=n-2.
//   After each L-R pair, bounds stay the same? Or shift?
//   For n=8: L to 2, R to 6, L to 1. 
//   First L: to 2. Then R: to 6. Then L: to 1.
//   The third scan extends to 1 instead of 2.
//   This is because it's the LAST scan.
//
// For general n, the inward zigzag has half-1 scans.
// All scans except the last: alternate between leftBound=2 and rightBound=n-2.
// The LAST scan extends by 1 further:
//   If last scan is L: goes to col 1 instead of col 2.
//   If last scan is R: goes to col n-1 instead of col n-2.

// Similarly for outward zigzag:
// Scans rows: n-2, n-3, ..., half (total: half-1 scans)
// Alternating R/L starting with R.
// Bounds: leftBound=2, rightBound=n-2.
// Last scan extends by 1:
//   R to col n-1 instead of n-2.

// Let me verify by generating step 3.

function generatePath(n) {
  if (n < 2) return [{col: 0, row: 0}];
  if (n === 2) return [{col:1,row:1},{col:0,row:1},{col:0,row:0},{col:1,row:0}];
  
  const path = [];
  let cx, cy;
  
  function put(col, row) { path.push({col, row}); cx = col; cy = row; }
  function moveBy(dx, dy, steps) {
    for (let i = 0; i < steps; i++) { cx += dx; cy += dy; put(cx, cy); }
  }
  
  const half = n / 2;
  
  // Start
  put(half - 1, n - 1);
  
  // Phase 1: L across top-left half
  moveBy(-1, 0, half - 1);
  
  // Phase 2: D left column
  moveBy(0, -1, n - 1);
  
  // Phase 3: R across bottom
  moveBy(1, 0, n - 1);
  
  // Phase 4: U right column to mid
  moveBy(0, 1, half - 1);
  
  // Phase 5: Inward zigzag (rows half-1 down to 1)
  const numInwardScans = half - 1;
  let goingLeft = true;
  
  for (let scan = 0; scan < numInwardScans; scan++) {
    const isLast = (scan === numInwardScans - 1);
    
    if (goingLeft) {
      const target = isLast ? 1 : 2;
      moveBy(-1, 0, cx - target);
    } else {
      const target = isLast ? (n - 1) : (n - 2);
      moveBy(1, 0, target - cx);
    }
    
    if (!isLast) {
      // D1
      moveBy(0, -1, 1);
    }
    
    goingLeft = !goingLeft;
  }
  
  // Phase 6: UP col 1 to row n-2
  moveBy(0, 1, (n - 2) - cy);
  
  // Phase 7: Outward zigzag (rows n-2 down to half)
  const numOutwardScans = half - 1;
  let goingRight = true;
  
  for (let scan = 0; scan < numOutwardScans; scan++) {
    const isLast = (scan === numOutwardScans - 1);
    
    if (goingRight) {
      const target = isLast ? (n - 1) : (n - 2);
      moveBy(1, 0, target - cx);
    } else {
      const target = isLast ? 1 : 2;
      moveBy(-1, 0, cx - target);
    }
    
    if (!isLast) {
      // D1
      moveBy(0, -1, 1);
    }
    
    goingRight = !goingRight;
  }
  
  // Phase 8: UP right column to top
  moveBy(0, 1, (n - 1) - cy);
  
  // Phase 9: L across top-right half
  moveBy(-1, 0, half - 1);
  
  return path;
}

// Test step 3 (n=8)
const gen3 = generatePath(8);
console.log('=== Step 3 ===');
console.log('Generated:', gen3.length, 'cells. Expected:', step3.length);
let match3 = true;
for (let i = 0; i < Math.min(gen3.length, step3.length); i++) {
  if (gen3[i].col !== step3[i].col || gen3[i].row !== step3[i].row) {
    console.log(`MISMATCH at d=${i}: gen=(${gen3[i].col},${gen3[i].row}) target=(${step3[i].col},${step3[i].row})`);
    match3 = false;
    break;
  }
}
if (match3 && gen3.length === step3.length) console.log('PERFECT MATCH!');

// Test step 2 (n=4)
const gen2 = generatePath(4);
console.log('\n=== Step 2 ===');
console.log('Generated:', gen2.map(p => `(${p.col},${p.row})`).join(' -> '));
console.log('Target:   ', step2.map(p => `(${p.col},${p.row})`).join(' -> '));
const match2 = JSON.stringify(gen2) === JSON.stringify(step2);
console.log('Match:', match2);

// Test step 1 (n=2)
const gen1 = generatePath(2);
console.log('\n=== Step 1 ===');
console.log('Generated:', gen1.map(p => `(${p.col},${p.row})`).join(' -> '));
console.log('Target:   ', step1.map(p => `(${p.col},${p.row})`).join(' -> '));
const match1 = JSON.stringify(gen1) === JSON.stringify(step1);
console.log('Match:', match1);

// Test step 4 (n=16)
const gen4 = generatePath(16);
console.log('\n=== Step 4 ===');
console.log('Generated:', gen4.length, 'cells. Expected:', step4.length);
let match4 = true;
for (let i = 0; i < Math.min(gen4.length, step4.length); i++) {
  if (gen4[i].col !== step4[i].col || gen4[i].row !== step4[i].row) {
    console.log(`MISMATCH at d=${i}: gen=(${gen4[i].col},${gen4[i].row}) target=(${step4[i].col},${step4[i].row})`);
    match4 = false;
    break;
  }
}
if (match4 && gen4.length === step4.length) console.log('PERFECT MATCH!');
