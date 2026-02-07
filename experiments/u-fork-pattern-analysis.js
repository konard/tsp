/**
 * U-fork Fractal Pattern Analysis
 *
 * The U-fork is a Hilbert-curve variant space-filling curve.
 * This experiment verifies the exact path generation.
 *
 * L-system rules for Hilbert curve:
 * Axiom: A
 * A -> -BF+AFA+FB-
 * B -> +AF-BFB-FA+
 *
 * Where:
 *   F = move forward
 *   + = turn right 90°
 *   - = turn left 90°
 *   A, B = non-drawing variables (production rules only)
 */

// Generate Hilbert curve L-system sequence
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

// Convert to points using turtle graphics
function uForkCurveToPoints(sequence, gridSize) {
  const curvePoints = [];
  let x = 0;
  let y = 0;
  // Direction: 0=up, 1=right, 2=down, 3=left
  let direction = 0;

  curvePoints.push({ x, y });

  for (const char of sequence) {
    if (char === 'F') {
      if (direction === 0) y -= 1;
      else if (direction === 1) x += 1;
      else if (direction === 2) y += 1;
      else if (direction === 3) x -= 1;
      curvePoints.push({ x, y });
    } else if (char === '+') {
      direction = (direction + 1) % 4;
    } else if (char === '-') {
      direction = (direction + 3) % 4;
    }
    // A and B are ignored (non-drawing)
  }

  // Normalize to [0, gridSize-1]
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of curvePoints) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }

  const curveWidth = maxX - minX;
  const curveHeight = maxY - minY;

  if (curveWidth === 0 && curveHeight === 0) {
    return curvePoints.map(() => ({ x: 0, y: 0 }));
  }

  const normalizedPoints = curvePoints.map((p) => ({
    x: curveWidth === 0 ? 0 : Math.round(((p.x - minX) / curveWidth) * (gridSize - 1)),
    y: curveHeight === 0 ? 0 : Math.round(((p.y - minY) / curveHeight) * (gridSize - 1)),
  }));

  return normalizedPoints;
}

console.log('=== U-fork (Hilbert) Curve Analysis ===\n');

for (let order = 1; order <= 4; order++) {
  const gridSize = Math.pow(2, order);
  const sequence = generateUForkCurve(order);
  const points = uForkCurveToPoints(sequence, gridSize);

  console.log(`\n--- Order ${order}, Grid ${gridSize}x${gridSize} ---`);
  console.log(`Points count: ${points.length}`);
  console.log(`Expected: ${gridSize * gridSize}`);

  // Check uniqueness
  const unique = new Set(points.map(p => `${p.x},${p.y}`));
  console.log(`Unique: ${unique.size}`);
  console.log(`All cells visited: ${unique.size === gridSize * gridSize}`);

  // Check adjacency
  let nonAdj = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const dx = Math.abs(points[i + 1].x - points[i].x);
    const dy = Math.abs(points[i + 1].y - points[i].y);
    if (!((dx === 1 && dy === 0) || (dx === 0 && dy === 1))) {
      nonAdj++;
      if (nonAdj <= 3) {
        console.log(`  Non-adj at ${i}: (${points[i].x},${points[i].y})->(${points[i+1].x},${points[i+1].y})`);
      }
    }
  }
  console.log(`Non-adjacent pairs: ${nonAdj}`);

  // Check bounds
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  console.log(`Bounds: x=[${minX},${maxX}] y=[${minY},${maxY}]`);

  // Print path for small grids
  if (gridSize <= 4) {
    console.log('Path:');
    points.forEach((p, i) => {
      console.log(`  ${i}: (${p.x}, ${p.y})`);
    });
  }

  // Is it a closed loop? (first and last adjacent)
  const dx = Math.abs(points[0].x - points[points.length - 1].x);
  const dy = Math.abs(points[0].y - points[points.length - 1].y);
  const closed = (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  console.log(`Closed loop: ${closed}`);
}

// Visualize the 4x4 grid
console.log('\n=== Visual representation (4x4) ===');
const order2 = generateUForkCurve(2);
const pts4 = uForkCurveToPoints(order2, 4);
const grid4 = Array.from({ length: 4 }, () => Array(4).fill('.'));
pts4.forEach((p, i) => {
  grid4[p.y][p.x] = String(i).padStart(2);
});
for (let y = 0; y < 4; y++) {
  console.log(grid4[y].join(' '));
}

console.log('\n=== Visual representation (8x8) ===');
const order3 = generateUForkCurve(3);
const pts8 = uForkCurveToPoints(order3, 8);
const grid8 = Array.from({ length: 8 }, () => Array(8).fill('..'));
pts8.forEach((p, i) => {
  grid8[p.y][p.x] = String(i).padStart(2);
});
for (let y = 0; y < 8; y++) {
  console.log(grid8[y].join(' '));
}
