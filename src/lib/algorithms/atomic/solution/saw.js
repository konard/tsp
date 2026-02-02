/**
 * Atomic Self-Avoiding Walk (SAW) Solution for TSP
 *
 * Computes the final tour directly without intermediate visualization steps.
 *
 * Algorithm:
 * 1. Start from the first point (index 0)
 * 2. At each step, move to the nearest unvisited point (self-avoiding walk)
 * 3. Continue until all points are visited
 * 4. The walk never revisits a point, forming a valid TSP tour
 *
 * This is a nearest-neighbor heuristic framed as a self-avoiding walk
 * on the complete graph of points. The "self-avoiding" property is
 * guaranteed by tracking visited points and only moving to unvisited ones.
 *
 * @see https://en.wikipedia.org/wiki/Self-avoiding_walk
 *
 * Time Complexity: O(n²)
 * Space Complexity: O(n)
 */

import { distance } from '../../utils.js';

/**
 * Find the nearest unvisited point from the current point.
 *
 * @param {number} currentIdx - Index of the current point in the points array
 * @param {Array<{x: number, y: number}>} points - Array of points
 * @param {Set<number>} visited - Set of already-visited point indices
 * @returns {number|null} Index of the nearest unvisited point, or null if none
 */
const findNearestUnvisited = (currentIdx, points, visited) => {
  let bestIdx = null;
  let bestDist = Infinity;

  for (let i = 0; i < points.length; i++) {
    if (visited.has(i)) {
      continue;
    }
    const d = distance(points[currentIdx], points[i]);
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  }

  return bestIdx;
};

/**
 * Compute Self-Avoiding Walk solution in one step (atomic version).
 * Returns the final tour without intermediate steps.
 *
 * @param {Array<{x: number, y: number, id: number}>} points - Array of points
 * @returns {{tour: number[]}} Final tour
 */
export const sawSolution = (points) => {
  if (points.length === 0) {
    return { tour: [] };
  }

  if (points.length === 1) {
    return { tour: [0] };
  }

  const tour = [];
  const visited = new Set();

  // Start from point 0
  let current = 0;
  tour.push(current);
  visited.add(current);

  // Walk to nearest unvisited point at each step
  while (visited.size < points.length) {
    const next = findNearestUnvisited(current, points, visited);
    if (next === null) {
      break;
    }
    tour.push(next);
    visited.add(next);
    current = next;
  }

  return { tour };
};

export default sawSolution;
