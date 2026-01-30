/**
 * Verification Algorithms - Compute true optimal tours
 *
 * These algorithms compute the exact optimal solution for TSP,
 * providing ground truth for evaluating heuristic algorithms.
 */

export {
  bruteForceOptimalTour,
  bruteForceSteps,
  calculateOptimalityRatio,
  BRUTE_FORCE_MAX_POINTS,
} from './brute-force.js';
