/**
 * Experiment to trace and understand the correct walking pattern
 * for space-filling tree algorithm.
 *
 * According to the user:
 * - Order 1: SQUARE/LOOP through 4 points (not N-zigzag)
 * - Order 2: Specific pinwheel pattern
 */

// User's specified order 2 sequence:
const userOrder2 = [
  {x: 1, y: 2}, {x: 1, y: 3}, {x: 0, y: 3}, {x: 0, y: 2}, // BL quadrant
  {x: 1, y: 1}, {x: 0, y: 1}, {x: 0, y: 0}, {x: 1, y: 0}, // TL quadrant
  {x: 2, y: 1}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 3, y: 1}, // TR quadrant
  {x: 2, y: 2}, {x: 3, y: 2}, {x: 3, y: 3}, {x: 2, y: 3}, // BR quadrant
];

console.log("User's specified order 2 sequence:");
userOrder2.forEach((p, i) => console.log(`${i}: (${p.x}, ${p.y})`));

// Let's trace the quadrants:
// Grid is 4x4 (order 2)
// TL quadrant: (0,0), (1,0), (0,1), (1,1)
// TR quadrant: (2,0), (3,0), (2,1), (3,1)
// BL quadrant: (0,2), (1,2), (0,3), (1,3)
// BR quadrant: (2,2), (3,2), (2,3), (3,3)

console.log("\n--- Quadrant analysis ---");

// BL quadrant (first 4 points): (1,2) -> (1,3) -> (0,3) -> (0,2)
// This is: TR_of_BL -> BR_of_BL -> BL_of_BL -> TL_of_BL
// In BL quadrant coordinates (shifted by y+2):
// (1,0) -> (1,1) -> (0,1) -> (0,0) in local coords
// This is a CLOCKWISE square starting from TR

console.log("BL quadrant: (1,2) -> (1,3) -> (0,3) -> (0,2)");
console.log("  Local: TR -> BR -> BL -> TL (clockwise from TR)");

// TL quadrant (next 4 points): (1,1) -> (0,1) -> (0,0) -> (1,0)
// This is: BR_of_TL -> BL_of_TL -> TL_of_TL -> TR_of_TL
// This is a COUNTER-CLOCKWISE square starting from BR

console.log("TL quadrant: (1,1) -> (0,1) -> (0,0) -> (1,0)");
console.log("  Local: BR -> BL -> TL -> TR (counter-clockwise from BR)");

// TR quadrant (next 4 points): (2,1) -> (2,0) -> (3,0) -> (3,1)
// This is: BL_of_TR -> TL_of_TR -> TR_of_TR -> BR_of_TR
// This is a COUNTER-CLOCKWISE square starting from BL

console.log("TR quadrant: (2,1) -> (2,0) -> (3,0) -> (3,1)");
console.log("  Local: BL -> TL -> TR -> BR (counter-clockwise from BL)");

// BR quadrant (last 4 points): (2,2) -> (3,2) -> (3,3) -> (2,3)
// This is: TL_of_BR -> TR_of_BR -> BR_of_BR -> BL_of_BR
// This is a CLOCKWISE square starting from TL

console.log("BR quadrant: (2,2) -> (3,2) -> (3,3) -> (2,3)");
console.log("  Local: TL -> TR -> BR -> BL (clockwise from TL)");

console.log("\n--- Entry/Exit analysis ---");
// Looking at transitions between quadrants:
// BL ends at (0,2) = TL corner of BL
// TL starts at (1,1) = BR corner of TL
// This means we go from TL_of_BL to BR_of_TL (going up-right diagonally)

// TL ends at (1,0) = TR corner of TL
// TR starts at (2,1) = BL corner of TR
// This means we go from TR_of_TL to BL_of_TR (going down-right diagonally)

// TR ends at (3,1) = BR corner of TR
// BR starts at (2,2) = TL corner of BR
// This means we go from BR_of_TR to TL_of_BR (going down-left diagonally)

// BR ends at (2,3) = BL corner of BR
// BL starts at (1,2) = TR corner of BL (completing loop)
// This means we go from BL_of_BR to TR_of_BL (going up-left diagonally)

console.log("BL(0,2) -> TL(1,1): exits TL corner, enters BR corner");
console.log("TL(1,0) -> TR(2,1): exits TR corner, enters BL corner");
console.log("TR(3,1) -> BR(2,2): exits BR corner, enters TL corner");
console.log("BR(2,3) -> BL(1,2): exits BL corner, enters TR corner (loop)");

// So the pattern at order 1 level (how we traverse quadrants) is:
// BL -> TL -> TR -> BR (this forms a Z-like shape)
// But at each quadrant, we walk in a specific pattern based on entry/exit points

console.log("\n--- Order 1 pattern derivation ---");
// For order 1 (just 4 points):
// If we follow the same entry/exit pattern:
// We should enter from bottom-right, exit from top-left to top-right, etc.

// User said order 1 is: (0,1) -> (0,0) -> (1,0) -> (1,1) -> (0,1)
// This is: BL -> TL -> TR -> BR (square, counter-clockwise from BL)
const userOrder1 = [
  {x: 0, y: 1}, // BL
  {x: 0, y: 0}, // TL
  {x: 1, y: 0}, // TR
  {x: 1, y: 1}, // BR
];
console.log("User's order 1: BL(0,1) -> TL(0,0) -> TR(1,0) -> BR(1,1)");
console.log("This is counter-clockwise starting from BL");

// Generate SVG to visualize order 1
function generateSVG(points, title, size = 200) {
  const padding = 40;
  const gridSize = Math.max(...points.map(p => Math.max(p.x, p.y))) + 1;
  const cellSize = (size - 2 * padding) / (gridSize - 1 || 1);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`;
  svg += `<rect width="${size}" height="${size}" fill="white"/>`;
  svg += `<text x="${size/2}" y="20" text-anchor="middle" font-size="14" fill="black">${title}</text>`;

  // Draw grid dots
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cx = padding + x * cellSize;
      const cy = padding + y * cellSize;
      svg += `<circle cx="${cx}" cy="${cy}" r="3" fill="#ccc"/>`;
    }
  }

  // Draw path
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
  svg += `<path d="${pathD}" fill="none" stroke="black" stroke-width="2"/>`;

  // Draw numbered points
  points.forEach((p, i) => {
    const cx = padding + p.x * cellSize;
    const cy = padding + p.y * cellSize;
    svg += `<circle cx="${cx}" cy="${cy}" r="8" fill="blue"/>`;
    svg += `<text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="10" fill="white">${i + 1}</text>`;
  });

  svg += '</svg>';
  return svg;
}

import { writeFileSync } from 'fs';

const svg1 = generateSVG(userOrder1, 'Order 1');
writeFileSync('experiments/user-walk-order1.svg', svg1);
console.log("\nGenerated experiments/user-walk-order1.svg");

const svg2 = generateSVG(userOrder2, 'Order 2', 300);
writeFileSync('experiments/user-walk-order2.svg', svg2);
console.log("Generated experiments/user-walk-order2.svg");

// Now let's figure out the recursive pattern
console.log("\n--- Figuring out recursive pattern ---");

// Looking at the pattern more carefully:
// The quadrant order seems to be: BL -> TL -> TR -> BR
// But each quadrant has a different rotation/direction

// Let me trace each quadrant's internal pattern:
// Each quadrant visits 4 corners in a specific order

function getQuadrantPattern(startX, startY, pattern) {
  // pattern is an array of 4 indices into [TL, TR, BL, BR]
  // where TL=0, TR=1, BL=2, BR=3 are relative positions within quadrant
  const corners = [
    {x: startX, y: startY},         // TL
    {x: startX + 1, y: startY},     // TR
    {x: startX, y: startY + 1},     // BL
    {x: startX + 1, y: startY + 1}, // BR
  ];
  return pattern.map(i => corners[i]);
}

// BL quadrant pattern: TR -> BR -> BL -> TL = [1, 3, 2, 0]
// TL quadrant pattern: BR -> BL -> TL -> TR = [3, 2, 0, 1]
// TR quadrant pattern: BL -> TL -> TR -> BR = [2, 0, 1, 3]
// BR quadrant pattern: TL -> TR -> BR -> BL = [0, 1, 3, 2]

// Hmm, these are all rotations/reflections of each other
// Let me see if there's a simpler way to describe this

// Actually, looking at the ASCII art the user provided:
//  _  _
// |_\| |
//  /  /_
// |_|\_|

// This suggests each quadrant has a specific orientation based on its position

console.log("\nThe recursive tree walk pattern:");
console.log("- Quadrant order: BL -> TL -> TR -> BR");
console.log("- Each quadrant is walked in a rotated pattern");
console.log("- BL: rotated 90° CCW (entry TR, exit TL)");
console.log("- TL: rotated 180° (entry BR, exit TR)");
console.log("- TR: no rotation (entry BL, exit BR)");
console.log("- BR: rotated 90° CW (entry TL, exit BL)");
