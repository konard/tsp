# TSP Solver Performance Benchmarks

This document contains detailed performance benchmarks for all TSP algorithm configurations.

## Methodology

- **Time Budget**: 60 seconds per algorithm configuration
- **Samples**: 10 random point configurations per test (averaged)
- **Grid Size**: 32x32 Moore grid (max 1024 points)
- **Scaling**: Max points estimated from 10-point calibration using O-notation, then verified
- **Growth Curve**: Measured at every 50-point interval up to max points

## Algorithm Overview

| Configuration      | Complexity | Description                                 |
| ------------------ | ---------- | ------------------------------------------- |
| **Sonar**          | O(n log n) | Radial sweep from centroid                  |
| **Moore**          | O(n log n) | Space-filling curve ordering                |
| **Sonar + 2-opt**  | O(n²)      | Sonar initial tour + 2-opt segment reversal |
| **Moore + 2-opt**  | O(n²)      | Moore initial tour + 2-opt segment reversal |
| **Sonar + Zigzag** | O(n²)      | Sonar initial tour + zigzag pair swap       |
| **Moore + Zigzag** | O(n²)      | Moore initial tour + zigzag pair swap       |

## Max Points in 60 Seconds

The algorithm that solves the greatest number of points within the time budget wins.

| Configuration      | Max Points | Avg Time | Avg Tour Distance |
| ------------------ | ---------: | -------: | ----------------: |
| **Sonar**          |       1020 |    311μs |           4659.45 |
| **Moore**          |       1020 |  17.08ms |           1022.36 |
| **Sonar + 2-opt**  |       1020 |  14.73ms |           4567.77 |
| **Moore + 2-opt**  |       1020 |  50.00ms |           1022.13 |
| **Sonar + Zigzag** |       1020 |    907μs |           3524.59 |
| **Moore + Zigzag** |       1020 |  14.77ms |           1022.01 |

## Execution Time Growth

Time measured at fixed intervals (every 50 points), averaged over 10 random configurations.

![Execution Time Growth](benchmarks/execution-time.svg)

| Points | Sonar |   Moore | Sonar + 2-opt | Moore + 2-opt | Sonar + Zigzag | Moore + Zigzag |
| -----: | ----: | ------: | ------------: | ------------: | -------------: | -------------: |
|     50 |  11μs |   845μs |        1.46ms |        2.09ms |           32μs |          804μs |
|    100 |  27μs |  1.61ms |        2.60ms |        7.82ms |           75μs |         1.56ms |
|    150 |  34μs |  2.38ms |        2.77ms |       23.22ms |          107μs |         2.17ms |
|    200 |  45μs |  3.21ms |        1.87ms |       44.18ms |          126μs |         3.57ms |
|    250 |  55μs |  3.84ms |        2.80ms |       60.36ms |          165μs |         4.57ms |
|    300 |  69μs |  4.72ms |        3.15ms |       82.97ms |          205μs |         4.49ms |
|    350 |  81μs |  5.46ms |        2.55ms |       94.39ms |          265μs |         5.07ms |
|    400 |  93μs |  6.32ms |        2.00ms |      106.22ms |          304μs |         5.72ms |
|    450 | 125μs |  7.28ms |        3.37ms |      158.58ms |          343μs |         7.08ms |
|    500 | 133μs |  7.79ms |        2.87ms |      189.59ms |          367μs |         7.88ms |
|    550 | 140μs |  8.76ms |        4.75ms |      267.39ms |          489μs |         8.13ms |
|    600 | 149μs |  9.36ms |        5.14ms |      375.36ms |          604μs |         9.36ms |
|    650 | 158μs |  9.54ms |        6.80ms |      492.75ms |          610μs |         9.11ms |
|    700 | 179μs | 11.46ms |        7.51ms |      389.54ms |          633μs |        11.32ms |
|    750 | 185μs | 11.34ms |        9.05ms |      339.41ms |          694μs |        11.89ms |
|    800 | 188μs | 11.82ms |        7.46ms |      254.49ms |          836μs |        12.47ms |
|    850 | 196μs | 13.08ms |        8.10ms |      216.54ms |          802μs |        13.17ms |
|    900 | 215μs | 15.31ms |        9.84ms |      184.11ms |          923μs |        16.08ms |
|    950 | 255μs | 15.77ms |       13.73ms |       93.33ms |          920μs |        15.35ms |
|   1000 | 248μs | 14.69ms |       12.72ms |       48.66ms |          993μs |        15.42ms |

## Tour Quality

Tour distance (lower is better) at fixed intervals, averaged over 10 random configurations.

![Tour Distance](benchmarks/tour-distance.svg)

| Points |   Sonar |   Moore | Sonar + 2-opt | Moore + 2-opt | Sonar + Zigzag | Moore + Zigzag |
| -----: | ------: | ------: | ------------: | ------------: | -------------: | -------------: |
|     50 |  276.12 |  214.61 |        190.33 |        200.78 |         233.13 |         212.25 |
|    100 |  510.37 |  313.83 |        411.87 |        281.75 |         410.90 |         295.58 |
|    150 |  763.91 |  383.35 |        635.47 |        350.22 |         602.37 |         368.35 |
|    200 | 1015.84 |  448.88 |        929.93 |        403.70 |         783.19 |         429.65 |
|    250 | 1305.57 |  501.46 |       1167.18 |        464.38 |         942.49 |         477.99 |
|    300 | 1547.64 |  551.02 |       1412.98 |        508.52 |        1144.56 |         528.48 |
|    350 | 1711.50 |  595.25 |       1643.39 |        560.96 |        1297.42 |         573.54 |
|    400 | 2038.57 |  641.23 |       1877.70 |        603.71 |        1459.07 |         617.36 |
|    450 | 2250.37 |  678.92 |       2166.09 |        648.50 |        1676.40 |         655.62 |
|    500 | 2461.67 |  716.56 |       2402.18 |        681.45 |        1808.34 |         690.90 |
|    550 | 2692.83 |  746.57 |       2597.91 |        721.90 |        2024.89 |         733.10 |
|    600 | 2898.03 |  787.63 |       2839.04 |        755.34 |        2176.60 |         766.88 |
|    650 | 3159.44 |  821.35 |       3092.82 |        787.11 |        2355.00 |         799.91 |
|    700 | 3339.95 |  849.98 |       3288.39 |        826.76 |        2536.10 |         838.69 |
|    750 | 3591.65 |  881.64 |       3492.55 |        860.94 |        2756.70 |         871.52 |
|    800 | 3863.79 |  906.67 |       3758.52 |        894.19 |        2861.08 |         901.09 |
|    850 | 4069.72 |  934.03 |       3947.49 |        925.90 |        3082.18 |         932.68 |
|    900 | 4279.40 |  964.01 |       4147.53 |        956.97 |        3201.72 |         958.46 |
|    950 | 4460.14 |  988.58 |       4304.05 |        985.82 |        3332.40 |         987.23 |
|   1000 | 4644.97 | 1013.20 |       4514.00 |       1012.44 |        3511.78 |        1011.91 |

## Running Benchmarks

```bash
bun run benchmarks/run.js
```

## Notes

- All times are averages of 10 runs with different random point sets
- Tour distances are calculated as closed loops (returning to start)
- Random point generation ensures unique positions on the grid
- Results may vary based on hardware
