/**
 * Atomic 3-opt Optimization for TSP
 *
 * Improves any initial tour using the 3-opt algorithm (edge-exchange only),
 * which considers removing three edges and reconnecting the resulting
 * segments in all possible ways that maintain a valid tour.
 * Returns only the final optimized result without intermediate steps.
 *
 * This implementation uses only edge exchanges (no segment inversion
 * beyond what is needed for reconnection), as specified by the issue.
 *
 * This is a generic optimization that works with any TSP tour regardless of
 * how the initial solution was constructed.
 *
 * Time Complexity: O(n^3) worst case
 * Space Complexity: O(n)
 */

/* eslint-disable max-statements, complexity, max-depth */
import { distance } from '../../utils.js';

/**
 * Reverse a segment of the tour in-place.
 * @param {number[]} tour - The tour array
 * @param {number} start - Start index (inclusive)
 * @param {number} end - End index (inclusive)
 */
const reverseSegment = (tour, start, end) => {
  let left = start;
  let right = end;
  while (left < right) {
    [tour[left], tour[right]] = [tour[right], tour[left]];
    left++;
    right--;
  }
};

/**
 * Calculate total distance of a tour.
 * @param {Array<{x: number, y: number}>} points
 * @param {number[]} tour
 * @returns {number}
 */
const tourDistance = (points, tour) => {
  let total = 0;
  for (let i = 0; i < tour.length; i++) {
    const j = (i + 1) % tour.length;
    total += distance(points[tour[i]], points[tour[j]]);
  }
  return total;
};

/**
 * Optimize tour using 3-opt (atomic version).
 * Considers all triples of edges and reconnects via edge exchanges.
 * Returns the optimized tour without intermediate steps.
 *
 * @param {Array<{x: number, y: number}>} points - Array of points
 * @param {number[]} initialTour - Initial tour to optimize
 * @param {Object} options - Optional configuration
 * @param {number} options.maxIterations - Maximum optimization iterations (default: 20)
 * @returns {{tour: number[], improvement: number}} Optimized tour and total improvement
 */
export const threeOpt = (points, initialTour, options = {}) => {
  const { maxIterations = 20 } = options;

  if (initialTour.length < 6) {
    return { tour: [...initialTour], improvement: 0 };
  }

  const n = initialTour.length;
  const tour = [...initialTour];
  let improved = true;
  let iteration = 0;

  const initialDist = tourDistance(points, tour);
  let currentDist = initialDist;

  while (improved && iteration < maxIterations) {
    improved = false;
    iteration++;

    for (let i = 0; i < n - 2; i++) {
      for (let j = i + 2; j < n - 1; j++) {
        for (let k = j + 2; k < n + (i > 0 ? 0 : -1); k++) {
          const kEnd = k % n === 0 ? n - 1 : k;

          // Try all reconnection candidates and pick the best by actual distance
          let bestCandidateDist = currentDist;
          let bestCandidate = null;

          // Type 1: Reverse segment [i+1, j]
          const c1 = [...tour];
          reverseSegment(c1, i + 1, j);
          const d1 = tourDistance(points, c1);
          if (d1 < bestCandidateDist - 0.001) {
            bestCandidateDist = d1;
            bestCandidate = c1;
          }

          // Type 2: Reverse segment [j+1, kEnd]
          const c2 = [...tour];
          reverseSegment(c2, j + 1, kEnd);
          const d2 = tourDistance(points, c2);
          if (d2 < bestCandidateDist - 0.001) {
            bestCandidateDist = d2;
            bestCandidate = c2;
          }

          // Type 3: Reverse both segments
          const c3 = [...tour];
          reverseSegment(c3, i + 1, j);
          reverseSegment(c3, j + 1, kEnd);
          const d3 = tourDistance(points, c3);
          if (d3 < bestCandidateDist - 0.001) {
            bestCandidateDist = d3;
            bestCandidate = c3;
          }

          // Types 4-7: Segment rearrangements
          const seg1 = tour.slice(i + 1, j + 1);
          const seg2 = tour.slice(j + 1, k + 1 > n ? n : k + 1);
          const prefix = tour.slice(0, i + 1);
          const suffix = k + 1 < n ? tour.slice(k + 1) : [];

          // Type 4: seg2 + reversed seg1
          const c4 = [...prefix, ...seg2, ...[...seg1].reverse(), ...suffix];
          const d4 = tourDistance(points, c4);
          if (d4 < bestCandidateDist - 0.001) {
            bestCandidateDist = d4;
            bestCandidate = c4;
          }

          // Type 5: seg2 + seg1
          const c5 = [...prefix, ...seg2, ...seg1, ...suffix];
          const d5 = tourDistance(points, c5);
          if (d5 < bestCandidateDist - 0.001) {
            bestCandidateDist = d5;
            bestCandidate = c5;
          }

          // Type 6: reversed seg2 + reversed seg1
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
          }

          // Type 7: reversed seg2 + seg1
          const c7 = [...prefix, ...[...seg2].reverse(), ...seg1, ...suffix];
          const d7 = tourDistance(points, c7);
          if (d7 < bestCandidateDist - 0.001) {
            bestCandidateDist = d7;
            bestCandidate = c7;
          }

          if (bestCandidate) {
            for (let idx = 0; idx < n; idx++) {
              tour[idx] = bestCandidate[idx];
            }
            currentDist = bestCandidateDist;
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

  return { tour, improvement: Math.max(0, initialDist - currentDist) };
};

export default threeOpt;
