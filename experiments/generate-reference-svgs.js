/**
 * Generate final reference SVGs for the space-filling tree algorithm.
 *
 * Produces:
 * 1. Tree structure SVG (X-patterns) at orders 1 and 2
 * 2. Walk pattern SVG (Z-order path) at orders 1 and 2
 * 3. Combined comparison image
 *
 * These match the reference image from issue #10.
 */

import { writeFileSync } from 'fs';

// === Tree edge generation ===
function generateTreeEdges(cx, cy, halfW, halfH, depth, maxDepth) {
  if (depth >= maxDepth) return [];

  const edges = [];
  const qHalfW = halfW / 2;
  const qHalfH = halfH / 2;

  const quadrants = [
    { x: cx - qHalfW, y: cy - qHalfH }, // TL
    { x: cx + qHalfW, y: cy - qHalfH }, // TR
    { x: cx - qHalfW, y: cy + qHalfH }, // BL
    { x: cx + qHalfW, y: cy + qHalfH }, // BR
  ];

  for (const q of quadrants) {
    edges.push({ x1: cx, y1: cy, x2: q.x, y2: q.y, depth });
    edges.push(...generateTreeEdges(q.x, q.y, qHalfW, qHalfH, depth + 1, maxDepth));
  }

  return edges;
}

// === Walk path generation (Z-order: BL→TL→BR→TR) ===
function generateWalkPath(order) {
  const gridSize = Math.pow(2, order);

  function recurse(x0, y0, size) {
    if (size === 1) return [{ x: x0, y: y0 }];
    const half = size / 2;
    return [
      ...recurse(x0, y0 + half, half),        // BL
      ...recurse(x0, y0, half),                 // TL
      ...recurse(x0 + half, y0 + half, half),  // BR
      ...recurse(x0 + half, y0, half),          // TR
    ];
  }

  return recurse(0, 0, gridSize);
}

// === SVG generation helpers ===
function treeSVG(order, size) {
  const padding = 30;
  const drawSize = size - 2 * padding;
  const cx = size / 2;
  const cy = size / 2;

  const edges = generateTreeEdges(cx, cy, drawSize / 2, drawSize / 2, 0, order);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">\n`;
  svg += `  <rect width="${size}" height="${size}" fill="white"/>\n`;

  for (const e of edges) {
    const sw = Math.max(1.5, 4 - e.depth * 1.2);
    svg += `  <line x1="${e.x1.toFixed(1)}" y1="${e.y1.toFixed(1)}" x2="${e.x2.toFixed(1)}" y2="${e.y2.toFixed(1)}" stroke="black" stroke-width="${sw}" stroke-linecap="round"/>\n`;
  }

  svg += `</svg>`;
  return svg;
}

function walkSVG(order, size) {
  const padding = 30;
  const gridSize = Math.pow(2, order);
  const drawSize = size - 2 * padding;
  const scale = drawSize / (gridSize - 1 || 1);
  const points = generateWalkPath(order);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">\n`;
  svg += `  <rect width="${size}" height="${size}" fill="white"/>\n`;

  // Path
  if (points.length > 1) {
    let d = '';
    for (let i = 0; i < points.length; i++) {
      const px = (padding + points[i].x * scale).toFixed(1);
      const py = (padding + points[i].y * scale).toFixed(1);
      d += i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`;
    }
    svg += `  <path d="${d}" fill="none" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>\n`;
  }

  svg += `</svg>`;
  return svg;
}

// Generate final SVGs
writeFileSync('docs/screenshots/space-filling-tree-order1.svg', treeSVG(1, 200));
writeFileSync('docs/screenshots/space-filling-tree-order2.svg', treeSVG(2, 400));
writeFileSync('docs/screenshots/space-filling-tree-walk-order1.svg', walkSVG(1, 200));
writeFileSync('docs/screenshots/space-filling-tree-walk-order2.svg', walkSVG(2, 400));

console.log('Generated final reference SVGs in docs/screenshots/');
