/**
 * Atomic Combined Optimization for TSP
 *
 * Alternates between zigzag and 2-opt optimizations in a loop
 * until no more improvements can be made by either method.
 * Returns only the final optimized result without intermediate steps.
 *
 * This is a generic optimization that works with any TSP tour regardless of
 * how the initial solution was constructed.
 *
 * Time Complexity: O(n^3) worst case (multiple passes of O(n^2) optimizations)
 * Space Complexity: O(n)
 */

import { twoOpt } from './two-opt.js';
import { zigzagOpt } from './zigzag-opt.js';

/**
 * Optimize tour using combined zigzag + 2-opt (atomic version).
 * Alternates between zigzag and 2-opt until neither produces improvement.
 * Returns the optimized tour without intermediate steps.
 *
 * @param {Array<{x: number, y: number}>} points - Array of points
 * @param {number[]} initialTour - Initial tour to optimize
 * @param {Object} options - Optional configuration
 * @param {number} options.maxRounds - Maximum alternation rounds (default: 100)
 * @param {number} options.maxIterations - Maximum iterations per optimization pass (default: 50)
 * @returns {{tour: number[], improvement: number}} Optimized tour and total improvement
 */
export const combinedOpt = (points, initialTour, options = {}) => {
  const { maxRounds = 100, maxIterations = 50 } = options;

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

    // Apply zigzag optimization
    const zigzagResult = zigzagOpt(points, tour, { maxIterations });
    if (zigzagResult.improvement > 0.001) {
      tour = zigzagResult.tour;
      totalImprovement += zigzagResult.improvement;
      improved = true;
    }

    // Apply 2-opt optimization
    const twoOptResult = twoOpt(points, tour, { maxIterations });
    if (twoOptResult.improvement > 0.001) {
      tour = twoOptResult.tour;
      totalImprovement += twoOptResult.improvement;
      improved = true;
    }
  }

  return { tour, improvement: totalImprovement };
};

export default combinedOpt;
