/**
 * Experiment: Generate double spiral curve points and visualize as ASCII
 *
 * The double spiral pattern (from the issue image) is a rectangular spiral
 * that fills a grid by spiraling inward from the perimeter toward the center.
 * The "double" refers to two interleaved spiral arms.
 */

/**
 * Generate a double spiral curve that fills a grid.
 * The curve starts from the outside and spirals inward.
 *
 * @param {number} gridSize - Size of the grid (should be even, power of 2)
 * @returns {Array<{x: number, y: number}>} Array of curve points
 */
const generateDoubleSpiralPoints = (gridSize) => {
  const points = [];
  const visited = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill(false)
  );

  // Start from bottom-left corner, going up
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
 * Draw the spiral as ASCII art showing the path order
 */
const drawAscii = (points, gridSize) => {
  const grid = Array.from({ length: gridSize }, () =>
    Array(gridSize).fill('  . ')
  );

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    grid[p.y][p.x] = String(i).padStart(3, ' ') + ' ';
  }

  for (let y = 0; y < gridSize; y++) {
    console.log(grid[y].join(''));
  }
};

// Test with different grid sizes
for (const size of [4, 8]) {
  console.log(`\n=== Grid ${size}x${size} ===`);
  const points = generateDoubleSpiralPoints(size);
  console.log(`Points: ${points.length}`);
  drawAscii(points, size);

  // Show the path as coordinate sequence
  console.log('\nPath:');
  for (let i = 0; i < Math.min(points.length, 20); i++) {
    console.log(`  ${i}: (${points[i].x}, ${points[i].y})`);
  }
  if (points.length > 20) console.log('  ...');
}
