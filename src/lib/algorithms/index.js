/**
 * TSP Algorithms Library
 *
 * This module provides two types of TSP algorithms:
 *
 * 1. Progressive (step-by-step) - Returns arrays of steps for visualization/animation
 * 2. Atomic (all-at-once) - Returns final result directly
 *
 * Each type includes:
 * - Solutions: Initial tour construction algorithms (Sonar, Moore, SAW, Koch, Space-Filling Tree, Brute-Force)
 * - Optimizations: Generic tour improvement algorithms (2-opt, 3-opt, k-opt, LK, LKH, Zigzag)
 *
 * Additionally, verification algorithms prove tour optimality:
 * - Lower bound (1-tree): Mathematical proof when upper bound = lower bound
 *
 * Available solution algorithms:
 * - Sonar (Radial Sweep): Sorts points by polar angle from centroid
 * - Moore Curve: Orders points along a space-filling curve
 * - Self-Avoiding Walk (SAW): Nearest-neighbor walk that never revisits a point
 * - Koch Snowflake: Orders points along a Koch snowflake fractal curve
 * - Space-Filling Tree: Orders points via DFS traversal of a recursive quadtree
 * - Brute-Force: Exhaustive search for the true optimal tour (small instances)
 *
 * Available optimizations (generic, work with any tour):
 * - 2-opt: Standard segment reversal optimization
 * - 3-opt: Three-edge exchange optimization
 * - k-opt: Generalized k-edge exchange (combines 2-opt and 3-opt)
 * - Lin-Kernighan: Variable-depth edge exchange heuristic
 * - Lin-Kernighan-Helsgaun: LK with perturbation for escaping local optima
 * - Zigzag: Adjacent pair swapping optimization
 * - Combined: Alternates zigzag and 2-opt until no improvement
 *
 * @example
 * // Progressive (for visualization)
 * import { sonarAlgorithmSteps, sawAlgorithmSteps, kochAlgorithmSteps, twoOptSteps, bruteForceAlgorithmSteps } from './algorithms';
 * const solutionSteps = sonarAlgorithmSteps(points);
 * const kochSteps = kochAlgorithmSteps(points, mooreGridSize);
 * const optSteps = twoOptSteps(points, tour);
 * const bruteSteps = bruteForceAlgorithmSteps(points);
 *
 * @example
 * // Atomic (for direct computation)
 * import { sonarSolution, sawSolution, bruteForceSolution } from './algorithms/atomic';
 * import { twoOpt } from './algorithms/atomic';
 * const { tour } = sonarSolution(points);
 * const optimal = bruteForceSolution(points);
 *
 * @example
 * // Verification (prove optimality)
 * import { verifyOptimality } from './algorithms/verification';
 * const result = verifyOptimality(tourDistance, points);
 * if (result.isOptimal) console.log('Tour is proven optimal!');
 */

// Utility functions
export * from './utils.js';

// Progressive algorithms (step-by-step)
export * as progressive from './progressive/index.js';

// Atomic algorithms (all-at-once)
export * as atomic from './atomic/index.js';

// Verification algorithms (optimality proofs)
export * as verification from './verification/index.js';

// Export progressive functions at top level for convenience
export {
  // Solutions
  sonarAlgorithmSteps,
  mooreAlgorithmSteps,
  generateMooreCurve,
  mooreCurveToPoints,
  sawAlgorithmSteps,
  sawSolution,
  kochAlgorithmSteps,
  generateKochSnowflake,
  kochCurveToPoints,
  calculateKochOrder,
  spaceFillingTreeAlgorithmSteps,
  bruteForceAlgorithmSteps,
  bruteForceSolution,
  calculateOptimalityRatio,
  BRUTE_FORCE_MAX_POINTS,
  // Generic optimizations
  twoOptSteps,
  threeOptSteps,
  kOptSteps,
  zigzagOptSteps,
  combinedOptSteps,
  linKernighanSteps,
  lkHelsgaunSteps,
  // Legacy aliases for backward compatibility
  sonarOptimizationSteps,
  mooreOptimizationSteps,
} from './progressive/index.js';

// Export verification functions at top level for convenience
export {
  oneTreeLowerBound,
  verifyOptimality,
  // Backward-compatible aliases
  bruteForceOptimalTour,
  bruteForceSteps,
} from './verification/index.js';
