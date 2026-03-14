# Case Study: Issue #78 — Space-Filling Tree Non-Uniform Color

## Problem Statement

The space-filling tree structure visualization displays non-uniform color intensity.
Intersection points and overlapping regions appear brighter (more opaque) than isolated
edge segments, drawing excessive visual attention to the tree structure when it should
blend subtly with the background.

## Screenshots

The original issue screenshots show the tree structure with visible color intensity
differences at node points where multiple edges meet, compared to edge midpoints
where only a single line is drawn.

## Root Cause

### How Tree Edges Are Generated

The `generateTreeEdges()` function (`src/lib/algorithms/atomic/solution/space-filling-tree.js`)
recursively creates edges: at each depth level, a center node connects to 4 sub-quadrant
centers. For order `n`, this produces `4 + 4×4 + ... + 4^n = (4^(n+1) - 4) / 3` edges.

### How Tree Edges Are Rendered

In `TSPVisualization.jsx` (lines 181–200), each edge is rendered as an individual
`<line>` SVG element with a semi-transparent stroke color:

```jsx
stroke = 'rgba(255, 165, 0, 0.25)';
```

### The Alpha Compositing Problem

When multiple semi-transparent SVG elements overlap, the browser composites them using
the **source-over** blending mode (the default). Each overlapping element increases the
effective opacity:

- 1 line: effective opacity ≈ 0.25
- 2 overlapping lines: effective opacity ≈ 0.4375
- 3 overlapping lines: effective opacity ≈ 0.578

At tree node points (where a parent edge ends and child edges begin), edges from
different depth levels share the same pixel space, creating visible "hot spots" of
increased opacity. This is especially pronounced at the root center, where all depth-0
edges originate.

### Comparison With Uniform Elements

The "Visited Curve" and "Unvisited Curve" are each rendered as a **single `<path>`
element**, so they have uniform opacity throughout — no overlap compositing occurs.

## Solution

### SVG Group-Level Opacity

Instead of applying transparency per-element via `rgba()` alpha, apply `opacity` at the
SVG `<g>` (group) level. This causes the browser to:

1. Render all child elements into an **offscreen buffer** at full opacity
2. Apply the group opacity **once** to the composited result

This is a well-known SVG technique for ensuring uniform transparency across overlapping
elements within a group.

### Implementation

**Before (non-uniform):**

```jsx
<g>
  {edges.map(edge => (
    <line ... stroke="rgba(255, 165, 0, 0.25)" />
  ))}
</g>
```

**After (uniform):**

```jsx
<g opacity="0.25">
  {edges.map(edge => (
    <line ... stroke="rgb(255, 165, 0)" />
  ))}
</g>
```

### Files Changed

- `src/app/ui/components/TSPVisualization.jsx` — Apply opacity at group level for tree edges
- `src/app/ui/components/Legend.jsx` — Update legend color to match the visual appearance

## References

- [SVG Compositing Specification](https://www.w3.org/TR/SVG11/masking.html#ObjectAndGroupOpacityProperties)
- [MDN: SVG `opacity` property](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/opacity)
- Issue: https://github.com/konard/tsp/issues/78
