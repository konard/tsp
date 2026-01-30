/**
 * Atomic Moore Curve Solution for TSP
 *
 * Computes the final tour directly without intermediate visualization steps.
 *
 * Algorithm:
 * 1. Generate a Moore curve (L-system) that fills the grid space
 * 2. Map each point to its nearest position on the curve
 * 3. Sort points by their position along the curve
 * 4. Return the sorted order as the tour
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */

import { distance } from '../../utils.js';

/**
 * Generate Moore curve using L-system
 * L-system rules for Moore curve:
 * Axiom: LFL+F+LFL
 * L -> -RF+LFL+FR-
 * R -> +LF-RFR-FL+
 *
 * @param {number} order - Order of the Moore curve
 * @returns {string} L-system sequence
 */
export const generateMooreCurve = (order) => {
  let sequence = 'LFL+F+LFL';

  for (let i = 0; i < order; i++) {
    let newSequence = '';
    for (const char of sequence) {
      if (char === 'L') {
        newSequence += '-RF+LFL+FR-';
      } else if (char === 'R') {
        newSequence += '+LF-RFR-FL+';
      } else {
        newSequence += char;
      }
    }
    sequence = newSequence;
  }

  return sequence;
};

/**
 * Convert Moore curve L-system sequence to coordinate points
 *
 * @param {string} sequence - L-system sequence
 * @param {number} mooreGridSize - Size of the grid
 * @returns {Array<{x: number, y: number}>} Array of curve points
 */
export const mooreCurveToPoints = (sequence, mooreGridSize) => {
  const stepSize = 1;

  const curvePoints = [];
  let x = 0;
  let y = 0;

  // Direction: 0=up, 1=right, 2=down, 3=left
  let direction = 0;

  curvePoints.push({ x, y });

  for (const char of sequence) {
    if (char === 'F') {
      if (direction === 0) {
        y -= stepSize;
      } else if (direction === 1) {
        x += stepSize;
      } else if (direction === 2) {
        y += stepSize;
      } else if (direction === 3) {
        x -= stepSize;
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

  const normalizedPoints = curvePoints.map((p) => ({
    x: Math.round(((p.x - minX) / curveWidth) * (mooreGridSize - 1)),
    y: Math.round(((p.y - minY) / curveHeight) * (mooreGridSize - 1)),
  }));

  return normalizedPoints;
};

/**
 * Compute Moore Curve solution in one step (atomic version).
 * Returns the final tour without intermediate steps.
 *
 * @param {Array<{x: number, y: number, id: number}>} points - Array of points
 * @param {number} mooreGridSize - Size of the Moore grid
 * @returns {{tour: number[], curvePoints: Array<{x: number, y: number}>}} Final tour and curve
 */
export const mooreSolution = (points, mooreGridSize) => {
  if (points.length === 0) {
    return { tour: [], curvePoints: [] };
  }

  // Determine L-system iterations: mooreGridSize = 2^(n+1), so n = log2(mooreGridSize) - 1
  const order = Math.max(0, Math.round(Math.log2(mooreGridSize)) - 1);
  const curveSequence = generateMooreCurve(order);
  const curvePoints = mooreCurveToPoints(curveSequence, mooreGridSize);

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

export default mooreSolution;
