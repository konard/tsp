/**
 * Experiment: Test different order calculations for Moore curve
 */

import {
  generateMooreCurve,
  mooreCurveToPoints,
} from '../src/lib/algorithms/progressive/solutions/moore.js';

// Test: what does each order actually produce?
for (let order = 1; order <= 4; order++) {
  const sequence = generateMooreCurve(order);
  // Count F characters (forward moves) = number of edges = points - 1
  const fCount = [...sequence].filter((c) => c === 'F').length;
  console.log(`Order ${order}: F count = ${fCount}, points = ${fCount + 1}`);

  // Generate points on different grid sizes and check coverage
  for (const gridSize of [2, 4, 8, 16]) {
    const curvePoints = mooreCurveToPoints(sequence, gridSize);
    const uniquePoints = new Set(curvePoints.map((p) => `${p.x},${p.y}`));
    const totalVertices = (gridSize + 1) * (gridSize + 1);
    const coverage = ((uniquePoints.size / totalVertices) * 100).toFixed(1);

    // Count missed midpoints
    let missedCenter = false;
    const mid = gridSize / 2;
    if (!uniquePoints.has(`${mid},${mid}`)) {
      missedCenter = true;
    }

    console.log(
      `  gridSize=${gridSize}: ${uniquePoints.size}/${totalVertices} vertices (${coverage}%), center covered: ${!missedCenter}`
    );
  }
}

// The correct mapping:
// Order 1: 2x2 grid = 4 points
// Order 2: 4x4 grid = 16 points
// Order 3: 8x8 grid = 64 points
// So: order = log2(gridSize)
// Currently code uses: order = log2(mooreGridSize) - 1 which is WRONG
// For mooreGridSize=4: order=1, but should be order=2
// For mooreGridSize=8: order=2, but should be order=3

console.log('\n=== Correct mapping test ===');
for (const mooreGridSize of [2, 4, 8, 16, 32, 64]) {
  const correctOrder = Math.log2(mooreGridSize);
  const wrongOrder = Math.max(1, Math.round(Math.log2(mooreGridSize)) - 1);
  console.log(
    `mooreGridSize=${mooreGridSize}: correct order=${correctOrder}, current wrong order=${wrongOrder}`
  );

  if (correctOrder <= 5) {
    const sequence = generateMooreCurve(correctOrder);
    const curvePoints = mooreCurveToPoints(sequence, mooreGridSize);
    const uniquePoints = new Set(curvePoints.map((p) => `${p.x},${p.y}`));
    const totalVertices = (mooreGridSize + 1) * (mooreGridSize + 1);
    console.log(
      `  With correct order: ${uniquePoints.size}/${totalVertices} coverage`
    );

    // Check for cross pattern (missed center lines)
    let missedMidRow = 0;
    let missedMidCol = 0;
    const mid = mooreGridSize / 2;
    for (let i = 0; i <= mooreGridSize; i++) {
      if (!uniquePoints.has(`${mid},${i}`)) {
        missedMidCol++;
      }
      if (!uniquePoints.has(`${i},${mid}`)) {
        missedMidRow++;
      }
    }
    console.log(
      `  Missed in middle row: ${missedMidRow}, middle col: ${missedMidCol}`
    );
  }
}
