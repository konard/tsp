/**
 * Brute-Force Algorithm for TSP
 *
 * Also known as: Exhaustive Search, Exact TSP Solver, Permutation Enumeration
 *
 * This algorithm finds the true optimal (shortest) tour by evaluating all
 * possible permutations. It provides step-by-step visualization showing
 * each permutation being evaluated.
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

import { distance } from '../../utils.js';

/**
 * Maximum number of points for brute-force computation.
 * Beyond this, the computation becomes impractical.
 */
export const BRUTE_FORCE_MAX_POINTS = 12;

/**
 * Generate step-by-step brute-force solution for visualization.
 *
 * Shows each improvement found during the exhaustive search,
 * ending with the final optimal tour.
 *
 * @param {Array<{x: number, y: number}>} points - Array of points
 * @returns {Array<Object>} Array of steps for visualization
 */
export const bruteForceAlgorithmSteps = (points) => {
  if (points.length === 0) {
    return [];
  }

  if (points.length === 1) {
    return [
      {
        type: 'solution',
        tour: [0],
        description: 'Single point — trivial tour',
      },
    ];
  }

  if (points.length > BRUTE_FORCE_MAX_POINTS) {
    return [
      {
        type: 'solution',
        tour: [],
        description: `Too many points (${points.length}) for brute-force (max ${BRUTE_FORCE_MAX_POINTS})`,
        feasible: false,
      },
    ];
  }

  const steps = [];

  if (points.length === 2) {
    steps.push({
      type: 'solution',
      tour: [0, 1],
      description: `Optimal tour found: distance ${(2 * distance(points[0], points[1])).toFixed(2)}`,
    });
    return steps;
  }

  // Fix first point as 0, permute the rest
  const remaining = [];
  for (let i = 1; i < points.length; i++) {
    remaining.push(i);
  }

  let bestTour = null;
  let bestDistance = Infinity;
  let permutationsChecked = 0;

  // First step: show initial state
  steps.push({
    type: 'solution',
    tour: [],
    description: `Starting brute-force search over ${factorial(points.length - 1)} permutations`,
  });

  // Generate all permutations of remaining points
  const permute = (arr, start) => {
    if (start === arr.length) {
      permutationsChecked++;
      // Evaluate this tour: [0, ...arr]
      let totalDist = 0;
      let prev = 0;
      let earlyExit = false;
      for (let i = 0; i < arr.length; i++) {
        totalDist += distance(points[prev], points[arr[i]]);
        prev = arr[i];
        if (totalDist >= bestDistance) {
          earlyExit = true;
          break;
        }
      }

      if (!earlyExit) {
        // Close the loop back to 0
        totalDist += distance(points[prev], points[0]);

        if (totalDist < bestDistance) {
          bestDistance = totalDist;
          bestTour = [0, ...arr];

          // Record this improvement as a step
          steps.push({
            type: 'solution',
            tour: [...bestTour],
            description: `Improvement #${steps.length}: distance ${bestDistance.toFixed(2)} (checked ${permutationsChecked} permutations)`,
          });
        }
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

  // Final step: confirm optimal
  steps.push({
    type: 'solution',
    tour: bestTour ? [...bestTour] : [],
    description: `Optimal tour: distance ${bestDistance.toFixed(2)} (exhaustive search of ${permutationsChecked} permutations)`,
  });

  return steps;
};

/**
 * Compute brute-force solution in one step (atomic version).
 * Returns the final optimal tour without intermediate steps.
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

/**
 * Compute factorial of n.
 * @param {number} n
 * @returns {number}
 */
const factorial = (n) => {
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
};

export default bruteForceAlgorithmSteps;
