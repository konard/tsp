/**
 * Progressive Optimizations - Step-by-step optimization algorithms
 *
 * These optimizations are generic and can be applied to any TSP tour
 * regardless of how the initial solution was constructed.
 */

// Generic optimization algorithms (step-by-step + atomic re-exports)
export { twoOptSteps, twoOpt, mooreOptimization } from './two-opt.js';
export { zigzagOptSteps, zigzagOpt, sonarOptimization } from './zigzag-opt.js';
export { combinedOptSteps, combinedOpt } from './combined-opt.js';

// Legacy step aliases for backward compatibility
export { mooreOptimizationSteps } from './two-opt.js';
export { sonarOptimizationSteps } from './zigzag-opt.js';
