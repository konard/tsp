# TSP Visual Solver

An interactive visualization tool for the Traveling Salesman Problem (TSP) that demonstrates and compares two space-filling curve-based heuristic algorithms.

![TSP Visual Solver](https://raw.githubusercontent.com/konard/tsp/main/screenshot.png)

## Live Demo

Visit [https://konard.github.io/tsp](https://konard.github.io/tsp) to try the solver.

## Features

- **Interactive Visualization**: Watch algorithms solve TSP step-by-step with animated demonstrations
- **Two Algorithm Comparison**: Side-by-side comparison of Sonar Visit and Moore Curve algorithms
- **Grid-Aligned Points**: All points are placed on grid intersections for clean visualization
- **Progress Tracking**: Real-time progress display (angle for Sonar, percentage for Moore Curve)
- **Optimization Phase**: Optional 2-opt optimization to improve initial solutions
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Adjustable Parameters**: Customize grid size, number of points, and animation speed

## Project Structure

```
./src
  algorithms/
    progressive/               # Step-by-step algorithms (for visualization)
      solution/
        sonar.js              # Sonar (Radial Sweep) algorithm
        moore.js              # Moore Curve algorithm
        index.js              # Solution barrel export
      optimization/
        two-opt.js            # Generic 2-opt segment reversal
        zigzag-opt.js         # Generic zigzag adjacent swap
        index.js              # Optimization barrel export
      index.js                # Progressive module export
    atomic/                   # All-at-once algorithms (direct computation)
      solution/
        sonar.js              # Atomic Sonar solution
        moore.js              # Atomic Moore solution
        index.js
      optimization/
        two-opt.js            # Atomic 2-opt optimization
        zigzag-opt.js         # Atomic zigzag optimization
        index.js
      index.js                # Atomic module export
    verification/             # Optimal tour verification
      brute-force.js          # Brute-force exact solver
      index.js                # Verification barrel export
    utils.js                  # Shared utility functions
    index.js                  # Main algorithms barrel export
  ui/
    components/
      TSPVisualization.jsx    # SVG-based visualization component
      Controls.jsx            # Control panel component
      Legend.jsx              # Color legend components
      VisualizationPanel.jsx  # Complete visualization panel
      index.js                # Components barrel export
    App.jsx                   # Main application component
    styles.css                # All CSS styles
    index.js                  # UI module export
index.html                    # Main HTML entry point
README.md                     # This file
```

## Algorithms

### Sonar Visit Algorithm

Also known as: Radial Sweep, Angular Sort, Polar Angle Sort, Centroid-based Ordering

This algorithm works by:

1. Computing the centroid (center of mass) of all points
2. Calculating the polar angle of each point relative to the centroid
3. Sorting points by their polar angle
4. Connecting points in angular order to form a tour

The visualization shows a "sweep line" rotating around the centroid, visiting points as it passes them.

### Moore Curve Algorithm

Also known as: Space-Filling Curve, Hilbert Curve Variant, Fractal Ordering

This algorithm uses a Moore curve (a variant of the Hilbert curve) to order points:

1. Generate a Moore curve that fills the grid space
2. Map each point to its nearest position on the curve
3. Sort points by their position along the curve
4. Connect points in curve-order to form a tour

The Moore curve is a space-filling curve that visits every cell in a grid exactly once while maintaining spatial locality, making it effective for TSP approximations.

### Optimization (2-opt)

Both algorithms support an optional optimization phase using 2-opt improvements:

- Iteratively reverses segments of the tour to reduce total distance
- Continues until no more improvements can be found
- Typically achieves 10-30% distance reduction

## Usage

### Web Application

1. **Set Parameters**:
   - Grid Size (N): Size of the N×N grid (5-50)
   - Points (M): Number of random points to generate
   - Animation Speed: Control visualization pace

2. **Generate Points**: Click "New Points" to create random grid-aligned points

3. **Run Algorithms**: Click "Start" to watch both algorithms solve the TSP simultaneously

4. **Optimize**: After initial solutions complete, click "Optimize" to run 2-opt improvements

### JavaScript Library

The algorithms can be used as a standalone JavaScript library:

```javascript
// Progressive (step-by-step) - for visualization
import {
  sonarAlgorithmSteps,
  mooreAlgorithmSteps,
  sonarOptimizationSteps,
  mooreOptimizationSteps,
  calculateMooreGridSize,
  generateRandomPoints,
  calculateTotalDistance,
} from './src/algorithms/index.js';

// Generate points
const gridSize = 10;
const mooreGridSize = calculateMooreGridSize(gridSize);
const points = generateRandomPoints(mooreGridSize, 15);

// Get step-by-step solution (for animation)
const sonarSteps = sonarAlgorithmSteps(points);
const mooreSteps = mooreAlgorithmSteps(points, mooreGridSize);

// Optimize the tour
const sonarTour = sonarSteps[sonarSteps.length - 1].tour;
const optimizationSteps = sonarOptimizationSteps(points, sonarTour);

// Calculate total distance
const finalTour = optimizationSteps[optimizationSteps.length - 1].tour;
const distance = calculateTotalDistance(finalTour, points);
```

```javascript
// Atomic (all-at-once) - for direct computation
import { sonarSolution, mooreSolution } from './src/algorithms/atomic/index.js';
import {
  sonarOptimization,
  mooreOptimization,
} from './src/algorithms/atomic/index.js';

const { tour: sonarTour, centroid } = sonarSolution(points);
const { tour: mooreTour, curvePoints } = mooreSolution(points, mooreGridSize);

const { tour: optimizedTour, improvement } = sonarOptimization(
  points,
  sonarTour
);
```

## Technical Details

- Built with React 18 (loaded from CDN for the web app)
- Uses SVG for high-quality, scalable rendering
- Modular architecture with clear separation of algorithms and UI
- Single-file HTML application (no build step required for basic usage)
- Babel for JSX transpilation in-browser

## Development

To modify the solver, you can:

1. **Edit algorithms**: Modify files in `src/algorithms/` for algorithm changes
2. **Edit UI**: Modify files in `src/ui/` for interface changes
3. **Quick prototyping**: Edit `index.html` directly for rapid iteration

### Running Locally

Simply open `index.html` in a browser. The application loads all dependencies from CDN.

### For ES Module Usage

The `src/` directory contains ES modules that can be imported directly in modern JavaScript environments:

```bash
# With Node.js
node --experimental-vm-modules your-script.js

# With Deno
deno run your-script.ts

# With modern bundlers (Vite, esbuild, etc.)
# Just import directly
```

## Algorithm Complexity

| Algorithm          | Time Complexity | Space Complexity |
| ------------------ | --------------- | ---------------- |
| Sonar Visit        | O(n log n)      | O(n)             |
| Moore Curve        | O(n log n)      | O(n)             |
| 2-opt Optimization | O(n²)           | O(n)             |

Where n is the number of points.

## Performance Benchmarks

Performance tested with Bun runtime on a 16x16 Moore grid:

### Execution Time

| Points | Sonar | Moore | 2-opt (Sonar) | 2-opt (Moore) |
| ------ | ----- | ----- | ------------- | ------------- |
| 25     | 27μs  | 271μs | 500μs         | 149μs         |
| 50     | 23μs  | 377μs | 2.17ms        | 956μs         |
| 100    | 36μs  | 656μs | 1.74ms        | 1.80ms        |
| 200    | 44μs  | 797μs | 3.55ms        | 10.8ms        |

### Tour Quality (Lower = Better)

| Points | Sonar  | Moore  | Sonar + 2-opt | Moore + 2-opt |
| ------ | ------ | ------ | ------------- | ------------- |
| 50     | 152.45 | 125.91 | 107.59        | 109.59        |
| 100    | 306.81 | 170.54 | 242.45        | 164.66        |
| 200    | 526.07 | 244.20 | 481.01        | 237.45        |

**Key findings:**

- **Sonar** is faster but produces longer tours
- **Moore** produces significantly better tours, especially for larger problems
- **2-opt** improves both algorithms, with larger gains on Sonar tours
- For best quality: Use **Moore + 2-opt**
- For fastest results: Use **Sonar** alone

For detailed benchmark analysis, see [BENCHMARK.md](BENCHMARK.md).

## License

[Unlicense](LICENSE) - Public Domain
