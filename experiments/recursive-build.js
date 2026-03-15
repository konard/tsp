/**
 * Build the U-fork curve by direct recursive construction.
 *
 * From the analysis:
 * Step 1 base: (1,1) -> (0,1) -> (0,0) -> (1,0)  (4 orientations: id, cw90, 180, ccw90)
 *
 * Step 2 uses 4 sub-blocks, each with a specific orientation of the base:
 *   Block (0,0) = TL: id        [(1,1),(0,1),(0,0),(1,0)]
 *   Block (0,1) = BL: ccw90     [(1,0),(1,1),(0,1),(0,0)]
 *   Block (1,1) = BR: 180       [(0,0),(1,0),(1,1),(0,1)]
 *   Block (1,0) = TR: 180       [(0,0),(1,0),(1,1),(0,1)]
 *
 * Block visit order for step 2: TL(partial) -> BL(partial) -> BR(all) -> BL(rest) -> TL(rest) -> TR(all)
 *
 * But this interleaving is the problem. The blocks are not filled independently.
 *
 * NEW IDEA: What if the pattern isn't recursive at all, but instead is a
 * deterministic spiral? Let me check.
 *
 * Looking at the visit-order matrix for step 3:
 *  10  11  12  13  14  15  16  17
 *   9  36  35  34  33  32  31  18
 *   8  37  26  27  28  29  30  19
 *   7  38  25  24  23  22  21  20
 *   6  39  52  53  54  55  56  57
 *   5  40  51  50  49  48  47  58
 *   4  41  42  43  44  45  46  59
 *   3   2   1   0  63  62  61  60
 *
 * Starting from d=0 at (3,7):
 * - Go left 3 steps to (0,7): d=0,1,2,3
 * - Go up 7 steps to (0,0): d=3,4,5,6,7,8,9,10
 * - Go right 7 steps to (7,0): d=10,11,...,17
 * - Go down 3 steps to (7,3): d=17,18,19,20
 * - Go left 5 steps to (2,3): d=20,21,22,23,24,25
 * Wait, that's not right. Let me trace more carefully.
 *
 * Actually from the segments: L3 U7 R7 D3 L5 U1 R4 U1 L5 D5 R5 U1 L4 U1 R5 D3 L3
 *
 * L3: (3,7)->(0,7) 4 points
 * U7: (0,7)->(0,0) 8 points including start
 * R7: (0,0)->(7,0) 8 points
 * D3: (7,0)->(7,3) 4 points
 * L5: (7,3)->(2,3) 6 points
 * U1: (2,3)->(2,2) 2 points
 * R4: (2,2)->(6,2) 5 points
 * U1: (6,2)->(6,1) 2 points
 * L5: (6,1)->(1,1) 6 points
 * D5: (1,1)->(1,6) 6 points
 * R5: (1,6)->(6,6) 6 points
 * U1: (6,6)->(6,5) 2 points
 * L4: (6,5)->(2,5) 5 points
 * U1: (2,5)->(2,4) 2 points
 * R5: (2,4)->(7,4) 6 points
 * D3: (7,4)->(7,7) 4 points
 * L3: (7,7)->(4,7) 4 points
 *
 * Total: 4+7+7+3+5+1+4+1+5+5+5+1+4+1+5+3+3 = 64 ✓ (counting steps, not points: 63 steps + 1 start)
 *
 * This is a BOUSTROPHEDON SPIRAL! Starting from the middle of one edge,
 * it spirals outward to the perimeter, then spirals back inward.
 *
 * More precisely: it's a space-filling curve that traverses concentric rectangles
 * in a boustrophedon (zigzag) pattern.
 *
 * Wait actually let me re-examine. Starting from (3,7) near the center of bottom edge:
 * Go left to (0,7), then up to (0,0) - that's the whole left side + bottom half
 * Then right to (7,0) - whole top
 * Then down to (7,3) - partial right side
 * Then left to (2,3) - go inward
 * Then up-right-down zigzag in the inner part
 * Then back out
 *
 * This is NOT a simple spiral. It has a recursive structure.
 * Let me verify: at step n, the grid is 2^n x 2^n.
 * The start point is at (2^(n-1) - 1, 2^n - 1) = (half-1, size-1) for step n.
 *
 * Step 1: start (1,1) = (2^0-1, 2^1-1) = (0, 1)? No, (1,1) != (0,1)
 * Step 2: start (1,1) - same as step 1?
 * Step 3: start (3,7) = (2^2-1, 2^3-1) = (3, 7) ✓
 * Step 4: start (6,9) - let me check: (2^3-1, ?) = (7, ?) - no, 6 ≠ 7
 *
 * Hmm, step 4 starts at (6,9). Let me check: 2^4=16, so half=8
 * (6,9) is not a simple formula from that...
 *
 * Let me check step 4 start: from previous analysis, d=0 is at (6,9).
 * 6 = 8-2, 9 = 8+1. Or: 6 = 2*3, 9 = 2*4+1.
 * Step 3 start (3,7): 3 = 4-1, 7 = 8-1.
 * Step 2 start (1,1): 1 = 2-1, 1 = ... hmm.
 *
 * Actually wait. Maybe the recursion works by replacing each cell of step n-1
 * with a 2x2 block, and the start point moves accordingly.
 * Step 1 start: (1,1)
 * Step 2 start: (1,1) -> in the 2x scaled grid, this is block (0,0) at local (1,1) -> global (1,1)
 * Hmm, same position.
 *
 * Step 3 start: step 2's start was (1,1). In block terms at step 2, (1,1) is in block (0,0).
 * Block (0,0) has transform=id, so local start is (1,1). Global: (2*0+1, 2*0+1) = (1,1)?
 * But step 3 starts at (3,7)! That's not (1,1).
 *
 * Actually, step 3 starts at d=0, which is at position (3,7).
 * Let me check: in step 2, d=0 is at (1,1). So the step 2 d=0 cell is at (1,1).
 * In step 3, this cell (1,1) from step 2 maps to block (0,0) in step 3's 4x4 sub-blocks.
 *
 * Hmm wait, step 2 is 4x4, step 3 is 8x8. Each step-2 cell becomes a 2x2 block in step 3.
 * Step 2 d=0 is at (1,1). The 2x2 block for cell (1,1) is cols [2,3], rows [2,3].
 * The sub-block transform for pd=0 in step2->step3 was "id".
 * id base: (1,1)->(0,1)->(0,0)->(1,0)
 * So d=0 in step 3 should be at local (1,1) of block (1,1) = global (2+1, 2+1) = (3,3).
 * But actual d=0 is at (3,7)! Not (3,3).
 *
 * So the recursion is NOT step-2-block(1,1) -> step-3-block starting point.
 * The interleaving means the d=0 point moves to a completely different position.

// Given the complexity, let me try a completely different approach:
// Just implement a direct coordinate-to-index function using the observed pattern.

// Looking at the visit order matrices:
// Step 2 (4x4):
//  10  11  12  13
//   9   0  15  14
//   8   1   2   3
//   7   6   5   4
//
// Step 3 (8x8):
//  10  11  12  13  14  15  16  17
//   9  36  35  34  33  32  31  18
//   8  37  26  27  28  29  30  19
//   7  38  25  24  23  22  21  20
//   6  39  52  53  54  55  56  57
//   5  40  51  50  49  48  47  58
//   4  41  42  43  44  45  46  59
//   3   2   1   0  63  62  61  60

// KEY INSIGHT: Step 3 embeds step 2 inside it!
// The inner 4x4 (rows 1-6, cols 1-6... no wait)
// Actually: if I look at rows 2-5, cols 2-5 of step 3:
//  26  27  28  29
//  25  24  23  22
//  52  53  54  55
//  51  50  49  48
// That's NOT step 2.

// But if I look at every other point:
// step 3 at (1,1)=36, (1,3)=38, (3,1)=32, (3,3)=22, (1,5)=40, (1,7)=2
// Hmm, also not obvious.

// Let me look at a spiral interpretation.
// For step 3, the path visits cells in order 0,1,2,...,63.
// The start is near the center-bottom, spirals outward to cover the perimeter,
// then spirals back inward in the opposite direction.

// Let me trace the "rings" differently. Instead of distance from edge,
// look at which "layer" in a spiral each d-value belongs to:

// Layer 0 (center 2x2): d 24,25 and d 23,52? No...
// Actually: d=0 at (3,7), d=63 at (4,7). These are adjacent, center bottom.
// d=23 at (4,3), d=24 at (3,3). Also adjacent.
// d=53 at (3,4), d=54 at (4,4). Also adjacent.

// This curve has a specific structure where it visits the grid in two "halves":
// First half (d=0 to ~31): goes from center-bottom outward
// Second half (d=32 to 63): goes from somewhere else back to center-bottom

// Let me check: d=31 is at (6,1), d=32 is at (5,1). Both in upper portion.
// d=0=(3,7), d=31=(6,1), d=32=(5,1), d=63=(4,7)

// Actually, let me reconsider. The path:
// starts at (3,7), goes LEFT to (0,7), UP to (0,0), RIGHT to (7,0), then comes back inward...
// then at some point comes back out and finishes near (4,7) adjacent to start.

// The whole path is an OPEN curve from (3,7) to (4,7).
// The curve fills the entire grid, visits every cell exactly once.
// Start and end are adjacent (Hamiltonian path).

// The structure is: spiral out from near-center to perimeter (or partial),
// then spiral back in to near-center, with each ring being a rectangle.

// Let me try to construct this algorithmically by tracking the pattern.

console.log('=== Testing recursive construction ===');

// Key: at each level of recursion, we have 4 sub-curves connected.
// The connection pattern creates the interleaving.

// Let me try the simplest possible thing: define the curve by its actual
// recursive replacement rules as an L-system, but with a DIFFERENT L-system
// than the standard Hilbert.

// The base pattern (step 1): L U R (left, up, right)
// The step 2 pattern as segments: D RR D LLL UUU RRR D L

// Step 1 directions: L U R
// Step 2 directions: D RR D LLL UUU RRR D L

// Can we derive step 2 from step 1 by replacing each segment?
// Step 1: L      U      R
// Step 2: D RR D|LLL UUU|RRR D L
// Segment 1 (L): D RR D (then connects to next)
// Segment 2 (U): LLL UUU (then connects to next)
// Segment 3 (R): RRR D L

// The replacements:
// L(1) -> D(1) R(2) D(1)
// U(1) -> L(3) U(3)
// R(1) -> R(3) D(1) L(1)
//
// Lengths: L=1 replaced by 4 moves (D1 R2 D1), U=1 replaced by 6 moves (L3 U3), R=1 replaced by 5 moves (R3 D1 L1)
// Total: 4 + 6 + 5 = 15 moves for 16 points ✓

// Now check step 2 -> step 3:
// Step 2: D(1) R(2) D(1) L(3) U(3) R(3) D(1) L(1)
// Step 3: L3 U7 R7 D3 L5 U1 R4 U1 L5 D5 R5 U1 L4 U1 R5 D3 L3

// Let me apply the replacement rules to step 2:
// D(1) -> ?
// R(2) -> ?
// etc.

// Actually, the replacement rules should scale with the size. At step n,
// each move covers 2^(n-1) cells in the previous level.

// Let me re-examine. In step 1, each segment is 1 cell long.
// In step 2, segments have various lengths (1 or 2 or 3).
// In step 3, segments have lengths (1, 3, 4, 5, 7).

// This doesn't look like a simple L-system substitution where each character
// maps to a fixed string. The lengths depend on position within the curve.

// Maybe I need to think about this differently.
// Let me try to implement it as a direct recursive function:
// uForkCurve(order) generates the list of points.

// For order 1: [(1,1), (0,1), (0,0), (1,0)]
// For order n: take uForkCurve(n-1), and for each point, expand to a 2x2 sub-block.
// The challenge is determining the sub-block traversal order and how they connect.

// From the analysis, within each parent cell, the 4 sub-cells are visited in a specific
// order that depends on the entry and exit direction of that parent cell IN THE CONTEXT
// of its neighbors. And the sub-cells are NOT visited contiguously - the curve may visit
// one sub-cell, cross to a neighbor's sub-cell, and come back.

// This makes it hard to define as a pure L-system. It's more like a context-sensitive grammar.

// Let me try yet another approach: generate all possible L-systems with the
// Hilbert-like structure and test which one matches.

// A Hilbert-like L-system has:
// Axiom: A (or B)
// A -> [turns] B F [turns] A F A [turns] F B [turns]
// B -> [turns] A F [turns] B F B [turns] F A [turns]
// where turns are + or -

// Standard Hilbert: A -> -BF+AFA+FB-, B -> +AF-BFB-FA+
// Let me try all combinations of turns

const turnOptions = ['+', '-'];
let attempts = 0;
let found = false;

for (const t1 of turnOptions) {
for (const t2 of turnOptions) {
for (const t3 of turnOptions) {
for (const t4 of turnOptions) {
for (const t5 of turnOptions) {
for (const t6 of turnOptions) {
for (const t7 of turnOptions) {
for (const t8 of turnOptions) {
  // A -> t1 B F t2 A F A t3 F B t4
  // B -> t5 A F t6 B F B t7 F A t8
  const ruleA = `${t1}BF${t2}AFA${t3}FB${t4}`;
  const ruleB = `${t5}AF${t6}BFB${t7}FA${t8}`;

  // Generate order 2
  let seq = 'A';
  for (let iter = 0; iter < 2; iter++) {
    let next = '';
    for (const c of seq) {
      if (c === 'A') next += ruleA;
      else if (c === 'B') next += ruleB;
      else next += c;
    }
    seq = next;
  }

  // Trace with all 4 start directions
  for (let startDir = 0; startDir < 4; startDir++) {
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

    // Normalize
    let minX = Infinity, minY = Infinity;
    for (const p of pts) { minX = Math.min(minX, p.col); minY = Math.min(minY, p.row); }
    const norm = pts.map(p => ({col: p.col - minX, row: p.row - minY}));

    // Check if matches step 2
    if (norm.length === 16) {
      const maxX = Math.max(...norm.map(p => p.col));
      const maxY = Math.max(...norm.map(p => p.row));
      if (maxX === 3 && maxY === 3) {
        // Check uniqueness (visits all cells)
        const visited = new Set(norm.map(p => `${p.col},${p.row}`));
        if (visited.size === 16) {
          // Compare with target
          const match = norm.every((p, i) => p.col === step2[i].col && p.row === step2[i].row);
          if (match) {
            console.log(`MATCH! A->${ruleA}, B->${ruleB}, startDir=${startDir}`);
            found = true;
          }
        }
      }
    }
  }
  attempts++;
}
}
}
}
}
}
}
}

console.log(`Tested ${attempts} rule combinations, found: ${found}`);

// Also try starting from B
console.log('\n=== Trying B as starting axiom ===');
found = false;
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

  let seq = 'B';
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
    const norm = pts.map(p => ({col: p.col - minX, row: p.row - minY}));

    if (norm.length === 16) {
      const maxX = Math.max(...norm.map(p => p.col));
      const maxY = Math.max(...norm.map(p => p.row));
      if (maxX === 3 && maxY === 3) {
        const visited = new Set(norm.map(p => `${p.col},${p.row}`));
        if (visited.size === 16) {
          const match = norm.every((p, i) => p.col === step2[i].col && p.row === step2[i].row);
          if (match) {
            console.log(`MATCH! A->${ruleA}, B->${ruleB}, startDir=${startDir}, axiom=B`);
            found = true;
          }
        }
      }
    }
  }
}
}
}
}
}
}
}
}

console.log(`Found: ${found}`);
