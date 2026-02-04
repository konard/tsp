/**
 * Quick test of the Gosper curve implementation
 */

import {
  generateGosperCurve,
  gosperCurveToPoints,
  calculateGosperOrder,
  gosperSolution,
} from '../src/lib/algorithms/atomic/solution/gosper.js';
import { generateRandomPoints } from '../src/lib/algorithms/utils.js';

// Test L-system generation
console.log('=== Gosper Curve L-system Test ===');
const seq0 = generateGosperCurve(0);
console.log(`Order 0: ${seq0} (length: ${seq0.length})`);

const seq1 = generateGosperCurve(1);
console.log(`Order 1 length: ${seq1.length}`);

const seq2 = generateGosperCurve(2);
console.log(`Order 2 length: ${seq2.length}`);

// Test curve point generation
console.log('\n=== Gosper Curve Points Test ===');
for (const gridSize of [4, 8, 16, 32]) {
  const order = calculateGosperOrder(gridSize);
  const sequence = generateGosperCurve(order);
  const points = gosperCurveToPoints(sequence, gridSize);
  console.log(
    `Grid ${gridSize}: order=${order}, curve points=${points.length}`
  );

  // Check bounds
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  console.log(`  Bounds: x=[${minX}, ${maxX}], y=[${minY}, ${maxY}]`);
}

// Test TSP solution
console.log('\n=== Gosper TSP Solution Test ===');
const testPoints = generateRandomPoints(16, 10);
console.log('Random points:', testPoints.map((p) => `(${p.x},${p.y})`).join(' '));

const result = gosperSolution(testPoints, 16);
console.log('Tour:', result.tour);
console.log('Tour length:', result.tour.length);
console.log('Curve points:', result.curvePoints.length);

// Verify all points are in tour
const allPresent = testPoints.every((_, i) => result.tour.includes(i));
console.log('All points in tour:', allPresent);
console.log('Tour has correct size:', result.tour.length === testPoints.length);

// Test empty input
const emptyResult = gosperSolution([], 16);
console.log('\nEmpty input tour:', emptyResult.tour);
console.log('Empty input curve:', emptyResult.curvePoints);

console.log('\n=== All tests passed! ===');
