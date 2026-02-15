/**
 * Deriving the correct space-filling tree walking algorithm - Version 2
 *
 * Let me take a different approach. Instead of rotations, I'll focus on
 * the entry/exit points and derive the correct visiting order.
 */

import { writeFileSync } from 'fs';

// Expected sequences:
// Order 1: (0,1) -> (0,0) -> (1,0) -> (1,1)
// Order 2: (1,2) -> (1,3) -> (0,3) -> (0,2) -> (1,1) -> (0,1) -> (0,0) -> (1,0) -> (2,1) -> (2,0) -> (3,0) -> (3,1) -> (2,2) -> (3,2) -> (3,3) -> (2,3)

// Let me label the corners:
// TL = (0,0), TR = (1,0), BL = (0,1), BR = (1,1)

// Order 1 visits: BL -> TL -> TR -> BR (counter-clockwise starting from BL)

// For Order 2, let me trace each quadrant:
// BL quadrant (coords 0,2 to 1,3):
//   Points 1-4: (1,2) -> (1,3) -> (0,3) -> (0,2)
//   Local coords: TR -> BR -> BL -> TL
//   This is a clockwise loop starting from TR

// TL quadrant (coords 0,0 to 1,1):
//   Points 5-8: (1,1) -> (0,1) -> (0,0) -> (1,0)
//   Local coords: BR -> BL -> TL -> TR
//   This is counter-clockwise starting from BR

// TR quadrant (coords 2,0 to 3,1):
//   Points 9-12: (2,1) -> (2,0) -> (3,0) -> (3,1)
//   Local coords: BL -> TL -> TR -> BR
//   This is counter-clockwise starting from BL

// BR quadrant (coords 2,2 to 3,3):
//   Points 13-16: (2,2) -> (3,2) -> (3,3) -> (2,3)
//   Local coords: TL -> TR -> BR -> BL
//   This is clockwise starting from TL

// So the patterns are:
// Base (order 1): BL -> TL -> TR -> BR (CCW from BL)
// BL quadrant: TR -> BR -> BL -> TL (CW from TR) - needs entry TR, exit TL
// TL quadrant: BR -> BL -> TL -> TR (CCW from BR) - needs entry BR, exit TR
// TR quadrant: BL -> TL -> TR -> BR (CCW from BL) - same as base! entry BL, exit BR
// BR quadrant: TL -> TR -> BR -> BL (CW from TL) - needs entry TL, exit BL

// Let me think about this in terms of entry/exit corners:
// The base pattern enters at BL, exits at BR
// BL: enter at TR (from loop back), exit at TL (to go to TL quadrant)
// TL: enter at BR (from BL's TL), exit at TR (to go to TR quadrant)
// TR: enter at BL (from TL's TR), exit at BR (to go to BR quadrant)
// BR: enter at TL (from TR's BR), exit at BL (to go back to BL quadrant)

// Key insight: The pattern within each quadrant depends on the entry/exit points
// If we define the 4-point loop by entry and exit corners, we can derive the path

function getLoopFromEntryExit(entry, exit) {
  // Given entry and exit corners, return the 4-point visiting order
  // Corners: TL=0, TR=1, BL=2, BR=3
  // We visit all 4 corners, entering at 'entry' and exiting at 'exit'

  const corners = ['TL', 'TR', 'BL', 'BR'];

  // For a 4-node loop, there are exactly 2 ways to traverse:
  // CW: 0->1->3->2 (TL->TR->BR->BL)
  // CCW: 0->2->3->1 (TL->BL->BR->TR)
  // But we can start from any corner

  // Actually, for a loop visiting 4 corners, starting from 'entry':
  // We need to find the direction that leads from entry to exit

  // Let's define the positions as a cycle
  // CW order: TL -> TR -> BR -> BL -> TL...
  // CCW order: TL -> BL -> BR -> TR -> TL...

  const cwOrder = ['TL', 'TR', 'BR', 'BL'];
  const ccwOrder = ['TL', 'BL', 'BR', 'TR'];

  // Find which direction works
  const entryIdxCW = cwOrder.indexOf(entry);
  const exitIdxCW = cwOrder.indexOf(exit);
  const entryIdxCCW = ccwOrder.indexOf(entry);
  const exitIdxCCW = ccwOrder.indexOf(exit);

  // In CW, after 3 steps from entry, we should be at exit
  const cwExitCheck = cwOrder[(entryIdxCW + 3) % 4];
  const ccwExitCheck = ccwOrder[(entryIdxCCW + 3) % 4];

  let result;
  if (cwExitCheck === exit) {
    // CW direction works
    result = [];
    for (let i = 0; i < 4; i++) {
      result.push(cwOrder[(entryIdxCW + i) % 4]);
    }
  } else if (ccwExitCheck === exit) {
    // CCW direction works
    result = [];
    for (let i = 0; i < 4; i++) {
      result.push(ccwOrder[(entryIdxCCW + i) % 4]);
    }
  } else {
    throw new Error(`Cannot find valid path from ${entry} to ${exit}`);
  }

  return result;
}

// Verify with the expected patterns:
console.log("Testing getLoopFromEntryExit:");
console.log("Base (BL->BR):", getLoopFromEntryExit('BL', 'BR')); // Should be BL->TL->TR->BR
console.log("BL quad (TR->TL):", getLoopFromEntryExit('TR', 'TL')); // Should be TR->BR->BL->TL
console.log("TL quad (BR->TR):", getLoopFromEntryExit('BR', 'TR')); // Should be BR->BL->TL->TR
console.log("TR quad (BL->BR):", getLoopFromEntryExit('BL', 'BR')); // Should be BL->TL->TR->BR
console.log("BR quad (TL->BL):", getLoopFromEntryExit('TL', 'BL')); // Should be TL->TR->BR->BL

// Now the key is: how do entry/exit points transform when we recurse?
// When we're in a quadrant with specific entry/exit, the child quadrants
// will have their own entry/exit points based on the parent's configuration

// Let me define the recursive structure:
// For each quadrant type (based on entry-exit), define:
// 1. The order to visit child quadrants
// 2. The entry-exit configuration for each child quadrant

const quadrantPositions = {
  TL: { x: 0, y: 0 },
  TR: { x: 1, y: 0 },
  BL: { x: 0, y: 1 },
  BR: { x: 1, y: 1 },
};

// For the base configuration (entry BL, exit BR):
// We visit quadrants in order: BL -> TL -> TR -> BR
// Child quadrant configurations:
// - BL: entry TR (coming from BR quadrant's BL), exit TL (going to TL quadrant's BR)
// - TL: entry BR (coming from BL's TL), exit TR (going to TR's BL)
// - TR: entry BL (coming from TL's TR), exit BR (going to BR's TL)
// - BR: entry TL (coming from TR's BR), exit BL (going to BL quadrant's TR)

// But wait, this needs to be general for any entry/exit config

// Let me define the transition rules more carefully:
// When we have a loop visiting BL -> TL -> TR -> BR:
// The exit of BL (TL corner) connects to the entry of TL (BR corner)
// This means: BL.TL_corner is adjacent to TL.BR_corner

// Actually, let me think about this geometrically:
// The corners are shared between adjacent quadrants:
// - BL.TR_corner = BR.TL_corner = TL.BR_corner = TR.BL_corner (center point)
// - BL.TL_corner = TL.BL_corner
// - BL.BR_corner = BR.BL_corner
// - TL.TR_corner = TR.TL_corner
// - TR.BR_corner = BR.TR_corner

// When we transition from one quadrant to another, we use the shared corner

// Let me define the rules:
// Given the base pattern visits quadrants BL -> TL -> TR -> BR with entry at BL, exit at BR
// The child quadrant entries are determined by how we arrive at each quadrant

// From BR quad (loop end) to BL quad: we exit BR at BL, so BL's entry is TR (shared corner)
// From BL quad to TL quad: BL exits at TL (BL.TL_corner = TL.BL), but we're entering TL...
// Wait, that's not quite right either.

// Let me trace more carefully using the example:
// Order 2 starts at (1,2) which is TR of BL quadrant
// BL quadrant: (1,2) -> (1,3) -> (0,3) -> (0,2)
// Ends at (0,2) = TL corner of BL quadrant

// Next is (1,1) = BR corner of TL quadrant
// So we go from BL's TL corner (0,2) to TL's BR corner (1,1)
// These are NOT the same point! They're adjacent but different quadrants

// Oh! The transition goes through the CENTER of the overall region
// BL.TL (0,2) is adjacent to TL.BL (0,1), not TL.BR (1,1)
// But the path goes (0,2) -> (1,1), crossing through the center

// So the rule is different: the exit point of one quadrant determines
// which child quadrant we enter next, and we enter at the nearest corner

// Actually, looking at the path (0,2) -> (1,1):
// (0,2) is TL of BL quadrant
// (1,1) is BR of TL quadrant
// These are diagonally adjacent through the center

// Let me reconsider. The key is that the quadrant order is BL -> TL -> TR -> BR
// And the entry/exit points must make the path CONTINUOUS

// In order 1, BL(0,1) -> TL(0,0) -> TR(1,0) -> BR(1,1)
// This naturally visits corners in sequence

// In order 2, within each quadrant we do a similar pattern,
// but the corners of adjacent quadrants share the quadrant boundaries

// BL quadrant ends at TL corner (0,2)
// TL quadrant starts at BR corner (1,1)
// These are the two corners closest to each other across quadrants!

// TL quadrant ends at TR corner (1,0)
// TR quadrant starts at BL corner (2,1)
// Again, closest corners

// TR quadrant ends at BR corner (3,1)
// BR quadrant starts at TL corner (2,2)
// Closest corners

// BR quadrant ends at BL corner (2,3)
// BL quadrant starts at TR corner (1,2)
// Closest corners (loop)

// So the rule is: when transitioning between quadrants, we:
// 1. Exit the current quadrant at the corner closest to the next quadrant's center
// 2. Enter the next quadrant at the corner closest to the previous quadrant's center

// Or more simply: the shared "interface" is where the two quadrants meet

// Let me define this more precisely:
// When going from BL to TL:
//   BL's TL corner is at the boundary with TL
//   TL's BL corner is also at that boundary
//   But we don't use BL corner, we use BR corner of TL...

// Actually, let me look at it differently:
// The quadrant visit order is: BL -> TL -> TR -> BR
// This is a counter-clockwise traversal around the quadrants
// And within each quadrant, we also do a counter-clockwise (or clockwise) traversal
// The direction alternates or is determined by something

// Let me just hard-code the rules for now and verify:

function generateWalkV2(order) {
  if (order < 1) return [];

  const gridSize = Math.pow(2, order);

  // Define corner coordinates within a quadrant
  const getCornerCoord = (quadrantX, quadrantY, halfSize, corner) => {
    switch (corner) {
      case 'TL': return { x: quadrantX, y: quadrantY };
      case 'TR': return { x: quadrantX + halfSize - 1, y: quadrantY };
      case 'BL': return { x: quadrantX, y: quadrantY + halfSize - 1 };
      case 'BR': return { x: quadrantX + halfSize - 1, y: quadrantY + halfSize - 1 };
    }
  };

  // Define the order of points within a quadrant based on entry/exit
  const getQuadrantPath = (quadrantX, quadrantY, halfSize, entryCorner, exitCorner) => {
    const loop = getLoopFromEntryExit(entryCorner, exitCorner);
    return loop.map(corner => getCornerCoord(quadrantX, quadrantY, halfSize, corner));
  };

  function recurse(x0, y0, size, entryCorner, exitCorner) {
    if (size === 2) {
      // Base case: size 2 means we have 4 unit cells
      // Return the 4 corners in the correct order
      return getQuadrantPath(x0, y0, 2, entryCorner, exitCorner);
    }

    const half = size / 2;

    // Child quadrant positions
    const quadrants = {
      BL: { x: x0, y: y0 + half },
      TL: { x: x0, y: y0 },
      TR: { x: x0 + half, y: y0 },
      BR: { x: x0 + half, y: y0 + half },
    };

    // The order we visit quadrants is determined by the parent's entry/exit
    // For base config (entry BL, exit BR): visit BL -> TL -> TR -> BR
    // Need to derive for other configs...

    // Actually, the quadrant visit order is always based on the loop from entry to exit
    // Entry BL, Exit BR: quadrant loop is BL -> TL -> TR -> BR
    // Entry TR, Exit TL: quadrant loop is TR -> BR -> BL -> TL

    const quadrantLoop = getLoopFromEntryExit(entryCorner, exitCorner);

    // Determine entry/exit for each child quadrant based on transitions
    // This is the tricky part...

    // For base config (BL -> TL -> TR -> BR):
    // We enter BL through BR.exitCorner (in loop), so BL.entry = TR
    // We exit BL to go to TL, so BL.exit = TL (closest to TL quadrant)
    // We enter TL from BL, so TL.entry = BR (closest to BL quadrant)
    // etc.

    // Entry/exit corners for child quadrants when parent visits BL->TL->TR->BR:
    const childConfigsBase = {
      'BL->TL->TR->BR': {
        BL: { entry: 'TR', exit: 'TL' },
        TL: { entry: 'BR', exit: 'TR' },
        TR: { entry: 'BL', exit: 'BR' },
        BR: { entry: 'TL', exit: 'BL' },
      },
    };

    // I need to derive child configs for all possible parent loops
    // Let me think about this systematically:
    // If we visit quadrants in order [Q1, Q2, Q3, Q4]:
    // - Q1 is entered from Q4 (loop), exited to Q2
    // - Q2 is entered from Q1, exited to Q3
    // - Q3 is entered from Q2, exited to Q4
    // - Q4 is entered from Q3, exited to Q1

    // The entry corner is the one closest to the previous quadrant
    // The exit corner is the one closest to the next quadrant

    const adjacentCorner = (from, to) => {
      // Given we're transitioning from quadrant 'from' to quadrant 'to',
      // return the corner of 'to' that is closest to 'from'
      const map = {
        'BL->TL': 'BR', // TL's BR is closest to BL
        'TL->TR': 'BL', // TR's BL is closest to TL
        'TR->BR': 'TL', // BR's TL is closest to TR
        'BR->BL': 'TR', // BL's TR is closest to BR
        'BL->TR': 'BL', // Diagonal: TR's BL
        'TL->BR': 'TL', // Diagonal: BR's TL
        'TR->TL': 'TR', // TR's TR closest to TL? No, TR is on the right
        'BR->TR': 'BR', // BR's BR closest to TR? No...
      };

      // Actually, let me reconsider. The corners:
      // BL quadrant occupies bottom-left, TL quadrant occupies top-left
      // BL and TL share the left edge
      // From BL's TL corner to TL's BL corner is vertical
      // From BL's TR corner to TL's BR corner is diagonal through center

      // But the path from (0,2) to (1,1) is diagonal, not vertical!
      // So we're going BL.TL (0,2) to TL.BR (1,1)

      // Let me recalculate which corners are "closest" in the sense of
      // the path we want to take

      // The pattern shows:
      // BL exits at TL corner (0,2)
      // TL enters at BR corner (1,1)
      // These are diagonally adjacent

      // TL exits at TR corner (1,0)
      // TR enters at BL corner (2,1)
      // Also diagonally adjacent

      // TR exits at BR corner (3,1)
      // BR enters at TL corner (2,2)
      // Diagonally adjacent

      // BR exits at BL corner (2,3)
      // BL enters at TR corner (1,2)
      // Diagonally adjacent

      // So the rule is: we exit at the corner closest to the CENTER,
      // and enter at the corner closest to the CENTER

      // The corners closest to center for each quadrant:
      // BL: TR corner (closest to center)
      // TL: BR corner
      // TR: BL corner
      // BR: TL corner

      // But the exit corners we observed are:
      // BL exits at TL
      // TL exits at TR
      // TR exits at BR
      // BR exits at BL

      // And entry corners are:
      // BL enters at TR
      // TL enters at BR
      // TR enters at BL
      // BR enters at TL

      // So entry corner = corner closest to center
      // Exit corner = corner in the direction of the loop

      // If the loop is BL -> TL -> TR -> BR (counter-clockwise),
      // then from BL to TL, we go "up", so exit corner is TL (up-left)
      // Wait, BL's TL corner is up-left, which is toward TL quadrant

      // Actually, no. BL's corners are:
      // TL: (0, half) = (0,2) for size=4 - this is at the top-left of BL
      // TR: (half-1, half) = (1,2) - top-right of BL, closest to center
      // BL: (0, size-1) = (0,3) - bottom-left of BL
      // BR: (half-1, size-1) = (1,3) - bottom-right of BL

      // The TL corner of BL (0,2) is adjacent to TL quadrant's BL corner (0,1)
      // But we go to TL's BR (1,1) instead

      // I think the rule is: exit toward the direction of the loop,
      // but enter at the opposite corner (to maintain the shape)

      // Loop BL -> TL: exit at TL (corner in direction of TL), enter TL at BR (opposite)
      // Loop TL -> TR: exit at TR, enter TR at BL
      // Loop TR -> BR: exit at BR, enter BR at TL
      // Loop BR -> BL: exit at BL, enter BL at TR

      // This matches the observed pattern!
      const exitMap = {
        'BL': 'TL', // BL exits at TL to go to TL
        'TL': 'TR', // TL exits at TR to go to TR
        'TR': 'BR', // TR exits at BR to go to BR
        'BR': 'BL', // BR exits at BL to go to BL
      };

      const entryMap = {
        'BL': 'TR', // BL is entered at TR (from BR)
        'TL': 'BR', // TL is entered at BR (from BL)
        'TR': 'BL', // TR is entered at BL (from TL)
        'BR': 'TL', // BR is entered at TL (from TR)
      };

      // Wait, but this is for the base loop BL->TL->TR->BR
      // I need to generalize for other loops

      // Key insight: the entry/exit corners depend on the loop direction
      // The loop visits quadrants in a certain order, and:
      // - We enter each quadrant at the corner closest to the center
      // - We exit each quadrant at the corner in the direction of the next quadrant

      // But actually, looking at the pattern more carefully:
      // Entry is always at the corner closest to center: TR, BR, BL, TL for BL, TL, TR, BR
      // Exit depends on which quadrant comes next

      return { entry: entryMap[to], exit: exitMap[from] };
    };

    // Let me just compute this directly for the base case and verify
    const result = [];

    // Visit order: BL -> TL -> TR -> BR
    // Child configs:
    const childConfigs = {
      BL: { entry: 'TR', exit: 'TL' },
      TL: { entry: 'BR', exit: 'TR' },
      TR: { entry: 'BL', exit: 'BR' },
      BR: { entry: 'TL', exit: 'BL' },
    };

    for (const qName of quadrantLoop) {
      const q = quadrants[qName];
      const config = childConfigs[qName];
      result.push(...recurse(q.x, q.y, half, config.entry, config.exit));
    }

    return result;
  }

  // Start with entry at BL, exit at BR (the base pattern)
  return recurse(0, 0, gridSize, 'BL', 'BR');
}

console.log("\n\nTesting generateWalkV2:");

const order1v2 = generateWalkV2(1);
console.log("Order 1:", order1v2.map(p => `(${p.x},${p.y})`).join(' -> '));
console.log("Expected: (0,1) -> (0,0) -> (1,0) -> (1,1)");

const order2v2 = generateWalkV2(2);
console.log("\nOrder 2:");
console.log("Generated:", order2v2.map(p => `(${p.x},${p.y})`).join(' -> '));
console.log("Expected:  (1,2) -> (1,3) -> (0,3) -> (0,2) -> (1,1) -> (0,1) -> (0,0) -> (1,0) -> (2,1) -> (2,0) -> (3,0) -> (3,1) -> (2,2) -> (3,2) -> (3,3) -> (2,3)");

const expectedOrder2 = [
  {x: 1, y: 2}, {x: 1, y: 3}, {x: 0, y: 3}, {x: 0, y: 2},
  {x: 1, y: 1}, {x: 0, y: 1}, {x: 0, y: 0}, {x: 1, y: 0},
  {x: 2, y: 1}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 3, y: 1},
  {x: 2, y: 2}, {x: 3, y: 2}, {x: 3, y: 3}, {x: 2, y: 3},
];

const matches = order2v2.every((p, i) => p.x === expectedOrder2[i].x && p.y === expectedOrder2[i].y);
console.log("Order 2 matches:", matches);

if (!matches) {
  console.log("\nMismatch details:");
  for (let i = 0; i < Math.max(order2v2.length, expectedOrder2.length); i++) {
    const gen = order2v2[i] ? `(${order2v2[i].x},${order2v2[i].y})` : 'N/A';
    const exp = expectedOrder2[i] ? `(${expectedOrder2[i].x},${expectedOrder2[i].y})` : 'N/A';
    const match = gen === exp ? '✓' : '✗';
    console.log(`${i}: ${gen} vs ${exp} ${match}`);
  }
}
