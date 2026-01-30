# TSP Solver Performance Benchmarks

This document contains detailed performance benchmarks for all TSP algorithms implemented in this library.

## Test Environment

- **Runtime**: Bun
- **Grid Size**: 16x16 Moore grid
- **Runs per test**: 5 (averaged)
- **Test sizes**: 10, 25, 50, 100, 200 points

## Algorithm Overview

### Solution Algorithms

| Algorithm                | Time Complexity | Description                               |
| ------------------------ | --------------- | ----------------------------------------- |
| **Sonar (Radial Sweep)** | O(n log n)      | Sorts points by polar angle from centroid |
| **Moore Curve**          | O(n log n)      | Orders points along a space-filling curve |

### Optimization Algorithms

| Algorithm  | Time Complexity  | Description                            |
| ---------- | ---------------- | -------------------------------------- |
| **2-opt**  | O(n²) worst case | Standard segment reversal optimization |
| **Zigzag** | O(n²) worst case | Adjacent pair swapping optimization    |

## Benchmark Results

### Execution Time

| Points | Sonar | Moore | 2-opt (Sonar) | 2-opt (Moore) | Zigzag (Sonar) |
| ------ | ----- | ----- | ------------- | ------------- | -------------- |
| 10     | 163μs | 507μs | 40μs          | 45μs          | 27μs           |
| 25     | 27μs  | 271μs | 500μs         | 149μs         | 33μs           |
| 50     | 23μs  | 377μs | 2.17ms        | 956μs         | 40μs           |
| 100    | 36μs  | 656μs | 1.74ms        | 1.80ms        | 69μs           |
| 200    | 44μs  | 797μs | 3.55ms        | 10.8ms        | 129μs          |

### Tour Quality (Total Distance)

Lower distance = better solution

| Points | Sonar  | Moore  | Sonar + 2-opt | Moore + 2-opt | Sonar + Zigzag |
| ------ | ------ | ------ | ------------- | ------------- | -------------- |
| 10     | 46.49  | 58.49  | 46.49         | 46.49         | 46.49          |
| 25     | 83.55  | 87.37  | 73.63         | 76.69         | 78.54          |
| 50     | 152.45 | 125.91 | 107.59        | 109.59        | 128.65         |
| 100    | 306.81 | 170.54 | 242.45        | 164.66        | 249.80         |
| 200    | 526.07 | 244.20 | 481.01        | 237.45        | 418.77         |

### Optimization Improvement

| Points | 2-opt on Sonar | 2-opt on Moore | Zigzag on Sonar |
| ------ | -------------- | -------------- | --------------- |
| 10     | 0.00           | 12.01          | 0.00            |
| 25     | 9.92           | 10.69          | 5.02            |
| 50     | 44.87          | 16.32          | 23.80           |
| 100    | 64.36          | 5.88           | 57.01           |
| 200    | 45.05          | 6.75           | 107.30          |

## Analysis

### Solution Algorithm Comparison

1. **Sonar Algorithm (Radial Sweep)**
   - **Speed**: Very fast, ~10-50μs for typical problem sizes
   - **Quality**: Produces good initial tours for small problems, but tour quality degrades significantly as problem size increases
   - **Best for**: Quick initial solutions, small problems

2. **Moore Curve Algorithm**
   - **Speed**: Slower than Sonar due to curve generation (~270-800μs)
   - **Quality**: Produces significantly better tours, especially for larger problems
   - **Best for**: Better solution quality, medium to large problems

### Optimization Analysis

1. **2-opt Optimization**
   - Provides consistent improvements across all initial tour types
   - More effective on Sonar tours (higher improvement) since they start further from optimal
   - Time increases quadratically with problem size

2. **Zigzag Optimization**
   - Faster than 2-opt but produces lower quality improvements
   - Good for quick refinement when time is critical

### Recommendations

| Use Case                        | Recommended Approach    |
| ------------------------------- | ----------------------- |
| Quick visualization             | Sonar only              |
| Small problems (< 25 points)    | Sonar + 2-opt           |
| Medium problems (25-100 points) | Moore + 2-opt           |
| Large problems (> 100 points)   | Moore + 2-opt           |
| Time-critical applications      | Moore or Sonar + Zigzag |

## Running Benchmarks

To run the benchmarks yourself:

```bash
bun run benchmarks/run.js
```

The benchmark script generates random point distributions and averages results across multiple runs to ensure statistical accuracy.

## Notes

- All times are averages of 5 runs
- Tour distances are calculated as closed loops (returning to start)
- Random point generation ensures unique positions on the grid
- Results may vary based on random seed and hardware
