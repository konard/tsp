---
'tsp-algorithms': patch
---

Fix Moore curve normalization to correctly fill grid

- Fix off-by-one error in mooreCurveToPoints normalization (scale to gridSize-1, not gridSize)
- Fix calculateMooreGridSize to return smallest valid power-of-2 grid size
- Add VALID_GRID_SIZES constant [2, 4, 8, 16, 32, 64]
- Replace grid size number input with dropdown selector for valid Moore curve sizes
- Fix generateRandomPoints to use [0, gridSize-1] coordinate range
- Add 58 comprehensive tests for point-by-point and edge verification
