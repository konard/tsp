/**
 * Moore Curve Analysis Experiment
 *
 * Analyzes the Moore curve L-system to verify correct behavior
 * at different orders and grid sizes.
 */

import { generateMooreCurve, mooreCurveToPoints } from '../src/lib/algorithms/progressive/solution/moore.js';
import { calculateMooreGridSize } from '../src/lib/algorithms/utils.js';

// Analyze the Moore curve at different orders
console.log('=== Moore Curve Analysis ===\n');

// According to Wikipedia:
// Moore curve of order n fills a 2^n x 2^n grid
// Number of vertices = 4^n = (2^n)^2
// L-system: Axiom = LFL+F+LFL, L -> -RF+LFL+FR-, R -> +LF-RFR-FL+

// The axiom LFL+F+LFL already represents a "base" structure.
// When we apply 0 iterations of the rules (order=0), we just process the axiom.
// When we apply 1 iteration (order=1), we expand L and R once.

// Let's see what the current code produces:
for (let order = 0; order <= 4; order++) {
  const sequence = generateMooreCurve(order);
  const fCount = [...sequence].filter(c => c === 'F').length;
  const numVertices = fCount + 1; // vertices = edges + 1

  // Try different grid sizes
  const gridSize = Math.pow(2, order + 1); // According to current code's assumption
  const points = mooreCurveToPoints(sequence, gridSize);

  // Find unique points
  const uniquePoints = new Set(points.map(p => `${p.x},${p.y}`));

  console.log(`Order ${order}:`);
  console.log(`  F count (edges): ${fCount}`);
  console.log(`  Vertices: ${numVertices}`);
  console.log(`  Expected grid: 2^${order+1} = ${gridSize} (if order maps to 2^(n+1))`);
  console.log(`  Alt expected grid: 2^${order} = ${Math.pow(2, order)} (if order maps to 2^n)`);
  console.log(`  Expected vertices for 2^(n+1): ${gridSize * gridSize}`);
  console.log(`  Expected vertices for 2^n: ${Math.pow(2, order) * Math.pow(2, order)}`);
  console.log(`  Actual unique points (grid=${gridSize}): ${uniquePoints.size}`);
  console.log(`  Ratio actual/expected(2^(n+1)): ${numVertices / (gridSize * gridSize)}`);
  console.log(`  Ratio actual/expected(2^n): ${numVertices / (Math.pow(2, order) * Math.pow(2, order))}`);
  console.log();
}

console.log('\n=== Testing with correct grid size mapping ===\n');
// If Moore curve order n fills 2^n x 2^n grid, then:
// - For generateMooreCurve(n) to produce 4^n vertices,
//   we need to understand what "n" means in the L-system context
//
// The axiom LFL+F+LFL has 3 F's = 4 vertices
// After 1 iteration, each L/R expands to include more F's
//
// Let's count precisely:

for (let iterations = 0; iterations <= 4; iterations++) {
  const sequence = generateMooreCurve(iterations);
  const fCount = [...sequence].filter(c => c === 'F').length;
  const numVertices = fCount + 1;

  // The axiom itself (0 iterations) gives 4 vertices = 2x2 grid
  // So 0 iterations -> order 1 Moore curve (2x2)
  // 1 iteration -> order 2 Moore curve (4x4)
  // n iterations -> order (n+1) Moore curve (2^(n+1) x 2^(n+1))

  const effectiveOrder = iterations + 1;
  const expectedGridSize = Math.pow(2, effectiveOrder);
  const expectedVertices = expectedGridSize * expectedGridSize;

  console.log(`Iterations=${iterations} -> Effective order ${effectiveOrder}:`);
  console.log(`  Vertices: ${numVertices}, Expected: ${expectedVertices}, Match: ${numVertices === expectedVertices}`);
  console.log(`  Grid: ${expectedGridSize}x${expectedGridSize}`);

  // Also test the normalized points
  const points = mooreCurveToPoints(sequence, expectedGridSize);
  const uniquePoints = new Set(points.map(p => `${p.x},${p.y}`));
  console.log(`  Unique normalized points (grid=${expectedGridSize}): ${uniquePoints.size}`);

  if (expectedGridSize <= 4) {
    console.log(`  All points:`, points.map(p => `(${p.x},${p.y})`).join(' -> '));
  }
  console.log();
}

console.log('\n=== Current calculateMooreGridSize behavior ===\n');
for (let gs = 2; gs <= 50; gs += 5) {
  console.log(`gridSize=${gs} -> mooreGridSize=${calculateMooreGridSize(gs)}`);
}

console.log('\n=== Current order calculation in moore.js ===\n');
// Current: order = Math.max(1, Math.round(Math.log2(mooreGridSize)) - 1)
for (const mgs of [4, 8, 16, 32, 64]) {
  const currentOrder = Math.max(1, Math.round(Math.log2(mgs)) - 1);
  const correctOrder = Math.round(Math.log2(mgs)); // If order = log2(gridSize)
  const correctIterations = Math.round(Math.log2(mgs)) - 1; // iterations = order - 1

  const seqCurrent = generateMooreCurve(currentOrder);
  const seqCorrect = generateMooreCurve(correctIterations);

  const currentVertices = [...seqCurrent].filter(c => c === 'F').length + 1;
  const correctVertices = [...seqCorrect].filter(c => c === 'F').length + 1;

  console.log(`mooreGridSize=${mgs}:`);
  console.log(`  Current order: ${currentOrder} -> ${currentVertices} vertices (need ${mgs*mgs})`);
  console.log(`  Correct iterations: ${correctIterations} -> ${correctVertices} vertices (need ${mgs*mgs})`);
  console.log(`  Current fills grid: ${currentVertices === mgs*mgs}`);
  console.log(`  Correct fills grid: ${correctVertices === mgs*mgs}`);
}
