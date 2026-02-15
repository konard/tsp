/**
 * Progressive Space-Filling Tree Algorithm for TSP
 *
 * Also known as: Space-Filling Tree Walk, Quadtree Traversal
 *
 * This algorithm provides step-by-step visualization of using a space-filling
 * tree (recursive quadrant subdivision) to order points:
 * 1. Generate the tree structure (X-pattern edges) and curve
 * 2. Map each point to its nearest position on the curve
 * 3. Sort points by their position along the curve
 * 4. Connect points in curve-order to form a tour, showing progress
 *
 * The walking pattern uses a counter-clockwise quadrant traversal at each level
 * (BL → TL → TR → BR) with appropriate rotations in child quadrants to ensure
 * smooth transitions, creating a characteristic pinwheel pattern.
 *
 * Reference: Kuffner & LaValle, "Space-Filling Trees" (2009)
 * https://en.wikipedia.org/wiki/Space-filling_tree
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */

import { distance } from '../../utils.js';
import {
  generateSpaceFillingTreeCurve,
  generateTreeEdges,
} from '../../atomic/solution/space-filling-tree.js';

// Re-export atomic functions for backward compatibility
export {
  spaceFillingTreeSolution,
  generateSpaceFillingTreeCurve,
  generateTreeEdges,
} from '../../atomic/solution/space-filling-tree.js';

/**
 * Generate step-by-step solution using Space-Filling Tree algorithm
 *
 * @param {Array<{x: number, y: number, id: number}>} points - Array of points
 * @param {number} treeGridSize - Size of the grid (power of 2)
 * @returns {Array<Object>} Array of steps for visualization
 */
export const spaceFillingTreeAlgorithmSteps = (points, treeGridSize) => {
  if (points.length === 0) {
    return [];
  }

  // Determine order: treeGridSize = 2^order
  const order = Math.max(1, Math.round(Math.log2(treeGridSize)));
  const internalGridSize = Math.pow(2, order);
  const curvePoints = generateSpaceFillingTreeCurve(order);

  // Normalize curve points to align with grid
  const scale =
    internalGridSize <= 1 ? 1 : (treeGridSize - 1) / (internalGridSize - 1);
  const normalizedCurve = curvePoints.map((p) => ({
    x: Math.round(p.x * scale),
    y: Math.round(p.y * scale),
  }));

  const treeEdges = generateTreeEdges(order, treeGridSize);
  const totalCurveLength = normalizedCurve.length;

  // Map each point to its position along the curve
  const pointsWithCurvePos = points.map((p, idx) => {
    let minDist = Infinity;
    let curvePos = 0;

    for (let i = 0; i < normalizedCurve.length; i++) {
      const d = distance(p, normalizedCurve[i]);
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

  // First step: show the tree structure and curve
  steps.push({
    type: 'curve',
    curvePoints: normalizedCurve,
    treeEdges,
    treeGridSize,
    curveProgress: 0,
    tour: [],
    description: `Space-filling tree built (order ${order}, ${treeGridSize}\u00d7${treeGridSize} grid)`,
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
      curvePoints: normalizedCurve,
      treeEdges,
      treeGridSize,
      curvePosition: pointsWithCurvePos[i].curvePos,
      curveProgress: parseFloat(curveProgress),
      tour: [...tour],
      description: `Progress: ${curveProgress}% | Point ${pointsWithCurvePos[i].idx} (${pointsWithCurvePos[i].x}, ${pointsWithCurvePos[i].y})`,
    });
  }

  return steps;
};

export default spaceFillingTreeAlgorithmSteps;
