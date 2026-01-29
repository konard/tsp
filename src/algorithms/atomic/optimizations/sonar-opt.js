/**
 * Atomic Sonar Optimization (computes all at once)
 *
 * Re-exports the atomic sonarOptimization function from the progressive module.
 * Use this when you need the optimized tour without step-by-step visualization.
 */

export {
  sonarOptimization,
  sonarOptimization as default,
} from '../../progressive/optimizations/sonar-opt.js';
