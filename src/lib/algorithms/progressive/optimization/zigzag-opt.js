/**
 * Progressive Zigzag Optimization (Adjacent Pair Swap) for TSP
 *
 * This optimization improves any initial tour by swapping adjacent point pairs
 * when doing so reduces the total tour distance.
 * Provides step-by-step visualization.
 *
 * This is a generic optimization that works with any TSP tour regardless of
 * how the initial solution was constructed.
 *
 * Time Complexity: O(n^2) worst case
 * Space Complexity: O(n)
 */

import { distance } from '../../utils.js';

// Re-export atomic functions for backward compatibility
export {
  zigzagOpt,
  sonarOptimization,
} from '../../atomic/optimization/zigzag-opt.js';

/**
 * Generate step-by-step optimization using zigzag swapping
 *
 * @param {Array<{x: number, y: number}>} points - Array of points
 * @param {number[]} initialTour - Initial tour to optimize
 * @param {Object} options - Optional configuration
 * @param {number} options.maxIterations - Maximum optimization iterations (default: 100)
 * @returns {Array<Object>} Array of optimization steps
 */
export const zigzagOptSteps = (points, initialTour, options = {}) => {
  const { maxIterations = 100 } = options;

  if (initialTour.length < 4) {
    return [];
  }

  const steps = [];
  const tour = [...initialTour];
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
        // Swap p2 and p3 positions in tour
        const idx2 = (i + 1) % tour.length;
        const idx3 = (i + 2) % tour.length;
        [tour[idx2], tour[idx3]] = [tour[idx3], tour[idx2]];

        steps.push({
          type: 'optimize',
          tour: [...tour],
          swapped: [tour[idx2], tour[idx3]],
          improvement: currentDist - newDist,
          description: `Zigzag optimization: swapped points, saved ${(currentDist - newDist).toFixed(2)} units`,
        });

        improved = true;
      }
    }
  }

  return steps;
};

// Legacy aliases for backward compatibility
export const sonarOptimizationSteps = zigzagOptSteps;

export default zigzagOptSteps;
