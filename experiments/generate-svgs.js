import { writeFileSync } from 'fs';
import { generateSpaceFillingTreeCurve } from '../src/lib/algorithms/atomic/solution/space-filling-tree.js';

function generateWalkSVG(order) {
  const curve = generateSpaceFillingTreeCurve(order);
  const gridSize = Math.pow(2, order);
  const totalPoints = curve.length;

  // SVG sizing
  const cellSize = order <= 3 ? 60 : order <= 4 ? 30 : 15;
  const padding = 30;
  const width = (gridSize - 1) * cellSize + 2 * padding;
  const height = (gridSize - 1) * cellSize + 2 * padding;

  // Build path
  const pathD = curve
    .map((p, i) => {
      const sx = p.x * cellSize + padding;
      const sy = p.y * cellSize + padding;
      return (i === 0 ? 'M' : 'L') + ` ${sx} ${sy}`;
    })
    .join(' ');

  // Close the loop
  const first = curve[0];
  const closePath = ` L ${first.x * cellSize + padding} ${first.y * cellSize + padding}`;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect x="0" y="0" width="${width}" height="${height}" fill="white"/>
  <text x="${width / 2}" y="16" text-anchor="middle" font-size="14" font-family="sans-serif" fill="black">
    Order ${order} Walking Pattern (${gridSize}\u00d7${gridSize} = ${totalPoints} points)
  </text>
  <path d="${pathD}${closePath}" fill="none" stroke="black" stroke-width="${order <= 3 ? 1.5 : 0.8}" stroke-linejoin="round"/>
`;

  // Grid points
  const pointRadius = order <= 3 ? 3 : order <= 4 ? 2 : 1.2;
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const sx = x * cellSize + padding;
      const sy = y * cellSize + padding;
      svg += `  <circle cx="${sx}" cy="${sy}" r="${pointRadius}" fill="#ddd"/>\n`;
    }
  }

  // Start point marker
  const startX = curve[0].x * cellSize + padding;
  const startY = curve[0].y * cellSize + padding;
  svg += `  <circle cx="${startX}" cy="${startY}" r="${pointRadius + 2}" fill="green" opacity="0.7"/>
  <text x="${startX + pointRadius + 5}" y="${startY + 4}" font-size="10" fill="green" font-family="sans-serif">start</text>
`;

  svg += '</svg>';
  return svg;
}

// Generate SVGs for orders 1, 2, 3, and 5
for (const order of [1, 2, 3, 5]) {
  const svg = generateWalkSVG(order);
  const path = `docs/screenshots/space-filling-tree-walk-order${order}.svg`;
  writeFileSync(path, svg);
  console.log(`Generated ${path}`);
}
