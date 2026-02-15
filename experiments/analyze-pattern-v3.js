// The key observation from v2: The child visit order for each quadrant type is correct:
// ROOT: BL → TL → TR → BR
// BL: TR → BR → BL → TL
// TL: BR → BL → TL → TR
// TR: BL → TL → TR → BR (same as ROOT)
// BR: TL → TR → BR → BL

// But order 3 doesn't match. Let me look at the actual leaf-level differences.
// My algorithm gives (2,5)(2,4)(3,4)(3,5) for the first 4 points of order 3 BL.
// Expected is (3,4)(3,5)(2,6)(3,6).

// The issue is that the LEAF-LEVEL (order 1) pattern within each quadrant must
// also be determined by the quadrant's type, not just the visiting order.

// At order 1 (base case), the 4 points are visited in a specific order based
// on the quadrant type. The ROOT visits: BL(0,1) → TL(0,0) → TR(1,0) → BR(1,1)

// For the BL quadrant at order 2, the 4 points are:
// (1,2) → (1,3) → (0,3) → (0,2) = TR → BR → BL → TL

// For the TL quadrant at order 2:
// (1,1) → (0,1) → (0,0) → (1,0) = BR → BL → TL → TR

// These match the child visit orders!
// So the algorithm should work by using the visit order at EVERY level including the leaf.
// At the leaf level (size=2), we're visiting 4 points, and the visit order is the child order.

// Wait, but that's what my algorithm does at size=1 - each point is a single cell.
// The issue is that the ROOT visit order applies at the top level,
// but then each child uses its own visit order recursively.

// Let me re-examine. My algorithm at order 3:
// Top level (ROOT): visits BL, TL, TR, BR
// BL (type BL): visits sub-quads TR, BR, BL, TL
//   TR sub-quad of BL (type TR): visits BL, TL, TR, BR
//     At the leaf level...

// Hmm, the problem might be that the "type" should propagate differently.
// Let me look at the expected order 3 more carefully.

const order2 = [
  [1,2], [1,3], [0,3], [0,2], [1,1], [0,1], [0,0], [1,0], [2,1], [2,0], [3,0], [3,1], [2,2], [3,2], [3,3], [2,3]
];

const order3_1based = [
  [4,5], [4,6], [3,7], [4,7], [4,8], [3,8], [2,7], [2,8],
  [1,8], [1,7], [2,6], [1,6], [1,5], [2,5], [3,6], [3,5],
  [4,4], [3,4], [2,3], [2,4], [1,4], [1,3], [2,2], [1,2],
  [1,1], [2,1], [3,2], [3,1], [4,1], [4,2], [3,3], [4,3],
  [5,4], [5,3], [6,2], [5,2], [5,1], [6,1], [7,2], [7,1],
  [8,1], [8,2], [7,3], [8,3], [8,4], [7,4], [6,3], [6,4],
  [5,5], [6,5], [7,6], [7,5], [8,5], [8,6], [7,7], [8,7],
  [8,8], [7,8], [6,7], [6,8], [5,8], [5,7], [6,6], [5,6]
];
const order3 = order3_1based.map(([x,y]) => [x-1, y-1]);

// Let me look at order 3 BL quadrant (first 16 points) in the 4x4 sub-grid [0-3]x[4-7]
// Normalized to [0-3]x[0-3]:
const bl = order3.slice(0,16).map(([x,y]) => [x, y-4]);
console.log("Order 3 BL (normalized):", bl.map(p => `(${p[0]},${p[1]})`).join(" → "));

// Break into groups of 4:
for (let g = 0; g < 4; g++) {
  const group = bl.slice(g*4, (g+1)*4);
  console.log(`  Group ${g}: ${group.map(p => `(${p[0]},${p[1]})`).join(" → ")}`);
}

// Group 0: (3,0) (3,1) (2,2) (3,2) - this visits TR and BR sub-quads of the 4x4 grid
// Group 1: (3,3) (2,3) (1,2) (1,3) - visits BR and BL
// Group 2: (0,3) (0,2) (1,1) (0,1) - visits BL and TL
// Group 3: (0,0) (1,0) (2,1) (2,0) - visits TL and TR

// Hmm, groups cross quadrant boundaries. The tree walk crosses between sub-quadrants.
// This is because the walking pattern at order 1 visits ALL 4 quadrants.

// So the recursion isn't "visit all of sub-quad A, then all of sub-quad B"
// but rather "the order 1 pattern applied to the 4 sub-quadrants gives
// the interleaving order"

// Let me reconsider. When the user says "tree walk", they mean:
// The 4-ary tree has leaves at depth N. Walking the tree left-to-right visits
// each leaf exactly once. But the "left-to-right" ordering isn't a simple DFS -
// it's a specific ordering based on the quadrant type.

// Actually, looking at the data more carefully:
// n3_bl cyclic rotation of order 2 by offset 10.
// The normalized BL of order 3 starts at index 10 of order 2 (which is (3,0)).
// Order 2 index 10 is (3,0), index 11 is (3,1), etc.

// So the ENTIRE pattern at each level is the SAME sequence, just starting at a different offset!
// For BL: offset 10 (out of 16)
// For TL: offset 14
// For TR: offset 2
// For BR: offset 6

// These offsets correspond to certain "entry points" in the cycle.
// Let's see what points these correspond to:
console.log("\n=== Entry points in order 2 ===");
console.log("Order 2[10] = ", order2[10], " → for BL of next level");
console.log("Order 2[14] = ", order2[14], " → for TL of next level");
console.log("Order 2[2] = ", order2[2], " → for TR of next level");
console.log("Order 2[6] = ", order2[6], " → for BR of next level");

// Order2[10] = (3,0) = TR corner
// Order2[14] = (3,3) = BR corner
// Order2[2] = (0,3) = BL corner
// Order2[6] = (0,0) = TL corner

// So the entry point for each quadrant type in the parent cycle:
// BL → enters at the TR corner point = offset where (gridSize-1, 0) appears in the cycle
// TL → enters at the BR corner point = offset where (gridSize-1, gridSize-1) appears
// TR → enters at the BL corner point = offset where (0, gridSize-1) appears
// BR → enters at the TL corner point = offset where (0, 0) appears

// That confirms: entry corner for each quadrant = corner closest to center
// BL entry = TR (closest to center)
// TL entry = BR
// TR entry = BL
// BR entry = TL

// And the key insight: the SAME curve is used at every level, just starting from
// the appropriate entry point!

// Let me verify for order 1:
const order1 = [[0,1], [0,0], [1,0], [1,1]];
console.log("\n=== Entry points in order 1 ===");
for (let i = 0; i < 4; i++) {
  const p = order1[i];
  const corner = (p[0] === 0 ? '' : '') + (p[1] === 0 ? 'T' : 'B') + (p[0] === 0 ? 'L' : 'R');
  console.log(`Order 1[${i}] = (${p[0]},${p[1]}) = ${corner}`);
}
// Order 1[0] = (0,1) = BL → this is the ROOT entry
// Order 1[1] = (0,0) = TL
// Order 1[2] = (1,0) = TR → if we enter at TR (offset 2), we're in BL quadrant mode
// Order 1[3] = (1,1) = BR

// For BL child, entry is at TR corner = order1[2] = offset 2
// Starting from offset 2: TR(1,0) → BR(1,1) → BL(0,1) → TL(0,0)
// In order 2, the BL quadrant visits: TR→BR→BL→TL ✓

// For TL child, entry is at BR corner = order1[3] = offset 3
// Starting from offset 3: BR(1,1) → BL(0,1) → TL(0,0) → TR(1,0)
// In order 2, the TL quadrant visits: BR→BL→TL→TR ✓

// For TR child, entry is at BL corner = order1[0] = offset 0
// Starting from offset 0: BL(0,1) → TL(0,0) → TR(1,0) → BR(1,1)
// In order 2, the TR quadrant visits: BL→TL→TR→BR ✓ (same as ROOT)

// For BR child, entry is at TL corner = order1[1] = offset 1
// Starting from offset 1: TL(0,0) → TR(1,0) → BR(1,1) → BL(0,1)
// In order 2, the BR quadrant visits: TL→TR→BR→BL ✓

console.log("\nPATTERN CONFIRMED! The child visit order for each quadrant is simply");
console.log("the base CCW cycle (BL→TL→TR→BR) starting from the center-facing corner.");
console.log("BL → start from TR: TR→BR→BL→TL (shift by 2)");
console.log("TL → start from BR: BR→BL→TL→TR (shift by 3)");
console.log("TR → start from BL: BL→TL→TR→BR (shift by 0, same as base)");
console.log("BR → start from TL: TL→TR→BR→BL (shift by 1)");

// Wait, but this doesn't explain why my algorithm in v2 was wrong for order 3.
// The child visit order WAS correct. Let me re-examine.

// Actually, I think the issue was subtler. Let me re-implement more carefully.
// The insight is: the curve at each level is the SAME sequence, just rotated.
// So the recursion should be:
// 1. At the root, generate the base pattern (BL→TL→TR→BR)
// 2. For each child quadrant, the sub-curve starts at a rotated position

// But there's a twist: at higher orders, the curve within each sub-quadrant
// needs to be a scaled-down version of the SAME curve, starting at the right offset.

// Let me think about this as: the curve is self-similar with cyclic shift.
// At order N+1:
//   - The curve visits 4^(N+1) points
//   - These are organized into 4 groups of 4^N points, one per quadrant
//   - Each group is a copy of the order N curve, placed in the corresponding quadrant,
//     but cyclically shifted to start at the right point

// My v2 algorithm was correct in the child visit order, but maybe wrong in the
// leaf case or the spatial placement.

// Let me try a different implementation approach.
// Instead of a tree-based recursion, I'll use the cyclic shift property.

function getQuadrantOffset(q, half) {
  switch(q) {
    case 'BL': return {dx: 0, dy: half};
    case 'TL': return {dx: 0, dy: 0};
    case 'TR': return {dx: half, dy: 0};
    case 'BR': return {dx: half, dy: half};
  }
}

function centerCorner(q) {
  // Corner closest to center of parent
  switch(q) {
    case 'BL': return 'TR';
    case 'TL': return 'BR';
    case 'TR': return 'BL';
    case 'BR': return 'TL';
  }
}

const BASE_ORDER = ['BL', 'TL', 'TR', 'BR']; // CCW

function childVisitOrder(parentQuadrant) {
  // Same CCW cycle, but starting from the center-facing corner
  const entry = parentQuadrant === 'ROOT' ? 'BL' : centerCorner(parentQuadrant);
  const idx = BASE_ORDER.indexOf(entry);
  const result = [];
  for (let i = 0; i < 4; i++) {
    result.push(BASE_ORDER[(idx + i) % 4]);
  }
  return result;
}

function cornerCoord(corner, size) {
  switch(corner) {
    case 'BL': return {x: 0, y: size - 1};
    case 'TL': return {x: 0, y: 0};
    case 'TR': return {x: size - 1, y: 0};
    case 'BR': return {x: size - 1, y: size - 1};
  }
}

function spaceFillingTreeWalk(order) {
  const gridSize = Math.pow(2, order);

  function recurse(x0, y0, size, quadrantType) {
    if (size === 1) {
      return [{x: x0, y: y0}];
    }

    const half = size / 2;
    const visitOrder = childVisitOrder(quadrantType);
    const result = [];

    for (const childQ of visitOrder) {
      const offset = getQuadrantOffset(childQ, half);
      result.push(...recurse(x0 + offset.dx, y0 + offset.dy, half, childQ));
    }

    return result;
  }

  return recurse(0, 0, gridSize, 'ROOT');
}

// Test order 1:
const result1 = spaceFillingTreeWalk(1);
console.log("\nOrder 1 result:", result1.map(p => `(${p.x},${p.y})`).join(" → "));
console.log("Expected:       (0,1) → (0,0) → (1,0) → (1,1)");
console.log("Match:", JSON.stringify(result1.map(p => [p.x,p.y])) === JSON.stringify(order1));

// Test order 2:
const result2 = spaceFillingTreeWalk(2);
console.log("\nOrder 2 result:", result2.map(p => `(${p.x},${p.y})`).join(" → "));
console.log("Expected:       ", order2.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("Match:", JSON.stringify(result2.map(p => [p.x,p.y])) === JSON.stringify(order2));

// Hmm, this is the same algorithm as v2 essentially. Let me check what's different.
// Oh wait - in v2, I had ROOT use 'ROOT' type, and BL/TL/TR/BR use their names.
// But here ROOT maps to BL → TL → TR → BR (same as TR).
// Actually ROOT starts from BL (offset 0), same as before.

// The issue might be that the child's "type" should NOT be the quadrant name,
// but rather something computed from the parent's type AND the child's position.

// Let me look at the data differently.
// At order 3, BL quadrant is visited with offset 10 from order 2.
// Within that BL quadrant, the sub-quadrants should be visited starting from their respective offsets.

// Let me trace what offset each sub-quadrant of order 3 BL starts at (within the order 1 cycle):
const bl3_norm = order3.slice(0,16).map(([x,y]) => [x, y-4]);

// The first 4 points of bl3_norm: (3,0)(3,1)(2,2)(3,2)
// Identify which quadrant each belongs to and what corner they are:
function getSubQuad(x, y, size) {
  const half = size / 2;
  if (x < half && y >= half) return 'BL';
  if (x < half && y < half) return 'TL';
  if (x >= half && y < half) return 'TR';
  return 'BR';
}

console.log("\n\n=== Tracing BL of order 3 leaf patterns ===");
// Sub-quadrant of each point within the 4x4 BL region:
for (let i = 0; i < 16; i++) {
  const [x,y] = bl3_norm[i];
  const sq = getSubQuad(x, y, 4);
  // Normalize to 2x2
  const half = 2;
  const nx = x % half;
  const ny = y % half;
  let corner;
  if (nx === 0 && ny === 0) corner = 'TL';
  else if (nx === 1 && ny === 0) corner = 'TR';
  else if (nx === 0 && ny === 1) corner = 'BL';
  else corner = 'BR';
  console.log(`  [${i}] (${x},${y}) in ${sq}, local (${nx},${ny}) = ${corner}`);
}

// Now I see the pattern:
// [0] (3,0) in TR, local (1,0) = TR
// [1] (3,1) in TR, local (1,1) = BR
// [2] (2,2) in BR, local (0,0) = TL
// [3] (3,2) in BR, local (1,0) = TR

// The first two points are in TR sub-quadrant, next two in BR.
// But within TR, we visit TR→BR (just 2 of 4 corners).
// Then within BR, we visit TL→TR.
// Then later we come back to TR and BR.

// This is because the LEAF-LEVEL pattern crosses sub-quadrant boundaries!
// When we're at the 2x2 level, the 4 points being visited are NOT within the same
// sub-quadrant. They're 4 points that form the order-1 pattern ACROSS sub-quadrants.

// So the recursion should NOT go down to individual points.
// The base case should be at size=2, where we visit the 4 points according to
// the specific order for that quadrant type.

// At size=2, the 4 points are at (0,0), (1,0), (0,1), (1,1)
// The visit order depends on the quadrant type:
// ROOT/TR: BL(0,1) → TL(0,0) → TR(1,0) → BR(1,1) ← order 1 pattern
// BL:      TR(1,0) → BR(1,1) → BL(0,1) → TL(0,0)
// TL:      BR(1,1) → BL(0,1) → TL(0,0) → TR(1,0)
// BR:      TL(0,0) → TR(1,0) → BR(1,1) → BL(0,1)

// But wait, that's what my size=1 recursion is doing in aggregate!
// The issue must be something else. Let me compare my result with expected for order 3
// more carefully.

// My order 3 BL (first 16): (2,5)(2,4)(3,4)(3,5)...
// Expected order 3 BL (first 16): (3,4)(3,5)(2,6)(3,6)...

// My first 4 in BL normalized to 4x4: (2,1)(2,0)(3,0)(3,1)
// Expected first 4 in BL normalized: (3,0)(3,1)(2,2)(3,2)

// My BL visits: starts at point closest to TR of BL
// My first sub-quadrant is TR, visit order BL→TL→TR→BR
// The expected starts at TR quadrant too, but visits TR→BR→BL→TL? No...

// Wait, expected (3,0)(3,1) is in TR sub-quadrant, then (2,2)(3,2) is in BR.
// So expected visits TR first 2, then BR first 2.

// My algorithm visits TR in order: BL→TL→TR→BR at the leaf.
// That gives: (2,1)(2,0)(3,0)(3,1)
// But expected visits TR as: (3,0)(3,1) and then immediately jumps to BR (2,2)(3,2).

// So the leaf visit order within TR sub-quadrant of BL of BL... is different.
// Let me think about what "type" the TR sub-quadrant gets in this context.

// BL's child visit order: TR → BR → BL → TL
// The first child visited is TR. What type does this TR get?
// At the parent level (BL), the visit started from TR. So this TR child is the "first child".
// In the original cycle, the first child of ROOT is BL, which gets type BL.
// So the "type" of each child isn't just its spatial position, but its position
// in the parent's visit order.

// That's the key insight! Let me re-examine:
// ROOT visits: BL → TL → TR → BR
// Each child gets a "role" based on its position in the visit order:
//   Position 0 (BL in ROOT): gets BL-type behavior
//   Position 1 (TL): gets TL-type behavior
//   Position 2 (TR): gets TR-type behavior
//   Position 3 (BR): gets BR-type behavior

// For BL parent, the visit order is: TR → BR → BL → TL
// Position 0 (TR): gets BL-type behavior (because it's first, like BL is first in ROOT)
// Position 1 (BR): gets TL-type behavior
// Position 2 (BL): gets TR-type behavior
// Position 3 (TL): gets BR-type behavior

// This means the "type" of a child is determined by its POSITION in the parent's cycle,
// not by its spatial quadrant name!

console.log("\n\n=== NEW HYPOTHESIS: type = position in parent's cycle ===");
console.log("ROOT cycle: BL=type0, TL=type1, TR=type2, BR=type3");
console.log("type0 (BL-like) cycle: TR BR BL TL → TR=type0, BR=type1, BL=type2, TL=type3");
console.log("type1 (TL-like) cycle: BR BL TL TR → BR=type0, BL=type1, TL=type2, TR=type3");
console.log("type2 (TR-like) cycle: BL TL TR BR → BL=type0, TL=type1, TR=type2, BR=type3");
console.log("type3 (BR-like) cycle: TL TR BR BL → TL=type0, TR=type1, BR=type2, BL=type3");

// So the type of a child = the index of that child in the parent's visit cycle.
// And the visit cycle for each type is:
// type0 (BL): TR → BR → BL → TL (shift by 2)
// type1 (TL): BR → BL → TL → TR (shift by 3)
// type2 (TR): BL → TL → TR → BR (shift by 0)
// type3 (BR): TL → TR → BR → BL (shift by 1)

// The shift is: type0→2, type1→3, type2→0, type3→1
// Which is: shift = (type + 2) % 4

// So for any type T, the visit order starts at BASE_ORDER[(T+2)%4]

function spaceFillingTreeWalkV2(order) {
  const gridSize = Math.pow(2, order);

  function getVisitOrder(type) {
    const shift = (type + 2) % 4;
    const result = [];
    for (let i = 0; i < 4; i++) {
      result.push(BASE_ORDER[(shift + i) % 4]);
    }
    return result;
  }

  function recurse(x0, y0, size, type) {
    if (size === 1) {
      return [{x: x0, y: y0}];
    }

    const half = size / 2;
    const visitOrder = getVisitOrder(type);
    const result = [];

    for (let pos = 0; pos < 4; pos++) {
      const childQ = visitOrder[pos];
      const offset = getQuadrantOffset(childQ, half);
      // Child's type is its position in parent's visit order
      result.push(...recurse(x0 + offset.dx, y0 + offset.dy, half, pos));
    }

    return result;
  }

  // ROOT type is type2 (same as TR: BL→TL→TR→BR)
  return recurse(0, 0, gridSize, 2);
}

// Test:
const r1 = spaceFillingTreeWalkV2(1);
console.log("\nV2 Order 1:", r1.map(p => `(${p.x},${p.y})`).join(" → "));
console.log("Expected:   (0,1) → (0,0) → (1,0) → (1,1)");
console.log("Match:", JSON.stringify(r1.map(p => [p.x,p.y])) === JSON.stringify(order1));

const r2 = spaceFillingTreeWalkV2(2);
console.log("\nV2 Order 2:", r2.map(p => `(${p.x},${p.y})`).join(" → "));
console.log("Expected:   ", order2.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("Match:", JSON.stringify(r2.map(p => [p.x,p.y])) === JSON.stringify(order2));

const r3 = spaceFillingTreeWalkV2(3);
console.log("\nV2 Order 3:", r3.map(p => `(${p.x},${p.y})`).join(" → "));
console.log("Expected:   ", order3.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("Match:", JSON.stringify(r3.map(p => [p.x,p.y])) === JSON.stringify(order3));

if (JSON.stringify(r3.map(p => [p.x,p.y])) !== JSON.stringify(order3)) {
  console.log("\nFirst 10 mismatches:");
  let count = 0;
  for (let i = 0; i < Math.max(r3.length, order3.length) && count < 10; i++) {
    const got = r3[i] ? `(${r3[i].x},${r3[i].y})` : 'N/A';
    const exp = order3[i] ? `(${order3[i][0]},${order3[i][1]})` : 'N/A';
    if (got !== exp) {
      console.log(`  [${i}] got ${got}, expected ${exp}`);
      count++;
    }
  }
}
