/**
 * Utility functions for TSP algorithms
 */

/**
 * Valid Moore curve grid sizes (powers of 2 from 2 to 64)
 * A Moore curve of order N fills a 2^N x 2^N grid covering all vertices
 */
export const VALID_GRID_SIZES = [2, 4, 8, 16, 32, 64];

/**
 * Calculate the Moore grid size based on user-specified grid size
 * A Moore curve of order N fills a 2^N x 2^N grid covering all 4^N vertices
 * The grid size must be a power of 2 for proper Moore curve coverage
 * @param {number} gridSize - User-specified grid size (should be a power of 2)
 * @returns {number} Moore grid size (power of 2, same as gridSize when valid)
 */
export const calculateMooreGridSize = (gridSize) => {
  // Find the nearest valid grid size (power of 2)
  // For valid inputs (2, 4, 8, 16, 32, 64) this returns the input unchanged
  const order = Math.max(1, Math.min(6, Math.round(Math.log2(gridSize))));
  return Math.pow(2, order);
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
  // Points are placed at grid intersections (0 to mooreGridSize inclusive)
  const maxPoints = Math.min(
    numPoints,
    (mooreGridSize + 1) * (mooreGridSize + 1)
  );

  while (points.length < maxPoints) {
    // Generate integer coordinates aligned to Moore grid vertices
    const x = Math.floor(Math.random() * (mooreGridSize + 1));
    const y = Math.floor(Math.random() * (mooreGridSize + 1));
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
