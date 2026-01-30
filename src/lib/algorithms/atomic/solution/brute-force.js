/**
 * Atomic Brute-Force Solution for TSP
 *
 * Finds the true optimal (shortest) tour by evaluating all possible
 * permutations. Returns only the final result without intermediate steps.
 *
 * For n points, there are (n-1)!/2 unique tours (fixing start point,
 * considering both directions as equivalent).
 *
 * Time Complexity: O(n!)
 * Space Complexity: O(n)
 *
 * Practical limits:
 * - n <= 10: instant (< 1ms)
 * - n <= 12: fast (< 100ms)
 * - n <= 14: slow (< 10s)
 * - n > 14: impractical
 */

import { distance } from '../../utils.js';

/**
 * Maximum number of points for brute-force computation.
 * Beyond this, the computation becomes impractical.
 */
export const BRUTE_FORCE_MAX_POINTS = 12;

/**
 * Compute brute-force solution (atomic — returns final result only).
 * Finds the globally optimal TSP tour by exhaustive permutation search.
 *
 * @param {Array<{x: number, y: number}>} points - Array of points
 * @returns {{tour: number[], distance: number} | null} Optimal tour and its distance,
 *   or null if too many points for brute-force
 */
export const bruteForceSolution = (points) => {
  if (points.length <= 1) {
    return {
      tour: points.length === 1 ? [0] : [],
      distance: 0,
    };
  }

  if (points.length === 2) {
    return {
      tour: [0, 1],
      distance: 2 * distance(points[0], points[1]),
    };
  }

  if (points.length > BRUTE_FORCE_MAX_POINTS) {
    return null;
  }

  // Fix first point as 0, permute the rest
  const remaining = [];
  for (let i = 1; i < points.length; i++) {
    remaining.push(i);
  }

  let bestTour = null;
  let bestDistance = Infinity;

  const permute = (arr, start) => {
    if (start === arr.length) {
      let totalDist = 0;
      let prev = 0;
      for (let i = 0; i < arr.length; i++) {
        totalDist += distance(points[prev], points[arr[i]]);
        prev = arr[i];
        if (totalDist >= bestDistance) {
          return;
        }
      }
      totalDist += distance(points[prev], points[0]);

      if (totalDist < bestDistance) {
        bestDistance = totalDist;
        bestTour = [0, ...arr];
      }
      return;
    }

    for (let i = start; i < arr.length; i++) {
      [arr[start], arr[i]] = [arr[i], arr[start]];
      permute(arr, start + 1);
      [arr[start], arr[i]] = [arr[i], arr[start]];
    }
  };

  permute(remaining, 0);

  return {
    tour: bestTour,
    distance: bestDistance,
  };
};

/**
 * Calculate the ratio of a tour's distance to the optimal distance.
 *
 * @param {number} tourDistance - Distance of the tour to evaluate
 * @param {number} optimalDistance - Known optimal tour distance
 * @returns {number} Ratio (1.0 = optimal, higher = worse)
 */
export const calculateOptimalityRatio = (tourDistance, optimalDistance) => {
  if (optimalDistance === 0) {
    return tourDistance === 0 ? 1.0 : Infinity;
  }
  return tourDistance / optimalDistance;
};

export default bruteForceSolution;
