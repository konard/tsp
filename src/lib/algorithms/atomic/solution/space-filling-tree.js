/**
 * Atomic Space-Filling Tree Solution for TSP
 *
 * Uses a space-filling tree (recursive quadrant subdivision) to order points.
 * The tree is built by recursively subdividing space into 4 quadrants,
 * connecting each center to its quadrant centers (forming X-patterns).
 * The walk through the tree produces a space-filling curve that visits
 * all points in a specific order based on quadrant traversal.
 *
 * Algorithm:
 * 1. Generate a space-filling tree walk curve that fills the grid space.
 *    The curve is built iteratively: at each order, the previous order's
 *    curve is placed into each of 4 quadrants (BL, TL, TR, BR), cyclically
 *    shifted so it starts at the center-facing corner of that quadrant.
 * 2. Generate tree edges for visualization (X-pattern at each level)
 * 3. Map each point to its nearest position on the curve
 * 4. Sort points by their position along the curve
 * 5. Return the sorted order as the tour
 *
 * Reference: Kuffner & LaValle, "Space-Filling Trees" (2009)
 * https://en.wikipedia.org/wiki/Space-filling_tree
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */

import { distance } from '../../utils.js';

/** Counter-clockwise quadrant visit order */
const CCW_ORDER = ['BL', 'TL', 'TR', 'BR'];

/**
 * Get the offset (dx, dy) for placing a sub-quadrant within a region.
 *
 * @param {string} quadrant - Quadrant name ('BL', 'TL', 'TR', 'BR')
 * @param {number} half - Half the size of the parent region
 * @returns {{dx: number, dy: number}} Offset for the sub-quadrant
 */
const getQuadrantOffset = (quadrant, half) => {
  switch (quadrant) {
    case 'BL':
      return { dx: 0, dy: half };
    case 'TL':
      return { dx: 0, dy: 0 };
    case 'TR':
      return { dx: half, dy: 0 };
    case 'BR':
      return { dx: half, dy: half };
  }
};

/**
 * Generate space-filling tree curve points.
 *
 * The curve is built iteratively from order 1 upward. At each order, the
 * previous curve is placed into 4 quadrants, each copy cyclically shifted
 * so it starts at the center-facing corner of that quadrant:
 *   - BL quadrant: starts at its TR corner (closest to center)
 *   - TL quadrant: starts at its BR corner
 *   - TR quadrant: starts at its BL corner
 *   - BR quadrant: starts at its TL corner
 *
 * Order 1 (base): BL(0,1) → TL(0,0) → TR(1,0) → BR(1,1)
 * Order 2: 16 points forming a pinwheel/spiral pattern
 * Higher orders: self-similar recursive structure
 *
 * @param {number} order - Order of the tree (depth of recursion)
 * @returns {Array<{x: number, y: number}>} Array of curve points on a 2^order grid
 */
export const generateSpaceFillingTreeCurve = (order) => {
  if (order < 1) {
    return [];
  }

  // Base case: order 1 — counter-clockwise square
  let curve = [
    { x: 0, y: 1 },
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
  ];

  // Build up iteratively from order 1 to the target order
  for (let o = 2; o <= order; o++) {
    const prevCurve = curve;
    const half = Math.pow(2, o - 1);

    // Center-facing corner coordinates for each quadrant (in absolute coords)
    const centerCorners = {
      BL: { x: half - 1, y: half },
      TL: { x: half - 1, y: half - 1 },
      TR: { x: half, y: half - 1 },
      BR: { x: half, y: half },
    };

    const newCurve = [];

    for (const q of CCW_ORDER) {
      const { dx, dy } = getQuadrantOffset(q, half);

      // Place the previous curve in this quadrant
      const placed = prevCurve.map((p) => ({ x: p.x + dx, y: p.y + dy }));

      // Find the index of the center-facing corner in the placed curve
      const cc = centerCorners[q];
      let startIdx = 0;
      for (let i = 0; i < placed.length; i++) {
        if (placed[i].x === cc.x && placed[i].y === cc.y) {
          startIdx = i;
          break;
        }
      }

      // Cyclically rotate the curve to start from the center-facing corner
      const len = placed.length;
      for (let i = 0; i < len; i++) {
        newCurve.push(placed[(startIdx + i) % len]);
      }
    }

    curve = newCurve;
  }

  return curve;
};

/**
 * Generate tree edges (X-pattern) for visualization.
 * At each level, the center of a region connects to the centers of its
 * 4 sub-quadrants, forming an X shape.
 *
 * @param {number} order - Order of the tree
 * @param {number} treeGridSize - Size of the grid (2^order)
 * @returns {Array<{from: {x: number, y: number}, to: {x: number, y: number}, depth: number}>}
 */
export const generateTreeEdges = (order, treeGridSize) => {
  const edges = [];

  const recurse = (cx, cy, halfW, halfH, depth) => {
    if (depth >= order) {
      return;
    }

    const qHalfW = halfW / 2;
    const qHalfH = halfH / 2;

    // 4 quadrant centers
    const quadrants = [
      { x: cx - qHalfW, y: cy - qHalfH }, // TL
      { x: cx + qHalfW, y: cy - qHalfH }, // TR
      { x: cx - qHalfW, y: cy + qHalfH }, // BL
      { x: cx + qHalfW, y: cy + qHalfH }, // BR
    ];

    for (const q of quadrants) {
      edges.push({ from: { x: cx, y: cy }, to: q, depth });
      recurse(q.x, q.y, qHalfW, qHalfH, depth + 1);
    }
  };

  const halfGrid = (treeGridSize - 1) / 2;
  recurse(halfGrid, halfGrid, halfGrid, halfGrid, 0);

  return edges;
};

/**
 * Normalize curve points to align with the Moore grid coordinate system.
 * Maps from [0, gridSize-1] internal coords to [0, mooreGridSize-1].
 *
 * @param {Array<{x: number, y: number}>} curvePoints - Raw curve points
 * @param {number} curveGridSize - Internal grid size (2^order)
 * @param {number} mooreGridSize - Target Moore grid size
 * @returns {Array<{x: number, y: number}>} Normalized curve points
 */
const normalizeCurvePoints = (curvePoints, curveGridSize, mooreGridSize) => {
  if (curveGridSize <= 1) {
    return curvePoints;
  }
  const scale = (mooreGridSize - 1) / (curveGridSize - 1);
  return curvePoints.map((p) => ({
    x: Math.round(p.x * scale),
    y: Math.round(p.y * scale),
  }));
};

/**
 * Compute Space-Filling Tree solution in one step (atomic version).
 * Returns the final tour without intermediate steps.
 *
 * @param {Array<{x: number, y: number, id: number}>} points - Array of points
 * @param {number} treeGridSize - Size of the grid (power of 2)
 * @returns {{tour: number[], curvePoints: Array<{x: number, y: number}>, treeEdges: Array}} Final tour, curve, and tree edges
 */
export const spaceFillingTreeSolution = (points, treeGridSize) => {
  if (points.length === 0) {
    return { tour: [], curvePoints: [], treeEdges: [] };
  }

  // Determine order: treeGridSize = 2^order
  const order = Math.max(1, Math.round(Math.log2(treeGridSize)));
  const internalGridSize = Math.pow(2, order);
  const curvePoints = generateSpaceFillingTreeCurve(order);
  const normalizedCurve = normalizeCurvePoints(
    curvePoints,
    internalGridSize,
    treeGridSize
  );
  const treeEdges = generateTreeEdges(order, treeGridSize);

  // Map each point to its nearest position on the curve
  const pointsWithCurvePos = points.map((p, idx) => {
    let minDist = Infinity;
    let curvePos = 0;

    for (let i = 0; i < normalizedCurve.length; i++) {
      const d = distance(p, normalizedCurve[i]);
      if (d < minDist) {
        minDist = d;
        curvePos = i;
      }
    }

    return { idx, curvePos };
  });

  pointsWithCurvePos.sort((a, b) => a.curvePos - b.curvePos);

  return {
    tour: pointsWithCurvePos.map((p) => p.idx),
    curvePoints: normalizedCurve,
    treeEdges,
  };
};

export default spaceFillingTreeSolution;
