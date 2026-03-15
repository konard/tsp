// Brute-force search for L-system rules that match the target U-fork pattern
import { readFileSync } from 'fs';

function parseSvgPath(svgContent) {
  const pathMatch = svgContent.match(/d="([^"]+)"/);
  const pathData = pathMatch[1];
  const points = [];
  const parts = pathData.trim().split(/\s+/);
  let i = 0;
  while (i < parts.length) {
    if (parts[i] === 'M' || parts[i] === 'L') {
      points.push({ x: parseFloat(parts[i + 1]), y: parseFloat(parts[i + 2]) });
      i += 3;
    } else if (parts[i] === 'Z') { i += 1; } else { i += 1; }
  }
  return points;
}

function toGrid(points) {
  const xs = [...new Set(points.map(p => p.x))].sort((a, b) => a - b);
  const ys = [...new Set(points.map(p => p.y))].sort((a, b) => a - b);
  return points.map(p => ({ col: xs.indexOf(p.x), row: ys.indexOf(p.y) }));
}

const step2 = toGrid(parseSvgPath(readFileSync('target-svgs/tsp-tour-3.svg', 'utf8')));
const step3 = toGrid(parseSvgPath(readFileSync('target-svgs/tsp-tour-2.svg', 'utf8')));

function traceLS(seq, startDir) {
  const pts = [];
  let x = 0, y = 0, dir = startDir;
  const dx = [0, 1, 0, -1];
  const dy = [-1, 0, 1, 0];
  pts.push({col: x, row: y});
  for (const c of seq) {
    if (c === 'F') {
      x += dx[dir]; y += dy[dir];
      pts.push({col: x, row: y});
    } else if (c === '+') {
      dir = (dir + 1) % 4;
    } else if (c === '-') {
      dir = (dir + 3) % 4;
    }
  }
  let minX = Infinity, minY = Infinity;
  for (const p of pts) { minX = Math.min(minX, p.col); minY = Math.min(minY, p.row); }
  return pts.map(p => ({col: p.col - minX, row: p.row - minY}));
}

function matchesTarget(norm, target) {
  if (norm.length !== target.length) return false;
  const n = Math.round(Math.sqrt(norm.length));
  const maxX = Math.max(...norm.map(p => p.col));
  const maxY = Math.max(...norm.map(p => p.row));
  if (maxX !== n - 1 || maxY !== n - 1) return false;
  const visited = new Set(norm.map(p => `${p.col},${p.row}`));
  if (visited.size !== norm.length) return false;
  return norm.every((p, i) => p.col === target[i].col && p.row === target[i].row);
}

const turnOptions = ['+', '-'];

// Search standard Hilbert-like: A -> t1 B F t2 A F A t3 F B t4
console.log('=== Standard Hilbert-like rules (axiom A) ===');
let found = 0;
for (const t1 of turnOptions) {
for (const t2 of turnOptions) {
for (const t3 of turnOptions) {
for (const t4 of turnOptions) {
for (const t5 of turnOptions) {
for (const t6 of turnOptions) {
for (const t7 of turnOptions) {
for (const t8 of turnOptions) {
  const ruleA = `${t1}BF${t2}AFA${t3}FB${t4}`;
  const ruleB = `${t5}AF${t6}BFB${t7}FA${t8}`;

  for (const axiom of ['A', 'B']) {
    let seq = axiom;
    for (let iter = 0; iter < 2; iter++) {
      let next = '';
      for (const c of seq) {
        if (c === 'A') next += ruleA;
        else if (c === 'B') next += ruleB;
        else next += c;
      }
      seq = next;
    }

    for (let startDir = 0; startDir < 4; startDir++) {
      const norm = traceLS(seq, startDir);
      if (matchesTarget(norm, step2)) {
        console.log(`MATCH! axiom=${axiom}, A->${ruleA}, B->${ruleB}, dir=${startDir}`);

        // Now verify at step 3 (order 3)
        let seq3 = axiom;
        for (let iter = 0; iter < 3; iter++) {
          let next = '';
          for (const c of seq3) {
            if (c === 'A') next += ruleA;
            else if (c === 'B') next += ruleB;
            else next += c;
          }
          seq3 = next;
        }
        const norm3 = traceLS(seq3, startDir);
        if (matchesTarget(norm3, step3)) {
          console.log('  -> ALSO MATCHES STEP 3!');
        }
        found++;
      }
    }
  }
}}}}}}}
}

console.log(`Found ${found} matches for step 2`);

// Also try different rule structures:
// A -> t1 B F t2 A F A t3 F B t4  (standard)
// A -> t1 A F t2 B F B t3 F A t4  (swapped A/B)
// etc.

console.log('\n=== Alternative rule structure: swapped variables ===');
found = 0;
for (const t1 of turnOptions) {
for (const t2 of turnOptions) {
for (const t3 of turnOptions) {
for (const t4 of turnOptions) {
for (const t5 of turnOptions) {
for (const t6 of turnOptions) {
for (const t7 of turnOptions) {
for (const t8 of turnOptions) {
  // Try different structures
  const ruleA = `${t1}AF${t2}BFB${t3}FA${t4}`;
  const ruleB = `${t5}BF${t6}AFA${t7}FB${t8}`;

  for (const axiom of ['A', 'B']) {
    let seq = axiom;
    for (let iter = 0; iter < 2; iter++) {
      let next = '';
      for (const c of seq) {
        if (c === 'A') next += ruleA;
        else if (c === 'B') next += ruleB;
        else next += c;
      }
      seq = next;
    }

    for (let startDir = 0; startDir < 4; startDir++) {
      const norm = traceLS(seq, startDir);
      if (matchesTarget(norm, step2)) {
        console.log(`MATCH! axiom=${axiom}, A->${ruleA}, B->${ruleB}, dir=${startDir}`);

        let seq3 = axiom;
        for (let iter = 0; iter < 3; iter++) {
          let next = '';
          for (const c of seq3) {
            if (c === 'A') next += ruleA;
            else if (c === 'B') next += ruleB;
            else next += c;
          }
          seq3 = next;
        }
        const norm3 = traceLS(seq3, startDir);
        if (matchesTarget(norm3, step3)) {
          console.log('  -> ALSO MATCHES STEP 3!');
        }
        found++;
      }
    }
  }
}}}}}}}
}

console.log(`Found ${found} matches for step 2`);
