/**
 * Atomic Peano Curve Solution for TSP
 *
 * Computes the final tour directly without intermediate visualization steps.
 *
 * Algorithm:
 * 1. Generate a Peano curve (L-system) that fills the grid space
 * 2. Map each point to its nearest position on the curve
 * 3. Sort points by their position along the curve
 * 4. Return the sorted order as the tour
 *
 * The Peano curve fills a 3^n x 3^n grid, complementing the Moore curve
 * which fills a 2^n x 2^n grid.
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */

import { distance } from '../../utils.js';

/**
 * Generate Peano curve using L-system
 * L-system rules for Peano curve:
 * Axiom: X
 * X -> XFYFX+F+YFXFY-F-XFYFX
 * Y -> YFXFY-F-XFYFX+F+YFXFY
 *
 * @param {number} order - Order of the Peano curve (0, 1, 2, ...)
 * @returns {string} L-system sequence
 */
export const generatePeanoCurve = (order) => {
  let sequence = 'X';

  for (let i = 0; i < order; i++) {
    let newSequence = '';
    for (const char of sequence) {
      if (char === 'X') {
        newSequence += 'XFYFX+F+YFXFY-F-XFYFX';
      } else if (char === 'Y') {
        newSequence += 'YFXFY-F-XFYFX+F+YFXFY';
      } else {
        newSequence += char;
      }
    }
    sequence = newSequence;
  }

  return sequence;
};

/**
 * Convert Peano curve L-system sequence to coordinate points
 *
 * @param {string} sequence - L-system sequence
 * @param {number} peanoGridSize - Size of the grid
 * @returns {Array<{x: number, y: number}>} Array of curve points
 */
export const peanoCurveToPoints = (sequence, peanoGridSize) => {
  const curvePoints = [];
  let x = 0;
  let y = 0;

  // Direction: 0=right, 1=up, 2=left, 3=down
  let direction = 1; // Start going up

  curvePoints.push({ x, y });

  for (const char of sequence) {
    if (char === 'F') {
      if (direction === 0) {
        x += 1;
      } else if (direction === 1) {
        y -= 1;
      } else if (direction === 2) {
        x -= 1;
      } else if (direction === 3) {
        y += 1;
      }

      curvePoints.push({ x, y });
    } else if (char === '+') {
      direction = (direction + 1) % 4;
    } else if (char === '-') {
      direction = (direction + 3) % 4;
    }
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

  // Handle degenerate case where curve has no extent
  if (curveWidth === 0 && curveHeight === 0) {
    return curvePoints.map(() => ({ x: 0, y: 0 }));
  }

  const normalizedPoints = curvePoints.map((p) => ({
    x:
      curveWidth > 0
        ? Math.round(((p.x - minX) / curveWidth) * (peanoGridSize - 1))
        : 0,
    y:
      curveHeight > 0
        ? Math.round(((p.y - minY) / curveHeight) * (peanoGridSize - 1))
        : 0,
  }));

  return normalizedPoints;
};

/**
 * Compute Peano Curve solution in one step (atomic version).
 * Returns the final tour without intermediate steps.
 *
 * @param {Array<{x: number, y: number, id: number}>} points - Array of points
 * @param {number} peanoGridSize - Size of the Peano grid
 * @returns {{tour: number[], curvePoints: Array<{x: number, y: number}>}} Final tour and curve
 */
export const peanoSolution = (points, peanoGridSize) => {
  if (points.length === 0) {
    return { tour: [], curvePoints: [] };
  }

  // Determine L-system iterations: peanoGridSize = 3^n, so n = log3(peanoGridSize)
  const order = Math.max(1, Math.round(Math.log(peanoGridSize) / Math.log(3)));
  const curveSequence = generatePeanoCurve(order);
  const curvePoints = peanoCurveToPoints(curveSequence, peanoGridSize);

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

export default peanoSolution;
