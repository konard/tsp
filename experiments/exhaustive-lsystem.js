// Exhaustive L-system search with ALL possible rule structures.
// Rules can have any arrangement of F, +, -, A, B tokens.
// We know each rule needs exactly 3 F's and 4 variables (A/B).
// Total tokens per rule: up to about 10-12.
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

// Try the Moore-curve-like axiom: it has 7 F's in the axiom
// Moore: LFL+F+LFL -> which at order 0 gives F_F+F+F_F = 5 F's? No...
// Moore axiom expands L variables, so at order 0 it's just LFL+F+LFL (no F if not expanded)
// At order 1 (one expansion): each L becomes -RF+LFL+FR-
// So F count = 3 from axiom + 3*number_of_L_expansions + 3*number_of_R_expansions

// Actually I realized the issue. The standard form I tested only has one structure.
// Let me try a Moore-like axiom instead: something like AFA+F+AFA or similar

// Also, let me try L-systems with 3 variables (A, B, C).

// But first, let me try a completely different approach.
// What if each rule has a DIFFERENT number of F's?
// For example: A -> F+F-F+F-F (5 F's) and B -> ... (1 F)
// Total F's per full expansion: depends on variable count

// Actually, the key constraint is: order 1 gives 3 F's (4 points),
// order 2 gives 15 F's (16 points), order 3 gives 63 F's (64 points)
// F(n) = 4^n - 1
// Recursive: F(n) = c_F + c_A * F(n-1) + c_B * G(n-1)
//            G(n) = d_F + d_A * F(n-1) + d_B * G(n-1)
// where c_F = # of F in rule A, c_A = # of A in rule A, etc.
//
// If the system is symmetric (rule A and B have same structure):
// F(n) = c_F + (c_A + c_B) * F(n-1)
// F(1) = c_F
// F(2) = c_F + (c_A + c_B) * c_F = c_F * (1 + c_A + c_B)
// F(3) = c_F + (c_A + c_B) * c_F * (1 + c_A + c_B) = c_F * (1 + (c_A+c_B) + (c_A+c_B)^2)
//
// We need: F(1) = 3, F(2) = 15, F(3) = 63
// From F(1) = 3: c_F = 3
// From F(2) = 15: 3 * (1 + c_A + c_B) = 15 -> c_A + c_B = 4
// From F(3) = 63: 3 * (1 + 4 + 16) = 63 -> YES
//
// So we need rules with 3 F's and 4 variables (A+B combined).
// Standard Hilbert: A -> -BF+AFA+FB- has 3 F's, 2 A's, 2 B's -> c_A=2, c_B=2, sum=4. CORRECT.
//
// So any L-system matching our pattern must have 3 F's and 4 variables per rule.
// The variables can be any mix of A and B summing to 4.
// Possible: 4A+0B, 3A+1B, 2A+2B, 1A+3B, 0A+4B

// Standard Hilbert uses 2A+2B pattern: xBFxAFAxFBx
// Let me try ALL patterns with 3 F's and 4 variables in various positions.

// A rule has the form: sequence of {F, +, -, A, B} tokens
// Constraints: exactly 3 F's, exactly 4 variables (A/B)
// Between tokens, we can have any number of turns, but let's limit to 0 or 1 turn
// between each token.

// Actually this search space is huge. Let me be smarter.
// Standard form: T V F T V F V T F V T
// (4 turn positions, 4 variable positions, 3 F positions)
// I already searched this.

// What about forms with different arrangements of F and V?
// Like: T F V T F V T V F V T F V T
// (4 F's, 4 V's - but we need 3 F's)

// Or: V T F V T V F T V F V T
// Variables not always adjacent to F's

// Let me try: rule has exactly 3 F's and 4 variables, with turns between them.
// Generate all orderings of 3 F's and 4 V's (7 tokens), with optional turns.

// Wait, that's 7! / (3! * 4!) * 2^8 * 2^4 = too many.

// Let me instead try a specific alternative: the "beta-omega" curve structure.
// Or try rules where variables are grouped differently.

// Key idea: maybe the rule has F's and variables in a different pattern:
// Instead of V F T V F V T F V, try V V F T V F V T F V V etc.

// Actually, let me just try a much broader set of rule templates.
// Templates with 3 F's and 4 variables:
const templates = [
  'tVFtVFVtFVt',    // standard: T V F T V F V T F V T
  'tVVFtVFtFVVt',   // 2 vars before first F
  'tVFtVFtVFVVt',   // 2 vars after last F
  'tVFtVVFtFVt',    // 2 vars before middle F
  'tVFVtFtVFVt',    // different grouping
  'tVFtVFtVFtVt',   // balanced but 4F... wait, need 3F and 4V
  'tVVFtVFVtFt',    // 2V at start, F at end
  'tFVtVFVtFVVt',   // F first
  'tVVVFtFtFVt',    // 3V then 3F then 1V
  'tVFVVtFtFVt',    // spread differently
];

// Actually this is getting too complex. Let me try another approach entirely:
// Generate rules by enumerating all possible sequences of length 7-11
// containing exactly 3 F's, 4 variables, and 0-4 turns.

// With constraint: no two F's in a row (doesn't make physical sense for the curve)
// and no two turns in a row (cancels out)

// Too many combinations. Let me focus on what we know.

// From the segment analysis:
// Step 1: L U R (3 moves)
// Step 2: D RR D LLL UUU RRR D L (15 moves)
// Step 3: L3 U7 R7 D3 L5 U1 R4 U1 L5 D5 R5 U1 L4 U1 R5 D3 L3 (63 moves)

// Step 1 direction changes: L->U (turn right), U->R (turn right)
// Turns: +, + (starting from left)
// As L-system: F+F+F (starting facing left)

// Step 2 detailed:
// Starting facing DOWN (since first move is D from step 2):
// Sequence: F+FF+F-FFF-FFF+FFF+F-F
// Let me verify:
// Start facing D(2):
// F -> down (D), dir still 2
// + -> dir=3(L)
// F -> left, F -> left (2 F's)
// Wait, I need to think about this differently.

// Actually, the movement sequence is: D R R D L L L U U U R R R D L
// Starting direction: DOWN (2)
// Move D: already facing D, just F
// Move R: need to turn to face R. From D(2): + gives L(3), - gives R(1). So turn left(-): dir=1(R). Then F.
// No wait, + = turn right, - = turn left.
// From D(2): +(right turn) -> L(3), -(left turn) -> R(1). So to face R, turn left: -
// Actually that's confusing. Let me use: 0=U, 1=R, 2=D, 3=L
// + = clockwise = (dir+1)%4
// - = counter-clockwise = (dir+3)%4

// Start: dir=2(D)
// First move D: already at 2. F
// Second move R: from 2, need 1. (2+3)%4=1. So -F
// Third move R: from 1, need 1. Already. F
// Fourth move D: from 1, need 2. (1+1)%4=2. So +F
// Fifth move L: from 2, need 3. (2+1)%4=3. So +F
// Sixth move L: from 3, need 3. Already. F
// Seventh move L: from 3, need 3. Already. F
// Eighth move U: from 3, need 0. (3+1)%4=0. So +F
// Ninth move U: from 0, need 0. Already. F
// Tenth move U: from 0, need 0. Already. F
// Eleventh move R: from 0, need 1. (0+1)%4=1. So +F
// Twelfth move R: from 1, need 1. Already. F
// Thirteenth move R: from 1, need 1. Already. F
// Fourteenth move D: from 1, need 2. (1+1)%4=2. So +F
// Fifteenth move L: from 2, need 3. (2+1)%4=3. So +F

console.log('Step 2 as L-system sequence (start dir 2):');
const directions2 = [];
const s2moves = [2, 1, 1, 2, 3, 3, 3, 0, 0, 0, 1, 1, 1, 2, 3]; // D R R D L L L U U U R R R D L
let prevDir = 2;
let lsSeq2 = '';
for (const move of s2moves) {
  if (move !== prevDir) {
    const rightTurn = (prevDir + 1) % 4;
    const leftTurn = (prevDir + 3) % 4;
    if (move === rightTurn) {
      lsSeq2 += '+';
    } else if (move === leftTurn) {
      lsSeq2 += '-';
    } else {
      // 180 turn: ++ or --
      lsSeq2 += '++';
    }
  }
  lsSeq2 += 'F';
  prevDir = move;
}
console.log(lsSeq2);

// Same for step 1 (start dir 3=L for step 1: L U R)
const s1moves = [3, 0, 1]; // L U R
let prevDir1 = 3;
let lsSeq1 = '';
for (const move of s1moves) {
  if (move !== prevDir1) {
    const rightTurn = (prevDir1 + 1) % 4;
    if (move === rightTurn) lsSeq1 += '+';
    else lsSeq1 += '-';
  }
  lsSeq1 += 'F';
  prevDir1 = move;
}
console.log('Step 1 sequence (start dir 3):', lsSeq1);

// Now, if we have an L-system, step 1 expanded should give lsSeq1,
// and step 2 expanded should give lsSeq2.
// step 1 = 1 iteration of rule applied to axiom
// step 2 = 2 iterations

// For a Hilbert-like system: axiom = A
// After 1 iter: A -> rule_A (which should give step 1 when traced from startDir)
// After 2 iters: rule_A with each A,B replaced again

// Step 1 sequence: F+F+F (from dir=3, this gives L,U,R)
// This means rule_A = ...F+F+F... with possible surrounding turns and variables

// Standard Hilbert A = -BF+AFA+FB-
// Removing variables: -F+FF+F- = F+F+F with leading - and trailing -
// Which gives: -, F, +, F, +, F, -
// From dir 0(U): -(dir=3=L), F(go L), +(dir=0=U), F(go U), +(dir=1=R), F(go R), -(dir=0=U)
// Path: (0,0) -> L(-1,0) -> U(-1,-1) -> R(0,-1). Norm: (1,1)->(0,1)->(0,0)->(1,0) = step 1!

// So the rule for A, when variables are removed, must produce: leading_turns F + F + F trailing_turns
// where the leading/trailing turns don't change the first/last step because they only affect direction.

// Step 2 sequence: F-FF+F+FFF+FFF+FFF+F+F
// Let me verify this is correct by tracing:
console.log('\nVerifying step 2 sequence...');
const seq2 = lsSeq2;
{
  const pts = traceLS(seq2, 2);
  console.log('Traced points:', pts.length);
  const match = matchesTarget(pts, step2);
  console.log('Matches step 2:', match);
  if (!match) {
    console.log('First few:', pts.slice(0, 5).map(p => `(${p.col},${p.row})`).join(' -> '));
    console.log('Target first few:', step2.slice(0, 5).map(p => `(${p.col},${p.row})`).join(' -> '));
  }
}

// Now for step 3
const s3path = step3;
const s3moves2 = [];
for (let i = 0; i < s3path.length - 1; i++) {
  const dx = s3path[i+1].col - s3path[i].col;
  const dy = s3path[i+1].row - s3path[i].row;
  if (dx === 1) s3moves2.push(1);      // R
  else if (dx === -1) s3moves2.push(3); // L
  else if (dy === 1) s3moves2.push(2);  // D
  else if (dy === -1) s3moves2.push(0); // U
}

// Get start direction for step 3
const startDir3 = s3moves2[0];
let prevDir3 = startDir3;
let lsSeq3 = '';
for (const move of s3moves2) {
  if (move !== prevDir3) {
    const diff = (move - prevDir3 + 4) % 4;
    if (diff === 1) lsSeq3 += '+';
    else if (diff === 3) lsSeq3 += '-';
    else lsSeq3 += '++'; // 180
  }
  lsSeq3 += 'F';
  prevDir3 = move;
}
console.log('\nStep 3 start dir:', startDir3);
console.log('Step 3 sequence length:', lsSeq3.length);
console.log('Step 3 sequence:', lsSeq3);

// Verify step 3
{
  const pts = traceLS(lsSeq3, startDir3);
  console.log('Step 3 traced points:', pts.length);
  const match = matchesTarget(pts, step3);
  console.log('Matches step 3:', match);
}

// Now we have:
// Step 1: F+F+F (start dir 3, or equivalently -F+F+F- start dir 0)
// Step 2: (the seq2 above, start dir 2)
// Step 3: (the seq3 above, start dir 3)

// If this is an L-system with axiom A, rule A, rule B:
// iteration 1 -> step 1 sequence
// iteration 2 -> step 2 sequence
// The step 2 sequence should be the step 1 sequence with each A/B replaced.

// But the starting direction changes between steps!
// Step 1 starts dir 3, step 2 starts dir 2, step 3 starts dir 3
// This alternation suggests the curve orientation alternates.

// Let me re-examine. Actually, looking at the standard Hilbert:
// The starting direction is always the SAME (e.g., 0).
// The CURVE direction changes because of the leading/trailing turns in the rule.
// Rule A = -BF+AFA+FB-, first char is -, which turns left from starting dir.
// So from dir 0(U), - makes it dir 3(L), then F goes left.

// So if I include leading/trailing turns:
// Step 1 full: (whatever turns to get to first move dir) F+F+F (whatever turns at end)
// With start dir 0: -F+F+F-  (standard Hilbert pattern)
// With start dir 2: +F-F-F+  (flipped)

// Let me figure out what happens with different starting dirs:
// We need the first F to go in direction 3(L) for step 1: (1,1)->(0,1)
// From dir 0: need - to get to dir 3. Lead: -
// From dir 1: need ++ to get to dir 3. Lead: ++
// From dir 2: need + to get to dir 3. Lead: +
// From dir 3: no turn needed. Lead: (empty)

// And step 2 first move is D(2). From various start dirs:
// From dir 0: need ++ to get to 2. Lead: ++
// From dir 1: need + to get to 2. Lead: +
// From dir 2: no turn. Lead: (empty)
// From dir 3: need - to get to 2. Lead: -

// If we use a FIXED start dir of 0:
// Step 1: -F+F+F[trailing]
// Step 2: ++F[rest][trailing]
// These don't look like they come from the same L-system structure.

// Unless the L-system rules produce different leading turns at different levels.
// Standard Hilbert does this! A = -BF+AFA+FB- has:
// Order 1: -BF+AFA+FB- -> removes B,A: -F+FF+F-
// Order 2: expansion of above with more turns

// OK so the key question: is there ANY 2-variable L-system that, when expanded
// and traced from a FIXED starting direction, produces step 1, 2, 3, 4?

// I already tested all 256 turn combos for the standard structure.
// But the starting direction might not be 0. Let me make sure I tested all 4.
// Actually, in my earlier search I DID test all 4 start directions.
// And I also tested both axioms (A and B).
// And I tested different variable arrangements.

// So the standard Hilbert structure doesn't work.
// Maybe the rule structure is fundamentally different.

// Let me try rules with MORE tokens. For example:
// A -> T V T V F T V F V T F V T V T
// (4 variables, 3 F's, with extra variables not adjacent to F)

// Actually, extra variables that aren't adjacent to F just produce more variables
// in the next expansion. This would change the F count formula.
// With 5 variables per rule: F(n) = 3 + 5*F(n-1)
// F(1)=3, F(2)=18 (not 15). Doesn't match.
// So we definitely need exactly 4 variables per rule.

// What if turns are doubled? Like A -> --BF++AFA--FB++
// Some positions have ++ or -- (180 degree turns)?

console.log('\n=== Trying rules with double turns ===');
// Template: t1 B F t2 A F A t3 F B t4
// where t1-t4 can be: '', '+', '-', '++', '--', '+-', '-+'
const turnOpts2 = ['', '+', '-', '++', '--'];
let count = 0;
let found = 0;

for (const t1 of turnOpts2) {
for (const t2 of turnOpts2) {
for (const t3 of turnOpts2) {
for (const t4 of turnOpts2) {
for (const t5 of turnOpts2) {
for (const t6 of turnOpts2) {
for (const t7 of turnOpts2) {
for (const t8 of turnOpts2) {
  const ruleA = `${t1}BF${t2}AFA${t3}FB${t4}`;
  const ruleB = `${t5}AF${t6}BFB${t7}FA${t8}`;

  for (const axiom of ['A', 'B']) {
    for (let startDir = 0; startDir < 4; startDir++) {
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
      const pts = traceLS(seq, startDir);
      if (matchesTarget(pts, step2)) {
        console.log(`MATCH! axiom=${axiom} dir=${startDir} A->${ruleA} B->${ruleB}`);
        found++;
        if (found > 5) process.exit(0);
      }
    }
  }
  count++;
}}}}}}}}

console.log(`Tested ${count} rules with double turns, found ${found}`);
