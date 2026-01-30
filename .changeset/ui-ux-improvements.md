---
'tsp-algorithms': minor
---

UI/UX improvements for consistent algorithm comparison experience

- Show % of optimal path and exact length for all algorithms (using brute-force for small sets, lower bound for larger)
- Move algorithm selection dropdowns into panel titles for more minimalistic UI
- Display point coordinates in parentheses wherever point numbers are shown (SVG labels + step descriptions)
- Enforce points count limit based on selected grid size (max N×N)
- Allow continued optimization on top of previous results until optimal path is reached
- Show progress % for all algorithms; Sonar also shows sweep angle
- Disable Start button when brute-force algorithm is selected with too many points
- Update tests to match new component interfaces

Fixes #34
