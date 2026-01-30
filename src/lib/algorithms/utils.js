/**
 * Utility functions for TSP algorithms
 */

/**
 * Valid Moore curve grid sizes (powers of 2)
 * Moore curve of order n fills a 2^n × 2^n grid
 * @type {number[]}
 */
export const VALID_GRID_SIZES = [2, 4, 8, 16, 32, 64];

/**
 * Calculate the Moore grid size based on user-specified grid size
 * Moore curve of order n fills a 2^n × 2^n grid
 * Returns the nearest valid power-of-2 grid size
 * @param {number} gridSize - User-specified grid size
 * @returns {number} Moore grid size (power of 2)
 */
export const calculateMooreGridSize = (gridSize) => {
  const order = Math.max(1, Math.ceil(Math.log2(gridSize)));
  const result = Math.pow(2, order);
  // Clamp to valid range
  return Math.max(
    VALID_GRID_SIZES[0],
    Math.min(VALID_GRID_SIZES[VALID_GRID_SIZES.length - 1], result)
  );
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
