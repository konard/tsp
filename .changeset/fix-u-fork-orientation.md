---
'tsp-algorithms': patch
---

Replace U-fork L-system with boustrophedon meander algorithm

- Replace incorrect L-system curve generation with boustrophedon meander space-filling curve
- Implement recursive center embedding: step N+1 embeds circularly-shifted step N in center region
- Add zigzag spiral path generation for base cases (orders 1-3)
- Add frame path generation (boustrophedon spiral connecting center to outer perimeter)
- Regenerate SVG visualizations for steps 1-5 matching all 4 target patterns
