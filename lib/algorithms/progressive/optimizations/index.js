/**
 * Progressive Optimizations - Step-by-step optimization algorithms
 *
 * These optimizations are generic and can be applied to any TSP tour
 * regardless of how the initial solution was constructed.
 */

// Generic optimization algorithms
export { twoOptSteps, twoOpt } from './two-opt.js';
export { zigzagOptSteps, zigzagOpt } from './zigzag-opt.js';

// Legacy aliases for backward compatibility
export { mooreOptimizationSteps, mooreOptimization } from './two-opt.js';
export { sonarOptimizationSteps, sonarOptimization } from './zigzag-opt.js';
