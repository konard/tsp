/**
 * Atomic U-fork Fractal Solution for TSP
 *
 * Computes the final tour directly without intermediate visualization steps.
 *
 * The U-fork fractal is a boustrophedon meander space-filling curve that
 * forms a U-shaped (tuning fork) pattern. At each level, the curve traces
 * a zigzag spiral from the center outward, traverses three sides of the
 * outer perimeter, then zigzag spirals back inward.
 *
 * For grids larger than 8x8, the algorithm recursively embeds the previous
 * level's curve in the center region, with a boustrophedon spiral frame
 * connecting the center to the outer boundary.
 *
 * Algorithm:
 * 1. Generate a U-fork curve that fills the grid space
 * 2. Map each point to its nearest position on the curve
 * 3. Sort points by their position along the curve
 * 4. Return the sorted order as the tour
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */

import { distance } from '../../utils.js';

/**
 * Generate U-fork curve path as an order identifier.
 *
 * @param {number} order - Order of the U-fork curve (gridSize = 2^order)
 * @returns {string} Order identifier string used by uForkCurveToPoints
 */
export const generateUForkCurve = (order) => {
  return `UFORK_ORDER_${order}`;
};

/**
 * Generate the zigzag spiral path for a grid of size n.
 * This is the base pattern used for order 3 (8x8) and as the frame
 * for higher orders.
 *
 * @param {number} n - Grid size (must be power of 2, >= 4)
 * @returns {Array<{x: number, y: number}>} Path visiting all n*n cells
 */
function generateZigzagPath(n) {
  const path = [];
  let cx, cy;

  function put(x, y) {
    path.push({ x, y });
    cx = x;
    cy = y;
  }

  function moveBy(dx, dy, steps) {
    for (let i = 0; i < steps; i++) {
      cx += dx;
      cy += dy;
      put(cx, cy);
    }
  }

  const half = n / 2;

  // Start at center-left of top row
  put(half - 1, n - 1);

  // Phase 1: Left across top-left half
  moveBy(-1, 0, half - 1);

  // Phase 2: Down left column
  moveBy(0, -1, n - 1);

  // Phase 3: Right across bottom
  moveBy(1, 0, n - 1);

  // Phase 4: Up right column to middle
  moveBy(0, 1, half - 1);

  // Phase 5: Inward zigzag (rows half-1 down to 1)
  let goingLeft = true;
  for (let scan = 0; scan < half - 1; scan++) {
    const isLast = scan === half - 2;
    if (goingLeft) {
      moveBy(-1, 0, cx - (isLast ? 1 : 2));
    } else {
      moveBy(1, 0, (isLast ? n - 1 : n - 2) - cx);
    }
    if (!isLast) {
      moveBy(0, -1, 1);
    }
    goingLeft = !goingLeft;
  }

  // Phase 6: Up column 1 to row n-2
  moveBy(0, 1, n - 2 - cy);

  // Phase 7: Outward zigzag (rows n-2 down to half)
  let goingRight = true;
  for (let scan = 0; scan < half - 1; scan++) {
    const isLast = scan === half - 2;
    if (goingRight) {
      moveBy(1, 0, (isLast ? n - 1 : n - 2) - cx);
    } else {
      moveBy(-1, 0, cx - (isLast ? 1 : 2));
    }
    if (!isLast) {
      moveBy(0, -1, 1);
    }
    goingRight = !goingRight;
  }

  // Phase 8: Up right column to top
  moveBy(0, 1, n - 1 - cy);

  // Phase 9: Left across top-right half
  moveBy(-1, 0, half - 1);

  return path;
}

/**
 * Compute the circular shift for embedding the previous level's
 * curve in the center of the current level.
 *
 * @param {number} order - Current order (>= 4)
 * @returns {number} Shift amount for the inner curve
 */
function computeShift(order) {
  let s = 3;
  for (let k = 2; k < order; k++) {
    s = Math.pow(4, k) - s;
  }
  return s;
}

/**
 * Generate the frame path (boustrophedon spiral) for the outer region
 * of an n x n grid, connecting the center boundary entry to exit.
 *
 * @param {number} n - Grid size
 * @returns {Array<{x: number, y: number}>} Frame path
 */
function generateFramePath(n) {
  const half = n / 2;
  const quarter = n / 4;

  const path = [];
  let cx, cy;

  function put(x, y) {
    path.push({ x, y });
    cx = x;
    cy = y;
  }

  function moveBy(dx, dy, steps) {
    for (let i = 0; i < steps; i++) {
      cx += dx;
      cy += dy;
      put(cx, cy);
    }
  }

  // Start at inner boundary, left side, middle row
  put(quarter - 1, half);

  // Outward spiral
  for (let level = 0; level < quarter - 1; level++) {
    const vertSteps = quarter + level;
    const horizSteps = half + 1 + 2 * level;

    moveBy(0, 1, vertSteps);

    if (level % 2 === 0) {
      moveBy(1, 0, horizSteps);
      moveBy(0, -1, vertSteps);
      moveBy(1, 0, 1);
    } else {
      moveBy(-1, 0, horizSteps);
      moveBy(0, -1, vertSteps);
      moveBy(-1, 0, 1);
    }
  }

  // Final up to corner
  moveBy(0, 1, half - 1);

  // Outer perimeter: left, down, right
  moveBy(-1, 0, n - 1);
  moveBy(0, -1, n - 1);
  moveBy(1, 0, n - 1);

  // Up from bottom-right
  moveBy(0, 1, half - 1);

  // Inward spiral (mirror of outward)
  for (let level = quarter - 2; level >= 0; level--) {
    const vertSteps = quarter + level;
    const horizSteps = half + 1 + 2 * level;

    if (level % 2 === 0) {
      moveBy(-1, 0, 1);
      moveBy(0, -1, vertSteps);
      moveBy(-1, 0, horizSteps);
      moveBy(0, 1, vertSteps);
    } else {
      moveBy(1, 0, 1);
      moveBy(0, -1, vertSteps);
      moveBy(1, 0, horizSteps);
      moveBy(0, 1, vertSteps);
    }
  }

  return path;
}

/**
 * Generate the U-fork curve path for a given order.
 *
 * @param {number} order - Curve order (1, 2, 3, ...)
 * @returns {Array<{x: number, y: number}>} Path visiting all cells
 */
function generateUForkPath(order) {
  const n = Math.pow(2, order);

  if (order === 1) {
    return [
      { x: 1, y: 1 },
      { x: 0, y: 1 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ];
  }

  if (order === 2) {
    // Generate zigzag for 4x4 and circular-shift to match target start
    const raw = generateZigzagPath(4);
    const startIdx = raw.findIndex((p) => p.x === 1 && p.y === 1);
    return [...raw.slice(startIdx), ...raw.slice(0, startIdx)];
  }

  if (order === 3) {
    return generateZigzagPath(8);
  }

  // For order >= 4: recursive construction
  const innerPath = generateUForkPath(order - 1);
  const innerN = n / 2;
  const offset = n / 4;
  const shift = computeShift(order);

  // Shift inner path circularly and offset to center region
  const shiftedInner = [];
  for (let i = 0; i < innerPath.length; i++) {
    const j = (i + shift) % innerPath.length;
    shiftedInner.push({
      x: innerPath[j].x + offset,
      y: innerPath[j].y + offset,
    });
  }

  // Find split point: where inner path crosses from row half to row half-1
  // at column offset (left boundary of center)
  const half = n / 2;
  let splitK = -1;
  for (let i = 0; i < shiftedInner.length - 1; i++) {
    if (
      shiftedInner[i].x === offset &&
      shiftedInner[i].y === half &&
      shiftedInner[i + 1].x === offset &&
      shiftedInner[i + 1].y === half - 1
    ) {
      splitK = i;
      break;
    }
  }

  const enterPart = shiftedInner.slice(0, splitK + 1);
  const exitPart = shiftedInner.slice(splitK + 1);

  // Generate frame path
  const framePath = generateFramePath(n);

  return [...enterPart, ...framePath, ...exitPart];
}

/**
 * Convert U-fork curve identifier to coordinate points.
 *
 * @param {string} sequence - Order identifier from generateUForkCurve
 * @param {number} gridSize - Size of the grid
 * @returns {Array<{x: number, y: number}>} Array of curve points
 */
export const uForkCurveToPoints = (sequence, gridSize) => {
  const order = Math.max(1, Math.round(Math.log2(gridSize)));
  return generateUForkPath(order);
};

/**
 * Compute U-fork Fractal solution in one step (atomic version).
 * Returns the final tour without intermediate steps.
 *
 * @param {Array<{x: number, y: number, id: number}>} points - Array of points
 * @param {number} gridSize - Size of the grid
 * @returns {{tour: number[], curvePoints: Array<{x: number, y: number}>}} Final tour and curve
 */
export const uForkSolution = (points, gridSize) => {
  if (points.length === 0) {
    return { tour: [], curvePoints: [] };
  }

  // Determine curve order: gridSize = 2^n, so order = log2(gridSize)
  const order = Math.max(1, Math.round(Math.log2(gridSize)));
  const curveSequence = generateUForkCurve(order);
  const curvePoints = uForkCurveToPoints(curveSequence, gridSize);

  const pointsWithCurvePos = points.map((p, idx) => {
    let minDist = Infinity;
    let curvePos = 0;

    for (let i = 0; i < curvePoints.length; i++) {
      const d = distance(p, curvePoints[i]);
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
    curvePoints,
  };
};

export default uForkSolution;
