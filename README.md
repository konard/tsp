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

1. **Set Parameters**:
   - Grid Size (N): Size of the N×N grid (5-50)
   - Points (M): Number of random points to generate
   - Animation Speed: Control visualization pace

2. **Generate Points**: Click "New Points" to create random grid-aligned points

3. **Run Algorithms**: Click "Start" to watch both algorithms solve the TSP simultaneously

4. **Optimize**: After initial solutions complete, click "Optimize" to run 2-opt improvements

## Technical Details

- Built with React 18 (loaded from CDN)
- Uses HTML5 Canvas for rendering
- Single-file HTML application (no build step required)
- Babel for JSX transpilation in-browser

## Development

To modify the solver, simply edit `index.html`. The entire application is contained in a single file for simplicity.

### Project Structure

```
.
├── index.html          # Main application (TSP Visual Solver)
├── README.md           # This file
└── LICENSE             # Unlicense (Public Domain)
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
