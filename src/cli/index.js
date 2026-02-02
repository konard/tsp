#!/usr/bin/env node

/* global performance */

/**
 * TSP Algorithms CLI
 *
 * A globally installable command-line interface for running TSP algorithms.
 * Uses atomic algorithms (all-at-once computation) for benchmark-like performance.
 *
 * Supports:
 * - Algorithm selection: sonar, moore, peano, brute-force
 * - Optimization: 2-opt, 3-opt, k-opt, lin-kernighan, lkh, zigzag, combined, none
 * - Random point generation with configurable grid size and point count
 * - Manual point input via links notation (coordinate pairs as links)
 * - Verification via lower-bound (1-tree) analysis
 *
 * @example
 * # Random points with sonar algorithm
 * tsp-algorithms --algorithm sonar --num-points 20 --grid-size 32
 *
 * # Moore curve with 2-opt optimization
 * tsp-algorithms --algorithm moore --optimization 2-opt --num-points 50
 *
 * # Lin-Kernighan-Helsgaun optimization
 * tsp-algorithms --algorithm moore --optimization lkh --num-points 50
 *
 * # Manual points via links notation
 * tsp-algorithms --algorithm sonar --points "0 0 5 5 10 2 3 8 7 7"
 *
 * # Brute-force with verification
 * tsp-algorithms --algorithm brute-force --num-points 8 --verify
 */

import { makeConfig } from 'lino-arguments';
import {
  atomic,
  verification,
  calculateTotalDistance,
  generateRandomPoints,
  calculateMooreGridSize,
  calculatePeanoGridSize,
  VALID_GRID_SIZES,
  VALID_PEANO_GRID_SIZES,
} from '../lib/index.js';

const {
  sonarSolution,
  mooreSolution,
  peanoSolution,
  bruteForceSolution,
  twoOpt,
  threeOpt,
  kOpt,
  zigzagOpt,
  combinedOpt,
  linKernighan,
  lkHelsgaun,
  BRUTE_FORCE_MAX_POINTS,
} = atomic;

const { verifyOptimality } = verification;

/**
 * Parse points from a flat coordinate string.
 * Coordinates are provided as space-separated pairs: "x1 y1 x2 y2 ..."
 *
 * @param {string} pointsStr - Space-separated coordinate pairs
 * @returns {Array<{x: number, y: number, id: number}>} Array of point objects
 */
const parsePoints = (pointsStr) => {
  const values = pointsStr.trim().split(/\s+/).map(Number);

  if (values.length < 4 || values.length % 2 !== 0) {
    throw new Error(
      'Points must be space-separated coordinate pairs (at least 2 points): "x1 y1 x2 y2 ..."'
    );
  }

  if (values.some((v) => isNaN(v))) {
    throw new Error('All coordinates must be valid numbers');
  }

  const points = [];
  for (let i = 0; i < values.length; i += 2) {
    points.push({ x: values[i], y: values[i + 1], id: points.length });
  }
  return points;
};

/**
 * Format a tour for display.
 *
 * @param {number[]} tour - Array of point indices
 * @param {Array<{x: number, y: number}>} points - Array of point coordinates
 * @returns {string} Formatted tour string
 */
const formatTour = (tour, points) => {
  const coordStr = tour
    .map((idx) => `(${points[idx].x}, ${points[idx].y})`)
    .join(' → ');
  return `${tour.join(' → ')}\n  Coordinates: ${coordStr}`;
};

/**
 * Run the selected algorithm on the given points.
 *
 * @param {string} algorithm - Algorithm name
 * @param {Array<{x: number, y: number, id: number}>} points - Points
 * @param {number} gridSize - Grid size (for Moore algorithm)
 * @returns {{tour: number[], label: string}} Result
 */
const runAlgorithm = (algorithm, points, gridSize) => {
  switch (algorithm) {
    case 'sonar': {
      const result = sonarSolution(points);
      return { tour: result.tour, label: 'Sonar (Radial Sweep)' };
    }
    case 'moore': {
      const mooreGrid = calculateMooreGridSize(gridSize);
      const result = mooreSolution(points, mooreGrid);
      return { tour: result.tour, label: `Moore Curve (grid: ${mooreGrid})` };
    }
    case 'peano': {
      const peanoGrid = calculatePeanoGridSize(gridSize);
      const result = peanoSolution(points, peanoGrid);
      return {
        tour: result.tour,
        label: `Peano Curve (grid: ${peanoGrid})`,
      };
    }
    case 'brute-force': {
      if (points.length > BRUTE_FORCE_MAX_POINTS) {
        throw new Error(
          `Brute-force is limited to ${BRUTE_FORCE_MAX_POINTS} points (got ${points.length})`
        );
      }
      const result = bruteForceSolution(points);
      return {
        tour: result.tour,
        label: `Brute-Force (optimal distance: ${result.distance.toFixed(2)})`,
      };
    }
    default:
      throw new Error(
        `Unknown algorithm: ${algorithm}. Choose from: sonar, moore, peano, brute-force`
      );
  }
};

/**
 * Apply the selected optimization to a tour.
 *
 * @param {string} optimization - Optimization name
 * @param {Array<{x: number, y: number}>} points - Points
 * @param {number[]} tour - Initial tour
 * @returns {{tour: number[], improvement: number, label: string}} Optimized result
 */
const runOptimization = (optimization, points, tour) => {
  switch (optimization) {
    case 'none':
      return { tour, improvement: 0, label: 'None' };
    case '2-opt': {
      const result = twoOpt(points, tour);
      return { ...result, label: '2-opt' };
    }
    case '3-opt': {
      const result = threeOpt(points, tour);
      return { ...result, label: '3-opt' };
    }
    case 'k-opt': {
      const result = kOpt(points, tour);
      return { ...result, label: 'k-opt' };
    }
    case 'zigzag': {
      const result = zigzagOpt(points, tour);
      return { ...result, label: 'Zigzag' };
    }
    case 'combined': {
      const result = combinedOpt(points, tour);
      return { ...result, label: 'Combined (zigzag + 2-opt)' };
    }
    case 'lin-kernighan': {
      const result = linKernighan(points, tour);
      return { ...result, label: 'Lin-Kernighan' };
    }
    case 'lkh': {
      const result = lkHelsgaun(points, tour);
      return { ...result, label: 'Lin-Kernighan-Helsgaun' };
    }
    default:
      throw new Error(
        `Unknown optimization: ${optimization}. Choose from: none, 2-opt, 3-opt, k-opt, lin-kernighan, lkh, zigzag, combined`
      );
  }
};

/**
 * Main CLI entry point.
 * Parses arguments, runs the algorithm, and prints results.
 */
// eslint-disable-next-line max-lines-per-function
export const main = () => {
  const config = makeConfig({
    yargs: ({ yargs, getenv }) =>
      yargs
        .usage('Usage: $0 [options]')
        .option('algorithm', {
          alias: 'a',
          type: 'string',
          describe: 'TSP algorithm to use',
          choices: ['sonar', 'moore', 'peano', 'brute-force'],
          default: getenv('TSP_ALGORITHM', 'sonar'),
        })
        .option('optimization', {
          alias: 'o',
          type: 'string',
          describe: 'Optimization to apply after initial solution',
          choices: [
            'none',
            '2-opt',
            '3-opt',
            'k-opt',
            'lin-kernighan',
            'lkh',
            'zigzag',
            'combined',
          ],
          default: getenv('TSP_OPTIMIZATION', 'none'),
        })
        .option('num-points', {
          alias: 'n',
          type: 'number',
          describe: 'Number of random points to generate',
          default: getenv('TSP_NUM_POINTS', 10),
        })
        .option('grid-size', {
          alias: 'g',
          type: 'number',
          describe: `Grid size for point generation (Moore: ${VALID_GRID_SIZES.join(', ')}; Peano: ${VALID_PEANO_GRID_SIZES.join(', ')})`,
          default: getenv('TSP_GRID_SIZE', 16),
        })
        .option('points', {
          alias: 'p',
          type: 'string',
          describe:
            'Manual points as space-separated coordinate pairs: "x1 y1 x2 y2 ..."',
        })
        .option('verify', {
          alias: 'v',
          type: 'boolean',
          describe: 'Run lower-bound verification on the result',
          default: false,
        })
        .option('json', {
          alias: 'j',
          type: 'boolean',
          describe: 'Output results as JSON',
          default: false,
        })
        .example(
          '$0 --algorithm sonar --num-points 20',
          'Sonar with 20 random points'
        )
        .example(
          '$0 -a moore -o 2-opt -n 50 -g 32',
          'Moore + 2-opt, 50 points on 32x32 grid'
        )
        .example(
          '$0 -a moore -o lkh -n 50',
          'Moore + LKH optimization, 50 points'
        )
        .example(
          '$0 -a peano -o 2-opt -n 50 -g 27',
          'Peano + 2-opt, 50 points on 27x27 grid'
        )
        .example(
          '$0 -a brute-force --points "0 0 5 5 10 2 3 8"',
          'Brute-force with manual points'
        )
        .example(
          '$0 -a sonar -o combined -n 100 --verify',
          'Sonar + combined + verify'
        )
        .epilog(
          'TSP Algorithms CLI — https://github.com/konard/tsp\n' +
            'Runs atomic (all-at-once) algorithms for benchmark-like performance.'
        ),
  });

  const {
    algorithm,
    optimization,
    numPoints,
    gridSize,
    points: pointsStr,
    verify,
    json: jsonOutput,
  } = config;

  try {
    // Generate or parse points
    let points;
    if (pointsStr) {
      points = parsePoints(pointsStr);
    } else {
      const mooreGrid = calculateMooreGridSize(gridSize);
      points = generateRandomPoints(mooreGrid, numPoints);
    }

    // Measure total execution time
    const startTime = performance.now();

    // Run algorithm
    const algoResult = runAlgorithm(algorithm, points, gridSize);

    // Run optimization
    const optResult = runOptimization(optimization, points, algoResult.tour);

    // Calculate distances
    const initialDistance = calculateTotalDistance(algoResult.tour, points);
    const finalDistance = calculateTotalDistance(optResult.tour, points);

    const endTime = performance.now();
    const timeMs = endTime - startTime;

    // Verification
    let verificationResult = null;
    if (verify) {
      verificationResult = verifyOptimality(finalDistance, points);
    }

    if (jsonOutput) {
      const output = {
        algorithm: algoResult.label,
        optimization: optResult.label,
        points: points.length,
        gridSize,
        tour: optResult.tour,
        initialDistance,
        finalDistance,
        improvement: optResult.improvement,
        timeMs: Math.round(timeMs * 100) / 100,
      };
      if (verificationResult) {
        output.verification = verificationResult;
      }
      console.log(JSON.stringify(output, null, 2));
    } else {
      console.log('TSP Algorithms CLI');
      console.log('==================\n');
      console.log(`Algorithm:    ${algoResult.label}`);
      console.log(`Optimization: ${optResult.label}`);
      console.log(`Points:       ${points.length}`);
      console.log(`Grid size:    ${gridSize}\n`);

      console.log(`Tour: ${formatTour(optResult.tour, points)}\n`);

      console.log(`Initial distance: ${initialDistance.toFixed(2)}`);
      if (optimization !== 'none') {
        console.log(`Final distance:   ${finalDistance.toFixed(2)}`);
        console.log(`Improvement:      ${optResult.improvement.toFixed(2)}`);
      }
      console.log(`Time:             ${timeMs.toFixed(2)}ms`);

      if (verificationResult) {
        console.log('\nVerification (1-tree lower bound):');
        console.log(
          `  Lower bound:  ${verificationResult.lowerBound.toFixed(2)}`
        );
        console.log(
          `  Gap:          ${verificationResult.gapPercent.toFixed(2)}%`
        );
        console.log(
          `  Optimal:      ${verificationResult.isOptimal ? 'YES ✓' : 'Not proven'}`
        );
      }
    }
  } catch (error) {
    if (jsonOutput) {
      console.error(JSON.stringify({ error: error.message }));
    } else {
      console.error(`Error: ${error.message}`);
    }
    process.exitCode = 1;
  }
};

main();
