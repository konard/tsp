/**
 * Verification Algorithms - Prove tour optimality
 *
 * These algorithms verify whether a given tour is optimal:
 * - Lower bound (1-tree): Computes a mathematical lower bound on the optimal tour.
 *   When tour distance equals the lower bound, the tour is proven optimal.
 *   Works for any number of points in O(n^2) time.
 *
 * Note: Brute-force exact solving has been moved to the solution algorithms
 * (progressive/solution/brute-force.js and atomic/solution/brute-force.js)
 * since it is a solution algorithm that happens to find the optimal answer.
 */

// Lower-bound verification (works for any problem size)
export { oneTreeLowerBound, verifyOptimality } from './lower-bound.js';

// Re-export brute-force functions for backward compatibility
export {
  bruteForceSolution as bruteForceOptimalTour,
  calculateOptimalityRatio,
  BRUTE_FORCE_MAX_POINTS,
} from '../atomic/solution/brute-force.js';
export { bruteForceAlgorithmSteps as bruteForceSteps } from '../progressive/solution/brute-force.js';
