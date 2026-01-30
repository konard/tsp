/**
 * Atomic 2-opt Optimization for TSP
 *
 * Improves any initial tour using the standard 2-opt algorithm,
 * which iteratively reverses segments of the tour to reduce total distance.
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
 * Optimize tour using 2-opt (atomic version).
 * Returns the optimized tour without intermediate steps.
 *
 * @param {Array<{x: number, y: number}>} points - Array of points
 * @param {number[]} initialTour - Initial tour to optimize
 * @param {Object} options - Optional configuration
 * @param {number} options.maxIterations - Maximum optimization iterations (default: 50)
 * @returns {{tour: number[], improvement: number}} Optimized tour and total improvement
 */
export const twoOpt = (points, initialTour, options = {}) => {
  const { maxIterations = 50 } = options;

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

    for (let i = 0; i < tour.length - 1; i++) {
      for (let j = i + 2; j < tour.length; j++) {
        if (i === 0 && j === tour.length - 1) {
          continue;
        }

        const a = points[tour[i]];
        const b = points[tour[i + 1]];
        const c = points[tour[j]];
        const d = points[tour[(j + 1) % tour.length]];

        const currentDist = distance(a, b) + distance(c, d);
        const newDist = distance(a, c) + distance(b, d);

        if (newDist < currentDist - 0.001) {
          const segment = tour.slice(i + 1, j + 1).reverse();
          tour.splice(i + 1, j - i, ...segment);
          totalImprovement += currentDist - newDist;
          improved = true;
          break;
        }
      }
      if (improved) {
        break;
      }
    }
  }

  return { tour, improvement: totalImprovement };
};

// Legacy aliases for backward compatibility
export const mooreOptimization = twoOpt;

export default twoOpt;
