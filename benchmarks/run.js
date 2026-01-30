/**
 * Performance Benchmarks for TSP Algorithms
 *
 * This script benchmarks all TSP algorithms across different problem sizes
 * and generates detailed performance reports.
 */

/* global performance */
/* eslint-disable max-lines-per-function, require-await, max-statements, complexity */

import { atomic, calculateTotalDistance } from '../lib/index.js';

const { sonarSolution, mooreSolution, twoOpt, zigzagOpt } = atomic;

// Configuration
const PROBLEM_SIZES = [10, 25, 50, 100, 200];
const RUNS_PER_SIZE = 5;
const MOORE_GRID_SIZE = 16;

/**
 * Generate random points within a grid
 * @param {number} numPoints - Number of points to generate
 * @param {number} gridSize - Grid size (coordinates will be 0 to gridSize)
 * @returns {Array<{x: number, y: number, id: number}>}
 */
function generateRandomPoints(numPoints, gridSize = MOORE_GRID_SIZE) {
  const points = [];
  const usedPositions = new Set();

  while (points.length < numPoints) {
    const x = Math.floor(Math.random() * (gridSize + 1));
    const y = Math.floor(Math.random() * (gridSize + 1));
    const key = `${x},${y}`;

    if (!usedPositions.has(key)) {
      usedPositions.add(key);
      points.push({ x, y, id: points.length });
    }
  }

  return points;
}

/**
 * Measure execution time of a function
 * @param {Function} fn - Function to measure
 * @returns {{result: any, timeMs: number}}
 */
function measureTime(fn) {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  return { result, timeMs: end - start };
}

/**
 * Calculate statistics from an array of numbers
 * @param {number[]} values
 * @returns {{mean: number, stdDev: number, min: number, max: number}}
 */
function calculateStats(values) {
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  const min = Math.min(...values);
  const max = Math.max(...values);
  return { mean, stdDev, min, max };
}

/**
 * Run benchmarks for a specific algorithm
 * @param {string} name - Algorithm name
 * @param {Function} solutionFn - Solution function
 * @param {Array} points - Test points
 * @param {number} runs - Number of runs
 * @returns {Object} Benchmark results
 */
function benchmarkAlgorithm(name, solutionFn, points, runs) {
  const times = [];
  const distances = [];
  let lastTour = null;

  for (let i = 0; i < runs; i++) {
    const { result, timeMs } = measureTime(() => solutionFn(points));
    times.push(timeMs);
    lastTour = result.tour;
    if (lastTour && lastTour.length > 0) {
      distances.push(calculateTotalDistance(lastTour, points));
    }
  }

  return {
    name,
    timeStats: calculateStats(times),
    distanceStats: distances.length > 0 ? calculateStats(distances) : null,
    tour: lastTour,
  };
}

/**
 * Run benchmarks for optimization algorithms
 * @param {string} name - Algorithm name
 * @param {Function} optFn - Optimization function
 * @param {Array} points - Test points
 * @param {number[]} initialTour - Initial tour to optimize
 * @param {number} runs - Number of runs
 * @returns {Object} Benchmark results
 */
function benchmarkOptimization(name, optFn, points, initialTour, runs) {
  const times = [];
  const distances = [];
  const improvements = [];
  let lastTour = null;

  for (let i = 0; i < runs; i++) {
    const { result, timeMs } = measureTime(() => optFn(points, initialTour));
    times.push(timeMs);
    lastTour = result.tour;
    improvements.push(result.improvement);
    if (lastTour && lastTour.length > 0) {
      distances.push(calculateTotalDistance(lastTour, points));
    }
  }

  return {
    name,
    timeStats: calculateStats(times),
    distanceStats: distances.length > 0 ? calculateStats(distances) : null,
    improvementStats:
      improvements.length > 0 ? calculateStats(improvements) : null,
    tour: lastTour,
  };
}

/**
 * Format time in a human-readable format
 * @param {number} ms - Time in milliseconds
 * @returns {string}
 */
function formatTime(ms) {
  if (ms < 1) {
    return `${(ms * 1000).toFixed(2)}μs`;
  } else if (ms < 1000) {
    return `${ms.toFixed(2)}ms`;
  } else {
    return `${(ms / 1000).toFixed(2)}s`;
  }
}

/**
 * Run all benchmarks
 */
async function runBenchmarks() {
  console.log('TSP Algorithm Performance Benchmarks');
  console.log('====================================\n');
  console.log(`Runs per test: ${RUNS_PER_SIZE}`);
  console.log(`Moore grid size: ${MOORE_GRID_SIZE}`);
  console.log(`Problem sizes: ${PROBLEM_SIZES.join(', ')}\n`);

  const allResults = {};

  for (const size of PROBLEM_SIZES) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Problem Size: ${size} points`);
    console.log(`${'='.repeat(60)}`);

    const points = generateRandomPoints(size, MOORE_GRID_SIZE);
    const results = { size, algorithms: {} };

    // Benchmark Sonar Algorithm
    console.log('\n--- Sonar Algorithm (Radial Sweep) ---');
    const sonarResult = benchmarkAlgorithm(
      'Sonar',
      (pts) => sonarSolution(pts),
      points,
      RUNS_PER_SIZE
    );
    results.algorithms.sonar = sonarResult;
    console.log(
      `  Time: ${formatTime(sonarResult.timeStats.mean)} ± ${formatTime(sonarResult.timeStats.stdDev)}`
    );
    if (sonarResult.distanceStats) {
      console.log(
        `  Tour Distance: ${sonarResult.distanceStats.mean.toFixed(2)} ± ${sonarResult.distanceStats.stdDev.toFixed(2)}`
      );
    }

    // Benchmark Moore Algorithm
    console.log('\n--- Moore Curve Algorithm ---');
    const mooreResult = benchmarkAlgorithm(
      'Moore',
      (pts) => mooreSolution(pts, MOORE_GRID_SIZE),
      points,
      RUNS_PER_SIZE
    );
    results.algorithms.moore = mooreResult;
    console.log(
      `  Time: ${formatTime(mooreResult.timeStats.mean)} ± ${formatTime(mooreResult.timeStats.stdDev)}`
    );
    if (mooreResult.distanceStats) {
      console.log(
        `  Tour Distance: ${mooreResult.distanceStats.mean.toFixed(2)} ± ${mooreResult.distanceStats.stdDev.toFixed(2)}`
      );
    }

    // Benchmark 2-opt Optimization (on Sonar tour)
    if (sonarResult.tour && sonarResult.tour.length >= 4) {
      console.log('\n--- 2-opt Optimization (on Sonar tour) ---');
      const twoOptResult = benchmarkOptimization(
        '2-opt',
        (pts, tour) => twoOpt(pts, tour),
        points,
        sonarResult.tour,
        RUNS_PER_SIZE
      );
      results.algorithms.twoOptOnSonar = twoOptResult;
      console.log(
        `  Time: ${formatTime(twoOptResult.timeStats.mean)} ± ${formatTime(twoOptResult.timeStats.stdDev)}`
      );
      if (twoOptResult.distanceStats) {
        console.log(
          `  Tour Distance: ${twoOptResult.distanceStats.mean.toFixed(2)} ± ${twoOptResult.distanceStats.stdDev.toFixed(2)}`
        );
      }
      if (twoOptResult.improvementStats) {
        console.log(
          `  Improvement: ${twoOptResult.improvementStats.mean.toFixed(2)} ± ${twoOptResult.improvementStats.stdDev.toFixed(2)}`
        );
      }
    }

    // Benchmark 2-opt Optimization (on Moore tour)
    if (mooreResult.tour && mooreResult.tour.length >= 4) {
      console.log('\n--- 2-opt Optimization (on Moore tour) ---');
      const twoOptMooreResult = benchmarkOptimization(
        '2-opt',
        (pts, tour) => twoOpt(pts, tour),
        points,
        mooreResult.tour,
        RUNS_PER_SIZE
      );
      results.algorithms.twoOptOnMoore = twoOptMooreResult;
      console.log(
        `  Time: ${formatTime(twoOptMooreResult.timeStats.mean)} ± ${formatTime(twoOptMooreResult.timeStats.stdDev)}`
      );
      if (twoOptMooreResult.distanceStats) {
        console.log(
          `  Tour Distance: ${twoOptMooreResult.distanceStats.mean.toFixed(2)} ± ${twoOptMooreResult.distanceStats.stdDev.toFixed(2)}`
        );
      }
      if (twoOptMooreResult.improvementStats) {
        console.log(
          `  Improvement: ${twoOptMooreResult.improvementStats.mean.toFixed(2)} ± ${twoOptMooreResult.improvementStats.stdDev.toFixed(2)}`
        );
      }
    }

    // Benchmark Zigzag Optimization (on Sonar tour)
    if (sonarResult.tour && sonarResult.tour.length >= 4) {
      console.log('\n--- Zigzag Optimization (on Sonar tour) ---');
      const zigzagResult = benchmarkOptimization(
        'Zigzag',
        (pts, tour) => zigzagOpt(pts, tour),
        points,
        sonarResult.tour,
        RUNS_PER_SIZE
      );
      results.algorithms.zigzagOnSonar = zigzagResult;
      console.log(
        `  Time: ${formatTime(zigzagResult.timeStats.mean)} ± ${formatTime(zigzagResult.timeStats.stdDev)}`
      );
      if (zigzagResult.distanceStats) {
        console.log(
          `  Tour Distance: ${zigzagResult.distanceStats.mean.toFixed(2)} ± ${zigzagResult.distanceStats.stdDev.toFixed(2)}`
        );
      }
      if (zigzagResult.improvementStats) {
        console.log(
          `  Improvement: ${zigzagResult.improvementStats.mean.toFixed(2)} ± ${zigzagResult.improvementStats.stdDev.toFixed(2)}`
        );
      }
    }

    allResults[size] = results;
  }

  // Generate summary table
  console.log('\n\n');
  console.log('SUMMARY TABLE');
  console.log('=============\n');

  console.log('Execution Time (mean ± stddev)');
  console.log('-'.repeat(100));
  console.log(
    'Size'.padEnd(10) +
      'Sonar'.padEnd(20) +
      'Moore'.padEnd(20) +
      '2-opt (Sonar)'.padEnd(20) +
      '2-opt (Moore)'.padEnd(20)
  );
  console.log('-'.repeat(100));

  for (const size of PROBLEM_SIZES) {
    const r = allResults[size].algorithms;
    const row =
      String(size).padEnd(10) +
      `${formatTime(r.sonar.timeStats.mean)}`.padEnd(20) +
      `${formatTime(r.moore.timeStats.mean)}`.padEnd(20) +
      `${r.twoOptOnSonar ? formatTime(r.twoOptOnSonar.timeStats.mean) : 'N/A'}`.padEnd(
        20
      ) +
      `${r.twoOptOnMoore ? formatTime(r.twoOptOnMoore.timeStats.mean) : 'N/A'}`.padEnd(
        20
      );
    console.log(row);
  }

  console.log('\nTour Distance (mean)');
  console.log('-'.repeat(100));
  console.log(
    'Size'.padEnd(10) +
      'Sonar'.padEnd(20) +
      'Moore'.padEnd(20) +
      '2-opt (Sonar)'.padEnd(20) +
      '2-opt (Moore)'.padEnd(20)
  );
  console.log('-'.repeat(100));

  for (const size of PROBLEM_SIZES) {
    const r = allResults[size].algorithms;
    const row =
      String(size).padEnd(10) +
      `${r.sonar.distanceStats ? r.sonar.distanceStats.mean.toFixed(2) : 'N/A'}`.padEnd(
        20
      ) +
      `${r.moore.distanceStats ? r.moore.distanceStats.mean.toFixed(2) : 'N/A'}`.padEnd(
        20
      ) +
      `${r.twoOptOnSonar?.distanceStats ? r.twoOptOnSonar.distanceStats.mean.toFixed(2) : 'N/A'}`.padEnd(
        20
      ) +
      `${r.twoOptOnMoore?.distanceStats ? r.twoOptOnMoore.distanceStats.mean.toFixed(2) : 'N/A'}`.padEnd(
        20
      );
    console.log(row);
  }

  // Return results for potential JSON export
  return allResults;
}

// Run benchmarks
runBenchmarks()
  .then(() => {
    console.log('\n\nBenchmark complete.');
  })
  .catch((error) => {
    console.error('Benchmark failed:', error);
    process.exit(1);
  });
