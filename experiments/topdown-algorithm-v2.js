// The issue with the top-down approach: the child's shift depends on BOTH
// the spatial quadrant AND the parent's shift.
//
// From the bottom-up analysis:
// The cyclic offsets for order 1 → 2: BL=2, TL=3, TR=0, BR=1
// The cyclic offsets for order 2 → 3: BL=10, TL=14, TR=2, BR=6
// The cyclic offsets for order 3 → 4: BL=32, TL=48, TR=0, BR=16
//
// For order 1→2: base size = 4, offsets: BL=2/4, TL=3/4, TR=0/4, BR=1/4
// For order 2→3: base size = 16, offsets: BL=10/16, TL=14/16, TR=2/16, BR=6/16
// For order 3→4: base size = 64, offsets: BL=32/64, TL=48/64, TR=0/64, BR=16/64
//
// Fractions:
// Order 1→2: BL=0.5, TL=0.75, TR=0.0, BR=0.25
// Order 2→3: BL=0.625, TL=0.875, TR=0.125, BR=0.375
// Order 3→4: BL=0.5, TL=0.75, TR=0.0, BR=0.25
//
// Interesting! Order 1→2 and 3→4 have the same fractions: 0.5, 0.75, 0.0, 0.25
// Order 2→3 has different fractions: 0.625, 0.875, 0.125, 0.375
//
// So it alternates! Even orders and odd orders have different offsets.
// This makes sense because the center-facing corner position changes relative to the grid.
//
// Actually, let me think about this differently. The center-facing corner of each quadrant:
// BL → TR: position (half-1, 0) relative to BL quadrant
// TL → BR: position (half-1, half-1) relative to TL quadrant
// TR → BL: position (0, half-1) relative to TR quadrant
// BR → TL: position (0, 0) relative to BR quadrant
//
// In the PREVIOUS ORDER's curve, where does this corner appear?
// For order N, the curve has 4^N points on a 2^N grid.
// Center-facing corners in the 2^N grid:
// BL's center is at (2^(N-1)-1, 0) in the 2^N space... wait, this is getting complex.
//
// Let me just implement the bottom-up approach directly. It works and is correct.
// For the actual code, we can use the bottom-up approach.

// But wait, the bottom-up approach requires building ALL previous orders first,
// which uses O(4^N) memory. For large orders this is problematic.
//
// Let me try a different top-down approach where I track the actual shift through the recursion.
//
// The key: at each recursion level, a region gets a "shift" parameter.
// The shift tells us the cyclic rotation of the visit order.
// At the base case (size=2), we visit 4 points in the shifted CCW order.
// At higher levels, we visit 4 sub-quadrants in the shifted CCW order,
// and each sub-quadrant gets its own shift.

// The question is: what shift does each child quadrant get?
// From the bottom-up approach, we know:
// - The parent visits children in order: CCW_ORDER[(shift+0)%4], CCW_ORDER[(shift+1)%4], ...
// - Each child gets placed at its spatial position
// - The child's shift is determined by its spatial position's center-facing corner

// But the center-facing corner's position in the cycle depends on what THAT point's position
// is within the curve. And the curve within the child is self-similar.

// Let me try another approach: find the CHILD'S shift by looking at where
// the center-facing corner of the child appears in the parent's visit order.

// Actually, let me just trace through the working bottom-up algorithm and see
// what effective shifts are used.

const CCW = ['BL', 'TL', 'TR', 'BR'];

function getQuadrantOffset(q, half) {
  switch(q) {
    case 'BL': return [0, half];
    case 'TL': return [0, 0];
    case 'TR': return [half, 0];
    case 'BR': return [half, half];
  }
}

// Center-facing corner name
function centerCorner(q) {
  switch(q) { case 'BL': return 'TR'; case 'TL': return 'BR'; case 'TR': return 'BL'; case 'BR': return 'TL'; }
}

// Build curve bottom-up
function buildCurve(order) {
  if (order === 1) {
    return [[0,1], [0,0], [1,0], [1,1]];
  }

  const prevCurve = buildCurve(order - 1);
  const prevSize = Math.pow(2, order - 1);
  const size = prevSize * 2;
  const half = prevSize;

  function placeCurve(curve, offsetX, offsetY) {
    return curve.map(([x,y]) => [x + offsetX, y + offsetY]);
  }

  const quadrantOffsets = { 'BL': [0, half], 'TL': [0, 0], 'TR': [half, 0], 'BR': [half, half] };
  const centerCorners = {
    'BL': [half - 1, half],
    'TL': [half - 1, half - 1],
    'TR': [half, half - 1],
    'BR': [half, half],
  };

  const quadrantCurves = {};
  const childShifts = {};

  for (const q of CCW) {
    const [ox, oy] = quadrantOffsets[q];
    const placed = placeCurve(prevCurve, ox, oy);
    const [cx, cy] = centerCorners[q];

    let startIdx = -1;
    for (let i = 0; i < placed.length; i++) {
      if (placed[i][0] === cx && placed[i][1] === cy) {
        startIdx = i;
        break;
      }
    }

    // The shift for this child is startIdx
    childShifts[q] = startIdx;

    const rotated = [];
    for (let i = 0; i < placed.length; i++) {
      rotated.push(placed[(startIdx + i) % placed.length]);
    }
    quadrantCurves[q] = rotated;
  }

  return [...quadrantCurves['BL'], ...quadrantCurves['TL'], ...quadrantCurves['TR'], ...quadrantCurves['BR']];
}

// Now let me trace the shifts at each level
console.log("=== Shift analysis ===");

function analyzeShifts(order) {
  if (order === 1) {
    // Order 1 curve: BL(0,1) TL(0,0) TR(1,0) BR(1,1)
    // The center-facing corner positions:
    return { curve: [[0,1],[0,0],[1,0],[1,1]], shifts: null };
  }

  const prev = analyzeShifts(order - 1);
  const prevCurve = prev.curve;
  const prevSize = Math.pow(2, order - 1);
  const half = prevSize;

  const centerCorners = {
    'BL': [half - 1, half],
    'TL': [half - 1, half - 1],
    'TR': [half, half - 1],
    'BR': [half, half],
  };

  const quadrantOffsets = { 'BL': [0, half], 'TL': [0, 0], 'TR': [half, 0], 'BR': [half, half] };

  console.log(`\nOrder ${order} (building from order ${order-1}, prevSize=${prevSize}):`);

  for (const q of CCW) {
    const [ox, oy] = quadrantOffsets[q];
    const placed = prevCurve.map(([x,y]) => [x + ox, y + oy]);
    const [cx, cy] = centerCorners[q];

    let startIdx = -1;
    for (let i = 0; i < placed.length; i++) {
      if (placed[i][0] === cx && placed[i][1] === cy) {
        startIdx = i;
        break;
      }
    }

    const N = prevCurve.length;
    // Express shift as fraction of total points
    console.log(`  ${q}: shift=${startIdx}/${N} = ${(startIdx/N).toFixed(4)}`);
    // Also: what is the center-facing corner's LOCAL position in the prev grid?
    // (cx - ox, cy - oy)
    const localCx = cx - ox;
    const localCy = cy - oy;
    // Find this local position in the prev curve
    let localIdx = -1;
    for (let i = 0; i < prevCurve.length; i++) {
      if (prevCurve[i][0] === localCx && prevCurve[i][1] === localCy) {
        localIdx = i;
        break;
      }
    }
    console.log(`    center corner local (${localCx},${localCy}) at prevCurve[${localIdx}]`);
  }

  return { curve: buildCurve(order), shifts: null };
}

analyzeShifts(2);
analyzeShifts(3);
analyzeShifts(4);
analyzeShifts(5);

// AHA! The shift for each child is simply the INDEX of the center-facing corner
// in the PREVIOUS ORDER's curve. So the shift depends on the parent's curve shape.
// This means we can't determine the shift from just the quadrant type alone.

// However, there IS a pattern. The center-facing corner for each quadrant in a grid of size S:
// BL: (S/2 - 1, 0) in the S/2 sub-grid (it's the TR corner of the sub-grid)
// TL: (S/2 - 1, S/2 - 1) (BR corner)
// TR: (0, S/2 - 1) (BL corner)
// BR: (0, 0) (TL corner)
//
// In the ORDER N-1 curve (which has size 2^(N-1)), these corners are:
// TR: (2^(N-1)-1, 0) → position of TR corner in order N-1
// BR: (2^(N-1)-1, 2^(N-1)-1) → position of BR corner
// BL: (0, 2^(N-1)-1) → position of BL corner
// TL: (0, 0) → position of TL corner

// So the shift for child BL = position of TR corner in the previous curve
// The shift for child TL = position of BR corner
// The shift for child TR = position of BL corner
// The shift for child BR = position of TL corner

// From the output above:
// Order 1 corner positions: BL at 0, TL at 1, TR at 2, BR at 3
// Order 2 corner positions: BL at 2, TL at 6, TR at 10, BR at 14

// For building order 2 from order 1:
// BL child shift = TR corner of order 1 = 2 ✓
// TL child shift = BR corner of order 1 = 3 ✓
// TR child shift = BL corner of order 1 = 0 ✓
// BR child shift = TL corner of order 1 = 1 ✓

// For building order 3 from order 2:
// BL child shift = TR corner of order 2 = 10 ✓
// TL child shift = BR corner of order 2 = 14 ✓
// TR child shift = BL corner of order 2 = 2 ✓
// BR child shift = TL corner of order 2 = 6 ✓

// So the shifts are the CORNER positions in the previous curve.
// And corner positions follow a specific recursion.

// Let me find corner positions recursively.
// Order 1: BL=0, TL=1, TR=2, BR=3
// Order 2: BL=2, TL=6, TR=10, BR=14
// Order 3: BL=8, TL=24, TR=40, BR=56

// Pattern:
// BL_N = ? Let me check:
// Order 1: BL=0. The BL corner (0, gridSize-1) position in the curve.
// Order 2: BL(0,3) position = 2. Order 2 BL quadrant starts at position 0.
//   Within BL, the BL corner is at (0,3). In the BL quadrant [0-1, 2-3],
//   this is local (0,1) = BL corner. In the BL child's rotated curve,
//   where is local BL? At offset 2 from the starting point of the BL child.
//   BL child starts at shift=2 (from order 1). So BL corner in order 2 =
//   position of local BL corner in the rotated child.

// This is getting complex. Let me take a different approach.
// Instead of tracking corner positions explicitly, I'll pre-compute the shifts
// for each quadrant at each depth level.

// The shifts depend on the FULL PATH from root to the current node.
// But since the shift only depends on the spatial position of the quadrant,
// and the shift of the parent, there must be a simpler relation.

// Let me define: childShift(parentShift, childQuadrant)
// From the data:
// Root has shift 0 (visits BL first).
// BL child (quadrant 0 in visit order) gets shift 2
// TL child (quadrant 1) gets shift 3
// TR child (quadrant 2) gets shift 0
// BR child (quadrant 3) gets shift 1

// But this is for ROOT. What about for BL parent (shift 2)?
// BL parent visits: TR(shift+0=2→TR), BR(3), BL(0), TL(1)
// First child is TR: what shift does TR child get?
// From order 2→3 data: BL of order 3 is composed of order 2 rotated by 10.
// The BL quadrant at level 1 (shift=2) has 4 children at level 2.
// The first child visited is TR (because BL's order is TR→BR→BL→TL).
// TR's shift at this level should cause the right traversal.

// Let me trace:
// Order 3, BL quadrant (shift=2 from root):
//   visits TR→BR→BL→TL
//   TR child: what shift?
//   BR child: what shift?
//   BL child: what shift?
//   TL child: what shift?

// From the bottom-up data, the BL quadrant of order 3 starts with
// the order 2 curve cyclically shifted by 10.
// When we break this into 4 sub-quadrants of order 3:
// First sub-quadrant (4 points at 2x2 level):
//   These correspond to the order 1 curve within the first child quadrant.

// Actually, let me just verify: does the top-down work if we compute
// childShift as a function of parentShift?

// From root (shift 0):
//   BL → shift 2 (TR corner of prev)
//   TL → shift 3 (BR corner of prev)
//   TR → shift 0 (BL corner of prev)
//   BR → shift 1 (TL corner of prev)

// These are always the CORNER positions in order 1: BL=0, TL=1, TR=2, BR=3
// Applied to the child's spatial type (using center-facing corner):
// BL child → center corner = TR → order1[TR] = order1[2] = 2
// TL child → center corner = BR → order1[BR] = order1[3] = 3
// TR child → center corner = BL → order1[BL] = order1[0] = 0
// BR child → center corner = TL → order1[TL] = order1[1] = 1

// But at order 2→3 the shifts are 10, 14, 2, 6 which are NOT order1 positions.
// They are order 2 CORNER positions: TR=10, BR=14, BL=2, TL=6

// So the shift is always the center-facing corner's position in the CURRENT curve.
// For a node at depth d, the shift comes from the position of the center-facing corner
// in the ORDER (depth-d) curve... no, that's circular.

// OK let me try yet another approach. Let me define a recursive function
// that computes the POSITION of a given corner in the order N curve.

function cornerPosition(order, corner) {
  // Returns the index of `corner` point in the order-N curve
  // Corner is one of: TL(0,0), TR(size-1,0), BL(0,size-1), BR(size-1,size-1)
  if (order === 1) {
    // Order 1: BL(0,1)=0, TL(0,0)=1, TR(1,0)=2, BR(1,1)=3
    switch(corner) {
      case 'BL': return 0;
      case 'TL': return 1;
      case 'TR': return 2;
      case 'BR': return 3;
    }
  }

  // For order N, the curve visits BL→TL→TR→BR quadrants.
  // Each quadrant has 4^(N-1) points.
  const quadSize = Math.pow(4, order - 1);

  // The corner (say TL=(0,0)) is in the TL quadrant.
  // Specifically, it's the TL corner of the TL quadrant.
  // The TL quadrant is the 2nd quadrant visited (index 1), so its block starts at position quadSize*1.
  // Within the TL quadrant, the TL corner is at position...
  // Wait, the TL quadrant's curve is cyclically shifted. The TL corner of TL quadrant
  // is at some position relative to the start of the TL quadrant's section.

  // Let me define: in a curve with shift S, the corner positions relative to start are:
  // The curve visits CCW from position shift.
  // Actually, the entire curve is cyclically shifted so that position 0 of the shifted curve
  // is position S of the unshifted curve.

  // This is getting too complex analytically. Let me just compute the shifts by
  // simulation, and see if there's a pattern in (parentShift, childQuadrant) → childShift.

  return -1;
}

// Let me trace the shifts at every recursion level for order 3
function traceShifts(order) {
  const curve = buildCurve(order);
  const gridSize = Math.pow(2, order);

  function findPoint(x, y) {
    for (let i = 0; i < curve.length; i++) {
      if (curve[i][0] === x && curve[i][1] === y) return i;
    }
    return -1;
  }

  // For each quadrant at each depth, find the shift by locating
  // the start point of that quadrant's section in the full curve
  function trace(x0, y0, size, depth, startInCurve, quadrant) {
    if (size === 1) return;

    const half = size / 2;
    const numInRegion = half * half;

    // This region corresponds to curve[startInCurve .. startInCurve + size*size - 1]
    const regionPoints = curve.slice(startInCurve, startInCurve + size * size);

    // The 4 sub-quadrants and their sizes
    const quadOffs = { 'BL': [0, half], 'TL': [0, 0], 'TR': [half, 0], 'BR': [half, half] };

    // Figure out the visit order from the actual data
    const visitOrder = [];
    let pos = 0;
    while (pos < regionPoints.length && visitOrder.length < 4) {
      const p = regionPoints[pos];
      const px = p[0] - x0;
      const py = p[1] - y0;
      let q;
      if (px < half && py >= half) q = 'BL';
      else if (px < half && py < half) q = 'TL';
      else if (px >= half && py < half) q = 'TR';
      else q = 'BR';

      if (!visitOrder.includes(q)) {
        visitOrder.push(q);
      }
      pos++;
    }

    // Determine the shift of this region
    // The first point should correspond to the center-facing corner of the first visited child
    const shift = CCW.indexOf(visitOrder[0]);
    const indent = '  '.repeat(depth);
    console.log(`${indent}Region [${x0},${y0}] size=${size} quad=${quadrant} visit=${visitOrder.join('→')} shift=${shift}`);

    // Recurse into children
    let childStart = startInCurve;
    for (const childQ of visitOrder) {
      const [dx, dy] = quadOffs[childQ];
      trace(x0 + dx, y0 + dy, half, depth + 1, childStart, childQ);
      childStart += numInRegion;
    }
  }

  trace(0, 0, gridSize, 0, 0, 'ROOT');
}

console.log("\n\n=== SHIFT TRACE FOR ORDER 3 ===");
traceShifts(3);

console.log("\n=== SHIFT TRACE FOR ORDER 4 ===");
traceShifts(4);
