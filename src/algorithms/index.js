/**
 * TSP Algorithms Library
 *
 * This module provides two types of TSP algorithms:
 *
 * 1. Progressive (step-by-step) - Returns arrays of steps for visualization/animation
 * 2. Atomic (all-at-once) - Returns final result directly
 *
 * Each type includes:
 * - Solutions: Initial tour construction algorithms (Sonar, Moore)
 * - Optimizations: Generic tour improvement algorithms (2-opt, Zigzag)
 *
 * Available solution algorithms:
 * - Sonar (Radial Sweep): Sorts points by polar angle from centroid
 * - Moore Curve: Orders points along a space-filling curve
 *
 * Available optimizations (generic, work with any tour):
 * - 2-opt: Standard segment reversal optimization
 * - Zigzag: Adjacent pair swapping optimization
 *
 * @example
 * // Progressive (for visualization)
 * import { sonarAlgorithmSteps, twoOptSteps } from './algorithms';
 * const solutionSteps = sonarAlgorithmSteps(points);
 * const optSteps = twoOptSteps(points, tour);
 *
 * @example
 * // Atomic (for direct computation)
 * import { sonarSolution } from './algorithms/atomic';
 * import { twoOpt } from './algorithms/atomic';
 * const { tour } = sonarSolution(points);
 * const optimized = twoOpt(points, tour);
 */

// Utility functions
export * from './utils.js';

// Progressive algorithms (step-by-step)
export * as progressive from './progressive/index.js';

// Atomic algorithms (all-at-once)
export * as atomic from './atomic/index.js';

// Export progressive functions at top level for convenience
export {
  // Solutions
  sonarAlgorithmSteps,
  mooreAlgorithmSteps,
  generateMooreCurve,
  mooreCurveToPoints,
  // Generic optimizations
  twoOptSteps,
  zigzagOptSteps,
  // Legacy aliases for backward compatibility
  sonarOptimizationSteps,
  mooreOptimizationSteps,
} from './progressive/index.js';
