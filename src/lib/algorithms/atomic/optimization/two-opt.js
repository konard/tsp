/**
 * Atomic 2-opt Optimization (computes all at once)
 *
 * Re-exports the atomic twoOpt function from the progressive module.
 * Use this when you need the optimized tour without step-by-step visualization.
 */

export {
  twoOpt,
  twoOpt as default,
} from '../../progressive/optimization/two-opt.js';
