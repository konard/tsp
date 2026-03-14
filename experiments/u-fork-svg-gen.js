/**
 * Experiment: Generate SVGs for the U-fork fractal pattern
 * Goal: Match the pattern shown in the issue image
 *
 * From the image analysis:
 * - Step 1: U-shape on 2x2 grid (C-shape opening left)
 * - Step 2: 4 copies on 4x4 grid
 * - Step 3: Further recursion on 8x8 grid
 *
 * The current Hilbert curve L-system is:
 *   Axiom: A, A -> -BF+AFA+FB-, B -> +AF-BFB-FA+
 *
 * But the image shows a different pattern. Let's try various L-systems.
 */

import { writeFileSync } from 'fs';

// Generate L-system sequence
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

// Convert L-system to points (turtle graphics)
function sequenceToPoints(sequence, initialDir = 0) {
  const points = [];
  let x = 0, y = 0;
  let dir = initialDir; // 0=up, 1=right, 2=down, 3=left

  points.push({ x, y });

  for (const ch of sequence) {
    if (ch === 'F') {
      if (dir === 0) y -= 1;
      else if (dir === 1) x += 1;
      else if (dir === 2) y += 1;
      else if (dir === 3) x -= 1;
      points.push({ x, y });
    } else if (ch === '+') {
      dir = (dir + 1) % 4; // turn right
    } else if (ch === '-') {
      dir = (dir + 3) % 4; // turn left
    }
  }

  return points;
}

// Normalize points to 0..gridSize-1
function normalizePoints(points) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  const w = maxX - minX || 1;
  const h = maxY - minY || 1;
  return points.map(p => ({
    x: (p.x - minX) / w,
    y: (p.y - minY) / h,
  }));
}

// Generate SVG from points
function generateSVG(points, width = 200, height = 200, margin = 20) {
  const norm = normalizePoints(points);
  const svgW = width + 2 * margin;
  const svgH = height + 2 * margin;

  let pathData = '';
  for (let i = 0; i < norm.length; i++) {
    const px = margin + norm[i].x * width;
    const py = margin + norm[i].y * height;
    pathData += (i === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">
  <rect width="${svgW}" height="${svgH}" fill="white"/>
  <path d="${pathData}" stroke="black" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

// Generate combined SVG with multiple steps
function generateCombinedSVG(configs, cellWidth = 250, cellHeight = 250) {
  const margin = 30;
  const totalWidth = configs.length * cellWidth;

  let svgs = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${cellHeight}" viewBox="0 0 ${totalWidth} ${cellHeight}">
  <rect width="${totalWidth}" height="${cellHeight}" fill="white"/>`;

  for (let i = 0; i < configs.length; i++) {
    const { points, label } = configs[i];
    const norm = normalizePoints(points);
    const offsetX = i * cellWidth;
    const drawW = cellWidth - 2 * margin;
    const drawH = cellHeight - 2 * margin;

    let pathData = '';
    for (let j = 0; j < norm.length; j++) {
      const px = offsetX + margin + norm[j].x * drawW;
      const py = margin + norm[j].y * drawH;
      pathData += (j === 0 ? `M ${px} ${py}` : ` L ${px} ${py}`);
    }

    svgs += `\n  <text x="${offsetX + cellWidth/2}" y="15" text-anchor="middle" font-size="12" font-family="sans-serif">${label}</text>`;
    svgs += `\n  <path d="${pathData}" stroke="black" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  svgs += '\n</svg>';
  return svgs;
}

// ---- Test different L-system variants ----

console.log("=== Testing different U-fork L-system variants ===\n");

// Current implementation (standard Hilbert)
const hilbert = {
  name: 'current-hilbert',
  axiom: 'A',
  rules: { A: '-BF+AFA+FB-', B: '+AF-BFB-FA+' },
};

// Variant 1: Try different axiom orientation
const variant1 = {
  name: 'variant1-rotated',
  axiom: 'A',
  rules: { A: '+BF-AFA-FB+', B: '-AF+BFB+FA-' },
};

// Variant 2: Different starting shape
const variant2 = {
  name: 'variant2-ufork',
  axiom: 'A',
  rules: { A: '-BF+AFA+FB-', B: '+AF-BFB-FA+' },
  initialDir: 1, // start facing right
};

// Variant 3: Modified rules for the C/U shape
const variant3 = {
  name: 'variant3',
  axiom: 'A',
  rules: { A: '+BF-AFA-FB+', B: '-AF+BFB+FA-' },
  initialDir: 2, // start facing down
};

// Looking at the image more carefully:
// Step 1 traces: bottom-left → top-left → top-right → bottom-right
// That's a U-shape on 2x2: (0,1)→(0,0)→(1,0)→(1,1)
// Starting at bottom-left going UP, then RIGHT, then DOWN
// Sequence for step 1: F+F+F (start facing up)
// This means the axiom produces: F+F+F at order 1

// Actually, for the Hilbert curve with axiom A:
// Order 1: A expands to -BF+AFA+FB-
// Removing non-drawing chars: -F+F+F-  → left, Forward, right, Forward, right, Forward, left
// If starting dir=0 (up): left→facing left(3), F→move left, right→facing up(0), F→move up, right→facing right(1), F→move right
// Points: (0,0)→(-1,0)→(-1,-1)→(0,-1)
// Normalized: (0,1)→(0,0) is not matching...

// Let me trace each variant carefully
const variants = [hilbert, variant1, variant2, variant3];

for (const v of variants) {
  console.log(`\n--- ${v.name} ---`);
  const configs = [];
  for (let order = 1; order <= 5; order++) {
    const seq = generateCurve(v.axiom, v.rules, order);
    const pts = sequenceToPoints(seq, v.initialDir || 0);
    console.log(`Order ${order}: ${pts.length} points`);
    if (order <= 3) {
      console.log(`  Raw points: ${pts.map(p => `(${p.x},${p.y})`).join(' → ')}`);
    }
    configs.push({ points: pts, label: `Step ${order}` });
  }

  const svg = generateCombinedSVG(configs);
  writeFileSync(`/tmp/gh-issue-solver-1773520435460/experiments/u-fork-${v.name}.svg`, svg);
  console.log(`  SVG written: experiments/u-fork-${v.name}.svg`);
}

// Now let me also try tracing the actual image pattern manually
// Image step 1: U-shape opening left on 2x2 grid
// Trace: start bottom-left (0,1), go up to (0,0), right to (1,0), down to (1,1)
// That's: facing up, F, turn right, F, turn right, F => F+F+F starting from (0,1) facing up

// Image step 2: 4x4 grid
// Looking at the image, the pattern in step 2:
// Bottom-left quadrant: mirrored U opening right
// Top-left quadrant: U opening left (same as step 1)
// Top-right quadrant: U opening left (same as step 1)
// Bottom-right quadrant: mirrored U opening left

// This is consistent with Hilbert curve but with a specific orientation

// Let me also try starting directions and see which matches
console.log("\n\n=== Trying all starting directions with standard Hilbert ===");
for (let dir = 0; dir < 4; dir++) {
  const dirNames = ['up', 'right', 'down', 'left'];
  console.log(`\nStarting direction: ${dirNames[dir]}`);
  const configs = [];
  for (let order = 1; order <= 3; order++) {
    const seq = generateCurve('A', { A: '-BF+AFA+FB-', B: '+AF-BFB-FA+' }, order);
    const pts = sequenceToPoints(seq, dir);
    console.log(`  Order ${order} raw: ${pts.map(p => `(${p.x},${p.y})`).join(' → ')}`);
    configs.push({ points: pts, label: `Step ${order} dir=${dirNames[dir]}` });
  }
  const svg = generateCombinedSVG(configs);
  writeFileSync(`/tmp/gh-issue-solver-1773520435460/experiments/u-fork-dir-${dir}.svg`, svg);
}

// Also try reversed rules
console.log("\n\n=== Trying reversed Hilbert variants ===");
const reversedVariants = [
  { name: 'rev1', axiom: 'A', rules: { A: '+BF-AFA-FB+', B: '-AF+BFB+FA-' } },
  { name: 'rev2', axiom: 'B', rules: { A: '-BF+AFA+FB-', B: '+AF-BFB-FA+' } },
  { name: 'rev3', axiom: 'B', rules: { A: '+BF-AFA-FB+', B: '-AF+BFB+FA-' } },
];

for (const v of reversedVariants) {
  console.log(`\n--- ${v.name} ---`);
  const configs = [];
  for (let order = 1; order <= 5; order++) {
    const seq = generateCurve(v.axiom, v.rules, order);
    const pts = sequenceToPoints(seq, 0);
    if (order <= 3) {
      console.log(`  Order ${order} raw: ${pts.map(p => `(${p.x},${p.y})`).join(' → ')}`);
    }
    configs.push({ points: pts, label: `Step ${order}` });
  }
  const svg = generateCombinedSVG(configs);
  writeFileSync(`/tmp/gh-issue-solver-1773520435460/experiments/u-fork-${v.name}.svg`, svg);
}
