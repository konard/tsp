/**
 * Atomic Comb Solution (Serpentine/Boustrophedon Scan) for TSP
 *
 * Computes the final tour directly without intermediate visualization steps.
 *
 * Algorithm:
 * 1. Sort points by Y coordinate (top to bottom)
 * 2. Group points into rows based on Y coordinate
 * 3. Sort each row by X coordinate
 * 4. Alternate row direction: left-to-right, then right-to-left
 * 5. Return the serpentine order as the tour
 *
 * This creates a comb-shaped tour path that visits points
 * in a zigzag/serpentine pattern across rows.
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */

/**
 * Compute Comb solution in one step (atomic version).
 * Returns the final tour without intermediate steps.
 *
 * @param {Array<{x: number, y: number, id: number}>} points - Array of points
 * @returns {{tour: number[], rows: Array<Array<number>>}} Final tour and row groupings
 */
export const combSolution = (points) => {
  if (points.length === 0) {
    return { tour: [], rows: [] };
  }

  // Create indexed points for sorting
  const indexed = points.map((p, idx) => ({ ...p, idx }));

  // Sort by Y first, then by X for stable grouping
  indexed.sort((a, b) => a.y - b.y || a.x - b.x);

  // Group points into rows by Y coordinate
  const rowMap = new Map();
  for (const p of indexed) {
    if (!rowMap.has(p.y)) {
      rowMap.set(p.y, []);
    }
    rowMap.get(p.y).push(p);
  }

  // Get rows sorted by Y coordinate (top to bottom)
  const sortedYValues = [...rowMap.keys()].sort((a, b) => a - b);

  const tour = [];
  const rows = [];

  for (let rowIdx = 0; rowIdx < sortedYValues.length; rowIdx++) {
    const row = rowMap.get(sortedYValues[rowIdx]);

    // Sort row by X coordinate
    row.sort((a, b) => a.x - b.x);

    // Alternate direction: even rows left-to-right, odd rows right-to-left
    if (rowIdx % 2 === 1) {
      row.reverse();
    }

    const rowIndices = row.map((p) => p.idx);
    rows.push(rowIndices);
    tour.push(...rowIndices);
  }

  return { tour, rows };
};

export default combSolution;
