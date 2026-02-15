/**
 * Corrected space-filling tree walking pattern.
 *
 * Based on the reference image analysis:
 * - Order 1: A closed square visiting BL → TL → TR → BR
 * - Order 2+: Z-shapes in each quadrant, but rotated to connect smoothly
 *
 * The user says:
 * - Order 1 should be a "square" not "N-shaped zigzag"
 * - Order 2 should go around all 16 points like a "spiral/flower"
 *
 * Looking at the reference ASCII art:
 *  _  _
 * |_\| |
 *  /  /_
 * |_|\_|
 *
 * This suggests each quadrant has an N/Z shape but oriented differently.
 *
 * The user explicitly said the tree structure is CORRECT (X patterns).
 * Only the walking pattern needs fixing.
 *
 * Let me implement a Hilbert-like curve where:
 * - Order 1: visits 4 corners in a square pattern (BL→TL→TR→BR)
 * - Order 2+: each sub-quadrant is rotated to connect ends smoothly
 */

import { writeFileSync } from 'fs';

/**
 * Generate the correct walking pattern.
 *
 * For order 1: BL(0,1) → TL(0,0) → TR(1,0) → BR(1,1) = square
 *
 * For order 2+: Hilbert curve style with rotations
 * - d=0 (UP): visits BL → TL → TR → BR (U opening right)
 * - d=1 (RIGHT): visits BL → BR → TR → TL (U opening up)
 * - d=2 (DOWN): visits TR → BR → BL → TL (U opening left)
 * - d=3 (LEFT): visits TR → TL → BL → BR (U opening down)
 */
function generateCorrectWalkCurve(order) {
  const gridSize = Math.pow(2, order);

  function recurse(x0, y0, size, d) {
    if (size === 1) {
      return [{ x: x0, y: y0 }];
    }

    const half = size / 2;

    // Quadrant positions
    const TL = { x: x0, y: y0 };
    const TR = { x: x0 + half, y: y0 };
    const BL = { x: x0, y: y0 + half };
    const BR = { x: x0 + half, y: y0 + half };

    switch (d) {
      case 0: // U opening right: BL → TL → TR → BR
        return [
          ...recurse(BL.x, BL.y, half, 1), // BL sub, rotated for entry
          ...recurse(TL.x, TL.y, half, 0), // TL sub, same orientation
          ...recurse(TR.x, TR.y, half, 0), // TR sub, same orientation
          ...recurse(BR.x, BR.y, half, 3), // BR sub, rotated for exit
        ];
      case 1: // U opening up: BL → BR → TR → TL
        return [
          ...recurse(BL.x, BL.y, half, 0), // BL
          ...recurse(BR.x, BR.y, half, 1), // BR
          ...recurse(TR.x, TR.y, half, 1), // TR
          ...recurse(TL.x, TL.y, half, 2), // TL
        ];
      case 2: // U opening left: TR → BR → BL → TL
        return [
          ...recurse(TR.x, TR.y, half, 3),
          ...recurse(BR.x, BR.y, half, 2),
          ...recurse(BL.x, BL.y, half, 2),
          ...recurse(TL.x, TL.y, half, 1),
        ];
      case 3: // U opening down: TR → TL → BL → BR
        return [
          ...recurse(TR.x, TR.y, half, 2),
          ...recurse(TL.x, TL.y, half, 3),
          ...recurse(BL.x, BL.y, half, 3),
          ...recurse(BR.x, BR.y, half, 0),
        ];
    }
  }

  return recurse(0, 0, gridSize, 0);
}

/**
 * Alternative: What if the user wants Z-shapes (not U-shapes) but rotated?
 *
 * Looking at the reference more closely, each quadrant has an N/Z shape.
 * Let me try Z-shapes with rotations for smooth connections.
 *
 * Z-shape orientations:
 * - d=0: BL → TL → BR → TR (normal N/Z)
 * - d=1: TL → TR → BL → BR (flipped horizontally, C shape)
 * - d=2: TR → BR → TL → BL (rotated 180°)
 * - d=3: BR → BL → TR → TL (flipped vertically)
 */
function generateZWithRotations(order) {
  const gridSize = Math.pow(2, order);

  function recurse(x0, y0, size, d) {
    if (size === 1) {
      return [{ x: x0, y: y0 }];
    }

    const half = size / 2;
    const TL = { x: x0, y: y0 };
    const TR = { x: x0 + half, y: y0 };
    const BL = { x: x0, y: y0 + half };
    const BR = { x: x0 + half, y: y0 + half };

    switch (d) {
      case 0: // N-shape: BL → TL → BR → TR, starts BL ends TR
        // Need children oriented so BL ends where TL starts, etc.
        // BL child should end at top-right of BL region (connects to TL's bottom)
        // TL child starts at bottom-left of TL region
        // Hmm, the diagonal jump from TL to BR is the problem.
        return [
          ...recurse(BL.x, BL.y, half, 0),
          ...recurse(TL.x, TL.y, half, 0),
          ...recurse(BR.x, BR.y, half, 0),
          ...recurse(TR.x, TR.y, half, 0),
        ];
      case 1: // C-shape: TL → TR → BL → BR
        return [
          ...recurse(TL.x, TL.y, half, 1),
          ...recurse(TR.x, TR.y, half, 1),
          ...recurse(BL.x, BL.y, half, 1),
          ...recurse(BR.x, BR.y, half, 1),
        ];
      case 2: // Reversed N: TR → BR → TL → BL
        return [
          ...recurse(TR.x, TR.y, half, 2),
          ...recurse(BR.x, BR.y, half, 2),
          ...recurse(TL.x, TL.y, half, 2),
          ...recurse(BL.x, BL.y, half, 2),
        ];
      case 3: // Vertical flip: BR → BL → TR → TL
        return [
          ...recurse(BR.x, BR.y, half, 3),
          ...recurse(BL.x, BL.y, half, 3),
          ...recurse(TR.x, TR.y, half, 3),
          ...recurse(TL.x, TL.y, half, 3),
        ];
    }
  }

  return recurse(0, 0, gridSize, 0);
}

// Generate SVG
function createWalkSVG(points, gridSize, svgSize, title) {
  const padding = 30;
  const drawSize = svgSize - 2 * padding;
  const scale = drawSize / (gridSize - 1 || 1);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}">\n`;
  svg += `  <rect width="${svgSize}" height="${svgSize}" fill="white"/>\n`;

  // Draw path with thick lines like reference
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

// Test order 1 and 2 with Hilbert U-curve approach
console.log("Testing Hilbert U-curve (square for order 1):");
for (let order = 1; order <= 2; order++) {
  const gridSize = Math.pow(2, order);
  const points = generateCorrectWalkCurve(order);
  console.log(`Order ${order}: ${points.length} points`);
  console.log(`  Points: ${points.map(p => `(${p.x},${p.y})`).join(' → ')}`);

  const svgSize = 200;
  const svg = createWalkSVG(points, gridSize, svgSize, `Walk Order ${order}`);
  writeFileSync(`experiments/walk-correct-order${order}.svg`, svg);
  console.log(`  Saved to experiments/walk-correct-order${order}.svg`);
}

console.log("\nTesting Z-shapes with rotations:");
for (let order = 1; order <= 2; order++) {
  const gridSize = Math.pow(2, order);
  const points = generateZWithRotations(order);
  console.log(`Order ${order}: ${points.length} points`);
  console.log(`  Points: ${points.map(p => `(${p.x},${p.y})`).join(' → ')}`);
}
