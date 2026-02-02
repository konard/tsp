/**
 * Progressive k-opt Optimization for TSP
 *
 * A generalized k-opt optimization that applies 2-opt and 3-opt
 * optimizations iteratively. Provides step-by-step visualization.
 *
 * This is a generic optimization that works with any TSP tour regardless of
 * how the initial solution was constructed.
 *
 * Time Complexity: O(n^3) worst case (dominated by 3-opt passes)
 * Space Complexity: O(n)
 */

// Re-export atomic function for convenience
export { kOpt } from '../../atomic/optimization/k-opt.js';

import { twoOptSteps } from './two-opt.js';
import { threeOptSteps } from './three-opt.js';

/**
 * Generate step-by-step optimization using k-opt
 *
 * @param {Array<{x: number, y: number}>} points - Array of points
 * @param {number[]} initialTour - Initial tour to optimize
 * @param {Object} options - Optional configuration
 * @param {number} options.k - The k value for k-opt (default: 3, min: 2, max: 5)
 * @param {number} options.maxRounds - Maximum optimization rounds (default: 50)
 * @param {number} options.maxIterations - Max iterations per pass (default: 50)
 * @returns {Array<Object>} Array of optimization steps
 */
export const kOptSteps = (points, initialTour, options = {}) => {
  const { k = 3, maxRounds = 50, maxIterations = 50 } = options;
  const effectiveK = Math.max(2, Math.min(k, 5));

  if (initialTour.length < 4) {
    return [];
  }

  const allSteps = [];
  let tour = [...initialTour];
  let improved = true;
  let round = 0;

  while (improved && round < maxRounds) {
    improved = false;
    round++;

    // Apply 2-opt steps
    const twoSteps = twoOptSteps(points, tour, { maxIterations });
    if (twoSteps.length > 0) {
      allSteps.push(...twoSteps);
      tour = twoSteps[twoSteps.length - 1].tour;
      improved = true;
    }

    // Apply 3-opt steps if k >= 3
    if (effectiveK >= 3 && tour.length >= 6) {
      const threeSteps = threeOptSteps(points, tour, {
        maxIterations: Math.min(maxIterations, 20),
      });
      if (threeSteps.length > 0) {
        allSteps.push(...threeSteps);
        tour = threeSteps[threeSteps.length - 1].tour;
        improved = true;
      }
    }
  }

  return allSteps;
};

export default kOptSteps;
