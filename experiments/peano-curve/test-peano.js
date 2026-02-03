/**
 * Experiment: Verify Peano curve generation
 */

import {
  generatePeanoCurve,
  peanoCurveToPoints,
  peanoSolution,
} from '../../src/lib/algorithms/atomic/solution/peano.js';
import { distance } from '../../src/lib/algorithms/utils.js';

// Test order 1: should produce a 3x3 grid (9 points)
console.log('=== Order 1 (3x3 grid) ===');
const seq1 = generatePeanoCurve(1);
const pts1 = peanoCurveToPoints(seq1, 3);
console.log(`Points: ${pts1.length}`);
console.log(
  'Coordinates:',
  pts1.map((p) => `(${p.x},${p.y})`)
);

// Check uniqueness
const unique1 = new Set(pts1.map((p) => `${p.x},${p.y}`));
console.log(`Unique: ${unique1.size}`);

// Check adjacency
let allAdjacent1 = true;
for (let i = 0; i < pts1.length - 1; i++) {
  const d = distance(pts1[i], pts1[i + 1]);
  if (d > 1.001) {
    console.log(`Non-adjacent at ${i}: ${d} from (${pts1[i].x},${pts1[i].y}) to (${pts1[i + 1].x},${pts1[i + 1].y})`);
    allAdjacent1 = false;
  }
}
console.log(`All consecutive adjacent: ${allAdjacent1}`);

// Test order 2: should produce a 9x9 grid (81 points)
console.log('\n=== Order 2 (9x9 grid) ===');
const seq2 = generatePeanoCurve(2);
const pts2 = peanoCurveToPoints(seq2, 9);
console.log(`Points: ${pts2.length}`);
const unique2 = new Set(pts2.map((p) => `${p.x},${p.y}`));
console.log(`Unique: ${unique2.size}`);

let allAdjacent2 = true;
for (let i = 0; i < pts2.length - 1; i++) {
  const d = distance(pts2[i], pts2[i + 1]);
  if (d > 1.001) {
    allAdjacent2 = false;
  }
}
console.log(`All consecutive adjacent: ${allAdjacent2}`);

// Check bounds
let inBounds2 = true;
for (const p of pts2) {
  if (p.x < 0 || p.x > 8 || p.y < 0 || p.y > 8) {
    inBounds2 = false;
  }
}
console.log(`All in bounds [0,8]: ${inBounds2}`);

// Test order 3: should produce a 27x27 grid (729 points)
console.log('\n=== Order 3 (27x27 grid) ===');
const seq3 = generatePeanoCurve(3);
const pts3 = peanoCurveToPoints(seq3, 27);
console.log(`Points: ${pts3.length}`);
const unique3 = new Set(pts3.map((p) => `${p.x},${p.y}`));
console.log(`Unique: ${unique3.size}`);

let allAdjacent3 = true;
for (let i = 0; i < pts3.length - 1; i++) {
  const d = distance(pts3[i], pts3[i + 1]);
  if (d > 1.001) {
    allAdjacent3 = false;
  }
}
console.log(`All consecutive adjacent: ${allAdjacent3}`);

// Test TSP solution
console.log('\n=== TSP Solution Test ===');
const testPoints = [
  { x: 0, y: 0, id: 0 },
  { x: 8, y: 0, id: 1 },
  { x: 8, y: 8, id: 2 },
  { x: 0, y: 8, id: 3 },
  { x: 4, y: 4, id: 4 },
];
const result = peanoSolution(testPoints, 9);
console.log(`Tour: ${result.tour}`);
console.log(`Curve points: ${result.curvePoints.length}`);
