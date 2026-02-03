/**
 * Experiment: Test Sierpiński curve generation
 * Verifies the curve fills the grid space correctly.
 */

import {
  generateSierpinskiCurve,
  sierpinskiCurveToPoints,
  sierpinskiSolution,
} from '../src/lib/algorithms/atomic/solution/sierpinski.js';
import { generateRandomPoints, calculateTotalDistance } from '../src/lib/algorithms/utils.js';

// Test curve generation at different orders
for (let order = 0; order <= 3; order++) {
  const seq = generateSierpinskiCurve(order);
  const fCount = [...seq].filter((c) => c === 'F').length;
  console.log(`Order ${order}: F-moves = ${fCount}, sequence length = ${seq.length}`);
}

// Test curve to points conversion
for (let order = 0; order <= 3; order++) {
  const gridSize = Math.pow(2, order + 1);
  const seq = generateSierpinskiCurve(order);
  const points = sierpinskiCurveToPoints(seq, gridSize);
  console.log(`Order ${order}, grid ${gridSize}x${gridSize}: ${points.length} curve points`);

  // Check bounding box
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  console.log(`  Bounding box: (${minX},${minY}) to (${maxX},${maxY})`);
}

// Test as TSP solver
const gridSize = 16;
const numPoints = 20;
const testPoints = generateRandomPoints(gridSize, numPoints);
console.log(`\nTesting TSP with ${numPoints} points on ${gridSize}x${gridSize} grid:`);

const result = sierpinskiSolution(testPoints, gridSize);
console.log(`Tour: ${result.tour.join(' → ')}`);
console.log(`Tour length: ${result.tour.length}`);
console.log(`Curve points: ${result.curvePoints.length}`);
const dist = calculateTotalDistance(result.tour, testPoints);
console.log(`Total distance: ${dist.toFixed(2)}`);
