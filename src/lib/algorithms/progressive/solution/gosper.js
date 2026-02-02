/**
 * Progressive Gosper Curve Algorithm for TSP
 *
 * Also known as: Flowsnake, Peano-Gosper Curve, Fractal Space-Filling Curve
 *
 * This algorithm provides step-by-step visualization of using a Gosper curve
 * (a hexagonal space-filling fractal curve) to order points:
 * 1. Generate a Gosper curve that fills a hexagonal region
 * 2. Map each point to its nearest position on the curve
 * 3. Sort points by their position along the curve
 * 4. Connect points in curve-order to form a tour
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */

import { distance } from '../../utils.js';
import {
  generateGosperCurve,
  gosperCurveToPoints,
  calculateGosperOrder,
} from '../../atomic/solution/gosper.js';

// Re-export atomic functions for backward compatibility
export {
  gosperSolution,
  generateGosperCurve,
  gosperCurveToPoints,
  calculateGosperOrder,
} from '../../atomic/solution/gosper.js';

/**
 * Generate step-by-step solution using Gosper Curve algorithm
 *
 * @param {Array<{x: number, y: number, id: number}>} points - Array of points
 * @param {number} gridSize - Size of the grid
 * @returns {Array<Object>} Array of steps for visualization
 */
export const gosperAlgorithmSteps = (points, gridSize) => {
  if (points.length === 0) {
    return [];
  }

  const order = calculateGosperOrder(gridSize);
  const curveSequence = generateGosperCurve(order);
  const curvePoints = gosperCurveToPoints(curveSequence, gridSize);
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

  // First step: show the Gosper curve
  steps.push({
    type: 'curve',
    curvePoints,
    gosperGridSize: gridSize,
    curveProgress: 0,
    tour: [],
    description: `Gosper curve generated (order ${order}, ${gridSize}\u00D7${gridSize} grid)`,
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
      gosperGridSize: gridSize,
      curvePosition: pointsWithCurvePos[i].curvePos,
      curveProgress: parseFloat(curveProgress),
      tour: [...tour],
      description: `Progress: ${curveProgress}% | Point ${pointsWithCurvePos[i].idx} (${pointsWithCurvePos[i].x}, ${pointsWithCurvePos[i].y})`,
    });
  }

  return steps;
};

export default gosperAlgorithmSteps;
