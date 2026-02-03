/**
 * Progressive Space-Filling Tree Algorithm for TSP
 *
 * Also known as: Quadtree Ordering, Spatial Subdivision Tree, Recursive Partitioning
 *
 * This algorithm provides step-by-step visualization of using a space-filling
 * tree (recursive quadrant subdivision) to order points:
 * 1. Compute the bounding box of all points
 * 2. Recursively subdivide space into quadrants (quadtree)
 * 3. Visit quadrants in Z-order (Morton order) via DFS
 * 4. Connect points in DFS visit order to form a tour
 *
 * Reference: Kuffner & LaValle, "Space-Filling Trees" (2009)
 * https://en.wikipedia.org/wiki/Space-filling_tree
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */

// Re-export atomic function for backward compatibility
export { spaceFillingTreeSolution } from '../../atomic/solution/space-filling-tree.js';

/**
 * Generate step-by-step solution using Space-Filling Tree algorithm
 *
 * @param {Array<{x: number, y: number, id: number}>} points - Array of points
 * @returns {Array<Object>} Array of steps for visualization
 */
export const spaceFillingTreeAlgorithmSteps = (points) => {
  if (points.length === 0) {
    return [];
  }

  // Build indexed points
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

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  // Collect all tree edges and DFS order with step info
  const allTreeEdges = [];
  const dfsOrder = [];

  /**
   * Recursively partition and collect DFS order with tree edges.
   */
  const subdivide = (pts, cx, cy, halfW, halfH, depth) => {
    if (pts.length === 0) {
      return;
    }

    if (pts.length === 1) {
      dfsOrder.push(pts[0].idx);
      return;
    }

    // Partition into quadrants
    const quadrants = [[], [], [], []]; // TL, TR, BL, BR
    for (const p of pts) {
      const qx = p.x < cx ? 0 : 1;
      const qy = p.y < cy ? 0 : 1;
      quadrants[qy * 2 + qx].push(p);
    }

    const newHalfW = halfW / 2;
    const newHalfH = halfH / 2;
    const centers = [
      { x: cx - newHalfW, y: cy - newHalfH }, // TL
      { x: cx + newHalfW, y: cy - newHalfH }, // TR
      { x: cx - newHalfW, y: cy + newHalfH }, // BL
      { x: cx + newHalfW, y: cy + newHalfH }, // BR
    ];

    // Record tree edges
    for (let q = 0; q < 4; q++) {
      if (quadrants[q].length > 0) {
        allTreeEdges.push({
          from: { x: cx, y: cy },
          to: centers[q],
          depth,
        });
      }
    }

    // Recurse in Z-order
    for (let q = 0; q < 4; q++) {
      subdivide(
        quadrants[q],
        centers[q].x,
        centers[q].y,
        newHalfW,
        newHalfH,
        depth + 1
      );
    }
  };

  const centerX = minX + rangeX / 2;
  const centerY = minY + rangeY / 2;
  subdivide(indexed, centerX, centerY, rangeX / 2, rangeY / 2, 0);

  // Generate steps: first show tree structure, then add points one by one
  const steps = [];
  const tour = [];

  // First step: show the tree structure
  steps.push({
    type: 'tree',
    treeEdges: allTreeEdges,
    tour: [],
    description: `Space-filling tree built (${allTreeEdges.length} edges)`,
  });

  // Add points one by one in DFS order
  for (let i = 0; i < dfsOrder.length; i++) {
    tour.push(dfsOrder[i]);
    const progress = (((i + 1) / dfsOrder.length) * 100).toFixed(1);
    const pt = points[dfsOrder[i]];

    steps.push({
      type: 'visit',
      treeEdges: allTreeEdges,
      tour: [...tour],
      description: `Progress: ${progress}% | Point ${dfsOrder[i]} (${pt.x}, ${pt.y})`,
    });
  }

  return steps;
};

export default spaceFillingTreeAlgorithmSteps;
