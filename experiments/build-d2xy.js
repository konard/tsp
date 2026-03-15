// Build a d2xy function directly from the recursive structure.
// Key insight: the grid is always 2^n x 2^n.
// We need to find how to go from d value to (x,y) coordinates.
//
// Approach: look at d in base-4 digits, and see how each digit determines
// which quadrant and what transform to apply.
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

// Build xy2d tables
function buildXY2D(path) {
  const n = Math.round(Math.sqrt(path.length));
  const table = {};
  for (let d = 0; d < path.length; d++) {
    table[`${path[d].col},${path[d].row}`] = d;
  }
  return table;
}

const xy2d1 = buildXY2D(step1);
const xy2d2 = buildXY2D(step2);
const xy2d3 = buildXY2D(step3);
const xy2d4 = buildXY2D(step4);

// For step 2 (4x4), each cell (x,y) can be decomposed as:
// high bits: (x>>1, y>>1) = parent position in 2x2 grid
// low bits: (x&1, y&1) = local position within 2x2 sub-block
// parent d = xy2d_step1[parent_x, parent_y]
// local d = some function of local_x, local_y, and parent context

// Let me extract the "state" that determines the local mapping
// For each parent cell, compute what "state" it's in based on the local d mapping

function getLocalMapping(xy2d, parentPath, parentXY2D, gridSize) {
  const half = gridSize / 2;
  const mappings = {};

  for (let pd = 0; pd < parentPath.length; pd++) {
    const px = parentPath[pd].col;
    const py = parentPath[pd].row;

    // Get d values for all 4 local positions
    const localDs = {};
    for (let ly = 0; ly < 2; ly++) {
      for (let lx = 0; lx < 2; lx++) {
        const gx = px * 2 + lx;
        const gy = py * 2 + ly;
        const d = xy2d[`${gx},${gy}`];
        localDs[`${lx},${ly}`] = d;
      }
    }

    // Sort by d to get visit order
    const sorted = Object.entries(localDs).sort((a, b) => a[1] - b[1]);
    const visitOrder = sorted.map(([k]) => k).join(' -> ');
    mappings[pd] = { px, py, localDs, visitOrder, sorted };
  }

  return mappings;
}

console.log('=== Step 1 -> Step 2 local mappings ===');
const m12 = getLocalMapping(xy2d2, step1, xy2d1, 4);
for (const [pd, m] of Object.entries(m12)) {
  const ds = m.sorted.map(([k, d]) => `${k}:${d}`).join(', ');
  console.log(`  pd=${pd} (${m.px},${m.py}): ${ds} | order: ${m.visitOrder}`);
}

console.log('\n=== Step 2 -> Step 3 local mappings ===');
const m23 = getLocalMapping(xy2d3, step2, xy2d2, 8);
for (const [pd, m] of Object.entries(m23)) {
  const ds = m.sorted.map(([k, d]) => `${k}:${d}`).join(', ');
  console.log(`  pd=${pd} (${m.px},${m.py}): ${ds} | order: ${m.visitOrder}`);
}

console.log('\n=== Step 3 -> Step 4 local mappings ===');
const m34 = getLocalMapping(xy2d4, step3, xy2d3, 16);
// Only print first and last few to save space
for (let pd = 0; pd < 64; pd++) {
  const m = m34[pd];
  const ds = m.sorted.map(([k, d]) => `${k}:${d}`).join(', ');
  if (pd < 5 || pd > 59) {
    console.log(`  pd=${String(pd).padStart(2)} (${m.px},${m.py}): ${ds} | order: ${m.visitOrder}`);
  }
}

// Now, the local visit order defines a "state" or "orientation".
// There are only a few possible visit orders for a 2x2 block:
// Let me categorize them.
console.log('\n=== Unique visit orders ===');
const allOrders = new Set();
for (const m of Object.values(m12)) allOrders.add(m.visitOrder);
for (const m of Object.values(m23)) allOrders.add(m.visitOrder);
for (const m of Object.values(m34)) allOrders.add(m.visitOrder);
for (const order of allOrders) {
  console.log(`  ${order}`);
}

// Let's name these orientations:
// Base (step 1): (1,1) -> (0,1) -> (0,0) -> (1,0) = "A" orientation
// Possible orientations:
// A: 1,1 -> 0,1 -> 0,0 -> 1,0  (start BR, CW spiral to TR)
// B: 0,0 -> 1,0 -> 1,1 -> 0,1  (start TL, CW spiral to BL)
// C: 1,0 -> 1,1 -> 0,1 -> 0,0  (start TR, CCW spiral to TL)
// D: 0,1 -> 0,0 -> 1,0 -> 1,1  (start BL, CCW spiral to BR)

const orientationMap = {
  '1,1 -> 0,1 -> 0,0 -> 1,0': 'A',
  '0,0 -> 1,0 -> 1,1 -> 0,1': 'B',
  '1,0 -> 1,1 -> 0,1 -> 0,0': 'C',
  '0,1 -> 0,0 -> 1,0 -> 1,1': 'D',
};

console.log('\n=== Orientation classification ===');
console.log('\nStep 1->2:');
const oSeq12 = [];
for (let pd = 0; pd < 4; pd++) {
  const o = orientationMap[m12[pd].visitOrder] || '?';
  oSeq12.push(o);
  console.log(`  pd=${pd}: ${o}`);
}
console.log(`Sequence: ${oSeq12.join('')}`);

console.log('\nStep 2->3:');
const oSeq23 = [];
for (let pd = 0; pd < 16; pd++) {
  const o = orientationMap[m23[pd].visitOrder] || '?';
  oSeq23.push(o);
}
console.log(`Sequence: ${oSeq23.join('')}`);

console.log('\nStep 3->4:');
const oSeq34 = [];
for (let pd = 0; pd < 64; pd++) {
  const o = orientationMap[m34[pd].visitOrder] || '?';
  oSeq34.push(o);
}
console.log(`Sequence: ${oSeq34.join('')}`);

// Now check: do the orientations follow a pattern?
// For each parent orientation, what orientations do its children get?
console.log('\n=== Parent orientation -> child orientations ===');

// At step 1->2: parent orientations are A (since step 1 IS orientation A)
// Children: A B C B (for pd 0,1,2,3 = step1 d values 0,1,2,3)
// step1 is [A] and its children are: pd0=A, pd1=C, pd2=A, pd3=B
// Wait let me re-check.

console.log('\nStep 1 is orientation A: (1,1)->(0,1)->(0,0)->(1,0)');
console.log('Children orientations (step1->2): pd0=' + oSeq12[0] + ' pd1=' + oSeq12[1] + ' pd2=' + oSeq12[2] + ' pd3=' + oSeq12[3]);

// For step 2->3, each of the 16 parent cells has an orientation from oSeq23.
// The parent cell at pd=k in step 2 has orientation oSeq12[...].
// Wait, the orientation of the PARENT cell is determined by step 1->2.
// The orientation of the CHILD cells (within step 3) is oSeq23.
// But we need to know: given a parent with orientation X, what are its 4 children's orientations?

// From step 1->2:
// Parent has orientation A, children (in visit order 0,1,2,3): A, C, A, B
console.log('\nParent A -> children:', oSeq12.join(''));

// From step 2->3:
// Parent pd=0 has orientation A (from oSeq12), its children (in step 2->3) at pd=0 are oSeq23[0]
// But wait, the children of a parent are the 4 sub-cells within that parent.
// The "children" in step 2->3 mapping ARE the pd values 0-15, where each pd corresponds
// to a cell in step 2, and its orientation is how it maps to step 3.
// The PARENT of each step-2 cell (in the step1 grid) determines which orientation it has.

// So: each step-2 cell has an orientation (oSeq23[pd]) and belongs to a step-1 parent.
// step-1 parent d=0 at (1,1) owns step-2 cells at block (0,0): step2 cells with px=1,py=1
// No wait, step-1 d=0 is at (1,1). Step-2 sub-block for step-1 cell (1,1) is
// cols 2-3, rows 2-3. That's step-2 cells (2,2),(3,2),(2,3),(3,3).
// Their step-2 d values: (2,2)=2, (3,2)=3, (2,3)=5, (3,3)=4
// Their orientations (from oSeq23): oSeq23[2]='A', oSeq23[3]='D', oSeq23[4]='B', oSeq23[5]='B'
// Visit order within parent: d=2,3,4,5 -> A,D,B,B

// step-1 d=1 is at (0,1). Block cols 0-1, rows 2-3.
// step-2 d values: (0,2)=8, (1,2)=1, (0,3)=7, (1,3)=6
// Visit order: d=1,6,7,8 -> oSeq23[1]='A', oSeq23[6]='A', oSeq23[7]='A', oSeq23[8]='D'
// Sorted by visit: A(d=1), A(d=6), A(d=7), D(d=8)

// step-1 d=2 is at (0,0). Block cols 0-1, rows 0-1.
// step-2 d values: (0,0)=10, (1,0)=11, (0,1)=9, (1,1)=0
// Visit order: d=0,9,10,11 -> oSeq23[0]='A', oSeq23[9]='D', oSeq23[10]='D', oSeq23[11]='B'
// Sorted: A(d=0), D(d=9), D(d=10), B(d=11)

// step-1 d=3 is at (1,0). Block cols 2-3, rows 0-1.
// step-2 d values: (2,0)=12, (3,0)=13, (2,1)=15, (3,1)=14
// Visit order: d=12,13,14,15 -> oSeq23[12]='B', oSeq23[13]='B', oSeq23[14]='C', oSeq23[15]='A'
// Sorted: B(d=12), B(d=13), C(d=14), A(d=15)

console.log('\nStep 2->3 grouped by step-1 parent:');
console.log('  Parent d=0 (orient A) children visit order: A,D,B,B');
console.log('  Parent d=1 (orient C) children visit order: A,A,A,D');
console.log('  Parent d=2 (orient A) children visit order: A,D,D,B');
console.log('  Parent d=3 (orient B) children visit order: B,B,C,A');

// Hmm, parent d=0 and d=2 both have orientation A but different child patterns!
// A->ADBB vs A->ADDB
// This means the child pattern depends on MORE than just the parent's orientation.

// Let me check: does it depend on the parent's POSITION within its own parent?
// parent d=0 is the 1st child of step-1's A (index 0 in A's children)
// parent d=2 is the 3rd child of step-1's A (index 2 in A's children)
// Both have orientation A but are in different positions.

// The POSITION within parent matters. Let me define the "position index" as
// which child (0,1,2,3) of the grandparent this cell is.

// Actually, I think the recursion depends on the ENTRY and EXIT directions,
// not just the orientation. Let me compute those.

console.log('\n=== Entry/exit direction analysis ===');
// For each cell in step 2, compute entry and exit directions:
function getEntryExitDirs(path) {
  const dirs = [];
  for (let d = 0; d < path.length; d++) {
    const prev = d > 0 ? path[d-1] : null;
    const next = d < path.length - 1 ? path[d+1] : null;
    let entry = -1, exit = -1;
    if (prev) {
      const dx = path[d].col - prev.col;
      const dy = path[d].row - prev.row;
      entry = dx === 1 ? 1 : dx === -1 ? 3 : dy === 1 ? 2 : 0;
    }
    if (next) {
      const dx = next.col - path[d].col;
      const dy = next.row - path[d].row;
      exit = dx === 1 ? 1 : dx === -1 ? 3 : dy === 1 ? 2 : 0;
    }
    dirs.push({ entry, exit });
  }
  return dirs;
}

const dirs2 = getEntryExitDirs(step2);
const dirs3 = getEntryExitDirs(step3);

// For each step-2 cell, track (orientation, entry, exit)
console.log('\nStep 2 cells with (orient, entry, exit):');
for (let pd = 0; pd < 16; pd++) {
  const o = oSeq23[pd];
  const e = dirs2[pd].entry;
  const x = dirs2[pd].exit;
  const dirNames = ['U', 'R', 'D', 'L'];
  console.log(`  pd=${String(pd).padStart(2)}: orient=${o} entry=${e>=0?dirNames[e]:'S'} exit=${x>=0?dirNames[x]:'E'}`);
}

// Now group by (orientation, entry, exit) and see what child orientations result:
console.log('\n=== Mapping: (parent_orient, entry, exit) -> child orientations ===');
// We need step 3->4 data to see the children of each step-2 cell.
// Each step-2 cell at position (px,py) expands to a 2x2 block in step 3.
// The children's orientations come from oSeq34.

// For each step-2 cell pd:
const dirNames = ['U', 'R', 'D', 'L'];
const stateToChildren = {};

for (let pd = 0; pd < 16; pd++) {
  const o = oSeq23[pd]; // orientation of this cell when expanding to step 3
  const e = dirs2[pd].entry;
  const x = dirs2[pd].exit;

  // This cell at step 2 position step2[pd]
  const px = step2[pd].col;
  const py = step2[pd].row;

  // Its children in step 3 are at (2*px+lx, 2*py+ly)
  // Their step-3 d values:
  const childDs = [];
  for (let ly = 0; ly < 2; ly++) {
    for (let lx = 0; lx < 2; lx++) {
      const gx = px * 2 + lx;
      const gy = py * 2 + ly;
      const d3 = xy2d3[`${gx},${gy}`];
      childDs.push({ lx, ly, d3 });
    }
  }
  childDs.sort((a, b) => a.d3 - b.d3);

  // Each child (in step 3) has an orientation from oSeq34
  const childOrients = childDs.map(c => oSeq34[c.d3]);

  const key = `${o},${e>=0?dirNames[e]:'S'},${x>=0?dirNames[x]:'E'}`;
  const value = childOrients.join('');

  if (!stateToChildren[key]) {
    stateToChildren[key] = value;
  } else if (stateToChildren[key] !== value) {
    stateToChildren[key] += ` | ${value} (CONFLICT at pd=${pd})`;
  }
}

for (const [key, val] of Object.entries(stateToChildren)) {
  console.log(`  (${key}) -> ${val}`);
}
