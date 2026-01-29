# TSP Visual Solver

An interactive visualization tool for the Traveling Salesman Problem (TSP) that demonstrates and compares two space-filling curve-based heuristic algorithms.

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
      solutions/
        sonar.js              # Sonar (Radial Sweep) algorithm
        moore.js              # Moore Curve algorithm
        index.js              # Solutions barrel export
      optimizations/
        sonar-opt.js          # Sonar zigzag optimization
        moore-opt.js          # Moore 2-opt optimization
        index.js              # Optimizations barrel export
      index.js                # Progressive module export
    atomic/                   # All-at-once algorithms (direct computation)
      solutions/
        sonar.js              # Atomic Sonar solution
        moore.js              # Atomic Moore solution
        index.js
      optimizations/
        sonar-opt.js          # Atomic Sonar optimization
        moore-opt.js          # Atomic Moore optimization
        index.js
      index.js                # Atomic module export
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

## License

[Unlicense](LICENSE) - Public Domain
