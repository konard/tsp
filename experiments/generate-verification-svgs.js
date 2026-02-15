/**
 * Generate verification SVGs for the space-filling tree walking pattern.
 * These SVGs should match the reference images provided by the user.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { generateSpaceFillingTreeCurve } from '../src/lib/algorithms/atomic/solution/space-filling-tree.js';

// Ensure docs/screenshots directory exists
try {
  mkdirSync('docs/screenshots', { recursive: true });
} catch (e) {
  // Already exists
}

function generateWalkSVG(points, title, viewSize = 400) {
  const padding = 40;
  const gridSize = Math.max(...points.map((p) => Math.max(p.x, p.y))) + 1;
  const cellSize = (viewSize - 2 * padding) / Math.max(gridSize - 1, 1);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewSize} ${viewSize}" width="${viewSize}" height="${viewSize}">`;
  svg += `<rect width="${viewSize}" height="${viewSize}" fill="white"/>`;
  svg += `<text x="${viewSize / 2}" y="25" text-anchor="middle" font-size="16" font-family="sans-serif" fill="black">${title}</text>`;

  // Draw grid dots
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cx = padding + x * cellSize;
      const cy = padding + y * cellSize;
      svg += `<circle cx="${cx}" cy="${cy}" r="4" fill="#ddd"/>`;
    }
  }

  // Draw path with thick stroke
  let pathD = '';
  points.forEach((p, i) => {
    const cx = padding + p.x * cellSize;
    const cy = padding + p.y * cellSize;
    pathD += (i === 0 ? 'M' : 'L') + ` ${cx} ${cy} `;
  });
  // Close the loop
  if (points.length > 0) {
    const firstP = points[0];
    pathD += `L ${padding + firstP.x * cellSize} ${padding + firstP.y * cellSize}`;
  }
  svg += `<path d="${pathD}" fill="none" stroke="black" stroke-width="3"/>`;

  svg += '</svg>';
  return svg;
}

// Generate SVGs for orders 1, 2, and 3
const order1 = generateSpaceFillingTreeCurve(1);
const order2 = generateSpaceFillingTreeCurve(2);
const order3 = generateSpaceFillingTreeCurve(3);

writeFileSync(
  'docs/screenshots/space-filling-tree-walk-order1.svg',
  generateWalkSVG(order1, 'Order 1 Walking Pattern', 200)
);
writeFileSync(
  'docs/screenshots/space-filling-tree-walk-order2.svg',
  generateWalkSVG(order2, 'Order 2 Walking Pattern', 400)
);
writeFileSync(
  'docs/screenshots/space-filling-tree-walk-order3.svg',
  generateWalkSVG(order3, 'Order 3 Walking Pattern', 500)
);

console.log('Generated walking pattern SVGs:');
console.log('- docs/screenshots/space-filling-tree-walk-order1.svg');
console.log('- docs/screenshots/space-filling-tree-walk-order2.svg');
console.log('- docs/screenshots/space-filling-tree-walk-order3.svg');

// Also generate for experiments folder
writeFileSync(
  'experiments/walk-final-order1.svg',
  generateWalkSVG(order1, 'Order 1', 200)
);
writeFileSync(
  'experiments/walk-final-order2.svg',
  generateWalkSVG(order2, 'Order 2', 400)
);
writeFileSync(
  'experiments/walk-final-order3.svg',
  generateWalkSVG(order3, 'Order 3', 500)
);

console.log('\nGenerated experiment SVGs:');
console.log('- experiments/walk-final-order1.svg');
console.log('- experiments/walk-final-order2.svg');
console.log('- experiments/walk-final-order3.svg');

// Verify order 1 and order 2 match expected
const expectedOrder1 = [
  { x: 0, y: 1 },
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
];
const expectedOrder2 = [
  { x: 1, y: 2 },
  { x: 1, y: 3 },
  { x: 0, y: 3 },
  { x: 0, y: 2 },
  { x: 1, y: 1 },
  { x: 0, y: 1 },
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 2, y: 1 },
  { x: 2, y: 0 },
  { x: 3, y: 0 },
  { x: 3, y: 1 },
  { x: 2, y: 2 },
  { x: 3, y: 2 },
  { x: 3, y: 3 },
  { x: 2, y: 3 },
];

const match1 = order1.every(
  (p, i) => p.x === expectedOrder1[i].x && p.y === expectedOrder1[i].y
);
const match2 = order2.every(
  (p, i) => p.x === expectedOrder2[i].x && p.y === expectedOrder2[i].y
);

console.log('\nVerification:');
console.log(`Order 1 matches expected: ${match1}`);
console.log(`Order 2 matches expected: ${match2}`);
