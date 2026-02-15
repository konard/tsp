// Analyze the walking pattern from the user's specifications
// Order 1 (2x2, coords 0-1): (0,1) → (0,0) → (1,0) → (1,1)
// Order 2 (4x4, coords 0-3): (1,2) → (1,3) → (0,3) → (0,2) → (1,1) → (0,1) → (0,0) → (1,0) → (2,1) → (2,0) → (3,0) → (3,1) → (2,2) → (3,2) → (3,3) → (2,3)
// Order 3 (8x8, SVG coords 1-8, so 0-based is 0-7):
// From SVG: M 4 5 L 4 6 L 3 7 L 4 7 L 4 8 L 3 8 L 2 7 L 2 8 L 1 8 L 1 7 L 2 6 L 1 6 L 1 5 L 2 5 L 3 6 L 3 5
//           L 4 4 L 3 4 L 2 3 L 2 4 L 1 4 L 1 3 L 2 2 L 1 2 L 1 1 L 2 1 L 3 2 L 3 1 L 4 1 L 4 2 L 3 3 L 4 3
//           L 5 4 L 5 3 L 6 2 L 5 2 L 5 1 L 6 1 L 7 2 L 7 1 L 8 1 L 8 2 L 7 3 L 8 3 L 8 4 L 7 4 L 6 3 L 6 4
//           L 5 5 L 6 5 L 7 6 L 7 5 L 8 5 L 8 6 L 7 7 L 8 7 L 8 8 L 7 8 L 6 7 L 6 8 L 5 8 L 5 7 L 6 6 L 5 6
// Converting to 0-based: subtract 1 from each

const order1 = [
  [0,1], [0,0], [1,0], [1,1]
];

const order2 = [
  [1,2], [1,3], [0,3], [0,2], [1,1], [0,1], [0,0], [1,0], [2,1], [2,0], [3,0], [3,1], [2,2], [3,2], [3,3], [2,3]
];

// SVG uses (x,y) where x is col, y is row. M 4 5 means x=4, y=5
// Converting from 1-based to 0-based:
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

console.log("=== Order 1 (2x2) ===");
console.log("Points:", order1.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("Count:", order1.length, "(expected 4)");

console.log("\n=== Order 2 (4x4) ===");
console.log("Points:", order2.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("Count:", order2.length, "(expected 16)");

console.log("\n=== Order 3 (8x8) ===");
console.log("Points:", order3.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("Count:", order3.length, "(expected 64)");

// Now let's break order 2 into quadrants (each 2x2 within the 4x4 grid)
// BL quadrant: x in [0,1], y in [2,3]
// TL quadrant: x in [0,1], y in [0,1]
// TR quadrant: x in [2,3], y in [0,1]
// BR quadrant: x in [2,3], y in [2,3]
console.log("\n=== Order 2 broken into quadrants ===");
const q2_bl = order2.slice(0, 4);
const q2_tl = order2.slice(4, 8);
const q2_tr = order2.slice(8, 12);
const q2_br = order2.slice(12, 16);

console.log("Q1 (first 4 points):", q2_bl.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("  Quadrant:", identifyQuadrant(q2_bl, 4));
console.log("Q2 (next 4):", q2_tl.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("  Quadrant:", identifyQuadrant(q2_tl, 4));
console.log("Q3 (next 4):", q2_tr.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("  Quadrant:", identifyQuadrant(q2_tr, 4));
console.log("Q4 (next 4):", q2_br.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("  Quadrant:", identifyQuadrant(q2_br, 4));

function identifyQuadrant(points, gridSize) {
  const half = gridSize / 2;
  const allLeft = points.every(p => p[0] < half);
  const allRight = points.every(p => p[0] >= half);
  const allTop = points.every(p => p[1] < half);
  const allBottom = points.every(p => p[1] >= half);

  if (allLeft && allBottom) return "BL";
  if (allLeft && allTop) return "TL";
  if (allRight && allTop) return "TR";
  if (allRight && allBottom) return "BR";
  return "MIXED";
}

// Normalize quadrant points to 0-based within their quadrant
function normalizeQuadrant(points, gridSize) {
  const half = gridSize / 2;
  const minX = Math.min(...points.map(p => p[0]));
  const minY = Math.min(...points.map(p => p[1]));
  const baseX = minX >= half ? half : 0;
  const baseY = minY >= half ? half : 0;
  return points.map(p => [p[0] - baseX, p[1] - baseY]);
}

console.log("\n=== Normalized quadrants for order 2 ===");
const n2_bl = normalizeQuadrant(q2_bl, 4);
const n2_tl = normalizeQuadrant(q2_tl, 4);
const n2_tr = normalizeQuadrant(q2_tr, 4);
const n2_br = normalizeQuadrant(q2_br, 4);

console.log("BL (norm):", n2_bl.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("TL (norm):", n2_tl.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("TR (norm):", n2_tr.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("BR (norm):", n2_br.map(p => `(${p[0]},${p[1]})`).join(" → "));

// Compare with order 1: (0,1) → (0,0) → (1,0) → (1,1)
console.log("\nOrder 1 reference: (0,1) → (0,0) → (1,0) → (1,1)");

// Now let's figure out the entry/exit corners
function cornerName(x, y, size) {
  const isLeft = x === 0;
  const isTop = y === 0;
  if (isLeft && isTop) return "TL";
  if (isLeft && !isTop) return "BL";
  if (!isLeft && isTop) return "TR";
  return "BR";
}

console.log("\n=== Entry/Exit analysis for order 2 quadrants ===");
for (const [name, norm] of [["BL", n2_bl], ["TL", n2_tl], ["TR", n2_tr], ["BR", n2_br]]) {
  const entry = cornerName(norm[0][0], norm[0][1], 2);
  const exit = cornerName(norm[3][0], norm[3][1], 2);
  console.log(`${name}: entry=${entry} (${norm[0][0]},${norm[0][1]}), exit=${exit} (${norm[3][0]},${norm[3][1]}), path: ${norm.map(p => `(${p[0]},${p[1]})`).join(" → ")}`);
}

// Now analyze order 3 broken into 4x4 quadrants
console.log("\n\n=== Order 3 broken into quadrants (16 points each) ===");
const q3_1 = order3.slice(0, 16);
const q3_2 = order3.slice(16, 32);
const q3_3 = order3.slice(32, 48);
const q3_4 = order3.slice(48, 64);

console.log("Q1 (first 16):", q3_1.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("  Quadrant:", identifyQuadrant(q3_1, 8));
console.log("Q2 (next 16):", q3_2.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("  Quadrant:", identifyQuadrant(q3_2, 8));
console.log("Q3 (next 16):", q3_3.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("  Quadrant:", identifyQuadrant(q3_3, 8));
console.log("Q4 (last 16):", q3_4.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("  Quadrant:", identifyQuadrant(q3_4, 8));

// Normalize each quadrant to 0-3 coordinates
const n3_1 = normalizeQuadrant(q3_1, 8);
const n3_2 = normalizeQuadrant(q3_2, 8);
const n3_3 = normalizeQuadrant(q3_3, 8);
const n3_4 = normalizeQuadrant(q3_4, 8);

console.log("\n=== Normalized quadrants for order 3 ===");
console.log("Q1 (norm):", n3_1.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("Q2 (norm):", n3_2.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("Q3 (norm):", n3_3.map(p => `(${p[0]},${p[1]})`).join(" → "));
console.log("Q4 (norm):", n3_4.map(p => `(${p[0]},${p[1]})`).join(" → "));

// Compare with order 2: (1,2) → (1,3) → (0,3) → (0,2) → (1,1) → (0,1) → (0,0) → (1,0) → (2,1) → (2,0) → (3,0) → (3,1) → (2,2) → (3,2) → (3,3) → (2,3)
console.log("\nOrder 2 reference: (1,2) → (1,3) → (0,3) → (0,2) → (1,1) → (0,1) → (0,0) → (1,0) → (2,1) → (2,0) → (3,0) → (3,1) → (2,2) → (3,2) → (3,3) → (2,3)");

// Check if the normalized versions match order 2
console.log("\nDo normalized quadrants match order 2?");
console.log("Q1 matches order 2?", JSON.stringify(n3_1) === JSON.stringify(order2));
console.log("Q2 matches order 2?", JSON.stringify(n3_2) === JSON.stringify(order2));
console.log("Q3 matches order 2?", JSON.stringify(n3_3) === JSON.stringify(order2));
console.log("Q4 matches order 2?", JSON.stringify(n3_4) === JSON.stringify(order2));

// Break each quadrant of order 3 further into sub-quadrants of order 1
console.log("\n\n=== Breaking Q1 of order 3 into 4 sub-quadrants (4 points each) ===");
const q3_1_a = n3_1.slice(0, 4);
const q3_1_b = n3_1.slice(4, 8);
const q3_1_c = n3_1.slice(8, 12);
const q3_1_d = n3_1.slice(12, 16);

console.log("Sub-Q1:", q3_1_a.map(p => `(${p[0]},${p[1]})`).join(" → "), "Quadrant:", identifyQuadrant(q3_1_a, 4));
console.log("Sub-Q2:", q3_1_b.map(p => `(${p[0]},${p[1]})`).join(" → "), "Quadrant:", identifyQuadrant(q3_1_b, 4));
console.log("Sub-Q3:", q3_1_c.map(p => `(${p[0]},${p[1]})`).join(" → "), "Quadrant:", identifyQuadrant(q3_1_c, 4));
console.log("Sub-Q4:", q3_1_d.map(p => `(${p[0]},${p[1]})`).join(" → "), "Quadrant:", identifyQuadrant(q3_1_d, 4));

// Do the same for Q2, Q3, Q4
for (const [name, norm] of [["Q2", n3_2], ["Q3", n3_3], ["Q4", n3_4]]) {
  console.log(`\n=== Breaking ${name} of order 3 into 4 sub-quadrants ===`);
  for (let i = 0; i < 4; i++) {
    const sub = norm.slice(i*4, (i+1)*4);
    const nsub = normalizeQuadrant(sub, 4);
    const quadName = identifyQuadrant(sub, 4);
    const entry = cornerName(nsub[0][0], nsub[0][1], 2);
    const exit = cornerName(nsub[3][0], nsub[3][1], 2);
    console.log(`  Sub-Q${i+1}: ${sub.map(p => `(${p[0]},${p[1]})`).join(" → ")} Quadrant:${quadName} entry=${entry} exit=${exit} norm:${nsub.map(p => `(${p[0]},${p[1]})`).join("→")}`);
  }
}

// Now let's understand what traversal order each sub-quadrant has
// Order 1 reference: BL(0,1) → TL(0,0) → TR(1,0) → BR(1,1) - entry=BL, exit=BR

// For the overall pattern, let me understand:
// Order 1: entry=BL exit=BR, visit: BL → TL → TR → BR (CCW)
// Order 2: start at (1,2)=TR of BL-quadrant, visiting quadrants: BL → TL → TR → BR (same as order 1)
// In order 2, the first quadrant visited is BL quadrant with entry=TR, exit=BL
// Let me check more carefully

console.log("\n\n=== Entry/Exit analysis for each quadrant at each level ===");

// For order 2, the overall entry/exit:
console.log("Order 2 overall: entry corner = ?");
const o2_first = order2[0]; // (1,2)
const o2_last = order2[15]; // (2,3)
console.log(`  First point: (${o2_first[0]},${o2_first[1]})`);
console.log(`  Last point: (${o2_last[0]},${o2_last[1]})`);
// (1,2) is TR of BL quadrant - it's near center
// (2,3) is BL of BR quadrant - also near center

// For order 3:
const o3_first = order3[0]; // (3,4)
const o3_last = order3[63]; // (4,5)
console.log(`Order 3 overall:`);
console.log(`  First point: (${o3_first[0]},${o3_first[1]})`);
console.log(`  Last point: (${o3_last[0]},${o3_last[1]})`);

// Let me think of this differently.
// The "entry" and "exit" of a region at the next level up is always the corner closest to center.
// For a region, the center corner for BL is TR, for TL is BR, for TR is BL, for BR is TL.

// Let me trace the quadrant visitation order for order 2:
// BL quadrant (0-1, 2-3): points 0-3: (1,2)(1,3)(0,3)(0,2) - entry at (1,2)=TR, exit at (0,2)=TL
// TL quadrant (0-1, 0-1): points 4-7: (1,1)(0,1)(0,0)(1,0) - entry at (1,1)=BR, exit at (1,0)=TR
// TR quadrant (2-3, 0-1): points 8-11: (2,1)(2,0)(3,0)(3,1) - entry at (2,1)=BL, exit at (3,1)=BR
// BR quadrant (2-3, 2-3): points 12-15: (2,2)(3,2)(3,3)(2,3) - entry at (2,2)=TL, exit at (2,3)=BL

console.log("\n=== Order 2 quadrant analysis (relative to sub-quadrant) ===");
for (const [name, sub] of [["BL", q2_bl], ["TL", q2_tl], ["TR", q2_tr], ["BR", q2_br]]) {
  const norm = normalizeQuadrant(sub, 4);
  const entry = cornerName(norm[0][0], norm[0][1], 2);
  const exit = cornerName(norm[3][0], norm[3][1], 2);
  console.log(`${name}: entry=${entry}, exit=${exit}, path: ${norm.map(p => cornerName(p[0],p[1],2)).join("→")}`);
}

// So the pattern for visiting children at order 2 (parent visit: BL→TL→TR→BR):
// BL child: entry=TR, exit=TL, visits: TR→BR→BL→TL
// TL child: entry=BR, exit=TR, visits: BR→BL→TL→TR
// TR child: entry=BL, exit=BR, visits: BL→TL→TR→BR  (same as order 1!)
// BR child: entry=TL, exit=BL, visits: TL→TR→BR→BL

// Entry for each child = centerCorner (corner closest to center of parent)
// centerCorner: BL→TR, TL→BR, TR→BL, BR→TL

// Exit for each child:
// BL child exits at TL (because next is TL quadrant - need to go toward TL from BL quadrant)
// TL child exits at TR (because next is TR quadrant - need to go toward TR from TL quadrant)
// TR child exits at BR (because next is BR quadrant - need to go toward BR from TR quadrant)
// BR child exits at BL (because next is BL quadrant - wrapping around, back to start)

// Wait, that doesn't seem right. Let me think again...
// The exit needs to be the corner closest to where we enter the NEXT quadrant

// From BL to TL: BL child's exit should be close to TL child's entry
//   TL child's entry = BR (centerCorner of TL)
//   So BL exit should be close to where BR of TL is = (1,1) in global
//   BL child exit at TL = (0,2) in global.
//   Hmm, (0,2) and (1,1) are adjacent diagonally

// Let me think about this differently using the actual positions
// The key insight: exit of current quad and entry of next quad must be as close as possible

// For parent loop BL→TL→TR→BR:
// BL entry = TR (center corner), BL exit = ?
//   Next quad is TL. TL's entry = BR (center corner) = (1,1) in 4x4 grid
//   From BL quadrant perspective, the exit corner closest to TL's entry BR at (1,1) would be TL corner of BL at (0,2)
//   Actually (1,1) is the BR corner of TL quadrant which is at absolute position (1,1)
//   The BL quadrant corners: TL=(0,2), TR=(1,2), BL=(0,3), BR=(1,3)
//   Closest to (1,1) from BL's corners: TL(0,2)=dist sqrt(2), TR(1,2)=dist 1. So TR!
//   But the actual exit from BL is (0,2) = TL, not TR.
//   Hmm, that contradicts. Let me re-check the data.

// Actually wait, looking at the data again:
// BL: (1,2)→(1,3)→(0,3)→(0,2) - entry at (1,2)=TR of BL, exit at (0,2)=TL of BL
// Next is TL: (1,1)→(0,1)→(0,0)→(1,0) - entry at (1,1)=BR of TL
// From (0,2) to (1,1): distance = sqrt(1+1) = sqrt(2) (diagonal)

// TL: exit at (1,0)=TR of TL
// Next is TR: (2,1)→... entry at (2,1)=BL of TR
// From (1,0) to (2,1): distance = sqrt(1+1) = sqrt(2) (diagonal)

// TR: exit at (3,1)=BR of TR
// Next is BR: (2,2)→... entry at (2,2)=TL of BR
// From (3,1) to (2,2): distance = sqrt(1+1) = sqrt(2) (diagonal)

// BR: exit at (2,3)=BL of BR
// Next is BL: (1,2)→... entry at (1,2)=TR of BL
// From (2,3) to (1,2): distance = sqrt(1+1) = sqrt(2) (diagonal)

// So ALL transitions are diagonal! And the exit-entry pairs are:
// BL exit TL → TL entry BR  (diagonal neighbor)
// TL exit TR → TR entry BL  (diagonal neighbor)
// TR exit BR → BR entry TL  (diagonal neighbor)
// BR exit BL → BL entry TR  (diagonal neighbor) [wrap-around]

console.log("\n\n=== Summary of the pattern ===");
console.log("Parent loop: BL → TL → TR → BR (counter-clockwise)");
console.log("Child entry (centerCorner): BL→TR, TL→BR, TR→BL, BR→TL");
console.log("Child exit: BL→TL, TL→TR, TR→BR, BR→BL");
console.log("");
console.log("Exit rule: the exit corner is the OPPOSITE of the entry corner of the NEXT quadrant,");
console.log("           rotated one step in the parent loop direction");

// Let me verify the exit rule more systematically
// The exit of each child is determined by: which corner allows the shortest path to the next child's entry

// Let me think about it as: what's the general rule?
// centerCorner: BL→TR, TL→BR, TR→BL, BR→TL  (opposite corner)
// Parent visits: BL→TL→TR→BR

// BL: entry=TR. Next=TL entry=BR. Exit should allow reaching (1,1) from BL quadrant.
//   BL TL corner is at (0,2), BL TR corner is at (1,2)
//   From TL(0,2): distance to (1,1) = sqrt(2)
//   Actually, the exit is TL. Why not TR? Because TR is the entry! We can't enter and exit from same corner in a 4-cycle.
//   Let me reconsider. The path through BL is: TR→BR→BL→TL
//   If entry=TR, exit must be the one we reach after visiting all 4 corners.
//   TR→BR→BL→TL means exit=TL. That's just the CCW direction from TR ending at TL.

// Wait no, looking at BL data: (1,2)→(1,3)→(0,3)→(0,2) = TR→BR→BL→TL
// That's CW! TR→BR→BL→TL is clockwise!

// TL data: (1,1)→(0,1)→(0,0)→(1,0) = BR→BL→TL→TR
// BR→BL→TL→TR: that's CCW (counter-clockwise)

// TR data: (2,1)→(2,0)→(3,0)→(3,1) = BL→TL→TR→BR
// BL→TL→TR→BR: that's CCW

// BR data: (2,2)→(3,2)→(3,3)→(2,3) = TL→TR→BR→BL
// TL→TR→BR→BL: that's CW

console.log("\n=== Direction analysis ===");
console.log("BL child: TR→BR→BL→TL = CW");
console.log("TL child: BR→BL→TL→TR = CCW");
console.log("TR child: BL→TL→TR→BR = CCW (same as order 1!)");
console.log("BR child: TL→TR→BR→BL = CW");

// So the pattern is: BL=CW, TL=CCW, TR=CCW, BR=CW
// Or equivalently: the "diagonal" quadrants (BL,BR) use CW, the "other" pair (TL,TR) use CCW
// Wait: BL and BR are CW, TL and TR are CCW

// Actually, let me think about this differently. The key insight from the user is that
// this is a "tree walk" - specifically walking a 4-ary tree from "left to right"

// Now for order 3, let me verify the same pattern holds at the top level
console.log("\n=== Order 3 top-level analysis ===");
for (const [name, sub, gridSize] of [["BL", q3_1, 8], ["TL", q3_2, 8], ["TR", q3_3, 8], ["BR", q3_4, 8]]) {
  const norm = normalizeQuadrant(sub, gridSize);
  const first = norm[0];
  const last = norm[15];
  console.log(`${name}: first=(${first[0]},${first[1]}), last=(${last[0]},${last[1]})`);
}

// Now let me check if the normalized sub-patterns of order 3 match order 2
// But we need to check if they're the same pattern or rotated/reflected
function patternsMatch(a, b) {
  if (a.length !== b.length) return false;
  return a.every((p, i) => p[0] === b[i][0] && p[1] === b[i][1]);
}

console.log("\n=== Checking if order 3 quadrants match transformations of order 2 ===");

// Define transformations
function rotate90CW(points, size) {
  return points.map(([x, y]) => [size - 1 - y, x]);
}
function rotate90CCW(points, size) {
  return points.map(([x, y]) => [y, size - 1 - x]);
}
function rotate180(points, size) {
  return points.map(([x, y]) => [size - 1 - x, size - 1 - y]);
}
function reflectX(points, size) {
  return points.map(([x, y]) => [size - 1 - x, y]);
}
function reflectY(points, size) {
  return points.map(([x, y]) => [x, size - 1 - y]);
}

const transforms = {
  'identity': (p, s) => p,
  'rot90CW': rotate90CW,
  'rot90CCW': rotate90CCW,
  'rot180': rotate180,
  'reflectX': reflectX,
  'reflectY': reflectY,
};

const size = 4; // for order 2 grid
for (const [qname, qpoints] of [["BL", n3_1], ["TL", n3_2], ["TR", n3_3], ["BR", n3_4]]) {
  console.log(`\n${qname} quadrant of order 3:`);
  for (const [tname, tfn] of Object.entries(transforms)) {
    const transformed = tfn(order2, size);
    if (patternsMatch(qpoints, transformed)) {
      console.log(`  MATCH with ${tname} of order 2!`);
    }
  }
  // If no match found, let's check what it actually looks like
  console.log(`  Actual: ${qpoints.slice(0,4).map(p => `(${p[0]},${p[1]})`).join("→")} ...`);
  console.log(`  Order2: ${order2.slice(0,4).map(p => `(${p[0]},${p[1]})`).join("→")} ...`);
}

// Let me try a different approach: check each quadrant of order 3 against
// sub-quadrant visitation patterns
console.log("\n\n=== Deep analysis: Order 3 quadrant BL breakdown ===");
// BL quadrant of order 3 has 16 points on a 4x4 sub-grid (coords 0-3)
// Let's break it into its own 4 sub-quadrants:
for (let i = 0; i < 4; i++) {
  const sub = n3_1.slice(i*4, (i+1)*4);
  const norm = normalizeQuadrant(sub, 4);
  const quad = identifyQuadrant(sub, 4);
  const entry = cornerName(norm[0][0], norm[0][1], 2);
  const exit = cornerName(norm[3][0], norm[3][1], 2);
  console.log(`  Sub ${i+1} (${quad}): entry=${entry}, exit=${exit}, path: ${norm.map(p => cornerName(p[0],p[1],2)).join("→")}`);
}

console.log("\nCompare with Order 2 quadrants:");
console.log("BL: entry=TR, exit=TL, path: TR→BR→BL→TL");
console.log("TL: entry=BR, exit=TR, path: BR→BL→TL→TR");
console.log("TR: entry=BL, exit=BR, path: BL→TL→TR→BR");
console.log("BR: entry=TL, exit=BL, path: TL→TR→BR→BL");

// The order of visiting quadrants at order 2 is BL→TL→TR→BR
// Let's check the order of visiting quadrants within BL of order 3:
const bl3_quads = [];
for (let i = 0; i < 4; i++) {
  const sub = n3_1.slice(i*4, (i+1)*4);
  bl3_quads.push(identifyQuadrant(sub, 4));
}
console.log(`\nQuadrant visit order within BL of order 3: ${bl3_quads.join("→")}`);

// And within each other order 3 quadrant:
for (const [name, norm] of [["TL", n3_2], ["TR", n3_3], ["BR", n3_4]]) {
  const quads = [];
  for (let i = 0; i < 4; i++) {
    const sub = norm.slice(i*4, (i+1)*4);
    quads.push(identifyQuadrant(sub, 4));
  }
  console.log(`Quadrant visit order within ${name} of order 3: ${quads.join("→")}`);
}

// Now let's check the entry/exit of sub-quadrants within EACH order 3 quadrant
console.log("\n\n=== Complete sub-quadrant analysis for all order 3 quadrants ===");
for (const [parentName, parentNorm] of [["BL", n3_1], ["TL", n3_2], ["TR", n3_3], ["BR", n3_4]]) {
  console.log(`\n${parentName} quadrant of order 3 (visit order BL→TL→TR→BR):`);
  for (let i = 0; i < 4; i++) {
    const sub = parentNorm.slice(i*4, (i+1)*4);
    const quad = identifyQuadrant(sub, 4);
    const norm = normalizeQuadrant(sub, 4);
    const entry = cornerName(norm[0][0], norm[0][1], 2);
    const exit = cornerName(norm[3][0], norm[3][1], 2);
    const dir = isClockwise(norm) ? "CW" : "CCW";
    console.log(`  ${quad}: entry=${entry}, exit=${exit}, dir=${dir}`);
  }
}

function isClockwise(points) {
  // For a 4-point cycle, check if it's CW or CCW
  // CW order around a square: TL→TR→BR→BL
  // CCW order: TL→BL→BR→TR
  const corners = points.map(p => cornerName(p[0], p[1], 2));
  const cwPatterns = [
    'TL→TR→BR→BL', 'TR→BR→BL→TL', 'BR→BL→TL→TR', 'BL→TL→TR→BR' // Wait, BL→TL→TR→BR is actually CCW...
  ];
  // Let me reconsider. In screen coordinates (y increases downward):
  // CW: TL(0,0)→TR(1,0)→BR(1,1)→BL(0,1) - right, down, left, up
  // CCW: TL(0,0)→BL(0,1)→BR(1,1)→TR(1,0) - down, right, up, left
  const path = corners.join('→');
  const cwPaths = ['TL→TR→BR→BL', 'TR→BR→BL→TL', 'BR→BL→TL→TR', 'BL→TL→TR→BR'];
  // Wait, BL→TL→TR→BR: BL(0,1)→TL(0,0)→TR(1,0)→BR(1,1) = up, right, down
  // That's actually CCW in screen coords!
  // CW in screen coords: BL(0,1)→BR(1,1)→TR(1,0)→TL(0,0) = right, up, left

  // Let me just use the cross product method
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const curr = points[i];
    const next = points[(i+1) % points.length];
    sum += (next[0] - curr[0]) * (next[1] + curr[1]);
  }
  return sum > 0; // positive = CW in screen coords
}
