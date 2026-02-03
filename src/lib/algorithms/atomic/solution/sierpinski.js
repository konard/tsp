/**
 * Atomic Sierpiński Curve Solution for TSP
 *
 * Computes the final tour directly without intermediate visualization steps.
 *
 * Algorithm:
 * 1. Generate a Sierpiński curve (L-system) that fills the grid space
 * 2. Map each point to its nearest position on the curve
 * 3. Sort points by their position along the curve
 * 4. Return the sorted order as the tour
 *
 * The Sierpiński curve is a space-filling curve that is more symmetrical than
 * other commonly studied space-filling curves. It has been shown to produce
 * high-quality TSP heuristic solutions.
 *
 * L-system definition (square variant):
 * Axiom: F+XF+F+XF
 * Rule: X → XF-F+F-XF+F+XF-F+F-X
 * Angle: 90°
 *
 * Reference: Platzman & Bartholdi, "Spacefilling curves and the planar
 * travelling salesman problem", JACM 36(4):719-737 (1989)
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */

import { distance } from '../../utils.js';

/**
 * Generate Sierpiński curve using L-system
 * L-system rules for Sierpiński curve (square variant):
 * Axiom: F+XF+F+XF
 * X -> XF-F+F-XF+F+XF-F+F-X
 *
 * @param {number} order - Order of the Sierpiński curve
 * @returns {string} L-system sequence
 */
export const generateSierpinskiCurve = (order) => {
  let sequence = 'F+XF+F+XF';

  for (let i = 0; i < order; i++) {
    let newSequence = '';
    for (const char of sequence) {
      if (char === 'X') {
        newSequence += 'XF-F+F-XF+F+XF-F+F-X';
      } else {
        newSequence += char;
      }
    }
    sequence = newSequence;
  }

  return sequence;
};

/**
 * Convert Sierpiński curve L-system sequence to coordinate points
 *
 * @param {string} sequence - L-system sequence
 * @param {number} gridSize - Size of the grid
 * @returns {Array<{x: number, y: number}>} Array of curve points
 */
export const sierpinskiCurveToPoints = (sequence, gridSize) => {
  const stepSize = 1;

  const curvePoints = [];
  let x = 0;
  let y = 0;

  // Direction: 0=right, 1=down, 2=left, 3=up
  let direction = 0;

  curvePoints.push({ x, y });

  for (const char of sequence) {
    if (char === 'F') {
      if (direction === 0) {
        x += stepSize;
      } else if (direction === 1) {
        y += stepSize;
      } else if (direction === 2) {
        x -= stepSize;
      } else if (direction === 3) {
        y -= stepSize;
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

  // Avoid division by zero for degenerate cases
  if (curveWidth === 0 || curveHeight === 0) {
    return curvePoints.map(() => ({ x: 0, y: 0 }));
  }

  const normalizedPoints = curvePoints.map((p) => ({
    x: Math.round(((p.x - minX) / curveWidth) * (gridSize - 1)),
    y: Math.round(((p.y - minY) / curveHeight) * (gridSize - 1)),
  }));

  return normalizedPoints;
};

/**
 * Compute Sierpiński Curve solution in one step (atomic version).
 * Returns the final tour without intermediate steps.
 *
 * @param {Array<{x: number, y: number, id: number}>} points - Array of points
 * @param {number} mooreGridSize - Size of the grid (shared grid system)
 * @returns {{tour: number[], curvePoints: Array<{x: number, y: number}>}} Final tour and curve
 */
export const sierpinskiSolution = (points, mooreGridSize) => {
  if (points.length === 0) {
    return { tour: [], curvePoints: [] };
  }

  // Determine L-system iterations: similar to Moore, use log2(gridSize) - 1
  const order = Math.max(0, Math.round(Math.log2(mooreGridSize)) - 1);
  const curveSequence = generateSierpinskiCurve(order);
  const curvePoints = sierpinskiCurveToPoints(curveSequence, mooreGridSize);

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

export default sierpinskiSolution;
