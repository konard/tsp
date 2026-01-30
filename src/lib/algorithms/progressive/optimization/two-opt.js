/**
 * Progressive 2-opt Optimization for TSP
 *
 * This optimization improves any initial tour using the standard
 * 2-opt algorithm, which iteratively reverses segments of the tour to reduce
 * total distance. Provides step-by-step visualization.
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
  twoOpt,
  mooreOptimization,
} from '../../atomic/optimization/two-opt.js';

/**
 * Generate step-by-step optimization using 2-opt
 *
 * @param {Array<{x: number, y: number}>} points - Array of points
 * @param {number[]} initialTour - Initial tour to optimize
 * @param {Object} options - Optional configuration
 * @param {number} options.maxIterations - Maximum optimization iterations (default: 50)
 * @returns {Array<Object>} Array of optimization steps
 */
export const twoOptSteps = (points, initialTour, options = {}) => {
  const { maxIterations = 50 } = options;

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
          // Reverse the segment between i+1 and j
          const segment = tour.slice(i + 1, j + 1).reverse();
          tour.splice(i + 1, j - i, ...segment);

          steps.push({
            type: 'optimize',
            tour: [...tour],
            reversed: [i + 1, j],
            improvement: currentDist - newDist,
            description: `2-opt: reversed segment [${i + 1}, ${j}], saved ${(currentDist - newDist).toFixed(2)} units`,
          });

          improved = true;
          break;
        }
      }
      if (improved) {
        break;
      }
    }
  }

  return steps;
};

// Legacy aliases for backward compatibility
export const mooreOptimizationSteps = twoOptSteps;

export default twoOptSteps;
