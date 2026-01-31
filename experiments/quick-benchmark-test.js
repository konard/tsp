/**
 * Quick smoke test for benchmark code with reduced parameters.
 * Verifies all algorithm configurations run correctly.
 */

import { atomic, calculateTotalDistance } from '../src/lib/index.js';

const {
  sonarSolution,
  mooreSolution,
  bruteForceSolution,
  twoOpt,
  zigzagOpt,
  combinedOpt,
} = atomic;

const MOORE_GRID_SIZE = 128;

function generateRandomPoints(numPoints, gridSize = MOORE_GRID_SIZE) {
  const points = [];
  const usedPositions = new Set();
  const count = Math.min(numPoints, gridSize * gridSize);
  while (points.length < count) {
    const x = Math.floor(Math.random() * gridSize);
    const y = Math.floor(Math.random() * gridSize);
    const key = `${x},${y}`;
    if (!usedPositions.has(key)) {
      usedPositions.add(key);
      points.push({ x, y, id: points.length });
    }
  }
  return points;
}

// Test all configurations with small point counts
const configs = [
  {
    name: 'Brute Force',
    run: (points) => {
      const result = bruteForceSolution(points);
      if (result === null) return { tour: [], distance: Infinity };
      return { tour: result.tour, distance: result.distance };
    },
  },
  {
    name: 'Sonar',
    run: (points) => {
      const { tour } = sonarSolution(points);
      return { tour, distance: calculateTotalDistance(tour, points) };
    },
  },
  {
    name: 'Moore',
    run: (points) => {
      const { tour } = mooreSolution(points, MOORE_GRID_SIZE);
      return { tour, distance: calculateTotalDistance(tour, points) };
    },
  },
  {
    name: 'Sonar + 2-opt',
    run: (points) => {
      const { tour: initial } = sonarSolution(points);
      const { tour } = twoOpt(points, initial);
      return { tour, distance: calculateTotalDistance(tour, points) };
    },
  },
  {
    name: 'Moore + 2-opt',
    run: (points) => {
      const { tour: initial } = mooreSolution(points, MOORE_GRID_SIZE);
      const { tour } = twoOpt(points, initial);
      return { tour, distance: calculateTotalDistance(tour, points) };
    },
  },
  {
    name: 'Sonar + Zigzag',
    run: (points) => {
      const { tour: initial } = sonarSolution(points);
      const { tour } = zigzagOpt(points, initial);
      return { tour, distance: calculateTotalDistance(tour, points) };
    },
  },
  {
    name: 'Moore + Zigzag',
    run: (points) => {
      const { tour: initial } = mooreSolution(points, MOORE_GRID_SIZE);
      const { tour } = zigzagOpt(points, initial);
      return { tour, distance: calculateTotalDistance(tour, points) };
    },
  },
  {
    name: 'Sonar + Combined',
    run: (points) => {
      const { tour: initial } = sonarSolution(points);
      const { tour } = combinedOpt(points, initial);
      return { tour, distance: calculateTotalDistance(tour, points) };
    },
  },
  {
    name: 'Moore + Combined',
    run: (points) => {
      const { tour: initial } = mooreSolution(points, MOORE_GRID_SIZE);
      const { tour } = combinedOpt(points, initial);
      return { tour, distance: calculateTotalDistance(tour, points) };
    },
  },
];

console.log('Quick benchmark smoke test (10 points each):\n');

const points10 = generateRandomPoints(10);
const points100 = generateRandomPoints(100);

for (const config of configs) {
  try {
    const start = performance.now();
    const result10 = config.run(points10);
    const time10 = performance.now() - start;

    const start2 = performance.now();
    const result100 = config.run(points100);
    const time100 = performance.now() - start2;

    console.log(
      `${config.name.padEnd(20)} 10pts: ${time10.toFixed(2)}ms dist=${result10.distance.toFixed(2)}  |  100pts: ${time100.toFixed(2)}ms dist=${result100.distance.toFixed(2)}`,
    );
  } catch (e) {
    console.error(`${config.name}: ERROR - ${e.message}`);
  }
}

console.log('\nAll configurations verified!');
