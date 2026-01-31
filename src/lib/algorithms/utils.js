/**
 * Utility functions for TSP algorithms
 */

/**
 * Valid grid sizes for Moore curve algorithm.
 * A Moore curve of order n fills a 2^n x 2^n grid.
 * These correspond to L-system iteration counts 0..7 (effective orders 1..8).
 */
export const VALID_GRID_SIZES = [2, 4, 8, 16, 32, 64, 128];

/**
 * Calculate the Moore grid size based on user-specified grid size
 * Moore curve fills a grid of size 2^n x 2^n.
 * Returns the smallest valid Moore grid size >= gridSize.
 * @param {number} gridSize - User-specified grid size
 * @returns {number} Moore grid size (power of 2)
 */
export const calculateMooreGridSize = (gridSize) => {
  // Find smallest valid grid size >= gridSize
  for (const size of VALID_GRID_SIZES) {
    if (size >= gridSize) {
      return size;
    }
  }
  return VALID_GRID_SIZES[VALID_GRID_SIZES.length - 1];
};

/**
 * Generate random points on the Moore grid
 * @param {number} mooreGridSize - Size of the Moore grid
 * @param {number} numPoints - Number of points to generate
 * @returns {Array<{x: number, y: number, id: number}>} Array of point objects
 */
export const generateRandomPoints = (mooreGridSize, numPoints) => {
  const points = [];
  const usedPositions = new Set();
  // Points are placed at grid intersections (0 to mooreGridSize-1 inclusive)
  const maxPoints = Math.min(numPoints, mooreGridSize * mooreGridSize);

  while (points.length < maxPoints) {
    // Generate integer coordinates aligned to Moore grid vertices [0, mooreGridSize-1]
    const x = Math.floor(Math.random() * mooreGridSize);
    const y = Math.floor(Math.random() * mooreGridSize);
    const key = `${x},${y}`;

    if (!usedPositions.has(key)) {
      usedPositions.add(key);
      points.push({ x, y, id: points.length });
    }
  }
  return points;
};

/**
 * Calculate Euclidean distance between two points
 * @param {{x: number, y: number}} p1 - First point
 * @param {{x: number, y: number}} p2 - Second point
 * @returns {number} Euclidean distance
 */
export const distance = (p1, p2) => Math.hypot(p2.x - p1.x, p2.y - p1.y);

/**
 * Calculate total tour distance (closed loop)
 * @param {number[]} tour - Array of point indices forming the tour
 * @param {Array<{x: number, y: number}>} points - Array of point coordinates
 * @returns {number} Total distance of the tour
 */
export const calculateTotalDistance = (tour, points) => {
  if (tour.length < 2) {
    return 0;
  }
  let total = 0;
  for (let i = 0; i < tour.length - 1; i++) {
    total += distance(points[tour[i]], points[tour[i + 1]]);
  }
  // Close the loop
  total += distance(points[tour[tour.length - 1]], points[tour[0]]);
  return total;
};
