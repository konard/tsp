/**
 * Verify the space-filling tree walk pattern matches the reference image.
 *
 * The reference shows:
 * Order 1 walk: A Z-like shape visiting 4 corners
 * Order 2 walk: 4 Z-like shapes connected in a larger Z pattern
 *
 * The tree structure at each level connects center to 4 quadrants.
 * The walk visits quadrants in Z-order (TL, TR, BL, BR) via DFS.
 *
 * But looking at reference image carefully, the walk at order 1 forms:
 *   BL → TL → BR → TR (an N-shape when read bottom-to-top)
 *
 * Actually let me re-read the reference image walk pattern (bottom-left):
 * It appears to trace: bottom-left → top-left (vertical up) → bottom-right (diagonal) → top-right (vertical up)
 * That is: BL→TL→BR→TR
 *
 * For the curve-based approach (like Moore), we generate all points on the curve,
 * then map each TSP point to its nearest curve position.
 */

import { writeFileSync } from 'fs';

/**
 * Generate the Z-order space-filling tree curve points.
 * At the deepest level, returns the corner points.
 * At higher levels, recursively generates sub-curves in each quadrant,
 * visiting quadrants in Z-order: BL, TL, BR, TR
 *
 * This generates the CURVE (path) that the algorithm walks along.
 * Points on a grid are mapped to their nearest position on this curve.
 */
function generateSpaceFillingTreeCurve(order, gridSize) {
  if (order <= 0) {
    // Single point at center
    const mid = (gridSize - 1) / 2;
    return [{ x: mid, y: mid }];
  }

  // At order 1, we have a 2x2 grid of points
  // Visit order (matching reference Z pattern): BL, TL, BR, TR
  // At higher orders, we recursively fill each quadrant

  const halfGrid = gridSize / 2;

  function recurse(x0, y0, size, depth) {
    if (depth === 0) {
      // Leaf: return the center point of this cell
      const cx = x0 + size / 2 - 0.5;
      const cy = y0 + size / 2 - 0.5;
      return [{ x: cx, y: cy }];
    }

    const halfSize = size / 2;

    // Z-order: BL, TL, BR, TR
    const bl = recurse(x0, y0 + halfSize, halfSize, depth - 1); // BL
    const tl = recurse(x0, y0, halfSize, depth - 1); // TL
    const br = recurse(x0 + halfSize, y0 + halfSize, halfSize, depth - 1); // BR
    const tr = recurse(x0 + halfSize, y0, halfSize, depth - 1); // TR

    return [...bl, ...tl, ...br, ...tr];
  }

  return recurse(0, 0, gridSize, order);
}

/**
 * Alternative: Generate curve that places points AT grid intersections.
 * For a grid of size 2^order, we have 2^order x 2^order points.
 * At order n, gridSize = 2^n.
 */
function generateSpaceFillingTreeCurveGrid(order) {
  const gridSize = Math.pow(2, order);

  function recurse(x0, y0, size, depth) {
    if (size === 1) {
      return [{ x: x0, y: y0 }];
    }

    const halfSize = size / 2;

    // Z-order traversal: BL, TL, BR, TR
    const bl = recurse(x0, y0 + halfSize, halfSize, depth - 1);
    const tl = recurse(x0, y0, halfSize, depth - 1);
    const br = recurse(x0 + halfSize, y0 + halfSize, halfSize, depth - 1);
    const tr = recurse(x0 + halfSize, y0, halfSize, depth - 1);

    return [...bl, ...tl, ...br, ...tr];
  }

  return recurse(0, 0, gridSize, order);
}

// Test: generate and verify
console.log("Order 1 curve (2x2 grid):");
const curve1 = generateSpaceFillingTreeCurveGrid(1);
console.log(curve1);
// Expected: BL(0,1), TL(0,0), BR(1,1), TR(1,0)

console.log("\nOrder 2 curve (4x4 grid):");
const curve2 = generateSpaceFillingTreeCurveGrid(2);
console.log(curve2);

// Generate SVG comparison
function createWalkSVG(order, svgSize) {
  const points = generateSpaceFillingTreeCurveGrid(order);
  const gridSize = Math.pow(2, order);
  const padding = 40;
  const drawSize = svgSize - 2 * padding;
  const scale = drawSize / (gridSize - 1 || 1);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}">\n`;
  svg += `  <rect width="${svgSize}" height="${svgSize}" fill="white"/>\n`;

  // Draw grid
  for (let i = 0; i < gridSize; i++) {
    const pos = padding + i * scale;
    svg += `  <line x1="${pos}" y1="${padding}" x2="${pos}" y2="${padding + (gridSize - 1) * scale}" stroke="#ddd" stroke-width="0.5"/>\n`;
    svg += `  <line x1="${padding}" y1="${pos}" x2="${padding + (gridSize - 1) * scale}" y2="${pos}" stroke="#ddd" stroke-width="0.5"/>\n`;
  }

  // Draw path
  if (points.length > 1) {
    let pathData = '';
    for (let i = 0; i < points.length; i++) {
      const px = padding + points[i].x * scale;
      const py = padding + points[i].y * scale;
      pathData += i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`;
    }
    svg += `  <path d="${pathData}" fill="none" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>\n`;
  }

  // Draw numbered points
  for (let i = 0; i < points.length; i++) {
    const px = padding + points[i].x * scale;
    const py = padding + points[i].y * scale;
    svg += `  <circle cx="${px}" cy="${py}" r="6" fill="red"/>\n`;
    svg += `  <text x="${px}" y="${py + 4}" font-size="10" text-anchor="middle" fill="white">${i}</text>\n`;
  }

  svg += `</svg>`;
  return svg;
}

// Also generate tree edges SVG
function generateTreeEdgesForGrid(order) {
  const gridSize = Math.pow(2, order);
  const edges = [];

  function recurse(x0, y0, size, depth) {
    if (size <= 1) return;

    const halfSize = size / 2;
    const cx = x0 + halfSize;
    const cy = y0 + halfSize;

    // 4 quadrant centers
    const quadrants = [
      { x: x0 + halfSize / 2, y: y0 + halfSize / 2 }, // TL
      { x: x0 + halfSize + halfSize / 2, y: y0 + halfSize / 2 }, // TR
      { x: x0 + halfSize / 2, y: y0 + halfSize + halfSize / 2 }, // BL
      { x: x0 + halfSize + halfSize / 2, y: y0 + halfSize + halfSize / 2 }, // BR
    ];

    // Edges from center to quadrant centers
    for (const q of quadrants) {
      edges.push({ x1: cx, y1: cy, x2: q.x, y2: q.y, depth });
    }

    // Recurse
    recurse(x0, y0, halfSize, depth + 1); // TL
    recurse(x0 + halfSize, y0, halfSize, depth + 1); // TR
    recurse(x0, y0 + halfSize, halfSize, depth + 1); // BL
    recurse(x0 + halfSize, y0 + halfSize, halfSize, depth + 1); // BR
  }

  recurse(0, 0, gridSize, 0);
  return { edges, gridSize };
}

function createTreeSVG(order, svgSize) {
  const { edges, gridSize } = generateTreeEdgesForGrid(order);
  const padding = 40;
  const drawSize = svgSize - 2 * padding;
  const scale = drawSize / gridSize;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}">\n`;
  svg += `  <rect width="${svgSize}" height="${svgSize}" fill="white"/>\n`;

  for (const edge of edges) {
    const strokeWidth = Math.max(1, 4 - edge.depth);
    svg += `  <line x1="${padding + edge.x1 * scale}" y1="${padding + edge.y1 * scale}" x2="${padding + edge.x2 * scale}" y2="${padding + edge.y2 * scale}" stroke="black" stroke-width="${strokeWidth}" stroke-linecap="round"/>\n`;
  }

  svg += `</svg>`;
  return svg;
}

writeFileSync('experiments/walk-v2-order1.svg', createWalkSVG(1, 300));
writeFileSync('experiments/walk-v2-order2.svg', createWalkSVG(2, 400));
writeFileSync('experiments/walk-v2-order3.svg', createWalkSVG(3, 500));
writeFileSync('experiments/tree-v2-order1.svg', createTreeSVG(1, 300));
writeFileSync('experiments/tree-v2-order2.svg', createTreeSVG(2, 400));

console.log("\nGenerated v2 SVGs");
