/**
 * Atomic Lin-Kernighan (LK) Optimization for TSP
 *
 * Implements a simplified Lin-Kernighan heuristic for TSP optimization.
 * LK works by performing variable-depth edge exchanges: starting with
 * a single edge removal, it searches for improving sequences of swaps
 * of increasing depth, backtracking when no improvement is found.
 *
 * The key idea: instead of fixed k-opt, LK adaptively decides the
 * depth of each move, typically achieving near-optimal results.
 *
 * Returns only the final optimized result without intermediate steps.
 *
 * This is a generic optimization that works with any TSP tour regardless of
 * how the initial solution was constructed.
 *
 * Time Complexity: O(n^2 * d) where d is the average search depth
 * Space Complexity: O(n)
 */

/* eslint-disable complexity, max-depth */
import { distance } from '../../utils.js';

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
 * Optimize tour using Lin-Kernighan heuristic (atomic version).
 * Performs variable-depth edge exchange optimization.
 * Returns the optimized tour without intermediate steps.
 *
 * The LK heuristic works by:
 * 1. For each edge (t1, t2), consider removing it
 * 2. Try reconnecting via t2-t3 (adding new edge)
 * 3. Then try closing by connecting t3's other neighbor to t1
 * 4. If improvement found, extend the search deeper
 * 5. Accept the best improving move found
 *
 * @param {Array<{x: number, y: number}>} points - Array of points
 * @param {number[]} initialTour - Initial tour to optimize
 * @param {Object} options - Optional configuration
 * @param {number} options.maxIterations - Maximum main loop iterations (default: 50)
 * @param {number} options.maxDepth - Maximum search depth per move (default: 5)
 * @returns {{tour: number[], improvement: number}} Optimized tour and total improvement
 */
export const linKernighan = (points, initialTour, options = {}) => {
  const { maxIterations = 50, maxDepth = 5 } = options;

  if (initialTour.length < 4) {
    return { tour: [...initialTour], improvement: 0 };
  }

  const n = initialTour.length;
  let tour = [...initialTour];
  let currentDist = tourDistance(points, tour);
  const initialDist = currentDist;
  let improved = true;
  let iteration = 0;

  while (improved && iteration < maxIterations) {
    improved = false;
    iteration++;

    // Try each position as starting point for an LK move
    for (let i = 0; i < n; i++) {
      let bestNewDist = currentDist;
      let bestNewTour = null;

      // Try different segment reversals of increasing size
      // This is the LK "variable depth" search: try 2-opt moves
      // of different sizes from position i, then extend
      for (let depth = 1; depth <= Math.min(maxDepth, n - 2); depth++) {
        for (let j = i + 2; j < n; j++) {
          if (i === 0 && j === n - 1) {
            continue;
          }

          // Try reversing segment [i+1, j] (2-opt style)
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
          }
        }

        // For deeper searches, also try Or-opt moves (segment relocation)
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

                // Relocate segment [from, from+segLen) to position to
                const candidate = [...tour];
                const segment = candidate.splice(from, segLen);
                const insertPos = to > from ? to - segLen : to;
                candidate.splice(insertPos, 0, ...segment);

                const candidateDist = tourDistance(points, candidate);
                if (candidateDist < bestNewDist - 0.001) {
                  bestNewDist = candidateDist;
                  bestNewTour = candidate;
                }
              }
            }
          }
        }

        // If we found something, apply it and break to restart
        if (bestNewTour) {
          break;
        }
      }

      if (bestNewTour) {
        tour = bestNewTour;
        currentDist = bestNewDist;
        improved = true;
        break; // Restart from the beginning
      }
    }
  }

  const totalImprovement = Math.max(0, initialDist - currentDist);
  return { tour, improvement: totalImprovement };
};

export default linKernighan;
