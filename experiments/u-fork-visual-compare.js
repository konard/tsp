/**
 * Create ASCII art representations of the U-fork curves
 * to visually compare with the target image.
 *
 * The target image shows curves with thick lines on a grid.
 * Let's draw them as ASCII art with connections between cells.
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
  // Create a grid with connections
  // Each cell is 3 chars wide, 2 chars tall
  const width = gridSize * 4 - 1;
  const height = gridSize * 2 - 1;
  const canvas = Array.from({ length: height }, () => Array(width).fill(' '));

  // Place nodes
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const cx = p.x * 4;
    const cy = p.y * 2;
    canvas[cy][cx] = '●';
  }

  // Draw connections between consecutive points
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const ax = a.x * 4, ay = a.y * 2;
    const bx = b.x * 4, by = b.y * 2;

    if (ax === bx) {
      // Vertical connection
      const minY = Math.min(ay, by);
      const maxY = Math.max(ay, by);
      for (let y = minY + 1; y < maxY; y++) {
        canvas[y][ax] = '│';
      }
    } else {
      // Horizontal connection
      const minX = Math.min(ax, bx);
      const maxX = Math.max(ax, bx);
      for (let x = minX + 1; x < maxX; x++) {
        canvas[ay][x] = '─';
      }
    }
  }

  // Print
  for (const row of canvas) {
    console.log(row.join(''));
  }
}

// The current implementation uses direction=1
console.log("=== Current U-fork (direction=1, Hilbert-style) ===\n");

for (let order = 1; order <= 3; order++) {
  const gridSize = Math.pow(2, order);
  console.log(`Step ${order} (${gridSize}x${gridSize}):`);
  const seq = generateUForkCurve(order);
  const raw = curveToPoints(seq, 1);
  const norm = normalizePoints(raw, gridSize);
  drawASCII(norm, gridSize);
  console.log(`Start: (${norm[0].x},${norm[0].y}), End: (${norm[norm.length-1].x},${norm[norm.length-1].y})\n`);
}

// Let's also check what the target pattern looks like
// From the image:
// Step 1: A "C" shape opening to the left
// The path goes: bottom-right → bottom-left → top-left → top-right
//   ┌──┐
//   │  │
//   └──┘  <- but open on one side
//
// Actually looking more carefully at the target:
// Step 1 shows a curve that looks like the letter "C" opening to the RIGHT
// or a U opening upward

// Let me try flipping Y axis
console.log("=== U-fork (direction=1) with Y-axis flipped ===\n");
for (let order = 1; order <= 3; order++) {
  const gridSize = Math.pow(2, order);
  console.log(`Step ${order} (${gridSize}x${gridSize}):`);
  const seq = generateUForkCurve(order);
  const raw = curveToPoints(seq, 1);
  const norm = normalizePoints(raw, gridSize);
  // Flip Y
  const flipped = norm.map(p => ({ x: p.x, y: gridSize - 1 - p.y }));
  drawASCII(flipped, gridSize);
  console.log(`Start: (${flipped[0].x},${flipped[0].y}), End: (${flipped[flipped.length-1].x},${flipped[flipped.length-1].y})\n`);
}

// Also try X flip
console.log("=== U-fork (direction=1) with X-axis flipped ===\n");
for (let order = 1; order <= 3; order++) {
  const gridSize = Math.pow(2, order);
  console.log(`Step ${order} (${gridSize}x${gridSize}):`);
  const seq = generateUForkCurve(order);
  const raw = curveToPoints(seq, 1);
  const norm = normalizePoints(raw, gridSize);
  // Flip X
  const flipped = norm.map(p => ({ x: gridSize - 1 - p.x, y: p.y }));
  drawASCII(flipped, gridSize);
  console.log(`Start: (${flipped[0].x},${flipped[0].y}), End: (${flipped[flipped.length-1].x},${flipped[flipped.length-1].y})\n`);
}

// Both axes flipped
console.log("=== U-fork (direction=1) with both axes flipped ===\n");
for (let order = 1; order <= 3; order++) {
  const gridSize = Math.pow(2, order);
  console.log(`Step ${order} (${gridSize}x${gridSize}):`);
  const seq = generateUForkCurve(order);
  const raw = curveToPoints(seq, 1);
  const norm = normalizePoints(raw, gridSize);
  const flipped = norm.map(p => ({ x: gridSize - 1 - p.x, y: gridSize - 1 - p.y }));
  drawASCII(flipped, gridSize);
  console.log(`Start: (${flipped[0].x},${flipped[0].y}), End: (${flipped[flipped.length-1].x},${flipped[flipped.length-1].y})\n`);
}

// Try direction=0 (UP) - the standard Hilbert curve
console.log("=== Standard Hilbert curve (direction=0) ===\n");
for (let order = 1; order <= 3; order++) {
  const gridSize = Math.pow(2, order);
  console.log(`Step ${order} (${gridSize}x${gridSize}):`);
  const seq = generateUForkCurve(order);
  const raw = curveToPoints(seq, 0);
  const norm = normalizePoints(raw, gridSize);
  drawASCII(norm, gridSize);
  console.log(`Start: (${norm[0].x},${norm[0].y}), End: (${norm[norm.length-1].x},${norm[norm.length-1].y})\n`);
}
