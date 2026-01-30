# Case Study: Optimization Fails on Already-Optimal Tours

## Issue Reference

- **Issue**: [#15 - Sometimes optimization fails](https://github.com/konard/tsp/issues/15)
- **Repository**: [konard/tsp](https://github.com/konard/tsp) - TSP Visual Solver

## Timeline of Events

### 2026-01-30 - Bug Reported

User reported that clicking "Optimize" sometimes causes both distances to show 0 and the path visualization to disappear. Specific reproduction: set 3 points, run the algorithm, then click Optimize.

### 2026-01-30 - Root Cause Identified

The issue occurs when the tour is already optimal (no improvements possible). The optimization algorithms (`twoOptSteps`, `zigzagOptSteps`) return empty arrays, which the UI interprets as having no data to display.

### 2026-01-30 - Fix Implemented

Added fallback handling in `App.jsx` to create a single "no improvement" step preserving the existing tour when optimization returns empty results. Added comprehensive tests (unit, component, e2e).

## Root Cause Analysis

### The Problem

When the optimization button is clicked, `startOptimization()` in `App.jsx` runs the optimization algorithms on the current tours:

```javascript
const newSonarOptSteps = zigzagOptSteps(points, sonarTour);
const newMooreOptSteps = twoOptSteps(points, mooreTour);
```

Both optimization algorithms have a guard clause that returns an empty array when the tour has fewer than 4 points:

```javascript
// two-opt.js line 29-31
if (initialTour.length < 4) {
  return [];
}
```

Additionally, even for tours with 4+ points, if the tour is already optimal (e.g., a square traversed in order), the algorithms find no improvements and return an empty array.

### The Failure Chain

1. **Optimization returns `[]`** - No improvements found (tour already optimal or < 4 points)

2. **UI switches to optimization mode with empty data** - `startOptimization()` sets:
   - `sonarOptSteps = []` (empty)
   - `mooreOptSteps = []` (empty)
   - `showOptimization = true`
   - `sonarCurrentStep = 0`
   - `mooreCurrentStep = 0`

3. **Animation loop terminates immediately** - With empty arrays, `steps.length - 1 = -1`, so `currentStep (0) >= -1` evaluates to `true`, meaning both algorithms are "done"

4. **Step accessor returns undefined** - `getSonarStep()` accesses `sonarOptSteps[0]` on an empty array, returning `undefined`

5. **Distance calculation returns 0** - `calculateSonarDistance()` checks `step?.tour` which is `undefined`, so it returns 0

6. **Visualization renders nothing** - `TSPVisualization` receives empty `steps` array with `currentStep=0`, the `step` variable is `null` (out of bounds), so no tour path is rendered

### Visual Impact

- Both distance displays show "Distance: 0.00"
- Both SVG visualizations lose their tour path lines
- Points remain visible but the connecting path disappears

## Conditions That Trigger the Bug

| Condition                                | Why it triggers                                                      |
| ---------------------------------------- | -------------------------------------------------------------------- |
| 3 points (triangle)                      | `tour.length < 4` guard returns `[]` immediately                     |
| 4 points in optimal order (e.g., square) | No 2-opt/zigzag swap improves the distance                           |
| Any already-optimal tour                 | Both algorithms return `[]` when no swap reduces distance by > 0.001 |

## Solution

### Approach: Fallback Step in App.jsx

When optimization returns empty steps, create a single step that preserves the existing tour:

```javascript
if (newSonarOptSteps.length === 0) {
  newSonarOptSteps = [
    {
      type: 'optimize',
      tour: [...sonarTour],
      improvement: 0,
      description: 'Tour is already optimal — no improvements found',
    },
  ];
}
```

This ensures:

- The visualization continues to display the tour path
- The distance remains correct (non-zero)
- The user sees a meaningful message ("Tour is already optimal")
- The optimization mode UI (green path color) still activates

### Why This Approach

| Alternative                                                    | Pros                                                        | Cons                                                                      |
| -------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Prevent clicking Optimize** (disable button for small tours) | Simple                                                      | Doesn't handle 4+ point optimal tours; user gets no feedback              |
| **Show alert/message** without switching to optimization mode  | Clear feedback                                              | Breaks the optimization UI flow; extra UI element needed                  |
| **Fallback step** (chosen)                                     | Preserves UI flow, works for all cases, minimal code change | Slight semantic stretch (optimization "step" with no actual optimization) |

### Related Concepts

This is a classic **empty result set handling** problem, common in algorithms and data pipelines:

- **2-opt local search**: A well-known TSP improvement heuristic. When the tour is a local optimum, no 2-opt swap reduces distance, producing zero iterations. See: Croes, G.A. (1958). "A Method for Solving Traveling-Salesman Problems". Operations Research. 6 (6): 791-812.

- **Defensive UI programming**: UI components should always handle edge cases where data might be empty, null, or undefined. The TSPVisualization component already handled `steps=[]` gracefully (by not rendering a path), but the parent component's state management created an inconsistent state.

## Tests Added

### Unit Tests (`src/tests/index.test.js`)

- `twoOptSteps` returns empty array for 3-point triangle tour
- `twoOptSteps` returns empty array for optimal 4-point square tour
- `twoOpt` preserves tour distance when no improvement found
- `zigzagOptSteps` returns empty array for 3-point triangle tour
- `zigzagOptSteps` returns empty array for optimal 4-point square tour
- `zigzagOpt` preserves tour distance when no improvement found
- Full pipeline: sonar solution then empty optimization on 3 points
- Full pipeline: moore solution then empty optimization on 3 points

### Component Tests (`src/tests/components/TSPVisualization.test.jsx`)

- Renders tour path for zero-improvement optimization step
- Renders all point circles for zero-improvement optimization step
- Renders closed tour path (Z command) for full tour in optimization mode

### E2E Test (`src/tests/e2e/app.test.js`)

- Full workflow: set 3 points, run algorithm, optimize, verify non-zero distances and visible paths

## Files Changed

| File                                             | Change                                                               |
| ------------------------------------------------ | -------------------------------------------------------------------- |
| `src/app/ui/App.jsx`                             | Added fallback step creation when optimization returns empty results |
| `src/tests/index.test.js`                        | Added 8 unit tests for already-optimal tour edge cases               |
| `src/tests/components/TSPVisualization.test.jsx` | Added 3 component tests for optimization rendering                   |
| `src/tests/e2e/app.test.js`                      | Added 1 e2e test for optimization with small point sets              |
| `experiments/issue-15-already-optimal.js`        | Experiment script reproducing and verifying the fix                  |
