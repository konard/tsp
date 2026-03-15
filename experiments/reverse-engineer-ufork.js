/**
 * Reverse-engineer the U-fork pattern from target SVGs.
 * Extract grid points, then try different Hilbert curve variants to match.
 */

import { readFileSync } from 'fs';

// Parse SVG path to extract coordinate pairs
function parseSvgPath(svgContent) {
  const pathMatch = svgContent.match(/d="([^"]+)"/);
  if (!pathMatch) throw new Error('No path found');
  const pathData = pathMatch[1];

  const points = [];
  const parts = pathData.trim().split(/\s+/);

  let i = 0;
  while (i < parts.length) {
    if (parts[i] === 'M' || parts[i] === 'L') {
      const x = parseFloat(parts[i + 1]);
      const y = parseFloat(parts[i + 2]);
      points.push({ x, y });
      i += 3;
    } else if (parts[i] === 'Z') {
      i += 1;
    } else {
      i += 1;
    }
  }

  return points;
}

// Convert SVG coordinates to grid indices
function toGrid(points) {
  const xs = [...new Set(points.map(p => p.x))].sort((a, b) => a - b);
  const ys = [...new Set(points.map(p => p.y))].sort((a, b) => a - b);

  return points.map(p => ({
    col: xs.indexOf(p.x),
    row: ys.indexOf(p.y)
  }));
}

// Read and parse each target SVG
const files = [
  { name: 'tsp-tour-4.svg', step: 1 },
  { name: 'tsp-tour-3.svg', step: 2 },
  { name: 'tsp-tour-2.svg', step: 3 },
  { name: 'tsp-tour-5.svg', step: 4 },
];

for (const f of files) {
  const svgContent = readFileSync(`target-svgs/${f.name}`, 'utf8');
  const svgPoints = parseSvgPath(svgContent);
  const gridPoints = toGrid(svgPoints);
  const gridSize = Math.round(Math.sqrt(gridPoints.length));

  console.log(`\n=== Step ${f.step} (${gridSize}x${gridSize}, ${gridPoints.length} points) ===`);
  console.log('Path as (col,row):');
  console.log(gridPoints.map(p => `(${p.col},${p.row})`).join(' -> '));

  // Print visit-order matrix
  const matrix = Array.from({ length: gridSize }, () => Array(gridSize).fill(-1));
  gridPoints.forEach((p, i) => {
    matrix[p.row][p.col] = i;
  });

  console.log('\nVisit-order matrix (row=y, col=x):');
  for (let r = 0; r < gridSize; r++) {
    console.log(matrix[r].map(v => String(v).padStart(4)).join(''));
  }

  // Print start and end
  console.log(`Start: (${gridPoints[0].col}, ${gridPoints[0].row})`);
  console.log(`End: (${gridPoints[gridPoints.length - 1].col}, ${gridPoints[gridPoints.length - 1].row})`);
}

// Now try to generate Hilbert curve with different directions and compare
console.log('\n\n=== Trying Hilbert curve variants ===');

function generateHilbert(order) {
  let seq = 'A';
  for (let i = 0; i < order; i++) {
    let next = '';
    for (const c of seq) {
      if (c === 'A') next += '-BF+AFA+FB-';
      else if (c === 'B') next += '+AF-BFB-FA+';
      else next += c;
    }
    seq = next;
  }
  return seq;
}

function traceSequence(seq, startDir) {
  const points = [];
  let x = 0, y = 0;
  let dir = startDir; // 0=up, 1=right, 2=down, 3=left
  const dx = [0, 1, 0, -1];
  const dy = [-1, 0, 1, 0];

  points.push({ x, y });
  for (const c of seq) {
    if (c === 'F') {
      x += dx[dir];
      y += dy[dir];
      points.push({ x, y });
    } else if (c === '+') {
      dir = (dir + 1) % 4;
    } else if (c === '-') {
      dir = (dir + 3) % 4;
    }
  }

  // Normalize to 0-based grid
  let minX = Infinity, minY = Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
  }
  return points.map(p => ({ col: p.x - minX, row: p.y - minY }));
}

// Read tsp-tour-3.svg (step 2, 4x4 = order 2)
const svg2 = readFileSync('target-svgs/tsp-tour-3.svg', 'utf8');
const target2 = toGrid(parseSvgPath(svg2));
console.log('\nTarget step 2:', target2.map(p => `(${p.col},${p.row})`).join(' -> '));

for (let dir = 0; dir < 4; dir++) {
  const pts = traceSequence(generateHilbert(2), dir);
  const match = pts.length === target2.length &&
    pts.every((p, i) => p.col === target2[i].col && p.row === target2[i].row);
  console.log(`Dir ${dir}: ${pts.map(p => `(${p.col},${p.row})`).join(' -> ')} ${match ? 'MATCH!' : ''}`);
}

// Also try with reversed L-system (swap A/B rules, swap +/-)
function generateHilbertAlt(order) {
  let seq = 'B';
  for (let i = 0; i < order; i++) {
    let next = '';
    for (const c of seq) {
      if (c === 'A') next += '-BF+AFA+FB-';
      else if (c === 'B') next += '+AF-BFB-FA+';
      else next += c;
    }
    seq = next;
  }
  return seq;
}

console.log('\n--- Starting from B ---');
for (let dir = 0; dir < 4; dir++) {
  const pts = traceSequence(generateHilbertAlt(2), dir);
  const match = pts.length === target2.length &&
    pts.every((p, i) => p.col === target2[i].col && p.row === target2[i].row);
  console.log(`Dir ${dir}: ${pts.map(p => `(${p.col},${p.row})`).join(' -> ')} ${match ? 'MATCH!' : ''}`);
}

// Try flipping + and - meanings
function traceSequenceFlipped(seq, startDir) {
  const points = [];
  let x = 0, y = 0;
  let dir = startDir;
  const dx = [0, 1, 0, -1];
  const dy = [-1, 0, 1, 0];

  points.push({ x, y });
  for (const c of seq) {
    if (c === 'F') {
      x += dx[dir];
      y += dy[dir];
      points.push({ x, y });
    } else if (c === '+') {
      dir = (dir + 3) % 4; // left instead of right
    } else if (c === '-') {
      dir = (dir + 1) % 4; // right instead of left
    }
  }

  let minX = Infinity, minY = Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
  }
  return points.map(p => ({ col: p.x - minX, row: p.y - minY }));
}

console.log('\n--- Flipped turns, starting from A ---');
for (let dir = 0; dir < 4; dir++) {
  const pts = traceSequenceFlipped(generateHilbert(2), dir);
  const match = pts.length === target2.length &&
    pts.every((p, i) => p.col === target2[i].col && p.row === target2[i].row);
  console.log(`Dir ${dir}: ${pts.map(p => `(${p.col},${p.row})`).join(' -> ')} ${match ? 'MATCH!' : ''}`);
}

console.log('\n--- Flipped turns, starting from B ---');
for (let dir = 0; dir < 4; dir++) {
  const pts = traceSequenceFlipped(generateHilbertAlt(2), dir);
  const match = pts.length === target2.length &&
    pts.every((p, i) => p.col === target2[i].col && p.row === target2[i].row);
  console.log(`Dir ${dir}: ${pts.map(p => `(${p.col},${p.row})`).join(' -> ')} ${match ? 'MATCH!' : ''}`);
}

// Try also reversing the path
console.log('\n--- Reversed target for comparison ---');
const reversed2 = [...target2].reverse();
console.log('Reversed target step 2:', reversed2.map(p => `(${p.col},${p.row})`).join(' -> '));

for (let dir = 0; dir < 4; dir++) {
  const pts = traceSequence(generateHilbert(2), dir);
  const match = pts.length === reversed2.length &&
    pts.every((p, i) => p.col === reversed2[i].col && p.row === reversed2[i].row);
  if (match) console.log(`Dir ${dir} matches reversed!`);
}

for (let dir = 0; dir < 4; dir++) {
  const pts = traceSequenceFlipped(generateHilbert(2), dir);
  const match = pts.length === reversed2.length &&
    pts.every((p, i) => p.col === reversed2[i].col && p.row === reversed2[i].row);
  if (match) console.log(`Flipped dir ${dir} matches reversed!`);
}

// Try direct recursive Hilbert approach
console.log('\n\n=== Trying direct recursive Hilbert d2xy ===');

// Standard Hilbert d2xy
function hilbertD2xy(n, d) {
  let rx, ry, s, t = d;
  let x = 0, y = 0;
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
  return { col: x, row: y };
}

for (let order = 1; order <= 2; order++) {
  const n = Math.pow(2, order);
  const total = n * n;
  const pts = [];
  for (let d = 0; d < total; d++) {
    pts.push(hilbertD2xy(n, d));
  }
  console.log(`\nHilbert d2xy order ${order} (${n}x${n}):`);
  console.log(pts.map(p => `(${p.col},${p.row})`).join(' -> '));

  // Check against target
  const target = order === 1 ? toGrid(parseSvgPath(readFileSync('target-svgs/tsp-tour-4.svg', 'utf8'))) :
                 order === 2 ? target2 : null;
  if (target) {
    const match = pts.length === target.length &&
      pts.every((p, i) => p.col === target[i].col && p.row === target[i].row);
    console.log(`Match: ${match}`);
  }
}

// Try all 8 transformations of Hilbert (4 rotations x 2 reflections)
console.log('\n\n=== All Hilbert transformations for step 2 ===');
function transformPoints(pts, gridSize, transform) {
  const n = gridSize - 1;
  return pts.map(p => {
    let { col, row } = p;
    switch (transform) {
      case 0: return { col, row };
      case 1: return { col: n - row, row: col }; // 90° CW
      case 2: return { col: n - col, row: n - row }; // 180°
      case 3: return { col: row, row: n - col }; // 270° CW
      case 4: return { col: n - col, row }; // flip X
      case 5: return { col: row, row: col }; // flip diag
      case 6: return { col, row: n - row }; // flip Y
      case 7: return { col: n - row, row: n - col }; // flip anti-diag
    }
  });
}

const transformNames = ['identity', '90° CW', '180°', '270° CW', 'flip-X', 'flip-diag', 'flip-Y', 'flip-anti-diag'];

const n = 4;
const total = n * n;
const basePts = [];
for (let d = 0; d < total; d++) {
  basePts.push(hilbertD2xy(n, d));
}

for (let t = 0; t < 8; t++) {
  const transformed = transformPoints(basePts, n, t);
  const match = transformed.length === target2.length &&
    transformed.every((p, i) => p.col === target2[i].col && p.row === target2[i].row);

  const revMatch = transformed.length === target2.length &&
    [...transformed].reverse().every((p, i) => p.col === target2[i].col && p.row === target2[i].row);

  if (match || revMatch) {
    console.log(`Transform ${t} (${transformNames[t]}): ${match ? 'FORWARD MATCH' : ''} ${revMatch ? 'REVERSE MATCH' : ''}`);
    console.log(transformed.map(p => `(${p.col},${p.row})`).join(' -> '));
  }
}

// Also try just generating all Hilbert orders and all transforms, checking both forward and reverse
console.log('\n\n=== Checking step 3 (8x8) too ===');
const svg3 = readFileSync('target-svgs/tsp-tour-2.svg', 'utf8');
const target3 = toGrid(parseSvgPath(svg3));
console.log('Target step 3 length:', target3.length);

const n3 = 8;
const basePts3 = [];
for (let d = 0; d < 64; d++) {
  basePts3.push(hilbertD2xy(n3, d));
}

for (let t = 0; t < 8; t++) {
  const transformed = transformPoints(basePts3, n3, t);
  const match = transformed.length === target3.length &&
    transformed.every((p, i) => p.col === target3[i].col && p.row === target3[i].row);

  const revMatch = transformed.length === target3.length &&
    [...transformed].reverse().every((p, i) => p.col === target3[i].col && p.row === target3[i].row);

  if (match || revMatch) {
    console.log(`Transform ${t} (${transformNames[t]}): ${match ? 'FORWARD' : ''} ${revMatch ? 'REVERSE' : ''}`);
  }
}
