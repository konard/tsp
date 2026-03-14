---
'tsp-algorithms': patch
---

Fix U-fork fractal orientation to match target C-shape pattern

- Change initial turtle direction from RIGHT (1) to DOWN (2) in uForkCurveToPoints
- Produces the correct vertically symmetric C-shape opening to the left
- Regenerate SVG visualizations for steps 1-5 with corrected orientation
