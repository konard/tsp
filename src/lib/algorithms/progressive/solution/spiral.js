/**
 * Progressive Double Spiral Algorithm for TSP
 *
 * Also known as: Rectangular Spiral, Square Spiral, Inward Spiral Scan
 *
 * This algorithm provides step-by-step visualization of using a double spiral
 * to order points:
 * 1. Generate a rectangular spiral that fills the grid space
 * 2. Map each point to its nearest position on the spiral
 * 3. Sort points by their position along the spiral
 * 4. Connect points in spiral-order to form a tour
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */

import { distance } from '../../utils.js';
import { generateDoubleSpiralPoints } from '../../atomic/solution/spiral.js';

// Re-export atomic functions for backward compatibility
export {
  spiralSolution,
  generateDoubleSpiralPoints,
} from '../../atomic/solution/spiral.js';

/**
 * Generate step-by-step solution using Double Spiral algorithm
 *
 * @param {Array<{x: number, y: number, id: number}>} points - Array of points
 * @param {number} mooreGridSize - Size of the grid
 * @returns {Array<Object>} Array of steps for visualization
 */
export const spiralAlgorithmSteps = (points, mooreGridSize) => {
  if (points.length === 0) {
    return [];
  }

  const curvePoints = generateDoubleSpiralPoints(mooreGridSize);
  const totalCurveLength = curvePoints.length;

  // Map each point to its position along the spiral
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

  // Sort points by their position along the spiral
  pointsWithCurvePos.sort((a, b) => a.curvePos - b.curvePos);

  // Generate steps
  const steps = [];
  const tour = [];

  // First step: show the spiral curve
  steps.push({
    type: 'curve',
    curvePoints,
    mooreGridSize,
    curveProgress: 0,
    tour: [],
    description: `Double spiral generated (${mooreGridSize}\u00D7${mooreGridSize} grid)`,
  });

  for (let i = 0; i < pointsWithCurvePos.length; i++) {
    tour.push(pointsWithCurvePos[i].idx);
    // Calculate progress along the spiral as a percentage
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

export default spiralAlgorithmSteps;
