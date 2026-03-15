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

// Algorithm:
// For order 1 (n=2): hardcoded
// For order 2 (n=4): use the zigzag algorithm but it produces a shifted version
//   of the target. The target step 2 is the SAME cycle started at a different point.
//   Since this is a Hamiltonian CYCLE (closed loop), the starting point can be
//   adjusted later when generating the TSP tour.
// For order 3+ (n=8+): use the zigzag algorithm.
//
// Actually, looking at step 2 more carefully:
// My algorithm generates: (1,3) -> ... -> (2,3) (starting at top-left of top row)
// Target step 2: (1,1) -> ... -> (2,1) (starting at center)
// These are the SAME cycle, just different starting points.
//
// For the TSP tour, we need a specific starting point. Let me check what
// the repo expects.
//
// But for step 4, the issue is that step 4 is NOT the pure zigzag pattern
// applied to a 16x16 grid. It has the recursive center embedding.
//
// Let me check: does my zigzag algorithm for n=16 produce a different
// CYCLE than step 4? Or the same cycle with a different start?

function generateZigzag(n) {
  if (n === 2) return [{col:1,row:1},{col:0,row:1},{col:0,row:0},{col:1,row:0}];
  
  const path = [];
  let cx, cy;
  function put(col, row) { path.push({col, row}); cx = col; cy = row; }
  function moveBy(dx, dy, steps) {
    for (let i = 0; i < steps; i++) { cx += dx; cy += dy; put(cx, cy); }
  }
  
  const half = n / 2;
  
  put(half - 1, n - 1);
  moveBy(-1, 0, half - 1);
  moveBy(0, -1, n - 1);
  moveBy(1, 0, n - 1);
  moveBy(0, 1, half - 1);
  
  const numInwardScans = half - 1;
  let goingLeft = true;
  for (let scan = 0; scan < numInwardScans; scan++) {
    const isLast = (scan === numInwardScans - 1);
    if (goingLeft) moveBy(-1, 0, cx - (isLast ? 1 : 2));
    else moveBy(1, 0, (isLast ? (n - 1) : (n - 2)) - cx);
    if (!isLast) moveBy(0, -1, 1);
    goingLeft = !goingLeft;
  }
  
  moveBy(0, 1, (n - 2) - cy);
  
  const numOutwardScans = half - 1;
  let goingRight = true;
  for (let scan = 0; scan < numOutwardScans; scan++) {
    const isLast = (scan === numOutwardScans - 1);
    if (goingRight) moveBy(1, 0, (isLast ? (n - 1) : (n - 2)) - cx);
    else moveBy(-1, 0, cx - (isLast ? 1 : 2));
    if (!isLast) moveBy(0, -1, 1);
    goingRight = !goingRight;
  }
  
  moveBy(0, 1, (n - 1) - cy);
  moveBy(-1, 0, half - 1);
  
  return path;
}

// Check if zigzag(16) produces the same CYCLE as step 4
const gen16 = generateZigzag(16);
console.log('zigzag(16):', gen16.length, 'cells. step4:', step4.length, 'cells');

// Build edge sets to compare cycles
function buildEdgeSet(path) {
  const edges = new Set();
  for (let i = 0; i < path.length; i++) {
    const j = (i + 1) % path.length;
    const a = `${path[i].col},${path[i].row}`;
    const b = `${path[j].col},${path[j].row}`;
    edges.add([a, b].sort().join('-'));
  }
  return edges;
}

const gen16Edges = buildEdgeSet(gen16);
const step4Edges = buildEdgeSet(step4);

let sameEdges = true;
const extraGen = [];
const extraStep4 = [];
for (const e of gen16Edges) {
  if (!step4Edges.has(e)) { sameEdges = false; extraGen.push(e); }
}
for (const e of step4Edges) {
  if (!gen16Edges.has(e)) { sameEdges = false; extraStep4.push(e); }
}
console.log('Same cycle:', sameEdges);
if (!sameEdges) {
  console.log(`Extra in gen: ${extraGen.length}, Extra in step4: ${extraStep4.length}`);
  console.log('First 5 extra in gen:', extraGen.slice(0, 5));
  console.log('First 5 extra in step4:', extraStep4.slice(0, 5));
}

// Also check if gen16 is a circular shift of step 4
for (let shift = 0; shift < 256; shift++) {
  let match = true;
  for (let i = 0; i < 256; i++) {
    const j = (i + shift) % 256;
    if (gen16[i].col !== step4[j].col || gen16[i].row !== step4[j].row) {
      match = false;
      break;
    }
  }
  if (match) { console.log(`zigzag(16) = step4 shifted by ${shift}`); break; }
}

// If they're the same cycle, then we can just use the zigzag algorithm
// for all sizes, and only need to figure out the correct starting point!
