/**
 * Atomic Space-Filling Tree Solution for TSP
 *
 * Uses a space-filling tree (recursive quadrant subdivision) to order points.
 * The tree is built by recursively subdividing space into 4 quadrants,
 * connecting each center to its quadrant centers (forming X-patterns).
 * The walk through the tree produces a Z-order (Morton) curve that
 * visits points in an N-zigzag pattern (BL → TL → BR → TR) at each level.
 *
 * Algorithm:
 * 1. Generate a space-filling tree curve that fills the grid space
 *    (Z-order: BL → TL → BR → TR recursively at each level)
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

/**
 * Generate space-filling tree curve points using Z-order (Morton) traversal.
 * Recursively subdivides the grid and visits quadrants in an N-zigzag pattern:
 * BL → TL → BR → TR (bottom-left up, then diagonal down-right, then up again).
 *
 * This matches the reference space-filling tree walking pattern where:
 * - Order 1: visits 4 corners in N-zigzag (BL → TL → BR → TR)
 * - Order 2: each quadrant visited in N-zigzag, quadrants also in N-zigzag order
 *
 * @param {number} order - Order of the tree (depth of recursion)
 * @returns {Array<{x: number, y: number}>} Array of curve points on a 2^order grid
 */
export const generateSpaceFillingTreeCurve = (order) => {
  const gridSize = Math.pow(2, order);

  const recurse = (x0, y0, size) => {
    if (size === 1) {
      return [{ x: x0, y: y0 }];
    }

    const half = size / 2;

    // Quadrant positions (Y increases downward in grid coordinates)
    const TL = { x: x0, y: y0 };
    const TR = { x: x0 + half, y: y0 };
    const BL = { x: x0, y: y0 + half };
    const BR = { x: x0 + half, y: y0 + half };

    // N-zigzag order: BL → TL → BR → TR
    // This creates the characteristic pattern: up, diagonal down-right, up
    return [
      ...recurse(BL.x, BL.y, half), // Bottom-left quadrant
      ...recurse(TL.x, TL.y, half), // Top-left quadrant
      ...recurse(BR.x, BR.y, half), // Bottom-right quadrant
      ...recurse(TR.x, TR.y, half), // Top-right quadrant
    ];
  };

  return recurse(0, 0, gridSize);
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
