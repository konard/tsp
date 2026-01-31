---
'tsp-algorithms': minor
---

Improve performance benchmarks with 60-second time budget methodology

- Rewrite benchmark to find max points solvable per algorithm within 60 seconds
- Use O-notation scaling from 10-point calibration to estimate max points
- Run 10 random point configurations per test for statistical reliability
- Measure execution time growth at 50-point intervals
- Generate SVG graphs for execution time and tour distance
- Auto-update BENCHMARK.md and README.md with benchmark results
- Add CI/CD job to run benchmarks on push to main and commit results
