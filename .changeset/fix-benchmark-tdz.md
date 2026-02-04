---
'tsp': patch
---

Fix benchmark TDZ error by reordering MOORE_GRID_SIZE and PEANO_GRID_SIZE declarations

The benchmark script was failing due to a JavaScript Temporal Dead Zone (TDZ) error
where PEANO_GRID_SIZE tried to use MOORE_GRID_SIZE before it was declared.
