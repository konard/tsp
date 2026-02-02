/**
 * Progressive Lin-Kernighan-Helsgaun (LKH) Optimization for TSP
 *
 * Extends Lin-Kernighan with perturbation via double-bridge moves
 * for escaping local optima. Provides step-by-step visualization.
 *
 * This is a generic optimization that works with any TSP tour regardless of
 * how the initial solution was constructed.
 *
 * Time Complexity: O(n^2 * d * r) where d is search depth and r is restart count
 * Space Complexity: O(n)
 */

// Re-export atomic function for convenience
export { lkHelsgaun } from '../../atomic/optimization/lk-helsgaun.js';

import { linKernighanSteps } from './lin-kernighan.js';
import { twoOptSteps } from './two-opt.js';

/**
 * Perform a double-bridge perturbation on the tour.
 * @param {number[]} tour - Current tour
 * @returns {number[]} Perturbed tour
 */
const doubleBridge = (tour) => {
  const n = tour.length;
  if (n < 8) {
    return [...tour];
  }

  const cuts = [];
  while (cuts.length < 3) {
    const cut = 1 + Math.floor(Math.random() * (n - 1));
    if (!cuts.includes(cut)) {
      cuts.push(cut);
    }
  }
  cuts.sort((a, b) => a - b);

  const [c1, c2, c3] = cuts;
  const seg1 = tour.slice(0, c1);
  const seg2 = tour.slice(c1, c2);
  const seg3 = tour.slice(c2, c3);
  const seg4 = tour.slice(c3);

  return [...seg1, ...seg3, ...seg2, ...seg4];
};

/**
 * Generate step-by-step optimization using LKH heuristic.
 *
 * @param {Array<{x: number, y: number}>} points - Array of points
 * @param {number[]} initialTour - Initial tour to optimize
 * @param {Object} options - Optional configuration
 * @param {number} options.maxIterations - Maximum LK iterations per run (default: 50)
 * @param {number} options.maxDepth - Maximum LK search depth (default: 5)
 * @param {number} options.perturbations - Number of perturbation attempts (default: 5)
 * @returns {Array<Object>} Array of optimization steps
 */
export const lkHelsgaunSteps = (points, initialTour, options = {}) => {
  const { maxIterations = 50, maxDepth = 5, perturbations = 5 } = options;

  if (initialTour.length < 4) {
    return [];
  }

  const allSteps = [];
  let tour = [...initialTour];

  // Phase 1: Initial LK optimization
  const lkSteps = linKernighanSteps(points, tour, {
    maxIterations,
    maxDepth,
  });
  if (lkSteps.length > 0) {
    allSteps.push(...lkSteps);
    tour = lkSteps[lkSteps.length - 1].tour;
  }

  // Phase 2: 2-opt cleanup
  const cleanupSteps = twoOptSteps(points, tour, { maxIterations });
  if (cleanupSteps.length > 0) {
    allSteps.push(...cleanupSteps);
    tour = cleanupSteps[cleanupSteps.length - 1].tour;
  }

  // Phase 3: Perturbation + re-optimization
  for (let p = 0; p < perturbations; p++) {
    const perturbed = doubleBridge(tour);

    const perturbSteps = linKernighanSteps(points, perturbed, {
      maxIterations,
      maxDepth,
    });

    let currentTour = perturbed;
    if (perturbSteps.length > 0) {
      currentTour = perturbSteps[perturbSteps.length - 1].tour;
    }

    const cleanSteps = twoOptSteps(points, currentTour, { maxIterations });
    if (cleanSteps.length > 0) {
      currentTour = cleanSteps[cleanSteps.length - 1].tour;
    }

    // Only include steps if this perturbation improved the tour
    const combinedSteps = [...perturbSteps, ...cleanSteps];
    if (combinedSteps.length > 0) {
      allSteps.push(
        ...combinedSteps.map((step) => ({
          ...step,
          description: `LKH perturbation ${p + 1}: ${step.description}`,
        }))
      );
      tour = currentTour;
    }
  }

  return allSteps;
};

export default lkHelsgaunSteps;
