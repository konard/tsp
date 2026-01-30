/**
 * Atomic Moore Solution (computes all at once)
 *
 * Re-exports the atomic mooreSolution function from the progressive module.
 * Use this when you need the final tour without step-by-step visualization.
 */

export {
  mooreSolution,
  mooreSolution as default,
} from '../../progressive/solution/moore.js';
