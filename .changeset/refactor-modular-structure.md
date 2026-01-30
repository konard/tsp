---
'my-package': minor
---

Refactor monolithic index.html into modular structure

- Create `src/algorithms/` directory with progressive and atomic variants for TSP algorithms
- Create `src/ui/` directory with React.js components (TSPVisualization, Controls, Legend)
- Add shared utility functions (distance, calculateTotalDistance, generateRandomPoints)
- Add barrel exports for clean imports at each level
- Add comprehensive tests for all algorithm functions (39 test cases)
- Update README.md with new project structure and JavaScript library usage examples
