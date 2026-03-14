# Case Study: Issue #74 — Tree Structure Pattern Not Aligned with Grid Points

## Timeline

1. **PR #71** (merged): Implemented space-filling tree algorithm for TSP.
2. **Issue #74** (reported): Tree structure pattern is not aligned with actual grid points.
   - In 2x2 grid, tree touches **zero** grid intersection points.
   - In 4x4 grid, only 4 points near center align.
   - Same misalignment pattern at 8x8 and higher.

## Root Cause Analysis

### The Bug

In `src/lib/algorithms/atomic/solution/space-filling-tree.js`, the `generateTreeEdges()` function computes tree node positions using:

```javascript
const halfGrid = (treeGridSize - 1) / 2;
recurse(halfGrid, halfGrid, halfGrid, halfGrid, 0);
```

This uses `(treeGridSize - 1) / 2` as **both** the center coordinate **and** the half-extent for subdivision. The grid has integer coordinates in `[0, treeGridSize - 1]`, so the center of this range is indeed `(treeGridSize - 1) / 2`. However, when this same value is used as the half-extent for recursive subdivision, the subdivision **never reaches integer coordinates** at any depth.

### Mathematical Proof

For `treeGridSize = 2` (order 1):

- `halfGrid = (2-1)/2 = 0.5`
- Root at `(0.5, 0.5)`, quadrant centers at `(0.25, 0.25)`, `(0.75, 0.25)`, `(0.25, 0.75)`, `(0.75, 0.75)`
- **Zero** of 5 unique points are at integer grid coordinates.

For `treeGridSize = 4` (order 2):

- `halfGrid = (4-1)/2 = 1.5`
- Root at `(1.5, 1.5)`, level-0 quadrant centers at `(0.75, 0.75)`, `(2.25, 0.75)`, etc.
- **Zero** of 21 unique points are at integer coordinates.

The issue: `(treeGridSize - 1) / 2` is only an integer when `treeGridSize` is odd, but valid grid sizes are always powers of 2 (even numbers), making the center always a half-integer. Dividing a half-integer extent by 2 repeatedly produces quarter-integers, eighth-integers, etc. — never integers.

### The Fix

Use `treeGridSize / 2` as the half-extent instead of `(treeGridSize - 1) / 2`:

```javascript
const center = (treeGridSize - 1) / 2; // correct center of [0, gridSize-1]
const halfGrid = treeGridSize / 2; // half-extent covers full grid width
recurse(center, center, halfGrid, halfGrid, 0);
```

With this fix:

- **Leaf-level nodes** (depth = order) land exactly on integer grid coordinates.
- **Intermediate nodes** remain at half-integer positions, which is geometrically correct — they represent centers of spatial cells, not grid intersections.
- For `treeGridSize = 2`: all 4 leaf points are on grid (0,0), (1,0), (0,1), (1,1).
- For `treeGridSize = 4`: all 16 leaf points are on grid (every integer coordinate pair).
- For `treeGridSize = 8`: all 64 leaf points are on grid.

## Additional Issues Addressed

### 1. Legend not clickable (show/hide tree structure)

The legend items were display-only `<div>` elements with no interactivity. Added `onClick` handlers and cursor styling to allow toggling visibility of the tree structure overlay.

### 2. Tree structure too opaque

The tree edges used `rgba(255, 165, 0, 0.5)` (50% opacity), making them visually dominant. Reduced to `rgba(255, 165, 0, 0.25)` (25% opacity) for better blending with the background.

## Verification

- Experiment script: `experiments/tree-alignment-test.js`
- Verified that all leaf-level tree nodes align with integer grid coordinates for grid sizes 2, 4, 8, 16, 32, 64, 128.
