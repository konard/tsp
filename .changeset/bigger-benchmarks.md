---
'tsp-algorithms': minor
---

Scale benchmarks to 128x128 grid and add new algorithm configurations

- Increase Moore grid size from 32x32 to 128x128 (up to 16384 points)
- Add VALID_GRID_SIZES support for 64 and 128
- Add brute force algorithm to benchmark configurations
- Add combined optimization (alternating zigzag + 2-opt) algorithm
- Add Sonar + Combined and Moore + Combined benchmark configurations
- Adapt benchmark step sizing for larger point counts
- Add more SVG chart colors for 10 algorithm configurations
