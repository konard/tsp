/**
 * Analyze the U-fork target pattern from the issue image.
 *
 * Looking at the target image carefully:
 * - Step 1 (2x2): A U/C shape opening to the LEFT
 *   The path appears to go: bottom-right → top-right → top-left → bottom-left
 *   OR: top-right → bottom-right → bottom-left → top-left
 *
 * Let's trace the CURRENT algorithm output and try different L-system variants.
 */

// Current U-fork L-system (same as Hilbert curve)
function generateUForkCurve(order) {
  let sequence = 'A';
  for (let i = 0; i < order; i++) {
    let newSequence = '';
    for (const char of sequence) {
      if (char === 'A') {
        newSequence += '-BF+AFA+FB-';
      } else if (char === 'B') {
        newSequence += '+AF-BFB-FA+';
      } else {
        newSequence += char;
      }
    }
    sequence = newSequence;
  }
  return sequence;
}

function curveToRawPoints(sequence, startDir) {
  const points = [];
  let x = 0, y = 0;
  let direction = startDir; // 0=up, 1=right, 2=down, 3=left

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

// Print grid visualization
function printGrid(points, gridSize) {
  const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill('  .'));

  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    grid[p.y][p.x] = String(i).padStart(3);
  }

  for (let row = 0; row < gridSize; row++) {
    console.log(grid[row].join(' '));
  }
}

// Print path as arrows
function printPath(points) {
  const path = points.map(p => `(${p.x},${p.y})`).join(' → ');
  console.log(path);
}

console.log("=== Current U-fork (Hilbert) with direction=1 (RIGHT) ===");
for (let order = 1; order <= 3; order++) {
  const seq = generateUForkCurve(order);
  const gridSize = Math.pow(2, order);
  console.log(`\nOrder ${order} (${gridSize}x${gridSize}):`);
  const raw = curveToRawPoints(seq, 1);
  const norm = normalizePoints(raw, gridSize);
  printPath(norm);
  printGrid(norm, gridSize);
}

console.log("\n\n=== U-fork with direction=0 (UP) ===");
for (let order = 1; order <= 3; order++) {
  const seq = generateUForkCurve(order);
  const gridSize = Math.pow(2, order);
  console.log(`\nOrder ${order} (${gridSize}x${gridSize}):`);
  const raw = curveToRawPoints(seq, 0);
  const norm = normalizePoints(raw, gridSize);
  printPath(norm);
  printGrid(norm, gridSize);
}

console.log("\n\n=== U-fork with direction=2 (DOWN) ===");
for (let order = 1; order <= 3; order++) {
  const seq = generateUForkCurve(order);
  const gridSize = Math.pow(2, order);
  console.log(`\nOrder ${order} (${gridSize}x${gridSize}):`);
  const raw = curveToRawPoints(seq, 2);
  const norm = normalizePoints(raw, gridSize);
  printPath(norm);
  printGrid(norm, gridSize);
}

console.log("\n\n=== U-fork with direction=3 (LEFT) ===");
for (let order = 1; order <= 3; order++) {
  const seq = generateUForkCurve(order);
  const gridSize = Math.pow(2, order);
  console.log(`\nOrder ${order} (${gridSize}x${gridSize}):`);
  const raw = curveToRawPoints(seq, 3);
  const norm = normalizePoints(raw, gridSize);
  printPath(norm);
  printGrid(norm, gridSize);
}

// Now let's try with swapped L-system rules
// The target might use a different variant
console.log("\n\n=== Different L-system: A→+BF-AFA-FB+ B→-AF+BFB+FA- (swapped turns) ===");
function generateUForkVariant1(order) {
  let sequence = 'A';
  for (let i = 0; i < order; i++) {
    let newSequence = '';
    for (const char of sequence) {
      if (char === 'A') {
        newSequence += '+BF-AFA-FB+';
      } else if (char === 'B') {
        newSequence += '-AF+BFB+FA-';
      } else {
        newSequence += char;
      }
    }
    sequence = newSequence;
  }
  return sequence;
}

for (let dir = 0; dir <= 3; dir++) {
  console.log(`\n--- Direction=${dir} ---`);
  for (let order = 1; order <= 2; order++) {
    const seq = generateUForkVariant1(order);
    const gridSize = Math.pow(2, order);
    console.log(`Order ${order} (${gridSize}x${gridSize}):`);
    const raw = curveToRawPoints(seq, dir);
    const norm = normalizePoints(raw, gridSize);
    printPath(norm);
    printGrid(norm, gridSize);
  }
}

// Looking at the target image more carefully:
// Step 1 (2x2): It's a U-shape, like:
//   ┌──┐
//   │  │
//   │  │
//   The opening is on the bottom? Or the left?
//
// Actually from the image, the first pattern looks like a "C" opening to the left:
// Start bottom-left, go right, up, left - making a C shape
// OR: It could be bottom-right going left, up, right
//
// Let me also try the "raw" coordinates (without normalization flip)

console.log("\n\n=== Raw coordinates analysis ===");
for (let dir = 0; dir <= 3; dir++) {
  const seq = generateUForkCurve(1);
  const raw = curveToRawPoints(seq, dir);
  console.log(`Dir=${dir}: ${raw.map(p => `(${p.x},${p.y})`).join(' → ')}`);
}
