/**
 * Atomic Zigzag Optimization (Adjacent Pair Swap) for TSP
 *
 * Improves any initial tour by swapping adjacent point pairs
 * when doing so reduces the total tour distance.
 * Returns only the final optimized result without intermediate steps.
 *
 * This is a generic optimization that works with any TSP tour regardless of
 * how the initial solution was constructed.
 *
 * Time Complexity: O(n^2) worst case
 * Space Complexity: O(n)
 */

import { distance } from '../../utils.js';

/**
 * Optimize tour using zigzag swapping (atomic version).
 * Returns the optimized tour without intermediate steps.
 *
 * @param {Array<{x: number, y: number}>} points - Array of points
 * @param {number[]} initialTour - Initial tour to optimize
 * @param {Object} options - Optional configuration
 * @param {number} options.maxIterations - Maximum optimization iterations (default: 100)
 * @returns {{tour: number[], improvement: number}} Optimized tour and total improvement
 */
export const zigzagOpt = (points, initialTour, options = {}) => {
  const { maxIterations = 100 } = options;

  if (initialTour.length < 4) {
    return { tour: [...initialTour], improvement: 0 };
  }

  const tour = [...initialTour];
  let totalImprovement = 0;
  let improved = true;
  let iteration = 0;

  while (improved && iteration < maxIterations) {
    improved = false;
    iteration++;

    for (let i = 0; i < tour.length - 2; i++) {
      const p1 = points[tour[i]];
      const p2 = points[tour[i + 1]];
      const p3 = points[tour[(i + 2) % tour.length]];
      const p4 = points[tour[(i + 3) % tour.length]];

      const currentDist = distance(p1, p2) + distance(p3, p4);
      const newDist = distance(p1, p3) + distance(p2, p4);

      if (newDist < currentDist - 0.001) {
        const idx2 = (i + 1) % tour.length;
        const idx3 = (i + 2) % tour.length;
        [tour[idx2], tour[idx3]] = [tour[idx3], tour[idx2]];
        totalImprovement += currentDist - newDist;
        improved = true;
      }
    }
  }

  return { tour, improvement: totalImprovement };
};

// Legacy aliases for backward compatibility
export const sonarOptimization = zigzagOpt;

export default zigzagOpt;
