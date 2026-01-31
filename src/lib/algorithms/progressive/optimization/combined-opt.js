/**
 * Progressive Combined Optimization for TSP
 *
 * Alternates between zigzag and 2-opt optimizations in a loop
 * until no more improvements can be made by either method.
 * Provides step-by-step visualization.
 *
 * This is a generic optimization that works with any TSP tour regardless of
 * how the initial solution was constructed.
 *
 * Time Complexity: O(n^3) worst case (multiple passes of O(n^2) optimizations)
 * Space Complexity: O(n)
 */

// Re-export atomic function for convenience
export { combinedOpt } from '../../atomic/optimization/combined-opt.js';

import { twoOptSteps } from './two-opt.js';
import { zigzagOptSteps } from './zigzag-opt.js';

/**
 * Generate step-by-step optimization using combined zigzag + 2-opt.
 * Alternates between zigzag and 2-opt until neither produces improvement.
 *
 * @param {Array<{x: number, y: number}>} points - Array of points
 * @param {number[]} initialTour - Initial tour to optimize
 * @param {Object} options - Optional configuration
 * @param {number} options.maxRounds - Maximum alternation rounds (default: 100)
 * @param {number} options.maxIterations - Maximum iterations per optimization pass (default: 50)
 * @returns {Array<Object>} Array of optimization steps
 */
export const combinedOptSteps = (points, initialTour, options = {}) => {
  const { maxRounds = 100, maxIterations = 50 } = options;

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

    // Apply zigzag optimization steps
    const zigzagSteps = zigzagOptSteps(points, tour, { maxIterations });
    if (zigzagSteps.length > 0) {
      allSteps.push(...zigzagSteps);
      tour = zigzagSteps[zigzagSteps.length - 1].tour;
      improved = true;
    }

    // Apply 2-opt optimization steps
    const twoOptStepsResult = twoOptSteps(points, tour, { maxIterations });
    if (twoOptStepsResult.length > 0) {
      allSteps.push(...twoOptStepsResult);
      tour = twoOptStepsResult[twoOptStepsResult.length - 1].tour;
      improved = true;
    }
  }

  return allSteps;
};

export default combinedOptSteps;
