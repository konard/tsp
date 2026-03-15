/**
 * Generate individual SVG files for the first 5 steps of the U-fork fractal
 * Using the new boustrophedon meander algorithm.
 */

import { writeFileSync } from 'fs';
import { generateUForkCurve, uForkCurveToPoints } from '../src/lib/algorithms/atomic/solution/u-fork.js';

function generateSVG(points, gridSize, title, width = 400, height = 400) {
  const margin = 50;
  const drawSize = Math.min(width, height) - 2 * margin;
  const step = drawSize / (gridSize - 1);
  const xOff = margin;
  const yOff = margin;
  const svgW = width + 10;
  const svgH = height + 10;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">
  <rect width="${svgW}" height="${svgH}" fill="white" stroke="#ccc" stroke-width="1"/>
  <text x="${svgW / 2}" y="25" text-anchor="middle" font-size="16" font-family="sans-serif" font-weight="bold">${title}</text>
  <text x="${svgW / 2}" y="${svgH - 10}" text-anchor="middle" font-size="11" font-family="sans-serif" fill="#666">${gridSize}×${gridSize} grid, ${points.length} points</text>`;

  // Grid dots
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      svg += `\n  <circle cx="${xOff + i * step}" cy="${yOff + j * step}" r="2" fill="#e0e0e0"/>`;
    }
  }

  // Path
  const strokeWidth = Math.max(1.5, 5 - gridSize / 10);
  let pathData = '';
  for (let i = 0; i < points.length; i++) {
    const px = xOff + points[i].x * step;
    const py = yOff + (gridSize - 1 - points[i].y) * step; // flip y for SVG (y=0 at top)
    pathData += (i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`);
  }
  svg += `\n  <path d="${pathData}" stroke="#333" stroke-width="${strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;

  // Start marker (green)
  const sx = xOff + points[0].x * step;
  const sy = yOff + (gridSize - 1 - points[0].y) * step;
  svg += `\n  <circle cx="${sx}" cy="${sy}" r="5" fill="#22c55e"/>`;

  // End marker (red)
  const ex = xOff + points[points.length - 1].x * step;
  const ey = yOff + (gridSize - 1 - points[points.length - 1].y) * step;
  svg += `\n  <circle cx="${ex}" cy="${ey}" r="5" fill="#ef4444"/>`;

  svg += '\n</svg>';
  return svg;
}

// Generate individual SVGs for steps 1-5
for (let order = 1; order <= 5; order++) {
  const gridSize = Math.pow(2, order);
  const seq = generateUForkCurve(order);
  const points = uForkCurveToPoints(seq, gridSize);

  const size = Math.min(400 + gridSize * 5, 600);
  const svg = generateSVG(points, gridSize, `U-fork Fractal — Step ${order}`, size, size);
  writeFileSync(`docs/u-fork-step-${order}.svg`, svg);
  console.log(`Generated: docs/u-fork-step-${order}.svg (${gridSize}×${gridSize}, ${points.length} points)`);
}

// Combined SVG with all 5 steps
function generateCombinedSVG(allSteps) {
  const cellWidth = 250;
  const cellHeight = 280;
  const margin = 35;
  const totalWidth = allSteps.length * cellWidth;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${cellHeight}" viewBox="0 0 ${totalWidth} ${cellHeight}">
  <rect width="${totalWidth}" height="${cellHeight}" fill="white"/>`;

  for (let s = 0; s < allSteps.length; s++) {
    const { points, gridSize, order } = allSteps[s];
    const offsetX = s * cellWidth;
    const drawSize = cellWidth - 2 * margin;
    const cellStep = drawSize / (gridSize - 1);
    const xOff = offsetX + margin;
    const yOff = margin + 20;

    // Grid dots
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        svg += `\n  <circle cx="${xOff + i * cellStep}" cy="${yOff + j * cellStep}" r="1" fill="#e0e0e0"/>`;
      }
    }

    // Path
    const strokeWidth = Math.max(1, 4 - gridSize / 12);
    let pathData = '';
    for (let i = 0; i < points.length; i++) {
      const px = xOff + points[i].x * cellStep;
      const py = yOff + (gridSize - 1 - points[i].y) * cellStep;
      pathData += (i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`);
    }

    svg += `\n  <text x="${offsetX + cellWidth / 2}" y="18" text-anchor="middle" font-size="13" font-family="sans-serif" font-weight="bold">Step ${order}</text>`;
    svg += `\n  <path d="${pathData}" stroke="#333" stroke-width="${strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    svg += `\n  <text x="${offsetX + cellWidth / 2}" y="${cellHeight - 5}" text-anchor="middle" font-size="10" font-family="sans-serif" fill="#888">${gridSize}×${gridSize}</text>`;
  }

  svg += '\n</svg>';
  return svg;
}

const allSteps = [];
for (let order = 1; order <= 5; order++) {
  const gridSize = Math.pow(2, order);
  const seq = generateUForkCurve(order);
  const points = uForkCurveToPoints(seq, gridSize);
  allSteps.push({ points, gridSize, order });
}

writeFileSync('docs/u-fork-steps-1-to-5.svg', generateCombinedSVG(allSteps));
console.log("Generated: docs/u-fork-steps-1-to-5.svg");
