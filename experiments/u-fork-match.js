/**
 * Find the exact L-system configuration that matches the target pattern
 * Target step 1: (0,1) → (0,0) → (1,0) → (1,1)
 *
 * This is: start bottom-left, go up, go right, go down
 * Starting direction = UP, sequence = F+F+F
 * That means: F(up), +(turn right to face right), F(right), +(turn right to face down), F(down)
 */

import { writeFileSync } from 'fs';

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

function sequenceToPoints(sequence, initialDir = 0) {
  const points = [];
  let x = 0, y = 0;
  let dir = initialDir;
  points.push({ x, y });
  for (const ch of sequence) {
    if (ch === 'F') {
      if (dir === 0) y -= 1;       // up
      else if (dir === 1) x += 1;  // right
      else if (dir === 2) y += 1;  // down
      else if (dir === 3) x -= 1;  // left
      points.push({ x, y });
    } else if (ch === '+') {
      dir = (dir + 1) % 4;
    } else if (ch === '-') {
      dir = (dir + 3) % 4;
    }
  }
  return points;
}

function normalize(pts, gridSize) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of pts) {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
  }
  const w = maxX - minX || 1;
  const h = maxY - minY || 1;
  const n = gridSize - 1;
  return pts.map(p => ({
    x: Math.round((p.x - minX) / w * n),
    y: Math.round((p.y - minY) / h * n),
  }));
}

// Target: step 1 = (0,1)→(0,0)→(1,0)→(1,1)
// This means starting at (0,1) going UP

// The current L-system: A → -BF+AFA+FB-
// At order 1, this gives: -BF+AFA+FB-
// Drawing chars only: - F + F + F -
// Starting dir=0(up): left→3(left), F→(-1,0), right→0(up), F→(-1,-1), right→1(right), F→(0,-1)
// Raw: (0,0)→(-1,0)→(-1,-1)→(0,-1)
// Normalized: (1,1)→(0,1)→(0,0)→(1,0)
// NOT matching target. Target is (0,1)→(0,0)→(1,0)→(1,1)

// The current is a MIRROR of the target!
// Current: (1,1)→(0,1)→(0,0)→(1,0) starts at (1,1) top-right
// Target:  (0,1)→(0,0)→(1,0)→(1,1) starts at (0,1) top-left... wait

// In screen coordinates (y down), normalized:
// Current raw: (0,0)→(-1,0)→(-1,-1)→(0,-1)
// After normalization to [0,1]: (1,1)→(0,1)→(0,0)→(1,0)
// In screen coords: that's bottom-right → bottom-left → top-left → top-right
// So it opens to the RIGHT (the open side is at the bottom, connecting endpoints)

// Target: (0,1)→(0,0)→(1,0)→(1,1)
// In screen coords: bottom-left → top-left → top-right → bottom-right
// Opens to the LEFT (the gap is at the left side between start and end)
// Actually both start and end are at the bottom, so it opens at the bottom
// Wait - the start (0,1) and end (1,1) are at y=1 (bottom in screen),
// so the opening is at the BOTTOM

// Let me reconsider. The image shows:
// Step 1: A U-shape that looks like ∪ rotated 90° clockwise → ⊃
// It opens to the LEFT
// The path goes: bottom-left → top-left → top-right → bottom-right

// So in my coordinate system:
// bottom-left = (0,1), top-left = (0,0), top-right = (1,0), bottom-right = (1,1)
// Target: (0,1) → (0,0) → (1,0) → (1,1)

// For the L-system A → -BF+AFA+FB-:
// The sequence at order 1 generates: F+F+F effectively
// I need to find the right starting direction

// With dir=0 (up): Raw (0,0)→(-1,0)→(-1,-1)→(0,-1)
// With dir=1 (right): Raw (0,0)→(0,-1)→(1,-1)→(1,0) → norm (0,1)→(0,0)→(1,0)→(1,1) ← MATCH!

console.log("Testing dir=1 (right) with standard Hilbert:");
for (let order = 1; order <= 5; order++) {
  const gridSize = Math.pow(2, order);
  const seq = generateCurve('A', { A: '-BF+AFA+FB-', B: '+AF-BFB-FA+' }, order);
  const pts = sequenceToPoints(seq, 1); // dir=1 = right
  const norm = normalize(pts, gridSize);
  if (order <= 3) {
    console.log(`Step ${order} (${gridSize}x${gridSize}): ${norm.map(p => `(${p.x},${p.y})`).join(' → ')}`);
  }
  console.log(`  Points: ${norm.length}, unique cells: ${new Set(norm.map(p => `${p.x},${p.y}`)).size}`);
}

// Generate SVGs
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
    const step = Math.min(drawW, drawH) / (gridSize - 1);
    const xOffset = offsetX + margin + (drawW - step * (gridSize - 1)) / 2;
    const yOffset = margin + (drawH - step * (gridSize - 1)) / 2;

    // Draw grid dots
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const gx = xOffset + i * step;
        const gy = yOffset + j * step;
        svg += `\n  <circle cx="${gx}" cy="${gy}" r="1.5" fill="#ddd"/>`;
      }
    }

    // Draw path
    let pathData = '';
    for (let i = 0; i < points.length; i++) {
      const px = xOffset + points[i].x * step;
      const py = yOffset + points[i].y * step;
      pathData += (i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`);
    }

    svg += `\n  <text x="${offsetX + cellWidth / 2}" y="20" text-anchor="middle" font-size="14" font-family="sans-serif" font-weight="bold">${label}</text>`;
    svg += `\n  <path d="${pathData}" stroke="black" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  svg += '\n</svg>';
  return svg;
}

const steps = [];
for (let order = 1; order <= 5; order++) {
  const gridSize = Math.pow(2, order);
  const seq = generateCurve('A', { A: '-BF+AFA+FB-', B: '+AF-BFB-FA+' }, order);
  const pts = sequenceToPoints(seq, 1);
  const norm = normalize(pts, gridSize);
  steps.push({ points: norm, label: `Step ${order} (${gridSize}×${gridSize})`, gridSize });
}
writeFileSync('/tmp/gh-issue-solver-1773520435460/experiments/u-fork-dir1-steps.svg', generateGridSVG(steps));
console.log("\nGenerated: experiments/u-fork-dir1-steps.svg");

// Also test the reversed rules with dir=1
console.log("\nTesting reversed rules with dir=1:");
for (let order = 1; order <= 3; order++) {
  const gridSize = Math.pow(2, order);
  const seq = generateCurve('A', { A: '+BF-AFA-FB+', B: '-AF+BFB+FA-' }, order);
  const pts = sequenceToPoints(seq, 1);
  const norm = normalize(pts, gridSize);
  console.log(`Step ${order}: ${norm.map(p => `(${p.x},${p.y})`).join(' → ')}`);
}

// And check: what about just using dir=right with axiom A?
// That means the initial turtle faces RIGHT.
// The L-system at order 1: -BF+AFA+FB-
// Starting dir=1(right):
// - → dir=0(up)
// B → skip
// F → up: (0,0)→(0,-1)
// + → dir=1(right)
// A → skip
// F → right: (0,-1)→(1,-1)
// A → skip
// + → dir=2(down)
// F → down: (1,-1)→(1,0)
// B → skip
// - → dir=1(right)
// Raw: (0,0)→(0,-1)→(1,-1)→(1,0)
// Normalize: (0,1)→(0,0)→(1,0)→(1,1)
// YES! This matches the target!

console.log("\nConfirmed: Standard Hilbert L-system with initial dir=RIGHT produces the target pattern!");
