# Case Study: Issue #53 - Why ZigZag Optimization Works Better Than 2-opt in Some Cases

## Problem Statement

Benchmark results show that ZigZag optimization sometimes produces shorter tours than 2-opt, despite 2-opt being the more widely studied algorithm. This document describes how each optimization works, what makes them different, and why ZigZag can outperform 2-opt in certain scenarios.

## Algorithm Descriptions

### 2-opt (Segment Reversal)

2-opt is a classic local search heuristic for TSP. It improves a tour by removing two edges and reconnecting the tour in a different way.

**How it works:**

1. Pick two non-adjacent edges in the tour: (A→B) and (C→D)
2. Remove both edges and reconnect as (A→C) and (B→D)
3. This reverses the entire segment between B and C
4. Accept the change only if the new tour is shorter
5. Repeat until no improving swap exists (or max iterations reached)

**Visual example:**

```
Before:                After reversing segment [B...C]:

A → B → ... → C → D    A → C → ... → B → D
        segment               reversed
```

The key operation is **segment reversal**: all points between the two removed edges are visited in the opposite order.

**Properties:**

- Each swap considers two edges anywhere in the tour (O(n^2) pairs per pass)
- Can fix large-scale crossing edges
- Each accepted swap reverses a contiguous segment of the tour
- Default: up to 50 iterations of full passes

**Implementation** (from `src/lib/algorithms/atomic/optimization/two-opt.js`):

```javascript
// Test if reversing the segment between i+1 and j reduces distance
const currentDist = distance(a, b) + distance(c, d);
const newDist = distance(a, c) + distance(b, d);

if (newDist < currentDist - 0.001) {
  const segment = tour.slice(i + 1, j + 1).reverse();
  tour.splice(i + 1, j - i, ...segment);
}
```

### ZigZag (Adjacent Pair Swap)

ZigZag is a simpler optimization that only considers swapping two adjacent points in the tour.

**How it works:**

1. Look at four consecutive points in the tour: P1, P2, P3, P4
2. Compare the current cost of edges (P1→P2) + (P3→P4) with the cost after swapping P2 and P3: (P1→P3) + (P2→P4)
3. If swapping reduces distance, swap P2 and P3 in the tour
4. Slide the window forward and repeat for all consecutive quadruples
5. Repeat until no improving swap exists (or max iterations reached)

**Visual example:**

```
Before:              After swapping P2 and P3:

P1 → P2 → P3 → P4    P1 → P3 → P2 → P4
```

Only two adjacent points are swapped; the rest of the tour is unchanged.

**Properties:**

- Each swap considers only adjacent pairs (O(n) comparisons per pass)
- Makes small, local adjustments
- Does not reverse segments; only exchanges the positions of two neighbors
- Default: up to 100 iterations of full passes
- Faster per pass than 2-opt (linear vs quadratic scan)

**Implementation** (from `src/lib/algorithms/atomic/optimization/zigzag-opt.js`):

```javascript
// Test if swapping adjacent points p2 and p3 reduces distance
const currentDist = distance(p1, p2) + distance(p3, p4);
const newDist = distance(p1, p3) + distance(p2, p4);

if (newDist < currentDist - 0.001) {
  [tour[idx2], tour[idx3]] = [tour[idx3], tour[idx2]];
}
```

## Key Differences

| Property                 | 2-opt                                           | ZigZag                                     |
| ------------------------ | ----------------------------------------------- | ------------------------------------------ |
| **Move type**            | Reverse a segment of any length                 | Swap two adjacent points                   |
| **Search scope**         | All pairs of edges (O(n^2) per pass)            | Adjacent quadruples only (O(n) per pass)   |
| **Effect on tour**       | Reorders an entire sub-sequence                 | Changes positions of exactly 2 neighbors   |
| **Speed per pass**       | Slower (quadratic)                              | Faster (linear)                            |
| **Default iterations**   | 50                                              | 100                                        |
| **Kind of improvements** | Removes crossing edges, untangles large detours | Fine-tunes local ordering of nearby points |

## Why ZigZag Sometimes Outperforms 2-opt

The benchmark data shows:

| Configuration      | Max Points (60s) | Avg Tour Distance |
| ------------------ | ---------------: | ----------------: |
| **Sonar + Zigzag** |           10,030 |        135,348.73 |
| **Sonar + 2-opt**  |            8,060 |        153,571.61 |
| **Moore + Zigzag** |            1,040 |          3,862.26 |
| **Moore + 2-opt**  |            1,020 |          3,939.16 |

ZigZag produces shorter tours than 2-opt with both Sonar and Moore initial solutions. There are several reasons for this:

### 1. More iterations in the same time budget

ZigZag scans the tour in O(n) per pass versus O(n^2) for 2-opt. This means ZigZag completes many more full passes in the same wall-clock time. More passes means more cumulative small improvements that add up to a larger total distance reduction.

### 2. Greedy multi-swap vs. greedy single-swap per pass

In the implementations used here, 2-opt breaks out of the inner loop after the **first** improving swap it finds, then restarts from the beginning. This means each iteration makes exactly one segment reversal.

ZigZag, by contrast, slides a window through the entire tour in a single pass, applying **every** improving adjacent swap it encounters. A single ZigZag iteration can make many swaps across the tour before restarting, giving it a broader coverage per iteration.

### 3. Adjacent swaps match the structure of space-filling curve tours

Both Sonar and Moore produce tours that follow a spatial ordering (angular sweep or curve traversal). In such tours, adjacent points in the tour are typically spatially close. The most common imperfections are pairs of nearby points that are in the wrong local order. ZigZag directly targets this class of errors by swapping adjacent pairs, making it well-suited for fixing the kinds of mistakes space-filling curve algorithms produce.

2-opt, on the other hand, is designed to fix crossing edges and large detours (reversing entire segments). These problems are less common in space-filling curve tours, where the main issue is local misordering rather than global tangling.

### 4. Segment reversal can be destructive for ordered tours

When 2-opt reverses a segment, it changes the order of all points in that segment. For tours based on space-filling curves where the ordering is already mostly correct, reversing a segment can disrupt the existing good ordering to fix one pair of edges, potentially creating new suboptimal arrangements elsewhere.

ZigZag's minimal swaps (only 2 points at a time) preserve the overall tour structure while making targeted local corrections.

## When 2-opt Is Better

2-opt is more effective when:

- The initial tour has many crossing edges (e.g., random or poorly constructed tours)
- Large-scale reordering is needed (segment reversal can fix entire tangled regions in one move)
- The problem has fewer points (the O(n^2) cost is less significant)

## Combined Optimization

The combined optimization alternates between ZigZag and 2-opt, leveraging the strengths of both:

1. ZigZag first: fix local misordering with fast adjacent swaps
2. 2-opt second: fix any remaining crossing edges or larger structural issues
3. Repeat until neither method finds improvements

This produces the best tour quality at the cost of longer computation time (O(n^3) worst case).

## Conclusion

ZigZag outperforms 2-opt on space-filling curve tours because its adjacent-swap strategy is a natural fit for fixing the local misordering that these algorithms produce. Its linear-time passes allow more iterations within the same time budget, and its minimal changes preserve the existing spatial ordering. The two algorithms are complementary: ZigZag excels at fine-tuning locally ordered tours, while 2-opt excels at untangling globally disordered ones.
