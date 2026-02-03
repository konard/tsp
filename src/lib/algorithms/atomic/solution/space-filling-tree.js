/**
 * Atomic Space-Filling Tree Solution for TSP
 *
 * Uses a space-filling tree (recursive quadrant subdivision) to order points.
 * Unlike space-filling curves (Moore/Hilbert) which trace a single path,
 * space-filling trees branch hierarchically — every region of space is
 * reachable via a short path from the root.
 *
 * Algorithm:
 * 1. Compute the bounding box of all points
 * 2. Recursively subdivide the space into quadrants (quadtree)
 * 3. At each level, visit quadrants in a spatially coherent order
 *    (Z-order / Morton order: TL, TR, BL, BR)
 * 4. Perform a DFS preorder traversal of the tree
 * 5. The visit order of the leaves defines the TSP tour
 *
 * This is analogous to the classic MST+DFS TSP heuristic but uses
 * structured spatial subdivision for better locality preservation.
 *
 * Reference: Kuffner & LaValle, "Space-Filling Trees" (2009)
 * https://en.wikipedia.org/wiki/Space-filling_tree
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */

/**
 * Build a space-filling tree (quadtree) over the given points and return
 * the DFS preorder traversal as the tour.
 *
 * @param {Array<{x: number, y: number, id: number}>} points - Array of points
 * @returns {{tour: number[], treeEdges: Array<{from: {x: number, y: number}, to: {x: number, y: number}, depth: number}>}} Final tour and tree edges for visualization
 */
export const spaceFillingTreeSolution = (points) => {
  if (points.length === 0) {
    return { tour: [], treeEdges: [] };
  }

  if (points.length === 1) {
    return { tour: [0], treeEdges: [] };
  }

  // Build indexed points for tracking
  const indexed = points.map((p, idx) => ({ ...p, idx }));

  // Compute bounding box
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const p of indexed) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }

  // Add small padding to ensure points on boundaries are included
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  // Tree edges for visualization
  const treeEdges = [];

  /**
   * Recursively partition points into quadrants and return DFS order.
   * Quadrant visit order follows Z-order (Morton curve):
   *   TL(0,0) -> TR(1,0) -> BL(0,1) -> BR(1,1)
   * This ensures spatial locality in the resulting tour.
   *
   * @param {Array} pts - Points in this region
   * @param {number} cx - Center x of region
   * @param {number} cy - Center y of region
   * @param {number} halfW - Half width of region
   * @param {number} halfH - Half height of region
   * @param {number} depth - Current recursion depth
   * @returns {number[]} Indices in DFS order
   */
  const subdivide = (pts, cx, cy, halfW, halfH, depth) => {
    if (pts.length === 0) {
      return [];
    }

    if (pts.length === 1) {
      return [pts[0].idx];
    }

    // Partition points into four quadrants around center
    const quadrants = [[], [], [], []]; // TL, TR, BL, BR
    for (const p of pts) {
      const qx = p.x < cx ? 0 : 1;
      const qy = p.y < cy ? 0 : 1;
      quadrants[qy * 2 + qx].push(p);
    }

    // Quadrant centers and half-sizes for recursion
    const newHalfW = halfW / 2;
    const newHalfH = halfH / 2;
    const centers = [
      { x: cx - newHalfW, y: cy - newHalfH }, // TL
      { x: cx + newHalfW, y: cy - newHalfH }, // TR
      { x: cx - newHalfW, y: cy + newHalfH }, // BL
      { x: cx + newHalfW, y: cy + newHalfH }, // BR
    ];

    // Record tree edges for visualization (from parent center to child centers)
    for (let q = 0; q < 4; q++) {
      if (quadrants[q].length > 0) {
        treeEdges.push({
          from: { x: cx, y: cy },
          to: centers[q],
          depth,
        });
      }
    }

    // Visit quadrants in Z-order and collect DFS traversal
    const result = [];
    for (let q = 0; q < 4; q++) {
      const sub = subdivide(
        quadrants[q],
        centers[q].x,
        centers[q].y,
        newHalfW,
        newHalfH,
        depth + 1
      );
      for (const idx of sub) {
        result.push(idx);
      }
    }

    return result;
  };

  const centerX = minX + rangeX / 2;
  const centerY = minY + rangeY / 2;
  const tour = subdivide(indexed, centerX, centerY, rangeX / 2, rangeY / 2, 0);

  return { tour, treeEdges };
};

export default spaceFillingTreeSolution;
