/**
 * Analyze what grid size a Moore curve of each order ACTUALLY fills
 * when mooreCurveToPoints normalizes to a given grid size.
 *
 * Key question: What is the "natural" grid size for each order?
 */

import {
  generateMooreCurve,
  mooreCurveToPoints,
} from '../src/lib/algorithms/progressive/solutions/moore.js';

// For each order, how many unique vertices does the curve produce?
// A Moore curve of order n should produce 4^n curve points (including start)
// Moore curve fills a grid of size 2^n (from the Hilbert curve theory)
for (let order = 1; order <= 5; order++) {
  const sequence = generateMooreCurve(order);
  const moves = [...sequence].filter((c) => c === 'F').length;
  const totalRawPoints = moves + 1;

  // The natural number of distinct points is 4^n for Hilbert/Moore
  console.log(
    `Order ${order}: raw curve points = ${totalRawPoints}, expected 4^${order} = ${Math.pow(4, order)}`
  );

  // Try different grid sizes to find full coverage
  for (const gs of [2, 4, 8, 16, 32, 64]) {
    const curvePoints = mooreCurveToPoints(sequence, gs);
    const uniquePoints = new Set(curvePoints.map((p) => `${p.x},${p.y}`));
    const expectedVertices = (gs + 1) * (gs + 1);
    const coverage = (uniquePoints.size / expectedVertices) * 100;

    if (coverage === 100) {
      console.log(
        `  -> 100% coverage on ${gs}x${gs} grid (${uniquePoints.size} = (${gs}+1)^2 = ${expectedVertices})`
      );
    }
  }
}

// So the mapping is:
// Order 1 -> curve has 4^1 = 4 raw points, but after normalization...
// Let's check: order n, grid 2^n -> should give (2^n + 1)^2 unique points?
// No: 4^1 = 4, (2+1)^2 = 9 -- that doesn't match
// Actually the raw points include duplicates after normalization
// Let me check:
console.log('\n=== Detailed analysis ===');
for (let order = 1; order <= 4; order++) {
  const sequence = generateMooreCurve(order);
  const gridSize = Math.pow(2, order); // Try 2^order
  const curvePoints = mooreCurveToPoints(sequence, gridSize);
  const uniquePoints = new Set(curvePoints.map((p) => `${p.x},${p.y}`));

  console.log(`Order ${order}, grid ${gridSize}:`);
  console.log(`  Curve points (total): ${curvePoints.length}`);
  console.log(`  Unique positions: ${uniquePoints.size}`);
  console.log(`  Grid vertices: ${(gridSize + 1) * (gridSize + 1)}`);
  console.log(
    `  Coverage: ${((uniquePoints.size / ((gridSize + 1) * (gridSize + 1))) * 100).toFixed(1)}%`
  );
}

// The issue says the grid size selector should show valid Moore sizes: 2, 4, 8, 16, 32, 64
// Let's understand what "valid" means:
// If order = log2(mooreGridSize), then:
//   mooreGridSize=2 -> order=1
//   mooreGridSize=4 -> order=2
//   mooreGridSize=8 -> order=3
//   mooreGridSize=16 -> order=4
//   mooreGridSize=32 -> order=5
//   mooreGridSize=64 -> order=6
// These are powers of 2, and each gives 100% coverage as shown above

console.log('\n=== Valid grid sizes with order = log2(mooreGridSize) ===');
for (const gs of [2, 4, 8, 16, 32]) {
  const order = Math.round(Math.log2(gs));
  const sequence = generateMooreCurve(order);
  const curvePoints = mooreCurveToPoints(sequence, gs);
  const uniquePoints = new Set(curvePoints.map((p) => `${p.x},${p.y}`));
  const expectedVertices = (gs + 1) * (gs + 1);
  console.log(
    `Grid ${gs}, order ${order}: ${uniquePoints.size}/${expectedVertices} (${((uniquePoints.size / expectedVertices) * 100).toFixed(1)}%)`
  );
}
