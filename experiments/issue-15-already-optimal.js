/**
 * Experiment: Reproduce issue #15 - optimization fails on already-optimal tours
 *
 * When a tour is already optimal (e.g., 3 points forming a triangle),
 * the optimization algorithms return empty steps, causing the UI to
 * display 0 distances and lose the path visualization.
 */

import { sonarAlgorithmSteps } from '../src/lib/algorithms/progressive/solution/sonar.js';
import { mooreAlgorithmSteps } from '../src/lib/algorithms/progressive/solution/moore.js';
import { zigzagOptSteps } from '../src/lib/algorithms/progressive/optimization/zigzag-opt.js';
import { twoOptSteps } from '../src/lib/algorithms/progressive/optimization/two-opt.js';
import { calculateTotalDistance } from '../src/lib/algorithms/utils.js';

// Reproduce: 3 points (the scenario from the issue)
const points = [
  { x: 0, y: 0, id: 0 },
  { x: 5, y: 0, id: 1 },
  { x: 2, y: 4, id: 2 },
];

const mooreGridSize = 16;

console.log('=== Issue #15 Reproduction: Already-optimal tour ===\n');
console.log('Points:', JSON.stringify(points));

// Step 1: Run solution algorithms
const sonarSteps = sonarAlgorithmSteps(points);
const mooreSteps = mooreAlgorithmSteps(points, mooreGridSize);

const sonarTour = sonarSteps[sonarSteps.length - 1]?.tour || [];
const mooreTour = mooreSteps[mooreSteps.length - 1]?.tour || [];

console.log('\nSonar final tour:', sonarTour);
console.log(
  'Sonar distance:',
  calculateTotalDistance(sonarTour, points).toFixed(2)
);
console.log('Moore final tour:', mooreTour);
console.log(
  'Moore distance:',
  calculateTotalDistance(mooreTour, points).toFixed(2)
);

// Step 2: Run optimization (this is where the bug occurs)
const sonarOpt = zigzagOptSteps(points, sonarTour);
const mooreOpt = twoOptSteps(points, mooreTour);

console.log('\n--- Optimization Results ---');
console.log('Sonar optimization steps:', sonarOpt.length);
console.log('Moore optimization steps:', mooreOpt.length);

if (sonarOpt.length === 0) {
  console.log(
    '\n⚠️  BUG: Sonar optimization returned EMPTY steps array!'
  );
  console.log(
    '   In the UI, this causes showOptimization=true with empty sonarOptSteps.'
  );
  console.log(
    '   getSonarStep() returns undefined → distance shows 0, path disappears.'
  );
}

if (mooreOpt.length === 0) {
  console.log(
    '\n⚠️  BUG: Moore optimization returned EMPTY steps array!'
  );
  console.log(
    '   In the UI, this causes showOptimization=true with empty mooreOptSteps.'
  );
  console.log(
    '   getMooreStep() returns undefined → distance shows 0, path disappears.'
  );
}

// Step 3: Verify the fix approach
console.log('\n--- Fix Verification ---');
const fixedSonarOpt =
  sonarOpt.length === 0
    ? [
        {
          type: 'optimize',
          tour: [...sonarTour],
          improvement: 0,
          description: 'Tour is already optimal — no improvements found',
        },
      ]
    : sonarOpt;

const fixedMooreOpt =
  mooreOpt.length === 0
    ? [
        {
          type: 'optimize',
          tour: [...mooreTour],
          improvement: 0,
          description: 'Tour is already optimal — no improvements found',
        },
      ]
    : mooreOpt;

console.log('Fixed sonar opt steps:', fixedSonarOpt.length);
console.log('Fixed moore opt steps:', fixedMooreOpt.length);
console.log('Fixed sonar opt tour:', fixedSonarOpt[0]?.tour);
console.log(
  'Fixed sonar opt distance:',
  fixedSonarOpt[0]?.tour
    ? calculateTotalDistance(fixedSonarOpt[0].tour, points).toFixed(2)
    : 'N/A'
);
console.log('Fixed moore opt tour:', fixedMooreOpt[0]?.tour);
console.log(
  'Fixed moore opt distance:',
  fixedMooreOpt[0]?.tour
    ? calculateTotalDistance(fixedMooreOpt[0].tour, points).toFixed(2)
    : 'N/A'
);
console.log('\n✅ Fix preserves the tour and distance when already optimal.');

// Also test with 4+ points that ARE already optimal (e.g., square in optimal order)
console.log('\n\n=== Additional Test: 4 points in optimal square order ===\n');
const squarePoints = [
  { x: 0, y: 0, id: 0 },
  { x: 10, y: 0, id: 1 },
  { x: 10, y: 10, id: 2 },
  { x: 0, y: 10, id: 3 },
];

const optimalTour = [0, 1, 2, 3]; // Already optimal square
const squareOpt2opt = twoOptSteps(squarePoints, optimalTour);
const squareOptZigzag = zigzagOptSteps(squarePoints, optimalTour);

console.log('Square points (optimal order):', JSON.stringify(squarePoints));
console.log('Tour:', optimalTour);
console.log(
  'Distance:',
  calculateTotalDistance(optimalTour, squarePoints).toFixed(2)
);
console.log('2-opt optimization steps:', squareOpt2opt.length);
console.log('Zigzag optimization steps:', squareOptZigzag.length);

if (squareOpt2opt.length === 0 && squareOptZigzag.length === 0) {
  console.log(
    '\n✅ Confirmed: Optimal square tour also returns empty steps (expected).'
  );
  console.log(
    '   The fix in App.jsx handles this by creating a fallback step.'
  );
}
