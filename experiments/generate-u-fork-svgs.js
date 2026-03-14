/**
 * Generate individual SVG files for the first 5 steps of the U-fork fractal
 * Using the correct orientation (initial direction = DOWN)
 *
 * L-system rules (standard Hilbert):
 *   Axiom: A
 *   A → -BF+AFA+FB-
 *   B → +AF-BFB-FA+
 *   Initial direction: DOWN (2)
 */

import { writeFileSync } from 'fs';

function generateCurve(axiom, rules, order) {
  let sequence = axiom;
  for (let i = 0; i < order; i++) {
    let newSeq = '';
    for (const ch of sequence) {
      newSeq += rules[ch] || ch;
    }
    sequence = newSeq;
  }
  return sequence;
}

function sequenceToPoints(sequence, initialDir = 2) {
  const points = [];
  let x = 0, y = 0;
  let dir = initialDir;
  points.push({ x, y });
  for (const ch of sequence) {
    if (ch === 'F') {
      if (dir === 0) y -= 1;
      else if (dir === 1) x += 1;
      else if (dir === 2) y += 1;
      else if (dir === 3) x -= 1;
      points.push({ x, y });
    } else if (ch === '+') {
      dir = (dir + 1) % 4;
    } else if (ch === '-') {
      dir = (dir + 3) % 4;
    }
  }
  return points;
}

function normalize(pts, gridSize) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of pts) {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
  }
  const w = maxX - minX || 1;
  const h = maxY - minY || 1;
  const n = gridSize - 1;
  return pts.map(p => ({
    x: Math.round((p.x - minX) / w * n),
    y: Math.round((p.y - minY) / h * n),
  }));
}

function generateSVG(points, gridSize, title, width = 400, height = 400) {
  const margin = 50;
  const drawSize = Math.min(width, height) - 2 * margin;
  const step = drawSize / (gridSize - 1);
  const xOff = margin;
  const yOff = margin;
  const svgW = width;
  const svgH = height;

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
    const py = yOff + points[i].y * step;
    pathData += (i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`);
  }
  svg += `\n  <path d="${pathData}" stroke="#333" stroke-width="${strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;

  // Start marker (green)
  const sx = xOff + points[0].x * step;
  const sy = yOff + points[0].y * step;
  svg += `\n  <circle cx="${sx}" cy="${sy}" r="5" fill="#22c55e"/>`;

  // End marker (red)
  const ex = xOff + points[points.length - 1].x * step;
  const ey = yOff + points[points.length - 1].y * step;
  svg += `\n  <circle cx="${ex}" cy="${ey}" r="5" fill="#ef4444"/>`;

  svg += '\n</svg>';
  return svg;
}

// Generate individual SVGs for steps 1-5
const rules = { A: '-BF+AFA+FB-', B: '+AF-BFB-FA+' };

for (let order = 1; order <= 5; order++) {
  const gridSize = Math.pow(2, order);
  const seq = generateCurve('A', rules, order);
  const pts = sequenceToPoints(seq, 2); // initial dir = RIGHT
  const norm = normalize(pts, gridSize);

  const size = Math.min(400 + gridSize * 5, 600);
  const svg = generateSVG(norm, gridSize, `U-fork Fractal — Step ${order}`, size, size);
  writeFileSync(`/tmp/gh-issue-solver-1773520435460/docs/u-fork-step-${order}.svg`, svg);
  console.log(`Generated: docs/u-fork-step-${order}.svg (${gridSize}×${gridSize}, ${norm.length} points)`);
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
    const step = drawSize / (gridSize - 1);
    const xOff = offsetX + margin;
    const yOff = margin + 20;

    // Grid dots
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        svg += `\n  <circle cx="${xOff + i * step}" cy="${yOff + j * step}" r="1" fill="#e0e0e0"/>`;
      }
    }

    // Path
    const strokeWidth = Math.max(1, 4 - gridSize / 12);
    let pathData = '';
    for (let i = 0; i < points.length; i++) {
      const px = xOff + points[i].x * step;
      const py = yOff + points[i].y * step;
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
  const seq = generateCurve('A', rules, order);
  const pts = sequenceToPoints(seq, 2);
  const norm = normalize(pts, gridSize);
  allSteps.push({ points: norm, gridSize, order });
}

writeFileSync('/tmp/gh-issue-solver-1773520435460/docs/u-fork-steps-1-to-5.svg', generateCombinedSVG(allSteps));
console.log("Generated: docs/u-fork-steps-1-to-5.svg");
