# Waterloo TSP methods

Issue [#62](https://github.com/konard/tsp/issues/62) links the University of
Waterloo's [TSP site](https://www.math.uwaterloo.ca/tsp/index.html) and
[Amazon last-mile study](https://www.math.uwaterloo.ca/tsp/amz/index.html).
The site's [DIY app](https://www.math.uwaterloo.ca/tsp/app/diy.html) names the
tour and proof methods. The Amazon site's
[optimization article](https://www.math.uwaterloo.ca/tsp/amz/code.html) explains
directed travel times and constraints from delivery sort zones. The
[runnable example](../../../examples/waterloo-routing.mjs) exercises both
problem types.

## DIY app methods

| Waterloo method                           | Library API                                                                                                      |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Nearest neighbor, chosen start            | `sawSolution(points, { start })` and `sawAlgorithmSteps`                                                         |
| 2-opt                                     | Existing atomic and progressive `twoOpt` implementations                                                         |
| Simplified Lin-Kernighan                  | Existing atomic and progressive `linKernighan` implementations                                                   |
| Optimal control zones                     | `optimalControlZoneLowerBound(points)` solves the radius LP; `controlZoneLowerBound` remains a fast greedy bound |
| Zones and moats                           | `zoneAndMoatLowerBound(points)` returns feasible radii, moat widths, and their bound                             |
| Initial degree LP                         | `solveTspRelaxation(points, { cuts: 'none' })`                                                                   |
| Connected components                      | `solveTspRelaxation(points, { cuts: 'components' })`                                                             |
| 2-connected cuts                          | `solveTspRelaxation(points, { cuts: 'two-connected' })`                                                          |
| Full subtour LP                           | `solveTspRelaxation(points, { cuts: 'full' })` separates violated cuts until none remain                         |
| Manual subtour and comb cuts              | `subtourCut`, `combCut`, and `initialCuts` in `solveTspRelaxation`                                               |
| Minimum (s,t) and global cuts             | `minimumCut` and `globalMinimumCut`                                                                              |
| Simple blossoms                           | `findSimpleBlossoms` and `{ blossoms: true }` in the LP solver                                                   |
| Best-bound and depth-first branch-and-cut | `branchAndCut(points, { strategy })`; returns a tour, bound, node count, and completion flag                     |

The LP uses Euclidean edge lengths. Its constraints are the degree equations,
edge bounds, separated subtour inequalities, and optional comb inequalities.
The geometric packing checks every edge inequality after simplex and projects
the radii and moat widths back into the feasible region before reporting a
bound. `verifyOptimality(distance, points, { lp: true })` compares the 1-tree,
greedy zone, optimized zone, and zone-and-moat bounds. The default call keeps
the fast 1-tree and greedy zone comparison.

`branchAndCut` explores at most 1,000 LP nodes by default, matching the DIY
app's search-tree limit. If that or the cut-round limit is reached, it returns
`isOptimal: false` and the best remaining lower bound. LP arithmetic uses
floating-point tolerances, so the numeric certificate should be checked with
the returned tour and bound before use where exact arithmetic is required.

## Amazon routing methods

| Method                        | Library API                                                                                                                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Asymmetric travel-time matrix | `directedTourLength`, `nearestNeighborDirected`, `solveDirectedTsp`                                                                                                               |
| Contiguous sort zones         | `zones` option to `solveDirectedTsp`                                                                                                                                              |
| Nested super clusters         | `clusterLevels` option; `inferZoneHierarchy` learns three nested levels from historical zone IDs                                                                                  |
| Zone precedence               | `precedence` option; `learnZonePrecedence` uses the historical route with the most matching zones                                                                                 |
| Super-cluster precedence      | `clusterPrecedence` option; `learnClusterPrecedence` derives precedences for each inferred level                                                                                  |
| Constrained local search      | `directedLocalSearch` tries directed segment reversals, 3-opt relocations, and 4-opt pair swaps; `iteratedDirectedLocalSearch` repeats the search after double-swap perturbations |
| Small exact clustered ATSP    | `solveDirectedTsp(costs, { exact: true, ...constraints })` exhaustively searches at most 12 stops by default                                                                      |

The local search handles matrices large enough to model an Amazon route, but
does not claim to be a port of the original C implementation of LKH-AMZ or to
match its competition runtime and score. Its default result has
`isOptimal: false`; the bounded exact mode gives an optimality result for
small inputs. The three learned cluster levels follow the field-selection
method in the [JPT-AMZ source](https://github.com/heldstephan/jpt-amz), which
groups four-part zone IDs by historical continuity. Callers can also supply
their own cluster labels and precedence rules.
