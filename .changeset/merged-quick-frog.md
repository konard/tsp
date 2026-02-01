---
'tsp-algorithms': minor
---

Add CI timeout configuration and improve E2E test resilience

- Add job-level timeout (15 minutes) and step-level timeout (10 minutes) for E2E tests
- Add health check before E2E tests to fail fast if server or app is not ready
- Share browser instance across tests to eliminate ~30 second overhead per test
- Reduce E2E test runtime from ~52 seconds per test to ~17 seconds total

Refactor monolithic index.html into modular structure

- Create `src/algorithms/` directory with progressive and atomic variants for TSP algorithms
- Create `src/ui/` directory with React.js components (TSPVisualization, Controls, Legend)
- Add shared utility functions (distance, calculateTotalDistance, generateRandomPoints)
- Add barrel exports for clean imports at each level
- Add comprehensive tests for all algorithm functions (39 test cases)
- Update README.md with new project structure and JavaScript library usage examples
