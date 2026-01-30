/**
 * Atomic Optimizations - All-at-once optimization algorithms
 *
 * These optimizations are generic and can be applied to any TSP tour
 * regardless of how the initial solution was constructed.
 */

// Generic optimization algorithms
export { twoOpt } from './two-opt.js';
export { zigzagOpt } from './zigzag-opt.js';

// Legacy aliases for backward compatibility
export { twoOpt as mooreOptimization } from './two-opt.js';
export { zigzagOpt as sonarOptimization } from './zigzag-opt.js';
