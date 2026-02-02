/**
 * Progressive Sierpiński Curve Algorithm for TSP
 *
 * Also known as: Space-Filling Curve, Sierpiński Square Curve
 *
 * This algorithm provides step-by-step visualization of using a Sierpiński curve
 * to order points:
 * 1. Generate a Sierpiński curve that fills the grid space
 * 2. Map each point to its nearest position on the curve
 * 3. Sort points by their position along the curve
 * 4. Connect points in curve-order to form a tour
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */

import { distance } from '../../utils.js';
import {
  generateSierpinskiCurve,
  sierpinskiCurveToPoints,
} from '../../atomic/solution/sierpinski.js';

// Re-export atomic functions for backward compatibility
export {
  sierpinskiSolution,
  generateSierpinskiCurve,
  sierpinskiCurveToPoints,
} from '../../atomic/solution/sierpinski.js';

/**
 * Generate step-by-step solution using Sierpiński Curve algorithm
 *
 * @param {Array<{x: number, y: number, id: number}>} points - Array of points
 * @param {number} mooreGridSize - Size of the grid (shared grid system)
 * @returns {Array<Object>} Array of steps for visualization
 */
export const sierpinskiAlgorithmSteps = (points, mooreGridSize) => {
  if (points.length === 0) {
    return [];
  }

  // Determine L-system iterations based on grid size
  const order = Math.max(0, Math.round(Math.log2(mooreGridSize)) - 1);
  const curveSequence = generateSierpinskiCurve(order);
  // Generate curve points using the grid size for perfect alignment
  const curvePoints = sierpinskiCurveToPoints(curveSequence, mooreGridSize);
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

  // First step: show the Sierpiński curve
  steps.push({
    type: 'curve',
    curvePoints,
    mooreGridSize,
    curveProgress: 0,
    tour: [],
    description: `Sierpiński curve generated (order ${order}, ${mooreGridSize}×${mooreGridSize} grid)`,
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

export default sierpinskiAlgorithmSteps;
