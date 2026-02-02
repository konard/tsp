/**
 * Atomic k-opt Optimization for TSP
 *
 * A generalized k-opt optimization that applies 2-opt and 3-opt
 * optimizations iteratively. For k=2, uses 2-opt; for k=3, uses 3-opt;
 * for k>3, alternates between 2-opt and 3-opt passes since pure k-opt
 * for k>3 is computationally impractical.
 *
 * Returns only the final optimized result without intermediate steps.
 *
 * This is a generic optimization that works with any TSP tour regardless of
 * how the initial solution was constructed.
 *
 * Time Complexity: O(n^3) worst case (dominated by 3-opt passes)
 * Space Complexity: O(n)
 */

import { twoOpt } from './two-opt.js';
import { threeOpt } from './three-opt.js';

/**
 * Optimize tour using k-opt (atomic version).
 * Applies iterative k-opt optimization with configurable k value.
 * Returns the optimized tour without intermediate steps.
 *
 * @param {Array<{x: number, y: number}>} points - Array of points
 * @param {number[]} initialTour - Initial tour to optimize
 * @param {Object} options - Optional configuration
 * @param {number} options.k - The k value for k-opt (default: 3, min: 2, max: 5)
 * @param {number} options.maxRounds - Maximum optimization rounds (default: 50)
 * @param {number} options.maxIterations - Max iterations per pass (default: 50)
 * @returns {{tour: number[], improvement: number}} Optimized tour and total improvement
 */
export const kOpt = (points, initialTour, options = {}) => {
  const { k = 3, maxRounds = 50, maxIterations = 50 } = options;
  const effectiveK = Math.max(2, Math.min(k, 5));

  if (initialTour.length < 4) {
    return { tour: [...initialTour], improvement: 0 };
  }

  let tour = [...initialTour];
  let totalImprovement = 0;
  let improved = true;
  let round = 0;

  while (improved && round < maxRounds) {
    improved = false;
    round++;

    // Always apply 2-opt
    const twoOptResult = twoOpt(points, tour, { maxIterations });
    if (twoOptResult.improvement > 0.001) {
      tour = twoOptResult.tour;
      totalImprovement += twoOptResult.improvement;
      improved = true;
    }

    // Apply 3-opt if k >= 3 and tour is large enough
    if (effectiveK >= 3 && tour.length >= 6) {
      const threeOptResult = threeOpt(points, tour, {
        maxIterations: Math.min(maxIterations, 20),
      });
      if (threeOptResult.improvement > 0.001) {
        tour = threeOptResult.tour;
        totalImprovement += threeOptResult.improvement;
        improved = true;
      }
    }
  }

  return { tour, improvement: totalImprovement };
};

export default kOpt;
