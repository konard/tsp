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
 * 1. Generate a space-filling tree walk curve that fills the grid space
 *    (counter-clockwise traversal: BL → TL → TR → BR at each level,
 *    with rotations applied to child quadrants for smooth transitions)
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
 * Given entry and exit corners, return the 4-point visiting order.
 * The loop visits all 4 corners starting from entry and ending at exit.
 *
 * @param {string} entry - Entry corner ('TL', 'TR', 'BL', 'BR')
 * @param {string} exit - Exit corner ('TL', 'TR', 'BL', 'BR')
 * @returns {string[]} Array of corner names in visiting order
 */
const getLoopFromEntryExit = (entry, exit) => {
  const cwOrder = ['TL', 'TR', 'BR', 'BL'];
  const ccwOrder = ['TL', 'BL', 'BR', 'TR'];

  const entryIdxCW = cwOrder.indexOf(entry);
  const entryIdxCCW = ccwOrder.indexOf(entry);

  // In CW/CCW, after 3 steps from entry, we should be at exit
  const cwExitCheck = cwOrder[(entryIdxCW + 3) % 4];
  const ccwExitCheck = ccwOrder[(entryIdxCCW + 3) % 4];

  let result;
  if (cwExitCheck === exit) {
    result = [];
    for (let i = 0; i < 4; i++) {
      result.push(cwOrder[(entryIdxCW + i) % 4]);
    }
  } else if (ccwExitCheck === exit) {
    result = [];
    for (let i = 0; i < 4; i++) {
      result.push(ccwOrder[(entryIdxCCW + i) % 4]);
    }
  } else {
    throw new Error(`Cannot find valid path from ${entry} to ${exit}`);
  }

  return result;
};

/**
 * Get child quadrant entry/exit configurations based on parent's loop.
 *
 * Rules:
 * 1. Entry corner is always the corner closest to the center of the parent region
 *    (BL → TR, TL → BR, TR → BL, BR → TL)
 * 2. Exit corner is the corner in the direction of the next quadrant
 *
 * @param {string[]} parentLoop - Array of quadrant names in visiting order
 * @returns {Object} Map of quadrant name to {entry, exit} configuration
 */
const getChildConfigs = (parentLoop) => {
  // Corner closest to center for each quadrant
  const centerCorner = {
    BL: 'TR',
    TL: 'BR',
    TR: 'BL',
    BR: 'TL',
  };

  // Exit corner pointing toward each quadrant
  const exitCornerToward = {
    TL: 'TL',
    TR: 'TR',
    BL: 'BL',
    BR: 'BR',
  };

  const configs = {};

  for (let i = 0; i < 4; i++) {
    const quadrant = parentLoop[i];
    const nextQuadrant = parentLoop[(i + 1) % 4];

    // Entry is the corner closest to parent center (fixed per quadrant)
    const entry = centerCorner[quadrant];

    // Exit is toward the next quadrant
    const exit = exitCornerToward[nextQuadrant];

    configs[quadrant] = { entry, exit };
  }

  return configs;
};

/**
 * Generate space-filling tree curve points using recursive quadrant traversal.
 *
 * The walk follows a counter-clockwise pattern at each level (BL → TL → TR → BR),
 * with each child quadrant having entry/exit points that ensure smooth transitions
 * between quadrants.
 *
 * This matches the reference space-filling tree walking pattern where:
 * - Order 1: visits 4 corners in a square loop (BL → TL → TR → BR)
 * - Order 2: each quadrant is visited with appropriate rotation for smooth path
 *
 * @param {number} order - Order of the tree (depth of recursion)
 * @returns {Array<{x: number, y: number}>} Array of curve points on a 2^order grid
 */
export const generateSpaceFillingTreeCurve = (order) => {
  if (order < 1) {
    return [];
  }

  const gridSize = Math.pow(2, order);

  /**
   * Get corner coordinate within a quadrant
   */
  const getCornerCoord = (quadrantX, quadrantY, halfSize, corner) => {
    switch (corner) {
      case 'TL':
        return { x: quadrantX, y: quadrantY };
      case 'TR':
        return { x: quadrantX + halfSize - 1, y: quadrantY };
      case 'BL':
        return { x: quadrantX, y: quadrantY + halfSize - 1 };
      case 'BR':
        return { x: quadrantX + halfSize - 1, y: quadrantY + halfSize - 1 };
    }
  };

  /**
   * Recursive function to generate curve points
   *
   * @param {number} x0 - X coordinate of region top-left corner
   * @param {number} y0 - Y coordinate of region top-left corner
   * @param {number} size - Size of the region
   * @param {string} entry - Entry corner for this region
   * @param {string} exit - Exit corner for this region
   * @returns {Array<{x: number, y: number}>} Curve points for this region
   */
  const recurse = (x0, y0, size, entry, exit) => {
    if (size === 2) {
      // Base case: 4 unit cells, return corners in order
      const loop = getLoopFromEntryExit(entry, exit);
      return loop.map((corner) => getCornerCoord(x0, y0, 2, corner));
    }

    const half = size / 2;

    // Quadrant positions
    const quadrants = {
      BL: { x: x0, y: y0 + half },
      TL: { x: x0, y: y0 },
      TR: { x: x0 + half, y: y0 },
      BR: { x: x0 + half, y: y0 + half },
    };

    // Get the loop order for this level
    const loop = getLoopFromEntryExit(entry, exit);

    // Get child configs based on the loop
    const childConfigs = getChildConfigs(loop);

    const result = [];
    for (const qName of loop) {
      const q = quadrants[qName];
      const config = childConfigs[qName];
      result.push(...recurse(q.x, q.y, half, config.entry, config.exit));
    }

    return result;
  };

  // Start with entry at BL, exit at BR (counter-clockwise from BL)
  return recurse(0, 0, gridSize, 'BL', 'BR');
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
