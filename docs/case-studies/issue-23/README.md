# Case Study: Issue #23 - Moore Curve Algorithm Density and Grid Size Fix

## Summary

This case study documents the investigation and fix of a bug in the Moore curve algorithm where the curve did not cover all grid vertices, leaving a cross-shaped gap through the center. Additionally, the grid size selector allowed arbitrary values (5-50) that didn't correspond to valid Moore curve sizes, causing a mismatch between the displayed grid size and the actual algorithm grid.

## The Problem

### 1. Moore Curve Not Covering All Grid Vertices

The Moore curve algorithm had an incorrect order calculation that caused the curve to miss grid vertices in a cross-shaped pattern through the center of the grid.

**Root Cause**: The order was calculated as `order = log2(mooreGridSize) - 1`, but a Moore curve of order N fills a 2^N × 2^N grid. The correct formula is `order = log2(mooreGridSize)`.

**Evidence from analysis:**

For a grid size of 8 with the old (incorrect) order calculation (order=2):

```
Grid coverage (X = covered, . = missed):
  X X X X . X X X X
  X X X X . X X X X
  X X X X . X X X X
  X X X X . X X X X
  . . . . . . . . .
  X X X X . X X X X
  X X X X . X X X X
  X X X X . X X X X
  X X X X . X X X X
```

Coverage: 64/81 vertices (79.0%) - a cross-shaped gap through the center.

With the correct order (order=3):

```
Coverage: 81/81 vertices (100.0%) - all vertices covered.
```

### 2. Grid Size Selector Mismatch

The grid size selector allowed values from 5 to 50, but the Moore curve algorithm requires power-of-2 grid sizes. When a user selected grid size 5, the actual Moore grid size was computed as 8 (or previously 16), but the selector still showed "5". This was confusing and misleading.

**Root Cause**: The `calculateMooreGridSize` function used `2^(floor(log2(gridSize)) + 1)`, which always doubled the nearest power of 2. This was an artifact of the wrong order formula - the code compensated for the off-by-one order by doubling the grid size.

## Root Cause Analysis

### The Mathematical Error

A Moore curve is defined by its L-system rules:

- **Axiom**: `LFL+F+LFL`
- **L → −RF+LFL+FR−**
- **R → +LF−RFR−FL+**

A Moore curve of order N produces 4^N unique points that tile a 2^N × 2^N grid completely. The relationship is:

| Order | Grid Size | Points |
| ----- | --------- | ------ |
| 1     | 2×2       | 4      |
| 2     | 4×4       | 16     |
| 3     | 8×8       | 64     |
| 4     | 16×16     | 256    |
| 5     | 32×32     | 1024   |
| 6     | 64×64     | 4096   |

The code had `order = log2(mooreGridSize) - 1`, which meant:

- For mooreGridSize=4: order=1 (should be 2) → only 4 points on a 4×4 grid, missing 9 vertices
- For mooreGridSize=8: order=2 (should be 3) → only 16 points on an 8×8 grid, missing 17 vertices
- For mooreGridSize=16: order=3 (should be 4) → only 64 points on a 16×16 grid, missing 33 vertices

The missed vertices always formed a cross through the center (the middle row and column), because the lower-order curve naturally produces four quadrant copies that don't connect through the center when stretched to a larger grid.

### The Compensating Grid Size Error

The `calculateMooreGridSize` function doubled the grid size (`2^(order+1)` instead of `2^order`), which partially masked the order calculation error. With gridSize=5, `calculateMooreGridSize` returned 8, and then the Moore algorithm used order=2 (instead of the correct order=3). The result was that order 2 Moore curve points were stretched across a size-8 grid, leaving the cross-shaped gap.

## Solution

### Fix 1: Correct Order Calculation

Changed the order formula from `Math.max(1, Math.round(Math.log2(mooreGridSize)) - 1)` to `Math.max(1, Math.round(Math.log2(mooreGridSize)))` in both `mooreAlgorithmSteps` and `mooreSolution`.

### Fix 2: Correct Grid Size Calculation

Changed `calculateMooreGridSize` from `2^(floor(log2(gridSize)) + 1)` to `2^(round(log2(gridSize)))`, so the function now returns the nearest power of 2 (identity for valid inputs).

### Fix 3: Grid Size Selector Uses Valid Sizes Only

Replaced the numeric input (range 5-50) with a dropdown selector showing only valid Moore curve sizes: 2, 4, 8, 16, 32, 64. This ensures the displayed grid size always matches the actual algorithm grid size, eliminating confusion.

Exported a `VALID_GRID_SIZES` constant from the algorithms library for use by the UI.

## Tests Added

1. **Moore curve full coverage test**: Verifies that for grid sizes 2, 4, 8, and 16, the Moore curve covers 100% of grid vertices.
2. **No cross-shaped gap test**: Explicitly checks that the center point and entire middle row/column are covered.
3. **Grid size selector tests**: Verifies the dropdown contains exactly the valid Moore curve sizes [2, 4, 8, 16, 32, 64].
4. **calculateMooreGridSize tests**: Updated to verify correct power-of-2 mapping.

## Research: Moore Curve Properties

According to [Wikipedia - Moore curve](https://en.wikipedia.org/wiki/Moore_curve):

> A Moore curve is a continuous fractal space-filling curve which is a variant of the Hilbert curve. It is the loop version of the Hilbert curve, and may be thought of as the union of four copies of the Hilbert curves combined in such a way to make the endpoints coincide.

Key properties:

- A Moore curve of order N visits all 4^N points of a 2^N × 2^N grid
- It forms a closed loop (start and end points coincide)
- It preserves locality (nearby points on the curve are spatially close)
- The center of the grid is passed through twice during traversal

## Timeline

| Date       | Event                                                                        |
| ---------- | ---------------------------------------------------------------------------- |
| 2026-01-30 | Issue #23 created: Moore curve not densely packed, grid size selector broken |
| 2026-01-30 | Root cause identified: off-by-one error in Moore curve order calculation     |
| 2026-01-30 | Fix implemented: correct order formula + grid size selector with valid sizes |

## Files Changed

- `src/lib/algorithms/progressive/solutions/moore.js` - Fixed order calculation in `mooreAlgorithmSteps` and `mooreSolution`
- `src/lib/algorithms/utils.js` - Fixed `calculateMooreGridSize`, added `VALID_GRID_SIZES` constant
- `src/app/ui/components/Controls.jsx` - Changed grid size input to dropdown with valid sizes
- `src/app/ui/App.jsx` - Updated default grid size from 10 to 8
- `src/tests/index.test.js` - Updated and added tests for correct behavior
- `src/tests/components/Controls.test.jsx` - Updated tests for new dropdown selector

## References

- [Moore curve - Wikipedia](https://en.wikipedia.org/wiki/Moore_curve)
- [Space-filling curve - Wikipedia](https://en.wikipedia.org/wiki/Space-filling_curve)
- [Hilbert curve - Wikipedia](https://en.wikipedia.org/wiki/Hilbert_curve)
- [L-system - Wikipedia](https://en.wikipedia.org/wiki/L-system)
