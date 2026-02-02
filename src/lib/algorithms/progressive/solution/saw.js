/**
 * Progressive Self-Avoiding Walk (SAW) Algorithm for TSP
 *
 * Also known as: Nearest-Neighbor Walk, Greedy Self-Avoiding Path
 *
 * This algorithm provides step-by-step visualization of:
 * 1. Starting from the first point (index 0)
 * 2. At each step, walking to the nearest unvisited point
 * 3. Building the tour incrementally (self-avoiding walk)
 * 4. Completing when all points are visited
 *
 * The walk is "self-avoiding" because it never revisits a point,
 * forming a valid Hamiltonian path through all given points.
 *
 * @see https://en.wikipedia.org/wiki/Self-avoiding_walk
 *
 * Time Complexity: O(n²)
 * Space Complexity: O(n)
 */

import { distance } from '../../utils.js';

// Re-export atomic function for backward compatibility
export { sawSolution } from '../../atomic/solution/saw.js';

/**
 * Generate step-by-step solution using Self-Avoiding Walk algorithm.
 * At each step, walks to the nearest unvisited point.
 *
 * @param {Array<{x: number, y: number, id: number}>} points - Array of points
 * @returns {Array<Object>} Array of steps for visualization
 */
export const sawAlgorithmSteps = (points) => {
  if (points.length === 0) {
    return [];
  }

  const steps = [];
  const tour = [];
  const visited = new Set();

  // Start from point 0
  let current = 0;
  tour.push(current);
  visited.add(current);

  const progress = ((1 / points.length) * 100).toFixed(1);
  const pt = points[current];
  steps.push({
    type: 'walk',
    tour: [...tour],
    description: `Progress: ${progress}% | Start at Point ${current} (${pt.x}, ${pt.y})`,
    currentPoint: current,
  });

  // Walk to nearest unvisited point at each step
  while (visited.size < points.length) {
    let bestIdx = null;
    let bestDist = Infinity;

    for (let i = 0; i < points.length; i++) {
      if (visited.has(i)) {
        continue;
      }
      const d = distance(points[current], points[i]);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }

    if (bestIdx === null) {
      break;
    }

    tour.push(bestIdx);
    visited.add(bestIdx);
    current = bestIdx;

    const stepProgress = ((visited.size / points.length) * 100).toFixed(1);
    const stepPt = points[current];
    steps.push({
      type: 'walk',
      tour: [...tour],
      description: `Progress: ${stepProgress}% | Walk to Point ${current} (${stepPt.x}, ${stepPt.y}) | Distance: ${bestDist.toFixed(1)}`,
      currentPoint: current,
    });
  }

  return steps;
};

export default sawAlgorithmSteps;
