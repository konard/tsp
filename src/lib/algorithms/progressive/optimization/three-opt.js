/**
 * Progressive 3-opt Optimization for TSP
 *
 * This optimization improves any initial tour using the 3-opt algorithm
 * (edge-exchange only), which considers removing three edges and
 * reconnecting the resulting segments. Provides step-by-step visualization.
 *
 * This is a generic optimization that works with any TSP tour regardless of
 * how the initial solution was constructed.
 *
 * Time Complexity: O(n^3) worst case
 * Space Complexity: O(n)
 */

/* eslint-disable max-statements, complexity, max-depth */
import { distance } from '../../utils.js';

// Re-export atomic function for backward compatibility
export { threeOpt } from '../../atomic/optimization/three-opt.js';

/**
 * Reverse a segment of an array.
 * @param {number[]} arr
 * @param {number} start
 * @param {number} end
 */
const reverseSegment = (arr, start, end) => {
  let left = start;
  let right = end;
  while (left < right) {
    [arr[left], arr[right]] = [arr[right], arr[left]];
    left++;
    right--;
  }
};

/**
 * Calculate total tour distance.
 * @param {Array<{x: number, y: number}>} points
 * @param {number[]} tour
 * @returns {number}
 */
const tourDistance = (points, tour) => {
  let total = 0;
  for (let i = 0; i < tour.length; i++) {
    total += distance(points[tour[i]], points[tour[(i + 1) % tour.length]]);
  }
  return total;
};

/**
 * Generate step-by-step optimization using 3-opt
 *
 * @param {Array<{x: number, y: number}>} points - Array of points
 * @param {number[]} initialTour - Initial tour to optimize
 * @param {Object} options - Optional configuration
 * @param {number} options.maxIterations - Maximum optimization iterations (default: 20)
 * @returns {Array<Object>} Array of optimization steps
 */
export const threeOptSteps = (points, initialTour, options = {}) => {
  const { maxIterations = 20 } = options;

  if (initialTour.length < 6) {
    return [];
  }

  const n = initialTour.length;
  const steps = [];
  const tour = [...initialTour];
  let currentDist = tourDistance(points, tour);
  let improved = true;
  let iteration = 0;

  while (improved && iteration < maxIterations) {
    improved = false;
    iteration++;

    for (let i = 0; i < n - 2; i++) {
      for (let j = i + 2; j < n - 1; j++) {
        for (let k = j + 2; k < n + (i > 0 ? 0 : -1); k++) {
          const kEnd = k % n === 0 ? n - 1 : k;

          let bestCandidateDist = currentDist;
          let bestCandidate = null;
          let bestType = -1;

          // Type 1: Reverse segment [i+1, j]
          const c1 = [...tour];
          reverseSegment(c1, i + 1, j);
          const d1 = tourDistance(points, c1);
          if (d1 < bestCandidateDist - 0.001) {
            bestCandidateDist = d1;
            bestCandidate = c1;
            bestType = 1;
          }

          // Type 2: Reverse segment [j+1, kEnd]
          const c2 = [...tour];
          reverseSegment(c2, j + 1, kEnd);
          const d2 = tourDistance(points, c2);
          if (d2 < bestCandidateDist - 0.001) {
            bestCandidateDist = d2;
            bestCandidate = c2;
            bestType = 2;
          }

          // Type 3: Reverse both segments
          const c3 = [...tour];
          reverseSegment(c3, i + 1, j);
          reverseSegment(c3, j + 1, kEnd);
          const d3 = tourDistance(points, c3);
          if (d3 < bestCandidateDist - 0.001) {
            bestCandidateDist = d3;
            bestCandidate = c3;
            bestType = 3;
          }

          // Types 4-7: Segment rearrangements
          const seg1 = tour.slice(i + 1, j + 1);
          const seg2 = tour.slice(j + 1, k + 1 > n ? n : k + 1);
          const prefix = tour.slice(0, i + 1);
          const suffix = k + 1 < n ? tour.slice(k + 1) : [];

          const c4 = [...prefix, ...seg2, ...[...seg1].reverse(), ...suffix];
          const d4 = tourDistance(points, c4);
          if (d4 < bestCandidateDist - 0.001) {
            bestCandidateDist = d4;
            bestCandidate = c4;
            bestType = 4;
          }

          const c5 = [...prefix, ...seg2, ...seg1, ...suffix];
          const d5 = tourDistance(points, c5);
          if (d5 < bestCandidateDist - 0.001) {
            bestCandidateDist = d5;
            bestCandidate = c5;
            bestType = 5;
          }

          const c6 = [
            ...prefix,
            ...[...seg2].reverse(),
            ...[...seg1].reverse(),
            ...suffix,
          ];
          const d6 = tourDistance(points, c6);
          if (d6 < bestCandidateDist - 0.001) {
            bestCandidateDist = d6;
            bestCandidate = c6;
            bestType = 6;
          }

          const c7 = [...prefix, ...[...seg2].reverse(), ...seg1, ...suffix];
          const d7 = tourDistance(points, c7);
          if (d7 < bestCandidateDist - 0.001) {
            bestCandidateDist = d7;
            bestCandidate = c7;
            bestType = 7;
          }

          if (bestCandidate) {
            const improvement = currentDist - bestCandidateDist;
            for (let idx = 0; idx < n; idx++) {
              tour[idx] = bestCandidate[idx];
            }
            currentDist = bestCandidateDist;

            steps.push({
              type: 'optimize',
              tour: [...tour],
              edges: [i, j, k % n],
              improvement,
              description: `3-opt: exchanged edges at [${i}, ${j}, ${k % n}], type ${bestType}, saved ${improvement.toFixed(2)} units`,
            });

            improved = true;
            break;
          }
        }
        if (improved) {
          break;
        }
      }
      if (improved) {
        break;
      }
    }
  }

  return steps;
};

export default threeOptSteps;
