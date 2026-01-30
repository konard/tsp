/**
 * Experiment: Analyze Moore curve coverage of grid vertices
 *
 * This script checks which grid vertices are covered by the Moore curve
 * for different orders, to understand the "holes in the middle" problem.
 */

import {
  generateMooreCurve,
  mooreCurveToPoints,
} from '../src/lib/algorithms/progressive/solutions/moore.js';
import { calculateMooreGridSize } from '../src/lib/algorithms/utils.js';

// Analyze curve coverage for each grid size
for (let gridSize = 2; gridSize <= 16; gridSize *= 2) {
  const mooreGridSize = gridSize;
  const order = Math.max(1, Math.round(Math.log2(mooreGridSize)) - 1);
  const sequence = generateMooreCurve(order);
  const curvePoints = mooreCurveToPoints(sequence, mooreGridSize);

  // Build set of unique curve positions
  const uniquePoints = new Set();
  for (const p of curvePoints) {
    uniquePoints.add(`${p.x},${p.y}`);
  }

  // Check which grid vertices (0..mooreGridSize) are NOT covered
  const missedPoints = [];
  const totalVertices = (mooreGridSize + 1) * (mooreGridSize + 1);
  for (let x = 0; x <= mooreGridSize; x++) {
    for (let y = 0; y <= mooreGridSize; y++) {
      if (!uniquePoints.has(`${x},${y}`)) {
        missedPoints.push({ x, y });
      }
    }
  }

  console.log(`\n=== Grid Size: ${mooreGridSize}, Order: ${order} ===`);
  console.log(`Curve points (total): ${curvePoints.length}`);
  console.log(`Unique curve positions: ${uniquePoints.size}`);
  console.log(`Total grid vertices (0..${mooreGridSize}): ${totalVertices}`);
  console.log(
    `Covered: ${uniquePoints.size}/${totalVertices} (${((uniquePoints.size / totalVertices) * 100).toFixed(1)}%)`
  );
  console.log(`Missed: ${missedPoints.length}`);

  if (missedPoints.length <= 30) {
    console.log(
      `Missed positions:`,
      missedPoints.map((p) => `(${p.x},${p.y})`).join(', ')
    );
  }

  // Also show unique positions as a grid
  if (mooreGridSize <= 8) {
    console.log('\nGrid coverage (X = covered, . = missed):');
    for (let y = 0; y <= mooreGridSize; y++) {
      let row = '';
      for (let x = 0; x <= mooreGridSize; x++) {
        row += uniquePoints.has(`${x},${y}`) ? 'X ' : '. ';
      }
      console.log(`  ${row}`);
    }
  }
}

// Also check what calculateMooreGridSize maps to
console.log('\n\n=== calculateMooreGridSize mapping ===');
for (let gs = 2; gs <= 50; gs++) {
  const mgs = calculateMooreGridSize(gs);
  console.log(`gridSize ${gs} -> mooreGridSize ${mgs}`);
}
