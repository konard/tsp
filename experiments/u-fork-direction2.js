/**
 * Test direction=2 (DOWN) for U-fork curve - this produces a C opening LEFT
 * which appears to match the target image.
 */

function generateUForkCurve(order) {
  let sequence = 'A';
  for (let i = 0; i < order; i++) {
    let newSequence = '';
    for (const char of sequence) {
      if (char === 'A') newSequence += '-BF+AFA+FB-';
      else if (char === 'B') newSequence += '+AF-BFB-FA+';
      else newSequence += char;
    }
    sequence = newSequence;
  }
  return sequence;
}

function curveToPoints(sequence, startDir) {
  const points = [];
  let x = 0, y = 0;
  let direction = startDir;
  points.push({ x, y });
  for (const char of sequence) {
    if (char === 'F') {
      if (direction === 0) y -= 1;
      else if (direction === 1) x += 1;
      else if (direction === 2) y += 1;
      else if (direction === 3) x -= 1;
      points.push({ x, y });
    } else if (char === '+') {
      direction = (direction + 1) % 4;
    } else if (char === '-') {
      direction = (direction + 3) % 4;
    }
  }
  return points;
}

function normalizePoints(rawPoints, gridSize) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of rawPoints) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  const w = maxX - minX;
  const h = maxY - minY;
  return rawPoints.map(p => ({
    x: w === 0 ? 0 : Math.round(((p.x - minX) / w) * (gridSize - 1)),
    y: h === 0 ? 0 : Math.round(((p.y - minY) / h) * (gridSize - 1))
  }));
}

function drawASCII(points, gridSize) {
  const width = gridSize * 4 - 1;
  const height = gridSize * 2 - 1;
  const canvas = Array.from({ length: height }, () => Array(width).fill(' '));

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const cx = p.x * 4;
    const cy = p.y * 2;
    canvas[cy][cx] = '●';
  }

  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const ax = a.x * 4, ay = a.y * 2;
    const bx = b.x * 4, by = b.y * 2;

    if (ax === bx) {
      const minY = Math.min(ay, by);
      const maxY = Math.max(ay, by);
      for (let y = minY + 1; y < maxY; y++) canvas[y][ax] = '│';
    } else {
      const minX = Math.min(ax, bx);
      const maxX = Math.max(ax, bx);
      for (let x = minX + 1; x < maxX; x++) canvas[ay][x] = '─';
    }
  }

  for (const row of canvas) console.log(row.join(''));
}

console.log("=== U-fork direction=2 (DOWN) - C opening LEFT ===\n");
for (let order = 1; order <= 4; order++) {
  const gridSize = Math.pow(2, order);
  console.log(`Step ${order} (${gridSize}x${gridSize}):`);
  const seq = generateUForkCurve(order);
  const raw = curveToPoints(seq, 2);
  const norm = normalizePoints(raw, gridSize);
  drawASCII(norm, gridSize);
  console.log(`Start: (${norm[0].x},${norm[0].y}), End: (${norm[norm.length-1].x},${norm[norm.length-1].y})\n`);
}

// Also print the grid ordering for step 2 and 3
console.log("\n=== Grid ordering ===");
for (let order = 1; order <= 3; order++) {
  const gridSize = Math.pow(2, order);
  const seq = generateUForkCurve(order);
  const raw = curveToPoints(seq, 2);
  const norm = normalizePoints(raw, gridSize);

  console.log(`\nStep ${order} (${gridSize}x${gridSize}):`);
  const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill('  .'));
  for (let i = 0; i < norm.length; i++) {
    const p = norm[i];
    grid[p.y][p.x] = String(i).padStart(3);
  }
  for (let row = 0; row < gridSize; row++) {
    console.log(grid[row].join(' '));
  }
}
