// Broader search for L-systems that produce the target U-fork pattern.
// Try different axioms and rule structures.
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

const step1 = toGrid(parseSvgPath(readFileSync('target-svgs/tsp-tour-4.svg', 'utf8')));
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

// First, let's check if step 1 (order 1) can be matched with a single iteration
// Step 1: (1,1) -> (0,1) -> (0,0) -> (1,0) = 3 F moves: L U R
// As L-system sequence: -F+F+F- or similar

// Actually, for order 1, we just need the axiom to produce 3 F's with correct turns.
// L U R means: start facing some direction, turn to face L, move, turn to face U, move, turn to face R, move
// If we start facing LEFT (dir=3):
//   F (go left), then turn to face UP: need + (right turn from L is U), then F,
//   then turn to face RIGHT: need + (right turn from U is R), then F
//   Sequence: F+F+F, starting dir=3
// Check: dir=3, F: (0,0)->(-1,0), dir stays 3
// That gives L,L,L not L,U,R. Hmm.

// Let me recalculate:
// Start at (0,0), facing direction 3 (LEFT):
// F: x -= 1, now at (-1, 0). Direction: L
// +: dir = (3+1)%4 = 0 (UP)
// F: y -= 1, now at (-1, -1). Direction: U
// +: dir = (0+1)%4 = 1 (RIGHT)
// F: x += 1, now at (0, -1). Direction: R
// Points: (0,0), (-1,0), (-1,-1), (0,-1)
// Normalized: (1,1), (0,1), (0,0), (1,0) -- YES! This matches step 1!

// So for step 1, the sequence is F+F+F with start direction LEFT (3)

// Now, what L-system when applied once gives F+F+F?
// If the axiom is A and A -> F+F+F, we get step 1.
// But we need A -> something involving A and B for recursion.

// Standard Hilbert axiom is A, with A -> -BF+AFA+FB-
// At order 1, this produces: -BF+AFA+FB- (B and A are non-drawing, so just: -F+F+F-)
// Which traces: start, turn left (-), F, turn right (+), F, turn right (+), F, turn left (-)
// The turns at start and end don't matter for the first/last point.
// Effective: F, +, F, +, F (ignoring leading/trailing turns)
// With start dir=0(UP): -F+F+F-
//   Start facing UP(0)
//   -: dir = (0+3)%4 = 3 (LEFT)
//   F: go left. (0,0) -> (-1,0)
//   +: dir = (3+1)%4 = 0 (UP)
//   F: go up. (-1,0) -> (-1,-1)
//   +: dir = (0+1)%4 = 1 (RIGHT)
//   F: go right. (-1,-1) -> (0,-1)
//   -: dir = (1+3)%4 = 0 (UP)
//   Points: (0,0),(-1,0),(-1,-1),(0,-1) -> normalized: (1,1),(0,1),(0,0),(1,0) = step 1!

// Great! So the standard Hilbert order-1 with dir=0 gives step 1.
// But we showed that standard Hilbert order-2 does NOT give step 2.

// The problem might be that this is NOT a 2-variable Hilbert L-system.
// Maybe it uses more variables or a different structure.

// Let me try axioms with more F's, like Moore curve which has axiom LFL+F+LFL
// Moore is a closed curve, but let me try variants.

// Try: axiom could be more complex sequences
// For step 1 (3 F's), try axioms:
//   AFA (standard Hilbert-like: would give 3 rules applied to get more F's)
//   AFBFA
//   etc.

// Actually, let me think about this more carefully.
// At step n, we have 4^n points = 4^n - 1 moves.
// Step 1: 4 points, 3 moves
// Step 2: 16 points, 15 moves
// Step 3: 64 points, 63 moves

// If the axiom has k F's and we expand n times with rules having 3 F's each:
// After n expansions: k * 3^n F's = number of moves
// For k=1: 1*3^n -> n=1: 3 (matches step 1), n=2: 9 (not 15)
// For k=3: 3*3^n -> n=0: 3 (step 1), n=1: 9 (not 15), n=2: 27 (not 63)

// Hmm, none of these work for 15 or 63.
// 15 = 4^2 - 1 = 3 * 5
// 63 = 4^3 - 1 = 3 * 21 = 3 * 3 * 7

// Standard Hilbert: axiom A with 3 F's in rule -> 3^n moves after n iterations
// But we need 4^n - 1 moves. This is different!

// Wait, the Hilbert curve has 2^n * 2^n = 4^n points and 4^n - 1 moves.
// Standard Hilbert axiom A: after n iterations of rule A->-BF+AFA+FB-, we get
// number of F's = 2^(2n) - 1? Let me check.
// n=1: -BF+AFA+FB- -> F count = 3 (A and B have 0 F each)
// n=2: each A expands to rule with 3 F's, each B similarly
// Actually: A has 3 F's, and also 2 A's and 2 B's
// So F(n) = 3 + 2*F(n-1) + 2*G(n-1) where G is for B
// Since B rule also has 3 F's and 2 A's and 2 B's: F(n) = G(n) = 3 + 4*F(n-1)
// F(1) = 3
// F(2) = 3 + 4*3 = 15 -> YES! 4^2 - 1 = 15
// F(3) = 3 + 4*15 = 63 -> YES! 4^3 - 1 = 63

// OK so the standard Hilbert structure DOES give the right number of points!
// I was wrong earlier - the order-2 Hilbert with the standard A rule structure
// DOES give 16 points. My search was just not finding the right turn signs.

// Let me re-examine. The issue might be that I need to search over ALL possible
// L-system structures, not just the standard one.

// Actually wait, I DID search all 256 combinations of turns and found 0 matches.
// The problem might be something subtler.

// Let me check: what does the standard Hilbert L-system actually produce at order 2?
function generateAndTrace(axiom, ruleA, ruleB, order, startDir) {
  let seq = axiom;
  for (let i = 0; i < order; i++) {
    let next = '';
    for (const c of seq) {
      if (c === 'A') next += ruleA;
      else if (c === 'B') next += ruleB;
      else next += c;
    }
    seq = next;
  }
  return traceLS(seq, startDir);
}

console.log('Standard Hilbert order 2, dir 0:');
const stdH2 = generateAndTrace('A', '-BF+AFA+FB-', '+AF-BFB-FA+', 2, 0);
console.log('Points:', stdH2.length);
console.log('Path:', stdH2.map(p => `(${p.col},${p.row})`).join(' -> '));

// Now let me also try rules with different numbers of terms
// What about 3-variable systems? Or rules with more F's?

// Actually, let me try ALL possible rules that have exactly 3 F's per rule.
// The structure is: [turns]X1[F][turns]X2[F]X3[turns][F]X4[turns]
// where X1-X4 are A or B (or nothing for the outer ones)

// A more general structure: the rule for A is a sequence of turns, F's, A's, and B's
// that contains exactly 3 F's and a combination of A's and B's.

// For a standard Hilbert-like structure:
// Rule A: T1 V1 F T2 V2 F V3 T3 F V4 T4
// where T1-T4 are turns (+ or - or empty) and V1-V4 are variables (A, B, or empty)
// But typically each F is preceded by a variable

// Hmm, this is getting complex. Let me try a different approach.
// Maybe the axiom itself is more complex.

// What if the axiom is a full step-1 sequence like: -BF+AFA+FB-
// (i.e., order 0 = axiom produces 4 points directly)

console.log('\n=== Trying axiom = expanded A (order 0 = step 1) ===');
let found = 0;
const turnOpts = ['+', '-'];
for (const t1 of turnOpts) {
for (const t2 of turnOpts) {
for (const t3 of turnOpts) {
for (const t4 of turnOpts) {
for (const t5 of turnOpts) {
for (const t6 of turnOpts) {
for (const t7 of turnOpts) {
for (const t8 of turnOpts) {
  const ruleA = `${t1}BF${t2}AFA${t3}FB${t4}`;
  const ruleB = `${t5}AF${t6}BFB${t7}FA${t8}`;

  // order 0 = axiom A (1 iteration gives step 1)
  // order 1 = 2 iterations gives step 2
  for (let startDir = 0; startDir < 4; startDir++) {
    // Check if order 1 (single expansion) matches step 1
    const pts1 = generateAndTrace('A', ruleA, ruleB, 1, startDir);
    if (matchesTarget(pts1, step1)) {
      // Now check order 2 matches step 2
      const pts2 = generateAndTrace('A', ruleA, ruleB, 2, startDir);
      if (matchesTarget(pts2, step2)) {
        console.log(`MATCH! A->${ruleA}, B->${ruleB}, dir=${startDir}`);
        const pts3 = generateAndTrace('A', ruleA, ruleB, 3, startDir);
        if (matchesTarget(pts3, step3)) {
          console.log('  -> ALSO MATCHES STEP 3!');
        }
        found++;
      }
    }
  }
}}}}}}}}
console.log(`Found: ${found}`);

// Same but starting from B
console.log('\n=== Starting from B ===');
found = 0;
for (const t1 of turnOpts) {
for (const t2 of turnOpts) {
for (const t3 of turnOpts) {
for (const t4 of turnOpts) {
for (const t5 of turnOpts) {
for (const t6 of turnOpts) {
for (const t7 of turnOpts) {
for (const t8 of turnOpts) {
  const ruleA = `${t1}BF${t2}AFA${t3}FB${t4}`;
  const ruleB = `${t5}AF${t6}BFB${t7}FA${t8}`;

  for (let startDir = 0; startDir < 4; startDir++) {
    const pts1 = generateAndTrace('B', ruleA, ruleB, 1, startDir);
    if (matchesTarget(pts1, step1)) {
      const pts2 = generateAndTrace('B', ruleA, ruleB, 2, startDir);
      if (matchesTarget(pts2, step2)) {
        console.log(`MATCH! A->${ruleA}, B->${ruleB}, dir=${startDir}, axiom=B`);
        const pts3 = generateAndTrace('B', ruleA, ruleB, 3, startDir);
        if (matchesTarget(pts3, step3)) {
          console.log('  -> ALSO MATCHES STEP 3!');
        }
        found++;
      }
    }
  }
}}}}}}}}
console.log(`Found: ${found}`);

// What if the structure is different? Like A -> t1 B F t2 B F B t3 F B t4
// (all B's instead of ABA pattern)
// Or mixed patterns...

// Let me try: for each rule, try all possible arrangements of 2 variables among 4 positions
// Rule: t1 V1 F t2 V2 F V3 t3 F V4 t4
// V1,V2,V3,V4 each in {A, B}

console.log('\n=== Exhaustive variable placement search ===');
found = 0;
const vars = ['A', 'B'];
for (const v1 of vars) {
for (const v2 of vars) {
for (const v3 of vars) {
for (const v4 of vars) {
for (const v5 of vars) {
for (const v6 of vars) {
for (const v7 of vars) {
for (const v8 of vars) {
  for (const t1 of turnOpts) {
  for (const t2 of turnOpts) {
  for (const t3 of turnOpts) {
  for (const t4 of turnOpts) {
  for (const t5 of turnOpts) {
  for (const t6 of turnOpts) {
  for (const t7 of turnOpts) {
  for (const t8 of turnOpts) {
    const ruleA = `${t1}${v1}F${t2}${v2}F${v3}${t3}F${v4}${t4}`;
    const ruleB = `${t5}${v5}F${t6}${v6}F${v7}${t7}F${v8}${t8}`;

    for (const axiom of ['A', 'B']) {
      for (let startDir = 0; startDir < 4; startDir++) {
        const pts1 = generateAndTrace(axiom, ruleA, ruleB, 1, startDir);
        if (matchesTarget(pts1, step1)) {
          const pts2 = generateAndTrace(axiom, ruleA, ruleB, 2, startDir);
          if (matchesTarget(pts2, step2)) {
            console.log(`MATCH! axiom=${axiom}, A->${ruleA}, B->${ruleB}, dir=${startDir}`);
            found++;
            if (found > 20) {
              console.log('Stopping after 20 matches...');
              process.exit(0);
            }
          }
        }
      }
    }
  }}}}}}}}
}}}}}}}}
console.log(`Found: ${found}`);
