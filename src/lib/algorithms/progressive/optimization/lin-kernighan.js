/**
 * Progressive Lin-Kernighan (LK) Optimization for TSP
 *
 * Implements a simplified Lin-Kernighan heuristic with step-by-step
 * visualization support. LK works by performing variable-depth edge
 * exchanges, adaptively deciding the depth of each move.
 *
 * This is a generic optimization that works with any TSP tour regardless of
 * how the initial solution was constructed.
 *
 * Time Complexity: O(n^2 * d) where d is the average search depth
 * Space Complexity: O(n)
 */

/* eslint-disable complexity, max-depth */
import { distance } from '../../utils.js';

// Re-export atomic function for convenience
export { linKernighan } from '../../atomic/optimization/lin-kernighan.js';

/**
 * Calculate the total tour distance.
 * @param {Array<{x: number, y: number}>} points
 * @param {number[]} tour
 * @returns {number}
 */
const tourDistance = (points, tour) => {
  let total = 0;
  for (let i = 0; i < tour.length; i++) {
    total += distance(points[tour[i]], points[tour[(i + 1) % tour.length]]);
  }
  return total;
};

/**
 * Generate step-by-step optimization using Lin-Kernighan heuristic.
 *
 * @param {Array<{x: number, y: number}>} points - Array of points
 * @param {number[]} initialTour - Initial tour to optimize
 * @param {Object} options - Optional configuration
 * @param {number} options.maxIterations - Maximum main loop iterations (default: 50)
 * @param {number} options.maxDepth - Maximum search depth per move (default: 5)
 * @returns {Array<Object>} Array of optimization steps
 */
export const linKernighanSteps = (points, initialTour, options = {}) => {
  const { maxIterations = 50, maxDepth = 5 } = options;

  if (initialTour.length < 4) {
    return [];
  }

  const n = initialTour.length;
  const steps = [];
  let tour = [...initialTour];
  let currentDist = tourDistance(points, tour);
  let improved = true;
  let iteration = 0;

  while (improved && iteration < maxIterations) {
    improved = false;
    iteration++;

    for (let i = 0; i < n; i++) {
      let bestNewDist = currentDist;
      let bestNewTour = null;
      let bestMoveDesc = '';

      for (let depth = 1; depth <= Math.min(maxDepth, n - 2); depth++) {
        for (let j = i + 2; j < n; j++) {
          if (i === 0 && j === n - 1) {
            continue;
          }

          const candidate = [...tour];
          let left = i + 1;
          let right = j;
          while (left < right) {
            [candidate[left], candidate[right]] = [
              candidate[right],
              candidate[left],
            ];
            left++;
            right--;
          }

          const candidateDist = tourDistance(points, candidate);
          if (candidateDist < bestNewDist - 0.001) {
            bestNewDist = candidateDist;
            bestNewTour = candidate;
            bestMoveDesc = `reversed segment [${i + 1}, ${j}]`;
          }
        }

        if (depth >= 2) {
          for (let segLen = 1; segLen <= 3; segLen++) {
            for (let from = 0; from < n; from++) {
              for (let to = 0; to < n; to++) {
                if (to >= from && to <= from + segLen) {
                  continue;
                }
                if (from + segLen > n) {
                  continue;
                }

                const candidate = [...tour];
                const segment = candidate.splice(from, segLen);
                const insertPos = to > from ? to - segLen : to;
                candidate.splice(insertPos, 0, ...segment);

                const candidateDist = tourDistance(points, candidate);
                if (candidateDist < bestNewDist - 0.001) {
                  bestNewDist = candidateDist;
                  bestNewTour = candidate;
                  bestMoveDesc = `relocated segment of ${segLen} from ${from} to ${to}`;
                }
              }
            }
          }
        }

        if (bestNewTour) {
          break;
        }
      }

      if (bestNewTour) {
        const improvement = currentDist - bestNewDist;
        tour = bestNewTour;
        currentDist = bestNewDist;

        steps.push({
          type: 'optimize',
          tour: [...tour],
          improvement,
          description: `LK: ${bestMoveDesc}, saved ${improvement.toFixed(2)} units`,
        });

        improved = true;
        break;
      }
    }
  }

  return steps;
};

export default linKernighanSteps;
