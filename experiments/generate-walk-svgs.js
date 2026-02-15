/**
 * Generate SVGs for the corrected space-filling tree walk patterns.
 */

import { writeFileSync } from 'fs';
import { generateSpaceFillingTreeCurve } from '../src/lib/algorithms/atomic/solution/space-filling-tree.js';

// Generate SVG for walking pattern
function createWalkSVG(points, gridSize, svgSize) {
  const padding = 30;
  const drawSize = svgSize - 2 * padding;
  const scale = drawSize / (gridSize - 1 || 1);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}">\n`;
  svg += `  <rect width="${svgSize}" height="${svgSize}" fill="white"/>\n`;

  // Draw path with thick lines matching reference style
  if (points.length > 1) {
    let pathData = '';
    for (let i = 0; i < points.length; i++) {
      const px = padding + points[i].x * scale;
      const py = padding + points[i].y * scale;
      pathData += i === 0 ? `M ${px.toFixed(1)} ${py.toFixed(1)}` : ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
    }
    svg += `  <path d="${pathData}" fill="none" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>\n`;
  }

  svg += `</svg>`;
  return svg;
}

// Generate walk SVGs for orders 1 and 2
console.log("Generating corrected walk pattern SVGs...");

for (let order = 1; order <= 2; order++) {
  const gridSize = Math.pow(2, order);
  const points = generateSpaceFillingTreeCurve(order);

  console.log(`Order ${order}: ${points.length} points`);
  console.log(`  Points: ${points.map(p => `(${p.x},${p.y})`).join(' → ')}`);

  const svgSize = 200;
  const svg = createWalkSVG(points, gridSize, svgSize);

  // Save to docs/screenshots for PR
  const filename = `docs/screenshots/space-filling-tree-walk-order${order}.svg`;
  writeFileSync(filename, svg);
  console.log(`  Saved to ${filename}`);
}

console.log("\nDone!");
