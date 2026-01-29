/**
 * TSP Algorithms Library
 *
 * This module provides two types of TSP algorithms:
 *
 * 1. Progressive (step-by-step) - Returns arrays of steps for visualization/animation
 * 2. Atomic (all-at-once) - Returns final result directly
 *
 * Each type includes:
 * - Solutions: Initial tour construction algorithms
 * - Optimizations: Tour improvement algorithms
 *
 * Available algorithms:
 * - Sonar (Radial Sweep): Sorts points by polar angle from centroid
 * - Moore Curve: Orders points along a space-filling curve
 *
 * @example
 * // Progressive (for visualization)
 * import { sonarAlgorithmSteps, mooreAlgorithmSteps } from './algorithms';
 * const steps = sonarAlgorithmSteps(points);
 *
 * @example
 * // Atomic (for direct computation)
 * import { sonarSolution, mooreSolution } from './algorithms/atomic';
 * const { tour } = sonarSolution(points);
 */

// Utility functions
export * from './utils.js';

// Progressive algorithms (step-by-step)
export * as progressive from './progressive/index.js';

// Atomic algorithms (all-at-once)
export * as atomic from './atomic/index.js';

// Also export progressive functions at top level for convenience
export {
  sonarAlgorithmSteps,
  mooreAlgorithmSteps,
  sonarOptimizationSteps,
  mooreOptimizationSteps,
  generateMooreCurve,
  mooreCurveToPoints,
} from './progressive/index.js';
