import { readFileSync } from 'fs';
import { generateUForkCurve, uForkCurveToPoints } from '../src/lib/algorithms/atomic/solution/u-fork.js';

function parseSvgPath(svgContent) {
  const pathMatch = svgContent.match(/d="([^"]+)"/);
  const points = [];
  const parts = pathMatch[1].trim().split(/\s+/);
  let i = 0;
  while (i < parts.length) {
    if (parts[i] === 'M' || parts[i] === 'L') {
      points.push({ x: parseFloat(parts[i + 1]), y: parseFloat(parts[i + 2]) });
      i += 3;
    } else { i += 1; }
  }
  return points;
}

// Check generated step 3 SVG matches target
const genSvg = readFileSync('docs/u-fork-step-3.svg', 'utf8');
const targetSvg = readFileSync('target-svgs/tsp-tour-2.svg', 'utf8');

const genPoints = parseSvgPath(genSvg);
const targetPoints = parseSvgPath(targetSvg);

console.log('Generated step 3:', genPoints.length, 'points');
console.log('Target step 3:', targetPoints.length, 'points');

// Normalize both to grid coordinates
function toGrid(points) {
  const xs = [...new Set(points.map(p => p.x))].sort((a, b) => a - b);
  const ys = [...new Set(points.map(p => p.y))].sort((a, b) => a - b);
  return points.map(p => ({ x: xs.indexOf(p.x), y: ys.indexOf(p.y) }));
}

const genGrid = toGrid(genPoints);
const targetGrid = toGrid(targetPoints);

// My algorithm uses y increasing upward. Target SVG uses y increasing downward.
// In the SVG, I flip y: py = yOff + (gridSize-1-y)*step, so SVG y is inverted.
// Target SVG was directly extracted, where y=0 is top.
// Let me compare by checking if they visit the same cells.

console.log('\nGen step 3 first 5:', genGrid.slice(0,5).map(p => `(${p.x},${p.y})`));
console.log('Target step 3 first 5:', targetGrid.slice(0,5).map(p => `(${p.x},${p.y})`));

// The generated SVG has flipped y. The target SVG has y=0 at top.
// In my algorithm, y=0 is bottom, and in the SVG I draw it as y_svg = (n-1-y)*step + yOff.
// So grid_y=7 becomes svg_y = 0*step + yOff (top), and grid_y=0 becomes svg_y = 7*step + yOff (bottom).
// In the target SVG, the top is also at small y values.
// So the normalized grid from my SVG should have y=0 at top (matching target orientation).

// Let me verify step 4 too
const gen4 = uForkCurveToPoints(generateUForkCurve(4), 16);
console.log('\nAlgorithm step 4 start:', `(${gen4[0].x},${gen4[0].y})`);

// Check if all points are valid
for (let order = 1; order <= 5; order++) {
  const n = Math.pow(2, order);
  const points = uForkCurveToPoints(generateUForkCurve(order), n);
  const unique = new Set(points.map(p => `${p.x},${p.y}`));
  
  // Check adjacency
  let allAdjacent = true;
  for (let i = 0; i < points.length - 1; i++) {
    const dx = Math.abs(points[i+1].x - points[i].x);
    const dy = Math.abs(points[i+1].y - points[i].y);
    if (dx + dy !== 1) {
      allAdjacent = false;
      console.log(`Order ${order}: NON-ADJACENT at d=${i}: (${points[i].x},${points[i].y}) -> (${points[i+1].x},${points[i+1].y})`);
      break;
    }
  }
  
  console.log(`Order ${order} (${n}x${n}): ${points.length} points, ${unique.size} unique, adjacent=${allAdjacent}`);
}
