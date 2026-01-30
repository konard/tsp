/**
 * Progressive Moore Curve Algorithm for TSP
 *
 * Also known as: Space-Filling Curve, Hilbert Curve Variant, Fractal Ordering
 *
 * This algorithm provides step-by-step visualization of using a Moore curve
 * (a variant of the Hilbert curve) to order points:
 * 1. Generate a Moore curve that fills the grid space
 * 2. Map each point to its nearest position on the curve
 * 3. Sort points by their position along the curve
 * 4. Connect points in curve-order to form a tour
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */

import { distance } from '../../utils.js';
import {
  generateMooreCurve,
  mooreCurveToPoints,
} from '../../atomic/solution/moore.js';

// Re-export atomic functions for backward compatibility
export {
  mooreSolution,
  generateMooreCurve,
  mooreCurveToPoints,
} from '../../atomic/solution/moore.js';

/**
 * Generate step-by-step solution using Moore Curve algorithm
 *
 * @param {Array<{x: number, y: number, id: number}>} points - Array of points
 * @param {number} mooreGridSize - Size of the Moore grid
 * @returns {Array<Object>} Array of steps for visualization
 */
export const mooreAlgorithmSteps = (points, mooreGridSize) => {
  if (points.length === 0) {
    return [];
  }

  // Determine L-system iterations based on Moore grid size
  // generateMooreCurve(n) fills a 2^(n+1) x 2^(n+1) grid
  // So for mooreGridSize = 2^k, iterations = k - 1
  const order = Math.max(0, Math.round(Math.log2(mooreGridSize)) - 1);
  const curveSequence = generateMooreCurve(order);
  // Generate curve points using the Moore grid size for perfect alignment
  const curvePoints = mooreCurveToPoints(curveSequence, mooreGridSize);
  const totalCurveLength = curvePoints.length;

  // Points are already on Moore grid coordinates, no scaling needed
  // Map each point to its position along the curve
  const pointsWithCurvePos = points.map((p, idx) => {
    let minDist = Infinity;
    let curvePos = 0;

    // Points are already in Moore grid coordinates
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

  // First step: show the Moore curve
  steps.push({
    type: 'curve',
    curvePoints,
    mooreGridSize,
    curveProgress: 0,
    tour: [],
    description: `Moore curve generated (order ${order}, ${mooreGridSize}×${mooreGridSize} grid)`,
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
      mooreGridSize,
      curvePosition: pointsWithCurvePos[i].curvePos,
      curveProgress: parseFloat(curveProgress),
      tour: [...tour],
      description: `Progress: ${curveProgress}% | Point ${pointsWithCurvePos[i].idx} (${pointsWithCurvePos[i].x}, ${pointsWithCurvePos[i].y})`,
    });
  }

  return steps;
};

export default mooreAlgorithmSteps;
