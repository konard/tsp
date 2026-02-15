/**
 * Deriving the correct space-filling tree walking algorithm
 *
 * Key insight from user's feedback:
 * - Order 1 is a simple counter-clockwise square: BL -> TL -> TR -> BR
 * - For higher orders, each quadrant is visited in a rotated version
 *   of the base pattern, with specific entry/exit points
 */

import { writeFileSync } from 'fs';

// Base pattern for order 1: counter-clockwise square starting from BL
// (0,1) -> (0,0) -> (1,0) -> (1,1)
// In terms of corners: BL -> TL -> TR -> BR

// For order 2, we visit quadrants in order: BL -> TL -> TR -> BR
// But each quadrant has a different rotation based on where we enter/exit

// Let me trace the pattern differently:
// At the top level, we traverse quadrants in a counter-clockwise manner: BL -> TL -> TR -> BR
// Within each quadrant, we need to:
// - Enter from a specific corner (based on where we came from)
// - Exit from a specific corner (based on where we're going next)

// Transitions between quadrants:
// BL exits at TL corner (0,2), enters TL at BR corner (1,1)
// TL exits at TR corner (1,0), enters TR at BL corner (2,1)
// TR exits at BR corner (3,1), enters BR at TL corner (2,2)
// BR exits at BL corner (2,3), enters BL at TR corner (1,2) [loop]

// So each quadrant must be traversed such that:
// - BL: enter at TR, exit at TL
// - TL: enter at BR, exit at TR
// - TR: enter at BL, exit at BR
// - BR: enter at TL, exit at BL

// The base pattern (order 1) visits: BL -> TL -> TR -> BR
// Entry point is BL, exit point is BR (then loops back to BL)

// For each quadrant type, we need to find a transformation that:
// - Maps the base entry (BL) to the required entry point
// - Maps the base exit (BR) to the required exit point

// Let's define rotations:
// - ROT_0: identity (entry BL, exit BR)
// - ROT_90_CW: 90° clockwise (entry TL, exit BL)
// - ROT_180: 180° (entry TR, exit TL)
// - ROT_90_CCW: 90° counter-clockwise (entry BR, exit TR)

// Wait, let me reconsider. Let me check what transformation gives us each pattern.

// Base pattern in local coords (0,0)-(1,1):
// BL(0,1) -> TL(0,0) -> TR(1,0) -> BR(1,1)

// For BL quadrant at order 2 (coords 0,2 to 1,3):
// Entry at TR(1,2), exit at TL(0,2)
// Actual: (1,2) -> (1,3) -> (0,3) -> (0,2)
// Local: TR -> BR -> BL -> TL
// This is: the base pattern rotated 90° clockwise

// For TL quadrant at order 2 (coords 0,0 to 1,1):
// Entry at BR(1,1), exit at TR(1,0)
// Actual: (1,1) -> (0,1) -> (0,0) -> (1,0)
// Local: BR -> BL -> TL -> TR
// This is: the base pattern rotated 180°

// For TR quadrant at order 2 (coords 2,0 to 3,1):
// Entry at BL(2,1), exit at BR(3,1)
// Actual: (2,1) -> (2,0) -> (3,0) -> (3,1)
// Local: BL -> TL -> TR -> BR
// This is: the base pattern with NO rotation

// For BR quadrant at order 2 (coords 2,2 to 3,3):
// Entry at TL(2,2), exit at BL(2,3)
// Actual: (2,2) -> (3,2) -> (3,3) -> (2,3)
// Local: TL -> TR -> BR -> BL
// This is: the base pattern rotated 90° counter-clockwise

console.log("Transformation analysis:");
console.log("BL quadrant: ROT_90_CW (base rotated 90° clockwise)");
console.log("TL quadrant: ROT_180 (base rotated 180°)");
console.log("TR quadrant: ROT_0 (no rotation)");
console.log("BR quadrant: ROT_90_CCW (base rotated 90° counter-clockwise)");

// Let's verify by applying transformations
function rotatePoint(p, rotation, size) {
  // Rotate around center (size/2 - 0.5, size/2 - 0.5)
  // For a 2x2 grid (size=2), center is (0.5, 0.5)
  const cx = (size - 1) / 2;
  const cy = (size - 1) / 2;
  const dx = p.x - cx;
  const dy = p.y - cy;

  switch (rotation) {
    case 'ROT_0':
      return { x: p.x, y: p.y };
    case 'ROT_90_CW':
      // (x, y) -> (y, -x) around center
      return { x: Math.round(cx + dy), y: Math.round(cy - dx) };
    case 'ROT_180':
      return { x: Math.round(cx - dx), y: Math.round(cy - dy) };
    case 'ROT_90_CCW':
      // (x, y) -> (-y, x) around center
      return { x: Math.round(cx - dy), y: Math.round(cy + dx) };
  }
}

function translatePoint(p, offsetX, offsetY) {
  return { x: p.x + offsetX, y: p.y + offsetY };
}

// Base pattern
const basePattern = [
  { x: 0, y: 1 }, // BL
  { x: 0, y: 0 }, // TL
  { x: 1, y: 0 }, // TR
  { x: 1, y: 1 }, // BR
];

console.log("\nBase pattern:", basePattern.map(p => `(${p.x},${p.y})`).join(' -> '));

// Verify BL quadrant (offset 0, 2)
const blRotated = basePattern.map(p => rotatePoint(p, 'ROT_90_CW', 2));
const blTranslated = blRotated.map(p => translatePoint(p, 0, 2));
console.log("BL quadrant (ROT_90_CW + translate):", blTranslated.map(p => `(${p.x},${p.y})`).join(' -> '));
console.log("Expected: (1,2) -> (1,3) -> (0,3) -> (0,2)");

// Verify TL quadrant (offset 0, 0)
const tlRotated = basePattern.map(p => rotatePoint(p, 'ROT_180', 2));
const tlTranslated = tlRotated.map(p => translatePoint(p, 0, 0));
console.log("TL quadrant (ROT_180):", tlTranslated.map(p => `(${p.x},${p.y})`).join(' -> '));
console.log("Expected: (1,1) -> (0,1) -> (0,0) -> (1,0)");

// Verify TR quadrant (offset 2, 0)
const trRotated = basePattern.map(p => rotatePoint(p, 'ROT_0', 2));
const trTranslated = trRotated.map(p => translatePoint(p, 2, 0));
console.log("TR quadrant (ROT_0 + translate):", trTranslated.map(p => `(${p.x},${p.y})`).join(' -> '));
console.log("Expected: (2,1) -> (2,0) -> (3,0) -> (3,1)");

// Verify BR quadrant (offset 2, 2)
const brRotated = basePattern.map(p => rotatePoint(p, 'ROT_90_CCW', 2));
const brTranslated = brRotated.map(p => translatePoint(p, 2, 2));
console.log("BR quadrant (ROT_90_CCW + translate):", brTranslated.map(p => `(${p.x},${p.y})`).join(' -> '));
console.log("Expected: (2,2) -> (3,2) -> (3,3) -> (2,3)");

// Great! Now let's implement the recursive algorithm
console.log("\n=== Implementing recursive algorithm ===");

// The key insight is that when we recurse into a quadrant,
// we need to pass the rotation that should be applied to that quadrant

// Define how each quadrant inherits rotation:
// If parent has rotation R, and we're in quadrant Q, child rotation is:
// childRotation = R + quadrantBaseRotation[Q]

// The quadrant base rotations (when parent is ROT_0):
// BL: ROT_90_CW
// TL: ROT_180
// TR: ROT_0
// BR: ROT_90_CCW

// But we also need to consider how the parent rotation affects the order
// we visit the quadrants!

// When we rotate the whole pattern, the quadrants move:
// ROT_0: BL->TL->TR->BR stays as BL->TL->TR->BR
// ROT_90_CW: BL->TL->TR->BR becomes TL->TR->BR->BL
// ROT_180: BL->TL->TR->BR becomes TR->BR->BL->TL
// ROT_90_CCW: BL->TL->TR->BR becomes BR->BL->TL->TR

// Hmm, this is getting complex. Let me think differently.

// Instead of thinking about rotations, let me think about entry/exit points
// and derive the pattern from there.

// At order N, we need to:
// 1. Visit BL quadrant (with appropriate rotation)
// 2. Visit TL quadrant (with appropriate rotation)
// 3. Visit TR quadrant (with appropriate rotation)
// 4. Visit BR quadrant (with appropriate rotation)

// The rotations ensure that:
// - We enter each quadrant at the correct corner (coming from previous quadrant)
// - We exit each quadrant at the correct corner (going to next quadrant)

// Let me implement this recursively

function generateWalkOrder(order) {
  if (order < 1) return [];

  const gridSize = Math.pow(2, order);

  // Recursive function that generates points for a region
  // rotation: 0 = standard, 1 = 90° CW, 2 = 180°, 3 = 90° CCW
  function recurse(x0, y0, size, rotation) {
    if (size === 1) {
      return [{ x: x0, y: y0 }];
    }

    const half = size / 2;

    // Define quadrant offsets
    const quadrants = {
      BL: { x: x0, y: y0 + half },
      TL: { x: x0, y: y0 },
      TR: { x: x0 + half, y: y0 },
      BR: { x: x0 + half, y: y0 + half },
    };

    // Base order: BL -> TL -> TR -> BR
    // Base rotations for each quadrant (when parent rotation is 0)
    // BL: 90° CW (rotation 1)
    // TL: 180° (rotation 2)
    // TR: 0° (rotation 0)
    // BR: 90° CCW (rotation 3)

    const baseOrder = ['BL', 'TL', 'TR', 'BR'];
    const baseChildRotations = { BL: 1, TL: 2, TR: 0, BR: 3 };

    // Rotate the quadrant order based on parent rotation
    // When rotated, BL->TL->TR->BR becomes a different sequence
    // Also, the quadrant positions swap when viewed with rotation

    // rotation 0: BL, TL, TR, BR (no change)
    // rotation 1 (90° CW): pattern rotates, so we visit TL, TR, BR, BL
    //   but in rotated space: what was BL is now TL, etc.
    // rotation 2 (180°): TR, BR, BL, TL
    // rotation 3 (90° CCW): BR, BL, TL, TR

    const rotatedOrders = {
      0: ['BL', 'TL', 'TR', 'BR'],
      1: ['TL', 'TR', 'BR', 'BL'],
      2: ['TR', 'BR', 'BL', 'TL'],
      3: ['BR', 'BL', 'TL', 'TR'],
    };

    // Child rotations need to be composed with parent rotation
    // childRotation = (baseChildRotation + parentRotation) % 4

    const order = rotatedOrders[rotation];
    const result = [];

    for (const q of order) {
      const qPos = quadrants[q];
      const baseChildRot = baseChildRotations[q];
      const childRot = (baseChildRot + rotation) % 4;
      result.push(...recurse(qPos.x, qPos.y, half, childRot));
    }

    return result;
  }

  return recurse(0, 0, gridSize, 0);
}

console.log("\nTesting algorithm:");

const order1 = generateWalkOrder(1);
console.log("Order 1:", order1.map(p => `(${p.x},${p.y})`).join(' -> '));
console.log("Expected: (0,1) -> (0,0) -> (1,0) -> (1,1)");

const order2 = generateWalkOrder(2);
console.log("\nOrder 2:");
console.log("Generated:", order2.map(p => `(${p.x},${p.y})`).join(' -> '));
console.log("Expected:  (1,2) -> (1,3) -> (0,3) -> (0,2) -> (1,1) -> (0,1) -> (0,0) -> (1,0) -> (2,1) -> (2,0) -> (3,0) -> (3,1) -> (2,2) -> (3,2) -> (3,3) -> (2,3)");

// Check if they match
const expectedOrder2 = [
  {x: 1, y: 2}, {x: 1, y: 3}, {x: 0, y: 3}, {x: 0, y: 2},
  {x: 1, y: 1}, {x: 0, y: 1}, {x: 0, y: 0}, {x: 1, y: 0},
  {x: 2, y: 1}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 3, y: 1},
  {x: 2, y: 2}, {x: 3, y: 2}, {x: 3, y: 3}, {x: 2, y: 3},
];

const matches = order2.every((p, i) => p.x === expectedOrder2[i].x && p.y === expectedOrder2[i].y);
console.log("Order 2 matches:", matches);

// Generate SVG for verification
function generateSVG(points, title, size = 400) {
  const padding = 40;
  const gridSize = Math.max(...points.map(p => Math.max(p.x, p.y))) + 1;
  const cellSize = (size - 2 * padding) / Math.max(gridSize - 1, 1);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`;
  svg += `<rect width="${size}" height="${size}" fill="white"/>`;
  svg += `<text x="${size/2}" y="25" text-anchor="middle" font-size="16" fill="black">${title}</text>`;

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

const svg1 = generateSVG(order1, 'Generated Order 1', 200);
writeFileSync('experiments/generated-walk-order1.svg', svg1);

const svg2 = generateSVG(order2, 'Generated Order 2', 400);
writeFileSync('experiments/generated-walk-order2.svg', svg2);

const order3 = generateWalkOrder(3);
const svg3 = generateSVG(order3, 'Generated Order 3', 500);
writeFileSync('experiments/generated-walk-order3.svg', svg3);

console.log("\nGenerated SVG files in experiments/");
console.log("Order 1: experiments/generated-walk-order1.svg");
console.log("Order 2: experiments/generated-walk-order2.svg");
console.log("Order 3: experiments/generated-walk-order3.svg");
