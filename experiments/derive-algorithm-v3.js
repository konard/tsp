/**
 * Deriving the correct space-filling tree walking algorithm - Version 3
 *
 * This version generalizes the algorithm to work for any entry/exit configuration
 * at any recursion level.
 */

import { writeFileSync } from 'fs';

function getLoopFromEntryExit(entry, exit) {
  // Given entry and exit corners, return the 4-point visiting order
  const cwOrder = ['TL', 'TR', 'BR', 'BL'];
  const ccwOrder = ['TL', 'BL', 'BR', 'TR'];

  const entryIdxCW = cwOrder.indexOf(entry);
  const entryIdxCCW = ccwOrder.indexOf(entry);

  // In CW/CCW, after 3 steps from entry, we should be at exit
  const cwExitCheck = cwOrder[(entryIdxCW + 3) % 4];
  const ccwExitCheck = ccwOrder[(entryIdxCCW + 3) % 4];

  let result;
  if (cwExitCheck === exit) {
    result = [];
    for (let i = 0; i < 4; i++) {
      result.push(cwOrder[(entryIdxCW + i) % 4]);
    }
  } else if (ccwExitCheck === exit) {
    result = [];
    for (let i = 0; i < 4; i++) {
      result.push(ccwOrder[(entryIdxCCW + i) % 4]);
    }
  } else {
    throw new Error(`Cannot find valid path from ${entry} to ${exit}`);
  }

  return result;
}

// Define the child entry/exit configs based on which quadrant
// and the parent's loop configuration

function getChildConfigs(parentLoop) {
  // parentLoop is [Q1, Q2, Q3, Q4] - the order we visit quadrants
  // We need to determine entry/exit for each child quadrant

  // Rules:
  // 1. Entry corner is always the corner closest to the center of the parent region
  //    BL -> TR, TL -> BR, TR -> BL, BR -> TL
  // 2. Exit corner depends on the next quadrant in the loop
  //    Going to TL: exit at TL
  //    Going to TR: exit at TR
  //    Going to BL: exit at BL
  //    Going to BR: exit at BR

  const centerCorner = {
    'BL': 'TR',
    'TL': 'BR',
    'TR': 'BL',
    'BR': 'TL',
  };

  // The exit corner is the corner that points toward the next quadrant
  // When in BL and going to TL: exit at TL (top-left of BL, toward TL quadrant)
  // When in BL and going to TR: exit at TR (top-right of BL, toward TR quadrant)
  // etc.

  const exitCornerToward = {
    'TL': 'TL', // exit at TL to go toward TL quadrant
    'TR': 'TR',
    'BL': 'BL',
    'BR': 'BR',
  };

  const configs = {};

  for (let i = 0; i < 4; i++) {
    const quadrant = parentLoop[i];
    const nextQuadrant = parentLoop[(i + 1) % 4];

    // Entry is the corner closest to parent center (fixed per quadrant)
    const entry = centerCorner[quadrant];

    // Exit is toward the next quadrant
    const exit = exitCornerToward[nextQuadrant];

    configs[quadrant] = { entry, exit };
  }

  return configs;
}

function generateSpaceFillingTreeWalk(order) {
  if (order < 1) return [];

  const gridSize = Math.pow(2, order);

  const getCornerCoord = (quadrantX, quadrantY, halfSize, corner) => {
    switch (corner) {
      case 'TL': return { x: quadrantX, y: quadrantY };
      case 'TR': return { x: quadrantX + halfSize - 1, y: quadrantY };
      case 'BL': return { x: quadrantX, y: quadrantY + halfSize - 1 };
      case 'BR': return { x: quadrantX + halfSize - 1, y: quadrantY + halfSize - 1 };
    }
  };

  function recurse(x0, y0, size, entry, exit) {
    if (size === 2) {
      // Base case: 4 unit cells, return corners in order
      const loop = getLoopFromEntryExit(entry, exit);
      return loop.map(corner => getCornerCoord(x0, y0, 2, corner));
    }

    const half = size / 2;

    // Quadrant positions
    const quadrants = {
      BL: { x: x0, y: y0 + half },
      TL: { x: x0, y: y0 },
      TR: { x: x0 + half, y: y0 },
      BR: { x: x0 + half, y: y0 + half },
    };

    // Get the loop order for this level
    const loop = getLoopFromEntryExit(entry, exit);

    // Get child configs based on the loop
    const childConfigs = getChildConfigs(loop);

    const result = [];
    for (const qName of loop) {
      const q = quadrants[qName];
      const config = childConfigs[qName];
      result.push(...recurse(q.x, q.y, half, config.entry, config.exit));
    }

    return result;
  }

  // Start with entry at BL, exit at BR (counter-clockwise from BL)
  return recurse(0, 0, gridSize, 'BL', 'BR');
}

// Test the algorithm
console.log("Testing generateSpaceFillingTreeWalk:");

const expectedOrder1 = [
  {x: 0, y: 1}, {x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1},
];
const expectedOrder2 = [
  {x: 1, y: 2}, {x: 1, y: 3}, {x: 0, y: 3}, {x: 0, y: 2},
  {x: 1, y: 1}, {x: 0, y: 1}, {x: 0, y: 0}, {x: 1, y: 0},
  {x: 2, y: 1}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 3, y: 1},
  {x: 2, y: 2}, {x: 3, y: 2}, {x: 3, y: 3}, {x: 2, y: 3},
];

const order1 = generateSpaceFillingTreeWalk(1);
console.log("\nOrder 1:");
console.log("Generated:", order1.map(p => `(${p.x},${p.y})`).join(' -> '));
console.log("Expected: ", expectedOrder1.map(p => `(${p.x},${p.y})`).join(' -> '));
const match1 = order1.every((p, i) => p.x === expectedOrder1[i].x && p.y === expectedOrder1[i].y);
console.log("Matches:", match1);

const order2 = generateSpaceFillingTreeWalk(2);
console.log("\nOrder 2:");
console.log("Generated:", order2.map(p => `(${p.x},${p.y})`).join(' -> '));
console.log("Expected: ", expectedOrder2.map(p => `(${p.x},${p.y})`).join(' -> '));
const match2 = order2.every((p, i) => p.x === expectedOrder2[i].x && p.y === expectedOrder2[i].y);
console.log("Matches:", match2);

const order3 = generateSpaceFillingTreeWalk(3);
console.log("\nOrder 3:");
console.log("Generated:", order3.length, "points");
console.log("First 20:", order3.slice(0, 20).map(p => `(${p.x},${p.y})`).join(' -> '));

// Generate SVGs for visual verification
function generateSVG(points, title, viewSize = 400) {
  const padding = 40;
  const gridSize = Math.max(...points.map(p => Math.max(p.x, p.y))) + 1;
  const cellSize = (viewSize - 2 * padding) / Math.max(gridSize - 1, 1);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewSize} ${viewSize}" width="${viewSize}" height="${viewSize}">`;
  svg += `<rect width="${viewSize}" height="${viewSize}" fill="white"/>`;
  svg += `<text x="${viewSize/2}" y="25" text-anchor="middle" font-size="16" fill="black">${title}</text>`;

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

writeFileSync('experiments/walk-v3-order1.svg', generateSVG(order1, 'Order 1', 200));
writeFileSync('experiments/walk-v3-order2.svg', generateSVG(order2, 'Order 2', 400));
writeFileSync('experiments/walk-v3-order3.svg', generateSVG(order3, 'Order 3', 500));

console.log("\nGenerated SVG files:");
console.log("- experiments/walk-v3-order1.svg");
console.log("- experiments/walk-v3-order2.svg");
console.log("- experiments/walk-v3-order3.svg");

// Export the function for use in main code
export { generateSpaceFillingTreeWalk, getLoopFromEntryExit, getChildConfigs };
