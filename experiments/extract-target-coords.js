import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const svgDir = path.join(__dirname, '..', 'target-svgs');

for (let order = 2; order <= 5; order++) {
  const file = path.join(svgDir, `tsp-tour-${order}.svg`);
  const svg = fs.readFileSync(file, 'utf8');

  // Extract d attribute from the path element
  const dMatch = svg.match(/\bd="([^"]+)"/);
  if (!dMatch) {
    console.log(`tsp-tour-${order}.svg: no path found`);
    continue;
  }

  const d = dMatch[1];

  // Parse M and L commands to get coordinate pairs
  const coords = [];
  const re = /([ML])\s+([\d.e+-]+)\s+([\d.e+-]+)/g;
  let m;
  while ((m = re.exec(d)) !== null) {
    coords.push([parseFloat(m[2]), parseFloat(m[3])]);
  }

  // Determine N from number of points: N*N = number of unique points
  const uniqueSet = new Set(coords.map(([x, y]) => `${x},${y}`));
  const numUnique = uniqueSet.size;
  const N = Math.round(Math.sqrt(numUnique));

  console.log(`=== tsp-tour-${order}.svg ===`);
  console.log(`Points in path: ${coords.length}, Unique: ${numUnique}, N: ${N} (${N}x${N} grid)`);

  // Convert SVG coords to grid indices
  const step = 360 / (N - 1);
  const gridCoords = coords.map(([sx, sy]) => {
    const gx = Math.round((sx - 20) / step);
    const gy = Math.round((sy - 20) / step);
    return [gx, gy];
  });

  console.log('Grid coordinate path:');
  console.log(gridCoords.map(([x, y]) => `(${x},${y})`).join(' -> '));
  console.log();
}
