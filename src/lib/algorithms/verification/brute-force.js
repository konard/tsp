/**
 * Brute-Force Optimal Tour Verification
 *
 * Computes the true optimal (shortest) TSP tour by evaluating all possible
 * permutations. This provides a ground truth for comparing heuristic solutions.
 *
 * For n points, there are (n-1)!/2 unique tours (fixing start point, considering
 * both directions as equivalent). This is only feasible for small point sets.
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

import { distance } from '../utils.js';

/**
 * Maximum number of points for brute-force verification.
 * Beyond this, the computation becomes impractical.
 */
export const BRUTE_FORCE_MAX_POINTS = 12;

/**
 * Compute the optimal (shortest) TSP tour using brute-force enumeration.
 *
 * Fixes the first point (index 0) and permutes the rest to find the
 * minimum-distance closed tour.
 *
 * @param {Array<{x: number, y: number}>} points - Array of points
 * @returns {{tour: number[], distance: number} | null} Optimal tour and its distance,
 *   or null if too many points for brute-force
 */
export const bruteForceOptimalTour = (points) => {
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

  // Generate all permutations of remaining points
  const permute = (arr, start) => {
    if (start === arr.length) {
      // Evaluate this tour: [0, ...arr]
      let totalDist = 0;
      let prev = 0;
      for (let i = 0; i < arr.length; i++) {
        totalDist += distance(points[prev], points[arr[i]]);
        prev = arr[i];
        // Early termination if already worse
        if (totalDist >= bestDistance) {
          return;
        }
      }
      // Close the loop back to 0
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
 * Compute step-by-step brute-force verification for visualization.
 *
 * Returns a single step with the optimal tour result, since brute-force
 * does not have meaningful intermediate steps for visualization.
 *
 * @param {Array<{x: number, y: number}>} points - Array of points
 * @returns {Array<Object>} Array with a single verification step
 */
export const bruteForceSteps = (points) => {
  const result = bruteForceOptimalTour(points);

  if (result === null) {
    return [
      {
        type: 'verification',
        tour: [],
        distance: 0,
        description: `Too many points (${points.length}) for brute-force verification (max ${BRUTE_FORCE_MAX_POINTS})`,
        feasible: false,
      },
    ];
  }

  return [
    {
      type: 'verification',
      tour: result.tour,
      distance: result.distance,
      description: `Optimal tour distance: ${result.distance.toFixed(2)} (verified by brute-force)`,
      feasible: true,
    },
  ];
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

export default bruteForceOptimalTour;
