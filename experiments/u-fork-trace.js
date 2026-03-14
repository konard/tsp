/**
 * Trace the exact U-fork pattern from the issue screenshot
 * by trying a recursive construction approach.
 *
 * From the image:
 * Step 1 (2x2): U-shape opening left
 *   Trace: (0,1) → (0,0) → (1,0) → (1,1)
 *   That's: bottom-left → top-left → top-right → bottom-right
 *
 * Step 2 (4x4): Four copies of step 1 arranged and connected
 *   Looking at the middle image carefully...
 */

import { writeFileSync } from 'fs';

// Recursive U-fork construction
// The idea: at each level, create 4 copies of the previous level
// and connect them in a specific way.

// Let me try to trace the step 2 pattern from the image more carefully.
// The image shows for step 2 (4x4 grid):
// Starting at bottom-left (0,3), the curve traces through the grid.

// Actually, let me just output the current Hilbert curve points for each order
// and compare with what the image shows.

function hilbertPoints(order) {
  // Generate standard Hilbert curve points recursively
  const points = [];

  function hilbert(x, y, ax, ay, bx, by, n) {
    if (n <= 0) {
      points.push({ x: x + (ax + bx) / 2, y: y + (ay + by) / 2 });
      return;
    }

    // Recursively trace 4 sub-curves
    hilbert(x, y, bx / 2, by / 2, ax / 2, ay / 2, n - 1);
    hilbert(x + bx / 2, y + by / 2, ax / 2, ay / 2, bx / 2, by / 2, n - 1);
    hilbert(x + (ax + bx) / 2, y + (ay + by) / 2, ax / 2, ay / 2, bx / 2, by / 2, n - 1);
    hilbert(x + ax / 2 + bx, y + ay / 2 + by, -bx / 2, -by / 2, -ax / 2, -ay / 2, n - 1);
  }

  const size = Math.pow(2, order);
  hilbert(0, 0, size, 0, 0, size, order);
  return points;
}

// The key property of the image pattern:
// At step 1 (order 1), the curve is a U opening to the left:
//  (0,1) → (0,0) → (1,0) → (1,1)
//
// At step 2 (order 2), looking carefully at the image:
// The curve starts at bottom-left and ends at bottom-right
// The pattern has the bottom-left quadrant as a U opening downward,
// then connects to top-left which is a U opening left (same as step 1),
// then connects to top-right which is a U opening left (same as step 1),
// then connects to bottom-right which is a U opening upward.
//
// This is exactly the standard Hilbert curve construction!

// Let me try the standard Hilbert curve with different coordinate mappings
console.log("Standard Hilbert curve points:");
for (let order = 1; order <= 3; order++) {
  const pts = hilbertPoints(order);
  console.log(`Order ${order}: ${pts.map(p => `(${p.x},${p.y})`).join(' → ')}`);
}

// Now let me try using xy2d and d2xy (the standard Hilbert functions)
function d2xy(n, d) {
  let rx, ry, s, x = 0, y = 0, t = d;
  for (s = 1; s < n; s *= 2) {
    rx = 1 & (t / 2);
    ry = 1 & (t ^ rx);
    if (ry === 0) {
      if (rx === 1) {
        x = s - 1 - x;
        y = s - 1 - y;
      }
      [x, y] = [y, x];
    }
    x += s * rx;
    y += s * ry;
    t = Math.floor(t / 4);
  }
  return { x, y };
}

console.log("\nStandard d2xy Hilbert curve:");
for (let order = 1; order <= 3; order++) {
  const n = Math.pow(2, order);
  const total = n * n;
  const pts = [];
  for (let d = 0; d < total; d++) {
    pts.push(d2xy(n, d));
  }
  console.log(`Order ${order}: ${pts.map(p => `(${p.x},${p.y})`).join(' → ')}`);
}

// Now let me generate L-system points with the current code and compare
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

function sequenceToRawPoints(sequence, initialDir = 0) {
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

console.log("\nCurrent L-system (A -> -BF+AFA+FB-, dir=0):");
for (let order = 1; order <= 3; order++) {
  const seq = generateCurve('A', { A: '-BF+AFA+FB-', B: '+AF-BFB-FA+' }, order);
  const pts = sequenceToRawPoints(seq, 0);
  // Normalize
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of pts) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  const w = maxX - minX;
  const h = maxY - minY;
  const n = Math.pow(2, order) - 1;
  const norm = pts.map(p => ({
    x: Math.round((p.x - minX) / w * n),
    y: Math.round((p.y - minY) / h * n),
  }));
  console.log(`Order ${order}: ${norm.map(p => `(${p.x},${p.y})`).join(' → ')}`);
}

// Now let me trace the image pattern manually
// Step 1 from image: Opening left, going counter-clockwise
// (0,1) → (0,0) → (1,0) → (1,1)
// This is bottom-left → top-left → top-right → bottom-right
console.log("\n\nTarget from image:");
console.log("Step 1: (0,1) → (0,0) → (1,0) → (1,1)");

// Step 2 from image - I need to trace this carefully
// The middle image shows a 4x4 grid
// Starting from bottom-left, the curve seems to go:
// Bottom-left quadrant: a rotated U
// Then up to top-left quadrant
// Then across to top-right quadrant
// Then down to bottom-right quadrant
//
// With the standard Hilbert d2xy, order 2 gives:
// d=0: (0,0), d=1: (1,0), d=2: (1,1), d=3: (0,1)
// d=4: (0,2), d=5: (0,3), d=6: (1,3), d=7: (1,2)
// d=8: (2,2), d=9: (2,3), d=10: (3,3), d=11: (3,2)
// d=12: (3,1), d=13: (2,1), d=14: (2,0), d=15: (3,0)
//
// That's: (0,0)→(1,0)→(1,1)→(0,1)→(0,2)→(0,3)→(1,3)→(1,2)→
//         (2,2)→(2,3)→(3,3)→(3,2)→(3,1)→(2,1)→(2,0)→(3,0)

// Now in the image coordinate system (y increases downward):
// This same pattern but y-flipped would be:
// (0,3)→(1,3)→(1,2)→(0,2)→(0,1)→(0,0)→(1,0)→(1,1)→
// (2,1)→(2,0)→(3,0)→(3,1)→(3,2)→(2,2)→(2,3)→(3,3)

// Let me compare with the L-system output and the image

// Generate SVG with grid lines to make comparison easier
function generateGridSVG(pointSets, cellWidth = 300, cellHeight = 300) {
  const margin = 40;
  const totalWidth = pointSets.length * cellWidth;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${cellHeight}" viewBox="0 0 ${totalWidth} ${cellHeight}">
  <rect width="${totalWidth}" height="${cellHeight}" fill="white"/>`;

  for (let s = 0; s < pointSets.length; s++) {
    const { points, label, gridSize } = pointSets[s];
    const offsetX = s * cellWidth;
    const drawW = cellWidth - 2 * margin;
    const drawH = cellHeight - 2 * margin;
    const step = drawW / (gridSize - 1);

    // Draw grid
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const gx = offsetX + margin + i * step;
        const gy = margin + j * step;
        svg += `\n  <circle cx="${gx}" cy="${gy}" r="2" fill="#ccc"/>`;
      }
    }

    // Draw path
    let pathData = '';
    for (let i = 0; i < points.length; i++) {
      const px = offsetX + margin + points[i].x * step;
      const py = margin + points[i].y * step;
      pathData += (i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`);
    }

    // Draw start/end markers
    const startX = offsetX + margin + points[0].x * step;
    const startY = margin + points[0].y * step;
    const endX = offsetX + margin + points[points.length - 1].x * step;
    const endY = margin + points[points.length - 1].y * step;

    svg += `\n  <text x="${offsetX + cellWidth / 2}" y="20" text-anchor="middle" font-size="14" font-family="sans-serif" font-weight="bold">${label}</text>`;
    svg += `\n  <path d="${pathData}" stroke="black" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    svg += `\n  <circle cx="${startX}" cy="${startY}" r="5" fill="green"/>`;
    svg += `\n  <circle cx="${endX}" cy="${endY}" r="5" fill="red"/>`;
  }

  svg += '\n</svg>';
  return svg;
}

// Generate first 5 steps of the current Hilbert-based U-fork
const currentSteps = [];
for (let order = 1; order <= 5; order++) {
  const gridSize = Math.pow(2, order);
  const seq = generateCurve('A', { A: '-BF+AFA+FB-', B: '+AF-BFB-FA+' }, order);
  const pts = sequenceToRawPoints(seq, 0);
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of pts) { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); }
  const w = maxX - minX || 1;
  const h = maxY - minY || 1;
  const n = gridSize - 1;
  const norm = pts.map(p => ({
    x: Math.round((p.x - minX) / w * n),
    y: Math.round((p.y - minY) / h * n),
  }));
  currentSteps.push({ points: norm, label: `Current Step ${order} (${gridSize}x${gridSize})`, gridSize });
}
writeFileSync('/tmp/gh-issue-solver-1773520435460/experiments/u-fork-current-steps.svg', generateGridSVG(currentSteps));
console.log("Generated: experiments/u-fork-current-steps.svg");

// Now generate the target pattern using d2xy (standard Hilbert)
// The d2xy function generates the standard Hilbert curve in a different orientation
const targetSteps = [];
for (let order = 1; order <= 5; order++) {
  const gridSize = Math.pow(2, order);
  const total = gridSize * gridSize;
  const pts = [];
  for (let d = 0; d < total; d++) {
    pts.push(d2xy(gridSize, d));
  }
  targetSteps.push({ points: pts, label: `d2xy Step ${order} (${gridSize}x${gridSize})`, gridSize });
}
writeFileSync('/tmp/gh-issue-solver-1773520435460/experiments/u-fork-d2xy-steps.svg', generateGridSVG(targetSteps));
console.log("Generated: experiments/u-fork-d2xy-steps.svg");

// Let me also try with y-flipped d2xy
const flippedSteps = [];
for (let order = 1; order <= 5; order++) {
  const gridSize = Math.pow(2, order);
  const total = gridSize * gridSize;
  const pts = [];
  for (let d = 0; d < total; d++) {
    const p = d2xy(gridSize, d);
    pts.push({ x: p.x, y: gridSize - 1 - p.y });
  }
  flippedSteps.push({ points: pts, label: `d2xy-flip Step ${order} (${gridSize}x${gridSize})`, gridSize });
}
writeFileSync('/tmp/gh-issue-solver-1773520435460/experiments/u-fork-d2xy-flipped.svg', generateGridSVG(flippedSteps));
console.log("Generated: experiments/u-fork-d2xy-flipped.svg");
