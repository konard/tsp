# Case Study: Issue #31 - "Tour is already optimal" is wrong

## Problem Statement

When the Sonar Visit Algorithm produced a tour with distance 17.66, the optimization phase reported "Tour is already optimal - no improvements found." This message is misleading because:

1. The message implies the tour is the **globally optimal** solution
2. In reality, it only means the **specific optimization method** (zigzag or 2-opt) could not find further improvements
3. The actual optimal tour distance could be significantly shorter

## Timeline

1. **Issue reported**: User observed Sonar algorithm showing 17.66 distance with "already optimal" message
2. **Root cause identified**: The "already optimal" message was introduced in PR #30 (fix for issue #15) as a fallback when optimization returns empty results
3. **Investigation**: The optimization algorithms (2-opt and zigzag) are local search heuristics - they can get stuck in local optima and fail to find the global optimum

## Root Cause Analysis

### Why the message was wrong

The optimization algorithms (2-opt segment reversal, zigzag adjacent swap) are **local search heuristics**. They improve a tour by making small local changes. When no single local change improves the tour, they stop. However, this does **not** mean the tour is globally optimal.

For example, with the Sonar algorithm:

- Sonar sorts points by polar angle from the centroid
- This produces a star-shaped tour that visits points in angular order
- For points not on a convex hull, this can produce crossing paths
- 2-opt can fix some crossings, but zigzag (adjacent swaps only) may miss improvements
- Neither method guarantees finding the global optimum

### The fix

The issue description identified several requirements:

1. **Add verification**: Compute the true optimal tour for comparison
2. **Fix the message**: Don't claim "already optimal" unless verified
3. **Show percentage**: Display how far each tour is from optimal
4. **Separate optimization buttons**: Allow each optimization method to be applied independently
5. **Rename folders**: `solutions` -> `solution`, `optimizations` -> `optimization`

## Solution

### 1. Brute-Force Verification Algorithm

Added `src/lib/algorithms/verification/brute-force.js` which computes the exact optimal TSP tour by evaluating all permutations. Key properties:

- **Exact**: Guarantees finding the true shortest tour
- **Bounded**: Only runs for point sets <= 12 points (factorial complexity)
- **With pruning**: Uses early termination when a partial tour already exceeds the current best

### 2. Fixed Optimality Messages

The optimization step descriptions now show one of three messages:

- `"[Method]: Tour is already optimal (verified)"` - when the tour distance matches the brute-force optimal
- `"[Method]: No improvements found (X.X% above optimal)"` - when optimization can't improve but the tour isn't globally optimal
- `"[Method]: No improvements found"` - when the point set is too large for verification

### 3. Separate Optimization Buttons

Replaced the single "Optimize" button with two buttons:

- **2-opt**: Applies 2-opt segment reversal to both algorithm tours
- **Zigzag**: Applies zigzag adjacent swap to both algorithm tours

This allows users to try different optimization strategies and compare results.

### 4. Optimality Ratio Display

The visualization header now shows distance information with comparison to optimal:

```
Distance: 17.66 (125.3% of optimal 14.10)
```

This is only shown when brute-force verification is feasible (<=12 points).

### 5. Folder Renaming

Renamed for consistency with singular naming convention:

- `solutions/` -> `solution/`
- `optimizations/` -> `optimization/`

## Lessons Learned

1. **Local optima are not global optima**: Heuristic optimization methods can get stuck. Always clarify what "optimal" means in user-facing messages.

2. **Verification matters**: Having a ground-truth computation (even if expensive) allows validating heuristic results and prevents false claims.

3. **Separate concerns**: Different optimization methods should be independently applicable. Coupling zigzag to Sonar and 2-opt to Moore was an arbitrary design choice.

## References

- [2-opt algorithm (Wikipedia)](https://en.wikipedia.org/wiki/2-opt)
- [Travelling salesman problem (Wikipedia)](https://en.wikipedia.org/wiki/Travelling_salesman_problem)
- [Local search (optimization)](<https://en.wikipedia.org/wiki/Local_search_(optimization)>)

## Test Coverage

Added 22 new tests covering:

- Brute-force optimal tour computation (10 tests)
- Step-based verification interface (3 tests)
- Optimality ratio calculation (4 tests)
- Integration with algorithm pipelines (4 tests)
- Updated component tests for new UI (1 test)

Total test count increased from 194 to 216.
