// From the trace, at size=2, the shift is ALWAYS determined by the spatial quadrant:
// BL → shift 0, TL → shift 1, TR → shift 2, BR → shift 3
//
// But at higher sizes, the shift varies. For instance, at root level (the whole grid),
// shift = 0. At BL child of root, shift = 2.
//
// Let me check: is the shift at higher levels = shift of the SPATIAL quadrant type?
// BL spatial → center corner = TR → shift 2 (TR's shift)
// TL spatial → center corner = BR → shift 3
// TR spatial → center corner = BL → shift 0
// BR spatial → center corner = TL → shift 1
//
// So a region placed in quadrant Q gets shift = SHIFT[centerCorner(Q)]
// where SHIFT maps: BL→0, TL→1, TR→2, BR→3
//
// centerCorner: BL→TR, TL→BR, TR→BL, BR→TL
// So:
//   BL region → shift of TR = 2 ✓ (matches order 3 trace!)
//   TL region → shift of BR = 3 ✓
//   TR region → shift of BL = 0 ✓
//   BR region → shift of TL = 1 ✓
//
// And ROOT gets shift 0 (same as TR's center corner shift).
//
// Wait, but what about DEEPER levels? At depth 2:
//   BL of BL: that's a BL region → shift = 2? But in the trace, BL within BL of root
//   has shift 0 at size=2...
//
// Let me re-examine the trace:
// Order 3:
//   ROOT size=8 shift=0
//     BL size=4 shift=2  ← BL gets shift 2 ✓
//       TR size=2 shift=2  ← TR gets shift 2 (expected: shift of BL = 0?)
//       BR size=2 shift=3  ← BR gets shift 3 (expected: shift of TL = 1?)
//       BL size=2 shift=0  ← BL gets shift 0 (expected: shift of TR = 2?)
//       TL size=2 shift=1  ← TL gets shift 1 (expected: shift of BR = 3?)
//
// At size=2, the quadrant names listed are the SPATIAL positions within the parent.
// So within BL(size=4):
//   First child visited: TR (because BL has shift 2: TR→BR→BL→TL)
//   This TR child at size=2 has shift 2.
//   But its spatial position is TR, so expected shift = centerCorner(TR) shift = BL shift = 0
//   That's WRONG.
//
// So the shift at the leaf level is NOT centerCorner-based. Let me reconsider.
// At size=2, the shifts match the spatial quadrant index directly:
//   BL=0, TL=1, TR=2, BR=3
// But at higher sizes, the shifts are:
//   BL=2, TL=3, TR=0, BR=1 (which is centerCorner mapping)
//
// So there are TWO different shift rules depending on whether we're at the leaf or not!
//
// Actually wait, at size=2, the shift determines the VISIT ORDER of the 4 points.
// At size=4+, the shift determines the VISIT ORDER of the 4 sub-quadrants.
// But the sub-quadrant visit orders and point visit orders might follow different rules.
//
// Let me check: at size=2, shift 0 visits BL→TL→TR→BR
// The points are: BL=(0,1), TL=(0,0), TR=(1,0), BR=(1,1)
// So shift 0: (0,1)→(0,0)→(1,0)→(1,1) ← this is the ORDER 1 pattern!
//
// At size=4, shift 2 visits TR→BR→BL→TL (sub-quadrants)
// Within each sub-quadrant, the shift determines the point order.
//
// From order 3 trace, within BL(size=4, shift=2):
//   TR(size=2, shift=2): visits TR→BR→BL = (1,0)→(1,1)→(0,1)
// Wait, 3 visits? That should be 4.
// The visit column shows "TR→BR→BL" with only 3 items. That might be a grouping issue.
//
// Let me just go with the bottom-up approach which we KNOW works.
// For the production implementation, I can either:
// 1. Use the bottom-up approach directly (builds lower orders first)
// 2. Figure out the exact top-down recursion
//
// The bottom-up approach is O(4^N) time and space which is fine since we need to generate
// all 4^N points anyway. Let me implement it properly.

const CCW = ['BL', 'TL', 'TR', 'BR'];

function getQuadrantOffset(q, half) {
  switch(q) {
    case 'BL': return [0, half];
    case 'TL': return [0, 0];
    case 'TR': return [half, 0];
    case 'BR': return [half, half];
  }
}

function generateSpaceFillingTreeCurve(order) {
  if (order < 1) return [];

  // Base case: order 1
  // CCW cycle: BL(0,1) → TL(0,0) → TR(1,0) → BR(1,1)
  let curve = [{x: 0, y: 1}, {x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}];

  // Build up from order 1 to the target order
  for (let o = 2; o <= order; o++) {
    const prevCurve = curve;
    const prevSize = Math.pow(2, o - 1);
    const half = prevSize;

    // Center-facing corner coordinates for each quadrant
    const centerCorners = {
      'BL': {x: half - 1, y: half},
      'TL': {x: half - 1, y: half - 1},
      'TR': {x: half, y: half - 1},
      'BR': {x: half, y: half},
    };

    const newCurve = [];

    for (const q of CCW) {
      const [ox, oy] = getQuadrantOffset(q, half);

      // Place the previous curve in this quadrant
      const placed = prevCurve.map(p => ({x: p.x + ox, y: p.y + oy}));

      // Find the center-facing corner point in the placed curve
      const cc = centerCorners[q];
      let startIdx = -1;
      for (let i = 0; i < placed.length; i++) {
        if (placed[i].x === cc.x && placed[i].y === cc.y) {
          startIdx = i;
          break;
        }
      }

      // Cyclically rotate to start from center-facing corner
      for (let i = 0; i < placed.length; i++) {
        newCurve.push(placed[(startIdx + i) % placed.length]);
      }
    }

    curve = newCurve;
  }

  return curve;
}

// Verify
const order1_expected = [[0,1], [0,0], [1,0], [1,1]];
const order2_expected = [
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
const order3_expected = order3_1based.map(([x,y]) => [x-1, y-1]);

console.log("=== PRODUCTION ALGORITHM TEST ===\n");

const r1 = generateSpaceFillingTreeCurve(1);
console.log("Order 1 match:", JSON.stringify(r1.map(p => [p.x,p.y])) === JSON.stringify(order1_expected));

const r2 = generateSpaceFillingTreeCurve(2);
console.log("Order 2 match:", JSON.stringify(r2.map(p => [p.x,p.y])) === JSON.stringify(order2_expected));

const r3 = generateSpaceFillingTreeCurve(3);
console.log("Order 3 match:", JSON.stringify(r3.map(p => [p.x,p.y])) === JSON.stringify(order3_expected));

// Performance test
console.log("\nPerformance:");
for (let o = 1; o <= 7; o++) {
  const start = Date.now();
  const curve = generateSpaceFillingTreeCurve(o);
  const elapsed = Date.now() - start;
  console.log(`  Order ${o}: ${curve.length} points, ${elapsed}ms`);
}

// Grid integrity check
function verifyGrid(points, order) {
  const gridSize = Math.pow(2, order);
  const expected = gridSize * gridSize;
  if (points.length !== expected) return `Wrong count: ${points.length} != ${expected}`;
  const seen = new Set();
  for (const p of points) {
    const key = `${p.x},${p.y}`;
    if (seen.has(key)) return `Duplicate: (${p.x},${p.y})`;
    if (p.x < 0 || p.x >= gridSize || p.y < 0 || p.y >= gridSize) return `OOB: (${p.x},${p.y})`;
    seen.add(key);
  }
  return seen.size === expected ? "OK" : `Missing: ${seen.size}/${expected}`;
}

console.log("\nGrid verification:");
for (let o = 1; o <= 7; o++) {
  const curve = generateSpaceFillingTreeCurve(o);
  console.log(`  Order ${o}: ${verifyGrid(curve, o)}`);
}

// Generate SVG for order 5 to verify visually
const r5 = generateSpaceFillingTreeCurve(5);
const gridSize5 = 32;
const svgScale = 15;
const svgPadding = 20;
const svgWidth = gridSize5 * svgScale + 2 * svgPadding;
const svgHeight = gridSize5 * svgScale + 2 * svgPadding;

let pathD = r5.map((p, i) => {
  const sx = p.x * svgScale + svgPadding;
  const sy = p.y * svgScale + svgPadding;
  return (i === 0 ? 'M' : 'L') + ` ${sx} ${sy}`;
}).join(' ');

// Close the loop
const first = r5[0];
pathD += ` L ${first.x * svgScale + svgPadding} ${first.y * svgScale + svgPadding}`;

let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}">
  <rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" fill="white"/>
  <text x="${svgWidth/2}" y="14" text-anchor="middle" font-size="12" font-family="sans-serif" fill="black">
    Order 5 Walking Pattern (32x32 = 1024 points)
  </text>
  <path d="${pathD}" fill="none" stroke="black" stroke-width="0.5"/>
`;

// Add grid points
for (let x = 0; x < gridSize5; x++) {
  for (let y = 0; y < gridSize5; y++) {
    const sx = x * svgScale + svgPadding;
    const sy = y * svgScale + svgPadding;
    svg += `  <circle cx="${sx}" cy="${sy}" r="1.5" fill="#ccc"/>\n`;
  }
}

svg += '</svg>';

const fs = require('fs');
fs.writeFileSync('experiments/walk-order5-test.svg', svg);
console.log("\nGenerated experiments/walk-order5-test.svg");
