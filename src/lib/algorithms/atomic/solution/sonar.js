/**
 * Atomic Sonar Solution (computes all at once)
 *
 * Re-exports the atomic sonarSolution function from the progressive module.
 * Use this when you need the final tour without step-by-step visualization.
 */

export {
  sonarSolution,
  sonarSolution as default,
} from '../../progressive/solution/sonar.js';
