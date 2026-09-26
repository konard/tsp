/**
 * Verification Algorithms - Prove tour optimality
 *
 * These algorithms verify whether a given tour is optimal:
 * - Lower bounds (1-tree and control zones): Compute mathematical lower bounds.
 *   When tour distance equals the lower bound, the tour is proven optimal.
 *   Work for any number of points in O(n^2) time.
 *
 * Note: Brute-force exact solving has been moved to the solution algorithms
 * (progressive/solution/brute-force.js and atomic/solution/brute-force.js)
 * since it is a solution algorithm that happens to find the optimal answer.
 */

// Lower-bound verification (works for any problem size)
export { oneTreeLowerBound, verifyOptimality } from './lower-bound.js';
export { controlZoneLowerBound } from './control-zone-bound.js';
export {
  minimumCut,
  globalMinimumCut,
  subtourCut,
  combCut,
  findSimpleBlossoms,
  solveTspRelaxation,
  branchAndCut,
} from './tsp-lp.js';
export {
  optimalControlZoneLowerBound,
  zoneAndMoatLowerBound,
} from './zone-moat-bound.js';

// Re-export brute-force functions for backward compatibility
export {
  bruteForceSolution as bruteForceOptimalTour,
  calculateOptimalityRatio,
  BRUTE_FORCE_MAX_POINTS,
} from '../atomic/solution/brute-force.js';
export { bruteForceAlgorithmSteps as bruteForceSteps } from '../progressive/solution/brute-force.js';
