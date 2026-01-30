/**
 * Atomic Brute-Force Solution (computes all at once)
 *
 * Re-exports the atomic bruteForceSolution function from the progressive module.
 * Use this when you need the final optimal tour without step-by-step visualization.
 */

export {
  bruteForceSolution,
  bruteForceSolution as default,
  calculateOptimalityRatio,
  BRUTE_FORCE_MAX_POINTS,
} from '../../progressive/solution/brute-force.js';
