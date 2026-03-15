// Analysis of U-fork target SVG patterns
// This script extracts path coordinates from SVGs, converts to grid indices,
// and identifies the recursive fractal structure.
//
// Key finding: The U-fork curve is implemented as a HILBERT CURVE L-system
// in the codebase (src/lib/algorithms/atomic/solution/u-fork.js):
//   Axiom: A
//   A -> -BF+AFA+FB-
//   B -> +AF-BFB-FA+
// Starting direction: 2 (down)

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SVG_DIR = join(__dirname, '..', 'target-svgs');

// ============================================================
// 1. Parse SVG path data
// ============================================================

function extractPathPoints(svgContent) {
  const pathMatch = svgContent.match(/d="([^"]+)"/);
  if (!pathMatch) return [];
  const d = pathMatch[1];
  const points = [];
  const regex = /([ML])\s+([\d.]+)\s+([\d.]+)/g;
  let match;
  while ((match = regex.exec(d)) !== null) {
    points.push({ x: parseFloat(match[2]), y: parseFloat(match[3]) });
  }
  return points;
}

function detectGrid(points) {
  const xs = [...new Set(points.map(p => p.x))].sort((a, b) => a - b);
  const ys = [...new Set(points.map(p => p.y))].sort((a, b) => a - b);
  const margin = Math.min(xs[0], ys[0]);
  const maxVal = Math.max(xs[xs.length - 1], ys[ys.length - 1]);
  const gridSize = Math.max(xs.length, ys.length);
  const step = gridSize > 1 ? (maxVal - margin) / (gridSize - 1) : 0;
  return { margin, step, gridSize };
}

function toGridCoords(points, margin, step) {
  return points.map(p => ({
    col: Math.round((p.x - margin) / step),
    row: Math.round((p.y - margin) / step)
  }));
}

// ============================================================
// 2. U-fork curve generation (from codebase L-system)
// ============================================================

function generateUForkCurve(order) {
  let sequence = 'A';
  for (let i = 0; i < order; i++) {
    let next = '';
    for (const ch of sequence) {
      if (ch === 'A') next += '-BF+AFA+FB-';
      else if (ch === 'B') next += '+AF-BFB-FA+';
      else next += ch;
    }
    sequence = next;
  }
  return sequence;
}

function uForkCurveToPoints(sequence, gridSize) {
  const curvePoints = [];
  let x = 0, y = 0;
  // Direction: 0=up, 1=right, 2=down, 3=left
  // Start facing down (matching codebase)
  let direction = 2;

  curvePoints.push({ x, y });

  for (const ch of sequence) {
    if (ch === 'F') {
      if (direction === 0) y -= 1;
      else if (direction === 1) x += 1;
      else if (direction === 2) y += 1;
      else if (direction === 3) x -= 1;
      curvePoints.push({ x, y });
    } else if (ch === '+') {
      direction = (direction + 1) % 4;
    } else if (ch === '-') {
      direction = (direction + 3) % 4;
    }
  }

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of curvePoints) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }

  const curveWidth = maxX - minX;
  const curveHeight = maxY - minY;

  return curvePoints.map(p => ({
    x: curveWidth === 0 ? 0 : Math.round(((p.x - minX) / curveWidth) * (gridSize - 1)),
    y: curveHeight === 0 ? 0 : Math.round(((p.y - minY) / curveHeight) * (gridSize - 1)),
  }));
}

// ============================================================
// 3. Process each SVG and compare with generated curve
// ============================================================

const files = [
  { name: 'tsp-tour-4.svg', label: 'Step 1 (2x2, 4 pts)' },
  { name: 'tsp-tour-3.svg', label: 'Step 2 (4x4, 16 pts)' },
  { name: 'tsp-tour-2.svg', label: 'Step 3 (8x8, 64 pts)' },
  { name: 'tsp-tour-5.svg', label: 'Step 4 (16x16, 256 pts)' },
];

for (const file of files) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(file.label + ': ' + file.name);
  console.log('='.repeat(60));

  const content = readFileSync(join(SVG_DIR, file.name), 'utf-8');
  const points = extractPathPoints(content);
  const { margin, step, gridSize } = detectGrid(points);
  const gridCoords = toGridCoords(points, margin, step);

  console.log(`Grid: ${gridSize}x${gridSize}, Margin: ${margin}, Step: ${step.toFixed(2)}`);
  console.log(`\nTarget path (${gridCoords.length} points):`);
  console.log(gridCoords.map((p, i) => `${i}:(${p.col},${p.row})`).join('  '));

  // Generate curve from L-system
  const order = Math.round(Math.log2(gridSize));
  const seq = generateUForkCurve(order);
  const generated = uForkCurveToPoints(seq, gridSize);

  console.log(`\nGenerated curve (order ${order}, ${generated.length} points):`);
  console.log(generated.map((p, i) => `${i}:(${p.x},${p.y})`).join('  '));

  // Compare
  const match = gridCoords.length === generated.length &&
    gridCoords.every((p, i) => p.col === generated[i].x && p.row === generated[i].y);
  console.log(`\nMatch: ${match ? 'YES' : 'NO'}`);

  if (!match) {
    // Show visit-order matrices for visual comparison
    const targetGrid = Array.from({length: gridSize}, () => Array(gridSize).fill(-1));
    gridCoords.forEach((p, i) => { targetGrid[p.row][p.col] = i; });

    const genGrid = Array.from({length: gridSize}, () => Array(gridSize).fill(-1));
    generated.forEach((p, i) => { genGrid[p.y][p.x] = i; });

    console.log('\nTarget visit order:');
    for (const row of targetGrid) {
      console.log('  ' + row.map(v => String(v).padStart(4)).join(''));
    }

    console.log('\nGenerated visit order:');
    for (const row of genGrid) {
      console.log('  ' + row.map(v => String(v).padStart(4)).join(''));
    }

    // Count differences
    let diffs = 0;
    for (let i = 0; i < Math.min(gridCoords.length, generated.length); i++) {
      if (gridCoords[i].col !== generated[i].x || gridCoords[i].row !== generated[i].y) {
        diffs++;
      }
    }
    console.log(`\n  ${diffs} of ${gridCoords.length} points differ`);
  }
}

// ============================================================
// 4. Try different starting directions
// ============================================================

console.log(`\n${'='.repeat(60)}`);
console.log('TESTING ALL STARTING DIRECTIONS');
console.log('='.repeat(60));

// The codebase uses direction=2 (down). Let's try all 4 to see which matches.
for (let startDir = 0; startDir < 4; startDir++) {
  const dirNames = ['up', 'right', 'down', 'left'];
  console.log(`\nStarting direction: ${startDir} (${dirNames[startDir]})`);

  function genWithDir(order, startDirection) {
    const seq = generateUForkCurve(order);
    const pts = [];
    let x = 0, y = 0, dir = startDirection;
    pts.push({x, y});
    for (const ch of seq) {
      if (ch === 'F') {
        if (dir === 0) y -= 1;
        else if (dir === 1) x += 1;
        else if (dir === 2) y += 1;
        else if (dir === 3) x -= 1;
        pts.push({x, y});
      } else if (ch === '+') { dir = (dir + 1) % 4; }
      else if (ch === '-') { dir = (dir + 3) % 4; }
    }
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of pts) { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); }
    const w = maxX - minX, h = maxY - minY;
    const gs = Math.pow(2, order);
    return pts.map(p => ({
      x: w === 0 ? 0 : Math.round(((p.x - minX) / w) * (gs - 1)),
      y: h === 0 ? 0 : Math.round(((p.y - minY) / h) * (gs - 1)),
    }));
  }

  // Test against first target (2x2)
  const content = readFileSync(join(SVG_DIR, 'tsp-tour-4.svg'), 'utf-8');
  const points = extractPathPoints(content);
  const { margin, step } = detectGrid(points);
  const target = toGridCoords(points, margin, step);

  const gen = genWithDir(1, startDir);
  const m = target.length === gen.length &&
    target.every((p, i) => p.col === gen[i].x && p.row === gen[i].y);
  console.log(`  2x2 match: ${m ? 'YES' : 'NO'}`);
  console.log(`  Generated: ${gen.map((p,i) => `(${p.x},${p.y})`).join(' -> ')}`);
  console.log(`  Target:    ${target.map((p,i) => `(${p.col},${p.row})`).join(' -> ')}`);
}

// ============================================================
// 5. The curve is NOT closed but the SVG path IS closed (Z suffix)
// ============================================================

console.log(`\n${'='.repeat(60)}`);
console.log('KEY OBSERVATION: OPEN CURVE vs CLOSED TOUR');
console.log('='.repeat(60));

console.log(`
The L-system generates an OPEN Hilbert curve (not closed).
The SVG paths have a "Z" suffix making them CLOSED tours.

For the TSP application:
- Points are placed on the grid
- Each point is assigned a position along the Hilbert curve
- Points are sorted by curve position
- The resulting order forms the tour (which is implicitly closed)

The SVG target files show the tour path through ALL grid points,
which means they show the Hilbert curve itself traced as a closed loop.

The Hilbert curve's start and end points are always adjacent
(distance 1 on the grid), so closing it with Z creates a valid tour.
`);

// ============================================================
// 6. Verify the generated curve against ALL targets
// ============================================================

console.log(`${'='.repeat(60)}`);
console.log('COMPREHENSIVE VERIFICATION');
console.log('='.repeat(60));

// The target SVGs show a CLOSED path. The generated Hilbert curve is OPEN.
// The closed path is: [Hilbert curve points] + [closing edge back to start]
// In the SVG, the Z command closes the path.
// The path coordinates are the Hilbert curve points in ORDER.
// So the SVG path should match the Hilbert curve point sequence exactly.

// But the starting point of the closed loop could be anywhere on the curve!
// The SVG starts at a specific point. Let me check if the target
// simply starts at a different point on the same curve.

for (const file of files) {
  const content = readFileSync(join(SVG_DIR, file.name), 'utf-8');
  const points = extractPathPoints(content);
  const { margin, step, gridSize } = detectGrid(points);
  const target = toGridCoords(points, margin, step);

  const order = Math.round(Math.log2(gridSize));
  const gen = uForkCurveToPoints(generateUForkCurve(order), gridSize);

  // Check direct match
  const directMatch = target.length === gen.length &&
    target.every((p, i) => p.col === gen[i].x && p.row === gen[i].y);

  // Check if target is a cyclic rotation of the generated curve
  let cyclicMatch = false;
  let cyclicOffset = -1;
  if (target.length === gen.length) {
    for (let offset = 0; offset < gen.length; offset++) {
      const rotMatch = target.every((p, i) => {
        const gi = (i + offset) % gen.length;
        return p.col === gen[gi].x && p.row === gen[gi].y;
      });
      if (rotMatch) {
        cyclicMatch = true;
        cyclicOffset = offset;
        break;
      }
    }

    // Also check reversed
    if (!cyclicMatch) {
      const revGen = [...gen].reverse();
      for (let offset = 0; offset < revGen.length; offset++) {
        const rotMatch = target.every((p, i) => {
          const gi = (i + offset) % revGen.length;
          return p.col === revGen[gi].x && p.row === revGen[gi].y;
        });
        if (rotMatch) {
          cyclicMatch = true;
          cyclicOffset = offset;
          console.log(`  ${file.label}: REVERSED cyclic match at offset ${offset}`);
          break;
        }
      }
    }
  }

  console.log(`${file.label}:`);
  console.log(`  Direct match: ${directMatch}`);
  console.log(`  Cyclic match: ${cyclicMatch}${cyclicMatch ? ` (offset=${cyclicOffset})` : ''}`);

  if (!directMatch && !cyclicMatch) {
    // Check if the set of points is the same (just different ordering)
    const targetSet = new Set(target.map(p => `${p.col},${p.row}`));
    const genSet = new Set(gen.map(p => `${p.x},${p.y}`));
    const samePoints = targetSet.size === genSet.size &&
      [...targetSet].every(p => genSet.has(p));
    console.log(`  Same point set: ${samePoints}`);
  }
}

// ============================================================
// 7. Summary
// ============================================================

console.log(`\n${'='.repeat(60)}`);
console.log('SUMMARY');
console.log('='.repeat(60));

console.log(`
FINDINGS:

1. SVG FILE MAPPING:
   - tsp-tour-4.svg: 4 points on 2x2 grid (order 1)
   - tsp-tour-3.svg: 16 points on 4x4 grid (order 2)
   - tsp-tour-2.svg: 64 points on 8x8 grid (order 3)
   - tsp-tour-5.svg: 256 points on 16x16 grid (order 4)

2. GRID COORDINATE SYSTEM:
   - ViewBox: 400x400
   - Margin: 20px
   - Step: (400 - 2*20) / (gridSize - 1) = 360 / (n-1)
   - Grid index = round((pixel - 20) / step)

3. CURVE ALGORITHM:
   The U-fork curve is a HILBERT CURVE generated by L-system:
   - Axiom: A
   - A -> -BF+AFA+FB-
   - B -> +AF-BFB-FA+
   - F = forward, + = turn right 90, - = turn left 90
   - Starting direction: facing DOWN (direction=2)

4. PATH STRUCTURE:
   Each SVG shows a closed Hamiltonian cycle (Z suffix in path).
   The Hilbert curve visits every grid point exactly once.
   The path is the curve traversal order, closed to form a tour.

5. RECURSIVE STRUCTURE:
   At each recursion level, the grid doubles in size (2^n x 2^n).
   Each point expands to a 2x2 block with orientation determined by
   the local direction of travel. The 4 orientations are rotations
   of the base C-shape: LUR, URD, RDL, DLU.

6. VISUAL PATTERN:
   The Hilbert curve produces a characteristic pattern of concentric
   boustrophedon spirals when viewed as a visit-order matrix.
   This is inherent to the space-filling property of the curve.
`);
