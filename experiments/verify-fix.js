/**
 * Verify the normalization fix works with existing calculateMooreGridSize
 */
import { generateMooreCurve, mooreCurveToPoints } from '../src/lib/algorithms/progressive/solutions/moore.js';
import { calculateMooreGridSize } from '../src/lib/algorithms/utils.js';

// Test with current calculateMooreGridSize values
for (const gridSize of [5, 10, 20, 30]) {
  const mooreGridSize = calculateMooreGridSize(gridSize);
  const order = Math.max(1, Math.round(Math.log2(mooreGridSize)) - 1);
  const sequence = generateMooreCurve(order);
  const points = mooreCurveToPoints(sequence, mooreGridSize);

  const uniqueKeys = new Set(points.map(p => `${p.x},${p.y}`));
  const maxX = Math.max(...points.map(p => p.x));
  const maxY = Math.max(...points.map(p => p.y));
  const minX = Math.min(...points.map(p => p.x));
  const minY = Math.min(...points.map(p => p.y));

  // Check all grid cells covered
  const allGridCells = new Set();
  for (let x = 0; x < mooreGridSize; x++) {
    for (let y = 0; y < mooreGridSize; y++) {
      allGridCells.add(`${x},${y}`);
    }
  }
  const missed = [...allGridCells].filter(c => !uniqueKeys.has(c));

  // Check adjacency
  let nonAdjacent = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const dx = Math.abs(points[i + 1].x - points[i].x);
    const dy = Math.abs(points[i + 1].y - points[i].y);
    if (!((dx === 1 && dy === 0) || (dx === 0 && dy === 1))) nonAdjacent++;
  }

  console.log(`gridSize=${gridSize} -> mooreGridSize=${mooreGridSize}, order=${order}:`);
  console.log(`  Vertices: ${points.length}, Expected: ${mooreGridSize * mooreGridSize}`);
  console.log(`  Range: [${minX},${minY}] to [${maxX},${maxY}]`);
  console.log(`  Unique: ${uniqueKeys.size}`);
  console.log(`  All cells [0..${mooreGridSize-1}] covered: ${missed.length === 0}`);
  console.log(`  Non-adjacent pairs: ${nonAdjacent}`);
  console.log();
}
