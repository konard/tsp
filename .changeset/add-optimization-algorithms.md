---
'tsp-algorithms': minor
---

Add 3-opt, k-opt, Lin-Kernighan, and LKH optimization algorithms

- Add 3-opt optimization using three-edge exchange with 7 reconnection types
- Add k-opt generalized optimization combining 2-opt and 3-opt iteratively
- Add Lin-Kernighan heuristic with variable-depth edge exchange and Or-opt moves
- Add Lin-Kernighan-Helsgaun extending LK with double-bridge perturbation
- All algorithms available in both atomic and progressive (step-by-step) versions
- Integrate into CLI, UI, and benchmarks
- Add 24 new tests with cross-algorithm quality comparison
