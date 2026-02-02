/**
 * Atomic Gosper Curve Solution for TSP
 *
 * Computes the final tour directly without intermediate visualization steps.
 *
 * Algorithm:
 * 1. Generate a Gosper curve (L-system) that fills a hexagonal region
 * 2. Map each point to its nearest position on the curve
 * 3. Sort points by their position along the curve
 * 4. Return the sorted order as the tour
 *
 * The Gosper curve (also known as the Peano-Gosper curve or flowsnake) is a
 * space-filling fractal curve that uses 60-degree turns on a hexagonal grid.
 *
 * L-system rules:
 * - Angle: 60 degrees
 * - Axiom: A
 * - A -> A-B--B+A++AA+B-
 * - B -> +A-BB--B-A++A+B
 * Where A and B both mean "move forward", + means turn left 60°, - means turn right 60°.
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */

import { distance } from '../../utils.js';

/**
 * Generate Gosper curve using L-system
 *
 * L-system rules for Gosper curve:
 * Axiom: A
 * A -> A-B--B+A++AA+B-
 * B -> +A-BB--B-A++A+B
 *
 * @param {number} order - Order of the Gosper curve (number of iterations)
 * @returns {string} L-system sequence
 */
export const generateGosperCurve = (order) => {
  let sequence = 'A';

  for (let i = 0; i < order; i++) {
    let newSequence = '';
    for (const char of sequence) {
      if (char === 'A') {
        newSequence += 'A-B--B+A++AA+B-';
      } else if (char === 'B') {
        newSequence += '+A-BB--B-A++A+B';
      } else {
        newSequence += char;
      }
    }
    sequence = newSequence;
  }

  return sequence;
};

/**
 * Convert Gosper curve L-system sequence to coordinate points.
 *
 * Uses turtle graphics with 60-degree angle increments.
 * Both A and B are treated as forward-drawing commands.
 *
 * @param {string} sequence - L-system sequence
 * @param {number} gridSize - Size of the target grid to normalize into
 * @returns {Array<{x: number, y: number}>} Array of curve points
 */
export const gosperCurveToPoints = (sequence, gridSize) => {
  const curvePoints = [];
  let x = 0;
  let y = 0;
  // Direction in radians, starting facing right (0 degrees)
  let angle = 0;
  const angleStep = Math.PI / 3; // 60 degrees

  curvePoints.push({ x, y });

  for (const char of sequence) {
    if (char === 'A' || char === 'B') {
      // Move forward in current direction
      x += Math.cos(angle);
      y += Math.sin(angle);
      curvePoints.push({ x, y });
    } else if (char === '+') {
      // Turn left 60 degrees
      angle += angleStep;
    } else if (char === '-') {
      // Turn right 60 degrees
      angle -= angleStep;
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
  const scaleX = curveWidth > 0 ? curveWidth : 1;
  const scaleY = curveHeight > 0 ? curveHeight : 1;

  // Normalize to [0, gridSize-1] grid coordinates
  const normalizedPoints = curvePoints.map((p) => ({
    x: Math.round(((p.x - minX) / scaleX) * (gridSize - 1)),
    y: Math.round(((p.y - minY) / scaleY) * (gridSize - 1)),
  }));

  return normalizedPoints;
};

/**
 * Determine the appropriate Gosper curve order for a given grid size.
 *
 * A Gosper curve of order n has 7^n segments. We choose the order
 * such that the curve provides sufficient resolution for the grid.
 *
 * @param {number} gridSize - The grid size
 * @returns {number} The appropriate order for the Gosper curve
 */
export const calculateGosperOrder = (gridSize) => {
  // Each order covers roughly sqrt(7)^n ≈ 2.646^n units in each dimension.
  // For grid sizes: 2->1, 4->2, 8->2, 16->3, 32->3, 64->4, 128->4
  // We want enough curve points to distinguish all grid positions.
  if (gridSize <= 2) return 1;
  if (gridSize <= 8) return 2;
  if (gridSize <= 32) return 3;
  if (gridSize <= 128) return 4;
  return 5;
};

/**
 * Compute Gosper Curve solution in one step (atomic version).
 * Returns the final tour without intermediate steps.
 *
 * @param {Array<{x: number, y: number, id: number}>} points - Array of points
 * @param {number} gridSize - Size of the grid
 * @returns {{tour: number[], curvePoints: Array<{x: number, y: number}>}} Final tour and curve
 */
export const gosperSolution = (points, gridSize) => {
  if (points.length === 0) {
    return { tour: [], curvePoints: [] };
  }

  const order = calculateGosperOrder(gridSize);
  const curveSequence = generateGosperCurve(order);
  const curvePoints = gosperCurveToPoints(curveSequence, gridSize);

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

export default gosperSolution;
