/**
 * Moore Curve Points Verification
 *
 * Verify exact point positions for Moore curve at various orders
 * to compare against reference implementations.
 */

import { generateMooreCurve, mooreCurveToPoints } from '../src/lib/algorithms/progressive/solution/moore.js';

console.log('=== Moore Curve Point-by-Point Verification ===\n');

// The key question: does mooreCurveToPoints produce a correct Moore curve?
// A correct Moore curve for order n (0-indexed iterations) should:
// 1. Have 4^(n+1) vertices (since axiom is order 1)
// 2. Fill a 2^(n+1) x 2^(n+1) grid
// 3. Visit every cell exactly once
// 4. Form a closed loop (first and last points are adjacent)

for (let iterations = 0; iterations <= 3; iterations++) {
  const gridSize = Math.pow(2, iterations + 1);
  const sequence = generateMooreCurve(iterations);
  const points = mooreCurveToPoints(sequence, gridSize);

  console.log(`\n--- Iterations=${iterations}, Grid=${gridSize}x${gridSize} ---`);
  console.log(`Total points: ${points.length}`);
  console.log(`Expected: ${gridSize * gridSize}`);

  // Check if it's a valid space-filling curve:
  // 1. All points should be unique
  const uniqueKeys = new Set(points.map(p => `${p.x},${p.y}`));
  console.log(`Unique points: ${uniqueKeys.size}`);
  console.log(`All unique: ${uniqueKeys.size === points.length}`);

  // 2. All grid cells should be visited (for a space-filling curve)
  // Grid cells are at integer coordinates from 0 to gridSize
  // Wait - the current code normalizes to [0, gridSize], not [0, gridSize-1]
  // This is a potential issue!
  const allGridCells = new Set();
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      allGridCells.add(`${x},${y}`);
    }
  }

  const missedCells = [...allGridCells].filter(c => !uniqueKeys.has(c));
  const extraCells = [...uniqueKeys].filter(c => !allGridCells.has(c));

  console.log(`Grid cells (0 to ${gridSize-1}): ${allGridCells.size}`);
  console.log(`Missed cells: ${missedCells.length}`);
  if (missedCells.length > 0 && missedCells.length <= 20) {
    console.log(`  Missing: ${missedCells.join(', ')}`);
  }
  console.log(`Extra cells (outside 0..${gridSize-1}): ${extraCells.length}`);
  if (extraCells.length > 0 && extraCells.length <= 20) {
    console.log(`  Extra: ${extraCells.join(', ')}`);
  }

  // Print the actual points for small grids
  if (gridSize <= 4) {
    console.log('\nPath:');
    points.forEach((p, i) => {
      const next = i < points.length - 1 ? points[i + 1] : points[0];
      const dx = next.x - p.x;
      const dy = next.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      console.log(`  ${i}: (${p.x}, ${p.y}) -> (${next.x}, ${next.y}) dist=${dist.toFixed(2)}`);
    });
  }

  // Check adjacency (consecutive points should be 1 unit apart)
  let nonAdjacentCount = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const dx = Math.abs(points[i + 1].x - points[i].x);
    const dy = Math.abs(points[i + 1].y - points[i].y);
    if (!((dx === 1 && dy === 0) || (dx === 0 && dy === 1))) {
      nonAdjacentCount++;
      if (nonAdjacentCount <= 5) {
        console.log(`  Non-adjacent: (${points[i].x},${points[i].y}) -> (${points[i+1].x},${points[i+1].y}) d=${Math.sqrt(dx*dx+dy*dy).toFixed(2)}`);
      }
    }
  }
  // Check if closed (last -> first adjacent)
  const dx = Math.abs(points[0].x - points[points.length - 1].x);
  const dy = Math.abs(points[0].y - points[points.length - 1].y);
  const isClosed = (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  console.log(`Non-adjacent consecutive pairs: ${nonAdjacentCount}`);
  console.log(`Closed loop (last->first adjacent): ${isClosed}`);
}

// Now let's check what happens with the CURRENT code's grid size mapping
console.log('\n\n=== Current Code Behavior ===\n');

// Current calculateMooreGridSize: order = max(1, min(4, floor(log2(gridSize)))), return 2^(order+1)
// Current moore.js order: max(1, round(log2(mooreGridSize)) - 1)

// For gridSize=10:
//   calculateMooreGridSize(10) -> order=max(1,min(4,3))=3 -> 2^4=16
//   moore.js: order=max(1, round(log2(16))-1) = max(1, 4-1) = 3
//   generateMooreCurve(3) -> 256 vertices for 16x16 grid ✓

// So the current code should be correct for the grid sizes it generates.
// But the normalization in mooreCurveToPoints scales to [0, mooreGridSize] not [0, mooreGridSize-1]!

console.log('Checking normalization issue:');
for (let iterations = 0; iterations <= 2; iterations++) {
  const gridSize = Math.pow(2, iterations + 1);
  const sequence = generateMooreCurve(iterations);

  // Current code normalizes to mooreGridSize (inclusive)
  const pointsInclusive = mooreCurveToPoints(sequence, gridSize);
  const maxX = Math.max(...pointsInclusive.map(p => p.x));
  const maxY = Math.max(...pointsInclusive.map(p => p.y));
  const minX = Math.min(...pointsInclusive.map(p => p.x));
  const minY = Math.min(...pointsInclusive.map(p => p.y));

  console.log(`\nIterations=${iterations}, gridSize=${gridSize}:`);
  console.log(`  Range X: [${minX}, ${maxX}], Range Y: [${minY}, ${maxY}]`);
  console.log(`  Expected range for ${gridSize}x${gridSize}: [0, ${gridSize-1}]`);
  console.log(`  Points span gridSize: x=${maxX === gridSize}, y=${maxY === gridSize}`);
  console.log(`  Points span gridSize-1: x=${maxX === gridSize - 1}, y=${maxY === gridSize - 1}`);
}
