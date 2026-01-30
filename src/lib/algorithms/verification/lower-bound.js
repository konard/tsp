/**
 * Lower Bound Verification for TSP
 *
 * Computes a mathematical lower bound on the optimal TSP tour distance.
 * When the best known tour distance equals the lower bound, the tour
 * is proven optimal without exhaustive search.
 *
 * Method: 1-tree lower bound (Held-Karp style)
 *
 * A 1-tree for vertex 0 is:
 * 1. Compute MST on vertices {1, ..., n-1}
 * 2. Add the two shortest edges from vertex 0 to the MST
 *
 * The weight of any 1-tree is a lower bound on the optimal TSP tour,
 * because every TSP tour is a 1-tree (but not every 1-tree is a tour).
 *
 * This runs in O(n^2) time using Prim's algorithm for the MST.
 */

import { distance } from '../utils.js';

/**
 * Compute the Minimum Spanning Tree weight using Prim's algorithm.
 *
 * @param {Array<Array<number>>} dist - Distance matrix
 * @param {Array<number>} vertices - Set of vertex indices to include
 * @returns {number} Total MST weight
 */
const mstWeight = (dist, vertices) => {
  if (vertices.length <= 1) {
    return 0;
  }

  const n = vertices.length;
  const inMST = new Set();
  const minEdge = new Array(n).fill(Infinity);

  // Start from first vertex in the set
  minEdge[0] = 0;
  let totalWeight = 0;

  for (let count = 0; count < n; count++) {
    // Find vertex with minimum edge weight not yet in MST
    let u = -1;
    for (let i = 0; i < n; i++) {
      if (!inMST.has(i) && (u === -1 || minEdge[i] < minEdge[u])) {
        u = i;
      }
    }

    inMST.add(u);
    totalWeight += minEdge[u];

    // Update minimum edge weights for neighbors
    for (let v = 0; v < n; v++) {
      if (!inMST.has(v)) {
        const d = dist[vertices[u]][vertices[v]];
        if (d < minEdge[v]) {
          minEdge[v] = d;
        }
      }
    }
  }

  return totalWeight;
};

/**
 * Compute the 1-tree lower bound for the TSP.
 *
 * The 1-tree bound works as follows:
 * 1. Remove vertex 0 from the graph
 * 2. Compute MST on remaining vertices
 * 3. Add the two cheapest edges from vertex 0 back
 * 4. The total weight is a lower bound on any TSP tour
 *
 * @param {Array<{x: number, y: number}>} points - Array of points
 * @returns {{lowerBound: number, method: string}} Lower bound and method description
 */
export const oneTreeLowerBound = (points) => {
  const n = points.length;

  if (n <= 1) {
    return { lowerBound: 0, method: '1-tree' };
  }

  if (n === 2) {
    return {
      lowerBound: 2 * distance(points[0], points[1]),
      method: '1-tree',
    };
  }

  // Build full distance matrix
  const dist = [];
  for (let i = 0; i < n; i++) {
    dist[i] = [];
    for (let j = 0; j < n; j++) {
      dist[i][j] = i === j ? 0 : distance(points[i], points[j]);
    }
  }

  // Step 1: MST on vertices {1, ..., n-1}
  const remainingVertices = [];
  for (let i = 1; i < n; i++) {
    remainingVertices.push(i);
  }
  const mstCost = mstWeight(dist, remainingVertices);

  // Step 2: Find two shortest edges from vertex 0 to the rest
  let min1 = Infinity;
  let min2 = Infinity;
  for (let i = 1; i < n; i++) {
    const d = dist[0][i];
    if (d < min1) {
      min2 = min1;
      min1 = d;
    } else if (d < min2) {
      min2 = d;
    }
  }

  const lowerBound = mstCost + min1 + min2;

  return { lowerBound, method: '1-tree' };
};

/**
 * Verify if a tour is optimal by comparing its distance to the lower bound.
 *
 * If tour distance equals the lower bound, the tour is proven optimal.
 *
 * @param {number} tourDistance - Distance of the tour to verify
 * @param {Array<{x: number, y: number}>} points - Array of points
 * @returns {{isOptimal: boolean, lowerBound: number, gap: number, gapPercent: number, method: string}}
 */
export const verifyOptimality = (tourDistance, points) => {
  const { lowerBound, method } = oneTreeLowerBound(points);
  const gap = tourDistance - lowerBound;
  const gapPercent = lowerBound > 0 ? (gap / lowerBound) * 100 : 0;

  return {
    isOptimal: gap < 0.001, // Floating point tolerance
    lowerBound,
    gap,
    gapPercent,
    method,
  };
};

export default oneTreeLowerBound;
