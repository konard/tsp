/**
 * Experiment: Analyze Moore curve behavior with different order values
 * Goal: Understand the relationship between order, grid size, and coverage
 */

import {
  generateMooreCurve,
  mooreCurveToPoints,
} from '../src/lib/algorithms/progressive/solutions/moore.js';
import { calculateMooreGridSize } from '../src/lib/algorithms/utils.js';

// Test different orders to understand the curve size
for (let order = 1; order <= 4; order++) {
  const sequence = generateMooreCurve(order);
  // Generate points on a grid that matches
  const gridSize = Math.pow(2, order + 1); // Expected Moore grid
  const curvePoints = mooreCurveToPoints(sequence, gridSize);

  // Check unique points
  const uniquePoints = new Set(curvePoints.map((p) => `${p.x},${p.y}`));

  // Check grid coverage
  const expectedVertices = (gridSize + 1) * (gridSize + 1);

  console.log(`Order ${order}:`);
  console.log(`  Grid size: ${gridSize}x${gridSize}`);
  console.log(`  Total curve points: ${curvePoints.length}`);
  console.log(`  Unique curve points: ${uniquePoints.size}`);
  console.log(`  Expected grid vertices: ${expectedVertices}`);
  console.log(
    `  Coverage: ${((uniquePoints.size / expectedVertices) * 100).toFixed(1)}%`
  );

  // Check bounding box
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const p of curvePoints) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  console.log(`  Bounding box: (${minX},${minY}) to (${maxX},${maxY})`);
  console.log('');
}

// Now test what happens with the CURRENT order calculation: order = log2(mooreGridSize) - 1
console.log(
  '=== Current order calculation (order = log2(mooreGridSize) - 1) ==='
);
for (const mooreGridSize of [4, 8, 16, 32]) {
  const order = Math.max(1, Math.round(Math.log2(mooreGridSize)) - 1);
  const sequence = generateMooreCurve(order);
  const curvePoints = mooreCurveToPoints(sequence, mooreGridSize);
  const uniquePoints = new Set(curvePoints.map((p) => `${p.x},${p.y}`));
  const expectedVertices = (mooreGridSize + 1) * (mooreGridSize + 1);

  console.log(
    `mooreGridSize=${mooreGridSize}, order=${order}: ${uniquePoints.size}/${expectedVertices} vertices (${((uniquePoints.size / expectedVertices) * 100).toFixed(1)}%)`
  );

  // Check for cross-shaped gap (middle row and column)
  const midX = mooreGridSize / 2;
  const midY = mooreGridSize / 2;
  let hasMidX = false,
    hasMidY = false,
    hasCenterPoint = false;
  for (const p of curvePoints) {
    if (p.x === midX) {
      hasMidX = true;
    }
    if (p.y === midY) {
      hasMidY = true;
    }
    if (p.x === midX && p.y === midY) {
      hasCenterPoint = true;
    }
  }
  console.log(
    `  Center point (${midX},${midY}): ${hasCenterPoint ? 'COVERED' : 'MISSING'}`
  );
  console.log(`  Has points on x=${midX}: ${hasMidX}`);
  console.log(`  Has points on y=${midY}: ${hasMidY}`);
}

// Test with the FIXED order calculation: order = log2(mooreGridSize)
console.log('\n=== Fixed order calculation (order = log2(mooreGridSize)) ===');
for (const mooreGridSize of [4, 8, 16, 32]) {
  const order = Math.max(1, Math.round(Math.log2(mooreGridSize)));
  const sequence = generateMooreCurve(order);
  const curvePoints = mooreCurveToPoints(sequence, mooreGridSize);
  const uniquePoints = new Set(curvePoints.map((p) => `${p.x},${p.y}`));
  const expectedVertices = (mooreGridSize + 1) * (mooreGridSize + 1);

  console.log(
    `mooreGridSize=${mooreGridSize}, order=${order}: ${uniquePoints.size}/${expectedVertices} vertices (${((uniquePoints.size / expectedVertices) * 100).toFixed(1)}%)`
  );

  // Check for cross-shaped gap
  const midX = mooreGridSize / 2;
  const midY = mooreGridSize / 2;
  let hasMidX = false,
    hasMidY = false,
    hasCenterPoint = false;
  for (const p of curvePoints) {
    if (p.x === midX) {
      hasMidX = true;
    }
    if (p.y === midY) {
      hasMidY = true;
    }
    if (p.x === midX && p.y === midY) {
      hasCenterPoint = true;
    }
  }
  console.log(
    `  Center point (${midX},${midY}): ${hasCenterPoint ? 'COVERED' : 'MISSING'}`
  );
  console.log(`  Has points on x=${midX}: ${hasMidX}`);
  console.log(`  Has points on y=${midY}: ${hasMidY}`);
}

// Also test what calculateMooreGridSize currently does
console.log('\n=== Current calculateMooreGridSize behavior ===');
for (const gridSize of [2, 4, 5, 8, 10, 16, 20, 32, 50]) {
  console.log(
    `calculateMooreGridSize(${gridSize}) = ${calculateMooreGridSize(gridSize)}`
  );
}
