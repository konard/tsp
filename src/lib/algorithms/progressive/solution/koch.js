/**
 * Progressive Koch Snowflake Algorithm for TSP
 *
 * Also known as: Koch Curve, Snowflake Fractal, Koch Fractal Ordering
 *
 * This algorithm provides step-by-step visualization of using a Koch snowflake
 * curve to order points:
 * 1. Generate a Koch snowflake curve that covers the grid space
 * 2. Map each point to its nearest position on the curve
 * 3. Sort points by their position along the curve
 * 4. Connect points in curve-order to form a tour
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */

import { distance } from '../../utils.js';
import {
  generateKochSnowflake,
  kochCurveToPoints,
  calculateKochOrder,
} from '../../atomic/solution/koch.js';

// Re-export atomic functions for backward compatibility
export {
  kochSolution,
  generateKochSnowflake,
  kochCurveToPoints,
  calculateKochOrder,
} from '../../atomic/solution/koch.js';

/**
 * Generate step-by-step solution using Koch Snowflake algorithm
 *
 * @param {Array<{x: number, y: number, id: number}>} points - Array of points
 * @param {number} mooreGridSize - Size of the Moore grid
 * @returns {Array<Object>} Array of steps for visualization
 */
export const kochAlgorithmSteps = (points, mooreGridSize) => {
  if (points.length === 0) {
    return [];
  }

  const order = calculateKochOrder(mooreGridSize);
  const rawCurvePoints = generateKochSnowflake(order);
  const curvePoints = kochCurveToPoints(rawCurvePoints, mooreGridSize);
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

  // First step: show the Koch snowflake curve
  steps.push({
    type: 'curve',
    curvePoints,
    mooreGridSize,
    curveProgress: 0,
    tour: [],
    description: `Koch snowflake generated (order ${order}, ${mooreGridSize}×${mooreGridSize} grid)`,
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

export default kochAlgorithmSteps;
