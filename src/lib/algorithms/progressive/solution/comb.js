/**
 * Progressive Comb Algorithm (Serpentine/Boustrophedon Scan) for TSP
 *
 * Also known as: Serpentine Scan, Boustrophedon Path, Raster Scan, Zigzag Row Scan
 *
 * This algorithm provides step-by-step visualization of:
 * 1. Sorting points by Y coordinate into rows
 * 2. Visiting each row alternately left-to-right and right-to-left
 * 3. Building a comb-shaped tour path
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */

// Re-export atomic function for backward compatibility
export { combSolution } from '../../atomic/solution/comb.js';

/**
 * Generate step-by-step solution using Comb algorithm
 * Visits points in a serpentine pattern across rows
 *
 * @param {Array<{x: number, y: number, id: number}>} points - Array of points
 * @returns {Array<Object>} Array of steps for visualization
 */
export const combAlgorithmSteps = (points) => {
  if (points.length === 0) {
    return [];
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

  const rows = [];
  for (let rowIdx = 0; rowIdx < sortedYValues.length; rowIdx++) {
    const row = rowMap.get(sortedYValues[rowIdx]);
    row.sort((a, b) => a.x - b.x);
    if (rowIdx % 2 === 1) {
      row.reverse();
    }
    rows.push(row);
  }

  // Generate steps
  const steps = [];
  const tour = [];
  let pointCount = 0;

  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx];
    const direction = rowIdx % 2 === 0 ? 'left-to-right' : 'right-to-left';

    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      const pt = row[colIdx];
      tour.push(pt.idx);
      pointCount++;

      const progress = ((pointCount / points.length) * 100).toFixed(1);
      steps.push({
        type: 'comb',
        tour: [...tour],
        currentRow: rowIdx,
        totalRows: rows.length,
        direction,
        description: `Progress: ${progress}% | Row ${rowIdx + 1}/${rows.length} (${direction}) | Point ${pt.idx} (${pt.x}, ${pt.y})`,
      });
    }
  }

  return steps;
};

export default combAlgorithmSteps;
