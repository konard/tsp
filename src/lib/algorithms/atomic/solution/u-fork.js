/**
 * Atomic U-fork Fractal Solution for TSP
 *
 * Computes the final tour directly without intermediate visualization steps.
 *
 * The U-fork fractal is a Hilbert curve variant space-filling curve.
 * It recursively subdivides a 2^n x 2^n grid into four quadrants,
 * each filled with a rotated/reflected copy of the curve.
 *
 * L-system rules:
 * Axiom: A
 * A -> -BF+AFA+FB-
 * B -> +AF-BFB-FA+
 *
 * Where:
 *   F = move forward
 *   + = turn right 90°
 *   - = turn left 90°
 *   A, B = non-drawing variables (production rules only)
 *
 * Algorithm:
 * 1. Generate a U-fork curve (L-system) that fills the grid space
 * 2. Map each point to its nearest position on the curve
 * 3. Sort points by their position along the curve
 * 4. Return the sorted order as the tour
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */

import { distance } from '../../utils.js';

/**
 * Generate U-fork curve using L-system
 * L-system rules for U-fork (Hilbert) curve:
 * Axiom: A
 * A -> -BF+AFA+FB-
 * B -> +AF-BFB-FA+
 *
 * @param {number} order - Order of the U-fork curve
 * @returns {string} L-system sequence
 */
export const generateUForkCurve = (order) => {
  let sequence = 'A';

  for (let i = 0; i < order; i++) {
    let newSequence = '';
    for (const char of sequence) {
      if (char === 'A') {
        newSequence += '-BF+AFA+FB-';
      } else if (char === 'B') {
        newSequence += '+AF-BFB-FA+';
      } else {
        newSequence += char;
      }
    }
    sequence = newSequence;
  }

  return sequence;
};

/**
 * Convert U-fork curve L-system sequence to coordinate points
 *
 * @param {string} sequence - L-system sequence
 * @param {number} gridSize - Size of the grid
 * @returns {Array<{x: number, y: number}>} Array of curve points
 */
export const uForkCurveToPoints = (sequence, gridSize) => {
  const curvePoints = [];
  let x = 0;
  let y = 0;

  // Direction: 0=up, 1=right, 2=down, 3=left
  // Start facing down to produce the correct U-fork orientation
  // matching the target pattern: vertically symmetric C-shape opening left
  let direction = 2;

  curvePoints.push({ x, y });

  for (const char of sequence) {
    if (char === 'F') {
      if (direction === 0) {
        y -= 1;
      } else if (direction === 1) {
        x += 1;
      } else if (direction === 2) {
        y += 1;
      } else if (direction === 3) {
        x -= 1;
      }

      curvePoints.push({ x, y });
    } else if (char === '+') {
      direction = (direction + 1) % 4;
    } else if (char === '-') {
      direction = (direction + 3) % 4;
    }
    // A and B are non-drawing variables, ignored
  }

  // Find bounding box of the curve
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const p of curvePoints) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }

  const curveWidth = maxX - minX;
  const curveHeight = maxY - minY;

  const normalizedPoints = curvePoints.map((p) => ({
    x:
      curveWidth === 0
        ? 0
        : Math.round(((p.x - minX) / curveWidth) * (gridSize - 1)),
    y:
      curveHeight === 0
        ? 0
        : Math.round(((p.y - minY) / curveHeight) * (gridSize - 1)),
  }));

  return normalizedPoints;
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

  // Determine L-system order: gridSize = 2^n, so order = log2(gridSize)
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
