# Waterloo TSP methods in this repository

Issue [#62](https://github.com/konard/tsp/issues/62) points to the University
of Waterloo's [TSP site](https://www.math.uwaterloo.ca/tsp/index.html) and
[Amazon last-mile study](https://www.math.uwaterloo.ca/tsp/amz/index.html).
The site's [DIY app](https://www.math.uwaterloo.ca/tsp/app/diy.html) gives the
most concrete list of algorithms. The two sources describe different problem
models: this repository currently solves symmetric Euclidean point sets, while
the Amazon study uses asymmetric travel-time matrices and stop metadata.

| Waterloo method                                       | Repository status                                                                                                              |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Nearest neighbor                                      | `sawSolution` and `sawAlgorithmSteps` use nearest unvisited point, starting at index 0. The DIY app can choose a random start. |
| 2-opt                                                 | Atomic and progressive implementations.                                                                                        |
| Lin-Kernighan                                         | Simplified local-search implementation; it does not implement the full original method.                                        |
| Control zones                                         | This PR adds a valid greedy packing lower bound. It does not solve the optimal packing LP.                                     |
| Zones and moats                                       | Not implemented.                                                                                                               |
| Degree and subtour LP relaxations                     | Not implemented.                                                                                                               |
| Subtour separation, blossom and comb cuts             | Not implemented.                                                                                                               |
| LP-based branch-and-bound / branch-and-cut            | Not implemented. The repository's brute-force solver handles only small instances.                                             |
| Asymmetric TSP from travel-time matrices              | Not implemented. Current distances are Euclidean and symmetric.                                                                |
| Amazon zone clustering, precedence and super clusters | Not implemented. The current point model has no zone identifiers.                                                              |
| LKH-AMZ constrained local search                      | Not implemented. Existing `lkHelsgaun` is a simplified Euclidean heuristic without Amazon constraints.                         |

The control-zone implementation assigns non-negative radii satisfying
`r[i] + r[j] <= distance(i, j)` for every pair of points. It tries a
half-nearest packing and greedy maximal packings in several orders, retaining
the strongest. The resulting `2 * sum(r)` is a certified lower bound. The
verification API uses the maximum of this bound and the existing 1-tree bound.

The remaining methods need distinct work: an LP solver and separation routines
for the DIY proof tools, and a directed cost-matrix model with zone metadata
for the Amazon route methods. This inventory avoids treating similarly named
heuristics as full implementations of Waterloo's methods.
