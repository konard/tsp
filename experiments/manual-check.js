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

// center3 and step2 both have 16 points. Let me check if they traverse
// the same SET of edges (same cycle) just in different representation.

// Build edge sets
function edgeSet(path) {
  const edges = new Set();
  for (let i = 0; i < path.length; i++) {
    const j = (i + 1) % path.length;
    const a = `${path[i].col},${path[i].row}`;
    const b = `${path[j].col},${path[j].row}`;
    edges.add(`${a}-${b}`);
    edges.add(`${b}-${a}`); // undirected
  }
  return edges;
}

function extractCenter(path, n, innerSize) {
  const offset = (n - innerSize) / 2;
  return path.filter(p => 
    p.col >= offset && p.col < offset + innerSize && 
    p.row >= offset && p.row < offset + innerSize
  ).map(p => ({col: p.col - offset, row: p.row - offset}));
}

const center3 = extractCenter(step3, 8, 4);

// Check edges (undirected)
const center3Edges = new Set();
for (let i = 0; i < center3.length; i++) {
  const j = (i + 1) % center3.length;
  const a = `${center3[i].col},${center3[i].row}`;
  const b = `${center3[j].col},${center3[j].row}`;
  const edge = [a, b].sort().join('-');
  center3Edges.add(edge);
}

const step2Edges = new Set();
for (let i = 0; i < step2.length; i++) {
  const j = (i + 1) % step2.length;
  const a = `${step2[i].col},${step2[i].row}`;
  const b = `${step2[j].col},${step2[j].row}`;
  const edge = [a, b].sort().join('-');
  step2Edges.add(edge);
}

console.log('center3 edges:', [...center3Edges].sort().join(', '));
console.log('step2 edges:  ', [...step2Edges].sort().join(', '));

// Check if they're the same set of edges (same Hamiltonian cycle)
let sameEdges = true;
for (const e of center3Edges) {
  if (!step2Edges.has(e)) { sameEdges = false; console.log('  center3 has extra edge:', e); }
}
for (const e of step2Edges) {
  if (!center3Edges.has(e)) { sameEdges = false; console.log('  step2 has extra edge:', e); }
}
console.log('Same Hamiltonian cycle:', sameEdges);

// If they're NOT the same cycle, then the center is genuinely different from step2.
// In that case, the recursion is: generate the center as a function of the FRAME,
// not by reusing the previous step.

// Wait - maybe I should reconsider. The center IS part of the path that interleaves
// with the frame. The frame visits happen BETWEEN center visits.
// So the center path has "gaps" where frame cells are visited.
// When I extract center cells from step3, I'm getting them in the order they appear
// in step3's path, but with the frame cells removed.
// This means consecutive cells in center3 might NOT be adjacent in the grid!
// The "edges" in center3 include non-adjacent cells because the path goes
// center -> frame -> center, and when I remove the frame, two non-adjacent
// center cells become "consecutive" in my extracted list.

// For center4 = step3 shifted by 51:
// This worked because step 4's center cells form TWO contiguous blocks (d=0-19 and d=212-255).
// Within each block, the cells ARE visited consecutively.
// But the step3-shifted-by-51 match means that if we concatenate the two blocks
// and treat them as a cycle, they match step3's cycle shifted by 51.

// For center3: the cells form TWO blocks (d=22-29 and d=48-55).
// Block 1: d=22-29 = 8 consecutive cells.
// Block 2: d=48-55 = 8 consecutive cells.
// Total 16 cells. These 16 cells, concatenated in this order, should form
// a path where each consecutive pair IS adjacent.

// Let me check:
console.log('\n=== Center3 adjacency check ===');
for (let i = 0; i < center3.length; i++) {
  const j = (i + 1) % center3.length;
  const dx = Math.abs(center3[i].col - center3[j].col);
  const dy = Math.abs(center3[i].row - center3[j].row);
  const adjacent = (dx + dy === 1);
  if (!adjacent) {
    console.log(`  GAP at ${i}->${j}: (${center3[i].col},${center3[i].row}) -> (${center3[j].col},${center3[j].row}) dist=${dx+dy}`);
  }
}

// If there's a gap between cell 7 and cell 8 (the boundary between the two blocks),
// then the center3 path is NOT a single continuous path - it has a break.
// The break is where the frame was inserted.
// So the "cycle" includes the frame traversal to bridge this gap.

// For center4 (step3 shifted by 51):
// The path is also split into two blocks (d=0-19 and d=212-255).
// Let me check if there's a gap:
function extractCenterFull(path, n, innerSize) {
  const offset = (n - innerSize) / 2;
  return path.filter(p => 
    p.col >= offset && p.col < offset + innerSize && 
    p.row >= offset && p.row < offset + innerSize
  ).map(p => ({col: p.col - offset, row: p.row - offset}));
}

const center4 = extractCenterFull(step3, 8, 8); // this is just step3 itself
// Actually for step4:
const step4 = toGrid(parseSvgPath(readFileSync('target-svgs/tsp-tour-5.svg', 'utf8')));
const center4real = [];
for (let d = 0; d < 256; d++) {
  const p = step4[d];
  if (p.col >= 4 && p.col <= 11 && p.row >= 4 && p.row <= 11) {
    center4real.push({col: p.col - 4, row: p.row - 4});
  }
}

console.log('\n=== Center4 adjacency check ===');
for (let i = 0; i < center4real.length; i++) {
  const j = (i + 1) % center4real.length;
  const dx = Math.abs(center4real[i].col - center4real[j].col);
  const dy = Math.abs(center4real[i].row - center4real[j].row);
  const adjacent = (dx + dy === 1);
  if (!adjacent) {
    console.log(`  GAP at ${i}->${j}: (${center4real[i].col},${center4real[i].row}) -> (${center4real[j].col},${center4real[j].row}) dist=${dx+dy}`);
  }
}

// The key insight:
// 1. center4 matches step3 shifted by 51 as a CYCLE with ONE GAP
// 2. center3 matches step2 shifted by ??? as a CYCLE with ONE GAP
// The gap is where the frame path is inserted.

// For center3, let me check if it matches step2 when considering
// the gap separately. The gap is between center3[7] and center3[8].

// Two "half-paths":
// Half A: center3[0..7] = (3,1)(2,1)(1,1)(0,1)(0,0)(1,0)(2,0)(3,0)
// Half B: center3[8..15] = (3,3)(2,3)(1,3)(0,3)(0,2)(1,2)(2,2)(3,2)

// For center4, the gap is between center4real[19] and center4real[20].
// Half A: 20 cells
// Half B: 44 cells

// For center4: the gap means the cycle is split at positions 19->20.
// In step3 shifted by 51 terms: the split is at shift+19=70, 70%64=6.
// So the gap falls between step3[6]=(0,4) and step3[7]=(0,3).
// step3[6] is in the "Phase 2" (going DOWN col 0) and step3[7] is the next cell.
// These ARE adjacent! So the gap in center4 falls between two adjacent cells
// of step3. The frame is inserted between two adjacent cells.

// For center3: the gap is between (3,0) and (3,3).
// (3,0) and (3,3) are NOT adjacent. Distance = 3.
// But wait, in a cycle, the gap should be bridged by the frame path.
// Let's check: does the frame path go from (3,0) to (3,3)?
// In step3 global coords: center3[7]=(3,0)+offset=(5,2), center3[8]=(3,3)+offset=(5,5).
// step3[29]=(5,2) -> step3[30]=(6,2) [frame] ... step3[47]=(6,5) -> step3[48]=(5,5).
// So yes, the frame connects (5,2) to (5,5), going through 18 frame cells.

// Now back to the main question: what's the relationship between center3 and step2?
// center3 as a cycle: (3,1)(2,1)(1,1)(0,1)(0,0)(1,0)(2,0)(3,0) [GAP] (3,3)(2,3)(1,3)(0,3)(0,2)(1,2)(2,2)(3,2) [close cycle]
// step2 as a cycle: (1,1)(1,2)(2,2)(3,2)(3,3)(2,3)(1,3)(0,3)(0,2)(0,1)(0,0)(1,0)(2,0)(3,0)(3,1)(2,1) [close cycle]

// Both have 16 cells. Let me build cycle representations and compare.
// center3 as undirected cycle: 
// (3,1)-(2,1), (2,1)-(1,1), (1,1)-(0,1), (0,1)-(0,0), (0,0)-(1,0), (1,0)-(2,0), (2,0)-(3,0)
// [gap: (3,0)---(3,3)]
// (3,3)-(2,3), (2,3)-(1,3), (1,3)-(0,3), (0,3)-(0,2), (0,2)-(1,2), (1,2)-(2,2), (2,2)-(3,2)
// [close: (3,2)---(3,1)]

// step2 cycle:
// (1,1)-(1,2), (1,2)-(2,2), (2,2)-(3,2), (3,2)-(3,3), (3,3)-(2,3), (2,3)-(1,3), (1,3)-(0,3), (0,3)-(0,2), (0,2)-(0,1), (0,1)-(0,0), (0,0)-(1,0), (1,0)-(2,0), (2,0)-(3,0), (3,0)-(3,1), (3,1)-(2,1), (2,1)-(1,1)

// step2 has edges: (3,0)-(3,1), (3,1)-(2,1), (2,1)-(1,1), (1,1)-(1,2)
// center3 has edges: (3,2)-(3,1), (3,1)-(2,1), (2,1)-(1,1), (1,1)-(0,1)
// At (3,1): step2 goes (3,0)-(3,1)-(2,1), center3 goes (3,2)-(3,1)-(2,1)
// At (1,1): step2 goes (2,1)-(1,1)-(1,2), center3 goes (2,1)-(1,1)-(0,1)
// They share the edge (3,1)-(2,1) but differ at the other edges!
// So center3 is NOT the same cycle as step2.

// This means the recursion from step2 to step3 is NOT just "embed step2 in center".
// The center of step3 uses a DIFFERENT Hamiltonian cycle on the 4x4 grid!

// Hmm but center4 = step3 shifted by 51 (same cycle). Let me double-check that.
// Maybe I made an error. Let me verify the edges.

console.log('\n=== Edge comparison: center4 vs step3 ===');
const center4Edges = new Set();
const step3Edges = new Set();
for (let i = 0; i < 64; i++) {
  const j = (i + 1) % 64;
  {
    const a = `${center4real[i].col},${center4real[i].row}`;
    const b = `${center4real[j].col},${center4real[j].row}`;
    center4Edges.add([a, b].sort().join('-'));
  }
  {
    const a = `${step3[i].col},${step3[i].row}`;
    const b = `${step3[j].col},${step3[j].row}`;
    step3Edges.add([a, b].sort().join('-'));
  }
}

let allSame = true;
for (const e of center4Edges) {
  if (!step3Edges.has(e)) {
    allSame = false;
    console.log('  center4 has extra edge:', e);
  }
}
for (const e of step3Edges) {
  if (!center4Edges.has(e)) {
    allSame = false;
    console.log('  step3 has extra edge:', e);
  }
}
console.log('Same cycle edges:', allSame);

// But center4 has a GAP (non-adjacent pair). That gap's "edge" is NOT
// an edge in step3 either (because step3 doesn't skip). Let me reconsider.

// Actually, center4 forms a cycle: 64 elements where consecutive ones are 
// adjacent, EXCEPT at the gap. At the gap, the two cells are adjacent in
// step3's cycle but their "edge" in center4's cycle representation is actually
// the gap itself (where the frame path passes through).

// For center4 = step3 shifted by 51: the cycle match means that if I take
// step3's Hamiltonian cycle and start at position 51, the sequence of cells
// matches center4 - but center4 has a gap (the frame) between position 19
// and 20 of center4.

// The gap in center4 falls between step3[6] and step3[7] (positions 51+19=70 mod 64=6).
// step3[6]=(0,4) and step3[7]=(0,3). These are adjacent in step3.
// In center4, they appear at positions 19 and 20 with the frame in between.
// So center4's cycle = step3's cycle with one edge removed (the gap edge)
// and replaced by two new edges: center4[19]->frame_start and frame_end->center4[20].

// This means center4 and step3 share ALL edges except:
// step3 has: (0,4)-(0,3) [the gap edge]
// center4 has: (0,4)-[frame start] and [frame end]-(0,3)
// But center4 as listed doesn't include frame cells, so when we close
// center4's cycle, the closing edge is center4[63]->center4[0] which
// traverses (3,5)->(2,5), while step3's corresponding edge is step3[50]->[51] = (3,5)->(2,5).
// That IS the same edge!

// So center4 as a directed cycle matches step3's directed cycle shifted by 51.
// The gap means one edge ((0,4)-(0,3)) is "stretched" to include the frame.

// For center3 vs step2: they're DIFFERENT cycles. This means the construction
// at step 2->3 is different from step 3->4.

// OR: maybe the cycle changes due to the frame insertion at the previous level.
// At step 3, the center 4x4 has its OWN Hamiltonian cycle that's different from step 2.
// But this center 4x4 cycle, when embedded in step 4 as the center, 
// matches step 3... hmm wait, step 3 is 8x8, not 4x4.

// Let me reconsider the entire structure.
// Step 3 = 8x8 grid. Its path visits 64 cells.
// Step 4 = 16x16 grid. Its center 8x8 visits 64 cells = step3's cycle shifted by 51.
// So step 4 is built from step 3 + frame.

// Step 3 center 4x4 visits 16 cells. This is NOT step 2's cycle.
// So step 3 is NOT built from step 2 + frame in the same way.

// Maybe step 3 is built from step 2 + SOMETHING ELSE, and only at n>=16
// does the recursion stabilize?

// OR: maybe the "center" for step 3 should NOT be the central 4x4 cells.
// Maybe the center region has a different size.

// Let me try: what if the "center" of step 3 is 2x2 instead of 4x4?
const center3_2x2 = extractCenter(step3, 8, 2);
console.log('\n=== center of step3 as 2x2 ===');
console.log(center3_2x2.map(p => `(${p.col},${p.row})`).join(' -> '));
console.log('step1:', step1.map(p => `(${p.col},${p.row})`).join(' -> '));

// Or what if the "center" of step 4 is 4x4 instead of 8x8?
function extractCenterN(path, n, innerSize) {
  const offset = (n - innerSize) / 2;
  return path.filter(p => 
    p.col >= offset && p.col < offset + innerSize && 
    p.row >= offset && p.row < offset + innerSize
  ).map(p => ({col: p.col - offset, row: p.row - offset}));
}

const center4_4x4 = extractCenterN(step4, 16, 4);
console.log('\n=== center of step4 as 4x4 ===');
console.log(center4_4x4.length, 'cells');
console.log(center4_4x4.map(p => `(${p.col},${p.row})`).join(' -> '));

// Check vs step2 shifted:
for (let shift = 0; shift < 16; shift++) {
  let match = true;
  for (let i = 0; i < 16; i++) {
    const j = (i + shift) % 16;
    if (center4_4x4[i].col !== step2[j].col || center4_4x4[i].row !== step2[j].row) {
      match = false;
      break;
    }
  }
  if (match) console.log(`center4(4x4) = step2 shifted by ${shift}`);
}

// Check vs center3 (step3's center 4x4) shifted:
for (let shift = 0; shift < 16; shift++) {
  let match = true;
  for (let i = 0; i < 16; i++) {
    const j = (i + shift) % 16;
    if (center4_4x4[i].col !== center3[j].col || center4_4x4[i].row !== center3[j].row) {
      match = false;
      break;
    }
  }
  if (match) console.log(`center4(4x4) = center3 shifted by ${shift}`);
}
