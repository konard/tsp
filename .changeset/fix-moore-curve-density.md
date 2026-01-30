---
'tsp-algorithms': patch
---

Fix Moore curve algorithm to cover all grid vertices

- Fix off-by-one error in Moore curve order calculation (order = log2(gridSize) instead of log2(gridSize) - 1)
- Fix calculateMooreGridSize to return correct power-of-2 grid sizes
- Change grid size selector to dropdown with valid Moore curve sizes (2, 4, 8, 16, 32, 64)
- Add VALID_GRID_SIZES constant export
- Add tests for full grid coverage and center vertex coverage
