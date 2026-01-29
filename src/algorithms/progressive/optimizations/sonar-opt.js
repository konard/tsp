/**
 * Sonar Optimization (Zigzag 2-opt style)
 *
 * This optimization improves the initial Sonar tour by swapping adjacent point pairs
 * when doing so reduces the total tour distance.
 *
 * Time Complexity: O(n^2) worst case
 * Space Complexity: O(n)
 */

import { distance } from '../../utils.js';

/**
 * Generate step-by-step optimization using zigzag swapping
 *
 * @param {Array<{x: number, y: number}>} points - Array of points
 * @param {number[]} initialTour - Initial tour to optimize
 * @returns {Array<Object>} Array of optimization steps
 */
export const sonarOptimizationSteps = (points, initialTour) => {
  if (initialTour.length < 4) {
    return [];
  }

  const steps = [];
  const tour = [...initialTour];
  let improved = true;
  let iteration = 0;
  const maxIterations = 100;

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

/**
 * Optimize tour in one step (atomic version)
 * Returns the optimized tour without intermediate steps
 *
 * @param {Array<{x: number, y: number}>} points - Array of points
 * @param {number[]} initialTour - Initial tour to optimize
 * @returns {{tour: number[], improvement: number}} Optimized tour and total improvement
 */
export const sonarOptimization = (points, initialTour) => {
  if (initialTour.length < 4) {
    return { tour: [...initialTour], improvement: 0 };
  }

  const tour = [...initialTour];
  let totalImprovement = 0;
  let improved = true;
  let iteration = 0;
  const maxIterations = 100;

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
        const idx2 = (i + 1) % tour.length;
        const idx3 = (i + 2) % tour.length;
        [tour[idx2], tour[idx3]] = [tour[idx3], tour[idx2]];
        totalImprovement += currentDist - newDist;
        improved = true;
      }
    }
  }

  return { tour, improvement: totalImprovement };
};

export default sonarOptimizationSteps;
