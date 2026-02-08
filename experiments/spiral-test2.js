/**
 * Experiment: Different double spiral approaches
 *
 * Looking at the reference image more carefully:
 * - The pattern shows rectangular spirals with "double lines"
 * - This is NOT a simple single spiral, but appears to have two interleaved paths
 * - The "double" means the spiral has two parallel arms, like the Greek spiral pattern
 *
 * Approach: Generate a rectangular spiral that visits ALL grid points,
 * creating a path that looks like the reference image (with two parallel tracks).
 *
 * The key insight is that this is a standard rectangular spiral
 * (also called a "boustrophedon spiral" or "spiral scan").
 * The "double" appearance comes from the spiral going inward AND
 * the adjacent return path going outward, creating parallel lines.
 */

/**
 * Generate double spiral curve.
 * The double spiral visits all points on a grid by spiraling inward
 * from the outside, creating a rectangular spiral pattern.
 *
 * This is essentially a single spiral that visits every cell,
 * which naturally creates the "double line" visual appearance
 * because adjacent spiral layers run parallel to each other.
 */
const generateDoubleSpiralPoints = (gridSize) => {
  const points = [];
  const visited = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(false)
  );

  // Start from bottom-left, going up (matching the reference image)
  let x = 0;
  let y = gridSize - 1;

  // Directions: up, right, down, left
  const dx = [0, 1, 0, -1];
  const dy = [-1, 0, 1, 0];
  let dir = 0; // Start going up

  const totalCells = gridSize * gridSize;

  for (let i = 0; i < totalCells; i++) {
    points.push({ x, y });
    visited[y][x] = true;

    // Look ahead in current direction
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
 * Draw the spiral path as ASCII using directional characters
 */
const drawPath = (points, gridSize) => {
  // Create a grid showing connections between adjacent points
  const grid = Array.from({ length: gridSize * 2 - 1 }, () =>
    Array(gridSize * 2 - 1).fill('  ')
  );

  // Mark each point
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    grid[p.y * 2][p.x * 2] = '##';
  }

  // Mark connections between consecutive points
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const mx = p1.x + p2.x; // mid x * 2
    const my = p1.y + p2.y; // mid y * 2
    if (p1.x === p2.x) {
      grid[my][mx] = '||';
    } else {
      grid[my][mx] = '==';
    }
  }

  for (let y = 0; y < grid.length; y++) {
    console.log(grid[y].join(''));
  }
};

// Test different sizes
for (const size of [4, 6, 8]) {
  console.log(`\n=== Double Spiral ${size}x${size} ===`);
  const points = generateDoubleSpiralPoints(size);
  console.log(`Total points: ${points.length}`);
  drawPath(points, size);
}
