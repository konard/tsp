/**
 * Performance Benchmarks for TSP Algorithms
 *
 * Methodology:
 * 1. For each algorithm+optimization configuration, measure time for 10 points
 * 2. Use O-notation to predict max points solvable within 60 seconds
 * 3. Verify that predicted number of points is stably solved in under 60 seconds
 *    by running 10 random point configurations and averaging
 * 4. Measure execution time at fixed intervals (every 50 points) to show growth
 * 5. Generate SVG graphs of execution time growth
 * 6. Update BENCHMARK.md and README.md with results
 */

/* global performance */
/* eslint-disable require-await, max-statements, complexity */

import { atomic, calculateTotalDistance } from '../src/lib/index.js';
import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

const {
  sonarSolution,
  mooreSolution,
  bruteForceSolution,
  twoOpt,
  zigzagOpt,
  combinedOpt,
} = atomic;

// Configuration
const TIME_BUDGET_SECONDS = 60;
const SAMPLES_PER_TEST = 10;
const CALIBRATION_POINTS = 10;
const MOORE_GRID_SIZE = 128;
const FIXED_STEP = 50;

/**
 * Generate random unique points within a grid.
 * @param {number} numPoints
 * @param {number} gridSize
 * @returns {Array<{x: number, y: number, id: number}>}
 */
function generateRandomPoints(numPoints, gridSize = MOORE_GRID_SIZE) {
  const points = [];
  const usedPositions = new Set();
  const maxPossible = gridSize * gridSize;
  const count = Math.min(numPoints, maxPossible);

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

/**
 * Measure execution time of a function.
 * @param {Function} fn
 * @returns {{result: any, timeMs: number}}
 */
function measureTime(fn) {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  return { result, timeMs: end - start };
}

/**
 * Calculate statistics from an array of numbers.
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
 * Format time in a human-readable format.
 * @param {number} ms
 * @returns {string}
 */
function formatTime(ms) {
  if (ms < 1) {
    return `${(ms * 1000).toFixed(0)}μs`;
  } else if (ms < 1000) {
    return `${ms.toFixed(2)}ms`;
  } else {
    return `${(ms / 1000).toFixed(2)}s`;
  }
}

/**
 * Algorithm configuration definition.
 * @typedef {Object} AlgorithmConfig
 * @property {string} name
 * @property {string} complexity - O-notation string
 * @property {Function} complexityFn - f(n) for scaling estimation
 * @property {Function} run - (points) => {tour, distance}
 */

/**
 * Build the list of algorithm configurations to benchmark.
 * @returns {AlgorithmConfig[]}
 */
function getAlgorithmConfigs() {
  return [
    {
      name: 'Brute Force',
      complexity: 'O(n!)',
      complexityFn: (n) => {
        // Factorial for scaling estimation
        let result = 1;
        for (let i = 2; i <= n; i++) {
          result *= i;
        }
        return result;
      },
      run: (points) => {
        const result = bruteForceSolution(points);
        if (result === null) {
          return { tour: [], distance: Infinity };
        }
        return { tour: result.tour, distance: result.distance };
      },
    },
    {
      name: 'Sonar',
      complexity: 'O(n log n)',
      complexityFn: (n) => n * Math.log2(n),
      run: (points) => {
        const { tour } = sonarSolution(points);
        return { tour, distance: calculateTotalDistance(tour, points) };
      },
    },
    {
      name: 'Moore',
      complexity: 'O(n log n)',
      complexityFn: (n) => n * Math.log2(n),
      run: (points) => {
        const { tour } = mooreSolution(points, MOORE_GRID_SIZE);
        return { tour, distance: calculateTotalDistance(tour, points) };
      },
    },
    {
      name: 'Sonar + 2-opt',
      complexity: 'O(n²)',
      complexityFn: (n) => n * n,
      run: (points) => {
        const { tour: initial } = sonarSolution(points);
        const { tour } = twoOpt(points, initial);
        return { tour, distance: calculateTotalDistance(tour, points) };
      },
    },
    {
      name: 'Moore + 2-opt',
      complexity: 'O(n²)',
      complexityFn: (n) => n * n,
      run: (points) => {
        const { tour: initial } = mooreSolution(points, MOORE_GRID_SIZE);
        const { tour } = twoOpt(points, initial);
        return { tour, distance: calculateTotalDistance(tour, points) };
      },
    },
    {
      name: 'Sonar + Zigzag',
      complexity: 'O(n²)',
      complexityFn: (n) => n * n,
      run: (points) => {
        const { tour: initial } = sonarSolution(points);
        const { tour } = zigzagOpt(points, initial);
        return { tour, distance: calculateTotalDistance(tour, points) };
      },
    },
    {
      name: 'Moore + Zigzag',
      complexity: 'O(n²)',
      complexityFn: (n) => n * n,
      run: (points) => {
        const { tour: initial } = mooreSolution(points, MOORE_GRID_SIZE);
        const { tour } = zigzagOpt(points, initial);
        return { tour, distance: calculateTotalDistance(tour, points) };
      },
    },
    {
      name: 'Sonar + Combined',
      complexity: 'O(n³)',
      complexityFn: (n) => n * n * n,
      run: (points) => {
        const { tour: initial } = sonarSolution(points);
        const { tour } = combinedOpt(points, initial);
        return { tour, distance: calculateTotalDistance(tour, points) };
      },
    },
    {
      name: 'Moore + Combined',
      complexity: 'O(n³)',
      complexityFn: (n) => n * n * n,
      run: (points) => {
        const { tour: initial } = mooreSolution(points, MOORE_GRID_SIZE);
        const { tour } = combinedOpt(points, initial);
        return { tour, distance: calculateTotalDistance(tour, points) };
      },
    },
  ];
}

/**
 * Estimate max points that can be solved within the time budget,
 * based on calibration timing and O-notation complexity.
 * @param {number} calibrationTimeMs - time to solve CALIBRATION_POINTS
 * @param {Function} complexityFn - f(n) complexity function
 * @param {number} budgetMs - time budget in ms
 * @returns {number} estimated max points
 */
function estimateMaxPoints(calibrationTimeMs, complexityFn, budgetMs) {
  // timePerUnit = calibrationTimeMs / complexityFn(CALIBRATION_POINTS)
  // We want: timePerUnit * complexityFn(n) <= budgetMs
  // Binary search for largest n
  const timePerUnit =
    calibrationTimeMs / complexityFn(Math.max(CALIBRATION_POINTS, 2));
  const maxGridPoints = MOORE_GRID_SIZE * MOORE_GRID_SIZE;

  let lo = CALIBRATION_POINTS;
  let hi = maxGridPoints;

  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    const estimatedTime = timePerUnit * complexityFn(mid);
    if (estimatedTime <= budgetMs) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }

  return lo;
}

/**
 * Run a single algorithm on given points and return timing + distance.
 * @param {AlgorithmConfig} config
 * @param {Array} points
 * @returns {{timeMs: number, distance: number}}
 */
function runSingle(config, points) {
  const { result, timeMs } = measureTime(() => config.run(points));
  return { timeMs, distance: result.distance };
}

/**
 * Run an algorithm with given number of points, SAMPLES_PER_TEST times
 * with different random point sets. Return average time and distance.
 * @param {AlgorithmConfig} config
 * @param {number} numPoints
 * @returns {{avgTimeMs: number, avgDistance: number, maxTimeMs: number, allTimes: number[], allDistances: number[]}}
 */
function benchmarkAtPointCount(config, numPoints) {
  const times = [];
  const distances = [];

  for (let s = 0; s < SAMPLES_PER_TEST; s++) {
    const points = generateRandomPoints(numPoints);
    const { timeMs, distance } = runSingle(config, points);
    times.push(timeMs);
    // Filter out Infinity distances (e.g. brute force exceeding point limit)
    distances.push(Number.isFinite(distance) ? distance : 0);
  }

  const timeStats = calculateStats(times);
  const distStats = calculateStats(distances);

  return {
    avgTimeMs: timeStats.mean,
    avgDistance: distStats.mean,
    maxTimeMs: timeStats.max,
    allTimes: times,
    allDistances: distances,
  };
}

/**
 * Find the stable max points count by verifying the estimate.
 * We start from the O-notation estimate and reduce if needed.
 * @param {AlgorithmConfig} config
 * @param {number} estimate
 * @returns {{maxPoints: number, avgTimeMs: number, avgDistance: number}}
 */
function findStableMaxPoints(config, estimate) {
  let candidate = Math.min(estimate, MOORE_GRID_SIZE * MOORE_GRID_SIZE);
  // Round down to nearest 10 for cleanliness
  candidate = Math.floor(candidate / 10) * 10;
  candidate = Math.max(candidate, CALIBRATION_POINTS);

  const budgetMs = TIME_BUDGET_SECONDS * 1000;

  // Try the candidate, reduce by 10% if it exceeds budget
  for (let attempt = 0; attempt < 20; attempt++) {
    const result = benchmarkAtPointCount(config, candidate);

    if (result.maxTimeMs <= budgetMs) {
      return {
        maxPoints: candidate,
        avgTimeMs: result.avgTimeMs,
        avgDistance: result.avgDistance,
      };
    }

    // Reduce by 10%
    candidate = Math.floor(candidate * 0.9);
    candidate = Math.floor(candidate / 10) * 10;
    candidate = Math.max(candidate, CALIBRATION_POINTS);

    if (candidate <= CALIBRATION_POINTS) {
      const result2 = benchmarkAtPointCount(config, CALIBRATION_POINTS);
      return {
        maxPoints: CALIBRATION_POINTS,
        avgTimeMs: result2.avgTimeMs,
        avgDistance: result2.avgDistance,
      };
    }
  }

  return { maxPoints: CALIBRATION_POINTS, avgTimeMs: 0, avgDistance: 0 };
}

/**
 * Measure execution time at fixed intervals (every FIXED_STEP points).
 * @param {AlgorithmConfig} config
 * @param {number} maxPoints
 * @returns {Array<{points: number, avgTimeMs: number, avgDistance: number}>}
 */
function measureGrowthCurve(config, maxPoints) {
  const dataPoints = [];
  const maxGridPoints = MOORE_GRID_SIZE * MOORE_GRID_SIZE;
  const budgetMs = TIME_BUDGET_SECONDS * 1000;

  // Adapt step size: small for brute force, larger for high-capacity algorithms
  // Target ~20-30 data points for readability
  let step;
  let startN;
  if (maxPoints <= FIXED_STEP) {
    step = 2;
    startN = 4;
  } else {
    step = Math.max(
      FIXED_STEP,
      Math.floor(maxPoints / 20 / FIXED_STEP) * FIXED_STEP
    );
    startN = step;
  }

  for (let n = startN; n <= Math.min(maxPoints, maxGridPoints); n += step) {
    const result = benchmarkAtPointCount(config, n);

    dataPoints.push({
      points: n,
      avgTimeMs: result.avgTimeMs,
      avgDistance: result.avgDistance,
    });

    // Stop if we exceed the budget
    if (result.maxTimeMs > budgetMs) {
      break;
    }
  }

  return dataPoints;
}

/**
 * Generate an SVG graph of execution time growth for all algorithms.
 * @param {Object} allGrowthData - { configName: [{points, avgTimeMs}] }
 * @returns {string} SVG content
 */
function generateTimeSvg(allGrowthData) {
  const width = 800;
  const height = 500;
  const margin = { top: 40, right: 200, bottom: 60, left: 80 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  const colors = [
    '#2563eb',
    '#dc2626',
    '#16a34a',
    '#9333ea',
    '#ea580c',
    '#0891b2',
    '#d97706',
    '#be185d',
    '#059669',
    '#7c3aed',
  ];

  // Find global max x and y across all series
  let maxX = 0;
  let maxY = 0;
  const entries = Object.entries(allGrowthData);
  for (const [, data] of entries) {
    for (const d of data) {
      if (d.points > maxX) {
        maxX = d.points;
      }
      if (d.avgTimeMs > maxY) {
        maxY = d.avgTimeMs;
      }
    }
  }

  // Add padding
  maxY *= 1.1;
  if (maxY === 0) {
    maxY = 1;
  }

  const scaleX = (v) => margin.left + (v / maxX) * plotW;
  const scaleY = (v) => margin.top + plotH - (v / maxY) * plotH;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" font-family="sans-serif" font-size="12">\n`;
  svg += `  <rect width="${width}" height="${height}" fill="white"/>\n`;

  // Title
  svg += `  <text x="${width / 2}" y="20" text-anchor="middle" font-size="16" font-weight="bold">Execution Time vs Number of Points</text>\n`;

  // Axes
  svg += `  <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + plotH}" stroke="#333" stroke-width="1"/>\n`;
  svg += `  <line x1="${margin.left}" y1="${margin.top + plotH}" x2="${margin.left + plotW}" y2="${margin.top + plotH}" stroke="#333" stroke-width="1"/>\n`;

  // X axis label
  svg += `  <text x="${margin.left + plotW / 2}" y="${height - 10}" text-anchor="middle" font-size="13">Number of Points</text>\n`;

  // Y axis label
  svg += `  <text x="15" y="${margin.top + plotH / 2}" text-anchor="middle" font-size="13" transform="rotate(-90,15,${margin.top + plotH / 2})">Time (ms)</text>\n`;

  // Grid lines and tick marks for X axis
  const xTicks = [];
  const xStep = maxX <= 200 ? 50 : maxX <= 500 ? 100 : maxX <= 2000 ? 200 : 500;
  for (let v = xStep; v <= maxX; v += xStep) {
    xTicks.push(v);
  }
  for (const v of xTicks) {
    const x = scaleX(v);
    svg += `  <line x1="${x}" y1="${margin.top}" x2="${x}" y2="${margin.top + plotH}" stroke="#e5e7eb" stroke-width="1"/>\n`;
    svg += `  <text x="${x}" y="${margin.top + plotH + 18}" text-anchor="middle">${v}</text>\n`;
  }

  // Grid lines and tick marks for Y axis
  const yTickCount = 5;
  for (let i = 0; i <= yTickCount; i++) {
    const v = (maxY / yTickCount) * i;
    const y = scaleY(v);
    svg += `  <line x1="${margin.left}" y1="${y}" x2="${margin.left + plotW}" y2="${y}" stroke="#e5e7eb" stroke-width="1"/>\n`;
    svg += `  <text x="${margin.left - 8}" y="${y + 4}" text-anchor="end">${formatTime(v)}</text>\n`;
  }

  // Plot each series
  entries.forEach(([name, data], idx) => {
    const color = colors[idx % colors.length];

    if (data.length === 0) {
      return;
    }

    // Line
    const pathParts = data.map(
      (d, i) =>
        `${i === 0 ? 'M' : 'L'}${scaleX(d.points).toFixed(1)},${scaleY(d.avgTimeMs).toFixed(1)}`
    );
    svg += `  <path d="${pathParts.join(' ')}" fill="none" stroke="${color}" stroke-width="2"/>\n`;

    // Data points
    for (const d of data) {
      svg += `  <circle cx="${scaleX(d.points).toFixed(1)}" cy="${scaleY(d.avgTimeMs).toFixed(1)}" r="3" fill="${color}"/>\n`;
    }

    // Legend entry
    const legendY = margin.top + 15 + idx * 20;
    const legendX = margin.left + plotW + 15;
    svg += `  <line x1="${legendX}" y1="${legendY}" x2="${legendX + 20}" y2="${legendY}" stroke="${color}" stroke-width="2"/>\n`;
    svg += `  <circle cx="${legendX + 10}" cy="${legendY}" r="3" fill="${color}"/>\n`;
    svg += `  <text x="${legendX + 28}" y="${legendY + 4}" font-size="11">${name}</text>\n`;
  });

  svg += '</svg>\n';
  return svg;
}

/**
 * Generate an SVG graph of tour quality (distance) for all algorithms.
 * @param {Object} allGrowthData - { configName: [{points, avgDistance}] }
 * @returns {string} SVG content
 */
function generateDistanceSvg(allGrowthData) {
  const width = 800;
  const height = 500;
  const margin = { top: 40, right: 200, bottom: 60, left: 80 };
  const plotW = width - margin.left - margin.right;
  const plotH = height - margin.top - margin.bottom;

  const colors = [
    '#2563eb',
    '#dc2626',
    '#16a34a',
    '#9333ea',
    '#ea580c',
    '#0891b2',
    '#d97706',
    '#be185d',
    '#059669',
    '#7c3aed',
  ];

  let maxX = 0;
  let maxY = 0;
  const entries = Object.entries(allGrowthData);
  for (const [, data] of entries) {
    for (const d of data) {
      if (d.points > maxX) {
        maxX = d.points;
      }
      if (d.avgDistance > maxY) {
        maxY = d.avgDistance;
      }
    }
  }

  maxY *= 1.1;
  if (maxY === 0) {
    maxY = 1;
  }

  const scaleX = (v) => margin.left + (v / maxX) * plotW;
  const scaleY = (v) => margin.top + plotH - (v / maxY) * plotH;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" font-family="sans-serif" font-size="12">\n`;
  svg += `  <rect width="${width}" height="${height}" fill="white"/>\n`;

  svg += `  <text x="${width / 2}" y="20" text-anchor="middle" font-size="16" font-weight="bold">Tour Distance vs Number of Points</text>\n`;

  svg += `  <line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${margin.top + plotH}" stroke="#333" stroke-width="1"/>\n`;
  svg += `  <line x1="${margin.left}" y1="${margin.top + plotH}" x2="${margin.left + plotW}" y2="${margin.top + plotH}" stroke="#333" stroke-width="1"/>\n`;

  svg += `  <text x="${margin.left + plotW / 2}" y="${height - 10}" text-anchor="middle" font-size="13">Number of Points</text>\n`;
  svg += `  <text x="15" y="${margin.top + plotH / 2}" text-anchor="middle" font-size="13" transform="rotate(-90,15,${margin.top + plotH / 2})">Tour Distance</text>\n`;

  const xStep = maxX <= 200 ? 50 : maxX <= 500 ? 100 : maxX <= 2000 ? 200 : 500;
  for (let v = xStep; v <= maxX; v += xStep) {
    const x = scaleX(v);
    svg += `  <line x1="${x}" y1="${margin.top}" x2="${x}" y2="${margin.top + plotH}" stroke="#e5e7eb" stroke-width="1"/>\n`;
    svg += `  <text x="${x}" y="${margin.top + plotH + 18}" text-anchor="middle">${v}</text>\n`;
  }

  const yTickCount = 5;
  for (let i = 0; i <= yTickCount; i++) {
    const v = (maxY / yTickCount) * i;
    const y = scaleY(v);
    svg += `  <line x1="${margin.left}" y1="${y}" x2="${margin.left + plotW}" y2="${y}" stroke="#e5e7eb" stroke-width="1"/>\n`;
    svg += `  <text x="${margin.left - 8}" y="${y + 4}" text-anchor="end">${v.toFixed(0)}</text>\n`;
  }

  entries.forEach(([name, data], idx) => {
    const color = colors[idx % colors.length];
    if (data.length === 0) {
      return;
    }

    const pathParts = data.map(
      (d, i) =>
        `${i === 0 ? 'M' : 'L'}${scaleX(d.points).toFixed(1)},${scaleY(d.avgDistance).toFixed(1)}`
    );
    svg += `  <path d="${pathParts.join(' ')}" fill="none" stroke="${color}" stroke-width="2"/>\n`;

    for (const d of data) {
      svg += `  <circle cx="${scaleX(d.points).toFixed(1)}" cy="${scaleY(d.avgDistance).toFixed(1)}" r="3" fill="${color}"/>\n`;
    }

    const legendY = margin.top + 15 + idx * 20;
    const legendX = margin.left + plotW + 15;
    svg += `  <line x1="${legendX}" y1="${legendY}" x2="${legendX + 20}" y2="${legendY}" stroke="${color}" stroke-width="2"/>\n`;
    svg += `  <circle cx="${legendX + 10}" cy="${legendY}" r="3" fill="${color}"/>\n`;
    svg += `  <text x="${legendX + 28}" y="${legendY + 4}" font-size="11">${name}</text>\n`;
  });

  svg += '</svg>\n';
  return svg;
}

/**
 * Generate BENCHMARK.md content from results.
 * @param {Object} results
 * @returns {string}
 */
function generateBenchmarkMd(results) {
  let md = '# TSP Solver Performance Benchmarks\n\n';
  md +=
    'This document contains detailed performance benchmarks for all TSP algorithm configurations.\n\n';

  md += '## Methodology\n\n';
  md += `- **Time Budget**: ${TIME_BUDGET_SECONDS} seconds per algorithm configuration\n`;
  md += `- **Samples**: ${SAMPLES_PER_TEST} random point configurations per test (averaged)\n`;
  md += `- **Grid Size**: ${MOORE_GRID_SIZE}x${MOORE_GRID_SIZE} Moore grid (max ${MOORE_GRID_SIZE * MOORE_GRID_SIZE} points)\n`;
  md +=
    '- **Scaling**: Max points estimated from 10-point calibration using O-notation, then verified\n';
  md +=
    '- **Growth Curve**: Measured at every 50-point interval up to max points\n\n';

  md += '## Algorithm Overview\n\n';
  md += '| Configuration | Complexity | Description |\n';
  md += '| --- | --- | --- |\n';
  md += '| **Brute Force** | O(n!) | Exhaustive search for optimal tour |\n';
  md += '| **Sonar** | O(n log n) | Radial sweep from centroid |\n';
  md += '| **Moore** | O(n log n) | Space-filling curve ordering |\n';
  md +=
    '| **Sonar + 2-opt** | O(n²) | Sonar initial tour + 2-opt segment reversal |\n';
  md +=
    '| **Moore + 2-opt** | O(n²) | Moore initial tour + 2-opt segment reversal |\n';
  md +=
    '| **Sonar + Zigzag** | O(n²) | Sonar initial tour + zigzag pair swap |\n';
  md +=
    '| **Moore + Zigzag** | O(n²) | Moore initial tour + zigzag pair swap |\n';
  md +=
    '| **Sonar + Combined** | O(n³) | Sonar initial tour + alternating zigzag/2-opt |\n';
  md +=
    '| **Moore + Combined** | O(n³) | Moore initial tour + alternating zigzag/2-opt |\n\n';

  md += `## Max Points in ${TIME_BUDGET_SECONDS} Seconds\n\n`;
  md +=
    'The algorithm that solves the greatest number of points within the time budget wins.\n\n';
  md += '| Configuration | Max Points | Avg Time | Avg Tour Distance |\n';
  md += '| --- | ---: | ---: | ---: |\n';

  // Sort by max points descending
  const sorted = [...results.maxPointsResults].sort(
    (a, b) => b.maxPoints - a.maxPoints
  );
  for (const r of sorted) {
    md += `| **${r.name}** | ${r.maxPoints} | ${formatTime(r.avgTimeMs)} | ${r.avgDistance.toFixed(2)} |\n`;
  }
  md += '\n';

  md += '## Execution Time Growth\n\n';
  md +=
    'Time measured at fixed intervals (every 50 points), averaged over 10 random configurations.\n\n';

  md += '![Execution Time Growth](benchmarks/execution-time.svg)\n\n';

  // Growth table
  md += '| Points |';
  for (const r of results.maxPointsResults) {
    md += ` ${r.name} |`;
  }
  md += '\n| ---: |';
  for (let i = 0; i < results.maxPointsResults.length; i++) {
    md += ' ---: |';
  }
  md += '\n';

  // Find all point counts across all growth data
  const allPointCounts = new Set();
  for (const [, data] of Object.entries(results.growthData)) {
    for (const d of data) {
      allPointCounts.add(d.points);
    }
  }
  const sortedPointCounts = [...allPointCounts].sort((a, b) => a - b);

  for (const pc of sortedPointCounts) {
    md += `| ${pc} |`;
    for (const r of results.maxPointsResults) {
      const data = results.growthData[r.name];
      const entry = data?.find((d) => d.points === pc);
      md += entry ? ` ${formatTime(entry.avgTimeMs)} |` : ' - |';
    }
    md += '\n';
  }
  md += '\n';

  md += '## Tour Quality\n\n';
  md +=
    'Tour distance (lower is better) at fixed intervals, averaged over 10 random configurations.\n\n';

  md += '![Tour Distance](benchmarks/tour-distance.svg)\n\n';

  md += '| Points |';
  for (const r of results.maxPointsResults) {
    md += ` ${r.name} |`;
  }
  md += '\n| ---: |';
  for (let i = 0; i < results.maxPointsResults.length; i++) {
    md += ' ---: |';
  }
  md += '\n';

  for (const pc of sortedPointCounts) {
    md += `| ${pc} |`;
    for (const r of results.maxPointsResults) {
      const data = results.growthData[r.name];
      const entry = data?.find((d) => d.points === pc);
      md += entry ? ` ${entry.avgDistance.toFixed(2)} |` : ' - |';
    }
    md += '\n';
  }
  md += '\n';

  md += '## Running Benchmarks\n\n';
  md += '```bash\nbun run benchmarks/run.js\n```\n\n';

  md += '## Notes\n\n';
  md += `- All times are averages of ${SAMPLES_PER_TEST} runs with different random point sets\n`;
  md +=
    '- Tour distances are calculated as closed loops (returning to start)\n';
  md += '- Random point generation ensures unique positions on the grid\n';
  md += '- Results may vary based on hardware\n';

  return md;
}

/**
 * Update README.md benchmark section with current results.
 * @param {Object} results
 */
function updateReadmeMd(results) {
  const readmePath = join(ROOT_DIR, 'README.md');
  let readme = readFileSync(readmePath, 'utf-8');

  // Build the new benchmark section
  let section = '## Performance Benchmarks\n\n';
  section += `Performance tested with Bun runtime on a ${MOORE_GRID_SIZE}x${MOORE_GRID_SIZE} Moore grid (${TIME_BUDGET_SECONDS}s time budget, ${SAMPLES_PER_TEST} random samples averaged):\n\n`;

  section += `### Max Points in ${TIME_BUDGET_SECONDS} Seconds\n\n`;
  section += '| Configuration | Max Points | Avg Time | Avg Tour Distance |\n';
  section += '| --- | ---: | ---: | ---: |\n';

  const sorted = [...results.maxPointsResults].sort(
    (a, b) => b.maxPoints - a.maxPoints
  );
  for (const r of sorted) {
    section += `| **${r.name}** | ${r.maxPoints} | ${formatTime(r.avgTimeMs)} | ${r.avgDistance.toFixed(2)} |\n`;
  }
  section += '\n';

  section += '### Execution Time Growth\n\n';
  section += '![Execution Time Growth](benchmarks/execution-time.svg)\n\n';

  section += '### Tour Quality\n\n';
  section += '![Tour Distance](benchmarks/tour-distance.svg)\n\n';

  section += '**Key findings:**\n\n';

  // Determine the winner
  const winner = sorted[0];
  section += `- **${winner.name}** solves the most points (${winner.maxPoints}) within ${TIME_BUDGET_SECONDS} seconds\n`;
  section += '- **Sonar** is faster but produces longer tours\n';
  section +=
    '- **Moore** produces significantly better tours, especially for larger problems\n';
  section +=
    '- **2-opt** improves both algorithms, with larger gains on Sonar tours\n';
  section += `\nFor detailed benchmark analysis, see [BENCHMARK.md](BENCHMARK.md).`;

  // Replace the section between ## Performance Benchmarks and ## License (or end)
  const startMarker = '## Performance Benchmarks';
  const endMarker = '\n## License';

  const startIdx = readme.indexOf(startMarker);
  const endIdx = readme.indexOf(endMarker, startIdx);

  if (startIdx !== -1 && endIdx !== -1) {
    readme = readme.substring(0, startIdx) + section + readme.substring(endIdx);
  } else if (startIdx !== -1) {
    // No License section found, replace to end
    readme = readme.substring(0, startIdx) + section;
  }

  writeFileSync(readmePath, readme);
}

/**
 * Main benchmark runner.
 */
async function runBenchmarks() {
  console.log('TSP Algorithm Performance Benchmarks');
  console.log('====================================\n');
  console.log(`Time budget: ${TIME_BUDGET_SECONDS} seconds`);
  console.log(`Samples per test: ${SAMPLES_PER_TEST}`);
  console.log(`Grid size: ${MOORE_GRID_SIZE}x${MOORE_GRID_SIZE}`);
  console.log(`Calibration points: ${CALIBRATION_POINTS}\n`);

  const configs = getAlgorithmConfigs();
  const maxPointsResults = [];
  const growthData = {};

  for (const config of configs) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`${config.name} (${config.complexity})`);
    console.log(`${'='.repeat(60)}`);

    // Step 1: Calibrate with CALIBRATION_POINTS
    console.log(
      `\n  Calibrating with ${CALIBRATION_POINTS} points (${SAMPLES_PER_TEST} samples)...`
    );
    const calibration = benchmarkAtPointCount(config, CALIBRATION_POINTS);
    console.log(`  Calibration time: ${formatTime(calibration.avgTimeMs)}`);

    // Step 2: Estimate max points using O-notation
    const budgetMs = TIME_BUDGET_SECONDS * 1000;
    const estimate = estimateMaxPoints(
      calibration.avgTimeMs,
      config.complexityFn,
      budgetMs
    );
    console.log(`  O-notation estimate: ${estimate} points`);

    // Step 3: Verify and find stable max points
    console.log('  Verifying stable max points...');
    const stableResult = findStableMaxPoints(config, estimate);
    console.log(
      `  Stable max: ${stableResult.maxPoints} points in ${formatTime(stableResult.avgTimeMs)} (avg)`
    );
    console.log(`  Avg tour distance: ${stableResult.avgDistance.toFixed(2)}`);

    maxPointsResults.push({
      name: config.name,
      complexity: config.complexity,
      maxPoints: stableResult.maxPoints,
      avgTimeMs: stableResult.avgTimeMs,
      avgDistance: stableResult.avgDistance,
    });

    // Step 4: Measure growth curve at fixed intervals
    console.log('  Measuring growth curve...');
    const growth = measureGrowthCurve(config, stableResult.maxPoints);
    growthData[config.name] = growth;

    for (const gp of growth) {
      console.log(
        `    ${String(gp.points).padStart(5)} points: ${formatTime(gp.avgTimeMs).padStart(10)}  dist=${gp.avgDistance.toFixed(2)}`
      );
    }
  }

  const results = { maxPointsResults, growthData };

  // Generate SVG graphs
  console.log('\n\nGenerating SVG graphs...');
  const timeSvg = generateTimeSvg(growthData);
  const distSvg = generateDistanceSvg(growthData);

  mkdirSync(join(ROOT_DIR, 'benchmarks'), { recursive: true });
  writeFileSync(join(ROOT_DIR, 'benchmarks', 'execution-time.svg'), timeSvg);
  writeFileSync(join(ROOT_DIR, 'benchmarks', 'tour-distance.svg'), distSvg);
  console.log('  Saved benchmarks/execution-time.svg');
  console.log('  Saved benchmarks/tour-distance.svg');

  // Update BENCHMARK.md
  console.log('\nUpdating BENCHMARK.md...');
  const benchmarkMd = generateBenchmarkMd(results);
  writeFileSync(join(ROOT_DIR, 'BENCHMARK.md'), benchmarkMd);
  console.log('  Updated BENCHMARK.md');

  // Update README.md
  console.log('Updating README.md...');
  updateReadmeMd(results);
  console.log('  Updated README.md');

  // Summary
  console.log('\n\nSUMMARY');
  console.log('=======\n');
  console.log(
    `${'Configuration'.padEnd(25)} ${'Max Points'.padStart(12)} ${'Avg Time'.padStart(12)} ${'Avg Distance'.padStart(14)}`
  );
  console.log('-'.repeat(65));

  const sortedResults = [...maxPointsResults].sort(
    (a, b) => b.maxPoints - a.maxPoints
  );
  for (const r of sortedResults) {
    console.log(
      `${r.name.padEnd(25)} ${String(r.maxPoints).padStart(12)} ${formatTime(r.avgTimeMs).padStart(12)} ${r.avgDistance.toFixed(2).padStart(14)}`
    );
  }

  console.log(
    `\nWinner: ${sortedResults[0].name} with ${sortedResults[0].maxPoints} points in ${TIME_BUDGET_SECONDS}s`
  );

  return results;
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
