# Case Study: Issue #26 - Fix Moore Curve Normalization Bug

## Summary

This case study documents the investigation and fix of a critical bug in the Moore curve algorithm that caused a cross-shaped gap in the grid visualization. The issue was introduced by PR #24, reverted in PR #25, reintroduced in PR #27, and reverted again in PR #28. This PR (#29) provides the correct fix with comprehensive point-by-point verification tests.

## The Problem

After PR #24 attempted to fix Moore curve grid coverage, the visualization became completely broken - the Moore curve no longer filled the grid correctly, leaving visible gaps and producing incorrect paths.

### Visual Evidence

**Before fix (broken state after PR #24):** The curve had a cross-shaped gap through the center of the grid, missing the middle row and column entirely.

**After fix:** The Moore curve correctly fills the entire grid with no gaps, matching the reference Wikipedia Moore curve pattern.

Screenshots of the fixed application:

- `screenshots/app-4x4-completed.png` - 4×4 grid showing clear Moore curve pattern
- `screenshots/app-8x8-completed.png` - 8×8 grid showing complete coverage
- `screenshots/app-16x16-completed.png` - 16×16 grid showing full space-filling behavior

## Root Cause Analysis

### The Normalization Bug

The root cause was in the `mooreCurveToPoints()` function in `src/lib/algorithms/progressive/solutions/moore.js`.

The function generates raw curve points using an L-system (turtle graphics), then normalizes them to fit the target grid. The normalization formula was:

```javascript
// BUGGY: scales to [0, mooreGridSize] instead of [0, mooreGridSize-1]
x: Math.round(((p.x - minX) / curveWidth) * mooreGridSize),
y: Math.round(((p.y - minY) / curveHeight) * mooreGridSize),
```

This scaled coordinates to the range `[0, mooreGridSize]` (inclusive), which has `mooreGridSize + 1` possible positions per axis. But a Moore curve of order n only has `2^n` vertices per axis (coordinates `[0, 2^n - 1]`).

### Why This Caused the Cross-Shaped Gap

For a 16×16 grid (`mooreGridSize = 16`), the buggy normalization produced coordinates in `[0, 16]` (17 positions), but the curve only has 256 vertices to fill. When `Math.round()` mapped 256 raw points to 17×17 = 289 possible positions, some grid cells were skipped - specifically the middle row and column, creating a cross-shaped gap.

Example for 8×8 grid:

- **Buggy output**: coordinates ranged `[0, 8]`, missing cells at `x=4` and `y=4`
- **Correct output**: coordinates range `[0, 7]`, all 64 cells covered

### The Correct Fix

```javascript
// FIXED: scales to [0, mooreGridSize-1] — exactly matching grid dimensions
x: Math.round(((p.x - minX) / curveWidth) * (mooreGridSize - 1)),
y: Math.round(((p.y - minY) / curveHeight) * (mooreGridSize - 1)),
```

### Why Previous Fix Attempts Failed

PR #24 and #27 both attempted to fix a different issue (the order calculation) without addressing the normalization bug:

1. **Order calculation**: Changed `order = log2(mooreGridSize) - 1` to `order = log2(mooreGridSize)`. This produced too many curve vertices for the grid, making the normalization problem worse.
2. **Grid size doubling**: Changed `calculateMooreGridSize` to not double, but didn't fix the range mismatch.

The previous fixes were treating symptoms (wrong vertex count) without fixing the root cause (wrong coordinate range).

## Mathematical Background

### Moore Curve L-System Definition

| Component  | Value                |
| ---------- | -------------------- |
| Alphabet   | `L`, `R` (variables) |
| Constants  | `F`, `+`, `-`        |
| Axiom      | `LFL+F+LFL`          |
| Rule for L | `L → -RF+LFL+FR-`    |
| Rule for R | `R → +LF-RFR-FL+`    |
| Angle      | 90°                  |

Where: `F` = move forward, `+` = turn right 90°, `-` = turn left 90°.

### Order-to-Grid-Size Relationship

The axiom `LFL+F+LFL` contains 3 `F` moves, giving 4 vertices (a 2×2 grid). Each L-system iteration quadruples the vertex count:

| Iterations | Grid Size | Vertices |
| ---------- | --------- | -------- |
| 0          | 2×2       | 4        |
| 1          | 4×4       | 16       |
| 2          | 8×8       | 64       |
| 3          | 16×16     | 256      |
| 4          | 32×32     | 1024     |
| 5          | 64×64     | 4096     |

For `generateMooreCurve(n)`: iterations = n, grid size = 2^(n+1), vertices = 4^(n+1).

### Key Properties Verified by Tests

1. **Complete coverage**: Every grid cell `(x, y)` where `0 ≤ x, y < gridSize` is visited exactly once
2. **Adjacency**: All consecutive points differ by exactly 1 in either x or y (not both)
3. **Closed loop**: The first and last points are adjacent, forming a Hamiltonian cycle
4. **No cross-shaped gap**: Center rows and columns are fully covered

## Changes Made

### Algorithm Fixes

1. **`mooreCurveToPoints()`** (`src/lib/algorithms/progressive/solutions/moore.js`): Fixed normalization from `* mooreGridSize` to `* (mooreGridSize - 1)`
2. **Order calculation**: Changed `Math.max(1, ...)` to `Math.max(0, ...)` to support 2×2 grids
3. **`calculateMooreGridSize()`** (`src/lib/algorithms/utils.js`): Replaced complex formula with simple lookup returning smallest valid size ≥ input
4. **`VALID_GRID_SIZES`**: New constant `[2, 4, 8, 16, 32, 64]`
5. **`generateRandomPoints()`**: Fixed range from `[0, mooreGridSize]` to `[0, mooreGridSize-1]`

### UI Fixes

6. **Grid size selector** (`src/app/ui/components/Controls.jsx`): Replaced number input (5-50) with dropdown showing valid Moore curve sizes
7. **Grid visualization** (`src/app/ui/components/TSPVisualization.jsx`): Updated grid line count to match `[0, mooreGridSize-1]` range
8. **Default grid size** (`src/app/ui/App.jsx`): Changed from 10 to 16

### Tests Added

9. **Point-by-point verification** for 2×2, 4×4, 8×8, 16×16, 32×32 grids:
   - Exact vertex count
   - 100% grid cell coverage
   - All consecutive points adjacent (distance 1)
   - Closed loop verification
   - No cross-shaped gap (center rows/columns covered)
10. **Edge verification** for 2×2 and 4×4:
    - Exact edge sequences
    - No self-intersections
11. **Exact path verification** for 2×2 and 4×4:
    - Point-by-point comparison against reference paths

## Timeline of Events

| Date       | Event                                              | Result                    |
| ---------- | -------------------------------------------------- | ------------------------- |
| 2026-01-?? | PR #24 merged: Changed order calculation           | Broke Moore curve display |
| 2026-01-?? | PR #25 merged: Reverted PR #24                     | Restored working state    |
| 2026-01-?? | PR #27 merged: Second attempt at same fix          | Broke curve again         |
| 2026-01-?? | PR #28 merged: Reverted PR #27                     | Restored working state    |
| 2026-01-30 | Issue #26 opened: Request to properly redo the fix | Investigation started     |
| 2026-01-30 | Analysis found normalization bug as root cause     | Root cause identified     |
| 2026-01-30 | PR #29: Correct fix with comprehensive tests       | Fix implemented           |

## Verification

### Test Results

- 106 tests pass (48 existing + 58 new Moore curve verification tests)
- All lint, format, and duplication checks pass
- Build succeeds
- Visual verification via Playwright confirms correct Moore curve rendering

### Experiment Scripts

The `experiments/` directory contains analysis scripts used during investigation:

- `moore-curve-analysis.js` - Analyzes vertex counts and order-to-grid relationships
- `moore-curve-points-check.js` - Checks for gaps and non-adjacent points (revealed the bug)
- `moore-curve-normalization-fix.js` - Verifies the fix produces correct coordinates
- `verify-fix.js` - End-to-end verification with existing `calculateMooreGridSize`

## References

- [Moore curve - Wikipedia](https://en.wikipedia.org/wiki/Moore_curve)
- [L-system - Wikipedia](https://en.wikipedia.org/wiki/L-system)
- [Space-filling curve - Wikipedia](https://en.wikipedia.org/wiki/Space-filling_curve)
- [GitHub Issue #26](https://github.com/konard/tsp/issues/26)
- [PR #24 (first attempt, reverted)](https://github.com/konard/tsp/pull/24)
- [PR #27 (second attempt, reverted)](https://github.com/konard/tsp/pull/27)
- [PR #29 (this fix)](https://github.com/konard/tsp/pull/29)

## Lessons Learned

1. **Test the actual invariants**: Previous PRs added tests for "coverage percentage" but didn't test the fundamental property that consecutive curve points must be adjacent. Point-by-point and edge-by-edge testing caught the normalization bug immediately.

2. **Understand the math before coding**: The Moore curve has precise mathematical properties (closed loop, Hamiltonian path, all edges length 1). Any implementation must satisfy all of these, not just "look approximately right."

3. **Normalization is subtle**: Scaling to `[0, N]` vs `[0, N-1]` is an off-by-one error that's easy to miss visually for large grids but becomes obvious with mathematical verification.

4. **Fix the root cause, not symptoms**: Previous PRs changed the order calculation and grid size formula to compensate for the normalization bug. The correct approach was to fix the normalization itself.
