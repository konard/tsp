// Direct generation: build the curve path recursively by simulating
// the exact interleaving pattern observed in the target data.
//
// Key insight from the data:
// 4 orientations: A, B, C, D
// A: (1,1) -> (0,1) -> (0,0) -> (1,0)
// B: (0,0) -> (1,0) -> (1,1) -> (0,1)
// C: (1,0) -> (1,1) -> (0,1) -> (0,0)
// D: (0,1) -> (0,0) -> (1,0) -> (1,1)
//
// From step 1->2: parent A -> children BCAB
// From step 2->3: check what parent orientation + child_index -> child orientation
//
// Let me check: for A parent with 4 children indexed 0,1,2,3:
//   child 0 gets orient B (from step1->2: pd=0 in parent A)
//   child 1 gets orient C
//   child 2 gets orient A
//   child 3 gets orient B
//
// Now verify at step 2->3:
// Each step-2 cell has an orientation from step1->2 (BCAB).
// And each step-2 cell has children oriented according to step2->3.
//
// pd=0 (orient B from step1->2): children AADB (step2->3 for its 4 sub-cells)
//   -> B parent, children indexed 0,1,2,3 (in B's visit order): A,A,D,B
// pd=1 (orient C from step1->2): children AAAD
//   -> C parent, children: A,A,A,D
// pd=2 (orient A from step1->2): children ADBB... wait I had ADDB earlier
// Hmm let me re-derive this carefully.

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

function buildXY2D(path) {
  const table = {};
  for (let d = 0; d < path.length; d++) {
    table[`${path[d].col},${path[d].row}`] = d;
  }
  return table;
}

const xy2d2 = buildXY2D(step2);
const xy2d3 = buildXY2D(step3);
const xy2d4 = buildXY2D(step4);

// The 4 orientations define visit order of 2x2 sub-block:
const orientations = {
  A: [{col:1,row:1}, {col:0,row:1}, {col:0,row:0}, {col:1,row:0}],
  B: [{col:0,row:0}, {col:1,row:0}, {col:1,row:1}, {col:0,row:1}],
  C: [{col:1,row:0}, {col:1,row:1}, {col:0,row:1}, {col:0,row:0}],
  D: [{col:0,row:1}, {col:0,row:0}, {col:1,row:0}, {col:1,row:1}],
};

// For each parent orientation, derive the child orientation pattern.
// We know: A -> BCAB from step1->2.
// Now derive B, C, D from step2->3.

// Step 2 has orientation sequence (from step1->2): BCAB
// Step 2 pd=0 has orient B (1st child of step1's A)
// Step 2 pd=1 has orient C (2nd child)
// Step 2 pd=2 has orient A (3rd child)
// Step 2 pd=3 has orient B (4th child)

// For B parent (pd=0 in step2):
// pd=0 at position (1,1) in step2.
// B's visit order: (0,0),(1,0),(1,1),(0,1)
// Sub-cells in step3: (2*1+lx, 2*1+ly) = (2+lx, 2+ly) for lx,ly in {0,1}
// Their d3 values (from step2->3 analysis):
// (2,2)=26 orient A, (3,2)=27 orient ?, (3,3)=24 orient ?, (2,3)=25 orient ?
// Wait, I need the orientation of each sub-cell from step3->4 (oSeq34).
// Actually no - the child orientations from step2->3 tell us what orientation each step-2 cell
// gets when expanded into step 3. But what I need is:
// For parent pd=0 (orient B), what orientations do its 4 sub-cells get when expanding to next step?

// The sub-cells of pd=0 are visited in B's order: (0,0),(1,0),(1,1),(0,1)
// In global coords: (2,2),(3,2),(3,3),(2,3)
// Their step-3 d values:
// (2,2): xy2d3 = ?
const d3_22 = xy2d3['2,2']; // should be some value
const d3_32 = xy2d3['3,2'];
const d3_33 = xy2d3['3,3'];
const d3_23 = xy2d3['2,3'];
console.log(`pd=0 (B parent) sub-cells: (2,2)=d${d3_22}, (3,2)=d${d3_32}, (3,3)=d${d3_33}, (2,3)=d${d3_23}`);
// Wait, these are individual cells in the 8x8 grid, not 4x4 blocks.
// I need to look at 4x4 blocks within step3 -> step4 mapping.

// Let me re-think the whole approach.
// The recursion works at a SINGLE level at a time.
// At each level, the grid doubles. Each cell becomes a 2x2 block.
// Within that block, the 4 cells are visited in an order determined by the cell's "orientation".
// The orientation of each cell is determined by its parent's orientation and its position within parent.

// So the mapping is: given parent orient O and child index i (0,1,2,3 in O's visit order),
// what is the child's orientation?

// From step1 (A) -> step2:
// A parent, child 0 -> B, child 1 -> C, child 2 -> A, child 3 -> B
// So: A -> [B, C, A, B]

// From step2 -> step3:
// We need to check each step-2 cell's orient and see what its sub-cells' orients are in step3->step4

// Each step-2 cell has an orientation. When it expands in step 3, its sub-cells in step 3
// are visited in that orientation's order. Each sub-cell in step 3 has its OWN orientation
// which determines how IT will expand in step 4.

// So the "child orientations" are from the step3->step4 mapping applied to the sub-cells
// of each step-2 cell.

// Let me compute step3->step4 orientations for each step-3 cell:
const oSeq34 = [];
for (let pd = 0; pd < 64; pd++) {
  const px = step3[pd].col;
  const py = step3[pd].row;

  // Sub-cells in step 4: (2*px+lx, 2*py+ly)
  const localDs = [];
  for (let ly = 0; ly < 2; ly++) {
    for (let lx = 0; lx < 2; lx++) {
      const gx = px * 2 + lx;
      const gy = py * 2 + ly;
      const d4 = xy2d4[`${gx},${gy}`];
      localDs.push({ lx, ly, d4 });
    }
  }
  localDs.sort((a, b) => a.d4 - b.d4);
  const visitOrder = localDs.map(l => `${l.lx},${l.ly}`).join(' -> ');

  let orient = '?';
  for (const [name, pattern] of Object.entries(orientations)) {
    const patStr = pattern.map(p => `${p.col},${p.row}`).join(' -> ');
    if (patStr === visitOrder) { orient = name; break; }
  }
  oSeq34.push(orient);
}

// Now, for each step-2 cell (with known orient), find its sub-cells in step-3
// and look up those sub-cells' orientations from oSeq34.
const step2Orients = ['B', 'C', 'A', 'B', 'B', 'B', 'A', 'A', 'D', 'D', 'D', 'B', 'B', 'B', 'C', 'A'];
// Wait, I got this from the earlier analysis where step2->3 sequence was AAADBBAADDDBBBCA

// Actually let me recompute step2->3 orientations:
const oSeq23 = [];
for (let pd = 0; pd < 16; pd++) {
  const px = step2[pd].col;
  const py = step2[pd].row;
  const localDs = [];
  for (let ly = 0; ly < 2; ly++) {
    for (let lx = 0; lx < 2; lx++) {
      const gx = px * 2 + lx;
      const gy = py * 2 + ly;
      const d3 = xy2d3[`${gx},${gy}`];
      localDs.push({ lx, ly, d3 });
    }
  }
  localDs.sort((a, b) => a.d3 - b.d3);
  const visitOrder = localDs.map(l => `${l.lx},${l.ly}`).join(' -> ');
  let orient = '?';
  for (const [name, pattern] of Object.entries(orientations)) {
    const patStr = pattern.map(p => `${p.col},${p.row}`).join(' -> ');
    if (patStr === visitOrder) { orient = name; break; }
  }
  oSeq23.push(orient);
}

console.log('\nStep 2->3 orientations:', oSeq23.join(''));
// These are the orientations that each step-2 cell gets for expanding into step 3.

// Step 1->2 orientations: BCAB
const oSeq12 = ['B', 'C', 'A', 'B'];

// Now, for each step-2 cell (indexed by pd), its orient from step1->2 is oSeq12[parent_child_index].
// But the step-2 cell also has an orient from step2->3 (oSeq23[pd]).
// The step2->3 orient is what determines how the step-2 cell expands.
// The step1->2 orient is what determines the VISIT ORDER of the step-2 cell within its parent.

// To find the recursion rule, I need:
// For each step-2 cell pd (with orient from step2->3 = oSeq23[pd]):
// Its 4 sub-cells in step 3 have orientations from oSeq34.
// Those 4 sub-cells, visited in order of oSeq23[pd], give 4 child orientations.

console.log('\n=== Deriving child orientation rules from step 2->3 and step 3->4 ===');
const rules = {};

for (let pd = 0; pd < 16; pd++) {
  const parentOrient = oSeq23[pd]; // how this cell expands into step3
  const px = step2[pd].col;
  const py = step2[pd].row;

  // Visit order of sub-cells in step 3 according to parentOrient:
  const visitOrder = orientations[parentOrient];

  // For each sub-cell in visit order, find its orientation from step3->4:
  const childOrients = visitOrder.map(local => {
    const gx = px * 2 + local.col;
    const gy = py * 2 + local.row;
    const d3 = xy2d3[`${gx},${gy}`];
    return oSeq34[d3];
  });

  const key = parentOrient;
  const val = childOrients.join('');

  if (!rules[key]) {
    rules[key] = val;
    console.log(`  ${key} -> ${val} (from pd=${pd})`);
  } else if (rules[key] !== val) {
    console.log(`  CONFLICT: ${key} -> ${val} vs ${rules[key]} (from pd=${pd})`);
  }
}

console.log('\nDerived rules:');
for (const [k, v] of Object.entries(rules)) {
  console.log(`  ${k} -> [${v[0]}, ${v[1]}, ${v[2]}, ${v[3]}]`);
}

// If there are no conflicts, we have the recursion!
// Let me verify by generating step 2, 3, 4 from these rules.

function generatePath(order, orient) {
  if (order === 0) {
    return [{col: 0, row: 0}];
  }

  if (order === 1) {
    return orientations[orient].map(p => ({col: p.col, row: p.row}));
  }

  // Get child orientations for this orient
  const childOrients = rules[orient].split('');
  const visitOrder = orientations[orient];
  const halfSize = Math.pow(2, order - 1);

  const path = [];
  for (let i = 0; i < 4; i++) {
    const childOrient = childOrients[i];
    const childPath = generatePath(order - 1, childOrient);
    const offset = visitOrder[i];

    // Map child path to global coords
    for (const p of childPath) {
      path.push({
        col: offset.col * halfSize + p.col,
        row: offset.row * halfSize + p.row
      });
    }
  }

  return path;
}

// Test step 2 (order 2, orient A - the top-level orientation)
console.log('\n=== Testing generated paths ===');
const gen2 = generatePath(2, 'A');
console.log('Generated step 2:', gen2.map(p => `(${p.col},${p.row})`).join(' -> '));
console.log('Target step 2:   ', step2.map(p => `(${p.col},${p.row})`).join(' -> '));
console.log('Match:', JSON.stringify(gen2) === JSON.stringify(step2));

const gen3 = generatePath(3, 'A');
console.log('\nGenerated step 3:', gen3.map(p => `(${p.col},${p.row})`).join(' -> '));
console.log('Target step 3:   ', step3.map(p => `(${p.col},${p.row})`).join(' -> '));
console.log('Match:', JSON.stringify(gen3) === JSON.stringify(step3));

const gen4 = generatePath(4, 'A');
console.log('\nGenerated step 4 length:', gen4.length, 'Target:', step4.length);
console.log('Match:', JSON.stringify(gen4) === JSON.stringify(step4));
