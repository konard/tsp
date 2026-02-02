---
'tsp-algorithms': minor
---

Add Koch snowflake fractal curve as a new TSP solution algorithm

- Implement Koch snowflake curve generation with recursive subdivision
- Map points to nearest position on the Koch curve and sort by curve position to form a tour
- Add both atomic and progressive (step-by-step visualization) versions
- Add Koch Snowflake as a selectable algorithm in the UI
- Add translations for all 20 supported languages
- Add 15 tests covering curve generation, normalization, order calculation, and solution
