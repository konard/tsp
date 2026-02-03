/**
 * Progressive Peano Curve Algorithm for TSP
 *
 * Also known as: Peano Space-Filling Curve, Peano Ordering
 *
 * This algorithm provides step-by-step visualization of using a Peano curve
 * to order points:
 * 1. Generate a Peano curve that fills the grid space
 * 2. Map each point to its nearest position on the curve
 * 3. Sort points by their position along the curve
 * 4. Connect points in curve-order to form a tour
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */

import { distance } from '../../utils.js';
import {
  generatePeanoCurve,
  peanoCurveToPoints,
} from '../../atomic/solution/peano.js';

// Re-export atomic functions for backward compatibility
export {
  peanoSolution,
  generatePeanoCurve,
  peanoCurveToPoints,
} from '../../atomic/solution/peano.js';

/**
 * Generate step-by-step solution using Peano Curve algorithm
 *
 * @param {Array<{x: number, y: number, id: number}>} points - Array of points
 * @param {number} peanoGridSize - Size of the Peano grid
 * @returns {Array<Object>} Array of steps for visualization
 */
export const peanoAlgorithmSteps = (points, peanoGridSize) => {
  if (points.length === 0) {
    return [];
  }

  // Determine L-system iterations based on Peano grid size
  // generatePeanoCurve(n) fills a 3^n x 3^n grid
  const order = Math.max(1, Math.round(Math.log(peanoGridSize) / Math.log(3)));
  const curveSequence = generatePeanoCurve(order);
  // Generate curve points using the Peano grid size for alignment
  const curvePoints = peanoCurveToPoints(curveSequence, peanoGridSize);
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

  // First step: show the Peano curve
  steps.push({
    type: 'curve',
    curvePoints,
    peanoGridSize,
    curveProgress: 0,
    tour: [],
    description: `Peano curve generated (order ${order}, ${peanoGridSize}\u00D7${peanoGridSize} grid)`,
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
      peanoGridSize,
      curvePosition: pointsWithCurvePos[i].curvePos,
      curveProgress: parseFloat(curveProgress),
      tour: [...tour],
      description: `Progress: ${curveProgress}% | Point ${pointsWithCurvePos[i].idx} (${pointsWithCurvePos[i].x}, ${pointsWithCurvePos[i].y})`,
    });
  }

  return steps;
};

export default peanoAlgorithmSteps;
