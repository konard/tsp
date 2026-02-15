/**
 * Experiment: Generate SVGs of space-filling tree pattern
 *
 * Reference image shows:
 * Top: Tree structure (X patterns at different levels of recursion)
 * Bottom: Walking pattern (Z/N-shaped path derived from tree traversal)
 *
 * The tree is a recursive structure where at each level:
 * - 4 corners (TL, TR, BL, BR) are connected to a center point
 * - Each corner recursively contains the same structure
 *
 * The walking pattern is a left-to-right DFS traversal of the tree
 * which creates a Z-order (Morton order) curve.
 */

import { writeFileSync } from 'fs';

/**
 * Generate space-filling tree edges recursively.
 * At each level, the center connects to 4 quadrant centers via edges (X-pattern).
 *
 * @param {number} cx - Center x
 * @param {number} cy - Center y
 * @param {number} size - Current region size (half-width)
 * @param {number} depth - Current depth
 * @param {number} maxDepth - Maximum recursion depth (order)
 * @returns {Array<{x1,y1,x2,y2,depth}>} Tree edges
 */
function generateTreeEdges(cx, cy, size, depth, maxDepth) {
  if (depth >= maxDepth) return [];

  const edges = [];
  const halfSize = size / 2;

  // 4 quadrant centers
  const quadrants = [
    { x: cx - halfSize, y: cy - halfSize }, // TL
    { x: cx + halfSize, y: cy - halfSize }, // TR
    { x: cx - halfSize, y: cy + halfSize }, // BL
    { x: cx + halfSize, y: cy + halfSize }, // BR
  ];

  // Connect center to each quadrant center
  for (const q of quadrants) {
    edges.push({ x1: cx, y1: cy, x2: q.x, y2: q.y, depth });
  }

  // Recurse into each quadrant
  for (const q of quadrants) {
    edges.push(...generateTreeEdges(q.x, q.y, halfSize, depth + 1, maxDepth));
  }

  return edges;
}

/**
 * Generate the walking path (Z-order / Morton order) from tree traversal.
 *
 * At each level, visit quadrants in order: BL, TL, BR, TR
 * (which creates the Z/N-like shape seen in reference image)
 *
 * Actually looking at the reference more carefully:
 * - The base pattern (order 1) goes: BL → TL → BR → TR
 * - This creates the reversed-N / Z-shape visible in the image
 *
 * @param {number} cx - Center x
 * @param {number} cy - Center y
 * @param {number} size - Current region size (half-width)
 * @param {number} depth - Current depth
 * @param {number} maxDepth - Maximum recursion depth
 * @returns {Array<{x,y}>} Points in walk order
 */
function generateWalkPath(cx, cy, size, depth, maxDepth) {
  if (depth >= maxDepth) {
    return [{ x: cx, y: cy }];
  }

  const halfSize = size / 2;

  // Quadrant centers - visiting order determines the walk pattern
  // Looking at the reference: the Z/N-shape goes BL → TL → BR → TR
  const quadrants = [
    { x: cx - halfSize, y: cy + halfSize }, // BL (bottom-left)
    { x: cx - halfSize, y: cy - halfSize }, // TL (top-left)
    { x: cx + halfSize, y: cy + halfSize }, // BR (bottom-right)
    { x: cx + halfSize, y: cy - halfSize }, // TR (top-right)
  ];

  const path = [];
  for (const q of quadrants) {
    path.push(...generateWalkPath(q.x, q.y, halfSize, depth + 1, maxDepth));
  }

  return path;
}

/**
 * Create SVG string for tree visualization
 */
function createTreeSVG(order, svgSize) {
  const padding = 40;
  const drawSize = svgSize - 2 * padding;
  const center = svgSize / 2;
  const halfRegion = drawSize / 2;

  const edges = generateTreeEdges(center, center, halfRegion, 0, order);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}">\n`;
  svg += `  <rect width="${svgSize}" height="${svgSize}" fill="white"/>\n`;

  // Draw edges
  for (const edge of edges) {
    const strokeWidth = Math.max(1, 4 - edge.depth);
    svg += `  <line x1="${edge.x1}" y1="${edge.y1}" x2="${edge.x2}" y2="${edge.y2}" stroke="black" stroke-width="${strokeWidth}" stroke-linecap="round"/>\n`;
  }

  svg += `</svg>`;
  return svg;
}

/**
 * Create SVG string for walking pattern visualization
 */
function createWalkSVG(order, svgSize) {
  const padding = 40;
  const drawSize = svgSize - 2 * padding;
  const center = svgSize / 2;
  const halfRegion = drawSize / 2;

  const path = generateWalkPath(center, center, halfRegion, 0, order);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}">\n`;
  svg += `  <rect width="${svgSize}" height="${svgSize}" fill="white"/>\n`;

  // Draw path
  if (path.length > 1) {
    let pathData = `M ${path[0].x} ${path[0].y}`;
    for (let i = 1; i < path.length; i++) {
      pathData += ` L ${path[i].x} ${path[i].y}`;
    }
    svg += `  <path d="${pathData}" fill="none" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>\n`;
  }

  // Draw points
  for (const p of path) {
    svg += `  <circle cx="${p.x}" cy="${p.y}" r="4" fill="black"/>\n`;
  }

  svg += `</svg>`;
  return svg;
}

// Generate SVGs for orders 1 and 2
const svgSize = 400;

// Tree order 1 (single X)
writeFileSync('experiments/tree-order1.svg', createTreeSVG(1, svgSize));
console.log('Generated tree-order1.svg');

// Tree order 2 (4 X's connected)
writeFileSync('experiments/tree-order2.svg', createTreeSVG(2, svgSize));
console.log('Generated tree-order2.svg');

// Walk order 1 (single Z/N pattern)
writeFileSync('experiments/walk-order1.svg', createWalkSVG(1, svgSize));
console.log('Generated walk-order1.svg');

// Walk order 2 (4 Z/N patterns connected)
writeFileSync('experiments/walk-order2.svg', createWalkSVG(2, svgSize));
console.log('Generated walk-order2.svg');

// Combined view (tree + walk side by side) for comparison with reference
const combinedSize = 900;
let combinedSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="${combinedSize}" height="${combinedSize}" viewBox="0 0 ${combinedSize} ${combinedSize}">
  <rect width="${combinedSize}" height="${combinedSize}" fill="white"/>
  <text x="100" y="30" font-size="20" text-anchor="middle">Tree Order 1</text>
  <text x="550" y="30" font-size="20" text-anchor="middle">Tree Order 2</text>
  <text x="100" y="480" font-size="20" text-anchor="middle">Walk Order 1</text>
  <text x="550" y="480" font-size="20" text-anchor="middle">Walk Order 2</text>
`;

// Embed tree order 1 at top-left
{
  const padding = 40;
  const drawSize = 200 - 2 * padding;
  const cx = 100, cy = 250;
  const halfRegion = drawSize / 2;
  const edges = generateTreeEdges(cx, cy, halfRegion, 0, 1);
  for (const edge of edges) {
    const sw = Math.max(1, 4 - edge.depth);
    combinedSVG += `  <line x1="${edge.x1}" y1="${edge.y1}" x2="${edge.x2}" y2="${edge.y2}" stroke="black" stroke-width="${sw}" stroke-linecap="round"/>\n`;
  }
}

// Embed tree order 2 at top-right
{
  const padding = 40;
  const drawSize = 400 - 2 * padding;
  const cx = 550, cy = 250;
  const halfRegion = drawSize / 2;
  const edges = generateTreeEdges(cx, cy, halfRegion, 0, 2);
  for (const edge of edges) {
    const sw = Math.max(1, 4 - edge.depth);
    combinedSVG += `  <line x1="${edge.x1}" y1="${edge.y1}" x2="${edge.x2}" y2="${edge.y2}" stroke="black" stroke-width="${sw}" stroke-linecap="round"/>\n`;
  }
}

// Embed walk order 1 at bottom-left
{
  const drawSize = 200 - 80;
  const cx = 100, cy = 700;
  const halfRegion = drawSize / 2;
  const path = generateWalkPath(cx, cy, halfRegion, 0, 1);
  if (path.length > 1) {
    let pathData = `M ${path[0].x} ${path[0].y}`;
    for (let i = 1; i < path.length; i++) {
      pathData += ` L ${path[i].x} ${path[i].y}`;
    }
    combinedSVG += `  <path d="${pathData}" fill="none" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>\n`;
  }
  for (const p of path) {
    combinedSVG += `  <circle cx="${p.x}" cy="${p.y}" r="4" fill="black"/>\n`;
  }
}

// Embed walk order 2 at bottom-right
{
  const drawSize = 400 - 80;
  const cx = 550, cy = 700;
  const halfRegion = drawSize / 2;
  const path = generateWalkPath(cx, cy, halfRegion, 0, 2);
  if (path.length > 1) {
    let pathData = `M ${path[0].x} ${path[0].y}`;
    for (let i = 1; i < path.length; i++) {
      pathData += ` L ${path[i].x} ${path[i].y}`;
    }
    combinedSVG += `  <path d="${pathData}" fill="none" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>\n`;
  }
  for (const p of path) {
    combinedSVG += `  <circle cx="${p.x}" cy="${p.y}" r="4" fill="black"/>\n`;
  }
}

combinedSVG += `</svg>`;
writeFileSync('experiments/combined-reference.svg', combinedSVG);
console.log('Generated combined-reference.svg');

console.log('\nDone! Compare these SVGs with the reference image.');
