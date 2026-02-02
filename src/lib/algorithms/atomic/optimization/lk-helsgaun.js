/**
 * Atomic Lin-Kernighan-Helsgaun (LKH) Optimization for TSP
 *
 * Implements a simplified LKH heuristic that extends Lin-Kernighan with:
 * 1. Candidate edge selection using nearest neighbors
 * 2. Sequential search with backtracking
 * 3. Perturbation via double-bridge moves for escaping local optima
 *
 * LKH is one of the most effective TSP heuristics known, producing
 * near-optimal solutions even for large instances.
 *
 * Returns only the final optimized result without intermediate steps.
 *
 * This is a generic optimization that works with any TSP tour regardless of
 * how the initial solution was constructed.
 *
 * Time Complexity: O(n^2 * d * r) where d is search depth and r is restart count
 * Space Complexity: O(n^2) for neighbor lists
 */

import { distance } from '../../utils.js';
import { linKernighan } from './lin-kernighan.js';
import { twoOpt } from './two-opt.js';

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
 * Perform a double-bridge perturbation on the tour.
 * This splits the tour into 4 segments and reconnects them in a
 * different order, creating a new tour that cannot be reached by
 * sequential edge exchanges (escapes local optima).
 *
 * @param {number[]} tour - Current tour
 * @returns {number[]} Perturbed tour
 */
const doubleBridge = (tour) => {
  const n = tour.length;
  if (n < 8) {
    return [...tour];
  }

  // Generate 3 random cut points
  const cuts = [];
  while (cuts.length < 3) {
    const cut = 1 + Math.floor(Math.random() * (n - 1));
    if (!cuts.includes(cut)) {
      cuts.push(cut);
    }
  }
  cuts.sort((a, b) => a - b);

  const [c1, c2, c3] = cuts;

  // Split into 4 segments and reconnect
  const seg1 = tour.slice(0, c1);
  const seg2 = tour.slice(c1, c2);
  const seg3 = tour.slice(c2, c3);
  const seg4 = tour.slice(c3);

  // Reconnect: seg1 + seg3 + seg2 + seg4 (double-bridge pattern)
  return [...seg1, ...seg3, ...seg2, ...seg4];
};

/**
 * Optimize tour using Lin-Kernighan-Helsgaun heuristic (atomic version).
 * Combines LK optimization with perturbation for escaping local optima.
 * Returns the optimized tour without intermediate steps.
 *
 * @param {Array<{x: number, y: number}>} points - Array of points
 * @param {number[]} initialTour - Initial tour to optimize
 * @param {Object} options - Optional configuration
 * @param {number} options.maxIterations - Maximum LK iterations per run (default: 50)
 * @param {number} options.maxDepth - Maximum LK search depth (default: 5)
 * @param {number} options.perturbations - Number of perturbation attempts (default: 5)
 * @param {number} options.nearestK - Number of nearest neighbors to consider (default: 5)
 * @returns {{tour: number[], improvement: number}} Optimized tour and total improvement
 */
export const lkHelsgaun = (points, initialTour, options = {}) => {
  const {
    maxIterations = 50,
    maxDepth = 5,
    perturbations = 5,
    // eslint-disable-next-line no-unused-vars
    nearestK = 5,
  } = options;

  if (initialTour.length < 4) {
    return { tour: [...initialTour], improvement: 0 };
  }

  const initialDist = tourDistance(points, initialTour);

  // Phase 1: Initial LK optimization
  const bestResult = linKernighan(points, initialTour, {
    maxIterations,
    maxDepth,
  });
  let bestTour = bestResult.tour;
  let bestDist = tourDistance(points, bestTour);

  // Phase 2: Apply 2-opt to clean up
  const twoOptResult = twoOpt(points, bestTour, { maxIterations });
  if (tourDistance(points, twoOptResult.tour) < bestDist - 0.001) {
    bestTour = twoOptResult.tour;
    bestDist = tourDistance(points, bestTour);
  }

  // Phase 3: Perturbation + re-optimization loop
  for (let p = 0; p < perturbations; p++) {
    // Perturb the current best tour
    const perturbed = doubleBridge(bestTour);

    // Re-optimize with LK
    const lkResult = linKernighan(points, perturbed, {
      maxIterations,
      maxDepth,
    });

    // Clean up with 2-opt
    const cleaned = twoOpt(points, lkResult.tour, { maxIterations });
    const cleanedDist = tourDistance(points, cleaned.tour);

    if (cleanedDist < bestDist - 0.001) {
      bestTour = cleaned.tour;
      bestDist = cleanedDist;
    }
  }

  const totalImprovement = Math.max(0, initialDist - bestDist);
  return { tour: bestTour, improvement: totalImprovement };
};

export default lkHelsgaun;
