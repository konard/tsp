/**
 * Atomic Zigzag Optimization (computes all at once)
 *
 * Re-exports the atomic zigzagOpt function from the progressive module.
 * Use this when you need the optimized tour without step-by-step visualization.
 */

export {
  zigzagOpt,
  zigzagOpt as default,
} from '../../progressive/optimization/zigzag-opt.js';
