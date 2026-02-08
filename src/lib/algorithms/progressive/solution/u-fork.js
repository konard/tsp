/**
 * Progressive U-fork Fractal Algorithm for TSP
 *
 * Also known as: Hilbert Curve, U-fork Space-Filling Curve
 *
 * This algorithm provides step-by-step visualization of using a U-fork
 * (Hilbert) curve to order points:
 * 1. Generate a U-fork curve that fills the grid space
 * 2. Map each point to its nearest position on the curve
 * 3. Sort points by their position along the curve
 * 4. Connect points in curve-order to form a tour
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */

import { distance } from '../../utils.js';
import {
  generateUForkCurve,
  uForkCurveToPoints,
} from '../../atomic/solution/u-fork.js';

// Re-export atomic functions for backward compatibility
export {
  uForkSolution,
  generateUForkCurve,
  uForkCurveToPoints,
} from '../../atomic/solution/u-fork.js';

/**
 * Generate step-by-step solution using U-fork Fractal algorithm
 *
 * @param {Array<{x: number, y: number, id: number}>} points - Array of points
 * @param {number} gridSize - Size of the grid
 * @returns {Array<Object>} Array of steps for visualization
 */
export const uForkAlgorithmSteps = (points, gridSize) => {
  if (points.length === 0) {
    return [];
  }

  // Determine L-system order: gridSize = 2^n, so order = log2(gridSize)
  const order = Math.max(1, Math.round(Math.log2(gridSize)));
  const curveSequence = generateUForkCurve(order);
  // Generate curve points using the grid size for alignment
  const curvePoints = uForkCurveToPoints(curveSequence, gridSize);
  const totalCurveLength = curvePoints.length;

  // Map each point to its position along the curve
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

    return { ...p, idx, curvePos };
  });

  // Sort points by their position along the curve
  pointsWithCurvePos.sort((a, b) => a.curvePos - b.curvePos);

  // Generate steps
  const steps = [];
  const tour = [];

  // First step: show the U-fork curve
  steps.push({
    type: 'curve',
    curvePoints,
    gridSize,
    curveProgress: 0,
    tour: [],
    description: `U-fork curve generated (order ${order}, ${gridSize}×${gridSize} grid)`,
  });

  for (let i = 0; i < pointsWithCurvePos.length; i++) {
    tour.push(pointsWithCurvePos[i].idx);
    // Calculate progress along the curve as a percentage
    const curveProgress = (
      (pointsWithCurvePos[i].curvePos / (totalCurveLength - 1)) *
      100
    ).toFixed(1);

    steps.push({
      type: 'visit',
      curvePoints,
      gridSize,
      curvePosition: pointsWithCurvePos[i].curvePos,
      curveProgress: parseFloat(curveProgress),
      tour: [...tour],
      description: `Progress: ${curveProgress}% | Point ${pointsWithCurvePos[i].idx} (${pointsWithCurvePos[i].x}, ${pointsWithCurvePos[i].y})`,
    });
  }

  return steps;
};

export default uForkAlgorithmSteps;
