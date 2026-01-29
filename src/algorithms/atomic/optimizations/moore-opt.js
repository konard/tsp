/**
 * Atomic Moore Optimization (computes all at once)
 *
 * Re-exports the atomic mooreOptimization function from the progressive module.
 * Use this when you need the optimized tour without step-by-step visualization.
 */

export {
  mooreOptimization,
  mooreOptimization as default,
} from '../../progressive/optimizations/moore-opt.js';
