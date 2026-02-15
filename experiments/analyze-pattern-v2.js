// Key insight: the normalized quadrants of order 3 appear to be cyclic shifts of order 2
// Let's verify this

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

function normalizeQuadrant(points, gridSize) {
  const half = gridSize / 2;
  const firstX = points[0][0];
  const firstY = points[0][1];
  const baseX = firstX >= half ? half : 0;
  const baseY = firstY >= half ? half : 0;
  return points.map(p => [p[0] - baseX, p[1] - baseY]);
}

// Extract quadrants of order 3
const q3_bl = order3.slice(0, 16);
const q3_tl = order3.slice(16, 32);
const q3_tr = order3.slice(32, 48);
const q3_br = order3.slice(48, 64);

const n3_bl = normalizeQuadrant(q3_bl, 8);
const n3_tl = normalizeQuadrant(q3_tl, 8);
const n3_tr = normalizeQuadrant(q3_tr, 8);
const n3_br = normalizeQuadrant(q3_br, 8);

console.log("Order 2:  ", order2.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("N3 BL:    ", n3_bl.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("N3 TL:    ", n3_tl.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("N3 TR:    ", n3_tr.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("N3 BR:    ", n3_br.map(p => `(${p[0]},${p[1]})`).join(" → "));

// Check if these are cyclic rotations of order 2
function isCyclicRotation(a, b) {
  if (a.length !== b.length) return false;
  const n = a.length;
  for (let offset = 0; offset < n; offset++) {
    let match = true;
    for (let i = 0; i < n; i++) {
      if (a[(i + offset) % n][0] !== b[i][0] || a[(i + offset) % n][1] !== b[i][1]) {
        match = false;
        break;
      }
    }
    if (match) return offset;
  }
  return -1;
}

console.log("\nCyclic rotation check (offset from order 2):");
console.log("N3 BL:", isCyclicRotation(order2, n3_bl));
console.log("N3 TL:", isCyclicRotation(order2, n3_tl));
console.log("N3 TR:", isCyclicRotation(order2, n3_tr));
console.log("N3 BR:", isCyclicRotation(order2, n3_br));

// AHA! They are cyclic rotations of order 2!
// Let's also check if the entry/exit corners follow a pattern

// For the overall curve, each recursion level has an "entry" and "exit" point
// The entry is where the curve starts, and the exit is where it ends (before wrapping)

// Order 1: starts at (0,1)=BL, ends at (1,1)=BR → visits BL→TL→TR→BR
// Order 2: starts at (1,2), ends at (2,3)
// Order 3: starts at (3,4), ends at (4,5)

// Let's look at the entry/exit as fractional positions
// Order 1: start=(0,1) in 2x2 → (0, 0.5) normalized to [0,1]
// Order 2: start=(1,2) in 4x4 → (0.333, 0.667)
// Order 3: start=(3,4) in 8x8 → (0.429, 0.571)

// Actually, the entry point seems to converge toward (0.5, 0.5) - the center
// But from the BL side

// Let me think about this differently.
// The recursive structure is:
// At each level, we visit 4 quadrants: BL, TL, TR, BR (CCW)
// Each quadrant is a self-similar copy of the whole curve, but shifted in starting position

// If order 2 = [p0, p1, ..., p15] and we break into chunks of 4:
//   BL chunk: p0-p3
//   TL chunk: p4-p7
//   TR chunk: p8-p11
//   BR chunk: p12-p15

// For order 3, the normalized quadrants are cyclic rotations:
// BL of order 3 = order 2 rotated by some offset
// This makes perfect sense! Because the BL quadrant of order 3 starts at a different
// position within the curve.

// The user said this is like walking a 4-ary tree from left to right.
// In a 4-ary tree:
// - Root has 4 children: BL, TL, TR, BR
// - Each child has 4 children, etc.
// - Walking left-to-right means: first visit all of BL's subtree, then TL's, then TR's, then BR's

// But the entry point changes! For BL, we enter from the corner closest to center (TR corner).
// The curve through BL starts at TR and ends at TL (to connect to next quadrant TL's entry at BR).

// The key question: what transformation maps order N to order N+1?

// Let me verify the cyclic rotation offsets
// For a 16-element sequence:
// If BL starts at offset X, then within BL (4 sub-quadrants of 4 each):
//   The first sub-quadrant starts at its offset...

// Actually let me try to understand this more concretely by looking at the
// actual quadrant visitation ORDER at each level

console.log("\n\n=== Quadrant visitation analysis ===");

// For order 2, let's identify which quadrant each point belongs to
function getQuadrant(x, y, size) {
  const half = size / 2;
  if (x < half && y >= half) return 'BL';
  if (x < half && y < half) return 'TL';
  if (x >= half && y < half) return 'TR';
  return 'BR';
}

console.log("Order 2 quadrant sequence:");
const o2quads = order2.map(p => getQuadrant(p[0], p[1], 4));
console.log(o2quads.join(" "));

console.log("\nOrder 3 quadrant sequence (top level):");
const o3quads = order3.map(p => getQuadrant(p[0], p[1], 8));
console.log(o3quads.join(" "));

// Now for each order 3 quadrant, what's the sub-quadrant sequence?
console.log("\nOrder 3, BL quadrant sub-quadrant sequence:");
const bl_subquads = q3_bl.map(p => getQuadrant(p[0], p[1], 4)); // using 4 since BL is in [0,3]x[4,7]
// Wait, we need to use the normalized version
const bl_subquads2 = n3_bl.map(p => getQuadrant(p[0], p[1], 4));
console.log(bl_subquads2.join(" "));

console.log("\nOrder 3, TL quadrant sub-quadrant sequence:");
const tl_subquads = n3_tl.map(p => getQuadrant(p[0], p[1], 4));
console.log(tl_subquads.join(" "));

console.log("\nOrder 3, TR quadrant sub-quadrant sequence:");
const tr_subquads = n3_tr.map(p => getQuadrant(p[0], p[1], 4));
console.log(tr_subquads.join(" "));

console.log("\nOrder 3, BR quadrant sub-quadrant sequence:");
const br_subquads = n3_br.map(p => getQuadrant(p[0], p[1], 4));
console.log(br_subquads.join(" "));

// So within each quadrant of order 3, what's the sub-quadrant visitation order?
function getGroupedQuadrants(points, gridSize) {
  const groups = [];
  let current = getQuadrant(points[0][0], points[0][1], gridSize);
  groups.push(current);
  for (let i = 1; i < points.length; i++) {
    const q = getQuadrant(points[i][0], points[i][1], gridSize);
    if (q !== current) {
      groups.push(q);
      current = q;
    }
  }
  return groups;
}

console.log("\n=== Quadrant visit order (grouped) ===");
console.log("Order 2:", getGroupedQuadrants(order2, 4).join(" → "));
console.log("N3 BL:", getGroupedQuadrants(n3_bl, 4).join(" → "));
console.log("N3 TL:", getGroupedQuadrants(n3_tl, 4).join(" → "));
console.log("N3 TR:", getGroupedQuadrants(n3_tr, 4).join(" → "));
console.log("N3 BR:", getGroupedQuadrants(n3_br, 4).join(" → "));

// Now I see it! The quadrant visit order is the same (BL→TL→TR→BR) for all,
// but the starting point within the cycle differs.

// Let's check: if order 2 visits BL→TL→TR→BR (starting from BL),
// then the BL sub-curve at order 3 should visit TR→BR→BL→TL (starting from TR)
// because the entry for BL is TR (center corner of BL quadrant)

// Actually wait, let me re-examine. The quadrant visitation order should be
// the same CCW cycle but starting from different points.

// For order 2 (the whole thing): BL→TL→TR→BR (CCW starting from BL)
// For BL child at order 3: the entry is TR, so we'd expect the cycle to start from...
// Let me think about the tree walk interpretation.

// In a 4-ary tree walk:
// Each node has children ordered: BL, TL, TR, BR
// "Left-to-right" walk visits all of BL subtree, then TL, then TR, then BR
// The curve enters each subtree from one side and exits from another

// The crucial insight: the CURVE wraps around. Order 1 visits BL→TL→TR→BR
// forming a loop. The entry point of the loop is BL corner, exit is BR corner.
// But at order 2, the BL quadrant's subtree is visited with entry at TR
// (the corner closest to center = the "root" of that subtree).

// I think the pattern is:
// The curve always visits quadrants in order: BL, TL, TR, BR
// But the entry/exit within each quadrant depends on which quadrant it is:

// At order N, the overall curve entry = TR of BL quadrant at the innermost level
// This is always at coordinates close to the center

// Let me look at order 2 differently:
// The 16 points in order 2, broken by which quadrant they're in:
// BL quadrant gets visited first (points 0-3)
// TL quadrant second (points 4-7)
// TR quadrant third (points 8-11)
// BR quadrant fourth (points 12-15)

// Within BL: (1,2)→(1,3)→(0,3)→(0,2) = starts at center-facing corner TR, visits CW
// Within TL: (1,1)→(0,1)→(0,0)→(1,0) = starts at center-facing corner BR, visits CCW
// Within TR: (2,1)→(2,0)→(3,0)→(3,1) = starts at center-facing corner BL, visits CCW
// Within BR: (2,2)→(3,2)→(3,3)→(2,3) = starts at center-facing corner TL, visits CW

// BL: CW from TR → path TR→BR→BL→TL
// TL: CCW from BR → path BR→BL→TL→TR
// TR: CCW from BL → path BL→TL→TR→BR
// BR: CW from TL → path TL→TR→BR→BL

// Now checking: are these just rotations of the same base pattern?
// Base (order 1): BL→TL→TR→BR (this is CCW)
// BL child: TR→BR→BL→TL = BL→TL→TR→BR rotated by +2 and reversed = actually CW from TR
// TL child: BR→BL→TL→TR = BL→TL→TR→BR rotated by +3 (shifted by 3 in CCW order) → still CCW
// TR child: BL→TL→TR→BR = same as base! CCW
// BR child: TL→TR→BR→BL = BL→TL→TR→BR rotated by +1 in CW order → CW

// Hmm, let me try a different approach. Let me see if there's a simple transformation
// for each child.

// Let me define 4 orientations:
// Type A (base): BL→TL→TR→BR (CCW from BL)
// Type B: TR→BR→BL→TL (CW from TR) - this is the REVERSE of A starting from opposite corner
// Type C: BR→BL→TL→TR (CCW from BR) = A shifted by 3
// Type D: TL→TR→BR→BL (CW from TL) = A shifted by 1 then reversed

// Order 1 = Type A: BL→TL→TR→BR
// Order 2 children:
//   BL → Type B: TR→BR→BL→TL
//   TL → Type C: BR→BL→TL→TR
//   TR → Type A: BL→TL→TR→BR
//   BR → Type D: TL→TR→BR→BL

// Now at order 3, let me verify this recursion
// The BL child of the whole at order 3 should have children with types:
// If BL child's type is B (TR→BR→BL→TL), then its children's types would be:
//   First child (which is TR quadrant since B starts from TR): ?
//   Let me re-examine...

// Wait, I think I'm overcomplicating this. Let me re-approach.
// The quadrant visitation ORDER at each level is always BL→TL→TR→BR.
// What changes is the entry/exit corners within each child.

// For order 2:
// BL: entry=TR, exit=TL  (CW path: TR→BR→BL→TL)
// TL: entry=BR, exit=TR  (CCW path: BR→BL→TL→TR)
// TR: entry=BL, exit=BR  (CCW path: BL→TL→TR→BR)
// BR: entry=TL, exit=BL  (CW path: TL→TR→BR→BL)

// These entry/exit are FIXED for any level. Let me verify for order 3's children.

// Order 3 BL quadrant normalized:
console.log("\n\n=== FINAL PATTERN DERIVATION ===");
console.log("Checking if sub-quadrant entry/exit is the same at every level...\n");

// Order 3, BL quadrant, broken into its 4 sub-quadrants:
const subQuads3BL = [];
for (let i = 0; i < 4; i++) {
  const chunk = n3_bl.slice(i*4, (i+1)*4);
  const quad = getQuadrant(chunk[0][0], chunk[0][1], 4);
  subQuads3BL.push({quad, points: chunk});
}
console.log("BL sub-quads:", subQuads3BL.map(sq => sq.quad).join(" → "));

// The sub-quadrants are grouped by 4 points each
// But the points span the full 4x4 grid, not staying within their quadrant!
// This means the order 2 pattern within each order 3 quadrant does NOT
// subdivide into clean 2x2 quadrants at the leaf level.

// Hmm, wait. Let me look at this again more carefully.
// n3_bl = [(3,0), (3,1), (2,2), (3,2), (3,3), (2,3), (1,2), (1,3),
//          (0,3), (0,2), (1,1), (0,1), (0,0), (1,0), (2,1), (2,0)]

// If I check which 2x2 sub-quadrant each point belongs to in a 4x4 grid:
// (3,0) → x≥2,y<2 → TR quadrant
// (3,1) → x≥2,y<2 → TR quadrant
// (2,2) → x≥2,y≥2 → BR quadrant  ← mismatch! point 3 is in a different quadrant
// (3,2) → x≥2,y≥2 → BR quadrant

// So the 4-point chunks DON'T correspond to quadrants.
// The real grouping should be by quadrant:

function groupByQuadrant(points, gridSize) {
  const half = gridSize / 2;
  const result = {BL: [], TL: [], TR: [], BR: []};
  for (let i = 0; i < points.length; i++) {
    const q = getQuadrant(points[i][0], points[i][1], gridSize);
    result[q].push({idx: i, point: points[i]});
  }
  return result;
}

console.log("\nGrouping n3_bl by 2x2 quadrant:");
const groups = groupByQuadrant(n3_bl, 4);
for (const [q, pts] of Object.entries(groups)) {
  console.log(`  ${q}: ${pts.map(p => `[${p.idx}](${p.point[0]},${p.point[1]})`).join(", ")}`);
}

// Now I see! The points are NOT grouped by quadrant in chunks of 4.
// The curve weaves between quadrants. This is a fundamentally different structure
// than what I assumed.

// Let me look at this from the tree walk perspective the user described.
// "It is just like regular tree walk from left to right, but here we have not
// binary tree, but 4-tree, meaning we will get loop."

// A 4-ary tree of depth N has 4^N leaves.
// Walking the leaves in order gives us the curve.
// The tree has 4 children per node: BL, TL, TR, BR.
// But the "walk" means traversing the tree such that we visit leaves in a specific
// spatial order that forms a loop.

// Let me look at the actual spatial structure differently.
// Order 1 visits: (0,1) → (0,0) → (1,0) → (1,1)
// This is: BL → TL → TR → BR (the leaf nodes at depth 1)

// Order 2 visits 16 points. The tree has 4 nodes at depth 1, each with 4 children.
// The walk visits the children of BL first, then TL, then TR, then BR.
// Children of BL (in the 4x4 grid, BL quadrant is x∈[0,1], y∈[2,3]):
//   BL's children (2x2 sub-quadrants within BL):
//     BL-BL: (0,3), BL-TL: (0,2), BL-TR: (1,2), BL-BR: (1,3)
//   Visit order: (1,2)→(1,3)→(0,3)→(0,2) = BL-TR → BL-BR → BL-BL → BL-TL

// So within BL quadrant, the children are visited: TR → BR → BL → TL

// Children of TL (x∈[0,1], y∈[0,1]):
//   Visit order: (1,1)→(0,1)→(0,0)→(1,0) = TL-BR → TL-BL → TL-TL → TL-TR
// Within TL: BR → BL → TL → TR

// Children of TR (x∈[2,3], y∈[0,1]):
//   Visit order: (2,1)→(2,0)→(3,0)→(3,1) = TR-BL → TR-TL → TR-TR → TR-BR
// Within TR: BL → TL → TR → BR

// Children of BR (x∈[2,3], y∈[2,3]):
//   Visit order: (2,2)→(3,2)→(3,3)→(2,3) = BR-TL → BR-TR → BR-BR → BR-BL
// Within BR: TL → TR → BR → BL

console.log("\n\n=== CHILD VISIT ORDER AT EACH QUADRANT ===");
console.log("BL children: TR → BR → BL → TL");
console.log("TL children: BR → BL → TL → TR");
console.log("TR children: BL → TL → TR → BR");
console.log("BR children: TL → TR → BR → BL");

// Now these are the CHILD VISITATION ORDERS, and they are fixed!
// Let's verify this holds for order 3 as well.

// Order 3 overall visits BL→TL→TR→BR (at the top level, quadrants of 8x8)
// Within BL of order 3 (which is a 4x4 sub-grid at [0-3, 4-7]),
// the 4 sub-quadrants (2x2 each) should be visited in order: TR → BR → BL → TL

// But wait, BL of order 3 is a 16-point curve on a 4x4 grid.
// It should visit its own 4 sub-quadrants in order TR → BR → BL → TL (same rule for BL)

// Let me check this for order 3:
console.log("\n=== Order 3 BL quadrant sub-quadrant visit order ===");
const o3bl_subquad_seq = n3_bl.map(p => getQuadrant(p[0], p[1], 4));
console.log(o3bl_subquad_seq.join(" "));
console.log("Grouped:", getGroupedQuadrants(n3_bl, 4).join(" → "));

// For order 3 TL quadrant:
console.log("\n=== Order 3 TL quadrant sub-quadrant visit order ===");
console.log("Grouped:", getGroupedQuadrants(n3_tl, 4).join(" → "));

console.log("\n=== Order 3 TR quadrant sub-quadrant visit order ===");
console.log("Grouped:", getGroupedQuadrants(n3_tr, 4).join(" → "));

console.log("\n=== Order 3 BR quadrant sub-quadrant visit order ===");
console.log("Grouped:", getGroupedQuadrants(n3_br, 4).join(" → "));

// Now let me check the DEEPER structure.
// Within BL of order 3, the first sub-quadrant visited should be TR (per the BL rule).
// And within that TR sub-quadrant, points should be visited in order: BL → TL → TR → BR (TR's rule)

// n3_bl = [(3,0), (3,1), (2,2), (3,2), (3,3), (2,3), (1,2), (1,3),
//          (0,3), (0,2), (1,1), (0,1), (0,0), (1,0), (2,1), (2,0)]
// Points in TR sub-quadrant of n3_bl (x≥2, y<2): (3,0), (3,1), (2,1), (2,0)
// Visited in order: (3,0) at index 0, (3,1) at index 1, (2,1) at index 14, (2,0) at index 15
// That's NOT contiguous!

// Hmm, that means the sub-quadrant grouping at the leaf level is different.
// Points DON'T necessarily stay within their 2x2 quadrant before moving to the next.

// Wait, I think I need to reconsider. The "children" in the tree aren't necessarily
// spatial 2x2 quadrants. Let me re-examine.

// Actually, let me look at the order 3 curve more carefully.
// The first 4 points of n3_bl: (3,0), (3,1), (2,2), (3,2)
// These are in quadrants: TR, TR, BR, BR
// That's: TR, TR, BR, BR

// The next 4: (3,3), (2,3), (1,2), (1,3)
// Quadrants: BR, BR, BL, BL

// Next 4: (0,3), (0,2), (1,1), (0,1)
// Quadrants: BL, BL, TL, TL  (Wait: (1,1) is x=1<2, y=1<2 so TL)

// Next 4: (0,0), (1,0), (2,1), (2,0)
// Quadrants: TL, TL, TR, TR

// So the quadrant sequence for each pair is:
// TR TR BR BR | BR BR BL BL | BL BL TL TL | TL TL TR TR
// That's pairs of: TR BR | BR BL | BL TL | TL TR
// Overall quadrant order: TR → BR → BL → TL (but each quadrant spans 2 consecutive pairs)

// Actually wait, this makes more sense:
// Points 0-3: visit the boundary between TR and BR (2 in each)
// Points 4-7: visit the boundary between BR and BL (2 in each)
// etc.

// This is because at the leaf level (order 1), each 4-point visit crosses quadrant boundaries!
// Order 1: BL(0,1) → TL(0,0) → TR(1,0) → BR(1,1)
// That's 1 point in each quadrant, visiting all 4.

// So at the leaf level (order 1), the 4 points are in 4 different quadrants.
// The order is BL→TL→TR→BR for the base case.
// But when this is placed within a larger quadrant with a different entry/exit,
// the visitation order of the 4 points changes.

// This means the recursion works like this:
// Each level of recursion handles how to visit 4 sub-regions.
// The base case (leaf) visits 4 points in the appropriate order.
// The recursive case visits 4 sub-regions, each of which recursively visits its children.

// But the child visit order depends on which quadrant we're in:
// For BL: children visited TR → BR → BL → TL
// For TL: children visited BR → BL → TL → TR
// For TR: children visited BL → TL → TR → BR
// For BR: children visited TL → TR → BR → BL

// And this child visit order is the SAME AT EVERY LEVEL.

// So the algorithm is:
// 1. At the root level, visit quadrants in order: BL → TL → TR → BR
// 2. Within each quadrant Q, visit sub-quadrants in Q's specific order:
//    BL: TR → BR → BL → TL
//    TL: BR → BL → TL → TR
//    TR: BL → TL → TR → BR (same as root!)
//    BR: TL → TR → BR → BL

// At the leaf level (single points), just output the point.

// Let me verify this by implementing it:
function spaceFillingTreeWalk(order) {
  const gridSize = Math.pow(2, order);

  // Child visit order for each quadrant type
  const childOrder = {
    'ROOT': ['BL', 'TL', 'TR', 'BR'],
    'BL': ['TR', 'BR', 'BL', 'TL'],
    'TL': ['BR', 'BL', 'TL', 'TR'],
    'TR': ['BL', 'TL', 'TR', 'BR'],
    'BR': ['TL', 'TR', 'BR', 'BL'],
  };

  // Quadrant offsets within a region of given half-size
  function getQuadrantOffset(quadrant, halfSize) {
    switch(quadrant) {
      case 'BL': return {dx: 0, dy: halfSize};
      case 'TL': return {dx: 0, dy: 0};
      case 'TR': return {dx: halfSize, dy: 0};
      case 'BR': return {dx: halfSize, dy: halfSize};
    }
  }

  function recurse(x0, y0, size, parentQuadrant) {
    if (size === 1) {
      return [{x: x0, y: y0}];
    }

    const half = size / 2;
    const visitOrder = childOrder[parentQuadrant];
    const result = [];

    for (const childQ of visitOrder) {
      const offset = getQuadrantOffset(childQ, half);
      result.push(...recurse(x0 + offset.dx, y0 + offset.dy, half, childQ));
    }

    return result;
  }

  return recurse(0, 0, gridSize, 'ROOT');
}

console.log("\n\n=== TESTING DERIVED ALGORITHM ===");

// Test order 1:
const result1 = spaceFillingTreeWalk(1);
console.log("Order 1 result:", result1.map(p => `(${p.x},${p.y})`).join(" → "));
console.log("Order 1 expected: (0,1) → (0,0) → (1,0) → (1,1)");
console.log("Match:", JSON.stringify(result1.map(p => [p.x, p.y])) === JSON.stringify([[0,1],[0,0],[1,0],[1,1]]));

// Test order 2:
const result2 = spaceFillingTreeWalk(2);
console.log("\nOrder 2 result:", result2.map(p => `(${p.x},${p.y})`).join(" → "));
console.log("Order 2 expected:", order2.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("Match:", JSON.stringify(result2.map(p => [p.x, p.y])) === JSON.stringify(order2));

// Test order 3:
const result3 = spaceFillingTreeWalk(3);
console.log("\nOrder 3 result:", result3.map(p => `(${p.x},${p.y})`).join(" → "));
console.log("Order 3 expected:", order3.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("Match:", JSON.stringify(result3.map(p => [p.x, p.y])) === JSON.stringify(order3));

// Find mismatches
if (JSON.stringify(result3.map(p => [p.x, p.y])) !== JSON.stringify(order3)) {
  console.log("\nMismatches:");
  for (let i = 0; i < Math.max(result3.length, order3.length); i++) {
    const got = result3[i] ? `(${result3[i].x},${result3[i].y})` : 'N/A';
    const exp = order3[i] ? `(${order3[i][0]},${order3[i][1]})` : 'N/A';
    if (got !== exp) {
      console.log(`  [${i}] got ${got}, expected ${exp}`);
    }
  }
}
