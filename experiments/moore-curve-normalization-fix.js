/**
 * Verify the normalization fix for mooreCurveToPoints
 */

import { generateMooreCurve } from '../src/lib/algorithms/progressive/solutions/moore.js';

// The raw curve before normalization
function rawCurvePoints(sequence) {
  const points = [];
  let x = 0, y = 0;
  let direction = 0;
  points.push({ x, y });

  for (const char of sequence) {
    if (char === 'F') {
      if (direction === 0) y -= 1;
      else if (direction === 1) x += 1;
      else if (direction === 2) y += 1;
      else if (direction === 3) x -= 1;
      points.push({ x, y });
    } else if (char === '+') {
      direction = (direction + 1) % 4;
    } else if (char === '-') {
      direction = (direction + 3) % 4;
    }
  }
  return points;
}

// Correct normalization: scale to [0, gridSize-1] since gridSize = 2^(n+1) for n iterations
function correctNormalize(points, gridSize) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  const curveWidth = maxX - minX;
  const curveHeight = maxY - minY;

  // Scale to [0, gridSize - 1] to place on grid cells
  return points.map(p => ({
    x: Math.round(((p.x - minX) / curveWidth) * (gridSize - 1)),
    y: Math.round(((p.y - minY) / curveHeight) * (gridSize - 1)),
  }));
}

console.log('=== Verifying correct normalization ===\n');

for (let iterations = 0; iterations <= 4; iterations++) {
  const gridSize = Math.pow(2, iterations + 1);
  const sequence = generateMooreCurve(iterations);
  const raw = rawCurvePoints(sequence);
  const normalized = correctNormalize(raw, gridSize);

  const uniqueKeys = new Set(normalized.map(p => `${p.x},${p.y}`));
  const allGridCells = new Set();
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      allGridCells.add(`${x},${y}`);
    }
  }
  const missed = [...allGridCells].filter(c => !uniqueKeys.has(c));

  // Check adjacency
  let nonAdjacent = 0;
  for (let i = 0; i < normalized.length - 1; i++) {
    const dx = Math.abs(normalized[i + 1].x - normalized[i].x);
    const dy = Math.abs(normalized[i + 1].y - normalized[i].y);
    if (!((dx === 1 && dy === 0) || (dx === 0 && dy === 1))) {
      nonAdjacent++;
    }
  }
  const dx = Math.abs(normalized[0].x - normalized[normalized.length - 1].x);
  const dy = Math.abs(normalized[0].y - normalized[normalized.length - 1].y);
  const closed = (dx === 1 && dy === 0) || (dx === 0 && dy === 1);

  console.log(`Iterations=${iterations}, Grid=${gridSize}x${gridSize}:`);
  console.log(`  Vertices: ${normalized.length}, Expected: ${gridSize * gridSize}`);
  console.log(`  Unique: ${uniqueKeys.size}, All cells covered: ${missed.length === 0}`);
  console.log(`  Non-adjacent pairs: ${nonAdjacent}`);
  console.log(`  Closed loop: ${closed}`);

  if (gridSize <= 4) {
    console.log(`  Path: ${normalized.map(p => `(${p.x},${p.y})`).join(' -> ')}`);
  }
  console.log();
}

// Now verify what the reference Moore curve should look like for 2x2:
// According to Wikipedia, Moore curve of order 1 fills a 2x2 grid
// The axiom LFL+F+LFL (with 0 iterations) gives the basic shape:
// Start at (0,0), facing up:
//   L: no draw
//   F: move up (0,-1) -> (0,-1)
//   L: no draw
//   +: turn right
//   F: move right (1,-1)
//   +: turn right
//   L: no draw
//   F: move down (1,0)
//   L: no draw
// Points: (0,0) -> (0,-1) -> (1,-1) -> (1,0)
// Normalized to 2x2 grid (0..1):
// (0,1) -> (0,0) -> (1,0) -> (1,1)
// This visits all 4 cells of a 2x2 grid!

console.log('\n=== Reference Moore curve for 2x2 ===');
console.log('Expected: (0,1) -> (0,0) -> (1,0) -> (1,1)');
const seq0 = generateMooreCurve(0);
const raw0 = rawCurvePoints(seq0);
const norm0 = correctNormalize(raw0, 2);
console.log(`Got:      ${norm0.map(p => `(${p.x},${p.y})`).join(' -> ')}`);

console.log('\n=== Reference Moore curve for 4x4 ===');
const seq1 = generateMooreCurve(1);
const raw1 = rawCurvePoints(seq1);
const norm1 = correctNormalize(raw1, 4);
console.log(`Path: ${norm1.map(p => `(${p.x},${p.y})`).join(' -> ')}`);
// Print as grid
const grid4 = Array.from({length: 4}, () => Array(4).fill('.'));
norm1.forEach((p, i) => {
  grid4[p.y][p.x] = String(i).padStart(2);
});
console.log('\nGrid layout (visit order):');
for (let y = 0; y < 4; y++) {
  console.log(grid4[y].join(' '));
}
