// The issue is at the deepest recursion level.
// At order 3, we recurse 3 times: size 8 → 4 → 2 → 1
// At size=2, the 4 children are individual points at size=1.
// The visit order at size=2 determines the leaf ordering.

// Let me trace the exact expected pattern for the first 4 points of order 3 BL.
// Expected: (3,4)(3,5)(2,6)(3,6) in absolute coords
// BL quadrant is at [0-3, 4-7], so normalized: (3,0)(3,1)(2,2)(3,2)

// In the BL quadrant (4x4), the first sub-quadrant visited should be TR (per BL rule).
// TR sub-quadrant is [2-3, 0-1] within the 4x4.
// The first 2 points (3,0)(3,1) are indeed in TR.
// But then (2,2) is in BR sub-quadrant.

// So the "4 points at a time" grouping doesn't correspond to 2x2 leaf quadrants.
// Each group of 4 consecutive points at the leaf spans ACROSS 2x2 boundaries.

// Wait, that can't be right if the algorithm is recursive. Let me think again.
// At size=2, we have a 2x2 region with 4 points. The visit order is determined
// by the type. These 4 points are always within the same 2x2 region.

// So at order 3:
// size=8 → 4 quadrants of size 4, visited in order BL→TL→TR→BR (ROOT type)
// First quadrant is BL (size 4, at [0-3, 4-7])
// Within BL: size=4 → 4 quadrants of size 2, visited in BL's order: TR→BR→BL→TL
// First sub-quadrant of BL is TR (size 2, at [2-3, 4-5] absolute, or [2-3, 0-1] normalized)
// Within this TR: the 4 points at [2-3, 0-1] (normalized) should be visited in some order

// The 4 points in this 2x2 region:
// (2,0), (3,0), (2,1), (3,1)

// Expected first 4 points (normalized): (3,0)(3,1)(2,2)(3,2)
// But (2,2) and (3,2) are NOT in the TR sub-quadrant [2-3, 0-1]!
// So my expected is wrong, or the sub-quadrant assignment is wrong.

// Wait, (3,0) IS in TR (x=3≥2, y=0<2). (3,1) is also in TR. But (2,2) is in BR (x=2≥2, y=2≥2).
// So the first 2 points are in TR, and points 3-4 are in BR.
// This means the leaf level visit at the 2x2 boundary mixes across adjacent quadrants!

// That's impossible in a proper tree recursion... unless the visit at each level
// isn't a simple "finish one sub-region before starting the next".

// OH WAIT. I think I finally understand. The recursion might work differently.
// Let me re-read the user's comment: "It is just like regular tree walk from left to right,
// but here we have not binary tree, but 4-tree, meaning we will get loop."

// A tree walk visits nodes, not just leaves. In a 4-ary tree at level 2:
// root → child0 → child0.child0 → child0 → child0.child1 → child0 → child0.child2 →
// child0 → child0.child3 → child0 → root → child1 → ...

// But for our space-filling curve, we only care about the LEAVES.
// The leaf visit order in a DFS is:
// child0.child0, child0.child1, child0.child2, child0.child3,
// child1.child0, child1.child1, child1.child2, child1.child3, ...

// With our custom child ordering, this should work correctly.
// So the 4 points at positions [0-3] should ALL be within child0.
// And child0 is the TR sub-quadrant of BL.

// Expected: (3,0)(3,1)(2,2)(3,2) normalized
// (3,0) and (3,1) are in TR: ✓
// (2,2) and (3,2) are in BR: ✗ ← NOT in TR!

// This is a contradiction. Unless I'm wrong about the sub-quadrant boundaries.
// In a 4x4 grid divided into 2x2 quadrants:
// TL: [0-1, 0-1], TR: [2-3, 0-1], BL: [0-1, 2-3], BR: [2-3, 2-3]

// (2,2) → x=2 (≥2), y=2 (≥2) → BR ✓ (not in TR!)
// So the expected curve DOES cross sub-quadrant boundaries within the first 4 points.

// This means the algorithm is NOT a simple tree DFS with fixed child orderings.
// The self-similar structure must involve a different kind of recursion.

// Let me go back to basics. The curve at order N is a cyclic shift of the curve at order N-1
// (when normalized to the same grid). Let me verify this more carefully.

const order1 = [[0,1], [0,0], [1,0], [1,1]];
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

// The key pattern: each quadrant of order N+1 is a cyclic rotation of order N.
// The offsets are: BL→10, TL→14, TR→2, BR→6 (for order 2 → order 3)

// Let me check if the same offsets apply for order 1 → order 2
function normalizeQ(points, gridSize, qName) {
  const half = gridSize / 2;
  let baseX, baseY;
  switch(qName) {
    case 'BL': baseX = 0; baseY = half; break;
    case 'TL': baseX = 0; baseY = 0; break;
    case 'TR': baseX = half; baseY = 0; break;
    case 'BR': baseX = half; baseY = half; break;
  }
  return points.map(([x,y]) => [x - baseX, y - baseY]);
}

// Order 2 quadrants:
const q2_bl = normalizeQ(order2.slice(0, 4), 4, 'BL');
const q2_tl = normalizeQ(order2.slice(4, 8), 4, 'TL');
const q2_tr = normalizeQ(order2.slice(8, 12), 4, 'TR');
const q2_br = normalizeQ(order2.slice(12, 16), 4, 'BR');

function findCyclicOffset(base, rotated) {
  const n = base.length;
  for (let offset = 0; offset < n; offset++) {
    let match = true;
    for (let i = 0; i < n; i++) {
      const bi = (i + offset) % n;
      if (base[bi][0] !== rotated[i][0] || base[bi][1] !== rotated[i][1]) {
        match = false;
        break;
      }
    }
    if (match) return offset;
  }
  return -1;
}

console.log("Order 1 → Order 2 cyclic offsets:");
console.log("BL:", findCyclicOffset(order1, q2_bl));
console.log("TL:", findCyclicOffset(order1, q2_tl));
console.log("TR:", findCyclicOffset(order1, q2_tr));
console.log("BR:", findCyclicOffset(order1, q2_br));

// Order 2 → Order 3 cyclic offsets (already known):
const q3_bl = normalizeQ(order3.slice(0, 16), 8, 'BL');
const q3_tl = normalizeQ(order3.slice(16, 32), 8, 'TL');
const q3_tr = normalizeQ(order3.slice(32, 48), 8, 'TR');
const q3_br = normalizeQ(order3.slice(48, 64), 8, 'BR');

console.log("\nOrder 2 → Order 3 cyclic offsets:");
console.log("BL:", findCyclicOffset(order2, q3_bl));
console.log("TL:", findCyclicOffset(order2, q3_tl));
console.log("TR:", findCyclicOffset(order2, q3_tr));
console.log("BR:", findCyclicOffset(order2, q3_br));

// Now the interesting question: what's the FRACTION of the cycle each offset represents?
// Order 1 has 4 points. Order 2 has 16.
// The offsets for order 1→2 are fractions of 4.
// The offsets for order 2→3 are fractions of 16.

// If BL offset from order 1→2 is X/4, then from order 2→3 it should be X/16 * 4 = X in 16-space
// Let me check: if order 1→2 BL offset = 2, fraction = 2/4 = 0.5
// Then order 2→3 BL offset should be 0.5 * 16 = 8. But actual is 10.
// So it's NOT a simple scaling.

// Let me think about this recursively. The offset for BL in order N → N+1:
// At order N, the BL quadrant starts at some point. The starting point is determined by
// the center-facing corner of BL, which is TR.
// At order N, TR corner is at (gridSize-1, 0).
// Where does (gridSize-1, 0) appear in the order N sequence?

function findPointInSequence(seq, x, y) {
  for (let i = 0; i < seq.length; i++) {
    if (seq[i][0] === x && seq[i][1] === y) return i;
  }
  return -1;
}

console.log("\nPosition of corner points in each order:");
console.log("Order 1 (size 2):");
console.log("  BL(0,1):", findPointInSequence(order1, 0, 1));
console.log("  TL(0,0):", findPointInSequence(order1, 0, 0));
console.log("  TR(1,0):", findPointInSequence(order1, 1, 0));
console.log("  BR(1,1):", findPointInSequence(order1, 1, 1));

console.log("Order 2 (size 4):");
console.log("  BL(0,3):", findPointInSequence(order2, 0, 3));
console.log("  TL(0,0):", findPointInSequence(order2, 0, 0));
console.log("  TR(3,0):", findPointInSequence(order2, 3, 0));
console.log("  BR(3,3):", findPointInSequence(order2, 3, 3));

console.log("Order 3 (size 8):");
console.log("  BL(0,7):", findPointInSequence(order3, 0, 7));
console.log("  TL(0,0):", findPointInSequence(order3, 0, 0));
console.log("  TR(7,0):", findPointInSequence(order3, 7, 0));
console.log("  BR(7,7):", findPointInSequence(order3, 7, 7));

// Now the center-facing corners:
// BL quadrant's center-facing corner is TR of BL region
// At grid size 4: TR of BL region [0-1,2-3] = (1,2)
// At grid size 8: TR of BL region [0-3,4-7] = (3,4)
console.log("\nCenter-facing corner positions:");
console.log("Order 2 BL center-corner (1,2):", findPointInSequence(order2, 1, 2));
console.log("Order 2 TL center-corner (1,1):", findPointInSequence(order2, 1, 1));
console.log("Order 2 TR center-corner (2,1):", findPointInSequence(order2, 2, 1));
console.log("Order 2 BR center-corner (2,2):", findPointInSequence(order2, 2, 2));

console.log("Order 3 BL center-corner (3,4):", findPointInSequence(order3, 3, 4));
console.log("Order 3 TL center-corner (3,3):", findPointInSequence(order3, 3, 3));
console.log("Order 3 TR center-corner (4,3):", findPointInSequence(order3, 4, 3));
console.log("Order 3 BR center-corner (4,4):", findPointInSequence(order3, 4, 4));

// So the entry point of each quadrant IS the center-facing corner point.
// Order 2:
//   BL starts at position 0 → center-corner (1,2) is at position 0 ✓
//   TL starts at position 4 → center-corner (1,1) is at position 4 ✓
//   TR starts at position 8 → center-corner (2,1) is at position 8 ✓
//   BR starts at position 12 → center-corner (2,2) is at position 12 ✓

// Order 3:
//   BL starts at position 0 → center-corner (3,4) is at position 0 ✓
//   TL starts at position 16 → center-corner (3,3) is at position 16 ✓
//   TR starts at position 32 → center-corner (4,3) is at position 32 ✓
//   BR starts at position 48 → center-corner (4,4) is at position 48 ✓

// Great! So the curve ALWAYS starts at the center-facing corner of BL quadrant,
// which approaches the center as order increases.

// Now the recursive structure: since each quadrant is a cyclic rotation of the lower order,
// the algorithm is:
// 1. Compute order N curve
// 2. For order N+1, place order N in each quadrant, cyclically shifted so that
//    the first point is the center-facing corner of that quadrant

// But we need to build this bottom-up, not reference the previous level.
// The key is: each cell at level k gets visited exactly once, and the ordering
// is determined by recursing down the tree.

// Since the normalized quadrants ARE cyclic rotations of the lower order,
// the recursive algorithm just needs to know the right starting offset.

// Actually, let me try yet another approach. Instead of trying to figure out
// complex recursive rules, let me directly implement the "cyclic rotation" property.

// Algorithm:
// 1. Build order 1: [BL, TL, TR, BR] = [(0,1),(0,0),(1,0),(1,1)]
// 2. To build order N+1 from order N:
//    a. Take the order N sequence (on a grid of size 2^N)
//    b. For each of the 4 quadrants (BL, TL, TR, BR), place a copy of order N
//       shifted to the appropriate quadrant position
//    c. Find the cyclic offset that puts the center-facing corner first
//    d. Concatenate: BL, TL, TR, BR (each with their cyclic shift)

function buildCurve(order) {
  if (order === 1) {
    return [[0,1], [0,0], [1,0], [1,1]];
  }

  const prevCurve = buildCurve(order - 1);
  const prevSize = Math.pow(2, order - 1);
  const size = prevSize * 2;
  const half = prevSize;

  // Place the curve in each quadrant
  function placeCurve(curve, offsetX, offsetY) {
    return curve.map(([x,y]) => [x + offsetX, y + offsetY]);
  }

  // Quadrant offsets
  const quadrantOffsets = {
    'BL': [0, half],
    'TL': [0, 0],
    'TR': [half, 0],
    'BR': [half, half],
  };

  // Center-facing corner for each quadrant (in absolute coords)
  const centerCorners = {
    'BL': [half - 1, half],  // TR of BL region
    'TL': [half - 1, half - 1],  // BR of TL region
    'TR': [half, half - 1],  // BL of TR region
    'BR': [half, half],  // TL of BR region
  };

  // For each quadrant, place the curve and find the right cyclic offset
  const quadrantCurves = {};
  for (const [q, [ox, oy]] of Object.entries(quadrantOffsets)) {
    const placed = placeCurve(prevCurve, ox, oy);

    // Find the center-facing corner in the placed curve
    const [cx, cy] = centerCorners[q];
    let startIdx = -1;
    for (let i = 0; i < placed.length; i++) {
      if (placed[i][0] === cx && placed[i][1] === cy) {
        startIdx = i;
        break;
      }
    }

    // Cyclically rotate to start from center-facing corner
    const rotated = [];
    for (let i = 0; i < placed.length; i++) {
      rotated.push(placed[(startIdx + i) % placed.length]);
    }

    quadrantCurves[q] = rotated;
  }

  // Concatenate in order: BL, TL, TR, BR
  return [
    ...quadrantCurves['BL'],
    ...quadrantCurves['TL'],
    ...quadrantCurves['TR'],
    ...quadrantCurves['BR'],
  ];
}

// Test:
const r1 = buildCurve(1);
console.log("\n\n=== BOTTOM-UP APPROACH ===");
console.log("Order 1:", r1.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("Expected:", order1.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("Match:", JSON.stringify(r1) === JSON.stringify(order1));

const r2 = buildCurve(2);
console.log("\nOrder 2:", r2.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("Expected:", order2.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("Match:", JSON.stringify(r2) === JSON.stringify(order2));

const r3 = buildCurve(3);
console.log("\nOrder 3:", r3.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("Expected:", order3.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("Match:", JSON.stringify(r3) === JSON.stringify(order3));

if (JSON.stringify(r3) !== JSON.stringify(order3)) {
  console.log("\nFirst 10 mismatches:");
  let count = 0;
  for (let i = 0; i < r3.length && count < 10; i++) {
    if (r3[i][0] !== order3[i][0] || r3[i][1] !== order3[i][1]) {
      console.log(`  [${i}] got (${r3[i][0]},${r3[i][1]}), expected (${order3[i][0]},${order3[i][1]})`);
      count++;
    }
  }
}
