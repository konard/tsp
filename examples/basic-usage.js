/**
 * Basic usage example
 * Demonstrates how to use the package
 *
 * Run with any runtime:
 * - Bun: bun examples/basic-usage.js
 * - Node.js: node examples/basic-usage.js
 * - Deno: deno run examples/basic-usage.js
 */

import { atomic, calculateTotalDistance } from '../src/lib/index.js';

const { sonarSolution, mooreSolution } = atomic;

// Example: Generate random points
const points = [
  { x: 0, y: 0, id: 0 },
  { x: 5, y: 5, id: 1 },
  { x: 10, y: 2, id: 2 },
  { x: 3, y: 8, id: 3 },
  { x: 7, y: 7, id: 4 },
];

console.log('TSP Algorithm Examples:');
console.log('======================\n');

// Example: Using Sonar algorithm
console.log('Sonar Algorithm:');
const sonarResult = sonarSolution(points);
const sonarDistance = calculateTotalDistance(sonarResult.tour, points);
console.log(`  Tour: ${sonarResult.tour.join(' → ')}`);
console.log(`  Distance: ${sonarDistance.toFixed(2)}\n`);

// Example: Using Moore Curve algorithm
console.log('Moore Curve Algorithm:');
const mooreResult = mooreSolution(points, 16);
const mooreDistance = calculateTotalDistance(mooreResult.tour, points);
console.log(`  Tour: ${mooreResult.tour.join(' → ')}`);
console.log(`  Distance: ${mooreDistance.toFixed(2)}`);
