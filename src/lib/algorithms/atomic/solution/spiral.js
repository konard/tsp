/**
 * Atomic Double Spiral Solution for TSP
 *
 * Computes the final tour directly without intermediate visualization steps.
 *
 * Algorithm:
 * 1. Generate a rectangular double spiral that fills the grid space
 * 2. Map each point to its nearest position on the spiral
 * 3. Sort points by their position along the spiral
 * 4. Return the sorted order as the tour
 *
 * The double spiral starts from the bottom-left corner, proceeds upward,
 * and spirals clockwise inward, visiting every grid cell. The "double"
 * appearance comes from adjacent spiral layers running parallel to each other.
 *
 * Time Complexity: O(n log n)
 * Space Complexity: O(n)
 */

import { distance } from '../../utils.js';

/**
 * Generate a double spiral curve that fills a grid.
 *
 * The spiral starts from the bottom-left corner (0, gridSize-1),
 * moves upward, then spirals clockwise inward until all grid cells
 * are visited.
 *
 * @param {number} gridSize - Size of the grid (number of cells per side)
 * @returns {Array<{x: number, y: number}>} Array of curve points in spiral order
 */
export const generateDoubleSpiralPoints = (gridSize) => {
  const points = [];
  const visited = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(false)
  );

  // Start from bottom-left corner, going up
  let x = 0;
  let y = gridSize - 1;

  // Directions: up, right, down, left (clockwise spiral)
  const dx = [0, 1, 0, -1];
  const dy = [-1, 0, 1, 0];
  let dir = 0; // Start going up

  const totalCells = gridSize * gridSize;

  for (let i = 0; i < totalCells; i++) {
    points.push({ x, y });
    visited[y][x] = true;

    // Try to continue in the current direction
    const nx = x + dx[dir];
    const ny = y + dy[dir];

    if (
      nx >= 0 &&
      nx < gridSize &&
      ny >= 0 &&
      ny < gridSize &&
      !visited[ny][nx]
    ) {
      x = nx;
      y = ny;
    } else {
      // Turn right (clockwise)
      dir = (dir + 1) % 4;
      const tnx = x + dx[dir];
      const tny = y + dy[dir];
      if (
        tnx >= 0 &&
        tnx < gridSize &&
        tny >= 0 &&
        tny < gridSize &&
        !visited[tny][tnx]
      ) {
        x = tnx;
        y = tny;
      }
    }
  }

  return points;
};

/**
 * Compute Double Spiral solution in one step (atomic version).
 * Returns the final tour without intermediate steps.
 *
 * @param {Array<{x: number, y: number, id: number}>} points - Array of points
 * @param {number} mooreGridSize - Size of the grid
 * @returns {{tour: number[], curvePoints: Array<{x: number, y: number}>}} Final tour and curve
 */
export const spiralSolution = (points, mooreGridSize) => {
  if (points.length === 0) {
    return { tour: [], curvePoints: [] };
  }

  const curvePoints = generateDoubleSpiralPoints(mooreGridSize);

  const pointsWithCurvePos = points.map((p, idx) => {
    let minDist = Infinity;
    let curvePos = 0;

    for (let i = 0; i < curvePoints.length; i++) {
      const d = distance(p, curvePoints[i]);
      if (d < minDist) {
        minDist = d;
        curvePos = i;
      }
    }

    return { idx, curvePos };
  });

  pointsWithCurvePos.sort((a, b) => a.curvePos - b.curvePos);

  return {
    tour: pointsWithCurvePos.map((p) => p.idx),
    curvePoints,
  };
};

export default spiralSolution;
